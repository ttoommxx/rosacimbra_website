// micro functions

function $(name) {
	return document.getElementById(name);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// cookies and global variables

async function GitHubDB(user, repo, root_db) {
	const db_url = `https://api.github.com/repos/${user}/${repo}/contents/${
		root_db === undefined ? "" : root_db + "/"
	}`;
	const lambda_url = `https://73p5suv6mmzz2ksflzrxtipdpi0iqygf.lambda-url.eu-north-1.on.aws/?url=${db_url}&token_type=GITHUB`;
	const folder = await fetch(db_url)
		.then((response) => {
			if (response.ok) {
				console.log("Using local IP");
				return response;
			} else {
				throw new Error("Local IP address has reached its limit, using lambda");
			}
		})
		.catch(async (error) => {
			console.log(error);
			return await fetch(lambda_url).then((response) => {
				if (response.ok) {
					return response;
				} else {
					throw new Error("Access using hidden key failed");
				}
			});
		})
		.then((response) => response.json());

	// generate the db object to return
	const DB = new (function () {
		this._map = new Map();

		this.read = function (path) {
			let temp_map = this._map;
			for (const p of path.split("/")) {
				temp_map = temp_map.get(p);
			}
			return temp_map;
		};

		// config is a dictionary with {path: string, type: string, sort: string}
		this.ls = function (config) {
			let temp_map = this._map;
			for (const p of config.path.split("/")) {
				temp_map = temp_map.get(p);
			}
			let array = Array.from(temp_map).map(([key, val]) => ({
				name: key,
				type: typeof val == "string" ? "file" : "folder",
				download_url: typeof val == "string" ? val : undefined,
			}));
			array = Array.from(array.filter((elem) => elem.name));
			if (config.type) {
				array = Array.from(array.filter((elem) => elem.type == config.type));
			}
			if (config.sort) {
				let sort_function = () => {
					throw new Error(`sorting type ${config.sort} not accepted`);
				};
				if (config.sort == "name") {
					sort_function = (a, b) => a.name.localeCompare(b.name);
				} else if (config.sort == "type") {
					sort_funciton = (a, b) => {
						if (a.type != b.type) {
							return a.type.localeCompare(b.type);
						}
						let [name_a, format_a] = a.name.split(".");
						let [name_b, format_b] = b.name.split(".");
						format_a = format_a.toLowerCase();
						format_b = format_b.toLowerCase();
						if (format_a != format_b) {
							return format_a.localeCompare(format_b);
						}
						return name_a.localeCompare(name_b);
					};
				}
				array.sort(sort_function);
			}
			return array;
		};

		this.exist = function (path) {
			let temp_map = this._map;
			for (const folder of path.split("/")) {
				if (!(temp_map instanceof Map) || !temp_map.has(folder)) {
					return false;
				}
				temp_map = temp_map.get(folder);
			}
			return true;
		};
	})();

	for (const entry of folder) {
		const full_path = entry.name.split("__");

		let temp_map = DB._map;
		for (const path of full_path.slice(0, -1)) {
			if (!temp_map.has(path)) {
				temp_map.set(path, new Map());
			}
			temp_map = temp_map.get(path);
		}
		temp_map.set(full_path.at(-1), entry.download_url);
	}

	return DB;
}

function cookies_util() {
	this._map = new Map();
	if (document.cookie != "") {
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const [key, val] = cookie.split("=");
			this._map.set(key.trimStart(), val);
		}
	}

	this.get = function (name) {
		return this._map.get(name) ?? "";
	};

	this.set = function (name, value) {
		this._map.set(name, value);
		document.cookie = `${name}=${value}`;
	};
}

