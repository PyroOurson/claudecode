# Admin dashboard: rating of the current layout (13 November 2026)

This rates the admin dashboard as it is in `source/w/new/admin.js`, `admin.css`, `body.html`, `ideas.js` and `diagui.js` on branch `claude/round-21`, before the redesign of Part 17.3. It was read in the code and checked on the local staging copy (http://127.0.0.1:8090/, owner account, desktop 1440x900 and phone 390x844). Screenshots are in `C:/tmp/gp/p1/cur/` (not in git).

## Scores

| Part | Score | In one line |
|---|---|---|
| Whole dashboard | 5/10 | Rich, live and good-looking, but spread over 7 tabs, 8 Stats subtabs and 10 Player data sections, with tools in the wrong places and nothing kept after a reload. |
| Player card | 4/10 | Has almost everything, but opens under the table, puts the most used actions low on the right, loads messages without being asked, and repeats the same facts three times. |
| Users tab | 6/10 | Search, one filter, 12 sortable columns and live online dots work well; no paging, the table is wider than a 1440 px screen, and filters cannot be combined. |
| Tickets tab | 5/10 | Replying, files, close, reopen and delete work; no search, no filter, no paging, and no link from a ticket to the player. |
| Stats tab | 6/10 | A lot of real data with good charts, but the same numbers appear in several subtabs, there is no filter by game, country or device, and nothing can be exported. |
| Log tab | 4/10 | Four unrelated tools in one tab called "Log": message search, the admin log, player reports and rate limits. Reports that need action are hidden here. |
| Site tab | 6/10 | Clear switches and one save button, but a wall of 168 game chips, a save button covered by the Chat button, and no editor for "What's new". |
| Ideas tab | 7/10 | The best tab: search, two filters, "Show more" paging, a detail view with status, reply and delete, and a badge for new ideas. |
| Diagnostics tab | 6/10 | Does its job well (sessions, event filters, paging, JSON download), but only accounts created in the dashboard can be recorded, and it is a whole top-level tab for a rare tool. |

## Whole dashboard: 5/10

What works:
- Numbers update every second while the tab is open, and the header says "Live · N online" or "Updated 3 s ago".
- The look matches the site: lavender background, purple accent, rounded cards, good empty states and skeletons.
- Most risky actions need a second click ("Click again to confirm"), and every staff action is written to the admin log.

What is hard to find:
- Player reports and rate-limit resets are in the Log tab. Nothing on the Users tab says a report is waiting.
- Message search ("Search all messages") is also in the Log tab, far from the player card where staff read one player's messages.
- Party health and the relay are under Stats, Health and Stats, Parties, not with the other site tools.
- Diagnostics (recording test accounts) is a separate tab, while creating the test account itself is the small "+" button in the Users table header.

What is repeated:
- The six tiles at the top (Accounts, New this week, Active today, Admins, Locked, Open tickets) repeat the Users filters and the Tickets badge on every tab.
- Rate limits appear twice: per player in Log, per limit in Stats, Health.
- Errors appear three times: "Recent errors" in Overview, Stats, Errors, and the error count in each game card.
- Active players appear in Overview (Active today, 7 days, 30 days), again in Players (Today, Last 7 days, Last 30 days), and again in Player data (Stickiness).

What takes too many clicks:
- Banning a player: open the card, scroll past the games, messages and devices, find "Access" as the sixth card in the right column, pick a duration, type a reason, click twice.
- Answering a report: Log tab, scroll past message search and the admin log, find the report, click the player name (which switches to Users and opens the card), then go back to Log to close the report.
- On a phone the tab bar cuts off "Diagnostics" and the Stats subtabs cut off "Errors", "Parties", "Health" and "Player data"; they have to be swiped to be found.

What is missing:
- Paging in the user list (every account is rendered at once).
- Keyboard shortcuts, apart from the arrow keys on the focused tab bar.
- Keeping the selected tab, subtab, filters and sort after a reload (only "Count staff activity" is saved).
- Export to CSV anywhere.
- Device bans and IP bans; a list of current bans.
- A way to flag an existing account as a test account.
- An editor for "What's new" (it is hard-coded in `changelog.js`).
- The all-time peak of players online, with its date (Part 17.1).

## Player card: 4/10

- It opens under the user table, in the page flow. With more than a few users, staff scroll down past the whole table to see it; on a phone the table header stays stuck above it.
- The order does not follow what staff need most. The top shows name, pills and six number boxes (time played, plays, friends, favourite game, account created, last seen). Lock, role, password and sign-out are cards 2 to 5 of the right column, below "Names and email". There is no "Message" button.
- Messages load as soon as the card opens (Direct chat is selected by default). That writes "read the messages of" to the admin log even when staff only wanted to check a ban, and it is where the read-mark bug of Part 17.1 comes from. Messages should only open on purpose.
- "All details" repeats the header and the six number boxes (email, username, display name, last log in, created, password, favourite game, friends, role, locked) in a 17-field grid.
- Missing: friends list, reports against this player and reports they made, IP addresses and how many accounts share them, banning a device or an address, flagging as a test account, switching diagnostics on.
- The danger zone is well separated at the bottom right, asks for the username or email typed, and is disabled for staff and for yourself. After a permanent deletion the card could stay stuck loading (Part 17.1).

## Users tab: 6/10

- Good: search by email, username, name or id; a filter (all, admins, locked, email not confirmed, Google, email and password, online now, active in the last 7 days); a count ("8 of 8 users"); sorting on 11 columns; online dots and "Online now" update live; relative times refresh; rows open with Enter.
- Hard to use: 12 columns do not fit on a 1440 px screen ("Favourite game" is already cut off), and "Password: Set · hidden" takes a column for something rarely needed.
- One filter at a time: "admins who are online" or "locked accounts that signed in with Google" cannot be shown.
- No paging: with thousands of accounts the page would hold thousands of rows.
- Creating an account is a small "+" in the Player column header, easy to miss.
- No filter for test accounts, banned devices or players with open reports.

## Tickets tab: 5/10

- Good: list with "Open", "Closed" and "Needs a reply" pills; the thread with files; reply with Ctrl+Enter; close, reopen and delete (two clicks); live refresh every 6 seconds; badge with the number of open tickets.
- Missing: search, filters (open, needs a reply, closed), sorting by waiting time, paging, and a link from the ticket to the player card (the username is plain text).
- Deleting a ticket only needs two clicks, with nothing typed.

## Stats tab: 6/10

Subtabs: Overview, Players, Games, Performance, Errors, Parties, Health, Player data.

- Good: real charts with hover readouts; 7, 30 and 90 day ranges; "Count staff activity" switch; the live list of who is online; per-game cards with a game picker; sortable tables in Games, Performance, Errors and Parties; Player data is very complete (retention, streaks, funnel, scroll depth, countries, devices, hardware, ads).
- Hard to find: eight subtabs, and Player data alone is a page about 4,500 px tall with ten sections.
- Repeated: active players in three subtabs, errors in two, rate limits again in Health.
- Overview mixes "right now" (live list) with 30-day trends; there is no "today compared with yesterday" and no all-time peak.
- Missing: filters by game, country, device and account type across the data; CSV export; the all-time peak with its date.
- On load the "Trends" area stays blank until it scrolls into view, which looks broken in a screenshot.

## Log tab: 4/10

- It holds four things: "Search all messages", "Admin log", "Player reports" and "Rate limits". Only the admin log is a log.
- The admin log has "Show more" paging but no search, no filter by staff member or action, and no date range.
- Player reports have "Open ticket" and "Close", but no "Ban" or "Open player" button next to them; the player name opens the card on another tab.
- The rate-limit table repeats Stats, Health, with a "Reset limits" button that only exists here.
- The message search input is unstyled (small default font), unlike every other field.
- The floating Chat button covers the "Last 7 days" button of the rate-limit card at 1440x900.

## Site tab: 6/10

- Good: maintenance mode with its message; the announcement banner with style (info or alert) and an end time; turned-off games with search and a message; one "Save and publish" button; the site password switch with a confirmation step and a stale-key warning; change of the site password (owner only).
- Hard to use: 168 game chips in one block; the sticky "Save and publish" button sits over the chips and the Chat button covers half of it.
- Wording: the password state reads "Since Never: anyone who opens the site gets straight in" on staging.
- Missing: an editor for "What's new"; a preview and history of announcements; settings such as how long data is kept.

## Ideas tab: 7/10

- Good: search by words or player; filters by type (new game, improvement, bug, fix or patch, other) and status (new, seen, planned, done, not planned); "Show more" paging; detail with attachments, device, status buttons, reply to the player and delete; opening a new idea marks it seen; a badge counts new ideas.
- Missing: sorting (newest, oldest, most recent reply), and a link from an idea about a game to that game's stats.
- Deleting an idea only needs two clicks.

## Diagnostics tab: 6/10

- Good: list of recorded sessions with problem pills; recording switch per account with a clear warning; inside a session: search, "Problems only", chips per kind of event (errors, logs, requests, WebSocket, data channel, connection, frame rate, inputs, other), paging (first, earlier, later, last), expandable JSON rows, "Download JSON", "Delete session"; "Delete all".
- Missing: search and filters in the session list; switching an existing account to a test account.
- It is a top-level tab for a tool used a few times a month.

## Everything the current dashboard has, by tab

Nothing below may be lost in the redesign.

### Header and frame (every tab)
- "Back to games" link and the page title "Admin dashboard".
- Live status: "Live · N online", "Connecting…", "Updated N s ago", "Paused" (tab hidden), "Offline · updated …", with an explanation on hover.
- Refresh button (reloads users, tickets and the open tab).
- Six tiles: Accounts, New this week, Active today, Admins, Locked, Open tickets. Clicking a tile filters the user list or opens Tickets; Locked and Open tickets are highlighted when above zero.
- Tabs: Users, Tickets (badge: open tickets), Stats, Log, Site, Ideas (badge: new ideas), Diagnostics. Left and right arrow keys move between tabs when the tab bar has focus.
- Live data every second (who is online, errors in the last hour); a full reload every 45 seconds; new accounts appear with a highlight.
- Banner for staff when maintenance mode is on, with a "Site switches" button (from `site.js`).
- Locked-out screen for a locked staff account, with reason, end date, sign out and a support ticket.

### Users tab
- Search by email, username, display name or user id.
- Filter: all users, admins, locked, email not confirmed, Google, email and password, online now, active in the last 7 days, active today (from the tile).
- Count of shown and total users.
- Columns, each sortable: player (initial, online dot, display name, @username), email, last log in, last used website (or "Online now"), log in method, account created, password (set and hidden, or none for Google only), favourite game, friends, role, email confirmed, locked (with time left).
- Create a user ("+"): email, username, display name, password with show button, role (admin and owner only for owners), note for admins; result screen with the details, "Copy log in details" and "Open player card". These accounts become test accounts.
- Keyboard: Enter or Space opens a row, Escape closes the card.

### Player card (inside Users)
- Header: initial, name, @username and email, pills (role, locked with time left, email confirmed or not, "You"), live state (online, away, playing a game, in a party, browsing, hidden from friends, or offline with last seen).
- Six numbers: time played, plays, friends, favourite game, account created, last seen.
- Games played: per game cover, time, bar, plays, best score, last played.
- Messages: Direct, Party chat and In-game; search inside; "Load older"; "Copy all"; a party code opens the whole party chat from 3 hours before to 3 hours after. Opening them is written to the admin log.
- Devices and sessions: per device the system, browser, model, time, region, length; details: VPN or datacenter, time zone, connection, screen, window, pixel density, pointer, touch points, dark mode, graphics card, CPU cores, memory, refresh rate, keyboard layout, controllers, language, arrived from, bot, session length, time looking, games opened, keys, clicks and taps, connection used, events; "Show all".
- All details: user id with copy button, email, username, display name, last log in, last used website, log in method, account created, password, favourite game, friends, role, email confirmed, locked, last game opened, language.
- History: the admin log for this player.
- Names and email: change username, display name and email (each with Save).
- Role: User, Admin, Owner (owners only).
- Password: the password kept for dashboard-created accounts with "Copy log in details"; "Send password reset email"; set a new password.
- Sessions: "Sign out everywhere".
- Access: lock for 1 hour, 24 hours, 7 days, 30 days or permanently, with a reason shown to the player; unlock; "Locked until …".
- Danger zone: type the username or email, then "Delete account forever" (not for staff or yourself).

### Tickets tab
- List of tickets: subject, open or closed, player, "Needs a reply", last activity.
- Thread with messages and files, reply with files, Ctrl+Enter to send, close and reopen, delete ticket, "All tickets" to go back; refresh every 6 seconds.

### Stats tab
- Shared bar: 7, 30 or 90 days; "Count staff activity" switch (saved); "Updated … ago".
- Overview: Live now (count, games being played, list of players online with game, party or browsing; click opens the card); Active today, Active 7 days, Active 30 days (with "with an account"), Hours played, Average minutes per visit; charts: active players per day (active and signed in), peak online per day, sessions per day, hours played per day, new accounts per day, game launches per day, share of playtime; Games card with a game picker (launches with a small chart, players, rounds played, hours, average minutes per visit, accounts with records, errors with a "Working" status, last launch, last error, top players, "Open game"); Devices; Recent errors with "All errors"; Top searches with "no result"; Players coming back (first day, new, next day, within a week).
- Players: live now, today, yesterday, last 7 days, last 30 days, new players, returning players; active and new players per day; session length (sessions, median, longest 10%, sessions per player, with a game, left in 10 s, histogram); peak hours (by hour and a weekday heatmap); weekly retention.
- Games: game launches, real plays, time played, average per launch, bounce rate, rounds finished, new records, favourites; table of every game with search and sorting.
- Performance: site ready, page load, main content shown, average frame rate, slow frames, slow play sessions; page load by device; site ready and page load per day; slowest games; slowest to load; frame rate and loading by game (sortable); by device, browser, system and graphics card.
- Errors: errors, different errors, players affected, sessions with an error; errors per day; errors by game and message (grouped; a row shows who was affected and on which devices); by kind; games with the most errors.
- Parties: parties created, join attempts, joined, connected first try, time to connect, games started; join attempts per day; route used; why a try failed; why players gave up; time to connect by route; parties happening now; table by game.
- Health: right now (route to the server, live updates, server reply time, events and sessions in the last minute, game launches, errors and rate-limit hits in the last 5 minutes); sessions through the relay, requests, failed requests, rejected requests, rate-limit hits, average response, sessions that went offline, games that failed to load; sessions by route per day; failed requests per day; rate-limit hits per day; rate limits by limit; data housekeeping (old data last removed, rows removed, nightly job, test-account and staff events left out, accounts server unreachable at start) with "Remove old data now".
- Player data: Retention (stickiness, back next day, after 7 and 30 days, at risk of leaving, on a streak; funnel; longest streak; top current streaks; players at risk of leaving), Games (measured sessions, quits under 30 s, average session, frame rate, load, inputs, scores, votes), Rocket League (matches finished, win rate, left early, MVP, overtime, boost, per-match averages, by bot level, matches left early, rebound controls), Clicks and behaviour (click rate per slot, scroll depth, click rate per game, time on each page and exits, rage clicks, dead clicks), Where players are (when people play, countries, regions, network, time zones), Devices (system and browser versions, graphics cards, phone models, controllers), Sessions (sessions, measured, median and longest, time looking, idle, with a game, games per session, keys, clicks, taps, tab switches, offline, errors, full screen, length, account state, route, theme, arrived from, first page, how the page was opened, site language, party retries), Screens and display (dark mode, reduced motion, HDR, hover, several screens, contrast, forced colours, reduced transparency, resolutions, window sizes, pixel density, zoom), Hardware (CPU cores, memory, refresh rate, keyboard layouts, CPU architecture, languages, WebGL 2, WebGPU, WebAssembly, bots), Ads (impressions, clicks, click rate, revenue, per 1,000 views).

### Log tab
- Search all messages (2 letters or more): player, kind, recipient, game, party; written to the admin log.
- Admin log: every staff action with icon, staff member, player (opens the card), details and time; "Show more".
- Player reports: when, reported player (locked, number of reports), reason, details with the recent messages, reporter, "Open ticket", "Close".
- Rate limits per player: limit, requests, times at the limit, last time; "Reset limits"; last 24 hours or 7 days.

### Site tab
- Maintenance mode switch and its message.
- Announcement banner: text, style (info, or alert in the middle of the screen), end time.
- Turned-off games: search, one chip per game, message shown on a turned-off game.
- "Save and publish" (every open tab updates at once).
- Site password (owner only): on or off with a confirmation, stale-key warning with "Save the current key", change the password (new and confirm, show buttons).

### Ideas tab
- Search by words or player; filter by type and by status; "Show more".
- Detail: title, type, player (opens the card), date, text, files, device and language it was sent from, status (new, seen, planned, done, not planned), reply to the player, delete.
- Badge with new ideas; opening a new idea marks it seen; unused files are cleaned every 10 minutes.

### Diagnostics tab
- Recorded sessions: player, time, length, events, problem and game pills; "Delete all".
- Recorded accounts: dashboard-created accounts with a recording switch and a warning before it starts.
- One session: header (player, session id, start and end, events), "Download JSON", "Delete session", device line, search, "Problems only", chips per kind of event, paging, expandable JSON per event.
- For the recorded player, the "REC" chip on the site with full packet capture, send now and download (`diagui.js`).
