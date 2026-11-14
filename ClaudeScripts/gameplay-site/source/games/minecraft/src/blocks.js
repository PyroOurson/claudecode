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
  let STT, SHP, OPQ, SOL, LAT, LEM, TIL, TRT, TNT, CSM, FLU, REP, MOD, COLL, SELB, FULLT, ANIMF, LEAF, RTK;
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
  function* finalizeBlocks() {
    const N = NSTATE;
    STT = new Uint16Array(N); SHP = new Uint8Array(N); OPQ = new Uint8Array(N); SOL = new Uint8Array(N); LAT = new Uint8Array(N); LEM = new Uint8Array(N);
    TIL = new Int16Array(N * 6).fill(-1); TRT = new Uint8Array(N * 6); TNT = new Uint8Array(N); CSM = new Uint16Array(N); FLU = new Uint8Array(N); REP = new Uint8Array(N); FULLT = new Uint8Array(N); ANIMF = new Uint8Array(N); LEAF = new Uint8Array(N); RTK = new Uint8Array(N);
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
        RTK[s] = t.tick || t.crop || t.sapling || LEAF[s] || t.fire || t.ox !== undefined || t.id === 'grass_block' || t.id === 'mycelium' || t.id === 'farmland' || t.id === 'ice' || t.id === 'snow' || t.id === 'kelp' || t.id === 'bamboo' || t.id === 'cocoa' ? 1 : 0;
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
      yield;
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
      model: s => rotY([bx(0, 4.5, 14, 16, 12.5, 16, t)], fq(s)), sel: s => rotCB([cb(0, 4.5, 14, 16, 12.5, 16)], fq(s)) }));
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
      if (flat) return [.5, 4, .5];
      for (const tmax of [.1, .4]) for (let r = 0; r < 1200; r += 8) for (let a = 0; a < 16; a++) {
        const x = Math.round(Math.cos(a * .3927 + r) * r), z = Math.round(Math.sin(a * .3927 + r) * r);
        column(x, z, o);
        const bb = BIO[o.b];
        if (o.h >= SEA + 1 && o.h < SEA + 40 && !bb.water && bb.top !== 'stone' && bb.top !== 'snow_block' && bb.top !== 'packed_ice' && bb.td < tmax) return [x + .5, o.h + 1, z + .5];
      }
      column(0, 0, o);
      return [.5, Math.max(o.h, SEA) + 2, .5];
    }
    return { BIO, gen, spawn, column, H, SEA };
  }
