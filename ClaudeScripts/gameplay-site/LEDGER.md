# Gameplay Games overhaul: status ledger

Branch `claude/platform-overhaul`. Nothing here is live: the production site, the production database and real users were not touched. Everything marked "verified" was exercised in a real browser against a private staging copy of the platform (a local Supabase stack with the site's full schema, and a build of this branch served locally).

Status words: **Done** (built and seen working), **Partly** (built, verification incomplete), **Not done**, **Blocked** (needs something only the owner can give), **Declined** (will not do, with the reason).

Last updated: see the git log of this file.

## How things were tested

- Staging backend: a local Supabase stack (Postgres, accounts, live updates, storage) with the full `schema.sql` including rounds 16 to 19. Staging build: `t/stage.py`. Local server with the hosting headers: `t/serve.js`.
- Browser tests in `source/t/tests/`, all passing on the final merged build: `load_sequence.js` (4 scenarios), `gate_locked.js` (4), `party.js` (12 scenarios, two browsers), `fixes.js` (7 scenarios), `dm.js` (direct messages, two browsers), `announce.js`, `legal_pages.js`, and `smoke_all.js` (every game in the catalogue opened and started: 168 of 168 without errors).
- Test accounts on staging: `gp_tester`, `gp_tester2` (diagnostics on), ordinary users and an owner.
- Production: read-only. The live page was opened anonymously to observe the load sequence; nothing was written.
- The test browser renders without a graphics card. Two things followed from that and are worth knowing: the site's own one-time graphics probe froze pages for minutes there (fixed, see bug 10), and screenshots of 3D games could not be judged for smoothness.

## Section 8: test account and diagnostics

| Item | Status | How verified |
|---|---|---|
| Diagnostics recorder (errors, console logs, requests and responses, websocket frames, WebRTC connection events and data-channel packets, party connection steps on both sides, inputs, frame rate, load timings, realtime client logs) | Done | Recorded sessions as the staging test accounts, read the events back from the database and in the page. The recorder is how the party and presence bugs below were found |
| Recording only for accounts the owner switches on | Done | The server refuses uploads from any other account (HTTP 403 seen for the owner account); the recorder is switched off on sign-out; typed passwords and session tokens are redacted |
| On-page indicator, download, full packet capture switch | Done | Seen in the page (red REC chip) |
| Diagnostics viewer in the admin dashboard | Done | Sessions list, timeline with filters, "problems only", search, download, delete, and the "Recorded accounts" panel; seen with the sessions of the staging test accounts |
| More analytics, accuracy, useful dashboard | Done | 37 dashboard figures compared with independent hand-written SQL after timed plays, a bounce, errors, a real two-player party and a failed join: 0 differences. Collection was reduced (battery, device counts, city, internet provider and similar are no longer collected). The last batch of every visit used to be stored twice; new events can no longer be duplicated |
| Production test account | Blocked | Only the owner can create one (GOLIVE step 4). Until then nothing has been checked on the real site |

## Section 4: multiplayer, website, functionality

| Item | Status | How verified |
|---|---|---|
| Load sequence: no password flash, no login flash, right page first | Done | `load_sequence.js` and `gate_locked.js`, all scenarios pass (new visitor, signed-out returning, signed-in with fast and slow backend, expired session, locked gate, wrong and right password, reload) |
| Skeleton screens | Done | Gate skeleton matches what comes next; game loading shows the cover, name and a progress bar; legal pages, stats, friends and messages have skeletons |
| First download size | Done | The legal texts (three times longer) now load only when a legal page is opened. The first download is 497 KB compressed, against about 519 KB before this work |
| Party connectivity: two independent routes and a relayed fallback | Done on staging, not testable on real networks from here | `party.js`: normal route; signalling server blocked for the guest (second route, direct link); signalling blocked and WebRTC unavailable (fully relayed: join, chat, game start); host without the signalling server and guest without WebRTC. The TURN relay for strict firewalls needs two secrets on the Cloudflare worker (GOLIVE step 2) and could not be exercised from this sandbox |
| Cancelling connection attempts, refresh and close | Done | `party.js` F (unknown code: clear error after 5.7 s, nothing after a refresh), G (Cancel stops everything at once), H (refresh during a failing join does not resume it), I (guest refresh returns to the same seat), J (host refresh keeps the code, guest reconnects), K (guest closes the tab: shown away at once, seat freed after the refresh allowance), L (guest offline for 9 s reconnects) |
| Public party has no code; no public/private button inside; Join shows available parties | Done | `party.js` A and screenshots: host picks Public, lobby shows "Public" with no code and no switch; "Join a party" lists the available parties with a Join button, plus a box for a private code |
| Public parties vanished from the list after about 10 seconds | Done | Found with the diagnostics (the realtime server closed the channel for exceeding its presence rate limit). Fixed and covered by `party.js` A |
| Online users shown online | Done | Online status now comes from a server heartbeat instead of the live channel that kept being closed. `fixes.js` S7: a friend sees "Playing ..." within one heartbeat and offline after the player leaves; S5: two tabs of one player no longer fight over the status |
| Admin dashboard updates every second | Done | One live call per second (online players and their game, counters, recent errors, party events). Seen with a second browser: game shown after 0.9 s, new sign-up after 0.6 s, tab close after 0.4 s |
| Announcements: no replay, not on login or sign-up | Done | `announce.js`: hidden on login and sign-up (banner and alert), shown once signed in, animated only the first time, not rebuilt on focus, refresh or navigation |
| Login and sign-up: Google button prominent, username picker, 4-character minimum, no warnings | Done | Screenshots at desktop and phone size; live availability with suggestions; server rule checked (`abc` refused, `abcd` accepted). Google sign-in itself could not be exercised (disabled on staging) |
| Rate limits raised; staff exempt on the server; sensitive limits unchanged | Done | On staging through the API: ordinary user stopped at 120 searches a minute (was 40), owner not limited, data export still 5 an hour even for the owner |
| Game covers consistent | Done | All 168 games now have a cover in one format and composition (31 were redrawn from the art already in the repository); full-grid before and after screenshots compared |
| Hidden bugs | Done as far as found | See "Bugs found" and the code review table below |

## Section 5: user experience

| Item | Status | How verified |
|---|---|---|
| Idea box with image and file uploads | Done | Lightbulb in the top bar; five idea types, title, description, up to 4 attachments; "My ideas" with status and staff reply; admin Ideas tab. On staging: all types sent with pictures, PDF, ZIP and text files; wrong types, oversized and empty files refused with clear messages; another user cannot read them |
| Files in messages elsewhere | Done | Direct messages and support tickets accept files (button, drop, paste) with stated limits; downloads verified byte for byte; senders can delete. Party lobby chat stays text only |
| Settings page redesign, useless controls removed | Done | Same window and navigation, now with search, seven grouped sections and a danger zone with typed confirmation. Removed controls and why are listed in the pull request. Every switch was exercised; two existing defects fixed ("Sync now" threw an error; "Download my data" closed the window before its message) |
| No "How to play" under games | Done | Replaced by a compact strip (genre, players, length, your stats) and "More like this"; screenshot |
| First-time student pass | Partly | Login, home, game page, settings, idea box and party flow were walked at desktop and phone size. Not done: Safari, Firefox, real phones |
| Sidebar | Unchanged on purpose | A one-click sidebar was built and then reverted, because the brief says navigation stays the same. It is offered as a suggestion |

## Section 6: legal pages

| Item | Status | How verified |
|---|---|---|
| Terms, Privacy, Cookies about 3x longer | Done | Measured with tags stripped: Terms 5,936 to 18,318 words, Privacy 6,243 to 22,419, Cookies 5,821 to 18,883 |
| Policies match what the code does | Done, with two conditions | A second pass rewrote every passage that described collection or behaviour the code no longer has, and the consent banner now says what is really collected. Two statements depend on owner choices at go-live (deleting old analytics fields, automatic deletion periods): see GOLIVE step 1 |
| Points for a lawyer | Listed in the pull request and final report | |

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
| Action and multiplayer 2D (16 games in 8 files) | Partly | A host tab in the background froze online matches in every game here (the host only ran on animation frames). Fixed in 11 games and proven with two game instances on a delayed fake connection: simulated time stays within 2 percent of real time when the host is visible, hidden, and back, with no double speed and nothing left running after closing; reverted in the mining sandbox where it could not be proven. In the social deduction game, players and bodies were sent to others through walls and the kill sound gave away positions: fixed. `Hardest` proven in head soccer (6 to 0), volleyball (20 to 0) and the tank arena (average best score 4,133 against 2,424); the stick fighter's top level now reacts like a human (150 to 230 ms) and plays level with the old 42 to 91 ms bot; no honest `Hardest` was reached for basketball, the shooter arena or the platform fighter, and none was added. Names taken from the commercial originals were replaced in five games (worm, room, task, gun and class names). Corrupt saves no longer block the survival game or the sandbox. Not done: real two-browser runs, phone and touch checks, performance work
| Small classics (28 listed games: reaction, aim, whack, stack, rhythm, breakout, pong, 2048, slide, memory games, typing, knife throw, falling blocks, bubble pop, gem swap, box pusher, pipes, sudoku, dino run, flap, invaders, maze muncher, minesweeper, snake and others) | Done, with limits | Six bugs fixed (clocks that kept running while paused in minesweeper, the slide puzzle and falling blocks; a sound context never closed in 2048; knife landing that depended on frame rate; unreadable text on phones in whack). Pong `Hardest` never lost a point to a scripted copy of the old top level in 150 matches at 20 to 240 fps, moving no faster than a keyboard player. Rules proven by program: 1,000 minesweeper boards, 240 sudokus with exactly one solution, 1,500 slide shuffles, 26 box-pusher levels, 900 pipe puzzles, 800 gem boards. Four games now redraw only when something changed (canvas work at 144 Hz cut by about 57 percent). Every game soaked with random input at mixed frame rates: no errors, no timers left after closing. Hands-on play at a normal frame rate was not possible here |
| Arcade and sports 2D (19 games) | Partly | `Hardest` added and measured in eight games, all thinking at human speed (150 to 250 ms): pool (84 of 100 games), the tank duel (45 round wins to 24), the snake arena (lives about 40 percent longer, 189 kills to 129), the territory game (about 30 percent more territory, 40 percent fewer deaths), sea battle (60 to 70 percent), the card game (59 percent), air hockey (62 percent of matches after a first, flawed measurement was redone) and the cell arena (weak: 21 percent more mass by geometric mean). These are stronger than the old top level, not "almost unbeatable". None for the hole arena. The card game never sends another player's hand: 92,986 host messages checked. Pinball gives the same score at 30, 60 and 144 fps. No bugs were found in this group; real playthroughs, restarts, phone checks and performance changes were not done |
| Simulation and skill games (16 registered games in 10 files) | Done, with limits | Saves that could crash a game at start fixed in six games (found by feeding each game 15 corrupted saves). Physics moved to a fixed time step in three games. `Hardest` proven in the card battler (49 of 60 against the old top logic at equal card levels), the archery duel (376 of 400) and the football defence (yards per pass down from about 9.8 to 5.8). A sideways-scrolling phone layout fixed in the tower defence game. Rhythm games already judged hits on the audio clock. Nobody played these through by hand. Note: 8 of these 10 files (12 games) are in the repository but not in the site's build list, so they are not live (see decisions) |
| 3D arcade (13 files) | In progress | |
| Catalogue of 200 | Not done: 168 live | See the final report for the choice the owner has to make |

## Bugs found (beyond the list in the brief)

1. Public parties disappeared from the public list after about 10 seconds (presence rate limit). Fixed, tested.
2. The same flaw could drop a user's "online" status. Fixed by moving presence to a server heartbeat, tested.
3. A failed or cancelled party join was resumed after a refresh. Fixed, tested.
4. The gate page's loading skeleton used the "wrong password" shake animation. Fixed.
5. The login card replayed its entry animation and morphed from login to sign-up on first paint. Fixed.
6. `Permissions-Policy` header listed an unknown feature, logging a console warning on every load. Fixed in `deploy.py`.
7. `schema.sql` did not contain `round16_moderation.sql`, and could not be re-run on an up-to-date database at all (it stopped at the first function whose shape had changed). Both fixed; the whole file now applies cleanly on staging.
8. Diagnostics could keep part of a session token, and the password typed for a username login. Fixed before any production use.
9. A refreshed party guest could come back as a second copy of themselves ("name 2") while the old seat lingered. Fixed, tested (`party.js` I).
10. Once per page load the analytics code created a throwaway 3D graphics context and destroyed it synchronously. On machines that draw 3D in software this froze the whole page (measured here: 93 to 147 seconds of no timers, no input, no network handling), which also broke party joins in progress. The probe now runs once per browser, off the main thread, and is cached.
11. "Sync now" in settings threw an error on every click; "Download my data" hid its own result. Fixed.
12. The admin tab bar could not hold more than six tabs. Fixed.
13. Storage rate limits written inside storage policies never took effect (the storage service rolls back its permission probe), so the upload limit for pictures in messages was not enforced. Replaced by limits that count stored files.
14. In several online games a host tab in the background froze or slowed the match for everyone; a refreshed guest could stick on "Connected, waiting". Fixed in the party and word games; the action games are in a second pass.
15. Game-level bugs are listed per group in Section 7.

## Code review of the portal (27 findings from an independent read of the client code)

Status of each. "Verified" means a browser test on staging reproduces the scenario and passes (`source/t/tests/fixes.js`, `party.js`); "Fixed, not exercised" means the code is changed and builds, but no test drives that exact path.

| # | Finding | Status |
|---|---|---|
| 1 | A device with an old save could overwrite a newer cloud save | Verified (`fixes.js` S1) |
| 2 | A second account on the same browser inherited the first one's saves, plays and display name; a deleted account's history went to the next sign-in | Verified (S2) |
| 3 | A party guest could join under the host's id and get leader powers | Verified (S3) |
| 4 | Esc while rebinding a key left capture armed, so the next key pressed in the game was rebound | Verified (S4) |
| 5 | Two tabs double-counted plays and playtime and reverted each other's settings | Fixed, not exercised |
| 6 | A failed or cancelled invite link kept being retried when the lobby was reopened | Fixed, not exercised |
| 7 | Overlapping realtime nudges to the same user were dropped (late messages, typing, read marks) | Verified (`dm.js`) |
| 8 | Message thread refreshes were silently skipped while another was in flight | Verified (`dm.js`) |
| 9 | With a party lobby open, Enter and Esc stopped working in chat, search and settings fields | Verified (`dm.js`) |
| 10 | Two tabs fought over the online status; closing one showed the player offline | Verified (S5) |
| 11 | "Delete my data" wrote data back while the page reloaded | Verified (S6) |
| 12 | The last analytics batch of every visit was stored twice | Fixed on the server; a session re-sent in full produced no duplicates |
| 13 | Timed-out writes were replayed through the relay (duplicate messages, and a possible cause of surprise sign-outs) and uploads were cut at 15 s | Fixed, not exercised |
| 14 | Messages were marked as read while the tab was hidden | Verified (`dm.js`) |
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

## Points for a lawyer

The three documents are honest descriptions of what the site does; they are not legal advice and nothing in them makes the site "impossible to sue". A lawyer should look at these before they go live.

About the site and its operator:

1. Who the operator is. The documents say "a private individual identified on the Service as its creator" and give no legal name or address. If that person is a minor, a parent or guardian may have to be the contracting party and data controller, and data protection and imprint rules may require a name and address.
2. Governing law and courts (Monaco, kept from the old text, with carve-outs for consumers and minors), and the citation of the Monaco data protection law.
3. Minors. Under-13s are excluded with no age check and no parental consent mechanism. Open questions: ages of digital consent, validity of contracts with minors, whether the site counts as directed to children given its school audience, whether an impact assessment is required.
4. Third-party names and artwork. Many games are listed under the titles of commercial games and some covers come from official artwork. The Terms state this plainly and claim no licence; no disclaimer cures it.
5. Consumer and platform rules: liability cap, unilateral changes, termination without cause, deletion after long inactivity (a reserved right, not implemented), no participation in consumer dispute bodies.
6. The licence over submitted ideas is perpetual and free, including from minors, yet users can now delete their ideas.
7. No data protection officer, no EU or UK representative, no Monaco formalities; the policy says so.

About data:

8. Staff can read direct messages, including those of minors (logged once per 30 minutes per conversation), and in-game party text is logged for moderation.
9. Per-account visit summaries and the "at risk of leaving" list in the dashboard are individual-level use of analytics on minors, with no age check.
10. Google Fonts loads before any consent choice, and the location lookup (GeoJS, country and region kept, city and provider discarded in the browser) has no contract behind it.
11. Analytics events held in memory before the consent choice are sent after "Accept".
12. Hiding online status does not hide it from staff; the game name is still sent unless the second switch is also off.
13. Diagnostics on a test account also record what other players in the same party send (packets, chat) and possibly their network addresses.
14. A deleted file's database row goes at once, but the stored copy may persist at the storage provider and in back-ups for an unknown time.
15. Retention: reports, the admin log, ratings, ideas and direct messages have no time limit. The periods the policy states for analytics, chat log, online history and diagnostics are only enforced once automatic deletion is switched on (GOLIVE step 1), and "old values were deleted" is only true once the optional clean-up has run.
16. Bug reports store the full browser identification string.
17. Processors and transfers: Supabase, Google, Cloudflare (the relay sees session tokens), the public PeerJS server, the Open Relay TURN service, GeoJS, Firebase Hosting, GitHub Pages. Whether contracts and transfer safeguards exist for each.
18. The data export leaves out direct messages and file contents.
19. Cookie consent: whether the "functional" items are exempt, the 13-month validity, consent by minors, and the Terms tick-box sharing a notice with the cookie choice.

## Could not test

- Real TURN relays, real NATs, VPNs and school firewalls: this sandbox has no direct UDP or TCP sockets to the internet. The fallback order was tested by blocking the signalling server and WebRTC in the browser.
- The Cloudflare relay `gameplay-api.vitalang.net`: connections from this sandbox are reset before TLS completes, so I could not tell whether it is healthy.
- Safari, Firefox, real phones, real 60 fps rendering (the sandbox renders WebGL in software).
- Google sign-in end to end (no Google account, and it is disabled on staging).
