# Game covers

960x600 (16:10) WebP covers, one per game, named after its title (`minecraft.webp`), each under 80 KB, all in one layout: a blurred, darkened background, a centred 420 px rounded app-icon box with a soft shadow, and the game name in white Montserrat 800 underneath (same size and position on every cover). Preview: `contact_sheet.jpg`.

- 48 covers use the game's real official artwork (App Store icons, Steam store art, portal cover art, Wikipedia/Commons images); the background is a heavily blurred copy of the game's own key art or screenshot.
- 30 covers are for generic games with no official art (Reaction, Aim Trainer, CPS Test, ...); their icon and background are drawn as SVG with the same layout plus a glossy light/shade overlay on the icon.

Every source is listed in `SOURCES.md`.

Tools (in `tools/`): each drawn cover is a function in `tools/art/g_<id>.js` that draws the icon and the background as SVG with the helpers in `tools/kit.js`; `node tools/render.js <id>[=Name] ...` renders 960x600 PNGs with Chrome into the temp folder (`COVER_PNG` to change it), and `python tools/enc.py <id> ...` encodes them as WebP under 80 KB into this folder, named after the game's title (`<title-slug>.webp`), plus a contact sheet in the temp folder. `tools/games.json` gives the display name per id. Official-art covers were made by an earlier pipeline that is no longer kept; their sources stay listed in `SOURCES.md`.

Every game in the catalogue has a cover here, so the site never falls back to a full-bleed illustration. The last 31 (`rummikub`, `phase-10`, `sorry`, `monopoly`, `blokus`, `quoridor`, `yahtzee`, `mastermind`, `scrabble`, `boggle`, `stratego`, `guess-who`, `clue`, `catan`, `risk`, `gartic-phone`, `skribbl`, `word-bomb`, `kahoot`, `quiplash`, `typeracer`, `trivia-crack`, `terraria`, `among-us`, `worms`, `stick-fight`, `smash-fighter`, `surviv`, `diep`, `bonk`, `starve`) are drawn covers: icon and background come from `../covers/tools/flat/art/g_<id>.js`, rendered with `../covers/tools/flat/render.js` and encoded with `../covers/tools/flat/enc.py` (`COVER_PNG`/`COVER_OUT`), with no outside artwork. `render.js` loads its fonts from Google Fonts; where the browser cannot reach them, point `COVER_FONTS` at a local stylesheet with the same `@font-face` rules. `contact_sheet.jpg` shows the first 78 covers only.
