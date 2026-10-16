
(() => {
  'use strict';

  const ID = 'slope-3d';
  const CFG = {
    HZ: 120,
    R: 0.5,
    G: 26,
    V0: 13, VLOG: 10, VSCALE: 190,
    DRIVE_K: 3, DRIVE_MIN: -10, DRIVE_MAX: 9,
    STEER: 14, STEER_V: 1, LAT_DAMP: 4, AIR_CTL: 0.55, AIR_DAMP: 1.5,
    BOUNCE: 0.25, BOUNCE_MIN: 5, RED_R: 0.9,
    W0: 6.2, W1: 3, DIFF: 2600, ZONE: 1200, TH: 0.8, CELL: 1.25, TUN_H: 4.8,
    AHEAD: 230, BEHIND: 26, FALL: 10, BK: 8, SCORE_DIV: 6,
    CAM_H: 4.8, CAM_B: 8, CAM_LOOK: 10, FOV: 62,
    BPM: 124
  };
  const THEMES = ['#2bff5a', '#2fe3ff', '#ff45e9', '#ffb22e', '#f2f2f2'];
  const D2R = Math.PI / 180, TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  const m3mul = (a, b) => {
    const o = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return o;
  };
  const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
  const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  const rotZ = a => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
  const mv3 = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
  const speedAt = d => CFG.V0 + CFG.VLOG * Math.log(1 + Math.max(0, d) / CFG.VSCALE) + 2.6 * Math.min(4, Math.max(0, d - CFG.DIFF) / CFG.DIFF);
  const steerA = v => CFG.STEER + CFG.STEER_V * Math.max(0, v);
  const flight = (v, ang, H) => {
    const a = ang * D2R, vx = v * Math.cos(a), vy = v * Math.sin(a);
    return vx * (vy + Math.sqrt(vy * vy + 2 * CFG.G * H)) / CFG.G;
  };
  const mulberry = s => () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function makeSim() {
    const S = { t: 0, live: [], moving: [], buckets: new Map(), spine: [], tunnels: [], secs: [], onAdd: null, onRemove: null };
    const b = S.ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, gt: 0, n: [0, 1, 0], imp: 0 };
    const cur = { x: 0, y: 0, z: 0, lo: null };
    const CN = [0, 0, 0, 0, 0], NB = [];
    let rand = Math.random, qid = 0, last = '', sp0 = 0;
    const hist = [];
    const r = (a, c) => a + rand() * (c - a);
    const sgn = () => (rand() < 0.5 ? -1 : 1);

    function pose(p, t) {
      if (p.pt === t) return;
      p.pt = t;
      const m = p.mv, s = Math.sin(m.w * t + m.ph);
      if (m.t === 1) {
        p.c[0] = m.bc[0] + m.ax[0] * m.A * s; p.c[1] = m.bc[1] + m.ax[1] * m.A * s; p.c[2] = m.bc[2] + m.ax[2] * m.A * s;
      } else if (m.t === 3) {
        const a = m.w * t + m.ph, ca = Math.cos(a), sa = Math.sin(a), Q = m.Ryx, R = p.R;
        for (let i = 0; i < 3; i++) {
          const x = Q[i * 3], z = Q[i * 3 + 2];
          R[i * 3] = x * ca - z * sa; R[i * 3 + 1] = Q[i * 3 + 1]; R[i * 3 + 2] = x * sa + z * ca;
        }
      } else {
        const a = m.A * s, ca = Math.cos(a), sa = Math.sin(a), Q = m.Ryx, R = p.R;
        for (let i = 0; i < 3; i++) {
          const x = Q[i * 3], y = Q[i * 3 + 1];
          R[i * 3] = x * ca + y * sa; R[i * 3 + 1] = -x * sa + y * ca; R[i * 3 + 2] = Q[i * 3 + 2];
        }
        p.c[0] = m.base[0] + R[1] * m.off; p.c[1] = m.base[1] + R[4] * m.off; p.c[2] = m.base[2] + R[7] * m.off;
      }
    }

    function add(k, x, y, z, R, hx, hy, hz, mv) {
      const p = { k, c: [x, y, z], R: mv && mv.t >= 2 ? R.slice() : R, h: [hx, hy, hz], mv, q: 0, pt: -1, mesh: null, zmin: 0, zmax: 0 };
      let ez = Math.abs(R[6]) * hx + Math.abs(R[7]) * hy + Math.abs(R[8]) * hz;
      if (mv) ez += mv.t === 3 ? Math.hypot(hx, hz) : mv.t === 2 ? Math.max(hx, hy) : Math.abs(mv.ax[2] * mv.A);
      p.zmin = z - ez - 0.01; p.zmax = z + ez + 0.01;
      for (let k2 = Math.floor(p.zmin / CFG.BK), k3 = Math.floor(p.zmax / CFG.BK); k2 <= k3; k2++) {
        let a = S.buckets.get(k2);
        if (!a) S.buckets.set(k2, a = []);
        a.push(p);
      }
      S.live.push(p);
      if (mv) { S.moving.push(p); pose(p, S.t); }
      if (S.onAdd) S.onAdd(p);
      return p;
    }

    function near(z) {
      qid++;
      NB.length = 0;
      for (let k = Math.floor((z - 1.6) / CFG.BK), k1 = Math.floor((z + 1.6) / CFG.BK); k <= k1; k++) {
        const a = S.buckets.get(k);
        if (a) for (let i = 0; i < a.length; i++) { const p = a[i]; if (p.q !== qid) { p.q = qid; NB.push(p); } }
      }
      return NB;
    }

    function sphereBox(p, px, py, pz, rad) {
      if (p.mv) pose(p, S.t);
      const R = p.R, c = p.c, h = p.h;
      const dx = px - c[0], dy = py - c[1], dz = pz - c[2];
      const lx = R[0] * dx + R[3] * dy + R[6] * dz, ly = R[1] * dx + R[4] * dy + R[7] * dz, lz = R[2] * dx + R[5] * dy + R[8] * dz;
      if (Math.abs(lx) > h[0] + rad || Math.abs(ly) > h[1] + rad || Math.abs(lz) > h[2] + rad) return -1;
      let ex = lx - clamp(lx, -h[0], h[0]), ey = ly - clamp(ly, -h[1], h[1]), ez = lz - clamp(lz, -h[2], h[2]);
      const d2 = ex * ex + ey * ey + ez * ez;
      if (d2 > rad * rad) return -1;
      let depth;
      if (d2 > 1e-12) {
        const d = Math.sqrt(d2);
        ex /= d; ey /= d; ez /= d; depth = rad - d;
      } else {
        const ax = h[0] - Math.abs(lx), ay = h[1] - Math.abs(ly), az = h[2] - Math.abs(lz);
        ex = ey = ez = 0;
        if (ay <= ax && ay <= az) { ey = ly < 0 ? -1 : 1; depth = rad + ay; }
        else if (ax <= az) { ex = lx < 0 ? -1 : 1; depth = rad + ax; }
        else { ez = lz < 0 ? -1 : 1; depth = rad + az; }
      }
      CN[3] = ly; CN[4] = ez;
      CN[0] = R[0] * ex + R[1] * ey + R[2] * ez;
      CN[1] = R[3] * ex + R[4] * ey + R[5] * ez;
      CN[2] = R[6] * ex + R[7] * ey + R[8] * ez;
      return depth;
    }

    function floorAt(z) {
      const sp = S.spine;
      if (!sp.length) return 0;
      if (z >= sp[0][0]) return sp[0][1];
      let lo = 0, hi = sp.length - 1;
      if (z <= sp[hi][0]) return sp[hi][1];
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (sp[m][0] >= z) lo = m; else hi = m; }
      const a = sp[lo], c = sp[hi], u = (a[0] - z) / ((a[0] - c[0]) || 1);
      return a[1] + (c[1] - a[1]) * u;
    }

    function profOf(sx, sy, parts, sg) {
      const out = [];
      for (const p of parts) {
        const hw = p.w / 2, xc = sx + p.x, yc = sy + (p.y || 0);
        if (p.twist) {
          const k = hw * Math.sin(p.twist.A * D2R) * sg;
          out.push([xc - hw, yc + k, xc, yc], [xc, yc, xc + hw, yc + k]);
        } else {
          const ro = (p.roll || 0) * D2R, c = Math.cos(ro) * hw, s = Math.sin(ro) * hw;
          out.push([xc - c, yc - s, xc + c, yc + s]);
        }
      }
      return out;
    }
    function evalP(prof, x, hi) {
      let v = null;
      for (const s of prof) if (x >= s[0] - 1e-6 && x <= s[2] + 1e-6) {
        const y = s[1] + (s[3] - s[1]) * ((x - s[0]) / ((s[2] - s[0]) || 1));
        if (v === null || (hi ? y > v : y < v)) v = y;
      }
      return v;
    }
    function dropNeeded(lo, up) {
      if (!lo) return 0;
      let m = 0;
      for (const P of [lo, up]) for (const s of P) for (const x of [s[0], s[2]]) {
        const a = evalP(lo, x, false), c = evalP(up, x, true);
        if (a !== null && c !== null && c - a > m) m = c - a;
      }
      return m;
    }

    function partTile(S0, Ryx, len, p) {
      const th = CFG.TH, roll = (p.roll || 0) * D2R;
      const bo = mv3(Ryx, p.x, p.y || 0, -len / 2), base = [S0[0] + bo[0], S0[1] + bo[1], S0[2] + bo[2]];
      const R = roll ? m3mul(Ryx, rotZ(roll)) : Ryx, o = mv3(R, 0, -th / 2, 0);
      const cx = base[0] + o[0], cy = base[1] + o[1], cz = base[2] + o[2];
      const mv = p.twist ? { t: 2, A: p.twist.A * D2R, w: TAU / p.twist.P, ph: r(0, TAU), Ryx, base, off: -th / 2 } : p.slide ? { t: 1, ax: [R[0], R[3], R[6]], A: p.slide.A, w: TAU / p.slide.P, ph: p.slide.ph, bc: [cx, cy, cz] } : null;
      return add('T', cx, cy, cz, R, p.w / 2, th / 2, len / 2, mv);
    }

    function row(o) {
      const Ryx = m3mul(rotY(-(o.yaw || 0) * D2R), rotX(-o.slope * D2R));
      const sx = cur.x + (o.shift || 0), sz = cur.z - (o.gap || 0);
      let sy = cur.y - (o.dropY || 0);
      const dn = dropNeeded(cur.lo, profOf(sx, sy, o.parts, 1));
      if (dn > 1e-4) sy -= dn + 0.06;
      const S0 = [sx, sy, sz];
      for (const p of o.parts) partTile(S0, Ryx, o.len, p);
      const e = mv3(Ryx, 0, 0, -o.len);
      if (o.tunnel) {
        const H = o.tunnel, fw = o.parts[0].w, wt = 0.6, th = CFG.TH;
        for (const sd of [-1, 1]) {
          const q = mv3(Ryx, sd * (fw / 2 + wt / 2), (H - th) / 2, -o.len / 2);
          add('T', sx + q[0], sy + q[1], sz + q[2], Ryx, wt / 2, (H + th) / 2, o.len / 2, null);
        }
        const q = mv3(Ryx, 0, H + wt / 2, -o.len / 2);
        add('T', sx + q[0], sy + q[1], sz + q[2], Ryx, fw / 2 + wt, wt / 2, o.len / 2, null);
        S.tunnels.push([sz, sz + e[2]]);
      }
      S.spine.push([sz, sy]);
      cur.x = sx + e[0]; cur.y = sy + e[1]; cur.z = sz + e[2];
      S.spine.push([cur.z - 1e-4, cur.y]);
      cur.lo = profOf(cur.x, cur.y, o.parts, -1);
      return { S: S0, Ryx, len: o.len, w: o.parts[0].w };
    }

    function red(info, x, s, sx, sy, sz, mov) {
      const R = info.Ryx, bob = mov && mov.t === 'bob';
      const q = mv3(R, x, bob ? -0.1 : sy / 2, -s);
      const cx = info.S[0] + q[0], cy = info.S[1] + q[1], cz = info.S[2] + q[2];
      let mv = null;
      if (mov && mov.t === 'spin') mv = { t: 3, Ryx: R, w: mov.w, ph: mov.ph };
      else if (mov) mv = { t: 1, ax: bob ? [R[1], R[4], R[7]] : [R[0], R[3], R[6]], A: bob ? sy / 2 + 0.12 : mov.A, w: mov.w, ph: mov.ph, bc: [cx, cy, cz] };
      return add('X', cx, cy, cz, R, sx / 2, sy / 2, sz / 2, mv);
    }

    function latReach(g, dz) {
      const vl = steerA(g.v) / CFG.LAT_DAMP, t = dz / g.v;
      return Math.max(0.4, vl * Math.max(0, t - 0.22) * 0.8);
    }

    function scatter(info, g, dens) {
      const W = info.w, len = info.len, sp = clamp(g.v * r(0.42, 0.55), 6.5, 15);
      let gc = r(-0.3, 0.3) * W;
      for (let s = r(7, 10); s < len - 3; s += sp * r(0.9, 1.2)) {
        const gw = Math.max(1.65, lerp(2.9, 1.9, g.d) - 0.12 * g.k) * r(0.95, 1.1), reach = latReach(g, sp);
        gc = clamp(gc + r(-reach, reach), -W / 2 + gw / 2, W / 2 - gw / 2);
        const cs = r(0.9, 1.25);
        let placed = 0;
        for (let x = -W / 2 + cs / 2 + r(0, 0.5); x <= W / 2 - cs / 2; x += cs + r(0.15, 1.8 - g.d)) {
          if (Math.abs(x - gc) < (gw + cs) / 2) continue;
          if (rand() < (0.35 + 0.45 * g.d + 0.1 * g.k) * dens) { red(info, x, s, cs, cs, cs); placed++; }
        }
        if (!placed) {
          const x = gc + (gc > 0 ? -1 : 1) * ((gw + cs) / 2 + 0.05);
          if (Math.abs(x) <= W / 2 - cs / 2) red(info, x, s, cs, cs, cs);
        }
      }
    }

    const flat = (w, x = 0) => [{ x, w }];
    const B = {
      straight(g) {
        const info = row({ len: r(18, 32), slope: r(9, 17), yaw: rand() < 0.35 ? r(-8, 8) : 0, parts: flat(g.W) });
        if (g.d > 0.15 && rand() < 0.5) scatter(info, g, 0.6);
      },
      blocks(g) {
        scatter(row({ len: r(42, 62) + 18 * g.d, slope: r(9, 14), parts: flat(g.W) }), g, 1);
      },
      wall(g) {
        const n = 1 + (g.d > 0.3) + (g.d > 0.65) + (g.k > 0.6) + (g.k > 1.4), sp = Math.max(12, g.v * 0.75);
        const info = row({ len: 10 + Math.max(8, g.v * 0.5) + n * sp, slope: r(8, 12), parts: flat(g.W) });
        let gc = r(-0.25, 0.25) * g.W;
        for (let i = 0; i < n; i++) {
          const s = Math.max(8, g.v * 0.5) + i * sp, gw = lerp(2.7, 1.9, g.d) * r(0.95, 1.1);
          if (i) gc += r(-1, 1) * latReach(g, sp);
          gc = clamp(gc, -g.W / 2 + gw / 2, g.W / 2 - gw / 2);
          const hg = r(1.1, 1.8), l = gc - gw / 2 + g.W / 2, rr = g.W / 2 - gc - gw / 2;
          if (l > 0.15) red(info, -g.W / 2 + l / 2, s, l, hg, 0.8);
          if (rr > 0.15) red(info, g.W / 2 - rr / 2, s, rr, hg, 0.8);
        }
      },
      movers(g) {
        const W = Math.max(3.6, g.W), n = 2 + Math.floor(g.d * 2.5 + rand() + g.k), sp = Math.max(12, g.v * 0.7);
        const info = row({ len: 14 + n * sp, slope: r(8, 12), parts: flat(W) });
        for (let i = 0; i < n; i++) {
          const cs = r(1, 1.25);
          red(info, 0, 10 + i * sp, cs, cs, cs, { t: 'slide', A: (W - cs) / 2, w: TAU / (r(2.6, 3.8) - g.d * 0.6 - g.k * 0.3), ph: r(0, TAU) });
        }
      },
      bobbers(g) {
        const W = Math.max(3.2, g.W), n = 3 + Math.floor(g.d * 4), sp = Math.max(9, g.v * 0.55);
        const info = row({ len: 14 + n * sp, slope: r(8, 12), parts: flat(W) });
        for (let i = 0; i < n; i++) {
          const cs = Math.min(r(1.2, 1.6), W - 2.1), u = r(0, Math.max(0, W - cs - 2.1));
          red(info, sgn() * (W / 2 - cs / 2 - u), 10 + i * sp, cs, cs, cs, { t: 'bob', w: TAU / r(1.7, 2.6), ph: r(0, TAU) });
        }
      },
      pillars(g) {
        const W = g.W, sp = Math.max(8, g.v * 0.5), n = 4 + Math.floor(g.d * 4);
        const info = row({ len: 12 + n * sp, slope: r(9, 13), parts: flat(W) });
        let sd = sgn();
        for (let i = 0; i < n; i++) {
          const pw = Math.max(0.6, Math.min(r(0.9, 1.3) + g.d * 0.6, W - 2.1)), lim = W / 2 - pw / 2;
          const ax = clamp(Math.max(2.05 - W / 2 + pw / 2, r(0.1, 0.6) * lim), 0, lim);
          red(info, sd * ax, 12 + i * sp, pw, r(3, 4.5), pw);
          sd = -sd;
        }
      },
      drop(g) {
        const sl = r(10, 15);
        row({ len: r(10, 16), slope: sl, parts: flat(g.W) });
        const H = r(1.2, 3.5) + g.d;
        const gap = Math.max(1.2, Math.min(r(1.5, 4 + 2 * g.d), flight(g.v * 0.9, -sl, H) * 0.6));
        row({ gap, dropY: H, shift: r(-0.15, 0.15) * g.W, len: r(16, 26), slope: r(10, 16), parts: flat(g.W) });
      },
      ramp(g) {
        row({ len: r(12, 18), slope: r(8, 12), parts: flat(g.W) });
        const ang = r(14, 22);
        row({ len: 3.4, slope: -ang, parts: flat(g.W) });
        const H = r(1, 4), X = flight(g.v * 0.78, ang, H);
        row({ gap: Math.max(2.5, X * r(0.38, 0.55)), dropY: H, len: X * 1.7 + 8, slope: r(11, 16), parts: flat(g.W * 1.08) });
      },
      bank(g) {
        const n = 2 + (rand() < 0.5 ? 1 : 0);
        let sd = sgn();
        for (let i = 0; i < n; i++) {
          row({ len: r(14, 22), slope: r(10, 14), parts: [{ x: 0, w: g.W * 1.1, roll: sd * r(10, 15 + 8 * g.d) }] });
          if (rand() < 0.7) sd = -sd;
        }
      },
      valley(g) {
        const a = Math.max(2.2, g.W * 0.6), ph = r(16, 26), c = Math.cos(ph * D2R) * a / 2, s = Math.sin(ph * D2R) * a / 2;
        row({ len: r(26, 40), slope: r(10, 14), parts: [{ x: -c, y: s, w: a, roll: -ph }, { x: c, y: s, w: a, roll: ph }] });
      },
      stagger(g) {
        const n = 3 + Math.floor(rand() * 3), w = g.W * r(0.75, 0.95);
        for (let i = 0; i < n; i++) row({ shift: i ? sgn() * w * r(0.35, 0.58) : 0, len: r(8, 13), slope: r(10, 15), parts: flat(w) });
      },
      zigzag(g) {
        const n = 2 + Math.floor(rand() * 3), w = g.W * r(0.85, 1);
        let sd = sgn();
        for (let i = 0; i < n; i++) { row({ len: r(14, 22), slope: r(10, 14), yaw: sd * r(5, 9), parts: flat(w) }); sd = -sd; }
      },
      narrow(g) {
        const wn = lerp(2.4, 1.5, g.d) * r(0.95, 1.08), n = 1 + Math.floor(rand() * 3);
        let sd = sgn();
        for (let i = 0; i < n; i++) {
          row({ shift: i ? 0 : r(-0.5, 0.5) * Math.max(0, g.W - wn) * 0.6, len: r(12, 22), slope: r(10, 13), yaw: n > 1 ? sd * r(3, 7) : 0, parts: flat(wn) });
          sd = -sd;
        }
        row({ len: r(8, 12), slope: 11, parts: flat(g.W) });
      },
      fork(g) {
        const wl = Math.max(1.7, lerp(2.6, 1.8, g.d)), gw = r(1.2, 2.4), off = (wl + gw) / 2, len = r(34, 48);
        row({ len: Math.max(12, g.v * 0.8), slope: r(9, 12), parts: flat(Math.max(g.W, 2 * off + wl)) });
        const info = row({ len, slope: r(9, 12), parts: [{ x: -off, w: wl }, { x: off, w: wl }] });
        red(info, sgn() * off, len * r(0.6, 0.85), wl, r(1.4, 2), 0.8);
        row({ len: r(10, 16), slope: 10, parts: flat(2 * off + wl) });
      },
      tunnel(g) {
        let ext = 0;
        if (cur.lo) for (const q of cur.lo) ext = Math.max(ext, Math.abs(q[0] - cur.x), Math.abs(q[2] - cur.x));
        const fw = Math.min(8, Math.max(3.4, g.W + 0.3, 2 * ext + 1.8)), len = r(36, 58);
        const info = row({ len, slope: r(12, 17), parts: flat(fw), tunnel: CFG.TUN_H });
        if (g.d > 0.12) scatter(info, g, 0.5 + g.d * 0.5);
      },
      twist(g) {
        const w = Math.max(3.2, g.W);
        row({ gap: 0.3, len: r(24, 38), slope: r(9, 12), parts: [{ x: 0, w, twist: { A: r(10, 16 + 10 * g.d), P: r(2.8, 4.4) } }] });
        row({ gap: 0.3, len: r(10, 16), slope: r(9, 12), parts: flat(w + 0.6) });
      },
      lanes(g) {
        const lw = clamp(g.W / 3 + 0.2, 1.45, 2.1), pitch = lw + 0.32, n = 4 + Math.floor(rand() * 3 + g.d * 2 + g.k);
        const len = clamp(g.v * (pitch * 1.25 / (steerA(g.v) / CFG.LAT_DAMP * 0.8) + 0.26), 7, 24);
        row({ len: r(8, 12), slope: r(9, 12), parts: flat(3 * pitch) });
        const MS = [1, 2, 4, 3, 6, 5];
        let prev = 7;
        for (let i = 0; i < n; i++) {
          let m = 0;
          for (let k = 0; k < 20 && !(m & prev && m !== prev); k++) m = MS[Math.floor(rand() * (rand() < 0.35 + 0.4 * g.d ? 3 : 6))];
          if (!(m & prev)) m = prev === 7 ? 2 : prev;
          const parts = [];
          for (let j = 0; j < 3; j++) if (m & (1 << j)) parts.push({ x: (j - 1) * pitch, w: lw });
          row({ len: len * r(1, 1.2), slope: r(9, 12), parts });
          prev = m;
        }
        row({ len: r(8, 12), slope: 10, parts: flat(3 * pitch) });
      },
      spinners(g) {
        const W = Math.max(3.8, g.W), n = 2 + Math.floor(g.d * 2 + rand() + g.k), sp = Math.max(13, g.v * 0.7);
        const info = row({ len: 14 + n * sp, slope: r(8, 11), parts: flat(W) });
        let sd = sgn();
        for (let i = 0; i < n; i++) {
          const L = W * r(0.26, 0.3 + 0.04 * g.d), c = sd * (W / 2 - L - r(0.05, 0.25));
          red(info, c, 10 + i * sp, L * 2, r(0.7, 1), 0.42, { t: 'spin', w: sgn() * TAU / Math.max(1.4, r(2.4, 3.4) - g.d * 0.6 - g.k * 0.25), ph: r(0, TAU) });
          sd = -sd;
        }
      },
      shifter(g) {
        const W = Math.max(3.6, g.W), n = 2 + Math.floor(g.d * 2 + rand() + g.k), sp = Math.max(13, g.v * 0.75);
        const info = row({ len: 14 + n * sp, slope: r(8, 11), parts: flat(W) });
        for (let i = 0; i < n; i++) {
          const gw = Math.max(1.6, lerp(2.7, 1.9, g.d) - 0.1 * g.k), A = Math.max(0.3, W / 2 - gw / 2 - 0.25), Lw = W / 2 + A - gw / 2 + 0.4;
          const mov = { t: 'slide', A, w: TAU / Math.max(2, r(3, 4.2) - g.d * 0.7 - g.k * 0.3), ph: r(0, TAU) }, h = r(1.1, 1.7);
          red(info, -gw / 2 - Lw / 2, 10 + i * sp, Lw, h, 0.7, mov);
          red(info, gw / 2 + Lw / 2, 10 + i * sp, Lw, h, 0.7, mov);
        }
      },
      islands(g) {
        const n = 3 + Math.floor(rand() * 2 + g.d + g.k * 0.5), w = Math.max(2.2, g.W * r(0.7, 0.9));
        for (let i = 0; i < n; i++) {
          const sl = r(10, 14), H = r(0.5, 1.6) + 0.4 * g.d;
          const gap = i ? clamp(r(1.2, 2 + 1.6 * g.d + 0.4 * g.k), 1, flight(g.v * 0.9, -sl, H) * 0.55) : 0;
          row({ gap, dropY: i ? H : 0, shift: i ? r(-0.22, 0.22) * w : 0, len: r(7, 12), slope: sl, parts: flat(w) });
        }
        row({ len: r(8, 12), slope: 11, parts: flat(g.W) });
      },
      sliders(g) {
        const n = 3 + Math.floor(rand() * 2 + g.d * 2 + g.k), w = Math.max(2.2, lerp(3.2, 2.4, g.d) - 0.1 * g.k);
        const A = Math.max(0.4, w / 2 - 0.5 + 0.7 * g.d + 0.2 * g.k), P = Math.max(2.2, r(3.2, 4.4) - g.d * 0.8);
        row({ len: r(8, 12), slope: 10, parts: flat(g.W) });
        let ph = r(0, TAU);
        for (let i = 0; i < n; i++) {
          row({ gap: 0.25, len: r(8, 12), slope: r(9, 12), parts: [{ x: 0, w, slide: { A, P, ph } }] });
          ph += r(0.8, 1.6) * sgn();
        }
        row({ gap: 0.25, len: r(8, 12), slope: 10, parts: flat(Math.max(g.W, w + 2 * A)) });
      },
      funnel(g) {
        const lo = Math.max(1.55, g.W * r(0.38, 0.5) - 0.1 * g.k), n = 4;
        for (let i = 0; i <= n; i++) row({ len: r(6, 10), slope: r(10, 13), parts: flat(lerp(g.W, lo, i / n)) });
        const info = row({ len: r(14, 22), slope: r(10, 12), yaw: rand() < 0.5 ? r(-6, 6) : 0, parts: flat(lo) });
        if (g.d > 0.4 && rand() < 0.5) red(info, 0, info.len * 0.6, 0.6, 0.6, 0.6, { t: 'bob', w: TAU / r(1.6, 2.2), ph: r(0, TAU) });
        for (let i = n; i >= 0; i -= 2) row({ len: r(5, 8), slope: r(10, 13), parts: flat(lerp(g.W, lo, i / n)) });
      },
      steep(g) {
        row({ len: r(10, 16), slope: r(26, 34), parts: flat(g.W) });
        row({ len: r(14, 20), slope: r(8, 11), parts: flat(g.W) });
      }
    };
    const SECT = [
      ['straight', (d, k) => Math.max(0.2, 1.1 - 0.6 * d - 0.3 * k)], ['blocks', d => 1.6 + d], ['bank', (d, k) => Math.max(0.3, 0.9 - 0.2 * k)], ['drop', () => 0.8], ['ramp', d => 1 + 0.4 * d],
      ['stagger', d => 0.7 + 0.5 * d], ['zigzag', (d, k) => Math.max(0.3, 0.7 - 0.15 * k)], ['valley', (d, k) => Math.max(0.3, 0.7 - 0.15 * k)], ['steep', () => 0.6],
      ['lanes', (d, k) => (d > 0.08 ? 0.8 + d + 0.3 * k : 0)], ['spinners', (d, k) => (d > 0.22 ? 0.6 + 0.6 * d + 0.3 * k : 0)], ['shifter', (d, k) => (d > 0.28 ? 0.6 + 0.6 * d + 0.3 * k : 0)],
      ['islands', (d, k) => (d > 0.14 ? 0.7 + 0.5 * d + 0.2 * k : 0)], ['sliders', (d, k) => (d > 0.4 ? 0.5 + 0.7 * d + 0.3 * k : 0)], ['funnel', d => (d > 0.1 ? 0.6 + 0.3 * d : 0)],
      ['wall', d => (d > 0.05 ? 0.9 + d : 0)], ['movers', d => (d > 0.12 ? 0.8 + d : 0)], ['narrow', d => (d > 0.1 ? 0.8 + d : 0)],
      ['fork', d => (d > 0.15 ? 0.8 : 0)], ['tunnel', d => (d > 0.08 ? 0.7 : 0)], ['pillars', d => (d > 0.2 ? 0.7 + 0.5 * d : 0)],
      ['twist', d => (d > 0.25 ? 0.6 + 0.6 * d : 0)], ['bobbers', d => (d > 0.3 ? 0.6 + 0.6 * d : 0)]
    ];

    function section() {
      const dist = -cur.z, d = Math.min(1, dist / CFG.DIFF), k = Math.min(2.5, Math.max(0, dist - CFG.DIFF) / CFG.DIFF);
      const g = { d, k, v: speedAt(dist) + 1, W: lerp(CFG.W0, CFG.W1, d) * (1 - 0.11 * k) * r(0.92, 1.1) };
      let tot = 0;
      const ws = SECT.map(([n, f]) => { const w = n === last ? 0 : f(d, k) * (hist.includes(n) ? 0.3 : 1); tot += w; return w; });
      let x = rand() * tot, i = 0;
      while (i < ws.length - 1 && (x -= ws[i]) > 0) i++;
      last = SECT[i][0];
      hist.push(last); if (hist.length > 4) hist.shift();
      S.secs.push([cur.z, last]);
      B[last](g);
      if (rand() < Math.max(0.12, 0.45 - 0.15 * d - 0.12 * k)) row({ len: r(6, 12) * (1 - 0.2 * Math.min(1, k)), slope: r(9, 14), parts: flat(g.W) });
    }

    S.reset = seed => {
      if (S.onRemove) for (const p of S.live) S.onRemove(p);
      S.live.length = 0; S.moving.length = 0; S.buckets.clear(); S.spine.length = 0; S.tunnels.length = 0; S.secs.length = 0;
      S.t = 0; last = ''; hist.length = 0;
      rand = mulberry(seed >>> 0);
      cur.x = 0; cur.y = 0; cur.z = 0; cur.lo = null;
      row({ len: 34, slope: 7, parts: flat(CFG.W0) });
      row({ len: 18, slope: 11, parts: flat(CFG.W0) });
      const a = 7 * D2R;
      b.x = 0; b.z = -4; b.y = -4 * Math.tan(a) + CFG.R / Math.cos(a) + 0.005;
      const v0 = CFG.V0 * 0.6;
      b.vx = 0; b.vy = -v0 * Math.sin(a); b.vz = -v0 * Math.cos(a);
      b.gt = 0.05; b.n = [0, Math.cos(a), -Math.sin(a)]; b.imp = 0;
      sp0 = b.z;
      S.ensure(b.z);
    };
    S.ensure = z => { while (cur.z > z - CFG.AHEAD) section(); };
    S.prune = z => {
      const lim = z + CFG.BEHIND;
      let j = 0;
      for (const p of S.live) { if (p.zmin > lim) { if (S.onRemove) S.onRemove(p); } else S.live[j++] = p; }
      S.live.length = j;
      j = 0;
      for (const p of S.moving) if (p.zmin <= lim) S.moving[j++] = p;
      S.moving.length = j;
      const kmax = Math.floor(lim / CFG.BK) + 1;
      for (const k of [...S.buckets.keys()]) if (k > kmax) S.buckets.delete(k);
      while (S.spine.length > 4 && S.spine[2][0] > lim + 20) S.spine.shift();
      while (S.tunnels.length && S.tunnels[0][1] > lim + 20) S.tunnels.shift();
      while (S.secs.length > 2 && S.secs[1][0] > lim + 60) S.secs.shift();
    };
    S.dist = () => sp0 - b.z;
    S.floorAt = floorAt;
    S.pose = pose;
    S.speed = () => Math.hypot(b.vx, b.vy, b.vz);
    S.inTunnel = z => { for (const t of S.tunnels) if (z <= t[0] + 13 && z >= t[1] - 5) return true; return false; };
    S.sectionAt = z => { let n = ''; for (const s of S.secs) if (s[0] >= z) n = s[1]; return n; };
    S.save = () => [b.x, b.y, b.z, b.vx, b.vy, b.vz, b.gt, b.n, b.imp, S.t];
    S.load = s => { [b.x, b.y, b.z, b.vx, b.vy, b.vz, b.gt, b.n, b.imp, S.t] = s; };

    S.step = (dt, inp) => {
      S.t += dt;
      const vt = speedAt(sp0 - b.z);
      let ax = 0, ay = -CFG.G, az = 0;
      if (b.gt > 0) {
        const nx = b.n[0], ny = b.n[1], nz = b.n[2];
        let fx = nx * nz, fy = ny * nz, fz = -1 + nz * nz;
        const fl = Math.hypot(fx, fy, fz) || 1;
        fx /= fl; fy /= fl; fz /= fl;
        let rx = fy * nz - fz * ny, ry = fz * nx - fx * nz, rz = fx * ny - fy * nx;
        const rl = Math.hypot(rx, ry, rz) || 1;
        rx /= rl; ry /= rl; rz /= rl;
        const vf = b.vx * fx + b.vy * fy + b.vz * fz, vr = b.vx * rx + b.vy * ry + b.vz * rz;
        const drive = clamp((vt - vf) * CFG.DRIVE_K, CFG.DRIVE_MIN, CFG.DRIVE_MAX);
        const st = inp * steerA(vf) - vr * CFG.LAT_DAMP;
        ax += fx * drive + rx * st; ay += fy * drive + ry * st; az += fz * drive + rz * st;
      } else {
        ax += inp * steerA(-b.vz) * CFG.AIR_CTL - b.vx * CFG.AIR_DAMP;
      }
      b.vx += ax * dt; b.vy += ay * dt; b.vz += az * dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      b.gt -= dt; b.imp = 0;
      const list = near(b.z);
      for (let it = 0; it < 4; it++) {
        let best = 0, n0 = 0, n1 = 0, n2 = 0, bp = null, ly = 0, ez = 0;
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (p.k !== 'T') continue;
          const dp = sphereBox(p, b.x, b.y, b.z, CFG.R);
          if (dp > best) { best = dp; n0 = CN[0]; n1 = CN[1]; n2 = CN[2]; ly = CN[3]; ez = CN[4]; bp = p; }
        }
        if (best <= 0) break;
        const up = bp.h[1] - ly;
        if (Math.abs(ez) > 0.6 && up > -0.05 && up < CFG.R * 1.1) {
          const R = bp.R, tx = R[1], ty = R[4], tz = R[7], lift = up + CFG.R + 0.01;
          b.x += tx * lift; b.y += ty * lift; b.z += tz * lift;
          const vt = b.vx * tx + b.vy * ty + b.vz * tz;
          if (vt < 0) { b.vx -= vt * tx; b.vy -= vt * ty; b.vz -= vt * tz; }
          b.gt = 0.05; b.n = [tx, ty, tz];
          continue;
        }
        b.x += n0 * best; b.y += n1 * best; b.z += n2 * best;
        const vn = b.vx * n0 + b.vy * n1 + b.vz * n2;
        if (vn < 0) {
          const e = vn < -CFG.BOUNCE_MIN && n1 > 0.5 ? CFG.BOUNCE : 0;
          b.vx -= (1 + e) * vn * n0; b.vy -= (1 + e) * vn * n1; b.vz -= (1 + e) * vn * n2;
          if (-vn > b.imp) b.imp = -vn;
        }
        if (n1 > 0.55) { b.gt = 0.05; b.n = [n0, n1, n2]; }
      }
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (p.k === 'X' && sphereBox(p, b.x, b.y, b.z, CFG.R * CFG.RED_R) > 0) return 1;
      }
      if (b.y < floorAt(b.z) - CFG.FALL) return 2;
      return 0;
    };
    return S;
  }

  const TILE_VS = `varying vec3 vP;varying vec3 vN;varying vec3 vS;varying float vD;varying vec3 vW;varying vec3 vNW;
void main(){vS=vec3(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz),length(modelMatrix[2].xyz));vP=position*vS;vN=normal;
vec4 wp=modelMatrix*vec4(position,1.0);vW=wp.xyz;vNW=normalize(mat3(modelMatrix)*(normal/(vS*vS)));
vec4 mv=viewMatrix*wp;vD=-mv.z;gl_Position=projectionMatrix*mv;}`;
  const TILE_FS = `uniform vec3 uLine;uniform vec3 uFill;uniform float uRed;uniform vec2 uFog;uniform float uCell;uniform float uTime;
varying vec3 vP;varying vec3 vN;varying vec3 vS;varying float vD;varying vec3 vW;varying vec3 vNW;
void main(){vec3 a=abs(vN);vec2 p;vec2 hs;float sh;float face=0.0;
if(a.y>0.5){p=vP.xz;hs=vS.xz*0.5;sh=vN.y>0.0?1.0:0.3;face=vN.y>0.0?1.0:0.0;}else if(a.x>0.5){p=vP.zy;hs=vS.zy*0.5;sh=0.62;}else{p=vP.xy;hs=vS.xy*0.5;sh=0.78;}
vec2 e2=hs-abs(p);float e=min(e2.x,e2.y);float fe=max(fwidth(e),0.004);
float border=1.0-smoothstep(0.05,0.05+fe*1.5,e);float glow=exp(-e*5.0);
float inner=(1.0-smoothstep(0.0,fe*1.6+0.012,abs(e-0.22)))*0.5;
float corner=exp(-(e2.x+e2.y)*7.0);
vec3 V=normalize(cameraPosition-vW);float ndv=max(dot(normalize(vNW),V),0.0);float fre=pow(1.0-ndv,3.0);
float rz=vW.z*0.045+uTime*0.7;float pulse=pow(max(0.0,sin(rz*6.2831853)),10.0);
vec3 col;
if(uRed>0.5){
float hz=fract((p.x+p.y)*1.4);float st=smoothstep(0.46,0.5,hz)-smoothstep(0.96,1.0,hz);
float beat=0.88+0.12*sin(uTime*7.0+vW.z*0.08);
vec3 base=uFill*sh*(0.7+0.3*glow)*beat;
col=mix(base,base*0.28+vec3(0.12,0.0,0.02),st*0.75);
col+=vec3(1.0,0.35,0.3)*fre*0.55*sh+uLine*(border*1.1+inner*0.45+corner*0.5);
col+=vec3(1.0,0.2,0.18)*glow*0.16;
}else{
float up=face;vec3 fillc=uFill*sh;
float g1=0.0;float g2=0.0;
if(min(hs.x,hs.y)>0.7){vec2 g=p/uCell+0.5;vec2 fw=max(fwidth(g),vec2(1e-4));vec2 d=abs(fract(g)-0.5)/fw;
float fade=1.0-smoothstep(0.12,0.45,max(fw.x,fw.y));g1=(1.0-clamp(min(d.x,d.y)-0.6,0.0,1.0))*fade;
vec2 g4=p/(uCell*4.0)+0.5;vec2 f4=max(fwidth(g4),vec2(1e-4));vec2 d4=abs(fract(g4)-0.5)/f4;g2=(1.0-clamp(min(d4.x,d4.y)-1.2,0.0,1.0))*(1.0-smoothstep(0.08,0.3,max(f4.x,f4.y)));
if(up>0.5){vec2 q=p/uCell;g1*=0.8+0.2*sin(q.x*2.0+q.y*3.0);}}
float sheen=0.5+0.5*(hs.x>hs.y?p.y/max(hs.y,0.001):p.x/max(hs.x,0.001));
if(up>0.5){
fillc*=0.8+0.5*smoothstep(0.0,1.0,e/min(hs.x,hs.y))*0.6+0.12*pulse;
col=fillc+uLine*(border*1.15+glow*0.28*sh+inner*0.35+g1*0.42*sh+g2*0.5+corner*0.55+pulse*(0.05+0.12*g1));
col+=mix(uLine,vec3(1.0),0.5)*fre*fre*0.55;
col+=uLine*pow(1.0-ndv,6.0)*0.7;
}else{
float wy=hs.y>0.0?clamp(p.y/min(hs.y,2.0)*0.5+0.5,0.0,1.0):0.5;
float wall=0.55+0.6*smoothstep(0.35,1.0,wy);
float strip=1.0-smoothstep(0.0,fe*1.6+0.01,abs(e2.y-0.2));
float pan=1.0-smoothstep(0.0,0.05,abs(fract(p.x/uCell*0.5+0.5)-0.5)*2.0-0.93);
col=fillc*wall+uLine*(border*0.95+glow*0.2*sh+strip*0.5*sh+pan*0.08+corner*0.3);
col+=uLine*fre*0.25;
}
}
float f=smoothstep(uFog.x,uFog.y,vD);gl_FragColor=vec4(mix(col,uLine*0.045,f),1.0);}`;
  const BALL_VS = `varying vec3 vN;varying vec2 vUv;varying vec3 vV;
void main(){vN=normalize(normalMatrix*normal);vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
  const BALL_FS = `uniform vec3 uCol;uniform float uTime;varying vec3 vN;varying vec2 vUv;varying vec3 vV;
