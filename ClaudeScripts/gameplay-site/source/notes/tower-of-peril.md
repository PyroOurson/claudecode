# Tower of Peril: study notes

Genre model: the round-based obstacle tower on block-building platforms (Tower of Hell, YXCeptional Studios, 2018).

## Session loop and pacing
- One server, one tower. The tower is rebuilt from randomly chosen handmade sections every round. A normal tower has 6 sections and an 8 minute clock; the "pro" tower has 12 sections and a 10 minute clock.
- Everyone starts at the bottom. No checkpoints: a fall drops you through the sections you already climbed, a kill brick sends you back to the bottom.
- Reaching the top pays coins and experience and speeds up the clock for everyone still climbing. When the clock reaches zero the tower is rebuilt and everyone goes back to the bottom.
- Coins buy gear for one round (speed coil, gravity coil, fusion coil) and mutators that change the next round for everyone (extra time, lengthen, low gravity, high speed, invincibility, fog, negative colours). Gear is not allowed in the pro tower.
- A typical good climb of a 6 section tower takes 2 to 5 minutes; beginners often run out of time.

## Sections
- Each section has a name, a difficulty colour (easy green, medium yellow, hard orange, difficult red, challenging dark red) and is about 5 to 7 character heights tall.
- Building blocks: small pads and pillars, thin beams, trusses you climb, ramps, conveyors, spinning bars, moving and turning platforms, timed blocks, bounce pads, neon red kill bricks.
- Sections stack with the exit of one at the start of the next. The interior of the tower is a shaft, so a fall usually lands you on an earlier section.

## Controls and numbers (platform defaults, in studs)
- Walk speed 16, jump take-off speed 50, gravity 196.2: jump height about 6.4, air time about 0.5 s, flat jump reach about 8. Character 5 tall, 2 wide.
- Almost instant acceleration and full air control. Holding jump keeps jumping on every landing.
- WASD or arrows move relative to the camera, Space jumps, right drag or shift lock turns the camera, the wheel zooms, R resets the character, the number keys equip gear.
- Third-person orbit camera, about 12 to 16 studs back, pulls in when a wall is between it and the player.

## Interface
- Top centre: the round clock. Side: coins. Player list with level and towers beaten. A banner with the section name when you enter it. Finish: confetti, a chime and "you beat the tower".

## Feel and sound
- Short jump sound, landing thud, death sound and the body breaking into parts, quick respawn. Upbeat looping music. Kill bricks glow.

## Common strategies and beginner mistakes
- Jump from the very edge, use shift lock for straight lines, wait for moving parts instead of rushing, stop on small pads instead of chaining jumps.
- Beginners jump too early, misjudge depth on thin beams, panic on conveyors, forget that the clock speeds up when someone finishes.

## Decisions for this game
- Own sections (24 handmade designs in five difficulty tiers), own avatars and art, own music and sounds.
- Glass shaft walls so falls cost sections, not the whole tower, as on the platform.
- Solo with bots (Easy, Normal, Hard, Hardest) or online races of 2 to 8 players through the party system.
- Every section is checked by a solver bot that plays with the same physics and inputs as a player.
