# Swing Line (rope-swing momentum game)

Study of the best-known game of its kind (Madbox's stickman grappling game, 2018; store pages, Poki page, The Koalition review, player guides).

## Loop and pacing
- Tap a level, the stickman starts on a ledge, the player holds to grab and lets go to fly. A level takes 10 to 40 seconds; a miss or a fall restarts it at once, so a session is many short tries.
- Hundreds of short levels in the original; early ones teach the swing, later ones mix bounce pads, walls and moving parts. Some feel like filler: we keep fewer levels, each with one idea.
- End of level: finish line or gate, a short celebration, then the next level button. Skins unlock as you progress.

## Controls and physics
- One button: hold (mouse, touch, any key) shoots the rope to the nearest valid hook, release lets go. Only hooks can be grabbed, never walls.
- The rope is taut, the body hangs from the hand, legs trail. Speed carries over between hooks; releasing on the way up near the top of the forward swing gives the longest flight, releasing low gives a flat flight.
- The original pulls the rope in a little while held, which is what lets the player gain speed. We reel the rope in while held (angular momentum is kept, so the stickman speeds up) and add a gentle push when almost still, so nobody gets stuck under a hook.
- Bounce pads launch the player and can skip hooks; flips happen in the air.

## Interface
- Level number and a progress bar at the top, nothing else during play. The hook that will be grabbed is highlighted.
- Level select grid with stars, skins screen, settings.

## Our design
- 3 worlds of 10 handmade levels: hooks and pads, then walls, saws, moving hooks and boost rings, then crumbling hooks, wind and all of them together.
- Stars: one for finishing, one for every gem of the level in one run, one for beating the target time. Gems buy original skins. Worlds open with stars.
- Endless mode with generated hooks and a best distance.
- Common beginner mistakes: letting go at the bottom (flies flat into the floor), holding too long (swings back), grabbing the hook behind. The highlight and the trail help here.
