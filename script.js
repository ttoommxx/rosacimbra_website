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

var Slideshow = new (function () {
	this.images = [
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

	this.index = 0;

	this.next = function () {
		if (this.index == this.images.length - 1) {
			this.index = 0;
		} else {
			this.index++;
		}
	};

	this.prev = function () {
		if (this.index == 0) {
			this.index = this.images.length - 1;
		} else {
			this.index--;
		}
	};

	this.set = function () {
		let slideshow = document.getElementById("slideshow-image");
		[slideshow.src, slideshow.alt] = this.images[this.index];
	};
})();

// operations at boot

window.onload = function () {
	// click on about when first loading the webpage
	let current_page = Cookies.get("page");
	if (current_page == "") {
		current_page = "about_page";
	}
	document.getElementById(current_page).click();
};

// functions

function about_page() {
	Cookies.set("page", "about_page");
	Slideshow.set();
}

function dolls_page() {
	Cookies.set("page", "dolls_page");
}

function clothes_page() {
	Cookies.set("page", "clothes_page");
}

function accessories_page() {
	Cookies.set("page", "accessories_page");
}

function cart_page() {
	Cookies.set("page", "cart_page");
}

function change_image(direction) {
	if (direction == "right") {
		Slideshow.next();
		Slideshow.set();
	} else if (direction == "left") {
		Slideshow.prev();
		Slideshow.set();
	} else {
		throw "Direction '" + direction + "' not recognized";
	}
}
