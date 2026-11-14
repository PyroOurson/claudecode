import os, sys
A = os.path.dirname(os.path.abspath(__file__))
P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(A, '..', '..', 'w', 'parts', '121_g_subway-surfers.js')
src = open(os.path.join(A, 'src', 'subway-surfers.js'), encoding='utf-8').read()
open(os.path.abspath(P), 'w', encoding='utf-8', newline='').write(src)
print('wrote', os.path.abspath(P), len(src))
