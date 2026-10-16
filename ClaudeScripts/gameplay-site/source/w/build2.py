import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PARTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'parts')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'site')
PLAIN = OUT.rstrip('/') + '_plain'
DIR = 'gameplay/'
INLINE = int(os.environ.get('INLINE_COVERS', '8'))
COVERS2 = os.environ.get('COVERS2', os.path.join(HERE, 'covers2'))
MIME = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif'}
sys.path.insert(0, HERE)
from meta_rows import DELETED
PACK = int(os.environ.get('PACK_COVERS', '25'))


def read(fn):
    with open(fn, encoding='utf-8', newline='') as f:
        return f.read()


def name_of(data):
    return hashlib.sha256(data.encode('utf-8')).hexdigest()[:20]


def find_cover(gid):
    for ext in ('.webp', '.jpg', '.jpeg', '.avif', '.png'):
        p = os.path.join(COVERS2, gid + ext)
        if os.path.isfile(p) and os.path.getsize(p) > 0:
            return p, ext
    return None, None


def tone(path):
    try:
        from PIL import Image
        im = Image.open(path).convert('RGB').resize((1, 1), Image.LANCZOS)
        r, g, b = im.getpixel((0, 0))
        return '#%02x%02x%02x' % (r, g, b)
    except Exception:
        return None


