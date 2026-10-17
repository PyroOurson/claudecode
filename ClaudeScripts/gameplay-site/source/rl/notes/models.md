# Models (models agent)

## What is in the game now
- Cars: Octane, Fennec and Dominus are the Sketchfab models by fairlight51 (CC BY 4.0). The data lives in `rl/models/<id>.json`, and `crModels` embeds it. The ball is procedural (06b_ball) and `ball.json` is no longer bundled.
- Merc, Breakout, Venom, Paladin: procedural, regenerate with `cd rl/tools && python gen_<car>.py` (helpers in `cargen.py`: loft of superellipse sections, box, cyl, fender arcs; `finish` writes the JSON with the Octane stock wheel). Model space = game units, +X forward, ground at z 0, axles at the BODIES `wf`/`wb` values. Round 2 rebuilt them against `rlref/real/garage_bodies` (Merc: exposed wheels with trapezoid flares, raked screen, roof visor, twin bronze rear turbines; Venom: narrow hood, high side pods over the rear wheels, open rear frame; Breakout: hood spine and stripes, separate wheel arches, taller cabin; Paladin: wide blue front fenders). No licensed non-ripped models exist for them (see `credits.md`).
- Antennas: cosmetic key `ant` (none, ball, smiley, flag, leaf, macaron, skull), built in `crAntGeo`/`crAntMat`, mounted at `crFit(...).ant` (highest body point 20 % of the body length behind the roof centre, 12 % of the width to the left). Missing or unknown values clean to 'none'.
- Pipeline (all in `rl/agents/models/tools/`, run `bash all.sh octane fennec dominus ball`):
  - `extract.py` parses the GLB in numpy. It applies the node transforms in cm, converts glTF (x fwd, y up, z right) to game axes (+X fwd, +Y left, +Z up) and splits the parts by material.
  - `decim.py` decimates in bpy with the Decimate collapse modifier (symmetric about Y). It transfers custom normals back from the full-resolution mesh.
  - `build.py` quantises the data and writes the textures. Positions are uint16, normals int8 and UVs uint16. Textures are JPEG data URLs.
  - Per-car settings (texture indices, decimation targets, nozzles in car space) are in `cfg.json`.
- Runtime fit (`crFit` in 07_cars): uniform scale = BODIES wheelbase / model wheelbase, x offset matches the front axle, z offset averages both axles to `r - 17`. This keeps the cars correct if `wf`/`wb` change. Wheels are the car's own rim + tread (FL wheel), normalised to radius 1 and scaled to the BODIES radius at each axle. The right side is mirrored (`scale.y = -1`).
- Bodies with no model (any extra BODIES id) use the Octane mesh fitted to that body's wheels. If `crModels` is empty, a grey box is used, so the game never crashes.
- Materials:
  - Body = team primary (`crTeam`: blue `#0866f0`, orange `#ff6406`). MeshPhysical with clearcoat (at least 0.45), metalness capped at 0.2.
  - Paint layer = accent `#1b1c20` (dark graphite). That is what the GLB has, and the default RL garage shots show it too (dark fender lips, side stripes, skirts).
  - Chassis = its PNG texture as 1024 JPEG (Octane also gets its metal/roughness map as 512).
  - Window = near-black glass (clearcoat 1, roughness 0.06, stronger env).
  - Headlights = unlit emissive `#fff4e6`, not tone mapped.
  - Rims use the GLB values. The Fennec's gold "Alpha" rim texture was desaturated to silver, because default Fennecs do not have gold Alphas. Tread is rubber `#17171a`.
- Boost nozzles, measured from near-orthographic renders and matched to reference shots:
  - Octane: one nozzle at the centre of the rear engine block.
  - Fennec: two nozzles at the round outlets in the rear bar.
  - Dominus: two nozzles at the twin rectangular rear openings.
- Ball: own mesh plus the glow part, texture 1024 JPEG. The emissive map is derived from the teal hub lights. The outer skin radius (95th percentile of vertex radii, 0.989) maps to exactly `CFG.ballR`. It casts shadows. `ballM` and `ballGlow` are kept, and the halo shell is reduced to 3.5 %.
- `crCredits` (07_cars) holds 3 strings: "<name> by fairlight51, <sketchfab url>, CC BY 4.0".
- Shared helpers now live in 06b_ball (it runs before 07): `crM`, `crB64`, `crDec` (positions, normals, UVs, groups) and `crTex` (data URL to texture, flipY false, cached).

## Numbers
| model | body tris | wheel tris (each) | car total | json bytes |
|---|---|---|---|---|
| octane | 24,820 | 1,640 | 31,380 | 680 KB |
| fennec | 26,692 (from 65k) | 1,740 | 33,652 | 788 KB |
| dominus | 26,888 | 1,740 | 33,848 | 683 KB |
| ball | 4,416 | | | 225 KB |

- All four models together add 2.38 MB.
- 3v3 kickoff main pass: about 100-113 draw calls and 175-200k triangles (renderer.info).
- In-game screenshots are in `rl/agents/models/sh/`. References are in `rl/agents/models/ref/<car>/`: about 80-100 per subject from Yandex image results, with `sources.txt`.

## Compared with the real game
- Shape, proportions, wheels, chassis details, spoilers and lights match the real cars closely (they are the game meshes). Ride height and wheel placement follow BODIES, so visual and physics agree.
- Default paint: the RL blue in references ranges from sky blue (old default) to deeper royal blue. We use a medium blue that reads slightly lavender in direct sun because the clearcoat reflects the bright sky env. Orange matches well.
- Kickoff at FOV 110 shows the ball small in the distance, as in real RL.

## Remaining differences / ideas
- The cars have no normal maps (dropped for size). The fine panel grain on the Fennec chassis is lost.
- The Fennec chassis emissive map is ignored. In the GLB it used UV set 1, which is all zeros, so it was effectively unused.
- There are no team-coloured decals, and no per-player accent colours. Everything uses the default look.
- No LOD. Six cars at about 33k triangles is fine on desktop but heavy on weak phones. A decimated about 6k LOD for distant cars would be the next step if needed.
- The boost flame colour and shape are fx/cars code (11_carvis flames). Only the nozzle positions come from the models.
