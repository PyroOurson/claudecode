# Game covers

960x600 (16:10) WebP covers, one per game id, each under 80 KB, all in one layout: a blurred, darkened background, a centred 420 px rounded app-icon box with a soft shadow, and the game name in white Montserrat 800 underneath (same size and position on every cover). Preview: `contact_sheet.jpg`.

- 48 covers use the game's real official artwork (App Store icons, Steam store art, portal cover art, Wikipedia/Commons images); the background is a heavily blurred copy of the game's own key art or screenshot.
- 30 covers are for generic games with no official art (Reaction, Aim Trainer, CPS Test, ...); their icon and background are drawn as SVG with the same layout plus a glossy light/shade overlay on the icon.

Every source is listed in `SOURCES.md`.

Tools (in `../agents3/covers2r/tools/`): `fetch.py` downloads the art (App Store lookup API + `extra.json`) into `../agents3/covers2r/src/`, `prep.py` crops the square icon and the background, `compose.js` renders all 78 with Chrome (drawn covers come from `../agents2/covers/flat/art/*.js`), then `../agents2/covers/flat/enc.py` (with `COVER_PNG`/`COVER_OUT`) encodes WebP and the contact sheet.

Every game in the catalogue has a cover here, so the site never falls back to a full-bleed illustration. The last 31 (`rummikub`, `phase-10`, `sorry`, `monopoly`, `blokus`, `quoridor`, `yahtzee`, `mastermind`, `scrabble`, `boggle`, `stratego`, `guess-who`, `clue`, `catan`, `risk`, `gartic-phone`, `skribbl`, `word-bomb`, `kahoot`, `quiplash`, `typeracer`, `trivia-crack`, `terraria`, `among-us`, `worms`, `stick-fight`, `smash-fighter`, `surviv`, `diep`, `bonk`, `starve`) are drawn covers: icon and background come from `../agents2/covers/flat/art/g_<id>.js`, rendered with `../agents2/covers/flat/render.js` and encoded with `../agents2/covers/flat/enc.py` (`COVER_PNG`/`COVER_OUT`), with no outside artwork. `render.js` loads its fonts from Google Fonts; where the browser cannot reach them, point `COVER_FONTS` at a local stylesheet with the same `@font-face` rules. `contact_sheet.jpg` shows the first 78 covers only.
