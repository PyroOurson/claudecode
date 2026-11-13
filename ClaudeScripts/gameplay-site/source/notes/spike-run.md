# Spike Run (stickman parkour platformer)

Study of the best-known stickman parkour series (Amazing Adam's acts series, fifth game; portal pages, player guides).

## Loop and pacing
- Acts are long handmade levels split by checkpoint flags; each act takes 2 to 6 minutes for a new player. Dying (spikes, saws, lasers, falls) is instant and frequent; you respawn at the last flag in under half a second, so play keeps its rhythm.
- Each act adds one or two new things and then mixes them: spikes and gaps, then saws, then wall jumps, moving platforms, crumbling tiles, launch pads, zip lines, water.
- End of act: the exit portal, a results screen with time, deaths and stars found, and a medal for the time.
- Hidden stars in hard side paths; a challenge room of short timed rooms for experts.

## Controls and physics
- Left, right, jump, down (crouch and slide). Arrows or WASD; on phones, buttons.
- Fast run (about 5 body lengths per second), quick acceleration, a little slide when stopping. Jump about 2.5 body heights, higher when held longer, lower when released early.
- Wall slide when pressing into a wall in the air, then jump to kick away from it; chains climb shafts. Coyote time and jump buffering keep it fair.
- Sliding under low gaps keeps speed; launch pads fling you high; zip lines carry you down and you jump off.

## Interface
- Top: act name, timer, deaths, stars of this act. Flags turn from red to green when reached.
- Menus: act select with best time, deaths and medal; settings.

## Our design
- 6 acts plus a challenge set. Our own layouts and art: a clean stickman on dark blocks with bright hazards.
- No gore: on death the stickman bursts into a few sticks and sparks.
- Common beginner mistakes: holding jump into a wall instead of pressing away, rushing past flags, jumping too early onto moving platforms.
