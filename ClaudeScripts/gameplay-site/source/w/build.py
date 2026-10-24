import json, sys, os, re
d = sys.argv[1]
names = json.load(open(os.path.join(d, '_order.json')))
have = os.listdir(d)
def fname(k, n):
    ext = 'js' if k == 'script' else 'html'
    c = sorted(f for f in have if re.fullmatch(r'\d{3}_' + re.escape(n) + r'\.' + ext, f))
    if not c:
        sys.exit('missing part ' + n)
    return os.path.join(d, c[0])
idxs = [i for i, (k, n) in enumerate(names) if k == 'script' and n.startswith('covers_')]
skip = set(range(idxs[0] - 1, idxs[-1] + 1)) if idxs and os.environ.get('DROP_COVERS') else set()
out = []
for idx, (k, n) in enumerate(names):
    if idx in skip:
        continue
    b = open(fname(k, n), encoding='utf-8', newline='').read()
    out.append('<script>\n' + b if k == 'script' else b)
open(sys.argv[2], 'w', encoding='utf-8', newline='').write(''.join(out))
