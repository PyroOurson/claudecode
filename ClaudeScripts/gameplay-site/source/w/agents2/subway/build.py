import os, glob, sys
A = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(A, '..', '..', 'parts', '121_g_sky-runner.js')
src = ''.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(A, 'src', '*.js'))))
open(os.path.abspath(P), 'w', encoding='utf-8', newline='').write(src)
print('wrote', os.path.abspath(P), len(src))
