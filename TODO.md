# FRONT END

- create language switch:
  with cookies, save the preferred language (defaulted to english)
  everywhere, text is access via a json file, for example:
  translation = {
  "en": {
  "text1": "hello"
  },
  "it": {
  "text1": "ciao"
  }
  }

  then the html will be something like

  translation[Cookies.get("lang")]["text1"]

  and so with the switched, just set
  Cookies.set("lang", "it") and reload the webpage and it's done!

- put a chart instead of a + and -

`<img
				src="img/icon/minus.svg"
				alt="Minus"
				class="buy_icon_general clickable"
				onclick="ENV.cart.reg(this, -1)"
			/>`
