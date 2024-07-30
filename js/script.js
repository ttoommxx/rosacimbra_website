// micro functions

function $(name) {
	return document.getElementById(name);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// cookies and global variables

const GitHubDB = async function (user, repo, root_db) {
	const db_url = `https://api.github.com/repos/${user}/${repo}/contents/${
		root_db === undefined ? "" : root_db + "/"
	}`;
	const lambda_api =
		"https://73p5suv6mmzz2ksflzrxtipdpi0iqygf.lambda-url.eu-north-1.on.aws/";
	const lambda_url = `${lambda_api}?url=${db_url}&token_type=GITHUB`;
	const folder = await fetch(lambda_url, { cache: "no-cache" })
		.then((res) => res.json())
		.catch((err) => console.log(err));

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
			let array = temp_map.entries().map(([key, val]) => ({
				name: key,
				type: typeof val == "string" ? "file" : "folder",
				download_url: typeof val == "string" ? val : undefined,
			}));
			if (config.type) {
				array = array.filter((elem) => elem.type == config.type);
			}
			array = Array.from(array);
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
		const full_path = entry.name.split("..");

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
};

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

	// this.read_cookies = function () {
	// 	if (ENV.cookies.get("cart")) {
	// 		for (const [key, val] of JSON.parse(ENV.cookies.get("cart"))) {
	// 			// check if the item is still there
	// 			console.log("check in the DB:" + val);
	// 			if (true) {
	// 				this._map.set(key, val);
	// 			}
	// 		}
	// 	}

	// 	this.update_cart_menu();

	// 	const sale_items = document.getElementsByClassName("sale-item");
	// 	for (const sale_item of sale_items) {
	// 		const alt_text = sale_item.getElementsByTagName("img")[0].alt;
	// 		if (this._map.has(alt_text)) {
	// 			this.update_counter_div(sale_item);
	// 		}
	// 	}
	// };

	// this.update_cookies = function () {
	// TODO: the issue is that now I am saving everyting as an object, so need to find a way to save it properly
	// 	ENV.cookies.set("cart", JSON.stringify(Array.from(this._map.entries())));
	// };

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
		const total_count = this._map
			.entries()
			.reduce((acc, [key, val]) => acc + val, 0);
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
			const array_text = ["LIST ITEMS"];
			for (const [key, val] of this._map) {
				array_text.push(`- ${val} x ${key.getElementsByTagName("img")[0].alt}`);
			}
			array_text.push(
				"%0D%0A<<TYPE YOUR CUSTOM MESSAGE HERE>>%0D%0A<<SCRIVI QUA IL TUO MESSAGGIO PERSONALIZZATO>>%0D%0A%0D%0A%0D%0A"
			);
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
	await generate_ENV();

	// load of media
	await Promise.all([
		read_banner(),
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

function open_page(page, call_type) {
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
	setTimeout(() => {
		$(ENV.cookies.get("page")).style.display = "none";
		ENV.cookies.set("page", page);
		$(page).style.display = "flex";
		page_element.style.opacity = "1";
		page_element.style.left = "0";

		toggle_menu("off");
		destroy_preview();
	}, 650);
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
	console.log(offset);
	document.body.removeChild(temp_clone);
	$("slideshow").style.animation = `move_linear ${
		(window.innerHeight * offset) / (50 * window.innerWidth)
	}s linear infinite`;
	const root = document.documentElement;
	root.style.setProperty(
		"--keyframe-transform",
		`translateX(${-offset - 10 * $("slideshow").childElementCount}px)`
	);
	console.log(`translateX(${-offset}px)`);
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
		await fetch(entry.download_url, { cache: "no-cache" })
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
			// select subsection
			const Subsection = subsection[0].toUpperCase() + subsection.slice(1);

			[src_stock1, src_stock2, src_stock3] = ENV.db.ls({
				path: `${section}/${subsection}/stock`,
				type: "file",
			});
			const section_element = document.createElement("div");
			section_element.innerHTML = `
				<input id="${section}-${subsection}" class="toggle" type="checkbox" />
				<label for="${section}-${subsection}" class="sale-container clickable">
					<span class="label-name">${Subsection}</span>
					<span class="sale-thumbnails">
						<img src="${src_stock1.download_url}" alt="${src_stock1.name.split(".")[0]}" />
						<img src="${src_stock2.download_url}" alt="${src_stock2.name.split(".")[0]}" />
						<img src="${src_stock3.download_url} "alt="${src_stock3.name.split(".")[0]}" />
					</span>
				</label>
			`;

			const text_map = new Map();
			for (const file of ENV.db
				.ls({
					path: `${section}/${subsection}/onsale`,
					type: "file",
				})
				.filter((file) => file.name.endsWith(".txt"))) {
				const text = await fetch(file.download_url)
					.then((data) => data.text())
					.then((text) => text.trim());
				text_map.set(file.name.split(".")[0], text);
			}

			const sale_items_div = document.createElement("div");
			sale_items_div.classList.add("sale-items");

			for (const item of ENV.db
				.ls({
					path: `${section}/${subsection}/onsale`,
					type: "file",
				})
				.filter((file) => file.name.endsWith(".jpg"))) {
				const item_name = item.name.split(".")[0];
				const sale_item = document.createElement("div");
				sale_item.classList.add("sale-item");
				sale_item.innerHTML = `
					<div class="sale-picture clickable">
						<div class="counter">0</div>
						<img
							src="${item.download_url}"
							alt="${item_name}"
							onclick="generate_preview(this)"
						/>
					</div>
					<p>${text_map.get(item_name)}</p>
					<img
						src="img/icon/minus.svg"
						alt="Minus"
						class="buy_icon clickable"
						onclick="ENV.cart.reg(this, -1)"
					/>
					<img
						src="img/icon/plus.svg"
						alt="Plus"
						class="buy_icon clickable"
						onclick="ENV.cart.reg(this, 1)"
					/>
				`;
				sale_items_div.appendChild(sale_item);
			}

			section_element.appendChild(sale_items_div);

			$(section).appendChild(section_element);
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

async function read_banner() {
	const download_url = ENV.db.read("banner.txt");
	const banner_text = await fetch(download_url, { cache: "no-cache" })
		.then((data) => data.text())
		.then((text) => text.trim());
	if (banner_text) {
		const banner_anchor = banner_text.replaceAll(
			/@\{\s*(.*?)\s*\}\{\s*(.*?)\s*\}/g,
			'<a href="$2" target="_blank">$1</a>'
		);
		const banner_pre = $("container-banner").getElementsByTagName("pre")[0];
		banner_pre.innerHTML = banner_anchor;
	}
}
