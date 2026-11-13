# Briefing for the next AI working on Gameplay Games

**Start here:** the full plan for the next round is `prompt.md` in this folder. Start a session in the Claude Code app with Claude Fable 5.2 at high effort and send: "Read `ClaudeScripts/gameplay-site/prompt.md` and do everything in it. Start with Part 0." The owner's requests are summarised in Appendix D of that file. The rest of this page is background.

Read this first, then `README.md`, `LEDGER.md` and `source/BUILD.md`.

## The site

Gameplay Games (https://gameplaygames.web.app) is a browser game portal used mostly by students, some of them minors, on school laptops, Chromebooks and phones. About 170 games, accounts, friends, direct messages, online parties, an idea box, an admin dashboard with live analytics, and full diagnostics for accounts the owner flags as test accounts.

Owner priorities, in order: game quality, reliability, functionality, performance, user experience. Keep the main layout, structure, navigation and design direction. Components may change.

## Repository rules (from `CLAUDE.md`)

- New things go in `ClaudeScripts/`, one folder per project. Only edit `NaoiseGabi/` when asked.
- Anything the owner runs is Python 3.9 compatible and uses only packages from `NaoiseGabi/requirements.txt`.
- No comments inside code.
- Keep `index.html` at the repository root (GitHub Pages).
- After adding, removing or renaming files: `git ls-files > files.txt`.
- No spaces or shell symbols in file names.

## How it is built

- The portal is one script assembled by `source/w/assemble.py` from `source/w/parts_orig/001_portal.js` and `source/w/new/*.js`. Games are separate part files in `source/w/parts/`, listed in `source/w/parts/_order.json` and loaded on demand. Legal texts are also loaded on demand.
- `source/w/build2.py` encrypts the site behind a password gate. The site key is needed for a build that keeps visitors unlocked: while the site password is switched off, `rpc/get_gate_slot` (anonymous POST to the Supabase REST API) returns it in field `o`; use it as `GATE_KEY` and the whole JSON as `GATE_SLOT`.
- Database: `source/w/supabase/schema.sql` contains everything up to round 19 and can be run again. New changes go in a new `roundNN_name.sql`, safe to run twice, never deleting user data unless the owner agreed.
- Staging: a local Supabase stack plus `source/t/stage.py` and `source/t/serve.js`. It does not survive a new container; rebuild it as described in `source/BUILD.md`. Browser tests in `source/t/tests/` (load sequence, locked gate, 12 party scenarios, 13 fix scenarios, direct messages, announcements, legal pages, a smoke test that opens every game).
- Game harness without a backend: `source/t/play.js` with `source/w/minibuild.py` (see `source/t/GAMEPASS.md`).
- Machine notes: test browsers render without a graphics card. Never call `loseContext()` or `forceContextLoss()`, never create throwaway WebGL contexts: on such machines they block the page for seconds to minutes. In Playwright pass `{ polling: 250 }` to `waitForFunction`. Use `--disable-gpu` for portal tests.

## What needs the owner's go-ahead

Ask first, saying exactly what you will do, before: deploying to the live site, deleting or migrating production data, weakening any security protection, or messaging real users. Prefer preview deploys. The owner runs SQL and deploys themselves from the Supabase dashboard and Google Cloud Shell; this sandbox has no access to those accounts.

## Open work

1. Relay worker update and its two secrets (`server/README.md`).
2. A production test account with Diagnostics on, then checks on the real site (parties on school networks, presence, idea box, file uploads, admin dashboard).
3. Security decisions left to the owner: private realtime channels with a server-side party registry and authenticated hub key; a secret between the relay and the database for client addresses; username login behind a server function with a challenge; current password required before a password change; the site-password page that locks for good after five mistakes; removing readable password copies kept for staff accounts created in the dashboard.
4. Code review findings changed but not exercised by a test: timed-out writes not replayed (13), favourites race (15), picture links after an hour (16), public parties channel retry (23), stats details (24). Not fixed: long offline play can lose playtime (17).
5. Games without an honest `Hardest` level: basketball, the shooter arena, the platform fighter, Go, the hole arena, zombie and spider packs in the voxel sandbox, the dial guessing party game. Several other `Hardest` levels are only somewhat stronger (see `LEDGER.md`).
6. Not testable from the sandbox so far: real school firewalls, VPNs and TURN relays; Safari, Firefox, real phones; frame rates on a real graphics card; Google sign-in end to end.
7. A lawyer's review of the Terms, Privacy Policy and Cookie Policy (19 points in `LEDGER.md`).

## The owner's requests and the plan

`prompt.md` holds the current plan and, in Appendix D, the full list of what the owner asked for. Where this file and `prompt.md` disagree, `prompt.md` wins.

Two requests the previous AI did not take on, so the next session can decide for itself: the owner wants recreations to carry the original game's names (game, characters, items) and wants new covers to show the original game's real icon or logo, in the site's cover style. `prompt.md` asks for gameplay that matches the originals and for original assets and names. The existing covers, including those made from official artwork (`COVER_SOURCES.md`), stay as they are, as the owner asked.

## Last changes

- 13 November 2026: platform overhaul live (pull request #6). Then in the voxel sandbox: the player's left leg was missing in the inventory preview; dragging a stack across slots counted a slot several times (64 over four slots gave 10, 20, 20, 10); stack counts were half covered by the next slot. All three fixed and checked in a browser.
