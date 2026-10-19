# Accuracy audit: real Rocket League vs this remake (round 5, lead's RL agent)

Units: the remake uses Unreal units directly (1 uu = 1 cm = 1 three.js unit, +x forward, +y left, +z up, 120 Hz fixed step). No conversion factor is needed; proportions compare 1:1.

Sources: RLBot wiki "Useful game values" (wiki.rlbot.org/v4/botmaking/useful-game-values, github.com/RLBot/RLBot/wiki/Useful-Game-Values), RocketSim `CarConfig.cpp` (hitboxes, wheels, suspension), RocketSim / Samuel Mish "Rocket League physics" notes (throttle, jump, dodge, air control), Psyonix March 2020 patch notes (camera defaults distance 270, stiffness 0.5), pro settings surveys (FOV 110, distance 260-280, height 90-110, angle -3 to -5, stiffness 0.35-0.5, swivel 4-6, transition 1-1.4), earlier notes `carsoccer.md`, `diff.md`, `models.md`.

Measured values come from `C:\Users\gabri\AppData\Local\Temp\agent-rl\probe.js` (headless sim, same build) and the Playwright scene `C:\tmp\pw\rl_t.js` + `scn.js`.

Priority: H = obvious to a player, M = noticeable side by side, L = detail, OK = matches.

## Physics and rules (01_sim.js)

| feature | real RL | ours (file:line) | measured | gap | prio |
|---|---|---|---|---|---|
| tick rate | 120 Hz | `CFG.hz` 01_sim:7 | 120 | none | OK |
| gravity | -650 uu/s² | `CFG.g` 01_sim:7 | -650 | none | OK |
| arena | 8192 x 10240, ceiling 2044 (new wiki 2048), corner planes x+y = 8064, floor ramp r ~256 (back wall 160, faceted) | 01_sim:8, 14 (facets 8, rampBack 160) | | ceiling 4 uu low vs new wiki value | L |
| goal | half width 892.755, height 642.775, depth 880 | 01_sim:9 | | none | OK |
| ball | r 91.25 (visual 92.75), max 6000, CR 0.6, drag 0.0306, mass 30, max spin 6 rad/s | 01_sim:10, `ballStep` 01_sim:123 | drop from 1000: peaks 399 / 198 / 130 / 106 | none | OK |
| car mass / max ang vel | 180 / 5.5 rad/s | 01_sim:11, 17 | | none | OK |
| throttle | 1600 → 160 uu/s² up to 1400, 0 above 1410, brake 3500, coast 525 | `CFG.drive` 01_sim:25 | 0→1000 in 1.00 s, max 1410 | none | OK |
| boost | +991.67 ground, +1058.33 air, 33.3 /s, min 0.1 s | 01_sim:12-13, 348 | 0→2200 1.59 s (matches integral of throttle+boost curves), max 2300 | none | OK |
| supersonic | from 2200, kept down to 2100 for 1 s | 01_sim:13, 497 | yes at 2200 | none | OK |
| jump | 291.67 impulse + 1458.33 hold for ≤ 0.2 s, min 0.025 s | 01_sim:15 | tap 72 uu, full hold 215 uu | none | OK |
| double jump / dodge | second jump within 1.25 s, 291.67 impulse | 01_sim:15, 399 | full + double ≈ 435-446 uu | none | OK |
| flip | 500 impulse (side x1.9, back x16/15), 0.65 s, torque 260 / 224, z damping 0.35 | 01_sim:16 | front flip at 1000 → ~1400-1450 | none | OK |
| air control | torque 130 / 95 / 400, damping 30 / 20 / 50 | 01_sim:17 | | none | OK |
| steering / powerslide | RocketSim curves | 01_sim:23-26 | turn r 430 at 1000 | none | OK |
| hitboxes | Octane 120.5x86.7x38.7, Dominus 130.4x85.8x33.8, Plank 131.3x87.2x31.9, Breakout 134.0x83.0x32.8, Hybrid 129.5x84.7x36.7, Merc 123.2x79.2x44.2 | octane/fennec/dominus 01_sim:38-40, breakout/merc/venom(Hybrid) 03_style:1-5 | | Plank class was missing (fixed: Paladin, 03_style) | M |
| car-ball hit | Psyonix extra impulse curve | `CFG.hit` 01_sim:27, `carBall` 01_sim:631 | | none | OK |
| bump / demo | demo when attacker supersonic, respawn 3 s | 01_sim:22, 504-512, `carCar` 01_sim:596 | | none | OK |
| boost pads | 6 big (100, 10 s, r 208), 28 small (12, 4 s, r 144), RLBot coordinates | 01_sim:21, 31-32 | | none | OK |
| kickoff | 5 RLBot spawns mirrored per team, 33 boost, 3-2-1-GO, clock starts on first touch | 01_sim:29, 742-772, 955 | | none | OK |
| demo respawns | (±2304 / ±2688, -4608) | 01_sim:30 | | none | OK |
| match | 5:00, unlimited overtime (golden goal), 0:00 waits for ball to touch ground | 01_sim:816, 835 | | none | OK |
| goal sequence | ~3 s celebration, replay, kickoff | 01_sim:870, replay 13_fxvis:93-230 (starts 2.6 s after the goal, sim paused) | | none | OK |
| scoring | goal 100, assist 50, save 50, epic save 75, shot 20, clear 20, centre 10, aerial 25, demo 10 | 01_sim:34 | | none | OK |

