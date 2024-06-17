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

	this.del = function (name) {
		this._map.set(name, "");
		document.cookie = name + "=" + ";";
	};
})();

// operations at boot

window.onload = function () {
	// click on about when first loading the webpage
	if (Cookies.get("page") == "") {
		Cookies.set("page", "about");
	}
	open_page(Cookies.get("page"));
	slideshow_fetch();
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
		["/img/slideshow/doll_and_cart.jpg", "Doll and cart"],
		["/img/slideshow/doll_and_teddy.jpg", "Doll and teddy"],
		["/img/slideshow/doll_christmas_tree.jpg", "Doll christmas tree"],
		["/img/slideshow/doll_in_jumpsuit.jpg", "Doll in jumpsuit"],
		["/img/slideshow/doll_next_to_window.jpg", "Doll next to window"],
		["/img/slideshow/doll_with_curly_hair.jpg", "Doll with curly hair"],
		["/img/slideshow/doll_with_fish.jpg", "Doll with fish"],
		["/img/slideshow/doll_with_hat_and_teddy.jpg", "Doll with hat and teddy"],
		["/img/slideshow/doll_with_hat.jpg", "Doll with hat"],
		["/img/slideshow/doll_with_small_doll.jpg", "Doll with small doll"],
		["/img/slideshow/doll_with_toys.jpg", "Doll with toys"],
	];
	let slideshow_div = document.getElementById("slideshow");
	for (const [src, alt] of images) {
		const new_image = document.createElement("img");
		new_image.src = src;
		new_image.alt = alt;
		new_image.classList.add("slideshow-image");
		slideshow_div.appendChild(new_image);
	}
}
