(() => {
  'use strict';
  const ID = 'tower-of-peril', G = '.gm-' + ID;
  const CFG = { dt: 1 / 120, grav: 196.2, jumpV: 50, walk: 16, sprint: 0, accG: 150, accA: 120, decG: 170, decA: 110, accIce: 40, maxFall: 160, rad: 1.1, hgt: 5, coyote: 0.07, jbuf: 0.12, slope: 0.64, climbV: 12, stepH: 1.3, turn: 14 };
  const MODES = [{ n: 'Short', secs: 4, time: 240, pick: 2, gear: true }, { n: 'Normal', secs: 6, time: 480, pick: 0, gear: true }, { n: 'Pro', secs: 12, time: 600, pick: 1, gear: false }];
  const LEVELS = ['Easy', 'Normal', 'Hard', 'Hardest'];
  const GEAR = [{ n: 'Speed Coil', d: 'Run 25% faster for one round', cost: 40, spd: 1.25, grav: 1, col: '#3fa8ff' }, { n: 'Gravity Coil', d: 'Jump higher and fall slower for one round', cost: 40, spd: 1, grav: 0.72, col: '#b06bff' }, { n: 'Fusion Coil', d: 'Both at once, a little weaker', cost: 70, spd: 1.15, grav: 0.82, col: '#ff8a3a' }];
  const MUTS = [{ k: 'time', n: 'Extra Time', d: 'Two more minutes on the clock', cost: 50 }, { k: 'len', n: 'Lengthen', d: 'One more section', cost: 40 }, { k: 'lowg', n: 'Low Gravity', d: 'Everyone falls 25% slower', cost: 60 }, { k: 'fast', n: 'High Speed', d: 'Everyone runs 25% faster', cost: 60 }, { k: 'inv', n: 'Invincibility', d: 'Kill bricks do nothing', cost: 120 }, { k: 'fog', n: 'Foggy', d: 'Thick fog in the tower', cost: 25 }, { k: 'neg', n: 'Negative', d: 'All colours inverted', cost: 25 }];
  const SHIRTS = ['#e8423a', '#3a8ee8', '#3cc45a', '#f2c230', '#9b59e8', '#ff7ab8', '#1f2a44', '#f4f4f4', '#ff8a2a', '#22c7c7'];
  const PANTS = ['#2a3550', '#3b2a20', '#555c6b', '#16161c', '#2f5ea8', '#6b3a8a'];
  const SKINS = ['#ffd6a8', '#f2b98a', '#c98a5a', '#8a5a3a', '#ffe1c2', '#f5c99c'];
  const HATS = [{ n: 'None', cost: 0 }, { n: 'Cap', cost: 80 }, { n: 'Beanie', cost: 120 }, { n: 'Party Hat', cost: 200 }, { n: 'Viking Helmet', cost: 350 }, { n: 'Crown', cost: 600 }, { n: 'Halo', cost: 900 }];
  const NA = ['Turbo', 'Pixel', 'Lucky', 'Sneaky', 'Mega', 'Tiny', 'Captain', 'Blocky', 'Speedy', 'Ninja', 'Super', 'Cosmic', 'Happy', 'Wild', 'Brave', 'Fuzzy'];
  const NB = ['Fox', 'Panda', 'Toast', 'Cube', 'Noodle', 'Duck', 'Taco', 'Bean', 'Waffle', 'Rocket', 'Otter', 'Moose', 'Pickle', 'Comet', 'Gecko', 'Muffin'];
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const wrapA = a => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const rng = s => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const tr = s => { try { if (typeof window !== 'undefined' && window.gpI18n && gpI18n.lang !== 'en') { const v = gpI18n.t(s); if (typeof v === 'string') return v; } } catch (e) {} return s; };
  const tf = (s, o) => tr(s).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function setRot(c, ya, pi, ro) {
    const cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pi), sp = Math.sin(pi), cr = Math.cos(ro), sr = Math.sin(ro), m = c.m;
    m[0] = cy * cr + sy * sp * sr; m[1] = -cy * sr + sy * sp * cr; m[2] = sy * cp;
    m[3] = cp * sr; m[4] = cp * cr; m[5] = -sp;
    m[6] = -sy * cr + cy * sp * sr; m[7] = sy * sr + cy * sp * cr; m[8] = cy * cp;
  }
  function mkCol(p) {
    const c = { t: p.cyl ? 1 : 0, x: p.x, y: p.y, z: p.z, hx: p.hx, hy: p.hy, hz: p.hz, yaw: p.yaw || 0, pitch: p.pitch || 0, roll: p.roll || 0, m: new Float64Array(9), y0: p.yaw || 0, p0: p.pitch || 0, r0: p.roll || 0, bx: p.x, bY: p.y, bz: p.z, px: p.x, py: p.y, pz: p.z, pyaw: p.yaw || 0, vx: 0, vy: 0, vz: 0, w: 0, on: true, warn: 0, kill: !!p.kill, ice: !!p.ice, climb: !!p.climb, bounce: p.bounce || 0, cvx: p.cvx || 0, cvz: p.cvz || 0, mv: p.mv || null, fin: !!p.fin, ghost: !!p.ghost, qs: 0, id: 0, minY: 0, maxY: 0, ex: 0, ez: 0, br: 0, part: p };
    setRot(c, c.yaw, c.pitch, c.roll);
    return c;
  }
  function moverPose(c, t, o) {
    const v = c.mv;
    o.x = c.bx; o.y = c.bY; o.z = c.bz; o.yaw = c.y0; o.pitch = c.p0; o.roll = c.r0; o.on = true; o.warn = 0;
    if (v.t === 's') { const k = 0.5 - 0.5 * Math.cos(TAU * (t / v.p + v.ph)); o.x += v.ax * k; o.y += v.ay * k; o.z += v.az * k; }
    else if (v.t === 'r') { const a = v.w * t + v.ph, cs = Math.cos(a), sn = Math.sin(a); o.x = v.cx + cs * v.ox + sn * v.oz; o.z = v.cz - sn * v.ox + cs * v.oz; o.yaw = c.y0 + a; }
    else if (v.t === 'w') { const a = v.a * Math.sin(TAU * (t / v.p + v.ph)), cy = Math.cos(c.y0), sy = Math.sin(c.y0), sa = Math.sin(a), ca = Math.cos(a); o.pitch = a; o.x = v.cx - v.l * sy * sa; o.y = v.cy - v.l * ca; o.z = v.cz - v.l * cy * sa; }
    else if (v.t === 'b') { const P = v.on + v.off, q = (((t + v.ph * P) % P) + P) % P; o.on = q < v.on; o.warn = o.on && q > v.on - 0.7 ? 1 : 0; }
    return o;
  }
  const PO = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, on: true, warn: 0 };
  function setMover(c, t, dt) {
    moverPose(c, t - dt, PO); c.px = PO.x; c.py = PO.y; c.pz = PO.z; c.pyaw = PO.yaw;
    moverPose(c, t, PO); c.x = PO.x; c.y = PO.y; c.z = PO.z; c.yaw = PO.yaw; c.pitch = PO.pitch; c.roll = PO.roll; c.on = PO.on; c.warn = PO.warn;
    c.vx = (c.x - c.px) / dt; c.vy = (c.y - c.py) / dt; c.vz = (c.z - c.pz) / dt; c.w = wrapA(c.yaw - c.pyaw) / dt;
    setRot(c, c.yaw, c.pitch, c.roll);
  }
  function envelope(c) {
    const pts = [];
    const corners = o => { const m = c.m; for (let i = 0; i < 8; i++) { const lx = (i & 1 ? 1 : -1) * c.hx, ly = (i & 2 ? 1 : -1) * c.hy, lz = (i & 4 ? 1 : -1) * c.hz; pts.push([o.x + m[0] * lx + m[1] * ly + m[2] * lz, o.y + m[3] * lx + m[4] * ly + m[5] * lz, o.z + m[6] * lx + m[7] * ly + m[8] * lz]); } };
    if (c.mv && c.mv.t !== 'b') {
      const P = c.mv.p || (TAU / Math.max(0.01, Math.abs(c.mv.w || 1)));
      for (let i = 0; i < 48; i++) { setMover(c, P * i / 48, 1 / 120); corners(c); }
      setMover(c, 0, 1 / 120);
    } else corners(c);
    let a = 1e9, b = -1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (const p of pts) { a = Math.min(a, p[1]); b = Math.max(b, p[1]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
    c.minY = a; c.maxY = b; c.x0 = x0; c.x1 = x1; c.z0 = z0; c.z1 = z1; c.ex = (x0 + x1) / 2; c.ez = (z0 + z1) / 2; c.br = Math.hypot(x1 - x0, z1 - z0) / 2;
  }
  function makeWorld(parts, C) {
    const cols = parts.map(mkCol), BY = 6, bk = [];
    let lo = 1e9;
    cols.forEach((c, i) => { c.id = i; envelope(c); lo = Math.min(lo, c.minY); });
    const base = Math.floor(lo / BY);
    cols.forEach(c => { if (c.ghost) return; for (let k = Math.floor(c.minY / BY) - base; k <= Math.floor(c.maxY / BY) - base; k++) (bk[k] || (bk[k] = [])).push(c); });
    const mov = cols.filter(c => c.mv);
    return { C, cols, mov, bk, BY, base, stamp: 1, cand: [], nc: 0, t: 0, mods: { spd: 1, grav: 1, jump: 1, inv: false } };
  }
  function setTime(W, t) { W.t = t; const dt = W.C.dt; for (let i = 0; i < W.mov.length; i++) setMover(W.mov[i], t, dt); }
  function query(W, x, y0, y1, z, r) {
    const s = ++W.stamp, out = W.cand;
    let n = 0;
    const k0 = Math.max(0, Math.floor(y0 / W.BY) - W.base), k1 = Math.min(W.bk.length - 1, Math.floor(y1 / W.BY) - W.base);
    for (let k = k0; k <= k1; k++) {
      const b = W.bk[k]; if (!b) continue;
      for (let i = 0; i < b.length; i++) {
        const c = b[i]; if (c.qs === s) continue; c.qs = s;
        if (c.maxY < y0 || c.minY > y1) continue;
        const dx = x - c.ex, dz = z - c.ez, rr = c.br + r;
        if (dx * dx + dz * dz > rr * rr) continue;
        out[n++] = c;
      }
    }
    W.nc = n;
    return n;
  }
  const CT = { nx: 0, ny: 0, nz: 0, pen: 0, top: 0 };
  function contact(c, px, ya, yb, pz, r, o) {
    const m = c.m, dx = px - c.x, dz = pz - c.z, da = ya - c.y, db = yb - c.y;
    const ax = m[0] * dx + m[3] * da + m[6] * dz, ay = m[1] * dx + m[4] * da + m[7] * dz, az = m[2] * dx + m[5] * da + m[8] * dz;
    const bx = m[0] * dx + m[3] * db + m[6] * dz, by = m[1] * dx + m[4] * db + m[7] * dz, bz = m[2] * dx + m[5] * db + m[8] * dz;
    const ux = bx - ax, uy = by - ay, uz = bz - az, uu = ux * ux + uy * uy + uz * uz || 1e-9;
    let s = 0.5, Px = 0, Py = 0, Pz = 0, Qx = 0, Qy = 0, Qz = 0;
    for (let k = 0; k < 4; k++) {
      Px = ax + ux * s; Py = ay + uy * s; Pz = az + uz * s;
      if (c.t === 1) {
        const rq = Math.hypot(Px, Pz); if (rq > c.hx) { Qx = Px * c.hx / rq; Qz = Pz * c.hx / rq; } else { Qx = Px; Qz = Pz; }
        Qy = clamp(Py, -c.hy, c.hy);
      } else { Qx = clamp(Px, -c.hx, c.hx); Qy = clamp(Py, -c.hy, c.hy); Qz = clamp(Pz, -c.hz, c.hz); }
      const ns = clamp(((Qx - ax) * ux + (Qy - ay) * uy + (Qz - az) * uz) / uu, 0, 1);
      if (Math.abs(ns - s) < 1e-4) { s = ns; break; }
      s = ns;
    }
    Px = ax + ux * s; Py = ay + uy * s; Pz = az + uz * s;
    if (c.t === 1) { const rq = Math.hypot(Px, Pz); if (rq > c.hx) { Qx = Px * c.hx / rq; Qz = Pz * c.hx / rq; } else { Qx = Px; Qz = Pz; } Qy = clamp(Py, -c.hy, c.hy); }
    else { Qx = clamp(Px, -c.hx, c.hx); Qy = clamp(Py, -c.hy, c.hy); Qz = clamp(Pz, -c.hz, c.hz); }
    let lx = Px - Qx, ly = Py - Qy, lz = Pz - Qz;
    const d2 = lx * lx + ly * ly + lz * lz;
    if (d2 >= r * r) return false;
    let pen;
    if (d2 > 1e-10) { const d = Math.sqrt(d2); lx /= d; ly /= d; lz /= d; pen = r - d; }
    else if (c.t === 1) {
      const rq = Math.hypot(Px, Pz), a = c.hx - rq, b = c.hy - Math.abs(Py);
      if (b < a) { lx = 0; lz = 0; ly = Py >= 0 ? 1 : -1; pen = r + b; } else { lx = rq > 1e-6 ? Px / rq : 1; lz = rq > 1e-6 ? Pz / rq : 0; ly = 0; pen = r + a; }
    } else {
      const a = c.hx - Math.abs(Px), b = c.hy - Math.abs(Py), e = c.hz - Math.abs(Pz);
      if (b <= a && b <= e) { lx = 0; ly = Py >= 0 ? 1 : -1; lz = 0; pen = r + b; }
      else if (a <= e) { lx = Px >= 0 ? 1 : -1; ly = 0; lz = 0; pen = r + a; }
      else { lx = 0; ly = 0; lz = Pz >= 0 ? 1 : -1; pen = r + e; }
    }
    o.nx = m[0] * lx + m[1] * ly + m[2] * lz; o.ny = m[3] * lx + m[4] * ly + m[5] * lz; o.nz = m[6] * lx + m[7] * ly + m[8] * lz; o.pen = pen;
    o.top = c.t === 0 && Math.abs(m[4]) > 0.999 ? c.y + c.hy : -1e9;
    return true;
  }
  function newChar(x, y, z) { return { x, y, z, vx: 0, vy: 0, vz: 0, gr: false, gc: null, coy: 0, jb: 0, cl: false, cn: 0, cnx: 0, cnz: 0, dead: false, ev: 0, face: 0, air: 0, fallV: 0, bnc: null, fin: false, land: 0 }; }
  function copyChar(a, b) { for (const k in a) b[k] = a[k]; return b; }
  const IN0 = { mx: 0, mz: 0, jp: false, jh: false, sp: false };
  function stepChar(c, I, W, dt) {
    const C = W.C, M = W.mods;
    c.ev = 0;
    if (c.dead) return;
    const g = c.gc;
    if (c.gr && g) {
      if (g.mv) {
        const da = wrapA(g.yaw - g.pyaw), cs = Math.cos(da), sn = Math.sin(da), lx = c.x - g.px, lz = c.z - g.pz;
        c.x = g.x + cs * lx + sn * lz; c.z = g.z - sn * lx + cs * lz; c.y += g.y - g.py; c.face += da;
      }
      if (g.cvx || g.cvz) { c.x += g.cvx * dt; c.z += g.cvz * dt; }
    }
    const sp = C.walk * M.spd * (I.sp && C.sprint ? C.sprint : 1), tx = I.mx * sp, tz = I.mz * sp, has = I.mx * I.mx + I.mz * I.mz > 1e-4;
    const ice = c.gr && g && g.ice;
    const a = (c.gr ? (ice ? C.accIce : has ? C.accG : C.decG) : (has ? C.accA : C.decA)) * dt;
    let ex = tx - c.vx, ez = tz - c.vz;
    const el = Math.hypot(ex, ez);
    if (el > a) { ex *= a / el; ez *= a / el; }
    c.vx += ex; c.vz += ez;
    if (I.jp) c.jb = C.jbuf; else if (c.jb > 0) c.jb -= dt;
    if (I.jh && c.gr) c.jb = Math.max(c.jb, 1e-3);
    c.coy = c.gr ? C.coyote : c.coy - dt;
    if (c.cl) {
      if (I.jp) { c.cl = false; c.vy = C.jumpV * M.jump * 0.7; c.vx = c.cnx * C.walk * 0.8; c.vz = c.cnz * C.walk * 0.8; c.jb = 0; c.ev |= 1; }
      else { const into = -(I.mx * c.cnx + I.mz * c.cnz); c.vy = into > 0.25 ? C.climbV * M.spd : into < -0.5 ? -C.climbV : 0; }
    } else if (c.jb > 0 && c.coy > 0) {
      c.vy = C.jumpV * M.jump + (c.gr && g && g.vy > 0 ? g.vy : 0); c.jb = 0; c.coy = 0; c.gr = false; c.ev |= 1;
    }
    if (!c.cl) c.vy = Math.max(c.vy - C.grav * M.grav * dt, -C.maxFall);
    c.fallV = c.vy;
    c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
    collide(c, I, W);
    if (has && !c.cl) { const want = Math.atan2(tx, tz); c.face += wrapA(want - c.face) * Math.min(1, dt * C.turn); }
    else if (c.cl) c.face += wrapA(Math.atan2(-c.cnx, -c.cnz) - c.face) * Math.min(1, dt * C.turn);
    c.air = c.gr ? 0 : c.air + dt;
  }
  function collide(c, I, W) {
    const C = W.C, r = C.rad, wasGr = c.gr;
    c.gr = false; c.bnc = null;
    let gc = null, best = 0, cl = false;
    const n = query(W, c.x, c.y - 1.5, c.y + C.hgt + 1.5, c.z, r + 1.5);
    for (let it = 0; it < 3; it++) {
      let any = false;
      for (let i = 0; i < n; i++) {
        const k = W.cand[i];
        if (!k.on) continue;
        if (!contact(k, c.x, c.y + r, c.y + C.hgt - r, c.z, r, CT)) continue;
        if (k.fin) { c.fin = true; continue; }
        if (k.kill && !M_INV(W)) { c.dead = true; c.ev |= 8; return; }
        any = true;
        const nx = CT.nx, ny = CT.ny, nz = CT.nz, pen = CT.pen;
        if (ny > C.slope) {
          c.y += Math.min(pen / ny, pen * 2.5);
          if (k.bounce && c.vy <= k.vy + 1) { c.vy = k.bounce; c.bnc = k; c.ev |= 4; c.jb = 0; continue; }
          if (c.vy < k.vy) c.vy = k.vy > 0 ? 0 : Math.max(c.vy, 0);
          c.gr = true;
          if (ny > best) { best = ny; gc = k; }
        } else if (ny < -0.6) {
          c.x += nx * pen; c.y += ny * pen; c.z += nz * pen;
          if (c.vy > k.vy) c.vy = Math.min(c.vy, k.vy);
        } else {
          const stepUp = CT.top - c.y;
          if (wasGr && stepUp > 0 && stepUp <= C.stepH && c.vy <= 0.5 && !k.climb) { c.y = CT.top + 0.002; c.gr = true; if (ny > best || !gc) { best = Math.max(best, 0.7); gc = k; } continue; }
          c.x += nx * pen; c.y += ny * pen * 0.2; c.z += nz * pen;
          let kvx = k.vx, kvz = k.vz;
          if (k.w) { kvx += k.w * (c.z - k.z); kvz -= k.w * (c.x - k.x); }
          const rv = (c.vx - kvx) * nx + (c.vz - kvz) * nz;
          if (rv < 0) { c.vx -= nx * rv; c.vz -= nz * rv; }
          if (k.climb) {
            const hl = Math.hypot(nx, nz) || 1, cx = nx / hl, cz = nz / hl, into = -(I.mx * cx + I.mz * cz);
            if (into > 0.25 || (c.cl && into > -0.5)) { cl = true; c.cnx = cx; c.cnz = cz; }
          }
        }
      }
      if (!any) break;
    }
    if (cl && !c.gr) { if (!c.cl) c.ev |= 16; c.cl = true; }
    else if (cl && c.gr && (I.mx || I.mz)) { const into = -(I.mx * c.cnx + I.mz * c.cnz); c.cl = into > 0.25; if (c.cl) { c.gr = false; gc = null; } }
    else c.cl = false;
    if (c.cl && c.vy < 0 && !(I.mx || I.mz)) c.vy = 0;
    c.gc = gc;
    if (c.gr && !wasGr) { c.ev |= 2; c.land = -c.fallV; }
  }
  const M_INV = W => W.mods.inv;
  const DIFF = [['Easy', '#5fd35a'], ['Medium', '#f4cf3a'], ['Hard', '#ff9a2e'], ['Difficult', '#ff4b4b'], ['Challenging', '#b8173c']];
  const THEMES = [['#4f8cff', '#9cc4ff', '#2c5fd0'], ['#ffb03a', '#ffe08a', '#e07a16'], ['#3fd0a0', '#a8f0d4', '#1c9a72'], ['#c46cff', '#e3bcff', '#8c3ad6'], ['#ff6f9e', '#ffc2d6', '#d63f72'], ['#7ad1ff', '#d4f1ff', '#3a9ad6'], ['#9bd84a', '#d8f5a8', '#5ea224'], ['#ff8a4f', '#ffd0b4', '#d65a24']];
  function spiral(B, n, rad, a0, da, y0, dy, sz, o) {
    for (let i = 0; i < n; i++) { const a = a0 + da * i, x = rad * Math.cos(a), z = rad * Math.sin(a), y = y0 + dy * i; B.p(x, y, z, sz, sz, Object.assign({ yaw: -a }, o && o(i))); B.w(x, y, z, o && o(i) && o(i).mv ? { m: 1 } : null); }
  }
  const SECTIONS = [
    { n: 'Spiral Steps', d: 0, h: 30, f(B) {
      B.b(0, 18.5, 0, 4, 21, 4, { c: 2 });
      spiral(B, 11, 11.5, 0, 0.62, 2.5, 2.5, 5);
    } },
    { n: 'Pillar Hop', d: 0, h: 26, f(B) {
      const P = [[8.5, 2, 0], [13, 4, -4.5], [13, 6, -11], [7, 8, -13.5], [0, 10, -13.5], [-7, 12, -13.5], [-13, 14, -10], [-13.5, 16, -3], [-13, 18, 4], [-8, 20, 9.5], [-1.5, 22, 12], [5, 23.5, 9]];
      P.forEach(([x, y, z], i) => { B.b(x, y - 1.5, z, 3.5, 3, 3.5, { c: i % 2 }); B.w(x, y, z); });
    } },
    { n: 'Truss Tower', d: 0, h: 30, f(B) {
      B.p(7.75, 0, 0, 7.5, 4, { c: 1 });
      B.truss(12, 0, 0, 1, 4, 10);
      B.p(14.75, 10, -4.95, 4.5, 15.9, { c: 0 });
      B.truss(15, 10, -13.5, 4, 1, 10);
      B.p(2.5, 20, -15.5, 29, 4, { c: 0 });
      B.p(-10, 23, -10, 4, 4, { c: 1 });
      B.p(-9, 26, -2, 4, 4, { c: 2 });
      B.w(10, 0, 0); B.w(15, 10, 0); B.w(15, 10, -11); B.w(15, 20, -15.5); B.w(-10, 20, -15.5); B.w(-10, 23, -10); B.w(-9, 26, -2);
    } },
    { n: 'Ramp Run', d: 0, h: 24, f(B) {
      B.p(7.5, 1, 7.5, 3, 3, { c: 1 });
      B.p(12, 2, 12, 6, 6, { c: 0 }); B.p(12, 8, -12, 6, 6, { c: 0 }); B.p(-12, 14, -12, 6, 6, { c: 0 }); B.p(-12, 20, 12, 6, 6, { c: 0 });
      B.ramp(12, 2, 9, 12, 8, -9, 4, { c: 2 }); B.ramp(9, 8, -12, -9, 14, -12, 4, { c: 2 }); B.ramp(-12, 14, -9, -12, 20, 9, 4, { c: 2 });
      [[13.7, 4.4, 3], [10.3, 6.3, -4], [3, 10.3, -13.7], [-4, 12.3, -10.3], [-13.7, 16.4, -3], [-10.3, 18.3, 4]].forEach(([x, y, z]) => B.k(x, y + 0.6, z, 0.8, 1.2, 0.8));
      B.p(-7, 22, 7, 3, 3, { c: 1 });
      B.w(7.5, 1, 7.5); B.w(12, 2, 11); B.w(12, 2, 9.6, { r: 0.8 }); B.w(12, 8, -12); B.w(9.6, 8, -12, { r: 0.8 }); B.w(-12, 14, -12); B.w(-12, 14, -9.6, { r: 0.8 }); B.w(-12, 20, 12); B.w(-7, 22, 7);
    } },
    { n: 'Bounce House', d: 0, h: 34, f(B) {
      B.p(8, 1, 0, 4, 4, { bounce: 79 }); B.p(13.5, 12, 0, 5, 5, { c: 0 });
      B.p(13.5, 12, -8, 4, 4, { bounce: 79 }); B.p(13.5, 24, -15, 7, 5, { c: 1 });
      B.p(4, 24, -15, 4, 4, { bounce: 79 }); B.p(-2, 31, -9, 4, 4, { c: 2 });
      B.w(8, 1, 0, { k: 1 }); B.w(13.5, 12, 0); B.w(13.5, 12, -8, { k: 1 }); B.w(13.5, 24, -15); B.w(4, 24, -15, { k: 1 }); B.w(-2, 31, -9);
    } },
    { n: 'Grand Stairs', d: 0, h: 24, f(B) {
      B.stairs(5, 0, 0, 1, 0, 6, 1, 2, 5, { c: 0 });
      B.p(18 - 2.75, 6, 0, 5.5, 5, { c: 1 });
      B.stairs(15.25, 6, -2.5, 0, -1, 5, 1, 2, 5, { c: 0, skip: [2] });
      B.p(15.25, 11, -15, 5.5, 5, { c: 1 });
      B.stairs(12.5, 11, -15, -1, 0, 5, 1.2, 2.4, 5, { c: 2, skip: [1, 3] });
      B.k(15.25, 8.6, -7.5, 5, 0.6, 2); B.k(8.9, 11.6, -15, 2.4, 0.6, 5); B.k(4.1, 14, -15, 2.4, 0.6, 5);
      B.p(-3, 16, -15, 5, 5, { c: 1 });
      B.p(-9, 18.5, -9, 4, 4, { c: 0 }); B.p(-9, 21, -2, 4, 4, { c: 2 });
      B.w(16, 6, 0); B.w(15.25, 7, -3.5); B.w(15.25, 10, -9.5); B.w(15.25, 11, -15); B.w(11.3, 12.2, -15); B.w(6.5, 14.6, -15); B.w(1.7, 17, -15); B.w(-3, 16, -15); B.w(-9, 18.5, -9); B.w(-9, 21, -2);
    } },
    { n: 'Conveyor Climb', d: 1, h: 26, f(B) {
      B.p(8, 1, 8, 3, 3, { c: 1 });
      B.p(12.5, 2, 12.5, 5, 5, { c: 0 }); B.p(12.5, 8, -12.5, 5, 5, { c: 0 }); B.p(-12.5, 14, -12.5, 5, 5, { c: 0 });
      B.ramp(12.5, 2, 10, 12.5, 8, -10, 3, { conv: 7 }); B.ramp(10, 8, -12.5, -10, 14, -12.5, 3, { conv: 7 });
      B.p(-12.5, 17, -5, 3, 3, { c: 1 }); B.p(-11, 20, 2, 3, 3, { c: 2 }); B.p(-6.5, 23, 6, 3, 3, { c: 1 });
      B.w(8, 1, 8); B.w(12.5, 2, 12); B.w(12.5, 8, -12.5); B.w(-12.5, 14, -12.5); B.w(-12.5, 17, -5); B.w(-11, 20, 2); B.w(-6.5, 23, 6);
    } },
    { n: 'Shuttle Pads', d: 1, h: 26, f(B) {
      B.p(7, 1, 0, 5, 5, { c: 2, mv: { t: 's', ax: 7, ay: 0, az: 0, p: 4.4, ph: 0 } });
      B.p(14, 4, -9, 5, 5, { c: 0 });
      B.p(8, 7, -13, 5, 5, { c: 2, mv: { t: 's', ax: -16, ay: 0, az: 0, p: 5.6, ph: 0.3 } });
      B.p(-13.5, 10, -13, 5, 5, { c: 0 });
      B.p(-13.5, 10, -4, 5, 5, { c: 2, mv: { t: 's', ax: 0, ay: 8, az: 0, p: 5, ph: 0.1 } });
      B.p(-13.5, 20, 5, 5, 5, { c: 0 });
      B.p(-12, 22, 12, 5, 5, { c: 2, mv: { t: 's', ax: 12, ay: 0, az: 0, p: 4.4, ph: 0.6 } });
      B.p(6, 24, 10, 4, 4, { c: 1 });
      B.w(7, 1, 0, { m: 0 }); B.w(14, 4, -9); B.w(8, 7, -13, { m: 2 }); B.w(-13.5, 10, -13); B.w(-13.5, 10, -4, { m: 4 }); B.w(-13.5, 20, 5); B.w(-12, 22, 12, { m: 6 }); B.w(6, 24, 10);
    } },
    { n: 'Kill Brick Garden', d: 1, h: 24, f(B) {
      const S = [[7.5, 2.5, 0], [11.5, 3.5, -5.5], [10, 4.5, -11.5], [3.5, 5.5, -13], [-3, 6.5, -11], [-9.5, 7.5, -13], [-13, 8.5, -7], [-12, 10, 0], [-12.5, 11.5, 6.5], [-6.5, 13, 12], [0, 14.5, 13], [6.5, 16, 11], [12, 17.5, 7], [8, 20, 1]];
      S.forEach(([x, y, z], i) => { B.b(x, y - 1, z, 3, 2, 3, { c: i % 3 }); B.w(x, y, z); if (i) B.under(S[i - 1], S[i], 3.4, 3); });
    } },
    { n: 'Beam Walk', d: 1, h: 28, f(B) {
      const K = [[8, 2, 0], [8, 2, -12], [-6, 6, -12], [-12, 9, -2], [-12, 13, 10], [2, 17, 12], [12, 20, 6], [10, 23, -6], [4, 25, -9]];
      K.forEach(([x, y, z], i) => B.p(x, y, z, 3, 3, { c: i % 2 ? 1 : 0 }));
      B.beam(8, 2, -1.5, 8, 2, -10.5, 1.2); B.k(8, 2.5, -6, 1.2, 1, 1.2);
      B.beam(6.5, 2, -12, -4.5, 6, -12, 1.2);
      B.beam(-7, 6, -10.5, -11, 9, -3.5, 1.2);
      B.beam(-12, 9, -0.5, -12, 11, 4, 1.2); B.beam(-12, 11, 6, -12, 13, 8.5, 1.2);
      B.beam(-10.5, 13, 10.5, 0.5, 17, 12, 1.2);
      B.beam(3.5, 17, 11, 10.5, 20, 7, 1.2);
      B.beam(12, 20, 4.5, 10.5, 23, -4.5, 1.2);
      B.w(8, 2, 0); B.w(8, 2, -4.2); B.w(8, 2, -8.2); B.w(8, 2, -12); B.w(-6, 6, -12); B.w(-12, 9, -2); B.w(-12, 11, 3.6); B.w(-12, 11, 6.5); B.w(-12, 13, 10); B.w(2, 17, 12); B.w(12, 20, 6); B.w(10, 23, -6); B.w(4, 25, -9);
    } },
    { n: 'Blink Blocks', d: 1, h: 26, f(B) {
      for (let i = 0; i < 10; i++) { const a = 0.62 * i, x = 11 * Math.cos(a), z = 11 * Math.sin(a), y = 2.3 * (i + 1); B.p(x, y, z, 4, 4, { yaw: -a, c: i % 2 ? 0 : 2, mv: { t: 'b', on: 2.2, off: 1.0, ph: i % 2 ? 0.5 : 0 } }); B.w(x, y, z); }
    } },
    { n: 'Lift Shaft', d: 1, h: 34, f(B) {
      B.b(0, 20.5, 0, 4, 25, 4, { c: 1 });
      B.p(9.5, 0, 0, 5, 5, { c: 2, mv: { t: 's', ax: 0, ay: 12, az: 0, p: 6, ph: 0 } });
      B.p(9.5, 14, -9, 5, 5, { c: 0 });
      B.p(0, 14, -12, 5, 5, { c: 2, mv: { t: 's', ax: 0, ay: 12, az: 0, p: 6, ph: 0.5 } });
      B.p(-9.5, 28, -12, 5, 5, { c: 0 }); B.p(-10, 30.5, -3, 4, 4, { c: 1 });
      B.k(13.5, 22, 0, 6, 0.6, 6);
      B.w(9.5, 0, 0, { m: 1 }); B.w(9.5, 14, -9); B.w(0, 14, -12, { m: 3 }); B.w(-9.5, 28, -12); B.w(-10, 30.5, -3);
    } },
    { n: 'Spinner Ring', d: 2, h: 26, f(B) {
      B.p(5.5, 4.5, 0, 2.5, 4, { c: 1 });
      B.ringFloor(9, 7, { c: 0 });
      B.k(11.5, 9.8, 0, 9, 1.6, 1.2, { mv: { t: 'r', w: 1.3, ph: 0, cx: 0, cz: 0, ox: 11.5, oz: 0 } });
      B.k(-11.5, 9.8, 0, 9, 1.6, 1.2, { mv: { t: 'r', w: 1.3, ph: 0, cx: 0, cz: 0, ox: -11.5, oz: 0 } });
      const P = [[13.5, 13, 13.5], [13.5, 16.5, 5.5], [13, 20, -2.5], [7, 23, -9]];
      P.forEach(([x, y, z], i) => { B.p(x, y, z, 4, 4, { c: 1 + (i % 2) }); });
      B.w(5.5, 4.5, 0); B.w(9, 9, 1.5); B.w(15, 9, 8.5); P.forEach(([x, y, z]) => B.w(x, y, z));
    } },
    { n: 'Turntables', d: 2, h: 26, f(B) {
      const D = [[9, 2, 0, 1.2], [11, 5, -10, -1.4], [2, 8, -13, 1.6], [-8, 11, -11, -1.2], [-12, 14, -1, 1.8], [-8, 17, 9, -1.6], [1, 20, 11, 1.4], [9, 23, 6, -1.5]];
      D.forEach(([x, y, z, w], i) => {
        B.disc(x, y, z, 4, { c: i % 3, mv: { t: 'r', w, ph: 0, cx: x, cz: z, ox: 0, oz: 0 } });
        B.k(x + 3.1, y + 1, z, 0.8, 2, 0.8, { mv: { t: 'r', w, ph: 0, cx: x, cz: z, ox: 3.1, oz: 0 } });
        B.w(x, y, z, { m: i * 2 });
      });
    } },
    { n: 'Narrow Beams', d: 2, h: 24, f(B) {
      const Q = [[8, 1.5, 0], [8, 4.5, -14.5], [-8.5, 7.5, -14.5], [-8.5, 9.5, -4.5], [-8.5, 12.5, 12.5], [10.5, 16, 12.5], [11, 19, 5.5], [7, 21.5, 0]];
      Q.forEach(([x, y, z], i) => B.p(x, y, z, 2.5, 2.5, { c: i % 2 }));
      [[8, 1.5, -1.25, 8, 3, -7], [8, 3, -9.5, 8, 4.5, -13.25], [6.75, 4.5, -14.5, 1, 6, -14.5], [-1.5, 6, -14.5, -7.25, 7.5, -14.5], [-8.5, 7.5, -13.25, -8.5, 9.5, -5.75], [-8.5, 9.5, -3.25, -8.5, 11, 4], [-8.5, 11, 6.5, -8.5, 12.5, 11.25], [-7.25, 12.5, 12.5, 0, 14.5, 12.5], [2.5, 14.5, 12.5, 9.25, 16, 12.5]].forEach(([a, b, c, d, e, f], i) => { B.beam(a, b, c, d, e, f, 0.9); if (i) B.under([a, b, c], [d, e, f], 3, 3); });
      B.w(8, 1.5, 0); B.w(8, 3, -6.5); B.w(8, 3, -10.2); B.w(8, 4.5, -14.5); B.w(1.5, 6, -14.5); B.w(-2.2, 6, -14.5); B.w(-8.5, 7.5, -14.5); B.w(-8.5, 9.5, -4.5); B.w(-8.5, 11, 3.5); B.w(-8.5, 11, 7.2); B.w(-8.5, 12.5, 12.5); B.w(-0.5, 14.5, 12.5); B.w(3.2, 14.5, 12.5); B.w(10.5, 16, 12.5); B.w(11, 19, 5.5); B.w(7, 21.5, 0);
    } },
    { n: 'Ice Rink', d: 2, h: 26, f(B) {
      const I = [[9.5, 1.5, 0, 6], [12.5, 4.5, -10.5, 6], [3, 7.5, -13, 6], [-8, 10.5, -12.5, 6], [-12.5, 13.5, -2, 6], [-11, 16.5, 9, 6], [-1, 19.5, 12.5, 6], [8, 22.5, 6.5, 5]];
      I.forEach(([x, y, z, s], i) => { B.p(x, y, z, s, s, { ice: 1, c: i % 2 }); const l = Math.hypot(x, z); if (i % 2) B.k(x + 2.2 * x / l, y + 0.75, z + 2.2 * z / l, 1.2, 1.5, 1.2); B.w(x, y, z); });
    } },
    { n: 'Pendulums', d: 2, h: 26, f(B) {
      B.p(9.5, 0, 0, 11, 3, { c: 0 }); B.p(15, 0, 0, 4, 4, { c: 1 }); B.p(15, 3.5, -7, 4, 4, { c: 1 });
      B.p(0, 7, -13, 26, 3, { c: 0 }); B.p(-15, 7, -13, 4, 4, { c: 1 }); B.p(-15, 10.5, -6, 4, 4, { c: 1 }); B.p(-15, 14, 1, 4, 4, { c: 1 });
      B.p(-2.5, 17, 8, 21, 3, { c: 0 }); B.p(11, 20, 4, 4, 4, { c: 1 }); B.p(8, 23, -1, 4, 4, { c: 2 });
      const pend = (x, top, z, ph, along) => B.pend(x, top, z, 7.5, 0.95, 2.6, ph, along);
      pend(8, 0, 0, 0, 'x'); pend(12, 0, 0, 0.5, 'x');
      pend(8, 7, -13, 0.2, 'x'); pend(0, 7, -13, 0.7, 'x'); pend(-8, 7, -13, 0.45, 'x');
      pend(-6, 17, 8, 0.1, 'x'); pend(2, 17, 8, 0.6, 'x');
      B.w(5.8, 0, 0); B.w(10, 0, 0); B.w(15, 0, 0); B.w(15, 3.5, -7); B.w(12, 7, -13); B.w(4, 7, -13); B.w(-4, 7, -13); B.w(-15, 7, -13); B.w(-15, 10.5, -6); B.w(-15, 14, 1); B.w(-11, 17, 8); B.w(-2, 17, 8); B.w(6, 17, 8); B.w(11, 20, 4); B.w(8, 23, -1);
    } },
    { n: 'Laser Gates', d: 3, h: 26, f(B) {
      const P = [[9, 1, 0], [12, 4, -8], [6, 7, -13], [-3, 10, -13], [-11, 13, -10], [-13, 16, -2], [-11, 19, 6], [-4, 22, 9]];
      P.forEach(([x, y, z], i) => B.p(x, y, z, 4, 4, { c: i % 2 }));
      let px = 0, py = 0, pz = 0;
      P.forEach(([x, y, z], i) => {
        const mx = (px + x) / 2, mz = (pz + z) / 2, yaw = Math.atan2(x - px, z - pz);
        B.k(mx, py + 4.5, mz, 0.35, 9 + (y - py), 5, { yaw: yaw + Math.PI / 2, laser: 1, mv: { t: 'b', on: 1.4, off: 1.3, ph: (i * 0.37) % 1 } });
        px = x; py = y; pz = z;
      });
      P.forEach(([x, y, z]) => B.w(x, y, z));
    } },
    { n: 'Spin Cycle', d: 3, h: 30, f(B) {
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; B.b(7 * Math.cos(a), 8.5, -7 * Math.sin(a), 3, 1, 14, { c: 2, yaw: a + Math.PI / 2, mv: { t: 'r', w: 0.9, ph: 0, cx: 0, cz: 0, ox: 7 * Math.cos(a), oz: -7 * Math.sin(a) } }); }
      B.disc(0, 9, 0, 2.5, { c: 1, mv: { t: 'r', w: 0.9, ph: 0, cx: 0, cz: 0, ox: 0, oz: 0 } });
      B.p(8, 2, 8, 3, 3, { c: 0 }); B.p(13.5, 5.5, 13.5, 4, 4, { c: 0 });
      B.p(-13.5, 12, 13.5, 4, 4, { c: 0 }); B.p(-13.5, 15.5, 6, 4, 4, { c: 1 }); B.p(-13, 19, -1.5, 4, 4, { c: 0 }); B.p(-12, 22.5, -9, 4, 4, { c: 1 }); B.p(-5, 25.5, -12, 4, 4, { c: 0 }); B.p(-3, 27, -7.5, 4, 3, { c: 1 });
      B.w(8, 2, 8); B.w(13.5, 5.5, 13.5); B.w(11.5, 9, 0, { m: 0 }); B.w(-13.5, 12, 13.5); B.w(-13.5, 15.5, 6); B.w(-13, 19, -1.5); B.w(-12, 22.5, -9); B.w(-5, 25.5, -12); B.w(-3, 27, -7.5);
    } },
    { n: 'Tiny Tiles', d: 3, h: 24, f(B) {
      for (let i = 0; i < 9; i++) { const a = 0.55 * i, x = 12 * Math.cos(a), z = 12 * Math.sin(a), y = 2.2 * (i + 1); B.p(x, y, z, 1.6, 1.6, { yaw: -a, c: i % 3 }); B.w(x, y, z, { r: 0.9 }); }
      const a = 0.55 * 8.9;
      B.p(6.8 * Math.cos(a), 21.5, 6.8 * Math.sin(a), 1.6, 1.6, { c: 1 }); B.w(6.8 * Math.cos(a), 21.5, 6.8 * Math.sin(a), { r: 0.9 });
    } },
    { n: 'Piston Floor', d: 3, h: 24, f(B) {
      for (let i = 0; i < 10; i++) {
        const a = -0.58 * i - 0.2, rr = 11.5, x = rr * Math.cos(a), z = rr * Math.sin(a), top = 2 + 1.8 * i, len = 4;
        B.b(x, top - len / 2, z, 3.5, len, 3.5, { c: i % 3, mv: { t: 's', ax: 0, ay: -2.4, az: 0, p: 3, ph: (i * 0.29) % 1 } });
        B.w(x, top - 1.2, z, { m: B.last() });
      }
      const a = -0.58 * 9.2 - 0.2;
      B.p(6.5 * Math.cos(a), 21.5, 6.5 * Math.sin(a), 3, 3, { c: 1 }); B.w(6.5 * Math.cos(a), 21.5, 6.5 * Math.sin(a));
    } },
    { n: 'Conveyor Chaos', d: 4, h: 24, f(B) {
      const Q = [[8, 1.5, 0], [8, 4.5, -14], [-8, 7.5, -14], [-8, 11, 0], [-8, 14.5, 13], [9, 18, 13], [9, 21, 4]];
      Q.forEach(([x, y, z], i) => B.p(x, y, z, 3, 3, { c: i % 2 }));
      [[8, 1.5, -1.5, 8, 4.5, -12.5, 5], [6.5, 4.5, -14, -6.5, 7.5, -14, -6], [-8, 7.5, -12.5, -8, 11, -1.5, 6], [-8, 11, 1.5, -8, 14.5, 11.5, 7], [-6.5, 14.5, 13, 7.5, 18, 13, -7]].forEach(([a, b, c, d, e, f, v], i) => { B.beam(a, b, c, d, e, f, 1.8, { conv: v }); if (i) B.under([a, b, c], [d, e, f], 3.5, 2.6); });
      B.k(-1.5, 17.1, 13, 1.8, 0.8, 1.8);
      B.w(8, 1.5, 0); B.w(8, 4.5, -14); B.w(-8, 7.5, -14); B.w(-8, 11, 0); B.w(-8, 14.5, 13); B.w(-3.5, 15.6, 13); B.w(0.5, 16.6, 13); B.w(9, 18, 13); B.w(9, 21, 4);
    } },
    { n: 'The Blender', d: 4, h: 30, f(B) {
      B.p(5.5, 4.5, 0, 2.5, 4, { c: 1 });
      B.ringFloor(9, 7, { c: 0 });
      for (let k = 0; k < 2; k++) { const a = k * Math.PI, cx = 11.5 * Math.cos(a), cz = -11.5 * Math.sin(a); B.k(cx, 9.8, cz, 9, 1.6, 1.2, { yaw: a, mv: { t: 'r', w: 1.5, ph: 0, cx: 0, cz: 0, ox: cx, oz: cz } }); }
      B.p(12.5, 12, 3, 3, 3, { c: 2 }); B.p(14, 12.5, -5, 3, 3, { c: 2 }); B.p(14.5, 13, -12.5, 4, 4, { c: 1 });
      B.w(5.5, 4.5, 0); B.w(9, 9, 0); B.w(12.5, 12, 3); B.w(14, 12.5, -5); B.w(14.5, 13, -12.5);
      [[8, -14], [1.5, -14.5], [-5, -13], [-11, -10]].forEach(([x, z], i) => {
        const top = 15.6 + 2.6 * i;
        B.b(x, top - 1.25, z, 3.5, 2.5, 3.5, { c: 1 + (i % 2), mv: { t: 's', ax: 0, ay: -2.2, az: 0, p: 2.6, ph: (i * 0.31) % 1 } });
        B.w(x, top - 1.1, z, { m: B.last() });
      });
      B.p(-8, 26.5, -3.5, 3, 3, { c: 2 }); B.w(-8, 26.5, -3.5);
    } },
    { n: 'Final Exam', d: 4, h: 28, f(B) {
      B.p(7, 1.5, 0, 2, 2, { c: 0 });
      B.p(11.5, 3.5, -4, 4, 4, { c: 2, mv: { t: 'b', on: 1.8, off: 1.0, ph: 0 } });
      B.p(13, 5.5, -13, 4, 4, { c: 1, mv: { t: 's', ax: -18, ay: 0, az: 0, p: 5.2, ph: 0 } });
      B.p(-13, 8, -12, 2, 2, { c: 0 });
      B.p(-13, 10.5, -5.5, 2, 2, { c: 0 });
      B.p(-12.5, 12.5, 1.5, 4, 4, { c: 2, mv: { t: 'b', on: 1.8, off: 1.0, ph: 0.5 } });
      B.disc(-7, 15, 10, 3.5, { c: 1, mv: { t: 'r', w: 2.0, ph: 0, cx: -7, cz: 10, ox: 0, oz: 0 } });
      B.k(-7 + 2.7, 16, 10, 0.8, 2, 0.8, { mv: { t: 'r', w: 2.0, ph: 0, cx: -7, cz: 10, ox: 2.7, oz: 0 } });
      B.p(1.5, 17.5, 12.5, 2, 2, { c: 0 });
      B.p(8, 20, 9, 2, 2, { c: 0 });
      B.p(11, 22.5, 2.5, 4, 4, { c: 2, mv: { t: 's', ax: 0, ay: 3, az: 0, p: 3, ph: 0.2 } });
      B.p(6.5, 25, -1, 2, 2, { c: 0 });
      B.w(7, 1.5, 0, { r: 1 }); B.w(11.5, 3.5, -4); B.w(13, 5.5, -13, { m: 2 }); B.w(-13, 8, -12, { r: 1 }); B.w(-13, 10.5, -5.5, { r: 1 }); B.w(-12.5, 12.5, 1.5); B.w(-7, 15, 10, { m: 6 }); B.w(1.5, 17.5, 12.5, { r: 1 }); B.w(8, 20, 9, { r: 1 }); B.w(11, 22.5, 2.5, { m: 10 }); B.w(6.5, 25, -1, { r: 1 });
    } }
  ];
  const ROT4 = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function sectionBuilder(parts, wps, y0, rot, mir, theme, si) {
    const [cs, sn] = ROT4[rot], ang = rot * Math.PI / 2;
    const T = (x, z) => { if (mir) x = -x; return [cs * x + sn * z, -sn * x + cs * z]; };
    const TY = a => (mir ? -a : a) + ang;
    const first = parts.length;
    const col = o => (o && o.col) || (o && o.c != null ? theme[o.c % 3] : theme[0]);
    const add = (x, y, z, hx, hy, hz, o) => {
      o = o || {};
      const [wx, wz] = T(x, z);
      const p = { x: wx, y: y0 + y, z: wz, hx, hy, hz, yaw: TY(o.yaw || 0), pitch: o.pitch || 0, roll: mir ? -(o.roll || 0) : (o.roll || 0), col: col(o), kill: !!o.kill, ice: !!o.ice, climb: !!o.climb, bounce: o.bounce || 0, cyl: !!o.cyl, ghost: !!o.ghost, laser: !!o.laser, sec: si, kind: o.kill ? 'k' : o.climb ? 't' : o.bounce ? 'b' : o.ice ? 'i' : o.conv ? 'c' : 'n' };
      if (o.conv) { const s = o.conv, dx = Math.sin(p.yaw), dz = Math.cos(p.yaw); p.cvx = -dx * s; p.cvz = -dz * s; p.conv = s; }
      if (o.mv) {
        const v = Object.assign({}, o.mv);
        if (v.t === 's') { const [ax, az] = T(v.ax, v.az); v.ax = ax; v.az = az; }
        if (v.t === 'r') { const [cx, cz] = T(v.cx, v.cz), [ox, oz] = T(v.ox, v.oz); v.cx = cx; v.cz = cz; v.ox = ox; v.oz = oz; if (mir) v.w = -v.w; }
        if (v.t === 'w') { const [cx, cz] = T(v.cx, v.cz); v.cx = cx; v.cz = cz; v.cy += y0; }
        p.mv = v;
      }
      parts.push(p);
      return p;
    };
    const B = {
      b: (x, y, z, w, h, d, o) => add(x, y, z, w / 2, h / 2, d / 2, o),
      p: (x, top, z, w, d, o) => { const th = (o && o.th) || 1; return add(x, top - th / 2, z, w / 2, th / 2, d / 2, o); },
      k: (x, y, z, w, h, d, o) => add(x, y, z, w / 2, h / 2, d / 2, Object.assign({ kill: 1, col: '#ff2a2a' }, o)),
      disc: (x, top, z, r, o) => add(x, top - 0.5, z, r, 0.5, r, Object.assign({ cyl: 1 }, o)),
      truss: (x, y0_, z, w, d, h) => add(x, y0_ + h / 2, z, w / 2, h / 2, d / 2, { climb: 1, col: '#8a8f9c' }),
      ramp: (x0, y0_, z0, x1, y1, z1, w, o) => {
        const dx = x1 - x0, dy = y1 - y0_, dz = z1 - z0, hz = Math.hypot(dx, dz), L = Math.hypot(hz, dy), yaw = Math.atan2(dx, dz), pitch = -Math.atan2(dy, hz);
        const ny = Math.cos(pitch), nh = Math.sin(pitch);
        return add((x0 + x1) / 2 - Math.sin(yaw) * nh * 0.5, (y0_ + y1) / 2 - ny * 0.5, (z0 + z1) / 2 - Math.cos(yaw) * nh * 0.5, w / 2, 0.5, L / 2, Object.assign({ yaw, pitch, c: 2 }, o));
      },
      beam: (x0, y0_, z0, x1, y1, z1, w, o) => B.ramp(x0, y0_, z0, x1, y1, z1, w, Object.assign({ c: 2 }, o)),
      stairs: (x, y, z, dx, dz, n, rise, run, w, o) => {
        for (let i = 0; i < n; i++) {
          const top = y + rise * (i + 1), cx = x + dx * run * (i + 0.5), cz = z + dz * run * (i + 0.5);
          if (o && o.skip && o.skip.includes(i)) continue;
          B.p(cx, top, cz, dx ? run : w, dz ? run : w, Object.assign({}, o, { skip: 0, th: Math.min(top - y + 0.5, rise * 2) }));
        }
      },
      under: (p, q, w, dn) => { const dx = q[0] - p[0], dz = q[2] - p[2], L = Math.hypot(dx, dz); return B.k((p[0] + q[0]) / 2, Math.min(p[1], q[1]) - dn, (p[2] + q[2]) / 2, w, 0.6, Math.max(1, L), { yaw: Math.atan2(dx, dz) }); },
      killFloor: top => { [[11.75, 0, 10.5, 34], [-11.75, 0, 10.5, 34], [0, 11.75, 13, 10.5], [0, -11.75, 13, 10.5]].forEach(([x, z, w, d]) => B.k(x, top - 0.5, z, w, 1, d, { floor: 1 })); },
      ringFloor: (top, hole, o) => { const s = 17, a = (s + hole) / 2, w = s - hole; [[a, 0, w, 2 * s], [-a, 0, w, 2 * s], [0, a, 2 * hole, w], [0, -a, 2 * hole, w]].forEach(([x, z, ww, d]) => B.p(x, top, z, ww, d, o)); },
      pend: (x, top, z, L, amp, per, ph, along) => {
        const py = top + 1.4 + L;
        add(x, py - L, z, 1.1, 1.4, 1.1, { kill: 1, col: '#ff2a2a', yaw: along === 'x' ? 0 : Math.PI / 2, mv: { t: 'w', a: amp, p: per, ph, cx: x, cy: py, cz: z, l: L } });
        add(x, py + 0.4, z, 0.8, 0.4, 0.8, { col: '#5b6170', ghost: 1 });
      },
      last: () => parts.length - 1 - first,
      w: (x, y, z, o) => { const [wx, wz] = T(x, z); wps.push({ x: wx, y: y0 + y, z: wz, rr: !!(o && o.r), r: (o && o.r) || 1.6, k: (o && o.k) || 0, m: o && o.m != null ? o.m : null, sec: si, base: first }); }
    };
    return B;
  }
  function pickSections(R, n, mode) {
    const pool = SECTIONS.map((s, i) => i).filter(i => mode === 2 ? SECTIONS[i].d <= 1 : mode === 0 ? SECTIONS[i].d <= 3 : true);
    const out = [];
    const weight = i => mode === 1 ? 1 + SECTIONS[i].d * 0.4 : mode === 0 ? [2.2, 1.8, 1.3, 0.8, 0][SECTIONS[i].d] : 1;
    while (out.length < n) {
      const left = pool.filter(i => !out.includes(i));
      if (!left.length) { out.push(pool[(R() * pool.length) | 0]); continue; }
      let tot = 0; left.forEach(i => (tot += weight(i)));
      let q = R() * tot, k = left[0];
      for (const i of left) { q -= weight(i); if (q <= 0) { k = i; break; } }
      out.push(k);
    }
    return out;
  }
  function aabb(p) { const c = mkCol(p); envelope(c); return [c.x0, c.x1, c.minY, c.maxY, c.z0, c.z1]; }
  const hit = (a, b) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2] && a[4] < b[5] && a[5] > b[4];
  function bandOf(parts, p0, p1, wps, w0, top) {
    const out = [];
    for (let i = p0; i < p1; i++) { const p = parts[i]; if (p.ghost) continue; const b = aabb(p); if (b[3] < top - 9) continue; out.push([b[0] - 1.2, b[1] + 1.2, b[2], b[3] + 11.5, b[4] - 1.2, b[5] + 1.2]); }
    for (const k of corridors(wps, w0, wps.length, top)) if (k[3] >= top - 1) out.push(k);
    return out;
  }
  function corridors(wps, w0, w1, top) {
    const out = [];
    for (let i = w0; i < w1; i++) {
      const a = wps[i], b = i + 1 < w1 ? wps[i + 1] : { x: clamp(a.x, -4, 4), y: top, z: clamp(a.z, -4, 4) };
      out.push([Math.min(a.x, b.x) - 1.4, Math.max(a.x, b.x) + 1.4, Math.min(a.y, b.y), Math.max(a.y, b.y) + (a.k ? 22 : 11.6), Math.min(a.z, b.z) - 1.4, Math.max(a.z, b.z) + 1.4]);
    }
    return out;
  }
  function clash(parts, p0, band, y, prev, wps, w0) {
    if (prev) for (const k of corridors(wps, w0, wps.length, 1e9)) { if (k[2] > y + 9) continue; for (const q of prev) if (hit(k, q)) return true; }
    for (let i = p0; i < parts.length; i++) {
      const p = parts[i]; if (p.ghost) continue;
      const b = aabb(p); if (b[2] > y + 9) continue;
      const q = [b[0] - 0.2, b[1] + 0.2, b[2] - 0.2, b[3], b[4] - 0.2, b[5] + 0.2];
      for (const k of band) if (hit(q, k)) return true;
    }
    return false;
  }
  function solidsOf(parts, p0, p1, top) {
    const out = [];
    for (let i = p0; i < p1; i++) { const p = parts[i]; if (p.ghost) continue; const b = aabb(p); if (b[3] > top - 2) out.push(b); }
    return out;
  }
  function buildTower(seed, n, mode, only) {
    const R = rng(seed), want = only || pickSections(R, n, mode), parts = [], wps = [], secs = [], ids = [];
    const S = 18, add = p => (parts.push(Object.assign({ yaw: 0, pitch: 0, roll: 0, kind: 'n', sec: -1 }, p)), p);
    add({ x: 0, y: -1, z: 0, hx: S, hy: 1, hz: S, col: '#6b7488', kind: 'f' });
    let y = 0, band = null, prev = null;
    for (let si = 0; si < want.length; si++) {
      const tries = [want[si]];
      if (!only) { const rest = SECTIONS.map((q, i) => i).filter(i => !want.includes(i) && !ids.includes(i) && (mode === 2 ? SECTIONS[i].d <= 1 : mode === 0 ? SECTIONS[i].d <= 3 : true)); for (let k = rest.length - 1; k > 0; k--) { const j = (R() * (k + 1)) | 0, t = rest[k]; rest[k] = rest[j]; rest[j] = t; } tries.push(...rest); }
      let placed = null;
      for (const idx of tries) {
        const combos = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let k = 7; k > 0; k--) { const j = (R() * (k + 1)) | 0, t = combos[k]; combos[k] = combos[j]; combos[j] = t; }
        const theme = THEMES[(R() * THEMES.length) | 0];
        for (const cb of combos) {
          const rot = cb & 3, mir = cb > 3, p0 = parts.length, w0 = wps.length;
          const B = sectionBuilder(parts, wps, y, rot, mir, theme, si);
          SECTIONS[idx].f(B);
          if (!band || !clash(parts, p0, band, y, prev, wps, w0)) { placed = { idx, rot, mir, theme, p0, w0 }; break; }
          parts.length = p0; wps.length = w0;
        }
        if (placed || only) break;
      }
      if (!placed) { const B = sectionBuilder(parts, wps, y, 0, false, THEMES[0], si); const p0 = parts.length, w0 = wps.length; SECTIONS[want[si]].f(B); placed = { idx: want[si], rot: 0, mir: false, theme: THEMES[0], p0, w0 }; }
      const { idx, rot, mir, theme, p0, w0 } = placed, def = SECTIONS[idx];
      for (let i = w0; i < wps.length; i++) { const w = wps[i]; if (w.m === 'arm') { let bi = -1, bd = 1e9; for (let j = p0; j < parts.length; j++) { const q = parts[j]; if (!q.mv || q.mv.t !== 'r' || q.kill) continue; const d = Math.hypot(q.x - w.x, q.z - w.z); if (d < bd) { bd = d; bi = j; } } w.m = bi; } else if (w.m != null) w.m = w.base + w.m; }
      const top = y + def.h, last = si === want.length - 1;
      band = bandOf(parts, p0, parts.length, wps, w0, top); prev = solidsOf(parts, p0, parts.length, top);
      add({ x: 0, y: top - 0.5, z: 0, hx: 4, hy: 0.5, hz: 4, col: last ? '#ffd34d' : '#e8ecf4', kind: last ? 'F' : 'x', sec: si });
      wps.push({ x: 0, y: top, z: 0, r: 2.5, k: 0, m: null, sec: si, exit: 1 });
      secs.push({ idx, y0: y, y1: top, name: def.n, d: def.d, rot, mir, theme });
      ids.push(idx);
      y = top;
    }
    add({ x: 0, y: y + 1.2, z: 0, hx: 3.2, hy: 1.2, hz: 3.2, kind: 'goal', fin: true, col: '#ffd34d' });
    const H = y + 14;
    [[S + 0.5, 0], [-S - 0.5, 0], [0, S + 0.5], [0, -S - 0.5]].forEach(([x, z]) => add({ x, y: H / 2 - 2, z, hx: x ? 0.5 : S + 1, hy: H / 2 + 2, hz: z ? 0.5 : S + 1, kind: 'g', col: '#bfe6ff' }));
    return { parts, wps, secs, top: y, ids };
  }
  const BOT_SK = [
    { react: [0.4, 0.62], jit: 0.07, aim: 0.2, hes: 0.4, spd: 0.86 },
    { react: [0.3, 0.44], jit: 0.04, aim: 0.1, hes: 0.16, spd: 0.95 },
    { react: [0.22, 0.32], jit: 0.024, aim: 0.045, hes: 0.05, spd: 1 },
    { react: [0.15, 0.25], jit: 0.006, aim: 0.01, hes: 0, spd: 1 }
  ];
  const WPP = { x: 0, y: 0, z: 0 };
  function wpPos(w, W, o) {
    o = o || WPP;
    if (w.m == null || w.m < 0) { o.x = w.x; o.y = w.y; o.z = w.z; return o; }
    const c = W.cols[w.m];
    if (w.lx == null) { const q = { m: new Float64Array(9) }; setRot(q, c.y0, c.p0, c.r0); const m = q.m, dx = w.x - c.bx, dy = w.y - c.bY, dz = w.z - c.bz; w.lx = m[0] * dx + m[3] * dy + m[6] * dz; w.ly = m[1] * dx + m[4] * dy + m[7] * dz; w.lz = m[2] * dx + m[5] * dy + m[8] * dz; }
    const m = c.m;
    o.x = c.x + m[0] * w.lx + m[1] * w.ly + m[2] * w.lz; o.y = c.y + m[3] * w.lx + m[4] * w.ly + m[5] * w.lz; o.z = c.z + m[6] * w.lx + m[7] * w.ly + m[8] * w.lz;
    return o;
  }
  function prepWps(wps, W) {
    setTime(W, 0);
    wps.forEach(w => {
      w.lx = null; w.col = null;
      if (w.m != null && w.m >= 0) { wpPos(w, W, {}); w.col = W.cols[w.m]; return; }
      let best = null, by = -1e9;
      for (const c of W.cols) { if (c.ghost || c.fin || c.kill) continue; if (contact(c, w.x, w.y - 0.25, w.y - 0.25, w.z, 0.3, CT) && c.y > by) { by = c.y; best = c; } }
      w.col = best;
      if (best && !best.mv && best.t === 0 && Math.abs(best.m[4]) > 0.999 && !w.rr) { const lim = Math.min(best.hx, best.hz) - 0.35; if (lim > w.r) w.r = Math.min(3.5, lim); }
    });
  }
  const RUN = { mx: 0, mz: 0, jp: false, jh: false, sp: false }, SIMC = newChar(0, 0, 0), SIMI = { mx: 0, mz: 0, jp: false, jh: false, sp: false }, TP = { x: 0, y: 0, z: 0 }, TN = { x: 0, y: 0, z: 0 };
  function steer(c, T, I, W, air, aim) {
    let dx = T.x - c.x, dz = T.z - c.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-4) { I.mx = 0; I.mz = 0; return d; }
    dx /= d; dz /= d;
    if (aim) { const cs = Math.cos(aim), sn = Math.sin(aim), x = dx * cs + dz * sn; dz = -dx * sn + dz * cs; dx = x; }
    const sp = W.C.walk * W.mods.spd, de = c.gr && c.gc && c.gc.ice ? W.C.accIce : W.C.decG;
    let mag = air ? (d < 0.5 ? 0 : 1) : Math.min(1, d / 1.4, Math.sqrt(2 * de * Math.max(0, d - 0.3)) / sp);
    let vx = dx * mag, vz = dz * mag;
    const g = c.gc;
    if (!air && c.gr && g && (g.cvx || g.cvz)) { const s = W.C.walk * W.mods.spd; vx -= g.cvx / s; vz -= g.cvz / s; const l = Math.hypot(vx, vz); if (l > 1) { vx /= l; vz /= l; } }
    I.mx = vx; I.mz = vz;
    return d;
  }
  function localMovers(W, y, list) {
    list.length = 0;
    for (const c of W.mov) if (c.maxY > y - 12 && c.minY < y + 40) list.push(c);
    return list;
  }
  function setLocal(W, list, t) { const dt = W.C.dt; for (let i = 0; i < list.length; i++) setMover(list[i], t, dt); }
  function simRun(W, c0, wA, wB, delayT, dI, jump, maxT, lm, fol) {
    const c = copyChar(c0, SIMC), dt = W.C.dt, I = SIMI, t0 = W.t;
    let t = 0, st = 0, air = false, after = 0, res = 0, leftT = -1, Ay = 0, af = 0;
    I.jh = false; I.sp = false;
    while (t < maxT) {
      t += dt;
      setLocal(W, lm, t0 + t);
      I.jp = false;
      if (st === 0 && t > delayT) { st = 1; if (jump) I.jp = true; }
      if (st === 0) { I.mx = dI.mx; I.mz = dI.mz; }
      else if (st === 2 && !wA.k && !fol) { I.mx = 0; I.mz = 0; const g = c.gc; if (g && (g.cvx || g.cvz)) { const s = W.C.walk * W.mods.spd; I.mx = -g.cvx / s; I.mz = -g.cvz / s; } }
      else steer(c, st === 2 ? wpPos(wB, W, TN) : wpPos(wA, W, TP), I, W, !c.gr, 0);
      stepChar(c, I, W, dt);
      if (c.dead) { res = -1; break; }
      if (!c.gr && !c.cl) { air = true; af += dt; if (leftT < 0 && af > 0.1) leftT = t - af; } else af = 0;
      if (st === 1) {
        const T = wpPos(wA, W, TP), hd = Math.hypot(c.x - T.x, c.z - T.z);
        const ok = wA.k ? (c.bnc && hd < 3.5) : (c.gr && (hd < wA.r || (jump && wA.col && c.gc === wA.col)) && Math.abs(c.y - T.y) < 1.3);
        if (ok && (!jump || air)) { if (!wB) { res = 1; break; } st = 2; after = 0; Ay = T.y; continue; }
        if (jump && air && c.gr) { res = 0; break; }
        const fl = Math.min(T.y, c0.y);
        if ((c.gr && c.y < fl - 4) || c.y < fl - 10) { res = 0; break; }
      } else if (st === 2) {
        after += dt;
        const T = wpPos(wB, W, TN), hd = Math.hypot(c.x - T.x, c.z - T.z);
        if (c.gr && (hd < wB.r || (wB.col && c.gc === wB.col)) && Math.abs(c.y - T.y) < 1.3) { res = 1; break; }
        if (wA.k) { if ((c.gr && after > 0.1) || c.y < T.y - 12) { res = 0; break; } }
        else if (!c.gr && !c.cl) { res = fol && after > 0.2 ? 1 : 0; break; }
        else if (after > (fol ? 1 : 0.55)) { res = 1; break; }
      }
    }
    setLocal(W, lm, t0);
    return { res, leftT, t, st };
  }
  function makeBot(c, sk, seed, name) { return { c, sk: BOT_SK[sk], lvl: sk, wi: 0, plan: null, tick: 0, hold: 0, wait: 0, R: rng(seed), I: { mx: 0, mz: 0, jp: false, jh: false, sp: false }, T: { x: 0, y: 0, z: 0 }, mode: 1, prog: 0, sup: null, lm: [], name, stuck: 0, lastY: 0, fin: false, aimE: 0 }; }
  function botReset(b) { b.wi = 0; b.plan = null; b.hold = 0; b.wait = 0; b.sup = null; b.stuck = 0; }
  function relocalize(b, wps) {
    const c = b.c;
    let best = -1, bs = 1e9;
    if (c.gc) for (let i = wps.length - 1; i >= 0; i--) if (wps[i].col === c.gc) { b.wi = Math.min(i + 1, wps.length - 1); return; }
    for (let i = 0; i < wps.length; i++) {
      const w = wps[i]; if (w.m != null && w.m >= 0) continue;
      const dy = w.y - c.y, hd = Math.hypot(w.x - c.x, w.z - c.z);
      if (Math.abs(dy) < 1.5 && hd < Math.max(3, w.r + 1.5)) { if (i + 1 > best) { best = i + 1; bs = -1; } continue; }
      if (bs < 0) continue;
      if (dy > -8 && dy < 7) { const s = hd + Math.abs(dy) * 1.5 + (dy < -1.5 ? 6 : 0); if (s < bs) { bs = s; best = i; } }
    }
    b.wi = best >= 0 ? Math.min(best, wps.length - 1) : 0;
  }
  function botThink(b, W, wps, t) {
    const c = b.c, I = b.I, sk = b.sk;
    I.jp = false;
    if (c.dead || b.fin || b.wi >= wps.length) { I.mx = I.mz = 0; return; }
    let w = wps[b.wi], T = wpPos(w, W, b.T);
    const hd = Math.hypot(c.x - T.x, c.z - T.z);
    if (w.k ? (c.bnc && hd < 3.5) : (c.gr && hd < w.r && Math.abs(c.y - T.y) < 1.3)) {
      b.sup = w; b.wi++; b.plan = null; b.tick = 0; b.prog = t;
      if (sk.hes && b.R() < sk.hes * 0.5) b.wait = t + 0.2 + b.R() * 0.9;
      b.aimE = (b.R() * 2 - 1) * sk.aim;
      if (b.wi >= wps.length) { I.mx = I.mz = 0; return; }
      w = wps[b.wi]; T = wpPos(w, W, b.T);
    }
    if (c.gr && ((b.sup && c.y < wpPos(b.sup, W, TN).y - 3.5) || t - b.prog > 7)) { relocalize(b, wps); b.sup = null; b.plan = null; b.tick = 0; b.prog = t; w = wps[b.wi]; T = wpPos(w, W, b.T); }
    if (b.plan) { if (t >= b.plan.at) { I.jp = true; b.plan = null; b.tick = 0; steer(c, T, I, W, !c.gr, 0); return; } else if (c.gr || c.air < 0.2) return; else b.plan = null; }
    if (!c.gr && !c.cl) { if (!I.jp) steer(c, T, I, W, true, b.aimE); return; }
    if (c.cl) { steer(c, T, I, W, false, 0); const l = Math.hypot(I.mx, I.mz) || 1; I.mx /= l; I.mz /= l; return; }
    if (I.jp) return;
    if (t < b.wait) { holdStill(b, W); return; }
    if (--b.tick <= 0) {
      b.tick = 4;
      const nx = wps[b.wi + 1] || null;
      localMovers(W, c.y, b.lm);
      const ws = simRun(W, c, w, nx, 0, I, false, 2.4, b.lm);
      if (ws.res === 1) b.mode = 1;
      else {
        const react = sk.react[0] + b.R() * (sk.react[1] - sk.react[0]);
        const sure = (d, dI) => { let r = simRun(W, c, w, nx, d, dI, true, d + 2.2, b.lm, 0), f = 0; if (r.res === -1 && r.st === 2) { r = simRun(W, c, w, nx, d, dI, true, d + 2.2, b.lm, 1); f = 1; } if (r.res === 1 && simRun(W, c, w, nx, d + 0.025, dI, true, d + 2.2, b.lm, f).res !== 1) r.res = 0; return r; };
        const js = sure(react, I);
        if (js.res === 1) { b.plan = { at: t + react + (b.R() * 2 - 1) * sk.jit }; return; }
        if (I.mx || I.mz) {
          const hs = sure(react, IN0);
          if (hs.res === 1) { I.mx = I.mz = 0; b.plan = { at: t + react + (b.R() * 2 - 1) * sk.jit }; return; }
        } else {
          steer(c, T, RUN, W, true, 0);
          const ru = 0.06 + b.R() * 0.06, rs = sure(ru, RUN);
          if (rs.res === 1) { I.mx = RUN.mx; I.mz = RUN.mz; b.plan = { at: t + ru + (b.R() * 2 - 1) * sk.jit }; return; }
        }
        b.mode = ws.res === -1 || (ws.leftT >= 0 && ws.leftT < (c.gc && c.gc.mv ? 0.3 : 0.13)) ? 0 : 1;
        if (!b.mode && b.sup && !(I.mx || I.mz)) {
          const hd2 = simRun(W, c, b.sup, null, 0.7, IN0, false, 0.7, b.lm);
          if (hd2.res === -1) {
            for (let d = react; d < 0.6; d += 0.05) { const ds = simRun(W, c, b.sup, null, d, IN0, true, d + 1.4, b.lm); if (ds.res === 1) { b.plan = { at: t + d }; return; } }
          }
        }
      }
    }
    if (b.mode) { steer(c, T, I, W, false, 0); I.mx *= sk.spd; I.mz *= sk.spd; }
    else holdStill(b, W);
  }
  function holdStill(b, W) {
    const c = b.c, I = b.I;
    if (b.sup && c.gc && c.gc.mv) { const S = wpPos(b.sup, W, TN), d = Math.hypot(S.x - c.x, S.z - c.z); if (d > 0.7) { steer(c, S, I, W, false, 0); return; } }
    I.mx = 0; I.mz = 0;
    const g = c.gc;
    if (g && (g.cvx || g.cvz)) { const s = W.C.walk * W.mods.spd; I.mx = -g.cvx / s; I.mz = -g.cvz / s; }
  }
  const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.75, 0.55], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, sf = 0, up = 0;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const lw = r.getSize(sz).x || v.w, pr = Math.max(0.5, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
      r.shadowMap.autoUpdate = lvl < 2;
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      if (lvl > 1 && (sf ^= 1)) r.shadowMap.needsUpdate = true;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0175 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
  }
  function makeAudio(api) {
    let ctx = null, out = null, mus = null, noiseB = null, musicOn = false, nextT = 0, step = 0, song = 0;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination);
        mus = ctx.createGain(); mus.gain.value = 0; mus.connect(out);
        noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const tone = (f0, f1, dur, type, vol, when = 0, dest = out) => {
      const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol, f, q = 1, when = 0, type = 'bandpass', f1 = 0, dest = out) => {
      const t = ctx.currentTime + when, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
    };
    const S = {
      jump: () => { tone(330, 620, 0.12, 'square', 0.035); tone(660, 990, 0.08, 'sine', 0.04, 0.015); },
      land: () => { tone(140, 60, 0.08, 'sine', 0.12); noise(0.05, 0.06, 500, 1); },
      thud: () => { tone(110, 40, 0.18, 'sine', 0.22); noise(0.12, 0.14, 300, 0.8, 0, 'lowpass', 120); },
      die: () => { tone(420, 90, 0.32, 'sawtooth', 0.07); tone(300, 70, 0.3, 'square', 0.04, 0.03); noise(0.25, 0.16, 1400, 0.7, 0, 'bandpass', 300); for (let i = 0; i < 5; i++) tone(900 - i * 120, 500 - i * 60, 0.06, 'triangle', 0.04, 0.05 + i * 0.04); },
      spawn: () => { tone(520, 1040, 0.18, 'sine', 0.05); tone(780, 1560, 0.16, 'sine', 0.03, 0.06); },
      bounce: () => { tone(160, 520, 0.24, 'sine', 0.12); tone(170, 540, 0.22, 'triangle', 0.05); },
      climb: () => tone(220 + Math.random() * 40, 180, 0.05, 'triangle', 0.04),
      section: () => [659, 880, 1175].forEach((f, i) => tone(f, f, 0.16, 'square', 0.035, i * 0.07)),
      coin: () => { tone(1320, 1320, 0.07, 'square', 0.035); tone(1760, 1760, 0.14, 'square', 0.035, 0.06); },
      win: () => { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, f, 0.26, 'square', 0.045, i * 0.11)); for (let i = 0; i < 10; i++) tone(2000 + i * 260, 2500 + i * 260, 0.08, 'sine', 0.025, 1 + i * 0.05); },
      other: () => [784, 988, 1319].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.05, i * 0.08)),
      tick: () => tone(1200, 1200, 0.05, 'square', 0.03),
      last: () => tone(880, 880, 0.12, 'square', 0.05),
      over: () => { tone(392, 370, 0.3, 'sawtooth', 0.05); tone(330, 311, 0.3, 'sawtooth', 0.05, 0.3); tone(262, 196, 0.7, 'sawtooth', 0.06, 0.6); },
      buy: () => { tone(880, 1320, 0.1, 'square', 0.04); tone(1320, 1760, 0.12, 'sine', 0.04, 0.08); },
      no: () => tone(220, 180, 0.16, 'square', 0.05),
      go: () => { tone(990, 990, 0.4, 'square', 0.06); tone(1480, 1480, 0.4, 'sine', 0.04); },
      beep: () => tone(660, 660, 0.15, 'square', 0.05),
      tap: () => tone(700, 900, 0.05, 'sine', 0.045),
      step: () => tone(150 + Math.random() * 40, 80, 0.04, 'sine', 0.035)
    };
    const SONGS = [
      { bpm: 132, root: [45, 41, 48, 43], ch: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], lead: [69, 0, 72, 74, 76, 0, 74, 72, 69, 0, 67, 0, 69, 0, 0, 0, 65, 0, 69, 72, 74, 0, 72, 69, 72, 0, 74, 0, 76, 0, 0, 0, 72, 0, 76, 79, 81, 0, 79, 76, 74, 0, 72, 0, 74, 0, 76, 0, 74, 0, 72, 71, 72, 0, 74, 0, 71, 0, 67, 0, 0, 0, 0, 0] },
      { bpm: 140, root: [38, 46, 41, 48], ch: [[62, 65, 69], [58, 62, 65], [60, 65, 69], [60, 64, 67]], lead: [74, 0, 74, 77, 0, 77, 81, 0, 79, 0, 77, 0, 74, 0, 72, 0, 70, 0, 70, 74, 0, 74, 77, 0, 76, 0, 74, 0, 72, 0, 0, 0, 72, 0, 72, 77, 0, 77, 81, 0, 84, 0, 81, 0, 79, 0, 77, 0, 76, 0, 77, 79, 0, 76, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0] }
    ];
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    function sched() {
      if (!ctx) return;
      if (api.muted || !musicOn) { mus.gain.value = 0; return; }
      mus.gain.value = 0.13;
      const Sg = SONGS[song], SIX = 60 / Sg.bpm / 4;
      if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
      while (nextT < ctx.currentTime + 0.3) {
        const w = nextT - ctx.currentTime, s = step % 64, bar = (s / 16) | 0, b = s % 16;
        if (b % 4 === 0) tone(140, 42, 0.15, 'sine', 0.55, w, mus);
        if (b % 8 === 4) noise(0.12, 0.22, 1800, 0.7, w, 'bandpass', 0, mus);
        if (b % 2 === 1) noise(0.03, 0.12, 8000, 1, w, 'highpass', 0, mus);
        if (b % 2 === 0) { const m = Sg.root[bar] + (b % 4 === 2 ? 12 : 0); tone(mf(m), mf(m), SIX * 1.7, 'triangle', 0.32, w, mus); }
        if (b === 2 || b === 6 || b === 10 || b === 14) Sg.ch[bar].forEach(m => tone(mf(m), mf(m), SIX * 1.1, 'square', 0.04, w, mus));
        const L = Sg.lead[s]; if (L) tone(mf(L), mf(L), SIX * 1.7, 'square', 0.07, w, mus);
        nextT += SIX; step++;
      }
    }
    api.interval(sched, 80);
    return {
      play(n) { if (api.muted) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { S[n](); } catch (e) {} },
      music(on) { musicOn = on && this.mOn !== false; if (on && !api.muted) { const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); } },
      song(i) { song = i % SONGS.length; },
      close() { musicOn = false; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }
  function canvasTex(THREE, w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  function plasticTex(THREE) {
    return canvasTex(THREE, 128, 128, (g, w, h) => {
      g.fillStyle = '#f1f1f1'; g.fillRect(0, 0, w, h);
      const R = rng(7);
      for (let i = 0; i < 900; i++) { const v = 228 + R() * 22 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 2, 2); }
      const gr = g.createLinearGradient(0, 0, 0, 10); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, 10);
      const gl = g.createLinearGradient(0, 0, 10, 0); gl.addColorStop(0, 'rgba(255,255,255,.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl; g.fillRect(0, 0, 10, h);
      const gb = g.createLinearGradient(0, h - 12, 0, h); gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,.22)');
      g.fillStyle = gb; g.fillRect(0, h - 12, w, 12);
      const gq = g.createLinearGradient(w - 12, 0, w, 0); gq.addColorStop(0, 'rgba(0,0,0,0)'); gq.addColorStop(1, 'rgba(0,0,0,.16)');
      g.fillStyle = gq; g.fillRect(w - 12, 0, 12, h);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    }, true);
  }
  function trussTex(THREE) {
    return canvasTex(THREE, 64, 64, (g, w) => {
      g.clearRect(0, 0, w, w);
      g.strokeStyle = '#d6d9e0'; g.lineWidth = 7; g.strokeRect(4, 4, w - 8, w - 8);
      g.lineWidth = 5; g.beginPath(); g.moveTo(6, 6); g.lineTo(w - 6, w - 6); g.moveTo(w - 6, 6); g.lineTo(6, w - 6); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.strokeRect(1, 1, w - 2, w - 2);
    }, true);
  }
  function arrowTex(THREE) {
    return canvasTex(THREE, 64, 64, (g, w) => {
      g.fillStyle = '#3a3f4c'; g.fillRect(0, 0, w, w);
      g.fillStyle = '#2b2f3a'; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16, w, 3);
      g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(32, 10); g.lineTo(54, 34); g.lineTo(42, 34); g.lineTo(42, 54); g.lineTo(22, 54); g.lineTo(22, 34); g.lineTo(10, 34); g.closePath(); g.fill();
    }, true);
  }
  function faceTex(THREE, skin) {
    return canvasTex(THREE, 64, 64, (g, w) => {
      g.fillStyle = skin; g.fillRect(0, 0, w, w);
      g.fillStyle = '#1b1b22'; g.beginPath(); g.ellipse(22, 26, 4, 6, 0, 0, TAU); g.ellipse(42, 26, 4, 6, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.fillRect(20, 22, 2, 2); g.fillRect(40, 22, 2, 2);
      g.strokeStyle = '#1b1b22'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(32, 36, 11, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke();
    });
  }
  function boxFaces(hx, hy, hz, ts) {
    const P = [], N = [], U = [], I = [];
    const face = (o, ax, ay, n, w, h) => {
      const b = P.length / 3;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        P.push(o[0] + ax[0] * sx + ay[0] * sy, o[1] + ax[1] * sx + ay[1] * sy, o[2] + ax[2] * sx + ay[2] * sy);
        N.push(n[0], n[1], n[2]); U.push((sx + 1) / 2 * w / ts, (sy + 1) / 2 * h / ts);
      }
      I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    face([hx, 0, 0], [0, 0, -hz], [0, hy, 0], [1, 0, 0], 2 * hz, 2 * hy);
    face([-hx, 0, 0], [0, 0, hz], [0, hy, 0], [-1, 0, 0], 2 * hz, 2 * hy);
    face([0, hy, 0], [hx, 0, 0], [0, 0, -hz], [0, 1, 0], 2 * hx, 2 * hz);
    face([0, -hy, 0], [hx, 0, 0], [0, 0, hz], [0, -1, 0], 2 * hx, 2 * hz);
    face([0, 0, hz], [hx, 0, 0], [0, hy, 0], [0, 0, 1], 2 * hx, 2 * hy);
    face([0, 0, -hz], [-hx, 0, 0], [0, hy, 0], [0, 0, -1], 2 * hx, 2 * hy);
    return { P, N, U, I };
  }
  function cylFaces(r, hy, ts, seg) {
    const P = [], N = [], U = [], I = [];
    seg = seg || 28;
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * TAU, x = Math.sin(a), z = Math.cos(a);
      P.push(x * r, -hy, z * r, x * r, hy, z * r); N.push(x, 0, z, x, 0, z); U.push(a * r / ts, 0, a * r / ts, 2 * hy / ts);
      if (i < seg) { const b = i * 2; I.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    }
    for (const s of [1, -1]) {
      const c = P.length / 3; P.push(0, s * hy, 0); N.push(0, s, 0); U.push(0, 0);
      for (let i = 0; i <= seg; i++) { const a = i / seg * TAU; P.push(Math.sin(a) * r, s * hy, Math.cos(a) * r); N.push(0, s, 0); U.push(Math.sin(a) * r / ts, Math.cos(a) * r / ts); }
      for (let i = 0; i < seg; i++) { if (s > 0) I.push(c, c + 1 + i, c + 2 + i); else I.push(c, c + 2 + i, c + 1 + i); }
    }
    return { P, N, U, I };
  }
  function merger() {
    const P = [], N = [], U = [], C = [], I = [];
    return {
      add(f, m, x, y, z, col) {
        const b = P.length / 3;
        for (let i = 0; i < f.P.length; i += 3) {
          const lx = f.P[i], ly = f.P[i + 1], lz = f.P[i + 2], nx = f.N[i], ny = f.N[i + 1], nz = f.N[i + 2];
          P.push(x + m[0] * lx + m[1] * ly + m[2] * lz, y + m[3] * lx + m[4] * ly + m[5] * lz, z + m[6] * lx + m[7] * ly + m[8] * lz);
          N.push(m[0] * nx + m[1] * ny + m[2] * nz, m[3] * nx + m[4] * ny + m[5] * nz, m[6] * nx + m[7] * ny + m[8] * nz);
          C.push(col.r, col.g, col.b);
        }
        for (let i = 0; i < f.U.length; i++) U.push(f.U[i]);
        for (let i = 0; i < f.I.length; i++) I.push(f.I[i] + b);
      },
      empty: () => !I.length,
      geo(THREE) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
        g.setIndex(P.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
        g.computeBoundingSphere();
        return g;
      }
    };
  }
  const ID9 = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  function loadSave(s) {
    const o = { v: 1, coins: 0, xp: 0, wins: 0, best: [0, 0, 0], mode: 1, lvl: 1, nb: 5, sens: 1, inv: false, music: true, gear: [0, 0, 0], eq: -1, mut: [], shirt: 0, pants: 0, skin: 0, hat: 0, hats: [0], towers: 0, deaths: 0, help: false };
    if (!s || typeof s !== 'object' || Array.isArray(s)) return o;
    const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) ? clamp(Math.floor(v), a, b) : d);
    o.coins = num(s.coins, 0, 1e8, 0); o.xp = num(s.xp, 0, 1e9, 0); o.wins = num(s.wins, 0, 1e7, 0); o.towers = num(s.towers, 0, 1e7, 0); o.deaths = num(s.deaths, 0, 1e9, 0);
    if (Array.isArray(s.best) && s.best.length === 3) o.best = s.best.map(v => (typeof v === 'number' && isFinite(v) && v > 0 && v < 36000 ? Math.round(v * 100) / 100 : 0));
    o.mode = num(s.mode, 0, 2, 1); o.lvl = num(s.lvl, 0, 3, 1); o.nb = num(s.nb, 0, 7, 5);
    o.sens = typeof s.sens === 'number' && isFinite(s.sens) ? clamp(s.sens, 0.3, 3) : 1;
    o.inv = s.inv === true; o.music = s.music !== false; o.help = s.help === true;
    if (Array.isArray(s.gear) && s.gear.length === 3) o.gear = s.gear.map(v => num(v, 0, 99, 0));
    o.eq = num(s.eq, -1, 2, -1);
    if (Array.isArray(s.mut)) o.mut = s.mut.filter(k => typeof k === 'string' && MUTS.some(m => m.k === k)).slice(0, 7).filter((k, i, a) => a.indexOf(k) === i);
    o.shirt = num(s.shirt, 0, SHIRTS.length - 1, 0); o.pants = num(s.pants, 0, PANTS.length - 1, 0); o.skin = num(s.skin, 0, SKINS.length - 1, 0);
    if (Array.isArray(s.hats)) o.hats = [0].concat(s.hats.filter(v => Number.isInteger(v) && v > 0 && v < HATS.length)).filter((v, i, a) => a.indexOf(v) === i);
    o.hat = o.hats.includes(s.hat) ? s.hat : 0;
    return o;
  }
  const lvlOf = xp => { let l = 1, need = 100; while (xp >= need && l < 999) { xp -= need; l++; need = 100 + l * 25; } return l; };
  const fmtT = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + String(r).padStart(2, '0'); };
  const fmtT2 = s => { const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(2); };
  const COIN = '<svg viewBox="0 0 20 20" class="ci"><circle cx="10" cy="10" r="8.5" fill="#f5c542" stroke="#b9861a" stroke-width="2"/><path d="M10 5.5v9M7.6 7.4h3.6a1.6 1.6 0 010 3.2H8.8a1.6 1.6 0 000 3.2h3.6" fill="none" stroke="#b9861a" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const CSS = `
