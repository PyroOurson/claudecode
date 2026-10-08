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

https://pyroourson.github.io/claudecode/ is a little website of browser games. `index.html` at the root is its home page (GitHub Pages needs it there); the games and their shared stylesheet live in `ClaudeScripts/hello-page/`:

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

Scores and progress are saved in the browser you play in. To play offline, open `index.html` from the downloaded folder.
