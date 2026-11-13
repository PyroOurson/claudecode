# Building the gameplay site from source

Everything needed to rebuild `index.html` and `gameplay/` at the repo root lives in this folder.

## Setup (once per computer)

1. Install Python 3.9+ and Node.js 18+. For browser tests: `npm i -g playwright && npx playwright install chromium`.
2. The scripts work from wherever this folder is (they no longer need `/tmp/gameplay-build`). Run them inside `ClaudeScripts/gameplay-site/source/`.

## Build

1. Generated games (their part files are committed; rebuild one after editing its source): Rocket League `python3 -I games/rocket-league/tools/join.py` (joins `src/*.js` and `models/*.json` into `w/parts/115_g_rocket-league.js` and writes a standalone test page to `games/rocket-league/build/`), Minecraft `python3 games/minecraft/mk.py`, Subway Surfers `python3 games/subway-surfers/build.py`.
2. Portal (from `w/parts_orig` + `w/new/*`): `python3 w/assemble.py`. It writes `w/parts/000_pre_000.html` and `w/parts/001_portal.js`. These two files are generated and are not kept in git, so run this step after every checkout.
3. Encrypted site: `cd w && GATE_PASS="$(cat ~/.gameplay/gate_secret.txt)" python3 build2.py parts site` (see "Site password" below)
4. Copy `w/site/index.html` to the repo root and replace the repo's `gameplay/` folder with `w/site/gameplay/`, then `git ls-files > files.txt`.

## Staging: test everything without touching the live site

A private copy of the whole platform runs on one computer: a local Supabase stack (database, accounts, live updates, storage) plus a build of the site that talks to it.

