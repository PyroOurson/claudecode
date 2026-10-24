# FPS report: every game at the display's rate (240 Hz target)

Measured 2026-10-19 on the owner's PC (240 Hz monitor), Chrome (Playwright `channel: 'chrome'`, headed, 1920x1000 window), full encrypted site built from source in `C:/tmp/gb-fps` (before = repo state, after = this change).

## How it was measured

- Each game is opened from the portal, its start button pressed, the canvas clicked and a few keys pressed; then frames are counted for 3 s while keys keep being pressed. Most games are therefore measured on their title screen or the first seconds of play, not deep into a match.
- avg = frames per second of `requestAnimationFrame` (what `track.js` reports as `fps`); low10 = average fps over the slowest 10% of frames (what `track.js` now reports as `fps10`).
- A second counter wraps the 2D canvas and WebGL draw calls and counts the frames in which the game actually drew. For every canvas game it matched the rAF count (the game draws every frame), so no game renders less often than the display refreshes. Games that do not draw every frame are DOM games or redraw only when something changes (see notes).
- "uncapped" = same run with `--disable-gpu-vsync --disable-frame-rate-limit`: rAF is no longer tied to the 240 Hz display, so the number shows how much CPU headroom a game has above 240 (the GPU may drop some of those frames, so treat it as a main-thread cost indicator). A low10 under ~300 uncapped means occasional frames that take longer than 3-4 ms, which are the ones that would turn into dropped frames on a slower PC.

## Caps found

- Portal (`parts_orig/001_portal.js`, `api.loop`): no cap. It already calls the game on every `requestAnimationFrame`; the `dt` clamp (max 50 ms) only protects against tab switches and never skips frames. No setInterval/setTimeout render loop, no "30 fps on low quality" mode, no fps limiter in the portal or in `tail.js`.
- Games: none of the 78 games limits its frame rate. Every game draws from `api.loop` (rAF); none renders from setInterval, none skips frames. Rocket League, Minecraft and Subway Surfers lower resolution or effects when slow, never the frame rate.
- What did depend on the frame rate (looked or felt different at 240 Hz than at 60 Hz) and was fixed, identical at 60 Hz:
  - Geometry Dash (`dash-cube`): the coin pickup effect advanced 1/60 s per drawn frame, so at 240 Hz it played 4x faster (0.25 s). Now advanced by `dt` in `update`.
  - Agar.io (`cell-feast`): the jelly wobble of the cells moved one step per drawn frame (4x faster and twitchier at 240 Hz). Now stepped at 60 Hz from `dt`.
  - Penalty Kick (`penalty-3d`): the keeper's idle sway was smoothed by a fixed 0.16 per frame (and per physics substep), so it followed its target more tightly at 240 Hz. Now `1 - 0.84^(dt*60)` per frame and `1 - 0.84^(h*300)` per substep (exactly 0.16 at 60 Hz).
- Left as is on purpose: Battleship repaints its per-pixel water texture every 2nd frame (120 Hz at 240 Hz; the rest of the scene is drawn every frame); chess, checkers and reversi redraw the board only when something changes; the CPS test samples its chart every 50 ms; DOM games have no canvas.

## Game speed at 60 vs 240 Hz

Checked for every game with Playwright's fake clock (`page.clock`), a seeded `Math.random` and a fake `requestAnimationFrame` running at 16 ms (62.5 Hz) or 4 ms (250 Hz) frames, the same key presses at the same virtual times, 6 virtual seconds, then the score and the game's text compared (two 16 ms runs to see the run-to-run noise, one 4 ms run). Every game ended in the same state or within the noise of one frame of input timing (for example Chrome Dino 46 / 46 / 46, Subway Surfers 90 / 91 / 94, Traffic Racer `highway-3d` 168 / 169 / 167, Sky Pilot 210 / 211 / 215, Slope 16 / 16 / 16, Tunnel Rush 63 / 64 at 16 ms vs 64 at 4 ms). No game ran 4x faster or slower at 250 Hz: physics and timers already use real `dt` or a fixed step (Rocket League 120 Hz, Geometry Dash 240 Hz, NES-style games 60 Hz, ...). The three changed games were rerun after the change: same results as before, and the changed formulas give exactly the old per-frame values at 60 Hz. No page errors in any run (before, after, vsync, uncapped, speed runs).

