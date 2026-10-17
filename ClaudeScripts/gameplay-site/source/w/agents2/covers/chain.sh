#!/bin/bash
while pgrep -f "runfinal.sh reaction" > /dev/null; do sleep 20; done
cd /tmp/gameplay-build/w/agents2/covers
./runfinal.sh whack air-hockey typing rhythm checkers pong tictactoe archery sequence pinball slide box-pusher number-memory reversi pipe-connect cps-test chimp-test hangman true-false maze-tanks stack
python3 make.py chess -f
