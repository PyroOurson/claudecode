# Playtesting and fixing a game

Shared brief for agents that test or improve one game group of the gameplay site (https://gameplaygames.web.app).

## Where things are

- Source of truth: `C:\Users\gabri\source\repos\claudecode\ClaudeScripts\gameplay-site\source` (called `SRC` below).
- One file per game group: `SRC\w\parts\NNN_g_<id>[+<id>...].js`. `SRC\w\parts\_order.json` lists them, `SRC\w\meta_rows.py` holds names and genres.
- Generated parts, never edit the part file directly for these:
  - Subway Surfers (`sky-runner`): edit `SRC\w\agents2\subway\src\*.js`, then `python SRC\w\agents2\subway\build.py`.
  - Minecraft (`blockcraft-3d`): edit `SRC\w\agents2\minecraft\src\*.js`, then `python SRC\w\agents2\minecraft\mk.py`.
  - Rocket League (`rocket-soccer`): edit `SRC\rl\seg\*.js` (models in `SRC\rl\models`), then from `SRC\rl`: `python -I tools/join.py lead all` and copy `SRC\rl\build\lead_all.js` over `SRC\w\parts\115_g_rocket-soccer.js`.
- Portal code (`SRC\w\new\*`, `SRC\w\parts\001_portal.js`) belongs to the lead. Do not edit it. If a fix needs it, write it in your report.
- Reference research (images, docs, audio, numbers) for famous games: `C:\Users\gabri\Desktop\gameplaygames\references\<Game>\` (start with its `README.md` and `docs\`).
- Rocket League notes: `C:\Users\gabri\Desktop\gameplaygames\docs\ROCKET_LEAGUE.md` and `SRC\rl\RLBRIEF.md`. Game quality bar: `SRC\..\GAMES.md` ("Quality bar").

## Rules

- Edit only the files of the game group you were given (plus new files in your own scratch folder). Other agents are editing other games at the same time.
- No comments inside code (owner rule). Match the surrounding style.
- Do not run `assemble.py`, `build2.py`, `deploy.py`, git commit, git push, or anything that deploys. The lead builds, commits and deploys.
- No new external network dependencies. Assets are drawn in code or generated; do not copy the reference images or audio into the game (they are copyrighted, for study only).
- Keep 60 fps on an ordinary laptop, no console errors, keyboard and touch both work, Esc pauses.

## Build a test page and play it

```
cd SRC\w
set GP_PARTS=SRC\w\parts            (Git Bash: GP_PARTS="$PWD/parts")
python minibuild.py C:\tmp\<you>\mini.html <game-id> [<game-id> ...]
```

Use your own folder under `C:\tmp\<you>\` so you never overwrite another agent's files.

`SRC\t\play.js` opens that page in Chrome (Playwright from `C:\tmp\pw`), with a fake signed-in account and the cookie card dismissed:

```
node SRC\t\play.js C:\tmp\<you>\mini.html <game-id> C:\tmp\<you>\shots "[[\"wait\",2000],[\"press\",\"Space\"],[\"wait\",500],[\"shot\",\"a\"]]"
```

Steps: `wait ms`, `press key`, `down key`, `up key`, `click fx fy` (fractions of the game frame), `eval "js"` (prints the result), `shot name`. It prints page errors at the end.

For longer sessions write your own script:

```js
const { open } = require('C:/Users/gabri/source/repos/claudecode/ClaudeScripts/gameplay-site/source/t/play.js');
(async () => {
  const g = await open('C:/tmp/<you>/mini.html', '<game-id>', { viewport: { width: 1280, height: 800 } });
  await g.start();
  // g.page is a Playwright page; g.shot(dir, name) screenshots the game frame; g.frame() gives its box; g.errs collects errors
  await g.close();
})();
```

Look at your screenshots with the Read tool. Compare them to the reference images side by side. `open(..., { mobile: true, viewport: { width: 390, height: 844 } })` tests phones.

## Playing for 10 minutes

"Play for at least 10 minutes" means at least 10 minutes of real in-game time per game, spread over several sessions: start, menus, every mode, losing, winning, restarting, pause, settings, fullscreen, phone size. Drive it with real inputs (keyboard/mouse/touch through Playwright), not only by calling internal functions. Take screenshots often and actually look at them.

## Report

Write `C:\Users\gabri\Desktop\gameplaygames\docs\playtest\<game-id>.md` for each game (or one file per group if you were told so):

1. What you played (minutes, modes, devices).
2. Differences from the real game (if it is a remake), most visible first.
3. Bugs found (steps to reproduce).
4. What you fixed (files, short description).
5. What is left and why (too big, needs portal change, needs a stronger model, etc.).