## Player data (`w/new/track.js`)

`game_quit` keeps `fps` (raw rAF average over the session, never clamped), `fpsmin` and `fps5` (worst and 5th-percentile one-second buckets), and adds:

- `fps10`: average fps over the slowest 10% of frames of the session (frame times kept in a 0.25 ms histogram, so long sessions cost no memory),
- `fpshi`: best one-second bucket (shows what the display allowed when the game was light),
- `hz`: the display refresh rate measured by `trHz` (median frame interval on the home page, snapped to 60/120/144/165/240/... Hz), remembered for the browser session.

Checked in Chrome: a Chrome Dino session sent `fps 238.48, fpsmin 238.02, fps5 238.02, fps10 215.18, fpshi 240.02, hz 240`. The admin page can compare `fps` and `fps10` against `hz` (or against 240).

## Still slow or worth optimising

- Rocket League online party lobby: 171-175 avg / 48-51 low at 240 Hz while the lobby card (CSS `backdrop-filter: blur(6px)` from `net.js`) sits over the live 3D view. The RL main menu (239/220) and an offline match (239/228) are fine. Fix belongs to the lobby (no blur over WebGL, or a static snapshot behind the card).
- Least headroom above 240 (uncapped avg / low10): Fall Guys `bean-royale` 671-749 / 497-568, Plants vs. Zombies `garden-defense` 693-788 / 128-142 (periodic hitches), Agar.io `cell-feast` ~950 / ~470, Traffic Racer `highway-3d` ~950 / ~650, Slither ~1000 / ~650, Pipe Mania `pipe-connect` ~1150 / ~200 (hitches), Moto X3M ~1330 / ~280 (hitches), Tank Trouble `maze-tanks` ~1600 / ~290 (hitches). On a 240 Hz PC with a slower CPU or GPU these are the first to drop below 240.
- Smoothness (not frame rate): these games draw every frame but their simulation runs at a fixed rate without interpolating between steps, so at 240 Hz the picture only changes 60 (or 100/120) times per second: 60 Hz: Super Mario Bros. `brick-bros`, Space Invaders `invaders`, Pac-Man `maze-muncher`, Flappy Bird, Chrome Dino, Hole.io, Paper.io; 100 Hz: Plants vs. Zombies; 120 Hz: Breakout, Pong, Fruit Ninja, Crossy Road, Helix Jump. Adding render interpolation (draw at `prev + (cur - prev) * acc / STEP`, as Agar.io, Slope, Tank Trouble and Rocket League already do) would make them look truly 240 Hz without changing their speed.

## Table

Sorted by uncapped average (least headroom first). "before"/"after" = 240 Hz display, vsync on.

