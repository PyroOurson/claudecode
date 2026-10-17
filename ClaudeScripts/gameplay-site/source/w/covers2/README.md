# Game covers

960x600 (16:10) WebP covers, one per game id, each under 80 KB, all in one layout: a blurred, darkened background, a centred 420 px rounded app-icon box with a soft shadow, and the game name in white Montserrat 800 underneath (same size and position on every cover). Preview: `contact_sheet.jpg`.

- 48 covers use the game's real official artwork (App Store icons, Steam store art, portal cover art, Wikipedia/Commons images); the background is a heavily blurred copy of the game's own key art or screenshot.
- 30 covers are for generic games with no official art (Reaction, Aim Trainer, CPS Test, ...); their icon and background are drawn as SVG with the same layout plus a glossy light/shade overlay on the icon.

Every source is listed in `SOURCES.md`.

Tools (in `../agents3/covers2r/tools/`): `fetch.py` downloads the art (App Store lookup API + `extra.json`) into `../agents3/covers2r/src/`, `prep.py` crops the square icon and the background, `compose.js` renders all 78 with Chrome (drawn covers come from `../agents2/covers/flat/art/*.js`), then `../agents2/covers/flat/enc.py` (with `COVER_PNG`/`COVER_OUT`) encodes WebP and the contact sheet.