## Camera (08_fx.js:1, 10_fxa.js:132-222, options 09_ui.js:3-5)

| feature | real RL | ours | measured | gap | prio |
|---|---|---|---|---|---|
| defaults | game default FOV 90 (pros 110), distance 270, height 100, angle -3, stiffness 0.5 since 2020 (pros 0.35-0.5), swivel 2.5 (pros 4-6), transition 1-1.2 | `CFG.cam` 01_sim:33 = 110 / 270 / 100 / -3 / 0.45 / 4.7 / 1.2 (pro preset, all editable in Options > Camera) | rest: 270 behind, 112 above car origin | was 100 / -3; now the RL default preset 110 / 270 / 110 / -5 / 0.45 (owner) | M (fixed) |
| ball cam | on by default, C toggles | 09_ui:185, 10_fxa:162 | | none | OK |
| FOV in 16:9 | horizontal FOV setting | vertical derived from horizontal 09_ui:127-130 | 77.5° vertical at 16:9 | none | OK |
| FOV widening with speed | +5° scaled by speed / max speed, +5° more when supersonic (Rocket Science #2) | 10_fxa:218-221 was a piecewise curve (+6 at 2199) | | curve shape | L (fixed) |
| stiffness | supersonic distance = distance + (1 - stiffness) x 114.7 (Rocket Science #2) | pivot lag rate 17 + 40 x stiffness | 337 at 2300 with 0.45 (RL 333); 0.9 gave +43 (RL +11) | wrong at high stiffness | M (fixed) |
| camera shake | on by default, mild | 10_fxa:107 | | none | OK |

## HUD and UI (03_style.js, 09_ui.js, 14_hud.js)

| feature | real RL | ours | gap | prio |
|---|---|---|---|---|
| scoreboard | top centre: blue score box, dark clock 5:00, orange score box; your team on the left | 03_style:31, 14_hud:27-36 | none | OK |
| boost meter | bottom right circle, 0-100 number, ring fill, team tint | 03_style:40, 14_hud:37 | none | OK |
| countdown | 3-2-1 numerals then GO! centre-upper screen | 09_ui:161, 03_style:74 | none | OK |
| stat popups | "+100 GOAL", "SAVE +50", ... stacked near the screen centre | `popMsg` 09_ui:171, 03_style:99 | none | OK |
| kill feed | top right event feed | `feedMsg` 09_ui:166, 03_style:91 | none | OK |
| replay | "REPLAY" bottom-left, "SCORED BY" card, skip prompt | 13_fxvis:93, 02_fxhead:21-60 | none | OK |
| garage | body, decal, paint, wheels, rocket boost, goal explosion, trail, topper | 09_ui:360-455 | none (item names under thumbnails hard to read in headless shots) | L |

## World and effects (06_scene.js, 06b_ball.js, 07_cars.js, 08_fx.js, 11_carvis.js)

| feature | real RL | ours | gap | prio |
|---|---|---|---|---|
| DFH Stadium look | olive checker pitch, team-tinted halves, glass roof, stands split by team | 06_scene (rounds 2-4) | stands are flat textures, no 3D crowd | L |
| wall-ceiling curve / vertical corners | r ~490 / ~900 | r 256 (matches our physics) | L |
| ball | silver ball, hub lights, ground shadow | 06b_ball:24-46 | none | OK |
| boost pads | big orb pads, small plates | 06_scene:622-660 | none | OK |
| goal explosion | fire + smoke, team-coloured arena flash, 6 explosion types | 08_fx:204-208 | none | OK |
| cars | Octane, Fennec, Dominus (game meshes), Breakout, Merc, Venom, Paladin | 07_cars | Paladin reuses the Dominus mesh | L |
| boost trail / supersonic trail | team flame, supersonic streaks | 11_carvis, 13_fxvis | none | OK |
| sound | samples | Web Audio synthesis (no assets allowed) | different by design | L |

## First-hand comparison (owner's PC, real RL Oct 2026, screenshots in the lead's agent-rl/real folder)

| feature | real (observed) | ours before | prio |
|---|---|---|---|
| boost meter | dark disc with vivid blue glow, light-blue neon digits, "BOOST" under the number while boosting, ~44 orange ticks on a ~255° arc from 5:30 o'clock clockwise to 2 o'clock, orange to yellow to white near full, blue team too | blue ticks on a full 360° ring, dark navy disc, no BOOST label, 11% of screen width (real ~14%) | H |
| Standard boost | orange/yellow fire plus orange smoke puffs for both teams; Classic trail is a thin purple/blue streak | team-coloured (blue for blue team) flame and white-blue streaks | H |
| goal banner | "<NAME> SCORED!" in gold gradient, no "GOAL!" | white glow text plus italic "GOAL!" | M |
| replay card | AI badge for bots, dark translucent bar, orange binary-digit strip, MPH | solid team-colour bar, robot avatar, car silhouette, KPH | M |
| stat popups | soft orange glowing disc with "SAVE" / "+50" above the ball area | label text over a faint icon | M |
| main menu | skewed buttons, selection orange-gold | selection light blue | L |
| garage tiles | item name under each tile | names hidden behind the thumbnail (img positioned absolute by a shared `.ld` rule) | M |
| item names | trail "Classic", decals Stripes / Flames / Lightning / Lockjaw, Paladin among bodies | Standard trail, invented decal names, no Plank body | L |
| DFH Stadium | dusk/night haze, city towers, dark hex metal floor with team-glow seams around the goal areas and centre, white hazard stripes, team-coloured neon field lines | sunny day, grass with chevrons, grey-white lines | H |
| camera | default preset 110 / 270 / 110 / -5 / 0.45 | 110 / 270 / 100 / -3 / 0.45 | M |
| controls | AZERTY shows Z Q S D; left mouse boost, right mouse jump; Left Shift = powerslide + air roll | key hints always QWERTY letters; mouse boost/jump already present | L |

## Top gaps found

1. HUD boost meter and Standard boost/trail colours did not match the real game (most visible every second of play).
2. DFH Stadium look: real current DFH is a dusk arena with hex metal plates and neon team lines; ours was a bright day arena.
3. Goal / replay / popup GUI styling differed (banner, card, badges).
4. Camera defaults and stiffness/FOV formulas were close but not RL's.
5. Plank hitbox class missing (5 of 6 RL hitboxes).
6. Garage tile names hidden by a CSS collision.

Everything that decides how the game plays (speeds, boost, jumps, flips, air control, ball, pads, kickoff, rules) already matched the RLBot / RocketSim numbers within measurement precision and was left unchanged.

## Round 5 changes

| area | change | files |
|---|---|---|
| camera | defaults 110 / 270 / 110 / -5 / 0.45; FOV +5° x speed/2300 +5° supersonic; pivot lag rate 20 / (1 - stiffness) so supersonic distance follows dist + (1 - stiffness) x ~115 | 01_sim (CFG.cam), 08_fx, 10_fxa |
| boost meter | rebuilt SVG: 44 ticks on a 254° arc from 158°, orange to yellow to white, blue glow disc (orange for orange team), BOOST label while boosting, 13.6u size | 09_ui (BDS, uiBT), 03_style, 14_hud |
| boost / trail | Standard boost orange for both teams with orange puffs; Classic trail purple-blue | 07_cars |
| goal banner | gold gradient "<NAME> SCORED!", removed "GOAL!"; classic explosion white flash toned down | 03_style, 09_ui, 08_fx |
| replay card | dark bar + orange/blue binary strip, AI badge for bots, MPH | 02_fxhead, 13_fxvis |
| popups | orange glowing disc badges, top 19% | 03_style |
| main menu | gold selection highlight | 03_style |
| garage | tile names visible (`.gim img` position static); real item names (Stripes, Flames, Lightning, Lockjaw, Classic trail); new body Paladin (Plank hitbox 131.32 x 87.17 x 31.89, RocketSim wheels/suspension, rests at 18.67 uu, RL 18.65) using the Dominus mesh via `BODIES[id].mdl` | 03_style, 07_cars, 09_ui |
| arena | dusk sky with city tower silhouettes and haze, dimmer warmer lights, darker fog, no sun disc; tiled hex metal plates (r 92 uu, team emissive seams) on both goal areas and the centre ring, grey rims, centre grate, white hazard stripes beside the back kickoff spots; field lines team neon (unlit) in each half, white midline/circle | 06_scene |
| controls | key hints follow the keyboard layout (navigator.keyboard.getLayoutMap): ball cam hint, options controls table, garage and options Q/E/X hints | 09_ui |
| tooling | tools/join.py resolves paths from its own folder (works from any copy) | tools/join.py |

Not done on purpose: Left Shift as air roll. The portal maps the controller boost button to ShiftLeft, so making Shift also air roll would roll the car whenever a gamepad player boosts in the air. Powerslide (X / Ctrl, controller X) already doubles as air roll.

## Measured after the changes

| value | ours | real |
|---|---|---|
| throttle 0→1000 / max | 1.00 s / 1410 | 1410 max |
| boost 0→2200 / max | 1.59 s / 2300 | 2300 |
| jump tap / full / double | 72 / 215 / 435-446 uu | same formulas |
| ball drop 1000 bounce peaks | 399 / 198 / 130 / 106 | CR 0.6 |
| camera at rest | 271 behind, 122 above car origin | 270 / 110 + pivot |
| camera at 2300 (stiffness 0.45) | 327-335 behind | 333 |
| vertical FOV 16:9 rest / supersonic | 77.5° / 92.5° (110 / 120 horizontal) | 110 / 120 |
| Paladin rest height | 18.67 | 18.65 |
| render, 1v1 kickoff, full quality | 125 draw calls, 192k triangles | |
| frame time (headless Chrome, RTX 5080) | 4.2 ms avg, 8 ms worst; 4x CPU throttle 7.8 ms avg, 21 ms worst | |

## Still different

- Stadium structure is still the old daytime DFH geometry (glass roof, sunlit crowd textures); only the sky, light and pitch were moved toward the dusk look. Pennant flags behind goals, flags across the roof and the blue hex force-field dome are not modelled.
- Small boost pads are triangle plates, not discs on hex plates; real seams glow more (needs bloom on desktop).
- Goal back nets have no team shield logos.
- Paladin uses the Dominus mesh (no Plank-shaped model).
- Pause menu / exhibition setup / choose-team screens keep their current layout.
- Sounds remain synthesized.
