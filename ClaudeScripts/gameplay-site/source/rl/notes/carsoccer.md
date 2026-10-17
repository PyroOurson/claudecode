# car-soccer.com vs our 01_sim (phys agent)

## What car-soccer.com is
- Client bundles saved in `rl/agents/phys/cs/` (index.html, main/sim/worker/bots bundles, `*_glue.js` = bundles with the embedded WASM stripped). Embedded WASM modules extracted to `rl/agents/phys/wasm/`.
- `main_0.wasm` (598 KB) is **RocketSim** (ZealanL, MIT licence shipped as `rocketsim.txt`) compiled with Emscripten, i.e. Bullet + RocketSim car/ball code, loading the real Rocket League Soccar collision meshes (`/assets/arena/collision/mesh_0..15.cmf`, saved in `cs/collision/`). The same module also contains their camera kernel (`_v0.._v6`).
- `sim--*.js` + `sim_0.wasm` is a separate 2D side-view mini-mode, not the 3D game.
- I ran `main_0.wasm` headless in Node with my own minimal imports (no site JS executed): `rl/agents/phys/tools/cs.js`, side-by-side harness `tools/dual.js`, experiments `tools/e*.js`, arena probes `tools/probe2.js`, camera probe `tools/cam.js`. All numbers below are measured, 120 Hz, units uu (1 uu = 1 cm), +z up.
- Coordinate note: RocketSim is left-handed (+y is the car's right); our sim is mirrored (+y is the car's left). Steer/yaw/roll signs are mirrored, magnitudes compared.

## Deliberate changes car-soccer made to RocketSim (all copied)
- Arena warped: side walls x = +-4144 (RL 4096), back walls y = +-5056 (RL 5120), ceiling 2096 (RL 2044/2048). Their WASM applies the same warp as their stadium model: x += 48 for |x| > 1712, y -= 64 for |y| > 1024, z += 48 above z 1152. Corner bevel becomes x + y = 8048 (RL 8064). Goal (|x| < 1200) is not warped; goal back at 5936.
- Ball radius 91.75 (RL 91.25), rest height 93.65 (RL 93.15).
- Goal scored when |ball.y| > 5060.25 + 91.75 = 5152 (RL 5124.25 + 91.25).
- Hitboxes: Octane 121 x 86.3 x 38.8, offset (13.9, 0, 20.825); "flat" body = Dominus 131 x 85.4 x 33.95, offset (9.02, 0, 15.825). They only have these two physics bodies (Fennec = Octane hitbox).
- Boost pads, kickoff spawns and demo respawns use slightly scaled RL positions (x * 1.0007, y * 0.9994), e.g. big pads (+-3586.51, 0), (+-3074.15, +-4093.54); kickoff (+-2049.43, -2558.46), (+-256.18, -3837.70), (0, -4605.20); respawn (+-2305.61 / +-2689.88, -4605.20) at z 36.

## Side-by-side (theirs = car-soccer measured, ours = 01_sim after this pass, RL = real game / RocketSim)

| item | theirs | ours now | ours before | RL |
|---|---|---|---|---|
| tick | 120 Hz | 120 | 120 | 120 |
| gravity | -650 | -650 | -650 | -650 |
| side wall x | 4144 | 4144 | 4096 | 4096 |
| back wall y | 5056 | 5056 | 5120 | 5120 |
| ceiling z | 2096 | 2096 | 2044 | 2044 |
| corner bevel x+y | 8048 | 8048 | 8064 | 8064 |
| floor/side-wall fillet | r 265, faceted (8 flat facets per 90 deg) | r 256, 8 facets | r 300 smooth | same mesh as theirs (unwarped) |
| floor/back-wall fillet | r 160 | r 160 (blends to 256 near the corners) | r 300 | 160 |
| floor/corner-bevel fillet | r 256 | r 256 | 300 | 256 |
| wall/ceiling fillet | r ~490 | r 256 (kept: visual arena uses RR) | 300 | ~490 |
| vertical corner rounding (bevel to wall) | r ~900 | r 256 (kept: visual arena uses RR) | 300 | ~900 |
| goal half width / height / depth | 896 / 640 / 880 (back y 5936) | 896 / 640 / 880 | 892.755 / 642.775 / 880 | 892.755 / 642.775 / 880 |
| goal inner edge rounding | ~96, back r ~225, roof slopes 640 -> ~480 behind y 5280 | 100, flat roof (only matters after the goal line) | 110 | as theirs |
| goal line (ball centre) | 5152 | 5152 | 5215.5 | 5215.5 |
| ball radius / rest z | 91.75 / 93.65 | 91.75 / 93.65 | 91.25 / 93.15 | 91.25 / 93.15 |
| ball drop 1000: bounce peaks | 403, 201, 131, 106 | 400, 198, 130, 106 | 399, 198, 130, 106 | |
| ball roll 1000: speed at 1/2/5 s | 746 / 549 / 514 | 746 / 549 / 514 | 746 / 546 / 511 | |
| ball max speed / max spin | 6000 / 6 rad/s | 6000 / 6 | same | same |
| car rest height | 17.05 (Dominus 17.09) | 17.06 (17.10) | 17.03 | 17.0 |
| throttle 0->1000 / max | 1.00 s / 1410 | 1.00 s / 1410 | same | same |
| boost 0->2200 (supersonic) / 2300 | 1.32 s / ~1.41 s | 1.32 / 1.41 | same | same |
| boost use | 33.3/s | 33.3/s | same | same |
| coast 1400->0 | 2.67 s | 2.65 s | same | 525 uu/s^2 |
| brake 1400->0 | 0.33 s, 188 uu | 0.33 s, 180 uu | same | 3500 uu/s^2 |
| turn radius at 1000 / 2300 (full lock) | 433 / 1172 | 430 / 1162 | same | |
| powerslide radius at 1000 | 105 | 106 | same | |
| jump: tap / held 0.2 s / double | 72 / 215 / 446 uu | 72 / 215 / 446 | 72 / 223 (one extra hold tick) / 446 | same |
| front flip at 1000: horizontal speed | 1394.7 | 1394.7 | same | |
| flip rotation (car pitch after 0.25 s) | -59 deg | -59 deg | -45 deg (angular clamp applied before rotating) | |
| air control pitch/yaw/roll accel, damping | identical | identical | same | |
| ball hit at 1000 / 2300 (ball speed after) | 1537 / 3010 | 1534 / 3019 | same | |
| car-car side bump at 1000 (victim / attacker after) | 1467 / 490 | 1458 / 486 | 1121 / 635, victim spun 5.5 rad/s | |
| demo | supersonic, 3 s respawn at z 36; attacker loses ~55% speed (RocketSim artefact) | supersonic, 3 s, z 36, attacker keeps speed (real RL behaviour, not copied) | same | |
| drive up side wall at 1400: speed when vertical | 1188 | 1185 | 1297 | |
| boost pads | big 100 / 10 s / r 208, small 12 / 4 s / r 144, pickup below z ~160 | identical | same | same |
| match rules | 5:00, 3 s countdown, clock starts on first touch, 3 s goal, OT when tied at 0 with ball on ground | same | same | same |

