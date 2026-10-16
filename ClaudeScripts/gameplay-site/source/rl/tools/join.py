import sys, os, json, subprocess, shutil
R = '/tmp/gameplay-build/rl'
P = '/tmp/gameplay-build/w/parts'
who = sys.argv[1]
mode = sys.argv[2] if len(sys.argv) > 2 else 'own'
own = json.load(open(os.path.join(R, 'seg', '_owners.json')))
body = []
only = [x for x in os.environ.get('RL_MODELS', '').split(',') if x]
for name, o in own:
    if name == '07a_models':
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
    d = 'seg' if (mode == 'all' or o == who) else 'base'
    body.append(open(os.path.join(R, d, name + '.js'), encoding='utf-8', newline='').read())
js = ''.join(body)
od = os.path.join(R, 'build')
os.makedirs(od, exist_ok=True)
tag = who + ('_all' if mode == 'all' else '')
jp = os.path.join(od, tag + '.js')
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
    if k == 'script' and n.startswith('g_') and n != 'g_rocket-soccer':
        skip_gap = True
        continue
    if k == 'gap' and skip_gap:
        skip_gap = False
        if idx != len(names) - 1:
            continue
    skip_gap = False
    if k == 'script' and n == 'g_rocket-soccer':
        b = js
    else:
        b = open(fn, encoding='utf-8', newline='').read()
    out.append('<script>\n' + b if k == 'script' else b)
hp = os.path.join(od, tag + '.html')
open(hp, 'w', encoding='utf-8', newline='').write(''.join(out))
print('ok', hp, len(js), 'bytes of game code')
