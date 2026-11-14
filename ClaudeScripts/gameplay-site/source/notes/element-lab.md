# Element Lab: study notes

Genre model: the best-known element-combining puzzle for phones and browsers (start from four elements, combine two at a time, discover hundreds).

## Session loop
- The board starts empty and the library holds Air, Earth, Fire and Water. The player drags two elements onto each other; a valid pair becomes a new element, which appears with a short "new element" card and joins the library. An invalid pair simply bounces apart.
- Early discoveries come every few seconds (steam, mud, lava, wind); after about 50 elements the player has to think, and progress slows to a discovery every half minute or so. A full run takes several hours spread over many short sessions, so progress must save constantly.
- No timer and no failure: the "end" is finding every element; most players stop and come back later.

## Systems and conventions worth copying in spirit
- About a third of all elements are "final": they cannot be combined further. The original marks them and lets the player hide them.
- Most elements have two or three recipes, so there is more than one path; recipes follow everyday logic and puns (sand + fire = glass, human + fire = firefighter).
- Hints are rationed and recharge with time; a hint first names one ingredient, then the other.
- An encyclopedia lists every element, its recipes ("made from") and what it is used in, with found, missing and final filters and a search.
- Controls: drag from the library to the board, drag on the board to combine, double-click or double-tap to copy, drag back to the library to remove, a button to clear the board. Search in the library is essential once the list is long.

## Beginner mistakes
- Trying random pairs instead of thinking about what a thing is made of; forgetting that an element can combine with itself (air + air).
- Losing track of which elements still have undiscovered recipes; the "hide finished" filter and the "N more can be made" line in the encyclopedia answer that.

## Our version (decisions)
- Original title and recipe tree: 560 elements in eleven categories and about 1,070 recipes written for this game. Ordinary words keep their names; seven recipes in ten differ from the copy that was here before, and the obvious physical ones (water + fire = steam) stay because there is no other logical answer.
- All icons are drawn in code in one flat, outlined style; 67 new icons were added for the new elements.
- Element names in English and French; the interface in six languages.
- Saves store element names, not positions in a list, so later additions never break an old save.
