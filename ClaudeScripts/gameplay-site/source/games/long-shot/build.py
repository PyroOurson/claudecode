import json, os, re, sys, unicodedata

A = os.path.dirname(os.path.abspath(__file__))
W = os.path.normpath(os.path.join(A, '..', '..', 'w'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(W, 'parts', '307_g_long-shot.js')
I18N = os.path.join(W, 'new', 'i18n_b6.json')
LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt']

MAPC = {'œ': 'oe', 'æ': 'ae', 'ß': 'ss', 'ø': 'o', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'þ': 'th', 'ð': 'd'}
ART = {'the', 'a', 'an', 'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd'}
SYN = {'st': 'saint', 'ste': 'sainte', 'mt': 'mount'}
RUDE = re.compile(r"(^|[^a-z])(f+u+c*k+|sh+i+t+|b+i+t+c+h+|c+u+n+t+|n+i+gg+(?:e+r+|a+)|f+a+g+(?:g*o+t+)?|r+e+t+a+r+d+(?:e+d+|s+)|wh+o+r+e+|s+l+u+t+|d+i+c+k+h+e+a+d+|p+u+s+s+y+|c+o+c+k+s+u+c+k+|a+s+s+h+o+l+e+|b+a+s+t+a+r+d+|w+a+n+k+|t+w+a+t+|p+o+r+n+o*|r+a+p+e+|k+y+s+|p+e+d+o+|put(?:e|ain)|salop(?:e|ard)|conn(?:ard|asse)|encul[eé]|merde|niqu(?:e|er)|nazi|hitler)(?:s|e[dr]|ing|y)?(?![a-z])")
SAFE = {'rape', 'rapeabois'}
ROMAN = re.compile(r'^(.*\S)\s+([IVXL]+)$')
RV = {'I': 1, 'V': 5, 'X': 10, 'L': 50}


def roman(s):
    n = 0
    for i, c in enumerate(s):
        v = RV[c]
        n += -v if i + 1 < len(s) and RV[s[i + 1]] > v else v
    return n


def norm(s, drop=()):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if not ('\u0300' <= c <= '\u036f'))
    s = ''.join(MAPC.get(c, c) for c in s).replace('&', ' and ')
    t = [SYN.get(w, w) for w in re.split(r'[^a-z0-9]+', s) if w]
    while len(t) > 1 and t[0] in ART:
        t.pop(0)
    if drop:
        u = [w for w in t if w not in drop]
        if u:
            t = u
    return ''.join(t).replace('ph', 'f')


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', norm_plain(s)).strip('-')[:40]


def norm_plain(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if not ('\u0300' <= c <= '\u036f'))
    return ''.join(MAPC.get(c, c) for c in s).replace('&', ' and ')


def fail(msg):
    print('ERROR', msg)
    sys.exit(1)


def expand(names):
    out = []
    for n in names:
        n = n.strip()
        if not n:
            continue
        if n not in out:
            out.append(n)
        m = ROMAN.match(n)
        if m and re.fullmatch(r'[IVXL]+', m.group(2)):
            a = m.group(1) + ' ' + str(roman(m.group(2)))
            if a not in out:
                out.append(a)
    return out


def read_sets():
    sets, order = {}, []
    for fn in sorted(os.listdir(os.path.join(A, 'data'))):
        if not fn.endswith('.txt') or fn == 'prompts.txt':
            continue
        cur = None
        for ln, raw in enumerate(open(os.path.join(A, 'data', fn), encoding='utf-8'), 1):
            line = raw.rstrip('\n').strip()
            if not line or line.startswith('#'):
                continue
            where = '%s:%d' % (fn, ln)
            if line.startswith('@'):
                k, _, v = line[1:].partition(' ')
                if k == 'set':
                    cur = {'id': v.strip(), 'drop': [], 'fuzzy': 1, 'rows': [], 'where': where}
                    if cur['id'] in sets:
                        fail('duplicate set ' + cur['id'] + ' at ' + where)
                    sets[cur['id']] = cur
                    order.append(cur['id'])
                elif k == 'drop':
                    cur['drop'] = [norm(x) for x in v.split()]
                elif k == 'fuzzy':
                    cur['fuzzy'] = int(v)
                else:
                    fail('unknown option ' + k + ' at ' + where)
                continue
            if cur is None:
                fail('row before @set at ' + where)
            p = line.split('|')
            if len(p) < 3 or len(p) > 4:
                fail('bad row at %s: %s' % (where, line))
            if not re.fullmatch(r'[0-9]', p[0].strip()):
                fail('bad fame at %s: %s' % (where, line))
            en = expand(p[1].split('/'))
            fr = expand(p[2].split('/')) if p[2].strip() else []
            tags = p[3].split() if len(p) > 3 else []
            if not en:
                en, fr = fr, []
            if not en:
                fail('no English name at ' + where)
            cur['rows'].append({'f': int(p[0]), 'en': en, 'fr': fr, 'tags': tags, 'where': where, 'slug': slug(en[0])})
    return sets, order


def check_sets(sets):
    errs = []
    for s in sets.values():
        drop = set(s['drop'])
        seen, slugs = {}, {}
        for i, r in enumerate(s['rows']):
            if r['slug'] in slugs:
                fail('duplicate answer id %s in %s (%s and %s)' % (r['slug'], s['id'], slugs[r['slug']], r['where']))
            slugs[r['slug']] = r['where']
            for n in r['en'] + r['fr']:
                if RUDE.search(norm_plain(n)) and norm(n) not in SAFE:
                    fail('rude word in %s at %s' % (n, r['where']))
                k = norm(n, drop)
                if not k:
                    fail('empty key for %s at %s' % (n, r['where']))
                if k in seen and seen[k] != i:
                    o = s['rows'][seen[k]]
                    errs.append('name clash in %s: "%s" (%s) and %s (%s)' % (s['id'], n, r['where'], o['en'][0], o['where']))
                seen[k] = i
        s['keys'] = seen
    if errs:
        fail(chr(10).join(errs))


def members(sets, src, letter):
    sid, _, flt = src.partition(':')
    if sid not in sets:
        fail('unknown set ' + sid)
    s = sets[sid]
    suf = None
    if '~' in flt:
        flt, suf = flt.split('~', 1)
    out = []
    for r in s['rows']:
        ok = 'no' not in r['tags']
        if ok and flt and flt != '*':
            ok = False
            for alt in flt.split(','):
                need = [x for x in alt.split('+') if x]
                if all((r['tags'].count(x[1:]) == 0) if x.startswith('!') else (x in r['tags']) for x in need):
                    ok = True
                    break
        if ok and letter:
            ok = any(norm(n, set(s['drop'])).startswith(letter.lower()) for n in r['en'] + r['fr'])
        if ok and suf:
            ok = any(norm_plain(n).endswith(suf) for n in r['en'] + r['fr'])
        if ok:
            out.append(r)
    return out


def read_prompts(sets):
    out, rows = [], []
    for ln, raw in enumerate(open(os.path.join(A, 'data', 'prompts.txt'), encoding='utf-8'), 1):
        line = raw.rstrip('\n').strip()
        if not line or line.startswith('#'):
            continue
        p = line.split('|')
        where = 'prompts.txt:%d' % ln
        if len(p) != 10:
            fail('prompt needs 10 fields at %s (%d)' % (where, len(p)))
        pid, fam, flags, src = [x.strip() for x in p[:4]]
        texts = [x.strip() for x in p[4:]]
        letters = ['']
        m = re.search(r'@([A-Z]+)$', src)
        if m:
            letters = list(m.group(1))
            src = src[:m.start()]
        rows.append(texts)
        for L in letters:
            q = {'id': pid + ('-' + L.lower() if L else ''), 'fam': fam, 'fl': flags, 'src': src, 'x': L, 'en': texts[0]}
            variants = {}
            for part in src.split(';'):
                if '=' in part:
                    lang, s2 = part.split('=', 1)
                    variants[lang] = s2
                else:
                    variants['*'] = part
            for lang, s2 in variants.items():
                ms = members(sets, s2, L)
                if len(ms) < 8:
                    fail('prompt %s (%s) has only %d answers' % (q['id'], lang, len(ms)))
                if len(ms) < 20:
                    print('note: %s (%s) has %d answers' % (q['id'], lang, len(ms)))
                q.setdefault('n', {})[lang] = len(ms)
            out.append(q)
    ids = [q['id'] for q in out]
    if len(ids) != len(set(ids)):
        fail('duplicate prompt id')
    return out, rows


def js_sets(sets, order):
    o = {}
    for sid in order:
        s = sets[sid]
        lines = []
        for r in s['rows']:
            fr = r['fr'] if r['fr'] != r['en'] else []
            lines.append('%d|%s|%s|%s' % (r['f'], '/'.join(r['en']), '/'.join(fr), ' '.join(r['tags'])))
        o[sid] = {'z': s['fuzzy'], 'd': s['drop'], 'e': '\n'.join(lines)}
    return o


def main():
    sets, order = read_sets()
    check_sets(sets)
    prompts, prows = read_prompts(sets)
    ui = json.load(open(os.path.join(A, 'i18n_ui.json'), encoding='utf-8'))
    rows, seen = [], set()
    for r in ui + prows:
        if len(r) != 6 or not all(isinstance(x, str) and x for x in r):
            fail('translation row needs six strings: %r' % (r,))
        if r[0] in seen:
            continue
        seen.add(r[0])
        rows.append(r)
    js_p = [[q['id'], q['fam'], q['fl'], q['src'], q['en'], q['x']] for q in prompts]
    data = 'const LS_SETS = ' + json.dumps(js_sets(sets, order), ensure_ascii=False, separators=(',', ':')) + ';\n'
    data += 'const LS_PROMPTS = ' + json.dumps(js_p, ensure_ascii=False, separators=(',', ':')) + ';\n'
    src = ''
    for fn in sorted(os.listdir(os.path.join(A, 'src'))):
        if fn.endswith('.js'):
            src += open(os.path.join(A, 'src', fn), encoding='utf-8').read().rstrip('\n') + '\n'
    out = "(() => {\n'use strict';\n" + data + src + '})();\n'
    open(os.path.abspath(OUT), 'w', encoding='utf-8', newline='').write(out)
    with open(I18N, 'w', encoding='utf-8', newline='') as f:
        f.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n]\n')
    total = sum(len(s['rows']) for s in sets.values())
    print('wrote %s (%d bytes): %d sets, %d answers, %d prompts (%d daily); %s (%d rows)' % (os.path.abspath(OUT), len(out.encode('utf-8')), len(sets), total, len(prompts), sum(1 for q in prompts if 'd' in q['fl']), I18N, len(rows)))


if __name__ == '__main__':
    main()
