# FRONT END

- questo sarebbe la traduzione del testo in inglese, magari vedi se fila

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

metterei anche questo, magari sotto quello in italiano, diminuendo i caratteri di entrambi, oppure affiancati, quello in it in nero, quello in inglese magari in grigio o altro colore

APP SU CELLULARE
1.non si capisce che le immagini su about possano scorrere perché quella presente riempie tutta la pagina... come si potrebbe fare? aggiungere una piccola freccia? 2. stringerei i caratteri della poesia, e sotto il testo in inglese 3. il logo sembra un po' piccolo... si può aumentare? magari rimpicciolisci il banner sotto, anche troppo in evidenza 4. le bambole in my doll, nella versione cliccata (in cui si vede la descrizoine) potrebbero essere meno sfocate 5. quando si clicca sul menù (per esempio "my dolls") il menù si dovrebbe chiudere 6. per tornare indietro da una pagina alla precedente, è possibile abilitare il sistema android? 7. dovremmo prevedere dei sottomenu per i vestiti e gli accessori
vestiti: abiti-saloppette-varie
accessori: cappelli,-borse-calze-varie

SITO
mi sembra che qui vada tutto bene

1. rimpicciolire le bambole in my dolls, magari facendocene stare 3 per riga
2. come sopra
3. come sopra

grazzzzie ❤️❤️❤️❤️❤️

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

- restore cart after reload (use the cookies approach), but remember to improve it in case the cart changes, aka remove mismatched entries

- add ads via Google AdSense

# SERVER SIDE

- UI interface to upload and resize + make images lighter
  can use Python and Django or Flashis
