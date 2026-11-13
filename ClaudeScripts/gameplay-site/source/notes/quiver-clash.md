# Quiver Clash (ragdoll archery duel)

Study of the best-known ragdoll archery duel (Ericetto's two-archer game; portal pages and player videos) and of the older stickman bow duels it follows.

## Loop and pacing
- Two stickman archers far apart, often on cliffs. Drag back to aim, release to shoot; arrows fly on a gravity arc, stick into bodies and push the ragdoll. Headshots hurt most. A duel round lasts 20 to 60 seconds.
- Modes: endless waves against computer archers with a boss now and then, one-on-one against the computer, two players.
- Between waves the player picks upgrades and special arrows. Stamina limits how fast you shoot.

## Controls and feel
- Pull-back aiming with a dotted trajectory hint, power shown while drawing. Release fires at once.
- Hit feedback: thud, the ragdoll jerks, the arrow stays in the body, damage numbers, a louder sound and a flash for headshots.
- Falling off a cliff is an instant loss.

## Interface
- Health and stamina bars top left and right, round score in the middle, arrow types at the bottom.

## Our design
- Kept from the previous version and audited: original arenas, archers, arrow types (fire, ice, bomb, triple, storm), upgrades, online 1v1 through the party system.
- `Hardest`: aims like a strong player with the trajectory preview on (solves the arc from the real bow hand, corrects after each miss, ignores shots blocked by terrain), takes 0.4 to 0.8 s to draw, waits for its reload, and has the same stamina and arrows as the player; it reads only positions both players can see.
- Phones held upright get a tall view at full height: the camera stays on your archer while you aim, follows arrows in flight, and an arrow at the screen edge points to the opponent, like the portrait archery duels on phones.
- Common beginner mistakes: shooting at full power every time (stamina runs out), aiming at the body instead of the head, standing still under fire.
