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
      const u = W.spawnUsed.get(s); const sc = Math.min(md, 60) + mate + W.rng() * 6 - (u != null && W.t - u < 3 ? 30 : 0);
      if (sc > bs) { bs = sc; best = s; }
    }
    return best || { x: 0, y: 1, z: 0, yaw: 0 };
  }

  function spawnPlayer(W, p, at) {
    const G = W.G;
    if (p.nextCls != null) p.cls = p.nextCls;
    giveLoadout(W, p);
    const s = at || pickSpawn(W, p);
    if (W.spawnUsed) W.spawnUsed.set(s, W.t);
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
      teamScore: [0, 0], spawnUsed: new Map(), zone: { i: 0, t: mode.zoneTime || 60, own: -1, acc: 0 }, onClaim: null, onProj: null, pickups: M.pickups.map((q, i) => ({ i, k: q.k, x: q.x, y: q.y, z: q.z, up: true, t: 0 }))
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
