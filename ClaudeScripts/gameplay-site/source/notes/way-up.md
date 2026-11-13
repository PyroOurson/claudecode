# Way Up: study notes

Genre model: the single-player vertical climbing journey (Only Up!, SCKR Games, 2023).

## Session loop and pacing
- One long fixed climb, no levels, no saves of position and no checkpoints. The goal is the top; the end screen shows the total time.
- The climb passes through very different floating scenes stacked on top of each other (a run-down town at the start, then industrial junk, giant everyday objects, a sky bridge, temples, a travel or night scene, and finally space). Objects get bigger the higher you go.
- A fall drops you onto whatever is below, which can be minutes of progress. That loss is the core tension. Some places let a fall skip back to the ground.
- A first full climb takes one to several hours for most players; speedrunners take minutes.

## Movement (relative values)
- Walk, sprint (Shift), jump (Space), crouch and roll (Ctrl), camera (mouse). A sprint jump goes much further than a standing jump; jump distance depends on speed at take-off.
- Momentum is heavy: little air control, so the take-off decides the jump. Character about 1.8 m; walk about 3.5 m/s, sprint about twice that; a jump clears roughly 1.2 m up and 4 to 5 m across at a sprint.
- Third-person camera close behind and above the hero; a looser follow when falling.

## Level building blocks
- Thin beams, pipes, cables and ropes, ledges, slopes you slide down when too steep, small floating platforms, trampolines and beds that bounce, moving parts are rare.
- Every scene has its own palette and props, with a clear "next step" visible against the sky.

## Interface and feel
- Almost no interface: no height bar in the original, just the world. Calm ambient music that changes by area, wind getting stronger with height, soft landing sounds, a heavier thud after a long fall.

## Common strategies and beginner mistakes
- Line up the camera before a long jump, sprint jump only when needed, walk the last metre, look down before jumping.
- Beginners sprint everywhere, jump too late from the edge, and rush after a fall.

## Decisions for this game
- Own hero (Mika and the red balloon she follows), own eight scenes, own props and music.
- A height meter and a thin progress line at the side, since students play in short sessions and want to see how far they got.
- Ledge grabs and ropes as climbing tools, slopes that slide, bounce pads.
- A practice mode with a checkpoint at each scene start; its times never count.
- A ghost of the best run, recorded at a fixed rate and saved on the device.
- The whole climb is checked by a solver bot that plays with the same physics and inputs as a player.
