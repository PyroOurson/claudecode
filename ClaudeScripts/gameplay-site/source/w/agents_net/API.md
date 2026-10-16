# api.net party API (new/net.js)

Star topology through PeerJS; the party creator's device is the connection hub and relays everything. Every online game uses the same party GUI (design: `.../design/party-lobby.html`).

## Where it shows
- Mounted INSIDE the game: absolutely positioned over the game's root element (`.g-root.gm-<id>`, the `root` of `mount(root, api)`), so it follows the game into fullscreen (real Fullscreen API or the iPhone `pfs` fallback) and theater mode. Only if that root is missing does it fall back to a fixed overlay on the page / fullscreen element.
- Scaled to fit the game area (CSS `zoom`, computed from the root's on-screen size, re-checked on resize, fullscreen change and every 400 ms): wide layout = the design (header, players | live chat, footer) at its real size when it fits, a compact variant when the area is short, never smaller than 62 % (lists scroll instead); a stacked, scrollable phone layout when the area is under 600 px wide or 340 px tall (players, Play, join box, chat). Light / dark follow the site theme.
- While open it swallows keys, pointer and touch events so the game underneath does not react.

## Party GUI (same for every game)
- No first screen: opening online play creates the party at once (the code box pulses until the code exists) and shows the party GUI.
- Header: game name, Leave, party code with Hide/Show (remembered on the device) and invite link button (share sheet, else copy).
- Players: initials avatar, HOST badge + crown on the party leader, "Party leader · You" / "Member", crown button = make that player the host, kick button, empty seats listed up to the party size ("Empty seat", or "Bot" when bots are on). Your own name has a pencil: click to rename (Enter / blur saves, Esc cancels).
- "N / M joined" pill = party size selector (leader only), sizes from the game's list (2..8).
- "Fill empty seats with bots" switch (default off), only when the game passes `bots: true`. Leader can toggle, others see its state.
- Live chat, footer: Play for the leader ("Waiting for N more players…" hint), "Waiting for the host…" for everyone else, and a "Join with a code" box (leaves the current party and joins that one).
- Errors (server busy, bad code, full party) show in the footer with "Try again" and, after a failed join, "Create my own party". Kicked / host left / lost: a message screen with "New party", the join box and Close.
- Name: `localStorage['gameplay:profile'].username` (then `displayName`), else the last lobby rename (`gameplay:netname`), else a stable `Player 1234` (`gameplay:netguest`). The lobby never writes `gameplay:profile`.
- Invite links (`#/<game>/<CODE>`) join straight away. A full party is refused ("Party CODE is full.").

## Opening the party
`const r = await api.net.room({ title, sizes, defaultSize, min = 2, max, bots, name })`
- `sizes`: party sizes the leader can pick, e.g. `[2, 3, 4]` (2..8). Without `sizes`: every size from `min` to `max` (default `max` 4, up to 8). `defaultSize`: preselected size (default: the largest; the last size picked for this game is remembered).
- `min`: players needed before Play is enabled (default 2). With bots on, Play is enabled with any number of players (the leader alone too).
- `bots: true`: the game can fill empty seats with bots, so the GUI shows the bots switch (default off).
- `title`/`text` are accepted; the header always shows the game's catalogue name. `name` is only a fallback when no username exists.
- Resolves for everyone when the leader presses Play: `{ role: 'host' | 'guest', id, players, size, leader, bots }`. `players = [{ id, name, host, leader }]` (hub first, then join order), only real players. `size` = chosen party size. `bots` = true only if the game passed `bots: true` and the leader turned the switch on: then the game adds `size - players.length` bots.
- Resolves `null` if the player leaves (Leave / Close) or the game unmounts.
- Names are sanitized (max 16 chars, no `<>&"'`), still escape them if you put them in innerHTML.

### Old 2-player API
`api.net.lobby(o)` shows the same party GUI with the size fixed to 2 and no bots switch, and resolves `'host' | 'guest' | null` as before; `on('open', role)` fires on Play, the host gets `on('close')` when the friend leaves/drops during a game, `api.net.connected` on the host is true while the friend is connected. Games using it need no changes.

## Host vs leader (host transfer)
- `role: 'host'` is always the **connection hub** (the creator's device): the game authority for messages (`send` broadcast, `sendTo`, `kick`, `leave`/`rejoin` events). If the hub leaves, the party ends for everyone (`close` with `'host-left'`).
- The **party leader** (HOST badge) owns the controls: Play, kick, crown, party size, bots switch. Their requests are validated and executed by the hub. If the leader leaves, leadership returns to the hub. `api.net.leader` = current leader id.

## Back to lobby / rematch
- Hub: call `api.net.room(o)` again while still connected: the GUI reopens with the same code, players, leader, size, bots switch and chat (late joiners are listed). Guests receive `on('lobby')`; their game then calls `api.net.room(o)`. The leader's Play resolves everyone again. (Old `lobby()` guests reopen it automatically.)
- A guest whose party ended calls `api.net.room(o)` and gets a fresh party of their own.

## Live chat
Over the party connection (the hub relays and stamps the time). Last 100 messages kept, shown to late joiners. Max 200 characters, 5 messages per 5 s per player (sender and hub), always escaped. System lines for join, leave, removal, host change and bots on/off (sent as keys with `{name}`, translated on each device).

## State
`api.net.id`, `role`, `code`, `size`, `bots`, `leader`, `players` (`{ id, name, host, leader, ping, away, inGame }`), `rtt` (guest: ping to hub; hub: highest ping of the in-game guests), `connected`, `closeReason` (`'host-left' | 'kicked' | 'lost'`).

## Messages
- `api.net.send(msg)`: hub -> broadcast to all in-game guests (serialized and encoded once for everyone); guest -> hub.
- `api.net.sendTo(id, msg)`: hub -> one guest (returns false if not connected).
- `api.net.on('data', (msg, fromId) => ...)`: only delivered while a game is running (after Play).
- Messages are JSON (reliable, ordered), sent immediately on the data channel. Do not use keys starting with `__` at the top level.

## Fast channel
`api.net.send(msg, true)` and `api.net.sendTo(id, msg, true)` use an extra unreliable, unordered channel (`maxRetransmits: 0`, lowest delay, may drop; stale packets are discarded by sequence number). Use it for frequent state that the next message replaces (positions, inputs); keep events reliable. Falls back to the reliable channel until the fast one is confirmed open.

## Events
- `on('join', p)` hub: someone joined (during a game they wait in the lobby until the next Play).
- `on('leave', p)` hub: a guest left, was kicked, or dropped for more than 12 s. The game decides (e.g. a bot takes the seat).
- `on('rejoin', p)` hub: an in-game guest dropped and came back within 12 s. Resend them a full state snapshot.
- `on('close', reason)` guest: hub gone (`'host-left'`), kicked (`'kicked'`) or connection lost (`'lost'`).
- `on('lobby')` guest: the hub went back to the lobby; call `api.net.room(o)`.
- `api.net.close()` leaves. `api.net.kick(id)` hub only.

Heartbeat every second; a peer silent for 7 s is treated as dropped (guests auto-reconnect for about 16 s, the hub keeps their seat 12 s). Max 8 players.

## Translation (i18n agent)
Every GUI string goes through `gpI18n.t(s)` when `window.gpI18n` exists (falls back to English). Strings with values use placeholders that must stay in the translation: `{n}`, `{m}`, `{code}`, `{name}`:
`{n} / {m} joined`, `{n} players`, `Waiting for {n} more players…`, `Waiting for 1 more player…`, `Joining party {code}…`, `Party {code}`, `Party {code} is full.`, `Party {code} not found. Check the code and try again.`, `Server busy, trying again ({n}/3)…`, `{name} joined the party`, `{name} left the party`, `{name} was removed from the party`, `{name} is now the host`.
Plain strings: Leave, Close, Party code, Hide, Show, Hide party code, Show party code, Share invite link, Copy invite link, Invite link copied, Players, Live chat, Live, Type a message..., Message, Send, Slow down a little…, Join with a code, Join, Party size, Party leader, Member, You, Reconnecting…, Waiting, In game, Make host, Remove, Your name, Change your name, Empty seat, Bot, Waiting for a player…, A bot plays this seat, Fill empty seats with bots, Bots play the empty seats, Only real players play, On · set by the host, Off · set by the host, Bots will fill the empty seats, Bots are off, Joining party…, Connecting to the party…, Could not join this party, Creating party…, Try again, Create my own party, New party, Play, Waiting for the host…, Connection lost. Reconnecting…, A game is in progress. You can start when it ends., A game is in progress. You will join the next one., No messages yet. Say hi!, You were removed from the party, The party was closed, Lost connection to the party, The host removed you from this party. Start a new party or join another one with a code., The host left, so the party ended. Start a new party or join another one with a code., Check your internet connection, then join the party again., plus the connection error sentences in `netWhy`.

## Analytics
If `Ameplay.analytics.track` exists the lobby sends `party_create {game,size}`, `party_join {game}`, `party_play {game,players,size,bots}`.
