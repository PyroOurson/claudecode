# Multiplayer lobbies: shared contract (net agent + rl agent)

(`...` = `/tmp/gameplay-build`)

The site is "gameplay", 100 browser games in one HTML file built from parts in `.../w/parts/` (`python3 assemble.py` regenerates the portal part `parts/001_portal.js` from `parts_orig/` + `new/*`; `python3 build.py parts out.html` builds the full page; `python3 minibuild.py <abs out.html> <game-id> [<game-id> ...]` builds a small page with the portal and only those games — use that for tests). Online play uses PeerJS (WebRTC, the free PeerJS cloud server for signalling), loaded from a CDN by the portal (`loadPeer`). The game API `api.net` is created by `makeNet(g, add)`, which now lives in `.../w/new/net.js` (assemble.py splices it into the portal). Today it supports exactly 2 players (host + 1 guest) and a 2-player lobby overlay `api.net.lobby({ title, text })`.

Network access is open: real PeerJS tests between two or more headless Chromium pages work (WebRTC on localhost). The test launcher `.../t/lib.js` blocks peerjs and fonts; write your own launcher that serves the local copy `.../t/peerjs-1.5.4.tgz` (extract it into your folder) or lets the CDN through.

## New API (implemented by the net agent in `new/net.js`, must stay backward compatible with the current 2-player API used by 15 games)
- `api.net.room({ title, text, min = 2, max = 4, name })` -> Promise. Shows the lobby overlay: CREATE LOBBY (host gets a 4-character code + invite link + share button) or JOIN with a code. Everyone types a player name (remembered on this device). The lobby lists the players (host first, "(you)" marker, ping), lets the host kick a player, and only the HOST has a PLAY button (enabled when at least `min` players are in); guests see "Waiting for the host to start…". Leave/cancel works for everyone. Resolves when the host presses PLAY, for everyone, with `{ role: 'host' | 'guest', id, players }` where `players` is the ordered list `[{ id, name, host }]` (host first, then join order) and `id` is your own id. Resolves `null` if cancelled.
- `api.net.id` (my id), `api.net.players` (current list), `api.net.role`, `api.net.code`, `api.net.rtt` (guest: ping to host), `api.net.connected`.
- Messaging (star topology, the host relays): `api.net.send(msg)` = host: broadcast to all guests, guest: send to host. `api.net.sendTo(id, msg)` (host only). `api.net.on('data', (msg, fromId) => ...)`.
- Events: `api.net.on('join', player)`, `on('leave', player)` (a guest left or dropped; host keeps playing and the game decides, e.g. a bot takes the seat), `on('close')` (guest: host is gone), `on('open', role)` stays for the old 2-player API.
- Invites: opening an invite link (`.../#/<game>/<CODE>`) goes straight into joining that lobby.
- Max 8 players per room. Heartbeat/timeouts like today.

## Games
- net agent: UNO (`parts/097_g_last-card.js`), Bomberman (`parts/059_g_bomb-blast.js`), Tank Trouble (`parts/103_g_maze-tanks.js`) get ONLINE play for up to 4 players through `api.net.room` (empty seats filled by bots where the game has bots), host-authoritative, then rematch/back to lobby.
- rl agent: Rocket League (`.../rl/seg/*`, built with `.../rl/tools/join.py`) gets lobby-based online play for up to 6 players (1v1/2v2/3v3, the host chooses teams or auto-balance, bots fill empty seats) through `api.net.room`, plus fixing the guest-side lag.
