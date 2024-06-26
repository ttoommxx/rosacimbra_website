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
		if (this._map.has(name)) {
			return this._map.get(name);
		}
		return "";
	};

	this.set = function (name, value) {
		this._map.set(name, value);
		document.cookie = `${name}=${value}`;
	};
})();

// operations at runtime

window.onload = function () {
	// load pictures
	slideshow_fetch();
	dolls_fetch();

	// open previous page
	if (Cookies.get("page") == "") {
		Cookies.set("page", "about");
	}
	open_page(Cookies.get("page"));

	// load previous sidebar state
	if (Cookies.get("left_bar") == "") {
		Cookies.set("left_bar", "off");
	}
	toggle_menu(Cookies.get("left_bar"));

	// move the main to accomodate for the banner
	update_main_height();
};

window.onscroll = function () {
	const banner = document.getElementById("container-banner");
	const banner_position = banner.getBoundingClientRect();
	if (banner_position.top < 0) {
		banner.style.setProperty("position", "fixed");
	} else {
		const header_position = document
			.getElementById("container-title")
			.getBoundingClientRect();
		if (header_position.bottom > 0) {
			banner.style.setProperty("position", "absolute");
		}
	}
};

window.onresize = function () {
	update_main_height();
};

// functions

function open_page(page) {
	let page_element = document.getElementById("container-main");
	page_element.style.setProperty("opacity", "0");
	page_element.style.setProperty("left", "-100%");
	setTimeout(() => {
		let old_page = document.getElementById(Cookies.get("page"));
		old_page.style.setProperty("display", "none");
		Cookies.set("page", page);
		let new_page = document.getElementById(page);
		new_page.style.setProperty("display", "flex");
		page_element.style.setProperty("opacity", "1");
		page_element.style.setProperty("left", "0");
	}, 650);
}

function slideshow_fetch() {
	const images = [
		"/img/slideshow/doll_and_cart.jpg",
		"/img/slideshow/doll_and_teddy.jpg",
		"/img/slideshow/doll_christmas_tree.jpg",
		"/img/slideshow/doll_in_jumpsuit.jpg",
		"/img/slideshow/doll_next_to_window.jpg",
		"/img/slideshow/doll_with_curly_hair.jpg",
		"/img/slideshow/doll_with_fish.jpg",
		"/img/slideshow/doll_with_hat_and_teddy.jpg",
		"/img/slideshow/doll_with_hat.jpg",
		"/img/slideshow/doll_with_small_doll.jpg",
		"/img/slideshow/doll_with_toys.jpg",
	];
	let slideshow_div = document.getElementById("slideshow");
	for (const src of images) {
		const new_image = document.createElement("img");
		new_image.src = src;
		new_image.alt = src.split("/").at(-1).split(".")[0];
		new_image.classList.add("slideshow-image");

		slideshow_div.appendChild(new_image);
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
	let dolls_div = document.getElementById("dolls");
	for (const [src, cap] of images) {
		const doll_div = document.createElement("div");
		doll_div.classList.add("dolls_img");
		const new_image = document.createElement("img");
		new_image.src = src;
		new_image.alt = src.split("/").at(-1).split(".")[0];
		const new_caption = document.createElement("caption");
		new_caption.innerHTML = cap.join("<br />");

		doll_div.appendChild(new_image);
		doll_div.appendChild(new_caption);
		dolls_div.appendChild(doll_div);
	}
}

function toggle_menu(state) {
	Cookies.set("left_bar", state);
	let menu_div = document.getElementById("container-left");
	let left_position = state == "on" ? "0" : "-100%";
	menu_div.style.setProperty("left", left_position);

	let cart_div = document.getElementById("cart_menu");
	let right_position = state == "on" ? "4px" : "-100%";
	cart_div.style.setProperty("right", right_position);
}

function update_main_height() {
	let banner_height = document.getElementById("container-banner").offsetHeight;
	let container_main = document.getElementById("container-main");
	container_main.style.setProperty("margin-top", `${banner_height}px`);
}