function cart_item() {
	this._map = new Map();

	this.update_counter_div = async function (elem_div) {
		const counter = elem_div.firstElementChild;
		const num = this._map.get(elem_div);
		if (num === undefined) {
			counter.style.visibility = "hidden";
		} else {
			counter.innerHTML = num;
			counter.style.visibility = "visible";
		}
	};

	this.update_cart_menu = async function () {
		const total_count = Array.from(this._map).reduce(
			(acc, [key, val]) => acc + val,
			0
		);
		const cart_div = $("cart_menu");
		const right = cart_div.style.right || "-100%";

		if (right == "4px" && total_count == 0) {
			cart_div.style.right = "-100%";
		} else if (right == "-100%" && total_count > 0) {
			cart_div.style.right = "4px";
		}
		$("counter_menu").innerHTML = total_count;
	};

	this.update_cart_div = async function () {
		const cart_div = $("cart_list");
		cart_div.innerHTML = "";
		for (const item of this._map.keys()) {
			cart_div.appendChild(item.cloneNode(true));
		}
	};

	this.reg = function (elem, num) {
		const elem_div = elem.parentElement.firstElementChild;
		this._map.set(elem_div, (this._map.get(elem_div) ?? 0) + num);
		if (this._map.get(elem_div) <= 0) {
			this._map.delete(elem_div);
		}

		this.update_counter_div(elem_div);
		this.update_cart_menu();
		// this.update_cookies();
	};

	this.send_order = function () {
		const user_name = $("name_user").value;
		if (user_name) {
			const array_text = ["<<<<<"];
			for (const [key, val] of this._map) {
				array_text.push(`- ${val} x ${key.getElementsByTagName("img")[0].alt}`);
			}
			array_text.push(">>>>>%0D%0A");
			const message = array_text.join("%0D%0A");
			window.open(
				`mailto:RosaCimbra@gmail.com?bcc=ttoommxx+RC@gmail.com&subject=RosaCimbra:%20Equiry%20from%20${user_name}&body=${message}`
			);
			this.flush();
		} else {
			$("name_user").style.backgroundColor = "red";
			setTimeout(
				() => ($("name_user").style.backgroundColor = "transparent"),
				400
			);
		}
	};

	this.flush = function () {
		open_page("about");
		setTimeout(() => {
			for (const [key, val] of this._map) {
				this._map.delete(key);
				this.update_counter_div(key);
			}
			$("name_user").value = "";
			this.update_cart_menu();
			this.update_cart_div();
		}, 300);
	};
}

const ENV = {
	cookies: null,
	cart: null,
	db: null,
};

generate_ENV = async function () {
	ENV.cookies = new cookies_util();
	ENV.cart = new cart_item();
	ENV.db = await GitHubDB("ttoommxxDB", "rosacimbra_website", "db");
};

// window attributes

window.addEventListener("popstate", () => {
	const page = window.location.hash.substring(1); // Remove the "#" symbol
	open_page(page, "replace");
});

window.onload = async function () {
	// generate env_function
	try {
		await generate_ENV();
	} catch (error) {
		console.log(error);
		console.log("cannot connect to github db");
		$("container-preview").onclick = "";
		const img = $("container-preview").getElementsByTagName("img")[0];
		img.src = "img/duck_butt.gif";
		img.alt = "duck butt";
		$("container-preview").getElementsByTagName("p")[0].innerHTML =
			"A duck is blocking the road,<br>try again later!";
		return;
	}

	// load of media
	await Promise.all([
		download_texts(),
		download_slideshow(),
		download_mydolls(),
		download_sale_items(),
	]);

	// load previous state
	toggle_menu(ENV.cookies.get("left_bar") || "off");

	let page = ENV.cookies.get("page");
	if (page == "" || page == "cart") {
		page = "about";
		ENV.cookies.set("page", page);
	}
	open_page(page);
};

// functions

async function open_page(page, call_type) {
	if (page == "cart") {
		ENV.cart.update_cart_div();
	}
	if (call_type == "replace") {
		history.replaceState({ page: page }, page, `#${page}`);
	} else {
		history.pushState({ page: page }, page, `#${page}`);
	}

	let page_element = $("container-main");
	page_element.style.opacity = "0";
	page_element.style.left = "-100%";

	await sleep(650);

	toggle_menu("off");

	$(ENV.cookies.get("page")).style.display = "none";
	ENV.cookies.set("page", page);
	$(page).style.display = "flex";
	page_element.style.opacity = "1";
	page_element.style.left = "0";

	destroy_preview();
}

