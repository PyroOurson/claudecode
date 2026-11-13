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
      if (rr() < 0.85) { const a = rr() * TAU, r = rr() * z.r * 0.7; return navNear(nav, W.M, z.x + Math.cos(a) * r, z.y, z.z + Math.sin(a) * r, 2); }
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
    if (engage) {
      const dist = Math.hypot(tq.x - p.x, tq.z - p.z);
      chase = dist > pref * 1.35 || Math.abs(tq.y - p.y) > 3.5 && dist > 6;
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
      const want = engage ? navNear(nav, W.M, tq.x, tq.y, tq.z) : -2;
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
