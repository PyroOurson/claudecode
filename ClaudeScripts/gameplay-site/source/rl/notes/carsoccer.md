# Gameplay layer rebuilt to match car-soccer.com (18 Oct 2026)

car-soccer.com runs RocketSim (Bullet physics) compiled to WASM, plus its own camera kernel in the same WASM, and plain JS for input, rules and replays. I pulled the live bundles (`main-C-oNKXJ9.js`, WASM 598,012 bytes, unchanged since the earlier pass), read the JS, decompiled the camera functions, read their car configs out of WASM memory, and ran their physics and camera headless in Node next to ours with identical inputs (tools in `rl/tools/carsoccer/`). Nothing of theirs is shipped: our sim stays our own JS, the camera is a JS port of their algorithm.

How each value was obtained:
- **code** = read from their JS
- **wasm** = read from the decompiled WASM
- **mem** = read from WASM memory at runtime
- **meas** = measured by running their physics

## 1. Audit: where our values live

| Area | Where |
|---|---|
| Physics, ball, arena, pads, spawns, rules, camera + input tuning | `seg/01_sim.js` → `CFG` (the one config module) and `PHYS` (the two physics bodies) |
| Body list per garage car (visual only + which physics body) | `seg/01_sim.js` `BODIES`, `seg/03_style.js` (extra bodies) |
| Arena visuals | `seg/06_scene.js`, reads `CFG` (unchanged) |
| Camera | `seg/10b_cscam.js` (new kernel), `seg/10_fxa.js` `cameraUpdate` |
| Replay timing | `seg/13_fxvis.js`, main loop gate in `seg/15_fxloop.js` |
| Input bindings and response | `seg/05_state.js` `uiACT` (defaults), `seg/09_ui.js` `uiPadRead` / `readInput` |

## 2. Extracted values

