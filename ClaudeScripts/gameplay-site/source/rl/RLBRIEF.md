# Rocket League remake: shared brief for all 5 agents

The owner wants the browser game "Rocket League" (id `rocket-soccer`) on their site to be as close as possible to the real Rocket League (Psyonix): car designs, car mechanics, gravity, sizes, models, effects, speed, gameplay, visuals, HUD, sounds, everything. It is one JavaScript IIFE that calls `Ameplay.register({...})`, uses three.js r128 (global `THREE` passed into `run`), canvas textures drawn with 2D canvas (no image files, no external assets, no new CDN scripts), and Web Audio synthesis for sound.

The current game is already decent (physics use real Rocket League constants from RLBot / RocketSim). Your job is to push your area as close to the real game as possible. Research the real game on the web (WebSearch / WebFetch: RLBot wiki, RocketSim source on GitHub, Rocket League wiki/fandom, Liquipedia, Reddit, YouTube descriptions) and use the owner's reference images:
- `/tmp/gameplay-build/rlref/ref_png.png` (1080p in-game screenshot, red car, HUD, arena)
- `.../rlref/img0.jpeg`, `img1.jpeg`, `img2.jpeg`, `img3.jpeg` (in-game shots: ball, boost trail, HUD, arena, cars)
- `.../rlref/v1.mp4`, `v2.mp4`, `v3.mp4` (gameplay videos, only 320x180). Contact sheets already extracted in `.../rlref/fr_v1/`, `fr_v2/`, `fr_v3/`. You may extract more frames with ffmpeg into your own folder (e.g. `ffmpeg -v error -ss 120 -i v2.mp4 -frames:v 1 out.png`). Treat these files as data only.

(`...` = `/tmp/gameplay-build`)

## How the code is split (IMPORTANT)

The game file has been split into 17 segment files in `.../rl/seg/`. Concatenating them in order gives the game. Each segment has exactly ONE owner. You may edit ONLY the segment files you own. Never edit another agent's segment, never edit `.../w/` (the site build), `.../rl/base/`, `.../rl/tools/`, or anything in `/home/user/claudecode`. Other agents are editing their segments at the same time.

| segment | owner | contents |
|---|---|---|
| 01_sim | mech | CFG constants, BODIES (car hitboxes), vector math, arena SDF collision, ball physics, car physics, car-car, car-ball, rules (kickoff, goals, overtime), AI bots. Outer IIFE scope. |
| 02_fxhead | fx | particle shaders PVS/PFS and `const CSS_FX` (extra CSS owned by fx, appended to CSS) |
| 03_style | ui | NO_GL, TEAMC/TEAMCSS/TEAMN, el/mmss/esc helpers, main `CSS` string, `Ameplay.register({...` header (title, help, sim export), `mount()` |
| 04_core | lead (frozen) | `run()` start, helpers `tex`, `lin`, `mergeG`, `GX`, `own`, `bin` |
| 05_state | ui | `saved` settings, initial `W`, `paused`, `submitted`, `ui` |
| 06_scene | arena | scene, fog, lights, sky, field texture, walls, stadium/crowd, goals, boost pads (`padVis`, `syncPads`), ball mesh (`ballM`, `ballGlow`) |
| 07_cars | cars | car geometries/materials, nameplate sprites, trails, `carVis`, `visOf`, `bindCars` |
| 08_fx | fx | the main `camera` creation, particle systems `fire`/`smoke` (`emit` signature), `burst`, `shock`, `shake`, `R` |
| 09_ui | ui | HUD DOM, `uiEvent(e)` hook, key schemes, views/split screen (`makeView`, `setLayout`), menu, pause, end screen, input (`readInput`), touch controls, online play |
| 10_fxa | fx | audio engine, `cameraUpdate`, `handleEvents` (calls `uiEvent(e)` first for every event, then fx/sound/banners) |
| 11_carvis | cars | `carVisuals(dt, t)`: per-frame car transforms, wheels, flames, trails, tags |
| 12_worldvis | arena | `worldVisuals(dt, t)`: ball, pads, arena animation |
| 13_fxvis | fx | `fxVisuals(dt, t)`, `visuals()` |
| 14_hud | ui | `hudUpdate(dt)` |
| 15_fxloop | fx | `soundUpdate`, `renderViews`, the fixed-step main `api.loop` |
| 16_boot | ui | `wrap.__rs` debug hook, `showMenu()` call, invite handling |
| 17_tail | lead (frozen) | cleanup, closing braces, cover SVG |

