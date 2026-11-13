# Game quality pass: shared brief

You are improving a group of games on "gameplay" (Gameplay Games, https://gameplaygames.web.app), a browser gaming portal with about 170 games, an account system and online parties. The owner's top priority is game quality. Several agents work at the same time, each on its own games, each in its own git worktree of the repo.

`SRC` below means `ClaudeScripts/gameplay-site/source` inside your worktree.

## What you may edit

- Only the part files named in your task: `SRC/w/parts/NNN_g_<id>[+<id>...].js` (one file holds one or several games; each calls `Ameplay.register({ id, title, mount(root, api) { ... } })`).
- Generated parts are edited through their sources, then regenerated:
  - Subway Surfers (`sky-runner`): `SRC/w/agents2/subway/src/*.js`, then `python3 SRC/w/agents2/subway/build.py`.
  - Minecraft (`blockcraft-3d`): `SRC/w/agents2/minecraft/src/*.js`, then `python3 SRC/w/agents2/minecraft/mk.py`.
  - Rocket League (`rocket-soccer`): `SRC/rl/seg/*.js`, then from `SRC/rl`: `python3 -I tools/join.py lead all` and copy `SRC/rl/build/lead_all.js` over `SRC/w/parts/115_g_rocket-soccer.js` (convert CRLF to LF when copying).
- Never edit the portal (`SRC/w/new/*`, `SRC/w/parts_orig/*`), other agents' games, the repo-root `index.html` or `gameplay/`. If a fix needs a portal change, describe it in your report.
- Never add comments inside code (repo rule). Match the surrounding style. No new external network dependencies; art is drawn in code.
- Do not run `build2.py`, `stage.py`, `deploy.py`, and do not push. Commit your work to your worktree branch when done.
- The main page layout of the site must not change. You work inside the game frame only.

## Recreations: where the line is

The master brief `ClaudeScripts/gameplay-site/prompt.md` (Part 3.3) sets the rule, and it wins over anything else in this file: make each game play like the famous game of its kind (rules, systems, controls, speeds, physics, proportions, world generation, menus and interface conventions), and make every asset your own (textures, models, art, sounds, music, map and level geometry, wording). Never download, trace or embed assets from a commercial game, its store pages, wikis or game portals. Traditional games (chess, card games, sudoku, mahjong and so on) follow their standard rules exactly.

## What to do for every game, in this order

1. **Play it for real.** Start, every mode and menu, win, lose, restart, pause (Esc), mute, resize, theater and fullscreen, phone size with touch. Look at your screenshots. Note everything broken, confusing, ugly or slow.
2. **Fix every bug you find.** Console errors, stuck states, broken restart, timers that keep running after the game closes, listeners that leak, input that sticks, layout that overflows on a phone, wrong scores, soft locks, anything that only shows after repeated use (open, play, close, reopen several times).
3. **Feel and presentation.** Responsive input, clear feedback, smooth animation, proper sound effects (WebAudio through `api.sfx` or the game's own synth), readable text, a real start and end screen. Add variety where the game is thin.
4. **Performance.** Target 60 fps on an ordinary laptop and no long frames. This machine renders WebGL in software, so raw fps here is not representative: measure script cost per frame with `g.cost(ms)` (below) before and after, and remove waste: allocations inside the loop, per-frame DOM writes or layout reads, redrawing static layers, rebuilding geometry or materials every frame, unthrottled work while the tab is hidden or the game is paused, physics steps that do not need to run. Never lower visual or gameplay quality to gain speed.
5. **Hardest AI.** If the game has computer opponents, its top difficulty must be labelled exactly `Hardest` and be almost unbeatable for a strong human, by playing well and never by cheating: no reading hidden information (other hands, fog, future random draws), no extra resources, speed or accuracy beyond what the rules give a player, no rubber-banding. Keep the existing lower levels as they are (rename the old top level only if `Hardest` replaces it; otherwise add `Hardest` above it). Perfect-information games: a proper search (alpha-beta, MCTS or a solver) within about one or two seconds per move, without freezing the page (time-slice it or use a Worker created from a Blob). Imperfect-information games: sound probabilistic play (counting, inference from play, simulation over possible hidden states). Real-time games: correct prediction, positioning and decision making, with human-plausible reaction time and the same controls a player has. Prove it: run automated matches of `Hardest` against the previous top level (or a scripted strong player) and report the results.
6. **Online play** (games that use `api.net`): keep the protocol compatible, host-authoritative, hidden information never sent to players who should not see it. If you change netcode, test with two or more browser contexts.

## Tools (Linux, already installed)

- Regenerate the portal parts once (they are not in git): `python3 SRC/w/assemble.py`.
- Mini page with only your games: `python3 SRC/w/minibuild.py /abs/out/mini.html <game-id> [<game-id> ...]` (use a folder of your own under your scratch directory).
- Harness: `SRC/t/play.js`. It serves the page, signs in a fake test account with the backend mocked, dismisses the cookie card and records diagnostics.

```js
const { open } = require('<abs>/SRC/t/play.js');
(async () => {
  const g = await open('/abs/out/mini.html', '<game-id>', { viewport: { width: 1280, height: 800 } });
  await g.start();
  await g.page.keyboard.press('ArrowUp');
  await g.shot('/abs/out/shots', 'name');
  console.log(g.errs, await g.cost(5000), await g.fps(), await g.diag(['err', 'log']));
  await g.close();
})();
```

  - `g.page` is a Playwright page. `g.frame()` gives the game box. `g.shot(dir, name)` screenshots the game. `g.errs` collects page errors.
  - `g.cost(ms)` returns script time per animation frame (`avgMs`, `p95Ms`, `maxMs`) over `ms` milliseconds: the number to compare before and after an optimisation.
  - `g.fps()` and `g.diag(kinds)` read the built-in diagnostics recorder (kinds: `err`, `log`, `fps`, `perf`, `req`, `res`, `in`, `game`, `track`, `toast`).
  - Phone: `open(html, id, { mobile: true, viewport: { width: 390, height: 844 } })`. Online: several `open(..., { peer: true, name: 'Ann' })` contexts.
- Read your screenshots with the Read tool. Keep browser runs short and close browsers: several agents share 4 CPU cores. Never kill processes by name.
- Game API reference: `SRC/w/parts_orig/001_portal.js` (`makeApi`, lines about 60 to 520) and `SRC/w/agents_net/API.md` for online play. Good examples: `097_g_last-card.js`, `037_g_chess+checkers+reversi.js`, `103_g_maze-tanks.js`, `053_g_bean-royale.js`.

## Report (your final message, at most 40 lines)

For each game: what you played and tested; bugs fixed; performance before and after (`g.cost` numbers); the Hardest AI change and the match results that prove it; what is left and why. Then the branch name and commit hash. Report only what you verified by running the game. Say plainly what you did not get to.
