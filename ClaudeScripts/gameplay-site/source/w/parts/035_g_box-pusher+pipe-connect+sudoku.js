
(() => {
  'use strict';
  const C = Ameplay.colors;

  const ICON = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const SVG = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const I_UNDO = SVG('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>');
  const I_RESET = SVG('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>');
  const I_GRID = SVG('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>');
  const I_ERASE = SVG('<path d="M20 20H9.5L4 14.5a2 2 0 0 1 0-2.8L12.7 3a2 2 0 0 1 2.8 0l4.5 4.5a2 2 0 0 1 0 2.8L10.5 19"/><path d="M8 10.5l6.5 6.5"/>');
  const I_PEN = SVG('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>');
  const I_BULB = SVG('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>');
  const I_CW = SVG('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>');
  const I_CCW = SVG('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>');
  const I_DICE = SVG('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>');
  const I_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const I_LOCK = SVG('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  const ARROW = d => SVG(['<path d="M12 19V5M5 12l7-7 7 7"/>', '<path d="M5 12h14M12 5l7 7-7 7"/>', '<path d="M12 5v14M5 12l7 7 7-7"/>', '<path d="M19 12H5M12 5l-7 7 7 7"/>'][d]);

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const stat = (k, v, cls = '') => `<div class="g-stat ${cls}"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const mods = e => e.ctrlKey || e.metaKey || e.altKey;
  const KEYDIR = { ArrowUp: 0, KeyW: 0, ArrowRight: 1, KeyD: 1, ArrowDown: 2, KeyS: 2, ArrowLeft: 3, KeyA: 3 };
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function press(api, node, sel, fn) {
    api.on(node, 'pointerdown', e => { const b = e.target.closest(sel); if (!b || b.disabled || e.button) return; e.preventDefault(); fn(b, e); });
    api.on(node, 'click', e => { const b = e.target.closest(sel); if (b && !b.disabled && e.detail === 0) fn(b, e); });
  }
  function particles() {
    const list = [];
    return {
      list,
      burst(x, y, n, colors, spd = 180, life = .8, size = 4, grav = 420) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, s = spd * (.3 + Math.random() * .7);
          list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * .35, life: life * (.6 + Math.random() * .4), max: life, c: colors[i % colors.length], r: size * (.6 + Math.random() * .8), g: grav, rot: Math.random() * 6, vr: (Math.random() - .5) * 14, sq: Math.random() < .5 });
        }
      },
      step(dt) {
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.life -= dt;
          if (p.life <= 0) { list[i] = list[list.length - 1]; list.pop(); continue; }
          p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.2; p.rot += p.vr * dt;
        }
      },
      draw(ctx) {
        for (const p of list) {
          ctx.globalAlpha = Math.min(1, p.life / p.max * 2.2);
          ctx.fillStyle = p.c;
          if (p.sq) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r, -p.r * .55, p.r * 2, p.r * 1.1); ctx.restore(); }
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
      }
    };
  }
  const CONFETTI = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#a06cd5', '#ff9f43'];

  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  const BP_LEVELS = [
    ['#######', '#     #', '# @$ .#', '#     #', '#######'],
    ['#######', '#.    #', '#  #  #', '# $@  #', '#     #', '#######'],
    ['########', '#      #', '# $  $ #', '#  @   #', '#.    .#', '########'],
    [' ######', ' #    #', '##.## ##', '#  $   #', '# @$ . #', '###  ###', '  ####'],
    ['#######', '#.  $ #', '#.#$# #', '#.  $@#', '#     #', '#######'],
    ['#######', '#@  . ##', '#   #  #', '## # $ #', ' #   $ #', ' #.    #', ' #######'],
    ['########', '#@ ##  #', '# $ #$ #', '#   #  #', '## . . #', ' #  #  #', ' #######'],
    [' #########', ' #  #  ..#', ' #.      #', ' #$# @   #', '##   ### #', '# $$  ## #', '#        #', '##########'],
    ['#######', '#.    ##', '#..    ##', '#   #   #', '#   @   #', '# $  $$##', '####   #', '   #####'],
    ['########', '#. # . ###', '#      . #', '#  $#@## #', '### $    #', '  #  ##$##', '  #     #', '  #######'],
    ['  ########', '###      #', '#. . # $ #', '#   # $@##', '#   # #$ #', '###      #', '  #.   ###', '  ######'],
    ['#########', '#   ##@ #', '#   # $$#', '#. # $  ##', '# .  ##  #', '#.       #', '#        #', '##########'],
    ['###########', '#.  . ##  #', '#    @##  #', '#.   $  $ #', '#    $$   #', '#####  .###', '    #####'],
    ['###########', '#  #   #  #', '#. .      #', '# # #    ##', '#  $@$.  #', '##$# ##  #', ' # .  $ ##', ' ########'],
    ['######', '#.  .#', '#    ##', '# .   #', '#. #@ ###', '#   $$  #', '## $  $ #', ' ###  ###', '   ####'],
    [' #########', ' #     ..#', ' #.   .# #', '##       #', '#@$     ##', '# #    ##', '# $$ $ #', '#   ####', '#####'],
    ['########', '#   .. #', '#      ###', '#. #   $ #', '# ##  #  #', '#.  # #  #', '### $ $$##', '  #  #@ #', '  #######'],
    ['    #####', '#####@..#', '#    $$ #', '#   # $###', '#  ##  ..#', '#####$   #', '    #    #', '    ######'],
    ['######', '#   .#####', '#  #.##@ #', '##. . .$$##', '#    $$#  #', '#   #   $ #', '#####  #  #', '    ##   ##', '     #####'],
    ['  ####', '###  ####', '#   ..  ###', '#   # # $ #', '# #    $$ #', '#   ###@# #', '###. #.$  #', '  # .$    #', '  #########'],
    ['  #######', '  #     #', '  #$    ###', '###@#.# . #', '#. $#     #', '# # $  . .#', '# $ $#  ###', '#       #', '#########'],
    ['###########', '#..   $ $ #', '#       # #', '#  ###.   #', '#  $@### .#', '#  $$##   #', '###    .  #', '  #########'],
    ['   ####', '####. ###', '#.   $ .###', '#..  #$ $ #', '##   # $#@#', '#  #    $ #', '#      ####', '#  #   #', '########'],
    ['##########', '#   .## .#', '# ##  .  #', '# $.$    #', '#   .#. ##', '# $$  ###', '#  $$ #', '### @##', '  ####'],
    ['######', '#    #', '#..  #', '#  $ ######', '#   #     #', '# . # # $ #', '###. $   ##', '#  $##$ ##', '# .. $@##', '########'],
    ['###########', '#..   ##@ #', '#.$ #   $ #', '##     # ##', ' ##$####  #', '###  ####$#', '#     . # #', '#  $#$#  .#', '### .     #', '  #########']
  ];
  function bpParse(rows) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length)), n = w * h;
    const wall = new Uint8Array(n), goal = new Uint8Array(n), inside = new Uint8Array(n), boxes = [];
    let player = 0;
    rows.forEach((r, y) => {
      for (let x = 0; x < w; x++) {
        const ch = r[x] || ' ', i = y * w + x;
        if (ch === '#') wall[i] = 1;
        if ('.*+'.includes(ch)) goal[i] = 1;
        if ('$*'.includes(ch)) boxes.push(i);
        if ('@+'.includes(ch)) player = i;
      }
    });
    const st = [player]; inside[player] = 1;
    while (st.length) {
      const i = st.pop();
      for (let d = 0; d < 4; d++) {
        const x = i % w + DX[d], y = ((i / w) | 0) + DY[d], j = y * w + x;
        if (x >= 0 && y >= 0 && x < w && y < h && !wall[j] && !inside[j]) { inside[j] = 1; st.push(j); }
      }
    }
    return { w, h, n, wall, goal, inside, boxes, player };
  }

  function bpSolve(L, start, p0, limit, wt = 1) {
    const { w, n, wall, goal, inside } = L;
    const free = i => i >= 0 && i < n && inside[i] && !wall[i];
    const live = new Uint8Array(n), st = [];
    for (let i = 0; i < n; i++) if (goal[i] && inside[i]) { live[i] = 1; st.push(i); }
    while (st.length) {
      const i = st.pop();
      for (let d = 0; d < 4; d++) { const o = DX[d] + DY[d] * w, j = i - o, k = j - o; if (free(j) && free(k) && !live[j]) { live[j] = 1; st.push(j); } }
    }
    const goals = []; for (let i = 0; i < n; i++) if (goal[i] && inside[i]) goals.push(i);
    const hf = bs => { let s = 0; for (const b of bs) { let m = 1e9; for (const g of goals) { const d = Math.abs(b % w - g % w) + Math.abs(((b / w) | 0) - ((g / w) | 0)); if (d < m) m = d; } s += m; } return s; };
    const reach = (occ, p) => { const seen = new Uint8Array(n), q = [p]; seen[p] = 1; let mn = p; for (let h = 0; h < q.length; h++) { const i = q[h]; if (i < mn) mn = i; for (let d = 0; d < 4; d++) { const j = i + DX[d] + DY[d] * w; if (free(j) && !seen[j] && !occ.has(j)) { seen[j] = 1; q.push(j); } } } return { seen, mn }; };
    const s0 = start.slice().sort((a, b) => a - b);
    if (s0.some(b => !live[b])) return null;
    const k0 = s0.join(',') + '|' + reach(new Set(s0), p0).mn;
    const info = new Map([[k0, { g: 0, par: null, push: null }]]);
    const heap = [], hpush = x => { heap.push(x); let i = heap.length - 1; while (i) { const q = (i - 1) >> 1; if (heap[q][0] <= heap[i][0]) break; [heap[q], heap[i]] = [heap[i], heap[q]]; i = q; } };
    const hpop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; let i = 0; for (;;) { let m = i; const a = 2 * i + 1, b = a + 1; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return t; };
    hpush([hf(s0), 0, s0, p0, k0]);
    let ex = 0;
    while (heap.length && ex++ < limit) {
      const [, g, bs, p, key] = hpop();
      if (info.get(key).g < g) continue;
      if (bs.every(b => goal[b])) {
        const path = [];
        for (let k = key; info.get(k).par; k = info.get(k).par) path.unshift(info.get(k).push);
        return { pushes: g, path, ex };
      }
      const occ = new Set(bs), rs = reach(occ, p).seen;
      for (const b of bs) for (let d = 0; d < 4; d++) {
        const o = DX[d] + DY[d] * w, from = b - o, to = b + o;
        if (!rs[from] || !free(to) || occ.has(to) || !live[to]) continue;
        const nb = bs.map(x => x === b ? to : x).sort((a, c) => a - c), no = new Set(nb);
        let dead = false;
        for (const [ax, ay] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
          const tl = to + ax + ay * w, cs = [tl, tl + 1, tl + w, tl + w + 1];
          if (cs.every(c => wall[c] || no.has(c)) && cs.some(c => no.has(c) && !goal[c])) { dead = true; break; }
        }
        if (dead) continue;
        const k = nb.join(',') + '|' + reach(no, b).mn, old = info.get(k);
        if (old && old.g <= g + 1) continue;
        info.set(k, { g: g + 1, par: key, push: [from, d] });
        hpush([g + 1 + wt * hf(nb), g + 1, nb, b, k]);
      }
    }
    return heap.length ? undefined : null;
  }

  const rotM = (m, k) => { k &= 3; return ((m << k) | (m >> (4 - k))) & 15; };
  const POP4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  function pipeGen(n) {
    for (;;) {
      const N = n * n, sol = new Uint8Array(N), seen = new Uint8Array(N);
      const c = n >> 1, src = (c + rnd(3) - 1) * n + c + rnd(3) - 1;
      const active = [src]; seen[src] = 1; let count = 1;
      while (active.length) {
        const ai = Math.random() < .6 ? active.length - 1 : rnd(active.length), i = active[ai];
        const x = i % n, y = (i / n) | 0, opts = [];
        if (POP4[sol[i]] < 3) for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]) opts.push(d); }
        if (!opts.length) { active.splice(ai, 1); continue; }
        const d = opts[rnd(opts.length)], j = i + DX[d] + DY[d] * n;
        sol[i] |= 1 << d; sol[j] |= 1 << ((d + 2) & 3); seen[j] = 1; active.push(j); count++;
      }
      if (count === N) return { n, src, sol };
    }
  }
  function pipeFlow(n, cur, src) {
    const N = n * n, dist = new Int16Array(N).fill(-1), par = new Int8Array(N).fill(-1), q = [src];
    dist[src] = 0; let leaks = 0;
    for (let h = 0; h < q.length; h++) {
      const i = q[h], x = i % n, y = (i / n) | 0, m = cur[i];
      for (let d = 0; d < 4; d++) if (m & (1 << d)) {
        const nx = x + DX[d], ny = y + DY[d], j = ny * n + nx;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n || !(cur[j] & (1 << ((d + 2) & 3)))) { leaks++; continue; }
        if (dist[j] < 0) { dist[j] = dist[i] + 1; par[j] = (d + 2) & 3; q.push(j); }
      }
    }
    return { dist, par, count: q.length, leaks, solved: q.length === N && leaks === 0 };
  }
  function pipeScramble(base) {
    const rot = new Uint8Array(base.length);
    let off = 0;
    for (let i = 0; i < base.length; i++) { rot[i] = rnd(4); if (rotM(base[i], rot[i]) !== base[i]) off++; }
    return off >= base.length * .5 ? rot : pipeScramble(base);
  }

  const SD_BOX = Array.from({ length: 81 }, (_, i) => ((i / 27) | 0) * 3 + (((i % 9) / 3) | 0));
  const SD_UNITS = [];
  for (let k = 0; k < 9; k++) {
    SD_UNITS.push(Array.from({ length: 9 }, (_, j) => k * 9 + j));
    SD_UNITS.push(Array.from({ length: 9 }, (_, j) => j * 9 + k));
    SD_UNITS.push(Array.from({ length: 9 }, (_, j) => (((k / 3) | 0) * 3 + ((j / 3) | 0)) * 9 + (k % 3) * 3 + j % 3));
  }
  const SD_PEERS = Array.from({ length: 81 }, (_, i) => {
    const out = [];
    for (let j = 0; j < 81; j++) if (j !== i && (((j / 9) | 0) === ((i / 9) | 0) || j % 9 === i % 9 || SD_BOX[j] === SD_BOX[i])) out.push(j);
    return out;
  });
  const POP = new Uint8Array(1024);
  for (let i = 1; i < 1024; i++) POP[i] = POP[i >> 1] + (i & 1);
  const lowDigit = m => 31 - Math.clz32(m & -m);

  function sdSolve(g, limit, out) {
    const a = Array.from(g), rows = new Uint16Array(9), cols = new Uint16Array(9), boxs = new Uint16Array(9), cells = [];
    for (let i = 0; i < 81; i++) {
      const v = a[i];
      if (!v) { cells.push(i); continue; }
      const b = 1 << v, r = (i / 9) | 0, c = i % 9, x = SD_BOX[i];
      if ((rows[r] | cols[c] | boxs[x]) & b) return 0;
      rows[r] |= b; cols[c] |= b; boxs[x] |= b;
    }
    let count = 0;
    const rec = k => {
      if (k === cells.length) { count++; if (out && count === 1) for (let i = 0; i < 81; i++) out[i] = a[i]; return count >= limit; }
      let best = k, bestN = 10, bestM = 0;
      for (let j = k; j < cells.length; j++) {
        const i = cells[j], m = ~(rows[(i / 9) | 0] | cols[i % 9] | boxs[SD_BOX[i]]) & 0x3FE, n = POP[m];
        if (n < bestN) { bestN = n; best = j; bestM = m; if (n <= 1) break; }
      }
      if (!bestN) return false;
      const t = cells[k]; cells[k] = cells[best]; cells[best] = t;
      const i = cells[k], r = (i / 9) | 0, c = i % 9, x = SD_BOX[i];
      let m = bestM;
      while (m) {
        const b = m & -m; m ^= b;
        a[i] = 31 - Math.clz32(b); rows[r] |= b; cols[c] |= b; boxs[x] |= b;
        if (rec(k + 1)) return true;
        rows[r] ^= b; cols[c] ^= b; boxs[x] ^= b;
      }
      a[i] = 0;
      return false;
    };
    rec(0);
    return count;
  }
  function sdFull() {
    const g = new Array(81).fill(0);
    for (const b of [0, 4, 8]) {
      const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), r0 = ((b / 3) | 0) * 3, c0 = (b % 3) * 3;
      for (let k = 0; k < 9; k++) g[(r0 + ((k / 3) | 0)) * 9 + c0 + k % 3] = ds[k];
    }
    const out = new Array(81);
    sdSolve(g, 1, out);
    return out;
  }

  function sdGrade(g) {
    const v = Array.from(g), cand = new Uint16Array(81);
    for (let i = 0; i < 81; i++) if (!v[i]) { let m = 0x3FE; for (const p of SD_PEERS[i]) if (v[p]) m &= ~(1 << v[p]); cand[i] = m; }
    const place = (i, d) => { v[i] = d; cand[i] = 0; const b = ~(1 << d); for (const p of SD_PEERS[i]) cand[p] &= b; };
    let level = 0;
    for (;;) {
      let prog = false;
      for (let i = 0; i < 81; i++) if (!v[i] && POP[cand[i]] === 1) { place(i, lowDigit(cand[i])); prog = true; }
      if (!prog) for (const u of SD_UNITS) for (let d = 1; d <= 9; d++) {
        let at = -1, n = 0; const b = 1 << d;
        for (const i of u) if (cand[i] & b) { n++; at = i; }
        if (n === 1) { place(at, d); prog = true; }
      }
      if (prog) continue;
      let elim = false;
      for (let ui = 0; ui < 27; ui++) {
        const u = SD_UNITS[ui];
        for (let d = 1; d <= 9; d++) {
          const b = 1 << d, cs = u.filter(i => cand[i] & b);
          if (cs.length < 2 || cs.length > 3) continue;
          const sameBox = cs.every(i => SD_BOX[i] === SD_BOX[cs[0]]), sameRow = cs.every(i => ((i / 9) | 0) === ((cs[0] / 9) | 0)), sameCol = cs.every(i => i % 9 === cs[0] % 9);
          const targets = [];
          if (ui % 3 !== 2 && sameBox) targets.push(SD_UNITS[SD_BOX[cs[0]] * 3 + 2]);
          if (ui % 3 === 2 && sameRow) targets.push(SD_UNITS[((cs[0] / 9) | 0) * 3]);
          if (ui % 3 === 2 && sameCol) targets.push(SD_UNITS[(cs[0] % 9) * 3 + 1]);
          for (const t of targets) for (const i of t) if (!cs.includes(i) && cand[i] & b) { cand[i] &= ~b; elim = true; }
        }
        for (let a = 0; a < 9; a++) {
          const ia = u[a];
          if (POP[cand[ia]] !== 2) continue;
          for (let c = a + 1; c < 9; c++) {
            if (cand[u[c]] !== cand[ia]) continue;
            for (const i of u) if (i !== ia && i !== u[c] && cand[i] & cand[ia]) { cand[i] &= ~cand[ia]; elim = true; }
          }
        }
      }
      if (!elim) break;
      level = 1;
    }
    return v.every(x => x) ? level : 2;
  }
  const SD_DIFFS = ['Easy', 'Medium', 'Hard', 'Expert'];
  const SD_TARGET = [40, 33, 29, 0];

  function sdMake(diff) {
    let best = null, bs = -1;
    for (let attempt = 0; attempt < 40; attempt++) {
      const sol = sdFull(), g = sol.slice();
      let clues = 81;
      for (const i of shuffle(Array.from({ length: 41 }, (_, k) => k))) {
        if (clues <= SD_TARGET[diff]) break;
        const j = 80 - i, a = g[i], b = g[j];
        g[i] = 0; g[j] = 0;
        if (sdSolve(g, 2) !== 1) { g[i] = a; g[j] = b; } else clues -= i === j ? 1 : 2;
      }
      const grade = sdGrade(g);
      const sc = diff < 2 ? (grade === 0 ? 2 : 0) : diff === 2 ? [0, 2, 1][grade] : grade * 2 - (clues > 26 ? 1 : 0);
      if (sc > bs) { bs = sc; best = { puzzle: g, solution: sol, clues, grade }; }
      if (sc >= (diff === 3 ? 4 : 2)) break;
    }
    return best;
  }

  function bpCrate(ctx, x, y, T, on, sc) {
    const s = T * .8 * sc, h = s * .13, x0 = x - s / 2, y0 = y - s / 2 - h * .45, r = s * .14, b = s * .15;
    ctx.fillStyle = 'rgba(40,22,8,.28)'; rr(ctx, x0 + T * .04, y0 + h + T * .06, s, s, r); ctx.fill();
    ctx.fillStyle = on ? '#178a51' : '#94531f'; rr(ctx, x0, y0 + h, s, s, r); ctx.fill();
    ctx.fillStyle = on ? '#36c178' : '#de9a4a'; rr(ctx, x0, y0, s, s, r); ctx.fill();
    ctx.fillStyle = on ? '#63dc9b' : '#f2bf72'; rr(ctx, x0 + b, y0 + b, s - 2 * b, s - 2 * b, s * .05); ctx.fill();
    ctx.strokeStyle = on ? 'rgba(10,90,50,.3)' : 'rgba(130,70,20,.3)'; ctx.lineWidth = Math.max(1, s * .025);
    ctx.beginPath();
    for (let k = 1; k < 3; k++) { const yy = y0 + b + (s - 2 * b) * k / 3; ctx.moveTo(x0 + b, yy); ctx.lineTo(x0 + s - b, yy); }
    ctx.stroke();
    ctx.lineCap = 'round'; ctx.strokeStyle = on ? '#2aa865' : '#c97f35'; ctx.lineWidth = s * .13;
    ctx.beginPath(); ctx.moveTo(x0 + b * 1.25, y0 + s - b * 1.25); ctx.lineTo(x0 + s - b * 1.25, y0 + b * 1.25); ctx.stroke();
    ctx.strokeStyle = on ? 'rgba(255,255,255,.35)' : 'rgba(255,240,210,.4)'; ctx.lineWidth = s * .035;
    ctx.beginPath(); ctx.moveTo(x0 + r, y0 + s * .045); ctx.lineTo(x0 + s - r, y0 + s * .045); ctx.stroke();
    ctx.strokeStyle = on ? '#0f6b3d' : '#7c4216'; ctx.lineWidth = Math.max(1.4, s * .04);
    rr(ctx, x0, y0, s, s + h, r); ctx.stroke();
    ctx.fillStyle = on ? '#eafff2' : '#fff0d2';
    for (const [nx, ny] of [[b * .5, b * .5], [s - b * .5, b * .5], [b * .5, s - b * .5], [s - b * .5, s - b * .5]]) { ctx.beginPath(); ctx.arc(x0 + nx, y0 + ny, s * .032, 0, 7); ctx.fill(); }
  }

  function bpWorker(ctx, x, y, T, face, ph, mv, push, t) {
    const u = T / 64, sw = Math.sin(ph) * mv;
    const box = (bx, by, w, h, r, c) => { ctx.fillStyle = c; rr(ctx, bx, by, w, h, r); ctx.fill(); };
    const dot = (cx, cy, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); };
    const SH = '#3d8bfd', SHD = '#2c6fd8', VEST = '#ff8a3d', SKIN = '#f8cba3', PANTS = '#2e3d6b', BOOT = '#3a2416', HAT = '#ffcc33', HATD = '#eaa400', HAIR = '#6b4226';
    ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
    ctx.fillStyle = 'rgba(30,18,8,.26)'; ctx.beginPath(); ctx.ellipse(0, 25, 17, 6, 0, 0, 7); ctx.fill();
    ctx.translate(0, -Math.abs(Math.sin(ph)) * mv * 3.2 - Math.sin(t * 2.4) * .8 * (1 - mv) - 2);
    if (face === 3) ctx.scale(-1, 1);
    const side = face === 1 || face === 3, back = face === 0;
    if (side) {
      for (const lx of [-5 - sw * 6, -3 + sw * 6]) { box(lx, 8, 8, 15, 4, PANTS); box(lx - 1, 19, 12, 6, 3, BOOT); }
      box(-10, -6, 20, 21, 8, SH); box(-10, -5, 20, 19, 7, VEST);
      ctx.fillStyle = '#fff0a8'; ctx.fillRect(-10, 6, 20, 3.5);
      if (push) { box(2, -2, 16, 7, 3.5, SHD); dot(19, 1.5, 4.2, SKIN); }
      else { box(-3 - sw * 5, -4, 7, 15, 3.5, SHD); dot(.5 - sw * 5, 12, 4, SKIN); }
      dot(1, -17, 12, SKIN);
      ctx.fillStyle = HAIR; ctx.beginPath(); ctx.arc(1, -17, 12, Math.PI * .55, Math.PI * 1.2); ctx.fill();
      dot(12.5, -14.5, 2.6, '#eaae84'); dot(7.5, -16.5, 2.1, '#2a1d14'); dot(8.1, -17.2, .7, '#fff'); dot(4.5, -11.5, 2.6, 'rgba(255,110,110,.35)');
      ctx.fillStyle = HAT; ctx.beginPath(); ctx.arc(0, -20, 13, Math.PI, 0); ctx.fill();
      box(-12, -21.5, 30, 5, 2.5, HATD);
    } else {
      const l1 = Math.max(0, sw) * 4, l2 = Math.max(0, -sw) * 4;
      box(-10, 8 - l1, 8, 15, 4, PANTS); box(-11, 19 - l1, 10, 6, 3, BOOT);
      box(2, 8 - l2, 8, 15, 4, PANTS); box(1, 19 - l2, 10, 6, 3, BOOT);
      if (push && back) { box(-18, -24, 7, 18, 3.5, SHD); box(11, -24, 7, 18, 3.5, SHD); dot(-14.5, -25, 4.2, SKIN); dot(14.5, -25, 4.2, SKIN); }
      box(-14, -6, 28, 21, 9, SH);
      if (back) box(-14, -5, 28, 19, 8, VEST); else { box(-14, -5, 11, 19, 6, VEST); box(3, -5, 11, 19, 6, VEST); }
      ctx.fillStyle = '#fff0a8'; ctx.fillRect(-14, 6, back ? 28 : 11, 3.5); if (!back) ctx.fillRect(3, 6, 11, 3.5);
      if (push && !back) { box(-13, 3, 7, 13, 3.5, SHD); box(6, 3, 7, 13, 3.5, SHD); dot(-9.5, 17, 4.2, SKIN); dot(9.5, 17, 4.2, SKIN); }
      else if (!push) { box(-20, -4 + sw * 2, 7, 15, 3.5, SHD); box(13, -4 - sw * 2, 7, 15, 3.5, SHD); dot(-16.5, 12 + sw * 2, 4, SKIN); dot(16.5, 12 - sw * 2, 4, SKIN); }
      dot(0, -17, 12, SKIN);
      if (back) { ctx.fillStyle = HAIR; ctx.beginPath(); ctx.arc(0, -17, 12, 0, Math.PI); ctx.fill(); }
      else {
        dot(-4.6, -16, 2.1, '#2a1d14'); dot(4.6, -16, 2.1, '#2a1d14'); dot(-4, -16.7, .7, '#fff'); dot(5.2, -16.7, .7, '#fff');
        dot(-7.5, -11.5, 2.6, 'rgba(255,110,110,.35)'); dot(7.5, -11.5, 2.6, 'rgba(255,110,110,.35)');
        ctx.strokeStyle = '#a0583a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -12, 3, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
      }
      ctx.fillStyle = HAT; ctx.beginPath(); ctx.arc(0, -20, 13, Math.PI, 0); ctx.fill();
      box(-15.5, -21.5, 31, 5, 2.5, HATD);
    }
    box(-2, -33, 4, 12, 2, '#ffe27a');
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-6, -27, 3.2, 2, -.5, 0, 7); ctx.fill();
    ctx.restore();
  }

  Ameplay.register({
    id: 'box-pusher',
    title: 'Box Pusher',
    category: 'Puzzle',
    better: 'high',
    format: v => 'Level ' + v,
    blurb: 'Shove every crate onto its target across 26 tricky warehouses.',
    help: '<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> or <kbd>WASD</kbd> move · <kbd>Z</kbd> undo · <kbd>R</kbd> restart · <kbd>H</kbd> hint · drag, swipe or tap to walk',
    icon: ICON('<rect x="24" y="16" width="32" height="32" rx="5"/><path d="M24 26h32M24 38h32"/><path d="M30 44l20-24"/><path d="M6 32h11M13 27l5 5-5 5"/><path d="M8 56h50"/>'),
    css: `
.gm-box-pusher{gap:14px}
.gm-box-pusher .bar{width:min(720px,100%);display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap}
.gm-box-pusher .g-hud{gap:4px 22px;justify-content:flex-start}
.gm-box-pusher .g-stat{align-items:flex-start;min-width:0}
.gm-box-pusher .g-btn svg{width:17px;height:17px}
.gm-box-pusher .g-canvas{box-shadow:0 18px 40px -22px rgba(40,30,90,.7)}
.gm-box-pusher .dpad{display:none;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(2,52px);gap:6px}
.gm-box-pusher .dpad button{display:grid;place-items:center;border:0;border-radius:16px;background:linear-gradient(#f3f0ff,#e4dfff);box-shadow:inset 0 -3px 0 #cfc7fb;color:var(--accent);cursor:pointer;touch-action:none}
.gm-box-pusher .dpad button:active{transform:translateY(2px);box-shadow:inset 0 -1px 0 #cfc7fb}
.gm-box-pusher .dpad svg{width:24px;height:24px}
.gm-box-pusher .dpad [data-d="0"]{grid-column:2}
.gm-box-pusher .dpad [data-d="3"]{grid-column:1;grid-row:2}
.gm-box-pusher .dpad [data-d="2"]{grid-column:2;grid-row:2}
.gm-box-pusher .dpad [data-d="1"]{grid-column:3;grid-row:2}
@media (pointer:coarse){.gm-box-pusher .dpad{display:grid}.gm-box-pusher .g-btn.sm{height:40px}}
.gm-box-pusher .pick{position:absolute;inset:0;z-index:6;display:grid;place-items:center;padding:16px;border-radius:20px;background:rgba(255,255,255,.8);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);animation:gmbp-in .3s var(--ease)}
@keyframes gmbp-in{from{opacity:0}}
.gm-box-pusher .pick-card{width:min(460px,100%);text-align:center;animation:gmbp-up .45s var(--spring)}
@keyframes gmbp-up{from{transform:translateY(14px) scale(.96)}}
.gm-box-pusher .pick h3{margin:0 0 4px}
.gm-box-pusher .pick p{margin:0 0 16px;font-weight:700;color:var(--muted)}
.gm-box-pusher .lvgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:9px;margin-bottom:18px}
.gm-box-pusher .lvb{position:relative;height:58px;border:0;border-radius:16px;background:linear-gradient(#fff4e3,#f6e1c2);box-shadow:inset 0 -3px 0 #e2c497;font:900 19px/1 var(--sans);color:#8a5426;cursor:pointer;transition:transform .3s var(--spring)}
.gm-box-pusher .lvb:hover{transform:translateY(-3px)}
.gm-box-pusher .lvb.done{background:linear-gradient(#e2fbee,#c4f0d8);box-shadow:inset 0 -3px 0 #95dcb6;color:#187a48}
.gm-box-pusher .lvb.cur{outline:3px solid var(--accent);outline-offset:2px}
.gm-box-pusher .lvb:disabled{background:var(--sunk);box-shadow:inset 0 -3px 0 var(--line);color:var(--soft);cursor:default;transform:none}
.gm-box-pusher .lvb svg{width:18px;height:18px}
.gm-box-pusher .lvb i{position:absolute;right:-5px;top:-5px;width:21px;height:21px;display:grid;place-items:center;border-radius:50%;background:var(--good);color:#fff;box-shadow:0 3px 8px -2px rgba(34,176,125,.8)}
.gm-box-pusher .lvb i svg{width:12px;height:12px}
`,
    mount(root, api) {
      const N = BP_LEVELS.length;
      const saved = api.load() || {};
      const done = new Set((Array.isArray(saved.done) ? saved.done : []).filter(i => Number.isInteger(i) && i >= 0 && i < N));
      const best = saved.best && typeof saved.best === 'object' ? saved.best : {};
      const firstOpen = () => { for (let i = 0; i < N; i++) if (!done.has(i)) return i; return N; };
      const unlocked = i => i <= firstOpen() + 2 || done.has(i) || done.has(i - 1);
      const topDone = () => { let m = 0; done.forEach(i => { m = Math.max(m, i + 1); }); return m; };

      const bar = el('div', 'bar', `<div class="g-hud">${stat('Level', '1', 'lv')}${stat('Moves', 0, 'mv')}${stat('Pushes', 0, 'ps')}${stat('Best', '—', 'bs')}</div>
        <div class="g-row" style="gap:8px"><button type="button" class="g-btn ghost sm" data-a="hint">${I_BULB}Hint</button><button type="button" class="g-btn ghost sm" data-a="undo">${I_UNDO}Undo</button><button type="button" class="g-btn ghost sm" data-a="reset">${I_RESET}Restart</button><button type="button" class="g-btn sm" data-a="levels">${I_GRID}Levels</button></div>`);
      root.append(bar);
      const narrow = root.clientWidth < 600;
      const { canvas, ctx, w: W, h: H, toLocal } = narrow ? api.canvas(440, 400) : api.canvas(720, 500);
      const dpad = el('div', 'dpad', [0, 3, 2, 1].map(d => `<button type="button" data-d="${d}" aria-label="${['Up', 'Right', 'Down', 'Left'][d]}">${ARROW(d)}</button>`).join(''));
      const picker = el('div', 'pick'); picker.hidden = true;
      root.append(dpad, picker);
      const V = k => bar.querySelector('.' + k + ' .v');
      const lvV = V('lv'), mvV = V('mv'), psV = V('ps'), bsV = V('bs'), undoBtn = bar.querySelector('[data-a="undo"]');
      const fx = particles(), bg = document.createElement('canvas');

      let L, li = 0, boxes, boxAt, player, face = 2, moves = 0, pushes = 0, hist = [], solved = false, T = 48, ox = 0, oy = 0;
      let pvx = 0, pvy = 0, bvx = [], bvy = [], pop = [], phase = 0, mv = 0, pushT = 0, bumpT = 0, bumpD = 0, winT = -1, shown = false, newBest = false, shake = 0;
      const queue = [], order = [];
      let time = 0;

      const persist = () => api.save({ done: [...done], best, cur: li });
      const scoreTop = () => { const t = topDone(); api.score(t || '—'); };
      function hud() {
        lvV.textContent = `${li + 1}/${N}`; mvV.textContent = moves; psV.textContent = pushes;
        bsV.textContent = best[li] ? best[li] : '—';
        undoBtn.disabled = !hist.length || solved;
      }
      function buildStatic() {
        const dpr = canvas.width / W;
        bg.width = canvas.width; bg.height = canvas.height;
        const g = bg.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const grd = g.createLinearGradient(0, 0, W, H);
        grd.addColorStop(0, '#433a72'); grd.addColorStop(1, '#2a2450');
        g.fillStyle = grd; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.055)';
        for (let y = 11; y < H; y += 22) for (let x = (y / 22 | 0) % 2 ? 22 : 11; x < W; x += 22) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
        const at = (x, y) => x >= 0 && y >= 0 && x < L.w && y < L.h ? y * L.w + x : -1;
        const isWall = (x, y) => { const i = at(x, y); return i >= 0 && L.wall[i]; };
        const isIn = (x, y) => { const i = at(x, y); return i >= 0 && L.inside[i]; };
        g.fillStyle = 'rgba(10,6,30,.35)';
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (L.wall[y * L.w + x] || L.inside[y * L.w + x]) { rr(g, ox + x * T + 6, oy + y * T + 10, T, T, T * .2); g.fill(); }
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
          if (!isIn(x, y)) continue;
          const x0 = ox + x * T, y0 = oy + y * T;
          g.fillStyle = (x + y) % 2 ? '#efe1c6' : '#f6ead4'; g.fillRect(x0, y0, T, T);
          g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x0 + 2, y0 + 2, T - 4, 2);
          g.fillStyle = 'rgba(150,110,60,.13)'; g.fillRect(x0, y0 + T - 2, T, 2); g.fillRect(x0 + T - 2, y0, 2, T);
          g.fillStyle = 'rgba(150,110,60,.18)';
          if ((x * 7 + y * 13) % 5 === 0) { g.beginPath(); g.arc(x0 + T * .3, y0 + T * .65, T * .035, 0, 7); g.arc(x0 + T * .72, y0 + T * .32, T * .025, 0, 7); g.fill(); }
          if (isWall(x - 1, y)) { const sg = g.createLinearGradient(x0, 0, x0 + T * .2, 0); sg.addColorStop(0, 'rgba(60,40,90,.22)'); sg.addColorStop(1, 'rgba(60,40,90,0)'); g.fillStyle = sg; g.fillRect(x0, y0, T * .2, T); }
        }
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
          if (!isWall(x, y) || isWall(x, y + 1) || !isIn(x, y + 1)) continue;
          const x0 = ox + x * T, y0 = oy + (y + 1) * T, fh = T * .24;
          const fg = g.createLinearGradient(0, y0, 0, y0 + fh); fg.addColorStop(0, '#5b4fb0'); fg.addColorStop(1, '#43398f');
          g.fillStyle = fg; g.fillRect(x0, y0, T, fh);
          g.strokeStyle = 'rgba(30,20,80,.35)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(x0, y0 + fh / 2); g.lineTo(x0 + T, y0 + fh / 2);
          for (let k = 0; k < 3; k++) { const bx = x0 + T * (k + (x % 2 ? .5 : 0)) / 2; g.moveTo(bx, y0); g.lineTo(bx, y0 + fh / 2); g.moveTo(bx + T / 4, y0 + fh / 2); g.lineTo(bx + T / 4, y0 + fh); }
          g.stroke();
          g.fillStyle = 'rgba(30,15,60,.18)'; g.fillRect(x0, y0 + fh, T, T * .1);
        }
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
          if (!isWall(x, y)) continue;
          const x0 = ox + x * T, y0 = oy + y * T;
          g.fillStyle = '#3a3080'; g.fillRect(x0, y0, T, T);
          const wg = g.createLinearGradient(0, y0, 0, y0 + T); wg.addColorStop(0, '#9a8ef0'); wg.addColorStop(1, '#7b6ed8');
          g.fillStyle = wg; rr(g, x0 + 1.5, y0 + 1.5, T - 3, T - 3, T * .16); g.fill();
          g.fillStyle = 'rgba(255,255,255,.22)'; rr(g, x0 + T * .14, y0 + T * .1, T * .72, T * .14, T * .07); g.fill();
          g.fillStyle = 'rgba(40,25,110,.16)'; g.beginPath(); g.arc(x0 + T * .7, y0 + T * .66, T * .07, 0, 7); g.arc(x0 + T * .32, y0 + T * .5, T * .045, 0, 7); g.fill();
        }
      }
      function load(i) {
        api.hideOverlay();
        li = i; L = bpParse(BP_LEVELS[i]);
        boxes = L.boxes.slice(); boxAt = new Int16Array(L.n); boxes.forEach((b, k) => { boxAt[b] = k + 1; });
        player = L.player; face = 2; moves = pushes = 0; hist = []; solved = false; winT = -1; shown = false; queue.length = 0;
        T = narrow ? Math.min(72, Math.floor(Math.min((W - 20) / L.w, (H - 30) / L.h))) : Math.min(64, Math.floor(Math.min((W - 36) / L.w, (H - 40) / L.h)));
        ox = Math.round((W - L.w * T) / 2); oy = Math.round((H - L.h * T) / 2) - 4;
        pvx = player % L.w; pvy = (player / L.w) | 0;
        bvx = boxes.map(b => b % L.w); bvy = boxes.map(b => (b / L.w) | 0); pop = boxes.map(() => 0);
        order.length = 0; for (let k = 0; k <= boxes.length; k++) order.push(k);
        fx.list.length = 0;
        buildStatic(); hud(); persist();
      }
      const dirTo = (a, b) => { for (let d = 0; d < 4; d++) if (a + DX[d] + DY[d] * L.w === b) return d; return -1; };
      function tryMove(d) {
        if (solved || !picker.hidden) return false;
        face = d;
        const j = player + DX[d] + DY[d] * L.w;
        if (L.wall[j] || !L.inside[j]) { bumpT = .16; bumpD = d; queue.length = 0; return false; }
        const b = boxAt[j];
        if (b) {
          const k = j + DX[d] + DY[d] * L.w;
          if (L.wall[k] || boxAt[k] || !L.inside[k]) { bumpT = .16; bumpD = d; queue.length = 0; return false; }
          boxAt[j] = 0; boxAt[k] = b; boxes[b - 1] = k; pushes++; pushT = .22;
          if (L.goal[k] && !L.goal[j]) { pop[b - 1] = 1; fx.burst(ox + (k % L.w + .5) * T, oy + (((k / L.w) | 0) + .4) * T, 14, ['#7ef0b0', '#ffffff', '#ffd166'], 160, .6, T * .07, 300); api.sfx('pop'); }
          else api.sfx('tick');
          hist.push(player, b - 1);
        } else hist.push(player, -1);
        player = j; moves++;
        if (boxes.every(x => L.goal[x])) win();
        hud();
        return true;
      }
      function undo() {
        if (!hist.length || solved || !picker.hidden) return;
        queue.length = 0;
        const bi = hist.pop(), p = hist.pop(), d = dirTo(p, player);
        if (bi >= 0) { const cur = boxes[bi], back = player; boxAt[cur] = 0; boxAt[back] = bi + 1; boxes[bi] = back; pushes--; }
        player = p; face = d; moves--;
        api.sfx('tap'); hud();
      }
      function restart() { if (!picker.hidden) return; load(li); api.sfx('tap'); }
      function hint() {
        if (solved || !picker.hidden) return;
        const r = bpSolve(L, boxes, player, 40000, 6);
        if (r === null) { api.toast('Stuck: a crate can no longer reach a target. Undo or restart.'); api.sfx('bad'); return; }
        if (r === undefined) { api.toast('No quick hint here. Try undoing a few moves.'); return; }
        const [from, d] = r.path[0];
        const prev = new Int32Array(L.n).fill(-1), q = [player]; prev[player] = player;
        for (let h = 0; h < q.length && prev[from] < 0; h++) {
          const i = q[h];
          for (let k = 0; k < 4; k++) { const j = i + DX[k] + DY[k] * L.w; if (prev[j] < 0 && L.inside[j] && !L.wall[j] && !boxAt[j]) { prev[j] = i; q.push(j); } }
        }
        if (prev[from] < 0) return;
        queue.length = 0;
        for (let c = from; c !== player; c = prev[c]) queue.unshift(dirTo(prev[c], c));
        queue.push(d);
        api.toast(r.pushes + ' pushes to go');
        tryMove(queue.shift());
      }
      function win() {
        solved = true; queue.length = 0;
        done.add(li);
        if (!best[li] || moves < best[li]) best[li] = moves;
        persist();
        const top = topDone();
        api.score(top);
        newBest = api.submit(top);
      }
      function showWin() {
        const last = li === N - 1;
        api.overlay({
          kicker: newBest ? 'New best!' : `Level ${li + 1} of ${N}`,
          title: last ? 'Warehouse cleared!' : 'Level clear!',
          text: last ? 'Every crate in every warehouse is home. Replay any level to beat your move count.' : moves <= best[li] ? 'All crates delivered. Nice and tidy.' : 'All crates delivered.',
          stats: [['Moves', moves], ['Pushes', pushes], ['Best', best[li]]],
          button: last ? 'Level select' : 'Next level',
          onAction: () => last ? openPicker() : load(li + 1),
          secondary: 'Replay', onSecondary: () => load(li)
        });
      }
      function openPicker() {
        api.hideOverlay();
        picker.innerHTML = `<div class="pick-card"><h3 class="g-title">Choose a level</h3><p>${done.size} of ${N} cleared</p><div class="lvgrid">${BP_LEVELS.map((_, i) => {
          const open = unlocked(i);
          return `<button type="button" class="lvb${done.has(i) ? ' done' : ''}${i === li ? ' cur' : ''}" data-i="${i}"${open ? '' : ' disabled'} aria-label="Level ${i + 1}">${open ? i + 1 : I_LOCK}${done.has(i) ? `<i>${I_CHECK}</i>` : ''}</button>`;
        }).join('')}</div><button type="button" class="g-btn ghost sm" data-x>Close</button></div>`;
        picker.hidden = false;
      }
      function closePicker() {
        picker.hidden = true;
        if (solved) showWin();
      }
      press(api, picker, '[data-i],[data-x]', b => {
        if (b.dataset.x != null) { closePicker(); return; }
        picker.hidden = true; api.sfx('tap'); load(+b.dataset.i);
      });
      press(api, bar, '[data-a]', b => { const a = b.dataset.a; if (a === 'undo') undo(); else if (a === 'reset') restart(); else if (a === 'hint') hint(); else if (picker.hidden) { api.sfx('tap'); openPicker(); } else closePicker(); });
      press(api, dpad, '[data-d]', b => { queue.length = 0; tryMove(+b.dataset.d); });

      api.on(window, 'keydown', e => {
        if (!picker.hidden) return;
        const d = KEYDIR[e.code];
        if (d !== undefined && !mods(e)) { e.preventDefault(); queue.length = 0; tryMove(d); return; }
        if (e.code === 'KeyZ' || e.code === 'Backspace' || e.code === 'KeyU') { e.preventDefault(); undo(); }
        else if (e.code === 'KeyR' && !mods(e)) { e.preventDefault(); restart(); }
        else if (e.code === 'KeyH' && !mods(e)) { e.preventDefault(); hint(); }
      });

      let drag = null;
      api.on(canvas, 'pointerdown', e => {
        if (e.button) return;
        if (e.pointerType === 'touch') dpad.style.display = 'grid';
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {   }
      });
      api.on(canvas, 'pointermove', e => {
        if (!drag || drag.id !== e.pointerId) return;
        const r = canvas.getBoundingClientRect(), step = Math.max(20, T * r.width / W * .75), dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < step) return;
        drag.moved = true; drag.x = e.clientX; drag.y = e.clientY; queue.length = 0;
        tryMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      });
      api.on(canvas, 'pointerup', e => {
        if (!drag || drag.id !== e.pointerId) return;
        const moved = drag.moved; drag = null;
        if (!moved && !solved) walkTo(toLocal(e));
      });
      api.on(canvas, 'pointercancel', () => { drag = null; });
      function walkTo(p) {
        const x = Math.floor((p.x - ox) / T), y = Math.floor((p.y - oy) / T);
        if (x < 0 || y < 0 || x >= L.w || y >= L.h) return;
        const t = y * L.w + x;
        if (!L.inside[t] || t === player) return;
        const d0 = dirTo(player, t);
        if (boxAt[t]) { if (d0 >= 0) { queue.length = 0; tryMove(d0); } return; }
        const prev = new Int32Array(L.n).fill(-1), q = [player]; prev[player] = player;
        for (let h = 0; h < q.length && prev[t] < 0; h++) {
          const i = q[h];
          for (let d = 0; d < 4; d++) { const j = i + DX[d] + DY[d] * L.w; if (prev[j] < 0 && L.inside[j] && !boxAt[j]) { prev[j] = i; q.push(j); } }
        }
        if (prev[t] < 0) { api.sfx('tick'); return; }
        queue.length = 0;
        for (let c = t; c !== player; c = prev[c]) queue.unshift(dirTo(prev[c], c));
        tryMove(queue.shift());
      }

      const sortY = (a, b) => (a === order.length - 1 ? pvy + .01 : bvy[a]) - (b === order.length - 1 ? pvy + .01 : bvy[b]);
      api.loop((dt, tms) => {
        time = tms / 1000;
        const tx = player % L.w, ty = (player / L.w) | 0, dx = tx - pvx, dy = ty - pvy, dist = Math.hypot(dx, dy);
        const speed = 8.5 + 14 * Math.max(0, dist - 1);
        if (dist > 1e-4) { const s = Math.min(dist, speed * dt); pvx += dx / dist * s; pvy += dy / dist * s; phase += s * Math.PI; }
        mv += ((dist > 1e-3 ? 1 : 0) - mv) * Math.min(1, dt * 14);
        let settled = dist < 1e-3;
        for (let k = 0; k < boxes.length; k++) {
          const bx = boxes[k] % L.w, by = (boxes[k] / L.w) | 0, ex = bx - bvx[k], ey = by - bvy[k], bd = Math.hypot(ex, ey);
          if (bd > 1e-4) { const s = Math.min(bd, speed * dt); bvx[k] += ex / bd * s; bvy[k] += ey / bd * s; settled = false; }
          if (pop[k] > 0) pop[k] = Math.max(0, pop[k] - dt * 3.2);
        }
        if (pushT > 0) pushT -= dt;
        if (bumpT > 0) bumpT -= dt;
        if (shake > 0) shake = Math.max(0, shake - dt * 2);
        if (queue.length && dist < .08 && !solved) tryMove(queue.shift());
        if (solved && settled && winT < 0) {
          winT = 0; shake = .35; api.sfx('win');
          for (const b of boxes) fx.burst(ox + (b % L.w + .5) * T, oy + (((b / L.w) | 0) + .4) * T, 18, CONFETTI, 260, 1.1, T * .08, 380);
        }
        if (winT >= 0) { winT += dt; if (winT > .9 && !shown) { shown = true; if (picker.hidden) showWin(); } }
        fx.step(dt);

        ctx.save();
        if (shake > 0) ctx.translate((Math.random() - .5) * shake * 10, (Math.random() - .5) * shake * 10);
        ctx.drawImage(bg, 0, 0, W, H);
        ctx.lineCap = 'round';
        for (let i = 0; i < L.n; i++) {
          if (!L.goal[i]) continue;
          const cx = ox + (i % L.w + .5) * T, cy = oy + (((i / L.w) | 0) + .5) * T, covered = boxAt[i] > 0;
          if (covered) continue;
          const pl = .5 + .5 * Math.sin(time * 3.2 + i);
          ctx.fillStyle = `rgba(255,150,60,${.16 + pl * .1})`; ctx.beginPath(); ctx.arc(cx, cy, T * .36, 0, 7); ctx.fill();
          ctx.strokeStyle = '#ff8f3a'; ctx.lineWidth = T * .065; ctx.setLineDash([T * .1, T * .085]); ctx.lineDashOffset = -time * T * .25;
          ctx.beginPath(); ctx.arc(cx, cy, T * .27, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = '#ff8f3a'; ctx.beginPath(); ctx.arc(cx, cy, T * (.075 + pl * .02), 0, 7); ctx.fill();
        }
        order.sort(sortY);
        const bump = bumpT > 0 ? Math.sin(bumpT / .16 * Math.PI) * T * .07 : 0;
        for (const k of order) {
          if (k === boxes.length) {
            bpWorker(ctx, ox + (pvx + .5) * T + DX[bumpD] * bump, oy + (pvy + .5) * T + DY[bumpD] * bump, T, face, phase, mv, pushT > 0, time);
          } else {
            const on = !!L.goal[boxes[k]] && Math.abs(bvx[k] - boxes[k] % L.w) + Math.abs(bvy[k] - ((boxes[k] / L.w) | 0)) < .5;
            const sc = 1 + Math.sin(pop[k] * Math.PI) * .14;
            if (on) { ctx.fillStyle = `rgba(80,240,150,${.18 + (solved ? .2 : 0)})`; ctx.beginPath(); ctx.arc(ox + (bvx[k] + .5) * T, oy + (bvy[k] + .5) * T, T * .55, 0, 7); ctx.fill(); }
            bpCrate(ctx, ox + (bvx[k] + .5) * T, oy + (bvy[k] + .5) * T, T, on, sc);
          }
        }
        fx.draw(ctx);
        ctx.restore();
        if (winT >= 0) {
          const a = Math.min(1, winT * 2);
          ctx.fillStyle = `rgba(255,255,255,${a * .16})`; ctx.fillRect(0, 0, W, H);
        }
      });

      const start = Number.isInteger(saved.cur) && saved.cur >= 0 && saved.cur < N && unlocked(saved.cur) && !done.has(saved.cur) ? saved.cur : Math.min(firstOpen(), N - 1);
      load(start);
      scoreTop();
    }
  });

  Ameplay.register({
    id: 'pipe-connect',
    title: 'Pipe Connect',
    category: 'Puzzle',
    better: 'high',
    width: 640,
    blurb: 'Spin the pipes until water flows from the tank to every drain.',
    help: 'Click or tap a tile to rotate · right-click, or flip the Turn button, to turn the other way · <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> + <kbd>Space</kbd> / <kbd>Q</kbd>',
    icon: ICON('<path d="M6 22h16a10 10 0 0 1 10 10v26"/><path d="M6 34h10"/><path d="M44 6v14a8 8 0 0 0 8 8h6"/><path d="M48 38c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z"/>'),
    css: `
.gm-pipe-connect{gap:14px}
.gm-pipe-connect .bar{width:min(480px,100%);display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap}
.gm-pipe-connect .g-hud{gap:4px 22px}
.gm-pipe-connect .g-stat{align-items:flex-start;min-width:0}
.gm-pipe-connect .g-btn svg{width:17px;height:17px}
.gm-pipe-connect .dir{min-width:118px}
.gm-pipe-connect .dir.on{background:#e6f4ff;border-color:#0096c7;color:#006f94}
@media (pointer:coarse){.gm-pipe-connect .g-btn.sm{height:40px}}
.gm-pipe-connect .g-canvas{background:#1b2440;box-shadow:0 18px 40px -22px rgba(20,40,90,.8);cursor:pointer;border-radius:22px}
`,
    mount(root, api) {
      const saved = api.load() || {};
      let level = Number.isInteger(saved.level) && saved.level >= 1 ? saved.level : 1;
      let solvedCount = Number.isInteger(saved.solved) && saved.solved >= 0 ? saved.solved : 0;
      const bar = el('div', 'bar', `<div class="g-hud">${stat('Level', level, 'lv')}${stat('Time', '0:00', 'tm')}${stat('Moves', 0, 'mv')}</div><div class="g-row" style="gap:8px"><button type="button" class="g-btn ghost sm dir" data-a="dir" aria-label="Turn direction" title="Tap direction (right-click turns back)"></button><button type="button" class="g-btn ghost sm" data-a="new">${I_DICE}New</button></div>`);
      root.append(bar);
      const { canvas, ctx, w: W, h: H, toLocal } = api.canvas(480, 480);
      const lvV = bar.querySelector('.lv .v'), tmV = bar.querySelector('.tm .v'), mvV = bar.querySelector('.mv .v');
      const fx = particles(), PAD = 14;
      let n, src, base, rot, cur, tgt, ang, press0, flow, T, moves, time, started, won, flowF, hit, maxD, shown, newBest, leaves, cx = 0, cy = 0, kb = false, hover = -1, shownSec = -1, clock0 = 0;

      const persist = () => api.save({ level, solved: solvedCount });
      function hud() { lvV.textContent = won ? level - 1 : level; mvV.textContent = moves; tmV.textContent = clock(time); }
      function newLevel() {
        n = Math.min(9, 5 + ((level - 1) >> 1));
        const g = pipeGen(n);
        src = g.src; base = g.sol; rot = pipeScramble(base);
        cur = base.map((m, i) => rotM(m, rot[i]));
        tgt = Float32Array.from(rot); ang = Float32Array.from(rot, r => r - 1 - Math.random() * 1.5); press0 = new Float32Array(n * n);
        T = (W - PAD * 2) / n; moves = 0; time = 0; started = false; won = false; flowF = -1; hit = new Uint8Array(n * n); shown = false; newBest = false; shownSec = -1;
        leaves = []; for (let i = 0; i < n * n; i++) if (i !== src && POP4[base[i]] === 1) leaves.push(i);
        cx = src % n; cy = (src / n) | 0;
        flow = pipeFlow(n, cur, src);
        if (flow.solved) { newLevel(); return; }
        fx.list.length = 0; hud();
        api.sfx('pop');
      }
      function rotate(i, dir) {
        if (won) return;
        started = true;
        tgt[i] += dir; rot[i] = (rot[i] + dir + 4) & 3; cur[i] = rotM(base[i], rot[i]); press0[i] = 1;
        moves++; api.sfx('tick');
        flow = pipeFlow(n, cur, src);
        if (flow.solved) win();
        hud();
      }
      function win() {
        won = true; solvedCount++; level++;
        persist();
        api.score(solvedCount);
        newBest = api.submit(solvedCount);
        flowF = -.35; maxD = 0;
        for (let i = 0; i < n * n; i++) maxD = Math.max(maxD, flow.dist[i]);
      }
      const dirBtn = bar.querySelector('[data-a="dir"]');
      let back = false;
      const paintDir = () => { dirBtn.innerHTML = back ? `${I_CCW}Turn left` : `${I_CW}Turn right`; dirBtn.classList.toggle('on', back); };
      paintDir();
      press(api, bar, '[data-a]', b => { if (b === dirBtn) { back = !back; paintDir(); api.sfx('tick'); } else if (!won) newLevel(); });

      api.on(canvas, 'contextmenu', e => e.preventDefault());
      const cellAt = e => { const p = toLocal(e), x = Math.floor((p.x - PAD) / T), y = Math.floor((p.y - PAD) / T); return x < 0 || y < 0 || x >= n || y >= n ? -1 : y * n + x; };
      api.on(canvas, 'pointerdown', e => {
        const i = cellAt(e);
        if (i < 0) return;
        e.preventDefault();
        kb = false; cx = i % n; cy = (i / n) | 0;
        rotate(i, (e.button === 2 || e.shiftKey) !== back ? -1 : 1);
      });
      api.on(canvas, 'pointermove', e => { hover = e.pointerType === 'mouse' ? cellAt(e) : -1; });
      api.on(canvas, 'pointerleave', () => { hover = -1; });
      api.on(window, 'keydown', e => {
        if (won || mods(e)) return;
        const d = KEYDIR[e.code];
        if (d !== undefined) { e.preventDefault(); kb = true; cx = Math.max(0, Math.min(n - 1, cx + DX[d])); cy = Math.max(0, Math.min(n - 1, cy + DY[d])); api.sfx('tick'); return; }
        if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); kb = true; rotate(cy * n + cx, 1); }
        else if (e.code === 'KeyQ') { e.preventDefault(); kb = true; rotate(cy * n + cx, -1); }
      });

      const arms = (m, len) => { ctx.beginPath(); for (let d = 0; d < 4; d++) if (m & (1 << d)) { ctx.moveTo(0, 0); ctx.lineTo(DX[d] * len, DY[d] * len); } };
      const layer = (m, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; arms(m, T / 2 + .5); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, 7); ctx.fill(); };
      function pipe(m, conn) {
        ctx.lineCap = 'butt';
        layer(m, T * .44, '#0b1328');
        layer(m, T * .36, conn ? '#d3ecff' : '#a9b5ca');
        ctx.fillStyle = conn ? '#94cdf2' : '#7c88a2';
        for (let d = 0; d < 4; d++) if (m & (1 << d)) {
          if (DX[d]) ctx.fillRect(DX[d] * T * .41 - T * .045, -T * .245, T * .09, T * .49);
          else ctx.fillRect(-T * .245, DY[d] * T * .41 - T * .045, T * .49, T * .09);
        }
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = T * .05; ctx.beginPath();
        for (let d = 0; d < 4; d++) if (m & (1 << d)) { const ox = DY[d] ? -T * .1 : 0, oy = DX[d] ? -T * .1 : 0; ctx.moveTo(ox, oy); ctx.lineTo(DX[d] * T * .34 + ox, DY[d] * T * .34 + oy); }
        ctx.stroke();
        layer(m, T * .15, conn ? '#3fb2ff' : '#313c5a');
      }

      api.loop((dt, tms) => {
        const t = tms / 1000;
        if (started && !won) { time += dt; const s = Math.floor(time); if (s !== shownSec) { shownSec = s; tmV.textContent = clock(s); } }
        for (let i = 0; i < n * n; i++) {
          const d = tgt[i] - ang[i];
          ang[i] += Math.abs(d) < 1e-3 ? d : d * Math.min(1, dt * 16);
          if (press0[i] > 0) press0[i] = Math.max(0, press0[i] - dt * 5);
        }
        if (won) {
          flowF += dt * 7.5;
          let pops = 0;
          for (const i of leaves) if (!hit[i] && flowF - flow.dist[i] >= 1) {
            hit[i] = 1;
            fx.burst(PAD + (i % n + .5) * T, PAD + (((i / n) | 0) + .5) * T, 12, ['#7fd3ff', '#ffffff', '#3fb2ff'], 150, .7, T * .06, 320);
            if (!pops++) api.sfx('pop');
          }
          if (flowF > maxD + 1.4 && !shown) {
            shown = true; api.sfx('win');
            fx.burst(W / 2, H / 2, 70, CONFETTI, 420, 1.4, 6, 420);
            api.timeout(() => api.overlay({
              kicker: newBest ? 'New best!' : `Level ${level - 1} solved`,
              title: 'Water flows!',
              text: `Every drain is filling. Next up: a ${Math.min(9, 5 + ((level - 1) >> 1))}×${Math.min(9, 5 + ((level - 1) >> 1))} grid.`,
              stats: [['Time', clock(time)], ['Moves', moves], ['Solved', solvedCount]],
              button: 'Next level', onAction: newLevel
            }), 650);
          }
        }
        fx.step(dt);

        const bgG = ctx.createLinearGradient(0, 0, 0, H);
        bgG.addColorStop(0, '#26335e'); bgG.addColorStop(1, '#172042');
        ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
        const gap = Math.max(2, T * .05);
        for (let i = 0; i < n * n; i++) {
          const x0 = PAD + (i % n) * T, y0 = PAD + ((i / n) | 0) * T, conn = flow.dist[i] >= 0;
          const s = 1 - Math.sin(press0[i] * Math.PI) * .06;
          ctx.save(); ctx.translate(x0 + T / 2, y0 + T / 2); ctx.scale(s, s);
          ctx.fillStyle = won ? '#2d5b8c' : conn ? '#2e4a7c' : '#2a3760';
          rr(ctx, -T / 2 + gap, -T / 2 + gap, T - gap * 2, T - gap * 2, T * .17); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.06)'; rr(ctx, -T / 2 + gap, -T / 2 + gap, T - gap * 2, T * .3, T * .17); ctx.fill();
          if (i === hover && !won) { ctx.fillStyle = 'rgba(255,255,255,.08)'; rr(ctx, -T / 2 + gap, -T / 2 + gap, T - gap * 2, T - gap * 2, T * .17); ctx.fill(); }
          ctx.restore();
        }
        for (let i = 0; i < n * n; i++) {
          const x0 = PAD + (i % n) * T + T / 2, y0 = PAD + ((i / n) | 0) * T + T / 2;
          const s = 1 - Math.sin(press0[i] * Math.PI) * .06;
          ctx.save(); ctx.translate(x0, y0); ctx.scale(s, s); ctx.rotate(ang[i] * Math.PI / 2);
          pipe(base[i], flow.dist[i] >= 0);
          ctx.restore();
        }
        if (won) {
          ctx.lineCap = 'butt';
          for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass ? 'rgba(225,246,255,.9)' : '#1688ff'; ctx.lineWidth = pass ? T * .05 : T * .15;
            ctx.setLineDash(pass ? [T * .1, T * .17] : []); ctx.lineDashOffset = -t * T * 1.1;
            for (let i = 0; i < n * n; i++) {
              const q = Math.max(0, Math.min(1, flowF - flow.dist[i]));
              if (q <= 0) continue;
              const px = PAD + (i % n) * T + T / 2, py = PAD + ((i / n) | 0) * T + T / 2, L2 = T / 2 + .5, pd = flow.par[i];
              const k1 = pd < 0 ? 1 : Math.min(1, q * 2), k2 = pd < 0 ? q : Math.max(0, q * 2 - 1);
              ctx.beginPath();
              if (pd >= 0) { ctx.moveTo(px + DX[pd] * L2, py + DY[pd] * L2); ctx.lineTo(px + DX[pd] * L2 * (1 - k1), py + DY[pd] * L2 * (1 - k1)); }
              if (k2 > 0) for (let d = 0; d < 4; d++) if (d !== pd && cur[i] & (1 << d)) { ctx.moveTo(px, py); ctx.lineTo(px + DX[d] * L2 * k2, py + DY[d] * L2 * k2); }
              ctx.stroke();
            }
          }
          ctx.setLineDash([]);
        }
        for (const i of leaves) {
          const px = PAD + (i % n) * T + T / 2, py = PAD + ((i / n) | 0) * T + T / 2, conn = flow.dist[i] >= 0, full = hit[i];
          ctx.fillStyle = '#0b1328'; ctx.beginPath(); ctx.arc(px, py, T * .27, 0, 7); ctx.fill();
          ctx.fillStyle = conn ? '#d3ecff' : '#b4bfd2'; ctx.beginPath(); ctx.arc(px, py, T * .235, 0, 7); ctx.fill();
          ctx.fillStyle = full ? '#1688ff' : conn ? '#3fb2ff' : '#1b2238'; ctx.beginPath(); ctx.arc(px, py, T * .165, 0, 7); ctx.fill();
          ctx.strokeStyle = full ? 'rgba(220,245,255,.85)' : 'rgba(150,165,190,.55)'; ctx.lineWidth = T * .035; ctx.lineCap = 'round';
          ctx.beginPath(); for (const o of [-.08, 0, .08]) { ctx.moveTo(px + o * T, py - T * .1); ctx.lineTo(px + o * T, py + T * .1); } ctx.stroke();
          if (full) {
            const r = ((t * 1.4 + i * .37) % 1);
            ctx.strokeStyle = `rgba(160,225,255,${1 - r})`; ctx.lineWidth = T * .03;
            ctx.beginPath(); ctx.arc(px, py, T * (.2 + r * .25), 0, 7); ctx.stroke();
          } else if (!conn) {
            ctx.fillStyle = `rgba(255,120,120,${.5 + .5 * Math.sin(t * 4 + i)})`;
            ctx.beginPath(); ctx.arc(px + T * .2, py - T * .2, T * .055, 0, 7); ctx.fill();
          }
        }
        {
          const px = PAD + (src % n) * T + T / 2, py = PAD + ((src / n) | 0) * T + T / 2, pl = .5 + .5 * Math.sin(t * 3);
          ctx.fillStyle = `rgba(255,200,70,${.18 + pl * .14})`; ctx.beginPath(); ctx.arc(px, py, T * (.38 + pl * .04), 0, 7); ctx.fill();
          ctx.fillStyle = '#0b1328'; ctx.beginPath(); ctx.arc(px, py, T * .33, 0, 7); ctx.fill();
          const rg = ctx.createLinearGradient(px, py - T * .3, px, py + T * .3);
          rg.addColorStop(0, '#ffe08a'); rg.addColorStop(1, '#f5a524');
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(px, py, T * .3, 0, 7); ctx.fill();
          const wg = ctx.createLinearGradient(px, py - T * .22, px, py + T * .22);
          wg.addColorStop(0, '#6fd0ff'); wg.addColorStop(1, '#1688ff');
          ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(px, py, T * .22, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath();
          const s = T * .11, dy = py + T * .02;
          ctx.moveTo(px, dy - s * 1.3); ctx.bezierCurveTo(px + s * .2, dy - s * .7, px + s, dy - s * .1, px + s, dy + s * .35);
          ctx.arc(px, dy + s * .35, s, 0, Math.PI); ctx.bezierCurveTo(px - s, dy - s * .1, px - s * .2, dy - s * .7, px, dy - s * 1.3); ctx.fill();
        }
        if (kb && !won) {
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3.5;
          rr(ctx, PAD + cx * T + 2, PAD + cy * T + 2, T - 4, T - 4, T * .18); ctx.stroke();
        }
        fx.draw(ctx);
      });

      newLevel();
      api.score(solvedCount || '—');
    }
  });

  Ameplay.register({
    id: 'sudoku',
    title: 'Sudoku',
    category: 'Puzzle',
    better: 'low',
    format: v => Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0'),
    width: 820,
    blurb: 'Fill the grid so every row, column and box holds 1 to 9.',
    help: '<kbd>1</kbd>–<kbd>9</kbd> place · <kbd>Shift</kbd>+digit or <kbd>N</kbd> notes · <kbd>Z</kbd> undo · <kbd>H</kbd> hint · arrows move',
    icon: ICON('<rect x="8" y="8" width="48" height="48" rx="7"/><path d="M24 8v48M40 8v48M8 24h48M8 40h48"/><rect x="27" y="27" width="10" height="10" rx="2" fill="currentColor"/>'),
    css: `
.gm-sudoku{container-type:inline-size;gap:0}
.gm-sudoku .wrap{display:flex;gap:26px;align-items:center;justify-content:center;width:100%}
.gm-sudoku .g-canvas{background:#fff;border-radius:18px;box-shadow:0 0 0 1px #dfe6f5,0 18px 40px -22px rgba(30,60,120,.55);flex:none}
.gm-sudoku .side{width:256px;flex:none;display:flex;flex-direction:column;gap:14px}
.gm-sudoku .seg{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:4px;border-radius:14px;background:var(--sunk)}
.gm-sudoku .seg button{height:34px;border:0;border-radius:10px;background:none;font:800 12.5px/1 var(--sans);color:var(--muted);cursor:pointer;transition:background .2s,color .2s}
.gm-sudoku .seg button:hover{color:var(--ink)}
.gm-sudoku .seg button.on{background:#fff;color:#2f6fe0;box-shadow:0 3px 10px -4px rgba(30,60,120,.4)}
.gm-sudoku .g-hud{gap:4px 10px;justify-content:space-between;padding:0 4px}
.gm-sudoku .g-stat{min-width:0}
.gm-sudoku .mk.hot .v{color:var(--bad)}
.gm-sudoku .tools{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.gm-sudoku .tools button{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;padding:4px 0;border:0;background:none;cursor:pointer;color:var(--ink-2);font:800 11.5px/1 var(--sans)}
.gm-sudoku .tools svg{width:22px;height:22px;padding:11px;box-sizing:content-box;border-radius:50%;background:#edf3ff;color:#2f6fe0;transition:transform .3s var(--spring),background .2s}
.gm-sudoku .tools button:hover svg{transform:translateY(-2px)}
.gm-sudoku .tools button:active svg{transform:scale(.9)}
.gm-sudoku .tools button.on svg{background:#2f6fe0;color:#fff}
.gm-sudoku .tools button:disabled{opacity:.4;cursor:default}
.gm-sudoku .tools b{position:absolute;top:-3px;left:calc(50% + 10px);min-width:22px;height:18px;padding:0 5px;border-radius:999px;background:#2f6fe0;color:#fff;font-size:10px;line-height:18px;box-shadow:0 0 0 2px #fff}
.gm-sudoku .tools .off b{background:var(--soft)}
.gm-sudoku .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gm-sudoku .pad button{position:relative;height:60px;border:0;border-radius:16px;background:linear-gradient(#f5f8ff,#e6eeff);box-shadow:inset 0 -3px 0 #cddbf7;color:#2f6fe0;font:900 28px/1 var(--sans);cursor:pointer;touch-action:manipulation}
.gm-sudoku .pad button:hover{background:linear-gradient(#eef4ff,#dce7ff)}
.gm-sudoku .pad button:active{transform:translateY(2px);box-shadow:inset 0 -1px 0 #cddbf7}
.gm-sudoku .pad small{position:absolute;right:8px;bottom:6px;font-size:10.5px;font-weight:800;color:#8a97b8}
.gm-sudoku .pad button.done{opacity:.3}
.gm-sudoku .pad.notes button{color:#7a86a6;font-size:22px;font-weight:800}
.gm-sudoku .lim{display:flex;gap:10px;align-items:center;justify-content:center;font-weight:800;font-size:12.5px;color:var(--muted);cursor:pointer}
.gm-sudoku .lim input{position:absolute;opacity:0;pointer-events:none}
.gm-sudoku .lim i{position:relative;width:36px;height:21px;flex:none;border-radius:999px;background:var(--line-2);transition:background .25s}
.gm-sudoku .lim i::after{content:"";position:absolute;left:3px;top:3px;width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .3s var(--spring)}
.gm-sudoku .lim input:checked+i{background:var(--bad)}
.gm-sudoku .lim input:checked+i::after{transform:translateX(15px)}
.gm-sudoku .lim input:focus-visible+i{outline:2.5px solid var(--accent);outline-offset:2px}
@container (max-width:800px){
  .gm-sudoku .wrap{flex-direction:column;gap:14px}
  .gm-sudoku .side{width:min(504px,100%)}
  .gm-sudoku .side .seg{order:-2}
  .gm-sudoku .side .g-hud{order:-1}
  .gm-sudoku .pad{grid-template-columns:repeat(9,1fr);gap:5px}
  .gm-sudoku .pad button{height:54px;font-size:24px;border-radius:12px}
  .gm-sudoku .pad small{right:0;left:0;bottom:3px;text-align:center;font-size:9px}
}
@media (pointer:coarse){.gm-sudoku .seg{padding:1px}.gm-sudoku .seg button{height:40px}.gm-sudoku .lim{padding:10px 0;margin:-10px 0}}
`,
    mount(root, api) {
      const saved = api.load() || {};
      let diff = Number.isInteger(saved.diff) && saved.diff >= 0 && saved.diff < 4 ? saved.diff : 0;
      let limitOn = !!saved.limit;
      const bests = saved.bests && typeof saved.bests === 'object' ? saved.bests : {};
      const persist = () => api.save({ diff, limit: limitOn, bests });

      const wrap = el('div', 'wrap');
      root.append(wrap);
      const S = 504, P = 5, CS = (S - P * 2) / 9;
      const { canvas, ctx, toLocal } = api.canvas(S, S, wrap);
      const side = el('div', 'side', `
        <div class="seg">${SD_DIFFS.map((d, i) => `<button type="button" data-d="${i}">${d}</button>`).join('')}</div>
        <div class="g-hud">${stat('Time', '0:00', 'tm')}${stat('Mistakes', '0', 'mk')}${stat('Clues', '—', 'cl')}</div>
        <div class="tools">
          <button type="button" data-t="undo">${I_UNDO}<span>Undo</span></button>
          <button type="button" data-t="erase">${I_ERASE}<span>Erase</span></button>
          <button type="button" data-t="notes" class="off">${I_PEN}<span>Notes</span><b>OFF</b></button>
          <button type="button" data-t="hint">${I_BULB}<span>Hint</span><b>3</b></button>
        </div>
        <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-n="${d}">${d}<small></small></button>`).join('')}</div>
        <label class="lim"><input type="checkbox"${limitOn ? ' checked' : ''}><i></i><span>Lose after 3 mistakes</span></label>`);
      wrap.append(side);
      const tmV = side.querySelector('.tm .v'), mkS = side.querySelector('.mk'), mkV = mkS.querySelector('.v'), clV = side.querySelector('.cl .v');
      const segBtns = [...side.querySelectorAll('[data-d]')], padEl = side.querySelector('.pad'), padBtns = [...side.querySelectorAll('[data-n]')];
      const notesBtn = side.querySelector('[data-t="notes"]'), hintBtn = side.querySelector('[data-t="hint"]'), undoBtn = side.querySelector('[data-t="undo"]');
      const limBox = side.querySelector('.lim input');

      let gen = 0, puzzle, sol, vals, notes, given, hinted, conflict, undoStack, sel, notesOn = false, mistakes, hints, time, over, won, winT, shownSec, clues;
      const anim = new Float32Array(81), flash = new Float32Array(81).fill(-9), shakeA = new Float32Array(81);
      let now = 0;

      function setGame(p) {
        gen++; puzzle = p.puzzle; sol = p.solution; clues = p.clues;
        vals = Int8Array.from(puzzle); notes = new Uint16Array(81); given = Uint8Array.from(puzzle, v => v ? 1 : 0); hinted = new Uint8Array(81);
        undoStack = []; sel = 40; mistakes = 0; hints = 3; time = 0; over = false; won = false; winT = -1; shownSec = -1;
        anim.fill(0); shakeA.fill(0);
        for (let i = 0; i < 81; i++) flash[i] = now + .25 + (((i / 9) | 0) + i % 9) * .025;
        refresh();
      }
      function newGame(d) {
        diff = d; persist();
        api.hideOverlay();
        setGame(sdMake(diff));
      }
      function retry() {
        setGame({ puzzle, solution: sol, clues });
      }
      function refresh() {
        conflict = new Uint8Array(81);
        for (const u of SD_UNITS) {
          const seen = new Int8Array(10).fill(-1);
          for (const i of u) {
            const v = vals[i];
            if (!v) continue;
            if (seen[v] >= 0) { conflict[i] = 1; conflict[seen[v]] = 1; } else seen[v] = i;
          }
        }
        const cnt = new Uint8Array(10);
        for (let i = 0; i < 81; i++) if (vals[i] && vals[i] === sol[i]) cnt[vals[i]]++;
        padBtns.forEach((b, k) => { b.classList.toggle('done', cnt[k + 1] >= 9); b.querySelector('small').textContent = 9 - cnt[k + 1] || ''; });
        segBtns.forEach((b, k) => b.classList.toggle('on', k === diff));
        mkV.textContent = limitOn ? `${mistakes}/3` : mistakes; mkS.classList.toggle('hot', mistakes > 0);
        clV.textContent = clues;
        notesBtn.classList.toggle('on', notesOn); notesBtn.classList.toggle('off', !notesOn); notesBtn.querySelector('b').textContent = notesOn ? 'ON' : 'OFF';
        padEl.classList.toggle('notes', notesOn);
        hintBtn.querySelector('b').textContent = hints; hintBtn.classList.toggle('off', !hints);
        undoBtn.disabled = !undoStack.length || over;
        tmV.textContent = clock(time);
      }
      const snap = () => { undoStack.push([vals.slice(), notes.slice()]); if (undoStack.length > 400) undoStack.shift(); };
      function unitsDone(i) {
        const r = (i / 9) | 0, c = i % 9, out = [];
        for (const u of [SD_UNITS[r * 3], SD_UNITS[c * 3 + 1], SD_UNITS[SD_BOX[i] * 3 + 2]]) if (u.every(j => vals[j] === sol[j])) out.push(u);
        return out;
      }
      function placed(i) {
        const b = ~(1 << vals[i]);
        for (const p of SD_PEERS[i]) notes[p] &= b;
        const units = unitsDone(i);
        for (const u of units) for (const j of u) flash[j] = Math.max(flash[j] < now ? -9 : flash[j], now + (Math.abs(((j / 9) | 0) - ((i / 9) | 0)) + Math.abs(j % 9 - i % 9)) * .035);
        if (vals.every((v, k) => v === sol[k])) { win(); return; }
        api.sfx(units.length ? 'good' : 'tap');
      }
      function input(d, noteKey) {
        if (over || sel < 0 || given[sel] || hinted[sel]) { if (sel >= 0 && !over) shakeA[sel] = 1; return; }
        if (notesOn !== !!noteKey) {
          if (vals[sel]) return;
          snap(); notes[sel] ^= 1 << d; api.sfx('tick'); refresh(); return;
        }
        if (vals[sel] === d) return;
        snap();
        vals[sel] = d; notes[sel] = 0; anim[sel] = 1;
        if (d !== sol[sel]) {
          mistakes++; shakeA[sel] = 1; api.sfx('bad');
          refresh();
          if (limitOn && mistakes >= 3) lose();
          return;
        }
        placed(sel);
        refresh();
      }
      function erase() {
        if (over || sel < 0 || given[sel] || hinted[sel] || (!vals[sel] && !notes[sel])) return;
        snap(); vals[sel] = 0; notes[sel] = 0; api.sfx('tap'); refresh();
      }
      function undo() {
        if (over || !undoStack.length) return;
        const [v, n] = undoStack.pop();
        for (let i = 0; i < 81; i++) if (v[i] !== vals[i]) { sel = i; anim[i] = .6; hinted[i] = 0; }
        vals = v; notes = n; api.sfx('tap'); refresh();
      }
      function hint() {
        if (over) return;
        if (!hints) { api.toast('No hints left'); return; }
        let i = sel >= 0 && !given[sel] && vals[sel] !== sol[sel] ? sel : -1;
        if (i < 0) {
          let bestN = 10;
          for (let j = 0; j < 81; j++) {
            if (vals[j] === sol[j]) continue;
            let m = 0x3FE;
            for (const p of SD_PEERS[j]) if (vals[p] && vals[p] === sol[p]) m &= ~(1 << vals[p]);
            if (POP[m] < bestN) { bestN = POP[m]; i = j; }
          }
        }
        if (i < 0) return;
        snap();
        hints--; sel = i; vals[i] = sol[i]; notes[i] = 0; hinted[i] = 1; anim[i] = 1; flash[i] = now;
        placed(i);
        refresh();
      }
      function win() {
        over = true; won = true; winT = 0;
        const secs = Math.max(1, Math.floor(time));
        const nb = api.submit(secs);
        const prev = bests[diff];
        if (!prev || secs < prev) bests[diff] = secs;
        persist();
        api.sfx('win');
        for (let i = 0; i < 81; i++) flash[i] = now + (((i / 9) | 0) + i % 9) * .045;
        const g0 = gen;
        api.timeout(() => g0 === gen && api.overlay({
          kicker: nb ? 'New best!' : SD_DIFFS[diff],
          title: 'Solved!',
          text: !prev || secs < prev ? `Your fastest ${SD_DIFFS[diff]} solve yet.` : `${SD_DIFFS[diff]} record: ${clock(prev)}.`,
          stats: [['Time', clock(secs)], ['Mistakes', mistakes], ['Hints', 3 - hints], [`Best ${SD_DIFFS[diff]}`, clock(bests[diff])]],
          button: 'New puzzle', onAction: () => newGame(diff),
          secondary: diff < 3 ? `Try ${SD_DIFFS[diff + 1]}` : null, onSecondary: () => newGame(diff + 1)
        }), 1300);
        refresh();
      }
      function lose() {
        over = true;
        api.sfx('lose');
        refresh();
        const g0 = gen;
        api.timeout(() => g0 === gen && api.overlay({
          kicker: SD_DIFFS[diff], title: 'Out of mistakes',
          text: 'Three wrong numbers. Shake it off and go again.',
          stats: [['Time', clock(time)], ['Filled', `${vals.reduce((a, v, i) => a + (v && v === sol[i] ? 1 : 0), 0)}/81`]],
          button: 'New puzzle', onAction: () => newGame(diff),
          secondary: 'Retry this one', onSecondary: retry
        }), 500);
      }

      press(api, side, '[data-d]', b => { const d = +b.dataset.d; api.sfx('tap'); newGame(d); });
      press(api, side, '[data-n]', b => input(+b.dataset.n, false));
      press(api, side, '[data-t]', b => {
        const t = b.dataset.t;
        if (t === 'undo') undo(); else if (t === 'erase') erase(); else if (t === 'hint') hint();
        else { notesOn = !notesOn; api.sfx('tick'); refresh(); }
      });
      api.on(limBox, 'change', () => {
        limitOn = limBox.checked; limBox.blur(); persist(); refresh();
        if (limitOn && mistakes >= 3 && !over) lose();
      });
      api.on(canvas, 'pointerdown', e => {
        const p = toLocal(e), c = Math.floor((p.x - P) / CS), r = Math.floor((p.y - P) / CS);
        if (c < 0 || r < 0 || c > 8 || r > 8) return;
        e.preventDefault();
        sel = r * 9 + c; api.sfx('tick');
      });
      api.on(window, 'keydown', e => {
        if (e.target && e.target.closest && e.target.closest('textarea,input:not([type=checkbox])')) return;
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
        if (mods(e)) return;
        const m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code);
        if (m) { e.preventDefault(); if (m[1] === '0') erase(); else input(+m[1], e.shiftKey); return; }
        const d = KEYDIR[e.code];
        if (d !== undefined) { e.preventDefault(); if (sel < 0) sel = 40; const r = ((sel / 9) | 0) + DY[d], c = sel % 9 + DX[d]; sel = ((r + 9) % 9) * 9 + (c + 9) % 9; return; }
        if (e.code === 'Backspace' || e.code === 'Delete') { e.preventDefault(); erase(); }
        else if (e.code === 'KeyN') { notesOn = !notesOn; api.sfx('tick'); refresh(); }
        else if (e.code === 'KeyZ') undo();
        else if (e.code === 'KeyH') hint();
      });

      api.loop((dt, tms) => {
        now = tms / 1000;
        if (!over) { time += dt; const s = Math.floor(time); if (s !== shownSec) { shownSec = s; tmV.textContent = clock(s); api.score(s); } }
        for (let i = 0; i < 81; i++) {
          if (anim[i] > 0) anim[i] = Math.max(0, anim[i] - dt * 5);
          if (shakeA[i] > 0) shakeA[i] = Math.max(0, shakeA[i] - dt * 3.5);
        }
        if (winT >= 0) winT += dt;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, S, S);
        const sv = sel >= 0 ? vals[sel] : 0, sr = (sel / 9) | 0, sc = sel % 9, sb = SD_BOX[sel];
        for (let i = 0; i < 81; i++) {
          const r = (i / 9) | 0, c = i % 9, x = P + c * CS, y = P + r * CS;
          let col = SD_BOX[i] % 2 ? '#f6f8fe' : '#ffffff';
          if (sel >= 0 && !won) {
            if (r === sr || c === sc || SD_BOX[i] === sb) col = '#e8effd';
            if (sv && vals[i] === sv) col = '#c9dcff';
            if (i === sel) col = '#a9c7ff';
          }
          if (conflict[i] && vals[i] && !won) col = i === sel ? '#ffb3b3' : '#ffe0e0';
          ctx.fillStyle = col; ctx.fillRect(x, y, CS + .5, CS + .5);
          const f = (now - flash[i]) / .5;
          if (f > 0 && f < 1) { ctx.fillStyle = won ? `rgba(110,200,140,${Math.sin(f * Math.PI) * .55})` : `rgba(120,170,255,${Math.sin(f * Math.PI) * .45})`; ctx.fillRect(x, y, CS + .5, CS + .5); }
        }
        ctx.strokeStyle = '#d6deee'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 1; k < 9; k++) { if (k % 3) { const o = Math.round(P + k * CS) + .5; ctx.moveTo(o, P); ctx.lineTo(o, S - P); ctx.moveTo(P, o); ctx.lineTo(S - P, o); } }
        ctx.stroke();
        ctx.strokeStyle = '#34466e'; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let k = 3; k < 9; k += 3) { const o = P + k * CS; ctx.moveTo(o, P); ctx.lineTo(o, S - P); ctx.moveTo(P, o); ctx.lineTo(S - P, o); }
        ctx.stroke();
        ctx.lineWidth = 3; rr(ctx, P, P, S - P * 2, S - P * 2, 12); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 81; i++) {
          const r = (i / 9) | 0, c = i % 9, x = P + c * CS + CS / 2, y = P + r * CS + CS / 2, v = vals[i];
          if (v) {
            const wv = Math.max(0, Math.sin((now - flash[i]) / .5 * Math.PI));
            const s = 1 + anim[i] * anim[i] * .35 + (won && (now - flash[i]) > 0 && (now - flash[i]) < .5 ? wv * .25 : 0);
            const jx = shakeA[i] > 0 ? Math.sin(shakeA[i] * 30) * shakeA[i] * 4 : 0;
            ctx.save(); ctx.translate(x + jx, y + 1.5); ctx.scale(s, s);
            ctx.font = `${given[i] ? 800 : 900} ${Math.round(CS * .56)}px Nunito, system-ui, sans-serif`;
            ctx.fillStyle = given[i] ? '#1f2a44' : v !== sol[i] ? '#e5484d' : hinted[i] ? '#8b5cf6' : '#2f6fe0';
            ctx.fillText(v, 0, 0);
            ctx.restore();
          } else if (notes[i]) {
            ctx.font = `800 ${Math.round(CS * .23)}px Nunito, system-ui, sans-serif`;
            for (let d = 1; d <= 9; d++) {
              if (!(notes[i] & (1 << d))) continue;
              const nx = x + ((d - 1) % 3 - 1) * CS * .29, ny = y + (((d - 1) / 3 | 0) - 1) * CS * .29 + 1;
              if (d === sv) { ctx.fillStyle = '#2f6fe0'; ctx.beginPath(); ctx.arc(nx, ny - 1, CS * .13, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; }
              else ctx.fillStyle = '#7a86a6';
              ctx.fillText(d, nx, ny);
            }
          } else if (shakeA[i] > 0) {
            ctx.fillStyle = `rgba(239,79,79,${shakeA[i] * .25})`; ctx.fillRect(x - CS / 2, y - CS / 2, CS, CS);
          }
        }
        if (sel >= 0 && !won) {
          ctx.strokeStyle = '#2f6fe0'; ctx.lineWidth = 2.5;
          rr(ctx, P + sc * CS + 2, P + sr * CS + 2, CS - 4, CS - 4, 8); ctx.stroke();
        }
      });

      newGame(diff);
    }
  });
})();

