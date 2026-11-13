(() => {
  'use strict';
  const ID = 'way-up', G = '.gm-' + ID;
  const CFG = { dt: 1 / 120, grav: 24, jumpV: 8.1, walk: 3.7, sprint: 1.8, accG: 30, accA: 6, decG: 34, decA: 1.5, maxFall: 45, rad: 0.32, hgt: 1.8, coyote: 0.09, jbuf: 0.14, slope: 0.68, climbV: 2.2, stepH: 0.36, turn: 12, hupT: 0.55, shimmy: 0.9, ropeJH: 4.6, ropeJV: 6.2, ropeTurn: 2.4 };
  const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
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
  function newChar(x, y, z) { return { x, y, z, vx: 0, vy: 0, vz: 0, gr: false, gc: null, coy: 0, jb: 0, cl: false, cnx: 0, cnz: 0, dead: false, ev: 0, face: 0, air: 0, fallV: 0, bnc: null, fin: false, land: 0, hk: null, hnx: 0, hnz: 0, htop: 0, hup: 0, hy0: 0, hx1: 0, hz1: 0, hcd: 0, rope: null, rh: 0, ra: 0, rcd: 0, slide: false, top: y, drop: 0, wk: null, wnx: 0, wnz: 0, spr: false }; }
  function copyChar(a, b) { for (const k in a) b[k] = a[k]; return b; }
  const IN0 = { mx: 0, mz: 0, jp: false, jh: false, sp: false, up: 0, turn: 0, dn: false };
  const FREE = { nx: 0, ny: 0, nz: 0, pen: 0, top: 0 };
  function freeAt(W, x, y0, y1, z, r, skip) {
    const n = query(W, x, y0 - 0.5, y1 + 0.5, z, r + 0.5);
    for (let i = 0; i < n; i++) { const k = W.cand[i]; if (k === skip || !k.on || k.ghost) continue; if (contact(k, x, y0, y1, z, r, FREE)) return false; }
    return true;
  }
  function stepChar(c, I, W, dt) {
    const C = W.C;
    c.ev = 0;
    if (c.hcd > 0) c.hcd -= dt;
    if (c.rcd > 0) c.rcd -= dt;
    if (c.hk) {
      if (c.hup > 0) {
        c.hup -= dt;
        const k = clamp(1 - c.hup / C.hupT, 0, 1), ky = Math.min(1, k * 1.7), kx = clamp((k - 0.45) / 0.55, 0, 1);
        c.y = lerp(c.hy0, c.htop + 0.02, ky);
        c.x = lerp(c.hx1 + c.hnx * (C.rad + 0.45), c.hx1, kx); c.z = lerp(c.hz1 + c.hnz * (C.rad + 0.45), c.hz1, kx);
        if (c.hup <= 0) { c.x = c.hx1; c.z = c.hz1; c.y = c.htop + 0.001; c.gc = c.hk; c.hk = null; c.vx = c.vy = c.vz = 0; c.gr = true; c.top = c.y; c.ev |= 256; }
        return;
      }
      const into = -(I.mx * c.hnx + I.mz * c.hnz);
      if (I.jp || into > 0.5) { c.hup = C.hupT; c.hy0 = c.y; c.hx1 = c.x - c.hnx * (C.rad + 0.45); c.hz1 = c.z - c.hnz * (C.rad + 0.45); c.ev |= 128; return; }
      if (into < -0.5 || I.dn) { c.hk = null; c.hcd = 0.4; c.vx = c.hnx * 1.2; c.vz = c.hnz * 1.2; c.vy = 0; c.top = c.y; return; }
      const tx = -c.hnz, tz = c.hnx, side = I.mx * tx + I.mz * tz;
      if (Math.abs(side) > 0.35) {
        const s = Math.sign(side) * C.shimmy * dt, nx = c.x + tx * s, nz = c.z + tz * s, k = c.hk, px = nx - c.hnx * (C.rad + 0.3), pz = nz - c.hnz * (C.rad + 0.3);
        if (contact(k, px, c.htop - 0.05, c.htop - 0.05, pz, 0.05, FREE) && freeAt(W, nx, c.y + C.rad, c.y + C.hgt - C.rad, nz, C.rad * 0.9, k)) { c.x = nx; c.z = nz; }
      }
      c.face = Math.atan2(-c.hnx, -c.hnz);
      return;
    }
    if (c.rope) {
      const r = c.rope;
      if (I.jp) {
        const ox = Math.sin(c.ra), oz = Math.cos(c.ra);
        c.vx = ox * C.ropeJH; c.vz = oz * C.ropeJH; c.vy = C.ropeJV; c.rope = null; c.rcd = 0.5; c.ev |= 1; c.face = Math.atan2(ox, oz); c.top = c.y;
      } else {
        c.rh = clamp(c.rh + (I.up || 0) * C.climbV * dt, r.y0 + 1.5, r.y1);
        c.ra += (I.turn || 0) * C.ropeTurn * dt;
        c.x = r.x + Math.sin(c.ra) * (C.rad + 0.07); c.z = r.z + Math.cos(c.ra) * (C.rad + 0.07); c.y = c.rh - 1.5;
        c.vx = c.vy = c.vz = 0; c.face = c.ra + Math.PI; c.top = c.y;
        return;
      }
    }
    const g = c.gc;
    if (c.gr && g && g.mv) {
      const da = wrapA(g.yaw - g.pyaw), cs = Math.cos(da), sn = Math.sin(da), lx = c.x - g.px, lz = c.z - g.pz;
      c.x = g.x + cs * lx + sn * lz; c.z = g.z - sn * lx + cs * lz; c.y += g.y - g.py; c.face += da;
    }
    if (c.gr) c.spr = !!I.sp;
    const sp = C.walk * (c.spr ? C.sprint : 1), tx = I.mx * sp, tz = I.mz * sp, has = I.mx * I.mx + I.mz * I.mz > 1e-4;
    const a = (c.gr ? (has ? C.accG : C.decG) : (has ? C.accA : C.decA)) * dt;
    let ex = tx - c.vx, ez = tz - c.vz;
    if (!c.gr && !has) { ex = -c.vx; ez = -c.vz; }
    const el = Math.hypot(ex, ez);
    if (el > a) { ex *= a / el; ez *= a / el; }
    c.vx += ex; c.vz += ez;
    if (I.jp) c.jb = C.jbuf; else if (c.jb > 0) c.jb -= dt;
    c.coy = c.gr ? C.coyote : c.coy - dt;
    if (c.cl) {
      if (I.jp) { c.cl = false; c.vy = C.jumpV * 0.8; c.vx = c.cnx * C.walk; c.vz = c.cnz * C.walk; c.jb = 0; c.ev |= 1; }
      else { const into = -(I.mx * c.cnx + I.mz * c.cnz); c.vy = into > 0.25 ? C.climbV : into < -0.5 ? -C.climbV : 0; }
    } else if (c.jb > 0 && c.coy > 0) {
      c.vy = C.jumpV + (c.gr && g && g.vy > 0 ? g.vy : 0); c.jb = 0; c.coy = 0; c.gr = false; c.ev |= 1;
    }
    if (!c.cl) c.vy = Math.max(c.vy - C.grav * dt, -C.maxFall);
    c.fallV = c.vy;
    c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
    collide(c, I, W);
    if (!c.gr && !c.cl && c.rcd <= 0) {
      for (let i = 0; i < W.ropes.length; i++) {
        const r = W.ropes[i];
        if (c.y + 1.6 < r.y0 || c.y + 0.4 > r.y1) continue;
        const dx = c.x - r.x, dz = c.z - r.z, d = Math.hypot(dx, dz);
        if (d < C.rad + 0.2) { c.rope = r; c.ra = d > 1e-3 ? Math.atan2(dx, dz) : c.face + Math.PI; c.rh = clamp(c.y + 1.5, r.y0 + 1.5, r.y1); c.vx = c.vy = c.vz = 0; c.ev |= 64; c.x = r.x + Math.sin(c.ra) * (C.rad + 0.07); c.z = r.z + Math.cos(c.ra) * (C.rad + 0.07); c.y = c.rh - 1.5; return; }
      }
    }
    const k = c.wk;
    if (k && !c.gr && !c.cl && c.vy < 5 && c.hcd <= 0 && !k.mv && k.t === 0 && Math.abs(k.m[4]) > 0.999) {
      const into = -(I.mx * c.wnx + I.mz * c.wnz), top = k.y + k.hy, rel = top - c.y;
      if (into > 0.35 && rel > 0.9 && rel < 2.05) {
        const px = c.x - c.wnx * (C.rad + 0.45), pz = c.z - c.wnz * (C.rad + 0.45);
        if (contact(k, c.x - c.wnx * (C.rad + 0.15), top - 0.05, top - 0.05, c.z - c.wnz * (C.rad + 0.15), 0.06, FREE) && freeAt(W, px, top + 0.05 + C.rad * 0.8, top + C.hgt - 0.1, pz, C.rad * 0.8, null)) {
          c.hk = k; c.hnx = c.wnx; c.hnz = c.wnz; c.htop = top; c.vx = c.vy = c.vz = 0; c.hup = 0; c.ev |= 32; c.face = Math.atan2(-c.wnx, -c.wnz);
          if (rel < 1.45) { c.hup = C.hupT * 0.75; c.hy0 = c.y; c.hx1 = c.x - c.hnx * (C.rad + 0.45); c.hz1 = c.z - c.hnz * (C.rad + 0.45); c.ev |= 128; } else c.y = top - 1.72;
          return;
        }
      }
    }
    if (has && !c.cl) { const want = Math.atan2(tx, tz); c.face += wrapA(want - c.face) * Math.min(1, dt * C.turn); }
    else if (c.cl) c.face += wrapA(Math.atan2(-c.cnx, -c.cnz) - c.face) * Math.min(1, dt * C.turn);
    if (c.gr) { c.drop = c.top - c.y; c.top = c.y; } else if (c.y > c.top) c.top = c.y;
    c.air = c.gr ? 0 : c.air + dt;
  }
  function collide(c, I, W) {
    const C = W.C, r = C.rad, wasGr = c.gr;
    c.gr = false; c.bnc = null; c.slide = false; c.wk = null;
    let gc = null, best = 0, cl = false, wb = 0;
    const n = query(W, c.x, c.y - 1, c.y + C.hgt + 1, c.z, r + 1);
    for (let it = 0; it < 3; it++) {
      let any = false;
      for (let i = 0; i < n; i++) {
        const k = W.cand[i];
        if (!k.on) continue;
        if (!contact(k, c.x, c.y + r, c.y + C.hgt - r, c.z, r, CT)) continue;
        if (k.fin) { c.fin = true; continue; }
        any = true;
        const nx = CT.nx, ny = CT.ny, nz = CT.nz, pen = CT.pen;
        if (ny > C.slope) {
          c.y += Math.min(pen / ny, pen * 2.5);
          if (k.bounce && c.vy <= k.vy + 1) { c.vy = k.bounce; c.bnc = k; c.ev |= 4; c.jb = 0; c.top = c.y; continue; }
          if (c.vy < 0) c.vy = 0;
          c.gr = true;
          if (ny > best) { best = ny; gc = k; }
        } else if (ny < -0.6) {
          c.x += nx * pen; c.y += ny * pen; c.z += nz * pen;
          if (c.vy > k.vy) c.vy = Math.min(c.vy, k.vy);
        } else if (ny > 0.25 && !k.climb) {
          c.x += nx * pen; c.y += ny * pen; c.z += nz * pen;
          const rv = c.vx * nx + c.vy * ny + c.vz * nz;
          if (rv < 0) { c.vx -= nx * rv; c.vy -= ny * rv; c.vz -= nz * rv; }
          c.slide = true;
        } else {
          const stepUp = CT.top - c.y;
          if (wasGr && stepUp > 0 && stepUp <= C.stepH && c.vy <= 0.5 && !k.climb) { c.y = CT.top + 0.002; c.gr = true; if (ny > best || !gc) { best = Math.max(best, 0.7); gc = k; } continue; }
          c.x += nx * pen; c.y += ny * pen * 0.2; c.z += nz * pen;
          let kvx = k.vx, kvz = k.vz;
          if (k.w) { kvx += k.w * (c.z - k.z); kvz -= k.w * (c.x - k.x); }
          const rv = (c.vx - kvx) * nx + (c.vz - kvz) * nz;
          if (rv < 0) { c.vx -= nx * rv; c.vz -= nz * rv; }
          const hl = Math.hypot(nx, nz) || 1;
          if (k.climb) {
            const cx = nx / hl, cz = nz / hl, into = -(I.mx * cx + I.mz * cz);
            if (into > 0.25 || (c.cl && into > -0.5)) { cl = true; c.cnx = cx; c.cnz = cz; }
          } else if (hl > wb) { wb = hl; c.wk = k; c.wnx = nx / hl; c.wnz = nz / hl; }
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
  const DEG = Math.PI / 180;
  const SCENES = [
    { n: 'Back Alley', sub: 'Rooftops at dusk', sky: ['#5a6fb8', '#ffb98a'], fog: '#f2bd96', sun: '#ffcf9a', hemi: ['#ffe3c4', '#6a5a7a'], chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64]], tr: ['ladder', 1.4, 10, 25, 3.0, 3.0, 'chimneystack'],
      mv: [['b', 1.0, 0.9, 0, 1.6, 1.2, 'dumpster'], ['b', 1.2, 1.0, 0, 1.2, 1.2, 'crate'], ['b', 1.4, 0.9, 20, 1.0, 1.0, 'crate'], ['ramp', 0.4, 3.0, 10, 1.2, 5, 'stairs'], ['b', 0, 0, 0, 2.4, 2.4, 'landing'], ['ledge', 0.5, 2.0, 30, 3.0, 4.0, 'roof'], ['b', 1.6, 0.4, 15, 1.2, 1.4, 'ac'], ['c', 2.0, 0.7, 15, 2.2, 0, 'tank'], ['beam', 1.4, 0, 15, 0.3, 4.5, 'plank'], ['b', 0.9, 1.1, 20, 1.4, 1.4, 'chimney'], ['rope', 1.0, 5.5, 15, 0, 0, 'rope'], ['b', 1.6, 0.3, 0, 3.4, 3.4, 'roof'], ['bounce', 0.8, 0, 20, 1.4, 2.0, 'mattress'], ['b', 1.2, 3.0, 0, 2.2, 1.6, 'billboard'], ['beam', 0, 0, 30, 0.3, 4.0, 'rail'], ['b', 2.8, 0.4, 20, 1.2, 1.2, 'antenna'], ['ladder', 1.2, 6.0, 15, 2.6, 2.6, 'watertower'], ['c', 1.6, 0.6, 25, 2.0, 0, 'tank'], ['b', 3.0, 0.2, 20, 2.0, 2.0, 'crate']] },
    { n: 'Scrapyard Stack', sub: 'Old cars and cranes', sky: ['#6f8fc4', '#ffd9a6'], fog: '#e8c9a8', sun: '#ffe0b0', hemi: ['#fff0d8', '#6a6a70'], chords: [[50, 57, 60, 64], [48, 55, 59, 64], [53, 57, 60, 65], [55, 59, 62, 67]], tr: ['rope', 1.2, 12, 20, 0, 0, 'cable'],
      mv: [['b', 1.0, 0.6, 10, 2.0, 4.0, 'car'], ['b', 0.8, 1.1, 15, 2.0, 4.0, 'car'], ['ramp', 0.3, 2.4, 20, 1.8, 4.5, 'carramp'], ['b', 0.2, 0, 0, 2.6, 6.0, 'container'], ['ledge', 0.4, 1.9, 25, 2.6, 6.0, 'container'], ['c', 1.8, 0.2, 20, 1.6, 0, 'tire'], ['c', 1.9, 0.5, 15, 1.6, 0, 'tire'], ['c', 2.0, 0.5, 15, 1.4, 0, 'tire'], ['b', 1.6, 0.8, 20, 2.0, 2.0, 'cube'], ['move', 1.5, 0.5, 15, 2.0, 2.0, 'magnet', [0, 3.5, 4.4]], ['b', 1.6, 0.5, 10, 2.0, 2.0, 'cube'], ['beam', 0.6, 4.0, 20, 0.6, 7, 'cranearm'], ['b', 0, 0, 0, 2.0, 2.0, 'cab'], ['rope', 1.2, 6.0, 30, 0, 0, 'cable'], ['b', 1.5, 0.4, 0, 2.6, 6.0, 'container'], ['bounce', 1.2, 0, 25, 1.6, 1.6, 'tirebounce'], ['b', 1.0, 3.2, 0, 2.6, 2.6, 'container'], ['b', 2.6, 0.6, 20, 1.6, 1.6, 'cube'], ['b', 3.0, 0.5, 15, 2.2, 2.2, 'cube']] },
    { n: 'Pipe Garden', sub: 'Steam, valves and vines', sky: ['#3f7f86', '#b8e6c8'], fog: '#a8d6c0', sun: '#e6ffe0', hemi: ['#dfffee', '#3a5a50'], chords: [[52, 59, 62, 66], [50, 57, 62, 64], [55, 59, 62, 66], [57, 61, 64, 69]], tr: ['ladder', 1.2, 10, 25, 2.6, 2.6, 'tank'],
      mv: [['beam', 1.0, 0, 15, 0.5, 6, 'pipe'], ['c', 1.2, 0.9, 20, 1.6, 0, 'valve'], ['beam', 0.8, 2.0, 15, 0.6, 5, 'pipe'], ['c', 0.6, 0.8, 20, 1.4, 0, 'pipetop'], ['bounce', 1.4, 0.2, 15, 1.2, 1.2, 'steam'], ['c', 1.2, 3.2, 0, 1.6, 0, 'pipetop'], ['ledge', 0.4, 1.8, 25, 2.4, 2.4, 'tankbox'], ['beam', 1.4, 0, 20, 0.5, 5.5, 'pipe'], ['rope', 1.0, 6.5, 20, 0, 0, 'vine'], ['c', 1.8, 0.3, 15, 1.4, 0, 'pipetop'], ['beam', 1.0, 0.6, 25, 0.45, 5, 'pipe'], ['c', 1.6, 0.8, 20, 1.2, 0, 'valve'], ['spin', 1.6, 0.4, 15, 2.6, 0, 'wheel', [1.1]], ['c', 1.4, 0.8, 20, 1.4, 0, 'pipetop'], ['ladder', 1.0, 5.0, 15, 2.2, 2.2, 'tank'], ['beam', 1.0, 0, 25, 0.5, 6, 'pipe'], ['bounce', 1.0, 0, 20, 1.4, 1.4, 'steam'], ['c', 1.0, 3.3, 0, 1.6, 0, 'pipetop'], ['b', 2.8, 0.3, 20, 2.0, 2.0, 'grate']] },
    { n: 'Sky Picnic', sub: 'Giant snacks above the clouds', sky: ['#7fb4ff', '#ffe6f0'], fog: '#f6dcea', sun: '#fff6e8', hemi: ['#ffffff', '#c8a0b8'], chords: [[60, 64, 67, 71], [57, 60, 64, 69], [53, 57, 60, 64], [55, 59, 62, 67]], tr: ['rope', 1.2, 12, 25, 0, 0, 'licorice'],
      mv: [['c', 1.2, 0.8, 15, 3.0, 0, 'cookie'], ['c', 1.6, 0.8, 20, 2.6, 0, 'cookie'], ['ramp', 0.4, 2.6, 15, 2.2, 5, 'melon'], ['b', 0, 0, 0, 2.2, 1.4, 'melontop'], ['beam', 1.0, 0, 25, 0.5, 6, 'fork'], ['c', 1.2, 0.6, 20, 2.4, 0, 'cup'], ['bounce', 1.2, 0, 15, 1.6, 1.6, 'jelly'], ['c', 1.2, 3.2, 0, 3.4, 0, 'cake'], ['ledge', 0.5, 2.0, 25, 2.0, 2.0, 'sugar'], ['c', 1.8, 0.3, 20, 1.2, 0, 'cherry'], ['b', 2.0, 0.5, 20, 1.2, 4, 'chocbar'], ['beam', 0.8, 1.6, 15, 0.4, 5, 'pretzel'], ['c', 1.4, 0.8, 25, 2.8, 0, 'donut'], ['rope', 1.0, 6.0, 15, 0, 0, 'licorice'], ['c', 1.6, 0.2, 20, 3.0, 0, 'pancake'], ['c', 1.4, 0.9, 15, 2.4, 0, 'pancake'], ['c', 1.4, 0.9, 15, 2.0, 0, 'pancake'], ['spin', 1.4, 0.4, 20, 3.0, 0, 'plate', [-0.8]], ['b', 2.6, 0.5, 20, 2.0, 2.0, 'sugar']] },
    { n: 'Floating Library', sub: 'Pages in the wind', sky: ['#4a3c7a', '#f0c8a8'], fog: '#c8a8c0', sun: '#ffe0c0', hemi: ['#ffe8d8', '#4a3a5a'], chords: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 60]], tr: ['ladder', 1.2, 10, 25, 2.8, 2.8, 'shelf'],
      mv: [['b', 1.0, 0.8, 15, 3.0, 2.2, 'book'], ['b', 0.6, 0.6, 10, 2.6, 2.0, 'book'], ['b', 0.6, 0.6, 10, 2.4, 1.8, 'book'], ['ramp', 0.3, 2.5, 20, 2.4, 4.5, 'openbook'], ['beam', 1.2, 0, 20, 0.35, 6, 'pencil'], ['b', 1.0, 1.0, 20, 2.0, 2.8, 'book'], ['ladder', 1.0, 6.0, 15, 2.4, 2.4, 'shelf'], ['beam', 0.8, 0, 25, 0.3, 5, 'pencil'], ['c', 1.4, 0.6, 20, 1.8, 0, 'inkpot'], ['b', 2.6, 0.4, 15, 2.6, 1.8, 'book'], ['ledge', 0.5, 2.0, 20, 2.6, 2.6, 'bookstack'], ['rope', 1.2, 6.5, 25, 0, 0, 'bookmark'], ['b', 1.8, 0.3, 15, 2.8, 2.2, 'book'], ['move', 1.6, 0.4, 20, 2.0, 1.6, 'flybook', [3.0, 0, 4.6]], ['b', 1.6, 0.5, 15, 2.4, 2.0, 'book'], ['bounce', 1.0, 0, 20, 1.6, 1.6, 'pillow'], ['b', 1.2, 3.2, 0, 2.6, 2.0, 'book'], ['beam', 1.0, 0.8, 20, 0.35, 5, 'pencil'], ['b', 2.6, 0.4, 20, 2.4, 2.4, 'book']] },
    { n: 'Cloud Temple', sub: 'White stone over a sea of clouds', sky: ['#5f9df0', '#fff4dc'], fog: '#f4f0e6', sun: '#fffaf0', hemi: ['#ffffff', '#b8b0a0'], chords: [[62, 66, 69, 73], [59, 62, 66, 71], [55, 59, 62, 66], [57, 61, 64, 69]], tr: ['rope', 1.2, 12, 25, 0, 0, 'bellrope'],
      mv: [['b', 1.2, 0.8, 15, 3, 1.6, 'step'], ['b', 0.2, 0.6, 0, 3, 1.4, 'step'], ['b', 0.2, 0.6, 0, 3, 1.4, 'step'], ['c', 1.6, 0.6, 20, 1.6, 0, 'column'], ['c', 1.8, 0.6, 15, 1.4, 0, 'column'], ['c', 2.0, 0.6, 15, 1.2, 0, 'column'], ['bounce', 1.2, 0, 20, 2.0, 2.0, 'cloud'], ['b', 1.2, 3.3, 0, 3.0, 2.0, 'arch'], ['beam', 0, 0, 25, 0.6, 6, 'archtop'], ['ledge', 0.6, 2.0, 20, 2.6, 2.6, 'altar'], ['bounce', 1.0, 0, 20, 2.0, 2.0, 'cloud'], ['c', 1.0, 3.4, 0, 2.0, 0, 'column'], ['rope', 1.0, 6.0, 20, 0, 0, 'bellrope'], ['b', 1.6, 0.3, 15, 3.0, 3.0, 'terrace'], ['spin', 1.4, 0.4, 20, 3.0, 0, 'sundial', [0.9]], ['c', 1.8, 0.6, 20, 1.4, 0, 'column'], ['ladder', 1.0, 5.5, 15, 2.6, 2.6, 'templetower'], ['b', 2.8, 0.2, 20, 2.0, 2.0, 'step']] },
    { n: 'Lantern Night', sub: 'Paper lights and long bridges', sky: ['#0c1030', '#3a2a5a'], fog: '#2a2448', sun: '#9ab0ff', hemi: ['#a8b8ff', '#2a1a30'], chords: [[49, 56, 61, 64], [45, 52, 57, 61], [47, 54, 59, 63], [44, 51, 56, 59]], tr: ['ladder', 1.2, 10, 25, 2.6, 2.6, 'pagodatower'],
      mv: [['c', 1.2, 0.8, 15, 1.6, 0, 'lantern'], ['c', 1.6, 0.8, 20, 1.4, 0, 'lantern'], ['beam', 1.0, 0, 20, 0.7, 6, 'bridge'], ['beam', 0.6, 2.2, 25, 0.7, 5, 'bridge'], ['c', 1.0, 0.5, 20, 1.6, 0, 'lantern'], ['rope', 1.0, 6.0, 20, 0, 0, 'string'], ['c', 1.6, 0.3, 15, 1.4, 0, 'lantern'], ['move', 1.4, 0.4, 20, 1.6, 1.6, 'kite', [0, 3.0, 4.2]], ['c', 1.6, 0.5, 20, 1.4, 0, 'lantern'], ['ledge', 0.5, 2.0, 20, 2.4, 2.4, 'pagoda'], ['beam', 1.2, 0, 25, 0.35, 5.5, 'cord'], ['c', 1.2, 0.6, 20, 1.2, 0, 'lantern'], ['bounce', 1.0, 0, 20, 1.6, 1.6, 'drum'], ['c', 1.0, 3.3, 0, 2.0, 0, 'lantern'], ['rope', 1.0, 6.5, 20, 0, 0, 'string'], ['b', 1.6, 0.3, 15, 2.6, 2.6, 'pagoda'], ['spin', 1.4, 0.4, 20, 2.8, 0, 'lotus', [-1.0]], ['c', 2.6, 0.4, 20, 1.6, 0, 'lantern']] },
    { n: 'Star Road', sub: 'The last steps to the sky', sky: ['#02030c', '#1a1440'], fog: '#0a0a20', sun: '#c8d0ff', hemi: ['#c0c8ff', '#100818'], chords: [[48, 55, 62, 64], [44, 51, 58, 62], [46, 53, 60, 65], [51, 58, 63, 67]], tr: null,
      mv: [['b', 1.4, 0.6, 15, 2.4, 2.0, 'rock'], ['b', 2.0, 0.6, 20, 2.0, 2.0, 'rock'], ['b', 2.4, 0.5, 15, 1.6, 1.6, 'rock'], ['beam', 1.0, 0, 25, 0.5, 6, 'panel'], ['b', 0, 0, 0, 2.0, 2.0, 'satellite'], ['ledge', 0.6, 2.0, 20, 2.2, 2.2, 'rock'], ['bounce', 1.0, 0, 20, 1.6, 1.6, 'crystal'], ['b', 1.2, 3.3, 0, 2.6, 2.6, 'rock'], ['spin', 1.6, 0.4, 20, 3.0, 0, 'ring', [1.0]], ['b', 2.6, 0.5, 20, 1.6, 1.6, 'rock'], ['rope', 1.0, 6.0, 20, 0, 0, 'tether'], ['b', 1.6, 0.3, 15, 2.2, 2.2, 'rock'], ['move', 1.5, 0.4, 20, 1.8, 1.8, 'drift', [3.0, 0, 5.0]], ['b', 1.6, 0.5, 20, 1.8, 1.8, 'rock'], ['beam', 1.0, 1.6, 20, 0.5, 6, 'starbridge'], ['c', 0.6, 0.6, 15, 6.0, 0, 'moon']] }
  ];
  const PROP_TH = { dumpster: 1.4, crate: 1.2, landing: 0.3, roof: 3, ac: 1, chimney: 2.2, billboard: 0.4, antenna: 0.5, car: 1.3, container: 2.6, cube: 1.8, magnet: 0.6, cab: 1.6, tire: 0.6, grate: 0.3, valve: 0.3, pipetop: 3, tankbox: 4, cookie: 0.5, melontop: 0.4, cup: 2.2, cake: 2.4, sugar: 2, cherry: 1, chocbar: 0.6, donut: 0.8, pancake: 0.35, book: 0.6, inkpot: 1.4, bookstack: 4, flybook: 0.5, step: 0.6, column: 5, arch: 1.2, altar: 3, terrace: 1, lantern: 1.6, pagoda: 1.2, rock: 1.6, satellite: 1.4, moon: 1.6, watertower: 0, tank: 2.4, shelf: 0, templetower: 0, pagodatower: 0, chimneystack: 0, jelly: 0.8, mattress: 0.5, steam: 0.4, tirebounce: 0.6, pillow: 0.6, cloud: 1, drum: 0.9, crystal: 0.8, wheel: 0.3, plate: 0.3, sundial: 0.5, lotus: 0.4, ring: 0.4 };
  function buildClimb() {
    const parts = [], wps = [], ropes = [], scenes = [];
    let hd = Math.PI / 2, cur = { x: -3, z: -16, top: 0, hl: 1 };
    parts.push({ x: 0, y: -0.5, z: 0, hx: 70, hy: 0.5, hz: 70, kind: 'ground', prop: 'street', sc: 0, yaw: 0, pitch: 0, roll: 0 });
    const add = (p, si) => { parts.push(Object.assign({ yaw: 0, pitch: 0, roll: 0, sc: si }, p)); return parts.length - 1; };
    const W = (x, y, z, o, si) => wps.push(Object.assign({ x, y, z, r: 0.9, k: 0, m: null, sc: si }, o || {}));
    const move = (mv, si) => {
      const [k, gap, dy, turn, a1, a2, prop, ex] = mv;
      hd += turn * DEG;
      const dx = Math.sin(hd), dz = Math.cos(hd);
      const top = cur.top + dy;
      if (k === 'b' || k === 'c' || k === 'ledge' || k === 'bounce' || k === 'move' || k === 'spin' || k === 'ladder') {
        const round = k === 'c' || k === 'spin', w = a1, d = round ? a1 : a2, hl = d / 2;
        const cx = cur.x + dx * (cur.hl + gap + hl), cz = cur.z + dz * (cur.hl + gap + hl);
        let th = PROP_TH[prop] || 0.8;
        if (k === 'ledge') th = Math.max(th, dy + 1.6);
        if (k === 'ladder' || !th) th = Math.max(dy + 0.5, 1);
        const p = { x: cx, y: top - th / 2, z: cz, hx: w / 2, hy: th / 2, hz: d / 2, yaw: hd, cyl: round, prop, kind: k };
        if (k === 'bounce') p.bounce = 13.2;
        if (k === 'move') { const [al, sd, per] = ex; p.mv = { t: 's', ax: dx * al + dz * sd, ay: 0, az: dz * al - dx * sd, p: per, ph: 0 }; }
        if (k === 'spin') p.mv = { t: 'r', w: ex[0], ph: 0, cx, cz, ox: 0, oz: 0 };
        const id = add(p, si);
        if (k === 'ladder') {
          const fx = cx - dx * (hl + 0.1), fz = cz - dz * (hl + 0.1);
          add({ x: fx, y: cur.top + (top + 1.2 - cur.top) / 2, z: fz, hx: 0.45, hy: (top + 1.2 - cur.top) / 2, hz: 0.08, yaw: hd, climb: true, prop: 'ladder', kind: 't' }, si);
        }
        W(cx, top, cz, k === 'bounce' ? { k: 1 } : (k === 'move' || k === 'spin') ? { m: id } : null, si);
        cur = { x: cx, z: cz, top, hl };
      } else if (k === 'beam' || k === 'ramp') {
        const w = a1, L = a2, sx = cur.x + dx * (cur.hl + gap), sz = cur.z + dz * (cur.hl + gap), ex2 = sx + dx * L, ez = sz + dz * L;
        const hz = Math.hypot(L, dy) / 2, pitch = -Math.atan2(dy, L), ny = Math.cos(pitch), nh = Math.sin(pitch), th = prop === 'pipe' || prop === 'pencil' || prop === 'fork' ? w : 0.3;
        const round = prop === 'pipe';
        add({ x: (sx + ex2) / 2 - dx * nh * th / 2, y: cur.top + dy / 2 - ny * th / 2, z: (sz + ez) / 2 - dz * nh * th / 2, hx: w / 2, hy: th / 2, hz, yaw: hd, pitch, prop, kind: k, cylz: round }, si);
        W(sx + dx * Math.min(0.6, L / 3), cur.top + dy * Math.min(0.6, L / 3) / L, sz + dz * Math.min(0.6, L / 3), { r: 0.45 }, si);
        W(ex2 - dx * 0.45, top - dy * 0.45 / L, ez - dz * 0.45, { r: 0.45 }, si);
        cur = { x: ex2 - dx * 0.25, z: ez - dz * 0.25, top, hl: 0.25 };
      } else if (k === 'rope') {
        const rx = cur.x + dx * (cur.hl + gap), rz = cur.z + dz * (cur.hl + gap), y0 = cur.top + 0.7, y1 = cur.top + dy;
        const r = { x: rx, z: rz, y0, y1, prop, sc: si, id: ropes.length };
        ropes.push(r);
        W(rx, y0 + 0.2, rz, { k: 2, rope: r.id, r: 0.5 }, si);
        cur = { x: rx, z: rz, top: y1 - 1.5, hl: 0.35 };
      }
    };
    SCENES.forEach((S, si) => {
      scenes.push({ i: si, y0: cur.top, w0: wps.length, x: cur.x, z: cur.z, hd });
      S.mv.forEach(m => move(m, si));
      if (S.tr) move(S.tr, si);
      scenes[si].y1 = cur.top; scenes[si].w1 = wps.length;
    });
    const last = parts[parts.length - 1];
    add({ x: last.x, y: last.y + last.hy + 1.4, z: last.z, hx: 1.4, hy: 1.2, hz: 1.4, fin: true, kind: 'goal', prop: 'goal' }, SCENES.length - 1);
    return { parts, wps, ropes, scenes, top: cur.top, goal: { x: last.x, y: last.y + last.hy, z: last.z } };
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
      if (w.k === 2) return;
      for (const c of W.cols) { if (c.ghost || c.fin || c.climb) continue; if (contact(c, w.x, w.y - 0.12, w.y - 0.12, w.z, 0.15, CT) && c.y > by) { by = c.y; best = c; } }
      w.col = best;
      if (best && !best.mv && best.t === 0 && Math.abs(best.m[4]) > 0.999 && !w.rr) { const lim = Math.min(best.hx, best.hz) - 0.35; if (lim > w.r) w.r = Math.min(1.6, lim); }
    });
  }
  const RUN = { mx: 0, mz: 0, jp: false, jh: false, sp: false, up: 0, turn: 0, dn: false }, SIMC = newChar(0, 0, 0), SIMI = { mx: 0, mz: 0, jp: false, jh: false, sp: false, up: 0, turn: 0, dn: false }, TP = { x: 0, y: 0, z: 0 }, TN = { x: 0, y: 0, z: 0 };
  function steer(c, T, I, W, air, aim) {
    let dx = T.x - c.x, dz = T.z - c.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-4) { I.mx = 0; I.mz = 0; return d; }
    dx /= d; dz /= d;
    if (aim) { const cs = Math.cos(aim), sn = Math.sin(aim), x = dx * cs + dz * sn; dz = -dx * sn + dz * cs; dx = x; }
    const spr = !air && d > 2.6, sp = W.C.walk * (spr ? W.C.sprint : 1);
    const mag = air ? (d < 0.25 ? 0 : 1) : Math.min(1, d / 0.7, Math.sqrt(2 * W.C.decG * Math.max(0, d - 0.12)) / sp);
    I.mx = dx * mag; I.mz = dz * mag;
    if (!air) I.sp = spr;
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
    I.jh = false; I.sp = !!dI.sp; I.up = dI.up || 0; I.turn = dI.turn || 0; I.dn = false;
    while (t < maxT) {
      t += dt;
      setLocal(W, lm, t0 + t);
      I.jp = false;
      if (st === 0 && t > delayT) { st = 1; if (jump) I.jp = true; }
      if (st === 0) { I.mx = dI.mx; I.mz = dI.mz; }
      else if (st === 2 && wA.k !== 1 && !fol) { I.mx = 0; I.mz = 0; I.up = 0; I.turn = 0; }
      else steer(c, st === 2 ? wpPos(wB, W, TN) : wpPos(wA, W, TP), I, W, !c.gr, 0);
      stepChar(c, I, W, dt);
      if (c.dead) { res = -1; break; }
      if (!c.gr && !c.cl) { air = true; af += dt; if (leftT < 0 && af > 0.1) leftT = t - af; } else af = 0;
      if (st === 1) {
        const T = wpPos(wA, W, TP), hd = Math.hypot(c.x - T.x, c.z - T.z);
        const ok = wA.k === 2 ? !!(c.rope && c.rope.id === wA.rope) : wA.k ? (c.bnc && hd < 1.6) : (c.gr && (hd < wA.r || (jump && wA.col && c.gc === wA.col)) && Math.abs(c.y - T.y) < 0.6);
        if (ok && (!jump || air)) { if (!wB) { res = 1; break; } st = 2; after = 0; Ay = T.y; continue; }
        if (jump && air && c.gr) { res = 0; break; }
        const fl = Math.min(T.y, c0.y);
        if ((c.gr && c.y < fl - 2) || c.y < fl - 8) { res = 0; break; }
      } else if (st === 2) {
        after += dt;
        const T = wpPos(wB, W, TN), hd = Math.hypot(c.x - T.x, c.z - T.z);
        if (wA.k === 2) { if (!c.rope) { res = 0; break; } if (after > 0.3) { res = 1; break; } continue; }
        if (c.gr && (hd < wB.r || (wB.col && c.gc === wB.col)) && Math.abs(c.y - T.y) < 0.6) { res = 1; break; }
        if (wA.k === 1) { if ((c.gr && after > 0.1) || c.y < T.y - 8) { res = 0; break; } }
        else if (!c.gr && !c.cl && af > 0.1) { res = fol && after > 0.3 ? 1 : 0; break; }
        else if (after > (fol ? 1 : 0.55)) { res = 1; break; }
      }
    }
    setLocal(W, lm, t0);
    return { res, leftT, t, st };
  }
  function makeBot(c, sk, seed, name) { return { ropeX: 0, c, sk: BOT_SK[sk], lvl: sk, wi: 0, plan: null, tick: 0, hold: 0, wait: 0, R: rng(seed), I: { mx: 0, mz: 0, jp: false, jh: false, sp: false, up: 0, turn: 0, dn: false }, T: { x: 0, y: 0, z: 0 }, mode: 1, prog: 0, sup: null, lm: [], name, stuck: 0, lastY: 0, fin: false, aimE: 0 }; }
  function botReset(b) { b.wi = 0; b.plan = null; b.hold = 0; b.wait = 0; b.sup = null; b.stuck = 0; }
  function relocalize(b, wps) {
    const c = b.c;
    let best = -1, bs = 1e9;
    if (c.gc) for (let i = wps.length - 1; i >= 0; i--) if (wps[i].col === c.gc) { b.wi = Math.min(i + 1, wps.length - 1); return; }
    for (let i = 0; i < wps.length; i++) {
      const w = wps[i]; if ((w.m != null && w.m >= 0) || w.k === 2) continue;
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
    if (w.k === 2 ? !!(c.rope && c.rope.id === w.rope) : w.k ? (c.bnc && hd < 1.6) : (c.gr && hd < w.r && Math.abs(c.y - T.y) < 0.6)) {
      b.sup = w; b.wi++; b.plan = null; b.tick = 0; b.prog = t;
      if (sk.hes && b.R() < sk.hes * 0.5) b.wait = t + 0.2 + b.R() * 0.9;
      b.aimE = (b.R() * 2 - 1) * sk.aim;
      if (b.wi >= wps.length) { I.mx = I.mz = 0; return; }
      w = wps[b.wi]; T = wpPos(w, W, b.T);
    }
    if (c.gr && ((b.sup && c.y < wpPos(b.sup, W, TN).y - 2.5) || t - b.prog > 9)) { relocalize(b, wps); b.sup = null; b.plan = null; b.tick = 0; b.prog = t; w = wps[b.wi]; T = wpPos(w, W, b.T); }
    if (b.plan) { if (t >= b.plan.at) { I.jp = true; b.plan = null; b.tick = 0; steer(c, T, I, W, !c.gr, 0); return; } else if (c.gr || c.air < 0.2) return; else b.plan = null; }
    if (c.rope) {
      const r = c.rope, want = Math.atan2(T.x - r.x, T.z - r.z), da = wrapA(want - c.ra), hT = Math.min(r.y1, Math.max(r.y0 + 1.5, T.y + 2.6 + b.ropeX));
      I.mx = I.mz = 0; I.turn = Math.abs(da) > 0.05 ? Math.sign(da) : da / 0.05; I.up = c.rh < hT - 0.03 ? 1 : 0;
      if (Math.abs(da) < 0.08 && I.up === 0 && --b.tick <= 0) {
        b.tick = 4; localMovers(W, c.y, b.lm);
        const r1 = simRun(W, c, w, wps[b.wi + 1] || null, 0.01, IN0, true, 2.4, b.lm, 0);
        if (r1.res === 1) { I.jp = true; I.turn = 0; b.ropeX = 0; } else if (c.rh < r.y1 - 0.05) b.ropeX += 0.4; else b.ropeX = -0.6 - b.R() * 1.5;
      }
      return;
    }
    if (c.hk) { steer(c, T, I, W, false, 0); const l = Math.hypot(I.mx, I.mz) || 1; I.mx /= l; I.mz /= l; return; }
    if (!c.gr && !c.cl) { if (!I.jp) steer(c, T, I, W, true, b.aimE); return; }
    if (c.cl) { steer(c, T, I, W, false, 0); const l = Math.hypot(I.mx, I.mz) || 1; I.mx /= l; I.mz /= l; return; }
    if (I.jp) return;
    if (t < b.wait) { holdStill(b, W); return; }
    if (--b.tick <= 0) {
      b.tick = 4;
      const nx = wps[b.wi + 1] || null;
      localMovers(W, c.y, b.lm);
      const ws = simRun(W, c, w, nx, 0, I, false, 2.4 + Math.max(0, T.y - c.y) / W.C.climbV, b.lm);
      if (ws.res === 1) b.mode = 1;
      else {
        const react = sk.react[0] + b.R() * (sk.react[1] - sk.react[0]);
        const cT = Math.max(0, T.y - c.y) / W.C.climbV;
        const sure = (d, dI) => { let r = simRun(W, c, w, nx, d, dI, true, d + 2.2 + cT, b.lm, 0), f = 0; if (r.res === -1 && r.st === 2) { r = simRun(W, c, w, nx, d, dI, true, d + 2.2 + cT, b.lm, 1); f = 1; } if (r.res === 1 && (simRun(W, c, w, nx, d + 0.025, dI, true, d + 2.2 + cT, b.lm, f).res !== 1 || (d > 0.03 && simRun(W, c, w, nx, d - 0.015, dI, true, d + 2.2 + cT, b.lm, f).res !== 1))) r.res = 0; return r; };
        const js = sure(react, I);
        if (js.res === 1) { b.plan = { at: t + react + (b.R() * 2 - 1) * sk.jit }; return; }
        if (I.mx || I.mz) {
          const hs = sure(react, IN0);
          if (hs.res === 1) { I.mx = I.mz = 0; b.plan = { at: t + react + (b.R() * 2 - 1) * sk.jit }; return; }
        } else {
          steer(c, T, RUN, W, true, 0); RUN.sp = Math.hypot(T.x - c.x, T.z - c.z) > 1.4;
          const ru = 0.06 + b.R() * 0.06, rs = sure(ru, RUN);
          if (rs.res === 1) { I.mx = RUN.mx; I.mz = RUN.mz; b.plan = { at: t + ru + (b.R() * 2 - 1) * sk.jit }; return; }
        }
        b.mode = ws.res === -1 || (ws.leftT >= 0 && ws.leftT < (c.gc && c.gc.mv ? 0.3 : 0.16)) ? 0 : 1;
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
    if (b.sup && c.gc && c.gc.mv) { const S = wpPos(b.sup, W, TN), d = Math.hypot(S.x - c.x, S.z - c.z); if (d > 0.25) { steer(c, S, I, W, false, 0); I.sp = false; return; } }
    I.mx = 0; I.mz = 0; I.sp = false;
  }
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
  function canvasTex(THREE, w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
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
  function makeAudio(api) {
    let ctx = null, out = null, mus = null, wind = null, windG = null, noiseB = null, musicOn = false, nextT = 0, bar = 0, scene = 0, mood = 0;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.55; out.connect(ctx.destination);
        mus = ctx.createGain(); mus.gain.value = 0; mus.connect(out);
        noiseB = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = noiseB.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = b * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = b * 6; }
        wind = ctx.createBufferSource(); wind.buffer = noiseB; wind.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.6;
        windG = ctx.createGain(); windG.gain.value = 0; wind.connect(f); f.connect(windG); windG.connect(out); wind.start();
      } catch (e) { ctx = null; }
      return ctx;
    };
    const tone = (f0, f1, dur, type, vol, when = 0, dest = out, atk = 0.008) => {
      const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
    };
    const noise = (dur, vol, f, q = 1, when = 0, type = 'bandpass', f1 = 0) => {
      const t = ctx.currentTime + when, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    };
    const S = {
      step: () => noise(0.06, 0.05, 700 + Math.random() * 300, 1.2),
      jump: () => { noise(0.1, 0.05, 1200, 0.8, 0, 'bandpass', 2400); tone(240, 360, 0.08, 'sine', 0.03); },
      land: () => { noise(0.09, 0.12, 400, 0.8, 0, 'lowpass', 150); },
      thud: () => { tone(90, 40, 0.3, 'sine', 0.3); noise(0.25, 0.25, 300, 0.7, 0, 'lowpass', 90); },
      grab: () => { noise(0.07, 0.1, 1600, 1.4); tone(300, 220, 0.06, 'triangle', 0.04); },
      mantle: () => noise(0.25, 0.07, 900, 0.8, 0, 'bandpass', 500),
      rope: () => { noise(0.18, 0.08, 500, 2, 0, 'bandpass', 300); tone(160, 140, 0.2, 'triangle', 0.03); },
      bounce: () => { tone(200, 520, 0.3, 'sine', 0.12); noise(0.2, 0.06, 600, 0.8, 0, 'lowpass', 1600); },
      whoosh: () => noise(1.2, 0.08, 400, 0.5, 0, 'bandpass', 1500),
      scene: () => [0, 4, 7, 12].forEach((m, i) => tone(523 * Math.pow(2, m / 12), 0, 1.6, 'sine', 0.05, i * 0.18, out, 0.05)),
      win: () => { [0, 4, 7, 11, 12, 16, 19, 24].forEach((m, i) => tone(392 * Math.pow(2, m / 12), 0, 2.2, 'sine', 0.06, i * 0.16, out, 0.03)); },
      tap: () => tone(700, 900, 0.05, 'sine', 0.04),
      no: () => tone(220, 180, 0.15, 'triangle', 0.05)
    };
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    function sched() {
      if (!ctx) return;
      if (api.muted || !musicOn) { mus.gain.value = 0; return; }
      mus.gain.value = 0.2;
      const CH = SCENES[scene].chords, BAR = 4.8;
      if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.1;
      while (nextT < ctx.currentTime + 0.5) {
        const w = nextT - ctx.currentTime, ch = CH[bar % 4];
        ch.forEach((m, i) => { tone(mf(m), 0, BAR * 1.15, i ? 'sine' : 'triangle', i ? 0.05 : 0.07, w + i * 0.03, mus, 1.4); });
        tone(mf(ch[0] - 12), 0, BAR, 'sine', 0.09, w, mus, 0.8);
        const R = (bar * 7 + scene * 3) % 5;
        for (let k = 0; k < 3; k++) if ((bar + k + R) % 3 !== 1) { const m = ch[(k * 2 + bar) % ch.length] + 12 + (k === 2 ? 12 : 0); tone(mf(m), 0, 2.2, 'sine', 0.035, w + 0.6 + k * 1.3 + (R % 2) * 0.4, mus, 0.02); }
        nextT += BAR; bar++;
      }
    }
    api.interval(sched, 150);
    return {
      play(n) { if (api.muted) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { S[n](); } catch (e) {} },
      music(on) { musicOn = on && this.mOn !== false; if (on && !api.muted) { const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); } },
      scene(i) { scene = clamp(i, 0, SCENES.length - 1); },
      wind(v) { if (ctx && windG) windG.gain.setTargetAtTime(api.muted ? 0 : v, ctx.currentTime, 0.4); },
      close() { musicOn = false; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }
  function loadSave(s) {
    const o = { v: 1, best: 0, bestH: 0, climbs: 0, falls: 0, played: 0, sens: 1, inv: false, music: true, ghost: true, help: false, susp: null };
    if (!s || typeof s !== 'object' || Array.isArray(s)) return o;
    const fin = (v, a, b) => typeof v === 'number' && isFinite(v) && v >= a && v <= b;
    if (fin(s.best, 1, 360000)) o.best = Math.round(s.best * 100) / 100;
    if (fin(s.bestH, 0, 2000)) o.bestH = s.bestH;
    if (fin(s.climbs, 0, 1e6)) o.climbs = Math.floor(s.climbs);
    if (fin(s.falls, 0, 1e8)) o.falls = Math.floor(s.falls);
    if (fin(s.played, 0, 1e9)) o.played = s.played;
    if (fin(s.sens, 0.3, 3)) o.sens = s.sens;
    o.inv = s.inv === true; o.music = s.music !== false; o.ghost = s.ghost !== false; o.help = s.help === true;
    const u = s.susp;
    if (u && typeof u === 'object' && ['x', 'y', 'z', 't', 'f', 'a'].every(k => fin(u[k], -1e5, 1e6))) o.susp = { x: u.x, y: u.y, z: u.z, t: u.t, f: Math.floor(u.f), a: u.a };
    return o;
  }
  const fmtT = s => { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = Math.floor(s % 60); return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0'); };
  const GK = 'gameplay:wayup:ghost', RK = 'gameplay:wayup:rec';
  function encG(a) { let s = ''; const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return btoa(s); }
  function decG(s) { try { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); if (u.length % 8) return null; return new Int16Array(u.buffer); } catch (e) { return null; } }
  const CSS = `
${G} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#f2bd96;font-family:var(--sans);-webkit-user-select:none;user-select:none;color:#fff}
${G} .stage .g-canvas{border-radius:0;display:block;width:100%;height:100%;background:#f2bd96}
${G} [hidden]{display:none!important}
${G} .hud{position:absolute;inset:0;pointer-events:none;font-size:clamp(10px,1.6cqw,16px);text-shadow:0 .06em .3em rgba(0,0,0,.45)}
${G} .tm{position:absolute;left:2.4%;top:3%;font-weight:700;font-size:1.15em;letter-spacing:.04em;font-variant-numeric:tabular-nums;opacity:.92}
${G} .tm small{display:block;font-size:.65em;font-weight:600;opacity:.75;letter-spacing:.12em}
${G} .ht{position:absolute;left:2.4%;bottom:4%;font-weight:800;font-size:2.1em;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
${G} .ht span{font-size:.45em;font-weight:700;opacity:.8;margin-left:.2em}
${G} .ht small{display:block;font-size:.36em;font-weight:600;opacity:.75;letter-spacing:.1em}
${G} .pg{position:absolute;right:2.2%;top:14%;bottom:14%;width:.32em;border-radius:.3em;background:rgba(255,255,255,.28)}
${G} .pg i{position:absolute;left:-.25em;right:-.25em;height:1px;background:rgba(255,255,255,.6)}
${G} .pg b{position:absolute;left:50%;width:.9em;height:.9em;margin:0 0 -.45em -.45em;border-radius:50%;background:#ff4a4a;border:2px solid #fff}
${G} .pg u{position:absolute;left:50%;width:.7em;height:.7em;margin:0 0 -.35em -.35em;border-radius:50%;background:rgba(160,220,255,.9);border:2px solid rgba(255,255,255,.7)}
${G} .pg em{position:absolute;left:-1.9em;width:4em;height:2px;margin-bottom:-1px;background:rgba(255,230,120,.8)}
${G} .card{position:absolute;left:50%;top:18%;transform:translateX(-50%);text-align:center;opacity:0;transition:opacity 1.2s;white-space:nowrap}
${G} .card.on{opacity:1}
${G} .card small{display:block;font-weight:700;font-size:.85em;letter-spacing:.3em;opacity:.85}
${G} .card b{display:block;font-weight:800;font-size:2.6em;letter-spacing:.02em;margin:.1em 0}
${G} .card span{font-size:.95em;opacity:.85}
${G} .tipb{position:absolute;left:50%;bottom:6%;transform:translateX(-50%);padding:.35em .9em;border-radius:.6em;background:rgba(10,10,30,.45);font-size:.9em;font-weight:600;opacity:0;transition:opacity .4s;white-space:nowrap}
${G} .tipb.on{opacity:1}
${G} .pzb{all:unset;cursor:pointer;pointer-events:auto;position:absolute;right:1.6%;top:2.6%;width:2.4em;height:2.4em;border-radius:.6em;background:rgba(10,10,30,.35);display:grid;place-items:center;font-weight:900}
${G} .joy{position:absolute;width:7em;height:7em;margin:-3.5em 0 0 -3.5em;border-radius:50%;background:rgba(255,255,255,.14);border:.15em solid rgba(255,255,255,.35);pointer-events:none}
${G} .joy i{position:absolute;left:50%;top:50%;width:3em;height:3em;margin:-1.5em;border-radius:50%;background:rgba(255,255,255,.55)}
${G} .tb{position:absolute;border-radius:50%;background:rgba(255,255,255,.2);border:.18em solid rgba(255,255,255,.5);pointer-events:auto;display:grid;place-items:center;font-weight:800;font-size:.85em}
${G} .tb.on{background:rgba(255,255,255,.45)}
${G} .tb.j{right:5%;bottom:12%;width:5.4em;height:5.4em}
${G} .tb.s{right:20%;bottom:7%;width:3.8em;height:3.8em}
${G} .tb.d{right:6%;bottom:33%;width:3.4em;height:3.4em}
${G} .scr{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;font-size:clamp(11px,1.6cqw,16px)}
${G} .pan{pointer-events:auto;width:min(92%,30em);max-height:92%;overflow:auto;box-sizing:border-box;padding:1.3em 1.5em;border-radius:1.1em;background:rgba(18,16,36,.78);backdrop-filter:blur(6px);box-shadow:0 1em 3em rgba(0,0,0,.35);color:#f4f0ff;text-shadow:none}
${G} .pan h2{margin:0 0 .3em;font-size:1.5em;font-weight:800}
${G} .pan h3{margin:.9em 0 .3em;font-size:.78em;letter-spacing:.16em;color:#ffb4a0;font-weight:800}
${G} .pan p{margin:.35em 0;line-height:1.45;color:#ddd6ee}
${G} .logo{font-size:3.6em;font-weight:900;line-height:.9;letter-spacing:-.02em;margin:0 0 .1em;color:#fff;text-shadow:0 .05em 0 #c43a3a,0 .1em .4em rgba(0,0,0,.35)}
${G} .logo i{display:inline-block;width:.42em;height:.5em;border-radius:50% 50% 48% 48%;background:radial-gradient(circle at 35% 30%,#ff9a9a,#e8302e 55%,#a01818);margin-left:.08em;vertical-align:.32em;position:relative}
${G} .row{display:flex;flex-wrap:wrap;gap:.5em;align-items:center;margin:.4em 0}
${G} .btn{all:unset;box-sizing:border-box;cursor:pointer;padding:.62em 1.15em;border-radius:.7em;background:rgba(255,255,255,.12);font-weight:800;text-align:center;color:#fff;transition:filter .12s,transform .12s,background .12s}
${G} .btn:hover{background:rgba(255,255,255,.2)}
${G} .btn:active{transform:scale(.97)}
${G} .btn:focus-visible{outline:2px solid #ffd0a0;outline-offset:2px}
${G} .btn.go{background:linear-gradient(#ff6a5a,#e0302e);font-size:1.15em;padding:.7em 1.6em;box-shadow:0 .18em 0 #8a1a1a}
${G} .btn.sm{padding:.42em .8em;font-size:.88em}
${G} .btn.warn{background:#8a2a3a}
${G} .stat{display:grid;grid-template-columns:1fr auto;gap:.3em 1em;margin:.5em 0}
${G} .stat b{text-align:right;font-variant-numeric:tabular-nums}
${G} .kbd{display:inline-block;min-width:1.3em;padding:0 .35em;border-radius:.3em;background:rgba(255,255,255,.16);font-weight:800;text-align:center;font-size:.9em}
${G} .tip{font-size:.85em;color:#c8bfe0}
${G} .seg2{display:inline-flex;border-radius:.65em;overflow:hidden;background:rgba(255,255,255,.1)}
${G} .seg2 button{all:unset;cursor:pointer;padding:.45em .8em;font-weight:800;font-size:.88em;color:#cfc6e6}
${G} .seg2 button.on{background:#ff6a5a;color:#fff}
${G} .lbl{min-width:6em;font-weight:800;color:#ffb4a0;font-size:.85em}
`;
  const LOOK = {
    dumpster: ['m', '#2f6a4a'], crate: ['w', '#b8844a'], landing: ['m', '#6a6f7a'], roof: ['k', '#9a5a4a'], ac: ['m', '#c8ccd2'], tank: ['m', '#8a9aa8'], plank: ['w', '#c09060'], chimney: ['k', '#a0503c'], mattress: ['f', '#e8e0f0'], billboard: ['p', '#f2c230'], rail: ['m', '#4a4f5a'], antenna: ['m', '#9aa0aa'], watertower: ['w', '#8a5a3a'], chimneystack: ['k', '#8a4030'], stairs: ['m', '#3a4048'],
    car: ['p', '#c8302e'], carramp: ['p', '#6a8ac8'], container: ['m', '#c8502e'], cube: ['m', '#7a6a5a'], magnet: ['m', '#d0302e'], cab: ['m', '#f2c230'], cranearm: ['m', '#f2b020'], tire: ['p', '#2a2a2e'], tirebounce: ['p', '#3a3a40'],
    pipe: ['m', '#5aa0a0'], valve: ['m', '#c8402e'], pipetop: ['m', '#4a8a90'], steam: ['p', '#e0f0f0'], tankbox: ['m', '#6aa08a'], grate: ['m', '#5a6a6a'], wheel: ['m', '#c8402e'],
    cookie: ['p', '#d8a060'], melon: ['p', '#e84a5a'], melontop: ['p', '#3aa05a'], fork: ['m', '#d8dce4'], cup: ['p', '#f4f4f4'], jelly: ['p', '#ff6ab0'], cake: ['p', '#f8e0c8'], sugar: ['p', '#ffffff'], cherry: ['p', '#d8202e'], chocbar: ['p', '#6a3a20'], pretzel: ['p', '#b8783a'], donut: ['p', '#f0a0c0'], pancake: ['p', '#e8b870'], plate: ['p', '#f4f4f8'],
    book: ['b', '#c8402e'], openbook: ['b', '#f4ecd8'], pencil: ['p', '#f2c230'], shelf: ['w', '#7a4a2a'], inkpot: ['p', '#2a2a5a'], bookstack: ['b', '#a04a3a'], flybook: ['b', '#2e6ac8'], pillow: ['f', '#f4e0e8'],
    step: ['s', '#f4f0e8'], arch: ['s', '#ece6da'], archtop: ['s', '#f4f0e8'], altar: ['s', '#e8e0d0'], terrace: ['s', '#f4f0e8'], templetower: ['s', '#e8e2d6'], column: ['s', '#f6f2ea'], sundial: ['s', '#e0d8c8'], cloud: ['f', '#ffffff'],
    lantern: ['l', '#ff7a3a'], bridge: ['w', '#8a5a3a'], cord: ['p', '#f2e0a0'], kite: ['b', '#e8402e'], pagoda: ['w', '#a0302e'], pagodatower: ['w', '#7a2a20'], drum: ['f', '#c8402e'], lotus: ['p', '#ff8ac0'],
    rock: ['r', '#6a6a80'], panel: ['m', '#2a4ab8'], satellite: ['m', '#c8ccd8'], crystal: ['l', '#7af0ff'], ring: ['m', '#c8c0ff'], drift: ['r', '#5a5a70'], starbridge: ['l', '#ffe07a'], moon: ['r', '#e8e4d0'], ladder: ['m', '#7a7f8a'], street: ['p', '#5a5a62']
  };
  const VARY = { car: ['#c8302e', '#2e6ac8', '#e8c030', '#3a9a5a', '#e8e8e8'], container: ['#c8502e', '#2e7ac8', '#3a9a5a', '#e8a030'], book: ['#c8402e', '#2e6ac8', '#3a8a5a', '#e8a030', '#7a4ab8'], lantern: ['#ff7a3a', '#ff5a5a', '#ffb03a'], crate: ['#b8844a', '#a8743a', '#c8945a'] };
  const ROPEC = { rope: '#c8b08a', cable: '#3a3a40', vine: '#3a8a3a', licorice: '#c8202e', bookmark: '#c8302e', bellrope: '#c8a060', string: '#f2e0a0', tether: '#e0e0f0' };
  function texSet(THREE) {
    const T = {};
    const mk = (k, f) => { T[k] = canvasTex(THREE, 128, 128, f, true); };
    const noiseFill = (g, w, h, base, amp, seed) => { const R = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { const v = (R() * 2 - 1) * amp; g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; g.fillRect(R() * w, R() * h, 3, 3); } };
    mk('p', (g, w, h) => { noiseFill(g, w, h, '#f0f0f0', 0.05, 1); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2); });
    mk('w', (g, w, h) => { noiseFill(g, w, h, '#e8e0d4', 0.06, 2); g.fillStyle = 'rgba(80,50,20,.25)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 3); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(90,60,30,.12)'; g.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 1.5); } });
    mk('m', (g, w, h) => { noiseFill(g, w, h, '#e6e8ec', 0.04, 3); g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,255,255,.22)'; for (let x = 5; x < w; x += 16) g.fillRect(x, 0, 2, h); });
    mk('k', (g, w, h) => { g.fillStyle = '#ece4e0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(60,40,30,.35)'; for (let y = 0; y < h; y += 16) { g.fillRect(0, y, w, 2); for (let x = (y / 16) % 2 ? 0 : 16; x < w; x += 32) g.fillRect(x, y, 2, 16); } });
    mk('f', (g, w, h) => { noiseFill(g, w, h, '#f6f4f8', 0.03, 4); g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i < w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
    mk('b', (g, w, h) => { g.fillStyle = '#f4f0e8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 4; y < h; y += 6) g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, w, 10); });
    mk('s', (g, w, h) => { noiseFill(g, w, h, '#f8f6f2', 0.025, 6); g.strokeStyle = 'rgba(120,110,100,.18)'; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { g.beginPath(); let x = Math.random() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (Math.random() * 2 - 1) * 14; y += 12; g.lineTo(x, y); } g.stroke(); } g.strokeStyle = 'rgba(0,0,0,.1)'; g.strokeRect(1, 1, w - 2, h - 2); });
    mk('r', (g, w, h) => { noiseFill(g, w, h, '#dcdce4', 0.12, 7); const R = rng(8); for (let i = 0; i < 12; i++) { const x = R() * w, y = R() * h, r = 4 + R() * 10; g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.arc(x - 1, y - 1, r * 0.7, 0, TAU); g.fill(); } });
    mk('l', (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff6e0'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,40,0,.2)'; for (let y = 0; y < h; y += 22) g.fillRect(0, y, w, 3); });
    mk('win', (g, w, h) => { g.fillStyle = '#7a8090'; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 32) for (let x = 8; x < w; x += 32) { g.fillStyle = Math.random() < 0.35 ? '#ffe9a8' : '#2e3646'; g.fillRect(x, y, 16, 18); } });
    return T;
  }
  function run(root, wrap, api, V) {
    const { THREE, renderer, canvas } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    canvas.style.width = '100%'; wrap.append(canvas);
    fitPR(api, V);
    renderer.toneMappingExposure = 1.05;
    const bin = [], own = x => (bin.push(x), x);
    const col = h => new THREE.Color(h).convertSRGBToLinear();
    const audio = makeAudio(api), keys = api.keys;
    const P = loadSave(api.load());
    audio.mOn = P.music;
    let saveT = 0;
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => api.save(P), 300); };
    const LV = buildClimb();
    const W = makeWorld(LV.parts, CFG); W.ropes = LV.ropes;
    prepWps(LV.wps, W);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf2bd96, 40, 340);
    const cam = new THREE.PerspectiveCamera(66, V.w / V.h, 0.08, 2400);
    const skyG = own(new THREE.SphereGeometry(2000, 24, 14)), skyC = [];
    for (let i = 0; i < skyG.attributes.position.count; i++) skyC.push(1, 1, 1);
    skyG.setAttribute('color', new THREE.Float32BufferAttribute(skyC, 3));
    const sky = new THREE.Mesh(skyG, own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
    sky.renderOrder = -2; scene.add(sky);
    const starG = own(new THREE.BufferGeometry()), sp = [];
    { const R = rng(11); for (let i = 0; i < 900; i++) { const u = R() * 2 - 1, a = R() * TAU, r = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * r * 1800, Math.abs(u) * 1800 - 200, Math.sin(a) * r * 1800); } }
    starG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const starM = own(new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    const stars = new THREE.Points(starG, starM); stars.renderOrder = -1; scene.add(stars);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 0.65); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.95);
    sun.castShadow = true; sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 });
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    scene.add(sun); scene.add(sun.target);
    const SUNV = new THREE.Vector3(-30, 52, 22).normalize();
    const TX = texSet(THREE); Object.values(TX).forEach(own);
    const mats = {};
    const matOf = k => mats[k] || (mats[k] = own(k === 'l' ? new THREE.MeshLambertMaterial({ map: TX.l, vertexColors: true, emissive: 0xffffff, emissiveIntensity: 0.55, emissiveMap: TX.l }) : new THREE.MeshLambertMaterial({ map: TX[k], vertexColors: true })));
    const buckets = new Map(), tmpC = new THREE.Color();
    const bucket = (k, si) => { const key = k + ':' + si; if (!buckets.has(key)) buckets.set(key, merger()); return buckets.get(key); };
    const vc = {};
    const colFor = prop => { const v = VARY[prop]; if (v) { vc[prop] = (vc[prop] || 0) + 1; return v[vc[prop] % v.length]; } return (LOOK[prop] || ['p', '#ccc'])[1]; };
    const RX90 = { m: new Float64Array(9) }; setRot(RX90, 0, Math.PI / 2, 0);
    const moverMeshes = [];
    const deco = (c, p, si) => {
      const lk = LOOK[p.prop] || ['p', '#cccccc'], k = lk[0];
      if (p.prop === 'car') { const m = bucket('p', si); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const lx = sx * (c.hx + 0.02), lz = sz * c.hz * 0.6, ly = -c.hy + 0.2; m.add(cylFaces(0.32, 0.12, 1, 12), mulRot(c.m, RZ90), c.x + c.m[0] * lx + c.m[1] * ly + c.m[2] * lz, c.y + c.m[3] * lx + c.m[4] * ly + c.m[5] * lz, c.z + c.m[6] * lx + c.m[7] * ly + c.m[8] * lz, tmpC.copy(col('#1e1e22'))); }); const ly = c.hy + 0.28; m.add(boxFaces(c.hx * 0.86, 0.28, c.hz * 0.45, 1), c.m, c.x + c.m[1] * ly, c.y + c.m[4] * ly, c.z + c.m[7] * ly, tmpC.copy(col('#2a3442'))); }
      if (p.prop === 'cookie') { const m = bucket('p', si), R = rng(c.id * 7 + 1); for (let i = 0; i < 6; i++) { const a = R() * TAU, r = R() * c.hx * 0.75; m.add(boxFaces(0.12, 0.05, 0.12, 1), c.m, c.x + Math.cos(a) * r, c.y + c.hy + 0.03, c.z + Math.sin(a) * r, tmpC.copy(col('#4a2a14'))); } }
      if (p.prop === 'melon') { const m = bucket('p', si); m.add(boxFaces(c.hx + 0.02, c.hy * 0.5, c.hz + 0.02, 1), c.m, c.x - c.m[1] * c.hy * 0.6, c.y - c.m[4] * c.hy * 0.6, c.z - c.m[7] * c.hy * 0.6, tmpC.copy(col('#3a9a4a'))); }
      if (p.prop === 'book' || p.prop === 'flybook' || p.prop === 'bookstack') { const m = bucket('b', si); m.add(boxFaces(c.hx * 0.96, c.hy * 0.8, c.hz + 0.01, 1), c.m, c.x + c.m[0] * 0.05, c.y, c.z + c.m[6] * 0.05, tmpC.copy(col('#f4eedc'))); }
      if (p.prop === 'lantern') { const m = bucket('m', si); for (const s of [1, -1]) m.add(cylFaces(c.hx * 0.75, 0.06, 1, 16), ID9, c.x, c.y + s * (c.hy + 0.04), c.z, tmpC.copy(col('#3a2a20'))); }
      if (p.prop === 'column') { const m = bucket('s', si); m.add(boxFaces(c.hx * 1.15, 0.12, c.hx * 1.15, 1), c.m, c.x, c.y + c.hy - 0.1, c.z, tmpC.copy(col('#fbf8f2'))); }
    };
    const RZ90 = new Float64Array(9); { const q = { m: RZ90 }; setRot(q, 0, 0, Math.PI / 2); }
    function mulRot(a, b) { const o = new Float64Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]; return o; }
    W.cols.forEach(c => {
      const p = c.part; if (p.kind === 'goal') return;
      const lk = LOOK[p.prop] || ['p', '#cccccc'];
      let f, m = c.m;
      if (p.cylz) { f = cylFaces(c.hx, c.hz, 1, 16); m = mulRot(c.m, RX90.m); }
      else if (c.t === 1) f = cylFaces(c.hx, c.hy, 1, 24);
      else f = boxFaces(c.hx, c.hy, c.hz, p.kind === 'ground' ? 4 : 1);
      tmpC.copy(col(p.kind === 'ground' ? '#5a5a62' : colFor(p.prop)));
      if (p.climb) { const g = bucket('m', p.sc), lc = tmpC.copy(col('#8a8f9a')); for (const sx of [-1, 1]) g.add(boxFaces(0.05, c.hy, 0.05, 1), c.m, c.x + c.m[0] * sx * 0.42, c.y, c.z + c.m[6] * sx * 0.42, lc); for (let y = -c.hy + 0.2; y < c.hy; y += 0.35) g.add(boxFaces(0.42, 0.025, 0.025, 1), c.m, c.x + c.m[1] * y, c.y + c.m[4] * y, c.z + c.m[7] * y, lc); return; }
      if (c.mv) {
        const mm = merger(); mm.add(f, m === c.m ? ID9 : mulRot(ID9, RX90.m), 0, 0, 0, tmpC);
        const g = own(mm.geo(THREE)), mesh = new THREE.Mesh(g, matOf(lk[0])); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); moverMeshes.push({ c, mesh }); return;
      }
      bucket(p.kind === 'ground' ? 'p' : lk[0], p.sc).add(f, m, c.x, c.y, c.z, tmpC);
      deco(c, p, p.sc);
    });
    LV.ropes.forEach(r => { const b = bucket('p', r.sc); tmpC.copy(col(ROPEC[r.prop] || '#c8b08a')); const h = (r.y1 + 1.0 - (r.y0 - 0.5)) / 2; b.add(cylFaces(0.045, h, 1, 8), ID9, r.x, r.y0 - 0.5 + h, r.z, tmpC); b.add(boxFaces(0.5, 0.12, 0.5, 1), ID9, r.x, r.y1 + 1.05, r.z, tmpC.copy(col('#5a4a3a'))); for (let y = r.y0 - 0.4; y < r.y1; y += 0.9) b.add(cylFaces(0.07, 0.05, 1, 8), ID9, r.x, y, r.z, tmpC.copy(col(ROPEC[r.prop] || '#c8b08a')).multiplyScalar(0.8)); });
    const sceneMeshes = SCENES.map(() => []);
    buckets.forEach((m, key) => { const [k, si] = key.split(':'); const g = own(m.geo(THREE)), mesh = new THREE.Mesh(g, matOf(k)); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); sceneMeshes[+si].push(mesh); });
    {
      const city = merger(), R = rng(21), cc = new THREE.Color();
      for (let i = 0; i < 160; i++) { const a = R() * TAU, d = 75 + R() * 260, w = 8 + R() * 14, h = 8 + R() * 46 * (d < 140 ? 0.5 : 1); city.add(boxFaces(w / 2, h / 2, w / 2 * (0.7 + R() * 0.6), 6), ID9, Math.cos(a) * d, h / 2, Math.sin(a) * d, cc.copy(col(['#9aa0b0', '#b0a49a', '#8a92a8', '#a8988a'][(R() * 4) | 0]))); }
      const g = own(city.geo(THREE)), mesh = new THREE.Mesh(g, own(new THREE.MeshLambertMaterial({ map: TX.win, vertexColors: true }))); scene.add(mesh);
      const hills = own(new THREE.ConeGeometry(1, 1, 7)), hm = own(new THREE.MeshLambertMaterial({ color: col('#8a9ab8'), flatShading: true }));
      for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, d = 700 + R() * 300, s = 120 + R() * 160, m = new THREE.Mesh(hills, hm); m.scale.set(s * 1.8, s * (0.6 + R() * 0.6), s * 1.8); m.position.set(Math.cos(a) * d, m.scale.y / 2 - 2, Math.sin(a) * d); scene.add(m); }
      const gp = new THREE.Mesh(own(new THREE.CircleGeometry(1400, 40)), own(new THREE.MeshLambertMaterial({ color: col('#6a7a5a') }))); gp.rotation.x = -Math.PI / 2; gp.position.y = -1.01; scene.add(gp);
    }
    const cloudT = own(canvasTex(THREE, 128, 64, (g) => { for (let i = 0; i < 14; i++) { const x = 20 + Math.random() * 88, y = 22 + Math.random() * 22, r = 12 + Math.random() * 16, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }));
    const cloudM = own(new THREE.SpriteMaterial({ map: cloudT, transparent: true, depthWrite: false, opacity: 0.6 }));
    const clouds = [];
    { const R = rng(31); for (const ly of [62, 128, 196]) for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(cloudM), a = R() * TAU, d = 70 + R() * 320, sc = 30 + R() * 60; s.position.set(Math.cos(a) * d, ly + (R() * 2 - 1) * 6, Math.sin(a) * d); s.scale.set(sc * 2, sc * 0.8, 1); s.userData.v = 0.4 + R() * 0.8; scene.add(s); clouds.push(s); } }
    const balloon = new THREE.Group();
    { const b = new THREE.Mesh(own(new THREE.SphereGeometry(0.9, 24, 18)), own(new THREE.MeshPhongMaterial({ color: col('#e8302e'), shininess: 80, specular: 0x664444 }))); b.scale.set(1, 1.15, 1); b.position.y = 2.6; balloon.add(b); const k = new THREE.Mesh(own(new THREE.ConeGeometry(0.16, 0.22, 10)), b.material); k.position.y = 1.55; k.rotation.x = Math.PI; balloon.add(k); const s = new THREE.Mesh(own(new THREE.CylinderGeometry(0.012, 0.012, 1.6, 4)), own(new THREE.MeshBasicMaterial({ color: 0xffffff }))); s.position.y = 0.7; balloon.add(s); }
    balloon.position.set(LV.goal.x, LV.goal.y, LV.goal.z); scene.add(balloon);
    const goalLight = new THREE.PointLight(0xff8a6a, 1.2, 30); goalLight.position.set(LV.goal.x, LV.goal.y + 3, LV.goal.z); scene.add(goalLight);

    function mkMika(ghost) {
      const g = new THREE.Group(), ms = [];
      const M = c => { const m = ghost ? null : new THREE.MeshLambertMaterial({ color: col(c) }); if (m) ms.push(m); return m || ghostM; };
      const coat = M('#f5c330'), skin = M('#f2c49a'), pants = M('#2f3a56'), hair = M('#4a2c1e'), scarf = M('#d8302e'), shoe = M('#f4f4f4'), pack = M('#3a8a5a'), eye = M('#1a1a22');
      const add = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !ghost; (par || g).add(m); return m; };
      const body = new THREE.Group(); body.position.y = 0.92; g.add(body);
      add(MG.torso, coat, 0, 0.36, 0, body); add(MG.pack, pack, 0, 0.38, -0.2, body);
      add(MG.scarf, scarf, 0, 0.7, 0, body).rotation.x = Math.PI / 2;
      const tail = add(MG.tail, scarf, 0.08, 0.6, -0.16, body); tail.rotation.z = 0.2;
      const head = new THREE.Group(); head.position.y = 0.86; body.add(head);
      add(MG.head, skin, 0, 0, 0, head); add(MG.hair, hair, 0, 0.03, -0.015, head); add(MG.bob, hair, 0, -0.06, -0.06, head);
      add(MG.eye, eye, -0.06, 0.01, 0.15, head); add(MG.eye, eye, 0.06, 0.01, 0.15, head);
      const limb = (x, y, up, low, mu, ml, foot) => { const a = new THREE.Group(); a.position.set(x, y, 0); body.add(a); add(up, mu, 0, -0.16, 0, a); const b = new THREE.Group(); b.position.y = -0.32; a.add(b); add(low, ml, 0, -0.15, 0, b); if (foot) add(MG.shoe, shoe, 0, -0.32, 0.05, b); return [a, b]; };
      const [la, lfa] = limb(-0.24, 0.62, MG.arm, MG.arm, coat, skin), [ra, rfa] = limb(0.24, 0.62, MG.arm, MG.arm, coat, skin);
      const [ll, lsh] = limb(-0.1, 0.02, MG.leg, MG.leg, pants, pants, 1), [rl, rsh] = limb(0.1, 0.02, MG.leg, MG.leg, pants, pants, 1);
      scene.add(g);
      return { g, body, head, la, lfa, ra, rfa, ll, lsh, rl, rsh, tail, ph: 0, sq: 0, ms, dispose() { scene.remove(g); ms.forEach(m => m.dispose()); } };
    }
    const MG = { torso: own(new THREE.CylinderGeometry(0.2, 0.27, 0.66, 12)), pack: own(new THREE.BoxGeometry(0.3, 0.36, 0.14)), scarf: own(new THREE.TorusGeometry(0.15, 0.05, 6, 14)), tail: own(new THREE.BoxGeometry(0.08, 0.26, 0.04)), head: own(new THREE.SphereGeometry(0.17, 16, 12)), hair: own(new THREE.SphereGeometry(0.182, 16, 10, 0, TAU, 0, Math.PI * 0.55)), bob: own(new THREE.CylinderGeometry(0.17, 0.19, 0.16, 14, 1, true)), eye: own(new THREE.SphereGeometry(0.022, 6, 5)), arm: own(new THREE.CylinderGeometry(0.055, 0.05, 0.32, 8)), leg: own(new THREE.CylinderGeometry(0.075, 0.065, 0.34, 8)), shoe: own(new THREE.BoxGeometry(0.12, 0.08, 0.2)) };
    const ghostM = own(new THREE.MeshBasicMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.32, depthWrite: false }));
    function animMika(a, c, dt, spd, fly) {
      const air = !c.gr && !c.cl && !c.hk && !c.rope;
      a.ph += spd * dt * 2.6;
      const k = Math.min(1, dt * 14), run = Math.min(1, spd / 6.6), s = Math.sin(a.ph);
      let la = 0, ra = 0, lfa = -0.2, rfa = -0.2, ll = 0, rl = 0, lsh = 0, rsh = 0, tilt = 0, bob = 0;
      if (c.hk) { la = ra = Math.PI - 0.15; lfa = rfa = 0; ll = 0.1; rl = -0.05; lsh = rsh = 0.1; if (c.hup > 0) { la = ra = 2.2; ll = 1.1; lsh = 1.2; } }
      else if (c.rope) { const q = Math.sin(c.rh * 4); la = 2.7 + q * 0.3; ra = 2.7 - q * 0.3; lfa = rfa = -0.3; ll = 0.4 + q * 0.3; rl = 0.4 - q * 0.3; lsh = rsh = 0.6; }
      else if (c.cl) { const q = Math.sin(c.y * 5); la = 2.4 + q * 0.4; ra = 2.4 - q * 0.4; ll = 0.6 + q * 0.4; rl = 0.6 - q * 0.4; lsh = rsh = 0.8; }
      else if (air) { if (fly > 0.6) { la = 2.6 + Math.sin(a.ph * 3) * 0.3; ra = 2.6 - Math.sin(a.ph * 3) * 0.3; ll = 0.3; rl = -0.2; lsh = rsh = 0.4; } else { la = -0.9; ra = 0.6; ll = 0.9; lsh = 1.4; rl = -0.3; rsh = 0.3; lfa = rfa = -0.6; } }
      else { la = s * 0.9 * run; ra = -s * 0.9 * run; lfa = rfa = -0.3 - run * 0.8; ll = -s * 0.9 * run; rl = s * 0.9 * run; lsh = Math.max(0, Math.sin(a.ph - 1.2)) * 1.3 * run; rsh = Math.max(0, Math.sin(a.ph + Math.PI - 1.2)) * 1.3 * run; tilt = run * 0.18; bob = Math.abs(Math.cos(a.ph)) * 0.05 * run; }
      const set = (o, v) => { o.rotation.x += (-v - o.rotation.x) * k; };
      set(a.la, la); set(a.ra, ra); set(a.lfa, lfa); set(a.rfa, rfa); set(a.ll, -ll); set(a.rl, -rl);
      a.lsh.rotation.x += (lsh - a.lsh.rotation.x) * k; a.rsh.rotation.x += (rsh - a.rsh.rotation.x) * k;
      a.body.rotation.x += (tilt - a.body.rotation.x) * k;
      a.sq = Math.max(0, a.sq - dt * 4);
      a.body.position.y = 0.92 + bob - a.sq * 0.12; a.body.scale.y = 1 - a.sq * 0.12;
      a.tail.rotation.x = Math.sin(a.ph * 0.5 + performance.now() / 400) * 0.25 - (air ? 0.6 : 0.1 * run);
    }
    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.append(e); return e; };
    const hud = el('div', 'hud', wrap); hud.setAttribute('data-i18n', '');
    const tmEl = el('div', 'tm', hud, '<b>0:00</b><small></small>'), tmB = tmEl.firstChild, tmS = tmEl.lastChild;
    const htEl = el('div', 'ht', hud, '<b>0</b><span>m</span><small></small>'), htB = htEl.firstChild, htS = htEl.lastChild;
    const pgEl = el('div', 'pg', hud);
    const cardEl = el('div', 'card', hud), tipEl = el('div', 'tipb', hud);
    const pzBtn = el('button', 'pzb', hud, 'II'); pzBtn.setAttribute('aria-label', 'Pause');
    const joyEl = el('div', 'joy', hud, '<i></i>'); joyEl.hidden = true; const knob = joyEl.firstChild;
    const jB = el('div', 'tb j', hud, 'JUMP'), sB = el('div', 'tb s', hud, 'RUN'), dB = el('div', 'tb d', hud, 'DROP');
    [jB, sB, dB].forEach(b => { b.hidden = !COARSE; });
    const scr = el('div', 'scr', wrap); scr.setAttribute('data-i18n', '');
    const H = LV.top + 3;
    pgEl.innerHTML = LV.scenes.map(s => `<i style="bottom:${(s.y0 / H * 100).toFixed(1)}%"></i>`).join('') + '<em hidden></em><u hidden></u><b></b>';
    const pgMe = pgEl.querySelector('b'), pgGh = pgEl.querySelector('u'), pgBest = pgEl.querySelector('em');
    const hudOn = on => { hud.hidden = !on; };
    hudOn(false);

    const START = { x: -3, y: 0.02, z: -16, a: Math.PI / 2 };
    let phase = 'menu', paused = false, practice = false, ck = null, runT = 0, falls = 0, acc = 0, simT = 0, lastScene = -1, maxH = 0, endT = 0, tipT = 0, tipShown = {};
    const me = { c: newChar(START.x, START.y, START.z), prev: { x: 0, y: 0, z: 0 }, av: mkMika(false) };
    me.c.face = START.a;
    let ghost = null, gAv = null, rec = [], recT = 0, auto = null;
    const camS = { yaw: START.a + Math.PI, pitch: 0.24, dist: 4.8, cd: 4.8, tx: START.x, ty: 1.5, tz: START.z };
    function loadGhost() { ghost = null; try { const s = localStorage.getItem(GK); if (s) { const g = decG(s); if (g && g.length >= 8) ghost = g; } } catch (e) {} }
    loadGhost();
    function place(x, y, z, a) { Object.assign(me.c, newChar(x, y, z)); me.c.face = a; me.prev.x = x; me.prev.y = y; me.prev.z = z; camS.yaw = a + Math.PI; camS.tx = x; camS.ty = y + 1.5; camS.tz = z; camS.cd = camS.dist; }
    function startClimb(mode) {
      practice = mode === 'practice';
      const cont = mode === 'continue' && P.susp;
      if (cont) { const u = P.susp; place(u.x, u.y, u.z, u.a); runT = u.t; falls = u.f; rec = []; try { const s = localStorage.getItem(RK); const g = s && decG(s); if (g) rec = Array.from(g); } catch (e) {} }
      else { place(START.x, START.y, START.z, START.a); runT = 0; falls = 0; rec = []; if (!practice) { P.susp = null; persist(); try { localStorage.removeItem(RK); } catch (e) {} } }
      ck = practice ? { x: START.x, y: START.y, z: START.z, a: START.a, s: 0 } : null;
      recT = 0; maxH = me.c.y; lastScene = -1; acc = 0;
      auto = (() => { try { return localStorage.getItem('gameplay:wayup:auto') === '1'; } catch (e) { return false; } })() ? makeBot(me.c, 3, 5, 'me') : null;
      phase = 'play'; paused = false; hideScr(); hudOn(true);
      if (gAv) { gAv.dispose(); gAv = null; }
      if (ghost && P.ghost && !practice) gAv = mkMika(true);
      pgGh.hidden = !gAv;
      pgBest.hidden = !P.bestH; pgBest.style.bottom = (clamp(P.bestH, 0, H) / H * 100).toFixed(1) + '%';
      tmS.textContent = practice ? tr('Practice') : '';
      audio.music(true);
      if (!P.help) showTip(tr(COARSE ? 'Drag on the right to look around. RUN to sprint.' : 'Click the game to steer the camera with the mouse. Shift to sprint.'), 6);
    }
    function suspend() {
      if (phase !== 'play' || practice) return;
      const c = me.c;
      if (!c.gr) return;
      P.susp = { x: Math.round(c.x * 100) / 100, y: Math.round(c.y * 100) / 100, z: Math.round(c.z * 100) / 100, t: Math.round(runT * 10) / 10, f: falls, a: Math.round(c.face * 100) / 100 };
      api.save(P);
      try { localStorage.setItem(RK, encG(Int16Array.from(rec))); } catch (e) {}
    }
    function showTip(t, s) { tipEl.textContent = t; tipEl.classList.add('on'); tipT = s; }
    function sceneOf(y) { for (let i = LV.scenes.length - 1; i >= 0; i--) if (y >= LV.scenes[i].y0 - 0.5) return i; return 0; }
    const inp = { mx: 0, mz: 0, jp: false, jh: false, sp: false, up: 0, turn: 0, dn: false };
    let jumpQ = false, joyV = { x: 0, y: 0 }, touchRun = false, dropQ = false;
    function myInput() {
      let kx = 0, kz = 0;
      const live = phase === 'play' && !paused;
      if (live) {
        if (keys.has('KeyW') || keys.has('ArrowUp')) kz += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) kz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
      }
      const tx = kx + (live ? joyV.x : 0), tz = kz - (live ? joyV.y : 0);
      let mx = tx, mz = tz; const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
      const fx = -Math.sin(camS.yaw), fz = -Math.cos(camS.yaw);
      inp.mx = fx * mz - fz * mx; inp.mz = fz * mz + fx * mx;
      inp.jp = jumpQ && live; jumpQ = false;
      inp.sp = live && (keys.has('ShiftLeft') || keys.has('ShiftRight') || touchRun);
      inp.up = clamp(tz, -1, 1); inp.turn = clamp(-tx, -1, 1);
      inp.dn = live && (dropQ || keys.has('ControlLeft') || keys.has('KeyC')); dropQ = false;
    }
    function stepSim(dt) {
      acc += dt;
      let n = 0;
      while (acc >= CFG.dt && n < 10) {
        acc -= CFG.dt; n++;
        simT += CFG.dt; W.t = simT; setTime(W, simT);
        const c = me.c;
        me.prev.x = c.x; me.prev.y = c.y; me.prev.z = c.z;
        if (phase !== 'play') continue;
        myInput();
        const hkWas = !!c.hk;
        if (auto && !c.fin) { botThink(auto, W, LV.wps, simT); stepChar(c, auto.I, W, CFG.dt); } else stepChar(c, inp, W, CFG.dt);
        if (!paused) runT += CFG.dt;
        events(c, hkWas);
        recT += CFG.dt;
        if (recT >= 0.2 && !practice) { recT -= 0.2; if (rec.length < 8 * 15000) rec.push(Math.round(c.x * 10), Math.round(c.y * 10), Math.round(c.z * 10), Math.round(wrapA(c.face) * 5000), (c.gr ? 1 : 0) | (c.rope ? 2 : 0) | (c.hk ? 4 : 0) | (c.cl ? 8 : 0), Math.round(Math.hypot(c.vx, c.vz) * 100), Math.round(c.vy * 100), 0); }
      }
      if (acc > CFG.dt * 4) acc = 0;
    }
    let stepD = 0;
    function events(c, hkWas) {
      if (c.ev & 1) audio.play('jump');
      if (c.ev & 4) { audio.play('bounce'); me.av.sq = 0.6; }
      if (c.ev & 32) audio.play('grab');
      if (c.ev & 128) audio.play('mantle');
      if (c.ev & 64) audio.play('rope');
      if (c.ev & 2) {
        const d = c.drop;
        if (d > 7) { audio.play('thud'); me.av.sq = 1; if (!practice) { falls++; P.falls++; persist(); } showTip(tf('Fell {n} m', { n: Math.round(d) }), 2); }
        else if (c.land > 4) { audio.play('land'); me.av.sq = Math.min(1, c.land / 12); }
      }
      if (c.gr && Math.hypot(c.vx, c.vz) > 1) { stepD += Math.hypot(c.vx, c.vz) * CFG.dt; if (stepD > (c.spr ? 0.75 : 0.55)) { stepD = 0; audio.play('step'); } }
      if (c.y > maxH) maxH = c.y;
      if (!c.gr && c.vy < -16 && !c.wh) { c.wh = 1; audio.play('whoosh'); } else if (c.gr) c.wh = 0;
      const s = sceneOf(c.y);
      if (c.gr && s > lastScene) {
        if (lastScene >= 0 || s > 0) { const S = SCENES[s]; cardEl.innerHTML = `<small>${s + 1} / ${SCENES.length}</small><b>${esc(tr(S.n))}</b><span>${esc(tr(S.sub))}</span>`; cardEl.classList.add('on'); clearTimeout(cardEl.t); cardEl.t = setTimeout(() => cardEl.classList.remove('on'), 3200); audio.play('scene'); }
        lastScene = s; audio.scene(s);
        if (practice && (!ck || s > ck.s)) ck = { x: c.x, y: c.y, z: c.z, a: c.face, s };
      } else if (c.gr && s < lastScene) { lastScene = s; audio.scene(s); }
      if (practice && ck && c.gr && c.y < ck.y - 5) { place(ck.x, ck.y + 0.02, ck.z, ck.a); showTip(tr('Back to the checkpoint'), 2); }
      if (c.fin && phase === 'play') finish();
    }
    function finish() {
      phase = 'end'; endT = 0;
      const t = runT, newBest = !practice && (!P.best || t < P.best);
      if (!practice) {
        P.climbs++; if (newBest) P.best = Math.round(t * 100) / 100; P.bestH = Math.max(P.bestH, LV.top); P.susp = null; persist();
        api.submit(Math.round(t)); api.score(Math.round(t));
        if (newBest && rec.length) { try { localStorage.setItem(GK, encG(Int16Array.from(rec))); } catch (e) {} loadGhost(); }
        try { localStorage.removeItem(RK); } catch (e) {}
      }
      audio.play('win');
      api.timeout(() => {
        panel(`<div class="pan"><h2>${esc(tr('You caught the balloon!'))}</h2><p>${esc(tr(practice ? 'Practice climb finished. Practice times are not saved.' : 'Mika made it to the top of the sky.'))}</p><div class="stat"><span>${esc(tr('Time'))}</span><b>${fmtT(t)}</b><span>${esc(tr('Falls'))}</span><b>${falls}</b><span>${esc(tr('Best time'))}</span><b>${P.best ? fmtT(P.best) : '—'}</b></div>${newBest ? `<p><b>${esc(tr('New best time! Your ghost will climb with you next time.'))}</b></p>` : ''}<div class="row" style="margin-top:.6em"><button class="btn go" data-a="new">${esc(tr('Climb again'))}</button><button class="btn" data-a="menu">${esc(tr('Menu'))}</button></div></div>`);
      }, 2600);
    }
    function gameOverHeight() { if (!practice && maxH > P.bestH) { P.bestH = Math.round(maxH * 10) / 10; persist(); } }
    function maybeSaveHighGhost() { if (practice || P.best || !rec.length) return; try { const s = localStorage.getItem(GK + ':h'); const h = s ? +s : 0; if (maxH > h + 1) { localStorage.setItem(GK, encG(Int16Array.from(rec))); localStorage.setItem(GK + ':h', String(Math.round(maxH))); loadGhost(); } } catch (e) {} }

    const TMP = new THREE.Vector3();
    function camRay(ox, oy, oz, dx, dy, dz, maxT) {
      let best = maxT;
      const n = query(W, ox + dx * maxT / 2, Math.min(oy, oy + dy * maxT) - 1, Math.max(oy, oy + dy * maxT) + 1, oz + dz * maxT / 2, maxT / 2 + 1);
      for (let i = 0; i < n; i++) {
        const c = W.cand[i]; if (c.fin || c.climb) continue;
        const m = c.m, rx = ox - c.x, ry = oy - c.y, rz = oz - c.z;
        const lo = [m[0] * rx + m[3] * ry + m[6] * rz, m[1] * rx + m[4] * ry + m[7] * rz, m[2] * rx + m[5] * ry + m[8] * rz], ld = [m[0] * dx + m[3] * dy + m[6] * dz, m[1] * dx + m[4] * dy + m[7] * dz, m[2] * dx + m[5] * dy + m[8] * dz], hh = [c.hx, c.hy, c.t === 1 ? c.hx : c.hz];
        let t0 = 0, t1 = best, ok = true;
        for (let a = 0; a < 3; a++) { if (Math.abs(ld[a]) < 1e-9) { if (lo[a] < -hh[a] || lo[a] > hh[a]) { ok = false; break; } continue; } let p = (-hh[a] - lo[a]) / ld[a], q = (hh[a] - lo[a]) / ld[a]; if (p > q) { const s = p; p = q; q = s; } if (p > t0) t0 = p; if (q < t1) t1 = q; if (t0 > t1) { ok = false; break; } }
        if (ok && t0 > 0.15 && t0 < best) best = t0;
      }
      return best;
    }
    function updateCam(dt, alpha) {
      const c = me.c, x = lerp(me.prev.x, c.x, alpha), y = lerp(me.prev.y, c.y, alpha), z = lerp(me.prev.z, c.z, alpha);
      const fall = !c.gr && c.vy < -10;
      const k = 1 - Math.exp(-dt * 16), ky = 1 - Math.exp(-dt * (fall ? 4 : 10));
      camS.tx += (x - camS.tx) * (Math.abs(x - camS.tx) > 20 ? 1 : k); camS.tz += (z - camS.tz) * (Math.abs(z - camS.tz) > 20 ? 1 : k);
      const ty = y + 1.45; camS.ty += (ty - camS.ty) * (Math.abs(ty - camS.ty) > 20 ? 1 : ky);
      const cp = Math.cos(camS.pitch), dx = Math.sin(camS.yaw) * cp, dy = Math.sin(camS.pitch), dz = Math.cos(camS.yaw) * cp;
      const want = Math.max(0.6, camRay(camS.tx, camS.ty, camS.tz, dx, dy, dz, camS.dist) - 0.25);
      camS.cd = want < camS.cd ? want : camS.cd + (want - camS.cd) * (1 - Math.exp(-dt * 3));
      cam.position.set(camS.tx + dx * camS.cd, camS.ty + dy * camS.cd, camS.tz + dz * camS.cd);
      TMP.set(camS.tx, camS.ty, camS.tz); cam.lookAt(TMP);
      const near = camS.cd < 0.9; me.av.g.visible = !near;
    }
    let menuT = 0;
    function menuCam(dt) {
      menuT += dt;
      const a = menuT * 0.05, r = 26, h = 20 + Math.sin(menuT * 0.04) * 10;
      cam.position.set(START.x + Math.cos(a) * r, h, START.z + Math.sin(a) * r);
      TMP.set(0, h + 10, -10); cam.lookAt(TMP);
    }
    const c1 = new THREE.Color(), c2 = new THREE.Color(), cf = new THREE.Color(), hs = new THREE.Color(), hg = new THREE.Color();
    function atmosphere(y) {
      const sc = LV.scenes;
      let i = 0; for (let k = sc.length - 1; k >= 0; k--) if (y >= sc[k].y0) { i = k; break; }
      const S0 = SCENES[i], S1 = SCENES[Math.min(i + 1, SCENES.length - 1)], y0 = sc[i].y0, y1 = sc[i].y1;
      const t = clamp((y - (y1 - 8)) / 10, 0, 1);
      c1.set(S0.sky[0]).lerp(c2.set(S1.sky[0]), t); const top = c1.clone();
      c1.set(S0.sky[1]).lerp(c2.set(S1.sky[1]), t); const bot = c1.clone();
      cf.set(S0.fog).lerp(c2.set(S1.fog), t);
      const p = skyG.attributes.position, cc = skyG.attributes.color;
      for (let k = 0; k < p.count; k++) { const v = clamp(p.getY(k) / 2000 * 1.6 + 0.25, 0, 1); c2.copy(bot).lerp(top, v); cc.setXYZ(k, c2.r, c2.g, c2.b); }
      cc.needsUpdate = true;
      scene.fog.color.copy(cf); renderer.setClearColor(cf);
      hs.set(S0.hemi[0]).lerp(c2.set(S1.hemi[0]), t); hg.set(S0.hemi[1]).lerp(c2.set(S1.hemi[1]), t);
      hemi.color.copy(hs); hemi.groundColor.copy(hg);
      sun.color.set(S0.sun).lerp(c2.set(S1.sun), t);
      const night = clamp((y - LV.scenes[6].y0 + 10) / 30, 0, 1);
      starM.opacity = night; sun.intensity = 0.95 - night * 0.45; hemi.intensity = 0.65 - night * 0.15;
      scene.fog.near = 70 + night * 40; scene.fog.far = 560 + night * 300;
    }
    let atmoY = -999, gIdx = 0;
    function render(dt) {
      const alpha = clamp(acc / CFG.dt, 0, 1), c = me.c;
      for (const { c: k, mesh } of moverMeshes) { moverPose(k, simT + alpha * CFG.dt, PO); mesh.position.set(PO.x, PO.y, PO.z); mesh.rotation.set(PO.pitch, PO.yaw, PO.roll, 'YXZ'); }
      const a = me.av;
      a.g.position.set(lerp(me.prev.x, c.x, alpha), lerp(me.prev.y, c.y, alpha), lerp(me.prev.z, c.z, alpha));
      a.g.rotation.y += wrapA(c.face - a.g.rotation.y) * Math.min(1, dt * 18);
      animMika(a, c, dt, c.gr ? Math.hypot(c.vx, c.vz) : 0, c.vy < -9 ? 1 : 0);
      if (gAv && ghost) {
        const n = ghost.length / 8, f = runT / 0.2, i = Math.min(n - 2, Math.floor(f));
        if (i >= 0 && f < n) {
          const q = clamp(f - i, 0, 1), o = i * 8, o2 = o + 8;
          gAv.g.visible = true;
          gAv.g.position.set(lerp(ghost[o], ghost[o2], q) / 10, lerp(ghost[o + 1], ghost[o2 + 1], q) / 10, lerp(ghost[o + 2], ghost[o2 + 2], q) / 10);
          gAv.g.rotation.y = ghost[o] !== undefined ? ghost[o + 3] / 5000 : 0;
          const fl = ghost[o + 4];
          animMika(gAv, { gr: !!(fl & 1), rope: fl & 2 ? 1 : null, hk: fl & 4 ? 1 : null, cl: !!(fl & 8), vy: ghost[o + 6] / 100, rh: gAv.g.position.y, hup: 0, y: gAv.g.position.y }, dt, (fl & 1) ? ghost[o + 5] / 100 : 0, ghost[o + 6] < -900 ? 1 : 0);
          pgGh.style.bottom = (clamp(gAv.g.position.y, 0, H) / H * 100).toFixed(1) + '%';
        } else gAv.g.visible = false;
      }
      if (phase === 'play' || phase === 'end') updateCam(dt, alpha); else menuCam(dt);
      const ay = phase === 'menu' ? 20 : c.y;
      if (Math.abs(ay - atmoY) > 0.5) { atmoY = ay; atmosphere(ay); }
      sun.position.set(camS.tx + SUNV.x * 50, camS.ty + SUNV.y * 50, camS.tz + SUNV.z * 50); sun.target.position.set(camS.tx, camS.ty - 2, camS.tz);
      sky.position.copy(cam.position); stars.position.copy(cam.position);
      balloon.position.y = LV.goal.y + Math.sin(simT * 1.3) * 0.25; balloon.rotation.y = simT * 0.3;
      for (const s of clouds) { s.position.x += s.userData.v * dt; if (s.position.x > 340) s.position.x = -340; }
      audio.wind(phase === 'play' ? clamp(c.y / 260, 0, 1) * 0.05 + (!c.gr && c.vy < -8 ? 0.06 : 0) : 0);
      renderer.render(scene, cam);
      if (phase === 'play') hudTick();
      if (tipT > 0) { tipT -= dt; if (tipT <= 0) tipEl.classList.remove('on'); }
    }
    let hn = 0;
    function hudTick() {
      const c = me.c;
      tmB.textContent = fmtT(runT);
      if (++hn % 4) return;
      htB.textContent = Math.max(0, Math.round(c.y));
      htS.textContent = P.bestH ? tf('Best {n} m', { n: Math.round(P.bestH) }) : '';
      pgMe.style.bottom = (clamp(c.y, 0, H) / H * 100).toFixed(1) + '%';
    }

    function panel(html) { scr.innerHTML = html; scr.style.pointerEvents = 'auto'; const b = scr.querySelector('.btn.go'); if (b && !COARSE) try { b.focus({ preventScroll: true }); } catch (e) {} }
    function hideScr() { scr.innerHTML = ''; scr.style.pointerEvents = 'none'; }
    function showMenu() {
      if (phase === 'play') { suspend(); gameOverHeight(); maybeSaveHighGhost(); }
      phase = 'menu'; paused = false; hudOn(false); unlock(); audio.music(false);
      if (gAv) { gAv.dispose(); gAv = null; }
      const s = P.susp;
      panel(`<div class="pan"><div class="logo">WAY UP<i></i></div><p>${esc(tr('Mika lost her red balloon. Follow it up, past the roofs, the junk, the clouds and the stars. There are no checkpoints: if you fall, you fall.'))}</p>
        <div class="row" style="margin-top:.8em">${s ? `<button class="btn go" data-a="cont">${esc(tr('Continue'))}</button><button class="btn" data-a="newq">${esc(tr('New climb'))}</button>` : `<button class="btn go" data-a="new">${esc(tr('Start climbing'))}</button>`}<button class="btn" data-a="prac">${esc(tr('Practice'))}</button></div>
        ${s ? `<p class="tip">${esc(tf('Saved climb: {h} m · {t}', { h: Math.round(s.y), t: fmtT(s.t) }))}</p>` : ''}
        <div class="row"><span class="lbl">${esc(tr('Ghost'))}</span><div class="seg2" data-k="ghost"><button data-v="1" class="${P.ghost ? 'on' : ''}">${esc(tr('On'))}</button><button data-v="0" class="${P.ghost ? '' : 'on'}">${esc(tr('Off'))}</button></div><span class="tip">${esc(tr(ghost ? 'Your best climb runs beside you.' : 'Finish a climb to race your ghost.'))}</span></div>
        <div class="row"><button class="btn sm" data-a="stats">${esc(tr('Stats'))}</button><button class="btn sm" data-a="help">${esc(tr('How to play'))}</button></div></div>`);
    }
    function showStats() {
      panel(`<div class="pan"><h2>${esc(tr('Stats'))}</h2><div class="stat"><span>${esc(tr('Best time'))}</span><b>${P.best ? fmtT(P.best) : '—'}</b><span>${esc(tr('Highest point'))}</span><b>${Math.round(P.bestH)} m</b><span>${esc(tr('Climbs finished'))}</span><b>${P.climbs}</b><span>${esc(tr('Falls'))}</span><b>${P.falls}</b><span>${esc(tr('Height of the climb'))}</span><b>${Math.round(LV.top)} m</b></div><div class="row"><button class="btn go" data-a="menu">${esc(tr('Back'))}</button></div></div>`);
    }
    function showHelp(back) {
      panel(`<div class="pan"><h2>${esc(tr('How to play'))}</h2>
        <p>${esc(tr('Climb to the red balloon at the top of the sky. A fall drops you onto whatever is below, sometimes a long way down.'))}</p>
        <h3>${esc(tr('CONTROLS'))}</h3>
        <p><span class="kbd">W</span> <span class="kbd">A</span> <span class="kbd">S</span> <span class="kbd">D</span> ${esc(tr('or arrows to move, Shift to sprint, Space to jump. A sprint jump goes much further.'))}</p>
        <p>${esc(tr('Click the game to steer the camera with the mouse, or drag. Wheel to zoom. Esc pauses.'))}</p>
        <p>${esc(tr('Jump at a ledge to grab it, then W or Space climbs up and S or Ctrl lets go. A and D move along the ledge.'))}</p>
        <p>${esc(tr('Jump at a rope to hold it. W and S climb, A and D turn around it, Space jumps off the way you face.'))}</p>
        <p>${esc(tr('Walk into ladders to climb them. Soft pads bounce you up. Slopes that are too steep make you slide.'))}</p>
        <p>${esc(tr('Practice puts a checkpoint at the start of every area. Practice times are not saved.'))}</p>
        <div class="row"><button class="btn go" data-a="${back}">${esc(tr('Back'))}</button></div></div>`);
    }
    function setPause(on) {
      if (on && phase !== 'play') return;
      paused = on; unlock();
      if (on) {
        panel(`<div class="pan"><h2>${esc(tr('Paused'))}</h2><p>${esc(tr(SCENES[sceneOf(me.c.y)].n))} · ${Math.round(me.c.y)} m · ${fmtT(runT)}</p>
          <div class="row"><button class="btn go" data-a="res">${esc(tr('Resume'))}</button>${practice ? `<button class="btn" data-a="ck">${esc(tr('Back to the checkpoint'))}</button>` : ''}</div>
          <div class="row"><button class="btn sm" data-a="music">${esc(tr(P.music ? 'Music: on' : 'Music: off'))}</button><button class="btn sm" data-a="inv">${esc(tr(P.inv ? 'Invert camera: on' : 'Invert camera: off'))}</button><button class="btn sm" data-a="help2">${esc(tr('How to play'))}</button></div>
          <div class="row"><span class="lbl">${esc(tr('Camera'))}</span><div class="seg2" data-k="sens">${['Slow', 'Normal', 'Fast'].map((o, i) => `<button data-v="${i}" class="${(P.sens < 0.8 ? 0 : P.sens > 1.3 ? 2 : 1) === i ? 'on' : ''}">${esc(tr(o))}</button>`).join('')}</div></div>
          <div class="row" style="margin-top:.4em"><button class="btn" data-a="menu">${esc(tr(practice ? 'Leave practice' : 'Save and quit'))}</button>${practice ? '' : `<button class="btn warn" data-a="restartq">${esc(tr('Restart from the bottom'))}</button>`}</div></div>`);
      } else hideScr();
    }
    api.on(scr, 'click', e => {
      const sg = e.target.closest('.seg2 button');
      if (sg) { const k = sg.parentElement.dataset.k, v = +sg.dataset.v; audio.play('tap'); if (k === 'ghost') P.ghost = !!v; else if (k === 'sens') P.sens = [0.6, 1, 1.6][v]; persist(); sg.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sg)); return; }
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a; audio.play('tap');
      if (a === 'new') startClimb('new');
      else if (a === 'cont') startClimb('continue');
      else if (a === 'prac') startClimb('practice');
      else if (a === 'newq') panel(`<div class="pan"><h2>${esc(tr('Start a new climb?'))}</h2><p>${esc(tr('Your saved climb will be lost.'))}</p><div class="row"><button class="btn warn" data-a="new">${esc(tr('Start from the bottom'))}</button><button class="btn go" data-a="menu">${esc(tr('Keep it'))}</button></div></div>`);
      else if (a === 'restartq') panel(`<div class="pan"><h2>${esc(tr('Restart from the bottom?'))}</h2><p>${esc(tr('Your climb so far will be lost.'))}</p><div class="row"><button class="btn warn" data-a="restart">${esc(tr('Restart'))}</button><button class="btn go" data-a="pause">${esc(tr('Keep climbing'))}</button></div></div>`);
      else if (a === 'restart') { gameOverHeight(); maybeSaveHighGhost(); P.susp = null; persist(); startClimb('new'); }
      else if (a === 'pause') setPause(true);
      else if (a === 'stats') showStats();
      else if (a === 'help') showHelp('menu');
      else if (a === 'help2') showHelp('pause');
      else if (a === 'menu') showMenu();
      else if (a === 'res') setPause(false);
      else if (a === 'ck') { setPause(false); if (ck) place(ck.x, ck.y + 0.02, ck.z, ck.a); }
      else if (a === 'music') { P.music = !P.music; audio.mOn = P.music; audio.music(true); persist(); setPause(true); }
      else if (a === 'inv') { P.inv = !P.inv; persist(); setPause(true); }
    });
    api.on(pzBtn, 'click', e => { e.stopPropagation(); setPause(!paused); });
    let locked = false;
    const unlock = () => { if (locked) { try { document.exitPointerLock(); } catch (err) {} } };
    api.on(document, 'pointerlockchange', () => { const was = locked; locked = document.pointerLockElement === canvas; if (was && !locked && phase === 'play' && !paused) setPause(true); });
    const rotCam = (dx, dy) => { camS.yaw -= dx * P.sens; camS.pitch = clamp(camS.pitch + dy * P.sens * (P.inv ? -1 : 1), -0.9, 1.3); };
    api.on(document, 'mousemove', e => { if (locked && phase === 'play' && !paused) rotCam((e.movementX || 0) * 0.0028, (e.movementY || 0) * 0.0022); });
    let joyId = null, camId = null, jx0 = 0, jy0 = 0, lx = 0, ly = 0, moved = 0;
    const scaleOf = () => { const r = wrap.getBoundingClientRect(); return { r, s: r.width / (wrap.offsetWidth || r.width) }; };
    api.on(wrap, 'contextmenu', e => e.preventDefault());
    api.on(wrap, 'pointerdown', e => {
      audio.music(phase === 'play');
      if (e.target.closest('.pan') || e.target.closest('button') || e.target.closest('.tb')) return;
      if (phase !== 'play' || paused) return;
      const { r, s } = scaleOf(), fx = (e.clientX - r.left) / r.width;
      if (e.pointerType === 'touch') [jB, sB, dB].forEach(b => { b.hidden = false; });
      if (e.pointerType !== 'mouse' && fx < 0.45 && joyId === null) { joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY; joyEl.style.left = (e.clientX - r.left) / s + 'px'; joyEl.style.top = (e.clientY - r.top) / s + 'px'; joyEl.hidden = false; knob.style.transform = ''; }
      else if (camId === null) { camId = e.pointerId; lx = e.clientX; ly = e.clientY; moved = 0; }
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(wrap, 'pointermove', e => {
      if (e.pointerId === joyId) { const { s } = scaleOf(); let dx = (e.clientX - jx0) / s, dy = (e.clientY - jy0) / s; const m = Math.hypot(dx, dy), R0 = 48; if (m > R0) { dx *= R0 / m; dy *= R0 / m; } joyV.x = dx / R0; joyV.y = dy / R0; knob.style.transform = `translate(${dx}px,${dy}px)`; }
      else if (e.pointerId === camId && !locked) { const k = e.pointerType === 'mouse' ? 0.005 : 0.008; moved += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly); rotCam((e.clientX - lx) * k, (e.clientY - ly) * k * 0.8); lx = e.clientX; ly = e.clientY; }
    });
    const endPtr = e => {
      if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; joyEl.hidden = true; }
      if (e.pointerId === camId) { camId = null; if (e.pointerType === 'mouse' && moved < 6 && phase === 'play' && !paused && !locked && e.type === 'pointerup') { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {} } }
    };
    api.on(wrap, 'pointerup', endPtr); api.on(wrap, 'pointercancel', endPtr);
    api.on(wrap, 'wheel', e => { if (phase !== 'play' || paused || e.target.closest('.pan')) return; e.preventDefault(); camS.dist = clamp(camS.dist * Math.exp(e.deltaY * 0.001), 2.2, 10); }, { passive: false });
    const tbtn = (b, down, up) => { api.on(b, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('on'); down(); }); for (const t of ['pointerup', 'pointercancel', 'pointerleave']) api.on(b, t, () => { b.classList.remove('on'); if (up) up(); }); };
    tbtn(jB, () => { jumpQ = true; }); tbtn(sB, () => { touchRun = !touchRun; sB.classList.toggle('lock', touchRun); sB.style.background = touchRun ? 'rgba(255,120,100,.55)' : ''; }); tbtn(dB, () => { dropQ = true; });
    api.on(window, 'blur', () => { joyV.x = joyV.y = 0; });
    api.on(window, 'keydown', e => {
      audio.music(phase === 'play');
      const c = e.code;
      if (c === 'Tab' || e.metaKey || e.altKey || (e.ctrlKey && c !== 'ControlLeft')) return;
      if (phase !== 'play') { if ((c === 'Enter' || c === 'Space') && scr.querySelector('.btn.go') && document.activeElement !== scr.querySelector('.btn.go')) { e.preventDefault(); scr.querySelector('.btn.go').click(); } return; }
      if (paused) { if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(false); } return; }
      if (c === 'Escape' || c === 'KeyP') { e.preventDefault(); setPause(true); return; }
      if (c === 'Space' || c.startsWith('Arrow')) e.preventDefault();
      if (e.repeat) return;
      if (c === 'Space') jumpQ = true;
      else if (c === 'KeyR' && practice && ck) place(ck.x, ck.y + 0.02, ck.z, ck.a);
    });
    api.on(document, 'visibilitychange', () => { if (document.hidden && phase === 'play' && !paused) { setPause(true); suspend(); } });
    api.loop(dt => {
      if (phase === 'play' && !paused) stepSim(dt);
      else if (phase === 'end') { endT += dt; stepSim(dt); camS.yaw += dt * 0.25; }
      else { simT += dt; W.t = simT; setTime(W, simT); }
      if (phase === 'play' && !paused && !practice) { P.played += dt; }
      render(dt);
    });
    api.interval(() => { if (phase === 'play' && !paused) suspend(); }, 20000);
    showMenu();
    return () => {
      clearTimeout(saveT);
      if (phase === 'play') { suspend(); gameOverHeight(); maybeSaveHighGhost(); }
      api.save(P);
      audio.close(); me.av.dispose(); if (gAv) gAv.dispose();
      bin.forEach(x => { try { x.dispose(); } catch (e) {} });
      Object.values(mats).forEach(m => m.dispose());
    };
  }

  Ameplay.register({
    id: ID, title: 'Way Up', category: '3D', tint: '#e8302e',
    blurb: 'One long climb into the sky after a red balloon. Rooftops, scrap, giant snacks, floating books and stars. No checkpoints: every fall costs you.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> jump · jump at ledges and ropes to grab · <kbd>S</kbd>/<kbd>Ctrl</kbd> let go · click to steer the camera with the mouse · <kbd>Esc</kbd> pause · touch: stick, JUMP, RUN, drag to look',
    better: 'low', width: 960, ownPause: true,
    format: v => fmtT(v),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="40" cy="16" rx="9" ry="11"/><path d="M40 27c-2 8 4 12-2 20"/><path d="M8 56h12v-8h10v-8h10"/></svg>',
    css: CSS,
    lab: { CFG, SCENES, buildClimb, makeWorld, setTime, stepChar, newChar, makeBot, botThink, botReset, prepWps, simRun, wpPos, SIMC, IN0, loadSave },
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'stage'; wrap.setAttribute('data-i18n', ''); root.append(wrap);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();
