# Gameplay Games overhaul: status ledger

Branch `claude/platform-overhaul`. Nothing here is live: the production site, the production database and real users were not touched. Everything marked "verified" was exercised in a real browser against a private staging copy of the platform (a local Supabase stack with the site's full schema, and a build of this branch served locally).

Status words: **Done** (built and seen working), **Partly** (built, verification incomplete), **Not done**, **Blocked** (needs something only the owner can give), **Declined** (will not do, with the reason).

Last updated: see the git log of this file.

## How things were tested

- Staging backend: local Supabase (Postgres, auth, realtime, storage) with `schema.sql`, `round16`, `round17` applied. Staging build: `t/stage.py`. Local server with the hosting headers: `t/serve.js`.
- Browser tests in `source/t/tests/`: `load_sequence.js`, `gate_locked.js`, `party.js`.
- Test accounts on staging: `gp_tester`, `gp_tester2` (flagged as test accounts, diagnostics on), plus ordinary users and an owner.
- Production: read-only. The live page was opened anonymously to observe the load sequence; nothing was written.

## Section 8: test account and diagnostics

| Item | Status | How verified |
|---|---|---|
| Diagnostics recorder (errors, console logs, requests and responses, websocket frames, WebRTC connection events and data-channel packets, party connection steps, inputs, frame rate, load timings, storage keys, realtime client logs) | Done | Recorded a session as the staging test account, read the events back from the database and from `Ameplay.diag.dump()` |
| Recording only for test accounts | Done | Server refuses uploads from any account not in `test_accounts` (HTTP 403 seen for the owner account); recorder stays off for ordinary users |
| On-page indicator, download, full packet capture switch | Done | Seen in the page (red REC chip) |
| Production test account | Blocked | Sign-up on production needs a confirmation email, and only the owner can create test accounts in the admin dashboard. After `round17_platform.sql` is applied, any account created with "test account" in the admin dashboard gets diagnostics automatically |
| Diagnostics viewer in the admin dashboard | In progress | Admin workstream |
| More analytics, accuracy audit, admin metrics | In progress | Admin workstream |

## Section 4: multiplayer, website, functionality

| Item | Status | How verified |
|---|---|---|
| Load sequence: no password flash, no login flash, right page first | Done | `load_sequence.js`: 5 scenarios pass (new visitor, signed-out returning, signed-in fast and slow backend, expired session); `gate_locked.js`: locked gate shows skeleton then the form once, wrong and right password, reload |
| Skeleton screens | Partly | Gate skeleton now matches what comes next (site grid for signed-in users, card for others); expired-session re-check waits behind a skeleton. Other slow spots are in the settings/UX workstream |
| Party connectivity: second signalling route, relayed fallback, TURN | Partly | Two routes built (PeerJS and the site's own realtime backend), relayed data fallback when WebRTC is impossible, TURN credential endpoint for the Cloudflare worker. Two-browser tests on staging in progress. TURN needs the owner to add two secrets to the worker (see `server/README.md`) |
| Cancelling connection attempts, refresh and close | Partly | Root cause fixed (a join attempt saved itself before it succeeded and was resumed after a refresh; Leave did not clear it). Tests in `party.js` (F, G, H) in progress |
| Public party has no code; no public/private button inside; Join shows available parties | Done | Two-browser run on staging: host picks Public, lobby shows "Public" with no code and no switch; guest clicks "Join a party", sees the host's party in the list and joins |
| Public parties vanished from the list after about 10 seconds | Done | Found with the diagnostics: the host re-announced every 3 s and the realtime server closed the channel ("Client presence rate limit exceeded"). Announcements are now sent only on change, throttled, and the channel is reopened if closed. Verified in the two-browser run |
| Presence: online users shown online | Partly | Same rate-limit flaw existed on the "online" channel (fixed the same way), background-tab heartbeats moved to a worker, and a database heartbeat was added as a second source. Two-browser check with the realtime socket blocked still to run |
| Admin dashboard updates every second | In progress | Admin workstream |
| Announcements: no replay, not on login or sign-up | Partly | Built (banner only repaints on change, animates only the first time it is seen, hidden while signed out). Needs a staging run with a real announcement |
| Login and sign-up: Google button prominent, username picker, 4-character minimum | Done | Screenshots at desktop and phone size with Google enabled; live "At least 4 characters", "Available", "Already taken" with suggestions; server rule checked (`abc` refused, `abcd` accepted). Username change window: built, not yet looked at |
| Rate limits raised; staff exempt on the server; sensitive limits unchanged | Done | On staging through the API: ordinary user stopped at 120 searches a minute (was 40), owner not limited, data export still 5 an hour even for the owner |
| Game covers consistent | In progress | Settings/UX workstream |
| Hidden bugs | Ongoing | See "Bugs found" below |

## Section 5: user experience

| Item | Status |
|---|---|
| Idea box with image and file uploads | In progress (ideas workstream) |
| Image and file uploads in messages elsewhere | In progress (ideas workstream) |
| Settings page redesign, useless controls removed | In progress (settings workstream) |
| No "How to play" under games | In progress (settings workstream) |
| First-time student pass | In progress (settings workstream) |

## Section 6: legal pages

| Item | Status | How verified |
|---|---|---|
| Terms, Privacy, Cookies about 3x longer | Done | Measured with tags stripped: Terms 5,936 to 17,754 words, Privacy 6,243 to 18,597, Cookies 5,821 to 17,275. Rendered in a browser at desktop and phone size |
| Points for a lawyer, and code that conflicts with the policies | Listed in the final report | |

## Section 7: games

Machine limits apply to everything below: this sandbox renders WebGL in software at a few frames per second and was overloaded, so the agents proved logic with headless simulation and scripted input. Nobody saw these games at 60 fps or heard them. That is stated per game.

| Item | Status | What was done and how it was checked |
|---|---|---|
| Faithful recreations of specific commercial games, real icons and models, new named clones | Declined | I do not build or extend copies of specific commercial games (names, characters, art, levels, look) |
| Flagship: endless runner (listed as Subway Surfers) | Done within that limit | 10 bugs fixed (train corner clip, double wall bump, coins tied to frame rate, lost progress on close, pause handling, and more); draw calls cut by about 60 percent; input buffering and touch swipes; original patterns, day cycle, daily goals. Checked by a 111-case simulation suite, 50 desktop and 18 phone-size browser checks, a passability solver over about 876 km of generated track, and a 15-minute soak |
| Flagship: arena brawler (listed as Brawl Stars) | Done within that limit, stopped early | New `Hardest` bots: 85 percent wins against the old top level in the three team modes over 60 to 100 matches each, weaker proof in the free-for-all mode. Knockback, wall-clipping and hidden-tab freeze bugs fixed; guest-side prediction; original mode, characters and maps. Online play was tested with a simulated transport only, not the real connection |
| Flagship: voxel sandbox (listed as Minecraft) | Partly, stopped early | Hidden terrain is no longer meshed or drawn, lighting moved off the main thread, 8 bugs fixed, `Hardest` level added (only the archer is shown to be stronger). Phone size, online play, long soak and the final performance table were not reached |
| Card games A (poker, blackjack, durak, belote, tarot, president, cheat, old maid, go fish, crazy eights, war, speed, hearts, spades, euchre) | Done, with limits | `Hardest` in all 14 games that have opponents, never reading hidden cards. Clearly stronger by match series in poker, blackjack, president, cheat, crazy eights, speed, spades, euchre, classic belote; not shown stronger at the sample sizes run in hearts, durak, coinche, tarot and 4-player go fish. Hidden-information leaks fixed in spades (blind nil), tarot (called king) and euchre. Five games were not opened in a browser |
| Car soccer `Hardest` bots | In progress | |
| Card and board games B, strategy board games, word and party games | In progress | |
| Small classics, puzzle and arcade, 3D arcade, 2D action, harder 2D groups | Not started | |
| Catalogue of 200 | Not done: 168 live | See the final report for the choice the owner has to make |

## Bugs found so far (beyond the list in the brief)

1. Public parties disappear from the public list after about 10 seconds (presence rate limit). Fixed.
2. The same flaw can drop a user's "online" status. Fixed.
3. A failed or cancelled party join is resumed after a refresh. Fixed.
4. The gate page's loading skeleton used the "wrong password" shake animation (two animations shared one name). Fixed.
5. The login card replayed its entry animation and morphed from login to sign-up on first paint. Fixed.
6. A WebGL context was created at every session start only to read the graphics card name (slow on weak machines). Now cached.
7. `Permissions-Policy` header listed an unknown feature (`bluetooth`), logging a console warning on every load. Fixed in `deploy.py`.
8. `schema.sql` does not contain `round16_moderation.sql`. To be merged into the cumulative file.
9. Diagnostics could keep part of a session token in websocket frames. Fixed before any production use.

## Could not test

- Real TURN relays, real NATs, VPNs and school firewalls: this sandbox has no direct UDP or TCP sockets to the internet. The fallback order was tested by blocking the signalling server and WebRTC in the browser.
- The Cloudflare relay `gameplay-api.vitalang.net`: connections from this sandbox are reset before TLS completes, so I could not tell whether it is healthy.
- Safari, Firefox, real phones, real 60 fps rendering (the sandbox renders WebGL in software).
- Google sign-in end to end (no Google account, and it is disabled on staging).
