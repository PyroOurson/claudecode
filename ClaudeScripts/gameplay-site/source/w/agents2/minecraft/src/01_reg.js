  const TT = [], TN = Object.create(null), TEXN = [], TEXI = Object.create(null);
  const ANIMS = ['water_still', 'water_flow', 'lava_still', 'lava_flow', 'fire_0', 'fire_1', 'soul_fire_0', 'soul_fire_1', 'sea_lantern', 'magma', 'prismarine', 'nether_portal', 'kelp', 'kelp_plant', 'seagrass', 'tall_seagrass_top', 'tall_seagrass_bottom', 'lantern', 'soul_lantern', 'campfire_fire', 'soul_campfire_fire', 'stonecutter_saw', 'command_block_front', 'warped_stem', 'crimson_stem', 'respawn_anchor_top', 'sculk', 'sculk_vein', 'sculk_catalyst_top_bloom', 'beacon_beam', 'copper_lantern', 'firefly_bush_emissive', 'sulfur_spring'];
  const ANIMI = Object.create(null);
  ANIMS.forEach((n, i) => { ANIMI[n] = i; });
  const ANIM_ROW0 = 64 - Math.ceil(ANIMS.length / 4);
  const tid = n => {
    if (n == null) return -1;
    if (TEXI[n] !== undefined) return TEXI[n];
    let id;
    if (ANIMI[n] !== undefined) { const k = ANIMI[n]; id = (ANIM_ROW0 + (k >> 2)) * 64 + (k & 3) * 16; }
    else { id = TEXN.length; if ((id >> 6) >= ANIM_ROW0) throw new Error('atlas full'); TEXN.push(n); }
    TEXI[n] = id;
    return id;
  };
  const DEF = { shape: 'cube', hard: 1, tool: null, req: false, lvl: 0, opq: true, solid: true, att: -1, light: 0, snd: 'stone', tab: 'build', item: true, flam: 0, repl: false, tint: 0, res: -1, stack: 64 };
  let NSTATE = 1;
  function blk(id, o) {
    o = o || {};
    const props = o.props || [];
    let n = 1;
    const strides = new Array(props.length);
    for (let i = props.length - 1; i >= 0; i--) { strides[i] = n; n *= props[i][1].length; }
    const t = Object.assign({}, DEF, o, { id, name: o.name || title(id), idx: TT.length, base: id === 'air' ? 0 : NSTATE, n, props, strides, pk: {} });
    props.forEach((p, i) => { t.pk[p[0]] = i; });
    if (id !== 'air') NSTATE += n; else NSTATE = Math.max(NSTATE, 1);
    if (t.att < 0) t.att = t.opq ? 15 : 0;
    if (t.res < 0) t.res = t.hard < 0 ? 3600000 : t.hard;
    t.tags = new Set(o.tags || []);
    TT.push(t); TN[id] = t;
    return t;
  }
  const typeOf = s => TT[STT[s]];
  const sv = (s, k) => { const t = TT[STT[s]], i = t.pk[k]; if (i === undefined) return 0; return ((s - t.base) / t.strides[i] | 0) % t.props[i][1].length; };
  const svn = (s, k) => { const t = TT[STT[s]], i = t.pk[k]; if (i === undefined) return null; return t.props[i][1][((s - t.base) / t.strides[i] | 0) % t.props[i][1].length]; };
  const sw = (s, k, v) => { const t = TT[STT[s]], i = t.pk[k]; if (i === undefined) return s; const vals = t.props[i][1]; if (typeof v === 'string') v = vals.indexOf(v); if (v < 0) return s; const cur = ((s - t.base) / t.strides[i] | 0) % vals.length; return s + (v - cur) * t.strides[i]; };
  function S(id, p) {
    const t = TN[id];
    if (!t) return 0;
    let s = t.base;
    const d = Object.assign({}, t.def || {}, p || {});
    for (const k in d) { const i = t.pk[k]; if (i === undefined) continue; const vals = t.props[i][1]; let v = typeof d[k] === 'number' && typeof vals[0] === 'number' ? vals.indexOf(d[k]) : typeof d[k] === 'number' ? d[k] : vals.indexOf(d[k]); if (v < 0) v = 0; s += v * t.strides[i]; }
    return s;
  }
  const isT = (s, id) => STT[s] === TN[id].idx;
  const PX = 1 / 16;
  const FN = { e: 0, w: 1, u: 2, d: 3, s: 4, n: 5 };
  function faceUV(f, a, b) {
    switch (f) {
      case 0: return [16 - b[2], 16 - b[1], 16 - a[2], 16 - a[1]];
      case 1: return [a[2], 16 - b[1], b[2], 16 - a[1]];
      case 2: return [a[0], a[2], b[0], b[2]];
      case 3: return [a[0], 16 - b[2], b[0], 16 - a[2]];
      case 4: return [a[0], 16 - b[1], b[0], 16 - a[1]];
      default: return [16 - b[0], 16 - b[1], 16 - a[0], 16 - a[1]];
    }
  }
  function bx(x0, y0, z0, x1, y1, z1, tex, o) {
    o = o || {};
    const a = [x0, y0, z0], b = [x1, y1, z1], f = new Array(6).fill(null);
    for (let i = 0; i < 6; i++) {
      const k = 'ewudsn'[i];
      if (o.no && o.no.includes(k)) continue;
      let t;
      if (typeof tex === 'string') t = tex;
      else t = tex[k] !== undefined ? tex[k] : (k === 'u' || k === 'd') ? (tex.ud !== undefined ? tex.ud : tex.all) : (tex.side !== undefined ? tex.side : tex.all);
      if (t == null) continue;
      f[i] = { t, uv: o.uv && o.uv[k] ? o.uv[k].slice() : faceUV(i, a, b), r: o.r && o.r[k] || 0, ti: o.ti ? 1 : 0, sh: o.sh !== undefined ? o.sh : 1 };
    }
    return { a, b, f, rx: o.rx || null };
  }
  const FROTY = [4, 5, 2, 3, 1, 0];
  function rotY(boxes, q) {
    q = ((q % 4) + 4) % 4;
    if (!q) return boxes;
    return boxes.map(B => {
      if (B.rx || B.rx2) return Object.assign({}, B, { q: ((B.q || 0) + q) & 3 });
      let a = B.a.slice(), b = B.b.slice(), f = B.f.map(x => x && Object.assign({}, x, { uv: x.uv.slice() }));
      for (let k = 0; k < q; k++) {
        const na = [16 - b[2], a[1], a[0]], nb = [16 - a[2], b[1], b[0]];
        a = na; b = nb;
        const nf = new Array(6);
        nf[0] = f[5]; nf[4] = f[0]; nf[1] = f[4]; nf[5] = f[1]; nf[2] = f[2]; nf[3] = f[3];
        if (nf[2]) nf[2].r = (nf[2].r + 1) & 3;
        if (nf[3]) nf[3].r = (nf[3].r + 3) & 3;
        f = nf;
      }
      return { a, b, f, rx: null, sc: B.sc };
    });
  }
  function flipY(boxes) {
    return boxes.map(B => {
      const a = [B.a[0], 16 - B.b[1], B.a[2]], b = [B.b[0], 16 - B.a[1], B.b[2]];
      const f = B.f.slice(); const t = f[2]; f[2] = f[3]; f[3] = t;
      return Object.assign({}, B, { a, b, f });
    });
  }
  const cb = (x0, y0, z0, x1, y1, z1) => [x0 * PX, y0 * PX, z0 * PX, x1 * PX, y1 * PX, z1 * PX];
  function rotCB(l, q) {
    q = ((q % 4) + 4) % 4;
    return l.map(c => { let [x0, y0, z0, x1, y1, z1] = c; for (let k = 0; k < q; k++) { const nx0 = 1 - z1, nx1 = 1 - z0, nz0 = x0, nz1 = x1; x0 = nx0; x1 = nx1; z0 = nz0; z1 = nz1; } return [x0, y0, z0, x1, y1, z1]; });
  }
  const FULLCB = [[0, 0, 0, 1, 1, 1]];
  let STT, SHP, OPQ, SOL, LAT, LEM, TIL, TRT, TNT, CSM, FLU, REP, MOD, COLL, SELB, FULLT, ANIMF, LEAF;
  const IT = [], IN = Object.create(null);
  let TILF = [];
  function itm(id, o) {
    o = o || {};
    for (const k in o) if (o[k] === undefined) delete o[k];
    if (IN[id]) return Object.assign(IN[id], o);
    const it = Object.assign({ id, name: o.name || title(id), idx: IT.length, stack: 64, tab: 'ingr', tex: null, block: null }, o);
    IT.push(it); IN[id] = it;
    return it;
  }
  function finalizeBlocks() {
    const N = NSTATE;
    STT = new Uint16Array(N); SHP = new Uint8Array(N); OPQ = new Uint8Array(N); SOL = new Uint8Array(N); LAT = new Uint8Array(N); LEM = new Uint8Array(N);
    TIL = new Int16Array(N * 6).fill(-1); TRT = new Uint8Array(N * 6); TNT = new Uint8Array(N); CSM = new Uint16Array(N); FLU = new Uint8Array(N); REP = new Uint8Array(N); FULLT = new Uint8Array(N); ANIMF = new Uint8Array(N); LEAF = new Uint8Array(N);
    MOD = new Array(N).fill(null); COLL = new Array(N).fill(null); SELB = new Array(N).fill(null);
    const SHC = { none: 0, cube: 1, cross: 2, crop: 3, liquid: 4, model: 5, cmodel: 6 };
    for (const t of TT) {
      for (let k = 0; k < t.n; k++) {
        const s = t.base + k;
        STT[s] = t.idx;
        const shp = typeof t.shape === 'function' ? t.shape(s) : t.shape;
        SHP[s] = SHC[shp] ?? 5;
        OPQ[s] = t.opq && shp === 'cube' ? 1 : 0;
        LAT[s] = typeof t.att === 'function' ? t.att(s) : t.att;
        LEM[s] = typeof t.light === 'function' ? t.light(s) : t.light;
        TNT[s] = typeof t.tint === 'function' ? t.tint(s) : t.tint;
        CSM[s] = t.cullSame ? t.cullSame : 0;
        FLU[s] = t.fluid || 0;
        REP[s] = typeof t.repl === 'function' ? (t.repl(s) ? 1 : 0) : t.repl ? 1 : 0;
        LEAF[s] = t.tags.has('leaves') ? 1 : 0;
        if (LEAF[s] && t.leafTex) TILF[s] = tid(t.leafTex + '_fast');
        const solid = typeof t.solid === 'function' ? t.solid(s) : t.solid;
        if (shp === 'cube' || shp === 'model' || shp === 'cmodel' || shp === 'cross' || shp === 'crop') {
          if (shp === 'cube' || t.tiles) {
            const tl = t.tiles ? t.tiles(s) : null;
            for (let f = 0; f < 6; f++) {
              let nm, r = 0;
              if (tl) { const v = tl[f]; if (Array.isArray(v)) { nm = v[0]; r = v[1]; } else nm = v; }
              else nm = texFace(t.tex, f);
              TIL[s * 6 + f] = tid(nm); TRT[s * 6 + f] = r;
              if (ANIMI[nm] !== undefined) ANIMF[s] = 1;
            }
          }
        }
        if (shp === 'cross' || shp === 'crop') { const nm = t.ctex ? t.ctex(s) : typeof t.tex === 'string' ? t.tex : t.tex.all; for (let f = 0; f < 6; f++) TIL[s * 6 + f] = tid(nm); if (ANIMI[nm] !== undefined) ANIMF[s] = 1; }
        if (shp === 'model') {
          const m = t.model(s);
          MOD[s] = m;
          for (const B of m) for (const f of B.f) if (f) { f.tid = tid(f.t); if (ANIMI[f.t] !== undefined) f.an = 1; }
        }
        if (shp === 'liquid') { TIL[s * 6] = tid(t.tex.still); TIL[s * 6 + 1] = tid(t.tex.flow); ANIMF[s] = 1; }
        if (t.ccoll) SOL[s] = 3;
        else if (t.coll) { const c = t.coll(s); COLL[s] = c; SOL[s] = c.length ? (c.length === 1 && c[0].join() === '0,0,0,1,1,1' ? 1 : 2) : 0; }
        else SOL[s] = solid ? 1 : 0;
        if (t.sel) SELB[s] = t.sel(s);
        FULLT[s] = SOL[s] === 1 && t.opq ? 1 : 0;
      }
    }
  }
  function texFace(tex, f) {
    if (typeof tex === 'string') return tex;
    const k = 'ewudsn'[f];
    if (tex[k] !== undefined) return tex[k];
    if (k === 'u') return tex.top ?? tex.ud ?? tex.all;
    if (k === 'd') return tex.bottom ?? tex.ud ?? tex.all;
    return tex.side ?? tex.all;
  }
  function cmodelTids(m) { for (const B of m) for (const f of B.f) if (f && f.tid === undefined) { f.tid = tid(f.t); if (ANIMI[f.t] !== undefined) f.an = 1; } return m; }
