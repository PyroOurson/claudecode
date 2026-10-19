#!/bin/bash
cd /tmp/gameplay-build/w/agents2/covers
for id in "$@"; do
  S=scenes/$id.py; [ -f scenes/${id}_.py ] && S=scenes/${id}_.py; nice -n 5 ../../../blender/venv/bin/python $S f > logs/$id.log 2>&1
  grep RENDERED logs/$id.log
  python3 make.py $id -f >> logs/$id.log 2>&1
  tail -1 logs/$id.log
done
