import os
import shutil
import subprocess
import sys

SRC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'w'))


def main():
    if len(sys.argv) < 2:
        sys.exit('usage: python pbuild.py OUTDIR [game-id ...]')
    out = os.path.abspath(sys.argv[1])
    want = sys.argv[2:] or ['snake', '2048', 'chess', 'last-card', 'poker']
    w = os.path.join(out, 'w')
    os.makedirs(w, exist_ok=True)
    for f in ('assemble.py', 'meta_rows.py', 'stat.json', 'minibuild.py'):
        if os.path.exists(os.path.join(SRC, f)):
            shutil.copy2(os.path.join(SRC, f), os.path.join(w, f))
    for d in ('new', 'parts_orig'):
        if os.path.isdir(os.path.join(w, d)):
            shutil.rmtree(os.path.join(w, d))
        shutil.copytree(os.path.join(SRC, d), os.path.join(w, d))
    pd = os.path.join(w, 'parts')
    os.makedirs(pd, exist_ok=True)
    for f in os.listdir(os.path.join(SRC, 'parts')):
        s = os.path.join(SRC, 'parts', f)
        t = os.path.join(pd, f)
        if not os.path.exists(t) or os.path.getmtime(t) < os.path.getmtime(s) or f.startswith(('000_', '001_', '142_')):
            shutil.copy2(s, t)
    r = subprocess.run([sys.executable, 'assemble.py'], cwd=w)
    if r.returncode:
        sys.exit('assemble failed')
    env = dict(os.environ, GP_PARTS=pd)
    r = subprocess.run([sys.executable, 'minibuild.py', os.path.join(out, 'mini.html')] + want, cwd=w, env=env)
    if r.returncode:
        sys.exit('minibuild failed')


if __name__ == '__main__':
    main()
