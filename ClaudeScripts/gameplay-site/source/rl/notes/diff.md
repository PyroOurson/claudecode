# Real Rocket League vs this remake (qa agent)

References (all in `rl/agents/qa/ref/`): 24 RL-wiki arena / boost / garage images (`ref/wiki/`), ~320 YouTube thumbnails + auto-frames of real gameplay (DFH Stadium day/night, Mannfield, Champions Field, Utopia, Urban, Beckwith...), kickoffs, demolitions, goal explosions, replays, menus, boosts, scoreboards (`ref/yt/`, ids and titles in `ref/yt_ids*.txt`, contact sheets `ref/sh_*.png`, boost meter crops `ref/boostmeters.png`), the owner's packs `rlref/` and `guiref/`, and phys's measured car-soccer camera numbers (`notes/carsoccer.md`).
Our captures: `rl/agents/qa/sh/` (f0 = full flow before, f1 = after, r1..r7 = arena / pads / goal / demo situations, ct1..ct3 = camera measurements, m1 = phone).
Tools: `agents/qa/qajoin.py` (my live segments + frozen base for the other agents; `all` = everything live), `agents/qa/scn.js` + `go.sh` (scripted scenes), debug hooks `wrap.__rs.cam([x,y,z,tx,ty,tz]|null)` free camera, `wrap.__rs.slow(k)` slow motion, `wrap.__rs.vcam()` camera pose.

Severity: H = obvious at a glance, M = noticeable side by side, L = detail.

## Fixed

