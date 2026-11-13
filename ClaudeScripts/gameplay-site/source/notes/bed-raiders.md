# Bed Raiders: study notes (team bed game, in the style of Bed Wars)

Sources: Hypixel forum guides (generator timings, shop prices, team upgrades), general knowledge of the blocky team bed genre.

## Session loop and pacing
- Teams spawn on their islands. Every island has a bed, a forge making iron and gold, an item shop and a team upgrades shop.
- The first minute: buy wool, cover the bed in layers (wool, then clay or wood, then glass or obsidian), and bridge to a diamond island.
- Minutes 2 to 10: collect diamonds for team upgrades, emeralds from the middle, rush the nearest enemy bed.
- While the bed stands a dead player respawns after 5 seconds; once it is broken the next death is final. The last team with a living player wins.
- Generator upgrades on a timeline; beds are destroyed automatically late in the match, then sudden death. Original timeline: about 6, 12, 18 and 24 minutes for tiers, 30 minutes beds gone. Ours is compressed for 15-minute school sessions.

## Map
- Four (or eight) team islands on a ring, about 60 blocks from the centre, each about 20 by 20 blocks.
- Diamond islands between the team islands, the emerald island in the middle, all separated by void.
- Choke points are the bridges; the void kills, so knockback near edges decides fights.

## Numbers (relative)
- Health 20 (10 hearts). Swords: wood 4, stone 5, iron 6, diamond 7 damage; leather armour by default.
- Diamond generators: one every 30 s, then 24 s, then 12 s. Emeralds: 65 s, 50 s, 35 s.
- Shop: wool 16 for 4 iron, clay 16 for 12 iron, glass 4 for 12 iron, hard stone 12 for 24 iron, planks 16 for 4 gold, obsidian 4 for 4 emeralds; stone sword 10 iron, iron sword 7 gold, diamond sword 4 emeralds, knockback stick 5 gold; chainmail 24 iron, iron armour 12 gold, diamond armour 6 emeralds (armour is kept); shears 20 iron; pickaxe and axe tiers (downgraded by one tier at each death); bow 12 gold, arrows 8 for 2 gold; golden apple 3 gold, fireball 40 iron, TNT 4 gold, ender pearl 4 emeralds, bridge egg 1 emerald.
- Team upgrades in diamonds: sharpened swords 4, reinforced armour 2/4/8/16, maniac miner 2/4, forge 2/4/6/8, heal pool 1, alarm trap 1.
- Mining: shears cut wool fast, axe for wood, pickaxe for clay, stone and obsidian; obsidian takes many seconds even with a diamond pickaxe.
- Movement as a blocky sandbox: walk 4.3 blocks/s, sprint 5.6, jump 1.25 blocks, sneak stops you at edges (needed for bridging).

## Interface
- Hotbar at the bottom with counts, hearts above it, resources counts, scoreboard on the right (teams, bed alive tick or cross, players left, next event timer).
- Big title on events: "BED DESTRUCTION", "You died! Respawning in 5", "FINAL KILL", "VICTORY".
- Shops are menus of item tiles with prices, green when you can afford them.

## Feel
- Quick melee with knockback, red flash and hurt sound; bed breaking plays a loud alarm for the owner.
- Generators hum and items pop out; pick-up plop sound.

## Strategy and beginner mistakes
- Defend the bed early, then rush. Sprint-hit for knockback. Bridge while sneaking.
- Beginners leave the bed open, fall into the void while bridging, fight on bridges without blocks, and forget to buy armour.

## What the game uses (decisions)
- Map: up to four team islands 32 blocks from the middle, four diamond islands on the diagonals, a raised middle island with two or four emerald generators; void below.
- Timeline (compressed for school sessions): Diamond II 5:00, Emerald II 8:00, Diamond III 11:00, Emerald III 14:00, all beds destroyed 17:00, sudden death 21:00 (no regeneration, slow damage), end 25:00.
- Combat: 1.8-style clicking with 0.5 s invulnerability after a hit, knockback 6.2 blocks/s (plus 3.6 when sprinting), critical hits while falling (x1.5), armour 4 percent per point, protection upgrades on top.
- Mining is five times slower in the air; only placed blocks and enemy beds can be broken.
- Hotbar slots are fixed (stacks never move); the sword, tools and shears return after death, tools one tier lower.

## Bot results (headless series, sides swapped every match)
- Two teams, one player each: Hardest beat Hard 69 of 100.
- Four teams, one player each (two Hardest and two Hard teams): a Hardest team won 17 of 20.
- Two teams of two: even, 19 of 40 for Hardest (bed rushes and bridge knock-offs decide these games).