async function download_slideshow() {
	const list_slideshow = ENV.db.ls({
		path: "slideshow",
		type: "file",
	});

	if (list_slideshow.length == 0) {
		console.log("Slideshow is empty!");
		return;
	}

	for (const entry of list_slideshow.filter((elem) =>
		elem.name.endsWith(".jpg")
	)) {
		const new_image = document.createElement("img");
		new_image.classList.add("slideshow-image");
		new_image.src = entry.download_url;
		new_image.alt = entry.name.split(".")[0];
		$("slideshow").appendChild(new_image);
	}

	// calculate real width
	const temp_clone = $("slideshow").cloneNode(true);
	temp_clone.style.visibility = "hidden";
	temp_clone.style.position = "absolute";
	document.body.appendChild(temp_clone);
	let offset = 0;
	// ensure the browser has finished rendering
	while (offset == 0) {
		await sleep(100);
		offset = temp_clone.offsetWidth;
	}
	document.body.removeChild(temp_clone);
	$("slideshow").style.animation = `move_linear ${
		(window.innerHeight * offset) / 25000
	}s linear infinite`;

	const style = document.createElement("style");
	style.textContent = `
		@keyframes move_linear {
			0%, 100% {
				transform: translateX(0);
			}
			50% {
				transform: translateX(${-offset - 10 * $("slideshow").childElementCount}px);
			}
	`;
	document.head.appendChild(style);
}

async function download_mydolls() {
	const list_mydolls = ENV.db.ls({
		path: "mydolls",
		type: "file",
	});
	for (const entry of list_mydolls) {
		[entry._name, entry._extension] = entry.name.split(".");
	}

	const text_map = new Map();
	for (const entry of list_mydolls.filter((elem) => elem._extension == "txt")) {
		await fetch(entry.download_url)
			.then((data) => data.text())
			.then((text) => text_map.set(entry._name, text));
	}

	for (const entry of list_mydolls.filter((elem) => elem._extension == "jpg")) {
		const doll_div = document.createElement("div");
		doll_div.classList.add("dolls_img");
		doll_div.innerHTML = `
            <img src="${entry.download_url}" alt="${entry._name}">
            <pre>${text_map.get(entry._name)}</pre>
        `;
		$("mydolls").appendChild(doll_div);
	}
}

async function download_sale_items() {
	for (const section of ["clothes", "accessories"].filter((section) =>
		ENV.db.exist(section)
	)) {
		// select section
		for (const subsection of ENV.db
			.ls({ path: section, type: "folder" })
			.map((folder) => folder.name)) {
			try {
				[src_stock1, src_stock2, src_stock3] = ENV.db.ls({
					path: `${section}/${subsection}/stock`,
					type: "file",
				});
				const section_element = document.createElement("div");
				section_element.innerHTML = `
				<input id="${section}-${subsection}" class="toggle" type="checkbox" />
				<label for="${section}-${subsection}" class="sale-container clickable">
					<span class="label-name">${subsection}</span>
					<span class="sale-thumbnails">
						<img src="${src_stock1.download_url}" alt="${src_stock1.name.split(".")[0]}" />
						<img src="${src_stock2.download_url}" alt="${src_stock2.name.split(".")[0]}" />
						<img src="${src_stock3.download_url} "alt="${src_stock3.name.split(".")[0]}" />
					</span>
				</label>
			`;

				const metadata = {};
				for (const file of ENV.db.ls({
					path: `${section}/${subsection}/onsale`,
					type: "file",
				})) {
					const key_name = file.name.split(".")[0];
					if (!(key_name in metadata)) {
						metadata[key_name] = {
							text: "",
							price: "?",
							soldout: false,
							img_url: "",
						};
					}
					// create dictionary if does not exist
					if (file.name.endsWith(".txt")) {
						let text_list = await fetch(file.download_url)
							.then((data) => data.text())
							.then((text) => text.trim().split("\n"));

						if (/\s*SOLD ?OUT\s*/.test(text_list[0])) {
							metadata[key_name].soldout = true;
							text_list = text_list.slice(1);
						}
						if (/\s*price\s*=.*/.test(text_list.at(-1))) {
							metadata[key_name].price = text_list
								.pop()
								.split("=")
								.at(-1)
								.trim();
						}
						metadata[key_name].text = text_list.join("\n");
					} else if (file.name.endsWith(".jpg")) {
						metadata[key_name].img_url = file.download_url;
					}
				}

				const sale_items_div = document.createElement("div");
				sale_items_div.classList.add("sale-items");

				for (const [item_name, data] of Object.entries(metadata).sort(
					(a, b) => a[1].soldout - b[1].soldout
				)) {
					const sale_item = document.createElement("div");
					sale_item.classList.add("sale-item");
					sale_item.innerHTML = `
						<div class="sale-picture clickable">
							<div class="counter">0</div>
							<img
								src="${data.img_url}"
								alt="${item_name}"
								onclick="generate_preview(this)"
							/>
						</div>
						<p class="item-text">${data.text}</p>
						<p class="item-price">${data.price}</p>
						<img
							src="img/icon/add_cart.svg"
							alt="Plus"
							class="buy_icon clickable"
							onclick="ENV.cart.reg(this, 1)"
						/>
					`;
					if (data.soldout) {
						sale_item.classList.add("soldout-item");
						sale_item.getElementsByTagName("div")[0].innerHTML += `
							<img src="img/soldout.png" alt="soldout" class="soldout-image"/>
						`;
					}
					sale_items_div.appendChild(sale_item);
				}

				section_element.appendChild(sale_items_div);

				$(section).appendChild(section_element);
			} catch (error) {
				console.log("Error in constructing " + section + "/" + subsection);
			}
		}
	}

	// load previous cart
	// ENV.cart.read_cookies();
}

