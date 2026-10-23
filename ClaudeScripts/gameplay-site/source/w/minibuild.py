import json, os, re, sys
P = os.environ.get('GP_PARTS', '/tmp/gameplay-build/w/parts')
out, want = sys.argv[1], sys.argv[2:]
names = json.load(open(os.path.join(P, '_order.json')))
have = os.listdir(P)
def fname(k, n):
    ext = 'js' if k == 'script' else 'html'
    c = sorted(f for f in have if re.fullmatch(r'\d{3}_' + re.escape(n) + r'\.' + ext, f))
    if not c:
        sys.exit('missing part ' + n)
    return os.path.join(P, c[0])
res, skip = [], False
for idx, (k, n) in enumerate(names):
    if k == 'script' and n.startswith('g_') and not any(w in n[2:].split('+') for w in want):
        skip = True
        continue
    if k == 'gap' and skip and idx != len(names) - 1:
        skip = False
        continue
    skip = False
    b = open(fname(k, n), encoding='utf-8', newline='').read()
    res.append('<script>\n' + b if k == 'script' else b)
open(out, 'w', encoding='utf-8', newline='').write(''.join(res))
print('built', out)
