# gamecreation.md: the gameplay studio standard

Every game on gameplay, whether it already exists or is about to be created, is held to this standard. Read all of it before you touch a game. It applies to remakes of famous games, to classics (cards, board games, puzzles) and to original games alike. "Good enough for a browser game" is not the bar. The bar is: a player who opens it should believe a small professional studio made it.

## 1. What a finished game has

A game is finished only when every item below is true.

**First minute**
- A title screen in the game's own art style (not a plain form): logo/title treatment, a clear primary button (Play), secondary buttons (Modes, How to play, Settings) and the player's best score.
- How to play is shown the first time, in 3 to 5 short illustrated steps, and can be reopened. Controls are shown for the device in use (keyboard or touch).
- The first 30 seconds teach by doing: the first level/round is easy and introduces one mechanic at a time.

**Core loop**
- Controls respond within one frame. Input buffering and coyote time for jumps. No input is ever swallowed.
- Every action has feedback: a sound, an animation, and often a particle or screen effect (hit flash, squash and stretch, small camera kick that respects "reduce motion").
- Difficulty ramps. Endless games speed up or add hazards on a curve; level games have a designed progression where each level adds one idea.
- Failure is fair and readable: the player always understands why they lost.

**Depth and variety**
- At least three ways to play where it fits the genre: modes (Classic, Timed, Endless, Daily), difficulties, board sizes, rule variants, track/map choice.
- Computer opponents at several levels with genuinely different behaviour, not just slower reactions:
  - Easy: makes understandable mistakes, never punishes hard.
  - Normal: plays the basic strategy correctly.
  - Hard: plans ahead (lookahead, card counting, positioning, combos).
  - Expert where the genre allows (chess-like games, cards, racing): close to the best strategy you can implement in the time.
- Content that lasts: enough levels, maps, tracks, words, questions, cards or enemy types that a player does not see repeats in a 15-minute session.
- Progression that rewards coming back: best scores per mode, stars or medals, unlocks (skins, colours, tracks) earned by playing, simple stats (games played, win rate, best streak).

**End of a run**
- A real result screen: outcome, score, best, a few stats from the run (accuracy, time, combo), what was unlocked, and a one-key/one-tap restart (Space/Enter or a big button). Never a bare alert or a frozen frame.

**Pause and settings**
- Esc (and a visible button on touch) pauses offline games and shows Resume, Restart, Settings, How to play, Quit. Online games open the same menu without freezing other players.
- Settings that matter for the game: sound and music volume, difficulty, controls, colour-blind friendly palette where colour carries meaning.

## 2. Visual quality

