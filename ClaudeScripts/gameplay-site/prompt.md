# Gameplay Games: master prompt for the next round

This file is a complete brief for Claude (Fable 5.2) running in the Claude Code app on the owner's computer. Paste it as the first message of a new session, or tell Claude: "Read `ClaudeScripts/gameplay-site/prompt.md` and do everything in it."

**Owner, before you run it:** read Part 3.4 (what Claude may do without asking) and change anything you disagree with. Sign in, in the Claude Code app's browser or in a terminal, to the accounts Part 6 lists, so Claude can work on them. Answer the one open question in Part 15.11 ("Krillion"), or let Claude ask you.

---

## Part 1. Who you are and what this is

You are the lead engineer, designer, tester and maintainer of **Gameplay Games** (https://gameplaygames.web.app), a free browser game portal. Its players are mostly students, many of them minors, on school laptops, Chromebooks, home computers and phones, often on school networks that filter traffic. The owner is a student who built the site and wants it to be excellent.

The owner's priorities, in this order when they conflict: **game quality**, reliability, functionality, performance, user experience. All five are in scope.

You are running on the owner's own computer, through the Claude Code app. That is different from earlier rounds, which ran in a cloud sandbox with no graphics card, no direct network and an overloaded processor. Here you have:

- a real graphics card, so 3D games can be judged at their real frame rate and smoothness;
- a real home network, a browser the owner may already be signed in to, and the owner's command-line logins (Google Cloud, Firebase, Supabase, Cloudflare, GitHub) if the owner set them up;
- the owner nearby, who can test on a phone, another computer or the school network when you ask.

Use these. Most of the bugs the previous rounds missed were missed because nobody could see the games running normally. That excuse is gone.

The previous round (November 2026, pull requests #6 and #7) was a large platform overhaul. It is live. Read `ClaudeScripts/gameplay-site/LEDGER.md`, `NEXT_AI.md`, `GOLIVE.md`, `README.md` and `source/BUILD.md` before changing anything. They say what exists, how it was tested and what is unfinished.

This round has eleven workstreams (Parts 7 to 17). Do all of them. Do not stop while work is owed. When something is blocked, say exactly what blocks it and what you need, then carry on with everything else.

---

## Part 2. Facts about the site

### 2.1 Addresses and accounts

| Thing | Value |
|---|---|
| Live site | https://gameplaygames.web.app (Firebase Hosting, project `claudecode-7e172`, site `gameplaygames`) |
| GitHub Pages copy | https://pyroourson.github.io/claudecode/ (served from the repository root: `index.html` and `gameplay/`) |
| Repository | `PyroOurson/claudecode`, default branch `mainbranch-claude-code` |
| Project folder | `ClaudeScripts/gameplay-site/` |
| Database and accounts | Supabase project `uafouyvtcijptspjbsqf` (dashboard: https://supabase.com/dashboard/project/uafouyvtcijptspjbsqf) |
| Relay for filtered networks | Cloudflare Worker `gameplay-api` at https://gameplay-api.vitalang.net (code: `server/cloudflare-worker.js`) |
| Second relay (not in use) | `server/setup.py`, a Debian home server at `gameplaygames.vitalang.net` |
| Network self-test page | https://gameplaygames.web.app/check |
| Publishing | `deploy.py` (downloads a branch from GitHub and deploys it with the Firebase command-line tool; `--preview` gives a temporary address) |

### 2.2 How the code is organised

- `source/w/new/` is the portal: `body.html`, the CSS files, and the scripts `diag.js`, `consts.js`, `legal.js`, `tail.js` (home page, game page, settings, analytics queue), `auth.js` (accounts and sync), `admin.js` (dashboard), `social.js` (friends, messages, presence, notifications), `ideas.js` (idea box and attachments), `input.js` (controls and gamepads), `track.js` (analytics), `site.js` (site switches, announcements, favourites), `net.js` (party lobby and connections), `changelog.js`, `diagui.js`, `i18n.js` and the `i18n_*.json` translation files (six languages: English, French, Spanish, German, Italian, Portuguese).
- `source/w/assemble.py` splices `source/w/parts_orig/001_portal.js` and `source/w/new/*` into `source/w/parts/001_portal.js` and `000_pre_000.html` (generated, not in git) and writes the legal texts to `source/w/parts/002_legal.js` (also generated), which loads only when a legal page opens.
- Games are part files `source/w/parts/NNN_g_<id>[+<id>...].js`. Each calls `Ameplay.register({ id, title, mount(root, api) { ... } })`. The game API (`api.loop`, `api.save`, `api.load`, `api.best`, `api.sfx`, `api.gl`, `api.net`, `api.timeout`, `api.on` and more) is in `source/w/parts_orig/001_portal.js` (`makeApi`); online play is described in `source/w/agents_net/API.md`. Only files listed in `source/w/parts/_order.json` are built into the site.
- Generated games: the voxel sandbox (`blockcraft-3d`) comes from `source/w/agents2/minecraft/src/*.js` via `python3 source/w/agents2/minecraft/mk.py`; the endless runner (`sky-runner`) from `source/w/agents2/subway/src/*.js` via its `build.py`; car soccer (`rocket-soccer`) from `source/rl/seg/*.js` via `python3 -I tools/join.py lead all` in `source/rl`, then copied to `source/w/parts/115_g_rocket-soccer.js` with line endings converted to LF.
- Covers: `source/w/covers2/<id>.webp`, 960x600. The flat-style art the site uses for its own cover style is drawn by code in `source/w/agents2/covers/flat/art/`.
- The site build: `source/w/build2.py` encrypts the site behind a password gate (`source/w/gate2.js`). The build needs the site key: while the site password is switched off, an anonymous call to `rpc/get_gate_slot` on the Supabase REST API returns it in the field `o`. Use it as `GATE_KEY` and the whole JSON answer as `GATE_SLOT`. Builds with the same key keep visitors unlocked; only changed files get new names.
- Database: `source/w/supabase/schema.sql` holds everything up to round 19 and can be run again on an up-to-date database. Round files `round16_moderation.sql` to `round19b_analytics_cleanup.sql` were applied to production on 13 November 2026. There is also an older copy under `ClaudeScripts/gameplay-site/supabase/` (see Part 7).
- Tests: `source/t/` holds the staging tools (`stage.py`, `serve.js`, `site.js`, `party_lib.js`, `stage_api.js`), the game harness (`play.js`, used with `source/w/minibuild.py`) and browser tests in `source/t/tests/`: `load_sequence.js`, `gate_locked.js`, `party.js` (12 two-browser scenarios), `fixes.js` (13 scenarios), `dm.js`, `announce.js`, `legal_pages.js`, `smoke_all.js` (opens and starts every game). They all passed at the end of the last round.
- Shared briefs for game work: `source/t/GAMEPASS.md` (game rules, harness, report format) and `source/t/PORTALPASS.md` (portal rules).

### 2.3 Staging

A private copy of the whole platform runs on one computer: a local Supabase stack in Docker plus a build of the site that talks to it. `source/BUILD.md` ("Staging") explains how to start it: `npx supabase start`, load `schema.sql`, `python3 t/stage.py open`, `node t/serve.js w/site_stage 8080`. All portal changes are tested there before anything goes near production. The tests create and use the accounts `gp_tester`, `gp_tester2` (diagnostics on), `ann_player`, `bob_player`, `cat_player`, `adm_dan`, `adm_eve` and the owner account `tester_one`; recreate them if the stack is new (see `t/party_lib.js` for the e-mail addresses and passwords used on staging).

---

## Part 3. Ground rules

### 3.1 Repository rules (from `CLAUDE.md`, they override everything else)

- Put anything you create from scratch in `ClaudeScripts/`, one subfolder per project. This project lives in `ClaudeScripts/gameplay-site/`.
- `NaoiseGabi/` holds the owners' other projects. Do not touch it.
- Everything the owner runs must be Python that works with Python 3.9 on macOS (`/usr/bin/python3`) and needs only packages from `NaoiseGabi/requirements.txt`.
- Never add comments inside code.
- Keep `index.html` at the repository root: it is the GitHub Pages page.
- After adding, removing or renaming files, regenerate `files.txt` with `git ls-files > files.txt` (it is what `ClaudeScripts/update.py` downloads).
- Never use spaces or shell symbols such as `&` in file or folder names.

### 3.2 Code rules

- Match the style of the surrounding code: no comments, compact functions, the same helpers (`$`, `esc`, `toast`, `track`, `sbRest`, `auT`, `SB`, `S.prefs`, `setOpen`, `vis` and so on, all in one scope).
- No new external network dependencies in games. Art, sound and models are made in code or stored as files in the repository.
- Every visible string goes through the translation layer and gets a row in an `i18n_*.json` file with all six languages.
- Never call `WEBGL_lose_context.loseContext()` or `renderer.forceContextLoss()`, and never create throwaway WebGL contexts. On machines without a graphics card each one froze the page for seconds to minutes; the last round removed all of them.
- Every game loop steps time by measured elapsed time with a fixed simulation step and an accumulator, clamps long frames, and gives the same outcome at 30, 60 and 144 frames per second.
- Every save is validated on load: wrong types, missing fields, old versions, absurd sizes. A bad save never stops a game from starting and never overwrites a good save.
- An online host never simulates only on animation frames: a hidden host tab must not freeze the match for everyone (step from a timer using elapsed time when no animation frame has run for about 300 ms, and never step twice).
- Nothing a player must not see (other hands, hidden roles, the draw pile, fog of war) is ever sent to that player, including in snapshots.

### 3.3 Faithfulness and originality: where the line is

The owner's position, which this brief follows: **the idea of a game is free to use; copying a game's actual assets without permission is not.** In practice:

- **Make every game play like the best games of its kind.** Mechanics, rules, controls, physics, movement, game feel, difficulty curves, menus that work the way players expect, inventory and interface conventions, scoring, progression systems, AI behaviour, online modes. A player who loves the genre should feel at home within ten seconds. Study how the well-known games of each genre behave, from your own knowledge and from public documentation such as rule books, wikis and manuals, and match that behaviour closely.
- **Make the identity original.** Names, characters, logos, artwork, textures, 3D models, sound effects, music, maps and level layouts, story text and item or card wording are your own. Never download, trace, copy or embed assets from a commercial game, its store pages, its wiki images, game portals or fan sites. Draw everything in code or create it yourself.
- **This applies to the games you add and to the content you touch.** When you find copied assets in existing files (downloaded cover art, copied texts, copied map layouts), replace them with original ones and record what you replaced.
- **Catalogue titles** of existing games are the owner's choice and stay as they are unless the owner asks you to change them. New games get their own titles.

### 3.4 What you may do without asking, and what needs the owner first

The owner has approved these in advance:

- Edit any code and file in `ClaudeScripts/gameplay-site/`; run builds, staging and tests; install development tools; create test accounts on staging.
- Create new games and assets; rework existing games; add the twelve finished but unlisted games to the catalogue once they meet Part 13 and Part 15.
- Delete obsolete files inside `ClaudeScripts/gameplay-site/` following Part 7 (reference check, one separate commit, a list in the report).
- Write the single database file of Part 8 and run it on staging as often as needed.
- Use subagents and git worktrees as described in Part 18.
- Push branches and open pull requests on `PyroOurson/claudecode`.
- Deploy **preview** channels with `deploy.py <branch> --preview` at any time.
- Deploy the relay worker and add its secrets (Part 9) once the owner is signed in to Cloudflare.
- Create a test account on production through the admin dashboard and switch Diagnostics on for it (Part 11).

Ask the owner first, and say exactly what you want to do, before:

- running SQL on the **production** database (show the exact file and what it changes; it must be additive and safe to run twice);
- merging into `mainbranch-claude-code` and deploying to the **live** site (only after the full release check of Part 19 passes);
- deleting or rewriting any production data, including analytics;
- weakening any security protection (passwords, e-mail confirmation, sign-in, admin access, rate limits on sensitive actions);
- sending messages, e-mails or notifications to real users;
- anything outside `ClaudeScripts/gameplay-site/`, the repository root `index.html`, `gameplay/` and `files.txt`.

Never sign out of the owner's accounts, change their credentials, or act on an account beyond what the task needs. Treat the owner's e-mail address and personal details as private: never send them to outside services.

---

## Part 4. How to work

1. **Orient first.** Read the documents listed in Part 1. Run `git log --oneline -30`. Start staging and run the whole test suite once, so you know what passes before you change anything.
2. **Keep a ledger.** Update `LEDGER.md` as you go: for every item, the status (Done, Partly, Not done, Blocked, Declined) and how it was checked. Never mark something done on a code change alone: it is done when you saw it work.
3. **Play, do not just read.** For every game and every page, use it the way a picky player would, on this computer with a real graphics card, at desktop size and at phone size with touch, and look closely at the screen. The previous rounds proved logic with headless simulations; that found many bugs but missed the kind described in Part 5. Both are needed.
4. **Test multiplayer for real.** Two or more browsers on this computer, then a second device on the same Wi-Fi, then a phone on mobile data, then (with the owner's help) the school network and a VPN. Record which combinations you tested and which you could not.
5. **Fix, then verify by doing it again.** A fix counts when the original steps no longer show the bug and nothing nearby broke. Add an automated test where the bug could come back.
6. **Use the diagnostics recorder.** Test accounts with Diagnostics on record errors, requests, websocket frames, WebRTC events, party steps, inputs and frame rate (`Ameplay.diag.dump()` in the page, and the Diagnostics tab of the admin dashboard). Use it to find the cause of every networking or timing bug instead of guessing.
7. **Report in plain words.** Short progress notes while you work. A final report that stands on its own (Part 20). No invented abbreviations.

---

## Part 5. The bugs that were missed, and how to find them

On 13 November 2026, right after the overhaul went live, the owner found three bugs in the voxel sandbox within minutes. All the automated tests had passed. They show what to look for.

### 5.1 The three examples

1. **The player was missing a leg in the inventory screen.** The 3D player model and the small 2D preview in the inventory read the player's skin image from different places. The 3D model took the left leg from one region of the skin image; the preview took it from another region that the skin painter never filled. The result was a transparent leg. No error, no crash, nothing for a test to catch: only visible by looking.
2. **Dragging a stack across slots gave uneven amounts.** Dragging 64 blocks over four slots should give 16 each. It gave 10, 20, 20 and 10. The code that remembers which slots the drag has already passed compared slot objects, but the list of slots is rebuilt every frame, so the same slot counted as new on every mouse movement. Reading the code, the logic looked right. Only real mouse movement, with many move events per slot, showed it.
3. **Stack counts were half hidden.** Each slot was drawn with its background and then its item and count, one slot after the other, so the next slot's background covered the last digit of the previous count. Again: visible only by looking closely.

### 5.2 The classes of bugs to hunt in every game and page

Go through this list for every game and every screen. Each line is a class of bug that tests usually miss.

1. **Two drawings of the same thing that disagree**: a model and its preview, a minimap and the world, a card in hand and the same card on the table, the cover and the title screen, the player in first person and in third person, the item icon and the item in hand.
2. **Draw order and clipping**: text covered by the next element, outlines cut off, shadows drawn over the object they belong to, transparent parts sorted wrongly in 3D, tooltips under other panels, numbers overflowing their box.
3. **Identity and stale state**: objects rebuilt each frame or each render but compared by identity; references kept to old objects after a restart; listeners registered twice after reopening; a value cached from a previous round, level or game.
4. **Interaction conventions of the genre that are missing or wrong**: everything a regular player of the genre does without thinking (Part 13 lists them per genre). If a player of the genre would try it and it does nothing or something odd, it is a bug.
5. **Input edge cases**: holding two keys, releasing a key while the tab loses focus, a mouse button released outside the canvas, right-click opening the browser menu, the wheel scrolling the page instead of the game, keys still held after pausing, touch with two fingers, a gamepad plugged in mid-game, key repeat, keyboard layouts other than QWERTY (AZERTY is common for French players).
6. **Animation and timing**: animations that replay when they should not, jerky interpolation, things that move faster at high frame rates, timers that keep running while paused or in a background tab, sounds that play twice or keep playing after closing the game, a countdown that skips a number.
7. **Off-by-one and rounding**: a score that shows 99 when it should be 100, a health bar empty at 1 point, a level counter starting at 0, percentages that do not add up, a timer that shows 0:60.
8. **Layout and sizes**: phone portrait and landscape, small laptop screens (1366x768), large screens, browser zoom at 125 and 150 percent, the site's theater and fullscreen modes, long translated strings (German and French are longer), long player names.
9. **Visual consistency**: different fonts, colours, button styles or icon styles between screens of the same game; low-resolution or blurry art next to sharp art; a placeholder shape left in; a missing texture showing magenta or black.
10. **Feedback**: actions with no sound or animation, buttons that give no sign they were pressed, no indication of whose turn it is, no warning before something irreversible, a loading wait with nothing on screen.
11. **Restart and repeat**: play, lose, restart five times, close the game, reopen it, switch to another game and back. Look for leaked timers, growing memory, doubled sounds, stale scores, music that stacks.
12. **Saves and progress**: progress lost when the tab closes during a save, a best score that saves the wrong value, a save from an old version that breaks the new one, progress that differs between two devices of the same account.
13. **Online play**: a guest who joins late, refreshes, leaves, comes back, or has a slow connection; the host's tab in the background; two players doing the same thing at the same moment; rematch and back to lobby; chat during the game.
14. **AI behaviour**: bots that get stuck on walls, walk in circles, never use part of their kit, react instantly (unfair), or cheat by reading hidden information.

### 5.3 Method

- For each game, write a short checklist before playing: the genre conventions from Part 13 plus anything the game's own help or menus promise. Then play through it and tick each line, with notes.
- Record a few seconds of video or a sequence of screenshots when something looks wrong, and keep them in your scratch folder for the report.
- Look at screenshots at full size. Zoom into areas with text, numbers, icons and edges.
- When a bug class shows up in one game, search all the other games for the same pattern in the code (for example, all places where slot or card objects are compared by identity, or all places where a list is drawn item by item with backgrounds).

---

## Part 6. Set-up on this computer

1. Find out the operating system and what is installed: Git, Node.js 18 or later, Python 3.9 or later, Docker, Playwright with Chromium (`npm i -g playwright` then `npx playwright install chromium`), the Supabase command-line tool (`npx supabase`), the Firebase command-line tool (`npx firebase-tools`), Wrangler for Cloudflare (`npx wrangler`), and the GitHub command-line tool `gh`. Install what is missing for development; tell the owner what you installed.
2. Check which accounts are signed in: `gh auth status`, `npx firebase-tools login:list`, `npx supabase projects list`, `npx wrangler whoami`, `gcloud auth list`. For anything missing, ask the owner to sign in (in a terminal or in the app's browser) and wait. Never ask for passwords or tokens in the chat.
3. Clone or update the repository, create a working branch from `mainbranch-claude-code` (for example `claude/round-21`), and start staging (Part 2.3).
4. Measure the machine: run one 3D game and record its frame rate, so you know what "smooth on this computer" means. School Chromebooks are much weaker: also test with the browser's CPU throttling (four times slower) and a capped window size, and use the games' own adaptive quality.
5. Keep large temporary files (screenshots, recordings, builds) in a scratch folder outside the repository.

---

## Part 7. Workstream 1: clean up the project

The project folder holds files from earlier rounds that are no longer used. Remove them so the next person finds only what matters.

1. List every tracked file under `ClaudeScripts/gameplay-site/` with its size and the last commit that touched it.
2. For each candidate below, search the whole repository for references (file name, folder name, imports, build scripts, documentation). Delete it only if nothing that is still used refers to it, or update the reference at the same time.
3. Candidates found at the end of the last round (check each one; do not delete blindly):
   - `ClaudeScripts/gameplay-site/__pycache__/deploy.cpython-313.pyc` (a compiled Python file committed by mistake) and any other `__pycache__` folders in git.
   - `ClaudeScripts/gameplay-site/supabase/` (an older copy of `schema.sql`, `GUIDE.md` and `setup.py`; the current database files are in `source/w/supabase/`). Move whatever is still useful (the setup guide, `setup.py`) to the current location, make `setup.py` use the single file of Part 8, then delete the old folder.
   - Old briefs from earlier rounds in `source/w/`: `MASTER.md`, `NETBRIEF.md`, `ROUND3.md`, and anything else that describes a finished round. Keep their useful facts by moving them into `BUILD.md` or `README.md` first.
   - The old build path: `source/w/build.py`, `source/w/gate.js`, `source/w/meta2.js`, `source/w/meta_rows.py`, `source/w/split.py`, `source/w/stat.json`, `source/w/orig_order.txt`. Some are still read by `assemble.py`, `build2.py` or `t/pbuild.py`: keep those or remove the dependency.
   - `source/w/agents_perf/`, `source/design/`, `source/notes/`, `source/skfb/`: keep what documents something current, move it to one `notes/` folder, delete the rest.
   - `COVER_SOURCES.md`: it lists covers made from downloaded official artwork. Once Part 16 has replaced those covers, delete it.
   - Unused vendor files in `source/w/vendor/`, unused cover files in `source/w/covers2/` (covers of games that no longer exist), and game part files whose games are deleted and not coming back (for example the leftover code of `lights-out`, `clicker`, `golf`, `stick-bridge`, `kart-circuit` inside larger files: remove the dead code, keep the live games in the same file working).
   - Generated folders must never be in git: `w/site/`, `w/site_plain/`, `w/site_stage*/`, `w/parts_stage*/`, `w/parts/000_pre_000.html`, `w/parts/001_portal.js`, `w/parts/002_legal.js`, `rl/build/`. Check `source/.gitignore` covers them.
   - Old files in the repository root `gameplay/` folder that the current build no longer produces (the build replaces the whole folder; check nothing else links to them).
4. Do all deletions in one commit with the message "remove obsolete files" and the full list in the commit message, so it can be reverted in one step.
5. Regenerate `files.txt`. Run the full build and the whole test suite afterwards to prove nothing needed was removed.

---

## Part 8. Workstream 2: one database file

The owner wants a single SQL file that sets up or updates the whole database.

1. Create `source/w/supabase/gameplay.sql`: everything in `schema.sql` plus `round19b_analytics_cleanup.sql`, in an order that works on a **new** empty project and on the **current production** database.
2. Rules for the file:
   - Safe to run any number of times: `create ... if not exists`, `create or replace`, `drop ... if exists` before a function whose return type changed, policies dropped and recreated, guarded `alter table` statements.
   - Never deletes or rewrites user data. One-time clean-ups go in a clearly separate section at the end, each guarded so it runs once (record completion in a small table) and never touches accounts, profiles, saves, stats, friends, messages, ideas, tickets or files.
   - Ends with `notify pgrst, 'reload schema';`.
   - Grants and revokes for every function, and row level security on every table.
3. Verify on staging three ways, and record the results:
   - a fresh Supabase stack: run the file, then run the whole test suite;
   - the same stack: run the file a second and third time without errors;
   - a copy of the production schema: with the owner signed in to the Supabase command-line tool, dump the production schema only (no data) and load it into a fresh local database, then run the file on it. Compare the list of tables, columns, functions, policies and indexes before and after; nothing may disappear except what you intended.
4. Add the security work of Part 10 to this file (as later sections), so there is still one file.
5. Delete `schema.sql` and the `roundNN_*.sql` files once `gameplay.sql` replaces them (they stay in git history). Update `setup.py`, `BUILD.md`, `GOLIVE.md`, `README.md` and the setup guide to name only `gameplay.sql`. Future changes edit `gameplay.sql` directly and note the date in a short line at the top of each section.
6. Running it on production needs the owner's go-ahead (Part 3.4). Prepare the exact link (`https://supabase.com/dashboard/project/uafouyvtcijptspjbsqf/sql/new`) and a short description of what changes.

---

## Part 9. Workstream 3: the relay and the TURN service

The site reaches its database through the Cloudflare Worker `gameplay-api` when a school network blocks the database's own address, and online parties need a TURN relay on networks that block direct connections. The new worker code (`server/cloudflare-worker.js`, with a `/turn` endpoint) is written but not yet deployed.

1. Ask the owner to sign in to Cloudflare (`npx wrangler login`) if they have not.
2. Create `server/wrangler.toml` for the existing worker name `gameplay-api` and its custom domain `gameplay-api.vitalang.net` (read the current settings first with Wrangler or the dashboard, and keep them).
3. In the Cloudflare dashboard (Realtime, TURN Server), create a TURN key named `gameplay`, then store its two values as worker secrets `TURN_KEY_ID` and `TURN_KEY_API_TOKEN` with `npx wrangler secret put`. Never print them, never commit them.
4. Deploy the worker. Check: `https://gameplay-api.vitalang.net/health` answers `ok`; a request to `/turn` from another origin is refused; from the live site while signed in, `https://gameplaygames.web.app/check` shows "Relayed connections (site TURN 1): Works".
5. Run a real relayed party: two devices, one of them on a network that blocks direct connections (a phone hotspot often does; or block UDP in the operating system firewall for the test), and confirm in the diagnostics that the connection used the relay.
6. Decide whether the Debian relay (`server/setup.py`) is still wanted. If the owner does not run that machine, remove the address from the code and documentation; if they do, set it up with them and add it to `SUPABASE_RELAYS` in `source/w/new/consts.js`.
7. Document the final set-up in `server/README.md`.

---

## Part 10. Workstream 4: finish the security work

The owner approved the security decisions left open last round. They strengthen protection and none weakens it. Implement each one, test it on staging, put the database part in `gameplay.sql`:

1. **Private realtime channels.** Today anyone who knows a party code can listen and answer on the party's channel, and typing or read marks between friends can be faked. Move the per-user channels, the public party directory and the party doors to private realtime channels with authorisation policies; add a server-side party registry (host, game, code, public or private, created, last seen) that the host writes and guests read; let guests check the host's public key against the registry before trusting a party channel.
2. **A secret between the relay and the database.** The database trusts a client address header the relay sets. Add a shared secret header the worker sends and the database checks before trusting that address (used by rate limits).
3. **Username sign-in through a server function.** Signing in with a username today calls a database function that can be used to test passwords. Move it behind a Supabase Edge Function with a challenge (for example a free invisible captcha such as Cloudflare Turnstile) and a strict rate limit per address and per account.
4. **Current password before a password change**, and before changing the e-mail address.
5. **The site-password page.** After five wrong passwords it locks the browser for good. Replace that with growing waiting times (for example 30 seconds, then 2, 10 and 60 minutes), which keeps brute force impossible without locking students out forever.
6. **Staff password copies.** Accounts created in the dashboard keep a readable copy of their password so the owner can hand it out. Keep that for ordinary player accounts only if the owner still wants it; remove existing copies for staff accounts with a guarded statement in the clean-up section (ask before running it on production, it deletes data).
7. Re-run the security review of the last round (it found no privilege escalation) on the new code: every function that is `security definer` checks who is calling, every table has row level security, no secret is shipped to the browser, no user text is inserted into the page without escaping.

---

## Part 11. Workstream 5: gather test data

1. **A production test account.** Create one in the admin dashboard (owner account needed; ask the owner to sign in in the app's browser), switch Diagnostics on for it, and use it for every check on the live site. Never record any other account.
2. **The real-network party matrix.** For the live site and for a preview build, test hosting and joining between: two browsers on this computer; this computer and a phone on the same Wi-Fi; this computer and a phone on mobile data; with a VPN on one side; with the owner on the school network (ask them to test when they can, and give them a two-line instruction). For each: which route connected (direct, second route, relayed), how long joining took, whether chat, game start, refresh and leaving worked. Put the table in the ledger.
3. **Frame rate and smoothness on real hardware.** For every 3D game and every busy 2D game: average frame rate, the share of frames over 20 ms, the longest frame, memory after 10 minutes, at the site's normal size, in fullscreen and with four-times CPU throttling. Put the table in the ledger. Fix the worst first (Part 13).
4. **Load times.** First visit, return visit, and a signed-in return visit: time to the first meaningful screen and to "ready", on this network and with the browser's "Fast 3G" throttling.
5. **Analytics accuracy.** Play a few known sessions with the test account and compare the admin dashboard's figures with what you did (the last round compared 37 figures with hand-written SQL on staging: repeat a subset on production).
6. **Error inventory.** Read the dashboard's Errors tab for real users' errors (the owner's account can see it). List the top errors by count, fix them, and confirm the counts drop after release.
7. Keep every measurement script in `source/t/` so the next round can repeat it.

---

## Part 12. Workstream 6: the portal, page by page

Walk through the whole site as a student who has just arrived, then as a regular player, then as the owner. For each page and state, check the classes of Part 5.2 and the points below, at desktop and phone size, light and dark theme, English and French.

1. **First visit**: password page (if switched on), cookie notice, sign-up and log-in pages (Google button first, username picker, error messages, password rules), e-mail confirmation return, Google sign-in return.
2. **Home**: game grid, search, filters, favourites, "Continue playing", the sidebar list and its two-step select-then-play behaviour, "Surprise me", announcements, the "What's new" window, the top bar (notifications, friends, idea box, settings, profile).
3. **Game page**: the loading skeleton, the play bar (score, best, favourite, pause, controls, restart, sound, theater, fullscreen), the information strip, "More like this", pause with Esc, the online party window (Host a party, Join a party, public and private, code, invite, bots, party size, chat, play, leave, refresh, closing the tab).
4. **Social**: friends list, friend requests, online status, direct messages (text, pictures, files, typing, read marks, blocking, reporting), notifications, the chat dock.
5. **Idea box and support tickets**: every type, attachments, limits, "My ideas", staff replies.
6. **Settings**: every switch and choice does what it says and persists after a reload and on another device of the same account; the search box finds every setting; danger zone confirmations.
7. **Profile, statistics, data export, account deletion** (on a staging account only for deletion).
8. **Admin dashboard** (owner account): every tab, the live figures every second, filters, user actions, site switches, announcements, the diagnostics viewer, the ideas tab.
9. **Legal pages**: Terms, Privacy, Cookies; links from the cookie notice and the footer; they load on demand.
10. **Accessibility**: keyboard only (Tab order, visible focus, Esc closes, Enter activates), screen reader labels on icon buttons, colour contrast, reduced motion respected, text readable at 200 percent zoom.
11. **Errors and slow networks**: the site offline, the database unreachable (block it in the browser to see the relay take over), a slow network, a full browser storage.

Fix everything you find. Keep the main layout, structure, navigation and design direction.

---

## Part 13. Workstream 7: every game

There are 168 games in the catalogue, plus 12 finished but unlisted ones and the new ones of Part 15. Appendix A maps every file to its games. Every game gets the full treatment below. The previous round's results per game are in `LEDGER.md` (Section 7): start from there and do not redo proven work, but do not trust "verified" on anything that was only simulated: play it.

### 13.1 Protocol for every game

1. **Play it for real on this computer**: start, every mode and menu, win, lose, restart five times, pause, mute, resize, theater, fullscreen, phone size with touch, a gamepad if the game supports one. Write the checklist first (Part 5.3).
2. **Compare with the best games of its genre** (13.3). Every convention a regular player expects must work.
3. **Fix every bug**, visual or technical, in the classes of Part 5.2.
4. **Feel and presentation**: responsive controls, clear feedback, smooth animation, proper sound effects and music made in code, readable text, a real start screen and end screen, consistent art style within the game.
5. **Performance**: smooth on this computer and acceptable with four-times CPU throttling; adaptive quality for 3D games (the shared helper added last round); no allocations inside the loop; no work for things off screen.
6. **Hardest AI** for every game with computer opponents: a top level labelled exactly `Hardest`, almost unbeatable for a strong human, by playing well under the same rules and limits as the player (human reaction time of 150 to 250 ms, the same speed and accuracy limits, no hidden information). Prove it with a series of matches against the previous top level (sides swapped, enough matches for the result to mean something) and report the numbers. Where it is only somewhat stronger, say so. Games still without an honest `Hardest` at the end of the last round: basketball, the shooter arena, the platform fighter, Go, the hole arena, zombie and spider packs in the voxel sandbox, the dial-guessing party game.
7. **Online play** (games using `api.net`): test with two and more real browsers; check every point of Part 5.2 item 13; host-authoritative; hidden information never sent.
8. **Saves**: feed 15 corrupt or old saves; the game must start every time.
9. **Record** what you did, what you measured and what is left, per game, in the ledger.

### 13.2 Content that copies an original

While you work on a game, check its content against Part 3.3. Replace copied names of characters, items, weapons, modes, rooms, cards and levels, copied map layouts and copied texts with original ones of the same quality, and record them. Known places from the last round: the voxel sandbox (mob, block and item names, recipes and the inventory layout follow the original closely; only the title screen's lines were replaced), the mining sandbox (item and boss names), the tower defence game (tower and enemy names), the social deduction game's map layout, the worm artillery game's weapon list. Keep save compatibility: change display names, keep internal ids, or migrate saves.

### 13.3 Genre conventions to match

These are the behaviours players expect. Match them closely; give them your own names and look.

**Voxel sandbox (survival and creative building).** Inventory: left click picks up or places a whole stack; right click picks up half or places one; left drag splits evenly, right drag places one per slot, passing back over a slot adds nothing; shift-click moves a stack between inventory and hotbar or container; double-click gathers matching items; number keys swap the hovered slot with that hotbar slot; Q drops one, Ctrl+Q drops the stack; F swaps with the off-hand; middle click picks a block in creative; shift-click on a crafting result crafts as many as possible; the cursor stack goes back to the inventory when the screen closes; a recipe book. World and player: jump of about 1.25 blocks, sprint and sprint-jump, sneak that stops you falling off edges, swimming and drowning, fall damage from 4 blocks, hunger and regeneration, break times that depend on the tool and its material, tools that wear out, day and night of about 20 minutes, monsters that spawn in darkness, crops that grow, water and lava flow, sleeping to skip the night, a death screen and respawn, chests, furnaces with fuel and smelting times. Look: both legs, arms that swing, the held item in hand in first and third person, a matching preview in the inventory, clouds, sunrise colours, block breaking cracks, particles.

**Tactical 5v5 shooter** (new, Part 15.1). Buy phase and economy with loss bonus; round timer; bomb plant and defuse with sounds and a defuse kit; one life per round; first to a fixed number of rounds with a side switch at half time; recoil patterns that can be learned, first-shot accuracy, running inaccuracy, crouch and walk; armour and helmets; grenades (flash, smoke, explosive, fire) with physics; footstep sounds that give away position; a minimap and a scoreboard; bots that hold angles, use cover, trade kills and play the objective.

**Top-down arena brawler.** Twin-stick movement and aim, auto-aim on tap for phones, ammo bars that recharge, a super ability charged by hits, bushes that hide, walls that block shots, knockback, respawn timers, several team modes and a free-for-all.

**Racing (karts, time trials, highway, drifting).** Throttle and brake curves, drift with a boost on release, a lap counter, a minimap, a ghost of the best lap, a countdown, a results screen, collision that never sends a car through a wall, controls that feel the same at every frame rate, a track editor where a game has one with save and share.

**Platformers and runners.** Coyote time (a jump still works a moment after leaving an edge), jump buffering (a jump pressed just before landing still counts), variable jump height, consistent hit boxes slightly smaller than the sprite, checkpoints, no unfair deaths off screen, speed that grows smoothly in endless runners, swipe controls on phones.

**Shooters and arenas (top-down, 2D, 3D).** Hit feedback (sound, flash, damage numbers where the genre has them), screen shake within reason, enemy waves that build up, pickups that are visible, no bullets passing through walls at high speed.

**Fighting and physics brawlers.** Frame-consistent hit boxes, hit stun, combos, blocking, edge recovery, ring-outs, clear damage display, the same result at every frame rate.

**Sports (soccer, basketball, volleyball, bowling, pool, golf, penalty, hockey).** Real rules where they apply (fouls, scoring, turns), believable ball physics, aim guides where the genre has them, AI that plays positions.

**Card games.** The real rules of each traditional game, including the edge cases (side pots and all-in in poker; split, double and insurance in blackjack; trump and transfers in Durak; bidding and announcements in belote and tarot; shooting the moon in hearts; nil bids and bags in spades; bowers and going alone in euchre). Dealing and playing animations, cards that can be dragged and clicked, a clear indication of legal moves, a score sheet, undo where the game allows it.

**Board games.** The real rules (en passant, castling, promotion, repetition and the 50-move rule in chess; forced captures and multi-jumps in checkers; passes in reversi; ko and scoring in Go), move highlights, last-move marker, undo against the computer, clocks where the genre has them, notation or history where it helps.

**Puzzles.** Every generated puzzle solvable (and with one solution where the genre requires it), hints that are right, undo and restart, a move counter, star ratings or par, level select that remembers progress.

**Word and quiz games.** Large, correct word lists for each language offered, no offensive words, accented letters handled for French, a timer that is fair, answers checked without being fooled by capital letters or spaces.

**Party games (online, 3 to 16 players).** Late joiners wait for the next round, a refresh returns to the same seat, a player who leaves never stalls a round, the host leaving ends cleanly, timers on every phase, moderation of typed text, rematch and back to lobby.

**Idle and clicker games.** Big number formatting, offline progress with a cap, no exploit from changing the clock, upgrades that show their effect, saves every few seconds.

**Rhythm games.** Timing judged against the audio clock, an input offset setting with calibration, no drift over a long song, original songs and charts made for the site.

**Tower defence.** Tower placement grid that shows range, upgrade paths, a speed toggle, waves that grow fairly, enemies that follow the path exactly at every speed.

**Life simulation and management games.** Clear choices with visible consequences, a save that survives a refresh, events that do not repeat too often, text written for a school audience.

### 13.4 Game groups for subagents

Use the groups of the last round (they are a sensible split; see Part 18): small classics; puzzle and arcade classics; arcade and sports 2D; 3D arcade and physics platformers; action and multiplayer 2D; simulation and skill games; card games A; card and board games B; strategy board games; word and party games; the four flagship games (Part 14); the new games (Part 15).

---

## Part 14. Workstream 8: the four flagship games

These get one agent each.

1. **Voxel sandbox (`blockcraft-3d`, listed as Minecraft).** Everything in the voxel section of 13.3. On this computer measure real frame rate while flying over new terrain and in a busy base; fix stutters (chunk meshing per frame is capped at 2 to 4 ms, check it holds). Make zombie and spider packs genuinely stronger at `Hardest`. Online: two real browsers, building together, a guest refresh, the host's tab in the background. Replace copied names and texts (13.2) with original ones of the same quality, migrating saves.
2. **Arena brawler (`brawl-stars`).** Real two-browser matches in every mode on the live site with test accounts. Make `Hardest` win mirror duels with every character (it still lost with five of twelve). Look at the predicted guest shots on screen: no visible jump when the host's version arrives. Check the original names introduced last round read well in all six languages.
3. **Endless runner (`sky-runner`).** Play 30 minutes on this computer and on a phone. Lane changes, jumps, rolls, power-ups, collisions with train corners, the daily goals, the shop, the score multiplier. Smoothness on real hardware.
4. **Car soccer (`rocket-soccer`).** On real hardware: frame rate in 3v3 with six `Hardest` bots, aerial controls, boost pads, kickoffs, replays, the end screen. The `Hardest` bots won 40 of 40 matches against the old top level: check they still behave believably (no jitter, no impossible touches).

---

## Part 15. Workstream 9: grow the catalogue to 200 games

The catalogue has 168 games. Reach at least 200 with games of high quality, each one passing Part 13 before it is listed. Each new game gets an original title, original art and an original cover (Part 16), and a genre and description in the catalogue. Build each new game as its own part file and add it to `source/w/parts/_order.json`, the catalogue metadata and the translations.

1. **A 3D tactical 5v5 shooter** in the style of the best-known team shooters: two teams, attack and defence, plant and defuse, buy phase with an economy, rounds, side switch, learnable recoil, grenades, two or three original maps with clear lanes and sites, bots on four levels up to `Hardest`, online play through the party system (up to 10 players, bots filling empty seats). Performance on Chromebooks matters: low-poly art, baked lighting, adaptive quality.
2. **A real-time card duel with towers** (two lanes, three towers each, a resource bar that fills over time, decks of eight cards with a rotating hand, troops, spells and buildings, sudden death). Start from the unlisted file `289_g_clash-royale.js`: audit and replace any copied card names, art or numbers, give it an original title, then list it.
3. **A low-poly time-trial racer with a track editor and shared track codes.** Start from `297_g_polytrack.js` the same way.
4. **A first-person horror escape** (a house to escape within a few in-game days, an antagonist who hears noise and patrols, hiding places, items and puzzles, several difficulty levels). Original setting and antagonist; scary for teenagers, not gory.
5. **A fast first-person arena shooter** with dash, slide, wall-jump, a style meter, weapon swapping and alternate fire, waves of original enemies, a parry move, and ranked levels.
6. **A cooking and restaurant time-management game** (orders, stations, timing, customer patience, upgrades, days). Start from the cooking part of `283_g_papas-pizzeria+tiny-fishing+duck-life.js` if it is close; that file also holds a fishing game and a duck training game to bring in.
7. **A life simulation** (a life from birth to old age through yearly choices, school, jobs, relationships, health, money, random events), written for a school audience.
8. **A ragdoll physics obstacle course** (vehicles and characters with joints, hazards, a level editor if time allows). Start from `277_g_happy-wheels+getting-over-it.js`.
9. **A rope-swing momentum game** (tap to grab, release to fly, collect, reach the goal).
10. **An online meme-caption party game** (players write captions for pictures made in code or uploaded by the host, vote, score; moderation of text; uploads go through the existing file limits and are visible only within the party).
11. **"Krillion"**: the owner named this game; it is not clear which game is meant. Ask the owner. If the owner means the browser shooter with a similar-sounding name, item 5 already covers that style: discuss with the owner whether a second one is wanted.
12. **The other unlisted files**: `275` (ragdoll archery duel), `283` (fishing, duck training), `285` (American football management and play), `287` (two rhythm games), `291` (a poker-hand building card game), `293` (element combining). For each: audit and replace copied content (Part 3.3), give it an original title and cover, pass Part 13, list it.
13. **The rest up to 200 and beyond**: pick from the idea pool in `GAMES.md` (games 169 to 200 of "Wave 1"), favouring online multiplayer, genres the catalogue lacks, and games students ask for in the idea box (read the ideas in the admin dashboard). The same rules apply.

---

## Part 16. Workstream 10: covers

The owner wants every cover to match: the same composition (one central icon on a darkened, blurred background of the game's own colours), the same size (960x600 WebP), the same quality, and an icon that shows what the game is. They must also be the site's own art: `COVER_SOURCES.md` lists covers made from artwork downloaded from game stores, game portals and encyclopaedia pages. Replace every one of those, and any other cover that copies outside artwork, with original art drawn by the site's cover tools (`source/w/agents2/covers/`), then delete `COVER_SOURCES.md`.

1. Render a contact sheet of all covers (every game in one image, grouped by genre) before and after. Look at it at full size: same icon style, same background treatment, same title treatment, no cover that stands out.
2. Every new game gets its cover the same way.
3. The cover must agree with the game: the icon shows the game's own main object or character as it looks in the game.
4. Check the covers at the sizes the site shows them (grid, sidebar, rail, game page, favourites) on a phone and on a large screen.

---

## Part 17. Workstream 11: policies and documentation

1. **Legal pages.** After all changes, re-check the Terms, Privacy Policy and Cookie Policy (`source/w/new/legal.js`) against what the code does: new games, new data collected or not, the relay and TURN service, private channels, the username sign-in function, retention. Every statement true of the code; nothing that claims a protection that does not exist. Keep their length. Keep the list of points for a lawyer in `LEDGER.md` up to date; the owner must have a lawyer look at it.
2. **Documentation.** Update `README.md`, `BUILD.md`, `GOLIVE.md` (or replace it by a short "Release" section in `README.md` once there is one SQL file), `LEDGER.md` and `NEXT_AI.md`, and rewrite this file (`prompt.md`) for the round after yours, with what you learned.

---

## Part 18. Subagents

Delegate where it clearly helps, keep the risky parts yourself.

- **Keep in your own hands**: networking (`net.js`, the relay, TURN), accounts and sign-in, the load sequence, rate limits and security (Part 10), the database file (Part 8), merging, releases.
- **One agent per game group** of 13.4 and one per flagship game (Part 14), each running Fable 5.2 at extra-high effort, each in its own git worktree that you create yourself from your working branch (`git worktree add ../wt-<group> -b work-<group> <your branch>`) and name in the brief. Worktrees created by the agent tool itself start from the repository's default branch and miss your latest changes.
- **One agent per new game** of Part 15, or one for two small ones.
- Brief each agent like a peer: give it `source/t/GAMEPASS.md` to read first, the list of its files, the protocol of 13.1, the genre conventions of 13.3, the originality rule of 3.3, the bug classes of Part 5, a time budget, and the report format (what was played and tested, bugs fixed, performance before and after, `Hardest` results with sample sizes, what is left, the commit hash). Tell it plainly not to edit the portal, other groups' files, the repository root or the build, and not to push.
- Run at most as many agents at once as the computer handles comfortably (watch the processor and memory; the last round's sandbox stalled with too many). Each agent runs its browser tests one at a time.
- Read every agent's report critically. Merge only what you checked yourself: open the game, play the changed parts, run `smoke_all.js`. When an agent stops early, send it back with a precise list.

---

## Part 19. Release

1. On your branch: `python3 source/w/assemble.py`, then the site build with the live key (Part 2.2) into `source/w/site/`, then copy `index.html` and `gameplay/` to the repository root and regenerate `files.txt`. Compare the new `gameplay/` file names with the old ones: only changed files may get new names.
2. The whole test suite on staging: `load_sequence.js`, `gate_locked.js`, `party.js`, `fixes.js`, `dm.js`, `announce.js`, `legal_pages.js`, `smoke_all.js`, plus every test you added. All must pass.
3. A preview deploy: `python3 deploy.py <branch> --preview` (or the Cloud Shell form in `README.md`). Open the preview address on this computer and on a phone; play a few games; host and join a party.
4. Ask the owner for the go-ahead with a short summary: what changed, the database file to run (if changed), the test results, the preview address.
5. Once approved: the owner (or you, if approved and signed in) runs `gameplay.sql` on production, then merge the pull request into `mainbranch-claude-code`, then deploy: `curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/mainbranch-claude-code/ClaudeScripts/gameplay-site/deploy.py | python3 - mainbranch-claude-code` in Google Cloud Shell, or `python3 deploy.py mainbranch-claude-code` on this computer if the Firebase tool is signed in.
6. After release: open the live site as a new visitor and as the test account; check `/check`; host and join a party across two networks; watch the dashboard's Errors tab for an hour; fix anything new with a follow-up release.
7. If something is badly wrong: redeploy the previous commit of `mainbranch-claude-code`. Database changes are additive and can stay.

---

## Part 20. Final report

Write it so it stands on its own for someone who did not follow the session. Plain words, no invented abbreviations. In this order:

1. What is live now, and what is waiting for the owner (with exact links and commands).
2. Done, with how each was checked (one line each, details in the ledger).
3. Unfinished, with the reason.
4. Blocked, with exactly what is needed.
5. Decisions for the owner.
6. Things that could not be tested, and why.
7. The numbers: games in the catalogue, games with an honest `Hardest`, the party network matrix, frame rates on real hardware, top errors before and after.

---

## Appendix A. Files and the games they hold

Games listed in the build (in `_order.json`) unless marked "unlisted". Some files also hold code of games that are no longer listed (Part 7). Titles as the catalogue shows them.

- `003`: Reaction, Aim Trainer, Whack-a-Mole
- `005`: Perfect Stop, Stack, Pulse (rhythm)
- `007`: Breakout, Pong
- `011`: 2048, Slide 15
- `013`: Tic-Tac-Toe, Connect Four (and dead code of Lights Out)
- `015`: Pairs, Sequence, Number Memory
- `017`: Trivia, Math Sprint, Five Letters (word guess)
- `019`: Typing Test (and dead code of Clicker and Golf)
- `021`: Knife Throw (and dead code of Stick Bridge)
- `025`: Pinball, Air Hockey, Archery
- `027`: 8-Ball Pool, Piano Tiles, CPS Test
- `031`: Chimp Test (and dead code of Kart Circuit)
- `033`: Tetra Blocks, Bubble Pop, Gem Swap
- `035`: Box Pusher, Pipe Connect, Sudoku
- `037`: Chess, Checkers, Reversi
- `039`: Solitaire, Hangman, True or False
- `041`: Marble Roll
- `043`: Highway 3D, Sky Pilot
- `045`: Hoops 3D
- `047`: Penalty Kick, Target Range
- `049`: Maze Escape 3D, Tank Arena
- `051`: Asteroid Field (and the cube puzzle)
- `053`: the obstacle-course party game (`bean-royale`)
- `055`: Block Roll
- `057`: the voxel sandbox (`blockcraft-3d`), generated from `agents2/minecraft`
- `061`: the side-scrolling platformer (`brick-bros`)
- `065`: Cell Feast
- `067`: the idle cookie game (`cookie-baker`)
- `069`: Geometry Rush (`dash-cube`)
- `073`: Dino Run
- `077`: Flap Bird
- `081`: the fruit slicing game (`fruit-slice`)
- `083`: Garden Defense
- `085`: the helix drop game (`helix-3d`)
- `089`: the hole arena (`hole-city`)
- `091`: the basketball flick game (`hoop-flop`)
- `093`: Invaders
- `097`: Last Card
- `101`: Maze Muncher
- `103`: the tank duel (`maze-tanks`)
- `105`: Minesweeper
- `107`: Moto Stunts
- `111`: Paper Land
- `113`: the road crossing game (`road-hopper`)
- `115`: car soccer (`rocket-soccer`), generated from `source/rl`
- `117`: Sea Battle
- `121`: the endless runner (`sky-runner`), generated from `agents2/subway`
- `123`: Slither
- `125`: the slope runner (`slope-3d`)
- `127`: Snake
- `129`: the tunnel runner (`tunnel-run`)
- `201` to `213`: Texas Hold, Blackjack, Durak, Belote, French Tarot, Go Fish, Old Maid, Cheat, President, Crazy Eights, War, Speed, Hearts, Spades, Euchre
- `215`: Gin Rummy, Rummikub, Phase 10
- `217`: Skip-Bo, Exploding Kittens, Coup
- `219`: Spider Solitaire, FreeCell, Pyramid Solitaire, Cribbage
- `221`: Mahjong Solitaire, Riichi Mahjong
- `223`: Ludo, Snakes and Ladders, Sorry!
- `225`: Monopoly
- `227`: Backgammon, Mancala, Nine Men's Morris
- `229`: Go, Gomoku, Dots and Boxes
- `231`: Chinese Checkers, Blokus, Quoridor
- `233`: Dominoes, Yahtzee, Mastermind
- `235`: Scrabble, Boggle
- `237`: Stratego, Guess Who, Clue
- `239`: Catan
- `241`: Risk
- `243`: Word Search, Mini Crossword, Spelling Bee, Connections
- `245`: Nonogram, Flow Free, Water Sort, Unblock Me
- `247`: Gartic Phone, Skribbl.io
- `249`: Werewolf
- `251`: Codenames, Spyfall, Undercover
- `253`: Word Bomb, Kahoot, Quiplash
- `255`: Wavelength, Petit Bac, Bingo
- `257`: Typeracer, Trivia Crack
- `259`: Terraria (the mining sandbox)
- `261`: Among Us (the social deduction game)
- `263`: the worm artillery game
- `265`: Stick Fight, Super Smash Bros. (the platform fighter)
- `267`: Brawl Stars (the arena brawler)
- `269`: Surviv.io (the shooter arena), Diep.io (the tank arena)
- `271`: the physics pushing arena and the survival crafting game
- `273`: head soccer, slime volleyball, basketball
- `275` (unlisted): ragdoll archery duel (the swing game and the precision platformer named in the file name are not registered)
- `277` (unlisted): physics obstacle course (the climbing game in the file name is not registered)
- `279`: Tomb of the Mask, Color Switch, Eggy Car, Drift Boss
- `281`: Bloons TD (the tower defence game)
- `283` (unlisted): cooking game, Tiny Fishing, Duck Life
- `285` (unlisted): American football game
- `287` (unlisted): two rhythm games
- `289` (unlisted): real-time card duel
- `291` (unlisted): poker-hand roguelike
- `293` (unlisted): Little Alchemy 2 (element combining; the life simulation in the file name is not registered)
- `297` (unlisted): low-poly track racer with editor

## Appendix B. Open items carried over from the last round

From `LEDGER.md` and `NEXT_AI.md` at the end of November 2026:

1. The relay worker update and its TURN secrets (Part 9).
2. A production test account and checks on the real site (Part 11).
3. The security items (Part 10).
4. Code review fixes changed but not exercised by a test: timed-out writes not replayed through the relay (13), the favourites race (15), picture links after an hour (16), the public parties channel retry (23), stats details (24). Not fixed: long offline play can lose playtime because the server caps one batch at about an hour (17). Write tests for the first five; fix the sixth by mirroring the server's cap in the client and keeping the remainder for later batches.
5. Games without an honest `Hardest` (Part 13.1 item 6).
6. Not yet tested: real school firewalls, VPNs and TURN; Safari, Firefox, real phones; real frame rates on a graphics card; Google sign-in end to end. On this computer most of these become testable: do them.
7. The lawyer review of the legal pages (owner).
8. The twelve unlisted games and the new games (Part 15).
9. Copied content inside games (Part 13.2) and copied cover art (Part 16).
10. The three voxel sandbox bugs of Part 5.1 are fixed in pull request #7: make sure it is merged and deployed before you start, or merge it into your branch.