1. Install Docker, then in an empty folder: `npm i supabase`, `npx supabase init`, set `minimum_password_length = 8` in `supabase/config.toml`, and `npx supabase start -x studio,logflare,vector,imgproxy,edge-runtime,postgres-meta,supavisor`. Save its settings: `npx supabase status -o json > staging.json`.
2. Load the schema: `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f w/supabase/schema.sql`. The file contains every round up to `round19_analytics.sql` and can be run again on an up-to-date database. Rounds written after it are applied on top, in order.
3. Build and serve: `STAGE_JSON=/path/staging.json python3 t/stage.py open` (or `locked` to test the password screen; the staging site password is `stagepass1`), then `node t/lib.js serve w/site_stage 8090` and open http://127.0.0.1:8090/ (set `SITE_URL=http://127.0.0.1:8090/` for the tests; on the lead's PC port 8080 is taken by another Docker service). On Windows without symlink rights, `stage.py` copies the parts instead of linking them, and without a local `psql` it runs `psql` inside the database container (`STAGE_DB`, default `supabase_db_staging`, so name the Supabase project `staging` in `supabase/config.toml`).
4. `STAGE_JSON=/path/staging.json node t/lib.js users` creates the accounts the tests sign in with (two test accounts, three players, an owner, two admins; `EXTRA_USERS=15` adds `load_player1..15` for load tests). Otherwise, the first account you create can be made owner with `update public.profiles set role = 'owner' where username = '...'`. Test accounts are created from the admin dashboard (or `admin_create_test_account`); they are the only accounts whose sessions are recorded by the diagnostics recorder (`w/new/diag.js`).
5. Browser tests, one at a time (two at once starve each other): `node t/tests/load_sequence.js`, `node t/tests/gate_locked.js`, `node t/tests/party.js` (12 two-browser party scenarios; `ONLY=A,B` runs a subset), `node t/tests/fixes.js` (save sync between devices, account switch on one browser, party host id, key rebinding, presence across tabs, delete my data, friend presence), `node t/tests/announce.js`. Set `STATE_DIR` to a folder where the test sessions are kept and `STAGE_JSON` to the staging settings file. `t/lib.js` holds every helper (`launch`, `visitor`, `player`, `api` for the staging API from Node, `serve`, and `open`, the game harness). On Windows the helpers drive the installed Google Chrome (`channel: 'chrome'`; the downloaded Playwright Chromium is blocked by Windows on the lead's PC; `PW_BUNDLED=1` uses it anyway). Elsewhere they start Chromium with software compositing (`--disable-gpu`): with an emulated graphics card and no real one, pages stall for minutes under load; set `SITE_GL=swiftshader` to get the old behaviour. They also pre-fill the cached graphics probe (`localStorage['gameplay:gpu']`) so the one-time probe does not run in tests. On staging, links to games use the hash form (`/#/snake`), because path links are only switched on for the Firebase hosts. `STAGE_OUT` and `STAGE_PARTS` let `t/stage.py` build a second copy next to the first.

## Preview deploys

`python3 deploy.py <branch> --preview` uploads that branch to a Firebase preview channel (a temporary address, 7 days) and leaves the live site untouched. Without `--preview` it deploys to the live site as before.

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

- The password page asks Supabase (`SUPABASE_DIRECT` in `w/new/consts.js`) and every relay in `SUPABASE_RELAYS` at the same time, and uses Supabase when it answers, otherwise the first relay that answers. Today the list holds only the Cloudflare Worker `https://gameplay-api.vitalang.net` (`ClaudeScripts/gameplay-site/server/cloudflare-worker.js`). The Debian relay `https://gameplaygames.vitalang.net` (`server/setup.py`) is not used yet: to turn it on, set it up and add its address to `SUPABASE_RELAYS`.
- An account is required. Only when no route answers, after every route was tried twice in the background (about 20 seconds), the sign-in screen offers "Play without an account for now". As soon as a route answers again, that visitor has to log in or sign up (`auDown` and `auGuest` in `w/new/auth.js`). The choice is kept for the browser session (`sessionStorage['gameplay:sb']`).
- After that, every request (`SBN.fetch` in `w/new/consts.js`, also given to supabase-js) moves to the next route on a network error, a time-out or a filter's web page. Live connections (`SBN.WS`) also move to the next route when one cannot connect. `Ameplay.debug.site.route()` in the browser console shows the routes in use.
- `?sb=0` (direct), `?sb=1` (first relay) or `?sb=auto` after the site address forces a route for the browser session, for testing.
- Through the relay, Google sign-in uses Google's own button and `signInWithIdToken` (the usual Google sign-in sends the browser to `supabase.co`, which these networks block). It needs `GOOGLE_CLIENT_ID` in `w/new/consts.js`. That client must list `https://gameplaygames.web.app` and `https://gameplaygames.firebaseapp.com` under Authorized JavaScript origins in Google Cloud Console.
- `w/vendor/` holds the libraries the site serves itself (supabase-js, three.js, PeerJS), tried before the public CDNs. `gate2.js` copies them into `gameplay/` unencrypted, together with `w/check.html`.
- `w/check.html` becomes https://gameplaygames.web.app/check, a page anyone can open without the password: it tests every service the site uses and gives a report to copy.

## Player data

- `w/new/track.js` sends, after cookie consent, `env_dev`, `env_geo`, `env_scr` (screen and display), `env_caps` (hardware, browser features, speed test, storage, battery, locale, referrer) once per session, and `sess_sum` (session length, visible time, counts of keys, clicks, taps, mouse travel, games opened, errors, route) every 5 minutes, when the tab is hidden and when the page closes.
- The dashboard reads them through `admin_insights_more` and `admin_user_devices`, created by `w/supabase/round9_more.sql` (run it once in the Supabase SQL editor; it is also at the end of `schema.sql`).

## Where things are

- `w/parts/`: one file per game (or group of games), `_order.json` lists them.
- `w/new/`: portal UI (`tail.js`, `body.html`, CSS), lobby and networking (`net.js`), constants (`consts.js`, Supabase keys go at the end).
- `w/meta_rows.py`: game catalogue (names, genres, players, keywords) and deleted games.
- `w/covers/`: cover images (`SOURCES.md` lists where official ones came from).
- `w/supabase/`: database schema, setup script and guide.
- `games/subway-surfers/src` + `build.py`, `games/minecraft/src` + `mk.py`: sources for Subway Surfers and Minecraft (they generate their part files).
- `games/rocket-league/src/`: Rocket League code segments, `games/rocket-league/models/`: 3D models, `games/rocket-league/notes/`: design notes.
- `../prompt.txt` (the single brief for any AI working on the site), `w/agents_net/API.md`, `games/rocket-league/RLBRIEF.md`: rules, multiplayer API and car soccer architecture.
- `t/`: browser test tools (`lib.js`: `open` opens one game with the backend mocked and reads errors, frame cost and diagnostics, `node t/lib.js play <html> <id> <dir> '<steps>'` screenshots it; `visitor`, `player` and `tests/` drive the real site on staging; `stage.py` builds the staging site); the rules for game and portal work are in `../prompt.txt`.
- `w/new/diag.js`, `w/new/diagui.js`: the diagnostics recorder for test accounts. `w/new/i18n_*.json`: extra translation rows merged by `assemble.py`.
- `design/`: the owner's home page and party lobby designs.
