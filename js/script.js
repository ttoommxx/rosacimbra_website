// micro functions

function $(name) {
	return document.getElementById(name);
}

const parser = new DOMParser();

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
		this._map = {};

		this.read = function (path) {
			let temp_map = this._map;
			for (const p of path.split("/")) {
				temp_map = temp_map[p];
			}
			return temp_map;
		};

		this.ls = function (config) {
			let temp_map = this._map;
			for (const p of config.path.split("/")) {
				temp_map = temp_map[p];
			}
			let array = []; // folder
			for (const [key, val] of Object.entries(temp_map)) {
				if (typeof val == "string") {
					array.push({
						name: key,
						type: "file",
						download_url: val,
					});
				} else {
					array.push({
						name: key,
						type: "folder",
					});
				}
			}
			if (config.type) {
				array = array.filter((elem) => elem.type == config.type);
			}
			if (config.sort) {
				array.sort(
					(() => {
						if (config.sort == "name") {
							return (a, b) => a.name.localeCompare(b.name);
						} else if (config.sort == "type") {
							return (a, b) => {
								if (a.type != b.type) {
									return a.type.localeCompare(b.type);
								}
								let [name_a, format_a] = a.name.split(".");
								let [name_b, format_b] = b.name.split(".");
								format_a = format_a.toLowerCase();
								format_b = format_b.toLowerCase();
								if (format_a != format_b) {
									return format_a.localeCompare(format_b);
								} else {
									return name_a.localeCompare(name_b);
								}
							};
						}
					})()
				);
			}
			return array;
		};

		this.exist = function (path) {
			let temp_map = this._map;
			for (const folder of path.split("/")) {
				if (!(folder in temp_map)) {
					return false;
				}
				temp_map = temp_map[folder];
			}
			return true;
		};
	})();

	for (const entry of folder) {
		const full_path = entry.name.split("..");

		let temp_map = DB._map;
		for (const path of full_path.slice(0, -1)) {
			if (!temp_map[path]) {
				temp_map[path] = {};
			}
			temp_map = temp_map[path];
		}
		temp_map[full_path.at(-1)] = entry.download_url;
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
	// 			this._map.set(key, val);
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
	// 	ENV.cookies.set("cart", JSON.stringify(Array.from(this._map.entries())));
	// };

	this.update_counter_div = function (elem) {
		const alt_item = elem.getElementsByTagName("img")[0].alt;
		const counter = elem.getElementsByClassName("counter")[0];
		const num = this._map.get(alt_item);
		if (num === undefined) {
			counter.style.setProperty("visibility", "hidden");
		} else {
			counter.innerHTML = num;
			counter.style.setProperty("visibility", "visible");
		}
	};

	this.update_cart_menu = function () {
		const total_count = this._map
			.entries()
			.reduce((acc, curr) => acc + curr[1], 0);
		const cart_div = $("cart_menu");
		let right = cart_div.style.getPropertyValue("right") || "-100%";

		if (right == "4px" && total_count == 0) {
			cart_div.style.setProperty("right", "-100%");
		} else if (right == "-100%" && total_count > 0) {
			cart_div.style.setProperty("right", "4px");
		}
		$("counter_menu").innerHTML = total_count;
	};

	this.reg = function (elem, num) {
		const alt_text = elem.parentElement
			.getElementsByTagName("div")[0]
			.getElementsByTagName("img")[0].alt;
		this._map.set(alt_text, (this._map.get(alt_text) ?? 0) + num);
		if (this._map.get(alt_text) <= 0) {
			this._map.delete(alt_text);
		}

		this.update_counter_div(elem.parentElement);
		this.update_cart_menu();
		// this.update_cookies();
	};
}

const ENV = {
	cookies: new cookies_util(),
	cart: new cart_item(),
	db: null,
};

// operations at runtime

async function async_onload() {
	ENV.db = await GitHubDB("ttoommxxDB", "rosacimbra_website", "db");
	read_banner();
	download_slideshow();
	download_mydolls();
	download_sale_items();
}

