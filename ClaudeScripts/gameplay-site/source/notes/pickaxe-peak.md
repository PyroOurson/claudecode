# Pickaxe Peak: study of the genre and design decisions

Genre model: the best-known hammer-climbing game (2017): a man sitting in a pot climbs a mountain of rocks and junk with a sledgehammer moved by the mouse. Studied from guides, speedrun write-ups and gameplay knowledge. Nothing was copied: the character, the climb, the lines and the art are our own.

## Session loop and pacing
- One long hand-made climb, no levels, no checkpoints. The game saves your exact position when you quit and you continue from there.
- A first climb takes hours; a practised player finishes in minutes (speedruns are under two minutes). Progress is only ever height.
- A fall can cost seconds or an hour: the course is built so that slips in the upper parts drop you far below.
- Zones in order, each teaching one skill: a flat start with a tree and boulders (pushing up, hooking an edge); a chimney (bracing between two walls); a long slippery slope (staying on with the tool); a pile of furniture and junk (hooking handles and corners); a long curved pipe; an icy mountain (very little grip); a tall tower with thin holds; the summit, then the ending.

## Controls and physics
- Mouse only. The tool head follows the mouse relative to the body (not the cursor on screen), within a reach of about four body widths. The body has no legs: it only moves when the tool pushes against something.
- When the head is blocked by the ground, moving the mouse moves the body instead (push down to lift yourself, pull to drag yourself over an edge).
- The head grips most surfaces and slides on smooth ones (ice, metal, polished stone). The handle also collides, so it can hook over edges.
- Fast mouse flicks with the head planted launch the body (jumping); the body keeps its momentum, so overshooting is a real risk.
- Trackpads and phones: sensitivity setting; touch works by dragging (relative, like a trackpad).

## Interface and feel
- Almost nothing on screen: no score, no timer by default (an optional timer for speedrunners). The camera follows smoothly and shows a lot of the world above.
- The original has a calm narrator who comments on falls and progress. Here there are a few short original lines shown as text (can be switched off).
- Sounds: the tool on rock, wood, metal and ice each sound different; the pot scraping; a gust when you fall far.

## Common mistakes
- Swinging the mouse fast all the time; good players make slow, small, deliberate moves and plant the head before pushing.
- Hooking an edge and pulling too hard, which flips the body over the top and down the other side.

## Decisions for our version
- Character: Pip, a mole sitting in a copper bucket, climbing out of his molehill with a long miner's pickaxe.
- Physics: a fixed 240 Hz step. Bucket and pick form one point body with contact probes (bucket circle, pick head, two points on the handle). The pick offset follows the cursor at most 9.5 m/s; when a probe touches rock the body moves instead (position-based contacts with friction per material). This gives planting, pushing, hooking and flick-launches without extra rules, and the same result at any frame rate.
- Testing: a search bot (random pick gestures, beam search along a route line) climbed the whole course in 862 gestures; the same input stream replayed in the real game reached the summit in 14:14. Use the bot again after any course change.
- One climb of 146 m with nine zones (Molehill Meadow, Shelf Steps, The Chimney, Clay Chute, Junk Heap, Long Pipe, Ice Shelf, The Spires, Summit), built so that falls in the upper zones drop far. Continue from the exact saved position; best time and number of summits kept.