| game | before avg / low10 | after avg / low10 | uncapped before | uncapped after | cap removed? | notes |
|---|---|---|---|---|---|---|
| garden-defense | 240 / 231 | 240 / 232 | 788 / 142 | 693 / 128 | no cap found | fixed 100 Hz sim, no interpolation; uncapped 10% low 142 fps = periodic hitches |
| bean-royale | 240 / 232 | 240 / 229 | 671 / 497 | 749 / 568 | no cap found | heaviest scene: least headroom uncapped |
| highway-3d | 240 / 233 | 240 / 229 | 979 / 702 | 907 / 611 | no cap found |  |
| cell-feast | 240 / 234 | 240 / 232 | 957 / 474 | 956 / 352 | no cap found, frame-dependent code fixed | CHANGED: cell jelly wobble stepped once per drawn frame (4x faster and twitchier at 240 Hz); now stepped at 60 Hz from dt. Sim interpolated |
| pipe-connect | 240 / 234 | 240 / 233 | 1166 / 204 | 1033 / 191 | no cap found | uncapped 10% low ~200 fps = periodic hitches |
| slither | 240 / 229 | 240 / 232 | 1021 / 650 | 1035 / 692 | no cap found |  |
| moto-stunts | 240 / 235 | 240 / 232 | 1334 / 283 | 1202 / 281 | no cap found | uncapped 10% low ~280 fps = periodic hitches |
| target-range-3d | 240 / 234 | 240 / 233 | 1539 / 910 | 1275 / 820 | no cap found |  |
| rocket-soccer | 175 / 51 | 239 / 223 | 2315 / 1294 | 1277 / 314 | no cap found | the sweep's key presses sometimes open the online party lobby: 171-175 / 48-51 there (lobby backdrop-filter blur over the live 3D view, net.js). Main menu 239/220, offline match 239/228 at 240 Hz, 1603/920 uncapped |
| block-roll | 240 / 234 | 240 / 232 | 1433 / 958 | 1282 / 857 | no cap found |  |
| sea-battle | 240 / 234 | 240 / 234 | 1515 / 761 | 1335 / 706 | no cap found | water texture (per-pixel) repainted every 2nd frame on purpose, scene drawn every frame |
| tunnel-run | 240 / 233 | 240 / 232 | 2194 / 1106 | 1337 / 930 | no cap found |  |
| maze-tanks | 240 / 233 | 240 / 229 | 1609 / 289 | 1416 / 267 | no cap found | fixed 25 Hz sim with interpolation; uncapped 10% low ~290 fps |
| blockcraft-3d | 240 / 232 | 240 / 232 | 1397 / 918 | 1421 / 918 | no cap found |  |
| cps-test | 240 / 234 | 240 / 233 | 1712 / 1116 | 1446 / 970 | no cap found | CPS chart is sampled every 50 ms by design; the click pad is DOM |
| sky-pilot | 240 / 234 | 240 / 232 | 1895 / 988 | 1520 / 827 | no cap found |  |
| tanks-3d | 240 / 234 | 240 / 232 | 1692 / 1120 | 1522 / 982 | no cap found |  |
| hole-city | 240 / 234 | 240 / 232 | 1925 / 1191 | 1562 / 987 | no cap found | fixed 60 Hz sim, no interpolation (motion changes 60x/s) |
| penalty-3d | 240 / 234 | 240 / 229 | 1783 / 1115 | 1596 / 1002 | no cap found, frame-dependent code fixed | CHANGED: keeper idle sway smoothing was a fixed 0.16 per frame/substep (snappier at 240 Hz); now 1-0.84^(dt*60), identical at 60 Hz |
| hoop-flop | 240 / 231 | 240 / 232 | 1933 / 595 | 1624 / 481 | no cap found |  |
| sky-runner | 240 / 229 | 239 / 226 | 1949 / 1060 | 1661 / 943 | no cap found |  |
| minesweeper | 240 / 234 | 240 / 232 | 2082 / 1347 | 1810 / 1134 | no cap found |  |
| archery | 240 / 234 | 240 / 232 | 1982 / 1125 | 1813 / 1126 | no cap found |  |
| brick-bros | 240 / 232 | 240 / 232 | 2333 / 913 | 1993 / 761 | no cap found | fixed 60 Hz NES-style sim, no render interpolation: 240 frames drawn, motion changes 60x/s |
| trivia | 240 / 229 | 240 / 233 | 2346 / 1483 | 2026 / 1308 | no cap found | DOM UI (no canvas) |
| solitaire | 240 / 234 | 240 / 232 | 2526 / 781 | 2073 / 546 | no cap found |  |
| box-pusher | 240 / 234 | 240 / 233 | 2325 / 1439 | 2103 / 1335 | no cap found |  |
| math-sprint | 240 / 234 | 240 / 232 | 2622 / 1642 | 2154 / 1436 | no cap found | DOM UI (no canvas) |
| hoops-3d | 240 / 234 | 240 / 232 | 2510 / 1477 | 2176 / 1310 | no cap found |  |
| sudoku | 240 / 233 | 240 / 233 | 2897 / 1196 | 2263 / 915 | no cap found |  |
| maze-3d | 240 / 234 | 240 / 231 | 2791 / 1337 | 2303 / 1206 | no cap found |  |
| paper-land | 240 / 231 | 240 / 230 | 2701 / 1265 | 2305 / 1020 | no cap found | fixed 60 Hz sim, no interpolation (motion changes 60x/s) |
| cube-3d | 240 / 235 | 240 / 232 | 2831 / 1597 | 2324 / 1422 | no cap found |  |
| number-memory | 240 / 233 | 240 / 233 | 3093 / 1543 | 2339 / 1274 | no cap found | DOM UI (no canvas) |
| road-hopper | 240 / 232 | 240 / 232 | 2663 / 1488 | 2353 / 1263 | no cap found | fixed 120 Hz sim, no interpolation |
| marble-3d | 240 / 234 | 240 / 233 | 2647 / 1478 | 2366 / 1373 | no cap found |  |
| pairs | 240 / 230 | 240 / 232 | 4155 / 1543 | 2393 / 1347 | no cap found | DOM UI (no canvas) |
| true-false | 240 / 234 | 240 / 233 | 4412 / 1776 | 2480 / 1416 | no cap found | DOM UI (no canvas) |
| knife-throw | 240 / 234 | 240 / 234 | 3396 / 1648 | 2525 / 1281 | no cap found |  |
| gem-swap | 240 / 234 | 240 / 233 | 2767 / 1436 | 2549 / 1582 | no cap found |  |
| asteroids-3d | 240 / 234 | 240 / 232 | 2877 / 1448 | 2613 / 1433 | no cap found |  |
| pinball | 240 / 234 | 240 / 234 | 2003 / 1208 | 2631 / 1394 | no cap found |  |
| connect-four | 240 / 234 | 240 / 232 | 2902 / 1547 | 2641 / 1563 | no cap found | DOM UI (no canvas) |
| breakout | 240 / 234 | 240 / 233 | 3086 / 1587 | 2819 / 1514 | no cap found | fixed 120 Hz sim, no interpolation |
| invaders | 240 / 234 | 240 / 233 | 2125 / 1384 | 2867 / 1625 | no cap found | fixed 60 Hz arcade sim, no interpolation (motion changes 60x/s) |
| slope-3d | 240 / 232 | 240 / 233 | 3489 / 1675 | 2931 / 1581 | no cap found |  |
| maze-muncher | 240 / 234 | 240 / 233 | 3385 / 1763 | 2938 / 1551 | no cap found | fixed 60 Hz arcade sim, no interpolation (motion changes 60x/s) |
| bubble-pop | 240 / 233 | 240 / 232 | 3354 / 1627 | 2968 / 1573 | no cap found |  |
| fruit-slice | 240 / 234 | 240 / 232 | 3444 / 1496 | 2991 / 1567 | no cap found | fixed 120 Hz sim, no interpolation |
| tetra | 240 / 233 | 240 / 232 | 3366 / 1667 | 2998 / 1631 | no cap found |  |
| perfect-stop | 240 / 234 | 240 / 233 | 3598 / 1827 | 3006 / 1534 | no cap found |  |
| typing | 240 / 234 | 240 / 232 | 3541 / 1944 | 3062 / 1755 | no cap found | DOM UI (no canvas) |
| 2048 | 240 / 234 | 240 / 232 | 3087 / 1767 | 3109 / 1617 | no cap found | DOM UI (no canvas): nothing to redraw between moves |
| rhythm | 240 / 233 | 240 / 229 | 3427 / 1626 | 3133 / 1537 | no cap found |  |
| stack | 240 / 233 | 240 / 233 | 3455 / 1729 | 3169 / 1660 | no cap found |  |
| air-hockey | 240 / 235 | 240 / 229 | 2178 / 1330 | 3194 / 1652 | no cap found |  |
| dino-run | 239 / 224 | 239 / 226 | 3521 / 1795 | 3196 / 1672 | no cap found | fixed 60 Hz sim (as Chrome original), no interpolation (motion changes 60x/s) |
| snake | 240 / 230 | 239 / 227 | 4012 / 1901 | 3228 / 1647 | no cap found |  |
| helix-3d | 240 / 234 | 240 / 232 | 3633 / 1750 | 3261 / 1681 | no cap found | fixed 120 Hz sim, no interpolation |
| whack | 240 / 234 | 240 / 233 | 2278 / 1459 | 3263 / 1637 | no cap found |  |
| dash-cube | 239 / 227 | 239 / 223 | 3323 / 1218 | 3402 / 1412 | no cap found, frame-dependent code fixed | CHANGED: coin pickup effect advanced 1/60 s per drawn frame (lasted 0.25 s at 240 Hz); now advanced by dt in update. Sim already fixed 240 Hz |
| pong | 240 / 234 | 240 / 233 | 2383 / 1436 | 3408 / 1706 | no cap found | fixed 120 Hz sim, no interpolation |
| piano-tiles | 240 / 231 | 240 / 233 | 3905 / 1809 | 3440 / 1790 | no cap found |  |
| pool | 239 / 228 | 239 / 226 | 4330 / 1825 | 3445 / 1663 | no cap found |  |
| aim | 240 / 233 | 240 / 232 | 4113 / 1920 | 3565 / 1692 | no cap found |  |
| flap-bird | 240 / 228 | 240 / 232 | 4083 / 2040 | 3581 / 1830 | no cap found | fixed 60 Hz sim, no interpolation (motion changes 60x/s) |
| hangman | 240 / 235 | 240 / 233 | 4165 / 2110 | 3648 / 1983 | no cap found | DOM UI (no canvas) |
| last-card | 240 / 234 | 239 / 227 | 4252 / 1974 | 3707 / 1807 | no cap found |  |
| tictactoe | 239 / 225 | 239 / 225 | 5134 / 1897 | 3738 / 1557 | no cap found | DOM UI (no canvas) |
| cookie-baker | 240 / 233 | 240 / 232 | 3709 / 1716 | 3744 / 1947 | no cap found |  |
| slide | 240 / 234 | 240 / 233 | 4490 / 2009 | 3872 / 1826 | no cap found | DOM UI (no canvas) |
| checkers | 240 / 235 | 240 / 232 | 4937 / 2118 | 4256 / 2069 | no cap found | board canvas redrawn only when something changes (dirty flag) |
| chess | 240 / 234 | 240 / 232 | 6275 / 2347 | 4430 / 2041 | no cap found | board canvas redrawn only when something changes (dirty flag), loop itself runs every frame |
| reversi | 240 / 234 | 240 / 232 | 5827 / 2193 | 4454 / 2032 | no cap found | board canvas redrawn only when something changes (dirty flag) |
| chimp-test | 240 / 234 | 240 / 233 | 5608 / 2198 | 4522 / 1985 | no cap found | DOM UI (no canvas) |
| word-guess | 240 / 230 | 240 / 232 | 6263 / 2294 | 4547 / 2086 | no cap found | DOM UI (no canvas) |
| sequence | 240 / 235 | 240 / 234 | 4790 / 2089 | 4833 / 2172 | no cap found | DOM UI (no canvas) |
| reaction | 240 / 235 | 240 / 232 | 5652 / 2411 | 5444 / 2173 | no cap found | DOM UI (no canvas) |
