    const CBX = [];
    let CBN = 0;
    const nbFn = (x, y, z) => (dx, dy, dz) => getS(x + dx, y + dy, z + dz);
    function blockBoxes(s, x, y, z) {
      const sol = SOL[s];
      if (sol === 1) return FULLCB;
      if (sol === 2) return COLL[s];
      if (sol === 3) { const t = TT[STT[s]]; return t.ccoll(s, t.cmask(s, nbFn(x, y, z))); }
      return null;
    }
    function gatherBoxes(x0, y0, z0, x1, y1, z1) {
      CBN = 0;
      const X0 = Math.floor(x0), X1 = Math.floor(x1), Y0 = Math.floor(y0) - 1, Y1 = Math.floor(y1), Z0 = Math.floor(z0), Z1 = Math.floor(z1);
      for (let y = Y0; y <= Y1; y++) for (let z = Z0; z <= Z1; z++) for (let x = X0; x <= X1; x++) {
        let s = getB(x, y, z);
        if (s < 0) { push6(x, y, z, 0, 0, 0, 1, 1, 1); continue; }
        if (!SOL[s]) continue;
        const L = blockBoxes(s, x, y, z);
        if (!L) continue;
        for (const b of L) push6(x, y, z, b[0], b[1], b[2], b[3], b[4], b[5]);
      }
    }
    function push6(x, y, z, a, b, c, d, e, f) {
      let o = CBN * 6;
      if (CBX.length < o + 6) CBX.length = o + 6;
      CBX[o++] = x + a; CBX[o++] = y + b; CBX[o++] = z + c; CBX[o++] = x + d; CBX[o++] = y + e; CBX[o++] = z + f; CBN++;
    }
    function sweep(e, d, ax, hw, hh) {
      if (d === 0) return 0;
      const mn = [e.x - hw, e.y, e.z - hw], mx = [e.x + hw, e.y + hh, e.z + hw];
      const a1 = (ax + 1) % 3, a2 = (ax + 2) % 3;
      for (let i = 0; i < CBN; i++) {
        const o = i * 6;
        if (CBX[o + a1] >= mx[a1] - 1e-7 || CBX[o + 3 + a1] <= mn[a1] + 1e-7 || CBX[o + a2] >= mx[a2] - 1e-7 || CBX[o + 3 + a2] <= mn[a2] + 1e-7) continue;
        if (d > 0 && CBX[o + ax] >= mx[ax] - 1e-7) { const g = CBX[o + ax] - mx[ax]; if (g < d) d = Math.max(0, g); }
        else if (d < 0 && CBX[o + 3 + ax] <= mn[ax] + 1e-7) { const g = CBX[o + 3 + ax] - mn[ax]; if (g > d) d = Math.min(0, g); }
      }
      return d;
    }
    function boxFree(e, ox, oy, oz, hh) {
      const hw = e.w / 2; hh = hh || e.h;
      gatherBoxes(e.x + ox - hw, e.y + oy, e.z + oz - hw, e.x + ox + hw, e.y + oy + hh, e.z + oz + hw);
      const x0 = e.x + ox - hw + 1e-6, x1 = e.x + ox + hw - 1e-6, y0 = e.y + oy + 1e-6, y1 = e.y + oy + hh - 1e-6, z0 = e.z + oz - hw + 1e-6, z1 = e.z + oz + hw - 1e-6;
      for (let i = 0; i < CBN; i++) { const o = i * 6; if (CBX[o] < x1 && CBX[o + 3] > x0 && CBX[o + 1] < y1 && CBX[o + 4] > y0 && CBX[o + 2] < z1 && CBX[o + 5] > z0) return false; }
      return true;
    }
    function moveE(e, dx, dy, dz, guard, step) {
      const hw = e.w / 2, hh = e.h;
      if (guard && e.onGround) {
        const st = .05, sp = v => Math.abs(v) < st ? 0 : v - Math.sign(v) * st;
        while (dx !== 0 && boxFree(e, dx, -1, 0, hh)) dx = sp(dx);
        while (dz !== 0 && boxFree(e, 0, -1, dz, hh)) dz = sp(dz);
        while (dx !== 0 && dz !== 0 && boxFree(e, dx, -1, dz, hh)) { dx = sp(dx); dz = sp(dz); }
      }
      const ox = dx, oy = dy, oz = dz;
      gatherBoxes(e.x - hw + Math.min(0, dx) - 1, e.y + Math.min(0, dy) - 1, e.z - hw + Math.min(0, dz) - 1, e.x + hw + Math.max(0, dx) + 1, e.y + hh + Math.max(0, dy) + (step ? 1 : 0) + 1, e.z + hw + Math.max(0, dz) + 1);
      dy = sweep(e, dy, 1, hw, hh); e.y += dy;
      const sx = e.x, sz = e.z, sy = e.y;
      let mx = sweep(e, dx, 0, hw, hh); e.x += mx;
      let mz = sweep(e, dz, 2, hw, hh); e.z += mz;
      const ground = (oy !== dy && oy < 0) || e.onGround;
      if (step && ground && (mx !== dx || mz !== dz)) {
        const bx = e.x, bz = e.z, by = e.y;
        e.x = sx; e.z = sz; e.y = sy;
        let up = sweep(e, step, 1, hw, hh); e.y += up;
        const mx2 = sweep(e, dx, 0, hw, hh); e.x += mx2;
        const mz2 = sweep(e, dz, 2, hw, hh); e.z += mz2;
        const dn = sweep(e, -up, 1, hw, hh); e.y += dn;
        if (mx2 * mx2 + mz2 * mz2 > mx * mx + mz * mz + 1e-6) { mx = mx2; mz = mz2; }
        else { e.x = bx; e.z = bz; e.y = by; }
      }
      e.collH = Math.abs(ox - mx) > 1e-5 || Math.abs(oz - mz) > 1e-5; e.collX = Math.abs(ox - mx) > 1e-5; e.collZ = Math.abs(oz - mz) > 1e-5;
      e.onGround = oy !== dy && oy < 0;
      e.collUp = oy !== dy && oy > 0;
      if (e.collX) e.vx = 0;
      if (e.collZ) e.vz = 0;
      if (oy !== dy) e.vy = 0;
    }
    function fluidIn(e, fk, yoff) {
      const hw = e.w / 2 - .001, x0 = Math.floor(e.x - hw), x1 = Math.floor(e.x + hw), y0 = Math.floor(e.y + (yoff || 0)), y1 = Math.floor(e.y + Math.max(.01, e.h * .6)), z0 = Math.floor(e.z - hw), z1 = Math.floor(e.z + hw);
      for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const b = getS(x, y, z); if (FLU[b] === fk) { const lv = (b - TT[STT[b]].base) & 7, top = y + (FLU[getS(x, y + 1, z)] === fk ? 1 : (lv ? (8 - lv) / 9 : 8 / 9)); if (top > e.y + (yoff || 0)) return true; } }
      return false;
    }
    function blockIn(e, pred) {
      const hw = e.w / 2 - .001, x0 = Math.floor(e.x - hw), x1 = Math.floor(e.x + hw), y0 = Math.floor(e.y + .01), y1 = Math.floor(e.y + e.h - .01), z0 = Math.floor(e.z - hw), z1 = Math.floor(e.z + hw);
      for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const b = getS(x, y, z); if (pred(b, x, y, z)) return b; }
      return 0;
    }
    function rayBox(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
      let tmin = 0, tmax = 1e9, fa = -1;
      const O = [ox, oy, oz], D = [dx, dy, dz], A = [x0, y0, z0], B = [x1, y1, z1];
      for (let i = 0; i < 3; i++) {
        if (Math.abs(D[i]) < 1e-9) { if (O[i] < A[i] || O[i] > B[i]) return null; continue; }
        let t1 = (A[i] - O[i]) / D[i], t2 = (B[i] - O[i]) / D[i], f1 = i * 2 + 1, f2 = i * 2;
        if (t1 > t2) { const t = t1; t1 = t2; t2 = t; const f = f1; f1 = f2; f2 = f; }
        if (t1 > tmin) { tmin = t1; fa = f1; }
        tmax = Math.min(tmax, t2); if (tmin > tmax) return null;
      }
      return [tmin, fa];
    }
    function selBoxes(s, x, y, z) {
      if (SELB[s]) return SELB[s];
      const sh = SHP[s];
      if (sh === 1) return FULLCB;
      if (SOL[s] === 2) return COLL[s];
      if (SOL[s] === 3) { const t = TT[STT[s]]; return t.ccoll(s, t.cmask(s, nbFn(x, y, z))).map(b => [b[0], b[1], b[2], b[3], Math.min(1, b[4]), b[5]]); }
      if (sh === 5) { const m = MOD[s]; let a = [16, 16, 16, 0, 0, 0]; for (const B of m) for (let i = 0; i < 3; i++) { a[i] = Math.min(a[i], B.a[i]); a[i + 3] = Math.max(a[i + 3], B.b[i]); } if (m.some(B => B.q || B.rx)) a = [0, 0, 0, 16, 16, 16]; a = a.map(v => clamp(v, 0, 16) / 16); if (a[3] - a[0] < .1) { a[0] = Math.max(0, a[0] - .05); a[3] = Math.min(1, a[3] + .05); } if (a[4] - a[1] < .1) a[4] = a[1] + .1; if (a[5] - a[2] < .1) { a[2] = Math.max(0, a[2] - .05); a[5] = Math.min(1, a[5] + .05); } return [a]; }
      if (sh === 2 || sh === 3) return [[.15, 0, .15, .85, .8, .85]];
      if (sh === 4) return FULLCB;
      return FULLCB;
    }
    const HIT = { b: false, x: 0, y: 0, z: 0, f: 0, fx: 0, fy: 0, fz: 0, d: 0, px: 0, py: 0, pz: 0, ent: null, box: null };
    function raycast(ox, oy, oz, dx, dy, dz, max, fluids, ents, skip) {
      HIT.b = false; HIT.ent = null;
      let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz), t = 0;
      const sx = Math.sign(dx), sy = Math.sign(dy), sz = Math.sign(dz), tdx = sx ? Math.abs(1 / dx) : 1e9, tdy = sy ? Math.abs(1 / dy) : 1e9, tdz = sz ? Math.abs(1 / dz) : 1e9;
      let tx = sx > 0 ? (x + 1 - ox) * tdx : sx < 0 ? (ox - x) * tdx : 1e9, ty = sy > 0 ? (y + 1 - oy) * tdy : sy < 0 ? (oy - y) * tdy : 1e9, tz = sz > 0 ? (z + 1 - oz) * tdz : sz < 0 ? (oz - z) * tdz : 1e9;
      for (let n = 0; n < 400 && t <= max; n++) {
        const s = getB(x, y, z);
        if (s > 0 && (SHP[s] !== 4 || fluids && ((s - TT[STT[s]].base) & 15) === 0) && SHP[s] !== 0) {
          const L = selBoxes(s, x, y, z);
          let best = null;
          for (const b of L) { const r = rayBox(ox, oy, oz, dx, dy, dz, x + b[0], y + b[1], z + b[2], x + b[3], y + b[4], z + b[5]); if (r && r[0] <= max && (!best || r[0] < best[0])) best = r.concat([b]); }
          if (best) { HIT.b = true; HIT.x = x; HIT.y = y; HIT.z = z; HIT.d = best[0]; HIT.f = best[1] < 0 ? 2 : best[1]; const D = DIR6[HIT.f]; HIT.fx = D[0]; HIT.fy = D[1]; HIT.fz = D[2]; HIT.px = ox + dx * best[0]; HIT.py = oy + dy * best[0]; HIT.pz = oz + dz * best[0]; HIT.box = best[2]; break; }
        }
        if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; } else if (ty < tz) { y += sy; t = ty; ty += tdy; } else { z += sz; t = tz; tz += tdz; }
      }
      if (ents) {
        let best = Math.min(HIT.b ? HIT.d : max, CFG.MOB_REACH + (max > CFG.REACH ? 1 : 0));
        for (const e of ents) { if (e === skip || e.dead || !e.hit) continue; const hw = e.w / 2 + .1; const r = rayBox(ox, oy, oz, dx, dy, dz, e.x - hw, e.y, e.z - hw, e.x + hw, e.y + e.h + .1, e.z + hw); if (r && r[0] <= best) { best = r[0]; HIT.ent = e; } }
        if (HIT.ent) HIT.b = false;
      }
      return HIT;
    }
