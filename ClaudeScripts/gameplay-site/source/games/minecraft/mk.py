import os, sys
here = os.path.dirname(os.path.abspath(__file__))
FILES = ['blocks', 'textures', 'world', 'entities', 'interface', 'main']
out = ''.join(open(os.path.join(here, 'src', f + '.js'), encoding='utf-8', newline='').read().rstrip('\n') + '\n' for f in FILES)
target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '..', '..', 'w', 'parts', '057_g_minecraft.js')
open(target, 'w', encoding='utf-8', newline='').write(out)
print(os.path.abspath(target), len(out))
