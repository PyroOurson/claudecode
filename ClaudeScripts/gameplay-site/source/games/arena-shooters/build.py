import os, sys
here = os.path.dirname(os.path.abspath(__file__))
CORE = ['sim', 'bots', 'view', 'maps', 'game']
GAMES = {'hopfire': '311_g_hopfire.js', 'yolk-ops': '313_g_yolk-ops.js'}
parts = os.path.join(here, '..', '..', 'w', 'parts')
read = lambda f: open(os.path.join(here, 'src', f + '.js'), encoding='utf-8', newline='').read().rstrip('\n') + '\n'
want = sys.argv[1:] or list(GAMES)
for g in want:
    if g not in GAMES or not os.path.exists(os.path.join(here, 'src', g + '.js')):
        continue
    out = "(() => {\n  'use strict';\n" + ''.join(read(f) for f in CORE) + read(g) + '})();\n'
    target = os.path.join(parts, GAMES[g])
    open(target, 'w', encoding='utf-8', newline='').write(out)
    print(os.path.abspath(target), len(out))
