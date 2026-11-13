# Hopfire: study notes (fast low-poly browser shooter)

Model: the fast low-poly browser shooter that schools know from unblocked sites (classes, sliding, bunny hops, short free-for-all rounds). Sources: the public class and weapon wikis (krunkerio.fandom.com Classes and Machine Gun pages, NamuWiki class and weapon pages, the official classes guide), patch notes and gameplay footage. Nothing was copied: names, maps, models, sounds and art are new.

## Session loop and pacing
- Click Play and you are in a running match within seconds. No lobby wait: spawn, fight, die, respawn in about 3 seconds, change class while dead.
- Free-for-all rounds last 4 minutes (or first to a kill limit). Team deathmatch: two teams, same length. End screen: placings, kills, deaths, accuracy, then the next round starts after a short countdown.
- Kill streak call-outs (double kill, triple kill, streak of 5, 10). Health regenerates after a few seconds out of combat.

## Maps
- Small, dense maps: about 80 to 100 m across for a 1.8 m player; a central open area with a tower or raised platform, two or three lanes around it, rooftops reachable by crates and ramps, long sightlines along the lanes for snipers and short corners for shotguns and SMGs.
- Fights happen at the centre and on the rooftops; ramps are used to launch slide hops.
- Spawns spread around the edge, chosen away from enemies.

## Controls and numbers (relative)
- WASD, mouse look, left click fire, right click aim down sights (snipers zoom), R reload, Space jump, Shift or C crouch; crouching while running is a slide (speed burst that fades in about 0.7 s), sliding into a jump keeps the speed. Jumping again on the frame you land keeps momentum (bunny hop); air strafing turns without losing speed. Q or 1/2 swaps primary and secondary, V or F melee, Tab scoreboard.
- Walk speed is high (about 1.4 times a tactical shooter). Class speed multipliers 0.86 (rocket) to 1.2 (fast SMG), health 60 (sniper) to 170 (machine gun).
- Weapons: rifle 23 damage every 110 ms, 30 rounds; sniper 100 at 900 ms, one shot; SMG 18 at 90 ms; shotgun 5 pellets of about 50 at 450 ms; revolver 66 at 450 ms; machine gun 17 at 125 ms, 3.3 s reload; burst rifle 3 x 28 at 280 ms; semi-auto rifle about 30 to 35. Headshots x1.5 to x2. Pistol secondary on most classes.
- Aiming in tightens the spread to almost zero and slows you; hip fire spreads more while moving or in the air.

## Interface
- Bottom left: health bar with number. Bottom right: ammo (magazine / reserve) and weapon name. Top centre: timer and the leader's score. Top right: kill feed. Top left: top three scores. Crosshair with spread, hit marker on hit (red for a kill), damage direction indicator, "Headshot" pop. Tab: full scoreboard. Death screen: killer's name and class, respawn countdown, class picker.

## Feel
- Snappy: no head bob delay, quick weapon swap, hard recoil kick that returns quickly, bright muzzle flash, crisp hit sounds, a distinct kill sound and headshot ding.
- Low-poly blocky players and maps with flat colours and small pixel textures.

## Strategies and beginner mistakes
- Good players slide-hop between cover, strafe while shooting, aim for the head, use rooftops and keep moving; snipers quick-scope.
- Beginners stand still while shooting, walk instead of hopping, reload in the open and peek the same corner twice.

## Decisions for Hopfire
- Classes: Rifleman (rifle), Scout (sniper, 60 HP, fast), Dasher (SMG, fast), Heavy (machine gun, 170 HP, slow), Brawler (shotgun), Gunslinger (revolver), Blaster (rocket launcher, 130 HP, slow). Pistol secondary for most, a knife for all.
- Modes: Free for all, Team deathmatch; bots Easy, Normal, Hard, Hardest; online through the party system with bots filling seats.
- Three original maps: Brickyard (town square with a clock tower), Frostbyte (snowy depot with containers and a crane), Dunepost (desert outpost with a sunken market).
