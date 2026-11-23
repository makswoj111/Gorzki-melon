# Gorzki Melon

Strona restauracji Gorzki Melon (kuchnia indyjska, nepalska i tajska, ul. Grochowska 178/184, Warszawa).

Statyczna strona bez kroku budowania: HTML, CSS i JavaScript. Animacje: GSAP 3.13 (ScrollTrigger, SplitText) i Lenis 1.1.20, ładowane z jsDelivr. Kroje: Fraunces, Hind i Kanit z Google Fonts.

## Uruchomienie lokalnie

```
node serve.js
```

Strona działa wtedy pod adresem http://localhost:4180. Nieznane adresy zwracają `404.html`.

## Pliki

| Plik | Zawartość |
| --- | --- |
| `index.html` | Cała strona: hero, „Trzy kuchnie, jeden stół”, karta dań, ludzie, opinie, rezerwacja, mapa |
| `styles.css` | Style |
| `app.js` | Interakcje i animacje, karta dań, formularz rezerwacji |
| `menu-data.js` | Karta dań (nazwy, ceny, opisy) |
| `404.html` | Strona błędu 404 |
| `serve.js` | Prosty serwer podglądu |
| `img/` | Zdjęcia (`*.webp` używane na stronie, `*-s.webp` mniejsze wersje) |
| `plans/` | Plany poprawek animacji |

## Uwagi przed publikacją

- Rezerwacja nie ma systemu online: formularz przygotowuje e-mail do restauracji.
- Zdjęcia pochodzą z profili restauracji w Google i na Facebooku. Przed oficjalną publikacją potrzebna jest zgoda właściciela.
- Brakuje polityki prywatności i baneru zgody na pliki cookie.
