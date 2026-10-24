#!/bin/bash
while pgrep -f "chain.sh" > /dev/null || pgrep -f "runfinal.sh reaction" > /dev/null; do sleep 20; done
cd /tmp/gameplay-build/w/agents2/covers
./runfinal.sh tanks-3d sea-battle reaction sky-runner
python3 contact.py
