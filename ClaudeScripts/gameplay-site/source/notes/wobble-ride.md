# Wobble Ride: study of the genre and design decisions

Genre model: the best-known browser ragdoll obstacle-course game (2010, Flash, later HTML5 and Steam). Studied from its wiki pages on controls and characters, guides and gameplay knowledge. Nothing was copied: names, characters, levels and art here are our own.

## Session loop and pacing
- Menu, then a level list (featured levels), a short intro of the level, then the run. A run lasts 20 s to 2 min. The clock starts with the first input.
- The goal is a finish token or line. Death does not end the run on its own: a rider who lost limbs can still roll, crawl or slide to the finish. The player restarts at will.
- Difficulty rises through hazard density and precision (gaps, timed blades, glass, mines), not through speed.
- The level editor and sharing levels are half of the game's life: players build, test, publish and play each other's levels.

## Controls (same keys for every character; meaning of the action keys changes per character)
- Up: accelerate. Down: brake or reverse. Left/Right: lean (shift the body, rotate the vehicle in the air).
- Space: the character's main action (jet, jump, brake, boost, charge a bounce).
- Shift and Ctrl: secondary actions (rotate the jet, straighten or bend the legs, eject one passenger).
- Z: eject (the rider lets go of the vehicle and becomes a free ragdoll). After ejecting, arrows still move the body a little.
- Restart is instant. Several characters share the same course.

## Physics and feel
- Rigid-body physics with joints that break under a large impulse: arms, legs, head, the grip on the vehicle and the seat each have a limit. A broken grip means falling off; a broken neck means a limp body.
- Characters are light compared with heavy hazards. Wheels have high grip; air control comes from leaning. Landings on the back wheel are forgiving; head-first landings break the neck.
- The original shows blood and gore. Here every break is a cartoon effect: a pop sound, stars, a comic word (POP, BONK), a puff of dust; limbs come off clean like toy parts, with no red.

## Hazards and props worth having
- Spikes, mines, harpoon guns, wrecking balls, fans, boost pads, springs, breakable glass, crates and balls, moving platforms, signs.

## Interface
- During a run: level name, timer, a small progress cue, restart and menu buttons. On a phone: on-screen buttons for each control.
- End screen: time, score breakdown, medal, retry, next level, back to list.

## Common strategies and beginner mistakes
- Beginners hold accelerate all the time and flip over on the first ramp; good players feather the throttle and lean back on landings.
- Ejecting just before a crash to fling the body to the finish is a known trick, and finishing as a torso counts.

## Decisions for our version
- Keys follow the convention above (Space main action, Shift/Ctrl secondary, Z eject, R restart).
- Five original riders (see the code): Gran Turbo (rocket wheelchair), Rudy and Biscuit the dog (cargo bike), Dot (gyro board), Lou and Ziggy (pizza moped), Joey (pogo stick, kangaroo suit).
- Score: finish bonus, a time bonus against par, a bonus for intact limbs; three medals per level.
- Level codes: the level itself is compressed into the code (works offline). A short server-stored code would need a portal change (see the agent report).
