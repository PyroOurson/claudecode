
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const wrapPi = a => a - TAU * Math.floor((a + Math.PI) / TAU);
  const hr = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const bits = m => { let c = 0; while (m) { c += m & 1; m >>>= 1; } return c; };
  const rng = seed => { let a = (seed >>> 0) || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; };

  const CFG = {
    METRES: 2,
    RUN: 6.04, RUN_AIR: 5.7,
    STRAFE: 6.0, STRAFE_AIR: 5.25,
    ACC: 18, ACC_AIR: 11,
    FWD_ACC: 6, FWD_ACC_AIR: 1.5,
    G: 12.45, JUMP: 6.85, JUMP_CUT: 3.55,
    R: 0.22, COYOTE: 0.09, BUFFER: 0.12, CATCH: 0.03, LOST_H: -0.6,
    CRUMBLE_FALL: 0.35, CRUMBLE_SPREAD: 0.18,
    FAST: 1.6, PUSH: 3.2, RAMP_H: 0.5, RAMP_V: 1.25, RAMP_MAX: 8.5,
    DT: 1 / 120, DARK_SEE: 6.5,
    INF_MAX: 2, INF_RAMP: 2200, INF_DIFF: 1500, INF_DMAX: 1.5, PRE: 95,
    FOG_NEAR: 12, FOG_FAR: 80
  };

  const T_TILE = 1, T_CRUM = 2, T_DARK = 3, T_FAST = 4, T_LEFT = 5, T_RIGHT = 6, T_BOX = 7, T_RAMP = 8;
  const CODE = { '.': 0, '*': 0, '#': 1, o: 1, c: 2, d: 3, O: 3, '^': 4, '<': 5, '>': 6, b: 7, u: 8 };

  const TUNNELS = [
    { name: 'Prime Tunnel', hue: 222, sat: 0.62, lit: 0.47, css: '#3d6fe6' },
    { name: 'Dim Corridor', hue: 268, sat: 0.5, lit: 0.46, css: '#8a5ce0' },
    { name: 'Crate Yard', hue: 176, sat: 0.55, lit: 0.38, css: '#21b3a6' },
    { name: 'Drift Line', hue: 24, sat: 0.8, lit: 0.5, css: '#f08a2c' },
    { name: 'Prism Halls', hue: 134, sat: 0.5, lit: 0.42, css: '#3fbf63' },
    { name: 'Skyramp Way', hue: 330, sat: 0.62, lit: 0.5, css: '#e6508f' }
  ];

  const LV = [
    [0, 4, 5, '14:# 3:##.##,# 6:# 3:#...#,# 6:# 1:##o##,# 5:# 2:.....,# 6:# 3:.....,# 5:# 2:..#..,# 1:.#o#.,# 2:..#..,# 5:# 3:.....,#,#,# 6:# 1:o###o,# 4:# 4:.....,# 10:#'],
    [0, 4, 5, '12:# 6:.,# 6:# 1:##o##,# 4:# 8:.,# 6:# 10:.,.,#,# 7:# 10:.,#,#,. 7:# 1:#,##o##,#,# 9:.,#,.,# 6:# 3:.....,# 6:# 12:.,#,#,# 1:#,#,##o##,# 8:#'],
    [0, 4, 5, '12:# 5:ccccc,# 6:# 8:c,# 6:# 3:.....,# 1:##o##,# 4:# 6:##c##,# 6:# 2:.....,# 6:ccccc,# 6:# 10:.,c,#,c 6:# 1:c#o#c,# 3:.....,# 6:c,# 8:#'],
    [0, 4, 5, '10:# 3:.....,# 5:# 4:#...#,#...#,#,#...# 5:# 8:.,#,.,# 5:# 1:##o##,# 6:.#.#.,# 7:# 8:.,..###,#,###.. 7:# 3:.....,.....,#,..... 6:# 6:#.#.#,.#.#.,#.#.#,.#.#. 6:# 1:#,o####,#,# 8:.,#,#,# 8:#'],
    [0, 4, 5, '10:# 2:#.#.#,# 2:.#.#.,# 2:#.#.#,# 5:# 3:.....,# 1:##o##,# 4:# 3*[ 2:##...,# 2:...##,# ] 5:# 6:.,#.#.#,.,#.#.# 6:# 2:.....,.....,#,..... 1:.....,.....,##o##,..... 2:.....,.....,#,..... 6:# 4:.....,# 8:#'],
    [0, 4, 5, '10:# 8:..#..,. 7:# 8:.,..#..,.,. 7:# 8:.,.,..#..,. 7:# 1:..o..,# 6:.#.#.,. 5:# 10:#...#,. 6:# 4:.....,# 3:# 6:..#..,#...#,.,#...# 8:#'],
    [0, 4, 5, '10:# 10:c 2:. 8:c 5:# 6:.,c 3:. 6:c 5:# 1:##o##,# 8:c.c.c,c 3:. 7:# 8:.,c,c,c 2:. 1:c,c,o.c.c,c 6:c 4:. 8:#'],
    [0, 4, 5, '10:# 4:#.#.#,.#.#.,#.#.#,.#.#. 4:.#.#.,#.#.#,.#.#.,#.#.# 5:# 3:. 6:.,c 5:# 8:..c..,.,c...c,. 6:# 2:.....,# 1:.....,##o##,#,# 6:.,#.#.#,c,#.#.# 6:# 3:. 2:##o##,# 6:.c#c.,c 4:. 10:#'],
    [1, 4, 5, '12:# 8:d 3:.....,d 8:d 2:. 8:d 1:ddOdd,d 6:.,d 6:d 3:d.d.d,d 8:d 3:. 6:d 1:d,d,ddOdd,d 6:.,d,d,d 8:#'],
    [1, 4, 5, '10:# 6:d 8:.,d,.,d 6:d 6:.d.d.,d 6:d 8:.,.,d,. 6:d 4:.....,..ddd,d,ddd.. 1:.....,..dOd,d,dOd.. 6:d 3:. 6:d 8:#'],
    [1, 4, 5, '10:# 6:d 6:ddddd,c 3:. 6:d 8:.,d.d.d,.,d.d.d 6:d 6:c 3:. 6:d 1:.,O.d.d,.,d.d.O 8:.,d,c,d 6:d 4:. 6:d 8:#'],
    [2, 4, 5, '10:# 1:##b##,# 6:# 1:#b#b#,# 6:# 1:#bbb#,# 6:# 3:.....,# 1:##o##,# 5:# 1:.#b#.,# 6:# 1:#bbb#,#b#b#,#,#b#b# 6:# 1:#b#b#,# 1:#bob#,# 6:# 8:#'],
    [2, 4, 5, '10:# 3:. 1:.bbb.,# 3:. 6:# 1:#bbb#,# 4:# 2:.....,# 1:.bob.,# 2:.....,# 6:# 1:#b#b#,# 3:# 1:##b##,# 3:# 1:#b#b#,# 6:# 3:. 1:##b##,. 3:. 8:#'],
    [2, 4, 5, '10:# 1:#bbb#,#,#bbb#,# 6:# 6:.,#,.,# 1:.,#b#b#,.,#b#b# 6:.,#,.,# 6:# 2:.....,# 1:.bbb.,#bbb#,#,#bbb# 2:.....,# 6:# 3:. 1:.bob.,. 3:. 6:# 4:#c#c#,c 1:cbcbc,c 4:c 8:#'],
    [3, 5, 4, '12:# 10:^ 3:. 6:# 8:<<<<,# 6:# 8:>>>>,# 6:# 8:^ 6:. 6:# 1:#o##,# 8:#<>#,# 6:# 4:^ 1:.^^.,^ 5:. 8:#'],
    [3, 5, 4, '10:# 6:^ 4:. 6:# 8:<<<<,.,# 6:# 8:.,>>>>,# 6:# 6:^ 6:. 4:# 1:#o##,# 8:^.^.,. 6:# 6:<<<<,>>>> 1:.o..,# 4:^ 6:. 8:#'],
    [3, 5, 4, '10:# 6:^ 7:. 6:<<<< 4:# 8:.,^,. 6:# 6:>>>>,. 3:. 6:^^^^,^ 1:##o#,# 6:.^^.,. 6:. 6:# 6:c<<c,c 4:^ 7:. 8:#'],
    [4, 5, 4, '12:# 3:.##.,# 6:# 8:.,# 6:# 3:. 6:# 8:.,.,# 6:# 1:##o#,# 6:#..#,.#.# 6:# 8:.,#,.,#,# 6:# 3:. 1:#o##,# 6:# 8:#'],
    [4, 6, 4, '12:# 8:.,# 6:# 8:#.#.,.#.# 6:# 3:. 1:##o#,# 6:# 8:.,.,# 6:# 6:c 3:. 6:# 1:.,#o##,. 8:.,#,. 6:# 4:. 8:#', 160],
    [4, 7, 3, '12:# 8:.,# 6:# 6:#.#,.#. 6:# 3:. 6:# 1:#o#,# 8:.,.,# 6:# 6:c 3:. 6:# 8:.#.,. 6:# 1:.o.,# 4:. 8:#', 296],
    [4, 8, 3, '12:# 8:.,#,# 6:# 6:#.#,.#.,#.#,... 6:# 3:. 6:c 6:# 1:#o#,# 8:.,.,#,# 6:# 6:c,. 3:. 6:# 8:.#.,.,.#.,. 6:# 1:.o.,# 4:. 8:#', 326],
    [5, 4, 5, '12:# 2:# 1:u 6:. 6:# 1:##o##,# 6:# 1:.uuu.,# 7:. 6:# 6:.,# 4:# 1:..u..,u 7:. 6:# 4:^ 1:u 8:. 1:##o##,# 6:# 8:#'],
    [5, 6, 3, '12:# 1:u 6:. 6:# 8:.,# 6:# 1:.u.,u 7:. 6:# 6:c 1:u 6:. 6:# 1:.o.,# 4:^ 1:u 8:. 8:#', 300],
    [5, 8, 3, '12:# 1:u 6:. 6:# 8:.,#,# 6:# 6:#.#,.#. 6:# 4:^ 1:u 8:. 6:c 3:. 6:# 1:#o#,# 8:.,.,#,# 6:# 1:.u.,u 7:. 1:#o#,# 6:# 4:^,c 1:u 8:. 10:#', 352]
  ];

  function geom(n, w) {
    const a = w / (2 * Math.tan(Math.PI / n)), C = [], N = [], T = [];
    for (let s = 0; s < n; s++) {
      const th = -Math.PI / 2 + s * TAU / n, cx = Math.cos(th), cy = Math.sin(th);
      C.push([a * cx, a * cy]); N.push([-cx, -cy]); T.push([-cy, cx]);
    }
    return { n, w, a, C, N, T };
  }

  function parseSrc(n, w, src) {
    const rows = [], cells = [], toks = src.trim().split(/\s+/);
    let i = 0;
    const run = () => {
      while (i < toks.length) {
        const t = toks[i++];
        if (t === ']') return;
        const m = /^(\d+)\*\[$/.exec(t);
        if (m) { const st = i; for (let k = 0; k < +m[1]; k++) { i = st; run(); } continue; }
        const [len, pat] = t.split(':'), pats = pat.split(',');
        for (let r = 0; r < +len; r++) {
          const row = new Uint8Array(n * w);
          for (let s = 0; s < n; s++) {
            const p = pats[Math.min(s, pats.length - 1)];
            if (p.length !== 1 && p.length !== w) throw new Error('pattern width ' + t);
            for (let c = 0; c < w; c++) {
              const ch = p.length === 1 ? p : p[c];
              if (!(ch in CODE)) throw new Error('bad tile ' + ch);
              row[s * w + c] = CODE[ch];
              if (ch === 'o' || ch === '*' || ch === 'O') cells.push([rows.length, s, c]);
            }
          }
          rows.push(row);
        }
      }
    };
    run();
    const grid = new Uint8Array(rows.length * n * w);
    rows.forEach((r, k) => grid.set(r, k * n * w));
    return { grid, cells };
  }

  function makeLevel(n, w, grid, cellsRC, meta) {
    const g = geom(n, w), len = grid.length / (n * w), boxes = [];
    let nbox = 0;
    for (let i = 0; i < grid.length; i++) if (grid[i] === T_BOX) {
      const c = i % w, s = ((i - c) / w) % n, r = Math.floor(i / (n * w));
      (boxes[r] = boxes[r] || []).push(s, c); nbox++;
    }
    const cells = cellsRC.slice(0, 30).map(([r, s, c]) => {
      const x = c - w / 2 + 0.5, C = g.C[s], N = g.N[s], T = g.T[s];
      return [r, s, c, C[0] + T[0] * x + N[0] * 0.45, C[1] + T[1] * x + N[1] * 0.45];
    });
    return Object.assign({ n, w, g, len, grid, cells, boxes, nbox, sat: 0.6, lit: 0.47, hue: 222, seed: 1 }, meta);
  }

  const LEVELS = LV.map((d, i) => {
    const p = parseSrc(d[1], d[2], d[3]), t = TUNNELS[d[0]];
    return makeLevel(d[1], d[2], p.grid, p.cells, { idx: i, tunnel: d[0], hue: d[4] || t.hue, sat: t.sat, lit: t.lit, seed: i * 977 + 13 });
  });

  const P2 = [0, 0], P3 = [0, 0];
  function pos(g, s, x, h, out) {
    const C = g.C[s], N = g.N[s], T = g.T[s];
    out[0] = C[0] + T[0] * x + N[0] * h; out[1] = C[1] + T[1] * x + N[1] * h;
    return out;
  }
  function live(L, st, i) {
    const t = L.grid[i];
    if (t === T_CRUM) { const t0 = st.crum.get(i); if (t0 !== undefined && st.time - t0 >= CFG.CRUMBLE_FALL) return 0; }
    return t;
  }
  function typeAt(L, st, s, c, r) {
    if (c < 0 || c >= L.w || r < 0 || r >= L.len) return 0;
    return live(L, st, (r * L.n + s) * L.w + c);
  }
  let supT = 0;
  function support(L, st, lo, hi) {
    let best = -9; supT = 0;
    const half = L.w / 2, R = CFG.R;
    for (let k = 0; k < 4; k++) {
      const px = st.x + (k & 1 ? R : -R), pz = st.dist + (k & 2 ? R : -R);
      const r = Math.floor(pz), t = typeAt(L, st, st.s, Math.floor(px + half), r);
      if (!t) continue;
      const y = t === T_BOX ? 1 : t === T_RAMP ? CFG.RAMP_H * (pz - r) : 0;
      if (y >= lo && y <= hi && y > best) { best = y; supT = t; }
    }
    if (best > -9) {
      const ct = typeAt(L, st, st.s, Math.floor(st.x + half), Math.floor(st.dist));
      if (ct && ct !== T_BOX && ct !== T_RAMP && best === 0) supT = ct;
    }
    return best;
  }
  function boxHit(L, st) {
    if (st.h >= 0.97 || st.h < -0.3) return false;
    const half = L.w / 2, R = CFG.R;
    for (let k = 0; k < 4; k++) {
      if (typeAt(L, st, st.s, Math.floor(st.x + (k & 1 ? R : -R) + half), Math.floor(st.dist + (k & 2 ? R : -R))) === T_BOX) return true;
    }
    return false;
  }
  function crumbleUnder(L, st) {
    const half = L.w / 2, R = CFG.R;
    for (let k = 0; k < 4; k++) {
      const c = Math.floor(st.x + (k & 1 ? R : -R) + half), r = Math.floor(st.dist + (k & 2 ? R : -R));
      if (c < 0 || c >= L.w || r < 0 || r >= L.len) continue;
      const i = (r * L.n + st.s) * L.w + c;
      if (L.grid[i] === T_CRUM && !st.crum.has(i)) { st.crum.set(i, st.time); st.act.push(i); st.ev |= 8; }
    }
  }
  function crumbleTick(L, st) {
    const a = st.act;
    if (!a.length) return;
    const W = L.w, n = L.n, add = [];
    const nb = (r, s, c) => {
      if (r < 0 || r >= L.len) return;
      const j = (r * n + s) * W + c;
      if (L.grid[j] === T_CRUM && !st.crum.has(j)) { st.crum.set(j, st.time); add.push(j); }
    };
    let k2 = 0;
    for (let k = 0; k < a.length; k++) {
      const i = a[k];
      if (st.time - st.crum.get(i) < CFG.CRUMBLE_SPREAD) { a[k2++] = i; continue; }
      const c = i % W, s = ((i - c) / W) % n, r = Math.floor(i / (W * n));
      nb(r + 1, s, c); nb(r - 1, s, c);
      if (c > 0) nb(r, s, c - 1); else nb(r, (s + n - 1) % n, W - 1);
      if (c < W - 1) nb(r, s, c + 1); else nb(r, (s + 1) % n, 0);
    }
    a.length = k2;
    for (const j of add) a.push(j);
  }
  function switchSide(L, st) {
    const g = L.g, P = pos(g, st.s, st.x, st.h, P2);
    let best = -1, bd = 0;
    for (let j = 0; j < g.n; j++) {
      if (j === st.s) continue;
      const d = (P[0] - g.C[j][0]) * g.N[j][0] + (P[1] - g.C[j][1]) * g.N[j][1];
      if (d < bd) { bd = d; best = j; }
    }
    if (best < 0) return;
    const nx = (P[0] - g.C[best][0]) * g.T[best][0] + (P[1] - g.C[best][1]) * g.T[best][1];
    st.s = best; st.x = clamp(nx, -g.w / 2, g.w / 2); st.h = 0; st.vh = 0; st.jumped = false; st.ev |= 4;
    const y = support(L, st, -0.01, 0.01);
    st.ground = y > -9;
    if (st.ground) st.on = supT;
  }
  function otherBoxes(L, st) {
    const g = L.g, half = L.w / 2, Rb = 0.24;
    for (let r = Math.floor(st.dist - CFG.R); r <= Math.floor(st.dist + CFG.R); r++) {
      const list = L.boxes[r];
      if (!list) continue;
      for (let k = 0; k < list.length; k += 2) {
        const s = list[k], c = list[k + 1];
        if (s === st.s) continue;
        const P = pos(g, st.s, st.x, st.h + 0.35, P2), C = g.C[s], N = g.N[s], T = g.T[s];
        const qx = (P[0] - C[0]) * T[0] + (P[1] - C[1]) * T[1], qh = (P[0] - C[0]) * N[0] + (P[1] - C[1]) * N[1];
        const x0 = c - half - Rb, x1 = c + 1 - half + Rb, top = 1 + Rb;
        if (qx <= x0 || qx >= x1 || qh >= top || qh <= 0) continue;
        const pl = qx - x0, pr = x1 - qx, pt = top - qh;
        let dx, dy;
        if (pt <= pl && pt <= pr) { dx = N[0] * pt; dy = N[1] * pt; } else if (pl < pr) { dx = -T[0] * pl; dy = -T[1] * pl; } else { dx = T[0] * pr; dy = T[1] * pr; }
        const Tc = g.T[st.s], Nc = g.N[st.s];
        st.x += dx * Tc[0] + dy * Tc[1]; st.h += dx * Nc[0] + dy * Nc[1];
        const m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
        const vx2 = st.vx * Tc[0] + st.vh * Nc[0], vy2 = st.vx * Tc[1] + st.vh * Nc[1], dot = vx2 * ux + vy2 * uy;
        if (dot < 0) { const ax = vx2 - dot * ux, ay = vy2 - dot * uy; st.vx = ax * Tc[0] + ay * Tc[1]; st.vh = ax * Nc[0] + ay * Nc[1]; }
      }
    }
  }
  function newRun(L, spd) {
    spd = spd || 1;
    return { s: 0, x: 0, h: 0, vx: 0, vh: 0, vz: CFG.RUN * spd, dist: 0.3, spd, ground: true, jumped: false, buf: 0, coy: 0, on: T_TILE, lost: false, crum: new Map(), act: [], time: 0, got: 0, ev: 0 };
  }
  function cloneRun(st) { const o = Object.assign({}, st); o.crum = new Map(st.crum); o.act = st.act.slice(); return o; }
  function tryJump(st) {
    if (st.buf > 0 && (st.ground || st.coy > 0)) { st.vh = CFG.JUMP; st.ground = false; st.jumped = true; st.buf = 0; st.coy = 0; st.ev |= 1; return true; }
    return false;
  }
  function step(L, st, inp, dt) {
    st.ev = 0; st.time += dt;
    if (st.lost) { st.vh -= CFG.G * dt; st.h += st.vh * dt; st.dist += st.vz * dt; st.x += st.vx * dt; crumbleTick(L, st); return; }
    if (inp.press) st.buf = CFG.BUFFER;
    tryJump(st);
    st.buf -= dt; st.coy -= dt;
    if (st.jumped && !inp.jump && st.vh > CFG.JUMP_CUT) st.vh = CFG.JUMP_CUT;
    const gr = st.ground, lat = Math.sqrt(st.spd);
    const tvx = inp.lr * (gr ? CFG.STRAFE : CFG.STRAFE_AIR) * lat, ac = (gr ? CFG.ACC : CFG.ACC_AIR) * lat * dt;
    st.vx += clamp(tvx - st.vx, -ac, ac);
    const tvz = (gr ? CFG.RUN : CFG.RUN_AIR) * st.spd * (gr && st.on === T_FAST ? CFG.FAST : 1);
    st.vz += (tvz - st.vz) * Math.min(1, (gr ? CFG.FWD_ACC : CFG.FWD_ACC_AIR) * dt);
    const push = gr ? (st.on === T_LEFT ? -CFG.PUSH : st.on === T_RIGHT ? CFG.PUSH : 0) : 0;
    const ox = st.x;
    st.x += (st.vx + push) * dt;
    if (L.nbox && boxHit(L, st)) { st.x = ox; st.vx = 0; }
    const oz = st.dist;
    st.dist += st.vz * dt;
    if (L.nbox && boxHit(L, st)) { st.dist = oz; st.vz = 0; st.ev |= 64; }
    const oh = st.h;
    if (!st.ground) { st.vh -= CFG.G * dt; st.h += st.vh * dt; }
    if (st.h > -0.05) switchSide(L, st);
    if (L.nbox) otherBoxes(L, st);
    if (st.ground) {
      const y = support(L, st, st.h - 0.3, st.h + CFG.RAMP_H + 0.01);
      if (y > -9) { st.h = y; st.on = supT; } else {
        st.ground = false;
        if (st.on === T_RAMP) { st.vh = Math.min(CFG.RAMP_MAX, CFG.RAMP_V * st.vz); st.jumped = false; st.ev |= 32; } else { st.coy = CFG.COYOTE; st.vh = 0; }
      }
    } else if (st.vh <= 0) {
      const y = support(L, st, -1, oh + (oh > -0.1 ? CFG.CATCH : 0));
      if (y > -9 && st.h <= y) { st.h = y; st.vh = 0; st.ground = true; st.jumped = false; st.on = supT; st.ev |= 2; }
    }
    if (st.ground) crumbleUnder(L, st);
    crumbleTick(L, st);
    if (!st.ground && st.h < CFG.LOST_H) st.lost = true;
    if (L.cells.length) {
      const P = pos(L.g, st.s, st.x, st.h + 0.4, P3);
      for (let k = 0; k < L.cells.length; k++) {
        if (st.got & (1 << k)) continue;
        const cl = L.cells[k];
        if (Math.abs(cl[0] + 0.5 - st.dist) > 0.6) continue;
        const dx = cl[3] - P[0], dy = cl[4] - P[1];
        if (dx * dx + dy * dy < 0.36) { st.got |= 1 << k; st.ev |= 16; }
      }
    }
  }

  const SHAPES = [[4, 5], [4, 4], [5, 4], [6, 3], [6, 4], [7, 3], [8, 3]];
  const INF_HUES = [222, 268, 176, 24, 134, 330, 200, 48];
  function genInf(seed, d, first) {
    const R = rng(seed * 7919 + 17);
    for (let i = 0; i < 4; i++) R();
    const sh = first || d < 0.1 ? [4, 5] : SHAPES[Math.floor(R() * SHAPES.length)];
    const n = sh[0], w = sh[1], NW = n * w, rows = [], cells = [];
    const spdEst = 1 + 0.75 * d, keep = Math.ceil(3 * spdEst) + 1;
    let ps = 0, pc = (w - 1) >> 1, lastMv = 0, os = -1, oc = 0, oUntil = 0;
    const row = t => new Uint8Array(NW).fill(t);
    const path = (a, t) => {
      const k = rows.length;
      a[ps * w + pc] = t;
      if (k < oUntil) a[os * w + oc] = t;
      if (k - lastMv > keep + 1 && R() < 0.3) {
        lastMv = k; os = ps; oc = pc; oUntil = k + keep;
        pc += R() < 0.5 ? -1 : 1;
        if (pc < 0) { ps = (ps + n - 1) % n; pc = w - 1; } else if (pc >= w) { ps = (ps + 1) % n; pc = 0; }
        a[ps * w + pc] = t;
      }
      if (R() < 0.07 && cells.length < 12) cells.push([k, ps, pc]);
      rows.push(a);
    };
    const full = k => { for (let i = 0; i < k; i++) path(row(1), 1); };
    const holes = () => {
      const K = 8 + Math.floor(R() * 8), p = 0.15 + 0.35 * d;
      const base = d > 0.3 && R() < 0.3 ? T_CRUM : d > 0.35 && R() < 0.3 ? T_DARK : T_TILE;
      for (let r = 0; r < K; r++) { const a = row(0); for (let i = 0; i < NW; i++) a[i] = R() < p ? 0 : base; path(a, base); }
    };
    const gap = () => {
      full(3);
      const gl = Math.min(d > 1.1 ? 5 : 4, 2 + Math.floor(R() * (1 + 2.5 * d)));
      for (let r = 0; r < gl; r++) { if (r === gl >> 1 && R() < 0.5 && cells.length < 12) cells.push([rows.length, ps, pc]); rows.push(row(0)); }
      full(3);
    };
    const swap = () => {
      full(7 + Math.ceil(3 * d));
      const old = ps;
      ps = (ps + (R() < 0.5 ? 1 : n - 1)) % n; pc = (w - 1) >> 1; oUntil = 0; lastMv = rows.length;
      const K = 8 + Math.floor(R() * 6), p = 0.1 + 0.2 * d;
      for (let r = 0; r < K; r++) { const a = row(0); for (let i = 0; i < NW; i++) a[i] = R() < p ? 0 : 1; for (let c = 0; c < w; c++) a[old * w + c] = 0; path(a, 1); }
      full(2);
    };
    const crumble = () => {
      const K = 6 + Math.floor(R() * 6);
      for (let r = 0; r < K; r++) { const a = row(T_CRUM); for (let i = 0; i < NW; i++) if (R() < 0.1 * d) a[i] = 0; path(a, T_CRUM); }
      full(2);
    };
    const checker = () => {
      const K = 6 + 2 * Math.floor(R() * 3), r0 = rows.length;
      for (let r = 0; r < K; r++) { const a = row(0); for (let s = 0; s < n; s++) for (let c = 0; c < w; c++) a[s * w + c] = (((r0 + r) >> 1) + c + s) % 2 ? 0 : 1; path(a, 1); }
    };
    const conveyor = () => {
      const K = 8 + Math.floor(R() * 8), t = R() < 0.5 ? T_FAST : R() < 0.5 ? T_LEFT : T_RIGHT;
      for (let r = 0; r < K; r++) { const a = row(t); for (let i = 0; i < NW; i++) if (R() < 0.1) a[i] = 0; path(a, t); }
      full(2);
    };
    const ramp = () => {
      full(3);
      rows.push(row(T_RAMP));
      const gl = 5 + Math.floor(R() * 2);
      for (let r = 0; r < gl; r++) rows.push(row(0));
      full(3);
    };
    const strips = () => {
      const K = 8 + Math.floor(R() * 8);
      for (let r = 0; r < K; r++) { const a = row(0); for (let s = 0; s < n; s++) for (let c = 0; c < w; c++) a[s * w + c] = (c + s) % 2 ? 0 : 1; path(a, 1); }
    };
    full(6);
    const target = 60 + Math.floor(R() * 26);
    while (rows.length < target) {
      const k = R();
      if (k < 0.2) holes(); else if (k < 0.34) gap(); else if (k < 0.46) swap(); else if (k < 0.56) crumble();
      else if (k < 0.66) checker(); else if (k < 0.77 && d > 0.12) conveyor(); else if (k < 0.86 && d > 0.18) ramp(); else strips();
    }
    full(4);
    const grid = new Uint8Array(rows.length * NW);
    rows.forEach((r, k) => grid.set(r, k * NW));
    return makeLevel(n, w, grid, cells, { hue: INF_HUES[Math.floor(R() * INF_HUES.length)], sat: 0.6, lit: 0.47, seed: seed * 31 + 7, inf: true });
  }

  const ATTRACT = makeLevel(4, 5, new Uint8Array(420 * 20).fill(1), [], { hue: 222, sat: 0.62, lit: 0.47, seed: 3, tunnel: 0 });
  const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const SVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const P = '.gm-tunnel-run ';
  const CSS = `${P}.stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#000;box-shadow:0 22px 44px -30px rgba(31,29,43,.75)}
${P}.stage .g-canvas{border-radius:0;background:#000}
${P}.hud{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff;font-size:clamp(11px,1.9cqw,18px);line-height:1.15}
${P}.bar{position:absolute;left:0;right:0;top:0;height:.22em;background:rgba(255,255,255,.1);display:none}
${P}.bar i{display:block;height:100%;background:rgba(255,255,255,.75);transform-origin:0 0;transform:scaleX(0)}
${P}.top{position:absolute;left:0;right:0;top:0;display:none;justify-content:space-between;align-items:flex-start;padding:1.1em 1.2em}
${P}.hud[data-st=play] .top,${P}.hud[data-st=pause] .top{display:flex}
${P}.hud[data-m=explore][data-st=play] .bar{display:block}
${P}.tl b{display:block;font-size:1.6em;font-weight:900;letter-spacing:.01em;text-shadow:0 .08em .5em rgba(0,0,0,.8)}
${P}.tl span{display:block;margin-top:.2em;font-size:.78em;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.6)}
${P}.tr{display:flex;align-items:center;gap:.9em}
${P}.pc{display:flex;align-items:center;gap:.5em;font-weight:900;font-size:1.2em;text-shadow:0 .08em .5em rgba(0,0,0,.8)}
${P}.cell{display:block;width:.6em;height:1em;border-radius:.18em;background:linear-gradient(90deg,#e09000,#fff3a0 45%,#ffcf2e 70%,#d98a00);box-shadow:0 0 .7em rgba(255,205,60,.9)}
${P}.pz{pointer-events:auto;width:2.7em;height:2.7em;min-width:40px;min-height:40px;padding:0;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;gap:.25em;cursor:pointer}
${P}.pz i{display:block;width:.26em;height:.95em;border-radius:.08em;background:#fff}
${P}.ctl{position:absolute;left:50%;bottom:17%;transform:translate(-50%,10px);display:flex;flex-wrap:wrap;justify-content:center;gap:.5em 1.3em;max-width:92%;padding:.75em 1.3em;border-radius:1.2em;background:rgba(6,10,26,.86);border:1px solid rgba(255,255,255,.24);font-weight:800;font-size:.95em;opacity:0;transition:opacity .35s,transform .35s;pointer-events:none;text-align:center}
${P}.ctl.show{opacity:1;transform:translate(-50%,0)}
${P}.ctl kbd{display:inline-block;min-width:1.7em;margin:0 .12em;padding:.08em .5em;border-radius:.35em;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);font:900 1em/1.3 var(--sans);color:#fff}
${P}.ctl b{color:#ffd23f}
${P}.touchy .ctl{bottom:34%}
${P}.big{position:absolute;left:0;right:0;top:21%;text-align:center;opacity:0;transition:opacity .35s}
${P}.big.show{opacity:1}
${P}.big b{display:block;font-size:3.2em;font-weight:900;letter-spacing:.01em;text-shadow:0 0 .45em rgba(110,160,255,.7),0 .06em .2em rgba(0,0,0,.6)}
${P}.big span{display:block;margin-top:.35em;font-size:.95em;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.72)}
${P}.touch{position:absolute;left:0;right:0;bottom:0;height:30%;display:none}
${P}.hud[data-st=play] .touch.on{display:block}
${P}.tz{position:absolute;bottom:1.4em;width:4.4em;height:4.4em;min-width:54px;min-height:54px;border-radius:50%;border:2px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center}
${P}.tz.l{left:1.4em}${P}.tz.r{right:1.4em}
${P}.tz svg,${P}.jb svg{width:42%;height:42%}
${P}.jb{pointer-events:auto;position:absolute;bottom:1.2em;left:50%;transform:translateX(-50%);width:5.4em;height:5.4em;min-width:68px;min-height:68px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:.9em;letter-spacing:.1em}
${P}.jb svg{height:34%}
${P}.fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .3s}
${P}.fade.on{opacity:1}
${P}.scr{position:absolute;inset:0;display:none}
${P}.scr.on{display:block;pointer-events:auto}
${P}.dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,.25),rgba(0,0,0,.75))}
${P}.pan{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75em;padding:1.5em;text-align:center}
${P}.logo{font-size:4.6em;font-weight:900;line-height:.92;letter-spacing:.03em;margin-bottom:.1em;background:linear-gradient(#fff 35%,#9fb9ff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 .22em rgba(80,130,255,.8))}
${P}.sub{font-weight:900;font-size:.85em;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.62);margin-bottom:.8em}
${P}.h1{font-size:2.8em;font-weight:900;line-height:1;text-shadow:0 0 .4em rgba(110,160,255,.6)}
${P}.kick{display:inline-block;padding:.35em .9em;border-radius:99px;background:#ffd23f;color:#1b1500;font-weight:900;font-size:.85em;letter-spacing:.12em;text-transform:uppercase}
${P}.mb{pointer-events:auto;font:900 1.15em/1 var(--sans);color:#fff;background:rgba(8,12,28,.6);border:2px solid rgba(255,255,255,.62);border-radius:.55em;min-width:11.5em;min-height:44px;padding:.72em 1.3em;cursor:pointer;letter-spacing:.03em}
${P}.mb.sel,${P}.mb:hover{background:#fff;color:#0c1230;border-color:#fff}
${P}.mb.sm{min-width:0;font-size:1em;padding:.65em 1.2em}
${P}.stat{font-weight:800;font-size:.95em;color:rgba(255,255,255,.8);margin-top:.4em}
${P}.hint{font-weight:700;font-size:.82em;color:rgba(255,255,255,.5)}
${P}.mhead{position:absolute;left:0;right:0;top:0;padding:1em 1.3em;display:flex;align-items:baseline;gap:.4em 1em;flex-wrap:wrap}
${P}.mhead b{font-size:1.9em;font-weight:900}
${P}.mhead span{font-weight:800;color:rgba(255,255,255,.7)}
${P}.map{position:absolute;inset:0}
${P}.map svg{position:absolute;inset:0;width:100%;height:100%}
${P}.nd{position:absolute;transform:translate(-50%,-50%);width:2.75em;height:2.75em;min-width:38px;min-height:38px;padding:0;border-radius:50%;border:.2em solid var(--c);background:#070a18;color:#fff;font:900 1em/1 var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center}
${P}.nd.d{background:var(--c)}
${P}.nd.lk{opacity:.5;cursor:default;border-style:dashed}
${P}.nd.s{box-shadow:0 0 0 .22em #fff,0 0 1.4em .2em var(--c)}
${P}.tlab{position:absolute;transform:translate(-50%,-100%);white-space:nowrap;font-weight:900;font-size:.82em;letter-spacing:.12em;text-transform:uppercase;color:#fff;padding:.3em .8em;border-radius:99px;background:rgba(4,7,20,.94);border:2px solid var(--c);pointer-events:none}
${P}.map-dim{background:radial-gradient(ellipse at 50% 45%,rgba(4,6,18,.9),rgba(2,3,10,.96))}
${P}.info{position:absolute;left:50%;bottom:1.1em;transform:translateX(-50%);display:flex;align-items:center;gap:.7em;padding:.7em .8em .7em 1.2em;border-radius:1em;background:rgba(8,12,28,.8);border:1px solid rgba(255,255,255,.18);width:max-content;max-width:94%;flex-wrap:wrap;justify-content:center}
${P}.info div{text-align:left;margin-right:.4em}
${P}.info b{display:block;font-size:1.3em;font-weight:900}
${P}.info span{font-weight:800;font-size:.85em;color:rgba(255,255,255,.72)}
${P}.ghost{background:transparent}`;

  const GAME = {
    id: 'tunnel-run',
    title: 'Tunnel Run',
    category: '3D',
    tint: '#3d6fe6',
    better: 'high',
    width: 960,
    format: v => v + ' m',
    blurb: 'Run through tiled space tunnels, walk on walls and never fall out.',
    help: '<kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> move · <kbd>Space</kbd> / <kbd>↑</kbd> jump (hold for higher) · <kbd>P</kbd> pause · touch: hold left / right side, swipe up or tap Jump',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h52v52H6zM23 23h18v18H23zM6 6l17 17M58 6L41 23M6 58l17-17M58 58L41 41"/><path d="M15 46l8-5M49 46l-8-5M32 58v-17"/></svg>',
    css: CSS,
    __sim: { CFG, LEVELS, TUNNELS, newRun, cloneRun, step, genInf },
    async mount(root, api) {
      const narrow = root.clientWidth > 0 && root.clientWidth < 560;
      const VW = narrow ? 600 : 960, VH = narrow ? 860 : 600;
      const v = await api.gl(VW, VH);
      if (!v) return;
      const { THREE, renderer } = v;
      renderer.shadowMap.enabled = false;
      renderer.setClearColor(0x000000, 1);
      const keys = api.keys;

      const wrap = document.createElement('div');
      wrap.className = 'stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(wrap);
      wrap.append(v.canvas);
      if (COARSE) {
        const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / VW); };
        fit(); api.on(window, 'resize', fit);
      }
      const hud = document.createElement('div');
      hud.className = 'hud';
      hud.innerHTML = `<div class="bar"><i></i></div><div class="top"><div class="tl"><b class="lv"></b><span class="tn"></span></div><div class="tr"><span class="pc"><i class="cell"></i><b class="cc">0</b></span><button class="pz" aria-label="Pause"><i></i><i></i></button></div></div><div class="big"><b></b><span></span></div><div class="ctl"></div><div class="touch"><div class="tz l">${SVG('M15 5l-7 7 7 7')}</div><div class="jb">${SVG('M5 15l7-7 7 7')}<span>JUMP</span></div><div class="tz r">${SVG('M9 5l7 7-7 7')}</div></div><div class="fade"></div><div class="scr"></div>`;
      wrap.append(hud);
      const q = s => hud.querySelector(s);
      const scr = q('.scr'), barEl = q('.bar i'), fadeEl = q('.fade'), touchEl = q('.touch');


      const disp = [];
      const D = o => { disp.push(o); return o; };
      const lin = c => new THREE.Color(c).convertSRGBToLinear();
      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      function ctex(S, draw, rep) {
        const c = document.createElement('canvas');
        c.width = c.height = S * 2;
        const g = c.getContext('2d');
        g.scale(2, 2);
        draw(g, S);
        const t = D(new THREE.CanvasTexture(c));
        t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
        if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
        return t;
      }
      const rivet = (g, x, y, r) => {
        g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.arc(x + r * 0.2, y + r * 0.3, r * 1.1, 0, TAU); g.fill();
        const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
        gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(110,116,130,.9)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      };
      const bevel = (g, S, a, b, rim) => {
        g.fillStyle = rim; g.fillRect(0, 0, S, S);
        const m = S * 0.05, gr = g.createLinearGradient(0, 0, S, S);
        gr.addColorStop(0, a); gr.addColorStop(1, b);
        g.fillStyle = gr; g.fillRect(m, m, S - 2 * m, S - 2 * m);
        const e = S * 0.022, p = S * 0.17;
        g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(m, m, S - 2 * m, e); g.fillRect(m, m, e, S - 2 * m);
        g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(m, S - m - e, S - 2 * m, e); g.fillRect(S - m - e, m, e, S - 2 * m);
        g.fillStyle = 'rgba(0,0,0,.09)'; g.fillRect(p, p, S - 2 * p, S - 2 * p);
        g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(p, p, S - 2 * p, S * 0.016); g.fillRect(p, p, S * 0.016, S - 2 * p);
        g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(p, S - p - S * 0.016, S - 2 * p, S * 0.016); g.fillRect(S - p - S * 0.016, p, S * 0.016, S - 2 * p);
        const q = S * 0.11;
        for (const [x, y] of [[q, q], [S - q, q], [q, S - q], [S - q, S - q]]) rivet(g, x, y, S * 0.028);
        const R = rng(S * 7 + 3);
        for (let i = 0; i < 70; i++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.08)'; g.fillRect(m + R() * (S - 2 * m), m + R() * (S - 2 * m), 1, 1); }
      };
      const texTile = ctex(64, (g, S) => {
        bevel(g, S, '#ffffff', '#c9ced8', '#6d7380');
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2; g.strokeRect(S * 0.27, S * 0.27, S * 0.46, S * 0.46);
        g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1; g.strokeRect(S * 0.285, S * 0.285, S * 0.43, S * 0.43);
      });
      const texCrum = ctex(64, (g, S) => {
        bevel(g, S, '#ece8e2', '#b3ada3', '#5f5a53');
        const R = rng(5);
        for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + R() * 0.16})`; g.fillRect(4 + R() * (S - 8), 4 + R() * (S - 8), 1 + R() * 2, 1 + R() * 2); }
        g.lineJoin = 'round'; g.lineCap = 'round';
        const crack = () => { g.beginPath(); g.moveTo(6, 19); g.lineTo(23, 29); g.lineTo(30, 46); g.lineTo(45, 55); g.moveTo(23, 29); g.lineTo(45, 21); g.lineTo(57, 8); g.moveTo(30, 46); g.lineTo(13, 58); g.moveTo(45, 21); g.lineTo(50, 38); g.stroke(); };
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3.4; g.save(); g.translate(0.8, 1); crack(); g.restore();
        g.strokeStyle = 'rgba(30,26,22,.85)'; g.lineWidth = 2; crack();
        g.fillStyle = 'rgba(30,26,22,.35)'; g.beginPath(); g.moveTo(23, 29); g.lineTo(30, 33); g.lineTo(27, 40); g.lineTo(20, 34); g.fill();
      });
      const texConv = (dir, col) => ctex(64, (g, S) => {
        g.fillStyle = '#12151d'; g.fillRect(0, 0, S, S);
        g.translate(S / 2, S / 2); g.rotate(dir * Math.PI / 2); g.translate(-S / 2, -S / 2);
        for (let y = -S; y < 2 * S; y += 8) {
          const gr = g.createLinearGradient(0, y, 0, y + 8);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.35, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.35)');
          g.fillStyle = gr; g.fillRect(6, y, S - 12, 8);
          g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(6, y + 7, S - 12, 1);
        }
        for (const x of [0, S - 6]) {
          const gr = g.createLinearGradient(x, 0, x + 6, 0);
          gr.addColorStop(0, '#8a92a6'); gr.addColorStop(0.45, '#5a6173'); gr.addColorStop(1, '#2f3441');
          g.fillStyle = gr; g.fillRect(x, -S, 6, 3 * S);
          g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + (x ? 5 : 0), -S, 1, 3 * S);
        }
        for (let y = -S; y < 2 * S; y += 16) { rivet(g, 3, y + 8, 1.5); rivet(g, S - 3, y + 8, 1.5); }
        g.globalAlpha = 0.55; g.fillStyle = col; g.fillRect(6.5, -S, 1.2, 3 * S); g.fillRect(S - 7.7, -S, 1.2, 3 * S); g.globalAlpha = 1;
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (const y of [-S * 0.2, S * 0.3, S * 0.8, S * 1.3]) {
          for (const [w, a, c] of [[11, 0.22, col], [7, 0.95, col], [2.4, 0.9, '#ffffff']]) {
            g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = w;
            g.beginPath(); g.moveTo(S * 0.24, y + 9); g.lineTo(S * 0.5, y - 8); g.lineTo(S * 0.76, y + 9); g.stroke();
          }
          g.globalAlpha = 1;
        }
      }, true);
      const texStyles = [
        g => g,
        (g, S) => { g.strokeStyle = 'rgba(40,50,90,.38)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(S / 2, S * .2); g.lineTo(S * .8, S / 2); g.lineTo(S / 2, S * .8); g.lineTo(S * .2, S / 2); g.closePath(); g.stroke(); },
        (g, S) => { g.strokeStyle = 'rgba(40,50,90,.34)'; g.lineWidth = 2.2; for (const y of [.3, .5, .7]) { g.beginPath(); g.moveTo(S * .16, S * y); g.lineTo(S * .84, S * y); g.stroke(); } },
        (g, S) => { g.fillStyle = 'rgba(40,50,90,.36)'; for (const x of [.3, .5, .7]) for (const y of [.3, .5, .7]) { g.beginPath(); g.arc(S * x, S * y, 2.6, 0, TAU); g.fill(); } },
        (g, S) => { g.strokeStyle = 'rgba(40,50,90,.4)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(S * .2, S * .75); g.lineTo(S * .2, S * .35); g.lineTo(S * .55, S * .35); g.lineTo(S * .55, S * .6); g.lineTo(S * .8, S * .6); g.stroke(); g.fillStyle = 'rgba(40,50,90,.5)'; g.beginPath(); g.arc(S * .8, S * .6, 3.2, 0, TAU); g.fill(); g.beginPath(); g.arc(S * .2, S * .75, 3.2, 0, TAU); g.fill(); },
        (g, S) => { g.strokeStyle = 'rgba(40,50,90,.38)'; g.lineWidth = 2.4; g.lineJoin = 'round'; for (const y of [.42, .68]) { g.beginPath(); g.moveTo(S * .22, S * y + 7); g.lineTo(S * .5, S * y - 7); g.lineTo(S * .78, S * y + 7); g.stroke(); } }
      ];
      const texTiles = texStyles.map((fn, i) => i === 0 ? texTile : ctex(64, (g, S) => { bevel(g, S, '#ffffff', '#c9ced8', '#6d7380'); fn(g, S); }));
      const texFast = texConv(0, '#ffd23f'), texLeft = texConv(-1, '#5ee7ff'), texRight = texConv(1, '#5ee7ff');
      const texRamp = ctex(64, (g, S) => {
        bevel(g, S, '#ffffff', '#dfe3ea', '#6d7380');
        g.save(); g.beginPath(); g.rect(S * 0.05, S * 0.05, S * 0.9, S * 0.9); g.clip();
        for (const x0 of [S * 0.05, S * 0.95 - S * 0.1]) {
          g.fillStyle = '#2b2f3a'; g.fillRect(x0, 0, S * 0.1, S);
          g.fillStyle = '#ffb21f';
          for (let y = -S; y < S * 2; y += 10) { g.beginPath(); g.moveTo(x0, y + 10); g.lineTo(x0 + S * 0.1, y); g.lineTo(x0 + S * 0.1, y + 5); g.lineTo(x0, y + 15); g.fill(); }
        }
        g.restore();
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (const y of [S * 0.34, S * 0.72]) {
          for (const [w, a, c] of [[11, 0.25, '#ff9f1c'], [7, 1, '#ff9f1c'], [2.4, 0.85, '#fff0c8']]) {
            g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = w;
            g.beginPath(); g.moveTo(S * 0.22, y + 10); g.lineTo(S * 0.5, y - 8); g.lineTo(S * 0.78, y + 10); g.stroke();
          }
          g.globalAlpha = 1;
        }
      });
      const texCrate = ctex(64, (g, S) => {
        bevel(g, S, '#f4f6fa', '#c3c9d6', '#585e6c');
        const f = S * 0.14;
        g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(f, f, S - 2 * f, S - 2 * f);
        g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(f + 1.5, f + 1.5, S - 2 * f - 3, S - 2 * f - 3);
        g.lineCap = 'round';
        for (const [w, c] of [[5, 'rgba(0,0,0,.28)'], [3, 'rgba(70,76,92,.8)'], [1, 'rgba(255,255,255,.5)']]) {
          g.strokeStyle = c; g.lineWidth = w;
          g.beginPath(); g.moveTo(f + 2, f + 2); g.lineTo(S - f - 2, S - f - 2); g.moveTo(S - f - 2, f + 2); g.lineTo(f + 2, S - f - 2); g.stroke();
        }
        g.fillStyle = '#ff9f1c';
        for (const [x, y, sx, sy] of [[0.05, 0.05, 1, 1], [0.95, 0.05, -1, 1], [0.05, 0.95, 1, -1], [0.95, 0.95, -1, -1]]) {
          g.beginPath(); g.moveTo(S * x, S * y); g.lineTo(S * x + sx * S * 0.2, S * y); g.lineTo(S * x, S * y + sy * S * 0.2); g.fill();
        }
        rivet(g, S / 2, S / 2, S * 0.05);
        for (const [x, y] of [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) rivet(g, S * x, S * y, S * 0.025);
      });
      const radial = (stops) => ctex(64, (g, S) => {
        const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
        stops.forEach(([o, c]) => gr.addColorStop(o, c));
        g.fillStyle = gr; g.fillRect(0, 0, S, S);
      });
      const texGlow = radial([[0, 'rgba(255,240,170,1)'], [0.25, 'rgba(255,205,60,.75)'], [1, 'rgba(255,170,0,0)']]);
      const texShadow = radial([[0, 'rgba(0,0,0,.85)'], [0.55, 'rgba(0,0,0,.45)'], [1, 'rgba(0,0,0,0)']]);
      const texNeb = radial([[0, 'rgba(255,255,255,.55)'], [0.4, 'rgba(255,255,255,.18)'], [1, 'rgba(255,255,255,0)']]);
      const texPlanet = ctex(128, (g, S) => {
        const gr = g.createRadialGradient(S * 0.38, S * 0.36, S * 0.05, S / 2, S / 2, S * 0.42);
        gr.addColorStop(0, '#ffd2a8'); gr.addColorStop(0.55, '#c9607a'); gr.addColorStop(1, '#3a1840');
        g.fillStyle = gr; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(255,220,200,.55)'; g.lineWidth = 4;
        g.beginPath(); g.ellipse(S / 2, S / 2, S * 0.49, S * 0.1, -0.35, 0, TAU); g.stroke();
      });

      const geoTile = D(new THREE.BoxGeometry(0.94, 0.08, 0.94).translate(0, -0.04, 0));
      const geoBox = D((() => {
        const sh = [0.74, 0.74, 1, 0.5, 0.9, 0.62], mainG = new THREE.BoxGeometry(0.9, 0.86, 0.9).translate(0, 0.43, 0), lid = new THREE.BoxGeometry(0.82, 0.04, 0.82).translate(0, 0.88, 0);
        const parts = [mainG, lid], P = [], N = [], U = [], C = [], I = [];
        let o = 0;
        for (const gq of parts) {
          const p = gq.attributes.position, n = gq.attributes.normal, u = gq.attributes.uv, ix = gq.index;
          for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); U.push(u.getX(i), u.getY(i)); const k = sh[(i / 4) | 0] * (gq === lid ? 1.08 : 1); C.push(k, k, k); }
          for (let i = 0; i < ix.count; i++) I.push(ix.getX(i) + o);
          o += p.count;
          gq.dispose();
        }
        const gb = new THREE.BufferGeometry();
        gb.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
        gb.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        gb.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
        gb.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
        gb.setIndex(I);
        return gb;
      })());
      const geoRamp = D((() => {
        const a = 0.47, b = 0.47, H = CFG.RAMP_H, p = [], uv = [], col = [];
        const tri = (A, B, C, s, top) => {
          for (const V of [A, B, C]) { p.push(V[0], V[1], V[2]); uv.push(top ? V[0] / (2 * a) + 0.5 : 0.5, top ? 0.5 - V[2] / (2 * b) : 0.5); col.push(top ? s : s * 1.0, top ? s : s * 0.82, top ? s : s * 0.55); }
        };
        const A = [-a, 0, b], B = [a, 0, b], C = [a, H, -b], E = [-a, H, -b], F = [-a, 0, -b], G = [a, 0, -b];
        tri(A, B, C, 1, 1); tri(A, C, E, 1, 1);
        tri(F, E, C, 0.55); tri(F, C, G, 0.55);
        tri(A, E, F, 0.72); tri(B, G, C, 0.72);
        const gg = new THREE.BufferGeometry();
        gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
        gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        return gg;
      })());
      const gSph = D(new THREE.SphereGeometry(1, 22, 15)), gCyl = D(new THREE.CylinderGeometry(1, 1, 1, 16)), gBox = D(new THREE.BoxGeometry(1, 1, 1)), gCone = D(new THREE.CylinderGeometry(1, 0, 1, 12, 1, true).translate(0, -0.5, 0)), gTor = D(new THREE.TorusGeometry(1, 0.12, 8, 28));
      const OB = new THREE.Object3D();
      const pr = (g, col, x, y, z, sx, sy, sz, rx, ry, rz, k) => {
        OB.position.set(x, y, z); OB.rotation.set(rx || 0, ry || 0, rz || 0); OB.scale.set(sx, sy, sz); OB.updateMatrix();
        return { g, c: typeof col === 'string' ? lin(col) : col, m: OB.matrix.clone(), k: k == null ? 1 : k };
      };
      const bake = (items, amp) => {
        const P = [], N = [], C = [], I = [];
        let o = 0;
        for (const it of items) {
          const gq = it.g.clone();
          gq.applyMatrix4(it.m);
          const p = gq.attributes.position, n = gq.attributes.normal, ix = gq.index;
          for (let i = 0; i < p.count; i++) {
            const k = it.k * (1 - amp + amp * (n.getY(i) * 0.5 + 0.5));
            P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(it.c.r * k, it.c.g * k, it.c.b * k);
          }
          for (let i = 0; i < ix.count; i++) I.push(ix.getX(i) + o);
          o += p.count;
          gq.dispose();
        }
        const r = new THREE.BufferGeometry();
        r.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
        r.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        r.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
        r.setIndex(I);
        return D(r);
      };
      const geoBat = bake([
        pr(gCyl, '#ffbd1c', 0, 0, 0, 0.078, 0.2, 0.078, 0, 0, 0),
        pr(gCyl, '#fff0a0', 0, 0, 0, 0.083, 0.07, 0.083, 0, 0, 0, 1.15),
        pr(gCyl, '#b87400', 0, 0.062, 0, 0.083, 0.012, 0.083),
        pr(gCyl, '#b87400', 0, -0.062, 0, 0.083, 0.012, 0.083),
        pr(gCyl, '#a9b2c4', 0, 0.112, 0, 0.066, 0.034, 0.066),
        pr(gCyl, '#7c8598', 0, 0.134, 0, 0.05, 0.012, 0.05),
        pr(gCyl, '#a9b2c4', 0, -0.112, 0, 0.066, 0.034, 0.066, 0, 0, 0, 0.8),
        pr(gCyl, '#7c8598', 0, -0.134, 0, 0.05, 0.012, 0.05, 0, 0, 0, 0.7),
        pr(gCyl, '#fff8d8', 0, 0.158, 0, 0.026, 0.04, 0.026),
        pr(gSph, '#ffffff', 0, 0.18, 0, 0.026, 0.026, 0.026),
        pr(gTor, '#ffe27a', 0, 0, 0, 0.115, 0.115, 0.115, Math.PI / 2, 0, 0, 1.1),
        pr(gTor, '#ffd34a', 0, 0, 0, 0.13, 0.13, 0.13, Math.PI / 2 + 0.5, 0.2, 0, 0.95)
      ], 0.34);
      const bm = o => D(new THREE.MeshBasicMaterial(Object.assign({ toneMapped: false }, o)));
      const mTile = bm({ map: texTile }), mCrum = bm({ map: texCrum }), mFast = bm({ map: texFast }), mLeft = bm({ map: texLeft }), mRight = bm({ map: texRight });
      const mBox = bm({ map: texCrate, vertexColors: true }), mRamp = bm({ map: texRamp, vertexColors: true, side: THREE.DoubleSide });
      const mBat = bm({ vertexColors: true });
      const mGlow = D(new THREE.SpriteMaterial({ map: texGlow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false }));
      const mTiles = texTiles.map((t, i) => i === 0 ? mTile : bm({ map: t }));
      const GM = [];
      GM[T_TILE] = GM[T_DARK] = [geoTile, mTile]; GM[T_CRUM] = [geoTile, mCrum]; GM[T_FAST] = [geoTile, mFast];
      GM[T_LEFT] = [geoTile, mLeft]; GM[T_RIGHT] = [geoTile, mRight]; GM[T_BOX] = [geoBox, mBox]; GM[T_RAMP] = [geoRamp, mRamp];

      const scene = new THREE.Scene();
      const bgCol = new THREE.Color(0x000000), bgTarget = new THREE.Color(0x000000);
      scene.background = bgCol;
      scene.fog = new THREE.Fog(0x000000, CFG.FOG_NEAR, CFG.FOG_FAR);
      const nebMats = [], nebTarget = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
      function worldFor(L, snap) {
        const h = L.hue / 360;
        bgTarget.setHSL(h, 0.6, 0.075).convertSRGBToLinear();
        [[0, 0.62], [0.09, 0.6], [-0.09, 0.58]].forEach(([dh, l], i) => nebTarget[i].setHSL(((h + dh) % 1 + 1) % 1, 0.85, l).convertSRGBToLinear());
        if (snap) { bgCol.copy(bgTarget); scene.fog.color.copy(bgCol); nebMats.forEach((m, i) => m.color.copy(nebTarget[i])); }
      }
      const cam = new THREE.PerspectiveCamera(narrow ? 82 : 68, VW / VH, 0.05, 320);
      scene.add(cam);
      scene.add(new THREE.AmbientLight(0xffffff, 0.62));
      const sunL = new THREE.DirectionalLight(0xffffff, 0.85);
      const sunT = new THREE.Object3D();
      sunL.position.set(-0.6, 1, 0.8); sunT.position.set(0, 0, -1);
      cam.add(sunL); cam.add(sunT); sunL.target = sunT;

      const sky = new THREE.Group();
      scene.add(sky);
      {
        const n = 1700, sp = new Float32Array(n * 3), sc = new Float32Array(n * 3), R = rng(99);
        for (let i = 0; i < n; i++) {
          const z = 2 * R() - 1, t = R() * TAU, r = Math.sqrt(1 - z * z), b = 0.35 + 0.65 * R() * R(), tint = R();
          sp.set([150 * r * Math.cos(t), 150 * r * Math.sin(t), 150 * z], i * 3);
          sc.set([b * (tint < 0.2 ? 0.8 : 1), b * (tint > 0.85 ? 0.85 : 1), b * (tint < 0.2 ? 1 : tint > 0.85 ? 0.7 : 1)], i * 3);
        }
        const sg = D(new THREE.BufferGeometry());
        sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
        sg.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
        sky.add(new THREE.Points(sg, D(new THREE.PointsMaterial({ size: 1.7 * renderer.getPixelRatio(), sizeAttenuation: false, vertexColors: true, fog: false, toneMapped: false, depthWrite: false }))));
        [['#4a3cff', -70, 40, -120, 140], ['#ff3c9a', 90, -50, -110, 120], ['#22c3ff', 20, 90, 100, 150]].forEach(([c, x, y, z, s]) => {
          const m = D(new THREE.SpriteMaterial({ map: texNeb, color: lin(c), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.26, depthWrite: false, fog: false, toneMapped: false }));
          nebMats.push(m);
          const sp2 = new THREE.Sprite(m); sp2.position.set(x, y, z); sp2.scale.set(s, s, 1); sky.add(sp2);
        });
        const pm = D(new THREE.SpriteMaterial({ map: texPlanet, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
        const pl = new THREE.Sprite(pm); pl.position.set(55, 32, -140); pl.scale.set(26, 26, 1); sky.add(pl);
      }


      const W = '#f3f5fa', W2 = '#cfd5e2', GR = '#9aa3b5', KK = '#2a2f3e', OR = '#ff9a1f', MI = '#35f0cc';
      const mSuit = D(new THREE.MeshLambertMaterial({ vertexColors: true, emissive: lin('#262a36') }));
      const mVisor = D(new THREE.MeshPhongMaterial({ color: lin('#0a1830'), emissive: lin('#06142e'), specular: 0xffffff, shininess: 140 }));
      const mHG = bm({ vertexColors: true });
      const mFlame = D(new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
      const geoBody = bake([
        pr(gSph, W, 0, 0.62, 0, 0.215, 0.225, 0.205),
        pr(gSph, OR, 0, 0.62, 0, 0.036, 0.232, 0.209),
        pr(gSph, KK, 0, 0.625, -0.128, 0.19, 0.14, 0.11),
        pr(gCyl, KK, 0.215, 0.62, 0, 0.062, 0.05, 0.062, 0, 0, Math.PI / 2),
        pr(gCyl, KK, -0.215, 0.62, 0, 0.062, 0.05, 0.062, 0, 0, Math.PI / 2),
        pr(gCyl, GR, 0, 0.665, 0.19, 0.125, 0.018, 0.034, Math.PI / 2, 0, 0),
        pr(gBox, KK, 0, 0.655, 0.2, 0.12, 0.07, 0.03),
        pr(gCyl, KK, 0, 0.425, 0, 0.115, 0.05, 0.1),
        pr(gCyl, GR, 0, 0.445, 0, 0.125, 0.012, 0.11),
        pr(gSph, W, 0, 0.335, 0, 0.118, 0.14, 0.1),
        pr(gSph, W2, 0, 0.3, 0.004, 0.121, 0.1, 0.103),
        pr(gCyl, KK, 0, 0.245, 0, 0.114, 0.026, 0.1),
        pr(gBox, OR, 0, 0.245, -0.098, 0.05, 0.03, 0.012),
        pr(gBox, W2, 0, 0.35, 0.14, 0.152, 0.2, 0.078),
        pr(gBox, KK, 0, 0.455, 0.14, 0.162, 0.024, 0.088),
        pr(gBox, KK, 0, 0.246, 0.14, 0.162, 0.024, 0.088),
        pr(gBox, GR, 0, 0.352, 0.182, 0.095, 0.13, 0.012),
        pr(gBox, KK, 0, 0.39, 0.19, 0.085, 0.003, 0.004),
        pr(gBox, KK, 0, 0.32, 0.19, 0.085, 0.003, 0.004),
        pr(gCyl, OR, 0.1, 0.352, 0.165, 0.032, 0.17, 0.032),
        pr(gCyl, OR, -0.1, 0.352, 0.165, 0.032, 0.17, 0.032),
        pr(gSph, KK, 0.1, 0.438, 0.165, 0.032, 0.022, 0.032),
        pr(gSph, KK, -0.1, 0.438, 0.165, 0.032, 0.022, 0.032),
        pr(gSph, KK, 0.1, 0.266, 0.165, 0.032, 0.022, 0.032),
        pr(gSph, KK, -0.1, 0.266, 0.165, 0.032, 0.022, 0.032),
        pr(gCyl, GR, 0.1, 0.4, 0.165, 0.034, 0.012, 0.034),
        pr(gCyl, GR, -0.1, 0.4, 0.165, 0.034, 0.012, 0.034),
        pr(gCyl, KK, 0.045, 0.23, 0.165, 0.03, 0.042, 0.03),
        pr(gCyl, KK, -0.045, 0.23, 0.165, 0.03, 0.042, 0.03),
        pr(gCyl, GR, 0.045, 0.252, 0.165, 0.034, 0.008, 0.034),
        pr(gCyl, GR, -0.045, 0.252, 0.165, 0.034, 0.008, 0.034),
        pr(gSph, KK, 0.048, 0.225, 0, 0.044, 0.04, 0.044),
        pr(gSph, KK, -0.048, 0.225, 0, 0.044, 0.04, 0.044),
        pr(gSph, W2, 0.1, 0.435, 0, 0.05, 0.045, 0.05),
        pr(gSph, W2, -0.1, 0.435, 0, 0.05, 0.045, 0.05)
      ], 0.2);
      const geoVisor = bake([pr(gSph, '#ffffff', 0, 0.628, -0.137, 0.168, 0.122, 0.1, 0.1, 0, 0)], 0);
      const geoGlow = bake([
        pr(gBox, MI, 0, 0.352, 0.1895, 0.012, 0.1, 0.004),
        pr(gSph, '#ff6a55', 0.03, 0.4, 0.19, 0.009, 0.009, 0.006),
        pr(gSph, '#ffd23f', 0.03, 0.372, 0.19, 0.009, 0.009, 0.006),
        pr(gSph, MI, 0.03, 0.344, 0.19, 0.009, 0.009, 0.006),
        pr(gBox, MI, 0, 0.66, 0.2155, 0.085, 0.011, 0.004),
        pr(gCyl, MI, 0.2395, 0.62, 0, 0.042, 0.006, 0.042, 0, 0, Math.PI / 2),
        pr(gCyl, MI, -0.2395, 0.62, 0, 0.042, 0.006, 0.042, 0, 0, Math.PI / 2),
        pr(gBox, MI, 0, 0.245, 0.0975, 0.05, 0.007, 0.004),
        pr(gSph, '#ffffff', -0.055, 0.665, -0.226, 0.055, 0.012, 0.012, 0, 0, 0.5),
        pr(gSph, '#bfe9ff', -0.02, 0.687, -0.22, 0.02, 0.008, 0.01, 0, 0, 0.25),
        pr(gSph, '#7fdcff', 0.07, 0.575, -0.228, 0.045, 0.008, 0.01, 0, 0, 0.5)
      ], 0);
      const geoLeg = bake([
        pr(gCyl, W, 0, -0.05, 0, 0.04, 0.11, 0.04),
        pr(gSph, KK, 0, -0.105, 0, 0.038, 0.038, 0.038),
        pr(gCyl, W2, 0, -0.145, 0, 0.034, 0.08, 0.034),
        pr(gCyl, GR, 0, -0.17, 0, 0.042, 0.03, 0.042),
        pr(gCyl, OR, 0, -0.158, 0, 0.044, 0.01, 0.044),
        pr(gSph, KK, 0, -0.192, -0.016, 0.052, 0.036, 0.078),
        pr(gBox, MI, 0, -0.215, -0.02, 0.058, 0.008, 0.088, 0, 0, 0, 1.1),
        pr(gSph, '#4a5166', 0, -0.2, -0.062, 0.036, 0.022, 0.03)
      ], 0.25);
      const geoArm = bake([
        pr(gSph, W2, 0, 0.004, 0, 0.052, 0.048, 0.052),
        pr(gCyl, W, 0, -0.05, 0, 0.034, 0.09, 0.034),
        pr(gCyl, OR, 0, -0.02, 0, 0.038, 0.02, 0.038),
        pr(gSph, W2, 0, -0.098, 0, 0.034, 0.034, 0.034),
        pr(gCyl, W2, 0, -0.13, 0, 0.03, 0.06, 0.03),
        pr(gCyl, MI, 0, -0.158, 0, 0.037, 0.014, 0.037, 0, 0, 0, 1.1),
        pr(gSph, KK, 0, -0.186, 0, 0.048, 0.054, 0.048),
        pr(gSph, KK, 0.012, -0.176, -0.036, 0.02, 0.02, 0.026)
      ], 0.22);
      const geoFlame = bake([
        pr(gCone, '#7fe8ff', 0.045, 0.206, 0.165, 0.026, 0.2, 0.026, 0, 0, 0, 1),
        pr(gCone, '#7fe8ff', -0.045, 0.206, 0.165, 0.026, 0.2, 0.026, 0, 0, 0, 1),
        pr(gCone, '#ffffff', 0.045, 0.206, 0.165, 0.014, 0.11, 0.014, 0, 0, 0, 1),
        pr(gCone, '#ffffff', -0.045, 0.206, 0.165, 0.014, 0.11, 0.014, 0, 0, 0, 1)
      ], 0);
      const geoAnt = bake([
        pr(gCyl, GR, 0, 0.05, 0, 0.009, 0.1, 0.009),
        pr(gCyl, KK, 0, 0.004, 0, 0.026, 0.02, 0.026),
        pr(gSph, MI, 0, 0.108, 0, 0.034, 0.034, 0.034, 0, 0, 0, 1.15)
      ], 0);
      const rn = new THREE.Group(), body = new THREE.Group();
      rn.add(body); scene.add(rn);
      body.scale.setScalar(0.92);
      body.add(new THREE.Mesh(geoBody, mSuit), new THREE.Mesh(geoVisor, mVisor), new THREE.Mesh(geoGlow, mHG));
      const flame = new THREE.Mesh(geoFlame, mFlame);
      flame.scale.y = 0; flame.position.y = 0.206; flame.position.z = 0; flame.visible = false;
      flame.geometry.translate(0, -0.206, 0);
      body.add(flame);
      const ant = new THREE.Mesh(geoAnt, mHG);
      ant.position.set(0.06, 0.835, 0.02); ant.rotation.z = -0.25; body.add(ant);
      const limb = (x, y, geo) => { const g = new THREE.Group(); g.position.set(x, y, 0); body.add(g); g.add(new THREE.Mesh(geo, mSuit)); return g; };
      const legL = limb(-0.048, 0.22, geoLeg), legR = limb(0.048, 0.22, geoLeg);
      const armL = limb(-0.09, 0.43, geoArm), armR = limb(0.09, 0.43, geoArm);
      armL.rotation.z = -0.25; armR.rotation.z = 0.25;
      let landT = 0, wasGround = true;
      const shdG = new THREE.Group(), shd = new THREE.Mesh(D(new THREE.PlaneGeometry(0.6, 0.6)), D(new THREE.MeshBasicMaterial({ map: texShadow, transparent: true, depthWrite: false, opacity: 0.5, toneMapped: false })));
      shd.rotation.x = -Math.PI / 2; shdG.add(shd); scene.add(shdG);
      const bursts = [];
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Sprite(D(new THREE.SpriteMaterial({ map: texGlow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false })));
        s.visible = false; scene.add(s); bursts.push({ s, t: 9 });
      }


      const M4 = new THREE.Matrix4(), COL = new THREE.Color(), LOOK = new THREE.Vector3(), PW = [0, 0];
      const scaleM = (m, k) => { const e = m.elements; e[0] *= k; e[1] *= k; e[2] *= k; e[4] *= k; e[5] *= k; e[6] *= k; e[8] *= k; e[9] *= k; e[10] *= k; return m; };
      function cellM(g, s, c, r, out) {
        const T = g.T[s], N = g.N[s], C = g.C[s], x = c - g.w / 2 + 0.5;
        return out.set(T[0], N[0], 0, C[0] + T[0] * x, T[1], N[1], 0, C[1] + T[1] * x, 0, 0, 1, -(r + 0.5), 0, 0, 0, 1);
      }
      function tileCol(L, i, t, out) {
        const a = hr(i * 1.37 + L.seed), b = hr(i * 2.71 + L.seed * 0.5);
        if (t === T_CRUM) return out.setHSL(L.hue / 360, 0.07, 0.5 + a * 0.14).convertSRGBToLinear();
        if (t === T_BOX) return out.setHSL(L.hue / 360, 0.14, 0.84 + a * 0.08).convertSRGBToLinear();
        if (t === T_RAMP) return out.setHSL(L.hue / 360, 0.3, 0.8).convertSRGBToLinear();
        if (t >= T_FAST && t <= T_RIGHT) return out.setRGB(1, 1, 1);
        return out.setHSL((((L.hue + (b - 0.5) * 14) / 360) % 1 + 1) % 1, L.sat, L.lit * (0.72 + a * 0.45)).convertSRGBToLinear();
      }
      function buildView(L, xf) {
        const grp = new THREE.Group();
        grp.position.set(xf.cx, xf.cy, -xf.z0); grp.rotation.z = xf.w;
        const n = L.n, W = L.w, g = L.g, cnt = new Int32Array(9), fill = new Int32Array(9), meshes = [];
        for (let i = 0; i < L.grid.length; i++) { const t = L.grid[i]; if (t) { cnt[t === T_BOX ? T_TILE : t]++; if (t === T_BOX) cnt[T_BOX]++; } }
        const style = L.tunnel != null ? L.tunnel : Math.floor(L.hue / 60);
        const matFor = t => (t === T_TILE || t === T_DARK) ? mTiles[style % mTiles.length] : GM[t][1];
        for (let t = 1; t <= 8; t++) if (cnt[t]) { const im = new THREE.InstancedMesh(GM[t][0], matFor(t), cnt[t]); im.frustumCulled = false; meshes[t] = im; grp.add(im); }
        const inst = new Int32Array(L.grid.length).fill(-1), drow = [];
        for (let i = 0; i < L.grid.length; i++) {
          const t = L.grid[i];
          if (!t) continue;
          const c = i % W, s = ((i - c) / W) % n, r = Math.floor(i / (n * W)), tt = t === T_BOX ? T_TILE : t, im = meshes[tt], k = fill[tt]++;
          cellM(g, s, c, r, M4);
          tileCol(L, i, tt, COL);
          if (t === T_DARK) { scaleM(M4, 0); (drow[r] = drow[r] || []).push(i, k); }
          im.setMatrixAt(k, M4); im.setColorAt(k, COL);
          inst[i] = k;
          if (t === T_BOX) { const bmh = meshes[T_BOX], bk = fill[T_BOX]++; cellM(g, s, c, r, M4); bmh.setMatrixAt(bk, M4); bmh.setColorAt(bk, tileCol(L, i, T_BOX, COL)); }
        }
        const cells = L.cells.map(cl => {
          const o = new THREE.Group(), N = g.N[cl[1]];
          o.position.set(cl[3], cl[4], -(cl[0] + 0.5));
          o.rotation.z = Math.atan2(N[1], N[0]) - Math.PI / 2;
          const spin = new THREE.Group();
          spin.add(new THREE.Mesh(geoBat, mBat));
          const gl = new THREE.Sprite(mGlow); gl.scale.set(0.8, 0.8, 1);
          o.add(spin); o.add(gl); grp.add(o);
          return { o, spin, bx: cl[3], by: cl[4], nx: N[0], ny: N[1], hid: false };
        });
        scene.add(grp);
        return { grp, meshes, inst, drow, rev: new Float32Array(L.len), gone: new Set(), cells, L };
      }
      function dropView(vw) {
        if (!vw) return;
        scene.remove(vw.grp);
        vw.meshes.forEach(m => { if (m && m.dispose) m.dispose(); });
      }
      function burstAt(x, y, z) {
        const b = bursts.find(o => o.t > 0.4) || bursts[0];
        b.t = 0; b.s.position.set(x, y, z); b.s.visible = true;
      }
      function updateView(vw, st2, t) {
        const L = vw.L, g = L.g;
        if (vw.drow.length && vw.meshes[T_DARK]) {
          const im = vw.meshes[T_DARK];
          let ch = false;
          const r0 = Math.max(0, Math.floor(st2.dist) - 1), r1 = Math.min(L.len - 1, Math.floor(st2.dist + CFG.DARK_SEE + 3));
          for (let r = r0; r <= r1; r++) {
            const list = vw.drow[r];
            if (!list) continue;
            const vis = Math.max(vw.rev[r], clamp((CFG.DARK_SEE - (r + 0.5 - st2.dist)) / 2.5, 0, 1));
            if (vis === vw.rev[r]) continue;
            vw.rev[r] = vis; ch = true;
            for (let k = 0; k < list.length; k += 2) {
              const i = list[k], c = i % L.w, s = ((i - c) / L.w) % L.n;
              cellM(g, s, c, r, M4); scaleM(M4, 0.4 + 0.6 * vis); im.setMatrixAt(list[k + 1], M4);
              tileCol(L, i, T_TILE, COL).multiplyScalar(vis); im.setColorAt(list[k + 1], COL);
            }
          }
          if (ch) { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; }
        }
        const imc = vw.meshes[T_CRUM];
        if (imc && st2.crum.size) {
          for (const [i, t0] of st2.crum) {
            if (vw.gone.has(i)) continue;
            const age = st2.time - t0, c = i % L.w, s = ((i - c) / L.w) % L.n, r = Math.floor(i / (L.w * L.n));
            const T = g.T[s], N = g.N[s], C = g.C[s], x = c - L.w / 2 + 0.5;
            let px = C[0] + T[0] * x, py = C[1] + T[1] * x, sc = 1, cp = 1, sp = 0;
            if (age < CFG.CRUMBLE_FALL) { const j = Math.sin(age * 70 + i) * 0.04; px += T[0] * j; py += T[1] * j; } else {
              const f = age - CFG.CRUMBLE_FALL, d = 0.8 * f + 2.4 * f * f, ph = f * 2.6 * (i & 1 ? 1 : -1);
              px -= N[0] * d; py -= N[1] * d; cp = Math.cos(ph); sp = Math.sin(ph); sc = Math.max(0, 1 - f * 0.6);
              if (sc === 0) vw.gone.add(i);
            }
            M4.set(T[0] * sc, N[0] * cp * sc, -N[0] * sp * sc, px, T[1] * sc, N[1] * cp * sc, -N[1] * sp * sc, py, 0, sp * sc, cp * sc, -(r + 0.5), 0, 0, 0, 1);
            imc.setMatrixAt(vw.inst[i], M4);
          }
          imc.instanceMatrix.needsUpdate = true;
        }
        for (let k = 0; k < vw.cells.length; k++) {
          const cv = vw.cells[k];
          if (cv.hid) continue;
          if (st2.got & (1 << k)) {
            cv.hid = true; cv.o.visible = false;
            const wp = cv.o.getWorldPosition(LOOK);
            burstAt(wp.x, wp.y, wp.z);
            continue;
          }
          cv.spin.rotation.y = t * 2.6 + k;
          const bob = Math.sin(t * 3 + k) * 0.05;
          cv.o.position.x = cv.bx + cv.nx * bob; cv.o.position.y = cv.by + cv.ny * bob;
        }
      }


      let ac = null, master = null, noiseBuf = null;
      function audio() {
        if (ac || api.muted) return ac;
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          ac = new AC(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
          noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = noiseBuf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; }
        return ac;
      }
      function osc(f, t0, d, type, vol, f2) {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t0);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
        gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(gn); gn.connect(master); o.start(t0); o.stop(t0 + d + 0.03);
      }
      function nz(t0, d, vol, f1, f2, type) {
        const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain();
        s.buffer = noiseBuf; fl.type = type || 'lowpass'; fl.frequency.setValueAtTime(f1, t0);
        if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + d);
        gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        s.connect(fl); fl.connect(gn); gn.connect(master); s.start(t0); s.stop(t0 + d + 0.03);
      }
      let lastSfx = {};
      function sfx(nm) {
        if (api.muted || !audio() || ac.state === 'closed') return;
        const t = ac.currentTime;
        if (lastSfx[nm] && t - lastSfx[nm] < 0.06) return;
        lastSfx[nm] = t;
        switch (nm) {
          case 'jump': osc(300, t, 0.16, 'square', 0.035, 560); osc(600, t, 0.12, 'sine', 0.05, 1100); break;
          case 'land': osc(150, t, 0.09, 'sine', 0.09, 60); nz(t, 0.06, 0.03, 900); break;
          case 'rot': nz(t, 0.28, 0.07, 400, 2600, 'bandpass'); break;
          case 'crum': nz(t, 0.22, 0.1, 900, 200); osc(95, t, 0.14, 'triangle', 0.06, 45); break;
          case 'cell': osc(988, t, 0.12, 'sine', 0.08); osc(1480, t + 0.07, 0.2, 'sine', 0.07); osc(1976, t + 0.12, 0.16, 'sine', 0.03); break;
          case 'ramp': osc(200, t, 0.35, 'sawtooth', 0.035, 900); nz(t, 0.3, 0.04, 600, 3000, 'bandpass'); break;
          case 'bump': osc(120, t, 0.08, 'square', 0.04, 70); break;
          case 'fall': osc(560, t, 1.0, 'sine', 0.08, 55); nz(t, 0.8, 0.035, 2000, 200, 'bandpass'); break;
          case 'done': [523, 659, 784, 1047].forEach((f, i) => osc(f, t + i * 0.07, 0.22, 'triangle', 0.07)); break;
          case 'win': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => osc(f, t + i * 0.09, 0.4, 'triangle', 0.07)); break;
          case 'over': osc(330, t, 0.5, 'triangle', 0.07, 110); osc(220, t + 0.15, 0.6, 'triangle', 0.05, 80); break;
          case 'tick': osc(900, t, 0.05, 'square', 0.025); break;
        }
      }
      const CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 66]], ARP = [0, 1, 2, 3, 2, 1, 3, 2];
      const mf = m => 440 * Math.pow(2, (m - 69) / 12);
      let mNext = 0, mStep = 0;
      api.interval(() => {
        if (state !== 'play' || api.muted || !ac || ac.state !== 'running') { mNext = 0; return; }
        const now = ac.currentTime, e8 = 60 / 108 / 2;
        if (mNext < now) mNext = now + 0.05;
        while (mNext < now + 0.35) {
          const bar = Math.floor(mStep / 8) % 4, i = mStep % 8, ch = CHORDS[bar];
          osc(mf(ch[ARP[i]] + 12), mNext, 0.2, 'triangle', 0.022);
          if (i === 0 || i === 4) osc(mf(ch[0] - 24), mNext, 0.45, 'sine', 0.075);
          if (i === 0) { osc(mf(ch[1]), mNext, e8 * 7.5, 'sine', 0.012); osc(mf(ch[2]), mNext, e8 * 7.5, 'sine', 0.01); }
          if (i % 2 === 1) nz(mNext, 0.04, 0.012, 7000, 0, 'highpass');
          if (i === 2 || i === 6) nz(mNext, 0.09, 0.02, 1500, 300);
          mNext += e8; mStep++;
        }
      }, 90);


      const IDENT = { w: 0, cx: 0, cy: 0, z0: 0 };
      const sv0 = api.load() || {};
      const SV = { done: Array.isArray(sv0.done) ? sv0.done.slice(0, LEVELS.length) : [], cells: Array.isArray(sv0.cells) ? sv0.cells.slice(0, LEVELS.length) : [], best: +sv0.best || 0, sel: clamp(+sv0.sel || 0, 0, LEVELS.length - 1) };
      const save = () => api.save(SV);
      const unl = i => i === 0 || !!SV.done[i - 1] || !!SV.done[i];
      let state = 'title', mode = 'explore', lvl = 0, cur = null, prev = null, st = null, nxt = null;
      let acam = Math.PI / 2, arun = Math.PI / 2, camHp = 0, acc = 0, lostT = 0, lostDist = 0, autoN = 0, pendPress = false, phase = 0, tAll = 0;
      let infSeed = 1, infK = 0, infRows = 0, infCells = 0, submitted = false, lastM = -1, fadeOn = false, bigId = 0, navSel = 0, mapSel = SV.sel, attJ = false;
      const INP = { lr: 0, jump: false, press: false };
      const ptrs = new Map();

      function dropNext() { if (nxt) { dropView(nxt.view); nxt = null; } }
      function setLevel(L, xf) {
        dropNext();
        if (prev) dropView(prev.view);
        if (cur) dropView(cur.view);
        prev = null;
        cur = { L, xf, view: buildView(L, xf) };
        worldFor(L, true);
      }
      function snapCam() {
        const nl = cur.L.g.N[st.s];
        acam = arun = cur.xf.w + Math.atan2(nl[1], nl[0]); camHp = st.h;
      }
      function xfFor(L2, s) {
        const L = cur.L, g = L.g, xf = cur.xf, cw = Math.cos(xf.w), sw = Math.sin(xf.w), N = g.N[s], C = g.C[s];
        const nwx = cw * N[0] - sw * N[1], nwy = sw * N[0] + cw * N[1];
        const cwx = xf.cx + cw * C[0] - sw * C[1], cwy = xf.cy + sw * C[0] + cw * C[1], a2 = L2.g.a;
        return { w: Math.atan2(nwy, nwx) - Math.PI / 2, cx: cwx + a2 * nwx, cy: cwy + a2 * nwy, z0: xf.z0 + L.len };
      }
      function placeView(vw, xf) { vw.grp.position.set(xf.cx, xf.cy, -xf.z0); vw.grp.rotation.z = xf.w; }
      function nextL() {
        if (mode === 'infinite') return genInf(infSeed + infK + 1, Math.min(CFG.INF_DMAX, (infRows + cur.L.len) / CFG.INF_DIFF));
        return lvl + 1 < LEVELS.length ? LEVELS[lvl + 1] : null;
      }
      function preview() {
        if (!cur || st.lost || cur.L.len - st.dist > CFG.PRE) return;
        if (!nxt) {
          const L2 = nextL();
          if (!L2) return;
          nxt = { L: L2, s: st.s, view: buildView(L2, xfFor(L2, st.s)) };
        } else if (nxt.s !== st.s) { nxt.s = st.s; placeView(nxt.view, xfFor(nxt.L, st.s)); }
      }
      function chainTo(L2) {
        const L = cur.L, xf2 = xfFor(L2, st.s);
        const o = newRun(L2, st.spd);
        o.x = clamp(st.x, -L2.w / 2 + 0.01, L2.w / 2 - 0.01); o.h = st.h; o.vx = st.vx; o.vh = st.vh; o.vz = st.vz;
        o.ground = st.ground; o.jumped = st.jumped; o.on = st.on; o.coy = st.coy; o.buf = st.buf; o.dist = st.dist - L.len;
        if (prev) dropView(prev.view);
        prev = cur;
        let vw;
        if (nxt && nxt.L === L2) { vw = nxt.view; placeView(vw, xf2); nxt = null; } else { dropNext(); vw = buildView(L2, xf2); }
        cur = { L: L2, xf: xf2, view: vw };
        worldFor(L2, false);
        st = o;
      }
      function setFade(on) { fadeOn = on; fadeEl.classList.toggle('on', on); }
      function showTitle(a, b) {
        const el = q('.big'), id = ++bigId;
        el.firstChild.textContent = a; el.lastChild.textContent = b;
        el.classList.add('show');
        api.timeout(() => { if (id === bigId) el.classList.remove('show'); }, 1700);
      }
      function hideTitle() { bigId++; q('.big').classList.remove('show'); hideCtl(); }
      let ctlId = 0;
      function showCtl() {
        const el = q('.ctl'), id = ++ctlId;
        el.innerHTML = COARSE ? '<span>Hold <b>left</b> or <b>right</b> to steer</span><span>Tap <b>JUMP</b> to jump</span><span>Run onto a wall to turn</span>' : '<span><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> steer</span><span><kbd>Space</kbd> jump · hold for higher</span><span>Run onto a wall to turn</span>';
        el.classList.add('show');
        api.timeout(() => { if (id === ctlId) el.classList.remove('show'); }, 5600);
      }
      function hideCtl() { ctlId++; const el = q('.ctl'); if (el) el.classList.remove('show'); }
      const doneCount = () => SV.done.filter(Boolean).length;
      function levelScore() { api.label('Levels'); api.score(doneCount() + '/' + LEVELS.length); }
      function cellHud() { q('.cc').textContent = mode === 'explore' ? bits(st.got) + '/' + cur.L.cells.length : String(infCells + bits(st.got)); }
      function hudLevel() {
        hud.dataset.m = mode;
        if (mode === 'explore') { q('.lv').textContent = 'Level ' + (lvl + 1); q('.tn').textContent = TUNNELS[cur.L.tunnel].name; }
        cellHud();
      }
      function startAttract() {
        if (cur && cur.L === ATTRACT) return;
        setLevel(ATTRACT, IDENT);
        st = newRun(ATTRACT, 1); st.dist = 20; snapCam();
      }
      function startLevel(i) {
        mode = 'explore'; lvl = i; mapSel = i; SV.sel = i; save();
        setLevel(LEVELS[i], IDENT);
        st = newRun(cur.L, 1); snapCam();
        lostT = 0; autoN = 0; acc = 0; pendPress = false; ptrs.clear();
        state = 'play'; screen(null); hudLevel();
        showTitle('Level ' + (i + 1), TUNNELS[cur.L.tunnel].name);
        showCtl();
        levelScore();
        api.timeout(() => setFade(false), 90);
      }
      function startInf() {
        mode = 'infinite'; infSeed = (Math.random() * 1e6) | 0; infK = 0; infRows = 0; infCells = 0; submitted = false; lastM = -1;
        setLevel(genInf(infSeed, 0, true), IDENT);
        st = newRun(cur.L, 1); snapCam();
        lostT = 0; autoN = 0; acc = 0; pendPress = false; ptrs.clear();
        state = 'play'; screen(null); hudLevel(); hudInf(0);
        showTitle('Infinite', 'how far can you run?');
        showCtl();
        api.label('Distance');
        api.score(0);
        api.timeout(() => setFade(false), 90);
      }
      function hudInf(m) { q('.lv').textContent = m + ' m'; q('.tn').textContent = 'Best ' + Math.max(SV.best, m) + ' m'; }
      function levelDone() {
        SV.done[lvl] = 1; SV.cells[lvl] = (SV.cells[lvl] | 0) | st.got;
        const nx = lvl + 1;
        levelScore();
        if (nx >= LEVELS.length) { save(); state = 'done'; ptrs.clear(); sfx('win'); screen('done'); return; }
        SV.sel = nx; mapSel = nx; save();
        sfx('done');
        const tun = LEVELS[nx].tunnel !== cur.L.tunnel;
        lvl = nx; chainTo(LEVELS[nx]); hudLevel();
        showTitle('Level ' + (nx + 1), (tun ? 'Entering ' : '') + TUNNELS[cur.L.tunnel].name);
      }
      function infNext() {
        infRows += cur.L.len; infCells += bits(st.got); infK++;
        chainTo(nxt ? nxt.L : genInf(infSeed + infK, Math.min(CFG.INF_DMAX, infRows / CFG.INF_DIFF)));
        cellHud();
      }
      function gameOver() {
        const m = Math.floor(lostDist * CFG.METRES);
        let nb = false;
        if (!submitted) { submitted = true; nb = m > 0 && api.submit(m); if (m > SV.best) { SV.best = m; save(); } }
        state = 'over'; ptrs.clear(); sfx('over');
        screen('over', { m, nb });
        setFade(false);
      }
      function pause() { if (state !== 'play') return; state = 'pause'; ptrs.clear(); hideTitle(); screen('pause'); }
      function resume() { if (state !== 'pause') return; state = 'play'; acc = 0; screen(null); }
      function toTitle() { state = 'title'; ptrs.clear(); hideTitle(); setFade(false); startAttract(); levelScore(); screen('title'); }
      function toMap() { state = 'map'; ptrs.clear(); hideTitle(); setFade(false); startAttract(); screen('map'); }


      function mapHTML() {
        const cols = narrow ? 4 : 6, nr = Math.ceil(LEVELS.length / cols);
        const pts = LEVELS.map((L, i) => { const r = Math.floor(i / cols); let c = i % cols; if (r & 1) c = cols - 1 - c; return [10 + c * 80 / (cols - 1), (narrow ? 19 : 25) + r * (narrow ? 53 : 45) / (nr - 1)]; });
        let lines = '', nodes = '', labels = '';
        for (let i = 1; i < pts.length; i++) lines += `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${pts[i][0]}" y2="${pts[i][1]}" stroke="${TUNNELS[LEVELS[i].tunnel].css}" stroke-opacity="${unl(i) ? 0.95 : 0.3}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
        LEVELS.forEach((L, i) => {
          const c = TUNNELS[L.tunnel].css, [x, y] = pts[i];
          nodes += `<button class="nd${SV.done[i] ? ' d' : ''}${unl(i) ? '' : ' lk'}${i === mapSel ? ' s' : ''}" style="left:${x}%;top:${y}%;--c:${c}" data-act="sel" data-arg="${i}" aria-label="Level ${i + 1}">${i + 1}</button>`;
          if (i === 0 || LEVELS[i - 1].tunnel !== L.tunnel) labels += `<span class="tlab" style="left:${x}%;top:${y - (narrow ? 3.4 : 5.6)}%;--c:${c};transform:translate(${x < 20 ? '-1.4em' : x > 80 ? 'calc(1.4em - 100%)' : '-50%'},-100%)">${TUNNELS[L.tunnel].name}</span>`;
        });
        const L = LEVELS[mapSel], done = SV.done.filter(Boolean).length;
        const cg = LEVELS.reduce((a, _, i) => a + bits(SV.cells[i] | 0), 0), ct = LEVELS.reduce((a, L2) => a + L2.cells.length, 0);
        return `<div class="dim map-dim"></div><div class="mhead"><b>Explore</b><span>${done}/${LEVELS.length} levels · ${cg}/${ct} power cells</span></div><div class="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${labels}${nodes}</div><div class="info"><div><b>Level ${mapSel + 1}</b><span>${TUNNELS[L.tunnel].name} · cells ${bits(SV.cells[mapSel] | 0)}/${L.cells.length}${SV.done[mapSel] ? ' · cleared' : ''}</span></div><button class="mb sm sel" data-act="play">Play</button><button class="mb sm ghost" data-act="menu">Back</button></div>`;
      }
      function screen(name, o) {
        hud.dataset.st = state;
        scr.classList.toggle('on', !!name);
        navSel = 0;
        if (!name) { scr.innerHTML = ''; return; }
        const done = SV.done.filter(Boolean).length;
        const cg = LEVELS.reduce((a, _, i) => a + bits(SV.cells[i] | 0), 0), ct = LEVELS.reduce((a, L) => a + L.cells.length, 0);
        if (name === 'title') {
          scr.innerHTML = `<div class="dim"></div><div class="pan"><div class="logo">TUNNEL<br>RUSH</div><div class="sub">space tunnel runner</div><button class="mb sel" data-act="explore" data-nav>Explore</button><button class="mb" data-act="infinite" data-nav>Infinite Mode</button><div class="stat">Levels ${done}/${LEVELS.length} · Power cells ${cg}/${ct}${SV.best ? ' · Best ' + SV.best + ' m' : ''}</div><div class="hint">${COARSE ? 'Hold left / right to run on walls · swipe up to jump' : '← → / A D move · Space jump · walk onto a wall to rotate'}</div></div>`;
        } else if (name === 'map') scr.innerHTML = mapHTML();
        else if (name === 'pause') {
          scr.innerHTML = `<div class="dim"></div><div class="pan"><div class="h1">Paused</div><div class="stat">${mode === 'explore' ? 'Level ' + (lvl + 1) + ' · ' + TUNNELS[cur.L.tunnel].name : Math.floor((infRows + st.dist) * CFG.METRES) + ' m'}</div><button class="mb sel" data-act="resume" data-nav>Resume</button><button class="mb" data-act="retry" data-nav>${mode === 'explore' ? 'Restart level' : 'Restart run'}</button>${mode === 'explore' ? '<button class="mb" data-act="map" data-nav>Level map</button>' : ''}<button class="mb" data-act="menu" data-nav>Main menu</button></div>`;
        } else if (name === 'over') {
          scr.innerHTML = `<div class="dim"></div><div class="pan">${o.nb ? '<div class="kick">New best!</div>' : '<div class="sub">lost in space</div>'}<div class="h1">${o.m} m</div><div class="stat">Best ${SV.best} m · Power cells ${infCells + bits(st.got)}</div><button class="mb sel" data-act="infinite" data-nav>Play again</button><button class="mb" data-act="menu" data-nav>Main menu</button></div>`;
        } else if (name === 'done') {
          scr.innerHTML = `<div class="dim"></div><div class="pan"><div class="kick">All tunnels explored</div><div class="h1">You made it!</div><div class="stat">${LEVELS.length} levels · Power cells ${cg}/${ct}</div><button class="mb sel" data-act="map" data-nav>Level map</button><button class="mb" data-act="infinite" data-nav>Infinite Mode</button><button class="mb" data-act="menu" data-nav>Main menu</button></div>`;
        }
      }
      function nav(d) {
        const items = scr.querySelectorAll('[data-nav]');
        if (!items.length) return;
        navSel = (navSel + d + items.length) % items.length;
        items.forEach((b, k) => b.classList.toggle('sel', k === navSel));
        sfx('tick');
      }
      function act(a, arg) {
        if (a === 'explore' || a === 'map') toMap();
        else if (a === 'infinite') startInf();
        else if (a === 'menu') toTitle();
        else if (a === 'resume') resume();
        else if (a === 'retry') { if (mode === 'explore') startLevel(lvl); else startInf(); }
        else if (a === 'play') { if (unl(mapSel)) startLevel(mapSel); }
        else if (a === 'sel') {
          const i = +arg;
          if (!unl(i)) { sfx('bump'); return; }
          if (i === mapSel) startLevel(i); else { mapSel = i; screen('map'); }
        }
      }
      api.on(scr, 'click', e => {
        const b = e.target.closest('[data-act]');
        audio();
        if (!b) { if (state === 'title') { sfx('tick'); toMap(); } return; }
        sfx('tick'); act(b.dataset.act, b.dataset.arg);
      });
      api.on(q('.pz'), 'pointerdown', e => e.stopPropagation());
      api.on(q('.pz'), 'click', () => { audio(); pause(); });


      function pressJump() {
        if (state !== 'play' || !st || st.lost) return;
        st.buf = CFG.BUFFER;
        if (tryJump(st)) sfx('jump'); else pendPress = true;
      }
      api.on(window, 'keydown', e => {
        const c = e.code;
        if (state === 'play') {
          if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') { e.preventDefault(); if (!e.repeat) { audio(); pressJump(); } } else if (c === 'KeyP') pause();
          return;
        }
        if (e.repeat && (c === 'Enter' || c === 'Space')) return;
        if (state === 'pause' && c === 'KeyP') { resume(); return; }
        if (state === 'map') {
          if (c === 'ArrowLeft' || c === 'ArrowUp' || c === 'KeyA' || c === 'KeyW') { let i = mapSel - 1; if (i >= 0) { mapSel = i; sfx('tick'); screen('map'); } }
          else if (c === 'ArrowRight' || c === 'ArrowDown' || c === 'KeyD' || c === 'KeyS') { const i = mapSel + 1; if (i < LEVELS.length && unl(i)) { mapSel = i; sfx('tick'); screen('map'); } }
          else if (c === 'Enter' || c === 'Space') { e.preventDefault(); audio(); act('play'); }
          else if (c === 'Backspace') toTitle();
          return;
        }
        if (c === 'ArrowUp' || c === 'ArrowLeft' || c === 'KeyW' || c === 'KeyA') nav(-1);
        else if (c === 'ArrowDown' || c === 'ArrowRight' || c === 'KeyS' || c === 'KeyD') nav(1);
        else if (c === 'Enter' || c === 'Space') {
          e.preventDefault(); audio();
          const items = scr.querySelectorAll('[data-nav]');
          if (items[navSel]) items[navSel].click();
        }
      });
      if (COARSE) touchEl.classList.add('on');
      api.on(wrap, 'pointerdown', e => {
        if (state !== 'play' || e.target.closest('.scr.on, .pz')) return;
        audio();
        if (e.pointerType !== 'mouse') touchEl.classList.add('on');
        const r = wrap.getBoundingClientRect(), jb = !!e.target.closest('.jb');
        const rec = { side: jb ? 0 : (e.clientX - r.left) / r.width < 0.5 ? -1 : 1, y0: e.clientY, top: e.clientY, jump: jb, jb };
        ptrs.set(e.pointerId, rec);
        if (jb) pressJump();
        try { wrap.setPointerCapture(e.pointerId); } catch (er) {   }
        e.preventDefault();
      });
      api.on(wrap, 'pointermove', e => {
        const rec = ptrs.get(e.pointerId);
        if (!rec) return;
        const r = wrap.getBoundingClientRect(), th = Math.max(22, r.height * 0.04);
        rec.top = Math.min(rec.top, e.clientY);
        if (!rec.jump && rec.y0 - e.clientY > th) { rec.jump = true; pressJump(); }
        else if (rec.jump && !rec.jb && e.clientY - rec.top > th) { rec.jump = false; rec.y0 = e.clientY; rec.top = e.clientY; }
        if (!rec.jb) rec.side = (e.clientX - r.left) / r.width < 0.5 ? -1 : 1;
      });
      const pUp = e => ptrs.delete(e.pointerId);
      api.on(wrap, 'pointerup', pUp);
      api.on(wrap, 'pointercancel', pUp);
      api.on(document, 'visibilitychange', () => { if (document.hidden) pause(); });

      function readInput() {
        if (GAME.__auto) {
          const a = GAME.__auto, k = Math.floor(autoN / 12), sub = autoN % 12, x = a[k] || [0, 0], pj = k > 0 && a[k - 1] ? a[k - 1][1] : 0;
          autoN++;
          INP.lr = x[0]; INP.jump = !!x[1]; INP.press = sub === 0 && !!x[1] && !pj;
          return INP;
        }
        let lr = 0, tj = false;
        if (keys.has('ArrowLeft') || keys.has('KeyA')) lr -= 1;
        if (keys.has('ArrowRight') || keys.has('KeyD')) lr += 1;
        for (const p of ptrs.values()) { lr += p.side; if (p.jump) tj = true; }
        INP.lr = clamp(lr, -1, 1);
        INP.jump = tj || keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW');
        INP.press = pendPress; pendPress = false;
        return INP;
      }
      function attractInput() {
        const tt = st.time % 7, j = tt > 5 && tt < 5.45;
        INP.lr = tt > 2.2 && tt < 3.05 ? 1 : 0; INP.jump = j; INP.press = j && !attJ; attJ = j;
        return INP;
      }
      function physTick() {
        const L = cur.L;
        if (state !== 'play') {
          step(L, st, attractInput(), CFG.DT);
          if (st.dist > L.len - 40) st.dist -= 300;
          return;
        }
        if (mode === 'infinite') st.spd = 1 + (CFG.INF_MAX - 1) * (1 - Math.exp(-(infRows + st.dist) / CFG.INF_RAMP)) + 0.12 * Math.min(1, Math.max(0, infRows + st.dist - 3000) / 4000);
        const wasLost = st.lost;
        step(L, st, readInput(), CFG.DT);
        const ev = st.ev;
        if (ev) {
          if (ev & 1) sfx('jump');
          if (ev & 2) sfx('land');
          if (ev & 4) sfx('rot');
          if (ev & 8) sfx('crum');
          if (ev & 16) { sfx('cell'); cellHud(); }
          if (ev & 32) sfx('ramp');
          if (ev & 64) sfx('bump');
        }
        if (st.lost) {
          if (!wasLost) { lostDist = infRows + st.dist; sfx('fall'); }
          lostT += CFG.DT;
          if (lostT >= 0.75 && !fadeOn) setFade(true);
          if (lostT >= 1.1) { if (mode === 'explore') startLevel(lvl); else gameOver(); }
          return;
        }
        if (st.dist >= L.len) { if (mode === 'explore') levelDone(); else infNext(); return; }
        if (prev && st.dist > 10) { dropView(prev.view); prev = null; }
        preview();
        if (mode === 'infinite') { const m = Math.floor((infRows + st.dist) * CFG.METRES); if (m !== lastM) { lastM = m; api.score(m); hudInf(m); } }
      }


      function draw(dt) {
        tAll += dt;
        const wk = 1 - Math.exp(-1.6 * dt);
        bgCol.lerp(bgTarget, wk); scene.fog.color.copy(bgCol);
        for (let i = 0; i < nebMats.length; i++) nebMats[i].color.lerp(nebTarget[i], wk);
        const L = cur.L, g = L.g, xf = cur.xf, nl = g.N[st.s];
        const aSide = xf.w + Math.atan2(nl[1], nl[0]);
        acam += wrapPi(aSide - acam) * (1 - Math.exp(-11 * dt));
        arun += wrapPi(aSide - arun) * (1 - Math.exp(-22 * dt));
        pos(g, st.s, st.x, st.h, PW);
        const cw = Math.cos(xf.w), sw = Math.sin(xf.w);
        const wx = xf.cx + cw * PW[0] - sw * PW[1], wy = xf.cy + sw * PW[0] + cw * PW[1], wz = -(xf.z0 + st.dist);
        const Nx = Math.cos(acam), Ny = Math.sin(acam), Tx = Ny, Ty = -Nx;
        const rx = wx - xf.cx, ry = wy - xf.cy, px = rx * Tx + ry * Ty, ph = rx * Nx + ry * Ny + g.a;
        camHp += (clamp(ph, -0.3, 3) - camHp) * (1 - Math.exp(-7 * dt));
        const ch = -g.a + (narrow ? 1.9 : 1.55) + 0.42 * camHp, chx = px * 0.6;
        cam.position.set(xf.cx + Tx * chx + Nx * ch, xf.cy + Ty * chx + Ny * ch, wz + (narrow ? 3.3 : 2.9));
        const th = -g.a + 0.55 + 0.3 * camHp, thx = px * 0.45;
        LOOK.set(xf.cx + Tx * thx + Nx * th, xf.cy + Ty * thx + Ny * th, wz - 7);
        cam.up.set(Nx, Ny, 0);
        cam.lookAt(LOOK);
        sky.position.copy(cam.position);

        rn.position.set(wx, wy, wz);
        rn.rotation.set(0, 0, arun - Math.PI / 2);
        const frozen = state === 'pause' || state === 'over';
        if (!frozen) {
          const k = 1 - Math.exp(-14 * dt);
          if (st.ground) {
            phase += dt * st.vz * 2.4;
            const s1 = Math.sin(phase);
            legL.rotation.x = s1 * 0.95; legR.rotation.x = -s1 * 0.95;
            armL.rotation.x = -s1 * 0.8; armR.rotation.x = s1 * 0.8;
            body.position.y = Math.abs(Math.cos(phase)) * 0.035;
            body.rotation.y = Math.sin(phase) * 0.1;
          } else {
            body.rotation.y += (0 - body.rotation.y) * k;
            legL.rotation.x += (0.7 - legL.rotation.x) * k; legR.rotation.x += (-0.5 - legR.rotation.x) * k;
            armL.rotation.x += (-2.3 - armL.rotation.x) * k; armR.rotation.x += (-2.0 - armR.rotation.x) * k;
            body.position.y += (0 - body.position.y) * k;
          }
          body.rotation.z += (clamp(-st.vx * 0.05, -0.3, 0.3) - body.rotation.z) * k;
          body.rotation.x += ((st.ground ? -0.12 : 0.05) - body.rotation.x) * k;
          if (st.ground && !wasGround) landT = 0.2;
          wasGround = st.ground; landT = Math.max(0, landT - dt);
          const str = st.ground ? 0 : clamp(st.vh / 9, -0.6, 1) * 0.07, sqz = landT > 0 ? Math.sin(landT / 0.2 * Math.PI) * 0.12 : 0, sy = 1 + str - sqz;
          body.scale.set(0.92 * (1 - (sy - 1) * 0.5), 0.92 * sy, 0.92 * (1 - (sy - 1) * 0.5));
          const fl = st.lost ? 0.45 : !st.ground ? (st.vh > 0 ? 1 : 0.6) : 0.2;
          flame.visible = true; flame.scale.set(1, fl * (0.85 + 0.15 * Math.sin(tAll * 60)), 1);
          ant.rotation.z = -0.25 + Math.sin(tAll * 6 + phase) * 0.1 - body.rotation.z * 0.5;
          ant.rotation.x = clamp(-st.vh * 0.03, -0.35, 0.35);
          if (st.lost) {
            const fw = Math.sin(tAll * 20);
            armL.rotation.x = -2.2 + fw * 0.5; armR.rotation.x = -2.2 - fw * 0.5;
            legL.rotation.x = fw * 0.8; legR.rotation.x = -fw * 0.8;
            body.rotation.y = Math.sin(tAll * 7) * 0.5;
          }
        }
        mHG.color.setScalar(0.82 + 0.18 * Math.sin(tAll * 6));
        rn.visible = !(st.lost && lostT > 0.95);

        const half = L.w / 2, sr = Math.floor(st.dist), ty = st.lost ? 0 : typeAt(L, st, st.s, Math.floor(st.x + half), sr);
        if (ty) {
          const sy = ty === T_BOX ? 1 : ty === T_RAMP ? CFG.RAMP_H * (st.dist - sr) : 0;
          pos(g, st.s, st.x, sy + 0.012, PW);
          shdG.position.set(xf.cx + cw * PW[0] - sw * PW[1], xf.cy + sw * PW[0] + cw * PW[1], wz);
          shdG.rotation.set(0, 0, aSide - Math.PI / 2);
          shd.material.opacity = 0.55 * clamp(1 - (st.h - sy) / 2.4, 0, 1);
          shdG.visible = true;
        } else shdG.visible = false;

        updateView(cur.view, st, tAll);
        for (const b of bursts) {
          if (b.t > 0.4) { b.s.visible = false; continue; }
          b.t += dt;
          const s = 0.4 + b.t * 4.5;
          b.s.scale.set(s, s, 1); b.s.material.opacity = Math.max(0, 1 - b.t / 0.4);
        }
        texFast.offset.y = (texFast.offset.y - dt * 1.4) % 1;
        texLeft.offset.x = (texLeft.offset.x + dt * 1.2) % 1;
        texRight.offset.x = (texRight.offset.x - dt * 1.2) % 1;
        if (state === 'play' && mode === 'explore') barEl.style.transform = `scaleX(${clamp(st.dist / L.len, 0, 1).toFixed(4)})`;
        renderer.render(scene, cam);
      }

      api.loop(dt => {
        if (state === 'play' || state === 'title' || state === 'map') {
          acc += dt;
          let k = 0;
          while (acc >= CFG.DT && k < 10) {
            physTick(); acc -= CFG.DT; k++;
            if (state !== 'play' && state !== 'title' && state !== 'map') break;
          }
          if (k >= 10) acc = 0;
        }
        if (master) master.gain.value = api.muted ? 0 : 0.55;
        draw(dt);
      });

      toTitle();
      return {
        destroy() {
          try { if (ac) ac.close(); } catch (e) {   }
          dropNext();
          if (prev) dropView(prev.view);
          if (cur) dropView(cur.view);
          for (const o of disp) { try { o.dispose(); } catch (e) {   } }
        }
      };
    }
  };
  Ameplay.register(GAME);
  Ameplay.covers['tunnel-run'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tnr-v" cx=".5" cy=".39" r=".6"><stop offset="0" stop-color="#000" stop-opacity=".9"/><stop offset=".25" stop-color="#000" stop-opacity="0"/></radialGradient><radialGradient id="tnr-c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c0"/><stop offset=".35" stop-color="#ffcf2e" stop-opacity=".8"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient><linearGradient id="tnr-b" x1="0" x2="1"><stop offset="0" stop-color="#9aa1ad"/><stop offset=".45" stop-color="#e6e9ef"/><stop offset="1" stop-color="#a7adb8"/></linearGradient><radialGradient id="tnr-h" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".7" stop-color="#c3c8d2"/><stop offset="1" stop-color="#8e95a1"/></radialGradient></defs><rect width="400" height="300" fill="#05060d"/><g fill="#fff" opacity=".85"><circle cx="322" cy="31" r="1"/><circle cx="200" cy="247" r="1"/><circle cx="347" cy="237" r="1"/><circle cx="363" cy="257" r="1.6"/><circle cx="288" cy="46" r="1.6"/><circle cx="379" cy="286" r="1.6"/><circle cx="31" cy="79" r="1"/><circle cx="348" cy="287" r="1"/><circle cx="79" cy="9" r="1"/><circle cx="224" cy="42" r="1"/><circle cx="192" cy="68" r="1.6"/><circle cx="18" cy="28" r="1"/><circle cx="187" cy="242" r="1"/><circle cx="204" cy="210" r="1"/><circle cx="245" cy="290" r="1"/><circle cx="385" cy="213" r="1"/><circle cx="321" cy="51" r="1.6"/><circle cx="291" cy="194" r="1"/><circle cx="218" cy="116" r="1"/><circle cx="49" cy="20" r="1.6"/><circle cx="142" cy="103" r="1"/><circle cx="256" cy="38" r="1.6"/><circle cx="1" cy="251" r="1"/><circle cx="18" cy="230" r="1"/><circle cx="161" cy="272" r="1"/><circle cx="5" cy="298" r="1"/><circle cx="257" cy="128" r="1.6"/><circle cx="69" cy="227" r="1"/><circle cx="100" cy="257" r="1"/><circle cx="127" cy="138" r="1"/><circle cx="101" cy="264" r="1"/><circle cx="271" cy="150" r="1"/><circle cx="328" cy="244" r="1"/><circle cx="388" cy="207" r="1"/><circle cx="285" cy="97" r="1"/><circle cx="65" cy="254" r="1"/><circle cx="326" cy="140" r="1"/><circle cx="332" cy="13" r="1"/><circle cx="78" cy="7" r="1"/><circle cx="325" cy="188" r="1"/><circle cx="346" cy="244" r="1"/><circle cx="225" cy="138" r="1"/><circle cx="215" cy="225" r="1"/><circle cx="154" cy="150" r="1"/><circle cx="281" cy="231" r="1"/><circle cx="102" cy="184" r="1"/><circle cx="375" cy="171" r="1"/><circle cx="240" cy="172" r="1"/><circle cx="228" cy="48" r="1"/><circle cx="47" cy="100" r="1"/></g><path fill="#24409b" d="M-156 313L-23 313L77 226L3 226ZM120 34L120 64L132 72L132 47Z"/><path fill="#2a5bb5" d="M-11 313L122 313L157 226L83 226Z"/><path fill="#305fcf" d="M133 313L267 313L237 226L163 226ZM423 313L556 313L397 226L323 226Z"/><path fill="#2a4eb5" d="M278 313L411 313L317 226L243 226Z"/><path fill="#2a51b5" d="M562 308L562 174L400 149L400 223ZM69 86L69 134L98 131L98 93Z"/><path fill="#3067cf" d="M562 163L562 30L400 69L400 143Z"/><path fill="#24449b" d="M562 18L562 -115L400 -11L400 63ZM215 154L239 154L234 150L213 150Z"/><path fill="#2a5eb5" d="M-162 -115L-162 18L0 63L0 -11Z"/><path fill="#2a55b5" d="M-162 30L-162 163L0 143L0 69Z"/><path fill="#3058cf" d="M-162 174L-162 308L0 223L0 149Z"/><path fill="#24489b" d="M10 222L81 222L117 191L67 191Z"/><path fill="#4a6fd5" d="M87 222L158 222L171 191L121 191Z"/><path fill="#305ecf" d="M165 222L235 222L225 191L175 191ZM393 -12L393 -83L335 -23L335 27Z"/><path fill="#4a6ad5" d="M242 222L313 222L279 191L229 191Z"/><path fill="#2a58b5" d="M319 222L390 222L333 191L283 191Z"/><path fill="#3064cf" d="M393 219L393 148L335 139L335 189Z"/><path fill="#1e3f81" d="M393 142L393 71L335 85L335 135ZM133 102L133 126L142 125L142 104Z"/><path fill="#244c9b" d="M393 65L393 -6L335 31L335 81ZM331 29L331 -19L302 12L302 49ZM280 160L280 131L268 129L268 154Z"/><path fill="#2a4bb5" d="M7 -83L7 -12L65 27L65 -23ZM100 -26L100 11L118 30L118 0ZM217 161L247 161L240 155L215 155Z"/><path fill="#1e4081" d="M7 -6L7 65L65 81L65 31ZM280 64L280 34L268 47L268 72ZM247 1L217 1L215 19L240 19ZM215 1L185 1L187 19L213 19ZM134 154L159 154L164 150L143 150Z"/><path fill="#2a54b5" d="M7 71L7 142L65 135L65 85ZM69 138L69 187L98 171L98 134Z"/><path fill="#244e9b" d="M7 148L7 219L65 189L65 139ZM212 149L234 149L230 146L211 146Z"/><path fill="#4a7ed5" d="M281 189L329 189L300 173L263 173Z"/><path fill="#244b9b" d="M331 187L331 138L302 134L302 171ZM300 130L300 94L282 98L282 128Z"/><path fill="#2a4ab5" d="M331 134L331 86L302 93L302 131ZM249 161L279 161L267 155L242 155Z"/><path fill="#244f9b" d="M331 82L331 33L302 53L302 90ZM121 161L151 161L158 155L133 155Z"/><path fill="#24499b" d="M331 -23L331 -72L302 -29L302 9Z"/><path fill="#24479b" d="M69 -72L69 -23L98 9L98 -29Z"/><path fill="#2a5ab5" d="M69 -19L69 29L98 49L98 12ZM100 134L100 170L118 161L118 131Z"/><path fill="#3061cf" d="M69 33L69 82L98 90L98 53Z"/><path fill="#2a50b5" d="M102 172L139 172L150 162L120 162Z"/><path fill="#3063cf" d="M261 172L298 172L280 162L250 162Z"/><path fill="#244d9b" d="M300 170L300 134L282 131L282 161Z"/><path fill="#1e3e81" d="M300 11L300 -26L282 0L282 30ZM212 20L188 20L189 33L211 33Z"/><path fill="#1e3781" d="M100 14L100 51L118 63L118 33Z"/><path fill="#1e3d81" d="M100 54L100 91L118 96L118 66ZM266 20L241 20L236 33L257 33ZM133 128L133 153L142 149L142 127Z"/><path fill="#1e4381" d="M100 94L100 130L118 128L118 98Z"/><path fill="#24469b" d="M153 161L183 161L185 155L160 155Z"/><path fill="#1e3581" d="M185 161L215 161L213 155L187 155ZM258 125L258 104L251 106L251 124ZM142 104L142 125L149 124L149 106Z"/><path fill="#183367" d="M280 128L280 98L268 101L268 126ZM142 35L142 56L149 63L149 44Z"/><path fill="#183767" d="M280 96L280 66L268 74L268 99Z"/><path fill="#1e3c81" d="M279 1L249 1L242 19L267 19Z"/><path fill="#182b67" d="M183 1L153 1L160 19L185 19ZM120 66L120 96L132 99L132 74ZM231 145L250 145L245 143L228 143Z"/><path fill="#183067" d="M151 1L121 1L133 19L158 19ZM258 56L258 35L251 44L251 63ZM257 34L236 34L232 43L250 43Z"/><path fill="#182a67" d="M120 2L120 32L132 45L132 20ZM120 98L120 128L132 126L132 101ZM267 153L267 128L258 127L258 149ZM251 84L251 65L246 70L246 87ZM149 65L149 84L154 87L154 70ZM155 125L155 142L159 139L159 124Z"/><path fill="#1e3981" d="M120 131L120 160L132 154L132 129ZM142 127L142 148L149 145L149 126Z"/><path fill="#1e3b81" d="M161 154L185 154L187 150L166 150ZM159 20L134 20L143 33L164 33Z"/><path fill="#182c67" d="M188 154L212 154L211 150L189 150Z"/><path fill="#1e4481" d="M241 154L266 154L257 150L236 150ZM150 145L169 145L172 143L155 143Z"/><path fill="#182d67" d="M267 126L267 102L258 104L258 125ZM239 20L215 20L213 33L234 33Z"/><path fill="#24519b" d="M267 99L267 75L258 80L258 102Z"/><path fill="#1e3681" d="M267 73L267 48L258 57L258 79ZM189 149L211 149L209 146L191 146Z"/><path fill="#243f9b" d="M267 46L267 21L258 34L258 55Z"/><path fill="#183167" d="M185 20L161 20L166 33L187 33ZM142 58L142 79L149 83L149 65ZM209 44L191 44L192 52L208 52Z"/><path fill="#182e67" d="M133 75L133 99L142 102L142 80Z"/><path fill="#183267" d="M143 149L164 149L168 146L150 146ZM234 34L212 34L211 43L230 43Z"/><path fill="#243e9b" d="M166 149L188 149L189 146L170 146Z"/><path fill="#1e4281" d="M236 149L257 149L250 146L232 146Z"/><path fill="#182f67" d="M258 148L258 127L251 126L251 145Z"/><path fill="#183467" d="M258 102L258 81L251 85L251 104ZM258 79L258 58L251 65L251 83Z"/><path fill="#183667" d="M211 34L189 34L191 43L209 43ZM210 142L226 142L224 140L209 140Z"/><path fill="#12244d" d="M188 34L166 34L170 43L189 43ZM230 44L211 44L210 52L227 52ZM192 142L208 142L208 140L192 140ZM190 52L174 52L176 58L191 58ZM155 107L155 124L159 123L159 108Z"/><path fill="#12224d" d="M164 34L143 34L150 43L168 43ZM250 44L231 44L228 52L245 52ZM172 52L156 52L160 58L175 58ZM193 140L207 140L207 138L193 138ZM241 107L241 92L237 94L237 108ZM193 138L207 138L206 136L194 136Z"/><path fill="#12214d" d="M142 81L142 102L149 104L149 85ZM189 44L170 44L173 52L190 52ZM245 87L245 71L241 75L241 90ZM244 52L228 52L225 58L240 58ZM209 140L224 140L222 138L208 138ZM241 123L241 108L237 109L237 123ZM175 59L160 59L163 64L177 64Z"/><path fill="#1e3a81" d="M170 145L189 145L190 143L173 143Z"/><path fill="#12284d" d="M251 145L251 126L246 125L246 142ZM251 124L251 106L246 107L246 124ZM251 63L251 45L246 52L246 69ZM156 142L172 142L175 140L160 140ZM245 124L245 107L241 108L241 123ZM160 140L175 140L177 138L163 138ZM241 139L241 124L237 124L237 138ZM159 76L159 91L163 93L163 79Z"/><path fill="#12294d" d="M251 104L251 85L246 89L246 105Z"/><path fill="#12254d" d="M169 44L150 44L155 52L172 52Z"/><path fill="#12274d" d="M149 45L149 63L154 69L154 52Z"/><path fill="#12204d" d="M149 85L149 104L154 105L154 89ZM245 106L245 89L241 92L241 107ZM245 69L245 53L241 59L241 74ZM155 71L155 87L159 90L159 75ZM176 140L191 140L192 138L178 138Z"/><path fill="#183567" d="M149 106L149 124L154 124L154 107Z"/><path fill="#12234d" d="M149 126L149 145L154 142L154 125ZM174 142L190 142L191 140L176 140ZM226 52L210 52L209 58L224 58ZM155 53L155 69L159 74L159 59ZM241 74L241 59L237 64L237 78Z"/><path fill="#12264d" d="M228 142L244 142L240 140L225 140ZM240 59L225 59L223 64L237 64Z"/><path fill="#0c1b34" d="M245 142L245 125L241 124L241 139ZM159 124L159 139L163 138L163 124ZM223 138L236 138L234 136L221 136ZM222 64L208 64L207 68L220 68ZM163 94L163 108L166 109L166 96Z"/><path fill="#0c1934" d="M208 52L192 52L192 58L208 58ZM163 109L163 123L166 122L166 110Z"/><path fill="#121f4d" d="M155 89L155 106L159 107L159 92Z"/><path fill="#0c1a34" d="M225 140L240 140L237 138L223 138ZM207 59L193 59L193 64L207 64ZM191 59L176 59L178 64L192 64ZM159 108L159 123L163 123L163 109ZM178 138L192 138L193 136L180 136ZM208 138L222 138L220 136L207 136ZM237 123L237 109L234 110L234 122ZM163 79L163 93L166 95L166 82Z"/><path fill="#0c1834" d="M241 91L241 76L237 79L237 93ZM224 59L209 59L208 64L222 64ZM237 93L237 79L234 82L234 95Z"/><path fill="#0c1734" d="M159 59L159 74L163 78L163 64ZM237 137L237 124L234 123L234 136ZM237 108L237 94L234 96L234 109ZM163 65L163 78L166 81L166 69ZM163 124L163 137L166 136L166 123Z"/><path fill="#0c1534" d="M159 92L159 107L163 108L163 94ZM164 138L177 138L179 136L166 136Z"/><path fill="#0c1634" d="M237 78L237 65L234 69L234 81ZM236 64L223 64L221 68L234 68Z"/><path fill="#060c1a" d="M207 64L193 64L194 68L206 68ZM192 64L178 64L180 68L193 68Z"/><path fill="#060d1a" d="M177 64L164 64L166 68L179 68Z"/><rect width="400" height="300" fill="url(#tnr-v)"/><circle cx="160" cy="150" r="24" fill="url(#tnr-c)"/><rect x="155" y="141" width="10" height="18" rx="3" fill="#ffd23f"/><rect x="157" y="138" width="6" height="4" rx="1" fill="#fff6d0"/><g><ellipse cx="200" cy="292" rx="38" ry="9" fill="#000" opacity=".35"/><path d="M188 238l-14 30l-6 18" stroke="#8e95a1" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M211 238l10 26l14 10" stroke="#a7adb8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M186 214l-20 -16" stroke="#a7adb8" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M214 214l18 12" stroke="#a7adb8" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="186" y="200" width="28" height="44" rx="12" fill="url(#tnr-b)"/><path d="M206 172l9 -28" stroke="#8e95a1" stroke-width="4" stroke-linecap="round"/><circle cx="216" cy="141" r="10" fill="#7dffd8" opacity=".35"/><circle cx="216" cy="141" r="5.5" fill="#7dffd8"/><ellipse cx="200" cy="181" rx="27" ry="29" fill="url(#tnr-h)"/></g></svg>`;
})();

