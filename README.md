# claudecode

**Last updated: 24 October 2026.** Everything now lives on a single branch, `mainbranch-claude-code`.

| Folder | Made by | Contents |
| --- | --- | --- |
| [`NaoiseGabi/`](NaoiseGabi/) | Naoise and Gabi | Our projects: Python games, solvers and art, and `maps-server`, Naoise's public-transport routing engine in Rust. See its README. |
| [`ClaudeScripts/`](ClaudeScripts/) | Claude | Everything Claude makes from scratch, one folder per project (list below). |
| `index.html`, [`gameplay/`](gameplay/) | Claude | The gameplay website. GitHub Pages serves it from the root of the repository, so these two stay here. Its source is in `ClaudeScripts/gameplay-site/`. |

### Claude's projects (`ClaudeScripts/`)

| Project | What it is |
| --- | --- |
| [`acra/`](ClaudeScripts/acra/) | ACRA, a lizard-style quadruped robot: FreeCAD model, MuJoCo simulation, a walking policy trained with reinforcement learning and a real-time viewer. Its README has the download and run steps. |
| [`gameplay-site/`](ClaudeScripts/gameplay-site/) | Source, sign-in server, Supabase setup, deploy script and game roadmap (`GAMES.md`) of the gameplay website. |
| [`hello-page/`](ClaudeScripts/hello-page/) | The first browser games page (`index.html`) and its 12 small games, listed at the end of this file. |
| [`maps-demo/`](ClaudeScripts/maps-demo/) | A web page to try `NaoiseGabi/maps-server` in the browser on a map of Monaco: https://pyroourson.github.io/claudecode/ClaudeScripts/maps-demo/ |
| [`maps-server-review/`](ClaudeScripts/maps-server-review/) | A review of `maps-server` with tests that prove each bug and a handoff prompt. |
| [`typing-bot/`](ClaudeScripts/typing-bot/) | A Python script that types typing.com tests automatically (`typer.py`, notes in `HANDOFF.md`). |
| [`update.py`](ClaudeScripts/update.py) | Downloads the latest version of the whole repository (see below). |

## What changed on 24 October 2026

- **One branch, everything re-uploaded today.** All the old branches (`claude/peaceful-thompson-u1uxhi`, `claude/upbeat-bell-n1e54q`, `gh-pages` and four older ones) were combined into `mainbranch-claude-code` and the whole repository was uploaded again as one commit, so every file carries today's date. `maps-demo`, `maps-server-review`, `typing-bot` and the hello-page `index.html` only existed on side branches; they are now back in `ClaudeScripts/`.
- **`update.py`, `deploy.py` and the instructions below now point at `mainbranch-claude-code`.** Run `python ClaudeScripts/update.py` once on each computer to switch over.
- **New project: [`ClaudeScripts/acra/`](ClaudeScripts/acra/).** A lizard robot designed in FreeCAD from reference renders (10 motors, sprawled legs, a sideways-bending spine, five-toed gecko feet), simulated in MuJoCo and trained with PPO to walk, run and turn on command. It includes the trained policy, so it can be watched without training.

## Get the latest version

From inside the `claudecode` folder:

```bash
python ClaudeScripts/update.py
```

It downloads only what changed and removes files that were deleted on GitHub. Your Snake high score and Wordello progress are stored in your home folder, so updating never erases them.

## The website

https://pyroourson.github.io/claudecode/ is **gameplay**, a portal of browser games (the current list and the roadmap are in `ClaudeScripts/gameplay-site/GAMES.md`). Many are remakes of famous games and carry the original names (Minecraft, Subway Surfers, Rocket League, Tetris and more); the old names are still searchable. Online games use a party code so friends on other devices can join. The site is `index.html` at the root (GitHub Pages needs it there) plus the `gameplay/` folder: `index.html` holds the password screen, the menus and the game list, and each game is its own encrypted file in `gameplay/`, downloaded only when it is opened, so the site opens fast and can grow to about 1000 games (see `ClaudeScripts/gameplay-site/GAMES.md`).

What the portal does:

