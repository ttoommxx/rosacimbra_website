// cookies and flobal variables

var Cookies = new (function () {
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
		document.cookie = name + "=" + value + ";";
	};
})();

// operations at boot

window.onload = function () {
	// load pictures
	slideshow_fetch();

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
	}, 500);
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

function toggle_menu(state) {
	Cookies.set("left_bar", state);

	let menu_div = document.getElementById("container-left");
	let left_position = state == "on" ? "0" : "-100%";
	menu_div.style.setProperty("left", left_position);

	let cart_div = document.getElementById("cart_menu");
	let right_position = state == "on" ? "10px" : "-100%";
	cart_div.style.setProperty("right", right_position);
}
