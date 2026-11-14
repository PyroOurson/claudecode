# Click Beat: study notes

The best-known game of this kind is the free PC rhythm game where the player clicks numbered circles to the beat (2007 onward). Studied from its public wiki, ranking rules and community guides. Click Beat's songs, maps, skin, sounds, names and scoring numbers are original.

## Session loop and pacing
- Main menu, song select (song list, difficulties with a star rating, modifiers), a map of 1 to 4 minutes, then a results screen with a letter grade and a timing-error graph. Long gaps become breaks with a warning before play resumes.
- Difficulty rises inside a song at the chorus (a brighter, flashing section) and across difficulties: more objects, faster approach, smaller circles, longer jumps.

## Objects and timing (published values, used for feel)
- Playfield 512 x 384 units in a 4:3 box. Circle radius 54.4 - 4.48 x size; approach time from 1800 ms at the slowest setting to 450 ms at the fastest; three hit windows that shrink with the timing setting (about 80, 140 and 200 ms at the loosest).
- Circles with an approach ring that closes on the beat; sliders with a head, ticks, repeats and an end, followed while holding; spinners that need a number of turns.
- A combo number per object and combo colours that change with each new combo; a health bar that drains over time and refills on hits; failing at zero health.

## Controls
- Mouse to aim, left or right button or two keys (Z and X) to click; tap on a tablet or phone. Esc pauses, Space skips the intro.

## Interface
- Health at the top left, score and accuracy at the top right, combo at the bottom left, song progress as a small pie. A burst in one of three colours on each hit, a red cross on a miss. A cursor with a trail.

## Strategies and beginner mistakes
- Beginners click early because they watch the circle and not the ring, let go of sliders too soon and spin with the wrist. Better players stream with two keys and read the spacing as timing.

## Decisions for Click Beat
- Own judgement names and points (Perfect 100, Good 40, Okay 15), own grade thresholds, own modifier names (Relaxed, Strict, Speed Up, Fade Out, Safety Net, Autoplay) and plain stat names (size, approach, timing, drain).
- Eight original songs composed in code with generated maps at four difficulties; audio offset with a tap calibration screen.
