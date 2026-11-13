# Card games A: rules choices and study notes

Fifteen games in `w/parts/201` to `213`. Each exposes test hooks on its root element (`_pk`, `_bj`, `_dk`, `_tb`, `_cg`, `_t`) and its engine through `_t` in `Ameplay.register`, so match series run headless in Node.

## Rules followed
- Texas hold'em: tournament (Sit & Go) rules. Heads-up button posts the small blind and acts first before the flop. A short all-in raise does not reopen betting. Odd chips go to the first winner left of the button. Players busted in the same hand are ranked by their stack at the start of the hand.
- Blackjack: 6 decks, dealer peeks with an Ace or ten up, late surrender, double after split, split Aces get one card, 3 to 2 (6 to 5 option), insurance and even money.
- Durak: podkidnoy and perevodnoy. Lowest trump leads the first game, at most 5 cards in the first bout and 6 after, never more than the defender holds. Draw order attacker first, defender last.
- Belote (French rules): deal 3-2, turned card, two rounds, redeal when all pass. Must follow, must overtrump in a trump trick, need not trump when the partner is master, must undertrump in the classic game. Belote-rebelote 20 is always kept. Dix de der 10, capot 252, litige held for the next hand. Classic announcements (tierce 20, fifty 50, hundred 100, four Jacks 200, four Nines 150, other fours 100): declared with the first card, only the team with the best one scores, cards shown after the first trick, counted for the contract, given to the defence on a failed contract. Contrée: bids 80 to 160 and capot, coinche x2, surcoinche x4.
- French tarot (FFT): 78 cards, 3 to 5 players, Petite/Garde/Garde sans/Garde contre (x1, x2, x4, x6), contract 56/51/41/36 by oudlers, (25 + difference) x multiplier, petit au bout 10 x multiplier, poignées 20/30/40 to the winning side, chelem 400/200/-200, Excuse rules including the last trick, petit sec redeal. Five players call a King; the taker may not lead the called suit on the first trick except with the King itself (house rule most sites use; the FFT has no five-player rule book).
- Hearts: pass left, right, across, hold; 2 of clubs leads; no points on the first trick; hearts broken; moon adds 26 to others (or -26 option).
- Spades: partnerships, nil 100, blind nil 200 when 100 behind (option), bags with -100 at 10, game to 500, -200 loses.
- Euchre: 24 cards, bowers, order up, second round, stick the dealer (option), going alone, 1/2/4 points, euchred 2. Game to 10 points (was 5).
- President, Cheat, Old Maid, Go Fish, Crazy Eights, War, Speed: standard family rules with the options shown in each menu.

## Hardest
Belote, tarot, hearts, spades, euchre and crazy eights search in slices of a few milliseconds per frame during the bot's thinking time, so no frame freezes. Series results are in the agent report of round 21.