## What I changed in 01_sim
- CFG arena (X 4144, Y 5056, H 2096, corner 8048, ramp 256, goalW 896, goalH 640, goalR 100, postK 24, goalLine 5060.25), ball (91.75 / 93.65), pads, spawns, respawns, padZ (73.05 / 70.05).
- Arena SDF: floor and ceiling fillets are now 8 flat facets per quarter circle like the RL mesh (this is what makes the car lose the right amount of speed going up a wall); back-wall floor fillet radius 160 (`CFG.rampBack`, blended over `CFG.rampBlend`), side/corner 256.
- BODIES: octane / fennec (Octane hitbox) / dominus with car-soccer hitboxes; wheel connection height is now its own field `cz` (rest heights match theirs). `BODY_IDS` = octane, fennec, dominus; unknown ids fall back to octane in `makeCar`.
- Car rotation is integrated with the unclamped angular velocity and clamped afterwards (Bullet order) -> flips rotate as fast as theirs.
- Jump hold: exactly 24 ticks of hold force (float fix).
- Car-car contacts: impulse lever arm now clamped to the overlap patch (Bullet's 4-point manifold behaviour) -> correct momentum transfer, no huge spins.
- Bot kickoff boost-pad lookup no longer depends on exact pad coordinates; bots are stepped in alternating order each tick (removes a small first-car bias).
- Flip vertical damping lasts exactly to 0.65 s (float fix).

## Bot check after the changes (headless, 5:00 matches, `tools/og2.js`, `tools/match.js`)
- All-Star vs Pro: 1v1 50-25 (9-3 wins), 2v2 54-27 (8-4), 3v3 30-9 (8-2). Pro vs Rookie 2v2 73-2 (8-0). No bot stuck > 2 s. 3v3 runs ~65x real time in Node.
- Pro vs Pro 1v1 over 96 seeds: 5.2 goals per match (was 8.1), own goals 5% of goals.

## Camera (for qa, measured from their camera kernel)
- Defaults: horizontal FOV 110, distance 270, height 100, angle -3 deg, stiffness 0.35, swivel speed 4, transition speed 1, invert swivel on, camera shake off, ball cam on by default.
- At rest (car cam or ball cam with ball ahead): camera 269.6 behind the car origin and 114 above it (height 100 + ~14 pivot), pitch -3 deg.
- Speed lag: horizontal distance grows with speed (about 0.0325 s x speed): 286 at 500, 315 at 1400, 344 at 2300.
- FOV widens with speed: horizontal ~111 at 500, ~113 at 1400, ~120 when supersonic (vertical 78.7 / 80.8 / 88.5 at 16:9; base vertical 77.55).
- Car cam: after an instant 90 deg yaw change the camera is at 82 deg after 0.1 s, settled by 0.2 s.
- Ball cam toggle transition: 22 / 50 / 70 / 84 / 90 deg of a 90 deg swing at 0.1 / 0.2 / 0.3 / 0.4 / 0.5 s.
- Vertical follow is soft in the air: when the car rises at 500 uu/s the camera height relative to the car goes 89, 68, 42, 17, -7 ... per 0.1 s (lags ~0.4 s).
- Ball cam with the ball high above (300 ahead, 800 up): camera drops to about car height, 170 behind, pitched up ~51 deg.
- `CFG.cam` now holds { fov 110, dist 270, height 100, angle -3, stiff 0.35, swivel 4, trans 1 } (not read by other segments at the moment).

## Visual follow-ups for whoever owns 06_scene
- The visual arena already follows CFG.X/Y/H/corner/ramp and goal sizes (it reads RR/AX/AY/AC/GW/GH/GB).
- Physics now uses a 160 radius for the floor-to-back-wall ramp (blending to 256 within ~400 uu of the corners), while the visual ramp uses RR = 256 everywhere: up to ~40 uu mismatch at the bottom of the back walls. If you rebuild that ramp, use radius `CFG.rampBack` along the back walls.
- Real RL / car-soccer also has a ~490 radius wall-to-ceiling curve and ~900 radius vertical corners; physics keeps RR there so it matches the current visuals.