void main(){vec3 n=normalize(vN);vec3 v=normalize(vV);vec3 L=normalize(vec3(-0.35,0.85,0.45));
float dl=dot(n,L);float wrap=dl*0.5+0.5;float ndv=max(dot(n,v),0.0);float fre=pow(1.0-ndv,3.0);
vec3 r=reflect(-v,n);
vec3 hot=mix(uCol,vec3(1.0),0.55);
vec3 col=uCol*(0.22+0.62*wrap*wrap);
col+=uCol*exp(-abs(r.y+0.1)*7.0)*0.55;
col+=hot*pow(max(r.y,0.0),2.0)*0.28;
col+=vec3(1.0)*pow(max(dot(r,L),0.0),70.0)*1.3;
col+=hot*pow(max(dot(r,normalize(vec3(0.7,0.25,0.65))),0.0),24.0)*0.28;
col+=vec3(1.0)*pow(max(dot(r,normalize(vec3(-0.15,0.95,0.2))),0.0),160.0)*0.5;
vec2 g=vec2(vUv.x*10.0,vUv.y*6.0);vec2 fw=max(fwidth(g),vec2(1e-4));
vec2 d=abs(fract(g)-0.5)/fw;float dm=min(d.x,d.y);float ok=1.0-smoothstep(0.25,0.7,max(fw.x,fw.y));
float line=(1.0-clamp(dm-0.7,0.0,1.0))*ok;float halo=exp(-dm*0.45)*ok;
col=mix(col,col*0.4,line*0.55);
col+=uCol*halo*0.22+hot*line*0.45+uCol*line*0.35;
col+=hot*fre*(0.45+0.45*max(n.y,0.0))*0.85;
col+=vec3(1.0)*pow(1.0-ndv,6.0)*0.35;
col*=0.95+0.07*sin(uTime*5.0);
gl_FragColor=vec4(col,1.0);}`;
  const TRAIL_VS = `attribute float aA;uniform float uPx;varying float vA;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=uPx*(0.25+0.75*aA)/max(-mv.z,0.1);vA=aA;gl_Position=projectionMatrix*mv;}`;
  const TRAIL_FS = `uniform vec3 uCol;varying float vA;
