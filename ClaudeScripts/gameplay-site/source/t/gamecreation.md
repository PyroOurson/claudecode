# gamecreation.md: the gameplay studio standard

Read all of this before you touch a game. It applies to every game on gameplay. Most games on the site are recreations of famous games, and for those the bar is fidelity: **the game must be the real game, rebuilt for the browser**, not a game "inspired by" it. For classic games (cards, board games, puzzles) the bar is the official rules plus studio-quality presentation. For original games the bar is a polished, complete game.

## 1. The fidelity bar for recreations

A player who knows the real game must:
- recognise it within 5 seconds from the title screen and the first frame of play;
- find every control on the key or gesture the real game uses;
- see the HUD elements where the real game puts them, with the same information;
- find the same modes, in the same menu structure, with the same names;
- feel the same pacing: speeds, jump heights, timers, cooldowns, costs, damage and scores come from research, not from guesses;
- meet the same characters, items, enemies, maps, levels and terms, with their real names;
- get at least the content of the real game's first hour of play: its first levels, worlds, maps or tracks in order, its starting characters or units and the items they meet, and the full set when the real game's set is small (a few maps, one deck, one board).

If any of these is not true, the game is not finished. The question to ask is: would a fan of the real game believe they are playing it?

## 2. Research protocol (mandatory, before any code)

1. **Use WebSearch and WebFetch.** Memory is not a source. Every fact in the dossier has a URL.
2. **At least 6 sources**, of different kinds:
   - the official site, store page or official rules;
   - the main wiki (Fandom or the community wiki);
   - a mechanics or numbers reference (wiki data pages, community spreadsheets, speedrun or competitive guides);
   - a guide or walkthrough that describes the first minutes of play and the menus;
   - for card and board games, the official rulebook or pagat.com;
   - one more source to cross-check anything that two sources disagree on.
3. **Write the dossier** `docs/research/<id>.md` (in C:\Users\gabri\Desktop\Documents\gameplaygames\docs\research\) with these sections:
   - Sources (URL and what each was used for).
   - Core rules and win/lose conditions.
   - Controls (keyboard, mouse, touch, controller as the real game does them).
   - Numbers: every speed, size, timer, cooldown, cost, damage, score value and probability you found, each with its source. Write "unknown" rather than inventing one.
   - Modes and menus: the real menu tree and mode list.
   - Content lists: maps or levels (with layouts and landmarks described), characters, items, enemies, power-ups, cards, with their real names and stats.
   - Visual reference: camera angle and distance, proportions of the main character or object, colour palette (hex values from reference images), HUD layout (what is in each corner), signature effects.
   - Audio reference: which events have sounds, the character of each sound, the music style.
   - Multiplayer: player counts, lobby flow, what is shared.
4. **Fidelity checklist** at the end of the dossier: 40 or more numbered items, each tagged **Must** (a fan would notice it is wrong or missing) or **Should**, each with a status after you play the current build: *matches*, *differs* (say how) or *missing*.

## 3. Order of work

1. Research and dossier (about 25% of your time).
2. Play the current build with real input and fill in the checklist status.
3. Fix in this order: things that are **wrong** (wrong rules, wrong numbers, wrong controls, wrong names) before things that are **missing**, and within each, what a player notices first: the first frame, the controls, the core loop, the HUD, the menus, then content and depth.
4. Re-test after every change.

## 4. Undo earlier departures

Earlier passes sometimes changed recreations away from the real game to be "original": renamed buildings, units, items or currencies, renamed the HUD labels or title, replaced real levels with invented ones, invented modes that the real game does not have. **Undo these.** Real names, real levels, real modes. Invented extras may stay only if the real ones are all present and the extra does not push them aside in the menus.

## 5. What is allowed and what is not

Allowed and expected, made by hand in code:
- the real rules, mechanics, numbers, controls and menu structure;
- the real names of the game, modes, characters, items, units, maps and levels;
- maps and levels rebuilt from research (layouts, landmarks, proportions);
- characters, vehicles and objects modelled in code (three.js geometry, canvas or SVG drawing) to match the real silhouettes, proportions and colours;
- HUD and UI laid out like the real game, drawn in code, using system fonts or the fonts the site already loads, picked to look close to the real ones.

Not allowed:
- files copied from the game or its site: sprites, textures, models, sounds, music, fonts, logo images;
- tracing official artwork pixel by pixel;
- downloading anything at runtime from another site (fonts, images, scripts, data).

