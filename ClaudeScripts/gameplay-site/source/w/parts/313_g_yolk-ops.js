(() => {
  'use strict';
  const TAU = Math.PI * 2, STEP = 1 / 60, TPS = 60;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const mkRng = s => () => {
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const T = (s, o) => { const v = window.gpI18n && gpI18n.t ? gpI18n.t(s, o) : s; return o && v === s ? s.replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : v; };
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function compileMap(MD) {
    const M = { key: MD.key, def: MD, solids: [], deco: [], cyl: [], spawns: [], zones: [], pickups: [], props: [], x0: 1e9, z0: 1e9, x1: -1e9, z1: -1e9, top: 0 };
    const B = {
      box(cx, y, cz, sx, sy, sz, m, o) {
        o = o || {};
        const s = { t: 0, x0: cx - sx / 2, y0: y, z0: cz - sz / 2, x1: cx + sx / 2, y1: y + sy, z1: cz + sz / 2, m, c: o.c, ns: !!o.ns, uv: o.uv || 1, glow: !!o.glow, nb: !!o.nb };
        if (o.nc) M.deco.push(s); else M.solids.push(s);
        return s;
      },
      ramp(cx, cz, sx, sz, ya, yb, dir, m, o) {
        o = o || {};
        const s = { t: 1, x0: cx - sx / 2, y0: Math.min(ya, yb, o.base == null ? Math.min(ya, yb) : o.base), z0: cz - sz / 2, x1: cx + sx / 2, y1: Math.max(ya, yb), z1: cz + sz / 2, ya: Math.min(ya, yb), yb: Math.max(ya, yb), dir, m, c: o.c, ns: !!o.ns, uv: o.uv || 1 };
        if (o.base != null) s.y0 = o.base;
        M.solids.push(s);
        return s;
      },
      cyl(cx, y, cz, r, h, m, o) {
        o = o || {};
        const c = { x: cx, y, z: cz, r, h, m, c: o.c, seg: o.seg || 12, r2: o.r2 == null ? r : o.r2, ns: !!o.ns, cap: o.cap !== false };
        M.cyl.push(c);
        if (!o.nc) { const k = r * 0.82; M.solids.push({ t: 0, x0: cx - k, y0: y, z0: cz - k, x1: cx + k, y1: y + h, z1: cz + k, m, inv: 1 }); }
        return c;
      },
      prop(kind, x, y, z, a, o) { M.props.push({ kind, x, y, z, a: a || 0, o: o || {} }); },
      spawn(x, y, z, team, yaw) { M.spawns.push({ x, y, z, team: team == null ? -1 : team, yaw: yaw == null ? null : yaw }); },
      zone(x, y, z, r, name) { M.zones.push({ x, y, z, r, name: name || '' }); },
      pickup(x, y, z, k) { M.pickups.push({ x, y, z, k }); }
    };
    MD.build(B);
    for (const s of M.solids) { if (s.inv) continue; M.x0 = Math.min(M.x0, s.x0); M.z0 = Math.min(M.z0, s.z0); M.x1 = Math.max(M.x1, s.x1); M.z1 = Math.max(M.z1, s.z1); M.top = Math.max(M.top, s.y1); }
    M.floorY = MD.floor == null ? 0 : MD.floor;
    M.killY = MD.killY == null ? -12 : MD.killY;
    const cs = 4, gx0 = M.x0 - 1, gz0 = M.z0 - 1, nx = Math.ceil((M.x1 - gx0 + 2) / cs), nz = Math.ceil((M.z1 - gz0 + 2) / cs);
    const cells = Array.from({ length: nx * nz }, () => []);
    M.solids.forEach((s, i) => {
      const a = clamp(Math.floor((s.x0 - gx0) / cs), 0, nx - 1), b = clamp(Math.floor((s.x1 - gx0) / cs), 0, nx - 1), c = clamp(Math.floor((s.z0 - gz0) / cs), 0, nz - 1), d = clamp(Math.floor((s.z1 - gz0) / cs), 0, nz - 1);
      for (let ix = a; ix <= b; ix++) for (let iz = c; iz <= d; iz++) cells[ix + iz * nx].push(i);
    });
    const stamp = new Uint32Array(M.solids.length), out = [];
    let sn = 1;
    M.query = (xa, za, xb, zb) => {
      out.length = 0; sn++;
      if (sn > 4e9) { sn = 1; stamp.fill(0); }
      const a = clamp(Math.floor((Math.min(xa, xb) - gx0) / cs), 0, nx - 1), b = clamp(Math.floor((Math.max(xa, xb) - gx0) / cs), 0, nx - 1), c = clamp(Math.floor((Math.min(za, zb) - gz0) / cs), 0, nz - 1), d = clamp(Math.floor((Math.max(za, zb) - gz0) / cs), 0, nz - 1);
      for (let ix = a; ix <= b; ix++) for (let iz = c; iz <= d; iz++) { const L = cells[ix + iz * nx]; for (let k = 0; k < L.length; k++) { const i = L[k]; if (stamp[i] !== sn) { stamp[i] = sn; out.push(i); } } }
      return out;
    };
    return M;
  }

  function rampH(s, x, z) {
    let u;
    if (s.dir === 0) u = (x - s.x0) / (s.x1 - s.x0);
    else if (s.dir === 1) u = (s.x1 - x) / (s.x1 - s.x0);
    else if (s.dir === 2) u = (z - s.z0) / (s.z1 - s.z0);
    else u = (s.z1 - z) / (s.z1 - s.z0);
    return s.ya + (s.yb - s.ya) * clamp(u, 0, 1);
  }
  function rampTop(s, x0, z0, x1, z1) {
    if (s.dir === 0) return rampH(s, x1, 0);
    if (s.dir === 1) return rampH(s, x0, 0);
    if (s.dir === 2) return rampH(s, 0, z1);
    return rampH(s, 0, z0);
  }

  function overlapAt(M, x, y, z, r, h, skipRampBelow) {
    const L = M.query(x - r, z - r, x + r, z + r);
    for (let k = 0; k < L.length; k++) {
      const s = M.solids[L[k]];
      if (x + r <= s.x0 || x - r >= s.x1 || z + r <= s.z0 || z - r >= s.z1 || y + h <= s.y0 || y >= s.y1) continue;
      if (s.t === 1) { const top = rampTop(s, Math.max(x - r, s.x0), Math.max(z - r, s.z0), Math.min(x + r, s.x1), Math.min(z + r, s.z1)); if (y >= top - skipRampBelow) continue; }
      return s;
    }
    return null;
  }

  const RH = { t: 0, nx: 0, ny: 0, nz: 0, s: null };
  function rayMap(M, ox, oy, oz, dx, dy, dz, maxT) {
    let best = maxT, hit = false;
    const ex = ox + dx * maxT, ez = oz + dz * maxT;
    const L = M.query(Math.min(ox, ex), Math.min(oz, ez), Math.max(ox, ex), Math.max(oz, ez));
    const ix = 1 / (dx || 1e-12), iy = 1 / (dy || 1e-12), iz = 1 / (dz || 1e-12);
    for (let k = 0; k < L.length; k++) {
      const s = M.solids[L[k]];
      let t0 = (s.x0 - ox) * ix, t1 = (s.x1 - ox) * ix, n = 0;
      if (t0 > t1) { const q = t0; t0 = t1; t1 = q; }
      let u0 = (s.y0 - oy) * iy, u1 = (s.y1 - oy) * iy;
      if (u0 > u1) { const q = u0; u0 = u1; u1 = q; }
      if (u0 > t0) { t0 = u0; n = 1; }
      if (u1 < t1) t1 = u1;
      let w0 = (s.z0 - oz) * iz, w1 = (s.z1 - oz) * iz;
      if (w0 > w1) { const q = w0; w0 = w1; w1 = q; }
      if (w0 > t0) { t0 = w0; n = 2; }
      if (w1 < t1) t1 = w1;
      if (t0 > t1 || t1 < 0 || t0 > best) continue;
      if (s.t === 1) {
        const te = Math.max(0, t0), px = ox + dx * te, py = oy + dy * te, pz = oz + dz * te;
        if (py <= rampH(s, px, pz) + 1e-4) {
          if (te < best) { best = te; hit = true; RH.s = s; if (n === 0) { RH.nx = dx > 0 ? -1 : 1; RH.ny = 0; RH.nz = 0; } else if (n === 1) { RH.nx = 0; RH.ny = dy > 0 ? -1 : 1; RH.nz = 0; } else { RH.nx = 0; RH.ny = 0; RH.nz = dz > 0 ? -1 : 1; } }
          continue;
        }
        const ax = s.dir === 0 ? 1 : s.dir === 1 ? -1 : 0, az = s.dir === 2 ? 1 : s.dir === 3 ? -1 : 0, len = ax ? s.x1 - s.x0 : s.z1 - s.z0, sl = (s.yb - s.ya) / len;
        let nx = -ax * sl, ny = 1, nz = -az * sl;
        const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
        const f0 = py - rampH(s, px, pz), f1 = (oy + dy * t1) - rampH(s, ox + dx * t1, oz + dz * t1);
        if (f1 > 0) continue;
        const tt = te + (t1 - te) * (f0 / (f0 - f1));
        if (tt < best) { best = tt; hit = true; RH.s = s; RH.nx = nx; RH.ny = ny; RH.nz = nz; }
        continue;
      }
      if (t0 < 0) continue;
      best = t0; hit = true; RH.s = s;
      if (n === 0) { RH.nx = dx > 0 ? -1 : 1; RH.ny = 0; RH.nz = 0; }
      else if (n === 1) { RH.nx = 0; RH.ny = dy > 0 ? -1 : 1; RH.nz = 0; }
      else { RH.nx = 0; RH.ny = 0; RH.nz = dz > 0 ? -1 : 1; }
    }
    if (dy < 0 && M.def.floor !== null) { const tf = (M.floorY - oy) / dy; if (tf >= 0 && tf < best) { best = tf; hit = true; RH.s = null; RH.nx = 0; RH.ny = 1; RH.nz = 0; } }
    RH.t = best;
    return hit;
  }
  const clearLine = (M, ax, ay, az, bx, by, bz) => { const dx = bx - ax, dy = by - ay, dz = bz - az, l = Math.hypot(dx, dy, dz); if (l < 1e-6) return true; return !rayMap(M, ax, ay, az, dx / l, dy / l, dz / l, l); };

  function rayBox(ox, oy, oz, ix, iy, iz, x0, y0, z0, x1, y1, z1) {
    let t0 = (x0 - ox) * ix, t1 = (x1 - ox) * ix;
    if (t0 > t1) { const q = t0; t0 = t1; t1 = q; }
    let u0 = (y0 - oy) * iy, u1 = (y1 - oy) * iy;
    if (u0 > u1) { const q = u0; u0 = u1; u1 = q; }
    if (u0 > t0) t0 = u0;
    if (u1 < t1) t1 = u1;
    let w0 = (z0 - oz) * iz, w1 = (z1 - oz) * iz;
    if (w0 > w1) { const q = w0; w0 = w1; w1 = q; }
    if (w0 > t0) t0 = w0;
    if (w1 < t1) t1 = w1;
    if (t0 > t1 || t1 < 0) return -1;
    return t0 < 0 ? 0 : t0;
  }
  function rayEll(ox, oy, oz, dx, dy, dz, cx, cy, cz, rx, ry) {
    const px = (ox - cx) / rx, py = (oy - cy) / ry, pz = (oz - cz) / rx, qx = dx / rx, qy = dy / ry, qz = dz / rx;
    const a = qx * qx + qy * qy + qz * qz, b = 2 * (px * qx + py * qy + pz * qz), c = px * px + py * py + pz * pz - 1, d = b * b - 4 * a * c;
    if (d < 0) return -1;
    const s = Math.sqrt(d), t = (-b - s) / (2 * a);
    if (t >= 0) return t;
    const t2 = (-b + s) / (2 * a);
    return t2 >= 0 ? 0 : -1;
  }

  const HB = { t: 0, z: 0, p: null };
  function rayPlayers(W, sh, ox, oy, oz, dx, dy, dz, maxT) {
    let best = maxT, hit = null, zone = 0;
    const ix = 1 / (dx || 1e-12), iy = 1 / (dy || 1e-12), iz = 1 / (dz || 1e-12), G = W.G;
    for (const p of W.players) {
      if (!p || p === sh || !p.alive) continue;
      if (W.teams && sh && p.team === sh.team) continue;
      const h = p.crouch ? G.phys.HC : G.phys.H;
      if (rayBox(ox, oy, oz, ix, iy, iz, p.x - 0.7, p.y - 0.1, p.z - 0.7, p.x + 0.7, p.y + h + 0.4, p.z + 0.7) < 0) continue;
      const boxes = G.hitboxes(p, h);
      let tO = 1e9, zO = -1, zI = -1, tI = 1e9;
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        const t = b.e ? rayEll(ox, oy, oz, dx, dy, dz, p.x, p.y + b.cy, p.z, b.rx, b.ry) : rayBox(ox, oy, oz, ix, iy, iz, p.x - b.rx, p.y + b.y0, p.z - b.rx, p.x + b.rx, p.y + b.y1, p.z + b.rx);
        if (t < 0) continue;
        if (b.inner) { if (b.z > zI) zI = b.z; if (t < tI) tI = t; }
        else if (t < tO) { tO = t; zO = b.z; }
      }
      const tt = tO < 1e9 ? tO : tI, zz = Math.max(zO, zI);
      if (tt < best && zz >= 0) { best = tt; hit = p; zone = zz; }
    }
    HB.t = best; HB.p = hit; HB.z = zone;
    return hit;
  }

  function mkPlayer(W, slot, o) {
    const G = W.G;
    const p = {
      slot, id: o.id || ('s' + slot), name: o.name || 'Player', team: o.team | 0, bot: !!o.bot, human: !o.bot, remote: !!o.remote, local: !!o.local, diff: o.diff | 0,
      cls: o.cls | 0, nextCls: o.cls | 0, x: 0, y: 0, z: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, onGround: false, wasGround: false, crouch: false, crouchF: 0,
      slide: 0, slideCd: 0, landT: 0, airT: 0, hp: 100, maxHp: 100, armor: 0, alive: false, respawnT: 0.5, spawnProt: 0, kills: 0, deaths: 0, score: 0, streak: 0, bestStreak: 0, heads: 0, shots: 0, hits: 0, dmgDone: 0,
      weps: [], cur: 0, fireCD: 0, reloadT: 0, swapT: 0, meleeT: 0, meleeHit: false, adsF: 0, bloom: 0, kick: 0, kickYaw: 0, burstN: 0, burstT: 0, nades: 0, nadeCD: 0, lastHurt: -99, lastAtt: -1, lastShotT: -99,
      in: { mx: 0, mz: 0, yaw: 0, pitch: 0, jump: false, crouch: false, fire: false, ads: false, reloadN: 0, swapN: 0, slotN: 0, slot: 0, meleeN: 0, nadeN: 0 }, seen: { reloadN: 0, swapN: 0, slotN: 0, meleeN: 0, nadeN: 0 },
      jumpHeld: false, firePrev: false, stepAcc: 0, zoneT: 0, ai: null, killer: -1, killerW: '', deathT: 0, dmgFrom: [], wantSpawn: false, inGame: true, streakAward: 0, shield: 0
    };
    p.ai = o.bot && !o.remote ? mkBrain(W, p) : null;
    return p;
  }

  function giveLoadout(W, p) {
    const G = W.G, C = G.classes[p.cls] || G.classes[0];
    p.maxHp = C.hp; p.hp = C.hp; p.armor = 0; p.shield = 0;
    p.weps = [C.prim, C.sec, G.melee].filter((k, i, a) => k && a.indexOf(k) === i).map(k => { const d = G.weapons[k]; return { k, d, mag: d.mag || 0, res: d.reserve || 0 }; });
    p.cur = 0; p.fireCD = 0; p.reloadT = 0; p.swapT = 0.25; p.meleeT = 0; p.adsF = 0; p.bloom = 0; p.kick = 0; p.burstN = 0; p.nades = G.nades || 0; p.nadeCD = 0;
  }

  function pickSpawn(W, p) {
    const M = W.M, list = M.spawns.filter(s => !W.teams || s.team < 0 || s.team === p.team);
    const L = list.length ? list : M.spawns;
    let best = null, bs = -1e9;
    for (const s of L) {
      let md = 1e9;
      for (const q of W.players) if (q && q !== p && q.alive && (!W.teams || q.team !== p.team)) md = Math.min(md, Math.hypot(q.x - s.x, q.z - s.z) + Math.abs(q.y - s.y) * 0.5);
      let mate = 0;
      if (W.teams) for (const q of W.players) if (q && q !== p && q.alive && q.team === p.team) mate += Math.max(0, 25 - Math.hypot(q.x - s.x, q.z - s.z)) * 0.08;
      const sc = Math.min(md, 60) + mate + W.rng() * 6 - (s.used && W.t - s.used < 3 ? 30 : 0);
      if (sc > bs) { bs = sc; best = s; }
    }
    return best || { x: 0, y: 1, z: 0, yaw: 0 };
  }

  function spawnPlayer(W, p, at) {
    const G = W.G;
    if (p.nextCls != null) p.cls = p.nextCls;
    giveLoadout(W, p);
    const s = at || pickSpawn(W, p);
    s.used = W.t;
    p.x = p.px = s.x; p.y = p.py = s.y; p.z = p.pz = s.z; p.vx = p.vy = p.vz = 0;
    let yaw = s.yaw;
    if (yaw == null) { const cx = (W.M.x0 + W.M.x1) / 2, cz = (W.M.z0 + W.M.z1) / 2; yaw = Math.atan2(-(cx - s.x), -(cz - s.z)); }
    p.yaw = p.in.yaw = yaw; p.pitch = p.in.pitch = 0;
    p.alive = true; p.onGround = false; p.crouch = false; p.slide = 0; p.spawnProt = G.spawnProt || 1.5; p.lastHurt = -99; p.dmgFrom.length = 0; p.streak = 0; p.streakAward = 0; p.zoneT = 0;
    if (p.ai) p.ai.reset(W);
    W.ev.push(['sp', p.slot, +s.x.toFixed(2), +s.y.toFixed(2), +s.z.toFixed(2), +yaw.toFixed(3), p.cls]);
  }

  function wishMove(W, p, dt) {
    const G = W.G, P = G.phys, I = p.in, C = G.classes[p.cls] || G.classes[0], w = p.weps[p.cur];
    p.yaw = I.yaw; p.pitch = clamp(I.pitch, -1.55, 1.55);
    const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
    let wx = -sy * I.mz + cy * I.mx, wz = -cy * I.mz - sy * I.mx;
    const wl = Math.hypot(wx, wz);
    if (wl > 1) { wx /= wl; wz /= wl; }
    const wm = Math.min(1, wl);
    if (wl > 1e-4) { wx /= wl; wz /= wl; }
    const wd = w ? w.d : null;
    const ads = p.adsF;
    let maxS = P.speed * (C.speed || 1) * (wd && wd.speedMul ? wd.speedMul : 1) * (1 - ads * (1 - (wd && wd.adsMove || P.adsMul || 0.72)));
    const hs = Math.hypot(p.vx, p.vz);
    const wantC = I.crouch && P.H !== P.HC;
    if (wantC && !p.crouch) {
      p.crouch = true;
      if (P.slideTime && p.onGround && hs > maxS * P.slideMin && p.slideCd <= 0) startSlide(W, p, hs, maxS);
    } else if (!wantC && p.crouch) {
      if (!overlapAt(W.M, p.x, p.y + 0.05, p.z, P.R - 0.02, P.H - 0.05, P.stepH)) { p.crouch = false; p.slide = 0; }
    }
    if (p.crouch && !p.slide) maxS *= P.crouchMul;
    const jumpNow = I.jump && (!p.jumpHeld || P.autoHop);
    if (p.onGround) {
      if (jumpNow && p.landT >= (P.hopDelay || 0)) {
        p.vy = P.jumpV * (C.jump || 1); p.onGround = false; p.jumpHeld = true;
        if (p.slide) { p.slide = 0; if (p.crouch && !I.crouch) p.crouch = false; }
        W.ev.push(['j', p.slot]);
        if (!p.slide) { const cur = p.vx * wx + p.vz * wz, add = wm * maxS - cur; if (add > 0 && wm > 0) { const a = Math.min(P.accel * maxS * dt, add); p.vx += wx * a; p.vz += wz * a; } }
      } else if (p.slide > 0) {
        p.slide -= dt;
        const f = P.slideFric;
        const k = Math.max(0, 1 - f * dt);
        p.vx *= k; p.vz *= k;
        if (wm > 0) { const sp = Math.hypot(p.vx, p.vz); if (sp > 0.1) { const tx = p.vx / sp, tz = p.vz / sp, d = tx * wx + tz * wz; if (d > -0.2) { const a = (P.slideSteer || 2) * dt, nx = tx + (wx - tx * d) * a, nz = tz + (wz - tz * d) * a, nl = Math.hypot(nx, nz); p.vx = nx / nl * sp; p.vz = nz / nl * sp; } } }
        if (p.slide <= 0 || Math.hypot(p.vx, p.vz) < maxS * 0.45) { p.slide = 0; p.slideCd = P.slideCd || 0.35; }
      } else {
        const sp = Math.hypot(p.vx, p.vz);
        if (sp > 0) { const drop = Math.max(sp, P.stopSpeed) * P.fric * dt, ns = Math.max(0, sp - drop) / sp; p.vx *= ns; p.vz *= ns; }
        const cur = p.vx * wx + p.vz * wz, add = wm * maxS - cur;
        if (add > 0 && wm > 0) { const a = Math.min(P.accel * maxS * dt, add); p.vx += wx * a; p.vz += wz * a; }
        const s2 = Math.hypot(p.vx, p.vz);
        if (s2 > maxS * 1.02 && s2 > 0) { const k = Math.max(maxS, s2 - P.fric * 2.2 * maxS * dt) / s2; p.vx *= k; p.vz *= k; }
      }
    } else {
      airAccel(p, wx, wz, wm * maxS, P, dt);
      const s2 = Math.hypot(p.vx, p.vz), cap = maxS * (P.maxAir || 1.7);
      if (s2 > cap) { p.vx *= cap / s2; p.vz *= cap / s2; }
    }
    if (!I.jump) p.jumpHeld = false;
    if (p.slideCd > 0) p.slideCd -= dt;
  }
  function startSlide(W, p, hs, maxS) {
    const P = W.G.phys;
    const tgt = Math.max(hs, maxS * P.slideBoost);
    const k = tgt / Math.max(0.01, hs);
    p.vx *= k; p.vz *= k; p.slide = P.slideTime;
    W.ev.push(['sl', p.slot]);
  }
  function airAccel(p, wx, wz, ws, P, dt) {
    if (ws <= 0) return;
    const cap = Math.min(ws, P.airCap), cur = p.vx * wx + p.vz * wz, add = cap - cur;
    if (add <= 0) return;
    const a = Math.min(P.airAccel * ws * dt, add);
    p.vx += wx * a; p.vz += wz * a;
  }

  function physStep(W, p, dt) {
    const G = W.G, P = G.phys, M = W.M, r = P.R, h = p.crouch ? P.HC : P.H;
    p.px = p.x; p.py = p.y; p.pz = p.z;
    const was = p.onGround;
    {
      const s = overlapAt(M, p.x, p.y + 0.01, p.z, r - 0.06, h - 0.05, P.stepH);
      if (s) { const top = s.t === 1 ? rampTop(s, Math.max(p.x - r, s.x0), Math.max(p.z - r, s.z0), Math.min(p.x + r, s.x1), Math.min(p.z + r, s.z1)) : s.y1; if (top - p.y < 1.3 && !overlapAt(M, p.x, top + 0.02, p.z, r - 0.06, h - 0.05, P.stepH)) { p.y = top + 0.01; p.vy = Math.max(0, p.vy); } }
    }
    if (!p.onGround || p.vy > 0) p.vy -= P.g * dt;
    else p.vy = Math.max(p.vy - P.g * dt, -2);
    if (p.vy < -P.maxFall) p.vy = -P.maxFall;
    const sub = Math.max(1, Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vz), Math.abs(p.vy)) * dt / 0.3));
    const sdt = dt / sub;
    let ground = false;
    for (let it = 0; it < sub; it++) {
      for (let ax = 0; ax < 2; ax++) {
        const v = ax ? p.vz : p.vx;
        if (!v) continue;
        const nx = ax ? p.x : p.x + v * sdt, nz = ax ? p.z + v * sdt : p.z;
        let s = overlapAt(M, nx, p.y, nz, r, h, P.stepH);
        if (!s) { p.x = nx; p.z = nz; continue; }
        if ((was || p.onGround) && p.vy <= 0.5) {
          let lift = -1;
          for (let k = 0; k < 4; k++) {
            const top = s.t === 1 ? rampTop(s, Math.max(nx - r, s.x0), Math.max(nz - r, s.z0), Math.min(nx + r, s.x1), Math.min(nz + r, s.z1)) : s.y1;
            const up = top - p.y;
            if (up <= 0 || up > P.stepH + 1e-3) { lift = -1; break; }
            lift = top;
            s = overlapAt(M, nx, lift + 1e-3, nz, r, h, P.stepH);
            if (!s) break;
            lift = -1;
          }
          if (lift >= 0) { p.y = lift + 1e-3; p.x = nx; p.z = nz; p.vy = Math.min(p.vy, 0); ground = true; continue; }
        }
        if (ax) { p.vz = 0; } else { p.vx = 0; }
      }
      const ny = p.y + p.vy * sdt;
      if (p.vy <= 0) {
        let sup = -1e9;
        const L = M.query(p.x - r, p.z - r, p.x + r, p.z + r);
        for (let k = 0; k < L.length; k++) {
          const s = M.solids[L[k]];
          if (p.x + r <= s.x0 || p.x - r >= s.x1 || p.z + r <= s.z0 || p.z - r >= s.z1) continue;
          const top = s.t === 1 ? rampTop(s, Math.max(p.x - r, s.x0), Math.max(p.z - r, s.z0), Math.min(p.x + r, s.x1), Math.min(p.z + r, s.z1)) : s.y1;
          const lim = s.t === 1 ? P.stepH + 0.02 : 0.02;
          if (top <= p.y + lim && top > sup && (top >= ny - 1e-3 || ((was || ground) && s.t === 1 && p.y - top < 0.42) || ((was || ground) && s.t === 0 && p.y - top < 0.06))) sup = top;
        }
        if (M.def.floor !== null && M.floorY <= p.y + 0.02 && M.floorY >= ny - 1e-3) sup = Math.max(sup, M.floorY);
        if (sup > -1e8) { p.y = sup; if (p.vy < -0.5 && !was) W.ev.push(['ld', p.slot, Math.min(1, -p.vy / 14)]); p.vy = 0; ground = true; }
        else p.y = ny;
      } else {
        const s = overlapAt(M, p.x, ny, p.z, r - 0.01, h, -1);
        if (s && s.y0 >= p.y + h - 0.05) { p.y = s.y0 - h - 1e-3; p.vy = 0; }
        else p.y = ny;
      }
    }
    if (!ground && p.vy <= 0 && was) {
      const L = M.query(p.x - r, p.z - r, p.x + r, p.z + r);
      for (let k = 0; k < L.length; k++) { const s = M.solids[L[k]]; if (p.x + r <= s.x0 || p.x - r >= s.x1 || p.z + r <= s.z0 || p.z - r >= s.z1) continue; const top = s.t === 1 ? rampTop(s, Math.max(p.x - r, s.x0), Math.max(p.z - r, s.z0), Math.min(p.x + r, s.x1), Math.min(p.z + r, s.z1)) : s.y1; if (top <= p.y + 0.02 && p.y - top < 0.06) { ground = true; break; } }
    }
    if (ground && !p.onGround) p.landT = 0;
    p.wasGround = was;
    p.onGround = ground;
    if (ground) { p.landT += dt; p.airT = 0; } else p.airT += dt;
    if (p.slide > 0 && ground) {
      const L = M.query(p.x - 0.05, p.z - 0.05, p.x + 0.05, p.z + 0.05);
      for (let k = 0; k < L.length; k++) {
        const s = M.solids[L[k]];
        if (s.t !== 1 || p.x < s.x0 || p.x > s.x1 || p.z < s.z0 || p.z > s.z1 || Math.abs(rampH(s, p.x, p.z) - p.y) > 0.1) continue;
        const len = s.dir < 2 ? s.x1 - s.x0 : s.z1 - s.z0, sl = (s.yb - s.ya) / len, a = P.g * sl / Math.sqrt(1 + sl * sl) * 0.9 * dt;
        if (s.dir === 0) p.vx -= a; else if (s.dir === 1) p.vx += a; else if (s.dir === 2) p.vz -= a; else p.vz += a;
        if (p.slide < 0.15) p.slide = 0.15;
      }
    }
    if (!ground && p.crouch && P.slideTime && p.in.crouch && p.vy < 0) p.slideQ = 1;
    if (ground && !was && p.slideQ && p.in.crouch) { const hs = Math.hypot(p.vx, p.vz), C = G.classes[p.cls] || G.classes[0]; if (hs > P.speed * (C.speed || 1) * P.slideMin) startSlide(W, p, hs, P.speed * (C.speed || 1)); }
    if (ground) p.slideQ = 0;
    const B = 0.5;
    if (p.x < M.x0 - B || p.x > M.x1 + B || p.z < M.z0 - B || p.z > M.z1 + B) { p.x = clamp(p.x, M.x0 - B, M.x1 + B); p.z = clamp(p.z, M.z0 - B, M.z1 + B); }
  }

  function spreadNow(W, p, d) {
    const hs = Math.hypot(p.vx, p.vz), P = W.G.phys;
    let s = lerp(d.spreadHip, d.spreadAds, p.adsF);
    s += (d.spreadMove || 0) * Math.min(1, hs / P.speed) * (1 - p.adsF * 0.6);
    if (!p.onGround) s += d.spreadAir || 0;
    if (p.crouch && !p.slide) s *= 0.8;
    return s + p.bloom;
  }

  const SH = { dx: 0, dy: 0, dz: 0 };
  function aimDir(p, spread, rnd) {
    const yaw = p.yaw + p.kickYaw, pit = clamp(p.pitch + p.kick, -1.55, 1.55);
    const cp = Math.cos(pit);
    let dx = -Math.sin(yaw) * cp, dy = Math.sin(pit), dz = -Math.cos(yaw) * cp;
    if (spread > 0) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * spread;
      const rx = Math.cos(yaw), rz = -Math.sin(yaw);
      const ux = Math.sin(yaw) * Math.sin(pit), uy = cp, uz = Math.cos(yaw) * Math.sin(pit);
      dx += (rx * Math.cos(a) + ux * Math.sin(a)) * r; dy += uy * Math.sin(a) * r; dz += (rz * Math.cos(a) + uz * Math.sin(a)) * r;
      const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
    }
    SH.dx = dx; SH.dy = dy; SH.dz = dz;
    return SH;
  }
  const eyeY = (W, p) => p.y + (p.crouch ? W.G.phys.eyeC : W.G.phys.eye);

  function weaponStep(W, p, dt) {
    const I = p.in, S = p.seen, G = W.G;
    if (p.spawnProt > 0) p.spawnProt -= dt;
    p.fireCD -= dt; p.nadeCD -= dt;
    p.bloom = Math.max(0, p.bloom - (p.weps[p.cur] ? p.weps[p.cur].d.bloomRec || 0.25 : 0.25) * dt);
    const w = p.weps[p.cur];
    if (!w) return;
    const d = w.d;
    p.kick = damp(p.kick, 0, d.recoilRec || 9, dt); p.kickYaw = damp(p.kickYaw, 0, 10, dt);
    if (p.swapT > 0) p.swapT -= dt;
    if (I.slotN !== S.slotN) { S.slotN = I.slotN; if (I.slot !== p.cur && p.weps[I.slot]) swapTo(W, p, I.slot); }
    if (I.swapN !== S.swapN) { S.swapN = I.swapN; const n = p.weps.length > 2 ? (p.cur === 0 ? 1 : 0) : (p.cur + 1) % p.weps.length; if (p.weps[n] && n !== p.cur) swapTo(W, p, n); }
    if (I.meleeN !== S.meleeN) { S.meleeN = I.meleeN; if (p.meleeT <= 0 && G.melee) { p.meleeT = G.weapons[G.melee].rate; p.meleeHit = false; p.reloadT = 0; W.ev.push(['me', p.slot]); } }
    if (I.nadeN !== S.nadeN) { S.nadeN = I.nadeN; if (p.nades > 0 && p.nadeCD <= 0 && G.nade && p.meleeT <= 0) { p.nades--; p.nadeCD = 0.8; throwNade(W, p); } }
    if (p.meleeT > 0) {
      const md = G.weapons[G.melee];
      p.meleeT -= dt;
      if (!p.meleeHit && p.meleeT <= md.rate - md.hitAt) { p.meleeHit = true; meleeHit(W, p, md); }
      p.adsF = Math.max(0, p.adsF - dt / 0.12);
      return;
    }
    const busy = p.swapT > 0 || p.reloadT > 0;
    const wantAds = I.ads && !busy && !(p.slide > 0 && !d.adsSlide) && d.kind !== 'melee';
    p.adsF = clamp(p.adsF + (wantAds ? 1 : -1.4) * dt / (d.adsT || 0.15), 0, 1);
    if (p.reloadT > 0) {
      p.reloadT -= dt;
      if (p.reloadT <= 0) { if (d.reloadOne) { w.mag++; w.res--; if (w.mag < d.mag && w.res > 0 && !I.fire) p.reloadT = d.reloadOne; } else { const n = Math.min(d.mag - w.mag, w.res); w.mag += n; w.res -= n; } }
      else if (d.reloadOne && I.fire && w.mag > 0) p.reloadT = 0;
    }
    if (I.reloadN !== S.reloadN) { S.reloadN = I.reloadN; tryReload(W, p); }
    if (d.kind === 'melee') { if (I.fire && !p.firePrev) { p.meleeT = d.rate; p.meleeHit = false; W.ev.push(['me', p.slot]); } p.firePrev = I.fire; return; }
    if (p.burstN > 0) {
      p.burstT -= dt;
      if (p.burstT <= 0 && w.mag > 0) { p.burstN--; p.burstT = d.burstGap; fire(W, p, w); }
      else if (w.mag <= 0) p.burstN = 0;
    } else if (I.fire && (d.auto || !p.firePrev) && p.fireCD <= 0 && !busy) {
      if (w.mag > 0) {
        if (d.burst) { p.burstN = d.burst - 1; p.burstT = d.burstGap; }
        fire(W, p, w);
      } else if (!p.firePrev || d.auto) { if (w.res > 0) tryReload(W, p); else if (!p.firePrev) W.ev.push(['dry', p.slot]); }
    }
    if (w.mag <= 0 && w.res > 0 && p.reloadT <= 0 && p.fireCD <= 0 && !busy && p.burstN <= 0 && G.autoReload !== false) tryReload(W, p);
    p.firePrev = I.fire;
  }
  function swapTo(W, p, n) { p.cur = n; p.swapT = p.weps[n].d.swap || 0.35; p.reloadT = 0; p.burstN = 0; p.adsF = 0; W.ev.push(['sw', p.slot, n]); }
  function tryReload(W, p) {
    const w = p.weps[p.cur];
    if (!w || w.d.kind === 'melee' || p.reloadT > 0 || w.mag >= w.d.mag || w.res <= 0 || p.swapT > 0) return;
    p.reloadT = w.d.reloadOne && w.mag > 0 ? w.d.reloadOne : w.d.reload; p.burstN = 0;
    W.ev.push(['rl', p.slot, p.cur]);
  }

  function fire(W, p, w) {
    const d = w.d, M = W.M, G = W.G;
    w.mag--; p.fireCD = d.rate; p.shots++; p.lastShotT = W.t; p.spawnProt = 0;
    const ox = p.x, oy = eyeY(W, p), oz = p.z;
    const sp = spreadNow(W, p, d);
    const rnd = p.remote || !W.auth ? Math.random : W.rng;
    if (d.kind === 'rocket') {
      const a = aimDir(p, sp, rnd);
      spawnProj(W, p, 'r', d, ox + a.dx * 0.6, oy - 0.1 + a.dy * 0.6, oz + a.dz * 0.6, a.dx * d.projSpeed, a.dy * d.projSpeed, a.dz * d.projSpeed);
      W.ev.push(['fx', p.slot, p.cur, 0]);
    } else {
      const n = d.pellets || 1;
      let anyHit = false;
      const hits = W.auth ? null : [];
      for (let i = 0; i < n; i++) {
        const a = aimDir(p, n > 1 ? Math.max(sp, d.pelletSpread || 0) : sp, rnd);
        const range = d.range || 200;
        const wh = rayMap(M, ox, oy, oz, a.dx, a.dy, a.dz, range);
        const wt = wh ? RH.t : range, wnx = RH.nx, wny = RH.ny, wnz = RH.nz;
        const v = rayPlayers(W, p, ox, oy, oz, a.dx, a.dy, a.dz, wt);
        if (v) {
          anyHit = true;
          const dist = HB.t, zone = HB.z;
          if (W.auth) applyHit(W, p, v, d, zone, dist, a.dx, a.dz, w.k);
          else hits.push([v.slot, zone, +dist.toFixed(2)]);
          W.ev.push(['tr', p.slot, +(ox + a.dx * dist).toFixed(2), +(oy + a.dy * dist).toFixed(2), +(oz + a.dz * dist).toFixed(2), 1, i, zone, v.slot, 0]);
        } else W.ev.push(['tr', p.slot, +(ox + a.dx * wt).toFixed(2), +(oy + a.dy * wt).toFixed(2), +(oz + a.dz * wt).toFixed(2), wh ? 0 : -1, i, +wnx.toFixed(2), +wny.toFixed(2), +wnz.toFixed(2)]);
      }
      if (anyHit) p.hits++;
      if (hits && hits.length && W.onClaim) W.onClaim(p, w.k, hits);
      W.ev.push(['fx', p.slot, p.cur, n]);
    }
    p.bloom = Math.min(d.bloomMax || 0.05, p.bloom + (d.bloom || 0));
    const rk = d.recoil * (1 - p.adsF * (d.adsRecoil == null ? 0.3 : d.adsRecoil));
    p.kick += rk; p.kickYaw += (rnd() - 0.5) * rk * 0.5;
    if (d.punch && W.auth) { }
    if (d.kind !== 'rocket') hearShot(W, p);
  }

  function falloff(d, dist) {
    if (!d.fall1) return 1;
    if (dist <= d.fall0) return 1;
    if (dist >= d.fall1) return d.fallMin;
    return lerp(1, d.fallMin, (dist - d.fall0) / (d.fall1 - d.fall0));
  }
  function applyHit(W, a, v, d, zone, dist, dx, dz, wk) {
    const mul = zone === 2 ? (d.headMul || 1.5) : zone === 0 ? (d.legMul || 1) : 1;
    let dmg = d.dmg * mul * falloff(d, dist);
    hurt(W, v, dmg, a, wk, zone === 2, dx, dz);
  }
  function hurt(W, v, dmg, a, wk, head, dx, dz, splash) {
    if (!W.auth || !v.alive || dmg <= 0 || W.over) return;
    if (a && a !== v && W.teams && a.team === v.team) return;
    if (v.spawnProt > 0 && a !== v) return;
    if (a && a !== v) { a.dmgDone += dmg; }
    if (v.shield > 0) { const k = Math.min(v.shield, dmg * 0.6); v.shield -= k; dmg -= k; }
    v.hp -= dmg; v.lastHurt = W.t;
    if (a && a !== v) { v.lastAtt = a.slot; let f = v.dmgFrom.find(x => x[0] === a.slot); if (!f) v.dmgFrom.push(f = [a.slot, 0]); f[1] += dmg; }
    W.ev.push(['h', a ? a.slot : -1, v.slot, Math.round(dmg), head ? 1 : 0, Math.max(0, Math.ceil(v.hp)), +(Math.atan2(-(dx || 0), -(dz || 0))).toFixed(2), splash ? 1 : 0]);
    if (v.ai && a && a !== v) v.ai.hurtBy(W, a);
    if (v.hp <= 0) kill(W, v, a, wk, head);
  }
  function kill(W, v, a, wk, head) {
    const G = W.G;
    v.hp = 0; v.alive = false; v.deaths++; v.respawnT = G.respawn; v.killer = a ? a.slot : -1; v.killerW = wk || ''; v.deathT = W.t; v.streak = 0; v.slide = 0; v.reloadT = 0; v.adsF = 0; v.wantSpawn = !G.manualSpawn;
    let ast = -1;
    for (const f of v.dmgFrom) if (a && f[0] !== a.slot && f[1] >= 30) { const q = W.players[f[0]]; if (q) { q.score += G.assistScore || 25; ast = f[0]; } }
    if (a && a !== v) {
      a.kills++; a.streak++; a.bestStreak = Math.max(a.bestStreak, a.streak); a.score += G.killScore + (head ? G.headScore : 0); if (head) a.heads++;
      if (W.teams) W.teamScore[a.team] += W.mode.zone ? 0 : 1;
      if (G.streaks) for (const s of G.streaks) if (a.streak === s.n && a.alive) { s.give(W, a); W.ev.push(['aw', a.slot, s.key]); }
    } else if (!W.teams || W.mode.zone) { v.score = Math.max(0, v.score - (G.suicidePenalty || 0)); }
    W.ev.push(['k', a ? a.slot : -1, v.slot, wk || '', head ? 1 : 0, a ? a.streak : 0, ast, +v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]);
    checkEnd(W);
  }
  function meleeHit(W, p, md) {
    const ox = p.x, oy = eyeY(W, p), oz = p.z, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    let best = null, bd = 1e9;
    for (const q of W.players) {
      if (!q || q === p || !q.alive || (W.teams && q.team === p.team)) continue;
      const dx = q.x - ox, dz = q.z - oz, dy = q.y + 0.9 - oy, dist = Math.hypot(dx, dz);
      if (dist > md.range || Math.abs(dy) > 1.6) continue;
      if ((dx * fx + dz * fz) / Math.max(0.01, dist) < 0.55 && dist > 0.8) continue;
      if (!clearLine(W.M, ox, oy, oz, q.x, q.y + 1, q.z)) continue;
      if (dist < bd) { bd = dist; best = q; }
    }
    if (!best) { W.ev.push(['mm', p.slot]); return; }
    if (W.auth) hurt(W, best, md.dmg, p, W.G.melee, false, fx, fz);
    else if (W.onClaim) W.onClaim(p, W.G.melee, [[best.slot, 1, +bd.toFixed(2)]]);
    W.ev.push(['mh', p.slot, best.slot]);
  }

  function spawnProj(W, p, kind, d, x, y, z, vx, vy, vz) {
    if (!W.auth) { if (W.onProj) W.onProj(p, kind, x, y, z, vx, vy, vz); return; }
    const pr = { id: ++W.pid, kind, o: p.slot, team: p.team, d, x, y, z, vx, vy, vz, t: 0, fuse: d.fuse || 6, px: x, py: y, pz: z, bounce: 0 };
    W.projs.push(pr);
    W.ev.push(['pj', pr.id, kind, p.slot]);
    return pr;
  }
  function throwNade(W, p) {
    const G = W.G, d = G.weapons[G.nade];
    const cp = Math.cos(p.pitch + 0.12), dx = -Math.sin(p.yaw) * cp, dy = Math.sin(p.pitch + 0.12), dz = -Math.cos(p.yaw) * cp;
    const ox = p.x + dx * 0.5, oy = eyeY(W, p) - 0.15, oz = p.z + dz * 0.5;
    spawnProj(W, p, 'g', d, ox, oy, oz, dx * d.projSpeed + p.vx * 0.5, dy * d.projSpeed + 1.5, dz * d.projSpeed + p.vz * 0.5);
    W.ev.push(['nt', p.slot]);
  }
  function projStep(W, dt) {
    const M = W.M;
    for (let i = W.projs.length - 1; i >= 0; i--) {
      const r = W.projs[i], d = r.d;
      r.t += dt; r.px = r.x; r.py = r.y; r.pz = r.z;
      r.vy -= (d.projGrav || 0) * dt;
      const sp = Math.hypot(r.vx, r.vy, r.vz), step = sp * dt;
      let boom = r.t >= r.fuse;
      if (sp > 0 && !boom) {
        const dx = r.vx / sp, dy = r.vy / sp, dz = r.vz / sp;
        const sh = W.players[r.o];
        const v = r.kind === 'r' ? rayPlayers(W, sh, r.x, r.y, r.z, dx, dy, dz, step + 0.15) : null;
        const wh = rayMap(M, r.x, r.y, r.z, dx, dy, dz, step + 0.12);
        if (v && (!wh || HB.t < RH.t)) { r.x += dx * HB.t; r.y += dy * HB.t; r.z += dz * HB.t; boom = true; r.direct = v; }
        else if (wh) {
          if (r.kind === 'r') { r.x += dx * Math.max(0, RH.t - 0.1); r.y += dy * Math.max(0, RH.t - 0.1); r.z += dz * Math.max(0, RH.t - 0.1); boom = true; }
          else {
            const dn = r.vx * RH.nx + r.vy * RH.ny + r.vz * RH.nz, e = d.bounce || 0.45;
            r.x += dx * Math.max(0, RH.t - 0.05); r.y += dy * Math.max(0, RH.t - 0.05); r.z += dz * Math.max(0, RH.t - 0.05);
            r.vx = (r.vx - (1 + e) * dn * RH.nx) * 0.75; r.vy = (r.vy - (1 + e) * dn * RH.ny) * 0.75; r.vz = (r.vz - (1 + e) * dn * RH.nz) * 0.75;
            if (Math.abs(dn) > 1.5) W.ev.push(['bn', r.id]);
            r.bounce++;
          }
        } else { r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt; }
      }
      if (r.y < M.killY) { W.projs.splice(i, 1); W.ev.push(['px', r.id]); continue; }
      if (boom) { W.projs.splice(i, 1); explode(W, r); }
    }
  }
  function explode(W, r) {
    const d = r.d, a = W.players[r.o];
    W.ev.push(['ex', r.id, +r.x.toFixed(2), +r.y.toFixed(2), +r.z.toFixed(2), d.splash]);
    hearAt(W, r.x, r.y, r.z, a, 50);
    for (const p of W.players) {
      if (!p || !p.alive) continue;
      const cy = p.y + 0.9, dx = p.x - r.x, dy = cy - r.y, dz = p.z - r.z, dist = Math.hypot(dx, dy, dz);
      if (dist > d.splash) continue;
      if (!clearLine(W.M, r.x, r.y + 0.05, r.z, p.x, cy, p.z) && !clearLine(W.M, r.x, r.y + 0.05, r.z, p.x, p.y + 1.5, p.z)) continue;
      const k = 1 - dist / d.splash;
      let dmg = (r.direct === p ? d.dmg : 0) + d.splashDmg * (0.35 + 0.65 * k);
      if (p === a) dmg *= d.selfMul == null ? 0.35 : d.selfMul;
      const kb = (d.knock || 10) * k * (p === a ? 1.3 : 0.7), l = Math.max(0.3, dist);
      const kx = dx / l * kb, kz = dz / l * kb, ky = Math.max(2, dy / l * kb + kb * 0.45);
      p.vx += kx; p.vz += kz; p.vy += ky; p.onGround = false;
      if (p.remote) W.ev.push(['kb', p.slot, +kx.toFixed(2), +ky.toFixed(2), +kz.toFixed(2)]);
      if (W.auth) hurt(W, p, dmg, a, r.kind === 'g' ? W.G.nade : (a && a.weps[0] ? a.weps[0].k : ''), false, dx, dz, true);
    }
  }

  function hearShot(W, p) { hearAt(W, p.x, p.y + 1, p.z, p, W.G.hearR || 40); }
  function hearAt(W, x, y, z, src, R) {
    for (const q of W.players) if (q && q.ai && q.alive && q !== src && (!src || !W.teams || q.team !== src.team)) { const d = Math.hypot(q.x - x, q.z - z); if (d < R) q.ai.hear(W, src, x, y, z, d); }
  }

  function checkEnd(W) {
    if (W.over) return;
    const m = W.mode;
    let done = W.time <= 0;
    if (!done && m.limit) {
      if (W.teams) done = W.teamScore[0] >= m.limit || W.teamScore[1] >= m.limit;
      else done = W.players.some(p => p && p.kills >= m.limit);
    }
    if (done) { W.over = true; W.overT = W.t; W.ev.push(['ov']); }
  }

  function zoneStep(W, dt) {
    const m = W.mode;
    if (!m.zone || !W.M.zones.length) return;
    const Z = W.zone;
    Z.t -= dt;
    if (Z.t <= 0) { Z.i = (Z.i + 1 + Math.floor(W.rng() * Math.max(1, W.M.zones.length - 1))) % W.M.zones.length; Z.t = m.zoneTime || 60; W.ev.push(['zn', Z.i]); }
    const z = W.M.zones[Z.i];
    const inZ = [0, 0];
    for (const p of W.players) {
      if (!p || !p.alive) continue;
      if (Math.hypot(p.x - z.x, p.z - z.z) < z.r && p.y > z.y - 1.5 && p.y < z.y + 4) { inZ[p.team]++; p.inZone = true; } else p.inZone = false;
    }
    Z.own = inZ[0] && !inZ[1] ? 0 : inZ[1] && !inZ[0] ? 1 : inZ[0] && inZ[1] ? 2 : -1;
    Z.acc += dt;
    if (Z.acc >= 1) {
      Z.acc -= 1;
      if (Z.own === 0 || Z.own === 1) { W.teamScore[Z.own] += 1; for (const p of W.players) if (p && p.alive && p.inZone && p.team === Z.own) p.score += 10; }
    }
    checkEnd(W);
  }

  function mkWorld(G, mapDef, o) {
    const M = G.mapCache[mapDef.key] || (G.mapCache[mapDef.key] = compileMap(mapDef));
    const mode = G.modes.find(m => m.key === o.mode) || G.modes[0];
    const W = {
      G, M, mode, teams: !!mode.teams, t: 0, tick: 0, players: [], projs: [], pid: 0, ev: [], rng: mkRng(o.seed || 1), auth: o.auth !== false, time: mode.time, over: false, overT: 0,
      teamScore: [0, 0], zone: { i: 0, t: mode.zoneTime || 60, own: -1, acc: 0 }, onClaim: null, onProj: null, pickups: M.pickups.map((q, i) => ({ i, k: q.k, x: q.x, y: q.y, z: q.z, up: true, t: 0 }))
    };
    if (mode.zone && M.zones.length) W.zone.i = Math.floor(W.rng() * M.zones.length);
    if (!M.nav) M.nav = buildNav(W);
    return W;
  }

  function pickupStep(W, dt) {
    const G = W.G;
    for (const k of W.pickups) {
      if (!k.up) { k.t -= dt; if (k.t <= 0) { k.up = true; W.ev.push(['pu', k.i, 1]); } continue; }
      for (const p of W.players) {
        if (!p || !p.alive || Math.abs(p.x - k.x) > 0.9 || Math.abs(p.z - k.z) > 0.9 || Math.abs(p.y + 0.5 - k.y) > 1.6) continue;
        if (G.pickup(W, p, k.k)) { k.up = false; k.t = G.pickupRespawn || 20; W.ev.push(['pu', k.i, 0, p.slot, k.k]); break; }
      }
    }
  }

  function stepWorld(W) {
    const dt = STEP, G = W.G;
    W.t += dt; W.tick++;
    if (W.over) { for (const p of W.players) if (p && p.alive) { p.in.fire = false; p.vx *= 0.9; p.vz *= 0.9; } return; }
    W.time -= dt;
    for (const p of W.players) {
      if (!p) continue;
      if (p.ai) p.ai.think(W, dt);
      if (p.remote) {
        if (!W.auth || !p.inGame) continue;
        if (p.alive) { if (p.spawnProt > 0) p.spawnProt -= dt; if (W.t - p.lastHurt > G.regenDelay && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + G.regenRate * dt); }
        else { p.respawnT -= dt; if (p.respawnT <= 0 && (p.wantSpawn || p.respawnT < -(G.autoSpawn || 30))) spawnPlayer(W, p); }
        continue;
      }
      if (!p.inGame) continue;
      if (!p.alive) {
        p.respawnT -= dt;
        if (W.auth && p.respawnT <= 0 && (p.wantSpawn || p.bot || p.respawnT < -(G.autoSpawn || 30))) spawnPlayer(W, p);
        continue;
      }
      wishMove(W, p, dt);
      physStep(W, p, dt);
      weaponStep(W, p, dt);
      if (W.auth && p.y < W.M.killY) hurt(W, p, 999, null, 'fall', false, 0, 0);
      if (W.auth && p.alive && W.t - p.lastHurt > G.regenDelay && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + G.regenRate * dt);
    }
    if (W.auth) { projStep(W, dt); zoneStep(W, dt); if (W.pickups.length) pickupStep(W, dt); checkEnd(W); }
  }
  function buildNav(W) {
    const M = W.M, P = W.G.phys, S = 1.25, r = P.R, H = P.H;
    const jumpH = P.jumpV * P.jumpV / (2 * P.g) - 0.12;
    const gx = Math.max(1, Math.floor((M.x1 - M.x0) / S)), gz = Math.max(1, Math.floor((M.z1 - M.z0) / S));
    const X = [], Y = [], Z = [], CI = [], cells = new Array(gx * gz);
    const surf = (x, z, mg) => {
      const hs = [];
      if (mg == null) mg = 0.05;
      if (M.def.floor !== null) hs.push(M.floorY);
      const L = M.query(x - 0.1, z - 0.1, x + 0.1, z + 0.1);
      for (let k = 0; k < L.length; k++) { const s = M.solids[L[k]]; if (x <= s.x0 + mg || x >= s.x1 - mg || z <= s.z0 + mg || z >= s.z1 - mg) continue; hs.push(s.t === 1 ? rampH(s, x, z) : s.y1); }
      return hs;
    };
    for (let ix = 0; ix < gx; ix++) for (let iz = 0; iz < gz; iz++) {
      const x = M.x0 + (ix + 0.5) * S, z = M.z0 + (iz + 0.5) * S, hs = surf(x, z).sort((a, b) => a - b), L = [];
      let last = -1e9;
      for (const h of hs) {
        if (h - last < 0.3) continue;
        if (overlapAt(M, x, h + 0.03, z, r * 0.6, H - 0.06, P.stepH)) continue;
        last = h;
        L.push(X.length); X.push(x); Y.push(h); Z.push(z); CI.push(ix + iz * gx);
      }
      cells[ix + iz * gx] = L;
    }
    const N = X.length, adj = Array.from({ length: N }, () => []);
    const near = (x, z, y, tol) => { for (const h of surf(x, z, -0.08)) if (Math.abs(h - y) <= tol) return true; return false; };
    for (let i = 0; i < N; i++) {
      const ci = CI[i], ix = ci % gx, iz = (ci - ix) / gx;
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        if (!dx && !dz) continue;
        const jx = ix + dx, jz = iz + dz;
        if (jx < 0 || jz < 0 || jx >= gx || jz >= gz) continue;
        for (const j of cells[jx + jz * gx]) {
          const dy = Y[j] - Y[i];
          if (dy > jumpH || dy < -9) continue;
          const mx = (X[i] + X[j]) / 2, mz = (Z[i] + Z[j]) / 2, d = Math.hypot(X[j] - X[i], Z[j] - Z[i], dy * 0.5);
          const slope = Math.abs(dy) <= 1.0 && Math.abs(dy) > P.stepH + 0.02 && near(mx, mz, (Y[i] + Y[j]) / 2, 0.12);
          if (Math.abs(dy) <= P.stepH + 0.02 || slope) {
            if (!near(mx, mz, (Y[i] + Y[j]) / 2, P.stepH * 0.6 + 0.05)) continue;
            let ob = overlapAt(M, mx, Math.max(Y[i], Y[j]) + 0.03, mz, r * 0.65, H - 0.1, P.stepH), extra = 0;
            if (ob && ob.t === 0 && ob.y1 - Math.max(Y[i], Y[j]) <= P.stepH + 0.01 && !overlapAt(M, mx, ob.y1 + 0.03, mz, r * 0.65, H - 0.1, P.stepH)) { ob = null; extra = 0.3; }
            if (ob) continue;
            if (dx && dz && (overlapAt(M, X[i] + dx * S * 0.5, Y[i] + 0.03, Z[i], r * 0.7, H - 0.1, P.stepH) || overlapAt(M, X[i], Y[i] + 0.03, Z[i] + dz * S * 0.5, r * 0.7, H - 0.1, P.stepH))) continue;
            adj[i].push(j, d + extra, 0);
          } else if (dy > 0) {
            if (dx && dz) continue;
            if (overlapAt(M, X[i], Y[j] + 0.08, Z[i], r * 0.65, H - 0.1, 0.05) || overlapAt(M, mx, Y[j] + 0.08, mz, r * 0.65, H - 0.1, 0.05)) continue;
            adj[i].push(j, d + 1.2, 1);
          } else {
            if (overlapAt(M, mx, Y[i] + 0.05, mz, r * 0.65, H - 0.1, P.stepH)) continue;
            if (overlapAt(M, X[j], Y[j] + 0.1, Z[j], r * 0.65, Y[i] - Y[j] + H - 0.15, 0.05)) continue;
            adj[i].push(j, d + 0.4 + (-dy > 4 ? 1.5 : 0), 2);
          }
        }
      }
    }
    const pass = (i, j) => {
      const L = Math.hypot(X[j] - X[i], Z[j] - Z[i]), n = Math.ceil(L / 0.25);
      let y = Y[i];
      for (let k = 1; k < n; k++) {
        const t = k / n, x = X[i] + (X[j] - X[i]) * t, z = Z[i] + (Z[j] - Z[i]) * t;
        const base = y;
        let ob = overlapAt(M, x, y + 0.03, z, r * 0.65, H - 0.1, P.stepH), st = 0;
        while (ob && st++ < 4) { if (ob.t !== 0 || ob.y1 - base > P.stepH + 0.01) return false; y = ob.y1; ob = overlapAt(M, x, y + 0.03, z, r * 0.65, H - 0.1, P.stepH); }
        if (ob) return false;
        if (st) continue;
        let sup = -1e9;
        for (const h of surf(x, z, -0.08)) if (h <= y + P.stepH + 0.02 && h > sup) sup = h;
        if (y - sup > 0.6) return false;
        y = sup;
      }
      return Math.abs(y - Y[j]) <= P.stepH + 0.02;
    };
    for (let i = 0; i < N; i++) {
      const ci = CI[i], ix = ci % gx, iz = (ci - ix) / gx;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ax = ix + dx, az = iz + dz, bx = ix + 2 * dx, bz = iz + 2 * dz;
        if (bx < 0 || bz < 0 || bx >= gx || bz >= gz) continue;
        if (cells[ax + az * gx].some(j => Math.abs(Y[j] - Y[i]) < 1.2)) continue;
        for (const j of cells[bx + bz * gx]) { if (Math.abs(Y[j] - Y[i]) > 1.6) continue; if (pass(i, j)) adj[i].push(j, S * 2 + 0.4, 0); }
      }
    }
    const reach = new Uint8Array(N), comp = new Int32Array(N).fill(-1);
    if (N) {
      const rev = Array.from({ length: N }, () => []);
      for (let i = 0; i < N; i++) for (let k = 0; k < adj[i].length; k += 3) rev[adj[i][k]].push(i);
      const flood = (s0, fw, mark) => { const st = [s0]; mark[s0] = 1; let n = 1; while (st.length) { const i = st.pop(); if (fw) { const A = adj[i]; for (let k = 0; k < A.length; k += 3) { const j = A[k]; if (!mark[j]) { mark[j] = 1; n++; st.push(j); } } } else for (const j of rev[i]) if (!mark[j]) { mark[j] = 1; n++; st.push(j); } } return n; };
      const cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2;
      const seeds = Array.from({ length: N }, (_, i) => i).sort((a, b) => Math.hypot(X[a] - cx, Z[a] - cz) + Y[a] * 2 - Math.hypot(X[b] - cx, Z[b] - cz) - Y[b] * 2);
      let best = null, bn = 0;
      for (let t = 0; t < Math.min(8, N); t++) {
        const sd = seeds[Math.floor(t * N / 8)] != null ? seeds[Math.floor(t * N / 8)] : seeds[t];
        if (best && best[sd]) continue;
        const f = new Uint8Array(N), r2 = new Uint8Array(N);
        flood(sd, true, f); flood(sd, false, r2);
        let n = 0; for (let i = 0; i < N; i++) if (f[i] && r2[i]) { f[i] = 2; n++; }
        if (n > bn) { bn = n; best = f; }
        if (bn > N * 0.6) break;
      }
      let cid = 1;
      for (let i = 0; i < N; i++) if (best[i] === 2) { reach[i] = 1; comp[i] = 0; }
      for (let s0 = 0; s0 < N; s0++) {
        if (comp[s0] >= 0) continue;
        const st = [s0]; comp[s0] = cid;
        while (st.length) { const i = st.pop(); const A = adj[i]; for (let k = 0; k < A.length; k += 3) { const j = A[k]; if (comp[j] < 0) { comp[j] = cid; st.push(j); } } for (const j of rev[i]) if (comp[j] < 0) { comp[j] = cid; st.push(j); } }
        cid++;
      }
    }
    const nav = { S, gx, gz, X, Y, Z, adj, cells, N, reach, comp, jumpH, g: new Float32Array(N), f: new Float32Array(N), came: new Int32Array(N), st: new Uint32Array(N), cl: new Uint32Array(N), sn: 0, heap: new Int32Array(N + 8) };
    nav.good = [];
    for (let i = 0; i < N; i++) if (reach[i]) nav.good.push(i);
    return nav;
  }
  function navNear(nav, M, x, y, z, rad) {
    const ix = Math.floor((x - M.x0) / nav.S), iz = Math.floor((z - M.z0) / nav.S);
    let best = -1, bd = 1e9;
    const R = rad || 1;
    for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
      const jx = ix + dx, jz = iz + dz;
      if (jx < 0 || jz < 0 || jx >= nav.gx || jz >= nav.gz) continue;
      for (const j of nav.cells[jx + jz * nav.gx]) {
        const dy = nav.Y[j] - y;
        if (dy > 1.0 || dy < -2.5) continue;
        const d = Math.hypot(nav.X[j] - x, nav.Z[j] - z) + Math.abs(dy) * 1.5 + (nav.reach[j] ? 0 : 6);
        if (d < bd) { bd = d; best = j; }
      }
    }
    if (best < 0 && R < 3) return navNear(nav, M, x, y, z, R + 2);
    return best;
  }
  function navPath(nav, a, b, out) {
    out.length = 0;
    if (a < 0 || b < 0) return out;
    if (a === b) { out.push(b); return out; }
    if (nav.comp[a] !== nav.comp[b] && nav.comp[b] !== 0) return out;
    const { X, Y, Z, adj, g, f, came, st, cl, heap } = nav;
    const sn = ++nav.sn;
    let hn = 0;
    const push = i => { let k = hn++; heap[k] = i; while (k > 0) { const pk = (k - 1) >> 1; if (f[heap[pk]] <= f[heap[k]]) break; const q = heap[pk]; heap[pk] = heap[k]; heap[k] = q; k = pk; } };
    const pop = () => { const top = heap[0]; heap[0] = heap[--hn]; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < hn && f[heap[l]] < f[heap[m]]) m = l; if (r < hn && f[heap[r]] < f[heap[m]]) m = r; if (m === k) break; const q = heap[m]; heap[m] = heap[k]; heap[k] = q; k = m; } return top; };
    const hx = X[b], hy = Y[b], hz = Z[b];
    g[a] = 0; f[a] = Math.hypot(X[a] - hx, Y[a] - hy, Z[a] - hz); st[a] = sn; came[a] = -1; push(a);
    let found = false, it = 0;
    while (hn > 0 && it++ < 4000) {
      const i = pop();
      if (cl[i] === sn) continue;
      cl[i] = sn;
      if (i === b) { found = true; break; }
      const A = adj[i];
      for (let k = 0; k < A.length; k += 3) {
        const j = A[k];
        if (cl[j] === sn) continue;
        const ng = g[i] + A[k + 1];
        if (st[j] !== sn || ng < g[j]) { st[j] = sn; g[j] = ng; came[j] = i; f[j] = ng + Math.hypot(X[j] - hx, Y[j] - hy, Z[j] - hz); if (hn < heap.length) push(j); }
      }
    }
    if (!found) return out;
    for (let i = b; i >= 0; i = came[i]) { out.push(i); if (i === a) break; }
    out.reverse();
    return out;
  }

  const BOTL = [
    { react: [0.55, 0.8], turn: 3.4, k: 6, acq: 0.17, settle: 1.6, jitter: 0.05, head: 0.04, tol: 1.6, strafe: 0.2, hop: 0, smart: 0, track: 0.35, fov: 1.0, comp: 0.1, tap: 0.45, think: 0.25 },
    { react: [0.36, 0.5], turn: 6, k: 8, acq: 0.11, settle: 2.6, jitter: 0.03, head: 0.14, tol: 1.3, strafe: 0.5, hop: 0.25, smart: 0.35, track: 0.6, fov: 1.15, comp: 0.35, tap: 0.3, think: 0.18 },
    { react: [0.3, 0.42], turn: 8.5, k: 10, acq: 0.075, settle: 3.2, jitter: 0.02, head: 0.25, tol: 1.15, strafe: 0.8, hop: 0.6, smart: 0.65, track: 0.75, fov: 1.25, comp: 0.5, tap: 0.2, think: 0.13 },
    { react: [0.15, 0.25], turn: 15, k: 16, acq: 0.03, settle: 6, jitter: 0.0065, head: 0.8, tol: 0.95, strafe: 1, hop: 1, smart: 1, track: 0.95, fov: 1.35, comp: 0.9, tap: 0.1, think: 0.07 }
  ];
  const gauss = r => { let s = 0; for (let i = 0; i < 4; i++) s += r(); return (s - 2) / 0.58; };

  function mkBrain(W0, p) {
    const B = {
      t: null, vis: false, visT: -9, react: 0, lx: 0, ly: 0, lz: 0, lt: -99, hx: 0, hy: 0, hz: 0, ht: -99, path: [], pi: 0, goal: -1, repath: 0, prog: 0, px: 0, pz: 0, stuck: 0,
      ey: 0, ep: 0, ny: 0, np: 0, nT: 0, sd: 1, sdT: 0, jT: 0, thT: 0, burst: 0, burstT: 0, aimZ: 1, last: null, tvY: 0, tvP: 0, ptY: 0, ptP: 0, nadeT: 0, hunt: 0, slideT: 0, look: 0,
      reset(W) { B.t = null; B.vis = false; B.path.length = 0; B.goal = -1; B.repath = 0; B.stuck = 0; B.px = p.x; B.pz = p.z; B.prog = W.t; B.lt = -99; B.ey = B.ep = 0; },
      hear(W, src, x, y, z, d) {
        const L = BOTL[p.diff] || BOTL[1], rr = W.rng;
        if (rr() > 0.4 + L.smart * 0.6) return;
        const e = d * 0.12;
        B.hx = x + (rr() - 0.5) * e; B.hy = y; B.hz = z + (rr() - 0.5) * e; B.ht = W.t;
      },
      hurtBy(W, a) {
        if (!a || !a.alive) return;
        B.hx = a.x; B.hy = a.y; B.hz = a.z; B.ht = W.t;
        if (!B.t || !B.vis) B.look = W.t;
      },
      think(W, dt) { botThink(W, p, B, dt); }
    };
    return B;
  }

  function botVisible(W, p, q, L) {
    const ex = p.x, ey = eyeY(W, p), ez = p.z;
    const dx = q.x - ex, dz = q.z - ez, d = Math.hypot(dx, dz);
    if (d > (W.G.botSight || 90)) return 0;
    const fx = -Math.sin(p.in.yaw), fz = -Math.cos(p.in.yaw);
    const cosA = (dx * fx + dz * fz) / Math.max(0.01, d);
    if (d > 4 && cosA < Math.cos(L.fov)) return 0;
    const h = q.crouch ? W.G.phys.HC : W.G.phys.H;
    if (clearLine(W.M, ex, ey, ez, q.x, q.y + h - 0.15, q.z)) return 2;
    if (clearLine(W.M, ex, ey, ez, q.x, q.y + h * 0.55, q.z)) return 1;
    return 0;
  }

  const NV = { x: 0, z: 0 };
  function botThink(W, p, B, dt) {
    const I = p.in, G = W.G, L = BOTL[p.diff] || BOTL[1], rr = W.rng, nav = W.M.nav;
    if (!p.alive) { I.fire = false; I.ads = false; I.jump = false; I.crouch = false; I.mx = I.mz = 0; if (p.respawnT < 0.3 && rr() < 0.02 && G.classes.length > 1) p.nextCls = botClass(W, p); return; }
    if (W.over) { I.fire = false; I.mx = I.mz = 0; return; }
    B.thT -= dt;
    if (B.thT <= 0) {
      B.thT = L.think * (0.7 + rr() * 0.6);
      let best = null, bs = -1e9, bv = 0;
      for (const q of W.players) {
        if (!q || q === p || !q.alive || (W.teams && q.team === p.team)) continue;
        const v = botVisible(W, p, q, L);
        if (!v) continue;
        const d = Math.hypot(q.x - p.x, q.z - p.z);
        let s = -d + (q === B.t ? 12 : 0) + (q.slot === p.lastAtt && W.t - p.lastHurt < 2 ? 10 : 0) - q.hp * 0.04;
        if (s > bs) { bs = s; best = q; bv = v; }
      }
      if (best) {
        if (best !== B.t || W.t - B.visT > 0.6) { B.react = W.t + L.react[0] + rr() * (L.react[1] - L.react[0]); const a = L.acq * (0.6 + rr() * 0.8); B.ey = (rr() < 0.5 ? -1 : 1) * a; B.ep = (rr() - 0.35) * a * 0.6; B.aimZ = rr() < L.head ? 2 : 1; B.burst = 0; }
        if (best !== B.t) B.tvY = B.tvP = 0;
        B.t = best; B.vis = true; B.visT = W.t; B.lx = best.x; B.ly = best.y; B.lz = best.z; B.lt = W.t; B.vlevel = bv;
      } else { B.vis = false; if (B.t && (!B.t.alive || W.t - B.visT > 3)) B.t = null; }
      if (!B.vis) {
        for (const q of W.players) {
          if (!q || q === p || !q.alive || (W.teams && q.team === p.team)) continue;
          const d = Math.hypot(q.x - p.x, q.z - p.z), sp = Math.hypot(q.vx, q.vz);
          if (d < (G.footR || 16) && q.onGround && sp > 4.5 && !q.crouch && rr() < 0.25 + L.smart * 0.5) { B.hx = q.x + (rr() - 0.5) * 3; B.hy = q.y; B.hz = q.z + (rr() - 0.5) * 3; B.ht = W.t; }
        }
      }
    }
    const w = p.weps[p.cur], d = w ? w.d : null;
    const tq = B.t && B.t.alive ? B.t : null;
    const engage = tq && B.vis && W.t >= B.react;
    const ex = p.x, ey = eyeY(W, p), ez = p.z;
    let wantYaw = I.yaw, wantPit = 0, aimOn = false;
    if (tq && B.vis) {
      const h = tq.crouch ? G.phys.HC : G.phys.H;
      let ax = tq.x, az = tq.z, ay = tq.y + (B.aimZ === 2 ? G.headY(h) : h * 0.55);
      if (d && d.kind === 'rocket') { const dist = Math.hypot(ax - ex, az - ez), tt = dist / d.projSpeed; ax += tq.vx * tt * L.track; az += tq.vz * tt * L.track; ay = tq.onGround ? tq.y + 0.25 : tq.y + 0.6 + tq.vy * tt * 0.5; }
      const dx = ax - ex, dy = ay - ey, dz = az - ez, hd = Math.hypot(dx, dz);
      const ty = Math.atan2(-dx, -dz), tp = Math.atan2(dy, hd);
      const ry = angD(ty, B.ptY), rp = tp - B.ptP;
      B.tvY = damp(B.tvY, ry / dt, 10, dt); B.tvP = damp(B.tvP, rp / dt, 10, dt);
      B.ptY = ty; B.ptP = tp;
      B.nT -= dt;
      if (B.nT <= 0) { B.nT = 0.12 + rr() * 0.12; B.ny = gauss(rr) * L.jitter; B.np = gauss(rr) * L.jitter * 0.7; }
      B.ey = damp(B.ey, 0, L.settle, dt); B.ep = damp(B.ep, 0, L.settle, dt);
      wantYaw = ty + B.ey + B.ny; wantPit = tp + B.ep + B.np - p.kick * L.comp;
      aimOn = true;
      B.dist = Math.hypot(dx, dy, dz);
    } else if (B.path.length && B.pi < B.path.length) {
      const j = B.path[Math.min(B.path.length - 1, B.pi + 1)];
      const dx = nav.X[j] - p.x, dz = nav.Z[j] - p.z;
      if (Math.hypot(dx, dz) > 0.3) wantYaw = Math.atan2(-dx, -dz);
      wantPit = 0;
      if (W.t - B.ht < 2.5 && L.smart > 0.3) { wantYaw = Math.atan2(-(B.hx - p.x), -(B.hz - p.z)); wantPit = Math.atan2(B.hy + 1 - ey, Math.hypot(B.hx - p.x, B.hz - p.z)); }
    }
    if (!(tq && B.vis) && L.smart >= 0.9 && W.t - B.lt < 2 && B.t) { const hy = G.headY(G.phys.H); wantYaw = Math.atan2(-(B.lx - p.x), -(B.lz - p.z)); wantPit = Math.atan2(B.ly + hy - ey, Math.hypot(B.lx - p.x, B.lz - p.z)); }
    const allowAim = !tq || !B.vis || W.t >= B.react - 0.05;
    if (allowAim) {
      const ff = aimOn ? L.track : 0;
      const eY = angD(wantYaw, I.yaw), eP = wantPit - I.pitch;
      const ry = clamp(eY * L.k + B.tvY * ff, -L.turn, L.turn), rp = clamp(eP * L.k + B.tvP * ff, -L.turn * 0.7, L.turn * 0.7);
      I.yaw += ry * dt; I.pitch = clamp(I.pitch + rp * dt, -1.4, 1.4);
    } else if (tq) {
      const eY = angD(wantYaw, I.yaw);
      I.yaw += clamp(eY * 2, -1.2, 1.2) * dt;
    }
    I.fire = false; I.ads = false;
    if (engage && d && d.kind !== 'melee' && w.mag > 0 && p.reloadT <= 0 && p.swapT <= 0) {
      const dist = B.dist || 10;
      const cp = Math.cos(I.pitch + p.kick), ay = I.yaw + p.kickYaw;
      const fx = -Math.sin(ay) * cp, fy = Math.sin(I.pitch + p.kick), fz = -Math.cos(ay) * cp;
      const h = tq.crouch ? G.phys.HC : G.phys.H;
      const cx = tq.x - ex, cy = tq.y + (B.aimZ === 2 ? G.headY(h) : h * 0.55) - ey, cz = tq.z - ez, cl = Math.hypot(cx, cy, cz);
      const err = Math.acos(clamp((fx * cx + fy * cy + fz * cz) / cl, -1, 1));
      const rad = Math.atan((B.aimZ === 2 ? 0.2 : 0.32) / cl) * L.tol;
      const sp = spreadNow(W, p, d);
      const scoped = d.scope || (d.botAds && dist > (d.botAdsR || 14));
      if (scoped) I.ads = true;
      const ready = !scoped || p.adsF > 0.85;
      const longR = dist > (d.botRange || 20) * 1.6;
      if (d.auto && longR && L.tap > 0) {
        B.burstT -= dt;
        if (B.burstT <= 0) { B.burst = B.burst ? 0 : 1; B.burstT = B.burst ? 0.18 + rr() * 0.15 : L.tap + rr() * 0.2; }
      } else B.burst = 1;
      const okSpread = d.pellets ? dist < (d.botRange || 8) * 1.8 : sp < rad * 4 + 0.02 || dist < 12;
      if (ready && err < rad + (d.auto ? sp * 0.3 : 0) && B.burst && okSpread) I.fire = true;
      if (d.kind === 'rocket' && dist < 3.5 && p.weps[1] && L.smart > 0.5) { I.slot = 1; I.slotN++; }
    }
    if (w && p.weps.length > 2 && L.smart > 0.5 && engage && w.mag === 0 && p.cur === 0 && p.weps[1] && p.weps[1].mag > 0 && (B.dist || 99) < 18) { I.slot = 1; I.slotN++; }
    if (w && p.cur === 1 && (!engage || w.mag === 0) && p.weps[0] && (p.weps[0].mag > 0 || p.weps[0].res > 0) && p.swapT <= 0 && rr() < 0.05) { I.slot = 0; I.slotN++; }
    if (w && d && d.kind !== 'melee' && !engage && w.mag < d.mag * 0.5 && w.res > 0 && p.reloadT <= 0 && rr() < 0.05) I.reloadN++;
    if (engage && G.melee && (B.dist || 99) < 2.2 && (!w || w.mag === 0 || d.kind === 'melee' || L.smart > 0.8 && tq.hp <= G.weapons[G.melee].dmg)) I.meleeN++;
    if (G.nade && p.nades > 0 && L.smart > 0.3) {
      B.nadeT -= dt;
      const lastD = Math.hypot(B.lx - p.x, B.lz - p.z);
      if (B.nadeT <= 0 && tq && W.t - B.lt < 2.5 && lastD > 7 && lastD < 26 && (!B.vis || rr() < 0.02) && rr() < 0.04 * L.smart + 0.01) {
        B.nadeT = 4 + rr() * 4;
        const dx = B.lx - p.x, dz = B.lz - p.z, hd = Math.hypot(dx, dz), v = G.weapons[G.nade].projSpeed;
        I.yaw = Math.atan2(-dx, -dz) + (rr() - 0.5) * (0.12 - L.smart * 0.08);
        const g = G.weapons[G.nade].projGrav, s2 = clamp(g * hd / (v * v), -1, 1);
        I.pitch = clamp(0.5 * Math.asin(s2) - 0.12 + (B.ly - p.y) / Math.max(4, hd) * 0.6, -0.4, 1.0);
        I.nadeN++;
      }
    }
    botMove(W, p, B, L, dt, engage, tq);
  }

  function botClass(W, p) {
    const G = W.G, n = G.classes.length;
    if (G.botClassW) { let s = 0; for (const x of G.botClassW) s += x; let r = W.rng() * s; for (let i = 0; i < n; i++) { r -= G.botClassW[i]; if (r <= 0) return i; } }
    return Math.floor(W.rng() * n);
  }

  function botGoal(W, p, B, L) {
    const nav = W.M.nav, rr = W.rng, G = W.G;
    if (!nav.good.length) return -1;
    if (W.mode.zone && W.M.zones.length) {
      const z = W.M.zones[W.zone.i];
      if (rr() < 0.95) { const a = rr() * TAU, r = rr() * z.r * 0.6; const j = navNear(nav, W.M, z.x + Math.cos(a) * r, z.y, z.z + Math.sin(a) * r, 2); if (j >= 0) return j; }
    }
    if (W.t - B.ht < 4 && rr() < 0.5 + L.smart * 0.4) return navNear(nav, W.M, B.hx, B.hy, B.hz, 2);
    if (W.t - B.lt < 6 && rr() < 0.7) return navNear(nav, W.M, B.lx, B.ly, B.lz, 2);
    const w = p.weps[0];
    if (W.pickups.length && (p.nades === 0 || (w && w.res < w.d.mag) || p.hp < p.maxHp * 0.5) && rr() < 0.7) {
      let best = null, bd = 1e9;
      for (const k of W.pickups) if (k.up) { const dd = Math.hypot(k.x - p.x, k.z - p.z); if (dd < bd) { bd = dd; best = k; } }
      if (best && bd < 45) return navNear(nav, W.M, best.x, best.y, best.z, 2);
    }
    if (p.hp < p.maxHp * 0.45 && L.smart > 0.5 && rr() < 0.6) {
      let best = -1, bd = -1;
      for (let k = 0; k < 6; k++) { const j = nav.good[Math.floor(rr() * nav.good.length)]; let md = 1e9; for (const q of W.players) if (q && q.alive && q !== p && (!W.teams || q.team !== p.team)) md = Math.min(md, Math.hypot(q.x - nav.X[j], q.z - nav.Z[j])); if (md > bd && Math.hypot(nav.X[j] - p.x, nav.Z[j] - p.z) < 25) { bd = md; best = j; } }
      if (best >= 0) return best;
    }
    const cx = (W.M.x0 + W.M.x1) / 2, cz = (W.M.z0 + W.M.z1) / 2, span = Math.max(W.M.x1 - W.M.x0, W.M.z1 - W.M.z0);
    let best = -1, bs = -1e9;
    for (let k = 0; k < 5; k++) {
      const j = nav.good[Math.floor(rr() * nav.good.length)];
      const s = -Math.hypot(nav.X[j] - cx, nav.Z[j] - cz) / span * 20 + nav.Y[j] * 0.8 + rr() * 14 - (Math.hypot(nav.X[j] - p.x, nav.Z[j] - p.z) < 8 ? 15 : 0);
      if (s > bs) { bs = s; best = j; }
    }
    return best;
  }

  function botMove(W, p, B, L, dt, engage, tq) {
    const I = p.in, nav = W.M.nav, rr = W.rng, P = W.G.phys;
    let wx = 0, wz = 0;
    I.jump = false;
    const d = p.weps[p.cur] ? p.weps[p.cur].d : null;
    const pref = d ? (d.botRange || 18) : 18;
    let chase = true;
    if (engage && L.smart >= 0.9 && p.hp < p.maxHp * 0.3 && tq.hp > p.hp * 1.5 && p.weps[p.cur] && p.weps[p.cur].d.kind !== 'melee' && Math.hypot(tq.x - p.x, tq.z - p.z) > 6) {
      if (!B.flee || W.t - B.flee > 3) { B.flee = W.t; let best = -1, bd = -1; for (let k = 0; k < 8; k++) { const j = nav.good[Math.floor(rr() * nav.good.length)]; const d0 = Math.hypot(nav.X[j] - p.x, nav.Z[j] - p.z); if (d0 > 18 || d0 < 5) continue; const dq = Math.hypot(nav.X[j] - tq.x, nav.Z[j] - tq.z); if (dq > bd && !clearLine(W.M, nav.X[j], nav.Y[j] + 1.4, nav.Z[j], tq.x, tq.y + 1.4, tq.z)) { bd = dq; best = j; } } if (best >= 0) { B.goal = best; navPath(nav, navNear(nav, W.M, p.x, p.y, p.z), best, B.path); B.pi = 0; B.repath = 2.5; } }
      engage = false;
    }
    const Z = W.mode.zone && W.M.zones.length ? W.M.zones[W.zone.i] : null, zd = Z ? Math.hypot(p.x - Z.x, p.z - Z.z) : 0;
    if (engage) {
      const dist = Math.hypot(tq.x - p.x, tq.z - p.z);
      chase = dist > pref * 1.35 || Math.abs(tq.y - p.y) > 3.5 && dist > 6;
      if (Z) chase = zd > Z.r * 0.75;
      const fx = (tq.x - p.x) / Math.max(0.1, dist), fz = (tq.z - p.z) / Math.max(0.1, dist);
      if (!chase) {
        if (dist < pref * 0.55 && !(d && d.kind === 'melee')) { wx -= fx; wz -= fz; }
        B.sdT -= dt;
        if (B.sdT <= 0 || (Math.abs(p.vx) + Math.abs(p.vz) < 0.5 && p.onGround && rr() < 0.2)) { B.sd = rr() < 0.5 ? -1 : 1; B.sdT = 0.25 + rr() * 0.6; }
        if (rr() < L.strafe * 1.5) { wx += -fz * B.sd; wz += fx * B.sd; }
        else if (rr() > L.strafe) { wx *= 0.3; wz *= 0.3; }
        if (L.hop > 0) { B.jT -= dt; if (B.jT <= 0 && p.onGround) { B.jT = 0.6 + rr() * (2.2 - L.hop); if (rr() < L.hop * 0.55) I.jump = true; } }
        if (d && d.kind === 'melee') { wx = fx; wz = fz; chase = false; }
      }
    }
    if (!engage || chase) {
      B.repath -= dt;
      const want = engage ? (Z ? navNear(nav, W.M, Z.x, Z.y, Z.z, 2) : navNear(nav, W.M, tq.x, tq.y, tq.z)) : -2;
      if (B.repath <= 0 || B.pi >= B.path.length - 1 || (engage && want >= 0 && B.goal !== want && B.repath < 0.6)) {
        const a = navNear(nav, W.M, p.x, p.y, p.z);
        let g = engage ? want : (B.goal >= 0 && B.pi < B.path.length - 1 && B.repath > -4 ? B.goal : botGoal(W, p, B, L));
        if (g === a && !engage) g = botGoal(W, p, B, L);
        B.goal = g;
        navPath(nav, a, g, B.path);
        B.pi = 0; B.repath = 1.2 + rr() * 1.2;
        if (!B.path.length) { B.goal = -1; B.repath = 0.8 + rr() * 0.8; }
      }
      if (B.path.length) {
        let j = B.path[Math.min(B.path.length - 1, B.pi + 1)];
        let dx = nav.X[j] - p.x, dz = nav.Z[j] - p.z, dy = nav.Y[j] - p.y;
        const hd = Math.hypot(dx, dz);
        if (hd < 0.55 + Math.hypot(p.vx, p.vz) * 0.06 && dy < 0.6 && B.pi < B.path.length - 1) { B.pi++; j = B.path[Math.min(B.path.length - 1, B.pi + 1)]; dx = nav.X[j] - p.x; dz = nav.Z[j] - p.z; dy = nav.Y[j] - p.y; }
        const l = Math.max(0.01, Math.hypot(dx, dz));
        wx += dx / l; wz += dz / l;
        if (dy > nav.jumpH + 0.4 && p.onGround && l < 3) { B.repath = 0; B.path.length = 0; }
        if (dy > P.stepH && p.onGround && l < 1.9) I.jump = true;
        else if (!engage) {
          const straight = B.path.length - B.pi > 5;
          if (L.hop > 0.5 && straight && p.onGround && rr() < L.hop && Math.hypot(p.vx, p.vz) > P.speed * 0.7) I.jump = true;
          if (P.slideTime && L.hop > 0.4 && p.onGround && straight && Math.hypot(p.vx, p.vz) > P.speed * 0.85) { B.slideT -= dt; if (B.slideT <= 0) { B.slideT = 1 + rr() * 2; I.crouch = true; B.cr = W.t; } }
        }
      }
    }
    if (I.crouch && W.t - (B.cr || 0) > 0.35) I.crouch = false;
    if (engage && L.smart > 0.6 && d && d.pellets == null && p.onGround && rr() < 0.004 * L.smart && P.H !== P.HC && !chase) { I.crouch = true; B.cr = W.t; }
    let wl = Math.hypot(wx, wz);
    if (wl > 1e-3) { wx /= wl; wz /= wl; }
    if (wl > 1e-3 && p.onGround && Math.hypot(p.vx, p.vz) < 1) B.blk = (B.blk || 0) + dt; else B.blk = Math.max(0, (B.blk || 0) - dt * 2);
    if (B.blk > 0.22 && !(B.sideT > 0)) {
      const M = W.M, r = P.R;
      const ok = sgn => !overlapAt(M, p.x - wz * sgn * 0.7, p.y + 0.05, p.z + wx * sgn * 0.7, r, P.H - 0.05, P.stepH);
      const sg = ok(1) ? 1 : ok(-1) ? -1 : rr() < 0.5 ? 1 : -1;
      B.sideX = -wz * sg; B.sideZ = wx * sg; B.sideT = 0.35 + rr() * 0.2; B.blk = 0;
    }
    if (B.sideT > 0) { B.sideT -= dt; wx = wx * 0.25 + B.sideX; wz = wz * 0.25 + B.sideZ; wl = Math.hypot(wx, wz); if (wl > 1e-3) { wx /= wl; wz /= wl; } }
    const sy = Math.sin(I.yaw), cy = Math.cos(I.yaw);
    I.mz = -(wx * sy + wz * cy);
    I.mx = wx * cy - wz * sy;
    if (!engage && !(B.path.length && B.pi < B.path.length - 1)) { I.mx = I.mz = 0; }
    if (W.t - B.prog > 1.1) {
      const moved = Math.hypot(p.x - B.px, p.z - B.pz);
      if (moved < 0.5 && (Math.abs(I.mx) + Math.abs(I.mz) > 0.3)) { B.stuck++; if (p.onGround) I.jump = true; if (B.stuck > 1) { B.goal = -1; B.repath = 0; B.path.length = 0; B.stuck = 0; } }
      else B.stuck = 0;
      B.px = p.x; B.pz = p.z; B.prog = W.t;
    }
  }
  const COARSE = matchMedia('(pointer: coarse)').matches;
  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.8, 0.62, 0.5], sz = new v.THREE.Vector2();
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, sf = 0, up = 0;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const lw = r.getSize(sz).x || v.w, pr = Math.max(0.45, Math.min(4, d * cw / lw, Math.sqrt(B / (lw * (sz.y || v.h))))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    r.forceContextLoss = () => {};
    size(); api.on(window, 'resize', size);
    const F = { get lvl() { return lvl; }, force: -1, set };
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if (performance.now() - chk > 500) { chk = performance.now(); size(); }
      if (F.force >= 0) { if (lvl !== F.force) set(F.force); return; }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; set(lvl + 1); }
      else if (avg < 0.0172 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
    return F;
  }

  function mkKit(THREE, own) {
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const G0 = {
      box: own(new THREE.BoxGeometry(1, 1, 1).toNonIndexed()),
      cyl: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 12, 1).toNonIndexed()),
      cyl6: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 6, 1).toNonIndexed()),
      cyl8: own(new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1).toNonIndexed()),
      sph: own(new THREE.SphereGeometry(0.5, 14, 10).toNonIndexed()),
      sphL: own(new THREE.SphereGeometry(0.5, 8, 6).toNonIndexed()),
      cone: own(new THREE.ConeGeometry(0.5, 1, 10, 1).toNonIndexed()),
      cone4: own(new THREE.ConeGeometry(0.5, 1, 4, 1).toNonIndexed())
    };
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), nm = new THREE.Matrix3();
    const matV = own(new THREE.MeshLambertMaterial({ vertexColors: true }));
    const matVS = own(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 60, specular: 0x444444 }));
    const extra = {};
    function geo(list) {
      const P = [], N = [], Cc = [];
      for (const it of list) {
        const [shape, col, p = [0, 0, 0], k = [1, 1, 1], r = [0, 0, 0]] = it;
        const g = typeof shape === 'string' ? (G0[shape] || extra[shape]) : shape;
        m4.compose(v.set(p[0], p[1], p[2]), q.setFromEuler(e.set(r[0], r[1], r[2], it[6] || 'XYZ')), sc.set(k[0], k[1], k[2]));
        nm.getNormalMatrix(m4);
        const pa = g.attributes.position.array, na = g.attributes.normal.array, c = lin(col);
        for (let i = 0; i < pa.length; i += 3) {
          v.set(pa[i], pa[i + 1], pa[i + 2]).applyMatrix4(m4); P.push(v.x, v.y, v.z);
          v.set(na[i], na[i + 1], na[i + 2]).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
          const sh = it[5] ? 1 - it[5] * (0.5 - pa[i + 1]) : 1;
          Cc.push(c.r * sh, c.g * sh, c.b * sh);
        }
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      out.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
      out.computeBoundingSphere();
      return own(out);
    }
    function mesh(list, o) {
      const m = new THREE.Mesh(geo(list), o && o.shiny ? matVS : matV);
      m.castShadow = !!(o && o.cast); m.receiveShadow = !!(o && o.recv);
      return m;
    }
    const limb = (col, a, b, t, shape) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz); return [shape || 'box', col, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [t, t, L], [-Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(dx, dz), 0], 0, 'YXZ']; };
    return { THREE, lin, geo, mesh, G0, extra, matV, matVS, own, limb };
  }

  function canvasTex(THREE, own, S, draw, o) {
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    draw(g, S);
    const t = own(new THREE.CanvasTexture(c));
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (o && o.pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; }
    t.anisotropy = 4;
    return t;
  }

  function buildMapMeshes(THREE, own, M, G) {
    const groups = new Map();
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const tmpC = new THREE.Color();
    const grp = k => { let g = groups.get(k); if (!g) groups.set(k, g = { P: [], N: [], U: [], C: [], ns: false }); return g; };
    const MT = G.mats;
    const quad = (g, a, b, c, d, n, ua, ub, uc, ud, col, sa, sb, sc2, sd) => {
      g.P.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) g.N.push(n[0], n[1], n[2]);
      g.U.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud);
      const S = [sa, sb, sc2, sa, sc2, sd];
      for (let i = 0; i < 6; i++) g.C.push(col.r * S[i], col.g * S[i], col.b * S[i]);
    };
    const tri = (g, a, b, c, n, ua, ub, uc, col, s) => {
      g.P.push(...a, ...b, ...c);
      for (let i = 0; i < 3; i++) g.N.push(n[0], n[1], n[2]);
      g.U.push(...ua, ...ub, ...uc);
      for (let i = 0; i < 3; i++) g.C.push(col.r * s, col.g * s, col.b * s);
    };
    const fy = M.floorY, ao = G.mapAO == null ? 0.72 : G.mapAO;
    const aoAt = y => y <= fy + 0.01 ? ao : 1;
    const addBox = s => {
      const mt = MT[s.m] || MT.default, g = grp(s.m + (s.ns ? '|ns' : '') + (s.glow ? '|gl' : ''));
      g.ns = s.ns; g.glow = s.glow;
      const col = lin(s.c != null ? s.c : mt.color), ts = (mt.tile || 2) * (s.uv || 1);
      const { x0, y0, z0, x1, y1, z1 } = s;
      const sb = aoAt(y0);
      quad(g, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [x0 / ts, z1 / ts], [x1 / ts, z1 / ts], [x1 / ts, z0 / ts], [x0 / ts, z0 / ts], col, 1, 1, 1, 1);
      if (y0 > fy + 0.01) quad(g, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], [x0 / ts, z0 / ts], [x1 / ts, z0 / ts], [x1 / ts, z1 / ts], [x0 / ts, z1 / ts], col, 0.8, 0.8, 0.8, 0.8);
      quad(g, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], [x0 / ts, y0 / ts], [x1 / ts, y0 / ts], [x1 / ts, y1 / ts], [x0 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], [-x1 / ts, y0 / ts], [-x0 / ts, y0 / ts], [-x0 / ts, y1 / ts], [-x1 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], [-z1 / ts, y0 / ts], [-z0 / ts, y0 / ts], [-z0 / ts, y1 / ts], [-z1 / ts, y1 / ts], col, sb, sb, 1, 1);
      quad(g, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], [z0 / ts, y0 / ts], [z1 / ts, y0 / ts], [z1 / ts, y1 / ts], [z0 / ts, y1 / ts], col, sb, sb, 1, 1);
    };
    const addRamp = s => {
      const mt = MT[s.m] || MT.default, g = grp(s.m + (s.ns ? '|ns' : '')), col = lin(s.c != null ? s.c : mt.color), ts = (mt.tile || 2) * (s.uv || 1);
      const { x0, z0, x1, z1, ya, yb, y0 } = s;
      const H = (x, z) => rampH(s, x, z);
      const a = [x0, H(x0, z1), z1], b = [x1, H(x1, z1), z1], c = [x1, H(x1, z0), z0], d = [x0, H(x0, z0), z0];
      const ux = s.dir < 2, len = ux ? x1 - x0 : z1 - z0, sl = (yb - ya) / len;
      const ax = s.dir === 0 ? 1 : s.dir === 1 ? -1 : 0, az = s.dir === 2 ? 1 : s.dir === 3 ? -1 : 0;
      let nx = -ax * sl, ny = 1, nz = -az * sl; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const uvf = p => ux ? [p[2] / ts, (s.dir === 0 ? p[0] - x0 : x1 - p[0]) * Math.sqrt(1 + sl * sl) / ts] : [p[0] / ts, (s.dir === 2 ? p[2] - z0 : z1 - p[2]) * Math.sqrt(1 + sl * sl) / ts];
      quad(g, a, b, c, d, [nx, ny, nz], uvf(a), uvf(b), uvf(c), uvf(d), col, 1, 1, 1, 1);
      const side = (p0, p1, n) => {
        const lo0 = [p0[0], y0, p0[2]], lo1 = [p1[0], y0, p1[2]];
        const u = q => n[0] ? [q[2] / ts, q[1] / ts] : [q[0] / ts, q[1] / ts];
        if (p0[1] - y0 > 1e-3 || p1[1] - y0 > 1e-3) quad(g, lo0, lo1, p1, p0, n, u(lo0), u(lo1), u(p1), u(p0), col, aoAt(y0), aoAt(y0), 1, 1);
      };
      side(b, a, [0, 0, 1]); side(d, c, [0, 0, -1]); side(c, b, [1, 0, 0]); side(a, d, [-1, 0, 0]);
    };
    for (const s of M.solids) { if (s.inv) continue; if (s.t === 1) addRamp(s); else addBox(s); }
    for (const s of M.deco) addBox(s);
    for (const c of M.cyl) {
      const mt = MT[c.m] || MT.default, g = grp(c.m + (c.ns ? '|ns' : '')), col = lin(c.c != null ? c.c : mt.color), ts = (mt.tile || 2);
      const n = c.seg;
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
        const p0 = [c.x + Math.cos(a0) * c.r, c.y, c.z + Math.sin(a0) * c.r], p1 = [c.x + Math.cos(a1) * c.r, c.y, c.z + Math.sin(a1) * c.r];
        const q0 = [c.x + Math.cos(a0) * c.r2, c.y + c.h, c.z + Math.sin(a0) * c.r2], q1 = [c.x + Math.cos(a1) * c.r2, c.y + c.h, c.z + Math.sin(a1) * c.r2];
        const u0 = i / n * c.r * TAU / ts, u1 = (i + 1) / n * c.r * TAU / ts;
        quad(g, p1, p0, q0, q1, [Math.cos(am), 0, Math.sin(am)], [u1, c.y / ts], [u0, c.y / ts], [u0, (c.y + c.h) / ts], [u1, (c.y + c.h) / ts], col, aoAt(c.y), aoAt(c.y), 1, 1);
        if (c.cap) tri(g, [c.x, c.y + c.h, c.z], q1, q0, [0, 1, 0], [c.x / ts, c.z / ts], [q1[0] / ts, q1[2] / ts], [q0[0] / ts, q0[2] / ts], col, 1);
      }
    }
    const out = [];
    for (const [k, g] of groups) {
      const mk = k.split('|')[0], mt = MT[mk] || MT.default;
      const geo = own(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.Float32BufferAttribute(g.P, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.N, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.U, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(g.C, 3));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mt.mat);
      mesh.castShadow = !g.ns; mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      out.push(mesh);
    }
    return out;
  }

  function mkAudio(api, G) {
    let ctx = null, out = null, noiseB = null, lx = 0, ly = 0, lz = 0, lyaw = 0, vol = 1, live = 0, liveT = 0;
    const ensure = () => {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.5;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; out.connect(comp); comp.connect(ctx.destination);
        noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const dest = (x, y, z, near) => {
      if (x == null) return { g: 1, d: out };
      const dx = x - lx, dz = z - lz, dist = Math.hypot(dx, y - ly, dz);
      const g = 1 / (1 + Math.max(0, dist - (near || 2)) * 0.11);
      if (g < 0.03) return null;
      const n = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (n) { const ang = Math.atan2(-dx, -dz) - lyaw; n.pan.value = clamp(-Math.sin(ang) * Math.min(1, dist / 4), -0.85, 0.85); n.connect(out); }
      return { g, d: n || out };
    };
    const A = {
      tone(f0, f1, dur, type, v, when, D) {
        const t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * D.g * vol), t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(D.d); o.start(t); o.stop(t + dur + 0.03);
      },
      noise(dur, v, f, Q, when, type, f1, D) {
        const t = ctx.currentTime + (when || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = noiseB; fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = Q || 1;
        g.gain.setValueAtTime(Math.max(0.0002, v * D.g * vol), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(fl); fl.connect(g); g.connect(D.d); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
      },
      play(name, x, y, z, k) {
        if (api.muted || !ensure() || !G.sounds[name]) return;
        const now = ctx.currentTime;
        if (now - liveT > 0.05) { live = 0; liveT = now; }
        if (++live > 14) return;
        const D = dest(x, y, z);
        if (!D) return;
        try { G.sounds[name](A, D, k); } catch (e) {}
      },
      listener(x, y, z, yaw) { lx = x; ly = y; lz = z; lyaw = yaw; },
      unlock() { ensure(); },
      set vol(v) { vol = v; },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
    return A;
  }

  function mkView(api, V, G, wrap) {
    const { THREE, renderer, canvas } = V;
    const bin = [], own = x => (bin.push(x), x);
    const kit = mkKit(THREE, own);
    const lin = kit.lin;
    renderer.toneMappingExposure = G.exposure || 1;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(75, V.w / V.h, 0.05, 600);
    cam.rotation.order = 'YXZ';
    const vScene = new THREE.Scene(), vCam = new THREE.PerspectiveCamera(58, V.w / V.h, 0.01, 10);
    vScene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.75));
    const vSun = new THREE.DirectionalLight(0xffffff, 0.75); vSun.position.set(-0.4, 1, 0.6); vScene.add(vSun);
    const vFlash = new THREE.PointLight(0xffc860, 0, 2.2); vScene.add(vFlash);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 0.6); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.castShadow = true; scene.add(sun, sun.target);
    renderer.shadowMap.autoUpdate = false;
    const blobTex = canvasTex(THREE, own, 64, (g, S) => { const r = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2); r.addColorStop(0, 'rgba(0,0,0,.42)'); r.addColorStop(0.6, 'rgba(0,0,0,.22)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S); });
    const blobMat = own(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const blobGeo = own(new THREE.PlaneGeometry(1, 1)); blobGeo.rotateX(-Math.PI / 2);
    const flash = new THREE.PointLight(0xffc070, 0, 9); scene.add(flash);
    const boomL = new THREE.PointLight(0xff9a40, 0, 16); scene.add(boomL);
    G.mats.default = G.mats.default || { color: '#aaaaaa' };
    for (const k in G.mats) {
      const mt = G.mats[k];
      const tex = mt.tex ? canvasTex(THREE, own, mt.res || 64, mt.tex, { pixel: G.pixel }) : null;
      mt.mat = own(mt.lambert === false ? new THREE.MeshPhongMaterial({ map: tex, vertexColors: true, shininess: mt.shine || 20 }) : new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, emissive: mt.glow ? lin(mt.glow) : 0x000000, emissiveIntensity: mt.glow ? 1 : 0 }));
    }
    let mapMeshes = [], mapGroup = new THREE.Group(), skyG = null, curMap = null;
    scene.add(mapGroup);
    function setMap(M) {
      if (curMap === M) return;
      curMap = M;
      for (const m of mapMeshes) mapGroup.remove(m);
      while (mapGroup.children.length) mapGroup.remove(mapGroup.children[0]);
      mapMeshes = buildMapMeshes(THREE, own, M, G);
      for (const m of mapMeshes) mapGroup.add(m);
      const D = M.def, sky = D.sky || G.sky;
      if (skyG) scene.remove(skyG);
      skyG = G.makeSky(kit, sky, D);
      scene.add(skyG);
      scene.fog = new THREE.Fog(lin(sky.fog), sky.fogNear || 60, sky.fogFar || 260);
      renderer.setClearColor(lin(sky.fog));
      hemi.color.copy(lin(sky.hemiTop || '#ffffff')); hemi.groundColor.copy(lin(sky.hemiBot || '#888888')); hemi.intensity = sky.hemi == null ? 0.62 : sky.hemi;
      sun.color.copy(lin(sky.sun || '#fff3dd')); sun.intensity = sky.sunI == null ? 0.95 : sky.sunI;
      const cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2, span = Math.max(M.x1 - M.x0, M.z1 - M.z0) * 0.62 + 4;
      const sd = sky.sunDir || [-0.45, 1, 0.35], sl = Math.hypot(...sd);
      sun.position.set(cx + sd[0] / sl * 80, sd[1] / sl * 80, cz + sd[2] / sl * 80); sun.target.position.set(cx, 0, cz);
      const S = COARSE ? 1024 : 2048, sc = sun.shadow.camera;
      sun.shadow.mapSize.set(S, S); sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 10; sc.far = 200; sc.updateProjectionMatrix();
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
      renderer.shadowMap.needsUpdate = true;
      for (const pr of M.props) { const o = G.makeProp && G.makeProp(kit, pr); if (o) { o.position.set(pr.x, pr.y, pr.z); o.rotation.y = pr.a; mapGroup.add(o); } }
      pickMeshes.forEach(m => scene.remove(m)); pickMeshes.length = 0;
      zoneMesh.visible = false;
    }

    const chars = [];
    function charFor(slot, look) {
      let c = chars[slot];
      const key = look.team + '|' + look.cls + '|' + look.color;
      if (c && c.key === key) return c;
      if (c) { scene.remove(c.root); scene.remove(c.blob); c.dispose && c.dispose(); }
      c = G.makeChar(kit, look);
      c.key = key; c.slot = slot;
      c.blob = new THREE.Mesh(blobGeo, blobMat); c.blob.scale.setScalar(G.blobS || 1.1); c.blob.renderOrder = 1; scene.add(c.blob);
      c.tag = mkTag();
      c.root.add(c.tag.spr);
      scene.add(c.root);
      chars[slot] = c;
      return c;
    }
    function dropChar(slot) { const c = chars[slot]; if (c) { scene.remove(c.root); scene.remove(c.blob); c.dispose && c.dispose(); chars[slot] = null; } }
    function mkTag() {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
      const tex = own(new THREE.CanvasTexture(cv)); tex.encoding = THREE.sRGBEncoding;
      const spr = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false, sizeAttenuation: false })));
      spr.scale.set(0.2, 0.05, 1); spr.renderOrder = 10; spr.visible = false;
      let last = '';
      return {
        spr,
        set(name, col, hp, show) {
          const k = name + col + Math.round(hp * 20);
          if (k !== last) {
            last = k;
            const g = cv.getContext('2d');
            g.clearRect(0, 0, 256, 64);
            g.font = '700 26px ' + (G.font || 'system-ui, sans-serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
            g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.65)'; g.strokeText(name, 128, 22); g.fillStyle = col; g.fillText(name, 128, 22);
            if (hp >= 0) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(58, 44, 140, 10); g.fillStyle = hp > 0.5 ? '#5fe36a' : hp > 0.25 ? '#ffc93c' : '#ff4b4b'; g.fillRect(60, 46, 136 * clamp(hp, 0, 1), 6); }
            tex.needsUpdate = true;
          }
          spr.visible = show;
        }
      };
    }

    const viewModels = new Map();
    let vmCur = null, vmKey = '';
    const vmRoot = new THREE.Group(); vScene.add(vmRoot);
    function viewFor(k) {
      if (vmKey === k && vmCur) return vmCur;
      if (vmCur) vmRoot.remove(vmCur.root);
      let m = viewModels.get(k);
      if (!m) { m = G.makeView(kit, k); viewModels.set(k, m); }
      vmCur = m; vmKey = k; vmRoot.add(m.root);
      return m;
    }

    const trGeo = own(new THREE.BoxGeometry(1, 1, 1)); trGeo.translate(0, 0, 0.5);
    const trMat = own(new THREE.MeshBasicMaterial({ color: lin(G.tracer || '#ffe9a0'), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const TRN = 48, trMesh = new THREE.InstancedMesh(trGeo, trMat, TRN); trMesh.frustumCulled = false; trMesh.count = 0; scene.add(trMesh);
    const trs = Array.from({ length: TRN }, () => ({ on: false, ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, t: 0, life: 0.07, w: 0.025 }));
    let trI = 0;
    const PN = 700, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pGr = new Float32Array(PN);
    const pGeo = own(new THREE.BufferGeometry());
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const dotTex = canvasTex(THREE, own, 32, (g, S) => { if (G.pixel) { g.fillStyle = '#fff'; g.fillRect(6, 6, S - 12, S - 12); } else { const r = g.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.55, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S); } });
    const pMat = own(new THREE.PointsMaterial({ size: 0.12, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, alphaTest: 0.05 }));
    const pts = new THREE.Points(pGeo, pMat); pts.frustumCulled = false; scene.add(pts);
    for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
    let pI = 0;
    const tc = new THREE.Color();
    function burst(x, y, z, n, col, spd, up, life, grav, nx, ny, nz) {
      tc.copy(lin(col));
      for (let k = 0; k < n; k++) {
        const i = pI; pI = (pI + 1) % PN;
        pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
        let vx = (Math.random() - 0.5) * 2, vy = (Math.random() - 0.5) * 2, vz = (Math.random() - 0.5) * 2;
        if (nx != null) { vx += nx * 1.3; vy += ny * 1.3; vz += nz * 1.3; }
        pVel[i * 3] = vx * spd; pVel[i * 3 + 1] = vy * spd + (up || 0); pVel[i * 3 + 2] = vz * spd;
        const s = 0.75 + Math.random() * 0.4;
        pCol[i * 3] = tc.r * s; pCol[i * 3 + 1] = tc.g * s; pCol[i * 3 + 2] = tc.b * s;
        pLife[i] = pMax[i] = life * (0.6 + Math.random() * 0.6); pGr[i] = grav == null ? 9 : grav;
      }
    }
    const DN = 72, dGeo = own(new THREE.PlaneGeometry(1, 1));
    const holeTex = canvasTex(THREE, own, 32, G.holeTex || ((g, S) => { g.fillStyle = 'rgba(20,18,16,.9)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.2, 0, TAU); g.fill(); g.fillStyle = 'rgba(20,18,16,.3)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.36, 0, TAU); g.fill(); }));
    const dMat = own(new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    const dMesh = new THREE.InstancedMesh(dGeo, dMat, DN); dMesh.count = 0; dMesh.frustumCulled = false; scene.add(dMesh);
    let dI = 0, dCount = 0;
    const SN = 24, sTex = canvasTex(THREE, own, 128, G.splatTex || ((g, S) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, TAU); g.fill(); }));
    const sMat = own(new THREE.MeshLambertMaterial({ map: sTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    const sMesh = new THREE.InstancedMesh(dGeo, sMat, SN); sMesh.count = 0; sMesh.frustumCulled = false; scene.add(sMesh);
    let sI = 0, sCount = 0;
    const o3 = new THREE.Object3D(), nV = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
    function decal(mesh, idx, x, y, z, nx, ny, nz, size, spin) {
      o3.position.set(x + nx * 0.01, y + ny * 0.01, z + nz * 0.01);
      nV.set(nx, ny, nz);
      o3.quaternion.setFromUnitVectors(up, nV);
      o3.rotateZ(spin == null ? Math.random() * TAU : spin);
      o3.scale.set(size, size, size);
      o3.updateMatrix();
      mesh.setMatrixAt(idx, o3.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
    const DBN = 120, dbGeo = G.debrisGeo ? G.debrisGeo(kit) : kit.G0.box;
    const dbMat = own(new THREE.MeshLambertMaterial({ vertexColors: false, color: 0xffffff }));
    const dbMesh = new THREE.InstancedMesh(dbGeo, dbMat, DBN); dbMesh.castShadow = false; dbMesh.frustumCulled = false; dbMesh.count = DBN;
    const dbs = Array.from({ length: DBN }, () => ({ on: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, wx: 0, wy: 0, wz: 0, s: 0.1, life: 0, floor: 0 }));
    let dbI = 0;
    o3.scale.set(0, 0, 0); o3.position.set(0, -99, 0); o3.updateMatrix();
    for (let i = 0; i < DBN; i++) { dbMesh.setMatrixAt(i, o3.matrix); dbMesh.setColorAt(i, tc.set(0xffffff)); }
    scene.add(dbMesh);
    function debris(x, y, z, n, cols, spd, size, life, floorY) {
      for (let k = 0; k < n; k++) {
        const d = dbs[dbI]; dbMesh.setColorAt(dbI, tc.copy(lin(cols[k % cols.length]))); dbI = (dbI + 1) % DBN;
        d.on = true; d.x = x + (Math.random() - 0.5) * 0.4; d.y = y + Math.random() * 0.8; d.z = z + (Math.random() - 0.5) * 0.4;
        d.vx = (Math.random() - 0.5) * spd * 2; d.vy = Math.random() * spd * 1.2 + 1.5; d.vz = (Math.random() - 0.5) * spd * 2;
        d.rx = Math.random() * TAU; d.ry = Math.random() * TAU; d.rz = Math.random() * TAU; d.wx = (Math.random() - 0.5) * 14; d.wy = (Math.random() - 0.5) * 14; d.wz = (Math.random() - 0.5) * 14;
        d.s = size * (0.6 + Math.random() * 0.8); d.life = life * (0.8 + Math.random() * 0.4); d.floor = floorY;
      }
      if (dbMesh.instanceColor) dbMesh.instanceColor.needsUpdate = true;
    }
    const boomGeo = own(new THREE.SphereGeometry(1, 16, 12));
    const booms = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(boomGeo, own(new THREE.MeshBasicMaterial({ color: lin(G.boomCol || '#ffb040'), transparent: true, opacity: 0, depthWrite: false, fog: false }))); m.visible = false; scene.add(m); return { m, t: 9, r: 1 }; });
    let bI = 0, shake = 0, boomT = 9;
    function boom(x, y, z, r) {
      const b = booms[bI]; bI = (bI + 1) % booms.length;
      b.m.position.set(x, y, z); b.t = 0; b.r = r; b.m.visible = true;
      boomL.position.set(x, y + 0.5, z); boomT = 0;
      burst(x, y + 0.2, z, 28, G.boomCol || '#ffb040', 5, 3, 0.6, 3);
      burst(x, y + 0.2, z, 20, '#555555', 3, 2, 1.2, 1);
    }
    const pickMeshes = [];
    const zoneMesh = G.makeZone ? G.makeZone(kit) : new THREE.Group(); zoneMesh.visible = false; scene.add(zoneMesh);
    const projMeshes = new Map();
    function projMesh(id, kind) {
      let m = projMeshes.get(id);
      if (!m) { m = G.makeProj(kit, kind); m.userData.kind = kind; projMeshes.set(id, m); scene.add(m); }
      return m;
    }
    function dropProj(id) { const m = projMeshes.get(id); if (m) { scene.remove(m); projMeshes.delete(id); } }

    const mfTex = canvasTex(THREE, own, 64, (g, S) => {
      const r = g.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2); r.addColorStop(0, 'rgba(255,255,230,1)'); r.addColorStop(0.3, 'rgba(255,210,90,.9)'); r.addColorStop(1, 'rgba(255,140,20,0)');
      g.fillStyle = r; g.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 2 ? S * 0.18 : S * 0.5; g.lineTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr); }
      g.fill();
    });
    const mfMat = own(new THREE.SpriteMaterial({ map: mfTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    const vmFlash = new THREE.Sprite(mfMat); vmFlash.scale.set(0.22, 0.22, 1); vmFlash.visible = false; vmFlash.renderOrder = 5; vScene.add(vmFlash);
    const vmFlashP = new THREE.Vector3();

    const tmpM = new THREE.Matrix4(), tq = new THREE.Quaternion(), ts3 = new THREE.Vector3(), tpos = new THREE.Vector3(), dirV = new THREE.Vector3();
    function frameFx(dt) {
      let n = 0;
      for (const t of trs) {
        if (!t.on) continue;
        t.t += dt;
        if (t.t > t.life) { t.on = false; continue; }
        const k = t.t / t.life, sx = t.ax + (t.bx - t.ax) * k * 0.6, sy = t.ay + (t.by - t.ay) * k * 0.6, sz = t.az + (t.bz - t.az) * k * 0.6;
        dirV.set(t.bx - sx, t.by - sy, t.bz - sz);
        const len = dirV.length();
        if (len < 0.05) { t.on = false; continue; }
        dirV.divideScalar(len);
        tq.setFromUnitVectors(up, dirV);
        tmpM.compose(tpos.set(sx, sy, sz), tq, ts3.set(t.w * (1 - k * 0.5), t.w * (1 - k * 0.5), len));
        trMesh.setMatrixAt(n++, tmpM);
      }
      trMesh.count = n; if (n) trMesh.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < PN; i++) {
        if (pLife[i] <= 0) continue;
        pLife[i] -= dt;
        if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; continue; }
        pVel[i * 3 + 1] -= pGr[i] * dt;
        pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
        const f = Math.min(1, pLife[i] / pMax[i] * 2.5);
        if (f < 1) { pCol[i * 3] *= 0.97; pCol[i * 3 + 1] *= 0.97; pCol[i * 3 + 2] *= 0.97; }
      }
      pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
      let any = false;
      for (let i = 0; i < DBN; i++) {
        const d = dbs[i];
        if (!d.on) continue;
        any = true;
        d.life -= dt;
        if (d.life <= 0) { d.on = false; o3.position.set(0, -99, 0); o3.scale.set(0, 0, 0); o3.updateMatrix(); dbMesh.setMatrixAt(i, o3.matrix); continue; }
        d.vy -= 14 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
        if (d.y < d.floor + d.s * 0.3) { d.y = d.floor + d.s * 0.3; d.vy = Math.abs(d.vy) * 0.3; d.vx *= 0.6; d.vz *= 0.6; d.wx *= 0.6; d.wy *= 0.6; d.wz *= 0.6; }
        d.rx += d.wx * dt; d.ry += d.wy * dt; d.rz += d.wz * dt;
        const s = d.s * Math.min(1, d.life * 2);
        o3.position.set(d.x, d.y, d.z); o3.rotation.set(d.rx, d.ry, d.rz); o3.scale.set(s, s, s); o3.updateMatrix();
        dbMesh.setMatrixAt(i, o3.matrix);
      }
      if (any) dbMesh.instanceMatrix.needsUpdate = true;
      for (const b of booms) {
        if (b.t > 0.5) { if (b.m.visible) b.m.visible = false; continue; }
        b.t += dt;
        const k = b.t / 0.5;
        b.m.scale.setScalar(b.r * (0.25 + 0.9 * Math.sqrt(k)));
        b.m.material.opacity = Math.max(0, 0.9 * (1 - k));
      }
      boomT += dt;
      boomL.intensity = boomT < 0.3 ? 4 * (1 - boomT / 0.3) : 0;
      if (flash.intensity > 0) flash.intensity = Math.max(0, flash.intensity - dt * 40);
      if (vFlash.intensity > 0) vFlash.intensity = Math.max(0, vFlash.intensity - dt * 30);
    }
    function tracer(ax, ay, az, bx, by, bz, w, life) {
      const t = trs[trI]; trI = (trI + 1) % TRN;
      t.on = true; t.ax = ax; t.ay = ay; t.az = az; t.bx = bx; t.by = by; t.bz = bz; t.t = 0; t.w = w || 0.025; t.life = life || 0.07;
    }
    function hole(x, y, z, nx, ny, nz) { decal(dMesh, dI, x, y, z, nx, ny, nz, 0.14 + Math.random() * 0.05); dI = (dI + 1) % DN; dCount = Math.min(DN, dCount + 1); dMesh.count = dCount; }
    function splat(x, y, z, nx, ny, nz, size) { decal(sMesh, sI, x, y, z, nx, ny, nz, size); sI = (sI + 1) % SN; sCount = Math.min(SN, sCount + 1); sMesh.count = sCount; }
    function clearFx() {
      for (const t of trs) t.on = false;
      for (let i = 0; i < PN; i++) { pLife[i] = 0; pPos[i * 3 + 1] = -999; }
      for (const d of dbs) if (d.on) d.life = 0.001;
      dCount = 0; dMesh.count = 0; sCount = 0; sMesh.count = 0;
      for (const id of [...projMeshes.keys()]) dropProj(id);
    }

    const VS = { bob: 0, bobA: 0, swayX: 0, swayY: 0, kick: 0, kickR: 0, land: 0, prevYaw: 0, prevPit: 0, lastFire: -9, fireT: 9 };
    function drawView(s, dt) {
      vmRoot.visible = s.show;
      if (!s.show) { vmFlash.visible = false; return; }
      const m = viewFor(s.wk);
      const ads = s.ads;
      const hip = m.hip, aim = m.aim;
      const sp = s.spd;
      VS.bobA += dt * (s.ground ? 7 + sp * 0.9 : 0) * (s.slide ? 0 : 1);
      const bAmt = s.ground && !s.slide ? Math.min(1, sp / 6) * (1 - ads * 0.85) : 0;
      VS.bob = damp(VS.bob, bAmt, 10, dt);
      const dy = angD(s.yaw, VS.prevYaw), dp = s.pitch - VS.prevPit;
      VS.prevYaw = s.yaw; VS.prevPit = s.pitch;
      VS.swayX = damp(VS.swayX, clamp(-dy * 1.6, -0.06, 0.06) * (1 - ads * 0.8), 9, dt);
      VS.swayY = damp(VS.swayY, clamp(-dp * 1.6, -0.05, 0.05) * (1 - ads * 0.8), 9, dt);
      VS.kick = damp(VS.kick, 0, m.kickRec || 14, dt); VS.kickR = damp(VS.kickR, 0, 12, dt);
      VS.land = damp(VS.land, 0, 8, dt);
      const bx = Math.sin(VS.bobA) * 0.018 * VS.bob, by = -Math.abs(Math.cos(VS.bobA)) * 0.02 * VS.bob;
      const rl = s.reload, sw = s.swap, me = s.melee;
      const rDip = rl >= 0 ? Math.sin(Math.min(1, rl) * Math.PI) : 0;
      const sDip = sw > 0 ? sw : 0;
      const slideT = s.slide ? 1 : 0;
      VS.sl = damp(VS.sl || 0, slideT, 8, dt);
      const x = lerp(hip[0], aim[0], ads) + bx + VS.swayX - VS.sl * 0.04;
      const y = lerp(hip[1], aim[1], ads) + by + VS.swayY - rDip * 0.12 - sDip * 0.35 - VS.land * 0.04 - VS.sl * 0.03;
      const z = lerp(hip[2], aim[2], ads) + VS.kick * (m.kickZ || 0.08);
      vmRoot.position.set(x, y, z);
      vmRoot.rotation.set(VS.kick * (m.kickRot || 0.6) + rDip * 0.5 + sDip * 0.8, VS.swayX * 2, VS.kickR + rDip * (m.reloadRoll || 0.6) + VS.sl * 0.35);
      if (m.anim) m.anim(s, dt, rl, me);
      vmFlash.visible = s.fireT < 0.05 && !m.noFlash;
      if (vmFlash.visible) { m.muzzle.getWorldPosition(vmFlashP); vmFlash.position.copy(vmFlashP); vmFlash.material.rotation = Math.random() * TAU; const k = 0.09 + Math.random() * 0.05; vmFlash.scale.set(k * (m.flashS || 1), k * (m.flashS || 1), 1); vFlash.position.copy(vmFlashP); }
    }
    function kickView(k, roll) { VS.kick += k; VS.kickR += (Math.random() - 0.5) * (roll || 0.05); vFlash.intensity = 2.5; }
    function landView(k) { VS.land += k; }

    const raycastV = new THREE.Vector3();
    function render(camS) {
      cam.position.set(camS.x, camS.y, camS.z);
      cam.rotation.set(camS.pitch, camS.yaw, camS.roll || 0);
      const fov = camS.fov;
      if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
      if (Math.abs(vCam.fov - camS.vfov) > 0.01) { vCam.fov = camS.vfov; vCam.updateProjectionMatrix(); }
      if (skyG) skyG.position.set(camS.x, 0, camS.z);
      renderer.autoClear = true;
      renderer.render(scene, cam);
      if (vmRoot.visible || vmFlash.visible) {
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(vScene, vCam);
        renderer.autoClear = true;
      }
    }
    function flashAt(x, y, z) { flash.position.set(x, y, z); flash.intensity = 2.2; }

    return {
      THREE, kit, scene, cam, vCam, renderer, setMap, charFor, dropChar, chars, burst, debris, boom, tracer, hole, splat, frameFx, drawView, kickView, landView, render, projMesh, dropProj, projMeshes, zoneMesh, pickMeshes, clearFx, flashAt, own, lin,
      get shake() { return shake; }, set shake(v) { shake = v; },
      dispose() { for (const o of bin) { try { o.dispose(); } catch (e) {} } bin.length = 0; }
    };
  }
  function pix(g, S, base, spots, px, after) {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    let s = 1234567;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const [c, d] of spots) { g.fillStyle = c; for (let i = 0; i < S * S / (px * px) * d; i++) g.fillRect(Math.floor(r() * S / px) * px, Math.floor(r() * S / px) * px, px, px); }
    if (after) after(g, S);
  }

  function building(B, x0, z0, x1, z1, h, m, o) {
    o = o || {};
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sx = x1 - x0, sz = z1 - z0;
    if (o.arch) {
      const a = o.arch;
      if (a.ax === 'x') {
        const w0 = a.c - a.w / 2, w1 = a.c + a.w / 2;
        B.box((x0 + w0) / 2, 0, cz, w0 - x0, h, sz, m); B.box((w1 + x1) / 2, 0, cz, x1 - w1, h, sz, m); B.box(a.c, a.h, cz, a.w, h - a.h, sz, m);
      } else {
        const w0 = a.c - a.w / 2, w1 = a.c + a.w / 2;
        B.box(cx, 0, (z0 + w0) / 2, sx, h, w0 - z0, m); B.box(cx, 0, (w1 + z1) / 2, sx, h, z1 - w1, m); B.box(cx, a.h, a.c, sx, h - a.h, a.w, m);
      }
    } else B.box(cx, 0, cz, sx, h, sz, m);
    const tr = o.trim || 'trim', rim = o.rim == null ? 0.3 : o.rim;
    if (rim) {
      B.box(cx, h, z0 + 0.15, sx, rim, 0.3, tr); B.box(cx, h, z1 - 0.15, sx, rim, 0.3, tr);
      B.box(x0 + 0.15, h, cz, 0.3, rim, sz - 0.6, tr); B.box(x1 - 0.15, h, cz, 0.3, rim, sz - 0.6, tr);
    }
    if (o.roof) B.box(cx, h - 0.01, cz, sx - 0.6, 0.02, sz - 0.6, o.roof, { nc: 1 });
    if (o.win !== false) {
      const wy = o.wy || [1.4, 3.8], gap = o.wg || 3.2, wm = o.wm || 'glass';
      for (const y of wy) {
        if (y + 1.4 > h - 0.3) continue;
        for (let x = x0 + gap * 0.75; x < x1 - gap * 0.5; x += gap) {
          if (o.arch && o.arch.ax === 'x' && Math.abs(x - o.arch.c) < o.arch.w / 2 + 0.8 && y < o.arch.h + 0.5) continue;
          B.box(x, y, z0 - 0.04, 1.2, 1.4, 0.1, wm, { nc: 1, ns: 1 }); B.box(x, y, z1 + 0.04, 1.2, 1.4, 0.1, wm, { nc: 1, ns: 1 });
          B.box(x, y - 0.12, z0 - 0.1, 1.5, 0.14, 0.22, tr, { nc: 1, ns: 1 }); B.box(x, y - 0.12, z1 + 0.1, 1.5, 0.14, 0.22, tr, { nc: 1, ns: 1 });
        }
        for (let z = z0 + gap * 0.75; z < z1 - gap * 0.5; z += gap) {
          if (o.arch && o.arch.ax === 'z' && Math.abs(z - o.arch.c) < o.arch.w / 2 + 0.8 && y < o.arch.h + 0.5) continue;
          B.box(x0 - 0.04, y, z, 0.1, 1.4, 1.2, wm, { nc: 1, ns: 1 }); B.box(x1 + 0.04, y, z, 0.1, 1.4, 1.2, wm, { nc: 1, ns: 1 });
          B.box(x0 - 0.1, y - 0.12, z, 0.22, 0.14, 1.5, tr, { nc: 1, ns: 1 }); B.box(x1 + 0.1, y - 0.12, z, 0.22, 0.14, 1.5, tr, { nc: 1, ns: 1 });
        }
      }
    }
  }
  const crate = (B, x, y, z, s, m) => B.box(x, y, z, s, s, s, m || 'crate', { uv: s / 1.2 });
  const DIFFS = ['Easy', 'Normal', 'Hard', 'Hardest'];
  const LVL_XP = n => 400 + n * 150;
  function checkSave(raw, G) {
    const d = { v: 1, cls: 0, mode: G.modes[0].key, map: 'random', diff: 1, bots: G.defBots || 6, sens: 1, ads: 0.8, fov: G.defFov || 78, inv: false, q: -1, vol: 0.8, help: false, name: '', st: { m: 0, w: 0, k: 0, d: 0, h: 0, sh: 0, hi: 0, best: 0, bs: 0, xp: 0, t: 0 } };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
    const num = (v, a, b, def) => typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : def;
    const o = d;
    o.cls = num(raw.cls, 0, G.classes.length - 1, 0) | 0;
    o.mode = typeof raw.mode === 'string' && G.modes.some(m => m.key === raw.mode) ? raw.mode : d.mode;
    o.map = typeof raw.map === 'string' && (raw.map === 'random' || G.maps.some(m => m.key === raw.map)) ? raw.map : 'random';
    o.diff = num(raw.diff, 0, 3, 1) | 0;
    o.bots = num(raw.bots, 1, G.maxBots || 11, d.bots) | 0;
    o.sens = num(raw.sens, 0.1, 5, 1); o.ads = num(raw.ads, 0.2, 2, 0.8); o.fov = num(raw.fov, 60, 110, d.fov); o.vol = num(raw.vol, 0, 1, 0.8);
    o.q = raw.q === -1 || [0, 1, 2, 3].includes(raw.q) ? raw.q : -1;
    o.inv = raw.inv === true; o.help = raw.help === true;
    o.name = typeof raw.name === 'string' ? raw.name.replace(/[<>&"']/g, '').slice(0, 16) : '';
    if (raw.st && typeof raw.st === 'object' && !Array.isArray(raw.st)) for (const k in d.st) o.st[k] = num(raw.st[k], 0, 1e9, 0);
    return o;
  }

  function arenaGame(G) {
    G.mapCache = {};
    G.headY = G.headY || (h => h - 0.25);
    G.engine = { mkWorld, mkPlayer, spawnPlayer, stepWorld, botClass, compileMap, BOTL, navNear, navPath };
    const ID = G.id, R = '.gm-' + ID;
    return {
      id: ID, title: G.title, category: '3D', tint: G.tint, ownPause: true, _def: G,
      blurb: G.blurb, help: G.help, better: 'high', width: 960,
      format: v => v + ' ' + (v === 1 ? 'kill' : 'kills'),
      icon: G.icon,
      css: CORE_CSS(R) + G.css(R),
      mount(root, api) {
        const wrap = document.createElement('div'); wrap.className = 'fp-wrap'; root.append(wrap);
        let cleanup = null;
        const narrow = root.clientWidth && root.clientWidth < 560 && innerHeight > innerWidth;
        api.gl(narrow ? 600 : 960, narrow ? 900 : 600, { antialias: !COARSE }).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v, G); }).catch(e => {
          console.error(e);
          if (api.alive) api.overlay({ kicker: '3D', title: 'WebGL unavailable', text: 'This game needs WebGL, which your browser could not start.', button: null });
        });
        return { destroy() { if (cleanup) cleanup(); } };
      }
    };
  }

  const CORE_CSS = R => `
${R}{gap:0}
${R} .fp-wrap{position:relative;max-width:100%;overflow:hidden;border-radius:var(--r);container-type:size;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;background:#000}
${R} .fp-wrap canvas{position:absolute;inset:0;width:100%!important;height:100%!important;aspect-ratio:auto!important;display:block;border-radius:0}
${R} .fp-hud,${R} .fp-ui{position:absolute;inset:0;pointer-events:none}
${R} .fp-hud[hidden],${R} .fp-ui [hidden]{display:none!important}
${R} .fp-ui > *{pointer-events:auto}
${R} .fp-ch{position:absolute;left:50%;top:50%;width:0;height:0}
${R} .fp-ch i{position:absolute;background:var(--ch,#fff);box-shadow:0 0 0 1px rgba(0,0,0,.55);border-radius:1px}
${R} .fp-ch .a,${R} .fp-ch .b{width:2px;height:clamp(6px,1.4cqw,11px);left:-1px}
${R} .fp-ch .c,${R} .fp-ch .d{height:2px;width:clamp(6px,1.4cqw,11px);top:-1px}
${R} .fp-ch .o{width:3px;height:3px;left:-1.5px;top:-1.5px;border-radius:50%}
${R} .fp-hm{position:absolute;left:50%;top:50%;width:0;height:0;opacity:0}
${R} .fp-hm i{position:absolute;width:2px;height:clamp(7px,1.5cqw,12px);background:#fff;left:-1px;top:calc(-0.5 * clamp(7px,1.5cqw,12px))}
${R} .fp-hm.k i{background:#ff3b3b}
${R} .fp-dmg{position:absolute;left:50%;top:50%;width:0;height:0}
${R} .fp-dmg i{position:absolute;left:calc(clamp(40px,10cqw,80px) * -1);top:calc(clamp(40px,10cqw,80px) * -1);width:calc(clamp(40px,10cqw,80px) * 2);height:calc(clamp(40px,10cqw,80px) * 2);border-radius:50%;border-top:clamp(4px,.8cqw,7px) solid rgba(255,40,40,.85);opacity:0;filter:drop-shadow(0 0 4px rgba(255,0,0,.6))}
${R} .fp-vig{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(200,0,0,.55) 100%)}
${R} .fp-scope{position:absolute;inset:0;opacity:0}
${R} .fp-feed{position:absolute;right:1.4cqw;top:1.4cqw;display:flex;flex-direction:column;align-items:flex-end;gap:.5cqw}
${R} .fp-feed div{display:flex;align-items:center;gap:.6cqw;padding:.35cqw .8cqw;font-size:clamp(10px,1.45cqw,15px);white-space:nowrap;max-width:46cqw;overflow:hidden}
${R} .fp-feed svg{height:1.2em;width:auto;flex:none}
${R} .fp-feed b{font-weight:800;overflow:hidden;text-overflow:ellipsis;max-width:16cqw}
${R} .fp-pop{position:absolute;left:0;right:0;top:27%;text-align:center;pointer-events:none}
${R} .fp-pop div{display:inline-block;font-size:clamp(16px,3.4cqw,34px);font-weight:900;letter-spacing:.02em}
${R} .fp-sub{position:absolute;left:0;right:0;top:58%;text-align:center;font-size:clamp(11px,1.7cqw,17px);font-weight:800}
${R} .fp-tc{position:absolute;left:50%;top:1.2cqw;transform:translateX(-50%);display:flex;align-items:center;gap:.8cqw}
${R} .fp-tl{position:absolute;left:1.4cqw;top:1.4cqw;display:flex;flex-direction:column;gap:.3cqw;font-size:clamp(10px,1.35cqw,14px)}
${R} .fp-tl div{display:flex;gap:.8cqw;justify-content:space-between;min-width:14cqw;padding:.25cqw .7cqw}
${R} .fp-tl span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:12cqw}
${R} .fp-chat{position:absolute;left:1.4cqw;bottom:16cqh;width:38cqw;display:flex;flex-direction:column;gap:.3cqw;font-size:clamp(10px,1.35cqw,14px)}
${R} .fp-chat div{padding:.2cqw .6cqw;background:rgba(0,0,0,.4);color:#fff;border-radius:4px;overflow-wrap:anywhere;transition:opacity .6s}
${R} .fp-chat input{pointer-events:auto;font:inherit;padding:.5cqw .8cqw;border-radius:6px;border:2px solid rgba(255,255,255,.5);background:rgba(0,0,0,.65);color:#fff;outline:0}
${R} .fp-hint{position:absolute;left:50%;bottom:22cqh;transform:translateX(-50%);font-size:clamp(11px,1.5cqw,15px);font-weight:800;padding:.4cqw 1cqw;border-radius:6px;background:rgba(0,0,0,.5);color:#fff;white-space:nowrap}
${R} .fp-touch{position:absolute;inset:0;pointer-events:none}
${R} .fp-tm .fp-feed{top:calc(12cqmin + 1.4cqw)}
${R} .fp-touch .tb{position:absolute;pointer-events:auto;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.32);border:2px solid rgba(255,255,255,.55);color:#fff;font-weight:800;font-size:clamp(9px,2.6cqmin,13px);touch-action:none;user-select:none;-webkit-user-select:none}
${R} .fp-touch .tb.on{background:rgba(255,255,255,.35)}
${R} .fp-touch .tb svg{width:58%;height:58%}
${R} .fp-stick{position:absolute;width:24cqmin;height:24cqmin;margin:-12cqmin 0 0 -12cqmin;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:rgba(0,0,0,.18);pointer-events:none}
${R} .fp-stick i{position:absolute;left:50%;top:50%;width:10cqmin;height:10cqmin;margin:-5cqmin 0 0 -5cqmin;border-radius:50%;background:rgba(255,255,255,.55)}
${R} .fp-menu{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:2cqmin;overflow:auto}
${R} .fp-card{max-height:100%;overflow:auto;scrollbar-width:thin}
${R} .fp-row{display:flex;flex-wrap:wrap;gap:.6cqw;align-items:center}
${R} .fp-seg{display:inline-flex;flex-wrap:wrap;gap:4px}
${R} .fp-seg button,${R} .fp-btn{font:inherit;cursor:pointer;border:0}
${R} .fp-btn:focus-visible,${R} .fp-seg button:focus-visible,${R} .fp-cls:focus-visible{outline:3px solid #fff;outline-offset:2px}
${R} .fp-sb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none!important}
${R} .fp-sb table{border-collapse:collapse;font-size:clamp(10px,1.4cqw,15px)}
${R} .fp-sb td,${R} .fp-sb th{padding:.45cqw 1.1cqw;text-align:right;white-space:nowrap}
${R} .fp-sb td:nth-child(2),${R} .fp-sb th:nth-child(2){text-align:left;max-width:22cqw;overflow:hidden;text-overflow:ellipsis}
${R} .fp-range{display:flex;align-items:center;gap:1cqw}
${R} .fp-main{display:grid;grid-template-columns:1.25fr 1fr;gap:clamp(10px,2.4cqw,28px);align-items:start}
${R} .fp-col{min-width:0}
${R} .fp-clsl{display:grid;grid-template-columns:1fr 1fr;gap:.4em}
${R} .fp-clsl .fp-cls{flex-direction:row;align-items:center;gap:.5em;padding:.4em .5em}
${R} .fp-clsl .fp-cls .ic{flex:none;width:2.6em;height:1.3em}
${R} .fp-clsl .fp-cls .tx{display:flex;flex-direction:column;min-width:0}
${R} .fp-clsl .fp-cls b,${R} .fp-clsl .fp-cls small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${R} .fp-clsd{margin-top:.6em;font-size:clamp(10px,1.3cqw,13px)}
${R} .fp-clsd p{margin:0 0 .5em;min-height:2.6em}
${R} .fp-clsd .bars{display:flex;flex-direction:column;gap:3px}
${R} .fp-clsd .bars span{display:flex;align-items:center;gap:.5em}
${R} .fp-clsd .bars em{font-style:normal;width:5.5em;flex:none}
${R} .fp-clsd .bars i{flex:1;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--acc2) var(--v),rgba(255,255,255,.12) var(--v))}
${R} .fp-acts.sm{margin-top:.5em}
@container (max-width:620px){${R} .fp-main{grid-template-columns:1fr}}
${R} .fp-range input{flex:1;min-width:0;accent-color:var(--acc,#ffcf33)}
@container (max-width:620px){${R} .fp-feed div{font-size:10px}${R} .fp-tl{display:none}}
`;

  function run(root, wrap, api, V, G) {
    const { THREE, renderer, canvas } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    {
      const cvs = canvas.style;
      for (const k of ['width', 'aspectRatio']) { let val = cvs[k]; Object.defineProperty(cvs, k, { configurable: true, get: () => val, set: x => { val = x; wrap.style[k] = x; } }); }
    }
    wrap.append(canvas);
    const view = mkView(api, V, G, wrap);
    const audio = mkAudio(api, G);
    let SV = checkSave(api.load(), G);
    const persist = () => api.save(SV);
    audio.vol = SV.vol;
    const PR = fitPR(api, V);
    if (SV.q >= 0) PR.force = SV.q;
    const hud = document.createElement('div'); hud.className = 'fp-hud'; hud.setAttribute('translate', 'no'); hud.hidden = true;
    hud.innerHTML = `<div class="fp-scope"></div><div class="fp-vig"></div><div class="fp-dmg"></div><div class="fp-ch"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><i class="o"></i></div><div class="fp-hm"><i style="transform:rotate(45deg) translateY(-160%)"></i><i style="transform:rotate(135deg) translateY(-160%)"></i><i style="transform:rotate(225deg) translateY(-160%)"></i><i style="transform:rotate(315deg) translateY(-160%)"></i></div><div class="fp-tl"></div><div class="fp-tc"></div><div class="fp-feed"></div><div class="fp-pop"></div><div class="fp-sub"></div>${G.hudHTML()}<div class="fp-chat"></div><div class="fp-hint" hidden></div><div class="fp-touch" hidden></div>`;
    wrap.append(hud);
    const ui = document.createElement('div'); ui.className = 'fp-ui'; ui.setAttribute('data-i18n', '');
    wrap.append(ui);
    const $ = s => hud.querySelector(s);
    const H = { ch: $('.fp-ch'), chA: $('.fp-ch .a'), chB: $('.fp-ch .b'), chC: $('.fp-ch .c'), chD: $('.fp-ch .d'), hm: $('.fp-hm'), dmg: $('.fp-dmg'), vig: $('.fp-vig'), scope: $('.fp-scope'), tl: $('.fp-tl'), tc: $('.fp-tc'), feed: $('.fp-feed'), pop: $('.fp-pop'), sub: $('.fp-sub'), chat: $('.fp-chat'), hint: $('.fp-hint'), touch: $('.fp-touch') };
    G.hudBind(hud, H);
    const cache = {};
    const setT = (el, k, v) => { if (cache[k] !== v) { cache[k] = v; el.textContent = v; } };
    const setS = (el, k, prop, v) => { if (cache[k] !== v) { cache[k] = v; el.style[prop] = v; } };
    const setH = (el, k, v) => { if (cache[k] !== v) { cache[k] = v; el.innerHTML = v; } };

    let scr = 'menu', W = null, me = null, paused = false, menuT = 0, over = null, sbOpen = false, chatOpen = false, deathUI = null, lastRaf = performance.now(), simAcc = 0, roundN = 0, matchT0 = 0;
    const look = { yaw: 0, pitch: 0, roll: 0 };
    const keys = new Set();
    const NET = { role: null, slot: 0, players: [], bots: false, size: 0, buf: [], off: 0, offSet: false, lastIn: 0, inSeq: 0, lastSnap: 0, names: [], hooked: false, cfg: null, pend: [], lastSc: 0, guestEv: [], snapK: 0, rtt: 0 };
    const online = () => !!NET.role;
    const FEED = [], POPS = [];

    const locked = () => document.pointerLockElement === canvas;
    let freeMouse = false, unlockIntent = false, lockT = 0, uiT = 0, wantLock = 0, touchMode = COARSE, padOn = false, padT = 0;
    function lockMouse() {
      if (touchMode || locked() || scr !== 'play' || paused) return;
      wantLock = performance.now();
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { freeMouse = true; }); } catch (e) { freeMouse = true; }
    }
    function releaseMouse() { uiT = performance.now(); if (locked()) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) {} } }
    api.on(document, 'pointerlockchange', () => {
      const t = performance.now();
      if (locked()) { freeMouse = false; lockT = t; if (scr !== 'play' || paused || chatOpen) releaseMouse(); return; }
      clearButtons();
      if (unlockIntent) { unlockIntent = false; return; }
      if (t - uiT < 500) return;
      if (scr === 'play' && !paused && !chatOpen && !touchMode) openPause();
    });
    api.on(document, 'pointerlockerror', () => { freeMouse = true; });
    const inp = { fire: false, ads: false, adsT: false, mxT: 0, mzT: 0, jumpT: false, crouchT: false, fireT: false, lookX: 0, lookY: 0 };
    function clearButtons() { inp.fire = false; inp.ads = false; keys.clear(); }

    const lookBy = (dx, dy) => {
      if (scr !== 'play' || paused || !me) return;
      const z = me.alive ? G.fovFor(me) : 1;
      const k = 0.0021 * SV.sens * (me.adsF > 0.5 ? SV.ads / Math.max(1, z * 0.75) : 1);
      look.yaw -= dx * k; look.pitch = clamp(look.pitch - dy * k * (SV.inv ? -1 : 1), -1.55, 1.55);
    };
    api.on(document, 'mousemove', e => {
      if (touchMode && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      if (locked()) { if (Math.abs(e.movementX) < 500 && Math.abs(e.movementY) < 500) lookBy(e.movementX, e.movementY); return; }
      if (freeMouse && scr === 'play' && !paused && (e.buttons & 3) && !touchMode) lookBy(e.movementX || 0, e.movementY || 0);
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('mousedown', e => {
      if (e.target.closest('.fp-ui button,.fp-ui input,.fp-ui select,.fp-ui a,.fp-chat input')) return;
      if (performance.now() - lastTouch < 800) return;
      if (touchMode) { touchMode = false; touchUI(); }
      audio.unlock();
      if (scr !== 'play' || paused) return;
      e.preventDefault();
      if (!locked() && !freeMouse) { lockMouse(); return; }
      if (e.button === 0) inp.fire = true;
      else if (e.button === 2) inp.ads = true;
      else if (e.button === 1) pressN('nadeN');
    });
    api.on(window, 'mouseup', e => { if (e.button === 0) inp.fire = false; if (e.button === 2) inp.ads = false; });
    api.on(window, 'blur', () => { clearButtons(); });
    api.on(document, 'visibilitychange', () => { if (document.hidden) clearButtons(); });
    wrap.addEventListener('wheel', e => { if (scr === 'play' && !paused && !e.target.closest('.fp-card')) { e.preventDefault(); if (Math.abs(e.deltaY) > 2 && performance.now() - (inp.wheelT || 0) > 160) { inp.wheelT = performance.now(); pressN('swapN'); } } }, { passive: false });
    const pressN = k => { if (me && scr === 'play' && !paused) me.in[k]++; };
    const KM = Object.assign({ fwd: ['KeyW', 'ArrowUp'], back: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], jump: ['Space'], crouch: ['ShiftLeft', 'KeyC', 'ControlLeft'], reload: ['KeyR'], swap: ['KeyQ'], melee: ['KeyV', 'KeyF'], nade: ['KeyG'], ads: [], sb: ['Tab'], chat: ['Enter', 'KeyT'] }, G.keys || {});
    const has = (k, c) => KM[k].includes(c);
    api.on(window, 'keydown', e => {
      if (!api.alive) return;
      if (!e.isTrusted && padOn && e.code !== 'Escape') return;
      if (e.target && e.target.closest && e.target.closest('input,textarea,select') && !e.target.closest('.fp-chat')) return;
      if (chatOpen) return;
      const c = e.code;
      if (c === 'Escape') { e.preventDefault(); if (e.repeat) return; if (sbOpen) { sbOpen = false; drawSB(); } if (scr === 'play') { if (paused) closePause(); else openPause(); } else if (scr === 'over' && over && over.back) over.back(); return; }
      if (scr !== 'play' || paused) { if (scr === 'dead' && (c === 'Space' || c === 'Enter') && deathUI && deathUI.go) { e.preventDefault(); deathUI.go(); } return; }
      if (has('sb', c)) { e.preventDefault(); if (!e.repeat) { sbOpen = true; drawSB(); } return; }
      if (has('chat', c) && online() && !e.repeat) { e.preventDefault(); openChat(); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(c) || has('crouch', c) && c === 'ControlLeft') e.preventDefault();
      if (e.repeat) return;
      keys.add(c);
      if (!me) return;
      if (me.alive) {
        if (has('reload', c)) me.in.reloadN++;
        else if (has('swap', c)) me.in.swapN++;
        else if (has('melee', c)) me.in.meleeN++;
        else if (has('nade', c)) me.in.nadeN++;
        else if (/^Digit[1-9]$/.test(c)) { const n = +c.slice(5) - 1; if (me.weps[n]) { me.in.slot = n; me.in.slotN++; } }
        if (has('ads', c)) inp.ads = true;
      } else if (deathUI && /^Digit[1-9]$/.test(c)) { const n = +c.slice(5) - 1; if (G.classes[n]) deathUI.pick(n); }
      else if (deathUI && (c === 'Space' || c === 'Enter') && deathUI.go) deathUI.go();
    });
    api.on(window, 'keyup', e => {
      if (!e.isTrusted && padOn && e.code !== 'Escape') return;
      keys.delete(e.code);
      if (has('sb', e.code) && sbOpen) { sbOpen = false; drawSB(); }
      if (has('ads', e.code)) inp.ads = false;
    });

    let lastTouch = 0;
    const TB = {};
    let stick = null, lookT = null;
    function touchUI() {
      H.touch.hidden = !touchMode || scr !== 'play';
      wrap.classList.toggle('fp-tm', touchMode);
      if (!touchMode) return;
      if (H.touch.childElementCount) return;
      const btn = (k, label, x, y, s) => { const b = document.createElement('div'); b.className = 'tb'; b.dataset.k = k; b.style.cssText = `right:${x}cqw;bottom:${y}cqh;width:${s}cqmin;height:${s}cqmin`; b.innerHTML = label; H.touch.append(b); TB[k] = b; return b; };
      const ic = G.touchIcons;
      btn('fire', ic.fire, 5, 24, 19); btn('ads', ic.ads, 23, 38, 13); btn('jump', ic.jump, 3, 50, 14);
      if (G.phys.H !== G.phys.HC) btn('crouch', ic.crouch, 23, 19, 12);
      btn('reload', ic.reload, 17, 62, 10); btn('swap', ic.swap, 3, 68, 10);
      if (G.nade) { btn('nade', ic.nade, 31, 58, 10); btn('melee', ic.melee, 38, 44, 9); } else btn('melee', ic.melee, 31, 58, 10);
      const pb = document.createElement('div'); pb.className = 'tb'; pb.dataset.k = 'pause'; pb.style.cssText = 'right:1.5cqw;top:1.5cqw;width:9cqmin;height:9cqmin;border-radius:12px'; pb.innerHTML = ic.pause; H.touch.append(pb); TB.pause = pb;
      const sb = document.createElement('div'); sb.className = 'tb'; sb.dataset.k = 'sb'; sb.style.cssText = 'right:12cqmin;top:1.5cqw;width:9cqmin;height:9cqmin;border-radius:12px'; sb.innerHTML = ic.sb; H.touch.append(sb); TB.sb = sb;
      const st = document.createElement('div'); st.className = 'fp-stick'; st.innerHTML = '<i></i>'; st.hidden = true; H.touch.append(st); TB.stick = st;
    }
    const touches = new Map();
    const wr = () => wrap.getBoundingClientRect();
    function tStart(e) {
      lastTouch = performance.now();
      if (!touchMode) { touchMode = true; touchUI(); releaseMouse(); }
      audio.unlock();
      if (scr !== 'play' || paused) return;
      if (e.target.closest('.fp-ui button,.fp-ui input,.fp-card')) return;
      e.preventDefault();
      const r = wr();
      for (const t of e.changedTouches) {
        const b = t.target.closest && t.target.closest('.tb');
        const x = t.clientX - r.left, y = t.clientY - r.top;
        if (b) {
          const k = b.dataset.k; b.classList.add('on');
          touches.set(t.identifier, { k, x: t.clientX, y: t.clientY, b });
          if (k === 'fire') inp.fireT = true;
          else if (k === 'ads') inp.adsT = !inp.adsT;
          else if (k === 'jump') inp.jumpT = true;
          else if (k === 'crouch') inp.crouchT = true;
          else if (k === 'reload') pressN('reloadN');
          else if (k === 'swap') pressN('swapN');
          else if (k === 'nade') pressN('nadeN');
          else if (k === 'melee') pressN('meleeN');
          else if (k === 'pause') openPause();
          else if (k === 'sb') { sbOpen = !sbOpen; drawSB(); }
          continue;
        }
        if (x < r.width * 0.42 && !stick) { stick = { id: t.identifier, x0: x, y0: y, x, y }; TB.stick.hidden = false; TB.stick.style.left = x + 'px'; TB.stick.style.top = y + 'px'; touches.set(t.identifier, { k: 'stick' }); }
        else touches.set(t.identifier, { k: 'look', x: t.clientX, y: t.clientY });
      }
    }
    function tMove(e) {
      if (!touches.size) return;
      e.preventDefault();
      const r = wr(), rad = Math.min(r.width, r.height) * 0.12;
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        if (s.k === 'stick' && stick) {
          let dx = t.clientX - r.left - stick.x0, dy = t.clientY - r.top - stick.y0;
          const l = Math.hypot(dx, dy);
          if (l > rad * 1.6) { stick.x0 += dx * (1 - rad * 1.6 / l); stick.y0 += dy * (1 - rad * 1.6 / l); dx = t.clientX - r.left - stick.x0; dy = t.clientY - r.top - stick.y0; TB.stick.style.left = stick.x0 + 'px'; TB.stick.style.top = stick.y0 + 'px'; }
          const k = Math.min(1, Math.hypot(dx, dy) / rad);
          const a = Math.atan2(dy, dx);
          inp.mxT = Math.cos(a) * k; inp.mzT = -Math.sin(a) * k;
          if (Math.hypot(inp.mxT, inp.mzT) < 0.15) inp.mxT = inp.mzT = 0;
          TB.stick.firstChild.style.transform = `translate(${Math.cos(a) * k * rad * 0.6}px,${Math.sin(a) * k * rad * 0.6}px)`;
        } else if (s.k === 'look' || s.k === 'fire' || s.k === 'ads') {
          const dx = t.clientX - s.x, dy = t.clientY - s.y;
          s.x = t.clientX; s.y = t.clientY;
          const k = 2.4 * 900 / Math.max(300, r.width);
          lookBy(dx * k, dy * k);
        }
      }
    }
    function tEnd(e) {
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        touches.delete(t.identifier);
        if (s.b) s.b.classList.remove('on');
        if (s.k === 'stick') { stick = null; TB.stick.hidden = true; inp.mxT = inp.mzT = 0; }
        else if (s.k === 'fire') inp.fireT = false;
        else if (s.k === 'jump') inp.jumpT = false;
        else if (s.k === 'crouch') inp.crouchT = false;
        if (s.b && s.k === 'ads') s.b.classList.toggle('on', inp.adsT);
      }
    }
    wrap.addEventListener('touchstart', tStart, { passive: false });
    wrap.addEventListener('touchmove', tMove, { passive: false });
    wrap.addEventListener('touchend', tEnd);
    wrap.addEventListener('touchcancel', tEnd);
    function resetTouch() { touches.clear(); stick = null; if (TB.stick) TB.stick.hidden = true; inp.mxT = inp.mzT = 0; inp.fireT = inp.jumpT = inp.crouchT = inp.adsT = false; for (const k in TB) if (TB[k].classList) TB[k].classList.remove('on'); }

    const PAD = { prev: [] };
    function readPad(dt) {
      const gp = navigator.getGamepads ? navigator.getGamepads() : null;
      let pad = null;
      if (gp) for (const g of gp) if (g && g.connected && g.mapping === 'standard') { pad = g; break; }
      if (!pad) { if (padOn && performance.now() - padT > 2000) padOn = false; return null; }
      const ax = pad.axes, bt = pad.buttons, dz = v => Math.abs(v) < 0.16 ? 0 : (v - Math.sign(v) * 0.16) / 0.84;
      const pr = i => bt[i] && (bt[i].pressed || bt[i].value > 0.5);
      let any = Math.abs(ax[0]) > 0.3 || Math.abs(ax[1]) > 0.3 || Math.abs(ax[2]) > 0.3 || Math.abs(ax[3]) > 0.3;
      for (let i = 0; i < bt.length; i++) if (pr(i)) any = true;
      if (any) { padOn = true; padT = performance.now(); }
      if (!padOn) return null;
      const edge = i => pr(i) && !PAD.prev[i];
      const out = { mx: dz(ax[0]), mz: -dz(ax[1]), fire: pr(7), ads: pr(6), jump: pr(0), crouch: pr(1) || pr(10) };
      if (scr === 'play' && !paused && me) {
        const lx = dz(ax[2]), ly = dz(ax[3]), sp = 3.2 * SV.sens * dt / 0.0021;
        lookBy(Math.sign(lx) * lx * lx * sp, Math.sign(ly) * ly * ly * sp * 0.75);
        if (edge(2)) me.in.reloadN++;
        if (edge(3)) me.in.swapN++;
        if (edge(5)) { if (G.nade) me.in.nadeN++; else me.in.meleeN++; }
        if (edge(4)) me.in.meleeN++;
      }
      if (edge(9)) { if (scr === 'play') { if (paused) closePause(); else openPause(); } }
      if (edge(8)) { sbOpen = !sbOpen; drawSB(); }
      if (scr === 'dead' && edge(0) && deathUI && deathUI.go) deathUI.go();
      for (let i = 0; i < bt.length; i++) PAD.prev[i] = pr(i);
      return out;
    }

    function localInput(dt) {
      if (!me) return;
      const I = me.in;
      const pad = readPad(dt);
      const act = scr === 'play' && !paused && !chatOpen;
      let mx = 0, mz = 0;
      if (act) {
        for (const c of keys) { if (has('fwd', c)) mz += 1; if (has('back', c)) mz -= 1; if (has('left', c)) mx -= 1; if (has('right', c)) mx += 1; }
        mx = clamp(mx, -1, 1); mz = clamp(mz, -1, 1);
        if (inp.mxT || inp.mzT) { mx = inp.mxT; mz = inp.mzT; }
        if (pad && (pad.mx || pad.mz)) { mx = pad.mx; mz = pad.mz; }
      }
      I.mx = mx; I.mz = mz;
      let jump = false, crouch = false;
      if (act) { for (const c of keys) { if (has('jump', c)) jump = true; if (has('crouch', c)) crouch = true; } }
      I.jump = act && (jump || inp.jumpT || !!(pad && pad.jump));
      I.crouch = act && (crouch || inp.crouchT || !!(pad && pad.crouch));
      I.fire = act && (inp.fire || inp.fireT || !!(pad && pad.fire)) && performance.now() - lockT > 120;
      I.ads = act && (inp.ads || inp.adsT || !!(pad && pad.ads));
      I.yaw = look.yaw; I.pitch = look.pitch;
    }

    const SBD = document.createElement('div'); SBD.className = 'fp-sb'; SBD.hidden = true; ui.append(SBD);
    function standings() {
      if (!W) return [];
      return W.players.filter(p => p && p.inGame).slice().sort((a, b) => b.score - a.score || b.kills - a.kills || a.deaths - b.deaths);
    }
    function pname(p) { return p.slot === (me && me.slot) ? p.name : p.name; }
    function drawSB() {
      SBD.hidden = !sbOpen || !W;
      if (SBD.hidden) return;
      const L = standings();
      const row = (p, i) => `<tr class="${p === me ? 'me' : ''}${W.teams ? ' t' + p.team : ''}"><td>${i + 1}</td><td><span translate="no">${escH(p.name)}</span>${p.bot ? ' <small>' + escH(T('Bot')) + '</small>' : ''}</td><td>${escH(T(G.classes[p.cls].name))}</td><td>${p.score}</td><td>${p.kills}</td><td>${p.deaths}</td><td>${online() && NET.ping && NET.ping[p.slot] != null ? NET.ping[p.slot] : '—'}</td></tr>`;
      const head = `<tr><th>#</th><th>${escH(T('Player'))}</th><th>${escH(T('Class'))}</th><th>${escH(T('Score'))}</th><th>${escH(T('Kills'))}</th><th>${escH(T('Deaths'))}</th><th>${escH(T('Ping'))}</th></tr>`;
      let body;
      if (W.teams) body = [0, 1].map(t => `<tr class="th t${t}"><td colspan="7">${escH(T(G.teams[t]))} · ${W.teamScore[t]}</td></tr>` + L.filter(p => p.team === t).map(row).join('')).join('');
      else body = L.map(row).join('');
      SBD.innerHTML = `<div class="fp-card fp-sbc"><h3>${escH(T(W.mode.name))} · ${escH(T(W.M.def.name))}</h3><table>${head}${body}</table></div>`;
    }

    function itemsPanel(html, cls) {
      ui.querySelectorAll('.fp-menu').forEach(x => x.remove());
      if (html == null) return null;
      const el = document.createElement('div'); el.className = 'fp-menu ' + (cls || '');
      el.innerHTML = html;
      ui.append(el);
      return el;
    }
    const seg = (k, opts, cur) => `<div class="fp-seg" data-seg="${k}">${opts.map(([v, l]) => `<button type="button" class="${String(v) === String(cur) ? 'on' : ''}" data-v="${v}">${escH(l)}</button>`).join('')}</div>`;
    const lvlOf = xp => { let n = 1, x = xp; while (x >= LVL_XP(n)) { x -= LVL_XP(n); n++; } return { n, x, need: LVL_XP(n) }; };
    function classCards(sel, small) {
      return `<div class="fp-clsg${small ? ' sm' : ''}">${G.classes.map((c, i) => { const w = G.weapons[c.prim]; return `<button type="button" class="fp-cls${i === sel ? ' on' : ''}" data-cls="${i}"><span class="ic">${G.wepIcon(c.prim)}</span><b>${escH(T(c.name))}</b><small>${escH(T(w.name))}</small>${small ? '' : `<span class="bars">${G.statBars(c).map(([l, v]) => `<span><em>${escH(T(l))}</em><i style="--v:${Math.round(v * 100)}%"></i></span>`).join('')}</span>`}<kbd>${i + 1}</kbd></button>`; }).join('')}</div>`;
    }
    function clsDetail(i) {
      const c = G.classes[i];
      return `<p>${escH(T(c.desc))}</p><span class="bars">${G.statBars(c).map(([l, v]) => `<span><em>${escH(T(l))}</em><i style="--v:${Math.round(clamp(v, 0.04, 1) * 100)}%"></i></span>`).join('')}</span>`;
    }
    function classList(sel) {
      return `<div class="fp-clsl">${G.classes.map((c, i) => `<button type="button" class="fp-cls${i === sel ? ' on' : ''}" data-cls="${i}"><span class="ic">${G.wepIcon(c.prim)}</span><span class="tx"><b>${escH(T(c.name))}</b><small>${escH(T(G.weapons[c.prim].name))}</small></span><kbd>${i + 1}</kbd></button>`).join('')}</div><div class="fp-clsd">${clsDetail(sel)}</div>`;
    }
    function menu() {
      scr = 'menu'; paused = false; hud.hidden = true; SBD.hidden = true; releaseMouse(); H.touch.hidden = true; deathUI = null;
      if (!W) previewWorld();
      const st = SV.st, L = lvlOf(st.xp);
      const kd = st.d ? (st.k / st.d).toFixed(2) : st.k ? st.k.toFixed(2) : '0.00';
      const el = itemsPanel(`<div class="fp-card fp-main"><div class="fp-col">
<div class="fp-brand">${G.logo()}</div>
<div class="fp-lv"><span class="lvb">${escH(T('Level'))} <b translate="no">${L.n}</b></span><span class="lvbar"><i style="width:${Math.round(L.x / L.need * 100)}%"></i></span><span class="lvs" translate="no">${st.k} ${escH(T('kills'))} · ${escH(T('K/D'))} ${kd} · ${st.w} ${escH(T('wins'))}</span></div>
<div class="fp-opts">
<label>${escH(T('Mode'))}</label>${seg('mode', G.modes.map(m => [m.key, T(m.name)]), SV.mode)}
<label>${escH(T('Map'))}</label>${seg('map', [['random', T('Random')]].concat(G.maps.map(m => [m.key, T(m.name)])), SV.map)}
<label>${escH(T('Bots'))}</label>${seg('diff', DIFFS.map((d, i) => [i, T(d)]), SV.diff)}
<label>${escH(T('Players'))}</label><div class="fp-row fp-num"><button type="button" class="fp-btn sm" data-n="-1" aria-label="${escH(T('Fewer bots'))}">−</button><b translate="no">${SV.bots + 1}</b><button type="button" class="fp-btn sm" data-n="1" aria-label="${escH(T('More bots'))}">+</button><small>${escH(T('you and {n} bots', { n: SV.bots }))}</small></div>
</div>
<div class="fp-acts"><button type="button" class="fp-btn big" data-a="play">${escH(T('Play'))}</button><button type="button" class="fp-btn" data-a="online">${escH(T('Play online'))}</button></div>
<div class="fp-acts sm"><button type="button" class="fp-btn ghost" data-a="opts">${escH(T('Settings'))}</button><button type="button" class="fp-btn ghost" data-a="how">${escH(T('How to play'))}</button></div>
</div><div class="fp-col"><label class="fp-lab">${escH(T('Class'))}</label>${classList(SV.cls)}</div>
</div>`, 'm-main');
      el.onclick = e => {
        audio.unlock();
        const sb = e.target.closest('[data-seg] button');
        if (sb) { const k = sb.parentNode.dataset.seg; SV[k] = k === 'diff' ? +sb.dataset.v : sb.dataset.v; persist(); api.sfx('tap'); sb.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sb)); if (k === 'map') previewWorld(); return; }
        const n = e.target.closest('[data-n]');
        if (n) { SV.bots = clamp(SV.bots + +n.dataset.n, 1, G.maxBots || 11); persist(); api.sfx('tap'); menu(); return; }
        const c = e.target.closest('[data-cls]');
        if (c) { SV.cls = +c.dataset.cls; persist(); api.sfx('tap'); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', b === c)); const dd = el.querySelector('.fp-clsd'); if (dd) dd.innerHTML = clsDetail(SV.cls); return; }
        const a = e.target.closest('[data-a]');
        if (!a) return;
        api.sfx('tap');
        if (a.dataset.a === 'play') startOffline();
        else if (a.dataset.a === 'online') goOnline();
        else if (a.dataset.a === 'opts') settings(menu);
        else if (a.dataset.a === 'how') howTo(menu);
      };
    }
    function settings(back) {
      const el = itemsPanel(`<div class="fp-card fp-set"><h3>${escH(T('Settings'))}</h3>
<label>${escH(T('Mouse sensitivity'))}</label><div class="fp-range"><input type="range" min="0.1" max="4" step="0.05" value="${SV.sens}" data-r="sens"><b translate="no">${SV.sens.toFixed(2)}</b></div>
<label>${escH(T('Aiming sensitivity'))}</label><div class="fp-range"><input type="range" min="0.2" max="2" step="0.05" value="${SV.ads}" data-r="ads"><b translate="no">${SV.ads.toFixed(2)}</b></div>
<label>${escH(T('Field of view'))}</label><div class="fp-range"><input type="range" min="60" max="110" step="1" value="${SV.fov}" data-r="fov"><b translate="no">${SV.fov}</b></div>
<label>${escH(T('Volume'))}</label><div class="fp-range"><input type="range" min="0" max="1" step="0.05" value="${SV.vol}" data-r="vol"><b translate="no">${Math.round(SV.vol * 100)}</b></div>
<label>${escH(T('Invert mouse'))}</label>${seg('inv', [[0, T('Off')], [1, T('On')]], SV.inv ? 1 : 0)}
<label>${escH(T('Graphics'))}</label>${seg('q', [[-1, T('Auto')], [0, T('High')], [1, T('Medium')], [2, T('Low')], [3, T('Lowest')]], SV.q)}
<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Back'))}</button></div></div>`, 'm-set');
      el.addEventListener('input', e => {
        const r = e.target.closest('[data-r]');
        if (!r) return;
        const k = r.dataset.r, v = +r.value;
        SV[k] = v; r.nextElementSibling.textContent = k === 'vol' ? Math.round(v * 100) : k === 'fov' ? v : v.toFixed(2);
        if (k === 'vol') audio.vol = v;
        persist();
      });
      el.onclick = e => {
        const sb = e.target.closest('[data-seg] button');
        if (sb) { const k = sb.parentNode.dataset.seg, v = +sb.dataset.v; if (k === 'inv') SV.inv = !!v; else { SV.q = v; PR.force = v; } persist(); api.sfx('tap'); sb.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sb)); return; }
        if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); back(); }
      };
    }
    function howTo(back) {
      const el = itemsPanel(`<div class="fp-card fp-how"><h3>${escH(T('How to play'))}</h3>${G.howHTML(T, escH)}<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Back'))}</button></div></div>`, 'm-how');
      el.onclick = e => { if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); SV.help = true; persist(); back(); } };
    }
    function openPause() {
      if (scr !== 'play' || paused) return;
      paused = !online(); clearButtons(); resetTouch(); releaseMouse(); sbOpen = false; SBD.hidden = true;
      const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(online() ? 'Menu' : 'Paused'))}</h3><div class="fp-acts col"><button type="button" class="fp-btn big" data-a="res">${escH(T('Resume'))}</button><button type="button" class="fp-btn" data-a="cls">${escH(T('Change class'))}</button><button type="button" class="fp-btn ghost" data-a="set">${escH(T('Settings'))}</button><button type="button" class="fp-btn ghost" data-a="how">${escH(T('How to play'))}</button><button type="button" class="fp-btn ghost" data-a="quit">${escH(T(online() ? 'Leave game' : 'Quit match'))}</button></div>${online() ? `<p class="fp-note">${escH(T('The match keeps going while this menu is open.'))}</p>` : ''}</div>`, 'm-pause');
      paused = true;
      el.onclick = e => {
        const a = e.target.closest('[data-a]');
        if (!a) return;
        api.sfx('tap');
        const k = a.dataset.a;
        if (k === 'res') closePause();
        else if (k === 'cls') classPick(() => openPauseAgain());
        else if (k === 'set') settings(() => openPauseAgain());
        else if (k === 'how') howTo(() => openPauseAgain());
        else if (k === 'quit') confirmQuit();
      };
    }
    function openPauseAgain() { paused = false; openPause(); }
    function confirmQuit() {
      const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(online() ? 'Leave this game?' : 'Quit this match?'))}</h3><p class="fp-note">${escH(T('Your progress in this match will be lost.'))}</p><div class="fp-acts"><button type="button" class="fp-btn" data-a="no">${escH(T('Stay'))}</button><button type="button" class="fp-btn ghost" data-a="yes">${escH(T(online() ? 'Leave' : 'Quit'))}</button></div></div>`, 'm-pause');
      el.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; api.sfx('tap'); if (a.dataset.a === 'yes') quitMatch(); else openPauseAgain(); };
    }
    function classPick(back) {
      const el = itemsPanel(`<div class="fp-card fp-cp"><h3>${escH(T('Choose a class'))}</h3><p class="fp-note">${escH(T('You change class the next time you spawn.'))}</p>${classCards(me ? me.nextCls : SV.cls)}<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Done'))}</button></div></div>`, 'm-cp');
      el.onclick = e => {
        const c = e.target.closest('[data-cls]');
        if (c) { setClass(+c.dataset.cls); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', b === c)); api.sfx('tap'); return; }
        if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); back(); }
      };
    }
    function setClass(i) {
      SV.cls = i; persist();
      if (!me) return;
      me.nextCls = i;
      if (NET.role === 'guest') netSend({ t: 'cl', c: i });
    }
    function closePause() {
      if (!paused && scr !== 'play') return;
      paused = false; itemsPanel(null); uiT = performance.now();
      if (me && !me.alive && W && !W.over) showDeath();
      else lockMouse();
      lastRaf = performance.now(); simAcc = 0;
    }

    function previewWorld() {
      const key = SV.map === 'random' ? G.maps[0].key : SV.map;
      const md = G.maps.find(m => m.key === key) || G.maps[0];
      const M = G.mapCache[md.key] || (G.mapCache[md.key] = compileMap(md));
      view.setMap(M);
      menuT = 0;
      for (let i = 0; i < 16; i++) view.dropChar(i);
      view.clearFx();
      previewM = M;
    }
    let previewM = null;

    function teamOf(i, n) { return i % 2; }
    function botNames(n, rnd) {
      const pool = G.botNames.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const q = pool[i]; pool[i] = pool[j]; pool[j] = q; }
      return pool.slice(0, n);
    }
    function myName() {
      try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (p && (p.username || p.displayName)) return String(p.username || p.displayName).replace(/[<>&"']/g, '').slice(0, 16); } catch (e) {}
      return SV.name || T('You');
    }
    function pickMap(rnd) {
      if (SV.map !== 'random') return G.maps.find(m => m.key === SV.map) || G.maps[0];
      return G.maps[Math.floor(rnd() * G.maps.length)];
    }
    function newWorld(md, modeKey, seed, auth) {
      const w = mkWorld(G, md, { mode: modeKey, seed, auth });
      view.setMap(w.M); view.clearFx(); view.teams = w.teams;
      for (let i = 0; i < 16; i++) view.dropChar(i);
      return w;
    }
    function startOffline() {
      const seed = (Math.random() * 1e9) | 0, rnd = mkRng(seed);
      const md = pickMap(rnd);
      W = newWorld(md, SV.mode, seed, true);
      const n = SV.bots, names = botNames(n, rnd);
      me = mkPlayer(W, 0, { name: myName(), team: 0, cls: SV.cls, local: true });
      W.players.push(me);
      for (let i = 0; i < n; i++) {
        const p = mkPlayer(W, i + 1, { name: names[i] || 'Bot ' + (i + 1), team: W.teams ? teamOf(i + 1) : 0, cls: 0, bot: true, diff: SV.diff });
        p.cls = p.nextCls = botClass(W, p);
        p.respawnT = 0.2 + i * 0.05;
        W.players.push(p);
      }
      spawnPlayer(W, me);
      beginPlay();
    }
    function beginPlay() {
      scr = 'play'; paused = false; over = null; itemsPanel(null); hud.hidden = false; FEED.length = 0; POPS.length = 0; sbOpen = false; drawSB(); deathUI = null;
      H.feed.innerHTML = ''; H.pop.innerHTML = ''; H.sub.textContent = ''; H.chat.innerHTML = '';
      for (const k in cache) delete cache[k];
      look.yaw = me.yaw; look.pitch = 0; simAcc = 0; lastRaf = performance.now(); roundN++; matchT0 = performance.now();
      G.hudReset && G.hudReset(H);
      touchUI(); lockMouse();
      if (!SV.help && !touchMode) { showHint(T(G.firstHint), 6); SV.help = true; persist(); }
      W.ev.length = 0;
      audio.play('start');
    }
    let hintT = 0;
    function showHint(s, sec) { H.hint.textContent = s; H.hint.hidden = false; hintT = sec; }
    function quitMatch() {
      if (online()) { leaveOnline(); return; }
      W = null; me = null; itemsPanel(null); menu();
    }

    function showDeath() {
      if (!me || me.alive || scr !== 'play' || paused || W.over) return;
      const k = W.players[me.killer];
      const kn = k && k !== me ? k.name : '';
      const wk = me.killerW && G.weapons[me.killerW] ? T(G.weapons[me.killerW].name) : me.killerW === 'fall' ? T('the fall') : '';
      releaseMouse();
      const el = itemsPanel(`<div class="fp-card fp-death"><p class="fp-kick">${escH(T(kn ? 'Eliminated by' : 'Eliminated'))}</p>${kn ? `<h3 translate="no">${escH(kn)}</h3>` : ''}${wk ? `<p class="fp-note">${escH(wk)}</p>` : ''}<p class="fp-rs" translate="no"></p>${classCards(me.nextCls, true)}${G.manualSpawn ? `<div class="fp-acts"><button type="button" class="fp-btn big" data-a="go" disabled>${escH(T('Respawn'))}</button></div>` : `<p class="fp-note">${escH(T('Pick a class for your next life.'))}</p>`}</div>`, 'm-death');
      const go = el.querySelector('[data-a="go"]');
      deathUI = {
        el, go: null,
        pick(i) { setClass(i); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', +b.dataset.cls === i)); api.sfx('tap'); },
        tick() {
          const left = Math.max(0, me.respawnT);
          const t = el.querySelector('.fp-rs');
          if (left > 0) { setT(t, 'rs', T('Respawn in {n}', { n: Math.ceil(left) })); if (go) go.disabled = true; deathUI.go = null; }
          else { setT(t, 'rs', G.manualSpawn ? T('Ready') : ''); if (go) go.disabled = false; deathUI.go = respawnNow; }
        }
      };
      el.onclick = e => {
        const c = e.target.closest('[data-cls]');
        if (c) { deathUI.pick(+c.dataset.cls); return; }
        if (e.target.closest('[data-a="go"]') && deathUI.go) deathUI.go();
      };
    }
    function respawnNow() {
      if (!me || me.alive) return;
      if (me.respawnT > 0) return;
      api.sfx('tap');
      me.wantSpawn = true;
      if (NET.role === 'guest') netSend({ t: 'rs', c: me.nextCls });
      deathUI = null; itemsPanel(null); uiT = performance.now();
      lockMouse();
    }

    function matchOver() {
      if (scr === 'over') return;
      scr = 'over'; releaseMouse(); hud.hidden = true; sbOpen = false; SBD.hidden = true; resetTouch(); H.touch.hidden = true;
      const L = standings();
      let win = false, title;
      if (W.teams) { const t = W.teamScore[0] === W.teamScore[1] ? -1 : W.teamScore[0] > W.teamScore[1] ? 0 : 1; win = t === me.team; title = t < 0 ? T('Draw') : win ? T('Victory') : T('Defeat'); }
      else { win = L[0] === me; title = win ? T('Victory') : T('{name} wins', { name: L[0] ? L[0].name : '' }); }
      const place = L.indexOf(me) + 1;
      const acc = me.shots ? Math.round(me.hits / me.shots * 100) : 0;
      const xp = Math.round(me.score + (win ? 300 : 100));
      const st = SV.st, before = lvlOf(st.xp).n;
      let nb = false;
      if (!over || !over.saved) {
        st.m++; if (win) st.w++; st.k += me.kills; st.d += me.deaths; st.h += me.heads; st.sh += me.shots; st.hi += me.hits; st.bs = Math.max(st.bs, me.bestStreak); st.best = Math.max(st.best, me.kills); st.xp += xp; st.t += Math.round((performance.now() - matchT0) / 1000);
        persist();
        if (me.kills > 0) nb = api.submit(me.kills);
      }
      const after = lvlOf(st.xp).n;
      audio.play(win ? 'win' : 'lose');
      const rows = L.map((p, i) => `<tr class="${p === me ? 'me' : ''}${W.teams ? ' t' + p.team : ''}"><td>${i + 1}</td><td><span translate="no">${escH(p.name)}</span></td><td>${p.score}</td><td>${p.kills}</td><td>${p.deaths}</td></tr>`).join('');
      const host = NET.role === 'host', guest = NET.role === 'guest';
      const btns = guest ? `<button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button>` : host ? `<button type="button" class="fp-btn big" data-a="again">${escH(T('Next match'))}</button><button type="button" class="fp-btn" data-a="lobby">${escH(T('Party lobby'))}</button><button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button>` : `<button type="button" class="fp-btn big" data-a="again">${escH(T('Next match'))}</button><button type="button" class="fp-btn ghost" data-a="menu">${escH(T('Menu'))}</button>`;
      const el = itemsPanel(`<div class="fp-card fp-over ${win ? 'win' : 'lose'}"><p class="fp-kick">${escH(T(W.mode.name))} · ${escH(T(W.M.def.name))}</p><h3>${escH(title)}</h3>${W.teams ? `<p class="fp-ts" translate="no"><span class="t0">${W.teamScore[0]}</span> : <span class="t1">${W.teamScore[1]}</span></p>` : ''}
<div class="fp-stats"><div><b translate="no">#${place}</b><small>${escH(T('Place'))}</small></div><div><b translate="no">${me.kills}</b><small>${escH(T('Kills'))}</small></div><div><b translate="no">${me.deaths}</b><small>${escH(T('Deaths'))}</small></div><div><b translate="no">${acc}%</b><small>${escH(T('Accuracy'))}</small></div><div><b translate="no">${me.heads}</b><small>${escH(T(G.headWord || 'Headshots'))}</small></div><div><b translate="no">+${xp}</b><small>${escH(T('XP'))}</small></div></div>
${after > before ? `<p class="fp-lvup">${escH(T('Level up! You are now level {n}', { n: after }))}</p>` : nb ? `<p class="fp-lvup">${escH(T('New best: {n} kills', { n: me.kills }))}</p>` : ''}
<div class="fp-tbl"><table><tr><th>#</th><th>${escH(T('Player'))}</th><th>${escH(T('Score'))}</th><th>${escH(T('Kills'))}</th><th>${escH(T('Deaths'))}</th></tr>${rows}</table></div>
${guest ? `<p class="fp-note">${escH(T('Waiting for the host to start the next match…'))}</p>` : ''}<div class="fp-acts">${btns}</div></div>`, 'm-over');
      over = { saved: true, at: performance.now(), back: guest ? null : host ? () => toLobby() : () => { W = null; me = null; menu(); } };
      el.onclick = e => {
        const a = e.target.closest('[data-a]');
        if (!a || performance.now() - over.at < 700) return;
        api.sfx('tap');
        const k = a.dataset.a;
        if (k === 'again') { if (host) hostStart(); else startOffline(); }
        else if (k === 'menu') { W = null; me = null; menu(); }
        else if (k === 'lobby') toLobby();
        else if (k === 'leave') leaveOnline();
      };
    }

    const muzzleW = new THREE.Vector3();
    function shotStart(p, out) {
      if (p === me && !thirdPerson) {
        const cp = Math.cos(look.pitch), sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
        const fx = -sy * cp, fy = Math.sin(look.pitch), fz = -cy * cp, rx = cy, rz = -sy;
        const k = me.adsF;
        out.set(camS.x + fx * 0.6 + rx * 0.14 * (1 - k), camS.y + fy * 0.6 - 0.11 * (1 - k) - 0.04, camS.z + fz * 0.6 + rz * 0.14 * (1 - k));
        return out;
      }
      const c = view.chars[p.slot];
      if (c && c.muzzle) { c.root.updateMatrixWorld(); c.muzzle.getWorldPosition(out); return out; }
      return out.set(p.x, p.y + 1.4, p.z);
    }
    const tv = new THREE.Vector3();
    function onEv(e, fromNet) {
      const k = e[0], P = W.players;
      const p = typeof e[1] === 'number' ? P[e[1]] : null;
      const mine = p && p === me;
      if (fromNet && mine && ['fx', 'tr', 'j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'dry', 'nt'].includes(k)) return;
      switch (k) {
        case 'fx': {
          if (!p) break;
          const w = p.weps[e[2]] || p.weps[0];
          const wk = w ? w.k : G.classes[p.cls].prim;
          const d = G.weapons[wk];
          shotStart(p, tv);
          if (mine) { view.kickView(d.vkick || 0.6, d.vroll); fireT = 0; shakeCam(d.shake || 0); }
          else { const c = view.chars[p.slot]; if (c) c.fireT = 0; view.flashAt(tv.x, tv.y, tv.z); }
          audio.play(d.sound || 'rifle', mine ? null : p.x, p.y + 1.5, p.z, mine ? 1 : 0);
          break;
        }
        case 'tr': {
          if (!p) break;
          shotStart(p, tv);
          const x = e[2], y = e[3], z = e[4], kind = e[5];
          const w = p.weps[p.cur]; const d = w ? w.d : null;
          if (e[6] === 0 || (d && d.pellets && e[6] % 2 === 0)) view.tracer(tv.x, tv.y, tv.z, x, y, z, d && d.tw, d && d.tl);
          if (kind === 0) { view.hole(x, y, z, e[7], e[8], e[9]); G.impactFx(view, x, y, z, e[7], e[8], e[9]); if (e[6] === 0) audio.play('ric', x, y, z); }
          else if (kind === 1) { const v = P[e[8]]; G.hitFx(view, x, y, z, v, e[7]); }
          break;
        }
        case 'h': {
          const a = P[e[1]], v = P[e[2]];
          if (v && v === me) {
            me.hp = e[5]; dmgFlash = Math.min(1, dmgFlash + e[3] / 60);
            if (a && a !== me) addDmgDir(a);
            audio.play('hurt');
            if (e[7] && NET.role === 'guest') {}
          }
          if (a && a === me && v !== me) { hitMark(e[4] ? 2 : 1); audio.play(e[4] ? 'head' : 'hit'); if (e[4]) pop(T(G.headWord1 || 'Headshot'), 'hs', 0.6); }
          if (v && v !== me) v.hp = e[5];
          break;
        }
        case 'k': {
          const a = P[e[1]], v = P[e[2]];
          feed(a, v, e[3], e[4]);
          if (v) {
            if (fromNet || !W.auth) { v.alive = false; v.hp = 0; v.evT = W.t; v.deaths = fromNet ? v.deaths : v.deaths; v.killer = e[1]; v.killerW = e[3]; v.deathT = W.t; v.respawnT = G.respawn; if (v === me) { me.wantSpawn = !G.manualSpawn; } }
            G.deathFx(view, v, e[7], e[8], e[9]);
            audio.play('die', e[7], e[8] + 1, e[9]);
          }
          if (a && a === me && v !== me) {
            hitMark(3); audio.play('kill');
            const s = e[5];
            const nm = G.streakName(s);
            if (nm) pop(T(nm, { n: s }), 'st', 1.6); else pop(T('Eliminated {name}', { name: v ? v.name : '' }), 'el', 1.2);
            subPop('+' + (G.killScore + (e[4] ? G.headScore : 0)));
          }
          if (v === me) { dmgFlash = 1; api.timeout(() => showDeath(), 700); audio.play('dead'); }
          break;
        }
        case 'aw': { if (p === me) { const s = G.streaks.find(x => x.key === e[2]); if (s) { pop(T(s.name), 'aw', 1.8); audio.play('award'); if (fromNet) s.give(W, me); } } break; }
        case 'sp': {
          if (!p) break;
          if (fromNet || !W.auth) {
            if (p === me) { me.nextCls = e[6]; spawnPlayer(W, me, { x: e[2], y: e[3], z: e[4], yaw: e[5] }); W.ev.length = 0; }
            else { p.x = p.px = e[2]; p.y = p.py = e[3]; p.z = p.pz = e[4]; p.yaw = e[5]; p.cls = e[6]; p.alive = true; p.evT = W.t; p.holdT = W.t + 0.25; p.hp = p.maxHp = G.classes[e[6]].hp; const r = rs[p.slot]; if (r) { r.x = e[2]; r.y = e[3]; r.z = e[4]; r.yaw = e[5]; } }
          }
          if (p === me) { look.yaw = e[5]; look.pitch = 0; itemsPanel(null); deathUI = null; dmgFlash = 0; H.dmg.innerHTML = ''; if (scr === 'play' && !paused) lockMouse(); audio.play('spawn'); }
          const c = view.chars[p.slot]; if (c) c.deadT = -1;
          break;
        }
        case 'j': if (p) audio.play('jump', mine ? null : p.x, p.y, p.z); break;
        case 'sl': if (p) audio.play('slide', mine ? null : p.x, p.y, p.z); break;
        case 'ld': if (p) { audio.play('land', mine ? null : p.x, p.y, p.z, e[2]); if (mine) view.landView(e[2]); } break;
        case 'rl': if (p) { audio.play('reload', mine ? null : p.x, p.y + 1, p.z); const c = view.chars[p.slot]; if (c) c.relT = 0; } break;
        case 'sw': if (p) audio.play('swap', mine ? null : p.x, p.y + 1, p.z); break;
        case 'dry': if (mine) audio.play('dry'); break;
        case 'me': if (p) { audio.play('swing', mine ? null : p.x, p.y + 1, p.z); const c = view.chars[p.slot]; if (c) c.melT = 0; } break;
        case 'mh': { const v = P[e[2]]; if (v) { G.hitFx(view, v.x, v.y + 1.1, v.z, v, 1); audio.play('melee', v.x, v.y + 1, v.z); } break; }
        case 'nt': if (p) audio.play('throw', mine ? null : p.x, p.y + 1, p.z); break;
        case 'pj': break;
        case 'bn': { const m = view.projMeshes.get(e[1]); if (m) audio.play('bounce', m.position.x, m.position.y, m.position.z); break; }
        case 'px': view.dropProj(e[1]); break;
        case 'ex': {
          view.dropProj(e[1]);
          view.boom(e[2], e[3], e[4], e[5]);
          audio.play('boom', e[2], e[3], e[4]);
          const dd = Math.hypot(e[2] - camS.x, e[3] - camS.y, e[4] - camS.z);
          if (dd < 14) shakeCam(0.5 * (1 - dd / 14));
          if (G.scorch) view.splat(e[2], e[3] + 0.02, e[4], 0, 1, 0, e[5] * 0.6);
          break;
        }
        case 'kb': if (p === me && fromNet) { me.vx += e[2]; me.vy += e[3]; me.vz += e[4]; me.onGround = false; } break;
        case 'zn': if (W) { W.zone.i = e[1]; pop(T(G.zoneMoved), 'zn', 1.6); audio.play('zone'); } break;
        case 'pu': { const q = W.pickups[e[1]]; if (q) { q.up = !!e[2]; if (!e[2] && P[e[3]] === me) { if (fromNet) G.pickup(W, me, e[4]); audio.play('pickup'); subPop(T(G.pickupName(e[4]))); } } break; }
        case 'ov': if (fromNet && W) { W.over = true; } break;
        case 'ch': chatLine(e[1], e[2]); break;
        case 'pl': { const q = P[e[1]]; if (q) { q.name = e[2]; q.bot = !!e[3]; } break; }
        case 'gone': { const q = P[e[1]]; if (q) { q.inGame = false; q.alive = false; view.dropChar(e[1]); } break; }
      }
    }
    let fireT = 9, dmgFlash = 0, shakeA = 0, thirdPerson = false, camO = null, autoP = null;
    const shakeCam = k => { shakeA = Math.min(1, shakeA + k); };
    function hitMark(kind) {
      H.hm.classList.toggle('k', kind === 3);
      H.hm.getAnimations().forEach(a => a.cancel());
      H.hm.animate([{ opacity: 1, transform: 'scale(1.25)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 0, transform: 'scale(1)' }], { duration: kind === 3 ? 420 : 260 });
    }
    const DMGN = [];
    function addDmgDir(a) {
      let d = DMGN.find(x => x.s === a.slot);
      if (!d) { if (DMGN.length >= 5) { const o = DMGN.shift(); o.el.remove(); } const el = document.createElement('i'); H.dmg.append(el); d = { s: a.slot, el, t: 0 }; DMGN.push(d); }
      d.t = 1.4; d.a = a;
    }
    function feed(a, v, wk, head) {
      const el = document.createElement('div');
      const an = a && a !== v ? `<b class="${a === me ? 'me' : ''}${W.teams ? ' t' + a.team : ''}">${escH(a.name)}</b>` : '';
      el.innerHTML = `${an}${G.wepIcon(wk, true)}${head ? G.headIcon : ''}<b class="${v === me ? 'me' : ''}${W.teams && v ? ' t' + v.team : ''}">${escH(v ? v.name : '')}</b>`;
      if (a === me || v === me) el.classList.add('mine');
      H.feed.prepend(el);
      FEED.unshift({ el, t: 5 });
      while (FEED.length > 5) { const o = FEED.pop(); o.el.remove(); }
    }
    function pop(s, cls, sec) {
      H.pop.innerHTML = '';
      const el = document.createElement('div'); el.className = cls; el.textContent = s;
      H.pop.append(el);
      el.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.15 }, { transform: 'scale(1)', opacity: 1, offset: 0.8 }, { transform: 'scale(1)', opacity: 0 }], { duration: (sec || 1.2) * 1000, fill: 'forwards' });
    }
    function subPop(s) {
      const el = document.createElement('span'); el.textContent = s;
      H.sub.append(el); el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none', offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 1100 }).onfinish = () => el.remove();
    }

    const rs = [];
    const camS = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 75, vfov: 58 };
    function renderState(alpha, dt) {
      const P = W.players;
      for (const p of P) {
        if (!p) continue;
        let r = rs[p.slot];
        if (!r) r = rs[p.slot] = { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch };
        if (p.remote) {
          if (NET.role === 'host') { const k = 1 - Math.exp(-18 * dt); r.x += (p.x - r.x) * k; r.y += (p.y - r.y) * k; r.z += (p.z - r.z) * k; r.yaw += angD(p.yaw, r.yaw) * k; r.pitch += (p.pitch - r.pitch) * k; if (Math.hypot(p.x - r.x, p.z - r.z) > 4) { r.x = p.x; r.y = p.y; r.z = p.z; } }
          else { r.x = p.x; r.y = p.y; r.z = p.z; r.yaw = p.yaw; r.pitch = p.pitch; }
        } else {
          r.x = lerp(p.px, p.x, alpha); r.y = lerp(p.py, p.y, alpha); r.z = lerp(p.pz, p.z, alpha); r.yaw = p.yaw; r.pitch = p.pitch;
        }
      }
    }
    const tagV = new THREE.Vector3();
    let tagT = 0;
    function drawChars(dt) {
      const P = W ? W.players : [];
      tagT -= dt;
      const doTags = tagT <= 0;
      if (doTags) tagT = 0.2;
      for (const p of P) {
        if (!p) continue;
        const show = p.inGame && (p !== me || thirdPerson);
        const c = view.charFor(p.slot, { team: W.teams ? p.team : -1, cls: p.cls, color: G.colorFor(p, W.teams) });
        const r = rs[p.slot];
        if (!show || !r) { c.root.visible = false; c.blob.visible = false; continue; }
        if (!p.alive) { if (c.deadT < 0 || c.deadT == null) c.deadT = 0; c.deadT += dt; }
        else c.deadT = -1;
        c.root.visible = p.alive || c.deadT < (G.corpseT || 1.6);
        c.blob.visible = c.root.visible && p.alive;
        if (!c.root.visible) continue;
        c.root.position.set(r.x, r.y, r.z);
        if (p.onGround || c.gy == null) c.gy = r.y;
        c.blob.position.set(r.x, Math.min(c.gy, r.y) + 0.03, r.z);
        const bs = (G.blobS || 1.1) * clamp(1 - (r.y - c.gy) * 0.15, 0.4, 1); c.blob.scale.set(bs, 1, bs);
        c.root.rotation.y = r.yaw;
        const sp = Math.hypot(p.vx, p.vz);
        c.fireT = (c.fireT == null ? 9 : c.fireT) + dt; c.relT = (c.relT == null ? 9 : c.relT) + dt; c.melT = (c.melT == null ? 9 : c.melT) + dt;
        const w = p.weps[p.cur];
        c.anim({ t: W.t, dt, spd: p.remote ? (c.lsp = damp(c.lsp || 0, Math.hypot(r.x - (c.lx || r.x), r.z - (c.lz || r.z)) / Math.max(1e-3, dt), 8, dt)) : sp, ground: p.onGround, crouch: p.crouch, slide: p.slide > 0, pitch: r.pitch, ads: p.adsF, fire: c.fireT, reload: c.relT, melee: c.melT, alive: p.alive, deadT: c.deadT, wk: w ? w.k : G.classes[p.cls].prim, shield: p.shield > 0, prot: p.spawnProt > 0 });
        c.lx = r.x; c.lz = r.z;
        if (doTags) {
          let vis = false;
          if (p.alive && p !== me && me) {
            const dx = r.x - camS.x, dz = r.z - camS.z, dist = Math.hypot(dx, dz);
            const mate = W.teams && p.team === me.team;
            if (mate) vis = dist < 120;
            else if (dist < 45) { const fx = -Math.sin(camS.yaw), fz = -Math.cos(camS.yaw); if ((dx * fx + dz * fz) / Math.max(0.1, dist) > 0.6) vis = clearLine(W.M, camS.x, camS.y, camS.z, r.x, r.y + 1.6, r.z); }
          }
          const mate = me && W.teams && p.team === me.team;
          c.tag.set(p.name, mate ? (G.mateCol || '#7fd3ff') : (G.foeCol || '#ff6a5a'), mate || !W.teams || true ? p.hp / p.maxHp : -1, vis);
          c.tag.spr.position.set(0, (p.crouch ? G.phys.HC : G.phys.H) + 0.45, 0);
          c.tag.spr.material.depthTest = !mate;
        }
      }
      for (let i = P.length; i < view.chars.length; i++) if (view.chars[i]) view.chars[i].root.visible = false;
    }
    function drawProj(alpha) {
      if (!W) return;
      const seen = drawProj.seen || (drawProj.seen = new Set());
      seen.clear();
      for (const r of W.projs) {
        const m = view.projMesh(r.id, r.kind);
        m.position.set(lerp(r.px, r.x, alpha), lerp(r.py, r.y, alpha), lerp(r.pz, r.z, alpha));
        if (r.kind === 'r') { const sp = Math.hypot(r.vx, r.vy, r.vz) || 1; m.lookAt(m.position.x + r.vx / sp, m.position.y + r.vy / sp, m.position.z + r.vz / sp); if (Math.random() < 0.7) view.burst(m.position.x, m.position.y, m.position.z, 1, '#bbbbbb', 0.4, 0.6, 0.6, -0.5); }
        else { m.rotation.x += 0.2; m.rotation.z += 0.13; }
        seen.add(r.id);
      }
      for (const id of view.projMeshes.keys()) if (!seen.has(id)) view.dropProj(id);
    }
    function drawZone(dt) {
      const zm = view.zoneMesh;
      if (!W || !W.mode.zone || !W.M.zones.length) { zm.visible = false; return; }
      const z = W.M.zones[W.zone.i];
      zm.visible = true; zm.position.set(z.x, z.y, z.z); zm.scale.set(z.r, 1, z.r);
      if (G.zoneColor) G.zoneColor(zm, W.zone.own, me ? me.team : 0, W.t);
    }
    function drawPickups(dt) {
      if (!W) return;
      const L = view.pickMeshes;
      for (let i = 0; i < W.pickups.length; i++) {
        const k = W.pickups[i];
        let m = L[i];
        if (!m) { m = L[i] = G.makePickup(view.kit, k.k); m.position.set(k.x, k.y, k.z); view.scene.add(m); }
        m.visible = k.up;
        if (k.up) { m.rotation.y += dt * 1.6; m.position.y = k.y + 0.15 + Math.sin(W.t * 2.4 + i) * 0.08; }
      }
    }

    function hudFrame(dt) {
      if (!W || !me) return;
      const w = me.weps[me.cur], d = w ? w.d : null;
      G.hudUpdate(H, me, W, setT, setS, setH, T, escH);
      const sp = d && d.kind !== 'melee' ? spreadNow(W, me, d) : 0.02;
      const fovR = camS.fov * Math.PI / 180, px = Math.tan(sp) / Math.tan(fovR / 2) * (wrap.clientHeight / 2);
      const gap = clamp(px, 3, 140), showCh = me.alive && !(d && d.scope && me.adsF > 0.6) && !(d && d.noCh && me.adsF > 0.6);
      setS(H.ch, 'chv', 'visibility', showCh ? 'visible' : 'hidden');
      if (showCh) {
        const g = Math.round(gap) + 'px';
        setS(H.chA, 'cha', 'transform', `translateY(calc(-100% - ${g}))`);
        setS(H.chB, 'chb', 'transform', `translateY(${g})`);
        setS(H.chC, 'chc', 'transform', `translateX(calc(-100% - ${g}))`);
        setS(H.chD, 'chd', 'transform', `translateX(${g})`);
      }
      const scope = !!(d && d.scope && me.adsF > 0.92 && me.alive);
      setS(H.scope, 'scp', 'opacity', scope ? '1' : '0');
      const low = me.alive ? clamp(1 - me.hp / me.maxHp / 0.4, 0, 1) : 0;
      dmgFlash = Math.max(0, dmgFlash - dt * 1.6);
      setS(H.vig, 'vig', 'opacity', Math.min(1, low * 0.75 + dmgFlash * 0.6).toFixed(2));
      for (let i = DMGN.length - 1; i >= 0; i--) {
        const x = DMGN[i];
        x.t -= dt;
        if (x.t <= 0 || !me.alive) { x.el.remove(); DMGN.splice(i, 1); continue; }
        const a = x.a, ang = Math.atan2(-(a.x - me.x), -(a.z - me.z)) - look.yaw;
        x.el.style.transform = `rotate(${(-ang).toFixed(3)}rad)`; x.el.style.opacity = Math.min(1, x.t).toFixed(2);
      }
      for (let i = FEED.length - 1; i >= 0; i--) { const f = FEED[i]; f.t -= dt; if (f.t < 0.6) f.el.style.opacity = Math.max(0, f.t / 0.6).toFixed(2); if (f.t <= 0) { f.el.remove(); FEED.splice(i, 1); } }
      if (hintT > 0) { hintT -= dt; if (hintT <= 0) H.hint.hidden = true; }
      const tl = Math.max(0, Math.ceil(W.time));
      const L = standings();
      if (!W.teams) {
        const top = L.slice(0, 3), mi = L.indexOf(me);
        const html = top.map((p, i) => `<div class="${p === me ? 'me' : ''}"><span>${i + 1}. ${escH(p.name)}</span><b>${p.score}</b></div>`).join('') + (mi > 2 ? `<div class="me"><span>${mi + 1}. ${escH(me.name)}</span><b>${me.score}</b></div>` : '');
        setH(H.tl, 'tl', html);
      } else setH(H.tl, 'tl', '');
      G.hudTop(H, W, me, tl, setH, T, escH);
      if (sbOpen && (W.tick % 30 === 0)) drawSB();
      if (deathUI && deathUI.tick) deathUI.tick();
    }

    let netAcc = 0;
    let lastNow = 0;
    function frame(dt0, now) {
      const dt = lastNow ? clamp((now - lastNow) / 1000, 0, 0.25) : dt0;
      lastNow = now;
      lastRaf = now;
      if (!W) {
        if (previewM) {
          menuT += dt;
          const M = previewM, cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2, R = Math.max(M.x1 - M.x0, M.z1 - M.z0) * 0.42, a = menuT * 0.06;
          camS.x = cx + Math.cos(a) * R; camS.z = cz + Math.sin(a) * R; camS.y = (M.def.camY || 14) + Math.sin(menuT * 0.2) * 1.5;
          camS.yaw = Math.atan2(-(cx - camS.x), -(cz - camS.z)); camS.pitch = -0.32; camS.roll = 0; camS.fov = 70; camS.vfov = 58;
          view.drawView({ show: false }, dt);
          view.frameFx(dt);
          view.render(camS);
        }
        return;
      }
      if (autoP && me) {
        if (!me.ai) { me.ai = mkBrain(W, me); me.diff = autoP.diff; }
        if (!me.alive && me.respawnT <= 0 && deathUI && deathUI.go) deathUI.go();
        look.yaw = me.in.yaw; look.pitch = me.in.pitch;
      } else localInput(dt);
      if (NET.role === 'guest') guestFrame(dt, now);
      else {
        if (!paused || online()) {
          simAcc += dt;
          let n = 0;
          while (simAcc >= STEP && n < 16) { simAcc -= STEP; n++; tick(); }
          if (n === 16) simAcc = 0;
        }
      }
      const alpha = paused && !online() ? 1 : clamp(simAcc / STEP, 0, 1);
      renderState(alpha, dt);
      const r = rs[me.slot] || me;
      const P = G.phys;
      me.crouchF = damp(me.crouchF || 0, me.crouch ? 1 : 0, 14, dt);
      const eye = lerp(P.eye, P.eyeC, me.crouchF);
      shakeA = Math.max(0, shakeA - dt * 2.5);
      const sh = shakeA * shakeA * 0.06;
      if (me.alive || !G.deathCam) {
        camS.x = r.x + (Math.random() - 0.5) * sh; camS.y = r.y + eye + (Math.random() - 0.5) * sh; camS.z = r.z + (Math.random() - 0.5) * sh;
        camS.yaw = look.yaw + me.kickYaw * 0.6; camS.pitch = clamp(look.pitch + me.kick * 0.6, -1.55, 1.55);
        camS.roll = damp(camS.roll, me.slide > 0 ? -0.06 : 0, 8, dt);
      }
      if (!me.alive) {
        const k = W.players[me.killer];
        const dt2 = W.t - me.deathT;
        camS.y = damp(camS.y, r.y + 0.5 + Math.min(2.5, dt2 * 2), 4, dt);
        if (k && k !== me && k.alive) { const kr = rs[k.slot] || k; const ty = Math.atan2(-(kr.x - camS.x), -(kr.z - camS.z)), tp = Math.atan2(kr.y + 1.2 - camS.y, Math.hypot(kr.x - camS.x, kr.z - camS.z)); camS.yaw += angD(ty, camS.yaw) * Math.min(1, dt * 4); camS.pitch += (tp - camS.pitch) * Math.min(1, dt * 4); }
        camS.roll = damp(camS.roll, 0.25, 3, dt);
      }
      const w = me.weps[me.cur], d = w ? w.d : null;
      const zoom = me.alive ? G.fovFor(me) : 1;
      camS.fov = SV.fov / zoom * (h => h > 1.2 ? 1.12 : 1)(wrap.clientHeight / Math.max(1, wrap.clientWidth));
      camS.vfov = 58 - me.adsF * 6;
      if (camO) { Object.assign(camS, camO); }
      fireT += dt;
      const showVm = !camO && me.alive && !(d && d.scope && me.adsF > 0.9) && scr === 'play';
      view.drawView({ show: showVm, wk: w ? w.k : '', ads: me.adsF, spd: Math.hypot(me.vx, me.vz), ground: me.onGround, slide: me.slide > 0, yaw: look.yaw, pitch: look.pitch, reload: me.reloadT > 0 && d ? 1 - me.reloadT / (d.reloadOne && w.mag > 0 ? d.reloadOne : d.reload) : -1, swap: me.swapT > 0 && d ? me.swapT / (d.swap || 0.35) : 0, melee: me.meleeT > 0 ? 1 - me.meleeT / G.weapons[G.melee].rate : -1, fireT, t: W.t, mag: w ? w.mag : 0 }, dt);
      drawChars(dt);
      drawProj(alpha);
      drawZone(dt);
      drawPickups(dt);
      view.frameFx(dt);
      audio.listener(camS.x, camS.y, camS.z, camS.yaw);
      view.render(camS);
      if (scr === 'play') hudFrame(dt);
      if (W.over && scr === 'play' && (!NET.role || NET.role === 'host' || W.over)) { if (!over) { over = { pending: true, t: 0 }; pop(T('Match over'), 'ov', 2); } over.t += dt; if (over.t > 1.6) { over = null; matchOver(); } }
    }

    function tick() {
      if (me && me.alive && !me.remote && NET.role !== 'guest') { }
      stepWorld(W);
      const E = W.ev;
      if (E.length) {
        for (const e of E) onEv(e, false);
        if (NET.role === 'host') NET.pend.push(...E);
        E.length = 0;
      }
      if (NET.role === 'host') hostNet();
    }

    function chatLine(slot, txt) {
      const p = W && W.players[slot];
      const el = document.createElement('div');
      el.innerHTML = `<b translate="no">${escH(p ? p.name : '?')}:</b> <span translate="no">${escH(txt)}</span>`;
      H.chat.append(el);
      while (H.chat.querySelectorAll('div').length > 6) H.chat.querySelector('div').remove();
      api.timeout(() => { el.style.opacity = '0'; api.timeout(() => el.remove(), 700); }, 9000);
      audio.play('chat');
    }
    function openChat() {
      if (chatOpen) return;
      chatOpen = true; clearButtons(); releaseMouse();
      const i = document.createElement('input'); i.maxLength = 120; i.placeholder = T('Say something…'); i.setAttribute('aria-label', T('Chat message'));
      H.chat.append(i);
      api.timeout(() => i.focus(), 30);
      const done = send => {
        if (!chatOpen) return;
        chatOpen = false;
        const v = i.value.replace(/\s+/g, ' ').trim().slice(0, 120);
        i.remove(); uiT = performance.now();
        if (send && v) { if (NET.role === 'host') { const e = ['ch', me.slot, v]; onEv(e, false); NET.pend.push(e); } else netSend({ t: 'ch', m: v }); }
        if (scr === 'play' && !paused) lockMouse();
      };
      i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') done(true); else if (e.key === 'Escape') { e.preventDefault(); done(false); } });
      i.addEventListener('blur', () => done(false));
    }

    function netSend(m, fast) { try { api.net.send(m, fast); } catch (e) {} }
    function hookNet() {
      if (NET.hooked) return;
      NET.hooked = true;
      api.net.on('data', (m, from) => { if (!m || !NET.role) return; if (NET.role === 'host') hostData(m, from); else guestData(m); });
      api.net.on('leave', pl => { if (NET.role !== 'host' || !pl || !W) return; const p = W.players.find(q => q && q.pid === pl.id); if (!p) return; dropPeer(p, pl); });
      api.net.on('rejoin', pl => { if (NET.role !== 'host' || !pl || !W) return; const p = W.players.find(q => q && q.pid === pl.id); if (p) sendCfg(p); });
      api.net.on('lobby', () => { if (NET.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!NET.role) return;
        NET.role = null; W = null; me = null; hud.hidden = true; releaseMouse();
        const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'))}</h3><p class="fp-note">${escH(T(why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.'))}</p><div class="fp-acts"><button type="button" class="fp-btn" data-a="on">${escH(T('Play online'))}</button><button type="button" class="fp-btn ghost" data-a="menu">${escH(T('Menu'))}</button></div></div>`, 'm-pause');
        scr = 'left';
        previewWorld();
        el.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; api.sfx('tap'); if (a.dataset.a === 'on') goOnline(); else menu(); };
      });
    }
    async function goOnline() {
      hookNet();
      const wasRole = NET.role;
      NET.role = null; scr = 'wait'; hud.hidden = true; itemsPanel(null); releaseMouse(); W = null; me = null; previewWorld();
      const r = await api.net.room({ title: G.title, sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 6, min: 2, max: 8, bots: true });
      if (!api.alive) return;
      if (!r) { NET.role = null; menu(); return; }
      NET.role = r.role; NET.players = r.players.slice(0, 8); NET.bots = !!r.bots; NET.size = Math.min(8, +r.size || NET.players.length); NET.myId = r.id;
      if (r.role === 'host') { hostStart(); }
      else { itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T('Connected'))}</h3><p class="fp-note">${escH(T('Waiting for the host…'))}</p><div class="fp-acts"><button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button></div></div>`, 'm-pause').onclick = e => { if (e.target.closest('[data-a]')) leaveOnline(); }; netSend({ t: 'hi', c: SV.cls, n: myName() }); }
    }
    function leaveOnline() {
      try { api.net.close(); } catch (e) {}
      NET.role = null; W = null; me = null; menu();
    }
    function toLobby() { if (NET.role === 'host') { W = null; me = null; goOnline(); } }
    function hostStart() {
      const seed = (Math.random() * 1e9) | 0, rnd = mkRng(seed);
      const md = pickMap(rnd);
      const live = NET.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
      W = newWorld(md, SV.mode, seed, true);
      const n = Math.min(8, Math.max(live.length, NET.bots ? NET.size : live.length));
      const names = botNames(n, rnd);
      const pcls = NET.cls || {};
      for (let i = 0; i < n; i++) {
        const hum = i < live.length;
        const pl = hum ? live[i] : null;
        const p = mkPlayer(W, i, { name: hum ? pl.name : names[i], team: W.teams ? teamOf(i) : 0, cls: i === 0 ? SV.cls : hum ? (pcls[pl.id] | 0) : 0, bot: !hum, diff: SV.diff, remote: hum && i > 0, local: i === 0 });
        if (!hum) p.cls = p.nextCls = botClass(W, p);
        p.pid = pl ? pl.id : null;
        p.respawnT = hum ? 0 : 0.3 + i * 0.05;
        p.wantSpawn = true;
        W.players.push(p);
      }
      me = W.players[0];
      spawnPlayer(W, me);
      for (const p of W.players) if (p.remote) { spawnPlayer(W, p); }
      NET.pend.length = 0;
      for (const p of W.players) if (p.remote) sendCfg(p);
      W.ev.length = 0;
      NET.snapK = 0;
      beginPlay();
    }
    function cfgMsg(p) {
      return { t: 'cfg', map: W.M.key, mode: W.mode.key, seed: 1, me: p.slot, time: W.time, ts: W.teamScore.slice(), z: [W.zone.i, W.zone.t], P: W.players.map(q => [q.slot, q.name, q.team, q.cls, q.bot ? 1 : 0, q.alive ? 1 : 0, +q.x.toFixed(2), +q.y.toFixed(2), +q.z.toFixed(2), +q.yaw.toFixed(3), q.kills, q.deaths, q.score, q.inGame ? 1 : 0, Math.ceil(q.hp)]), pk: W.pickups.map(k => k.up ? 1 : 0) };
    }
    function sendCfg(p) { if (p.pid) api.net.sendTo(p.pid, cfgMsg(p)); }
    function dropPeer(p, pl) {
      if (NET.bots) {
        p.remote = false; p.bot = true; p.pid = null; p.ai = mkBrain(W, p); p.diff = SV.diff; p.name = p.name;
        if (!p.alive) p.respawnT = Math.min(p.respawnT, 1); else { p.px = p.x; p.py = p.y; p.pz = p.z; }
        p.weps.length || giveLoadout(W, p);
        const e = ['pl', p.slot, p.name, 1]; NET.pend.push(e);
        api.toast(T('{name} left. A bot takes the seat.', { name: pl.name }));
      } else {
        p.inGame = false; p.alive = false; p.remote = false; p.pid = null;
        const e = ['gone', p.slot]; NET.pend.push(e); onEv(e, false);
        api.toast(T('{name} left the game.', { name: pl.name }));
      }
    }
    const q2 = v => Math.round(v * 100);
    function snapMsg() {
      const P = [];
      for (const p of W.players) { if (!p || !p.inGame) continue; P.push([p.slot, q2(p.x), q2(p.y), q2(p.z), Math.round(p.yaw * 1000), Math.round(p.pitch * 1000), (p.alive ? 1 : 0) | (p.onGround ? 2 : 0) | (p.crouch ? 4 : 0) | (p.slide > 0 ? 8 : 0) | (p.adsF > 0.5 ? 16 : 0) | (p.shield > 0 ? 32 : 0) | (p.spawnProt > 0 ? 64 : 0), p.cur, Math.ceil(p.hp), p.cls, p.kills, p.deaths, p.score, q2(p.vx), q2(p.vz)]); }
      return { t: 's', k: W.tick, tl: Math.round(W.time * 10), ts: W.teamScore, z: [W.zone.i, W.zone.own], P, R: W.projs.map(r => [r.id, r.kind, q2(r.x), q2(r.y), q2(r.z)]) };
    }
    function hostNet() {
      if (NET.pend.length) { netSend({ t: 'e', E: NET.pend.slice(0, 120) }); NET.pend.length = 0; }
      if (W.tick % 3 === 0) netSend(snapMsg(), true);
    }
    function hostData(m, from) {
      if (m.t === 'hi') { NET.cls = NET.cls || {}; NET.cls[from] = clamp(m.c | 0, 0, G.classes.length - 1); return; }
      if (!W) return;
      const p = W.players.find(q => q && q.pid === from);
      if (!p) return;
      if (m.t === 'i') {
        if (typeof m.q === 'number') { if (m.q <= (p.inSeq || 0)) return; p.inSeq = m.q; }
        if (!p.alive || !Array.isArray(m.p) || m.p.length < 3) return;
        const x = m.p[0] / 100, y = m.p[1] / 100, z = m.p[2] / 100;
        if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return;
        p.px = p.x; p.py = p.y; p.pz = p.z;
        p.x = clamp(x, W.M.x0 - 2, W.M.x1 + 2); p.y = clamp(y, W.M.killY - 5, 200); p.z = clamp(z, W.M.z0 - 2, W.M.z1 + 2);
        if (Array.isArray(m.v)) { p.vx = (+m.v[0] || 0) / 100; p.vy = (+m.v[1] || 0) / 100; p.vz = (+m.v[2] || 0) / 100; }
        if (Array.isArray(m.a)) { p.yaw = +m.a[0] / 1000 || 0; p.pitch = clamp(+m.a[1] / 1000 || 0, -1.6, 1.6); }
        const f = m.f | 0;
        p.onGround = !!(f & 2); p.crouch = !!(f & 4); p.slide = f & 8 ? 0.1 : 0; p.adsF = f & 16 ? 1 : 0;
        if (typeof m.w === 'number' && p.weps[m.w]) p.cur = m.w;
        if (p.y < W.M.killY) hurt(W, p, 999, null, 'fall', false, 0, 0);
        if (f & 128) p.spawnProt = 0;
      } else if (m.t === 'f') {
        if (!p.alive) return;
        const wk = String(m.w || '');
        const wi = p.weps.findIndex(x => x.k === wk);
        if (wi < 0 && wk !== G.melee) return;
        const d = G.weapons[wk];
        const now = W.t;
        if (d.kind !== 'melee') { if (now - (p.lastClaim || -9) < d.rate * 0.55 * (d.burst ? 0.3 : 1)) return; p.lastClaim = now; }
        p.spawnProt = 0; p.lastShotT = now; p.shots++;
        if (wi >= 0) p.cur = wi;
        if (d.kind !== 'melee') { const e = ['fx', p.slot, p.cur, d.pellets || 1]; onEv(e, false); NET.pend.push(e); hearShot(W, p); }
        if (Array.isArray(m.T)) for (const t of m.T.slice(0, 16)) { if (!Array.isArray(t)) continue; const e = ['tr', p.slot, +t[0] || 0, +t[1] || 0, +t[2] || 0, t[3] | 0, t[4] | 0, +t[5] || 0, +t[6] || 0, +t[7] || 0]; onEv(e, false); NET.pend.push(e); }
        if (Array.isArray(m.h)) {
          let any = false;
          for (const h of m.h.slice(0, 16)) {
            if (!Array.isArray(h)) continue;
            const v = W.players[h[0] | 0];
            if (!v || v === p || !v.alive || (W.teams && v.team === p.team)) continue;
            const dist = Math.hypot(v.x - p.x, v.z - p.z);
            if (dist > (d.range || 200) + 4) continue;
            if (!clearLine(W.M, p.x, p.y + G.phys.eye, p.z, v.x, v.y + 1.0, v.z) && !clearLine(W.M, p.x, p.y + G.phys.eye, p.z, v.x, v.y + G.phys.H - 0.2, v.z) && dist > 3) continue;
            any = true;
            if (d.kind === 'melee') hurt(W, v, d.dmg, p, wk, false, v.x - p.x, v.z - p.z);
            else applyHit(W, p, v, d, h[1] | 0, +h[2] || dist, v.x - p.x, v.z - p.z, wk);
          }
          if (any) p.hits++;
        }
      } else if (m.t === 'p') {
        if (!p.alive || !Array.isArray(m.o) || !Array.isArray(m.v)) return;
        const kind = m.k === 'g' ? 'g' : 'r';
        const d = kind === 'g' ? G.weapons[G.nade] : p.weps.map(x => x.d).find(x => x.kind === 'rocket');
        if (!d) return;
        if (W.t - (p['lp' + kind] || -9) < (kind === 'g' ? 0.6 : d.rate * 0.6)) return;
        p['lp' + kind] = W.t; p.spawnProt = 0;
        const o = m.o.map(Number), v = m.v.map(Number);
        if (o.some(x => !isFinite(x)) || v.some(x => !isFinite(x))) return;
        const sp = Math.hypot(v[0], v[1], v[2]), mx = d.projSpeed * 1.6 + 6;
        const k = sp > mx ? mx / sp : 1;
        spawnProj(W, p, kind, d, o[0], o[1], o[2], v[0] * k, v[1] * k, v[2] * k);
        if (kind === 'r') { const e = ['fx', p.slot, p.cur, 0]; onEv(e, false); NET.pend.push(e); hearShot(W, p); }
      } else if (m.t === 'a') {
        if (Array.isArray(m.E)) for (const e of m.E.slice(0, 12)) { if (!Array.isArray(e) || !['j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'nt'].includes(e[0])) continue; const x = [e[0], p.slot, +e[2] || 0]; onEv(x, false); NET.pend.push(x); }
      } else if (m.t === 'cl') { p.nextCls = clamp(m.c | 0, 0, G.classes.length - 1); }
      else if (m.t === 'rs') { if (typeof m.c === 'number') p.nextCls = clamp(m.c | 0, 0, G.classes.length - 1); p.wantSpawn = true; }
      else if (m.t === 'ch') { const v = String(m.m || '').replace(/\s+/g, ' ').trim().slice(0, 120); if (!v || now() - (p.chatT || 0) < 700) return; p.chatT = now(); const e = ['ch', p.slot, v]; onEv(e, false); NET.pend.push(e); }
      else if (m.t === 'pg') { api.net.sendTo(from, { t: 'po', c: m.c }); }
    }
    const now = () => performance.now();

    function guestData(m) {
      if (m.t === 'cfg') { guestCfg(m); return; }
      if (!W) return;
      if (m.t === 's') {
        const tnow = performance.now();
        const o = tnow - m.k * STEP * 1000;
        NET.off = NET.offSet ? Math.min(o, NET.off + 2) : o; NET.offSet = true;
        const B = NET.buf;
        let j = B.length;
        while (j > 0 && B[j - 1].k > m.k) j--;
        if (j > 0 && B[j - 1].k === m.k) return;
        B.splice(j, 0, m);
        if (B.length > 40) B.shift();
        W.time = m.tl / 10; W.teamScore[0] = m.ts[0]; W.teamScore[1] = m.ts[1];
        if (m.z) { if (W.zone.i !== m.z[0]) W.zone.i = m.z[0]; W.zone.own = m.z[1]; }
        for (const a of m.P) { const p = W.players[a[0]]; if (!p) continue; p.kills = a[10]; p.deaths = a[11]; p.score = a[12]; if (p === me) { if (me.alive && (a[6] & 1)) me.hp = a[8]; me.shield = a[6] & 32 ? 1 : 0; continue; } p.cls = a[9]; }
        if (m.k > NET.snapK) {
          NET.snapK = m.k;
          const ids = new Set();
          for (const r of m.R) {
            ids.add(r[0]);
            let pr = W.projs.find(x => x.id === r[0]);
            if (!pr) { pr = { id: r[0], kind: r[1], x: r[2] / 100, y: r[3] / 100, z: r[4] / 100, px: r[2] / 100, py: r[3] / 100, pz: r[4] / 100, vx: 0, vy: 0, vz: 0, nx: r[2] / 100, ny: r[3] / 100, nz: r[4] / 100 }; W.projs.push(pr); }
            pr.ox = pr.nx; pr.oy = pr.ny; pr.oz = pr.nz; pr.nx = r[2] / 100; pr.ny = r[3] / 100; pr.nz = r[4] / 100; pr.at = tnow;
            pr.vx = (pr.nx - pr.ox) / 0.05; pr.vy = (pr.ny - pr.oy) / 0.05; pr.vz = (pr.nz - pr.oz) / 0.05;
          }
          W.projs = W.projs.filter(x => ids.has(x.id));
        }
        return;
      }
      if (m.t === 'e') { if (Array.isArray(m.E)) for (const e of m.E) { if (Array.isArray(e)) { try { onEv(e, true); } catch (x) { console.error(x); } } } return; }
      if (m.t === 'po') { NET.rtt = performance.now() - m.c; return; }
    }
    function guestCfg(m) {
      const md = G.maps.find(x => x.key === m.map) || G.maps[0];
      const fresh = !W || W.M.key !== md.key || scr !== 'play' || NET.cfgN !== m.time;
      W = newWorld(md, m.mode, 1, false);
      W.time = m.time; W.teamScore = m.ts || [0, 0];
      if (m.z) { W.zone.i = m.z[0]; W.zone.t = m.z[1]; }
      W.onClaim = (p, wk, hits) => { NET.claimH = hits; };
      W.onProj = (p, kind, x, y, z, vx, vy, vz) => netSend({ t: 'p', k: kind, o: [x, y, z].map(v => +v.toFixed(2)), v: [vx, vy, vz].map(v => +v.toFixed(2)) });
      for (const a of m.P) {
        const isMe = a[0] === m.me;
        const p = mkPlayer(W, a[0], { name: a[1], team: a[2], cls: a[3], bot: !!a[4], remote: !isMe, local: isMe });
        p.alive = !!a[5]; p.x = p.px = a[6]; p.y = p.py = a[7]; p.z = p.pz = a[8]; p.yaw = a[9]; p.kills = a[10]; p.deaths = a[11]; p.score = a[12]; p.inGame = !!a[13];
        p.maxHp = G.classes[p.cls].hp; p.hp = a[14];
        if (isMe) { p.nextCls = SV.cls; }
        W.players[a[0]] = p;
      }
      if (Array.isArray(m.pk)) m.pk.forEach((u, i) => { if (W.pickups[i]) W.pickups[i].up = !!u; });
      me = W.players[m.me];
      if (me.alive) { const hp = me.hp; spawnPlayer(W, me, { x: me.x, y: me.y, z: me.z, yaw: me.yaw }); me.hp = hp; me.spawnProt = 0; }
      W.ev.length = 0;
      NET.buf.length = 0; NET.offSet = false; NET.snapK = 0; NET.cfgN = m.time;
      if (me.nextCls !== me.cls) netSend({ t: 'cl', c: me.nextCls });
      beginPlay();
      if (!me.alive) api.timeout(() => showDeath(), 300);
    }
    function guestFrame(dt, tnow) {
      {
        simAcc += dt;
        let n = 0;
        while (simAcc >= STEP && n < 16) {
          simAcc -= STEP; n++;
          W.t += STEP; W.tick++;
          if (!me.alive) me.respawnT -= STEP;
          if (me.alive && !W.over) {
            if (me.ai) me.ai.think(W, STEP);
            wishMove(W, me, STEP); physStep(W, me, STEP);
            NET.claimH = null;
            const shots = me.shots;
            weaponStep(W, me, STEP);
            if (me.y < W.M.killY) me.vy = 0;
          }
          const E = W.ev, fwd = [];
          let shot = null;
          for (const e of E) {
            onEv(e, false);
            if (e[0] === 'fx' && e[1] === me.slot) { const w = me.weps[e[2]]; if (w && w.d.kind !== 'rocket') shot = shot || { t: 'f', w: w.k, T: [], h: [] }; }
            else if (e[0] === 'tr' && e[1] === me.slot && shot) shot.T.push(e.slice(2));
            else if (e[0] === 'mh' && e[1] === me.slot) { netSend({ t: 'f', w: G.melee, h: NET.claimH || [] }); }
            else if (['j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'nt'].includes(e[0]) && e[1] === me.slot) fwd.push([e[0], 0, e[2] || 0]);
          }
          if (shot) { shot.h = NET.claimH || []; netSend(shot); }
          if (fwd.length) netSend({ t: 'a', E: fwd });
          E.length = 0;
          NET.inAcc = (NET.inAcc || 0) + 1;
          if (NET.inAcc >= 2) {
            NET.inAcc = 0;
            netSend({ t: 'i', q: ++NET.inSeq, p: [q2(me.x), q2(me.y), q2(me.z)], v: [q2(me.vx), q2(me.vy), q2(me.vz)], a: [Math.round(me.yaw * 1000), Math.round(me.pitch * 1000)], f: (me.onGround ? 2 : 0) | (me.crouch ? 4 : 0) | (me.slide > 0 ? 8 : 0) | (me.adsF > 0.5 ? 16 : 0) | (me.spawnProt <= 0 ? 128 : 0), w: me.cur }, true);
          }
          if (W.tick % 60 === 0) netSend({ t: 'pg', c: performance.now() });
        }
        if (n === 16) simAcc = 0;
      }
      const B = NET.buf;
      if (B.length) {
        const rt = (tnow - NET.off) / (STEP * 1000) - 7;
        while (B.length > 2 && B[1].k <= rt) B.shift();
        const A = B[0], C = B.length > 1 && A.k <= rt ? B[1] : A;
        const al = C === A ? 0 : clamp((rt - A.k) / (C.k - A.k), 0, 1.2);
        const cm = new Map(); for (const a of C.P) cm.set(a[0], a);
        for (const a of A.P) {
          const p = W.players[a[0]];
          if (!p || p === me) continue;
          const c = cm.get(a[0]) || a;
          const f = c[6];
          if (W.t - (p.evT || -9) > 1.2) p.alive = !!(f & 1);
          if (W.t >= (p.holdT || 0)) {
            p.x = lerp(a[1], c[1], al) / 100; p.y = lerp(a[2], c[2], al) / 100; p.z = lerp(a[3], c[3], al) / 100;
            p.yaw = a[4] / 1000 + angD(c[4] / 1000, a[4] / 1000) * al; p.pitch = lerp(a[5], c[5], al) / 1000;
          }
          p.onGround = !!(f & 2); p.crouch = !!(f & 4); p.slide = f & 8 ? 0.1 : 0; p.adsF = f & 16 ? 1 : 0; p.shield = f & 32 ? 1 : 0; p.spawnProt = f & 64 ? 1 : 0;
          p.vx = c[13] / 100; p.vz = c[14] / 100;
          if (p.cur !== c[7]) { p.cur = c[7]; }
          if (!p.weps.length || p.weps[0].k !== G.classes[c[9]].prim) { p.cls = c[9]; giveLoadout(W, p); p.cur = c[7]; }
          p.hp = c[8];
        }
      }
      const k = (tnow - (W.projs.length ? 0 : 0));
      for (const r of W.projs) { const t = clamp((tnow - r.at) / 50, 0, 1.5); r.px = r.x; r.py = r.y; r.pz = r.z; r.x = r.ox + (r.nx - r.ox) * t; r.y = r.oy + (r.ny - r.oy) * t; r.z = r.oz + (r.nz - r.oz) * t; }
    }

    let hidT = 0;
    api.interval(() => {
      if (NET.role !== 'host' || !W) return;
      const t = performance.now();
      if (t - lastRaf < 300) { hidT = t; return; }
      const el = Math.min(1, (t - hidT) / 1000);
      hidT = t;
      let n = Math.round(el / STEP);
      while (n-- > 0) tick();
      lastRaf = t - 300;
    }, 100);

    api.loop((dt, t) => frame(dt, t));
    if (api.net.invite) { previewWorld(); goOnline(); } else menu();
    G.debug = { get W() { return W; }, get me() { return me; }, get scr() { return scr; }, get NET() { return NET; }, get paused() { return paused; }, look, view, SV, startOffline, menu, matchOver: () => { if (W) { W.time = 0; } }, PR, keys, inp, run: (n) => { for (let i = 0; i < n; i++) tick(); }, standings, cam: o => { camO = o; thirdPerson = !!o; }, auto: d => { autoP = d == null ? null : { diff: d }; if (me && d == null) me.ai = null; } };
    window.__fps = window.__fps || {}; window.__fps[ID_OF(G)] = G.debug;
    return () => {
      releaseMouse();
      try { if (NET.role) api.net.close(); } catch (e) {}
      audio.close();
      view.dispose();
      if (window.__fps) delete window.__fps[ID_OF(G)];
    };
  }
  const ID_OF = G => G.id;
  {
    const W8 = (k, o) => Object.assign({ key: k, kind: 'gun', auto: false, headMul: 1.45, legMul: 1, spreadHip: 0.03, spreadAds: 0.004, spreadMove: 0.025, spreadAir: 0.05, bloom: 0, bloomMax: 0.03, bloomRec: 0.15, recoil: 0.012, recoilRec: 9, reload: 1.5, swap: 0.35, range: 140, mag: 30, reserve: 120, zoom: 1.3, adsT: 0.16, speedMul: 1, botRange: 16, vkick: 0.5 }, o);
    const WEP = {
      sunny: W8('sunny', { name: 'Sunny Rifle', dmg: 26, rate: 0.105, auto: true, mag: 30, reserve: 240, reload: 1.6, spreadHip: 0.03, spreadAds: 0.005, bloom: 0.005, bloomMax: 0.035, recoil: 0.01, fall0: 12, fall1: 45, fallMin: 0.3, botRange: 16, botAds: true, botAdsR: 18, sound: 'rifle', vkick: 0.45 }),
      poacher: W8('poacher', { name: 'Poacher', dmg: 15, headMul: 1.25, pellets: 10, pelletSpread: 0.085, rate: 0.36, mag: 2, reserve: 24, reload: 1.5, spreadHip: 0.085, spreadAds: 0.07, spreadMove: 0, spreadAir: 0.02, recoil: 0.06, recoilRec: 7, range: 40, fall0: 4, fall1: 16, fallMin: 0.12, zoom: 1.12, botRange: 6, sound: 'shotgun', vkick: 1.4, vroll: 0.1, shake: 0.1 }),
      overeasy: W8('overeasy', { name: 'Over Easy', dmg: 52, headMul: 1.6, rate: 0.3, mag: 15, reserve: 90, reload: 1.7, spreadHip: 0.04, spreadAds: 0.002, spreadMove: 0.03, bloom: 0.012, bloomMax: 0.04, bloomRec: 0.2, recoil: 0.04, recoilRec: 8, fall0: 30, fall1: 90, fallMin: 0.6, zoom: 1.9, adsT: 0.18, botRange: 24, botAds: true, botAdsR: 12, sound: 'marks', vkick: 0.9, shake: 0.03 }),
      benedict: W8('benedict', { name: 'Benedict', dmg: 72, headMul: 2.5, rate: 1.0, mag: 5, reserve: 30, reload: 1.8, spreadHip: 0.12, spreadAds: 0, spreadMove: 0.08, spreadAir: 0.1, recoil: 0.06, recoilRec: 6, zoom: 3, adsT: 0.2, scope: true, adsMove: 0.6, botRange: 30, sound: 'sniper', vkick: 1.6, vroll: 0.15, shake: 0.12, tw: 0.04, tl: 0.15 }),
      whisk: W8('whisk', { name: 'Whisk', dmg: 15, rate: 0.065, auto: true, mag: 40, reserve: 320, reload: 1.4, spreadHip: 0.045, spreadAds: 0.018, spreadMove: 0.015, bloom: 0.003, bloomMax: 0.03, recoil: 0.007, fall0: 8, fall1: 30, fallMin: 0.3, zoom: 1.15, speedMul: 1.06, botRange: 10, sound: 'smg', vkick: 0.3 }),
      souffle: W8('souffle', { name: 'Souffle', kind: 'rocket', dmg: 60, splash: 4.2, splashDmg: 85, projSpeed: 26, projGrav: 0, selfMul: 0.4, knock: 11, rate: 0.8, mag: 1, reserve: 9, reload: 1.6, spreadHip: 0.008, spreadAds: 0, spreadMove: 0.01, recoil: 0.06, recoilRec: 6, speedMul: 0.94, adsT: 0.2, zoom: 1.25, botRange: 14, sound: 'rocket', vkick: 1.3, shake: 0.08 }),
      triple: W8('triple', { name: 'Triple Yolk', dmg: 27, burst: 3, burstGap: 0.065, rate: 0.42, mag: 24, reserve: 192, reload: 1.6, spreadHip: 0.026, spreadAds: 0.003, spreadMove: 0.02, bloom: 0.004, bloomMax: 0.02, recoil: 0.012, fall0: 20, fall1: 60, fallMin: 0.45, zoom: 1.5, botRange: 18, botAds: true, botAdsR: 14, sound: 'burst', vkick: 0.5 }),
      peep: W8('peep', { name: 'Peep 9', dmg: 24, headMul: 1.5, rate: 0.16, mag: 10, reserve: 60, reload: 1.1, swap: 0.25, spreadHip: 0.022, spreadAds: 0.005, spreadMove: 0.02, recoil: 0.02, fall0: 15, fall1: 45, fallMin: 0.5, zoom: 1.15, botRange: 12, sound: 'pistol', vkick: 0.7 }),
      spatula: W8('spatula', { name: 'Spatula', kind: 'melee', dmg: 55, range: 2.3, rate: 0.5, hitAt: 0.12, mag: 0, reserve: 0, swap: 0.2, sound: 'swing' }),
      grenade: W8('grenade', { name: 'Grenade', kind: 'nade', dmg: 0, splash: 5, splashDmg: 115, projSpeed: 15, projGrav: 17, fuse: 2.2, bounce: 0.42, selfMul: 0.5, knock: 9, mag: 0, reserve: 0 })
    };
    const CLS = [
      { key: 'soldier', name: 'Soldier', hp: 100, speed: 1, prim: 'sunny', sec: 'peep', hat: 'helmet', desc: 'Sunny Rifle: steady full-auto, strong up close and in the middle.' },
      { key: 'farmer', name: 'Farmer', hp: 100, speed: 1, prim: 'poacher', sec: 'peep', hat: 'straw', desc: 'Poacher: two shells that crack an egg in one hit up close.' },
      { key: 'ranger', name: 'Ranger', hp: 100, speed: 1, prim: 'overeasy', sec: 'peep', hat: 'beret', desc: 'Over Easy: a fast marksman rifle. Two good hits win.' },
      { key: 'sniper', name: 'Sharpshooter', hp: 100, speed: 1, prim: 'benedict', sec: 'peep', hat: 'bowler', desc: 'Benedict: scope in and hit the middle of the egg for a one-shot crack.' },
      { key: 'chef', name: 'Chef', hp: 100, speed: 1, prim: 'whisk', sec: 'peep', hat: 'chef', desc: 'Whisk: very fast fire, best at short range.' },
      { key: 'baker', name: 'Baker', hp: 100, speed: 1, prim: 'souffle', sec: 'peep', hat: 'hard', desc: 'Souffle: one rocket per load with a big splash.' },
      { key: 'scout', name: 'Scout', hp: 100, speed: 1, prim: 'triple', sec: 'peep', hat: 'band', desc: 'Triple Yolk: three-round bursts, accurate when aimed.' }
    ];
    const EGGC = ['#fff4dc', '#ffd9a0', '#c8f0ff', '#ffd0e4', '#d8ffc8', '#e8d8ff', '#fff0a0', '#ffc8b0', '#d0e8ff', '#f0f0f0', '#ffe0c0', '#d8f8e8'];
    const TEAMC = ['#ffb030', '#3cb8ff'];
    const hbS = [{ z: 1, e: 1, cy: 0.72, rx: 0.46, ry: 0.74 }, { z: 2, e: 1, inner: 1, cy: 0.74, rx: 0.2, ry: 0.27 }];
    const MATS = {
      grass: { color: '#7cc85a', tile: 4, tex: (g, S) => pix(g, S, '#7fca5c', [['#74be52', 0.4], ['#8ad668', 0.3], ['#6ab24a', 0.08]], 4) },
      dirt: { color: '#b98a5a', tile: 3, tex: (g, S) => pix(g, S, '#bc8d5d', [['#ae8052', 0.35], ['#c99a68', 0.25]], 4) },
      barn: { color: '#d8483a', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 2, S); } },
      plank: { color: '#c89660', tile: 1.6, tex: (g, S) => { pix(g, S, '#cc9a64', [['#bd8c58', 0.3], ['#d8a872', 0.2]], 4); g.fillStyle = 'rgba(90,50,20,.3)'; for (let y = 0; y < S; y += 16) g.fillRect(0, y, S, 2); } },
      hay: { color: '#f0cc5a', tile: 1.2, tex: (g, S) => { g.fillStyle = '#f2cf5e'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(160,110,20,.35)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { g.beginPath(); const x = (i * 37) % S, y = (i * 23) % S; g.moveTo(x, y); g.lineTo(x + 10, y + 3); g.stroke(); } } },
      white: { color: '#f4f1ea', tile: 2 },
      roofR: { color: '#8a3a30', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.15)'; for (let y = 0; y < S; y += 8) g.fillRect(0, y, S, 2); } },
      stone: { color: '#b8b4aa', tile: 2.5, tex: (g, S) => { pix(g, S, '#bbb7ad', [['#aeaa9f', 0.3], ['#c8c4ba', 0.25]], 4); } },
      metal: { color: '#a6b4c0', tile: 2, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.1)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 3, S); } },
      cont: { color: '#e05a48', tile: 2.4, tex: (g, S) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < S; x += 8) g.fillRect(x, 0, 3, S); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, S, 3); } },
      water: { color: '#4ab8e8', tile: 4, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(255,255,255,.9)'; g.fillStyle = 'rgba(0,60,120,.12)'; g.fillRect(0, 0, S, S); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect((i * 23) % S, (i * 41) % S, 14, 2); } } },
      dock: { color: '#9a7a5a', tile: 1.6, tex: (g, S) => { pix(g, S, '#9c7c5c', [['#8e6f50', 0.3], ['#aa8a68', 0.2]], 4); g.fillStyle = 'rgba(40,20,10,.35)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 2, S); } },
      tar: { color: '#5a6068', tile: 3, tex: (g, S) => pix(g, S, '#5c6270', [['#535966', 0.35], ['#666c78', 0.25]], 4) },
      brickY: { color: '#e0905a', tile: 2, tex: (g, S) => { pix(g, S, '#e2935e', [['#d68654', 0.3], ['#eca06c', 0.2]], 4); g.fillStyle = 'rgba(120,50,20,.25)'; for (let y = 0; y < S; y += 8) { g.fillRect(0, y, S, 1); for (let x = ((y / 8) % 2) * 8; x < S; x += 16) g.fillRect(x, y, 1, 8); } } },
      tile: { color: '#f4ecd8', tile: 1, tex: (g, S) => { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, S, 2); g.fillRect(0, 0, 2, S); g.fillStyle = 'rgba(220,60,60,.25)'; g.fillRect(0, 0, S / 2, S / 2); g.fillRect(S / 2, S / 2, S / 2, S / 2); } },
      glass: { color: '#8cd0f0', tile: 1, tex: (g, S) => { g.fillStyle = '#8cd0f0'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(S * 0.15, S * 0.1, S * 0.14, S * 0.8); } },
      sign: { color: '#ff5a8a', tile: 1, glow: '#ff5a8a' },
      yellow: { color: '#ffd23d', tile: 2 },
      teal: { color: '#38c6b8', tile: 2 },
      dark: { color: '#3c4250', tile: 2 }
    };

    const MAPS = [
      {
        key: 'barnyard', name: 'Barnyard', camY: 15,
        sky: { top: '#58b4ff', mid: '#a8dcff', bot: '#f2fbff', fog: '#d8efff', fogNear: 60, fogFar: 200, sun: '#fff4dc', sunI: 1.0, hemi: 0.7, hemiTop: '#f4fbff', hemiBot: '#a8c48a', sunDir: [-0.4, 1, 0.5], clouds: 1 },
        build(B) {
          B.box(0, -1, 0, 84, 1, 84, 'grass');
          for (const [x, z, sx, sz] of [[0, -38, 76, 1], [0, 38, 76, 1], [-38, 0, 1, 76], [38, 0, 1, 76]]) B.box(x, 0, z, sx, 1.4, sz, 'plank');
          for (const [x, z, sx, sz] of [[0, -40.5, 84, 3], [0, 40.5, 84, 3], [-40.5, 0, 3, 84], [40.5, 0, 3, 84]]) B.box(x, 0, z, sx, 5, sz, 'stone', { nb: 1 });
          B.box(-12, 0, -32.5, 14, 6, 0.8, 'barn'); B.box(-12, 0, -17.5, 14, 6, 0.8, 'barn');
          B.box(-18.6, 0, -25, 0.8, 6, 14.2, 'barn');
          B.box(-5.4, 0, -29.5, 0.8, 6, 5.2, 'barn'); B.box(-5.4, 0, -20.5, 0.8, 6, 5.2, 'barn'); B.box(-5.4, 3.4, -25, 0.8, 2.6, 3.8, 'barn');
          B.box(-12, 6, -25, 14.4, 0.4, 16, 'roofR');
          B.box(-15.2, 2.8, -25, 6, 0.3, 14.2, 'plank'); B.ramp(-10.2, -30.6, 4, 3, 0, 3.1, 1, 'plank', { base: 0 });
          B.box(-15, 0, -21, 1.4, 1.2, 1.4, 'hay', { uv: 1 }); B.box(-15, 0, -29, 1.4, 1.2, 1.4, 'hay');
          B.cyl(-26, 0, -30, 3, 10, 'metal', { seg: 14 }); B.cyl(-26, 10, -30, 3, 1.6, 'roofR', { seg: 14, r2: 0.4, nc: 1 });
          B.cyl(-26, 0, -22, 2.4, 8, 'metal', { seg: 14 }); B.cyl(-26, 8, -22, 2.4, 1.3, 'roofR', { seg: 14, r2: 0.4, nc: 1 });
          building(B, 14, 18, 30, 32, 5, 'white', { roof: 'roofR', trim: 'plank', wy: [1.3], wg: 3.4, rim: 0.25 });
          B.ramp(10, 25, 8, 3, 0, 5, 0, 'plank');
          B.box(18, 5, 25, 4, 0.8, 2, 'brickY');
          B.box(-1, 0, 0, 74, 0.04, 6, 'water', { nc: 1, ns: 1 });
          for (const x of [-30, -16, 14, 28]) { B.box(x, 0, 3.4, 3, 0.25, 0.8, 'stone', { nc: 1 }); B.box(x + 5, 0, -3.4, 2.4, 0.25, 0.8, 'stone', { nc: 1 }); }
          for (const [x, z] of [[-8, -4], [8, 4], [22, -6], [-22, 6]]) { B.box(x, 0, z, 3, 1.1, 1.2, 'hay'); }
          B.box(2.7, 0, -10, 2.8, 1.3, 1.3, 'hay'); B.box(2.7, 1.3, -10, 1.3, 1.3, 1.3, 'hay');
          B.box(-3, 0, 12, 2.8, 1.3, 1.3, 'hay'); B.box(-3, 1.3, 12, 1.3, 1.3, 1.3, 'hay');
          B.box(0, 0, 0, 7, 0.5, 9, 'plank'); B.ramp(0, -6.5, 7, 4, 0, 0.5, 2, 'plank'); B.ramp(0, 6.5, 7, 4, 0, 0.5, 3, 'plank');
          B.box(-3.3, 0.5, 0, 0.3, 0.9, 9, 'plank', { ns: 1 }); B.box(3.3, 0.5, 0, 0.3, 0.9, 9, 'plank', { ns: 1 });
          for (const [x, z, a] of [[20, -20, 0], [-20, 20, 0], [28, -10, 1], [-28, 12, 1]]) { if (a) B.box(x, 0, z, 0.3, 1.1, 8, 'plank', { ns: 1 }); else B.box(x, 0, z, 8, 1.1, 0.3, 'plank', { ns: 1 }); }
          B.box(22, 0, -26, 8, 3, 6, 'plank'); B.box(22, 3, -26, 8.4, 0.3, 6.4, 'roofR'); B.ramp(22, -20.3, 3, 5, 0, 3.3, 3, 'plank');
          B.box(-24, 0, 26, 6, 2, 6, 'stone'); B.ramp(-24, 21, 3, 4, 0, 2, 2, 'stone');
          for (const [x, z] of [[-34, -6], [34, 6], [-6, 34], [6, -34], [12, -14], [-12, 14]]) B.box(x, 0, z, 1.3, 1.3, 1.3, 'hay');
          B.cyl(30, 0, 0, 1.2, 1.6, 'stone', { seg: 10 });
          const S = [[-33, 0, -33], [33, 0, -33], [-33, 0, 33], [33, 0, 33], [0, 0, -34], [0, 0, 34], [-34, 0, 0], [34, 0, 0], [-15, 3.1, -25], [22, 5, 25], [22, 3.3, -26], [-24, 2, 26], [-12, 0, -25], [10, 0, -30], [-10, 0, 30], [14, 0, 10]];
          for (let i = 0; i < S.length; i++) B.spawn(S[i][0], S[i][1], S[i][2], S[i][0] + S[i][2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[-12, 0, -25, 'a'], [22, 5, 25, 'n'], [0, 0.5, 0, 'a'], [-24, 2, 26, 'n'], [22, 3.3, -26, 'a'], [30, 0, 12, 'n'], [-30, 0, -12, 'a'], [8, 0, -22, 'a'], [-8, 0, 22, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 0.5, 0, 5, 'The bridge'); B.zone(-12, 0, -25, 5, 'The barn'); B.zone(22, 5, 25, 5, 'Farmhouse roof'); B.zone(22, 3.3, -26, 4, 'The shed'); B.zone(-24, 2, 26, 4, 'The well');
        },
      },
      {
        key: 'docks', name: 'Sunnyside Docks', camY: 15,
        sky: { top: '#3f9ee8', mid: '#9cd4f4', bot: '#fff1d6', fog: '#e4eef4', fogNear: 55, fogFar: 200, sun: '#ffe8c0', sunI: 1.05, hemi: 0.65, hemiTop: '#eaf6ff', hemiBot: '#9fb0b8', sunDir: [0.5, 1, -0.3], clouds: 1, sea: 1 },
        build(B) {
          B.box(0, -1, 0, 80, 1, 80, 'dock');
          for (const [x, z, sx, sz] of [[0, -39, 78, 2], [0, 39, 78, 2], [-39, 0, 2, 78], [39, 0, 2, 78]]) B.box(x, 0, z, sx, 1.1, sz, 'metal');
          const cont = (x, y, z, rot, c) => { const sx = rot ? 2.6 : 6.2, sz = rot ? 6.2 : 2.6; B.box(x, y, z, sx, 2.6, sz, 'cont', { c, uv: 1 }); };
          const CC = [0xe05a48, 0x3a8ce0, 0x48c070, 0xffb030, 0x9a6ae0, 0x38c6b8];
          cont(-14, 0, -12, 0, CC[0]); cont(-14, 2.6, -12, 0, CC[3]); cont(-14, 0, -9.4, 0, CC[1]);
          cont(14, 0, 12, 0, CC[2]); cont(14, 2.6, 12, 0, CC[4]); cont(14, 0, 9.4, 0, CC[5]);
          cont(-6, 0, 16, 1, CC[3]); cont(6, 0, -16, 1, CC[0]); cont(-6, 2.6, 16, 1, CC[1]); cont(6, 2.6, -16, 1, CC[2]);
          cont(-28, 0, 10, 1, CC[4]); cont(28, 0, -10, 1, CC[5]); cont(-25.4, 0, 10, 1, CC[0]); cont(25.4, 0, -10, 1, CC[3]);
          B.ramp(-14, -5.6, 6.2, 5, 0, 2.6, 3, 'metal'); B.ramp(14, 5.6, 6.2, 5, 0, 2.6, 2, 'metal');
          B.ramp(-6, 21, 2.6, 3.8, 0, 2.6, 3, 'metal'); B.ramp(6, -21, 2.6, 3.8, 0, 2.6, 2, 'metal');
          building(B, -36, -36, -20, -24, 6, 'brickY', { roof: 'tar', trim: 'white', wy: [1.4, 3.8], wg: 3.2, rim: 0.25 });
          building(B, 20, 24, 36, 36, 6, 'brickY', { roof: 'tar', trim: 'white', wy: [1.4, 3.8], wg: 3.2, rim: 0.25 });
          B.ramp(-14, -30, 12, 3, 0, 6, 1, 'metal'); B.ramp(14, 30, 12, 3, 0, 6, 0, 'metal');
          B.box(0, 0, 0, 10, 2.2, 16, 'white'); B.box(0, 2.2, 0, 10.6, 0.3, 16.6, 'teal');
          B.ramp(0, -10, 4, 4, 0, 2.2, 2, 'plank'); B.ramp(0, 10, 4, 4, 0, 2.2, 3, 'plank');
          B.box(-3, 2.5, 4, 3, 2.4, 3, 'teal'); B.box(-3, 4.9, 4, 3.4, 0.25, 3.4, 'white');
          B.box(3.8, 2.5, -4, 1.2, 1.1, 3, 'cont', { c: 0xffb030 });
          B.box(4.7, 2.5, 6.5, 0.3, 1.0, 3, 'white', { ns: 1 }); B.box(-4.7, 2.5, -6.5, 0.3, 1.0, 3, 'white', { ns: 1 });
          B.box(0, 0, -32, 1.2, 12, 1.2, 'yellow', { nc: 0 }); B.box(0, 12, -27, 1.4, 1.4, 12, 'yellow', { nc: 1 }); B.box(0, 7, -21.5, 0.15, 5, 0.15, 'dark', { nc: 1, ns: 1 });
          B.box(-32, 0, 26, 1.2, 12, 1.2, 'yellow'); B.box(-26, 12, 26, 12, 1.4, 1.4, 'yellow', { nc: 1 });
          for (const [x, z] of [[-24, -14], [24, 14], [-10, 30], [10, -30], [30, 24], [-30, -24], [-22, 2], [22, -2]]) B.box(x, 0, z, 1.3, 1.3, 1.3, 'plank');
          B.box(-22, 1.3, 2, 1.3, 1.3, 1.3, 'plank'); B.box(22, 1.3, -2, 1.3, 1.3, 1.3, 'plank');
          for (const [x, z] of [[-34, 4], [34, -4], [-4, 34], [4, -34]]) B.cyl(x, 0, z, 0.55, 1, 'dark', { seg: 8 });
          const S = [[-34, 0, -16], [34, 0, 16], [-34, 0, 16], [34, 0, -16], [-16, 0, -34], [16, 0, 34], [-16, 0, 34], [16, 0, -34], [-28, 6, -30], [28, 6, 30], [-14, 2.6, -9.4], [14, 2.6, 9.4], [0, 2.5, -5.5], [0, 2.5, 6.5], [-30, 0, 0], [30, 0, 0]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[0] - s[2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[0, 2.5, 0, 'n'], [-28, 6, -30, 'a'], [28, 6, 30, 'a'], [-14, 2.6, -9.4, 'a'], [14, 2.6, 9.4, 'a'], [-30, 0, 0, 'n'], [30, 0, 0, 'n'], [0, 0, -26, 'a'], [0, 0, 26, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 2.5, 0, 5, 'The deck'); B.zone(-28, 6, -30, 5, 'West warehouse'); B.zone(28, 6, 30, 5, 'East warehouse'); B.zone(-14, 0, -2, 4, 'Red stack'); B.zone(14, 0, 2, 4, 'Green stack');
        }
      },
      {
        key: 'rooftops', name: 'Diner Rooftops', camY: 22,
        sky: { top: '#6a6ad8', mid: '#e89ac8', bot: '#ffd8a8', fog: '#f4c8b8', fogNear: 55, fogFar: 210, sun: '#ffd8b0', sunI: 0.95, hemi: 0.7, hemiTop: '#ffe8f4', hemiBot: '#8a7aa8', sunDir: [-0.6, 0.7, -0.4], clouds: 1, city: 1 },
        build(B) {
          B.box(0, -1, 0, 80, 1, 80, 'tar');
          for (const [x, z, sx, sz] of [[0, -39, 78, 2], [0, 39, 78, 2], [-39, 0, 2, 78], [39, 0, 2, 78]]) B.box(x, 0, z, sx, 12, sz, 'brickY', { nb: 1 });
          const roof = (x0, z0, x1, z1, h, m, o) => building(B, x0, z0, x1, z1, h, m, Object.assign({ roof: 'tar', trim: 'white', wy: [1.4, 3.8, 6.2], wg: 3.2, rim: 0.25 }, o));
          roof(-38, -38, -16, -16, 8, 'brickY'); roof(16, 16, 38, 38, 8, 'brickY');
          roof(16, -38, 38, -16, 6, 'white', { trim: 'teal' }); roof(-38, 16, -16, 38, 6, 'white', { trim: 'teal' });
          roof(-8, -38, 8, -28, 7, 'tile', { trim: 'brickY' }); roof(-8, 28, 8, 38, 7, 'tile', { trim: 'brickY' });
          roof(-38, -8, -28, 8, 7, 'tile', { trim: 'brickY' }); roof(28, -8, 38, 8, 7, 'tile', { trim: 'brickY' });
          roof(-10, -10, 10, 10, 5, 'white', { trim: 'sign', wy: [1.4], wm: 'glass' });
          B.box(0, 5.4, -9.7, 7, 1.4, 0.3, 'sign', { nc: 1 }); B.box(0, 5.4, 9.7, 7, 1.4, 0.3, 'sign', { nc: 1 });
          const P = 'plank';
          B.ramp(-12, -33, 8, 3, 7, 8, 1, P, { base: 6.6 }); B.ramp(12, -33, 8, 3, 6, 7, 1, P, { base: 5.6 });
          B.ramp(-12, 33, 8, 3, 6, 7, 0, P, { base: 5.6 }); B.ramp(12, 33, 8, 3, 7, 8, 0, P, { base: 6.6 });
          B.ramp(-33, -12, 3, 8, 7, 8, 3, P, { base: 6.6 }); B.ramp(-33, 12, 3, 8, 6, 7, 3, P, { base: 5.6 });
          B.ramp(33, -12, 3, 8, 6, 7, 2, P, { base: 5.6 }); B.ramp(33, 12, 3, 8, 7, 8, 2, P, { base: 6.6 });
          B.ramp(0, -19, 3, 18, 5, 7, 3, P, { base: 4.6 }); B.ramp(0, 19, 3, 18, 5, 7, 2, P, { base: 4.6 });
          B.ramp(-19, 0, 18, 3, 5, 7, 1, P, { base: 4.6 }); B.ramp(19, 0, 18, 3, 5, 7, 0, P, { base: 4.6 });
          B.ramp(-15, -6, 10, 3, 0, 5, 0, 'metal'); B.ramp(15, 6, 10, 3, 0, 5, 1, 'metal');
          B.ramp(6, -15, 3, 10, 0, 5, 2, 'metal'); B.ramp(-6, 15, 3, 10, 0, 5, 3, 'metal');
          B.ramp(-25, -14.5, 14, 3, 0, 8, 1, 'metal'); B.ramp(25, 14.5, 14, 3, 0, 8, 0, 'metal');
          B.cyl(-31, 8, -31, 2, 4, 'plank', { seg: 12 }); B.cyl(-31, 12, -31, 2.2, 1.2, 'roofR', { seg: 12, r2: 0.3, nc: 1 });
          B.box(30, 8, 30, 6, 3, 0.3, 'sign', { nc: 1 }); B.box(30, 8, 30.3, 0.3, 3, 0.3, 'dark', { nc: 1 });
          for (const [x, y, z] of [[-24, 8, -24], [24, 8, 24], [27, 6, -27], [-27, 6, 27], [0, 7, -33], [0, 7, 33], [-33, 7, 0], [33, 7, 0], [5, 5, 5], [-5, 5, -5]]) B.box(x, y, z, 2.2, 1.3, 1.6, 'metal');
          for (const [x, z] of [[-22, -4], [22, 4], [-4, -22], [4, 22], [-24, 24], [24, -24], [-12, 22], [12, -22]]) B.box(x, 0, z, 2.6, 1.3, 1.3, 'cont', { c: 0x48c070 });
          const S = [[-30, 8, -24], [30, 8, 24], [27, 6, -30], [-27, 6, 30], [-34, 0, 12], [34, 0, -12], [12, 0, -34], [-12, 0, 34], [-6, 5, 0], [6, 5, 0], [-22, 0, 12], [22, 0, -12], [0, 7, -31], [0, 7, 31], [-31, 7, 4], [31, 7, -4]];
          for (const s of S) B.spawn(s[0], s[1], s[2], s[0] + s[2] < 0 ? 0 : 1);
          for (const [x, y, z, k] of [[0, 5, 0, 'n'], [-28, 8, -28, 'a'], [28, 8, 28, 'a'], [28, 6, -28, 'a'], [-28, 6, 28, 'a'], [-24, 0, 0, 'n'], [24, 0, 0, 'n'], [0, 7, -31, 'a'], [0, 7, 31, 'a']]) B.pickup(x, y + 0.45, z, k);
          B.zone(0, 5, 0, 5, 'Diner roof'); B.zone(0, 7, -33, 4.5, 'North roof'); B.zone(0, 7, 33, 4.5, 'South roof'); B.zone(-22, 0, 0, 5, 'West street'); B.zone(22, 0, 0, 5, 'East street');
        }
      }
    ];

    const ICON = {
      sunny: '<path d="M4 11h26l3-3h9v4h-5l-2 3h-4l-2 6h-5l2-6h-6l-2 4H9l1-4H4z"/>',
      poacher: '<path d="M2 11h34v4H22l-2 2h-6l-2 4H7l2-4H2z"/><path d="M22 15h12v2H22z"/>',
      overeasy: '<path d="M3 11h30l2-2h9v3h-7v3H24l-2 5h-5l1-5H8l-1 3H3z"/><path d="M19 7h7v3h-7z"/>',
      benedict: '<path d="M2 12h34l1-2h9v3h-8v2H24l-2 4h-5l1-4H9l-1 3H3z"/><path d="M16 7h12v4H16z"/>',
      whisk: '<path d="M10 10h20l2-2h5v4h-4v4h-6l-1 6h-5l1-6h-5l-2 3h-4z"/>',
      souffle: '<path d="M4 9h32v7H4z"/><path d="M36 8l7 4.5-7 4.5z"/><path d="M14 16h4v6h-4z"/>',
      triple: '<path d="M4 11h28l2-2h9v4h-6l-2 3h-4l-1 5h-5l1-5h-7l-2 4H9l1-4H4z"/><circle cx="24" cy="9" r="1.6"/><circle cx="28" cy="9" r="1.6"/>',
      peep: '<path d="M16 10h18v4H24l-2 8h-5l2-8h-3z"/>',
      spatula: '<path d="M4 12h20v2H4z"/><path d="M24 8h18v10H24z"/>',
      grenade: '<circle cx="24" cy="14" r="7"/><path d="M22 4h4v4h-4z"/>',
      fall: '<path d="M20 4v14M14 12l6 6 6-6"/><path d="M8 22h24"/>'
    };
    const svgI = k => `<svg viewBox="0 0 48 24" class="wi" fill="currentColor" stroke="none">${ICON[k] || ICON.sunny}</svg>`;

    const SND = {
      rifle: (A, D) => { A.noise(0.08, 0.42, 2000, 0.8, 0, 'bandpass', 700, D); A.tone(260, 110, 0.08, 'square', 0.12, 0, D); A.tone(900, 500, 0.04, 'sine', 0.05, 0, D); },
      smg: (A, D) => { A.noise(0.05, 0.34, 2600, 0.9, 0, 'bandpass', 1100, D); A.tone(330, 150, 0.05, 'square', 0.09, 0, D); },
      burst: (A, D) => { A.noise(0.07, 0.4, 2200, 0.8, 0, 'bandpass', 800, D); A.tone(300, 130, 0.07, 'square', 0.1, 0, D); },
      marks: (A, D) => { A.noise(0.16, 0.6, 1600, 0.6, 0, 'lowpass', 300, D); A.tone(180, 70, 0.14, 'sawtooth', 0.16, 0, D); A.tone(1200, 600, 0.05, 'sine', 0.05, 0, D); },
      sniper: (A, D) => { A.noise(0.32, 0.75, 1200, 0.5, 0, 'lowpass', 200, D); A.tone(120, 40, 0.3, 'sawtooth', 0.26, 0, D); A.tone(1600, 800, 0.08, 'sine', 0.06, 0, D); A.noise(0.08, 0.14, 3000, 4, 0.45, 'bandpass', 0, D); },
      shotgun: (A, D) => { A.noise(0.26, 0.8, 1000, 0.5, 0, 'lowpass', 160, D); A.tone(110, 40, 0.22, 'square', 0.2, 0, D); A.noise(0.06, 0.12, 2400, 5, 0.3, 'bandpass', 0, D); },
      rocket: (A, D) => { A.noise(0.4, 0.45, 800, 0.8, 0, 'bandpass', 2600, D); A.tone(100, 220, 0.3, 'sawtooth', 0.1, 0, D); },
      pistol: (A, D) => { A.noise(0.07, 0.4, 2400, 0.8, 0, 'bandpass', 900, D); A.tone(340, 140, 0.06, 'square', 0.1, 0, D); },
      swing: (A, D) => A.noise(0.16, 0.25, 1100, 1.2, 0, 'bandpass', 3000, D),
      melee: (A, D) => { A.tone(420, 180, 0.1, 'triangle', 0.25, 0, D); A.noise(0.06, 0.25, 1500, 2, 0, 'bandpass', 0, D); },
      hit: (A, D) => { A.tone(1300, 1700, 0.05, 'sine', 0.1, 0, D); },
      head: (A, D) => { A.tone(1900, 2600, 0.08, 'sine', 0.14, 0, D); A.noise(0.04, 0.12, 5000, 3, 0, 'bandpass', 0, D); },
      kill: (A, D) => { A.noise(0.12, 0.5, 4200, 3, 0, 'bandpass', 1800, D); A.noise(0.08, 0.35, 2600, 4, 0.06, 'bandpass', 0, D); A.tone(700, 1400, 0.12, 'sine', 0.08, 0.05, D); },
      hurt: (A, D) => { A.tone(220, 120, 0.12, 'triangle', 0.22, 0, D); A.noise(0.06, 0.2, 3000, 3, 0, 'bandpass', 0, D); },
      reload: (A, D) => { A.noise(0.04, 0.3, 2800, 3, 0, 'bandpass', 0, D); A.tone(600, 450, 0.05, 'square', 0.05, 0.3, D); A.noise(0.05, 0.3, 2000, 3, 0.7, 'bandpass', 0, D); A.tone(800, 1100, 0.05, 'square', 0.05, 0.95, D); },
      swap: (A, D) => { A.noise(0.05, 0.2, 2500, 2, 0, 'bandpass', 0, D); A.tone(700, 900, 0.04, 'sine', 0.05, 0.08, D); },
      dry: (A, D) => A.tone(1700, 1500, 0.03, 'square', 0.06, 0, D),
      jump: (A, D) => { A.tone(300, 520, 0.12, 'sine', 0.05, 0, D); },
      land: (A, D, k) => { A.tone(160, 80, 0.08, 'sine', 0.08 + (k || 0) * 0.15, 0, D); A.noise(0.05, 0.08 + (k || 0) * 0.15, 600, 1, 0, 'lowpass', 0, D); },
      step: (A, D) => A.tone(200, 160, 0.04, 'sine', 0.05, 0, D),
      ric: (A, D) => { A.noise(0.04, 0.14, 3500, 2, 0, 'bandpass', 0, D); if (Math.random() < 0.4) A.tone(2600 + Math.random() * 1200, 1000, 0.1, 'sine', 0.03, 0, D); },
      boom: (A, D) => { A.noise(0.9, 1, 600, 0.5, 0, 'lowpass', 60, D); A.tone(80, 30, 0.7, 'sine', 0.55, 0, D); A.noise(0.25, 0.4, 2200, 0.7, 0, 'bandpass', 400, D); },
      die: (A, D) => { A.noise(0.18, 0.7, 4500, 2, 0, 'bandpass', 1500, D); A.noise(0.12, 0.5, 2500, 3, 0.07, 'bandpass', 900, D); A.noise(0.3, 0.3, 600, 0.8, 0.1, 'lowpass', 200, D); },
      dead: (A, D) => { A.tone(330, 160, 0.5, 'triangle', 0.1, 0, D); A.tone(247, 120, 0.7, 'sine', 0.08, 0.15, D); },
      spawn: (A, D) => { A.tone(520, 1040, 0.2, 'sine', 0.08, 0, D); A.tone(780, 1560, 0.15, 'sine', 0.05, 0.08, D); },
      start: (A, D) => { [587, 740, 880].forEach((f, i) => A.tone(f, f, 0.14, 'triangle', 0.1, i * 0.1, D)); },
      win: (A, D) => { [523, 659, 784, 1047, 880, 1047].forEach((f, i) => A.tone(f, f, 0.22, 'triangle', 0.1, i * 0.12, D)); },
      lose: (A, D) => { [440, 392, 349, 294].forEach((f, i) => A.tone(f, f * 0.98, 0.3, 'triangle', 0.1, i * 0.18, D)); },
      zone: (A, D) => { A.tone(660, 990, 0.2, 'sine', 0.1, 0, D); A.tone(990, 1320, 0.2, 'sine', 0.08, 0.15, D); },
      chat: (A, D) => A.tone(1200, 1500, 0.05, 'sine', 0.05, 0, D),
      award: (A, D) => { [784, 988, 1175, 1568].forEach((f, i) => A.tone(f, f, 0.12, 'triangle', 0.09, i * 0.07, D)); },
      pickup: (A, D) => { A.tone(880, 1320, 0.08, 'sine', 0.1, 0, D); A.tone(1320, 1760, 0.08, 'sine', 0.08, 0.07, D); },
      bounce: (A, D) => A.tone(520, 320, 0.05, 'triangle', 0.12, 0, D),
      throw: (A, D) => A.noise(0.12, 0.15, 1000, 1, 0, 'bandpass', 2400, D),
      slide: (A, D) => A.noise(0.3, 0.1, 600, 0.6, 0, 'bandpass', 1500, D)
    };
    const TI = {
      fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>',
      ads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
      jump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/><path d="M6 19h12"/></svg>',
      crouch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6l8 12M16 6L8 18"/></svg>',
      reload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12a7 7 0 1 1-2-5"/><path d="M19 4v4h-4"/></svg>',
      swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>',
      nade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="6"/><path d="M12 8V5h3"/></svg>',
      melee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 18L13 9"/><rect x="12" y="4" width="8" height="8" rx="1" transform="rotate(45 16 8)"/></svg>',
      pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
      sb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
    };

    function gunParts(k, s) {
      s = s || 1;
      const P = [];
      const b = (c, x, y, z, w, h, d) => P.push(['box', c, [x * s, y * s, z * s], [w * s, h * s, d * s]]);
      const cy = (c, x, y, z, r, l, seg) => P.push([seg || 'cyl', c, [x * s, y * s, z * s], [r * 2 * s, l * s, r * 2 * s], [Math.PI / 2, 0, 0]]);
      const sp = (c, x, y, z, r) => P.push(['sphL', c, [x * s, y * s, z * s], [r * 2 * s, r * 2 * s, r * 2 * s]]);
      let mz = -0.5, mag = null;
      if (k === 'sunny') { b('#ff9a2a', 0, 0, -0.04, 0.085, 0.1, 0.44); cy('#3a3a48', 0, 0.015, -0.38, 0.024, 0.28); b('#ffd23d', 0, 0.065, -0.06, 0.05, 0.035, 0.22); b('#ff9a2a', 0, -0.02, 0.27, 0.07, 0.11, 0.2); b('#3a3a48', 0, -0.085, 0.07, 0.055, 0.12, 0.07); sp('#ffd23d', 0, 0.015, -0.53, 0.03); mag = ['#3a3a48', 0, -0.12, -0.08, 0.055, 0.17, 0.09]; mz = -0.56; }
      else if (k === 'poacher') { b('#2fb8a8', 0, -0.015, 0.2, 0.08, 0.12, 0.28); b('#3a3a48', 0, 0.005, -0.08, 0.09, 0.1, 0.32); cy('#e8e4dc', -0.022, 0.03, -0.42, 0.025, 0.42); cy('#e8e4dc', 0.022, 0.03, -0.42, 0.025, 0.42); b('#2fb8a8', 0, -0.05, -0.34, 0.09, 0.06, 0.18); mz = -0.64; }
      else if (k === 'overeasy') { b('#f04a5a', 0, 0, -0.05, 0.08, 0.1, 0.5); cy('#f4f0e8', 0, 0.015, -0.44, 0.022, 0.34); cy('#3a3a48', 0, 0.1, -0.06, 0.035, 0.2); b('#f4f0e8', 0, -0.02, 0.3, 0.07, 0.12, 0.22); b('#3a3a48', 0, -0.09, 0.08, 0.055, 0.12, 0.07); mag = ['#f4f0e8', 0, -0.1, -0.12, 0.05, 0.12, 0.08]; mz = -0.62; }
      else if (k === 'benedict') { b('#3c6a3a', 0, 0, 0, 0.075, 0.09, 0.64); cy('#2a2a30', 0, 0.015, -0.6, 0.02, 0.56); cy('#e8b830', 0, 0.105, -0.05, 0.042, 0.34); cy('#2a2a30', 0, 0.105, -0.23, 0.05, 0.04); b('#6a4a2a', 0, -0.03, 0.38, 0.065, 0.13, 0.26); b('#2a2a30', 0, -0.09, 0.1, 0.05, 0.11, 0.06); mag = ['#2a2a30', 0, -0.08, -0.12, 0.05, 0.08, 0.08]; mz = -0.88; }
      else if (k === 'whisk') { b('#9a5ae8', 0, 0, 0, 0.08, 0.11, 0.34); cy('#e8e4dc', 0, 0.02, -0.24, 0.03, 0.14, 'cyl6'); b('#ffd23d', 0, 0.07, -0.02, 0.035, 0.03, 0.12); b('#3a3a48', 0, -0.02, 0.22, 0.06, 0.07, 0.12); b('#3a3a48', 0, -0.1, 0.06, 0.055, 0.11, 0.06); mag = ['#ffd23d', 0, -0.13, -0.08, 0.05, 0.2, 0.06]; mz = -0.33; }
      else if (k === 'souffle') { cy('#ffd23d', 0, 0.03, -0.08, 0.085, 0.92); cy('#f04a5a', 0, 0.03, -0.56, 0.095, 0.08); cy('#3a3a48', 0, 0.03, 0.4, 0.09, 0.06); b('#3a3a48', 0, -0.1, 0.02, 0.055, 0.13, 0.07); b('#3a3a48', 0, -0.1, -0.22, 0.055, 0.11, 0.06); b('#f04a5a', 0, 0.13, -0.1, 0.04, 0.06, 0.1); mz = -0.62; }
      else if (k === 'triple') { b('#3a8ce0', 0, 0, -0.05, 0.085, 0.1, 0.46); cy('#3a3a48', 0, 0.015, -0.4, 0.023, 0.26); b('#ffd23d', 0, 0.07, -0.08, 0.04, 0.04, 0.16); sp('#ffd23d', -0.025, 0.07, 0.04, 0.025); sp('#ffd23d', 0.025, 0.07, 0.04, 0.025); b('#3a8ce0', 0, -0.02, 0.28, 0.07, 0.11, 0.2); b('#3a3a48', 0, -0.09, 0.07, 0.055, 0.12, 0.07); mag = ['#3a3a48', 0, -0.12, -0.1, 0.05, 0.16, 0.08]; mz = -0.56; }
      else if (k === 'peep') { b('#ffd23d', 0, 0.015, -0.06, 0.06, 0.07, 0.22); b('#3a3a48', 0, -0.07, 0.03, 0.05, 0.12, 0.065); sp('#ff9a2a', 0, 0.06, -0.15, 0.02); mz = -0.18; }
      else if (k === 'spatula') { b('#3a3a48', 0, 0, 0.06, 0.035, 0.035, 0.24); b('#c8ccd4', 0, 0.01, -0.16, 0.12, 0.012, 0.18); b('#c8ccd4', 0, 0, -0.06, 0.03, 0.01, 0.06); mz = -0.26; }
      return { P, mz: mz * s, mag: mag ? [mag[0], [mag[1] * s, mag[2] * s, mag[3] * s], [mag[4] * s, mag[5] * s, mag[6] * s]] : null };
    }

    let eggGeo = null, shardGeo = null;
    function egg(kit) {
      if (eggGeo) return eggGeo;
      const { THREE } = kit, pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16, y = 1.42 * t, r = 0.47 * Math.pow(Math.sin(Math.PI * t), 0.82) * (1 - 0.2 * t); pts.push(new THREE.Vector2(Math.max(0.001, r), y)); }
      eggGeo = kit.own(new THREE.LatheGeometry(pts, 22));
      eggGeo.computeVertexNormals();
      return eggGeo;
    }
    function shards(kit) {
      if (shardGeo) return shardGeo;
      const { THREE } = kit, g = new THREE.BufferGeometry();
      const P = [0, 0.5, 0, -0.45, -0.3, 0.05, 0.5, -0.4, -0.05, 0, 0.5, 0, 0.5, -0.4, -0.05, -0.45, -0.3, 0.05];
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
      shardGeo = kit.own(g);
      return shardGeo;
    }

    const Gdef = {
      id: 'yolk-ops', title: 'Yolk Ops', tint: '#ffb020',
      blurb: 'Cartoon egg shooter: pick a weapon class, crack eggs, grab grenades and win the coop.',
      help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · mouse look · click fire · right click or <kbd>Shift</kbd> aim · <kbd>Space</kbd> jump · <kbd>R</kbd> reload · <kbd>E</kbd> or wheel swap to pistol · <kbd>Q</kbd> grenade · <kbd>F</kbd> spatula · <kbd>Tab</kbd> scores · <kbd>Esc</kbd> menu · touch: stick, drag to look, buttons',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8c10 0 18 16 18 28a18 18 0 0 1-36 0C14 24 22 8 32 8z"/><path d="M22 34l5 4 5-6 5 6 5-4"/></svg>',
      font: '"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif', pixel: false, exposure: 1.05, mapAO: 0.8,
      phys: { g: 17, jumpV: 8.0, speed: 5.7, accel: 10, airAccel: 2.6, airCap: 1.3, fric: 7, stopSpeed: 2, crouchMul: 1, slideBoost: 1, slideTime: 0, slideFric: 1, slideMin: 1, stepH: 0.45, H: 1.48, HC: 1.48, eye: 1.18, eyeC: 1.18, R: 0.42, maxFall: 30, autoHop: true, maxAir: 1.4, adsMul: 0.75 },
      weapons: WEP, classes: CLS, melee: 'spatula', nade: 'grenade', nades: 1, maxNades: 3,
      keys: { crouch: [], ads: ['ShiftLeft', 'ShiftRight'], swap: ['KeyE'], nade: ['KeyQ', 'KeyG'], melee: ['KeyF', 'KeyV'] },
      modes: [
        { key: 'ffa', name: 'Free for all', teams: 0, time: 300, limit: 25 },
        { key: 'teams', name: 'Teams', teams: 1, time: 360, limit: 40 },
        { key: 'coop', name: 'King of the Coop', teams: 1, zone: 1, time: 360, limit: 150, zoneTime: 50 }
      ],
      teams: ['Sunny Side', 'Cool Shells'],
      maps: MAPS, mats: MATS, sky: MAPS[0].sky,
      respawn: 5, manualSpawn: true, autoSpawn: 25, spawnProt: 2, regenDelay: 5, regenRate: 14, killScore: 100, headScore: 25, assistScore: 25, botSight: 85, hearR: 40, footR: 12, defBots: 6, maxBots: 7, defFov: 75,
      pickupRespawn: 18, scorch: 0,
      botClassW: [3, 1.6, 1.6, 1.2, 1.6, 1, 1.4],
      botNames: ['Sunny', 'Omelette', 'Scrambles', 'Yolko', 'Shelldon', 'Benny', 'Eggbert', 'Poppy', 'Crackers', 'Dotty', 'Huevo', 'Clucky', 'Fritter', 'Nugget', 'Waffles', 'Pancake', 'Muffin', 'Toasty', 'Biscuit', 'Peaches'],
      firstHint: 'Click to aim. Space jumps, Shift aims, Q throws a grenade.',
      zoneMoved: 'The coop moved', headWord: 'Yolk shots', headWord1: 'Yolk shot', mateCol: '#7fe0ff', foeCol: '#ff8a5a', tracer: '#fff2b0', boomCol: '#ffc040',
      headIcon: '<svg viewBox="0 0 24 24" class="hi" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
      sounds: SND, touchIcons: TI,
      hitboxes: () => hbS,
      headY: () => 0.78,
      fovFor(p) { const w = p.weps[p.cur]; return w ? 1 + ((w.d.zoom || 1) - 1) * p.adsF : 1; },
      colorFor(p, teams) { return teams ? TEAMC[p.team] : EGGC[p.slot % EGGC.length]; },
      wepIcon: k => svgI(k),
      statBars(c) { const w = WEP[c.prim]; const per = w.kind === 'rocket' ? 145 : w.dmg * (w.pellets || 1) * (w.burst || 1); const dps = w.kind === 'rocket' ? 110 : w.dmg * (w.pellets || 1) * (w.burst || 1) / w.rate; return [['Damage', Math.min(1, per / 150)], ['Fire rate', Math.min(1, dps / 250)], ['Range', w.scope ? 1 : w.pellets ? 0.15 : w.kind === 'rocket' ? 0.45 : Math.min(1, (w.fall1 || 60) / 90)], ['Ammo', Math.min(1, (w.mag + w.reserve) / 280)]]; },
      streakName(n) { return n === 2 ? 'Double crack' : n === 3 ? 'Triple crack' : n === 5 ? 'Egg-cellent! 5 in a row' : n === 10 ? 'Hard boiled! 10 in a row' : n > 3 && n % 5 === 0 ? 'Streak of {n}' : ''; },
      streaks: [
        { n: 3, key: 'fresh', name: 'Fresh Shell: health restored', give(W, p) { p.hp = p.maxHp; } },
        { n: 5, key: 'hard', name: 'Hard Shell: armour on', give(W, p) { p.shield = 60; } },
        { n: 8, key: 'carton', name: 'Full Carton: ammo and grenades', give(W, p) { for (const w of p.weps) if (w.d.mag) { w.mag = w.d.mag; w.res = w.d.reserve; } p.nades = 3; } }
      ],
      pickup(W, p, k) {
        if (k === 'n') { if (p.nades >= 3) return false; p.nades++; return true; }
        let need = false;
        for (const w of p.weps) if (w.d.mag && w.res < w.d.reserve) need = true;
        if (!need) return false;
        for (const w of p.weps) if (w.d.mag) w.res = Math.min(w.d.reserve, w.res + Math.max(w.d.mag, Math.round(w.d.reserve * 0.4)));
        return true;
      },
      pickupName: k => k === 'n' ? '+1 Grenade' : '+Ammo',
      logo: () => `<div class="yo-logo"><span class="egg"></span><span class="a">YOLK</span><span class="b">OPS</span></div><p class="yo-tag">${escH(T('Crack or be cracked.'))}</p>`,
      howHTML: (T, e) => `<ul class="fp-list"><li>${e(T('Move with W A S D (Z Q S D on French keyboards), look with the mouse, click to fire.'))}</li><li>${e(T('Right click or Shift to aim. Aim at the middle of the egg: yolk shots do much more damage.'))}</li><li>${e(T('Space jumps. Eggs jump high, so jump around corners and over cover to dodge.'))}</li><li>${e(T('R reloads, E or the mouse wheel swaps to the Peep 9 pistol, Q throws a grenade, F swings the spatula.'))}</li><li>${e(T('Ammo boxes and grenades lie around the map and come back after a while.'))}</li><li>${e(T('Kill streaks: 3 kills restore your health, 5 give you a hard shell, 8 refill your ammo and grenades.'))}</li><li>${e(T('Free for all: first to 25. Teams: first team to 40. King of the Coop: stand in the coop to score; it moves every 50 seconds.'))}</li></ul>`,
      css: R => `
${R} .fp-wrap{--acc:#ffb020;--acc2:#38c6b8;--ink:#2a2340;font-family:"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif;color:var(--ink)}
${R} .fp-card{background:#fff8ea;border:4px solid var(--ink);border-radius:22px;padding:clamp(12px,2.2cqw,24px);box-shadow:0 8px 0 var(--ink),0 20px 50px rgba(0,0,0,.35)}
${R} .fp-card h3{margin:0 0 .6em;font-size:clamp(18px,3cqw,30px);font-weight:900;color:var(--ink)}
${R} .fp-main{width:min(96cqw,860px)}
${R} .yo-logo{display:flex;align-items:center;gap:.15em;font-weight:900;font-size:clamp(30px,6.4cqw,60px);line-height:1;letter-spacing:.01em}
${R} .yo-logo .egg{width:.72em;height:.92em;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 62%,#ffc020 0 28%,#fff 30%);border:4px solid var(--ink);margin-right:.12em}
${R} .yo-logo .a{color:#ffb020;-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}${R} .yo-logo .b{color:#38c6b8;-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}
${R} .yo-tag{margin:.3em 0 .9em;color:#8a6a40;font-weight:800;font-size:clamp(10px,1.5cqw,14px)}
${R} .fp-lv{display:flex;flex-wrap:wrap;align-items:center;gap:.4em 1em;font-size:clamp(11px,1.4cqw,14px);color:#6a5a4a;margin-bottom:1em}
${R} .fp-lv .lvb{background:var(--ink);color:#ffd23d;font-weight:900;padding:.2em .7em;border-radius:999px}
${R} .fp-lv .lvbar{flex:1;min-width:80px;height:9px;border-radius:9px;background:#eadcc0;overflow:hidden;border:2px solid var(--ink)}
${R} .fp-lv .lvbar i{display:block;height:100%;background:#ffb020}
${R} .fp-opts{display:grid;grid-template-columns:auto 1fr;gap:.5em 1em;align-items:center;margin-bottom:1em;font-size:clamp(11px,1.5cqw,14px)}
${R} .fp-opts label,${R} .fp-lab,${R} .fp-set label{font-weight:900;color:#8a6a40;font-size:.9em}
${R} .fp-seg button{background:#fff;color:var(--ink);padding:.38em .8em;border-radius:999px;font-weight:800;font-size:inherit;border:2.5px solid var(--ink)}
${R} .fp-seg button:hover{background:#fff0c8}
${R} .fp-seg button.on{background:#ffd23d}
${R} .fp-num{gap:.6em}${R} .fp-num small{color:#8a6a40}
${R} .fp-btn{background:#fff;color:var(--ink);padding:.6em 1.2em;border-radius:999px;font-weight:900;font-size:clamp(12px,1.7cqw,16px);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink)}
${R} .fp-btn:hover{background:#fff0c8}
${R} .fp-btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
${R} .fp-btn.big{background:#ffb020;font-size:clamp(15px,2.3cqw,22px);padding:.55em 1.6em}
${R} .fp-btn.big:hover{background:#ffc040}
${R} .fp-btn.ghost{background:#f4ead4}
${R} .fp-btn.sm{padding:.15em .7em;font-size:16px}
${R} .fp-btn:disabled{opacity:.45;cursor:default}
${R} .fp-acts{display:flex;flex-wrap:wrap;gap:.7em;margin-top:1em;align-items:center}
${R} .fp-acts.col{flex-direction:column;align-items:stretch}
${R} .fp-cls{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.1em;background:#fff;border:3px solid #e6d6b6;border-radius:14px;padding:.5em .6em;color:var(--ink);text-align:left;font-size:clamp(10px,1.35cqw,13px)}
${R} .fp-cls:hover{border-color:#c8b48a}
${R} .fp-cls.on{border-color:var(--ink);background:#fff0c0}
${R} .fp-cls .ic{color:#ff8a20;height:1.6em;display:block}${R} .fp-cls .ic svg{height:100%;width:auto}
${R} .fp-cls b{font-weight:900}${R} .fp-cls small{color:#8a7a6a}
${R} .fp-cls kbd{position:absolute;right:.5em;top:.35em;font:800 10px/1 system-ui;color:#b8a888}
${R} .fp-clsg{display:grid;grid-template-columns:repeat(4,1fr);gap:.45em}
${R} .fp-clsd p{color:#5a4a3a}${R} .fp-clsd .bars{color:#8a6a40}
${R} .fp-clsd .bars i{background:linear-gradient(90deg,#38c6b8 var(--v),#eadcc0 var(--v))!important;border:1.5px solid var(--ink);height:7px!important}
${R} .fp-set{width:min(92cqw,520px);display:grid;grid-template-columns:auto 1fr;gap:.7em 1.2em;align-items:center;font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-set h3,${R} .fp-set .fp-acts{grid-column:1/-1}
${R} .fp-how{width:min(92cqw,640px);font-size:clamp(11px,1.6cqw,15px)}
${R} .fp-list{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:.5em;line-height:1.4;color:#4a3a2a}
${R} .fp-pause{width:min(86cqw,380px);text-align:center}
${R} .fp-note{color:#7a6a5a;font-size:clamp(11px,1.5cqw,14px);margin:.3em 0}
${R} .fp-death{width:min(94cqw,580px);text-align:center;background:#fff1e0}
${R} .fp-death h3{color:#e0503a;margin:.1em 0 .2em}
${R} .fp-kick{margin:0;font-weight:900;color:#a08060;font-size:clamp(10px,1.4cqw,13px)}
${R} .fp-rs{font-size:clamp(16px,2.6cqw,26px);font-weight:900;margin:.3em 0 .6em;min-height:1.2em}
${R} .fp-death .fp-acts{justify-content:center}
${R} .fp-over{width:min(96cqw,660px);text-align:center}
${R} .fp-over.win h3{color:#ff9a10}
${R} .fp-ts{font-size:clamp(22px,4cqw,40px);font-weight:900;margin:0 0 .3em}
${R} .fp-ts .t0,${R} tr.t0 td:nth-child(2),${R} .fp-feed b.t0,${R} tr.th.t0 td{color:#e88a00}${R} .fp-ts .t1,${R} tr.t1 td:nth-child(2),${R} .fp-feed b.t1,${R} tr.th.t1 td{color:#1a98e0}
${R} .fp-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:.45em;margin:.6em 0}
${R} .fp-stats div{background:#fff;border:2.5px solid var(--ink);border-radius:14px;padding:.4em .2em;display:flex;flex-direction:column}
${R} .fp-stats b{font-size:clamp(15px,2.4cqw,24px);font-weight:900}${R} .fp-stats small{color:#8a7a6a;font-size:clamp(9px,1.2cqw,12px)}
${R} .fp-lvup{color:#18a090;font-weight:900;margin:.3em 0}
${R} .fp-tbl{max-height:30cqh;overflow:auto;margin-top:.4em}
${R} .fp-tbl table{width:100%;border-collapse:collapse;font-size:clamp(10px,1.4cqw,14px)}
${R} .fp-tbl td,${R} .fp-tbl th{padding:.3em .6em;text-align:right}${R} .fp-tbl td:nth-child(2),${R} .fp-tbl th:nth-child(2){text-align:left}
${R} .fp-tbl th,${R} .fp-sb th{color:#a08a6a;font-weight:900;font-size:.85em}
${R} tr.me td{background:#ffe8a8}
${R} .fp-sbc{background:#fff8eaf0}${R} .fp-sbc h3{font-size:clamp(14px,2cqw,20px)}
${R} .fp-sb tr.th td{text-align:left;font-weight:900;padding-top:.8em}
${R} .fp-hud{font-family:"Arial Rounded MT Bold","Nunito","Trebuchet MS",system-ui,sans-serif;color:#fff}
${R} .fp-hud{--o:0 0 0 transparent}
${R} .yo-hp{position:absolute;left:2cqw;bottom:2cqw;display:flex;align-items:center;gap:1cqw}
${R} .yo-hp .eg{position:relative;width:clamp(38px,6.4cqw,64px);height:clamp(48px,8cqw,80px);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#fff;border:3px solid var(--ink);overflow:hidden;box-shadow:0 4px 0 var(--ink)}
${R} .yo-hp .eg i{position:absolute;left:0;right:0;bottom:0;height:100%;background:linear-gradient(#ffd040,#ff9a10);transform-origin:bottom;transition:transform .15s}
${R} .yo-hp .eg u{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 4px rgba(140,220,255,.0)}
${R} .yo-hp.sh .eg u{box-shadow:inset 0 0 0 5px rgba(120,210,255,.95)}
${R} .yo-hp.low .eg i{background:linear-gradient(#ff8a7a,#e8402a)}
${R} .yo-hp .n{font-size:clamp(20px,3.8cqw,40px);font-weight:900;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 3px 0 var(--ink)}
${R} .yo-hp .cl{display:block;font-size:clamp(9px,1.25cqw,13px);font-weight:900;color:#fff;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-am{position:absolute;right:2cqw;bottom:2cqw;text-align:right;line-height:1}
${R} .yo-am .n{font-size:clamp(22px,4.6cqw,48px);font-weight:900;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 3px 0 var(--ink)}
${R} .yo-am .r{font-size:clamp(12px,2cqw,22px);font-weight:900;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
${R} .yo-am .n.low{color:#ff6a4a}
${R} .yo-am .wn{display:flex;align-items:center;justify-content:flex-end;gap:.5em;font-size:clamp(10px,1.35cqw,14px);font-weight:900;margin-top:.35em;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-am .wn svg{height:1.6em;width:auto;color:#ffd23d;filter:drop-shadow(0 2px 0 var(--ink))}
${R} .yo-am .nd{display:flex;justify-content:flex-end;gap:4px;margin-bottom:.4em}
${R} .yo-am .nd i{width:clamp(10px,1.6cqw,16px);height:clamp(12px,1.9cqw,19px);border-radius:50%;background:#5a7a3a;border:2px solid var(--ink)}
${R} .yo-am .nd i.off{background:rgba(255,255,255,.25)}
${R} .yo-am .rl{font-size:clamp(10px,1.35cqw,14px);font-weight:900;height:1.3em;color:#ffd23d;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .yo-st{position:absolute;left:50%;bottom:2.2cqw;transform:translateX(-50%);display:flex;gap:5px}
${R} .yo-st i{width:clamp(8px,1.3cqw,14px);height:clamp(10px,1.6cqw,17px);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:rgba(255,255,255,.35);border:2px solid var(--ink)}
${R} .yo-st i.on{background:#ffd23d}${R} .yo-st i.mk{outline:2px solid #fff;outline-offset:1px}
${R} .fp-tc .tm{font-size:clamp(15px,2.4cqw,24px);font-weight:900;background:#fff8ea;color:var(--ink);padding:.15em .7em;border-radius:999px;border:3px solid var(--ink)}
${R} .fp-tc .sc{font-size:clamp(13px,2cqw,20px);font-weight:900;padding:.15em .7em;border-radius:999px;min-width:2.4em;text-align:center;border:3px solid var(--ink);color:#fff;-webkit-text-stroke:1px var(--ink);paint-order:stroke fill}
${R} .fp-tc .sc.t0{background:#ffb020}${R} .fp-tc .sc.t1{background:#3cb8ff}
${R} .fp-tc .ob{font-size:clamp(10px,1.3cqw,13px);font-weight:900;background:rgba(42,35,64,.75);padding:.25em .7em;border-radius:999px;color:#fff}
${R} .fp-tl div{background:rgba(42,35,64,.62);border-radius:999px;font-weight:800}${R} .fp-tl div.me{background:rgba(255,176,32,.85);color:var(--ink)}
${R} .fp-feed div{background:rgba(42,35,64,.7);border-radius:999px;font-weight:800}
${R} .fp-feed div.mine{background:rgba(255,176,32,.9);color:var(--ink)}
${R} .fp-feed b.me{color:#fff}${R} .fp-feed .wi{color:#ffd23d}${R} .fp-feed div.mine .wi{color:var(--ink)}${R} .fp-feed .hi{height:1em;width:1em;color:#ffb020}
${R} .fp-pop div{-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink)}
${R} .fp-pop .st,${R} .fp-pop .aw{color:#ffd23d;font-size:clamp(20px,4cqw,40px)}
${R} .fp-pop .hs{color:#ffb020;font-size:clamp(14px,2.4cqw,24px)}
${R} .fp-pop .el{font-size:clamp(13px,2cqw,20px);color:#fff}
${R} .fp-pop .ov{font-size:clamp(26px,5cqw,52px);color:#fff}
${R} .fp-pop .zn{color:#7fe0ff;font-size:clamp(14px,2.4cqw,24px)}
${R} .fp-sub span{display:block;color:#ffd23d;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
${R} .fp-scope{background:radial-gradient(circle at center,transparent 0,transparent calc(min(40cqw,40cqh) - 4px),#2a2340 calc(min(40cqw,40cqh) - 3px),#2a2340 calc(min(40cqw,40cqh) + 2px),rgba(20,16,30,.92) calc(min(40cqw,40cqh) + 3px))}
${R} .fp-scope::before,${R} .fp-scope::after{content:"";position:absolute;left:50%;top:50%;background:rgba(42,35,64,.9)}
${R} .fp-scope::before{width:min(80cqw,80cqh);height:2px;transform:translate(-50%,-50%)}
${R} .fp-scope::after{height:min(80cqw,80cqh);width:2px;transform:translate(-50%,-50%)}
${R} .fp-ch i{box-shadow:0 0 0 1.5px rgba(42,35,64,.8)}
@container (max-width:620px){${R} .fp-clsg{grid-template-columns:repeat(2,1fr)}${R} .fp-stats{grid-template-columns:repeat(3,1fr)}${R} .fp-opts{grid-template-columns:1fr}}
@container (max-height:430px){${R} .fp-main{padding:10px 14px}${R} .yo-logo{font-size:30px}}
`,
      hudHTML: () => `<div class="yo-hp"><div class="eg"><i></i><u></u></div><div><b class="n">100</b><small class="cl"></small></div></div><div class="yo-st"></div><div class="yo-am"><div class="nd"></div><div class="rl"></div><span class="n">30</span><span class="r"> / 240</span><div class="wn"></div></div>`,
      hudBind(h, H) { H.hp = h.querySelector('.yo-hp'); H.hpN = h.querySelector('.yo-hp .n'); H.hpB = h.querySelector('.yo-hp .eg i'); H.cl = h.querySelector('.yo-hp .cl'); H.amN = h.querySelector('.yo-am .n'); H.amR = h.querySelector('.yo-am .r'); H.wn = h.querySelector('.yo-am .wn'); H.rl = h.querySelector('.yo-am .rl'); H.nd = h.querySelector('.yo-am .nd'); H.st = h.querySelector('.yo-st'); },
      hudUpdate(H, me, W, setT, setS, setH, T, e) {
        const hp = Math.max(0, Math.ceil(me.hp));
        setT(H.hpN, 'hp', String(hp));
        setS(H.hpB, 'hpb', 'transform', `scaleY(${(hp / me.maxHp).toFixed(3)})`);
        if (H.hp.classList.contains('low') !== (hp < 35)) H.hp.classList.toggle('low');
        if (H.hp.classList.contains('sh') !== (me.shield > 0)) H.hp.classList.toggle('sh');
        setT(H.cl, 'cl', T(CLS[me.cls].name));
        setH(H.nd, 'nd', [0, 1, 2].map(i => `<i class="${i < me.nades ? '' : 'off'}"></i>`).join(''));
        const s = me.streak, nxt = s < 3 ? 3 : s < 5 ? 5 : s < 8 ? 8 : 0;
        setH(H.st, 'st', nxt ? Array.from({ length: nxt }, (_, i) => `<i class="${i < s ? 'on' : ''}${i === nxt - 1 ? ' mk' : ''}"></i>`).join('') : '');
        const w = me.weps[me.cur];
        if (!w) return;
        const mel = w.d.kind === 'melee';
        setT(H.amN, 'amn', mel ? '—' : String(w.mag));
        setT(H.amR, 'amr', mel ? '' : ' / ' + w.res);
        if (H.amN.classList.contains('low') !== (!mel && w.mag <= Math.ceil(w.d.mag * 0.25))) H.amN.classList.toggle('low');
        setH(H.wn, 'wn', `${e(T(w.d.name))}${svgI(w.k)}`);
        setT(H.rl, 'rl', me.reloadT > 0 ? T('Reloading') : !mel && w.mag === 0 && w.res === 0 ? T('Out of ammo: find an ammo box') : !mel && w.mag === 0 ? T('Press R to reload') : '');
      },
      hudTop(H, W, me, tl, setH, T, e) {
        const mm = Math.floor(tl / 60), ss = String(tl % 60).padStart(2, '0');
        let html = '';
        if (W.teams) html = `<span class="sc t0">${W.teamScore[0]}</span><span class="tm">${mm}:${ss}</span><span class="sc t1">${W.teamScore[1]}</span>`;
        else { const L = W.players.filter(p => p && p.inGame); const top = Math.max(0, ...L.map(p => p.kills)); html = `<span class="tm">${mm}:${ss}</span><span class="ob">${e(T('First to {n}', { n: W.mode.limit }))} · ${top}</span>`; }
        if (W.mode.zone && W.M.zones.length) { const z = W.M.zones[W.zone.i]; const own = W.zone.own; html += `<span class="ob">${e(T(z.name))}${own === 2 ? ' · ' + e(T('Contested')) : own === me.team ? ' · ' + e(T('Held')) : own >= 0 ? ' · ' + e(T('Enemy')) : ''}</span>`; }
        setH(H.tc, 'tc', html);
      },
      makeSky(kit, sky, D) {
        const { THREE } = kit, g = new THREE.Group();
        const geo = kit.own(new THREE.SphereGeometry(400, 24, 14)), p = geo.attributes.position, cs = [];
        const c0 = kit.lin(sky.bot), c1 = kit.lin(sky.mid), c2 = kit.lin(sky.top), tc = new THREE.Color();
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 400, t = clamp(y * 1.3 + 0.05, 0, 1); if (t < 0.3) tc.copy(c0).lerp(c1, t / 0.3); else tc.copy(c1).lerp(c2, (t - 0.3) / 0.7); cs.push(tc.r, tc.g, tc.b); }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
        const m = new THREE.Mesh(geo, kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
        m.renderOrder = -1; g.add(m);
        let s = 11;
        const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
        if (sky.clouds) {
          const L = [];
          for (let i = 0; i < 22; i++) { const a = r() * TAU, d = 160 + r() * 110, y = 55 + r() * 45, w = 6 + r() * 8; for (let j = 0; j < 4; j++) L.push(['sphL', '#ffffff', [Math.cos(a) * d + (j - 1.5) * w * 0.8, y + (j % 2) * w * 0.25, Math.sin(a) * d], [w * 1.4, w * 0.8, w], [0, a, 0]]); }
          g.add(new THREE.Mesh(kit.geo(L), kit.own(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))));
        }
        const far = [];
        for (let i = 0; i < 34; i++) {
          const a = i / 34 * TAU + r() * 0.1, d = 100 + r() * 40;
          if (sky.city) { const h = 14 + r() * 34, w = 8 + r() * 10; far.push(['box', ['#8a6aa8', '#a87aa8', '#6a5a98'][i % 3], [Math.cos(a) * d, h / 2 - 1, Math.sin(a) * d], [w, h, w], [0, a, 0]]); }
          else if (sky.sea) { if (i % 3 === 0) far.push(['box', '#e8e0d0', [Math.cos(a) * d, 1.5, Math.sin(a) * d], [10, 4, 4], [0, a, 0]]); }
          else { const h = 6 + r() * 10, w = 10 + r() * 14; far.push(['sphL', i % 2 ? '#6ab04a' : '#5a9a40', [Math.cos(a) * d, 0, Math.sin(a) * d], [w * 1.6, h * 1.6, w * 1.6], [0, 0, 0]]); }
        }
        if (far.length) g.add(new THREE.Mesh(kit.geo(far), kit.own(new THREE.MeshLambertMaterial({ vertexColors: true }))));
        if (sky.sea || D.key === 'barnyard') {
          const sea = new THREE.Mesh(kit.own(new THREE.PlaneGeometry(900, 900)), kit.own(new THREE.MeshLambertMaterial({ color: sky.sea ? kit.lin('#3aa8e0') : kit.lin('#78c058') })));
          sea.rotation.x = -Math.PI / 2; sea.position.y = sky.sea ? -1.2 : -1.05; g.add(sea);
        }
        return g;
      },
      makeChar(kit, look) {
        const { THREE } = kit;
        const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
        const shell = look.color, ink = '#2a2340';
        const cls = CLS[look.cls] || CLS[0];
        const eggM = new THREE.Mesh(egg(kit), kit.own(new THREE.MeshPhongMaterial({ color: kit.lin(shell), shininess: 45, specular: 0x333333 })));
        body.add(eggM);
        const face = [['sph', '#ffffff', [-0.13, 0.98, -0.34], [0.17, 0.2, 0.08]], ['sph', '#ffffff', [0.13, 0.98, -0.34], [0.17, 0.2, 0.08]], ['sph', ink, [-0.12, 0.97, -0.385], [0.08, 0.1, 0.03]], ['sph', ink, [0.12, 0.97, -0.385], [0.08, 0.1, 0.03]], ['box', ink, [-0.14, 1.12, -0.34], [0.13, 0.025, 0.02], [0, 0, 0.18]], ['box', ink, [0.14, 1.12, -0.34], [0.13, 0.025, 0.02], [0, 0, -0.18]], ['box', ink, [0, 0.8, -0.38], [0.1, 0.02, 0.02]], ['sph', '#ffb8b0', [-0.25, 0.85, -0.3], [0.08, 0.05, 0.03]], ['sph', '#ffb8b0', [0.25, 0.85, -0.3], [0.08, 0.05, 0.03]]];
        const team = look.team >= 0 ? TEAMC[look.team] : null, hc = team || '#ff7a3a';
        const hat = [];
        if (cls.hat === 'helmet') hat.push(['sph', team || '#6a8a4a', [0, 1.32, 0], [0.62, 0.36, 0.62]], ['cyl', team || '#5a7a3a', [0, 1.22, 0], [0.7, 0.05, 0.7]]);
        else if (cls.hat === 'straw') hat.push(['cyl', '#f0cc5a', [0, 1.33, 0], [0.5, 0.18, 0.5]], ['cyl', '#f0cc5a', [0, 1.25, 0], [0.95, 0.03, 0.95]], ['cyl', team || '#d8483a', [0, 1.29, 0], [0.52, 0.05, 0.52]]);
        else if (cls.hat === 'beret') hat.push(['sph', team || '#d8483a', [0.05, 1.33, 0.02], [0.6, 0.18, 0.6]], ['sph', ink, [0.05, 1.43, 0.02], [0.06, 0.06, 0.06]]);
        else if (cls.hat === 'bowler') hat.push(['sph', '#3a3040', [0, 1.36, 0], [0.42, 0.3, 0.42]], ['cyl', '#3a3040', [0, 1.27, 0], [0.7, 0.03, 0.7]], ['cyl', team || '#ffd23d', [0, 1.3, 0], [0.44, 0.05, 0.44]]);
        else if (cls.hat === 'chef') hat.push(['cyl', '#ffffff', [0, 1.38, 0], [0.4, 0.3, 0.4]], ['sph', '#ffffff', [0, 1.56, 0], [0.55, 0.24, 0.55]], ['cyl', team || '#ffffff', [0, 1.26, 0], [0.42, 0.06, 0.42]]);
        else if (cls.hat === 'hard') hat.push(['sph', team || '#ffd23d', [0, 1.33, 0], [0.56, 0.34, 0.56]], ['cyl', team || '#ffd23d', [0, 1.24, -0.06], [0.68, 0.03, 0.74]]);
        else hat.push(['cyl', team || '#3a8ce0', [0, 1.2, 0], [0.74, 0.08, 0.74]], ['box', team || '#3a8ce0', [0.06, 1.18, 0.38], [0.06, 0.05, 0.16]]);
        body.add(kit.mesh(face.concat(hat), { shiny: true }));
        const hands = new THREE.Group(); hands.position.set(0, 0.66, 0); body.add(hands);
        hands.add(kit.mesh([['sph', '#ffffff', [0.12, -0.04, -0.42], [0.12, 0.12, 0.12]], ['sph', '#ffffff', [-0.08, -0.02, -0.6], [0.11, 0.11, 0.11]]], { shiny: true }));
        const gunG = new THREE.Group(); gunG.position.set(0.04, 0.02, -0.5); hands.add(gunG);
        const muzzle = new THREE.Object3D(); gunG.add(muzzle);
        let curW = '';
        const setW = k => {
          if (k === curW) return;
          curW = k;
          while (gunG.children.length > 1) gunG.remove(gunG.children[1]);
          const gp = gunParts(k, 0.8);
          const P = gp.P.slice(); if (gp.mag) P.push(['box', gp.mag[0], gp.mag[1], gp.mag[2]]);
          gunG.add(kit.mesh(P, { shiny: true }));
          muzzle.position.set(0, 0.015, gp.mz);
        };
        const ring = new THREE.Mesh(kit.G0.sph, kit.own(new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.28, depthWrite: false })));
        ring.scale.set(1.15, 1.75, 1.15); ring.position.y = 0.72; ring.visible = false; root.add(ring);
        let ph = 0;
        return {
          root, muzzle,
          anim(s) {
            setW(s.wk);
            const dt = s.dt;
            ring.visible = s.prot || s.shield;
            ring.material.color.setHex(s.shield ? 0x60c0ff : 0xffffff);
            if (!s.alive) { body.visible = false; return; }
            body.visible = true;
            const sp = Math.min(1.3, s.spd / 5.7);
            ph += dt * (7 + s.spd * 1.4);
            const bob = s.ground ? Math.abs(Math.sin(ph)) * 0.06 * sp : 0;
            body.position.y = bob;
            body.rotation.z = s.ground ? Math.sin(ph) * 0.07 * sp : 0;
            body.rotation.x = s.ground ? -0.06 * sp : 0.08;
            const sq = s.ground ? 1 : 1.04;
            body.scale.set(2 - sq, sq, 2 - sq);
            hands.rotation.x = s.pitch;
            const rec = s.fire < 0.08 ? (0.08 - s.fire) * 3 : 0, rl = s.reload < 1.2 ? Math.sin(Math.min(1, s.reload / 1.2) * Math.PI) * 0.7 : 0, ml = s.melee < 0.45 ? Math.sin(s.melee / 0.45 * Math.PI) : 0;
            gunG.rotation.x = rec + rl; gunG.position.z = -0.5 + rec * 0.12 - ml * 0.25;
          },
          dispose() {}
        };
      },
      makeView(kit, k) {
        const { THREE } = kit;
        const root = new THREE.Group();
        const gp = gunParts(k, 1);
        root.add(kit.mesh(gp.P, { noShadow: true, shiny: true }));
        let mag = null;
        if (gp.mag) { mag = kit.mesh([['box', gp.mag[0], [0, 0, 0], gp.mag[2]]], { noShadow: true, shiny: true }); mag.position.set(...gp.mag[1]); root.add(mag); }
        const glove = '#ffffff';
        root.add(kit.mesh([['sph', glove, [0.03, -0.075, 0.07], [0.11, 0.11, 0.12]], ['sph', glove, [-0.04, -0.04, -0.2], [0.1, 0.1, 0.11]], ['cyl', '#e8e8f0', [0.03, -0.09, 0.15], [0.09, 0.06, 0.09], [Math.PI / 2, 0, 0]]], { noShadow: true, shiny: true }));
        const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.015, gp.mz); root.add(muzzle);
        const VS = 0.72;
        root.scale.setScalar(VS);
        const sightY = ({ sunny: 0.085, poacher: 0.06, overeasy: 0.1, benedict: 0.105, whisk: 0.085, souffle: 0.155, triple: 0.09, peep: 0.07, spatula: 0 }[k] || 0.08) * VS;
        return {
          root, muzzle, hip: k === 'spatula' ? [0.15, -0.14, -0.32] : k === 'souffle' ? [0.15, -0.16, -0.36] : k === 'peep' ? [0.12, -0.12, -0.3] : [0.13, -0.13, -0.38], aim: k === 'spatula' ? [0.14, -0.14, -0.32] : [0, -sightY, k === 'benedict' ? -0.3 : k === 'peep' ? -0.26 : -0.32], kickZ: k === 'benedict' || k === 'poacher' ? 0.1 : 0.06, kickRot: 0.55, reloadRoll: 0.8, flashS: k === 'poacher' ? 1.4 : k === 'peep' ? 0.8 : 1, noFlash: k === 'spatula' || k === 'souffle',
          anim(s, dt, rl, me) {
            if (mag) { const d = rl >= 0 ? Math.sin(Math.min(1, rl) * Math.PI) : 0; mag.position.y = gp.mag[1][1] - d * 0.25; mag.visible = !(rl > 0.35 && rl < 0.6); }
            if (k === 'spatula') { const m = me >= 0 ? Math.sin(me * Math.PI) : 0; root.rotation.y += m * 0.9; root.rotation.x -= m * 0.5; root.position.z -= m * 0.12; root.position.x -= m * 0.12; }
            else if (me >= 0) { const m = Math.sin(me * Math.PI); root.position.y -= m * 0.2; root.rotation.x += m * 0.5; }
          }
        };
      },
      makeProj(kit, kind) {
        if (kind === 'g') return kit.mesh([['sphL', '#5a7a3a', [0, 0, 0], [0.26, 0.3, 0.26]], ['box', '#3a3a48', [0, 0.17, 0], [0.08, 0.08, 0.08]], ['box', '#ffd23d', [0.05, 0.2, 0], [0.12, 0.02, 0.03]]], { noShadow: true });
        return kit.mesh([['cyl8', '#ffd23d', [0, 0, 0], [0.16, 0.42, 0.16], [Math.PI / 2, 0, 0]], ['cone', '#f04a5a', [0, 0, -0.3], [0.16, 0.18, 0.16], [-Math.PI / 2, 0, 0]]], { noShadow: true });
      },
      makePickup(kit, k) {
        if (k === 'n') return kit.mesh([['sphL', '#5a7a3a', [0, 0, 0], [0.34, 0.4, 0.34]], ['box', '#3a3a48', [0, 0.24, 0], [0.12, 0.1, 0.12]], ['box', '#ffd23d', [0.06, 0.28, 0], [0.16, 0.03, 0.04]]], { shiny: true });
        return kit.mesh([['box', '#4a8a3a', [0, 0, 0], [0.62, 0.38, 0.4]], ['box', '#ffd23d', [0, 0.02, -0.205], [0.3, 0.12, 0.02]], ['box', '#3a5a2a', [0, 0.2, 0], [0.64, 0.04, 0.42]]], { shiny: true });
      },
      makeZone(kit) {
        const { THREE } = kit, g = new THREE.Group();
        const mat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
        const wall = new THREE.Mesh(kit.own(new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, true)), mat); wall.position.y = 1.2; g.add(wall);
        const disc = new THREE.Mesh(kit.own(new THREE.RingGeometry(0.9, 1, 40)), mat); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; g.add(disc);
        const flag = kit.mesh([['cyl', '#ffffff', [0, 1.6, 0], [0.06, 3.2, 0.06]], ['box', '#ffd23d', [0.3, 2.9, 0], [0.6, 0.4, 0.04]]]); flag.scale.set(1, 1, 1); g.add(flag);
        g.userData.mat = mat; g.userData.flag = flag;
        return g;
      },
      zoneColor(zm, own, mt, t) { const m = zm.userData.mat; const c = own === 2 ? 0xffffff : own === mt ? 0x40d0ff : own >= 0 ? 0xff6040 : 0xffd040; m.color.set(c).convertSRGBToLinear(); m.opacity = 0.2 + Math.sin(t * 3) * 0.06; const f = zm.userData.flag; f.scale.set(1 / zm.scale.x, 1, 1 / zm.scale.z); f.rotation.y = t * 0.8; },
      debrisGeo: kit => shards(kit),
      holeTex: (g, S) => { g.fillStyle = 'rgba(42,35,64,.75)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.18, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,220,120,.35)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.32, 0, TAU); g.fill(); },
      splatTex: (g, S) => { const c = S / 2; g.fillStyle = 'rgba(255,255,255,.95)'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = S * (0.28 + (i % 3) * 0.05); g.beginPath(); g.arc(c + Math.cos(a) * r * 0.7, c + Math.sin(a) * r * 0.7, S * 0.12, 0, TAU); g.fill(); } g.beginPath(); g.arc(c, c, S * 0.3, 0, TAU); g.fill(); g.fillStyle = '#ffb81a'; g.beginPath(); g.arc(c + 4, c - 2, S * 0.17, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(c - 2, c - 8, S * 0.05, 0, TAU); g.fill(); },
      impactFx(view, x, y, z, nx, ny, nz) { view.burst(x, y, z, 4, '#fff0c8', 1.6, 1, 0.35, 9, nx, ny, nz); },
      hitFx(view, x, y, z, v, zone) { view.burst(x, y, z, zone === 2 ? 10 : 6, zone === 2 ? '#ffc020' : '#fff4dc', 2.2, 1.2, 0.45, 9); if (v) view.debris(x, y, z, 2, [Gdef.colorFor(v, view.teams)], 2.2, 0.08, 1, v.y); },
      deathFx(view, v, x, y, z) {
        const c = Gdef.colorFor(v, view.teams);
        view.debris(x, y + 0.7, z, 16, [c, c, '#ffffff'], 3.2, 0.24, 2.6, y);
        view.burst(x, y + 0.8, z, 22, '#ffc020', 3, 3, 0.8, 9);
        view.burst(x, y + 0.8, z, 14, '#ffffff', 2.5, 2.5, 0.7, 9);
        view.splat(x, y + 0.02, z, 0, 1, 0, 1.6 + Math.random() * 0.4);
      },
      makeProp: null, corpseT: 0.1
    };
    Ameplay.register(arenaGame(Gdef));
  }
})();
