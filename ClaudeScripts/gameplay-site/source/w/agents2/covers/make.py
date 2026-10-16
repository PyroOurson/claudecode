import sys, os, json, subprocess, io
from PIL import Image
C = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, C)
import post as P
from specs import SPECS
OUT = '/tmp/gameplay-build/w/covers2'


def webp(src, dst, limit=78000):
    im = Image.open(src).convert('RGB')
    if im.size != (960, 600):
        im = im.resize((960, 600), Image.LANCZOS)
    for q in (90, 86, 82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42):
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= limit:
            break
    open(dst, 'wb').write(b.getvalue())
    return q, b.tell()


def main(ids, final):
    jobs = []
    for i in ids:
        sp = SPECS[i]
        name = i if final else i + '_q'
        src = C + '/renders/' + name + '.png'
        if sp.get('svgbg'):
            bg = None
        else:
            bg = P.process(name, sp.get('post', {}), src, C + '/post/' + name + '.png')
        j = {'id': i, 'bg': bg, 'out': C + '/out/' + name + '.png', 'logo': sp['logo']}
        if sp.get('html'):
            j['html'] = sp['html']
        if sp.get('under'):
            j['under'] = sp['under']
        jobs.append(j)
    jf = C + '/jobs.json'
    json.dump(jobs, open(jf, 'w'))
    subprocess.run(['node', C + '/compose.js', jf], check=True)
    for i in ids:
        name = i if final else i + '_q'
        if final:
            q, n = webp(C + '/out/' + name + '.png', OUT + '/' + i + '.webp')
            print(i, 'q', q, n)


if __name__ == '__main__':
    a = sys.argv[1:]
    final = '-f' in a
    main([x for x in a if x != '-f'], final)