window.onload = function () {
	// async loading
	async_onload();

	// open previous page
	if (ENV.cookies.get("page") == "" || ENV.cookies.get("page") == "cart") {
		ENV.cookies.set("page", "about");
	}
	open_page(ENV.cookies.get("page"));

	// load previous sidebar state
	toggle_menu(ENV.cookies.get("left_bar") || "off");

	// load previous cart
	// ENV.cart.read_cookies(); // TODO: when automating the selling section, remember to wait for that promise to finish before running this one
};

// functions

function open_page(page) {
	let page_element = $("container-main");
	page_element.style.setProperty("opacity", "0");
	page_element.style.setProperty("left", "-100%");
	setTimeout(() => {
		$(ENV.cookies.get("page")).style.setProperty("display", "none");
		ENV.cookies.set("page", page);
		$(page).style.setProperty("display", "flex");
		page_element.style.setProperty("opacity", "1");
		page_element.style.setProperty("left", "0");
	}, 650);
}

async function download_slideshow() {
	const list_slideshow = ENV.db.ls({
		path: "slideshow",
		type: "file",
	});
	for (const entry of list_slideshow.filter((elem) =>
		elem.name.endsWith(".jpg")
	)) {
		const new_image = document.createElement("img");
		new_image.classList.add("slideshow-image");
		new_image.src = entry.download_url;
		new_image.alt = entry.name.split(".")[0];
		$("slideshow").appendChild(new_image);
	}
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
		const doll_div = parser.parseFromString(
			`
            <div class="dolls_img">
                <img src=${entry.download_url} alt=${entry._name}>
                <pre>${text_map.get(entry._name)}</pre>
            </div>
            `,
			"text/html"
		).body.firstChild;
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

			const section_element_temp = parser.parseFromString(
				`
                <input id="${section}-${subsection}" class="toggle" type="checkbox" />
                <label for="${section}-${subsection}" class="sale-container clickable">
                    <span class="label-name">${Subsection}</span>
                    <span class="sale-thumbnails">
                        <img src=${src_stock1.download_url} alt=${
					src_stock1.name.split(".")[0]
				} />
                        <img src=${src_stock2.download_url} alt=${
					src_stock2.name.split(".")[0]
				} />
                        <img src=${src_stock3.download_url} alt=${
					src_stock3.name.split(".")[0]
				} />
                    </span>
                </label>
                `,
				"text/html"
			).body;

			const section_element = document.createElement("div");
			section_element.innerHTML = section_element_temp.innerHTML;

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
				const sale_item = parser.parseFromString(
					`
                    <div class="sale-item">
                        <div class="sale-picture clickable">
                            <div class="counter">0</div>
                            <img
                                src=${item.download_url}
                                alt=${item_name}
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
                    </div>
                    `,
					"text/html"
				).body.firstChild;
				sale_items_div.appendChild(sale_item);
			}

			section_element.appendChild(sale_items_div);

			$(section).appendChild(section_element);
		}
	}
}

function toggle_menu(state) {
	const position = $("container-left").style.left || "0px";
	if (state == "on") {
		$("container-left").style.left = "0px";
		$("container-right").style.opacity = 0.5;
		$("container-menu").style.opacity = 0.5;
	} else if (state == "off" && position == "0px") {
		$("container-left").style.left = "-100%";
		$("container-right").style.opacity = 1;
		$("container-menu").style.opacity = 1;
	}

	ENV.cookies.set("left_bar", state);
}

function generate_preview(img_element) {
	$("container-menu").style.opacity = 0.2;
	$("container-right").style.opacity = 0.2;
	$("container-preview").style.visibility = "visible";
	const preview_img = $("img-preview");
	preview_img.src = img_element.src;
	preview_img.alt = img_element.alt;
	setTimeout(() => {
		preview_img.style.setProperty("max-width", "90%");
	}, 1);
}

function destroy_preview() {
	$("img-preview").style.setProperty("max-width", "0%");
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
		$("container-banner").innerHTML = "<pre>" + banner_anchor + "</pre>";
	}
}
