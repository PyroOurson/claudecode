import json, re, subprocess, sys, os
from meta_rows import ROWS, DELETED
orig = open('/tmp/gameplay-build/w/orig_order.txt').read().split()
new25 = ['slope-3d','tunnel-run','rocket-soccer','hole-city','demon-halls','bean-royale','block-roll','flap-bird','slither','cell-feast','paper-land','fling-birds','candy-rope','brick-bros','garden-defense','night-survivors','bomb-blast','last-card','fire-water','maze-tanks','hoop-flop','sea-battle','marble-chain','moto-stunts','cookie-baker']
ids = [r[0] for r in ROWS]
assert not set(ids) & set(DELETED), set(ids) & set(DELETED)
newest = [x for x in new25 + [x for x in reversed(orig) if x not in new25] if x in ids]
newest += [x for x in ids if x not in newest]
STAT = json.load(open('stat.json')) if os.path.exists('stat.json') else {}

def rep(s, old, new, count=1):
    assert s.count(old) == count, (old[:60], s.count(old))
    return s.replace(old, new)

old = open('parts_orig/001_portal.js', encoding='utf-8', newline='').read()
if os.path.exists('new/net.js'):
    _a = old.index('function makeNet(g, add) {'); _b = old.index('function makeApi(g, root) {')
    old = old[:_a] + open('new/net.js', encoding='utf-8', newline='').read() + old[_b:]
consts = open('new/consts.js', encoding='utf-8').read()
rows_js = '[\n' + ',\n'.join('  ' + json.dumps(list(r), ensure_ascii=False) for r in ROWS) + '\n]'
consts += 'const ROWS = ' + rows_js + ';\nconst NEWEST = ' + json.dumps(newest) + ';\nconst STAT = ' + json.dumps({k: v for k, v in STAT.items() if k in ids}) + ';\nconst DELETED = new Set(' + json.dumps(DELETED) + ');\n'

a = old.index("const CATS = ")
b = old.index("const TINT = ")
old = old[:a] + consts + old[b:]
c = old.index("const CAT_TINT = { '3D'")
d = old.index('\n', c)
old = old[:c] + old[d + 1:]
old = rep(old, "  covers: {},\n", "  covers: {},\n  shots: {},\n")
reg_a = old.index("  register(g) {")
reg_b = old.index("\n  }\n};", reg_a)
new_reg = """  register(g) {
    if (!g || typeof g.id !== 'string' || (typeof g.mount !== 'function' && !g.lazy)) return console.warn('[gameplay] invalid game', g);
    if (DELETED.has(g.id)) return;
    const old = byId.get(g.id);
    if (g.tint && !TINT[g.id]) TINT[g.id] = g.tint;
    if (g.category === '3D') g.is3d = true;
    const m = INFO.get(g.id) || { id: g.id, name: g.title, genres: ['Arcade'], pl: 's', mins: 5, kw: '', remake: false, hot: false, fresh: false, rank: 999 };
    m.stat = STAT[g.id] || null;
    g.oldTitle = g.title; g.title = m.name; g.info = m; g.category = m.genres[0];
    if (old && old.lazy && !g.lazy) return lazyLanded(old, g);
    if (old) games.splice(games.indexOf(old), 1);
    games.push(g); byId.set(g.id, g);"""
old = old[:reg_a] + new_reg + old[reg_b:]
old = rep(old, "const filter = { cat: 'All', q: '' };\n", "")
old = rep(old, "const BASE_TITLE = document.title;\n", "const BASE_TITLE = document.title, BASE_DESC = document.querySelector('meta[name=\"description\"]').getAttribute('content');\n")
fa = old.index("function fitFullscreen() {")
fb = old.index("const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitFullscreen); };\n") + len("const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitFullscreen); };\n")
old = old[:fa] + open('new/fit.js', encoding='utf-8').read() + old[fb:]
old = rep(old, "    score(v) { if (alive) $('#pScore').textContent = typeof v === 'number' ? fmt(g, v) : (v ?? '—'); },", "    score(v) { if (alive) $('#pScore').textContent = typeof v === 'number' ? fmt(g, v) : (v ?? '—'); },\n    label(t) { if (alive) $('#pScoreK').textContent = t; },")
old = rep(old, "        if (!on || !alive) return;\n        const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t;", "        if (!on || !alive) return;\n        if (PAUSE.on) { last = t; id = requestAnimationFrame(step); return; }\n        const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t;")
old = rep(old, "    get alive() { return alive; },", "    get alive() { return alive; },\n    get paused() { return PAUSE.on; },\n    get online() { return !!(net && (net.connected || net.role)); },")
old = rep(old, "S.best[g.id] = v; save(); setBest(g, true); toast('New best · ' + fmt(g, v));", "S.best[g.id] = v; save(); setBest(g, true); toast('New best · ' + fmt(g, v)); track('record', { game: g.id });")
old = rep(old, "    get net() { return net || (net = makeNet(g, add)); },", "    get net() { return net || (net = gpNetWrap(g, makeNet(g, add))); },")
ca = old.index("const coverCache = new Map();")
old = old[:ca] + open('new/tail.js', encoding='utf-8').read() + open('new/auth.js', encoding='utf-8').read().replace(chr(10) + 'Ameplay.debug = ', chr(10) + open('new/admin.js', encoding='utf-8').read() + chr(10) + 'Ameplay.debug = ', 1) + chr(10) + open('new/i18n.js', encoding='utf-8').read()
open('parts/001_portal.js', 'w', encoding='utf-8', newline='').write(old)