| # | category | real game | ours before | sev | change |
|---|---|---|---|---|---|
| 1 | Boost meter | team coloured (orange team: orange ring + orange digits; blue team: blue disc, blue digits, white-blue ring), dark radial disc, thin decorative lines on top, big digits | always orange, pale small digits | H | team colour via CSS vars toggled from hudUpdate, radial dark disc, top decor lines, larger saturated digits |
| 2 | Field grass | dark olive/teal green (sampled ~#34452d..#2b5c57), large alternating checker squares, halves tinted toward team colour | bright saturated green #3f9946, transverse stripes only | H | 512 uu checker, ~45% darker albedo, fine mow bands, existing team tint kept |
| 3 | Field lines | thin, DFH: team-tinted lines in each half, white midline/centre circle | wide bright white everywhere, big white centre spot | M | perimeter + box lines team tinted, midline/circle thinner and dimmer, centre spot 80 -> 46 |
| 4 | Crowd / stands | darker; blue fans fill the blue half, orange fans the orange half | very bright confetti crowd, only end stands team coloured | M | stands split by half (blue / orange / mixed centre), 20-30% darker, fewer white fans |
| 5 | Kickoff countdown | thin gold/orange digital numerals ~6% of screen height at ~30% from top; "GO!" same style | huge white/blue digits ~25% of screen height | H | gold numerals at u*6.4, top 27%, GO! same colour |
| 6 | Goal explosion (Classic) | huge orange fire + billowing orange/brown smoke, debris, shockwave; arena lights flash team colour | team coloured (blue/orange) sparkly blast, white blowout near camera | H | orange fire clouds + dark smoke, fewer additive particles; team colour only on ground ring + arena flash |
| 7 | Demolition | orange fireball, sparks, black smoke, ~2 car lengths | additive particles blew out to a white/yellow wall near the camera | H | fewer additive particles, orange cloud core, dark smoke (verified in slow motion, r6) |
| 8 | Camera at rest | 270 behind, 114 above car origin (height 100 + ~14 pivot), pitch -3 | 270 / 100 | M | +14 pivot; defaults now read `CFG.cam` (phys: 110/270/100/-3, stiffness 0.35, swivel 4, transition 1) |
| 9 | Camera speed lag | distance grows ~0.0325 s x speed (344 at 2300) | 358 at 2300 | L | pivot follow rate 17 + 40 x stiffness |
| 10 | Ball cam, ball high above | camera drops to car height (~170 behind) and pitches up ~51 deg, car near bottom edge | camera stayed high, pitch capped ~12 deg; orbit below floor triggered the wall "lift" and looked DOWN | H | orbit up to 0.5 rad, arm shortens to stay ~20 above the car, wall margin 55 -> 32; measured 49 deg pitch, camera at car height, 205 behind (ct3) |
| 11 | Camera in the air | vertical follow is soft (lags ~0.4 s) | rigid | M | pivot z follows at rate 2.2/s while airborne |
| 12 | Scoreboard | bold white outlined score digits, white thin clock digits, light top rim on clock box | thin greyish digits | M | bolder digits with offset ghost, brighter clock, top rim |
| 13 | Boost pads | light silver metal bases with orange lights | dark navy chunky bases | M | base 0x80868f |
| 14 | Dome glass | thin, subtle hex lines | strong white hex lines | L | line alpha 0.5 -> 0.32 |
| 16 | Arena geometry vs new physics (phys / car-soccer) | RL mesh: faceted floor fillets, back-wall fillet r 160, side 256 | visual ramps smooth (6 segments) r 256 everywhere -> up to ~40 uu mismatch and gaps on back walls | H | ramp + goal-mouth caps rebuilt from the same formula as `sdf()` (`CFG.facets` facets, `CFG.rampBack` radius with the same `CFG.rampBlend` blend near corners, solved per vertex); flat strip fills the floor up to the tighter back ramp; boards and glow strips start at the local ramp top; ceiling fillet uses the same facet count. Checked with `agents/qa/geochk.js`: all 6534 ramp vertices + ceiling fillet vertices have sdf = 0.000. Everything else (walls, corners, ceiling, goals 896/640/880, field lines, pads, spawns) already reads CFG and follows the 4144 x 5056 x 2096 arena |
| 17 | FOV at speed (car-soccer) | car-soccer: horizontal ~111 at 500, ~113 at 1400, ~120 supersonic | fixed | M | adopted (smoothed), base FOV from settings |
| 15 | Model credits | (CC BY licence of the models) | none | H | Main menu "Credits" entry + Options "Credits" tab; lists `crCredits` (guarded) + fan-tribute disclaimer, links open in a new tab |

## Already matching (checked)
- Garage lists only Octane, Fennec, Dominus. Scoreboard puts your team on the left, clock centre, blue/orange boxes. Replay: red "REPLAY" bottom-left, "SCORED BY" card with time + speed, "PRESS [SPACE] TO SKIP". Pause menu, exit dialog, winner banner ("WINNER / BLUE"), XP and scoreboard screens follow the real layouts in `guiref/`. Kickoff boost 33, 3-2-1-GO at 1 s steps.

## Still different (not fixed)
| category | real | ours | sev | why / owner |
|---|---|---|---|---|
| Post-processing | strong bloom, lens flare, high contrast, heavy saturation | flat ACES, no bloom | M | bloom pass too costly for phones |
| Arena shape | ~490 uu wall-ceiling curve, ~900 uu vertical corner rounding | 256 (same as physics) | L | physics keeps RR there, visuals match physics |
| Stadium | 3D modelled stands, statue, trees, banners with real sponsor art, roof structure | flat crowd textures on stepped quads | M | budget |
| Boost flame / trail, nameplates, car + ball models | real models, default boost | models agent (07_cars / 11_carvis) | - | models agent |
| Camera shake default | On in RL, Off in car-soccer | On | - | kept RL |
| Sounds | recorded samples (engine, boost, crowd, goal horn, announcer-free) | Web Audio synthesis | M | no external assets allowed |
| Menus | Shop, Rocket Pass, Training, Career, Extras | Play / Garage / Options / Credits / Exit | L | scope |
| Ball ground ring | white ring under the ball in many clips (settings dependent) | small shadow disc | L | |
