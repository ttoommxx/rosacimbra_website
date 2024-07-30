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

"""
Sometimes it takes very little
To make the world a beautiful place to be
A smile, a hug, a phone call
Or an object, created by you, with your hands
A small gift of beauty
Where creativity meets passion
Here, this is my world!
My happy island, my precious refuge
From which come dresses, bags, socks, overalls...
And where my dolls have a home and a name!
"""

- restore cart after reload (use the cookies approach), but remember to improve it in case the cart changes, aka remove mismatched entries

- add ads via Google AdSense

# SERVER SIDE

- UI interface to upload and resize + make images lighter
  can use Python and Django or Flashis
