# Beat Duel: study notes

The best-known game of this kind is the arrow-lane rap battle from 2020 (four lanes, a singer against an opponent, weeks of three songs). Studied from public wikis, guides and engine documentation. Everything in Beat Duel (songs, charts, characters, stages, art, sounds, names, scoring numbers) is original.

## Session loop and pacing
- Title, main menu (story, freeplay, options), week select with difficulty, then three songs in a row, each after a short countdown on the beat.
- Songs last 1.5 to 3 minutes. The opponent sings a phrase, then the player answers a phrase of the same length: call and response every two or four bars. Charts get denser in the last third and in later weeks; later weeks are faster (100 to 180 beats per minute).
- A lost song shows a game-over screen with an instant retry; a finished week shows the total score. Freeplay plays any unlocked song alone, with a preview of its chorus.

## Controls and timing
- Four lanes (left, down, up, right) on the arrows or D F J K, rebindable; long notes are held; phone players tap the four lanes.
- Judgement windows of roughly 45, 90, 135 and 165 ms are the genre norm; a miss and a dropped hold cost health. Ghost tapping (no penalty for a press with no note) is on by default in modern versions. Downscroll, scroll speed and an audio offset with a tap calibration screen are expected options.

## Interface
- Four receptors at the top (or bottom with downscroll), the player's lanes on the right, the opponent's on the left.
- Health bar at the bottom with both characters' icons on the dividing point; the losing side's icon looks hurt. Score, misses and accuracy in one line under it. Judgement word and combo number pop near the middle and fade.
- Characters bob on every beat and strike a pose per lane; a miss shows a stumble. The camera pulses every bar.

## Feel and sound
- Optional hit sound; the player's vocal track mutes on a miss and returns on the next hit. Countdown beeps on the beat; a short game-over sting.

## Strategies and beginner mistakes
- Beginners mash (ghost tapping hides it), release holds early and watch the opponent's notes. Experienced players read patterns (stairs, jacks, trills), keep their fingers on the home row and calibrate the offset first.

## Decisions for Beat Duel
- Judgements Perfect, Great, Good and Sloppy with Beat Duel's own windows and points; accuracy grades S+ to F.
- Three weeks (three opponents and stages), nine songs composed in code with their own charts at three difficulties, a menu theme, an online one-against-one battle.
