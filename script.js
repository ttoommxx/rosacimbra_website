// cookies and global variables

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
		for (const [key, val] of JSON.parse(Cookies.get("cart"))) {
			this._map.set(key, val);
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
		if (num == undefined) {
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

const Template = new (function () {
	this._map = new Map();

	this._generate_map = function () {
		const templates = document.body.getElementsByTagName("template");
		for (const template of templates) {
			const name = template.id.split(".").slice(1).join(".");
			this._map.set(name, template.content);
		}
	};

	this.get = function (name) {
		return this._map.get(name).firstElementChild.cloneNode(true);
	};
})();

// operations at runtime

window.onload = function () {
	// generate templates
	Template._generate_map();

	// load content
	slideshow_fetch();
	dolls_fetch();

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

function $(name) {
	return document.getElementById(name);
}

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

async function slideshow_fetch() {
	const url = `https://api.github.com/repos/ttoommxx/rosacimbra_website/contents/img/slideshow`;
	const response = await axios.get(url);
	const filter_elem = (elem) =>
		elem.type == "file" && elem.name.endsWith(".jpg");
	for (img_data of response.data.filter(filter_elem)) {
		const new_image = Template.get("slideshow");
		new_image.src = img_data.download_url;
		new_image.alt = img_data.name
			.split(".")
			.slice(0, this.length - 1)
			.join(".");
		$("slideshow").appendChild(new_image);
	}
}

function dolls_fetch() {
	const images = [
		[
			"/img/dolls/doll_in_balcony.jpg",
			[
				"Name: Vicky",
				"Type: Original Blythe Very Vicky",
				"Body: Azone S",
				"Date: August 2010",
				"Custom: Paola Crespi",
			],
		],
		[
			"/img/dolls/doll_with_chair.jpg",
			[
				"Name: Wendy",
				"Type: Little Keiko Original Doll",
				"Body: Obitsu22",
				"Custom: Paola Crestpi",
			],
		],
		[
			"/img/dolls/doll_with_deer.jpg",
			[
				"Name: Dorothy",
				"Type: Blythe fake",
				"Body: Obitsu24",
				"Custom: Elvira Rosolia",
			],
		],
		[
			"/img/dolls/doll_with_hat.jpg",
			[
				"Name: Gemma",
				"Type: Blythe dactory",
				"Body: Azone S",
				"Custom: Paola Crespi",
			],
		],
		["/img/dolls/doll_with_egg.jpg", ["Name: x", "Surname: y"]],
		["/img/dolls/doll_with_toys.jpg", ["Name: x", "Surname: y"]],
		[
			"/img/dolls/doll_with_teddy.jpg",
			[
				"Name: Rosa",
				"Type: Blythe fake",
				"Body: jointed AliExpress",
				"Custom: amber dolls",
			],
		],
		[
			"/img/dolls/doll_with_plants.jpg",
			[
				"Name: Marianna",
				"Type: Jacoosun fake",
				"Body: AliExpress",
				"Custom: made by myself",
			],
		],
		[
			"/img/dolls/doll_with_dress.jpg",
			[
				"Name: Licy",
				"Type: Sahras a la Mode Lycee/Sweet home (2020)",
				"Body: Azone S",
				"Custom: N/A",
			],
		],
	];
	for (const [src, cap] of images) {
		const new_image = document.createElement("img");
		new_image.src = src;
		new_image.alt = src.split("/").at(-1).split(".")[0];
		const new_caption = document.createElement("caption");
		new_caption.innerHTML = cap.join("<br />");

		const doll_div = document.createElement("div");
		doll_div.classList.add("dolls_img");
		doll_div.appendChild(new_image);
		doll_div.appendChild(new_caption);
		$("dolls").appendChild(doll_div);
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
