# Building a new game for gameplay

Shared brief for agents creating wave 1 games. Read `PLAYTEST.md` in this folder first: it covers paths, rules, the mini build and the Playwright harness. Everything there applies here too.

## The owner's standard (quoted)

"Every time you CREATE A GAME, you MUST pay as much attention as you did for ROCKET LEAGUE. IT MUST BE PROFESSIONAL, EXACT AND HIGH QUALITY. A game should never be a prototype or a low quality game just because it is less famous or a RECREATION. If told to recreate a game already existent you should pay attention to every detail to make it as similar as possible."

"If some of them COULD be multiplayer then IMPLEMENT it. This includes card games, 2D games, 3D games, etc. IF A GAME IS NOT MADE TO BE MULTIPLAYER DON'T JUST TRY TO FORCE IT."

In practice:
- **Exact rules.** Use the official rules, scoring and edge cases. Look up the real rules if unsure; WebSearch/WebFetch are fine for reading rules and looking at screenshots.
- **The real look and feel.** Layout, colours, card and table art, piece designs, animations (deal, flip, slide, capture, win), sounds (generated with WebAudio), menus, a game over/win screen, restart, settings where the real game has them.
- **Good computer opponents** at several difficulties wherever the real game has opponents.
- **Online play** through `api.net.room` (see `SRC\w\agents_net\API.md`) for any game people play together:
  - The party leader can fill empty seats with bots (`bots: true`).
  - Host-authoritative: the hub runs the rules, guests send intents, and hidden information (other players' hands) is never sent to guests who should not see it.
  - Handle join, leave, rejoin snapshots, rematch and back to lobby.
  - Solo vs bots stays available.
  - No same-screen two-player modes.
- **Invite links and refresh.** At mount, if `api.net.invite` is truthy, go straight into online play and call `api.net.room(o)`. That covers invite links and refresh recovery: it is `'NEW'` for a restored host and the code for a guest. Existing online games such as `097_g_last-card.js` show the pattern.
- **Host refresh resumes the game.** The hub saves the full game state to sessionStorage after every action, keyed by party code. When the host comes back (`api.net.invite === 'NEW'`, same code) and the guests rejoin, offer "Resume game" right after Play, restore the state and send snapshots. `225_g_monopoly.js` shows one way to do it.
- **Devices and performance.** Keyboard, mouse and touch (phones 390x844 and tablets). Fits the normal frame, theater mode and fullscreen. 60 fps, no console errors, Esc pauses (portal) unless the game is online.
- **No external assets.** All art is drawn in code (Canvas/SVG/CSS) or three.js (`api.gl`); never copy copyrighted images or audio.

## Your files

- You own exactly one part file, named in your task: `SRC\w\parts\<NNN>_g_<id>[+<id>...].js`. Create it. It already has an entry in `_order.json` and catalogue rows in `meta_rows.py` (name, genres, players). Do not edit those; if a row should change, say so in your report.
- Structure: copy the pattern of existing parts. The file is one IIFE `(() => { 'use strict'; ... })();` calling `Ameplay.register({ id, title, category, blurb, help, better, format, width, icon, css, mount(root, api) {...} })` once per game. CSS is scoped under `.gm-<id>`. Multi-game files may share helpers inside the IIFE.
- Learn the game API from the portal: `SRC\w\parts_orig\001_portal.js`, lines about 60 to 520 (`register`, the `api` object: `score`, `submit`, `overlay`, `on`, `timeout`, `interval`, `loop`, `gl`, `sfx`, `net`, `colors`...).
- Good examples to read:
  - `097_g_last-card.js`: UNO, cards, online up to 8 with bots, host-authoritative hidden hands.
  - `013_g_tictactoe+connect-four+lights-out.js`: polished 2D board game with online play.
  - `037_g_chess+checkers+reversi.js`: board games with AI levels.
  - `103_g_maze-tanks.js`: real-time online.
  - `091_g_hoop-flop.js`: 2D physics with online.
  - `053_g_bean-royale.js`: 3D with three.js.
  - Rocket League (`SRC\rl\seg\*`): the quality bar for 3D.
- No comments in code. Scratch folder: `C:\tmp\ng-<your task key>\`.

## Testing

- Mini build: `cd SRC\w` then `GP_PARTS="$PWD/parts" python minibuild.py C:/tmp/ng-<key>/mini.html <id> [<id>...]`.
- Solo: `node SRC\t\play.js ...` or your own script using `require('.../t/play.js').open(html, id, opts)`.
- Online: open 2 or more contexts in one script with `{ peer: true, name: 'Ann' }`, `{ peer: true, name: 'Bob' }`, and so on (real PeerJS cloud). In one context start online play and read the party code from the lobby. Join from the others with the code box or by navigating to `#/<id>/<CODE>`. Have the leader press Play, then play a full game through to the end. Also test a guest leaving mid-game, a guest refreshing, and rematch. Keep runs short and close browsers; about 12 agents share the machine.
- Play each game for at least 10 minutes of real in-game time with real inputs. Look at your screenshots and compare them to the real game.

## Report

Write `C:\Users\gabri\Desktop\gameplaygames\docs\newgames\<id>.md` per game:
1. What it includes (rules and variants, modes, AI levels, online sizes).
2. What you tested, solo and online.
3. Known gaps vs the real game.
4. Any catalogue row change you suggest.

Final message: at most 12 lines.