function toggle_menu(state) {
	const position = $("container-left").style.left || "0px";
	if (state == "on") {
		$("container-left").style.left = "0px";
	} else if (state == "off" && position == "0px") {
		$("container-left").style.left = "-100%";
	}

	ENV.cookies.set("left_bar", state);
}

function generate_preview(img_element) {
	$("container-menu").style.opacity = 0.2;
	$("container-right").style.opacity = 0.2;
	$("container-preview").style.visibility = "visible";
	if (img_element) {
		const img_preview = $("container-preview").getElementsByTagName("img")[0];
		const p_preview = $("container-preview").getElementsByTagName("p")[0];

		img_preview.src = img_element.src;
		img_preview.alt = img_element.alt;
		p_preview.innerHTML = img_element.alt;
		setTimeout(() => {
			img_preview.style.maxWidth = "90%";
			img_preview.style.maxHeight = "90%";
			p_preview.style.opacity = 1;
		}, 100);
	}
}

function destroy_preview() {
	const img_preview = $("container-preview").getElementsByTagName("img")[0];
	const p_preview = $("container-preview").getElementsByTagName("p")[0];

	img_preview.style.maxWidth = "0%";
	img_preview.style.maxHeight = "0%";
	p_preview.style.opacity = 0;
	$("container-left").style.opacity = 1;
	$("container-menu").style.opacity = 1;
	$("container-right").style.opacity = 1;

	setTimeout(() => {
		$("container-preview").style.visibility = "hidden";
	}, 250);
}

async function download_texts() {
	// can also parallelize via Promise.all

	const download_url_banner = ENV.db.read("texts/banner.txt");
	await fetch(download_url_banner, { cache: "no-cache" })
		.then((data) => data.text())
		.then((raw_text) =>
			raw_text
				.trim()
				.replaceAll(
					/@\{\s*(.*?)\s*\}\{\s*(.*?)\s*\}/g,
					'<a href="$2" target="_blank">$1</a>'
				)
		)
		.then(
			(clean_text) =>
				($("container-banner").getElementsByTagName("pre")[0].innerHTML =
					clean_text ?? "")
		);

	for (const language of ["en", "it"]) {
		const download_url_poem = ENV.db.read(`texts/poem_${language}.txt`);
		await fetch(download_url_poem, { cache: "no-cache" })
			.then((data) => data.text())
			.then((raw_text) => raw_text.trim())
			.then(
				(clean_text) => ($(`poem-${language}`).innerHTML = clean_text ?? "")
			);
	}

	const download_url_info = ENV.db.read("texts/info.txt");
	await fetch(download_url_info, { cache: "no-cache" })
		.then((data) => data.text())
		.then((raw_text) =>
			raw_text
				.trim()
				.replaceAll(
					/@\{\s*(.*?)\s*\}\{\s*(.*?)\s*\}/g,
					'<a href="$2" target="_blank">$1</a>'
				)
				.replaceAll(/\*_(.*?)_\*/g, "<b>$1</b>")
		)
		.then((clean_text) => ($("various-info").innerHTML = clean_text ?? ""));
}
