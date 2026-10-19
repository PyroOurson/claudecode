# Building the gameplay site from source

Everything needed to rebuild `index.html` and `gameplay/` at the repo root lives in this folder.

## Setup (once per computer)

1. Copy this folder to `/tmp/gameplay-build` (the scripts use that path):
   `rm -rf /tmp/gameplay-build && cp -r ClaudeScripts/gameplay-site/source /tmp/gameplay-build`
   (On Windows use WSL, or replace `/tmp/gameplay-build` in the scripts with your own folder.)
2. Install Python 3.9+ and Node.js 18+. For browser tests: `npm i -g playwright && npx playwright install chromium`.

## Build

1. Rocket League (joined from `rl/seg/*` and `rl/models/*`):
   `cd /tmp/gameplay-build/rl && python3 -I tools/join.py lead all && cp build/lead_all.js ../w/parts/115_g_rocket-soccer.js`
2. Portal (from `w/parts_orig` + `w/new/*`): `cd /tmp/gameplay-build/w && python3 assemble.py`
3. Encrypted site: `GATE_PASS="$(cat ~/.gameplay/gate_secret.txt)" python3 build2.py parts site` (see "Site password" below)
4. Copy `site/index.html` to the repo root and replace the repo's `gameplay/` folder with `site/gameplay/`, then `git ls-files > files.txt`.
5. Copy changed sources back into `ClaudeScripts/gameplay-site/source/` so the repo stays the source of truth.

Keeping the same build secret and the fixed salt in `w/gate2.js` means browsers that already unlocked the site stay unlocked after updates.

## Site password

Two different secrets:

- `GATE_PASS` is a long random build secret. Nobody types it. The site is encrypted with a key derived from it. It is never committed: on the lead's PC it lives in `C:\Users\gabri\.gameplay\gate_secret.txt` (`~/.gameplay/gate_secret.txt` in Git Bash). Create it once with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))" > ~/.gameplay/gate_secret.txt`. If it is lost, make a new one, rebuild and reseed (everyone has to type the password again).
- The password people type lives in Supabase (`public.site_gate`, set up by `w/supabase/round7_owner.sql`) as a key slot: the build key wrapped with the typed password. The password page fetches the slot (`get_gate_slot`) and unwraps it, so it needs the internet to unlock (devices that already unlocked keep working offline).
- The owner changes the password in the admin dashboard, Site tab, "Site password" card (owners only). Devices that already unlocked this version stay unlocked.
- The build also copies the current slot into the page (gate2.js reads it from Supabase while building, or from `GATE_SLOT` set to the JSON that `get_gate_slot` returns). The page asks Supabase first; if Supabase cannot be reached (school or office networks that block `supabase.co`), it uses the copy in the page, so the password still works. After changing the password in the dashboard, rebuild and deploy so the copy in the page follows: until then the old password keeps working on networks that block Supabase.
- When Supabase cannot be reached, the site opens without accounts (no sign-in screen): games work and progress stays in that browser.
- Instead of `GATE_PASS`, a build can use `GATE_KEY`, the site key itself in base64 (what a browser that unlocked keeps in `localStorage['gameplay:gate'].k`). The pages are the same; only the file names in `gameplay/` change.

Seed or reset the password from the command line (prints one SQL statement; paste it into the Supabase SQL editor):

```
cd ClaudeScripts/gameplay-site/source/w
GATE_PASS="$(cat ~/.gameplay/gate_secret.txt)" NEW_SITE_PASS='the password people type' node gate_slot.js
```

In PowerShell: `$env:GATE_PASS = (Get-Content $HOME\.gameplay\gate_secret.txt -Raw).Trim(); $env:NEW_SITE_PASS = 'the password people type'; node gate_slot.js`.

Reseed after every change of `GATE_PASS`: the old slot unwraps a key that no longer opens the site.

## Restricted networks

- The password page asks Supabase (`SUPABASE_DIRECT` in `w/new/consts.js`) and every relay in `SUPABASE_RELAYS` (the Debian server `https://gameplaygames.vitalang.net` and the Cloudflare Worker `https://gameplay-api.vitalang.net`, both in `ClaudeScripts/gameplay-site/server/`) at the same time. It uses Supabase when Supabase answers, otherwise the first relay that answers, otherwise it opens without accounts. The choice is kept for the browser session (`sessionStorage['gameplay:sb']`).
- After that, every request (`SBN.fetch` in `w/new/consts.js`, also given to supabase-js) moves to the next route on a network error, a time-out or a filter's web page. Live connections (`SBN.WS`) also move to the next route when one cannot connect. `Ameplay.debug.site.route()` in the browser console shows the routes in use.
- `?sb=0` (direct), `?sb=1` (relay 1), `?sb=2` (relay 2), `?sb=none` (no accounts) or `?sb=auto` after the site address forces a route for the browser session, for testing.
- Through the relay, Google sign-in uses Google's own button and `signInWithIdToken` (the usual Google sign-in sends the browser to `supabase.co`, which these networks block). It needs `GOOGLE_CLIENT_ID` in `w/new/consts.js`. That client must list `https://gameplaygames.web.app` and `https://gameplaygames.firebaseapp.com` under Authorized JavaScript origins in Google Cloud Console.
- `w/vendor/` holds the libraries the site serves itself (supabase-js, three.js, PeerJS), tried before the public CDNs. `gate2.js` copies them into `gameplay/` unencrypted, together with `w/check.html`.
- `w/check.html` becomes https://gameplaygames.web.app/check, a page anyone can open without the password: it tests every service the site uses and gives a report to copy.

## Where things are

- `w/parts/`: one file per game (or group of games), `_order.json` lists them.
- `w/new/`: portal UI (`tail.js`, `body.html`, CSS), lobby and networking (`net.js`), constants (`consts.js`, Supabase keys go at the end).
- `w/meta_rows.py`: game catalogue (names, genres, players, keywords) and deleted games.
- `w/covers2/`: cover images (`SOURCES.md` lists where official ones came from).
- `w/supabase/`: database schema, setup script and guide.
- `w/agents2/subway/src` + `build.py`, `w/agents2/minecraft/src` + `mk.py`: sources for Subway Surfers and Minecraft (they generate their part files).
- `rl/seg/`: Rocket League code segments, `rl/models/`: 3D models, `rl/notes/`: design notes.
- `w/MASTER.md`, `w/NETBRIEF.md`, `w/agents_net/API.md`, `rl/RLBRIEF.md`: rules, multiplayer API and Rocket League architecture.
- `t/`: browser test tools (`look.js` screenshots a game, `sweep.js` opens games and reports errors).
- `design/`: the owner's home page and party lobby designs.