void main(){vec2 c=gl_PointCoord-0.5;float d=length(c)*2.0;float s=1.0-smoothstep(0.0,1.0,d);
gl_FragColor=vec4(mix(uCol,vec3(1.0),0.1*vA)*(0.45+0.6*vA),s*s*vA*vA*0.7);}`;
  const SKY_VS = `varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const SKY_FS = `uniform vec3 uLine;uniform float uTime;varying vec3 vDir;
float hs(float x){return fract(sin(x*127.1+311.7)*43758.5453);}
void main(){vec3 d=normalize(vDir);float hz=exp(-abs(d.y+0.12)*7.5);float up=max(d.y,0.0);
vec3 col=uLine*hz*0.17+vec3(0.0,0.004,0.006)+uLine*0.02*(1.0-up);
col+=uLine*0.035*exp(-abs(d.y-0.35)*3.0)*(0.5+0.5*sin(atan(d.x,-d.z)*3.0+uTime*0.15));
vec3 sd=normalize(vec3(0.0,0.03,-1.0));float ca=dot(d,sd);float R=0.15;
float ang=acos(clamp(ca,-1.0,1.0));
float disc=1.0-smoothstep(R-0.004,R,ang);
float tt=clamp((0.03-d.y)/0.2,0.0,1.0);float stripe=d.y>0.03?1.0:step(tt*0.7,fract((0.03-d.y)*30.0));
vec3 sunc=mix(mix(uLine,vec3(1.0),0.55),uLine*0.55,clamp((0.03-d.y)/0.22+0.35,0.0,1.0));
col=col+sunc*disc*stripe*0.62+uLine*exp(-ang*8.0)*0.2;
float az=atan(d.x,-d.z)/6.2831853+0.5;
float edge=0.0;
for(int L=0;L<2;L++){
float cells=L==0?120.0:52.0;float sd2=L==0?3.0:11.0;float mh=L==0?0.1:0.2;float bh=L==0?0.04:0.05;
float c=az*cells;float id=floor(c);float fx=fract(c);float h=hs(id+sd2);
float fwd=smoothstep(0.0,0.2,abs(az-0.5));
float top=-0.14+(bh+mh*h*h)*(0.35+0.65*fwd);
float gate=step(0.05,fx)*step(fx,0.95);
float inside=gate*step(d.y,top)*step(-0.2,d.y);
vec3 body=L==0?col*0.3+uLine*0.012:vec3(0.0,0.003,0.005)+uLine*0.01;
float wx=fx*5.0;float wy=(d.y+0.14)*(L==0?150.0:90.0);
float lit=step(0.8,hs(floor(wx)+id*7.0+floor(wy)*13.0+sd2))*step(fract(wx),0.55)*step(fract(wy),0.5)*step(0.0,wy);
body+=uLine*lit*(L==0?0.12:0.4)*(0.7+0.3*sin(uTime*2.0+id));
float rim=smoothstep(top-0.004,top,d.y)*gate*step(d.y,top);
col=mix(col,body,inside);
col+=uLine*rim*(L==0?0.15:0.55);
}
gl_FragColor=vec4(col,1.0);}`;
  const GRID_VS = `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
  const GRID_FS = `uniform vec3 uLine;uniform vec3 uCam;varying vec3 vW;
