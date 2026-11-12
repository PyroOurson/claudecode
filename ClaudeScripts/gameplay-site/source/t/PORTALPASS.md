# Portal work: shared brief

You are improving one area of "gameplay" (Gameplay Games, https://gameplaygames.web.app), a browser gaming portal with about 170 games, accounts, friends, chat and online parties, used mostly by students (some are minors) on laptops, Chromebooks and phones. Several agents work at the same time, each in its own git worktree and on its own files.

`SRC` below means `ClaudeScripts/gameplay-site/source` inside your worktree.

## How the portal is built

- The portal is one page. Its code lives in `SRC/w/new/`: `body.html` (markup), CSS files (`am.css`, `auth.css`, `admin.css`, `social.css`, `site.css`, `media.css`, `diag.css`), and scripts that are spliced into one big IIFE by `SRC/w/assemble.py`: `diag.js`, `consts.js`, `legal.js`, `tail.js` (home, game page, settings, profile, analytics queue), `auth.js` (accounts), `admin.js` (admin dashboard), `social.js` (friends, direct messages, presence, notifications), `input.js`, `track.js` (analytics), `changelog.js`, `site.js` (site switches, announcements, favourites), `diagui.js`, `i18n.js`, plus `net.js` (party lobby and connections). Because it is one scope, every file can call helpers from the others (`$`, `esc`, `toast`, `track`, `sbRest`, `auT`, `SB`, `S.prefs`, `setOpen`, `vis`, and so on). Read how neighbouring code does something before writing your own.
- `python3 SRC/w/assemble.py` regenerates `SRC/w/parts/000_pre_000.html` and `001_portal.js` (not in git). If you add a new script or CSS file under `SRC/w/new/`, add it to `assemble.py` next to the similar ones.
- Backend: Supabase (Postgres with row level security, auth, realtime, storage). The cumulative schema is `SRC/w/supabase/schema.sql`; each release adds a `roundNN_*.sql` file that the owner runs once in the SQL editor. `round17_platform.sql` is this release's main file and is owned by the lead: put your SQL in your own new file named in your task. SQL must be safe to run twice (`create or replace`, `if not exists`, `drop policy if exists`), keep row level security on, revoke from `public, anon, authenticated` and grant only what is needed, use `security definer` with `set search_path = ''` like the existing functions, check `auth.uid()`, and rate-limit writes with `private.rate_check(action, max, interval)` (staff are exempt automatically; see `round17_platform.sql`).
- Text shown to users is English in the code and translated at runtime by `i18n.js` from a table of rows `[English, French, Spanish, German, Italian, Portuguese]`. Wrap dynamic strings with `auT('...')`. Put the rows for every new or changed string in your own file `SRC/w/new/i18n_<yourarea>.json` (same format as `i18n_add.json`); `assemble.py` merges all `i18n_*.json` files. Never edit `i18n.js` itself except to fix a key whose English text you changed.

## Rules

- Never add comments inside code (repo rule). Match the surrounding style: compact modern JavaScript, no frameworks, no new external dependencies.
- The main layout of the site, its navigation and its overall look must stay recognisable: improve components, do not rearrange the site.
- Works in current Chrome, Safari and Firefox, with mouse, keyboard and touch, at 1366x768 and on a 390x844 phone, in light and dark theme, and with reduced motion. Keyboard focus and screen-reader labels must stay correct.
- No loading flashes: where data takes time, show a skeleton (see the `.sk` classes) and never an empty box. Animations must not replay for no reason.
- Security first: never trust the client. Anything about roles, limits, visibility or ownership is enforced in SQL.
- Edit only the files named in your task, plus new files of your own. Other agents are editing the rest. Do not run `build2.py` directly, do not touch the repo-root `index.html` or `gameplay/`, do not deploy, do not push. Commit to your worktree branch when done.

## Test rig (already running on this machine)

- A local Supabase stack is the staging backend: API `http://127.0.0.1:54321`, database `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (use `psql`). It already has `schema.sql`, `round16` and `round17` applied. Apply your own SQL file to it with `psql ... -v ON_ERROR_STOP=1 -f yourfile.sql`. It is shared: only add your own objects, never drop or reset anything.
- Staging build of your worktree: `STAGE_JSON=/tmp/claude-0/-home-user/fac5df78-04ec-5f30-8bb3-dc79b74c02d5/scratchpad/secrets/staging.json python3 SRC/t/stage.py keep` writes `SRC/w/site_stage/`. Serve it on your own port: `node SRC/t/serve.js SRC/w/site_stage <port>` (ports are assigned in your task).
- Browser driver: `SRC/t/site.js` (`launch()`, `visitor(browser, opts)` with `goto`, `login`, `consent`, `openGame`, `shot`, `text`, `log`, `page`, `ctx`) and `SRC/t/party_lib.js` (`player(browser, who)` logs a staging account in and keeps its session: `owner` is the site owner, `test` and `test2` are test accounts with diagnostics, `ann`, `bob`, `cat` are ordinary users; set `STATE_DIR` to a folder of your own and `SITE_URL=http://127.0.0.1:<port>/`). `SRC/t/stage_api.js` calls the staging API from Node (`login`, `rpc`, `rest`). Example tests: `SRC/t/tests/*.js`.
- Look at your screenshots with the Read tool. A feature is done only when you have used it in the real page and seen it work, including the error cases.
- The machine has 4 cores shared by many agents and is overloaded. Prefix every test command with `nice -n 10`, run one browser at a time, keep runs short, use long timeouts, close browsers, and never kill processes by name.

## Report (your final message, at most 40 lines)

What you built and where; what you verified in the browser and how (including phone size, dark theme and error cases); the SQL file the owner must run; anything unfinished or uncertain; then the branch name and commit hash.