${G} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#8fcfff;font-family:var(--sans);-webkit-user-select:none;user-select:none;color:#fff}
${G} .stage .g-canvas{border-radius:0;display:block;width:100%;height:100%;background:#8fcfff}
${G} [hidden]{display:none!important}
${G} .hud{position:absolute;inset:0;pointer-events:none;font-size:clamp(10px,1.7cqw,17px);text-shadow:0 .08em 0 rgba(0,0,0,.45)}
${G} .clock{position:absolute;left:50%;top:2.4%;transform:translateX(-50%);display:flex;align-items:center;gap:.5em;padding:.25em .9em;border-radius:.6em;background:rgba(14,18,34,.62);font-weight:800;font-size:1.7em;font-variant-numeric:tabular-nums;letter-spacing:.02em}
${G} .clock.low b{color:#ff6b6b}
${G} .clock i{font-style:normal;font-size:.55em;padding:.15em .45em;border-radius:.4em;background:#ff4b4b}
${G} .money{position:absolute;left:2%;top:2.4%;display:flex;align-items:center;gap:.35em;padding:.3em .7em;border-radius:.6em;background:rgba(14,18,34,.55);font-weight:800;font-size:1.05em}
${G} .ci{width:1.2em;height:1.2em;display:inline-block;vertical-align:-.22em}
${G} .muts{position:absolute;left:2%;top:9%;display:flex;flex-wrap:wrap;gap:.3em;max-width:40%}
${G} .muts span{font-size:.75em;font-weight:700;padding:.2em .55em;border-radius:.5em;background:rgba(120,60,200,.75)}
${G} .bar{position:absolute;left:1.6%;top:22%;bottom:16%;width:.9em;border-radius:.5em;background:rgba(14,18,34,.45);overflow:visible}
${G} .bar .seg{position:absolute;left:0;right:0;border-top:1px solid rgba(255,255,255,.5)}
${G} .bar .dot{position:absolute;left:50%;width:.8em;height:.8em;margin:0 0 -.4em -.4em;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}
${G} .bar .dot.me{width:1.25em;height:1.25em;margin:0 0 -.62em -.62em;z-index:2}
${G} .lb{position:absolute;right:1.6%;top:2.4%;min-width:12em;max-width:32%;border-radius:.6em;background:rgba(14,18,34,.6);padding:.35em .2em;font-size:.82em}
${G} .lb h4{margin:0 .5em .25em;font-size:.8em;letter-spacing:.12em;color:#9fb4ff;display:flex;justify-content:space-between;gap:1em}
${G} .lb .r{display:flex;align-items:center;gap:.45em;padding:.14em .5em;border-radius:.35em;white-space:nowrap}
${G} .lb .r.me{background:rgba(255,255,255,.14)}
${G} .lb .r i{width:.75em;height:.75em;border-radius:.2em;flex:none}
${G} .lb .r .n{flex:1;overflow:hidden;text-overflow:ellipsis;max-width:9em}
${G} .lb .r .l{opacity:.7;font-size:.85em}
${G} .lb .r b{font-variant-numeric:tabular-nums;min-width:2.8em;text-align:right}
${G} .lb .r b.f{color:#ffd34d}
${G} .banner{position:absolute;left:50%;top:13%;transform:translateX(-50%);text-align:center;opacity:0;transition:opacity .35s;white-space:nowrap}
${G} .banner.on{opacity:1}
${G} .banner small{display:block;font-weight:800;font-size:.8em;letter-spacing:.18em;opacity:.85}
${G} .banner b{display:block;font-size:2em;font-weight:900;letter-spacing:.01em}
${G} .banner em{display:inline-block;margin-top:.2em;font-style:normal;font-weight:800;font-size:.8em;padding:.15em .6em;border-radius:.4em}
${G} .big{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-weight:900;font-size:4.4em;letter-spacing:.02em;text-align:center;white-space:nowrap;opacity:0;transition:opacity .25s}
${G} .big.on{opacity:1}
${G} .big small{display:block;font-size:.3em;letter-spacing:.1em}
${G} .feed{position:absolute;left:50%;bottom:17%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.3em}
${G} .feed div{padding:.25em .8em;border-radius:.5em;background:rgba(14,18,34,.6);font-weight:700;font-size:.9em;animation:tpf .3s}
@keyframes tpf{from{opacity:0;transform:translateY(.5em)}}
${G} .gears{position:absolute;left:50%;bottom:3%;transform:translateX(-50%);display:flex;gap:.4em;pointer-events:auto}
${G} .gears button{all:unset;cursor:pointer;position:relative;width:3.2em;height:3.2em;border-radius:.6em;background:rgba(14,18,34,.6);border:.15em solid rgba(255,255,255,.25);display:grid;place-items:center}
${G} .gears button.on{border-color:#ffd34d;background:rgba(60,48,10,.7)}
${G} .gears button svg{width:2em;height:2em}
${G} .gears button span{position:absolute;left:.25em;top:.1em;font-size:.7em;font-weight:800}
${G} .pzb{all:unset;cursor:pointer;pointer-events:auto;position:absolute;right:1.6%;bottom:3%;width:2.6em;height:2.6em;border-radius:.6em;background:rgba(14,18,34,.55);display:grid;place-items:center;font-weight:900}
${G} .joy{position:absolute;width:7em;height:7em;margin:-3.5em 0 0 -3.5em;border-radius:50%;background:rgba(255,255,255,.14);border:.15em solid rgba(255,255,255,.35);pointer-events:none}
${G} .joy i{position:absolute;left:50%;top:50%;width:3em;height:3em;margin:-1.5em;border-radius:50%;background:rgba(255,255,255,.55)}
${G} .jb{position:absolute;right:5%;bottom:12%;width:5.5em;height:5.5em;border-radius:50%;background:rgba(255,255,255,.2);border:.18em solid rgba(255,255,255,.5);pointer-events:auto;display:grid;place-items:center;font-weight:900;font-size:1em}
${G} .jb.on{background:rgba(255,255,255,.42)}
${G} .scr{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;font-size:clamp(11px,1.6cqw,16px)}
${G} .pan{pointer-events:auto;width:min(92%,36em);max-height:92%;overflow:auto;box-sizing:border-box;padding:1.2em 1.4em;border-radius:1em;background:rgba(16,20,38,.9);box-shadow:0 1em 3em rgba(0,0,0,.4);color:#eef2ff;text-shadow:none}
${G} .pan h2{margin:0 0 .2em;font-size:1.6em;font-weight:900;letter-spacing:.01em}
${G} .pan h3{margin:.8em 0 .35em;font-size:.8em;letter-spacing:.14em;color:#9fb4ff;font-weight:800}
${G} .pan p{margin:.3em 0;line-height:1.4;color:#c8d0ea}
${G} .title{font-size:3.1em;font-weight:900;line-height:.95;letter-spacing:-.01em;margin:0 0 .15em;background:linear-gradient(#fff3b0,#ffb13a 55%,#ff5a3a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 .06em 0 #6b1d10)}
${G} .row{display:flex;flex-wrap:wrap;gap:.5em;align-items:center;margin:.35em 0}
${G} .btn{all:unset;box-sizing:border-box;cursor:pointer;padding:.62em 1.1em;border-radius:.65em;background:#2c3557;font-weight:800;text-align:center;color:#fff;transition:filter .12s,transform .12s}
${G} .btn:hover{filter:brightness(1.15)}
${G} .btn:active{transform:scale(.97)}
${G} .btn:focus-visible{outline:2px solid #ffd34d;outline-offset:2px}
${G} .btn.go{background:linear-gradient(#ff9a3a,#ff5a2a);font-size:1.2em;padding:.7em 1.6em;box-shadow:0 .2em 0 #a8351a}
${G} .btn.alt{background:#3a4a8a}
${G} .btn.sm{padding:.4em .75em;font-size:.88em}
${G} .btn.dis{opacity:.45;pointer-events:none}
${G} .seg2{display:inline-flex;border-radius:.65em;overflow:hidden;background:#232a47}
${G} .seg2 button{all:unset;cursor:pointer;padding:.45em .8em;font-weight:800;font-size:.9em;color:#b9c3e6}
${G} .seg2 button.on{background:#ffb13a;color:#2a1600}
${G} .lbl{min-width:5.5em;font-weight:800;color:#9fb4ff;font-size:.85em}
${G} .card{display:flex;align-items:center;gap:.8em;padding:.55em .7em;border-radius:.7em;background:#1e2542;margin:.35em 0}
${G} .card div{flex:1}
${G} .card b{display:block}
${G} .card small{color:#a9b3d6}
${G} .card .owned{font-weight:800;color:#7be07b;font-size:.85em}
${G} .sw{width:1.7em;height:1.7em;border-radius:.4em;border:.15em solid transparent;cursor:pointer}
${G} .sw.on{border-color:#fff}
${G} .stat{display:grid;grid-template-columns:1fr auto;gap:.3em 1em;margin:.4em 0}
${G} .stat b{text-align:right;font-variant-numeric:tabular-nums}
${G} .res .r{display:flex;gap:.6em;padding:.3em .5em;border-radius:.4em}
${G} .res .r:nth-child(odd){background:rgba(255,255,255,.05)}
${G} .res .r span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${G} .res .r.me{background:rgba(255,177,58,.2)}
${G} .kbd{display:inline-block;min-width:1.4em;padding:0 .35em;border-radius:.3em;background:#2c3557;font-weight:800;text-align:center;font-size:.9em}
${G} .tip{font-size:.85em;color:#9fb4ff}
${G} .neg{filter:invert(1) hue-rotate(180deg)}
${G} .tag{display:inline-block;font-size:.72em;font-weight:800;padding:.1em .45em;border-radius:.35em;margin-left:.4em;vertical-align:.15em}
`;
  const GEAR_ICON = c => `<svg viewBox="0 0 32 32"><path d="M10 26 Q16 30 22 26" stroke="#ccc" stroke-width="2.5" fill="none"/><path d="M9 24c0-3 14-3 14 0M9 20c0-3 14-3 14 0M9 16c0-3 14-3 14 0M9 12c0-3 14-3 14 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="13" y="3" width="6" height="7" rx="2" fill="${c}"/></svg>`;

  function run(root, wrap, api, V) {
    const { THREE, renderer, canvas } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    canvas.style.width = '100%'; wrap.append(canvas);
    let qLvl = 0;
    fitPR(api, V, l => { qLvl = l; });
    renderer.toneMappingExposure = 1.05;
    const bin = [], own = x => (bin.push(x), x);
    const col = h => new THREE.Color(h).convertSRGBToLinear();
    const audio = makeAudio(api);
    const keys = api.keys;
    const P = loadSave(api.load());
    let saveT = 0;
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => api.save(P), 300); };
    audio.mOn = P.music;
    const scene = new THREE.Scene();
    const FOGC = new THREE.Color(0xbfe3ff);
    scene.fog = new THREE.Fog(0xbfe3ff, 120, 700);
    const cam = new THREE.PerspectiveCamera(70, V.w / V.h, 0.3, 1600);
    cam.rotation.order = 'YXZ';
    {
      const g = own(new THREE.SphereGeometry(1400, 24, 14)), p = g.attributes.position, cs = [];
      const c0 = col('#e9f6ff'), c1 = col('#8fd0ff'), c2 = col('#3a86e8'), tc = new THREE.Color();
      for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 1400, t = clamp(y * 1.5 + 0.1, 0, 1); if (t < 0.3) tc.copy(c0).lerp(c1, t / 0.3); else tc.copy(c1).lerp(c2, (t - 0.3) / 0.7); cs.push(tc.r, tc.g, tc.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
      var sky = new THREE.Mesh(g, own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
      sky.renderOrder = -1; scene.add(sky);
    }
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a96b8, 0.62); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4e2, 0.95);
    sun.castShadow = true; sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
    scene.add(sun); scene.add(sun.target);
    const SUN = new THREE.Vector3(38, 70, 26).normalize();
    const texP = own(plasticTex(THREE)), texT = own(trussTex(THREE)), texA = own(arrowTex(THREE));
    const matN = own(new THREE.MeshLambertMaterial({ map: texP, vertexColors: true }));
    const matK = own(new THREE.MeshBasicMaterial({ color: col('#ff2a2a') }));
    const matKl = own(new THREE.MeshBasicMaterial({ color: col('#ff3030'), transparent: true, opacity: 0.85 }));
    const matI = own(new THREE.MeshPhongMaterial({ map: texP, vertexColors: true, shininess: 90, specular: 0x9fd8ff }));
    const matT = own(new THREE.MeshLambertMaterial({ map: texT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: col('#9aa1b2') }));
    const matB = own(new THREE.MeshLambertMaterial({ color: col('#3ce66a'), emissive: col('#0d5a22') }));
    const matG = own(new THREE.MeshBasicMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
    const matF = own(new THREE.MeshBasicMaterial({ color: col('#ffd34d'), transparent: true, opacity: 0.45, depthWrite: false }));
    const matGr = own(new THREE.MeshLambertMaterial({ color: col('#7bc96a') }));
    const convMats = new Map();
    const convMat = s => { const k = Math.round(s * 10); if (!convMats.has(k)) { const t = own(texA.clone()); t.needsUpdate = true; const m = own(new THREE.MeshLambertMaterial({ map: t })); m.userData.s = s; convMats.set(k, m); } return convMats.get(k); };
    {
      const g = own(new THREE.CircleGeometry(900, 48)); g.rotateX(-Math.PI / 2);
      const gm = new THREE.Mesh(g, matGr); gm.position.y = -2; gm.receiveShadow = true; scene.add(gm);
      const pz = new THREE.Mesh(own(new THREE.CylinderGeometry(34, 36, 2, 40)), own(new THREE.MeshLambertMaterial({ color: col('#c9ced9') }))); pz.position.y = -2.9; pz.receiveShadow = true; scene.add(pz);
      const hills = own(new THREE.ConeGeometry(1, 1, 7)), hm = own(new THREE.MeshLambertMaterial({ color: col('#5fae5a'), flatShading: true })), hm2 = own(new THREE.MeshLambertMaterial({ color: col('#8fa4c8'), flatShading: true }));
      const R = rng(42);
      for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + R() * 0.2, d = 380 + R() * 260, s = 50 + R() * 90, m = new THREE.Mesh(hills, d > 520 ? hm2 : hm); m.scale.set(s * 1.6, s * (0.6 + R() * 0.7), s * 1.6); m.position.set(Math.cos(a) * d, -2 + m.scale.y / 2, Math.sin(a) * d); m.rotation.y = R() * 6; scene.add(m); }
      const treeT = own(new THREE.CylinderGeometry(0.6, 0.8, 4, 6)), treeC = own(new THREE.ConeGeometry(4, 9, 7)), tm = own(new THREE.MeshLambertMaterial({ color: col('#7a5634') })), tc = own(new THREE.MeshLambertMaterial({ color: col('#3f9a4a'), flatShading: true }));
      for (let i = 0; i < 40; i++) { const a = R() * TAU, d = 48 + R() * 150; const t = new THREE.Mesh(treeT, tm), c = new THREE.Mesh(treeC, tc); t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); c.position.set(t.position.x, 6, t.position.z); const s = 0.7 + R() * 0.8; t.scale.setScalar(s); c.scale.setScalar(s); c.position.y = 2 + 4.5 * s; scene.add(t, c); }
    }
    const cloudT = own(canvasTex(THREE, 128, 64, (g, w, h) => { for (let i = 0; i < 14; i++) { const x = 20 + Math.random() * 88, y = 22 + Math.random() * 22, r = 12 + Math.random() * 16, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }));
    const cloudM = own(new THREE.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    const clouds = [];
    { const R = rng(9); for (let i = 0; i < 22; i++) { const s = new THREE.Sprite(cloudM), a = R() * TAU, d = 120 + R() * 380, sc = 60 + R() * 90; s.position.set(Math.cos(a) * d, 30 + R() * 320, Math.sin(a) * d); s.scale.set(sc * 2, sc, 1); s.userData.v = 1 + R() * 2; scene.add(s); clouds.push(s); } }

    let TV = null;
    function buildView(T, W) {
      if (TV) TV.dispose();
      const grp = new THREE.Group(), gs = [], movers = [], blinks = [];
      const per = new Map();
      const bucket = (k, si) => { const key = k + ':' + si; if (!per.has(key)) per.set(key, merger()); return per.get(key); };
      const tmpC = new THREE.Color();
      W.cols.forEach((c, i) => {
        const p = c.part;
        if (p.kind === 'goal') return;
        const f = c.t === 1 ? cylFaces(c.hx, c.hy, 4) : boxFaces(c.hx, c.hy, c.hz, p.kind === 't' ? 2 : 4);
        tmpC.copy(col(p.col || '#ccc'));
        const kind = p.kind === 'g' ? 'g' : p.kill ? (p.laser ? 'kl' : 'k') : p.climb ? 't' : p.bounce ? 'b' : p.ice ? 'i' : p.conv ? 'c' : 'n';
        if (c.mv || kind === 'c' || kind === 'b') {
          const m = merger(); m.add(f, ID9, 0, 0, 0, tmpC);
          const g = m.geo(THREE); gs.push(g);
          const mat = kind === 'k' ? matK : kind === 'kl' ? matKl.clone() : kind === 't' ? matT : kind === 'b' ? matB : kind === 'i' ? matI : kind === 'c' ? convMat(p.conv) : (c.mv && c.mv.t === 'b' ? matN.clone() : matN);
          if (mat !== matK && mat !== matT && mat !== matB && mat !== matI && mat !== matN && !convMats.has(Math.round((p.conv || 0) * 10))) bin.push(mat);
          const mesh = new THREE.Mesh(g, mat);
          mesh.castShadow = kind !== 'kl'; mesh.receiveShadow = true;
          mesh.position.set(c.x, c.y, c.z); mesh.rotation.set(c.pitch, c.yaw, c.roll, 'YXZ');
          grp.add(mesh);
          if (c.mv) { movers.push({ c, mesh }); if (c.mv.t === 'b') blinks.push({ c, mesh }); }
          if (kind === 'b') { const sp = new THREE.Mesh(own(new THREE.CylinderGeometry(c.hx * 0.35, c.hx * 0.35, 0.9, 10)), matN); sp.position.set(c.x, c.y - c.hy - 0.45, c.z); grp.add(sp); }
          if (p.mv && p.mv.t === 'w') { const rod = new THREE.Mesh(own(new THREE.BoxGeometry(0.3, p.mv.l, 0.3)), matN); rod.position.y = p.mv.l / 2; mesh.add(rod); }
          return;
        }
        bucket(kind, p.sec).add(f, c.m, c.x, c.y, c.z, tmpC);
      });
      per.forEach((m, key) => {
        const k = key.split(':')[0], g = m.geo(THREE); gs.push(g);
        const mesh = new THREE.Mesh(g, k === 'k' ? matK : k === 'kl' ? matKl : k === 't' ? matT : k === 'i' ? matI : k === 'g' ? matG : matN);
        mesh.castShadow = k !== 'g'; mesh.receiveShadow = k !== 'g';
        if (k === 'g') mesh.renderOrder = 2;
        grp.add(mesh);
      });
      const frame = merger(), fc = new THREE.Color();
      const S = 18.9;
      for (const [x, z] of [[S, S], [S, -S], [-S, S], [-S, -S]]) frame.add(boxFaces(0.9, (T.top + 16) / 2, 0.9, 4), ID9, x, (T.top + 16) / 2 - 2, z, fc.copy(col('#59617a')));
      T.secs.forEach(s => {
        const dc = col(DIFF[s.d][1]);
        for (const [x, z, w, d] of [[S, 0, 0.5, S], [-S, 0, 0.5, S], [0, S, S, 0.5], [0, -S, S, 0.5]]) frame.add(boxFaces(w, 0.35, d, 4), ID9, x, s.y0, z, dc);
      });
      frame.add(boxFaces(S + 0.9, 0.5, S + 0.9, 4), ID9, 0, T.top + 14, 0, fc.copy(col('#59617a')));
      { const g = frame.geo(THREE); gs.push(g); const m = new THREE.Mesh(g, matN); m.castShadow = true; m.receiveShadow = true; grp.add(m); }
      const fg = own(new THREE.CylinderGeometry(3.2, 3.2, 12, 24, 1, true)); fg.translate(0, 6, 0);
      const fin = new THREE.Mesh(fg, matF); fin.position.set(0, T.top, 0); grp.add(fin);
      const ring = new THREE.Mesh(own(new THREE.TorusGeometry(3.4, 0.3, 8, 32)), own(new THREE.MeshBasicMaterial({ color: col('#ffd34d') }))); ring.rotation.x = Math.PI / 2; ring.position.set(0, T.top + 0.4, 0); grp.add(ring);
      scene.add(grp);
      TV = { grp, movers, blinks, fin, ring, dispose() { scene.remove(grp); gs.forEach(g => g.dispose()); TV = null; } };
      return TV;
    }
    const PO2 = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, on: true, warn: 0 };
    function syncView(tr) {
      if (!TV) return;
      for (let i = 0; i < TV.movers.length; i++) {
        const { c, mesh } = TV.movers[i];
        moverPose(c, tr, PO2);
        mesh.position.set(PO2.x, PO2.y, PO2.z); mesh.rotation.set(PO2.pitch, PO2.yaw, PO2.roll, 'YXZ');
        if (c.mv.t === 'b') {
          mesh.visible = true;
          const m = mesh.material;
          if (!PO2.on) { m.transparent = true; m.opacity = 0.12; m.depthWrite = false; mesh.castShadow = false; }
          else if (PO2.warn) { m.transparent = true; m.opacity = (Math.floor(tr * 10) % 2) ? 0.35 : 1; m.depthWrite = true; mesh.castShadow = true; }
          else { m.transparent = false; m.opacity = 1; m.depthWrite = true; mesh.castShadow = true; }
        }
      }
      const pulse = 0.75 + 0.25 * Math.sin(tr * 5);
      matK.color.setRGB(pulse, 0.08 * pulse, 0.08 * pulse);
      convMats.forEach(m => { m.map.offset.y = (tr * m.userData.s / 4) % 1; });
      TV.ring.rotation.z = tr * 0.8; TV.fin.material.opacity = 0.3 + 0.15 * Math.sin(tr * 3);
    }

    const avGeo = { torso: own(new THREE.BoxGeometry(2, 2, 1)), limb: own(new THREE.BoxGeometry(1, 2, 1)), head: own(new THREE.BoxGeometry(1.25, 1.25, 1.25)) };
    avGeo.limb.translate(0, -1, 0);
    const hatGeo = [null, own(new THREE.CylinderGeometry(0.72, 0.72, 0.35, 16)), own(new THREE.SphereGeometry(0.72, 14, 8, 0, TAU, 0, Math.PI / 2)), own(new THREE.ConeGeometry(0.55, 1.3, 14)), own(new THREE.SphereGeometry(0.75, 14, 8, 0, TAU, 0, Math.PI / 2)), own(new THREE.CylinderGeometry(0.62, 0.62, 0.45, 5, 1, true)), own(new THREE.TorusGeometry(0.62, 0.1, 6, 24))];
    const hatCol = ['', '#e8423a', '#3a8ee8', '#ff5ab0', '#9aa1b2', '#ffd34d', '#fff4b0'];
    function mkAvatar(look, name) {
      const g = new THREE.Group(), mats = [];
      const m = c => { const x = new THREE.MeshLambertMaterial({ color: col(c) }); mats.push(x); return x; };
      const sk = m(look.skin), sh = m(look.shirt), pa = m(look.pants);
      const ft = faceTex(THREE, look.skin); const fm = new THREE.MeshLambertMaterial({ map: ft }); mats.push(fm);
      const body = new THREE.Group(); g.add(body);
      const torso = new THREE.Mesh(avGeo.torso, sh); torso.position.y = 3; body.add(torso);
      const head = new THREE.Mesh(avGeo.head, [sk, sk, sk, sk, fm, sk]); head.position.y = 4.64; body.add(head);
      const la = new THREE.Mesh(avGeo.limb, sk), ra = new THREE.Mesh(avGeo.limb, sk), ll = new THREE.Mesh(avGeo.limb, pa), rl = new THREE.Mesh(avGeo.limb, pa);
      la.position.set(-1.5, 4, 0); ra.position.set(1.5, 4, 0); ll.position.set(-0.5, 2, 0); rl.position.set(0.5, 2, 0);
      body.add(la, ra, ll, rl);
      [torso, head, la, ra, ll, rl].forEach(x => { x.castShadow = true; });
      if (look.hat && hatGeo[look.hat]) {
        const h = new THREE.Mesh(hatGeo[look.hat], look.hat === 6 ? new THREE.MeshBasicMaterial({ color: col(hatCol[6]) }) : m(hatCol[look.hat])); if (look.hat === 6) mats.push(h.material);
        h.position.y = 5.35 + (look.hat === 3 ? 0.55 : look.hat === 6 ? 0.55 : 0); if (look.hat === 6) h.rotation.x = Math.PI / 2; if (look.hat === 1) { const v = new THREE.Mesh(own(new THREE.BoxGeometry(0.9, 0.08, 0.6)), h.material); v.position.set(0, -0.12, 0.7); h.add(v); }
        body.add(h);
      }
      let tag = null;
      if (name) {
        const t = canvasTex(THREE, 256, 48, (c, w, hh) => { c.font = '800 30px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(name, w / 2, hh / 2); c.fillStyle = '#fff'; c.fillText(name, w / 2, hh / 2); });
        const sm = new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true }); mats.push(sm);
        tag = new THREE.Sprite(sm); tag.scale.set(4.4, 0.82, 1); tag.position.y = 6.3; g.add(tag);
      }
      scene.add(g);
      return { g, body, torso, head, la, ra, ll, rl, tag, mats, ph: 0, dispose() { scene.remove(g); mats.forEach(x => { if (x.map) x.map.dispose(); x.dispose(); }); } };
    }
    function animAv(a, c, dt, spd) {
      const air = !c.gr && !c.cl;
      a.ph += spd * dt * 0.62;
      const sw = Math.sin(a.ph) * Math.min(1, spd / 14) * 0.95;
      let la = 0, ra = 0, ll = 0, rl = 0, lz = 0, rz = 0;
      if (c.cl) { const s = Math.sin(a.ph * 1.4); la = -2.6 + s * 0.5; ra = -2.6 - s * 0.5; ll = s * 0.6; rl = -s * 0.6; }
      else if (air) { la = -2.9; ra = -2.9; lz = -0.25; rz = 0.25; ll = 0.35; rl = -0.35; }
      else { la = sw; ra = -sw; ll = -sw; rl = sw; }
      const k = Math.min(1, dt * 18);
      a.la.rotation.x += (la - a.la.rotation.x) * k; a.ra.rotation.x += (ra - a.ra.rotation.x) * k;
      a.la.rotation.z += (lz - a.la.rotation.z) * k; a.ra.rotation.z += (rz - a.ra.rotation.z) * k;
      a.ll.rotation.x += (ll - a.ll.rotation.x) * k; a.rl.rotation.x += (rl - a.rl.rotation.x) * k;
    }
    const debris = [];
    function burst(a, x, y, z, vx, vz) {
      const parts = [a.torso, a.head, a.la, a.ra, a.ll, a.rl];
      parts.forEach((p, i) => {
        const m = new THREE.Mesh(p.geometry, p.material);
        m.position.set(x + (i % 3 - 1) * 0.8, y + 1.2 + i * 0.6, z); m.castShadow = true;
        scene.add(m);
        debris.push({ m, vx: vx * 0.4 + (Math.random() * 2 - 1) * 9, vy: 8 + Math.random() * 14, vz: vz * 0.4 + (Math.random() * 2 - 1) * 9, rx: (Math.random() * 2 - 1) * 8, rz: (Math.random() * 2 - 1) * 8, t: 0 });
      });
    }
    function stepDebris(dt) {
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i]; d.t += dt; d.vy -= 120 * dt;
        d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt;
        d.m.rotation.x += d.rx * dt; d.m.rotation.z += d.rz * dt;
        if (d.t > 1.6) { scene.remove(d.m); debris.splice(i, 1); }
      }
    }
    const clearDebris = () => { debris.forEach(d => scene.remove(d.m)); debris.length = 0; };

    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
    const hud = el('div', 'hud', wrap); hud.setAttribute('data-i18n', '');
    const clockEl = el('div', 'clock', hud, '<b>8:00</b><i hidden>x2</i>'), clockB = clockEl.firstChild, rateEl = clockEl.lastChild;
    const moneyEl = el('div', 'money', hud, COIN + '<b>0</b>'), moneyB = moneyEl.lastChild;
    const mutsEl = el('div', 'muts', hud);
    const barEl = el('div', 'bar', hud);
    const lbEl = el('div', 'lb', hud);
    const bannerEl = el('div', 'banner', hud);
    const bigEl = el('div', 'big', hud);
    const feedEl = el('div', 'feed', hud);
    const gearsEl = el('div', 'gears', hud);
    const pzBtn = el('button', 'pzb', hud, 'II'); pzBtn.setAttribute('aria-label', 'Pause');
    const joyEl = el('div', 'joy', hud, '<i></i>'); joyEl.hidden = true; const knob = joyEl.firstChild;
    const jumpB = el('div', 'jb', hud, 'JUMP'); jumpB.hidden = !COARSE;
    const scr = el('div', 'scr', wrap); scr.setAttribute('data-i18n', '');
    const negEl = wrap;
    let touchOn = COARSE;
    const showHud = on => { hud.hidden = !on; };
    showHud(false);

    let R = null, phase = 'menu', paused = false, net = null, menuT = 0;
    const camS = { yaw: 0.6, pitch: 0.32, dist: 17, tx: 0, ty: 4, tz: 0, cd: 17 };
    let shiftLock = false, locked = false;
    const look = () => ({ shirt: SHIRTS[P.shirt], pants: PANTS[P.pants], skin: SKINS[P.skin], hat: P.hat });
    const myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); const n = p && (p.username || p.displayName); if (n) return String(n).slice(0, 16); } catch (e) {} return tr('You'); };
    const botLook = R2 => ({ shirt: SHIRTS[(R2() * SHIRTS.length) | 0], pants: PANTS[(R2() * PANTS.length) | 0], skin: SKINS[(R2() * SKINS.length) | 0], hat: R2() < 0.4 ? 1 + ((R2() * 5) | 0) : 0 });
    const COLS = ['#ffb13a', '#3fa8ff', '#5fd35a', '#ff5ab0', '#b06bff', '#3fe0c5', '#ff6b4b', '#f2f2f2'];

    function newRound(o) {
      endRoundView();
      const md = MODES[o.mode], mods = { spd: 1, grav: 1, jump: 1, inv: false };
      const mset = new Set(o.muts || []);
      if (mset.has('lowg')) mods.grav = 0.75;
      if (mset.has('fast')) mods.spd = 1.25;
      if (mset.has('inv')) mods.inv = true;
      const n = md.secs + (mset.has('len') ? 1 : 0);
      const T = buildTower(o.seed, n, md.pick);
      const W = makeWorld(T.parts, CFG);
      W.mods = mods;
      prepWps(T.wps, W);
      buildView(T, W);
      const dur = md.time + (mset.has('time') ? 120 : 0);
      R = { o, md, T, W, mods, mset, t: 0, acc: 0, dur, left: dur, rate: 1, finishers: [], players: [], me: null, phase: 'count', count: 3.2, end: 0, coinsGot: 0, xpGot: 0, sec: -1, best: -1, lastTick: 99, stats: { deaths: 0, falls: 0 } };
      const meC = newChar(spawnX(0), 0.01, spawnZ(0));
      R.me = { id: o.myId || 'me', name: myName(), c: meC, prev: { x: meC.x, y: meC.y, z: meC.z }, av: mkAvatar(look(), null), col: COLS[0], me: true, fin: false, finT: 0, dead: 0, maxY: 0, lvl: lvlOf(P.xp), gear: -1, wins: P.wins };
      R.players.push(R.me);
      (o.bots || []).forEach((b, i) => {
        const c = newChar(spawnX(i + 1), 0.01, spawnZ(i + 1)), R2 = rng(b.seed);
        const bt = makeBot(c, b.lvl, b.seed, b.name);
        R.players.push({ id: b.id, name: b.name, c, prev: { x: c.x, y: c.y, z: c.z }, av: mkAvatar(b.look || botLook(R2), b.name), col: COLS[(i + 1) % 8], bot: bt, fin: false, finT: 0, dead: 0, maxY: 0, lvl: b.plvl || (1 + ((R2() * 40) | 0)), wins: 0 });
      });
      (o.peers || []).forEach((p, i) => {
        R.players.push({ id: p.id, name: p.name, peer: true, c: newChar(0, 0, 0), prev: { x: 0, y: 0, z: 0 }, av: mkAvatar(p.look || botLook(rng(i * 31 + 5)), p.name), col: COLS[(i + 1 + (o.bots || []).length) % 8], fin: false, finT: 0, dead: 0, maxY: 0, lvl: p.lvl || 1, net: { tp: null, tv: [0, 0, 0], ts: 0, p: [0, 0, 0], face: 0, an: 0 }, wins: 0 });
      });
      R.me.gear = R.md.gear && P.eq >= 0 && P.gear[P.eq] > 0 ? P.eq : -1;
      if (R.me.gear >= 0) { P.gear[R.me.gear]--; persist(); }
      applyGear();
      scene.fog.near = mset.has('fog') ? 6 : 120; scene.fog.far = mset.has('fog') ? 70 : 700;
      negEl.classList.toggle('neg', mset.has('neg'));
      mutsEl.innerHTML = [...mset].map(k => `<span>${esc(tr(MUTS.find(m => m.k === k).n))}</span>`).join('');
      buildBar();
      { const w0 = R.T.wps[0]; camS.yaw = Math.atan2(-(w0.x - R.me.c.x), -(w0.z - R.me.c.z)); camS.pitch = 0.32; camS.cd = camS.dist; camS.tx = R.me.c.x; camS.ty = R.me.c.y + 4.4; camS.tz = R.me.c.z; }
      window.__toh = R; R.auto = (() => { try { return localStorage.getItem('gameplay:toh:auto') === '1'; } catch (e) { return false; } })() ? makeBot(R.me.c, 3, 77, 'me') : null;
      phase = 'play'; showHud(true); hideScr();
      bigEl.innerHTML = ''; audio.song(o.seed & 1); audio.music(true);
      updateGearBar();
      return R;
    }
    const spawnX = i => i ? Math.cos(i * 2.4) * (4 + (i % 3) * 3) : 0, spawnZ = i => i ? Math.sin(i * 2.4) * (4 + (i % 3) * 3) : -2;
    function applyGear() {
      if (!R) return;
      const g = R.me.gear >= 0 ? GEAR[R.me.gear] : null;
      R.myMods = { spd: R.mods.spd * (g ? g.spd : 1), grav: R.mods.grav * (g ? g.grav : 1), jump: 1, inv: R.mods.inv };
      if (R.me.av.coil) { R.me.av.ra.remove(R.me.av.coil); R.me.av.coil = null; }
      if (g) { const m = new THREE.Mesh(own(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 10)), new THREE.MeshLambertMaterial({ color: col(g.col) })); R.me.av.mats.push(m.material); m.position.set(0, -2.1, 0.4); m.rotation.x = Math.PI / 2; R.me.av.ra.add(m); R.me.av.coil = m; }
    }
    function endRoundView() {
      if (!R) return;
      R.players.forEach(p => p.av.dispose());
      clearDebris();
      if (TV) TV.dispose();
      R = null;
    }
    function buildBar() {
      const T = R.T, H = T.top + 4;
      let h = '';
      T.secs.forEach(s => { h += `<div class="seg" style="bottom:${(s.y0 / H * 100).toFixed(2)}%;height:${((s.y1 - s.y0) / H * 100).toFixed(2)}%;background:${DIFF[s.d][1]}55"></div>`; });
      R.players.forEach((p, i) => { h += `<div class="dot${p.me ? ' me' : ''}" data-i="${i}" style="background:${p.col}"></div>`; });
      barEl.innerHTML = h;
      R.dots = [...barEl.querySelectorAll('.dot')];
    }
    function secOf(y) { const s = R.T.secs; for (let i = s.length - 1; i >= 0; i--) if (y >= s[i].y0 - 0.5) return i; return 0; }
    function banner(sub, title, tag, tagCol) {
      bannerEl.innerHTML = `<small>${esc(sub)}</small><b>${esc(title)}</b>${tag ? `<em style="background:${tagCol}">${esc(tag)}</em>` : ''}`;
      bannerEl.classList.add('on'); clearTimeout(banner.t); banner.t = setTimeout(() => bannerEl.classList.remove('on'), 2600);
    }
    function feed(html) { const d = el('div', '', feedEl, html); while (feedEl.children.length > 3) feedEl.firstChild.remove(); api.timeout(() => d.remove(), 3500); }
    function big(html, ms) { bigEl.innerHTML = html; bigEl.classList.add('on'); clearTimeout(big.t); if (ms) big.t = setTimeout(() => bigEl.classList.remove('on'), ms); }

    const inp = { mx: 0, mz: 0, jp: false, jh: false, sp: false };
    let jumpQ = false, joyV = { x: 0, y: 0 }, jumpHeld = false;
    function myInput() {
      let kx = 0, kz = 0;
      if (R && R.phase === 'play' && !paused && !R.me.fin) {
        if (keys.has('KeyW') || keys.has('ArrowUp')) kz += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) kz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
        kx += joyV.x; kz -= joyV.y;
      }
      const m = Math.hypot(kx, kz); if (m > 1) { kx /= m; kz /= m; }
      const fx = -Math.sin(camS.yaw), fz = -Math.cos(camS.yaw);
      inp.mx = fx * kz - fz * kx; inp.mz = fz * kz + fx * kx;
      inp.jp = jumpQ; jumpQ = false;
      inp.jh = (keys.has('Space') || jumpHeld) && R && R.phase === 'play' && !paused;
      if (R && R.me.fin && !R.me.free) { inp.mx = inp.mz = 0; inp.jp = inp.jh = false; }
    }

    function stepRound(dt) {
      const r = R;
      if (r.phase === 'count') {
        const before = Math.ceil(r.count);
        r.count -= dt;
        const now = Math.ceil(r.count);
        if (now !== before && now > 0 && now <= 3) { big(String(now), 0); audio.play('beep'); }
        if (r.count <= 0) { r.phase = 'play'; big(tr('GO!'), 700); audio.play('go'); }
      }
      const W = r.W, dtS = CFG.dt;
      r.acc += dt;
      let steps = 0;
      while (r.acc >= dtS && steps < 12) {
        r.acc -= dtS; steps++;
        if (r.phase === 'count') { r.t += 0; }
        r.t += dtS; W.t = r.t;
        setTime(W, r.t);
        if (r.phase !== 'end') {
          if (r.phase === 'play' && !(net && net.role === 'guest')) { r.left -= dtS * r.rate; if (r.left <= 0) { r.left = 0; if (!net) roundOver(); else if (net.role === 'host') hostRoundOver(); } }
          else if (r.phase === 'play') r.left = Math.max(0, r.left - dtS * r.rate);
        }
        for (const p of r.players) {
          if (p.peer) continue;
          const c = p.c;
          p.prev.x = c.x; p.prev.y = c.y; p.prev.z = c.z;
          if (p.dead > 0) { p.dead -= dtS; if (p.dead <= 0) respawn(p); continue; }
          if (r.phase !== 'play' && r.phase !== 'end') continue;
          let I;
          if (p.me) { myInput(); I = inp; W.mods = r.myMods; if (r.auto && !p.fin) { botThink(r.auto, W, r.T.wps, r.t); I = r.auto.I; } else if (shiftLock) c.face = camS.yaw + Math.PI; }
          else { if (p.fin) { p.bot.I.mx = p.bot.I.mz = 0; p.bot.I.jp = false; } else botThink(p.bot, W, r.T.wps, r.t); I = p.bot.I; W.mods = r.mods; }
          const f0 = c.face;
          stepChar(c, I, W, dtS);
          if (p.me && shiftLock && !r.auto) c.face = f0;
          W.mods = r.mods;
          handleEvents(p);
        }
      }
      if (r.acc > dtS * 4) r.acc = 0;
    }
    function handleEvents(p) {
      const c = p.c, r = R;
      if (p.me) {
        if (c.ev & 1) audio.play('jump');
        if (c.ev & 4) audio.play('bounce');
        if (c.ev & 16) audio.play('climb');
        if (c.ev & 2) { if (c.land > 60) { audio.play('thud'); r.stats.falls++; } else if (c.land > 8) audio.play('land'); }
      }
      if (c.y > p.maxY) p.maxY = c.y;
      if (c.dead && p.dead <= 0) {
        p.dead = 1.4;
        burst(p.av, c.x, c.y, c.z, c.vx, c.vz); p.av.g.visible = false;
        if (p.me) { audio.play('die'); r.stats.deaths++; P.deaths++; persist(); }
        if (p.bot) botReset(p.bot);
        if (p.me && r.auto) botReset(r.auto);
      }
      if (c.y < -30 && !c.dead) { c.dead = true; }
      if (c.fin && !p.fin) finish(p);
      if (p.me && !p.fin) {
        const s = secOf(c.y);
        if (c.gr && s !== r.sec) {
          const up = s > r.sec;
          r.sec = s;
          if (s > r.best) {
            r.best = s;
            const sec = r.T.secs[s];
            banner(tf('Section {n} of {m}', { n: s + 1, m: r.T.secs.length }), tr(sec.name), tr(DIFF[sec.d][0]), DIFF[sec.d][1]);
            if (s > 0) { const g = 2 + sec.d * 2; r.coinsGot += g; r.xpGot += 10 + sec.d * 5; P.coins += g; persist(); audio.play('section'); }
          } else if (up) audio.play('section');
        }
      }
    }
    function respawn(p) {
      const i = R.players.indexOf(p);
      Object.assign(p.c, newChar(spawnX(i), 0.01, spawnZ(i)));
      p.prev.x = p.c.x; p.prev.y = p.c.y; p.prev.z = p.c.z;
      p.av.g.visible = true;
      if (p.me) { audio.play('spawn'); R.sec = 0; }
    }
    function finish(p) {
      const r = R;
      p.fin = true; p.finT = r.t - 0;
      const time = r.dur - r.left;
      p.finTime = time;
      if (net && net.role === 'guest') { if (p.me) api.net.send({ t: 'fin', rd: net.rd, tm: time }); return; }
      recordFinish(p.id, p.name, time);
    }
    function recordFinish(id, name, time) {
      const r = R; if (!r || r.finishers.some(f => f.id === id)) return;
      r.finishers.push({ id, name, time });
      r.rate = Math.min(4, 1 + r.finishers.length);
      const p = r.players.find(q => q.id === id);
      if (p) { p.fin = true; p.finTime = time; }
      onFinishFx(id, name, time, r.finishers.length);
      if (net && net.role === 'host') api.net.send({ t: 'fs', rd: net.rd, f: r.finishers, rate: r.rate });
      if (!net && r.players.every(q => q.fin)) api.timeout(() => { if (R === r && r.phase === 'play') roundOver(); }, 2500);
    }
    function onFinishFx(id, name, time, place) {
      const r = R, me = r.me.id === id;
      if (me) {
        r.me.fin = true;
        const reward = r.md === MODES[2] ? 60 : r.md === MODES[0] ? 15 : 30;
        r.coinsGot += reward; r.xpGot += 100; P.coins += reward; P.wins++; P.xp += 0;
        const mi = MODES.indexOf(r.md);
        const newBest = !P.best[mi] || time < P.best[mi];
        if (newBest) P.best[mi] = Math.round(time * 100) / 100;
        persist(); api.submit(P.wins);
        audio.play('win');
        big(`${esc(tr('You beat the tower!'))}<small>${fmtT2(time)}${newBest ? ' · ' + esc(tr('New best')) : ''}</small>`, 4200);
        confetti();
        api.score(P.wins);
      } else { audio.play('other'); feed(`<span translate="no">${esc(name)}</span> ${esc(tr('beat the tower!'))} <b>${fmtT2(time)}</b>`); }
      if (r.rate > 1) { rateEl.hidden = false; rateEl.textContent = 'x' + r.rate; }
    }
    const conf = [];
    function confetti() {
      const g = own(new THREE.PlaneGeometry(0.5, 0.3));
      for (let i = 0; i < 70; i++) {
        const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.9, 0.6), side: THREE.DoubleSide }));
        const c = R.me.c; m.position.set(c.x, c.y + 6, c.z); scene.add(m);
        conf.push({ m, vx: (Math.random() * 2 - 1) * 14, vy: 10 + Math.random() * 22, vz: (Math.random() * 2 - 1) * 14, t: 0 });
      }
    }
    function stepConf(dt) { for (let i = conf.length - 1; i >= 0; i--) { const q = conf[i]; q.t += dt; q.vy -= 30 * dt; q.vx *= 0.99; q.vz *= 0.99; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt; q.m.rotation.x += dt * 6; q.m.rotation.y += dt * 4; if (q.t > 3) { scene.remove(q.m); q.m.material.dispose(); conf.splice(i, 1); } } }

    function roundOver() {
      const r = R; if (!r || r.phase === 'end') return;
      r.phase = 'end';
      P.towers++; P.xp += r.xpGot; persist();
      audio.play(r.me.fin ? 'coin' : 'over');
      showResults();
    }
    function resultsRows() {
      const r = R;
      const rows = r.players.map(p => ({ p, t: r.finishers.find(f => f.id === p.id) })).sort((a, b) => (a.t && b.t ? a.t.time - b.t.time : a.t ? -1 : b.t ? 1 : b.p.maxY - a.p.maxY));
      return rows.map((x, i) => `<div class="r${x.p.me ? ' me' : ''}"><b>${i + 1}</b><span translate="no">${esc(x.p.name)}</span><b>${x.t ? fmtT2(x.t.time) : Math.round(x.p.maxY / r.T.top * 100) + '%'}</b></div>`).join('');
    }
    function showResults() {
      const r = R;
      const host = !net || net.role === 'host';
      panel(`<div class="pan"><h2>${esc(tr(r.me.fin ? 'Tower beaten!' : 'Time is up!'))}</h2><p>${esc(tr('The tower is rebuilt every round.'))}</p>
        <h3>${esc(tr('WHO REACHED THE TOP'))}</h3><div class="res">${resultsRows()}</div>
        <div class="row" style="margin-top:.7em"><span class="money" style="position:static">${COIN}<b>+${r.coinsGot}</b></span><span class="tip">+${r.xpGot} XP</span></div>
        <div class="row" style="margin-top:.8em">${host ? `<button class="btn go" data-a="next">${esc(tr('Next tower'))}</button>` : `<span class="tip">${esc(tr('Waiting for the host…'))}</span>`}<button class="btn alt" data-a="shop">${esc(tr('Shop'))}</button><button class="btn" data-a="${net ? 'leave' : 'menu'}">${esc(tr(net ? 'Leave' : 'Menu'))}</button></div>
        <p class="tip" data-cd></p></div>`);
      if (host) { let n = 12; const cd = scr.querySelector('[data-cd]'); const tick = () => { if (!R || R !== r || phase !== 'play' || r.phase !== 'end' || !scr.querySelector('[data-cd]')) return; if (n <= 0) { nextTower(); return; } cd.textContent = tf('Next tower in {n}', { n }); n--; api.timeout(tick, 1000); }; tick(); }
    }
    function startSolo() {
      const seed = (Math.random() * 1e9) | 0, Rb = rng(seed ^ 0x5bd1);
      const used = new Set(), bots = [];
      for (let i = 0; i < P.nb; i++) { let nm; for (let k = 0; k < 30; k++) { nm = NA[(Rb() * NA.length) | 0] + NB[(Rb() * NB.length) | 0]; if (!used.has(nm)) break; } used.add(nm); bots.push({ id: 'b' + i, name: nm, lvl: P.lvl, seed: (Rb() * 1e9) | 0 }); }
      const muts = P.mut.slice(); P.mut = []; persist();
      newRound({ seed, mode: P.mode, bots, muts });
    }
    function nextTower() { if (net) { if (net.role === 'host') hostNewRound(); return; } startSolo(); }

    const RAY = { t: 0 };
    function camRay(W, ox, oy, oz, dx, dy, dz, maxT) {
      let best = maxT;
      const y0 = Math.min(oy, oy + dy * maxT) - 1, y1 = Math.max(oy, oy + dy * maxT) + 1;
      const n = query(W, ox + dx * maxT / 2, y0, y1, oz + dz * maxT / 2, maxT / 2 + 1);
      for (let i = 0; i < n; i++) {
        const c = W.cand[i];
        if (!c.on || c.part.kind === 'g' || c.fin || c.part.laser) continue;
        const m = c.m, rx = ox - c.x, ry = oy - c.y, rz = oz - c.z;
        const lox = m[0] * rx + m[3] * ry + m[6] * rz, loy = m[1] * rx + m[4] * ry + m[7] * rz, loz = m[2] * rx + m[5] * ry + m[8] * rz;
        const ldx = m[0] * dx + m[3] * dy + m[6] * dz, ldy = m[1] * dx + m[4] * dy + m[7] * dz, ldz = m[2] * dx + m[5] * dy + m[8] * dz;
        let tmin = 0, tmax = best, ok = true;
        const hz = c.t === 1 ? c.hx : c.hz;
        for (const [o, d, h] of [[lox, ldx, c.hx], [loy, ldy, c.hy], [loz, ldz, hz]]) {
          if (Math.abs(d) < 1e-9) { if (o < -h || o > h) { ok = false; break; } continue; }
          let t1 = (-h - o) / d, t2 = (h - o) / d; if (t1 > t2) { const q = t1; t1 = t2; t2 = q; }
          if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2; if (tmin > tmax) { ok = false; break; }
        }
        if (ok && tmin > 0.2 && tmin < best) best = tmin;
      }
      return best;
    }
    const TMP = new THREE.Vector3();
    function updateCam(dt, alpha) {
      if (!R) return;
      const c = R.me.c, pv = R.me.prev;
      const x = lerp(pv.x, c.x, alpha), y = lerp(pv.y, c.y, alpha), z = lerp(pv.z, c.z, alpha);
      const k = 1 - Math.exp(-dt * 18);
      camS.tx += (x - camS.tx) * (Math.abs(x - camS.tx) > 30 ? 1 : k); camS.ty += (y + 4.4 - camS.ty) * (Math.abs(y + 4.4 - camS.ty) > 30 ? 1 : 1 - Math.exp(-dt * 12)); camS.tz += (z - camS.tz) * (Math.abs(z - camS.tz) > 30 ? 1 : k);
      const cp = Math.cos(camS.pitch), dx = Math.sin(camS.yaw) * cp, dy = Math.sin(camS.pitch), dz = Math.cos(camS.yaw) * cp;
      let ox = camS.tx, oz = camS.tz;
      if (shiftLock) { ox += Math.cos(camS.yaw) * 1.8; oz -= Math.sin(camS.yaw) * 1.8; }
      const hit = camRay(R.W, ox, camS.ty, oz, dx, dy, dz, camS.dist);
      const want = Math.max(1.2, hit - 0.6);
      camS.cd = want < camS.cd ? want : camS.cd + (want - camS.cd) * (1 - Math.exp(-dt * 4));
      cam.position.set(ox + dx * camS.cd, camS.ty + dy * camS.cd, oz + dz * camS.cd);
      TMP.set(ox, camS.ty, oz); cam.lookAt(TMP);
      sun.position.set(camS.tx + SUN.x * 80, camS.ty + SUN.y * 80, camS.tz + SUN.z * 80); sun.target.position.set(camS.tx, camS.ty - 4, camS.tz);
      sky.position.copy(cam.position);
    }
    function menuCam(dt) {
      menuT += dt;
      const top = R ? R.T.top : 160, h = (Math.sin(menuT * 0.07) * 0.5 + 0.5) * top * 0.8 + 10;
      cam.position.set(Math.sin(menuT * 0.12) * 58, h + 14, Math.cos(menuT * 0.12) * 58);
      TMP.set(0, h, 0); cam.lookAt(TMP);
      sun.position.set(SUN.x * 80, h + SUN.y * 80, SUN.z * 80); sun.target.position.set(0, h, 0);
      sky.position.copy(cam.position);
    }

    function render(dt) {
      const r = R;
      const alpha = r ? clamp(r.acc / CFG.dt, 0, 1) : 0;
      if (r) {
        syncView(r.t + alpha * CFG.dt);
        for (const p of r.players) {
          const c = p.c, a = p.av;
          if (a.tag) a.tag.visible = cam.position.distanceToSquared(a.g.position) > 49;
          if (p.peer) { peerPose(p, dt); continue; }
          a.g.position.set(lerp(p.prev.x, c.x, alpha), lerp(p.prev.y, c.y, alpha), lerp(p.prev.z, c.z, alpha));
          a.g.rotation.y = c.face;
          animAv(a, c, dt, Math.hypot(c.vx, c.vz));
        }
        if (phase === 'play' && !(phase === 'menu')) updateCam(dt, alpha); else menuCam(dt);
        hudTick();
      } else menuCam(dt);
      stepDebris(dt); stepConf(dt);
      for (const s of clouds) { s.position.x += s.userData.v * dt; if (s.position.x > 500) s.position.x = -500; }
      renderer.render(scene, cam);
    }
    let hudN = 0;
    function hudTick() {
      const r = R;
      const L = Math.ceil(r.left);
      clockB.textContent = fmtT(L);
      clockEl.classList.toggle('low', r.left < 30);
      if (r.phase === 'play' && L <= 10 && L !== r.lastTick && L > 0) { r.lastTick = L; audio.play(L <= 3 ? 'last' : 'tick'); }
      moneyB.textContent = P.coins;
      if (++hudN % 6) return;
      const H = r.T.top + 4;
      r.players.forEach((p, i) => { const d = r.dots && r.dots[i]; if (d) d.style.bottom = (clamp(p.c.y, 0, H) / H * 100).toFixed(1) + '%'; });
      const rows = r.players.map(p => ({ p, f: r.finishers.find(f => f.id === p.id) })).sort((a, b) => (a.f && b.f ? a.f.time - b.f.time : a.f ? -1 : b.f ? 1 : b.p.c.y - a.p.c.y)).slice(0, 8);
      lbEl.innerHTML = `<h4><span>${esc(tr('PLAYERS'))}</span><span>${esc(tr('LEVEL'))}</span></h4>` + rows.map(x => `<div class="r${x.p.me ? ' me' : ''}"><i style="background:${x.p.col}"></i><span class="n" translate="no">${esc(x.p.name)}</span><span class="l">${x.p.lvl}</span><b class="${x.f ? 'f' : ''}">${x.f ? fmtT(x.f.time) : (secOf(Math.max(0, x.p.c.y)) + 1) + '/' + r.T.secs.length}</b></div>`).join('');
    }
    function updateGearBar() {
      const can = R && R.md.gear;
      gearsEl.innerHTML = can ? GEAR.map((g, i) => (P.gear[i] > 0 || (R && R.me.gear === i)) ? `<button data-g="${i}" class="${R && R.me.gear === i ? 'on' : ''}" title="${esc(tr(g.n))}"><span>${i + 1}</span>${GEAR_ICON(g.col)}</button>` : '').join('') : '';
    }
    function equip(i) {
      if (!R || !R.md.gear || R.phase === 'end') return;
      if (R.me.gear === i) { R.me.gear = -1; P.eq = -1; applyGear(); updateGearBar(); persist(); audio.play('tap'); return; }
      if (P.gear[i] <= 0) { audio.play('no'); return; }
      if (R.me.gear >= 0) P.gear[R.me.gear]++;
      P.gear[i]--; R.me.gear = i; P.eq = i; persist(); applyGear(); updateGearBar(); audio.play('buy');
      feed(esc(tr(GEAR[i].n)));
    }
    function panel(html) { scr.innerHTML = html; scr.style.pointerEvents = 'auto'; const b = scr.querySelector('.btn.go'); if (b && !COARSE) try { b.focus({ preventScroll: true }); } catch (e) {} }
    function hideScr() { scr.innerHTML = ''; scr.style.pointerEvents = 'none'; }
    const seg = (k, opts, cur) => `<div class="seg2" data-k="${k}">${opts.map((o, i) => `<button data-v="${i}" class="${i === cur ? 'on' : ''}">${esc(tr(o))}</button>`).join('')}</div>`;
    const NBS = [0, 3, 5, 7];
    function showMenu() {
      phase = 'menu'; paused = false; showHud(false); unlock();
      if (!R || !R.o.demo) startDemo();
      const lv = lvlOf(P.xp);
      panel(`<div class="pan">
        <div class="title">TOWER<br>OF PERIL</div>
        <p>${esc(tr('Climb a new tower every round before the clock runs out. No checkpoints. Red bricks send you back to the bottom.'))}</p>
        <div class="row"><span class="lbl">${esc(tr('Tower'))}</span>${seg('mode', MODES.map(m => m.n), P.mode)}<span class="tip" data-mi></span></div>
        <div class="row"><span class="lbl">${esc(tr('Bots'))}</span>${seg('nb', ['None', '3', '5', '7'], NBS.indexOf(P.nb) < 0 ? 2 : NBS.indexOf(P.nb))}</div>
        <div class="row"><span class="lbl">${esc(tr('Bot skill'))}</span>${seg('lvl', LEVELS, P.lvl)}</div>
        <div class="row" style="margin-top:.8em"><button class="btn go" data-a="play">${esc(tr('Play'))}</button><button class="btn alt" data-a="online">${esc(tr('Online race'))}</button></div>
        <div class="row"><button class="btn sm" data-a="shop">${esc(tr('Shop'))}</button><button class="btn sm" data-a="avatar">${esc(tr('Avatar'))}</button><button class="btn sm" data-a="stats">${esc(tr('Stats'))}</button><button class="btn sm" data-a="help">${esc(tr('How to play'))}</button></div>
        <div class="row" style="margin-top:.5em"><span class="money" style="position:static">${COIN}<b>${P.coins}</b></span><span class="tip">${esc(tr('Level'))} <b>${lv}</b></span>${P.mut.length ? `<span class="tip">${esc(tr('Next round'))}: ${P.mut.map(k => esc(tr(MUTS.find(m => m.k === k).n))).join(', ')}</span>` : ''}</div>
      </div>`);
      modeInfo();
      if (!P.help) { P.help = true; persist(); }
    }
    function modeInfo() { const e = scr.querySelector('[data-mi]'); if (!e) return; const m = MODES[P.mode]; e.textContent = tf('{n} sections · {t}', { n: m.secs, t: fmtT(m.time) }) + (m.gear ? '' : ' · ' + tr('no gear')); }
    function startDemo() {
      const seed = (Math.random() * 1e9) | 0, Rb = rng(seed);
      const bots = []; for (let i = 0; i < 4; i++) bots.push({ id: 'd' + i, name: NA[(Rb() * NA.length) | 0] + NB[(Rb() * NB.length) | 0], lvl: 2, seed: (Rb() * 1e9) | 0 });
      newRound({ seed, mode: 1, bots, muts: [], demo: true });
      R.me.av.g.visible = false; R.phase = 'play'; R.count = 0; phase = 'menu'; showHud(false);
      audio.music(false);
    }
    function showShop(tab) {
      tab = tab || 0;
      const back = R && !R.o.demo && phase === 'play' ? 'res' : 'menu';
      let body = '';
      if (tab === 0) body = GEAR.map((g, i) => `<div class="card">${GEAR_ICON(g.col).replace('<svg', '<svg width="40" height="40"')}<div><b>${esc(tr(g.n))}</b><small>${esc(tr(g.d))}</small><br><span class="owned">${esc(tr('Owned'))}: ${P.gear[i]}</span></div><button class="btn sm${P.coins < g.cost ? ' dis' : ''}" data-buy="g${i}">${COIN} ${g.cost}</button></div>`).join('') + `<p class="tip">${esc(tr('Gear lasts one round. Press 1, 2 or 3 in the tower to use it. Not allowed in Pro towers.'))}</p>`;
      else if (tab === 1) body = MUTS.map(m => { const q = P.mut.includes(m.k); return `<div class="card"><div><b>${esc(tr(m.n))}</b><small>${esc(tr(m.d))}</small></div>${q ? `<span class="owned">${esc(tr('Next round'))}</span>` : `<button class="btn sm${P.coins < m.cost ? ' dis' : ''}" data-buy="m${m.k}">${COIN} ${m.cost}</button>`}</div>`; }).join('') + `<p class="tip">${esc(tr('Mutators change the next tower for everyone in it.'))}</p>`;
      else body = HATS.map((h, i) => { const own = P.hats.includes(i); return `<div class="card"><div><b>${esc(tr(h.n))}</b></div>${own ? (P.hat === i ? `<span class="owned">${esc(tr('Wearing'))}</span>` : `<button class="btn sm" data-wear="${i}">${esc(tr('Wear'))}</button>`) : `<button class="btn sm${P.coins < h.cost ? ' dis' : ''}" data-buy="h${i}">${COIN} ${h.cost}</button>`}</div>`; }).join('');
      panel(`<div class="pan"><h2>${esc(tr('Shop'))}</h2><div class="row"><span class="money" style="position:static">${COIN}<b>${P.coins}</b></span></div><div class="row">${seg('tab', ['Gear', 'Mutators', 'Hats'], tab)}</div>${body}<div class="row" style="margin-top:.6em"><button class="btn go" data-a="${back}">${esc(tr('Back'))}</button></div></div>`);
      scr.dataset.tab = tab;
    }
    function buy(code) {
      const k = code[0], v = code.slice(1);
      let cost = 0, ok = false;
      if (k === 'g') { const g = GEAR[+v]; cost = g.cost; if (P.coins >= cost && P.gear[+v] < 99) { P.gear[+v]++; ok = true; } }
      else if (k === 'm') { const m = MUTS.find(x => x.k === v); cost = m.cost; if (P.coins >= cost && !P.mut.includes(v)) { P.mut.push(v); ok = true; if (net) { api.net.send({ t: 'mut', k: v }); if (net.role === 'host') net.muts.add(v); P.mut = P.mut.filter(x => x !== v); } } }
      else if (k === 'h') { const i = +v; cost = HATS[i].cost; if (P.coins >= cost && !P.hats.includes(i)) { P.hats.push(i); P.hat = i; ok = true; } }
      if (ok) { P.coins -= cost; persist(); audio.play('buy'); } else audio.play('no');
      updateGearBar();
      showShop(+scr.dataset.tab || 0);
    }
    function showAvatar() {
      const sw = (k, arr) => arr.map((c, i) => `<span class="sw${P[k] === i ? ' on' : ''}" data-sw="${k}:${i}" style="background:${c}"></span>`).join('');
      panel(`<div class="pan"><h2>${esc(tr('Avatar'))}</h2><h3>${esc(tr('SHIRT'))}</h3><div class="row">${sw('shirt', SHIRTS)}</div><h3>${esc(tr('PANTS'))}</h3><div class="row">${sw('pants', PANTS)}</div><h3>${esc(tr('SKIN'))}</h3><div class="row">${sw('skin', SKINS)}</div><h3>${esc(tr('HAT'))}</h3><div class="row">${P.hats.map(i => `<button class="btn sm${P.hat === i ? ' alt' : ''}" data-wear="${i}">${esc(tr(HATS[i].n))}</button>`).join('')}</div><div class="row" style="margin-top:.6em"><button class="btn go" data-a="menu">${esc(tr('Back'))}</button></div></div>`);
    }
    function showStats() {
      const lv = lvlOf(P.xp);
      panel(`<div class="pan"><h2>${esc(tr('Stats'))}</h2><div class="stat"><span>${esc(tr('Level'))}</span><b>${lv}</b><span>${esc(tr('Towers played'))}</span><b>${P.towers}</b><span>${esc(tr('Towers beaten'))}</span><b>${P.wins}</b><span>${esc(tr('Deaths'))}</span><b>${P.deaths}</b>${MODES.map((m, i) => `<span>${esc(tf('Best {m} tower', { m: tr(m.n) }))}</span><b>${P.best[i] ? fmtT2(P.best[i]) : '—'}</b>`).join('')}</div><div class="row" style="margin-top:.6em"><button class="btn go" data-a="menu">${esc(tr('Back'))}</button></div></div>`);
    }
    function showHelp(back) {
      panel(`<div class="pan"><h2>${esc(tr('How to play'))}</h2>
        <p>${esc(tr('Reach the top of the tower before the clock runs out. Every round builds a new tower from random sections.'))}</p>
        <p>${esc(tr('There are no checkpoints. A fall drops you onto the sections below. Red kill bricks send you back to the bottom.'))}</p>
        <p>${esc(tr('When someone reaches the top, the clock speeds up for everyone else.'))}</p>
        <h3>${esc(tr('CONTROLS'))}</h3>
        <p><span class="kbd">W</span> <span class="kbd">A</span> <span class="kbd">S</span> <span class="kbd">D</span> ${esc(tr('or arrows to move, Space to jump, hold Space to keep jumping.'))}</p>
        <p>${esc(tr('Drag with the mouse to turn the camera, wheel to zoom. Shift turns shift lock on and off. R resets your character. 1, 2 and 3 use gear. Esc pauses.'))}</p>
        <p>${esc(tr('On a phone: the stick on the left moves, the button on the right jumps, drag on the right to look around.'))}</p>
        <h3>${esc(tr('PARTS'))}</h3>
        <p>${esc(tr('Trusses: walk into them to climb. Green pads bounce you up. Arrows push you along. Blue ice is slippery. Flashing blocks are about to vanish.'))}</p>
        <div class="row" style="margin-top:.6em"><button class="btn go" data-a="${back || 'menu'}">${esc(tr('Back'))}</button></div></div>`);
    }
    function setPause(on) {
      if (on && (phase !== 'play' || !R || R.o.demo)) return;
      paused = on; unlock();
      if (on) {
        panel(`<div class="pan"><h2>${esc(tr('Paused'))}</h2><p>${esc(tr(R.md.n))} · ${esc(tf('Section {n} of {m}', { n: Math.max(0, R.sec) + 1, m: R.T.secs.length }))}${net ? ' · ' + esc(tr('the race goes on')) : ''}</p>
          <div class="row"><button class="btn go" data-a="res">${esc(tr('Resume'))}</button><button class="btn alt" data-a="reset">${esc(tr('Reset character'))}</button></div>
          <div class="row"><button class="btn sm" data-a="music">${esc(tr(P.music ? 'Music: on' : 'Music: off'))}</button><button class="btn sm" data-a="inv">${esc(tr(P.inv ? 'Invert camera: on' : 'Invert camera: off'))}</button><button class="btn sm" data-a="help2">${esc(tr('How to play'))}</button></div>
          <div class="row"><span class="lbl">${esc(tr('Camera'))}</span>${seg('sens', ['Slow', 'Normal', 'Fast'], P.sens < 0.8 ? 0 : P.sens > 1.3 ? 2 : 1)}</div>
          <div class="row" style="margin-top:.5em"><button class="btn" data-a="${net ? 'leave' : 'menu'}">${esc(tr(net ? 'Leave the race' : 'Leave tower'))}</button></div></div>`);
      } else if (R && R.phase === 'end') showResults(); else hideScr();
    }
    function resetMe() { if (R && R.phase === 'play' && !R.me.c.dead && R.me.dead <= 0) { R.me.c.dead = true; handleEvents(R.me); } }
    api.on(scr, 'click', e => {
      const sg = e.target.closest('.seg2 button');
      if (sg) {
        const k = sg.parentElement.dataset.k, v = +sg.dataset.v;
        audio.play('tap');
        if (k === 'mode') { P.mode = v; modeInfo(); }
        else if (k === 'nb') P.nb = NBS[v];
        else if (k === 'lvl') P.lvl = v;
        else if (k === 'sens') P.sens = [0.6, 1, 1.6][v];
        else if (k === 'tab') { showShop(v); return; }
        persist();
        sg.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sg));
        return;
      }
      const bb = e.target.closest('[data-buy]'); if (bb) { buy(bb.dataset.buy); return; }
      const wr = e.target.closest('[data-wear]'); if (wr) { P.hat = +wr.dataset.wear; persist(); audio.play('tap'); if (scr.querySelector('.sw')) showAvatar(); else showShop(2); return; }
      const sw = e.target.closest('[data-sw]'); if (sw) { const [k, v] = sw.dataset.sw.split(':'); P[k] = +v; persist(); audio.play('tap'); showAvatar(); return; }
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      audio.play('tap');
      if (a === 'play') startSolo();
      else if (a === 'online') goOnline();
      else if (a === 'shop') showShop(0);
      else if (a === 'avatar') showAvatar();
      else if (a === 'stats') showStats();
      else if (a === 'help') showHelp('menu');
      else if (a === 'help2') showHelp('pause');
      else if (a === 'pause') setPause(true);
      else if (a === 'menu') { if (net) leaveNet(); showMenu(); }
      else if (a === 'res') { if (R && R.phase === 'end' && !R.o.demo) showResults(); else setPause(false); }
      else if (a === 'reset') { setPause(false); resetMe(); }
      else if (a === 'music') { P.music = !P.music; audio.mOn = P.music; audio.music(true); persist(); setPause(true); }
      else if (a === 'inv') { P.inv = !P.inv; persist(); setPause(true); }
      else if (a === 'next') nextTower();
      else if (a === 'leave') { leaveNet(); showMenu(); }
      else if (a === 'retry') goOnline();
    });
    api.on(gearsEl, 'click', e => { const b = e.target.closest('[data-g]'); if (b) equip(+b.dataset.g); });
    api.on(pzBtn, 'click', e => { e.stopPropagation(); setPause(!paused); });

    const unlock = () => { if (locked) { try { document.exitPointerLock(); } catch (err) {} } shiftLock = false; };
    api.on(document, 'pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (!locked) shiftLock = false; });
    api.on(document, 'mousemove', e => { if (locked && phase === 'play' && !paused) rotCam((e.movementX || 0) * 0.0032, (e.movementY || 0) * 0.0026); });
    const rotCam = (dx, dy) => { camS.yaw -= dx * P.sens; camS.pitch = clamp(camS.pitch + dy * P.sens * (P.inv ? -1 : 1), -0.6, 1.35); };
    let joyId = null, camId = null, jx0 = 0, jy0 = 0, lx = 0, ly = 0, pinch = null;
    const ptrs = new Map();
    const scaleOf = () => { const r = wrap.getBoundingClientRect(); return { r, s: r.width / (wrap.offsetWidth || r.width) }; };
    api.on(wrap, 'contextmenu', e => e.preventDefault());
    api.on(wrap, 'pointerdown', e => {
      audio.music(phase === 'play');
      if (e.target.closest('.pan') || e.target.closest('button') || e.target.closest('.jb')) return;
      if (phase !== 'play' || paused) return;
      if (e.pointerType === 'touch') { touchOn = true; jumpB.hidden = false; }
      const { r, s } = scaleOf(), fx = (e.clientX - r.left) / r.width;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (e.pointerType !== 'mouse' && fx < 0.45 && joyId === null) {
        joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY;
        joyEl.style.left = (e.clientX - r.left) / s + 'px'; joyEl.style.top = (e.clientY - r.top) / s + 'px'; joyEl.hidden = false; knob.style.transform = '';
      } else if (camId === null) { camId = e.pointerId; lx = e.clientX; ly = e.clientY; }
      else if (e.pointerType !== 'mouse') { const a = ptrs.get(camId); pinch = { d: Math.hypot(e.clientX - a.x, e.clientY - a.y), dist: camS.dist }; }
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(wrap, 'pointermove', e => {
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (e.pointerId === joyId) {
        const { s } = scaleOf(); let dx = (e.clientX - jx0) / s, dy = (e.clientY - jy0) / s; const m = Math.hypot(dx, dy), R0 = 48;
        if (m > R0) { dx *= R0 / m; dy *= R0 / m; }
        joyV.x = dx / R0; joyV.y = dy / R0; knob.style.transform = `translate(${dx}px,${dy}px)`;
      } else if (pinch && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        camS.dist = clamp(pinch.dist * pinch.d / Math.max(20, d), 7, 40);
      } else if (e.pointerId === camId && !locked) {
        const k = e.pointerType === 'mouse' ? 0.0055 : 0.008;
        rotCam((e.clientX - lx) * k, (e.clientY - ly) * k * 0.8); lx = e.clientX; ly = e.clientY;
      }
    });
    const endPtr = e => { ptrs.delete(e.pointerId); if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; joyEl.hidden = true; } if (e.pointerId === camId) camId = null; if (ptrs.size < 2) pinch = null; };
    api.on(wrap, 'pointerup', endPtr); api.on(wrap, 'pointercancel', endPtr);
    api.on(wrap, 'wheel', e => { if (phase !== 'play' || paused || e.target.closest('.pan')) return; e.preventDefault(); camS.dist = clamp(camS.dist * Math.exp(e.deltaY * 0.0011), 7, 40); }, { passive: false });
    api.on(jumpB, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); jumpQ = true; jumpHeld = true; jumpB.classList.add('on'); });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) api.on(jumpB, t, () => { jumpHeld = false; jumpB.classList.remove('on'); });
    api.on(window, 'blur', () => { jumpHeld = false; joyV.x = joyV.y = 0; });
    api.on(window, 'keydown', e => {
      audio.music(phase === 'play' && !(R && R.o.demo));
      const c = e.code;
      if (c === 'Tab' || e.metaKey || e.altKey || e.ctrlKey) return;
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (phase !== 'play' || !R || R.o.demo) { if ((c === 'Enter' || c === 'Space') && scr.querySelector('.btn.go') && document.activeElement !== scr.querySelector('.btn.go')) { e.preventDefault(); scr.querySelector('.btn.go').click(); } return; }
      if (paused) { if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(false); } return; }
      if (R.phase === 'end') { if (c === 'Enter' && scr.querySelector('.btn.go')) { e.preventDefault(); scr.querySelector('.btn.go').click(); } return; }
      if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(true); return; }
      if (c === 'Space' || c.startsWith('Arrow')) e.preventDefault();
      if (e.repeat) return;
      if (c === 'Space') jumpQ = true;
      else if (c === 'KeyR') resetMe();
      else if (c === 'ShiftLeft' || c === 'ShiftRight') { if (shiftLock) unlock(); else { shiftLock = true; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { shiftLock = false; }); } catch (err) { shiftLock = false; } } }
      else if (c === 'Digit1' || c === 'Digit2' || c === 'Digit3') equip(+c.slice(5) - 1);
      else if (c === 'KeyI') camS.dist = clamp(camS.dist * 0.85, 7, 40);
      else if (c === 'KeyO') camS.dist = clamp(camS.dist / 0.85, 7, 40);
    });
    api.on(document, 'visibilitychange', () => { if (document.hidden && phase === 'play' && R && !R.o.demo && !net && !paused) setPause(true); });
    api.on(document, 'fullscreenchange', () => { unlock(); });

    let netHooked = false;
    function leaveNet() { if (net) { try { api.net.close(); } catch (e) {} } net = null; }
    function goOnline() {
      if (!api.net) return;
      if (!netHooked) hookNet();
      net = null;
      phase = 'net'; hideScr(); showHud(false);
      if (!R || !R.o.demo) startDemo();
      phase = 'net';
      api.net.room({ title: 'Tower of Peril', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 8, min: 2, max: 8, bots: true }).then(r => {
        if (!api.alive) return;
        if (!r) { if (phase === 'net') showMenu(); return; }
        net = { role: r.role, players: r.players.slice(), bots: !!r.bots, size: +r.size || r.players.length, rd: 0, muts: new Set(P.mut) };
        P.mut = []; persist();
        if (r.role === 'host') hostNewRound();
        else panel(`<div class="pan"><h2>${esc(tr('Online race'))}</h2><p>${esc(tr('Connected. The host is building the tower…'))}</p><div class="row"><button class="btn" data-a="leave">${esc(tr('Leave'))}</button></div></div>`);
      });
    }
    function rosterMsg() {
      const n = net, me = api.net.id, Rb = rng((Math.random() * 1e9) | 0);
      const ro = n.players.map(p => [p.id, p.name, p.id === me ? lvlOf(P.xp) : 1, p.id === me ? [P.shirt, P.pants, P.skin, P.hat] : null, 0, 0]);
      if (n.bots) { const nb = Math.max(0, Math.min(7, n.size - ro.length)); for (let k = 0; k < nb; k++) ro.push(['b' + k, NA[(Rb() * NA.length) | 0] + NB[(Rb() * NB.length) | 0], 1 + ((Rb() * 30) | 0), [(Rb() * SHIRTS.length) | 0, (Rb() * PANTS.length) | 0, (Rb() * SKINS.length) | 0, (Rb() * 4) | 0], 1, (Rb() * 1e9) | 0]); }
      return ro;
    }
    function hostNewRound() {
      const n = net; if (!n) return;
      n.rd++;
      const seed = (Math.random() * 1e9) | 0, muts = [...n.muts]; n.muts = new Set();
      n.msg = { t: 'rd', rd: n.rd, seed, mode: P.mode, muts, ro: rosterMsg(), lvl: P.lvl };
      n.looks = n.looks || {};
      api.net.send(n.msg);
      beginNetRound(n.msg, true);
    }
    const lookArr = a => a && a.length === 4 ? { shirt: SHIRTS[a[0] % SHIRTS.length], pants: PANTS[a[1] % PANTS.length], skin: SKINS[a[2] % SKINS.length], hat: clamp(a[3] | 0, 0, HATS.length - 1) } : null;
    function beginNetRound(m, hub) {
      const n = net; if (!n) return;
      n.rd = m.rd; n.st = 'race';
      const me = api.net.id;
      const bots = [], peers = [];
      m.ro.forEach(x => { if (x[0] === me) return; if (x[4] && hub) bots.push({ id: x[0], name: x[1], lvl: clamp(m.lvl | 0, 0, 3), seed: x[5], look: lookArr(x[3]), plvl: x[2] }); else peers.push({ id: x[0], name: x[1], lvl: x[2], look: lookArr(x[3]) || (n.looks && lookArr(n.looks[x[0]])) }); });
      newRound({ seed: m.seed, mode: clamp(m.mode | 0, 0, 2), bots, peers, muts: (m.muts || []).filter(k => MUTS.some(q => q.k === k)), myId: me });
      if (m.left != null) { R.left = m.left; R.count = 0; R.phase = 'play'; R.t = m.rt || 0; }
      if (m.f) { R.finishers = m.f.slice(); R.rate = m.rate || 1; R.finishers.forEach(f => { const p = R.players.find(q => q.id === f.id); if (p) { p.fin = true; p.finTime = f.time; } }); }
      api.net.send({ t: 'look', a: [P.shirt, P.pants, P.skin, P.hat], l: lvlOf(P.xp) });
    }
    function hostRoundOver() {
      const n = net, r = R; if (!n || !r || r.phase === 'end') return;
      api.net.send({ t: 'end', rd: n.rd, f: r.finishers });
      roundOver();
    }
    function peerPose(p, dt) {
      const q = p.net, a = p.av;
      if (q.tp) {
        const age = Math.min(0.15, (performance.now() - q.ts) / 1000), k = Math.min(1, dt * 14);
        const gx = q.tp[0] + q.tv[0] * age, gy = q.tp[1] + q.tv[1] * age, gz = q.tp[2] + q.tv[2] * age;
        if (Math.hypot(gx - q.p[0], gy - q.p[1], gz - q.p[2]) > 12) { q.p[0] = gx; q.p[1] = gy; q.p[2] = gz; }
        else { q.p[0] += (gx - q.p[0]) * k; q.p[1] += (gy - q.p[1]) * k; q.p[2] += (gz - q.p[2]) * k; }
        a.g.position.set(q.p[0], q.p[1], q.p[2]);
        a.g.rotation.y += wrapA(q.face - a.g.rotation.y) * k;
        p.c.x = q.p[0]; p.c.y = q.p[1]; p.c.z = q.p[2]; p.c.gr = !!(q.an & 1); p.c.cl = !!(q.an & 2);
        const dead = !!(q.an & 4);
        if (dead && a.g.visible) { burst(a, q.p[0], q.p[1], q.p[2], 0, 0); a.g.visible = false; }
        else if (!dead && !a.g.visible) a.g.visible = true;
        animAv(a, p.c, dt, Math.hypot(q.tv[0], q.tv[2]));
        if (p.c.y > p.maxY) p.maxY = p.c.y;
      } else a.g.visible = false;
    }
    function applyPose(p, x, y, z, face, an) {
      const q = p.net, now = performance.now();
      if (q.tp) { const d = (now - q.ts) / 1000; if (d > 0.01 && d < 0.6) { for (let i = 0; i < 3; i++) q.tv[i] = lerp(q.tv[i], ([x, y, z][i] - q.tp[i]) / d, 0.5); } else if (d >= 0.6) { q.tv[0] = q.tv[1] = q.tv[2] = 0; q.p = [x, y, z]; } }
      else q.p = [x, y, z];
      q.tp = [x, y, z]; q.ts = now; q.face = face; q.an = an;
    }
    const myPose = () => { const c = R.me.c, f = v => Math.round(v * 100) / 100; return [api.net.id, f(c.x), f(c.y), f(c.z), f(c.face), (c.gr ? 1 : 0) | (c.cl ? 2 : 0) | (R.me.dead > 0 ? 4 : 0) | (R.me.fin ? 8 : 0)]; };
    function onData(d, from) {
      const n = net; if (!d || !n) return;
      if (n.role === 'host') {
        if (d.t === 'p' && d.rd === n.rd && R && Array.isArray(d.a)) { const p = R.players.find(q => q.id === from); if (p && p.peer) { applyPose(p, +d.a[1] || 0, +d.a[2] || 0, +d.a[3] || 0, +d.a[4] || 0, d.a[5] | 0); p.raw = [from, d.a[1], d.a[2], d.a[3], d.a[4], d.a[5]]; } }
        else if (d.t === 'fin' && d.rd === n.rd && R && R.phase === 'play' && typeof d.tm === 'number' && d.tm > 0) { const p = R.players.find(q => q.id === from); if (p) recordFinish(from, p.name, Math.min(d.tm, R.dur - R.left + 1)); }
        else if (d.t === 'mut' && MUTS.some(m => m.k === d.k)) { n.muts.add(d.k); const p = R && R.players.find(q => q.id === from); api.net.send({ t: 'msg', s: 'mut', k: d.k, n: p ? p.name : '' }); feed(`<span translate="no">${esc(p ? p.name : '')}</span> ${esc(tr('bought'))} ${esc(tr(MUTS.find(m => m.k === d.k).n))}`); }
        else if (d.t === 'look' && Array.isArray(d.a)) { n.looks = n.looks || {}; n.looks[from] = d.a; const p = R && R.players.find(q => q.id === from); if (p) p.lvl = clamp(d.l | 0, 1, 999); }
        return;
      }
      switch (d.t) {
        case 'rd': if (d.rd >= n.rd) beginNetRound(d, false); break;
        case 'ps': if (d.rd === n.rd && R && Array.isArray(d.a)) { if (typeof d.l === 'number') { R.left = Math.abs(R.left - d.l) > 1.5 ? d.l : lerp(R.left, d.l, 0.2); } if (d.rate) R.rate = d.rate; if (typeof d.rt === 'number' && Math.abs(R.t - d.rt) > 0.08) R.t = lerp(R.t, d.rt, Math.abs(R.t - d.rt) > 1 ? 1 : 0.3); if (R.phase === 'count' && d.go) { R.phase = 'play'; R.count = 0; } for (const a of d.a) { if (!Array.isArray(a) || a[0] === api.net.id) continue; const p = R.players.find(q => q.id === a[0]); if (p && p.peer) applyPose(p, +a[1] || 0, +a[2] || 0, +a[3] || 0, +a[4] || 0, a[5] | 0); } } break;
        case 'fs': if (d.rd === n.rd && R && Array.isArray(d.f)) { d.f.forEach((f, i) => { if (!R.finishers.some(x => x.id === f.id)) { R.finishers.push(f); const p = R.players.find(q => q.id === f.id); if (p) { p.fin = true; p.finTime = f.time; } onFinishFx(f.id, f.name, f.time, i + 1); } }); R.rate = d.rate || R.rate; } break;
        case 'end': if (d.rd === n.rd && R) { if (Array.isArray(d.f)) R.finishers = d.f; roundOver(); } break;
        case 'msg': if (d.s === 'mut' && MUTS.some(m => m.k === d.k)) feed(`<span translate="no">${esc(d.n || '')}</span> ${esc(tr('bought'))} ${esc(tr(MUTS.find(m => m.k === d.k).n))}`); break;
      }
    }
    function hookNet() {
      netHooked = true;
      api.net.on('data', onData);
      api.net.on('leave', pl => {
        const n = net; if (!n || n.role !== 'host' || !pl) return;
        n.players = n.players.filter(p => p.id !== pl.id);
        if (R) { const i = R.players.findIndex(p => p.id === pl.id); if (i >= 0) { const p = R.players[i]; p.av.dispose(); R.players.splice(i, 1); buildBar(); feed(`<span translate="no">${esc(p.name)}</span> ${esc(tr('left'))}`); } }
      });
      api.net.on('rejoin', pl => {
        const n = net; if (!n || n.role !== 'host' || !pl || !n.msg || !R) return;
        api.net.sendTo(pl.id, Object.assign({}, n.msg, { left: R.left, rt: R.t, f: R.finishers, rate: R.rate }));
      });
      api.net.on('lobby', () => { if (net && net.role === 'guest') { endRoundView(); goOnline(); } });
      api.net.on('close', why => {
        if (!net) return;
        net = null;
        endRoundView(); startDemo(); phase = 'menu';
        panel(`<div class="pan"><h2>${esc(tr(why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'))}</h2><p>${esc(tr('The online race has ended.'))}</p><div class="row"><button class="btn go" data-a="menu">${esc(tr('Menu'))}</button><button class="btn alt" data-a="retry">${esc(tr('Online race'))}</button></div></div>`);
      });
      api.interval(() => {
        const n = net; if (!n || !R || R.o.demo || R.phase === 'count' && n.role === 'guest') return;
        if (n.role === 'guest') { const a = myPose(); api.net.send({ t: 'p', rd: n.rd, a }, true); return; }
        const a = [myPose()];
        R.players.forEach(p => { if (p.bot) { const c = p.c, f = v => Math.round(v * 100) / 100; a.push([p.id, f(c.x), f(c.y), f(c.z), f(c.face), (c.gr ? 1 : 0) | (c.cl ? 2 : 0) | (p.dead > 0 ? 4 : 0) | (p.fin ? 8 : 0)]); } else if (p.peer && p.raw) a.push(p.raw); });
        api.net.send({ t: 'ps', rd: n.rd, l: Math.round(R.left * 100) / 100, rate: R.rate, rt: Math.round(R.t * 1000) / 1000, go: R.phase !== 'count' ? 1 : 0, a }, true);
      }, 66);
    }

    let rafT = 0, bgT = 0;
    api.loop(dt => {
      rafT = performance.now();
      if (R) {
        if (phase === 'play' && (!paused || net)) stepRound(dt);
        else if ((phase === 'menu' || phase === 'net') && R.o.demo) { stepRound(dt); demoKeep(); }
      }
      render(dt);
    });
    function demoKeep() {
      const r = R; if (!r || !r.o.demo) return;
      r.left = 999;
      r.players.forEach((p, i) => { if (p.bot && p.fin && !p.wait) p.wait = r.t + 3; if (p.wait && r.t > p.wait) { p.wait = 0; p.fin = false; p.c.fin = false; respawn(p); botReset(p.bot); } });
      r.finishers.length = 0;
    }
    api.interval(() => {
      const now = performance.now();
      if (now - rafT < 400 || !R || !net || net.role !== 'host' || phase !== 'play') { bgT = 0; return; }
      let left = Math.min(5, (now - (bgT || rafT)) / 1000);
      bgT = now;
      while (left > 1e-4 && R) { const d = Math.min(left, 0.05); stepRound(d); left -= d; }
    }, 200);
    if (api.net && api.net.invite) goOnline(); else showMenu();
    return () => {
      clearTimeout(saveT); api.save(P);
      if (net) leaveNet();
      endRoundView(); audio.close();
      conf.forEach(q => { scene.remove(q.m); q.m.material.dispose(); });
      bin.forEach(x => { try { x.dispose(); } catch (e) {} });
    };
  }

  Ameplay.register({
    id: ID, title: 'Tower of Peril', category: '3D', tint: '#ff7a2a',
    blurb: 'Race up a tower of random obstacle sections before the clock runs out. No checkpoints, kill bricks, gear, mutators and online races for up to 8.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Space</kbd> jump (hold to keep jumping) · drag to turn the camera, wheel zoom · <kbd>Shift</kbd> shift lock · <kbd>R</kbd> reset · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> gear · <kbd>Esc</kbd> pause · touch: stick, Jump, drag to look',
    better: 'high', width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 58h24M22 58V8h20v50"/><path d="M22 20h20M22 32h20M22 44h20"/><path d="M27 14h4M33 26h4M27 38h4M33 50h4" stroke-width="3"/></svg>',
    css: CSS,
    lab: { CFG, SECTIONS, MODES, buildTower, makeWorld, setTime, stepChar, newChar, makeBot, botThink, botReset, prepWps, loadSave, simRun, wpPos, SIMC },
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'stage'; root.append(wrap);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();
