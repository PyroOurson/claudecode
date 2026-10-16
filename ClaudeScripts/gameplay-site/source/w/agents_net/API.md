# api.net party API (new/net.js)

Star topology through PeerJS; the party creator's device is the connection hub and relays everything. Every online game uses the same party UI (design: `.../design/party-lobby.html`), shown as a page-level modal (fixed over the whole viewport, dimmed backdrop, moves into the fullscreen element when the game is fullscreen) at the design's exact size (1040px card, 330px chat, 8 player rows), scaled down proportionally when the viewport is smaller, stacked and scrollable below 860px.

## Party UI (same for every game)
1. First screen: game name, **Username** (pre-filled from `localStorage['gameplay:profile'].username`, editable, saved back into that JSON without touching other keys; required before creating or joining), **Create party** (party size chips from the game's `sizes`) and **Join party** (4-character code).
2. Lobby: header with game name + party code box (Hide/Show is purely visual, remembered on the device) + invite link button (share sheet or copy), Players list (initials avatar, HOST badge on the party leader, "Party leader · You" / "Member"), crown button = make that player the host, kick button, "N / M joined" pill (the leader can change the party size there), Live chat, footer Play button for the leader; everyone else sees "Waiting for the host…".
3. Invite links (`#/<game>/<CODE>`) join straight away when a username is saved (otherwise the code is pre-filled and the username is asked first). A full party is refused ("Party CODE is full").

The lobby never adds bots. A game may offer its own explicit "add bots" option (default off).

## Opening the party
`const r = await api.net.room({ title, sizes, defaultSize, min = 2, max, name })`
- `sizes`: party sizes the creator can pick, e.g. `[2, 3, 4]` or `[2, 3, 4, 5, 6]` (2..8). Without `sizes`: every size from `min` to `max` (default `max` 4). `defaultSize`: preselected size (default: the largest; the last size the player picked for this game is remembered).
- `min`: players needed before Play is enabled (default 2).
- `title`/`text` are accepted but the header always shows the game's catalogue name so every game looks the same. `name` is only a fallback when no profile username exists.
- Resolves for everyone when the leader presses Play: `{ role: 'host' | 'guest', id, players, size, leader }`. `players = [{ id, name, host, leader }]` (connection hub first, then join order); only these players are in the match (can be fewer than `size`). `size` = chosen party size, `leader` = id of the party leader.
- Resolves `null` if the player leaves/cancels (connection closed) or the game unmounts.
- Names are sanitized (max 16 chars, no `<>&"'`), still escape them if you put them in innerHTML.

### Old 2-player API
`api.net.lobby(o)` shows the same party UI with the size fixed to 2 and resolves `'host' | 'guest' | null` as before; `on('open', role)` fires on Play, the host gets `on('close')` when the friend leaves/drops during a game, `api.net.connected` on the host is true while the friend is connected. Games using it need no changes.

## Host vs leader (host transfer)
- `role: 'host'` is always the **connection hub** (the creator's device): it stays the game authority for messages (`send` broadcast, `sendTo`, `kick`, `leave`/`rejoin` events). The hub cannot be moved; if the hub leaves, the party ends for everyone (`close` with `'host-left'`).
- The **party leader** (shown with the HOST badge) owns the party controls: Play, kick, crown (transfer), party size. The crown makes another player the leader; their requests are validated and executed by the hub. If the leader leaves, leadership returns to the hub. `api.net.leader` = current leader id; `players[i].leader` marks it.

## Back to lobby / rematch
- Hub: call `api.net.room(o)` again while still connected: the lobby reopens with the same code, players, leader and chat (late joiners are listed too). Guests receive `on('lobby')`; their game must then call `api.net.room(o)`. The leader's Play resolves everyone again. (Old `lobby()` guests reopen it automatically.)
- A rematch without the lobby is just your own game message.

## Live chat
Over the party connection (the hub relays and stamps the time). Everyone in the party sees it, including late joiners (last 100 messages kept). Max 200 characters, 5 messages per 5 s per player (enforced on the sender and the hub), always escaped. System lines for join, leave, removal and host change. Chat keeps working during a match and is shown when the lobby reopens.

## State
`api.net.id`, `api.net.role`, `api.net.code`, `api.net.size`, `api.net.leader`, `api.net.players` (`{ id, name, host, leader, ping, away, inGame }`), `api.net.rtt` (guest: ping to hub; hub: highest ping of the in-game guests), `api.net.connected`, `api.net.closeReason` (`'host-left' | 'kicked' | 'lost'`).

## Messages
- `api.net.send(msg)`: hub -> broadcast to all in-game guests; guest -> hub.
- `api.net.sendTo(id, msg)`: hub -> one guest (returns false if not connected).
- `api.net.on('data', (msg, fromId) => ...)`: only delivered while a game is running (after Play).
- Messages are JSON (reliable, ordered). Do not use keys starting with `__` at the top level.

## Events
- `on('join', p)` hub: someone joined (in a running game they wait in the lobby until the next Play; the hub gets a toast).
- `on('leave', p)` hub: a guest left, was kicked, or dropped for more than 12 s. The game decides.
- `on('rejoin', p)` hub: an in-game guest dropped and came back within 12 s. Resend them a full state snapshot.
- `on('close', reason)` guest: hub gone (`'host-left'`), kicked (`'kicked'`) or connection lost (`'lost'`). Already closed: show your own message.
- `on('lobby')` guest: the hub went back to the lobby; call `api.net.room(o)`.
- `api.net.close()` leaves (guests notify the hub, the hub tells every guest `host-left`). `api.net.kick(id)` hub only (game code).

Heartbeat every second; a peer silent for 7 s is treated as dropped (guests auto-reconnect for about 16 s, the hub keeps their seat 12 s). Max 8 players.

## Fast channel
`api.net.send(msg, true)` and `api.net.sendTo(id, msg, true)` use an extra unreliable, unordered channel (lower delay, may drop or reorder). Use it only for frequent state that the next message replaces; keep events reliable.

## Analytics
If `Ameplay.analytics.track` exists the lobby sends `party_create {game,size}`, `party_join {game}`, `party_play {game,players,size}`.
