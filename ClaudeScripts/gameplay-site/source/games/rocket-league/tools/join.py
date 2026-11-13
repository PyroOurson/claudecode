import sys, os, json, subprocess
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(R, '..', '..', 'w', 'parts')
PART = 'g_rocket-league'
FILES = ['physics', 'setup', None, 'arena', 'interface', 'visuals']
only = [x for x in os.environ.get('RL_MODELS', '').split(',') if x]
body = []
for name in FILES:
    if name is None:
        md = os.path.join(R, 'models'); ent = []
        for f in sorted(os.listdir(md)) if os.path.isdir(md) else []:
            k = f[:-5]
            if not f.endswith('.json') or k == 'dummy' or (only and k not in only):
                continue
            try:
                m = json.load(open(os.path.join(md, f)))
            except Exception:
                print('skip bad model', f); continue
            ent.append(json.dumps(k) + ': ' + json.dumps(m, separators=(',', ':')))
        body.append('        const crModels = {' + ', '.join(ent) + '};\n')
        continue
    body.append(open(os.path.join(R, 'src', name + '.js'), encoding='utf-8', newline='').read())
js = ''.join(body).replace('\r\n', '\n')
od = os.path.join(R, 'build')
os.makedirs(od, exist_ok=True)
jp = os.path.join(od, 'rocket-league.js')
open(jp, 'w', encoding='utf-8', newline='').write(js)
r = subprocess.run(['node', '--check', jp], capture_output=True, text=True)
if r.returncode:
    print('SYNTAX ERROR\n' + r.stderr[-3000:])
    sys.exit(1)
names = json.load(open(os.path.join(P, '_order.json')))
out, skip_gap = [], False
for idx, (k, n) in enumerate(names):
    ext = 'js' if k == 'script' else 'html'
    cand = [f for f in os.listdir(P) if f.endswith('_' + n + '.' + ext) and f[:3].isdigit()]
    fn = os.path.join(P, cand[0] if cand else '%03d_%s.%s' % (idx, n, ext))
    if k == 'script' and n.startswith('g_') and n != PART:
        skip_gap = True
        continue
    if k == 'gap' and skip_gap:
        skip_gap = False
        if idx != len(names) - 1:
            continue
    skip_gap = False
    b = js if (k == 'script' and n == PART) else open(fn, encoding='utf-8', newline='').read()
    out.append('<script>\n' + b if k == 'script' else b)
hp = os.path.join(od, 'rocket-league.html')
open(hp, 'w', encoding='utf-8', newline='').write(''.join(out))
if 'nopart' not in sys.argv:
    open(os.path.join(P, '115_' + PART + '.js'), 'w', encoding='utf-8', newline='').write(js)
print('ok', os.path.abspath(hp), len(js), 'bytes of game code')
