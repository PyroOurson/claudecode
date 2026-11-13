# The Quiet House: notes

First-person horror escape in the style of Granny (DVloper, 2017), the best-known game of its kind. Everything here (house, antagonist, models, textures, sounds) is our own.

## Study of the original (Part 6b)

Sources read: the Granny Fandom wiki (Main Door Escape Route, Car Escape Route, Item Locations, Extreme), the DVloper wiki page for the game, and player guides (Eneba, 9Puz, freejoy). Main points:

- Loop: you wake in a locked-in house with five days. Being caught ends the day: the screen goes dark, "Day 2" appears and you wake in the same bed. Caught on day 5 is the bad ending. A first escape takes a new player 30 to 60 minutes; experienced players finish in a few minutes because they know the item spots.
- The antagonist hears everything: dropped items, opened doors, creaking floorboards and traps. She walks to the sound, looks around, then patrols again. If she sees you she chases; hiding under a bed or in a wardrobe works unless she saw you go in, in which case she pulls you out.
- You hold one item at a time. Items spawn from a few preset spots each game, so a route cannot be memorised. Items dropped on soft surfaces make no sound.
- Escape routes: the front door (planks removed with a hammer, wires cut, padlock key, code padlock on Normal and up, main door key, more locks on Hard and Extreme) and the car (battery, spark plug, fuel, car key, and opening the garage). Each route is a chain of small puzzles spread over the whole house.
- Traps: bear traps on the floor (more from day 2 and on harder levels; you are stuck and noisy until you free yourself), creaking boards, tripwires.
- A weapon knocks her out for a while (30 s on easier levels, 15 s on Extreme), which buys time to work on the exit.
- Difficulty: Practice (no antagonist), Easy (slower, fewer traps, fewer locks), Normal, Hard, Extreme (she is faster than the player unless the player sprints, more unavoidable creaking floors, shorter knockouts, darker).
- Interface: almost nothing on screen. A hand icon when an item can be taken, the held item, the day card when you wake. Phone controls: stick on the left, drag to look, buttons for take, drop, crouch and hide.
- Feel and sound: the house is dark with small pools of lamp light; her footsteps and voice tell you where she is before you see her; a loud sting when she spots you; quiet otherwise, so every noise you make feels dangerous.
- Common strategies: throw or drop items to lure her away, learn hiding spots near each objective, work on one exit at a time, use the weapon only when the exit is close. Beginner mistakes: running everywhere (noise), dropping items on hard floors, hiding in a spot she saw you enter, carrying the wrong item across the house.

## Our design

- Antagonist: the Keeper, a tall stooped caretaker in a long coat and hat, with a pale porcelain face, a lantern and a ring of keys. His lantern light and the jingle of his keys are the warning cues. He hums while he walks, whispers "Shhh" when he searches, and on a catch the screen fades to black. No blood, no violence shown.
- Each day he gets smarter: day 1 he patrols at random and only hears loud noises; from day 2 he sets bear traps; from day 3 he checks the nearest hiding places when he loses you; from day 4 he guards the exit you have worked on most; on day 5 he is faster and stops to listen.
- House: three floors (cellar, ground, upstairs), 16 rooms, closed stairwells, two crawl vents only the player can use, boarded windows, rain outside.
- Exits: front door (planks, padlock, code lock, door key, and a chain on Hard and up) and the car in the garage (car key, battery, fuel, spark plug on Normal and up, power for the garage door from the fuse box in the cellar).
- Puzzles: the code lock digits are written in four rooms, marked I to IV; the fuse box needs a fuse; the study and the garage are locked with their own keys; some items lie in drawers.
- Distraction: any held item can be thrown to make a noise far away. The old flash camera stuns the Keeper (30 s on Easy, 20 s Normal, 15 s Hard, 10 s Hardest).
- Difficulty: Practice, Easy, Normal, Hard, Hardest. Hard is 12 percent faster than Normal; on Hardest he is faster than the player's sprint and the house is darker.
- Speeds (metres per second): player walk 2.6, crouch 1.3, sprint 4.0 for about 5 s; the Keeper patrols at 1.3 to 1.6 and chases at 2.5 (Easy), 3.1 (Normal), 3.5 (Hard), 4.25 (Hardest).
