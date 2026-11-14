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
        for (let s = 0; s < NSEC; s++) {
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
  const AOV = [.38, .58, .78, 1], FAO = new Int16Array(72), FCC = new Uint8Array(72), FNO = new Int16Array(6), FSH = new Float32Array(24);
  FD.forEach((F, f) => { FNO[f] = F.no; for (let k = 0; k < 4; k++) for (let i = 0; i < 3; i++) { FAO[f * 12 + k * 3 + i] = F.ao[k][i]; FCC[f * 12 + k * 3 + i] = F.c[k][i]; } for (let a = 0; a < 4; a++) FSH[f * 4 + a] = AOV[a] * F.s * 255; });
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
  let FANCY = true, SMOOTH = true;
  const BIOC = [];
  function biomeColors() {
    if (BIOC.length) return;
    for (const b of W.gen.BIO) BIOC.push({ g: hx(b.g), f: hx(b.f), w: hx(b.w) });
  }
  let TPCOL = null;
  function fillPad(c, sy) {
    const cx = c.cx, cz = c.cz, tint = TPCOL !== c;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const n = colAt(cx + dx, cz + dz);
      const xa = dx < 0 ? 15 : 0, xb = dx > 0 ? 0 : 15, za = dz < 0 ? 15 : 0, zb = dz > 0 ? 0 : 15;
      for (let ly = -1; ly <= 16; ly++) {
        const Y = sy * 16 + ly, sec = Y >= 0 && Y < H && n ? n.s[Y >> 4] : null, la = Y >= 0 && Y < H && n && n.l ? n.l[Y >> 4] : null, yo = (Y & 15) << 8, bv = Y < 0 ? 1 : 0, lv = Y < 0 ? 0 : 0xF0;
        for (let z = za; z <= zb; z++) {
          const row = pof(dx * 16, ly, z + dz * 16), so = yo | z << 4;
          if (sec) for (let x = xa; x <= xb; x++) PB[row + x] = sec[so | x]; else for (let x = xa; x <= xb; x++) PB[row + x] = bv;
          if (la) for (let x = xa; x <= xb; x++) PL[row + x] = la[so | x]; else for (let x = xa; x <= xb; x++) PL[row + x] = lv;
        }
      }
      if (tint && n && n.bio) {
        biomeColors();
        for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) {
          const b = BIOC[n.bio[x | z << 4]] || BIOC[0], o = ((x + dx * 16 + 1) + (z + dz * 16 + 1) * PS) * 3;
          TGc[o] = b.g[0]; TGc[o + 1] = b.g[1]; TGc[o + 2] = b.g[2]; TFc[o] = b.f[0]; TFc[o + 1] = b.f[1]; TFc[o + 2] = b.f[2]; TWc[o] = b.w[0]; TWc[o + 1] = b.w[1]; TWc[o + 2] = b.w[2];
        }
      }
    }
    TPCOL = c;
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
    const L0 = PL[p + FNO[f]], sk0 = L0 >> 4, bl0 = L0 & 15, u0 = (t & 63) * TU, v0 = (t >> 6) * TU, u1 = u0 + TU, v1 = v0 + TU;
    const MP = M.p, MU = M.u, ML = M.l, MC = M.t, f4 = f * 4, R = UVR[rot & 3];
    let a0 = 0, a1 = 0, a2 = 0, a3 = 0, o = f * 12, nv = M.nv;
    for (let k = 0; k < 4; k++, o += 3, nv++) {
      const q1 = p + FAO[o], q2 = p + FAO[o + 1], o1 = OPQ[PB[q1]], o2 = OPQ[PB[q2]];
      let ao = 0, sk = sk0, bl = bl0, n = 1, L;
      if (!SMOOTH) ao = 3;
      else if (!o1) { L = PL[q1]; sk += L >> 4; bl += L & 15; n++; }
      if (SMOOTH && !o2) { L = PL[q2]; sk += L >> 4; bl += L & 15; n++; }
      if (SMOOTH && !(o1 && o2)) { const q3 = p + FAO[o + 2], o3 = OPQ[PB[q3]]; ao = 3 - o1 - o2 - o3; if (!o3) { L = PL[q3]; sk += L >> 4; bl += L & 15; n++; } }
      const ri = R[k], pp = nv * 3, qq = nv * 4;
      MP[pp] = x + FCC[o]; MP[pp + 1] = y + FCC[o + 1]; MP[pp + 2] = z + FCC[o + 2];
      MU[nv * 2] = ri === 0 || ri === 3 ? u0 : u1; MU[nv * 2 + 1] = ri < 2 ? v1 : v0;
      ML[qq] = FSH[f4 + ao]; ML[qq + 1] = sk * 17 / n; ML[qq + 2] = bl * 17 / n; ML[qq + 3] = fl;
      MC[qq] = TR; MC[qq + 1] = TG2; MC[qq + 2] = TB; MC[qq + 3] = 255;
      if (k === 0) a0 = ao; else if (k === 1) a1 = ao; else if (k === 2) a2 = ao; else a3 = ao;
    }
    M.nv = nv;
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
    const M = MO, Mt = MT;
    M.nv = M.ni = Mt.nv = Mt.ni = 0;
    const sec = c.s[sy];
    if (!sec) return;
    fillPad(c, sy);
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
          if (OPQ[PB[p + 1]] && OPQ[PB[p - 1]] && OPQ[PB[p + PSS]] && OPQ[PB[p - PSS]] && OPQ[PB[p + PS]] && OPQ[PB[p - PS]]) continue;
          const csm = CSM[s], tg = csm && TT[STT[s]].trans ? Mt : M, leaf = LEAF[s] && !FANCY, tk = TNT[s], fl = ANIMF[s] ? 1 : 0;
          let first = true;
          for (let f = 0; f < 6; f++) {
            const n = PB[p + FNO[f]];
            if (OPQ[n]) continue;
            if (csm && CSM[n] === csm) continue;
            if (leaf && LEAF[n]) continue;
            if (f === 3 && y === 0) continue;
            if (first) { first = false; grow(tg); if (tk) setTint(tk, lx, lz, s); else TR = TG2 = TB = 255; }
            let t = TIL[s * 6 + f];
            if (leaf && TILF[s] !== undefined) t = TILF[s];
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
  let REGOK = false;
  function* initRegistry() {
    if (REGOK) return;
    yield* finalizeBlocks();
    for (const t of TT) if (t.cmodel) { for (let k = 0; k < t.n; k++) cmodelTids(t.cmodel(t.base + k, 0)); yield; }
    REGOK = true;
  }
  async function run(root, api, keys, glc) {
    const { THREE, renderer } = glc, canvas = glc.canvas;
    const wrap = document.createElement('div');
    wrap.className = 'bc-wrap';
    canvas.removeAttribute('style'); canvas.className = 'bc-gl';
    const hud = cv(16, 16); hud.className = 'bc-hud';
    const inp = document.createElement('input');
    inp.className = 'bc-in'; inp.maxLength = 256; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.spellcheck = false; inp.hidden = true;
    wrap.append(canvas, hud, inp); root.append(wrap);
    const g = hud.getContext('2d');
    const bootMsg = p => { hud.width = 480; hud.height = 300; g.fillStyle = '#16181c'; g.fillRect(0, 0, 480, 300); g.fillStyle = '#2c313a'; g.fillRect(140, 158, 200, 6); g.fillStyle = '#6fbf4a'; g.fillRect(140, 158, 200 * p, 6); g.fillStyle = '#e8e8e8'; g.font = '14px sans-serif'; g.textAlign = 'center'; g.fillText('Preparing blocks...', 240, 146); };
    const slice = async (it, p0, p1, total) => {
      let t0 = performance.now(), n = 0;
      for (;;) {
        if (it.next().done) return true;
        n++;
        if (performance.now() - t0 > 7) { bootMsg(p0 + (p1 - p0) * Math.min(1, n / total)); await new Promise(res => setTimeout(res, 0)); if (!api.alive) return false; t0 = performance.now(); }
      }
    };
    bootMsg(0);
    if (!(await slice(initRegistry(), 0, .3, TT.length))) return null;
    let touch = false;
    try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) { }
    renderer.outputEncoding = THREE.LinearEncoding; renderer.toneMapping = THREE.NoToneMapping; renderer.shadowMap.enabled = false; renderer.autoClear = false; renderer.info.autoReset = false;
    let SV = api.load(); if (!SV || typeof SV !== 'object' || Array.isArray(SV)) SV = {};
    const s0 = SV.set && typeof SV.set === 'object' ? SV.set : {};
    const PRMAX = Math.max(.75, Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2)), PRMIN = Math.min(PRMAX, .75);
    let PRQ = clamp(+s0.pra || PRMAX, PRMIN, PRMAX);
    renderer.setPixelRatio(PRQ);
    const setPR = v => { v = clamp(Math.round(v * 4) / 4, PRMIN, PRMAX); if (v === PRQ) return false; PRQ = v; renderer.setPixelRatio(v); SET.pra = v; return true; };
    const SET = { rd: s0.rd ? clamp(s0.rd | 0, 2, 12) : 0, rda: s0.rda | 0, pra: PRQ, fancy: s0.fancy != null ? !!s0.fancy : !touch, fov: clamp(+s0.fov || CFG.FOV, 30, 110), sens: clamp(+s0.sens || 1, .1, 3), music: s0.music !== false, sound: s0.sound !== false, gam: s0.gam != null ? clamp(+s0.gam, 0, 1) : .5, clouds: s0.clouds != null ? s0.clouds !== false : !touch, bob: s0.bob !== false, gui: s0.gui | 0, smooth: s0.smooth !== false, particles: s0.particles != null ? s0.particles | 0 : 2 };
    const persistSet = () => { SV.set = SET; api.save(SV); };
    const AR = { min: touch ? 2 : 3, max: touch ? 6 : 8, lo: 0, hi: 0, cap: 99, capT: 0, f0: 0, r0: 0, noDown: false, js: 0, jn: 0, gap: false, pcap: 99, pcapT: 0 };
    let RD = SET.rd || clamp(SET.rda || (touch ? CFG.RD_TOUCH : CFG.RD), AR.min, AR.max), fogRD = RD;
    SMOOTH = SET.smooth;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(CFG.FOV, 1.6, .05, 1200);
    cam.rotation.order = 'YXZ';
    const hScene = new THREE.Scene(), hCam = new THREE.PerspectiveCamera(70, 1.6, .01, 10);
    const trash = [], keep = o => { trash.push(o); return o; };
    const tex = (c, rep, flip) => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = !!flip; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return keep(t); };
    const atlasC = cv(ATL, ATL), atlasG = atlasC.getContext('2d');
    const atlasImg = atlasG.createImageData(ATL, ATL);
    function putTile(t, d) { const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let y = 0; y < 16; y++) atlasImg.data.set(d.subarray(y * 64, y * 64 + 64), ((ty + y) * ATL + tx) * 4); }
    const bail = () => { for (const o of trash) { try { o.dispose(); } catch (e) { } } return null; };
    if (!(await slice((function* () {
      for (let i = 0; i < TEXN.length; i++) { putTile(i, get(TEXN[i])); yield; }
      for (let k = 0; k < ANIMS.length; k++) { const n = ANIMS[k], base = (ANIM_ROW0 + (k >> 2)) * 64 + (k & 3) * 16, fn = ANIMP[n]; for (let f = 0; f < 16; f++) putTile(base + f, fn ? fn(f) : get(n)); yield; }
    })(), .3, .65, TEXN.length + ANIMS.length))) return bail();
    atlasG.putImageData(atlasImg, 0, 0);
    const AVG = new Map();
    const tileAvg = t => { let a = AVG.get(t); if (a) return a; let r = 0, gg = 0, b = 0, n = 0; const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = ((ty + y) * ATL + tx + x) * 4; if (atlasImg.data[o + 3] > 100) { r += atlasImg.data[o]; gg += atlasImg.data[o + 1]; b += atlasImg.data[o + 2]; n++; } } a = n ? [r / n, gg / n, b / n] : [128, 128, 128]; AVG.set(t, a); return a; };
    const tilePx = t => { const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let k = 0; k < 8; k++) { const o = ((ty + ri(16)) * ATL + tx + ri(16)) * 4; if (atlasImg.data[o + 3] > 100) return [atlasImg.data[o], atlasImg.data[o + 1], atlasImg.data[o + 2]]; } return tileAvg(t); };
    const atlasTex = tex(atlasC, false, false);
    const U = { sky: { value: 1 }, gam: { value: SET.gam }, frame: { value: 0 }, fogC: { value: new THREE.Color() }, fogN: { value: 60 }, fogF: { value: 100 }, map: { value: atlasTex }, dark: { value: 0 } };
    const CVS = `attribute vec4 lgt; attribute vec4 tnt; varying vec2 vUv; varying vec4 vL; varying vec3 vT; varying float vD; uniform float uFrame;
      void main(){ vec2 uv = uv; float fl = floor(lgt.w * 255.0 + .5); if (mod(fl, 2.0) > .5) uv.x += uFrame * ${(16 / ATL).toFixed(6)}; vUv = uv; vL = lgt; vT = tnt.rgb; vec4 wp = modelMatrix * vec4(position, 1.0); vD = length(wp.xz - cameraPosition.xz); gl_Position = projectionMatrix * viewMatrix * wp; }`;
    const CFS = trans => `uniform sampler2D map; uniform float uSky; uniform float uGam; uniform vec3 fogC; uniform float fogN; uniform float fogF; uniform float uDark; varying vec2 vUv; varying vec4 vL; varying vec3 vT; varying float vD;
      void main(){ vec4 c = texture2D(map, vUv); ${trans ? 'if (c.a < .02) discard;' : 'if (c.a < .5) discard;'}
        float fl = floor(vL.w * 255.0 + .5); bool mk = abs(c.a - .9804) < .004; bool ta = mod(floor(fl / 2.0), 2.0) > .5;
        vec3 col = (mk || ta) ? c.rgb * vT : c.rgb;
        float sl = vL.y * uSky, bl = vL.z;
        vec3 Ls = vec3(sl / (4.0 - 3.0 * sl)) * mix(vec3(.55, .62, 1.0), vec3(1.0), clamp(uSky * 1.4 - .2, 0.0, 1.0));
        float lb = bl / (4.0 - 3.0 * bl); vec3 Lb = vec3(lb, lb * .9, lb * .76);
        vec3 L = max(Ls, Lb); L = mix(L, 1.0 - pow(1.0 - L, vec3(4.0)), uGam); L = L * (.94 - uDark * .3) + .06 * (1.0 - uDark);
        col *= vL.x * L;
        float ff = clamp((vD - fogN) / max(1.0, fogF - fogN), 0.0, 1.0);
        gl_FragColor = vec4(mix(col, fogC, ff), ${trans ? 'c.a' : '1.0'}); }`;
    const mkMat = trans => keep(new THREE.ShaderMaterial({ uniforms: { map: U.map, uSky: U.sky, uGam: U.gam, uFrame: U.frame, fogC: U.fogC, fogN: U.fogN, fogF: U.fogF, uDark: U.dark }, vertexShader: CVS, fragmentShader: CFS(trans), transparent: trans, depthWrite: !trans, side: trans ? THREE.DoubleSide : THREE.FrontSide }));
    const solidMat = mkMat(false), transMat = mkMat(true);
    const bright = (sk, bl) => { const s = sk / 15 * U.sky.value, b = bl / 15; let L = Math.max(s / (4 - 3 * s), b / (4 - 3 * b)); L = lerp(L, 1 - (1 - L) ** 4, U.gam.value); return L * .94 + .06; };
    const lightAt = (x, y, z) => getL(Math.floor(x), Math.floor(y), Math.floor(z));
    const brAt = (x, y, z) => { const L = lightAt(x, y, z); return bright(L >> 4, L & 15); };
    function buildGeo(M) {
      const gq = new THREE.BufferGeometry();
      const a1 = new THREE.BufferAttribute(M.p.slice(0, M.nv * 3), 3), a2 = new THREE.BufferAttribute(M.u.slice(0, M.nv * 2), 2), a3 = new THREE.BufferAttribute(M.l.slice(0, M.nv * 4), 4, true), a4 = new THREE.BufferAttribute(M.t.slice(0, M.nv * 4), 4, true);
      const free = function () { this.array = null; };
      for (const a of [a1, a2, a3, a4]) a.onUpload(free);
      gq.setAttribute('position', a1); gq.setAttribute('uv', a2); gq.setAttribute('lgt', a3); gq.setAttribute('tnt', a4);
      const ia = M.nv < 65536 ? new Uint16Array(M.i.subarray(0, M.ni)) : M.i.slice(0, M.ni);
      const ib = new THREE.BufferAttribute(ia, 1); ib.onUpload(free); gq.setIndex(ib);
      return gq;
    }
    function setSecMesh(c, sy) {
      const old = c.m[sy];
      if (old) { for (const k of ['o', 't']) if (old[k]) { scene.remove(old[k]); old[k].geometry.dispose(); } }
      c.m[sy] = null;
      if (!MO.nv && !MESHT.nv) return;
      const r = { o: null, t: null };
      for (const [k, M, mat, ro] of [['o', MO, solidMat, 0], ['t', MESHT, transMat, 1]]) {
        if (!M.nv) continue;
        const gq = buildGeo(M);
        gq.boundingSphere = new THREE.Sphere(new THREE.Vector3(8, sy * 16 + 8, 8), 14);
        const m = new THREE.Mesh(gq, mat);
        m.position.set(c.cx * 16, 0, c.cz * 16); m.matrixAutoUpdate = false; m.updateMatrix(); m.renderOrder = ro; m.visible = !!c.vs[sy];
        scene.add(m); r[k] = m;
      }
      c.m[sy] = r;
    }
    function unloadCol(c, k) { for (let s = 0; s < NSEC; s++) { const r = c.m[s]; if (r) for (const kk of ['o', 't']) if (r[kk]) { scene.remove(r[kk]); r[kk].geometry.dispose(); } } W.cols.delete(k); W.dirty.delete(c); W.cdq.delete(c); W.lastK = -1; if (c.meshed && W.visd < 1) W.visd = 1; }
    const skyU = { top: { value: new THREE.Color() }, fog: { value: new THREE.Color() }, glow: { value: new THREE.Color(1, .5, .2) }, glowA: { value: 0 }, sun: { value: new THREE.Vector3(1, 0, 0) }, day: { value: 1 }, rain: { value: 0 } };
    const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(500, 24, 12)), keep(new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 fog; uniform vec3 glow; uniform float glowA; uniform vec3 sun; uniform float day; uniform float rain; varying vec3 vP;
        void main(){ vec3 d = normalize(vP); float h = clamp(d.y * 2.6 + .04, 0.0, 1.0); vec3 c = mix(fog, top, h * h * (3.0 - 2.0 * h));
        float s = max(dot(normalize(d.xz + 1e-4), normalize(sun.xz + 1e-4)), 0.0);
        c = mix(c, glow, glowA * s * s * s * clamp(1.0 - abs(d.y - .06) * 3.0, 0.0, 1.0) * (1.0 - rain));
        if (d.y < -.05) c = mix(c, fog * .6, clamp(-d.y * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0); }`
    })));
    sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
    const sgeo = new THREE.BufferGeometry(), spos = [], scol = [], sr = rng(42);
    for (let i = 0; i < 1500; i++) { const u = sr() * 2 - 1, a = sr() * Math.PI * 2, r = Math.sqrt(1 - u * u), k = sr(), br2 = k < .06 ? 1 : .35 + k * .5; spos.push(Math.cos(a) * r * 400, u * 400, Math.sin(a) * r * 400); scol.push(br2, br2, br2); }
    sgeo.setAttribute('position', new THREE.Float32BufferAttribute(spos, 3)); sgeo.setAttribute('color', new THREE.Float32BufferAttribute(scol, 3));
    const starMat = keep(new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, vertexColors: true }));
    const stars = new THREE.Points(keep(sgeo), starMat); stars.frustumCulled = false;
    const sunC = cv(32, 32), sc2 = sunC.getContext('2d');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.max(Math.abs(x - 15.5), Math.abs(y - 15.5)); if (d > 15) continue; const c = d > 13 ? [255, 190, 80, .25] : d > 11 ? [255, 220, 120, .55] : d > 8 ? [255, 244, 170, 1] : [255, 255, 230, 1]; sc2.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`; sc2.fillRect(x, y, 1, 1); }
    const moonC = cv(32, 32), mc = moonC.getContext('2d');
    for (let y = 8; y < 24; y++) for (let x = 8; x < 24; x++) { const v = 200 + hash3(x >> 1, y >> 1, 9) * 40 - ((x - 8 + y - 8) > 18 ? 30 : 0) - (hash3(x >> 2, y >> 2, 10) > .75 ? 40 : 0); mc.fillStyle = `rgb(${v | 0},${v | 0},${v + 15 | 0})`; mc.fillRect(x, y, 1, 1); }
    const sunM = new THREE.Mesh(keep(new THREE.PlaneGeometry(90, 90)), keep(new THREE.MeshBasicMaterial({ map: tex(sunC), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
    const moonM = new THREE.Mesh(keep(new THREE.PlaneGeometry(60, 60)), keep(new THREE.MeshBasicMaterial({ map: tex(moonC), transparent: true, depthWrite: false, fog: false })));
    sunM.position.y = 380; sunM.rotation.x = Math.PI / 2; moonM.position.y = -380; moonM.rotation.x = -Math.PI / 2;
    const celest = new THREE.Group(); celest.add(stars, sunM, moonM); scene.add(celest);
    const cloudC = cv(256, 256), ccx = cloudC.getContext('2d'), cimg = ccx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = sn(x / 16, y / 16, 16, 1) * .6 + sn(x / 16, y / 16, 48, 2) * .4; if (v > .58) cimg.data.set([255, 255, 255, 255], (y * 256 + x) * 4); }
    ccx.putImageData(cimg, 0, 0);
    const cloudU = { map: { value: tex(cloudC, true, true) }, off: { value: new THREE.Vector2() }, col: { value: new THREE.Color(1, 1, 1) }, far: { value: 200 } };
    const cloudMat = keep(new THREE.ShaderMaterial({
      uniforms: cloudU, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      vertexShader: 'varying vec2 vW; varying float vY; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; vY = position.y; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform sampler2D map; uniform vec2 off; uniform vec3 col; uniform float far; varying vec2 vW; varying float vY; void main(){ float vD = length(vW - cameraPosition.xz); vec4 t = texture2D(map, (vW + off) / 3072.0); if (t.a < .5) discard; gl_FragColor = vec4(col * (vY > 0.5 ? 1.0 : .82), .8 * (1.0 - smoothstep(far * .55, far, vD))); }'
    }));
    const cloudG = new THREE.Group();
    const clouds = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 1, 0)), cloudMat);
    const clouds2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), cloudMat);
    clouds.scale.set(1600, 4, 1600); clouds2.scale.set(1600, 4, 1600); clouds.frustumCulled = clouds2.frustumCulled = false; clouds.renderOrder = clouds2.renderOrder = 2;
    cloudG.add(clouds, clouds2); scene.add(cloudG);
    const outline = new THREE.LineSegments(keep(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))), keep(new THREE.LineBasicMaterial({ color: 0, transparent: true, opacity: .45 })));
    const crackC = cv(160, 16), cg = crackC.getContext('2d'), segs = [];
    { const R = rng(77); for (let k = 0; k < 9; k++) { let x = 8, y = 8; const a = k / 9 * Math.PI * 2 + R() * .5; for (let s = 0; s < 10; s++) { const an = a + (R() - .5) * 1.3; x += Math.cos(an) * 1.05; y += Math.sin(an) * 1.05; segs.push([x | 0, y | 0, s]); } } }
    for (let st = 0; st < 10; st++) for (const [x, y, s] of segs) if (s <= st && x >= 0 && y >= 0 && x < 16 && y < 16) { cg.fillStyle = s % 3 ? 'rgba(0,0,0,.6)' : 'rgba(40,40,40,.5)'; cg.fillRect(st * 16 + x, y, 1, 1); }
    const crackTex = tex(crackC, false, true); crackTex.repeat.set(.1, 1);
    const crack = new THREE.Mesh(keep(new THREE.BoxGeometry(1.004, 1.004, 1.004)), keep(new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
    outline.visible = crack.visible = false; scene.add(outline, crack);
    const PNN = 600, pd = new Float32Array(PNN * 10), M4 = new THREE.Matrix4(), tc = new THREE.Color();
    const pm = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), keep(new THREE.MeshBasicMaterial({ toneMapped: false })), PNN);
    pm.frustumCulled = false; M4.makeScale(0, 0, 0);
    for (let i = 0; i < PNN; i++) { pm.setMatrixAt(i, M4); pm.setColorAt(i, tc.setRGB(1, 1, 1)); }
    scene.add(pm);
    let pNext = 0, pAlive = 0;
    function particle(x, y, z, vx, vy, vz, rgb, life, size, grav, emit) {
      if (!SET.particles && !emit) return;
      const k = pNext++ % PNN, o = k * 10, b = emit ? 1 : Math.max(brAt(x, y, z), brAt(x, y + 1, z), brAt(x + .7, y, z), brAt(x - .7, y, z), brAt(x, y, z + .7), brAt(x, y, z - .7));
      pd[o] = x; pd[o + 1] = y; pd[o + 2] = z; pd[o + 3] = vx; pd[o + 4] = vy; pd[o + 5] = vz; pd[o + 6] = life; pd[o + 7] = size; pd[o + 8] = grav; pd[o + 9] = life;
      pm.setColorAt(k, tc.setRGB(rgb[0] / 255 * b, rgb[1] / 255 * b, rgb[2] / 255 * b));
      pm.instanceColor.needsUpdate = true; pAlive = 2;
    }
    function burst(x, y, z, s, n, sp) {
      const t = TIL[s * 6 + 4] >= 0 ? TIL[s * 6 + 4] : MOD[s] && MOD[s][0] && MOD[s][0].f.find(Boolean) ? MOD[s][0].f.find(Boolean).tid : 0;
      const tk = TNT[s];
      for (let i = 0; i < n * (SET.particles === 1 ? .5 : 1); i++) {
        const c = tilePx(t), j = .85 + RNG() * .2;
        const tt = tk === 1 ? [140, 190, 90] : tk === 2 || tk === 6 ? [90, 160, 60] : [255, 255, 255];
        particle(x + RNG(), y + RNG(), z + RNG(), (RNG() - .5) * (sp || 3), RNG() * 3 + 1, (RNG() - .5) * (sp || 3), [c[0] * j * tt[0] / 255, c[1] * j * tt[1] / 255, c[2] * j * tt[2] / 255], .5 + RNG() * .6, .06 + RNG() * .07, 18);
      }
    }
    function updParticles(dt) {
      if (pAlive <= 0) return;
      pAlive -= dt;
      for (let k = 0; k < PNN; k++) {
        const o = k * 10;
        if (pd[o + 6] <= 0) continue;
        pd[o + 6] -= dt; pd[o + 4] -= pd[o + 8] * dt;
        const ny = pd[o + 1] + pd[o + 4] * dt;
        if (pd[o + 8] > 0 && solidAt(Math.floor(pd[o]), Math.floor(ny - .03), Math.floor(pd[o + 2]))) { pd[o + 4] = 0; pd[o + 3] *= .6; pd[o + 5] *= .6; } else pd[o + 1] = ny;
        pd[o] += pd[o + 3] * dt; pd[o + 2] += pd[o + 5] * dt;
        const s = pd[o + 6] > 0 ? pd[o + 7] * Math.min(1, pd[o + 6] * 5) : 0;
        M4.makeScale(s, s, s).setPosition(pd[o], pd[o + 1], pd[o + 2]); pm.setMatrixAt(k, M4);
        pAlive = 2;
      }
      pm.instanceMatrix.needsUpdate = true;
    }
    const geoCache = new Map();
    function blockGeom(s, size, tmp) {
      const key = s * 100 + Math.round(size * 50);
      if (geoCache.has(key)) return geoCache.get(key);
      PB.fill(0); PL.fill(0xF0); TGc.fill(0); TFc.fill(0); TWc.fill(0); TPCOL = null;
      biomeColors(); for (let i = 0; i < PSS; i++) { const b = BIOC[0]; TGc.set(b.g, i * 3); TFc.set(b.f, i * 3); TWc.set(b.w, i * 3); }
      const p = pof(0, 0, 0);
      PB[p] = s;
      MO.nv = MO.ni = MESHT.nv = MESHT.ni = 0;
      const shp = SHP[s];
      let SRC = MO;
      if (shp === 1) { grow(MO); for (let f = 0; f < 6; f++) { const tk = TNT[s]; if (tk) setTint(tk, 0, 0, s); else TR = TG2 = TB = 255; const t = !FANCY && LEAF[s] && TILF[s] !== undefined ? TILF[s] : TIL[s * 6 + f]; cubeFace(MO, s, f, 0, 0, 0, p, t, TRT[s * 6 + f], ANIMF[s] ? 1 : 0); } }
      else if (shp === 2 || shp === 3) { if (TNT[s]) setTint(TNT[s], 0, 0, s); else TR = TG2 = TB = 255; grow(MO); crossQuads(MO, TIL[s * 6], 0, 0, 0, 0xF0, 0, 0, shp === 3, 0, 230, 1); }
      else if (shp === 5) { grow(MO); grow(MESHT); modelBoxes(MO, MO, MOD[s], s, 0, 0, 0, p, TNT[s]); }
      else if (shp === 6) { grow(MO); grow(MESHT); modelBoxes(MO, MO, cmodelFor(s, () => 0), s, 0, 0, 0, p, TNT[s]); }
      else if (shp === 4) { liquid(MO, s, 0, 0, 0, p, 0, 0); if (MESHT.nv) SRC = MESHT; }
      const pos = SRC.p.slice(0, SRC.nv * 3);
      for (let i = 0; i < pos.length; i += 3) { pos[i] = (pos[i] - .5) * size; pos[i + 1] = (pos[i + 1] - .5) * size; pos[i + 2] = (pos[i + 2] - .5) * size; }
      const gq = new THREE.BufferGeometry();
      gq.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.BufferAttribute(SRC.u.slice(0, SRC.nv * 2), 2));
      const col = new Float32Array(SRC.nv * 3);
      for (let i = 0; i < SRC.nv; i++) { const sh = SRC.l[i * 4] / 255; col[i * 3] = sh * SRC.t[i * 4] / 255; col[i * 3 + 1] = sh * SRC.t[i * 4 + 1] / 255; col[i * 3 + 2] = sh * SRC.t[i * 4 + 2] / 255; }
      gq.setAttribute('color', new THREE.BufferAttribute(col, 3));
      gq.setIndex(new THREE.BufferAttribute(SRC.i.slice(0, SRC.ni), 1));
      gq.computeBoundingSphere();
      if (!tmp) geoCache.set(key, keep(gq));
      return gq;
    }
    const ITA = cv(1024, 1024), itaG = ITA.getContext('2d'), itaImg = itaG.createImageData(1024, 1024), ITIDX = new Map();
    function itemSpriteData(it) {
      const t = it.block ? TN[it.block] : null;
      let d = null;
      if (it.tex) d = get(it.tex);
      else if (t && t.icon && !t.icon3) d = get(t.icon);
      else if (t && (t.shape === 'cross' || t.shape === 'crop')) d = get(typeof t.tex === 'string' ? t.tex : 'missing');
      if (!d) return null;
      if (it.tintC || it.eggC || (t && t.tint)) {
        d = new Uint8ClampedArray(d);
        const tc2 = it.tintC ? DYE[it.tintC] : t && (t.tint === 1 || t.tint === 2) ? [124, 189, 75] : t && t.tint === 7 ? [32, 128, 48] : t && t.tint === 8 ? [100, 180, 50] : null;
        for (let i = 0; i < 1024; i += 4) {
          if (!d[i + 3]) continue;
          if (it.eggC) { const l = d[i] / 255, c = l > .5 ? it.eggC[0] : it.eggC[1], k = l > .5 ? .75 + l * .3 : 1; d[i] = Math.min(255, c[0] * k); d[i + 1] = Math.min(255, c[1] * k); d[i + 2] = Math.min(255, c[2] * k); }
          else if (tc2) { d[i] = d[i] * tc2[0] / 255; d[i + 1] = d[i + 1] * tc2[1] / 255; d[i + 2] = d[i + 2] * tc2[2] / 255; if (d[i + 3] === 250) d[i + 3] = 255; }
        }
      }
      return d;
    }
    let itaN = 0;
    const flatIt = new Uint8Array(IT.length);
    if (!(await slice((function* () {
      for (const it of IT) {
        yield;
        const d = itemSpriteData(it);
        if (!d) continue;
        flatIt[it.idx] = 1;
        const k = itaN++, ox = (k & 63) * 16, oy = (k >> 6) * 16;
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = (y * 16 + x) * 4, q = ((oy + y) * 1024 + ox + x) * 4; itaImg.data[q] = d[o]; itaImg.data[q + 1] = d[o + 1]; itaImg.data[q + 2] = d[o + 2]; itaImg.data[q + 3] = d[o + 3] > 127 ? 255 : 0; }
        ITIDX.set(it.idx, k);
      }
    })(), .65, 1, IT.length))) return bail();
    itaG.putImageData(itaImg, 0, 0);
    g.textAlign = 'start';
    const itemTex = tex(ITA, false, false);
    function itemGeom(id, s) {
      const key = -(id * 100 + Math.round(s * 50) + 1);
      if (geoCache.has(key)) return geoCache.get(key);
      const k = ITIDX.get(id), cx = (k & 63) * 16, cy = (k >> 6) * 16, q = s / 16, hh = q * .5, pos = [], uvs = [], cols = [], ix = [];
      const solid = (i, j) => i >= 0 && j >= 0 && i < 16 && j < 16 && itaImg.data[((cy + j) * 1024 + cx + i) * 4 + 3] > 127;
      const u0 = cx / 1024, v0 = cy / 1024, du = 16 / 1024, hs = s / 2;
      const quad = (pts, u, v, kk) => { const n = pos.length / 3; for (let i = 0; i < 4; i++) { pos.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]); uvs.push(u[i], v[i]); cols.push(kk, kk, kk); } ix.push(n, n + 1, n + 2, n, n + 2, n + 3); };
      quad([-hs, -hs, hh, hs, -hs, hh, hs, hs, hh, -hs, hs, hh], [u0, u0 + du, u0 + du, u0], [v0 + du, v0 + du, v0, v0], 1);
      quad([hs, -hs, -hh, -hs, -hs, -hh, -hs, hs, -hh, hs, hs, -hh], [u0 + du, u0, u0, u0 + du], [v0 + du, v0 + du, v0, v0], .8);
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        if (!solid(i, j)) continue;
        const xl = (i - 8) * q, xr = xl + q, yt = (8 - j) * q, yb = yt - q, u = (cx + i + .5) / 1024, v = (cy + j + .5) / 1024, u4 = [u, u, u, u], v4 = [v, v, v, v];
        if (!solid(i - 1, j)) quad([xl, yb, -hh, xl, yb, hh, xl, yt, hh, xl, yt, -hh], u4, v4, .7);
        if (!solid(i + 1, j)) quad([xr, yb, hh, xr, yb, -hh, xr, yt, -hh, xr, yt, hh], u4, v4, .7);
        if (!solid(i, j - 1)) quad([xl, yt, hh, xr, yt, hh, xr, yt, -hh, xl, yt, -hh], u4, v4, .94);
        if (!solid(i, j + 1)) quad([xl, yb, -hh, xr, yb, -hh, xr, yb, hh, xl, yb, hh], u4, v4, .58);
      }
      const gq = new THREE.BufferGeometry();
      gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); gq.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gq.setIndex(ix);
      gq.computeBoundingSphere();
      geoCache.set(key, keep(gq));
      return gq;
    }
    const blockMatE = keep(new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: .5, toneMapped: false }));
    const itemMatE = keep(new THREE.MeshBasicMaterial({ map: itemTex, vertexColors: true, alphaTest: .5, toneMapped: false, side: THREE.DoubleSide }));
    function iconS(t) { let s = t.base + (t.iconState || 0); if (t.pk.facing !== undefined && t.props[t.pk.facing][1].includes('south')) s = sw(s, 'facing', 'south'); return s; }
    const isFlat = id => !!flatIt[id] || !IT[id].block;
    function itemMesh(id, size) {
      const it = IT[id];
      if (isFlat(id)) return new THREE.Mesh(itemGeom(id, size * 1.4), itemMatE.clone());
      return new THREE.Mesh(blockGeom(iconS(TN[it.block]), size), blockMatE.clone());
    }
    const ICS = 32, ICN = 48, ICON = cv(ICS * ICN, ICS * Math.ceil(IT.length / ICN)), icG = ICON.getContext('2d');
    icG.imageSmoothingEnabled = false;
    let icI = 0;
    const icT = cv(16, 16), icTg = icT.getContext('2d'), icQ = [], icS = ICS / 1.64, icO = { x: 0, y: 0 };
    icTg.imageSmoothingEnabled = false;
    const icP = (P, i) => { const x = P[i], y = P[i + 1], z = P[i + 2]; icO.x = ((x - z) * .7071 / .82 * .5 + .5) * ICS; icO.y = (.5 - (-.3541 * x + .8656 * y - .3541 * z) / .82 * .5) * ICS; };
    function iconDraw(gq, ox, oy) {
      const P = gq.attributes.position.array, U = gq.attributes.uv.array, C = gq.attributes.color.array, nq = P.length / 12 | 0;
      icQ.length = 0;
      for (let q = 0; q < nq; q++) { let d = 0; for (let k = 0; k < 4; k++) { const i = (q * 4 + k) * 3; d += P[i] * .6121 + P[i + 1] * .5008 + P[i + 2] * .6121; } icQ.push([d, q]); }
      icQ.sort((a, b) => a[0] - b[0]);
      icG.save();
      icG.beginPath(); icG.rect(ox, oy, ICS, ICS); icG.clip();
      for (let n = 0; n < icQ.length; n++) {
        const q = icQ[n][1], v = q * 4, u0 = U[v * 2] * ATL, w0 = U[v * 2 + 1] * ATL, e1x = U[v * 2 + 2] * ATL - u0, e1y = U[v * 2 + 3] * ATL - w0, e2x = U[v * 2 + 6] * ATL - u0, e2y = U[v * 2 + 7] * ATL - w0, det = e1x * e2y - e2x * e1y;
        if (Math.abs(det) < 1e-6) continue;
        icP(P, v * 3); const p0x = icO.x, p0y = icO.y;
        icP(P, v * 3 + 3); const d1x = icO.x - p0x, d1y = icO.y - p0y;
        icP(P, v * 3 + 9); const d2x = icO.x - p0x, d2y = icO.y - p0y;
        if (Math.abs(d1x * d2y - d2x * d1y) < .01) continue;
        const a = (d1x * e2y - d2x * e1y) / det, c = (d2x * e1x - d1x * e2x) / det, b = (d1y * e2y - d2y * e1y) / det, d = (d2y * e1x - d1y * e2x) / det;
        let sx = Math.min(u0, u0 + e1x, u0 + e2x, u0 + e1x + e2x), sy = Math.min(w0, w0 + e1y, w0 + e2y, w0 + e1y + e2y), sw = Math.max(u0, u0 + e1x, u0 + e2x, u0 + e1x + e2x) - sx, sh = Math.max(w0, w0 + e1y, w0 + e2y, w0 + e1y + e2y) - sy;
        if (sw < .01 || sh < .01 || sw > 16.01 || sh > 16.01) continue;
        const cr = Math.min(255, C[v * 3] * 255) | 0, cg2 = Math.min(255, C[v * 3 + 1] * 255) | 0, cb = Math.min(255, C[v * 3 + 2] * 255) | 0;
        icTg.globalCompositeOperation = 'copy'; icTg.drawImage(atlasC, sx, sy, sw, sh, 0, 0, sw, sh);
        if (cr < 252 || cg2 < 252 || cb < 252) {
          icTg.globalCompositeOperation = 'multiply'; icTg.fillStyle = 'rgb(' + cr + ',' + cg2 + ',' + cb + ')'; icTg.fillRect(0, 0, sw, sh);
          icTg.globalCompositeOperation = 'destination-in'; icTg.drawImage(atlasC, sx, sy, sw, sh, 0, 0, sw, sh);
        }
        icG.setTransform(a, b, c, d, ox + p0x - (a * u0 + c * w0), oy + p0y - (b * u0 + d * w0));
        icG.drawImage(icT, 0, 0, sw, sh, sx, sy, sw, sh);
      }
      icG.restore();
      icG.setTransform(1, 0, 0, 1, 0, 0);
    }
    function iconStep(ms) {
      const t0 = performance.now();
      let n = 0;
      while (icI < IT.length && (n < 1 || performance.now() - t0 < ms)) {
        const it = IT[icI], col = icI % ICN, row = icI / ICN | 0, k = ITIDX.get(it.idx);
        if (k !== undefined) icG.drawImage(ITA, (k & 63) * 16, (k >> 6) * 16, 16, 16, col * ICS, row * ICS, ICS, ICS);
        else if (it.block) { const s = iconS(TN[it.block]), own = !geoCache.has(s * 100 + 50), gq = blockGeom(s, 1, true); iconDraw(gq, col * ICS, row * ICS); if (own) gq.dispose(); }
        icI++; n++;
      }
    }
    const BIPED = (arms, legs, tw, th, layers, slim) => {
      const aw = slim ? 3 : arms;
      const P = [
        { n: 'body', pv: [0, 0, 0], b: [[-4, 0, -2, 8, 12, 4, 16, 16]].concat(layers ? [[-4, 0, -2, 8, 12, 4, 16, 32, .25]] : []) },
        { n: 'head', pv: [0, 0, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0], [-4, -8, -4, 8, 8, 8, 32, 0, .5]] },
        { n: 'rarm', pv: [-5, 2, 0], b: [[arms === 2 ? -1 : -aw + 1 - (slim ? 0 : 0) - (arms === 2 ? 0 : 2), -2, arms === 2 ? -1 : -2, arms === 2 ? 2 : aw, 12, arms === 2 ? 2 : 4, 40, 16]].concat(layers ? [[-aw + 1 - 2, -2, -2, aw, 12, 4, 40, 32, .25]] : []) },
        { n: 'larm', pv: [5, 2, 0], b: [[-1, -2, arms === 2 ? -1 : -2, arms === 2 ? 2 : aw, 12, arms === 2 ? 2 : 4, th === 64 && layers !== 2 ? 32 : 40, th === 64 && layers !== 2 ? 48 : 16, 0, th !== 64]].concat(layers ? [[-1, -2, -2, aw, 12, 4, 48, 48, .25]] : []) },
        { n: 'rleg', pv: [legs === 2 ? -2 : -1.9, 12, 0], b: [[legs === 2 ? -1 : -2, 0, legs === 2 ? -1 : -2, legs === 2 ? 2 : 4, 12, legs === 2 ? 2 : 4, 0, 16]].concat(layers ? [[-2, 0, -2, 4, 12, 4, 0, 32, .25]] : []) },
        { n: 'lleg', pv: [legs === 2 ? 2 : 1.9, 12, 0], b: [[legs === 2 ? -1 : -2, 0, legs === 2 ? -1 : -2, legs === 2 ? 2 : 4, 12, legs === 2 ? 2 : 4, th === 64 && layers !== 2 ? 16 : 0, th === 64 && layers !== 2 ? 48 : 16, 0, th !== 64]].concat(layers ? [[-2, 0, -2, 4, 12, 4, 0, 48, .25]] : []) }
      ];
      return { tw, th, parts: P, y0: 24 };
    };
    const MDL = {
      pig: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 12, -6], b: [[-4, -4, -8, 8, 8, 8, 0, 0], [-2, 0, -9, 4, 3, 1, 16, 16]] }, { n: 'body', pv: [0, 11, 2], r: [Math.PI / 2, 0, 0], b: [[-5, -10, -7, 10, 16, 8, 28, 8]] }, { n: 'leg0', pv: [-3, 18, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg1', pv: [3, 18, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg2', pv: [-3, 18, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg3', pv: [3, 18, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }] },
      cow: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 4, -8], b: [[-4, -4, -6, 8, 8, 6, 0, 0], [-5, -5, -4, 1, 3, 1, 22, 0], [4, -5, -4, 1, 3, 1, 22, 0]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-6, -10, -7, 12, 18, 10, 18, 4], [-2, 2, -8, 4, 6, 1, 52, 0]] }, { n: 'leg0', pv: [-4, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg1', pv: [4, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg2', pv: [-4, 12, -6], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg3', pv: [4, 12, -6], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }] },
      sheep: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, -8], b: [[-3, -4, -6, 6, 6, 8, 0, 0]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-4, -10, -7, 8, 16, 6, 28, 8]] }, { n: 'leg0', pv: [-3, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg1', pv: [3, 12, 7], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg2', pv: [-3, 12, -5], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }, { n: 'leg3', pv: [3, 12, -5], b: [[-2, 0, -2, 4, 12, 4, 0, 16]] }] },
      sheep_wool: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, -8], b: [[-3, -4, -4, 6, 6, 6, 0, 0, .6]] }, { n: 'body', pv: [0, 5, 2], r: [Math.PI / 2, 0, 0], b: [[-4, -10, -7, 8, 16, 6, 28, 8, 1.75]] }, { n: 'leg0', pv: [-3, 12, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg1', pv: [3, 12, 7], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg2', pv: [-3, 12, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }, { n: 'leg3', pv: [3, 12, -5], b: [[-2, 0, -2, 4, 6, 4, 0, 16, .5]] }] },
      chicken: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 15, -4], b: [[-2, -6, -2, 4, 6, 3, 0, 0], [-2, -4, -4, 4, 2, 2, 14, 0], [-1, -2, -3, 2, 2, 2, 14, 4]] }, { n: 'body', pv: [0, 16, 0], r: [Math.PI / 2, 0, 0], b: [[-3, -4, -3, 6, 8, 6, 0, 9]] }, { n: 'leg0', pv: [-2, 19, 1], b: [[-1, 0, -3, 3, 5, 3, 26, 0]] }, { n: 'leg1', pv: [1, 19, 1], b: [[-1, 0, -3, 3, 5, 3, 26, 0]] }, { n: 'wing0', pv: [-4, 13, 0], b: [[0, 0, -3, 1, 4, 6, 24, 13]] }, { n: 'wing1', pv: [4, 13, 0], b: [[-1, 0, -3, 1, 4, 6, 24, 13]] }] },
      creeper: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 6, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0]] }, { n: 'body', pv: [0, 6, 0], b: [[-4, 0, -2, 8, 12, 4, 16, 16]] }, { n: 'leg0', pv: [-2, 18, 4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg1', pv: [2, 18, 4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg2', pv: [-2, 18, -4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }, { n: 'leg3', pv: [2, 18, -4], b: [[-2, 0, -2, 4, 6, 4, 0, 16]] }] },
      spider: { tw: 64, th: 32, parts: [{ n: 'head', pv: [0, 15, -3], b: [[-4, -4, -8, 8, 8, 8, 32, 4]] }, { n: 'neck', pv: [0, 15, 0], b: [[-3, -3, -3, 6, 6, 6, 0, 0]] }, { n: 'body', pv: [0, 15, 9], b: [[-5, -4, -6, 10, 8, 12, 0, 12]] }].concat([0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ n: 'leg' + i, pv: [i & 1 ? 4 : -4, 15, 2 - (i >> 1)], b: [[i & 1 ? -1 : -15, -1, -1, 16, 2, 2, 18, 0]] }))) },
      enderman: { tw: 64, th: 32, y0: 24, parts: [{ n: 'body', pv: [0, -14, 0], b: [[-4, 0, -2, 8, 12, 4, 32, 16]] }, { n: 'head', pv: [0, -14, 0], b: [[-4, -8, -4, 8, 8, 8, 0, 0]] }, { n: 'rarm', pv: [-3, -12, 0], b: [[-1, -2, -1, 2, 30, 2, 56, 0]] }, { n: 'larm', pv: [5, -12, 0], b: [[-1, -2, -1, 2, 30, 2, 56, 0, 0, 1]] }, { n: 'rleg', pv: [-2, -2, 0], b: [[-1, 0, -1, 2, 30, 2, 56, 0]] }, { n: 'lleg', pv: [2, -2, 0], b: [[-1, 0, -1, 2, 30, 2, 56, 0, 0, 1]] }] },
      slime: { tw: 64, th: 32, parts: [{ n: 'body', pv: [0, 16, 0], b: [[-3, 3, -3, 6, 6, 6, 0, 16], [-3.3, 1, -3.5, 2, 2, 2, 32, 0], [1.3, 1, -3.5, 2, 2, 2, 32, 4], [0, 5, -3.5, 1, 1, 1, 32, 8]] }, { n: 'outer', pv: [0, 16, 0], b: [[-4, 0, -4, 8, 8, 8, 0, 0]] }] },
      zombie: BIPED(4, 4, 64, 64, 1), skeleton: BIPED(2, 2, 64, 32, 0), steve: BIPED(4, 4, 64, 64, 2), alex: BIPED(4, 4, 64, 64, 2, 1)
    };
    MDL.skeleton.parts[2].b = [[-1, -2, -1, 2, 12, 2, 40, 16]]; MDL.skeleton.parts[3].b = [[-1, -2, -1, 2, 12, 2, 40, 16, 0, 1]];
    MDL.skeleton.parts[4].b = [[-1, 0, -1, 2, 12, 2, 0, 16]]; MDL.skeleton.parts[5].b = [[-1, 0, -1, 2, 12, 2, 0, 16, 0, 1]];
    MDL.zombie.parts[2].b = [[-3, -2, -2, 4, 12, 4, 40, 16]]; MDL.zombie.parts[3].b = [[-1, -2, -2, 4, 12, 4, 32, 48]];
    MDL.zombie.parts[4].b = [[-2, 0, -2, 4, 12, 4, 0, 16]]; MDL.zombie.parts[5].b = [[-2, 0, -2, 4, 12, 4, 16, 48]];
    MDL.zombie.parts[0].b = [[-4, 0, -2, 8, 12, 4, 16, 16]];
    for (const k of ['steve', 'alex']) { const sl = k === 'alex', aw = sl ? 3 : 4; MDL[k].parts[2].b = [[-aw + 1, -2, -2, aw, 12, 4, 40, 16], [-aw + 1, -2, -2, aw, 12, 4, 40, 32, .25]]; MDL[k].parts[3].b = [[-1, -2, -2, aw, 12, 4, 32, 48], [-1, -2, -2, aw, 12, 4, 48, 48, .25]]; MDL[k].parts[5].b = [[-2, 0, -2, 4, 12, 4, 16, 48], [-2, 0, -2, 4, 12, 4, 0, 48, .25]]; MDL[k].parts[2].pv = [-5, sl ? 2.5 : 2, 0]; MDL[k].parts[3].pv = [5, sl ? 2.5 : 2, 0]; }
    function boxGeo(B, tw, th, PZ) {
      const [x0, y0, z0, w, h, d, u, v, inf, mir] = B, I2 = inf || 0;
      const X0 = -(x0 - I2), X1 = -(x0 + w + I2), Y0 = -(y0 - I2), Y1 = -(y0 + h + I2), Z0 = z0 - I2, Z1 = z0 + d + I2;
      const xa = Math.min(X0, X1), xb = Math.max(X0, X1), ya = Math.min(Y0, Y1), yb = Math.max(Y0, Y1);
      const pos = [], uv = [], col = [];
      const R = (uu, vv, ww, hh) => [uu / tw, vv / th, (uu + ww) / tw, (vv + hh) / th];
      const faces = [
        [[xb, ya, Z1], [xb, ya, Z0], [xb, yb, Z0], [xb, yb, Z1], R(u, v + d, d, h), .76],
        [[xa, ya, Z0], [xa, ya, Z1], [xa, yb, Z1], [xa, yb, Z0], R(u + d + w, v + d, d, h), .76],
        [[xb, yb, Z0], [xa, yb, Z0], [xa, yb, Z1], [xb, yb, Z1], R(u + d, v, w, d), 1],
        [[xb, ya, Z1], [xa, ya, Z1], [xa, ya, Z0], [xb, ya, Z0], R(u + d + w, v, w, d), .5],
        [[xa, ya, Z1], [xb, ya, Z1], [xb, yb, Z1], [xa, yb, Z1], R(u + 2 * d + w, v + d, w, h), .82],
        [[xb, ya, Z0], [xa, ya, Z0], [xa, yb, Z0], [xb, yb, Z0], R(u + d, v + d, w, h), .9]
      ];
      if (mir) { const t = faces[0][4]; faces[0][4] = faces[1][4]; faces[1][4] = t; for (const f of faces) { const r = f[4]; f[4] = [r[2], r[1], r[0], r[3]]; } }
      for (const [a, b, c, dd, r, sh] of faces) {
        for (const p of [a, b, c, a, c, dd]) pos.push(p[0] / 16, p[1] / 16, p[2] / 16);
        const top = r[1], bot = r[3], l = r[0], rr2 = r[2];
        const isTop = sh === 1 || sh === .5;
        const UVs = isTop ? [[l, bot], [rr2, bot], [rr2, top], [l, top]] : [[l, bot], [rr2, bot], [rr2, top], [l, top]];
        const o = [0, 1, 2, 0, 2, 3];
        for (const k of o) uv.push(UVs[k][0], 1 - UVs[k][1]);
        for (let k = 0; k < 6; k++) col.push(sh, sh, sh);
      }
      return { pos, uv, col };
    }
    function buildModel(name) {
      const M = MDL[name], geo = {};
      for (const p of M.parts) {
        const pos = [], uv = [], col = [];
        for (const B of p.b) { const g2 = boxGeo(B, M.tw, M.th); pos.push(...g2.pos); uv.push(...g2.uv); col.push(...g2.col); }
        const gq = new THREE.BufferGeometry();
        gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gq.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        gq.computeBoundingSphere();
        geo[p.n] = keep(gq);
      }
      return geo;
    }
    const MGEO = {};
    function instModel(name, mat) {
      const M = MDL[name], geo = MGEO[name] || (MGEO[name] = buildModel(name)), root = new THREE.Group(), parts = {};
      const y0 = M.y0 ?? 24;
      for (const p of M.parts) {
        const piv = new THREE.Group(), m = new THREE.Mesh(geo[p.n], mat);
        piv.position.set(-p.pv[0] / 16, (y0 - p.pv[1]) / 16, p.pv[2] / 16);
        if (p.r) piv.rotation.set(-p.r[0], -p.r[1], p.r[2]);
        piv.userData.r0 = p.r ? [-p.r[0], -p.r[1], p.r[2]] : [0, 0, 0];
        piv.add(m); root.add(piv); parts[p.n] = piv;
      }
      return { root, parts };
    }
    const SKINS = {};
    const SKC = (t, f) => { const c = cv(64, MDL[t] ? MDL[t].th : 64), x = c.getContext('2d'); f(x, c); return tex(c, false, false); };
    function paintSkin(name, painter, th) {
      const M = MDL[name.split(':')[0]] || MDL[name], c = cv(M.tw, th || M.th), x = c.getContext('2d');
      const R = rng(hstr(name));
      const FS = { top: 1.05, bottom: .7, front: 1, back: .9, r: .94, l: .9 };
      for (const p of M.parts) for (const B of p.b) {
        const [, , , w, h, d, u, v] = B;
        const rects = { r: [u, v + d, d, h], front: [u + d, v + d, w, h], l: [u + d + w, v + d, d, h], back: [u + 2 * d + w, v + d, w, h], top: [u + d, v, w, d], bottom: [u + d + w, v, w, d] };
        for (const f in rects) { const [rx, ry, rw, rh] = rects[f]; for (let py = 0; py < rh; py++) for (let px = 0; px < rw; px++) { const cc = painter(p.n, f, px, py, rw, rh, B); if (!cc) continue; const k = cc[3] === 2 ? 1 : FS[f] * (.96 + R() * .06); x.fillStyle = cc[3] === 0 ? 'rgba(0,0,0,0)' : `rgb(${Math.min(255, cc[0] * k) | 0},${Math.min(255, cc[1] * k) | 0},${Math.min(255, cc[2] * k) | 0})`; x.fillRect(rx + px, ry + py, 1, 1); } }
      }
      return c;
    }
    const mk = (cc, k) => [cc[0] * k, cc[1] * k, cc[2] * k];
    const vn2 = (px, py, p, s) => sn(px * 16 / p, py * 16 / p, 1, s);
    const PAINTERS = {
      pig: (part, f, px, py, fw, fh, B) => {
        const PINK = [240, 164, 164], PINKD = [214, 128, 134], PINKL = [250, 192, 190], h = hash3(px, py, f.length * 17 + part.length);
        if (part === 'head' && B[3] === 4) { if (f === 'front') return py === 1 && (px === 1 || px === 2) ? [110, 50, 56, 2] : mk([236, 140, 146], py === 0 ? 1.06 : .96); return mk([232, 136, 142], .94 + h * .06); }
        if (part === 'head') { if (f === 'front') { if (py === 3 && (px === 1 || px === 6)) return [240, 240, 244, 2]; if (py === 3 && (px === 2 || px === 5)) return [26, 18, 28, 2]; if (py === 2 && (px === 1 || px === 2 || px === 5 || px === 6)) return mk(PINKD, .98); if (py === 7) return mk(PINKD, .96); return mk(PINK, .96 + h * .07); } return mk(PINK, .93 + h * .08); }
        if (part.startsWith('leg')) { if (f === 'bottom') return [118, 78, 70]; if (py >= fh - 2) return mk([126, 82, 76], py === fh - 1 ? .9 : 1.04); return mk(PINK, .95 + h * .07); }
        if (f === 'bottom') return mk(PINKL, .92);
        return mk(vn2(px, py, 5, 21) > .7 ? PINKD : PINK, .95 + h * .06);
      },
      cow: (part, f, px, py, fw, fh, B) => {
        const BL = [62, 48, 42], WH = [236, 234, 228], PK = [226, 176, 164], h = hash3(px, py, f.length * 19 + part.length * 5);
        if (part === 'head' && B[3] === 1) return mk([226, 216, 190], py === 0 ? 1.1 : .94);
        if (part === 'head') { if (f === 'front') { if (py === 3 && (px === 1 || px === 6)) return [14, 12, 14, 2]; if (py === 3 && (px === 0 || px === 7)) return [244, 244, 240, 2]; if (py >= 5) return mk(PK, py === 6 && (px === 2 || px === 5) ? .7 : .96); if (px >= 3 && px <= 4) return mk(WH, .97); return mk(BL, .9 + h * .2); } if (f === 'top') return mk(px >= 3 && px <= 4 ? WH : BL, .95 + h * .12); if (f === 'bottom') return mk(PK, .85); return mk(py >= 4 ? WH : BL, .92 + h * .12); }
        if (part === 'body' && B[4] === 6) return mk([238, 170, 168], .9 + h * .08);
        if (part.startsWith('leg')) { if (f === 'bottom') return [34, 28, 26]; if (py >= fh - 2) return mk([46, 38, 34], py === fh - 1 ? .8 : 1); return mk(vn2(px + part.length * 3, py, 4, 31) > .55 ? WH : BL, .94 + h * .1); }
        const wh = vn2(px + (f === 'back' ? 11 : f === 'l' ? 7 : f === 'r' ? 19 : f === 'top' ? 3 : 0), py, 5, 32) > .52;
        return wh ? mk(WH, .94 + h * .08) : mk(BL, .88 + h * .2);
      },
      sheep: (part, f, px, py, fw, fh) => { const S = [214, 182, 160], h = hash3(px, py, f.length * 7 + part.length); if (part === 'head') { if (f === 'front') { if (py === 2 && (px === 0 || px === 5)) return [230, 230, 230, 2]; if (py === 2 && (px === 1 || px === 4)) return [30, 26, 24, 2]; if (py === 4 && (px === 2 || px === 3)) return mk([180, 130, 120], 1); return mk(S, .95 + h * .06); } return mk(S, .9 + h * .08); } if (part.startsWith('leg')) { if (py >= fh - 2) return mk([110, 90, 80], 1); return mk(S, .92 + h * .06); } return mk([232, 232, 232], .92 + h * .08); },
      sheep_wool: (part, f, px, py, fw, fh) => { const h = hash3(px, py, f.length * 13 + part.length * 3); const v = vn2(px, py, 3, 41) * .5 + h * .5; return mk([255, 255, 255], .82 + v * .2 + ((px + py) % 3 === 0 ? .04 : 0)); },
      chicken: (part, f, px, py, fw, fh, B) => {
        const W2 = [236, 236, 236], h = hash3(px, py, f.length * 11 + part.length);
        if (part === 'head' && B[3] === 4 && B[4] === 2) return f === 'bottom' ? [196, 150, 30] : [250, 196, 40];
        if (part === 'head' && B[3] === 2) return [220, 30, 30];
        if (part === 'head') { if (f === 'front' && py === 2 && (px === 0 || px === 3)) return [30, 30, 30, 2]; return mk(W2, .95 + h * .06); }
        if (part.startsWith('leg')) { if (py < 2 && f !== 'bottom') return null; return [244, 180, 40]; }
        return mk(W2, .9 + h * .08 - (f === 'bottom' ? .05 : 0));
      },
      creeper: (part, f, px, py, fw, fh) => {
        const h = hash3(px, py, f.length * 23 + part.length * 7), v = vn2(px + part.length * 5, py + f.length * 3, 3, 51);
        const G = v > .66 ? [168, 220, 140] : v > .45 ? [90, 180, 70] : v > .28 ? [70, 150, 56] : [42, 104, 34];
        if (part === 'head' && f === 'front') { const D = [16, 20, 14, 2]; if ((py === 2 || py === 3) && (px === 1 || px === 2 || px === 5 || px === 6)) return D; if ((py === 4) && (px === 3 || px === 4)) return D; if (py === 5 && px >= 2 && px <= 5) return D; if (py === 6 && (px === 2 || px === 5)) return D; if (py === 6 && (px === 3 || px === 4)) return D; }
        if (part.startsWith('leg') && f === 'bottom') return [30, 60, 24];
        return mk(G, .92 + h * .1);
      },
      spider: (part, f, px, py, fw, fh) => {
        const h = hash3(px, py, f.length * 29 + part.length * 3), B2 = [52, 45, 39], D = [36, 31, 27];
        if (part === 'head' && f === 'front') { if ((py === 2 || py === 3) && (px === 1 || px === 2 || px === 5 || px === 6)) return [200, 20, 20, 2]; if (py === 1 && (px === 3 || px === 4)) return [220, 30, 30, 2]; if (py === 4 && (px === 0 || px === 7)) return [180, 18, 18, 2]; }
        if (part.startsWith('leg')) return mk(px % 3 === 0 ? D : B2, .9 + h * .14);
        if (part === 'body' && f === 'top') return mk(vn2(px, py, 3, 61) > .6 ? [80, 66, 56] : B2, .9 + h * .12);
        return mk(h < .2 ? D : B2, .92 + h * .1);
      },
      enderman: (part, f, px, py) => { const h = hash3(px, py, f.length * 31 + part.length); if (part === 'head' && f === 'front' && py === 4 && px >= 1 && px <= 6 && px !== 3 && px !== 4) return px === 1 || px === 6 ? [204, 0, 250, 2] : [230, 120, 255, 2]; return mk([22, 22, 22], .9 + h * .25); },
      slime: (part, f, px, py, fw, fh, B) => { if (part === 'outer') return [120, 200, 100, 1]; if (B[3] === 2) return [30, 60, 25, 2]; if (B[3] === 1) return [40, 80, 32, 2]; return [100, 180, 80]; }
    };
    PAINTERS.zombie = (part, f, px, py, fw, fh, B) => {
      if (B[8]) return null;
      const SK = [92, 142, 66], SKD = [66, 106, 48], HAIR = [52, 76, 40], SH = [30, 150, 150], SHD = [22, 120, 124], PA = [58, 60, 160], PAD = [44, 46, 126], SHOE = [62, 62, 70], h = hash3(px, py, f.length * 11 + part.length);
      if (part === 'head') { if (f === 'top') return mk(HAIR, .9 + h * .3); if (f === 'bottom') return SKD; if (f === 'back') return py < 4 ? mk(HAIR, .95 + h * .15) : mk(SK, .9 + h * .1); if (f === 'front') { if (py === 0 || (py === 1 && h < .45)) return mk(HAIR, .9 + h * .2); if (py === 4 && (px === 1 || px === 6)) return [20, 26, 20, 2]; if (py === 4 && (px === 2 || px === 5)) return [12, 16, 12, 2]; if (py === 5 && (px === 3 || px === 4)) return mk(SKD, .9); if (py === 6 && px >= 2 && px <= 5) return [28, 40, 28, 2]; return mk(SK, .93 + h * .1); } if (py < 2) return mk(HAIR, .95 + h * .15); return mk(SK, .92 + h * .1); }
      if (part === 'body') { if (f === 'top') return SH; if (f === 'bottom') return mk(PA, .9); if (py >= fh - 2) return mk(PA, 1); return mk(hash3(px >> 1, py >> 1, 7) < .13 ? SHD : SH, .94 + h * .1); }
      if (part.includes('arm')) { if (f === 'top') return SH; if (f === 'bottom') return [SK[0] * 1.2, SK[1] * 1.2, SK[2] * 1.2, 2]; if (py <= 3) return mk(h < .12 ? SHD : SH, .94 + h * .1); return mk(h < .08 ? SKD : SK, .92 + h * .12); }
      if (f === 'top') return PA; if (f === 'bottom') return mk(SHOE, .85); if (py >= fh - 3) return mk(SHOE, 1.1 - (py - fh + 3) * .12); return mk(h < .07 ? PAD : PA, .92 + h * .12);
    };
    PAINTERS.skeleton = (part, f, px, py, fw, fh, B) => {
      if (B[8]) return null;
      const BO = [200, 200, 194], BOD = [150, 150, 144], BOL = [230, 230, 224], h = hash3(px, py, f.length * 13 + part.length);
      if (part === 'head') { if (f === 'front') { if (py >= 3 && py <= 4 && (px === 1 || px === 2 || px === 5 || px === 6)) return [30, 28, 30, 2]; if (py === 5 && (px === 3 || px === 4)) return [62, 62, 66, 2]; if (py === 6) return px % 2 ? [74, 74, 78, 2] : mk(BOL, 1); if (py === 7) return mk(BOD, px % 2 ? .85 : 1); return mk(BO, .95 + h * .1); } return mk(BO, .92 + h * .1); }
      if (part === 'body') { if (f === 'top' || f === 'bottom') return BO; const sp = px === 3 || px === 4; if (py >= 9) return py === 9 ? (sp ? BOL : [48, 48, 52, 0]) : mk(BO, .95); if (sp) return mk(BOL, py % 2 ? .9 : 1.04); return py % 3 === 2 ? [44, 44, 48, 0] : mk(BO, py % 3 === 0 ? 1.04 : .88); }
      if (py === 0 || py === fh - 1) return mk(BOL, 1); if (py === 5 || py === 6) return mk(BOD, .82); return mk(BO, .9 + h * .08);
    };
    const playerPainter = (shirt, pants, hair, skin, eyes, alex) => (part, f, px, py, fw, fh, B) => {
      if (B[8]) { if (part === 'head' && (f === 'top' || (py < 2 && f !== 'bottom'))) return alex ? mk(hair, .95) : null; return null; }
      const h = hash3(px, py, f.length * 17 + part.length * 3);
      if (part === 'head') {
        if (f === 'top') return mk(hair, .9 + h * .2);
        if (f === 'bottom') return mk(skin, .8);
        if (f === 'back') return py < (alex ? 8 : 5) ? mk(hair, .9 + h * .15) : mk(skin, .92);
        if (f === 'front') { if (py < 2 || (py === 2 && (px === 0 || px === 7))) return mk(hair, .9 + h * .1); if (py === 4 && (px === 1 || px === 6)) return [255, 255, 255, 2]; if (py === 4 && (px === 2 || px === 5)) return eyes; if (py === 6 && px >= 3 && px <= 4) return mk(skin, .75); if (py === 7 && px >= 2 && px <= 5) return mk(hair, .7); return mk(skin, .97 + h * .05); }
        return py < (alex ? 6 : 3) ? mk(hair, .9 + h * .1) : mk(skin, .93);
      }
      if (part === 'body') { if (f === 'bottom') return pants; if (py >= 10) return mk(pants, .95); if (f === 'front' && py < 2 && px >= 3 && px <= 4) return mk(skin, .95); return mk(shirt, .93 + h * .08); }
      if (part.includes('arm')) { if (py < 4 && f !== 'bottom') return mk(shirt, .92 + h * .08); return mk(skin, .93 + h * .06); }
      if (f === 'bottom' || py >= fh - 2) return [70, 70, 76]; return mk(pants, .92 + h * .08);
    };
    PAINTERS.steve = playerPainter([0, 175, 175], [60, 58, 160], [70, 46, 24], [200, 140, 100], [80, 60, 160, 2]);
    PAINTERS.alex = playerPainter([110, 150, 60], [100, 66, 40], [228, 140, 50], [240, 200, 160], [40, 120, 40, 2], 1);
    function skinTex(name) {
      if (SKINS[name]) return SKINS[name];
      const base = name.split(':')[0];
      const pt = PAINTERS[name] || PAINTERS[base];
      const c = paintSkin(base, pt || (() => [200, 0, 200]));
      return SKINS[name] = tex(c, false, true);
    }
    function playerSkinTex(seedName) {
      const k = 'p:' + seedName;
      if (SKINS[k]) return SKINS[k];
      const h = hstr(seedName), R = rng(h);
      if (seedName === '') return SKINS[k] = skinTex('steve');
      const alex = R() < .4, sh = [R() * 200 + 30, R() * 200 + 30, R() * 200 + 30], pa = [R() * 120 + 20, R() * 120 + 20, R() * 160 + 40], hr = [[70, 46, 24], [228, 140, 50], [30, 26, 22], [220, 200, 120], [120, 70, 40]][R() * 5 | 0], sk = [[200, 140, 100], [240, 200, 160], [150, 100, 70], [110, 70, 50]][R() * 4 | 0];
      const c = paintSkin(alex ? 'alex' : 'steve', playerPainter(sh, pa, hr, sk, [R() * 120 | 0, R() * 120 + 60 | 0, R() * 160 + 60 | 0, 2], alex));
      return SKINS[k] = { t: tex(c, false, true), alex };
    }
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
    const SWN = new Float64Array(3), SWX = new Float64Array(3);
    function sweep(e, d, ax, hw, hh) {
      if (d === 0) return 0;
      const mn = SWN, mx = SWX;
      mn[0] = e.x - hw; mn[1] = e.y; mn[2] = e.z - hw; mx[0] = e.x + hw; mx[1] = e.y + hh; mx[2] = e.z + hw;
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
    const edgeSp = v => Math.abs(v) < .05 ? 0 : v - Math.sign(v) * .05;
    function moveE(e, dx, dy, dz, guard, step) {
      const hw = e.w / 2, hh = e.h;
      if (guard && e.onGround) {
        const sp = edgeSp;
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
    const RBR = [0, 0];
    function rayBox(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
      let tmin = 0, tmax = 1e9, fa = -1;
      for (let i = 0; i < 3; i++) {
        const o = i === 0 ? ox : i === 1 ? oy : oz, d = i === 0 ? dx : i === 1 ? dy : dz, a = i === 0 ? x0 : i === 1 ? y0 : z0, b = i === 0 ? x1 : i === 1 ? y1 : z1;
        if (Math.abs(d) < 1e-9) { if (o < a || o > b) return null; continue; }
        let t1 = (a - o) / d, t2 = (b - o) / d, f1 = i * 2 + 1, f2 = i * 2;
        if (t1 > t2) { const t = t1; t1 = t2; t2 = t; const f = f1; f1 = f2; f2 = f; }
        if (t1 > tmin) { tmin = t1; fa = f1; }
        tmax = Math.min(tmax, t2); if (tmin > tmax) return null;
      }
      RBR[0] = tmin; RBR[1] = fa;
      return RBR;
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
          let best = null, bt = 0, bf = 0;
          for (let li = 0; li < L.length; li++) { const b = L[li], r = rayBox(ox, oy, oz, dx, dy, dz, x + b[0], y + b[1], z + b[2], x + b[3], y + b[4], z + b[5]); if (r && r[0] <= max && (!best || r[0] < bt)) { best = b; bt = r[0]; bf = r[1]; } }
          if (best && bt <= 0 && n === 0 && (SHP[s] === 2 || SHP[s] === 3) && !TT[STT[s]].web) best = null;
          if (best) { HIT.b = true; HIT.x = x; HIT.y = y; HIT.z = z; HIT.d = bt; HIT.f = bf < 0 ? 2 : bf; const D = DIR6[HIT.f]; HIT.fx = D[0]; HIT.fy = D[1]; HIT.fz = D[2]; HIT.px = ox + dx * bt; HIT.py = oy + dy * bt; HIT.pz = oz + dz * bt; HIT.box = best; break; }
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
