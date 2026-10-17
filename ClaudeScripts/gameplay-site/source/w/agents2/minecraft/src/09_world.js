  function makeWorld(o) {
    const ID = {};
    for (const t of TT) ID[t.id] = t.base;
    const ax = n => S(n.replace(/_[xz]$/, ''), { axis: n.slice(-1) });
    Object.assign(ID, {
      grass_block_snowy: S('grass_block', { snowy: true }), podzol_snowy: S('podzol', { snowy: true }), snow: S('snow', { layers: 1 }),
      oak_log_x: S('oak_log', { axis: 'x' }), oak_log_z: S('oak_log', { axis: 'z' }), cherry_log_x: S('cherry_log', { axis: 'x' }), cherry_log_z: S('cherry_log', { axis: 'z' }), poplar_log_x: S('poplar_log', { axis: 'x' }), poplar_log_z: S('poplar_log', { axis: 'z' }),
      vine_n: S('vine', { north: true }), vine_s: S('vine', { south: true }), vine_e: S('vine', { east: true }), vine_w: S('vine', { west: true }),
      tall_grass_lower: S('tall_grass', { half: 'bottom' }), tall_grass_upper: S('tall_grass', { half: 'top' }), large_fern_lower: S('large_fern', { half: 'bottom' }), large_fern_upper: S('large_fern', { half: 'top' }),
      sunflower_lower: S('sunflower', { half: 'bottom' }), sunflower_upper: S('sunflower', { half: 'top' }), lilac_lower: S('lilac', { half: 'bottom' }), lilac_upper: S('lilac', { half: 'top' }),
      rose_bush_lower: S('rose_bush', { half: 'bottom' }), rose_bush_upper: S('rose_bush', { half: 'top' }), peony_lower: S('peony', { half: 'bottom' }), peony_upper: S('peony', { half: 'top' }),
      bamboo_leafy: S('bamboo', { leaves: 'large' }), pale_hanging_moss_tip: S('pale_hanging_moss', { tip: true }), sweet_berry_bush: S('sweet_berry_bush', { age: 3 }), pink_petals: S('pink_petals', { flower_amount: 4 }), leaf_litter: S('leaf_litter', { segment_amount: 3 }), wildflowers: S('wildflowers', { flower_amount: 3 }),
      cocoa_north: S('cocoa', { facing: 'north', age: 2 }), cocoa_south: S('cocoa', { facing: 'south', age: 2 }), cocoa_east: S('cocoa', { facing: 'east', age: 2 }), cocoa_west: S('cocoa', { facing: 'west', age: 2 }),
      shelf_mushroom_north: S('shelf_mushroom', { facing: 'north' }), shelf_mushroom_south: S('shelf_mushroom', { facing: 'south' }), shelf_mushroom_east: S('shelf_mushroom', { facing: 'east' }), shelf_mushroom_west: S('shelf_mushroom', { facing: 'west' })
    });
    void ax;
    const W = {
      seed: o.seed | 0, type: o.type || 'default', ID, cols: new Map(), edits: new Map(), be: new Map(), gen: GENF(ID, o.seed | 0, o.type || 'default'),
      genQ: new Set(), dirty: new Set(), lastK: -1, lastC: null, workers: [], wq: [], wbusy: 0
    };
    return W;
  }
  const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);
  let W = null;
  const colAt = (cx, cz) => { const k = ck(cx, cz); if (k === W.lastK) return W.lastC; W.lastK = k; return W.lastC = W.cols.get(k) || null; };
  const getB = (x, y, z) => { if (y < 0 || y >= H) return y < 0 ? 1 : 0; const c = colAt(x >> 4, z >> 4); if (!c || c.st < 1) return -1; const s = c.s[y >> 4]; return s ? s[(x & 15) | (z & 15) << 4 | (y & 15) << 8] : 0; };
  const getL = (x, y, z) => { if (y >= H) return 0xF0; if (y < 0) return 0; const c = colAt(x >> 4, z >> 4); if (!c || !c.l) return 0xF0; const l = c.l[y >> 4]; return l ? l[(x & 15) | (z & 15) << 4 | (y & 15) << 8] : 0xF0; };
  const getS = (x, y, z) => { const b = getB(x, y, z); return b < 0 ? 0 : b; };
  const solidAt = (x, y, z) => { const b = getB(x, y, z); return b < 0 || SOL[b] === 1; };
  const bio = (x, z) => { const c = colAt(x >> 4, z >> 4); return c && c.bio ? c.bio[(x & 15) | (z & 15) << 4] : 0; };
  function newCol(cx, cz) { return { cx, cz, s: new Array(NSEC).fill(null), l: null, top: -1, bio: null, hm: null, st: 0, m: new Array(NSEC).fill(null), md: new Uint8Array(NSEC), meshed: false, nbLit: false, ents: null }; }
  function genWorkerSrc() {
    return 'const GENF = ' + GENF.toString() + ';\nlet G = null;\nonmessage = e => { const d = e.data; if (d.init) { G = GENF(d.ID, d.seed, d.type); return; } const r = G.gen(d.cx, d.cz); const tr = [r.bio.buffer, r.hm.buffer]; for (const s of r.secs) if (s) tr.push(s.buffer); postMessage({ cx: d.cx, cz: d.cz, gen: d.gen, r }, tr); };';
  }
  let WSRC = null, workerOk = true, genEpoch = 0;
  function startWorkers() {
    for (const w of W.workers) { try { w.w.terminate(); } catch (e) { } }
    W.workers = []; W.wbusy = 0; genEpoch++;
    if (!workerOk) return;
    try {
      if (!WSRC) WSRC = URL.createObjectURL(new Blob([genWorkerSrc()], { type: 'text/javascript' }));
      const n = clamp((navigator.hardwareConcurrency || 2) - 1, 1, 3);
      for (let i = 0; i < n; i++) {
        const w = new Worker(WSRC), slot = { w, busy: 0 };
        w.onmessage = e => { slot.busy--; W.wbusy--; const d = e.data; if (d.gen !== genEpoch) return; onGen(d.cx, d.cz, d.r); };
        w.onerror = () => { workerOk = false; };
        w.postMessage({ init: 1, ID: W.ID, seed: W.seed, type: W.type });
        W.workers.push(slot);
      }
    } catch (e) { workerOk = false; W.workers = []; }
  }
  function requestGen(cx, cz) {
    const k = ck(cx, cz);
    if (W.cols.has(k)) return;
    const c = newCol(cx, cz); W.cols.set(k, c); W.lastK = -1;
    if (W.workers.length && workerOk) {
      let best = W.workers[0]; for (const s of W.workers) if (s.busy < best.busy) best = s;
      best.busy++; W.wbusy++;
      best.w.postMessage({ cx, cz, gen: genEpoch });
    } else W.genQ.add(k);
  }
  function genSync(budget) {
    const t0 = performance.now();
    for (const k of W.genQ) {
      if (performance.now() - t0 > budget) break;
      W.genQ.delete(k);
      const c = W.cols.get(k); if (!c || c.st) continue;
      onGen(c.cx, c.cz, W.gen.gen(c.cx, c.cz));
    }
  }
  function onGen(cx, cz, r) {
    const c = W.cols.get(ck(cx, cz));
    if (!c || c.st) return;
    c.s = r.secs; c.bio = r.bio; c.hm = r.hm; c.st = 1;
    let top = -1; for (let i = 0; i < NSEC; i++) if (c.s[i]) top = i;
    c.top = top;
    const ed = W.edits.get(ck(cx, cz));
    if (ed) ed.forEach((s, li) => { const sy = li >> 12; if (!c.s[sy]) c.s[sy] = new Uint16Array(4096); c.s[sy][li & 4095] = s; if (s && sy > c.top) c.top = sy; });
    W.lastK = -1;
    if (hooks.colLoaded) hooks.colLoaded(c);
  }
  const hooks = {};
  const LQ = new Int32Array(1 << 20), LQM = (1 << 18) - 1, RQ = new Int32Array(1 << 20);
  let lqh = 0, lqt = 0, rqh = 0, rqt = 0;
  const lpush = (x, y, z, v) => { const o = lqt << 2; LQ[o] = x; LQ[o + 1] = y; LQ[o + 2] = z; LQ[o + 3] = v; lqt = (lqt + 1) & LQM; };
  const rpush = (x, y, z, v) => { const o = rqt << 2; RQ[o] = x; RQ[o + 1] = y; RQ[o + 2] = z; RQ[o + 3] = v; rqt = (rqt + 1) & LQM; };
  function ensureLight(c, sy) {
    if (!c.l) c.l = new Array(NSEC).fill(null);
    if (!c.l[sy]) { const a = new Uint8Array(4096); a.fill(0xF0); c.l[sy] = a; }
    return c.l[sy];
  }
  function markDirtyAt(x, y, z) {
    const sx = x & 15, sy = y & 15, sz = z & 15, cx = x >> 4, cz = z >> 4, s = y >> 4;
    markSec(cx, cz, s);
    if (sx === 0) markSec(cx - 1, cz, s); else if (sx === 15) markSec(cx + 1, cz, s);
    if (sz === 0) markSec(cx, cz - 1, s); else if (sz === 15) markSec(cx, cz + 1, s);
    if (sy === 0 && s > 0) markSec(cx, cz, s - 1); else if (sy === 15 && s < NSEC - 1) markSec(cx, cz, s + 1);
  }
  function markSec(cx, cz, s) { const c = colAt(cx, cz); if (c && c.meshed) { if (!c.md[s]) { c.md[s] = 1; W.dirty.add(c); } } }
  const LMARK = { on: true };
  function setLv(c, x, y, z, ch, v) {
    const a = ensureLight(c, y >> 4), i = (x & 15) | (z & 15) << 4 | (y & 15) << 8;
    a[i] = ch ? (a[i] & 0xF0) | v : (a[i] & 0x0F) | v << 4;
    if (LMARK.on) markDirtyAt(x, y, z);
  }
  const getLv = (x, y, z, ch) => { const L = getL(x, y, z); return ch ? L & 15 : L >> 4; };
  function propagate(ch) {
    while (lqh !== lqt) {
      const o = lqh << 2, x = LQ[o], y = LQ[o + 1], z = LQ[o + 2]; lqh = (lqh + 1) & LQM;
      const L = getLv(x, y, z, ch);
      if (L <= 1 && !(ch === 0 && L === 1)) continue;
      for (let d = 0; d < 6; d++) {
        const D = DIR6[d], nx = x + D[0], ny = y + D[1], nz2 = z + D[2];
        if (ny < 0 || ny >= H) continue;
        const c = colAt(nx >> 4, nz2 >> 4);
        if (!c || c.st < 2 && !c.lighting) continue;
        const sec = c.s[ny >> 4], b = sec ? sec[(nx & 15) | (nz2 & 15) << 4 | (ny & 15) << 8] : 0, a = LAT[b];
        if (a >= 15) continue;
        const nl = ch === 0 && d === 3 && L === 15 && a === 0 ? 15 : L - (a > 1 ? a : 1);
        if (nl <= 0) continue;
        if (nl > getLv(nx, ny, nz2, ch)) { setLv(c, nx, ny, nz2, ch, nl); lpush(nx, ny, nz2, 0); }
      }
    }
  }
  function unpropagate(ch) {
    while (rqh !== rqt) {
      const o = rqh << 2, x = RQ[o], y = RQ[o + 1], z = RQ[o + 2], L = RQ[o + 3]; rqh = (rqh + 1) & LQM;
      for (let d = 0; d < 6; d++) {
        const D = DIR6[d], nx = x + D[0], ny = y + D[1], nz2 = z + D[2];
        if (ny < 0 || ny >= H) continue;
        const c = colAt(nx >> 4, nz2 >> 4);
        if (!c || c.st < 2) continue;
        const nl = getLv(nx, ny, nz2, ch);
        if (!nl) continue;
        if (nl < L || (ch === 0 && d === 3 && L === 15 && nl === 15)) { setLv(c, nx, ny, nz2, ch, 0); rpush(nx, ny, nz2, nl); }
        else lpush(nx, ny, nz2, 0);
      }
    }
  }
  function lightColumn(c) {
    c.lighting = true;
    const top = Math.max(c.top, 0);
    c.l = new Array(NSEC).fill(null);
    for (let s = 0; s <= Math.min(NSEC - 1, top + 1); s++) { const a = new Uint8Array(4096); a.fill(0xF0); c.l[s] = a; }
    const skyTop = new Int16Array(256), x0 = c.cx * 16, z0 = c.cz * 16, yS = Math.min(H - 1, (top + 1) * 16 + 15);
    LMARK.on = false;
    for (let i = 0; i < 256; i++) {
      let L = 15, st = yS + 1;
      for (let y = yS; y >= 0; y--) {
        const sec = c.s[y >> 4], b = sec ? sec[i | (y & 15) << 8] : 0, a = LAT[b];
        if (L === 15 && a === 0) { st = y; } else { L = a >= 15 ? 0 : Math.max(0, L - (a > 1 ? a : 1)); }
        const la = c.l[y >> 4];
        if (la) la[i | (y & 15) << 8] = L << 4 | (LEM[b] || 0);
        else if (L !== 15) { ensureLight(c, y >> 4)[i | (y & 15) << 8] = L << 4 | (LEM[b] || 0); }
        if (L === 0 && y < st - 1) { for (let yy = y - 1; yy >= 0; yy--) { const s2 = c.s[yy >> 4], b2 = s2 ? s2[i | (yy & 15) << 8] : 0; const l2 = ensureLight(c, yy >> 4); l2[i | (yy & 15) << 8] = LEM[b2] || 0; } break; }
      }
      skyTop[i] = st;
    }
    for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
      const i = x | z << 4, st = skyTop[i];
      let mx = st;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const X = x + dx, Z = z + dz;
        if (X >= 0 && X < 16 && Z >= 0 && Z < 16) mx = Math.max(mx, skyTop[X | Z << 4]);
        else mx = Math.max(mx, yS);
      }
      for (let y = st; y < mx && y < H; y++) lpush(x0 + x, y, z0 + z, 0);
      for (let y = st - 1; y >= 0; y--) { const L = c.l[y >> 4] ? c.l[y >> 4][i | (y & 15) << 8] >> 4 : 15; if (L > 1) lpush(x0 + x, y, z0 + z, 0); else if (L === 0) break; }
    }
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = colAt(c.cx + dx, c.cz + dz);
      if (!n || n.st < 2 || !n.l) continue;
      const ny = Math.min(H - 1, Math.max(n.top, top) * 16 + 31);
      for (let k = 0; k < 16; k++) for (let y = 0; y <= ny; y++) {
        const X = dx === 1 ? x0 + 16 : dx === -1 ? x0 - 1 : x0 + k, Z = dz === 1 ? z0 + 16 : dz === -1 ? z0 - 1 : z0 + k;
        const L = getL(X, y, Z) >> 4; if (L > 1) lpush(X, y, Z, 0);
      }
    }
    LMARK.on = true;
    c.st = 2;
    propagate(0);
    LMARK.on = false;
    for (let s = 0; s <= top; s++) { const sec = c.s[s]; if (!sec) continue; for (let i = 0; i < 4096; i++) { const b = sec[i]; if (b && LEM[b]) lpush(x0 + (i & 15), s * 16 + (i >> 8), z0 + (i >> 4 & 15), 0); } }
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = colAt(c.cx + dx, c.cz + dz);
      if (!n || n.st < 2 || !n.l) continue;
      const ny = Math.min(H - 1, Math.max(n.top, top) * 16 + 15);
      for (let k = 0; k < 16; k++) for (let y = 0; y <= ny; y++) {
        const X = dx === 1 ? x0 + 16 : dx === -1 ? x0 - 1 : x0 + k, Z = dz === 1 ? z0 + 16 : dz === -1 ? z0 - 1 : z0 + k;
        const L = getL(X, y, Z) & 15; if (L > 1) lpush(X, y, Z, 0);
      }
    }
    LMARK.on = true;
    propagate(1);
    c.lighting = false;
  }
  function relight(x, y, z, oldS, newS) {
    const oa = LAT[oldS], na = LAT[newS], oe = LEM[oldS], ne = LEM[newS];
    const c = colAt(x >> 4, z >> 4);
    if (!c || c.st < 2) return;
    if (oe !== ne || na !== oa) {
      const cur = getLv(x, y, z, 1);
      if (cur) { setLv(c, x, y, z, 1, 0); rpush(x, y, z, cur); unpropagate(1); }
      if (ne) { setLv(c, x, y, z, 1, ne); lpush(x, y, z, 0); }
      if (na < oa) for (const D of DIR6) lpush(x + D[0], y + D[1], z + D[2], 0);
      propagate(1);
    }
    if (na !== oa) {
      if (na > oa) {
        const cur = getLv(x, y, z, 0);
        if (cur) { setLv(c, x, y, z, 0, 0); rpush(x, y, z, cur); unpropagate(0); }
        if (na < 15) for (const D of DIR6) lpush(x + D[0], y + D[1], z + D[2], 0);
        propagate(0);
      } else {
        for (const D of DIR6) lpush(x + D[0], y + D[1], z + D[2], 0);
        propagate(0);
      }
    }
  }
  const changes = [];
  function setBlock(x, y, z, s, flags) {
    if (y < 0 || y >= H) return false;
    const c = colAt(x >> 4, z >> 4);
    if (!c || c.st < 1) return false;
    const sy = y >> 4, li = (x & 15) | (z & 15) << 4 | (y & 15) << 8;
    let sec = c.s[sy];
    const old = sec ? sec[li] : 0;
    if (old === s) return false;
    if (!sec) { if (!s) return false; sec = c.s[sy] = new Uint16Array(4096); }
    sec[li] = s;
    if (s && sy > c.top) { c.top = sy; if (c.l) for (let k = 0; k <= Math.min(NSEC - 1, sy + 1); k++) ensureLight(c, k); }
    const k = ck(x >> 4, z >> 4);
    let ed = W.edits.get(k);
    if (!ed) W.edits.set(k, ed = new Map());
    ed.set(li | sy << 12, s);
    if (c.st >= 2) relight(x, y, z, old, s);
    markDirtyAt(x, y, z);
    for (let d = 0; d < 6; d++) { const D = DIR6[d]; if (SHP[getS(x + D[0], y + D[1], z + D[2])] === 6) markDirtyAt(x + D[0], y + D[1], z + D[2]); }
    if (!(flags & 1)) changes.push(x, y, z, s);
    if (hooks.onSet && !(flags & 2)) hooks.onSet(x, y, z, old, s, flags);
    return true;
  }
  function topY(x, z) {
    const c = colAt(x >> 4, z >> 4);
    if (!c || c.st < 1) return -1;
    for (let s = c.top; s >= 0; s--) { const sec = c.s[s]; if (!sec) continue; for (let y = 15; y >= 0; y--) { const b = sec[(x & 15) | (z & 15) << 4 | y << 8]; if (b && (SOL[b] || FLU[b] || LAT[b])) return s * 16 + y; } }
    return -1;
  }