def js(v):
    s = json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    return s.replace('</', '<\\/').replace('<!--', '<\\!--').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def main():
    names = json.load(open(os.path.join(PARTS, '_order.json')))
    have = os.listdir(PARTS)

    def fname(k, n):
        ext = 'js' if k == 'script' else 'html'
        c = sorted(f for f in have if re.fullmatch(r'\d{3}_' + re.escape(n) + r'\.' + ext, f))
        if not c:
            sys.exit('missing part ' + n)
        return c[0]
    files = [fname(k, n) for k, n in names]
    assert names[0][0] == 'pre' and names[1] == ['script', 'portal'], names[:2]
    pre = read(os.path.join(PARTS, files[0]))
    portal = read(os.path.join(PARTS, files[1]))
    last = read(os.path.join(PARTS, files[-1]))
    for idx in range(2, len(names) - 1):
        if names[idx][0] == 'gap':
            assert read(os.path.join(PARTS, files[idx])) == '</script>\n', files[idx]
    extra = re.findall(r'<script>\n?(.*?)</script>\n?', last, re.S)
    last = re.sub(r'<script>\n?.*?</script>\n?', '', last, flags=re.S)
    assert last.startswith('</script>'), last[:40]
    if os.path.isdir(PLAIN):
        shutil.rmtree(PLAIN)
    os.makedirs(os.path.join(PLAIN, 'files'))
    extra_fn = os.path.join(PLAIN, 'extra.js')
    with open(extra_fn, 'w', encoding='utf-8') as f:
        f.write('\n'.join(extra))
    meta_fn = os.path.join(PLAIN, 'meta.json')
    r = subprocess.run(['node', os.path.join(HERE, 'meta2.js'), PARTS, meta_fn, extra_fn])
    if r.returncode != 0:
        sys.exit('meta2.js failed')
    meta = json.load(open(meta_fn, encoding='utf-8'))
    if meta['problems']:
        sys.exit('metadata problems: ' + '; '.join(meta['problems']))
    gone = [g['id'] for g in meta['games'] if g['id'] in DELETED]
    if gone:
        print('build2: leaving out deleted games still registered by parts:', ', '.join(gone))
    meta['games'] = [g for g in meta['games'] if g['id'] not in DELETED]
    for k in ('covers', 'shots'):
        meta[k] = {i: v for i, v in meta[k].items() if i not in DELETED}
    rank = [m.group(1) for m in re.finditer(r'^\s*\["([a-z0-9-]+)", "', portal, re.M)]
    popular = json.loads(re.search(r'const POPULAR = (\[[^\]]*\]);', portal).group(1).replace("'", '"'))
    ids = [g['id'] for g in meta['games']]
    order = [i for i in rank if i in ids] + [i for i in ids if i not in rank]
    plan = {'dir': DIR, 'files': []}

    def emit(data, ext):
        nm = name_of(data)
        with open(os.path.join(PLAIN, 'files', nm + ext), 'w', encoding='utf-8', newline='') as f:
            f.write(data)
        plan['files'].append(nm + ext)
        return nm

    def emit_bin(data, ext):
        nm = hashlib.sha256(data).hexdigest()[:20]
        with open(os.path.join(PLAIN, 'files', nm + ext), 'wb') as f:
            f.write(data)
        plan['files'].append(nm + ext)
        return nm

    cv = {}
    for g in meta['games']:
        p, ext = find_cover(g['id'])
        if not p:
            continue
        with open(p, 'rb') as f:
            data = f.read()
        if len(data) > 200000:
            print('build2: cover %s is large (%d KB)' % (g['id'], len(data) // 1024))
        cv[g['id']] = {'cv': emit_bin(data, ext), 'cvx': ext[1:], 'cvt': MIME[ext]}
        c = tone(p)
        if c:
            cv[g['id']]['cc'] = c
    for i in cv:
        meta['covers'].pop(i, None)
        meta['shots'].pop(i, None)
    part_file, part_size = {}, {}
    for idx, (k, n) in enumerate(names):
        if k == 'script' and n.startswith('g_'):
            src = read(os.path.join(PARTS, files[idx]))
            part_file[n] = emit(src, '.js')
            part_size[n] = len(gzip.compress(src.encode('utf-8'), 9))
    covers, shots = meta['covers'], meta['shots']
    have = [i for i in order if i in covers or i in shots]
    first = set(have[:INLINE]) | {i for i in popular if i in covers or i in shots}
    inline_c = {i: covers[i] for i in have if i in first and i in covers}
    inline_s = {i: shots[i] for i in have if i in first and i in shots}
    rest = [i for i in have if i not in first]
    packs = []
    for a in range(0, len(rest), PACK):
        chunk = rest[a:a + PACK]
        body = js({'c': {i: covers[i] for i in chunk if i in covers}, 's': {i: shots[i] for i in chunk if i in shots}})
        packs.append({'f': emit(body, '.json'), 'ids': chunk})
    plan['packs'] = [p['f'] for p in packs]
    plan['pre'] = plan['packs'][:6] + [cv[i]['cv'] for i in order if i in cv][:10]
    games = []
    for g in meta['games']:
        fmt = g.pop('format', None)
        g.pop('cssLen', None)
        part = g.pop('part')
        g['lazy'] = part_file[part]
        g['size'] = part_size[part]
        g.update(cv.get(g['id'], {}))
        body = js(g)
        if fmt:
            if re.search(r'</script|<!--', fmt, re.I):
                sys.exit('format of %s cannot be inlined' % g['id'])
            body = body[:-1] + ',"format":' + fmt + '}'
        games.append(body)
    cat = 'Object.assign(Ameplay.covers, ' + js(inline_c) + ');\n'
    if inline_s:
        cat += 'Object.assign(Ameplay.shots, ' + js(inline_s) + ');\n'
    cat += 'Ameplay.lazy({k:"%%GPKEY%%",dir:' + js(DIR) + ',packs:' + js(packs) + ',games:[\n' + ',\n'.join(games) + '\n]});\n'
    page = pre + '<script>\n' + portal + '</script>\n<script>\n' + cat + last
    with open(os.path.join(PLAIN, 'index.html'), 'w', encoding='utf-8', newline='') as f:
        f.write(page)
    with open(os.path.join(PLAIN, 'plan.json'), 'w') as f:
        json.dump(plan, f)
    print('build2: index %d bytes (%d gz), %d games, %d game files, %d cover images, %d cover packs, %d inline covers' % (len(page.encode('utf-8')), len(gzip.compress(page.encode('utf-8'), 9)), len(games), len(part_file), len(cv), len(packs), len(inline_c) + len(inline_s)))
    r = subprocess.run(['node', os.path.join(HERE, 'gate2.js'), PLAIN, OUT])
    if r.returncode != 0:
        sys.exit('gate2.js failed')


if __name__ == '__main__':
    main()
