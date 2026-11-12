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
| Car soccer `Hardest` bots (listed as Rocket League) | Done | New level above All-Star: 40 wins, 0 losses in 1v1 over 40 five-minute matches, 15 to 1 in 2v2, 16 to 0 in 3v3, sides alternated. It sees the ball and other cars 100 ms late, uses the same controls as a player through a limiter, and never reads the opponent's boost. Started and played through the real menus without errors; frame cost in the browser was not measured |
| Card and board games B (gin rummy, rummikub, phase 10, skip-bo, cribbage, solitaires, mahjong, ludo, sorry, monopoly, backgammon, mancala, nine men's morris and others: 20 games) | Partly | `Hardest` added in 8 games; proven stronger in mancala (44 wins, 5 draws, 11 losses of 60) and nine men's morris (20, 3, 1 of 24); backgammon positive but not significant (94 to 76 of 170); no gain measured in sorry, gin rummy, cribbage, phase 10. Rule audits, the solitaires, mahjong, monopoly, performance and presentation were not reached |
| Strategy board games (chess, checkers, reversi, connect four, tic-tac-toe, go, gomoku, dots and boxes, chinese checkers, blokus, quoridor, dominoes, yahtzee, mastermind, scrabble, boggle, stratego, clue, catan, risk, guess who: 21 games) | Done, with limits | New `Hardest` engines proven by match series in connect four (20 of 20 from the empty board, exact search from about 12 discs), reversi (21, 0, 3 of 24), checkers (16, 6, 2), quoridor (12, 0, 2), blokus, chinese checkers, tic-tac-toe (no losses in 3,700 games), scrabble (40 to 20). Chess rules pass move-count tests on 6 positions; its new top level is only a trend (18, 13, 9). A bot bug that could shuffle forever in quoridor is fixed. In go, gomoku, dots and boxes, boggle, stratego, clue, catan and risk the top level was only relabelled. No two-browser online runs |
| Word and party games (28 games) | Done, with limits | Online fixes in all party games: a refreshed guest no longer sticks on "waiting", a host tab in the background no longer freezes or slows the game, idle players no longer stall rounds, message rates cut, typed text filtered for slurs. `Hardest` proven in word bomb, the quiz game and trivia. 132 nonograms, 374 flow puzzles, 300 unblock levels and 140 water-sort levels checked solvable by program. Tested with a simulated transport plus four real two-browser runs; in those the refreshed guest returned to the lobby, not into the running game (see multiplayer notes) |
| Action and multiplayer 2D (8 files) | In progress | First pass delivered `Hardest` in the three 1v1 sports games (head soccer 6 to 0, volleyball 20 to 0, basketball 14 to 2 against the old top level) and a fix so a background host tab does not freeze online matches, but the latter was untested; sent back to prove or revert it |
| Small classics (28 listed games: reaction, aim, whack, stack, rhythm, breakout, pong, 2048, slide, memory games, typing, knife throw, falling blocks, bubble pop, gem swap, box pusher, pipes, sudoku, dino run, flap, invaders, maze muncher, minesweeper, snake and others) | Done, with limits | Six bugs fixed (clocks that kept running while paused in minesweeper, the slide puzzle and falling blocks; a sound context never closed in 2048; knife landing that depended on frame rate; unreadable text on phones in whack). Pong `Hardest` never lost a point to a scripted copy of the old top level in 150 matches at 20 to 240 fps, moving no faster than a keyboard player. Rules proven by program: 1,000 minesweeper boards, 240 sudokus with exactly one solution, 1,500 slide shuffles, 26 box-pusher levels, 900 pipe puzzles, 800 gem boards. Four games now redraw only when something changed (canvas work at 144 Hz cut by about 57 percent). Every game soaked with random input at mixed frame rates: no errors, no timers left after closing. Hands-on play at a normal frame rate was not possible here |
| Arcade and sports 2D (19 games) | Partly, second pass running | `Hardest` proven in pool (84 of 100), air hockey (64 percent of matches), sea battle (60 to 70 percent depending on rules) and the card game (59 percent); these are stronger, not "almost unbeatable". All 19 open and start without errors. No bugs found or fixed in the first pass; the tank duel, the four arenas, performance and real playthroughs were sent back for a second pass |
| Simulation and skill games (16 registered games in 10 files) | Done, with limits | Saves that could crash a game at start fixed in six games (found by feeding each game 15 corrupted saves). Physics moved to a fixed time step in three games. `Hardest` proven in the card battler (49 of 60 against the old top logic at equal card levels), the archery duel (376 of 400) and the football defence (yards per pass down from about 9.8 to 5.8). A sideways-scrolling phone layout fixed in the tower defence game. Rhythm games already judged hits on the audio clock. Nobody played these through by hand. Note: 8 of these 10 files (12 games) are in the repository but not in the site's build list, so they are not live (see decisions) |
| 3D arcade (13 files) | In progress | |
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

## Code review of the portal (27 findings from an independent read of the client code)

Status of each. "Verified" means a browser test on staging reproduces the scenario and passes (`source/t/tests/fixes.js`, `party.js`); "Fixed, not exercised" means the code is changed and builds, but no test drives that exact path.

| # | Finding | Status |
|---|---|---|
| 1 | A device with an old save could overwrite a newer cloud save | VERIFY_S1 |
| 2 | A second account on the same browser inherited the first one's saves, plays and display name; a deleted account's history went to the next sign-in | VERIFY_S2 |
| 3 | A party guest could join under the host's id and get leader powers | VERIFY_S3 |
| 4 | Esc while rebinding a key left capture armed, so the next key pressed in the game was rebound | VERIFY_S4 |
| 5 | Two tabs double-counted plays and playtime and reverted each other's settings | Fixed, not exercised |
| 6 | A failed or cancelled invite link kept being retried when the lobby was reopened | Fixed, not exercised |
| 7 | Overlapping realtime nudges to the same user were dropped (late messages, typing, read marks) | Fixed, not exercised |
| 8 | Message thread refreshes were silently skipped while another was in flight | Fixed, not exercised |
| 9 | With a party lobby open, Enter and Esc stopped working in chat, search and settings fields | Fixed, not exercised |
| 10 | Two tabs fought over the online status; closing one showed the player offline | VERIFY_S5 |
| 11 | "Delete my data" wrote data back while the page reloaded | VERIFY_S6 |
| 12 | The last analytics batch of every visit was stored twice | Handed to the analytics workstream |
| 13 | Timed-out writes were replayed through the relay (duplicate messages, and a possible cause of surprise sign-outs) and uploads were cut at 15 s | Fixed, not exercised |
| 14 | Messages were marked as read while the tab was hidden | Fixed, not exercised |
| 15 | A favourites sync could undo a click made a moment earlier | Fixed, not exercised |
| 16 | Pictures in messages broke after an hour, and on filtered networks | Fixed, not exercised |
| 17 | Long offline play can lose playtime (server caps one batch at about an hour) | Not fixed: needs a matching change in the stats function; low impact |
| 18 | "What's new" could open over a running game and Esc did not close it | Fixed, not exercised |
| 19 | The party "door" channel accepts any answer | Partly: flooding is capped; authenticating the host's key is in the security decisions |
| 20 | Diagnostics could record the password typed for a username login | Fixed (wider redaction, recorder switched off on sign-out) |
| 21 | One failed profile request left the session without a profile | Fixed, not exercised |
| 22 | The chat dock did not reopen after a reload | Fixed, not exercised |
| 23 | The public-parties channel scheduled two retries after a close | Fixed, not exercised |
| 24 | "Days played" capped at 60, date off by one across clock changes, export said "downloaded" when the account part failed | Fixed, not exercised |
| 25 | The site-password page locks for good after five mistakes | Not changed: loosening it needs the owner's go-ahead |
| 26 | Typing and read nudges can be spoofed | Owner decision (private realtime channels), with the other security items |
| 27 | Arrow keys and Space were blocked on drop-downs inside the lobby | Fixed, not exercised |

## Could not test

- Real TURN relays, real NATs, VPNs and school firewalls: this sandbox has no direct UDP or TCP sockets to the internet. The fallback order was tested by blocking the signalling server and WebRTC in the browser.
- The Cloudflare relay `gameplay-api.vitalang.net`: connections from this sandbox are reset before TLS completes, so I could not tell whether it is healthy.
- Safari, Firefox, real phones, real 60 fps rendering (the sandbox renders WebGL in software).
- Google sign-in end to end (no Google account, and it is disabled on staging).