SC = ':where(:not(.g-root *))'
def split_top(s, ch=','):
    out, d, cur = [], 0, ''
    for c in s:
        if c in '([': d += 1
        elif c in ')]': d -= 1
        if c == ch and d == 0: out.append(cur); cur = ''
        else: cur += c
    out.append(cur)
    return out
def scope_sel(sel):
    t = sel.strip()
    if not re.search(r'[.#]', t) or re.search(r'\.g-|\.play-stage|\.play-frame|^\*|^:root|^html|^body', t):
        return sel
    m = re.search(r'::[\w-]+(\([^)]*\))?\s*$', t)
    if m: return t[:m.start()] + SC + t[m.start():]
    return t + SC
def scope(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: out.append(css[i:]); break
        head = css[i:j]
        d, k = 1, j + 1
        while d:
            if css[k] == '{': d += 1
            elif css[k] == '}': d -= 1
            k += 1
        body = css[j + 1:k - 1]
        h = head.strip()
        if h.startswith('@media') or h.startswith('@supports'):
            out.append(head + '{' + scope(body) + '}')
        elif h.startswith('@'):
            out.append(head + '{' + body + '}')
        else:
            lead = head[:len(head) - len(head.lstrip())]
            out.append(lead + ','.join(scope_sel(x) for x in split_top(h)) + '{' + body + '}')
        i = k
    return ''.join(out)
am = scope(open('new/am.css', encoding='utf-8').read())
gcss = open('new/gcss.css', encoding='utf-8').read()
toast = open('new/toast.css', encoding='utf-8').read()
media = scope(open('new/media.css', encoding='utf-8').read())
media += chr(10) + open('new/auth.css', encoding='utf-8').read() + chr(10) + open('new/admin.css', encoding='utf-8').read()
count = len(ROWS)
desc = f'gameplay: {count} free browser games. Famous remakes, 3D, arcade, racing, puzzles, sports and online multiplayer games. No downloads, just click and play.'
nos = '<noscript><div style="max-width:900px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif"><h1>gameplay: ' + str(count) + ' free browser games</h1><p>gameplay needs JavaScript to run the games. Turn it on and reload this page.</p><ul>' + ''.join('<li><a href="/%s">%s</a></li>' % (r[0], r[1].replace('&', '&amp;')) for r in ROWS) + '</ul></div></noscript>\n'
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>gameplay — {count} free browser games</title>
<meta name="description" id="metaDesc" content="{desc}">
<meta name="theme-color" content="#f6f4ff">
<meta name="color-scheme" content="light dark">
<link rel="canonical" id="canon" href="https://gameplaygames.web.app/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="gameplay">
<meta property="og:title" content="gameplay — {count} free browser games">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://gameplaygames.web.app/">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="gameplay — {count} free browser games">
<meta name="twitter:description" content="{desc}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%236d4cf5'/%3E%3Cpath d='M12.5 10v12l10-6z' fill='%23fff' stroke='%23fff' stroke-width='1.6' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<script>document.documentElement.setAttribute('data-theme','light');try{{var t=(JSON.parse(localStorage.getItem('gameplay:v1')||'{{}}')||{{}}).prefs||{{}};if(t.theme==='dark')document.documentElement.setAttribute('data-theme','dark');if(t.theme==='system')document.documentElement.removeAttribute('data-theme');if(t.motion)document.documentElement.classList.add('rm');if(t.thumbs===false)document.documentElement.classList.add('nothumb')}}catch(e){{}}</script>
<style>
'''
body = open('new/body.html', encoding='utf-8').read().replace('{{NOSCRIPT}}', nos)
pre = head + am + '\n' + gcss + '\n' + toast + '\n' + media + '</style>\n</head>\n' + body + '\n'
open('parts/000_pre_000.html', 'w', encoding='utf-8', newline='').write(pre)
last = open('parts_orig/142_gap_142.html', encoding='utf-8', newline='').read()
if os.path.exists('thumbs.json'):
    th = json.load(open('thumbs.json'))
    body = 'Ameplay.shots = Object.assign(Ameplay.shots || {}, {\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(v)) for k, v in sorted(th.items())) + '\n});\n'
    assert last.count('</body>') == 1
    last = last.replace('</body>', '<script>\n' + body + '</script>\n</body>')
open('parts/142_gap_142.html', 'w', encoding='utf-8', newline='').write(last)
