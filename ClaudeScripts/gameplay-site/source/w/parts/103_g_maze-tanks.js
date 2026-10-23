
(() => {
  'use strict';
  const ID = 'maze-tanks';
  const CFG = {
    fps: 25, cell: 50, wallHalf: 3,
    mazeW: [4, 12], mazeH: [4, 10], mazeWp: [4, 8], mazeHp: [4, 9],
    tankScale: 0.275, fwd: 4, back: 2.5, turn: 10, moveSteps: 5, muzzle: 50 * 4.5 / 16,
    bullet: { speed: 4.5, sub: 7, life: 250, max: 5, r: 3.5 },
    gatling: { speed: 5.5, sub: 7, life: 125, count: 20, deadly: 2, spin: 10, every: 3, spread: 5.5, r: 2.2 },
    laser: { speed: 70, life: 8, deadly: 7, aimer: 200 },
    frag: { speed: 4.5, sub: 7, life: 250, pieces: 40, r: 5.5 },
    ray: { warm: 9, life: 30, step: 50 / 16, minR: 650 },
    homing: { speed: 4.5, sub: 5, life: 250, startup: 50, acc: 0.12 },
    remote: { speed: 4.5, sub: 5, life: 250, turn: 15 },
    mine: { speed: 5.5, sub: 4, deadly: 20, count: 3, fuse: 6 },
    crate: { base: 350, rand: 200, mazeScale: 2000, max: 3 },
    round: { end: 125, frozen: 50, reset: 5 },
    shake: 8, netDelay: 2.5
  };
  const CELL = CFG.cell, WT = CFG.wallHalf, DEG = Math.PI / 180, TK = CFG.tankScale, STEP = 1 / CFG.fps;
  const BW = 30.5 * TK, BH = 40.5 * TK, BRW = 8.5 * TK, BRT = 55 * TK, TPW = 45 * TK, TPH = 77.5 * TK;
  const HPF = [[-BW, -BH], [-BW / 2, -BH], [BW / 2, -BH], [BW, -BH], [-TPW / 6, -TPH / 16 * 11], [TPW / 6, -TPH / 16 * 11]];
  const HPR = [[-BW, BH], [-BW / 2, BH], [0, BH], [BW / 2, BH], [BW, BH]];
  const HPA = HPF.concat(HPR);
  for (const k of [-2, -1, 0, 1, 2]) HPA.push([BW, k * BH / 3], [-BW, k * BH / 3]);
  const WEAPONS = ['laser', 'gatling', 'frag', 'deathRay', 'homing', 'remote', 'mine'];
  const WN = ['bullet'].concat(WEAPONS), WI = {};
  WN.forEach((w, i) => { WI[w] = i; });
  const SK = ['b', 'g', 'f', 'x', 'h', 'r'];
  const TCOL = [
    { name: 'Green', base: '#4a9c3a', top: '#66bb52', dark: '#2c5e22' },
    { name: 'Red', base: '#c9382b', top: '#e5553f', dark: '#7b2018' },
    { name: 'Blue', base: '#3264c8', top: '#4f86e8', dark: '#1d3c7e' },
    { name: 'Yellow', base: '#d39a12', top: '#f0b92e', dark: '#7f5a06' },
    { name: 'Purple', base: '#7d45c2', top: '#9a63e0', dark: '#4a2478' },
    { name: 'Orange', base: '#e0701c', top: '#f78d3a', dark: '#87400c' },
    { name: 'Cyan', base: '#1f9fae', top: '#3cc2d0', dark: '#105f69' },
    { name: 'Pink', base: '#d64f94', top: '#ef74b1', dark: '#7f2556' }
  ];
  const nrm = a => { a %= 360; if (a > 180) a -= 360; else if (a <= -180) a += 360; return a; };
  const sx = r => Math.sin(r * DEG), sy = r => -Math.cos(r * DEG);
  const angTo = (x0, y0, x1, y1) => Math.atan2(x1 - x0, y0 - y1) / DEG;

  let mazeId = 0;
  function Maze(W, H, hw, vw) {
    const m = { id: ++mazeId, W, H, N: W * H, hw, vw };
    m.wall = (x, y) => {
      if (x < -WT || y < -WT || x > W * CELL + WT || y > H * CELL + WT) return true;
      const j = Math.round(y / CELL);
      if (Math.abs(y - j * CELL) <= WT) {
        const i0 = Math.max(0, Math.floor((x - WT) / CELL)), i1 = Math.min(W - 1, Math.floor((x + WT) / CELL));
        for (let i = i0; i <= i1; i++) if (hw[j * W + i]) return true;
      }
      const i = Math.round(x / CELL);
      if (Math.abs(x - i * CELL) <= WT) {
        const j0 = Math.max(0, Math.floor((y - WT) / CELL)), j1 = Math.min(H - 1, Math.floor((y + WT) / CELL));
        for (let k = j0; k <= j1; k++) if (vw[i * H + k]) return true;
      }
      return false;
    };
    m.nb = (c, o) => {
      const x = c % W, y = (c / W) | 0;
      let n = 0;
      if (x > 0 && !vw[x * H + y]) o[n++] = c - 1;
      if (x < W - 1 && !vw[(x + 1) * H + y]) o[n++] = c + 1;
      if (y > 0 && !hw[y * W + x]) o[n++] = c - W;
      if (y < H - 1 && !hw[(y + 1) * W + x]) o[n++] = c + W;
      return n;
    };
    m.cell = (x, y) => Math.min(W - 1, Math.max(0, Math.floor(x / CELL))) + Math.min(H - 1, Math.max(0, Math.floor(y / CELL))) * W;
    return m;
  }
  function genMaze(W, H, R) {
    const t = new Uint8Array((W + 1) * (H + 1));
    for (let i = 0; i < t.length; i++) t[i] = R(4);
    const T = (x, y) => t[x * (H + 1) + y], hw = new Uint8Array(W * (H + 1)), vw = new Uint8Array((W + 1) * H);
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      if (T(x, y + 1) === 2 || T(x + 1, y + 1) === 0) hw[(y + 1) * W + x] = 1;
      if (T(x, y) === 1 || T(x, y + 1) === 3) vw[x * H + y] = 1;
    }
    for (let x = 0; x < W; x++) hw[x] = hw[H * W + x] = 1;
    for (let y = 0; y < H; y++) vw[y] = vw[W * H + y] = 1;
    return Maze(W, H, hw, vw);
  }
  function bfs(m, s) {
    const d = new Int16Array(m.N).fill(-1), q = new Int16Array(m.N), nb = [0, 0, 0, 0];
    d[s] = 0; q[0] = s;
    let h = 0, t = 1;
    while (h < t) {
      const c = q[h++], n = m.nb(c, nb);
      for (let i = 0; i < n; i++) { const x = nb[i]; if (d[x] < 0) { d[x] = d[c] + 1; q[t++] = x; } }
    }
    return d;
  }
  function inTank(t, x, y, pad) {
    const c = Math.cos(t.rot * DEG), s = Math.sin(t.rot * DEG), ex = x - t.x, ey = y - t.y;
    const lx = ex * c + ey * s, ly = -ex * s + ey * c;
    if (lx >= -BW - pad && lx <= BW + pad && ly >= -BH - pad && ly <= BH + pad) return true;
    return lx >= -BRW - pad && lx <= BRW + pad && ly >= -BRT - pad && ly < -BH;
  }
  function inBase(t, x, y, pad) {
    const c = Math.cos(t.rot * DEG), s = Math.sin(t.rot * DEG), ex = x - t.x, ey = y - t.y;
    const lx = ex * c + ey * s, ly = -ex * s + ey * c;
    return Math.abs(lx) <= BW + pad && Math.abs(ly) <= BH + pad;
  }
  function hitPts(m, t, P) {
    const c = Math.cos(t.rot * DEG), s = Math.sin(t.rot * DEG);
    for (let i = 0; i < P.length; i++) { const lx = P[i][0], ly = P[i][1]; if (m.wall(t.x + lx * c - ly * s, t.y + lx * s + ly * c)) return true; }
    return false;
  }
  function moveTank(m, t, f, b, l, r) {
    const ST = CFG.moveSteps, ms = ((f ? CFG.fwd : 0) - (b ? CFG.back : 0)) / ST, ts = ((r ? 1 : 0) - (l ? 1 : 0)) * CFG.turn / ST;
    if (!ms && !ts) return false;
    const ox = t.x, oy = t.y, or = t.rot;
    let hit = false;
    for (let i = 0; i < ST; i++) { t.rot = nrm(t.rot + ts); t.x += sx(t.rot) * ms; t.y += sy(t.rot) * ms; }
    if (hitPts(m, t, HPA)) {
      t.x = ox; t.y = oy; t.rot = or;
      for (let i = 0; i < ST; i++) {
        if (ts) { const pr = t.rot; t.rot = nrm(t.rot + ts); if (hitPts(m, t, HPA)) { t.rot = pr; hit = true; } }
        if (ms) {
          const px = t.x, py = t.y;
          t.x += sx(t.rot) * ms; t.y += sy(t.rot) * ms;
          if (hitPts(m, t, ms > 0 ? HPF : HPR)) { t.x = px; t.y = py; hit = true; }
        }
      }
    }
    const off = (360 + t.rot) % CFG.turn;
    if (!hit && ts && off > 1e-7 && off < CFG.turn - 1e-7) t.rot = nrm(off < CFG.turn / 2 ? t.rot - off : t.rot + CFG.turn - off);
    return hit;
  }
  function bounce(m, p) {
    const px = p.x, py = p.y;
    p.x += p.vx; p.y += p.vy;
    if (!m.wall(p.x, p.y)) return false;
    const hx = m.wall(px - p.vx, py + p.vy), hy = m.wall(px + p.vx, py - p.vy);
    if (hx && !hy) p.vy = -p.vy; else if (hy && !hx) p.vx = -p.vx; else { p.vx = -p.vx; p.vy = -p.vy; }
    p.x = px + p.vx; p.y = py + p.vy;
    return true;
  }
  function trimPoly(v, hx, hy, d) {
    const p = v.concat([hx, hy]);
    if (d <= 0) return p;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const L = Math.hypot(p[i + 2] - p[i], p[i + 3] - p[i + 1]);
      if (d < L) { const k = d / L; return [p[i] + (p[i + 2] - p[i]) * k, p[i + 1] + (p[i + 3] - p[i + 1]) * k].concat(p.slice(i + 2)); }
      d -= L;
    }
    return [];
  }
  function headingCtl(c, cur, a, mv, rv) {
    let tg = nrm(Math.round(a / 10) * 10), d = nrm(tg - cur), rev = false;
    if (rv && Math.abs(d) > (rv === 2 ? 90 : 135)) { rev = true; tg = nrm(tg + 180); d = nrm(tg - cur); }
    if (d > .5) c.r = 1; else if (d < -.5) c.l = 1;
    if (mv && Math.abs(d) < 45) { if (rev) c.b = 1; else c.f = 1; }
  }
  function applyIntent(t, it) {
    const c = t.ctl;
    c.f = c.b = c.l = c.r = 0; c.fire = it && it.fire ? 1 : 0;
    if (!it) return;
    const e = t.remote || t, cur = t.remote ? t.remote.a : t.rot;
    if (it.tx != null) {
      const d = Math.hypot(it.tx - e.x, it.ty - e.y);
      headingCtl(c, cur, angTo(e.x, e.y, it.tx, it.ty), d > it.m1, d < it.m2 ? 2 : 0);
    } else if (it.a != null) headingCtl(c, cur, it.a, it.mv, it.rv);
    else { c.f = it.k & 1; c.b = (it.k >> 1) & 1; c.l = (it.k >> 2) & 1; c.r = (it.k >> 3) & 1; }
  }

  function makeSim(o) {
    const rnd = o.rnd || Math.random, R = n => Math.floor(rnd() * n);
    const S = {
      n: o.n, target: o.target || 0, portrait: !!o.portrait, tick: 0, round: 0, scores: new Array(o.n).fill(0),
      tanks: [], shots: [], mines: [], beams: [], rays: [], crates: [], ev: [], m: null, dist: null, reach: [], used: null,
      frozen: false, blank: false, over: false, end: -1, reset: -1, aliveN: 0, crateT: CFG.crate.base + R(CFG.crate.rand),
      nid: 1, bots: [], ctl: null, bn: 0, weapons: o.weapons || WEAPONS, kills: new Array(o.n).fill(0)
    };
    const NB = [0, 0, 0, 0], ev = (...a) => S.ev.push(a);
    S.pd = (a, b) => { const d = S.dist[b]; return d && d[a] >= 0 ? d[a] : 99; };
    S.next = (a, b) => {
      const d = S.dist[b];
      if (!d || d[a] <= 0) return a;
      const n = S.m.nb(a, NB);
      for (let i = 0; i < n; i++) if (d[NB[i]] === d[a] - 1) return NB[i];
      return a;
    };
    const mkTank = (i, c, rot) => {
      const x = (c % S.m.W + .5) * CELL, y = (((c / S.m.W) | 0) + .5) * CELL;
      return { i, x, y, rot, px: x, py: y, prot: rot, alive: true, w: 'bullet', bf: 0, trig: true, ctl: { f: 0, b: 0, l: 0, r: 0, fire: 0 }, laserReady: true, rayReady: true, homingReady: true, frag: null, gat: null, remote: null, mines: 0 };
    };
    const ready = S.ready = t => {
      switch (t.w) {
        case 'bullet': return t.bf < CFG.bullet.max;
        case 'laser': return t.laserReady;
        case 'gatling': return !t.gat;
        case 'homing': return t.homingReady;
        case 'remote': return !t.remote;
        case 'deathRay': return t.rayReady;
        default: return true;
      }
    };
    const locked = S.locked = t => (t.w === 'laser' && !t.laserReady) || (t.w === 'deathRay' && !t.rayReady) || (t.w === 'remote' && !!t.remote);
    const setW = (t, w) => { t.w = w; t.laserReady = t.rayReady = t.homingReady = true; t.mines = 0; };
    S.setW = setW;
    const addShot = (k, t, x, y, a, speed, sub, life, deadly) => {
      const s = { id: S.nid++, k, o: t, x, y, px: x, py: y, vx: sx(a) * speed / sub, vy: sy(a) * speed / sub, sub, life, deadly, a, bc: 0 };
      S.shots.push(s);
      return s;
    };
    const fire = t => {
      const a = t.rot, mx = t.x + sx(a) * CFG.muzzle, my = t.y + sy(a) * CFG.muzzle, B = CFG.bullet, F = CFG.frag, G = CFG.gatling, H = CFG.homing, RM = CFG.remote, MN = CFG.mine;
      switch (t.w) {
        case 'bullet': addShot('b', t, mx, my, a, B.speed, B.sub, B.life, 0); t.bf++; ev('shot', mx, my, 'b'); break;
        case 'laser': S.beams.push({ o: t, x: mx, y: my, vx: sx(a), vy: sy(a), v: [mx, my], life: CFG.laser.life, deadly: CFG.laser.deadly, on: true, len: 0, tail: 0, draw: [mx, my, mx, my] }); t.laserReady = false; ev('laser', mx, my); break;
        case 'frag': if (t.frag) det(t.frag); else { t.frag = addShot('f', t, mx, my, a, F.speed, F.sub, F.life, 0); ev('shot', mx, my, 'f'); } break;
        case 'gatling': t.gat = { spin: 0, fc: 0, left: G.count, on: true }; ev('gat', 1); break;
        case 'deathRay': S.rays.push({ o: t, x: mx, y: my, a, warm: CFG.ray.warm, life: CFG.ray.life, on: false, thick: 0, ball: 0, pts: null }); t.rayReady = false; ev('charge', mx, my); break;
        case 'homing': { const s = addShot('h', t, mx, my, a, H.speed, H.sub, H.life, 0); s.st = H.startup; s.hm = false; t.homingReady = false; ev('shot', mx, my, 'h'); break; }
        case 'remote': t.remote = addShot('r', t, mx, my, a, RM.speed, RM.sub, RM.life, 0); ev('shot', mx, my, 'r'); break;
        case 'mine':
          S.mines.push({ id: S.nid++, o: t, x: t.x, y: t.y, px: t.x, py: t.y, vx: -sx(a) * MN.speed / MN.sub, vy: -sy(a) * MN.speed / MN.sub, deadly: MN.deadly, landed: false, armed: false, det: false, fuse: MN.fuse });
          ev('shot', t.x, t.y, 'm');
          if (++t.mines >= MN.count) setW(t, 'bullet');
          break;
      }
    };
    S.tryFire = t => {
      if (S.frozen || S.blank || S.over || !t || !t.alive || locked(t)) return;
      if (t.trig && ready(t)) { t.trig = false; fire(t); }
    };
    const kill = (t, by) => {
      if (!t.alive) return;
      t.alive = false; S.aliveN--; S.end = CFG.round.end;
      if (by && by !== t) S.kills[by.i]++;
      ev('boom', Math.round(t.x), Math.round(t.y), t.i, by ? by.i : -1);
    };
    S.gone = new Set();
    S.drop = i => { S.gone.add(i); const t = S.tanks && S.tanks[i]; if (t && t.alive) kill(t, null); };
    const burst = (x, y, o) => {
      const F = CFG.frag;
      for (let i = 0; i < F.pieces; i++) {
        const a = R(360), sp = (F.speed - rnd() * F.speed + 4) / F.sub;
        S.shots.push({ id: S.nid++, k: 'x', o, x, y, px: x, py: y, vx: sx(a) * sp, vy: sy(a) * sp, sub: F.sub, fade: 0, a: R(360), rs: (25 + R(25)) * (rnd() < .5 ? -1 : 1) });
      }
      ev('frag', Math.round(x), Math.round(y));
    };
    const det = s => {
      if (s.dead) return;
      s.dead = true;
      const t = s.o;
      t.frag = null; setW(t, 'bullet');
      burst(s.x, s.y, t);
    };
    const endMissile = s => {
      s.dead = true;
      const t = s.o;
      if (s.k === 'h') { t.homingReady = true; if (t.w === 'homing') setW(t, 'bullet'); }
      else { t.remote = null; if (t.w === 'remote') setW(t, 'bullet'); }
    };
    const hitTanks = (s, pad) => {
      for (const t of S.tanks) if (t.alive && inTank(t, s.x, s.y, pad)) { kill(t, s.o); return true; }
      return false;
    };
    const upd = s => {
      const m = S.m;
      switch (s.k) {
        case 'b': case 'g':
          for (let k = 0; k < s.sub; k++) if (bounce(m, s)) { S.bn++; s.bc++; }
          if (s.deadly === 0 && hitTanks(s, 0)) { if (s.k === 'b') s.o.bf--; s.dead = true; return; }
          if (s.deadly > 0) s.deadly--;
          if (--s.life <= 0) { if (s.k === 'b') s.o.bf--; s.dead = true; ev('poof', Math.round(s.x), Math.round(s.y), s.k === 'g' ? 1 : 0); }
          return;
        case 'f':
          if (!s.o.alive) { det(s); return; }
          for (let k = 0; k < s.sub; k++) if (bounce(m, s)) { S.bn++; s.bc++; }
          if (hitTanks(s, 0)) { det(s); return; }
          if (--s.life <= 0) det(s);
          return;
        case 'x':
          if (s.fade) { if (--s.fade <= 0) s.dead = true; return; }
          s.a += s.rs;
          for (let k = 0; k < s.sub; k++) { s.x += s.vx; s.y += s.vy; if (m.wall(s.x, s.y)) { s.fade = 20; S.bn++; break; } }
          if (hitTanks(s, 0)) s.dead = true;
          return;
        case 'h': {
          const H = CFG.homing;
          if (s.hm) {
            const mc = m.cell(s.x, s.y);
            let best = 1e9, tg = null;
            for (const t of S.tanks) if (t.alive) { const d = S.pd(mc, m.cell(t.x, t.y)); if (d < best || (d === best && t !== s.o)) { best = d; tg = t; } }
            if (!tg) s.hm = false;
            else {
              if (tg !== s.tg) { s.tg = tg; ev('lock', tg.i); }
              let ax = tg.x, ay = tg.y;
              if (best > 0) { const nc = S.next(mc, m.cell(tg.x, tg.y)); ax = (nc % m.W + .5) * CELL; ay = (((nc / m.W) | 0) + .5) * CELL; }
              const acc = H.acc / H.sub, cap = H.speed / H.sub;
              for (let k = 0; k < H.sub; k++) {
                if (bounce(m, s)) S.bn++;
                s.vx += ax < s.x ? -acc : acc; s.vy += ay < s.y ? -acc : acc;
                const v = Math.hypot(s.vx, s.vy);
                if (v > cap) { s.vx *= cap / v; s.vy *= cap / v; }
              }
            }
          } else for (let k = 0; k < H.sub; k++) if (bounce(m, s)) S.bn++;
          s.a = Math.atan2(s.vx, -s.vy) / DEG;
          if (hitTanks(s, 1)) { ev('hit', Math.round(s.x), Math.round(s.y)); endMissile(s); return; }
          if (s.st >= 0) s.st--;
          if (s.st === 0) s.hm = true;
          if (--s.life <= 0) { ev('poof', Math.round(s.x), Math.round(s.y), 0); endMissile(s); }
          return;
        }
        case 'r': {
          const RM = CFG.remote;
          if (s.o.alive) { const c = s.o.ctl; s.a = nrm(s.a + ((c.r ? 1 : 0) - (c.l ? 1 : 0)) * RM.turn); }
          const sp = RM.speed / RM.sub;
          s.vx = sx(s.a) * sp; s.vy = sy(s.a) * sp;
          for (let k = 0; k < RM.sub; k++) if (bounce(m, s)) { s.a = Math.atan2(s.vx, -s.vy) / DEG; S.bn++; }
          if (hitTanks(s, 1)) { ev('hit', Math.round(s.x), Math.round(s.y)); endMissile(s); return; }
          if (--s.life <= 0) { ev('poof', Math.round(s.x), Math.round(s.y), 0); endMissile(s); }
          return;
        }
      }
    };
    const updBeam = b => {
      if (b.on) {
        for (let j = 0; j < CFG.laser.speed; j++) {
          const px = b.x, py = b.y;
          if (bounce(S.m, b)) b.v.push(px, py);
          b.len++;
          if (b.deadly > 0) b.deadly--;
          if (b.deadly === 0) {
            let hit = false;
            for (const t of S.tanks) if (t.alive && inTank(t, b.x, b.y, 0)) { kill(t, b.o); hit = true; break; }
            if (hit) { b.life = 1; break; }
          }
        }
        if (--b.life === 0) { b.on = false; b.o.laserReady = true; if (b.o.w === 'laser') setW(b.o, 'bullet'); }
      } else { b.tail += CFG.laser.speed; if (b.tail >= b.len) b.dead = true; }
      b.draw = trimPoly(b.v, b.x, b.y, b.tail);
    };
    const rayTarget = (o, x, y, vx, vy) => {
      let best = null, bd = 1e30;
      for (const t of S.tanks) if (t !== o && t.alive) {
        const ex = t.x - x, ey = t.y - y;
        if (vx * ex + vy * ey > 0) { const d = ex * ex + ey * ey; if (d <= bd) { bd = d; best = t; } }
      }
      return best;
    };
    const rayPath = r => {
      const m = S.m, sp = CFG.ray.step, Wd = m.W * CELL, Hd = m.H * CELL, lim = WT;
      let x = r.x, y = r.y, vx = sx(r.a) * sp, vy = sy(r.a) * sp, tg = rayTarget(r.o, x, y, vx, vy);
      const pts = [x, y];
      for (let i = 0; i < 3000 && x >= -lim && y >= -lim && x <= Wd + lim && y <= Hd + lim; i++) {
        if (tg) {
          const ex = tg.x - x, ey = tg.y - y;
          if (vx * ex + vy * ey <= 0) tg = rayTarget(r.o, x, y, vx, vy);
          else {
            const cr = vx * ey - vy * ex;
            if (Math.abs(cr) > 1e-6) {
              const ne = (-vy * ex + vx * ey) / sp, Rr = Math.max(CFG.ray.minR, (ex * ex + ey * ey) / (2 * Math.abs(ne)));
              const ang = sp / Rr * (cr > 0 ? 1 : -1), c = Math.cos(ang), s = Math.sin(ang), nvx = vx * c - vy * s;
              vy = vx * s + vy * c; vx = nvx;
            }
          }
        }
        x += vx; y += vy; pts.push(x, y);
      }
      return pts;
    };
    const updRay = r => {
      const t = r.o;
      if (!t.alive) { r.dead = true; return; }
      if (r.warm > 0) { r.ball += .75; r.warm--; }
      if (r.warm === 0) { r.pts = rayPath(r); r.on = true; r.warm = -1; ev('ray', Math.round(r.x), Math.round(r.y)); }
      if (r.on) {
        r.ball = Math.max(0, r.ball - 5); r.thick = Math.min(5, r.thick + 1);
        const P = r.pts, pad = r.thick / 2;
        for (const e of S.tanks) if (e.alive && e !== t) for (let i = 0; i < P.length; i += 2) if (inTank(e, P[i], P[i + 1], pad)) { kill(e, t); break; }
        if (--r.life === 0) r.on = false;
      } else if (r.warm < 0) {
        r.thick -= 3;
        if (r.thick <= 0) { r.dead = true; t.rayReady = true; if (t.w === 'deathRay') setW(t, 'bullet'); }
      }
    };
    const updGat = t => {
      const g = t.gat, G = CFG.gatling;
      if (!t.alive) { t.gat = null; ev('gat', 0); return; }
      if (g.on && t.trig) { g.on = false; g.spin += 35; ev('gat', 0); }
      if (g.on) {
        if (g.spin < G.spin) g.spin++;
        if (g.spin === G.spin && ++g.fc % G.every === 0) {
          if (g.left > 0) {
            g.left--;
            const a = t.rot + rnd() * G.spread * 2 - G.spread, mx = t.x + sx(t.rot) * CFG.muzzle, my = t.y + sy(t.rot) * CFG.muzzle;
            addShot('g', t, mx, my, a, G.speed, G.sub, G.life, G.deadly);
            ev('shot', Math.round(mx), Math.round(my), 'g');
          } else if (g.fc % 9 === 0) ev('click');
        }
      } else {
        if (g.spin > 0) g.spin--;
        if (g.spin === 0) { t.gat = null; setW(t, 'bullet'); }
      }
    };
    const covered = (x, y) => S.tanks.some(t => t.alive && inBase(t, x, y, 5));
    const updMine = mn => {
      const MN = CFG.mine;
      if (!mn.landed) {
        for (let k = 0; k < MN.sub; k++) bounce(S.m, mn);
        mn.vx *= .75; mn.vy *= .75;
        if (Math.abs(mn.vx) < .15 && Math.abs(mn.vy) < .15) { mn.landed = true; mn.vx = mn.vy = 0; ev('mland', Math.round(mn.x), Math.round(mn.y)); }
      }
      if (mn.deadly > 0) mn.deadly--;
      if (mn.deadly === 0 && !mn.armed && covered(mn.x, mn.y)) { mn.armed = true; ev('arm'); }
      if (mn.armed && !mn.det && !covered(mn.x, mn.y)) { mn.det = true; ev('fuse'); }
      if (mn.det && --mn.fuse <= 0) { mn.dead = true; burst(mn.x, mn.y, mn.o); }
    };
    const spawnCrate = () => {
      const C = CFG.crate;
      S.crateT = C.base + R(C.rand) + C.mazeScale / S.reach.length;
      if (S.crates.length >= C.max || !S.weapons.length) return;
      for (let k = 0; k < 6; k++) {
        const c = S.reach[R(S.reach.length)];
        if (S.used[c]) continue;
        const cx = c % S.m.W, cy = (c / S.m.W) | 0;
        if (S.tanks.some(t => t.alive && Math.abs(Math.floor(t.x / CELL) - cx) + Math.abs(Math.floor(t.y / CELL) - cy) <= 1)) continue;
        S.used[c] = 1;
        S.crates.push({ c, x: (cx + .5) * CELL, y: (cy + .5) * CELL, w: S.weapons[R(S.weapons.length)], s: 0, vs: 2 / 15, landed: false, rot: Math.round(rnd() * 90 - 45) });
        ev('crate');
        return;
      }
    };
    const tankBox = t => {
      const c = Math.cos(t.rot * DEG), s = Math.sin(t.rot * DEG);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const [lx, ly] of [[-BW, -BRT], [BW, -BRT], [BW, BH], [-BW, BH]]) {
        const x = t.x + lx * c - ly * s, y = t.y + lx * s + ly * c;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      return [x0, y0, x1, y1];
    };
    const updCrates = () => {
      for (const cr of S.crates) {
        if (!cr.landed) {
          cr.s += cr.vs;
          if (cr.s > 1) cr.vs -= 1 / 30;
          if (cr.s < 1 && cr.vs < 0) { cr.s = 1; cr.vs = 0; cr.landed = true; ev('land', cr.x, cr.y); }
        }
        const c = Math.cos(cr.rot * DEG), s = Math.sin(cr.rot * DEG), h = 7.5 * cr.s;
        for (const t of S.tanks) {
          if (!t.alive || t.w !== 'bullet' || cr.dead) continue;
          const b = tankBox(t);
          for (const [qx, qy] of [[-h, -h], [h, -h], [h, h], [-h, h]]) {
            const x = cr.x + qx * c - qy * s, y = cr.y + qx * s + qy * c;
            if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) { setW(t, cr.w); cr.dead = true; S.used[cr.c] = 0; ev('pick', t.i, WI[cr.w]); break; }
          }
        }
      }
      S.crates = S.crates.filter(c => !c.dead);
    };
    S.newRound = () => {
      const n = S.n, [w1x, w1] = S.portrait ? CFG.mazeWp : CFG.mazeW, [h1x, h1] = S.portrait ? CFG.mazeHp : CFG.mazeH, w0 = Math.min(w1, w1x + Math.max(0, n - 3)), h0 = Math.min(h1, h1x + Math.max(0, n - 3));
      let m, d0, reach, start;
      do {
        let mw = w0 + R(w1 - w0 + 1), mh = h0 + R(h1 - h0 + 1);
        if (S.portrait ? mw > mh : mh > mw) { const t = mw; mw = mh; mh = t; }
        m = genMaze(mw, mh, R);
        start = R(m.N); d0 = bfs(m, start); reach = [];
        for (let c = 0; c < m.N; c++) if (d0[c] >= 0) reach.push(c);
      } while (reach.length < 2 * n);
      S.m = m; S.dist = [];
      for (let c = 0; c < m.N; c++) S.dist.push(d0[c] >= 0 ? bfs(m, c) : null);
      S.reach = reach; S.used = new Uint8Array(m.N);
      const cells = [start];
      while (cells.length < n) { const c = reach[R(reach.length)]; if (!cells.includes(c)) cells.push(c); }
      S.tanks = cells.map((c, i) => mkTank(i, c, nrm(R(32) * 11.25)));
      S.shots = []; S.mines = []; S.beams = []; S.rays = []; S.crates = [];
      S.aliveN = n; S.frozen = false; S.blank = false; S.end = CFG.round.end + CFG.round.frozen; S.reset = -1; S.round++;
      for (const i of S.gone) if (S.tanks[i]) { S.tanks[i].alive = false; S.aliveN--; }
      S.bots.forEach(b => b && b.reset());
      ev('round');
    };
    let TH = { tick: -1, H: 0 };
    S.threats = H => {
      if (TH.tick === S.tick && TH.H >= H) return TH;
      const f = [];
      for (let i = 0; i < H; i++) f.push([]);
      let n = 0;
      for (const s of S.shots) {
        if (s.dead || s.fade) continue;
        const p = { x: s.x, y: s.y, vx: s.vx, vy: s.vy }, mg = s.k === 'f' ? 24 : s.k === 'x' ? 2 : 4, own = s.k === 'b' || s.k === 'g';
        let bc = s.bc || 0, life = s.life == null ? 99 : s.life;
        for (let i = 0; i < H; i++) {
          let stop = false;
          for (let k = 0; k < s.sub; k++) {
            if (s.k === 'x') { p.x += p.vx; p.y += p.vy; if (S.m.wall(p.x, p.y)) { stop = true; break; } }
            else if (bounce(S.m, p)) bc++;
          }
          if (stop || --life < 0) break;
          f[i].push(p.x, p.y, mg, own && bc === 0 ? s.o.i : -1);
        }
        n++;
      }
      for (const mn of S.mines) if (mn.landed) { n++; for (let i = 0; i < H; i++) f[i].push(mn.x, mn.y, 8, -1); }
      TH = { tick: S.tick, H, f, n };
      return TH;
    };
    S.step = () => {
      S.tick++; S.bn = 0;
      for (const t of S.tanks) { t.px = t.x; t.py = t.y; t.prot = t.rot; }
      for (const s of S.shots) { s.px = s.x; s.py = s.y; }
      for (const mn of S.mines) { mn.px = mn.x; mn.py = mn.y; }
      if (S.over) return;
      if (!S.frozen && !S.blank) {
        if (--S.crateT <= 0) spawnCrate();
        for (const t of S.tanks) {
          if (S.ctl) S.ctl(t);
          const bot = S.bots[t.i];
          if (bot && t.alive) bot.think();
          if (!t.alive || locked(t)) continue;
          const c = t.ctl;
          moveTank(S.m, t, c.f, c.b, c.l, c.r);
          if (c.fire && t.trig && ready(t)) { t.trig = false; fire(t); } else if (!c.fire) t.trig = true;
        }
        for (const t of S.tanks) if (t.gat) updGat(t);
        const n0 = S.shots.length;
        for (let i = 0; i < n0; i++) if (!S.shots[i].dead) upd(S.shots[i]);
        for (const mn of S.mines) if (!mn.dead) updMine(mn);
        for (const b of S.beams) updBeam(b);
        for (const r of S.rays) if (!r.dead) updRay(r);
        S.shots = S.shots.filter(s => !s.dead);
        S.mines = S.mines.filter(s => !s.dead);
        S.beams = S.beams.filter(s => !s.dead);
        S.rays = S.rays.filter(s => !s.dead);
        updCrates();
        if (S.bn) ev('bn', S.bn);
      }
      if (S.aliveN <= 1) {
        if (S.end >= 0) S.end--;
        if (S.end === CFG.round.frozen) {
          S.frozen = true;
          for (const t of S.tanks) if (t.alive) { S.scores[t.i]++; ev('pt', t.i); }
        }
        if (S.end === 0) {
          if (S.target && S.scores.some(v => v >= S.target)) { S.over = true; ev('over'); }
          else { S.blank = true; S.reset = CFG.round.reset; }
        }
      }
      if (S.reset > 0 && --S.reset === 0) S.newRound();
    };
    return S;
  }

  function makeBot(S, idx, skill) {
    const P = [
      { every: 2, H: 12, scan: 9, cone: 6, cd: 26, look: 40, miss: .3, pad: -1, dodge: .55 },
      { every: 1, H: 20, scan: 4, cone: 18, cd: 10, look: 60, miss: .06, pad: 0, dodge: 1 },
      { every: 1, H: 26, scan: 2, cone: 18, cd: 4, look: 80, miss: 0, pad: 1, dodge: 1 }
    ][Math.max(0, Math.min(2, skill | 0))];
    const scr = { x: 0, y: 0, rot: 0 }, NB = [0, 0, 0, 0];
    let tk = 0, shot = null, scanT = 0, cool = 20, dodge = null, dodgeT = 0, stuck = 0, backT = 0, backL = 0, burstT = 0, mineT = 40, lx = 0, ly = 0, lr = 0;
    const COMBOS = [];
    for (const f of [1, 0, -1]) for (const r of [0, -1, 1]) COMBOS.push({ f: f > 0 ? 1 : 0, b: f < 0 ? 1 : 0, l: r < 0 ? 1 : 0, r: r > 0 ? 1 : 0 });
    const center = c => [(c % S.m.W + .5) * CELL, (((c / S.m.W) | 0) + .5) * CELL];
    function simShot(me, rot, foes, L, speed) {
      const sub = 7, p = { x: me.x + sx(rot) * CFG.muzzle, y: me.y + sy(rot) * CFG.muzzle, vx: sx(rot) * speed / sub, vy: sy(rot) * speed / sub };
      scr.x = me.x; scr.y = me.y; scr.rot = rot;
      let bc = false;
      for (let f = 0; f < L; f++) {
        for (let k = 0; k < sub; k++) if (bounce(S.m, p)) bc = true;
        for (const e of foes) if (inTank(e, p.x, p.y, P.pad)) return f;
        if ((bc || f > 1) && inTank(scr, p.x, p.y, 6)) return -1;
      }
      return -1;
    }
    function simLaser(me, rot, foes) {
      const p = { x: me.x + sx(rot) * CFG.muzzle, y: me.y + sy(rot) * CFG.muzzle, vx: sx(rot) * 2, vy: sy(rot) * 2 };
      scr.x = me.x; scr.y = me.y; scr.rot = rot;
      for (let i = 0; i < 280; i++) {
        bounce(S.m, p);
        for (const e of foes) if (inTank(e, p.x, p.y, 0)) return i / 35;
        if (i > 4 && inTank(scr, p.x, p.y, 3)) return -1;
      }
      return -1;
    }
    function findShot(me, foes) {
      const w = me.w, base = Math.round(me.rot / 10) * 10;
      let best = null;
      for (let k = 0; k < 36; k++) {
        const d = (k % 2 ? -1 : 1) * Math.ceil(k / 2) * 10, rot = nrm(base + d), tf = Math.abs(nrm(rot - me.rot)) / 10;
        if (tf > P.cone) continue;
        const f = w === 'laser' ? simLaser(me, rot, foes) : simShot(me, rot, foes, w === 'gatling' ? 22 : w === 'frag' ? 36 : P.look, w === 'gatling' ? CFG.gatling.speed : CFG.bullet.speed);
        if (f >= 0) { const s = f + tf * 1.5; if (!best || s < best.s) best = { rot, s }; }
      }
      if (best && Math.random() < P.miss) best.rot = nrm(best.rot + (Math.random() < .5 ? 10 : -10));
      return best;
    }
    function danger(me, c, th) {
      scr.x = me.x; scr.y = me.y; scr.rot = me.rot;
      for (let f = 0; f < th.H && f < P.H; f++) {
        moveTank(S.m, scr, c.f, c.b, c.l, c.r);
        const a = th.f[f];
        for (let i = 0; i < a.length; i += 4) if (a[i + 3] !== idx && inTank(scr, a[i], a[i + 1], a[i + 2])) return 1000 - f * 20;
      }
      return 0;
    }
    return {
      reset() { shot = null; dodge = null; dodgeT = backT = burstT = stuck = 0; cool = 12 + Math.random() * 14; scanT = 2; },
      think() {
        const me = S.tanks[idx], c = me.ctl, m = S.m;
        tk++;
        if (P.every > 1 && tk % P.every) { if (!burstT) c.fire = 0; return; }
        c.f = c.b = c.l = c.r = 0; c.fire = 0;
        const foes = S.tanks.filter(t => t.alive && t !== me);
        if (!foes.length) return;
        const myC = m.cell(me.x, me.y);
        let foe = foes[0], fd = 99;
        for (const t of foes) { const d = S.pd(myC, m.cell(t.x, t.y)); if (d < fd) { fd = d; foe = t; } }
        const foeC = m.cell(foe.x, foe.y);
        if (cool > 0) cool--;
        if (me.remote) {
          const r = me.remote, rc = m.cell(r.x, r.y), nc = S.next(rc, foeC), [tx, ty] = nc === rc ? [foe.x, foe.y] : center(nc), d = nrm(angTo(r.x, r.y, tx, ty) - r.a);
          if (d > 7) c.r = 1; else if (d < -7) c.l = 1;
          return;
        }
        if (S.locked(me)) return;
        const w = me.w;
        if (--scanT <= 0) {
          scanT = P.scan;
          shot = (w === 'bullet' || w === 'laser' || (w === 'frag' && !me.frag) || (w === 'gatling' && !me.gat)) && S.ready(me) ? findShot(me, foes) : null;
        }
        let aim = null, want = false;
        if (me.gat) { if (burstT > 0) { burstT--; c.fire = 1; } aim = angTo(me.x, me.y, foe.x, foe.y); }
        else if (me.frag) {
          const b = me.frag, age = CFG.frag.life - b.life;
          if (Math.hypot(b.x - foe.x, b.y - foe.y) < 42 || (age > 10 && Math.hypot(b.x - me.x, b.y - me.y) < 55) || age > 90) want = true;
        } else if (shot) { aim = shot.rot; if (Math.abs(nrm(shot.rot - me.rot)) < .5 && cool <= 0) want = true; }
        else if (w === 'deathRay') { const a = angTo(me.x, me.y, foe.x, foe.y); if (fd <= 7) { aim = a; if (Math.abs(nrm(a - me.rot)) < 35) want = true; } }
        else if (w === 'homing' || w === 'remote') {
          if (fd >= 2) { const [tx, ty] = center(S.next(myC, foeC)); aim = angTo(me.x, me.y, tx, ty); if (Math.abs(nrm(aim - me.rot)) < 15) want = true; }
        } else if (w === 'mine') { if (--mineT <= 0 && fd >= 2) { want = true; mineT = 45; } }
        if (want) { c.fire = me.trig ? 1 : 0; if (c.fire) { cool = P.cd; if (w === 'gatling') burstT = 75; shot = null; scanT = Math.min(scanT, 2); } }
        if (aim != null) headingCtl(c, me.rot, aim, 0, 0);
        else {
          let gc = foeC, gx = foe.x, gy = foe.y, tx, ty, hold = false;
          if (w === 'bullet') {
            let bd = fd + 2;
            for (const cr of S.crates) { const d = S.pd(myC, cr.c); if (d < bd) { bd = d; gc = cr.c; gx = cr.x; gy = cr.y; } }
          }
          if (w === 'bullet' && me.bf >= CFG.bullet.max && fd <= 3) {
            const n = m.nb(myC, NB);
            let bn = myC, bv = -1;
            for (let i = 0; i < n; i++) { const v = S.pd(NB[i], foeC); if (v > bv) { bv = v; bn = NB[i]; } }
            [tx, ty] = center(bn);
          } else if (gc === myC) {
            tx = gx; ty = gy;
            if (gc === foeC && Math.hypot(gx - me.x, gy - me.y) < 40) hold = true;
          } else {
            const nc = S.next(myC, gc), [cx, cy] = center(myC);
            [tx, ty] = center(nc);
            if (Math.abs(nc - myC) === 1 ? Math.abs(me.y - cy) > 9 : Math.abs(me.x - cx) > 9) { tx = cx; ty = cy; }
          }
          headingCtl(c, me.rot, angTo(me.x, me.y, tx, ty), hold ? 0 : 1, 0);
        }
        if (backT > 0) { backT--; c.f = 0; c.b = 1; c.l = backL; c.r = 1 - backL; }
        else if (c.f || c.b || c.l || c.r) {
          if (Math.hypot(me.x - lx, me.y - ly) < .3 && Math.abs(me.rot - lr) < .1) { if (++stuck > 7) { backT = 7; backL = Math.random() < .5 ? 1 : 0; stuck = 0; } }
          else stuck = 0;
        }
        lx = me.x; ly = me.y; lr = me.rot;
        if (Math.random() > P.dodge) return;
        const th = S.threats(P.H);
        if (!th.n) { dodgeT = 0; return; }
        const base = { f: c.f, b: c.b, l: c.l, r: c.r };
        if (dodgeT > 0 && dodge && danger(me, dodge, th) === 0) { c.f = dodge.f; c.b = dodge.b; c.l = dodge.l; c.r = dodge.r; dodgeT--; return; }
        if (danger(me, base, th) > 0) {
          let bc = base, bd = 1e9;
          for (const o of COMBOS) {
            const d = danger(me, o, th) + (o.f !== base.f) + (o.b !== base.b) + (o.l !== base.l) + (o.r !== base.r);
            if (d < bd) { bd = d; bc = o; }
          }
          dodge = bc; dodgeT = 4; c.f = bc.f; c.b = bc.b; c.l = bc.l; c.r = bc.r;
        } else dodgeT = 0;
      }
    };
  }

  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  function disc(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); }
  function tint(h, k) {
    const n = parseInt(h.slice(1), 16), t = k > 0 ? 255 : 0, a = Math.abs(k), f = v => Math.round(v + (t - v) * a);
    return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
  }
  function turret(g, col, w, spin) {
    g.fillStyle = col.top; g.strokeStyle = col.dark; g.lineWidth = 2.5;
    const bar = (x, bw, top, bot) => {
      rr(g, x - bw / 2, top, bw, bot - top, Math.min(3, bw / 2)); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x - bw / 2 + 1.3, top + 2, Math.max(1, bw * .2), bot - top - 4);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x + bw / 2 - 1.3 - Math.max(1, bw * .16), top + 2, Math.max(1, bw * .16), bot - top - 4);
      g.fillStyle = col.dark; g.fillRect(x - bw / 2 + .5, top + .5, bw - 1, 2.4);
      g.fillStyle = col.top;
    };
    switch (w) {
      case 'laser': bar(0, 8, -57, -6); g.fillStyle = '#fff'; disc(g, 0, -53, 3); g.fill(); g.fillStyle = col.top; break;
      case 'gatling': { const o = (spin % 1) * 5; for (let k = -1; k <= 1; k++) bar(((k * 5 + o + 7.5) % 15) - 7.5, 4.5, -56, -10); bar(0, 22, -40, -33); break; }
      case 'frag': bar(0, 19, -45, -6); g.fillStyle = col.dark; disc(g, 0, -44, 5); g.fill(); g.fillStyle = col.top; break;
      case 'deathRay': bar(-6.5, 5, -55, -8); bar(6.5, 5, -55, -8); g.fillStyle = '#fff'; disc(g, 0, -50, 3.5); g.fill(); g.fillStyle = col.top; break;
      case 'homing': case 'remote':
        bar(0, 22, -42, -4);
        if (w === 'remote') { g.beginPath(); g.moveTo(8, -12); g.lineTo(16, -38); g.stroke(); }
        g.fillStyle = col.dark; rr(g, -4, -50, 8, 26, 4); g.fill(); g.fillStyle = col.top; break;
      case 'mine': bar(0, 12, -50, -6); bar(0, 18, 14, 30); break;
      default: bar(0, 13, -55, -6);
    }
    const tg = g.createRadialGradient(-6, -5, 2, 0, 2, 19); tg.addColorStop(0, tint(col.top, .35)); tg.addColorStop(.55, col.top); tg.addColorStop(1, tint(col.base, -.12));
    disc(g, 0, 2, 18); g.fillStyle = tg; g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.4; disc(g, 0, 2, 12.5); g.stroke();
    g.fillStyle = col.dark; disc(g, 4, 8, 4.6); g.fill(); g.fillStyle = tint(col.top, .2); disc(g, 4, 8, 3.2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; disc(g, -6, -4, 5.5); g.fill();
  }
  function drawTank(g, x, y, rot, col, w, spin, sc) {
    g.save(); g.translate(x, y); g.rotate(rot * DEG); g.scale(sc, sc);
    g.fillStyle = col.dark;
    rr(g, -30.5, -40.5, 14, 81, 5); g.fill(); rr(g, 16.5, -40.5, 14, 81, 5); g.fill();
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30.5, -38, 3, 76); g.fillRect(27.5, -38, 3, 76);
    g.fillStyle = 'rgba(255,255,255,.17)';
    for (let yy = -36; yy < 37; yy += 10) { g.fillRect(-28.5, yy, 10, 4); g.fillRect(18.5, yy, 10, 4); }
    g.fillStyle = 'rgba(255,255,255,.12)'; for (let yy = -33; yy < 37; yy += 10) { g.fillRect(-28.5, yy + 1, 10, 1.2); g.fillRect(18.5, yy + 1, 10, 1.2); }
    g.fillStyle = tint(col.dark, -.3); for (const xx of [-23.5, 23.5]) for (const yy of [-34, 34]) { disc(g, xx, yy, 3.4); g.fill(); g.fillStyle = tint(col.dark, .25); disc(g, xx - .8, yy - .8, 1.3); g.fill(); g.fillStyle = tint(col.dark, -.3); }
    const hg = g.createLinearGradient(-22, -37, 22, 37); hg.addColorStop(0, tint(col.base, .22)); hg.addColorStop(.5, col.base); hg.addColorStop(1, tint(col.base, -.18));
    g.fillStyle = hg; rr(g, -22, -37, 44, 74, 7); g.fill(); g.lineWidth = 2.5; g.strokeStyle = col.dark; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.2; rr(g, -19.5, -34.5, 39, 69, 5); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.14)'; rr(g, -18, -33, 36, 13, 5); g.fill();
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let yy = 22; yy <= 32; yy += 4) g.fillRect(-12, yy, 24, 2);
    g.fillStyle = '#fff3b0'; disc(g, -14, -33.5, 2.2); g.fill(); disc(g, 14, -33.5, 2.2); g.fill();
    g.strokeStyle = col.dark; g.lineWidth = 1; disc(g, -14, -33.5, 2.2); g.stroke(); disc(g, 14, -33.5, 2.2); g.stroke();
    turret(g, col, w, spin);
    g.restore();
  }
  function tankShadow(g, x, y, rot, sc, k) {
    g.save(); g.translate(x + 1.6 * k, y + 2.4 * k); g.rotate(rot * DEG); g.scale(sc, sc);
    g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, -30.5, -40.5, 61, 81, 8); g.fill(); g.fillRect(-6.5, -55, 13, 20);
    g.restore();
  }
  function wIcon(g, w, col) {
    g.strokeStyle = g.fillStyle = col || '#4d4d4d'; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round';
    switch (w) {
      case 'laser': g.beginPath(); g.moveTo(-7, 6); g.lineTo(-2, -3); g.lineTo(2, 3); g.lineTo(7, -6); g.stroke(); break;
      case 'gatling': for (const yy of [-4, 0, 4]) { g.beginPath(); g.moveTo(-4, yy); g.lineTo(7, yy); g.stroke(); } g.fillRect(-8, -6.5, 4, 13); break;
      case 'frag': disc(g, 0, 0, 3.4); g.fill(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * 5.5, Math.sin(a) * 5.5); g.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); g.stroke(); } break;
      case 'deathRay': g.beginPath(); g.moveTo(-7, 6); g.quadraticCurveTo(-4, -9, 7, -5); g.stroke(); disc(g, 7, -5, 2.4); g.fill(); disc(g, -7, 6, 2.4); g.fill(); break;
      case 'homing': case 'remote':
        g.save(); g.rotate(.6); rr(g, -2.2, -7, 4.4, 12, 2); g.fill(); g.beginPath(); g.moveTo(-4.5, 6); g.lineTo(4.5, 6); g.lineTo(0, 2); g.fill(); g.restore();
        if (w === 'homing') { g.beginPath(); g.arc(-3, 4, 5, 1.2, 3.4); g.stroke(); } else { g.beginPath(); g.moveTo(-6, -2); g.lineTo(-6, -8); g.stroke(); disc(g, -6, -8, 1.6); g.fill(); }
        break;
      case 'mine': disc(g, 0, 0, 4.2); g.fill(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .78; g.beginPath(); g.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); g.lineTo(Math.cos(a) * 7.5, Math.sin(a) * 7.5); g.stroke(); } break;
    }
  }

  const KB = [
    { f: 'ArrowUp', b: 'ArrowDown', l: 'ArrowLeft', r: 'ArrowRight', fire: 'KeyM' },
    { f: 'KeyE', b: 'KeyD', l: 'KeyS', r: 'KeyF', fire: 'KeyQ' }
  ];
  const GAMEKEYS = new Set(['Space'].concat(...KB.map(k => [k.f, k.b, k.l, k.r, k.fire])));
  const MENU = `<div class="mt-card"><div class="mt-logo">Tank Trouble</div><div class="mt-sub">Bullets bounce. Last tank standing scores.</div>
<div class="mt-modes"><button class="mt-mode" data-m="cpu"><canvas data-t="01"></canvas><b>vs CPU</b><small data-h="cpu"></small></button><button class="mt-mode" data-m="online"><canvas data-t="01"></canvas><b>Online</b><small>2-8 players</small></button></div>
<div class="mt-opts"><div class="mt-row"><span>Match</span><div class="mt-seg" data-k="target"><button data-v="0">Endless</button><button data-v="5">First to 5</button><button data-v="10">First to 10</button></div></div>
<div class="mt-row"><span>CPU</span><div class="mt-seg" data-k="bots"><button data-v="1">1 tank</button><button data-v="2">2 tanks</button></div><div class="mt-seg" data-k="skill"><button data-v="0">Easy</button><button data-v="1">Normal</button><button data-v="2">Hard</button></div></div></div></div>`;

  const ENG = { makeSim, makeBot, genMaze, moveTank, inTank, CFG, live: null };
  Ameplay.register({
    id: ID,
    title: 'Maze Tanks',
    category: 'Action',
    tint: '#4a9c3a',
    blurb: 'Tank duel in a fresh maze every round. Bullets bounce, even into you.',
    help: '<kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> + <kbd>M</kbd> (or <kbd>E</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd> + <kbd>Q</kbd>) drive and fire · touch: joystick + fire · online: 2 to 4 players',
    better: 'high',
    width: 920,
    engine: ENG,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="17" y="20" width="30" height="36" rx="5"/><path d="M17 26v24M47 26v24"/><circle cx="32" cy="38" r="8"/><path d="M32 30V8"/><circle cx="50" cy="12" r="2.5" fill="currentColor"/></svg>',
    css: `.gm-maze-tanks{gap:0}
.gm-maze-tanks .mt-wrap{position:relative;max-width:100%;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r);overflow:hidden;background:#fff;box-shadow:0 0 0 1px var(--line)}
.gm-maze-tanks .mt-wrap canvas{display:block;width:100%;touch-action:none}
.gm-maze-tanks .mt-ui{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(255,255,255,.8);overflow:auto}
.gm-maze-tanks .mt-ui[hidden],.gm-maze-tanks .mt-mb[hidden]{display:none}
.gm-maze-tanks .mt-card{width:100%;max-width:640px;margin:auto;text-align:center;color:#3b3b3b;font-family:var(--sans)}
.gm-maze-tanks .mt-logo{font:900 italic clamp(34px,7vw,56px)/1 var(--sans);letter-spacing:.02em;color:#4d4d4d;text-transform:uppercase;text-shadow:3px 3px 0 #cfcfcf}
.gm-maze-tanks .mt-sub{font-weight:800;color:#8a8a8a;margin:6px 0 14px;font-size:14px}
.gm-maze-tanks .mt-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.gm-maze-tanks .mt-mode{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px 9px;border:2px solid #d8d8d8;border-radius:14px;background:#fff;cursor:pointer;font-family:var(--sans);color:#3b3b3b;box-shadow:0 3px 0 #d8d8d8;transition:transform .12s,border-color .12s}
.gm-maze-tanks .mt-mode:hover,.gm-maze-tanks .mt-mode.on{border-color:#4d4d4d}
.gm-maze-tanks .mt-mode:hover{transform:translateY(-2px)}
.gm-maze-tanks .mt-mode canvas{width:84px;height:44px}
.gm-maze-tanks .mt-mode b{font-size:16px;font-weight:900}
.gm-maze-tanks .mt-mode small{font-size:11px;font-weight:800;color:#8a8a8a;line-height:1.3}
.gm-maze-tanks .mt-opts{display:flex;flex-direction:column;gap:6px;margin-top:14px;align-items:center}
.gm-maze-tanks .mt-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center}
.gm-maze-tanks .mt-row>span{font-size:11px;font-weight:900;color:#8a8a8a;text-transform:uppercase;letter-spacing:.06em;min-width:50px}
.gm-maze-tanks .mt-seg{display:inline-flex;background:#ececec;border-radius:999px;padding:3px}
.gm-maze-tanks .mt-seg button{border:0;background:none;font:800 13px var(--sans);color:#6a6a6a;padding:6px 11px;border-radius:999px;cursor:pointer;min-height:34px}
.gm-maze-tanks .mt-seg button.on{background:#4d4d4d;color:#fff}
.gm-maze-tanks .mt-pan h3{font:900 30px/1.1 var(--sans);margin:4px 0 8px;color:#3b3b3b}
.gm-maze-tanks .mt-k{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#8a8a8a}
.gm-maze-tanks .mt-t{font-weight:700;color:#6a6a6a;margin:0 0 12px}
.gm-maze-tanks .mt-sc{display:flex;gap:18px;justify-content:center;margin:6px 0 14px}
.gm-maze-tanks .mt-sc div{font:900 26px var(--sans);display:flex;align-items:center;gap:7px}
.gm-maze-tanks .mt-sc i{display:inline-block;width:16px;height:16px;border-radius:4px}
.gm-maze-tanks .mt-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm-maze-tanks .mt-mb{position:absolute;right:8px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(77,77,77,.1);color:#4d4d4d;display:grid;place-items:center;cursor:pointer;transform:translateY(-50%)}
@media (max-width:600px){.gm-maze-tanks .mt-modes{grid-template-columns:repeat(2,1fr)}.gm-maze-tanks .mt-logo{font-size:34px}}`,
    mount(root, api) {
      const coarse = matchMedia('(pointer: coarse)').matches;
      const wrap = document.createElement('div');
      wrap.className = 'mt-wrap';
      root.append(wrap);
      const cv = document.createElement('canvas');
      wrap.append(cv);
      const ctx = cv.getContext('2d');
      const ui = document.createElement('div');
      ui.className = 'mt-ui';
      wrap.append(ui);
      const mb = document.createElement('button');
      mb.className = 'mt-mb'; mb.type = 'button'; mb.setAttribute('aria-label', 'Menu'); mb.hidden = true;
      mb.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
      wrap.append(mb);
      const saved = Object.assign({ mode: 'cpu', target: 5, bots: 1, skill: 1, ocpu: 0 }, api.load() || {});
      let touchMode = coarse, SW = 712, SH = 490, BS = 1, LAY = null, VS = 1, OX = 0, OY = 0;
      let S = null, demo = null, state = 'menu', acc = 0, humans = [], solo = true, mode = saved.mode === 'online' ? 'online' : 'cpu', labels = [], mouseIdx = -1, ids = [];
      let shake = 0, scorch = [], PT = [], vm = null, submitted = false, lastBn = 0, netIt = null, guestView = null;
      const pops = [0, 0, 0, 0, 0, 0, 0, 0];
      const G = { role: null, buf: [], mazes: {}, off: 0, offSet: false, press: 0, lastSend: 0, sig: '', hooked: false, n: 2, target: 0, overShown: false, me: 1, pids: [], players: [], ni: [], lp: [], hi: {}, port: {}, why: '', wait: 0, isq: 0, is: {} };

      let AC = null, master = null, NBUF = null;
      const audio = () => {
        if (api.muted) return null;
        if (!AC) {
          try {
            AC = new (window.AudioContext || window.webkitAudioContext)();
            master = AC.createGain(); master.gain.value = .55; master.connect(AC.destination);
            NBUF = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
            const d = NBUF.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          } catch (e) { AC = null; return null; }
        }
        return AC;
      };
      const tone = (f0, f1, dur, type, vol, delay = 0) => {
        const A = audio(); if (!A) return;
        const t = A.currentTime + delay, o = A.createOscillator(), g = A.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
      };
      const noise = (dur, vol, f0, f1, type = 'lowpass', q = .8, delay = 0) => {
        const A = audio(); if (!A) return;
        const t = A.currentTime + delay, s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
        s.buffer = NBUF; f.type = type; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
        s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
      };
      const SND = {
        b: () => { noise(.07, .4, 3000, 500); tone(240, 70, .08, 'sine', .3); },
        g: () => { noise(.04, .22, 4200, 1400); tone(330, 140, .04, 'square', .05); },
        f: () => { noise(.09, .4, 1800, 300); tone(150, 50, .12, 'sine', .35); },
        h: () => { noise(.35, .22, 500, 3000, 'bandpass', 1.5); },
        r: () => { noise(.3, .2, 600, 2400, 'bandpass', 1.5); },
        m: () => { tone(420, 160, .08, 'triangle', .18); },
        bounce: n => { const f = Math.random() < .5 ? 2300 : 1750; tone(f, f * .92, .035, 'sine', Math.min(.12, .05 + n * .01)); },
        boom: () => { noise(1.1, .8, 1800, 60, 'lowpass', .7); tone(95, 30, .7, 'sine', .6); noise(.25, .35, 6000, 900, 'bandpass', .8); },
        frag: () => { noise(.8, .7, 2400, 80, 'lowpass', .6); tone(120, 35, .5, 'sine', .45); for (let i = 0; i < 4; i++) noise(.05, .12, 5000, 2000, 'bandpass', 2, .05 + i * .06); },
        poof: () => noise(.16, .12, 900, 250),
        laser: () => { tone(2400, 260, .25, 'sawtooth', .13); tone(1200, 160, .25, 'square', .05); },
        charge: () => tone(160, 900, .36, 'sawtooth', .08),
        ray: () => { tone(72, 60, 1, 'sawtooth', .16); noise(1, .16, 3200, 700, 'bandpass', 2); },
        crate: () => tone(520, 980, .14, 'triangle', .07),
        land: () => { tone(150, 55, .12, 'sine', .32); noise(.1, .16, 900, 200); },
        pick: () => { tone(1250, 1250, .045, 'square', .08); tone(1850, 1850, .06, 'square', .06, .05); },
        pt: () => { tone(660, 660, .1, 'triangle', .2); tone(990, 990, .18, 'triangle', .2, .1); },
        over: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .22, 'triangle', .2, i * .11)); },
        gat1: () => tone(60, 240, .45, 'sawtooth', .07),
        gat0: () => tone(240, 45, 1.2, 'sawtooth', .06),
        click: () => tone(900, 900, .02, 'square', .05),
        lock: () => tone(1500, 1500, .06, 'sine', .1),
        arm: () => { tone(1000, 1000, .05, 'square', .07); tone(1000, 1000, .05, 'square', .07, .1); },
        fuse: () => tone(1900, 1900, .1, 'square', .08),
        mland: () => tone(300, 140, .07, 'triangle', .14),
        hit: () => { noise(.5, .5, 1500, 100); tone(110, 40, .35, 'sine', .4); }
      };
      const snd = (k, a) => { if (state === 'menu' || S === demo || api.muted || !SND[k]) return; try { SND[k](a); } catch (e) {} };

      function setStage(w, h, maxCss) {
        SW = w; SH = h;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(maxCss * dpr); cv.height = Math.round(maxCss * h / w * dpr); BS = cv.width / w;
        wrap.style.width = `min(100%, ${maxCss}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
        cv.style.aspectRatio = `${w} / ${h}`;
        mzc.key = '';
      }
      function layout(loc) {
        const port = coarse && innerHeight > innerWidth * 1.1, n = loc.length, pads = [];
        const pad = (p, rot, jz, fz, jx, jy, fx, fy, jr, fr) => pads.push({ p, rot, jz, fz, jx, jy, fx, fy, jr, fr, jt: null, ft: null, cx: 0, cy: 0, kx: 0, ky: 0 });
        let L;
        if (port) {
          if (n >= 2) {
            L = { port, SW: 400, SH: 754, area: { x: 10, y: 160, w: 380, h: 392 }, scoreY: 582 };
            pad(loc[1], Math.PI, [200, 0, 200, 150], [0, 0, 200, 150], 300, 75, 100, 75, 50, 42);
            if (n >= 3) { pad(loc[0], 0, [0, 604, 100, 150], [100, 604, 100, 150], 52, 679, 150, 679, 42, 34); pad(loc[2], 0, [200, 604, 100, 150], [300, 604, 100, 150], 250, 679, 348, 679, 42, 34); }
            else pad(loc[0], 0, [0, 604, 200, 150], [200, 604, 200, 150], 100, 679, 300, 679, 50, 42);
          } else {
            L = { port, SW: 400, SH: 664, area: { x: 10, y: 10, w: 380, h: 430 }, scoreY: 462 };
            if (n) pad(loc[0], 0, [0, 484, 200, 180], [200, 484, 200, 180], 100, 574, 300, 574, 54, 44);
          }
        } else {
          L = { port, SW: 712, SH: 490, area: { x: 10, y: 10, w: 692, h: 400 }, scoreY: 450 };
          if (n >= 2) {
            pad(loc[1], Math.PI, [356, 0, 356, 245], [0, 0, 356, 245], 640, 72, 72, 72, 50, 40);
            if (n >= 3) { pad(loc[0], 0, [0, 245, 190, 245], [190, 245, 166, 245], 70, 418, 250, 430, 48, 38); pad(loc[2], 0, [356, 245, 166, 245], [522, 245, 190, 245], 452, 430, 600, 404, 48, 38); }
            else pad(loc[0], 0, [0, 245, 356, 245], [356, 245, 356, 245], 72, 418, 596, 410, 50, 40);
          } else if (n) pad(loc[0], 0, [0, 0, 356, 490], [356, 0, 356, 490], 72, 418, 596, 410, 50, 40);
        }
        L.pads = pads; LAY = L;
        setStage(L.SW, L.SH, port ? 400 : 900);
        mb.style.top = (L.scoreY / L.SH * 100) + '%';
      }
      const toLocal = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * SW / r.width, y: (e.clientY - r.top) * SH / r.height }; };

      let mzc = { key: '' };
      function mazeCache(m) {
        const key = m.id + ':' + VS.toFixed(5) + ':' + BS.toFixed(4);
        if (mzc.key === key) return mzc;
        const pad = WT + 5, k = VS * BS, c = document.createElement('canvas');
        c.width = Math.ceil((m.W * CELL + 2 * pad) * k); c.height = Math.ceil((m.H * CELL + 2 * pad) * k);
        const g = c.getContext('2d');
        g.setTransform(k, 0, 0, k, pad * k, pad * k);
        g.fillStyle = '#262626'; g.fillRect(-WT - 1, -WT - 1, m.W * CELL + 2 * WT + 2, m.H * CELL + 2 * WT + 2);
        g.fillStyle = '#e6e6e6'; g.fillRect(0, 0, m.W * CELL, m.H * CELL);
        for (let i = 0; i < m.W; i++) for (let j = 0; j < m.H; j++) { if ((i + j) & 1) { g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(i * CELL, j * CELL, CELL, CELL); } }
        g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = .8; g.beginPath();
        for (let i = 1; i < m.W; i++) { g.moveTo(i * CELL, 0); g.lineTo(i * CELL, m.H * CELL); }
        for (let j = 1; j < m.H; j++) { g.moveTo(0, j * CELL); g.lineTo(m.W * CELL, j * CELL); }
        g.stroke();
        const fg = g.createRadialGradient(m.W * CELL / 2, m.H * CELL / 2, m.H * CELL * .3, m.W * CELL / 2, m.H * CELL / 2, m.W * CELL * .62); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,.07)');
        g.fillStyle = fg; g.fillRect(0, 0, m.W * CELL, m.H * CELL);
        const p = new Path2D();
        for (let j = 0; j <= m.H; j++) for (let i = 0; i < m.W; i++) if (m.hw[j * m.W + i]) p.rect(i * CELL - WT, j * CELL - WT, CELL + 2 * WT, 2 * WT);
        for (let i = 0; i <= m.W; i++) for (let j = 0; j < m.H; j++) if (m.vw[i * m.H + j]) p.rect(i * CELL - WT, j * CELL - WT, 2 * WT, CELL + 2 * WT);
        g.save(); g.beginPath(); g.rect(0, 0, m.W * CELL, m.H * CELL); g.clip(); g.translate(1.8, 2.6); g.fillStyle = 'rgba(0,0,0,.17)'; g.fill(p); g.restore();
        g.fillStyle = '#626262'; g.fill(p);
        g.save(); g.clip(p); g.translate(1.5, 1.7); g.fillStyle = '#4d4d4d'; g.fill(p); g.translate(1.5, 1.7); g.fillStyle = '#434343'; g.fill(p); g.restore();
        g.fillStyle = '#2f2f2f';
        for (let i = 0; i <= m.W; i++) for (let j = 0; j <= m.H; j++) {
          let n = 0;
          if (j > 0 && m.vw[i * m.H + j - 1]) n++; if (j < m.H && m.vw[i * m.H + j]) n++; if (i > 0 && m.hw[j * m.W + i - 1]) n++; if (i < m.W && m.hw[j * m.W + i]) n++;
          if (n >= 3) { g.beginPath(); g.arc(i * CELL, j * CELL, WT * .38, 0, Math.PI * 2); g.fill(); }
        }
        mzc = { key, c, pad };
        return mzc;
      }
      function fitView(m) {
        const A = LAY.area, need = (WT + 1) * 2;
        VS = Math.min(A.w / (m.W * CELL + need), A.h / (m.H * CELL + need));
        OX = A.x + (A.w - m.W * CELL * VS) / 2;
        OY = A.y + (A.h - m.H * CELL * VS) / 2;
      }

      const addP = p => { if (PT.length < 1200) PT.push(p); };
      const grey = () => ['#151515', '#262626', '#3a3a3a', '#555555'][(Math.random() * 4) | 0];
      function smoke(x, y, n, r, spd, alpha, colf) {
        for (let i = 0; i < n; i++) addP({ k: 0, x: x + (Math.random() - .5) * 4, y: y + (Math.random() - .5) * 4, vx: (Math.random() * 2 - 1) * spd, vy: (Math.random() * 2 - 1) * spd, r: r * (.7 + Math.random() * .6), a: alpha * (.7 + Math.random() * .5), da: .012 + Math.random() * .02, g: .025, col: colf ? colf() : grey(), dec: .93 });
      }
      function explode(x, y, i) {
        const col = TCOL[i] || TCOL[0];
        addP({ k: 4, x, y, r: 6, a: 1, col: '#fff7c0' });
        for (let k = 0; k < 9; k++) { const a = Math.random() * 6.3, s = 1 + Math.random() * 2.5; addP({ k: 3, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 5 + Math.random() * 6, a: .95, col: k % 3 ? '#ffb02e' : '#ff6a1a', dec: .86 }); }
        smoke(x, y, 10, 7.5, 1, .55);
        for (let k = 0; k < 8; k++) {
          const a = Math.random() * 6.3, s = (Math.random() * 3 + 1) / 1.5, pts = [];
          for (let q = 0; q < 4; q++) pts.push(Math.random() * 10 - 5, Math.random() * 10 - 5);
          addP({ k: 1, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6.3, vr: (Math.random() * 2 - 1) * 1.05, pts, col: Math.random() > .4 ? col.base : col.top, a: 1, on: true, tr: 0 });
        }
        for (let k = 0; k < 16; k++) { const a = Math.random() * 6.3, s = 3 + Math.random() * 5; addP({ k: 2, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, a: 1, col: Math.random() < .5 ? '#ffe27a' : '#ff9a2e' }); }
        scorch.push({ x, y, r: 13 + Math.random() * 4, rot: Math.random() * 6 });
        shake = Math.max(CFG.shake, shake + 7);
      }
      function updParticles(dt) {
        const u = Math.min(3, dt * 25), m = vm;
        for (const p of PT) {
          switch (p.k) {
            case 0: p.x += p.vx * u; p.y += p.vy * u; p.vx *= Math.pow(p.dec, u); p.vy *= Math.pow(p.dec, u); p.r *= 1 + p.g * u * .5; p.a -= p.da * u; break;
            case 1:
              if (p.on) {
                p.x += p.vx * u; p.y += p.vy * u; p.vx *= Math.pow(.97, u); p.vy *= Math.pow(.97, u); p.rot += p.vr * u; p.vr *= Math.pow(.97, u);
                p.tr += u;
                if (p.tr > 1.4) { p.tr = 0; addP({ k: 0, x: p.x, y: p.y, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: 2, a: .3, da: .02, g: .03, col: grey(), dec: .9 }); }
                if (m && m.wall(p.x, p.y)) p.on = false;
              }
              if (!p.on || Math.abs(p.vx) + Math.abs(p.vy) < .6) p.a -= .025 * u;
              break;
            case 2: p.x += p.vx * u; p.y += p.vy * u; p.vx *= Math.pow(.84, u); p.vy *= Math.pow(.84, u); p.a -= .07 * u; break;
            case 3: p.x += p.vx * u; p.y += p.vy * u; p.vx *= Math.pow(p.dec, u); p.vy *= Math.pow(p.dec, u); p.r *= 1 + .04 * u; p.a -= .075 * u; break;
            case 4: p.r += 5 * u; p.a -= .16 * u; break;
          }
        }
        PT = PT.filter(p => p.a > 0);
        if (shake > 0) shake = Math.max(0, shake - .5 * u);
        for (let i = 0; i < 8; i++) pops[i] = Math.max(0, pops[i] - dt * 2.5);
      }
      function drawParticles() {
        for (const p of PT) {
          ctx.globalAlpha = Math.max(0, Math.min(1, p.a));
          ctx.fillStyle = p.col;
          switch (p.k) {
            case 0: case 3: disc(ctx, p.x, p.y, p.r); ctx.fill(); break;
            case 1:
              ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); ctx.moveTo(p.pts[0], p.pts[1]);
              for (let i = 2; i < 8; i += 2) ctx.lineTo(p.pts[i], p.pts[i + 1]);
              ctx.closePath(); ctx.fill(); ctx.lineWidth = .8; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.restore(); break;
            case 2: ctx.strokeStyle = p.col; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6); ctx.stroke(); break;
            case 4: ctx.strokeStyle = p.col; ctx.lineWidth = 4; disc(ctx, p.x, p.y, p.r); ctx.fill(); break;
          }
        }
        ctx.globalAlpha = 1;
      }
      function scoreText(V) {
        if (!V) return;
        const sc = V.scores;
        if (mode === 'cpu' && !G.role) api.score(sc[0]);
        else if (G.role) { const me = G.role === 'guest' ? G.me : 0; api.score('You ' + sc[me] + ' · ' + sc.filter((v, i) => i !== me).join(' · ')); }
        else api.score(sc.join(' – '));
      }
      function fx(e, V) {
        switch (e[0]) {
          case 'round': PT = []; scorch = []; shake = 0; if (G.role === 'host' && S && S !== demo) sendMaze(); break;
          case 'shot': snd(e[3]); if (e[3] !== 'm') smoke(e[1], e[2], 2, 2.5, .6, .25, () => '#9a9a9a'); break;
          case 'laser': snd('laser'); break;
          case 'charge': snd('charge'); break;
          case 'ray': snd('ray'); shake = Math.max(shake, 4); break;
          case 'bn': { const t = performance.now(); if (t - lastBn > 45) { lastBn = t; snd('bounce', e[1]); } break; }
          case 'boom': snd('boom'); explode(e[1], e[2], e[3]); break;
          case 'frag': snd('frag'); smoke(e[1], e[2], 10, 7, 1, .5); addP({ k: 4, x: e[1], y: e[2], r: 5, a: .9, col: '#fff3b0' }); for (let k = 0; k < 6; k++) addP({ k: 3, x: e[1], y: e[2], vx: (Math.random() - .5) * 3, vy: (Math.random() - .5) * 3, r: 4 + Math.random() * 4, a: .9, col: '#ffa330', dec: .86 }); shake = Math.max(CFG.shake, shake + 7); break;
          case 'hit': snd('hit'); smoke(e[1], e[2], 8, 6, 1, .5); addP({ k: 4, x: e[1], y: e[2], r: 5, a: .9, col: '#fff3b0' }); break;
          case 'poof': snd('poof'); smoke(e[1], e[2], e[3] ? 6 : 12, e[3] ? 1.6 : 2.5, 1, .25); break;
          case 'crate': snd('crate'); break;
          case 'land': snd('land'); smoke(e[1], e[2], 16, 5, 1, .45, () => '#aaaaaa'); break;
          case 'mland': snd('mland'); break;
          case 'pick': snd('pick'); break;
          case 'pt': pops[e[1]] = 1; snd('pt'); scoreText(V); break;
          case 'over': snd('over'); break;
          case 'gat': snd(e[1] ? 'gat1' : 'gat0'); break;
          case 'click': case 'lock': case 'arm': case 'fuse': snd(e[0]); break;
        }
      }

      function drawAimer(t, al, tick) {
        const m = vm, rot = t.prot + nrm(t.rot - t.prot) * al, x0 = t.px + (t.x - t.px) * al, y0 = t.py + (t.y - t.py) * al;
        const st = CFG.laser.aimer / 100, p = { x: x0 + sx(rot) * CFG.muzzle, y: y0 + sy(rot) * CFG.muzzle, vx: sx(rot) * st, vy: sy(rot) * st };
        let seed = (tick * 7919 + t.i * 104729) | 0;
        const segs = [];
        for (let j = 0; j < 100; j++) {
          const px = p.x, py = p.y;
          bounce(m, p);
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          if (seed % 100 < 30) segs.push(px, py, p.x, p.y);
        }
        const col = TCOL[t.i].top;
        for (const [w, c] of [[3, 'rgba(0,0,0,.3)'], [2, col]]) {
          ctx.lineWidth = w; ctx.strokeStyle = c; ctx.beginPath();
          for (let i = 0; i < segs.length; i += 4) { ctx.moveTo(segs[i], segs[i + 1]); ctx.lineTo(segs[i + 2], segs[i + 3]); }
          ctx.stroke();
        }
      }
      function drawWorld(V, al) {
        const L = (a, b) => a + (b - a) * al, tick = V.tick || 0;
        for (const s of scorch) { ctx.fillStyle = 'rgba(30,30,30,.13)'; disc(ctx, s.x, s.y, s.r); ctx.fill(); ctx.fillStyle = 'rgba(30,30,30,.12)'; disc(ctx, s.x + Math.cos(s.rot) * 3, s.y + Math.sin(s.rot) * 3, s.r * .55); ctx.fill(); }
        for (const c of V.crates) {
          const h = 1 - Math.min(1, c.s);
          ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot * DEG);
          ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, -9 * c.s + 2 + h * 6, -9 * c.s + 3 + h * 8, 18 * c.s, 18 * c.s, 3); ctx.fill();
          ctx.scale(c.s * 1.0, c.s * 1.0);
          const cg = ctx.createLinearGradient(-9.5, -9.5, 9.5, 9.5); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#dcdcdc');
          ctx.fillStyle = cg; rr(ctx, -9.5, -9.5, 19, 19, 3.5); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#4d4d4d'; ctx.stroke();
          ctx.fillStyle = '#9a9a9a'; for (const [qx, qy] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) { disc(ctx, qx, qy, 1); ctx.fill(); }
          ctx.strokeStyle = 'rgba(77,77,77,.35)'; ctx.lineWidth = .8; rr(ctx, -6.5, -6.5, 13, 13, 2); ctx.stroke();
          ctx.scale(.8, .8); wIcon(ctx, c.w);
          ctx.restore();
        }
        for (const mn of V.mines) {
          const x = L(mn.px, mn.x), y = L(mn.py, mn.y), blink = mn.det ? (tick % 2) : mn.armed ? (tick % 6 < 3) : (tick % 25 < 3);
          ctx.globalAlpha = mn.landed && !mn.armed ? .38 : 1;
          ctx.fillStyle = '#4a4a4a'; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + .2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a - .22) * 5, y + Math.sin(a - .22) * 5); ctx.lineTo(x + Math.cos(a) * 7.8, y + Math.sin(a) * 7.8); ctx.lineTo(x + Math.cos(a + .22) * 5, y + Math.sin(a + .22) * 5); ctx.fill(); }
          const mg = ctx.createRadialGradient(x - 1.6, y - 1.8, .5, x, y, 5.8); mg.addColorStop(0, '#8a8a8a'); mg.addColorStop(1, '#3a3a3a');
          ctx.fillStyle = mg; disc(ctx, x, y, 5.5); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = .8; ctx.stroke();
          ctx.fillStyle = blink ? (mn.armed ? '#ff3b2f' : TCOL[typeof mn.o === 'number' ? mn.o : mn.o.i].top) : '#2a2a2a'; disc(ctx, x, y, 2.2); ctx.fill();
          ctx.globalAlpha = 1;
        }
        for (const s of V.shots) if (s.k === 'b' || s.k === 'g' || s.k === 'f') { const r = s.k === 'g' ? CFG.gatling.r : s.k === 'f' ? CFG.frag.r : CFG.bullet.r; ctx.fillStyle = 'rgba(0,0,0,.17)'; disc(ctx, L(s.px, s.x) + 1.4, L(s.py, s.y) + 2, r); ctx.fill(); }
        for (const t of V.tanks) if (t.alive) tankShadow(ctx, L(t.px, t.x), L(t.py, t.y), t.prot + nrm(t.rot - t.prot) * al, TK, 1);
        for (const t of V.tanks) if (t.alive) drawTank(ctx, L(t.px, t.x), L(t.py, t.y), t.prot + nrm(t.rot - t.prot) * al, TCOL[t.i], t.w, t.gat ? t.gat.spin * tick * .13 : 0, TK);
        for (const t of V.tanks) if (t.alive && t.w === 'laser' && t.laserReady !== false && !V.beams.some(b => b.o === t)) drawAimer(t, al, tick);
        for (const s of V.shots) {
          const x = L(s.px, s.x), y = L(s.py, s.y);
          switch (s.k) {
            case 'b': case 'g': { const br = s.k === 'g' ? CFG.gatling.r : CFG.bullet.r; ctx.fillStyle = '#141414'; disc(ctx, x, y, br); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; disc(ctx, x - br * .32, y - br * .36, br * .28); ctx.fill(); break; }
            case 'f': ctx.fillStyle = '#141414'; disc(ctx, x, y, CFG.frag.r); ctx.fill(); ctx.fillStyle = tick % 6 < 3 ? '#ff4a2a' : '#777'; disc(ctx, x, y, 1.8); ctx.fill(); break;
            case 'x': {
              const a = (s.id * 47 + tick * (s.id % 2 ? 37 : -37)) * DEG;
              ctx.globalAlpha = s.fade ? s.fade / 20 : 1; ctx.fillStyle = '#2b2b2b';
              ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4); ctx.lineTo(x + Math.cos(a + 2.3) * 2.6, y + Math.sin(a + 2.3) * 2.6); ctx.lineTo(x + Math.cos(a + 4) * 2.2, y + Math.sin(a + 4) * 2.2); ctx.fill();
              ctx.globalAlpha = 1; break;
            }
            case 'h': case 'r': {
              const col = TCOL[s.o.i !== undefined ? s.o.i : s.o].top;
              ctx.save(); ctx.translate(x, y); ctx.rotate(s.a * DEG);
              ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, -2.2 + 1.2, -6 + 2, 4.4, 12, 2); ctx.fill();
              ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(4, 6); ctx.lineTo(0, 1); ctx.fill();
              ctx.fillStyle = col; rr(ctx, -2.3, -6.5, 4.6, 12, 2.3); ctx.fill(); ctx.fillStyle = '#2a2a2a'; disc(ctx, 0, -5, 2); ctx.fill();
              if (s.k === 'r' && tick % 4 < 2) { ctx.fillStyle = '#fff'; disc(ctx, 0, 2, 1.2); ctx.fill(); }
              ctx.restore();
              if (Math.random() < .7) addP({ k: 0, x: x - sx(s.a) * 7, y: y - sy(s.a) * 7, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: 2, a: .25, da: .02, g: .05, col: s.k === 'h' && Math.random() < .4 ? col : '#9a9a9a', dec: .9 });
              break;
            }
          }
        }
        for (const b of V.beams) {
          const P = b.draw;
          if (!P || P.length < 4) continue;
          const col = TCOL[b.o.i].top;
          for (const [w, c] of [[3, 'rgba(0,0,0,.3)'], [2, col], [.7, 'rgba(255,255,255,.85)']]) {
            ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(P[0], P[1]);
            for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
            ctx.stroke();
          }
        }
        for (const r of V.rays) {
          const col = TCOL[r.o.i].top;
          if (r.ball > 0) { ctx.fillStyle = col; disc(ctx, r.x, r.y, r.ball * 1.3); ctx.fill(); ctx.fillStyle = '#fff'; disc(ctx, r.x, r.y, r.ball * .7); ctx.fill(); }
          const P = r.pts;
          if (!P || r.thick <= 0) continue;
          ctx.lineJoin = 'round'; ctx.lineCap = 'round';
          const path = () => { ctx.beginPath(); ctx.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]); };
          path(); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = r.thick + 2.5; ctx.stroke();
          ctx.strokeStyle = col; ctx.lineWidth = r.thick; ctx.stroke();
          ctx.setLineDash([10, 10]); ctx.lineDashOffset = -tick * 5; ctx.strokeStyle = '#fff'; ctx.lineWidth = r.thick * .5; ctx.stroke(); ctx.setLineDash([]);
          if (r.on) for (let i = 2; i < P.length; i += 2) {
            if (vm.wall(P[i], P[i + 1]) !== vm.wall(P[i - 2], P[i - 1]) && Math.random() < .5) { const a = Math.random() * 6.3; addP({ k: 2, x: P[i], y: P[i + 1], vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, a: 1, col }); }
          }
        }
        drawParticles();
        if (mouseIdx >= 0 && mouse && state === 'play' && !G.role) {
          const t = V.tanks[mouseIdx], wx = (mouse.x - OX) / VS, wy = (mouse.y - OY) / VS;
          ctx.strokeStyle = TCOL[mouseIdx].dark; ctx.lineWidth = 1.2 / VS * 1.5;
          ctx.beginPath(); ctx.moveTo(wx - 6, wy); ctx.lineTo(wx + 6, wy); ctx.moveTo(wx, wy - 6); ctx.lineTo(wx, wy + 6); ctx.stroke();
          if (t && t.alive) {
            const d = Math.hypot(wx - t.x, wy - t.y), k = Math.min(1, 60 / VS / Math.max(1, d));
            disc(ctx, t.x + (wx - t.x) * k, t.y + (wy - t.y) * k, 4); ctx.strokeStyle = TCOL[mouseIdx].top; ctx.stroke();
          }
        }
      }
      function drawScore(V) {
        const n = V.tanks.length, y = LAY.scoreY, port = LAY.port, k = n > 4 ? (port ? .62 : .72) : 1, gap = port ? Math.min(128, (SW - (n > 4 ? 70 : 40)) / n) : Math.min(190, (SW - 210) / n), sc = (port ? .34 : .46) * k, x0 = SW / 2 - (n > 4 && port ? 16 : 0);
        ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
          const cx = x0 + (i - (n - 1) / 2) * gap, t = V.tanks[i], p = pops[i];
          ctx.globalAlpha = t.alive ? 1 : .4;
          drawTank(ctx, cx - (port ? 22 : 30) * k, y, 90, TCOL[i], t.w, 0, sc);
          ctx.globalAlpha = 1;
          ctx.font = `900 ${Math.round((port ? 27 : 36) * k * (1 + p * .4))}px Nunito, system-ui, sans-serif`;
          ctx.fillStyle = '#4d4d4d'; ctx.textAlign = 'left';
          ctx.fillText(String(V.scores[i]), cx + (port ? 2 : 4) * k, y + 1);
          ctx.font = `800 ${Math.round((port ? 10 : 11) * (n > 4 ? .9 : 1))}px Nunito, system-ui, sans-serif`; ctx.fillStyle = '#9a9a9a'; ctx.textAlign = 'center';
          ctx.fillText(String(labels[i] || '').slice(0, n > 4 ? (port ? 6 : 9) : 16), cx - (port ? 6 : 8) * k, y + (port ? 22 : 28) * (n > 4 ? .85 : 1));
        }
        ctx.font = '800 11px Nunito, system-ui, sans-serif'; ctx.fillStyle = '#a0a0a0'; ctx.textAlign = 'left';
        const tg = G.role === 'guest' ? G.target : (S && S.target);
        if (tg && n < 4) ctx.fillText('First to ' + tg, 12, y + (port ? 22 : 28));
        if (G.role === 'guest') { ctx.textAlign = 'right'; ctx.fillText((api.net.rtt || 0) + ' ms', SW - 12, y + (port ? 22 : 28) + (port ? 0 : 0)); }
      }
      function padVec(pad) {
        const vx = pad.kx - pad.cx, vy = pad.ky - pad.cy;
        const mag = Math.hypot(vx, vy) / pad.jr;
        return mag < .22 ? null : { a: Math.atan2(vx, -vy) / DEG, mag };
      }
      function drawPads() {
        for (const pad of LAY.pads) {
          const col = TCOL[pad.p], jx = pad.jt != null ? pad.cx : pad.jx, jy = pad.jt != null ? pad.cy : pad.jy;
          ctx.globalAlpha = .16; ctx.fillStyle = col.base; disc(ctx, jx, jy, pad.jr); ctx.fill();
          ctx.globalAlpha = .5; ctx.lineWidth = 2.5; ctx.strokeStyle = col.base; ctx.stroke();
          let kx = jx, ky = jy;
          if (pad.jt != null) { const dx = pad.kx - pad.cx, dy = pad.ky - pad.cy, d = Math.hypot(dx, dy), k = d > pad.jr ? pad.jr / d : 1; kx += dx * k; ky += dy * k; }
          ctx.globalAlpha = .6; ctx.fillStyle = col.top; disc(ctx, kx, ky, pad.jr * .42); ctx.fill();
          ctx.globalAlpha = pad.ft != null ? .8 : .42; ctx.fillStyle = col.base; disc(ctx, pad.fx, pad.fy, pad.fr); ctx.fill();
          ctx.globalAlpha = .95; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          const r = pad.fr * .42;
          disc(ctx, pad.fx, pad.fy, r); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pad.fx - r * 1.5, pad.fy); ctx.lineTo(pad.fx + r * 1.5, pad.fy); ctx.moveTo(pad.fx, pad.fy - r * 1.5); ctx.lineTo(pad.fx, pad.fy + r * 1.5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      function render(V, al) {
        ctx.setTransform(BS, 0, 0, BS, 0, 0);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SW, SH);
        if (V && V.m && !V.blank) {
          vm = V.m;
          fitView(V.m);
          const c = mazeCache(V.m), kx = shake > .3 ? (Math.random() - .5) * shake : 0, ky = shake > .3 ? (Math.random() - .5) * shake : 0;
          ctx.save(); ctx.translate(OX + kx, OY + ky);
          ctx.drawImage(c.c, -c.pad * VS, -c.pad * VS, c.c.width / BS, c.c.height / BS);
          ctx.scale(VS, VS);
          drawWorld(V, al);
          ctx.restore();
        }
        if (V && V.tanks && state !== 'menu') drawScore(V);
        if (state === 'play' && touchMode && LAY.pads.length) drawPads();
      }

      const held = new Set();
      let mouse = null, mouseDown = false;
      function localIntent(p) {
        const it = { k: 0, a: null, mv: 0, rv: 0, fire: 0 };
        const sets = solo ? KB : (p < 2 ? [KB[p]] : []);
        for (const K of sets) {
          if (held.has(K.f)) it.k |= 1; if (held.has(K.b)) it.k |= 2; if (held.has(K.l)) it.k |= 4; if (held.has(K.r)) it.k |= 8;
          if (held.has(K.fire)) it.fire = 1;
        }
        if (solo && held.has('Space')) it.fire = 1;
        for (const pad of LAY.pads) if (pad.p === p) {
          if (pad.ft != null) it.fire = 1;
          if (!it.k && pad.jt != null) { const v = padVec(pad); if (v) { it.a = v.a; it.mv = 1; it.rv = 1; } }
        }
        if (p === mouseIdx && mouse && !it.k && it.a == null) {
          if (mouseDown) it.fire = 1;
          it.tx = (mouse.x - OX) / VS; it.ty = (mouse.y - OY) / VS; it.m1 = 60 / VS; it.m2 = 120 / VS;
        }
        return it;
      }
      function firePress(p) {
        if (G.role === 'guest') { G.press++; guestInput(performance.now(), true); return; }
        if (!S || S === demo || state !== 'play') return;
        const t = S.tanks[p];
        if (!t) return;
        t.ctl.fire = 1; S.tryFire(t);
      }
      const keyOwner = code => {
        if (solo) return GAMEKEYS.has(code) ? ids[0] : -1;
        if ([KB[0].f, KB[0].b, KB[0].l, KB[0].r, KB[0].fire].includes(code)) return 0;
        if ([KB[1].f, KB[1].b, KB[1].l, KB[1].r, KB[1].fire].includes(code)) return 1;
        return -1;
      };
      api.on(window, 'keydown', e => {
        if (e.target && e.target.closest && e.target.closest('input,textarea')) return;
        if (state === 'menu' && e.code === 'Enter' && ui.dataset.k === 'menu') { e.preventDefault(); start(mode); return; }
        if (!GAMEKEYS.has(e.code)) return;
        if (state === 'play') e.preventDefault();
        if (e.repeat) return;
        held.add(e.code);
        if (state !== 'play') return;
        if (e.code === 'KeyM' || e.code === 'KeyQ' || e.code === 'Space') { const p = keyOwner(e.code); if (p >= 0 && (solo || e.code !== 'Space')) firePress(p); }
      });
      api.on(window, 'keyup', e => held.delete(e.code));
      api.on(window, 'blur', () => { held.clear(); mouseDown = false; });
      const inZ = (z, p) => p.x >= z[0] && p.x < z[0] + z[2] && p.y >= z[1] && p.y < z[1] + z[3];
      api.on(cv, 'pointerdown', e => {
        if (state !== 'play') return;
        const p = toLocal(e);
        if (e.pointerType !== 'touch' && e.pointerType !== 'pen') {
          if (mouseIdx >= 0) { mouse = p; if (e.button === 0) { mouseDown = true; firePress(mouseIdx); } }
          return;
        }
        touchMode = true; e.preventDefault();
        for (const pad of LAY.pads) {
          if (pad.jt == null && inZ(pad.jz, p)) { pad.jt = e.pointerId; pad.cx = pad.kx = p.x; pad.cy = pad.ky = p.y; break; }
          if (pad.ft == null && inZ(pad.fz, p)) { pad.ft = e.pointerId; firePress(pad.p); break; }
        }
        try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      });
      api.on(cv, 'pointermove', e => {
        if (e.pointerType !== 'touch' && e.pointerType !== 'pen') { if (mouseIdx >= 0) mouse = toLocal(e); return; }
        const p = toLocal(e);
        for (const pad of LAY.pads) if (pad.jt === e.pointerId) { pad.kx = p.x; pad.ky = p.y; }
      });
      const up = e => {
        if (e.pointerType !== 'touch' && e.pointerType !== 'pen') { mouseDown = false; return; }
        for (const pad of LAY.pads) { if (pad.jt === e.pointerId) pad.jt = null; if (pad.ft === e.pointerId) pad.ft = null; }
      };
      api.on(cv, 'pointerup', up);
      api.on(cv, 'pointercancel', up);
      api.on(cv, 'contextmenu', e => e.preventDefault());
      api.on(mb, 'click', () => { if (G.role) { api.net.close(); G.role = null; } showMenu(); });

      function hint(m) {
        return touchMode ? 'Joystick + Fire' : 'Arrows + M';
      }
      function showMenu() {
        state = 'menu'; mb.hidden = true; G.role = null;
        humans = []; solo = true; mouseIdx = -1; ids = []; wrap.style.cursor = '';
        layout([]);
        demo = makeSim({ n: 2, portrait: LAY.port });
        demo.bots[0] = makeBot(demo, 0, 1); demo.bots[1] = makeBot(demo, 1, 1);
        demo.newRound(); demo.ev.length = 0; PT = []; scorch = [];
        S = demo;
        ui.dataset.k = 'menu'; ui.innerHTML = MENU; ui.hidden = false;
        ui.querySelectorAll('[data-h]').forEach(e => { e.textContent = hint(e.dataset.h); });
        ui.querySelectorAll('.mt-mode').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
        ui.querySelectorAll('.mt-mode canvas').forEach(c => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2), list = c.dataset.t.split('').map(Number);
          c.width = 84 * dpr; c.height = 44 * dpr;
          const g = c.getContext('2d');
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          list.forEach((i, k) => { const x = 42 + (k - (list.length - 1) / 2) * 26; tankShadow(g, x, 22, 0, .42, 2.5); drawTank(g, x, 22, k % 2 ? 180 : 0, TCOL[i], 'bullet', 0, .42); });
        });
        const seg = () => ui.querySelectorAll('.mt-seg').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(saved[s.dataset.k]) === b.dataset.v)));
        seg();
        ui.onclick = e => {
          const sb = e.target.closest('.mt-seg button');
          if (sb) { saved[sb.parentNode.dataset.k] = +sb.dataset.v; api.save(saved); seg(); api.sfx('tap'); return; }
          const mbtn = e.target.closest('.mt-mode');
          if (mbtn) { api.sfx('tap'); start(mbtn.dataset.m); }
        };
      }
      function panel(o) {
        ui.dataset.k = 'panel'; ui.hidden = false;
        const sc = o.scores ? `<div class="mt-sc">${o.scores.map((v, i) => `<div><i style="background:${TCOL[i].base}"></i>${v}</div>`).join('')}</div>` : '';
        ui.innerHTML = `<div class="mt-card mt-pan">${o.kicker ? `<p class="mt-k">${o.kicker}</p>` : ''}<h3>${o.title}</h3>${o.text ? `<p class="mt-t">${o.text}</p>` : ''}${sc}<div class="mt-btns">${(o.buttons || []).map((b, i) => `<button class="g-btn${b[2] ? ' ghost' : ''}" data-b="${i}">${b[0]}</button>`).join('')}</div></div>`;
        ui.onclick = e => { const b = e.target.closest('[data-b]'); if (b) { api.sfx('tap'); o.buttons[+b.dataset.b][1](); } };
      }
      function beginPlay() {
        state = 'play'; ui.hidden = true; ui.dataset.k = ''; mb.hidden = false; acc = 0; PT = []; scorch = []; shake = 0; submitted = false;
        held.clear(); mouseDown = false;
        wrap.style.cursor = mouseIdx >= 0 ? 'none' : '';
      }
      function flush() {
        const evs = S.ev.slice();
        S.ev.length = 0;
        for (const e of evs) fx(e, S);
        if (G.role === 'host' && S !== demo && api.net.connected) api.net.send(snap(evs), !evs.length);
        if (evs.some(e => e[0] === 'over') && S !== demo) matchOver();
      }
      function start(m) {
        mode = m; saved.mode = m; api.save(saved);
        if (m === 'online') { goOnline(); return; }
        const n = 1 + (saved.bots === 2 ? 2 : 1);
        humans = ['L', 'B', 'B'].slice(0, n);
        solo = true; mouseIdx = -1;
        ids = humans.map((h, i) => h === 'L' ? i : -1).filter(i => i >= 0);
        layout(ids);
        S = makeSim({ n, target: +saved.target, portrait: LAY.port });
        humans.forEach((h, i) => { if (h === 'B') S.bots[i] = makeBot(S, i, +saved.skill); });
        S.ctl = t => { if (humans[t.i] === 'L') applyIntent(t, localIntent(t.i)); };
        labels = [touchMode ? 'You' : '↑ ← ↓ → + M', 'CPU', 'CPU'];
        beginPlay();
        S.newRound(); flush(); scoreText(S);
      }
      function matchOver() {
        state = 'over'; mb.hidden = false;
        const sc = S.scores, best = Math.max(...sc), win = sc.indexOf(best);
        let nb = false;
        if (mode === 'cpu' && !G.role && !submitted) { submitted = true; nb = api.submit(sc[0]); }
        let title;
        if (G.role) title = win === 0 ? 'You win!' : (labels[win] || TCOL[win].name) + ' wins';
        else if (mode === 'cpu') title = win === 0 ? 'You win the match!' : 'CPU wins the match';
        else title = TCOL[win].name + ' wins the match!';
        const re = () => {
          if (!G.role) { start(mode); return; }
          hostStart();
        };
        panel({ kicker: nb ? 'New best!' : 'Match over', title, scores: sc, buttons: G.role ? [['Rematch', re], ['Lobby', () => goOnline(), 1], ['Leave', leave, 1]] : [['Rematch', re], ['Menu', leave, 1]] });
      }
      function leave() { if (G.role) { api.net.close(); G.role = null; } showMenu(); }

      const q = v => Math.round(v * 10) / 10;
      const decim = P => { const o = []; for (let i = 0; i < P.length; i += 6) o.push(q(P[i]), q(P[i + 1])); o.push(q(P[P.length - 2]), q(P[P.length - 1])); return o; };
      function snap(E) {
        return {
          t: 's', k: S.tick, rd: S.round, fz: S.frozen ? 1 : 0, bl: S.blank ? 1 : 0, ov: S.over ? 1 : 0, sc: S.scores.slice(),
          T: S.tanks.map(t => [q(t.x), q(t.y), q(t.rot), t.alive ? 1 : 0, WI[t.w], t.gat ? t.gat.spin + 1 : 0, t.remote ? 1 : 0, t.laserReady ? 1 : 0]),
          B: S.shots.map(s => [s.id, SK.indexOf(s.k), q(s.x), q(s.y), s.k === 'x' ? s.fade : Math.round(s.a || 0), s.o.i]),
          M: S.mines.map(m => [m.id, q(m.x), q(m.y), (m.landed ? 1 : 0) | (m.armed ? 2 : 0) | (m.det ? 4 : 0), m.o.i]),
          C: S.crates.map(c => [c.x, c.y, WI[c.w], Math.round(c.s * 100) / 100, c.rot]),
          L: S.beams.map(b => [b.o.i].concat(b.draw.map(q))),
          R: S.rays.map(r => [r.o.i, q(r.x), q(r.y), q(r.ball), r.thick, r.on ? 1 : 0, r.pts ? decim(r.pts) : 0]),
          E
        };
      }
      const bits = a => Array.from(a).join('');
      const unbits = s => Uint8Array.from(s, ch => ch === '1' ? 1 : 0);
      function sendMaze(id) { const m = { t: 'mz', rd: S.round, W: S.m.W, H: S.m.H, h: bits(S.m.hw), v: bits(S.m.vw) }; if (id) api.net.sendTo(id, m); else api.net.send(m); }
      function hookNet() {
        G.hooked = true;
        api.net.on('data', (d, from) => {
          if (!d || !G.role) return;
          if (G.role === 'host') {
            const i = G.pids.indexOf(from);
            if (i < 1) return;
            if (d.t === 'hi') { G.hi[from] = 1; G.port[from] = !!d.p; if (state === 'wait' && G.players.every((x, k) => !k || G.hi[x.id])) hostStart(); }
            else if (d.t === 'i' && humans[i] === 'N') {
              if (d.s != null) { if (!(d.s > (G.is[from] || 0))) return; G.is[from] = d.s; }
              G.ni[i] = { k: d.k | 0, a: typeof d.a === 'number' ? d.a : null, mv: d.mv ? 1 : 0, rv: d.rv ? 1 : 0, fire: d.f ? 1 : 0 };
              if (d.p > (G.lp[i] || 0)) { G.lp[i] = d.p; if (S && S !== demo && state === 'play' && S.tanks[i]) { S.tanks[i].ctl.fire = 1; S.tryFire(S.tanks[i]); } }
            }
          } else {
            if (d.t === 'cfg') {
              G.n = d.n; G.target = d.target; G.me = d.me | 0; G.buf = []; G.mazes = {}; G.offSet = false; G.overShown = false;
              humans = Array.from({ length: d.n }, (_, i) => i === G.me ? 'L' : 'N'); solo = true; mouseIdx = -1; ids = [G.me];
              layout([G.me]); setLabels(d.names); guestView = null; S = null;
              beginPlay();
            } else if (d.t === 'names') setLabels(d.names);
            else if (d.t === 'mz') G.mazes[d.rd] = Maze(d.W, d.H, unbits(d.h), unbits(d.v));
            else if (d.t === 's') {
              d.rt = performance.now();
              const o = d.rt - d.k * 40;
              G.off = G.offSet ? Math.min(o, G.off + 1) : o; G.offSet = true;
              const B = G.buf;
              let j = B.length;
              while (j > 0 && B[j - 1].k > d.k) j--;
              if (j > 0 && B[j - 1].k === d.k) return;
              B.splice(j, 0, d);
            }
          }
        });
        api.net.on('leave', pl => {
          if (G.role !== 'host' || !pl) return;
          const i = G.pids.indexOf(pl.id);
          if (i < 1) return;
          G.pids[i] = null; G.players = G.players.filter(x => x.id !== pl.id);
          if (state === 'wait') { if (G.players.every((x, k) => !k || G.hi[x.id])) hostStart(); return; }
          if (!S || S === demo || humans[i] !== 'N') return;
          humans[i] = 'X'; G.ni[i] = null;
          S.drop(i);
          api.toast(pl.name + ' left the game.');
        });
        api.net.on('rejoin', pl => {
          if (G.role !== 'host' || !pl || !S || S === demo) return;
          const i = G.pids.indexOf(pl.id);
          if (i < 1) return;
          api.net.sendTo(pl.id, { t: 'cfg', n: S.n, target: S.target, me: i, names: G.names });
          sendMaze(pl.id);
        });
        api.net.on('lobby', () => { if (G.role === 'guest') goOnline(); });
        api.net.on('close', why => {
          if (!G.role) return;
          G.role = null; state = 'left'; mb.hidden = true;
          S = demo; guestView = null;
          panel({ kicker: 'Online', title: why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost', text: why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.', buttons: [['Online lobby', () => goOnline()], ['Menu', showMenu, 1]] });
          api.sfx('lose');
        });
      }
      function setLabels(names) {
        labels = Array.from({ length: G.n }, (_, i) => i === G.me ? 'You' : String((names && names[i]) || 'CPU').slice(0, 16));
      }
      async function goOnline() {
        if (!G.hooked) hookNet();
        state = 'wait'; ui.hidden = true; mb.hidden = true; G.role = null; S = demo; guestView = null;
        const r = await api.net.room({ title: 'Tank Trouble', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 3, min: 2, max: 8, bots: true });
        if (!api.alive) return;
        if (!r) { showMenu(); return; }
        G.role = r.role; G.press = 0; G.hi = {}; G.port = {}; G.lp = [];
        if (r.role === 'host') {
          G.players = r.players.slice(0, 8); G.bots = !!r.bots; G.size = +r.size || G.players.length; G.pids = G.players.map(x => x.id);
          state = 'wait';
          panel({ kicker: 'Online', title: 'Everyone is in', text: 'Starting…', buttons: [['Leave', leave, 1]] });
          clearTimeout(G.wait);
          G.wait = setTimeout(() => { if (api.alive && G.role === 'host' && state === 'wait') hostStart(); }, 2500);
        } else { panel({ kicker: 'Online', title: 'Connected', text: 'Waiting for the host…', buttons: [['Leave', leave, 1]] }); api.net.send({ t: 'hi', p: coarse && innerHeight > innerWidth * 1.1 }); }
      }
      function hostStart() {
        clearTimeout(G.wait);
        G.players = G.players.filter((x, k) => !k || api.net.players.some(q => q.id === x.id && !q.away));
        G.pids = G.players.map(x => x.id);
        const k = G.players.length, n = Math.min(8, Math.max(k, G.bots ? G.size : k));
        humans = Array.from({ length: n }, (_, i) => i === 0 ? 'L' : i < k ? 'N' : 'B'); solo = true; mouseIdx = -1; ids = [0];
        layout([0]);
        const ports = G.players.slice(1).filter(x => G.port[x.id]).length + (LAY.port ? 1 : 0);
        S = makeSim({ n, target: +saved.target, portrait: ports * 2 > k });
        humans.forEach((h, i) => { if (h === 'B') S.bots[i] = makeBot(S, i, +saved.skill); });
        G.ni = []; G.lp = [];
        S.ctl = t => { if (humans[t.i] === 'L') applyIntent(t, localIntent(t.i)); else if (humans[t.i] === 'N') applyIntent(t, G.ni[t.i] || null); };
        G.names = humans.map((h, i) => h === 'B' ? 'CPU' : G.players[i].name);
        labels = G.names.map((x, i) => i === 0 ? 'You' : x);
        G.pids.forEach((id, i) => { if (i) api.net.sendTo(id, { t: 'cfg', n, target: S.target, me: i, names: G.names }); });
        beginPlay();
        S.newRound(); flush(); scoreText(S);
      }
      function guestInput(now, force) {
        if (!LAY) return;
        const it = localIntent(G.me);
        const msg = { t: 'i', k: it.k, a: it.a == null ? null : Math.round(it.a), mv: it.mv, rv: it.rv, f: it.fire, p: G.press };
        const sig = msg.k + ',' + msg.a + ',' + msg.mv + ',' + msg.f + ',' + msg.p;
        if (force || sig !== G.sig || now - G.lastSend > 50) { const hard = msg.k + ',' + msg.mv + ',' + msg.rv + ',' + msg.f + ',' + msg.p, ch = force || hard !== G.hard; G.sig = sig; G.hard = hard; G.lastSend = now; msg.s = ++G.isq; api.net.send(msg, !ch); }
      }
      function guestFrame(now) {
        const B = G.buf;
        if (!B.length) return guestView;
        const r = (now - G.off) / 40 - CFG.netDelay;
        const prevSc = guestView && guestView.scores;
        for (const s of B) { if (s.k > r) break; if (!s.done) { s.done = 1; const V = { scores: s.sc }; for (const e of s.E) fx(e, V); } }
        while (B.length > 2 && B[1].k <= r) B.shift();
        const A = B[0];
        let C = B.length > 1 && A.k <= r ? B[1] : A;
        if (C.rd !== A.rd) C = A;
        const al = C === A ? 0 : Math.max(0, Math.min(1, (r - A.k) / (C.k - A.k)));
        const m = G.mazes[A.rd];
        if (!m) return guestView;
        const tanks = A.T.map((a, i) => { const c = C.T[i] || a; return { i, px: a[0], py: a[1], prot: a[2], x: c[0], y: c[1], rot: c[2], alive: !!a[3], w: WN[a[4]], gat: a[5] ? { spin: a[5] - 1 } : null, remote: !!a[6], laserReady: !!a[7] }; });
        const prev = new Map(A.B.map(b => [b[0], b]));
        const shots = C.B.map(b => { const p = prev.get(b[0]) || b, k = SK[b[1]]; return { id: b[0], k, px: p[2], py: p[3], x: b[2], y: b[3], a: b[4], fade: k === 'x' ? b[4] : 0, o: tanks[b[5]] || { i: b[5] } }; });
        const pm = new Map(A.M.map(b => [b[0], b]));
        const mines = C.M.map(b => { const p = pm.get(b[0]) || b; return { px: p[1], py: p[2], x: b[1], y: b[2], landed: !!(b[3] & 1), armed: !!(b[3] & 2), det: !!(b[3] & 4), o: b[4] }; });
        const crates = C.C.map(c => ({ x: c[0], y: c[1], w: WN[c[2]], s: c[3], rot: c[4] }));
        const beams = C.L.map(b => ({ o: tanks[b[0]], draw: b.slice(1) }));
        const rays = C.R.map(b => ({ o: tanks[b[0]], x: b[1], y: b[2], ball: b[3], thick: b[4], on: !!b[5], pts: b[6] || null }));
        guestView = { m, tick: A.k, blank: !!A.bl, frozen: !!A.fz, over: !!A.ov, scores: A.sc, tanks, shots, mines, crates, beams, rays, al };
        if (!prevSc || prevSc.join() !== A.sc.join()) scoreText(guestView);
        if (A.ov && !G.overShown && A.done) {
          G.overShown = true; state = 'over';
          const sc = A.sc, best = Math.max(...sc), win = sc.indexOf(best);
          panel({ kicker: 'Match over', title: win === G.me ? 'You win!' : (labels[win] || TCOL[win].name) + ' wins', text: 'Waiting for the host to start a rematch…', scores: sc, buttons: [['Leave', leave, 1]] });
        }
        return guestView;
      }

      api.loop((dt, now) => {
        if (G.role === 'guest') {
          if (state === 'play') guestInput(now, false);
          const V = guestFrame(now);
          render(V, V ? V.al : 0);
        } else if (S) {
          acc += dt;
          let n = 0;
          while (acc >= STEP && n < 4) { acc -= STEP; n++; S.step(); flush(); }
          if (n === 4) acc = 0;
          render(S, acc / STEP);
        } else render(null, 0);
        updParticles(dt);
        if (S === demo && demo && demo.over) showMenu();
      });

      ENG.live = () => ({ S, state, G, guestView, LAY });
      layout([]);
      if (api.net.invite) { showMenu(); ui.hidden = true; mode = 'online'; goOnline(); }
      else showMenu();
      return { destroy() { ENG.live = null; try { if (AC) AC.close(); } catch (e) {} AC = null; } };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mzt-bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#86d46f"/><stop offset="1" stop-color="#3b9536"/></radialGradient></defs><rect width="400" height="300" fill="url(#mzt-bg)"/><g transform="rotate(-4 200 150)"><rect x="54" y="43" width="300" height="226" rx="5" fill="#1f4a1a" opacity=".3"/><rect x="46" y="33" width="308" height="234" rx="5" fill="#262626"/><rect x="55" y="42" width="290" height="216" fill="#ebebeb"/><g fill="#000" opacity=".14"><rect x="53" y="41" width="300" height="10"/><rect x="53" y="257" width="300" height="10"/><rect x="53" y="41" width="10" height="226"/><rect x="343" y="41" width="10" height="226"/><rect x="113" y="41" width="10" height="70"/><rect x="113" y="101" width="70" height="10"/><rect x="233" y="41" width="10" height="130"/><rect x="173" y="161" width="70" height="10"/><rect x="53" y="161" width="70" height="10"/><rect x="173" y="161" width="10" height="106"/><rect x="293" y="101" width="60" height="10"/><rect x="293" y="101" width="10" height="70"/><rect x="233" y="214" width="70" height="10"/><rect x="293" y="214" width="10" height="53"/></g><g fill="#4d4d4d"><rect x="50" y="37" width="300" height="10"/><rect x="50" y="253" width="300" height="10"/><rect x="50" y="37" width="10" height="226"/><rect x="340" y="37" width="10" height="226"/><rect x="110" y="37" width="10" height="70"/><rect x="110" y="97" width="70" height="10"/><rect x="230" y="37" width="10" height="130"/><rect x="170" y="157" width="70" height="10"/><rect x="50" y="157" width="70" height="10"/><rect x="170" y="157" width="10" height="106"/><rect x="290" y="97" width="60" height="10"/><rect x="290" y="97" width="10" height="70"/><rect x="230" y="210" width="70" height="10"/><rect x="290" y="210" width="10" height="53"/></g><path d="M112 212 L205 128 L272 188" fill="none" stroke="#1d1d1d" stroke-width="4" stroke-dasharray="1 11" stroke-linecap="round"/><circle cx="205" cy="128" r="6" fill="#1d1d1d"/><circle cx="150" cy="178" r="6" fill="#1d1d1d"/><g transform="translate(96 226) rotate(48) scale(0.95)"><rect x="-19" y="-24" width="42" height="56" rx="7" fill="#000" opacity=".22" transform="translate(5 7)"/><rect x="-21" y="-28" width="12" height="56" rx="4" fill="#2c5e22"/><rect x="9" y="-28" width="12" height="56" rx="4" fill="#2c5e22"/><rect x="-15" y="-25" width="30" height="50" rx="6" fill="#4a9c3a" stroke="#2c5e22" stroke-width="3"/><rect x="-5" y="-42" width="10" height="34" rx="3" fill="#66bb52" stroke="#2c5e22" stroke-width="3"/><circle cy="2" r="12" fill="#66bb52" stroke="#2c5e22" stroke-width="3"/><circle cx="-4" cy="-2" r="4" fill="#fff" opacity=".3"/></g><g transform="translate(270 190)"><circle r="34" fill="#ff9a2e" opacity=".85"/><circle r="22" fill="#ffd36b"/><circle r="11" fill="#fff6d0"/><path d="M-44 -6l-14-4M40 -18l16-8M8 42l4 16M-26 34l-12 12M30 30l12 12M-8 -44l-2-16" stroke="#ff7a1a" stroke-width="6" stroke-linecap="round"/></g><g transform="translate(312 212) rotate(-120) scale(0.8)"><rect x="-19" y="-24" width="42" height="56" rx="7" fill="#000" opacity=".22" transform="translate(5 7)"/><rect x="-21" y="-28" width="12" height="56" rx="4" fill="#7b2018"/><rect x="9" y="-28" width="12" height="56" rx="4" fill="#7b2018"/><rect x="-15" y="-25" width="30" height="50" rx="6" fill="#c9382b" stroke="#7b2018" stroke-width="3"/><rect x="-5" y="-42" width="10" height="34" rx="3" fill="#e5553f" stroke="#7b2018" stroke-width="3"/><circle cy="2" r="12" fill="#e5553f" stroke="#7b2018" stroke-width="3"/><circle cx="-4" cy="-2" r="4" fill="#fff" opacity=".3"/></g><g fill="#7b2018"><path d="M236 150l12 4-6 9z"/><path d="M300 160l12-4 1 11z"/></g><g transform="translate(282 66) rotate(14)"><rect x="-15" y="-15" width="30" height="30" rx="5" fill="#000" opacity=".18" transform="translate(3 4)"/><rect x="-15" y="-15" width="30" height="30" rx="5" fill="#fafafa" stroke="#4d4d4d" stroke-width="3"/><path d="M-8 7 L-2 -4 L3 3 L8 -7" fill="none" stroke="#4d4d4d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g></g></svg>`;
})();

