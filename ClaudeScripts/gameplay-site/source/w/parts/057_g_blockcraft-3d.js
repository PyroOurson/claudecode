(() => {
  'use strict';
  const CFG = {
    TPS: 20, H: 320, NSEC: 20, SEA: 126, YOFF: 64,
    WALK: 0.1, SPRINT: 0.13, AIR_ACC: 0.02, AIR_ACC_SPRINT: 0.026, SNEAK_MUL: 0.3, INPUT_MUL: 0.98,
    GROUND_DRAG: 0.546, AIR_DRAG: 0.91, GRAVITY: 0.08, VDRAG: 0.98, JUMP: 0.42, SPRINT_JUMP: 0.2, JUMP_TICKS: 10,
    FLY_ACC: 0.05, FLY_V: 0.15, FLY_VDRAG: 0.6, STEP: 0.6,
    SWIM_ACC: 0.02, WATER_DRAG: 0.8, WATER_GRAV: 0.02, WATER_UP: 0.04, LAVA_DRAG: 0.5,
    PW: 0.6, PH: 1.8, EYE: 1.62, EYE_SNEAK: 1.27, PH_SNEAK: 1.5,
    REACH: 4.5, REACH_CREATIVE: 5, MOB_REACH: 3,
    FALL_SAFE: 3, DOUBLE_TAP: 7, INVULN: 10,
    DAY: 24000,
    BREAK_DELAY: 5, USE_DELAY: 4, EAT_TICKS: 32, SMELT_TICKS: 200, SWING_TICKS: 6,
    EXH_SPRINT: 0.1, EXH_JUMP: 0.05, EXH_SPRINT_JUMP: 0.2, EXH_SWIM: 0.01, EXH_MINE: 0.005, EXH_ATTACK: 0.1, EXH_REGEN: 6, EXH_HURT: 0.1, REGEN_TICKS: 80, AIR_MAX: 300,
    HOSTILE_CAP: 14, PASSIVE_CAP: 10, DESPAWN: 128,
    RD: 6, RD_TOUCH: 4, SENS: 0.15 * Math.PI / 180, FOV: 70, CLOUD_Y: 256
  };
  const H = CFG.H, NSEC = CFG.NSEC, SEA = CFG.SEA;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rng = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash3 = (x, y, z) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  const lerp = (a, b, t) => a + t * (b - a);
  const title = s => s.split('_').map(w => w === 'of' || w === 'the' || w === 'on' || w === 'a' || w === 'with' || w === 'and' || w === 'o' ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/^./, c => c.toUpperCase());
  const RNG = Math.random;
  const ri = n => RNG() * n | 0;
  const rr = (a, b) => a + (RNG() * (b - a + 1) | 0);
  const FACE4 = ['north', 'east', 'south', 'west'];
  const DIR6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const F4D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const F4FACE = [5, 0, 4, 1];
  const OPP6 = [1, 0, 3, 2, 5, 4];
  const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];
  const DYE = { white: [249, 255, 254], orange: [249, 128, 29], magenta: [199, 78, 189], light_blue: [58, 179, 218], yellow: [254, 216, 61], lime: [128, 199, 31], pink: [243, 139, 170], gray: [71, 79, 82], light_gray: [157, 157, 151], cyan: [22, 156, 156], purple: [137, 50, 184], blue: [60, 68, 170], brown: [131, 84, 50], green: [94, 124, 22], red: [176, 46, 38], black: [29, 29, 33] };
  const FONT = '00000000ggggg0g0kk000000aavavaa04fge1u40hi2489h04a4diid0gg00000068ggg860o42224o00ici0000044v440000000ggg000v0000000000g0122488g0ehjlphe04c4444v0eh168gv0eh161he0359hv110vgu11he068guhhe0vh124440ehhehhe0ehhf12c000g000g000g000gg248g842000v00v00g84248g0eh124040ehnlngf0ehhvhhh0uhhuhhu0ehggghe0uhhhhhu0vggsggv0vggsggg0fgjhhhf0hhhvhhh0s88888s011111he0hisihhh0ggggggv0hrlhhhh0hpljhhh0ehhhhhe0uhugggg0ehhhhid0uhuhhhh0fge11he0v4444440hhhhhhe0hhhhha40hhhhlrh0ha4ahhh0ha444440v1248gv0sgggggs0g8842210s44444s04ah000000000000vg800000000e1fhf0ggmphhu000ehghe011djhhf000ehvgf068u8888000fhhf1uggmphhh0g0ggggg0101111heggikoki0gggggg8000qllhh000uhhhh000ehhhe000mphugg00djhf1100mpggg000fge1u088s8884000hhhhf000hhha4000hhllf000ha4ah000hhhf1u00v248v0c88g88c0ggggggggo88488o00dm00000';
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
  const P4 = ['facing', FACE4], P6 = ['facing', ['north', 'east', 'south', 'west', 'up', 'down']], PAX = ['axis', ['y', 'x', 'z']], PHALF = ['half', ['bottom', 'top']], POPEN = ['open', [false, true]], PPOW = ['powered', [false, true]], PLIT = ['lit', [false, true]];
  const fq = s => sv(s, 'facing');
  const C = (id, tex, o) => blk(id, Object.assign({ tex }, o));
  const pillarTiles = (side, top, bot) => s => {
    const a = sv(s, 'axis');
    if (a === 0) return [side, side, top, bot || top, side, side];
    if (a === 1) return [top, bot || top, [side, 1], [side, 1], [side, 1], [side, 1]];
    return [[side, 1], [side, 1], side, side, top, bot || top];
  };
  const pillar = (id, side, top, o) => blk(id, Object.assign({ props: [PAX], tiles: pillarTiles(side, top, o && o.bot) }, o));
  const facingTiles = (front, side, top, bot) => s => { const q = fq(s), t = [side, side, top, bot || top, side, side]; t[F4FACE[q]] = front; if (bot === 'rot') { t[3] = top; } return t; };
  const slabCB = s => { const v = sv(s, 'type'); return v === 2 ? FULLCB : v === 1 ? [cb(0, 8, 0, 16, 16, 16)] : [cb(0, 0, 0, 16, 8, 16)]; };
  function slab(id, base, o) {
    const tex = o && o.tex || base;
    return blk(id, Object.assign({ props: [['type', ['bottom', 'top', 'double']]], shape: s => sv(s, 'type') === 2 ? 'cube' : 'model', tex, model: s => { const v = sv(s, 'type'); return v === 1 ? [bx(0, 8, 0, 16, 16, 16, tex)] : [bx(0, 0, 0, 16, 8, 16, tex)]; }, coll: slabCB, att: s => sv(s, 'type') === 2 ? 15 : 0, slab: 1 }, o, { tex }));
  }
  const STAIR_SHAPES = ['straight', 'inner_left', 'inner_right', 'outer_left', 'outer_right'];
  function stairBoxes(tex, half, shape, q) {
    let b = [bx(0, 0, 0, 16, 8, 16, tex)];
    if (shape === 0) b.push(bx(0, 8, 0, 16, 16, 8, tex));
    else if (shape === 1) b.push(bx(0, 8, 0, 16, 16, 8, tex), bx(0, 8, 8, 8, 16, 16, tex));
    else if (shape === 2) b.push(bx(0, 8, 0, 16, 16, 8, tex), bx(8, 8, 8, 16, 16, 16, tex));
    else if (shape === 3) b.push(bx(0, 8, 0, 8, 16, 8, tex));
    else b.push(bx(8, 8, 0, 16, 16, 8, tex));
    if (half) b = flipY(b);
    return rotY(b, q);
  }
  function stairCB(half, shape, q) {
    let l = [cb(0, 0, 0, 16, 8, 16)];
    const up = shape === 0 ? [cb(0, 8, 0, 16, 16, 8)] : shape === 1 ? [cb(0, 8, 0, 16, 16, 8), cb(0, 8, 8, 8, 16, 16)] : shape === 2 ? [cb(0, 8, 0, 16, 16, 8), cb(8, 8, 8, 16, 16, 16)] : shape === 3 ? [cb(0, 8, 0, 8, 16, 8)] : [cb(8, 8, 0, 16, 16, 8)];
    l = l.concat(up);
    if (half) l = l.map(c => [c[0], 1 - c[4], c[2], c[3], 1 - c[1], c[5]]);
    return rotCB(l, q);
  }
  const isStair = s => !!TT[STT[s]].stair;
  function stairMask(s, nb) {
    const q = fq(s), h = sv(s, 'half');
    const d = F4D[q], back = nb(d[0], 0, d[1]);
    const take = (dq) => { const e = F4D[dq], n = nb(e[0], 0, e[1]); return !isStair(n) || fq(n) !== q || sv(n, 'half') !== h; };
    if (isStair(back) && sv(back, 'half') === h) { const bq = fq(back); if ((bq & 1) !== (q & 1) && take((bq + 2) & 3)) return bq === ((q + 3) & 3) ? 3 : 4; }
    const fr = nb(-d[0], 0, -d[1]);
    if (isStair(fr) && sv(fr, 'half') === h) { const fq2 = fq(fr); if ((fq2 & 1) !== (q & 1) && take(fq2)) return fq2 === ((q + 3) & 3) ? 1 : 2; }
    return 0;
  }
  function stairs(id, tex, o) {
    return blk(id, Object.assign({ props: [P4, PHALF], shape: 'cmodel', stair: 1, tex, cmask: stairMask, cmodel: (s, m) => stairBoxes(tex, sv(s, 'half'), m, fq(s)), ccoll: (s, m) => stairCB(sv(s, 'half'), m, fq(s)), att: 0 }, o));
  }
  const connSolid = s => FULLT[s] === 1;
  function fenceLike(id, tex, o, kind) {
    const post = kind === 'fence' ? [6, 10] : kind === 'wall' ? [4, 12] : [7, 9];
    const cls = o.cls || kind;
    const conn = (n, dir) => { const t = TT[STT[n]]; if (t.cls === cls || (kind === 'fence' && t.gate) || (kind !== 'fence' && (t.cls === 'pane' || t.cls === 'wall'))) return true; if (kind === 'wall' && t.gate) return true; return connSolid(n); };
    return blk(id, Object.assign({
      shape: 'cmodel', tex, cls, opq: false, att: 0,
      cmask: (s, nb) => { let m = 0; for (let q = 0; q < 4; q++) { const d = F4D[q]; if (conn(nb(d[0], 0, d[1]), q)) m |= 1 << q; } if (kind === 'wall') { const up = nb(0, 1, 0); if (up && SOL[up]) m |= 16; } return m; },
      cmodel: (s, m) => {
        const b = [];
        if (kind === 'fence') {
          b.push(bx(6, 0, 6, 10, 16, 10, tex));
          for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(7, 12, 0, 9, 15, 6, tex), bx(7, 6, 0, 9, 9, 6, tex)], q));
        } else if (kind === 'wall') {
          const straight = (m & 15) === 5 || (m & 15) === 10;
          if (!straight || m & 16) b.push(bx(4, 0, 4, 12, 16, 12, tex));
          for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(5, 0, 0, 11, 14, straight && !(m & 16) ? 8 : 4, tex)], q));
          if (straight && !(m & 16)) { const q = (m & 15) === 5 ? 0 : 1; b.length = 0; b.push(...rotY([bx(5, 0, 0, 11, 14, 16, tex)], q)); }
        } else {
          const ed = o.edge || tex;
          if (!(m & 15)) b.push(bx(7, 0, 7, 9, 16, 9, { side: tex, ud: ed }));
          else {
            b.push(bx(7, 0, 7, 9, 16, 9, { side: tex, ud: ed }, { no: 'ewsn' }));
            for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(7, 0, 0, 9, 16, 7, { e: tex, w: tex, u: ed, d: ed, n: null, s: null })], q));
            for (let q = 0; q < 4; q++) if (!(m & 1 << q)) b.push(...rotY([bx(7, 0, 7, 9, 16, 9, { side: null, ud: null, n: tex })], q));
          }
        }
        return b;
      },
      ccoll: (s, m) => {
        const hh = kind === 'pane' ? 16 : 24, l = [cb(post[0], 0, post[0], post[1], hh, post[1])];
        for (let q = 0; q < 4; q++) if (m & 1 << q) l.push(...rotCB([cb(post[0] + (kind === 'wall' ? 1 : 0), 0, 0, post[1] - (kind === 'wall' ? 1 : 0), hh, 8)], q));
        return l;
      }
    }, o));
  }
  const fence = (id, tex, o) => fenceLike(id, tex, Object.assign({ hard: 2, tool: 'axe', snd: 'wood', flam: 1, cls: 'wfence', tags: ['fence'] }, o), 'fence');
  const wall = (id, tex, o) => fenceLike(id, tex, Object.assign({ tags: ['wall'] }, o), 'wall');
  const pane = (id, tex, edge, o) => fenceLike(id, tex, Object.assign({ edge, hard: .3, snd: 'glass', cls: 'pane', drop: null, tab: 'color' }, o), 'pane');
  function gate(id, tex, o) {
    return blk(id, Object.assign({
      props: [P4, POPEN, PPOW, ['in_wall', [false, true]]], shape: 'model', tex, gate: 1, opq: false, att: 0, hard: 2, tool: 'axe', snd: 'wood', flam: 1, use: 'gate',
      model: s => {
        const op = sv(s, 'open'), w = sv(s, 'in_wall') ? -3 : 0, q = fq(s);
        let b = [bx(0, 5 + w, 7, 2, 16 + w, 9, tex), bx(14, 5 + w, 7, 16, 16 + w, 9, tex)];
        if (!op) b.push(bx(6, 6 + w, 7, 8, 15 + w, 9, tex), bx(8, 6 + w, 7, 10, 15 + w, 9, tex), bx(2, 6 + w, 7, 6, 9 + w, 9, tex), bx(2, 12 + w, 7, 6, 15 + w, 9, tex), bx(10, 6 + w, 7, 14, 9 + w, 9, tex), bx(10, 12 + w, 7, 14, 15 + w, 9, tex));
        else b.push(bx(0, 6 + w, 13, 2, 15 + w, 15, tex), bx(14, 6 + w, 13, 16, 15 + w, 15, tex), bx(0, 6 + w, 9, 2, 9 + w, 13, tex), bx(0, 12 + w, 9, 2, 15 + w, 13, tex), bx(14, 6 + w, 9, 16, 9 + w, 13, tex), bx(14, 12 + w, 9, 16, 15 + w, 13, tex));
        return rotY(b, q);
      },
      coll: s => sv(s, 'open') ? [] : rotCB([cb(0, 0, 6, 16, 24, 10)], fq(s)),
      sel: s => rotCB([cb(0, 0, 6, 16, 16, 10)], fq(s))
    }, o));
  }
  function door(id, base, o) {
    const tt = base + '_door_top', tb = base + '_door_bottom';
    return blk(id, Object.assign({
      props: [P4, PHALF, POPEN, ['hinge', ['left', 'right']], PPOW], shape: 'model', opq: false, att: 0, hard: 3, tool: 'axe', snd: 'wood', use: 'door', door: 1, tab: 'build',
      model: s => {
        const q = fq(s), op = sv(s, 'open'), hr = sv(s, 'hinge'), up = sv(s, 'half'), t = up ? tt : tb;
        const r = op ? (hr ? q + 3 : q + 1) : q;
        const mir = (hr ^ op) === 1;
        const uvF = mir ? [16, 0, 0, 16] : [0, 0, 16, 16], uvB = mir ? [0, 0, 16, 16] : [16, 0, 0, 16];
        return rotY([bx(0, 0, 13, 16, 16, 16, t, { uv: { s: uvF, n: uvB, e: [13, 0, 16, 16], w: [13, 0, 16, 16], u: [0, 13, 16, 16], d: [0, 13, 16, 16] } })], r);
      },
      coll: s => { const q = fq(s), op = sv(s, 'open'), hr = sv(s, 'hinge'); return rotCB([cb(0, 0, 13, 16, 16, 16)], op ? (hr ? q + 3 : q + 1) : q); },
      drop: s => sv(s, 'half') ? null : id
    }, o));
  }
  function trapdoor(id, tex, o) {
    return blk(id, Object.assign({
      props: [P4, PHALF, POPEN, PPOW], shape: 'model', opq: false, att: 0, hard: 3, tool: 'axe', snd: 'wood', use: 'trapdoor', tex,
      model: s => { const op = sv(s, 'open'), up = sv(s, 'half'); if (op) return rotY([bx(0, 0, 13, 16, 16, 16, tex, { uv: { e: [13, 0, 16, 16], w: [0, 0, 3, 16], u: [0, 13, 16, 16], d: [0, 0, 16, 3] } })], fq(s)); return [up ? bx(0, 13, 0, 16, 16, 16, tex, { uv: { e: [0, 0, 16, 3], w: [0, 0, 16, 3], s: [0, 0, 16, 3], n: [0, 0, 16, 3] } }) : bx(0, 0, 0, 16, 3, 16, tex, { uv: { e: [0, 13, 16, 16], w: [0, 13, 16, 16], s: [0, 13, 16, 16], n: [0, 13, 16, 16] } })]; },
      coll: s => sv(s, 'open') ? rotCB([cb(0, 0, 13, 16, 16, 16)], fq(s)) : sv(s, 'half') ? [cb(0, 13, 0, 16, 16, 16)] : [cb(0, 0, 0, 16, 3, 16)]
    }, o));
  }
  const BTN_FACE = ['floor', 'wall', 'ceiling'];
  function button(id, tex, o) {
    return blk(id, Object.assign({
      props: [['face', BTN_FACE], P4, PPOW], shape: 'model', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', use: 'button', tex, tab: 'red', attach: 1, redstone: 1,
      model: s => { const p = sv(s, 'powered') ? 1 : 2, f = sv(s, 'face'), q = fq(s); if (f === 1) return rotY([bx(5, 6, 16 - p, 11, 10, 16, tex)], q); if (f === 0) return rotY([bx(5, 0, 6, 11, p, 10, tex)], q); return rotY([bx(5, 16 - p, 6, 11, 16, 10, tex)], q); },
      sel: s => { const f = sv(s, 'face'), q = fq(s); return f === 1 ? rotCB([cb(5, 6, 14, 11, 10, 16)], q) : f === 0 ? rotCB([cb(5, 0, 6, 11, 2, 10)], q) : rotCB([cb(5, 14, 6, 11, 16, 10)], q); }
    }, o));
  }
  function plate(id, tex, o) {
    return blk(id, Object.assign({
      props: [['power', [0, 1]]], shape: 'model', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', tex, tab: 'red', plate: 1, redstone: 1,
      model: s => [bx(1, 0, 1, 15, sv(s, 'power') ? .5 : 1, 15, tex)], sel: s => [cb(1, 0, 1, 15, 1, 15)]
    }, o));
  }
  const crossM = o => Object.assign({ shape: 'cross', opq: false, solid: false, att: 0, hard: 0, snd: 'grass', tab: 'nature', repl: false, plant: 1, sel: () => [cb(2, 0, 2, 14, 13, 14)] }, o);
  const plantB = (id, tex, o) => blk(id, crossM(Object.assign({ tex, icon: tex }, o)));
  function tallPlant(id, base, o) {
    return blk(id, crossM(Object.assign({ props: [PHALF], ctex: s => sv(s, 'half') ? base + '_top' : base + '_bottom', icon: o && o.icon || base + '_top', tall: 1, drop: s => sv(s, 'half') ? null : id }, o)));
  }
  function torchB(id, tex, light, o, wo) {
    const UVT = { uv: { e: [7, 6, 9, 16], w: [7, 6, 9, 16], s: [7, 6, 9, 16], n: [7, 6, 9, 16], u: [7, 6, 9, 8], d: [7, 14, 9, 16] } };
    const tx = s => o.ctexL && !sv(s, 'lit') ? tex + '_off' : tex;
    blk(id, Object.assign({ shape: 'model', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', light, tex, icon: tex, model: s => [bx(7, 0, 7, 9, 10, 9, tx(s), UVT)], sel: () => [cb(6, 0, 6, 10, 10, 10)], tab: 'func', attach: 1, torch: 1 }, o));
    blk('wall_' + id, Object.assign({
      props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', light, tex, item: id, name: title(id), torch: 1, attach: 1,
      model: s => { const B = bx(-1, 3.5, 7, 1, 13.5, 9, tx(s), UVT); B.rx = { ax: 'z', ang: -22.5, o: [0, 3.5, 8] }; return rotY([B], fq(s) + 3); },
      sel: s => rotCB([cb(0, 3, 5.5, 5, 13, 10.5)], fq(s) + 3), drop: id
    }, o, wo || {}, { tab: null, icon: null }));
  }
  const LV = { wood: 0, stone: 1, iron: 2, diamond: 3, netherite: 4 };
  const ore = (id, tex, lvl, o) => C(id, tex, Object.assign({ hard: id.startsWith('deepslate') ? 4.5 : 3, tool: 'pick', req: true, lvl, tab: 'nature', snd: id.startsWith('deepslate') ? 'deepslate' : 'stone' }, o));
  blk('air', { shape: 'none', opq: false, solid: false, att: 0, item: false, repl: true, hard: 0 });
  C('stone', 'stone', { hard: 1.5, tool: 'pick', req: true, drop: 'cobblestone', res: 6 });
  C('granite', 'granite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_granite', 'polished_granite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  C('diorite', 'diorite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_diorite', 'polished_diorite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  C('andesite', 'andesite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_andesite', 'polished_andesite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  blk('grass_block', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'grass_block_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['grass_block_side', 'grass_block_side', 'grass_block_top', 'dirt', 'grass_block_side', 'grass_block_side'], tint: s => sv(s, 'snowy') ? 0 : 1, hard: .6, tool: 'shovel', snd: 'grass', drop: 'dirt', tab: 'nature', icon3: 1 });
  C('dirt', 'dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  C('coarse_dirt', 'coarse_dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  blk('podzol', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'podzol_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['podzol_side', 'podzol_side', 'podzol_top', 'dirt', 'podzol_side', 'podzol_side'], hard: .5, tool: 'shovel', snd: 'gravel', drop: 'dirt', tab: 'nature' });
  C('rooted_dirt', 'rooted_dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  C('mud', 'mud', { hard: .5, tool: 'shovel', snd: 'mud', tab: 'nature', coll: () => [cb(0, 0, 0, 16, 14, 16)] });
  blk('mycelium', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'mycelium_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['mycelium_side', 'mycelium_side', 'mycelium_top', 'dirt', 'mycelium_side', 'mycelium_side'], hard: .6, tool: 'shovel', snd: 'grass', drop: 'dirt', tab: 'nature' });
  blk('dirt_path', { shape: 'model', tex: { top: 'dirt_path_top', side: 'dirt_path_side', bottom: 'dirt' }, model: () => [bx(0, 0, 0, 16, 15, 16, { u: 'dirt_path_top', d: 'dirt', side: 'dirt_path_side' })], coll: () => [cb(0, 0, 0, 16, 15, 16)], hard: .65, tool: 'shovel', snd: 'grass', drop: 'dirt', opq: false, att: 0, tab: 'nature' });
  blk('farmland', { props: [['moisture', [0, 1, 2, 3, 4, 5, 6, 7]]], shape: 'model', model: s => [bx(0, 0, 0, 16, 15, 16, { u: sv(s, 'moisture') === 7 ? 'farmland_moist' : 'farmland', d: 'dirt', side: 'dirt' })], coll: () => [cb(0, 0, 0, 16, 15, 16)], hard: .6, tool: 'shovel', snd: 'gravel', drop: 'dirt', opq: false, att: 0, tab: 'nature', icon: null });
  C('cobblestone', 'cobblestone', { hard: 2, tool: 'pick', req: true, res: 6 });
  C('mossy_cobblestone', 'mossy_cobblestone', { hard: 2, tool: 'pick', req: true, res: 6 });
  C('bedrock', 'bedrock', { hard: -1, item: true, tab: 'nature' });
  C('sand', 'sand', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', dust: [219, 207, 163] });
  C('suspicious_sand', 'suspicious_sand_0', { hard: .25, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', drop: null });
  C('red_sand', 'red_sand', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', dust: [169, 88, 33] });
  C('gravel', 'gravel', { hard: .6, tool: 'shovel', snd: 'gravel', grav: 1, tab: 'nature', dust: [128, 124, 123], drop: (s, c) => [[RNG() < (c.fortune ? .25 : .1) && !c.silk ? 'flint' : 'gravel', 1]] });
  C('suspicious_gravel', 'suspicious_gravel_0', { hard: .25, tool: 'shovel', snd: 'gravel', grav: 1, tab: 'nature', drop: null });
  C('clay', 'clay', { hard: .6, tool: 'shovel', snd: 'gravel', tab: 'nature', drop: (s, c) => c.silk ? [['clay', 1]] : [['clay_ball', 4]] });
  ore('coal_ore', 'coal_ore', 0, { drop: (s, c) => c.silk ? [['coal_ore', 1]] : [['coal', 1]], xp: [0, 2] });
  ore('deepslate_coal_ore', 'deepslate_coal_ore', 0, { drop: (s, c) => c.silk ? [['deepslate_coal_ore', 1]] : [['coal', 1]], xp: [0, 2] });
  ore('iron_ore', 'iron_ore', 1, { drop: (s, c) => c.silk ? [['iron_ore', 1]] : [['raw_iron', 1]] });
  ore('deepslate_iron_ore', 'deepslate_iron_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_iron_ore', 1]] : [['raw_iron', 1]] });
  ore('copper_ore', 'copper_ore', 1, { drop: (s, c) => c.silk ? [['copper_ore', 1]] : [['raw_copper', rr(2, 5)]] });
  ore('deepslate_copper_ore', 'deepslate_copper_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_copper_ore', 1]] : [['raw_copper', rr(2, 5)]] });
  ore('gold_ore', 'gold_ore', 2, { drop: (s, c) => c.silk ? [['gold_ore', 1]] : [['raw_gold', 1]] });
  ore('deepslate_gold_ore', 'deepslate_gold_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_gold_ore', 1]] : [['raw_gold', 1]] });
  ore('redstone_ore', 'redstone_ore', 2, { drop: (s, c) => c.silk ? [['redstone_ore', 1]] : [['redstone', rr(4, 5)]], xp: [1, 5] });
  ore('deepslate_redstone_ore', 'deepslate_redstone_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_redstone_ore', 1]] : [['redstone', rr(4, 5)]], xp: [1, 5] });
  ore('emerald_ore', 'emerald_ore', 2, { drop: (s, c) => c.silk ? [['emerald_ore', 1]] : [['emerald', 1]], xp: [3, 7] });
  ore('deepslate_emerald_ore', 'deepslate_emerald_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_emerald_ore', 1]] : [['emerald', 1]], xp: [3, 7] });
  ore('lapis_ore', 'lapis_ore', 1, { drop: (s, c) => c.silk ? [['lapis_ore', 1]] : [['lapis_lazuli', rr(4, 9)]], xp: [2, 5] });
  ore('deepslate_lapis_ore', 'deepslate_lapis_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_lapis_ore', 1]] : [['lapis_lazuli', rr(4, 9)]], xp: [2, 5] });
  ore('diamond_ore', 'diamond_ore', 2, { drop: (s, c) => c.silk ? [['diamond_ore', 1]] : [['diamond', 1]], xp: [3, 7] });
  ore('deepslate_diamond_ore', 'deepslate_diamond_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_diamond_ore', 1]] : [['diamond', 1]], xp: [3, 7] });
  ore('nether_gold_ore', 'nether_gold_ore', 0, { hard: 3, snd: 'netherrack', drop: (s, c) => c.silk ? [['nether_gold_ore', 1]] : [['gold_nugget', rr(2, 6)]], xp: [0, 1] });
  ore('nether_quartz_ore', 'nether_quartz_ore', 0, { hard: 3, snd: 'netherrack', drop: (s, c) => c.silk ? [['nether_quartz_ore', 1]] : [['quartz', 1]], xp: [2, 5] });
  C('ancient_debris', { side: 'ancient_debris_side', top: 'ancient_debris_top' }, { hard: 30, tool: 'pick', req: true, lvl: 3, tab: 'nature', snd: 'metal', res: 1200 });
  const metalB = (id, tex, lvl, o) => C(id, tex, Object.assign({ hard: 5, tool: 'pick', req: true, lvl, snd: 'metal', res: 6 }, o));
  metalB('coal_block', 'coal_block', 0, { snd: 'stone', flam: 1 });
  metalB('raw_iron_block', 'raw_iron_block', 1, { tab: 'nature' }); metalB('raw_copper_block', 'raw_copper_block', 1, { tab: 'nature' }); metalB('raw_gold_block', 'raw_gold_block', 2, { tab: 'nature' });
  metalB('iron_block', 'iron_block', 1); metalB('gold_block', 'gold_block', 2, { hard: 3 }); metalB('redstone_block', 'redstone_block', 0, { tab: 'red', power: 15 });
  metalB('emerald_block', 'emerald_block', 2); metalB('lapis_block', 'lapis_block', 1, { hard: 3, snd: 'stone' }); metalB('diamond_block', 'diamond_block', 2);
  metalB('netherite_block', 'netherite_block', 3, { hard: 50, res: 1200 });
  C('amethyst_block', 'amethyst_block', { hard: 1.5, tool: 'pick', req: true, snd: 'amethyst' });
  C('budding_amethyst', 'budding_amethyst', { hard: 1.5, tool: 'pick', snd: 'amethyst', drop: null, tab: 'nature', tick: 'bud' });
  const bud = (id, h, w, li) => blk(id, { props: [P6], shape: 'model', opq: false, solid: false, att: 0, hard: 1.5, snd: 'amethyst', light: li, tab: 'nature', icon: id, drop: id === 'amethyst_cluster' ? (s, c) => c.silk ? [[id, 1]] : [['amethyst_shard', 4]] : (s, c) => c.silk ? [[id, 1]] : null, model: s => crossBoxes(id, s, h, w), sel: s => budSel(s, h, w), attach: 2 });
  bud('small_amethyst_bud', 3, 4, 1); bud('medium_amethyst_bud', 4, 6, 2); bud('large_amethyst_bud', 5, 7, 4); bud('amethyst_cluster', 7, 8, 5);
  C('calcite', 'calcite', { hard: .75, tool: 'pick', req: true, tab: 'nature' });
  C('tuff', 'tuff', { hard: 1.5, tool: 'pick', req: true, tab: 'nature' });
  C('dripstone_block', 'dripstone_block', { hard: 1.5, tool: 'pick', req: true, tab: 'nature' });
  pillar('deepslate', 'deepslate', 'deepslate_top', { hard: 3, tool: 'pick', req: true, snd: 'deepslate', drop: 'cobbled_deepslate', tab: 'nature' });
  C('cobbled_deepslate', 'cobbled_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('polished_deepslate', 'polished_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('deepslate_bricks', 'deepslate_bricks', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('cracked_deepslate_bricks', 'cracked_deepslate_bricks', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('deepslate_tiles', 'deepslate_tiles', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('cracked_deepslate_tiles', 'cracked_deepslate_tiles', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('chiseled_deepslate', 'chiseled_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('reinforced_deepslate', { side: 'reinforced_deepslate_side', top: 'reinforced_deepslate_top', bottom: 'reinforced_deepslate_bottom' }, { hard: 55, item: true, drop: null, res: 1200 });
  C('smooth_basalt', 'smooth_basalt', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt', tab: 'nature' });
  const stoneO = { hard: 1.5, tool: 'pick', req: true, res: 6 };
  const slabName = n => n.replace(/s$/, '').replace(/_block$/, '').replace(/bricks$/, 'brick').replace(/tiles$/, 'tile');
  const STONE_FAMS = [
    ['stone', 'stone', 'st sl', stoneO], ['cobblestone', 'cobblestone', 'st sl w', stoneO], ['mossy_cobblestone', 'mossy_cobblestone', 'st sl w', stoneO],
    ['stone_bricks', 'stone_bricks', 'st sl w', stoneO], ['mossy_stone_bricks', 'mossy_stone_bricks', 'st sl w', stoneO],
    ['granite', 'granite', 'st sl w', stoneO], ['polished_granite', 'polished_granite', 'st sl', stoneO], ['diorite', 'diorite', 'st sl w', stoneO], ['polished_diorite', 'polished_diorite', 'st sl', stoneO], ['andesite', 'andesite', 'st sl w', stoneO], ['polished_andesite', 'polished_andesite', 'st sl', stoneO],
    ['cobbled_deepslate', 'cobbled_deepslate', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }], ['polished_deepslate', 'polished_deepslate', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }],
    ['deepslate_bricks', 'deepslate_bricks', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }], ['deepslate_tiles', 'deepslate_tiles', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }],
    ['tuff', 'tuff', 'st sl w', stoneO], ['polished_tuff', 'polished_tuff', 'st sl w', stoneO], ['tuff_bricks', 'tuff_bricks', 'st sl w', stoneO],
    ['bricks', 'bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, res: 6 }], ['mud_bricks', 'mud_bricks', 'st sl w', { hard: 1.5, tool: 'pick', req: true, snd: 'mud_bricks' }],
    ['resin_bricks', 'resin_bricks', 'st sl w', { hard: 1.5, tool: 'pick', req: true }],
    ['sandstone', { side: 'sandstone', top: 'sandstone_top', bottom: 'sandstone_bottom' }, 'st sl w', { hard: .8, tool: 'pick', req: true }], ['smooth_sandstone', 'sandstone_top', 'st sl', { hard: 2, tool: 'pick', req: true }], ['cut_sandstone', { side: 'cut_sandstone', ud: 'sandstone_top' }, 'sl', { hard: .8, tool: 'pick', req: true }],
    ['red_sandstone', { side: 'red_sandstone', top: 'red_sandstone_top', bottom: 'red_sandstone_bottom' }, 'st sl w', { hard: .8, tool: 'pick', req: true }], ['smooth_red_sandstone', 'red_sandstone_top', 'st sl', { hard: 2, tool: 'pick', req: true }], ['cut_red_sandstone', { side: 'cut_red_sandstone', ud: 'red_sandstone_top' }, 'sl', { hard: .8, tool: 'pick', req: true }],
    ['prismarine', 'prismarine', 'st sl w', stoneO], ['prismarine_bricks', 'prismarine_bricks', 'st sl', stoneO], ['dark_prismarine', 'dark_prismarine', 'st sl', stoneO],
    ['nether_bricks', 'nether_bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }], ['red_nether_bricks', 'red_nether_bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }],
    ['blackstone', { side: 'blackstone', ud: 'blackstone_top' }, 'st sl w', stoneO], ['polished_blackstone', 'polished_blackstone', 'st sl w', { hard: 2, tool: 'pick', req: true }], ['polished_blackstone_bricks', 'polished_blackstone_bricks', 'st sl w', stoneO],
    ['end_stone_bricks', 'end_stone_bricks', 'st sl w', { hard: 3, tool: 'pick', req: true }], ['purpur_block', 'purpur_block', 'st sl', stoneO],
    ['quartz_block', { side: 'quartz_block_side', top: 'quartz_block_top', bottom: 'quartz_block_bottom' }, 'st sl', { hard: .8, tool: 'pick', req: true }], ['smooth_quartz', 'quartz_block_bottom', 'st sl', { hard: 2, tool: 'pick', req: true }],
    ['cinnabar', 'cinnabar', 'st sl w', stoneO], ['polished_cinnabar', 'polished_cinnabar', 'st sl w', stoneO], ['cinnabar_bricks', 'cinnabar_bricks', 'st sl w', stoneO],
    ['sulfur', 'sulfur', 'st sl w', stoneO], ['polished_sulfur', 'polished_sulfur', 'st sl w', stoneO], ['sulfur_bricks', 'sulfur_bricks', 'st sl w', stoneO]
  ];
  const famBase = {
    stone_bricks: () => C('stone_bricks', 'stone_bricks', stoneO), mossy_stone_bricks: () => C('mossy_stone_bricks', 'mossy_stone_bricks', stoneO),
    polished_tuff: () => C('polished_tuff', 'polished_tuff', stoneO), tuff_bricks: () => C('tuff_bricks', 'tuff_bricks', stoneO),
    bricks: () => C('bricks', 'bricks', { hard: 2, tool: 'pick', req: true, res: 6 }), mud_bricks: () => C('mud_bricks', 'mud_bricks', { hard: 1.5, tool: 'pick', req: true }),
    resin_bricks: () => C('resin_bricks', 'resin_bricks', { hard: 1.5, tool: 'pick', req: true }),
    sandstone: () => C('sandstone', { side: 'sandstone', top: 'sandstone_top', bottom: 'sandstone_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_sandstone: () => C('smooth_sandstone', 'sandstone_top', { hard: 2, tool: 'pick', req: true }), cut_sandstone: () => C('cut_sandstone', { side: 'cut_sandstone', ud: 'sandstone_top' }, { hard: .8, tool: 'pick', req: true }),
    red_sandstone: () => C('red_sandstone', { side: 'red_sandstone', top: 'red_sandstone_top', bottom: 'red_sandstone_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_red_sandstone: () => C('smooth_red_sandstone', 'red_sandstone_top', { hard: 2, tool: 'pick', req: true }), cut_red_sandstone: () => C('cut_red_sandstone', { side: 'cut_red_sandstone', ud: 'red_sandstone_top' }, { hard: .8, tool: 'pick', req: true }),
    prismarine: () => C('prismarine', 'prismarine', stoneO), prismarine_bricks: () => C('prismarine_bricks', 'prismarine_bricks', stoneO), dark_prismarine: () => C('dark_prismarine', 'dark_prismarine', stoneO),
    nether_bricks: () => C('nether_bricks', 'nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }), red_nether_bricks: () => C('red_nether_bricks', 'red_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }),
    blackstone: () => C('blackstone', { side: 'blackstone', ud: 'blackstone_top' }, stoneO), polished_blackstone: () => C('polished_blackstone', 'polished_blackstone', { hard: 2, tool: 'pick', req: true }), polished_blackstone_bricks: () => C('polished_blackstone_bricks', 'polished_blackstone_bricks', stoneO),
    end_stone_bricks: () => C('end_stone_bricks', 'end_stone_bricks', { hard: 3, tool: 'pick', req: true }), purpur_block: () => C('purpur_block', 'purpur_block', stoneO),
    quartz_block: () => C('quartz_block', { side: 'quartz_block_side', top: 'quartz_block_top', bottom: 'quartz_block_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_quartz: () => C('smooth_quartz', 'quartz_block_bottom', { hard: 2, tool: 'pick', req: true }),
    cinnabar: () => C('cinnabar', 'cinnabar', stoneO), polished_cinnabar: () => C('polished_cinnabar', 'polished_cinnabar', stoneO), cinnabar_bricks: () => C('cinnabar_bricks', 'cinnabar_bricks', stoneO),
    sulfur: () => C('sulfur', 'sulfur', stoneO), polished_sulfur: () => C('polished_sulfur', 'polished_sulfur', stoneO), sulfur_bricks: () => C('sulfur_bricks', 'sulfur_bricks', stoneO)
  };
  for (const [base, tex, set, o] of STONE_FAMS) {
    if (famBase[base]) famBase[base]();
    const nm = slabName(base);
    const extra = Object.assign({}, o, base === 'stone' || base.includes('smooth') ? {} : {});
    if (set.includes('st')) stairs(nm + '_stairs', tex, Object.assign({ drop: undefined }, extra));
    if (set.includes('sl')) slab(nm + '_slab', base, Object.assign({}, extra, { tex }));
    if (set.includes('w')) wall(nm + '_wall', typeof tex === 'string' ? tex : tex.side, Object.assign({}, extra));
    if (base === 'stone_bricks') { C('cracked_stone_bricks', 'cracked_stone_bricks', stoneO); C('chiseled_stone_bricks', 'chiseled_stone_bricks', stoneO); }
    if (base === 'tuff_bricks') { C('chiseled_tuff', { side: 'chiseled_tuff', ud: 'chiseled_tuff_top' }, stoneO); C('chiseled_tuff_bricks', { side: 'chiseled_tuff_bricks', ud: 'chiseled_tuff_bricks_top' }, stoneO); }
    if (base === 'mud_bricks') C('packed_mud', 'packed_mud', { hard: 1, tool: 'pick', snd: 'mud_bricks' });
    if (base === 'resin_bricks') { C('chiseled_resin_bricks', 'chiseled_resin_bricks', { hard: 1.5, tool: 'pick', req: true }); C('resin_block', 'resin_block', { hard: 0, snd: 'resin', tab: 'nature' }); }
    if (base === 'sandstone') C('chiseled_sandstone', { side: 'chiseled_sandstone', ud: 'sandstone_top' }, { hard: .8, tool: 'pick', req: true });
    if (base === 'red_sandstone') C('chiseled_red_sandstone', { side: 'chiseled_red_sandstone', ud: 'red_sandstone_top' }, { hard: .8, tool: 'pick', req: true });
    if (base === 'nether_bricks') { C('cracked_nether_bricks', 'cracked_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks' }); C('chiseled_nether_bricks', 'chiseled_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks' }); fence('nether_brick_fence', 'nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', cls: 'nfence', flam: 0 }); }
    if (base === 'polished_blackstone') { C('chiseled_polished_blackstone', 'chiseled_polished_blackstone', stoneO); }
    if (base === 'polished_blackstone_bricks') { C('cracked_polished_blackstone_bricks', 'cracked_polished_blackstone_bricks', stoneO); C('gilded_blackstone', 'gilded_blackstone', stoneO); }
    if (base === 'purpur_block') pillar('purpur_pillar', 'purpur_pillar', 'purpur_pillar_top', stoneO);
    if (base === 'quartz_block') { C('chiseled_quartz_block', { side: 'chiseled_quartz_block', ud: 'chiseled_quartz_block_top' }, { hard: .8, tool: 'pick', req: true }); C('quartz_bricks', 'quartz_bricks', { hard: .8, tool: 'pick', req: true }); pillar('quartz_pillar', 'quartz_pillar', 'quartz_pillar_top', { hard: .8, tool: 'pick', req: true }); }
    if (base === 'cinnabar_bricks') C('chiseled_cinnabar', 'chiseled_cinnabar', stoneO);
    if (base === 'sulfur_bricks') { C('chiseled_sulfur', 'chiseled_sulfur', stoneO); C('potent_sulfur', 'potent_sulfur', Object.assign({ tab: 'nature' }, stoneO)); }
  }
  C('smooth_stone', 'smooth_stone', { hard: 2, tool: 'pick', req: true, res: 6 });
  slab('smooth_stone_slab', 'smooth_stone', { hard: 2, tool: 'pick', req: true, tex: { side: 'smooth_stone_slab_side', ud: 'smooth_stone' } });
  C('end_stone', 'end_stone', { hard: 3, tool: 'pick', req: true, tab: 'nature' });
  C('netherrack', 'netherrack', { hard: .4, tool: 'pick', req: true, snd: 'netherrack', tab: 'nature' });
  pillar('basalt', 'basalt_side', 'basalt_top', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt', tab: 'nature' });
  pillar('polished_basalt', 'polished_basalt_side', 'polished_basalt_top', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt' });
  C('soul_sand', 'soul_sand', { hard: .5, tool: 'shovel', snd: 'soul', tab: 'nature', coll: () => [cb(0, 0, 0, 16, 14, 16)] });
  C('soul_soil', 'soul_soil', { hard: .5, tool: 'shovel', snd: 'soul', tab: 'nature' });
  C('obsidian', 'obsidian', { hard: 50, tool: 'pick', req: true, lvl: 3, res: 1200, tab: 'nature' });
  C('crying_obsidian', 'crying_obsidian', { hard: 50, tool: 'pick', req: true, lvl: 3, res: 1200, light: 10, tab: 'nature' });
  C('glowstone', 'glowstone', { hard: .3, snd: 'glass', light: 15, opq: true, drop: (s, c) => c.silk ? [['glowstone', 1]] : [['glowstone_dust', rr(2, 4)]], tab: 'nature' });
  C('sea_lantern', 'sea_lantern', { hard: .3, snd: 'glass', light: 15, drop: (s, c) => c.silk ? [['sea_lantern', 1]] : [['prismarine_crystals', rr(2, 3)]], tab: 'func' });
  C('magma_block', 'magma', { hard: .5, tool: 'pick', req: true, light: 3, tab: 'nature', magma: 1 });
  C('shroomlight', 'shroomlight', { hard: 1, tool: 'hoe', light: 15, snd: 'wool', tab: 'nature' });
  pillar('bone_block', 'bone_block_side', 'bone_block_top', { hard: 2, tool: 'pick', req: true, snd: 'bone', tab: 'nature' });
  pillar('hay_block', 'hay_block_side', 'hay_block_top', { hard: .5, tool: 'hoe', snd: 'grass', flam: 1, tab: 'nature', soft: .2 });
  C('dried_kelp_block', { side: 'dried_kelp_side', top: 'dried_kelp_top', bottom: 'dried_kelp_bottom' }, { hard: .5, tool: 'hoe', snd: 'grass', tab: 'build' });
  C('sponge', 'sponge', { hard: .6, tool: 'hoe', snd: 'grass', tab: 'nature', sponge: 1 });
  C('wet_sponge', 'wet_sponge', { hard: .6, tool: 'hoe', snd: 'grass', tab: 'nature' });
  C('moss_block', 'moss_block', { hard: .1, tool: 'hoe', snd: 'moss', tab: 'nature' });
  C('pale_moss_block', 'pale_moss_block', { hard: .1, tool: 'hoe', snd: 'moss', tab: 'nature' });
  const carpet = (id, tex, o) => blk(id, Object.assign({ shape: 'model', tex, opq: false, att: 0, hard: .1, snd: 'wool', model: () => [bx(0, 0, 0, 16, 1, 16, tex)], coll: () => [cb(0, 0, 0, 16, 1, 16)], tab: 'color', flam: 1, attach: 3 }, o));
  carpet('moss_carpet', 'moss_block', { snd: 'moss', tab: 'nature' });
  carpet('pale_moss_carpet', 'pale_moss_block', { snd: 'moss', tab: 'nature' });
  C('melon', { side: 'melon_side', ud: 'melon_top' }, { hard: 1, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['melon', 1]] : [['melon_slice', rr(3, 7)]], tab: 'nature' });
  C('pumpkin', { side: 'pumpkin_side', ud: 'pumpkin_top' }, { hard: 1, tool: 'axe', snd: 'wood', tab: 'nature' });
  blk('carved_pumpkin', { props: [P4], tiles: facingTiles('carved_pumpkin', 'pumpkin_side', 'pumpkin_top'), hard: 1, tool: 'axe', snd: 'wood', tab: 'nature', wear: 'head' });
  blk('jack_o_lantern', { name: "Jack o'Lantern", props: [P4], tiles: facingTiles('jack_o_lantern', 'pumpkin_side', 'pumpkin_top'), hard: 1, tool: 'axe', snd: 'wood', light: 15, tab: 'func' });
  C('snow_block', 'snow', { hard: .2, tool: 'shovel', req: true, snd: 'snow', drop: (s, c) => c.silk ? [['snow_block', 1]] : [['snowball', 4]], tab: 'nature' });
  blk('snow', { name: 'Snow', props: [['layers', [1, 2, 3, 4, 5, 6, 7, 8]]], shape: s => sv(s, 'layers') === 7 ? 'cube' : 'model', tex: 'snow', model: s => [bx(0, 0, 0, 16, (sv(s, 'layers') + 1) * 2, 16, 'snow')], coll: s => sv(s, 'layers') === 0 ? [] : [cb(0, 0, 0, 16, sv(s, 'layers') * 2, 16)], sel: s => [cb(0, 0, 0, 16, (sv(s, 'layers') + 1) * 2, 16)], opq: true, att: s => sv(s, 'layers') === 7 ? 15 : 0, hard: .1, tool: 'shovel', req: true, snd: 'snow', repl: s => sv(s, 'layers') === 0, drop: (s, c) => [['snowball', sv(s, 'layers') + 1]], tab: 'nature', icon: 'snow', attach: 3 });
  C('ice', 'ice', { hard: .5, tool: 'pick', snd: 'glass', opq: false, att: 2, cullSame: 1, trans: 1, slip: .98, drop: null, tab: 'nature' });
  C('packed_ice', 'packed_ice', { hard: .5, tool: 'pick', snd: 'glass', slip: .98, drop: (s, c) => c.silk ? [['packed_ice', 1]] : null, tab: 'nature' });
  C('blue_ice', 'blue_ice', { hard: 2.8, tool: 'pick', snd: 'glass', slip: .989, drop: (s, c) => c.silk ? [['blue_ice', 1]] : null, tab: 'nature' });
  C('powder_snow', 'powder_snow', { hard: .25, snd: 'snow', solid: false, opq: false, att: 1, cullSame: 2, trans: 1, item: 'powder_snow_bucket', drop: null, tab: null, powder: 1 });
  C('glass', 'glass', { hard: .3, snd: 'glass', opq: false, att: 0, cullSame: 3, drop: null, tab: 'color' });
  C('tinted_glass', 'tinted_glass', { hard: .3, snd: 'glass', opq: false, att: 15, cullSame: 4, trans: 1, tab: 'color' });
  pane('glass_pane', 'glass', 'glass_pane_top', {});
  C('slime_block', 'slime_block', { hard: 0, snd: 'slime', opq: false, att: 1, trans: 1, cullSame: 5, tab: 'red', bounce: 1 });
  blk('honey_block', { shape: 'model', tex: { top: 'honey_block_top', side: 'honey_block_side', bottom: 'honey_block_bottom' }, model: () => [bx(1, 1, 1, 15, 15, 15, { u: 'honey_block_top', d: 'honey_block_bottom', side: 'honey_block_side' }), bx(0, 0, 0, 16, 16, 16, { u: 'honey_block_top', d: 'honey_block_bottom', side: 'honey_block_side' })], coll: () => [cb(1, 0, 1, 15, 15, 15)], opq: false, att: 1, trans: 1, hard: 0, snd: 'honey', tab: 'red', sticky: 1 });
  C('honeycomb_block', 'honeycomb_block', { hard: .6, snd: 'coral', tab: 'build' });
  C('target', { side: 'target_side', ud: 'target_top' }, { hard: .5, tool: 'hoe', snd: 'grass', tab: 'red' });
  blk('cobweb', crossM({ tex: 'cobweb', icon: 'cobweb', hard: 4, tool: 'sword', snd: 'stone', drop: (s, c) => c.silk || c.shears ? [['cobweb', 1]] : [['string', 1]], web: 1, plant: 0, sel: () => FULLCB, tab: 'nature' }));
  C('sculk', 'sculk', { hard: .2, tool: 'hoe', snd: 'sculk', tab: 'nature', drop: (s, c) => c.silk ? [['sculk', 1]] : null, xp: [1, 1] });
  C('sculk_catalyst', { top: 'sculk_catalyst_top', side: 'sculk_catalyst_side', bottom: 'sculk_catalyst_bottom' }, { hard: 3, tool: 'hoe', light: 6, snd: 'sculk', tab: 'nature' });
  blk('sculk_sensor', { shape: 'model', model: () => [bx(0, 0, 0, 16, 8, 16, { u: 'sculk_sensor_top', d: 'sculk_sensor_bottom', side: 'sculk_sensor_side' })], coll: () => [cb(0, 0, 0, 16, 8, 16)], opq: false, att: 0, hard: 1.5, tool: 'hoe', light: 1, snd: 'sculk', tab: 'red' });
  blk('sculk_shrieker', { shape: 'model', model: () => [bx(0, 0, 0, 16, 8, 16, { u: 'sculk_shrieker_top', d: 'sculk_shrieker_bottom', side: 'sculk_shrieker_side' })], coll: () => [cb(0, 0, 0, 16, 8, 16)], opq: false, att: 0, hard: 3, tool: 'hoe', snd: 'sculk', tab: 'red' });
  C('mushroom_stem', 'mushroom_stem', { hard: .2, tool: 'axe', snd: 'wood', drop: null, tab: 'nature' });
  C('brown_mushroom_block', 'brown_mushroom_block', { hard: .2, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['brown_mushroom_block', 1]] : RNG() < .2 ? [['brown_mushroom', 1]] : null, tab: 'nature' });
  C('red_mushroom_block', 'red_mushroom_block', { hard: .2, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['red_mushroom_block', 1]] : RNG() < .2 ? [['red_mushroom', 1]] : null, tab: 'nature' });
  const WOODS = [
    { n: 'oak', leaf: 'foliage', boat: 1 }, { n: 'spruce', leaf: 'spruce', boat: 1 }, { n: 'birch', leaf: 'birch', boat: 1 }, { n: 'jungle', leaf: 'foliage', boat: 1 }, { n: 'acacia', leaf: 'foliage', boat: 1 },
    { n: 'dark_oak', leaf: 'foliage', boat: 1 }, { n: 'mangrove', leaf: 'mangrove', boat: 1, prop: 'mangrove_propagule' }, { n: 'cherry', leaf: 'none', boat: 1, snd: 'cherry' }, { n: 'pale_oak', leaf: 'none', boat: 1 },
    { n: 'poplar', leaf: 'poplar', boat: 1 }, { n: 'bamboo', bamboo: 1, snd: 'bamboo' }, { n: 'crimson', nether: 1, snd: 'nether_wood' }, { n: 'warped', nether: 1, snd: 'nether_wood' }
  ];
  const woodO = (w, o) => Object.assign({ hard: 2, tool: 'axe', snd: w.snd || 'wood', flam: w.nether ? 0 : 1 }, o);
  const signB = (w, pl) => {
    const t = pl;
    blk(w.n + '_sign', woodO(w, { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', opq: false, solid: false, att: 0, hard: 1, tab: 'func', sign: 1, icon: 'i_' + w.n + '_sign', use: 'sign',
      model: s => { const q = Math.round(sv(s, 'rotation') / 4) & 3; return rotY([bx(0, 7, 7, 16, 15, 9, t), bx(7, 0, 7, 9, 7, 9, w.n === 'bamboo' ? 'bamboo_planks' : (w.nether ? 'stripped_' + w.n + '_stem' : w.n + '_log'))], q); }, sel: () => [cb(4, 0, 4, 12, 16, 12)] }));
    blk(w.n + '_wall_sign', woodO(w, { props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 1, item: w.n + '_sign', name: title(w.n + '_sign'), sign: 1, use: 'sign', drop: w.n + '_sign',
      model: s => rotY([bx(0, 4.5, 14, 16, 12.5, 16, t)], fq(s) + 2), sel: s => rotCB([cb(0, 4.5, 14, 16, 12.5, 16)], fq(s) + 2) }));
    blk(w.n + '_hanging_sign', woodO(w, { props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 1, tab: 'func', sign: 1, icon: 'i_' + w.n + '_hanging_sign', use: 'sign',
      model: s => rotY([bx(1, 0, 7, 15, 10, 9, 'stripped_' + (w.nether ? w.n + '_stem' : w.n === 'bamboo' ? 'bamboo_block' : w.n + '_log')), bx(3, 10, 8, 4, 16, 8, 'chain', { no: 'ewud' }), bx(12, 10, 8, 13, 16, 8, 'chain', { no: 'ewud' })], fq(s)), sel: () => [cb(1, 0, 7, 15, 10, 9)] }));
  };
  for (const w of WOODS) {
    const n = w.n, pl = n + '_planks', log = w.nether ? n + '_stem' : w.bamboo ? 'bamboo_block' : n + '_log';
    if (w.bamboo) {
      pillar('bamboo_block', 'bamboo_block', 'bamboo_block_top', woodO(w, { tags: ['log'], tab: 'build' }));
      pillar('stripped_bamboo_block', 'stripped_bamboo_block', 'stripped_bamboo_block_top', woodO(w, { tags: ['log'] }));
    } else {
      const top = log + '_top', wood = w.nether ? n + '_hyphae' : n + '_wood';
      pillar(log, log, top, woodO(w, { tags: ['log'], tabs: ['build', 'nature'], strip: 'stripped_' + log }));
      pillar(wood, log, log, woodO(w, { tags: ['log'], strip: 'stripped_' + wood }));
      pillar('stripped_' + log, 'stripped_' + log, 'stripped_' + log + '_top', woodO(w, { tags: ['log'] }));
      pillar('stripped_' + wood, 'stripped_' + log, 'stripped_' + log, woodO(w, { tags: ['log'] }));
    }
    C(pl, pl, woodO(w, { tags: ['planks'] }));
    if (w.bamboo) C('bamboo_mosaic', 'bamboo_mosaic', woodO(w, {}));
    stairs(n + '_stairs', pl, woodO(w, {}));
    slab(n + '_slab', pl, woodO(w, {}));
    if (w.bamboo) { stairs('bamboo_mosaic_stairs', 'bamboo_mosaic', woodO(w, {})); slab('bamboo_mosaic_slab', 'bamboo_mosaic', woodO(w, {})); }
    fence(n + '_fence', w.bamboo ? 'bamboo_fence' : pl, woodO(w, { flam: w.nether ? 0 : 1 }));
    gate(n + '_fence_gate', w.bamboo ? 'bamboo_fence_gate' : pl, woodO(w, {}));
    door(n + '_door', n, woodO(w, { hard: 3, icon: 'i_' + n + '_door' }));
    trapdoor(n + '_trapdoor', n + '_trapdoor', woodO(w, { hard: 3 }));
    plate(n + '_pressure_plate', pl, woodO(w, { hard: .5, plateKind: 'all' }));
    button(n + '_button', pl, woodO(w, { hard: .5, btnTime: 30 }));
    signB(w, pl);
    blk(n + '_shelf', woodO(w, { props: [P4], shape: 'model', opq: false, att: 0, tab: 'func', model: s => rotY([bx(0, 0, 11, 16, 16, 16, n + '_shelf_side', { uv: { n: [0, 0, 16, 16] } }), bx(0, 0, 13, 16, 16, 16, pl, { no: 'ewud' })], fq(s)), coll: s => rotCB([cb(0, 0, 11, 16, 16, 16)], fq(s)) }));
    if (!w.bamboo && !w.nether) {
      const leaves = n === 'poplar' ? ['red_poplar_leaves', 'orange_poplar_leaves', 'yellow_poplar_leaves'] : [n + '_leaves'];
      for (const lf of leaves) {
        const tk = w.leaf === 'foliage' ? 2 : w.leaf === 'spruce' ? 4 : w.leaf === 'birch' ? 5 : w.leaf === 'mangrove' ? 6 : 0;
        blk(lf, { props: [['persistent', [false, true]]], tex: lf, opq: false, att: 1, cullSame: 0, hard: .2, tool: 'hoe', snd: n === 'cherry' ? 'cherry_leaves' : 'grass', tint: tk, tags: ['leaves'], flam: 1, tab: 'nature', leafTex: lf,
          drop: (s, c) => { if (c.silk || c.shears) return [[lf, 1]]; const d = []; const sap = w.prop || (n === 'poplar' ? 'poplar_sapling' : n + '_sapling'); if (RNG() < (n === 'jungle' ? .025 : .05)) d.push([sap, 1]); if (RNG() < .02) d.push(['stick', rr(1, 2)]); if ((n === 'oak' || n === 'dark_oak') && RNG() < .005) d.push(['apple', 1]); return d; } });
      }
      if (n === 'mangrove') {
        blk('mangrove_propagule', crossM({ props: [['stage', [0, 1]]], tex: 'mangrove_propagule', icon: 'mangrove_propagule', sapling: 'mangrove' }));
        blk('mangrove_roots', { tex: 'mangrove_roots_side', tiles: () => ['mangrove_roots_side', 'mangrove_roots_side', 'mangrove_roots_top', 'mangrove_roots_top', 'mangrove_roots_side', 'mangrove_roots_side'], opq: false, att: 1, cullSame: 6, hard: .7, tool: 'axe', snd: 'wood', tab: 'nature' });
        pillar('muddy_mangrove_roots', 'muddy_mangrove_roots_side', 'muddy_mangrove_roots_top', { hard: .7, tool: 'shovel', snd: 'mud', tab: 'nature' });
      } else blk(n + '_sapling', crossM({ props: [['stage', [0, 1]]], tex: n + '_sapling', icon: n + '_sapling', sapling: n, tags: ['sapling'] }));
    }
    if (w.nether) {
      C(n === 'crimson' ? 'nether_wart_block' : 'warped_wart_block', n === 'crimson' ? 'nether_wart_block' : 'warped_wart_block', { hard: 1, tool: 'hoe', snd: 'wart', tab: 'nature' });
      blk(n + '_nylium', { tiles: () => [n + '_nylium_side', n + '_nylium_side', n + '_nylium', 'netherrack', n + '_nylium_side', n + '_nylium_side'], hard: .4, tool: 'pick', req: true, snd: 'nylium', drop: 'netherrack', tab: 'nature' });
      plantB(n + '_fungus', n + '_fungus', { sapling: n });
      plantB(n + '_roots', n + '_roots', {});
    }
  }
  blk('bamboo', { props: [['leaves', ['none', 'small', 'large']]], shape: 'model', tex: 'bamboo_stalk', opq: false, att: 0, hard: 1, tool: 'axe', snd: 'bamboo', tab: 'nature', icon: 'i_bamboo', model: s => { const b = [bx(7, 0, 7, 10, 16, 10, 'bamboo_stalk', { uv: { e: [0, 0, 3, 16], w: [0, 0, 3, 16], s: [0, 0, 3, 16], n: [0, 0, 3, 16], u: [13, 0, 16, 3], d: [13, 0, 16, 3] } })]; const l = sv(s, 'leaves'); if (l) b.push(bx(0, 0, 8, 16, 16, 8, l === 2 ? 'bamboo_large_leaves' : 'bamboo_small_leaves', { no: 'ewud' }), bx(8, 0, 0, 8, 16, 16, l === 2 ? 'bamboo_large_leaves' : 'bamboo_small_leaves', { no: 'udsn' })); return b; }, coll: () => [cb(6.5, 0, 6.5, 9.5, 16, 9.5)], grow: 'bamboo' });
  TN.bamboo.tex = 'bamboo_stalk';
  const FLOWERS = ['dandelion', 'golden_dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet', 'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip', 'oxeye_daisy', 'cornflower', 'lily_of_the_valley', 'torchflower', 'wither_rose', 'open_eyeblossom', 'closed_eyeblossom'];
  for (const f of FLOWERS) plantB(f, f, { tags: ['flower'], flower: 1, light: f === 'open_eyeblossom' ? 0 : 0 });
  plantB('short_grass', 'short_grass', { tint: 1, repl: true, drop: (s, c) => c.shears ? [['short_grass', 1]] : RNG() < .125 ? [['wheat_seeds', 1]] : null, offset: 1 });
  plantB('fern', 'fern', { tint: 1, repl: true, drop: (s, c) => c.shears ? [['fern', 1]] : RNG() < .125 ? [['wheat_seeds', 1]] : null, offset: 1 });
  plantB('dead_bush', 'dead_bush', { repl: true, drop: (s, c) => c.shears ? [['dead_bush', 1]] : [['stick', rr(0, 2)]] });
  plantB('bush', 'bush', { tint: 1, repl: true });
  plantB('firefly_bush', 'firefly_bush', { light: 2 });
  plantB('short_dry_grass', 'short_dry_grass', { repl: true, offset: 1 });
  plantB('tall_dry_grass', 'tall_dry_grass', { repl: true, offset: 1 });
  plantB('red_shrub', 'red_shrub', { repl: true, offset: 1 });
  plantB('cactus_flower', 'cactus_flower', {});
  plantB('brown_mushroom', 'brown_mushroom', { light: 1, sel: () => [cb(5, 0, 5, 11, 6, 11)] });
  plantB('red_mushroom', 'red_mushroom', { sel: () => [cb(5, 0, 5, 11, 6, 11)] });
  plantB('sweet_berry_bush', 'sweet_berry_bush_stage3', { props: [['age', [0, 1, 2, 3]]], ctex: s => 'sweet_berry_bush_stage' + sv(s, 'age'), item: 'sweet_berries', def: { age: 3 }, crop: 'berry', drop: s => sv(s, 'age') > 1 ? [['sweet_berries', sv(s, 'age') === 3 ? rr(2, 3) : rr(1, 2)]] : null, hurt: 1 });
  plantB('hanging_roots', 'hanging_roots', { attach: 4 });
  plantB('spore_blossom', 'spore_blossom', { attach: 4 });
  plantB('nether_sprouts', 'nether_sprouts', {});
  plantB('pink_petals', 'pink_petals', { props: [P4, ['flower_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('pink_petals', s), def: { flower_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 3, 16)] });
  plantB('wildflowers', 'wildflowers', { props: [P4, ['flower_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('wildflowers', s), def: { flower_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 3, 16)] });
  plantB('leaf_litter', 'leaf_litter', { props: [P4, ['segment_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('leaf_litter', s, 1), def: { segment_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 1, 16)], tint: 0 });
  plantB('pale_hanging_moss', 'pale_hanging_moss', { props: [['tip', [false, true]]], ctex: s => sv(s, 'tip') ? 'pale_hanging_moss_tip' : 'pale_hanging_moss', attach: 4 });
  for (const [id, base] of [['tall_grass', 'tall_grass'], ['large_fern', 'large_fern'], ['sunflower', 'sunflower'], ['lilac', 'lilac'], ['rose_bush', 'rose_bush'], ['peony', 'peony'], ['pitcher_plant', 'pitcher_plant']]) tallPlant(id, base, { tint: id === 'tall_grass' || id === 'large_fern' ? 1 : 0, repl: id === 'tall_grass' || id === 'large_fern', icon: id === 'sunflower' ? 'sunflower_front' : base + '_top', drop: id === 'tall_grass' || id === 'large_fern' ? (s, c) => c.shears ? [[id, 1]] : !sv(s, 'half') && RNG() < .125 ? [['wheat_seeds', 1]] : null : undefined });
  blk('sugar_cane', crossM({ props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], tex: 'sugar_cane', icon: 'i_sugar_cane', tint: 1, crop: 'cane', sel: () => [cb(2, 0, 2, 14, 16, 14)] }));
  blk('cactus', { props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'cactus_side', model: () => [bx(0, 0, 1, 16, 16, 15, { u: null, d: null, s: 'cactus_side', n: 'cactus_side', e: null, w: null }), bx(1, 0, 0, 15, 16, 16, { u: null, d: null, e: 'cactus_side', w: 'cactus_side', s: null, n: null }), bx(0, 0, 0, 16, 16, 16, { u: 'cactus_top', d: 'cactus_bottom', side: null })], coll: () => [cb(1, 0, 1, 15, 15, 15)], opq: false, att: 0, hard: .4, snd: 'wool', tab: 'nature', crop: 'cactus', hurt: 1 });
  blk('vine', { props: [['north', [false, true]], ['east', [false, true]], ['south', [false, true]], ['west', [false, true]], ['up', [false, true]]], shape: 'model', tex: 'vine', icon: 'vine', opq: false, solid: false, att: 0, hard: .2, tool: 'shears', snd: 'vine', tint: 2, repl: true, climb: 1, tab: 'nature', drop: (s, c) => c.shears ? [['vine', 1]] : null, def: { north: true },
    model: s => { const b = []; ['north', 'east', 'south', 'west'].forEach((k, q) => { if (sv(s, k)) b.push(...rotY([bx(0, 0, .8, 16, 16, .8, { side: null, ud: null, s: 'vine', n: 'vine' }, { ti: 1 })], q)); }); if (sv(s, 'up')) b.push(bx(0, 15.2, 0, 16, 15.2, 16, { side: null, u: 'vine', d: 'vine' }, { ti: 1 })); if (!b.length) b.push(bx(0, 0, .8, 16, 16, .8, { side: null, ud: null, s: 'vine', n: 'vine' }, { ti: 1 })); return b; }, sel: () => [cb(0, 0, 0, 16, 16, 1)] });
  blk('glow_lichen', { props: [['face', ['down', 'up', 'north', 'south', 'west', 'east']]], shape: 'model', tex: 'glow_lichen', icon: 'glow_lichen', opq: false, solid: false, att: 0, hard: .2, snd: 'vine', light: 7, repl: true, tab: 'nature', attach: 2, model: s => { const f = sv(s, 'face'); if (f === 0) return [bx(0, .2, 0, 16, .2, 16, { side: null, u: 'glow_lichen', d: 'glow_lichen' })]; if (f === 1) return [bx(0, 15.8, 0, 16, 15.8, 16, { side: null, u: 'glow_lichen', d: 'glow_lichen' })]; return rotY([bx(0, 0, .2, 16, 16, .2, { side: null, ud: null, s: 'glow_lichen', n: 'glow_lichen' })], [0, 2, 3, 1][f - 2]); }, sel: () => [cb(0, 0, 0, 16, 1, 16)] });
  blk('lily_pad', { shape: 'model', tex: 'lily_pad', icon: 'lily_pad', opq: false, att: 0, hard: 0, snd: 'grass', tint: 7, tab: 'nature', model: () => [bx(0, .25, 0, 16, .25, 16, { side: null, u: 'lily_pad', d: 'lily_pad' }, { ti: 1 })], coll: () => [cb(1, 0, 1, 15, 1.5, 15)], onWater: 1 });
  blk('seagrass', crossM({ tex: 'seagrass', icon: 'seagrass', water: 1, drop: (s, c) => c.shears ? [['seagrass', 1]] : null, repl: true }));
  tallPlant('tall_seagrass', 'tall_seagrass', { water: 1, item: false, drop: (s, c) => c.shears ? [['seagrass', 1]] : null, repl: true });
  blk('kelp', crossM({ tex: 'kelp', icon: 'i_kelp', water: 1, item: 'kelp', crop: 'kelp', props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]]] }));
  blk('kelp_plant', crossM({ tex: 'kelp_plant', water: 1, item: 'kelp', drop: 'kelp' }));
  const CORALS = ['tube', 'brain', 'bubble', 'fire', 'horn'];
  for (const c of CORALS) for (const dead of [0, 1]) {
    const p = dead ? 'dead_' + c : c;
    C(p + '_coral_block', p + '_coral_block', { hard: 1.5, tool: 'pick', req: true, snd: 'coral', tab: 'nature', drop: dead ? undefined : (s, cc) => cc.silk ? [[p + '_coral_block', 1]] : [['dead_' + c + '_coral_block', 1]] });
    plantB(p + '_coral', p + '_coral', { water: !dead, drop: (s, cc) => cc.silk ? [[p + '_coral', 1]] : null, snd: 'coral' });
    plantB(p + '_coral_fan', p + '_coral_fan', { water: !dead, shape: 'model', model: () => coralFan(p + '_coral_fan'), drop: (s, cc) => cc.silk ? [[p + '_coral_fan', 1]] : null, snd: 'coral' });
  }
  blk('sea_pickle', { props: [['pickles', [1, 2, 3, 4]]], shape: 'model', tex: 'sea_pickle', icon: 'i_sea_pickle', opq: false, att: 0, hard: 0, snd: 'slime', light: s => (sv(s, 'pickles') + 1) * 3, tab: 'nature', model: s => { const n = sv(s, 'pickles') + 1, pos = [[6, 6], [3, 9], [9, 3], [10, 10]], b = []; for (let i = 0; i < n; i++) { const [x, z] = pos[i]; b.push(bx(x, 0, z, x + 4, 6, z + 4, { side: 'sea_pickle', ud: 'sea_pickle' }, { uv: { e: [0, 4, 4, 10], w: [0, 4, 4, 10], s: [0, 4, 4, 10], n: [0, 4, 4, 10], u: [4, 0, 8, 4], d: [8, 0, 12, 4] } })); } return b; }, coll: () => [cb(6, 0, 6, 10, 6, 10)], drop: s => [['sea_pickle', sv(s, 'pickles') + 1]] });
  blk('pointed_dripstone', crossM({ props: [['vertical_direction', ['down', 'up']]], tex: 'pointed_dripstone_down_tip', ctex: s => sv(s, 'vertical_direction') ? 'pointed_dripstone_up_tip' : 'pointed_dripstone_down_tip', icon: 'i_pointed_dripstone', hard: 1.5, tool: 'pick', snd: 'stone', attach: 5, hurt: 0 }));
  blk('azalea', { shape: 'model', tex: 'azalea_top', icon3: 1, opq: false, att: 0, hard: 0, snd: 'azalea', tab: 'nature', model: () => [bx(0, 8, 0, 16, 16, 16, { u: 'azalea_top', d: 'azalea_top', side: 'azalea_side' }), bx(.8, 0, 8, 15.2, 8, 8, { side: null, ud: null, n: 'azalea_plant', s: 'azalea_plant' }), bx(8, 0, .8, 8, 8, 15.2, { side: null, ud: null, e: 'azalea_plant', w: 'azalea_plant' })], coll: () => [cb(0, 8, 0, 16, 16, 16), cb(6, 0, 6, 10, 8, 10)], sapling: 'azalea' });
  blk('flowering_azalea', { shape: 'model', tex: 'flowering_azalea_top', icon3: 1, opq: false, att: 0, hard: 0, snd: 'azalea', tab: 'nature', model: () => [bx(0, 8, 0, 16, 16, 16, { u: 'flowering_azalea_top', d: 'flowering_azalea_top', side: 'flowering_azalea_side' }), bx(.8, 0, 8, 15.2, 8, 8, { side: null, ud: null, n: 'azalea_plant', s: 'azalea_plant' }), bx(8, 0, .8, 8, 8, 15.2, { side: null, ud: null, e: 'azalea_plant', w: 'azalea_plant' })], coll: () => [cb(0, 8, 0, 16, 16, 16), cb(6, 0, 6, 10, 8, 10)], sapling: 'azalea' });
  blk('azalea_leaves', { props: [['persistent', [false, true]]], tex: 'azalea_leaves', opq: false, att: 1, hard: .2, tool: 'hoe', snd: 'azalea_leaves', tags: ['leaves'], flam: 1, tab: 'nature', leafTex: 'azalea_leaves', drop: (s, c) => c.silk || c.shears ? [['azalea_leaves', 1]] : RNG() < .05 ? [['azalea', 1]] : RNG() < .02 ? [['stick', 1]] : null });
  blk('flowering_azalea_leaves', { props: [['persistent', [false, true]]], tex: 'flowering_azalea_leaves', opq: false, att: 1, hard: .2, tool: 'hoe', snd: 'azalea_leaves', tags: ['leaves'], flam: 1, tab: 'nature', leafTex: 'flowering_azalea_leaves', drop: (s, c) => c.silk || c.shears ? [['flowering_azalea_leaves', 1]] : RNG() < .05 ? [['flowering_azalea', 1]] : null });
  blk('shelf_mushroom', { props: [P4, ['size', ['small', 'large']]], shape: 'model', tex: 'shelf_mushroom', icon: 'shelf_mushroom', opq: false, att: 0, hard: 0, snd: 'fungus', tab: 'nature', attach: 1, bouncy: .75,
    model: s => { const l = sv(s, 'size'); return rotY([l ? bx(1, 6, 8, 15, 9, 16, { u: 'shelf_mushroom_top', d: 'shelf_mushroom_bottom', side: 'shelf_mushroom_side' }) : bx(3, 7, 10, 13, 9, 16, { u: 'shelf_mushroom_top', d: 'shelf_mushroom_bottom', side: 'shelf_mushroom_side' })], fq(s)); },
    coll: s => rotCB([sv(s, 'size') ? cb(1, 6, 8, 15, 9, 16) : cb(3, 7, 10, 13, 9, 16)], fq(s)), drop: s => [['shelf_mushroom', sv(s, 'size') ? 2 : 1]] });
  const cropB = (id, n, texf, o) => blk(id, crossM(Object.assign({ shape: 'crop', props: [['age', Array.from({ length: n }, (_, i) => i)]], ctex: texf, crop: 'farm', maxAge: n - 1, item: false, sel: s => [cb(0, 0, 0, 16, 2 + sv(s, 'age') * 2, 16)], tab: null, snd: 'crop' }, o)));
  cropB('wheat', 8, s => 'wheat_stage' + sv(s, 'age'), { drop: (s, c) => sv(s, 'age') === 7 ? [['wheat', 1], ['wheat_seeds', rr(0, 3)]] : [['wheat_seeds', 1]], seed: 'wheat_seeds' });
  cropB('carrots', 8, s => 'carrots_stage' + [0, 0, 1, 1, 2, 2, 2, 3][sv(s, 'age')], { drop: s => [['carrot', sv(s, 'age') === 7 ? rr(2, 5) : 1]], seed: 'carrot' });
  cropB('potatoes', 8, s => 'potatoes_stage' + [0, 0, 1, 1, 2, 2, 2, 3][sv(s, 'age')], { drop: s => sv(s, 'age') === 7 ? [['potato', rr(2, 5)]].concat(RNG() < .02 ? [['poisonous_potato', 1]] : []) : [['potato', 1]], seed: 'potato' });
  cropB('beetroots', 4, s => 'beetroots_stage' + sv(s, 'age'), { drop: s => sv(s, 'age') === 3 ? [['beetroot', 1], ['beetroot_seeds', rr(1, 4)]] : [['beetroot_seeds', 1]], seed: 'beetroot_seeds' });
  cropB('torchflower_crop', 2, s => 'torchflower_crop_stage' + sv(s, 'age'), { drop: [['torchflower_seeds', 1]], seed: 'torchflower_seeds', shape: 'cross' });
  cropB('nether_wart', 4, s => 'nether_wart_stage' + [0, 1, 1, 2][sv(s, 'age')], { drop: s => [['nether_wart', sv(s, 'age') === 3 ? rr(2, 4) : 1]], seed: 'nether_wart', soil: 'soul_sand', item: 'nether_wart' });
  for (const k of ['pumpkin', 'melon']) {
    blk(k + '_stem', crossM({ props: [['age', [0, 1, 2, 3, 4, 5, 6, 7]]], shape: 'model', tex: 'stem', crop: 'stem', fruit: k, maxAge: 7, item: false, tint: 8, model: s => { const h = (sv(s, 'age') + 1) * 2; return [bx(.8, 0, 8, 15.2, h, 8, { side: null, ud: null, n: 'stem', s: 'stem' }, { ti: 1, uv: { n: [0, 16 - h, 16, 16], s: [0, 16 - h, 16, 16] } }), bx(8, 0, .8, 8, h, 15.2, { side: null, ud: null, e: 'stem', w: 'stem' }, { ti: 1, uv: { e: [0, 16 - h, 16, 16], w: [0, 16 - h, 16, 16] } })]; }, drop: [[k + '_seeds', 1]] }));
    blk('attached_' + k + '_stem', crossM({ props: [P4], shape: 'model', tex: 'attached_stem', item: false, tint: 9, model: s => rotY([bx(8, 0, 0, 8, 16, 16, { side: null, ud: null, e: 'attached_stem', w: 'attached_stem' }, { ti: 1 })], fq(s) + 1), drop: [[k + '_seeds', 1]] }));
  }
  blk('cocoa', { props: [P4, ['age', [0, 1, 2]]], shape: 'model', tex: 'cocoa_stage2', item: 'cocoa_beans', opq: false, att: 0, hard: .2, tool: 'axe', snd: 'wood', crop: 'cocoa', maxAge: 2, attach: 1, model: s => { const a = sv(s, 'age'), w = 4 + a * 2, h = 5 + a * 2, t = 'cocoa_stage' + a; return rotY([bx(8 - w / 2, 12 - h, 15 - w, 8 + w / 2, 12, 15, t, { uv: { e: [11 - w, 4, 11, 4 + h], w: [11 - w, 4, 11, 4 + h], s: [11 - w, 4, 11, 4 + h], n: [11 - w, 4, 11, 4 + h], u: [0, 0, w, w], d: [0, 0, w, w] } })], fq(s) + 2); }, drop: s => [['cocoa_beans', sv(s, 'age') === 2 ? 3 : 1]] });
  blk('water', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'liquid', tex: { still: 'water_still', flow: 'water_flow' }, fluid: 1, opq: false, solid: false, att: 1, hard: -1, repl: true, item: 'water_bucket', drop: null, trans: 1, tint: 3, tab: null });
  blk('lava', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'liquid', tex: { still: 'lava_still', flow: 'lava_flow' }, fluid: 2, opq: false, solid: false, att: 0, light: 15, hard: -1, repl: true, item: 'lava_bucket', drop: null, tab: null });
  blk('fire', { props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'fire_0', opq: false, solid: false, att: 0, hard: 0, light: 15, repl: true, item: false, drop: null, fire: 1, model: () => fireBoxes('fire_0', 'fire_1') });
  blk('soul_fire', { shape: 'model', tex: 'soul_fire_0', opq: false, solid: false, att: 0, hard: 0, light: 10, repl: true, item: false, drop: null, fire: 1, model: () => fireBoxes('soul_fire_0', 'soul_fire_1') });
  C('crafting_table', { top: 'crafting_table_top', bottom: 'oak_planks', n: 'crafting_table_front', s: 'crafting_table_side', e: 'crafting_table_side', w: 'crafting_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'craft', flam: 1 });
  for (const [id, tx, sp] of [['furnace', 'furnace', 1], ['blast_furnace', 'blast_furnace', 2], ['smoker', 'smoker', 2]]) {
    blk(id, { props: [P4, PLIT], tiles: s => { const t = id === 'furnace' ? [tx + '_side', tx + '_side', tx + '_top', tx + '_top', tx + '_side', tx + '_side'] : id === 'smoker' ? ['smoker_side', 'smoker_side', 'smoker_top', 'smoker_bottom', 'smoker_side', 'smoker_side'] : ['blast_furnace_side', 'blast_furnace_side', 'blast_furnace_top', 'blast_furnace_top', 'blast_furnace_side', 'blast_furnace_side']; t[F4FACE[fq(s)]] = tx + (sv(s, 'lit') ? '_front_on' : '_front'); return t; }, hard: 3.5, tool: 'pick', req: true, light: s => sv(s, 'lit') ? 13 : 0, tab: 'func', use: 'furnace', fkind: id });
  }
  blk('chest', { props: [P4], shape: 'model', tex: 'chest_side', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'chest', cont: 27, flam: 1, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'chest_top', d: 'chest_bottom', side: 'chest_side', n: 'chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('trapped_chest', { props: [P4], shape: 'model', tex: 'chest_side', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'red', use: 'chest', cont: 27, flam: 1, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'chest_top', d: 'chest_bottom', side: 'chest_side', n: 'trapped_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('ender_chest', { props: [P4], shape: 'model', tex: 'ender_chest_side', icon3: 1, opq: false, att: 0, hard: 22.5, tool: 'pick', req: true, light: 7, tab: 'func', use: 'ender', drop: (s, c) => c.silk ? [['ender_chest', 1]] : [['obsidian', 8]], model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'ender_chest_top', d: 'ender_chest_bottom', side: 'ender_chest_side', n: 'ender_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('barrel', { props: [P6, POPEN], tiles: s => { const f = sv(s, 'facing'), top = sv(s, 'open') ? 'barrel_top_open' : 'barrel_top'; if (f === 4) return ['barrel_side', 'barrel_side', top, 'barrel_bottom', 'barrel_side', 'barrel_side']; if (f === 5) return [['barrel_side', 2], ['barrel_side', 2], 'barrel_bottom', top, ['barrel_side', 2], ['barrel_side', 2]]; const t = new Array(6); const fi = F4FACE[f], bi = OPP6[fi]; for (let i = 0; i < 6; i++) t[i] = i === fi ? top : i === bi ? 'barrel_bottom' : (i === 2 || i === 3) ? ['barrel_side', f & 1 ? 1 : 0] : ['barrel_side', 1]; return t; }, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'chest', cont: 27, flam: 1, place6: 1 });
  C('bookshelf', { side: 'bookshelf', ud: 'oak_planks' }, { hard: 1.5, tool: 'axe', snd: 'wood', flam: 1, tab: 'func', drop: (s, c) => c.silk ? [['bookshelf', 1]] : [['book', 3]] });
  blk('chiseled_bookshelf', { props: [P4], tiles: facingTiles('chiseled_bookshelf_empty', 'chiseled_bookshelf_side', 'chiseled_bookshelf_top'), hard: 1.5, tool: 'axe', snd: 'wood', tab: 'func' });
  blk('enchanting_table', { shape: 'model', tex: 'enchanting_table_top', icon3: 1, opq: false, att: 0, hard: 5, tool: 'pick', req: true, light: 7, tab: 'func', res: 1200, model: () => [bx(0, 0, 0, 16, 12, 16, { u: 'enchanting_table_top', d: 'enchanting_table_bottom', side: 'enchanting_table_side' })], coll: () => [cb(0, 0, 0, 16, 12, 16)], use: 'enchant' });
  for (const [id, dmg] of [['anvil', 0], ['chipped_anvil', 1], ['damaged_anvil', 2]]) blk(id, { props: [P4], shape: 'model', tex: 'anvil', icon3: 1, opq: false, att: 0, hard: 5, tool: 'pick', req: true, snd: 'anvil', grav: 1, tab: 'func', res: 1200, anvil: dmg, model: s => rotY([bx(2, 0, 2, 14, 4, 14, 'anvil'), bx(4, 4, 3, 12, 5, 13, 'anvil'), bx(6, 5, 4, 10, 10, 12, 'anvil'), bx(3, 10, 0, 13, 16, 16, { u: 'anvil_top' + (dmg ? '_' + dmg : ''), side: 'anvil', d: 'anvil' })], fq(s) + 1), coll: s => rotCB([cb(3, 10, 0, 13, 16, 16), cb(2, 0, 2, 14, 10, 14)], fq(s) + 1) });
  blk('grindstone', { props: [['face', BTN_FACE], P4], shape: 'model', tex: 'grindstone_side', icon3: 1, opq: false, att: 0, hard: 2, tool: 'pick', req: true, tab: 'func', model: s => rotY([bx(4, 4, 2, 12, 16, 14, { side: 'grindstone_side', e: 'grindstone_pivot', w: 'grindstone_pivot', u: 'grindstone_round', d: 'grindstone_round' }), bx(2, 0, 6, 4, 13, 10, 'dark_oak_log'), bx(12, 0, 6, 14, 13, 10, 'dark_oak_log')], fq(s)), coll: s => rotCB([cb(2, 0, 2, 14, 16, 14)], fq(s)) });
  C('smithing_table', { top: 'smithing_table_top', bottom: 'smithing_table_bottom', side: 'smithing_table_side', n: 'smithing_table_front', s: 'smithing_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  C('fletching_table', { top: 'fletching_table_top', bottom: 'birch_planks', side: 'fletching_table_side', n: 'fletching_table_front', s: 'fletching_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  C('cartography_table', { top: 'cartography_table_top', bottom: 'dark_oak_planks', side: 'cartography_table_side1', n: 'cartography_table_side3', s: 'cartography_table_side2' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('loom', { props: [P4], tiles: facingTiles('loom_front', 'loom_side', 'loom_top', 'loom_bottom'), hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('stonecutter', { props: [P4], shape: 'model', tex: 'stonecutter_side', icon3: 1, opq: false, att: 0, hard: 3.5, tool: 'pick', req: true, tab: 'func', use: 'stonecutter', model: s => rotY([bx(0, 0, 0, 16, 9, 16, { u: 'stonecutter_top', d: 'stonecutter_bottom', side: 'stonecutter_side' }), bx(1, 9, 8, 15, 16, 8, { side: null, ud: null, n: 'stonecutter_saw', s: 'stonecutter_saw' }, { uv: { n: [1, 9, 15, 16], s: [1, 9, 15, 16] } })], fq(s) + 1), coll: () => [cb(0, 0, 0, 16, 9, 16)] });
  blk('lectern', { props: [P4], shape: 'model', tex: 'lectern_sides', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', model: s => rotY([bx(0, 0, 0, 16, 2, 16, { u: 'lectern_base', d: 'oak_planks', side: 'lectern_base' }), bx(4, 2, 4, 12, 15, 12, { side: 'lectern_sides', n: 'lectern_front', ud: 'oak_planks' }), bx(0, 13, 1, 16, 17, 15, { u: 'lectern_top', d: 'oak_planks', side: 'lectern_sides' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 2, 16), cb(4, 2, 4, 12, 14, 12)] });
  blk('composter', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8]]], shape: 'model', tex: 'composter_side', icon3: 1, opq: false, att: 0, hard: .6, tool: 'axe', snd: 'wood', tab: 'func', use: 'composter', model: s => { const l = sv(s, 'level'); const b = [bx(0, 0, 0, 16, 2, 16, { u: 'composter_bottom', d: 'composter_bottom', side: 'composter_side' }), bx(0, 2, 0, 2, 16, 16, { side: 'composter_side', u: 'composter_top' }), bx(14, 2, 0, 16, 16, 16, { side: 'composter_side', u: 'composter_top' }), bx(2, 2, 0, 14, 16, 2, { side: 'composter_side', u: 'composter_top' }), bx(2, 2, 14, 14, 16, 16, { side: 'composter_side', u: 'composter_top' })]; if (l) b.push(bx(2, 0, 2, 14, l === 8 ? 15 : 1 + l * 2, 14, { u: l === 8 ? 'composter_ready' : 'composter_compost', side: null, d: null })); return b; }, coll: () => [cb(0, 0, 0, 16, 2, 16), cb(0, 0, 0, 2, 16, 16), cb(14, 0, 0, 16, 16, 16), cb(0, 0, 0, 16, 16, 2), cb(0, 0, 14, 16, 16, 16)] });
  blk('cauldron', { props: [['level', [0, 1, 2, 3]], ['content', ['water', 'lava', 'powder_snow']]], shape: 'model', tex: 'cauldron_side', icon3: 1, opq: false, att: 0, hard: 2, tool: 'pick', req: true, tab: 'func', use: 'cauldron', light: s => sv(s, 'content') === 1 && sv(s, 'level') ? 15 : 0, drop: 'cauldron', model: s => { const l = sv(s, 'level'), ct = sv(s, 'content'); const b = [bx(0, 3, 0, 2, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(14, 3, 0, 16, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(2, 3, 0, 14, 16, 2, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(2, 3, 14, 14, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(0, 3, 0, 16, 4, 16, { u: 'cauldron_inner', d: 'cauldron_bottom', side: null }), bx(0, 0, 0, 4, 3, 2, 'cauldron_side'), bx(0, 0, 2, 2, 3, 4, 'cauldron_side'), bx(12, 0, 0, 16, 3, 2, 'cauldron_side'), bx(14, 0, 2, 16, 3, 4, 'cauldron_side'), bx(0, 0, 14, 4, 3, 16, 'cauldron_side'), bx(0, 0, 12, 2, 3, 14, 'cauldron_side'), bx(12, 0, 14, 16, 3, 16, 'cauldron_side'), bx(14, 0, 12, 16, 3, 14, 'cauldron_side')]; if (l) b.push(bx(2, 4, 2, 14, 4 + l * 3 + (l === 3 ? 0 : 0) + 3, 14, { u: ct === 0 ? 'water_still' : ct === 1 ? 'lava_still' : 'powder_snow', side: null, d: null }, { ti: ct === 0 ? 1 : 0 })); return b; }, coll: () => [cb(0, 0, 0, 16, 4, 16), cb(0, 0, 0, 2, 16, 16), cb(14, 0, 0, 16, 16, 16), cb(0, 0, 0, 16, 16, 2), cb(0, 0, 14, 16, 16, 16)], tint: s => sv(s, 'content') === 0 ? 3 : 0 });
  blk('brewing_stand', { shape: 'model', tex: 'brewing_stand', icon: 'i_brewing_stand', opq: false, att: 0, hard: .5, tool: 'pick', req: true, light: 1, tab: 'func', model: () => [bx(7, 0, 7, 9, 14, 9, 'brewing_stand'), bx(9, 0, 5, 15, 2, 11, { all: 'brewing_stand_base' }), bx(2, 0, 1, 8, 2, 7, 'brewing_stand_base'), bx(2, 0, 9, 8, 2, 15, 'brewing_stand_base'), bx(0, 2, 8, 16, 16, 8, { side: null, ud: null, n: 'brewing_stand', s: 'brewing_stand' })], coll: () => [cb(1, 0, 1, 15, 2, 15), cb(7, 0, 7, 9, 14, 9)] });
  blk('beacon', { shape: 'model', tex: 'beacon', icon3: 1, opq: false, att: 0, hard: 3, light: 15, tab: 'func', model: () => [bx(0, 0, 0, 16, 16, 16, 'glass'), bx(2, .1, 2, 14, 3, 14, 'obsidian'), bx(3, 3, 3, 13, 14, 13, 'beacon')], cullSame: 0, coll: () => FULLCB });
  blk('conduit', { shape: 'model', tex: 'conduit', icon3: 1, opq: false, att: 0, hard: 3, tool: 'pick', light: 15, tab: 'func', model: () => [bx(5, 5, 5, 11, 11, 11, 'conduit')], coll: () => [cb(5, 5, 5, 11, 11, 11)] });
  blk('bell', { props: [P4], shape: 'model', tex: 'bell_body', icon: 'i_bell', opq: false, att: 0, hard: 5, tool: 'pick', snd: 'anvil', tab: 'func', model: s => rotY([bx(5, 6, 5, 11, 13, 11, 'bell_body'), bx(4, 4, 4, 12, 6, 12, 'bell_body'), bx(2, 13, 7, 14, 15, 9, 'dark_oak_planks'), bx(0, 0, 6, 2, 16, 10, 'stone'), bx(14, 0, 6, 16, 16, 10, 'stone')], fq(s)), coll: s => rotCB([cb(4, 4, 4, 12, 16, 12), cb(0, 0, 6, 2, 16, 10), cb(14, 0, 6, 16, 16, 10)], fq(s)) });
  for (const [id, tex, li] of [['campfire', 'campfire_fire', 15], ['soul_campfire', 'soul_campfire_fire', 10]]) blk(id, { props: [P4, PLIT], shape: 'model', tex: 'campfire_log', icon: 'i_' + id, opq: false, att: 0, hard: 2, tool: 'axe', snd: 'wood', light: s => sv(s, 'lit') ? li : 0, tab: 'func', def: { lit: true }, drop: (s, c) => c.silk ? [[id, 1]] : id === 'campfire' ? [['charcoal', 2]] : [['soul_soil', 1]], hurt: 1, model: s => { const lit = sv(s, 'lit'), lg = { side: 'campfire_log', ud: 'campfire_log', e: 'campfire_log', w: 'campfire_log' }; const b = [bx(1, 0, 0, 5, 4, 16, lg), bx(11, 0, 0, 15, 4, 16, lg), bx(0, 3, 11, 16, 7, 15, lg), bx(0, 3, 1, 16, 7, 5, lg), bx(5, 0, 0, 11, 1, 16, lit ? 'campfire_log_lit' : 'campfire_log')]; if (lit) b.push(bx(.8, 1, 8, 15.2, 17, 8, { side: null, ud: null, n: tex, s: tex }), bx(8, 1, .8, 8, 17, 15.2, { side: null, ud: null, e: tex, w: tex })); return rotY(b, fq(s)); }, coll: () => [cb(0, 0, 0, 16, 7, 16)] });
  for (const [id, tex, li] of [['lantern', 'lantern', 15], ['soul_lantern', 'soul_lantern', 10], ['copper_lantern', 'copper_lantern', 15]]) blk(id, { props: [['hanging', [false, true]]], shape: 'model', tex, icon: 'i_' + id, opq: false, att: 0, hard: 3.5, tool: 'pick', snd: 'lantern', light: li, tab: 'func', attach: 6, model: s => { const h = sv(s, 'hanging') ? 1 : 0; return [bx(5, h, 5, 11, 7 + h, 11, tex, { uv: { e: [0, 2, 6, 9], w: [0, 2, 6, 9], s: [0, 2, 6, 9], n: [0, 2, 6, 9], u: [0, 9, 6, 15], d: [0, 9, 6, 15] } }), bx(6, 7 + h, 6, 10, 9 + h, 10, tex, { uv: { e: [1, 0, 5, 2], w: [1, 0, 5, 2], s: [1, 0, 5, 2], n: [1, 0, 5, 2], u: [1, 10, 5, 14], d: [1, 10, 5, 14] } })]; }, coll: s => [cb(5, sv(s, 'hanging'), 5, 11, 9 + sv(s, 'hanging'), 11)] });
  torchB('torch', 'torch', 14, {});
  torchB('soul_torch', 'soul_torch', 10, {});
  torchB('copper_torch', 'copper_torch', 14, {});
  torchB('redstone_torch', 'redstone_torch', 7, { redstone: 1, tab: 'red', props: [PLIT], def: { lit: true }, light: s => sv(s, 'lit') ? 7 : 0, rtorch: 1, ctexL: 1 }, { props: [P4, PLIT] });
  blk('end_rod', { props: [P6], shape: 'model', tex: 'end_rod', icon3: 1, opq: false, att: 0, hard: 0, light: 14, tab: 'func', model: s => { const f = sv(s, 'facing'); let b = [bx(7, 1, 7, 9, 16, 9, 'end_rod', { uv: { e: [0, 0, 2, 15], w: [0, 0, 2, 15], s: [0, 0, 2, 15], n: [0, 0, 2, 15], u: [2, 0, 4, 2], d: [2, 0, 4, 2] } }), bx(6, 0, 6, 10, 1, 10, 'end_rod', { uv: { e: [2, 2, 6, 3], w: [2, 2, 6, 3], s: [2, 2, 6, 3], n: [2, 2, 6, 3], u: [2, 2, 6, 6], d: [2, 2, 6, 6] } })]; if (f === 5) b = flipY(b); return b; }, coll: () => [cb(6, 0, 6, 10, 16, 10)] });
  blk('chain', { props: [PAX], shape: 'model', tex: 'chain', icon: 'i_chain', opq: false, att: 0, hard: 5, tool: 'pick', req: true, snd: 'chain', tab: 'build', model: s => { const a = sv(s, 'axis'); const b = [bx(6.5, 0, 8, 9.5, 16, 8, { side: null, ud: null, n: 'chain', s: 'chain' }, { uv: { n: [0, 0, 3, 16], s: [0, 0, 3, 16] } }), bx(8, 0, 6.5, 8, 16, 9.5, { side: null, ud: null, e: 'chain', w: 'chain' }, { uv: { e: [3, 0, 6, 16], w: [3, 0, 6, 16] } })]; if (a === 0) return b; const B = b.map(x => Object.assign({}, x, { rx: { ax: a === 1 ? 'z' : 'x', ang: 90, o: [8, 8, 8] } })); return B; }, coll: s => { const a = sv(s, 'axis'); return [a === 0 ? cb(6.5, 0, 6.5, 9.5, 16, 9.5) : a === 1 ? cb(0, 6.5, 6.5, 16, 9.5, 9.5) : cb(6.5, 6.5, 0, 9.5, 9.5, 16)]; } });
  pane('iron_bars', 'iron_bars', 'iron_bars', { hard: 5, tool: 'pick', req: true, snd: 'metal', drop: undefined, cls: 'pane', tab: 'build' });
  blk('ladder', { props: [P4], shape: 'model', tex: 'ladder', icon: 'ladder', opq: false, solid: true, att: 0, hard: .4, tool: 'axe', snd: 'ladder', climb: 1, tab: 'func', attach: 1, flam: 1, model: s => rotY([bx(0, 0, 15.2, 16, 16, 15.2, { side: null, ud: null, n: 'ladder', s: 'ladder' })], fq(s)), coll: s => rotCB([cb(0, 0, 13, 16, 16, 16)], fq(s)) });
  blk('scaffolding', { props: [['distance', [0, 1, 2, 3, 4, 5, 6, 7]], ['bottom', [false, true]]], shape: 'model', tex: 'scaffolding_side', icon3: 1, opq: false, att: 0, hard: 0, snd: 'scaffold', climb: 1, tab: 'func', flam: 1, model: () => [bx(0, 14, 0, 16, 16, 16, { u: 'scaffolding_top', d: 'scaffolding_bottom', side: 'scaffolding_side' }), bx(0, 0, 0, 2, 14, 2, 'scaffolding_side'), bx(14, 0, 0, 16, 14, 2, 'scaffolding_side'), bx(0, 0, 14, 2, 14, 16, 'scaffolding_side'), bx(14, 0, 14, 16, 14, 16, 'scaffolding_side')], coll: () => [cb(0, 14, 0, 16, 16, 16)], sel: () => FULLCB });
  C('jukebox', { side: 'jukebox_side', top: 'jukebox_top', bottom: 'jukebox_side' }, { hard: 2, tool: 'axe', snd: 'wood', tab: 'func', use: 'jukebox', flam: 1 });
  C('note_block', 'note_block', { hard: .8, tool: 'axe', snd: 'wood', tab: 'red', use: 'note', props: [['note', Array.from({ length: 25 }, (_, i) => i)], PPOW], redstone: 1, flam: 1 });
  blk('flower_pot', { props: [['plant', ['none'].concat(FLOWERS, ['oak_sapling', 'spruce_sapling', 'birch_sapling', 'jungle_sapling', 'acacia_sapling', 'dark_oak_sapling', 'cherry_sapling', 'pale_oak_sapling', 'poplar_sapling', 'fern', 'dead_bush', 'red_mushroom', 'brown_mushroom', 'cactus', 'bamboo', 'azalea', 'crimson_fungus', 'warped_fungus', 'crimson_roots', 'warped_roots', 'mangrove_propagule'])]], shape: 'model', tex: 'flower_pot', icon: 'i_flower_pot', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'func', use: 'pot', model: s => { const p = svn(s, 'plant'), b = [bx(5, 0, 5, 6, 6, 11, 'flower_pot'), bx(10, 0, 5, 11, 6, 11, 'flower_pot'), bx(6, 0, 5, 10, 6, 6, 'flower_pot'), bx(6, 0, 10, 10, 6, 11, 'flower_pot'), bx(6, 0, 6, 10, 4, 10, { u: 'dirt', side: null, d: 'flower_pot' })]; if (p !== 'none') { const tx = p === 'cactus' ? 'cactus_side' : p === 'bamboo' ? 'bamboo_stalk' : p === 'azalea' ? 'azalea_plant' : p; if (p === 'cactus') b.push(bx(6, 4, 6, 10, 15, 10, { side: 'cactus_side', u: 'cactus_top', d: null })); else b.push(bx(2.6, 4, 8, 13.4, 16, 8, { side: null, ud: null, n: tx, s: tx }, { ti: p === 'fern' ? 1 : 0 }), bx(8, 4, 2.6, 8, 16, 13.4, { side: null, ud: null, e: tx, w: tx }, { ti: p === 'fern' ? 1 : 0 })); } return b; }, coll: () => [cb(5, 0, 5, 11, 6, 11)], drop: s => { const p = svn(s, 'plant'); return p === 'none' ? [['flower_pot', 1]] : [['flower_pot', 1], [p, 1]]; } });
  blk('decorated_pot', { props: [P4], shape: 'model', tex: 'decorated_pot_side', icon3: 1, opq: false, att: 0, hard: 0, snd: 'decorated_pot', tab: 'func', model: s => rotY([bx(1, 0, 1, 15, 16, 15, { side: 'decorated_pot_side', u: 'decorated_pot_top', d: 'decorated_pot_bottom' }), bx(4, 16, 4, 12, 20, 12, { side: 'decorated_pot_neck', u: 'decorated_pot_top', d: null })], fq(s)), coll: () => [cb(1, 0, 1, 15, 16, 15)] });
  for (const c of COLORS) {
    const dn = title(c);
    C(c + '_wool', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', tags: ['wool'], color: c });
    stairs(c + '_wool_stairs', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', color: c });
    slab(c + '_wool_slab', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', color: c });
    carpet(c + '_carpet', c + '_wool', { color: c });
    C(c + '_terracotta', c + '_terracotta', { hard: 1.25, tool: 'pick', req: true, tab: 'color', color: c });
    blk(c + '_glazed_terracotta', { props: [P4], tiles: s => { const q = fq(s), n = c + '_glazed_terracotta'; return [[n, (q + 1) & 3], [n, (q + 3) & 3], [n, q], [n, (q + 2) & 3], [n, q], [n, (q + 2) & 3]]; }, hard: 1.4, tool: 'pick', req: true, tab: 'color', color: c });
    C(c + '_concrete', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    stairs(c + '_concrete_stairs', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    slab(c + '_concrete_slab', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    C(c + '_concrete_powder', c + '_concrete_powder', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'color', powder2: c + '_concrete', color: c, dust: DYE[c] });
    C(c + '_stained_glass', c + '_stained_glass', { hard: .3, snd: 'glass', opq: false, att: 0, cullSame: 20 + COLORS.indexOf(c), trans: 1, drop: null, tab: 'color', color: c });
    pane(c + '_stained_glass_pane', c + '_stained_glass', c + '_stained_glass_pane_top', { trans: 1, color: c });
    blk(c + '_bed', { props: [P4, ['part', ['foot', 'head']], ['occupied', [false, true]]], shape: 'model', tex: c + '_wool', icon: 'i_' + c + '_bed', opq: false, att: 0, hard: .2, snd: 'wood', tab: 'func', use: 'bed', bed: 1, color: c, bouncy: .66,
      model: s => { const hd = sv(s, 'part'), t = 'bed_' + c; const top = hd ? t + '_top_head' : t + '_top_foot'; const b = [bx(0, 3, 0, 16, 9, 16, { u: top, d: 'oak_planks', side: hd ? t + '_side_head' : t + '_side_foot', n: hd ? t + '_end' : null, s: hd ? null : t + '_end' })]; b.push(bx(0, 0, hd ? 0 : 13, 3, 3, hd ? 3 : 16, 'bed_leg'), bx(13, 0, hd ? 0 : 13, 16, 3, hd ? 3 : 16, 'bed_leg')); return rotY(b, fq(s)); },
      coll: () => [cb(0, 0, 0, 16, 9, 16)], drop: s => sv(s, 'part') ? null : c + '_bed' });
    blk(c + '_candle', { props: [['candles', [1, 2, 3, 4]], PLIT], shape: 'model', tex: c + '_candle', icon: 'i_' + c + '_candle', opq: false, att: 0, hard: .1, snd: 'candle', tab: 'color', light: s => sv(s, 'lit') ? (sv(s, 'candles') + 1) * 3 : 0, model: s => candleBoxes(c + '_candle', s), sel: () => [cb(5, 0, 5, 11, 7, 11)], drop: s => [[c + '_candle', sv(s, 'candles') + 1]], use: 'candle', color: c });
    blk(c + '_shulker_box', { props: [P6], tex: c + '_shulker_box', tiles: () => ['shulker_' + c + '_side', 'shulker_' + c + '_side', 'shulker_' + c + '_top', 'shulker_' + c + '_bottom', 'shulker_' + c + '_side', 'shulker_' + c + '_side'], hard: 2, tool: 'pick', tab: 'func', use: 'chest', cont: 27, shulker: 1, color: c, stack: 1, place6: 1 });
    blk(c + '_banner', { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'banner_' + c, icon: 'i_' + c + '_banner', opq: false, solid: false, att: 0, hard: 1, tool: 'axe', snd: 'wood', tab: 'color', stack: 16, color: c, model: s => rotY([bx(1, 2, 7.5, 15, 30, 8.5, { side: 'banner_' + c, ud: 'banner_' + c }), bx(7.5, 0, 7.5, 8.5, 31, 8.5, 'banner_pole'), bx(1, 30, 7, 15, 31, 9, 'banner_pole')], Math.round(sv(s, 'rotation') / 4)), sel: () => [cb(4, 0, 4, 12, 16, 12)] });
  }
  blk('candle', { props: [['candles', [1, 2, 3, 4]], PLIT], shape: 'model', tex: 'candle', icon: 'i_candle', opq: false, att: 0, hard: .1, snd: 'candle', tab: 'color', light: s => sv(s, 'lit') ? (sv(s, 'candles') + 1) * 3 : 0, model: s => candleBoxes('candle', s), sel: () => [cb(5, 0, 5, 11, 7, 11)], drop: s => [['candle', sv(s, 'candles') + 1]], use: 'candle' });
  blk('shulker_box', { props: [P6], tex: 'shulker_box', tiles: () => ['shulker_side', 'shulker_side', 'shulker_top', 'shulker_bottom', 'shulker_side', 'shulker_side'], hard: 2, tool: 'pick', tab: 'func', use: 'chest', cont: 27, shulker: 1, stack: 1, place6: 1 });
  C('terracotta', 'terracotta', { hard: 1.25, tool: 'pick', req: true, tab: 'color' });
  blk('cake', { props: [['bites', [0, 1, 2, 3, 4, 5, 6]]], shape: 'model', tex: 'cake_top', icon: 'i_cake', opq: false, att: 0, hard: .5, snd: 'wool', tab: 'food', stack: 1, use: 'cake', drop: null, model: s => { const b = sv(s, 'bites'), x0 = 1 + b * 2; return [bx(x0, 0, 1, 15, 8, 15, { u: 'cake_top', d: 'cake_bottom', side: 'cake_side', w: b ? 'cake_inner' : 'cake_side' })]; }, coll: s => [cb(1 + sv(s, 'bites') * 2, 0, 1, 15, 8, 15)] });
  blk('tnt', { tex: { side: 'tnt_side', top: 'tnt_top', bottom: 'tnt_bottom' }, hard: 0, snd: 'grass', tab: 'red', tnt: 1, use: 'tnt', flam: 1, redstone: 1 });
  blk('redstone_wire', { props: [['power', Array.from({ length: 16 }, (_, i) => i)]], shape: 'cmodel', tex: 'redstone_dust_dot', item: 'redstone', name: 'Redstone Wire', opq: false, solid: false, att: 0, hard: 0, snd: 'stone', tint: 10, wire: 1, redstone: 1, attach: 3, drop: 'redstone',
    cmask: (s, nb) => { let m = 0; for (let q = 0; q < 4; q++) { const d = F4D[q], n = nb(d[0], 0, d[1]); const t = TT[STT[n]]; if (t.wire || t.redstone || t.power || (t.rep && (fq(n) & 1) === (q & 1))) m |= 1 << q; else if (!FULLT[n] && TT[STT[nb(d[0], -1, d[1])]].wire) m |= 1 << q; else if (FULLT[n] && !FULLT[nb(0, 1, 0)] && TT[STT[nb(d[0], 1, d[1])]].wire) m |= 17 << q; } return m; },
    cmodel: (s, m) => { const b = [], c = m & 15; const ln = (q) => rotY([bx(0, .25, 0, 16, .25, 8, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1, uv: { u: [0, 0, 16, 8] }, r: { u: 1 } })], q); const cnt = (c & 1) + (c >> 1 & 1) + (c >> 2 & 1) + (c >> 3 & 1); if (cnt === 0) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_dot', d: null }, { ti: 1 })); return b; } if (c === 5 || c === 1 || c === 4) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1 })); } else if (c === 10 || c === 2 || c === 8) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_line1', d: null }, { ti: 1 })); } else { b.push(bx(4, .25, 4, 12, .25, 12, { side: null, u: 'redstone_dust_dot', d: null }, { ti: 1, uv: { u: [4, 4, 12, 12] } })); for (let q = 0; q < 4; q++) if (c & 1 << q) b.push(...rotY([bx(5, .25, 0, 11, .25, 5, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1, uv: { u: [5, 0, 11, 5] } })], q)); } for (let q = 0; q < 4; q++) if (m & 16 << q) b.push(...rotY([bx(0, 0, .25, 16, 16, .25, { side: null, ud: null, s: 'redstone_dust_line0', n: null }, { ti: 1 })], q)); return b; },
    sel: () => [cb(0, 0, 0, 16, 1, 16)] });
  blk('lever', { props: [['face', BTN_FACE], P4, PPOW], shape: 'model', tex: 'lever', icon: 'lever', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', use: 'lever', tab: 'red', attach: 1, redstone: 1,
    model: s => { const f = sv(s, 'face'), p = sv(s, 'powered'); let b = [bx(5, 0, 4, 11, 3, 12, 'cobblestone')]; const h = bx(7, 1, 7, 9, 11, 9, 'lever', { uv: { e: [7, 6, 9, 16], w: [7, 6, 9, 16], s: [7, 6, 9, 16], n: [7, 6, 9, 16], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } }); h.rx = { ax: 'x', ang: p ? -45 : 45, o: [8, 1, 8] }; b.push(h); if (f === 1) b = b.map(B => Object.assign({}, B, { rx2: { ax: 'x', ang: 90, o: [8, 8, 8] } })); if (f === 2) b = b.map(B => Object.assign({}, B, { rx2: { ax: 'x', ang: 180, o: [8, 8, 8] } })); return rotY(b, fq(s) + 2); },
    sel: s => { const f = sv(s, 'face'); return f === 0 ? [cb(4, 0, 4, 12, 6, 12)] : f === 2 ? [cb(4, 10, 4, 12, 16, 12)] : rotCB([cb(5, 4, 10, 11, 12, 16)], fq(s)); } });
  button('stone_button', 'stone', { snd: 'stone', btnTime: 20 }); button('polished_blackstone_button', 'polished_blackstone', { snd: 'stone', btnTime: 20 });
  plate('stone_pressure_plate', 'stone', { snd: 'stone', plateKind: 'mob' }); plate('polished_blackstone_pressure_plate', 'polished_blackstone', { snd: 'stone', plateKind: 'mob' });
  plate('light_weighted_pressure_plate', 'gold_block', { snd: 'metal', plateKind: 'light', props: [['power', Array.from({ length: 16 }, (_, i) => i)]] });
  plate('heavy_weighted_pressure_plate', 'iron_block', { snd: 'metal', plateKind: 'heavy', props: [['power', Array.from({ length: 16 }, (_, i) => i)]] });
  blk('redstone_lamp', { props: [PLIT], tiles: s => new Array(6).fill(sv(s, 'lit') ? 'redstone_lamp_on' : 'redstone_lamp'), hard: .3, snd: 'glass', light: s => sv(s, 'lit') ? 15 : 0, tab: 'red', lamp: 1, redstone: 1 });
  blk('repeater', { props: [P4, ['delay', [1, 2, 3, 4]], PPOW, ['locked', [false, true]]], shape: 'model', tex: 'repeater', icon: 'i_repeater', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'red', rep: 1, redstone: 1, attach: 3, use: 'repeater',
    model: s => { const p = sv(s, 'powered'), d = sv(s, 'delay'), t = p ? 'redstone_torch' : 'redstone_torch_off'; return rotY([bx(0, 0, 0, 16, 2, 16, { u: p ? 'repeater_on' : 'repeater', d: 'smooth_stone', side: 'smooth_stone_slab_side' }), bx(7, 2, 2, 9, 7, 4, t, { uv: { e: [7, 6, 9, 11], w: [7, 6, 9, 11], s: [7, 6, 9, 11], n: [7, 6, 9, 11], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } }), bx(7, 2, 6 + d * 2, 9, 7, 8 + d * 2, t, { uv: { e: [7, 6, 9, 11], w: [7, 6, 9, 11], s: [7, 6, 9, 11], n: [7, 6, 9, 11], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } })], fq(s)); },
    coll: () => [cb(0, 0, 0, 16, 2, 16)], light: s => sv(s, 'powered') ? 7 : 0 });
  blk('comparator', { props: [P4, ['mode', ['compare', 'subtract']], PPOW], shape: 'model', tex: 'comparator', icon: 'i_comparator', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'red', redstone: 1, attach: 3, model: s => rotY([bx(0, 0, 0, 16, 2, 16, { u: sv(s, 'powered') ? 'comparator_on' : 'comparator', d: 'smooth_stone', side: 'smooth_stone_slab_side' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 2, 16)] });
  blk('daylight_detector', { props: [['inverted', [false, true]], ['power', Array.from({ length: 16 }, (_, i) => i)]], shape: 'model', tex: 'daylight_detector_top', icon3: 1, opq: false, att: 0, hard: .2, tool: 'axe', snd: 'wood', tab: 'red', redstone: 1, daylight: 1, use: 'daylight', model: s => [bx(0, 0, 0, 16, 6, 16, { u: sv(s, 'inverted') ? 'daylight_detector_inverted_top' : 'daylight_detector_top', d: 'daylight_detector_side', side: 'daylight_detector_side' })], coll: () => [cb(0, 0, 0, 16, 6, 16)], power: s => sv(s, 'power') });
  blk('observer', { props: [P6, PPOW], tiles: s => { const f = sv(s, 'facing'), t = new Array(6).fill('observer_side'); if (f < 4) { t[F4FACE[f]] = 'observer_front'; t[OPP6[F4FACE[f]]] = sv(s, 'powered') ? 'observer_back_on' : 'observer_back'; t[2] = ['observer_top', f]; t[3] = ['observer_top', f]; } else { t[f === 4 ? 2 : 3] = 'observer_front'; t[f === 4 ? 3 : 2] = sv(s, 'powered') ? 'observer_back_on' : 'observer_back'; } return t; }, hard: 3, tool: 'pick', req: true, tab: 'red', redstone: 1, place6: 2 });
  blk('dispenser', { props: [P6], tiles: s => { const f = sv(s, 'facing'), t = ['furnace_side', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side']; if (f < 4) t[F4FACE[f]] = 'dispenser_front'; else { t[f === 4 ? 2 : 3] = 'dispenser_front_vertical'; } return t; }, hard: 3.5, tool: 'pick', req: true, tab: 'red', use: 'chest', cont: 9, redstone: 1, place6: 2 });
  blk('dropper', { props: [P6], tiles: s => { const f = sv(s, 'facing'), t = ['furnace_side', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side']; if (f < 4) t[F4FACE[f]] = 'dropper_front'; else { t[f === 4 ? 2 : 3] = 'dropper_front_vertical'; } return t; }, hard: 3.5, tool: 'pick', req: true, tab: 'red', use: 'chest', cont: 9, redstone: 1, place6: 2 });
  blk('hopper', { props: [['facing', ['down', 'north', 'south', 'west', 'east']]], shape: 'model', tex: 'hopper_outside', icon: 'i_hopper', opq: false, att: 0, hard: 3, tool: 'pick', req: true, snd: 'metal', tab: 'red', use: 'chest', cont: 5, model: () => [bx(0, 10, 0, 16, 11, 16, { u: 'hopper_inside', d: 'hopper_outside', side: 'hopper_outside' }), bx(0, 11, 0, 2, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(14, 11, 0, 16, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(2, 11, 0, 14, 16, 2, { side: 'hopper_outside', u: 'hopper_top' }), bx(2, 11, 14, 14, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(4, 4, 4, 12, 10, 12, 'hopper_outside'), bx(6, 0, 6, 10, 4, 10, 'hopper_outside')], coll: () => [cb(0, 10, 0, 16, 16, 16), cb(4, 4, 4, 12, 10, 12), cb(6, 0, 6, 10, 4, 10)] });
  for (const id of ['piston', 'sticky_piston']) blk(id, { props: [P6, ['extended', [false, true]]], tiles: s => { const f = sv(s, 'facing'), front = id === 'sticky_piston' ? 'piston_top_sticky' : 'piston_top'; const t = new Array(6); if (f < 4) { const fi = F4FACE[f]; for (let i = 0; i < 6; i++) t[i] = i === fi ? front : i === OPP6[fi] ? 'piston_bottom' : ['piston_side', i === 2 ? (f + 2) & 3 : i === 3 ? (f + 2) & 3 : f & 1 ? (f === 1 ? 3 : 1) : f === 0 ? 2 : 0]; } else for (let i = 0; i < 6; i++) t[i] = i === 2 ? (f === 4 ? front : 'piston_bottom') : i === 3 ? (f === 4 ? 'piston_bottom' : front) : ['piston_side', f === 4 ? 0 : 2]; return t; }, hard: 1.5, tool: 'pick', tab: 'red', redstone: 1, piston: id === 'sticky_piston' ? 2 : 1, place6: 2 });
  blk('tripwire_hook', { props: [P4, PPOW], shape: 'model', tex: 'tripwire_hook', icon: 'tripwire_hook', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', tab: 'red', attach: 1, redstone: 1, model: s => rotY([bx(6, 1, 14, 10, 9, 16, 'oak_planks'), bx(7.5, 5, 6, 8.5, 6, 14, 'tripwire_hook')], fq(s)), sel: s => rotCB([cb(5, 0, 10, 11, 10, 16)], fq(s)) });
  blk('lightning_rod', { props: [P6], shape: 'model', tex: 'lightning_rod', icon3: 1, opq: false, att: 0, hard: 3, tool: 'pick', req: true, snd: 'copper', tab: 'red', model: () => [bx(7, 0, 7, 9, 12, 9, 'lightning_rod', { uv: { e: [0, 4, 2, 16], w: [0, 4, 2, 16], s: [0, 4, 2, 16], n: [0, 4, 2, 16], u: [0, 0, 2, 2], d: [0, 0, 2, 2] } }), bx(6, 12, 6, 10, 16, 10, 'lightning_rod', { uv: { e: [0, 0, 4, 4], w: [0, 0, 4, 4], s: [0, 0, 4, 4], n: [0, 0, 4, 4], u: [0, 0, 4, 4], d: [0, 0, 4, 4] } })], coll: () => [cb(6, 0, 6, 10, 16, 10)] });
  for (const [id, tex] of [['rail', 'rail'], ['powered_rail', 'powered_rail'], ['detector_rail', 'detector_rail'], ['activator_rail', 'activator_rail']]) blk(id, { props: [['shape', id === 'rail' ? ['north_south', 'east_west', 'ascending_east', 'ascending_west', 'ascending_north', 'ascending_south', 'south_east', 'south_west', 'north_west', 'north_east'] : ['north_south', 'east_west', 'ascending_east', 'ascending_west', 'ascending_north', 'ascending_south']], PPOW], shape: 'model', tex, icon: tex, opq: false, solid: false, att: 0, hard: .7, tool: 'pick', snd: 'metal', tab: 'red', rail: 1, attach: 3, model: s => railBoxes(id === 'rail' ? tex : sv(s, 'powered') ? tex + '_on' : tex, sv(s, 'shape'), id === 'rail' ? 'rail_corner' : null), sel: () => [cb(0, 0, 0, 16, 2, 16)] });
  blk('respawn_anchor', { props: [['charges', [0, 1, 2, 3, 4]]], tiles: s => ['respawn_anchor_side' + sv(s, 'charges'), 'respawn_anchor_side' + sv(s, 'charges'), sv(s, 'charges') ? 'respawn_anchor_top' : 'respawn_anchor_top_off', 'respawn_anchor_bottom', 'respawn_anchor_side' + sv(s, 'charges'), 'respawn_anchor_side' + sv(s, 'charges')], hard: 50, tool: 'pick', req: true, lvl: 3, light: s => [0, 3, 7, 11, 15][sv(s, 'charges')], tab: 'func' });
  C('lodestone', { side: 'lodestone_side', ud: 'lodestone_top' }, { hard: 3.5, tool: 'pick', snd: 'lodestone', tab: 'func' });
  blk('spawner', { tex: 'spawner', opq: false, att: 0, cullSame: 7, hard: 5, tool: 'pick', req: true, snd: 'metal', drop: null, xp: [15, 43], tab: 'eggs' });
  blk('trial_spawner', { tex: { side: 'trial_spawner_side', top: 'trial_spawner_top', bottom: 'trial_spawner_bottom' }, opq: false, att: 0, cullSame: 8, hard: 50, tool: 'pick', snd: 'metal', drop: null, tab: 'eggs' });
  blk('vault', { props: [P4], tiles: facingTiles('vault_front', 'vault_side', 'vault_top', 'vault_bottom'), opq: false, att: 0, cullSame: 9, hard: 50, snd: 'metal', drop: null, tab: 'func' });
  blk('crafter', { props: [P6], tiles: () => ['crafter_east', 'crafter_west', 'crafter_top', 'crafter_bottom', 'crafter_south', 'crafter_north'], hard: 1.5, tool: 'pick', req: true, tab: 'red', place6: 2 });
  blk('heavy_core', { shape: 'model', tex: 'heavy_core', icon3: 1, opq: false, att: 0, hard: 10, snd: 'heavy_core', tab: 'func', model: () => [bx(4, 0, 4, 12, 8, 12, 'heavy_core')], coll: () => [cb(4, 0, 4, 12, 8, 12)] });
  blk('end_portal_frame', { props: [P4, ['eye', [false, true]]], shape: 'model', tex: 'end_portal_frame_side', icon3: 1, opq: false, att: 0, hard: -1, light: 1, tab: 'func', model: s => { const b = [bx(0, 0, 0, 16, 13, 16, { u: 'end_portal_frame_top', d: 'end_stone', side: 'end_portal_frame_side' })]; if (sv(s, 'eye')) b.push(bx(4, 13, 4, 12, 16, 12, { u: 'end_portal_frame_eye', side: 'end_portal_frame_eye', d: null }, { uv: { e: [4, 0, 12, 3], w: [4, 0, 12, 3], s: [4, 0, 12, 3], n: [4, 0, 12, 3], u: [4, 4, 12, 12] } })); return rotY(b, fq(s)); }, coll: () => [cb(0, 0, 0, 16, 13, 16)] });
  blk('beehive', { props: [P4, ['honey_level', [0, 1, 2, 3, 4, 5]]], tiles: s => { const t = ['beehive_side', 'beehive_side', 'beehive_end', 'beehive_end', 'beehive_side', 'beehive_side']; t[F4FACE[fq(s)]] = sv(s, 'honey_level') === 5 ? 'beehive_front_honey' : 'beehive_front'; return t; }, hard: .6, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('bee_nest', { props: [P4, ['honey_level', [0, 1, 2, 3, 4, 5]]], tiles: s => { const t = ['bee_nest_side', 'bee_nest_side', 'bee_nest_top', 'bee_nest_bottom', 'bee_nest_side', 'bee_nest_side']; t[F4FACE[fq(s)]] = sv(s, 'honey_level') === 5 ? 'bee_nest_front_honey' : 'bee_nest_front'; return t; }, hard: .3, tool: 'axe', snd: 'wood', tab: 'nature', flam: 1, drop: (s, c) => c.silk ? [['bee_nest', 1]] : null });
  blk('dragon_egg', { shape: 'model', tex: 'dragon_egg', icon3: 1, opq: false, att: 0, hard: 3, light: 1, grav: 1, tab: 'func', model: () => [bx(6, 15, 6, 10, 16, 10, 'dragon_egg'), bx(5, 14, 5, 11, 15, 11, 'dragon_egg'), bx(4, 13, 4, 12, 14, 12, 'dragon_egg'), bx(3, 11, 3, 13, 13, 13, 'dragon_egg'), bx(2, 8, 2, 14, 11, 14, 'dragon_egg'), bx(1, 3, 1, 15, 8, 15, 'dragon_egg'), bx(2, 1, 2, 14, 3, 14, 'dragon_egg'), bx(3, 0, 3, 13, 1, 13, 'dragon_egg')], coll: () => [cb(1, 0, 1, 15, 16, 15)] });
  for (const [id, tex] of [['ochre_froglight', 'ochre_froglight'], ['verdant_froglight', 'verdant_froglight'], ['pearlescent_froglight', 'pearlescent_froglight']]) pillar(id, tex + '_side', tex + '_top', { hard: .3, snd: 'froglight', light: 15, tab: 'nature' });
  blk('creaking_heart', { props: [PAX, ['state', ['uprooted', 'dormant', 'awake']]], tiles: s => { const st = sv(s, 'state'), side = st === 2 ? 'creaking_heart_awake' : st === 1 ? 'creaking_heart_dormant' : 'creaking_heart', top = 'creaking_heart_top'; return pillarTiles(side, top)(s); }, hard: 10, tool: 'axe', snd: 'creaking_heart', tab: 'nature' });
  const COPPER = [['', 'copper_block'], ['exposed_', 'exposed_copper'], ['weathered_', 'weathered_copper'], ['oxidized_', 'oxidized_copper']];
  for (const wax of [0, 1]) for (const [p, tex] of COPPER) {
    const w = wax ? 'waxed_' : '';
    const co = { hard: 3, tool: 'pick', req: true, lvl: 1, snd: 'copper', ox: wax ? -1 : COPPER.findIndex(c => c[0] === p), tab: 'build' };
    C(w + (p ? p + 'copper' : 'copper_block'), tex, co);
    C(w + p + 'chiseled_copper', p + 'chiseled_copper', co);
    C(w + p + 'copper_grate', p + 'copper_grate', Object.assign({}, co, { opq: false, att: 0, cullSame: 30 }));
    C(w + p + 'cut_copper', p + 'cut_copper', co);
    stairs(w + p + 'cut_copper_stairs', p + 'cut_copper', co); slab(w + p + 'cut_copper_slab', p + 'cut_copper', co);
    door(w + p + 'copper_door', p + 'copper', Object.assign({}, co, { tab: 'build', icon: 'i_' + p + 'copper_door' }));
    trapdoor(w + p + 'copper_trapdoor', p + 'copper_trapdoor', Object.assign({}, co));
    blk(w + p + 'copper_bulb', Object.assign({}, co, { props: [PLIT, PPOW], tiles: s => new Array(6).fill(p + 'copper_bulb' + (sv(s, 'lit') ? '_lit' : '') + (sv(s, 'powered') ? '_powered' : '')), light: s => sv(s, 'lit') ? [15, 12, 8, 4][COPPER.findIndex(c => c[0] === p)] : 0, tab: 'red', redstone: 1, bulb: 1 }));
    blk(w + p + 'copper_chest', Object.assign({}, co, { props: [P4], shape: 'model', tex: p + 'copper_chest_side', icon3: 1, opq: false, att: 0, tab: 'func', use: 'chest', cont: 27, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: p + 'copper_chest_top', d: p + 'copper_chest_top', side: p + 'copper_chest_side', n: p + 'copper_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] }));
  }
  door('iron_door', 'iron', { hard: 5, tool: 'pick', req: true, snd: 'metal', use: 'idoor', icon: 'i_iron_door', tab: 'red' });
  trapdoor('iron_trapdoor', 'iron_trapdoor', { hard: 5, tool: 'pick', req: true, snd: 'metal', use: 'idoor', tab: 'red' });
  for (const [id, tex] of [['skeleton_skull', 'skeleton'], ['wither_skeleton_skull', 'wither_skeleton'], ['zombie_head', 'zombie'], ['player_head', 'steve'], ['creeper_head', 'creeper'], ['piglin_head', 'piglin'], ['dragon_head', 'dragon']]) {
    blk(id, { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'head_' + tex + '_front', icon3: 1, opq: false, att: 0, hard: 1, snd: 'stone', tab: 'func', wear: 'head', head: tex, model: s => rotY([bx(4, 0, 4, 12, 8, 12, { u: 'head_' + tex + '_top', d: 'head_' + tex + '_top', side: 'head_' + tex + '_side', n: 'head_' + tex + '_front', s: 'head_' + tex + '_back' })], Math.round(sv(s, 'rotation') / 4)), coll: () => [cb(4, 0, 4, 12, 8, 12)] });
    blk(id.replace(/_(skull|head)$/, '_wall_$1'), { props: [P4], shape: 'model', tex: 'head_' + tex + '_front', opq: false, att: 0, hard: 1, snd: 'stone', item: id, name: title(id), drop: id, head: tex, model: s => rotY([bx(4, 4, 8, 12, 12, 16, { u: 'head_' + tex + '_top', d: 'head_' + tex + '_top', side: 'head_' + tex + '_side', n: 'head_' + tex + '_front', s: 'head_' + tex + '_back' })], fq(s)), coll: s => rotCB([cb(4, 4, 8, 12, 12, 16)], fq(s)) });
  }
  blk('straw_bed', { props: [P4, ['part', ['foot', 'head']]], shape: 'model', tex: 'straw_bed_top', icon: 'i_straw_bed', opq: false, att: 0, hard: .2, tool: 'hoe', snd: 'grass', tab: 'func', use: 'bed', bed: 2, model: s => rotY([bx(0, 0, 0, 16, 5, 16, { u: sv(s, 'part') ? 'straw_bed_top_head' : 'straw_bed_top', d: 'hay_block_top', side: 'straw_bed_side' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 5, 16)], drop: s => sv(s, 'part') ? null : 'straw_bed' });
  blk('light', { props: [['level', Array.from({ length: 16 }, (_, i) => i)]], shape: 'none', opq: false, solid: false, att: 0, hard: -1, light: s => sv(s, 'level'), repl: true, tab: null, icon: 'i_light', def: { level: 15 } });
  blk('barrier', { shape: 'none', opq: false, att: 0, hard: -1, tab: null, icon: 'i_barrier' });
  blk('structure_void', { shape: 'none', opq: false, solid: false, att: 0, hard: 0, tab: null, icon: 'i_structure_void', repl: true });
  C('command_block', { side: 'command_block_side', n: 'command_block_front', s: 'command_block_back', ud: 'command_block_side' }, { hard: -1, tab: null });
  blk('nether_portal', { props: [['axis', ['x', 'z']]], shape: 'model', tex: 'nether_portal', opq: false, solid: false, att: 0, hard: -1, light: 11, trans: 1, item: false, drop: null, model: s => sv(s, 'axis') ? [bx(6, 0, 0, 10, 16, 16, { side: null, ud: null, e: 'nether_portal', w: 'nether_portal' })] : [bx(0, 0, 6, 16, 16, 10, { side: null, ud: null, n: 'nether_portal', s: 'nether_portal' })] });
  function crossBoxes(t, s, h, w) { const f = sv(s, 'facing'); let b = [bx(8 - w, 0, 8, 8 + w, h * 2, 8, { side: null, ud: null, n: t, s: t }, { uv: { n: [8 - w, 16 - h * 2, 8 + w, 16], s: [8 - w, 16 - h * 2, 8 + w, 16] } }), bx(8, 0, 8 - w, 8, h * 2, 8 + w, { side: null, ud: null, e: t, w: t }, { uv: { e: [8 - w, 16 - h * 2, 8 + w, 16], w: [8 - w, 16 - h * 2, 8 + w, 16] } })]; if (f === 5) b = flipY(b); else if (f < 4) b = b.map(B => Object.assign({}, B, { rx: { ax: 'x', ang: 90, o: [8, 8, 8], q: 0 } })), b = rotY(b, f); return b; }
  function budSel(s, h, w) { return [cb(8 - w, 0, 8 - w, 8 + w, h * 2, 8 + w)]; }
  function petals(t, s, flat) { const n = sv(s, 'flower_amount') + 1 || sv(s, 'segment_amount') + 1, b = []; const q = [[0, 0], [8, 0], [8, 8], [0, 8]]; for (let i = 0; i < n; i++) { const [x, z] = q[i]; b.push(bx(x, flat ? .3 : 1.5, z, x + 8, flat ? .3 : 1.5, z + 8, { side: null, u: t, d: t }, { uv: { u: [x, z, x + 8, z + 8], d: [x, z, x + 8, z + 8] } })); } return rotY(b, fq(s)); }
  function coralFan(t) { return [bx(0, 0, 8, 16, 8, 8, { side: null, ud: null, n: t, s: t }, { uv: { n: [0, 8, 16, 16], s: [0, 8, 16, 16] } }), bx(8, 0, 0, 8, 8, 16, { side: null, ud: null, e: t, w: t }, { uv: { e: [0, 8, 16, 16], w: [0, 8, 16, 16] } })]; }
  function fireBoxes(a, b) { return [bx(0, 0, .02, 16, 22.4, .02, { side: null, ud: null, s: a, n: a }), bx(0, 0, 15.98, 16, 22.4, 15.98, { side: null, ud: null, s: b, n: b }), bx(.02, 0, 0, .02, 22.4, 16, { side: null, ud: null, e: a, w: a }), bx(15.98, 0, 0, 15.98, 22.4, 16, { side: null, ud: null, e: b, w: b }), bx(.8, 0, 8, 15.2, 22.4, 8, { side: null, ud: null, n: a, s: a }), bx(8, 0, .8, 8, 22.4, 15.2, { side: null, ud: null, e: b, w: b })]; }
  function candleBoxes(t, s) { const n = sv(s, 'candles') + 1, lit = sv(s, 'lit'), P = [[[7, 7]], [[5, 7], [9, 6]], [[5, 6], [8, 8], [9, 5]], [[5, 5], [9, 5], [5, 8], [8, 8]]][n - 1], b = []; for (const [x, z] of P) { const h = 6; b.push(bx(x, 0, z, x + 2, h, z + 2, t, { uv: { e: [0, 8, 2, 14], w: [0, 8, 2, 14], s: [0, 8, 2, 14], n: [0, 8, 2, 14], u: [0, 6, 2, 8], d: [0, 14, 2, 16] } })); b.push(bx(x + .5, h, z + 1, x + 1.5, h + 1, z + 1, { side: null, ud: null, n: t, s: t }, { uv: { n: [0, 5, 1, 6], s: [0, 5, 1, 6] } })); } return b; }
  function railBoxes(t, shp, corner) {
    const flatB = (tex, r) => [bx(0, 1, 0, 16, 1, 16, { side: null, u: tex, d: tex }, { r: { u: r, d: r } })];
    if (shp === 0) return flatB(t, 0);
    if (shp === 1) return flatB(t, 1);
    if (shp <= 5) { const q = [1, 3, 0, 2][shp - 2]; const B = bx(0, 1, 0, 16, 1, 16, { side: null, u: t, d: t }); B.rx = { ax: 'x', ang: 45, o: [8, 1, 16] }; B.sc = 1.414; return rotY([B], q); }
    const q = [1, 2, 3, 0][shp - 6]; return rotY(flatB(corner, 0), q + 1);
  }
  const TIERS = {
    wooden: { sp: 2, dur: 59, lvl: 0, sw: 4, ax: 7, axs: .8, pk: 2, sh: 2.5, hs: 1, mat: 'planks', ench: 15 },
    stone: { sp: 4, dur: 131, lvl: 1, sw: 5, ax: 9, axs: .8, pk: 3, sh: 3.5, hs: 2, mat: 'cobblestone', ench: 5 },
    copper: { sp: 5, dur: 190, lvl: 1, sw: 5, ax: 9, axs: .8, pk: 3, sh: 3.5, hs: 2.5, mat: 'copper_ingot', ench: 13 },
    iron: { sp: 6, dur: 250, lvl: 2, sw: 6, ax: 9, axs: .9, pk: 4, sh: 4.5, hs: 3, mat: 'iron_ingot', ench: 14 },
    golden: { sp: 12, dur: 32, lvl: 0, sw: 4, ax: 7, axs: 1, pk: 2, sh: 2.5, hs: 1, mat: 'gold_ingot', ench: 22 },
    diamond: { sp: 8, dur: 1561, lvl: 3, sw: 7, ax: 9, axs: 1, pk: 5, sh: 5.5, hs: 4, mat: 'diamond', ench: 10 },
    netherite: { sp: 9, dur: 2031, lvl: 4, sw: 8, ax: 10, axs: 1, pk: 6, sh: 6.5, hs: 4, mat: 'netherite_ingot', ench: 15 }
  };
  for (const tn in TIERS) {
    const T = TIERS[tn];
    itm(tn + '_sword', { stack: 1, dur: T.dur, tab: 'combat', tool: { k: 'sword', sp: 1.5, lvl: T.lvl }, dmg: T.sw, aspd: 1.6, tex: 'i_' + tn + '_sword', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_shovel', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'shovel', sp: T.sp, lvl: T.lvl }, dmg: T.sh, aspd: 1, tex: 'i_' + tn + '_shovel', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_pickaxe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'pick', sp: T.sp, lvl: T.lvl }, dmg: T.pk, aspd: 1.2, tex: 'i_' + tn + '_pickaxe', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_axe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'axe', sp: T.sp, lvl: T.lvl }, dmg: T.ax, aspd: T.axs, tex: 'i_' + tn + '_axe', fuel: tn === 'wooden' ? 200 : 0, tabs: ['tools', 'combat'] });
    itm(tn + '_hoe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'hoe', sp: T.sp, lvl: T.lvl }, dmg: 1, aspd: T.hs, tex: 'i_' + tn + '_hoe', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_spear', { stack: 1, dur: T.dur, tab: 'combat', dmg: T.sw - 1, aspd: 1.25, reach: 1, tex: 'i_' + tn + '_spear', spear: 1, fuel: tn === 'wooden' ? 200 : 0 });
  }
  const ARM = {
    leather: { d: [1, 3, 2, 1], m: 5, t: 0, names: ['leather_helmet', 'leather_chestplate', 'leather_leggings', 'leather_boots'], disp: ['Leather Cap', 'Leather Tunic', 'Leather Pants', 'Leather Boots'] },
    chainmail: { d: [2, 5, 4, 1], m: 15, t: 0 }, copper: { d: [2, 4, 3, 1], m: 11, t: 0 }, iron: { d: [2, 6, 5, 2], m: 15, t: 0 }, golden: { d: [2, 5, 3, 1], m: 7, t: 0 },
    diamond: { d: [3, 8, 6, 3], m: 33, t: 2 }, netherite: { d: [3, 8, 6, 3], m: 37, t: 3, kb: .1 }
  };
  const SLOTN = ['helmet', 'chestplate', 'leggings', 'boots'], SLOTB = [11, 16, 15, 13];
  for (const an in ARM) {
    const A = ARM[an];
    for (let i = 0; i < 4; i++) {
      const id = an + '_' + SLOTN[i];
      itm(id, { name: A.disp ? A.disp[i] : undefined, stack: 1, dur: SLOTB[i] * A.m, tab: 'combat', armor: { slot: i, def: A.d[i], tough: A.t, kb: A.kb || 0, mat: an }, tex: 'i_' + id });
    }
  }
  itm('turtle_helmet', { stack: 1, dur: 275, tab: 'combat', armor: { slot: 0, def: 2, tough: 0, mat: 'turtle' }, tex: 'i_turtle_helmet' });
  itm('elytra', { stack: 1, dur: 432, tab: 'tools', armor: { slot: 1, def: 0, tough: 0, mat: 'elytra' }, tex: 'i_elytra' });
  itm('wolf_armor', { stack: 1, dur: 64, tab: 'combat', tex: 'i_wolf_armor' });
  for (const h of ['leather', 'copper', 'iron', 'golden', 'diamond', 'netherite']) itm(h + '_horse_armor', { stack: 1, tab: 'combat', tex: 'i_' + h + '_horse_armor' });
  for (const h of ['copper', 'iron', 'golden', 'diamond', 'netherite']) itm(h + '_nautilus_armor', { stack: 1, tab: 'combat', tex: 'i_' + h + '_nautilus_armor' });
  itm('shield', { stack: 1, dur: 336, tab: 'combat', tex: 'i_shield', shield: 1, fuel: 300 });
  itm('bow', { stack: 1, dur: 384, tab: 'combat', tex: 'i_bow', bow: 1, fuel: 300 });
  itm('crossbow', { stack: 1, dur: 465, tab: 'combat', tex: 'i_crossbow_standby', crossbow: 1, fuel: 300 });
  itm('trident', { stack: 1, dur: 250, tab: 'combat', dmg: 9, aspd: 1.1, tex: 'i_trident', trident: 1 });
  itm('mace', { stack: 1, dur: 500, tab: 'combat', dmg: 6, aspd: .6, tex: 'i_mace', mace: 1 });
  itm('arrow', { tab: 'combat', tex: 'i_arrow' }); itm('spectral_arrow', { tab: 'combat', tex: 'i_spectral_arrow' }); itm('tipped_arrow', { tab: 'combat', tex: 'i_tipped_arrow' });
  itm('wind_charge', { tab: 'combat', tex: 'i_wind_charge', throwable: 'wind_charge' });
  itm('totem_of_undying', { name: 'Totem of Undying', stack: 1, tab: 'combat', tex: 'i_totem_of_undying', totem: 1 });
  itm('snowball', { stack: 16, tab: 'combat', tex: 'i_snowball', throwable: 'snowball' });
  itm('egg', { stack: 16, tab: 'combat', tex: 'i_egg', throwable: 'egg' }); itm('blue_egg', { stack: 16, tab: 'combat', tex: 'i_blue_egg', throwable: 'egg' }); itm('brown_egg', { stack: 16, tab: 'combat', tex: 'i_brown_egg', throwable: 'egg' });
  itm('ender_pearl', { stack: 16, tab: 'combat', tex: 'i_ender_pearl', throwable: 'ender_pearl' });
  itm('flint_and_steel', { stack: 1, dur: 64, tab: 'tools', tex: 'i_flint_and_steel', ignite: 1 });
  itm('fire_charge', { tab: 'combat', tex: 'i_fire_charge', ignite: 2 });
  itm('shears', { stack: 1, dur: 238, tab: 'tools', tex: 'i_shears', tool: { k: 'shears', sp: 1.5, lvl: 0 } });
  itm('brush', { stack: 1, dur: 64, tab: 'tools', tex: 'i_brush' });
  itm('fishing_rod', { stack: 1, dur: 64, tab: 'tools', tex: 'i_fishing_rod', rod: 1, fuel: 300 });
  itm('carrot_on_a_stick', { stack: 1, dur: 25, tab: 'tools', tex: 'i_carrot_on_a_stick' });
  itm('warped_fungus_on_a_stick', { stack: 1, dur: 100, tab: 'tools', tex: 'i_warped_fungus_on_a_stick' });
  itm('bucket', { stack: 16, tab: 'tools', tex: 'i_bucket', bucket: 'empty' });
  itm('water_bucket', { stack: 1, tab: 'tools', tex: 'i_water_bucket', bucket: 'water' });
  itm('lava_bucket', { stack: 1, tab: 'tools', tex: 'i_lava_bucket', bucket: 'lava', fuel: 20000 });
  itm('powder_snow_bucket', { stack: 1, tab: 'tools', tex: 'i_powder_snow_bucket', bucket: 'powder_snow' });
  itm('milk_bucket', { stack: 1, tab: 'food', tex: 'i_milk_bucket', drink: 'milk' });
  for (const f of ['cod', 'salmon', 'pufferfish', 'tropical_fish', 'axolotl', 'tadpole', 'sulfur_cube']) itm(f === 'sulfur_cube' ? 'bucket_of_sulfur_cube' : f + '_bucket', { name: 'Bucket of ' + title(f), stack: 1, tab: 'tools', tex: 'i_' + f + '_bucket', bucket: 'water', mobB: f });
  itm('compass', { tab: 'tools', tex: 'i_compass', compass: 1 }); itm('recovery_compass', { tab: 'tools', tex: 'i_recovery_compass' }); itm('lodestone_compass', { tab: 'tools', tex: 'i_compass' });
  itm('clock', { tab: 'tools', tex: 'i_clock', clock: 1 });
  itm('spyglass', { stack: 1, tab: 'tools', tex: 'i_spyglass', spyglass: 1 });
  itm('map', { name: 'Empty Map', tab: 'tools', tex: 'i_map' }); itm('filled_map', { name: 'Map', tab: null, tex: 'i_filled_map' });
  itm('name_tag', { tab: 'tools', tex: 'i_name_tag' }); itm('lead', { tab: 'tools', tex: 'i_lead' }); itm('saddle', { stack: 1, tab: 'tools', tex: 'i_saddle' });
  itm('bundle', { stack: 1, tab: 'tools', tex: 'i_bundle' });
  for (const c of COLORS) { itm(c + '_bundle', { stack: 1, tab: 'tools', tex: 'i_bundle', tintC: c }); itm(c + '_harness', { stack: 1, tab: 'tools', tex: 'i_harness', tintC: c }); }
  itm('goat_horn', { stack: 1, tab: 'tools', tex: 'i_goat_horn' });
  itm('book', { tab: 'ingr', tex: 'i_book' }); itm('writable_book', { name: 'Book and Quill', stack: 1, tab: 'tools', tex: 'i_writable_book' }); itm('written_book', { stack: 16, tab: null, tex: 'i_written_book' });
  itm('enchanted_book', { stack: 1, tab: 'ingr', tex: 'i_enchanted_book', glint: 1 }); itm('knowledge_book', { stack: 1, tab: null, tex: 'i_knowledge_book' });
  itm('experience_bottle', { name: "Bottle o' Enchanting", tab: 'tools', tex: 'i_experience_bottle', throwable: 'xp_bottle', glint: 1 });
  itm('ender_eye', { name: 'Eye of Ender', tab: 'tools', tex: 'i_ender_eye' });
  itm('end_crystal', { tab: 'combat', tex: 'i_end_crystal' });
  itm('firework_rocket', { tab: 'tools', tex: 'i_firework_rocket' }); itm('firework_star', { tab: 'ingr', tex: 'i_firework_star' });
  for (const w of WOODS) { if (w.nether) continue; const b = w.bamboo ? 'bamboo_raft' : w.n + '_boat'; itm(b, { stack: 1, tab: 'tools', tex: 'i_' + b, boat: w.n, fuel: 1200 }); itm(w.bamboo ? 'bamboo_chest_raft' : w.n + '_chest_boat', { name: w.bamboo ? 'Bamboo Raft with Chest' : title(w.n) + ' Boat with Chest', stack: 1, tab: 'tools', tex: 'i_' + (w.bamboo ? 'bamboo_chest_raft' : w.n + '_chest_boat'), boat: w.n, fuel: 1200 }); }
  for (const m of ['minecart', 'chest_minecart', 'furnace_minecart', 'tnt_minecart', 'hopper_minecart', 'command_block_minecart']) itm(m, { name: m === 'minecart' ? 'Minecart' : 'Minecart with ' + title(m.replace('_minecart', '')), stack: 1, tab: m === 'command_block_minecart' ? null : 'tools', tex: 'i_' + m, cart: 1 });
  itm('armor_stand', { stack: 16, tab: 'func', tex: 'i_armor_stand' }); itm('item_frame', { tab: 'func', tex: 'i_item_frame' }); itm('glow_item_frame', { tab: 'func', tex: 'i_glow_item_frame' }); itm('painting', { tab: 'func', tex: 'i_painting', painting: 1 });
  for (const c of COLORS) itm(c + '_cushion', { tab: 'color', tex: 'i_cushion', tintC: c, cushion: c, fuel: 50 });
  const FOOD = {
    apple: [4, 2.4], baked_potato: [5, 6], beef: [3, 1.8, 'Raw Beef'], cooked_beef: [8, 12.8, 'Steak'], beetroot: [1, 1.2], beetroot_soup: [6, 7.2, 0, 1], bread: [5, 6], carrot: [3, 3.6], chorus_fruit: [4, 2.4],
    chicken: [2, 1.2, 'Raw Chicken'], cooked_chicken: [6, 7.2], cod: [2, .4, 'Raw Cod'], cooked_cod: [5, 6], mutton: [2, 1.2, 'Raw Mutton'], cooked_mutton: [6, 9.6], porkchop: [3, 1.8, 'Raw Porkchop'], cooked_porkchop: [8, 12.8],
    rabbit: [3, 1.8, 'Raw Rabbit'], cooked_rabbit: [5, 6], salmon: [2, .4, 'Raw Salmon'], cooked_salmon: [6, 9.6], cookie: [2, .4], dried_kelp: [1, .6], enchanted_golden_apple: [4, 9.6], glow_berries: [2, .4],
    golden_apple: [4, 9.6], golden_carrot: [6, 14.4], honey_bottle: [6, 1.2], melon_slice: [2, 1.2], mushroom_stew: [6, 7.2, 0, 1], poisonous_potato: [2, 1.2], potato: [1, .6], pufferfish: [1, .2], pumpkin_pie: [8, 4.8],
    rabbit_stew: [10, 12, 0, 1], rotten_flesh: [4, .8], spider_eye: [2, 3.2], suspicious_stew: [6, 7.2, 0, 1], sweet_berries: [2, .4], tropical_fish: [1, .2]
  };
  for (const id in FOOD) { const f = FOOD[id]; itm(id, { name: f[2] || undefined, tab: 'food', tex: 'i_' + id, food: { n: f[0], s: f[1], fast: id === 'dried_kelp', bowl: f[3], always: id === 'golden_apple' || id === 'enchanted_golden_apple' || id === 'chorus_fruit' || id === 'honey_bottle' || id === 'suspicious_stew' }, stack: f[3] ? 1 : id === 'honey_bottle' ? 16 : 64, glint: id === 'enchanted_golden_apple' }); }
  itm('potion', { name: 'Water Bottle', stack: 1, tab: 'food', tex: 'i_potion', drink: 'water' });
  itm('splash_potion', { name: 'Splash Water Bottle', stack: 1, tab: 'food', tex: 'i_splash_potion', throwable: 'splash' });
  itm('lingering_potion', { name: 'Lingering Water Bottle', stack: 1, tab: 'food', tex: 'i_lingering_potion', throwable: 'splash' });
  itm('ominous_bottle', { tab: 'food', tex: 'i_ominous_bottle', drink: 'ominous' });
  const MATS = ['stick', 'coal', 'charcoal', 'diamond', 'emerald', 'lapis_lazuli', 'quartz', 'amethyst_shard', 'raw_iron', 'iron_ingot', 'iron_nugget', 'raw_copper', 'copper_ingot', 'copper_nugget', 'raw_gold', 'gold_ingot', 'gold_nugget',
    'netherite_scrap', 'netherite_ingot', 'redstone', 'glowstone_dust', 'flint', 'clay_ball', 'brick', 'nether_brick', 'resin_clump', 'resin_brick', 'paper', 'sugar', 'wheat', 'string', 'feather', 'leather', 'rabbit_hide', 'rabbit_foot',
    'bone', 'bone_meal', 'gunpowder', 'slime_ball', 'honeycomb', 'ink_sac', 'glow_ink_sac', 'blaze_rod', 'blaze_powder', 'breeze_rod', 'ghast_tear', 'magma_cream', 'ender_pearl_dummy', 'nether_star', 'shulker_shell', 'phantom_membrane',
    'prismarine_shard', 'prismarine_crystals', 'nautilus_shell', 'heart_of_the_sea', 'turtle_scute', 'armadillo_scute', 'echo_shard', 'disc_fragment_5', 'fermented_spider_eye', 'glistering_melon_slice', 'popped_chorus_fruit',
    'dragon_breath', 'bowl', 'glass_bottle', 'trial_key', 'ominous_trial_key', 'heavy_core_dummy', 'cocoa_beans', 'wheat_seeds', 'pumpkin_seeds', 'melon_seeds', 'beetroot_seeds', 'torchflower_seeds', 'pitcher_pod', 'nether_wart_dummy'];
  const MATN = { slime_ball: 'Slimeball', quartz: 'Nether Quartz', disc_fragment_5: 'Disc Fragment', dragon_breath: "Dragon's Breath", rabbit_foot: "Rabbit's Foot", glow_ink_sac: 'Glow Ink Sac', redstone: 'Redstone Dust', bone_meal: 'Bone Meal', armadillo_scute: 'Armadillo Scute' };
  for (const id of MATS) { if (id.endsWith('_dummy')) continue; itm(id, { name: MATN[id], tex: 'i_' + id, tab: 'ingr', fuel: id === 'coal' || id === 'charcoal' ? 1600 : id === 'stick' || id === 'bowl' ? 100 : id === 'blaze_rod' ? 2400 : 0 }); }
  Object.assign(IN.redstone, { place: 'redstone_wire', tab: 'red' });
  Object.assign(IN.wheat_seeds, { place: 'wheat', tabs: ['nature'] }); Object.assign(IN.pumpkin_seeds, { place: 'pumpkin_stem', tabs: ['nature'] }); Object.assign(IN.melon_seeds, { place: 'melon_stem', tabs: ['nature'] });
  Object.assign(IN.beetroot_seeds, { place: 'beetroots', tabs: ['nature'] }); Object.assign(IN.torchflower_seeds, { place: 'torchflower_crop', tabs: ['nature'] }); Object.assign(IN.pitcher_pod, { place: 'pitcher_plant', tabs: ['nature'] });
  Object.assign(IN.cocoa_beans, { place: 'cocoa', tabs: ['nature'] }); Object.assign(IN.carrot, { place: 'carrots' }); Object.assign(IN.potato, { place: 'potatoes' }); Object.assign(IN.sweet_berries, { place: 'sweet_berry_bush', placeAge: 0 }); Object.assign(IN.glow_berries, { place: null });
  Object.assign(IN.bone_meal, { boneMeal: 1 }); Object.assign(IN.string, { place: null });
  itm('nether_wart', { tex: 'i_nether_wart', tab: 'ingr', place: 'nether_wart', tabs: ['nature'] });
  itm('kelp', { tex: 'i_kelp', tab: 'nature', place: 'kelp' });
  itm('ender_pearl', {});
  const DYES = COLORS.map(c => c + '_dye');
  for (const c of COLORS) itm(c + '_dye', { tex: 'i_dye', tintC: c, tab: 'ingr', dye: c });
  const DISCS = ['13', 'cat', 'blocks', 'chirp', 'far', 'mall', 'mellohi', 'stal', 'strad', 'ward', '11', 'wait', 'otherside', '5', 'pigstep', 'relic', 'precipice', 'creator', 'creator_music_box', 'lava_chicken', 'tears', 'bounce'];
  for (const d of DISCS) itm('music_disc_' + d, { name: 'Music Disc', desc: d === 'creator_music_box' ? 'Lena Raine - Creator (Music Box)' : title(d.replace('_', ' ')), stack: 1, tab: 'tools', tex: 'i_music_disc', disc: d });
  const SHERDS = ['angler', 'archer', 'arms_up', 'blade', 'brewer', 'burn', 'danger', 'explorer', 'flow', 'friend', 'guster', 'heart', 'heartbreak', 'howl', 'miner', 'mourner', 'plenty', 'prize', 'scrape', 'sheaf', 'shelter', 'skull', 'snort'];
  for (const s of SHERDS) itm(s + '_pottery_sherd', { tex: 'i_pottery_sherd', tab: 'ingr', sherd: s });
  const TRIMS = ['bolt', 'coast', 'dune', 'eye', 'flow', 'host', 'raiser', 'rib', 'sentry', 'shaper', 'silence', 'snout', 'spire', 'tide', 'vex', 'ward', 'wayfinder', 'wild'];
  for (const t of TRIMS) itm(t + '_armor_trim_smithing_template', { name: 'Smithing Template', desc: title(t) + ' Armor Trim', tex: 'i_smithing_template', tab: 'ingr', trim: t });
  itm('netherite_upgrade_smithing_template', { name: 'Smithing Template', desc: 'Netherite Upgrade', tex: 'i_smithing_template', tab: 'ingr' });
  const PATTERNS = ['flower', 'creeper', 'skull', 'mojang', 'globe', 'piglin', 'flow', 'guster', 'field_masoned', 'bordure_indented'];
  for (const p of PATTERNS) itm(p + '_banner_pattern', { name: 'Banner Pattern', desc: title(p), tex: 'i_banner_pattern', tab: 'ingr' });
  const EXPLORER = ['abandoned_camp', 'buried_ancient_city', 'buried_mineshaft', 'desert_pyramid', 'warm_ocean_ruins', 'bamboo_camp', 'birch_forest_camp', 'cherry_grove_camp', 'dappled_forest_camp', 'flower_forest_camp', 'pale_garden_camp', 'swamp_camp', 'windswept_forest_camp', 'buried_treasure', 'trial_chambers', 'jungle_pyramid', 'ocean_monument', 'woodland_mansion', 'swamp_hut', 'plains_village', 'desert_village', 'savanna_village', 'snowy_village', 'taiga_village'];
  for (const e of EXPLORER) itm(e + '_map', { tex: 'i_explorer_map', tab: 'tools', stack: 1 });
  const MOBS_EGG = [['pig', [240, 160, 156], [219, 99, 94]], ['cow', [68, 54, 37], [161, 161, 161]], ['sheep', [231, 231, 231], [255, 181, 181]], ['chicken', [161, 161, 161], [255, 0, 0]], ['zombie', [0, 175, 175], [121, 156, 101]], ['skeleton', [193, 193, 193], [73, 73, 73]], ['creeper', [13, 161, 12], [0, 0, 0]], ['spider', [52, 45, 39], [163, 0, 0]], ['enderman', [22, 22, 22], [0, 0, 0]], ['slime', [81, 160, 69], [126, 191, 110]], ['wolf', [215, 211, 211], [206, 175, 150]], ['rabbit', [153, 115, 85], [115, 84, 59]], ['villager', [86, 60, 51], [189, 139, 114]], ['bee', [237, 197, 82], [67, 36, 31]], ['sulfur_cube', [222, 214, 81], [176, 158, 47]]];
  for (const [m, a, b] of MOBS_EGG.slice(0, 10)) itm(m + '_spawn_egg', { tex: 'i_spawn_egg', egg: m, eggC: [a, b], tab: 'eggs' });
  for (const t of TT) {
    if (t.item === true && !IN[t.id]) itm(t.id, { name: t.name, block: t.id, place: t.id, tab: t.tab, tabs: t.tabs, stack: t.stack || 64, icon: t.icon, fuel: t.fuel || (t.flam && t.snd === 'wood' ? (t.slab ? 150 : 300) : 0) });
    else if (t.item === true && IN[t.id] && !IN[t.id].place) Object.assign(IN[t.id], { block: t.id, place: t.id });
  }
  for (const n of ['crafting_table', 'chest', 'trapped_chest', 'barrel', 'bookshelf', 'ladder', 'jukebox', 'note_block', 'composter', 'lectern', 'loom', 'cartography_table', 'fletching_table', 'smithing_table', 'daylight_detector']) if (IN[n]) IN[n].fuel = 300;
  for (const it of IT) if (it.block) { const t = TN[it.block]; if (t.tags.has('sapling')) it.fuel = 100; if (t.tags.has('wool')) it.fuel = 100; if (t.id.endsWith('_carpet') && !t.id.includes('moss')) it.fuel = 67; if (t.id.endsWith('_button') && t.snd === 'wood') it.fuel = 100; if (t.door && t.snd === 'wood') it.fuel = 200; if (t.sign) it.fuel = 200; if (t.id.includes('banner')) it.fuel = 300; }
  if (IN.coal_block) IN.coal_block.fuel = 16000; if (IN.dried_kelp_block) IN.dried_kelp_block.fuel = 4001; if (IN.bamboo) IN.bamboo.fuel = 50; if (IN.scaffolding) IN.scaffolding.fuel = 50;
  const isTool = it => !!(it && (it.tool || it.dur));
  const maxStack = id => IT[id].stack;
  const TAGS = Object.create(null);
  const tagAdd = (t, ...ids) => { const s = TAGS[t] || (TAGS[t] = new Set()); for (const i of ids) if (IN[i]) s.add(IN[i].idx); };
  for (const w of WOODS) {
    const n = w.n;
    tagAdd('planks', n + '_planks');
    tagAdd('wooden_slabs', n + '_slab');
    tagAdd('wooden_buttons', n + '_button');
    if (w.bamboo) tagAdd('bamboo_logs', 'bamboo_block', 'stripped_bamboo_block');
    else if (w.nether) { tagAdd(n + '_logs', n + '_stem', n + '_hyphae', 'stripped_' + n + '_stem', 'stripped_' + n + '_hyphae'); tagAdd('logs', n + '_stem', n + '_hyphae', 'stripped_' + n + '_stem', 'stripped_' + n + '_hyphae'); }
    else { tagAdd(n + '_logs', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); tagAdd('logs', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); tagAdd('logs_burn', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); }
  }
  tagAdd('coals', 'coal', 'charcoal');
  tagAdd('stone_craft', 'cobblestone', 'cobbled_deepslate', 'blackstone');
  tagAdd('wool', ...COLORS.map(c => c + '_wool'));
  tagAdd('sand', 'sand', 'red_sand');
  tagAdd('soul', 'soul_sand', 'soul_soil');
  tagAdd('eggs', 'egg', 'blue_egg', 'brown_egg');
  tagAdd('small_flowers', ...FLOWERS);
  tagAdd('stone_bricks', 'stone_bricks', 'mossy_stone_bricks', 'cracked_stone_bricks', 'chiseled_stone_bricks');
  tagAdd('quartz_blocks', 'quartz_block', 'chiseled_quartz_block', 'quartz_pillar', 'smooth_quartz');
  const RECIPES = [], SHAPELESS = [];
  const ing = v => { if (v == null) return null; if (v[0] === '#') { const s = TAGS[v.slice(1)]; if (!s) throw new Error('tag ' + v); return s; } const it = IN[v]; if (!it) throw new Error('item ' + v); return it.idx; };
  function shaped(rows, key, out, n, o) {
    if (!IN[out]) return;
    try {
      const k = {}; for (const c in key) k[c] = ing(key[c]);
      const h = rows.length, w = Math.max(...rows.map(r => r.length));
      const g = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = rows[y][x] || ' '; g.push(c === ' ' ? null : k[c]); }
      RECIPES.push({ w, h, g, out: IN[out].idx, n: n || 1, rem: o && o.rem });
    } catch (e) { }
  }
  function shapeless(list, out, n) { if (!IN[out]) return; try { SHAPELESS.push({ l: list.map(ing), out: IN[out].idx, n: n || 1 }); } catch (e) { } }
  const ringR = (c, m, out, n) => shaped(['MMM', 'MCM', 'MMM'], { M: m, C: c }, out, n);
  const box2 = (m, out, n) => shaped(['MM', 'MM'], { M: m }, out, n || 1);
  const box3 = (m, out, n) => shaped(['MMM', 'MMM', 'MMM'], { M: m }, out, n || 1);
  const stairR = (m, out) => shaped(['M  ', 'MM ', 'MMM'], { M: m }, out, 4);
  const slabR = (m, out) => shaped(['MMM'], { M: m }, out, 6);
  const wallR = (m, out) => shaped(['MMM', 'MMM'], { M: m }, out, 6);
  const store = (blockId, itemId) => { box3(itemId, blockId, 1); shapeless([blockId], itemId, 9); };
  for (const w of WOODS) {
    const n = w.n, pl = n + '_planks';
    if (w.bamboo) { shaped(['M', 'M'], { M: 'bamboo' }, 'stick', 1); box3('bamboo', 'bamboo_block'); shapeless(['#bamboo_logs'], pl, 2); shaped(['M', 'M'], { M: 'bamboo_slab' }, 'bamboo_mosaic'); stairR('bamboo_mosaic', 'bamboo_mosaic_stairs'); slabR('bamboo_mosaic', 'bamboo_mosaic_slab'); }
    else {
      shapeless(['#' + n + '_logs'], pl, 4);
      const log = w.nether ? n + '_stem' : n + '_log', wood = w.nether ? n + '_hyphae' : n + '_wood';
      box2(log, wood, 3); box2('stripped_' + log, 'stripped_' + wood, 3);
      shaped(['SSS', '   ', 'SSS'], { S: 'stripped_' + log }, n + '_shelf', 6);
      shaped(['C C', 'SSS', 'SSS'], { C: 'chain', S: 'stripped_' + log }, n + '_hanging_sign', 6);
    }
    if (w.bamboo) shaped(['C C', 'SSS', 'SSS'], { C: 'chain', S: 'stripped_bamboo_block' }, 'bamboo_hanging_sign', 6);
    if (w.bamboo) shaped(['SSS', '   ', 'SSS'], { S: 'stripped_bamboo_block' }, 'bamboo_shelf', 6);
    stairR(pl, n + '_stairs'); slabR(pl, n + '_slab');
    shaped(['PSP', 'PSP'], { P: pl, S: 'stick' }, n + '_fence', 3);
    shaped(['SPS', 'SPS'], { P: pl, S: 'stick' }, n + '_fence_gate', 1);
    shaped(['PP', 'PP', 'PP'], { P: pl }, n + '_door', 3);
    shaped(['PPP', 'PPP'], { P: pl }, n + '_trapdoor', 2);
    shaped(['PP'], { P: pl }, n + '_pressure_plate', 1);
    shapeless([pl], n + '_button', 1);
    shaped(['PPP', 'PPP', ' S '], { P: pl, S: 'stick' }, n + '_sign', 3);
    if (!w.nether) { const b = w.bamboo ? 'bamboo_raft' : n + '_boat', cb2 = w.bamboo ? 'bamboo_chest_raft' : n + '_chest_boat'; shaped(['P P', 'PPP'], { P: pl }, b, 1); shapeless([b, 'chest'], cb2, 1); }
  }
  shaped(['P', 'P'], { P: '#planks' }, 'stick', 4);
  box2('#planks', 'crafting_table');
  shaped(['MMM', 'M M', 'MMM'], { M: '#planks' }, 'chest');
  shapeless(['chest', 'tripwire_hook'], 'trapped_chest');
  shaped(['MMM', 'M M', 'MMM'], { M: '#stone_craft' }, 'furnace');
  shaped(['C', 'S'], { C: '#coals', S: 'stick' }, 'torch', 4);
  shaped(['C', 'S', 'X'], { C: '#coals', S: 'stick', X: '#soul' }, 'soul_torch', 4);
  shaped(['N', 'C', 'S'], { N: 'copper_nugget', C: '#coals', S: 'stick' }, 'copper_torch', 4);
  shaped(['R', 'S'], { R: 'redstone', S: 'stick' }, 'redstone_torch', 1);
  const TM = { wooden: '#planks', stone: '#stone_craft', copper: 'copper_ingot', iron: 'iron_ingot', golden: 'gold_ingot', diamond: 'diamond' };
  for (const t in TM) {
    const M = TM[t];
    shaped(['MMM', ' S ', ' S '], { M, S: 'stick' }, t + '_pickaxe'); shaped(['MM', 'MS', ' S'], { M, S: 'stick' }, t + '_axe'); shaped(['M', 'S', 'S'], { M, S: 'stick' }, t + '_shovel');
    shaped(['MM', ' S', ' S'], { M, S: 'stick' }, t + '_hoe'); shaped(['M', 'M', 'S'], { M, S: 'stick' }, t + '_sword'); shaped(['  M', ' S ', 'S  '], { M, S: 'stick' }, t + '_spear');
  }
  const AM = { leather: 'leather', copper: 'copper_ingot', iron: 'iron_ingot', golden: 'gold_ingot', diamond: 'diamond' };
  for (const a in AM) { const M = AM[a]; shaped(['MMM', 'M M'], { M }, a + '_helmet'); shaped(['M M', 'MMM', 'MMM'], { M }, a + '_chestplate'); shaped(['MMM', 'M M', 'M M'], { M }, a + '_leggings'); shaped(['M M', 'M M'], { M }, a + '_boots'); }
  shaped(['MMM', 'M M'], { M: 'turtle_scute' }, 'turtle_helmet');
  shaped(['  M', ' MM', 'MMM'].map(r => r), { M: 'armadillo_scute' }, 'wolf_armor');
  shaped([' ST', 'S T', ' ST'], { S: 'stick', T: 'string' }, 'bow');
  shaped(['F', 'S', 'E'], { F: 'flint', S: 'stick', E: 'feather' }, 'arrow', 4);
  shaped(['SIS', 'TJT', ' S '], { S: 'stick', I: 'iron_ingot', T: 'string', J: 'tripwire_hook' }, 'crossbow');
  shaped(['WIW', 'WWW', ' W '], { W: '#planks', I: 'iron_ingot' }, 'shield');
  shaped(['  S', ' ST', 'S T'], { S: 'stick', T: 'string' }, 'fishing_rod');
  shaped(['R ', ' C'], { R: 'fishing_rod', C: 'carrot' }, 'carrot_on_a_stick');
  shapeless(['iron_ingot', 'flint'], 'flint_and_steel');
  shaped([' I', 'I '], { I: 'iron_ingot' }, 'shears');
  shaped(['F', 'C', 'S'], { F: 'feather', C: 'copper_ingot', S: 'stick' }, 'brush');
  shaped(['I I', ' I '], { I: 'iron_ingot' }, 'bucket');
  shaped([' I ', 'IRI', ' I '], { I: 'iron_ingot', R: 'redstone' }, 'compass');
  shaped([' G ', 'GRG', ' G '], { G: 'gold_ingot', R: 'redstone' }, 'clock');
  shaped(['PPP', 'PCP', 'PPP'], { P: 'paper', C: 'compass' }, 'map');
  shaped(['A', 'C', 'C'], { A: 'amethyst_shard', C: 'copper_ingot' }, 'spyglass');
  shaped(['SS ', 'SB ', '  S'], { S: 'string', B: 'slime_ball' }, 'lead', 2);
  shaped([' L ', 'LIL'], { L: 'leather', I: 'iron_ingot' }, 'saddle');
  shaped(['S', 'L'], { S: 'string', L: 'leather' }, 'bundle');
  for (const c of COLORS) { shapeless(['bundle', c + '_dye'], c + '_bundle'); shaped(['LLL', 'GWG'], { L: 'leather', G: 'glass', W: c + '_wool' }, c + '_harness'); }
  shapeless(['paper', 'paper', 'paper', 'leather'], 'book');
  shapeless(['book', 'ink_sac', 'feather'], 'writable_book');
  shaped(['SSS'], { S: 'sugar_cane' }, 'paper', 3);
  shapeless(['sugar_cane'], 'sugar'); shapeless(['honey_bottle'], 'sugar', 3);
  shaped(['P P', ' P '], { P: '#planks' }, 'bowl', 4);
  shaped(['G G', ' G '], { G: 'glass' }, 'glass_bottle', 3);
  shaped(['WWW'], { W: 'wheat' }, 'bread');
  shaped(['MMM', 'SES', 'WWW'], { M: 'milk_bucket', S: 'sugar', E: '#eggs', W: 'wheat' }, 'cake', 1, { rem: 'bucket' });
  shaped(['WCW'], { W: 'wheat', C: 'cocoa_beans' }, 'cookie', 8);
  shapeless(['pumpkin', 'sugar', '#eggs'], 'pumpkin_pie');
  shapeless(['brown_mushroom', 'red_mushroom', 'bowl'], 'mushroom_stew');
  shapeless(['beetroot', 'beetroot', 'beetroot', 'beetroot', 'beetroot', 'beetroot', 'bowl'], 'beetroot_soup');
  shapeless(['cooked_rabbit', 'carrot', 'baked_potato', 'brown_mushroom', 'bowl'], 'rabbit_stew');
  shapeless(['red_mushroom', 'brown_mushroom', 'bowl', '#small_flowers'], 'suspicious_stew');
  ringR('apple', 'gold_ingot', 'golden_apple'); ringR('carrot', 'gold_nugget', 'golden_carrot'); ringR('melon_slice', 'gold_nugget', 'glistering_melon_slice');
  shapeless(['bone'], 'bone_meal', 3); box3('bone_meal', 'bone_block'); shapeless(['bone_block'], 'bone_meal', 9);
  for (const [b, i] of [['iron_block', 'iron_ingot'], ['gold_block', 'gold_ingot'], ['diamond_block', 'diamond'], ['emerald_block', 'emerald'], ['lapis_block', 'lapis_lazuli'], ['redstone_block', 'redstone'], ['coal_block', 'coal'], ['netherite_block', 'netherite_ingot'], ['copper_block', 'copper_ingot'], ['raw_iron_block', 'raw_iron'], ['raw_copper_block', 'raw_copper'], ['raw_gold_block', 'raw_gold'], ['hay_block', 'wheat'], ['slime_block', 'slime_ball'], ['dried_kelp_block', 'dried_kelp'], ['resin_block', 'resin_clump']]) store(b, i);
  for (const [i, n] of [['iron_ingot', 'iron_nugget'], ['gold_ingot', 'gold_nugget'], ['copper_ingot', 'copper_nugget']]) { box3(n, i); shapeless([i], n, 9); }
  box3('melon_slice', 'melon'); shapeless(['melon_slice'], 'melon_seeds'); shapeless(['pumpkin'], 'pumpkin_seeds', 4);
  box3('ice', 'packed_ice'); box3('packed_ice', 'blue_ice');
  shaped(['HH', 'HH'], { H: 'honey_bottle' }, 'honey_block', 1, { rem: 'glass_bottle' }); shapeless(['honey_block', 'glass_bottle', 'glass_bottle', 'glass_bottle', 'glass_bottle'], 'honey_bottle', 4);
  box2('honeycomb', 'honeycomb_block'); box2('snowball', 'snow_block'); box2('clay_ball', 'clay'); box2('brick', 'bricks'); box2('nether_brick', 'nether_bricks'); box2('glowstone_dust', 'glowstone'); box2('quartz', 'quartz_block'); box2('amethyst_shard', 'amethyst_block'); box2('prismarine_shard', 'prismarine'); box3('prismarine_shard', 'prismarine_bricks');
  shaped(['SSS', 'SIS', 'SSS'], { S: 'prismarine_shard', I: 'black_dye' }, 'dark_prismarine');
  shaped(['SCS', 'CCC', 'SCS'], { S: 'prismarine_shard', C: 'prismarine_crystals' }, 'sea_lantern');
  box2('resin_brick', 'resin_bricks');
  shaped(['SSS'], { S: 'snow_block' }, 'snow', 6);
  box2('stone', 'stone_bricks', 4); box2('granite', 'polished_granite', 4); box2('diorite', 'polished_diorite', 4); box2('andesite', 'polished_andesite', 4);
  shapeless(['diorite', 'quartz'], 'granite'); shaped(['CQ', 'QC'], { C: 'cobblestone', Q: 'quartz' }, 'diorite', 2); shapeless(['diorite', 'cobblestone'], 'andesite', 2);
  shapeless(['cobblestone', 'vine'], 'mossy_cobblestone'); shapeless(['cobblestone', 'moss_block'], 'mossy_cobblestone'); shapeless(['stone_bricks', 'vine'], 'mossy_stone_bricks'); shapeless(['stone_bricks', 'moss_block'], 'mossy_stone_bricks');
  shaped(['S', 'S'], { S: 'stone_brick_slab' }, 'chiseled_stone_bricks');
  box2('sand', 'sandstone'); box2('sandstone', 'cut_sandstone', 4); shaped(['S', 'S'], { S: 'sandstone_slab' }, 'chiseled_sandstone');
  box2('red_sand', 'red_sandstone'); box2('red_sandstone', 'cut_red_sandstone', 4); shaped(['S', 'S'], { S: 'red_sandstone_slab' }, 'chiseled_red_sandstone');
  box2('cobbled_deepslate', 'polished_deepslate', 4); box2('polished_deepslate', 'deepslate_bricks', 4); box2('deepslate_bricks', 'deepslate_tiles', 4); shaped(['S', 'S'], { S: 'cobbled_deepslate_slab' }, 'chiseled_deepslate');
  box2('tuff', 'polished_tuff', 4); box2('polished_tuff', 'tuff_bricks', 4); shaped(['S', 'S'], { S: 'tuff_slab' }, 'chiseled_tuff'); shaped(['S', 'S'], { S: 'tuff_brick_slab' }, 'chiseled_tuff_bricks');
  box2('blackstone', 'polished_blackstone', 4); box2('polished_blackstone', 'polished_blackstone_bricks', 4); shaped(['S', 'S'], { S: 'polished_blackstone_slab' }, 'chiseled_polished_blackstone');
  shapeless(['mud', 'wheat'], 'packed_mud'); box2('packed_mud', 'mud_bricks', 4);
  box2('popped_chorus_fruit', 'purpur_block', 4); shaped(['S', 'S'], { S: 'purpur_slab' }, 'purpur_pillar');
  shaped(['Q', 'Q'], { Q: 'quartz_block' }, 'quartz_pillar', 2); shaped(['S', 'S'], { S: 'quartz_slab' }, 'chiseled_quartz_block'); box2('quartz_block', 'quartz_bricks', 4);
  box2('end_stone', 'end_stone_bricks', 4);
  shaped(['NW', 'WN'], { N: 'nether_brick', W: 'nether_wart' }, 'red_nether_bricks');
  shaped(['BNB', 'BNB'], { B: 'nether_bricks', N: 'nether_brick' }, 'nether_brick_fence', 6);
  shaped(['S', 'S'], { S: 'nether_brick_slab' }, 'chiseled_nether_bricks');
  shaped(['S', 'S'], { S: 'resin_brick_slab' }, 'chiseled_resin_bricks');
  box2('cinnabar', 'polished_cinnabar', 4); box2('polished_cinnabar', 'cinnabar_bricks', 4); shaped(['S', 'S'], { S: 'cinnabar_brick_slab' }, 'chiseled_cinnabar');
  box2('sulfur', 'polished_sulfur', 4); box2('polished_sulfur', 'sulfur_bricks', 4); shaped(['S', 'S'], { S: 'sulfur_brick_slab' }, 'chiseled_sulfur');
  for (const [base, tex, set] of STONE_FAMS) {
    const nm = slabName(base);
    if (set.includes('st')) stairR(base, nm + '_stairs');
    if (set.includes('sl')) slabR(base, nm + '_slab');
    if (set.includes('w')) wallR(base, nm + '_wall');
  }
  slabR('smooth_stone', 'smooth_stone_slab');
  for (const c of COLORS) {
    shapeless([c + '_dye', '#wool'], c + '_wool'); shaped(['WW'], { W: c + '_wool' }, c + '_carpet', 3);
    stairR(c + '_wool', c + '_wool_stairs'); slabR(c + '_wool', c + '_wool_slab'); shaped(['SSS'], { S: c + '_wool_slab' }, c + '_cushion', 1);
    stairR(c + '_concrete', c + '_concrete_stairs'); slabR(c + '_concrete', c + '_concrete_slab');
    shaped(['WWW', 'PPP'], { W: c + '_wool', P: '#planks' }, c + '_bed');
    shaped(['WWW', 'WWW', ' S '], { W: c + '_wool', S: 'stick' }, c + '_banner');
    ringR(c + '_dye', 'glass', c + '_stained_glass', 8); shaped(['GGG', 'GGG'], { G: c + '_stained_glass' }, c + '_stained_glass_pane', 16);
    ringR(c + '_dye', 'terracotta', c + '_terracotta', 8);
    shapeless([c + '_dye', 'sand', 'sand', 'sand', 'sand', 'gravel', 'gravel', 'gravel', 'gravel'], c + '_concrete_powder', 8);
    shapeless(['candle', c + '_dye'], c + '_candle');
    shapeless(['shulker_box', c + '_dye'], c + '_shulker_box');
  }
  box2('string', 'white_wool');
  shaped(['S', 'H'], { S: 'string', H: 'honeycomb' }, 'candle');
  shaped(['GGG', 'GGG'], { G: 'glass' }, 'glass_pane', 16);
  shaped([' S ', 'SGS', ' S '], { S: 'amethyst_shard', G: 'glass' }, 'tinted_glass', 2);
  shaped(['MM'], { M: 'moss_block' }, 'moss_carpet', 3); shaped(['MM'], { M: 'pale_moss_block' }, 'pale_moss_carpet', 3);
  shaped(['DG', 'GD'], { D: 'dirt', G: 'gravel' }, 'coarse_dirt', 4);
  box2('pointed_dripstone', 'dripstone_block');
  const DYEF = [['dandelion', 'yellow'], ['golden_dandelion', 'yellow'], ['poppy', 'red'], ['red_tulip', 'red'], ['beetroot', 'red'], ['blue_orchid', 'light_blue'], ['allium', 'magenta'], ['azure_bluet', 'light_gray'], ['oxeye_daisy', 'light_gray'], ['white_tulip', 'light_gray'], ['orange_tulip', 'orange'], ['pink_tulip', 'pink'], ['pink_petals', 'pink'], ['cornflower', 'blue'], ['lily_of_the_valley', 'white'], ['wither_rose', 'black'], ['torchflower', 'orange'], ['cocoa_beans', 'brown'], ['lapis_lazuli', 'blue'], ['ink_sac', 'black'], ['bone_meal', 'white'], ['open_eyeblossom', 'orange'], ['closed_eyeblossom', 'gray'], ['wildflowers', 'yellow'], ['cactus_flower', 'pink']];
  for (const [f, c] of DYEF) shapeless([f], c + '_dye');
  for (const [f, c] of [['sunflower', 'yellow'], ['rose_bush', 'red'], ['lilac', 'magenta'], ['peony', 'pink'], ['pitcher_plant', 'cyan']]) shapeless([f], c + '_dye', 2);
  for (const [a, b, c, n] of [['red_dye', 'yellow_dye', 'orange_dye', 2], ['blue_dye', 'white_dye', 'light_blue_dye', 2], ['red_dye', 'white_dye', 'pink_dye', 2], ['green_dye', 'white_dye', 'lime_dye', 2], ['black_dye', 'white_dye', 'gray_dye', 2], ['gray_dye', 'white_dye', 'light_gray_dye', 2], ['blue_dye', 'green_dye', 'cyan_dye', 2], ['red_dye', 'blue_dye', 'purple_dye', 2], ['purple_dye', 'pink_dye', 'magenta_dye', 2]]) shapeless([a, b], c, n);
  shapeless(['black_dye', 'white_dye', 'white_dye'], 'light_gray_dye', 3);
  shaped(['S', 'C'], { S: 'stick', C: 'cobblestone' }, 'lever');
  shaped(['TRT', 'SSS'], { T: 'redstone_torch', R: 'redstone', S: 'stone' }, 'repeater');
  shaped([' T ', 'TQT', 'SSS'], { T: 'redstone_torch', Q: 'quartz', S: 'stone' }, 'comparator');
  shaped(['PPP', 'CIC', 'CRC'], { P: '#planks', C: 'cobblestone', I: 'iron_ingot', R: 'redstone' }, 'piston');
  shaped(['S', 'P'], { S: 'slime_ball', P: 'piston' }, 'sticky_piston');
  shaped(['CCC', 'RRQ', 'CCC'], { C: 'cobblestone', R: 'redstone', Q: 'quartz' }, 'observer');
  shaped(['CCC', 'CBC', 'CRC'], { C: 'cobblestone', B: 'bow', R: 'redstone' }, 'dispenser');
  shaped(['CCC', 'C C', 'CRC'], { C: 'cobblestone', R: 'redstone' }, 'dropper');
  shaped(['I I', 'ICI', ' I '], { I: 'iron_ingot', C: 'chest' }, 'hopper');
  shaped([' R ', 'RGR', ' R '], { R: 'redstone', G: 'glowstone' }, 'redstone_lamp');
  shaped(['GGG', 'QQQ', 'SSS'], { G: 'glass', Q: 'quartz', S: '#wooden_slabs' }, 'daylight_detector');
  shaped([' R ', 'RHR', ' R '], { R: 'redstone', H: 'hay_block' }, 'target');
  shaped(['I', 'S', 'P'], { I: 'iron_ingot', S: 'stick', P: '#planks' }, 'tripwire_hook', 2);
  shaped(['I I', 'ISI', 'I I'], { I: 'iron_ingot', S: 'stick' }, 'rail', 16);
  shaped(['G G', 'GSG', 'GRG'], { G: 'gold_ingot', S: 'stick', R: 'redstone' }, 'powered_rail', 6);
  shaped(['I I', 'IPI', 'IRI'], { I: 'iron_ingot', P: 'stone_pressure_plate', R: 'redstone' }, 'detector_rail', 6);
  shaped(['ISI', 'ITI', 'ISI'], { I: 'iron_ingot', S: 'stick', T: 'redstone_torch' }, 'activator_rail', 6);
  shaped(['GSG', 'SGS', 'GSG'], { G: 'gunpowder', S: '#sand' }, 'tnt');
  ringR('redstone', '#planks', 'note_block'); ringR('diamond', '#planks', 'jukebox');
  shaped(['C', 'C', 'C'], { C: 'copper_ingot' }, 'lightning_rod');
  shaped(['SS'], { S: 'stone' }, 'stone_pressure_plate'); shapeless(['stone'], 'stone_button');
  shaped(['SS'], { S: 'polished_blackstone' }, 'polished_blackstone_pressure_plate'); shapeless(['polished_blackstone'], 'polished_blackstone_button');
  shaped(['GG'], { G: 'gold_ingot' }, 'light_weighted_pressure_plate'); shaped(['II'], { I: 'iron_ingot' }, 'heavy_weighted_pressure_plate');
  shaped(['II', 'II', 'II'], { I: 'iron_ingot' }, 'iron_door', 3); box2('iron_ingot', 'iron_trapdoor');
  shaped(['III', 'ICI', 'RDR'], { I: 'iron_ingot', C: 'crafting_table', R: 'redstone', D: 'dropper' }, 'crafter');
  shaped([' C ', 'CBC', ' R '], { C: 'copper_block', B: 'blaze_rod', R: 'redstone' }, 'copper_bulb', 4);
  shaped(['II', 'II', 'II'], { I: 'copper_ingot' }, 'copper_door', 3); box2('copper_ingot', 'copper_trapdoor');
  box2('copper_block', 'cut_copper', 4); shaped(['S', 'S'], { S: 'cut_copper_slab' }, 'chiseled_copper'); shaped([' C ', 'C C', ' C '], { C: 'copper_block' }, 'copper_grate', 4);
  ringR('chest', 'copper_ingot', 'copper_chest');
  shaped(['NNN', 'NTN', 'NNN'], { N: 'copper_nugget', T: 'copper_torch' }, 'copper_lantern');
  shaped(['BBB', ' I ', 'III'], { B: 'iron_block', I: 'iron_ingot' }, 'anvil');
  shaped([' B ', 'DOD', 'OOO'], { B: 'book', D: 'diamond', O: 'obsidian' }, 'enchanting_table');
  shaped(['PPP', 'BBB', 'PPP'], { P: '#planks', B: 'book' }, 'bookshelf');
  shaped(['PPP', 'SSS', 'PPP'], { P: '#planks', S: '#wooden_slabs' }, 'chiseled_bookshelf');
  shaped(['SSS', ' B ', ' S '], { S: '#wooden_slabs', B: 'bookshelf' }, 'lectern');
  shaped(['S S', 'S S', 'SSS'], { S: '#wooden_slabs' }, 'composter');
  shaped(['I I', 'I I', 'III'], { I: 'iron_ingot' }, 'cauldron');
  shaped([' B ', 'CCC'], { B: 'blaze_rod', C: '#stone_craft' }, 'brewing_stand');
  shaped(['PSP', 'P P', 'PSP'], { P: '#planks', S: '#wooden_slabs' }, 'barrel');
  shaped([' L ', 'LFL', ' L '], { L: '#logs', F: 'furnace' }, 'smoker');
  shaped(['III', 'IFI', 'SSS'], { I: 'iron_ingot', F: 'furnace', S: 'smooth_stone' }, 'blast_furnace');
  shaped(['STS', 'P P'], { S: 'stick', T: 'stone_slab', P: '#planks' }, 'grindstone');
  shaped(['II', 'PP', 'PP'], { I: 'iron_ingot', P: '#planks' }, 'smithing_table');
  shaped(['FF', 'PP', 'PP'], { F: 'flint', P: '#planks' }, 'fletching_table');
  shaped(['pp', 'PP', 'PP'], { p: 'paper', P: '#planks' }, 'cartography_table');
  shaped(['SS', 'PP'], { S: 'string', P: '#planks' }, 'loom');
  shaped([' I ', 'SSS'], { I: 'iron_ingot', S: 'stone' }, 'stonecutter');
  shaped([' S ', 'SCS', 'LLL'], { S: 'stick', C: '#coals', L: '#logs' }, 'campfire');
  shaped([' S ', 'SCS', 'LLL'], { S: 'stick', C: '#soul', L: '#logs' }, 'soul_campfire');
  shaped(['NNN', 'NTN', 'NNN'], { N: 'iron_nugget', T: 'torch' }, 'lantern'); shaped(['NNN', 'NTN', 'NNN'], { N: 'iron_nugget', T: 'soul_torch' }, 'soul_lantern');
  shaped(['N', 'I', 'N'], { N: 'iron_nugget', I: 'iron_ingot' }, 'chain');
  shaped(['III', 'III'], { I: 'iron_ingot' }, 'iron_bars', 16);
  shaped(['S S', 'SSS', 'S S'], { S: 'stick' }, 'ladder', 3);
  shaped(['BSB', 'B B', 'B B'], { B: 'bamboo', S: 'string' }, 'scaffolding', 6);
  shaped(['B B', ' B '], { B: 'brick' }, 'flower_pot');
  shaped([' B ', 'B B', ' B '], { B: 'brick' }, 'decorated_pot');
  shaped(['SSS', ' S ', 'SPS'], { S: 'stick', P: 'smooth_stone_slab' }, 'armor_stand');
  ringR('leather', 'stick', 'item_frame'); shapeless(['item_frame', 'glow_ink_sac'], 'glow_item_frame'); ringR('#wool', 'stick', 'painting');
  shaped(['PPP', 'HHH', 'PPP'], { P: '#planks', H: 'honeycomb' }, 'beehive');
  shaped(['SSS', 'SNS', 'SSS'], { S: 'chiseled_stone_bricks', N: 'netherite_ingot' }, 'lodestone');
  shaped(['OOO', 'GGG', 'OOO'], { O: 'crying_obsidian', G: 'glowstone' }, 'respawn_anchor');
  ringR('ender_eye', 'obsidian', 'ender_chest');
  shapeless(['ender_pearl', 'blaze_powder'], 'ender_eye'); shapeless(['blaze_rod'], 'blaze_powder', 2);
  shapeless(['blaze_powder', 'slime_ball'], 'magma_cream'); shapeless(['spider_eye', 'brown_mushroom', 'sugar'], 'fermented_spider_eye');
  shapeless(['blaze_powder', '#coals', 'gunpowder'], 'fire_charge', 3);
  shapeless(['paper', 'gunpowder'], 'firework_rocket', 3);
  box2('rabbit_hide', 'leather');
  shaped(['GGG', 'GSG', 'OOO'], { G: 'glass', S: 'nether_star', O: 'obsidian' }, 'beacon');
  shaped(['GGG', 'GEG', 'GTG'], { G: 'glass', E: 'ender_eye', T: 'ghast_tear' }, 'end_crystal');
  shaped(['NNN', 'NHN', 'NNN'], { N: 'nautilus_shell', H: 'heart_of_the_sea' }, 'conduit');
  shapeless(['netherite_scrap', 'netherite_scrap', 'netherite_scrap', 'netherite_scrap', 'gold_ingot', 'gold_ingot', 'gold_ingot', 'gold_ingot'], 'netherite_ingot');
  shaped(['WWW', 'WSW', 'WWW'], { W: 'wheat', S: 'string' }, 'straw_bed');
  shaped(['TTT', 'TCT', 'TTT'], { T: 'iron_ingot', C: 'diamond' }, 'diamond_horse_armor');
  const SMELT = Object.create(null), SM_BLAST = new Set(), SM_SMOKE = new Set();
  const smelt = (i, o, xp, kind) => { const a = i[0] === '#' ? [...(TAGS[i.slice(1)] || [])] : IN[i] ? [IN[i].idx] : []; if (!IN[o]) return; for (const x of a) { SMELT[x] = [IN[o].idx, xp]; if (kind === 'b') SM_BLAST.add(x); if (kind === 's') SM_SMOKE.add(x); } };
  for (const [a, b, x] of [['raw_iron', 'iron_ingot', .7], ['iron_ore', 'iron_ingot', .7], ['deepslate_iron_ore', 'iron_ingot', .7], ['raw_gold', 'gold_ingot', 1], ['gold_ore', 'gold_ingot', 1], ['deepslate_gold_ore', 'gold_ingot', 1], ['nether_gold_ore', 'gold_ingot', 1], ['raw_copper', 'copper_ingot', .7], ['copper_ore', 'copper_ingot', .7], ['deepslate_copper_ore', 'copper_ingot', .7], ['ancient_debris', 'netherite_scrap', 2], ['coal_ore', 'coal', .1], ['deepslate_coal_ore', 'coal', .1], ['diamond_ore', 'diamond', 1], ['deepslate_diamond_ore', 'diamond', 1], ['emerald_ore', 'emerald', 1], ['deepslate_emerald_ore', 'emerald', 1], ['lapis_ore', 'lapis_lazuli', .2], ['deepslate_lapis_ore', 'lapis_lazuli', .2], ['redstone_ore', 'redstone', .7], ['deepslate_redstone_ore', 'redstone', .7], ['nether_quartz_ore', 'quartz', .2]]) smelt(a, b, x, 'b');
  for (const t of ['iron', 'golden']) for (const k of ['sword', 'pickaxe', 'axe', 'shovel', 'hoe', 'helmet', 'chestplate', 'leggings', 'boots', 'horse_armor']) smelt(t + '_' + k, t === 'iron' ? 'iron_nugget' : 'gold_nugget', .1, 'b');
  for (const k of ['helmet', 'chestplate', 'leggings', 'boots']) smelt('chainmail_' + k, 'iron_nugget', .1, 'b');
  for (const [a, b] of [['beef', 'cooked_beef'], ['porkchop', 'cooked_porkchop'], ['chicken', 'cooked_chicken'], ['mutton', 'cooked_mutton'], ['rabbit', 'cooked_rabbit'], ['cod', 'cooked_cod'], ['salmon', 'cooked_salmon'], ['potato', 'baked_potato'], ['kelp', 'dried_kelp']]) smelt(a, b, .35, 's');
  for (const [a, b, x] of [['sand', 'glass', .1], ['red_sand', 'glass', .1], ['cobblestone', 'stone', .1], ['stone', 'smooth_stone', .1], ['cobbled_deepslate', 'deepslate', .1], ['stone_bricks', 'cracked_stone_bricks', .1], ['deepslate_bricks', 'cracked_deepslate_bricks', .1], ['deepslate_tiles', 'cracked_deepslate_tiles', .1], ['nether_bricks', 'cracked_nether_bricks', .1], ['polished_blackstone_bricks', 'cracked_polished_blackstone_bricks', .1], ['clay_ball', 'brick', .3], ['netherrack', 'nether_brick', .1], ['clay', 'terracotta', .35], ['cactus', 'green_dye', 1], ['sea_pickle', 'lime_dye', .1], ['#logs_burn', 'charcoal', .15], ['wet_sponge', 'sponge', .15], ['chorus_fruit', 'popped_chorus_fruit', .1], ['sandstone', 'smooth_sandstone', .1], ['red_sandstone', 'smooth_red_sandstone', .1], ['quartz_block', 'smooth_quartz', .1], ['basalt', 'smooth_basalt', .1], ['resin_clump', 'resin_brick', .3]]) smelt(a, b, x);
  for (const c of COLORS) smelt(c + '_terracotta', c + '_glazed_terracotta', .1);
  const CUT = Object.create(null);
  const cut = (i, o, n) => { if (!IN[i] || !IN[o]) return; (CUT[IN[i].idx] = CUT[IN[i].idx] || []).push([IN[o].idx, n || 1]); };
  for (const [base, tex, set] of STONE_FAMS) { const nm = slabName(base); if (set.includes('sl')) cut(base, nm + '_slab', 2); if (set.includes('st')) cut(base, nm + '_stairs'); if (set.includes('w')) cut(base, nm + '_wall'); }
  for (const [a, l] of [['stone', ['stone_bricks', 'stone_brick_slab', 'stone_brick_stairs', 'stone_brick_wall', 'chiseled_stone_bricks']], ['stone_bricks', ['chiseled_stone_bricks']], ['granite', ['polished_granite', 'polished_granite_slab', 'polished_granite_stairs']], ['diorite', ['polished_diorite', 'polished_diorite_slab', 'polished_diorite_stairs']], ['andesite', ['polished_andesite', 'polished_andesite_slab', 'polished_andesite_stairs']], ['cobbled_deepslate', ['polished_deepslate', 'deepslate_bricks', 'deepslate_tiles', 'chiseled_deepslate']], ['polished_deepslate', ['deepslate_bricks', 'deepslate_tiles']], ['deepslate_bricks', ['deepslate_tiles']], ['tuff', ['polished_tuff', 'tuff_bricks', 'chiseled_tuff', 'chiseled_tuff_bricks']], ['polished_tuff', ['tuff_bricks', 'chiseled_tuff_bricks']], ['tuff_bricks', ['chiseled_tuff_bricks']], ['sandstone', ['cut_sandstone', 'chiseled_sandstone', 'cut_sandstone_slab']], ['red_sandstone', ['cut_red_sandstone', 'chiseled_red_sandstone', 'cut_red_sandstone_slab']], ['blackstone', ['polished_blackstone', 'polished_blackstone_bricks', 'chiseled_polished_blackstone']], ['polished_blackstone', ['polished_blackstone_bricks', 'chiseled_polished_blackstone']], ['quartz_block', ['quartz_pillar', 'chiseled_quartz_block', 'quartz_bricks']], ['purpur_block', ['purpur_pillar']], ['end_stone', ['end_stone_bricks', 'end_stone_brick_slab', 'end_stone_brick_stairs', 'end_stone_brick_wall']], ['copper_block', ['cut_copper', 'cut_copper_slab', 'cut_copper_stairs', 'chiseled_copper', 'copper_grate']], ['smooth_stone', ['smooth_stone_slab']], ['cinnabar', ['polished_cinnabar', 'cinnabar_bricks', 'chiseled_cinnabar']], ['sulfur', ['polished_sulfur', 'sulfur_bricks', 'chiseled_sulfur']], ['mud_bricks', []]]) for (const o of l) cut(a, o, o.endsWith('_slab') ? 2 : 1);
  const ingOk = (k, id) => k === null ? id === null : id !== null && (typeof k === 'number' ? k === id : k.has(id));
  function craftMatch(grid, w) {
    let x0 = 9, y0 = 9, x1 = -1, y1 = -1, n = 0;
    const h = grid.length / w;
    for (let i = 0; i < grid.length; i++) if (grid[i]) { const x = i % w, y = i / w | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; }
    if (!n) return null;
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, at = (x, y) => { const s = grid[(y0 + y) * w + x0 + x]; return s ? s.id : null; };
    for (const r of RECIPES) {
      if (r.w !== cw || r.h !== ch) continue;
      for (const mir of [0, 1]) {
        let ok = true;
        for (let y = 0; y < ch && ok; y++) for (let x = 0; x < cw && ok; x++) ok = ingOk(r.g[y * cw + (mir ? cw - 1 - x : x)], at(x, y));
        if (ok) return r;
      }
    }
    const items = []; for (const s of grid) if (s) items.push(s.id);
    for (const r of SHAPELESS) {
      if (r.l.length !== items.length) continue;
      const used = new Array(items.length).fill(false);
      let ok = true;
      for (const k of r.l) { let f = -1; for (let i = 0; i < items.length; i++) if (!used[i] && ingOk(k, items[i])) { f = i; break; } if (f < 0) { ok = false; break; } used[f] = true; }
      if (ok) return r;
    }
    if (items.length === 2 && items[0] === items[1] && IT[items[0]].dur) { const a = grid.filter(Boolean); const d = Math.max(0, IT[items[0]].dur - ((IT[items[0]].dur - a[0].d) + (IT[items[0]].dur - a[1].d) + Math.floor(IT[items[0]].dur / 20))); return { out: items[0], n: 1, dmg: d, repair: 1 }; }
    return null;
  }
  const fuelOf = id => IT[id] && IT[id].fuel || 0;
  function GENF(ID, seed, wtype) {
    'use strict';
    const H = 320, NSEC = 20, SEA = 126;
    const big = wtype === 'large' ? 4 : 1, amp = wtype === 'amplified' ? 2.1 : 1;
    const mix = a => { a = Math.imul(a ^ a >>> 16, 0x45d9f3b); a = Math.imul(a ^ a >>> 16, 0x45d9f3b); return a ^ a >>> 16; };
    const rngF = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const hsh = (x, y, z) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1442695041) + Math.imul(seed, 1274126177) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
    const cl = (v, a, b) => v < a ? a : v > b ? b : v;
    const sst = (a, b, v) => { const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const lrp = (a, b, t) => a + (b - a) * t;
    function perm(s) {
      const r = rngF(mix(seed * 31 + s * 977 + 7)), p = new Uint8Array(512), a = new Uint8Array(256);
      for (let i = 0; i < 256; i++) a[i] = i;
      for (let i = 255; i > 0; i--) { const j = r() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; }
      for (let i = 0; i < 512; i++) p[i] = a[i & 255];
      return p;
    }
    const G2 = [[1, 0], [-1, 0], [0, 1], [0, -1], [.7071, .7071], [-.7071, .7071], [.7071, -.7071], [-.7071, -.7071]];
    function n2(p, x, y) {
      let X = Math.floor(x), Y = Math.floor(y); x -= X; y -= Y; X &= 255; Y &= 255;
      const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10);
      const a = G2[p[p[X] + Y] & 7], b = G2[p[p[X + 1] + Y] & 7], c = G2[p[p[X] + Y + 1] & 7], d = G2[p[p[X + 1] + Y + 1] & 7];
      const ab = lrp(a[0] * x + a[1] * y, b[0] * (x - 1) + b[1] * y, u), cd = lrp(c[0] * x + c[1] * (y - 1), d[0] * (x - 1) + d[1] * (y - 1), u);
      return lrp(ab, cd, v) * 1.4;
    }
    const grd = (h, x, y, z) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
    function n3(p, x, y, z) {
      let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      x -= X; y -= Y; z -= Z; X &= 255; Y &= 255; Z &= 255;
      const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10), w = z * z * z * (z * (z * 6 - 15) + 10);
      const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return lrp(lrp(lrp(grd(p[AA], x, y, z), grd(p[BA], x - 1, y, z), u), lrp(grd(p[AB], x, y - 1, z), grd(p[BB], x - 1, y - 1, z), u), v),
        lrp(lrp(grd(p[AA + 1], x, y, z - 1), grd(p[BA + 1], x - 1, y, z - 1), u), lrp(grd(p[AB + 1], x, y - 1, z - 1), grd(p[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    }
    const fb2 = (p, x, z, o) => { let t = 0, a = 1, f = 1, n = 0; for (let i = 0; i < o; i++) { t += n2(p, x * f + i * 17.3, z * f - i * 9.1) * a; n += a; a *= .5; f *= 2; } return t / n; };
    const PC = perm(1), PE = perm(2), PW = perm(3), PT = perm(4), PH = perm(5), PD = perm(6), PR = perm(7), PK1 = perm(8), PK2 = perm(9), PK3 = perm(10), PS = perm(11), PB = perm(12), PO = perm(13), PX = perm(14);
    const B = (n, g, f, w, t, o) => Object.assign({ n, g, f, w, t, tr: [], td: 0, fl: [], gd: .1 }, o || {});
    const BIO = [
      B('Plains', 0x91BD59, 0x77AB2F, 0x3F76E4, .8, { tr: [['oak', 9], ['birch', 1], ['fancy_oak', 1]], td: .012, fl: ['dandelion', 'poppy', 'azure_bluet', 'oxeye_daisy', 'cornflower', 'red_tulip', 'white_tulip', 'pink_tulip', 'orange_tulip'], gd: .32 }),
      B('Sunflower Plains', 0x91BD59, 0x77AB2F, 0x3F76E4, .8, { tr: [['oak', 1]], td: .006, fl: ['sunflower', 'dandelion', 'poppy', 'sunflower'], gd: .3, fd: .06 }),
      B('Forest', 0x79C05A, 0x59AE30, 0x3F76E4, .7, { tr: [['oak', 8], ['birch', 2], ['fancy_oak', 1]], td: .32, fl: ['dandelion', 'poppy', 'lily_of_the_valley', 'lilac', 'rose_bush', 'peony'], gd: .12 }),
      B('Flower Forest', 0x79C05A, 0x59AE30, 0x3F76E4, .7, { tr: [['oak', 3], ['birch', 1]], td: .12, fl: ['allium', 'azure_bluet', 'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip', 'oxeye_daisy', 'cornflower', 'lily_of_the_valley', 'dandelion', 'poppy', 'lilac', 'rose_bush', 'peony'], gd: .08, fd: .3 }),
      B('Birch Forest', 0x88BB67, 0x6BA941, 0x3F76E4, .6, { tr: [['birch', 1]], td: .32, fl: ['dandelion', 'poppy', 'lily_of_the_valley', 'wildflowers'], gd: .12 }),
      B('Dark Forest', 0x507A32, 0x59AE30, 0x3F76E4, .7, { tr: [['dark_oak', 10], ['oak', 1], ['huge_red_mushroom', .3], ['huge_brown_mushroom', .3], ['birch', .4]], td: .55, fl: ['dandelion', 'poppy', 'red_mushroom', 'brown_mushroom'], gd: .08 }),
      B('Taiga', 0x86B783, 0x68A464, 0x287082, .25, { tr: [['spruce', 3], ['pine', 1]], td: .3, fl: ['fern', 'sweet_berry_bush', 'large_fern', 'brown_mushroom'], gd: .14 }),
      B('Snowy Plains', 0x80B497, 0x60A17B, 0x3D57D6, 0, { tr: [['spruce', 1]], td: .004, fl: [], gd: .02, snow: 1 }),
      B('Snowy Taiga', 0x80B497, 0x60A17B, 0x3D57D6, -.5, { tr: [['spruce', 3], ['pine', 1]], td: .25, fl: ['fern', 'sweet_berry_bush'], gd: .06, snow: 1 }),
      B('Desert', 0xBFB755, 0xAEA42A, 0x32A598, 2, { tr: [], td: 0, fl: ['dead_bush'], gd: 0, dry: 1, top: 'sand' }),
      B('Savanna', 0xBFB755, 0xAEA42A, 0x2C8B9C, 2, { tr: [['acacia', 4], ['oak', 1]], td: .04, fl: ['dandelion', 'poppy'], gd: .4, dry: 1 }),
      B('Jungle', 0x59C93C, 0x30BB0B, 0x14A2C5, .95, { tr: [['jungle_big', 2], ['jungle', 5], ['fancy_oak', 1], ['jungle_bush', 3]], td: .6, fl: ['melon', 'fern', 'poppy', 'dandelion'], gd: .25 }),
      B('Sparse Jungle', 0x64C73F, 0x3EB80F, 0x0D8AE3, .95, { tr: [['jungle', 3], ['jungle_bush', 2], ['oak', 1]], td: .1, fl: ['melon', 'fern'], gd: .25 }),
      B('Bamboo Jungle', 0x59C93C, 0x30BB0B, 0x14A2C5, .95, { tr: [['jungle', 2], ['jungle_bush', 2]], td: .12, fl: ['bamboo', 'bamboo', 'fern'], gd: .2, fd: .2 }),
      B('Swamp', 0x6A7039, 0x6A7039, 0x617B64, .8, { tr: [['swamp_oak', 1]], td: .05, fl: ['blue_orchid', 'brown_mushroom', 'red_mushroom'], gd: .08, lily: 1 }),
      B('Mangrove Swamp', 0x6A7039, 0x8DB127, 0x3A7A6A, .8, { tr: [['mangrove', 1]], td: .25, fl: [], gd: .02, lily: 1 }),
      B('Badlands', 0x90814D, 0x9E814D, 0x3F76E4, 2, { tr: [], td: 0, fl: ['dead_bush'], gd: 0, dry: 1, top: 'red_sand', bad: 1 }),
      B('Windswept Hills', 0x8AB689, 0x6DA36B, 0x3F76E4, .2, { tr: [['spruce', 2], ['oak', 1]], td: .03, fl: [], gd: .08 }),
      B('Meadow', 0x83BB6D, 0x63A948, 0x0E4ECF, .5, { tr: [['oak', 1], ['birch', 1]], td: .003, fl: ['dandelion', 'poppy', 'allium', 'azure_bluet', 'oxeye_daisy', 'cornflower'], gd: .45, fd: .08 }),
      B('Grove', 0x80B497, 0x60A17B, 0x3F76E4, -.2, { tr: [['spruce', 1]], td: .12, fl: [], gd: 0, snow: 1 }),
      B('Snowy Slopes', 0x80B497, 0x60A17B, 0x3F76E4, -.3, { tr: [], td: 0, fl: [], gd: 0, snow: 1, top: 'snow_block' }),
      B('Jagged Peaks', 0x80B497, 0x60A17B, 0x3F76E4, -.7, { tr: [], td: 0, fl: [], gd: 0, snow: 1, top: 'snow_block' }),
      B('Frozen Peaks', 0x80B497, 0x60A17B, 0x3F76E4, -.7, { tr: [], td: 0, fl: [], gd: 0, snow: 1, top: 'packed_ice' }),
      B('Stony Peaks', 0x9ABE4B, 0x82AC1E, 0x3F76E4, 1, { tr: [], td: 0, fl: [], gd: 0, top: 'stone' }),
      B('Cherry Grove', 0xB6DB61, 0xB6DB61, 0x5DB7EF, .5, { tr: [['cherry', 1]], td: .1, fl: ['pink_petals', 'pink_petals', 'pink_petals'], gd: .3, fd: .25 }),
      B('Pale Garden', 0x778272, 0x878D76, 0x76889D, .7, { tr: [['pale_oak', 1]], td: .55, fl: ['closed_eyeblossom', 'pale_moss_carpet'], gd: .02, fd: .05 }),
      B('Dappled Forest', 0x9DB35A, 0xA9A43A, 0x3F76E4, .6, { tr: [['poplar', 6], ['oak', 1]], td: .22, fl: ['red_shrub', 'dandelion', 'poppy', 'leaf_litter', 'leaf_litter'], gd: .14, fd: .07 }),
      B('Beach', 0x91BD59, 0x77AB2F, 0x3F76E4, .8, { top: 'sand' }),
      B('Snowy Beach', 0x83B593, 0x64A278, 0x3D57D6, .05, { top: 'sand', snow: 1 }),
      B('Stony Shore', 0x8AB689, 0x6DA36B, 0x3F76E4, .2, { top: 'stone' }),
      B('River', 0x8EB971, 0x71A74D, 0x3F76E4, .5, { water: 1 }),
      B('Frozen River', 0x80B497, 0x60A17B, 0x3938C9, 0, { water: 1, snow: 1 }),
      B('Ocean', 0x8EB971, 0x71A74D, 0x3F76E4, .5, { water: 1 }),
      B('Deep Ocean', 0x8EB971, 0x71A74D, 0x3F76E4, .5, { water: 1 }),
      B('Warm Ocean', 0x8EB971, 0x71A74D, 0x43D5EE, .5, { water: 1, warm: 1 }),
      B('Lukewarm Ocean', 0x8EB971, 0x71A74D, 0x45ADF2, .5, { water: 1 }),
      B('Cold Ocean', 0x8EB971, 0x71A74D, 0x3D57D6, .5, { water: 1 }),
      B('Frozen Ocean', 0x80B497, 0x60A17B, 0x3938C9, 0, { water: 1, snow: 1 }),
      B('Mushroom Fields', 0x55C93F, 0x2BBB0F, 0x3F76E4, .9, { tr: [['huge_red_mushroom', 1], ['huge_brown_mushroom', 1]], td: .03, fl: ['red_mushroom', 'brown_mushroom'], gd: 0, top: 'mycelium' }),
      B('Windswept Forest', 0x8AB689, 0x6DA36B, 0x3F76E4, .2, { tr: [['spruce', 2], ['oak', 1]], td: .25, fl: [], gd: .08 }),
      B('Savanna Plateau', 0xBFB755, 0xAEA42A, 0x2C8B9C, 2, { tr: [['acacia', 4], ['oak', 1]], td: .06, fl: [], gd: .45, dry: 1 }),
      B('Old Growth Spruce Taiga', 0x86B783, 0x68A464, 0x3F76E4, .25, { tr: [['mega_spruce', 2], ['spruce', 2]], td: .35, fl: ['fern', 'large_fern', 'brown_mushroom'], gd: .14, podzol: 1 })
    ];
    const BI = {}; BIO.forEach((b, i) => { BI[b.n] = i; b.id = i; });
    const flat = wtype === 'flat';
    const colInfo = {};
    const CG = new Map();
    function cg(gx, gz) {
      const k = gx * 65536 + gz;
      let v = CG.get(k);
      if (v) return v;
      if (CG.size > 30000) CG.clear();
      const x = gx * 4, z = gz * 4, s = 1 / big;
      v = [Math.tanh(fb2(PC, x * s / 1300, z * s / 1300, 5) * 3.4 + .25), Math.tanh(fb2(PE, x * s / 760, z * s / 760, 4) * 3.8), Math.tanh(fb2(PW, x * s / 540, z * s / 540, 3) * 3.1), Math.tanh(fb2(PT, x * s / 1700, z * s / 1700, 3) * 2.9), Math.tanh(fb2(PH, x * s / 1400, z * s / 1400, 3) * 2.6), fb2(PR, x * s / 420, z * s / 420, 2), fb2(PB, x * s / 230, z * s / 230, 2)];
      CG.set(k, v);
      return v;
    }
    const CL = new Float64Array(7);
    function climate(x, z) {
      const gx = Math.floor(x / 4), gz = Math.floor(z / 4), fx = (x - gx * 4) / 4, fz = (z - gz * 4) / 4;
      const a = cg(gx, gz), b = cg(gx + 1, gz), c = cg(gx, gz + 1), d = cg(gx + 1, gz + 1);
      for (let i = 0; i < 7; i++) CL[i] = lrp(lrp(a[i], b[i], fx), lrp(c[i], d[i], fx), fz);
      return CL;
    }
    function column(x, z, o) {
      o = o || colInfo;
      if (flat) { o.h = 3 + 0; o.b = BI.Plains; o.r = 0; o.m = 0; return o; }
      const s = 1 / big;
      const K = climate(x, z), C = K[0], E = K[1], Wd = K[2], T = K[3], Hm = K[4];
      const D = fb2(PD, x / 48, z / 48, 3);
      const pv = 1 - Math.abs(Math.abs(Wd) * 3 - 2);
      const sp = [[-1, -46], [-.6, -30], [-.44, -15], [-.37, -5], [-.31, -1], [-.26, 2], [-.1, 5], [.3, 11], [.7, 22], [1, 30]];
      let k = 0; while (k < sp.length - 2 && C > sp[k + 1][0]) k++;
      let h = SEA + lrp(sp[k][1], sp[k + 1][1], cl((C - sp[k][0]) / (sp[k + 1][0] - sp[k][0]), 0, 1));
      const land = sst(-.36, -.2, C), m = cl((-E - .2) * 1.7, 0, 1) * land;
      h += Math.pow(m, 1.6) * (pv * .5 + .6) * 118 * amp;
      h += land * (1 - m * .7) * (pv * 7 + K[6] * 14 * sst(-.2, .3, E + .3)) * (amp > 1 ? 1.8 : 1) + D * 3.2;
      const rv = Math.abs(K[5]);
      let river = 0;
      if (C > -.33 && m < .6) {
        const rw = .03;
        if (rv < rw * 2.4) { const f = sst(rw * 2.4, rw * .5, rv); h = lrp(h, Math.min(h, SEA - 3 - (rv < rw * .6 ? 2 : 0)), f); if (rv < rw) river = 1; }
      }
      h = cl(Math.round(h), 8, H - 12);
      o.h = h; o.r = river; o.m = m;
      let b;
      const hot = T > .55, warm = T > .2, cold = T < -.25, frozen = T < -.58;
      if (h < SEA - 1 && C < -.33 && !river) {
        const deep = h < SEA - 18;
        if (Wd > .8 && C < -.7 && Hm > .55) b = BI['Mushroom Fields'];
        else b = frozen ? BI['Frozen Ocean'] : cold ? BI['Cold Ocean'] : hot ? BI['Warm Ocean'] : warm ? BI['Lukewarm Ocean'] : deep ? BI['Deep Ocean'] : BI.Ocean;
      } else if (river) b = frozen ? BI['Frozen River'] : BI.River;
      else if (h <= SEA + 2 && C < -.24 && m < .3) b = frozen ? BI['Snowy Beach'] : m > .12 || E < -.55 ? BI['Stony Shore'] : hot && Hm < -.2 ? BI.Desert : BI.Beach;
      else if (h > SEA + 100 * Math.min(amp, 1.4)) b = hot ? BI['Stony Peaks'] : Wd > 0 ? BI['Jagged Peaks'] : BI['Frozen Peaks'];
      else if (h > SEA + 70 && m > .3) b = hot ? BI['Stony Peaks'] : BI['Snowy Slopes'];
      else if (h > SEA + 34 && m > .2) b = frozen || cold ? BI.Grove : hot ? BI['Savanna Plateau'] : Math.abs(Wd) > .55 && Hm < .3 ? BI['Cherry Grove'] : Hm > .25 ? BI['Windswept Forest'] : Hm < -.3 ? BI['Windswept Hills'] : BI.Meadow;
      else if (h <= SEA + 4 && Hm > .45 && T > -.2 && E > .3) b = hot ? BI['Mangrove Swamp'] : BI.Swamp;
      else if (frozen) b = Hm > .1 ? BI['Snowy Taiga'] : BI['Snowy Plains'];
      else if (cold) b = Hm > .5 ? BI['Old Growth Spruce Taiga'] : Hm > -.35 ? BI.Taiga : BI.Plains;
      else if (!warm) {
        if (Hm < -.45) b = Wd > .5 ? BI['Sunflower Plains'] : BI.Plains;
        else if (Hm < -.05) b = Wd > .45 ? BI['Flower Forest'] : Wd < -.55 ? BI['Dappled Forest'] : BI.Forest;
        else if (Hm < .3) b = Wd < -.35 ? BI['Dappled Forest'] : BI['Birch Forest'];
        else if (Hm < .55) b = Wd > .45 ? BI['Flower Forest'] : BI.Forest;
        else b = Wd < -.5 ? BI['Pale Garden'] : BI['Dark Forest'];
      } else if (!hot) {
        if (Hm < -.3) b = BI.Savanna;
        else if (Hm < .1) b = Wd > .5 ? BI['Cherry Grove'] : Wd < -.6 ? BI['Sunflower Plains'] : BI.Plains;
        else if (Hm < .4) b = Wd > .4 ? BI['Bamboo Jungle'] : BI['Sparse Jungle'];
        else b = BI.Jungle;
      } else {
        if (Hm < .15) b = Math.abs(Wd) > .6 ? BI.Badlands : BI.Desert;
        else if (Hm < .4) b = BI.Savanna;
        else b = BI.Jungle;
      }
      o.b = b;
      return o;
    }
    const TBANDS = (() => {
      const r = rngF(mix(seed + 99)), a = new Array(64).fill('terracotta');
      const cols = ['orange_terracotta', 'yellow_terracotta', 'brown_terracotta', 'red_terracotta', 'white_terracotta', 'light_gray_terracotta'];
      for (let i = 0; i < 64; i++) { const v = r(); if (v < .5) a[i] = cols[r() * cols.length | 0]; if (v > .8 && i < 63) a[++i] = a[i - 1]; }
      return a.map(n => ID[n] || ID.terracotta);
    })();
    const L = (x, y, z) => x | z << 4 | y << 8;
    function gen(cx, cz) {
      const b = new Uint16Array(16 * 16 * H), x0 = cx * 16, z0 = cz * 16, M = 6, CW = 16 + 2 * M;
      const CH = new Int16Array(CW * CW), CB = new Uint8Array(CW * CW), CR = new Uint8Array(CW * CW);
      const ci = {};
      for (let z = 0; z < CW; z++) for (let x = 0; x < CW; x++) { column(x0 + x - M, z0 + z - M, ci); const i = z * CW + x; CH[i] = ci.h; CB[i] = ci.b; CR[i] = ci.r; }
      const at = (x, z) => (z + M) * CW + x + M;
      const bio = new Uint8Array(256), hm = new Int16Array(256);
      let top = 0;
      const R = rngF(mix(seed ^ Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663)));
      if (flat) {
        for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) { b[L(x, 0, z)] = ID.bedrock; b[L(x, 1, z)] = ID.dirt; b[L(x, 2, z)] = ID.dirt; b[L(x, 3, z)] = ID.grass_block; bio[x | z << 4] = BI.Plains; hm[x | z << 4] = 3; }
        return pack(b, bio, hm, 4);
      }
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
        const i = at(x, z), h = CH[i], bb = BIO[CB[i]], wx = x0 + x, wz = z0 + z;
        bio[x | z << 4] = CB[i];
        const dsl = 64 + Math.round(hsh(wx, 1, wz) * 6) - 3;
        for (let y = 0; y <= h; y++) b[L(x, y, z)] = y < dsl ? ID.deepslate : ID.stone;
        for (let y = 0; y < 5; y++) if (y === 0 || hsh(wx, y, wz) < (5 - y) / 5) b[L(x, y, z)] = ID.bedrock;
        const n = hsh(wx, 7, wz), uw = h < SEA;
        let tp = ID.grass_block, fl = ID.dirt, fd = 3 + (n * 2 | 0);
        if (bb.top === 'sand') { tp = ID.sand; fl = ID.sand; fd = 4; }
        else if (bb.top === 'red_sand') { tp = ID.red_sand; fl = ID.red_sand; fd = 1; }
        else if (bb.top === 'stone') { tp = ID.stone; fl = ID.stone; if (bb.n === 'Stony Peaks' && n < .3) tp = ID.calcite; if (bb.n === 'Stony Shore' && n < .25) tp = ID.gravel; }
        else if (bb.top === 'snow_block') { tp = ID.snow_block; fl = ID.snow_block; fd = 2 + (n * 3 | 0); if (h < SEA + 105 && n < .3) { tp = ID.stone; fl = ID.stone; } }
        else if (bb.top === 'packed_ice') { tp = n < .5 ? ID.packed_ice : ID.snow_block; fl = ID.packed_ice; fd = 3; }
        else if (bb.top === 'mycelium') tp = ID.mycelium;
        if (bb.n === 'Windswept Hills' && fb2(PS, wx / 24, wz / 24, 2) > .25) { tp = ID.gravel; fl = ID.gravel; }
        if (bb.n === 'Old Growth Spruce Taiga' || (bb.n === 'Taiga' && fb2(PS, wx / 20, wz / 20, 2) > .3)) { if (n < .6) tp = ID.podzol; else if (n < .7) tp = ID.coarse_dirt; }
        if (bb.n === 'Savanna' && fb2(PS, wx / 30, wz / 30, 2) > .35) tp = ID.coarse_dirt;
        if (bb.n === 'Dark Forest' && n < .02) tp = ID.podzol;
        if (bb.n === 'Pale Garden' && n < .25) tp = ID.pale_moss_block;
        if (bb.n === 'Mangrove Swamp') { tp = ID.mud; fl = ID.mud; }
        if (uw) {
          const o = bb.water && !bb.n.includes('River');
          if (o) { const g = fb2(PS, wx / 18, wz / 18, 2); tp = bb.warm ? ID.sand : h < SEA - 17 || bb.n.includes('Cold') || bb.n.includes('Frozen') ? (g > .2 ? ID.sand : ID.gravel) : (g > .35 ? ID.gravel : g < -.45 ? ID.clay : ID.sand); fl = tp === ID.clay ? ID.clay : tp; }
          else if (bb.top !== 'sand' && bb.top !== 'red_sand') { const g = fb2(PS, wx / 14, wz / 14, 2); tp = h >= SEA - 2 && g > -.1 ? ID.sand : g > .3 ? ID.gravel : g < -.4 ? ID.clay : ID.dirt; fl = tp === ID.sand ? ID.sand : tp === ID.gravel ? ID.gravel : ID.dirt; if (bb.n === 'Mangrove Swamp' || bb.n === 'Swamp') { tp = ID.mud; fl = ID.mud; } }
        }
        for (let y = Math.max(5, h - fd); y < h; y++) b[L(x, y, z)] = fl;
        b[L(x, h, z)] = tp;
        if (tp === ID.sand || fl === ID.sand) for (let y = Math.max(5, h - fd - 3); y < h - fd; y++) b[L(x, y, z)] = ID.sandstone;
        if (bb.bad) for (let y = Math.max(SEA - 10, h - 40); y < h; y++) b[L(x, y, z)] = TBANDS[(y + Math.round(n * 2)) & 63];
        if (bb.bad && h > SEA + 18) b[L(x, h, z)] = TBANDS[h & 63];
        if (uw) for (let y = h + 1; y <= SEA; y++) b[L(x, y, z)] = ID.water;
        if (uw && (bb.snow || bb.n === 'Frozen River')) b[L(x, SEA, z)] = ID.ice;
        const tt = Math.max(h, SEA);
        if (tt > top) top = tt;
        hm[x | z << 4] = h;
      }
      carve(b, x0, z0, CH, at);
      ores(b, R, cx, cz);
      decorate(b, x0, z0, CH, CB, CR, at, R, bio, hm);
      for (let i = 0; i < 256; i++) { let y = H - 1; const xz = i; while (y > 0 && !b[xz | y << 8]) y--; if (y + 1 > top) top = y + 1; }
      return pack(b, bio, hm, top);
    }
    function pack(b, bio, hm, top) {
      const secs = new Array(NSEC).fill(null);
      for (let s = 0; s < NSEC; s++) {
        const o = s * 4096, sub = b.subarray(o, o + 4096);
        let any = false; for (let i = 0; i < 4096; i++) if (sub[i]) { any = true; break; }
        if (any) secs[s] = sub.slice();
      }
      return { secs, bio, hm, top: Math.min(H - 1, top) };
    }
    function carve(b, x0, z0, CH, at) {
      const NX = 5, NY = 41, NZ = 5, gc = new Float32Array(NX * NY * NZ), gs = new Float32Array(NX * NY * NZ), gt = new Float32Array(NX * NY * NZ);
      let hmax = 0;
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) hmax = Math.max(hmax, CH[at(x, z)]);
      const yl = Math.min(NY - 1, (hmax >> 3) + 2);
      for (let k = 0; k <= yl; k++) for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
        const wx = x0 + i * 4, wy = k * 8, wz = z0 + j * 4, g = (k * NZ + j) * NX + i;
        gc[g] = n3(PK1, wx / 84, wy / 46, wz / 84) + n3(PK1, wx / 30 + 50, wy / 20, wz / 30) * .32;
        const a = n3(PK2, wx / 52, wy / 30, wz / 52), c = n3(PK3, wx / 52, wy / 30 + 11, wz / 52);
        gs[g] = a * a + c * c;
        gt[g] = n3(PX, wx / 120, wy / 80, wz / 120);
      }
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
        const h = CH[at(x, z)], i0 = x >> 2, fx = (x & 3) / 4, j0 = z >> 2, fz = (z & 3) / 4, wx = x0 + x, wz = z0 + z;
        const ent = n2(PO, wx / 70, wz / 70) > .42;
        const ymax = Math.min(h - (ent ? -2 : 6), H - 2);
        for (let y = 6; y < ymax; y++) {
          const k0 = y >> 3, fy = (y & 7) / 8;
          const g000 = (k0 * NZ + j0) * NX + i0, g100 = g000 + 1, g010 = g000 + NX, g110 = g010 + 1, g001 = g000 + NX * NZ, g101 = g001 + 1, g011 = g001 + NX, g111 = g011 + 1;
          const tri = A => lrp(lrp(lrp(A[g000], A[g100], fx), lrp(A[g010], A[g110], fx), fz), lrp(lrp(A[g001], A[g101], fx), lrp(A[g011], A[g111], fx), fz), fy);
          const depth = h - y, ch = tri(gc), spg = tri(gs);
          const th = .5 + (y > 150 ? (y - 150) * .01 : 0) + (depth < 12 ? (12 - depth) * .03 : 0) - (y < 60 ? .06 : 0);
          let cv = ch > th;
          if (!cv) cv = spg < (.0035 + (y < 70 ? .002 : 0)) * (depth < 8 && !ent ? 0 : 1);
          if (!cv && y < 100) cv = tri(gt) > .5 && ch > .25;
          if (!cv) continue;
          const li = L(x, y, z), cur = b[li];
          if (cur === ID.water || cur === ID.bedrock || cur === ID.ice) continue;
          if (y >= h - 1 && (b[L(x, Math.min(H - 1, y + 1), z)] === ID.water || h < SEA + 1)) continue;
          b[li] = y < 10 ? ID.lava : 0;
        }
      }
    }
    function ores(b, R, cx, cz) {
      const isS = id => id === ID.stone || id === ID.deepslate || id === ID.granite || id === ID.diorite || id === ID.andesite || id === ID.tuff;
      const ST = new Uint8Array(65536);
      ST[ID.stone] = 1; ST[ID.deepslate] = 2; ST[ID.granite] = 1; ST[ID.diorite] = 1; ST[ID.andesite] = 1; ST[ID.tuff] = 2;
      const blob = (ore, dore, size, y, air) => {
        if (y < 1 || y >= H - 1) return;
        const x = R() * 16, z = R() * 16, r = .6 + size / 11, ry = r * .8, ir = 1 / (r * r), iry = 1 / (ry * ry);
        const n = Math.ceil(r);
        for (let dy = -n; dy <= n; dy++) {
          const Y = Math.floor(y + dy);
          if (Y < 1 || Y >= H - 1) continue;
          for (let dz = -n; dz <= n; dz++) {
            const Z = Math.floor(z + dz);
            if (Z < 0 || Z > 15) continue;
            for (let dx = -n; dx <= n; dx++) {
              const X = Math.floor(x + dx);
              if (X < 0 || X > 15) continue;
              const d = (dx * dx + dz * dz) * ir + dy * dy * iry;
              if (d > 1) continue;
              const li = X | Z << 4 | Y << 8, c = b[li], k = ST[c];
              if (!k || R() < .25 + d * .3) continue;
              if (air && R() < air && ((X < 15 && !b[li + 1]) || (X > 0 && !b[li - 1]) || (Z < 15 && !b[li + 16]) || (Z > 0 && !b[li - 16]) || !b[li + 256] || !b[li - 256])) continue;
              b[li] = k === 2 ? dore : ore;
            }
          }
        }
      };
      const tri = (lo, hi) => lo + (R() + R()) / 2 * (hi - lo);
      const uni = (lo, hi) => lo + R() * (hi - lo);
      const V = 64;
      if (R() < .7) blob(ID.dirt, ID.dirt, 20, uni(V, V + 140), 0);
      if (R() < .7) blob(ID.gravel, ID.gravel, 20, uni(V - 64, V + 140), 0);
      for (let i = 0; i < 2; i++) { const t = [ID.granite, ID.diorite, ID.andesite][R() * 3 | 0]; blob(t, t, 30, uni(V, V + 60), 0); }
      if (R() < .5) blob(ID.tuff, ID.tuff, 30, uni(V - 64, V), 0);
      for (let i = 0; i < 20; i++) blob(ID.coal_ore, ID.deepslate_coal_ore, 15, uni(V + 136, V + 250), 0);
      for (let i = 0; i < 20; i++) blob(ID.coal_ore, ID.deepslate_coal_ore, 15, tri(V, V + 192), .5);
      for (let i = 0; i < 10; i++) blob(ID.iron_ore, ID.deepslate_iron_ore, 8, tri(V - 24, V + 56), 0);
      for (let i = 0; i < 6; i++) blob(ID.iron_ore, ID.deepslate_iron_ore, 4, uni(V - 64, V + 72), 0);
      for (let i = 0; i < 8; i++) blob(ID.iron_ore, ID.deepslate_iron_ore, 9, tri(V + 80, V + 250), 0);
      for (let i = 0; i < 16; i++) blob(ID.copper_ore, ID.deepslate_copper_ore, 9, tri(V - 16, V + 112), 0);
      for (let i = 0; i < 4; i++) blob(ID.gold_ore, ID.deepslate_gold_ore, 8, tri(V - 64, V + 32), .5);
      for (let i = 0; i < 4; i++) blob(ID.redstone_ore, ID.deepslate_redstone_ore, 7, uni(V - 64, V + 15), 0);
      for (let i = 0; i < 8; i++) blob(ID.redstone_ore, ID.deepslate_redstone_ore, 7, tri(V - 96, V - 32), 0);
      for (let i = 0; i < 2; i++) blob(ID.lapis_ore, ID.deepslate_lapis_ore, 6, tri(V - 32, V + 32), 0);
      for (let i = 0; i < 4; i++) blob(ID.lapis_ore, ID.deepslate_lapis_ore, 6, uni(V - 64, V + 64), 1);
      for (let i = 0; i < 7; i++) blob(ID.diamond_ore, ID.deepslate_diamond_ore, 4, tri(V - 144, V + 16), .5);
      if (R() < .4) blob(ID.diamond_ore, ID.deepslate_diamond_ore, 10, tri(V - 144, V + 16), .7);
      for (let i = 0; i < 3; i++) blob(ID.emerald_ore, ID.deepslate_emerald_ore, 2, tri(V - 16, V + 250), 0);
      if (R() < 1 / 24) {
        const x = R() * 16 | 0, z = R() * 16 | 0, y = 20 + (R() * 60 | 0), r = 3 + R() * 2;
        for (let dy = -6; dy <= 6; dy++) for (let dz = -6; dz <= 6; dz++) for (let dx = -6; dx <= 6; dx++) {
          const X = x + dx, Y = y + dy, Z = z + dz;
          if (X < 0 || X > 15 || Z < 0 || Z > 15 || Y < 6) continue;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz), li = L(X, Y, Z);
          if (!b[li] || b[li] === ID.lava || b[li] === ID.water) continue;
          if (d < r - 1.5) b[li] = 0;
          else if (d < r - .5) b[li] = R() < .08 ? ID.budding_amethyst : ID.amethyst_block;
          else if (d < r + .5) b[li] = ID.calcite;
          else if (d < r + 1.5) b[li] = ID.smooth_basalt;
        }
      }
    }
    function decorate(b, x0, z0, CH, CB, CR, at, R, bio, hm) {
      const get = (x, y, z) => x < 0 || x > 15 || z < 0 || z > 15 || y < 0 || y >= H ? -1 : b[L(x, y, z)];
      const isSoft = id => id === 0 || id === ID.short_grass || id === ID.fern || id === ID.snow || id === ID.pink_petals || id === ID.leaf_litter || id === ID.dead_bush || id === ID.red_shrub || id === ID.wildflowers;
      const setL = (x, y, z, id) => { if (x < 0 || x > 15 || z < 0 || z > 15 || y < 1 || y >= H) return; const li = L(x, y, z), c = b[li]; if (c === 0 || isSoft(c) || c === ID.vine) b[li] = id; };
      const setW = (x, y, z, id) => { if (x < 0 || x > 15 || z < 0 || z > 15 || y < 1 || y >= H) return; const li = L(x, y, z), c = b[li]; if (c === 0 || isSoft(c) || c === ID.vine || isLeaf(c) || c === ID.water) b[li] = id; };
      const leafSet = new Set([ID.oak_leaves, ID.birch_leaves, ID.spruce_leaves, ID.jungle_leaves, ID.acacia_leaves, ID.dark_oak_leaves, ID.mangrove_leaves, ID.cherry_leaves, ID.pale_oak_leaves, ID.red_poplar_leaves, ID.orange_poplar_leaves, ID.yellow_poplar_leaves, ID.azalea_leaves]);
      const isLeaf = id => leafSet.has(id);
      const ground = id => id === ID.grass_block || id === ID.dirt || id === ID.podzol || id === ID.coarse_dirt || id === ID.mud || id === ID.pale_moss_block || id === ID.mycelium || id === ID.moss_block;
      const blob = (cx, cy, cz, rx, ry, rz, id, rr, cut) => {
        for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) for (let dz = -Math.ceil(rz); dz <= Math.ceil(rz); dz++) for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
          const d = dx * dx / (rx * rx) + dy * dy / (ry * ry) + dz * dz / (rz * rz);
          if (d > 1 || (cut && d > .7 && rr(dx + cx, dy + cy, dz + cz) < cut)) continue;
          setL(cx + dx, cy + dy, cz + dz, id);
        }
      };
      const vines = (x, y, z, rr) => {
        for (const [dx, dz, f] of [[1, 0, 'w'], [-1, 0, 'e'], [0, 1, 'n'], [0, -1, 's']]) {
          if (rr(x, y + dx * 3 + dz * 5, z) > .25) continue;
          const vx = x + dx, vz = z + dz;
          let len = 1 + (rr(vx, y, vz) * 5 | 0);
          for (let k = 0; k < len; k++) { const c = get(vx, y - k, vz); if (c !== 0) break; setL(vx, y - k, vz, ID['vine_' + f]); }
        }
      };
      function tree(kind, tx, ty, tz, rr) {
        const lx = tx - x0, lz = tz - z0, H0 = ty;
        const trunk = (h, log, dx = 0, dz = 0) => { for (let y = 0; y < h; y++) setW(lx + dx, H0 + y, lz + dz, log); };
        const blobOak = (top, leaf, r1, r2) => {
          for (let y = top - 3; y <= top; y++) {
            const r = y >= top - 1 ? r2 : r1, tl = y === top;
            for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
              if (Math.abs(dx) === r && Math.abs(dz) === r && (tl || rr(tx + dx, y, tz + dz) < .5)) continue;
              setL(lx + dx, y, lz + dz, leaf);
            }
          }
        };
        if (kind === 'oak' || kind === 'birch' || kind === 'swamp_oak' || kind === 'jungle') {
          const h = (kind === 'birch' ? 5 : 4) + (rr(tx, 1, tz) * 3 | 0) + (kind === 'jungle' ? 3 + (rr(tx, 2, tz) * 4 | 0) : 0);
          const log = kind === 'birch' ? ID.birch_log : kind === 'jungle' ? ID.jungle_log : ID.oak_log, leaf = kind === 'birch' ? ID.birch_leaves : kind === 'jungle' ? ID.jungle_leaves : ID.oak_leaves;
          blobOak(H0 + h, leaf, kind === 'swamp_oak' ? 3 : 2, 1);
          trunk(h, log);
          if (kind === 'swamp_oak' || kind === 'jungle') for (let y = H0 + h - 3; y <= H0 + h; y++) for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (get(lx + dx, y, lz + dz) === leaf && rr(tx + dx, y, tz + dz) < .3) vines(lx + dx, y, lz + dz, rr);
          if (kind === 'jungle' && rr(tx, 9, tz) < .5) for (let k = 0; k < 2; k++) { const y = H0 + 2 + (rr(tx, 10 + k, tz) * (h - 4) | 0); const d = [[1, 0, 'west'], [-1, 0, 'east'], [0, 1, 'north'], [0, -1, 'south']][rr(tx, 11 + k, tz) * 4 | 0]; setL(lx + d[0], y, lz + d[1], ID['cocoa_' + d[2]] || 0); }
          return;
        }
        if (kind === 'fancy_oak') {
          const h = 7 + (rr(tx, 1, tz) * 5 | 0);
          for (let k = 0; k < 4; k++) {
            const a = rr(tx, 20 + k, tz) * 6.28, d = 2 + rr(tx, 30 + k, tz) * 2, y = H0 + h - 3 + (k % 3) - 1;
            const bx = Math.round(Math.cos(a) * d), bz = Math.round(Math.sin(a) * d);
            blob(lx + bx, y + 1, lz + bz, 2.6, 1.8, 2.6, ID.oak_leaves, rr, .4);
            for (let s = 1; s <= Math.max(Math.abs(bx), Math.abs(bz)); s++) { const t = s / Math.max(Math.abs(bx), Math.abs(bz)); setW(lx + Math.round(bx * t), y - 1 + Math.round(t), lz + Math.round(bz * t), Math.abs(bx) > Math.abs(bz) ? ID.oak_log_x : ID.oak_log_z); }
          }
          blob(lx, H0 + h, lz, 2.4, 2, 2.4, ID.oak_leaves, rr, .4);
          trunk(h, ID.oak_log);
          return;
        }
        if (kind === 'spruce' || kind === 'pine' || kind === 'mega_spruce') {
          const mega = kind === 'mega_spruce', h = (mega ? 18 : kind === 'pine' ? 8 : 6) + (rr(tx, 1, tz) * (mega ? 10 : 4) | 0);
          const base = kind === 'pine' ? h - 4 : mega ? h - 9 : 1 + (rr(tx, 2, tz) * 2 | 0);
          let r = 0, rm = mega ? 4 : kind === 'pine' ? 1 : 2 + (rr(tx, 3, tz) < .5 ? 1 : 0);
          for (let y = H0 + h; y >= H0 + base; y--) {
            const t = H0 + h - y;
            r = kind === 'pine' ? (t === 0 ? 0 : t < 3 ? 1 : (t & 1) ? 2 : 1) : t === 0 ? 0 : Math.min(rm, ((t - 1) >> (mega ? 1 : 0)) % (rm + 1) + (t > 4 ? 1 : 0));
            if (t === 1) r = 1;
            for (let dz = -r - (mega ? 1 : 0); dz <= r; dz++) for (let dx = -r - (mega ? 1 : 0); dx <= r; dx++) {
              if (r > 0 && Math.abs(dx) === r && Math.abs(dz) === r) continue;
              setL(lx + dx, y, lz + dz, ID.spruce_leaves);
            }
          }
          setL(lx, H0 + h + 1, lz, ID.spruce_leaves);
          trunk(h, ID.spruce_log);
          if (mega) { trunk(h - 1, ID.spruce_log, -1, 0); trunk(h - 1, ID.spruce_log, 0, -1); trunk(h - 1, ID.spruce_log, -1, -1); for (let dz = -3; dz <= 2; dz++) for (let dx = -3; dx <= 2; dx++) if (rr(tx + dx, 7, tz + dz) < .5) { const y = H0 - 1; if (get(lx + dx, y, lz + dz) === ID.grass_block) b[L(lx + dx, y, lz + dz)] = ID.podzol; } }
          return;
        }
        if (kind === 'acacia') {
          const h = 5 + (rr(tx, 1, tz) * 3 | 0), d = rr(tx, 2, tz) * 4 | 0, dx = [1, -1, 0, 0][d], dz = [0, 0, 1, -1][d];
          let x = lx, z = lz;
          const bend = h - 1 - (rr(tx, 3, tz) * 3 | 0);
          for (let y = 0; y < h; y++) { if (y >= bend && y < h - 1) { x += dx; z += dz; } setW(x, H0 + y, z, ID.acacia_log); }
          const ty2 = H0 + h - 1;
          for (let dz2 = -3; dz2 <= 3; dz2++) for (let dx2 = -3; dx2 <= 3; dx2++) if (Math.abs(dx2) + Math.abs(dz2) <= 4 && !(Math.abs(dx2) === 3 && Math.abs(dz2) === 3)) setL(x + dx2, ty2 + 1, z + dz2, ID.acacia_leaves);
          for (let dz2 = -1; dz2 <= 1; dz2++) for (let dx2 = -1; dx2 <= 1; dx2++) setL(x + dx2, ty2 + 2, z + dz2, ID.acacia_leaves);
          if (rr(tx, 4, tz) < .6) {
            let x2 = lx, z2 = lz; const ex = -dx || (rr(tx, 5, tz) < .5 ? 1 : -1), ez = -dz;
            const b0 = bend - 1;
            for (let y = b0; y < b0 + 3; y++) { x2 += ex; z2 += ez; setW(x2, H0 + y, z2, ID.acacia_log); }
            const yy = H0 + b0 + 2;
            for (let dz2 = -2; dz2 <= 2; dz2++) for (let dx2 = -2; dx2 <= 2; dx2++) if (Math.abs(dx2) + Math.abs(dz2) <= 3) setL(x2 + dx2, yy + 1, z2 + dz2, ID.acacia_leaves);
            for (let dz2 = -1; dz2 <= 1; dz2++) for (let dx2 = -1; dx2 <= 1; dx2++) if (Math.abs(dx2) + Math.abs(dz2) <= 1) setL(x2 + dx2, yy + 2, z2 + dz2, ID.acacia_leaves);
          }
          return;
        }
        if (kind === 'dark_oak' || kind === 'pale_oak') {
          const h = 6 + (rr(tx, 1, tz) * 3 | 0), log = kind === 'pale_oak' ? ID.pale_oak_log : ID.dark_oak_log, leaf = kind === 'pale_oak' ? ID.pale_oak_leaves : ID.dark_oak_leaves;
          const tp = H0 + h;
          for (let y = tp - 2; y <= tp + 1; y++) {
            const r = y === tp + 1 ? 2 : y === tp - 2 ? 3 : 4;
            for (let dz = -r; dz <= r + 1; dz++) for (let dx = -r; dx <= r + 1; dx++) {
              const ex = dx > 0 ? dx - 1 : dx, ez = dz > 0 ? dz - 1 : dz;
              if (ex * ex + ez * ez > r * r + 1 || (ex * ex + ez * ez > r * r - 2 && rr(tx + dx, y, tz + dz) < .35)) continue;
              setL(lx + dx, y, lz + dz, leaf);
            }
          }
          for (let k = 0; k < 4; k++) trunk(h, log, k & 1, k >> 1);
          if (kind === 'pale_oak') for (let dz = -4; dz <= 5; dz++) for (let dx = -4; dx <= 5; dx++) if (get(lx + dx, tp - 2, lz + dz) === leaf && get(lx + dx, tp - 3, lz + dz) === 0 && rr(tx + dx, 3, tz + dz) < .25) { const n = 1 + (rr(tx + dx, 4, tz + dz) * 3 | 0); for (let k = 1; k <= n; k++) setL(lx + dx, tp - 2 - k, lz + dz, k === n ? ID.pale_hanging_moss_tip : ID.pale_hanging_moss); }
          return;
        }
        if (kind === 'jungle_big') {
          const h = 14 + (rr(tx, 1, tz) * 10 | 0);
          blob(lx, H0 + h, lz, 4.2, 2.4, 4.2, ID.jungle_leaves, rr, .3);
          for (let k = 0; k < 3; k++) { const y = H0 + h - 5 - k * 3, a = rr(tx, 40 + k, tz) * 6.28, bx = Math.round(Math.cos(a) * 3), bz = Math.round(Math.sin(a) * 3); blob(lx + bx, y + 1, lz + bz, 2.5, 1.4, 2.5, ID.jungle_leaves, rr, .3); setW(lx + Math.round(bx / 2), y, lz + Math.round(bz / 2), ID.jungle_log); }
          for (let k = 0; k < 4; k++) trunk(h, ID.jungle_log, k & 1, k >> 1);
          for (let y = H0; y < H0 + h - 2; y++) for (const [dx, dz, f] of [[2, 0, 'w'], [-1, 0, 'e'], [0, 2, 'n'], [0, -1, 's'], [2, 1, 'w'], [1, 2, 'n'], [-1, 1, 'e'], [1, -1, 's']]) if (rr(tx + dx, y, tz + dz) < .35) setL(lx + dx, y, lz + dz, ID['vine_' + f]);
          return;
        }
        if (kind === 'jungle_bush') {
          setW(lx, H0, lz, ID.jungle_log);
          blob(lx, H0 + 1, lz, 2.3, 1.3, 2.3, ID.oak_leaves, rr, .3);
          return;
        }
        if (kind === 'cherry') {
          const h = 5 + (rr(tx, 1, tz) * 3 | 0), n = rr(tx, 2, tz) < .5 ? 2 : 1;
          trunk(h - 1, ID.cherry_log);
          for (let k = 0; k < n; k++) {
            const a = rr(tx, 10 + k, tz) * 6.28 + k * 3.1, dx = Math.round(Math.cos(a) * 2.6), dz = Math.round(Math.sin(a) * 2.6);
            const sx = Math.sign(dx), sz = Math.sign(dz);
            setW(lx + sx, H0 + h - 2, lz + sz, Math.abs(dx) >= Math.abs(dz) ? ID.cherry_log_x : ID.cherry_log_z);
            setW(lx + dx, H0 + h - 1, lz + dz, ID.cherry_log);
            setW(lx + dx, H0 + h, lz + dz, ID.cherry_log);
            blob(lx + dx, H0 + h + 2, lz + dz, 4, 2.2, 4, ID.cherry_leaves, rr, .35);
          }
          if (n === 1) { setW(lx, H0 + h - 1, lz, ID.cherry_log); blob(lx, H0 + h + 1, lz, 3.6, 2.2, 3.6, ID.cherry_leaves, rr, .35); }
          return;
        }
        if (kind === 'mangrove') {
          const h = 5 + (rr(tx, 1, tz) * 4 | 0), up = 2;
          for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let y = -2; y < up; y++) setW(lx + dx * (y < 0 ? 2 : 1), H0 + y, lz + dz * (y < 0 ? 2 : 1), ID.mangrove_roots);
          for (let y = up; y < up + h; y++) setW(lx, H0 + y, lz, ID.mangrove_log);
          blob(lx, H0 + up + h, lz, 3.2, 2.4, 3.2, ID.mangrove_leaves, rr, .35);
          return;
        }
        if (kind === 'poplar') {
          const v = rr(tx, 5, tz), leaf = v < .34 ? ID.red_poplar_leaves : v < .67 ? ID.orange_poplar_leaves : ID.yellow_poplar_leaves;
          if (rr(tx, 6, tz) < .12) {
            setW(lx, H0, lz, ID.poplar_log);
            const len = 4 + (rr(tx, 7, tz) * 4 | 0), ax = rr(tx, 8, tz) < .5;
            for (let k = 2; k < 2 + len; k++) { const X = lx + (ax ? k : 0), Z = lz + (ax ? 0 : k); if (get(X, H0 - 1, Z) > 0 && get(X, H0, Z) === 0) b[L(X, H0, Z)] = ax ? ID.poplar_log_x : ID.poplar_log_z; }
            return;
          }
          const h = 7 + (rr(tx, 1, tz) * 4 | 0);
          blob(lx, H0 + h - 1, lz, 3, 4.2, 3, leaf, rr, .3);
          blob(lx, H0 + h + 2, lz, 1.8, 1.6, 1.8, leaf, rr, .2);
          trunk(h, ID.poplar_log);
          for (let k = 0; k < 2; k++) if (rr(tx, 30 + k, tz) < .5) { const d = [[1, 0, 'east'], [-1, 0, 'west'], [0, 1, 'south'], [0, -1, 'north']][rr(tx, 31 + k, tz) * 4 | 0]; setL(lx + d[0], H0 + 1 + k * 2, lz + d[1], ID['shelf_mushroom_' + d[2]] || 0); }
          return;
        }
        if (kind === 'huge_red_mushroom' || kind === 'huge_brown_mushroom') {
          const h = 4 + (rr(tx, 1, tz) * 3 | 0), red = kind === 'huge_red_mushroom', cap = red ? ID.red_mushroom_block : ID.brown_mushroom_block;
          trunk(h, ID.mushroom_stem);
          if (red) { for (let y = H0 + h - 3; y <= H0 + h; y++) { const r = y === H0 + h ? 1 : 2; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { if (y < H0 + h && Math.abs(dx) < r && Math.abs(dz) < r) continue; if (Math.abs(dx) === r && Math.abs(dz) === r && y < H0 + h) continue; setL(lx + dx, y, lz + dz, cap); } } }
          else for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (!(Math.abs(dx) === 3 && Math.abs(dz) === 3)) setL(lx + dx, H0 + h, lz + dz, cap);
        }
      }
      const GS = 3;
      const gx0 = Math.floor((x0 - 6) / GS), gz0 = Math.floor((z0 - 6) / GS), gx1 = Math.floor((x0 + 21) / GS), gz1 = Math.floor((z0 + 21) / GS);
      for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
        const tx = gx * GS + (hsh(gx, 91, gz) * GS | 0), tz = gz * GS + (hsh(gx, 92, gz) * GS | 0);
        const lx = tx - x0, lz = tz - z0;
        if (lx < -6 || lx > 21 || lz < -6 || lz > 21) continue;
        const i = (lz + 6) * 28 + lx + 6, h = CH[i], bb = BIO[CB[i]];
        if (!bb.td || CR[i] || h < SEA || hsh(gx, 93, gz) > bb.td * (bb.n === 'Mangrove Swamp' ? 1 : 1)) continue;
        if (bb.n !== 'Mangrove Swamp' && (bb.top === 'sand' || bb.top === 'red_sand' || bb.top === 'stone')) continue;
        if (lx >= 0 && lx < 16 && lz >= 0 && lz < 16) { const g = b[L(lx, h, lz)]; if (!ground(g) || b[L(lx, h + 1, lz)] !== 0 && !isSoft(b[L(lx, h + 1, lz)])) continue; }
        let tot = 0; for (const t of bb.tr) tot += t[1];
        let pick = hsh(gx, 94, gz) * tot, kind = bb.tr[0][0];
        for (const t of bb.tr) { if ((pick -= t[1]) <= 0) { kind = t[0]; break; } }
        const rr = (a, c, d) => hsh(a * 7 + gx, c * 13 + 5, d * 3 + gz);
        if (lx >= 0 && lx < 16 && lz >= 0 && lz < 16 && kind !== 'mangrove') { const g = b[L(lx, h, lz)]; if (g === ID.grass_block || g === ID.podzol || g === ID.pale_moss_block) b[L(lx, h, lz)] = ID.dirt; }
        tree(kind, tx, h + 1, tz, rr);
      }
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
        const i = (z + 6) * 28 + x + 6, h = CH[i], bb = BIO[CB[i]], wx = x0 + x, wz = z0 + z;
        const t = b[L(x, h, z)], a = b[L(x, h + 1, z)];
        const r = hsh(wx, 77, wz), r2 = hsh(wx, 78, wz);
        if (h >= SEA && a === 0) {
          if (t === ID.grass_block || t === ID.podzol || t === ID.pale_moss_block) {
            const fd = bb.fd || .012;
            if (bb.fl.length && r < fd) {
              const fn = bb.fl[r2 * bb.fl.length | 0];
              if (fn === 'sunflower' || fn === 'lilac' || fn === 'rose_bush' || fn === 'peony' || fn === 'large_fern') { if (b[L(x, h + 2, z)] === 0 && ID[fn + '_lower']) { b[L(x, h + 1, z)] = ID[fn + '_lower']; b[L(x, h + 2, z)] = ID[fn + '_upper']; } }
              else if (fn === 'melon' || fn === 'sweet_berry_bush' || fn === 'bamboo') { if (fn === 'bamboo') { const n = 4 + (r2 * 8 | 0); for (let k = 1; k <= n && b[L(x, h + k, z)] === 0; k++) b[L(x, h + k, z)] = k > n - 2 ? ID.bamboo_leafy : ID.bamboo; } else if (ID[fn]) b[L(x, h + 1, z)] = ID[fn]; }
              else if (ID[fn]) b[L(x, h + 1, z)] = ID[fn];
            } else if (r < fd + bb.gd) {
              if (bb.n === 'Savanna' || bb.n === 'Savanna Plateau') b[L(x, h + 1, z)] = r2 < .3 && b[L(x, h + 2, z)] === 0 ? (b[L(x, h + 2, z)] = ID.tall_grass_upper, ID.tall_grass_lower) : r2 < .5 ? ID.short_dry_grass : ID.short_grass;
              else if (r2 < .1 && b[L(x, h + 2, z)] === 0) { b[L(x, h + 1, z)] = ID.tall_grass_lower; b[L(x, h + 2, z)] = ID.tall_grass_upper; }
              else b[L(x, h + 1, z)] = (bb.n.includes('Taiga') || bb.n.includes('Jungle')) && r2 < .35 ? ID.fern : ID.short_grass;
            } else if (r > .995 && bb.n !== 'Desert' && (bb.n === 'Plains' || bb.n === 'Forest' || bb.n === 'Taiga') && hsh(wx, 79, wz) < .3) b[L(x, h + 1, z)] = ID.pumpkin;
            if (bb.n.includes('Taiga') && t === ID.grass_block && b[L(x, h + 1, z)] === 0 && r > .985) b[L(x, h + 1, z)] = ID.mossy_cobblestone;
          } else if ((t === ID.sand || t === ID.red_sand) && bb.dry) {
            if (r < .006 && bb.n === 'Desert') { const n = 1 + (r2 * 3 | 0); let ok = true; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = get(x + dx, h + 1, z + dz); if (c > 0) ok = false; } if (ok) { for (let k = 1; k <= n; k++) b[L(x, h + k, z)] = ID.cactus; if (r2 < .2) b[L(x, h + n + 1, z)] = ID.cactus_flower; } }
            else if (r < .02) b[L(x, h + 1, z)] = ID.dead_bush;
            else if (r < .026 && bb.n === 'Desert') b[L(x, h + 1, z)] = ID.short_dry_grass;
          }
          if ((t === ID.grass_block || t === ID.sand || t === ID.dirt) && h === SEA && b[L(x, h + 1, z)] === 0 && r2 > .7) {
            let wet = false; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = get(x + dx, h, z + dz); if (c === ID.water) wet = true; }
            if (wet && hsh(wx, 80, wz) < .35) { const n = 1 + (hsh(wx, 81, wz) * 3 | 0); for (let k = 1; k <= n; k++) b[L(x, h + k, z)] = ID.sugar_cane; }
          }
        }
        if (h < SEA && bb.water) {
          const dep = SEA - h;
          if (r < .25 && dep > 2) {
            if (bb.lily) { }
            else if (r < .08 && dep > 5 && !bb.snow && !bb.warm) { const n = Math.min(dep - 2, 3 + (r2 * (dep - 3) | 0)); for (let k = 1; k <= n; k++) b[L(x, h + k, z)] = k === n ? ID.kelp : ID.kelp_plant; }
            else if (bb.warm && r < .12) { const cs = ['tube', 'brain', 'bubble', 'fire', 'horn']; const c = cs[r2 * 5 | 0]; if (r < .05) { b[L(x, h + 1, z)] = ID[c + '_coral_block']; if (b[L(x, h + 2, z)] === ID.water) b[L(x, h + 2, z)] = ID[c + '_coral']; } else b[L(x, h + 1, z)] = ID[(r2 < .5 ? c + '_coral' : c + '_coral_fan')]; }
            else if (b[L(x, h + 1, z)] === ID.water) b[L(x, h + 1, z)] = ID.seagrass;
          }
        }
        if (bb.lily && h === SEA - 1 && r > .93 && b[L(x, SEA + 1, z)] === 0) b[L(x, SEA + 1, z)] = ID.lily_pad;
        if (bb.lily && h >= SEA - 2 && h < SEA && r < .03) b[L(x, h + 1, z)] = ID.seagrass;
        if (bb.n === 'Mangrove Swamp' && h >= SEA && a === 0 && r < .05) b[L(x, h + 1, z)] = ID.short_grass;
      }
      for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
        const bb = BIO[bio[x | z << 4]];
        let y = H - 2;
        while (y > 0 && b[L(x, y, z)] === 0) y--;
        const id = b[L(x, y, z)];
        if (bb.snow) {
          if (id === ID.water) { b[L(x, y, z)] = ID.ice; continue; }
          if (id === ID.grass_block) b[L(x, y, z)] = ID.grass_block_snowy;
          else if (id === ID.podzol) b[L(x, y, z)] = ID.podzol_snowy;
          if (id && id !== ID.ice && id !== ID.lava && id !== ID.packed_ice && id !== ID.cactus && !isSoftNoSnow(id) && y + 1 < H) b[L(x, y + 1, z)] = ID.snow;
          else if (isSoftNoSnow(id)) { b[L(x, y, z)] = ID.snow; const d = b[L(x, y - 1, z)]; if (d === ID.grass_block) b[L(x, y - 1, z)] = ID.grass_block_snowy; }
        } else if (y > SEA + 75 + (hsh(x0 + x, 82, z0 + z) * 8 | 0) && id && id !== ID.water && !isSoftNoSnow(id)) {
          if (id === ID.grass_block) b[L(x, y, z)] = ID.grass_block_snowy;
          b[L(x, y + 1, z)] = ID.snow;
        }
      }
      function isSoftNoSnow(id) { return id === ID.short_grass || id === ID.fern || id === ID.dead_bush || id === ID.short_dry_grass; }
    }
    function spawn() {
      const o = {};
      for (let r = 0; r < 1200; r += 8) for (let a = 0; a < 16; a++) {
        const x = Math.round(Math.cos(a * .3927 + r) * r), z = Math.round(Math.sin(a * .3927 + r) * r);
        column(x, z, o);
        const bb = BIO[o.b];
        if (o.h >= SEA + 1 && o.h < SEA + 40 && !bb.water && bb.top !== 'stone' && bb.top !== 'snow_block' && bb.top !== 'packed_ice' && bb.td < .4) return [x + .5, o.h + 1, z + .5];
      }
      column(0, 0, o);
      return [.5, Math.max(o.h, SEA) + 2, .5];
    }
    return { BIO, gen, spawn, column, H, SEA };
  }
  const TXD = new Map();
  const PAINT = Object.create(null), PPAT = [];
  const hstr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const hx = c => [c >> 16 & 255, c >> 8 & 255, c & 255];
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const shd = (c, f) => [c[0] * f, c[1] * f, c[2] * f, c[3]];
  const lum = c => (c[0] * .3 + c[1] * .59 + c[2] * .11) / 255;
  function Img(seed) {
    const d = new Uint8ClampedArray(1024);
    const R = rng(seed || 1);
    const I = {
      d, R,
      set(x, y, c, a) { if (!c || x < 0 || y < 0 || x > 15 || y > 15) return; const o = (y * 16 + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = a !== undefined ? a : c[3] !== undefined ? c[3] : 255; },
      get(x, y) { const o = ((y & 15) * 16 + (x & 15)) * 4; return [d[o], d[o + 1], d[o + 2], d[o + 3]]; },
      al(x, y) { return d[((y & 15) * 16 + (x & 15)) * 4 + 3]; },
      fill(f) { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const c = f(x, y); if (c) I.set(x, y, c); } return I; },
      mul(f) { for (let i = 0; i < 1024; i += 4) { d[i] *= f; d[i + 1] *= f; d[i + 2] *= f; } return I; },
      tint(c) { for (let i = 0; i < 1024; i += 4) { d[i] = d[i] * c[0] / 255; d[i + 1] = d[i + 1] * c[1] / 255; d[i + 2] = d[i + 2] * c[2] / 255; } return I; },
      copy(o) { d.set(o.d || o); return I; },
      rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) I.set(x, y, typeof c === 'function' ? c(x, y) : c); return I; },
      tmpl(rows, pal, ox, oy) { ox = ox || 0; oy = oy || 0; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.' || ch === ' ') continue; const c = pal[ch]; if (c) I.set(ox + i, oy + j, typeof c === 'function' ? c(ox + i, oy + j) : c); } }); return I; },
      mark() { for (let i = 0; i < 1024; i += 4) if (d[i + 3] > 128) d[i + 3] = 250; return I; },
      outline(c) { const a = new Uint8Array(256); for (let i = 0; i < 256; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (a[y * 16 + x]) continue; if ((x > 0 && a[y * 16 + x - 1]) || (x < 15 && a[y * 16 + x + 1]) || (y > 0 && a[y * 16 + x - 16]) || (y < 15 && a[y * 16 + x + 16])) I.set(x, y, c); } return I; },
      shadeEdges(k) { const a = new Uint8Array(256); for (let i = 0; i < 256; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (!a[y * 16 + x]) continue; const e = (x === 15 || !a[y * 16 + x + 1]) || (y === 15 || !a[y * 16 + x + 16]); if (e) { const o = (y * 16 + x) * 4; d[o] *= k; d[o + 1] *= k; d[o + 2] *= k; } } return I; },
      rot(q) { const s = new Uint8ClampedArray(d); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { let sx = x, sy = y; for (let k = 0; k < q; k++) { const t = sx; sx = sy; sy = 15 - t; } d.set(s.subarray((sy * 16 + sx) * 4, (sy * 16 + sx) * 4 + 4), (y * 16 + x) * 4); } return I; },
      flipH() { const s = new Uint8ClampedArray(d); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) d.set(s.subarray((y * 16 + 15 - x) * 4, (y * 16 + 15 - x) * 4 + 4), (y * 16 + x) * 4); return I; }
    };
    return I;
  }
  const nz = (x, y, s) => hash3(x, y, s);
  function sn(x, y, p, s) {
    const fx = x * p / 16, fy = y * p / 16, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    const h = (a, b) => hash3(((a % p) + p) % p, ((b % p) + p) % p, s), su = u * u * (3 - 2 * u), sv2 = v * v * (3 - 2 * v);
    return lerp(lerp(h(ix, iy), h(ix + 1, iy), su), lerp(h(ix, iy + 1), h(ix + 1, iy + 1), su), sv2);
  }
  const pal = (P, v) => P[clamp(Math.floor(v * P.length), 0, P.length - 1)];
  const PH = a => a.map(hx);
  const get = n => { if (!TXD.has(n)) paintTex(n); return TXD.get(n); };
  const from = (n, seed) => Img(seed).copy(get(n));
  function paintTex(n) {
    const I = Img(hstr(n));
    let f = PAINT[n];
    if (f) f(I, n);
    else {
      let done = false;
      for (const [re, fn] of PPAT) { const m = re.exec(n); if (m) { fn(I, m, n); done = true; break; } }
      if (!done) { I.fill((x, y) => ((x >> 3) + (y >> 3)) & 1 ? [248, 0, 248] : [0, 0, 0]); MISSING.push(n); }
    }
    TXD.set(n, I.d);
  }
  const MISSING = [];
  const def = (n, f) => { PAINT[n] = f; };
  const pat = (re, f) => PPAT.push([re, f]);
  function field(I, P, sc, o) {
    o = o || {};
    const s = I.R() * 1e6 | 0;
    return I.fill((x, y) => {
      let v = sn(x, y, o.p || 4, s) * (o.sw ?? .55) + nz(x, y, s + 1) * (o.nw ?? .45);
      if (o.f) v = o.f(x, y, v);
      return pal(P, clamp(v, 0, .999));
    });
  }
  const STONE = PH([0x686868, 0x737373, 0x7b7b7b, 0x828282, 0x8a8a8a, 0x939393]);
  def('stone', I => field(I, STONE, 0, { p: 4, sw: .5, nw: .55 }));
  def('smooth_stone', I => { I.fill((x, y) => pal(PH([0x9c9c9c, 0xa3a3a3, 0xa9a9a9]), nz(x, y, 3) * .9)); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0xbababa)); I.set(0, i, hx(0xb5b5b5)); I.set(i, 15, hx(0x777777)); I.set(15, i, hx(0x7f7f7f)); } });
  def('smooth_stone_slab_side', I => { I.copy(get('smooth_stone')); for (let x = 0; x < 16; x++) { I.set(x, 7, hx(0x777777)); I.set(x, 8, hx(0xbababa)); } });
  const ANDES = PH([0x6e6e6e, 0x787878, 0x828282, 0x8b8b8b, 0x959595, 0xa3a3a3]);
  def('andesite', I => field(I, ANDES, 0, { p: 6, sw: .35, nw: .65 }));
  const DIOR = PH([0x7e7e7e, 0x9b9b9b, 0xb2b2b2, 0xc4c4c4, 0xd4d4d4, 0xe5e5e5]);
  def('diorite', I => field(I, DIOR, 0, { p: 5, sw: .45, nw: .6 }));
  const GRAN = PH([0x7d4e3e, 0x8f5d4a, 0x9a6a57, 0xa37462, 0xb07f6e, 0xc19583]);
  def('granite', I => field(I, GRAN, 0, { p: 6, sw: .35, nw: .7 }));
  const polished = (P, edgeHi, edgeLo, sm) => I => {
    I.fill((x, y) => pal(P, clamp(sn(x, y, 2, 5) * .5 + nz(x, y, 9) * (sm || .35), 0, .99)));
    for (let i = 0; i < 16; i++) { I.set(i, 0, edgeHi); I.set(0, i, edgeHi); I.set(i, 15, edgeLo); I.set(15, i, edgeLo); }
    I.set(0, 15, mixc(edgeHi, edgeLo, .5)); I.set(15, 0, mixc(edgeHi, edgeLo, .5));
  };
  def('polished_andesite', polished(PH([0x7f8180, 0x868887, 0x8b8d8c]), hx(0x9c9e9d), hx(0x5e605f)));
  def('polished_diorite', polished(PH([0xbdbdbe, 0xc4c4c5, 0xcbcbcc]), hx(0xe2e2e3), hx(0x8e8e8f)));
  def('polished_granite', polished(PH([0x9a6a59, 0xa16f5e, 0xa67765]), hx(0xbb8a77), hx(0x6e4537)));
  const DEEP = PH([0x363639, 0x3d3d40, 0x454548, 0x4d4d50, 0x56565a, 0x606064]);
  def('deepslate', I => I.fill((x, y) => { const v = sn(x, y * .6, 3, 77) * .4 + nz(x >> 1, y, 78) * .25 + nz(x, y, 79) * .35; return pal(DEEP, clamp(v + (y % 4 === 0 ? -.12 : 0), 0, .99)); }));
  def('deepslate_top', I => I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return pal(DEEP, clamp(nz(x, y, 80) * .6 + (Math.floor(d) % 3 === 0 ? -.2 : .15), 0, .99)); }));
  function voronoiCobble(I, P, gap, sites) {
    const R = I.R, S = [];
    for (let i = 0; i < (sites || 10); i++) S.push([R() * 16, R() * 16, R()]);
    I.fill((x, y) => {
      let d1 = 99, d2 = 99, k = 0;
      for (let i = 0; i < S.length; i++) for (let ox = -16; ox <= 16; ox += 16) for (let oy = -16; oy <= 16; oy += 16) {
        const dd = Math.hypot(x + .5 - S[i][0] - ox, y + .5 - S[i][1] - oy);
        if (dd < d1) { d2 = d1; d1 = dd; k = i; } else if (dd < d2) d2 = dd;
      }
      if (d2 - d1 < 1.1) return gap;
      const edge = d2 - d1 < 2.1;
      return pal(P, clamp(S[k][2] * .55 + nz(x, y, 7) * .35 + (edge ? -.15 : .1), 0, .99));
    });
  }
  def('cobblestone', I => voronoiCobble(I, PH([0x646464, 0x737373, 0x7f7f7f, 0x8c8c8c, 0x9b9b9b, 0xababab]), hx(0x4a4a4a), 11));
  def('mossy_cobblestone', I => { I.copy(get('cobblestone')); const M = PH([0x4a6b2b, 0x5a7d35, 0x6b8f3c, 0x7a9c46]); I.fill((x, y) => sn(x, y, 3, 31) > .52 || nz(x, y, 32) > .9 ? pal(M, nz(x, y, 33)) : null); });
  def('cobbled_deepslate', I => voronoiCobble(I, PH([0x3a3a3d, 0x434346, 0x4d4d50, 0x57575a, 0x626265]), hx(0x262628), 12));
  def('polished_deepslate', polished(PH([0x48484b, 0x4d4d50, 0x525255]), hx(0x646467), hx(0x2f2f31), .3));
  function bricks(I, P, mortar, bw, bh, off, opts) {
    opts = opts || {};
    const R = I.R, cols = [];
    for (let i = 0; i < 32; i++) cols.push(R());
    I.fill((x, y) => {
      const row = Math.floor(y / bh), sx = (x + (row & 1 ? off : 0)) & 15, col = Math.floor(sx / bw);
      const ly = y % bh, lx = sx % bw;
      if (ly === bh - 1 || lx === bw - 1) return mortar;
      const k = cols[(row * 7 + col) & 31];
      let v = k * .45 + nz(x, y, 11) * .45 + .05;
      if (opts.bevel) { if (ly === 0 || lx === 0) v += .3; if (ly === bh - 2 || lx === bw - 2) v -= .25; }
      return pal(P, clamp(v, 0, .99));
    });
  }
  def('bricks', I => bricks(I, PH([0x7f3e30, 0x8f4636, 0x974c39, 0xa05442, 0xa95f4d]), hx(0x9c9188), 8, 4, 4));
  def('stone_bricks', I => bricks(I, PH([0x6e6e6e, 0x787878, 0x7f7f7f, 0x868686, 0x8e8e8e]), hx(0x585858), 16, 8, 8, { bevel: 1 }));
  def('mossy_stone_bricks', I => { I.copy(get('stone_bricks')); const M = PH([0x4d6a2e, 0x5b7b36, 0x6a8a3e]); I.fill((x, y) => (sn(x, y, 3, 41) > .55 && nz(x, y, 42) > .25) || (y % 8 === 7 && nz(x, y, 43) > .5) ? pal(M, nz(x, y, 44)) : null); });
  def('cracked_stone_bricks', I => { I.copy(get('stone_bricks')); crack(I, hx(0x4a4a4a), 3); });
  function crack(I, c, n) { const R = I.R; for (let k = 0; k < n; k++) { let x = R() * 16 | 0, y = R() * 16 | 0; for (let s = 0; s < 9; s++) { I.set(x, y, c); x += R() < .5 ? 1 : -1 + (R() < .5 ? 1 : 0); y += R() < .7 ? 1 : 0; x &= 15; y &= 15; } } }
  def('chiseled_stone_bricks', I => { I.copy(get('stone_bricks')); const D = hx(0x5c5c5c), L = hx(0x9a9a9a); for (let i = 3; i <= 12; i++) { I.set(i, 3, D); I.set(i, 12, L); I.set(3, i, D); I.set(12, i, L); } for (let i = 5; i <= 10; i++) { I.set(i, 5, L); I.set(i, 10, D); I.set(5, i, L); I.set(10, i, D); } I.rect(7, 7, 8, 8, D); });
  def('deepslate_bricks', I => bricks(I, PH([0x3e3e41, 0x48484b, 0x505053, 0x5a5a5d]), hx(0x2a2a2c), 8, 4, 4, { bevel: 1 }));
  def('cracked_deepslate_bricks', I => { I.copy(get('deepslate_bricks')); crack(I, hx(0x1e1e20), 3); });
  def('deepslate_tiles', I => bricks(I, PH([0x3a3a3d, 0x434346, 0x4b4b4e, 0x535356]), hx(0x222224), 4, 4, 0, { bevel: 1 }));
  def('cracked_deepslate_tiles', I => { I.copy(get('deepslate_tiles')); crack(I, hx(0x1a1a1c), 3); });
  def('chiseled_deepslate', I => { I.copy(get('polished_deepslate')); const D = hx(0x2c2c2e), L = hx(0x626265); for (let i = 2; i <= 13; i++) { I.set(i, 2, L); I.set(2, i, L); I.set(i, 13, D); I.set(13, i, D); } I.rect(5, 5, 10, 10, hx(0x3a3a3d)); I.rect(6, 6, 9, 9, hx(0x505053)); I.rect(7, 7, 8, 8, D); });
  def('reinforced_deepslate_side', I => { I.copy(get('deepslate_tiles')); I.fill((x, y) => x < 2 || x > 13 || y < 2 || y > 13 ? pal(PH([0x6a6458, 0x7d7667, 0x5a5448]), nz(x, y, 5)) : null); });
  def('reinforced_deepslate_top', I => { I.copy(get('reinforced_deepslate_side')); I.rect(5, 5, 10, 10, hx(0x2a3a3a)); I.rect(6, 6, 9, 9, hx(0x1a8080)); });
  def('reinforced_deepslate_bottom', I => I.copy(get('reinforced_deepslate_side')));
  def('tuff', I => I.fill((x, y) => pal(PH([0x4d4e47, 0x585a52, 0x63655c, 0x6c6e65, 0x787a70]), clamp(sn(x, y, 5, 91) * .4 + nz(x, y, 92) * .6, 0, .99))));
  def('polished_tuff', polished(PH([0x5d625b, 0x636860, 0x686d65]), hx(0x7a7f76), hx(0x434840), .3));
  def('tuff_bricks', I => bricks(I, PH([0x535850, 0x5d625a, 0x666b62, 0x6e736a]), hx(0x3c4038), 8, 8, 4, { bevel: 1 }));
  def('chiseled_tuff', I => { I.copy(get('polished_tuff')); I.rect(3, 3, 12, 4, hx(0x4a4f47)); I.rect(3, 11, 12, 12, hx(0x4a4f47)); I.rect(4, 6, 11, 9, hx(0x777c73)); });
  def('chiseled_tuff_top', I => I.copy(get('polished_tuff')));
  def('chiseled_tuff_bricks', I => { I.copy(get('tuff_bricks')); I.rect(5, 5, 10, 10, hx(0x4a4f47)); I.rect(6, 6, 9, 9, hx(0x7e8379)); });
  def('chiseled_tuff_bricks_top', I => I.copy(get('polished_tuff')));
  def('calcite', I => field(I, PH([0xcfd0cb, 0xd8d9d4, 0xdfe0db, 0xe6e7e2, 0xeeefea]), 0, { p: 5, sw: .5, nw: .5 }));
  def('dripstone_block', I => I.fill((x, y) => pal(PH([0x6e5547, 0x7a5f4f, 0x866a59, 0x947663, 0xa38470]), clamp(sn(x * .5, y, 3, 61) * .5 + nz(x, y, 62) * .35 + (y % 5 === 0 ? -.2 : 0), 0, .99))));
  def('smooth_basalt', I => field(I, PH([0x3b3b40, 0x434349, 0x4a4a50, 0x525258]), 0, { p: 4, sw: .5, nw: .5 }));
  def('basalt_side', I => I.fill((x, y) => pal(PH([0x3f3f44, 0x48484e, 0x515157, 0x5c5c62, 0x67676d]), clamp(sn(x, y * .25, 6, 63) * .55 + nz(x, y >> 2, 64) * .45, 0, .99))));
  def('basalt_top', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5); return pal(PH([0x3b3b40, 0x47474d, 0x55555b, 0x606066]), clamp(nz(x, y, 65) * .5 + (d > 6.5 ? .1 : (Math.floor(d) & 1) * .3), 0, .99)); }));
  def('polished_basalt_side', I => I.fill((x, y) => pal(PH([0x4d4d53, 0x57575d, 0x606066, 0x6b6b71]), clamp((x % 4 === 0 ? .1 : .6) + nz(x, y, 66) * .3, 0, .99))));
  def('polished_basalt_top', polished(PH([0x58585e, 0x5e5e64]), hx(0x707076), hx(0x3c3c42)));
  const NRK = PH([0x5e2524, 0x6c2b2a, 0x7a3130, 0x8a3837, 0x9c4443, 0x6f1f1f]);
  def('netherrack', I => I.fill((x, y) => pal(NRK, clamp(sn(x, y, 6, 51) * .45 + nz(x, y, 52) * .55, 0, .99))));
  def('nether_bricks', I => bricks(I, PH([0x2b1418, 0x34181c, 0x3c1c21, 0x462227]), hx(0x170a0c), 8, 4, 4));
  def('red_nether_bricks', I => bricks(I, PH([0x4c070a, 0x58090c, 0x660b0f, 0x710e13]), hx(0x2d0306), 8, 4, 4));
  def('cracked_nether_bricks', I => { I.copy(get('nether_bricks')); crack(I, hx(0x0e0507), 3); });
  def('chiseled_nether_bricks', I => { I.copy(get('nether_bricks')); I.rect(4, 3, 11, 12, hx(0x2e161a)); I.rect(6, 5, 9, 10, hx(0x4a2429)); I.rect(7, 7, 8, 8, hx(0x170a0c)); });
  const BLK = PH([0x1e1a20, 0x241f26, 0x2a252c, 0x302a32, 0x3a343c]);
  def('blackstone', I => I.fill((x, y) => pal(BLK, clamp(sn(x, y, 4, 71) * .5 + nz(x, y, 72) * .5, 0, .99))));
  def('blackstone_top', I => I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return pal(BLK, clamp(nz(x, y, 73) * .5 + (Math.floor(d) % 3 === 0 ? 0 : .35), 0, .99)); }));
  def('polished_blackstone', polished(PH([0x332e36, 0x37323a, 0x3b363e]), hx(0x4a444d), hx(0x1f1b21), .3));
  def('polished_blackstone_bricks', I => bricks(I, PH([0x2d2830, 0x332e36, 0x39343c, 0x403a43]), hx(0x1b181d), 8, 4, 4, { bevel: 1 }));
  def('cracked_polished_blackstone_bricks', I => { I.copy(get('polished_blackstone_bricks')); crack(I, hx(0x100e11), 3); });
  def('chiseled_polished_blackstone', I => { I.copy(get('polished_blackstone')); I.rect(4, 3, 11, 12, hx(0x221e24)); I.rect(5, 4, 10, 6, hx(0x4a444d)); I.rect(6, 8, 9, 11, hx(0x4a444d)); });
  def('gilded_blackstone', I => { I.copy(get('blackstone')); I.fill((x, y) => sn(x, y, 4, 75) > .62 ? pal(PH([0xb5761c, 0xe4a52a, 0xf7d04a]), nz(x, y, 76)) : null); });
  def('end_stone', I => field(I, PH([0xcfd29a, 0xd9dca1, 0xdee2a9, 0xe7ebb3, 0xc4c78d]), 0, { p: 5, sw: .45, nw: .55 }));
  def('end_stone_bricks', I => bricks(I, PH([0xd5d89f, 0xdcdfa5, 0xe2e5ab, 0xe8ebb1]), hx(0xb4b67e), 8, 4, 4, { bevel: 1 }));
  def('purpur_block', I => bricks(I, PH([0x9e6f9e, 0xa776a7, 0xae7dae, 0xb685b6]), hx(0x7d527d), 8, 8, 0, { bevel: 1 }));
  def('purpur_pillar', I => I.fill((x, y) => pal(PH([0x9e6f9e, 0xab7aab, 0xb385b3]), clamp((x % 5 === 0 ? 0 : .6) + nz(x, y, 81) * .3, 0, .99))));
  def('purpur_pillar_top', polished(PH([0xab7aab, 0xb07fb0]), hx(0xc193c1), hx(0x7d527d)));
  const QZ = PH([0xe4ddd3, 0xe9e3d9, 0xede8df, 0xf2ede5]);
  def('quartz_block_side', I => I.fill((x, y) => pal(QZ, clamp(nz(x, y, 82) * .7 + sn(x, y, 2, 83) * .3, 0, .99))));
  def('quartz_block_top', I => I.copy(get('quartz_block_side')));
  def('quartz_block_bottom', I => I.copy(get('quartz_block_side')));
  def('quartz_bricks', I => bricks(I, QZ, hx(0xc9c1b3), 8, 8, 4, { bevel: 1 }));
  def('quartz_pillar', I => I.fill((x, y) => x < 2 || x > 13 ? hx(0xd4ccbe) : pal(QZ, nz(x, y, 84) * .9)));
  def('quartz_pillar_top', polished(QZ, hx(0xfbf8f2), hx(0xcdc4b5)));
  def('chiseled_quartz_block', I => { I.copy(get('quartz_block_side')); for (let y = 2; y < 14; y += 4) { I.rect(3, y, 12, y, hx(0xcdc4b5)); I.rect(3, y + 1, 12, y + 1, hx(0xfbf8f2)); } });
  def('chiseled_quartz_block_top', polished(QZ, hx(0xfbf8f2), hx(0xcdc4b5)));
  const SANDP = PH([0xcdbd88, 0xd6c792, 0xdbcfa0, 0xe2d6a8, 0xe9dfb5]);
  def('sand', I => I.fill((x, y) => pal(SANDP, clamp(nz(x, y, 21) * .75 + sn(x, y, 4, 22) * .25, 0, .99))));
  const RSANDP = PH([0xa14e1b, 0xae5820, 0xb85f24, 0xc06628, 0xcb7130]);
  def('red_sand', I => I.fill((x, y) => pal(RSANDP, clamp(nz(x, y, 23) * .75 + sn(x, y, 4, 24) * .25, 0, .99))));
  for (let k = 0; k < 4; k++) { def('suspicious_sand_' + k, I => { I.copy(get('sand')); I.rect(5, 6, 9, 9, hx(0xb8a876)); I.set(6, 7, hx(0x9e8f60)); }); def('suspicious_gravel_' + k, I => { I.copy(get('gravel')); I.rect(5, 6, 9, 9, hx(0x6b6563)); }); }
  const sandstone = (P, line) => ({
    side: I => I.fill((x, y) => { if (y < 3) return pal(P, .55 + nz(x, y, 25) * .4); if (y === 3 || y === 12) return line; if (y > 12) return pal(P, .1 + nz(x, y, 26) * .4); return pal(P, clamp(.35 + nz(x, y, 27) * .35 + (Math.sin(y * 1.3 + sn(x, y, 3, 28) * 3) * .12), 0, .99)); }),
    top: I => I.fill((x, y) => pal(P, clamp(.45 + nz(x, y, 29) * .45, 0, .99))),
    bottom: I => I.fill((x, y) => pal(P, clamp(.25 + nz(x, y, 30) * .5 + sn(x, y, 3, 31) * .2, 0, .99)))
  });
  { const S = sandstone(PH([0xbfae7c, 0xcdbc89, 0xd8c896, 0xdfd0a0, 0xe6d9ab]), hx(0xb6a573)); def('sandstone', S.side); def('sandstone_top', S.top); def('sandstone_bottom', S.bottom); }
  { const S = sandstone(PH([0x9c4c18, 0xa9551c, 0xb35d21, 0xbd6526, 0xc66d2c]), hx(0x8e4314)); def('red_sandstone', S.side); def('red_sandstone_top', S.top); def('red_sandstone_bottom', S.bottom); }
  def('cut_sandstone', I => { I.copy(get('sandstone_top')); for (let x = 0; x < 16; x++) { I.set(x, 0, hx(0xe9dcb0)); I.set(x, 15, hx(0xb6a573)); I.set(x, 7, hx(0xb6a573)); I.set(x, 8, hx(0xe9dcb0)); } });
  def('cut_red_sandstone', I => { I.copy(get('red_sandstone_top')); for (let x = 0; x < 16; x++) { I.set(x, 0, hx(0xcc7535)); I.set(x, 15, hx(0x8e4314)); I.set(x, 7, hx(0x8e4314)); I.set(x, 8, hx(0xcc7535)); } });
  const chiselSand = (base, d, l) => I => { I.copy(get(base)); for (let x = 0; x < 16; x++) { I.set(x, 2, d); I.set(x, 13, d); } I.rect(5, 5, 10, 10, d); I.rect(6, 6, 9, 9, l); I.rect(7, 4, 8, 11, d); };
  def('chiseled_sandstone', chiselSand('sandstone_top', hx(0xb09f6e), hx(0xe9dcb0)));
  def('chiseled_red_sandstone', chiselSand('red_sandstone_top', hx(0x863f12), hx(0xcc7535)));
  const GRAV = PH([0x5c5555, 0x6e6766, 0x7f7a79, 0x8d8786, 0x9e9998, 0xb0abaa]);
  def('gravel', I => { const R = I.R; I.fill((x, y) => pal(GRAV, clamp(nz(x >> 1, y >> 1, 35) * .65 + nz(x, y, 36) * .35, 0, .99))); for (let k = 0; k < 9; k++) { const x = R() * 15 | 0, y = R() * 15 | 0, c = pal(GRAV, R()); I.set(x, y, c); I.set(x + 1, y, c); I.set(x, y + 1, shd(c, .85)); I.set(x + 1, y + 1, shd(c, .78)); } });
  def('clay', I => I.fill((x, y) => pal(PH([0x9399a5, 0x9ca2ae, 0xa1a7b4, 0xa7adba]), clamp(nz(x, y, 37) * .6 + sn(x, y, 3, 38) * .4, 0, .99))));
  const DIRT = PH([0x5b3d27, 0x6d4a31, 0x79553a, 0x86603f, 0x966c4a, 0xab7b54]);
  def('dirt', I => I.fill((x, y) => { const v = nz(x, y, 41); return v < .06 ? hx(0x8a8378) : pal(DIRT, clamp(nz(x, y, 42) * .7 + sn(x, y, 4, 43) * .3, 0, .99)); }));
  def('coarse_dirt', I => { I.copy(get('dirt')); I.fill((x, y) => nz(x >> 1, y >> 1, 44) > .7 ? pal(PH([0x4a3322, 0x5e4330, 0x8b7b6c]), nz(x, y, 45)) : null); });
  def('rooted_dirt', I => { I.copy(get('dirt')); const R = I.R; for (let k = 0; k < 5; k++) { let x = R() * 16 | 0, y = R() * 16 | 0; for (let s = 0; s < 6; s++) { I.set(x, y, hx(0x9a7356)); y++; x += R() < .4 ? (R() < .5 ? 1 : -1) : 0; } } });
  def('mud', I => I.fill((x, y) => pal(PH([0x2f2a2c, 0x363133, 0x3c3739, 0x423d3f]), clamp(nz(x, y, 46) * .6 + sn(x, y, 3, 47) * .4, 0, .99))));
  def('packed_mud', I => I.fill((x, y) => pal(PH([0x8a6a4e, 0x93735a, 0x9c7c5f, 0xa38365]), clamp(nz(x, y, 48) * .5 + sn(x, y, 4, 49) * .3 + (nz(x >> 2, y >> 2, 50) > .7 ? .2 : 0), 0, .99))));
  def('mud_bricks', I => bricks(I, PH([0x87664a, 0x8f6e52, 0x987759, 0xa07f60]), hx(0x6c513b), 8, 4, 4, { bevel: 1 }));
  const GG = PH([0x8a8a8a, 0x969696, 0xa2a2a2, 0xadadad, 0xb9b9b9, 0xc6c6c6]);
  def('grass_block_top', I => I.fill((x, y) => pal(GG, clamp(nz(x, y, 51) * .6 + sn(x, y, 4, 52) * .4, 0, .99))).mark());
  def('grass_block_side', I => {
    I.copy(get('dirt'));
    const R = I.R, dr = []; for (let x = 0; x < 16; x++) dr[x] = 3 + (R() * 2.4 | 0) - (R() < .2 ? 1 : 0);
    for (let x = 0; x < 16; x++) for (let y = 0; y < dr[x]; y++) { const c = pal(GG, clamp(nz(x, y, 53) * .7 + .2, 0, .99)); I.set(x, y, y === dr[x] - 1 ? shd(c, .85) : c, 250); }
    for (let x = 0; x < 16; x++) if (R() < .35) I.set(x, dr[x], pal(GG, .4), 250);
  });
  def('grass_block_snow', I => { I.copy(get('dirt')); const R = I.R; for (let x = 0; x < 16; x++) { const d = 3 + (R() * 2.5 | 0); for (let y = 0; y < d; y++) I.set(x, y, pal(PH([0xdfeaea, 0xeef7f7, 0xffffff]), nz(x, y, 54))); I.set(x, d, hx(0xc5d3d3)); } });
  def('podzol_top', I => I.fill((x, y) => pal(PH([0x4c3418, 0x5d4021, 0x6a4a28, 0x7b5631, 0x8e6838, 0x3e2a14]), clamp(nz(x, y, 55) * .7 + sn(x, y, 5, 56) * .3, 0, .99))));
  def('podzol_side', I => { I.copy(get('dirt')); const R = I.R; for (let x = 0; x < 16; x++) { const d = 3 + (R() * 2 | 0); for (let y = 0; y < d; y++) I.set(x, y, pal(PH([0x4c3418, 0x5d4021, 0x6a4a28, 0x7b5631]), nz(x, y, 57))); } });
  def('mycelium_top', I => I.fill((x, y) => pal(PH([0x6a5a64, 0x766671, 0x82737c, 0x8e7f87, 0x9c8e96, 0xa99ca3]), clamp(nz(x, y, 58) * .65 + sn(x, y, 4, 59) * .35, 0, .99))));
  def('mycelium_side', I => { I.copy(get('dirt')); const R = I.R; for (let x = 0; x < 16; x++) { const d = 3 + (R() * 2.5 | 0); for (let y = 0; y < d; y++) I.set(x, y, pal(PH([0x6a5a64, 0x7a6a75, 0x8a7a85]), nz(x, y, 60))); } });
  def('dirt_path_top', I => I.fill((x, y) => pal(PH([0x8d7240, 0x967a45, 0x9d804a, 0xa58851, 0x7f6538]), clamp(nz(x, y, 61) * .7 + sn(x, y, 4, 62) * .3, 0, .99))));
  def('dirt_path_side', I => { I.copy(get('dirt')); for (let x = 0; x < 16; x++) { I.set(x, 0, hx(0x9d804a)); I.set(x, 1, hx(0x8d7240)); } for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (y < 1) I.set(x, y, [0, 0, 0, 0]); });
  def('farmland', I => I.fill((x, y) => { const row = (y >> 2) & 1, a = nz(x, y, 63); return pal(row ? PH([0x6b4a31, 0x77533a, 0x82603f]) : PH([0x8b6545, 0x966c4a, 0xa07554]), a); }));
  def('farmland_moist', I => { I.copy(get('farmland')); I.mul(.55); });
  def('bedrock', I => I.fill((x, y) => pal(PH([0x222222, 0x353535, 0x4b4b4b, 0x5f5f5f, 0x797979, 0x9a9a9a]), clamp(sn(x, y, 8, 65) * .5 + nz(x, y, 66) * .5, 0, .99))));
  const oreClusters = (I, pal2, spots, s) => {
    const R = rng(s);
    for (const [cx, cy] of spots) {
      const shape = [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [2, 1], [1, 2]];
      shape.forEach(([dx, dy], j) => { if (j > 3 && R() < .45) return; const x = cx + dx, y = cy + dy; I.set(x, y, j === 0 ? pal2[2] : j === 3 ? pal2[0] : R() < .5 ? pal2[1] : pal2[0]); });
      I.set(cx - 1, cy + 1, shd(I.get(cx - 1, cy + 1), .75));
    }
  };
  const ORE_SPOTS = [[[2, 2], [9, 3], [4, 8], [11, 9], [2, 12], [10, 13]], [[3, 3], [10, 2], [6, 7], [12, 8], [3, 12], [9, 12]], [[2, 4], [8, 2], [11, 7], [5, 9], [9, 12], [2, 13]]];
  const ORES = { coal: PH([0x2e2e2e, 0x3d3d3d, 0x5a5a5a]), iron: PH([0xaf8e77, 0xd8af93, 0xe9cbb5]), copper: PH([0x9c4e31, 0xc96a44, 0x7fc4a1]), gold: PH([0xd7a20f, 0xfcee4b, 0xffffb5]), redstone: PH([0x8b0000, 0xd40000, 0xff5050]), emerald: PH([0x00872a, 0x17dd62, 0x9dffc2]), lapis: PH([0x0e2b7a, 0x2351b5, 0x5d86e0]), diamond: PH([0x1aa8b0, 0x5decf5, 0xd2fffb]) };
  for (const k in ORES) {
    def(k + '_ore', I => { I.copy(get('stone')); oreClusters(I, ORES[k], ORE_SPOTS[hstr(k) % 3], hstr(k)); });
    def('deepslate_' + k + '_ore', I => { I.copy(get('deepslate')); oreClusters(I, ORES[k], ORE_SPOTS[(hstr(k) + 1) % 3], hstr(k) + 3); });
  }
  def('nether_gold_ore', I => { I.copy(get('netherrack')); oreClusters(I, ORES.gold, ORE_SPOTS[0], 5); });
  def('nether_quartz_ore', I => { I.copy(get('netherrack')); oreClusters(I, PH([0xc7bcae, 0xe8e2d6, 0xffffff]), ORE_SPOTS[1], 6); });
  def('ancient_debris_side', I => I.fill((x, y) => { const r = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return pal(PH([0x3d2924, 0x4f3631, 0x5f453d, 0x6e5148, 0x7a5d51]), clamp(nz(x, y, 67) * .55 + (Math.floor(r) % 3 === 0 ? -.15 : .2) + sn(x, y, 3, 68) * .2, 0, .99)); }));
  def('ancient_debris_top', I => I.fill((x, y) => { const r = Math.hypot(x - 7.5, y - 7.5); return pal(PH([0x3d2924, 0x5a3f37, 0x77574a, 0x8f6a58]), clamp(nz(x, y, 69) * .4 + ((Math.floor(r) & 1) ? .45 : .05), 0, .99)); }));
  const mineral = (P, o) => I => {
    o = o || {};
    I.fill((x, y) => pal(P, clamp(sn(x, y, 3, 71) * .3 + nz(x, y, 72) * .45 + .15, 0, .99)));
    if (o.border) { for (let i = 0; i < 16; i++) { I.set(i, 0, o.hi); I.set(0, i, o.hi); I.set(i, 15, o.lo); I.set(15, i, o.lo); } }
    if (o.grid) for (let i = 1; i < 15; i++) { I.set(i, 7, o.lo); I.set(7, i, o.lo); I.set(i, 8, o.hi); I.set(8, i, o.hi); }
    if (o.gem) { for (let y = 2; y < 14; y += 4) for (let x = 2; x < 14; x += 4) { I.set(x + 1, y + 1, o.hi); I.set(x + 2, y + 2, o.lo); } }
  };
  def('iron_block', I => { mineral(PH([0xd8d8d8, 0xdcdcdc, 0xe0e0e0, 0xe5e5e5]), { border: 1, hi: hx(0xfafafa), lo: hx(0xa8a8a8) })(I); for (let x = 1; x < 15; x++) { I.set(x, 4, hx(0xc6c6c6)); I.set(x, 11, hx(0xc6c6c6)); } });
  def('gold_block', mineral(PH([0xf5cc27, 0xf9d849, 0xfae069, 0xfde98a]), { border: 1, hi: hx(0xfffbd0), lo: hx(0xd59e1c), grid: 1 }));
  def('diamond_block', mineral(PH([0x60e4dc, 0x76e9e2, 0x8cefe9, 0xa2f4ef]), { border: 1, hi: hx(0xd5fffc), lo: hx(0x2bb4ae), gem: 1 }));
  def('emerald_block', mineral(PH([0x2bc65b, 0x37d264, 0x45dc70, 0x5be581]), { border: 1, hi: hx(0xa2ffbf), lo: hx(0x138d3b), gem: 1 }));
  def('lapis_block', I => I.fill((x, y) => pal(PH([0x1b3f9a, 0x2049a8, 0x2652b7, 0x2c5cc4, 0x3d70d6, 0x163684]), clamp(nz(x, y, 73) * .6 + sn(x, y, 4, 74) * .4, 0, .99))));
  def('redstone_block', I => { I.fill((x, y) => pal(PH([0xa00e07, 0xb31209, 0xc5170c, 0xd71e10]), clamp(nz(x, y, 75) * .7 + .1, 0, .99))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0xe82a1e)); I.set(0, i, hx(0xe82a1e)); I.set(i, 15, hx(0x7c0904)); I.set(15, i, hx(0x7c0904)); } for (let k = 2; k < 14; k += 3) I.set(k, 15 - k, hx(0xff5e4e)); });
  def('coal_block', I => I.fill((x, y) => pal(PH([0x101010, 0x161616, 0x1c1c1c, 0x232323, 0x2c2c2c]), clamp(nz(x, y, 76) * .7 + sn(x, y, 4, 77) * .3, 0, .99))));
  def('netherite_block', mineral(PH([0x3a3638, 0x403b3e, 0x463f43, 0x4b4549]), { border: 1, hi: hx(0x5f585d), lo: hx(0x262325) }));
  def('amethyst_block', I => I.fill((x, y) => pal(PH([0x5d3c8e, 0x7550a8, 0x8662bf, 0x9b77d1, 0xb495e5, 0xcdb3f2]), clamp(nz(x, y, 78) * .55 + sn(x * 2, y, 3, 79) * .45, 0, .99))));
  def('budding_amethyst', I => { I.copy(get('amethyst_block')); for (const [x, y] of [[3, 3], [11, 4], [6, 10], [12, 12], [2, 13]]) { I.set(x, y, hx(0x2e1e47)); I.set(x + 1, y, hx(0x3d2a5c)); } });
  const raw = (P) => I => I.fill((x, y) => pal(P, clamp(nz(x >> 1, y >> 1, 81) * .5 + nz(x, y, 82) * .5, 0, .99)));
  def('raw_iron_block', raw(PH([0x8a6a54, 0xa98269, 0xc6a083, 0xd8b499, 0xe6c6ae])));
  def('raw_copper_block', raw(PH([0x7a4029, 0x9a5236, 0xb86443, 0xcd7650, 0xe18b63])));
  def('raw_gold_block', raw(PH([0xae7a0f, 0xd3a121, 0xe9bd37, 0xf8d653, 0xffe680])));
  const COPC = [PH([0xb4684d, 0xc0714f, 0xc9795a, 0xd68a68, 0xe29c79]), PH([0xa0786a, 0xa88068, 0x9c8a74, 0x8c8f7b, 0xb09080]), PH([0x6c9c74, 0x6f9f7c, 0x6aa080, 0x5f9c78, 0x7aa98a]), PH([0x4f9e83, 0x56a68c, 0x5cab91, 0x65b49a, 0x52a088])];
  ['', 'exposed_', 'weathered_', 'oxidized_'].forEach((p, i) => {
    const P = COPC[i], blockN = p ? p + 'copper' : 'copper_block';
    def(blockN, I => { I.fill((x, y) => pal(P, clamp(nz(x, y, 83) * .6 + sn(x, y, 3, 84 + i) * .4, 0, .99))); for (let k = 0; k < 16; k++) { I.set(k, 0, shd(P[4], 1.05)); I.set(0, k, shd(P[4], 1.05)); I.set(k, 15, shd(P[0], .8)); I.set(15, k, shd(P[0], .8)); } });
    def(p + 'cut_copper', I => bricks(I, P, shd(P[0], .75), 8, 8, 0, { bevel: 1 }));
    def(p + 'chiseled_copper', I => { I.copy(get(p + 'cut_copper')); I.rect(4, 4, 11, 11, shd(P[0], .8)); I.rect(5, 5, 10, 10, P[3]); I.rect(7, 7, 8, 8, shd(P[0], .7)); });
    def(p + 'copper_grate', I => I.fill((x, y) => (x % 4 === 0 || y % 4 === 0) ? pal(P, .4 + nz(x, y, 85) * .5) : (x % 4 === 2 && y % 4 === 2 ? null : null)));
    def(p + 'copper_door_top', I => { I.copy(get(blockN)); I.rect(3, 2, 6, 6, [0, 0, 0, 0]); I.rect(9, 2, 12, 6, [0, 0, 0, 0]); for (let k = 0; k < 16; k++) I.set(k, 15, shd(P[0], .8)); });
    def(p + 'copper_door_bottom', I => { I.copy(get(blockN)); I.rect(3, 3, 12, 4, shd(P[0], .8)); I.rect(3, 10, 12, 11, shd(P[0], .8)); });
    def(p + 'copper_trapdoor', I => { I.copy(get(blockN)); I.rect(3, 3, 6, 6, [0, 0, 0, 0]); I.rect(9, 3, 12, 6, [0, 0, 0, 0]); I.rect(3, 9, 6, 12, [0, 0, 0, 0]); I.rect(9, 9, 12, 12, [0, 0, 0, 0]); });
    for (const st of ['', '_lit', '_powered', '_lit_powered']) def(p + 'copper_bulb' + st, I => { I.copy(get(blockN)); I.rect(3, 3, 12, 12, shd(P[0], .7)); I.rect(4, 4, 11, 11, st.includes('lit') ? hx(0xffd97a) : hx(0x4a3a2a)); if (st.includes('lit')) I.rect(6, 6, 9, 9, hx(0xfff4c4)); if (st.includes('powered')) I.set(7, 7, hx(0xff2020)); });
    def(p + 'copper_chest_side', I => { I.copy(get(blockN)); for (let x = 0; x < 16; x++) I.set(x, 6, shd(P[0], .7)); });
    def(p + 'copper_chest_top', I => I.copy(get(blockN)));
    def(p + 'copper_chest_front', I => { I.copy(get(p + 'copper_chest_side')); I.rect(7, 4, 8, 8, hx(0x2a2a2a)); });
  });
  const PLANK = {
    oak: PH([0x6b5232, 0x8c6b3f, 0x9c7b4b, 0xaf8d57, 0xbc9862, 0x7a5e38]), spruce: PH([0x4a3420, 0x5d4126, 0x6b4c2d, 0x765535, 0x82603c, 0x553b23]), birch: PH([0x9e8e5b, 0xb9a874, 0xc4b47f, 0xcfbf89, 0xd7c891, 0xab9a66]),
    jungle: PH([0x6e4a30, 0x8b5f3e, 0x9a6b48, 0xa77751, 0xb2825b, 0x7c5436]), acacia: PH([0x89451f, 0x9f5128, 0xad5a2d, 0xba6336, 0xc56d3d, 0x95492b]), dark_oak: PH([0x2d1d0e, 0x3b2714, 0x452f19, 0x4f371e, 0x5a3f24, 0x332011]),
    mangrove: PH([0x5c2622, 0x6f2e29, 0x7a332d, 0x863a33, 0x91423a, 0x652a26]), cherry: PH([0xb98376, 0xd3a095, 0xdcaba0, 0xe4b5aa, 0xebc0b6, 0xc38f84]), pale_oak: PH([0xbfaea9, 0xd2c4c0, 0xdacdca, 0xe2d6d3, 0xe9dfdc, 0xc9bab6]),
    poplar: PH([0xa58f62, 0xbaa476, 0xc6b080, 0xd0ba8a, 0xd9c494, 0xb09a6c]), bamboo: PH([0x9c8a32, 0xb7a345, 0xc4b04e, 0xcfba56, 0xd9c45f, 0xa99638]), crimson: PH([0x4f2134, 0x63293f, 0x6f2f48, 0x7b3551, 0x873c5a, 0x5a253a]), warped: PH([0x1b4b47, 0x245e58, 0x2a6a63, 0x30766e, 0x388279, 0x1f544f])
  };
  const planks = P => I => {
    const R = I.R, off = []; for (let r = 0; r < 4; r++) off.push(R() * 16 | 0);
    I.fill((x, y) => {
      const row = y >> 2, ly = y & 3;
      if (ly === 3) return P[0];
      const sx = (x + off[row]) & 15;
      if (sx === 0) return P[5];
      let v = .3 + nz(x, y, 101) * .25 + sn(x * .4, y, 4, 102 + row) * .35 + (ly === 0 ? .12 : 0);
      if (nz(x >> 1, row, 103) < .08 && ly === 1) v -= .35;
      return pal(P.slice(1, 5), clamp(v, 0, .99));
    });
  };
  const BARK = {
    oak: PH([0x3e301b, 0x4d3c22, 0x5b4729, 0x695331, 0x786038]), spruce: PH([0x2a1d10, 0x352415, 0x3e2b19, 0x48321e, 0x553c24]), birch: PH([0xd9d7cf, 0xc8c6be, 0xe6e4dd, 0xb8b6ad, 0xf0eee8]),
    jungle: PH([0x463b16, 0x54461c, 0x625223, 0x705e2a, 0x7f6b32]), acacia: PH([0x4f4a42, 0x5c5750, 0x67625a, 0x726d64, 0x7f7a71]), dark_oak: PH([0x261b0e, 0x2f2212, 0x382916, 0x41301b, 0x4b3720]),
    mangrove: PH([0x45322a, 0x523b31, 0x5f4338, 0x6b4b40, 0x775548]), cherry: PH([0x2b1416, 0x351a1d, 0x3f2124, 0x4a282b, 0x553033]), pale_oak: PH([0x504745, 0x5d5351, 0x6a5f5d, 0x776c69, 0x847875]),
    poplar: PH([0x8e8b7a, 0xa19e8c, 0xb2af9c, 0xc0bdab, 0xccc9b8]), crimson: PH([0x4b1520, 0x5c1a27, 0x6e2030, 0x8a2b3c, 0xa13a4a]), warped: PH([0x22404a, 0x2a5059, 0x316069, 0x13a39b, 0x3a6f78])
  };
  const STRIP = { oak: 'oak', spruce: 'spruce', birch: 'birch', jungle: 'jungle', acacia: 'acacia', dark_oak: 'dark_oak', mangrove: 'mangrove', cherry: 'cherry', pale_oak: 'pale_oak', poplar: 'poplar', crimson: 'crimson', warped: 'warped' };
  const barkTex = (n, P) => I => {
    if (n === 'birch') { I.fill((x, y) => pal(P.slice(0, 3).concat([P[4]]), nz(x, y, 111) * .99)); const R = I.R; for (let k = 0; k < 7; k++) { const y = R() * 16 | 0, x = R() * 14 | 0, w = 1 + (R() * 4 | 0); for (let i = 0; i < w; i++) I.set(x + i, y, i % 2 ? hx(0x4b4b4b) : hx(0x2c2c2c)); if (R() < .5) I.set(x, y + 1, hx(0x3a3a3a)); } return; }
    if (n === 'poplar') { I.fill((x, y) => pal(P, clamp(nz(x, y, 112) * .5 + .3, 0, .99))); const R = I.R; for (let k = 0; k < 5; k++) { const x = R() * 13 | 0, y = R() * 13 | 0; I.set(x + 1, y, hx(0x3e3c34)); I.set(x, y + 1, hx(0x4d4a40)); I.set(x + 2, y + 1, hx(0x4d4a40)); I.set(x + 1, y + 2, hx(0x3e3c34)); } return; }
    if (n === 'crimson' || n === 'warped') { I.fill((x, y) => { const v = sn(x, y * .3, 4, 113) * .7 + nz(x, y, 114) * .3; return n === 'warped' && v > .78 ? P[3] : pal(P.slice(0, 3).concat([P[4]]), clamp(v, 0, .99)); }); return; }
    I.fill((x, y) => { const v = sn(x * 1.4, y * .25, 5, 115) * .5 + nz(x, y >> 1, 116) * .3 + nz(x, y, 117) * .2; return pal(P, clamp(v + (x % 4 === 1 ? -.15 : 0), 0, .99)); });
  };
  const strippedTex = n => I => { const P = PLANK[n] || PLANK.oak; I.fill((x, y) => pal(P.slice(1, 5), clamp(sn(x * .5, y * .3, 4, 118) * .55 + nz(x, y, 119) * .35 + (x % 5 === 0 ? -.1 : .05), 0, .99))); };
  const logTop = (n, P, bark) => I => {
    I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); if (d > 6.6 && bark) return pal(bark, nz(x, y, 121)); const r = Math.floor(Math.hypot(x - 7.5, y - 7.5) * .9); return pal(P.slice(1, 5), clamp((r & 1 ? .25 : .65) + nz(x, y, 122) * .3, 0, .99)); });
  };
  for (const w of WOODS) {
    const n = w.n, P = PLANK[n];
    def(n + '_planks', planks(P));
    if (w.bamboo) continue;
    const log = w.nether ? n + '_stem' : n + '_log';
    def(log, barkTex(n, BARK[n]));
    def(log + '_top', logTop(n, P, BARK[n]));
    def('stripped_' + log, strippedTex(n));
    def('stripped_' + log + '_top', logTop(n, P, null));
    const leafTx = n === 'poplar' ? null : n + '_leaves';
    if (leafTx) {
      const fixed = n === 'cherry' ? PH([0xc9739c, 0xdb88b0, 0xe89fc2, 0xf3b5d1, 0xb66288]) : n === 'pale_oak' ? PH([0x7c837a, 0x8f968c, 0xa1a89e, 0xb3b9b0, 0x6b7268]) : null;
      def(leafTx, leafPainter(fixed, n));
    }
  }
  function leafPainter(fixed, n) {
    const G = PH([0x404040, 0x585858, 0x6e6e6e, 0x868686, 0x9e9e9e, 0xb4b4b4]);
    return (I, nm, fast) => {
      const P = fixed || G, s = hstr(n);
      I.fill((x, y) => {
        const h = nz(x, y, s);
        if (h < (n === 'spruce' ? .18 : .23)) return fast ? shd(P[0], .5) : null;
        let v = nz(x, y, s + 1) * .5 + sn(x, y, 4, s + 2) * .4;
        if ((x + y * 3) % 7 === 0) v += .2;
        return pal(P, clamp(v, 0, .99));
      });
      if (!fixed) I.mark();
    };
  }
  for (const c of ['red', 'orange', 'yellow']) def(c + '_poplar_leaves', leafPainter({ red: PH([0x8a1c14, 0xa52a1d, 0xbf3826, 0xd44a2f, 0xe05e3a]), orange: PH([0xa4480e, 0xc25d14, 0xd9721c, 0xe88a29, 0xf3a23c]), yellow: PH([0xa8860f, 0xc59f17, 0xd9b621, 0xe8ca33, 0xf3dc52]) }[c], c + 'poplar'));
  def('azalea_leaves', leafPainter(PH([0x3b5e1c, 0x4a7323, 0x5a862b, 0x6a9834, 0x2f4d16]), 'azalea'));
  def('flowering_azalea_leaves', (I, n) => { leafPainter(PH([0x3b5e1c, 0x4a7323, 0x5a862b, 0x6a9834]), 'fazalea')(I, n); const R = I.R; for (let k = 0; k < 8; k++) { const x = R() * 15 | 0, y = R() * 15 | 0; I.set(x, y, hx(0xd96ebb)); I.set(x + 1, y, hx(0xf09ad8)); } });
  def('mangrove_roots_side', I => I.fill((x, y) => (x % 5 === 1 || y % 6 === 2 || (x + y) % 7 === 0) ? pal(BARK.mangrove, nz(x, y, 131)) : null));
  def('mangrove_roots_top', I => I.copy(get('mangrove_roots_side')));
  def('muddy_mangrove_roots_side', I => { I.copy(get('mud')); I.fill((x, y) => (x % 5 === 1 || y % 6 === 2) ? pal(BARK.mangrove, nz(x, y, 132)) : null); });
  def('muddy_mangrove_roots_top', I => I.copy(get('muddy_mangrove_roots_side')));
  def('bamboo_block', I => I.fill((x, y) => pal(PH([0x5c7a24, 0x6e8e2c, 0x7ea033, 0x8bb03a, 0x4d6a1d]), clamp((x % 4 === 0 ? .9 : .3) + nz(x, y, 133) * .35 + (y % 8 === 0 ? -.3 : 0), 0, .99))));
  def('bamboo_block_top', I => I.fill((x, y) => { const cx = (x & 7) - 3.5, cy = (y & 7) - 3.5, d = Math.hypot(cx, cy); return d < 2 ? hx(0xc7b34f) : d < 3.3 ? hx(0x7ea033) : hx(0x5c7a24); }));
  def('stripped_bamboo_block', I => I.fill((x, y) => pal(PH([0xb09a3a, 0xc4ae45, 0xd2bc4f, 0xdcc75a]), clamp((x % 4 === 0 ? .1 : .6) + nz(x, y, 134) * .35, 0, .99))));
  def('stripped_bamboo_block_top', I => I.fill((x, y) => { const cx = (x & 7) - 3.5, cy = (y & 7) - 3.5, d = Math.hypot(cx, cy); return d < 2 ? hx(0xe0cd6a) : d < 3.3 ? hx(0xc4ae45) : hx(0xa8933a); }));
  def('bamboo_mosaic', I => I.fill((x, y) => { const blk2 = ((x >> 3) + (y >> 3)) & 1; const v = blk2 ? (y & 7) : (x & 7); return v === 0 ? hx(0x8d7c2c) : pal(PLANK.bamboo.slice(1, 5), clamp(nz(x, y, 135) * .5 + .3, 0, .99)); }));
  def('bamboo_fence', I => I.copy(get('bamboo_planks')));
  def('bamboo_fence_gate', I => I.copy(get('bamboo_planks')));
  def('bamboo_stalk', I => I.fill((x, y) => x < 3 ? (y % 8 === 0 ? hx(0x5a7a20) : pal(PH([0x6e9a2a, 0x7cab32, 0x8aba3a]), x / 3)) : x >= 13 && y < 3 ? hx(0x8aba3a) : null));
  def('bamboo_small_leaves', I => I.fill((x, y) => Math.abs(x - 8 - (y - 8) * .6) < 1.6 && y > 3 && y < 14 ? pal(PH([0x4c7a1d, 0x5e9226, 0x6fa82e]), nz(x, y, 136)) : null));
  def('bamboo_large_leaves', I => I.fill((x, y) => (Math.abs(x - 5 - (y - 8) * .7) < 1.8 || Math.abs(x - 11 + (y - 8) * .7) < 1.8) && y > 1 && y < 15 ? pal(PH([0x4c7a1d, 0x5e9226, 0x6fa82e]), nz(x, y, 137)) : null));
  for (const w of WOODS) {
    const n = w.n, P = PLANK[n], dark = shd(P[0], .8), mid = P[2], hi = P[4];
    const doorTop = I => {
      I.copy(get(n + '_planks'));
      for (let y = 0; y < 16; y++) { I.set(0, y, dark); I.set(15, y, dark); }
      for (let x = 0; x < 16; x++) I.set(x, 0, dark);
      if (['oak', 'jungle', 'acacia', 'birch', 'cherry', 'bamboo', 'mangrove', 'poplar', 'crimson', 'warped', 'pale_oak'].includes(n)) { const win = (x0, y0) => { I.rect(x0, y0, x0 + 3, y0 + 4, [0, 0, 0, 0]); }; if (n === 'acacia' || n === 'jungle') { win(3, 3); win(9, 3); win(3, 9); win(9, 9); } else if (n === 'birch') { I.rect(3, 2, 12, 13, [0, 0, 0, 0]); for (let y = 2; y <= 13; y += 4) I.rect(3, y, 12, y, mid); I.rect(7, 2, 8, 13, mid); } else { win(3, 3); win(9, 3); } }
      else { I.rect(3, 3, 12, 6, dark); I.rect(3, 10, 12, 13, dark); }
    };
    const doorBot = I => { I.copy(get(n + '_planks')); for (let y = 0; y < 16; y++) { I.set(0, y, dark); I.set(15, y, dark); } for (let x = 0; x < 16; x++) I.set(x, 15, dark); I.rect(3, 2, 12, 5, dark); I.rect(4, 3, 11, 4, hi); I.rect(3, 9, 12, 13, dark); I.rect(4, 10, 11, 12, mid); I.set(13, 1, hx(0x777777)); I.set(13, 2, hx(0x5a5a5a)); };
    def(n + '_door_top', doorTop); def(n + '_door_bottom', doorBot);
    def(n + '_trapdoor', I => { I.copy(get(n + '_planks')); for (let i = 0; i < 16; i++) { I.set(i, 0, dark); I.set(0, i, dark); I.set(i, 15, dark); I.set(15, i, dark); } if (['oak', 'jungle', 'acacia', 'birch', 'bamboo', 'cherry', 'poplar', 'warped', 'crimson', 'mangrove', 'pale_oak'].includes(n)) { I.rect(3, 3, 6, 6, [0, 0, 0, 0]); I.rect(9, 3, 12, 6, [0, 0, 0, 0]); I.rect(3, 9, 6, 12, [0, 0, 0, 0]); I.rect(9, 9, 12, 12, [0, 0, 0, 0]); } else { I.rect(2, 7, 13, 8, dark); I.rect(7, 2, 8, 13, dark); } });
    def(n + '_shelf_side', I => { I.copy(get(n + '_planks')); I.rect(0, 0, 15, 1, dark); I.rect(0, 7, 15, 8, dark); I.rect(0, 14, 15, 15, dark); });
  }
  def('iron_door_top', I => { I.fill((x, y) => pal(PH([0xc4c4c4, 0xcfcfcf, 0xd8d8d8]), nz(x, y, 141))); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x8a8a8a)); I.set(15, y, hx(0x8a8a8a)); } I.rect(3, 3, 6, 7, [0, 0, 0, 0]); I.rect(9, 3, 12, 7, [0, 0, 0, 0]); for (let x = 0; x < 16; x++) I.set(x, 0, hx(0x8a8a8a)); });
  def('iron_door_bottom', I => { I.fill((x, y) => pal(PH([0xc4c4c4, 0xcfcfcf, 0xd8d8d8]), nz(x, y, 142))); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x8a8a8a)); I.set(15, y, hx(0x8a8a8a)); } I.rect(3, 3, 12, 6, hx(0xa8a8a8)); I.rect(3, 9, 12, 12, hx(0xa8a8a8)); I.set(12, 1, hx(0x666666)); for (let x = 0; x < 16; x++) I.set(x, 15, hx(0x8a8a8a)); });
  def('iron_trapdoor', I => { I.fill((x, y) => pal(PH([0xc4c4c4, 0xcfcfcf, 0xd8d8d8]), nz(x, y, 143))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x8a8a8a)); I.set(0, i, hx(0x8a8a8a)); I.set(i, 15, hx(0x8a8a8a)); I.set(15, i, hx(0x8a8a8a)); } I.rect(3, 3, 6, 6, [0, 0, 0, 0]); I.rect(9, 3, 12, 6, [0, 0, 0, 0]); I.rect(3, 9, 6, 12, [0, 0, 0, 0]); I.rect(9, 9, 12, 12, [0, 0, 0, 0]); });
  def('iron_bars', I => I.fill((x, y) => (x === 7 || x === 8 || ((x === 1 || x === 2 || x === 13 || x === 14))) ? pal(PH([0x6e6e6e, 0x8a8a8a, 0xa8a8a8]), (x & 1) ? .2 : .8) : (y === 2 || y === 13) && x > 0 && x < 15 ? hx(0x8a8a8a) : null));
  const WOOL = c => I => { const b = DYE[c], P = [shd(b, .78), shd(b, .86), shd(b, .93), shd(b, 1), shd(b, 1.06)].map(x => x.map(v => Math.min(255, v))); I.fill((x, y) => pal(P, clamp(nz(x, y, 151) * .5 + (((x + y) & 3) === 0 ? .3 : ((x - y) & 3) === 0 ? -.15 : .1) + sn(x, y, 4, 152) * .2, 0, .99))); };
  const WOOLC = { white: [234, 236, 237], orange: [241, 118, 20], magenta: [190, 69, 180], light_blue: [58, 175, 217], yellow: [249, 198, 40], lime: [112, 185, 26], pink: [238, 141, 172], gray: [63, 68, 72], light_gray: [142, 142, 135], cyan: [21, 138, 145], purple: [122, 42, 173], blue: [53, 57, 157], brown: [114, 72, 41], green: [85, 110, 28], red: [161, 39, 35], black: [21, 21, 26] };
  const CONC = { white: [207, 213, 214], orange: [224, 97, 1], magenta: [169, 48, 159], light_blue: [36, 137, 199], yellow: [241, 175, 21], lime: [94, 169, 25], pink: [214, 101, 143], gray: [55, 58, 62], light_gray: [125, 125, 115], cyan: [21, 119, 136], purple: [100, 32, 156], blue: [45, 47, 143], brown: [96, 60, 32], green: [73, 91, 36], red: [142, 33, 33], black: [8, 10, 15] };
  const TERR = { white: [210, 178, 161], orange: [162, 84, 38], magenta: [150, 88, 109], light_blue: [113, 109, 138], yellow: [186, 133, 35], lime: [104, 118, 53], pink: [162, 78, 79], gray: [58, 42, 36], light_gray: [135, 107, 98], cyan: [87, 91, 91], purple: [118, 70, 86], blue: [74, 60, 91], brown: [77, 51, 36], green: [76, 83, 42], red: [143, 61, 47], black: [37, 23, 16] };
  for (const c of COLORS) {
    const W = WOOLC[c], Cc = CONC[c], Tt = TERR[c];
    def(c + '_wool', I => { const P = [shd(W, .8), shd(W, .88), shd(W, .95), W, shd(W, 1.05).map(v => Math.min(255, v))]; I.fill((x, y) => pal(P, clamp(nz(x, y, 151) * .45 + ((((x + y) & 3) === 0) ? .35 : (((x - y) & 3) === 1) ? -.1 : .12) + sn(x, y, 4, 152) * .2, 0, .99))); });
    def(c + '_concrete', I => I.fill((x, y) => shd(Cc, .97 + nz(x, y, 153) * .05)));
    def(c + '_concrete_powder', I => I.fill((x, y) => { const v = nz(x, y, 154); return shd(mixc(Cc, [235, 235, 230], .25), v < .2 ? .85 : v > .85 ? 1.12 : .97 + nz(x, y, 155) * .06).map(q => Math.min(255, q)); }));
    def(c + '_terracotta', I => I.fill((x, y) => shd(Tt, .93 + nz(x, y, 156) * .1 + sn(x, y, 3, 157) * .05)));
    def(c + '_glazed_terracotta', I => { const s = hstr(c), R = rng(s), base = mixc(Cc, [255, 255, 255], .25), dk = shd(Cc, .6), lt = mixc(Cc, [255, 255, 255], .6), acc = mixc(hx([0xd9b45a, 0x3b8fc4, 0xc03b3b, 0x4caf50][s % 4]), Cc, .4); I.fill((x, y) => { const a = (x + y) & 15, b2 = (x - y + 16) & 15, d = Math.min(x, y, 15 - x, 15 - y); if (d === 0) return dk; if (Math.abs(a - 8) < 1 || (x < 5 && y < 5 && x + y > 3)) return lt; if (Math.abs(b2 - 4) < 1.2 && d > 2) return acc; if (x > 9 && y > 9 && (x + y) % 3 === 0) return dk; return shd(base, .95 + nz(x, y, s) * .08); }); });
    def(c + '_stained_glass', I => { const g = DYE[c]; I.fill((x, y) => { const e = x === 0 || y === 0 || x === 15 || y === 15; if (e) return [g[0] * .85, g[1] * .85, g[2] * .85, 205]; const st = (x - y === 5 && x > 6 && x < 11) || (x - y === 3 && x > 2 && x < 6); return st ? [Math.min(255, g[0] * 1.15 + 30), Math.min(255, g[1] * 1.15 + 30), Math.min(255, g[2] * 1.15 + 30), 150] : [g[0], g[1], g[2], 110]; }); });
    def(c + '_stained_glass_pane_top', I => { const g = DYE[c]; I.fill((x, y) => x >= 7 && x <= 8 ? [g[0] * .85, g[1] * .85, g[2] * .85, 205] : null); });
    def('shulker_' + c + '_side', I => { I.fill((x, y) => shd(DYE[c], (y < 8 ? 1 : .88) * (.94 + nz(x, y, 158) * .1))); for (let x = 0; x < 16; x++) I.set(x, 8, shd(DYE[c], .6)); });
    def('shulker_' + c + '_top', I => { I.fill((x, y) => shd(DYE[c], .95 + nz(x, y, 159) * .1)); I.rect(4, 4, 11, 11, shd(DYE[c], .8)); });
    def('shulker_' + c + '_bottom', I => I.fill((x, y) => shd(DYE[c], .85 + nz(x, y, 160) * .1)));
    def('bed_' + c + '_top_head', I => { I.fill((x, y) => shd(W, .92 + nz(x, y, 161) * .1)); I.rect(1, 1, 14, 6, [236, 236, 236]); for (let x = 1; x < 15; x++) I.set(x, 6, [205, 205, 205]); });
    def('bed_' + c + '_top_foot', I => I.fill((x, y) => shd(W, .92 + nz(x, y, 162) * .1 - (y > 13 ? .1 : 0))));
    def('bed_' + c + '_side_head', I => { I.fill((x, y) => y < 6 ? shd(W, .85 + nz(x, y, 163) * .1) : null); I.rect(0, 0, 4, 5, [236, 236, 236]); });
    def('bed_' + c + '_side_foot', I => I.fill((x, y) => y < 6 ? shd(W, .85 + nz(x, y, 164) * .1) : null));
    def('bed_' + c + '_end', I => I.fill((x, y) => y < 6 ? shd(W, .8 + nz(x, y, 165) * .1) : null));
    def('banner_' + c, I => I.fill((x, y) => shd(W, .9 + nz(x, y, 166) * .1)));
    def(c + '_candle', I => { I.fill((x, y) => x < 2 && y >= 6 ? shd(DYE[c], x ? .8 : 1) : null); I.set(0, 5, [40, 40, 40]); });
  }
  def('candle', I => { I.fill((x, y) => x < 2 && y >= 6 ? (x ? [212, 196, 154] : [236, 222, 182]) : null); I.set(0, 5, [40, 40, 40]); });
  def('terracotta', I => I.fill((x, y) => shd([152, 94, 67], .93 + nz(x, y, 167) * .1)));
  def('shulker_side', I => { I.fill((x, y) => shd([151, 103, 151], (y < 8 ? 1 : .88) * (.94 + nz(x, y, 168) * .1))); for (let x = 0; x < 16; x++) I.set(x, 8, [90, 60, 90]); });
  def('shulker_top', I => { I.fill((x, y) => shd([151, 103, 151], .95 + nz(x, y, 169) * .1)); I.rect(4, 4, 11, 11, [124, 84, 124]); });
  def('shulker_bottom', I => I.fill((x, y) => shd([151, 103, 151], .85 + nz(x, y, 170) * .1)));
  def('bed_leg', I => I.fill((x, y) => pal(PLANK.oak, nz(x, y, 171))));
  def('banner_pole', I => I.fill((x, y) => pal(PLANK.oak.slice(1, 4), nz(x, y, 172))));
  def('glass', I => I.fill((x, y) => { if (x === 0 || y === 0 || x === 15 || y === 15) return x === 15 || y === 15 ? [176, 204, 214, 255] : [220, 238, 243, 255]; if ((x - y === 5 && x > 6 && x < 11) || (x - y === 3 && x > 2 && x < 6) || (x + y === 21 && x > 10 && x < 14)) return [255, 255, 255, 220]; if ((x === 1 && y < 6) || (y === 1 && x < 6)) return [200, 228, 238, 160]; return null; }));
  def('glass_pane_top', I => I.fill((x, y) => x === 7 || x === 8 ? [200, 228, 238, 230] : null));
  def('tinted_glass', I => I.fill((x, y) => { const e = x === 0 || y === 0 || x === 15 || y === 15; return e ? [70, 58, 82, 255] : (x - y === 5 && x > 6 && x < 11) ? [110, 98, 122, 200] : [44, 38, 54, 150]; }));
  def('ice', I => I.fill((x, y) => { const v = nz(x, y, 173); return [140 + v * 30, 180 + v * 30, 255, (x - y === 4 || x + y === 18) ? 220 : 160]; }));
  def('packed_ice', I => I.fill((x, y) => { const v = nz(x, y, 174) * .5 + sn(x, y, 3, 175) * .5; return [130 + v * 50, 165 + v * 45, 235 + v * 20]; }));
  def('blue_ice', I => I.fill((x, y) => { const v = nz(x, y, 176) * .5 + sn(x, y, 3, 177) * .5; return [100 + v * 40, 150 + v * 45, 240]; }));
  def('snow', I => I.fill((x, y) => pal(PH([0xe6f0f0, 0xedf6f6, 0xf3fafa, 0xffffff]), nz(x, y, 178))));
  def('powder_snow', I => I.fill((x, y) => pal(PH([0xe0ebef, 0xeaf3f6, 0xf3f9fb, 0xffffff]), nz(x, y, 179))));
  def('obsidian', I => I.fill((x, y) => { const v = sn(x, y, 4, 181) * .6 + nz(x, y, 182) * .4; return pal(PH([0x0f0b19, 0x15101f, 0x1d1529, 0x2a1d3c, 0x3b2a54, 0x503a6e]), clamp(v * v * 1.2, 0, .99)); }));
  def('crying_obsidian', I => { I.copy(get('obsidian')); I.fill((x, y) => sn(x, y, 4, 183) > .62 ? pal(PH([0x6a12b8, 0x8a2be2, 0xb05cf0]), nz(x, y, 184)) : null); });
  def('glowstone', I => I.fill((x, y) => pal(PH([0x8f6a33, 0xb08542, 0xd0a656, 0xf0c87a, 0xfde3a8, 0xffffff]), clamp(nz(x, y, 185) * .6 + sn(x, y, 4, 186) * .4, 0, .99))));
  def('shroomlight', I => I.fill((x, y) => pal(PH([0xd7782f, 0xef9a3d, 0xf8b450, 0xfdd07a, 0xfff0b6]), clamp(nz(x, y, 187) * .6 + sn(x, y, 4, 188) * .4, 0, .99))));
  for (const [n, ca, cb2] of [['ochre_froglight', [246, 226, 160], [226, 182, 108]], ['verdant_froglight', [216, 240, 196], [150, 196, 128]], ['pearlescent_froglight', [244, 226, 234], [214, 182, 210]]]) { def(n + '_side', I => I.fill((x, y) => (y % 4 === 0) ? shd(cb2, .9) : mixc(ca, cb2, nz(x, y, 189) * .5))); def(n + '_top', I => I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return Math.floor(d) % 3 === 0 ? cb2 : ca; })); }
  def('soul_sand', I => { I.fill((x, y) => pal(PH([0x3d2e24, 0x4a382c, 0x564233, 0x624b3a]), clamp(nz(x, y, 191) * .6 + sn(x, y, 4, 192) * .4, 0, .99))); for (const [x, y] of [[3, 4], [10, 9], [6, 12]]) { I.set(x, y, hx(0x231a14)); I.set(x + 2, y, hx(0x231a14)); I.set(x + 1, y + 2, hx(0x231a14)); } });
  def('soul_soil', I => I.fill((x, y) => pal(PH([0x3b2c22, 0x45342a, 0x4f3c31, 0x5a4538]), clamp(nz(x, y, 193) * .7 + sn(x, y, 4, 194) * .3, 0, .99))));
  def('bone_block_side', I => I.fill((x, y) => pal(PH([0xc6c2a8, 0xd2ceb4, 0xdcd8bf, 0xe5e1c9]), clamp((x % 4 === 0 ? .1 : .6) + nz(x, y, 195) * .35, 0, .99))));
  def('bone_block_top', I => I.fill((x, y) => { const d = Math.hypot((x & 7) - 3.5, (y & 7) - 3.5); return d < 1.5 ? hx(0x9e9a82) : d < 3.2 ? hx(0xe5e1c9) : hx(0xc6c2a8); }));
  def('hay_block_side', I => I.fill((x, y) => { if (y === 3 || y === 12) return x % 2 ? hx(0x6a4a14) : hx(0x8a6420); return pal(PH([0x9a7d16, 0xb59520, 0xc9a72b, 0xd8b83a, 0xe5c955]), clamp(nz(x, y >> 1, 196) * .7 + (x % 3 === 0 ? -.2 : .1), 0, .99)); }));
  def('hay_block_top', I => I.fill((x, y) => pal(PH([0x9a7d16, 0xb59520, 0xc9a72b, 0xd8b83a]), clamp(nz(x, y, 197) * .6 + ((x + y) % 4 === 0 ? .3 : 0), 0, .99))));
  def('dried_kelp_side', I => I.fill((x, y) => pal(PH([0x2c331b, 0x374022, 0x424c29, 0x4c5730]), clamp((y % 4 === 0 ? .1 : .6) + nz(x, y, 198) * .3, 0, .99))));
  def('dried_kelp_top', I => I.fill((x, y) => pal(PH([0x2c331b, 0x374022, 0x424c29]), nz(x, y, 199))));
  def('dried_kelp_bottom', I => I.copy(get('dried_kelp_top')));
  def('sponge', I => { I.fill((x, y) => pal(PH([0xa39a33, 0xb8ae3d, 0xc8bf4a, 0xd6cc58]), clamp(nz(x, y, 201) * .6 + .2, 0, .99))); const R = I.R; for (let k = 0; k < 12; k++) I.set(R() * 16 | 0, R() * 16 | 0, hx(0x7a7322)); });
  def('wet_sponge', I => { I.copy(get('sponge')); I.tint([170, 180, 120]); });
  def('moss_block', I => I.fill((x, y) => pal(PH([0x45601f, 0x526f27, 0x5d7c2d, 0x6a8a34, 0x77983d]), clamp(nz(x, y, 202) * .65 + sn(x, y, 4, 203) * .35, 0, .99))));
  def('pale_moss_block', I => I.fill((x, y) => pal(PH([0x7d8577, 0x8a9284, 0x969e90, 0xa3ab9c, 0xb0b8a9]), clamp(nz(x, y, 204) * .65 + sn(x, y, 4, 205) * .35, 0, .99))));
  def('melon_side', I => I.fill((x, y) => pal(PH([0x6d8a1d, 0x7c9a22, 0x8aaa27, 0x9bb92d]), clamp((x % 4 < 2 ? .7 : .2) + nz(x, y, 206) * .3, 0, .99))));
  def('melon_top', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5); return pal(PH([0x6d8a1d, 0x7c9a22, 0x8aaa27, 0xa7c133]), clamp(nz(x, y, 207) * .4 + (d < 2 ? .7 : 0) + (Math.atan2(y - 7.5, x - 7.5) * 2.5 % 1 > .5 ? .2 : 0), 0, .99)); }));
  def('pumpkin_side', I => I.fill((x, y) => { if (y === 0 || y === 15) return hx(0xa85b0b); return pal(PH([0xb8650e, 0xd17a13, 0xe08b17, 0xe9991f]), clamp((x % 4 === 0 ? .05 : .6) + nz(x, y, 208) * .3, 0, .99)); }));
  def('pumpkin_top', I => { I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return pal(PH([0xb8650e, 0xd17a13, 0xe08b17]), clamp(nz(x, y, 209) * .5 + (d > 6.5 ? 0 : .4), 0, .99)); }); I.rect(7, 7, 8, 8, hx(0x5a4a1a)); });
  const face = (I, lit) => { const E = lit ? hx(0xffd56a) : hx(0x2b1803), E2 = lit ? hx(0xf8a830) : hx(0x3b2205); I.copy(get('pumpkin_side')); I.rect(3, 4, 5, 6, E); I.rect(10, 4, 12, 6, E); I.set(4, 4, E2); I.set(11, 4, E2); I.rect(3, 9, 12, 11, E); I.set(5, 9, hx(0xe08b17)); I.set(10, 9, hx(0xe08b17)); I.rect(4, 12, 11, 12, E2); I.set(7, 11, hx(0xe08b17)); };
  def('carved_pumpkin', I => face(I, 0)); def('jack_o_lantern', I => face(I, 1));
  def('cactus_side', I => { I.fill((x, y) => x === 0 || x === 15 ? null : pal(PH([0x0c4a14, 0x125c1c, 0x167024, 0x1b822c, 0x2a9a3c]), clamp(((x - 1) % 4 === 1 ? .9 : .4) + nz(x, y, 210) * .2, 0, .99))); for (let y = 2; y < 16; y += 4) for (const x of [2, 6, 10, 13]) I.set(x, y + (x & 1), hx(0xc8c8a0)); });
  def('cactus_top', I => I.fill((x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return d > 6.6 ? null : pal(PH([0x167024, 0x1b822c, 0x2a9a3c, 0x5ab84a]), clamp((d < 2.5 ? .8 : d > 5.5 ? .1 : .45) + nz(x, y, 211) * .2, 0, .99)); }));
  def('cactus_bottom', I => I.copy(get('cactus_top')));
  def('target_side', I => { I.fill((x, y) => pal(PH([0xe1d6c4, 0xebe1d1, 0xf2ead9]), nz(x, y, 212))); const r = Math.hypot; I.fill((x, y) => { const d = r(x - 7.5, y - 7.5); return d < 1.5 || (d > 3 && d < 4.5) || (d > 6 && d < 7.5) ? pal(PH([0xb02a24, 0xc8342c, 0xd8433a]), nz(x, y, 213)) : null; }); });
  def('target_top', I => I.copy(get('target_side')));
  def('cobweb', I => I.fill((x, y) => { const a = x === y || x === 15 - y || x === 8 || y === 8; const r = Math.hypot(x - 7.5, y - 7.5); const ring = Math.abs(r - 3) < .4 || Math.abs(r - 6) < .4; return a || ring ? [220, 220, 220, 230] : null; }));
  def('slime_block', I => I.fill((x, y) => { const e = x === 0 || y === 0 || x === 15 || y === 15, inner = x >= 4 && x <= 11 && y >= 4 && y <= 11; return e ? [92, 160, 76, 210] : inner ? [112, 190, 92, 230] : [120, 200, 100, 150]; }));
  def('honey_block_side', I => I.fill((x, y) => [240 - nz(x, y, 214) * 20, 170 - nz(x, y, 215) * 30, 40, 200]));
  def('honey_block_top', I => I.copy(get('honey_block_side'))); def('honey_block_bottom', I => I.copy(get('honey_block_side')));
  def('honeycomb_block', I => I.fill((x, y) => { const row = y >> 2, sx = (x + (row & 1) * 2) & 3, ly = y & 3; return sx === 0 || ly === 0 ? hx(0xb9781a) : pal(PH([0xe39b24, 0xeca82d, 0xf3b63a]), nz(x, y, 216)); }));
  def('sculk', I => I.fill((x, y) => { const v = nz(x, y, 217) * .6 + sn(x, y, 4, 218) * .4; return v > .82 ? hx(0x2cd0d0) : pal(PH([0x051a20, 0x07232b, 0x0b2e37, 0x103a45]), clamp(v, 0, .99)); }));
  def('sculk_vein', I => I.fill((x, y) => sn(x, y, 4, 219) > .6 ? pal(PH([0x07232b, 0x103a45, 0x2cd0d0]), nz(x, y, 220)) : null));
  def('sculk_catalyst_top', I => { I.copy(get('sculk')); I.rect(5, 5, 10, 10, hx(0xd8d4bc)); I.rect(6, 6, 9, 9, hx(0x2cd0d0)); });
  def('sculk_catalyst_top_bloom', I => I.copy(get('sculk_catalyst_top')));
  def('sculk_catalyst_side', I => { I.fill((x, y) => y < 5 ? pal(PH([0x07232b, 0x103a45]), nz(x, y, 221)) : pal(PH([0xbdb89f, 0xccc7ae, 0xd8d4bc]), nz(x, y, 222))); });
  def('sculk_catalyst_bottom', I => I.copy(get('bone_block_top')));
  def('sculk_sensor_top', I => { I.copy(get('sculk')); I.rect(3, 3, 12, 12, hx(0x0a2a33)); I.rect(5, 5, 10, 10, hx(0x2cd0d0)); });
  def('sculk_sensor_side', I => I.fill((x, y) => y < 8 ? null : pal(PH([0x07232b, 0x0b2e37, 0x103a45]), nz(x, y, 223))));
  def('sculk_sensor_bottom', I => I.copy(get('sculk')));
  def('sculk_shrieker_top', I => { I.copy(get('sculk')); I.rect(2, 2, 13, 13, hx(0xd8d4bc)); I.rect(4, 4, 11, 11, hx(0x07232b)); I.rect(6, 6, 9, 9, hx(0x2cd0d0)); });
  def('sculk_shrieker_side', I => I.fill((x, y) => y < 8 ? null : pal(PH([0xbdb89f, 0xccc7ae]), nz(x, y, 224))));
  def('sculk_shrieker_bottom', I => I.copy(get('sculk')));
  def('mushroom_stem', I => I.fill((x, y) => pal(PH([0xc4bdac, 0xcfc8b8, 0xd9d3c4, 0xe1dbcd]), clamp(nz(x, y >> 1, 225) * .6 + .2, 0, .99))));
  def('brown_mushroom_block', I => I.fill((x, y) => pal(PH([0x7e5d43, 0x8a674b, 0x957054, 0x9f7a5c]), clamp(nz(x, y, 226) * .7 + .15, 0, .99))));
  def('red_mushroom_block', I => { I.fill((x, y) => pal(PH([0xa3201d, 0xb52622, 0xc32b27]), nz(x, y, 227))); for (const [x, y, r] of [[4, 4, 2], [11, 6, 1.6], [6, 11, 1.8], [13, 13, 1.2]]) I.fill((xx, yy) => Math.hypot(xx - x, yy - y) < r ? hx(0xe5e1d6) : null); });
  def('crafting_table_top', I => { I.copy(get('oak_planks')); const fr = hx(0x5c3f22); for (let i = 0; i < 16; i++) { I.set(i, 0, fr); I.set(0, i, fr); I.set(i, 15, fr); I.set(15, i, fr); } for (let i = 1; i < 15; i++) { I.set(i, 1, hx(0xc29d63)); I.set(1, i, hx(0xc29d63)); } for (let i = 3; i < 13; i++) { I.set(i, 7, hx(0x6e4c2a)); I.set(7, i, hx(0x6e4c2a)); I.set(i, 8, hx(0x6e4c2a)); I.set(8, i, hx(0x6e4c2a)); } });
  def('crafting_table_side', I => { I.copy(get('oak_planks')); I.rect(0, 0, 15, 2, hx(0x6b4a28)); I.rect(0, 0, 15, 0, hx(0x5c3f22)); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x5c3f22)); I.set(15, y, hx(0x5c3f22)); } I.rect(3, 5, 6, 12, hx(0x9a9a9a)); I.rect(3, 5, 3, 12, hx(0x6e6e6e)); I.rect(4, 4, 5, 4, hx(0xb8b8b8)); I.rect(10, 4, 11, 13, hx(0x6e4c2a)); I.rect(9, 4, 12, 6, hx(0x8a8a8a)); I.rect(9, 4, 12, 4, hx(0xb0b0b0)); });
  def('crafting_table_front', I => { I.copy(get('crafting_table_side')); I.rect(2, 4, 13, 13, null); I.copy(get('oak_planks')); I.rect(0, 0, 15, 2, hx(0x6b4a28)); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x5c3f22)); I.set(15, y, hx(0x5c3f22)); } for (let i = 0; i < 8; i++) I.set(4 + i, 12 - i, hx(0x6e4c2a)); I.rect(3, 4, 7, 6, hx(0x9a9a9a)); I.rect(3, 4, 7, 4, hx(0xc0c0c0)); I.rect(11, 5, 12, 12, hx(0x6e4c2a)); I.rect(10, 3, 13, 5, hx(0x8a8a8a)); });
  const FS = PH([0x5f5f5f, 0x6b6b6b, 0x777777, 0x838383]);
  def('furnace_side', I => { I.fill((x, y) => pal(FS, clamp(nz(x, y, 231) * .6 + .2, 0, .99))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x9a9a9a)); I.set(0, i, hx(0x8a8a8a)); I.set(i, 15, hx(0x464646)); I.set(15, i, hx(0x505050)); } });
  def('furnace_top', I => { I.fill((x, y) => pal(PH([0x6e6e6e, 0x7a7a7a, 0x858585]), nz(x, y, 232))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x9a9a9a)); I.set(0, i, hx(0x9a9a9a)); I.set(i, 15, hx(0x4a4a4a)); I.set(15, i, hx(0x4a4a4a)); } });
  const furnFront = (lit, base) => I => { I.copy(get(base || 'furnace_side')); I.rect(3, 2, 12, 3, hx(0x3a3a3a)); I.rect(4, 7, 11, 13, hx(0x2c2c2c)); I.rect(4, 7, 11, 7, hx(0x4c4c4c)); if (lit) { I.rect(5, 9, 10, 13, hx(0x9b3410)); I.rect(5, 11, 10, 13, hx(0xf28c1c)); I.rect(6, 12, 9, 13, hx(0xffd451)); I.set(7, 10, hx(0xf8b32a)); } else I.rect(5, 9, 10, 13, hx(0x161616)); };
  def('furnace_front', furnFront(0)); def('furnace_front_on', furnFront(1));
  def('smoker_side', I => { I.copy(get('furnace_side')); I.fill((x, y) => y > 11 ? pal(PH([0x3f3226, 0x4a3b2d]), nz(x, y, 233)) : y < 4 ? pal(PLANK.dark_oak.slice(1, 4), nz(x, y, 234)) : null); });
  def('smoker_top', I => { I.copy(get('furnace_top')); I.rect(4, 4, 11, 11, hx(0x2a2a2a)); I.rect(5, 5, 10, 10, hx(0x444444)); });
  def('smoker_bottom', I => I.copy(get('furnace_top')));
  def('smoker_front', I => { furnFront(0, 'smoker_side')(I); }); def('smoker_front_on', I => { furnFront(1, 'smoker_side')(I); });
  def('blast_furnace_side', I => { I.fill((x, y) => pal(PH([0x4e4e52, 0x58585c, 0x636367]), nz(x, y, 235))); for (let y = 4; y < 16; y += 4) for (let x = 0; x < 16; x++) I.set(x, y, hx(0x3a3a3e)); });
  def('blast_furnace_top', I => { I.copy(get('blast_furnace_side')); I.rect(3, 3, 12, 12, hx(0x2a2a2e)); });
  def('blast_furnace_front', I => furnFront(0, 'blast_furnace_side')(I)); def('blast_furnace_front_on', I => furnFront(1, 'blast_furnace_side')(I));
  def('dispenser_front', I => { I.copy(get('furnace_side')); I.rect(5, 5, 10, 10, hx(0x2a2a2a)); I.rect(6, 6, 9, 9, hx(0x141414)); });
  def('dispenser_front_vertical', I => I.copy(get('dispenser_front')));
  def('dropper_front', I => { I.copy(get('furnace_side')); I.rect(5, 6, 10, 9, hx(0x2a2a2a)); I.rect(6, 7, 9, 8, hx(0x141414)); });
  def('dropper_front_vertical', I => I.copy(get('dropper_front')));
  const CHEST = PH([0x6e4a22, 0x8a5f2c, 0x9b6c33, 0xa9773a]);
  def('chest_side', I => { I.fill((x, y) => pal(CHEST, clamp(nz(x, y, 236) * .5 + sn(x * .4, y, 4, 237) * .4, 0, .99))); for (let x = 0; x < 16; x++) { I.set(x, 2, hx(0x3a2611)); I.set(x, 15, hx(0x3a2611)); I.set(x, 7, hx(0x3a2611)); } for (let y = 2; y < 16; y++) { I.set(1, y, hx(0x3a2611)); I.set(14, y, hx(0x3a2611)); } });
  def('chest_front', I => { I.copy(get('chest_side')); I.rect(7, 5, 8, 9, hx(0xc8c8c8)); I.rect(7, 8, 8, 9, hx(0x7a7a7a)); });
  def('trapped_chest_front', I => { I.copy(get('chest_side')); I.rect(7, 5, 8, 9, hx(0xc8c8c8)); I.rect(7, 8, 8, 9, hx(0x7a7a7a)); I.set(3, 7, hx(0xb02020)); I.set(12, 7, hx(0xb02020)); });
  def('chest_top', I => { I.fill((x, y) => pal(CHEST, clamp(nz(x, y, 238) * .5 + sn(x * .4, y, 4, 239) * .4, 0, .99))); for (let i = 1; i < 15; i++) { I.set(i, 1, hx(0x3a2611)); I.set(i, 14, hx(0x3a2611)); I.set(1, i, hx(0x3a2611)); I.set(14, i, hx(0x3a2611)); } });
  def('chest_bottom', I => I.copy(get('chest_top')));
  def('ender_chest_side', I => { I.fill((x, y) => pal(PH([0x0c1517, 0x142224, 0x1a2c2f, 0x223a3d]), nz(x, y, 240))); for (let x = 0; x < 16; x++) { I.set(x, 2, hx(0x2a5a5a)); I.set(x, 7, hx(0x2a5a5a)); I.set(x, 15, hx(0x2a5a5a)); } });
  def('ender_chest_front', I => { I.copy(get('ender_chest_side')); I.rect(7, 5, 8, 9, hx(0xd9d9a8)); });
  def('ender_chest_top', I => I.copy(get('ender_chest_side'))); def('ender_chest_bottom', I => I.copy(get('ender_chest_side')));
  def('barrel_side', I => { I.fill((x, y) => pal(PLANK.spruce.slice(1, 5), clamp(nz(x, y, 241) * .4 + sn(x, y * .3, 4, 242) * .5, 0, .99))); for (let y = 0; y < 16; y++) { I.set(5, y, hx(0x2f2014)); I.set(10, y, hx(0x2f2014)); } for (let x = 0; x < 16; x++) { I.set(x, 2, hx(0x5a5a5a)); I.set(x, 13, hx(0x5a5a5a)); } });
  def('barrel_top', I => { I.fill((x, y) => pal(PLANK.spruce.slice(1, 5), nz(x, y, 243))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x2f2014)); I.set(0, i, hx(0x2f2014)); I.set(i, 15, hx(0x2f2014)); I.set(15, i, hx(0x2f2014)); } for (let x = 1; x < 15; x++) I.set(x, 7, hx(0x3e2a1a)); I.rect(6, 6, 9, 9, hx(0x2a1c10)); });
  def('barrel_top_open', I => { I.copy(get('barrel_top')); I.rect(2, 2, 13, 13, hx(0x1a110a)); });
  def('barrel_bottom', I => I.copy(get('barrel_top')));
  def('bookshelf', I => { I.copy(get('oak_planks')); const BC = [0x6c1b1b, 0x1c3a6c, 0x2a5a1c, 0x7a5c18, 0x4c2c6c, 0x2c6c6c, 0x6c4c2c]; for (const y0 of [1, 9]) { I.rect(0, y0 - 1, 15, y0 - 1, hx(0x5c3f22)); let x = 1; while (x < 15) { const w = 1 + (nz(x, y0, 244) * 2.2 | 0), h = 5 + (nz(x, y0, 245) * 2 | 0), c = hx(BC[nz(x, y0, 246) * 7 | 0]); for (let i = 0; i < w && x < 15; i++, x++) for (let yy = y0 + 6 - h; yy < y0 + 6; yy++) I.set(x, yy, i === 0 ? shd(c, 1.2) : c); x++; } } });
  def('chiseled_bookshelf_empty', I => { I.copy(get('oak_planks')); I.rect(1, 1, 14, 6, hx(0x3e2a16)); I.rect(1, 9, 14, 14, hx(0x3e2a16)); });
  def('chiseled_bookshelf_side', I => I.copy(get('oak_planks')));
  def('chiseled_bookshelf_top', I => { I.copy(get('oak_planks')); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x5c3f22)); I.set(i, 15, hx(0x5c3f22)); } });
  def('enchanting_table_top', I => { I.fill((x, y) => pal(PH([0x7a1a1a, 0x8c1f1f, 0x9e2424]), nz(x, y, 247))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x2c2c3a)); I.set(0, i, hx(0x2c2c3a)); I.set(i, 15, hx(0x2c2c3a)); I.set(15, i, hx(0x2c2c3a)); } I.rect(4, 4, 11, 11, hx(0x6a1414)); });
  def('enchanting_table_side', I => { I.fill((x, y) => y < 4 ? pal(PH([0x7a1a1a, 0x9e2424]), nz(x, y, 248)) : pal(PH([0x14101e, 0x1d1529, 0x2a1d3c]), nz(x, y, 249))); I.set(3, 2, hx(0x5decf5)); I.set(12, 2, hx(0x5decf5)); });
  def('enchanting_table_bottom', I => I.copy(get('obsidian')));
  def('anvil', I => I.fill((x, y) => pal(PH([0x3d3d3d, 0x444444, 0x4b4b4b, 0x535353]), nz(x, y, 251))));
  def('anvil_top', I => { I.copy(get('anvil')); I.rect(4, 0, 11, 15, hx(0x5a5a5a)); for (let y = 0; y < 16; y++) { I.set(4, y, hx(0x6a6a6a)); I.set(11, y, hx(0x363636)); } });
  def('anvil_top_1', I => { I.copy(get('anvil_top')); crack(I, hx(0x262626), 2); }); def('anvil_top_2', I => { I.copy(get('anvil_top')); crack(I, hx(0x262626), 5); });
  def('grindstone_side', I => I.fill((x, y) => pal(PH([0x7a7a7a, 0x878787, 0x939393, 0xa0a0a0]), nz(x, y, 252))));
  def('grindstone_round', I => { I.copy(get('grindstone_side')); for (let x = 0; x < 16; x++) I.set(x, 0, hx(0x5a5a5a)); });
  def('grindstone_pivot', I => { I.copy(get('grindstone_side')); I.rect(5, 5, 10, 10, hx(0x6b4a28)); });
  def('smithing_table_top', I => { I.fill((x, y) => pal(PH([0x2f2f37, 0x3a3a44, 0x45454f]), nz(x, y, 253))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x5c3f22)); I.set(0, i, hx(0x5c3f22)); I.set(i, 15, hx(0x5c3f22)); I.set(15, i, hx(0x5c3f22)); } });
  def('smithing_table_side', I => { I.copy(get('dark_oak_planks')); I.rect(0, 0, 15, 3, hx(0x3a3a44)); I.rect(4, 7, 11, 9, hx(0x9a9a9a)); });
  def('smithing_table_front', I => { I.copy(get('smithing_table_side')); I.rect(3, 8, 12, 12, hx(0x7a5a3a)); });
  def('smithing_table_bottom', I => I.copy(get('dark_oak_planks')));
  def('fletching_table_top', I => { I.copy(get('birch_planks')); I.rect(2, 2, 13, 13, hx(0xc4b47f)); for (let i = 3; i < 13; i++) I.set(i, 15 - i, hx(0x7a6a40)); });
  def('fletching_table_side', I => { I.copy(get('birch_planks')); I.rect(0, 0, 15, 2, hx(0xd2c48f)); });
  def('fletching_table_front', I => { I.copy(get('fletching_table_side')); I.rect(5, 5, 10, 10, hx(0xeeeeee)); I.rect(7, 5, 8, 12, hx(0x6b4a28)); });
  def('cartography_table_top', I => { I.copy(get('dark_oak_planks')); I.rect(2, 2, 13, 13, hx(0xd9cfa8)); I.rect(4, 5, 8, 9, hx(0x6aa04a)); I.rect(9, 7, 12, 11, hx(0x3e7ad6)); });
  def('cartography_table_side1', I => { I.copy(get('dark_oak_planks')); I.rect(0, 0, 15, 2, hx(0xd9cfa8)); });
  def('cartography_table_side2', I => { I.copy(get('cartography_table_side1')); I.rect(4, 5, 11, 12, hx(0xd9cfa8)); });
  def('cartography_table_side3', I => { I.copy(get('cartography_table_side1')); I.rect(3, 4, 12, 11, hx(0xc9bf98)); });
  def('loom_front', I => { I.copy(get('oak_planks')); I.rect(2, 3, 13, 12, hx(0xe6e6e6)); for (let x = 2; x < 14; x += 2) I.rect(x, 3, x, 12, hx(0xc8c8c8)); });
  def('loom_side', I => { I.copy(get('oak_planks')); I.rect(0, 12, 15, 15, hx(0x6b4a28)); });
  def('loom_top', I => { I.copy(get('oak_planks')); I.rect(2, 6, 13, 9, hx(0xe6e6e6)); });
  def('loom_bottom', I => I.copy(get('oak_planks')));
  def('stonecutter_side', I => { I.copy(get('stone_bricks')); I.rect(0, 0, 15, 6, null); I.fill((x, y) => y < 7 ? [0, 0, 0, 0] : null); I.rect(0, 7, 15, 7, hx(0x9a9a9a)); });
  def('stonecutter_top', I => { I.copy(get('smooth_stone')); I.rect(7, 1, 8, 14, hx(0x3a3a3a)); });
  def('stonecutter_bottom', I => I.copy(get('smooth_stone')));
  def('stonecutter_saw', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 15.5); return d < 6.5 && y > 8 ? (d > 5.4 ? ((x & 1) ? [150, 150, 150] : [210, 210, 210]) : [180, 180, 180]) : null; }));
  def('lectern_sides', I => { I.copy(get('oak_planks')); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x5c3f22)); I.set(15, y, hx(0x5c3f22)); } });
  def('lectern_front', I => { I.copy(get('lectern_sides')); I.rect(5, 2, 10, 13, hx(0x9a7a4a)); });
  def('lectern_base', I => { I.copy(get('oak_planks')); I.rect(0, 0, 15, 0, hx(0x5c3f22)); });
  def('lectern_top', I => { I.copy(get('oak_planks')); I.rect(1, 1, 14, 14, hx(0xb89060)); });
  def('composter_side', I => { I.copy(get('oak_planks')); for (let y = 0; y < 16; y++) { I.set(0, y, hx(0x5c3f22)); I.set(15, y, hx(0x5c3f22)); } I.rect(0, 0, 15, 1, hx(0x5c3f22)); });
  def('composter_top', I => I.copy(get('oak_planks'))); def('composter_bottom', I => I.copy(get('oak_planks')));
  def('composter_compost', I => I.fill((x, y) => pal(PH([0x4a3a20, 0x5a4a28, 0x6a5a30, 0x587a2a]), nz(x, y, 254))));
  def('composter_ready', I => { I.copy(get('composter_compost')); for (let k = 0; k < 10; k++) I.set(nz(k, 1, 9) * 16 | 0, nz(k, 2, 9) * 16 | 0, hx(0xe6e0c8)); });
  const IRN = PH([0x3a3a3a, 0x444444, 0x4e4e4e, 0x585858]);
  def('cauldron_side', I => { I.fill((x, y) => pal(IRN, nz(x, y, 255))); for (let x = 0; x < 16; x++) { I.set(x, 0, hx(0x6a6a6a)); I.set(x, 1, hx(0x2a2a2a)); } I.rect(4, 12, 11, 15, [0, 0, 0, 0]); });
  def('cauldron_top', I => { I.fill((x, y) => pal(IRN, nz(x, y, 256))); I.rect(2, 2, 13, 13, [0, 0, 0, 0]); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x6a6a6a)); I.set(0, i, hx(0x6a6a6a)); } });
  def('cauldron_inner', I => I.fill((x, y) => pal(PH([0x2a2a2a, 0x323232, 0x3a3a3a]), nz(x, y, 257))));
  def('cauldron_bottom', I => I.copy(get('cauldron_inner')));
  def('brewing_stand', I => I.fill((x, y) => x >= 7 && x <= 8 && y >= 2 ? hx(x === 7 ? 0xd6b440 : 0xa08020) : (y === 2 && x > 1 && x < 14) || ((x === 2 || x === 13) && y > 2 && y < 6) ? hx(0x6a6a6a) : null));
  def('brewing_stand_base', I => I.copy(get('cobblestone')));
  def('beacon', I => { I.fill((x, y) => pal(PH([0x7ae0dc, 0x9cf0ec, 0xc4fffc]), nz(x, y, 258))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x4ab0ac)); I.set(0, i, hx(0x4ab0ac)); I.set(i, 15, hx(0x4ab0ac)); I.set(15, i, hx(0x4ab0ac)); } });
  def('conduit', I => I.fill((x, y) => pal(PH([0x6b5636, 0x8a7046, 0x9e8452, 0x5a8aa8]), nz(x, y, 259))));
  def('bell_body', I => I.fill((x, y) => pal(PH([0xb88a1f, 0xd8a72a, 0xf0c63a, 0xffe16a]), clamp(nz(x, y, 261) * .5 + (x < 4 ? .3 : 0), 0, .99))));
  def('campfire_log', I => I.fill((x, y) => y < 4 || y > 11 ? pal(BARK.oak, nz(x, y, 262)) : pal(PLANK.oak.slice(1, 4), nz(x, y, 263))));
  def('campfire_log_lit', I => { I.copy(get('campfire_log')); I.fill((x, y) => nz(x, y, 264) > .6 ? hx(0xf28c1c) : null); });
  def('lantern', I => { I.fill((x, y) => { if (y >= 2 && y < 9 && x < 6) { const e = x === 0 || x === 5 || y === 2 || y === 8; return e ? hx(0x3a3a46) : hx(0xffd050); } if (y >= 9 && y < 15 && x < 6) return (x === 0 || x === 5 || y === 9 || y === 14) ? hx(0x3a3a46) : hx(0x4a4a56); if (y < 2 && x >= 1 && x < 5) return hx(0x3a3a46); return null; }); });
  def('soul_lantern', I => { I.copy(get('lantern')); I.fill((x, y) => { const c = I.get(x, y); return c[3] && c[0] > 200 ? hx(0x70e0e8) : null; }); });
  def('copper_lantern', I => { I.copy(get('lantern')); I.fill((x, y) => { const c = I.get(x, y); return c[3] && c[0] < 80 ? hx(0xb4684d) : null; }); });
  def('chain', I => I.fill((x, y) => (x === 1 && (y % 4) !== 3) || ((x === 0 || x === 2) && (y % 4) === 1) ? hx(0x3d4458) : (x === 4 && (y % 4) !== 1) ? hx(0x2e3446) : null));
  def('torch', I => I.fill((x, y) => { if ((x !== 7 && x !== 8) || y < 6) return null; if (y === 6) return x === 7 ? [255, 252, 190] : [255, 226, 110]; if (y === 7) return x === 7 ? [255, 214, 84] : [255, 170, 40]; return x === 7 ? [138, 104, 58] : [104, 76, 44]; }));
  def('soul_torch', I => I.fill((x, y) => { if ((x !== 7 && x !== 8) || y < 6) return null; if (y === 6) return x === 7 ? [210, 255, 255] : [130, 230, 240]; if (y === 7) return x === 7 ? [90, 210, 220] : [40, 160, 180]; return x === 7 ? [138, 104, 58] : [104, 76, 44]; }));
  def('copper_torch', I => I.fill((x, y) => { if ((x !== 7 && x !== 8) || y < 6) return null; if (y === 6) return x === 7 ? [220, 255, 200] : [150, 230, 140]; if (y === 7) return x === 7 ? [110, 220, 110] : [60, 170, 80]; return x === 7 ? [138, 104, 58] : [104, 76, 44]; }));
  def('redstone_torch', I => I.fill((x, y) => { if ((x !== 7 && x !== 8) || y < 6) return null; if (y === 6) return x === 7 ? [255, 110, 90] : [220, 40, 30]; if (y === 7) return x === 7 ? [255, 60, 40] : [180, 20, 10]; return x === 7 ? [138, 104, 58] : [104, 76, 44]; }));
  def('redstone_torch_off', I => I.fill((x, y) => { if ((x !== 7 && x !== 8) || y < 6) return null; if (y < 8) return x === 7 ? [110, 40, 40] : [80, 24, 24]; return x === 7 ? [138, 104, 58] : [104, 76, 44]; }));
  def('end_rod', I => I.fill((x, y) => x < 2 && y < 15 ? [245, 240, 225] : x >= 2 && x < 6 && y >= 2 && y < 6 ? [200, 180, 220] : x >= 2 && x < 4 && y < 2 ? [255, 255, 245] : null));
  def('ladder', I => I.fill((x, y) => (x === 2 || x === 3 || x === 12 || x === 13) ? pal(PLANK.oak.slice(0, 3), x & 1 ? .3 : .8) : (y % 4 === 1 && x > 1 && x < 14) ? pal(PLANK.oak.slice(1, 4), nz(x, y, 265)) : null));
  def('scaffolding_side', I => I.fill((x, y) => x < 2 || x > 13 || y < 2 || y > 13 || Math.abs(x - y) < 1.5 ? pal(PLANK.bamboo.slice(1, 5), nz(x, y, 266)) : null));
  def('scaffolding_top', I => I.fill((x, y) => x < 2 || x > 13 || y < 2 || y > 13 || x === 7 || x === 8 ? pal(PLANK.bamboo.slice(1, 5), nz(x, y, 267)) : y % 3 === 0 ? pal(PLANK.bamboo.slice(0, 3), nz(x, y, 268)) : null));
  def('scaffolding_bottom', I => I.copy(get('scaffolding_top')));
  def('jukebox_side', I => { I.copy(get('oak_planks')); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x3a2611)); I.set(0, i, hx(0x3a2611)); I.set(i, 15, hx(0x3a2611)); I.set(15, i, hx(0x3a2611)); } I.rect(1, 1, 14, 2, hx(0x5c3f22)); });
  def('jukebox_top', I => { I.copy(get('jukebox_side')); I.rect(3, 5, 12, 10, hx(0x222222)); I.rect(3, 7, 12, 8, hx(0x0e0e0e)); });
  def('note_block', I => { I.copy(get('jukebox_side')); I.rect(4, 4, 11, 11, hx(0x2a1c10)); for (let y = 5; y < 11; y += 2) I.rect(5, y, 10, y, hx(0x4a3020)); });
  def('flower_pot', I => I.fill((x, y) => pal(PH([0x74392a, 0x82412f, 0x8f4835, 0x9c523c]), nz(x, y, 269))));
  def('decorated_pot_side', I => { I.fill((x, y) => pal(PH([0x8a4a33, 0x96523a, 0xa25a40]), nz(x, y, 271))); I.rect(3, 5, 12, 10, hx(0x6a3424)); });
  def('decorated_pot_top', I => I.copy(get('flower_pot'))); def('decorated_pot_bottom', I => I.copy(get('flower_pot'))); def('decorated_pot_neck', I => I.copy(get('flower_pot')));
  def('tnt_side', I => { I.fill((x, y) => y >= 5 && y <= 10 ? [236, 236, 236] : pal(PH([0xa8261b, 0xbd3125, 0xd23b2c]), clamp(nz(x, y, 272) * .5 + (x % 4 === 0 ? -.3 : .4), 0, .99))); I.tmpl(['.....', 'k.k.k', '.....'], {}); const T = [[2, 6, 'TNT']]; const glyph = { T: ['###', '.#.', '.#.', '.#.'], N: ['#..#', '##.#', '#.##', '#..#'] }; let x = 2; for (const ch of 'TNT') { const g = glyph[ch]; g.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') I.set(x + i, 6 + j, [30, 30, 30]); })); x += g[0].length + 1; } void T; });
  def('tnt_top', I => { I.fill((x, y) => pal(PH([0xa8261b, 0xbd3125, 0xd23b2c]), nz(x, y, 273))); I.rect(6, 6, 9, 9, hx(0xd8d4c4)); I.set(7, 7, hx(0x2a2a2a)); });
  def('tnt_bottom', I => I.fill((x, y) => pal(PH([0xa8261b, 0xbd3125, 0xd23b2c]), nz(x, y, 274))));
  def('cake_top', I => I.fill((x, y) => x === 0 || y === 0 || x === 15 || y === 15 ? null : pal(PH([0xe6e0dc, 0xf0ebe7, 0xfaf6f3]), nz(x, y, 275)) && ((x * 7 + y * 3) % 11 === 0 ? hx(0xd82020) : pal(PH([0xe6e0dc, 0xf0ebe7, 0xfaf6f3]), nz(x, y, 275)))));
  def('cake_side', I => I.fill((x, y) => x === 0 || x === 15 || y < 8 ? null : y < 10 ? pal(PH([0xe6e0dc, 0xfaf6f3]), nz(x, y, 276)) : pal(PH([0xa0602e, 0xb06c34, 0xc0783a]), nz(x, y, 277))));
  def('cake_inner', I => I.fill((x, y) => x === 0 || x === 15 || y < 8 ? null : y < 10 ? hx(0xf0ebe7) : y === 12 ? hx(0xd82020) : pal(PH([0xc89060, 0xd8a070]), nz(x, y, 278))));
  def('cake_bottom', I => I.fill((x, y) => x === 0 || y === 0 || x === 15 || y === 15 ? null : hx(0xa0602e)));
  def('redstone_lamp', I => { I.fill((x, y) => pal(PH([0x4a2a14, 0x5a341a, 0x6a3e20]), nz(x, y, 279))); I.fill((x, y) => (x % 5 === 2 || y % 5 === 2) ? hx(0x2a180c) : null); });
  def('redstone_lamp_on', I => { I.fill((x, y) => pal(PH([0xc68a3c, 0xe0a850, 0xf8d080, 0xffe8b0]), nz(x, y, 281))); I.fill((x, y) => (x % 5 === 2 || y % 5 === 2) ? hx(0x8a5a2a) : null); });
  def('redstone_dust_dot', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5); return d < 3 ? [255 * (.75 + nz(x, y, 282) * .25), 255 * (.75 + nz(x, y, 282) * .25), 255 * (.75 + nz(x, y, 282) * .25)] : null; }).mark());
  def('redstone_dust_line0', I => I.fill((x, y) => Math.abs(x - 7.5) < 1.6 ? [235 * (.8 + nz(x, y, 283) * .2), 235 * (.8 + nz(x, y, 283) * .2), 235 * (.8 + nz(x, y, 283) * .2)] : null).mark());
  def('redstone_dust_line1', I => I.fill((x, y) => Math.abs(y - 7.5) < 1.6 ? [235 * (.8 + nz(x, y, 284) * .2), 235 * (.8 + nz(x, y, 284) * .2), 235 * (.8 + nz(x, y, 284) * .2)] : null).mark());
  def('repeater', I => { I.copy(get('smooth_stone')); I.rect(7, 2, 8, 13, hx(0x6a1010)); });
  def('repeater_on', I => { I.copy(get('smooth_stone')); I.rect(7, 2, 8, 13, hx(0xe02010)); });
  def('comparator', I => { I.copy(get('smooth_stone')); I.rect(7, 2, 8, 6, hx(0x6a1010)); I.rect(3, 9, 12, 10, hx(0x6a1010)); });
  def('comparator_on', I => { I.copy(get('smooth_stone')); I.rect(7, 2, 8, 6, hx(0xe02010)); I.rect(3, 9, 12, 10, hx(0xe02010)); });
  def('daylight_detector_top', I => { I.fill((x, y) => pal(PH([0x9a8a6a, 0xaa9a7a]), nz(x, y, 285))); I.fill((x, y) => x > 0 && x < 15 && y > 0 && y < 15 && ((x - 1) % 5 !== 4 && (y - 1) % 5 !== 4) ? pal(PH([0x4a6aa0, 0x5a7ab0, 0x7a9ad0]), nz(x, y, 286)) : null); });
  def('daylight_detector_inverted_top', I => { I.copy(get('daylight_detector_top')); I.tint([200, 160, 160]); });
  def('daylight_detector_side', I => { I.copy(get('oak_planks')); I.fill((x, y) => y < 10 ? [0, 0, 0, 0] : null); });
  def('observer_front', I => { I.copy(get('furnace_side')); I.rect(3, 4, 6, 7, hx(0x2a2a2a)); I.rect(9, 4, 12, 7, hx(0x2a2a2a)); I.rect(4, 5, 5, 6, hx(0x8a8a8a)); I.rect(10, 5, 11, 6, hx(0x8a8a8a)); I.rect(4, 10, 11, 12, hx(0x3a3a3a)); });
  def('observer_side', I => { I.copy(get('furnace_side')); I.rect(1, 6, 14, 9, hx(0x4a4a4a)); });
  def('observer_top', I => { I.copy(get('furnace_top')); I.rect(6, 2, 9, 13, hx(0x6a1010)); });
  def('observer_back', I => { I.copy(get('furnace_side')); I.rect(6, 6, 9, 9, hx(0x4a0a0a)); });
  def('observer_back_on', I => { I.copy(get('furnace_side')); I.rect(6, 6, 9, 9, hx(0xff2010)); });
  def('piston_side', I => { I.fill((x, y) => y < 4 ? pal(PLANK.oak.slice(1, 4), nz(x, y, 287)) : pal(FS, nz(x, y, 288))); for (let x = 0; x < 16; x++) I.set(x, 4, hx(0x4a4a4a)); I.rect(6, 4, 9, 15, hx(0x9a9a9a)); });
  def('piston_top', I => { I.copy(get('oak_planks')); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x5c5c5c)); I.set(0, i, hx(0x5c5c5c)); I.set(i, 15, hx(0x5c5c5c)); I.set(15, i, hx(0x5c5c5c)); } I.rect(6, 6, 9, 9, hx(0x7a7a7a)); });
  def('piston_top_sticky', I => { I.copy(get('piston_top')); I.rect(2, 2, 13, 13, hx(0x7cc06a)); I.rect(4, 4, 11, 11, hx(0x6aae58)); });
  def('piston_bottom', I => { I.copy(get('furnace_side')); I.rect(6, 6, 9, 9, hx(0x2a2a2a)); });
  def('tripwire_hook', I => I.fill((x, y) => (x === 7 || x === 8) && y < 12 ? hx(0x8a8a8a) : x >= 5 && x <= 10 && y >= 1 && y <= 3 ? hx(0xa0a0a0) : null));
  def('lever', I => I.fill((x, y) => (x === 7 || x === 8) && y >= 6 ? (y < 8 ? [140, 130, 120] : [120, 90, 50]) : null));
  def('lightning_rod', I => I.fill((x, y) => x < 2 ? pal(COPC[0], nz(x, y, 289)) : x >= 2 && x < 6 && y < 4 ? pal(COPC[0].slice(2), nz(x, y, 290)) : null));
  const railT = (n, c, on) => I => { I.fill((x, y) => (x === 2 || x === 3 || x === 12 || x === 13) ? hx(x & 1 ? 0x6a6a6a : 0x9a9a9a) : (y % 4 === 1 && x > 0 && x < 15) ? pal(PLANK.oak.slice(0, 3), nz(x, y, 291)) : null); if (c) for (let y = 0; y < 16; y++) { I.set(2, y, c); I.set(13, y, c); } if (on) for (let y = 1; y < 16; y += 4) I.rect(6, y, 9, y, on); };
  def('rail', railT()); def('rail_corner', I => I.fill((x, y) => { const d = Math.hypot(x - 15.5, y - 15.5); return Math.abs(d - 13) < 1 || Math.abs(d - 3) < 1 ? hx(0x8a8a8a) : (Math.round(Math.atan2(15.5 - y, 15.5 - x) * 4) % 2 === 0 && d > 3 && d < 13) ? pal(PLANK.oak.slice(0, 3), nz(x, y, 292)) : null; }));
  def('powered_rail', railT('powered_rail', hx(0xd8b030), hx(0x5a1010))); def('powered_rail_on', railT('powered_rail', hx(0xf0d040), hx(0xff2010)));
  def('detector_rail', railT('detector_rail', null, hx(0x6a3a3a))); def('detector_rail_on', railT('detector_rail', null, hx(0xff3030)));
  def('activator_rail', railT('activator_rail', null, hx(0x6a3a3a))); def('activator_rail_on', railT('activator_rail', null, hx(0xd02010)));
  for (let c = 0; c <= 4; c++) def('respawn_anchor_side' + c, I => { I.copy(get('crying_obsidian')); for (let k = 0; k < c; k++) I.rect(2 + k * 3, 12, 3 + k * 3, 14, hx(0xffd04a)); });
  def('respawn_anchor_top', I => { I.copy(get('crying_obsidian')); I.rect(3, 3, 12, 12, hx(0xb04aff)); I.rect(5, 5, 10, 10, hx(0xe8a0ff)); });
  def('respawn_anchor_top_off', I => { I.copy(get('obsidian')); I.rect(3, 3, 12, 12, hx(0x1a1424)); });
  def('respawn_anchor_bottom', I => I.copy(get('obsidian')));
  def('lodestone_side', I => { I.copy(get('chiseled_stone_bricks')); I.rect(0, 0, 15, 3, hx(0x4a4a4e)); });
  def('lodestone_top', I => { I.copy(get('smooth_stone')); I.rect(4, 4, 11, 11, hx(0x4a4a4e)); I.rect(6, 6, 9, 9, hx(0x7a7a80)); });
  def('spawner', I => I.fill((x, y) => (x % 4 === 0 || y % 4 === 0) ? pal(PH([0x1c2a38, 0x243446, 0x2e4256]), nz(x, y, 293)) : null));
  def('trial_spawner_side', I => I.fill((x, y) => (x % 5 === 0 || y % 5 === 0 || x === 15 || y === 15) ? pal(PH([0x3a3a3e, 0x4a4a4e, 0x5a5a5e]), nz(x, y, 294)) : (x + y) % 5 === 2 ? hx(0xd07a2a) : null));
  def('trial_spawner_top', I => I.copy(get('trial_spawner_side'))); def('trial_spawner_bottom', I => I.copy(get('trial_spawner_side')));
  for (const k of ['front', 'side', 'top', 'bottom']) def('vault_' + k, I => { I.fill((x, y) => (x % 5 === 0 || y % 5 === 0 || x === 15 || y === 15) ? pal(PH([0x3a3a3e, 0x4a4a4e, 0x5a5a5e]), nz(x, y, 295)) : null); if (k === 'front') I.rect(6, 6, 9, 9, hx(0xd0a02a)); });
  for (const k of ['east', 'west', 'north', 'south', 'top', 'bottom']) def('crafter_' + k, I => { I.copy(get('furnace_side')); if (k === 'top') { I.rect(3, 3, 12, 12, hx(0x7a5a3a)); I.rect(5, 5, 10, 10, hx(0x2a2a2a)); } else if (k === 'north') { I.rect(4, 4, 11, 11, hx(0x2a2a2a)); } else I.rect(5, 5, 10, 10, hx(0x8a3a3a)); });
  def('heavy_core', I => I.fill((x, y) => pal(PH([0x3a3c44, 0x44474f, 0x4f525a, 0x5a5d66]), nz(x, y, 296))));
  def('end_portal_frame_side', I => { I.copy(get('end_stone')); I.rect(0, 0, 15, 3, hx(0x3a6a5a)); I.rect(0, 0, 15, 0, hx(0x2a5a4a)); });
  def('end_portal_frame_top', I => { I.copy(get('end_stone')); I.fill((x, y) => x < 2 || x > 13 || y < 2 || y > 13 ? hx(0x3a6a5a) : null); I.rect(4, 4, 11, 11, hx(0x2a4a3a)); });
  def('end_portal_frame_eye', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5); return d < 4 ? (d < 1.5 ? [20, 30, 20] : [50, 140, 90]) : null; }));
  def('beehive_side', I => { I.copy(get('oak_planks')); I.rect(0, 0, 15, 2, hx(0xc8a050)); });
  def('beehive_end', I => { I.copy(get('oak_planks')); I.rect(2, 2, 13, 13, hx(0x9a7040)); });
  def('beehive_front', I => { I.copy(get('beehive_side')); I.rect(6, 7, 9, 9, hx(0x1a1008)); });
  def('beehive_front_honey', I => { I.copy(get('beehive_front')); I.rect(5, 10, 10, 12, hx(0xf0a820)); });
  def('bee_nest_side', I => I.fill((x, y) => pal(PH([0xc8a04a, 0xd8b058, 0xe6c066, 0xb08840]), clamp(nz(x, y, 297) * .5 + (y % 4 === 0 ? -.3 : .2), 0, .99))));
  def('bee_nest_top', I => { I.copy(get('bee_nest_side')); I.rect(4, 4, 11, 11, hx(0x8a6a2a)); });
  def('bee_nest_bottom', I => I.copy(get('bee_nest_top')));
  def('bee_nest_front', I => { I.copy(get('bee_nest_side')); I.rect(6, 7, 9, 9, hx(0x2a1a08)); });
  def('bee_nest_front_honey', I => { I.copy(get('bee_nest_front')); I.rect(5, 10, 10, 12, hx(0xf0a820)); });
  def('dragon_egg', I => I.fill((x, y) => pal(PH([0x0c0814, 0x160e22, 0x22162f, 0x40205a]), nz(x, y, 298))));
  for (const k of ['', '_dormant', '_awake']) def('creaking_heart' + k, I => { I.copy(get('pale_oak_log')); I.rect(5, 5, 10, 10, k === '_awake' ? hx(0xff8a20) : k === '_dormant' ? hx(0x8a5020) : hx(0x3a3330)); });
  def('creaking_heart_top', I => I.copy(get('pale_oak_log_top')));
  def('command_block_side', I => { I.fill((x, y) => pal(PH([0xa87a5a, 0xb8886a, 0xc8987a]), nz(x, y, 299))); I.rect(4, 4, 11, 11, hx(0x6a6a6a)); });
  def('command_block_front', I => { I.copy(get('command_block_side')); I.rect(5, 5, 10, 10, hx(0x2a2a2a)); });
  def('command_block_back', I => I.copy(get('command_block_side')));
  def('nether_portal', I => I.fill((x, y) => { const v = sn(x, y, 4, 301) * .6 + nz(x, y, 302) * .4; return [80 + v * 80, 10 + v * 30, 160 + v * 90, 190]; }));
  def('nether_wart_block', I => I.fill((x, y) => pal(PH([0x6a0808, 0x7c0c0c, 0x8e1010, 0x9e1414]), clamp(nz(x, y, 303) * .6 + sn(x, y, 4, 304) * .4, 0, .99))));
  def('warped_wart_block', I => I.fill((x, y) => pal(PH([0x166a6a, 0x187a78, 0x1a8a86, 0x1e9a94]), clamp(nz(x, y, 305) * .6 + sn(x, y, 4, 306) * .4, 0, .99))));
  for (const n of ['crimson', 'warped']) { const top = n === 'crimson' ? PH([0x7a0c0c, 0x8e1010, 0xa01818, 0xb02020]) : PH([0x166a6a, 0x187a78, 0x1d8f84, 0x23a090]); def(n + '_nylium', I => I.fill((x, y) => pal(top, clamp(nz(x, y, 307) * .6 + sn(x, y, 4, 308) * .4, 0, .99)))); def(n + '_nylium_side', I => { I.copy(get('netherrack')); const R = I.R; for (let x = 0; x < 16; x++) { const d = 2 + (R() * 3 | 0); for (let y = 0; y < d; y++) I.set(x, y, pal(top, nz(x, y, 309))); } }); }
  def('cinnabar', I => field(I, PH([0x7a1e1a, 0x8e2620, 0xa02e26, 0xb2382e, 0x6a1a16, 0xc04a3a]), 0, { p: 5, sw: .45, nw: .55 }));
  def('polished_cinnabar', polished(PH([0x9a2a22, 0xa22e26, 0xaa342a]), hx(0xc44a3c), hx(0x6a1a16)));
  def('cinnabar_bricks', I => bricks(I, PH([0x8e2620, 0x9a2a22, 0xa62f26, 0xb2382e]), hx(0x5a1612), 8, 4, 4, { bevel: 1 }));
  def('chiseled_cinnabar', I => { I.copy(get('polished_cinnabar')); I.rect(4, 4, 11, 11, hx(0x6a1a16)); I.rect(5, 5, 10, 10, hx(0xc44a3c)); I.rect(7, 7, 8, 8, hx(0x6a1a16)); });
  def('sulfur', I => field(I, PH([0xb0a43a, 0xc2b544, 0xd2c54e, 0xe0d45c, 0x9c9030, 0xeadf72]), 0, { p: 5, sw: .45, nw: .55 }));
  def('polished_sulfur', polished(PH([0xc8bb48, 0xcfc24e, 0xd6c954]), hx(0xece07a), hx(0x968a2c)));
  def('sulfur_bricks', I => bricks(I, PH([0xbcae42, 0xc6b84a, 0xd0c252, 0xdacc5a]), hx(0x867a26), 8, 4, 4, { bevel: 1 }));
  def('chiseled_sulfur', I => { I.copy(get('polished_sulfur')); I.rect(4, 4, 11, 11, hx(0x968a2c)); I.rect(5, 5, 10, 10, hx(0xece07a)); I.rect(7, 7, 8, 8, hx(0x968a2c)); });
  def('potent_sulfur', I => { I.copy(get('sulfur')); I.fill((x, y) => sn(x, y, 4, 311) > .62 ? pal(PH([0xf8f0a0, 0xfff8c8]), nz(x, y, 312)) : null); });
  def('resin_block', I => I.fill((x, y) => pal(PH([0xb85a14, 0xd06c18, 0xe27e22, 0xf0922e, 0xfaaa44]), clamp(nz(x, y, 313) * .6 + sn(x, y, 4, 314) * .4, 0, .99))));
  def('resin_bricks', I => bricks(I, PH([0xc8641a, 0xd6701e, 0xe27c24, 0xec882a]), hx(0x8a400c), 8, 4, 4, { bevel: 1 }));
  def('chiseled_resin_bricks', I => { I.copy(get('resin_bricks')); I.rect(4, 4, 11, 11, hx(0x8a400c)); I.rect(5, 5, 10, 10, hx(0xf09a3a)); });
  def('prismarine', I => I.fill((x, y) => pal(PH([0x4d8a7c, 0x5a9a8a, 0x63a796, 0x6eb5a4, 0x7ec2b2, 0x8f9fb8]), clamp(nz(x, y, 315) * .55 + sn(x, y, 4, 316) * .45, 0, .99))));
  def('prismarine_bricks', I => bricks(I, PH([0x5aa898, 0x63b2a1, 0x6cbcab, 0x76c6b5]), hx(0x3c7a6c), 8, 4, 4, { bevel: 1 }));
  def('dark_prismarine', I => bricks(I, PH([0x2e5245, 0x355c4e, 0x3c6656, 0x43705f]), hx(0x1e3a30), 16, 8, 8, { bevel: 1 }));
  def('sea_lantern', I => { I.fill((x, y) => pal(PH([0xa8c8c0, 0xc4dcd4, 0xdcece6, 0xf0f8f4]), nz(x, y, 317))); for (let i = 0; i < 16; i++) { I.set(i, 0, hx(0x7aa8a0)); I.set(0, i, hx(0x7aa8a0)); I.set(i, 15, hx(0x7aa8a0)); I.set(15, i, hx(0x7aa8a0)); } I.rect(5, 5, 10, 10, hx(0xffffff)); });
  def('magma', I => I.fill((x, y) => { const v = sn(x, y, 4, 318) * .6 + nz(x, y, 319) * .4; return v > .62 ? pal(PH([0xe0601a, 0xf8902a, 0xffc050]), (v - .62) * 2.5) : pal(PH([0x3a1a10, 0x4a2014, 0x5a2818]), v * 1.5); }));
  def('end_rod_dummy', I => I.copy(get('end_rod')));
  const WATERF = [], LAVAF = [];
  function waterFrame(f, flow) { const d = new Uint8ClampedArray(1024), P8 = Math.PI / 8; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const yy = flow ? y - f : y; const w = Math.sin(x * P8 * 2 + f * P8 + Math.sin(yy * P8 * 2 + f * P8) * 1.3) * .6 + Math.sin(yy * P8 * 2 - f * P8 * 2 + x * P8) * .4; const k = .78 + w * .1 + hash3(x, (yy & 15), 7) * .06; const o = (y * 16 + x) * 4; d[o] = 180 * k; d[o + 1] = 190 * k; d[o + 2] = 210 * k; d[o + 3] = 150; } return d; }
  function lavaFrame(f, flow) { const d = new Uint8ClampedArray(1024); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const yy = flow ? (y - f) & 15 : y; const v = sn(x + Math.sin(f * .39 + yy * .4) * 1.5, yy + Math.cos(f * .39 + x * .4) * 1.5, 4, 321) * .7 + hash3(x, yy, 322) * .3; const c = pal(PH([0xa82e08, 0xc8400c, 0xe05a12, 0xf07a1c, 0xfa9a2a, 0xffc040]), clamp(v, 0, .99)); const o = (y * 16 + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; } return d; }
  const ANIMP = {
    water_still: f => waterFrame(f, 0), water_flow: f => waterFrame(f, 1), lava_still: f => lavaFrame(f, 0), lava_flow: f => lavaFrame(f, 1),
    fire_0: f => fireFrame(f, 0, 0), fire_1: f => fireFrame(f, 1, 0), soul_fire_0: f => fireFrame(f, 0, 1), soul_fire_1: f => fireFrame(f, 1, 1),
    campfire_fire: f => fireFrame(f, 0, 0), soul_campfire_fire: f => fireFrame(f, 0, 1),
    sea_lantern: f => { const I = from('sea_lantern'); const k = .9 + Math.sin(f / 16 * 6.283) * .08; I.mul(k); return I.d; },
    magma: f => { const I = from('magma'); I.mul(.85 + Math.sin(f / 16 * 6.283) * .15); return I.d; },
    prismarine: f => { const I = from('prismarine'); const t = [1 + Math.sin(f / 16 * 6.283) * .08, 1, 1 + Math.cos(f / 16 * 6.283) * .08]; I.tint([255 * t[0] * .95, 255, 255 * t[2]]); return I.d; },
    nether_portal: f => { const I = Img(1); I.fill((x, y) => { const v = sn(x + f * .5, y - f * .3, 4, 301) * .6 + hash3(x, y, f) * .4; return [80 + v * 80, 10 + v * 30, 160 + v * 90, 190]; }); return I.d; },
    kelp: f => kelpFrame(f, 1), kelp_plant: f => kelpFrame(f, 0), seagrass: f => grassFrame(f, 0x3a8a2a), tall_seagrass_top: f => grassFrame(f, 0x3a8a2a), tall_seagrass_bottom: f => grassFrame(f + 3, 0x3a8a2a),
    lantern: f => get('lantern'), soul_lantern: f => get('soul_lantern'), copper_lantern: f => get('copper_lantern'), stonecutter_saw: f => { const I = from('stonecutter_saw'); return I.d; },
    command_block_front: () => get('command_block_front'), warped_stem: () => get('warped_stem_s'), crimson_stem: () => get('crimson_stem_s'),
    respawn_anchor_top: () => get('respawn_anchor_top'), sculk: () => get('sculk_s'), sculk_vein: () => get('sculk_vein_s'), sculk_catalyst_top_bloom: () => get('sculk_catalyst_top'), beacon_beam: () => get('beacon'), firefly_bush_emissive: () => get('firefly_bush'), sulfur_spring: () => get('sulfur')
  };
  PAINT.warped_stem_s = PAINT.warped_stem; PAINT.crimson_stem_s = PAINT.crimson_stem; PAINT.sculk_s = PAINT.sculk; PAINT.sculk_vein_s = PAINT.sculk_vein;
  function fireFrame(f, alt, soul) {
    const d = new Uint8ClampedArray(1024);
    const P = soul ? PH([0x0a6a7a, 0x2aa8b8, 0x6ae0e8, 0xc8ffff]) : PH([0xa82a04, 0xe0600a, 0xf8a020, 0xffe060]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const yy = y + f, base = sn(x + alt * 5, yy * 1.3, 4, 331 + alt) * .7 + hash3(x, yy & 15, 332 + alt) * .3;
      const h = (15 - y) / 16, v = base - h * .9 + .35 - Math.abs(x - 7.5) * .02;
      if (v < .2) continue;
      const c = pal(P, clamp((v - .2) * 1.6, 0, .99)), o = (y * 16 + x) * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    return d;
  }
  function kelpFrame(f, tip) { const I = Img(9); I.fill((x, y) => { const sx = Math.sin((y + f) * .4) * 1.5; return Math.abs(x - 7.5 - sx) < (tip && y < 6 ? 1.2 : 2.2) ? pal(PH([0x3a6a1a, 0x4a8a22, 0x5aa02a]), hash3(x, y, 333)) : (Math.abs(x - 4 - sx) < 1 && y % 5 === 2) ? hx(0x5aa02a) : null; }); return I.d; }
  function grassFrame(f, col) { const I = Img(10); const c = hx(col); for (let k = 0; k < 6; k++) { let x = 2 + k * 2.3; for (let y = 15; y > 2 + (k % 3) * 2; y--) { const sx = Math.round(x + Math.sin((y + f) * .35 + k) * 1.2); I.set(sx, y, shd(c, .7 + (15 - y) / 30)); } } return I.d; }
  const FLOWER_T = {
    dandelion: { c: [0xfee437, 0xe4b70e, 0xffff8a], shape: 'round' }, golden_dandelion: { c: [0xf8c820, 0xd89a08, 0xfff080], shape: 'round' }, poppy: { c: [0xd8231c, 0x9e130f, 0xff5a4a], shape: 'cup', ctr: 0x2a2a14 }, blue_orchid: { c: [0x2aa8e8, 0x1a78b8, 0x7ad4ff], shape: 'star' }, allium: { c: [0xb560d8, 0x8a40b0, 0xd890f0], shape: 'ball' },
    azure_bluet: { c: [0xe8ecf2, 0xb8c0d0, 0xffffff], shape: 'small', ctr: 0xe8d84a }, red_tulip: { c: [0xd83020, 0xa01810, 0xff6050], shape: 'tulip' }, orange_tulip: { c: [0xf07a20, 0xc05010, 0xffaa50], shape: 'tulip' }, white_tulip: { c: [0xe8ecec, 0xb8c0c0, 0xffffff], shape: 'tulip' }, pink_tulip: { c: [0xf0a0c0, 0xc87090, 0xffd0e0], shape: 'tulip' },
    oxeye_daisy: { c: [0xf0f0f0, 0xc8c8c8, 0xffffff], shape: 'daisy', ctr: 0xe8c820 }, cornflower: { c: [0x4a6ae0, 0x2a3ab0, 0x8aa8ff], shape: 'star' }, lily_of_the_valley: { c: [0xf8f8f8, 0xd0d0d0, 0xffffff], shape: 'bells' }, torchflower: { c: [0xf09030, 0xc06020, 0xffd060], shape: 'torch' }, wither_rose: { c: [0x2a2a26, 0x141412, 0x4a4a44], shape: 'cup', ctr: 0x0a0a0a },
    open_eyeblossom: { c: [0xf8a030, 0xc06a10, 0xffe0a0], shape: 'eye' }, closed_eyeblossom: { c: [0x8a8a92, 0x5a5a62, 0xb0b0b8], shape: 'closed' }, cactus_flower: { c: [0xf080b0, 0xc85080, 0xffb0d0], shape: 'cup' }
  };
  const STEM = [hx(0x3a7a1a), hx(0x2a5e12), hx(0x52a028)];
  function drawFlower(I, F) {
    const [a, b2, c] = F.c.map(hx);
    for (let y = 7; y < 16; y++) I.set(7 + (y > 12 ? 0 : 0), y, STEM[y % 3 === 0 ? 1 : 0]);
    I.set(6, 12, STEM[2]); I.set(5, 11, STEM[2]); I.set(8, 13, STEM[2]); I.set(9, 12, STEM[0]); I.set(6, 13, STEM[1]);
    const S = F.shape;
    if (S === 'round') { I.rect(5, 3, 9, 7, a); I.rect(6, 2, 8, 8, a); I.set(5, 3, null); I.rect(6, 4, 8, 6, b2); I.set(6, 3, c); I.set(7, 3, c); }
    else if (S === 'cup') { I.rect(5, 4, 9, 7, a); I.rect(4, 3, 4, 5, a); I.rect(10, 3, 10, 5, a); I.rect(6, 3, 8, 3, c); I.set(7, 5, hx(F.ctr)); I.set(7, 6, b2); I.rect(5, 7, 9, 7, b2); }
    else if (S === 'star') { for (const [x, y] of [[7, 2], [7, 3], [5, 4], [6, 4], [8, 4], [9, 4], [6, 5], [7, 5], [8, 5], [5, 6], [9, 6], [7, 6], [6, 7], [8, 7]]) I.set(x, y, a); I.set(7, 4, c); I.set(7, 5, b2); }
    else if (S === 'ball') { I.fill((x, y) => Math.hypot(x - 7, y - 4.5) < 3 ? (nz(x, y, 341) > .6 ? c : nz(x, y, 342) > .3 ? a : b2) : null); }
    else if (S === 'small') { for (const [x, y] of [[5, 5], [9, 5], [7, 3], [6, 7], [8, 7], [4, 8], [10, 8]]) { I.set(x, y, a); I.set(x, y - 1, c); I.set(x + 1, y, b2); } I.set(7, 4, hx(F.ctr)); }
    else if (S === 'tulip') { I.rect(5, 3, 9, 7, a); I.set(5, 3, null); I.set(9, 3, null); I.set(7, 3, null); I.rect(6, 6, 8, 7, b2); I.set(6, 4, c); }
    else if (S === 'daisy') { I.fill((x, y) => { const d = Math.hypot(x - 7, y - 4.5); return d < 1.2 ? hx(F.ctr) : d < 3.2 ? ((x + y) % 2 ? a : c) : null; }); }
    else if (S === 'bells') { for (const [x, y] of [[5, 4], [9, 3], [6, 7], [10, 6]]) { I.set(x, y, a); I.set(x, y + 1, c); I.set(x + 1, y, b2); } I.set(7, 2, STEM[0]); I.set(8, 2, STEM[0]); }
    else if (S === 'torch') { I.rect(6, 3, 8, 7, a); I.set(7, 2, c); I.set(7, 4, c); I.rect(5, 6, 9, 7, b2); }
    else if (S === 'eye') { I.rect(4, 3, 10, 7, a); I.rect(5, 4, 9, 6, c); I.rect(6, 4, 8, 6, hx(0x2a1a0a)); I.set(7, 5, hx(0xffffff)); }
    else if (S === 'closed') { I.rect(6, 3, 8, 7, a); I.rect(6, 6, 8, 7, b2); I.set(7, 3, c); }
  }
  for (const n in FLOWER_T) def(n, I => drawFlower(I, FLOWER_T[n]));
  const grassBlades = (I, P, n, hmax, seed, lean) => { const R = rng(seed); for (let k = 0; k < n; k++) { let x = 1 + (R() * 14 | 0); const h = 4 + (R() * hmax | 0), l = R() < .5 ? -1 : 1; for (let i = 0; i < h; i++) { if (i > h * .5 && R() < (lean || .35)) x = clamp(x + l, 0, 15); I.set(x, 15 - i, pal(P, clamp(i / h * .8 + R() * .2, 0, .99))); } } };
  const GP = PH([0x4e4e4e, 0x6a6a6a, 0x868686, 0xa2a2a2, 0xbebebe]);
  def('short_grass', I => { grassBlades(I, GP, 15, 10, 351); I.mark(); });
  def('fern', I => { for (let y = 2; y < 16; y++) { const w = Math.round((16 - y) * .45 + 1); for (let x = 8 - w; x <= 7 + w; x++) if ((x + y) % 2 === 0 || Math.abs(x - 7.5) < 1) I.set(x, y, pal(GP, clamp(.3 + nz(x, y, 352) * .6, 0, .99))); } I.mark(); });
  def('bush', I => { I.fill((x, y) => Math.hypot(x - 7.5, (y - 9) * 1.3) < 7 && nz(x, y, 353) > .2 ? pal(GP, nz(x, y, 354)) : null); I.mark(); });
  def('tall_grass_bottom', I => { grassBlades(I, GP, 18, 14, 355, .15); I.fill((x, y) => y > 8 && nz(x, y, 356) > .6 && x > 2 && x < 13 ? pal(GP, .5) : null); I.mark(); });
  def('tall_grass_top', I => { grassBlades(I, GP, 12, 10, 357); I.mark(); });
  def('large_fern_bottom', I => { I.copy(get('fern')); });
  def('large_fern_top', I => { for (let y = 0; y < 16; y++) { const w = Math.round(y * .4 + 1); for (let x = 8 - w; x <= 7 + w; x++) if ((x + y) % 2 === 0 || Math.abs(x - 7.5) < 1) I.set(x, y, pal(GP, clamp(.3 + nz(x, y, 358) * .6, 0, .99))); } I.mark(); });
  const DRY = PH([0x8a6a3a, 0xa07d46, 0xb89254, 0xcca664]);
  def('dead_bush', I => { const R = rng(359); const br = (x, y, dx, n) => { for (let i = 0; i < n; i++) { I.set(Math.round(x), y, pal(PH([0x6a4a20, 0x7e5a2a, 0x946c34]), R())); x += dx; y--; } }; br(7, 15, 0, 5); br(7, 11, -.6, 7); br(8, 11, .6, 7); br(7, 9, -.2, 6); br(8, 8, .9, 4); });
  def('short_dry_grass', I => grassBlades(I, DRY, 14, 7, 361));
  def('tall_dry_grass', I => grassBlades(I, DRY, 16, 13, 362));
  def('red_shrub', I => { I.fill((x, y) => Math.hypot(x - 7.5, (y - 10) * 1.4) < 6.5 && nz(x, y, 363) > .25 ? pal(PH([0x7a1414, 0x9a1c18, 0xb82820, 0xd03a2a]), nz(x, y, 364)) : null); for (let y = 12; y < 16; y++) I.set(7, y, hx(0x5a3a1a)); });
  def('firefly_bush', I => { I.fill((x, y) => Math.hypot(x - 7.5, (y - 9) * 1.2) < 7 && nz(x, y, 365) > .25 ? pal(PH([0x2a4a14, 0x3a5e1c, 0x4a7224]), nz(x, y, 366)) : null); for (const [x, y] of [[3, 4], [11, 3], [6, 8], [12, 9]]) I.set(x, y, hx(0xfff080)); });
  def('brown_mushroom', I => { I.rect(7, 10, 8, 15, hx(0xd8ccb8)); I.rect(4, 7, 11, 9, hx(0x9a7254)); I.rect(5, 6, 10, 6, hx(0xb08866)); I.rect(4, 9, 11, 9, hx(0x7a5a40)); });
  def('red_mushroom', I => { I.rect(7, 10, 8, 15, hx(0xd8ccb8)); I.rect(5, 5, 10, 9, hx(0xd82a1c)); I.rect(4, 7, 11, 9, hx(0xd82a1c)); I.set(6, 6, hx(0xffffff)); I.set(9, 7, hx(0xffffff)); I.set(5, 8, hx(0xffffff)); });
  def('crimson_fungus', I => { I.rect(7, 9, 8, 15, hx(0xe8c8a0)); I.rect(4, 5, 11, 8, hx(0xa81818)); I.set(5, 6, hx(0xf8a020)); I.set(10, 7, hx(0xf8a020)); });
  def('warped_fungus', I => { I.rect(7, 9, 8, 15, hx(0xe8c8a0)); I.rect(4, 5, 11, 8, hx(0x1a9a8a)); I.set(5, 6, hx(0xf8a020)); I.set(10, 7, hx(0xf8a020)); });
  def('crimson_roots', I => grassBlades(I, PH([0x7a0c0c, 0x9a1414, 0xb82020]), 12, 9, 367));
  def('warped_roots', I => grassBlades(I, PH([0x167a72, 0x1a9a8a, 0x22b4a2]), 12, 9, 368));
  def('nether_sprouts', I => grassBlades(I, PH([0x167a72, 0x1a9a8a]), 10, 4, 369));
  def('sweet_berry_bush_stage0', I => grassBlades(I, PH([0x2a5a1a, 0x3a6e22, 0x4a822a]), 6, 4, 371));
  def('sweet_berry_bush_stage1', I => grassBlades(I, PH([0x2a5a1a, 0x3a6e22, 0x4a822a]), 12, 8, 372));
  def('sweet_berry_bush_stage2', I => { I.copy(get('sweet_berry_bush_stage1')); grassBlades(I, PH([0x2a5a1a, 0x3a6e22, 0x4a822a]), 8, 11, 373); for (const [x, y] of [[4, 8], [10, 6], [7, 11]]) I.set(x, y, hx(0x5a8a2a)); });
  def('sweet_berry_bush_stage3', I => { I.copy(get('sweet_berry_bush_stage2')); for (const [x, y] of [[4, 8], [10, 6], [7, 11], [12, 10], [3, 12]]) { I.set(x, y, hx(0xc81a2a)); I.set(x + 1, y, hx(0xa01020)); } });
  def('hanging_roots', I => { const R = rng(374); for (let k = 0; k < 7; k++) { let x = 2 + k * 2; for (let y = 0; y < 6 + R() * 9; y++) { I.set(x, y, pal(PH([0x7a5a40, 0x8e6a4c, 0xa07a58]), R())); if (R() < .2) x += R() < .5 ? 1 : -1; } } });
  def('spore_blossom', I => { I.fill((x, y) => Math.hypot(x - 7.5, y - 7.5) < 7 && (Math.atan2(y - 7.5, x - 7.5) * 6 / 3.14159 + 12) % 2 < 1.2 ? pal(PH([0xc85aa0, 0xe07ab8, 0xf09ad0]), nz(x, y, 375)) : null); I.rect(6, 6, 9, 9, hx(0x5a8a2a)); });
  def('pink_petals', I => { const R = rng(376); for (let k = 0; k < 9; k++) { const x = R() * 14 | 0, y = R() * 14 | 0; I.set(x, y, hx(0xf0a8c8)); I.set(x + 1, y, hx(0xe090b8)); I.set(x, y + 1, hx(0xd880a8)); } for (let k = 0; k < 4; k++) I.set(R() * 16 | 0, R() * 16 | 0, hx(0x3a7a1a)); });
  def('wildflowers', I => { const R = rng(377); for (let k = 0; k < 9; k++) { const x = R() * 14 | 0, y = R() * 14 | 0; const c = [0xfee437, 0xf8f8f8, 0xb070e0][k % 3]; I.set(x, y, hx(c)); I.set(x + 1, y + 1, hx(0x3a7a1a)); } });
  def('leaf_litter', I => { const R = rng(378); for (let k = 0; k < 14; k++) { const x = R() * 14 | 0, y = R() * 14 | 0; const c = pal(PH([0x8a5a20, 0xa06a28, 0xb87a30, 0x6a4a1a]), R()); I.set(x, y, c); I.set(x + 1, y, c); I.set(x, y + 1, shd(c, .85)); } });
  def('pale_hanging_moss', I => { const R = rng(379); for (let k = 0; k < 6; k++) { const x = 2 + k * 2.4 | 0; for (let y = 0; y < 16; y++) if (R() < .85) I.set(x + (R() < .2 ? 1 : 0), y, pal(PH([0x8a9284, 0x9aa294, 0xaab2a4]), R())); } });
  def('pale_hanging_moss_tip', I => { const R = rng(380); for (let k = 0; k < 6; k++) { const x = 2 + k * 2.4 | 0, h = 6 + R() * 8; for (let y = 0; y < h; y++) I.set(x, y, pal(PH([0x8a9284, 0x9aa294, 0xaab2a4]), R())); } });
  for (const w of WOODS) {
    if (w.bamboo || w.nether) continue;
    const n = w.n, leafC = n === 'cherry' ? PH([0xdb88b0, 0xe89fc2, 0xf3b5d1]) : n === 'pale_oak' ? PH([0x8f968c, 0xa1a89e, 0xb3b9b0]) : n === 'poplar' ? PH([0xc25d14, 0xd9721c, 0xe88a29]) : n === 'birch' ? PH([0x6a8a3a, 0x80a755, 0x96bc6a]) : n === 'spruce' ? PH([0x3a6a3a, 0x4e824e, 0x619961]) : PH([0x2e6a1a, 0x3e8424, 0x52a030]);
    def(n + '_sapling', I => { const trunk = BARK[n] || BARK.oak; for (let y = 9; y < 16; y++) I.set(7, y, trunk[2]); I.set(8, 12, trunk[1]); if (n === 'spruce') { for (let y = 2; y < 12; y++) { const w2 = Math.round((y - 1) * .4); for (let x = 7 - w2; x <= 7 + w2; x++) if ((x + y) % 2 === 0 || x === 7) I.set(x, y, pal(leafC, nz(x, y, 381))); } } else I.fill((x, y) => Math.hypot(x - 7.5, (y - 6) * 1.2) < 5 && nz(x, y, 382) > .2 ? pal(leafC, nz(x, y, 383)) : null); });
  }
  def('mangrove_propagule', I => { I.rect(7, 4, 8, 15, hx(0x5a8a2a)); I.rect(6, 1, 9, 4, hx(0x6aa030)); I.set(7, 15, hx(0x8a4a2a)); });
  def('azalea_top', I => I.copy(get('azalea_leaves'))); def('azalea_side', I => I.copy(get('azalea_leaves')));
  def('flowering_azalea_top', I => I.copy(get('flowering_azalea_leaves'))); def('flowering_azalea_side', I => I.copy(get('flowering_azalea_leaves')));
  def('azalea_plant', I => { for (let y = 0; y < 16; y++) { I.set(7, y, pal(BARK.oak, nz(7, y, 384))); if (y % 4 === 0) { I.set(6, y, BARK.oak[2]); I.set(9, y + 1, BARK.oak[2]); } } });
  def('sugar_cane', I => { for (const x of [3, 7, 11]) for (let y = 0; y < 16; y++) { I.set(x, y, y % 5 === 0 ? hx(0x6a6a6a) : hx(0xa0a0a0)); I.set(x + 1, y, y % 5 === 0 ? hx(0x5a5a5a) : hx(0x888888)); if (y % 5 === 1 && x !== 7) I.set(x - 1, y, hx(0x9a9a9a)); } I.mark(); });
  def('vine', I => { I.fill((x, y) => { const v = sn(x, y, 4, 385); return v > .5 && nz(x, y, 386) > .3 ? pal(GP, nz(x, y, 387)) : null; }); I.mark(); });
  def('glow_lichen', I => I.fill((x, y) => sn(x, y, 4, 388) > .55 ? (nz(x, y, 389) > .8 ? hx(0xb8f0c8) : pal(PH([0x6a8a7a, 0x7a9a8a, 0x8aaa9a]), nz(x, y, 390))) : null));
  def('lily_pad', I => { I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5), a = Math.atan2(y - 7.5, x - 7.5); return d < 7.4 && !(a > -.4 && a < 0 && d > 1) ? pal(GP, clamp(nz(x, y, 391) * .5 + (d > 6.5 ? -.2 : .3), 0, .99)) : null; }); I.mark(); });
  def('seagrass', I => I.copy(ANIMP.seagrass(0)));
  def('tall_seagrass_top', I => I.copy(ANIMP.seagrass(2))); def('tall_seagrass_bottom', I => I.copy(ANIMP.seagrass(5)));
  def('kelp', I => I.copy(kelpFrame(0, 1))); def('kelp_plant', I => I.copy(kelpFrame(0, 0)));
  const CORC = { tube: [0x3058d8, 0x2040b0, 0x5a80f0], brain: [0xd860a8, 0xb04888, 0xf088c8], bubble: [0xa830b8, 0x80208f, 0xc860d8], fire: [0xd83a2a, 0xb02820, 0xf06050], horn: [0xd8c040, 0xb09a2a, 0xf0d860] };
  for (const k in CORC) {
    const [a, b2, c] = CORC[k].map(hx), D = PH([0x7a7470, 0x8a8480, 0x9a9490]);
    for (const dead of [0, 1]) {
      const P = dead ? D : [b2, a, c], p = dead ? 'dead_' + k : k;
      def(p + '_coral_block', I => I.fill((x, y) => pal(P, clamp(nz(x, y, 392) * .6 + sn(x, y, 4, 393) * .4, 0, .99))));
      def(p + '_coral', I => { const R = rng(hstr(p)); const br = (x, y, dx, n) => { for (let i = 0; i < n; i++) { I.set(Math.round(x), y, pal(P, R())); I.set(Math.round(x) + 1, y, pal(P, R())); x += dx; y--; } }; br(7, 15, 0, 6); br(6, 11, -.7, 6); br(8, 11, .7, 6); br(7, 8, 0, 6); });
      def(p + '_coral_fan', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 15); return d < 8 && y > 6 && (Math.atan2(15 - y, x - 7.5) * 5 % 1 > .4) ? pal(P, nz(x, y, 394)) : null; }));
    }
  }
  def('sea_pickle', I => I.fill((x, y) => x < 4 && y >= 4 && y < 10 ? pal(PH([0x5a7a2a, 0x6a8a32, 0x7a9a3a]), nz(x, y, 395)) : x >= 4 && x < 8 && y < 4 ? hx(0x8aaa4a) : x >= 8 && x < 12 && y < 4 ? hx(0x6a8a32) : null));
  def('pointed_dripstone_down_tip', I => I.fill((x, y) => Math.abs(x - 7.5) < (16 - y) * .25 ? pal(PH([0x7a5f4f, 0x866a59, 0x947663]), nz(x, y, 396)) : null));
  def('pointed_dripstone_up_tip', I => I.fill((x, y) => Math.abs(x - 7.5) < y * .25 ? pal(PH([0x7a5f4f, 0x866a59, 0x947663]), nz(x, y, 397)) : null));
  for (const [n, h, w, P] of [['small_amethyst_bud', 3, 3, 0], ['medium_amethyst_bud', 4, 4, 0], ['large_amethyst_bud', 5, 5, 0], ['amethyst_cluster', 7, 7, 0]]) def(n, I => I.fill((x, y) => { const dx = Math.abs(x - 7.5); return y >= 16 - h * 2 && dx < w * (1 - (16 - y) / (h * 2.4)) ? pal(PH([0x7550a8, 0x9b77d1, 0xcdb3f2, 0xffffff]), clamp(nz(x, y, 398) * .5 + (dx < 1 ? .4 : 0), 0, .99)) : null; }));
  const cropDraw = (I, stage, max, P, fruit) => { const h = 3 + Math.round(stage / max * 11); const R = rng(400 + stage); for (let k = 0; k < 4; k++) { let x = 2 + k * 4; for (let y = 15; y > 15 - h; y--) { I.set(x, y, pal(P, clamp((15 - y) / h * .7 + R() * .3, 0, .99))); if (R() < .3) x += R() < .5 ? 1 : -1; x = clamp(x, 0, 15); } if (fruit && stage === max) { I.set(x, 15 - h, fruit); I.set(x + 1, 16 - h, fruit); } } };
  for (let s = 0; s < 8; s++) def('wheat_stage' + s, I => { const P = s < 7 ? PH([0x2a6a14, 0x3a8a1c, 0x5aa02a, 0x8ab040]) : PH([0x8a7a2a, 0xa8902e, 0xc8aa3a, 0xe0c45a]); cropDraw(I, s, 7, P, s === 7 ? hx(0xd8b448) : null); });
  for (let s = 0; s < 4; s++) { def('carrots_stage' + s, I => cropDraw(I, s, 3, PH([0x2a6a14, 0x3a8a1c, 0x5aa02a]), s === 3 ? hx(0xf08a20) : null)); def('potatoes_stage' + s, I => cropDraw(I, s, 3, PH([0x2a6a14, 0x3a8a1c, 0x5aa02a]), s === 3 ? hx(0xc8a050) : null)); def('beetroots_stage' + s, I => cropDraw(I, s, 3, PH([0x2a6a14, 0x3a8a1c, 0x5aa02a]), s === 3 ? hx(0xa02030) : null)); }
  for (let s = 0; s < 2; s++) def('torchflower_crop_stage' + s, I => cropDraw(I, s + 1, 3, PH([0x2a6a14, 0x3a8a1c]), s ? hx(0xf09030) : null));
  for (let s = 0; s < 3; s++) def('nether_wart_stage' + s, I => cropDraw(I, s + 1, 3, PH([0x6a0c10, 0x8a1418, 0xa82024])));
  def('stem', I => { for (let y = 0; y < 16; y++) { I.set(7, y, pal(GP, .6)); if (y % 4 === 1) { I.set(6, y, pal(GP, .4)); I.set(9, y - 1, pal(GP, .4)); } } I.mark(); });
  def('attached_stem', I => { for (let y = 6; y < 16; y++) I.set(7, y, pal(GP, .6)); for (let x = 7; x < 16; x++) I.set(x, 6 - Math.round((x - 7) * .3), pal(GP, .6)); I.mark(); });
  for (let a = 0; a < 3; a++) def('cocoa_stage' + a, I => I.fill((x, y) => { const c = a === 2 ? PH([0x8a4a20, 0xa05a2a, 0xb86a34]) : a === 1 ? PH([0x9a7a3a, 0xb08a42, 0xc89a4a]) : PH([0x7a8a3a, 0x8a9a42, 0x9aaa4a]); return pal(c, nz(x, y, 401 + a)); }));
  def('mushroom_stem_dummy', I => I.copy(get('mushroom_stem')));
  def('shelf_mushroom_top', I => I.fill((x, y) => pal(PH([0xb08050, 0xc89060, 0xd8a470, 0xe8b880]), clamp(nz(x, y, 402) * .5 + (y % 3 === 0 ? -.2 : .2), 0, .99))));
  def('shelf_mushroom_bottom', I => I.fill((x, y) => pal(PH([0xe0d4b8, 0xe8dcc4, 0xf0e6d0]), nz(x, y, 403))));
  def('shelf_mushroom_side', I => I.fill((x, y) => pal(PH([0x9a6a3a, 0xb08050, 0xc89060]), nz(x, y, 404))));
  def('shelf_mushroom', I => { I.rect(3, 7, 12, 9, hx(0xc89060)); I.rect(5, 6, 10, 6, hx(0xd8a470)); I.rect(3, 9, 12, 10, hx(0xe8dcc4)); });
  def('straw_bed_top', I => I.copy(get('hay_block_top')));
  def('straw_bed_top_head', I => { I.copy(get('hay_block_top')); I.rect(2, 1, 13, 5, hx(0xe8d8a0)); });
  def('straw_bed_side', I => I.fill((x, y) => y > 10 ? pal(PH([0x9a7d16, 0xb59520, 0xc9a72b]), nz(x, y, 405)) : null));
  def('farmland_side_dummy', I => I.copy(get('dirt')));
  for (const [tx, P] of [['skeleton', [200, 200, 194]], ['wither_skeleton', [40, 40, 42]], ['zombie', [92, 142, 66]], ['steve', [200, 140, 100]], ['creeper', [90, 180, 70]], ['piglin', [230, 160, 150]], ['dragon', [30, 30, 36]]]) {
    def('head_' + tx + '_side', I => I.fill((x, y) => shd(P, .9 + nz(x, y, 406) * .12)));
    def('head_' + tx + '_top', I => I.fill((x, y) => shd(tx === 'steve' ? [70, 46, 24] : P, .95 + nz(x, y, 407) * .1)));
    def('head_' + tx + '_back', I => I.fill((x, y) => shd(tx === 'steve' ? [70, 46, 24] : P, .85 + nz(x, y, 408) * .1)));
    def('head_' + tx + '_front', I => { I.fill((x, y) => shd(P, .92 + nz(x, y, 409) * .1)); if (tx === 'creeper') { I.rect(4, 4, 6, 6, [10, 10, 10]); I.rect(9, 4, 11, 6, [10, 10, 10]); I.rect(6, 7, 9, 9, [10, 10, 10]); I.rect(5, 9, 6, 12, [10, 10, 10]); I.rect(9, 9, 10, 12, [10, 10, 10]); } else if (tx.includes('skeleton')) { I.rect(4, 6, 6, 8, [20, 20, 20]); I.rect(9, 6, 11, 8, [20, 20, 20]); I.rect(4, 12, 11, 12, [60, 60, 60]); } else { I.rect(4, 8, 5, 9, [255, 255, 255]); I.rect(10, 8, 11, 9, [255, 255, 255]); I.set(5, 9, [40, 40, 120]); I.set(10, 9, [40, 40, 120]); if (tx === 'steve') I.rect(0, 0, 15, 3, [70, 46, 24]); } });
  }
  def('missing', I => I.fill((x, y) => ((x >> 3) + (y >> 3)) & 1 ? [248, 0, 248] : [0, 0, 0]));
  const tallBottom = (P) => I => { grassBlades(I, PH([0x2a6a14, 0x3a8a1c, 0x4e9a26]), 10, 13, 501, .15); for (let y = 0; y < 16; y++) I.set(7, y, hx(0x3a7a1a)); };
  def('sunflower_bottom', I => { for (let y = 0; y < 16; y++) I.set(7, y, hx(0x3a7a1a)); for (const [x, y] of [[5, 6], [6, 6], [9, 10], [10, 10], [4, 12], [11, 4]]) I.set(x, y, hx(0x4e9a26)); });
  def('sunflower_top', I => { for (let y = 6; y < 16; y++) I.set(7, y, hx(0x3a7a1a)); I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 5); return d < 2 ? hx(0x5a3a10) : d < 4.6 ? pal(PH([0xe8b818, 0xf8d030, 0xffe860]), nz(x, y, 502)) : null; }); });
  def('sunflower_front', I => I.fill((x, y) => { const d = Math.hypot(x - 7.5, y - 7.5); return d < 3 ? pal(PH([0x3a2408, 0x5a3a10, 0x7a5018]), nz(x, y, 503)) : d < 7 && (Math.atan2(y - 7.5, x - 7.5) * 4 % 1.2 < .9 || d < 5) ? pal(PH([0xe8b818, 0xf8d030, 0xffe860]), nz(x, y, 504)) : null; }));
  const bushFlower = (c1, c2, base) => I => { I.fill((x, y) => Math.hypot(x - 7.5, (y - 8) * 1.1) < 7 && nz(x, y, 505) > .2 ? pal(PH([0x2a6a14, 0x3a8a1c, 0x4e9a26]), nz(x, y, 506)) : null); const R = rng(hstr(base)); for (let k = 0; k < 10; k++) { const x = 2 + R() * 12 | 0, y = 1 + R() * 10 | 0; I.set(x, y, hx(c1)); I.set(x + 1, y, hx(c2)); I.set(x, y + 1, hx(c2)); } };
  def('lilac_top', bushFlower(0xc890d8, 0xa868b8, 'lilac')); def('lilac_bottom', tallBottom());
  def('rose_bush_top', bushFlower(0xd82020, 0xa01010, 'rose')); def('rose_bush_bottom', I => { tallBottom()(I); for (const [x, y] of [[4, 4], [10, 7]]) { I.set(x, y, hx(0xd82020)); I.set(x + 1, y, hx(0xa01010)); } });
  def('peony_top', bushFlower(0xf0b0d0, 0xd890b8, 'peony')); def('peony_bottom', tallBottom());
  def('pitcher_plant_top', I => { I.fill((x, y) => y > 6 && Math.abs(x - 7.5) < 3 + (y - 6) * .2 ? pal(PH([0x2a7a8a, 0x3a9aaa, 0x5ab8c8]), nz(x, y, 507)) : null); I.fill((x, y) => y <= 6 && y > 1 && Math.abs(x - 7.5) < (7 - y) * .8 ? pal(PH([0x7a3aa8, 0x9a5ac8]), nz(x, y, 508)) : null); });
  def('pitcher_plant_bottom', I => { tallBottom()(I); I.fill((x, y) => y < 6 && Math.abs(x - 7.5) < 3 ? pal(PH([0x2a7a8a, 0x3a9aaa]), nz(x, y, 509)) : null); });
  const HOP = PH([0x3a3a3a, 0x444444, 0x4e4e4e, 0x585858]);
  def('hopper_outside', I => I.fill((x, y) => pal(HOP, nz(x, y, 510))));
  def('hopper_inside', I => I.fill((x, y) => pal(PH([0x222222, 0x2a2a2a, 0x323232]), nz(x, y, 511))));
  def('hopper_top', I => { I.fill((x, y) => pal(HOP, nz(x, y, 512))); I.rect(2, 2, 13, 13, [0, 0, 0, 0]); });
  def('i_resin_clump', I => spr(I, (x, y) => ell(x, y, 8, 9, 5, 4.4) + nz(x | 0, y | 0, 513) * .3 < 1.05 ? pal(PH([0xb85a14, 0xd06c18, 0xf0922e, 0xffc070]), clamp(.6 - (x - 8) * .07 - (y - 8) * .07, 0, .99)) : null));
  pat(/^(.+_leaves)_fast$/, (I, m) => { const f = PAINT[m[1]]; if (f) f(I, m[1], true); else I.copy(get(m[1])); });
  const DA = (x, y) => (x + 16 - y) * .7071, DB = (x, y) => (x - 16 + y) * .7071;
  const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
  const MAT = {
    wooden: PH([0x4a3418, 0x6b4c24, 0x8f6a35, 0xb08a4a, 0xc9a35e]), stone: PH([0x3c3c3c, 0x585858, 0x767676, 0x949494, 0xb0b0b0]), copper: PH([0x6a3020, 0x9c4e31, 0xc96a44, 0xe08a62, 0xf4b090]),
    iron: PH([0x444444, 0x8a8a8a, 0xc8c8c8, 0xe2e2e2, 0xffffff]), golden: PH([0x8a5a0a, 0xc89a10, 0xf0d030, 0xfcec6a, 0xfffaa8]), diamond: PH([0x0e5a5a, 0x1aa8a8, 0x33d8d0, 0x6af0e8, 0xc8fffa]), netherite: PH([0x1a161a, 0x3a333a, 0x4f474f, 0x655c64, 0x80777f]),
    leather: PH([0x4a2a14, 0x7a4a24, 0xa0623a, 0xc07a48, 0xd89060]), chainmail: PH([0x2a2a2a, 0x5a5a5a, 0x8a8a8a, 0xb0b0b0, 0xd0d0d0]), turtle: PH([0x1a4a1a, 0x2a6a2a, 0x3a8a3a, 0x5aa85a, 0x8ad08a])
  };
  const HAN = PH([0x3a2810, 0x5a3e1a, 0x7a5628, 0x9a7034]);
  function spr(I, f, edge) {
    const A = []; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) A.push(f(x + .5, y + .5, x, y));
    for (let i = 0; i < 256; i++) { const c = A[i]; if (!c) continue; I.set(i & 15, i >> 4, c); }
    if (edge !== false) { for (let i = 0; i < 256; i++) { if (!A[i]) continue; const x = i & 15, y = i >> 4; const out = x === 15 || y === 15 || !A[i + 1] || !A[i + 16]; const inn = x === 0 || y === 0 || !A[i - 1] || !A[i - 16]; if (out) I.set(x, y, shd(A[i], .62)); else if (inn) I.set(x, y, shd(A[i], 1.12).map(v => Math.min(255, v))); } }
    return I;
  }
  const head = (P, b, k) => pal(P, clamp(.5 - b * k, 0, .99));
  function toolSprite(I, kind, P) {
    spr(I, (x, y) => {
      const a = DA(x, y), b = DB(x, y);
      if (kind === 'pickaxe') { const d = Math.hypot(x - .5, y - 15.5); if (Math.abs(d - 13.2) < 1.35 && a > 9.5 && Math.abs(b) < 8.2) return pal(P, clamp(.62 + (d - 13.2) * .25 - Math.abs(b) * .03, 0, .99)); }
      if (kind === 'axe') { if (a > 12.2 && a < 20.8 && b < -.2 && b > -6.8 && (a - 16.5) ** 2 / 19 + (b + 3.4) ** 2 / 11 < 1.1) return pal(P, clamp(.65 + (b + 3.4) * .06 + (a - 16.5) * .03, 0, .99)); if (a > 15 && a < 19 && b > -.3 && b < 1.4) return pal(P, .3); }
      if (kind === 'shovel') { if (((a - 17.8) / 3.8) ** 2 + (b / 2.6) ** 2 < 1) return pal(P, clamp(.6 - b * .1 + (a - 17.8) * .04, 0, .99)); if (a > 13.4 && a < 14.6 && Math.abs(b) < 1.4) return pal(P, .25); }
      if (kind === 'hoe') { if (a > 15.5 && a < 20.5 && b < -.2 && b > -5.2 && a - 15.5 + (b + 5.2) * .15 > 0 && Math.abs(a - 18.6 + b * .05) < 1.3 + (b < -3 ? .2 : 0)) return pal(P, clamp(.6 - b * .03, 0, .99)); if (a > 16 && a < 19 && b >= -.2 && b < 1) return pal(P, .3); }
      if (kind === 'sword') { if (a > 7.2 && a < 21.6 && Math.abs(b) < Math.min(1.45, (22 - a) * .8)) return pal(P, clamp(Math.abs(b) < .5 ? .85 : b < 0 ? .65 : .4, 0, .99)); if (Math.abs(a - 6.4) < .9 && Math.abs(b) < 3.4) return pal(P.slice(0, 3), .7); if (a > 1.6 && a < 5.6 && Math.abs(b) < .75) return HAN[2]; if (a > .6 && a < 1.8 && Math.abs(b) < 1) return pal(P, .4); return null; }
      if (kind === 'spear') { if (a > 15 && a < 21.6 && Math.abs(b) < Math.min(1.6, (21.8 - a) * .55)) return pal(P, clamp(Math.abs(b) < .5 ? .85 : .5, 0, .99)); if (a > 14 && a < 15.2 && Math.abs(b) < 1.8) return pal(P, .3); if (Math.abs(b) < .75 && a > 1.5 && a < 14.2) return pal(HAN, b < 0 ? .75 : .45); return null; }
      if (Math.abs(b) < .75 && a > 2.2 && a < (kind === 'axe' ? 19.2 : kind === 'hoe' ? 18.6 : 15.8)) return pal(HAN, b < 0 ? .75 : .45);
      return null;
    });
  }
  for (const tn in TIERS) for (const k of ['sword', 'shovel', 'pickaxe', 'axe', 'hoe', 'spear']) def('i_' + tn + '_' + k, I => toolSprite(I, k, MAT[tn]));
  const ARMT = {
    helmet: ['................', '................', '....11111111....', '...1455555541...', '..145444444541..', '..143333333341..', '..142222222241..', '..141......141..', '..131......131..', '..121......121..', '...1........1...', '................', '................', '................', '................', '................'],
    chestplate: ['................', '..1111....1111..', '.145541..145541.', '.144441111444441', '.1433344443334 1', '..1333444433331.', '...13344443331..', '...13333333331..', '...13333333331..', '...13333333331..', '...13322223331..', '...13322223331..', '...12222222221..', '...11111111111..', '................', '................'],
    leggings: ['................', '...11111111111..', '...14444444441..', '...13333333331..', '...13331113331..', '...1333 1 3331..', '...1333 1 3331..', '...1333 1 3331..', '...1222 1 2221..', '...1222 1 2221..', '...1222 1 2221..', '...1222 1 2221..', '...1111 1 1111..', '................', '................', '................'],
    boots: ['................', '................', '................', '................', '................', '..1111....1111..', '..1441....1441..', '..1331....1331..', '..1331....1331..', '..13311..11331..', '.133331..133331.', '.122221..122221.', '.111111..111111.', '................', '................', '................']
  };
  for (const an in ARM) for (let i = 0; i < 4; i++) {
    const id = an + '_' + SLOTN[i], P = MAT[an];
    def('i_' + id, I => { const t = ARMT[SLOTN[i]].map(r => r.replace(/ /g, '.')); I.tmpl(t, { 1: shd(P[0], 1), 2: P[1], 3: P[2], 4: P[3], 5: P[4] }); if (an === 'chainmail') I.fill((x, y) => I.al(x, y) && (x + y) % 2 === 0 && I.get(x, y)[0] > 60 ? shd(I.get(x, y), .6) : null); });
  }
  def('i_turtle_helmet', I => { I.tmpl(ARMT.helmet, { 1: MAT.turtle[0], 2: MAT.turtle[1], 3: MAT.turtle[2], 4: MAT.turtle[3], 5: MAT.turtle[4] }); });
  def('i_elytra', I => spr(I, (x, y) => { const l = x < 8, dx = l ? 7.5 - x : x - 8.5; return dx < 7 && y > 1 && y < 15 && y > 2 + dx * .8 - 2 && dx < (y < 8 ? 7 : 7 - (y - 8) * .6) ? pal(PH([0x6a6a7a, 0x8a8a9a, 0xa8a8b8]), clamp(.4 + (y % 3 === 0 ? .3 : 0), 0, .99)) : null; }));
  def('i_wolf_armor', I => spr(I, (x, y) => ell(x, y, 8, 9, 6.5, 4.5) < 1 && !(ell(x, y, 8, 9, 4, 2.5) < 1) ? pal(PH([0x8a6a4a, 0xa88060, 0xc09878]), nz(x, y, 1)) : null));
  for (const h of ['leather', 'copper', 'iron', 'golden', 'diamond', 'netherite']) def('i_' + h + '_horse_armor', I => spr(I, (x, y) => { const P = MAT[h]; if (ell(x, y, 8, 9.5, 6.5, 3.5) < 1 && y > 7) return pal(P, .5 + (y < 9 ? .3 : 0)); if (x > 10 && x < 14 && y > 3 && y < 9) return pal(P, .6); if (x > 2 && x < 5 && y > 10 && y < 15) return pal(P, .4); if (x > 11 && x < 14 && y > 10 && y < 15) return pal(P, .4); return null; }));
  for (const h of ['copper', 'iron', 'golden', 'diamond', 'netherite']) def('i_' + h + '_nautilus_armor', I => spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); return d < 6.5 && d > 2 ? pal(MAT[h], clamp(.4 + Math.sin(Math.atan2(y - 8, x - 8) * 3) * .2 + (d > 5 ? .2 : 0), 0, .99)) : null; }));
  def('i_shield', I => spr(I, (x, y) => { if (x < 3 || x > 12 || y < 1 || y > 14) return null; if (y > 11 && Math.abs(x - 7.5) > (15 - y) * 1.5 + 1) return null; const e = x === 3 || x === 12 || y === 1; if (e) return hx(0x7a7a7a); if (x === 7 || x === 8) return hx(0x8a8a8a); return pal(PLANK.oak.slice(1, 5), nz(x, y, 2)); }));
  const bowS = (I, pull) => { spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); const cx = 11.3 - pull * .9; const arc = Math.abs(Math.hypot(a - cx - 4, b) - 5.6) < .95 && a < cx + 4.8; if (arc) return pal(HAN, clamp(.5 + Math.abs(b) * .05, 0, .99)); if (Math.abs(a - (cx - .4)) < .45 && Math.abs(b) < 5.4) return [220, 220, 220]; if (pull && Math.abs(b) < .5 && a > cx - 1 && a < cx + 6) return pal(HAN, .6); if (pull && a > cx + 5.5 && a < cx + 7.5 && Math.abs(b) < (cx + 7.5 - a) * .7) return [150, 150, 150]; return null; }, false); };
  def('i_bow', I => bowS(I, 0)); for (let p = 0; p < 3; p++) def('i_bow_pulling_' + p, I => bowS(I, p + 1));
  def('i_crossbow_standby', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .9 && a > 3 && a < 19) return pal(HAN, b < 0 ? .7 : .4); if (Math.abs(a - 14) < 1 && Math.abs(b) < 6.5) return pal(PH([0x5a5a5a, 0x8a8a8a, 0xb0b0b0]), .6); if (Math.abs(a - (14 - Math.abs(b) * .55)) < .4 && Math.abs(b) < 6) return [200, 200, 200]; return null; }));
  def('i_trident', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); const P = PH([0x3a6a6a, 0x5a9a9a, 0x8ac8c0, 0xb8f0e8]); if (Math.abs(b) < .7 && a > 1 && a < 17) return pal(P, b < 0 ? .7 : .4); if (a > 15.5 && a < 18 && Math.abs(b) < 3) return pal(P, .5); if ((Math.abs(b - 2.4) < .6 || Math.abs(b + 2.4) < .6 || Math.abs(b) < .6) && a > 16 && a < 21.5) return pal(P, .8); return null; }));
  def('i_mace', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .8 && a > 2 && a < 15) return pal(PH([0x3a3a3a, 0x5a5a5a, 0x7a7a7a]), b < 0 ? .7 : .4); if (Math.hypot(a - 17.5, b) < 3.4) return pal(PH([0x5a5a6a, 0x7a7a8a, 0xa0a0b0, 0xc0c0d0]), clamp(.5 - b * .1, 0, .99)); return null; }));
  const arrowS = (I, tip, fl) => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (a > 17 && a < 21.6 && Math.abs(b) < (21.6 - a) * .55) return tip; if (Math.abs(b) < .55 && a > 3 && a < 18) return pal(HAN, .6); if (a > 2 && a < 6.5 && Math.abs(b) < 2.2 && Math.abs(b) > .5) return fl; return null; });
  def('i_arrow', I => arrowS(I, [150, 150, 150], [236, 236, 236])); def('i_spectral_arrow', I => arrowS(I, [240, 210, 60], [250, 230, 120])); def('i_tipped_arrow', I => arrowS(I, [190, 60, 200], [236, 236, 236]));
  def('i_wind_charge', I => spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); return d < 5.2 ? pal(PH([0x9ab8e0, 0xb8d0f0, 0xd8e8ff]), clamp(.5 + Math.sin(Math.atan2(y - 8, x - 8) * 3 + d) * .3, 0, .99)) : null; }));
  def('i_totem_of_undying', I => I.tmpl(['................', '.....111111.....', '....14444441....', '....14244241....', '....14444441....', '...1144114411...', '..133344443331..', '..13.144441.31..', '.....133331.....', '.....133331.....', '....11333311....', '....13311331....', '....131..131....', '....111..111....', '................', '................'], { 1: hx(0x7a5a10), 2: hx(0x2a8a3a), 3: hx(0xd0a020), 4: hx(0xf0d050) }));
  def('i_snowball', I => spr(I, (x, y) => ell(x, y, 8, 8.5, 5.5, 5.2) < 1 ? pal(PH([0xc8d8e0, 0xe0eef4, 0xf6fcff, 0xffffff]), clamp(.6 - (x - 8) * .06 - (y - 8) * .06 + nz(x | 0, y | 0, 3) * .2, 0, .99)) : null));
  const eggS = c => I => spr(I, (x, y) => ell(x, y, 8, 9, 4.6, 5.8) < 1 ? pal(PH(c), clamp(.6 - (x - 8) * .07 - (y - 9) * .04 + (nz(x | 0, y | 0, 4) > .88 ? -.3 : 0), 0, .99)) : null);
  def('i_egg', eggS([0xa89070, 0xd8c098, 0xecdcbc, 0xfaf0dc])); def('i_blue_egg', eggS([0x5a7aa8, 0x7a9ac8, 0x9ab8e0, 0xc0d8f4])); def('i_brown_egg', eggS([0x6a4428, 0x8a5c38, 0xa87448, 0xc08a5c]));
  def('i_ender_pearl', I => spr(I, (x, y) => { const d = ell(x, y, 8, 8, 5.4, 5.4); return d < 1 ? pal(PH([0x0a3a32, 0x105a4c, 0x1a7a66, 0x2aa088, 0x5ac8b0]), clamp(.5 - (x - 8) * .07 - (y - 8) * .07 + (d < .15 ? .3 : 0), 0, .99)) : null; }));
  def('i_ender_eye', I => spr(I, (x, y) => { const d = ell(x, y, 8, 8, 5.4, 5.4); if (d >= 1) return null; if (ell(x, y, 8, 8, 1.4, 2.6) < 1) return [20, 40, 20]; return pal(PH([0x2a6a30, 0x3a8a40, 0x6ab070, 0xa0d8a0]), clamp(.5 - (x - 8) * .06 - (y - 8) * .06, 0, .99)); }));
  def('i_flint_and_steel', I => { spr(I, (x, y) => { if (ell(x, y, 5.5, 10.5, 3.6, 3.8) < 1) return pal(PH([0x2a2a2e, 0x3e3e44, 0x56565c, 0x70707a]), clamp(.5 - (x - 5) * .1, 0, .99)); const d = Math.hypot(x - 10, y - 5.5); if (Math.abs(d - 3.6) < .9 && !(x < 9 && y > 6)) return pal(PH([0x6a6a6a, 0x9a9a9a, 0xc8c8c8]), .6); return null; }); });
  def('i_fire_charge', I => spr(I, (x, y) => { const d = ell(x, y, 8, 8, 5.2, 5.2); return d < 1 ? (nz(x | 0, y | 0, 5) > .6 ? pal(PH([0xf08a20, 0xffc040]), nz(x | 0, y | 0, 6)) : pal(PH([0x2a1a14, 0x3a2418, 0x4a2e1e]), nz(x | 0, y | 0, 7))) : null; }));
  def('i_shears', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if ((Math.abs(b - 1.2) < .7 || Math.abs(b + 1.2) < .7) && a > 11 && a < 20) return pal(PH([0x8a8a8a, 0xc8c8c8, 0xe8e8e8]), b > 0 ? .4 : .8); if (Math.hypot(a - 8.5, b - 2.6) < 2.2 && Math.hypot(a - 8.5, b - 2.6) > 1) return hx(0x8a1a1a); if (Math.hypot(a - 8.5, b + 2.6) < 2.2 && Math.hypot(a - 8.5, b + 2.6) > 1) return hx(0x8a1a1a); return null; }));
  def('i_brush', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .7 && a > 2 && a < 12) return pal(HAN, .6); if (a >= 12 && a < 14 && Math.abs(b) < 1.4) return pal(COPC[0], .6); if (a >= 14 && a < 20 && Math.abs(b) < 2.4) return pal(PH([0xd8d8c8, 0xf0f0e0]), nz(x | 0, y | 0, 8)); return null; }));
  def('i_fishing_rod', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .6 && a > 1.5 && a < 20) return pal(HAN, .6); if (x > 13 && x < 14.2 && y > 3 && y < 13) return [220, 220, 220]; if (x > 12.5 && x < 14.5 && y > 12 && y < 14) return [180, 180, 180]; return null; }, false));
  def('i_carrot_on_a_stick', I => { I.copy(get('i_fishing_rod')); spr(Img(1), () => null); I.fill((x, y) => ell(x, y, 13.5, 13.5, 1.6, 2.4) < 1 ? hx(0xf08a20) : null); });
  def('i_warped_fungus_on_a_stick', I => { I.copy(get('i_fishing_rod')); I.fill((x, y) => ell(x, y, 13.5, 13.5, 2.2, 1.6) < 1 ? hx(0x1a9a8a) : null); });
  const BUCK = PH([0x4a4a4a, 0x7a7a7a, 0xa8a8a8, 0xd0d0d0, 0xf0f0f0]);
  const bucketS = (fill) => I => { I.tmpl(['................', '................', '................', '....1111111.....', '...133333331....', '..13444444431...', '..1FFFFFFFFF1...', '..13FFFFFFF31...', '..133333333 1...', '...13333333 1...', '...12333332 1...', '...122222221....', '....1222221.....', '.....11111......', '................', '................'].map(r => r.replace(/ /g, '3')), { 1: BUCK[0], 2: BUCK[1], 3: BUCK[2], 4: BUCK[3], F: fill || BUCK[1] }); };
  def('i_bucket', bucketS(null)); def('i_water_bucket', bucketS(hx(0x3f76e4))); def('i_lava_bucket', bucketS(hx(0xf07a1c))); def('i_powder_snow_bucket', bucketS(hx(0xf0f6f8))); def('i_milk_bucket', bucketS(hx(0xf8f8f8)));
  for (const [f, c] of [['cod', 0xb8a070], ['salmon', 0xc85a4a], ['pufferfish', 0xe8c040], ['tropical_fish', 0xf08a30], ['axolotl', 0xf0a0c0], ['tadpole', 0x5a4030], ['sulfur_cube', 0xd8cc50]]) def('i_' + f + '_bucket', I => { bucketS(hx(0x3f76e4))(I); I.rect(5, 6, 9, 7, hx(c)); I.set(10, 6, hx(c)); });
  def('i_compass', I => { spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); if (d < 6.2) return d > 5 ? hx(0x6a6a6a) : hx(0x9aa0b0); return null; }); for (let k = 0; k < 4; k++) { I.set(8 + k * 0, 4 + k, hx(0xd02020)); I.set(7, 8 + k, hx(0xd8d8d8)); } I.set(7, 7, hx(0x3a3a3a)); });
  def('i_recovery_compass', I => { I.copy(get('i_compass')); I.tint([150, 220, 220]); });
  def('i_clock', I => { spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); if (d < 6.2) return d > 5 ? hx(0xc89a10) : (y < 8 ? hx(0x5ab0f0) : hx(0x3a7a2a)); return null; }); I.rect(7, 3, 8, 8, hx(0xf0e060)); I.rect(5, 5, 6, 6, hx(0xfff6a0)); });
  def('i_spyglass', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < 1.4 && a > 4 && a < 18) return a > 15 ? pal(PH([0x8a5aa8, 0xb090d0]), .5) : pal(COPC[0], clamp(.5 - b * .2, 0, .99)); return null; }));
  def('i_map', I => { I.rect(2, 2, 13, 13, hx(0xd8cfa8)); I.rect(3, 3, 12, 12, hx(0xe8dfb8)); for (let x = 2; x < 14; x++) { I.set(x, 2, hx(0xa89f78)); I.set(x, 13, hx(0xa89f78)); } });
  def('i_filled_map', I => { I.copy(get('i_map')); I.rect(4, 4, 7, 8, hx(0x6aa04a)); I.rect(8, 6, 11, 11, hx(0x3e7ad6)); I.rect(5, 9, 7, 11, hx(0xc8b070)); });
  def('i_explorer_map', I => { I.copy(get('i_map')); I.rect(5, 5, 6, 6, hx(0x8a3a2a)); I.rect(9, 9, 10, 10, hx(0xd02020)); for (let k = 6; k < 9; k++) I.set(k, k, hx(0x5a5a5a)); });
  def('i_name_tag', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < 2.4 && a > 6 && a < 19 && !(Math.hypot(a - 8, b) < .9)) return pal(PH([0xb8a070, 0xd0b888, 0xe8d0a0]), .5 - b * .1); if (Math.abs(a - 4.5) < 2 && Math.abs(b) < .5) return [200, 200, 200]; return null; }));
  def('i_lead', I => spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); return (Math.abs(d - 4.5) < .9 && !(x > 10 && y > 10)) || (Math.abs(x - y) < .8 && x > 10 && x < 15) ? pal(PH([0x7a5a3a, 0x9a7a52, 0xb89a6a]), nz(x | 0, y | 0, 9)) : null; }));
  def('i_saddle', I => spr(I, (x, y) => { if (ell(x, y, 8, 7, 6.5, 3.5) < 1 && y < 9) return pal(PH([0x5a3418, 0x7a4a24, 0x9a6232]), .5 - (y - 7) * .1); if ((x > 3 && x < 5 || x > 11 && x < 13) && y >= 8 && y < 14) return hx(0x5a3418); if ((x > 3 && x < 5 || x > 11 && x < 13) && y >= 14 && y < 15) return hx(0xa0a0a0); return null; }));
  def('i_bundle', I => spr(I, (x, y) => { if (ell(x, y, 8, 10, 5.8, 4.6) < 1) return pal(PH([0x7a4a24, 0x9a6232, 0xb87a40, 0xd09050]), clamp(.6 - (y - 10) * .08 - (x - 8) * .03, 0, .99)); if (x > 5.5 && x < 10.5 && y > 3.5 && y < 6) return hx(0x6a4020); return null; }));
  def('i_harness', I => spr(I, (x, y) => { if (Math.abs(x - 8) < 6 && y > 4 && y < 8) return pal(PH([0x9a9a9a, 0xc8c8c8, 0xf0f0f0]), .6); if ((Math.abs(x - 3.5) < 1 || Math.abs(x - 12.5) < 1) && y >= 8 && y < 13) return hx(0x6a4020); if (ell(x, y, 8, 6, 2, 1.2) < 1) return hx(0x8ad0f0); return null; }));
  def('i_goat_horn', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); const w = .6 + a * .1; return a > 2 && a < 19 && Math.abs(b - Math.sin(a * .25) * 2) < w ? pal(PH([0x8a7a62, 0xa89878, 0xc8b898, 0xe0d4b8]), clamp(a / 22, 0, .99)) : null; }));
  const bookS = (c) => I => { I.tmpl(['................', '................', '...11111111.....', '...1ccccccc1....', '...1cccccccc1...', '...1cccccccc1...', '...1ccccLLcc1...', '...1cccccccc1...', '...1cccccccc1...', '...1cccccccc1...', '...1cccccccc1...', '...1cccccccc1...', '...1ppppppppp1..', '...11111111111..', '................', '................'], { 1: shd(c, .45), c: c, L: shd(c, 1.3).map(v => Math.min(255, v)), p: [235, 230, 210] }); };
  def('i_book', bookS([140, 70, 40])); def('i_writable_book', I => { bookS([140, 70, 40])(I); I.rect(11, 2, 11, 9, hx(0xf0f0f0)); I.set(11, 10, hx(0x2a2a2a)); }); def('i_written_book', I => { bookS([140, 70, 40])(I); I.rect(5, 5, 9, 5, hx(0xd8b040)); }); def('i_enchanted_book', bookS([150, 50, 120])); def('i_knowledge_book', bookS([180, 40, 40]));
  const bottleS = (liq, a) => I => { I.tmpl(['................', '......1111......', '......1cc1......', '.......11.......', '......1ww1......', '.....1wwww1.....', '....1wLLLLw1....', '...1wLLLLLLw1...', '...1LLLLLLLL1...', '...1LLLLLLLL1...', '...1LLLLLLLL1...', '....1LLLLLL1....', '.....111111.....', '................', '................', '................'], { 1: [70, 80, 100], c: [150, 110, 70], w: [210, 230, 245, 170], L: liq ? liq : [210, 230, 245, 140] }); };
  def('i_glass_bottle', bottleS(null)); def('i_potion', bottleS([56, 92, 220])); def('i_splash_potion', bottleS([56, 92, 220])); def('i_lingering_potion', bottleS([56, 92, 220])); def('i_experience_bottle', bottleS([130, 230, 60])); def('i_ominous_bottle', bottleS([40, 120, 90])); def('i_honey_bottle', bottleS([240, 170, 40])); def('i_dragon_breath', bottleS([200, 120, 180]));
  def('i_end_crystal', I => spr(I, (x, y) => { const d = Math.abs(x - 8) + Math.abs(y - 8); return d < 6.5 ? pal(PH([0xa04aa0, 0xd090d0, 0xf8c8f8]), clamp(.6 - (x - 8) * .06, 0, .99)) : null; }));
  def('i_firework_rocket', I => spr(I, (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < 1.8 && a > 8 && a < 17) return pal(PH([0x8a2020, 0xc83030, 0xe85050]), .5 - b * .1); if (a >= 17 && a < 19 && Math.abs(b) < (19 - a)) return [220, 220, 220]; if (Math.abs(b) < .4 && a > 3 && a <= 8) return pal(HAN, .6); return null; }));
  def('i_firework_star', I => spr(I, (x, y) => ell(x, y, 8, 8, 4.5, 4.5) < 1 ? pal(PH([0x3a3a3a, 0x5a5a5a, 0x8a8a8a]), nz(x | 0, y | 0, 10)) : null));
  const BOATC = { oak: PLANK.oak, spruce: PLANK.spruce, birch: PLANK.birch, jungle: PLANK.jungle, acacia: PLANK.acacia, dark_oak: PLANK.dark_oak, mangrove: PLANK.mangrove, cherry: PLANK.cherry, pale_oak: PLANK.pale_oak, poplar: PLANK.poplar, bamboo: PLANK.bamboo };
  for (const w of WOODS) {
    if (w.nether) continue;
    const P = BOATC[w.n], n = w.bamboo ? 'bamboo_raft' : w.n + '_boat', cn = w.bamboo ? 'bamboo_chest_raft' : w.n + '_chest_boat';
    const boatS = chest => I => { spr(I, (x, y) => { if (y > 7 && y < 13 && x > 1 && x < 15 && !(y > 10 && (x < 3 + (y - 10) * 1.5 || x > 13 - (y - 10) * 1.5))) return pal(P.slice(1, 5), clamp(.6 - (y - 8) * .1, 0, .99)); if (y === 7 && x > 0 && x < 16) return P[0]; if (chest && x > 5 && x < 11 && y > 3 && y < 7) return pal(CHEST, .5); if (!chest && x === 12 && y > 2 && y < 7) return HAN[2]; return null; }); };
    def('i_' + n, boatS(0)); def('i_' + cn, boatS(1));
  }
  const cartS = (k) => I => { spr(I, (x, y) => { if (y > 6 && y < 12 && x > 1 && x < 15 && !(y === 7 && (x < 3 || x > 13))) return pal(PH([0x4a4a4a, 0x6a6a6a, 0x8a8a8a, 0xa8a8a8]), clamp(.6 - (y - 7) * .1, 0, .99)); if ((Math.hypot(x - 4.5, y - 12.5) < 1.6) || (Math.hypot(x - 11.5, y - 12.5) < 1.6)) return hx(0x2a2a2a); if (k === 'chest' && x > 4 && x < 12 && y > 2 && y < 7) return pal(CHEST, .5); if (k === 'furnace' && x > 4 && x < 12 && y > 2 && y < 7) return hx(0x6a6a6a); if (k === 'tnt' && x > 4 && x < 12 && y > 2 && y < 7) return y === 4 ? hx(0xe8e8e8) : hx(0xc83020); if (k === 'hopper' && x > 3 && x < 13 && y > 3 && y < 7) return hx(0x4a4a4a); if (k === 'command_block' && x > 4 && x < 12 && y > 2 && y < 7) return hx(0xb8886a); return null; }); };
  for (const m of ['minecart', 'chest_minecart', 'furnace_minecart', 'tnt_minecart', 'hopper_minecart', 'command_block_minecart']) def('i_' + m, cartS(m.replace('_minecart', '').replace('minecart', '')));
  def('i_armor_stand', I => spr(I, (x, y) => { if ((x > 7 && x < 9) && y > 2 && y < 14) return pal(HAN, .7); if (y > 4 && y < 6 && x > 3 && x < 13) return pal(HAN, .6); if (y > 9 && y < 11 && x > 5 && x < 11) return pal(HAN, .5); if (y > 13 && y < 15 && x > 3 && x < 13) return hx(0x9a9a9a); if (y > 1 && y < 3 && x > 6 && x < 10) return pal(HAN, .6); return null; }));
  def('i_item_frame', I => { I.fill((x, y) => x > 1 && x < 14 && y > 1 && y < 14 ? (x < 4 || x > 11 || y < 4 || y > 11 ? pal(PLANK.oak.slice(0, 4), nz(x, y, 11)) : pal(PH([0x8a5a3a, 0x9a6a48]), nz(x, y, 12))) : null); });
  def('i_glow_item_frame', I => { I.copy(get('i_item_frame')); I.fill((x, y) => x > 3 && x < 12 && y > 3 && y < 12 ? hx(0x6ad8c0) : null); });
  def('i_painting', I => { I.fill((x, y) => x > 0 && x < 15 && y > 1 && y < 14 ? (x < 2 || x > 13 || y < 3 || y > 12 ? pal(PLANK.oak.slice(0, 4), nz(x, y, 13)) : y < 8 ? hx(0x6ab0e8) : y < 10 ? hx(0x4a8a2a) : hx(0x8a6a3a)) : null); I.rect(9, 4, 10, 5, hx(0xfff060)); });
  def('i_cushion', I => spr(I, (x, y) => ell(x, y, 8, 9.5, 6.6, 3.6) < 1 ? pal(PH([0xb8b8b8, 0xd8d8d8, 0xf0f0f0, 0xffffff]), clamp(.6 - (y - 9) * .12, 0, .99)) : null));
  def('i_cake', I => { spr(I, (x, y) => { if (y > 7 && y < 13 && x > 1 && x < 14) return y < 10 ? pal(PH([0xe6e0dc, 0xfaf6f3]), nz(x | 0, y | 0, 14)) : pal(PH([0xa0602e, 0xc0783a]), nz(x | 0, y | 0, 15)); if (y > 4 && y <= 7 && x > 3 + (7 - y) && x < 12 - (7 - y) + 2) return pal(PH([0xe6e0dc, 0xfaf6f3]), nz(x | 0, y | 0, 16)); return null; }); for (const [x, y] of [[4, 8], [8, 7], [11, 8], [6, 6]]) I.set(x, y, hx(0xd82020)); });
  const foodS = {
    apple: (x, y) => ell(x, y, 8, 9.5, 5.6, 5.4) < 1 ? pal(PH([0x8a0a0a, 0xb81616, 0xd82424, 0xf04a4a, 0xff9a9a]), clamp(.55 - (x - 7) * .06 - (y - 8) * .05 + (ell(x, y, 6, 7.5, 1.6, 1.6) < 1 ? .4 : 0), 0, .99)) : x > 7 && x < 9 && y > 2 && y < 5 ? hx(0x6a4a1a) : x > 8.5 && x < 11.5 && y > 2.5 && y < 4.5 ? hx(0x4a9a2a) : null,
    golden_apple: (x, y) => ell(x, y, 8, 9.5, 5.6, 5.4) < 1 ? pal(PH([0x9a6a08, 0xd09a10, 0xf0c830, 0xfce870, 0xffffb0]), clamp(.55 - (x - 7) * .06 - (y - 8) * .05 + (ell(x, y, 6, 7.5, 1.6, 1.6) < 1 ? .4 : 0), 0, .99)) : x > 7 && x < 9 && y > 2 && y < 5 ? hx(0x6a4a1a) : x > 8.5 && x < 11.5 && y > 2.5 && y < 4.5 ? hx(0x4a9a2a) : null,
    bread: (x, y) => { const a = DA(x, y), b = DB(x, y); return ell(a, b, 11.3, 0, 7.6, 3.6) < 1 ? pal(PH([0x7a4a14, 0x9a6020, 0xbc7c2c, 0xd89a40, 0xecc070]), clamp(.6 - b * .12 + (Math.abs(b) < 1 && (a | 0) % 3 === 0 ? -.4 : 0), 0, .99)) : null; },
    carrot: (x, y) => { const a = DA(x, y), b = DB(x, y); if (a > 3 && a < 16 && Math.abs(b) < (a - 3) * .22 + .3) return pal(PH([0xb85a08, 0xe07a10, 0xf09a28, 0xf8b850]), clamp(.6 - b * .15 + ((a | 0) % 4 === 0 ? -.3 : 0), 0, .99)); if (a >= 16 && a < 20 && Math.abs(b) < 2 && (Math.abs(b) < .6 || Math.abs(b) > 1.2)) return hx(0x3a9a2a); return null; },
    golden_carrot: (x, y) => { const a = DA(x, y), b = DB(x, y); if (a > 3 && a < 16 && Math.abs(b) < (a - 3) * .22 + .3) return pal(PH([0xa87a08, 0xd8a810, 0xf0d030, 0xfff080]), clamp(.6 - b * .15, 0, .99)); if (a >= 16 && a < 20 && Math.abs(b) < 2) return hx(0xd8c040); return null; },
    potato: (x, y) => ell(x, y, 8, 9, 5.4, 4.2) < 1 ? pal(PH([0x8a6a2a, 0xa8823a, 0xc89c4c, 0xe0b868]), clamp(.6 - (x - 8) * .06 - (y - 9) * .08 + (nz(x | 0, y | 0, 17) > .9 ? -.4 : 0), 0, .99)) : null,
    baked_potato: (x, y) => ell(x, y, 8, 9, 5.4, 4.2) < 1 ? (y < 7.5 && ell(x, y, 8, 7.5, 3, 1.4) < 1 ? hx(0xf0e08a) : pal(PH([0x7a4a14, 0x9a6020, 0xb87830, 0xd09040]), clamp(.6 - (x - 8) * .06 - (y - 9) * .08, 0, .99))) : null,
    poisonous_potato: (x, y) => ell(x, y, 8, 9, 5.4, 4.2) < 1 ? pal(PH([0x6a7a2a, 0x8a9a3a, 0xa8b04a, 0xc0c860]), clamp(.6 - (x - 8) * .06 - (y - 9) * .08, 0, .99)) : null,
    beetroot: (x, y) => ell(x, y, 8, 10, 4.4, 4.4) < 1 && y > 6.5 ? pal(PH([0x5a0a1a, 0x8a1428, 0xb02038, 0xd04058]), clamp(.6 - (x - 8) * .07 - (y - 10) * .07, 0, .99)) : (y <= 6.5 && y > 2 && Math.abs(x - 8 - (6.5 - y) * .5) < 1.2) ? hx(0x4a9a2a) : null,
    melon_slice: (x, y) => { const d = Math.hypot(x - 8, y - 4); return d < 9 && y > 5 && x > 1.5 && x < 14.5 ? (d > 7.8 ? hx(0x4a8a1a) : d > 7 ? hx(0xd8e8a0) : (nz(x | 0, y | 0, 18) > .9 ? hx(0x2a1a0a) : pal(PH([0xc82020, 0xe03a30, 0xf05a48]), nz(x | 0, y | 0, 19)))) : null; },
    sweet_berries: (x, y) => { for (const [cx, cy] of [[6, 10], [10, 9], [8, 6], [11, 12], [5, 13]]) if (Math.hypot(x - cx, y - cy) < 2) return pal(PH([0x8a0a1a, 0xc01428, 0xe83a4a]), clamp(.5 - (x - cx) * .2 - (y - cy) * .2, 0, .99)); if (y < 5 && Math.abs(x - 8) < 1) return hx(0x3a6a1a); return null; },
    glow_berries: (x, y) => { for (const [cx, cy] of [[6, 10], [10, 9], [8, 6], [11, 12]]) if (Math.hypot(x - cx, y - cy) < 2) return pal(PH([0xc87a10, 0xf0a020, 0xffd060]), clamp(.5 - (x - cx) * .2 - (y - cy) * .2, 0, .99)); if (y < 5 && Math.abs(x - 8) < 1) return hx(0x3a6a1a); return null; },
    cookie: (x, y) => ell(x, y, 8, 8.5, 5.6, 5) < 1 ? (nz(x | 0, y | 0, 20) > .82 ? hx(0x3a2008) : pal(PH([0xa86a2a, 0xc0803a, 0xd8984a]), clamp(.6 - (x - 8) * .05 - (y - 8) * .05, 0, .99))) : null,
    pumpkin_pie: (x, y) => ell(x, y, 8, 9, 6.4, 4.6) < 1 ? (ell(x, y, 8, 8.5, 4.6, 3) < 1 ? pal(PH([0xc8701a, 0xe08a28, 0xf0a038]), nz(x | 0, y | 0, 21)) : pal(PH([0xb88040, 0xd09a58]), nz(x | 0, y | 0, 22))) : null,
    dried_kelp: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b - Math.sin(a * .7) * 1.2) < 1.2 && a > 3 && a < 19 ? pal(PH([0x2a331b, 0x3a4424, 0x4c5730]), nz(x | 0, y | 0, 23)) : null; },
    chorus_fruit: (x, y) => ell(x, y, 8, 8.5, 5, 5) < 1 ? pal(PH([0x5a3a6a, 0x7a508a, 0x9a6aaa, 0xc898d8]), clamp(.6 - (x - 8) * .06 - (y - 8) * .06 + (nz(x | 0, y | 0, 24) > .8 ? .3 : 0), 0, .99)) : null,
    popped_chorus_fruit: (x, y) => ell(x, y, 8, 8.5, 5.4, 5.2) < 1 ? pal(PH([0x8a6a9a, 0xa888b8, 0xc8a8d8, 0xe8d0f0]), clamp(.6 - (x - 8) * .06 - (y - 8) * .06, 0, .99)) : null,
    rotten_flesh: (x, y) => ell(DA(x, y), DB(x, y), 11.3, 0, 7, 4) < 1 ? (nz(x | 0, y | 0, 25) < .4 ? hx(0x8a5a3a) : pal(PH([0x5a7a2a, 0x6a8a32, 0x7a9a3a]), nz(x | 0, y | 0, 26))) : null,
    spider_eye: (x, y) => ell(x, y, 8, 8.5, 4.8, 4.4) < 1 ? (ell(x, y, 7, 7.5, 1.5, 1.5) < 1 ? hx(0xf08080) : pal(PH([0x6a0a1a, 0x8a1428, 0xa82038]), nz(x | 0, y | 0, 27))) : null,
    pufferfish: (x, y) => ell(x, y, 8, 8.5, 5.4, 5) < 1 ? (Math.hypot(x - 10, y - 7) < 1 ? hx(0x1a1a1a) : (nz(x | 0, y | 0, 28) > .85 ? hx(0xa08020) : pal(PH([0xc8a020, 0xe0b830, 0xf0d050]), clamp(.6 - (y - 8) * .08, 0, .99)))) : null,
    tropical_fish: (x, y) => ell(x, y, 7.5, 8.5, 5, 3.6) < 1 ? (Math.hypot(x - 10, y - 7.5) < .8 ? hx(0x1a1a1a) : (x | 0) % 3 === 0 ? hx(0xf8f8f8) : hx(0xf08a30)) : (x > 12 && x < 15.5 && Math.abs(y - 8.5) < (x - 12) * .9) ? hx(0xf08a30) : null,
    suspicious_stew: null, mushroom_stew: null, beetroot_soup: null, rabbit_stew: null, honey_bottle: null, enchanted_golden_apple: null
  };
  const fishS = (P, cooked) => (x, y) => { const a = DA(x, y), b = DB(x, y); if (ell(a, b, 11, 0, 6.6, 2.8) < 1) return Math.hypot(a - 15.5, b + .8) < .7 ? hx(0x1a1a1a) : pal(P, clamp(.6 - b * .15, 0, .99)); if (a > 2.5 && a < 5.5 && Math.abs(b) < (5.5 - a) * .9 + .2) return pal(P, .3); return null; };
  Object.assign(foodS, { cod: fishS(PH([0x8a7a5a, 0xb8a070, 0xd0bc90, 0xe8d8b0])), cooked_cod: fishS(PH([0x9a6a3a, 0xb8844a, 0xd09a5a, 0xe8b878])), salmon: fishS(PH([0x8a3a2a, 0xb04a3a, 0xc85a4a, 0xe07a6a])), cooked_salmon: fishS(PH([0x8a4a2a, 0xa8603a, 0xc87a4a, 0xe09a6a])) });
  const meatS = (P, fat, cooked) => (x, y) => { const a = DA(x, y), b = DB(x, y); if (ell(a, b, 11.3, 0, 7.4, 4.2) > 1) return null; if (b > 2.4) return fat; return pal(P, clamp(.6 - b * .08 + (cooked && (a | 0) % 4 === 0 ? -.3 : 0) + nz(x | 0, y | 0, 29) * .2, 0, .99)); };
  Object.assign(foodS, {
    porkchop: meatS(PH([0xc86a6a, 0xe08484, 0xf09a9a, 0xf8b4b4]), hx(0xfae0d4)), cooked_porkchop: meatS(PH([0x8a5228, 0xb06a32, 0xc8803e, 0xd8984e]), hx(0xe8c090), 1),
    beef: meatS(PH([0x8a1a1a, 0xb02424, 0xc83030, 0xe04848]), hx(0xf0ece6)), cooked_beef: meatS(PH([0x5a3014, 0x7a4420, 0x94582a, 0xa86a36]), hx(0xb88050), 1),
    mutton: meatS(PH([0xa83a3a, 0xc84848, 0xd85a5a, 0xe87070]), hx(0xf0e0d8)), cooked_mutton: meatS(PH([0x6a3a1a, 0x8a4c24, 0xa25e2e, 0xb8703a]), hx(0xc89060), 1),
    rabbit: meatS(PH([0xc08a7a, 0xd8a090, 0xe8b4a4, 0xf4c8b8]), hx(0xf8e0d8)), cooked_rabbit: meatS(PH([0x8a5a32, 0xa8703e, 0xc0864c, 0xd49a5c]), hx(0xe0b080), 1)
  });
  foodS.chicken = (x, y) => { const a = DA(x, y), b = DB(x, y); if (ell(a, b, 12.5, 0, 6, 4) < 1) return pal(PH([0xd8a090, 0xe8b8a8, 0xf4ccbc, 0xfadcd0]), clamp(.6 - b * .1, 0, .99)); if (Math.abs(b) < .8 && a > 3 && a < 7) return hx(0xf0e8d8); if (Math.hypot(a - 3, b) < 1.4) return hx(0xf0e8d8); return null; };
  foodS.cooked_chicken = (x, y) => { const a = DA(x, y), b = DB(x, y); if (ell(a, b, 12.5, 0, 6, 4) < 1) return pal(PH([0x8a5228, 0xb06a32, 0xc8843e, 0xdc9c50]), clamp(.6 - b * .1, 0, .99)); if (Math.abs(b) < .8 && a > 3 && a < 7) return hx(0xf0e8d8); if (Math.hypot(a - 3, b) < 1.4) return hx(0xf0e8d8); return null; };
  for (const k in foodS) if (foodS[k]) def('i_' + k, I => spr(I, foodS[k]));
  def('i_enchanted_golden_apple', I => I.copy(get('i_golden_apple')));
  const bowlS = (fill) => I => { spr(I, (x, y) => { if (y > 7 && y < 13 && Math.abs(x - 8) < 6.5 - (y - 8) * .8) return pal(PLANK.oak.slice(0, 4), clamp(.6 - (y - 8) * .1, 0, .99)); if (fill && y > 6 && y <= 8 && Math.abs(x - 8) < 6) return pal(fill, nz(x | 0, y | 0, 31)); return null; }); };
  def('i_bowl', bowlS(null)); def('i_mushroom_stew', bowlS(PH([0x8a5a3a, 0xa86a42, 0xc0804e]))); def('i_beetroot_soup', bowlS(PH([0x8a1428, 0xa82038, 0xc03048]))); def('i_rabbit_stew', bowlS(PH([0x8a5a2a, 0xa87038, 0xd09048]))); def('i_suspicious_stew', bowlS(PH([0x7a5a3a, 0x9a6a42, 0xb8804e])));
  const lumpS = (P, rx, ry) => (x, y) => ell(x, y, 8, 8.5, rx || 5.6, ry || 4.8) + nz(x | 0, y | 0, 32) * .35 < 1.05 ? pal(P, clamp(.6 - (x - 8) * .06 - (y - 8) * .07 + nz(x | 0, y | 0, 33) * .25, 0, .99)) : null;
  const ingotS = (P) => (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < 2.6 && Math.abs(a - 11.3) < 6.2 - Math.abs(b) * .2) return pal(P, clamp(b < -1 ? .9 : b > 1.2 ? .25 : .55, 0, .99)); return null; };
  const nuggetS = (P) => (x, y) => { for (const [cx, cy, r] of [[7, 9, 2.6], [10, 7, 2], [9.5, 11, 1.8]]) if (Math.hypot(x - cx, y - cy) < r) return pal(P, clamp(.6 - (x - cx) * .15 - (y - cy) * .15, 0, .99)); return null; };
  const gemS = (P) => (x, y) => { const d = Math.abs(x - 8) + Math.abs(y - 8.5) * 1.15; if (d > 6.6) return null; return pal(P, y < 8 ? (x < 8 ? .9 : .65) : (x < 8 ? .45 : .25)); };
  const dustS = (P) => (x, y) => ell(x, y, 8, 9, 6, 4.8) < 1 && nz(x | 0, y | 0, 34) < .55 ? pal(P, nz(x | 0, y | 0, 35)) : null;
  const MATP = {
    coal: lumpS(PH([0x141414, 0x262626, 0x3a3a3a, 0x505050])), charcoal: lumpS(PH([0x2a2018, 0x3e3024, 0x524032, 0x6a5444])),
    diamond: gemS(MAT.diamond), emerald: (x, y) => { const d = Math.abs(x - 8) * 1.4 + Math.abs(y - 8.5) * .9; return d < 6.6 ? pal(PH([0x007a24, 0x00a838, 0x17dd62, 0x80ffb0]), y < 8 ? (x < 8 ? .9 : .6) : (x < 8 ? .4 : .2)) : null; },
    lapis_lazuli: lumpS(PH([0x0e2b7a, 0x1b3f9a, 0x2652b7, 0x4a7ae0])), quartz: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b) < 2.5 - Math.abs(a - 11) * .2 && Math.abs(a - 11) < 6 ? pal(PH([0xc8bcae, 0xe2dad0, 0xf4eee6, 0xffffff]), clamp(.6 - b * .15, 0, .99)) : null; },
    amethyst_shard: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b) < 2.6 - Math.abs(a - 11.3) * .3 && Math.abs(a - 11.3) < 7 ? pal(PH([0x5d3c8e, 0x8662bf, 0xb495e5, 0xe8d8ff]), clamp(.6 - b * .15, 0, .99)) : null; },
    raw_iron: lumpS(PH([0x8a6a54, 0xa98269, 0xc6a083, 0xe6c6ae])), raw_copper: lumpS(PH([0x7a4029, 0x9a5236, 0xb86443, 0xe18b63])), raw_gold: lumpS(PH([0xae7a0f, 0xd3a121, 0xe9bd37, 0xffe680])),
    iron_ingot: ingotS(MAT.iron), copper_ingot: ingotS(MAT.copper), gold_ingot: ingotS(MAT.golden), netherite_ingot: ingotS(MAT.netherite), brick: ingotS(PH([0x6a2a1a, 0x8a3a28, 0xa84a34, 0xc06048])), nether_brick: ingotS(PH([0x1a0a0c, 0x2b1418, 0x3c1c21, 0x52282e])), resin_brick: ingotS(PH([0x8a400c, 0xb85a14, 0xe27e22, 0xfaaa44])),
    iron_nugget: nuggetS(MAT.iron), gold_nugget: nuggetS(MAT.golden), copper_nugget: nuggetS(MAT.copper),
    netherite_scrap: lumpS(PH([0x2a2220, 0x4a3a34, 0x6a5248, 0x8a6a5c])), redstone: dustS(PH([0x6a0000, 0xa00000, 0xd81010, 0xff4a3a])), glowstone_dust: dustS(PH([0x8a6a33, 0xd0a656, 0xf0c87a, 0xfde3a8])), gunpowder: dustS(PH([0x3a3a3a, 0x5a5a5a, 0x7a7a7a, 0x9a9a9a])), sugar: dustS(PH([0xd0d0d8, 0xe8e8f0, 0xf8f8ff, 0xffffff])), bone_meal: dustS(PH([0xc8c8c0, 0xe0e0d8, 0xf0f0e8, 0xffffff])), blaze_powder: dustS(PH([0xa05a08, 0xe08a10, 0xf8b830, 0xffe060])),
    flint: (x, y) => Math.abs(x - 8) * .8 + Math.abs(y - 8.5) < 6 && x + y > 7 ? pal(PH([0x2a2a2e, 0x3e3e44, 0x5a5a62, 0x7a7a84]), x - y > 0 ? .3 : .8) : null,
    clay_ball: lumpS(PH([0x7a808c, 0x9399a5, 0xa7adba, 0xc0c6d0]), 4.6, 4.2), slime_ball: (x, y) => ell(x, y, 8, 8.5, 5, 4.8) < 1 ? pal(PH([0x3a8a2a, 0x5aaa42, 0x7cc860, 0xb0f090]), clamp(.6 - (x - 8) * .07 - (y - 8) * .07, 0, .99)) : null,
    stick: (x, y) => Math.abs(DB(x, y)) < .85 && DA(x, y) > 3 && DA(x, y) < 20 ? pal(HAN, DB(x, y) < 0 ? .8 : .4) : null,
    paper: (x, y) => x > 2 && x < 14 && y > 2 && y < 14 && !(x > 11 && y < 5) ? pal(PH([0xd8d8d0, 0xe8e8e0, 0xf8f8f0]), nz(x | 0, y | 0, 36)) : null,
    wheat: (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .6 && a > 2 && a < 12) return hx(0xb8a040); if (a >= 11 && a < 21 && Math.abs(b) < 2.2 && ((a * 2 | 0) % 2 === 0 || Math.abs(b) < .8)) return pal(PH([0xa8902e, 0xc8aa3a, 0xe0c45a]), clamp(.6 - b * .2, 0, .99)); return null; },
    string: (x, y) => { const d = Math.abs(y - 8 - Math.sin(x * .8) * 2.5); return d < .7 && x > 1 && x < 15 ? [236, 236, 236] : null; },
    feather: (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.abs(b) < .4 && a > 2 && a < 20) return [200, 200, 200]; if (a > 5 && a < 20 && b > -2.6 + (a - 5) * .04 && b < 2.6 - Math.abs(a - 14) * .15) return pal(PH([0xd8d8d8, 0xececec, 0xffffff]), nz(x | 0, y | 0, 37)); return null; },
    leather: (x, y) => ell(x, y, 8, 8.5, 6, 5.4) < 1 && !(Math.hypot(x - 3, y - 4) < 2 || Math.hypot(x - 13, y - 13) < 2) ? pal(PH([0x6a3a1a, 0x8a4c24, 0xa0623a, 0xc07a48]), nz(x | 0, y | 0, 38)) : null,
    rabbit_hide: (x, y) => ell(x, y, 8, 8.5, 5.6, 5) < 1 ? pal(PH([0x8a6a4a, 0xa8865e, 0xc0a078]), nz(x | 0, y | 0, 39)) : null,
    rabbit_foot: (x, y) => ell(x, y, 8, 9, 3, 5.4) < 1 ? pal(PH([0x8a6a4a, 0xa8865e, 0xc0a078, 0xd8b890]), clamp(.6 - (y - 9) * .07, 0, .99)) : null,
    bone: (x, y) => { const a = DA(x, y), b = DB(x, y); return (Math.abs(b) < .9 && a > 5 && a < 17.6) || ell(a, b, 4.3, -1, 1.4, 1.2) < 1 || ell(a, b, 4.3, 1, 1.4, 1.2) < 1 || ell(a, b, 18.3, -1, 1.4, 1.2) < 1 || ell(a, b, 18.3, 1, 1.4, 1.2) < 1 ? pal(PH([0xc8c8b4, 0xe0e0cc, 0xf0f0e0]), b < 0 ? .8 : .3) : null; },
    honeycomb: (x, y) => ell(x, y, 8, 8.5, 5.8, 5.2) < 1 ? ((((x | 0) + ((y | 0) >> 1)) % 3 === 0) ? hx(0xb9781a) : pal(PH([0xe39b24, 0xeca82d, 0xf3b63a]), nz(x | 0, y | 0, 40))) : null,
    ink_sac: (x, y) => ell(x, y, 8, 9, 5, 5) < 1 ? pal(PH([0x14141e, 0x22222e, 0x32323e, 0x4a4a5a]), clamp(.6 - (x - 8) * .07 - (y - 8) * .07, 0, .99)) : null,
    glow_ink_sac: (x, y) => ell(x, y, 8, 9, 5, 5) < 1 ? pal(PH([0x1a5a5a, 0x2a8a8a, 0x4ac8c0, 0x8af8f0]), clamp(.6 - (x - 8) * .07 - (y - 8) * .07, 0, .99)) : null,
    blaze_rod: (x, y) => Math.abs(DB(x, y)) < 1 && DA(x, y) > 3 && DA(x, y) < 20 ? pal(PH([0xb06008, 0xe09010, 0xf8c830, 0xffec80]), DB(x, y) < 0 ? .85 : .4) : null,
    breeze_rod: (x, y) => Math.abs(DB(x, y)) < 1 && DA(x, y) > 3 && DA(x, y) < 20 ? pal(PH([0x6a7ab0, 0x8aa0d8, 0xb8c8f0, 0xe0e8ff]), DB(x, y) < 0 ? .85 : .4) : null,
    ghast_tear: (x, y) => ell(x, y, 8, 9.5, 3.4, 3.6) < 1 || (y < 9 && Math.abs(x - 8) < (y - 3) * .5) ? pal(PH([0x9ab8c8, 0xc8e0e8, 0xf0f8ff]), clamp(.6 - (x - 8) * .1, 0, .99)) : null,
    magma_cream: (x, y) => ell(x, y, 8, 8.5, 5, 4.6) < 1 ? (nz(x | 0, y | 0, 41) > .7 ? hx(0xf8c830) : pal(PH([0x8a3a0a, 0xb85010, 0xe07020]), nz(x | 0, y | 0, 42))) : null,
    nether_star: (x, y) => { const dx = Math.abs(x - 8), dy = Math.abs(y - 8); return (dx < 1.4 && dy < 7) || (dy < 1.4 && dx < 7) || (Math.abs(dx - dy) < 1.2 && dx < 4.5) ? pal(PH([0xc8c8b0, 0xe8e8d8, 0xffffff]), clamp(1 - (dx + dy) / 10, 0, .99)) : null; },
    shulker_shell: (x, y) => ell(x, y, 8, 9, 6.4, 5) < 1 && y < 12 ? pal(PH([0x7a527a, 0x976797, 0xb282b2]), clamp(.6 - (y - 8) * .08, 0, .99)) : null,
    phantom_membrane: (x, y) => ell(x, y, 8, 8, 6, 5) < 1 ? pal(PH([0x8a9070, 0xa8ae8c, 0xc8cea8]), nz(x | 0, y | 0, 43)) : null,
    prismarine_shard: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b) < 2.2 - Math.abs(a - 11) * .25 && Math.abs(a - 11) < 7 ? pal(PH([0x3a7a6c, 0x5aa898, 0x7ec8b8, 0xb0f0e0]), clamp(.6 - b * .15, 0, .99)) : null; },
    prismarine_crystals: (x, y) => { for (const [cx, cy] of [[6, 9], [10, 7], [9, 11], [5, 5]]) if (Math.abs(x - cx) + Math.abs(y - cy) < 2.4) return pal(PH([0x8ac8b8, 0xb8e8d8, 0xe8fff8]), clamp(.6 - (x - cx) * .2, 0, .99)); return null; },
    nautilus_shell: (x, y) => { const d = Math.hypot(x - 8, y - 8.5); return d < 6 ? pal(PH([0xb89a7a, 0xd0b898, 0xe8d8c0, 0xf8f0e0]), clamp(.4 + Math.sin(Math.atan2(y - 8.5, x - 8) * 2 + d * .9) * .3, 0, .99)) : null; },
    heart_of_the_sea: (x, y) => { const d = Math.hypot(x - 8, y - 8.5); return d < 5.6 ? pal(PH([0x1a5aa8, 0x2a7ad8, 0x5aa8f0, 0xb8e8ff]), clamp(.4 + Math.sin(Math.atan2(y - 8.5, x - 8) * 3 + d) * .3, 0, .99)) : null; },
    turtle_scute: (x, y) => ell(x, y, 8, 8.5, 5.4, 5) < 1 ? pal(PH([0x2a6a2a, 0x3a8a3a, 0x5aa85a]), nz(x | 0, y | 0, 44)) : null,
    armadillo_scute: (x, y) => ell(x, y, 8, 8.5, 5.4, 4) < 1 ? pal(PH([0x8a5a5a, 0xa87070, 0xc08a8a]), clamp(.6 - (y - 8) * .1, 0, .99)) : null,
    echo_shard: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b) < 2.4 - Math.abs(a - 11) * .3 && Math.abs(a - 11) < 6.5 ? pal(PH([0x0a2a3a, 0x0e4a5a, 0x1a7a8a, 0x2acad0]), clamp(.6 - b * .15, 0, .99)) : null; },
    disc_fragment_5: (x, y) => { const d = Math.hypot(x - 4, y - 12); return d < 9 && d > 2 && x > 3 && y < 13 && x - 4 < (12 - y) ? pal(PH([0x2a2a3a, 0x3a3a4a, 0x4a4a5a]), nz(x | 0, y | 0, 45)) : null; },
    fermented_spider_eye: (x, y) => ell(x, y, 8, 8.5, 4.8, 4.4) < 1 ? pal(PH([0x6a3a2a, 0x8a4a3a, 0xa86a4a]), nz(x | 0, y | 0, 46)) : (Math.hypot(x - 8, y - 4) < 2 ? hx(0x9a7a5a) : null),
    glistering_melon_slice: (x, y) => { const d = Math.hypot(x - 8, y - 4); return d < 9 && y > 5 && x > 1.5 && x < 14.5 ? (d > 7.8 ? hx(0xd8b030) : pal(PH([0xe0a030, 0xf0c040, 0xf8e070]), nz(x | 0, y | 0, 47))) : null; },
    trial_key: (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.hypot(a - 5, b) < 2.6 && Math.hypot(a - 5, b) > 1.2) return pal(PH([0x4a4a52, 0x6a6a74, 0x8a8a96]), .6); if (Math.abs(b) < .7 && a > 7 && a < 18) return pal(PH([0x4a4a52, 0x6a6a74, 0x8a8a96]), .7); if (a > 15 && a < 18 && b > 0 && b < 2) return hx(0xd07a2a); return null; },
    ominous_trial_key: (x, y) => { const a = DA(x, y), b = DB(x, y); if (Math.hypot(a - 5, b) < 2.6 && Math.hypot(a - 5, b) > 1.2) return pal(PH([0x2a2a3a, 0x3a3a52, 0x5a5a74]), .6); if (Math.abs(b) < .7 && a > 7 && a < 18) return pal(PH([0x2a2a3a, 0x3a3a52, 0x5a5a74]), .7); if (a > 15 && a < 18 && b > 0 && b < 2) return hx(0x2a8a8a); return null; },
    cocoa_beans: (x, y) => { for (const [cx, cy] of [[6, 9], [10, 7]]) if (ell(x, y, cx, cy, 2.4, 3.2) < 1) return pal(PH([0x4a2a10, 0x6a3c18, 0x8a5222]), clamp(.6 - (x - cx) * .15, 0, .99)); return null; },
    wheat_seeds: (x, y) => { for (const [cx, cy] of [[5, 9], [9, 6], [10, 11], [7, 12], [12, 8]]) if (Math.hypot(x - cx, y - cy) < 1.1) return pal(PH([0x3a7a1a, 0x5a9a2a, 0x7ab040]), nz(x | 0, y | 0, 48)); return null; },
    pumpkin_seeds: (x, y) => { for (const [cx, cy] of [[5, 9], [9, 6], [10, 11], [7, 12]]) if (ell(x, y, cx, cy, 1.4, 1)) if (ell(x, y, cx, cy, 1.4, 1) < 1) return pal(PH([0xd8c890, 0xe8d8a8, 0xf8ecc8]), nz(x | 0, y | 0, 49)); return null; },
    melon_seeds: (x, y) => { for (const [cx, cy] of [[5, 9], [9, 6], [10, 11], [7, 12]]) if (ell(x, y, cx, cy, 1.4, 1) < 1) return pal(PH([0x1a1a10, 0x2a2a1a, 0x3a3a2a]), nz(x | 0, y | 0, 50)); return null; },
    beetroot_seeds: (x, y) => { for (const [cx, cy] of [[5, 9], [9, 6], [10, 11], [7, 12]]) if (ell(x, y, cx, cy, 1.4, 1) < 1) return pal(PH([0x8a6a4a, 0xa8865e, 0xc0a078]), nz(x | 0, y | 0, 51)); return null; },
    torchflower_seeds: (x, y) => { for (const [cx, cy] of [[6, 9], [10, 7], [9, 11]]) if (ell(x, y, cx, cy, 1.6, 1.2) < 1) return pal(PH([0x5a8a2a, 0x7aa83a, 0xa0c050]), nz(x | 0, y | 0, 52)); return null; },
    pitcher_pod: (x, y) => ell(x, y, 8, 9, 3, 4.6) < 1 ? pal(PH([0x3a7a5a, 0x5a9a7a, 0x7ab89a]), clamp(.6 - (x - 8) * .1, 0, .99)) : null,
    nether_wart: (x, y) => { for (const [cx, cy] of [[6, 9], [10, 7], [9, 11]]) if (Math.hypot(x - cx, y - cy) < 2.2) return pal(PH([0x6a0c10, 0x8a1418, 0xa82024]), clamp(.6 - (x - cx) * .2, 0, .99)); return null; },
    kelp: (x, y) => { const a = DA(x, y), b = DB(x, y); return Math.abs(b - Math.sin(a * .7) * 1.2) < 1.3 && a > 3 && a < 19 ? pal(PH([0x3a6a1a, 0x4a8a22, 0x5aa02a]), nz(x | 0, y | 0, 53)) : null; },
    dye: (x, y) => ell(x, y, 8, 9.5, 5, 4.6) < 1 || (y < 7 && y > 3 && Math.abs(x - 8) < 1.5) ? pal(PH([0x8a8a8a, 0xb0b0b0, 0xd8d8d8, 0xf8f8f8]), clamp(.6 - (x - 8) * .07 - (y - 9) * .07, 0, .99)) : null,
    music_disc: (x, y) => { const d = Math.hypot(x - 8, y - 8); if (d >= 6.8) return null; if (d < 1) return [40, 40, 40]; if (d < 2.6) return [230, 230, 230]; return pal(PH([0x161616, 0x222222, 0x2e2e2e, 0x3a3a3a]), (Math.floor(d * 1.5) & 1) ? .2 : .7); },
    pottery_sherd: (x, y) => { const a = DA(x, y), b = DB(x, y); return x > 2 && x < 14 && y > 3 && y < 14 && x + y > 7 && x - y < 9 ? pal(PH([0x7a3a24, 0x96523a, 0xb06a4c]), nz(x | 0, y | 0, 54)) : (void a, void b, null); },
    smithing_template: (x, y) => x > 2 && x < 14 && y > 1 && y < 15 && !(x > 10 && y < 4) ? (Math.abs(x - 8) < 2 && Math.abs(y - 8) < 3 ? hx(0x5ab8b8) : pal(PH([0x2a3a3a, 0x3a4a4a, 0x4a5a5a, 0x6a7a7a]), nz(x | 0, y | 0, 55))) : null,
    banner_pattern: (x, y) => x > 2 && x < 14 && y > 2 && y < 14 ? (Math.abs(x - 8) + Math.abs(y - 8) < 3.5 ? hx(0x4a4a4a) : pal(PH([0xd8cfa8, 0xe8dfb8]), nz(x | 0, y | 0, 56))) : null,
    spawn_egg: (x, y) => ell(x, y, 8, 9, 4.6, 5.8) < 1 ? (nz(x | 0, y | 0, 57) > .72 ? [70, 70, 70] : [200, 200, 200]) : null
  };
  for (const k in MATP) def('i_' + k, I => spr(I, MATP[k]));
  def('i_chain', I => I.fill((x, y) => { const xx = x - 4; return (xx === 4 && (y % 4) !== 3 && y > 1 && y < 15) || ((xx === 3 || xx === 5) && (y % 4) === 1 && y > 1 && y < 15) ? hx(0x4a5468) : null; }));
  def('i_sugar_cane', I => { for (const x of [4, 8, 11]) for (let y = 2; y < 15; y++) { I.set(x, y, y % 5 === 0 ? hx(0x6a9a3a) : hx(0x9ad05a)); I.set(x + 1, y, y % 5 === 0 ? hx(0x5a8a2a) : hx(0x82b84a)); } });
  def('i_bamboo', I => spr(I, (x, y) => Math.abs(DB(x, y)) < 1.1 && DA(x, y) > 2 && DA(x, y) < 21 ? ((DA(x, y) | 0) % 6 === 0 ? hx(0x5a7a20) : pal(PH([0x6e9a2a, 0x7cab32, 0x8aba3a]), DB(x, y) < 0 ? .8 : .3)) : null));
  def('i_pointed_dripstone', I => I.fill((x, y) => Math.abs(x - 7.5) < (16 - y) * .3 && y > 1 ? pal(PH([0x7a5f4f, 0x866a59, 0x947663, 0xa38470]), nz(x, y, 58)) : null));
  def('i_sea_pickle', I => spr(I, (x, y) => ell(x, y, 8, 9, 3, 5) < 1 ? pal(PH([0x4a6a1a, 0x6a8a32, 0x8aaa4a]), clamp(.6 - (x - 8) * .1, 0, .99)) : null));
  def('i_flower_pot', I => spr(I, (x, y) => y > 6 && y < 14 && Math.abs(x - 8) < 4 - (y > 12 ? 1 : 0) ? pal(PH([0x74392a, 0x8f4835, 0x9c523c]), clamp(.6 - (x - 8) * .08, 0, .99)) : y === 6 && Math.abs(x - 8) < 5 ? hx(0x9c523c) : null));
  def('i_brewing_stand', I => { spr(I, (x, y) => { if (x > 7 && x < 9 && y > 1 && y < 13) return hx(0xd6b440); if (y > 12 && y < 14 && x > 2 && x < 14) return hx(0x6a6a6a); for (const cx of [3.5, 12.5]) if (ell(x, y, cx, 10, 1.6, 2.2) < 1) return hx(0x8ad0f0); return null; }); });
  def('i_bell', I => spr(I, (x, y) => { if (y > 3 && y < 13 && Math.abs(x - 8) < 2.5 + (y - 4) * .35) return pal(PH([0xb88a1f, 0xd8a72a, 0xf0c63a, 0xffe16a]), clamp(.6 - (x - 8) * .1, 0, .99)); if (y > 2 && y <= 3 && Math.abs(x - 8) < 1.5) return hx(0xb88a1f); return null; }));
  const campS = soul => I => { spr(I, (x, y) => { const a = (x > 1 && x < 15 && y > 10 && y < 13) || (x > 2 && x < 14 && y > 12 && y < 15 && (x < 5 || x > 11)); if (a) return pal(BARK.oak, nz(x | 0, y | 0, 59)); if (y > 3 && y <= 10 && Math.abs(x - 8) < (y - 3) * .7) return soul ? pal(PH([0x2aa8b8, 0x6ae0e8, 0xc8ffff]), clamp((10 - y) / 7, 0, .99)) : pal(PH([0xe0600a, 0xf8a020, 0xffe060]), clamp((10 - y) / 7, 0, .99)); return null; }); };
  def('i_campfire', campS(0)); def('i_soul_campfire', campS(1));
  def('i_hopper', I => spr(I, (x, y) => { if (y > 2 && y < 7 && x > 1 && x < 15) return pal(PH([0x3a3a3a, 0x4a4a4a, 0x5a5a5a]), nz(x | 0, y | 0, 60)); if (y >= 7 && y < 11 && Math.abs(x - 8) < 4) return hx(0x4a4a4a); if (y >= 11 && y < 14 && Math.abs(x - 8) < 2) return hx(0x3a3a3a); return null; }));
  def('i_repeater', I => { I.fill((x, y) => y > 9 && y < 14 && x > 0 && x < 16 ? pal(PH([0x9c9c9c, 0xa9a9a9]), nz(x, y, 61)) : null); for (const x of [4, 11]) { I.rect(x, 5, x + 1, 9, hx(0x7a5a3a)); I.rect(x, 4, x + 1, 5, hx(0xe02010)); } });
  def('i_comparator', I => { I.fill((x, y) => y > 9 && y < 14 && x > 0 && x < 16 ? pal(PH([0x9c9c9c, 0xa9a9a9]), nz(x, y, 62)) : null); for (const x of [3, 7, 12]) { I.rect(x, 6, x + 1, 9, hx(0x7a5a3a)); I.rect(x, 5, x + 1, 6, hx(0xe02010)); } });
  def('i_lantern', I => { I.copy(get('lantern')); const d = new Uint8ClampedArray(I.d); I.d.fill(0); for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) { const o = (y * 16 + x) * 4; I.d.set(d.subarray(o, o + 4), (y * 16 + x + 5) * 4); } });
  def('i_soul_lantern', I => { I.copy(get('i_lantern')); I.fill((x, y) => { const c = I.get(x, y); return c[3] && c[0] > 200 ? hx(0x70e0e8) : null; }); });
  def('i_copper_lantern', I => { I.copy(get('i_lantern')); I.fill((x, y) => { const c = I.get(x, y); return c[3] && c[0] < 80 ? hx(0xb4684d) : null; }); });
  def('i_straw_bed', I => spr(I, (x, y) => y > 6 && y < 12 && x > 0 && x < 16 ? pal(PH([0x9a7d16, 0xb59520, 0xc9a72b, 0xd8b83a]), nz(x | 0, y | 0, 63)) : null));
  def('i_light', I => spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 7); return d < 4.4 ? pal(PH([0xf0d040, 0xf8e070, 0xffffb0]), clamp(1 - d / 5, 0, .99)) : (y > 11 && y < 14 && Math.abs(x - 8) < 2) ? hx(0x8a8a8a) : null; }));
  def('i_barrier', I => spr(I, (x, y) => { const d = Math.hypot(x - 8, y - 8); return (Math.abs(d - 5.5) < 1.1) || (Math.abs(x - y) < 1.1 && d < 5.5) ? hx(0xe02020) : null; }));
  def('i_structure_void', I => spr(I, (x, y) => (Math.abs(x - 8) < 1 && Math.abs(y - 8) < 4) || (Math.abs(y - 8) < 1 && Math.abs(x - 8) < 4) ? hx(0x60a0e0) : null));
  for (const c of COLORS) {
    const W = WOOLC[c];
    def('i_' + c + '_bed', I => spr(I, (x, y) => { if (y > 6 && y < 11 && x > 0 && x < 16) return x < 5 ? [236, 236, 236] : shd(W, .9 + (y < 8 ? .1 : 0)); if (y >= 11 && y < 13 && (x < 3 || x > 13)) return pal(PLANK.oak, .4); if (y >= 11 && y < 12 && x > 0 && x < 16) return pal(PLANK.oak, .6); return null; }));
    def('i_' + c + '_candle', I => { spr(I, (x, y) => x > 6 && x < 9.5 && y > 4 && y < 14 ? shd(DYE[c], x < 8 ? 1 : .8) : null); I.set(7, 3, [40, 40, 40]); I.set(7, 4, [40, 40, 40]); });
    def('i_' + c + '_banner', I => { spr(I, (x, y) => { if (y < 2 && x > 2 && x < 13) return pal(PLANK.oak, .5); if (x > 3 && x < 12 && y >= 2 && y < 14) return shd(W, .9 + nz(x | 0, y | 0, 64) * .1); if (x > 7 && x < 9 && y >= 14) return pal(PLANK.oak, .5); return null; }); });
  }
  def('i_candle', I => { spr(I, (x, y) => x > 6 && x < 9.5 && y > 4 && y < 14 ? (x < 8 ? [236, 222, 182] : [212, 196, 154]) : null); I.set(7, 3, [40, 40, 40]); I.set(7, 4, [40, 40, 40]); });
  const SIGNC = w => PLANK[w] || PLANK.oak;
  for (const w of WOODS) {
    const P = SIGNC(w.n);
    def('i_' + w.n + '_sign', I => spr(I, (x, y) => { if (x > 0 && x < 16 && y > 2 && y < 10) return pal(P.slice(1, 5), clamp(nz(x | 0, y | 0, 65) * .5 + .3, 0, .99)); if (x > 7 && x < 9.5 && y >= 10 && y < 15) return pal(BARK[w.n] || HAN, .5); return null; }));
    def('i_' + w.n + '_hanging_sign', I => { spr(I, (x, y) => { if (x > 1 && x < 15 && y > 6 && y < 14) return pal(P.slice(1, 5), clamp(nz(x | 0, y | 0, 66) * .5 + .3, 0, .99)); if ((x > 3 && x < 5 || x > 11 && x < 13) && y > 1 && y <= 6) return hx(0x4a5468); return null; }); });
    def('i_' + w.n + '_door', I => doorItem(I, w.n + '_door_top', w.n + '_door_bottom'));
  }
  def('i_iron_door', I => doorItem(I, 'iron_door_top', 'iron_door_bottom'));
  for (const p of ['', 'exposed_', 'weathered_', 'oxidized_']) def('i_' + p + 'copper_door', I => doorItem(I, p + 'copper_door_top', p + 'copper_door_bottom'));
  function doorItem(I, t, b) { const T = get(t), Bt = get(b); for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const src = y < 8 ? T : Bt, sy = (y & 7) * 2, sx = x * 2, o = (sy * 16 + sx) * 4; if (src[o + 3] < 128) continue; I.set(x + 4, y, [src[o], src[o + 1], src[o + 2], 255]); } }
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
  let REGOK = false;
  function initRegistry() {
    if (REGOK) return;
    finalizeBlocks();
    for (const t of TT) if (t.cmodel) for (let k = 0; k < t.n; k++) cmodelTids(t.cmodel(t.base + k, 0));
    REGOK = true;
  }
  function run(root, api, keys, glc) {
    initRegistry();
    const { THREE, renderer } = glc, canvas = glc.canvas;
    const wrap = document.createElement('div');
    wrap.className = 'bc-wrap';
    canvas.removeAttribute('style'); canvas.className = 'bc-gl';
    const hud = cv(16, 16); hud.className = 'bc-hud';
    const inp = document.createElement('input');
    inp.className = 'bc-in'; inp.maxLength = 256; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.spellcheck = false; inp.hidden = true;
    wrap.append(canvas, hud, inp); root.append(wrap);
    const g = hud.getContext('2d');
    let touch = false;
    try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) { }
    renderer.outputEncoding = THREE.LinearEncoding; renderer.toneMapping = THREE.NoToneMapping; renderer.shadowMap.enabled = false; renderer.autoClear = false;
    if (touch) renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.5));
    let SV = api.load(); if (!SV || typeof SV !== 'object') SV = {};
    const s0 = SV.set || {};
    const SET = { rd: clamp(s0.rd | 0 || (touch ? CFG.RD_TOUCH : CFG.RD), 2, 12), fancy: s0.fancy != null ? !!s0.fancy : !touch, fov: clamp(+s0.fov || CFG.FOV, 30, 110), sens: clamp(+s0.sens || 1, .1, 3), music: s0.music !== false, sound: s0.sound !== false, gam: s0.gam != null ? clamp(+s0.gam, 0, 1) : .5, clouds: s0.clouds !== false, bob: s0.bob !== false, gui: s0.gui | 0, smooth: s0.smooth !== false, particles: s0.particles != null ? s0.particles | 0 : 2 };
    const persistSet = () => { SV.set = SET; api.save(SV); };
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(CFG.FOV, 1.6, .05, 1200);
    cam.rotation.order = 'YXZ';
    const hScene = new THREE.Scene(), hCam = new THREE.PerspectiveCamera(70, 1.6, .01, 10);
    const trash = [], keep = o => { trash.push(o); return o; };
    const tex = (c, rep, flip) => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = !!flip; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return keep(t); };
    const atlasC = cv(ATL, ATL), atlasG = atlasC.getContext('2d');
    const atlasImg = atlasG.createImageData(ATL, ATL);
    function putTile(t, d) { const tx = (t & 63) * 16, ty = (t >> 6) * 16; for (let y = 0; y < 16; y++) atlasImg.data.set(d.subarray(y * 64, y * 64 + 64), ((ty + y) * ATL + tx) * 4); }
    for (let i = 0; i < TEXN.length; i++) putTile(i, get(TEXN[i]));
    for (let k = 0; k < ANIMS.length; k++) { const n = ANIMS[k], base = (ANIM_ROW0 + (k >> 2)) * 64 + (k & 3) * 16, fn = ANIMP[n]; for (let f = 0; f < 16; f++) putTile(base + f, fn ? fn(f) : get(n)); }
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
        m.position.set(c.cx * 16, 0, c.cz * 16); m.matrixAutoUpdate = false; m.updateMatrix(); m.renderOrder = ro;
        scene.add(m); r[k] = m;
      }
      c.m[sy] = r;
    }
    function unloadCol(c, k) { for (let s = 0; s < NSEC; s++) { const r = c.m[s]; if (r) for (const kk of ['o', 't']) if (r[kk]) { scene.remove(r[kk]); r[kk].geometry.dispose(); } } W.cols.delete(k); W.dirty.delete(c); W.lastK = -1; }
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
    function blockGeom(s, size) {
      const key = s * 100 + Math.round(size * 50);
      if (geoCache.has(key)) return geoCache.get(key);
      PB.fill(0); PL.fill(0xF0); TGc.fill(0); TFc.fill(0); TWc.fill(0);
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
      geoCache.set(key, keep(gq));
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
    for (const it of IT) {
      const d = itemSpriteData(it);
      if (!d) continue;
      flatIt[it.idx] = 1;
      const k = itaN++, ox = (k & 63) * 16, oy = (k >> 6) * 16;
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const o = (y * 16 + x) * 4, q = ((oy + y) * 1024 + ox + x) * 4; itaImg.data[q] = d[o]; itaImg.data[q + 1] = d[o + 1]; itaImg.data[q + 2] = d[o + 2]; itaImg.data[q + 3] = d[o + 3] > 127 ? 255 : 0; }
      ITIDX.set(it.idx, k);
    }
    itaG.putImageData(itaImg, 0, 0);
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
    function buildIcons() {
      const rt = new THREE.WebGLRenderTarget(64, 64), oc = new THREE.OrthographicCamera(-.82, .82, .82, -.82, .1, 10), sc3 = new THREE.Scene(), buf = new Uint8Array(64 * 64 * 4);
      oc.position.set(2.2, 1.8, 2.2); oc.lookAt(0, 0, 0);
      const tmpC = cv(64, 64), tg = tmpC.getContext('2d'), tim = tg.createImageData(64, 64);
      const mat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true, alphaTest: .5, toneMapped: false, side: THREE.DoubleSide });
      const prevRT = renderer.getRenderTarget(), prevPR = renderer.getPixelRatio();
      for (const it of IT) {
        const ox = (it.idx % ICN) * ICS, oy = (it.idx / ICN | 0) * ICS;
        const k = ITIDX.get(it.idx);
        if (k !== undefined) { icG.drawImage(ITA, (k & 63) * 16, (k >> 6) * 16, 16, 16, ox, oy, ICS, ICS); continue; }
        if (!it.block) continue;
        const t = TN[it.block], s = iconS(t);
        const gq = blockGeom(s, 1);
        const m = new THREE.Mesh(gq, mat);
        sc3.add(m);
        renderer.setRenderTarget(rt); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(sc3, oc);
        renderer.readRenderTargetPixels(rt, 0, 0, 64, 64, buf);
        sc3.remove(m);
        for (let y = 0; y < 64; y++) tim.data.set(buf.subarray((63 - y) * 256, (63 - y) * 256 + 256), y * 256);
        tg.putImageData(tim, 0, 0);
        icG.drawImage(tmpC, ox, oy, ICS, ICS);
      }
      renderer.setRenderTarget(prevRT); renderer.setPixelRatio(prevPR); mat.dispose(); rt.dispose();
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
    for (const k of ['steve', 'alex']) { const sl = k === 'alex', aw = sl ? 3 : 4; MDL[k].parts[2].b = [[-aw + 1, -2, -2, aw, 12, 4, 40, 16], [-aw + 1, -2, -2, aw, 12, 4, 40, 32, .25]]; MDL[k].parts[3].b = [[-1, -2, -2, aw, 12, 4, 32, 48], [-1, -2, -2, aw, 12, 4, 48, 48, .25]]; MDL[k].parts[2].pv = [-5, sl ? 2.5 : 2, 0]; MDL[k].parts[3].pv = [5, sl ? 2.5 : 2, 0]; }
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
      if (part.includes('arm')) { if (f === 'top') return SH; if (f === 'bottom') return mk(SKD, .9); if (py <= 3) return mk(h < .12 ? SHD : SH, .94 + h * .1); return mk(h < .08 ? SKD : SK, .92 + h * .12); }
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
    const MT = {
      pig: { hp: 10, w: .9, h: .9, sp: .25, xp: [1, 3], snd: 'pig', breed: ['carrot', 'potato', 'beetroot'], model: 'pig', eye: .7 },
      cow: { hp: 10, w: .9, h: 1.4, sp: .2, xp: [1, 3], snd: 'cow', breed: ['wheat'], model: 'cow', eye: 1.2 },
      sheep: { hp: 8, w: .9, h: 1.3, sp: .23, xp: [1, 3], snd: 'sheep', breed: ['wheat'], model: 'sheep', eye: 1.1 },
      chicken: { hp: 4, w: .4, h: .7, sp: .25, xp: [1, 3], snd: 'chicken', breed: ['wheat_seeds', 'melon_seeds', 'pumpkin_seeds', 'beetroot_seeds', 'torchflower_seeds', 'pitcher_pod'], model: 'chicken', eye: .6 },
      zombie: { hp: 20, w: .6, h: 1.95, sp: .23, xp: [5, 5], snd: 'zombie', hostile: 1, dmg: 3, burn: 1, model: 'zombie', eye: 1.74, undead: 1 },
      skeleton: { hp: 20, w: .6, h: 1.99, sp: .25, xp: [5, 5], snd: 'skeleton', hostile: 1, burn: 1, model: 'skeleton', ranged: 1, eye: 1.74, undead: 1 },
      creeper: { hp: 20, w: .6, h: 1.7, sp: .25, xp: [5, 5], snd: 'creeper', hostile: 1, model: 'creeper', eye: 1.45 },
      spider: { hp: 16, w: 1.4, h: .9, sp: .3, xp: [5, 5], snd: 'spider', hostile: 1, dmg: 2, model: 'spider', climb: 1, eye: .65 },
      enderman: { hp: 40, w: .6, h: 2.9, sp: .3, xp: [5, 5], snd: 'enderman', hostile: 1, neutral: 1, dmg: 7, model: 'enderman', eye: 2.55 },
      slime: { hp: 16, w: 2.04, h: 2.04, sp: .3, xp: [4, 4], snd: 'slime', hostile: 1, dmg: 4, model: 'slime', eye: 1.3 }
    };
    const ENTS = [];
    let EID = 1;
    const entById = new Map();
    function addEnt(e) { e.id = e.id || EID++; ENTS.push(e); entById.set(e.id, e); if (e.root) scene.add(e.root); return e; }
    function delEnt(e) { e.dead = 2; const i = ENTS.indexOf(e); if (i >= 0) ENTS.splice(i, 1); entById.delete(e.id); if (e.root) { scene.remove(e.root); e.root.traverse(o => { if (o.material && o.material !== e.sharedMat) o.material.dispose && o.material.dispose(); }); } if (e.tag) { e.tag.material.map.dispose(); e.tag.material.dispose(); } }
    const shC = cv(32, 32), shg = shC.getContext('2d'), shGr = shg.createRadialGradient(16, 16, 2, 16, 16, 16);
    shGr.addColorStop(0, 'rgba(0,0,0,.5)'); shGr.addColorStop(.6, 'rgba(0,0,0,.3)'); shGr.addColorStop(1, 'rgba(0,0,0,0)'); shg.fillStyle = shGr; shg.fillRect(0, 0, 32, 32);
    const shGeo = keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), shMat = keep(new THREE.MeshBasicMaterial({ map: tex(shC), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }));
    function nameTag(name) {
      const c = cv(256, 40), x = c.getContext('2d');
      x.font = 'bold 26px monospace';
      const w = Math.min(250, x.measureText(name).width + 16);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect((256 - w) / 2, 4, w, 32);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, 128, 21);
      const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
      s.scale.set(1.6, .25, 1); s.renderOrder = 5;
      return s;
    }
    const WOOLW = { white: .818, black: .05, gray: .05, light_gray: .05, brown: .03, pink: .002 };
    function sheepColor() { let r = RNG(); for (const k in WOOLW) { if ((r -= WOOLW[k]) <= 0) return k; } return 'white'; }
    function spawnMob(type, x, y, z, o) {
      const T = MT[type]; if (!T) return null;
      o = o || {};
      const mat = new THREE.MeshBasicMaterial({ map: skinTex(T.model), vertexColors: true, alphaTest: .1, toneMapped: false });
      const md = instModel(T.model, mat);
      const root = new THREE.Group(); root.add(md.root);
      const sc = o.baby ? .5 : 1;
      md.root.scale.setScalar(type === 'slime' ? (o.size || 2) * .5 * 1.02 : sc);
      const shd2 = new THREE.Mesh(shGeo, shMat); shd2.scale.set(T.w * 1.6, 1, T.w * 1.6); shd2.position.y = .03; shd2.renderOrder = 3; root.add(shd2);
      const e = { kind: 'mob', type, x, y, z, px: x, py: y, pz: z, vx: 0, vy: 0, vz: 0, w: T.w * (type === 'slime' ? (o.size || 2) / 2 : sc), h: T.h * (type === 'slime' ? (o.size || 2) / 2 : sc), yaw: o.yaw ?? RNG() * 6.28, pyaw: 0, hyaw: 0, phyaw: 0, pitch: 0, onGround: false, hp: o.hp ?? T.hp * (type === 'slime' ? Math.pow(o.size || 2, 2) / 4 : 1), maxHp: T.hp, hurtT: 0, fire: 0, cd: 20, age: 0, wT: 0, wYaw: 0, walking: false, panic: 0, limb: 0, limbA: 0, limbP: 0, limbAP: 0, swing: 0, hit: true, root, md, mat, shd: shd2, baby: !!o.baby, babyT: o.baby ? 24000 : 0, love: 0, breedCd: 0, fuse: -1, color: o.color || (type === 'sheep' ? sheepColor() : null), sheared: !!o.sheared, eggT: 6000 + ri(6000), air: 300, target: null, path: null, pathT: 0, angry: 0, persist: !!o.persist, size: o.size || 2, jumpT: 0, see: false };
      e.pyaw = e.yaw; e.hyaw = e.yaw;
      if (type === 'sheep') { const wm = new THREE.MeshBasicMaterial({ map: skinTex('sheep_wool'), vertexColors: true, alphaTest: .1, toneMapped: false }); const wd = instModel('sheep_wool', wm); md.root.add(wd.root); e.wool = wd; e.woolMat = wm; wd.root.visible = !e.sheared; }
      if (type === 'slime') { md.parts.outer.children[0].material = new THREE.MeshBasicMaterial({ map: skinTex('slime'), vertexColors: true, transparent: true, opacity: .6, depthWrite: false, toneMapped: false }); }
      if (type === 'skeleton') { const bow = itemMesh(IN.bow.idx, .7); bow.position.set(.05, -.6, .1); bow.rotation.set(0, Math.PI / 2, -.4); md.parts.larm.add(bow); }
      return addEnt(e);
    }
    function remotePlayer(pid, name) {
      const sk = playerSkinTex(name || pid);
      const mat = new THREE.MeshBasicMaterial({ map: sk.t || sk, vertexColors: true, alphaTest: .1, toneMapped: false });
      const md = instModel(sk.alex ? 'alex' : 'steve', mat);
      const root = new THREE.Group(); root.add(md.root);
      const shd2 = new THREE.Mesh(shGeo, shMat); shd2.scale.set(1, 1, 1); shd2.position.y = .03; root.add(shd2);
      const tag = nameTag(name || 'Player'); tag.position.y = 2.15; root.add(tag);
      const e = { kind: 'player', id: 'p:' + pid, pid, name, x: 0, y: -999, z: 0, px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, vx: 0, vy: 0, vz: 0, w: .6, h: 1.8, yaw: 0, pyaw: 0, hyaw: 0, phyaw: 0, pitch: 0, limb: 0, limbA: 0, limbP: 0, limbAP: 0, swing: 0, hit: true, root, md, mat, tag, held: -1, heldMesh: null, sneak: false, hp: 20, hurtT: 0, age: 0 };
      return addEnt(e);
    }
    function spawnItem(st, x, y, z, vx, vy, vz, delay) {
      if (!st || st.n <= 0) return null;
      if (NET.role === 'guest' && !st._host) { netSend({ t: 'drop', s: encS(st), x, y, z, vx, vy, vz, d: delay }); return null; }
      const items = ENTS.filter(e => e.kind === 'item'); if (items.length > 400) delEnt(items[0]);
      const m = itemMesh(st.id, .25);
      const root = new THREE.Group(); root.add(m);
      const e = { kind: 'item', st: { id: st.id, n: st.n, d: st.d || 0, x: st.x }, x, y, z, px: x, py: y, pz: z, vx: vx ?? (RNG() - .5) * .2, vy: vy ?? .2, vz: vz ?? (RNG() - .5) * .2, w: .25, h: .25, onGround: false, age: ri(100), life: 0, delay: delay ?? 10, root, mesh: m, hit: false, flat: isFlat(st.id) };
      return addEnt(e);
    }
    function spawnXp(n, x, y, z) {
      if (NET.role === 'guest') return;
      while (n > 0) { const v = n >= 17 ? 17 : n >= 7 ? 7 : n >= 3 ? 3 : 1; n -= v; addEnt({ kind: 'xp', v, x, y, z, px: x, py: y, pz: z, vx: (RNG() - .5) * .3, vy: .2 + RNG() * .2, vz: (RNG() - .5) * .3, w: .5, h: .5, age: 0, life: 0, root: xpMesh(v), hit: false }); }
    }
    const xpTex = (() => { const c = cv(16, 16), x = c.getContext('2d'); x.fillStyle = '#c8f040'; x.fillRect(5, 5, 6, 6); x.fillStyle = '#f8ff90'; x.fillRect(6, 6, 3, 3); x.fillStyle = '#6a9a10'; x.fillRect(5, 10, 6, 1); x.fillRect(10, 5, 1, 6); return tex(c); })();
    function xpMesh(v) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: xpTex, transparent: true, depthWrite: false })); const k = v >= 17 ? .5 : v >= 7 ? .4 : v >= 3 ? .32 : .25; s.scale.set(k, k, 1); const g2 = new THREE.Group(); g2.add(s); return g2; }
    function spawnFalling(s, x, y, z) {
      const m = new THREE.Mesh(blockGeom(s, 1), blockMatE.clone());
      const root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'fall', s, x: x + .5, y, z: z + .5, px: x + .5, py: y, pz: z + .5, vx: 0, vy: 0, vz: 0, w: .98, h: .98, age: 0, root, mesh: m, hit: false, fallD: 0 });
    }
    const arrowGeo = (() => {
      const pos = [], cols = [], ix = [];
      const add = (w, h, d, bx2, by, bz, c) => { const gq = new THREE.BoxGeometry(w, h, d), a = gq.attributes.position, n = pos.length / 3, ii = gq.index.array; gq.translate(bx2, by, bz); for (let i = 0; i < a.count; i++) { pos.push(a.getX(i), a.getY(i), a.getZ(i)); cols.push(c[0] / 255, c[1] / 255, c[2] / 255); } for (let i = 0; i < ii.length; i++) ix.push(ii[i] + n); gq.dispose(); };
      add(.035, .035, .5, 0, 0, -.02, [150, 116, 66]); add(.07, .07, .06, 0, 0, .25, [168, 168, 172]); add(.12, .012, .1, 0, 0, -.2, [238, 238, 232]); add(.012, .12, .1, 0, 0, -.2, [206, 206, 200]);
      const gq = new THREE.BufferGeometry(); gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gq.setIndex(ix); return keep(gq);
    })(), arrowMat = keep(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    function spawnArrow(x, y, z, vx, vy, vz, owner, dmg, pick) {
      const m = new THREE.Mesh(arrowGeo, arrowMat), root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'arrow', x, y, z, px: x, py: y, pz: z, vx, vy, vz, w: .5, h: .5, age: 0, stuck: 0, owner, dmg: dmg || 2, pick: !!pick, root, mesh: m, hit: false });
    }
    function spawnThrown(type, x, y, z, vx, vy, vz, owner) {
      const it = IN[type === 'xp_bottle' ? 'experience_bottle' : type === 'splash' ? 'splash_potion' : type];
      const m = itemMesh((it || IN.snowball).idx, .25), root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'thrown', type, x, y, z, px: x, py: y, pz: z, vx, vy, vz, w: .25, h: .25, age: 0, owner, root, mesh: m, hit: false });
    }
    function spawnTNT(x, y, z, fuse) {
      const m = new THREE.Mesh(blockGeom(TN.tnt.base, 1), blockMatE.clone()), root = new THREE.Group(); root.add(m);
      snd('fuse', { x, y, z });
      return addEnt({ kind: 'tnt', x: x + .5, y, z: z + .5, px: x + .5, py: y, pz: z + .5, vx: (RNG() - .5) * .04, vy: .2, vz: (RNG() - .5) * .04, w: .98, h: .98, fuse: fuse ?? 80, root, mesh: m, hit: false, age: 0 });
    }
    function physE(e, grav, drag) {
      e.px = e.x; e.py = e.y; e.pz = e.z;
      e.vy -= grav;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 * (TT[STT[getS(Math.floor(e.x), Math.floor(e.y - .1), Math.floor(e.z))]].slip ? 1.6 : 1) : drag;
      e.vx *= Math.min(.98, fr); e.vz *= Math.min(.98, fr); e.vy *= .98;
    }
    function tickItem(e) {
      e.age++; e.life++;
      if (e.delay > 0) e.delay--;
      const inW = FLU[getS(Math.floor(e.x), Math.floor(e.y + .1), Math.floor(e.z))] === 1, inL = FLU[getS(Math.floor(e.x), Math.floor(e.y + .1), Math.floor(e.z))] === 2;
      if (inL && IT[e.st.id].id.indexOf('netherite') < 0) { burstAt(e.x, e.y, e.z, [255, 120, 30], 4); snd('fizz', e); delEnt(e); return; }
      if (!boxFree(e, 0, 0, 0)) { e.y += .1; e.vy = .1; }
      e.px = e.x; e.py = e.y; e.pz = e.z;
      if (inW) { e.vy += .01; e.vy *= .8; } else e.vy -= .04;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 : inW ? .85 : .98;
      e.vx *= fr; e.vz *= fr; e.vy *= .98;
      if (e.life > 6000 || e.y < -64) { delEnt(e); return; }
      if (e.life % 20 === 0) for (const o of ENTS) if (o !== e && o.kind === 'item' && o.st.id === e.st.id && !IT[o.st.id].dur && Math.abs(o.x - e.x) < .5 && Math.abs(o.y - e.y) < .5 && Math.abs(o.z - e.z) < .5 && o.st.n + e.st.n <= IT[e.st.id].stack) { e.st.n += o.st.n; delEnt(o); break; }
      if (e.delay <= 0) {
        for (const pl of playersList()) {
          if (pl.dead || pl.spec) continue;
          if (Math.abs(e.x - pl.x) < 1.3 && e.y > pl.y - .7 && e.y < pl.y + 2.4 && Math.abs(e.z - pl.z) < 1.3) {
            if (pl === P) { const left = giveItem(e.st, true); if (left < e.st.n) { snd('pop'); pickupAnim(e); } if (left <= 0) { delEnt(e); return; } e.st.n = left; }
            else { netSendTo(pl.pid, { t: 'give', s: encS(e.st) }); snd('pop', e); delEnt(e); return; }
          }
        }
      }
    }
    function pickupAnim(e) { void e; }
    function tickXp(e) {
      e.age++; e.life++;
      e.px = e.x; e.py = e.y; e.pz = e.z;
      let tgt = null, bd = 64;
      for (const pl of playersList()) { if (pl.dead || pl.spec) continue; const d = (pl.x - e.x) ** 2 + (pl.y + .9 - e.y) ** 2 + (pl.z - e.z) ** 2; if (d < bd) { bd = d; tgt = pl; } }
      if (tgt) { const d = Math.sqrt(bd), f = (1 - d / 8) ** 2 * .1; e.vx += (tgt.x - e.x) / d * f; e.vy += (tgt.y + .9 - e.y) / d * f; e.vz += (tgt.z - e.z) / d * f; if (d < 1 && e.age > 10) { if (tgt === P) addXp(e.v); else netSendTo(tgt.pid, { t: 'xp', v: e.v }); snd('orb'); delEnt(e); return; } }
      e.vy -= .03;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 : .98; e.vx *= fr; e.vz *= fr; e.vy *= .98;
      if (e.life > 6000) delEnt(e);
    }
    function tickFall(e) {
      e.age++;
      e.px = e.x; e.py = e.y; e.pz = e.z;
      e.vy = (e.vy - .04) * .98;
      const y0 = e.y;
      moveE(e, 0, e.vy, 0, false, 0);
      e.fallD += y0 - e.y;
      const t = TT[STT[e.s]];
      if (t.anvil !== undefined) for (const o of ENTS.concat([P])) if (o.hit && Math.abs(o.x - e.x) < .8 && Math.abs(o.z - e.z) < .8 && o.y < e.y + .5 && o.y + o.h > e.y && e.vy < -.1) { hurtEnt(o, Math.min(40, Math.ceil(e.fallD - 1) * 2), null, 'anvil'); }
      if (t.powder2 && blockIn(e, b => FLU[b] === 1)) { const bx = Math.floor(e.x), by = Math.floor(e.y + .5), bz = Math.floor(e.z); setBlock(bx, by, bz, TN[t.powder2].base); delEnt(e); return; }
      if (e.onGround || e.age > 600) {
        const bx = Math.floor(e.x), by = Math.floor(e.y + .5), bz = Math.floor(e.z), cur = getS(bx, by, bz);
        if ((REP[cur] || SHP[cur] === 0) && !FLU[cur] || FLU[cur]) { setBlock(bx, by, bz, e.s); playBlockSnd(e.s, 'place', bx, by, bz); if (t.anvil !== undefined) snd('anvil_land', e); }
        else spawnItem({ id: blockItemOf(e.s), n: 1 }, e.x, e.y + .5, e.z);
        delEnt(e);
      }
    }
    function blockItemOf(s) { const t = TT[STT[s]]; const n = typeof t.item === 'string' ? t.item : t.id; return IN[n] ? IN[n].idx : IN.stone.idx; }
    function tickArrow(e) {
      e.age++; e.px = e.x; e.py = e.y; e.pz = e.z;
      if (e.stuck) { if (e.pick && e.age > 10 && Math.abs(P.x - e.x) < 1.2 && Math.abs(P.y + .9 - e.y) < 1.5 && Math.abs(P.z - e.z) < 1.2 && !P.dead) { if (giveItem({ id: IN.arrow.idx, n: 1 }, true) === 0) { snd('pop'); delEnt(e); return; } } if (++e.stuck > 1200) delEnt(e); if (!solidAt(Math.floor(e.x), Math.floor(e.y), Math.floor(e.z))) { e.stuck = 0; } return; }
      if (e.age > 1200 || e.y < -64) { delEnt(e); return; }
      const sp = Math.hypot(e.vx, e.vy, e.vz), n = Math.max(1, Math.ceil(sp * 3));
      for (let s = 0; s < n; s++) {
        const nx = e.x + e.vx / n, ny = e.y + e.vy / n, nz2 = e.z + e.vz / n;
        for (const o of ENTS.concat(NET.role === 'guest' ? [] : [P])) {
          if (!o.hit || o === e.owner || o.dead || (o === P && P.spec)) continue;
          if (e.age < 3 && o === e.owner) continue;
          const hw = o.w / 2 + .15;
          if (nx > o.x - hw && nx < o.x + hw && nz2 > o.z - hw && nz2 < o.z + hw && ny > o.y && ny < o.y + o.h) {
            const dmg = Math.ceil(sp * e.dmg);
            hurtEnt(o, dmg, e.owner || e, 'arrow', e.vx, e.vz);
            snd('arrow_hit', e); delEnt(e); return;
          }
        }
        const b = getS(Math.floor(nx), Math.floor(ny), Math.floor(nz2));
        if (SOL[b]) {
          const L = blockBoxes(b, Math.floor(nx), Math.floor(ny), Math.floor(nz2)) || [];
          const lx = nx - Math.floor(nx), ly = ny - Math.floor(ny), lz = nz2 - Math.floor(nz2);
          if (L.some(c => lx > c[0] && lx < c[3] && ly > c[1] && ly < c[4] && lz > c[2] && lz < c[5])) { e.stuck = 1; snd('arrow_land', e); e.x = nx; e.y = ny; e.z = nz2; if (TT[STT[b]].tnt === undefined) { } if (TT[STT[b]].id === 'target') { } return; }
        }
        e.x = nx; e.y = ny; e.z = nz2;
      }
      const w = FLU[getS(Math.floor(e.x), Math.floor(e.y), Math.floor(e.z))] === 1 ? .6 : .99;
      e.vx *= w; e.vy = e.vy * w - .05; e.vz *= w;
    }
    function tickThrown(e) {
      e.age++; e.px = e.x; e.py = e.y; e.pz = e.z;
      const n = 3;
      for (let s = 0; s < n; s++) {
        const nx = e.x + e.vx / n, ny = e.y + e.vy / n, nz2 = e.z + e.vz / n;
        let hitE = null;
        for (const o of ENTS.concat([P])) { if (!o.hit || o === e.owner || o.dead || (o === P && (NET.role === 'guest' || P.spec))) continue; const hw = o.w / 2 + .1; if (nx > o.x - hw && nx < o.x + hw && nz2 > o.z - hw && nz2 < o.z + hw && ny > o.y && ny < o.y + o.h) { hitE = o; break; } }
        const bs = getS(Math.floor(nx), Math.floor(ny), Math.floor(nz2));
        if (hitE || SOL[bs] === 1 || (SOL[bs] && !boxFree({ x: nx, y: ny - .1, z: nz2, w: .2, h: .2 }, 0, 0, 0))) {
          if (e.type === 'snowball') { if (hitE) hurtEnt(hitE, hitE.type === 'blaze' ? 3 : 0, e.owner, 'snowball', e.vx, e.vz); for (let i = 0; i < 8; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [240, 248, 255], .4, .06, 10); }
          else if (e.type === 'egg') { if (hitE) hurtEnt(hitE, 0, e.owner, 'egg', e.vx, e.vz); for (let i = 0; i < 8; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [240, 230, 200], .4, .05, 10); if (RNG() < 1 / 8 && NET.role !== 'guest') { const k = RNG() < 1 / 32 ? 4 : 1; for (let i = 0; i < k; i++) spawnMob('chicken', nx, ny, nz2, { baby: true }); } }
          else if (e.type === 'ender_pearl') { if (e.owner === P) { P.x = nx; P.y = ny; P.z = nz2; P.vx = P.vy = P.vz = 0; P.fall = 0; if (mode() !== 'creative') hurtPlayer(5, null, null, 'fall'); } for (let i = 0; i < 20; i++) particle(nx, ny, nz2, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [180, 60, 220], .6, .06, -1, 1); snd('teleport', e); }
          else if (e.type === 'xp_bottle') { spawnXp(3 + ri(9), nx, ny, nz2); for (let i = 0; i < 12; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [90, 140, 255], .6, .06, 4, 1); snd('glass_break', e); }
          else if (e.type === 'splash') { for (let i = 0; i < 16; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [56, 92, 220], .6, .06, 6); snd('glass_break', e); for (const o of ENTS.concat([P])) if (Math.hypot(o.x - nx, o.y - ny, o.z - nz2) < 4) { o.fire = 0; if (o.type === 'enderman') hurtEnt(o, 1, e.owner, 'water'); } for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (TT[STT[getS(Math.floor(nx) + dx, Math.floor(ny) + dy, Math.floor(nz2) + dz)]].fire) setBlock(Math.floor(nx) + dx, Math.floor(ny) + dy, Math.floor(nz2) + dz, 0); }
          else if (e.type === 'wind_charge') { explode(nx, ny, nz2, 1.2, e.owner, true); }
          delEnt(e); return;
        }
        e.x = nx; e.y = ny; e.z = nz2;
      }
      e.vx *= .99; e.vy = e.vy * .99 - .03; e.vz *= .99;
      if (e.age > 600) delEnt(e);
    }
    function tickTNT(e) {
      physE(e, .04, .98);
      if (e.fuse % 5 === 0) particle(e.x, e.y + 1, e.z, 0, .5, 0, [90, 90, 90], .6, .08, -.5);
      if (--e.fuse <= 0) { delEnt(e); explode(e.x, e.y + .49, e.z, 4, null); }
    }
    function explode(x, y, z, power, src, noBlocks) {
      snd('explode', { x, y, z });
      const big = power > 2;
      for (let i = 0; i < (big ? 24 : 8); i++) particle(x + (RNG() - .5) * power, y + (RNG() - .5) * power, z + (RNG() - .5) * power, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [230, 230, 230], .8 + RNG() * .6, .3 + RNG() * .5, -.5, 1);
      if (NET.role === 'guest') return;
      const destroyed = new Set();
      const grief = !noBlocks && W.rules.mobGriefing !== false && !(src && src.kind === 'mob' && W.rules.mobGriefing === false) && mode() !== 'adventure' || (!noBlocks && !src);
      if (grief && !noBlocks) for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) for (let k = 0; k < 16; k++) {
        if (i !== 0 && i !== 15 && j !== 0 && j !== 15 && k !== 0 && k !== 15) continue;
        let dx = i / 15 * 2 - 1, dy = j / 15 * 2 - 1, dz = k / 15 * 2 - 1;
        const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        let f = power * (.7 + RNG() * .6), px = x, py = y, pz = z;
        while (f > 0) {
          const bx = Math.floor(px), by = Math.floor(py), bz = Math.floor(pz), s = getS(bx, by, bz);
          if (s) { const t = TT[STT[s]]; f -= (Math.min(3600000, FLU[s] ? 100 : t.res) + .3) * .3; if (f > 0 && !FLU[s]) destroyed.add(bx + ',' + by + ',' + bz); }
          px += dx * .3; py += dy * .3; pz += dz * .3; f -= .225;
        }
      }
      for (const k of destroyed) {
        const [bx, by, bz] = k.split(',').map(Number), s = getS(bx, by, bz), t = TT[STT[s]];
        if (t.tnt) { setBlock(bx, by, bz, 0); spawnTNT(bx, by, bz, 10 + ri(20)); continue; }
        if (t.hard < 0) continue;
        if (RNG() < 1 / power) dropBlock(s, bx, by, bz, { explosion: 1 });
        removeBlockEntity(bx, by, bz, true);
        setBlock(bx, by, bz, 0);
      }
      const R = power * 2;
      for (const o of ENTS.concat(playersList().filter(p => p === P))) {
        if (!o.hit || o.dead) continue;
        const d = Math.hypot(o.x - x, o.y + o.h / 2 - y, o.z - z) / R;
        if (d > 1) continue;
        let seen = 0; for (let k = 0; k < 4; k++) { const tx = o.x + (k & 1 ? .2 : -.2), ty = o.y + o.h * (k < 2 ? .25 : .75), tz = o.z; if (losClear(x, y, z, tx, ty, tz)) seen++; }
        const imp = (1 - d) * seen / 4, dmg = Math.floor((imp * imp + imp) / 2 * 7 * power + 1);
        const kx = (o.x - x) / (d * R + .01), kz = (o.z - z) / (d * R + .01);
        if (imp > 0) { hurtEnt(o, noBlocks ? 0 : dmg * difMul(o), src, 'explosion', 0, 0); o.vx += kx * imp * (noBlocks ? 1.5 : 1); o.vy += imp * (noBlocks ? 1.2 : .8); o.vz += kz * imp * (noBlocks ? 1.5 : 1); }
      }
      for (const o of ENTS) if (o.kind === 'item' && Math.hypot(o.x - x, o.y - y, o.z - z) < power && !noBlocks) delEnt(o);
      for (const pl of playersList()) if (pl !== P && Math.hypot(pl.x - x, pl.y - y, pl.z - z) < R) { const d = Math.hypot(pl.x - x, pl.y + .9 - y, pl.z - z) / R, imp = 1 - d; netSendTo(pl.pid, { t: 'hurt', d: noBlocks ? 0 : Math.floor((imp * imp + imp) / 2 * 7 * power + 1), kx: (pl.x - x) * imp * .3, ky: imp * .8, kz: (pl.z - z) * imp * .3, k: 'explosion' }); }
      netSend({ t: 'boom', x, y, z, p: power });
    }
    const difMul = o => o === P || o.kind === 'player' ? [0, .5, 1, 1.5][W.diff] ?? 1 : 1;
    function losClear(x0, y0, z0, x1, y1, z1) {
      const d = Math.hypot(x1 - x0, y1 - y0, z1 - z0), n = Math.ceil(d * 2);
      for (let i = 1; i < n; i++) { const t = i / n; if (OPQ[getS(Math.floor(lerp(x0, x1, t)), Math.floor(lerp(y0, y1, t)), Math.floor(lerp(z0, z1, t)))]) return false; }
      return true;
    }
    const turn = (a, b, s) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + clamp(d, -s, s); };
    function hurtEnt(o, dmg, src, kind, kx, kz) {
      if (o === P) { hurtPlayer(dmg, src ? src.x : null, src ? src.z : null, kind); return; }
      if (o.kind === 'player') { netSendTo(o.pid, { t: 'hurt', d: dmg, sx: src ? src.x : null, sz: src ? src.z : null, k: kind }); return; }
      if (o.kind !== 'mob' || o.dead) return;
      if (NET.role === 'guest') { netSend({ t: 'atk', id: o.id, d: dmg, kx: kx || (src ? o.x - src.x : 0), kz: kz || (src ? o.z - src.z : 0), k: kind }); return; }
      if (o.hurtT > 10 && dmg <= (o.lastDmg || 0)) return;
      const real = o.hurtT > 10 ? dmg - (o.lastDmg || 0) : dmg;
      o.lastDmg = dmg;
      o.hp -= real; o.hurtT = 20;
      if (dmg > 0) for (let i = 0; i < 4; i++) particle(o.x + (RNG() - .5) * o.w, o.y + o.h * (.3 + RNG() * .6), o.z + (RNG() - .5) * o.w, (RNG() - .5) * 2, RNG() * 2 + .5, (RNG() - .5) * 2, [180 + RNG() * 50, 20, 20], .4, .05, 14);
      let dx = kx || 0, dz = kz || 0;
      if (src && !kx) { dx = o.x - src.x; dz = o.z - src.z; }
      const d = Math.hypot(dx, dz);
      if (d > 1e-4 && kind !== 'fire' && kind !== 'drown' && kind !== 'starve') { o.vx = o.vx / 2 + dx / d * .4; o.vz = o.vz / 2 + dz / d * .4; o.vy = Math.min(.4, o.vy / 2 + .4); }
      const T = MT[o.type];
      if (!T.hostile) { o.panic = 60 + ri(40); }
      if (T.neutral && src && (src === P || src.kind === 'player')) { o.angry = 600; o.target = src; }
      if (T.hostile && src && (src === P || src.kind === 'player')) o.target = src;
      if (src === P || (src && src.kind === 'player')) o.byP = src;
      snd(T.snd + '_hurt', o);
      if (o.type === 'enderman' && kind === 'arrow') { teleportMob(o); }
      if (o.hp <= 0) { o.dead = 1; snd(T.snd + '_death', o); }
    }
    function killMob(e) {
      for (let i = 0; i < 14; i++) particle(e.x + (RNG() - .5) * e.w, e.y + RNG() * e.h, e.z + (RNG() - .5) * e.w, (RNG() - .5) * 1.2, RNG() * 1.5, (RNG() - .5) * 1.2, [230, 230, 230], .6 + RNG() * .5, .1 + RNG() * .1, -1, 1);
      const T = MT[e.type], cooked = e.fire > 0, r = n => ri(n + 1), D = [];
      if (!e.baby) {
        if (e.type === 'pig') D.push([cooked ? 'cooked_porkchop' : 'porkchop', 1 + r(2)]);
        else if (e.type === 'cow') D.push([cooked ? 'cooked_beef' : 'beef', 1 + r(2)], ['leather', r(2)]);
        else if (e.type === 'sheep') { D.push([cooked ? 'cooked_mutton' : 'mutton', 1 + r(1)]); if (!e.sheared) D.push([e.color + '_wool', 1]); }
        else if (e.type === 'chicken') D.push([cooked ? 'cooked_chicken' : 'chicken', 1], ['feather', r(2)]);
        else if (e.type === 'zombie') { D.push(['rotten_flesh', r(2)]); if (e.byP && RNG() < .025) D.push([['iron_ingot', 'carrot', 'potato'][ri(3)], 1]); }
        else if (e.type === 'skeleton') D.push(['bone', r(2)], ['arrow', r(2)]);
        else if (e.type === 'creeper') D.push(['gunpowder', r(2)]);
        else if (e.type === 'spider') { D.push(['string', r(2)]); if (e.byP && RNG() < 1 / 3) D.push(['spider_eye', 1]); }
        else if (e.type === 'enderman') D.push(['ender_pearl', r(1)]);
        else if (e.type === 'slime' && e.size === 1) D.push(['slime_ball', r(2)]);
      }
      if (W.rules.doMobLoot !== false) for (const [id, n] of D) if (n > 0 && IN[id]) spawnItem({ id: IN[id].idx, n }, e.x, e.y + .5, e.z);
      if (e.byP && !e.baby && T.xp) spawnXp(e.type === 'slime' ? e.size : rr(T.xp[0], T.xp[1]), e.x, e.y + .5, e.z);
      if (e.type === 'slime' && e.size > 1) for (let i = 0; i < 2 + ri(3); i++) spawnMob('slime', e.x + (RNG() - .5), e.y + .5, e.z + (RNG() - .5), { size: e.size / 2 });
      delEnt(e);
    }
    function teleportMob(e) {
      for (let k = 0; k < 16; k++) {
        const x = Math.floor(e.x + (RNG() - .5) * 32), z = Math.floor(e.z + (RNG() - .5) * 32);
        let y = Math.floor(e.y + 16);
        while (y > e.y - 16 && !SOL[getS(x, y - 1, z)]) y--;
        if (SOL[getS(x, y - 1, z)] && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)] && !SOL[getS(x, y + 2, z)] && !FLU[getS(x, y, z)]) { for (let i = 0; i < 12; i++) particle(e.x, e.y + RNG() * 2.5, e.z, (RNG() - .5) * 2, RNG(), (RNG() - .5) * 2, [180, 60, 220], .6, .06, -1, 1); e.x = x + .5; e.y = y; e.z = z + .5; e.px = e.x; e.py = e.y; e.pz = e.z; snd('teleport', e); return true; }
      }
      return false;
    }
    const walkable = (x, y, z, h) => { const fl = getS(x, y - 1, z); if (!(SOL[fl] || FLU[fl] === 1)) return false; if (TT[STT[fl]].id === 'lava' || TT[STT[fl]].hurt || TT[STT[fl]].magma) return false; for (let k = 0; k < h; k++) { const b = getS(x, y + k, z); if (SOL[b] === 1 || (SOL[b] && !TT[STT[b]].door) || FLU[b] === 2 || TT[STT[b]].fire) return false; } return true; };
    function findPath(e, tx, ty, tz, maxN) {
      const sx = Math.floor(e.x), sy = Math.floor(e.y + .01), sz = Math.floor(e.z), hh = Math.ceil(e.h), K = (x, y, z) => x * 73856093 ^ y * 19349663 ^ z * 83492791;
      const open = [[sx, sy, sz, 0, Math.abs(tx - sx) + Math.abs(ty - sy) + Math.abs(tz - sz), null]], seen = new Map([[K(sx, sy, sz), 0]]);
      let best = open[0], n = 0;
      while (open.length && n++ < (maxN || 260)) {
        let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][3] + open[i][4] < open[bi][3] + open[bi][4]) bi = i;
        const c = open.splice(bi, 1)[0];
        if (c[4] < best[4]) best = c;
        if (c[4] <= 1) { best = c; break; }
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (const dy of [0, 1, -1, -2, -3]) {
          const x = c[0] + dx, y = c[1] + dy, z = c[2] + dz;
          if (dy === 1 && SOL[getS(c[0], c[1] + hh, c[2])]) continue;
          if (!walkable(x, y, z, hh)) continue;
          if (dy < 0) { let ok = true; for (let k = 0; k > dy; k--) if (SOL[getS(x, c[1] + k, z)] === 1) ok = false; if (!ok) continue; }
          const k = K(x, y, z), g2 = c[3] + 1 + (dy > 0 ? .5 : 0) + (FLU[getS(x, y, z)] ? 2 : 0);
          if (seen.has(k) && seen.get(k) <= g2) continue;
          seen.set(k, g2);
          open.push([x, y, z, g2, Math.abs(tx - x) + Math.abs(ty - y) * 1.5 + Math.abs(tz - z), c]);
          break;
        }
      }
      const path = []; let c = best; while (c && c[5]) { path.push([c[0] + .5, c[1], c[2] + .5]); c = c[5]; }
      return path.reverse();
    }
    function nearestPlayer(e, r, needLos) {
      let best = null, bd = r * r;
      for (const pl of playersList()) {
        if (pl.dead || pl.spec || (pl === P && (mode() === 'creative' || mode() === 'spectator'))) continue;
        if (pl.kind === 'player' && pl.creative) continue;
        const d = (pl.x - e.x) ** 2 + (pl.y - e.y) ** 2 + (pl.z - e.z) ** 2;
        if (d < bd && (!needLos || losClear(e.x, e.y + e.h * .85, e.z, pl.x, pl.y + 1.6, pl.z))) { bd = d; best = pl; }
      }
      return best;
    }
    function tickMob(e) {
      e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
      e.limbP = e.limb; e.limbAP = e.limbA;
      const T = MT[e.type];
      e.px = e.x; e.py = e.y; e.pz = e.z;
      if (e.dead) { if (++e.dead >= 20) killMob(e); return; }
      if (e.hurtT > 0) e.hurtT--;
      if (e.cd > 0) e.cd--;
      if (e.swing > 0) e.swing--;
      if (e.breedCd > 0) e.breedCd--;
      if (e.love > 0) e.love--;
      if (e.baby && --e.babyT <= 0) { e.baby = false; e.md.root.scale.setScalar(1); e.w = T.w; e.h = T.h; }
      if (W.diff === 0 && T.hostile && !e.persist) { delEnt(e); return; }
      const inW = fluidIn(e, 1), inL = fluidIn(e, 2);
      let fwd = 0, sp = T.sp, lookP = null, jump = false;
      const daylight = sunB > .5 && !W.raining;
      if (T.hostile && !T.neutral && e.type !== 'spider') { if (!e.target || e.target.dead || (e.age % 20 === 0 && Math.hypot(e.target.x - e.x, e.target.z - e.z) > 40)) e.target = nearestPlayer(e, 35, true); }
      else if (e.type === 'spider') { const br2 = brAt(e.x, e.y + .5, e.z); if (e.age % 20 === 0 && (!e.target || br2 > .55 && !e.angry)) e.target = br2 < .5 || e.angry ? nearestPlayer(e, 16, true) : null; }
      else if (e.type === 'enderman') { if (e.age % 5 === 0 && !e.angry) for (const pl of playersList()) { if (pl === P && mode() !== 'survival' && mode() !== 'adventure') continue; const dx = e.x - pl.x, dy = e.y + 2.55 - (pl.y + 1.62), dz = e.z - pl.z, d = Math.hypot(dx, dy, dz); if (d > 64 || pl !== P) continue; const lx = -Math.sin(P.yaw) * Math.cos(P.pitch), ly = Math.sin(P.pitch), lz = -Math.cos(P.yaw) * Math.cos(P.pitch); if ((lx * dx + ly * dy + lz * dz) / d > 1 - .025 / d * 2 && losClear(pl.x, pl.y + 1.62, pl.z, e.x, e.y + 2.55, e.z)) { e.angry = 400; e.target = pl; snd('enderman_scream', e); } } if (e.angry > 0 && --e.angry === 0) e.target = null; if ((inW || (W.raining && skyOpen(e))) && e.age % 10 === 0) { hurtEnt(e, 1, null, 'water'); teleportMob(e); } }
      const tg = e.target;
      if (tg && T.hostile) {
        const dx = tg.x - e.x, dz = tg.z - e.z, dy = tg.y - e.y, dist = Math.hypot(dx, dz), aim = Math.atan2(-dx, -dz);
        lookP = tg;
        if (e.type === 'creeper') {
          if (dist < 3 && Math.abs(dy) < 3) { if (e.fuse < 0) { e.fuse = 0; snd('fuse', e); } }
          else if (e.fuse >= 0 && dist > 7) e.fuse = -1;
          if (e.fuse >= 0) { e.fuse++; fwd = 0; if (e.fuse >= 30) { delEnt(e); explode(e.x, e.y + .8, e.z, 3, e); return; } }
          else { if (dist > 1.5) fwd = 1; }
        } else if (T.ranged) {
          if (e.age % 10 === 0) e.see = losClear(e.x, e.y + 1.6, e.z, tg.x, tg.y + 1.6, tg.z);
          fwd = !e.see || dist > 12 ? 1 : dist < 5 ? -.8 : 0;
          if (e.see && dist < 14) { e.yaw = turn(e.yaw, aim, .5); if (e.cd === 0) { shootAt(e, tg); e.cd = [60, 40, 30, 20][W.diff] || 40; } }
        } else {
          if (dist > 1.1) fwd = 1;
          const reach = e.w * 2 + tg.w;
          if (dist * dist + dy * dy * .25 < reach * reach * .36 + .9 && Math.abs(dy) < 2 && e.cd === 0) { hurtEnt(tg, (T.dmg + (W.diff === 3 ? T.dmg * .5 : W.diff === 1 ? -T.dmg * .3 : 0)) | 0 || 1, e, 'mob'); e.cd = 20; e.swing = 6; if (e.type === 'spider') { } }
          if (e.type === 'spider' && e.onGround && dist > 2 && dist < 6 && RNG() < .1) { e.vy = .42; e.vx += dx / dist * .3; e.vz += dz / dist * .3; }
          if (e.type === 'slime' && e.onGround && --e.jumpT <= 0) { e.jumpT = 20 + ri(20); e.vy = .42 + e.size * .05; e.vx = dx / dist * .25; e.vz = dz / dist * .25; snd('slime', e); }
        }
        if (fwd > 0 && e.type !== 'slime') {
          if (--e.pathT <= 0 || !e.path) { e.path = findPath(e, Math.floor(tg.x), Math.floor(tg.y), Math.floor(tg.z), 300); e.pathT = 15 + ri(10); }
          let wx = tg.x, wz = tg.z;
          if (e.path && e.path.length) { const n = e.path[0]; if (Math.hypot(n[0] - e.x, n[2] - e.z) < .45) e.path.shift(); if (e.path.length) { wx = e.path[0][0]; wz = e.path[0][2]; if (e.path[0][1] > e.y + .5) jump = true; } }
          e.yaw = turn(e.yaw, Math.atan2(-(wx - e.x), -(wz - e.z)), .6);
        } else if (fwd < 0) e.yaw = turn(e.yaw, aim, .5);
        if (T.burn && daylight) { }
      } else if (e.panic > 0) {
        e.panic--; fwd = 1; sp *= 1.25;
        if (e.panic % 20 === 0 || e.collH) e.wYaw = RNG() * 6.28;
        e.yaw = turn(e.yaw, e.wYaw, .5);
      } else {
        let fol = null;
        if (T.breed && e.age % 10 === 0) { for (const pl of playersList()) { if (pl.dead) continue; const d = Math.hypot(pl.x - e.x, pl.z - e.z); const h = pl === P ? held() : pl.heldId >= 0 ? { id: pl.heldId } : null; if (d < 10 && h && T.breed.includes(IT[h.id].id)) { fol = pl; break; } } e.fol = fol; }
        fol = e.fol;
        if (e.love > 0) { let mate = null, bd = 64; for (const o of ENTS) if (o !== e && o.kind === 'mob' && o.type === e.type && o.love > 0 && !o.baby) { const d = (o.x - e.x) ** 2 + (o.z - e.z) ** 2; if (d < bd) { bd = d; mate = o; } } if (mate) { if (bd < 2) { if (NET.role !== 'guest' && e.id < mate.id) { const b = spawnMob(e.type, (e.x + mate.x) / 2, e.y, (e.z + mate.z) / 2, { baby: true, color: e.type === 'sheep' ? (RNG() < .5 ? e.color : mate.color) : null }); void b; spawnXp(1 + ri(7), e.x, e.y + .5, e.z); for (let i = 0; i < 6; i++) particle(e.x, e.y + 1, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, -.5, 1); } e.love = mate.love = 0; e.breedCd = mate.breedCd = 6000; } else { e.yaw = turn(e.yaw, Math.atan2(-(mate.x - e.x), -(mate.z - e.z)), .5); fwd = 1; } } }
        else if (fol) { const dx = fol.x - e.x, dz = fol.z - e.z, d = Math.hypot(dx, dz); lookP = fol; if (d > 2) { e.yaw = turn(e.yaw, Math.atan2(-dx, -dz), .4); fwd = 1; } }
        else {
          if (--e.wT <= 0) { e.walking = RNG() < (T.hostile ? .3 : .45); e.wYaw = RNG() * 6.28; e.wT = 60 + ri(120); }
          if (e.walking) { e.yaw = turn(e.yaw, e.wYaw, .25); fwd = .8; }
          if (!e.walking && e.age % 40 === 0 && RNG() < .3) { const pl = nearestPlayer(e, 8, false); e.lookAtP = pl; }
          lookP = e.lookAtP;
          if (e.type === 'slime' && e.onGround && --e.jumpT <= 0) { e.jumpT = 30 + ri(40); e.vy = .42; e.yaw = RNG() * 6.28; e.vx = -Math.sin(e.yaw) * .2; e.vz = -Math.cos(e.yaw) * .2; }
        }
        if (e.type === 'sheep' && e.sheared && RNG() < 1 / 1000) { const bx = Math.floor(e.x), by = Math.floor(e.y - .5), bz = Math.floor(e.z); if (isT(getS(bx, by, bz), 'grass_block') && NET.role !== 'guest') { setBlock(bx, by, bz, TN.dirt.base); e.sheared = false; e.wool.root.visible = true; e.eat = 40; } }
        if (!T.hostile && RNG() < .003) snd(T.snd, e);
        if (T.hostile && RNG() < .004) snd(T.snd, e);
        if (e.type === 'chicken' && --e.eggT <= 0 && !e.baby) { e.eggT = 6000 + ri(6000); spawnItem({ id: IN.egg.idx, n: 1 }, e.x, e.y + .3, e.z); snd('pop', e); }
      }
      if (e.eat > 0) e.eat--;
      if (lookP) { e.hyaw = turn(e.hyaw, Math.atan2(-(lookP.x - e.x), -(lookP.z - e.z)), .35); e.pitch = clamp(Math.atan2((lookP.y + 1.6) - (e.y + T.eye), Math.hypot(lookP.x - e.x, lookP.z - e.z)), -.8, .8); }
      else { e.hyaw = turn(e.hyaw, e.yaw, .2); e.pitch *= .9; }
      e.hyaw = e.yaw + clamp(((e.hyaw - e.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI, -1.2, 1.2);
      for (const o of ENTS) if (o !== e && o.kind === 'mob' && !o.dead) { const ox = e.x - o.x, oz = e.z - o.z, d2 = Math.hypot(ox, oz), r = (e.w + o.w) / 2; if (d2 < r && d2 > 1e-4 && Math.abs(e.y - o.y) < Math.max(e.h, o.h)) { e.vx += ox / d2 * .03; e.vz += oz / d2 * .03; } }
      for (const pl of playersList()) { if (pl.dead) continue; const dx = e.x - pl.x, dz = e.z - pl.z, d2 = Math.hypot(dx, dz), r = (e.w + pl.w) / 2; if (d2 < r && d2 > 1e-4 && Math.abs(e.y - pl.y) < e.h) { const f = (r - d2) / r * .05; e.vx += dx / d2 * f; e.vz += dz / d2 * f; if (pl === P) { P.vx -= dx / d2 * f * .5; P.vz -= dz / d2 * f * .5; } } }
      if (fwd && e.type !== 'slime') { const a = (inW || inL ? .02 : e.onGround ? sp * sp * 1.33 : .02) * fwd; e.vx -= Math.sin(e.yaw) * a; e.vz -= Math.cos(e.yaw) * a; }
      if (inW || inL) { if (e.type !== 'chicken' || true) e.vy += .04; if (e.collH) e.vy = .3; }
      else if ((e.collH && e.onGround && fwd) || (jump && e.onGround)) e.vy = CFG.JUMP;
      if (T.climb && e.collH && fwd) e.vy = .2;
      const vy0 = e.vy;
      moveE(e, e.vx, e.vy, e.vz, !T.hostile && !e.panic, .6);
      if (inW || inL) { e.vx *= .8; e.vy = e.vy * .8 - .02; e.vz *= .8; }
      else {
        e.vy = (e.vy - CFG.GRAVITY) * CFG.VDRAG;
        if (e.type === 'chicken' && e.vy < -.1 && !e.onGround) e.vy = -.1 + (e.vy + .1) * .4;
        const dr = e.onGround ? CFG.GROUND_DRAG : CFG.AIR_DRAG; e.vx *= dr; e.vz *= dr;
      }
      if (!e.onGround && vy0 < 0 && !inW) e.fallD = (e.fallD || 0) - (e.y - e.py); else { if (e.onGround && e.fallD > 3 && e.type !== 'chicken') hurtEnt(e, Math.ceil(e.fallD - 3), null, 'fall'); if (e.onGround || inW) e.fallD = 0; }
      if (T.burn && daylight && !inW && !e.baby && e.age % 20 === 0 && skyOpen(e)) e.fire = Math.max(e.fire, 160);
      if (inL) e.fire = 300;
      if (inL && e.age % 10 === 0) hurtEnt(e, 4, null, 'lava');
      if (e.fire > 0) { e.fire--; if (inW) e.fire = 0; if (e.fire % 20 === 0) hurtEnt(e, 1, null, 'fire'); if (e.age % 3 === 0) particle(e.x + (RNG() - .5) * e.w, e.y + RNG() * e.h, e.z + (RNG() - .5) * e.w, 0, 1, 0, [255, 150 + RNG() * 90, 30], .4, .08, -1, 1); }
      if (blockIn(e, b => TT[STT[b]].fire) && e.age % 10 === 0) { e.fire = Math.max(e.fire, 160); hurtEnt(e, 1, null, 'fire'); }
      if (!inW || T.undead) e.air = 300; else if (fluidIn(e, 1, T.eye) && e.type !== 'chicken' && --e.air < -19) { e.air = 0; hurtEnt(e, 2, null, 'drown'); }
      const md = Math.hypot(e.x - e.px, e.z - e.pz);
      e.limbA += (Math.min(1, md * 4) - e.limbA) * .4; e.limb += e.limbA;
      const pl = nearestPlayerAny(e);
      const dd = pl ? Math.hypot(pl.x - e.x, pl.y - e.y, pl.z - e.z) : 999;
      if (!e.persist && T.hostile && (dd > CFG.DESPAWN || (dd > 32 && RNG() < 1 / 800))) { delEnt(e); return; }
      if (e.y < -70 || !colAt(Math.floor(e.x) >> 4, Math.floor(e.z) >> 4)) { if (e.y < -70) delEnt(e); else e.frozen = true; }
    }
    function nearestPlayerAny(e) { let best = null, bd = 1e18; for (const pl of playersList()) { const d = (pl.x - e.x) ** 2 + (pl.y - e.y) ** 2 + (pl.z - e.z) ** 2; if (d < bd) { bd = d; best = pl; } } return best; }
    function skyOpen(e) { const L = getL(Math.floor(e.x), Math.floor(e.y + e.h * .9), Math.floor(e.z)); return (L >> 4) === 15; }
    function shootAt(e, tg) {
      const sx = e.x, sy = e.y + 1.5, sz = e.z;
      let dx = tg.x - sx, dy = tg.y + tg.h / 3 - sy, dz = tg.z - sz;
      dy += Math.hypot(dx, dz) * .2;
      const l = Math.hypot(dx, dy, dz) || 1, inac = [10, 10, 6, 2][W.diff] * .0075, gs = () => (RNG() + RNG() + RNG() - 1.5) * inac;
      spawnArrow(sx, sy, sz, (dx / l + gs()) * 1.6, (dy / l + gs()) * 1.6, (dz / l + gs()) * 1.6, e, 2 + W.diff * .1, false);
      snd('bow', e); e.swing = 6;
    }
    function animEnt(e, a) {
      const x = lerp(e.px, e.x, a), y = lerp(e.py, e.y, a), z = lerp(e.pz, e.z, a);
      if (e.kind === 'item') { const t = e.age + a; e.root.position.set(x, y + .15 + Math.sin(t / 10) * .08, z); e.root.rotation.y = t / 20; e.mesh.material.color.setScalar(brAt(x, y + .2, z)); return; }
      if (e.kind === 'xp') { const t = e.age + a; e.root.position.set(x, y + .2 + Math.sin(t / 8) * .05, z); e.root.children[0].material.color.setHSL(.2 + Math.sin(t / 6) * .05, 1, .55); return; }
      if (e.kind === 'fall' || e.kind === 'tnt') { e.root.position.set(x, y + .5, z); const b = brAt(x, y + .5, z); if (e.kind === 'tnt') { const fl = (e.fuse / 5 | 0) % 2 === 0; e.mesh.material.color.setScalar(fl ? b * 2.2 : b); const s = e.fuse < 10 ? 1 + (10 - e.fuse) * .02 : 1; e.mesh.scale.setScalar(s); } else e.mesh.material.color.setScalar(b); return; }
      if (e.kind === 'arrow' || e.kind === 'thrown') { e.root.position.set(x, y, z); if (e.kind === 'arrow' && !e.stuck) { V3.set(x + e.vx, y + e.vy, z + e.vz); e.root.lookAt(V3); } if (e.kind === 'thrown') e.root.rotation.y = e.age / 3; return; }
      const ls = lerp(e.limbP, e.limb, a), la = lerp(e.limbAP, e.limbA, a), sw = Math.cos(ls * .6662) * 1.4 * la, p = e.md.parts, at = e.age + a;
      const yaw = e.pyaw + (((e.yaw - e.pyaw + Math.PI) % 6.2832 + 6.2832) % 6.2832 - Math.PI) * a;
      e.root.position.set(x, y, z); e.root.rotation.set(0, yaw, e.dead ? Math.min(1, Math.sqrt(Math.max(0, (e.dead + a - 1) / 20 * 1.6))) * 1.5708 : 0);
      if (e.shd) e.shd.visible = !e.dead;
      const b = brAt(x, y + e.h * .7, z), sneak = e.sneak;
      if (e.hurtT > 10 || e.dead) e.mat.color.setRGB(b * 1.4, b * .55, b * .55); else if (e.fire > 0) e.mat.color.setRGB(b, b * .93, b * .82); else e.mat.color.setScalar(b);
      if (e.type === 'creeper' && e.fuse >= 0) { const f = e.fuse + a, k = 1 + Math.sin(f * 3) * .01 + f / 30 * .2; e.md.root.scale.set(k, k * (1 - f / 30 * .1), k); if ((f / 4 | 0) % 2) e.mat.color.setScalar(b * 2.2); }
      if (e.woolMat) e.woolMat.color.setRGB(b * DYE[e.color][0] / 255, b * DYE[e.color][1] / 255, b * DYE[e.color][2] / 255);
      if (e.type === 'slime') e.md.parts.outer.children[0].material.color.setScalar(b);
      const hy = (((lerp(e.phyaw, e.hyaw, a) - yaw + Math.PI) % 6.2832 + 6.2832) % 6.2832) - Math.PI;
      if (p.head) { p.head.rotation.set(-(e.pitch || 0) * (e.kind === 'player' ? 1 : 1) * -1 * -1 + 0, hy, 0, 'YXZ'); p.head.rotation.x = -(e.pitch || 0) * -1; }
      if (p.head && e.eat > 0) p.head.rotation.x = -(.6 + Math.sin(at * .8) * .2);
      if (p.rleg && p.lleg) {
        p.rleg.rotation.x = -sw; p.lleg.rotation.x = sw;
        if (e.type === 'zombie') { const s2 = e.swing > 0 ? Math.sin((6 - e.swing) / 6 * Math.PI) * .4 : 0; p.rarm.rotation.x = p.larm.rotation.x = 1.5 + Math.sin(at * .067) * .05 + s2; p.rarm.rotation.z = -.06 - Math.sin(at * .09) * .04; p.larm.rotation.z = .06 + Math.sin(at * .09) * .04; }
        else if (e.type === 'skeleton') { const aimA = e.see && e.target ? 1.45 : 0; p.rarm.rotation.x = aimA ? aimA : sw * .5; p.larm.rotation.x = aimA ? aimA : -sw * .5; p.rarm.rotation.y = aimA ? .2 : 0; p.larm.rotation.y = aimA ? -.5 : 0; }
        else if (e.type === 'enderman') { p.rarm.rotation.x = -sw * .5 + (e.angry ? .1 : 0); p.larm.rotation.x = sw * .5; p.rleg.rotation.x = -sw * .6; p.lleg.rotation.x = sw * .6; if (e.angry) p.head.position.y = (24 + 14 + 5) / 16; else p.head.position.y = (24 + 14) / 16; }
        else {
          const s2 = e.swing > 0 ? Math.sin((6 - e.swing + a) / 6 * Math.PI) : 0;
          p.rarm.rotation.x = sw * .9 + s2 * 1.4 + (e.heldMesh ? .3 : 0); p.larm.rotation.x = -sw * .9; p.rarm.rotation.z = -.05; p.larm.rotation.z = .05;
          if (p.body) p.body.rotation.x = sneak ? .5 : 0;
          if (sneak) { p.rleg.position.z = p.lleg.position.z = 4 / 16; p.rleg.position.y = p.lleg.position.y = (24 - 12.2) / 16; p.head.position.y = 24 / 16 - 4.2 / 16; p.rarm.position.y = p.larm.position.y = (24 - 2 - 3.2) / 16; p.body.position.y = (24 - 3.2) / 16; p.head.position.y = (24 - 4.2) / 16; }
          else { p.rleg.position.z = p.lleg.position.z = 0; p.rleg.position.y = p.lleg.position.y = 12 / 16; p.rarm.position.y = p.larm.position.y = 22 / 16; p.body.position.y = p.head.position.y = 24 / 16; }
        }
      } else if (p.leg0) {
        if (e.type === 'spider') { for (let i = 0; i < 8; i++) { const sd = i & 1 ? -1 : 1, k = i >> 1, base = [.785, .589, .589, .785][k] * sd, yb = [-.785, -.393, .393, .785][k] * -sd * -1; const ph = Math.cos(ls * .6662 * 2 + k * Math.PI / 2 * (sd > 0 ? 1 : 1) + (sd > 0 ? 0 : Math.PI)) * .4 * la, ph2 = Math.abs(Math.sin(ls * .6662 + k * Math.PI / 2)) * .4 * la; p['leg' + i].rotation.set(0, yb + ph * sd, -base + ph2 * sd, 'YXZ'); } }
        else if (e.type === 'chicken') { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; const fl = e.onGround ? 0 : Math.abs(Math.sin(at * 1.2)) * 1.2; p.wing0.rotation.z = -fl; p.wing1.rotation.z = fl; }
        else { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; p.leg2.rotation.x = sw; p.leg3.rotation.x = -sw; }
        if (e.wool) { const wp = e.wool.parts; for (const k in wp) wp[k].rotation.copy(p[k].rotation); }
      }
      if (e.kind === 'player') { e.tag.visible = !sneak; }
    }
    const P = { x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, w: CFG.PW, h: CFG.PH, onGround: false, collH: false, yaw: 0, pitch: 0, fall: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, regenT: 0, hurtT: 0, shake: 0, sprint: false, sneak: false, fly: false, jumpT: 0, xp: 0, lvl: 0, score: 0, walk: 0, walkP: 0, nextStep: 1, bob: 0, bobP: 0, eye: CFG.EYE, eyeP: CFG.EYE, eyeW: false, place: false, hit: true, kind: 'self', fire: 0, absorb: 0, spawn: null, swimT: 0, atkT: 0, dead: false, sleeping: 0, effects: {}, lastHurt: 0, lastDmg: 0, climbing: false, inLava: false, kbT: 0 };
    let inv = new Array(36).fill(null), armor = [null, null, null, null], offhand = null, craft2 = new Array(4).fill(null), craft3 = new Array(9).fill(null), cursor = null, sel = 0, ender = new Array(27).fill(null);
    let scr = 'title', gui = null, guiKey = null, tickN = 0, frameN = 0, sunB = 1, deadT = 0;
    let attackHeld = false, useHeld = false, breakCd = 0, useCd = 0, mine = null, swingT = -1, eating = null, drawing = null, equipT = 1, nameT = 0, lastSel = -1, sprintTap = 0, sprintKey = false, shielding = false;
    let tJump = false, tSneak = false;
    const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
    const mode = () => W ? W.mode : 'survival';
    const creative = () => W && W.mode === 'creative';
    const canBuild = () => W && (W.mode === 'survival' || W.mode === 'creative');
    const held = () => inv[sel];
    const playersList = () => { const l = W && W.dead !== true && !P.dead ? [P] : []; for (const e of ENTS) if (e.kind === 'player' && e.y > -500) l.push(e); return l; };
    const ST = (id, n, d) => ({ id, n: n || 1, d: d || 0 });
    const sameSt = (a, b) => a && b && a.id === b.id && (a.d || 0) === (b.d || 0) && JSON.stringify(a.x || null) === JSON.stringify(b.x || null);
    function giveItem(s, silent) {
      const ms = IT[s.id].stack;
      let n = s.n;
      for (let pass = 0; pass < 2 && n > 0; pass++) {
        const order = [];
        for (let i = 0; i < 9; i++) order.push(i);
        for (let i = 9; i < 36; i++) order.push(i);
        if (pass === 0) order.unshift(sel);
        for (const i of order) {
          if (n <= 0) break;
          const t = inv[i];
          if (pass === 0 && t && sameSt(t, s) && ms > 1 && t.n < ms) { const m = Math.min(ms - t.n, n); t.n += m; n -= m; }
          else if (pass === 1 && !t) { const m = Math.min(ms, n); inv[i] = { id: s.id, n: m, d: s.d || 0, x: s.x }; n -= m; }
        }
      }
      void silent;
      return n;
    }
    const giveOrDrop = s => { const left = giveItem(s); if (left > 0) throwStack({ id: s.id, n: left, d: s.d, x: s.x }, false); };
    function throwStack(s, far) {
      const cp = Math.cos(P.pitch), sp = far ? .3 : .1;
      spawnItem(s, P.x, P.y + P.eye - .3, P.z, -Math.sin(P.yaw) * cp * sp + (RNG() - .5) * .02, Math.sin(P.pitch) * sp + .1, -Math.cos(P.yaw) * cp * sp + (RNG() - .5) * .02, 40);
    }
    const exhaust = v => { if (mode() === 'survival' || mode() === 'adventure') P.exh = Math.min(40, P.exh + v); };
    const xpNeed = l => l >= 30 ? 112 + (l - 30) * 9 : l >= 15 ? 37 + (l - 15) * 5 : 7 + l * 2;
    function addXp(n) {
      if (n <= 0) return;
      P.score += n; P.xp += n;
      let need = xpNeed(P.lvl);
      while (P.xp >= need) { P.xp -= need; P.lvl++; need = xpNeed(P.lvl); if (P.lvl % 5 === 0) snd('levelup'); }
      snd('orb'); api.score(P.score);
    }
    function armorPts() { let d = 0, t = 0; for (const a of armor) if (a) { const A = IT[a.id].armor; if (A) { d += A.def; t += A.tough; } } return [d, t]; }
    function damageArmor(dmg) { const n = Math.max(1, Math.floor(dmg / 4)); for (let i = 0; i < 4; i++) { const a = armor[i]; if (!a || !IT[a.id].dur) continue; a.d += n; if (a.d >= IT[a.id].dur) { armor[i] = null; snd('tbreak'); } } }
    function hurtPlayer(d, sx, sz, kind) {
      if (P.dead || scr !== 'game' || d < 0) return;
      const md = mode();
      if ((md === 'creative' || md === 'spectator') && kind !== 'void') return;
      if (kind === 'mob' || kind === 'arrow' || kind === 'player') { if (W.diff === 0) d = 0; }
      if (P.hurtT > 10 && kind !== 'void' && kind !== 'starve' && kind !== 'drown') { if (d <= P.lastDmg) return; d -= P.lastDmg; }
      if (shielding && (kind === 'mob' || kind === 'arrow' || kind === 'explosion' || kind === 'player') && sx != null) { const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), dx = sx - P.x, dz = sz - P.z; if (fx * dx + fz * dz > 0) { snd('shield'); if (offhand && IN.shield && offhand.id === IN.shield.idx) offhand.d++; else if (held() && held().id === IN.shield.idx) held().d++; if (sx != null) { const l = Math.hypot(dx, dz) || 1; P.vx -= dx / l * .3; P.vz -= dz / l * .3; } return; } }
      const bypass = kind === 'fall' || kind === 'drown' || kind === 'starve' || kind === 'void' || kind === 'fire' || kind === 'lava' || kind === 'magic' || kind === 'suffocate';
      if (!bypass && kind !== 'anvil') { const [def, tough] = armorPts(); if (def) { const red = Math.min(20, Math.max(def / 5, def - d / (2 + tough / 4))); d = d * (1 - red / 25); damageArmor(d); } }
      if (kind === 'fall') { const hb = held(); void hb; }
      d = Math.max(0, d);
      if (P.absorb > 0) { const a = Math.min(P.absorb, d); P.absorb -= a; d -= a; }
      P.lastDmg = d + (P.lastDmg && P.hurtT > 10 ? P.lastDmg : 0);
      if (d <= 0 && kind !== 'void') { if (sx != null) knock(sx, sz); return; }
      P.hp -= d; P.hurtT = 20; P.shake = 10; exhaust(CFG.EXH_HURT);
      if (sx != null) knock(sx, sz);
      snd(kind === 'fall' && d > 4 ? 'fall_big' : kind === 'fall' ? 'fall_small' : 'hurt');
      P.lastKind = kind;
      if (P.hp <= 0) {
        const tot = (s => s && s.id === IN.totem_of_undying.idx);
        if (tot(held()) || tot(offhand)) { if (tot(held())) inv[sel] = null; else offhand = null; P.hp = 1; P.absorb = 4; P.effects.regen = 900; for (let i = 0; i < 40; i++) particle(P.x, P.y + 1, P.z, (RNG() - .5) * 4, RNG() * 4, (RNG() - .5) * 4, [RNG() < .5 ? 240 : 120, 220, 60], 1.2, .08, 4, 1); snd('totem'); chatSys(P.name + ' used a Totem of Undying'); return; }
        die(kind);
      }
    }
    function knock(sx, sz) { const dx = P.x - sx, dz = P.z - sz, l = Math.hypot(dx, dz) || 1; P.vx = P.vx / 2 + dx / l * .4; P.vz = P.vz / 2 + dz / l * .4; P.vy = Math.min(.4, P.vy / 2 + .4); }
    const DEATHMSG = { fall: 'fell from a high place', drown: 'drowned', starve: 'starved to death', void: 'fell out of the world', fire: 'burned to death', lava: 'tried to swim in lava', mob: 'was slain', arrow: 'was shot by Skeleton', explosion: 'blew up', suffocate: 'suffocated in a wall', cactus: 'was pricked to death', anvil: 'was squashed by a falling anvil', magic: 'was killed by magic', player: 'was slain by a player', freeze: 'froze to death' };
    function die(kind) {
      if (P.dead) return;
      P.dead = true; P.hp = 0; deadT = 0; P.sprint = false; attackHeld = useHeld = false; eating = null; mine = null; drawing = null;
      const msg = (P.name || 'Player') + ' ' + (DEATHMSG[kind] || 'died');
      chatSys(msg); netSend({ t: 'chat', s: 1, m: msg });
      P.deathMsg = msg; P.scoreAtDeath = P.score;
      if (W.rules.keepInventory !== true && mode() !== 'creative') {
        for (const arr of [inv, armor, craft2, craft3]) for (let i = 0; i < arr.length; i++) if (arr[i]) { const s = arr[i]; arr[i] = null; spawnItem(s, P.x, P.y + 1, P.z, (RNG() - .5) * .5, .2 + RNG() * .2, (RNG() - .5) * .5, 40); }
        if (offhand) { spawnItem(offhand, P.x, P.y + 1, P.z); offhand = null; }
        if (cursor) { spawnItem(cursor, P.x, P.y + 1, P.z); cursor = null; }
        const xp = Math.min(100, P.lvl * 7); if (xp) spawnXp(xp, P.x, P.y + .5, P.z);
        P.xp = 0; P.lvl = 0;
      }
      gui = 'dead';
      if (locked()) { unlockIntent = true; document.exitPointerLock(); }
      if (W.hardcore) { W.mode = 'spectator'; }
      if (P.score > 0) api.submit(P.score);
      saveSoon();
    }
    function respawn() {
      P.dead = false; gui = null;
      const sp = P.spawn && validSpawn(P.spawn) ? P.spawn : W.spawn;
      Object.assign(P, { hp: 20, food: 20, sat: 5, exh: 0, air: 300, vx: 0, vy: 0, vz: 0, fall: 0, fly: false, hurtT: 0, shake: 0, fire: 0, absorb: 0, effects: {}, x: sp[0], y: sp[1], z: sp[2], place: !P.spawn || sp === W.spawn, score: 0 });
      if (W.hardcore) { P.fly = true; }
      P.px = P.x; P.py = P.y; P.pz = P.z;
      api.score(0); lockMouse();
      netSend({ t: 'respawn' });
    }
    function validSpawn(s) { const b = getS(Math.floor(s[0]), Math.floor(s[1]) - 0, Math.floor(s[2])); void b; return true; }
    function swing() { if (swingT < 0 || swingT >= CFG.SWING_TICKS / 2) swingT = 0; netAct({ sw: 1 }); }
    const toolOf = s => s && IT[s.id].tool ? IT[s.id].tool : null;
    function mineSpeed(s, t) {
      const tl = toolOf(held()), tk = tl ? tl.k : null;
      let sp = 1;
      if (tk === 'shears') { if (t.tags.has('leaves') || t.web) sp = 15; else if (t.tags.has('wool')) sp = 5; else if (t.id === 'vine' || t.id === 'glow_lichen') sp = 2; }
      else if (tk === 'sword') { if (t.web) sp = 15; else if (t.id === 'bamboo') sp = 999; else if (t.plant || t.tags.has('leaves') || t.id.includes('pumpkin') || t.id === 'melon') sp = 1.5; }
      else if (tk && tk === t.tool) sp = tl.sp;
      else if (tk === 'axe' && (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry' || t.snd === 'nether_wood') && !t.tool) sp = tl.sp;
      if (P.eyeW && !hasAqua()) sp /= 5;
      if (!P.onGround && !P.fly && !P.climbing) sp /= 5;
      return sp;
    }
    const hasAqua = () => false;
    function canHarvest(t) {
      if (!t.req) return true;
      const tl = toolOf(held());
      if (!tl) return false;
      if (tl.k === 'shears' && (t.web || t.tags.has('leaves') || t.tags.has('wool'))) return true;
      if (tl.k === 'sword' && t.web) return true;
      return tl.k === t.tool && tl.lvl >= t.lvl;
    }
    function relHard(s) {
      const t = TT[STT[s]];
      if (t.hard < 0) return 0;
      if (t.hard === 0) return 1;
      return mineSpeed(s, t) / t.hard / (canHarvest(t) ? 30 : 100);
    }
    function damageTool(n) {
      const s = held();
      if (!s || !IT[s.id].dur || mode() === 'creative') return;
      s.d += n;
      if (s.d >= IT[s.id].dur) { inv[sel] = null; snd('tbreak'); for (let i = 0; i < 10; i++) particle(P.x - Math.sin(P.yaw) * .5, P.y + 1.4, P.z - Math.cos(P.yaw) * .5, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [150, 120, 80], .5, .05, 12); }
    }
    function dropBlock(s, x, y, z, ctx) {
      if (W.rules.doTileDrops === false) return;
      const t = TT[STT[s]];
      ctx = ctx || {};
      let D;
      if (typeof t.drop === 'function') D = t.drop(s, ctx);
      else if (t.drop === null) D = null;
      else if (Array.isArray(t.drop)) D = t.drop;
      else if (typeof t.drop === 'string') D = [[t.drop, 1]];
      else D = [[typeof t.item === 'string' ? t.item : t.id, 1]];
      if (!D) return;
      if (t.slab && sv(s, 'type') === 2) D = [[t.id, 2]];
      for (const [id, n] of D) { if (n > 0 && IN[id]) spawnItem({ id: IN[id].idx, n }, x + .5 + (RNG() - .5) * .3, y + .4, z + .5 + (RNG() - .5) * .3, (RNG() - .5) * .2, .2, (RNG() - .5) * .2); }
      if (t.xp && !ctx.silk && !ctx.explosion) spawnXp(rr(t.xp[0], t.xp[1]), x + .5, y + .5, z + .5);
    }
    function breakBlock(x, y, z, byP) {
      const s = getS(x, y, z);
      if (!s) return;
      const t = TT[STT[s]];
      if (FLU[s] || (t.hard < 0 && !creative())) return;
      burst(x, y, z, s, 16);
      playBlockSnd(s, 'break', x, y, z);
      const tl = toolOf(held());
      const ctx = { silk: false, shears: tl && tl.k === 'shears', tool: tl, fortune: 0 };
      if (t.door) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0, 0); }
      if (t.bed) { const hd = sv(s, 'part'), q = fq(s), d = F4D[q], ox = hd ? -d[0] : d[0], oz = hd ? -d[1] : d[1]; const o = getS(x + ox, y, z + oz); if (TT[STT[o]] === t) setBlock(x + ox, y, z + oz, 0); }
      if (t.tall) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0); }
      if (t.id === 'tall_seagrass') { }
      const wet = !t.fluid && (FLU[getS(x, y + 1, z)] === 1 && false);
      void wet;
      if (byP && !creative() && canHarvest(t)) { if (t.tags.has('leaves') || t.id === 'short_grass' || t.id === 'fern' || t.id === 'tall_grass') dropBlock(s, x, y, z, ctx); else dropBlock(s, x, y, z, ctx); }
      removeBlockEntity(x, y, z, byP && !creative());
      if (t.id === 'ice' && byP && !creative() && SOL[getS(x, y - 1, z)]) setBlock(x, y, z, S('water', { level: 0 }));
      else setBlock(x, y, z, t.water && t.id !== 'kelp' && t.id !== 'kelp_plant' ? S('water', { level: 0 }) : (t.id === 'kelp' || t.id === 'kelp_plant' || t.id === 'seagrass' || t.id === 'tall_seagrass') ? S('water', { level: 0 }) : 0);
      if (byP && !creative()) { if (t.hard > 0) damageTool(IT[held()?.id]?.tool?.k === 'sword' ? 2 : 1); exhaust(CFG.EXH_MINE); }
    }
    function playBlockSnd(s, kind, x, y, z) { const t = TT[STT[s]]; matSnd(t.snd, kind === 'break' ? 2 : kind === 'place' ? 2 : kind === 'hit' ? 1 : 0, x != null ? { x: x + .5, y: y + .5, z: z + .5 } : null); }
    const boxHit = (e, x, y, z) => x < e.x + e.w / 2 && x + 1 > e.x - e.w / 2 && y < e.y + e.h && y + 1 > e.y && z < e.z + e.w / 2 && z + 1 > e.z - e.w / 2;
    const horizQ = () => { const a = ((P.yaw % 6.2832) + 6.2832) % 6.2832; return [0, 3, 2, 1][Math.round(a / (Math.PI / 2)) & 3]; };
    const dirFacing6 = () => { if (P.pitch > .79) return 4; if (P.pitch < -.79) return 5; return horizQ(); };
    const supportOK = (x, y, z, f) => { const s = getS(x, y, z); return FULLT[s] || (f === 2 && (TT[STT[s]].slab && sv(s, 'type') !== 0 || TT[STT[s]].stair && sv(s, 'half') === 1 || (TT[STT[s]].tags.has('fence') || TT[STT[s]].tags.has('wall')))); };
    const DIRTLIKE = new Set(['grass_block', 'dirt', 'coarse_dirt', 'podzol', 'rooted_dirt', 'mycelium', 'farmland', 'moss_block', 'pale_moss_block', 'mud', 'muddy_mangrove_roots']);
    function placementState(t, x, y, z, hit) {
      let s = S(t.id);
      if (LEAF[s] && t.pk.persistent !== undefined) s = sw(s, 'persistent', 1);
      const f = hit.f, hy = hit.py - Math.floor(hit.py), q = horizQ();
      const below = getS(x, y - 1, z), bt = TT[STT[below]];
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 4) {
        if (t.stair) s = sw(sw(s, 'facing', q), 'half', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
        else if (t.door || t.gate || t.bed) s = sw(s, 'facing', q);
        else if (t.id.includes('trapdoor')) { if (f >= 2 && f <= 3) s = sw(sw(s, 'facing', (q + 2) & 3), 'half', f === 3 ? 1 : 0); else s = sw(sw(s, 'facing', [5, 0, 4, 1].indexOf(f) >= 0 ? [1, 3, 2, 0][[0, 1, 4, 5].indexOf(f)] : 0), 'half', hy > .5 ? 1 : 0); }
        else if (t.torch || t.id === 'ladder' || t.id.endsWith('wall_sign') || t.id === 'tripwire_hook' || t.id === 'cocoa' || t.id === 'shelf_mushroom') { if (f < 2 || f > 3) s = sw(s, 'facing', [0, 1, 0, 0, 4, 5].indexOf(f) < 0 ? 0 : [1, 3, -1, -1, 2, 0][f]); }
        else if (t.pk.face !== undefined) { const fc = f === 2 ? 0 : f === 3 ? 2 : 1; s = sw(s, 'face', fc); s = sw(s, 'facing', fc === 1 ? [1, 3, -1, -1, 2, 0][f] : q); }
        else s = sw(s, 'facing', (q + 2) & 3);
      }
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 6) {
        if (t.place6 === 2) { const d = dirFacing6(); s = sw(s, 'facing', d < 4 ? (d + 2) & 3 : d === 4 ? 5 : 4); }
        else s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
        if (t.id === 'end_rod' || t.id === 'lightning_rod' || t.id.includes('amethyst')) s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
      }
      if (t.id === 'hopper') s = sw(s, 'facing', f === 2 ? 0 : [4, 3, 0, 0, 2, 1][f]);
      if (t.pk.axis !== undefined) { const ax = f < 2 ? 1 : f < 4 ? 0 : 2; s = sw(s, 'axis', t.props[t.pk.axis][1].length === 2 ? (ax === 1 ? 0 : 1) : ax); }
      if (t.pk.rotation !== undefined) { const a = ((P.yaw + Math.PI) / (Math.PI * 2) * 16); s = sw(s, 'rotation', ((Math.round(-a) % 16) + 16 + 8) % 16); }
      if (t.slab) s = sw(s, 'type', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
      if (t.pk.hanging !== undefined) s = sw(s, 'hanging', f === 3 ? 1 : 0);
      if (t.id === 'pointed_dripstone') s = sw(s, 'vertical_direction', f === 3 ? 0 : 1);
      if (t.id === 'glow_lichen') s = sw(s, 'face', [5, 4, 0, 1, 3, 2][f]);
      if (t.id === 'vine') { if (f < 2 || f > 3) { const k = [3, 1, 0, 0, 0, 2][f]; s = S('vine', { [FACE4[k]]: true }); } else if (f === 3) s = S('vine', { up: true }); else return null; }
      if (t.sign && !t.id.includes('wall') && !t.id.includes('hanging') && f !== 2) { const wt = TN[t.id.replace('_sign', '_wall_sign')]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.torch && f !== 2) { if (f === 3) return null; const wt = TN['wall_' + t.id]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); if (t.ctexL) s = sw(s, 'lit', 1); }
      if (t.head && f !== 2 && f !== 3) { const wt = TN[t.id.replace(/_(skull|head)$/, '_wall_$1')]; if (wt) s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.id === 'grass_block' || t.id === 'podzol' || t.id === 'mycelium') { if (isT(getS(x, y + 1, z), 'snow')) s = sw(s, 'snowy', 1); }
      if (t.attach === 1 && !(t.torch && f === 2) && t.pk.face === undefined) { const d = DIR6[OPP6[f]]; if (!supportOK(x + d[0], y + d[1], z + d[2], f)) { if (t.torch && f === 2 && supportOK(x, y - 1, z, 2)) { } else if (!(t.torch && f === 2)) return null; } }
      if (t.torch && f === 2 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.id === 'ladder' && (f < 2 || f > 3) && !FULLT[getS(x - DIR6[f][0], y, z - DIR6[f][2])]) return null;
      if (t.id === 'ladder' && (f === 2 || f === 3)) return null;
      if (t.pk.face !== undefined && t.attach) { const fc = sv(s, 'face'), d = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : DIR6[OPP6[f]]; if (!FULLT[getS(x + d[0], y + d[1], z + d[2])]) return null; }
      if (t.attach === 3 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.attach === 4 && !FULLT[getS(x, y + 1, z)] && !(t.id === 'pale_hanging_moss' && (isT(getS(x, y + 1, z), 'pale_hanging_moss') || LEAF[getS(x, y + 1, z)]))) return null;
      if (t.plant && !t.water && t.id !== 'cobweb' && t.attach !== 4 && t.id !== 'pointed_dripstone') {
        if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { if (!isT(below, t.soil || 'farmland')) return null; }
        else if (t.id === 'dead_bush' || t.id === 'short_dry_grass' || t.id === 'tall_dry_grass' || t.id === 'cactus_flower') { if (!DIRTLIKE.has(bt.id) && !bt.id.includes('sand') && !bt.id.includes('terracotta') && !(t.id === 'cactus_flower' && bt.id === 'cactus')) return null; }
        else if (t.id.includes('mushroom') && t.id !== 'shelf_mushroom') { if (!FULLT[below]) return null; }
        else if (t.id.includes('fungus') || t.id.includes('roots') || t.id === 'nether_sprouts') { if (!bt.id.includes('nylium') && !DIRTLIKE.has(bt.id) && bt.id !== 'soul_soil') return null; }
        else if (t.id === 'sugar_cane') { if (!(isT(below, 'sugar_cane') || ((DIRTLIKE.has(bt.id) || bt.id.includes('sand')) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => FLU[getS(x + a, y - 1, z + c)] === 1 || isT(getS(x + a, y - 1, z + c), 'frosted_ice'))))) return null; }
        else if (t.id === 'sweet_berry_bush' || t.sapling || t.flower || t.tall || t.id === 'short_grass' || t.id === 'fern' || t.id === 'bush' || t.id === 'firefly_bush' || t.id === 'red_shrub' || t.id.includes('petals') || t.id === 'wildflowers' || t.id === 'leaf_litter') { if (!DIRTLIKE.has(bt.id) && !(t.id === 'leaf_litter' && FULLT[below])) return null; }
        else if (t.id.includes('coral')) { if (!FULLT[below]) return null; }
      }
      if (t.id === 'cactus') { if (!(isT(below, 'cactus') || bt.id === 'sand' || bt.id === 'red_sand')) return null; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (SOL[getS(x + a, y, z + c)]) return null; }
      if (t.id === 'bamboo' && !(isT(below, 'bamboo') || DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id === 'gravel')) return null;
      if (t.id === 'lily_pad' || t.id === 'frogspawn') { if (FLU[below] !== 1 && !isT(below, 'ice')) return null; }
      if (t.water && !t.id.includes('dead')) { const cur = getS(x, y, z); if (FLU[cur] !== 1) { if (t.id.includes('coral')) { } else return null; } }
      if (t.id === 'nether_wart' && !isT(below, 'soul_sand')) return null;
      if (t.id === 'cocoa') { if (f < 2 || f > 3) { const d = DIR6[OPP6[f]]; if (!isT(getS(x + d[0], y, z + d[2]), 'jungle_log') && !isT(getS(x + d[0], y, z + d[2]), 'jungle_wood') && !isT(getS(x + d[0], y, z + d[2]), 'stripped_jungle_log')) return null; s = sw(S('cocoa'), 'facing', [1, 3, 0, 0, 2, 0][f]); } else return null; }
      return s;
    }
    function placeBlock(it, hit, offhandUse) {
      let x = hit.x, y = hit.y, z = hit.z;
      const tgt = getS(x, y, z), tt = TT[STT[tgt]];
      const t = TN[it.place];
      if (!t) return false;
      if (t.slab && tt === t && sv(tgt, 'type') !== 2 && ((sv(tgt, 'type') === 0 && hit.f === 2) || (sv(tgt, 'type') === 1 && hit.f === 3))) { setBlock(x, y, z, sw(tgt, 'type', 2)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'snow' && tt === t && sv(tgt, 'layers') < 7) { setBlock(x, y, z, sw(tgt, 'layers', sv(tgt, 'layers') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id.endsWith('candle') && tt === t && sv(tgt, 'candles') < 3) { setBlock(x, y, z, sw(tgt, 'candles', sv(tgt, 'candles') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if ((t.id === 'pink_petals' || t.id === 'wildflowers') && tt === t && sv(tgt, 'flower_amount') < 3) { setBlock(x, y, z, sw(tgt, 'flower_amount', sv(tgt, 'flower_amount') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'sea_pickle' && tt === t && sv(tgt, 'pickles') < 3) { setBlock(x, y, z, sw(tgt, 'pickles', sv(tgt, 'pickles') + 1)); return true; }
      if (!REP[tgt] || (tt === t && !t.repl) || (tt.id === 'snow' && sv(tgt, 'layers') > 0)) { x += hit.fx; y += hit.fy; z += hit.fz; }
      if (y < 0 || y >= H - 1) return false;
      const cur = getS(x, y, z), ct = TT[STT[cur]];
      if (!REP[cur] && !(FLU[cur] && FLU[cur] !== 0)) return false;
      if (ct.tall && REP[cur]) { const up = sv(cur, 'half'); setBlock(x, y + (up ? -1 : 1), z, 0); }
      if (t.slab && TT[STT[cur]] === t) { }
      const H2 = { f: hit.f, py: hit.py, fx: hit.fx, fy: hit.fy, fz: hit.fz };
      if (hit.x !== x || hit.y !== y || hit.z !== z) { }
      let s = placementState(t, x, y, z, H2);
      if (s === null || s === undefined) return false;
      if (it.placeAge === 0) s = sw(s, 'age', 0);
      if (TT[STT[s]].id === 'redstone_wire') s = S('redstone_wire');
      const solid = SOL[s] && !(SOL[s] === 2 && COLL[s] && !COLL[s].length);
      if (solid) for (const pl of playersList()) if (boxHit(pl, x, y, z) && SOL[s] && (SOL[s] === 1 || (blockBoxes(s, x, y, z) || []).some(b => b[4] - b[1] > .2))) return false;
      if (solid) for (const e of ENTS) if (e.kind === 'mob' && !e.dead && boxHit(e, x, y, z)) return false;
      if (t.door) { if (!REP[getS(x, y + 1, z)] || !supportOK(x, y - 1, z, 2)) return false; const q = sv(s, 'facing'), L = F4D[(q + 3) & 3], R = F4D[(q + 1) & 3]; const lt = TT[STT[getS(x + L[0], y, z + L[1])]], rt = TT[STT[getS(x + R[0], y, z + R[1])]]; let hinge = 0; if (lt.door && !rt.door) hinge = 1; else { const hx2 = hit.px - Math.floor(hit.px), hz2 = hit.pz - Math.floor(hit.pz); const side = q === 0 ? hx2 > .5 : q === 1 ? hz2 > .5 : q === 2 ? hx2 < .5 : hz2 < .5; if (!lt.door && !rt.door && side) hinge = 1; } s = sw(s, 'hinge', hinge); setBlock(x, y, z, s); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else if (t.bed) { const q = sv(s, 'facing'), d = F4D[q]; if (!REP[getS(x + d[0], y, z + d[1])] || !supportOK(x, y - 1, z, 2)) return false; setBlock(x, y, z, sw(s, 'part', 0)); setBlock(x + d[0], y, z + d[1], sw(s, 'part', 1)); }
      else if (t.tall) { if (!REP[getS(x, y + 1, z)]) return false; setBlock(x, y, z, sw(s, 'half', 0)); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else setBlock(x, y, z, s);
      if (t.cont || t.use === 'furnace' || t.sign) initBlockEntity(x, y, z, t, it);
      playBlockSnd(s, 'place', x, y, z); swing();
      if (!creative()) { const st = offhandUse ? offhand : held(); if (st && --st.n <= 0) { if (offhandUse) offhand = null; else inv[sel] = null; } }
      if (hooks.afterPlace) hooks.afterPlace(x, y, z, s);
      if (t.sign) openSign(x, y, z);
      return true;
    }
    function attackMob(e) {
      const st = held(), it = st ? IT[st.id] : null;
      let dmg = it && it.dmg ? it.dmg : 1;
      const cd = atkCooldown(), charge = clamp((tickN - P.atkT) / cd, 0, 1);
      dmg *= .2 + charge * charge * .8;
      const crit = charge > .9 && P.fall > 0 && !P.onGround && !P.fly && !P.eyeW && !P.climbing;
      if (crit) dmg *= 1.5;
      P.atkT = tickN;
      const kbS = P.sprint && charge > .9;
      const kx = -Math.sin(P.yaw), kz = -Math.cos(P.yaw);
      if (e.kind === 'player') { netSendTo(e.pid, { t: 'hurt', d: dmg, sx: P.x, sz: P.z, k: 'player', by: P.name }); }
      else hurtEnt(e, dmg, P, 'player', kx, kz);
      if (kbS && e.kind === 'mob') { e.vx += kx * .5; e.vz += kz * .5; e.vy += .1; P.vx *= .6; P.vz *= .6; P.sprint = false; }
      if (crit) for (let i = 0; i < 12; i++) particle(e.x, e.y + e.h * .7, e.z, (RNG() - .5) * 4, RNG() * 3, (RNG() - .5) * 4, [255, 255, 230], .5, .06, 6, 1);
      if (it && it.dur) damageTool(it.tool && it.tool.k === 'sword' ? 1 : 2);
      exhaust(CFG.EXH_ATTACK);
      snd(crit ? 'crit' : charge > .9 ? 'hit_strong' : 'hit_weak', e);
    }
    const atkCooldown = () => { const st = held(); const sp = st && IT[st.id].aspd ? IT[st.id].aspd : 4; return 20 / sp; };
    function interactMob(e) {
      const st = held(), it = st ? IT[st.id] : null, T = MT[e.type];
      if (e.kind !== 'mob') return false;
      if (it && it.egg) return false;
      if (it && T.breed && T.breed.includes(it.id) && !e.baby && e.breedCd === 0 && e.love === 0) { netOrLocal('love', e, () => { e.love = 600; for (let i = 0; i < 5; i++) particle(e.x, e.y + e.h, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, -.5, 1); }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (it && T.breed && T.breed.includes(it.id) && e.baby) { e.babyT -= 2400; if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.id === 'shears' && !e.sheared && !e.baby) { netOrLocal('shear', e, () => { e.sheared = true; e.wool.root.visible = false; spawnItem({ id: IN[e.color + '_wool'].idx, n: 1 + ri(3) }, e.x, e.y + 1, e.z); }); snd('shear', e); damageTool(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.dye && e.color !== it.dye && !e.sheared) { netOrLocal('dye:' + it.dye, e, () => { e.color = it.dye; }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'cow' && it && it.id === 'bucket') { consumeHeld(1, { id: IN.milk_bucket.idx, n: 1 }); snd('milk', e); swing(); return true; }
      return false;
    }
    function consumeHeld(n, rep) {
      const st = held(); if (!st) return;
      if (creative()) { if (rep) giveOrDrop(rep); return; }
      st.n -= n;
      if (st.n <= 0) inv[sel] = rep || null; else if (rep) giveOrDrop(rep);
    }
    function useItem(st, hitB) {
      const it = IT[st.id];
      if (it.food && (it.food.always || P.food < 20 || creative())) { if (!eating) eating = { id: st.id, t: 0, dur: it.food.fast ? 16 : it.id === 'honey_bottle' ? 40 : CFG.EAT_TICKS }; return true; }
      if (it.drink) { if (!eating) eating = { id: st.id, t: 0, dur: 32, drink: 1 }; return true; }
      if (it.bow) { const hasA = creative() || inv.some(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx)) || (offhand && offhand.id === IN.arrow.idx); if (hasA && !drawing) drawing = { t: 0, id: st.id }; return true; }
      if (it.crossbow) { if (!st.x || !st.x.loaded) { if (!drawing) drawing = { t: 0, id: st.id, cb: 1 }; } else { fireArrow(3.15, 9); st.x = null; damageTool(1); } return true; }
      if (it.trident) { if (!drawing) drawing = { t: 0, id: st.id, tri: 1 }; return true; }
      if (it.throwable) { const sp = it.throwable === 'ender_pearl' ? 1.5 : it.throwable === 'splash' ? .5 : 1.5, cp = Math.cos(P.pitch); spawnThrownNet(it.throwable, P.x - Math.sin(P.yaw) * .3, P.y + P.eye - .1, P.z - Math.cos(P.yaw) * .3, -Math.sin(P.yaw) * cp * sp + P.vx, Math.sin(P.pitch) * sp + (P.onGround ? 0 : P.vy), -Math.cos(P.yaw) * cp * sp + P.vz); snd('throw'); consumeHeld(1); swing(); useCd = it.throwable === 'ender_pearl' ? 20 : 4; return true; }
      if (it.armor && !hitB) { const sl = it.armor.slot; const cur = armor[sl]; armor[sl] = { ...st, n: 1 }; inv[sel] = cur || (st.n > 1 ? { ...st, n: st.n - 1 } : null); snd('equip'); return true; }
      if (it.egg && hitB) { const hx2 = HIT.x + HIT.fx + .5, hy = HIT.y + HIT.fy, hz2 = HIT.z + HIT.fz + .5; spawnMobNet(it.egg, hx2, hy, hz2); consumeHeld(1); swing(); return true; }
      if (it.bucket) return useBucket(st, it);
      if (it.shield) { shielding = true; return true; }
      if (it.spyglass) { P.zoom = true; return true; }
      return false;
    }
    function spawnMobNet(type, x, y, z) { if (NET.role === 'guest') netSend({ t: 'spawn', m: type, x, y, z }); else { const e = spawnMob(type, x, y, z, { persist: true }); if (e) e.yaw = P.yaw + Math.PI; } }
    function spawnThrownNet(type, x, y, z, vx, vy, vz) { if (NET.role === 'guest') netSend({ t: 'throw', ty: type, x, y, z, vx, vy, vz }); else spawnThrown(type, x, y, z, vx, vy, vz, P); }
    function fireArrow(v, base) {
      let ai = inv.findIndex(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx));
      if (offhand && offhand.id === IN.arrow.idx) ai = -2;
      if (ai < 0 && ai !== -2 && !creative()) return false;
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      const x = P.x + dx * .3, y = P.y + P.eye - .1, z = P.z + dz * .3, sp = v;
      if (NET.role === 'guest') netSend({ t: 'arrow', x, y, z, vx: dx * sp, vy: dy * sp, vz: dz * sp, d: base || 2, p: !creative() });
      else spawnArrow(x, y, z, dx * sp, dy * sp, dz * sp, P, base || 2, !creative());
      if (!creative()) { if (ai === -2) { if (--offhand.n <= 0) offhand = null; } else if (ai >= 0 && --inv[ai].n <= 0) inv[ai] = null; }
      snd('bow');
      return true;
    }
    function useBucket(st, it) {
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      raycast(EX, EY, EZ, dx, dy, dz, reach(), true, null);
      if (!HIT.b) return false;
      const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]];
      if (it.bucket === 'empty') {
        if (FLU[s] && ((s - t.base) & 15) === 0) { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN[FLU[s] === 1 ? 'water_bucket' : 'lava_bucket'].idx, n: 1 }); snd(FLU[s] === 1 ? 'bucket_fill' : 'bucket_fill_lava'); swing(); return true; }
        if (t.id === 'powder_snow') { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN.powder_snow_bucket.idx, n: 1 }); return true; }
        if (t.id === 'cauldron' && sv(s, 'level') === 3) { const ct = sv(s, 'content'); setBlock(HIT.x, HIT.y, HIT.z, S('cauldron')); consumeHeld(1, { id: IN[['water_bucket', 'lava_bucket', 'powder_snow_bucket'][ct]].idx, n: 1 }); snd('bucket_fill'); return true; }
        return false;
      }
      if (t.id === 'cauldron' && (it.bucket === 'water' || it.bucket === 'lava' || it.bucket === 'powder_snow')) { setBlock(HIT.x, HIT.y, HIT.z, S('cauldron', { level: 3, content: it.bucket })); if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 }; snd('bucket_empty'); return true; }
      let x = HIT.x, y = HIT.y, z = HIT.z;
      if (!REP[s] || (FLU[s] && it.bucket !== (FLU[s] === 1 ? 'water' : 'lava'))) { x += HIT.fx; y += HIT.fy; z += HIT.fz; }
      const cur = getS(x, y, z);
      if (!REP[cur] && !FLU[cur]) return false;
      if (it.bucket === 'water' && W.dim === 'nether') { snd('fizz'); }
      else setBlock(x, y, z, it.bucket === 'powder_snow' ? S('powder_snow') : S(it.bucket, { level: 0 }));
      if (it.mobB && NET.role !== 'guest') { }
      if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 };
      snd(it.bucket === 'lava' ? 'bucket_empty_lava' : 'bucket_empty'); swing();
      return true;
    }
    function useOnBlock(st, x, y, z, f) {
      const s = getS(x, y, z), t = TT[STT[s]], it = st ? IT[st.id] : null;
      if (it && it.boneMeal) { if (boneMeal(x, y, z, s, t)) { consumeHeld(1); swing(); for (let i = 0; i < 12; i++) particle(x + RNG(), y + RNG() * .8 + .2, z + RNG(), 0, .5, 0, [120, 220, 120], .8, .06, -.2, 1); return true; } }
      if (it && it.tool && it.tool.k === 'hoe' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'dirt_path' || t.id === 'coarse_dirt' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, t.id === 'coarse_dirt' ? S('dirt') : t.id === 'rooted_dirt' ? S('dirt') : S('farmland')); if (t.id === 'rooted_dirt') spawnItem({ id: IN.hanging_roots.idx, n: 1 }, x + .5, y + 1.2, z + .5); snd('hoe'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'podzol' || t.id === 'coarse_dirt' || t.id === 'mycelium' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, S('dirt_path')); snd('shovel'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'campfire' || t.id === 'soul_campfire') && sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); damageTool(1); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.strip && TN[t.strip]) { setBlock(x, y, z, sw(TN[t.strip].base, 'axis', sv(s, 'axis'))); snd('strip'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.ox !== undefined) { const nm = t.id; if (nm.startsWith('waxed_')) { setBlock(x, y, z, sameProps(s, TN[nm.slice(6)])); snd('wax_off'); damageTool(1); swing(); return true; } const pre = ['exposed_', 'weathered_', 'oxidized_'], i = pre.findIndex(p => nm.startsWith(p)); if (i >= 0) { const base = nm.slice(pre[i].length), nn = (i ? pre[i - 1] : '') + (base === 'copper' && !i ? 'copper_block' : base); if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); snd('scrape'); damageTool(1); swing(); return true; } } }
      if (it && it.id === 'honeycomb' && t.ox !== undefined && !t.id.startsWith('waxed_')) { const nn = 'waxed_' + t.id; if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); consumeHeld(1); snd('wax_on'); swing(); return true; } }
      if (it && (it.ignite) && (t.tnt)) { setBlock(x, y, z, 0); if (NET.role !== 'guest') spawnTNT(x, y, z); else netSend({ t: 'tnt', x, y, z }); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite && (t.id === 'campfire' || t.id === 'soul_campfire' || t.id.endsWith('candle')) && !sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 1)); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite) { const d = DIR6[f], nx = x + d[0], ny = y + d[1], nz2 = z + d[2]; if (REP[getS(nx, ny, nz2)] && !FLU[getS(nx, ny, nz2)]) { const soul = isT(getS(nx, ny - 1, nz2), 'soul_sand') || isT(getS(nx, ny - 1, nz2), 'soul_soil'); if (isT(s, 'obsidian') && tryPortal(nx, ny, nz2)) { } else setBlock(nx, ny, nz2, S(soul ? 'soul_fire' : 'fire')); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; } }
      if (it && it.id === 'glass_bottle' && FLU[getS(x + DIR6[f][0], y + DIR6[f][1], z + DIR6[f][2])] === 1) { consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; }
      if (it && it.tool && it.tool.k === 'shears' && t.id === 'pumpkin') { setBlock(x, y, z, sw(S('carved_pumpkin'), 'facing', horizQ() + 2 & 3)); spawnItem({ id: IN.pumpkin_seeds.idx, n: 4 }, x + .5, y + 1, z + .5); damageTool(1); snd('shear'); return true; }
      return false;
    }
    function sameProps(s, nt) { const t = TT[STT[s]]; let n = nt.base; for (const [k] of t.props) if (nt.pk[k] !== undefined) n = sw(n, k, sv(s, k)); return n; }
    function tryPortal(x, y, z) { void x; void y; void z; return false; }
    function boneMeal(x, y, z, s, t) {
      if (NET.role === 'guest') { netSend({ t: 'bonemeal', x, y, z }); return t.crop || t.sapling || t.id === 'grass_block'; }
      if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { const m = t.maxAge, a = sv(s, 'age'); if (a >= m) return false; setBlock(x, y, z, sw(s, 'age', Math.min(m, a + rr(2, 5)))); return true; }
      if (t.crop === 'berry') { const a = sv(s, 'age'); if (a >= 3) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.id === 'cocoa') { const a = sv(s, 'age'); if (a >= 2) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.sapling) { if (RNG() < .45) growTree(x, y, z, t.sapling); return true; }
      if (t.id === 'grass_block') { for (let i = 0; i < 40; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3; let gy = y + 1; if (isT(getS(gx, gy - 1, gz), 'grass_block') && !getS(gx, gy, gz)) { const r = RNG(); setBlock(gx, gy, gz, r < .8 ? S('short_grass') : r < .9 ? S(['dandelion', 'poppy'][ri(2)]) : S('short_grass')); } } return true; }
      if (t.id === 'short_grass' || t.id === 'fern') { if (!getS(x, y + 1, z)) { const tn = t.id === 'fern' ? 'large_fern' : 'tall_grass'; setBlock(x, y, z, S(tn, { half: 'bottom' })); setBlock(x, y + 1, z, S(tn, { half: 'top' })); } return true; }
      if (t.flower && !t.tall && t.id !== 'wither_rose') { for (let i = 0; i < 8; i++) { const gx = x + ri(5) - 2, gz = z + ri(5) - 2; if (isT(getS(gx, y - 1, gz), 'grass_block') && !getS(gx, y, gz)) setBlock(gx, y, gz, s); } return true; }
      if (t.tall && t.flower !== undefined || t.id === 'sunflower' || t.id === 'lilac' || t.id === 'rose_bush' || t.id === 'peony') { spawnItem({ id: IN[t.id].idx, n: 1 }, x + .5, y + .5, z + .5); return true; }
      if (t.id === 'shelf_mushroom' && sv(s, 'size') === 0) { setBlock(x, y, z, sw(s, 'size', 1)); return true; }
      if (t.id === 'moss_block') { for (let i = 0; i < 30; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3, gy = y + ri(3) - 1; const b = getS(gx, gy, gz); if ((isT(b, 'stone') || isT(b, 'dirt') || isT(b, 'grass_block')) && !getS(gx, gy + 1, gz)) setBlock(gx, gy, gz, S('moss_block')); } return true; }
      if (t.id === 'sugar_cane' || t.id === 'cactus' || t.id === 'bamboo') { let top = y; while (TT[STT[getS(x, top + 1, z)]] === t) top++; if (!getS(x, top + 1, z)) { setBlock(x, top + 1, z, t.base); return true; } }
      if (t.id === 'kelp' || t.id === 'kelp_plant') { let top = y; while (isT(getS(x, top + 1, z), 'kelp') || isT(getS(x, top + 1, z), 'kelp_plant')) top++; if (FLU[getS(x, top + 1, z)] === 1) { setBlock(x, top, z, S('kelp_plant')); setBlock(x, top + 1, z, S('kelp')); return true; } }
      return false;
    }
    let EX = 0, EY = 0, EZ = 0;
    const reach = () => mode() === 'creative' ? CFG.REACH_CREATIVE : CFG.REACH;
    function lookDir() { const cp = Math.cos(P.pitch); return [-Math.sin(P.yaw) * cp, Math.sin(P.pitch), -Math.cos(P.yaw) * cp]; }
    function attackPress() {
      if (P.dead || gui || scr !== 'game') return;
      swing();
      if (mode() === 'spectator') return;
      if (HIT.ent) { attackMob(HIT.ent); return; }
      if (!HIT.b) { P.atkT = tickN; return; }
      if (mode() === 'adventure') return;
      const s = getS(HIT.x, HIT.y, HIT.z);
      if (creative()) { const h = held(); if (h && IT[h.id].tool && IT[h.id].tool.k === 'sword') return; breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; return; }
      if (relHard(s) >= 1) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; }
    }
    function breakNet(x, y, z) {
      breakBlock(x, y, z, true);
    }
    function usePress() {
      if (P.dead || gui || scr !== 'game') return;
      doUse(); useCd = CFG.USE_DELAY;
    }
    function doUse() {
      if (mode() === 'spectator') return;
      const st = held();
      if (HIT.ent) { if (interactMob(HIT.ent)) return; }
      if (HIT.b && !(P.sneak && st)) { if (useBlock(HIT.x, HIT.y, HIT.z)) { swing(); return; } }
      if (HIT.b && st && canBuild()) { if (useOnBlock(st, HIT.x, HIT.y, HIT.z, HIT.f)) return; }
      if (HIT.b && st && !IT[st.id].place && IT[st.id].bucket) { if (useItem(st, true)) return; }
      if (st && useItem(st, HIT.b)) return;
      if (st && HIT.b && IT[st.id].place && canBuild()) { placeBlock(IT[st.id], HIT, false); return; }
      if (!st && offhand && HIT.b && IT[offhand.id].place && canBuild()) { placeBlock(IT[offhand.id], HIT, true); return; }
      if (offhand && IT[offhand.id].shield) shielding = true;
    }
    function useBlock(x, y, z) {
      const s = getS(x, y, z), t = TT[STT[s]], u = t.use;
      if (!u) return false;
      if (u === 'craft') { openGui('table'); return true; }
      if (u === 'furnace') { openContainer(x, y, z, 'furnace'); return true; }
      if (u === 'chest') { if (t.cont && SOL[getS(x, y + 1, z)] === 1 && t.id.includes('chest') && !t.shulker) return true; openContainer(x, y, z, t.cont === 9 ? 'dispenser' : t.cont === 5 ? 'hopper' : 'chest'); snd('chest_open', { x, y, z }); if (t.id === 'barrel') setBlock(x, y, z, sw(s, 'open', 1)); return true; }
      if (u === 'ender') { openGui('ender'); snd('chest_open', { x, y, z }); return true; }
      if (u === 'stonecutter') { openGui('stonecutter'); return true; }
      if (u === 'door' || u === 'trapdoor' || u === 'gate') {
        if (mode() === 'spectator') return false;
        const ns = sw(s, 'open', sv(s, 'open') ? 0 : 1);
        if (u === 'gate' && !sv(s, 'open')) { const q = fq(s), pq = horizQ(); if ((q & 1) === (pq & 1) && q !== pq) setBlock(x, y, z, sw(ns, 'facing', pq)); else setBlock(x, y, z, ns); }
        else setBlock(x, y, z, ns);
        if (u === 'door') { const oy = sv(s, 'half') ? -1 : 1, o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, sw(o, 'open', sv(ns, 'open'))); }
        snd(sv(ns, 'open') ? 'door_open' : 'door_close', { x, y, z });
        return true;
      }
      if (u === 'idoor') return false;
      if (u === 'lever') { setBlock(x, y, z, sw(s, 'powered', sv(s, 'powered') ? 0 : 1)); snd('click', { x, y, z }); redstoneAround(x, y, z); return true; }
      if (u === 'button') { if (sv(s, 'powered')) return true; setBlock(x, y, z, sw(s, 'powered', 1)); snd('click', { x, y, z }); schedule(x, y, z, t.btnTime || 20, 'button'); redstoneAround(x, y, z); return true; }
      if (u === 'repeater') { setBlock(x, y, z, sw(s, 'delay', (sv(s, 'delay') + 1) & 3)); snd('click', { x, y, z }); return true; }
      if (u === 'daylight') { setBlock(x, y, z, sw(s, 'inverted', sv(s, 'inverted') ? 0 : 1)); return true; }
      if (u === 'note') { const n = (sv(s, 'note') + (P.sneak ? 0 : 1)) % 25; setBlock(x, y, z, sw(s, 'note', n)); noteSnd(n, getS(x, y - 1, z), { x, y, z }); particle(x + .5, y + 1.2, z + .5, 0, .6, 0, [n * 10, 255 - n * 8, 120], .8, .15, 0, 1); return true; }
      if (u === 'bed') { trySleep(x, y, z, s, t); return true; }
      if (u === 'cake') { if (P.food < 20 || creative()) { P.food = Math.min(20, P.food + 2); P.sat = Math.min(P.food, P.sat + .4); snd('eat'); const b = sv(s, 'bites'); if (b >= 6) setBlock(x, y, z, 0); else setBlock(x, y, z, sw(s, 'bites', b + 1)); } return true; }
      if (u === 'composter') { const st = held(), l = sv(s, 'level'); if (l === 8) { setBlock(x, y, z, S('composter')); spawnItem({ id: IN.bone_meal.idx, n: 1 }, x + .5, y + 1.1, z + .5); snd('compost'); return true; } if (st && compostChance(IT[st.id]) > 0 && l < 7) { if (RNG() < compostChance(IT[st.id])) { setBlock(x, y, z, sw(s, 'level', l + 1)); if (l + 1 === 7) schedule(x, y, z, 20, 'compost'); } consumeHeld(1); snd('compost'); for (let i = 0; i < 4; i++) particle(x + .5, y + 1, z + .5, (RNG() - .5), .5, (RNG() - .5), [120, 200, 80], .5, .05, 6); return true; } return false; }
      if (u === 'cauldron') { const st = held(); if (!st) return false; const it = IT[st.id]; if (it.id === 'glass_bottle' && sv(s, 'level') && sv(s, 'content') === 0) { setBlock(x, y, z, sv(s, 'level') === 1 ? S('cauldron') : sw(s, 'level', sv(s, 'level') - 1)); consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; } if (it.id === 'potion' && sv(s, 'level') < 3 && sv(s, 'content') === 0) { setBlock(x, y, z, S('cauldron', { level: sv(s, 'level') + 1, content: 'water' })); consumeHeld(1, { id: IN.glass_bottle.idx, n: 1 }); return true; } return false; }
      if (u === 'pot') { const st = held(), p = svn(s, 'plant'); if (p === 'none' && st) { const nm = IT[st.id].id, vals = t.props[0][1]; if (vals.includes(nm)) { setBlock(x, y, z, sw(s, 'plant', nm)); consumeHeld(1); return true; } return false; } if (p !== 'none' && !st) { inv[sel] = { id: IN[p].idx, n: 1 }; setBlock(x, y, z, S('flower_pot')); return true; } return false; }
      if (u === 'jukebox') { const be = beAt(x, y, z, true); if (be.disc) { spawnItem(be.disc, x + .5, y + 1.1, z + .5, 0, .2, 0); be.disc = null; stopDisc(); return true; } const st = held(); if (st && IT[st.id].disc) { be.disc = { ...st, n: 1 }; consumeHeld(1); playDisc(IT[st.id].disc, x, y, z); chatSys('Now Playing: C418 - ' + IT[st.id].desc); return true; } return false; }
      if (u === 'candle') { const st = held(); if (sv(s, 'lit') && !st) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); return true; } return false; }
      if (u === 'tnt') return false;
      if (u === 'sign') { openSign(x, y, z); return true; }
      if (u === 'enchant') { chatSys('Enchanting is not available yet.'); return true; }
      return false;
    }
    function compostChance(it) {
      if (!it) return 0;
      const n = it.id;
      if (/seeds|short_grass|kelp|sweet_berries|glow_berries|leaves|sapling|moss_carpet|hanging_roots|pitcher_pod|pink_petals|leaf_litter/.test(n)) return .3;
      if (/cactus|sugar_cane|vine|melon_slice|tall_grass|dry_grass|bush|shrub|wildflowers/.test(n)) return .5;
      if (/apple|beetroot|carrot|cocoa|potato|wheat|fern|mushroom|flower|lily_pad|melon|moss_block|pumpkin|sea_pickle|dandelion|poppy|tulip|orchid|allium|bluet|daisy|cornflower|lily_of|azalea|eyeblossom|shelf/.test(n)) return .65;
      if (/baked_potato|bread|cookie|hay_block|nether_wart/.test(n)) return .85;
      if (/cake|pumpkin_pie/.test(n)) return 1;
      return 0;
    }
    function trySleep(x, y, z, s, t) {
      const night = (W.time % 24000) > 12542 && (W.time % 24000) < 23460, storm = W.thunder;
      if (t.bed === 1) { P.spawn = [x + .5, y + 1, z + .5]; chatSys('Respawn point set'); }
      if (!night && !storm) { chatSys('You can only sleep at night or during thunderstorms'); return; }
      for (const e of ENTS) if (e.kind === 'mob' && MT[e.type].hostile && Math.abs(e.x - x) < 8 && Math.abs(e.y - y) < 5 && Math.abs(e.z - z) < 8) { chatSys('You may not rest now; there are monsters nearby'); return; }
      P.sleeping = 1; P.bedPos = [x, y, z]; P.x = x + .5; P.z = z + .5; P.y = y + .56; P.vx = P.vy = P.vz = 0;
      netSend({ t: 'sleep', v: 1 });
    }
    function wake() { if (!P.sleeping) return; P.sleeping = 0; const b = P.bedPos; if (b) { P.y = b[1] + .6; const bs = getS(b[0], b[1], b[2]); if (TT[STT[bs]].bed === 2) { setBlock(b[0], b[1], b[2], 0); } } netSend({ t: 'sleep', v: 0 }); }
    function tickInteract() {
      if (breakCd > 0) breakCd--;
      if (useCd > 0) useCd--;
      if (gui || P.dead) { mine = null; eating = null; drawing = null; shielding = false; return; }
      if (P.sleeping) return;
      const st = held();
      if (eating) {
        if (!useHeld || !st || st.id !== eating.id) eating = null;
        else {
          eating.t++;
          if (eating.t > 7 && eating.t % 4 === 0 && !eating.drink) { snd('eat'); for (let i = 0; i < 3; i++) { const c = tilePxItem(st.id); particle(P.x - Math.sin(P.yaw) * .4, P.y + P.eye - .2, P.z - Math.cos(P.yaw) * .4, (RNG() - .5) * 1.5, RNG() * 1.5, (RNG() - .5) * 1.5, c, .5, .06, 14); } }
          if (eating.drink && eating.t % 6 === 0) snd('drink');
          if (eating.t >= eating.dur) { finishEat(st); eating = null; useCd = 4; }
        }
      }
      if (drawing) {
        if (!st || st.id !== drawing.id) drawing = null;
        else if (useHeld) { drawing.t++; if (drawing.cb && drawing.t === 25) { st.x = { loaded: 1 }; snd('crossbow_load'); drawing = null; } }
        else {
          const it = IT[st.id];
          if (it.bow) { let f = drawing.t / 20; f = (f * f + f * 2) / 3; if (f > 1) f = 1; if (f >= .1) { if (fireArrow(f * 3, f >= 1 ? 3 : 2)) damageTool(1); } }
          else if (it.trident && drawing.t >= 10) { snd('throw'); }
          drawing = null;
        }
      }
      shielding = useHeld && ((st && IT[st.id].shield) || (offhand && IT[offhand.id].shield && !(st && (IT[st.id].food || IT[st.id].bow))));
      if (attackHeld && !HIT.ent && HIT.b && mode() !== 'adventure' && mode() !== 'spectator') {
        if (swingT < 0) swingT = 0;
        if (breakCd === 0) {
          if (creative()) { const h = held(); if (!(h && IT[h.id].tool && IT[h.id].tool.k === 'sword')) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; } }
          else {
            const s = getS(HIT.x, HIT.y, HIT.z);
            if (!mine || mine.x !== HIT.x || mine.y !== HIT.y || mine.z !== HIT.z || mine.s !== s) mine = { x: HIT.x, y: HIT.y, z: HIT.z, s, p: 0, t: 0 };
            mine.p += relHard(s);
            if (mine.t++ % 4 === 0) { playBlockSnd(s, 'hit', HIT.x, HIT.y, HIT.z); burst(HIT.x + HIT.fx * .55, HIT.y + HIT.fy * .55, HIT.z + HIT.fz * .55, s, 2, 1.5); }
            if (mine.p >= 1) { breakNet(mine.x, mine.y, mine.z); mine = null; breakCd = CFG.BREAK_DELAY; }
            netAct({ mine: mine ? [mine.x, mine.y, mine.z, Math.min(9, mine.p * 10 | 0)] : 0 });
          }
        }
      } else if (mine) { mine = null; netAct({ mine: 0 }); }
      if (useHeld && useCd === 0 && !eating && !drawing) { const h = held(); if (!(h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink))) { doUse(); useCd = CFG.USE_DELAY; } }
    }
    function tilePxItem(id) { const k = ITIDX.get(id); if (k === undefined) { const t = IT[id].block ? TN[IT[id].block] : null; return t ? tileAvg(TIL[t.base * 6 + 2] >= 0 ? TIL[t.base * 6 + 2] : 0) : [200, 120, 80]; } const ox = (k & 63) * 16, oy = (k >> 6) * 16; for (let i = 0; i < 8; i++) { const o = ((oy + ri(16)) * 1024 + ox + ri(16)) * 4; if (itaImg.data[o + 3]) return [itaImg.data[o], itaImg.data[o + 1], itaImg.data[o + 2]]; } return [200, 120, 80]; }
    function finishEat(st) {
      const it = IT[st.id];
      if (it.food) {
        P.food = Math.min(20, P.food + it.food.n); P.sat = Math.min(P.food, P.sat + it.food.s);
        snd('burp');
        const id = it.id;
        if (id === 'golden_apple') { P.absorb = Math.max(P.absorb, 4); P.effects.regen = Math.max(P.effects.regen || 0, 100); }
        if (id === 'enchanted_golden_apple') { P.absorb = 16; P.effects.regen = 400; P.effects.fireRes = 6000; }
        if (id === 'rotten_flesh' && RNG() < .8) P.effects.hunger = 600;
        if (id === 'chicken' && RNG() < .3) P.effects.hunger = 600;
        if (id === 'spider_eye' || (id === 'poisonous_potato' && RNG() < .6)) P.effects.poison = id === 'spider_eye' ? 100 : 100;
        if (id === 'pufferfish') { P.effects.poison = 1200; P.effects.hunger = 300; }
        if (id === 'chorus_fruit') teleportPlayerRandom();
        if (id === 'honey_bottle') P.effects.poison = 0;
        if (mode() !== 'creative') { st.n--; if (it.food.bowl) giveOrDrop({ id: IN.bowl.idx, n: 1 }); if (id === 'honey_bottle') giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); if (st.n <= 0) inv[sel] = null; }
      } else if (it.drink) {
        if (it.drink === 'milk') { P.effects = {}; if (mode() !== 'creative') inv[sel] = { id: IN.bucket.idx, n: 1 }; }
        else if (mode() !== 'creative') { st.n--; if (st.n <= 0) inv[sel] = null; giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); }
      }
    }
    function teleportPlayerRandom() { for (let k = 0; k < 16; k++) { const x = Math.floor(P.x + (RNG() - .5) * 16), z = Math.floor(P.z + (RNG() - .5) * 16); for (let y = Math.floor(P.y) + 8; y > P.y - 8; y--) if (SOL[getS(x, y - 1, z)] && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)]) { P.x = x + .5; P.y = y; P.z = z + .5; snd('teleport'); return; } } }
    function tickPlayer() {
      P.px = P.x; P.py = P.y; P.pz = P.z; P.walkP = P.walk; P.bobP = P.bob; P.eyeP = P.eye;
      if (P.hurtT > 0) P.hurtT--;
      if (P.shake > 0) P.shake--;
      const c0 = colAt(Math.floor(P.x) >> 4, Math.floor(P.z) >> 4);
      if (!c0 || !c0.meshed) { if (P.y < -64) P.y = 200; return; }
      const md = mode(), spec = md === 'spectator';
      P.spec = spec;
      if (P.place) {
        P.place = false;
        let bx = Math.floor(P.x), bz = Math.floor(P.z);
        const dryTop = (x, z) => { let y = H - 2; while (y > 1 && ((!SOL[getS(x, y, z)] && !FLU[getS(x, y, z)]) || LEAF[getS(x, y, z)] || TT[STT[getS(x, y, z)]].tags.has('log'))) y--; return FLU[getS(x, y, z)] ? -1 : y; };
        if (!P.spawn && dryTop(bx, bz) < 0) { let found = false; for (let r = 1; r <= 24 && !found; r++) for (let k = 0; k < 8 * r && !found; k++) { const a = k / (8 * r) * Math.PI * 2, x = bx + Math.round(Math.cos(a) * r), z = bz + Math.round(Math.sin(a) * r); const c = colAt(x >> 4, z >> 4); if (!c || c.st < 1) continue; if (dryTop(x, z) > 0) { bx = x; bz = z; P.x = x + .5; P.z = z + .5; found = true; if (W && !W.remote && W.spawn && Math.abs(W.spawn[0] - .5) < 1e-6) W.spawn = [P.x, W.spawn[1], P.z]; } } }
        let y = H - 2;
        while (y > 1 && ((!SOL[getS(bx, y, bz)] && !FLU[getS(bx, y, bz)]) || LEAF[getS(bx, y, bz)] || TT[STT[getS(bx, y, bz)]].tags.has('log'))) y--;
        if (P.y < y + 1 || !boxFree(P, 0, 0, 0)) P.y = y + 1;
        P.py = P.y;
      }
      if (P.sleeping) { P.vx = P.vz = 0; P.vy = 0; P.sleeping++; return; }
      let fwd = 0, str = 0;
      const K = c => keys.has(c), active = !gui && !P.dead && !chatOpen;
      if (active) {
        if (K(KB.fwd) || K('ArrowUp')) fwd++;
        if (K(KB.back) || K('ArrowDown')) fwd--;
        if (K(KB.left) || K('ArrowLeft')) str--;
        if (K(KB.right) || K('ArrowRight')) str++;
        fwd = clamp(fwd - stick.y, -1, 1); str = clamp(str + stick.x, -1, 1);
      }
      const jump = active && (K(KB.jump) || tJump), sneakKey = active && (K(KB.sneak) || K('ShiftRight') || tSneak);
      if (spec) P.fly = true;
      P.sneak = sneakKey && !P.fly;
      fwd *= CFG.INPUT_MUL; str *= CFG.INPUT_MUL;
      if (P.sneak) { fwd *= CFG.SNEAK_MUL; str *= CFG.SNEAK_MUL; }
      if (eating || drawing || shielding) { fwd *= .2; str *= .2; }
      const canSprint = (md === 'creative' || spec || P.food > 6) && !P.sneak && !eating && !drawing;
      if (!P.sprint && canSprint && fwd >= .8 && (sprintKey || K(KB.sprint) || sprintTap > 0 || Math.hypot(stick.x, stick.y) > .97)) P.sprint = true;
      if (P.sprint && (fwd < .8 || (P.collH && !P.fly) || !canSprint)) P.sprint = false;
      sprintTap = 0;
      const inW = !spec && fluidIn(P, 1), inL = !spec && fluidIn(P, 2);
      P.inLava = inL;
      const feet = getS(Math.floor(P.x), Math.floor(P.y + .1), Math.floor(P.z)), feetT = TT[STT[feet]];
      P.climbing = !spec && !P.fly && (feetT.climb || isT(feet, 'scaffolding')) ? 1 : 0;
      const web = !spec && blockIn(P, b => TT[STT[b]].web), powder = !spec && blockIn(P, b => TT[STT[b]].powder) && !(armor[3] && IT[armor[3].id].id === 'leather_boots');
      const sy2 = Math.sin(P.yaw), cy2 = Math.cos(P.yaw);
      const accel = a => { let f = str * str + fwd * fwd; if (f >= 1e-4) { f = Math.sqrt(f); if (f < 1) f = 1; f = a / f; const s = str * f, w = fwd * f; P.vx += s * cy2 - w * sy2; P.vz += -s * sy2 - w * cy2; } };
      if (P.fly) { if (sneakKey) P.vy -= CFG.FLY_V * 3 * (spec ? 1 : 1); if (jump) P.vy += CFG.FLY_V * 3; }
      else if (inW || inL) { if (jump) P.vy += CFG.WATER_UP; }
      else if (P.climbing) { if (jump || (P.collH && fwd > 0)) P.vy = .2; }
      else if (jump && P.onGround && P.jumpT === 0) {
        P.vy = CFG.JUMP * (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'honey_block') ? .5 : 1);
        if (P.sprint) { P.vx -= sy2 * CFG.SPRINT_JUMP; P.vz -= cy2 * CFG.SPRINT_JUMP; }
        P.jumpT = CFG.JUMP_TICKS; exhaust(P.sprint ? CFG.EXH_SPRINT_JUMP : CFG.EXH_JUMP);
        const fb = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (isT(fb, 'farmland') && mode() !== 'creative' && RNG() < .3) setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
      }
      if (!jump) P.jumpT = 0; else if (P.jumpT > 0) P.jumpT--;
      const gB = getS(Math.floor(P.x), Math.floor(P.y - .51), Math.floor(P.z)), gT = TT[STT[gB]];
      const slip = gT.slip || .6;
      if (spec) {
        accel(CFG.FLY_ACC * (P.sprint ? 2 : 1) * 1.5);
        P.x += P.vx; P.y += P.vy; P.z += P.vz; P.vy *= CFG.FLY_VDRAG; P.vx *= .91; P.vz *= .91; P.onGround = false;
      } else if ((inW || inL) && !P.fly) {
        accel(inL ? .02 : P.sprint ? .04 : CFG.SWIM_ACC);
        if (P.sprint && inW && fluidIn(P, 1, 1.4)) { P.vy += Math.sin(P.pitch) * .02; }
        moveE(P, P.vx, P.vy, P.vz, false, .6);
        const dr = inL ? CFG.LAVA_DRAG : CFG.WATER_DRAG;
        P.vx *= dr; P.vy *= inL ? .5 : .8; P.vz *= dr; P.vy -= inL ? .02 : CFG.WATER_GRAV;
        if (P.collH && boxFree(P, P.vx, .6 + P.vy, P.vz)) P.vy = .3;
      } else {
        const a = P.fly ? CFG.FLY_ACC * (P.sprint ? 2 : 1) : P.onGround ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277 / Math.pow(slip * .91, 3)) * .6 * .6 / .6 : (P.sprint ? CFG.AIR_ACC_SPRINT : CFG.AIR_ACC);
        accel(P.onGround && !P.fly ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277136 / Math.pow(slip * .91, 3)) : a);
        if (P.climbing) { P.vx = clamp(P.vx, -.15, .15); P.vz = clamp(P.vz, -.15, .15); P.vy = Math.max(P.vy, P.sneak ? 0 : -.15); }
        if (web) { P.vx *= .25; P.vy *= .05; P.vz *= .25; }
        if (powder) { P.vx *= .9; P.vy = Math.max(-.05, P.vy * .9); P.vz *= .9; }
        const vy0 = P.vy;
        moveE(P, P.vx, P.vy, P.vz, P.sneak && !P.fly, CFG.STEP);
        if (P.fly) P.vy = vy0 * CFG.FLY_VDRAG; else P.vy = (P.vy - CFG.GRAVITY) * CFG.VDRAG;
        const dr = P.onGround ? slip * .91 : CFG.AIR_DRAG;
        P.vx *= dr; P.vz *= dr;
        if (P.onGround && gT.bounce && vy0 < -.1 && !P.sneak) P.vy = -vy0 * .95;
        if (gT.id === 'soul_sand') { P.vx *= .4; P.vz *= .4; }
        if (gT.id === 'honey_block') { P.vx *= .4; P.vz *= .4; }
        if (feetT.id === 'sweet_berry_bush' && (Math.abs(P.vx) > .003 || Math.abs(P.vz) > .003)) { P.vx *= .8; P.vz *= .8; if (sv(feet, 'age') > 0 && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus'); }
      }
      if (P.fly && P.onGround && md !== 'creative' && !spec) P.fly = false;
      if (P.fly && P.onGround && md === 'creative') P.fly = false;
      if (P.y > H + 100) { P.y = H + 100; P.vy = Math.min(0, P.vy); }
      if (P.y < -64 && !spec) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'void'); }
      const nowW = inW;
      if (nowW && !P.wasW && P.vy < -.3) snd('splash');
      P.wasW = nowW;
      if (nowW || P.fly || P.climbing || web || powder) P.fall = 0;
      else if (P.onGround) {
        if (P.fall > 0) {
          const land = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), lt = TT[STT[land]];
          let d = Math.ceil(P.fall - CFG.FALL_SAFE);
          if (lt.soft) d = Math.ceil(d * lt.soft);
          if (lt.bounce || lt.id === 'slime_block') d = P.sneak ? d : 0;
          if (lt.bouncy) d = Math.ceil((P.fall * (1 - lt.bouncy) - CFG.FALL_SAFE));
          if (lt.id === 'powder_snow' || lt.id === 'scaffolding' || lt.id === 'cobweb' || FLU[getS(Math.floor(P.x), Math.floor(P.y), Math.floor(P.z))]) d = 0;
          if (d > 0) hurtPlayer(d, null, null, 'fall');
          else if (P.fall > 1) matSnd(lt.snd, 0, { x: P.x, y: P.y, z: P.z }, 1.4);
          if (P.fall > 1 && isT(land, 'farmland') && md !== 'creative') setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
          P.fall = 0;
        }
      } else if (P.y < P.py) P.fall += P.py - P.y;
      const hd = Math.hypot(P.x - P.px, P.z - P.pz);
      if (P.onGround && !nowW && !P.sneak) { P.walk += hd * .6; if (P.walk > P.nextStep) { P.nextStep = Math.floor(P.walk) + 1; const b = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (b) matSnd(TT[STT[b]].snd, 0, null); } }
      else if (P.onGround) P.walk += hd * .6;
      if (P.climbing && Math.abs(P.y - P.py) > .05 && tickN % 8 === 0) matSnd('ladder', 0, null);
      P.bob += ((P.onGround && !P.fly ? Math.min(.1, hd) : 0) - P.bob) * .4;
      if (P.sprint) exhaust(hd * CFG.EXH_SPRINT);
      if (nowW) exhaust(Math.hypot(hd, P.y - P.py) * CFG.EXH_SWIM);
      const tgtEye = P.sleeping ? .2 : P.sneak ? CFG.EYE_SNEAK : CFG.EYE;
      P.eye += (tgtEye - P.eye) * .5;
      P.h = P.sneak ? CFG.PH_SNEAK : CFG.PH;
      if (!P.sneak && !boxFree(P, 0, 0, 0, CFG.PH) && boxFree(P, 0, 0, 0, CFG.PH_SNEAK)) { P.sneak = true; P.h = CFG.PH_SNEAK; }
      P.eyeW = !spec && eyeIn(1);
      P.eyeL = !spec && eyeIn(2);
      if (P.eyeW && md !== 'creative' && !spec && !P.effects.waterBreathing) { if (--P.air <= -20) { P.air = 0; hurtPlayer(2, null, null, 'drown'); } } else P.air = Math.min(CFG.AIR_MAX, P.air + 5);
      if (inL && md !== 'creative' && !spec) { if (!P.effects.fireRes) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'lava'); } P.fire = 300; }
      if (!spec && blockIn(P, b => TT[STT[b]].fire)) { P.fire = Math.max(P.fire, 160); if (tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (P.fire > 0) { P.fire--; if (nowW || W.raining && skyOpenP()) P.fire = 0; if (P.fire % 20 === 0 && !inL && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (!spec && (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'magma_block')) && !P.sneak && tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire');
      if (!spec && blockIn({ x: P.x, y: P.y, z: P.z, w: P.w + .02, h: P.h }, b => TT[STT[b]].id === 'cactus') && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus');
      if (!spec && md !== 'creative' && !boxFree({ x: P.x, y: P.y + P.eye - .1, z: P.z, w: .2, h: .2 }, 0, 0, 0) && SOL[getS(Math.floor(P.x), Math.floor(P.y + P.eye), Math.floor(P.z))] === 1 && tickN % 10 === 0) hurtPlayer(1, null, null, 'suffocate');
      for (const k in P.effects) { if (P.effects[k] > 0) P.effects[k]--; else delete P.effects[k]; }
      if (P.effects.poison && tickN % 25 === 0 && P.hp > 1) hurtPlayer(1, null, null, 'magic');
      if (P.effects.regen && tickN % 50 === 0 && P.hp < 20) P.hp = Math.min(20, P.hp + 1);
      if (P.effects.hunger) exhaust(.005);
      if (md === 'survival' || md === 'adventure') {
        if (P.exh > 4) { P.exh -= 4; if (P.sat > 0) P.sat = Math.max(0, P.sat - 1); else if (W.diff > 0) P.food = Math.max(0, P.food - 1); }
        const natRegen = W.rules.naturalRegeneration !== false;
        if (natRegen && P.food >= 20 && P.sat > 0 && P.hp < 20) { if (++P.regenT >= 10) { const a = Math.min(P.sat, 6); P.hp = Math.min(20, P.hp + a / 6); exhaust(a); P.regenT = 0; } }
        else if (natRegen && P.food >= 18 && P.hp < 20) { if (++P.regenT >= CFG.REGEN_TICKS) { P.hp = Math.min(20, P.hp + 1); exhaust(CFG.EXH_REGEN); P.regenT = 0; } }
        else if (P.food <= 0) { if (++P.regenT >= CFG.REGEN_TICKS) { if (P.hp > (W.diff === 3 ? 0 : W.diff === 2 ? 1 : 10)) hurtPlayer(1, null, null, 'starve'); P.regenT = 0; } }
        else P.regenT = 0;
        if (W.diff === 0 && P.hp < 20 && tickN % 20 === 0) P.hp = Math.min(20, P.hp + 1);
        if (W.diff === 0 && P.food < 20 && tickN % 20 === 0) P.food++;
      }
      if (P.hp > 20) P.hp = 20;
    }
    const skyOpenP = () => (getL(Math.floor(P.x), Math.floor(P.y + 1.6), Math.floor(P.z)) >> 4) === 15;
    function eyeIn(fk) { const x = Math.floor(P.x), y = Math.floor(P.y + P.eye), z = Math.floor(P.z), b = getS(x, y, z); if (FLU[b] !== fk) return false; const lv = (b - TT[STT[b]].base) & 7, top = FLU[getS(x, y + 1, z)] === fk ? 1 : lv ? (8 - lv) / 9 : 8 / 9; return P.y + P.eye - y < top; }
    const SCHED = new Map(), SCHK = new Set();
    let simT = 0;
    function schedule(x, y, z, d, kind) {
      const k = x + ',' + y + ',' + z + ',' + kind;
      if (SCHK.has(k)) return;
      SCHK.add(k);
      const t = simT + Math.max(1, d | 0);
      let a = SCHED.get(t); if (!a) SCHED.set(t, a = []);
      a.push([x, y, z, kind, k]);
    }
    const isHost = () => NET.role !== 'guest';
    const WSTATE = l => S('water', { level: l }), LSTATE = l => S('lava', { level: l });
    const flv = s => (s - TT[STT[s]].base) & 15;
    const fState = (fk, l) => fk === 1 ? WSTATE(l) : LSTATE(l);
    function onSetHook(x, y, z, old, s, flags) {
      if (!isHost()) return;
      for (let d = 0; d < 6; d++) { const D = DIR6[d]; neighborChanged(x + D[0], y + D[1], z + D[2], x, y, z); }
      neighborChanged(x, y, z, x, y, z);
      const ot = TT[STT[old]];
      if (ot.tags.has('log') && !TT[STT[s]].tags.has('log')) for (let dy = -4; dy <= 4; dy++) for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { const b = getS(x + dx, y + dy, z + dz); if (LEAF[b] && !sv(b, 'persistent')) schedule(x + dx, y + dy, z + dz, 10 + ri(120), 'leaf'); }
      if (ot.redstone || TT[STT[s]].redstone || ot.power || TT[STT[s]].power || SOL[old] !== SOL[s]) redstoneAround(x, y, z);
      void flags;
    }
    function neighborChanged(x, y, z, sx, sy, sz) {
      const s = getS(x, y, z);
      if (!s) return;
      const t = TT[STT[s]];
      if (FLU[s]) { schedule(x, y, z, FLU[s] === 1 ? 5 : W.dim === 'nether' ? 10 : 30, 'fluid'); if (FLU[s] === 2) lavaContact(x, y, z, s); return; }
      if (t.grav) schedule(x, y, z, 2, 'fall');
      if (t.water && !FLU[s]) { }
      if (t.powder2) { for (const D of DIR6) if (D[1] !== -1 && FLU[getS(x + D[0], y + D[1], z + D[2])] === 1) { setBlock(x, y, z, TN[t.powder2].base); return; } }
      if (needsSupport(t)) schedule(x, y, z, 1, 'support');
      if (t.id === 'redstone_wire' || t.rtorch || t.rep || t.lamp || t.door || t.id.includes('trapdoor') || t.gate || t.tnt || t.bulb || t.piston || t.id === 'note_block') schedule(x, y, z, t.rtorch ? 2 : 1, 'red');
      void sx; void sy; void sz;
    }
    function needsSupport(t) { return t.plant || t.torch || t.attach || t.door || t.bed || t.tall || t.id === 'ladder' || t.id === 'vine' || t.id === 'sugar_cane' || t.id === 'cactus' || t.id === 'bamboo' || t.id.includes('carpet') || t.id === 'snow' || t.rail || t.id === 'lily_pad' || t.id === 'kelp' || t.id === 'kelp_plant' || t.id === 'scaffolding' || t.sign || t.id === 'cocoa' || t.id.includes('pressure_plate') || t.fire; }
    function supported(x, y, z, s, t) {
      const below = getS(x, y - 1, z), bt = TT[STT[below]];
      if (t.fire) return SOL[below] === 1 || hasFlammableNb(x, y, z);
      if (t.torch) { if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1; } return supportOK(x, y - 1, z, 2); }
      if (t.door) { const up = sv(s, 'half'); return up ? TT[STT[getS(x, y - 1, z)]] === t : supportOK(x, y - 1, z, 2) && TT[STT[getS(x, y + 1, z)]] === t; }
      if (t.tall) { const up = sv(s, 'half'); return up ? TT[STT[below]] === t : TT[STT[getS(x, y + 1, z)]] === t && (DIRTLIKE.has(bt.id) || t.water || bt.id.includes('sand') && t.id === 'tall_dry_grass'); }
      if (t.bed) { const hd = sv(s, 'part'), d = F4D[fq(s)], o = getS(x + (hd ? -d[0] : d[0]), y, z + (hd ? -d[1] : d[1])); return TT[STT[o]] === t; }
      if (t.id === 'ladder' || t.id.endsWith('wall_sign') || t.id === 'tripwire_hook') { const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1 || t.id.includes('sign') && SOL[getS(x - d[0], y, z - d[1])]; }
      if (t.id === 'vine') { if (sv(s, 'up') && SOL[getS(x, y + 1, z)]) return true; for (let q = 0; q < 4; q++) if (sv(s, FACE4[q])) { const d = F4D[q]; if (FULLT[getS(x + d[0], y, z + d[1])] || LEAF[getS(x + d[0], y, z + d[1])]) return true; } return isT(getS(x, y + 1, z), 'vine'); }
      if (t.id === 'cocoa') { const d = F4D[fq(s)]; const b = getS(x - d[0], y, z - d[1]); return TT[STT[b]].id.includes('jungle'); }
      if (t.id === 'shelf_mushroom') { const d = F4D[fq(s)]; return SOL[getS(x - d[0], y, z - d[1])] === 1; }
      if (t.pk.face !== undefined && t.attach) { const fc = sv(s, 'face'); if (fc === 0) return FULLT[below] === 1; if (fc === 2) return FULLT[getS(x, y + 1, z)] === 1; const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1; }
      if (t.attach === 4) return FULLT[getS(x, y + 1, z)] || (t.id === 'pale_hanging_moss' && (isT(getS(x, y + 1, z), 'pale_hanging_moss') || LEAF[getS(x, y + 1, z)]));
      if (t.attach === 2 && t.pk.facing !== undefined) { const f = sv(s, 'facing'); const d = f < 4 ? [-F4D[f][0], 0, -F4D[f][1]] : f === 4 ? [0, -1, 0] : [0, 1, 0]; return FULLT[getS(x + d[0], y + d[1], z + d[2])] === 1; }
      if (t.id === 'sugar_cane') return isT(below, 'sugar_cane') || ((DIRTLIKE.has(bt.id) || bt.id.includes('sand')) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => FLU[getS(x + a, y - 1, z + c)] === 1));
      if (t.id === 'cactus') { if (!(isT(below, 'cactus') || bt.id === 'sand' || bt.id === 'red_sand')) return false; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (SOL[getS(x + a, y, z + c)]) return false; return true; }
      if (t.id === 'bamboo') return isT(below, 'bamboo') || DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id === 'gravel';
      if (t.id === 'kelp' || t.id === 'kelp_plant') return isT(below, 'kelp_plant') || SOL[below] === 1;
      if (t.id === 'lily_pad') return FLU[below] === 1 || isT(below, 'ice');
      if (t.id === 'scaffolding') return true;
      if (t.crop === 'farm' || t.crop === 'stem' || t.id.startsWith('attached_')) return isT(below, t.soil || 'farmland');
      if (t.plant || t.attach === 3 || t.rail || t.id.includes('carpet') || t.id === 'snow' || t.id.includes('pressure_plate') || t.sign) {
        if (t.sign && !t.id.includes('wall') && !t.id.includes('hanging')) return SOL[below];
        if (t.sign && t.id.includes('hanging')) return SOL[getS(x, y + 1, z)];
        if (t.id === 'snow') return SOL[below] === 1 && !isT(below, 'ice') || LEAF[below];
        if (t.water) return SOL[below] === 1 || t.id === 'tall_seagrass';
        if (t.attach === 3 || t.rail || t.id.includes('carpet') || t.id.includes('pressure_plate')) return SOL[below] && !(FLU[below]) || supportOK(x, y - 1, z, 2);
        if (t.id === 'dead_bush' || t.id.includes('dry_grass')) return DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id.includes('terracotta');
        if (t.id.includes('mushroom') || t.id === 'cobweb' || t.id.includes('coral') || t.id === 'pointed_dripstone' || t.id === 'sea_pickle') return true;
        if (t.id.includes('fungus') || t.id.includes('roots') || t.id === 'nether_sprouts') return bt.id.includes('nylium') || DIRTLIKE.has(bt.id) || bt.id === 'soul_soil';
        if (t.id === 'nether_wart') return isT(below, 'soul_sand');
        if (t.id === 'leaf_litter') return SOL[below] === 1;
        return DIRTLIKE.has(bt.id);
      }
      return true;
    }
    function hasFlammableNb(x, y, z) { for (const D of DIR6) { const b = getS(x + D[0], y + D[1], z + D[2]); if (TT[STT[b]].flam) return true; } return false; }
    function popBlock(x, y, z, noDrop) {
      const s = getS(x, y, z), t = TT[STT[s]];
      if (!s) return;
      if (!noDrop && !t.fire) dropBlock(s, x, y, z, { tool: null });
      if (t.water) setBlock(x, y, z, WSTATE(0)); else setBlock(x, y, z, 0);
    }
    function lavaContact(x, y, z, s) {
      for (const D of DIR6) {
        if (D[1] === -1) continue;
        const b = getS(x + D[0], y + D[1], z + D[2]);
        if (FLU[b] === 1) { setBlock(x, y, z, S(flv(s) === 0 ? 'obsidian' : 'cobblestone')); snd('fizz', { x, y, z }); for (let i = 0; i < 6; i++) particle(x + RNG(), y + 1, z + RNG(), 0, .8, 0, [200, 200, 200], .8, .1, -.5, 1); return true; }
      }
      return false;
    }
    function fluidTick(x, y, z) {
      const s = getS(x, y, z), fk = FLU[s];
      if (!fk) return;
      const lv = flv(s), drop = fk === 1 ? 1 : W.dim === 'nether' ? 1 : 2, maxD = fk === 1 ? 7 : W.dim === 'nether' ? 7 : 6, rate = fk === 1 ? 5 : W.dim === 'nether' ? 10 : 30;
      if (fk === 2 && lavaContact(x, y, z, s)) return;
      let cur = lv;
      if (lv !== 0) {
        const up = getS(x, y + 1, z);
        let nl;
        if (FLU[up] === fk) nl = 8;
        else {
          let mn = 99, src = 0;
          for (let q = 0; q < 4; q++) { const d = F4D[q], b = getS(x + d[0], y, z + d[1]); if (FLU[b] !== fk) continue; const l = flv(b); if (l === 0) src++; const e = l >= 8 ? 0 : l; if (e < mn) mn = e; }
          nl = mn === 99 ? 99 : mn + drop;
          if (fk === 1 && src >= 2 && W.rules.waterSourceConversion !== false) { const bl = getS(x, y - 1, z); if (SOL[bl] === 1 || (FLU[bl] === 1 && flv(bl) === 0)) nl = 0; }
        }
        if (nl > maxD && nl !== 8) { setBlock(x, y, z, 0); return; }
        if (nl !== lv) { setBlock(x, y, z, fState(fk, nl)); cur = nl; }
      }
      const by = y - 1, bs = getS(x, by, z);
      const canInto = b => b >= 0 && (b === 0 || (REP[b] && !FLU[b]) || (FLU[b] === fk && flv(b) !== 0) || (!SOL[b] && !FLU[b] && TT[STT[b]].plant && !TT[STT[b]].water) || FLU[b] && FLU[b] !== fk);
      if (by >= 0 && canInto(bs) && !(FLU[bs] === fk && flv(bs) >= 8)) {
        if (FLU[bs] && FLU[bs] !== fk) { if (fk === 1) { setBlock(x, by, z, S(flv(bs) === 0 ? 'obsidian' : 'cobblestone')); } else setBlock(x, by, z, S('stone')); snd('fizz', { x, y: by, z }); return; }
        if (bs && !FLU[bs]) popBlock(x, by, z, fk === 2);
        setBlock(x, by, z, fState(fk, 8));
        if (cur !== 0) return;
      }
      if (by >= 0 && FLU[bs] === fk && flv(bs) >= 8 && cur !== 0) return;
      const nl = cur >= 8 ? drop : cur + drop;
      if (nl > maxD) return;
      if (by >= 0 && canInto(bs) && cur !== 0) return;
      const dirs = flowDirs(x, y, z, fk);
      for (const q of dirs) {
        const d = F4D[q], nx = x + d[0], nz2 = z + d[1], b = getS(nx, y, nz2);
        if (b < 0) continue;
        if (FLU[b] === fk) { if (flv(b) !== 0 && (flv(b) >= 8 ? false : flv(b) > nl)) setBlock(nx, y, nz2, fState(fk, nl)); continue; }
        if (FLU[b] && FLU[b] !== fk) { if (fk === 2) setBlock(nx, y, nz2, S(nl === 0 ? 'obsidian' : 'cobblestone')); else setBlock(nx, y, nz2, S(flv(b) === 0 ? 'obsidian' : 'cobblestone')); snd('fizz', { x: nx, y, z: nz2 }); continue; }
        if (!canInto(b)) continue;
        if (b) popBlock(nx, y, nz2, fk === 2);
        setBlock(nx, y, nz2, fState(fk, nl));
      }
      void rate;
    }
    function flowDirs(x, y, z, fk) {
      const best = [], lim = fk === 1 ? 4 : 2;
      let bd = 99;
      const passable = b => b >= 0 && (b === 0 || REP[b] || (!SOL[b] && TT[STT[b]].plant)) && !(FLU[b] === fk && flv(b) === 0);
      for (let q = 0; q < 4; q++) {
        const d = F4D[q], nx = x + d[0], nz2 = z + d[1], b = getS(nx, y, nz2);
        if (!passable(b) && !(FLU[b] === fk)) continue;
        if (FLU[b] === fk && flv(b) === 0) continue;
        let dist = 99;
        const st = [[nx, nz2, 1, q]], seen = new Set([nx + ',' + nz2]);
        while (st.length) {
          const [cx, cz, n, from] = st.shift();
          const bl = getS(cx, y - 1, cz);
          if (bl >= 0 && (bl === 0 || REP[bl] || (FLU[bl] === fk && flv(bl) !== 0))) { dist = n; break; }
          if (n >= lim) continue;
          for (let q2 = 0; q2 < 4; q2++) { if (q2 === ((from + 2) & 3)) continue; const e = F4D[q2], ex = cx + e[0], ez = cz + e[1], k = ex + ',' + ez; if (seen.has(k)) continue; seen.add(k); const bb = getS(ex, y, ez); if (passable(bb) || FLU[bb] === fk && flv(bb) !== 0) st.push([ex, ez, n + 1, q2]); }
        }
        if (dist < bd) { bd = dist; best.length = 0; best.push(q); } else if (dist === bd) best.push(q);
      }
      return best;
    }
    function tickSched() {
      simT++;
      const a = SCHED.get(simT);
      if (!a) return;
      SCHED.delete(simT);
      let n = 0;
      for (const [x, y, z, kind, k] of a) {
        SCHK.delete(k);
        if (++n > 4000) { schedule(x, y, z, 1, kind); continue; }
        const s = getS(x, y, z);
        if (s < 0) continue;
        const t = TT[STT[s]];
        if (kind === 'fluid') fluidTick(x, y, z);
        else if (kind === 'fall') { if (t.grav) { const b = getS(x, y - 1, z); if (y > 0 && b >= 0 && (b === 0 || FLU[b] || REP[b] || TT[STT[b]].fire)) { setBlock(x, y, z, 0); spawnFalling(s, x, y, z); } } }
        else if (kind === 'support') { if (needsSupport(t) && !supported(x, y, z, s, t)) { if (t.door || t.tall || t.bed) { const keepDrop = t.door ? !sv(s, 'half') : t.tall ? !sv(s, 'half') : !sv(s, 'part'); popBlock(x, y, z, !keepDrop); } else popBlock(x, y, z, t.fire); } }
        else if (kind === 'leaf') { if (LEAF[s] && !sv(s, 'persistent') && !logNear(x, y, z)) { dropBlock(s, x, y, z, {}); setBlock(x, y, z, 0); for (let i = 0; i < 3; i++) particle(x + RNG(), y + RNG(), z + RNG(), 0, -.5, 0, tileAvg(TIL[s * 6]), 1, .06, 2); } }
        else if (kind === 'button') { if (t.use === 'button' && sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', 0)); snd('click', { x, y, z }); redstoneAround(x, y, z); } }
        else if (kind === 'plate') { if (t.plate && sv(s, 'power') && !entOnPlate(x, y, z)) { setBlock(x, y, z, sw(s, 'power', 0)); snd('click', { x, y, z }); redstoneAround(x, y, z); } else if (t.plate && sv(s, 'power')) schedule(x, y, z, 10, 'plate'); }
        else if (kind === 'red') redstoneUpdate(x, y, z, s, t);
        else if (kind === 'rep') repeaterOut(x, y, z, s, t);
        else if (kind === 'compost') { if (t.id === 'composter' && sv(s, 'level') === 7) setBlock(x, y, z, sw(s, 'level', 8)); }
        else if (kind === 'obs') { if (t.id === 'observer' && sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', 0)); redstoneAround(x, y, z); } }
      }
    }
    function logNear(x, y, z) {
      const seen = new Set([x + ',' + y + ',' + z]), q = [[x, y, z, 0]];
      while (q.length) {
        const [cx, cy, cz, d] = q.shift();
        for (const D of DIR6) {
          const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2], k = nx + ',' + ny + ',' + nz2;
          if (seen.has(k)) continue; seen.add(k);
          const b = getS(nx, ny, nz2);
          if (b < 0) return true;
          if (TT[STT[b]].tags.has('log')) return true;
          if (LEAF[b] && d < 5) q.push([nx, ny, nz2, d + 1]);
        }
      }
      return false;
    }
    function entOnPlate(x, y, z) { for (const e of ENTS.concat(playersList())) { if ((e.kind === 'mob' || e.kind === 'item' || e === P || e.kind === 'player') && Math.floor(e.y + .05) === y && e.x + e.w / 2 > x + .06 && e.x - e.w / 2 < x + .94 && e.z + e.w / 2 > z + .06 && e.z - e.w / 2 < z + .94) return true; } return false; }
    function checkPlates() {
      for (const pl of [P].concat(ENTS.filter(e => e.kind === 'mob' || e.kind === 'item' || e.kind === 'player'))) {
        const x = Math.floor(pl.x), y = Math.floor(pl.y + .05), z = Math.floor(pl.z), s = getS(x, y, z), t = TT[STT[s]];
        if (t.plate && !sv(s, 'power')) { if (t.plateKind === 'mob' && pl.kind === 'item') continue; setBlock(x, y, z, sw(s, 'power', t.props[0][1].length > 2 ? 15 : 1)); snd('click', { x, y, z }); redstoneAround(x, y, z); schedule(x, y, z, 20, 'plate'); }
        if (t.id === 'tripwire_hook') { }
      }
    }
    function srcPower(x, y, z, toX, toY, toZ) {
      const s = getS(x, y, z); if (s <= 0) return 0;
      const t = TT[STT[s]];
      if (t.id === 'redstone_block') return 15;
      if (t.use === 'lever' || t.use === 'button') return sv(s, 'powered') ? 15 : 0;
      if (t.plate) return sv(s, 'power') ? (t.props[0][1].length > 2 ? sv(s, 'power') : 15) : 0;
      if (t.rtorch) { if (!sv(s, 'lit')) return 0; if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; if (toX === x - d[0] && toZ === z - d[1] && toY === y) return 0; } else if (toY === y - 1 && toX === x && toZ === z) return 0; return 15; }
      if (t.daylight) return sv(s, 'power');
      if (t.id === 'observer') { if (!sv(s, 'powered')) return 0; const f = sv(s, 'facing'), d = f < 4 ? [-F4D[f][0], 0, -F4D[f][1]] : f === 4 ? [0, -1, 0] : [0, 1, 0]; return toX === x + d[0] && toY === y + d[1] && toZ === z + d[2] ? 15 : 0; }
      if (t.rep) { if (!sv(s, 'powered')) return 0; const d = F4D[fq(s)]; return toX === x - d[0] && toZ === z - d[1] && toY === y ? 15 : 0; }
      if (t.id === 'tripwire_hook') return sv(s, 'powered') ? 15 : 0;
      if (t.id === 'target') return 0;
      return 0;
    }
    function strongPowered(x, y, z) {
      const s = getS(x, y, z); if (SOL[s] !== 1 || !OPQ[s]) return 0;
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if (nt.use === 'lever' || nt.use === 'button') { if (!sv(n, 'powered')) continue; const fc = sv(n, 'face'); const att = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : [-F4D[fq(n)][0], 0, -F4D[fq(n)][1]]; if (nx + att[0] === x && ny + att[1] === y && nz2 + att[2] === z) p = 15; }
        else if (nt.rtorch && D[1] === -1 && sv(n, 'lit')) p = 15;
        else if (nt.rep && sv(n, 'powered')) { const d = F4D[fq(n)]; if (nx - d[0] === x && nz2 - d[1] === z && ny === y) p = 15; }
        else if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power'));
        else if (nt.wire && D[1] === 0) { const w = sv(n, 'power'); if (w) { const m = nt.cmask(n, nbFn(nx, ny, nz2)); const q = [5, 1, -1, -1, 4, 0]; void q; const conn = m & 15, cnt = (conn & 1) + (conn >> 1 & 1) + (conn >> 2 & 1) + (conn >> 3 & 1); const dirTo = [3, 1, -1, -1, 0, 2][d6Index(-D[0], 0, -D[2])]; if (cnt === 0 || (conn & (1 << dirTo)) || (cnt === 1 && (conn & (1 << ((dirTo + 2) & 3))))) p = Math.max(p, w); } }
        else if (nt.plate && D[1] === 1) p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
      }
      return p;
    }
    const d6Index = (dx, dy, dz) => dx === 1 ? 0 : dx === -1 ? 1 : dy === 1 ? 2 : dy === -1 ? 3 : dz === 1 ? 4 : 5;
    function powerInto(x, y, z) {
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2];
        p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
        const n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if (nt.wire && D[1] !== 1) p = Math.max(p, sv(n, 'power'));
        if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power'));
        if (FULLT[n]) p = Math.max(p, strongPowered(nx, ny, nz2));
        if (p >= 15) return 15;
      }
      return p;
    }
    function redstoneAround(x, y, z) {
      if (!isHost()) return;
      const seen = new Set();
      for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 3) continue;
        const nx = x + dx, ny = y + dy, nz2 = z + dz, s = getS(nx, ny, nz2), t = TT[STT[s]];
        if (s <= 0) continue;
        if (t.wire) { const k = nx + ',' + ny + ',' + nz2; if (!seen.has(k)) wireNet(nx, ny, nz2, seen); }
        else if (t.rtorch || t.rep || t.lamp || t.door || t.id.includes('trapdoor') || t.gate || t.tnt || t.bulb || t.id === 'note_block' || t.piston || t.rail) schedule(nx, ny, nz2, t.rtorch ? 2 : 1, 'red');
      }
    }
    function wireNet(x, y, z, seen) {
      const net = [], q = [[x, y, z]], key = (a, b, c) => a + ',' + b + ',' + c;
      seen.add(key(x, y, z));
      while (q.length && net.length < 2000) {
        const [cx, cy, cz] = q.shift(); net.push([cx, cy, cz]);
        for (let qd = 0; qd < 4; qd++) { const d = F4D[qd]; for (const dy of [0, 1, -1]) { const nx = cx + d[0], ny = cy + dy, nz2 = cz + d[1]; const n = getS(nx, ny, nz2); if (!TT[STT[n]].wire) continue; if (dy === 1 && FULLT[getS(cx, cy + 1, cz)]) continue; if (dy === -1 && FULLT[getS(nx, cy, nz2)]) continue; const k = key(nx, ny, nz2); if (seen.has(k)) continue; seen.add(k); q.push([nx, ny, nz2]); } }
      }
      const P2 = new Map();
      for (const [cx, cy, cz] of net) {
        let p = 0;
        for (const D of DIR6) { const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2], n = getS(nx, ny, nz2); if (TT[STT[n]].wire) continue; p = Math.max(p, srcPower(nx, ny, nz2, cx, cy, cz)); if (FULLT[n] && D[1] !== 1) p = Math.max(p, strongSrcOnly(nx, ny, nz2)); if (FULLT[n] && D[1] === 1) p = Math.max(p, strongSrcOnly(nx, ny, nz2)); }
        P2.set(key(cx, cy, cz), p);
      }
      const order = net.slice().sort((a, b) => P2.get(key(...b)) - P2.get(key(...a)));
      const qq = order.filter(n => P2.get(key(...n)) > 1);
      while (qq.length) {
        const [cx, cy, cz] = qq.shift(), p = P2.get(key(cx, cy, cz));
        for (let qd = 0; qd < 4; qd++) { const d = F4D[qd]; for (const dy of [0, 1, -1]) { const k = key(cx + d[0], cy + dy, cz + d[1]); if (!P2.has(k)) continue; if (P2.get(k) < p - 1) { P2.set(k, p - 1); qq.push([cx + d[0], cy + dy, cz + d[1]]); } } }
      }
      for (const [cx, cy, cz] of net) {
        const s = getS(cx, cy, cz), np = P2.get(key(cx, cy, cz));
        if (sv(s, 'power') !== np) { setBlock(cx, cy, cz, sw(s, 'power', np), 2); for (const D of DIR6) { const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2]; const n = getS(nx, ny, nz2), nt = TT[STT[n]]; if (!nt.wire && (nt.redstone || nt.lamp || nt.door || nt.gate || nt.id.includes('trapdoor') || nt.tnt || nt.rail)) schedule(nx, ny, nz2, 1, 'red'); if (FULLT[n]) for (const E of DIR6) { const m = getS(nx + E[0], ny + E[1], nz2 + E[2]), mt = TT[STT[m]]; if (!mt.wire && (mt.redstone || mt.lamp || mt.door || mt.gate || mt.id.includes('trapdoor') || mt.tnt)) schedule(nx + E[0], ny + E[1], nz2 + E[2], mt.rtorch ? 2 : 1, 'red'); } } }
      }
    }
    function strongSrcOnly(x, y, z) {
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if ((nt.use === 'lever' || nt.use === 'button') && sv(n, 'powered')) { const fc = sv(n, 'face'); const att = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : [-F4D[fq(n)][0], 0, -F4D[fq(n)][1]]; if (nx + att[0] === x && ny + att[1] === y && nz2 + att[2] === z) p = 15; }
        else if (nt.rtorch && D[1] === -1 && sv(n, 'lit')) p = 15;
        else if (nt.rep && sv(n, 'powered')) { const d = F4D[fq(n)]; if (nx - d[0] === x && nz2 - d[1] === z && ny === y) p = 15; }
        else if (nt.plate && D[1] === 1) p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
      }
      return p;
    }
    function redstoneUpdate(x, y, z, s, t) {
      if (t.wire) { wireNet(x, y, z, new Set()); return; }
      if (t.rtorch) {
        let ax = x, ay = y - 1, az = z;
        if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; ax = x - d[0]; ay = y; az = z - d[1]; }
        const pw = FULLT[getS(ax, ay, az)] ? Math.max(strongPowered(ax, ay, az), powerIntoBlock(ax, ay, az)) : 0;
        const lit = pw > 0 ? 0 : 1;
        if (sv(s, 'lit') !== lit) { setBlock(x, y, z, sw(s, 'lit', lit)); redstoneAround(x, y, z); }
        return;
      }
      if (t.rep) { const d = F4D[fq(s)], bx = x + d[0], bz = z + d[1]; const inP = Math.max(srcPower(bx, y, bz, x, y, z), TT[STT[getS(bx, y, bz)]].wire ? sv(getS(bx, y, bz), 'power') : 0, FULLT[getS(bx, y, bz)] ? strongPowered(bx, y, bz) : 0) > 0 ? 1 : 0; if (inP !== sv(s, 'powered')) schedule(x, y, z, (sv(s, 'delay') + 1) * 2, 'rep'); return; }
      const p = powerInto(x, y, z) > 0 ? 1 : 0;
      if (t.lamp) { if (sv(s, 'lit') !== p) setBlock(x, y, z, sw(s, 'lit', p)); return; }
      if (t.tnt && p) { setBlock(x, y, z, 0); spawnTNT(x, y, z); return; }
      if ((t.door || t.id.includes('trapdoor') || t.gate) && t.pk.powered !== undefined) {
        let pp = p;
        if (t.door) { const oy = sv(s, 'half') ? -1 : 1; pp = Math.max(p, powerInto(x, y + oy, z) > 0 ? 1 : 0); }
        if (sv(s, 'powered') !== pp) { let ns = sw(sw(s, 'powered', pp), 'open', pp); setBlock(x, y, z, ns); if (t.door) { const oy = sv(s, 'half') ? -1 : 1, o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, sw(sw(o, 'powered', pp), 'open', pp)); } snd(pp ? 'door_open' : 'door_close', { x, y, z }); }
        return;
      }
      if (t.bulb) { if (p !== sv(s, 'powered')) { let ns = sw(s, 'powered', p); if (p) ns = sw(ns, 'lit', sv(s, 'lit') ? 0 : 1); setBlock(x, y, z, ns); } return; }
      if (t.id === 'note_block') { if (p !== sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', p)); if (p) noteSnd(sv(s, 'note'), getS(x, y - 1, z), { x, y, z }); } return; }
      if (t.rail && t.pk.powered !== undefined && t.id !== 'detector_rail') { if (sv(s, 'powered') !== p) setBlock(x, y, z, sw(s, 'powered', p)); return; }
      if (t.piston) pistonUpdate(x, y, z, s, t, p);
    }
    function powerIntoBlock(x, y, z) { let p = 0; for (const D of DIR6) { const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]]; if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power')); else if (nt.wire && D[1] === 0 && sv(n, 'power')) { const m = nt.cmask(n, nbFn(nx, ny, nz2)) & 15; const dirTo = [3, 1, -1, -1, 0, 2][d6Index(-D[0], 0, -D[2])]; const cnt = (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1); if (cnt === 0 || (m & (1 << dirTo)) || (cnt === 1 && (m & (1 << ((dirTo + 2) & 3))))) p = Math.max(p, sv(n, 'power')); } } return p; }
    function repeaterOut(x, y, z, s, t) {
      if (!t.rep) return;
      const d = F4D[fq(s)], bx = x + d[0], bz = z + d[1];
      const inP = Math.max(srcPower(bx, y, bz, x, y, z), TT[STT[getS(bx, y, bz)]].wire ? sv(getS(bx, y, bz), 'power') : 0, FULLT[getS(bx, y, bz)] ? strongPowered(bx, y, bz) : 0) > 0 ? 1 : 0;
      if (inP !== sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', inP)); redstoneAround(x - d[0], y, z - d[1]); redstoneAround(x, y, z); }
    }
    function pistonUpdate(x, y, z, s, t, p) {
      const f = sv(s, 'facing'), ext = sv(s, 'extended'), D = f < 4 ? [F4D[f][0], 0, F4D[f][1]] : f === 4 ? [0, 1, 0] : [0, -1, 0];
      if (p && !ext) {
        const line = []; let cx = x + D[0], cy = y + D[1], cz = z + D[2];
        for (let k = 0; k < 13; k++) { const b = getS(cx, cy, cz); if (b === 0 || REP[b] || FLU[b]) break; const bt = TT[STT[b]]; if (bt.hard < 0 || bt.id === 'obsidian' || bt.id.includes('obsidian') || bt.cont || bt.use === 'furnace') return; if (k === 12) return; line.push([cx, cy, cz, b]); cx += D[0]; cy += D[1]; cz += D[2]; }
        const end = getS(cx, cy, cz); if (end && !REP[end] && !FLU[end]) return; if (end && REP[end] && !FLU[end]) popBlock(cx, cy, cz);
        for (let i = line.length - 1; i >= 0; i--) { const [bx, by, bz, b] = line[i]; const bt = TT[STT[b]]; if (bt.plant || bt.torch) { popBlock(bx, by, bz); continue; } setBlock(bx + D[0], by + D[1], bz + D[2], b); }
        setBlock(x + D[0], y + D[1], z + D[2], 0);
        setBlock(x, y, z, sw(s, 'extended', 1)); snd('piston_out', { x, y, z });
      } else if (!p && ext) {
        setBlock(x, y, z, sw(s, 'extended', 0)); snd('piston_in', { x, y, z });
        if (t.piston === 2) { const fx = x + D[0] * 2, fy = y + D[1] * 2, fz = z + D[2] * 2, b = getS(fx, fy, fz), bt = TT[STT[b]]; if (b && !FLU[b] && bt.hard >= 0 && SOL[b] === 1 && !bt.cont) { setBlock(x + D[0], y + D[1], z + D[2], b); setBlock(fx, fy, fz, 0); } }
      }
    }
    const BE = () => W.be;
    const bk = (x, y, z) => x + ',' + y + ',' + z;
    function beAt(x, y, z, create) { const k = bk(x, y, z); let b = W.be.get(k); if (!b && create) { b = {}; W.be.set(k, b); } return b; }
    function initBlockEntity(x, y, z, t, it) {
      const k = bk(x, y, z);
      if (t.cont) W.be.set(k, { items: it && it.x && it.x.items ? it.x.items.map(d => d && { ...d }) : new Array(t.cont).fill(null) });
      if (t.use === 'furnace') W.be.set(k, { i: null, f: null, o: null, b: 0, bm: 0, c: 0, xp: 0, kind: t.fkind });
      if (t.sign) W.be.set(k, { text: ['', '', '', ''] });
    }
    function removeBlockEntity(x, y, z, drop) {
      const k = bk(x, y, z), b = W.be.get(k);
      if (!b) return;
      const s = getS(x, y, z), t = TT[STT[s]];
      W.be.delete(k);
      if (!drop) return;
      if (t.shulker) { spawnItem({ id: IN[t.id].idx, n: 1, x: { items: b.items } }, x + .5, y + .5, z + .5); return; }
      if (b.items) for (const st of b.items) if (st) spawnItem(st, x + .5, y + .5, z + .5);
      for (const k2 of ['i', 'f', 'o']) if (b[k2]) spawnItem(b[k2], x + .5, y + .5, z + .5);
      if (b.disc) { spawnItem(b.disc, x + .5, y + 1, z + .5); stopDisc(); }
      if (b.xp >= 1) spawnXp(Math.floor(b.xp), x + .5, y + .5, z + .5);
    }
    function tickFurnaces() {
      W.be.forEach((F, k) => {
        if (F.kind === undefined) return;
        const fast = F.kind !== 'furnace', ct = fast ? 100 : 200;
        const was = F.b > 0;
        if (F.b > 0) F.b--;
        const r = F.i && SMELT[F.i.id];
        const okKind = r && (F.kind === 'furnace' || (F.kind === 'blast_furnace' && SM_BLAST.has(F.i.id)) || (F.kind === 'smoker' && SM_SMOKE.has(F.i.id)));
        const can = okKind && (!F.o || (F.o.id === r[0] && F.o.n < IT[r[0]].stack));
        if (F.b === 0 && can && F.f && fuelOf(F.f.id)) { F.bm = F.b = fast ? fuelOf(F.f.id) / 2 : fuelOf(F.f.id); if (IT[F.f.id].id === 'lava_bucket') F.f = { id: IN.bucket.idx, n: 1 }; else if (--F.f.n <= 0) F.f = null; }
        if (F.b > 0 && can) { if (++F.c >= ct) { F.c = 0; if (--F.i.n <= 0) F.i = null; if (F.o) F.o.n++; else F.o = { id: r[0], n: 1, d: 0 }; F.xp += r[1]; } }
        else F.c = Math.max(0, F.c - 2);
        F.ct = ct;
        if (was !== F.b > 0) { const [x, y, z] = k.split(',').map(Number), s = getS(x, y, z); if (TT[STT[s]].use === 'furnace') setBlock(x, y, z, sw(s, 'lit', F.b > 0 ? 1 : 0)); }
      });
    }
    function randomTicks() {
      const rs = W.rules.randomTickSpeed ?? 3;
      if (!rs) return;
      const cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4, R2 = Math.min(SET.rd, 6);
      const centers = [[cx0, cz0]];
      for (const e of ENTS) if (e.kind === 'player') centers.push([Math.floor(e.x) >> 4, Math.floor(e.z) >> 4]);
      const done = new Set();
      for (const [ccx, ccz] of centers) for (let dz = -R2; dz <= R2; dz++) for (let dx = -R2; dx <= R2; dx++) {
        const c = colAt(ccx + dx, ccz + dz); if (!c || c.st < 2) continue;
        const k = ck(c.cx, c.cz); if (done.has(k)) continue; done.add(k);
        for (let sy = 0; sy <= c.top; sy++) {
          const sec = c.s[sy]; if (!sec) continue;
          for (let i = 0; i < rs; i++) {
            const li = ri(4096), s = sec[li]; if (!s) continue;
            const t = TT[STT[s]];
            if (!t.tick && !t.crop && !t.sapling && !LEAF[s] && t.id !== 'grass_block' && t.id !== 'mycelium' && t.id !== 'farmland' && !t.fire && t.id !== 'ice' && t.id !== 'snow' && t.ox === undefined && t.id !== 'dirt' && !FLU[s]) continue;
            randomTick(c.cx * 16 + (li & 15), sy * 16 + (li >> 8), c.cz * 16 + (li >> 4 & 15), s, t);
          }
        }
      }
    }
    function randomTick(x, y, z, s, t) {
      const L = getL(x, y + 1, z), sky = (L >> 4) * U.sky.value, light = Math.max(sky, L & 15);
      if (t.id === 'grass_block' || t.id === 'mycelium') {
        const up = getS(x, y + 1, z);
        if ((LAT[up] >= 15 || FLU[up]) && !isT(up, 'snow')) { setBlock(x, y, z, S('dirt')); return; }
        if (light >= 9) for (let k = 0; k < 4; k++) { const nx = x + ri(3) - 1, ny = y + ri(5) - 3, nz2 = z + ri(3) - 1; if (isT(getS(nx, ny, nz2), 'dirt') && LAT[getS(nx, ny + 1, nz2)] < 15 && !FLU[getS(nx, ny + 1, nz2)] && Math.max(getL(nx, ny + 1, nz2) >> 4, getL(nx, ny + 1, nz2) & 15) >= 4) setBlock(nx, ny, nz2, S(t.id)); }
        return;
      }
      if (t.id === 'farmland') {
        let wet = false;
        for (let dz = -4; dz <= 4 && !wet; dz++) for (let dx = -4; dx <= 4 && !wet; dx++) for (let dy = 0; dy <= 1; dy++) if (FLU[getS(x + dx, y + dy, z + dz)] === 1) { wet = true; break; }
        if (W.raining && (getL(x, y + 1, z) >> 4) === 15) wet = true;
        const m = sv(s, 'moisture');
        if (wet) { if (m < 7) setBlock(x, y, z, sw(s, 'moisture', 7)); }
        else if (m > 0) setBlock(x, y, z, sw(s, 'moisture', m - 1));
        else if (!TT[STT[getS(x, y + 1, z)]].crop) setBlock(x, y, z, S('dirt'));
        return;
      }
      if (t.crop === 'farm' || t.id === 'torchflower_crop') {
        if (light < 9 && t.id !== 'nether_wart') return;
        const a = sv(s, 'age'); if (a >= t.maxAge) return;
        const soil = getS(x, y - 1, z), moist = isT(soil, 'farmland') && sv(soil, 'moisture') > 0;
        const f = moist ? 3 : 1, ch = t.id === 'nether_wart' ? .1 : 1 / (Math.floor(25 / f) + 1);
        if (RNG() < ch) setBlock(x, y, z, sw(s, 'age', a + 1));
        return;
      }
      if (t.crop === 'stem') {
        if (light < 9) return;
        const a = sv(s, 'age');
        if (RNG() > .3) return;
        if (a < 7) { setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
        const q = ri(4), d = F4D[q], fx = x + d[0], fz = z + d[1];
        for (let k = 0; k < 4; k++) { const e = F4D[k]; if (isT(getS(x + e[0], y, z + e[1]), t.fruit)) return; }
        const below = getS(fx, y - 1, fz);
        if (!getS(fx, y, fz) && (DIRTLIKE.has(TT[STT[below]].id) || isT(below, 'farmland'))) { setBlock(fx, y, fz, S(t.fruit)); setBlock(x, y, z, S('attached_' + t.fruit + '_stem', { facing: FACE4[q] })); }
        return;
      }
      if (t.crop === 'berry') { const a = sv(s, 'age'); if (a < 3 && light >= 9 && RNG() < .2) setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
      if (t.id === 'cocoa') { const a = sv(s, 'age'); if (a < 2 && RNG() < .2) setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
      if (t.sapling) { if (light >= 9 && RNG() < 1 / 7) { if (sv(s, 'stage') === 0 && t.pk.stage !== undefined) setBlock(x, y, z, sw(s, 'stage', 1)); else growTree(x, y, z, t.sapling); } return; }
      if (t.crop === 'cane' || t.crop === 'cactus') {
        if (getS(x, y + 1, z)) return;
        let h = 1; while (TT[STT[getS(x, y - h, z)]] === t) h++;
        if (h >= 3) return;
        const a = sv(s, 'age');
        if (a >= 15) { setBlock(x, y + 1, z, t.base); setBlock(x, y, z, sw(s, 'age', 0)); if (t.crop === 'cactus' && !supported(x, y + 1, z, t.base, t)) popBlock(x, y + 1, z); }
        else setBlock(x, y, z, sw(s, 'age', a + 1));
        return;
      }
      if (t.id === 'kelp') { const a = sv(s, 'age'); if (a < 25 && FLU[getS(x, y + 1, z)] === 1 && flv(getS(x, y + 1, z)) === 0 && RNG() < .14) { setBlock(x, y, z, S('kelp_plant')); setBlock(x, y + 1, z, S('kelp', { age: a + 1 })); } return; }
      if (t.id === 'bamboo') { let h = 1; while (isT(getS(x, y - h, z), 'bamboo')) h++; if (h < 12 && !getS(x, y + 1, z) && light >= 9 && RNG() < .3) { setBlock(x, y + 1, z, S('bamboo', { leaves: 'large' })); if (h > 1) setBlock(x, y, z, S('bamboo', { leaves: 'small' })); } return; }
      if (LEAF[s]) { if (!sv(s, 'persistent') && RNG() < .05 && !logNear(x, y, z)) schedule(x, y, z, 1 + ri(20), 'leaf'); return; }
      if (t.fire) { fireTick(x, y, z, s); return; }
      if (t.id === 'ice') { if ((L & 15) > 11) setBlock(x, y, z, W.dim === 'nether' ? 0 : WSTATE(0)); return; }
      if (t.id === 'snow') { if ((L & 15) > 11) popBlock(x, y, z); return; }
      if (t.tick === 'bud') { if (RNG() < .2) { const f = ri(6), D = DIR6[[5, 0, 4, 1, 2, 3][f]], nx = x + D[0], ny = y + D[1], nz2 = z + D[2], b = getS(nx, ny, nz2), seq = ['small_amethyst_bud', 'medium_amethyst_bud', 'large_amethyst_bud', 'amethyst_cluster'], fn = ['north', 'east', 'south', 'west', 'up', 'down'][f]; if (!b || FLU[b] === 1) setBlock(nx, ny, nz2, S(seq[0], { facing: fn })); else { const i = seq.indexOf(TT[STT[b]].id); if (i >= 0 && i < 3) setBlock(nx, ny, nz2, S(seq[i + 1], { facing: svn(b, 'facing') })); } } return; }
      if (t.ox !== undefined && t.ox >= 0 && t.ox < 3 && RNG() < .0006) { const nm = t.id, pre = ['', 'exposed_', 'weathered_', 'oxidized_']; let base = nm; for (const p of pre.slice(1)) if (nm.startsWith(p)) base = nm.slice(p.length); if (base === 'copper_block') base = 'copper'; const nn = pre[t.ox + 1] + (base === 'copper' ? 'copper' : base); if (TN[nn]) setBlock(x, y, z, sameProps(s, TN[nn])); return; }
      if (W.raining && t.id !== 'snow') { }
    }
    function fireTick(x, y, z, s) {
      if (W.rules.doFireTick === false) return;
      const below = getS(x, y - 1, z), inf = isT(below, 'netherrack') || isT(below, 'magma_block') || isT(below, 'soul_sand');
      if (W.raining && (getL(x, y, z) >> 4) === 15 && RNG() < .5 && !inf) { setBlock(x, y, z, 0); return; }
      const age = sv(s, 'age');
      if (age < 15) setBlock(x, y, z, sw(s, 'age', Math.min(15, age + ri(3) / 2 + 1 | 0)), 2);
      if (!inf && !hasFlammableNb(x, y, z) && (SOL[below] !== 1 || age > 3)) { setBlock(x, y, z, 0); return; }
      if (!inf && age === 15 && RNG() < .25 && !TT[STT[below]].flam) { setBlock(x, y, z, 0); return; }
      for (const D of DIR6) { const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], b = getS(nx, ny, nz2), bt = TT[STT[b]]; if (bt.flam && RNG() < .12) { if (bt.tnt) { setBlock(nx, ny, nz2, 0); spawnTNT(nx, ny, nz2); } else setBlock(nx, ny, nz2, RNG() < .4 ? S('fire') : 0); } }
      for (let k = 0; k < 2; k++) { const nx = x + ri(3) - 1, ny = y + ri(4) - 1, nz2 = z + ri(3) - 1; if (!getS(nx, ny, nz2) && hasFlammableNb(nx, ny, nz2) && RNG() < .3) setBlock(nx, ny, nz2, S('fire')); }
    }
    function growTree(x, y, z, kind) {
      const k = kind === 'azalea' ? 'oak' : kind === 'crimson' || kind === 'warped' ? null : kind;
      if (!k) { setBlock(x, y, z, 0); const st = kind + '_stem', wb = kind === 'crimson' ? 'nether_wart_block' : 'warped_wart_block'; const h = 4 + ri(6); for (let i = 0; i < h; i++) setBlock(x, y + i, z, S(st)); for (let dy = h - 3; dy <= h; dy++) { const r = dy === h ? 1 : 2; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (!getS(x + dx, y + dy, z + dz) && RNG() < .8) setBlock(x + dx, y + dy, z + dz, S(wb)); } return; }
      const big2 = (k === 'dark_oak' || k === 'pale_oak');
      if (big2) { let ok = false; for (const [ox, oz] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) { const tt = TN[k + '_sapling']; if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, c]) => TT[STT[getS(x + ox + a, y, z + oz + c)]] === tt)) { x += ox; z += oz; ok = true; break; } } if (!ok) return; for (const [a, c] of [[0, 0], [1, 0], [0, 1], [1, 1]]) setBlock(x + a, y, z + c, 0); }
      const LOG = S((k === 'mangrove' ? 'mangrove' : k) + '_log'), LEAVES = k === 'poplar' ? S(['red_poplar_leaves', 'orange_poplar_leaves', 'yellow_poplar_leaves'][ri(3)]) : S(k + '_leaves');
      const hgt = { oak: 4 + ri(3), birch: 5 + ri(3), spruce: 6 + ri(4), jungle: 4 + ri(8), acacia: 5 + ri(3), dark_oak: 6 + ri(3), cherry: 5 + ri(3), pale_oak: 6 + ri(3), mangrove: 5 + ri(3), poplar: 7 + ri(4) }[k] || 5;
      for (let i = 1; i <= hgt + 1; i++) { const b = getS(x, y + i, z); if (b && !REP[b] && !LEAF[b]) return; }
      if (!big2) setBlock(x, y, z, 0);
      const setL2 = (a, b, c) => { const cur = getS(a, b, c); if (!cur || REP[cur]) setBlock(a, b, c, LEAVES); };
      if (k === 'spruce') { for (let dy = 2; dy <= hgt + 1; dy++) { const r = dy > hgt ? 0 : ((hgt - dy) % 2 === 0 ? 1 : 2) - (dy < 3 ? 0 : 0); for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (!(r > 0 && Math.abs(dx) === r && Math.abs(dz) === r)) setL2(x + dx, y + dy, z + dz); } }
      else if (k === 'acacia') { const d = F4D[ri(4)]; let tx = x, tz = z; for (let i = 0; i < hgt; i++) { if (i >= hgt - 3) { tx += d[0]; tz += d[1]; } setBlock(tx, y + i, tz, LOG); } for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dz) <= 3) setL2(tx + dx, y + hgt, tz + dz); for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) setL2(tx + dx, y + hgt + 1, tz + dz); return; }
      else if (big2) { for (let dy = hgt - 2; dy <= hgt + 1; dy++) { const r = dy === hgt + 1 ? 2 : 3; for (let dz = -r; dz <= r + 1; dz++) for (let dx = -r; dx <= r + 1; dx++) if (dx * dx + dz * dz <= r * r + 2) setL2(x + dx, y + dy, z + dz); } for (let i = 0; i < hgt; i++) for (const [a, c] of [[0, 0], [1, 0], [0, 1], [1, 1]]) setBlock(x + a, y + i, z + c, LOG); return; }
      else if (k === 'cherry') { for (let dy = hgt - 2; dy <= hgt + 1; dy++) { const r = dy >= hgt ? 2 : 3; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r + 1 && RNG() < .9) setL2(x + dx, y + dy, z + dz); } }
      else if (k === 'poplar') { for (let dy = hgt - 6; dy <= hgt + 2; dy++) { const r = dy > hgt ? 1 : dy < hgt - 4 ? 2 : 3; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r && RNG() < .92) setL2(x + dx, y + dy, z + dz); } }
      else { for (let dy = hgt - 3; dy <= hgt; dy++) { const r = dy >= hgt - 1 ? 1 : 2; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { if (Math.abs(dx) === r && Math.abs(dz) === r && (dy === hgt || RNG() < .5)) continue; setL2(x + dx, y + dy, z + dz); } } }
      for (let i = 0; i < hgt; i++) setBlock(x, y + i, z, LOG);
      const dl = getS(x, y - 1, z); if (isT(dl, 'grass_block')) setBlock(x, y - 1, z, S('dirt'));
    }
    let AC = null, master = null, NBUF = null, musicBus = null, musicT = 600, discT = null;
    function ac() {
      if (AC) return AC;
      try {
        const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
        AC = new A(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
        NBUF = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = NBUF.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = RNG() * 2 - 1;
        musicBus = AC.createGain(); const dl = AC.createDelay(), fb = AC.createGain(); dl.delayTime.value = .34; fb.gain.value = .3;
        musicBus.connect(master); musicBus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);
      } catch (e) { AC = null; }
      return AC;
    }
    const env = (gn, t, a, d, v) => { gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + a); gn.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
    function nzS(dur, vol, type, f, q, dt, f2, out) {
      const t = AC.currentTime + (dt || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain();
      s.buffer = NBUF; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
      env(gn, t, .004, dur, vol); s.connect(fl); fl.connect(gn); gn.connect(out || master); s.start(t, RNG() * .5); s.stop(t + dur + .05);
    }
    function tnS(type, f0, f1, dur, vol, dt, cut, out) {
      const t = AC.currentTime + (dt || 0), o = AC.createOscillator(), gn = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      env(gn, t, .005, dur, vol);
      if (cut) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); fl.connect(gn); } else o.connect(gn);
      gn.connect(out || master); o.start(t); o.stop(t + dur + .05);
    }
    const MATC = { stone: 's', deepslate: 's', netherrack: 'r', basalt: 's', nether_bricks: 's', copper: 'm', metal: 'm', anvil: 'm', lantern: 'm', chain: 'm', heavy_core: 'm', lodestone: 's', mud_bricks: 's', resin: 'g', wood: 'w', bamboo: 'w', cherry: 'w', nether_wood: 'w', ladder: 'w', scaffold: 'w', grass: 'g', plant: 'g', crop: 'g', vine: 'g', azalea: 'g', moss: 'g', wart: 'g', cherry_leaves: 'g', azalea_leaves: 'g', fungus: 'g', slime: 'q', honey: 'q', gravel: 'r', mud: 'r', soul: 'r', nylium: 'r', sand: 'a', snow: 'a', glass: 'l', amethyst: 'l', froglight: 'l', wool: 'c', candle: 'c', decorated_pot: 's', sculk: 'c', coral: 'c', bone: 's', creaking_heart: 'w' };
    function matSnd(m, kind, pos, v) {
      if (api.muted || !SET.sound || !ac()) return;
      let vol = [.08, .07, .22][kind] * (v ?? 1);
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 16) return; vol *= 1 - d / 16; }
      const c = MATC[m] || 's', dur = [.07, .06, .16][kind], r = .85 + RNG() * .3;
      if (c === 'g') nzS(dur, vol, 'lowpass', 2600 * r, .6);
      else if (c === 'r') { nzS(dur, vol, 'bandpass', 900 * r, .8); if (kind === 2) nzS(dur * .7, vol * .7, 'bandpass', 1400 * r, 1, .05); }
      else if (c === 's') { nzS(dur * .8, vol, 'bandpass', 1900 * r, 1.4); if (kind === 2) tnS('square', 180 * r, 90, .06, vol * .2); }
      else if (c === 'm') { nzS(dur * .6, vol * .8, 'bandpass', 3200 * r, 3); tnS('triangle', 900 * r, 700, dur, vol * .3); }
      else if (c === 'w') { nzS(dur, vol, 'lowpass', 850 * r, 1); tnS('triangle', 150 * r, 80, dur, vol * .7); }
      else if (c === 'a') nzS(dur * 1.3, vol * .8, 'highpass', 1500 * r, .5);
      else if (c === 'c') nzS(dur * 1.2, vol * .7, 'lowpass', 700 * r, .5);
      else if (c === 'q') { tnS('sine', 300 * r, 150, dur * 1.5, vol * .6); nzS(dur, vol * .4, 'lowpass', 600, 1); }
      else if (c === 'l') { if (kind === 2) { nzS(.25, vol, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f * r, f * r * .9, .12, vol * .3, i * .03)); } else nzS(dur, vol, 'bandpass', 2500, 2); }
    }
    function snd(name, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = 1;
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 20) return; v = 1 - d / 20; }
      if (pos && NET.role === 'host' && pos !== P) netSend({ t: 'snd', n: name, x: +pos.x.toFixed(1), y: +pos.y.toFixed(1), z: +pos.z.toFixed(1) });
      const r = .9 + RNG() * .2;
      switch (name) {
        case 'hurt': tnS('triangle', 340 * r, 160, .17, .3); nzS(.1, .12, 'bandpass', 700, 1.5); break;
        case 'fall_small': nzS(.12, .22, 'lowpass', 500, .7); tnS('triangle', 260, 140, .12, .2); break;
        case 'fall_big': nzS(.2, .3, 'lowpass', 380, .7); tnS('triangle', 200, 90, .2, .28); break;
        case 'pop': tnS('sine', 900 * r, 1700 * r, .06, .12); break;
        case 'orb': tnS('sine', 1900 * r, 2300 * r, .1, .07); tnS('sine', 2800 * r, 3100, .08, .04, .03); break;
        case 'click': tnS('square', 1500, 1400, .02, .05 * v); nzS(.02, .05 * v, 'highpass', 3000, .5); break;
        case 'pig': tnS('square', 330 * r, 230 * r, .12, .08 * v, 0, 1300); tnS('square', 300 * r, 210 * r, .1, .07 * v, .16, 1300); break;
        case 'pig_hurt': tnS('square', 420 * r, 300 * r, .14, .1 * v, 0, 1600); break;
        case 'pig_death': tnS('square', 380 * r, 140 * r, .4, .1 * v, 0, 1400); break;
        case 'cow': tnS('sawtooth', 135 * r, 104 * r, .9, .15 * v, 0, 600); break;
        case 'cow_hurt': tnS('sawtooth', 180 * r, 130 * r, .3, .15 * v, 0, 700); break;
        case 'cow_death': tnS('sawtooth', 160 * r, 80 * r, .7, .15 * v, 0, 600); break;
        case 'sheep': tnS('sawtooth', 300 * r, 280 * r, .5, .08 * v, 0, 1200); tnS('sine', 7 * r, 7, .5, .0); break;
        case 'sheep_hurt': case 'sheep_death': tnS('sawtooth', 360 * r, 260 * r, .3, .1 * v, 0, 1400); break;
        case 'chicken': tnS('square', 900 * r, 1100 * r, .06, .05 * v, 0, 3000); tnS('square', 1000 * r, 900 * r, .06, .05 * v, .09, 3000); break;
        case 'chicken_hurt': case 'chicken_death': tnS('square', 1200 * r, 700 * r, .12, .07 * v, 0, 3000); break;
        case 'zombie': tnS('sawtooth', 95 * r, 72 * r, .75, .14 * v, 0, 700); tnS('sawtooth', 97 * r, 75 * r, .7, .08 * v, .05, 500); break;
        case 'zombie_hurt': tnS('sawtooth', 150 * r, 90, .25, .16 * v, 0, 900); break;
        case 'zombie_death': tnS('sawtooth', 120 * r, 50, .7, .16 * v, 0, 700); break;
        case 'skeleton': case 'skeleton_hurt': case 'skeleton_death': for (let i = 0; i < 5; i++) nzS(.03, .09 * v, 'bandpass', 2600 * r, 4, i * .05); break;
        case 'creeper_hurt': case 'creeper_death': nzS(.2, .1 * v, 'bandpass', 1200, 1); break;
        case 'creeper': break;
        case 'spider': nzS(.25, .06 * v, 'bandpass', 3500 * r, 3); break;
        case 'spider_hurt': case 'spider_death': nzS(.2, .1 * v, 'bandpass', 2800 * r, 2); tnS('sawtooth', 600, 300, .15, .05 * v); break;
        case 'enderman': tnS('sine', 120 * r, 80, .6, .08 * v); break;
        case 'enderman_hurt': case 'enderman_death': case 'enderman_scream': tnS('sawtooth', 500 * r, 900 * r, .5, .1 * v, 0, 2000); break;
        case 'slime': case 'slime_hurt': case 'slime_death': tnS('sine', 200 * r, 90, .15, .14 * v); break;
        case 'poof': nzS(.3, .14 * v, 'lowpass', 1300, .5); break;
        case 'bow': nzS(.16, .12 * v, 'highpass', 1200, .7, 0, 4000); break;
        case 'arrow_hit': nzS(.08, .14 * v, 'lowpass', 900, 1); break;
        case 'arrow_land': tnS('square', 320, 150, .05, .07 * v); break;
        case 'throw': nzS(.15, .08, 'highpass', 900, .7, 0, 3000); break;
        case 'eat': nzS(.07, .16, 'bandpass', 1500 * r, 1.2); break;
        case 'drink': tnS('sine', 300 * r, 500 * r, .08, .1); break;
        case 'burp': tnS('sawtooth', 120, 70, .25, .14, 0, 500); break;
        case 'splash': nzS(.45, .2, 'lowpass', 1800, .5, 0, 400); break;
        case 'tbreak': tnS('square', 900, 300, .08, .1); nzS(.1, .1, 'highpass', 2500, .5); break;
        case 'levelup': [523, 659, 784, 1047].forEach((f, i) => tnS('sine', f, f, .22, .08, i * .08)); break;
        case 'hit_weak': nzS(.05, .1 * v, 'lowpass', 1000, 1); break;
        case 'hit_strong': nzS(.06, .16 * v, 'lowpass', 900, 1); tnS('triangle', 200, 90, .07, .1 * v); break;
        case 'crit': nzS(.08, .18 * v, 'bandpass', 2400, 1); tnS('triangle', 260, 100, .09, .12 * v); break;
        case 'fuse': nzS(1.4, .1 * v, 'highpass', 3000, .5); break;
        case 'explode': nzS(1.4, .55 * Math.max(.3, v), 'lowpass', 600, .7, 0, 60); tnS('sine', 80, 30, 1, .4 * Math.max(.3, v)); break;
        case 'door_open': case 'door_close': nzS(.12, .13 * v, 'lowpass', 900, 1); tnS('triangle', name === 'door_open' ? 160 : 120, 90, .1, .1 * v); break;
        case 'chest_open': tnS('triangle', 140, 90, .25, .1 * v); nzS(.2, .06 * v, 'lowpass', 800, 1); break;
        case 'chest_close': tnS('triangle', 120, 70, .12, .12 * v); break;
        case 'bucket_fill': case 'bucket_empty': nzS(.3, .15, 'lowpass', 1500, .8, 0, 500); break;
        case 'bucket_fill_lava': case 'bucket_empty_lava': nzS(.4, .15, 'lowpass', 600, .8, 0, 200); break;
        case 'fizz': nzS(.5, .1 * v, 'highpass', 2500, .6); break;
        case 'ignite': nzS(.15, .12, 'highpass', 2000, .8); tnS('square', 2000, 1500, .04, .04); break;
        case 'hoe': case 'shovel': nzS(.12, .14, 'bandpass', 900, .8); break;
        case 'strip': case 'scrape': case 'wax_off': nzS(.18, .14, 'bandpass', 1400, 1.5); break;
        case 'wax_on': nzS(.12, .1, 'lowpass', 1200, .5); break;
        case 'shear': nzS(.08, .12 * v, 'highpass', 3000, 2); nzS(.08, .1 * v, 'highpass', 3500, 2, .08); break;
        case 'milk': nzS(.3, .12, 'lowpass', 1000, .8); break;
        case 'teleport': tnS('sine', 300, 900, .4, .1 * v); break;
        case 'glass_break': nzS(.25, .14 * v, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f, f * .9, .12, .05 * v, i * .03)); break;
        case 'equip': nzS(.12, .1, 'bandpass', 1800, 1); tnS('triangle', 600, 500, .08, .05); break;
        case 'shield': tnS('triangle', 220, 120, .1, .15); nzS(.08, .12, 'lowpass', 800, 1); break;
        case 'totem': [392, 523, 659, 784].forEach((f, i) => tnS('triangle', f, f, .4, .08, i * .06)); break;
        case 'anvil_land': tnS('square', 600, 580, .4, .1 * v, 0, 3000); break;
        case 'piston_out': case 'piston_in': nzS(.12, .14 * v, 'lowpass', 600, 1); tnS('square', 110, 70, .1, .06 * v); break;
        case 'compost': nzS(.12, .1, 'lowpass', 700, 1); break;
        case 'bottle_fill': tnS('sine', 400, 900, .2, .08); break;
        case 'crossbow_load': tnS('square', 300, 600, .2, .06); break;
        case 'land': nzS(.12, .2, 'lowpass', 420, .7); break;
      }
    }
    const INSTR = { harp: ['sine', 1], bass: ['triangle', .25], snare: ['noise', 1], hat: ['noiseh', 1], basedrum: ['kick', 1], bell: ['sine', 4], flute: ['sine', 2], chime: ['triangle', 4], guitar: ['sawtooth', .5], xylophone: ['triangle', 2], iron_xylophone: ['square', 1], cow_bell: ['square', 2], didgeridoo: ['sawtooth', .25], bit: ['square', 1], banjo: ['sawtooth', 1], pling: ['triangle', 1] };
    function instrFor(s) { const t = TT[STT[s]], id = t.id; if (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry') return 'bass'; if (t.snd === 'sand' || id === 'gravel' || id.includes('concrete_powder')) return 'snare'; if (t.snd === 'glass' || id === 'glowstone' || id === 'sea_lantern') return id === 'glowstone' ? 'pling' : 'hat'; if (t.snd === 'stone' || t.snd === 'deepslate' || t.snd === 'netherrack') return 'basedrum'; if (id === 'gold_block') return 'bell'; if (id === 'clay') return 'flute'; if (id === 'packed_ice') return 'chime'; if (t.tags.has('wool')) return 'guitar'; if (id === 'bone_block') return 'xylophone'; if (id === 'iron_block') return 'iron_xylophone'; if (id === 'soul_sand') return 'cow_bell'; if (id === 'pumpkin') return 'didgeridoo'; if (id === 'emerald_block') return 'bit'; if (id === 'hay_block') return 'banjo'; return 'harp'; }
    function noteSnd(n, below, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = .14; if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 48) return; v *= 1 - d / 48; }
      const ins = instrFor(below), [ty, mul] = INSTR[ins], f = 185 * Math.pow(2, (n - 12) / 12) * mul;
      if (ty === 'noise') nzS(.12, v, 'bandpass', 1500 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'noiseh') nzS(.05, v, 'highpass', 6000 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'kick') tnS('sine', 120 * Math.pow(2, (n - 12) / 24), 40, .2, v * 1.5);
      else { tnS(ty, f, f, .8, v, 0, ty === 'sawtooth' ? 2000 : 0); if (ty === 'sine') tnS('sine', f * 2, f * 2, .5, v * .2); }
    }
    function note(f, dt, v, out) {
      const t0 = AC.currentTime + dt;
      for (const [m, a] of [[1, 1], [2, .3], [3, .1]]) {
        const o = AC.createOscillator(), gn = AC.createGain();
        o.type = 'sine'; o.frequency.value = f * m; gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(v * a, t0 + .012); gn.gain.exponentialRampToValueAtTime(.0001, t0 + 2.6 / m);
        o.connect(gn); gn.connect(out || musicBus); o.start(t0); o.stop(t0 + 2.7);
      }
    }
    function musicTick() {
      if (!SET.music || api.muted || !AC || (scr !== 'game' && scr !== 'title') || discT) return;
      if (--musicT > 0) return;
      musicT = 20 * (60 + RNG() * 120);
      const sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], base = [261.63, 220, 196, 233.08, 174.61][ri(5)];
      let t = .1, i = 4 + ri(3);
      for (let n = 0; n < 20; n++) {
        i = clamp(i + [-2, -1, -1, 0, 1, 1, 2][ri(7)], 0, sc.length - 1);
        const f = base * 2 ** (sc[i] / 12);
        note(f, t, .05); if (n % 4 === 0) note(f / 2, t, .04); if (n % 8 === 2) note(f * 1.5, t + .3, .025);
        t += [.6, 1.2, 1.2, 1.8, 2.4][ri(5)];
      }
    }
    function playDisc(name, x, y, z) {
      stopDisc(); if (!ac()) return;
      const R = rng(hstr(name)), sc = [0, 3, 5, 7, 10, 12, 15], base = 196 * Math.pow(2, R() * .5);
      const seq = []; let i = 3; for (let n = 0; n < 32; n++) { i = clamp(i + ri(3) - 1, 0, 6); seq.push(base * 2 ** (sc[i] / 12)); }
      let k = 0;
      discT = setInterval(() => { if (!api.alive || api.muted) return; const d = Math.hypot(x - P.x, y - P.y, z - P.z); if (d < 48) note(seq[k % 32], 0, .06 * (1 - d / 48), master); if (k % 4 === 0 && d < 48) note(seq[(k + 2) % 32] / 2, 0, .04 * (1 - d / 48), master); k++; }, 320);
    }
    function stopDisc() { if (discT) { clearInterval(discT); discT = null; } }
    const fontW = [], fontC = cv(128, 54), fg = fontC.getContext('2d');
    fg.fillStyle = '#fff';
    for (let i = 0; i < 95; i++) { let w = 0; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let c = 0; c < 5; c++) if (v & (16 >> c)) { fg.fillRect((i & 15) * 8 + c, (i >> 4) * 9 + r, 1, 1); w = Math.max(w, c + 1); } } fontW.push(i ? w : 3); }
    let GW = 480, GH = 300, GK = 2, cssW = 0, cssH = 0;
    function resize() {
      const w = wrap.clientWidth || 960, h = wrap.clientHeight || 600, r = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 3);
      const pw = Math.max(64, Math.round((r.width || w) * dpr)), ph = Math.max(64, Math.round((r.height || h) * dpr));
      if (w !== cssW || h !== cssH) { cssW = w; cssH = h; renderer.setSize(w, h, false); cam.aspect = hCam.aspect = w / h; fovDirty = true; hCam.fov = w < h ? 90 : 70; cam.updateProjectionMatrix(); hCam.updateProjectionMatrix(); }
      if (hud.width !== pw || hud.height !== ph) { hud.width = pw; hud.height = ph; }
      const auto = touch ? Math.max(1, Math.min(pw / 220, ph / 220, dpr * 2.6)) : Math.max(1, Math.min(Math.floor(pw / 320), Math.floor(ph / 240)));
      GK = SET.gui ? Math.min(SET.gui * (touch ? .9 : 1) * (dpr > 1.5 ? 1.5 : 1), auto * 1.5) : auto;
      if (!touch) GK = Math.max(1, Math.round(GK)); else GK = Math.max(1, GK);
      GW = Math.floor(pw / GK); GH = Math.floor(ph / GK);
    }
    const toGui = e => { const r = hud.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1) * GW, (e.clientY - r.top) / (r.height || 1) * GH]; };
    const tints = new Map();
    const fontTint = col => { let c = tints.get(col); if (c) return c; c = cv(128, 54); const x = c.getContext('2d'); x.drawImage(fontC, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 128, 54); tints.set(col, c); return c; };
    const tw = s => { let w = 0; for (const ch of String(s)) { const i = ch.charCodeAt(0) - 32; w += (i >= 0 && i < 95 ? fontW[i] : 3) + 1; } return Math.max(0, w - 1); };
    const shade = col => { const n = parseInt(col.slice(1), 16); return '#' + (((n >> 2) & 0x3f3f3f) | 0x1000000).toString(16).slice(1); };
    function drawStr(s, x, y, col, sc) { const f = fontTint(col); for (const ch of s) { const i = ch.charCodeAt(0) - 32; if (i < 0 || i >= 95) { x += 4 * sc; continue; } g.drawImage(f, (i & 15) * 8, (i >> 4) * 9, 8, 8, x, y, 8 * sc, 8 * sc); x += (fontW[i] + 1) * sc; } }
    function text(s, x, y, col = '#ffffff', sh = true, sc = 1) { s = String(s); x = Math.round(x); y = Math.round(y); if (sh) drawStr(s, x + sc, y + sc, shade(col), sc); drawStr(s, x, y, col, sc); }
    const textC = (s, cx, y, col, sh, sc = 1) => text(s, cx - tw(s) * sc / 2, y, col, sh, sc);
    const textR = (s, rx, y, col, sh) => text(s, rx - tw(s), y, col, sh);
    function wrapText(s, w) { const out = []; let line = ''; for (const word of String(s).split(' ')) { const t = line ? line + ' ' + word : word; if (tw(t) > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; }
    const tplC = (rows, f) => { const c = cv(rows[0].length, rows.length), x = c.getContext('2d'); rows.forEach((r, j) => [...r].forEach((ch, i) => { const col = f(ch, i, j); if (col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); } })); return c; };
    const HEART = ['.kk...kk.', 'kwrk.krrk', 'kwrrkrrrk', 'krrrrrrRk', '.krrrrRk.', '..krrRk..', '...kRk...', '....k....'];
    const SHANK = ['.....kk..', '....kwwk.', '....kwk..', '...kbk...', '.kkbbk...', 'kbbbbbk..', 'kbBbbbk..', 'kbbbbk...', '.kkkk....'];
    const BUBBLE = ['.........', '..kkkk...', '.kwwbbk..', '.kwbbbk..', '.kbbbbk..', '.kbbbbk..', '..kkkk...'];
    const ARMI = ['.kkk.kkk.', 'kwwwkwwwk', 'kwssssswk', 'kwssssswk', '.kwssswk.', '.kwssswk.', '.kwssswk.', '..kkkkk..'];
    const hpP = { k: '#000', w: '#ffc8c8', r: '#e01818', R: '#a00808' }, poP = { k: '#000', w: '#e0e8a0', r: '#94a020', R: '#6a7410' }, abP = { k: '#000', w: '#fff8c0', r: '#f0c020', R: '#b08010' }, fpP = { k: '#2a1608', w: '#f0e6d0', b: '#b8702c', B: '#7c4414' }, fhP = { k: '#1a2008', w: '#e0e8c0', b: '#7a9a2c', B: '#4a6a14' };
    const I = {
      hC: tplC(HEART, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), hW: tplC(HEART, ch => ch === 'k' ? '#fff' : ch !== '.' ? '#2c2c2c' : null),
      hF: tplC(HEART, ch => hpP[ch]), hH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? hpP[ch] : '#2c2c2c') : null),
      pF: tplC(HEART, ch => poP[ch]), pH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? poP[ch] : '#2c2c2c') : null),
      aF: tplC(HEART, ch => abP[ch]), aH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? abP[ch] : null) : null),
      hcF: tplC(HEART, ch => ch === 'k' ? '#000' : ch === 'w' ? '#fff' : ch === 'r' ? '#d01818' : ch === 'R' ? '#701010' : null),
      fC: tplC(SHANK, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), fF: tplC(SHANK, ch => fpP[ch]), fH: tplC(SHANK, (ch, i) => ch === 'k' ? '#2a1608' : ch !== '.' ? (i < 5 ? fpP[ch] : '#2c2c2c') : null),
      fgF: tplC(SHANK, ch => fhP[ch]), fgH: tplC(SHANK, (ch, i) => ch === 'k' ? '#1a2008' : ch !== '.' ? (i < 5 ? fhP[ch] : '#2c2c2c') : null),
      bub: tplC(BUBBLE, ch => ({ k: '#1e3c8c', w: '#fff', b: '#64a0ff' })[ch]), aC: tplC(ARMI, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), aFl: tplC(ARMI, ch => ({ k: '#000', w: '#fff', s: '#c8c8c8' })[ch]), aHf: tplC(ARMI, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? ({ w: '#fff', s: '#c8c8c8' })[ch] : '#2c2c2c') : null)
    };
    const flame = lit => { const c = cv(14, 14), x = c.getContext('2d'); for (let y = 0; y < 14; y++) for (let i = 0; i < 14; i++) { const hw = 6.5 * Math.sqrt((y + 1) / 14) * (y > 10 ? (14 - y) / 4 : 1) + Math.sin(y * 1.7) * .6, d = Math.abs(i - 6.5); if (d < hw) { x.fillStyle = lit ? (d < hw * .4 && y > 6 ? '#fff6b0' : d < hw * .72 ? '#ffbe20' : '#e05a10') : (d < hw * .7 ? '#7a7a7a' : '#646464'); x.fillRect(i, y, 1, 1); } } return c; };
    const arrowI = col => { const c = cv(24, 17), x = c.getContext('2d'); x.fillStyle = col; for (let y = 0; y < 17; y++) for (let i = 0; i < 24; i++) if ((i < 15 && y >= 6 && y <= 10) || (i >= 14 && Math.abs(y - 8) <= 22 - i)) x.fillRect(i, y, 1, 1); return c; };
    I.flL = flame(1); I.flU = flame(0); I.arB = arrowI('#8b8b8b'); I.arF = arrowI('#ffffff');
    const BT = [[111, 111, 111, 168, 168, 168, 84, 84, 84], [118, 128, 186, 188, 198, 255, 82, 92, 150], [46, 46, 46, 62, 62, 62, 32, 32, 32]].map(p => {
      const c = cv(200, 20), x = c.getContext('2d'), im = x.createImageData(200, 20), R = rng(5);
      for (let y = 0; y < 20; y++) for (let i = 0; i < 200; i++) { const o = (y * 200 + i) * 4, edge = y === 0 || y === 19 || i === 0 || i === 199, hi = y === 1 || i === 1, lo = y >= 17 || i === 198, n = .93 + R() * .14; const c3 = edge ? [0, 0, 0] : hi ? p.slice(3, 6) : lo ? p.slice(6, 9) : p.slice(0, 3).map(v => v * n); im.data[o] = c3[0]; im.data[o + 1] = c3[1]; im.data[o + 2] = c3[2]; im.data[o + 3] = 255; }
      x.putImageData(im, 0, 0); return c;
    });
    const dirtBg = (() => { const c = cv(16, 16), x = c.getContext('2d'), d = get('dirt'), im = x.createImageData(16, 16); for (let i = 0; i < 1024; i += 4) { im.data[i] = d[i] * .25; im.data[i + 1] = d[i + 1] * .25; im.data[i + 2] = d[i + 2] * .25; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; })();
    const LOGO = (() => {
      const word = 'MINECRAFT', S2 = 6, pts = new Set(); let x0 = 0;
      for (const ch of word) { const i = ch.charCodeAt(0) - 32; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let k = 0; k < 5; k++) if (v & (16 >> k)) pts.add((x0 + k) + ',' + r); } x0 += fontW[i] + 2; }
      const c = cv(x0 * S2 + 10, 7 * S2 + 12), q = c.getContext('2d'), sd = get('stone'), dd = get('cobblestone');
      const list = [...pts].map(p => p.split(',').map(Number));
      for (const [px, py] of list) { q.fillStyle = '#121212'; q.fillRect(px * S2 + 5, py * S2 + 7, S2, S2); q.fillStyle = '#2e2e2e'; q.fillRect(px * S2 + 3, py * S2 + 5, S2, S2); q.fillStyle = '#4a4a4a'; q.fillRect(px * S2 + 1.5, py * S2 + 3, S2, S2); }
      for (const [px, py] of list) for (let j = 0; j < S2; j++) for (let i = 0; i < S2; i++) {
        const X = px * S2 + i, Y = py * S2 + j, src = (j + py) % 3 === 0 ? dd : sd, o = ((Y % 16) * 16 + (X % 16)) * 4;
        let f = 1.15; if (j === 0 && !pts.has(px + ',' + (py - 1))) f = 1.65; else if (i === 0 && !pts.has((px - 1) + ',' + py)) f = 1.4; else if (j === S2 - 1 && !pts.has(px + ',' + (py + 1))) f = .75; else if (i === S2 - 1 && !pts.has((px + 1) + ',' + py)) f = .9;
        q.fillStyle = `rgb(${Math.min(255, src[o] * f) | 0},${Math.min(255, src[o + 1] * f) | 0},${Math.min(255, src[o + 2] * f) | 0})`; q.fillRect(X, Y, 1, 1);
      }
      return c;
    })();
    const EDITION = (() => { const s = 'JAVA EDITION', c = cv(tw(s) * 2 + 8, 22), q = c.getContext('2d'); q.fillStyle = '#5a3a1a'; q.fillRect(0, 2, c.width, 18); q.fillStyle = '#8a5a2a'; q.fillRect(1, 3, c.width - 2, 16); return c; })();
    const SPLASHES = ['Also try Terraria!', 'Now with poplar trees!', 'Wilderness Bound!', '100% blocks!', 'Punch a tree!', 'Mind the creepers!', 'Diamonds below!', 'Pixel perfect!', 'Bring a pickaxe!', 'Infinite worlds!', 'Pigs included!', 'Sulfur caves?!', 'Cushions!', 'Cinnabar!', 'LAN party!', 'Made in a browser!', 'Water flows!', 'Sand falls!', 'Redstone!', 'Craft away!', 'Golden dandelion!', 'Over 1500 items!'];
    const SPLASH = SPLASHES[ri(SPLASHES.length)];
    let btns = [], slots = [], hovSlot = null, mx = -1, my = -1, pRect = [0, 0, 0, 0], fields = [], focusKey = null;
    const inR = (x, y, r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
    function button(x, y, w, h, label, fn, en = true) {
      x |= 0; y |= 0;
      if (touch && h === 20) { y -= 2; h = 24; }
      const hov = en && !touch && mx >= x && my >= y && mx < x + w && my < y + h, t = BT[en ? (hov ? 1 : 0) : 2], hw = w >> 1;
      g.drawImage(t, 0, 0, hw, 20, x, y, hw, h); g.drawImage(t, 200 - (w - hw), 0, w - hw, 20, x + hw, y, w - hw, h);
      const lb = Array.isArray(label) ? (tw(label[0]) > w - 8 ? label[1] : label[0]) : label;
      let lbs = lb; while (lbs.length > 3 && tw(lbs) > w - 6) lbs = lbs.slice(0, -1);
      textC(lbs, x + w / 2, y + (h - 8) / 2, en ? (hov ? '#ffffa0' : '#e0e0e0') : '#a0a0a0');
      btns.push({ x, y, w, h, fn, en, l: lb });
    }
    function rows(list, y, tot) { tot = Math.min(tot || 308, GW - 8); const n = list.length, bw = (tot - (n - 1) * 4) / n | 0, x0 = (GW - (bw * n + (n - 1) * 4)) / 2 | 0; list.forEach(([l, fn, en], i) => button(x0 + i * (bw + 4), y, bw, 20, l, fn, en !== false)); }
    function ring(x, y, w, h, t, c) { g.fillStyle = c; g.fillRect(x, y, w, t); g.fillRect(x, y + h - t, w, t); g.fillRect(x, y, t, h); g.fillRect(x + w - t, y, t, h); }
    function drawDirt(dark) { for (let y = 0; y < GH; y += 32) for (let x = 0; x < GW; x += 32) g.drawImage(dirtBg, x, y, 32, 32); if (dark) { g.fillStyle = 'rgba(0,0,0,' + dark + ')'; g.fillRect(0, 0, GW, GH); } }
    function shadeAll(a, b) { const gr = g.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, GW, GH); }
    function panel(x, y, w, h) {
      g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, h); g.fillRect(x, y + 2, w, h - 4); g.fillRect(x + 1, y + 1, w - 2, h - 2);
      g.fillStyle = '#fff'; g.fillRect(x + 1, y + 1, w - 4, h - 4); g.fillRect(x + 2, y + 1, w - 4, 2);
      g.fillStyle = '#555'; g.fillRect(x + 3, y + 3, w - 4, h - 4);
      g.fillStyle = '#c6c6c6'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
    }
    function frame(x, y, s) { g.fillStyle = '#373737'; g.fillRect(x - 1, y - 1, s, s); g.fillStyle = '#fff'; g.fillRect(x, y, s - 1, s - 1); g.fillStyle = '#8b8b8b'; g.fillRect(x, y, s - 2, s - 2); }
    function field(key, x, y, w, h, val, ph, onEnter, maxLen) {
      const focus = focusKey === key && document.activeElement === inp;
      g.fillStyle = focus ? '#ffffff' : '#a0a0a0'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#000'; g.fillRect(x, y, w, h);
      let st = val; while (st && tw(st) > w - 10) st = st.slice(1);
      if (!val && ph && !focus) text(ph, x + 4, y + (h - 8) / 2, '#707070', false);
      text(st + (focus && (performance.now() / 300 | 0) % 2 ? '_' : ''), x + 4, y + (h - 8) / 2, '#e0e0e0');
      fields.push({ key, x, y, w, h, onEnter, maxLen: maxLen || 32 });
    }
    function focusField(key, val, max) {
      focusKey = key; inp.hidden = false; inp.maxLength = max || 32; inp.value = val || '';
      const f = fields.find(q => q.key === key);
      if (f) { const k = cssW / hud.width * GK; Object.assign(inp.style, { left: f.x * k + 'px', top: f.y * k + 'px', width: f.w * k + 'px', height: f.h * k + 'px' }); }
      try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    }
    function blurField() { focusKey = null; inp.blur(); inp.hidden = true; }
    const FIELDV = {};
    function drawItem(s, x, y, noCount) {
      if (!s) return;
      const id = s.id;
      g.drawImage(ICON, (id % ICN) * ICS, (id / ICN | 0) * ICS, ICS, ICS, x, y, 16, 16);
      const it = IT[id];
      if (it.glint) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(120,60,200,${.18 + Math.sin(performance.now() / 400) * .06})`; g.fillRect(x + 1, y + 1, 14, 14); g.globalCompositeOperation = 'source-over'; }
      if (it.dur && s.d > 0) { const f = 1 - s.d / it.dur; g.fillStyle = '#000'; g.fillRect(x + 2, y + 13, 13, 2); g.fillStyle = `hsl(${f * 120 | 0},100%,50%)`; g.fillRect(x + 2, y + 13, Math.max(1, Math.round(13 * f)), 1); }
      if (s.n > 1 && !noCount) { const str = String(s.n); text(str, x + 17 - tw(str), y + 9); }
    }
    function itemName(s) { const it = IT[s.id]; return it.name; }
    function tooltip(lines, x, y) {
      if (!Array.isArray(lines)) lines = [lines];
      const w = Math.max(...lines.map(l => tw(l[0] || l))) + 6, h = lines.length * 10 + 2; x = Math.min(x, GW - w - 2) | 0; y = clamp(y, 2, GH - h - 2) | 0;
      g.fillStyle = 'rgba(16,0,16,.94)'; g.fillRect(x - 1, y, w + 2, h); g.fillRect(x, y - 1, w, h + 2);
      g.fillStyle = '#5000ff'; g.fillRect(x, y, w, 1); g.fillStyle = '#28007f'; g.fillRect(x, y + h - 1, w, 1); g.fillStyle = '#3c00c0'; g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
      lines.forEach((l, i) => text(Array.isArray(l) ? l[0] : l, x + 3, y + 2 + i * 10, Array.isArray(l) ? l[1] : '#ffffff'));
    }
    function itemTip(s) {
      const it = IT[s.id], L = [[it.name, it.glint ? '#ffff55' : it.id.includes('netherite') || it.id === 'nether_star' || it.id === 'dragon_egg' ? '#ff55ff' : '#ffffff']];
      if (it.desc) L.push([it.desc, '#aaaaaa']);
      if (it.dmg && (it.tool || it.spear || it.trident || it.mace)) { L.push(['', '#fff'], ['When in Main Hand:', '#aaaaaa'], [' ' + (+it.dmg.toFixed(1)) + ' Attack Damage', '#00aa00'], [' ' + (+(it.aspd || 4).toFixed(1)) + ' Attack Speed', '#00aa00']); }
      if (it.armor && it.armor.def) { L.push(['', '#fff'], ['When on ' + ['Head', 'Body', 'Legs', 'Feet'][it.armor.slot] + ':', '#aaaaaa'], ['+' + it.armor.def + ' Armor', '#5555ff']); if (it.armor.tough) L.push(['+' + it.armor.tough + ' Armor Toughness', '#5555ff']); }
      if (it.food) { }
      if (it.dur && s.d > 0) L.push(['Durability: ' + (it.dur - s.d) + ' / ' + it.dur, '#ffffff']);
      if (s.x && s.x.items) { const n = s.x.items.filter(Boolean).length; if (n) L.push([n + ' item stacks', '#aaaaaa']); }
      if (SHOWADV) L.push([(it.block ? 'minecraft:' : 'minecraft:') + it.id, '#555555']);
      return L;
    }
    let SHOWADV = false;
    function drawPlayerModel(x, y, sc) {
      const r = (c, a, b, w, h) => { g.fillStyle = c; g.fillRect(x + a * sc, y + b * sc, w * sc, h * sc); };
      const sk = '#c8946c', sh = '#00afaf', pa = '#3c3aa0', hr = '#462e18';
      r(pa, -4, 12, 8, 12); r('#2a2870', -.5, 12, 1, 12); r('#464650', -4, 22, 8, 2);
      r(sh, -4, 0, 8, 12); r(sk, -8, 0, 4, 12); r(sk, 4, 0, 4, 12); r(sh, -8, 0, 4, 4); r(sh, 4, 0, 4, 4);
      r(sk, -4, -8, 8, 8); r(hr, -4, -8, 8, 2); r(hr, -4, -6, 1, 1); r(hr, 3, -6, 1, 1); r('#fff', -3, -4, 1, 1); r('#fff', 2, -4, 1, 1); r('#503ca0', -2, -4, 1, 1); r('#503ca0', 1, -4, 1, 1); r('#8a5a40', -1, -2, 2, 1);
      if (armor[0]) r(matCol(armor[0]), -4.5, -8.5, 9, 3); if (armor[1]) { r(matCol(armor[1]), -4.5, -.5, 9, 10); r(matCol(armor[1]), -8.5, -.5, 4, 5); r(matCol(armor[1]), 4.5, -.5, 4, 5); } if (armor[2]) r(matCol(armor[2]), -4.5, 9, 9, 10); if (armor[3]) r(matCol(armor[3]), -4.5, 20, 9, 4);
    }
    const matCol = s => { const m = IT[s.id].armor && IT[s.id].armor.mat; return m === 'leather' ? '#a0623a' : m === 'golden' ? '#f0d030' : m === 'diamond' ? '#33d8d0' : m === 'netherite' ? '#4f474f' : m === 'copper' ? '#c96a44' : m === 'turtle' ? '#3a8a3a' : '#c8c8c8'; };
    let showF3 = false, fps = 60, chatOpen = false, chatLog = [], chatHist = [], chatHi = -1, titleMsg = null;
    function chatSys(m, col) { chatLog.push({ m: String(m), c: col || '#ffffff', t: performance.now() }); if (chatLog.length > 100) chatLog.shift(); }
    function drawChat(now) {
      const max = chatOpen ? 20 : 10, base = GH - (touch ? 70 : 48), w = Math.min(320, GW - 8);
      let y = base, n = 0;
      for (let i = chatLog.length - 1; i >= 0 && n < max; i--) {
        const c = chatLog[i], age = (now - c.t) / 1000;
        if (!chatOpen && age > 10) break;
        const a = chatOpen ? 1 : clamp((10 - age) * 2, 0, 1);
        const L = wrapText(c.m, w - 6);
        for (let k = L.length - 1; k >= 0 && n < max; k--, n++) { y -= 9; g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(2, y - 1, w, 9); text(L[k], 4, y, c.c); g.globalAlpha = 1; }
      }
      if (chatOpen) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(2, GH - 14, GW - 4, 12); field('chat', 2, GH - 14, GW - 4, 12, FIELDV.chat || '', '', sendChat, 256); }
    }
    function drawHUD(now) {
      const md = mode();
      if (P.eyeW) { g.fillStyle = 'rgba(20,40,150,.18)'; g.fillRect(0, 0, GW, GH); }
      if (P.eyeL) { g.fillStyle = 'rgba(220,80,10,.75)'; g.fillRect(0, 0, GW, GH); }
      if (P.fire > 0 && md !== 'creative' && md !== 'spectator') { const t = now / 80; for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,${120 + (i * 20)},20,${.25})`; const fx = (i * 73 % GW), fh = 30 + Math.sin(t + i) * 10; g.fillRect(i < 3 ? 0 : GW - 60, GH - fh - i * 6, 60, fh); } }
      if (P.hurtT > 10) { g.fillStyle = `rgba(255,0,0,${(P.hurtT - 10) / 40})`; g.fillRect(0, 0, GW, GH); }
      if (P.sleeping) { g.fillStyle = `rgba(10,10,20,${Math.min(.9, P.sleeping / 100)})`; g.fillRect(0, 0, GW, GH); textC('Sleeping...', GW / 2, GH / 2 - 20, '#ffffff'); button(GW / 2 - 50, GH - 40, 100, 20, 'Leave Bed', wake); }
      if (md === 'spectator') { textC('Spectator Mode', GW / 2, GH - 20, '#aaaaaa'); return; }
      if (!touch && !gui) {
        const cx = GW >> 1, cy = GH >> 1; g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.fillRect(cx - 4, cy, 9, 1); g.fillRect(cx, cy - 4, 1, 4); g.fillRect(cx, cy + 1, 1, 4); g.globalCompositeOperation = 'source-over';
        const cdk = clamp((tickN - P.atkT) / atkCooldown(), 0, 1);
        if (cdk < 1) { g.fillStyle = '#444'; g.fillRect(cx - 8, cy + 9, 16, 2); g.fillStyle = '#ddd'; g.fillRect(cx - 8, cy + 9, Math.round(16 * cdk), 2); }
      }
      const hx = (GW - 182) >> 1, hy = GH - 22;
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(hx, hy, 182, 22);
      g.fillStyle = 'rgba(130,130,130,.95)'; g.fillRect(hx, hy, 182, 1); g.fillRect(hx, hy + 21, 182, 1); g.fillRect(hx, hy, 1, 22); g.fillRect(hx + 181, hy, 1, 22);
      for (let i = 1; i < 9; i++) g.fillRect(hx + i * 20 + 1, hy + 1, 1, 20);
      const sx = hx - 1 + sel * 20;
      ring(sx, hy - 1, 24, 24, 1, '#000'); ring(sx + 1, hy, 22, 22, 2, '#e8e8e8'); ring(sx + 3, hy + 2, 18, 18, 1, '#000');
      for (let i = 0; i < 9; i++) drawItem(inv[i], hx + 3 + i * 20, hy + 3);
      if (offhand) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(hx - 29, hy, 22, 22); ring(hx - 29, hy, 22, 22, 1, '#828282'); drawItem(offhand, hx - 26, hy + 3); }
      if (md === 'survival' || md === 'adventure') {
        const y0 = GH - 39, hc = W.hardcore, pois = P.effects.poison > 0, hung = P.effects.hunger > 0;
        const hpMax = 20, rowsH = 1;
        void rowsH;
        for (let i = 0; i < 10; i++) {
          const x = hx + i * 8, y = y0 + (P.hp <= 4 && ((tickN * 31 + i * 7) % 3 === 0) ? 1 : 0) + (P.effects.regen && (tickN % 25) === i ? -2 : 0);
          g.drawImage(P.hurtT > 10 && (P.hurtT >> 1) % 2 ? I.hW : I.hC, x, y);
          const F = pois ? I.pF : hc ? I.hcF : I.hF, Hh = pois ? I.pH : I.hH;
          if (P.hp >= i * 2 + 2) g.drawImage(F, x, y); else if (P.hp > i * 2) g.drawImage(Hh, x, y);
          void hpMax;
          const fx = hx + 182 - 9 - i * 8, fy = y0 + (P.sat <= 0 && (tickN + i * 3) % (P.food * 3 + 1) === 0 ? ((i * 7 + tickN) % 3) - 1 : 0);
          g.drawImage(I.fC, fx, fy);
          if (P.food >= i * 2 + 2) g.drawImage(hung ? I.fgF : I.fF, fx, fy); else if (P.food === i * 2 + 1) g.drawImage(hung ? I.fgH : I.fH, fx, fy);
        }
        let ay = y0 - 10;
        if (P.absorb > 0) { for (let i = 0; i < Math.ceil(P.absorb / 2); i++) { g.drawImage(I.hC, hx + i * 8, ay); g.drawImage(P.absorb >= i * 2 + 2 ? I.aF : I.aH, hx + i * 8, ay); } ay -= 10; }
        const [def] = armorPts();
        if (def > 0) for (let i = 0; i < 10; i++) { const x = hx + i * 8; g.drawImage(I.aC, x, ay); if (def >= i * 2 + 2) g.drawImage(I.aFl, x, ay); else if (def === i * 2 + 1) g.drawImage(I.aHf, x, ay); }
        if (P.air < CFG.AIR_MAX) { const n = Math.ceil(Math.max(0, P.air - 2) * 10 / 300); for (let i = 0; i < n; i++) g.drawImage(I.bub, hx + 182 - 9 - i * 8, y0 - 10); }
      }
      if (md !== 'creative' && md !== 'spectator') {
        const need = xpNeed(P.lvl), xw = Math.round(181 * P.xp / need);
        g.fillStyle = '#000'; g.fillRect(hx, GH - 29, 182, 5); g.fillStyle = '#242424'; g.fillRect(hx + 1, GH - 28, 180, 3);
        if (xw > 0) { g.fillStyle = '#80ff20'; g.fillRect(hx + 1, GH - 28, Math.min(180, xw), 2); g.fillStyle = '#4ea80e'; g.fillRect(hx + 1, GH - 26, Math.min(180, xw), 1); }
        if (P.lvl > 0) { const s = String(P.lvl), x = (GW - tw(s)) >> 1, y = GH - 36; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) text(s, x + a, y + b, '#000000', false); text(s, x, y, '#80ff20', false); }
      }
      if (nameT > 0 && held()) { const s = IT[held().id].name, a = Math.min(1, nameT / 10); g.globalAlpha = a; textC(s, GW / 2, GH - (md === 'creative' ? 38 : 59), '#ffffff'); g.globalAlpha = 1; }
      if (titleMsg && now < titleMsg.until) { const a = clamp((titleMsg.until - now) / 500, 0, 1); g.globalAlpha = a; textC(titleMsg.t, GW / 2, GH / 2 - 40, '#ffffff', true, 2); if (titleMsg.s) textC(titleMsg.s, GW / 2, GH / 2 - 16, '#e0e0e0'); g.globalAlpha = 1; }
      if (showF3) {
        const lx = -Math.sin(P.yaw), lz = -Math.cos(P.yaw), L = getL(Math.floor(P.x), Math.floor(P.y), Math.floor(P.z));
        const face = Math.abs(lx) > Math.abs(lz) ? (lx > 0 ? 'east (Towards positive X)' : 'west (Towards negative X)') : (lz > 0 ? 'south (Towards positive Z)' : 'north (Towards negative Z)');
        const B2 = W.gen.BIO[bio(Math.floor(P.x), Math.floor(P.z))] || {};
        const lines = ['Minecraft 26.3 (' + fps + ' fps, ' + W.cols.size + ' chunks)', 'XYZ: ' + P.x.toFixed(3) + ' / ' + (P.y - CFG.YOFF).toFixed(5) + ' / ' + P.z.toFixed(3), 'Block: ' + Math.floor(P.x) + ' ' + (Math.floor(P.y) - CFG.YOFF) + ' ' + Math.floor(P.z), 'Chunk: ' + (Math.floor(P.x) & 15) + ' ' + (Math.floor(P.y) & 15) + ' ' + (Math.floor(P.z) & 15) + ' in ' + (Math.floor(P.x) >> 4) + ' ' + (Math.floor(P.y) >> 4) + ' ' + (Math.floor(P.z) >> 4), 'Facing: ' + face, 'Light: ' + (L >> 4) + ' sky, ' + (L & 15) + ' block', 'Biome: minecraft:' + (B2.n || '').toLowerCase().replace(/ /g, '_'), 'Day ' + Math.floor(W.time / CFG.DAY) + ', time ' + Math.floor(W.time % CFG.DAY), 'Entities: ' + ENTS.length, 'Seed: ' + W.seed, NET.role ? 'Multiplayer: ' + NET.role + ' (' + (playersList().length) + ' players' + (NET.role === 'guest' ? ', ping ' + (api.net.rtt || 0) + ' ms' : '') + ')' : ''];
        if (HIT.b) { const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]]; lines.push('', 'Targeted Block: ' + HIT.x + ', ' + (HIT.y - CFG.YOFF) + ', ' + HIT.z, 'minecraft:' + t.id); for (const [k, vals] of t.props) lines.push(k + ': ' + vals[sv(s, k)]); }
        lines.forEach((l, i) => { if (!l) return; g.fillStyle = 'rgba(80,80,80,.5)'; g.fillRect(1, 1 + i * 9, tw(l) + 2, 9); text(l, 2, 2 + i * 9, '#e0e0e0', false); });
      }
      if (keys.has('Tab') && NET.role && !gui) { const pl = api.net.players || []; const w = 160, x = (GW - w) / 2; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, 10, w, 12 + pl.length * 10); pl.forEach((p, i) => { text(p.name + (p.host ? ' (host)' : ''), x + 4, 14 + i * 10, '#ffffff', false); if (p.ping) textR(p.ping + 'ms', x + w - 4, 14 + i * 10, '#80ff80', false); }); }
    }
    const TABS = [['build', 'Building Blocks', 'bricks'], ['color', 'Colored Blocks', 'cyan_wool'], ['nature', 'Natural Blocks', 'grass_block'], ['func', 'Functional Blocks', 'crafting_table'], ['red', 'Redstone Blocks', 'redstone'], ['search', 'Search Items', 'compass'], ['tools', 'Tools & Utilities', 'diamond_pickaxe'], ['combat', 'Combat', 'netherite_sword'], ['food', 'Food & Drinks', 'golden_apple'], ['ingr', 'Ingredients', 'iron_ingot'], ['eggs', 'Spawn Eggs', 'pig_spawn_egg'], ['inv', 'Survival Inventory', 'chest']];
    let cTab = 'build', cScroll = 0, TABL = null, scIn = [null], scSel = -1, guiBE = null, guiPos = null, drag = null, lastClick = { t: 0, sl: null }, signLines = null, signLine = 0, craftCache = { k: '', r: null };
    function tabList(t) {
      if (!TABL) {
        TABL = {}; for (const [k] of TABS) TABL[k] = [];
        for (const it of IT) { if (!it.tab || it.hidden || it.id === 'air') continue; const set = new Set([it.tab].concat(Array.isArray(it.tabs) ? it.tabs : [])); for (const k of set) if (TABL[k]) TABL[k].push(it.idx); }
      }
      if (t === 'search') { const q = (FIELDV.csearch || '').toLowerCase().trim(); return IT.filter(it => it.tab && it.id !== 'air' && (!q || it.name.toLowerCase().includes(q) || it.id.includes(q.replace(/ /g, '_')))).map(it => it.idx); }
      return TABL[t] || [];
    }
    const INVG = new Set(['inv', 'table', 'furnace', 'chest', 'ender', 'dispenser', 'hopper', 'stonecutter', 'creative']);
    const stackMax = (sl, st) => Math.min(sl.max || 99, IT[st.id].stack);
    function addSlot(arr, i, x, y, o) { const sl = Object.assign({ arr, i, x, y, get: () => arr[i], set: v => { arr[i] = v; } }, o || {}); slots.push(sl); return sl; }
    const armorOk = k => st => { const it = IT[st.id]; return it.armor ? it.armor.slot === k : k === 0 && (it.id === 'carved_pumpkin' || /_head$|_skull$/.test(it.id)); };
    function remainder(id) { const n = IT[id].id; if (n === 'milk_bucket' || n === 'water_bucket' || n === 'lava_bucket' || n === 'powder_snow_bucket') return IN.bucket.idx; if (n === 'honey_bottle' || n === 'dragon_breath') return IN.glass_bottle.idx; return -1; }
    function craftResult(grid, w) {
      const k = grid.map(s => s ? s.id + ':' + (s.d || 0) : '').join(',') + '/' + w;
      if (craftCache.k !== k) { craftCache.k = k; craftCache.r = craftMatch(grid, w); }
      const r = craftCache.r;
      if (!r) return null;
      return { id: r.out, n: r.n, d: r.dmg || 0 };
    }
    function takeCraft(grid) {
      for (let i = 0; i < grid.length; i++) {
        const s = grid[i]; if (!s) continue;
        const rem = remainder(s.id);
        if (--s.n <= 0) grid[i] = rem >= 0 ? { id: rem, n: 1, d: 0 } : null;
        else if (rem >= 0) giveOrDrop({ id: rem, n: 1 });
      }
      craftCache.k = '';
    }
    function playerSlots(ox, oy) {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) addSlot(inv, 9 + r * 9 + c, ox + 8 + c * 18, oy + r * 18, { g: 'main' });
      for (let c = 0; c < 9; c++) addSlot(inv, c, ox + 8 + c * 18, oy + 58, { g: 'hot' });
    }
    function contArr() { return gui === 'ender' ? ender : guiBE && guiBE.items; }
    function layout() {
      slots = [];
      const G2 = gui;
      let pw = 176, ph = 166;
      if (G2 === 'chest' || G2 === 'ender') ph = 168;
      if (G2 === 'hopper') ph = 133;
      if (G2 === 'creative') { pw = 195; ph = 136; }
      const ox = (GW - pw) >> 1, oy = Math.max(cTabH(), (GH - ph) >> 1);
      pRect = [ox, oy, pw, ph];
      if (G2 === 'inv') {
        for (let k = 0; k < 4; k++) addSlot(armor, k, ox + 8, oy + 8 + k * 18, { g: 'armor', acc: armorOk(k), max: 1 });
        addSlot(null, 0, ox + 77, oy + 62, { g: 'off', get: () => offhand, set: v => { offhand = v; } });
        for (let k = 0; k < 4; k++) addSlot(craft2, k, ox + 98 + (k & 1) * 18, oy + 18 + (k >> 1) * 18, { g: 'craft' });
        addSlot(null, 0, ox + 154, oy + 28, { g: 'out', grid: craft2, w: 2, get: () => craftResult(craft2, 2) });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'table') {
        for (let k = 0; k < 9; k++) addSlot(craft3, k, ox + 30 + (k % 3) * 18, oy + 17 + (k / 3 | 0) * 18, { g: 'craft' });
        addSlot(null, 0, ox + 124, oy + 35, { g: 'out', grid: craft3, w: 3, get: () => craftResult(craft3, 3) });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'furnace' && guiBE) {
        const F = guiBE;
        addSlot(F, 'i', ox + 56, oy + 17, { g: 'fin' });
        addSlot(F, 'f', ox + 56, oy + 53, { g: 'ffuel', acc: st => fuelOf(st.id) > 0 });
        addSlot(F, 'o', ox + 116, oy + 35, { g: 'fout', acc: () => false });
        playerSlots(ox, oy + 84);
      } else if ((G2 === 'chest' || G2 === 'ender') && contArr()) {
        const a = contArr();
        for (let k = 0; k < 27; k++) addSlot(a, k, ox + 8 + (k % 9) * 18, oy + 18 + (k / 9 | 0) * 18, { g: 'cont', acc: st => !(guiBE && guiBE.shulker && IT[st.id].block && TN[IT[st.id].block] && TN[IT[st.id].block].shulker) });
        playerSlots(ox, oy + 86);
      } else if (G2 === 'dispenser' && contArr()) {
        for (let k = 0; k < 9; k++) addSlot(contArr(), k, ox + 62 + (k % 3) * 18, oy + 17 + (k / 3 | 0) * 18, { g: 'cont' });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'hopper' && contArr()) {
        for (let k = 0; k < 5; k++) addSlot(contArr(), k, ox + 44 + k * 18, oy + 20, { g: 'cont' });
        playerSlots(ox, oy + 51);
      } else if (G2 === 'stonecutter') {
        addSlot(scIn, 0, ox + 20, oy + 33, { g: 'scin' });
        addSlot(null, 0, ox + 143, oy + 33, { g: 'scout', get: () => { const s = scIn[0], l = s && CUT[s.id]; return l && l[scSel] ? { id: l[scSel][0], n: l[scSel][1], d: 0 } : null; } });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'creative') {
        if (cTab === 'inv') {
          for (let k = 0; k < 4; k++) addSlot(armor, k, ox + 54 + (k >> 1) * 54, oy + 6 + (k & 1) * 27, { g: 'armor', acc: armorOk(k), max: 1 });
          addSlot(null, 0, ox + 35, oy + 20, { g: 'off', get: () => offhand, set: v => { offhand = v; } });
          for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) addSlot(inv, 9 + r * 9 + c, ox + 9 + c * 18, oy + 54 + r * 18, { g: 'main' });
          addSlot(null, 0, ox + 173, oy + 112, { g: 'trash', get: () => null, set: () => { } });
        } else {
          const L = tabList(cTab), rowsN = Math.ceil(L.length / 9);
          cScroll = clamp(cScroll, 0, Math.max(0, rowsN - 5));
          for (let k = 0; k < 45; k++) { const id = L[cScroll * 9 + k]; if (id === undefined) break; addSlot(null, 0, ox + 9 + (k % 9) * 18, oy + 18 + (k / 9 | 0) * 18, { g: 'cre', get: () => ({ id, n: 1, d: 0 }), set: () => { } }); }
        }
        for (let c = 0; c < 9; c++) addSlot(inv, c, ox + 9 + c * 18, oy + 112, { g: 'hot' });
      }
      return [ox, oy, pw, ph];
    }
    const cTabH = () => gui === 'creative' ? 30 : 4;
    function slotAt(x, y) { for (const sl of slots) if (x >= sl.x - 1 && y >= sl.y - 1 && x < sl.x + 17 && y < sl.y + 17) return sl; return null; }
    function moveInto(st, list, rev) {
      if (!st) return null;
      const ms = IT[st.id].stack, L = rev ? list.slice().reverse() : list;
      for (const sl of L) { if (st.n <= 0) break; const t = sl.get(); if (t && sameSt(t, st) && t.n < stackMax(sl, st)) { const m = Math.min(stackMax(sl, st) - t.n, st.n); t.n += m; st.n -= m; } }
      for (const sl of L) { if (st.n <= 0) break; if (!sl.get() && (!sl.acc || sl.acc(st))) { const m = Math.min(stackMax(sl, st), st.n, ms); sl.set({ id: st.id, n: m, d: st.d || 0, x: st.x }); st.n -= m; } }
      return st.n > 0 ? st : null;
    }
    function quickMove(sl) {
      const st = sl.get(); if (!st) return;
      const G2 = sl.g, by = g2 => slots.filter(s => s.g === g2), pl = by('main').concat(by('hot'));
      let rest = { ...st };
      if (G2 === 'cre') { giveItem({ id: st.id, n: IT[st.id].stack }); return; }
      if (G2 === 'cont' || G2 === 'fin' || G2 === 'ffuel' || G2 === 'fout' || G2 === 'craft' || G2 === 'armor' || G2 === 'off' || G2 === 'scin') {
        rest = moveInto(rest, G2 === 'craft' || G2 === 'armor' || G2 === 'off' || gui === 'inv' ? by('main').concat(by('hot')) : pl, gui !== 'inv' && G2 !== 'craft' && G2 !== 'armor' && G2 !== 'off');
        if (G2 === 'fout' && guiBE && guiBE.xp >= 1) { addXp(Math.floor(guiBE.xp)); guiBE.xp -= Math.floor(guiBE.xp); }
      } else if (G2 === 'main' || G2 === 'hot') {
        const it = IT[st.id];
        const cont = by('cont');
        if (cont.length) rest = moveInto(rest, cont);
        else if (gui === 'furnace') { if (SMELT[st.id]) rest = moveInto(rest, by('fin')); else if (fuelOf(st.id)) rest = moveInto(rest, by('ffuel')); else rest = moveInto(rest, by(G2 === 'main' ? 'hot' : 'main')); }
        else if (gui === 'stonecutter' && CUT[st.id]) rest = moveInto(rest, by('scin'));
        else if ((gui === 'inv' || gui === 'creative') && it.armor && !armor[it.armor.slot]) rest = moveInto(rest, by('armor'));
        else if (gui === 'inv' && it.shield && !offhand) rest = moveInto(rest, by('off'));
        else rest = moveInto(rest, by(G2 === 'main' ? 'hot' : 'main'));
      } else if (G2 === 'trash') return;
      sl.set(rest);
    }
    function takeOutput(sl, shift) {
      for (let guard = 0; guard < 64; guard++) {
        const res = sl.get(); if (!res) return;
        if (shift) { const left = moveInto({ ...res }, slots.filter(s => s.g === 'main' || s.g === 'hot'), true); if (left && left.n === res.n) return; if (left) giveOrDrop(left); }
        else { if (cursor && (!sameSt(cursor, res) || cursor.n + res.n > IT[res.id].stack)) return; if (cursor) cursor.n += res.n; else cursor = { ...res }; }
        if (sl.g === 'out') takeCraft(sl.grid);
        else if (sl.g === 'scout') { if (--scIn[0].n <= 0) { scIn[0] = null; scSel = -1; } }
        snd(sl.g === 'scout' ? 'stonecutter' : 'pop');
        if (!shift) return;
      }
    }
    function slotClick(sl, btn, shift) {
      if (sl.g === 'out' || sl.g === 'scout') { takeOutput(sl, shift); return; }
      if (sl.g === 'trash') { if (cursor) cursor = null; else if (shift) { inv.fill(null); armor.fill(null); offhand = null; } return; }
      if (sl.g === 'cre') {
        const st = sl.get();
        if (cursor) { if (sameSt(cursor, st) && btn === 0) cursor.n = Math.min(IT[st.id].stack, cursor.n + 1); else cursor = null; return; }
        if (shift) { quickMove(sl); return; }
        cursor = { id: st.id, n: btn === 1 ? IT[st.id].stack : 1, d: 0 }; return;
      }
      if (shift) { quickMove(sl); afterClick(); return; }
      const st = sl.get();
      if (btn === 1 && creative() && st && !cursor) { cursor = { ...st, n: IT[st.id].stack }; return; }
      if (sl.g === 'fout') {
        if (!st) return;
        if (!cursor) { cursor = st; sl.set(null); } else if (sameSt(cursor, st) && cursor.n + st.n <= IT[st.id].stack) { cursor.n += st.n; sl.set(null); } else return;
        if (guiBE && guiBE.xp >= 1) { addXp(Math.floor(guiBE.xp)); guiBE.xp -= Math.floor(guiBE.xp); }
        afterClick(); return;
      }
      const ok = c => !sl.acc || sl.acc(c);
      if (btn === 0) {
        if (!cursor && st) { cursor = st; sl.set(null); }
        else if (cursor && !st) { if (ok(cursor)) { const m = Math.min(cursor.n, stackMax(sl, cursor)); sl.set({ ...cursor, n: m }); cursor.n -= m; if (cursor.n <= 0) cursor = null; } }
        else if (cursor && st) {
          if (sameSt(cursor, st)) { const m = Math.min(cursor.n, stackMax(sl, st) - st.n); if (m > 0) { st.n += m; cursor.n -= m; if (cursor.n <= 0) cursor = null; } }
          else if (ok(cursor) && cursor.n <= stackMax(sl, cursor)) { sl.set(cursor); cursor = st; }
        }
      } else {
        if (!cursor && st) { const h = Math.ceil(st.n / 2); cursor = { ...st, n: h }; st.n -= h; if (st.n <= 0) sl.set(null); }
        else if (cursor && !st) { if (ok(cursor)) { sl.set({ ...cursor, n: 1 }); if (--cursor.n <= 0) cursor = null; } }
        else if (cursor && st) {
          if (sameSt(cursor, st)) { if (st.n < stackMax(sl, st)) { st.n++; if (--cursor.n <= 0) cursor = null; } }
          else if (ok(cursor) && cursor.n <= stackMax(sl, cursor)) { sl.set(cursor); cursor = st; }
        }
      }
      if (sl.g === 'scin') scSel = -1;
      afterClick();
    }
    function collectAll() {
      if (!cursor) return;
      const ms = IT[cursor.id].stack;
      for (const pass of [0, 1]) for (const sl of slots) {
        if (cursor.n >= ms) return;
        if (sl.g === 'out' || sl.g === 'cre' || sl.g === 'trash' || sl.g === 'scout') continue;
        const st = sl.get(); if (!st || !sameSt(st, cursor)) continue;
        if (pass === 0 && st.n >= ms) continue;
        const m = Math.min(ms - cursor.n, st.n); cursor.n += m; st.n -= m; if (st.n <= 0) sl.set(null);
      }
      afterClick();
    }
    function afterClick() { if (guiBE && guiPos) beChanged(guiPos[0], guiPos[1], guiPos[2]); }
    function invDown(btn, shift) {
      if (!INVG.has(gui)) return false;
      const [ox, oy, pw, ph] = pRect;
      if (gui === 'creative') {
        const t = creativeTabAt(mx, my); if (t) { cTab = t; cScroll = 0; if (t === 'search') { FIELDV.csearch = FIELDV.csearch || ''; focusField('csearch', FIELDV.csearch, 50); } else blurField(); return true; }
        if (cTab !== 'inv' && mx >= ox + 174 && mx < ox + 188 && my >= oy + 17 && my < oy + 129) { const rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = Math.round(clamp((my - oy - 18) / 110, 0, 1) * Math.max(0, rowsN - 5)); drag = { scroll: 1 }; return true; }
      }
      if (gui === 'stonecutter' && scIn[0] && CUT[scIn[0].id]) {
        const L = CUT[scIn[0].id];
        for (let k = 0; k < Math.min(12, L.length); k++) { const bx2 = ox + 52 + (k % 4) * 16, by2 = oy + 15 + (k / 4 | 0) * 18; if (mx >= bx2 && my >= by2 && mx < bx2 + 16 && my < by2 + 18) { scSel = k; snd('click'); return true; } }
      }
      const sl = slotAt(mx, my);
      if (!sl) {
        const out = mx < ox || my < oy - (gui === 'creative' ? 28 : 0) || mx >= ox + pw || my >= oy + ph + (gui === 'creative' ? 28 : 0);
        if (out && cursor) { if (btn === 0) { throwStack(cursor, true); cursor = null; } else { throwStack({ ...cursor, n: 1 }, true); if (--cursor.n <= 0) cursor = null; } }
        return true;
      }
      const now = performance.now();
      if (btn === 0 && !shift && lastClick.sl && lastClick.sl.arr === sl.arr && lastClick.sl.i === sl.i && now - lastClick.t < 300 && cursor && sl.g !== 'cre') { collectAll(); lastClick.t = 0; return true; }
      lastClick = { t: now, sl };
      if (cursor && !shift && btn !== 1 && (sl.g === 'main' || sl.g === 'hot' || sl.g === 'cont' || sl.g === 'craft' || sl.g === 'fin' || sl.g === 'ffuel')) { drag = { btn, list: [sl] }; return true; }
      slotClick(sl, btn, shift);
      return true;
    }
    function invMove() {
      if (!drag) return;
      if (drag.scroll) { const [, oy] = pRect, rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = Math.round(clamp((my - oy - 18) / 110, 0, 1) * Math.max(0, rowsN - 5)); return; }
      const sl = slotAt(mx, my);
      if (!sl || drag.list.includes(sl) || !cursor) return;
      if (!(sl.g === 'main' || sl.g === 'hot' || sl.g === 'cont' || sl.g === 'craft' || sl.g === 'fin' || sl.g === 'ffuel')) return;
      const st = sl.get();
      if (st && !sameSt(st, cursor)) return;
      if (sl.acc && !sl.acc(cursor)) return;
      if (drag.list.length >= cursor.n && drag.btn === 0) return;
      drag.list.push(sl);
    }
    function invUp() {
      const d = drag; drag = null;
      if (!d || d.scroll) return;
      if (d.list.length <= 1) { slotClick(d.list[0], d.btn, false); return; }
      if (!cursor) return;
      const per = d.btn === 0 ? Math.floor(cursor.n / d.list.length) : 1;
      for (const sl of d.list) {
        if (!cursor || cursor.n <= 0) break;
        const st = sl.get(), room = stackMax(sl, cursor) - (st ? st.n : 0), m = Math.min(per, room, cursor.n);
        if (m <= 0) continue;
        if (st) st.n += m; else sl.set({ ...cursor, n: m });
        cursor.n -= m;
      }
      if (cursor && cursor.n <= 0) cursor = null;
      afterClick();
    }
    function invKey(code) {
      if (!INVG.has(gui)) return false;
      const sl = hovSlot;
      const m = /^Digit([1-9])$/.exec(code);
      if (m && sl && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash') {
        const k = +m[1] - 1;
        if (sl.g === 'cre') { inv[k] = { id: sl.get().id, n: IT[sl.get().id].stack, d: 0 }; return true; }
        if (sl.arr === inv && sl.i === k) return true;
        const a = sl.get(), b = inv[k];
        if (b && sl.acc && !sl.acc(b)) return true;
        sl.set(b); inv[k] = a; afterClick(); return true;
      }
      if (code === KB.drop && sl && sl.get() && sl.g !== 'cre' && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash') {
        const st = sl.get(), all = keys.has('ControlLeft') || keys.has('MetaLeft');
        if (all) { throwStack(st, true); sl.set(null); } else { throwStack({ ...st, n: 1 }, true); if (--st.n <= 0) sl.set(null); }
        afterClick(); return true;
      }
      if (code === KB.swap && sl && sl.g !== 'cre' && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash' && sl.g !== 'off') { const a = sl.get(); sl.set(offhand); offhand = a; afterClick(); return true; }
      return false;
    }
    function invWheel(dy) { if (gui === 'creative' && cTab !== 'inv') { const rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = clamp(cScroll + (dy > 0 ? 1 : -1), 0, Math.max(0, rowsN - 5)); return true; } return false; }
    function creativeTabAt(x, y) {
      const [ox, oy, pw, ph] = pRect;
      for (let k = 0; k < TABS.length; k++) { const top = k < 6, i = top ? k : k - 6, tx = ox + i * 29 + (i === 5 ? pw - 6 * 29 - 1 : 0), ty = top ? oy - 28 : oy + ph; if (x >= tx && x < tx + 28 && y >= ty && y < ty + 28) return TABS[k][0]; }
      return null;
    }
    function drawCreativeTabs(sel2) {
      const [ox, oy, pw, ph] = pRect;
      for (let k = 0; k < TABS.length; k++) {
        const [id, , icon] = TABS[k], top = k < 6, i = top ? k : k - 6, tx = ox + i * 29 + (i === 5 ? pw - 6 * 29 - 1 : 0), ty = top ? oy - 28 : oy + ph, on = id === cTab;
        if (on !== sel2) continue;
        g.fillStyle = '#000'; g.fillRect(tx, ty + (top ? 0 : -2), 28, 30);
        g.fillStyle = on ? '#c6c6c6' : '#8b8b8b'; g.fillRect(tx + 1, ty + (top ? 1 : -2), 26, 29);
        g.fillStyle = on ? '#fff' : '#a8a8a8'; g.fillRect(tx + 1, ty + (top ? 1 : 0), 2, 26);
        g.fillStyle = on ? '#555' : '#555'; g.fillRect(tx + 25, ty + (top ? 1 : 0), 2, 26);
        if (IN[icon]) drawItem({ id: IN[icon].idx, n: 1 }, tx + 6, ty + (top ? 8 : 4), true);
        if (inR(mx, my, { x: tx, y: ty, w: 28, h: 28 })) TIPQ = [[TABS[k][1], '#ffffff']];
      }
    }
    let TIPQ = null;
    function drawSlotBg(sl) { frame(sl.x, sl.y, 18); }
    function drawInv(now) {
      const [ox, oy, pw, ph] = layout();
      TIPQ = null;
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      if (gui === 'creative') drawCreativeTabs(false);
      panel(ox, oy, pw, ph);
      const T = (s, x, y) => text(s, ox + x, oy + y, '#404040', false);
      if (gui === 'inv') {
        T('Crafting', 97, 8);
        g.fillStyle = '#000'; g.fillRect(ox + 25, oy + 7, 52, 72); g.fillStyle = '#2a2a2a'; g.fillRect(ox + 26, oy + 8, 50, 70);
        drawPlayerModel(ox + 51, oy + 24, 1.7);
        arrowGlyph(ox + 135, oy + 29, 0);
      } else if (gui === 'table') { T('Crafting', 28, 6); arrowGlyph(ox + 90, oy + 35, 0); }
      else if (gui === 'furnace' && guiBE) {
        T(guiBE.kind === 'blast_furnace' ? 'Blast Furnace' : guiBE.kind === 'smoker' ? 'Smoker' : 'Furnace', 60, 6);
        const F = guiBE, fl = F.b > 0 && F.bm ? F.b / F.bm : 0;
        g.drawImage(I.flU, ox + 57, oy + 37);
        if (fl > 0) { const hh = Math.ceil(14 * fl); g.drawImage(I.flL, 0, 14 - hh, 14, hh, ox + 57, oy + 37 + 14 - hh, 14, hh); }
        arrowGlyph(ox + 79, oy + 34, F.ct ? F.c / F.ct : 0);
      } else if (gui === 'chest' || gui === 'ender') T(gui === 'ender' ? 'Ender Chest' : guiBE && guiBE.title || 'Chest', 8, 6);
      else if (gui === 'dispenser') T(guiBE && guiBE.title || 'Dispenser', 62, 6);
      else if (gui === 'hopper') T('Hopper', 8, 6);
      else if (gui === 'stonecutter') {
        T('Stonecutter', 8, 4);
        g.fillStyle = '#8b8b8b'; g.fillRect(ox + 52, oy + 14, 64, 56);
        const L = scIn[0] && CUT[scIn[0].id];
        if (L) for (let k = 0; k < Math.min(12, L.length); k++) {
          const bx2 = ox + 52 + (k % 4) * 16, by2 = oy + 15 + (k / 4 | 0) * 18, hv = mx >= bx2 && my >= by2 && mx < bx2 + 16 && my < by2 + 18;
          g.fillStyle = k === scSel ? '#5a8a5a' : hv ? '#d0d0d0' : '#a8a8a8'; g.fillRect(bx2, by2, 16, 18); ring(bx2, by2, 16, 18, 1, '#555');
          drawItem({ id: L[k][0], n: L[k][1] }, bx2, by2 + 1);
          if (hv) TIPQ = itemTip({ id: L[k][0], n: 1 });
        }
      } else if (gui === 'creative') {
        const tab = TABS.find(t => t[0] === cTab);
        T(tab ? tab[1] : '', 8, 6);
        if (cTab === 'search') { const v = FIELDV.csearch || ''; field('csearch', ox + 82, oy + 4, 89, 11, v, 'Search...', null, 50); if (focusKey === 'csearch') FIELDV.csearch = inp.value; }
        if (cTab !== 'inv') {
          const rowsN = Math.ceil(tabList(cTab).length / 9), mxs = Math.max(0, rowsN - 5);
          g.fillStyle = '#000'; g.fillRect(ox + 174, oy + 17, 14, 112); g.fillStyle = '#8b8b8b'; g.fillRect(ox + 175, oy + 18, 12, 110);
          const ty = oy + 18 + (mxs ? cScroll / mxs : 0) * 95;
          g.fillStyle = mxs ? '#c6c6c6' : '#9a9a9a'; g.fillRect(ox + 175, ty, 12, 15); g.fillStyle = '#fff'; g.fillRect(ox + 175, ty, 11, 1); g.fillRect(ox + 175, ty, 1, 14); g.fillStyle = '#555'; g.fillRect(ox + 176, ty + 14, 11, 1); g.fillRect(ox + 186, ty + 1, 1, 14);
        } else {
          g.fillStyle = '#000'; g.fillRect(ox + 72, oy + 5, 34, 45); g.fillStyle = '#2a2a2a'; g.fillRect(ox + 73, oy + 6, 32, 43);
          drawPlayerModel(ox + 89, oy + 16, 1);
        }
      }
      for (const sl of slots) {
        if (sl.g === 'trash') { frame(sl.x, sl.y, 18); g.strokeStyle = '#a03030'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sl.x + 3, sl.y + 3); g.lineTo(sl.x + 13, sl.y + 13); g.moveTo(sl.x + 13, sl.y + 3); g.lineTo(sl.x + 3, sl.y + 13); g.stroke(); continue; }
        if (sl.g === 'out' || sl.g === 'scout' || sl.g === 'fout') { g.fillStyle = '#373737'; g.fillRect(sl.x - 5, sl.y - 5, 26, 26); g.fillStyle = '#fff'; g.fillRect(sl.x - 4, sl.y - 4, 25, 25); g.fillStyle = '#8b8b8b'; g.fillRect(sl.x - 4, sl.y - 4, 24, 24); }
        else drawSlotBg(sl);
        const st = sl.get();
        if (!st && sl.g === 'armor') { g.globalAlpha = .35; g.drawImage(I.aC, sl.x + 4, sl.y + 4); g.globalAlpha = 1; }
        if (!st && sl.g === 'off') { g.fillStyle = 'rgba(60,60,60,.4)'; g.fillRect(sl.x + 4, sl.y + 2, 8, 11); }
        drawItem(st, sl.x, sl.y);
        if (drag && drag.list && drag.list.includes(sl)) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(sl.x, sl.y, 16, 16); }
      }
      if (gui === 'creative') drawCreativeTabs(true);
      hovSlot = slotAt(mx, my);
      if (hovSlot && !touch) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(hovSlot.x, hovSlot.y, 16, 16); drawItem(hovSlot.get(), hovSlot.x, hovSlot.y); }
      if (cursor) drawItem(cursor, mx - 8, my - 8);
      else if (hovSlot && hovSlot.get()) TIPQ = itemTip(hovSlot.get());
      if (TIPQ && !cursor) tooltip(TIPQ, mx + 10, my - 12);
      void now;
    }
    function arrowGlyph(x, y, f) { g.drawImage(I.arB, x, y); if (f > 0) { const w = Math.ceil(24 * f); g.drawImage(I.arF, 0, 0, w, 17, x, y, w, 17); } }
    function openGui(name) {
      if (name === 'inv' && creative()) name = 'creative';
      gui = name; guiBE = null; guiPos = null; cursor = cursor || null; drag = null; craftCache.k = '';
      if (name === 'stonecutter') { scIn[0] = null; scSel = -1; }
      releaseMouse();
    }
    function openContainer(x, y, z, kind) {
      const s = getS(x, y, z), t = TT[STT[s]];
      let be = beAt(x, y, z, false);
      if (!be) { initBlockEntity(x, y, z, t, null); be = beAt(x, y, z, true); }
      if (kind === 'furnace' && be.kind === undefined) Object.assign(be, { i: null, f: null, o: null, b: 0, bm: 0, c: 0, xp: 0, kind: t.fkind || 'furnace' });
      if (kind !== 'furnace' && !be.items) be.items = new Array(t.cont || 27).fill(null);
      if (t.shulker) be.shulker = 1;
      be.title = t.cont === 27 && !t.id.includes('chest') && !t.shulker ? t.name : t.shulker ? 'Shulker Box' : t.id === 'dropper' ? 'Dropper' : t.id === 'dispenser' ? 'Dispenser' : t.id.includes('chest') ? (t.id === 'trapped_chest' ? 'Chest' : t.name) : t.name;
      gui = kind; guiBE = be; guiPos = [x, y, z]; drag = null;
      if (NET.role === 'guest') netSend({ t: 'beget', k: bk(x, y, z) });
      viewing(bk(x, y, z), true);
      releaseMouse();
    }
    function openSign(x, y, z) {
      let be = beAt(x, y, z, true);
      if (!be.text) be.text = ['', '', '', ''];
      gui = 'sign'; guiBE = be; guiPos = [x, y, z]; signLines = be.text.slice(); signLine = 0;
      releaseMouse();
      focusField('sign', signLines[0], 15);
    }
    function closeGui(keepMouse) {
      if (!gui) return;
      uiT = performance.now();
      if (gui === 'sign' && guiBE) { if (focusKey === 'sign') signLines[signLine] = inp.value.slice(0, 15); guiBE.text = signLines.slice(); afterClick(); signDirty = true; }
      if (INVG.has(gui)) {
        for (const a of [craft2, craft3, scIn]) for (let i = 0; i < a.length; i++) if (a[i]) { giveOrDrop(a[i]); a[i] = null; }
        if (cursor) { giveOrDrop(cursor); cursor = null; }
      }
      if (guiPos) { const [x, y, z] = guiPos, s = getS(x, y, z); if (isT(s, 'barrel') && sv(s, 'open')) setBlock(x, y, z, sw(s, 'open', 0)); if (gui === 'chest' || gui === 'ender') snd('chest_close', { x, y, z }); afterClick(); viewing(bk(x, y, z), false); }
      if (gui === 'ender') snd('chest_close');
      gui = null; guiBE = null; guiPos = null; drag = null; hovSlot = null;
      blurField();
      if (!keepMouse && scr === 'game') lockMouse();
    }
    let signDirty = true;
    function drawSign() {
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      textC('Edit Sign Message', GW / 2, 20, '#ffffff');
      const w = 104, x = (GW - w) >> 1, y = 44;
      const s = guiPos ? getS(guiPos[0], guiPos[1], guiPos[2]) : 0, t = TT[STT[s]], tl = t && TIL[t.base * 6 + 4] >= 0 ? TIL[t.base * 6 + 4] : 0, col = tileAvg(tl);
      g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; g.fillRect(x, y, w, 56); ring(x, y, w, 56, 1, 'rgba(0,0,0,.5)');
      if (!/hanging/.test(t ? t.id : '')) { g.fillStyle = `rgb(${col[0] * .6 | 0},${col[1] * .6 | 0},${col[2] * .6 | 0})`; g.fillRect(x + w / 2 - 4, y + 56, 8, 40); }
      if (focusKey === 'sign') signLines[signLine] = inp.value.slice(0, 15);
      for (let i = 0; i < 4; i++) {
        const v = signLines[i] + (i === signLine && (performance.now() / 300 | 0) % 2 ? '_' : '');
        textC(v, GW / 2, y + 6 + i * 12, '#000000', false);
        if (inR(mx, my, { x, y: y + 4 + i * 12, w, h: 12 })) { }
      }
      fields.push({ key: 'sign', x, y: y + 4 + signLine * 12, w, h: 12, maxLen: 15, onEnter: () => { signLine = (signLine + 1) % 4; focusField('sign', signLines[signLine], 15); } });
      button(GW / 2 - 100, GH - 40, 200, 20, 'Done', () => closeGui());
      for (let i = 0; i < 4; i++) btns.push({ x, y: y + 4 + i * 12, w, h: 12, en: true, fn: () => { signLines[signLine] = inp.value.slice(0, 15); signLine = i; focusField('sign', signLines[i], 15); } });
    }
    let worldsMeta = [], worldsLoaded = false, selWorld = -1, wScroll = 0, mpMode = null, loadMsg = '', loadP = 0, discMsg = '', confirmDel = null, optBack = 'title', ctrlWait = null, ctrlScroll = 0;
    let sliders = [], activeSlider = null;
    const GMODES = ['survival', 'hardcore', 'creative', 'adventure'], GMN = { survival: 'Survival', hardcore: 'Hardcore', creative: 'Creative', adventure: 'Adventure', spectator: 'Spectator' };
    const DIFFN = ['Peaceful', 'Easy', 'Normal', 'Hard'], WTYPES = ['default', 'flat', 'large', 'amplified'], WTN = { default: 'Default', flat: 'Superflat', large: 'Large Biomes', amplified: 'Amplified' };
    const RULES = [['keepInventory', 'Keep inventory after death', false], ['doDaylightCycle', 'Advance time of day', true], ['doWeatherCycle', 'Update weather', true], ['doMobSpawning', 'Spawn mobs', true], ['mobGriefing', 'Allow destructive mob actions', true], ['doFireTick', 'Spread and extinguish fire', true], ['naturalRegeneration', 'Regenerate health', true], ['doTileDrops', 'Drop blocks', true], ['doMobLoot', 'Drop mob loot', true], ['fallDamage', 'Fall damage', true], ['doImmediateRespawn', 'Respawn immediately', false], ['showCoordinates', 'Show coordinates', false]];
    const defRules = () => { const r = {}; for (const [k, , v] of RULES) r[k] = v; r.randomTickSpeed = 3; return r; };
    let CW = null;
    function newCW(base) {
      CW = { tab: 0, name: 'New World', mode: 'survival', diff: 2, cheats: false, type: 'default', seed: '', bonus: false, structures: true, rules: defRules() };
      if (base) Object.assign(CW, { name: base.name, mode: base.hardcore ? 'hardcore' : base.mode, diff: base.diff, cheats: base.cheats, type: base.type, seed: String(base.seed), rules: Object.assign(defRules(), base.rules || {}) });
      FIELDV.wname = CW.name; FIELDV.wseed = CW.seed;
    }
    const javaHash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(h, 31) + s.charCodeAt(i) | 0; return h; };
    const parseSeed = s => { s = String(s || '').trim(); if (!s) return (Math.random() * 4294967296 | 0); if (/^-?\d+$/.test(s) && Math.abs(+s) < 2147483648) return +s | 0; return javaHash(s); };
    function loadProfile() { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); return p && typeof p === 'object' ? p : {}; } catch (e) { return {}; } }
    function saveProfile(name) { try { const p = loadProfile(); p.username = name; if (!p.displayName) p.displayName = name; localStorage.setItem('gameplay:profile', JSON.stringify(p)); } catch (e) { } }
    const validName = n => /^[A-Za-z0-9_]{3,16}$/.test(n || '');
    function myName() { const p = loadProfile(); return validName(p.username) ? p.username : (p.username ? String(p.username).replace(/[^A-Za-z0-9_]/g, '').slice(0, 16) : '') || 'Player'; }
    function slider(x, y, w, label, f, set) {
      x |= 0; y |= 0; const h = touch ? 24 : 20;
      g.drawImage(BT[2], 0, 0, w >> 1, 20, x, y, w >> 1, h); g.drawImage(BT[2], 200 - (w - (w >> 1)), 0, w - (w >> 1), 20, x + (w >> 1), y, w - (w >> 1), h);
      const kx = x + Math.round(f * (w - 8)), hov = !touch && mx >= x && my >= y && mx < x + w && my < y + h, t = BT[hov || activeSlider && activeSlider.x === x && activeSlider.y === y ? 1 : 0];
      g.drawImage(t, 0, 0, 4, 20, kx, y, 4, h); g.drawImage(t, 196, 0, 4, 20, kx + 4, y, 4, h);
      textC(label, x + w / 2, y + (h - 8) / 2, '#e0e0e0');
      sliders.push({ x, y, w, h, set });
    }
    function drawTitleBg() {
      if (!panoReady) drawDirt(0);
      else { const gr = g.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(0, 0, GW, GH); }
    }
    function drawLogo(y) {
      const lw = Math.min(GW - 20, 274), k = lw / LOGO.width, lh = LOGO.height * k, lx = (GW - lw) / 2;
      g.drawImage(LOGO, lx, y, lw, lh);
      const ew = Math.min(lw * .45, 100), eh = ew * EDITION.height / EDITION.width;
      g.drawImage(EDITION, (GW - ew) / 2, y + lh - 4, ew, eh);
      textC('JAVA EDITION', GW / 2, y + lh - 4 + (eh - 8) / 2, '#f0d8a8', true);
      return y + lh + eh;
    }
    function drawTitle(now) {
      drawTitleBg();
      const by = Math.max(drawLogo(Math.max(8, GH / 4 - 50 | 0)) + 12, GH / 4 + 36 | 0);
      g.save(); g.translate(GW / 2 + Math.min(130, GW / 2 - 40), Math.max(50, GH / 4 - 4)); g.rotate(-20 * Math.PI / 180);
      const sc = 1.8 - Math.abs(Math.sin((now % 1000) / 1000 * Math.PI * 2)) * .1, sw2 = tw(SPLASH);
      const k = Math.min(sc, (GW / 2 - 10) / Math.max(1, sw2)); g.scale(k, k); textC(SPLASH, 0, -4, '#ffff00'); g.restore();
      const step = touch ? 28 : 24;
      button(GW / 2 - 100, by, 200, 20, 'Singleplayer', () => { mpMode = null; goWorlds(); });
      button(GW / 2 - 100, by + step, 200, 20, ['Multiplayer (LAN / Online)', 'Multiplayer'], () => { scr = 'mp'; FIELDV.uname = FIELDV.uname || (validName(loadProfile().username) ? loadProfile().username : ''); });
      button(GW / 2 - 100, by + step * 2 + 12, 98, 20, 'Options...', () => { optBack = 'title'; scr = 'options'; });
      button(GW / 2 + 2, by + step * 2 + 12, 98, 20, 'Controls...', () => { optBack = 'title'; scr = 'controls'; });
      const l1 = 'Minecraft Java Edition 26.3', l2 = 'Fan remake. Not an official Minecraft product.';
      if (tw(l1) + tw(l2) + 12 < GW) { text(l1, 2, GH - 10, '#ffffff'); textR(l2, GW - 2, GH - 10, '#ffffff'); }
      else { text(l1, 2, GH - 20, '#ffffff'); textR(tw(l2) < GW - 4 ? l2 : 'Not an official Minecraft product.', GW - 2, GH - 10, '#ffffff'); }
    }
    function goWorlds() { scr = 'worlds'; selWorld = -1; wScroll = 0; worldsLoaded = false; listWorlds().then(l => { worldsMeta = l; worldsLoaded = true; if (l.length) selWorld = 0; }); }
    function drawWorlds() {
      drawDirt(0);
      textC(mpMode === 'host' ? 'Select World to Host' : 'Select World', GW / 2, 8, '#ffffff');
      const top = 24, bot = GH - (touch ? 64 : 56), rowH = 36, lw = Math.min(270, GW - 20), lx = (GW - lw) >> 1;
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, top, GW, bot - top);
      g.fillStyle = '#000'; g.fillRect(0, top, GW, 1); g.fillRect(0, bot - 1, GW, 1);
      const maxS = Math.max(0, worldsMeta.length * rowH - (bot - top - 8));
      wScroll = clamp(wScroll, 0, maxS);
      g.save(); g.beginPath(); g.rect(0, top, GW, bot - top); g.clip();
      if (!worldsLoaded) textC('Loading...', GW / 2, top + 20, '#a0a0a0');
      else if (!worldsMeta.length) textC('No worlds yet. Create a new world to start playing!', GW / 2, top + 20, '#a0a0a0');
      worldsMeta.forEach((w, i) => {
        const y = top + 4 + i * rowH - wScroll;
        if (y + rowH < top || y > bot) return;
        if (i === selWorld) { g.fillStyle = '#808080'; g.fillRect(lx - 2, y - 2, lw + 4, rowH); g.fillStyle = '#000'; g.fillRect(lx - 1, y - 1, lw + 2, rowH - 2); }
        const ic = cv(1, 1); void ic;
        g.fillStyle = w.mode === 'creative' ? '#3a7a3a' : w.hardcore ? '#7a1a1a' : '#5d4a2a'; g.fillRect(lx + 1, y + 1, 30, 30);
        drawItem({ id: (IN[w.mode === 'creative' ? 'grass_block' : w.hardcore ? 'wither_skeleton_skull' : 'oak_log'] || IN.grass_block).idx, n: 1 }, lx + 8, y + 8, true);
        text(w.name, lx + 35, y + 2, '#ffffff');
        const d = new Date(w.last || w.created || 0), p2 = n => (n < 10 ? '0' : '') + n;
        text((w.folder || w.name) + ' (' + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ')', lx + 35, y + 12, '#808080');
        text((w.hardcore ? 'Hardcore Mode!' : GMN[w.mode] + ' Mode') + (w.cheats ? ', Cheats' : '') + ', Version: 26.3', lx + 35, y + 22, w.hardcore ? '#ff5555' : '#808080');
        btns.push({ x: lx - 2, y: Math.max(y - 2, top), w: lw + 4, h: Math.min(rowH, bot - Math.max(y - 2, top)), en: true, fn: () => { if (selWorld === i && performance.now() - (w._clk || 0) < 400) playSel(); selWorld = i; w._clk = performance.now(); } });
      });
      g.restore();
      const has = selWorld >= 0 && selWorld < worldsMeta.length, step = touch ? 28 : 24, y0 = GH - (touch ? 58 : 52);
      const bw = Math.min(150, (GW - 12) / 2 | 0);
      button(GW / 2 - bw - 2, y0, bw, 20, mpMode === 'host' ? 'Host Selected World' : 'Play Selected World', playSel, has);
      button(GW / 2 + 2, y0, bw, 20, 'Create New World', () => { newCW(); scr = 'create'; });
      const qw = Math.min(72, (GW - 16) / 4 | 0);
      button(GW / 2 - qw * 2 - 6, y0 + step, qw, 20, 'Edit', () => { FIELDV.ename = worldsMeta[selWorld].name; scr = 'edit'; }, has);
      button(GW / 2 - qw - 2, y0 + step, qw, 20, 'Delete', () => { confirmDel = worldsMeta[selWorld]; scr = 'delete'; }, has);
      button(GW / 2 + 2, y0 + step, qw, 20, 'Re-Create', () => { newCW(worldsMeta[selWorld]); scr = 'create'; }, has);
      button(GW / 2 + qw + 6, y0 + step, qw, 20, 'Back', () => { scr = mpMode ? 'mp' : 'title'; });
    }
    function playSel() { const w = worldsMeta[selWorld]; if (!w) return; openWorld(w.id, mpMode === 'host'); }
    function drawDelete() {
      drawDirt(0);
      textC('Are you sure you want to delete this world?', GW / 2, GH / 2 - 40, '#ffffff');
      textC("'" + (confirmDel ? confirmDel.name : '') + "' will be lost forever! (A long time!)", GW / 2, GH / 2 - 26, '#a0a0a0');
      button(GW / 2 - 154, GH / 2 + 10, 150, 20, 'Delete', () => { const w = confirmDel; confirmDel = null; deleteWorld(w.id).then(goWorlds); });
      button(GW / 2 + 4, GH / 2 + 10, 150, 20, 'Cancel', () => { scr = 'worlds'; });
    }
    function drawEdit() {
      drawDirt(0);
      textC('Edit World', GW / 2, 20, '#ffffff');
      text('World Name', GW / 2 - 100, 50, '#a0a0a0');
      field('ename', GW / 2 - 100, 62, 200, 20, FIELDV.ename || '', '', null, 32);
      const w = worldsMeta[selWorld];
      if (w) text('Seed: ' + w.seed, GW / 2 - 100, 90, '#a0a0a0');
      button(GW / 2 - 100, GH - 52, 98, 20, 'Save', () => { const n = (FIELDV.ename || '').trim() || 'New World'; renameWorld(w.id, n).then(goWorlds); }, !!w);
      button(GW / 2 + 2, GH - 52, 98, 20, 'Cancel', () => { scr = 'worlds'; });
    }
    function cycleBtn(x, y, w, label, val, fn, en) { button(x, y, w, 20, label + ': ' + val, fn, en !== false); }
    function drawCreate() {
      drawDirt(0);
      const tabsN = ['Game', 'World', 'More'], tw2 = Math.min(70, (GW - 20) / 3 | 0);
      tabsN.forEach((n, i) => { const x = GW / 2 - tw2 * 1.5 + i * tw2 | 0; button(x, 4, tw2 - 2, 20, n, () => { CW.tab = i; blurField(); }, true); if (CW.tab === i) { g.fillStyle = '#ffffff'; g.fillRect(x + 4, 22, tw2 - 10, 1); } });
      const x0 = GW / 2 - 105 | 0, W2 = 210, step = touch ? 28 : 24;
      let y = 36;
      if (CW.tab === 0) {
        text('World Name', x0, y, '#a0a0a0'); field('wname', x0, y + 11, W2, 20, FIELDV.wname || '', '', null, 32); y += 40;
        cycleBtn(x0, y, W2, 'Game Mode', GMN[CW.mode], () => { CW.mode = GMODES[(GMODES.indexOf(CW.mode) + 1) % GMODES.length]; if (CW.mode === 'hardcore') CW.diff = 3; CW.cheats = CW.mode === 'creative'; });
        const desc = { survival: 'Search for resources, craft, gain levels, health and hunger', hardcore: 'Same as Survival Mode, locked at hardest difficulty, and one life only', creative: 'Unlimited resources, free flying and destroy blocks instantly', adventure: 'Play maps made by others: blocks cannot be broken or placed freely' }[CW.mode];
        wrapText(desc, W2).forEach((l, i) => text(l, x0, y + 22 + i * 9, '#a0a0a0')); y += 44;
        cycleBtn(x0, y, W2, 'Difficulty', DIFFN[CW.diff], () => { CW.diff = (CW.diff + 1) % 4; }, CW.mode !== 'hardcore'); y += step;
        cycleBtn(x0, y, W2, 'Allow Commands', CW.cheats ? 'ON' : 'OFF', () => { CW.cheats = !CW.cheats; }, CW.mode !== 'hardcore'); y += step;
      } else if (CW.tab === 1) {
        cycleBtn(x0, y, W2, 'World Type', WTN[CW.type], () => { CW.type = WTYPES[(WTYPES.indexOf(CW.type) + 1) % WTYPES.length]; }); y += step + 6;
        text('Seed for the World Generator', x0, y, '#a0a0a0'); field('wseed', x0, y + 11, W2, 20, FIELDV.wseed || '', 'Leave blank for a random seed', null, 32); y += 40;
        cycleBtn(x0, y, W2, 'Generate Structures', CW.structures ? 'ON' : 'OFF', () => { CW.structures = !CW.structures; }); y += step;
        cycleBtn(x0, y, W2, 'Bonus Chest', CW.bonus ? 'ON' : 'OFF', () => { CW.bonus = !CW.bonus; }); y += step;
      } else {
        text('Game Rules', x0, y, '#ffffff'); y += 12;
        const half = Math.ceil(RULES.length / 2), cw2 = GW >= 440 ? 210 : W2, two = GW >= 440;
        RULES.forEach(([k, l], i) => { const col = two && i >= half ? 1 : 0, r = two ? i % half : i, bx2 = two ? GW / 2 - 214 + col * 218 : x0, by2 = y + r * (touch ? 26 : 22); if (by2 > GH - 60) return; button(bx2, by2, cw2, 20, l + ': ' + (CW.rules[k] ? 'ON' : 'OFF'), () => { CW.rules[k] = !CW.rules[k]; }); });
      }
      const yb = GH - (touch ? 30 : 26);
      button(GW / 2 - 154, yb, 150, 20, 'Create New World', () => { CW.name = (FIELDV.wname || '').trim() || 'New World'; CW.seed = FIELDV.wseed || ''; createWorld(CW, mpMode === 'host'); });
      button(GW / 2 + 4, yb, 150, 20, 'Cancel', () => { blurField(); goWorlds(); });
    }
    function drawMP() {
      drawDirt(0);
      textC('Play Multiplayer', GW / 2, 16, '#ffffff');
      const x0 = GW / 2 - 110 | 0, W2 = 220;
      const lines = wrapText('Play together with friends on the same Wi-Fi / LAN or online. One player hosts a world, the others join with the party code.', W2);
      lines.forEach((l, i) => textC(l, GW / 2, 32 + i * 10, '#a0a0a0'));
      let y = 40 + lines.length * 10;
      text('Username (required)', x0, y, '#ffffff');
      field('uname', x0, y + 11, W2, 20, FIELDV.uname || '', '3-16 letters, numbers or _', null, 16);
      const ok = validName(FIELDV.uname);
      if (!ok) text((FIELDV.uname || '').length ? 'Use 3-16 letters, numbers or _ only' : 'You must choose a username to play online', x0, y + 35, '#ff5555');
      else text('Other players will see you as ' + FIELDV.uname, x0, y + 35, '#55ff55');
      y += 52;
      const step = touch ? 28 : 24;
      button(x0, y, W2, 20, 'Host a World', () => { saveProfile(FIELDV.uname); blurField(); mpMode = 'host'; goWorlds(); }, ok);
      button(x0, y + step, W2, 20, 'Join a Friend', () => { saveProfile(FIELDV.uname); blurField(); joinParty(); }, ok);
      button(x0, y + step * 2 + 8, W2, 20, 'Back', () => { blurField(); scr = 'title'; });
    }
    function drawOptions(inGame) {
      if (inGame) { g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH); } else drawDirt(0);
      textC('Options', GW / 2, 12, '#ffffff');
      const two = GW >= 330, cw2 = two ? 150 : Math.min(200, GW - 20), x1 = two ? GW / 2 - 155 : GW / 2 - cw2 / 2, x2 = two ? GW / 2 + 5 : x1, step = touch ? 27 : 23;
      let y = 30, col = 0;
      const put = fn => { const x = col ? x2 : x1; fn(x, y); if (two) { col ^= 1; if (!col) y += step; } else y += step; };
      put((x, yy) => slider(x, yy, cw2, 'FOV: ' + (SET.fov === 70 ? 'Normal' : SET.fov === 110 ? 'Quake Pro' : SET.fov), (SET.fov - 30) / 80, f => { SET.fov = Math.round(30 + f * 80); fovDirty = true; }));
      put((x, yy) => slider(x, yy, cw2, 'Render Distance: ' + SET.rd + ' chunks', (SET.rd - 2) / 10, f => { SET.rd = Math.round(2 + f * 10); }));
      put((x, yy) => slider(x, yy, cw2, 'Brightness: ' + (SET.gam === 0 ? 'Moody' : SET.gam === 1 ? 'Bright' : Math.round(SET.gam * 100) + '%'), SET.gam, f => { SET.gam = Math.round(f * 20) / 20; U.gam.value = SET.gam; }));
      put((x, yy) => slider(x, yy, cw2, 'Sensitivity: ' + Math.round(SET.sens * 100) + '%', (SET.sens - .1) / 2.9, f => { SET.sens = Math.round((.1 + f * 2.9) * 20) / 20; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Graphics: ' + (SET.fancy ? 'Fancy' : 'Fast'), () => { SET.fancy = !SET.fancy; FANCY = SET.fancy; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'GUI Scale: ' + (SET.gui ? SET.gui : 'Auto'), () => { SET.gui = (SET.gui + 1) % 5; resize(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Clouds: ' + (SET.clouds ? 'Fancy' : 'OFF'), () => { SET.clouds = !SET.clouds; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Particles: ' + ['Minimal', 'Decreased', 'All'][SET.particles], () => { SET.particles = (SET.particles + 1) % 3; }));
      put((x, yy) => button(x, yy, cw2, 20, 'View Bobbing: ' + (SET.bob ? 'ON' : 'OFF'), () => { SET.bob = !SET.bob; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Smooth Lighting: ' + (SET.smooth ? 'ON' : 'OFF'), () => { SET.smooth = !SET.smooth; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Music: ' + (SET.music ? 'ON' : 'OFF'), () => { SET.music = !SET.music; if (!SET.music) stopMusic(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Sounds: ' + (SET.sound ? 'ON' : 'OFF'), () => { SET.sound = !SET.sound; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Controls...', () => { if (inGame) gui = 'controls'; else scr = 'controls'; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Difficulty: ' + (W && inGame ? DIFFN[W.diff] : '-'), () => { if (W && !W.hardcore && NET.role !== 'guest') { W.diff = (W.diff + 1) % 4; if (W.diff === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); } }, !!(inGame && W && !W.hardcore && NET.role !== 'guest')));
      if (col) y += step;
      button(GW / 2 - 100, Math.min(GH - 26, y + 6), 200, 20, 'Done', () => { persistSet(); if (inGame) gui = 'pause'; else scr = optBack; });
    }
    const KBN = { fwd: 'Walk Forwards', left: 'Strafe Left', back: 'Walk Backwards', right: 'Strafe Right', jump: 'Jump', sneak: 'Sneak', sprint: 'Sprint', inv: 'Open/Close Inventory', drop: 'Drop Selected Item', swap: 'Swap Item With Offhand', chat: 'Open Chat', cmd: 'Open Command', list: 'List Players', pick: 'Pick Block', persp: 'Toggle Perspective', f3: 'Debug Screen', hide: 'Hide HUD' };
    const keyName = c => !c ? 'NONE' : c.startsWith('Key') ? c.slice(3) : c.startsWith('Digit') ? c.slice(5) : c === 'ShiftLeft' ? 'Left Shift' : c === 'ControlLeft' ? 'Left Control' : c === 'AltLeft' ? 'Left Alt' : c === 'Space' ? 'Space' : c === 'Mouse2' ? 'Middle Button' : c;
    function drawControls(inGame) {
      if (inGame) { g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH); } else drawDirt(0);
      textC('Key Binds', GW / 2, 10, '#ffffff');
      const ks = Object.keys(KBN), top = 26, bot = GH - 32, rowH = touch ? 24 : 21;
      ctrlScroll = clamp(ctrlScroll, 0, Math.max(0, ks.length * rowH - (bot - top)));
      g.save(); g.beginPath(); g.rect(0, top, GW, bot - top); g.clip();
      ks.forEach((k, i) => {
        const y = top + i * rowH - ctrlScroll;
        if (y < top - rowH || y > bot) return;
        text(KBN[k], GW / 2 - 150, y + 6, '#ffffff');
        const dup = ks.some(o => o !== k && KB[o] === KB[k]);
        button(GW / 2 + 10, y, 90, 20, ctrlWait === k ? '> ' + keyName(KB[k]) + ' <' : keyName(KB[k]), () => { ctrlWait = k; });
        if (dup && ctrlWait !== k) text('!', GW / 2 + 4, y + 6, '#ff5555');
        button(GW / 2 + 104, y, 50, 20, 'Reset', () => { KB[k] = KBD[k]; saveKB(); }, KB[k] !== KBD[k]);
      });
      g.restore();
      button(GW / 2 - 100, GH - 26, 200, 20, 'Done', () => { ctrlWait = null; if (inGame) gui = 'options'; else scr = 'options'; });
    }
    function drawLoading() {
      drawDirt(0);
      textC(loadMsg || 'Loading terrain...', GW / 2, GH / 2 - 20, '#ffffff');
      const w = 100, x = (GW - w) / 2, y = GH / 2;
      g.fillStyle = '#808080'; g.fillRect(x, y, w, 2); g.fillStyle = '#80ff80'; g.fillRect(x, y, w * clamp(loadP, 0, 1), 2);
      if (scr === 'waiting') button(GW / 2 - 100, GH - 40, 200, 20, 'Cancel', () => { leaveMP('Cancelled'); });
    }
    function drawDisc() {
      drawDirt(0);
      textC('Connection Lost', GW / 2, GH / 2 - 40, '#a0a0a0');
      wrapText(discMsg || 'Disconnected', GW - 40).forEach((l, i) => textC(l, GW / 2, GH / 2 - 20 + i * 10, '#ffffff'));
      button(GW / 2 - 100, GH / 2 + 20, 200, 20, 'Back to Title Screen', () => { scr = 'title'; });
    }
    function drawPause() {
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      textC('Game Menu', GW / 2, Math.max(10, GH / 4 - 32), '#ffffff');
      const y = Math.max(26, GH / 4 - 16 | 0), step = touch ? 28 : 24;
      button(GW / 2 - 102, y, 204, 20, 'Back to Game', () => closeGui());
      button(GW / 2 - 102, y + step, 100, 20, 'Options...', () => { gui = 'options'; });
      const host = NET.role === 'host', guest = NET.role === 'guest';
      button(GW / 2 + 2, y + step, 100, 20, host ? ['Invite Players', 'Invite'] : 'Open to LAN', () => { openToLan(); }, !guest);
      button(GW / 2 - 102, y + step * 2, 204, 20, 'Player List' + (NET.role ? ' (' + playersList().length + ')' : ''), () => { gui = 'plist'; }, !!NET.role);
      button(GW / 2 - 102, y + step * 3 + 8, 204, 20, guest ? 'Disconnect' : 'Save and Quit to Title', () => { quitToTitle(); });
      if (NET.role) text('Party code: ' + (api.net.code || '-'), 4, GH - 12, '#a0a0a0');
    }
    function drawPList() {
      g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH);
      textC('Players', GW / 2, 16, '#ffffff');
      const L = [{ name: P.name + ' (you)', host: NET.role === 'host' }].concat(ENTS.filter(e => e.kind === 'player').map(e => ({ name: e.name, host: e.isHost, pid: e.pid })));
      L.forEach((p, i) => { text(p.name + (p.host ? ' [Host]' : ''), GW / 2 - 100, 40 + i * 22, '#ffffff'); if (NET.role === 'host' && p.pid) button(GW / 2 + 50, 34 + i * 22, 50, 20, 'Kick', () => { api.net.kick(p.pid); }); });
      button(GW / 2 - 100, GH - 30, 200, 20, 'Done', () => { gui = 'pause'; });
    }
    function drawDead() {
      g.fillStyle = 'rgba(120,0,0,.45)'; g.fillRect(0, 0, GW, GH);
      textC(W.hardcore ? 'Game Over!' : 'You Died!', GW / 2, GH / 4 - 10, '#ffffff', true, 2);
      if (P.deathMsg) textC(P.deathMsg, GW / 2, GH / 4 + 16, '#ffffff');
      textC('Score: ', GW / 2 - tw(String(P.scoreAtDeath || 0)) / 2, GH / 4 + 30, '#ffffff'); text(String(P.scoreAtDeath || 0), GW / 2 + tw('Score: ') / 2 - tw(String(P.scoreAtDeath || 0)) / 2, GH / 4 + 30, '#ffff55');
      const en = deadT > 20, y = GH / 4 + 56;
      if (W.hardcore) button(GW / 2 - 100, y, 200, 20, 'Spectate World', () => { respawn(); }, en);
      else button(GW / 2 - 100, y, 200, 20, 'Respawn', () => { respawn(); }, en);
      button(GW / 2 - 100, y + 24, 200, 20, NET.role === 'guest' ? 'Disconnect' : 'Title Screen', () => { quitToTitle(); }, en);
    }
    function drawScreen(now) {
      btns = []; fields = []; sliders = [];
      if (scr === 'title') drawTitle(now);
      else if (scr === 'worlds') drawWorlds();
      else if (scr === 'create') drawCreate();
      else if (scr === 'edit') drawEdit();
      else if (scr === 'delete') drawDelete();
      else if (scr === 'mp') drawMP();
      else if (scr === 'options') drawOptions(false);
      else if (scr === 'controls') drawControls(false);
      else if (scr === 'loading' || scr === 'waiting') drawLoading();
      else if (scr === 'disc') drawDisc();
    }
    function drawGameGui(now) {
      if (!gui) return;
      if (gui === 'pause') drawPause();
      else if (gui === 'options') drawOptions(true);
      else if (gui === 'controls') drawControls(true);
      else if (gui === 'plist') drawPList();
      else if (gui === 'dead') drawDead();
      else if (gui === 'sign') drawSign();
      else if (INVG.has(gui)) drawInv(now);
    }
    const KBD = { fwd: 'KeyW', left: 'KeyA', back: 'KeyS', right: 'KeyD', jump: 'Space', sneak: 'ShiftLeft', sprint: 'ControlLeft', inv: 'KeyE', drop: 'KeyQ', swap: 'KeyF', chat: 'KeyT', cmd: 'Slash', list: 'Tab', pick: 'Mouse2', persp: 'F5', f3: 'F3', hide: 'F1' };
    const KB = Object.assign({}, KBD, SV.kb && typeof SV.kb === 'object' ? SV.kb : {});
    const saveKB = () => { SV.kb = KB; api.save(SV); };
    let freeMouse = false, unlockIntent = false, persp = 0, hideHud = false, fovDirty = true, lastW = 0, lastSpace = 0, lastJumpTap = 0, sneakToggle = false, aimT = null, tl = { id: null }, lastTouch = 0, mDrag = null;
    const tbs = new Map();
    const locked = () => document.pointerLockElement === canvas;
    let gestT = 0, lockT = 0, uiT = 0;
    function lockMouse(gest) {
      if (touch || locked() || scr !== 'game' || freeMouse && !gest) return;
      if (gest) gestT = performance.now();
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { if (performance.now() - gestT < 1500) freeMouse = true; }); } catch (e) { if (gest) freeMouse = true; }
      if (gest) api.timeout(() => { if (!locked() && scr === 'game' && !gui && !touch && !chatOpen) freeMouse = true; }, 1200);
    }
    function releaseMouse() { uiT = performance.now(); attackHeld = useHeld = false; mine = null; tJump = false; if (locked()) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) { } } }
    api.on(document, 'pointerlockchange', () => {
      const t = performance.now();
      if (locked()) { freeMouse = false; lockT = t; if (gui || chatOpen || scr !== 'game' || P.dead) releaseMouse(); return; }
      attackHeld = useHeld = false;
      if (unlockIntent) { unlockIntent = false; return; }
      if (t - lockT < 600 || t - uiT < 900) return;
      if (scr === 'game' && !gui && !chatOpen && !P.dead) { gui = 'pause'; saveSoon(); }
    });
    api.on(document, 'pointerlockerror', () => { if (performance.now() - gestT < 1500) freeMouse = true; });
    const lookBy = (dx, dy) => { if (P.sleeping) return; P.yaw -= dx; P.pitch = clamp(P.pitch - dy, -1.5707, 1.5707); };
    function openChat(pre) { chatOpen = true; FIELDV.chat = pre || ''; chatHi = -1; releaseMouse(); focusField('chat', pre || '', 256); }
    function closeChat() { uiT = performance.now(); chatOpen = false; FIELDV.chat = ''; blurField(); lockMouse(); }
    function sendChat() {
      const m = (inp.value || '').trim();
      closeChat();
      if (!m) return;
      chatHist.push(m); if (chatHist.length > 50) chatHist.shift();
      if (m[0] === '/') { runCommand(m.slice(1)); return; }
      const line = '<' + P.name + '> ' + m;
      chatSys(line); netSend({ t: 'chat', m: line });
    }
    function guiDown(gx, gy, btn, shift) {
      for (const f of fields) if (inR(gx, gy, f)) { if (focusKey !== f.key) focusField(f.key, FIELDV[f.key] || '', f.maxLen); return; }
      if (focusKey && focusKey !== 'chat' && focusKey !== 'sign') blurField();
      for (const s of sliders) if (inR(gx, gy, s)) { activeSlider = s; s.set(clamp((gx - s.x - 4) / (s.w - 8), 0, 1)); return; }
      for (let i = btns.length - 1; i >= 0; i--) { const b = btns[i]; if (b.en && inR(gx, gy, b)) { if (b.l !== undefined) snd('click'); try { b.fn(); } catch (e) { if (window.console) console.error(e); } return; } }
      if (scr === 'game' && gui) invDown(btn, shift);
    }
    function pickBlock() {
      if (!HIT.b || !creative()) return;
      const s = getS(HIT.x, HIT.y, HIT.z), id = blockItemOf(s);
      for (let i = 0; i < 9; i++) if (inv[i] && inv[i].id === id) { sel = i; return; }
      let k = inv.findIndex((s2, i) => i < 9 && !s2); if (k < 0) k = sel; sel = k; inv[k] = { id, n: IT[id].stack, d: 0 };
    }
    function dropHeld(all) { const s = held(); if (!s || P.dead || gui) return; const n = all ? s.n : 1; throwStack({ id: s.id, n, d: s.d, x: s.x }, true); s.n -= n; if (s.n <= 0) inv[sel] = null; swing(); }
    function swapHands() { const a = inv[sel]; inv[sel] = offhand; offhand = a; }
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('mousedown', e => {
      if (e.target === inp) return;
      if (touch) { if (performance.now() - lastTouch < 900) return; touch = false; resize(); }
      e.preventDefault(); ac();
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      const btn = e.button === 2 ? 2 : e.button === 1 ? 1 : 0;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { guiDown(gx, gy, btn === 2 ? 2 : btn, e.shiftKey); return; }
      if (!locked() && !freeMouse) { lockMouse(true); return; }
      if (freeMouse && !locked()) try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (er) { }
      if (btn === 0) { attackHeld = true; attackPress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false }; }
      else if (btn === 2) { useHeld = true; usePress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false, use: 1 }; }
      else pickBlock();
    });
    api.on(window, 'mouseup', e => {
      if (e.button === 0) attackHeld = false;
      if (e.button === 2) useHeld = false;
      mDrag = null; activeSlider = null;
      if (!touch && scr === 'game' && gui) invUp();
    });
    api.on(document, 'mousemove', e => {
      if (locked()) { if (scr === 'game' && !gui && !chatOpen && Math.abs(e.movementX) < 400 && Math.abs(e.movementY) < 400) lookBy(e.movementX * CFG.SENS * SET.sens, e.movementY * CFG.SENS * SET.sens); return; }
      if (touch) return;
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1));
      if (scr === 'game' && gui) invMove();
      if (mDrag && scr === 'game' && !gui) {
        const dx = e.clientX - mDrag.x, dy = e.clientY - mDrag.y;
        if (!mDrag.moved && Math.hypot(dx, dy) > 4) { mDrag.moved = true; attackHeld = false; useHeld = false; mine = null; }
        if (mDrag.moved) { const k = 3.2 / (wrap.getBoundingClientRect().width || 960) * SET.sens; lookBy(dx * k, dy * k); mDrag.x = e.clientX; mDrag.y = e.clientY; }
      }
    });
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const d = e.deltaY || e.deltaX;
      if (!d) return;
      if (scr === 'game' && !gui && !chatOpen) { sel = (sel + (d > 0 ? 1 : 8)) % 9; return; }
      if (scr === 'game' && gui) { if (gui === 'controls') ctrlScroll += d > 0 ? 20 : -20; else invWheel(d); return; }
      if (scr === 'worlds') wScroll += d > 0 ? 24 : -24;
      if (scr === 'controls') ctrlScroll += d > 0 ? 20 : -20;
    }, { passive: false });
    function touchLayout() {
      const r = Math.min(34, GH * .11), jx = 12 + r * 1.2, jy = GH - 52 - r, bs = Math.min(30, GH * .1);
      const jump = { x: GW - bs * 1.8 - 10, y: GH - bs * 1.8 - 48, w: bs * 1.8, h: bs * 1.8 };
      return {
        r, jx, jy, bs, jump,
        sneak: { x: jump.x + bs * .2, y: jump.y - bs * 1.2 - 6, w: bs * 1.4, h: bs * 1.2 },
        pause: { x: GW - 26, y: 4, w: 22, h: 18 }, inv: { x: GW - 52, y: 4, w: 22, h: 18 }, chat: { x: GW - 78, y: 4, w: 22, h: 18 }, drop: { x: GW - 104, y: 4, w: 22, h: 18 }, persp: { x: GW - 130, y: 4, w: 22, h: 18 }
      };
    }
    function drawTouch() {
      const L = touchLayout();
      g.globalAlpha = .55;
      g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.fillStyle = 'rgba(0,0,0,.35)';
      const cx = stick.id != null ? stick.cx : L.jx, cy = stick.id != null ? stick.cy : L.jy;
      g.beginPath(); g.arc(cx, cy, L.r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx + stick.x * L.r * .6, cy + stick.y * L.r * .6, L.r * .38, 0, 7); g.fill();
      const box = (b, lbl, on) => { g.fillStyle = on ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'; g.fillRect(b.x, b.y, b.w, b.h); ring(b.x, b.y, b.w, b.h, 1, '#fff'); textC(lbl, b.x + b.w / 2, b.y + b.h / 2 - 4, '#ffffff'); };
      box(L.jump, P.fly ? 'UP' : 'JUMP', tJump); box(L.sneak, P.fly ? 'DOWN' : 'SNEAK', tSneak);
      box(L.pause, '||'); box(L.inv, '...'); box(L.chat, 'T'); box(L.drop, 'Q'); box(L.persp, 'F5');
      g.globalAlpha = 1;
    }
    const setAim = e => { const r = wrap.getBoundingClientRect(); aimT = { nx: (e.clientX - r.left) / (r.width || 1) * 2 - 1, ny: -((e.clientY - r.top) / (r.height || 1) * 2 - 1) }; };
    const setStick = (gx, gy) => { const r = touchLayout().r; let dx = (gx - stick.cx) / r, dy = (gy - stick.cy) / r; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.x = dx; stick.y = dy; };
    wrap.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || e.target === inp) return;
      e.preventDefault(); lastTouch = performance.now(); ac();
      if (!touch) { touch = true; releaseMouse(); resize(); }
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { tbs.set(e.pointerId, 'gui'); guiDown(gx, gy, 0, false); return; }
      if (P.dead) return;
      const L = touchLayout(), now = performance.now();
      if (inR(gx, gy, L.inv)) { openGui('inv'); return; }
      if (inR(gx, gy, L.pause)) { gui = 'pause'; saveSoon(); return; }
      if (inR(gx, gy, L.chat)) { openChat(''); return; }
      if (inR(gx, gy, L.drop)) { dropHeld(false); return; }
      if (inR(gx, gy, L.persp)) { persp = (persp + 1) % 3; return; }
      if (inR(gx, gy, L.jump)) { tbs.set(e.pointerId, 'jump'); tJump = true; if ((creative() || mode() === 'spectator') && now - lastJumpTap < 350) { P.fly = !P.fly; P.vy = 0; lastJumpTap = 0; } else lastJumpTap = now; return; }
      if (inR(gx, gy, L.sneak)) { tbs.set(e.pointerId, 'sneak'); if (P.fly) tSneak = true; else { sneakToggle = !sneakToggle; tSneak = sneakToggle; } return; }
      const hx = (GW - 182) >> 1;
      if (gy >= GH - 24 && gx >= hx && gx < hx + 182) { sel = clamp((gx - hx) / 20 | 0, 0, 8); return; }
      if (stick.id == null && gx < GW * .42 && gy > GH * .4) { stick.id = e.pointerId; const near = Math.hypot(gx - L.jx, gy - L.jy) < L.r * 1.8; stick.cx = near ? L.jx : gx; stick.cy = near ? L.jy : gy; setStick(gx, gy); return; }
      if (tl.id == null) { tl = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: now, moved: false, mining: false }; setAim(e); }
    });
    api.on(window, 'pointermove', e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { const [gx, gy] = toGui(e); setStick(gx, gy); return; }
      if (e.pointerId === tl.id) {
        if (!tl.moved && Math.hypot(e.clientX - tl.sx, e.clientY - tl.sy) > 10) { tl.moved = true; if (!tl.mining) { attackHeld = false; useHeld = false; } }
        if (tl.moved && !tl.mining) { const k = 3.2 / (wrap.getBoundingClientRect().width || 400) * SET.sens; lookBy((e.clientX - tl.x) * k, (e.clientY - tl.y) * k); }
        tl.x = e.clientX; tl.y = e.clientY; setAim(e); return;
      }
      if (scr !== 'game' || gui) { const [gx, gy] = toGui(e); mx = gx; my = gy; if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1)); if (scr === 'game' && gui) invMove(); }
    });
    const touchUp = e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; }
      const b = tbs.get(e.pointerId);
      if (b) { tbs.delete(e.pointerId); if (b === 'jump') tJump = false; else if (b === 'sneak' && P.fly) tSneak = false; else if (b === 'gui') { activeSlider = null; if (scr === 'game' && gui) invUp(); } }
      if (e.pointerId === tl.id) {
        if (!tl.moved && !tl.mining && performance.now() - tl.t < 300 && scr === 'game' && !gui && e.type === 'pointerup') { setAim(e); updTarget(); if (HIT.ent) attackPress(); else usePress(); }
        attackHeld = false; useHeld = false; tl = { id: null }; aimT = null;
      }
    };
    api.on(window, 'pointerup', touchUp); api.on(window, 'pointercancel', touchUp);
    function touchTick() {
      if (tl.id != null && !tl.moved && !tl.mining && performance.now() - tl.t > 280 && scr === 'game' && !gui) { tl.mining = true; attackHeld = true; const h = held(); if (h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink || IT[h.id].shield || IT[h.id].crossbow || IT[h.id].trident)) { attackHeld = false; useHeld = true; usePress(); } else attackPress(); }
    }
    inp.addEventListener('input', () => { if (focusKey && focusKey !== 'sign') FIELDV[focusKey] = inp.value; });
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); const f = fields.find(q => q.key === focusKey); if (focusKey === 'chat') sendChat(); else if (focusKey === 'sign') { signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + 1) % 4; inp.value = signLines[signLine]; } else if (f && f.onEnter) f.onEnter(); else blurField(); return; }
      if (e.key === 'Escape') { e.preventDefault(); if (focusKey === 'chat') closeChat(); else if (focusKey === 'sign') closeGui(); else blurField(); return; }
      if (focusKey === 'sign' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + (e.key === 'ArrowUp' ? 3 : 1)) % 4; inp.value = signLines[signLine]; return; }
      if (focusKey === 'chat' && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && chatHist.length) { e.preventDefault(); chatHi = clamp((chatHi < 0 ? chatHist.length : chatHi) + (e.key === 'ArrowUp' ? -1 : 1), 0, chatHist.length); inp.value = FIELDV.chat = chatHist[chatHi] || ''; return; }
      if (focusKey === 'chat' && e.key === 'Tab') { e.preventDefault(); const v = inp.value; if (v[0] === '/') { const c = tabComplete(v); if (c) inp.value = FIELDV.chat = c; } }
    });
    api.on(window, 'keydown', e => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const c = e.code;
      if (touch && !e.repeat && c && c !== 'Unidentified') { touch = false; resize(); }
      ac();
      if (ctrlWait) { e.preventDefault(); if (c !== 'Escape') KB[ctrlWait] = c; ctrlWait = null; saveKB(); return; }
      if (c === 'F1' || c === 'F3' || c === 'F5' || c === 'Tab' || c === 'Space' || c === 'Slash' || /^Arrow/.test(c)) e.preventDefault();
      if (scr !== 'game') {
        if (c === 'Escape') { if (scr === 'worlds' || scr === 'mp' || scr === 'options') scr = 'title'; else if (scr === 'create' || scr === 'edit' || scr === 'delete') goWorlds(); else if (scr === 'controls') scr = 'options'; }
        if (c === 'Enter' && scr === 'worlds' && selWorld >= 0) playSel();
        return;
      }
      if (gui === 'dead') return;
      if (c === 'Escape') { if (gui === 'options' || gui === 'controls' || gui === 'plist') { persistSet(); gui = 'pause'; } else if (gui) closeGui(); else { gui = 'pause'; releaseMouse(); saveSoon(); } return; }
      if (gui === 'pause' || gui === 'options' || gui === 'controls' || gui === 'plist' || gui === 'sign') return;
      if (c === KB.inv && !e.repeat) { if (gui) closeGui(); else if (!chatOpen && !P.dead) openGui('inv'); return; }
      if (gui) { invKey(c); return; }
      if (chatOpen) return;
      const d = /^Digit([1-9])$/.exec(c);
      if (d) { sel = +d[1] - 1; return; }
      if (c === KB.f3) { showF3 = !showF3; return; }
      if (c === KB.hide) { hideHud = !hideHud; return; }
      if (e.repeat) return;
      if (c === KB.persp) { persp = (persp + 1) % 3; return; }
      if (c === KB.chat) { e.preventDefault(); openChat(''); return; }
      if (c === KB.cmd) { e.preventDefault(); openChat('/'); return; }
      if (c === KB.drop) { dropHeld(e.ctrlKey || e.metaKey); return; }
      if (c === KB.swap) { swapHands(); return; }
      if (c === KB.sprint) sprintKey = true;
      const now = performance.now();
      if (c === KB.fwd) { if (now - lastW < CFG.DOUBLE_TAP * 50) sprintTap = 1; lastW = now; }
      if (c === KB.jump && (creative() || mode() === 'spectator')) { if (now - lastSpace < CFG.DOUBLE_TAP * 50 && mode() !== 'spectator') { P.fly = !P.fly; P.vy = 0; lastSpace = 0; } else lastSpace = now; }
    });
    api.on(window, 'keyup', e => { if (e.code === KB.sprint) sprintKey = false; });
    api.on(window, 'blur', () => { attackHeld = useHeld = false; sprintKey = false; });
    const CMDS = ['gamemode', 'time', 'weather', 'give', 'tp', 'teleport', 'kill', 'seed', 'difficulty', 'gamerule', 'summon', 'xp', 'experience', 'clear', 'effect', 'spawnpoint', 'setworldspawn', 'help', 'list', 'say', 'me', 'msg', 'setblock', 'fill', 'heal', 'locate'];
    const WORLD_CMDS = new Set(['time', 'weather', 'difficulty', 'gamerule', 'summon', 'setworldspawn', 'setblock', 'fill', 'say']);
    function tabComplete(v) {
      const parts = v.slice(1).split(' ');
      if (parts.length === 1) { const m = CMDS.filter(c => c.startsWith(parts[0])); return m.length ? '/' + m[0] + ' ' : null; }
      const last = parts[parts.length - 1], cmd = parts[0];
      let pool = [];
      if (cmd === 'give' && parts.length === 3 || cmd === 'clear') pool = IT.map(i => i.id);
      else if (cmd === 'give' && parts.length === 2) pool = ['@s', '@p', '@a', P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name));
      else if (cmd === 'gamemode') pool = ['survival', 'creative', 'adventure', 'spectator'];
      else if (cmd === 'time') pool = parts.length === 2 ? ['set', 'add', 'query'] : ['day', 'noon', 'night', 'midnight'];
      else if (cmd === 'weather') pool = ['clear', 'rain', 'thunder'];
      else if (cmd === 'difficulty') pool = ['peaceful', 'easy', 'normal', 'hard'];
      else if (cmd === 'gamerule') pool = parts.length === 2 ? RULES.map(r => r[0]).concat(['randomTickSpeed']) : ['true', 'false'];
      else if (cmd === 'summon') pool = Object.keys(MT).concat(['item', 'tnt', 'falling_block']);
      else if (cmd === 'effect') pool = parts.length === 2 ? ['give', 'clear'] : ['regeneration', 'poison', 'hunger', 'fire_resistance', 'water_breathing'];
      const m = pool.filter(p => p.startsWith(last.replace(/^minecraft:/, '')));
      if (!m.length) return null;
      parts[parts.length - 1] = m[0];
      return '/' + parts.join(' ');
    }
    const coord = (s, base) => s === undefined ? base : s[0] === '~' ? base + (+s.slice(1) || 0) : +s;
    function runCommand(str, from) {
      const a = str.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase().replace(/^minecraft:/, '');
      const say = (m, c) => { if (from) netSendTo(from.pid, { t: 'chat', m, c }); else chatSys(m, c); };
      const err = m => say(m, '#ff5555');
      const cheats = from ? W.cheats : W.cheats || NET.role === 'guest' && W.cheats;
      if (!CMDS.includes(cmd)) { err('Unknown or incomplete command, see below for error'); err('/' + str + '<--[HERE]'); return; }
      if (cmd === 'help') { say('Commands: /' + CMDS.join(', /')); return; }
      if (cmd === 'seed') { say('Seed: [' + W.seed + ']', '#55ff55'); return; }
      if (cmd === 'list') { const L = [P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name)); say('There are ' + L.length + ' of a max of 8 players online: ' + L.join(', ')); return; }
      if (cmd === 'me' || cmd === 'msg') { const m = '* ' + P.name + ' ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (!cheats) { err('You do not have permission to use this command (cheats are off)'); return; }
      if (NET.role === 'guest' && WORLD_CMDS.has(cmd)) { netSend({ t: 'cmd', s: str }); return; }
      if (from && !WORLD_CMDS.has(cmd)) { err('Run that command on your own client'); return; }
      if (cmd === 'say') { const m = '[' + (from ? from.name : P.name) + '] ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (cmd === 'gamemode') {
        const m = { survival: 'survival', s: 'survival', '0': 'survival', creative: 'creative', c: 'creative', '1': 'creative', adventure: 'adventure', a: 'adventure', '2': 'adventure', spectator: 'spectator', sp: 'spectator', '3': 'spectator' }[(a[1] || '').toLowerCase()];
        if (!m) { err('Unknown game mode: ' + (a[1] || '')); return; }
        setMode(m); say('Set own game mode to ' + GMN[m] + ' Mode'); return;
      }
      if (cmd === 'time') {
        const DAYV = { day: 1000, noon: 6000, night: 13000, midnight: 18000, sunrise: 23000, sunset: 12000 };
        if (a[1] === 'query') { say('The time is ' + Math.floor(a[2] === 'day' ? W.time / 24000 : W.time % 24000)); return; }
        const v = DAYV[a[2]] ?? parseInt(a[2]);
        if (!isFinite(v)) { err('Invalid time'); return; }
        if (a[1] === 'set') W.time = Math.floor(W.time / 24000) * 24000 + v; else if (a[1] === 'add') W.time += v; else { err('Usage: /time <set|add|query> <value>'); return; }
        say('Set the time to ' + Math.floor(W.time % 24000)); return;
      }
      if (cmd === 'weather') {
        const k = a[1];
        if (k === 'clear') { W.raining = false; W.thunder = false; } else if (k === 'rain') { W.raining = true; W.thunder = false; } else if (k === 'thunder') { W.raining = true; W.thunder = true; } else { err('Usage: /weather <clear|rain|thunder>'); return; }
        W.weatherT = (+a[2] || 300 + ri(600)) * 20;
        say('Set the weather to ' + (k === 'clear' ? 'clear' : k === 'rain' ? 'rain' : 'rain & thunder')); return;
      }
      if (cmd === 'difficulty') { const i = ['peaceful', 'easy', 'normal', 'hard'].indexOf((a[1] || '').toLowerCase()); if (i < 0) { say('The difficulty is ' + DIFFN[W.diff]); return; } if (W.hardcore) { err('Cannot change difficulty in Hardcore'); return; } W.diff = i; if (i === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); say('The difficulty has been set to ' + DIFFN[i]); return; }
      if (cmd === 'gamerule') {
        const k = a[1]; if (!k) { err('Usage: /gamerule <rule> [value]'); return; }
        if (a[2] === undefined) { say('Gamerule ' + k + ' is currently set to: ' + W.rules[k]); return; }
        W.rules[k] = a[2] === 'true' ? true : a[2] === 'false' ? false : isFinite(+a[2]) ? +a[2] : a[2];
        say('Gamerule ' + k + ' is now set to: ' + W.rules[k]); return;
      }
      if (cmd === 'give') {
        let tgt = a[1], nm = a[2], n = parseInt(a[3]) || 1;
        if (!nm) { nm = tgt; tgt = '@s'; }
        const it = IN[(nm || '').replace(/^minecraft:/, '')];
        if (!it || !it.tab) { err('Unknown item: ' + nm); return; }
        n = clamp(n, 1, 6400);
        const self = tgt === '@s' || tgt === '@p' || tgt === P.name || tgt === '@a';
        if (self) { let left = n; while (left > 0) { const k = Math.min(left, it.stack); giveOrDrop({ id: it.idx, n: k, d: 0 }); left -= k; } snd('pop'); }
        const others = ENTS.filter(e => e.kind === 'player' && (tgt === '@a' || e.name === tgt));
        for (const o of others) netSendTo(o.pid, { t: 'give', s: { id: it.idx, n, d: 0 } });
        if (!self && !others.length) { err('No player was found'); return; }
        say('Gave ' + n + ' [' + it.name + '] to ' + (tgt === '@a' ? 'all players' : self ? P.name : tgt)); return;
      }
      if (cmd === 'tp' || cmd === 'teleport') {
        if (a.length >= 4) { const x = coord(a[1], P.x), y = coord(a[2], P.y - CFG.YOFF) + CFG.YOFF, z = coord(a[3], P.z); if (![x, y, z].every(isFinite)) { err('Invalid position'); return; } P.x = x; P.y = y; P.z = z; P.vx = P.vy = P.vz = 0; P.fall = 0; P.px = x; P.py = y; P.pz = z; if (a[4] !== undefined && isFinite(+a[4])) P.yaw = Math.PI - (+a[4]) * Math.PI / 180; if (a[5] !== undefined && isFinite(+a[5])) P.pitch = clamp(-(+a[5]) * Math.PI / 180, -1.5707, 1.5707); say('Teleported ' + P.name + ' to ' + x.toFixed(1) + ', ' + (y - CFG.YOFF).toFixed(1) + ', ' + z.toFixed(1)); return; }
        const o = ENTS.find(e => e.kind === 'player' && e.name === a[1]);
        if (o) { P.x = o.x; P.y = o.y; P.z = o.z; say('Teleported ' + P.name + ' to ' + o.name); return; }
        err('Usage: /tp <x> <y> <z> or /tp <player>'); return;
      }
      if (cmd === 'kill') { if (!a[1] || a[1] === '@s' || a[1] === P.name) { hurtPlayer(1000, null, null, 'void'); say('Killed ' + P.name); return; } if (a[1] === '@e') { let n = 0; for (const e of ENTS.slice()) if (e.kind === 'mob') { killMob(e); n++; } say('Killed ' + n + ' entities'); return; } err('No entity was found'); return; }
      if (cmd === 'heal') { P.hp = 20; P.food = 20; P.sat = 5; say('Healed'); return; }
      if (cmd === 'clear') { let n = 0; const id = a[1] && IN[a[1].replace(/^minecraft:/, '')]; for (let i = 0; i < 36; i++) if (inv[i] && (!id || inv[i].id === id.idx)) { n += inv[i].n; inv[i] = null; } if (!id) { for (let i = 0; i < 4; i++) if (armor[i]) { n++; armor[i] = null; } if (offhand) { n++; offhand = null; } } say('Removed ' + n + ' item(s) from player ' + P.name); return; }
      if (cmd === 'xp' || cmd === 'experience') { const sub = a[1] === 'add' || a[1] === 'set' ? a[1] : 'add', v = parseInt(sub === a[1] ? a[2] : a[1]) || 0, lv = /levels?$/.test(a[a.length - 1]); if (sub === 'set') { if (lv) { P.lvl = Math.max(0, v); P.xp = 0; } else { P.xp = 0; addXp(v); } } else if (lv) P.lvl = Math.max(0, P.lvl + v); else addXp(v); say((lv ? 'Gave ' + v + ' experience levels' : 'Gave ' + v + ' experience points') + ' to ' + P.name); return; }
      if (cmd === 'effect') {
        if (a[1] === 'clear') { P.effects = {}; say('Removed every effect from ' + P.name); return; }
        const nm = (a[3] || a[2] || '').replace(/^minecraft:/, ''), map = { regeneration: 'regen', poison: 'poison', hunger: 'hunger', fire_resistance: 'fireRes', water_breathing: 'waterBreathing' }, k = map[nm];
        if (!k) { err('Unknown effect: ' + nm); return; }
        P.effects[k] = (parseInt(a[4] || a[3]) || 30) * 20; say('Applied effect ' + title(nm) + ' to ' + P.name); return;
      }
      if (cmd === 'spawnpoint') { P.spawn = [P.x, P.y, P.z]; say('Set spawn point to ' + Math.floor(P.x) + ', ' + Math.floor(P.y - CFG.YOFF) + ', ' + Math.floor(P.z)); return; }
      const src = from || P;
      if (cmd === 'setworldspawn') { W.spawn = [Math.floor(src.x) + .5, Math.floor(src.y), Math.floor(src.z) + .5]; say('Set the world spawn point to ' + Math.floor(src.x) + ', ' + Math.floor(src.y - CFG.YOFF) + ', ' + Math.floor(src.z)); return; }
      if (cmd === 'summon') {
        const ty = (a[1] || '').replace(/^minecraft:/, ''), x = coord(a[2], src.x), y = a[3] !== undefined ? coord(a[3], src.y - CFG.YOFF) + CFG.YOFF : src.y, z = coord(a[4], src.z);
        if (ty === 'tnt') { spawnTNT(Math.floor(x), Math.floor(y), Math.floor(z), 80); say('Summoned new Primed TNT'); return; }
        if (!MT[ty]) { err('Unknown entity: ' + ty); return; }
        spawnMob(ty, x, y, z, { persist: true }); say('Summoned new ' + title(ty)); return;
      }
      if (cmd === 'setblock' || cmd === 'fill') {
        const n = cmd === 'fill' ? 7 : 4, nm = (a[n] || '').replace(/^minecraft:/, ''), t = TN[nm];
        if (!t) { err('Unknown block type: ' + nm); return; }
        const p1 = [coord(a[1], src.x), coord(a[2], src.y - CFG.YOFF) + CFG.YOFF, coord(a[3], src.z)].map(Math.floor);
        const p2 = cmd === 'fill' ? [coord(a[4], src.x), coord(a[5], src.y - CFG.YOFF) + CFG.YOFF, coord(a[6], src.z)].map(Math.floor) : p1;
        let c = 0;
        const vol = (Math.abs(p2[0] - p1[0]) + 1) * (Math.abs(p2[1] - p1[1]) + 1) * (Math.abs(p2[2] - p1[2]) + 1);
        if (vol > 32768) { err('Too many blocks in the specified area (maximum 32768, specified ' + vol + ')'); return; }
        for (let x = Math.min(p1[0], p2[0]); x <= Math.max(p1[0], p2[0]); x++) for (let y = Math.min(p1[1], p2[1]); y <= Math.max(p1[1], p2[1]); y++) for (let z = Math.min(p1[2], p2[2]); z <= Math.max(p1[2], p2[2]); z++) if (setBlock(x, y, z, t.base)) c++;
        say(cmd === 'fill' ? 'Successfully filled ' + c + ' block(s)' : 'Changed the block at ' + p1[0] + ', ' + (p1[1] - CFG.YOFF) + ', ' + p1[2]); return;
      }
      if (cmd === 'locate') { say('Structures are not generated in this version', '#aaaaaa'); return; }
    }
    function setMode(m) {
      W.mode = m;
      if (m === 'creative' || m === 'spectator') { P.fire = 0; } else P.fly = false;
      if (m === 'spectator') P.fly = true;
      if (gui === 'inv' || gui === 'creative') { closeGui(true); openGui('inv'); }
    }
    const NET = { role: null, me: null, hostId: null, synced: new Set(), names: new Map(), ready: false, edN: 0, edGot: 0, pend: null, inLobby: false, viewers: new Map(), beSent: new Map(), lastPs: 0, sleepT: 0, pendHello: [] };
    const RP = new Map();
    const encS = s => s ? { id: s.id, n: s.n, d: s.d || 0, x: s.x } : null;
    const decS = o => o && IT[o.id | 0] ? { id: o.id | 0, n: clamp(o.n | 0, 1, 6400), d: Math.max(0, o.d | 0), x: o.x && typeof o.x === 'object' ? o.x : undefined } : null;
    const fin = v => typeof v === 'number' && isFinite(v);
    function netSend(m, fast) { if (!NET.role || NET.inLobby && !fast && NET.role === 'guest') return; try { api.net.send(m, fast); } catch (e) { } }
    function netSendTo(pid, m, fast) {
      if (!NET.role || !pid) return;
      try {
        if (NET.role === 'host') api.net.sendTo(pid, m, fast);
        else if (pid === NET.hostId) api.net.send(m, fast);
        else api.net.send({ t: 'relay', to: pid, m }, fast);
      } catch (e) { }
    }
    let actQ = null;
    function netAct(o) { if (!NET.role) return; actQ = Object.assign(actQ || {}, o); }
    function netOrLocal(a, e, fn) { if (NET.role === 'guest') netSend({ t: 'mi', id: e.id, a }); else fn(); }
    const u32b64 = a => { const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return btoa(s); };
    const b64u32 = s => { const bin = atob(s), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return new Uint32Array(b.buffer, 0, b.length >> 2); };
    function editDirect(x, y, z, s) {
      if (y < 0 || y >= H) return;
      const k = ck(x >> 4, z >> 4), li = (x & 15) | (z & 15) << 4 | (y & 15) << 8 | (y >> 4) << 12;
      let ed = W.edits.get(k); if (!ed) W.edits.set(k, ed = new Map());
      ed.set(li, s);
    }
    function applyChange(x, y, z, s, flags) {
      if (!fin(x) || !fin(y) || !fin(z) || !(s >= 0 && s < NSTATE)) return;
      const c = colAt(x >> 4, z >> 4);
      if (c && c.st >= 1) setBlock(x, y, z, s, flags); else editDirect(x, y, z, s);
    }
    function playerData() { return { x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch, hp: P.hp, food: P.food, sat: P.sat, xp: P.xp, lvl: P.lvl, score: P.score, inv: inv.map(encS), armor: armor.map(encS), offhand: encS(offhand), ender: ender.map(encS), mode: W.mode, spawn: P.spawn, effects: P.effects, fly: P.fly, air: P.air, dead: P.dead, sel }; }
    function applyPlayerData(d) {
      if (!d) return false;
      if ([d.x, d.y, d.z].every(fin)) { P.x = d.x; P.y = d.y; P.z = d.z; P.px = P.x; P.py = P.y; P.pz = P.z; P.place = false; }
      for (const k of ['yaw', 'pitch', 'hp', 'food', 'sat', 'xp', 'lvl', 'score', 'air']) if (fin(d[k])) P[k] = d[k];
      if (Array.isArray(d.inv)) inv = d.inv.slice(0, 36).map(decS).concat(new Array(36).fill(null)).slice(0, 36);
      if (Array.isArray(d.armor)) armor = d.armor.slice(0, 4).map(decS).concat([null, null, null, null]).slice(0, 4);
      offhand = decS(d.offhand);
      if (Array.isArray(d.ender)) ender = d.ender.slice(0, 27).map(decS).concat(new Array(27).fill(null)).slice(0, 27);
      if (d.mode && GMN[d.mode]) W.mode = d.mode;
      P.spawn = Array.isArray(d.spawn) && d.spawn.every(fin) ? d.spawn : null;
      P.effects = d.effects && typeof d.effects === 'object' ? d.effects : {};
      P.fly = !!d.fly && (W.mode === 'creative' || W.mode === 'spectator');
      if (fin(d.sel)) sel = clamp(d.sel | 0, 0, 8);
      if (P.hp <= 0) { P.hp = 20; P.food = 20; }
      return true;
    }
    function rpFor(pid, name) {
      let e = RP.get(pid);
      if (!e) { e = remotePlayer(pid, name || 'Player'); e.isHost = pid === NET.hostId; RP.set(pid, e); }
      return e;
    }
    function dropRP(pid) { const e = RP.get(pid); if (e) { delEnt(e); RP.delete(pid); } }
    function worldInfo() { return { seed: W.seed, type: W.type, name: W.name, wid: W.id, diff: W.diff, hardcore: W.hardcore, cheats: W.cheats, rules: W.rules, time: W.time, raining: W.raining, thunder: W.thunder, spawn: W.spawn, defMode: W.defMode || 'survival' }; }
    function sendInit(pid, name) {
      const pd = W.players && W.players[name];
      const pl = [{ pid: NET.me, name: P.name, host: 1 }].concat([...RP.values()].filter(e => e.pid !== pid).map(e => ({ pid: e.pid, name: e.name })));
      const be = []; W.be.forEach((v, k) => { if (v.items || v.text || v.kind !== undefined) be.push([k, v]); });
      netSendTo(pid, { t: 'init', w: worldInfo(), you: pd || null, pl, be });
      const parts = []; let cur = [], n = 0;
      W.edits.forEach((ed, k) => { cur.push(k, ed.size); ed.forEach((s, li) => { cur.push(li * 16384 + s); }); n += ed.size + 2; if (n > 9000) { parts.push(cur); cur = []; n = 0; } });
      if (cur.length) parts.push(cur);
      parts.forEach((p, i) => netSendTo(pid, { t: 'ed', i, n: parts.length, d: u32b64(new Uint32Array(p)) }));
      netSendTo(pid, { t: 'ready', n: parts.length });
      NET.synced.add(pid);
    }
    function applyEd(d) {
      const a = b64u32(d);
      for (let i = 0; i < a.length;) {
        const k = a[i], n = a[i + 1]; i += 2;
        const cx = Math.floor(k / 65536) - 32768, cz = (k % 65536) - 32768;
        let ed = W.edits.get(k); if (!ed) W.edits.set(k, ed = new Map());
        const c = colAt(cx, cz);
        for (let j = 0; j < n && i < a.length; j++, i++) {
          const v = a[i], li = Math.floor(v / 16384), s = v % 16384;
          if (s >= NSTATE) continue;
          ed.set(li, s);
          if (c && c.st >= 1) { const sy = li >> 12, l = li & 4095; setBlock(cx * 16 + (l & 15), sy * 16 + (l >> 8), cz * 16 + (l >> 4 & 15), s, 3); }
        }
      }
    }
    const KC = { mob: 0, item: 1, xp: 2, fall: 3, tnt: 4, arrow: 5, thrown: 6 };
    const r2 = v => Math.round(v * 100) / 100;
    function entSnap(e) {
      const k = KC[e.kind];
      const a = [e.id, k, r2(e.x), r2(e.y), r2(e.z)];
      if (k === 0) a.push(r2(e.yaw), r2(e.hyaw), r2(e.pitch || 0), (e.hurtT > 0 ? 1 : 0) | (e.baby ? 2 : 0) | (e.sheared ? 4 : 0) | (e.angry ? 8 : 0) | (e.dead ? 16 : 0) | (e.fire > 0 ? 32 : 0) | (e.see ? 64 : 0) | (e.target ? 128 : 0), e.type, e.color || '', e.fuse ?? -1, e.size || 0, e.swing || 0, e.eat || 0);
      else if (k === 1) a.push(e.st.id, e.st.n);
      else if (k === 2) a.push(e.v);
      else if (k === 3) a.push(e.s);
      else if (k === 4) a.push(e.fuse);
      else if (k === 5) a.push(r2(e.vx), r2(e.vy), r2(e.vz), e.stuck ? 1 : 0);
      else if (k === 6) a.push(e.type);
      return a;
    }
    function hostSnapshots() {
      for (const [pid, rp] of RP) {
        if (!NET.synced.has(pid)) continue;
        const L = [];
        for (const e of ENTS) { if (KC[e.kind] === undefined || e.dead === 2) continue; const d = (e.x - rp.x) ** 2 + (e.z - rp.z) ** 2; if (d < 96 * 96) L.push([d, e]); }
        L.sort((a, b) => a[0] - b[0]);
        netSendTo(pid, { t: 'es', e: L.slice(0, 90).map(q => entSnap(q[1])), tm: W.time, rn: W.raining ? 1 : 0, th: W.thunder ? 1 : 0, df: W.diff }, true);
      }
    }
    function mirrorOf(a) {
      const [id, k, x, y, z] = a;
      let e = entById.get(id);
      if (e && e.kindCode !== k) { delEnt(e); e = null; }
      if (!e) {
        if (k === 0) { e = spawnMob(a[9], x, y, z, { baby: !!(a[8] & 2), size: a[12] || 2, yaw: a[5] }); if (e && a[10]) e.color = a[10]; }
        else if (k === 1) e = spawnItem({ id: a[5], n: a[6], d: 0, _host: 1 }, x, y, z, 0, 0, 0, 0);
        else if (k === 2) e = addEnt({ kind: 'xp', v: a[5], x, y, z, px: x, py: y, pz: z, vx: 0, vy: 0, vz: 0, w: .5, h: .5, age: 0, life: 0, root: xpMesh(a[5]), hit: false });
        else if (k === 3) e = spawnFalling(a[5], x - .5, y, z - .5);
        else if (k === 4) e = spawnTNT(x - .5, y, z - .5, a[5]);
        else if (k === 5) e = spawnArrow(x, y, z, a[5], a[6], a[7], null, 0, false);
        else if (k === 6) e = spawnThrown(a[5], x, y, z, 0, 0, 0, null);
        if (!e) return null;
        entById.delete(e.id); e.id = id; entById.set(id, e); e.mirror = 1; e.kindCode = k;
        e.px = e.x = x; e.py = e.y = y; e.pz = e.z = z;
      }
      e.tx = x; e.ty = y; e.tz = z; e.seen = NET.snapN;
      if (k === 0) { e.tyaw = a[5]; e.hyaw = a[6]; e.pitch = a[7]; const f = a[8]; if (f & 1 && !(e.hurtT > 0)) e.hurtT = 10; e.sheared = !!(f & 4); if (e.wool) e.wool.root.visible = !e.sheared; e.angry = !!(f & 8); if (f & 16 && !e.dead) e.dead = 1; e.fire = f & 32 ? 2 : 0; e.see = !!(f & 64); e.target = f & 128 ? P : null; if (a[10]) e.color = a[10]; e.fuse = a[11]; if (a[13] > 0 && !(e.swing > 0)) e.swing = a[13]; e.eat = a[14]; }
      else if (k === 1 && e.st) e.st.n = a[6];
      else if (k === 4) e.fuse = a[5];
      else if (k === 5) { e.vx = a[5]; e.vy = a[6]; e.vz = a[7]; e.stuck = a[8]; }
      return e;
    }
    function applySnapshot(m) {
      NET.snapN = (NET.snapN || 0) + 1;
      if (Array.isArray(m.e)) for (const a of m.e) if (Array.isArray(a) && a.length >= 5 && [a[2], a[3], a[4]].every(fin)) mirrorOf(a);
      for (const e of ENTS.slice()) if (e.mirror && e.seen !== NET.snapN) delEnt(e);
      if (fin(m.tm)) { if (Math.abs(m.tm - W.time) > 40) W.time = m.tm; }
      W.raining = !!m.rn; W.thunder = !!m.th; if (fin(m.df)) W.diff = m.df;
    }
    function tickMirrors() {
      for (const e of ENTS) {
        if (!e.mirror) continue;
        e.px = e.x; e.py = e.y; e.pz = e.z; e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
        if (e.tx === undefined) continue;
        const k = e.kind === 'arrow' ? .6 : .35;
        e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.z += (e.tz - e.z) * k;
        if (e.kind === 'mob') {
          const dx = e.x - e.px, dz = e.z - e.pz, sp = Math.min(1, Math.hypot(dx, dz) * 4);
          e.limbAP = e.limbA; e.limbP = e.limb; e.limbA += (sp - e.limbA) * .4; e.limb += e.limbA;
          if (e.tyaw !== undefined) e.yaw = turn(e.yaw, e.tyaw, .6);
          if (e.hurtT > 0) e.hurtT--; if (e.swing > 0) e.swing--;
          if (e.dead) e.dead++;
          e.onGround = true;
        }
      }
      for (const e of RP.values()) {
        e.px = e.x; e.py = e.y; e.pz = e.z; e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
        if (e.tx === undefined) continue;
        if (Math.abs(e.tx - e.x) > 16 || Math.abs(e.ty - e.y) > 16 || Math.abs(e.tz - e.z) > 16) { e.x = e.px = e.tx; e.y = e.py = e.ty; e.z = e.pz = e.tz; }
        e.x += (e.tx - e.x) * .5; e.y += (e.ty - e.y) * .5; e.z += (e.tz - e.z) * .5;
        const dx = e.x - e.px, dz = e.z - e.pz, sp = Math.min(1, Math.hypot(dx, dz) * 4);
        e.limbAP = e.limbA; e.limbP = e.limb; e.limbA += (sp - e.limbA) * .4; e.limb += e.limbA * 1.2;
        e.yaw = turn(e.yaw, e.tyaw ?? e.yaw, .5); e.hyaw = e.tyaw ?? e.hyaw;
        if (e.hurtT > 0) e.hurtT--; if (e.swing > 0) e.swing--;
      }
    }
    function setRemoteHeld(e, id) {
      if (e.held === id) return;
      e.held = id;
      if (e.heldMesh) { e.md.parts.rarm.remove(e.heldMesh); e.heldMesh = null; }
      if (id >= 0 && IT[id]) { const m = itemMesh(id, isFlat(id) ? .55 : .35); m.position.set(-1 / 16, -10 / 16, -2 / 16); m.rotation.set(isFlat(id) ? -.3 : 0, isFlat(id) ? Math.PI / 2 : .6, isFlat(id) ? -.8 : 0); e.md.parts.rarm.add(m); e.heldMesh = m; }
    }
    function onPs(e, m) {
      if (![m.x, m.y, m.z].every(fin)) return;
      e.tx = m.x; e.ty = m.y; e.tz = m.z; if (e.y < -500) { e.x = e.px = m.x; e.y = e.py = m.y; e.z = e.pz = m.z; }
      if (fin(m.r)) e.tyaw = m.r; if (fin(m.p)) e.pitch = m.p;
      e.sneak = !!m.s; e.sleeping = !!m.sl; e.pdead = !!m.dd; e.mode = m.m || 'survival';
      e.root.visible = !m.dd && e.mode !== 'spectator';
      e.hit = !m.dd && e.mode !== 'spectator' && e.mode !== 'creative';
      if (fin(m.h)) setRemoteHeld(e, m.h | 0);
      if (m.sw) e.swing = 6;
      if (m.hr) e.hurtT = 10;
    }
    function myPs() { const h = held(); return { t: 'ps', x: r2(P.x), y: r2(P.y), z: r2(P.z), r: r2(P.yaw), p: r2(P.pitch), s: P.sneak ? 1 : 0, sl: P.sleeping ? 1 : 0, dd: P.dead ? 1 : 0, m: W.mode, h: h ? h.id : -1, sw: swingT === 0 ? 1 : 0, hr: P.hurtT === 19 ? 1 : 0 }; }
    function netTick() {
      if (!NET.role || !W) return;
      if (changes.length) {
        const c = changes.splice(0, changes.length);
        if (NET.role === 'host') netSend({ t: 'bc', c }); else if (NET.ready) netSend({ t: 'bc', c });
      }
      if (NET.role === 'guest' && !NET.ready) return;
      const ps = myPs();
      if (actQ) { Object.assign(ps, actQ); actQ = null; }
      if (NET.role === 'host') ps.pid = NET.me;
      netSend(ps, true);
      if (NET.role === 'host') {
        if (tickN % 2 === 0) hostSnapshots();
        if (tickN % 10 === 0) beSync();
        const all = [P].concat([...RP.values()].filter(e => !e.pdead && e.mode !== 'spectator'));
        if (all.length > 1 && all.every(p => p === P ? P.sleeping > 0 : p.sleeping)) { if (++NET.sleepT >= 100) { W.time = Math.ceil(W.time / 24000) * 24000; W.raining = W.thunder = false; NET.sleepT = 0; wake(); netSend({ t: 'wake' }); } } else NET.sleepT = 0;
      } else if (tickN % 100 === 0) netSend({ t: 'pdata', d: playerData() });
    }
    function beChanged(x, y, z) {
      const k = bk(x, y, z), v = W.be.get(k);
      if (!NET.role) return;
      if (NET.role === 'guest') netSend({ t: 'beset', k, v: v || null });
      else NET.beSent.delete(k);
    }
    function viewing(k, on) { if (NET.role === 'guest') netSend({ t: 'view', k, on: on ? 1 : 0 }); else if (NET.role === 'host') { const s = NET.viewers.get(NET.me) || new Set(); if (on) s.add(k); else s.delete(k); NET.viewers.set(NET.me, s); } }
    function beSync() {
      const keysV = new Set(); NET.viewers.forEach(s => s.forEach(k => keysV.add(k)));
      for (const k of keysV) {
        const v = W.be.get(k), js = JSON.stringify(v || null);
        if (NET.beSent.get(k) === js) continue;
        NET.beSent.set(k, js);
        NET.viewers.forEach((s, pid) => { if (pid !== NET.me && s.has(k)) netSendTo(pid, { t: 'be', k, v: v || null }); });
      }
    }
    const sanBE = v => { if (!v || typeof v !== 'object') return null; const o = {}; if (Array.isArray(v.items)) o.items = v.items.slice(0, 54).map(decS); for (const s of ['i', 'f', 'o']) if (s in v) o[s] = decS(v[s]); for (const n of ['b', 'bm', 'c', 'ct', 'xp']) if (fin(v[n])) o[n] = v[n]; if (typeof v.kind === 'string') o.kind = v.kind; if (Array.isArray(v.text)) o.text = v.text.slice(0, 4).map(t => String(t || '').slice(0, 15)); if (v.disc) o.disc = decS(v.disc); if (v.shulker) o.shulker = 1; if (typeof v.title === 'string') o.title = v.title.slice(0, 40); return o; };
    function hostData(m, from) {
      const rp = RP.get(from);
      if (m.t === 'hello' && (!W || scr !== 'game' || W.remote)) { NET.pendHello.push([m, from]); return; }
      if (m.t === 'hello') {
        const name = String(m.name || NET.names.get(from) || 'Player').slice(0, 16);
        const e = rpFor(from, name); e.name = name;
        sendInit(from, name);
        chatSys(name + ' joined the game', '#ffff55'); netSend({ t: 'chat', m: name + ' joined the game', c: '#ffff55' });
        netSend({ t: 'pj', pid: from, name });
        return;
      }
      if (!rp) return;
      const T = m.t;
      if (T === 'ps') { onPs(rp, m); m.pid = from; for (const [pid] of RP) if (pid !== from && NET.synced.has(pid)) netSendTo(pid, m, true); return; }
      if (T === 'bc') { const c = m.c; if (Array.isArray(c)) for (let i = 0; i + 3 < c.length && i < 40000; i += 4) applyChange(c[i], c[i + 1], c[i + 2], c[i + 3], 0); return; }
      if (T === 'drop') { const s = decS(m.s); if (s && [m.x, m.y, m.z].every(fin)) { s._host = 1; spawnItem(s, m.x, m.y, m.z, fin(m.vx) ? m.vx : undefined, fin(m.vy) ? m.vy : undefined, fin(m.vz) ? m.vz : undefined, fin(m.d) ? m.d : 40); } return; }
      if (T === 'atk') { const e = entById.get(m.id); if (e && fin(m.d)) hurtEnt(e, clamp(m.d, 0, 100), rp, m.k || 'player', fin(m.kx) ? m.kx : undefined, fin(m.kz) ? m.kz : undefined); return; }
      if (T === 'mi') { const e = entById.get(m.id); if (!e || e.kind !== 'mob') return; const a = String(m.a || ''); if (a === 'love') { e.love = 600; for (let i = 0; i < 5; i++) particle(e.x, e.y + e.h, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, 0, 1); } else if (a === 'shear' && e.type === 'sheep' && !e.sheared) { e.sheared = true; if (e.wool) e.wool.root.visible = false; spawnItem({ id: IN[e.color + '_wool'].idx, n: 1 + ri(3) }, e.x, e.y + 1, e.z); } else if (a.startsWith('dye:') && e.type === 'sheep' && DYE[a.slice(4)]) e.color = a.slice(4); else if (a === 'milk') { } return; }
      if (T === 'spawn') { if (MT[m.m] && [m.x, m.y, m.z].every(fin)) spawnMob(m.m, m.x, m.y, m.z, { persist: true }); return; }
      if (T === 'throw') { if ([m.x, m.y, m.z, m.vx, m.vy, m.vz].every(fin)) spawnThrown(String(m.ty), m.x, m.y, m.z, m.vx, m.vy, m.vz, rp); return; }
      if (T === 'arrow') { if ([m.x, m.y, m.z, m.vx, m.vy, m.vz].every(fin)) spawnArrow(m.x, m.y, m.z, m.vx, m.vy, m.vz, rp, fin(m.d) ? clamp(m.d, 0, 30) : 2, !!m.p); snd('bow', rp); return; }
      if (T === 'tnt') { if ([m.x, m.y, m.z].every(fin)) spawnTNT(m.x | 0, m.y | 0, m.z | 0); return; }
      if (T === 'bonemeal') { if ([m.x, m.y, m.z].every(fin)) { const s = getS(m.x, m.y, m.z); if (s > 0) boneMeal(m.x, m.y, m.z, s, TT[STT[s]]); } return; }
      if (T === 'chat') { const line = String(m.m || '').slice(0, 300); chatSys(line, m.c); for (const [pid] of RP) if (pid !== from) netSendTo(pid, { t: 'chat', m: line, c: m.c }); return; }
      if (T === 'cmd') { runCommand(String(m.s || '').slice(0, 300), rp); return; }
      if (T === 'pdata') { if (m.d && typeof m.d === 'object') { W.players = W.players || {}; W.players[rp.name] = m.d; } return; }
      if (T === 'beget') { const k = String(m.k || ''); const v = W.be.get(k); netSendTo(from, { t: 'be', k, v: v || null }); return; }
      if (T === 'beset') { const k = String(m.k || ''); if (!/^-?\d+,-?\d+,-?\d+$/.test(k)) return; const v = sanBE(m.v); const old = W.be.get(k); if (v) { if (old) { for (const n in v) old[n] = v[n]; } else W.be.set(k, v); } NET.beSent.delete(k); if (guiPos && bk(guiPos[0], guiPos[1], guiPos[2]) === k) guiBE = W.be.get(k); return; }
      if (T === 'view') { const s = NET.viewers.get(from) || new Set(); if (m.on) s.add(String(m.k)); else s.delete(String(m.k)); NET.viewers.set(from, s); return; }
      if (T === 'relay') { if (m.to === NET.me) { hostData(m.m, from); return; } if (RP.has(m.to) && m.m && typeof m.m === 'object') netSendTo(m.to, Object.assign({}, m.m, { from })); return; }
      if (T === 'hurt') { if (fin(m.d)) hurtPlayer(clamp(m.d, 0, 100), fin(m.sx) ? m.sx : null, fin(m.sz) ? m.sz : null, m.k === 'player' ? 'player' : 'mob'); return; }
      if (T === 'give') { const s = decS(m.s); if (s) giveOrDrop(s); return; }
      if (T === 'xp') { if (fin(m.v)) addXp(m.v); return; }
      if (T === 'sleep') { rp.sleeping = !!m.v; return; }
      if (T === 'respawn') { rp.pdead = false; return; }
    }
    function guestData(m, from) {
      const T = m.t;
      if (T === 'init') { guestInit(m); return; }
      if (!W || !NET.wInit) return;
      if (T === 'ed') { if (typeof m.d === 'string') applyEd(m.d); NET.edGot++; loadP = m.n ? NET.edGot / m.n * .5 : .5; return; }
      if (T === 'ready') { NET.ready = true; return; }
      if (T === 'bc') { const c = m.c; if (Array.isArray(c)) for (let i = 0; i + 3 < c.length; i += 4) applyChange(c[i], c[i + 1], c[i + 2], c[i + 3], 3); return; }
      if (T === 'es') { applySnapshot(m); return; }
      if (T === 'ps') { const pid = m.pid; if (!pid || pid === NET.me) return; const e = rpFor(pid, NET.names.get(pid) || 'Player'); onPs(e, m); return; }
      if (T === 'pj') { if (m.pid !== NET.me) { NET.names.set(m.pid, String(m.name || 'Player')); const e = rpFor(m.pid, m.name); e.name = m.name; } return; }
      if (T === 'pl') { dropRP(m.pid); return; }
      if (T === 'chat') { chatSys(String(m.m || '').slice(0, 300), m.c); return; }
      if (T === 'give') { const s = decS(m.s); if (s) { const left = giveItem(s); if (left > 0) throwStack({ id: s.id, n: left, d: s.d, x: s.x }, false); snd('pop'); } return; }
      if (T === 'xp') { if (fin(m.v)) addXp(m.v); return; }
      if (T === 'hurt') { if (fin(m.d)) { hurtPlayer(clamp(m.d, 0, 1000), fin(m.sx) ? m.sx : null, fin(m.sz) ? m.sz : null, m.k || 'mob'); if (fin(m.kx) && fin(m.kz)) { P.vx += m.kx; P.vy += m.ky || 0; P.vz += m.kz; } } return; }
      if (T === 'boom') { if ([m.x, m.y, m.z].every(fin)) boomFx(m.x, m.y, m.z, m.p || 4); return; }
      if (T === 'snd') { if (typeof m.n === 'string' && [m.x, m.y, m.z].every(fin)) snd(m.n, { x: m.x, y: m.y, z: m.z }); return; }
      if (T === 'be') { const k = String(m.k || ''); const v = sanBE(m.v); if (v) { const old = W.be.get(k); if (old) { for (const n in v) old[n] = v[n]; } else W.be.set(k, v); } else W.be.delete(k); if (guiPos && bk(guiPos[0], guiPos[1], guiPos[2]) === k && W.be.get(k)) guiBE = W.be.get(k); signDirty = true; return; }
      if (T === 'wake') { wake(); return; }
      if (T === 'w') { if (m.w) Object.assign(W, { rules: m.w.rules || W.rules, cheats: !!m.w.cheats }); return; }
      void from;
    }
    function boomFx(x, y, z, p) { snd('explode', { x, y, z }); for (let i = 0; i < 30; i++) particle(x + (RNG() - .5) * p, y + (RNG() - .5) * p, z + (RNG() - .5) * p, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [230, 230, 230], 1 + RNG(), .3 + RNG() * .3, -1, 1); }
    function guestInit(m) {
      const w = m.w || {};
      if (!fin(w.seed)) return;
      if (W && NET.wInit && W.id === w.wid) { NET.ready = false; return; }
      closeWorld();
      openWorldObj({ id: w.wid, name: String(w.name || 'Multiplayer'), seed: w.seed | 0, type: WTYPES.includes(w.type) ? w.type : 'default', mode: w.defMode || 'survival', defMode: w.defMode, diff: fin(w.diff) ? w.diff : 2, hardcore: !!w.hardcore, cheats: !!w.cheats, rules: Object.assign(defRules(), w.rules || {}), time: fin(w.time) ? w.time : 1000, raining: !!w.raining, thunder: !!w.thunder, spawn: Array.isArray(w.spawn) ? w.spawn : null, remote: true });
      NET.wInit = true; NET.ready = false; NET.edGot = 0;
      if (!applyPlayerData(m.you)) { if (W.spawn) { P.x = W.spawn[0]; P.y = W.spawn[1]; P.z = W.spawn[2]; P.place = true; } }
      if (Array.isArray(m.be)) for (const [k, v] of m.be) { const s = sanBE(v); if (s && typeof k === 'string') W.be.set(k, s); }
      if (Array.isArray(m.pl)) for (const p of m.pl) { if (!p || p.pid === NET.me) continue; NET.names.set(p.pid, String(p.name || 'Player')); const e = rpFor(p.pid, p.name); e.name = p.name; e.isHost = !!p.host; }
      scr = 'loading'; loadMsg = 'Downloading terrain...'; loadP = 0;
    }
    let netBound = false;
    function bindNet() {
      if (netBound || !api.net) return;
      netBound = true;
      api.net.on('data', (m, from) => {
        if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
        try { if (NET.role === 'host') hostData(m, from); else if (NET.role === 'guest') guestData(m, from); } catch (e) { if (window.console) console.warn(e); }
      });
      api.net.on('join', p => { if (NET.role === 'host' && p && p.name) NET.names.set(p.id, p.name); });
      api.net.on('leave', p => {
        if (!NET.role || !p) return;
        const e = RP.get(p.id);
        if (e) { if (NET.role === 'host' && e.lastPd) { } chatSys(e.name + ' left the game', '#ffff55'); if (NET.role === 'host') { netSend({ t: 'chat', m: e.name + ' left the game', c: '#ffff55' }); netSend({ t: 'pl', pid: p.id }); } }
        dropRP(p.id); NET.synced.delete(p.id); NET.viewers.delete(p.id);
      });
      api.net.on('close', r => { if (NET.role === 'guest') { NET.role = null; discMsg = r === 'kick' ? 'You were kicked from the game' : 'The host closed the game or the connection was lost'; afterLeave(); scr = 'disc'; } else if (NET.role === 'host') { NET.role = null; for (const k of [...RP.keys()]) dropRP(k); chatSys('Party closed', '#aaaaaa'); } });
      api.net.on('lobby', () => { if (NET.role === 'guest') { NET.inLobby = true; chatSys('The host is inviting more players...', '#aaaaaa'); roomAgain(); } });
    }
    function roomOpts() { return { title: 'Minecraft', text: 'Play together on the same Wi-Fi / LAN or online. The host shares their world.', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 4, max: 8, min: 2, name: myName() }; }
    function roomAgain() {
      api.net.room(roomOpts()).then(r => { NET.inLobby = false; if (!r) { leaveMP(); return; } if (r.role === 'guest' && W && NET.wInit) { NET.ready = true; } });
    }
    function startRoom(onHost) {
      if (!api.net || !api.net.room) { discMsg = 'Multiplayer is not available here'; scr = 'disc'; return; }
      bindNet();
      releaseMouse();
      NET.inLobby = true;
      api.net.room(roomOpts()).then(r => {
        NET.inLobby = false;
        if (!r) { if (onHost && onHost.cancel) onHost.cancel(); return; }
        NET.me = r.id;
        const me = (r.players || []).find(p => p.id === r.id);
        if (me && me.name) P.name = me.name;
        for (const p of r.players || []) NET.names.set(p.id, p.name);
        if (r.role === 'host') {
          NET.role = 'host'; NET.hostId = r.id;
          if (onHost && onHost.host) onHost.host();
          chatSys('Party open! Code: ' + (api.net.code || ''), '#55ff55');
        } else {
          if (scr === 'game' && W && NET.role !== 'guest') { saveNow(); closeWorld(); }
          NET.role = 'guest'; NET.wInit = false; NET.ready = false;
          const h = (r.players || []).find(p => p.host); NET.hostId = h ? h.id : null;
          scr = 'waiting'; loadMsg = 'Connecting to ' + (h ? h.name : 'the host') + '...'; loadP = 0;
          netSend({ t: 'hello', name: P.name });
        }
      }, () => { NET.inLobby = false; });
    }
    function openToLan() { if (NET.role === 'guest') return; gui = null; startRoom({ host: () => { gui = null; lockMouse(); }, cancel: () => { if (scr === 'game') gui = 'pause'; } }); }
    function joinParty() { P.name = myName(); startRoom({ host: () => { mpMode = 'host'; NET.pendHost = true; chatSys('Choose a world to host', '#ffff55'); goWorlds(); }, cancel: () => { } }); }
    function leaveMP() { if (NET.role) { try { api.net.close(); } catch (e) { } } NET.role = null; afterLeave(); }
    function afterLeave() { for (const k of [...RP.keys()]) dropRP(k); NET.synced.clear(); NET.viewers.clear(); NET.wInit = false; NET.ready = false; NET.inLobby = false; if (W && W.remote) closeWorld(); }
    function hostAfterOpen() { for (const p of api.net.players || []) if (p.id !== NET.me) NET.names.set(p.id, p.name); const q = NET.pendHello.splice(0); for (const [m, from] of q) hostData(m, from); }
    const DBN = 'gameplay-minecraft';
    let dbP = null, saveT = 0, saving = false;
    function db() {
      if (!dbP) dbP = new Promise(res => {
        try {
          const r = indexedDB.open(DBN, 1);
          r.onupgradeneeded = () => { const d = r.result; for (const s of ['meta', 'data']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' }); };
          r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null);
          setTimeout(() => res(null), 4000);
        } catch (e) { res(null); }
      });
      return dbP;
    }
    const LSK = 'gameplay:mc:';
    const lsGet = k => { try { return JSON.parse(localStorage.getItem(LSK + k) || 'null'); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(LSK + k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    function kv(store, op, val) {
      return db().then(d => {
        if (!d) {
          const idx = lsGet(store + 'idx') || [];
          if (op === 'all') return idx.map(id => lsGet(store + ':' + id)).filter(Boolean);
          if (op === 'get') return lsGet(store + ':' + val);
          if (op === 'put') { if (!idx.includes(val.id)) { idx.push(val.id); lsSet(store + 'idx', idx); } lsSet(store + ':' + val.id, val); return true; }
          if (op === 'del') { lsSet(store + 'idx', idx.filter(i => i !== val)); try { localStorage.removeItem(LSK + store + ':' + val); } catch (e) { } return true; }
          return null;
        }
        return new Promise(res => {
          try {
            const tx = d.transaction(store, op === 'all' || op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(store);
            const r = op === 'all' ? st.getAll() : op === 'get' ? st.get(val) : op === 'put' ? st.put(val) : st.delete(val);
            r.onsuccess = () => res(op === 'all' || op === 'get' ? r.result : true); r.onerror = () => res(op === 'all' ? [] : null);
          } catch (e) { res(op === 'all' ? [] : null); }
        });
      });
    }
    function listWorlds() { return kv('meta', 'all').then(l => (l || []).filter(w => w && w.id).sort((a, b) => (b.last || 0) - (a.last || 0))); }
    function deleteWorld(id) { return Promise.all([kv('meta', 'del', id), kv('data', 'del', id)]); }
    function renameWorld(id, name) { return kv('meta', 'get', id).then(m => m ? kv('meta', 'put', Object.assign(m, { name })) : null); }
    function metaOf() { return { id: W.id, name: W.name, folder: W.folder || W.name, seed: W.seed, type: W.type, mode: W.mode, defMode: W.defMode, hardcore: W.hardcore, diff: W.diff, cheats: W.cheats, created: W.created || Date.now(), last: Date.now(), rules: W.rules }; }
    function worldData() {
      const edits = []; W.edits.forEach((ed, k) => { const a = new Uint32Array(ed.size); let i = 0; ed.forEach((s, li) => { a[i++] = li * 16384 + s; }); edits.push([k, u32b64(a)]); });
      const be = []; W.be.forEach((v, k) => be.push([k, v]));
      const ents = [];
      for (const e of ENTS) {
        if (e.mirror) continue;
        if (e.kind === 'mob' && !e.dead) ents.push({ k: 'mob', type: e.type, x: r2(e.x), y: r2(e.y), z: r2(e.z), yaw: r2(e.yaw), hp: e.hp, baby: !!e.baby, color: e.color, sheared: !!e.sheared, persist: !!e.persist, size: e.size });
        else if (e.kind === 'item' && e.st) ents.push({ k: 'item', s: encS(e.st), x: r2(e.x), y: r2(e.y), z: r2(e.z), life: e.life });
        else if (e.kind === 'xp') ents.push({ k: 'xp', v: e.v, x: r2(e.x), y: r2(e.y), z: r2(e.z) });
      }
      return { id: W.id, edits, be, ents, player: playerData(), players: W.players || {}, time: W.time, raining: W.raining, thunder: W.thunder, weatherT: W.weatherT, spawn: W.spawn, visited: [...(W.visited || [])], bonusDone: !!W.bonusDone };
    }
    function saveNow() {
      if (!W || W.pano) return Promise.resolve();
      if (W.remote) { netSend({ t: 'pdata', d: playerData() }); return Promise.resolve(); }
      if (W.hardcore && P.dead && W.mode === 'spectator') { }
      let meta, data;
      try { meta = metaOf(); data = worldData(); } catch (e) { return Promise.resolve(); }
      saving = true;
      return Promise.all([kv('meta', 'put', meta), kv('data', 'put', data)]).then(r => { saving = false; return r; }, () => { saving = false; });
    }
    function saveSoon() { clearTimeout(saveT); saveT = setTimeout(() => saveNow(), 800); }
    api.on(window, 'pagehide', () => { saveNow(); });
    api.on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });
    function restoreData(d) {
      if (!d) return;
      if (Array.isArray(d.edits)) for (const [k, b] of d.edits) { if (typeof b !== 'string') continue; const a = b64u32(b), ed = new Map(); for (const v of a) { const s = v % 16384; if (s < NSTATE) ed.set(Math.floor(v / 16384), s); } W.edits.set(k, ed); }
      if (Array.isArray(d.be)) for (const [k, v] of d.be) if (v) W.be.set(k, v);
      if (d.players) W.players = d.players;
      if (fin(d.time)) W.time = d.time;
      W.raining = !!d.raining; W.thunder = !!d.thunder; if (fin(d.weatherT)) W.weatherT = d.weatherT;
      if (Array.isArray(d.spawn)) W.spawn = d.spawn;
      W.visited = new Set(d.visited || []); W.bonusDone = !!d.bonusDone;
      applyPlayerData(d.player);
      if (d.player && d.player.dead) { P.dead = false; }
      W.pendEnts = Array.isArray(d.ents) ? d.ents : [];
    }
    function spawnSaved() {
      const L = W.pendEnts; W.pendEnts = null;
      if (!L) return;
      for (const o of L) {
        if (!o || ![o.x, o.y, o.z].every(fin)) continue;
        if (o.k === 'mob' && MT[o.type]) { const e = spawnMob(o.type, o.x, o.y, o.z, { baby: o.baby, size: o.size, yaw: o.yaw, hp: o.hp, persist: o.persist }); if (e) { if (o.color) e.color = o.color; if (o.sheared) { e.sheared = true; if (e.wool) e.wool.root.visible = false; } e.persist = !!o.persist; } }
        else if (o.k === 'item') { const s = decS(o.s); if (s) { const e = spawnItem(s, o.x, o.y, o.z, 0, 0, 0, 0); if (e && fin(o.life)) e.life = o.life; } }
        else if (o.k === 'xp') spawnXp(o.v | 0, o.x, o.y, o.z);
      }
    }
    let panoReady = false, panoA = 0, acc = 0, fpsN = 0, fpsT = 0, loadT0 = 0, selfE = null, handG = null, handArm = null, handItem = null, handId = -2, lightF = 0, rainP = null, flash = 0;
    const V3 = new THREE.Vector3(), V3b = new THREE.Vector3();
    const stopMusic = () => { };
    function burstAt(x, y, z, rgb, n) { for (let i = 0; i < n * 3; i++) particle(x, y + .2, z, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, rgb, .6, .08, 6); }
    P.name = myName();
    function remeshAll() { if (!W) return; FANCY = SET.fancy; W.cols.forEach(c => { if (c.meshed) for (let s = 0; s < NSEC; s++) if (c.s[s] || c.m[s]) { c.md[s] = 1; W.dirty.add(c); } }); }
    function resetPlayer() {
      Object.assign(P, { x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, fall: 0, fly: false, xp: 0, lvl: 0, score: 0, dead: false, sleeping: 0, effects: {}, fire: 0, absorb: 0, spawn: null, hurtT: 0, place: true, yaw: 0, pitch: 0 });
      inv = new Array(36).fill(null); armor = [null, null, null, null]; offhand = null; craft2.fill(null); craft3.fill(null); cursor = null; sel = 0; ender = new Array(27).fill(null);
      gui = null; mine = null; eating = null; drawing = null; attackHeld = useHeld = false; chatOpen = false;
    }
    function closeWorld() {
      if (!W) return;
      for (const e of ENTS.slice()) delEnt(e);
      RP.clear();
      for (const [k, c] of [...W.cols]) unloadCol(c, k);
      for (const w of W.workers) { try { w.w.terminate(); } catch (e) { } }
      W.workers = []; SCHED.clear(); SCHK.clear(); changes.length = 0; stopDisc();
      W = null; panoReady = false;
    }
    function openWorldObj(o) {
      closeWorld();
      W = makeWorld({ seed: o.seed, type: o.type });
      Object.assign(W, { id: o.id || null, name: o.name || 'World', folder: o.folder || o.name, mode: o.mode || 'survival', defMode: o.defMode || o.mode || 'survival', diff: o.diff ?? 2, hardcore: !!o.hardcore, cheats: !!o.cheats, rules: Object.assign(defRules(), o.rules || {}), time: o.time ?? 0, raining: !!o.raining, thunder: !!o.thunder, weatherT: o.weatherT || 12000 + ri(100000), dim: 'overworld', players: {}, remote: !!o.remote, pano: !!o.pano, created: o.created || Date.now(), visited: new Set(), bonus: !!o.bonus });
      W.spawn = Array.isArray(o.spawn) ? o.spawn : W.gen.spawn();
      hooks.onSet = onSetHook;
      hooks.colLoaded = colLoaded;
      resetPlayer();
      P.x = P.px = W.spawn[0]; P.y = P.py = W.spawn[1]; P.z = P.pz = W.spawn[2];
      P.name = NET.role ? P.name : myName();
      startWorkers();
      tickN = 0; simT = 0; acc = 0; loadT0 = performance.now(); NET.ready = !o.remote; FANCY = SET.fancy;
      if (!o.pano) { scr = 'loading'; loadMsg = 'Loading terrain...'; loadP = 0; }
      return W;
    }
    function startPano() {
      if (W) return;
      openWorldObj({ seed: 20260316, type: 'default', mode: 'spectator', pano: true, time: 6000 });
      scr = 'title';
    }
    function openWorld(id, host) {
      scr = 'loading'; loadMsg = 'Loading world...'; loadP = 0;
      Promise.all([kv('meta', 'get', id), kv('data', 'get', id)]).then(([m, d]) => {
        if (!m) { goWorlds(); return; }
        openWorldObj(Object.assign({}, m, { time: d ? d.time : 0, spawn: d && d.spawn }));
        restoreData(d);
        W.created = m.created;
        afterOpen(host);
      });
    }
    function createWorld(cfg, host) {
      const id = 'w' + Date.now().toString(36) + ri(1e6).toString(36), hc = cfg.mode === 'hardcore';
      openWorldObj({ id, name: cfg.name, seed: parseSeed(cfg.seed), type: cfg.type, mode: hc ? 'survival' : cfg.mode, defMode: hc ? 'survival' : cfg.mode, diff: hc ? 3 : cfg.diff, hardcore: hc, cheats: !hc && cfg.cheats, rules: cfg.rules, time: 0, bonus: cfg.bonus });
      loadMsg = 'Generating world...';
      saveNow();
      afterOpen(host);
    }
    function afterOpen(host) {
      if (host && NET.role !== 'host') startRoom({ host: () => { hostAfterOpen(); }, cancel: () => { } });
      else if (NET.role === 'host') NET.pendOpen = true;
    }
    function quitToTitle() {
      gui = null;
      const fin2 = () => { if (NET.role) leaveMP(); closeWorld(); scr = 'title'; startPano(); };
      if (W && !W.remote) { scr = 'loading'; loadMsg = 'Saving world'; saveNow().then(fin2, fin2); } else fin2();
    }
    function colLoaded(c) {
      if (!W || W.pano || W.remote) return;
      const k = ck(c.cx, c.cz);
      if (W.visited.has(k)) return;
      W.visited.add(k);
      if (W.edits.has(k) || RNG() > .1 || W.rules.doMobSpawning === false) return;
      const x = c.cx * 16 + 2 + ri(12), z = c.cz * 16 + 2 + ri(12);
      let y = -1;
      for (let s = c.top; s >= 0 && y < 0; s--) { const sec = c.s[s]; if (!sec) continue; for (let yy = 15; yy >= 0; yy--) { const b = sec[(x & 15) | (z & 15) << 4 | yy << 8]; if (b) { y = s * 16 + yy; break; } } }
      if (y < 0 || !isT(c.s[y >> 4][(x & 15) | (z & 15) << 4 | (y & 15) << 8], 'grass_block')) return;
      const B = W.gen.BIO[c.bio[(x & 15) | (z & 15) << 4]] || {};
      const types = B.td < .2 ? ['sheep', 'pig', 'chicken'] : ['sheep', 'pig', 'cow', 'chicken', 'sheep', 'cow'];
      const ty = types[ri(types.length)], n = 2 + ri(3);
      W.pendSpawn = W.pendSpawn || [];
      for (let i = 0; i < n; i++) W.pendSpawn.push([ty, x + .5 + (RNG() - .5) * 3, y + 1, z + .5 + (RNG() - .5) * 3]);
    }
    function flushPendSpawn() {
      if (!W.pendSpawn || !W.pendSpawn.length) return;
      const L = W.pendSpawn; W.pendSpawn = [];
      for (const [ty, x, y, z] of L) { const b = getS(Math.floor(x), Math.floor(y) - 1, Math.floor(z)); if (SOL[b] === 1 && getS(Math.floor(x), Math.floor(y), Math.floor(z)) === 0 || REP[getS(Math.floor(x), Math.floor(y), Math.floor(z))]) spawnMob(ty, x, y, z, { persist: true }); }
    }
    function streamChunks(budget) {
      const t0 = performance.now(), cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4, rd = W.pano ? Math.min(SET.rd, 5) : SET.rd, R = rd + 1;
      let req = 0;
      for (let r = 0; r <= R && req < 6 && W.wbusy < 8; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        if (dx * dx + dz * dz > (R + .5) * (R + .5)) continue;
        if (!W.cols.has(ck(cx0 + dx, cz0 + dz))) { requestGen(cx0 + dx, cz0 + dz); req++; if (req >= 6 || W.wbusy >= 8) break; }
      }
      if (W.genQ.size) genSync(Math.min(budget, 12));
      const cand = [];
      W.cols.forEach((c, k) => {
        const dx = c.cx - cx0, dz = c.cz - cz0, d = dx * dx + dz * dz;
        if (d > (rd + 3.5) * (rd + 3.5)) { unloadCol(c, k); return; }
        if (c.st === 1 || (c.st === 2 && !c.meshed && d <= (rd + .5) * (rd + .5))) cand.push([d, c]);
      });
      cand.sort((a, b) => a[0] - b[0]);
      for (const [, c] of cand) {
        if (performance.now() - t0 > budget) break;
        if (c.st === 1) { lightColumn(c); continue; }
        let ok = true;
        for (let dz = -1; dz <= 1 && ok; dz++) for (let dx = -1; dx <= 1 && ok; dx++) { const n = colAt(c.cx + dx, c.cz + dz); if (!n || n.st < 2) ok = false; }
        if (!ok) continue;
        for (let s = 0; s < NSEC; s++) { if (c.s[s]) { meshSection(c, s); setSecMesh(c, s); } }
        c.meshed = true; c.md.fill(0);
      }
      if (W.dirty.size) {
        const L = [...W.dirty].map(c => [(c.cx - cx0) ** 2 + (c.cz - cz0) ** 2, c]).sort((a, b) => a[0] - b[0]);
        for (const [, c] of L) {
          if (performance.now() - t0 > budget + 4) break;
          if (!W.cols.has(ck(c.cx, c.cz))) { W.dirty.delete(c); continue; }
          for (let s = 0; s < NSEC; s++) if (c.md[s]) { c.md[s] = 0; meshSection(c, s); setSecMesh(c, s); }
          W.dirty.delete(c);
        }
      }
    }
    function nearMeshed(r) {
      const cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4; let n = 0, t = 0;
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { t++; const c = colAt(cx0 + dx, cz0 + dz); if (c && c.meshed) n++; }
      return n / t;
    }
    function placeBonusChest() {
      if (!W.bonus || W.bonusDone) return;
      W.bonusDone = true;
      const x = Math.floor(P.x) + 2, z = Math.floor(P.z) + 1; let y = H - 2;
      while (y > 1 && !SOL[getS(x, y, z)]) y--;
      y++;
      setBlock(x, y, z, S('chest', { facing: 'south' }));
      initBlockEntity(x, y, z, TN.chest, null);
      const be = beAt(x, y, z, true); be.items = be.items || new Array(27).fill(null);
      const put = (n, c) => { if (IN[n]) { const i = ri(27); if (!be.items[i]) be.items[i] = { id: IN[n].idx, n: c, d: 0 }; else be.items[be.items.indexOf(null)] = { id: IN[n].idx, n: c, d: 0 }; } };
      put('stick', 12); put('oak_planks', 12); put('oak_log', 3); put('wooden_axe', 1); put('wooden_pickaxe', 1); put('apple', 5); put('bread', 3); put('salmon', 3);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!getS(x + dx, y, z + dz) && SOL[getS(x + dx, y - 1, z + dz)]) setBlock(x + dx, y, z + dz, S('torch'));
    }
    function trySpawnHostile(pl) {
      const a = RNG() * Math.PI * 2, d = 24 + RNG() * 40, x = Math.floor(pl.x + Math.cos(a) * d), z = Math.floor(pl.z + Math.sin(a) * d);
      const c = colAt(x >> 4, z >> 4); if (!c || !c.meshed) return;
      const y0 = Math.floor(pl.y);
      for (let k = 0; k < 6; k++) {
        const y = y0 - 24 + ri(48);
        if (y < 1 || y >= H - 3) continue;
        const fl = getS(x, y - 1, z);
        if (SOL[fl] !== 1 || getS(x, y, z) !== 0 || getS(x, y + 1, z) !== 0 || FLU[fl] || isT(fl, 'bedrock') && false) continue;
        const L = getL(x, y, z), bl = L & 15, sk = L >> 4, dark = Math.round((1 - sunB) * 11) + (W.thunder ? 5 : W.raining ? 3 : 0);
        if (bl > 0 || Math.max(0, sk - dark) > ri(8)) continue;
        const B = W.gen.BIO[bio(x, z)] || {};
        if (B.n === 'Mushroom Fields' || B.n === 'Deep Dark') return;
        const r = RNG(), ty = r < .24 ? 'zombie' : r < .48 ? 'skeleton' : r < .7 ? 'creeper' : r < .92 ? 'spider' : r < .97 ? 'enderman' : (y < CFG.YOFF + 40 && hash3(x >> 4, 7, z >> 4) < .1 || /Swamp/.test(B.n || '')) ? 'slime' : 'zombie';
        if (ty === 'spider' && (getS(x + 1, y, z) || getS(x - 1, y, z) || getS(x, y, z + 1))) return;
        if (ty === 'enderman' && getS(x, y + 2, z)) return;
        let dmin = 1e9; for (const p of playersList()) dmin = Math.min(dmin, (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2);
        if (dmin < 24 * 24) return;
        const n = ty === 'zombie' ? 1 + ri(3) : ty === 'enderman' ? 1 : 1 + ri(2);
        for (let i = 0; i < n; i++) { const xx = x + .5 + (i ? ri(3) - 1 : 0), zz = z + .5 + (i ? ri(3) - 1 : 0); if (SOL[getS(Math.floor(xx), y - 1, Math.floor(zz))] === 1 && !getS(Math.floor(xx), y, Math.floor(zz)) && !getS(Math.floor(xx), y + 1, Math.floor(zz))) spawnMob(ty, xx, y, zz, { size: ty === 'slime' ? [1, 2, 4][ri(3)] : undefined }); }
        return;
      }
    }
    function spawnTick() {
      if (W.rules.doMobSpawning === false || W.pano) return;
      const pls = playersList().filter(p => !p.dead && (p === P ? mode() !== 'spectator' : p.mode !== 'spectator'));
      if (!pls.length) return;
      if (W.diff > 0 && tickN % 4 === 0) {
        let n = 0; for (const e of ENTS) if (e.kind === 'mob' && MT[e.type].hostile) n++;
        if (n < CFG.HOSTILE_CAP * Math.min(3, pls.length)) trySpawnHostile(pls[ri(pls.length)]);
      }
      if (tickN % 400 === 0) {
        let n = 0; for (const e of ENTS) if (e.kind === 'mob' && !MT[e.type].hostile) n++;
        if (n < CFG.PASSIVE_CAP) {
          const pl = pls[ri(pls.length)], a = RNG() * 6.283, d = 24 + RNG() * 30, x = Math.floor(pl.x + Math.cos(a) * d), z = Math.floor(pl.z + Math.sin(a) * d), y = topY(x, z);
          if (y > 0 && isT(getS(x, y, z), 'grass_block') && (getL(x, y + 1, z) >> 4) >= 9 && !getS(x, y + 1, z)) { const ty = ['pig', 'cow', 'sheep', 'chicken'][ri(4)]; for (let i = 0; i < 2 + ri(2); i++) spawnMob(ty, x + .5 + ri(3) - 1, y + 1, z + .5 + ri(3) - 1, { persist: true }); }
        }
      }
    }
    function tickEnts() {
      for (const e of ENTS.slice()) {
        if (e.mirror || e.dead === 2) continue;
        const k = e.kind;
        if (k === 'mob') tickMob(e); else if (k === 'item') tickItem(e); else if (k === 'xp') tickXp(e); else if (k === 'fall') tickFall(e); else if (k === 'arrow') tickArrow(e); else if (k === 'thrown') tickThrown(e); else if (k === 'tnt') tickTNT(e);
      }
    }
    function weatherTick() {
      if (W.rules.doWeatherCycle === false) return;
      if (--W.weatherT > 0) return;
      if (W.raining) { W.raining = false; W.thunder = false; W.weatherT = 12000 + ri(168000); }
      else { W.raining = true; W.thunder = RNG() < .2; W.weatherT = 12000 + ri(12000); }
    }
    function tick() {
      tickN++;
      const host = NET.role !== 'guest';
      if (W.rules.doDaylightCycle !== false || !host) W.time++;
      if (host) weatherTick();
      if (P.dead) { deadT++; if (W.rules.doImmediateRespawn && deadT > 2 && !W.hardcore) respawn(); }
      tickPlayer();
      tickInteract();
      if (host) { tickEnts(); tickSched(); randomTicks(); tickFurnaces(); if (tickN % 2 === 0) checkPlates(); spawnTick(); if (W.pendSpawn) flushPendSpawn(); if (W.pendEnts && nearMeshed(1) >= 1) spawnSaved(); }
      tickMirrors();
      if (swingT >= 0 && ++swingT >= CFG.SWING_TICKS) swingT = -1;
      if (sel !== lastSel) { lastSel = sel; nameT = 50; equipT = 0; }
      if (equipT < 1) equipT = Math.min(1, equipT + .25);
      if (nameT > 0) nameT--;
      if (P.hurtT === 19 && !P.dead) { }
      netTick();
      musicTick();
      if (W.thunder && host && RNG() < 1 / 2000) { flash = 6; snd('thunder', P); }
      if (flash > 0) flash--;
      if (tickN % 900 === 0) saveNow();
      if (W.bonus && !W.bonusDone && tickN > 5) placeBonusChest();
    }
    function updTarget() {
      EX = lerp(P.px, P.x, lightF); EY = lerp(P.py, P.y, lightF) + P.eye; EZ = lerp(P.pz, P.z, lightF);
      let d;
      if (touch && aimT) { V3.set(aimT.nx, aimT.ny, .5).unproject(cam).sub(cam.position).normalize(); d = [V3.x, V3.y, V3.z]; EX = cam.position.x; EY = cam.position.y; EZ = cam.position.z; if (persp) { const ld = lookDir(); EX = lerp(P.px, P.x, lightF); EY = lerp(P.py, P.y, lightF) + P.eye; EZ = lerp(P.pz, P.z, lightF); d = ld; } }
      else d = lookDir();
      if (scr !== 'game' || P.dead) { HIT.b = false; HIT.ent = null; return; }
      raycast(EX, EY, EZ, d[0], d[1], d[2], reach(), false, mode() === 'spectator' ? null : ENTS, P);
    }
    function skyState() {
      const t = W.time % 24000, f0 = (t / 24000 - .25 + 1) % 1, ang = f0 + ((1 - (Math.cos(f0 * Math.PI) + 1) / 2) - f0) / 3;
      let b = clamp(Math.cos(ang * Math.PI * 2) * 2 + .5, 0, 1);
      const rain = W.raining ? 1 : 0;
      b *= 1 - rain * .3; if (W.thunder) b *= .7;
      return { ang, b };
    }
    const C1 = new THREE.Color(), C2 = new THREE.Color();
    function render(now, alpha) {
      const st = skyState(); sunB = st.b;
      lightF = alpha;
      U.sky.value = .27 + .73 * st.b; if (flash > 0) U.sky.value = 1;
      U.frame.value = Math.floor(now / 100) % 16;
      U.gam.value = SET.gam;
      const B = W.gen.BIO[bio(Math.floor(P.x), Math.floor(P.z))] || {};
      const tmp = clamp((B.t ?? .8) / 3, -1, 1), skyHue = .6222 - tmp * .05, skySat = .5 + tmp * .1;
      C1.setHSL(skyHue, skySat, .5 + .2 * 0).multiplyScalar(1);
      const top = new THREE.Color().setRGB(.47, .65, 1).lerp(C1.setHSL(skyHue, skySat, .62), .5).multiplyScalar(st.b);
      const fogc = new THREE.Color(.75, .85, 1).multiplyScalar(st.b * .94 + .06);
      if (W.raining) { const gy = top.r * .3 + top.g * .59 + top.b * .11; top.lerp(new THREE.Color(gy, gy, gy), .6); const fy = fogc.r * .3 + fogc.g * .59 + fogc.b * .11; fogc.lerp(new THREE.Color(fy, fy, fy), .5); }
      const cs = Math.cos(st.ang * Math.PI * 2), glow = cs > -.4 && cs < .4 ? (1 - Math.abs(cs) / .4) : 0;
      const sx = -Math.sin(st.ang * Math.PI * 2);
      skyU.sun.value.set(sx, Math.cos(st.ang * Math.PI * 2), 0); skyU.glowA.value = glow * .9; skyU.rain.value = W.raining ? 1 : 0;
      fogc.lerp(new THREE.Color(1, .55, .25), glow * .25 * (1 - (W.raining ? 1 : 0)));
      let fogN = SET.rd * 16 * .7, fogF = SET.rd * 16;
      const ex = lerp(P.px, P.x, alpha), ey = lerp(P.py, P.y, alpha) + lerp(P.eyeP, P.eye, alpha), ez = lerp(P.pz, P.z, alpha);
      const eb = getS(Math.floor(ex), Math.floor(ey), Math.floor(ez));
      P.eyeW = FLU[eb] === 1 && !W.pano; P.eyeL = FLU[eb] === 2 && !W.pano;
      if (P.eyeW) { const br = brAt(ex, ey, ez); fogc.setRGB(.05 * br, .16 * br, .5 * br); top.copy(fogc); fogN = 0; fogF = P.effects.waterBreathing ? 64 : 28; }
      else if (P.eyeL) { fogc.setRGB(.6, .1, 0); top.copy(fogc); fogN = 0; fogF = P.effects.fireRes ? 6 : 1.5; }
      else if (P.effects.blind) { fogc.setRGB(0, 0, 0); fogN = 0; fogF = 5; }
      skyU.top.value.copy(top); skyU.fog.value.copy(fogc); skyU.day.value = st.b;
      U.fogC.value.copy(fogc); U.fogN.value = fogN; U.fogF.value = fogF;
      starMat.opacity = clamp((1 - st.b * 1.4), 0, 1) * (W.raining ? 0 : 1) * .9;
      celest.rotation.set(0, 0, st.ang * Math.PI * 2); celest.position.set(ex, 0, ez);
      sunM.material.opacity = moonM.material.opacity = W.raining ? 0 : 1;
      sky.position.set(ex, ey, ez);
      cloudG.visible = SET.clouds && !P.eyeW;
      cloudG.position.set(Math.round(ex), CFG.CLOUD_Y, Math.round(ez));
      cloudU.off.value.set((W.time + alpha) * .03 - Math.round(ex) * 0 + 0, 0); cloudU.col.value.setScalar(.25 + st.b * .75); cloudU.far.value = Math.max(120, SET.rd * 24);
      clouds.position.set(0, 0, 0);
      let yaw = P.yaw, pitch = P.pitch;
      if (W.pano) { panoA += .0006; yaw = panoA; pitch = -.12; }
      let cx = ex, cy = ey, cz = ez;
      if (SET.bob && !P.fly && !W.pano && persp === 0) { const wb = lerp(P.walkP, P.walk, alpha), bb = lerp(P.bobP, P.bob, alpha); cx += Math.cos(yaw) * Math.sin(wb * Math.PI) * bb * .5; cy -= Math.abs(Math.cos(wb * Math.PI) * bb) * .6; cz -= Math.sin(yaw) * Math.sin(wb * Math.PI) * bb * .5; }
      if (P.sleeping && P.bedPos) { cy = P.bedPos[1] + .7; }
      if (persp && !W.pano) {
        const f = persp === 1 ? 1 : -1, cp = Math.cos(pitch), dx = Math.sin(yaw) * cp * f, dy = -Math.sin(pitch) * f, dz = Math.cos(yaw) * cp * f;
        let dist = 4;
        for (let t = .2; t <= 4; t += .1) { const px = cx + dx * t, py = cy + dy * t, pz = cz + dz * t; if (solidAt(Math.floor(px), Math.floor(py), Math.floor(pz)) && getB(Math.floor(px), Math.floor(py), Math.floor(pz)) >= 0) { dist = Math.max(.3, t - .3); break; } }
        cx += dx * dist; cy += dy * dist; cz += dz * dist;
        cam.position.set(cx, cy, cz); cam.rotation.set(persp === 1 ? pitch : -pitch, persp === 1 ? yaw : yaw + Math.PI, 0);
      } else { cam.position.set(cx, cy, cz); cam.rotation.set(pitch, yaw, 0); }
      if (P.shake > 0 && !W.pano) cam.rotation.z = Math.sin(P.shake * 1.3) * P.shake / 10 * .08;
      const fovT = SET.fov * (P.sprint && !P.eyeW ? 1.15 : 1) * (P.fly && P.sprint ? 1.05 : 1) * (drawing && held() && IT[held().id].bow ? 1 - Math.min(1, drawing.t / 20) * .15 : 1) * (P.eyeW ? .86 : 1) * (P.scope ? .1 : 1);
      if (Math.abs(cam.fov - fovT) > .05 || fovDirty) { cam.fov += (fovT - cam.fov) * .25; if (fovDirty) cam.fov = fovT; fovDirty = false; cam.updateProjectionMatrix(); }
      for (const e of ENTS) animEnt(e, e.mirror || e.kind === 'player' ? 1 : alpha);
      updSelf(alpha);
      updRain(now, ex, ey, ez);
      if (scr === 'game' && !P.dead && (HIT.b || HIT.ent) && !gui && !hideHud) {
        if (HIT.b) {
          const s = getS(HIT.x, HIT.y, HIT.z), L = selBoxes(s, HIT.x, HIT.y, HIT.z);
          let a = [1, 1, 1, 0, 0, 0]; for (const b of L) for (let i = 0; i < 3; i++) { a[i] = Math.min(a[i], b[i]); a[i + 3] = Math.max(a[i + 3], b[i + 3]); }
          outline.visible = true; outline.scale.set(a[3] - a[0] + .004, a[4] - a[1] + .004, a[5] - a[2] + .004); outline.position.set(HIT.x + (a[0] + a[3]) / 2, HIT.y + (a[1] + a[4]) / 2, HIT.z + (a[2] + a[5]) / 2);
        } else outline.visible = false;
      } else outline.visible = false;
      if (mine && mine.p > 0 && !gui) { crack.visible = true; crack.position.set(mine.x + .5, mine.y + .5, mine.z + .5); crackTex.offset.x = Math.min(9, Math.floor(mine.p * 10)) / 10; } else crack.visible = false;
      renderer.setRenderTarget(null);
      renderer.setClearColor(fogc, 1); renderer.clear();
      renderer.render(scene, cam);
      if (persp === 0 && !hideHud && scr === 'game' && mode() !== 'spectator' && !W.pano) { renderer.clearDepth(); updHand(alpha, ex, ey, ez); renderer.render(hScene, hCam); }
      updParticles(Math.min(.05, 1 / 60));
    }
    function updSelf(alpha) {
      if (!selfE || selfE.name !== P.name) { if (selfE) { scene.remove(selfE.root); } selfE = remotePlayer('self', P.name); const i = ENTS.indexOf(selfE); if (i >= 0) ENTS.splice(i, 1); entById.delete(selfE.id); selfE.tag.visible = false; selfE.walkD = 0; }
      const vis = persp > 0 && scr === 'game' && !W.pano && mode() !== 'spectator' && !P.dead;
      selfE.root.visible = vis;
      if (!vis) return;
      selfE.px = P.px; selfE.py = P.py; selfE.pz = P.pz; selfE.x = P.x; selfE.y = P.y; selfE.z = P.z;
      const sp = Math.min(1, Math.hypot(P.x - P.px, P.z - P.pz) * 4);
      if (selfE.lastT !== tickN) { selfE.lastT = tickN; selfE.limbAP = selfE.limbA; selfE.limbP = selfE.limb; selfE.limbA += (sp - selfE.limbA) * .4; selfE.limb += selfE.limbA * 1.2; selfE.pyaw = selfE.yaw; selfE.phyaw = selfE.hyaw; selfE.yaw = turn(selfE.yaw, P.yaw, sp > .1 ? .5 : .15); selfE.hyaw = P.yaw; }
      selfE.pitch = -P.pitch; selfE.sneak = P.sneak; selfE.swing = swingT >= 0 ? 6 - swingT : 0; selfE.hurtT = P.hurtT;
      const h = held(); setRemoteHeld(selfE, h ? h.id : -1);
      animEnt(selfE, alpha);
      selfE.tag.visible = false;
    }
    function updHand(alpha, ex, ey, ez) {
      if (!handG) {
        handG = new THREE.Group(); hScene.add(handG);
        const sk = playerSkinTex(P.name), mat = new THREE.MeshBasicMaterial({ map: sk.t || sk, vertexColors: true, alphaTest: .1, toneMapped: false });
        const md = instModel(sk.alex ? 'alex' : 'steve', mat); handArm = md.parts.rarm; md.root.remove(handArm); handArm.position.set(0, 0, 0); handArm.rotation.set(0, 0, 0); handArm.userData.mat = mat;
        const holder = new THREE.Group(); holder.add(handArm); handG.add(holder); handG.userData.holder = holder;
      }
      const h = held(), id = h ? h.id : -1, br = brAt(ex, ey - .2, ez);
      if (id !== handId) { if (handItem) { handG.remove(handItem); handItem = null; } handId = id; if (id >= 0) { handItem = itemMesh(id, isFlat(id) ? .32 : .28); handG.add(handItem); } }
      const holder = handG.userData.holder;
      const sw = swingT >= 0 ? (swingT + alpha) / CFG.SWING_TICKS : 0, sq = Math.sqrt(sw), eq = (1 - equipT) * .6;
      const sx = -.4 * Math.sin(sq * Math.PI), sy = .2 * Math.sin(sq * Math.PI * 2), sz = -.2 * Math.sin(sw * Math.PI);
      const bobY = SET.bob ? -Math.abs(Math.cos(lerp(P.walkP, P.walk, alpha) * Math.PI) * lerp(P.bobP, P.bob, alpha)) * .1 : 0;
      const eatB = eating && eating.t > 0 ? Math.abs(Math.cos(eating.t / 4 * Math.PI)) * .1 : 0;
      handG.position.set(0, bobY, 0);
      if (handItem) {
        holder.visible = false; handItem.visible = true;
        const flat = isFlat(id), it = IT[id];
        handItem.material.color.setScalar(br);
        if (eating) { handItem.position.set(.3 + sx * .2, -.35 + eatB - eq, -.6); handItem.rotation.set(-.3, -.6, .3); }
        else if (drawing && (it.bow || it.crossbow)) { handItem.position.set(.2, -.3, -.6); handItem.rotation.set(0, -1.3, -.4); }
        else if (shielding && it.shield) { handItem.position.set(.15, -.35, -.55); handItem.rotation.set(0, -.2, 0); }
        else if (flat) { handItem.position.set(.46 + sx, -.26 + sy - eq, -.75 + sz); handItem.rotation.set(-sw * 1.2 + .1, -1.45 + Math.sin(sq * Math.PI) * .4, .45); }
        else { handItem.position.set(.46 + sx, -.3 + sy - eq, -.78 + sz); handItem.rotation.set(-sw * 1.2, .785 + Math.sin(sq * Math.PI) * .4, 0); }
      } else {
        holder.visible = true;
        handArm.userData.mat.color.setScalar(br);
        holder.position.set(.72 + sx * .8, -.72 + sy * .5 - eq, -.5 + sz);
        holder.rotation.set(2.1 - Math.sin(sq * Math.PI) * .5, .5 + Math.sin(sq * Math.PI) * .4, .1, 'YXZ');
      }
    }
    function updRain(now, ex, ey, ez) {
      const on = W.raining && !W.pano && SET.particles > 0;
      if (!rainP) {
        const N = 900, gq = new THREE.BufferGeometry(), pos = new Float32Array(N * 6);
        gq.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        rainP = new THREE.LineSegments(keep(gq), keep(new THREE.LineBasicMaterial({ color: 0x8aa0c8, transparent: true, opacity: .5, depthWrite: false })));
        rainP.frustumCulled = false; rainP.userData.d = Array.from({ length: N }, () => [RNG() * 32 - 16, RNG() * 28 - 10, RNG() * 32 - 16, .7 + RNG() * .4]);
        scene.add(rainP);
      }
      rainP.visible = on;
      if (!on) return;
      const pos = rainP.geometry.attributes.position.array, D = rainP.userData.d;
      const B = W.gen.BIO[bio(Math.floor(ex), Math.floor(ez))] || {};
      const snow = (B.t ?? .8) < .15, dry = (B.r ?? .5) <= 0 || B.dry;
      rainP.material.color.setHex(snow ? 0xffffff : 0x8aa0c8);
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        d[1] -= snow ? .05 : d[3] * .9;
        if (d[1] < -10) { d[1] += 28; d[0] = RNG() * 32 - 16; d[2] = RNG() * 32 - 16; }
        const x = Math.floor(ex) + d[0], y = Math.floor(ey) + d[1], z = Math.floor(ez) + d[2];
        const open = !dry && (getL(Math.floor(x), Math.floor(y), Math.floor(z)) >> 4) === 15 && !solidAt(Math.floor(x), Math.floor(y), Math.floor(z));
        const o = i * 6, ln = open ? (snow ? .08 : .7) : 0;
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; pos[o + 3] = x + (snow ? .06 : 0); pos[o + 4] = y + ln; pos[o + 5] = z;
      }
      rainP.geometry.attributes.position.needsUpdate = true;
      if (!snow && !dry && tickN % 8 === 0 && RNG() < .3 && SET.sound) snd('rain', P);
    }
    let lastNow = 0;
    function frameLoop(dt0, now) {
      const dt = lastNow ? clamp((now - lastNow) / 1000, 0, .25) : dt0; lastNow = now;
      frameN++;
      if (frameN % 15 === 1) resize();
      fpsN++; fpsT += dt; if (fpsT >= 1) { fps = fpsN; fpsN = 0; fpsT = 0; }
      if (!W && (scr === 'title')) startPano();
      touchTick();
      let alpha = 1;
      if (W) {
        const loading = scr === 'loading' || scr === 'waiting';
        streamChunks(loading ? 24 : 7);
        if (W.pano) { if (!panoReady && nearMeshed(2) >= 1) { panoReady = true; const t = topY(Math.floor(P.x), Math.floor(P.z)); let m = t; for (let dz = -6; dz <= 6; dz += 3) for (let dx = -6; dx <= 6; dx += 3) m = Math.max(m, topY(Math.floor(P.x) + dx, Math.floor(P.z) + dz)); P.y = P.py = m + 3 - P.eye; } }
        else if (scr === 'loading') {
          if (NET.role === 'guest' && !NET.ready) loadP = Math.max(loadP, .1);
          else {
            const p = nearMeshed(2); loadP = .5 + p * .5; loadMsg = W.remote ? 'Loading terrain...' : loadMsg;
            if (p >= 1 || performance.now() - loadT0 > 20000) {
              scr = 'game'; panoReady = false; P.name = NET.role ? P.name : myName();
              if (NET.pendOpen || NET.role === 'host') { NET.pendOpen = false; hostAfterOpen(); }
              if (W.mode === 'spectator') P.fly = true;
              chatSys(W.remote ? 'Joined ' + W.name : '', '#ffffff'); chatLog.pop();
            }
          }
        }
        if (scr === 'game') {
          const paused = !NET.role && (gui === 'pause' || gui === 'options' || gui === 'controls');
          if (!paused) { acc += Math.min(dt, .25); let n = 0; while (acc >= .05 && n < 5) { tick(); acc -= .05; n++; } if (n >= 5) acc = 0; }
          alpha = paused ? 1 : clamp(acc / .05, 0, 1);
          lightF = alpha;
          if (!gui && !chatOpen) updTarget(); else { HIT.b = false; HIT.ent = null; }
        }
        const show3d = scr === 'game' || scr === 'title' && W.pano;
        if (show3d) render(now, alpha);
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, hud.width, hud.height);
      g.imageSmoothingEnabled = false;
      g.setTransform(GK, 0, 0, GK, 0, 0);
      btns = []; fields = []; sliders = [];
      if (!W || !(scr === 'game' || scr === 'title' && W.pano)) { renderer.setClearColor(0, 1); renderer.clear(); }
      if (scr === 'game' && W) {
        if (!hideHud || gui) {
          if (!hideHud) { drawHUD(now); drawChat(now); }
          if (touch && !gui && !hideHud && !P.dead) drawTouch();
          if (!touch && !gui && !locked() && !freeMouse && !chatOpen && !P.dead && !P.sleeping) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, GH / 2 + 14, GW, 14); textC('Click to play', GW / 2, GH / 2 + 17, '#ffffff'); }
          try { drawGameGui(now); } catch (e) { if (!frameLoop.gerr) { frameLoop.gerr = 1; if (window.console) console.error(e); } gui = null; }
        }
        if (W.rules.showCoordinates && !showF3 && !hideHud) text('XYZ: ' + Math.floor(P.x) + ' / ' + Math.floor(P.y - CFG.YOFF) + ' / ' + Math.floor(P.z), 2, 2, '#ffffff');
      } else drawScreen(now);
      if (focusKey && !fields.some(f => f.key === focusKey) && focusKey !== 'sign') blurField();
      else if (focusKey) { const f = fields.find(q => q.key === focusKey); if (f) { const k = cssW / hud.width * GK; inp.style.left = f.x * k + 'px'; inp.style.top = f.y * k + 'px'; inp.style.width = f.w * k + 'px'; inp.style.height = f.h * k + 'px'; } }
      if (focusKey === 'chat') FIELDV.chat = inp.value;
    }
    wrap.__mc = () => ({ scr, gui, GK, GW, GH, pRect, chatOpen, btns: btns.map(b => [b.l, b.x, b.y, b.w, b.h, b.en]), P: { x: P.x, y: P.y, z: P.z, hp: P.hp, food: P.food, yaw: P.yaw, pitch: P.pitch }, ents: (() => { const o = {}; for (const e of ENTS) { const k = e.kind + ':' + (e.type || (e.st ? IT[e.st.id].id : '')); o[k] = (o[k] || 0) + 1; } return o; })(), keysDown: [...keys], focus: focusKey, mobs: ENTS.filter(e => e.kind === 'mob').map(e => [e.type, +e.x.toFixed(1), +(e.y - CFG.YOFF).toFixed(1), +e.z.toFixed(1), e.root.visible, e.hp, !!e.dead, e.root.parent ? 1 : 0]), fps, cols: W ? W.cols.size : 0, mode: W && W.mode, role: NET.role, time: W && W.time, chat: chatLog.slice(-8).map(c => c.m), hit: HIT.b ? [HIT.x, HIT.y, HIT.z] : null, sel, inv: inv.map(s => s && IT[s.id].id + 'x' + s.n), slots: slots.map(q => { const v = q.get(); return [q.g, q.i, q.x, q.y, v ? IT[v.id].id + 'x' + v.n : null]; }), cursor: cursor && IT[cursor.id].id + 'x' + cursor.n });
    resize();
    api.loop((dt, now) => { try { frameLoop(dt, now); } catch (e) { if (!frameLoop.err) { frameLoop.err = 1; if (window.console) console.error(e); } } });
    const sizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
    if (sizeObs) sizeObs.observe(wrap);
    setTimeout(() => { try { buildIcons(); } catch (e) { if (window.console) console.error(e); } }, 0);
    return () => {
      try { saveNow(); } catch (e) { }
      if (sizeObs) sizeObs.disconnect();
      try { if (NET.role) api.net.close(); } catch (e) { }
      try { closeWorld(); } catch (e) { }
      if (WSRC) { try { URL.revokeObjectURL(WSRC); } catch (e) { } WSRC = null; }
      stopDisc();
      if (locked()) try { document.exitPointerLock(); } catch (e) { }
      for (const o of trash) { try { o.dispose(); } catch (e) { } }
      try { if (AC) AC.close(); } catch (e) { }
    };
  }
  const G = '.gm-blockcraft-3d';
  Ameplay.register({
    id: 'blockcraft-3d',
    title: 'Minecraft',
    category: '3D',
    ownPause: true,
    tint: '#5d9b3a',
    blurb: 'Survival, Creative and Adventure worlds with 1100+ blocks, crafting, mobs, flowing water and LAN / online multiplayer.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Space</kbd> jump (double-tap to fly in Creative) · <kbd>Shift</kbd> sneak · <kbd>Ctrl</kbd> or double-tap <kbd>W</kbd> sprint · left click mine/attack · right click place/use · middle click pick block · <kbd>E</kbd> inventory · <kbd>Q</kbd> drop · <kbd>F</kbd> swap hands · <kbd>T</kbd> chat · <kbd>/</kbd> commands · <kbd>1</kbd>–<kbd>9</kbd>/wheel hotbar · <kbd>F3</kbd> debug · <kbd>F5</kbd> camera · <kbd>Esc</kbd> menu · touch: stick to move, drag to look, tap to place/attack, hold to mine',
    better: 'high',
    format: v => v + ' XP',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 7 55 19.5v25L32 57 9 44.5v-25z"/><path d="M9 19.5 32 32l23-12.5M32 32v25"/><path d="M9 27l23 12.5L55 27" opacity=".3"/><path d="M16 31v5M23 35v6M41 35v5M48 31v6" opacity=".3"/></svg>',
    css: `
${G}{gap:0}
${G} .bc-wrap{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px)) * 1.6));aspect-ratio:16/10;overflow:hidden;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:var(--r)}
${G} .bc-gl,${G} .bc-hud{position:absolute;left:0;top:0;width:100%;height:100%;display:block;border-radius:0;object-fit:cover}
${G} .bc-hud{image-rendering:crisp-edges;image-rendering:pixelated}
${G} .bc-in{position:absolute;z-index:2;opacity:0;font-size:16px;border:0;padding:0;margin:0;background:transparent;color:transparent;caret-color:transparent;outline:0}
@media (max-width:640px){${G} .bc-wrap{width:100%;aspect-ratio:auto;height:clamp(380px,calc(100dvh - var(--goff,250px)),135vw)}}
`,
    mount(root, api) {
      const keys = api.keys;
      let cleanup = null;
      api.gl(960, 600, { antialias: false }).then(v => { if (v && api.alive) cleanup = run(root, api, keys, v); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
  Ameplay.covers['blockcraft-3d'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bcx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f93f2"/><stop offset=".7" stop-color="#9cc3ff"/><stop offset="1" stop-color="#c4dcff"/></linearGradient></defs><rect width="400" height="300" fill="url(#bcx-sky)"/><rect x="292" y="26" width="46" height="46" fill="#fff6b0" opacity=".45"/><rect x="301" y="35" width="28" height="28" fill="#fffbe0"/><g fill="#fff" opacity=".92"><rect x="26" y="40" width="96" height="16"/><rect x="46" y="28" width="44" height="14"/><rect x="170" y="22" width="70" height="12"/><rect x="186" y="12" width="30" height="12"/></g><ellipse cx="200" cy="262" rx="150" ry="22" fill="#2a5a1e" opacity=".25"/><polygon points="196,98 220,110 196,122 172,110" fill="#86d16a"/><polygon points="172,110 196,122 172,134 148,122" fill="#86d16a"/><polygon points="220,110 244,122 220,134 196,122" fill="#86d16a"/><polygon points="244,122 220,134 220,158 244,146" fill="#6c4527"/><polygon points="220,134 244,122 244,129 220,141" fill="#4a9139"/><polygon points="220,14 244,26 220,38 196,26" fill="#4caf50"/><rect x="216" y="24" width="7" height="4" fill="#6cc96f"/><polygon points="244,146 268,158 244,170 220,158" fill="#86d16a"/><polygon points="148,98 172,110 148,122 124,110" fill="#86d16a"/><polygon points="196,98 220,110 196,122 172,110" fill="#86d16a"/><polygon points="196,2 220,14 196,26 172,14" fill="#4caf50"/><polygon points="172,14 196,26 196,50 172,38" fill="#3a9142"/><rect x="192" y="12" width="7" height="4" fill="#6cc96f"/><polygon points="244,2 268,14 244,26 220,14" fill="#4caf50"/><polygon points="268,14 244,26 244,50 268,38" fill="#2c7434"/><rect x="240" y="12" width="7" height="4" fill="#6cc96f"/><polygon points="268,158 292,170 268,182 244,170" fill="#86d16a"/><polygon points="244,146 220,158 220,182 244,170" fill="#6c4527"/><polygon points="124,110 148,122 124,134 100,122" fill="#86d16a"/><polygon points="100,122 124,134 124,158 100,146" fill="#8a5a33"/><polygon points="100,122 124,134 124,141 100,129" fill="#5aa846"/><polygon points="244,122 220,134 220,158 244,146" fill="#5e4426"/><polygon points="172,86 196,98 172,110 148,98" fill="#86d16a"/><polygon points="148,98 172,110 172,134 148,122" fill="#8a5a33"/><polygon points="196,98 172,110 172,134 196,122" fill="#6c4527"/><polygon points="148,98 172,110 172,117 148,105" fill="#5aa846"/><polygon points="172,110 196,98 196,105 172,117" fill="#4a9139"/><polygon points="196,98 220,110 220,134 196,122" fill="#7a5a34"/><polygon points="244,98 220,110 220,134 244,122" fill="#5e4426"/><polygon points="196,74 220,86 220,110 196,98" fill="#7a5a34"/><polygon points="244,74 220,86 220,110 244,98" fill="#5e4426"/><polygon points="172,38 196,50 172,62 148,50" fill="#4caf50"/><polygon points="148,50 172,62 172,86 148,74" fill="#3a9142"/><rect x="168" y="48" width="7" height="4" fill="#6cc96f"/><polygon points="268,38 292,50 268,62 244,50" fill="#4caf50"/><polygon points="292,50 268,62 268,86 292,74" fill="#2c7434"/><rect x="264" y="48" width="7" height="4" fill="#6cc96f"/><polygon points="220,14 244,26 220,38 196,26" fill="#4caf50"/><polygon points="244,170 268,182 244,194 220,182" fill="#86d16a"/><polygon points="292,170 316,182 292,194 268,182" fill="#86d16a"/><polygon points="316,182 292,194 292,218 316,206" fill="#6c4527"/><polygon points="292,194 316,182 316,189 292,201" fill="#4a9139"/><polygon points="100,146 124,158 100,170 76,158" fill="#86d16a"/><polygon points="76,158 100,170 100,194 76,182" fill="#8a5a33"/><polygon points="76,158 100,170 100,177 76,165" fill="#5aa846"/><polygon points="148,122 172,134 148,146 124,134" fill="#86d16a"/><polygon points="124,134 148,146 148,170 124,158" fill="#8a5a33"/><polygon points="124,134 148,146 148,153 124,141" fill="#5aa846"/><polygon points="196,122 220,134 196,146 172,134" fill="#86d16a"/><polygon points="220,134 196,146 196,170 220,158" fill="#6c4527"/><polygon points="196,146 220,134 220,141 196,153" fill="#4a9139"/><polygon points="172,62 196,74 196,98 172,86" fill="#3a9142"/><polygon points="268,62 244,74 244,98 268,86" fill="#2c7434"/><polygon points="196,26 220,38 196,50 172,38" fill="#4caf50"/><polygon points="172,38 196,50 196,74 172,62" fill="#3a9142"/><polygon points="220,38 196,50 196,74 220,62" fill="#2c7434"/><rect x="192" y="36" width="7" height="4" fill="#6cc96f"/><polygon points="244,26 268,38 244,50 220,38" fill="#4caf50"/><polygon points="220,38 244,50 244,74 220,62" fill="#3a9142"/><polygon points="268,38 244,50 244,74 268,62" fill="#2c7434"/><rect x="240" y="36" width="7" height="4" fill="#6cc96f"/><polygon points="52,218 76,230 76,254 52,242" fill="#8a5a33"/><polygon points="316,206 340,218 316,230 292,218" fill="#86d16a"/><polygon points="340,218 316,230 316,254 340,242" fill="#6c4527"/><polygon points="316,230 340,218 340,225 316,237" fill="#4a9139"/><polygon points="76,182 100,194 76,206 52,194" fill="#86d16a"/><polygon points="52,194 76,206 76,230 52,218" fill="#8a5a33"/><polygon points="52,194 76,206 76,213 52,201" fill="#5aa846"/><polygon points="268,182 292,194 268,206 244,194" fill="#86d16a"/><polygon points="292,194 268,206 268,230 292,218" fill="#6c4527"/><polygon points="268,206 292,194 292,201 268,213" fill="#4a9139"/><polygon points="124,158 148,170 124,182 100,170" fill="#86d16a"/><polygon points="100,170 124,182 124,206 100,194" fill="#8a5a33"/><polygon points="100,170 124,182 124,189 100,177" fill="#5aa846"/><polygon points="220,158 244,170 220,182 196,170" fill="#86d16a"/><polygon points="244,170 220,182 220,206 244,194" fill="#6c4527"/><polygon points="220,182 244,170 244,177 220,189" fill="#4a9139"/><polygon points="172,134 196,146 172,158 148,146" fill="#86d16a"/><polygon points="148,146 172,158 172,182 148,170" fill="#8a5a33"/><polygon points="196,146 172,158 172,182 196,170" fill="#6c4527"/><polygon points="148,146 172,158 172,165 148,153" fill="#5aa846"/><polygon points="172,158 196,146 196,153 172,165" fill="#4a9139"/><polygon points="220,62 244,74 220,86 196,74" fill="#4caf50"/><polygon points="196,74 220,86 220,110 196,98" fill="#3a9142"/><polygon points="244,74 220,86 220,110 244,98" fill="#2c7434"/><rect x="216" y="72" width="7" height="4" fill="#6cc96f"/><polygon points="76,230 100,242 100,266 76,254" fill="#8a5a33"/><polygon points="292,218 316,230 292,242 268,230" fill="#86d16a"/><polygon points="316,230 292,242 292,266 316,254" fill="#6c4527"/><polygon points="292,242 316,230 316,237 292,249" fill="#4a9139"/><polygon points="100,194 124,206 100,218 76,206" fill="#86d16a"/><polygon points="76,206 100,218 100,242 76,230" fill="#8a5a33"/><polygon points="76,206 100,218 100,225 76,213" fill="#5aa846"/><polygon points="244,194 268,206 244,218 220,206" fill="#86d16a"/><polygon points="148,170 172,182 148,194 124,182" fill="#86d16a"/><polygon points="124,182 148,194 148,218 124,206" fill="#8a5a33"/><polygon points="172,182 148,194 148,218 172,206" fill="#6c4527"/><polygon points="124,182 148,194 148,201 124,189" fill="#5aa846"/><polygon points="148,194 172,182 172,189 148,201" fill="#4a9139"/><polygon points="196,170 220,182 196,194 172,182" fill="#86d16a"/><polygon points="172,182 196,194 196,218 172,206" fill="#8a5a33"/><polygon points="220,182 196,194 196,218 220,206" fill="#6c4527"/><polygon points="172,182 196,194 196,201 172,189" fill="#5aa846"/><polygon points="196,194 220,182 220,189 196,201" fill="#4a9139"/><polygon points="100,242 124,254 124,278 100,266" fill="#8a5a33"/><polygon points="292,242 268,254 268,278 292,266" fill="#6c4527"/><polygon points="124,206 148,218 124,230 100,218" fill="#86d16a"/><polygon points="100,218 124,230 124,254 100,242" fill="#8a5a33"/><polygon points="148,218 124,230 124,254 148,242" fill="#6c4527"/><polygon points="100,218 124,230 124,237 100,225" fill="#5aa846"/><polygon points="124,230 148,218 148,225 124,237" fill="#4a9139"/><polygon points="172,206 196,218 172,230 148,218" fill="#86d16a"/><polygon points="148,218 172,230 172,254 148,242" fill="#8a5a33"/><polygon points="196,218 172,230 172,254 196,242" fill="#6c4527"/><polygon points="148,218 172,230 172,237 148,225" fill="#5aa846"/><polygon points="172,230 196,218 196,225 172,237" fill="#4a9139"/><polygon points="220,206 244,218 220,230 196,218" fill="#86d16a"/><polygon points="196,218 220,230 220,254 196,242" fill="#8a5a33"/><polygon points="244,218 220,230 220,254 244,242" fill="#6c4527"/><polygon points="196,218 220,230 220,237 196,225" fill="#5aa846"/><polygon points="220,230 244,218 244,225 220,237" fill="#4a9139"/><polygon points="268,206 292,218 268,230 244,218" fill="#86d16a"/><polygon points="244,218 268,230 268,254 244,242" fill="#8a5a33"/><polygon points="292,218 268,230 268,254 292,242" fill="#6c4527"/><polygon points="244,218 268,230 268,237 244,225" fill="#5aa846"/><polygon points="268,230 292,218 292,225 268,237" fill="#4a9139"/><polygon points="148,242 172,254 148,266 124,254" fill="#3fa9f0"/><polygon points="124,254 148,266 148,290 124,278" fill="#2f7fd0"/><polygon points="196,242 220,254 196,266 172,254" fill="#3fa9f0"/><polygon points="244,242 268,254 244,266 220,254" fill="#3fa9f0"/><polygon points="268,254 244,266 244,290 268,278" fill="#2a6cb8"/><polygon points="172,254 196,266 172,278 148,266" fill="#3fa9f0"/><polygon points="148,266 172,278 172,302 148,290" fill="#2f7fd0"/><polygon points="220,254 244,266 220,278 196,266" fill="#3fa9f0"/><polygon points="244,266 220,278 220,302 244,290" fill="#2a6cb8"/><polygon points="196,266 220,278 196,290 172,278" fill="#3fa9f0"/><polygon points="172,278 196,290 196,314 172,302" fill="#2f7fd0"/><polygon points="220,278 196,290 196,314 220,302" fill="#2a6cb8"/><rect x="146" y="122" width="4" height="12" fill="#2f7a2b"/><rect x="143" y="116" width="10" height="8" fill="#ffd23f"/><rect x="266" y="182" width="4" height="12" fill="#2f7a2b"/><rect x="263" y="176" width="10" height="8" fill="#e83b3b"/><rect x="98" y="146" width="4" height="12" fill="#2f7a2b"/><rect x="95" y="140" width="10" height="8" fill="#e83b3b"/><g transform="translate(196 182)"><rect x="-9" y="-30" width="8" height="30" fill="#3b3f9a"/><rect x="1" y="-30" width="8" height="30" fill="#30347f"/><rect x="-10" y="-62" width="20" height="32" fill="#1f9fa0"/><rect x="-22" y="-62" width="12" height="10" fill="#1f9fa0"/><rect x="10" y="-62" width="12" height="10" fill="#178486"/><rect x="-22" y="-62" width="12" height="8" transform="translate(-6 0)" fill="#5a8f3e"/><rect x="-28" y="-60" width="10" height="26" fill="#5a8f3e" transform="rotate(-80 -23 -60)"/><rect x="18" y="-60" width="10" height="26" fill="#4e7e35" transform="rotate(-80 23 -60)"/><rect x="-12" y="-86" width="24" height="24" fill="#6aa84f"/><rect x="-12" y="-86" width="24" height="6" fill="#4f8a3a"/><rect x="-8" y="-74" width="6" height="4" fill="#1d2b1a"/><rect x="2" y="-74" width="6" height="4" fill="#1d2b1a"/><rect x="-5" y="-67" width="10" height="2" fill="#3b5e2b"/></g><g transform="translate(322 236) rotate(-45)"><rect x="-6" y="-8" width="12" height="96" fill="#8b5a2b"/><rect x="0" y="-8" width="6" height="96" fill="#6e4422"/><path d="M-58-16H58V0H46V10H30V0H-30V10H-46V0H-58Z" fill="#2bb0c4"/><path d="M-58-16H58V-6H-58Z" fill="#5decf5"/><path d="M-28-28H28V-16H-28Z" fill="#5decf5"/><path d="M-28-28H6V-22H-28ZM-52-14H-22V-10H-52Z" fill="#c8fbff"/></g></svg>`;
})();