## 6. Quality bar for every game

**First minute**: a title screen in the game's own style with a clear Play button, modes, how to play and settings; how to play shown the first time, with controls for the device in use; an easy first round.

**Core loop**: controls respond within one frame (input buffering, coyote time where the real game has it); feedback for every action (sound, animation, particles, screen effects that respect reduced motion); a difficulty curve; fair and readable failure.

**Depth**: all the real game's modes; computer opponents at several levels with genuinely different behaviour (easy makes understandable mistakes, normal plays the basic strategy, hard plans ahead, expert where the genre allows); enough content that a 15-minute session has no repeats.

**End of a run**: a real result screen like the real game's, with one-key restart.

**Pause and settings**: Esc pauses offline games; sound volume and the settings the real game offers.

**Visuals**: one coherent art direction matching the real game; 3D with modelled objects (not single boxes), procedural textures, proper light, fog and sky; 2D drawn with care, devicePixelRatio-aware; eased animation; text never overflows at 390 px wide.

**Sound**: WebAudio-generated sounds for every primary event, mixed sensibly, respecting the site mute switch.

**Multiplayer**: games people play together have online play through api.net.room (see SRC\w\agents_net\API.md), host-authoritative, hidden information kept hidden, rematch; bots fill seats; solo vs bots always available.

**Performance**: 60 fps on an ordinary laptop; no per-frame allocations in hot paths; dispose three.js resources on unmount; zero console errors and warnings; keyboard, mouse and touch all work.

## 7. Classic and original games

The research protocol applies to classic games too: the official rulebook or pagat.com, and the best-known digital versions as the reference for presentation and bots. Use the official rules, including the common variants as options. Present them like a well-made physical game: real card faces and backs, felt or wood tables, pieces with bevels, dealing and moving animations. Bots: rule-correct at every level, with strategy that improves with the level.

Original games (not named after a real game): research the two or three best-known games of the same genre and use them as the bar for feel, content and presentation, without copying them.

## 8. Covers

Recreations keep the real game's cover that the site uses. Do not replace it. Classic and original games use a drawn cover in the site's style (SRC\w\agents2\covers\flat\, see kit.js and existing art files), 960x600 WebP under 80 KB in SRC\w\covers2\.

## 9. Verification and definition of done

1. Go through the checklist item by item in the running game. Mark each one again.
2. Score each area 0 to 10: rules, controls and physics, content, visuals, audio, menus and modes, multiplayer (or n/a).
3. Done means: every Must item *matches*, every area scores 8 or more, zero console errors, works at 390x844 with touch, 60 fps. If something cannot be done in your time, the report says exactly what and why.
4. Report: add a "Fidelity pass" section to docs\playtest2\<id>.md with the scores, what changed, the checklist items still open, and screenshot paths.

## 10. Working in the codebase

- Source: C:\Users\gabri\source\repos\claudecode\ClaudeScripts\gameplay-site\source (SRC). Each game lives in SRC\w\parts\NNN_g_<ids>.js; several games can share one file, and you only edit the part of the file that belongs to your game.
- Generated games: Rocket League is built from SRC\rl\seg\*.js (`python -I tools/join.py lead all` in SRC\rl, then copy build\lead_all.js to w\parts\115_g_rocket-soccer.js); Minecraft from SRC\w\agents2\minecraft (mk.py); Subway Surfers from SRC\w\agents2\subway (build.py). Edit the sources and regenerate; never edit only the generated part.
- Rules: no comments in code; keep each file's line endings as they are in git (CRLF files stay CRLF); plain JavaScript in the existing style; the game API is described in SRC\w\agents_net\API.md and in the existing games.
- Touch only your game: its part (or generator sources), its research dossier and its report. Never edit the portal (SRC\w\new\*), other games, covers of recreations, the build scripts or the SQL. Do not add site features.
- Test: `python SRC\t\pbuild.py C:\tmp\<you>\pb <id>` builds a test page; SRC\t\play.js has a Playwright harness (`open(html, id, opts)`) with Supabase faked; Playwright is at C:/tmp/pw/node_modules/playwright (use channel 'chrome'). Check `node --check` on the part (for Rocket League, on the joined file), play with real keyboard, mouse and touch input, look at the screenshots yourself, and check 390x844.
