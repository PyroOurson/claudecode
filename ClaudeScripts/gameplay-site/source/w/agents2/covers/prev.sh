#!/bin/bash
cd /tmp/gameplay-build/w/agents2/covers
for id in "$@"; do
  S=scenes/$id.py; [ -f scenes/${id}_.py ] && S=scenes/${id}_.py; ../../../blender/venv/bin/python $S q > logs/q_$id.log 2>&1
  echo "$id $(grep -E 'RENDERED|Error|rror:' logs/q_$id.log | tail -2 | tr '\n' ' ')"
done
python3 - "$@" <<'PY'
import sys
from PIL import Image
ids = sys.argv[1:]
W, H = 480, 300
cols = 2
rows = (len(ids) + 1) // 2
s = Image.new('RGB', (W * cols, H * rows), (40, 40, 40))
for i, id_ in enumerate(ids):
    try:
        im = Image.open('renders/%s_q.png' % id_).convert('RGB').resize((W, H))
        s.paste(im, ((i % 2) * W, (i // 2) * H))
    except Exception as e:
        print('miss', id_, e)
s.save('prev/batch.png')
PY