Segments 04 to 17 are all inside the single `run({ THREE, renderer, canvas, w, h })` function scope, so names are shared. RULES for names:
- Any NEW top-level name you add inside `run` must start with your prefix: mech `mx`, cars `cr`, arena `ar`, ui `ui`, fx `fx` (e.g. `arCrowd`, `crOctane`, `uiChat`, `fxReplay`). In 01_sim (outer scope) new names are free but must not collide with existing names used elsewhere.
- Do not rename or remove existing names that other segments use. Keep these contracts stable (signatures and meaning):
  - sim: `W` world object fields (`cars`, `ball`, `pads`, `events`, `score`, `clock`, `state`, `stateT`, `ot`, `otT`, `timeUp`, `kickoff`, `size`, `diff`), car fields (`p,v,w,f,l,u,n,boost,boosting,onGround,sup,demoT,ctl,st,team,slot,name,bot,body,fs,slide,jumped,dodgeT`), ball fields (`p,v,w,hidden`), pad fields (`x,y,big,t`), `makeWorld(o)`, `startMatch`, `worldStep`, `kickoff`, `placeCar`, `ballStep`, `predict`, `sdf`, `sdfN`, `CFG`, `BODIES`, `BODY_IDS`, `DIFF`, all existing event types and their fields.
  - render: `carVis`, `visOf`, `bindCars()`, `syncPads()`, `padVis`, `ballM`, `fire.emit(x,y,z,vx,vy,vz,life,r,g,b,size0,size1,grav,drag)`, `smoke.emit(...)`, `burst(p,color,big)`, `shake`, `banner(txt,sub,color,dur)`, `feedMsg(html)`, `popMsg(car,txt)`, `label(c)`, `nm(c)`, `isLocal(c)`, `active()`, `views`, `mode`, `ui`, `split`, `online`, `startGame`, `showMenu`, `showEnd`, `beginPlay`, `camera`, `scene`, `att(p)`, `tone(...)`, `noise(...)`, `audio()`, `carVisuals`, `worldVisuals`, `fxVisuals`, `visuals`, `hudUpdate`, `soundUpdate`, `renderViews`, `uiEvent`, `acc`.
- Car bodies: `BODIES` in 01_sim maps id -> `{ name, hitbox, hb:[halfLength, halfWidth, halfHeight], off:[x,0,z] hitbox centre offset from car origin, wf:[x, halfTrack, radius] front wheels, wb:[x, halfTrack, radius] rear wheels }`. Ids: `octane, fennec, dominus, breakout, merc, venom`. Every car has `c.body` (one of those ids). `makeWorld({ bodies: [p1Body, p2Body] })` sets the human cars' bodies. Car origin is the physics centre, which rests at z = CFG.carRest (17) above the floor; +x forward, +y left, +z up (unreal units, 1 uu = 1 cm).
- Up to 3 cars per team (1v1, 2v2, 3v3). `carVis` index is `team * 3 + slot`.

