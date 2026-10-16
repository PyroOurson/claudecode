# Building the gameplay site from source

Everything needed to rebuild `index.html` and `gameplay/` at the repo root lives in this folder.

## Setup (once per computer)

1. Copy this folder to `/tmp/gameplay-build` (the scripts use that path):
   `rm -rf /tmp/gameplay-build && cp -r ClaudeScripts/gameplay-site/source /tmp/gameplay-build`
   On Windows (Git Bash) copy it to `C:\tmp\gameplay-build` instead: Python and Node resolve `/tmp/gameplay-build` to `C:\tmp\gameplay-build`, so the scripts work unchanged (in bash write `/c/tmp/gameplay-build`). Run `git config core.autocrlf false` before checking out, because CRLF line endings break `assemble.py` and `build2.py`. Use `python` if `python3` is not available.
2. Install Python 3.9+ and Node.js 18+. For browser tests: `npm i -g playwright && npx playwright install chromium`. `t/lib.js` launches the installed Google Chrome (`channel: 'chrome'`) and loads Playwright from `C:/tmp/pw/node_modules/playwright`; adjust that path on other machines.
3. Round 3 notes for agents: `w/ROUND3.md` (brief, ownership, contracts), `rl/notes/round3.md`, `w/agents_net/API.md`.

## Build

1. Rocket League (joined from `rl/seg/*` and `rl/models/*`):
   `cd /tmp/gameplay-build/rl && python3 -I tools/join.py lead all && cp build/lead_all.js ../w/parts/115_g_rocket-soccer.js`
2. Portal (from `w/parts_orig` + `w/new/*`): `cd /tmp/gameplay-build/w && python3 assemble.py`
3. Encrypted site: `GATE_PASS=<site password> python3 build2.py parts site`
4. Copy `site/index.html` to the repo root and replace the repo's `gameplay/` folder with `site/gameplay/`, then `git ls-files > files.txt`.
5. Copy changed sources back into `ClaudeScripts/gameplay-site/source/` so the repo stays the source of truth.

Keeping the same password and the fixed salt in `w/gate2.js` means browsers that already unlocked the site stay unlocked after updates.

## Where things are

- `w/parts/`: one file per game (or group of games), `_order.json` lists them.
- `w/new/`: portal UI (`tail.js`, `body.html`, CSS), lobby and networking (`net.js`), constants (`consts.js`, Supabase keys go at the end).
- `w/meta_rows.py`: game catalogue (names, genres, players, keywords) and deleted games.
- `w/covers2/`: cover images (`SOURCES.md` lists where official ones came from).
- `w/supabase/`: database schema, setup script and guide.
- `w/agents2/subway/src` + `build.py`, `w/agents2/minecraft/src` + `mk.py`: sources for Subway Surfers and Minecraft (they generate their part files).
- `rl/seg/`: Rocket League code segments, `rl/models/`: 3D models, `rl/notes/`: design notes.
- `w/MASTER.md`, `w/NETBRIEF.md`, `w/agents_net/API.md`, `rl/RLBRIEF.md`: rules, multiplayer API and Rocket League architecture.
- `t/`: browser test tools (`look.js` screenshots a game, `sweep.js` opens games and reports errors).
- `design/`: the owner's home page and party lobby designs.
