# Strategy board games A: notes (round 21)

Games: chess, checkers, reversi (`037`), tic-tac-toe, connect four (`013`), Go, gomoku, dots and boxes (`229`), Chinese checkers, Blokus, Quoridor (`231`).

## What players of the well-known versions expect

- Chess (online chess sites, club play): full rules (castling rights, en passant, promotion with a choice of piece, checkmate, stalemate, threefold repetition, fifty-move rule, insufficient material), a clock with the usual time controls (3+2, 5+0, 10+0, 15+10, or none), loss on time unless the opponent cannot mate, the move list in standard notation, stepping back through the moves, flipping the board, copying the game as PGN, takeback and draw offers against the computer, no premoves. Castling by moving the king two squares or onto its rook.
- Go: 9x9, 13x13 and 19x19, Japanese or Chinese scoring, komi, handicap, ko, no suicide, pass, two passes end the game, then dead stones are marked and the board is counted.
- Gomoku: 15x15, freestyle, exactly five, Renju restrictions for Black. The first player wins nearly every game between strong players in freestyle.
- Dots and boxes: closing a box gives another turn; the game is won by the long-chain rule and by declining the last two boxes of a chain (the double-cross).

## Engines

- Chess: 0x88 board, alpha-beta with aspiration windows, principal variation search, transposition table, null move, late move reductions and pruning, static exchange evaluation for captures, tapered middlegame and endgame evaluation (piece-square tables, mobility, king safety, pawn structure, passed pawns, endgame scaling). Runs in a Web Worker. `Hardest` = 2400 on the strength slider, at most 2 s per move, less when a clock is short.
- Go: Monte Carlo tree search with RAVE, prior knowledge in the tree (captures, saving groups in atari, self-atari, edge lines, 3x3 shape patterns), playouts that answer ataris near the last move, play common 3x3 shapes and avoid self-atari. Runs in a Web Worker. `Hardest` = 60,000 playouts or 7 s on 9x9 (x1.5 on 13x13, x2.2 on 19x19), stopping early once the best move cannot change.
- Gomoku `Hardest`: deeper alpha-beta with threat search (fours and threes), and when the opponent has an open three only replies that block it or make a four are searched.
- Dots and boxes `Hardest`: exact search once 21 lines or fewer are left, search over safe moves when 13 or fewer remain, chain and loop values for the endgame.

Match scripts used for the `Hardest` proofs are not in git; the results are in the round report.
