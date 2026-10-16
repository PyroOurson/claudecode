import os, sys, glob
here = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(here, 'src', '*.js')))
out = ''.join(open(f).read().rstrip('\n') + '\n' for f in files)
target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '..', '..', 'parts', '057_g_blockcraft-3d.js')
if target == 'lint':
    out += '  }\n})();\n' if '99_tail.js' not in ' '.join(files) else ''
    target = os.path.join(here, 'lint', 'all.js')
open(target, 'w').write(out)
print(target, len(out))