- **Search** looks at names, old names, genres and synonyms, so "shooting" finds the shooters, "car" finds every driving game and "chees" still finds Chess. Results replace the page and show a count.
- **Filters** open as a compact panel grouped by genre, players (solo or online), look (3D or 2D), controls and length, with sorting. A cookie banner, Terms of Service, Privacy Policy and Cookie Policy pages are linked from the footer and settings, and the site records anonymous play statistics locally (launches and time per game) once cookies are accepted, ready to be connected to Supabase.
- Each game page opens in a large "theater" stage by default (the button next to fullscreen turns it off), counts a play only once you start playing, and suggests similar games by shared tags.
- Search is letter accurate for short input: typing "d" lists only the games whose name starts with D. Longer searches also match old names, genres and synonyms.
- The site asks for a password before anything else. The whole page is encrypted with it, so the games cannot be opened without it. Five wrong tries lock that browser, and a browser that unlocked once stays unlocked.
- The password also works on networks that block Supabase (it is copied into the page at each build). On those networks, accounts go through the Cloudflare relay at https://gameplay-api.vitalang.net (see `ClaudeScripts/gameplay-site/server/`). An account is required. Only when the sign-in service cannot be reached by any route does the sign-in screen offer to play without an account, and as soon as it can be reached again the visitor has to log in.
- https://gameplaygames.web.app/check tests every service the site uses from the current network and gives a report to copy.
- Pressing Esc pauses any game (Resume, Restart or back to all games). Online matches are not frozen, so the other players are not affected.
- UNO and Tank Trouble can be played online by up to 4 players and Rocket League by up to 6: one player creates a lobby, the others join with its code or invite link, and the host presses Play.
- Multiplayer is online only: every online game uses the same party screen (party size, a code you can show or hide, your saved username, crown and kick, live chat, Play). Only the party's players are in the match.
- The 3D models, characters, vehicles and scenery of most games were redrawn with more detail.
- **Rocket League** is rebuilt to follow the real game:
  - Physics come from RocketSim (the open-source Rocket League simulator) and are tuned to match https://car-soccer.com/: four-wheel suspension, real hitboxes, jumps, flips, flip resets, wall and ceiling driving, boost pads, bumps and demolitions, the 0:00 rule and overtime.
  - Three cars (Octane, Fennec, Dominus) and the ball use detailed 3D models in a DFH Stadium style arena, with a garage (paint, decals, wheels, boosts, goal explosions, trails, toppers), a 50-tier Rocket Pass, free play training and 5 bot levels.
  - 1v1, 2v2 and 3v3 against Rookie, Semi-Pro, Pro, Veteran or All-Star bots that rotate like real players.
  - The real game's scoreboard and boost meter, Tab scoreboard, quick chat on 1 to 4, goal explosions and goal replays, and the real game's default camera settings.
  - Menus follow the real game: title screen, loading screen, main menu, garage, pause, options, replay card and post-match screen.
  - Model credits (CC BY 4.0, shown in the game under Options > Credits): Octane, Fennec, Dominus and Ball models by fairlight51 on Sketchfab (https://sketchfab.com/fairlight51). Fan-made tribute, not affiliated with Psyonix.

The 3D games download three.js from a CDN the first time one is opened, and online play downloads PeerJS (peer-to-peer WebRTC, using the free PeerJS server only to connect the two players), so both need an internet connection; everything else also works offline if you open `index.html` from the downloaded folder. Scores, settings and saved games are kept in the browser you play in.

When a game is added or removed, update the count in the `<title>`, the meta descriptions and the `<noscript>` list at the top of `index.html`, and add its row to the `ROWS` table (name, genres, players, minutes, keywords) in the portal script. `ClaudeScripts/gameplay-site/deploy.py` warns if the title count no longer matches.

### Publishing on Firebase Hosting

Open Cloud Shell for the project at https://shell.cloud.google.com/?project=claudecode-7e172&show=terminal and run:

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/mainbranch-claude-code/ClaudeScripts/gameplay-site/deploy.py | python3 - mainbranch-claude-code
```

It downloads `index.html` from the branch named at the end, writes the Firebase config (every game gets its own address such as `/block-roll`), a sitemap and `robots.txt`, creates the `gameplaygames` site if needed and deploys it to https://gameplaygames.web.app.

The older hello-page games are still in `ClaudeScripts/hello-page/`:

| Game | File | What it is |
| --- | --- | --- |
| Draw a Perfect Circle | `games/circle.html` | Draw freehand around a dot and get a roundness score. |
| The Password Gauntlet | `games/password.html` | Type a password that obeys more and more ridiculous rules. |
| Spend a Hundred Billion | `games/spend.html` | Buy and sell things until the money runs out. |
| Higher or Lower | `games/higher-lower.html` | Guess which country has the bigger population. |
| Element Crafter | `games/crafter.html` | Combine Water, Fire, Earth and Wind into new elements. |
| Cosmic Clicker | `games/clicker.html` | Idle game: click a planet and buy stardust generators. |
| Reaction Time | `games/reaction.html` | Click the moment the screen turns green. |
| 2048 | `games/2048.html` | Slide and merge tiles to reach 2048. |
| Minesweeper | `games/minesweeper.html` | The classic, in three sizes, with flag mode for phones. |
| Typing Speed | `games/typing.html` | Words-per-minute test. |
| Color Match | `games/color.html` | Memorise a colour, then recreate it with sliders. |
| Snake | `games/snake.html` | Snake for the browser, with swipe and D-pad controls on phones. |

