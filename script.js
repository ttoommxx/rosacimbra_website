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
	// click on about when first loading the webpage
	if (Cookies.get("page") == "") {
		Cookies.set("page", "about");
	}
	slideshow_fetch();
	open_page(Cookies.get("page"));
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

function open_about() {
	// in case I want to add custom instructions per page
	// TODO: remove these functions if no particular action per page is necessary
	open_page("about");
}

function open_dolls() {
	open_page("dolls");
}

function open_clothes() {
	open_page("clothes");
}

function open_accessories() {
	open_page("accessories");
}

function open_cart() {
	open_page("cart");
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
		new_image.alt = src.split("/").slice(-1)[0].split(".")[0];
		new_image.classList.add("slideshow-image");
		slideshow_div.appendChild(new_image);
	}
}
