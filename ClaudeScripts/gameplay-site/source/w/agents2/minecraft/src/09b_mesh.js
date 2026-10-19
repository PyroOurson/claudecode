  const PS = 18, PSS = 324, PN = PSS * 18;
  const PB = new Uint16Array(PN), PL = new Uint8Array(PN);
  const TGc = new Uint8Array(PSS * 3), TFc = new Uint8Array(PSS * 3), TWc = new Uint8Array(PSS * 3);
  const pof = (x, y, z) => (x + 1) + (z + 1) * PS + (y + 1) * PSS;
  const FD = [
    { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], s: .6 },
    { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], s: .6 },
    { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 1 },
    { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: .5 },
    { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], s: .8 },
    { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], s: .8 }
  ];
  for (const F of FD) {
    F.no = pof(F.n[0], F.n[1], F.n[2]) - pof(0, 0, 0);
    F.ao = F.c.map(c => {
      const t = [0, 1, 2].filter(i => F.n[i] === 0), u = t[0], v = t[1];
      const du = c[u] ? 1 : -1, dv = c[v] ? 1 : -1;
      const a = [0, 0, 0], b = [0, 0, 0]; a[u] = du; b[v] = dv;
      const o = (d) => pof(F.n[0] + d[0], F.n[1] + d[1], F.n[2] + d[2]) - pof(0, 0, 0);
      return [o(a), o(b), o([a[0] + b[0], a[1] + b[1], a[2] + b[2]])];
    });
  }
  const AOV = [.38, .58, .78, 1];
  function mkMB() { return { p: new Float32Array(1 << 16), u: new Float32Array(1 << 15 + 0), l: new Uint8Array(1 << 16), t: new Uint8Array(1 << 16), i: new Uint32Array(1 << 15), nv: 0, ni: 0 }; }
  const MO = mkMB(), MT = mkMB(), MESHT = MT;
  function grow(M) {
    const nv = M.nv + 64;
    if (nv * 3 > M.p.length) { const n = M.p.length * 2; let a = new Float32Array(n); a.set(M.p); M.p = a; a = new Float32Array(n / 3 * 2 + 64); a.set(M.u); M.u = a; let b = new Uint8Array(n / 3 * 4 + 64); b.set(M.l); M.l = b; b = new Uint8Array(n / 3 * 4 + 64); b.set(M.t); M.t = b; }
    if (M.u.length < nv * 2) { const a = new Float32Array(nv * 4); a.set(M.u); M.u = a; }
    if (M.l.length < nv * 4) { let b = new Uint8Array(nv * 8); b.set(M.l); M.l = b; b = new Uint8Array(nv * 8); b.set(M.t); M.t = b; }
    if (M.ni + 96 > M.i.length) { const a = new Uint32Array(M.i.length * 2); a.set(M.i); M.i = a; }
  }
  let TR = 255, TG2 = 255, TB = 255;
  function vtx(M, x, y, z, u, v, sh, sk, bl, fl) {
    const n = M.nv++, p = n * 3, q = n * 4;
    M.p[p] = x; M.p[p + 1] = y; M.p[p + 2] = z;
    M.u[n * 2] = u; M.u[n * 2 + 1] = v;
    M.l[q] = sh; M.l[q + 1] = sk; M.l[q + 2] = bl; M.l[q + 3] = fl;
    M.t[q] = TR; M.t[q + 1] = TG2; M.t[q + 2] = TB; M.t[q + 3] = 255;
  }
  function idx(M, flip) {
    const b = M.nv - 4, I = M.i; let n = M.ni;
    if (flip) { I[n++] = b + 1; I[n++] = b + 2; I[n++] = b + 3; I[n++] = b + 1; I[n++] = b + 3; I[n++] = b; }
    else { I[n++] = b; I[n++] = b + 1; I[n++] = b + 2; I[n++] = b; I[n++] = b + 2; I[n++] = b + 3; }
    M.ni = n;
  }
  const ATL = 1024, TU = 16 / ATL;
  const tuv = t => [(t & 63) * TU, (t >> 6) * TU];
  let FANCY = true;
  const BIOC = [];
  function biomeColors() {
    if (BIOC.length) return;
    for (const b of W.gen.BIO) BIOC.push({ g: hx(b.g), f: hx(b.f), w: hx(b.w) });
  }
  function fillPad(c, sy) {
    const cx = c.cx, cz = c.cz;
    PB.fill(0); PL.fill(0xF0);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const n = colAt(cx + dx, cz + dz);
      const xa = dx < 0 ? 15 : 0, xb = dx > 0 ? 0 : 15, za = dz < 0 ? 15 : 0, zb = dz > 0 ? 0 : 15;
      for (let ly = -1; ly <= 16; ly++) {
        const Y = sy * 16 + ly;
        if (Y < 0) { for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) { const p = pof(x + dx * 16, ly, z + dz * 16); PB[p] = 1; PL[p] = 0; } continue; }
        if (Y >= H || !n) continue;
        const sec = n.s[Y >> 4], la = n.l ? n.l[Y >> 4] : null, yo = (Y & 15) << 8;
        for (let z = za; z <= zb; z++) {
          const row = pof(dx * 16, ly, z + dz * 16), so = yo | z << 4;
          for (let x = xa; x <= xb; x++) { PB[row + x] = sec ? sec[so | x] : 0; PL[row + x] = la ? la[so | x] : 0xF0; }
        }
      }
      if (n && n.bio) {
        biomeColors();
        for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) {
          const b = BIOC[n.bio[x | z << 4]] || BIOC[0], o = ((x + dx * 16 + 1) + (z + dz * 16 + 1) * PS) * 3;
          TGc[o] = b.g[0]; TGc[o + 1] = b.g[1]; TGc[o + 2] = b.g[2]; TFc[o] = b.f[0]; TFc[o + 1] = b.f[1]; TFc[o + 2] = b.f[2]; TWc[o] = b.w[0]; TWc[o + 1] = b.w[1]; TWc[o + 2] = b.w[2];
        }
      }
    }
  }
  const FIXT = { 4: [97, 153, 97], 5: [128, 167, 85], 6: [141, 177, 39], 7: [32, 128, 48], 8: [100, 180, 50], 9: [224, 199, 28] };
  const REDP = [];
  for (let i = 0; i < 16; i++) { const f = i / 15; REDP.push([f === 0 ? 77 : Math.round(255 * (f * .6 + .4)), Math.round(clamp(f * f * .7 - .5, 0, 1) * 255), Math.round(clamp(f * f * .6 - .7, 0, 1) * 255)]); }
  function setTint(kind, x, z, s) {
    if (!kind) { TR = TG2 = TB = 255; return; }
    if (kind === 10) { const c = REDP[sv(s, 'power')]; TR = c[0]; TG2 = c[1]; TB = c[2]; return; }
    if (kind === 8) { const a = sv(s, 'age') / 7; TR = 70 + a * 150 | 0; TG2 = 190 - a * 40 | 0; TB = 40; return; }
    if (FIXT[kind]) { const c = FIXT[kind]; TR = c[0]; TG2 = c[1]; TB = c[2]; return; }
    const A = kind === 1 ? TGc : kind === 2 ? TFc : TWc;
    let r = 0, g = 0, b = 0;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const o = ((x + dx + 1) + (z + dz + 1) * PS) * 3; r += A[o]; g += A[o + 1]; b += A[o + 2]; }
    TR = r / 9 | 0; TG2 = g / 9 | 0; TB = b / 9 | 0;
  }
  const UVR = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
  function cubeFace(M, s, f, x, y, z, p, t, rot, fl) {
    const F = FD[f], L0 = PL[p + F.no], UV = tuv(t);
    const u0 = UV[0], v0 = UV[1], u1 = u0 + TU, v1 = v0 + TU;
    const cu = [u0, u1, u1, u0], cvv = [v1, v1, v0, v0];
    let a0 = 0, a1 = 0, a2 = 0, a3 = 0;
    const R = UVR[rot & 3];
    for (let k = 0; k < 4; k++) {
      const A = F.ao[k], o1 = OPQ[PB[p + A[0]]], o2 = OPQ[PB[p + A[1]]], o3 = OPQ[PB[p + A[2]]];
      const ao = o1 && o2 ? 0 : 3 - o1 - o2 - o3;
      let sk = L0 >> 4, bl = L0 & 15, n = 1, L;
      if (!o1) { L = PL[p + A[0]]; sk += L >> 4; bl += L & 15; n++; }
      if (!o2) { L = PL[p + A[1]]; sk += L >> 4; bl += L & 15; n++; }
      if (!o3 && !(o1 && o2)) { L = PL[p + A[2]]; sk += L >> 4; bl += L & 15; n++; }
      const C = F.c[k], ri = R[k];
      vtx(M, x + C[0], y + C[1], z + C[2], cu[ri], cvv[ri], AOV[ao] * F.s * 255 | 0, sk * 17 / n | 0, bl * 17 / n | 0, fl);
      if (k === 0) a0 = ao; else if (k === 1) a1 = ao; else if (k === 2) a2 = ao; else a3 = ao;
    }
    idx(M, a0 + a2 < a1 + a3);
  }
  const QP = new Float32Array(12);
  function quadUV(M, pts, uv, sh, L, fl, back) {
    vtx(M, pts[0], pts[1], pts[2], uv[0], uv[1], sh, (L >> 4) * 17, (L & 15) * 17, fl);
    vtx(M, pts[3], pts[4], pts[5], uv[2], uv[3], sh, (L >> 4) * 17, (L & 15) * 17, fl);
    vtx(M, pts[6], pts[7], pts[8], uv[4], uv[5], sh, (L >> 4) * 17, (L & 15) * 17, fl);
    vtx(M, pts[9], pts[10], pts[11], uv[6], uv[7], sh, (L >> 4) * 17, (L & 15) * 17, fl);
    idx(M, false);
    if (back) {
      const b = M.nv - 4;
      vtx(M, pts[9], pts[10], pts[11], uv[6], uv[7], sh, (L >> 4) * 17, (L & 15) * 17, fl);
      vtx(M, pts[6], pts[7], pts[8], uv[4], uv[5], sh, (L >> 4) * 17, (L & 15) * 17, fl);
      vtx(M, pts[3], pts[4], pts[5], uv[2], uv[3], sh, (L >> 4) * 17, (L & 15) * 17, fl);
      vtx(M, pts[0], pts[1], pts[2], uv[0], uv[1], sh, (L >> 4) * 17, (L & 15) * 17, fl);
      idx(M, false); void b;
    }
  }
  const UV8 = new Float32Array(8);
  function crossQuads(M, t, x, y, z, L, ox, oz, crop, fl, sh, hy) {
    const [u0, v0] = tuv(t), u1 = u0 + TU, v1 = v0 + TU;
    UV8[0] = u0; UV8[1] = v1; UV8[2] = u1; UV8[3] = v1; UV8[4] = u1; UV8[5] = v0; UV8[6] = u0; UV8[7] = v0;
    const h = hy || 1;
    if (!crop) {
      const a = .5 - .45, b = .5 + .45;
      for (const [ax2, az, bx2, bz] of [[a, a, b, b], [a, b, b, a]]) {
        QP[0] = x + ax2 + ox; QP[1] = y; QP[2] = z + az + oz; QP[3] = x + bx2 + ox; QP[4] = y; QP[5] = z + bz + oz; QP[6] = x + bx2 + ox; QP[7] = y + h; QP[8] = z + bz + oz; QP[9] = x + ax2 + ox; QP[10] = y + h; QP[11] = z + az + oz;
        quadUV(M, QP, UV8, sh, L, fl, true);
      }
    } else {
      for (const k of [.25, .75]) {
        QP[0] = x + k; QP[1] = y - 1 / 16; QP[2] = z; QP[3] = x + k; QP[4] = y - 1 / 16; QP[5] = z + 1; QP[6] = x + k; QP[7] = y + 15 / 16; QP[8] = z + 1; QP[9] = x + k; QP[10] = y + 15 / 16; QP[11] = z;
        quadUV(M, QP, UV8, sh, L, fl, true);
        QP[0] = x; QP[1] = y - 1 / 16; QP[2] = z + k; QP[3] = x + 1; QP[4] = y - 1 / 16; QP[5] = z + k; QP[6] = x + 1; QP[7] = y + 15 / 16; QP[8] = z + k; QP[9] = x; QP[10] = y + 15 / 16; QP[11] = z + k;
        quadUV(M, QP, UV8, sh, L, fl, true);
      }
    }
  }
  const CMC = new Map();
  function cmodelFor(s, nbf) {
    const t = TT[STT[s]], m = t.cmask(s, nbf), key = s * 4096 + m;
    let r = CMC.get(key);
    if (!r) { r = cmodelTids(t.cmodel(s, m)); CMC.set(key, r); }
    return r;
  }
  const CPT = new Float32Array(12);
  function rotPt(P, rx) {
    if (!rx) return;
    const a = rx.ang * Math.PI / 180, c = Math.cos(a), s2 = Math.sin(a), o = rx.o;
    for (let k = 0; k < 4; k++) {
      let px = P[k * 3] - o[0], py = P[k * 3 + 1] - o[1], pz = P[k * 3 + 2] - o[2];
      if (rx.ax === 'x') { const ny = py * c - pz * s2, nz2 = py * s2 + pz * c; py = ny; pz = nz2; }
      else if (rx.ax === 'z') { const nx = px * c - py * s2, ny = px * s2 + py * c; px = nx; py = ny; }
      else { const nx = px * c + pz * s2, nz2 = -px * s2 + pz * c; px = nx; pz = nz2; }
      P[k * 3] = px + o[0]; P[k * 3 + 1] = py + o[1]; P[k * 3 + 2] = pz + o[2];
    }
  }
  function modelBoxes(M, MTr, boxes, s, x, y, z, p, tintK) {
    const ownL = PL[p];
    for (const B of boxes) {
      const a = B.a, b = B.b;
      for (let f = 0; f < 6; f++) {
        const fc = B.f[f]; if (!fc) continue;
        const F = FD[f];
        let onB = false;
        if (!B.rx && !B.rx2 && !B.q) {
          onB = f === 0 ? b[0] >= 16 : f === 1 ? a[0] <= 0 : f === 2 ? b[1] >= 16 : f === 3 ? a[1] <= 0 : f === 4 ? b[2] >= 16 : a[2] <= 0;
          if (onB) { const n = PB[p + F.no]; if (OPQ[n] || (LEAF[n] && !FANCY && LEAF[s])) continue; }
        }
        let L = onB || (B.rx || B.q) ? PL[p + F.no] : ownL;
        if (onB || (B.rx || B.q)) { const o2 = ownL; if ((L >> 4) < (o2 >> 4) || (L & 15) < (o2 & 15)) L = Math.max(L & 0xF0, o2 & 0xF0) | Math.max(L & 15, o2 & 15); }
        if (OPQ[PB[p + F.no]] && !onB) L = ownL;
        for (let k = 0; k < 4; k++) { const C = F.c[k]; CPT[k * 3] = C[0] ? b[0] : a[0]; CPT[k * 3 + 1] = C[1] ? b[1] : a[1]; CPT[k * 3 + 2] = C[2] ? b[2] : a[2]; }
        if (B.sc) for (let k = 0; k < 4; k++) { CPT[k * 3 + 2] = 16 - (16 - CPT[k * 3 + 2]) * B.sc; }
        rotPt(CPT, B.rx); rotPt(CPT, B.rx2);
        if (B.q) for (let r = 0; r < B.q; r++) for (let k = 0; k < 4; k++) { const px = CPT[k * 3], pz = CPT[k * 3 + 2]; CPT[k * 3] = 16 - pz; CPT[k * 3 + 2] = px; }
        for (let k = 0; k < 12; k++) QP[k] = CPT[k] / 16 + (k % 3 === 0 ? x : k % 3 === 1 ? y : z);
        const T = fc.tid, [tu, tv] = tuv(T), uv = fc.uv, R = UVR[fc.r & 3];
        const cu = [uv[0], uv[2], uv[2], uv[0]], cvv = [uv[3], uv[3], uv[1], uv[1]];
        for (let k = 0; k < 4; k++) { const ri = R[k]; UV8[k * 2] = tu + cu[ri] / 16 * TU; UV8[k * 2 + 1] = tv + cvv[ri] / 16 * TU; }
        if (fc.ti && tintK) setTint(tintK, x & 15, z & 15, s); else { TR = TG2 = TB = 255; }
        const tgt = TT[STT[s]].trans || fc.an && TT[STT[s]].fluid ? MTr : M;
        grow(tgt);
        quadUV(tgt, QP, UV8, F.s * fc.sh * 255 | 0, L, fc.an ? 1 : 0, false);
      }
    }
  }
  const FLH = new Float32Array(4);
  function fluidH(p, fk) {
    const b = PB[p];
    if (FLU[b] !== fk) return -1;
    if (FLU[PB[p + PSS]] === fk) return 1;
    const lv = (b - TT[STT[b]].base) & 7;
    return lv === 0 ? 8 / 9 : (8 - lv) / 9;
  }
  function cornerH(p, fk, dx, dz) {
    let tot = 0, n = 0;
    for (const [ox, oz] of [[0, 0], [dx, 0], [0, dz], [dx, dz]]) {
      const q = p + ox + oz * PS, b = PB[q];
      if (FLU[b] === fk) { if (FLU[PB[q + PSS]] === fk) return 1; const h = fluidH(q, fk); if (h >= .8) { tot += h * 10; n += 10; } else { tot += h; n++; } }
      else if (!SOL[b]) n++;
    }
    return n ? tot / n : 0;
  }
  function liquid(M, s, x, y, z, p, lx, lz) {
    const fk = FLU[s], tr = fk === 1, tgtM = tr ? MT : M, fl = 1 | (tr ? 2 : 0);
    if (tr) setTint(3, lx, lz, s); else TR = TG2 = TB = 255;
    const up = FLU[PB[p + PSS]] === fk;
    const h00 = up ? 1 : cornerH(p, fk, -1, -1), h10 = up ? 1 : cornerH(p, fk, 1, -1), h11 = up ? 1 : cornerH(p, fk, 1, 1), h01 = up ? 1 : cornerH(p, fk, -1, 1);
    const ts = TIL[s * 6], tf = TIL[s * 6 + 1];
    grow(tgtM);
    const [su, svv] = tuv(ts), [fu, fv] = tuv(tf);
    if (!up && !OPQ[PB[p + PSS]]) {
      QP[0] = x; QP[1] = y + h01; QP[2] = z + 1; QP[3] = x + 1; QP[4] = y + h11; QP[5] = z + 1; QP[6] = x + 1; QP[7] = y + h10; QP[8] = z; QP[9] = x; QP[10] = y + h00; QP[11] = z;
      UV8[0] = su; UV8[1] = svv + TU; UV8[2] = su + TU; UV8[3] = svv + TU; UV8[4] = su + TU; UV8[5] = svv; UV8[6] = su; UV8[7] = svv;
      const L = Math.max(PL[p + PSS] >> 4, PL[p] >> 4) << 4 | Math.max(PL[p + PSS] & 15, PL[p] & 15);
      quadUV(tgtM, QP, UV8, 255, L, fl, false);
    }
    const sides = [[1, 0, x + 1, z + 1, x + 1, z, h11, h10, .6], [-1, 0, x, z, x, z + 1, h00, h01, .6], [0, 1, x, z + 1, x + 1, z + 1, h01, h11, .8], [0, -1, x + 1, z, x, z, h10, h00, .8]];
    for (const [dx, dz, ax0, az0, bx0, bz0, ha, hb, shd2] of sides) {
      const q = p + dx + dz * PS, n = PB[q];
      if (FLU[n] === fk || OPQ[n]) continue;
      if (tr && FLU[n]) continue;
      QP[0] = ax0; QP[1] = y; QP[2] = az0; QP[3] = bx0; QP[4] = y; QP[5] = bz0; QP[6] = bx0; QP[7] = y + hb; QP[8] = bz0; QP[9] = ax0; QP[10] = y + ha; QP[11] = az0;
      UV8[0] = fu; UV8[1] = fv + TU; UV8[2] = fu + TU; UV8[3] = fv + TU; UV8[4] = fu + TU; UV8[5] = fv + TU * (1 - hb); UV8[6] = fu; UV8[7] = fv + TU * (1 - ha);
      quadUV(tgtM, QP, UV8, shd2 * 255 | 0, PL[q], fl, false);
    }
    const dn = PB[p - PSS];
    if (FLU[dn] !== fk && !OPQ[dn]) {
      QP[0] = x; QP[1] = y + .001; QP[2] = z; QP[3] = x + 1; QP[4] = y + .001; QP[5] = z; QP[6] = x + 1; QP[7] = y + .001; QP[8] = z + 1; QP[9] = x; QP[10] = y + .001; QP[11] = z + 1;
      UV8[0] = su; UV8[1] = svv + TU; UV8[2] = su + TU; UV8[3] = svv + TU; UV8[4] = su + TU; UV8[5] = svv; UV8[6] = su; UV8[7] = svv;
      quadUV(tgtM, QP, UV8, 128, PL[p - PSS], fl, false);
    }
  }
  const nbOff = p => (dx, dy, dz) => PB[p + dx + dz * PS + dy * PSS];
  function meshSection(c, sy) {
    fillPad(c, sy);
    const M = MO, Mt = MT;
    M.nv = M.ni = Mt.nv = Mt.ni = 0;
    const sec = c.s[sy];
    if (!sec) return;
    const wx0 = c.cx * 16, wz0 = c.cz * 16, Y0 = sy * 16;
    for (let ly = 0; ly < 16; ly++) for (let lz = 0; lz < 16; lz++) {
      let p = pof(0, ly, lz);
      for (let lx = 0; lx < 16; lx++, p++) {
        const s = PB[p];
        if (!s) continue;
        const shp = SHP[s];
        if (!shp) continue;
        const x = lx, y = ly + Y0, z = lz;
        if (shp === 1) {
          const tr = CSM[s] && TT[STT[s]].trans, tg = tr ? Mt : M, leaf = LEAF[s], tk = TNT[s], fl = ANIMF[s] ? 1 : 0;
          grow(tg);
          for (let f = 0; f < 6; f++) {
            const n = PB[p + FD[f].no];
            if (OPQ[n]) continue;
            if (CSM[s] && CSM[n] === CSM[s]) continue;
            if (leaf && !FANCY && LEAF[n]) continue;
            if (f === 3 && y === 0) continue;
            if (tk) setTint(tk, lx, lz, s); else TR = TG2 = TB = 255;
            let t = TIL[s * 6 + f];
            if (leaf && !FANCY) t = TILF[s] !== undefined ? TILF[s] : t;
            cubeFace(tg, s, f, x, y, z, p, t, TRT[s * 6 + f], fl);
          }
        } else if (shp === 2 || shp === 3) {
          const t = TT[STT[s]], tk = TNT[s];
          if (tk) setTint(tk, lx, lz, s); else TR = TG2 = TB = 255;
          let ox = 0, oz = 0;
          if (t.offset || t.flower || t.tall) { const wx = wx0 + lx, wz = wz0 + lz; ox = (hash3(wx, 0, wz) - .5) * .3; oz = (hash3(wx, 1, wz) - .5) * .3; }
          grow(M);
          crossQuads(M, TIL[s * 6], x, y, z, PL[p], ox, oz, shp === 3, ANIMF[s] ? 1 : 0, 230, 1);
        } else if (shp === 4) liquid(M, s, x, y, z, p, lx, lz);
        else if (shp === 5) { grow(M); grow(Mt); modelBoxes(M, Mt, MOD[s], s, x, y, z, p, TNT[s]); }
        else if (shp === 6) { grow(M); grow(Mt); modelBoxes(M, Mt, cmodelFor(s, nbOff(p)), s, x, y, z, p, TNT[s]); }
      }
    }
  }

