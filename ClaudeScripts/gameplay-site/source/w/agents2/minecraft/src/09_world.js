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
      genQ: new Set(), dirty: new Set(), lastK: -1, lastC: null, workers: [], wq: [], wbusy: 0, visd: 2, cdq: new Set(), light: LIGHTF(LAT, LEM, NSEC, H), conn: CONNF(OPQ)
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
  function newCol(cx, cz) { return { cx, cz, s: new Array(NSEC).fill(null), l: null, top: -1, bio: null, hm: null, st: 0, m: new Array(NSEC).fill(null), md: new Uint8Array(NSEC), meshed: false, ents: null, cn: null, cd: 0, vs: new Uint8Array(NSEC), vt: 0, rt: -1, dq: 0 }; }
  function LIGHTF(LAT, LEM, NSEC, H) {
    const Q = new Int32Array(1 << 19), QM = (1 << 19) - 1, skyTop = new Int16Array(256);
    let l = null, secs = null;
    const ens = s => { const a = new Uint8Array(4096); a.fill(0xF0); return l[s] = a; };
    function prop(ch, qt) {
      let qh = 0;
      while (qh !== qt) {
        const i = Q[qh]; qh = (qh + 1) & QM;
        const y = i >> 8, la = l[y >> 4], v = la ? la[(i & 255) | (y & 15) << 8] : 0xF0, L = ch ? v & 15 : v >> 4;
        if (L <= 1) continue;
        for (let d = 0; d < 6; d++) {
          let j;
          if (d === 0) { if ((i & 15) === 15) continue; j = i + 1; }
          else if (d === 1) { if ((i & 15) === 0) continue; j = i - 1; }
          else if (d === 2) { if (y >= H - 1) continue; j = i + 256; }
          else if (d === 3) { if (y === 0) continue; j = i - 256; }
          else if (d === 4) { if ((i >> 4 & 15) === 15) continue; j = i + 16; }
          else { if ((i >> 4 & 15) === 0) continue; j = i - 16; }
          const ny = j >> 8, sec = secs[ny >> 4], lj = (j & 255) | (ny & 15) << 8, a = LAT[sec ? sec[lj] : 0];
          if (a >= 15) continue;
          const nl = ch === 0 && d === 3 && L === 15 && a === 0 ? 15 : L - (a > 1 ? a : 1);
          if (nl <= 0) continue;
          let lb = l[ny >> 4];
          const cur = lb ? (ch ? lb[lj] & 15 : lb[lj] >> 4) : (ch ? 0 : 15);
          if (nl > cur) { if (!lb) lb = ens(ny >> 4); lb[lj] = ch ? (lb[lj] & 0xF0) | nl : (lb[lj] & 15) | nl << 4; Q[qt] = j; qt = (qt + 1) & QM; }
        }
      }
    }
    return function (S, top) {
      secs = S; l = new Array(NSEC).fill(null);
      const out = l;
      if (top < 0) { secs = l = null; return out; }
      const nl = Math.min(NSEC - 1, top + 1), yS = nl * 16 + 15;
      for (let s = 0; s <= nl; s++) ens(s);
      for (let i = 0; i < 256; i++) {
        let L = 15, st = yS + 1;
        for (let y = yS; y >= 0; y--) {
          const sec = S[y >> 4], li = i | (y & 15) << 8, b = sec ? sec[li] : 0, a = LAT[b];
          if (L === 15 && a === 0) st = y; else L = a >= 15 ? 0 : Math.max(0, L - (a > 1 ? a : 1));
          l[y >> 4][li] = L << 4 | LEM[b];
          if (L === 0 && y < st - 1) { for (let yy = y - 1; yy >= 0; yy--) { const s2 = S[yy >> 4], l2 = i | (yy & 15) << 8; l[yy >> 4][l2] = s2 ? LEM[s2[l2]] : 0; } break; }
        }
        skyTop[i] = st;
      }
      let qt = 0;
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
        const i = x | z << 4, st = skyTop[i];
        let mx = st;
        if (x > 0 && skyTop[i - 1] > mx) mx = skyTop[i - 1];
        if (x < 15 && skyTop[i + 1] > mx) mx = skyTop[i + 1];
        if (z > 0 && skyTop[i - 16] > mx) mx = skyTop[i - 16];
        if (z < 15 && skyTop[i + 16] > mx) mx = skyTop[i + 16];
        for (let y = st; y < mx; y++) Q[qt++] = i | y << 8;
        for (let y = st - 1; y >= 0; y--) { const L = l[y >> 4][i | (y & 15) << 8] >> 4; if (L > 1) Q[qt++] = i | y << 8; else if (L === 0) break; }
      }
      prop(0, qt);
      qt = 0;
      for (let s = 0; s <= top; s++) { const sec = S[s]; if (!sec) continue; for (let i = 0; i < 4096; i++) { const b = sec[i]; if (b && LEM[b]) Q[qt++] = (i & 255) | ((i >> 8) + s * 16) << 8; } }
      prop(1, qt);
      secs = l = null;
      return out;
    };
  }
  function CONNF(OPQ) {
    const vis = new Uint8Array(4096), st = new Int16Array(4096), pair = new Uint8Array(36);
    for (let a = 0, k = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) pair[a * 6 + b] = pair[b * 6 + a] = k++;
    function flood(sec, i0) {
      let n = 0, m = 0;
      st[n++] = i0; vis[i0] = 1;
      while (n) {
        const i = st[--n], x = i & 15, z = i >> 4 & 15, y = i >> 8;
        let j;
        if (x === 15) m |= 1; else { j = i + 1; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
        if (x === 0) m |= 2; else { j = i - 1; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
        if (y === 15) m |= 4; else { j = i + 256; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
        if (y === 0) m |= 8; else { j = i - 256; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
        if (z === 15) m |= 16; else { j = i + 16; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
        if (z === 0) m |= 32; else { j = i - 16; if (!vis[j] && !OPQ[sec[j]]) { vis[j] = 1; st[n++] = j; } }
      }
      return m;
    }
    function all(sec) {
      if (!sec) return 0x7FFF;
      vis.fill(0);
      let bits = 0;
      for (let i = 0; i < 4096; i++) {
        if (vis[i] || OPQ[sec[i]]) continue;
        const m = flood(sec, i);
        if (!(m & (m - 1))) continue;
        for (let a = 0; a < 6; a++) if (m >> a & 1) for (let b = a + 1; b < 6; b++) if (m >> b & 1) bits |= 1 << pair[a * 6 + b];
        if (bits === 0x7FFF) break;
      }
      return bits;
    }
    function from(sec, i) {
      if (!sec) return 63;
      if (OPQ[sec[i]]) return 63;
      vis.fill(0);
      return flood(sec, i);
    }
    return { all, from, pair };
  }
  function GENPOST(r, ed, light, conn) {
    const secs = r.secs, n = secs.length;
    if (ed) for (let i = 0; i < ed.length; i++) { const v = ed[i], li = Math.floor(v / 16384), s = v % 16384, sy = li >> 12; if (sy >= n) continue; if (!secs[sy]) { if (!s) continue; secs[sy] = new Uint16Array(4096); } secs[sy][li & 4095] = s; }
    let top = -1;
    for (let i = 0; i < n; i++) if (secs[i]) top = i;
    r.top = top; r.l = light(secs, top); r.cn = new Uint16Array(n);
    for (let i = 0; i < n; i++) r.cn[i] = conn.all(secs[i]);
    return r;
  }
  function genWorkerSrc() {
    return 'const GENF = ' + GENF.toString() + ';\nconst LIGHTF = ' + LIGHTF.toString() + ';\nconst CONNF = ' + CONNF.toString() + ';\nconst GENPOST = ' + GENPOST.toString() + ';\nlet G = null, LT = null, CN = null;\nonmessage = e => { const d = e.data; if (d.init) { G = GENF(d.ID, d.seed, d.type); LT = LIGHTF(d.LAT, d.LEM, d.NSEC, d.H); CN = CONNF(d.OPQ); return; } const r = GENPOST(G.gen(d.cx, d.cz), d.ed, LT, CN); const tr = [r.bio.buffer, r.hm.buffer, r.cn.buffer]; for (const s of r.secs) if (s) tr.push(s.buffer); for (const s of r.l) if (s) tr.push(s.buffer); postMessage({ cx: d.cx, cz: d.cz, gen: d.gen, r }, tr); };';
  }
  const edArr = k => { const ed = W.edits.get(k); if (!ed || !ed.size) return null; const a = new Uint32Array(ed.size); let i = 0; ed.forEach((s, li) => { a[i++] = li * 16384 + s; }); return a; };
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
        w.postMessage({ init: 1, ID: W.ID, seed: W.seed, type: W.type, LAT, LEM, OPQ, NSEC, H });
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
      best.w.postMessage({ cx, cz, gen: genEpoch, ed: edArr(k) });
    } else W.genQ.add(k);
  }
  function genSync(budget) {
    const t0 = performance.now();
    for (const k of W.genQ) {
      if (performance.now() - t0 > budget) break;
      W.genQ.delete(k);
      const c = W.cols.get(k); if (!c || c.st) continue;
      onGen(c.cx, c.cz, GENPOST(W.gen.gen(c.cx, c.cz), edArr(k), W.light, W.conn));
    }
  }
  function onGen(cx, cz, r) {
    const c = W.cols.get(ck(cx, cz));
    if (!c || c.st) return;
    c.s = r.secs; c.bio = r.bio; c.hm = r.hm;
    const ed = W.edits.get(ck(cx, cz));
    let stale = !r.l;
    if (ed) ed.forEach((s, li) => { const sy = li >> 12; let sec = c.s[sy]; if (!sec) { if (!s) return; sec = c.s[sy] = new Uint16Array(4096); } if (sec[li & 4095] !== s) { sec[li & 4095] = s; stale = true; } });
    if (stale) GENPOST(r, null, W.light, W.conn);
    c.top = r.top; c.l = r.l; c.cn = r.cn; c.st = 1;
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
  const NB4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
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
        if (!c || c.st < 2) continue;
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
  function stitchLight(c) {
    c.st = 2;
    if (!c.l) c.l = new Array(NSEC).fill(null);
    const x0 = c.cx * 16, z0 = c.cz * 16;
    for (let ch = 0; ch < 2; ch++) {
      for (let d = 0; d < 4; d++) {
        const dx = NB4[d][0], dz = NB4[d][1], n = colAt(c.cx + dx, c.cz + dz);
        if (!n || n.st < 2) continue;
        const ns = Math.min(NSEC - 1, Math.max(n.top, c.top) + 1);
        for (let s = 0; s <= ns; s++) {
          const la = c.l[s], lb = n.l ? n.l[s] : null;
          if (!la && !lb) continue;
          for (let k = 0; k < 16; k++) {
            const ax = dx ? (dx > 0 ? 15 : 0) : k, az = dz ? (dz > 0 ? 15 : 0) : k, bx = dx ? 15 - ax : k, bz = dz ? 15 - az : k, ia = ax | az << 4, ib = bx | bz << 4;
            for (let y = 0; y < 16; y++) {
              const A = la ? la[ia | y << 8] : 0xF0, B = lb ? lb[ib | y << 8] : 0xF0;
              if (A === B) continue;
              const a = ch ? A & 15 : A >> 4, b = ch ? B & 15 : B >> 4;
              if (a > b + 1) lpush(x0 + ax, s * 16 + y, z0 + az, 0);
              else if (b > a + 1) lpush(x0 + ax + dx, s * 16 + y, z0 + az + dz, 0);
            }
          }
        }
      }
      propagate(ch);
    }
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
    if (OPQ[old] !== OPQ[s]) { c.cd |= 1 << sy; W.cdq.add(c); W.visd = 2; }
    if (s && sy > c.top) { c.top = sy; if (c.l) for (let k = 0; k <= Math.min(NSEC - 1, sy + 1); k++) ensureLight(c, k); }
    const k = ck(x >> 4, z >> 4);
    let ed = W.edits.get(k);
    if (!ed) W.edits.set(k, ed = new Map());
    ed.set(li | sy << 12, s); ed.b = null;
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
