# claudecode

| Folder | Contents |
| --- | --- |
| [`NaoiseGabi/`](NaoiseGabi/) | Our projects: Python games, solvers and art, and `maps-server`, Naoise's public-transport routing engine in Rust. See its README. |
| [`ClaudeScripts/`](ClaudeScripts/) | Everything Claude makes from scratch, including `update.py`. |

## Get the latest version

From inside the `claudecode` folder:

```bash
python ClaudeScripts/update.py
```

It downloads only what changed and removes files that were deleted on GitHub. Your Snake high score and Wordello progress are stored in your home folder, so updating never erases them.

## The website

https://pyroourson.github.io/claudecode/ is **gameplay**, a portal of 100 browser games, 22 of them in 3D. Many are remakes of famous games and carry the original names (Minecraft, Subway Surfers, Rocket League, Tetris and more); the old names are still searchable. Fifteen games can be played by two people, either on the same device or online with a 4-letter room code. The whole site is the single file `index.html` at the root (GitHub Pages needs it there).

What the portal does:

- **Search** looks at names, old names, genres and synonyms, so "shooting" finds the shooters, "car" finds every driving game and "chees" still finds Chess. Results replace the page and show a count.
- **Filters** combine genre, players (solo, two on one screen, online), session length, 2D or 3D, keyboard or touch, and famous remakes. **Sort** by popular, A to Z, newest, most played by you or shortest session. The filters and sort live in the address, so a filtered view can be shared.
- Each game page opens in a large "theater" stage by default (the button next to fullscreen turns it off), counts a play only once you start playing, and suggests similar games by shared tags.
- Search is letter accurate for short input: typing "d" lists only the games whose name starts with D. Longer searches also match old names, genres and synonyms.
- The site asks for a password before anything else. The whole page is encrypted with it, so the games cannot be opened without it. Five wrong tries lock that browser, and a browser that unlocked once stays unlocked.
- Pressing Esc pauses any game (Resume, Restart or back to all games). Online matches are not frozen, so the other players are not affected.
- UNO, Bomberman and Tank Trouble can be played online by up to 4 players and Rocket League by up to 6: one player creates a lobby, the others join with its code or invite link, and the host presses Play. Empty seats are filled by computer players.
- 28 games have a real two-player mode on one screen (Snake, Tetris, Flappy Bird, Galaga and more) and 15 can be played online with a room code. Every other solo game has a "two players, take turns" button on its page: each player plays one run and the higher score wins.
- The 3D models, characters, vehicles and scenery of most games were redrawn with more detail.
- **Rocket League** is rebuilt to follow the real game:
  - Physics come from RocketSim (the open-source Rocket League simulator) and are tuned to match https://car-soccer.com/: four-wheel suspension, real hitboxes, jumps, flips, flip resets, wall and ceiling driving, boost pads, bumps and demolitions, the 0:00 rule and overtime.
  - Three cars (Octane, Fennec, Dominus) and the ball use detailed 3D models in a DFH Stadium style arena.
  - 1v1, 2v2 and 3v3 against Rookie, Semi-Pro or All-Star bots that rotate like real players.
  - The real game's scoreboard and boost meter, Tab scoreboard, quick chat on 1 to 4, goal explosions and goal replays, and the real game's default camera settings.
  - Menus follow the real game: title screen, loading screen, main menu, garage, pause, options, replay card and post-match screen.
  - Model credits (CC BY 4.0, shown in the game under Options > Credits): Octane, Fennec, Dominus and Ball models by fairlight51 on Sketchfab (https://sketchfab.com/fairlight51). Fan-made tribute, not affiliated with Psyonix.

The 3D games download three.js from a CDN the first time one is opened, and online play downloads PeerJS (peer-to-peer WebRTC, using the free PeerJS server only to connect the two players), so both need an internet connection; everything else also works offline if you open `index.html` from the downloaded folder. Scores, settings and saved games are kept in the browser you play in.

When a game is added or removed, update the count in the `<title>`, the meta descriptions and the `<noscript>` list at the top of `index.html`, and add its row to the `ROWS` table (name, genres, players, minutes, keywords) in the portal script. `ClaudeScripts/gameplay-site/deploy.py` warns if the title count no longer matches.

### Publishing on Firebase Hosting

Open Cloud Shell for the project at https://shell.cloud.google.com/?project=claudecode-7e172&show=terminal and run:

```bash
curl -fsSL https://raw.githubusercontent.com/PyroOurson/claudecode/claude/upbeat-bell-n1e54q/ClaudeScripts/gameplay-site/deploy.py | python3 - claude/upbeat-bell-n1e54q
```

It downloads `index.html` from the branch named at the end, writes the Firebase config (every game gets its own address such as `/block-roll`), a sitemap and `robots.txt`, creates the `gameplaygames` site if needed and deploys it to https://gameplaygames.web.app. The repository's default branch is `claude/peaceful-thompson-u1uxhi`, so once this work is merged there, use that name in both places.

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