void main(){vec2 g=vW.xz/30.0;vec2 fw=max(fwidth(g),vec2(1e-4));vec2 d=abs(fract(g)-0.5)/fw;
float l=1.0-clamp(min(d.x,d.y)-0.8,0.0,1.0);float dist=length(vW.xz-uCam.xz);
float fade=exp(-dist/520.0)*(1.0-smoothstep(0.25,0.9,max(fw.x,fw.y)));gl_FragColor=vec4(uLine*l*fade*0.26,1.0);}`;

  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 50 L22 30 H42 L60 50 Z"/><path d="M13 40 H51 M18 35 H46 M32 30 V50 M24 30 L18 50 M40 30 L46 50"/><circle cx="32" cy="20" r="7"/><path d="M48 12 h8 M50 18 h6"/></svg>';

  const CSS = `.gm-slope-3d [hidden]{display:none!important}
.gm-slope-3d .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#000;box-shadow:0 22px 44px -30px rgba(31,29,43,.7);--neon:#2bff5a}
.gm-slope-3d .stage .g-canvas{border-radius:0;background:#000}
.gm-slope-3d .hud{position:absolute;left:3.2%;top:3.4%;pointer-events:none;color:#fff;font-family:var(--sans);line-height:1;display:flex;flex-direction:column;gap:.35em;font-size:clamp(11px,1.9cqw,18px)}
.gm-slope-3d .zt{position:absolute;left:0;right:0;top:20%;text-align:center;pointer-events:none;color:#fff;font:900 clamp(22px,6cqw,58px)/1 var(--sans);font-style:italic;letter-spacing:.14em;text-transform:uppercase;text-shadow:0 0 .25em var(--neon),0 0 .6em var(--neon);opacity:0}
.gm-slope-3d .zt.on{animation:slz 2.2s ease-out forwards}
@keyframes slz{0%{opacity:0;transform:scale(1.5)}12%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0;transform:scale(.96)}}
.gm-slope-3d .sc{font-size:2.9em;font-weight:900;letter-spacing:.01em;font-variant-numeric:tabular-nums;text-shadow:0 0 .3em var(--neon),0 .05em 0 rgba(0,0,0,.6)}
.gm-slope-3d .sp{font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--neon);opacity:.9;font-variant-numeric:tabular-nums}
.gm-slope-3d .pz{position:absolute;right:2.6%;top:3%;width:44px;height:44px;border-radius:50%;border:2px solid var(--neon);background:rgba(0,0,0,.45);cursor:pointer;display:grid;place-items:center;padding:0}
.gm-slope-3d .pz::before{content:"";width:12px;height:14px;border-left:4px solid var(--neon);border-right:4px solid var(--neon);box-sizing:border-box}
.gm-slope-3d .tz{position:absolute;bottom:4%;width:56px;height:56px;border-radius:50%;border:2px solid var(--neon);opacity:.28;pointer-events:none;display:grid;place-items:center}
.gm-slope-3d .tz::before{content:"";width:16px;height:16px;border-left:4px solid var(--neon);border-bottom:4px solid var(--neon);box-sizing:border-box}
.gm-slope-3d .tz.l{left:5%}.gm-slope-3d .tz.l::before{transform:translateX(3px) rotate(45deg)}
.gm-slope-3d .tz.r{right:5%}.gm-slope-3d .tz.r::before{transform:translateX(-3px) rotate(-135deg)}
.gm-slope-3d .tz.on{opacity:.75;box-shadow:0 0 18px -2px var(--neon)}
.gm-slope-3d .panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9em;text-align:center;color:#fff;font-family:var(--sans);font-size:clamp(12px,2cqw,19px);background:radial-gradient(ellipse at center,rgba(0,0,0,.25),rgba(0,0,0,.72));padding:4%}
.gm-slope-3d .logo{font-size:clamp(46px,14cqw,136px);font-weight:900;font-style:italic;letter-spacing:.08em;line-height:.95;color:#f2fff5;text-shadow:0 0 .08em var(--neon),0 0 .35em var(--neon),0 .06em 0 rgba(0,0,0,.5)}
.gm-slope-3d .t1{font-size:3.1em;font-weight:900;letter-spacing:.06em;text-transform:uppercase;line-height:1;text-shadow:0 0 .3em var(--neon)}
.gm-slope-3d .btn{pointer-events:auto;min-width:9.5em;height:2.7em;padding:0 1.6em;border-radius:.4em;border:2px solid var(--neon);background:rgba(0,0,0,.55);color:#fff;font:900 1.05em/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 .9em -.15em var(--neon),inset 0 0 .7em -.25em var(--neon);transition:background .15s,color .15s}
.gm-slope-3d .btn:hover,.gm-slope-3d .btn.go{background:var(--neon);color:#000}
.gm-slope-3d .btn.sm{min-width:0;height:2.3em;font-size:.82em;padding:0 1.1em}
.gm-slope-3d .row2{display:flex;gap:.7em;flex-wrap:wrap;justify-content:center;align-items:center}
.gm-slope-3d .muted{color:rgba(255,255,255,.62);font-weight:700;font-size:.85em;letter-spacing:.04em}
.gm-slope-3d .best{color:var(--neon);font-weight:900;letter-spacing:.14em;text-transform:uppercase;font-size:.9em}
.gm-slope-3d .sw{display:flex;gap:.55em}
.gm-slope-3d .sw i{display:block;width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid rgba(255,255,255,.18);box-sizing:border-box;pointer-events:auto}
.gm-slope-3d .sw i.on{border-color:#fff;box-shadow:0 0 12px currentColor}
.gm-slope-3d .stats{display:flex;gap:2.4em}
.gm-slope-3d .stats span{display:block;font-size:.75em;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.gm-slope-3d .stats b{display:block;font-size:2.4em;font-weight:900;font-variant-numeric:tabular-nums;color:var(--neon);text-shadow:0 0 .3em var(--neon)}
.gm-slope-3d .nb{color:#000;background:var(--neon);padding:.3em .8em;border-radius:.3em;font-weight:900;letter-spacing:.16em;text-transform:uppercase;font-size:.8em}
@media (max-width:560px){.gm-slope-3d .panel{gap:.8em}.gm-slope-3d .sw i{width:34px;height:34px}}`;

  Ameplay.register({
    id: ID,
    title: 'Slope',
    category: '3D',
    tint: '#22d65a',
    better: 'high',
    width: 960,
    blurb: 'Roll a neon ball down an endless slope. Dodge red, never fall off.',
    help: '<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> to steer · <kbd>P</kbd> pause · touch: hold the left / right side',
    icon: ICON,
    css: CSS,
    _sim: makeSim,
    _cfg: CFG,
    async mount(root, api) {
      const keys = api.keys;
      const small = root.clientWidth > 0 && root.clientWidth < 560;
      const v = await api.gl(small ? 600 : 960, small ? 820 : 600);
      if (!v) return;
      const { THREE, renderer, w, h } = v;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputEncoding = THREE.LinearEncoding;
      renderer.shadowMap.enabled = false;
      renderer.setClearColor(0x000000, 1);

      const saved = api.load() || {};
      const setg = { col: clamp(saved.col | 0, 0, THEMES.length - 1), music: saved.music !== false };
      const persist = () => api.save({ col: setg.col, music: setg.music });

      const wrap = document.createElement('div');
      wrap.className = 'stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(wrap);
      wrap.append(v.canvas);
      wrap.insertAdjacentHTML('beforeend', `
<div class="hud" hidden><b class="sc">0</b><span class="sp">Speed 0</span></div>
<div class="zt" hidden></div>
<button class="pz" aria-label="Pause" hidden></button>
<div class="tz l" hidden></div><div class="tz r" hidden></div>
<div class="panel menu">
  <div class="logo">SLOPE</div>
  <button class="btn go">Play</button>
  <div class="best"></div>
  <div class="row2"><div class="sw">${THEMES.map((c, i) => `<i data-c="${i}" style="background:${c};color:${c}"></i>`).join('')}</div><button class="btn sm mus"></button></div>
  <div class="muted">Steer with &larr; &rarr; or A D &middot; hold the left / right side on touch</div>
  <div class="muted">Press any key to roll</div>
</div>
<div class="panel over" hidden>
  <div class="t1">Game Over</div>
  <div class="nb" hidden>New best</div>
  <div class="stats"><div><span>Score</span><b class="os">0</b></div><div><span>Best</span><b class="ob">0</b></div></div>
  <div class="row2"><button class="btn rs">Restart</button><button class="btn sm mn">Menu</button></div>
  <div class="muted">Press any key or tap to restart</div>
</div>
<div class="panel pause" hidden>
  <div class="t1">Paused</div>
  <button class="btn rsm">Resume</button>
  <div class="muted">Press any key or tap to continue</div>
</div>`);
      const $ = s => wrap.querySelector(s);
      const elZt = $('.zt'), elHud = $('.hud'), elSc = $('.sc'), elSp = $('.sp'), elPz = $('.pz'), elTL = $('.tz.l'), elTR = $('.tz.r');
      const pMenu = $('.menu'), pOver = $('.over'), pPause = $('.pause'), elBest = $('.best'), elMus = $('.mus');
      let touchUI = matchMedia('(pointer: coarse)').matches;

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(small ? 70 : CFG.FOV, w / h, 0.15, 1500);
      const neon = new THREE.Color(THEMES[setg.col]);
      const fill = new THREE.Color();
      const uFog = { value: new THREE.Vector2(70, 170) };
      const uTime = { value: 0 };
      const tileMat = new THREE.ShaderMaterial({
        uniforms: { uLine: { value: neon }, uFill: { value: fill }, uRed: { value: 0 }, uFog, uCell: { value: CFG.CELL }, uTime },
        vertexShader: TILE_VS, fragmentShader: TILE_FS, extensions: { derivatives: true }
      });
      const redMat = new THREE.ShaderMaterial({
        uniforms: { uLine: { value: new THREE.Color(1, 0.5, 0.45) }, uFill: { value: new THREE.Color(0.86, 0.05, 0.06) }, uRed: { value: 1 }, uFog, uCell: { value: CFG.CELL }, uTime },
        vertexShader: TILE_VS, fragmentShader: TILE_FS, extensions: { derivatives: true }
      });
      const skyMat = new THREE.ShaderMaterial({ uniforms: { uLine: { value: neon }, uTime }, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthTest: false, depthWrite: false });
      const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), skyMat);
      sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
      const gridMat = new THREE.ShaderMaterial({ uniforms: { uLine: { value: neon }, uCam: { value: new THREE.Vector3() } }, vertexShader: GRID_VS, fragmentShader: GRID_FS, extensions: { derivatives: true }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const grid = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), gridMat);
      grid.rotation.x = -Math.PI / 2; grid.frustumCulled = false; scene.add(grid);
      const starGeo = new THREE.BufferGeometry();
      {
        const P = new Float32Array(260 * 3);
        for (let i = 0; i < 260; i++) {
          const u = Math.random() * TAU, y = Math.random() * 0.9 + 0.02, rr = Math.sqrt(1 - y * y);
          P[i * 3] = Math.cos(u) * rr * 280; P[i * 3 + 1] = y * 280; P[i * 3 + 2] = Math.sin(u) * rr * 280;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(P, 3));
      }
      const starMat = new THREE.PointsMaterial({ color: 0x9fb4c8, size: 1.6, sizeAttenuation: false, depthTest: false, depthWrite: false });
      const stars = new THREE.Points(starGeo, starMat);
      stars.renderOrder = -9; stars.frustumCulled = false; scene.add(stars);

      const ballMat = new THREE.ShaderMaterial({ uniforms: { uCol: { value: neon }, uTime }, vertexShader: BALL_VS, fragmentShader: BALL_FS, extensions: { derivatives: true } });
      const ballGeo = new THREE.SphereGeometry(CFG.R, 36, 24);
      const ball = new THREE.Mesh(ballGeo, ballMat);
      scene.add(ball);
      const glowTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,.55)'); gr.addColorStop(0.45, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();
      const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: neon, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true, opacity: 0.7 });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.setScalar(3.4); glow.renderOrder = 20; scene.add(glow);
      const flashMat = glowMat.clone();
      flashMat.opacity = 0;
      const flash = new THREE.Sprite(flashMat);
      flash.renderOrder = 21; flash.visible = false; scene.add(flash);
      const NTR = 26;
      const trP = new Float32Array(NTR * 3), trA = new Float32Array(NTR);
      for (let i = 0; i < NTR; i++) trA[i] = Math.pow(1 - i / NTR, 1.4);
      const trGeo = new THREE.BufferGeometry();
      trGeo.setAttribute('position', new THREE.BufferAttribute(trP, 3));
      trGeo.setAttribute('aA', new THREE.BufferAttribute(trA, 1));
      const trMat = new THREE.ShaderMaterial({ uniforms: { uCol: { value: neon }, uPx: { value: 100 } }, vertexShader: TRAIL_VS, fragmentShader: TRAIL_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const trail = new THREE.Points(trGeo, trMat);
      trail.frustumCulled = false; trail.renderOrder = 5; scene.add(trail);
      let trAcc = 0, trPrim = false;
      const poolMat = new THREE.MeshBasicMaterial({ map: glowTex, color: neon, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), poolMat);
      pool.renderOrder = 4; pool.frustumCulled = false; pool.visible = false; scene.add(pool);
      const poolN = new THREE.Vector3(0, 1, 0), poolQ = new THREE.Quaternion(), zV = new THREE.Vector3(0, 0, 1);

      const NSH = 44;
      const shardGeo = new THREE.TetrahedronGeometry(0.2);
      const shardMat = new THREE.MeshBasicMaterial({ color: neon });
      const shards = new THREE.InstancedMesh(shardGeo, shardMat, NSH);
      shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      shards.frustumCulled = false; shards.visible = false; scene.add(shards);
      const shP = new Float32Array(NSH * 3), shV = new Float32Array(NSH * 3), shR = new Float32Array(NSH * 3), shS = new Float32Array(NSH);
      const dummy = new THREE.Object3D();

      const unitBox = new THREE.BoxGeometry(1, 1, 1);
      const poolT = [], poolX = [];
      const setMat = (m, p) => {
        const R = p.R, c = p.c, sx = p.h[0] * 2, sy = p.h[1] * 2, sz = p.h[2] * 2;
        m.matrix.set(R[0] * sx, R[1] * sy, R[2] * sz, c[0], R[3] * sx, R[4] * sy, R[5] * sz, c[1], R[6] * sx, R[7] * sy, R[8] * sz, c[2], 0, 0, 0, 1);
        m.matrixWorldNeedsUpdate = true;
      };
      const sim = makeSim();
      sim.onAdd = p => {
        const pool = p.k === 'T' ? poolT : poolX;
        let m = pool.pop();
        if (!m) { m = new THREE.Mesh(unitBox, p.k === 'T' ? tileMat : redMat); m.matrixAutoUpdate = false; scene.add(m); }
        m.visible = true; p.mesh = m; setMat(m, p);
      };
      sim.onRemove = p => {
        const m = p.mesh;
        if (!m) return;
        m.visible = false; (p.k === 'T' ? poolT : poolX).push(m); p.mesh = null;
      };
      const B = sim.ball;

      const ZCOL = THEMES.concat(['#b46cff', '#fff04a', '#3d8bff', '#7dffd0']), zTarget = new THREE.Color(), FILLB = new THREE.Color(0.01, 0.014, 0.018);
      let zone = 0, zoneT = 0;
      function tint() {
        glowMat.color.copy(neon); flashMat.color.copy(neon); shardMat.color.copy(neon); poolMat.color.copy(neon);
        fill.copy(neon).multiplyScalar(0.075).add(FILLB);
        wrap.style.setProperty('--neon', '#' + neon.getHexString());
      }
      function setZone(z, snap) {
        zone = z;
        zTarget.set(ZCOL[(setg.col + (z ? 1 + (z - 1) % (ZCOL.length - 1) : 0)) % ZCOL.length]);
        if (snap) { neon.copy(zTarget); tint(); }
        else {
          zoneT = 2.2;
          elZt.textContent = 'Level ' + (z + 1);
          elZt.hidden = false; elZt.classList.remove('on'); void elZt.offsetWidth; elZt.classList.add('on');
        }
      }
      function applyTheme() {
        neon.set(THEMES[setg.col]);
        tint();
        if (zone) setZone(zone, true);
        wrap.querySelectorAll('.sw i').forEach((el, i) => el.classList.toggle('on', i === setg.col));
        elMus.textContent = 'Music ' + (setg.music ? 'On' : 'Off');
      }

      let ac = null, master = null, sfxG = null, musG = null, musLP = null, arpLP = null, noiseBuf = null, rollN = null;
      let musOn = false, musI = 0, musNext = 0, landAt = 0;
      function ensureAudio() {
        if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { ac = new AC(); } catch (e) { ac = null; return; }
        master = ac.createGain(); master.gain.value = api.muted ? 0 : 0.75; master.connect(ac.destination);
        sfxG = ac.createGain(); sfxG.connect(master);
        musG = ac.createGain(); musG.gain.value = 0.55; musG.connect(master);
        musLP = ac.createBiquadFilter(); musLP.type = 'lowpass'; musLP.frequency.value = 520; musLP.connect(musG);
        arpLP = ac.createBiquadFilter(); arpLP.type = 'lowpass'; arpLP.frequency.value = 2600; arpLP.connect(musG);
        noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const n = ac.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
        const nf = ac.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 300;
        const ng = ac.createGain(); ng.gain.value = 0;
        n.connect(nf); nf.connect(ng); ng.connect(sfxG); n.start();
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 45;
        const of = ac.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 200;
        const og = ac.createGain(); og.gain.value = 0;
        o.connect(of); of.connect(og); og.connect(sfxG); o.start();
        rollN = { n, nf, ng, o, of, og };
      }
      function tone(type, f0, f1, dur, vol, dest, t0) {
        if (!ac || api.muted) return;
        const t = t0 || ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + dur + 0.03);
      }
      function noise(dur, vol, type, freq, dest, t0) {
        if (!ac || api.muted) return;
        const t = t0 || ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(dest || sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
      }
      const NOTE = m => 440 * Math.pow(2, (m - 69) / 12);
      const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
      const ARP = [0, 1, 2, 1, 0, 2, 1, 2];
      function musicStep(i, t) {
        const s = i % 16, ch = CH[Math.floor(i / 16) % 4], bar = Math.floor(i / 64);
        if (s % 4 === 0) tone('sine', 150, 42, 0.24, 0.5, musG, t);
        if (s % 4 === 2) noise(0.05, 0.09, 'highpass', 7000, musG, t);
        if (s === 4 || s === 12) noise(0.12, 0.08, 'bandpass', 1800, musG, t);
        if (s % 2 === 0) tone('sawtooth', NOTE(ch[0] - 24 + (s === 14 ? 12 : 0)), NOTE(ch[0] - 24 + (s === 14 ? 12 : 0)), 0.2, 0.2, musLP, t);
        if (bar % 2 === 1 || i >= 128) tone('square', NOTE(ch[ARP[s % 8]] + 12), NOTE(ch[ARP[s % 8]] + 12), 0.11, 0.035, arpLP, t);
      }
      function audioFrame(grounded, spd) {
        if (!ac) return;
        const now = ac.currentTime;
        master.gain.setTargetAtTime(api.muted ? 0 : 0.75, now, 0.03);
        const on = state === 'play' && grounded ? 1 : 0;
        rollN.o.frequency.setTargetAtTime(38 + spd * 2.3, now, 0.05);
        rollN.of.frequency.setTargetAtTime(160 + spd * 9, now, 0.05);
        rollN.og.gain.setTargetAtTime(on * (0.05 + spd * 0.0009), now, 0.04);
        rollN.nf.frequency.setTargetAtTime(220 + spd * 16, now, 0.05);
        rollN.ng.gain.setTargetAtTime(on * (0.035 + spd * 0.0011), now, 0.04);
        if (musOn && setg.music && !api.muted) {
          const stp = 60 / CFG.BPM / 4;
          if (musNext < now - 0.1) musNext = now + 0.03;
          while (musNext < now + 0.15) { musicStep(musI++, musNext); musNext += stp; }
        }
      }
      function startMusic() { if (!ac) return; musOn = true; musI = 0; musNext = ac.currentTime + 0.06; }
      function sfxCrunch() {
        if (!ac || api.muted) return;
        const t = ac.currentTime;
        noise(0.5, 0.55, 'bandpass', 1500, sfxG, t);
        noise(0.7, 0.7, 'lowpass', 260, sfxG, t);
        tone('square', 190, 32, 0.38, 0.16, sfxG, t);
        for (let i = 0; i < 7; i++) { const f = 2200 + Math.random() * 3200; tone('sine', f, f * 0.92, 0.09 + Math.random() * 0.12, 0.05, sfxG, t + 0.02 + i * 0.035); }
      }
      function sfxFall() { tone('sine', 640, 55, 1.25, 0.16); tone('triangle', 320, 30, 1.25, 0.08); }
      function sfxLand(imp) {
        if (!ac || ac.currentTime - landAt < 0.12) return;
        landAt = ac.currentTime;
        tone('sine', 150, 44, 0.15, Math.min(0.4, imp * 0.03));
        noise(0.08, Math.min(0.2, imp * 0.012), 'lowpass', 600);
      }

      let state = 'menu', acc = 0, deadT = 0, deathKind = 0, score = 0, overAt = 0, fresh = false, shake = 0, lastSp = -1, pruneTick = 0;
      let px = 0, py = 0, pz = 0, camX = 0, camY = 0, lookX = 0, lookY = 0, camRoll = 0, lowT = 0, fov = cam.fov, menuT = 0;
      const ptrs = new Map();
      const fallCam = new THREE.Vector3(), lookV = new THREE.Vector3(), qTmp = new THREE.Quaternion(), axTmp = new THREE.Vector3();

      function snapCam() {
        camX = lookX = B.x; camY = B.y + CFG.CAM_H; lookY = B.y; lowT = 0; camRoll = 0;
        px = B.x; py = B.y; pz = B.z;
      }
      function newCourse() {
        sim.reset((Math.random() * 4294967296) >>> 0);
        snapCam();
        if (zone) { zone = 0; neon.set(THEMES[setg.col]); tint(); }
        elZt.hidden = true;
        ball.visible = true; glow.visible = true; shards.visible = false; flash.visible = false;
        ball.quaternion.identity();
      }
      function show(p) { for (const el of [pMenu, pOver, pPause]) el.hidden = el !== p; }
      function toMenu() {
        state = 'menu'; musOn = false;
        newCourse(); fresh = true;
        const bst = api.best;
        elBest.textContent = bst ? 'Best ' + bst : '';
        show(pMenu);
        elHud.hidden = true; elPz.hidden = true; elTL.hidden = elTR.hidden = true;
        api.score(0);
      }
      function startRun() {
        ensureAudio();
        if (!fresh) newCourse();
        fresh = false;
        state = 'play'; acc = 0; score = 0; lastSp = -1; ptrs.clear();
        api.score(0); elSc.textContent = '0';
        show(null);
        elHud.hidden = false; elPz.hidden = false;
        elTL.hidden = elTR.hidden = !touchUI;
        if (setg.music) startMusic();
      }
      function pause() {
        if (state !== 'play') return;
        state = 'pause'; ptrs.clear(); musOn = false;
        show(pPause);
      }
      function resume() {
        if (state !== 'pause') return;
        state = 'play'; acc = 0;
        show(null);
        if (setg.music) startMusic();
      }
      function shatter() {
        for (let i = 0; i < NSH; i++) {
          const u = Math.random() * TAU, e = Math.random() * 2 - 1, rr = Math.sqrt(1 - e * e), sp = 4 + Math.random() * 7;
          const dx = Math.cos(u) * rr, dy = Math.abs(e), dz = Math.sin(u) * rr;
          shP[i * 3] = B.x + dx * 0.4; shP[i * 3 + 1] = B.y + dy * 0.4; shP[i * 3 + 2] = B.z + dz * 0.4;
          shV[i * 3] = B.vx * 0.3 + dx * sp; shV[i * 3 + 1] = B.vy * 0.2 + dy * sp + 3; shV[i * 3 + 2] = B.vz * 0.35 + dz * sp;
          shR[i * 3] = Math.random() * TAU; shR[i * 3 + 1] = Math.random() * TAU; shR[i * 3 + 2] = (Math.random() - 0.5) * 20;
          shS[i] = 0.5 + Math.random() * 1.1;
        }
        shards.visible = true;
        flash.visible = true; flash.position.set(B.x, B.y, B.z); flashMat.opacity = 1;
      }
      function die(kind) {
        state = 'dead'; deadT = 0; deathKind = kind; ptrs.clear(); musOn = false;
        elTL.classList.remove('on'); elTR.classList.remove('on');
        if (kind === 1) { shatter(); sfxCrunch(); ball.visible = false; glow.visible = false; shake = 0.55; }
        else { sfxFall(); fallCam.copy(cam.position); }
      }
      function showOver() {
        state = 'over'; overAt = performance.now();
        const nb = score > 0 && api.submit(score);
        const bst = Math.max(api.best || 0, score);
        $('.os').textContent = score; $('.ob').textContent = bst;
        $('.nb').hidden = !nb;
        elPz.hidden = true; elTL.hidden = elTR.hidden = true;
        show(pOver);
      }

      const dbg = root.__slope = { sim, auto: null, get state() { return state; } };
      const inputDir = () => {
        if (dbg.auto) return dbg.auto();
        let l = keys.has('ArrowLeft') || keys.has('KeyA'), r = keys.has('ArrowRight') || keys.has('KeyD');
        for (const s of ptrs.values()) { if (s < 0) l = true; else r = true; }
        if (touchUI) { elTL.classList.toggle('on', l); elTR.classList.toggle('on', r); }
        return (r ? 1 : 0) - (l ? 1 : 0);
      };
      const sideOf = e => { const rc = wrap.getBoundingClientRect(); return e.clientX - rc.left < rc.width / 2 ? -1 : 1; };
      const isCtl = e => e.target && e.target.closest && e.target.closest('button,.sw i');
      api.on(wrap, 'pointerdown', e => {
        if (isCtl(e)) return;
        e.preventDefault();
        if (e.pointerType === 'touch' && !touchUI) { touchUI = true; if (state === 'play') elTL.hidden = elTR.hidden = false; }
        if (state === 'play') { ptrs.set(e.pointerId, sideOf(e)); try { wrap.setPointerCapture(e.pointerId); } catch (er) {} }
        else if (state === 'menu') startRun();
        else if (state === 'over' && performance.now() - overAt > 450) startRun();
        else if (state === 'pause') resume();
      });
      api.on(wrap, 'pointermove', e => { if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, sideOf(e)); });
      const up = e => ptrs.delete(e.pointerId);
      api.on(wrap, 'pointerup', up); api.on(wrap, 'pointercancel', up); api.on(wrap, 'lostpointercapture', up);
      api.on(wrap, 'contextmenu', e => e.preventDefault());
      const btn = (sel, fn) => api.on($(sel), 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (e.button === 0 || e.pointerType !== 'mouse') fn(); });
      btn('.go', () => { if (state === 'menu') startRun(); });
      btn('.rs', () => { if (state === 'over') startRun(); });
      btn('.mn', () => { if (state === 'over') toMenu(); });
      btn('.rsm', resume);
      btn('.pz', pause);
      btn('.mus', () => { setg.music = !setg.music; persist(); applyTheme(); });
      wrap.querySelectorAll('.sw i').forEach(el => api.on(el, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); setg.col = +el.dataset.c; persist(); applyTheme(); }));
      api.on(window, 'keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.code === 'Tab' || e.code === 'Escape' || /^(Shift|Control|Alt|Meta)/.test(e.key || '')) return;
        const tg = e.target;
        if (tg && /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)) return;
        if (state === 'menu') startRun();
        else if (state === 'over') { if (performance.now() - overAt > 450) startRun(); }
        else if (state === 'play') { if (e.code === 'KeyP') pause(); }
        else if (state === 'pause') resume();
      });
      api.on(window, 'blur', pause);
      api.on(document, 'visibilitychange', () => { if (document.hidden) pause(); });

      applyTheme();
      toMenu();

      const HSTEP = 1 / CFG.HZ;
      api.loop(dt => {
        if (state === 'play') {
          acc += dt;
          const inp = inputDir();
          let n = 0;
          while (acc >= HSTEP && n < 10) {
            px = B.x; py = B.y; pz = B.z;
            const res = sim.step(HSTEP, inp);
            acc -= HSTEP; n++;
            if (B.imp > 7) sfxLand(B.imp);
            if (res) { die(res); break; }
          }
          if (n >= 10) acc = 0;
          sim.ensure(B.z);
          if (++pruneTick % 15 === 0) sim.prune(B.z);
          const zn = Math.floor(sim.dist() / CFG.ZONE);
          if (zn > zone) setZone(zn, false);
          const s = Math.max(0, Math.floor(sim.dist() / CFG.SCORE_DIV));
          if (s !== score) { score = s; elSc.textContent = s; api.score(s); }
          const spd = Math.round(sim.speed() * 3.6);
          if (spd !== lastSp) { lastSp = spd; elSp.textContent = 'Speed ' + spd; }
        } else if (state === 'dead') {
          deadT += dt;
          elZt.hidden = true;
          if (deathKind === 2) {
            B.vy -= CFG.G * dt; B.vx *= Math.exp(-0.6 * dt); B.vz *= Math.exp(-0.6 * dt);
            B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt;
          }
          px = B.x; py = B.y; pz = B.z;
          if (deadT > (deathKind === 1 ? 1.15 : 1.35)) showOver();
        } else if (state === 'menu') {
          menuT += dt;
        }
        if (zoneT > 0) { zoneT -= dt; neon.lerp(zTarget, 1 - Math.exp(-3 * dt)); if (zoneT <= 0) neon.copy(zTarget); tint(); }
        const a = state === 'play' ? acc / HSTEP : 1;
        const bx = px + (B.x - px) * a, by = py + (B.y - py) * a, bz = pz + (B.z - pz) * a;
        const spd = sim.speed();

        if (ball.visible) {
          ball.position.set(bx, by, bz);
          glow.position.set(bx, by, bz);
          glowMat.opacity = 0.62 + 0.08 * Math.sin(performance.now() * 0.006);
          if (state === 'play' || state === 'dead') {
            const hv = Math.hypot(B.vx, B.vz);
            if (hv > 0.01) {
              axTmp.set(B.vz / hv, 0, -B.vx / hv);
              qTmp.setFromAxisAngle(axTmp, hv * dt / CFG.R);
              ball.quaternion.premultiply(qTmp);
            }
          } else if (state === 'menu') {
            axTmp.set(-1, 0, 0); qTmp.setFromAxisAngle(axTmp, dt * 1.2); ball.quaternion.premultiply(qTmp);
          }
        }
        trail.visible = ball.visible;
        if (ball.visible) {
          trAcc += dt;
          if (!trPrim || Math.abs(trP[0] - bx) + Math.abs(trP[2] - bz) > 15) { for (let i = 0; i < NTR; i++) { trP[i * 3] = bx; trP[i * 3 + 1] = by; trP[i * 3 + 2] = bz; } trPrim = true; trAcc = 0; }
          if (trAcc >= 0.012) {
            trAcc = 0;
            trP.copyWithin(3, 0, (NTR - 1) * 3);
          }
          trP[0] = bx; trP[1] = by; trP[2] = bz;
          trGeo.attributes.position.needsUpdate = true;
          trMat.uniforms.uPx.value = CFG.R * 2 * 1.15 * renderer.domElement.height / (2 * Math.tan(cam.fov * D2R / 2));
          const pg = B.gt > 0 && state !== 'menu' ? 1 : 0;
          poolMat.opacity += ((state === 'menu' ? 0.5 : pg * 0.6) - poolMat.opacity) * (1 - Math.exp(-14 * dt));
          pool.visible = poolMat.opacity > 0.02;
          if (pool.visible) {
            if (pg || state === 'menu') { poolN.x += (B.n[0] - poolN.x) * 0.5; poolN.y += (B.n[1] - poolN.y) * 0.5; poolN.z += (B.n[2] - poolN.z) * 0.5; poolN.normalize(); }
            poolQ.setFromUnitVectors(zV, poolN);
            pool.quaternion.copy(poolQ);
            pool.position.set(bx - poolN.x * (CFG.R - 0.05), by - poolN.y * (CFG.R - 0.05), bz - poolN.z * (CFG.R - 0.05));
          }
        } else trPrim = false;
        if (shards.visible) {
          for (let i = 0; i < NSH; i++) {
            const k = i * 3;
            shV[k + 1] -= CFG.G * 0.8 * dt;
            shP[k] += shV[k] * dt; shP[k + 1] += shV[k + 1] * dt; shP[k + 2] += shV[k + 2] * dt;
            shR[k] += shR[k + 2] * dt; shR[k + 1] += shR[k + 2] * 0.7 * dt;
            dummy.position.set(shP[k], shP[k + 1], shP[k + 2]);
            dummy.rotation.set(shR[k], shR[k + 1], 0);
            dummy.scale.setScalar(shS[i] * Math.max(0, 1 - deadT * 0.25));
            dummy.updateMatrix();
            shards.setMatrixAt(i, dummy.matrix);
          }
          shards.instanceMatrix.needsUpdate = true;
        }
        if (flash.visible) {
          flashMat.opacity = Math.max(0, flashMat.opacity - dt * 3);
          flash.scale.setScalar(1 + (1 - flashMat.opacity) * 9);
          if (flashMat.opacity <= 0) flash.visible = false;
        }

        const k1 = 1 - Math.exp(-7 * dt), k2 = 1 - Math.exp(-5.5 * dt);
        const tun = sim.inTunnel(bz) ? 1 : 0;
        lowT += (tun - lowT) * (1 - Math.exp(-6 * dt));
        const CH_ = lerp(small ? CFG.CAM_H + 0.8 : CFG.CAM_H, 2.25, lowT), CB = lerp(small ? CFG.CAM_B + 0.6 : CFG.CAM_B, 6, lowT);
        if ((state === 'dead' || state === 'over') && deathKind === 2) {
          cam.position.copy(fallCam);
          lookV.set(bx, by, bz);
          cam.lookAt(lookV);
        } else {
          if (state === 'menu') {
            camX = bx + Math.sin(menuT * 0.4) * 0.6; camY = by + CH_; lookX = bx; lookY = by;
          } else {
            camX += (bx - camX) * k1; lookX += (bx - lookX) * (1 - Math.exp(-11 * dt));
            camY += (by + CH_ - camY) * k2; lookY += (by - lookY) * (1 - Math.exp(-9 * dt));
          }
          cam.position.set(camX, camY, bz + CB);
          if (shake > 0) { shake = Math.max(0, shake - dt); cam.position.x += (Math.random() - 0.5) * shake * 0.8; cam.position.y += (Math.random() - 0.5) * shake * 0.8; }
          lookV.set(lookX, lookY + 0.2 - lowT * 0.1, bz - CFG.CAM_LOOK);
          cam.lookAt(lookV);
          const rollT = state === 'play' ? clamp(-B.vx * 0.011, -0.13, 0.13) : 0;
          camRoll += (rollT - camRoll) * (1 - Math.exp(-5 * dt));
          cam.rotateZ(camRoll);
        }
        const fovT = (small ? 70 : CFG.FOV) + (state === 'play' ? clamp((spd - CFG.V0) * 0.32, 0, 13) : 0);
        if (Math.abs(fovT - fov) > 0.01) { fov += (fovT - fov) * (1 - Math.exp(-2 * dt)); cam.fov = fov; cam.updateProjectionMatrix(); }

        for (const p of sim.moving) if (p.mesh) { sim.pose(p, sim.t); setMat(p.mesh, p); }

        uTime.value = performance.now() * 0.001;
        sky.position.copy(cam.position); stars.position.copy(cam.position);
        grid.position.set(cam.position.x, cam.position.y - 170, cam.position.z - 300);
        gridMat.uniforms.uCam.value.copy(cam.position);
        audioFrame(B.gt > 0, spd);
        renderer.render(scene, cam);
      });

      return {
        destroy() {
          musOn = false;
          if (rollN) { try { rollN.n.stop(); rollN.o.stop(); } catch (e) {} }
          if (ac) { try { ac.close(); } catch (e) {} ac = null; }
          for (const g of [unitBox, ballGeo, shardGeo, starGeo, sky.geometry, grid.geometry, trGeo, pool.geometry]) g.dispose();
          for (const m of [tileMat, redMat, skyMat, gridMat, starMat, ballMat, glowMat, flashMat, shardMat, trMat, poolMat]) m.dispose();
          glowTex.dispose();
          shards.dispose && shards.dispose();
        }
      };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="slp-bg" cx="50%" cy="34%" r="75%"><stop offset="0" stop-color="#0e3a1f"/><stop offset=".5" stop-color="#05170c"/><stop offset="1" stop-color="#010503"/></radialGradient><radialGradient id="slp-ball" cx="36%" cy="30%" r="72%"><stop offset="0" stop-color="#f2fff5"/><stop offset=".3" stop-color="#6dff93"/><stop offset="1" stop-color="#109a3a"/></radialGradient><radialGradient id="slp-glow"><stop offset="0" stop-color="#3dff6e" stop-opacity=".7"/><stop offset="1" stop-color="#3dff6e" stop-opacity="0"/></radialGradient><linearGradient id="slp-hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3dff6e" stop-opacity="0"/><stop offset=".5" stop-color="#3dff6e" stop-opacity=".22"/><stop offset="1" stop-color="#3dff6e" stop-opacity="0"/></linearGradient><clipPath id="slp-ballc"><circle cx="200" cy="246" r="31"/></clipPath></defs>
<rect width="400" height="300" fill="url(#slp-bg)"/><rect y="70" width="400" height="60" fill="url(#slp-hz)"/>
<g fill="#cfe9d8" opacity=".55"><circle cx="40" cy="30" r="1.6"/><circle cx="96" cy="58" r="1.3"/><circle cx="150" cy="22" r="1.5"/><circle cx="262" cy="40" r="1.4"/><circle cx="318" cy="18" r="1.7"/><circle cx="366" cy="62" r="1.3"/><circle cx="214" cy="12" r="1.2"/></g>
<g stroke="#3dff6e" stroke-width="3" opacity=".22" fill="none"><path d="M0 128H400M0 150H400M0 186H400M0 250H400M120 100L-60 300M170 100L60 300M240 100L360 300M290 100L470 300"/></g>
<path d="M173 140H235L216 111H193Z" fill="#071a0e"/><path d="M173 140H235V145H173Z" fill="#03100a" stroke="#3dff6e" stroke-width="2.5"/><path d="M173 140H235L216 111H193Z" fill="none" stroke="#3dff6e" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M132 198H272L239 146H169Z" fill="#071a0e"/><path d="M132 198H272V207H132Z" fill="#03100a" stroke="#3dff6e" stroke-width="3"/>
<g stroke="#3dff6e" stroke-width="2" opacity=".6"><path d="M145 180H261M157 163H250M167 198L186 146M202 198L204 146M237 198L221 146"/></g>
<path d="M132 198H272L239 146H169Z" fill="none" stroke="#3dff6e" stroke-width="4" stroke-linejoin="round"/>
<path d="M60 300H340L283 214H121Z" fill="#071a0e"/>
<g stroke="#3dff6e" stroke-width="2.2" opacity=".6"><path d="M75 280H327M89 259H313M104 239H300M130 300L162 214M200 300L202 214M270 300L243 214"/></g>
<path d="M60 300L121 214H283L340 300" fill="none" stroke="#3dff6e" stroke-width="5" stroke-linejoin="round"/>
<path d="M166 166H185V181H166Z" fill="#c8101a"/><path d="M166 166H185L183 161H168Z" fill="#ff5a55"/><path d="M166 166H185V181H166Z" fill="none" stroke="#ff7b70" stroke-width="2"/>
<path d="M254 222H300V262H254Z" fill="#c8101a"/><path d="M254 222H300L292 211H259Z" fill="#ff4a46"/><path d="M254 222V262L259 252V211Z" fill="#8f0710"/><path d="M254 222H300V262H254Z M254 222L259 211H292L300 222" fill="none" stroke="#ff8a80" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="200" cy="248" r="72" fill="url(#slp-glow)"/><ellipse cx="200" cy="277" rx="30" ry="6" fill="#3dff6e" opacity=".25"/>
<circle cx="200" cy="246" r="31" fill="url(#slp-ball)"/><g clip-path="url(#slp-ballc)" fill="none" stroke="#0c7a2c" stroke-width="2.2" opacity=".55"><ellipse cx="200" cy="246" rx="13" ry="31"/><ellipse cx="200" cy="246" rx="26" ry="31"/><path d="M168 235Q200 226 232 235M168 257Q200 266 232 257"/></g><circle cx="189" cy="234" r="7" fill="#fff" opacity=".75"/>
<g stroke="#3dff6e" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M30 214L8 252M52 196L36 222M370 214L392 252M348 196L364 222"/></g></svg>`;
})();

