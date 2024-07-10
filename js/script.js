// micro functions

function $(name) {
	return document.getElementById(name);
}

// cookies and global variables

const GitHubDB = function (user, repo, root_db) {
	this._db_url = `https://api.github.com/repos/${user}/${repo}/contents/${
		root_db === undefined ? "" : root_db + "/"
	}`;
	this._lambda_api =
		"https://73p5suv6mmzz2ksflzrxtipdpi0iqygf.lambda-url.eu-north-1.on.aws/";

	this.read = function (path) {
		const url = `${this._lambda_api}?url=${
			this._db_url + path
		}&token_type=GITHUB`;
		return fetch(url)
			.then((res) => res.json())
			.catch((err) => console.log(err));
	};

	this.ls = async function (config) {
		let response = await this.read(config.path);

		if (config.type) {
			response = response.filter((elem) => elem.type == config.type);
		}

		if (config.sort) {
			response.sort(
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

		return response;
	};
};

const DB = new GitHubDB("ttoommxxDB", "rosacimbra_website", "db");

const Cookies = new (function () {
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
})();

const CartItems = new (function () {
	this._map = new Map();

	this.read_cookies = function () {
		if (Cookies.get("cart")) {
			for (const [key, val] of JSON.parse(Cookies.get("cart"))) {
				this._map.set(key, val);
			}
		}

		this.update_cart_menu();

		const sale_items = document.getElementsByClassName("sale-item");
		for (const sale_item of sale_items) {
			const alt_text = sale_item.getElementsByTagName("img")[0].alt;
			if (this._map.has(alt_text)) {
				this.update_counter_div(sale_item);
			}
		}
	};

	this.update_cookies = function () {
		Cookies.set("cart", JSON.stringify(Array.from(CartItems._map.entries())));
	};

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
		elem.style.setProperty("animation", "none");
		const alt_text = elem.parentElement.getElementsByTagName("img")[0].alt;
		this._map.set(alt_text, (this._map.get(alt_text) ?? 0) + num);
		if (this._map.get(alt_text) >= 0) {
			setTimeout(() => {
				elem.style.setProperty(
					"animation",
					`scale_${num > 0 ? "up" : "down"} 0.2s`
				);
			}, 1);
		}
		if (this._map.get(alt_text) <= 0) {
			this._map.delete(alt_text);
		}

		this.update_counter_div(elem.parentElement);
		this.update_cart_menu();
		this.update_cookies();
	};
})();

// operations at runtime

window.onload = async function () {
	// load content
	download_slideshow();
	download_mydolls();
	read_banner();

	// open previous page
	if (Cookies.get("page") == "" || Cookies.get("page") == "cart") {
		Cookies.set("page", "about");
	}
	open_page(Cookies.get("page"));

	// load previous sidebar state
	toggle_menu(Cookies.get("left_bar") || "off");

	// load previous cart
	CartItems.read_cookies();
};

// functions

function open_page(page) {
	let page_element = $("container-main");
	page_element.style.setProperty("opacity", "0");
	page_element.style.setProperty("left", "-100%");
	setTimeout(() => {
		$(Cookies.get("page")).style.setProperty("display", "none");
		Cookies.set("page", page);
		$(page).style.setProperty("display", "flex");
		page_element.style.setProperty("opacity", "1");
		page_element.style.setProperty("left", "0");
	}, 650);
}

async function download_slideshow() {
	const list_slideshow = await DB.ls({
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
	const list_mydolls = await DB.ls({
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
		$("mydolls").appendChild(doll_div);

		const new_image = document.createElement("img");
		new_image.src = entry.download_url;
		new_image.alt = entry._name;
		doll_div.appendChild(new_image);

		const new_caption = document.createElement("pre");
		new_caption.innerHTML = text_map.get(entry._name);
		doll_div.appendChild(new_caption);
	}
}

function toggle_menu(state) {
	const position = $("container-left").style.left || "-100%";
	if (state == "on" && position == "-100%") {
		$("container-left").style.left = "0px";
		$("container-right").style.opacity = 0.5;
		$("container-menu").style.opacity = 0.5;
	} else if (state == "off" && position == "0px") {
		$("container-left").style.left = "-100%";
		$("container-right").style.opacity = 1;
		$("container-menu").style.opacity = 1;
	}

	Cookies.set("left_bar", state);
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
	const download_url = await DB.read("banner.txt").then(
		(response) => response.download_url
	);
	const banner_text = await fetch(download_url, { cache: "no-store" })
		.then((data) => data.text())
		.then((text) => text.trim());
	if (banner_text) {
		const banner_anchor = banner_text.replaceAll(
			/@\{\s*(.*?)\s*,\s*(.*?)\s*\}/g,
			'<a href="$2" target="_blank">$1</a>'
		);
		$("container-banner").innerHTML = "<pre>" + banner_anchor + "</pre>";
	}
}