| Name | Value | How |
|---|---|---|
| Tick | 120 Hz fixed, max 12 steps per frame | code |
| Arena | RL 4096 × 5120 × 2048 warped by +48 width (band 1200–1712), −64 length (beyond ±1024), +48 height (band 896–1152) → walls x ±4144, back walls y ±5056, ceiling 2096, corner bevel x+y = 8048 | code |
| Fillets | floor–side 256, floor–back 160, floor–corner 256 (faceted), wall–ceiling ~490, vertical corners ~900 | code (predictor) + earlier meas |
| Goal | mouth 892.755 × 642.775 (inside the unwarped band), depth 880 (back at y 5936), scored when \|ball y\| > 5060.25 + 91.75 = 5152 | code + meas |
| Ball | radius 91.75, rest z 93.65, max speed 6000, max spin 6, drag 0.03 (applied before gravity), restitution 0.6 using the pre-gravity normal speed, no bounce below 10 uu/s, friction 0.35 | mem (radius), meas (rest) |
| Ball–surface contact | contact inside 1.915 uu of a surface, solved from the start-of-tick position, penetration pushed out 0.8× (position only) | meas |
| Gravity | −650 | meas |
| Physics bodies | only two: **default** 121 × 86.3 × 38.8 @ (13.9, 0, 20.825), **flat** 131 × 85.4 × 33.95 @ (9.02, 0, 15.825) | mem |
| Wheels (default) | front (51.5208, ±25.7003) r 12.53 rest 38.835, back (−33.9722, ±29.3003) r 15.03 rest 37.135, connection z 20.825 | mem |
| Wheels (flat) | front (50.6065, ±30.91) r 12.03 rest 34.035, back (−35.0165, ±32.81) r 13.53 rest 33.935, z 15.825 | mem |
| Car rest / spawn height | spawn z 17.02, rests at 17.052 (flat 17.094) | mem, meas |
| Wheel command latency | engine, brake and steer use the command built on the previous tick (input, speed, handbrake level, tyre-slip friction factors); boost, jump, air control are immediate | meas |
| Car–ball contact | found from start-of-tick poses inside 1.855 uu (default) / 1.615 uu (flat), box edges rounded by 2 uu, no restitution, friction 2.0, 10 solver passes; the extra hit impulse is added after integration | meas |
| Car–car | box–box contact up to 4 points, restitution 0.1, friction 0.09; a demo still solves the contact, so the attacker bounces off (2300 → ~1088) | meas |
| Car body–arena | restitution 0.3, friction 0.3, same contact rules as above | meas |
| Throttle, boost, jump, flip, air control, supersonic, bump curves | identical to our existing RocketSim values (confirmed: see table 4) | meas |
| Boost pads | big 100 / 10 s / r 208, small 12 / 4 s / r 144, pickup below z ≈ 168; positions RL × (1.0007, 0.9994), e.g. big (±3586.51, 0), (±3074.15, ±4093.54) | mem, meas |
| Kickoff spawns | (±2049.43, −2558.46), (±256.18, −3837.70), (0, −4605.20); respawns (±2305.61 / ±2689.88, −4605.20) at z 36; kickoff boost 33.3 | mem |
| Match | 5:00, 3 s countdown, clock starts on the first touch after kickoff, at 0:00 play continues until the ball touches the ground; tied → unlimited overtime, next goal wins, overtime clock counts up | code |
| Goal sequence | 3 s celebration with physics running (ball keeps flying into the net, no push on cars), then replay, then kickoff | code + meas |
| Replay | starts 2 s before the scoring team's last touch (or 4 s before the goal, whichever is earlier), at most 10 s back; 0.25× slow motion from 0.25 s before to 0.1 s after that touch, and in the last 0.25 s if a defender was within 200 of the ball; then the 3 s celebration replays; skippable | code |
| Camera defaults | FOV 110, distance 270, height 100, angle −3°, stiffness 0.35, swivel 4, transition 1, invert swivel on, shake off, ball cam on; slider ranges identical to ours | code |
| Camera kernel | follow point smoothed at 6.32/s (max lag 100, 0.001 in ball cam), height offset along the car's up when grounded (2.03/s), distance target = distance + (1 − stiffness) × (velocity·view) × 0.05 (≥ −50) smoothed at 4.14/s; ground mode follows the surface normal (10.46/s) with two rotation smoothers (13.39 and 2.03 × (1 + 2.427 × stiffness)) mixed by wall steepness; air mode turns toward the pivot at min(1, (35 − 25 × speed/2300)/60) per frame; ground/air blend +2/s, −4/s; ball cam 8.59/s, pitch = angle + 0.8 × (elevation − angle) above 4000 units; FOV ramps to +5 × speed/2300 at 25°/s (+10 at 40°/s supersonic); roll −0.1 × car roll; vertical FOV from 16:9 when the screen is portrait | wasm |
| Swivel | look yaw ±130°, pitch ±60° (invert option), 3× faster when returning, pitch clamp ±85° | wasm |
| Mode switch | old and new views eased over 0.5 / transition speed s with a square curve | wasm |
| Kickoff camera | kernel fully reset at every kickoff | code |
| Replay camera ("cinematic", their default) | focus = ball + velocity × (0.3, 0.3, 0.1 vertical) × (0.25 in slow motion); while a touch is still ahead (up to the scoring team's last touch) it is pulled toward that car, also velocity-led, by 0.5 × (1 − distance/1800), height 35% of the way from car to ball; focus smoothed at lerp(0.1, 4, time since the focus car changed, in replay time, capped at 1)/s; after the goal it drifts to centre field (0, 0, 500) at 1/s. Camera on the line from the focus to a base point (4000·m², goal y − side × 9000, 1000), m = clamp(distance of focus from goal line / 9000), at most 1800 + 1000 × slow-motion blend away; horizontal FOV 75 − 50 × blend, blend ramps 0↔1 over 1 s real time; up is +Z; reset when the replay starts | code |
| Gamepad | per-axis deadzone 0.12 with linear rescale, linear response, triggers analog (powerslide / air roll on above 0.15), look stick deadzone 0.3, stick-as-button press at 0.5 | code |
| Air roll logic | Air Roll Left/Right override free roll (roll = right − left, yaw kept); otherwise free roll turns steer into roll and zeroes yaw | code |

## 3. Changelog

- `CFG`: car-soccer arena, ball, pads, spawns, contact constants; new `camK`, `input`, `rules` blocks. `PHYS` holds the two physics bodies; every garage car maps to one by `ph` (its own wheel layout only places the visual model).
- Tick order now follows Bullet: forces and all contacts (ball–arena, car–arena, car–ball, car–car) are solved from start-of-tick poses, then everything integrates, then the extra hit impulse and bumps apply.
- Ball: drag before gravity, contact gap, pre-gravity restitution, 10 uu/s cutoff, 0.8 position correction.
- Car–arena: contact gap, rounded box, restitution from pre-force velocity, 10-pass solve, split position correction.
- Car–ball: per-body gap, rounded box, 10-pass normal + friction solve; extra impulse after integration from start-of-tick data.
- Car–car: box–box contact manifold (up to 4 points), 10-pass solve, bumps measured on start-of-tick velocities; demo tick still solves the contact.
- Wheels: one-tick command latency as above.
- Goals: no explosion push; ball keeps simulating (drawn hidden as before). Fixed a bug where a goal that tied the game at 0:00 ended the match (orange won); it now goes to overtime.
- Camera: new `seg/10b_cscam.js`; `cameraUpdate` uses it for the player car (menus, podium and spectator orbit unchanged). Old follow/demo camera removed.
- Replay: their window, slow motion and aftermath; replays now also run in overtime / at 0:00.
- Replay camera: `fxRpCam` (`seg/13_fxvis.js`) is now a port of their cinematic replay camera (bundle class `S0`, called as `Z.update(...)`; focus slot and slow motion from their replay recorder `Op`). Our three-shot replay camera is gone; the overlay/HUD is unchanged.
- Input: PlayStation defaults, deadzone 0.12, trigger 0.15, look stick, L2 context rule, their air-roll logic, touchpad button readable. Keyboard defaults now theirs: left click boost, right click jump, Shift powerslide/air roll, Q/E air roll, Space ball cam, middle click rear view.
- Controls help text updated to the new defaults.

## 4. Verification (theirs vs ours, same inputs, 120 Hz)

| Test | Theirs | Ours |
|---|---|---|
| Throttle 0→1000 / top speed | 1.000 s / 1410.1 | 1.000 s / 1410.1 |
| Boost 0→1400 / 0→2200 / top | 0.792 / 1.592 s / 2300 | same |
| Coast 1400→0, brake 1400→0 | 2.642 s, 0.408 s (284 uu) | same |
| Turn radius at 500 / 1000 / 1400 / 2300 | 289.2 / 489.2 / 593.1 / 1173.0 | 289.3 / 489.2 / 593.0 / 1172.4 |
| Powerslide yaw rate at 1000 | 2.993 rad/s | 2.990 |
| Jump tap / held / double | 72.2 / 214.9 / 469.1 | 72.2 / 215.0 / 469.2 |
| Front / side flip at 1000 | 1530.2 / 1197.7 | 1530.3 / 1197.7 |
| Air pitch/yaw/roll response | identical to 3 decimals | |
| Ball drop from 1000: bounce peaks | 402.8 / 201 / 131.1 / 106.2 | same |
| Ball roll 1000: speed at 1 / 2 / 5 s | 745.9 / 548.6 / 513.9 | same |
| Ball hit at 500 / 1000 / 1400 / 2300 | 1788.2 / 1900.4 / 1929.9 / 3052.4 | 1788.4 / 1900.7 / 1930.2 / 3052.9 |
| Flat body hits | 1755.5 / 1840.8 / 1894.0 / 3002.7 | 1755.4 / 1840.7 / 1893.9 / 3002.7 |
| Head-on bump at 1200 (victim) | 1464, up 263 | 1463, up 261 |
| Angled bump 1700 @ 1.2 rad (victim, spin) | 1908 / 319, 3.9 | 1906 / 317, 3.9 |
| Demo at 2300 (attacker after) | 1088 | 1088 |
| Pad pickup radius / height edges | small 143–146, big 206–210, z < 168–170 | same |
| Camera, 16 min of random play, 8 seeds | | worst 0.05 uu / one rotator unit |

## 5. Known differences and open points

- **Tumbling landings** (car hitting the floor nose-first or sideways): their first impact tick comes from Bullet adding contact points one per tick against the RL collision mesh; ours resolves all corners at once. Totals over the impact agree; front flip from standstill lands about 1.5% (default) / 3% (flat) differently. Exact parity would need Bullet plus Psyonix's collision mesh.
- **Wall driving**: speed when vertical 1188.6 vs 1194.5 (−0.5%), from our analytic arena surface vs their mesh.
- **Replay camera**: their default cinematic view is ported (verified in `build/harness.html`: slow-motion zoom from the base point, aftermath pull-back, FOV restored after). Their optional "Player view" (V key / button; plays back the scorer's recorded camera, slerped between poses stored every frame) is not ported: it needs a per-car camera kernel running live and a view toggle in the replay HUD.
- **Bots**: theirs are neural-net bots; ours are unchanged.
- **Online play**: not tested after the change; the host is authoritative, so new internal fields are not sent.
- Not ported (outside the brief): their 2D side-view mode, retro mode, training ball controls, second map.