- **Art direction first.** Pick a coherent style for the game (flat vector, soft 3D, pixel art, paper, neon) and apply it to everything: background, characters, UI, fonts, particles. No mix of placeholder rectangles and detailed art.
- **2D art** is drawn in code (Canvas or SVG) with care: shapes with highlights and shadows, outlines where the style uses them, gradients used with restraint, consistent light direction, hand-tuned colours (not raw #ff0000 primaries). Characters have personality: eyes, poses, idle animation.
- **Cards and boards** look like real, well-made physical objects: card faces with proper pip layouts, court cards with drawn figures, a card back pattern, soft drop shadows, a felt or wood table with texture (noise, grain or weave drawn procedurally), dealing, flipping and sliding animations, chips and pieces with bevels.
- **3D (three.js via api.gl)**: real models built from several primitives or custom geometry with bevels, not single boxes; materials with roughness and colour variation; procedural textures (canvas textures for asphalt, grass, wood, metal, fabric); proper lighting (hemisphere + directional with shadows where affordable), fog for depth, a sky; animated characters (walk/run/jump cycles), wheels that turn, suspension that moves; particles for dust, sparks, smoke and boost. Maps are designed spaces with landmarks, not empty planes.
- **Animation**: everything that moves eases (no linear pops). UI elements enter and leave with short transitions. Score counters roll. Respect prefers-reduced-motion.
- **Typography and UI inside games**: one display face for titles, one readable face for numbers and text, large clear HUD numbers, buttons that look pressable with hover/press states. Text never overlaps or overflows at 390 px wide.
- **Resolution**: crisp on high-DPI screens (devicePixelRatio-aware canvas), correct in the normal frame, theater mode and fullscreen, and at phone size 390x844 in portrait.

## 3. Sound

- Generated with WebAudio (no files): distinct sounds for primary actions, success, failure, UI clicks, and a short win/lose sting. Optional light music loop where the genre has music.
- Mixed sensibly: nothing harsh, nothing louder than the UI expects; respects the site mute switch.

## 4. Multiplayer

- Games people play together have online play through api.net.room (see SRC\w\agents_net\API.md): lobby with party code, host can fill seats with bots, host-authoritative rules, hidden information never sent to players who should not see it, rejoin/refresh recovery, rematch and back to lobby. No same-screen two-player modes.
- Solo against bots stays available for every multiplayer game.

## 5. Performance and stability

- 60 fps on an ordinary laptop, no frame spikes during play. Pool objects, avoid per-frame allocations, cap particles, dispose three.js geometry/materials/textures on unmount.
- Zero console errors and warnings. No softlocks: every state has a way forward.
- Works with keyboard, mouse and touch. Touch controls are designed (virtual stick/buttons or gestures), not an afterthought.

## 6. Remakes of famous games: what "accurate" means here

Many games on the site are named after famous games so friends can find them. For those:
- **Match the gameplay**: rules, scoring, controls, game modes, pacing, physics feel, the structure of the menus. Get rules exactly right (official rules for classic card and board games).
- **Do not copy protected content**: no ripped or traced models, sprites, textures, logos, characters, maps or level layouts, music or sound effects from the commercial game. Build original models, maps and art that capture the genre and the mood at the same quality level. An original arena, an original track, an original character design with the same role is the goal.
- Classic public games (chess, poker, solitaire, mahjong, go, backgammon...) have no such limit beyond not copying another product's art.

## 7. Covers

Every game has a 960x600 WebP cover in SRC\w\covers2\<id>.webp in the site's one cover layout: blurred, darkened background art, a centred 420 px rounded square icon (radius 96) with a soft shadow, and the game name in white Montserrat 800 underneath.

- The cover is drawn art made for it, like the existing drawn covers: an icon that reads at thumbnail size (one bold subject, strong silhouette, two or three main colours, light from the top left, a glossy highlight), and a background that shows the game's world. Not a raw screenshot, not official artwork.
- How: add one file SRC\w\agents2\covers\flat\art\g_<id>.js defining G['<id>'] = { icon() { ... 400x400 SVG content ... }, bg() { ... 960x600 SVG content ... } } with the helpers in flat\kit.js (r, c, e, p, d, sk, ln, t, lg/rg gradients, rep, pix, shade; look at a_core.js to e_batch.js for examples). Render with:
  `set COVER_PNG=C:\tmp\<you>\png` then `node SRC\w\agents2\covers\flat\render.js <id>=<Game Name>` and encode with `set COVER_OUT=C:\tmp\<you>\webp` then `python SRC\w\agents2\covers\flat\enc.py <id>`; copy the WebP to SRC\w\covers2\<id>.webp (under 80 KB). Look at it next to three existing covers before you keep it.

## 8. Process for every game

1. Read this file, the game's report in docs\playtest2\<id>.md and its soak folder C:\tmp\soak\out\<id>\.
2. Play it for real (Playwright with real inputs, keyboard and touch) and write down what a demanding player would notice first.
3. Plan the biggest quality jump you can deliver in your time: usually art and animation pass + feedback + difficulty/bot levels + one more mode or content set.
4. Build it, re-test after every step (node syntax check, real run, screenshots you actually look at, zero console errors, 390x844 check).
5. Make the cover.
6. Update docs\playtest2\<id>.md with a "Studio pass" section: what changed, before/after screenshots paths, what is still missing.

## 9. Self-review before handing in

Answer honestly, 1 to 10: Would a player believe a studio made this? Is the first minute clear? Does every action feel good? Is there a reason to play a second and third time? Does it look right on a phone? Anything below 7 means keep working or say exactly why not in the report.