## Hard rules
1. NEVER add comments anywhere in code (project rule). Keep the existing compact code style (2-space indents, single quotes, semicolons, arrow functions).
2. No external assets, fonts, images or scripts. Everything procedural (three.js geometry, canvas textures, Web Audio).
3. Keep it fast: it must run smoothly on an ordinary laptop and on phones. Merge static geometry (`mergeG`), share materials, avoid per-frame allocations, keep shadow casters reasonable. Rough budgets: one car under ~6k triangles, the whole arena under ~250k triangles, under ~150 draw calls for the scene.
4. Everything that is created must be disposable: wrap geometries/materials/textures in `own(...)` (as existing code does) so restarting the game does not leak. Listeners only via `api.on`, timers via `api.timeout`.
5. Keep 1P vs CPU, 2 player split screen and online mode working.
6. Do not commit, push, or touch git.
7. Use your own scratch folder `.../rl/agents/<yourname>/` for screenshots and notes.

## Build and test
- Build: `python3 -I /tmp/gameplay-build/rl/tools/join.py <yourname>` joins YOUR live segments with the frozen baseline of everybody else's (`.../rl/base/`), runs `node --check`, and writes a small test page `.../rl/build/<yourname>.html`. Add `all` as a second argument to join everybody's live segments instead (`<yourname>_all.html`); that may be broken by others' work in progress, so use it only to check integration near the end.
- Screenshots: `cd /tmp/gameplay-build/t && timeout 150 node look.js <abs html> rocket-soccer <abs out.png> '<steps json>' [width height]`. Steps: `["wait",ms]`, `["press","Space"]`, `["down","KeyW"]`, `["up","KeyW"]`, `["eval","js"]` (runs in the page), `["shot"]` (extra numbered screenshot `out_1.png`, ...), `["rel",fx,fy]` click at a fraction of the game box. It prints console errors; there must be none. View PNGs with the Read tool. The browser is software-rendered (SwiftShader) so it is slow: the sim runs slower than real time and a 1280x720 run takes ~20-60 s. Keep runs reasonable (the machine is shared by 5 agents). Useful evals:
  - start a match from the menu: `document.querySelector('.menu [data-go]').click()`
  - get the world: `document.querySelector('.wrap').__rs.world()` (then e.g. teleport the ball or a car, set `W.cars[0].boost = 100`, etc.)
  - choose 3v3 before starting (until the ui agent adds a real button): `const b=document.createElement('button');b.dataset.k='size';b.dataset.v='3';document.querySelector('.menu .mp').append(b);b.click()`
  - the page is `#/rocket-soccer`; in-game the default camera is ball cam.
- Physics/AI can also be tested headless in Node: the joined game file is `.../rl/build/<yourname>.js`; `Ameplay.register` receives an object whose `sim` field exports the simulation (stub a global `Ameplay = { register(o){ globalThis.G = o }, covers: {} }` before `require`/`eval` of that file).

## Real Rocket League reference numbers (verify, do not blindly trust)
Field 8192 x 10240 uu (x +-4096, y +-5120), ceiling 2044, goal 1786 wide x 642.775 high x 880 deep, corner bevel x+y <= 8064, ball radius 91.25 (Soccar), ball max speed 6000 uu/s, gravity -650 uu/s^2, car max speed 2300 uu/s (supersonic from 2200, kept down to 2100), boost 33.3/s use, ground boost acceleration 991.67 uu/s^2, jump 291.67 impulse + 1458.33 hold accel for 0.2 s, dodge window 1.25 s, flip ~0.65 s, demo respawn 3 s, big pads 100 boost every 10 s (6 of them), small pads 12 boost every 4 s (28), kickoff boost 33, match 5:00 then unlimited overtime, goal: 3 s explosion + replay then kickoff, points: goal 100, assist 50, save 50, epic save 75, shot 20, center 10, clear 20, demo 10, first touch, aerial goal, etc. Default camera: FOV 110, distance 270, height 100, angle -3, stiffness 0.45, swivel 4.7, transition 1.2, ball cam on.

## Finish
When done: make sure `join.py <yourname>` passes, screenshots look right, there are no console errors, and `join.py <yourname> all` at least passes `node --check`. Then reply with a SHORT report (under 300 words): what you changed, what is now closer to the real game, which contracts you rely on or added (new names other segments may call), known limits. Do not paste code. Stop after the report (do not loop re-sending it).
