# Feature ideas for the website

Ideas for https://pyroourson.github.io/claudecode/, the browser games site. Nothing here is built yet. Each idea keeps the site as it is today: plain HTML files, no build step, nothing to install, and everything saved only in the player's browser.

Sizes are rough: **S** is an hour or two, **M** is half a day to a day, **L** is a few days.

## What the site has today

- 12 games, each a single HTML file, sharing one stylesheet.
- Light and dark colours that follow the device setting.
- Best scores and progress saved in the browser for most games.
- Phone controls (swipe, D-pad, flag mode) in Snake, Minesweeper and 2048.

It has no sound, no favicon, no link preview, no way to play offline from the web address, no 404 page, and no way to share a result. Progress lives in one browser and cannot be moved to another.

## Top picks

1. **Best scores on the home page.** Each card shows your best under its name ("Best: 97.4%", "Best tile: 1024"). It reads the scores the games already save. **S**
2. **Daily challenge and a share button.** Everyone gets the same Minesweeper board, Higher or Lower countries, Color Match colours and Typing words each day. At the end, a button copies a spoiler-free result, like Wordle's grid. **M**
3. **Play offline and install on a phone.** A web app manifest and a small service worker cache all 13 pages. The site then works without internet and can be added to the home screen with its own icon. **M**
4. **Wordello in the browser.** A web version of `NaoiseGabi/games/wordello.py`, so the Italian daily word can be played on a phone. **M**

## Whole site

| Idea | What it adds | Size |
| --- | --- | --- |
| Favicon and link preview | A tab icon, and a title, description and picture when the link is pasted into a chat. Today links show as a bare address. | S |
| 404 page | A friendly page with a link home instead of GitHub's error page. | S |
| Random game button | One button on the home page that opens a game at random. | S |
| Light and dark switch | A button that overrides the device setting, remembered for next time. | S |
| Share button on every end screen | Uses the phone's share sheet, or copies the result on a computer. | S |
| Sound with one mute switch | Short synthesized sounds (merge, eat, explode, correct, wrong), made in the browser with no audio files. No game has sound today. | M |
| Stats page | Games played, time played and every best score on one page. | M |
| Save file export and import | Download all progress as a file and load it in another browser, since saves never leave the browser they were made in. | M |
| Accessibility pass | Screen-reader announcements for scores and results, and keyboard play for Element Crafter, Spend a Hundred Billion and Draw a Perfect Circle. | M |
| Tags and search | Filter the home page by quick, puzzle, idle or skill. Worth it once there are more games. | S |

## Existing games

| Game | Idea | Size |
| --- | --- | --- |
| Draw a Perfect Circle | Other shapes: square, triangle, star. | M |
| The Password Gauntlet | Remember how many rules you got through, as a best score. It saves nothing today. | S |
| Spend a Hundred Billion | A printable receipt at the end, and other fortunes to spend. | S |
| Higher or Lower | More categories: country area, mountain heights, city sizes, film box office. | M |
| Element Crafter | A hint button that reveals one combination you have not found yet. | S |
| Cosmic Clicker | Achievements, and a prestige reset that gives a permanent bonus. | M |
| Reaction Time | Keep every session and draw your average over time. | S |
| 2048 | Board sizes 3×3, 5×5 and 6×6, each with its own best score. | S |
| Minesweeper | A custom size, and boards that never need a guess. | M |
| Typing Speed | Punctuation and numbers modes, and a keyboard map of your mistakes. | M |
| Color Match | A daily colour, and feedback that does not rely on telling red from green. | S |
| Snake | Speed levels and a mode where walls wrap around. | S |

## New games

| Game | What it is | Size |
| --- | --- | --- |
| Wordello | The Italian daily word game, in the browser. | M |
| Connections | Find four groups of four, with our own puzzles. | M |
| Stipple your photo | A browser version of `NaoiseGabi/art/voronoi_stippling.py`. The photo never leaves the device. | M |
| Sudoku | Three levels, with notes and mistake checking. | M |
| Memory | Flip cards to find pairs, timed. | S |
| Simon | Repeat a growing sequence of colours and sounds. | S |
| Sliding puzzle | The 15-puzzle, with a move counter. | S |
| Aim trainer | Click targets as they appear, scored on speed and accuracy. | S |
| Nonogram | Fill the grid from the number clues to reveal a picture. | M |
| Falling blocks | A Tetris-style game with phone controls. | L |

## Not a fit for GitHub Pages

- **Global leaderboards** need a server to store everyone's scores. GitHub Pages only serves files, so scores stay per browser.
- **maps-server routes** need the Rust server running. Its demo page is proposal F14 in `NaoiseGabi/maps-server/docs/proposals/F14.md`, and it would be served by maps-server itself, not by this site.
