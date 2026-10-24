(() => {
  'use strict';
  const ID = 'terraria';
  const TS = 16, CS = 16, TPS = 60, STEP = 1 / TPS;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sgn = v => v > 0 ? 1 : v < 0 ? -1 : 0;
  const rngf = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash2 = (x, y, s = 0) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  const strSeed = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mkcv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const ctx2 = c => { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; };
  const hex = c => { if (c[0] !== '#') { const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(c); return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0]; } let h = c.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbs = (r, g, b, a) => a == null || a >= 1 ? 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')' : 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + a + ')';
  const shade = (c, f) => { const [r, g, b] = hex(c); return f >= 0 ? rgbs(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgbs(r * (1 + f), g * (1 + f), b * (1 + f)); };
  const mix = (a, b, t) => { const p = hex(a), q = hex(b); return rgbs(lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)); };
  const fmtNum = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : String(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => performance.now();

  function mkNoise(seed) {
    const P = new Uint8Array(512), r = rngf(seed);
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = r() * (i + 1) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    const G = new Float32Array(256);
    for (let i = 0; i < 256; i++) G[i] = r() * 2 - 1;
    const f = t => t * t * t * (t * (t * 6 - 15) + 10);
    const n1 = x => { const xi = Math.floor(x), xf = x - xi, a = G[P[xi & 255]], b = G[P[xi + 1 & 255]]; return lerp(a, b, f(xf)); };
    const n2 = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const a = G[P[P[X] + Y]], b = G[P[P[X + 1] + Y]], c = G[P[P[X] + Y + 1]], d = G[P[P[X + 1] + Y + 1]];
      const u = f(xf), v = f(yf);
      return lerp(lerp(a, b, u), lerp(c, d, u), v);
    };
    const f1 = (x, o = 4, g = 0.5) => { let s = 0, a = 1, m = 0, q = 1; for (let i = 0; i < o; i++) { s += n1(x * q + i * 17.3) * a; m += a; a *= g; q *= 2; } return s / m; };
    const f2 = (x, y, o = 4, g = 0.5) => { let s = 0, a = 1, m = 0, q = 1; for (let i = 0; i < o; i++) { s += n2(x * q + i * 31.7, y * q + i * 17.1) * a; m += a; a *= g; q *= 2; } return s / m; };
    return { n1, n2, f1, f2 };
  }

  function rleEnc(a) {
    const n = a.length;
    let out = new Uint8Array(Math.max(64, (n >> 1) + 16)), o = 0, i = 0;
    const need = k => { if (o + k > out.length) { const t = new Uint8Array(out.length * 2 + k); t.set(out); out = t; } };
    while (i < n) {
      const v = a[i];
      let j = i + 1;
      while (j < n && a[j] === v && j - i < 65535) j++;
      const run = j - i;
      need(4 + (run < 3 ? run : 0));
      if (run >= 3 || v === 255) { out[o++] = 255; out[o++] = v; out[o++] = run & 255; out[o++] = run >> 8; }
      else for (let k = 0; k < run; k++) out[o++] = v;
      i = j;
    }
    return out.slice(0, o);
  }
  function rleDec(b, n) {
    const out = new Uint8Array(n);
    let o = 0, i = 0;
    const L = b.length;
    while (i < L && o < n) {
      const v = b[i++];
      if (v === 255) { const val = b[i++], run = b[i] | b[i + 1] << 8; i += 2; out.fill(val, o, Math.min(n, o + run)); o += run; }
      else out[o++] = v;
    }
    return out;
  }
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const b64e = a => {
    let s = '';
    const n = a.length;
    for (let i = 0; i < n; i += 3) {
      const x = a[i] << 16 | (i + 1 < n ? a[i + 1] : 0) << 8 | (i + 2 < n ? a[i + 2] : 0);
      s += B64[x >> 18 & 63] + B64[x >> 12 & 63] + (i + 1 < n ? B64[x >> 6 & 63] : '=') + (i + 2 < n ? B64[x & 63] : '=');
    }
    return s;
  };
  const B64I = (() => { const m = new Uint8Array(128); for (let i = 0; i < 64; i++) m[B64.charCodeAt(i)] = i; return m; })();
  const b64d = s => {
    let n = s.length / 4 * 3;
    if (s.endsWith('==')) n -= 2; else if (s.endsWith('=')) n -= 1;
    const o = new Uint8Array(n);
    let k = 0;
    for (let i = 0; i < s.length; i += 4) {
      const x = B64I[s.charCodeAt(i)] << 18 | B64I[s.charCodeAt(i + 1)] << 12 | B64I[s.charCodeAt(i + 2)] << 6 | B64I[s.charCodeAt(i + 3)];
      if (k < n) o[k++] = x >> 16 & 255;
      if (k < n) o[k++] = x >> 8 & 255;
      if (k < n) o[k++] = x & 255;
    }
    return o;
  };
  const T = {
    AIR: 0, DIRT: 1, STONE: 2, GRASS: 3, SAND: 4, SANDSTONE: 5, SNOW: 6, ICE: 7, CLAY: 8, EBONSTONE: 9, CGRASS: 10, ASH: 11, HELLSTONE: 12, OBSIDIAN: 13,
    COPPER: 14, IRON: 15, SILVER: 16, GOLD: 17, DEMONITE: 18, AMETHYST: 19, TOPAZ: 20, SAPPHIRE: 21, EMERALD: 22, RUBY: 23, DIAMOND: 24,
    WOOD: 25, GRAYBRICK: 26, GLASS: 27, PLATFORM: 28, TREE: 29, CACTUS: 30, SAPLING: 31, TORCH: 32, WORKBENCH: 33, FURNACE: 34, ANVIL: 35, CHEST: 36,
    TABLE: 37, CHAIR: 38, DOORC: 39, DOORO: 40, CRYSTAL: 41, ALTAR: 42, ORB: 43, TGRASS: 44, FLOWER: 45, MUSH: 46, GMUSH: 47, ROPE: 48, BEDROCK: 49,
    MUD: 50, MGRASS: 51, VINE: 52, HELLFORGE: 53, SNOWGRASS: 54, MUSHTREE: 55, CTHORN: 56, LANTERN: 57, BED: 58, SIGN: 59, BOOKCASE: 60
  };
  const NT = 61;
  const TD = new Array(NT);
  const td = (id, name, o) => { TD[id] = Object.assign({ n: name, s: 0, p: 0, hp: 50, mp: 0, tool: 'p', drop: null, lt: null, ob: null, snd: 'dirt', col: '#888', ter: 0, w: 1, h: 1, plant: 0 }, o); };
  td(T.AIR, 'Air', { hp: 0 });
  td(T.DIRT, 'Dirt Block', { s: 1, ter: 1, drop: 'dirt', col: '#976b4b', hp: 50 });
  td(T.STONE, 'Stone Block', { s: 1, ter: 1, drop: 'stone', col: '#808080', hp: 100, snd: 'stone' });
  td(T.GRASS, 'Grass', { s: 1, ter: 1, drop: 'dirt', col: '#3c9a2f', hp: 50 });
  td(T.SAND, 'Sand Block', { s: 1, ter: 1, drop: 'sand', col: '#d4c064', hp: 50, snd: 'sand', fall: 1 });
  td(T.SANDSTONE, 'Sandstone Block', { s: 1, ter: 1, drop: 'sandstone', col: '#b36741', hp: 80, snd: 'stone' });
  td(T.SNOW, 'Snow Block', { s: 1, ter: 1, drop: 'snow', col: '#e6f0fa', hp: 50, snd: 'snow' });
  td(T.ICE, 'Ice Block', { s: 1, ter: 1, drop: 'ice', col: '#9bc4ee', hp: 60, snd: 'glass' });
  td(T.CLAY, 'Clay Block', { s: 1, ter: 1, drop: 'clay', col: '#a35a4d', hp: 50 });
  td(T.EBONSTONE, 'Ebonstone Block', { s: 1, ter: 1, drop: 'ebonstone', col: '#5c4c78', hp: 120, snd: 'stone' });
  td(T.CGRASS, 'Corrupt Grass', { s: 1, ter: 1, drop: 'dirt', col: '#7a5aa8', hp: 50 });
  td(T.ASH, 'Ash Block', { s: 1, ter: 1, drop: 'ash', col: '#554e58', hp: 60, snd: 'sand' });
  td(T.HELLSTONE, 'Hellstone', { s: 1, ter: 1, drop: 'hellstone', col: '#c43c22', hp: 220, mp: 65, snd: 'stone', lt: [0.85, 0.32, 0.12] });
  td(T.OBSIDIAN, 'Obsidian', { s: 1, ter: 1, drop: 'obsidian', col: '#2c205e', hp: 200, mp: 55, snd: 'stone' });
  td(T.COPPER, 'Copper Ore', { s: 1, ter: 1, drop: 'copperOre', col: '#cd8647', hp: 90, snd: 'stone' });
  td(T.IRON, 'Iron Ore', { s: 1, ter: 1, drop: 'ironOre', col: '#b5a495', hp: 100, snd: 'stone' });
  td(T.SILVER, 'Silver Ore', { s: 1, ter: 1, drop: 'silverOre', col: '#d1d8d9', hp: 110, snd: 'stone' });
  td(T.GOLD, 'Gold Ore', { s: 1, ter: 1, drop: 'goldOre', col: '#e5d67f', hp: 120, snd: 'stone' });
  td(T.DEMONITE, 'Demonite Ore', { s: 1, ter: 1, drop: 'demoniteOre', col: '#7863c5', hp: 150, mp: 55, snd: 'stone' });
  const GEMS = ['amethyst', 'topaz', 'sapphire', 'emerald', 'ruby', 'diamond'];
  const GEMC = ['#b64cf0', '#f0c030', '#3a6cf0', '#34c060', '#e03038', '#c8e8f8'];
  GEMS.forEach((g, i) => td(T.AMETHYST + i, g[0].toUpperCase() + g.slice(1), { s: 1, ter: 1, drop: g, col: GEMC[i], hp: 100, snd: 'stone', lt: [GEMC[i] === '#c8e8f8' ? 0.14 : 0.07, 0.07, 0.07] }));
  td(T.WOOD, 'Wood', { s: 1, ter: 1, drop: 'wood', col: '#a8814b', hp: 70, tool: 'a', snd: 'wood' });
  td(T.GRAYBRICK, 'Gray Brick', { s: 1, ter: 1, drop: 'grayBrick', col: '#8c8c8c', hp: 100, snd: 'stone' });
  td(T.GLASS, 'Glass', { s: 1, ter: 1, drop: 'glass', col: '#bfe4f0', hp: 40, snd: 'glass' });
  td(T.PLATFORM, 'Wood Platform', { p: 1, drop: 'platform', col: '#a8814b', hp: 30, tool: 'x', snd: 'wood' });
  td(T.TREE, 'Tree', { drop: 'wood', col: '#6b4a2c', hp: 110, tool: 'a', snd: 'wood' });
  td(T.CACTUS, 'Cactus', { s: 1, drop: 'cactus', col: '#3c8a3a', hp: 60, tool: 'x', snd: 'plant' });
  td(T.SAPLING, 'Sapling', { drop: 'acorn', col: '#4a9a32', hp: 1, tool: 'x', snd: 'plant', plant: 1 });
  td(T.TORCH, 'Torch', { drop: 'torch', col: '#ffb040', hp: 1, tool: 'x', snd: 'wood', lt: [1, 0.86, 0.52], plant: 1 });
  td(T.WORKBENCH, 'Work Bench', { drop: 'workbench', col: '#a8814b', hp: 40, tool: 'x', snd: 'wood', ob: [2, 1], plat: 1 });
  td(T.FURNACE, 'Furnace', { drop: 'furnace', col: '#6c6c70', hp: 60, tool: 'x', snd: 'stone', ob: [3, 2], lt: [0.9, 0.5, 0.2] });
  td(T.ANVIL, 'Iron Anvil', { drop: 'anvil', col: '#8a8a90', hp: 60, tool: 'x', snd: 'metal', ob: [2, 1] });
  td(T.CHEST, 'Chest', { drop: 'chest', col: '#b88a30', hp: 50, tool: 'x', snd: 'wood', ob: [2, 2] });
  td(T.TABLE, 'Table', { drop: 'table', col: '#a8814b', hp: 40, tool: 'x', snd: 'wood', ob: [3, 2], plat: 1 });
  td(T.CHAIR, 'Chair', { drop: 'chair', col: '#a8814b', hp: 30, tool: 'x', snd: 'wood', ob: [1, 2] });
  td(T.DOORC, 'Door', { s: 1, drop: 'door', col: '#8a5a2c', hp: 40, tool: 'x', snd: 'wood', ob: [1, 3] });
  td(T.DOORO, 'Open Door', { drop: 'door', col: '#8a5a2c', hp: 40, tool: 'x', snd: 'wood', ob: [1, 3] });
  td(T.CRYSTAL, 'Life Crystal', { drop: 'lifeCrystal', col: '#ff5a8a', hp: 60, tool: 'p', snd: 'glass', ob: [2, 2], lt: [0.6, 0.2, 0.3] });
  td(T.ALTAR, 'Demon Altar', { col: '#5a3a78', hp: 0, tool: null, snd: 'stone', ob: [3, 2] });
  td(T.ORB, 'Shadow Orb', { col: '#8a50d0', hp: 100, tool: 'h', snd: 'glass', ob: [2, 2], lt: [0.35, 0.15, 0.5] });
  td(T.TGRASS, 'Tall Grass', { col: '#3c9a2f', hp: 1, tool: 'x', snd: 'plant', plant: 1 });
  td(T.FLOWER, 'Flower', { col: '#f0e050', hp: 1, tool: 'x', snd: 'plant', plant: 1 });
  td(T.MUSH, 'Mushroom', { drop: 'mushroom', col: '#c8a07a', hp: 1, tool: 'x', snd: 'plant', plant: 1 });
  td(T.GMUSH, 'Glowing Mushroom', { drop: 'glowMush', col: '#4a80ff', hp: 1, tool: 'x', snd: 'plant', plant: 1, lt: [0.15, 0.35, 0.95] });
  td(T.ROPE, 'Rope', { drop: 'rope', col: '#a07848', hp: 1, tool: 'x', snd: 'wood', plant: 1, climb: 1 });
  td(T.BEDROCK, 'Hellbrick', { s: 1, ter: 1, col: '#2a1818', hp: 0, tool: null, snd: 'stone' });
  td(T.MUD, 'Mud Block', { s: 1, ter: 1, drop: 'mud', col: '#5c4449', hp: 50 });
  td(T.MGRASS, 'Mushroom Grass', { s: 1, ter: 1, drop: 'mud', col: '#2a50c8', hp: 50, lt: [0.04, 0.1, 0.3] });
  td(T.VINE, 'Vine', { col: '#2f7a28', hp: 1, tool: 'x', snd: 'plant', plant: 1 });
  td(T.HELLFORGE, 'Hellforge', { drop: 'hellforge', col: '#703030', hp: 60, tool: 'x', snd: 'stone', ob: [3, 2], lt: [1, 0.45, 0.15] });
  td(T.SNOWGRASS, 'Snow', { s: 1, ter: 1, drop: 'snow', col: '#f0f6ff', hp: 50, snd: 'snow' });
  td(T.MUSHTREE, 'Giant Mushroom', { col: '#3a60e0', hp: 1, tool: 'x', snd: 'plant', plant: 1, lt: [0.1, 0.25, 0.7] });
  td(T.CTHORN, 'Corrupt Thorns', { col: '#503070', hp: 1, tool: 'x', snd: 'plant', plant: 1, thorn: 1 });
  td(T.LANTERN, 'Lantern', { drop: 'lantern', col: '#e8b040', hp: 1, tool: 'x', snd: 'glass', lt: [1, 0.85, 0.55], ob: [1, 1] });
  td(T.BED, 'Bed', { drop: 'bed', col: '#c04040', hp: 40, tool: 'x', snd: 'wood', ob: [4, 2], plat: 1 });
  td(T.SIGN, 'Sign', { drop: 'sign', col: '#a8814b', hp: 20, tool: 'x', snd: 'wood', ob: [2, 2] });
  td(T.BOOKCASE, 'Bookcase', { drop: 'bookcase', col: '#8a5a2c', hp: 50, tool: 'x', snd: 'wood', ob: [3, 4] });

  const SOLID = new Uint8Array(256), PLAT = new Uint8Array(256), TER = new Uint8Array(256), PLANT = new Uint8Array(256);
  for (let i = 0; i < NT; i++) { SOLID[i] = TD[i].s; PLAT[i] = TD[i].p; TER[i] = TD[i].ter; PLANT[i] = TD[i].plant; }

  const WL = { NONE: 0, DIRT: 1, STONE: 2, SAND: 3, ICE: 4, EBON: 5, HELL: 6, MUSH: 7, CLAYW: 8, WOOD: 20, STONEP: 21, BRICKP: 22, GLASSP: 23, DIRTP: 24, SNOWP: 25 };
  const WD = {};
  const wd = (id, name, o) => { WD[id] = Object.assign({ n: name, drop: null, col: '#555', house: 0 }, o); };
  wd(WL.DIRT, 'Dirt Wall', { col: '#5a3f2a' });
  wd(WL.STONE, 'Stone Wall', { col: '#4a4a4c' });
  wd(WL.SAND, 'Sandstone Wall', { col: '#7a4a2a' });
  wd(WL.ICE, 'Ice Wall', { col: '#4a6a90' });
  wd(WL.EBON, 'Ebonstone Wall', { col: '#3a2a4a' });
  wd(WL.HELL, 'Ash Wall', { col: '#2a2228' });
  wd(WL.MUSH, 'Mud Wall', { col: '#3a2e34' });
  wd(WL.CLAYW, 'Clay Wall', { col: '#6a3a30' });
  wd(WL.WOOD, 'Wood Wall', { col: '#6a4a28', drop: 'woodWall', house: 1 });
  wd(WL.STONEP, 'Stone Wall', { col: '#55555a', drop: 'stoneWall', house: 1 });
  wd(WL.BRICKP, 'Gray Brick Wall', { col: '#555559', drop: 'brickWall', house: 1 });
  wd(WL.GLASSP, 'Glass Wall', { col: '#7aa0b0', drop: 'glassWall', house: 1 });
  wd(WL.DIRTP, 'Dirt Wall', { col: '#5a3f2a', drop: 'dirtWall', house: 1 });
  wd(WL.SNOWP, 'Snow Wall', { col: '#9ab0c8', drop: 'snowWall', house: 1 });
  const WHOUSE = new Uint8Array(256);
  for (const k in WD) WHOUSE[k] = WD[k].house;

  const BIOME = { FOREST: 0, DESERT: 1, SNOW: 2, CORRUPT: 3, OCEAN: 4, MUSHROOM: 5 };
  const BIOME_N = ['Forest', 'Desert', 'Snow', 'The Corruption', 'Ocean', 'Glowing Mushroom'];
  const IT = {};
  const it = (id, name, o) => { IT[id] = Object.assign({ id, n: name, t: 'mat', st: 999, v: 0, rar: 0, sp: null, use: 0, dmg: 0, kb: 0 }, o); };
  const blk = (id, name, tile, v, sp) => it(id, name, { t: 'block', tile, v, sp: sp || 'tile:' + tile, use: 10 });
  blk('dirt', 'Dirt Block', T.DIRT, 0);
  blk('stone', 'Stone Block', T.STONE, 0);
  blk('sand', 'Sand Block', T.SAND, 0);
  blk('sandstone', 'Sandstone Block', T.SANDSTONE, 0);
  blk('snow', 'Snow Block', T.SNOW, 0);
  blk('ice', 'Ice Block', T.ICE, 0);
  blk('clay', 'Clay Block', T.CLAY, 0);
  blk('mud', 'Mud Block', T.MUD, 0);
  blk('ebonstone', 'Ebonstone Block', T.EBONSTONE, 50);
  blk('ash', 'Ash Block', T.ASH, 0);
  blk('obsidian', 'Obsidian', T.OBSIDIAN, 100);
  blk('wood', 'Wood', T.WOOD, 0, 'wood');
  blk('grayBrick', 'Gray Brick', T.GRAYBRICK, 0);
  blk('glass', 'Glass', T.GLASS, 0);
  blk('platform', 'Wood Platform', T.PLATFORM, 0, 'platform');
  blk('copperOre', 'Copper Ore', T.COPPER, 700, 'ore:copper');
  blk('ironOre', 'Iron Ore', T.IRON, 1000, 'ore:iron');
  blk('silverOre', 'Silver Ore', T.SILVER, 2000, 'ore:silver');
  blk('goldOre', 'Gold Ore', T.GOLD, 3000, 'ore:gold');
  blk('demoniteOre', 'Demonite Ore', T.DEMONITE, 4500, 'ore:demonite');
  blk('hellstone', 'Hellstone', T.HELLSTONE, 1500, 'ore:hellstone');
  blk('amethyst', 'Amethyst', T.AMETHYST, 750, 'gem:amethyst');
  blk('topaz', 'Topaz', T.TOPAZ, 1500, 'gem:topaz');
  blk('sapphire', 'Sapphire', T.SAPPHIRE, 3000, 'gem:sapphire');
  blk('emerald', 'Emerald', T.EMERALD, 4500, 'gem:emerald');
  blk('ruby', 'Ruby', T.RUBY, 7500, 'gem:ruby');
  blk('diamond', 'Diamond', T.DIAMOND, 15000, 'gem:diamond');
  ['amethyst', 'topaz', 'sapphire', 'emerald', 'ruby', 'diamond'].forEach(g => { IT[g].rar = 1; });
  IT.demoniteOre.rar = 1; IT.hellstone.rar = 2; IT.obsidian.rar = 1;
  const fur = (id, name, tile, v, o) => it(id, name, Object.assign({ t: 'block', tile, v, sp: 'tile:' + tile, use: 10 }, o));
  fur('workbench', 'Work Bench', T.WORKBENCH, 150);
  fur('furnace', 'Furnace', T.FURNACE, 300);
  fur('anvil', 'Iron Anvil', T.ANVIL, 5000);
  fur('hellforge', 'Hellforge', T.HELLFORGE, 3000);
  fur('chest', 'Chest', T.CHEST, 500);
  fur('table', 'Table', T.TABLE, 300);
  fur('chair', 'Chair', T.CHAIR, 150);
  fur('door', 'Wooden Door', T.DOORC, 200);
  fur('torch', 'Torch', T.TORCH, 50, { sp: 'torch' });
  fur('rope', 'Rope', T.ROPE, 10, { sp: 'rope' });
  fur('lantern', 'Lantern', T.LANTERN, 400);
  fur('acorn', 'Acorn', T.SAPLING, 20, { sp: 'acorn', tip: 'Plants on grass or dirt to grow a tree' });
  it('lifeCrystal', 'Life Crystal', { t: 'use', st: 99, v: 5000, rar: 1, sp: 'heart', use: 30, life: 20, tip: 'Permanently increases maximum life by 20' });
  it('manaCrystal', 'Mana Crystal', { t: 'use', st: 99, v: 5000, rar: 1, sp: 'manastar', use: 30, mana: 20, tip: 'Permanently increases maximum mana by 20' });
  const wall = (id, name, wl, v) => it(id, name, { t: 'wall', wall: wl, v, sp: 'wall:' + wl, use: 7 });
  wall('woodWall', 'Wood Wall', WL.WOOD, 0);
  wall('stoneWall', 'Stone Wall', WL.STONEP, 0);
  wall('brickWall', 'Gray Brick Wall', WL.BRICKP, 0);
  wall('glassWall', 'Glass Wall', WL.GLASSP, 0);
  wall('dirtWall', 'Dirt Wall', WL.DIRTP, 0);
  wall('snowWall', 'Snow Wall', WL.SNOWP, 0);
  const bar = (id, name, v, rar) => it(id, name, { v, rar: rar || 0, sp: 'bar:' + id.replace('Bar', '') });
  bar('copperBar', 'Copper Bar', 450);
  bar('ironBar', 'Iron Bar', 1200);
  bar('silverBar', 'Silver Bar', 2400);
  bar('goldBar', 'Gold Bar', 3600, 1);
  bar('demoniteBar', 'Demonite Bar', 5400, 1);
  bar('hellstoneBar', 'Hellstone Bar', 6000, 2);
  it('gel', 'Gel', { v: 5, sp: 'gel' });
  it('lens', 'Lens', { v: 150, sp: 'lens' });
  it('rottenChunk', 'Rotten Chunk', { v: 100, sp: 'rotten' });
  it('shadowScale', 'Shadow Scale', { v: 1000, rar: 1, sp: 'scale' });
  it('mushroom', 'Mushroom', { t: 'use', v: 25, sp: 'mushroom', use: 17, heal: 15, tip: 'Restores 15 life' });
  it('glowMush', 'Glowing Mushroom', { t: 'use', v: 15, sp: 'glowmush', use: 17, heal: 25, tip: 'Restores 25 life' });
  it('cactus', 'Cactus', { v: 10, sp: 'cactus' });
  it('fallenStar', 'Fallen Star', { v: 500, rar: 1, sp: 'star', tip: 'Disappears at daybreak' });
  it('cu', 'Copper Coin', { t: 'coin', st: 100, v: 1, sp: 'coin:cu' });
  it('ag', 'Silver Coin', { t: 'coin', st: 100, v: 100, sp: 'coin:ag' });
  it('au', 'Gold Coin', { t: 'coin', st: 100, v: 10000, sp: 'coin:au' });
  it('pt', 'Platinum Coin', { t: 'coin', st: 1000, v: 1000000, sp: 'coin:pt' });
  it('heart', 'Heart', { t: 'pickup', sp: 'heart' });
  it('manaStarPickup', 'Star', { t: 'pickup', sp: 'manastar' });

  const tool = (id, name, o) => it(id, name, Object.assign({ t: 'tool', st: 1, use: 15, dmg: 3, kb: 2 }, o));
  const METAL = { copper: 0, iron: 1, silver: 2, gold: 3 };
  const MN = { copper: 'Copper', iron: 'Iron', silver: 'Silver', gold: 'Gold' };
  const PICK = [35, 40, 45, 55], AXE = [35, 40, 45, 55], HAM = [45, 50, 55, 60], PUSE = [15, 14, 13, 12];
  const MV = [900, 2000, 4000, 7000];
  Object.keys(METAL).forEach(m => {
    const i = METAL[m];
    tool(m + 'Pickaxe', MN[m] + ' Pickaxe', { pick: PICK[i], use: PUSE[i], dmg: 4 + i, kb: 2, v: MV[i] * 1.5, sp: 'pick:' + m, rar: i > 1 ? 1 : 0 });
    tool(m + 'Axe', MN[m] + ' Axe', { axe: AXE[i], use: PUSE[i] + 6, dmg: 5 + i, kb: 3, v: MV[i], sp: 'axe:' + m, rar: i > 1 ? 1 : 0 });
    tool(m + 'Hammer', MN[m] + ' Hammer', { hammer: HAM[i], use: PUSE[i] + 12, dmg: 6 + i, kb: 5, v: MV[i], sp: 'hammer:' + m, rar: i > 1 ? 1 : 0 });
  });
  tool('nightmarePick', 'Nightmare Pickaxe', { pick: 65, use: 12, dmg: 9, kb: 3, v: 20000, sp: 'pick:demonite', rar: 1 });
  tool('warAxe', 'War Axe of the Night', { axe: 70, use: 17, dmg: 15, kb: 4.5, v: 20000, sp: 'axe:demonite', rar: 1 });
  tool('moltenPick', 'Molten Pickaxe', { pick: 100, use: 12, dmg: 12, kb: 4, v: 40000, sp: 'pick:hellstone', rar: 2 });
  const sword = (id, name, o) => it(id, name, Object.assign({ t: 'weapon', st: 1, style: 'swing', kb: 4.5, use: 22 }, o));
  sword('woodenSword', 'Wooden Sword', { dmg: 7, use: 25, v: 100, sp: 'sword:wood' });
  [['copper', 5, 8], ['iron', 6, 9], ['silver', 8, 11], ['gold', 9, 13]].forEach(([m, s, b], i) => {
    sword(m + 'Shortsword', MN[m] + ' Shortsword', { dmg: s + 1, use: 12, style: 'stab', kb: 3, v: MV[i] * 1.2, sp: 'short:' + m, rar: i > 1 ? 1 : 0 });
    sword(m + 'Broadsword', MN[m] + ' Broadsword', { dmg: b + 1, use: 23 - i, kb: 5.5, v: MV[i] * 1.5, sp: 'sword:' + m, rar: i > 1 ? 1 : 0 });
  });
  sword('lightsBane', "Light's Bane", { dmg: 16, use: 20, kb: 5, v: 22500, sp: 'sword:demonite', rar: 1, tip: 'Corrupt blade' });
  sword('fieryGreatsword', 'Fiery Greatsword', { dmg: 34, use: 33, kb: 6.5, v: 45000, sp: 'sword:hellstone', rar: 2, big: 1, tip: 'Sets enemies on fire' });
  const bow = (id, name, o) => it(id, name, Object.assign({ t: 'weapon', st: 1, style: 'bow', kb: 1, use: 24, ammo: 'arrow', spd: 8 }, o));
  bow('woodenBow', 'Wooden Bow', { dmg: 5, use: 26, v: 100, sp: 'bow:wood' });
  [['copper', 6], ['iron', 8], ['silver', 10], ['gold', 12]].forEach(([m, d], i) => bow(m + 'Bow', MN[m] + ' Bow', { dmg: d, use: 24 - i, v: MV[i], sp: 'bow:' + m, rar: i > 1 ? 1 : 0 }));
  it('woodenArrow', 'Wooden Arrow', { t: 'ammo', ammo: 'arrow', dmg: 5, v: 5, sp: 'arrow:wood' });
  it('flamingArrow', 'Flaming Arrow', { t: 'ammo', ammo: 'arrow', dmg: 7, v: 10, sp: 'arrow:fire', fire: 1, tip: 'Sets enemies on fire' });
  it('unholyArrow', 'Unholy Arrow', { t: 'ammo', ammo: 'arrow', dmg: 8, v: 20, sp: 'arrow:unholy', rar: 1, tip: 'Pierces once' });
  const staff = (id, name, o) => it(id, name, Object.assign({ t: 'weapon', st: 1, style: 'staff', use: 30, mana: 4, kb: 3, spd: 8, bolt: 'amethyst' }, o));
  staff('wandSparking', 'Wand of Sparking', { dmg: 9, mana: 2, use: 21, v: 1000, sp: 'staff:spark', bolt: 'spark', rar: 0 });
  staff('amethystStaff', 'Amethyst Staff', { dmg: 12, mana: 4, use: 30, v: 5000, sp: 'staff:amethyst', bolt: 'amethyst', rar: 1 });
  staff('topazStaff', 'Topaz Staff', { dmg: 15, mana: 5, use: 29, v: 8000, sp: 'staff:topaz', bolt: 'topaz', rar: 1 });
  staff('sapphireStaff', 'Sapphire Staff', { dmg: 19, mana: 7, use: 28, v: 12000, sp: 'staff:sapphire', bolt: 'sapphire', rar: 1 });
  staff('emeraldStaff', 'Emerald Staff', { dmg: 24, mana: 8, use: 27, v: 16000, sp: 'staff:emerald', bolt: 'emerald', rar: 1 });
  staff('rubyStaff', 'Ruby Staff', { dmg: 30, mana: 9, use: 26, v: 22000, sp: 'staff:ruby', bolt: 'ruby', rar: 2 });
  staff('diamondStaff', 'Diamond Staff', { dmg: 36, mana: 10, use: 25, v: 30000, sp: 'staff:diamond', bolt: 'diamond', rar: 2 });
  staff('vilethorn', 'Vilethorn', { dmg: 14, mana: 7, use: 30, v: 15000, sp: 'staff:thorn', bolt: 'thorn', rar: 1, tip: 'Summons a vile thorn' });
  const arm = (id, name, slot, def, set, sp, v, o) => it(id, name, Object.assign({ t: 'armor', slot, def, set, st: 1, sp, v, tip: '' }, o));
  const SETS = {
    wood: ['Wood', [1, 2, 1], 1, 'wood', 0], copper: ['Copper', [2, 2, 1], 0, 'copper', 1], iron: ['Iron', [2, 3, 2], 0, 'iron', 2], silver: ['Silver', [3, 4, 3], 0, 'silver', 3],
    gold: ['Gold', [4, 5, 4], 0, 'gold', 4], shadow: ['Shadow', [5, 6, 5], 0, 'shadow', 5], molten: ['Molten', [7, 9, 6], 0, 'molten', 6]
  };
  Object.keys(SETS).forEach(k => {
    const [nm, d, setb, pal, vi] = SETS[k];
    const hn = k === 'wood' ? 'Wood Helmet' : k === 'shadow' ? 'Shadow Helmet' : nm + ' Helmet';
    const cn = k === 'wood' ? 'Wood Breastplate' : k === 'shadow' ? 'Shadow Scalemail' : k === 'molten' ? 'Molten Breastplate' : nm + ' Chainmail';
    const ln = k === 'wood' ? 'Wood Greaves' : nm + ' Greaves';
    const vv = [200, 900, 2500, 5000, 9000, 18000, 36000][vi];
    arm(k + 'Helmet', hn, 'h', d[0], k, 'helm:' + pal, vv, { rar: vi > 2 ? 1 : 0 });
    arm(k + 'Chest', cn, 'b', d[1], k, 'chest:' + pal, vv * 1.5, { rar: vi > 2 ? 1 : 0 });
    arm(k + 'Legs', ln, 'l', d[2], k, 'legs:' + pal, vv * 1.2, { rar: vi > 2 ? 1 : 0 });
  });
  IT.woodHelmet.setBonus = 1;
  IT.shadowHelmet.setBonus = 0;
  it('miningHelmet', 'Mining Helmet', { t: 'armor', slot: 'h', def: 1, set: 'mining', st: 1, sp: 'helm:mining', v: 8000, light: [1, 0.92, 0.6], tip: 'Provides light when worn' });
  const acc = (id, name, sp, v, o) => it(id, name, Object.assign({ t: 'acc', st: 1, sp, v, rar: 1 }, o));
  acc('cloudBottle', 'Cloud in a Bottle', 'misc:cloud', 5000, { jump2: 1, tip: 'Allows the holder to double jump' });
  acc('hermes', 'Hermes Boots', 'misc:boots', 7500, { runMax: 6.75, tip: 'The wearer can run super fast' });
  acc('horseshoe', 'Lucky Horseshoe', 'misc:shoe', 6000, { noFall: 1, tip: 'Negates fall damage' });
  acc('balloon', 'Shiny Red Balloon', 'misc:balloon', 6000, { jumpBoost: 1, tip: 'Increases jump height' });
  acc('bandRegen', 'Band of Regeneration', 'misc:ring', 6000, { regen: 2, tip: 'Slowly regenerates life' });
  acc('bandStar', 'Band of Starpower', 'misc:ringp', 6000, { manaMax: 20, tip: 'Increases maximum mana by 20' });
  it('magicMirror', 'Magic Mirror', { t: 'tool', st: 1, v: 5000, rar: 1, sp: 'misc:mirror', use: 90, mirror: 1, tip: 'Gaze in the mirror to return home' });
  const pot = (id, name, o) => it(id, name, Object.assign({ t: 'use', st: 30, use: 17, sp: 'potion:red' }, o));
  pot('lesserHeal', 'Lesser Healing Potion', { v: 300, heal: 50, sp: 'potion:red', tip: 'Restores 50 life', sick: 1 });
  pot('healPotion', 'Healing Potion', { v: 900, heal: 100, sp: 'potion:redbig', tip: 'Restores 100 life', sick: 1, rar: 1 });
  pot('lesserMana', 'Lesser Mana Potion', { v: 100, healMana: 100, sp: 'potion:blue', tip: 'Restores 100 mana' });
  it('suspEye', 'Suspicious Looking Eye', { t: 'boss', st: 20, v: 0, rar: 1, sp: 'misc:eye', use: 45, tip: 'May attract something horrible. Use at night' });
  it('slimeCrown', 'Slime Crown', { t: 'boss', st: 20, v: 0, rar: 1, sp: 'misc:crown', use: 45, tip: 'Summons King Slime' });
  it('wormFood', 'Worm Food', { t: 'boss', st: 20, v: 0, rar: 1, sp: 'misc:worm', use: 45, tip: 'Summons the Eater of Worlds in the Corruption' });
  it('guideDoll', 'Voodoo Doll', { v: 0, sp: 'misc:eye' });

  const COIN_IDS = { cu: 1, ag: 100, au: 10000, pt: 1000000 };
  const RECIPES = [];
  const rec = (out, n, ins, st) => RECIPES.push({ out, n, ins, st: st || '' });
  rec('workbench', 1, { wood: 10 });
  rec('torch', 3, { wood: 1, gel: 1 });
  rec('platform', 2, { wood: 1 });
  rec('rope', 5, { wood: 1 });
  rec('woodWall', 4, { wood: 1 }, 'bench');
  rec('woodenSword', 1, { wood: 7 }, 'bench');
  rec('woodenBow', 1, { wood: 10 }, 'bench');
  rec('woodenArrow', 5, { wood: 1, stone: 1 }, 'bench');
  rec('flamingArrow', 5, { woodenArrow: 5, torch: 1 }, 'bench');
  rec('door', 1, { wood: 6 }, 'bench');
  rec('chair', 1, { wood: 4 }, 'bench');
  rec('table', 1, { wood: 8 }, 'bench');
  rec('chest', 1, { wood: 8, ironBar: 2 }, 'bench');
  rec('lantern', 1, { torch: 1, ironBar: 1 }, 'bench');
  rec('woodHelmet', 1, { wood: 20 }, 'bench');
  rec('woodChest', 1, { wood: 30 }, 'bench');
  rec('woodLegs', 1, { wood: 25 }, 'bench');
  rec('stoneWall', 4, { stone: 1 }, 'bench');
  rec('dirtWall', 4, { dirt: 1 }, 'bench');
  rec('snowWall', 4, { snow: 1 }, 'bench');
  rec('glassWall', 4, { glass: 1 }, 'bench');
  rec('furnace', 1, { stone: 20, torch: 4, wood: 3 }, 'bench');
  rec('grayBrick', 1, { stone: 1 }, 'furnace');
  rec('brickWall', 4, { grayBrick: 1 }, 'bench');
  rec('glass', 1, { sand: 1 }, 'furnace');
  rec('copperBar', 1, { copperOre: 3 }, 'furnace');
  rec('ironBar', 1, { ironOre: 3 }, 'furnace');
  rec('silverBar', 1, { silverOre: 4 }, 'furnace');
  rec('goldBar', 1, { goldOre: 4 }, 'furnace');
  rec('demoniteBar', 1, { demoniteOre: 3 }, 'furnace');
  rec('anvil', 1, { ironBar: 5 });
  rec('manaCrystal', 1, { fallenStar: 5 });
  const mrec = (m, n, bars) => { rec(m + 'Pickaxe', 1, { [m + 'Bar']: bars[0] }, 'anvil'); rec(m + 'Axe', 1, { [m + 'Bar']: bars[1] }, 'anvil'); rec(m + 'Hammer', 1, { [m + 'Bar']: bars[2] }, 'anvil'); rec(m + 'Shortsword', 1, { [m + 'Bar']: bars[3] }, 'anvil'); rec(m + 'Broadsword', 1, { [m + 'Bar']: bars[4] }, 'anvil'); rec(m + 'Bow', 1, { [m + 'Bar']: bars[5] }, 'anvil'); rec(m + 'Helmet', 1, { [m + 'Bar']: bars[6] }, 'anvil'); rec(m + 'Chest', 1, { [m + 'Bar']: bars[7] }, 'anvil'); rec(m + 'Legs', 1, { [m + 'Bar']: bars[8] }, 'anvil'); };
  mrec('copper', 0, [12, 9, 10, 7, 8, 7, 15, 25, 20]);
  mrec('iron', 1, [12, 9, 10, 7, 8, 7, 15, 25, 20]);
  mrec('silver', 2, [12, 9, 10, 7, 8, 7, 15, 25, 20]);
  mrec('gold', 3, [12, 9, 10, 7, 8, 7, 15, 25, 20]);
  rec('amethystStaff', 1, { amethyst: 8, wood: 50 }, 'bench');
  rec('topazStaff', 1, { topaz: 8, wood: 50 }, 'bench');
  rec('sapphireStaff', 1, { sapphire: 8, wood: 50 }, 'bench');
  rec('emeraldStaff', 1, { emerald: 8, wood: 50 }, 'bench');
  rec('rubyStaff', 1, { ruby: 8, wood: 50 }, 'bench');
  rec('diamondStaff', 1, { diamond: 8, wood: 50 }, 'bench');
  rec('lightsBane', 1, { demoniteBar: 12 }, 'anvil');
  rec('nightmarePick', 1, { demoniteBar: 12, shadowScale: 6 }, 'anvil');
  rec('warAxe', 1, { demoniteBar: 12, shadowScale: 6 }, 'anvil');
  rec('shadowHelmet', 1, { demoniteBar: 10, shadowScale: 5 }, 'anvil');
  rec('shadowChest', 1, { demoniteBar: 20, shadowScale: 10 }, 'anvil');
  rec('shadowLegs', 1, { demoniteBar: 15, shadowScale: 8 }, 'anvil');
  rec('hellforge', 1, { furnace: 1, hellstone: 15, torch: 5 }, 'bench');
  rec('hellstoneBar', 1, { hellstone: 3, obsidian: 1 }, 'forge');
  rec('moltenPick', 1, { hellstoneBar: 15 }, 'anvil');
  rec('fieryGreatsword', 1, { hellstoneBar: 25 }, 'anvil');
  rec('moltenHelmet', 1, { hellstoneBar: 15 }, 'anvil');
  rec('moltenChest', 1, { hellstoneBar: 20 }, 'anvil');
  rec('moltenLegs', 1, { hellstoneBar: 15 }, 'anvil');
  rec('suspEye', 1, { lens: 6 }, 'altar');
  rec('wormFood', 1, { rottenChunk: 30 }, 'altar');
  rec('slimeCrown', 1, { gel: 25, goldBar: 1 }, 'bench');
  rec('lesserMana', 2, { fallenStar: 1, gel: 2 }, 'bench');
  RECIPES.forEach(r => { if (!IT[r.out]) console.warn('recipe missing item', r.out); Object.keys(r.ins).forEach(k => { if (!IT[k]) console.warn('ingredient missing', k); }); });
  const STNAME = { bench: 'Work Bench', furnace: 'Furnace', anvil: 'Iron Anvil', altar: 'Demon Altar', forge: 'Hellforge' };
  const RARC = { '-1': '#9a9a9a', 0: '#ffffff', 1: '#96c8ff', 2: '#96ff96', 3: '#ffc896', 4: '#ff96ff', 5: '#d2a0ff' };
  const itemVal = id => IT[id] ? IT[id].v : 0;
  const coinSplit = n => { const pt = Math.floor(n / 1e6), au = Math.floor(n % 1e6 / 1e4), ag = Math.floor(n % 1e4 / 100), cu = n % 100; return { pt, au, ag, cu }; };
  const coinText = n => { const c = coinSplit(n); const a = []; if (c.pt) a.push(c.pt + ' platinum'); if (c.au) a.push(c.au + ' gold'); if (c.ag) a.push(c.ag + ' silver'); if (c.cu || !a.length) a.push(c.cu + ' copper'); return a.join(' '); };
  const SHOP = [
    ['miningHelmet', 40000], ['anvil', 50000], ['copperPickaxe', 20000], ['copperAxe', 15000], ['lesserHeal', 300], ['woodenArrow', 40], ['torch', 60], ['rope', 20], ['workbench', 400], ['furnace', 2000], ['wood', 30], ['gel', 100], ['lesserMana', 1000], ['glass', 20], ['platform', 20]
  ];
  const PAL = {
    dirt: ['#5e4129', '#725138', '#976b4b', '#a97d5d', '#bf8f6f'],
    stone: ['#505054', '#626266', '#7a7a7e', '#8c8c90', '#a6a6aa'],
    sand: ['#b08844', '#c9a55a', '#d4c064', '#dfd08a', '#eae2a8'],
    sandstone: ['#8a4628', '#a55737', '#b36741', '#c67c4e', '#d49458'],
    snow: ['#b0c4de', '#cfdcee', '#e6f0fa', '#f4f9ff', '#ffffff'],
    ice: ['#6c9ad8', '#86b2e8', '#9bc4ee', '#bcdcff', '#e0f0ff'],
    clay: ['#6f4945', '#8a4b3f', '#925144', '#af5e51', '#bf756d'],
    ebon: ['#2a1e38', '#3e2d4b', '#543c50', '#5e577a', '#726a96'],
    ash: ['#2a2830', '#323246', '#44444c', '#655a66', '#8f7579'],
    hell: ['#3a1810', '#4e2424', '#662222', '#7c2c22', '#8e3a2a'],
    obs: ['#0e0d1d', '#1d1b39', '#2b2854', '#2c205e', '#5751ad'],
    mud: ['#3a2c32', '#49393f', '#5c4449', '#6f5359', '#87656c'],
    wood: ['#624a2b', '#755933', '#8c6a3c', '#b68d56', '#c6aa68'],
    brick: ['#5a5a5a', '#787878', '#8c8c8c', '#9a9a9a', '#afafaf'],
    mushg: ['#1c2a5a', '#2a3c80', '#3a56b8', '#4a70e0', '#7aa0ff']
  };
  const TEXSTYLE = {
    [T.DIRT]: ['dirt', 3.2], [T.STONE]: ['stone', 3.6], [T.GRASS]: ['dirt', 3.2], [T.SAND]: ['sand', 1.8], [T.SANDSTONE]: ['sandstone', 3], [T.SNOW]: ['snow', 2.2], [T.ICE]: ['ice', 3],
    [T.CLAY]: ['clay', 2.8], [T.EBONSTONE]: ['ebon', 3], [T.CGRASS]: ['dirt', 3.2], [T.ASH]: ['ash', 2.6], [T.HELLSTONE]: ['hell', 2.2], [T.OBSIDIAN]: ['obs', 2.4], [T.MUD]: ['mud', 3], [T.MGRASS]: ['mud', 3],
    [T.WOOD]: ['wood', 0], [T.GRAYBRICK]: ['brick', 0], [T.SNOWGRASS]: ['snow', 2.2], [T.BEDROCK]: ['ash', 1.6]
  };
  const ORE = {
    [T.COPPER]: { base: 'stone', c: ['#401b07', '#964316', '#cd8647', '#f0b080'] },
    [T.IRON]: { base: 'stone', c: ['#2e2720', '#6e4a40', '#b5a495', '#e0d0c0'] },
    [T.SILVER]: { base: 'stone', c: ['#2e3a3c', '#7a8c90', '#d1d8d9', '#ffffff'] },
    [T.GOLD]: { base: 'stone', c: ['#3e2e19', '#947e18', '#e5d67f', '#fff9b7'] },
    [T.DEMONITE]: { base: 'ebon', c: ['#181630', '#42356f', '#7863c5', '#b0a0e8'] },
    [T.HELLSTONE]: { base: 'hell', c: ['#29150e', '#c4452a', '#ee6646', '#ffd0a0'] }
  };
  const mkTex = (pal, scale, seed, w = 16, h = 16) => {
    const nz = mkNoise(seed), r = rngf(seed * 7 + 1), out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = nz.f2(x / scale + 5.3, y / scale + 9.1, 2) * 1.1 + (r() - 0.5) * 0.55;
      let idx = Math.floor((n * 0.5 + 0.5) * pal.length);
      if (r() < 0.07) idx += r() < 0.5 ? -2 : 2;
      out.push(pal[clamp(idx, 0, pal.length - 1)]);
    }
    return out;
  };
  const putTex = (g, tex, ox, oy, w = 16, h = 16) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { g.fillStyle = tex[y * w + x]; g.fillRect(ox + x, oy + y, 1, 1); } };
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const texFor = (id, v) => {
    const st = TEXSTYLE[id];
    if (st) {
      if (id === T.WOOD) {
        const o = []; const r = rngf(900 + v);
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          const row = y >> 2, ry = y & 3;
          let c = PAL.wood[2];
          if (ry === 0) c = PAL.wood[4]; else if (ry === 3) c = PAL.wood[0]; else if (ry === 1) c = PAL.wood[3]; else c = PAL.wood[2];
          if (r() < 0.07) c = PAL.wood[1 + (r() * 3 | 0)];
          if ((x + row * 5 + v * 3) % 16 === 0 && ry > 0 && ry < 3) c = PAL.wood[0];
          o.push(c);
        }
        return o;
      }
      if (id === T.GRAYBRICK) {
        const o = []; const r = rngf(800 + v);
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          const row = y >> 3, ry = y & 7, off = row ? 8 : 0, rx = (x + off) & 15;
          let c = PAL.brick[2];
          if (ry === 7 || rx === 7 || rx === 15) c = '#414141';
          else if (ry === 0 || rx === 0 || rx === 8) c = PAL.brick[4];
          else if (r() < 0.12) c = PAL.brick[1 + (r() * 2 | 0)];
          o.push(c);
        }
        return o;
      }
      return mkTex(PAL[st[0]], st[1], id * 31 + v * 977 + 13);
    }
    const o = ORE[id];
    if (o) {
      const base = mkTex(PAL[o.base], o.base === 'stone' ? 3.6 : 3, id * 17 + v * 311 + 5);
      const r = rngf(id * 131 + v * 71 + 3);
      const nb = id === T.HELLSTONE ? 7 : 4;
      for (let b = 0; b < nb; b++) {
        const cx = 2 + (r() * 12 | 0), cy = 2 + (r() * 12 | 0), sz = 2 + (r() * 2 | 0);
        for (let dy = -sz; dy <= sz; dy++) for (let dx = -sz; dx <= sz; dx++) {
          const d = Math.abs(dx) + Math.abs(dy) * 1.2;
          if (d > sz + 0.3 + r() * 0.5) continue;
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x > 15 || y > 15) continue;
          let c = o.c[2];
          if (d > sz - 0.5) c = o.c[1];
          else if (dx < 0 && dy < 0 && d < sz - 0.8) c = o.c[3];
          base[y * 16 + x] = c;
        }
        if (id !== T.HELLSTONE) { const px1 = cx + (r() < 0.5 ? -sz : sz), py1 = cy + sz; if (px1 >= 0 && px1 < 16 && py1 < 16) base[py1 * 16 + px1] = o.c[0]; }
      }
      return base;
    }
    if (id >= T.AMETHYST && id <= T.DIAMOND) {
      const g = GEMC[id - T.AMETHYST];
      const base = mkTex(PAL.stone, 3.6, id * 17 + v * 311 + 5);
      const r = rngf(id * 91 + v * 13 + 7);
      const dk = shade(g, -0.55), lt = shade(g, 0.55);
      for (let b = 0; b < 3; b++) {
        const cx = 2 + (r() * 11 | 0), cy = 2 + (r() * 11 | 0);
        const pts = [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [-1, 1], [2, 1]];
        pts.forEach(([dx, dy]) => { const x = cx + dx, y = cy + dy; if (x >= 0 && x < 16 && y >= 0 && y < 16) base[y * 16 + x] = g; });
        [[0, -1], [1, -1], [-1, 0], [2, 0], [-1, 2], [2, 2], [0, 3], [1, 3]].forEach(([dx, dy]) => { const x = cx + dx, y = cy + dy; if (x >= 0 && x < 16 && y >= 0 && y < 16 && (dx + dy + b) % 3) base[y * 16 + x] = dk; });
        base[cy * 16 + cx] = lt;
      }
      return base;
    }
    return mkTex(PAL.stone, 3, id);
  };
  const GRASSC = { [T.GRASS]: ['#1c5c1a', '#2c8c28', '#3cb43c', '#7bd35a'], [T.CGRASS]: ['#3a2062', '#5a3c92', '#7d58b8', '#b08ae8'], [T.MGRASS]: ['#1c34a0', '#2c58d8', '#4a84ff', '#9ac4ff'], [T.SNOWGRASS]: ['#a0b8d8', '#cfe0f4', '#eef6ff', '#ffffff'] };
  const tileStrips = new Map();
  function mkTerrainStrip(id) {
    const cv = mkcv(256, 48), g = ctx2(cv);
    const gc = GRASSC[id];
    for (let v = 0; v < 3; v++) {
      const tex = texFor(id, v);
      for (let m = 0; m < 16; m++) {
        const ox = m * 16, oy = v * 16;
        putTex(g, tex, ox, oy);
        const up = m & 1, dn = m & 2, lf = m & 4, rt = m & 8;
        const r = rngf(id * 1009 + v * 101 + m * 7);
        if (gc && id !== T.SNOWGRASS) {
          if (!up) { for (let x = 0; x < 16; x++) { const d = 2 + (r() * 2.4 | 0); for (let y = 0; y < d; y++) px(g, y === d - 1 ? gc[0] : y === 0 ? gc[3] : gc[2], ox + x, oy + y); if (r() < 0.3) px(g, gc[1], ox + x, oy + d); } for (let x = 0; x < 16; x += 3 + (r() * 2 | 0)) px(g, gc[3], ox + x, oy + 1); }
          if (!lf) for (let y = 0; y < 12; y++) { const d = r() < 0.6 ? 2 : 1; px(g, gc[2], ox, oy + y, d, 1); if (d === 2) px(g, gc[0], ox + 1, oy + y); else px(g, gc[0], ox, oy + y); }
          if (!rt) for (let y = 0; y < 12; y++) { const d = r() < 0.6 ? 2 : 1; px(g, gc[2], ox + 16 - d, oy + y, d, 1); if (d === 2) px(g, gc[0], ox + 14, oy + y); else px(g, gc[0], ox + 15, oy + y); }
          if (!dn) for (let x = 0; x < 16; x++) { const d = 1 + (r() * 2 | 0); px(g, gc[1], ox + x, oy + 16 - d, 1, d); }
        } else if (id === T.SNOWGRASS) {
          if (!up) for (let x = 0; x < 16; x++) { const d = 2 + (r() * 3 | 0); px(g, gc[2], ox + x, oy, 1, d); px(g, gc[3], ox + x, oy, 1, 1); px(g, gc[0], ox + x, oy + d, 1, 1); }
        } else {
          if (!up) { px(g, 'rgba(255,255,255,0.18)', ox + 1, oy, 14, 1); px(g, 'rgba(0,0,0,0.08)', ox, oy + 1, 16, 1); }
          if (!dn) { px(g, 'rgba(0,0,0,0.32)', ox, oy + 15, 16, 1); px(g, 'rgba(0,0,0,0.14)', ox, oy + 14, 16, 1); }
          if (!lf) px(g, 'rgba(255,255,255,0.1)', ox, oy + 1, 1, 14);
          if (!rt) { px(g, 'rgba(0,0,0,0.26)', ox + 15, oy, 1, 16); px(g, 'rgba(0,0,0,0.1)', ox + 14, oy, 1, 16); }
        }
        if (id === T.SNOW || id === T.ICE) { if (!up) px(g, 'rgba(255,255,255,0.5)', ox + 1, oy, 14, 1); }
        const cut = (x, y) => { g.clearRect(ox + x, oy + y, 1, 1); };
        if (!up && !lf) { cut(0, 0); if (r() < 0.6) { cut(1, 0); cut(0, 1); } }
        if (!up && !rt) { cut(15, 0); if (r() < 0.6) { cut(14, 0); cut(15, 1); } }
        if (!dn && !lf) { cut(0, 15); if (r() < 0.6) { cut(1, 15); cut(0, 14); } }
        if (!dn && !rt) { cut(15, 15); if (r() < 0.6) { cut(14, 15); cut(15, 14); } }
        if (!up) for (let x = 2; x < 14; x++) if (r() < 0.12 && !gc) cut(x, 0);
        if (!dn) for (let x = 2; x < 14; x++) if (r() < 0.14) cut(x, 15);
        if (!lf) for (let y = 2; y < 14; y++) if (r() < 0.1) cut(0, y);
        if (!rt) for (let y = 2; y < 14; y++) if (r() < 0.1) cut(15, y);
        if (id === T.OBSIDIAN) { px(g, 'rgba(160,150,255,0.5)', ox + 3, oy + 3, 2, 1); px(g, 'rgba(160,150,255,0.35)', ox + 9, oy + 9, 1, 2); }
        if (id === T.ICE) { px(g, 'rgba(255,255,255,0.55)', ox + 3, oy + 3, 1, 3); px(g, 'rgba(255,255,255,0.45)', ox + 4, oy + 2, 1, 1); px(g, 'rgba(255,255,255,0.5)', ox + 10, oy + 9, 1, 3); }
      }
    }
    return cv;
  }
  function mkGlassStrip() {
    const cv = mkcv(256, 48), g = ctx2(cv);
    for (let v = 0; v < 3; v++) for (let m = 0; m < 16; m++) {
      const ox = m * 16, oy = v * 16;
      px(g, 'rgba(176,228,240,0.30)', ox, oy, 16, 16);
      px(g, 'rgba(230,250,255,0.75)', ox, oy, 16, 1); px(g, 'rgba(230,250,255,0.75)', ox, oy, 1, 16);
      px(g, 'rgba(120,180,200,0.7)', ox, oy + 15, 16, 1); px(g, 'rgba(120,180,200,0.7)', ox + 15, oy, 1, 16);
      px(g, 'rgba(255,255,255,0.8)', ox + 3, oy + 3, 2, 1); px(g, 'rgba(255,255,255,0.8)', ox + 3, oy + 3, 1, 3);
      px(g, 'rgba(255,255,255,0.5)', ox + 7, oy + 9, 1, 1); px(g, 'rgba(255,255,255,0.5)', ox + 9, oy + 7, 1, 1); px(g, 'rgba(255,255,255,0.5)', ox + 8, oy + 8, 1, 1);
    }
    return cv;
  }
  function mkPlatformStrip() {
    const cv = mkcv(256, 48), g = ctx2(cv);
    for (let v = 0; v < 3; v++) for (let m = 0; m < 16; m++) {
      const ox = m * 16, oy = v * 16;
      px(g, '#2c1c0e', ox, oy, 16, 1);
      px(g, '#b68d56', ox, oy + 1, 16, 1);
      px(g, '#8c6a3c', ox, oy + 2, 16, 1);
      px(g, '#624a2b', ox, oy + 3, 16, 1);
      px(g, '#2c1c0e', ox, oy + 4, 16, 1);
      const r = rngf(v * 99 + m);
      for (let i = 0; i < 3; i++) px(g, '#c6aa68', ox + (r() * 14 | 0), oy + 1, 1, 1);
      px(g, '#2c1c0e', ox + 7 + (m & 1), oy + 1, 1, 3);
    }
    return cv;
  }
  const treeCols = { bark: ['#2c1e12', '#4a3322', '#6b4a2c', '#8a6238'] };
  function mkTreeStrip() {
    const cv = mkcv(256, 48), g = ctx2(cv);
    for (let v = 0; v < 3; v++) for (let m = 0; m < 16; m++) {
      const ox = m * 16, oy = v * 16, r = rngf(v * 17 + m * 3 + 1);
      px(g, treeCols.bark[0], ox + 2, oy, 12, 16);
      px(g, treeCols.bark[2], ox + 3, oy, 10, 16);
      px(g, treeCols.bark[3], ox + 4, oy, 2, 16);
      px(g, treeCols.bark[1], ox + 10, oy, 3, 16);
      for (let i = 0; i < 7; i++) { const x = 3 + (r() * 9 | 0), y = r() * 14 | 0; px(g, r() < 0.5 ? treeCols.bark[1] : treeCols.bark[3], ox + x, oy + y, 1, 2); }
      px(g, treeCols.bark[1], ox + 7, oy, 1, 16);
    }
    return cv;
  }
  function mkCactusStrip() {
    const cv = mkcv(256, 48), g = ctx2(cv);
    for (let v = 0; v < 3; v++) for (let m = 0; m < 16; m++) {
      const ox = m * 16, oy = v * 16;
      px(g, '#14380f', ox + 3, oy, 10, 16);
      px(g, '#2c7a2a', ox + 4, oy, 8, 16);
      px(g, '#4eb040', ox + 5, oy, 2, 16);
      px(g, '#1e5a1c', ox + 9, oy, 2, 16);
      px(g, '#14380f', ox + 7, oy, 1, 16);
      for (let y = 1; y < 16; y += 4) { px(g, '#f0e8a0', ox + 4, oy + y, 1, 1); px(g, '#f0e8a0', ox + 11, oy + y + 2, 1, 1); }
    }
    return cv;
  }
  function objSprite(id, w, h) {
    const cv = mkcv(w * 16, h * 16), g = ctx2(cv);
    const W = w * 16, H = h * 16;
    if (id === T.WORKBENCH) {
      px(g, '#2c1c0e', 0, 4, W, 6); px(g, '#c6aa68', 1, 5, W - 2, 1); px(g, '#b68d56', 1, 6, W - 2, 2); px(g, '#8c6a3c', 1, 8, W - 2, 1);
      px(g, '#2c1c0e', 2, 10, 4, 6); px(g, '#755933', 3, 10, 2, 5); px(g, '#2c1c0e', W - 6, 10, 4, 6); px(g, '#755933', W - 5, 10, 2, 5);
      px(g, '#2c1c0e', 6, 11, W - 12, 3); px(g, '#624a2b', 6, 12, W - 12, 1);
      px(g, '#3a3a40', 5, 1, 7, 4); px(g, '#8c8c96', 6, 2, 5, 2); px(g, '#6a3a1a', 18, 2, 8, 2); px(g, '#c8c8d0', 23, 0, 3, 3);
    } else if (id === T.ANVIL) {
      px(g, '#2a2a30', 0, 1, 14, 3); px(g, '#8a8a94', 1, 2, 12, 1);
      px(g, '#2a2a30', 12, 1, 20, 6); px(g, '#a8a8b2', 13, 2, 17, 1); px(g, '#7a7a84', 13, 3, 17, 3);
      px(g, '#2a2a30', 10, 7, 12, 4); px(g, '#6a6a74', 11, 7, 10, 3);
      px(g, '#2a2a30', 6, 11, 20, 5); px(g, '#8a8a94', 7, 11, 18, 1); px(g, '#5a5a64', 7, 12, 18, 3);
    } else if (id === T.FURNACE) {
      px(g, '#202024', 2, 8, W - 4, H - 8); const tex = mkTex(PAL.stone, 3, 55, W - 6, H - 10); putTex(g, tex, 3, 9, W - 6, H - 10);
      px(g, '#202024', 3, 3, W - 6, 6); putTex(g, mkTex(PAL.stone, 3, 56, W - 8, 4), 4, 4, W - 8, 4);
      px(g, '#202024', W - 16, 0, 10, 5); px(g, '#6a6a70', W - 15, 1, 8, 3);
      px(g, '#18121a', 12, 12, W - 24, H - 16);
      px(g, '#6a1608', 14, 16, W - 28, H - 20); px(g, '#d83c10', 16, 19, W - 32, H - 23); px(g, '#ff9a20', 19, 22, W - 38, H - 27); px(g, '#ffe060', 23, 25, W - 46, 3);
      px(g, '#202024', 10, H - 4, W - 20, 3); for (let i = 0; i < 4; i++) px(g, '#202024', 16 + i * 6, 12, 2, H - 16);
      px(g, '#8a8a90', 4, 10, W - 8, 1);
    } else if (id === T.HELLFORGE) {
      px(g, '#1a0c0c', 2, 8, W - 4, H - 8); putTex(g, mkTex(PAL.hell, 2.4, 71, W - 6, H - 10), 3, 9, W - 6, H - 10);
      px(g, '#1a0c0c', 12, 10, W - 24, H - 14); px(g, '#ff5018', 14, 14, W - 28, H - 18); px(g, '#ffc030', 17, 18, W - 34, H - 22);
      px(g, '#1a0c0c', 3, 3, W - 6, 6); putTex(g, mkTex(PAL.hell, 2.4, 72, W - 8, 4), 4, 4, W - 8, 4);
    } else if (id === T.CHEST) {
      px(g, '#1c1208', 1, 2, W - 2, H - 3); px(g, '#8a5a20', 2, 3, W - 4, 11); px(g, '#c08a30', 2, 3, W - 4, 2); px(g, '#6a4216', 2, 12, W - 4, 2);
      px(g, '#a8741c', 2, 15, W - 4, 14); px(g, '#d0a040', 2, 16, W - 4, 1); px(g, '#6a4216', 2, 26, W - 4, 3);
      px(g, '#1c1208', 1, 14, W - 2, 3); px(g, '#7a8590', 2, 14, W - 4, 2);
      px(g, '#505860', 5, 3, 2, 26); px(g, '#8a95a0', 5, 3, 1, 26); px(g, '#505860', W - 7, 3, 2, 26); px(g, '#8a95a0', W - 7, 3, 1, 26);
      px(g, '#1c1208', 13, 12, 6, 8); px(g, '#f0d060', 14, 13, 4, 6); px(g, '#8a6a10', 15, 15, 2, 2);
      for (let i = 0; i < 6; i++) { px(g, '#d8a848', 8 + i * 3, 6 + (i % 2) * 3, 1, 1); px(g, '#d8a848', 8 + i * 3, 20 + (i % 2) * 3, 1, 1); }
    } else if (id === T.TABLE) {
      px(g, '#2c1c0e', 0, 8, W, 6); px(g, '#c6aa68', 1, 9, W - 2, 1); px(g, '#b68d56', 1, 10, W - 2, 2); px(g, '#8c6a3c', 1, 12, W - 2, 1);
      px(g, '#2c1c0e', 4, 14, 5, H - 14); px(g, '#755933', 5, 14, 3, H - 15); px(g, '#2c1c0e', W - 9, 14, 5, H - 14); px(g, '#755933', W - 8, 14, 3, H - 15);
      px(g, '#2c1c0e', 9, 15, W - 18, 3); px(g, '#624a2b', 9, 16, W - 18, 1);
    } else if (id === T.CHAIR) {
      px(g, '#2c1c0e', 2, 2, 5, 16); px(g, '#8c6a3c', 3, 2, 3, 15); px(g, '#c6aa68', 3, 2, 1, 15);
      px(g, '#2c1c0e', 2, 18, 12, 4); px(g, '#b68d56', 3, 19, 10, 1); px(g, '#8c6a3c', 3, 20, 10, 1);
      px(g, '#2c1c0e', 2, 22, 3, 10); px(g, '#755933', 3, 22, 1, 9); px(g, '#2c1c0e', 11, 22, 3, 10); px(g, '#755933', 12, 22, 1, 9);
      px(g, '#2c1c0e', 7, 6, 3, 2); px(g, '#2c1c0e', 7, 11, 3, 2);
    } else if (id === T.DOORC) {
      px(g, '#2c1c0e', 2, 0, 12, H); px(g, '#8a5a2c', 3, 1, 10, H - 2); px(g, '#b88444', 3, 1, 2, H - 2); px(g, '#6a4216', 11, 1, 2, H - 2);
      for (let k = 0; k < 3; k++) { px(g, '#2c1c0e', 5, 4 + k * 16, 6, 10); px(g, '#6a4216', 6, 5 + k * 16, 4, 8); px(g, '#a87238', 6, 5 + k * 16, 4, 1); }
      px(g, '#2c1c0e', 9, 22, 3, 3); px(g, '#f0d060', 10, 23, 1, 1);
      px(g, '#505860', 3, 3, 2, 3); px(g, '#505860', 3, 40, 2, 3);
    } else if (id === T.DOORO) {
      px(g, '#2c1c0e', 12, 0, 4, H); px(g, '#8a5a2c', 13, 1, 2, H - 2); px(g, '#b88444', 13, 1, 1, H - 2);
      px(g, '#505860', 12, 3, 3, 3); px(g, '#505860', 12, 40, 3, 3);
    } else if (id === T.CRYSTAL) {
      px(g, '#3a0818', 8, 1, 6, 2); px(g, '#3a0818', 18, 1, 6, 2);
      const pts = ['  XXXX  XXXX  ', ' XXXXXXXXXXXX ', 'XXXXXXXXXXXXXX', 'XXXXXXXXXXXXXX', 'XXXXXXXXXXXXXX', ' XXXXXXXXXXXX ', '  XXXXXXXXXX  ', '   XXXXXXXX   ', '    XXXXXX    ', '     XXXX     ', '      XX      '];
      pts.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'X') { const c = (x + y) % 5 === 0 ? '#ff8aa8' : x < 6 && y < 4 ? '#ff6a90' : y > 6 ? '#b01848' : '#e03068'; px(g, c, 9 + x, 3 + y); } });
      pts.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === 'X') { const e = (x === 0 || row[x - 1] === ' ' || x === row.length - 1 || row[x + 1] === ' ' || y === 0 || y === pts.length - 1 || pts[y - 1][x] === ' ' || (pts[y + 1] && pts[y + 1][x] === ' ')); if (e) px(g, '#5a0a24', 9 + x, 3 + y); } });
      px(g, '#ffd0e0', 12, 6, 2, 2);
    } else if (id === T.ALTAR) {
      px(g, '#14081c', 0, 12, W, 20); putTex(g, mkTex(PAL.ebon, 3, 91, W - 2, 17), 1, 14, W - 2, 17);
      px(g, '#14081c', 3, 6, W - 6, 8); putTex(g, mkTex(PAL.ebon, 2.6, 92, W - 8, 6), 4, 7, W - 8, 6);
      px(g, '#14081c', 8, 2, W - 16, 5); putTex(g, mkTex(PAL.ebon, 2.6, 93, W - 18, 3), 9, 3, W - 18, 3);
      px(g, '#c040ff', 12, 20, 4, 4); px(g, '#c040ff', 22, 18, 4, 6); px(g, '#c040ff', 32, 20, 4, 4); px(g, '#ff90ff', 13, 21, 2, 2); px(g, '#ff90ff', 23, 19, 2, 2); px(g, '#ff90ff', 33, 21, 2, 2);
      px(g, '#8a30c0', 16, 27, 16, 1);
    } else if (id === T.ORB) {
      const cx = 16, cy = 16;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot(x - cx + 0.5, y - cy + 0.5); if (d <= 13) { const t = d / 13; let c = t > 0.88 ? '#2a0c48' : t > 0.65 ? '#5a22a0' : t > 0.35 ? '#8a44d8' : '#b070f0'; px(g, c, x, y); } }
      px(g, '#e0b8ff', 9, 7, 5, 3); px(g, '#f4e0ff', 10, 8, 2, 1); px(g, '#4a1a80', 20, 20, 5, 3);
      for (let a = 0; a < 6; a++) { const ang = a * 1.047 + 0.3; px(g, '#c080ff', cx + Math.round(Math.cos(ang) * 9), cy + Math.round(Math.sin(ang) * 9), 1, 1); }
    } else if (id === T.LANTERN) {
      px(g, '#2a2a30', 7, 0, 2, 3); px(g, '#2a2a30', 4, 3, 8, 2); px(g, '#e8b040', 5, 5, 6, 8); px(g, '#fff0b0', 6, 6, 4, 5); px(g, '#2a2a30', 4, 5, 1, 8); px(g, '#2a2a30', 11, 5, 1, 8); px(g, '#2a2a30', 4, 13, 8, 2);
    } else if (id === T.BED) {
      px(g, '#2c1c0e', 0, 8, W, 16); px(g, '#c03a3a', 8, 9, W - 10, 8); px(g, '#e06a6a', 8, 9, W - 10, 2); px(g, '#f0f0f0', 2, 9, 7, 6); px(g, '#8c6a3c', 1, 17, W - 2, 5); px(g, '#2c1c0e', 0, 22, 4, 10); px(g, '#2c1c0e', W - 4, 22, 4, 10);
    } else if (id === T.SIGN) {
      px(g, '#2c1c0e', 2, 2, 28, 18); px(g, '#b68d56', 3, 3, 26, 16); px(g, '#8c6a3c', 3, 17, 26, 2); px(g, '#2c1c0e', 14, 20, 4, 12); px(g, '#755933', 15, 20, 2, 11); px(g, '#3a2a18', 6, 7, 18, 1); px(g, '#3a2a18', 6, 11, 14, 1);
    } else if (id === T.BOOKCASE) {
      px(g, '#2c1c0e', 0, 0, W, H); px(g, '#8a5a2c', 2, 2, W - 4, H - 4);
      for (let r = 0; r < 3; r++) { px(g, '#2a1a0c', 3, 4 + r * 20, W - 6, 14); const cols = ['#c04040', '#4060c0', '#40a050', '#c0a030', '#8040a0']; for (let b = 0; b < 8; b++) px(g, cols[(b + r * 2) % 5], 4 + b * 5, 5 + r * 20 + (b % 3 === 0 ? 1 : 0), 4, 12); px(g, '#8a5a2c', 3, 18 + r * 20, W - 6, 2); }
    }
    return cv;
  }
  const decorCache = new Map();
  function objCanvas(id) { let c = decorCache.get('o' + id); if (!c) { const d = TD[id]; c = objSprite(id, d.ob[0], d.ob[1]); decorCache.set('o' + id, c); } return c; }
  function mkSmallTile(id, v) {
    const cv = mkcv(16, 16), g = ctx2(cv), r = rngf(id * 313 + v * 17 + 3);
    if (id === T.TGRASS) {
      const cols = ['#1c5c1a', '#2c8c28', '#4cc03c'];
      const n = 5 + v;
      for (let i = 0; i < n; i++) { const x = 1 + (r() * 13 | 0), hgt = 4 + (r() * 7 | 0), lean = r() < 0.5 ? -1 : 1, c = cols[r() * 3 | 0]; for (let y = 0; y < hgt; y++) px(g, c, x + (y > hgt * 0.6 ? lean : 0), 15 - y); }
    } else if (id === T.FLOWER) {
      const fc = [['#f0e050', '#f8f8b0'], ['#e04050', '#ff9090'], ['#f0f0f0', '#ffffff'], ['#e070e0', '#ffb0ff']][v % 4];
      px(g, '#1c5c1a', 7, 8, 2, 8); px(g, '#2c8c28', 7, 8, 1, 8); px(g, '#2c8c28', 5, 12, 2, 1); px(g, '#2c8c28', 9, 10, 2, 1);
      px(g, fc[0], 5, 4, 6, 5); px(g, fc[1], 6, 5, 2, 2); px(g, '#e0a020', 7, 6, 2, 2); px(g, '#2c1c0e', 4, 5, 1, 3); px(g, '#2c1c0e', 11, 5, 1, 3);
    } else if (id === T.MUSH) {
      px(g, '#2c1c0e', 4, 8, 8, 5); px(g, '#c8a07a', 5, 8, 6, 3); px(g, '#e8c8a0', 5, 8, 3, 1); px(g, '#8a6a4a', 5, 11, 6, 1); px(g, '#e8d8b8', 7, 12, 2, 4); px(g, '#a08060', 8, 12, 1, 4);
    } else if (id === T.GMUSH) {
      px(g, '#0a1450', 3, 6, 10, 6); px(g, '#2c58e0', 4, 6, 8, 4); px(g, '#80b0ff', 4, 6, 3, 1); px(g, '#4a84ff', 5, 10, 6, 1); px(g, '#a0c8ff', 7, 11, 2, 5); px(g, '#d0e8ff', 6, 8, 1, 1); px(g, '#d0e8ff', 10, 7, 1, 1);
    } else if (id === T.SAPLING) {
      px(g, '#4a3322', 7, 9, 2, 7); px(g, '#2c8c28', 4, 5, 8, 5); px(g, '#4cc03c', 5, 5, 3, 2); px(g, '#1c5c1a', 9, 8, 3, 2); px(g, '#2c8c28', 6, 2, 4, 4); px(g, '#4cc03c', 7, 2, 2, 2);
    } else if (id === T.TORCH) {
      px(g, '#2c1c0e', 6, 6, 4, 10); px(g, '#8a5a2c', 7, 7, 2, 9); px(g, '#c08a40', 7, 7, 1, 9); px(g, '#2c1c0e', 6, 4, 4, 3); px(g, '#d88a30', 7, 5, 2, 1);
    } else if (id === T.ROPE) {
      px(g, '#2c1c0e', 6, 0, 4, 16); px(g, '#a07848', 7, 0, 2, 16); px(g, '#d0a868', 7, 0, 1, 16); for (let y = 1; y < 16; y += 4) px(g, '#6a4a28', 7, y, 2, 1);
    } else if (id === T.VINE) {
      px(g, '#1c5c1a', 7, 0, 2, 12 + (v * 2)); px(g, '#2c8c28', 7, 0, 1, 12 + v * 2); px(g, '#4cc03c', 5, 4 + v, 2, 2); px(g, '#4cc03c', 9, 8, 2, 2);
    } else if (id === T.CTHORN) {
      px(g, '#2a1840', 3, 10, 10, 6); px(g, '#503070', 4, 8, 3, 8); px(g, '#8a5ac0', 5, 6, 2, 6); px(g, '#503070', 9, 6, 3, 10); px(g, '#8a5ac0', 10, 3, 2, 8); px(g, '#c0a0f0', 10, 3, 1, 2); px(g, '#c0a0f0', 5, 6, 1, 2);
    } else if (id === T.MUSHTREE) {
      px(g, '#0a1450', 6, 0, 4, 16); px(g, '#3a60e0', 7, 0, 2, 16); px(g, '#90b8ff', 7, 0, 1, 16);
    }
    return cv;
  }
  const smallTiles = new Map();
  const smallTile = (id, v) => { const k = id * 4 + v; let c = smallTiles.get(k); if (!c) { c = mkSmallTile(id, v); smallTiles.set(k, c); } return c; };
  function mkWallStrip(id) {
    const cv = mkcv(256, 32), g = ctx2(cv);
    const base = id === WL.WOOD ? 'wood' : id === WL.DIRT || id === WL.DIRTP ? 'dirt' : id === WL.STONE || id === WL.STONEP ? 'stone' : id === WL.SAND ? 'sandstone' : id === WL.ICE || id === WL.SNOWP ? 'ice' : id === WL.EBON ? 'ebon' : id === WL.HELL ? 'ash' : id === WL.MUSH ? 'mud' : id === WL.CLAYW ? 'clay' : id === WL.BRICKP ? 'brick' : id === WL.GLASSP ? 'ice' : 'stone';
    for (let v = 0; v < 2; v++) {
      const tex = (id === WL.WOOD || id === WL.BRICKP) ? texFor(id === WL.WOOD ? T.WOOD : T.GRAYBRICK, v) : mkTex(PAL[base], 3, id * 41 + v * 7 + 2);
      for (let m = 0; m < 16; m++) {
        const ox = m * 16, oy = v * 16;
        putTex(g, tex, ox, oy);
        px(g, 'rgba(0,0,0,0.46)', ox, oy, 16, 16);
        if (id === WL.GLASSP) px(g, 'rgba(160,220,240,0.35)', ox, oy, 16, 16);
        if (!(m & 1)) px(g, 'rgba(0,0,0,0.3)', ox, oy + 1, 16, 1);
        if (!(m & 4)) px(g, 'rgba(0,0,0,0.3)', ox + 1, oy, 1, 16);
        if (!(m & 2)) px(g, 'rgba(255,255,255,0.05)', ox, oy + 15, 16, 1);
        if (!(m & 8)) px(g, 'rgba(255,255,255,0.05)', ox + 15, oy, 1, 16);
      }
    }
    return cv;
  }
  const wallStrips = new Map();
  const wallStrip = id => { let s = wallStrips.get(id); if (!s) { s = mkWallStrip(id); wallStrips.set(id, s); } return s; };
  const VOIDC = ['#241a14', '#2a1e18', '#1c1410'];
  const voidStrip = (() => { const cv = mkcv(48, 16), g = ctx2(cv); for (let v = 0; v < 3; v++) putTex(g, mkTex(['#1a130f', '#211812', '#281d16', '#2e2119'], 2.6, 500 + v), v * 16, 0); return cv; })();
  const voidCol = depthF => depthF < 0.5 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)';
  function tileStrip(id) {
    let s = tileStrips.get(id);
    if (s) return s;
    if (id === T.GLASS) s = mkGlassStrip();
    else if (id === T.PLATFORM) s = mkPlatformStrip();
    else if (id === T.TREE) s = mkTreeStrip();
    else if (id === T.CACTUS) s = mkCactusStrip();
    else s = mkTerrainStrip(id);
    tileStrips.set(id, s);
    return s;
  }
  const CANOPY = {};
  function mkCanopy(kind) {
    const rngc = rngf(kind === 'forest' ? 11 : kind === 'snow' ? 12 : kind === 'corrupt' ? 13 : kind === 'mush' ? 14 : 15);
    const W = 96, H = 96, cv = mkcv(W, H), g = ctx2(cv);
    if (kind === 'forest') {
      const dk = '#103a10', md = '#1e6a1c', lt = '#30a028', hl = '#5ad040';
      const blobs = [];
      for (let i = 0; i < 26; i++) { const a = rngc() * 6.283, d = rngc() * 26; blobs.push([48 + Math.cos(a) * d * 1.05, 40 + Math.sin(a) * d * 0.8 - 4, 7 + rngc() * 8]); }
      blobs.push([48, 46, 22]);
      const paint = (c, off) => blobs.forEach(([x, y, r]) => { g.fillStyle = c; for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy)); g.fillRect(Math.round(x - w + off[0]), Math.round(y + yy + off[1]), w * 2, 1); } });
      paint(dk, [0, 2]); paint(dk, [-1, 0]); paint(dk, [1, 0]); paint(md, [0, 1]); paint(md, [0, 0]);
      blobs.forEach(([x, y, r]) => { g.fillStyle = lt; for (let yy = -r + 1; yy <= 0; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy) * 0.7); g.fillRect(Math.round(x - w - 1), Math.round(y + yy - 1), w * 2, 1); } });
      blobs.forEach(([x, y, r], i) => { if (i % 2) { g.fillStyle = hl; g.fillRect(Math.round(x - r * 0.4), Math.round(y - r * 0.6), Math.max(1, Math.round(r * 0.5)), 1); g.fillRect(Math.round(x - r * 0.5), Math.round(y - r * 0.5), 1, 2); } });
      for (let i = 0; i < 40; i++) { g.fillStyle = rngc() < 0.5 ? dk : md; g.fillRect(14 + (rngc() * 68 | 0), 20 + (rngc() * 44 | 0), 2, 1); }
    } else if (kind === 'snow') {
      const rows = [[48, 2, 4], [48, 8, 10], [48, 16, 16], [48, 24, 22], [48, 34, 28], [48, 46, 34], [48, 58, 38], [48, 68, 42]];
      rows.forEach(([cx, y, hw], i) => { g.fillStyle = '#0c3a24'; g.fillRect(cx - hw, y, hw * 2, 12); g.fillStyle = '#16603a'; g.fillRect(cx - hw + 2, y + 1, hw * 2 - 4, 9); g.fillStyle = '#2a8a50'; g.fillRect(cx - hw + 3, y + 1, hw - 4, 3); g.fillStyle = '#e8f2ff'; for (let x = cx - hw + 2; x < cx + hw - 2; x += 3 + (rngc() * 3 | 0)) g.fillRect(x, y + (rngc() * 3 | 0), 2 + (rngc() * 3 | 0), 2); g.fillStyle = '#c0d4ee'; g.fillRect(cx - hw + 1, y + 10, hw * 2 - 2, 1); });
    } else if (kind === 'corrupt') {
      const dk = '#1c0e30', md = '#3c2262', lt = '#6a44a0', hl = '#a888d8';
      const branch = (x, y, a, len, th) => { for (let i = 0; i < len; i++) { x += Math.cos(a) + (rngc() - 0.5) * 0.6; y += Math.sin(a) + (rngc() - 0.5) * 0.4; g.fillStyle = dk; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, th + 2, th + 2); } };
      const branch2 = (x, y, a, len, th) => { for (let i = 0; i < len; i++) { x += Math.cos(a) + (rngc() - 0.5) * 0.6; y += Math.sin(a) + (rngc() - 0.5) * 0.4; g.fillStyle = md; g.fillRect(Math.round(x), Math.round(y), th, th); if (i % 5 === 0) { g.fillStyle = lt; g.fillRect(Math.round(x), Math.round(y), 1, 1); } } };
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.34 + (rngc() - 0.5) * 0.2; const sx = 48, sy = 90; const seed = rngc(); const save = rngc; branch(sx, sy, a, 40 + (k % 3) * 10, 3); branch2(sx, sy, a, 40 + (k % 3) * 10, 2); }
      for (let k = 0; k < 14; k++) { const x = 20 + (rngc() * 56 | 0), y = 8 + (rngc() * 50 | 0); g.fillStyle = hl; g.fillRect(x, y, 1, 2); }
    } else if (kind === 'mush') {
      g.fillStyle = '#0a1450'; g.beginPath(); g.ellipse(48, 40, 40, 30, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#2c58e0'; g.beginPath(); g.ellipse(48, 40, 37, 27, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#6aa0ff'; g.beginPath(); g.ellipse(40, 28, 20, 10, 0, Math.PI, 0); g.fill();
      for (let i = 0; i < 14; i++) { g.fillStyle = '#b8d8ff'; g.fillRect(14 + (rngc() * 68 | 0), 18 + (rngc() * 20 | 0), 3, 2); }
      g.fillStyle = '#0a1450'; g.fillRect(8, 40, 80, 3);
    } else {
      g.fillStyle = '#1e5a1c'; g.fillRect(36, 20, 24, 24); g.fillStyle = '#3cb43c'; g.fillRect(38, 22, 20, 8);
    }
    return cv;
  }
  const canopyFor = kind => CANOPY[kind] || (CANOPY[kind] = mkCanopy(kind));
  const leafBranch = {};
  function mkLeafBranch(kind, side) {
    const cv = mkcv(32, 24), g = ctx2(cv), r = rngf(side * 7 + kind.length);
    const dk = kind === 'corrupt' ? '#1c0e30' : '#103a10', md = kind === 'corrupt' ? '#3c2262' : '#1e6a1c', lt = kind === 'corrupt' ? '#6a44a0' : '#30a028';
    g.fillStyle = treeCols.bark[0]; g.fillRect(side > 0 ? 0 : 20, 10, 12, 4); g.fillStyle = treeCols.bark[2]; g.fillRect(side > 0 ? 0 : 20, 11, 12, 2);
    if (kind !== 'corrupt') { const cx = side > 0 ? 18 : 14; for (let i = 0; i < 6; i++) { const x = cx + (r() * 12 - 6) | 0, y = 8 + (r() * 6 - 3) | 0, rr = 3 + (r() * 3 | 0); g.fillStyle = dk; g.fillRect(x - rr - 1, y - 1, rr * 2 + 2, rr * 2 + 2); } for (let i = 0; i < 6; i++) { const x = cx + (r() * 10 - 5) | 0, y = 8 + (r() * 5 - 2) | 0, rr = 2 + (r() * 3 | 0); g.fillStyle = md; g.fillRect(x - rr, y, rr * 2, rr * 2); g.fillStyle = lt; g.fillRect(x - rr + 1, y, rr, 1); } }
    return cv;
  }
  const leafBr = (kind, side) => { const k = kind + side; return leafBranch[k] || (leafBranch[k] = mkLeafBranch(kind, side)); };
  const rootSprite = (() => { const cv = mkcv(48, 16), g = ctx2(cv); g.fillStyle = treeCols.bark[0]; g.fillRect(0, 10, 48, 6); g.fillRect(2, 6, 12, 6); g.fillRect(34, 6, 12, 6); g.fillStyle = treeCols.bark[2]; g.fillRect(1, 11, 14, 5); g.fillRect(33, 11, 14, 5); g.fillRect(3, 7, 10, 4); g.fillRect(35, 7, 10, 4); g.fillStyle = treeCols.bark[3]; g.fillRect(3, 8, 4, 1); g.fillRect(2, 12, 6, 1); g.fillStyle = treeCols.bark[1]; g.fillRect(14, 10, 4, 6); g.fillRect(30, 10, 4, 6); return cv; })();
  const cactusArm = (() => { const cv = mkcv(32, 16), g = ctx2(cv); g.fillStyle = '#14380f'; g.fillRect(0, 5, 14, 7); g.fillRect(0, 0, 6, 12); g.fillStyle = '#2c7a2a'; g.fillRect(1, 6, 12, 5); g.fillRect(1, 1, 4, 10); g.fillStyle = '#4eb040'; g.fillRect(2, 2, 1, 8); return cv; })();
  const MP = {
    copper: ['#6b2e0e', '#cd8647', '#f5c08a'], iron: ['#4a423e', '#a0958c', '#e0d6cb'], silver: ['#56646a', '#c0cacc', '#f4ffff'], gold: ['#7c5c0c', '#e0be3c', '#fff4a8'],
    demonite: ['#271c52', '#6a50b8', '#b8a0f0'], hellstone: ['#6e160c', '#e2501c', '#ffc060'], wood: ['#4e3418', '#a8814b', '#dcbc82'], mining: ['#5a4a2a', '#c8a040', '#f8e080'],
    stone: ['#44444a', '#808085', '#b4b4ba']
  };
  MP.shadow = MP.demonite; MP.molten = MP.hellstone;
  const HP = ['#2c1a0a', '#6e4a2a', '#a37a48'];
  const segP = (x0, y0, x1, y1, r0, r1 = r0) => (x, y) => {
    const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
    let t = l2 ? ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(x + 0.5 - (x0 + dx * t), y + 0.5 - (y0 + dy * t)) <= r0 + (r1 - r0) * t;
  };
  const polyP = pts => (x, y) => {
    let c = false;
    const X = x + 0.5, Y = y + 0.5;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > Y) !== (yj > Y) && X < (xj - xi) * (Y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const orP = (...ps) => (x, y) => { for (let i = 0; i < ps.length; i++) if (ps[i](x, y)) return true; return false; };
  const ellP = (cx, cy, rx, ry) => (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
  const rectP = (x0, y0, x1, y1) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;
  const arcP = (p0, p1, p2, r0, r1, n = 12) => {
    const ps = [];
    let px0 = p0[0], py0 = p0[1];
    for (let i = 1; i <= n; i++) {
      const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      const x = a * p0[0] + b * p1[0] + c * p2[0], y = a * p0[1] + b * p1[1] + c * p2[1];
      const k = Math.sin(t * Math.PI);
      ps.push(segP(px0, py0, x, y, r0 + (r1 - r0) * k, r0 + (r1 - r0) * k));
      px0 = x; py0 = y;
    }
    return orP(...ps);
  };
  const rotRectP = (cx, cy, len, th, ang) => {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    return (x, y) => { const dx = x + 0.5 - cx, dy = y + 0.5 - cy; const u = dx * ca + dy * sa, v = -dx * sa + dy * ca; return Math.abs(u) <= len / 2 && Math.abs(v) <= th / 2; };
  };
  const mapP = (rows, ox, oy, k = 1) => (x, y) => { const rx = Math.floor((x - ox) / k), ry = Math.floor((y - oy) / k); return ry >= 0 && ry < rows.length && rx >= 0 && rx < rows[ry].length && rows[ry][rx] !== ' ' && rows[ry][rx] !== '.'; };
  const paintP = (g, pred, pal, N = 24) => {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!pred(x, y)) continue;
      const L = !pred(x - 1, y) || !pred(x, y - 1), D = !pred(x + 1, y) || !pred(x, y + 1);
      g.fillStyle = L && !D ? pal[2] : D && !L ? pal[0] : pal[1];
      g.fillRect(x, y, 1, 1);
    }
  };
  const outlineCv = (cv, col = [10, 6, 14], a = 235) => {
    if (typeof cv.width !== 'number') return cv;
    const w = cv.width, h = cv.height, out = mkcv(w + 2, h + 2), g = ctx2(out);
    const src = ctx2(cv).getImageData(0, 0, w, h).data;
    const dst = g.createImageData(w + 2, h + 2), d = dst.data;
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 60;
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      if (op(x, y)) continue;
      if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) { const i = ((y + 1) * (w + 2) + x + 1) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = a; }
    }
    g.putImageData(dst, 0, 0);
    g.drawImage(cv, 1, 1);
    return out;
  };
  const GPAL = c => [shade(c, -0.55), c, shade(c, 0.6)];
  const ORETILE = { copper: T.COPPER, iron: T.IRON, silver: T.SILVER, gold: T.GOLD, demonite: T.DEMONITE, hellstone: T.HELLSTONE };
  const COINP = { cu: ['#6a300c', '#c87a38', '#f4b878'], ag: ['#5a646c', '#c0c8d0', '#ffffff'], au: ['#7c5c0c', '#e8c020', '#fff290'], pt: ['#2e5e7e', '#9ce0ff', '#ffffff'] };
  const HEART = [' xx  xx ', 'xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', ' xxxxxx ', '  xxxx  ', '   xx   '];
  const STAR = ['    x    ', '   xxx   ', '   xxx   ', 'xxxxxxxxx', ' xxxxxxx ', '  xxxxx  ', ' xxxxxxx ', ' xxx xxx ', ' xx   xx '];
  const ICONDRAW = {
    pick(g, m) { paintP(g, segP(3, 21, 18, 6, 1.2), HP); paintP(g, arcP([4, 8], [19, 1], [22, 17], 0.9, 1.9), MP[m]); },
    axe(g, m) { paintP(g, segP(3, 21, 17, 7, 1.2), HP); paintP(g, polyP([[11, 3], [20, 1], [23, 9], [18, 14], [15, 9], [12, 8]]), MP[m]); },
    hammer(g, m) { paintP(g, segP(3, 21, 16, 8, 1.2), HP); paintP(g, rotRectP(16, 8, 13, 7, Math.PI / 4), MP[m]); },
    sword(g, m, big) {
      const L = big ? 1.2 : 1;
      paintP(g, segP(7, 17, 22, 2, 2.1 * L, 0.7), MP[m]);
      paintP(g, rotRectP(6, 18, 9, 2.4, Math.PI / 4), m === 'wood' ? HP : MP.gold);
      paintP(g, segP(4, 20, 6, 18, 1.2), HP);
    },
    short(g, m) {
      paintP(g, segP(9, 15, 19, 5, 1.7, 0.6), MP[m]);
      paintP(g, rotRectP(8, 16, 7, 2.2, Math.PI / 4), MP.gold);
      paintP(g, segP(4, 20, 7, 17, 1.2), HP);
    },
    bow(g, m) {
      paintP(g, arcP([9, 2], [22, 12], [9, 22], 1, 1.6), MP[m]);
      paintP(g, segP(9, 2, 9, 22, 0.5), ['#aaaaaa', '#e8e8e8', '#ffffff']);
    },
    arrow(g, t) {
      const head = t === 'fire' ? MP.hellstone : t === 'unholy' ? MP.demonite : MP.iron;
      paintP(g, segP(4, 20, 17, 7, 0.7), HP);
      paintP(g, polyP([[16, 3], [22, 2], [21, 8], [18, 7]]), head);
      paintP(g, polyP([[3, 17], [5, 15], [7, 21], [5, 22]]), ['#aaaaaa', '#eeeeee', '#ffffff']);
      if (t === 'fire') { paintP(g, ellP(20, 4, 2.4, 3), ['#ff6020', '#ffb030', '#fff0a0']); }
    },
    staff(g, m) {
      paintP(g, segP(3, 21, 17, 7, 1.1), HP);
      const gem = m === 'spark' ? '#ffd040' : m === 'thorn' ? '#8a40d0' : GEMC[GEMS.indexOf(m)] || '#b64cf0';
      paintP(g, polyP([[19, 1], [22, 4], [19, 8], [16, 4]]), GPAL(gem));
      paintP(g, segP(15, 8, 15, 4, 0.8), MP.gold);
      paintP(g, segP(18, 9, 22, 7, 0.8), MP.gold);
    },
    helm(g, m) {
      const P = MP[m];
      paintP(g, orP(ellP(12, 12, 8, 8.5), rectP(4, 12, 20, 19)), P);
      g.fillStyle = '#10080c'; g.fillRect(8, 13, 8, 4);
      g.fillStyle = P[2]; g.fillRect(11, 5, 2, 3);
      if (m === 'mining') { g.fillStyle = '#fff6a0'; g.fillRect(10, 4, 4, 3); }
      if (m === 'wood') { g.fillStyle = HP[1]; g.fillRect(8, 6, 8, 1); }
    },
    chest(g, m) {
      const P = MP[m];
      paintP(g, polyP([[4, 4], [9, 4], [10, 7], [14, 7], [15, 4], [20, 4], [22, 10], [19, 12], [19, 21], [5, 21], [5, 12], [2, 10]]), P);
      g.fillStyle = P[0]; g.fillRect(10, 8, 4, 12);
      g.fillStyle = P[2]; g.fillRect(7, 8, 1, 5); g.fillRect(16, 8, 1, 5);
    },
    legs(g, m) {
      const P = MP[m];
      paintP(g, polyP([[5, 3], [19, 3], [20, 12], [14, 12], [12, 8], [10, 12], [4, 12]]), P);
      paintP(g, polyP([[4, 12], [10, 12], [10, 21], [3, 21]]), P);
      paintP(g, polyP([[14, 12], [20, 12], [21, 21], [14, 21]]), P);
      g.fillStyle = P[0]; g.fillRect(5, 4, 14, 1);
    },
    ore(g, m) {
      paintP(g, orP(ellP(12, 14, 8.5, 6.5), ellP(8, 11, 5, 4.5), ellP(16, 11, 5, 5)), MP.stone);
      const o = MP[m];
      [[8, 10], [15, 11], [11, 15], [17, 15], [6, 14], [12, 9]].forEach(([x, y]) => paintP(g, ellP(x, y, 2, 1.8), o));
    },
    gem(g, m) {
      const c = GEMC[GEMS.indexOf(m)];
      paintP(g, polyP([[12, 3], [19, 8], [17, 18], [12, 21], [7, 18], [5, 8]]), GPAL(c));
      g.fillStyle = shade(c, 0.85); g.fillRect(9, 8, 2, 2); g.fillRect(8, 10, 1, 1);
      g.fillStyle = shade(c, -0.4); g.fillRect(13, 14, 3, 1); g.fillRect(12, 17, 2, 1);
    },
    bar(g, m) {
      const P = MP[m];
      paintP(g, polyP([[7, 8], [20, 8], [23, 13], [4, 13]]), [P[1], P[2], '#ffffff']);
      paintP(g, rectP(4, 13, 23, 18), P);
      g.fillStyle = P[0]; g.fillRect(5, 17, 18, 1);
      g.fillStyle = '#ffffff'; g.fillRect(9, 9, 5, 1);
    },
    coin(g, m) { paintP(g, ellP(12, 12, 6.5, 6.5), COINP[m]); g.fillStyle = COINP[m][0]; g.fillRect(11, 8, 2, 8); g.fillStyle = COINP[m][2]; g.fillRect(8, 8, 1, 2); },
    potion(g, m) {
      const c = m === 'blue' ? '#3a70f0' : '#e03040';
      paintP(g, orP(ellP(12, 15, 6.5, 6.5), rectP(10, 4, 14, 9)), GPAL(c));
      g.fillStyle = '#6e4a2a'; g.fillRect(9, 2, 6, 3); g.fillStyle = '#a37a48'; g.fillRect(9, 2, 6, 1);
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(8, 13, 2, 4);
      if (m === 'redbig') { g.fillStyle = 'rgba(255,200,200,0.9)'; g.fillRect(14, 17, 2, 2); }
    },
    heart(g) { paintP(g, mapP(HEART, 3, 4, 2), ['#7a0820', '#e0203c', '#ff8a98']); },
    manastar(g) { paintP(g, mapP(STAR, 3, 3, 2), ['#1a3aa0', '#4a80ff', '#b0d0ff']); },
    star(g) { paintP(g, mapP(STAR, 3, 3, 2), ['#a88010', '#ffe040', '#fffcc0']); },
    gel(g) { paintP(g, orP(ellP(12, 15, 8, 6), ellP(12, 11, 5, 5)), ['#1a5ad0', '#4aa0ff', '#b8dcff']); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(9, 10, 3, 2); },
    lens(g) { paintP(g, ellP(12, 12, 7, 7), ['#a0a0b0', '#e8e8f4', '#ffffff']); paintP(g, ellP(12, 12, 4, 4), ['#1a3aa0', '#3a70e0', '#a0c8ff']); g.fillStyle = '#000'; g.fillRect(11, 11, 2, 2); },
    rotten(g) { paintP(g, orP(ellP(12, 13, 8, 6), ellP(9, 10, 4, 4)), ['#3a2a52', '#6a5a82', '#a090c0']); g.fillStyle = '#2a1a40'; g.fillRect(11, 12, 3, 2); g.fillRect(8, 9, 2, 2); },
    scale(g) { paintP(g, polyP([[12, 3], [20, 9], [17, 20], [7, 20], [4, 9]]), ['#2a1a4a', '#6a3aa8', '#b88af0']); g.fillStyle = '#d8b8ff'; g.fillRect(10, 8, 2, 6); },
    mushroom(g) { paintP(g, ellP(12, 11, 8, 6), ['#7a5a3a', '#c8a07a', '#f0d8b0']); paintP(g, rectP(10, 14, 14, 21), ['#a0805a', '#e8d8b8', '#ffffff']); },
    glowmush(g) { paintP(g, ellP(12, 11, 8, 6), ['#102a98', '#3a6aff', '#a8ccff']); paintP(g, rectP(10, 14, 14, 21), ['#4a70c0', '#a0c8ff', '#ffffff']); },
    cactus(g) { paintP(g, rectP(9, 3, 15, 21), ['#14380f', '#2c7a2a', '#6ad058']); paintP(g, rectP(4, 9, 9, 13), ['#14380f', '#2c7a2a', '#6ad058']); paintP(g, rectP(4, 6, 7, 13), ['#14380f', '#2c7a2a', '#6ad058']); },
    torch(g) {
      paintP(g, rectP(10, 9, 14, 22), HP);
      paintP(g, orP(ellP(12, 6, 3.2, 4.8), ellP(12, 8, 2, 3)), ['#d02800', '#ff9020', '#fff2a0']);
    },
    rope(g) { for (let i = 0; i < 4; i++) paintP(g, ellP(12, 5 + i * 5, 5, 2.8), ['#5a3c1c', '#c0985c', '#e8d098']); },
    acorn(g) { paintP(g, ellP(12, 14, 6, 7), ['#5a3a1a', '#a87848', '#d8b078']); paintP(g, ellP(12, 9, 7, 3.6), ['#3a2410', '#7a5030', '#b08050']); g.fillStyle = '#5a3a1a'; g.fillRect(11, 4, 2, 3); },
    cloud(g) { paintP(g, orP(ellP(12, 17, 6, 5), rectP(10, 4, 14, 9)), ['#8aa0b8', '#d8ecff', '#ffffff']); g.fillStyle = '#7a5030'; g.fillRect(10, 2, 4, 3); paintP(g, orP(ellP(8, 11, 4, 3), ellP(14, 10, 5, 3.5)), ['#9ab0c8', '#ffffff', '#ffffff']); },
    boots(g) { paintP(g, polyP([[7, 4], [14, 4], [14, 14], [21, 16], [21, 21], [7, 21]]), ['#5a2a10', '#a85a28', '#e0a060']); paintP(g, rectP(7, 4, 14, 7), ['#a08020', '#e8d048', '#fff6a0']); },
    shoe(g) { paintP(g, arcP([6, 18], [12, 0], [18, 18], 1.6, 2.2), ['#6a6a76', '#c8c8d4', '#ffffff']); g.fillStyle = '#2a2a30'; g.fillRect(5, 17, 3, 3); g.fillRect(16, 17, 3, 3); },
    balloon(g) { paintP(g, ellP(12, 10, 6.5, 8), ['#8a0820', '#e0283c', '#ff9aa4']); g.fillStyle = '#c8c8c8'; g.fillRect(12, 18, 1, 5); },
    ring(g, m) { paintP(g, ellP(12, 13, 7, 7), m === 'p' ? ['#1a3aa0', '#4a80ff', '#b0d0ff'] : ['#8a0820', '#e0283c', '#ff9aa4']); g.clearRect(9, 10, 6, 6); paintP(g, ellP(12, 5, 2.5, 2.5), m === 'p' ? ['#1a3aa0', '#4a80ff', '#b0d0ff'] : ['#8a0820', '#e0283c', '#ff9aa4']); },
    mirror(g) { paintP(g, ellP(12, 11, 7, 8), ['#7c5c0c', '#e0be3c', '#fff4a8']); paintP(g, ellP(12, 11, 5, 6), ['#3a70a0', '#8ad0f8', '#ffffff']); paintP(g, rectP(10, 18, 14, 23), ['#7c5c0c', '#e0be3c', '#fff4a8']); },
    eye(g) { paintP(g, ellP(12, 12, 8, 8), ['#a8a8b8', '#f0f0f8', '#ffffff']); paintP(g, ellP(14, 12, 4.5, 4.5), ['#102a98', '#3a70e0', '#a0c8ff']); g.fillStyle = '#000'; g.fillRect(14, 11, 2, 3); g.fillStyle = '#c02030'; g.fillRect(5, 9, 4, 1); g.fillRect(6, 15, 3, 1); },
    crown(g) { paintP(g, polyP([[3, 8], [8, 13], [12, 5], [16, 13], [21, 8], [20, 19], [4, 19]]), MP.gold); g.fillStyle = '#e02040'; g.fillRect(11, 14, 2, 3); g.fillStyle = '#3a70e0'; g.fillRect(6, 15, 2, 2); g.fillRect(16, 15, 2, 2); },
    worm(g) { paintP(g, orP(segP(5, 17, 10, 11, 3), segP(10, 11, 16, 14, 3), segP(16, 14, 20, 8, 2.6)), ['#2a1a40', '#6a4a98', '#b088e8']); g.fillStyle = '#e0e0ff'; g.fillRect(19, 6, 2, 2); }
  };
  const iconCache = new Map();
  const fitIcon = (src, n = 22) => {
    const k = Math.min(n / src.width, n / src.height, 1);
    if (k >= 1) return src;
    const cv = mkcv(Math.max(1, Math.round(src.width * k)), Math.max(1, Math.round(src.height * k))), g = cv.getContext('2d');
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, cv.width, cv.height);
    return cv;
  };
  function buildIcon(it_) {
    const sp = it_.sp || '';
    const [fam, arg] = sp.split(':');
    if (fam === 'tile') {
      const tid = +arg, d = TD[tid];
      if (d.ob) return outlineCv(fitIcon(objCanvas(tid), 22));
      if (d.ter) { const cv = mkcv(16, 16); ctx2(cv).drawImage(tileStrip(tid), 0, 0, 16, 16, 0, 0, 16, 16); return outlineCv(cv); }
      if (tid === T.GLASS || tid === T.PLATFORM) { const cv = mkcv(16, 16); ctx2(cv).drawImage(tileStrip(tid), 0, 0, 16, 16, 0, 0, 16, 16); return outlineCv(cv); }
      return outlineCv(fitIcon(smallTile(tid, 0), 22));
    }
    if (fam === 'wood') { const cv = mkcv(16, 16); ctx2(cv).drawImage(tileStrip(T.WOOD), 0, 0, 16, 16, 0, 0, 16, 16); return outlineCv(cv); }
    if (fam === 'platform') { const cv = mkcv(24, 24); ctx2(cv).drawImage(tileStrip(T.PLATFORM), 0, 0, 16, 5, 4, 10, 16, 5); return outlineCv(cv); }
    if (fam === 'wall') { const cv = mkcv(16, 16); ctx2(cv).drawImage(wallStrip(+arg), 15 * 16, 0, 16, 16, 0, 0, 16, 16); return outlineCv(cv); }
    const cv = mkcv(24, 24), g = ctx2(cv);
    const f = ICONDRAW[fam === 'misc' ? arg : fam];
    if (!f) { paintP(g, ellP(12, 12, 8, 8), MP.stone); return outlineCv(cv); }
    if (fam === 'ore') f(g, arg);
    else if (fam === 'sword') f(g, arg, !!it_.big);
    else if (fam === 'misc' && (arg === 'ringp' || arg === 'ring')) ICONDRAW.ring(g, arg === 'ringp' ? 'p' : 'r');
    else f(g, arg);
    return outlineCv(cv);
  }
  function iconOf(id) {
    let c = iconCache.get(id);
    if (!c) { const d = IT[id]; c = d ? buildIcon(d) : mkcv(4, 4); iconCache.set(id, c); }
    return c;
  }
  let heartC = null;
  const hearts = () => heartC || (heartC = (() => { const img = (() => { const cv = mkcv(22, 20), g = ctx2(cv); const tmp = mkcv(24, 24); ICONDRAW.heart(ctx2(tmp)); g.drawImage(outlineCv(tmp), -2, -3); return cv; })(); const empty = (() => { const cv = mkcv(22, 20), g = ctx2(cv); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(20,10,20,0.8)'; g.fillRect(0, 0, 22, 20); return cv; })(); return { img, empty }; })());
  const starImg = (() => { const cv = mkcv(22, 22), g = ctx2(cv); const tmp = mkcv(24, 24); ICONDRAW.manastar(ctx2(tmp)); g.drawImage(outlineCv(tmp), -2, -2); return cv; })();
  const starEmpty = (() => { const cv = mkcv(22, 22), g = ctx2(cv); g.drawImage(starImg, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(10,10,30,0.8)'; g.fillRect(0, 0, 22, 22); return cv; })();
  const coinImg = {};
  ['cu', 'ag', 'au', 'pt'].forEach(k => { const t = mkcv(24, 24); ICONDRAW.coin(ctx2(t), k); coinImg[k] = outlineCv(t); });
  const paintB = (g, pred, pal, x0, y0, x1, y1) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!pred(x, y)) continue;
      const L = !pred(x - 1, y) || !pred(x, y - 1), D = !pred(x + 1, y) || !pred(x, y + 1);
      g.fillStyle = L && !D ? pal[2] : D && !L ? pal[0] : pal[1];
      g.fillRect(x, y, 1, 1);
    }
  };
  const rrP = (x0, y0, x1, y1, r) => (x, y) => {
    const X = x + 0.5, Y = y + 0.5;
    if (X < x0 || X > x1 || Y < y0 || Y > y1) return false;
    const cx = X < x0 + r ? x0 + r : X > x1 - r ? x1 - r : X, cy = Y < y0 + r ? y0 + r : Y > y1 - r ? y1 - r : Y;
    return (X - cx) ** 2 + (Y - cy) ** 2 <= r * r;
  };
  const notP = (a, b) => (x, y) => a(x, y) && !b(x, y);
  const palOf = c => [shade(c, -0.4), c, shade(c, 0.34)];
  const SKINS = ['#f2c8a4', '#e3a97f', '#c98b62', '#a86b46', '#7c4a2c', '#573220'];
  const HAIRS = ['#2c1c12', '#5e3a1c', '#a8662c', '#e2b244', '#c9c9cf', '#d03a34', '#3a68d4', '#42a456'];
  const SHIRTS = ['#58a050', '#4a80cc', '#cc5444', '#d4ac3c', '#8c5cbc', '#e2e2e2', '#444450', '#e47c34'];
  const PANTS = ['#6e5232', '#3c4e7a', '#443c4c', '#7c5448', '#525a52', '#a49462'];
  const SHOES = ['#3a2616', '#262630', '#6a3a1c'];
  const CHARW = 40, CHARH = 56;
  const ARMSET = { wood: ['wood', 'cap'], copper: ['copper', 'helm'], iron: ['iron', 'helm'], silver: ['silver', 'helm'], gold: ['gold', 'crest'], shadow: ['shadow', 'horn'], molten: ['molten', 'horn2'], mining: ['mining', 'mine'] };
  const setOf = id => { const d = id && IT[id]; return d && ARMSET[d.set] ? d.set : null; };
  const HEAD = rrP(14, 8, 26, 22, 3.6);
  function hairBack(g, A) {
    if (A.hs === 1) paintB(g, rrP(12, 9, 28, 33, 3), palOf(A.hc), 8, 6, 32, 36);
    else if (A.hs === 3) paintB(g, orP(ellP(29, 18, 3.2, 3.6), segP(26, 13, 29, 17, 1.6)), palOf(A.hc), 20, 8, 36, 28);
  }
  function hairFront(g, A) {
    const pal = palOf(A.hc);
    if (A.hs === 0 || A.hs === 1) paintB(g, orP(rrP(13, 6.5, 27, 13.5, 3.2), rectP(13, 11, 15, 17), rectP(25, 11, 27, 17)), pal, 8, 4, 32, 22);
    else if (A.hs === 2) paintB(g, orP(rrP(13, 8, 27, 13.5, 3), polyP([[13, 12], [14, 5], [17, 9], [19, 2], [21, 8], [24, 3], [25, 9], [28, 5], [27, 13]]), rectP(13, 11, 15, 16), rectP(25, 11, 27, 16)), pal, 8, 0, 32, 22);
    else if (A.hs === 3) paintB(g, orP(rrP(13, 6.5, 27, 12.5, 3.2), rectP(13, 11, 15, 15), rectP(25, 11, 27, 15)), pal, 8, 4, 32, 22);
    else if (A.hs === 4) paintB(g, orP(rrP(13, 6.5, 27, 12.5, 3.2), polyP([[13, 11], [22, 11], [26, 16], [20, 14], [13, 15]]), rectP(25, 11, 27, 14)), pal, 8, 4, 32, 22);
  }
  function faceDraw(g, A, kind) {
    paintB(g, HEAD, palOf(A.skin), 10, 4, 30, 26);
    paintB(g, rectP(18, 21, 22, 24), palOf(A.skin), 14, 18, 26, 26);
    if (kind === 'skeleton') {
      g.fillStyle = '#1a1a22'; g.fillRect(16, 13, 3, 4); g.fillRect(21, 13, 3, 4); g.fillRect(19, 17, 2, 2);
      g.fillStyle = '#a8a494'; g.fillRect(16, 20, 8, 1);
      g.fillStyle = '#1a1a22'; for (let i = 0; i < 4; i++) g.fillRect(17 + i * 2, 20, 1, 2);
      return;
    }
    g.fillStyle = '#ffffff'; g.fillRect(16, 14, 3, 3); g.fillRect(21, 14, 3, 3);
    g.fillStyle = kind === 'zombie' ? '#c02020' : A.eye || '#2a3c78'; g.fillRect(17, 15, 2, 2); g.fillRect(22, 15, 2, 2);
    g.fillStyle = kind === 'zombie' ? '#3a1010' : shade(A.skin, -0.45);
    g.fillRect(18, 19, 4, 1);
    if (kind === 'zombie') { g.fillStyle = '#2a0808'; g.fillRect(18, 19, 4, 2); }
  }
  const legPts = (fr, ph) => {
    if (fr === 9) return [[16.4, 37, 14.5, 46.5], [23.6, 37, 26, 44]];
    if (fr === 0) return [[17.2, 37, 17, 48], [22.8, 37, 23, 48]];
    const a = Math.sin(ph * 6.2832), b = Math.sin(ph * 6.2832 + 3.1416);
    return [[17.2, 37, 17 + a * 6, 48 - Math.max(0, Math.cos(ph * 6.2832)) * 3], [22.8, 37, 23 + b * 6, 48 - Math.max(0, Math.cos(ph * 6.2832 + 3.1416)) * 3]];
  };
  const armPts = (fr, ph) => {
    if (fr === 9) return [[13, 24.5, 8, 15], [27, 24.5, 32, 15]];
    if (fr === 0) return [[13, 24.5, 10.5, 35], [27, 24.5, 29.5, 35]];
    const a = Math.sin(ph * 6.2832), b = -a;
    return [[13, 24.5, 11 + a * 2, 35 + Math.abs(a) * -1], [27, 24.5, 29 + b * 2, 35 - Math.abs(b)]];
  };
  const SHOULD = [[13, 24.5], [27, 24.5]];
  function drawLimb(g, p, upper, lower, r, cut) {
    const mx = p[0] + (p[2] - p[0]) * cut, my = p[1] + (p[3] - p[1]) * cut;
    paintB(g, segP(p[0], p[1], mx, my, r, r), upper, 4, 4, 38, 52);
    paintB(g, segP(mx, my, p[2], p[3], r * 0.92, r * 0.92), lower, 4, 4, 38, 52);
  }
  const KINDPAL = {
    zombie: { skin: '#7ea85e', shirt: '#4c5a6c', pants: '#46465a', shoe: '#2a2a34', hair: '#3a2a1c', hs: 4 },
    skeleton: { skin: '#d8d4c2', shirt: '#cfcbb8', pants: '#c4c0ae', shoe: '#b0ac9a', hs: -1 }
  };
  function playerFrame(A, eq, fr, noArm, kind) {
    const cv = mkcv(CHARW, CHARH), g = ctx2(cv);
    const ph = fr >= 1 && fr <= 8 ? (fr - 1) / 8 : 0;
    const set = { h: setOf(eq[0]), b: setOf(eq[1]), l: setOf(eq[2]) };
    const skinP = palOf(A.skin), shirtP = palOf(A.shirt), pantsP = palOf(A.pants), shoeP = palOf(A.shoe);
    const lp = legPts(fr, ph), ap = armPts(fr, ph);
    const bone = kind === 'skeleton';
    if (A.hs >= 0) hairBack(g, A);
    const farArm = ap[0], nearArm = ap[1];
    const armTop = set.b ? palOf(MP[ARMSET[set.b][0]][1]) : shirtP;
    const armLow = set.b ? (bone ? skinP : armTop) : skinP;
    if (kind === 'zombie') {
      drawLimb(g, [13, 24.5, 4, 23], shirtP, skinP, 2.4, 0.5);
    } else drawLimb(g, farArm, armTop, armLow, bone ? 1.6 : 2.5, 0.55);
    lp.forEach((p, i) => {
      const lowP = set.l ? palOf(MP[ARMSET[set.l][0]][1]) : pantsP;
      drawLimb(g, p, set.l ? lowP : pantsP, set.l ? lowP : pantsP, bone ? 1.6 : 3.1, 1);
      const sh = set.l ? palOf(shade(MP[ARMSET[set.l][0]][1], -0.2)) : shoeP;
      paintB(g, ellP(p[2] + (i ? 0.8 : -0.8), p[3] - 1.2, 3.8, 2.6), sh, 4, 30, 38, 54);
      if (set.l) { g.fillStyle = MP[ARMSET[set.l][0]][2]; g.fillRect(Math.round(p[0] + (p[2] - p[0]) * 0.5) - 1, Math.round(p[1] + (p[3] - p[1]) * 0.5) - 1, 3, 1); }
    });
    if (bone) {
      paintB(g, rrP(15, 22, 25, 36, 2), skinP, 10, 20, 30, 38);
      g.fillStyle = '#3a382e'; for (let i = 0; i < 4; i++) g.fillRect(16, 24 + i * 3, 8, 1);
      g.fillRect(19, 22, 2, 14);
    } else {
      const bp = set.b ? palOf(MP[ARMSET[set.b][0]][1]) : shirtP;
      paintB(g, rrP(12.8, 22, 27.2, 36.4, 2), bp, 8, 18, 32, 40);
      if (set.b) {
        const mp = MP[ARMSET[set.b][0]];
        paintB(g, orP(ellP(12, 24.2, 3.6, 3.2), ellP(28, 24.2, 3.6, 3.2)), palOf(mp[1]), 6, 18, 34, 32);
        g.fillStyle = mp[0]; g.fillRect(13, 33, 14, 2); g.fillStyle = mp[2]; g.fillRect(13, 32, 14, 1);
        g.fillStyle = mp[0]; g.fillRect(19, 24, 2, 8);
        if (set.b === 'gold') { g.fillStyle = '#e02c40'; g.fillRect(19, 27, 2, 2); }
        if (set.b === 'molten') { g.fillStyle = '#ffb440'; g.fillRect(15, 26, 2, 1); g.fillRect(23, 28, 2, 1); g.fillRect(19, 30, 2, 1); }
        if (set.b === 'shadow') { g.fillStyle = '#d0b8ff'; g.fillRect(14, 27, 1, 3); g.fillRect(25, 27, 1, 3); }
      } else {
        g.fillStyle = shirtP[2]; g.fillRect(14, 22, 12, 1);
        g.fillStyle = shade(A.pants, -0.1); g.fillRect(13, 34, 14, 2);
        if (kind === 'zombie') { g.clearRect(13, 30, 3, 6); g.clearRect(24, 25, 3, 3); g.fillStyle = skinP[0]; g.fillRect(14, 32, 2, 3); }
      }
    }
    faceDraw(g, A, kind);
    if (A.beard) { paintB(g, orP(ellP(20, 20.5, 5, 3.4), rectP(15, 17, 25, 20)), palOf(A.beard), 10, 14, 30, 26); g.fillStyle = shade(A.skin, -0.35); g.fillRect(18, 18, 4, 1); }
    if (A.hs >= 0) hairFront(g, A);
    if (set.h) {
      const mp = MP[ARMSET[set.h][0]], st = ARMSET[set.h][1], pal = palOf(mp[1]);
      if (st === 'cap') {
        paintB(g, rrP(13.2, 7, 26.8, 13.6, 3.2), pal, 8, 2, 32, 20);
        paintB(g, rectP(12, 12, 28, 14), palOf(mp[0] === '#4e3418' ? '#7a5a30' : mp[1]), 8, 8, 32, 18);
      } else if (st === 'mine') {
        paintB(g, rrP(13, 6.5, 27, 14.5, 3.6), palOf('#d8a830'), 8, 2, 32, 20);
        paintB(g, rectP(12, 12.5, 28, 14.5), palOf('#a07820'), 8, 8, 32, 18);
        g.fillStyle = '#fff4b0'; g.fillRect(19, 7, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(20, 8, 1, 1);
      } else {
        paintB(g, orP(rrP(12.6, 5.6, 27.4, 15, 4), rectP(12.6, 13, 15, 21), rectP(25, 13, 27.4, 21)), pal, 6, 0, 34, 26);
        g.fillStyle = mp[0]; g.fillRect(15, 14, 10, 1);
        g.fillStyle = mp[2]; g.fillRect(16, 7, 8, 1);
        if (st === 'crest') paintB(g, polyP([[17, 7], [20, 0], [23, 7]]), palOf(mp[2]), 8, 0, 32, 10);
        if (st === 'horn' || st === 'horn2') {
          const hp = st === 'horn2' ? [mp[0], '#ff7a2a', '#ffd080'] : [mp[0], '#8a6cd8', '#d4c0ff'];
          paintB(g, segP(14, 8, 9, 1, 1.8, 0.6), hp, 4, 0, 18, 14); paintB(g, segP(26, 8, 31, 1, 1.8, 0.6), hp, 22, 0, 36, 14);
        }
        if (st === 'horn2') { g.fillStyle = '#ffb840'; g.fillRect(17, 8, 1, 2); g.fillRect(22, 8, 1, 2); }
      }
    }
    if (!noArm) {
      if (kind === 'zombie') drawLimb(g, [27, 24.5, 38, 22.5], shirtP, skinP, 2.4, 0.5);
      else drawLimb(g, nearArm, armTop, armLow, bone ? 1.6 : 2.5, 0.55);
      if (!bone) { g.fillStyle = skinP[1]; }
    }
    return outlineCv(cv);
  }
  const ARMLEN = 12;
  function armSprite(A, eq, kind) {
    const cv = mkcv(20, 12), g = ctx2(cv);
    const bone = kind === 'skeleton';
    const set = setOf(eq[1]);
    const upper = set ? palOf(MP[ARMSET[set][0]][1]) : palOf(A.shirt), lower = set ? upper : palOf(A.skin);
    paintB(g, segP(3, 6, 7, 6, bone ? 1.6 : 2.5), upper, 0, 0, 20, 12);
    paintB(g, segP(7, 6, 14, 6, bone ? 1.5 : 2.3), bone ? palOf(A.skin) : (set ? palOf(MP[ARMSET[set][0]][1]) : palOf(A.skin)), 0, 0, 20, 12);
    paintB(g, ellP(14.5, 6, 2.1, 2.1), palOf(A.skin), 0, 0, 20, 12);
    return outlineCv(cv);
  }
  const charCache = new Map();
  function charImg(A, eq, fr, noArm, kind) {
    const key = A.k + '|' + eq.join(',') + '|' + fr + '|' + (noArm ? 1 : 0) + '|' + (kind || '');
    let c = charCache.get(key);
    if (!c) { if (charCache.size > 600) charCache.clear(); c = playerFrame(A, eq, fr, noArm, kind); charCache.set(key, c); }
    return c;
  }
  const armCache = new Map();
  function armImg(A, eq, kind) {
    const key = A.k + '|' + eq[1] + '|' + (kind || '');
    let c = armCache.get(key);
    if (!c) { c = armSprite(A, eq, kind); armCache.set(key, c); }
    return c;
  }
  function mkLook(o) {
    const A = Object.assign({ skin: SKINS[1], hs: 0, hc: 1, shirt: SHIRTS[0], pants: PANTS[0], shoe: SHOES[0] }, o);
    A.k = [A.skin, A.hs, A.hc, A.shirt, A.pants, A.shoe, A.beard || '', A.eye || ''].join('~');
    return A;
  }
  const lookFromChar = c => mkLook({ skin: SKINS[c.sk], hs: c.hs, hc: HAIRS[c.hc], shirt: SHIRTS[c.sh], pants: PANTS[c.pn], shoe: SHOES[0], eye: c.ey === 1 ? '#3a8c4a' : c.ey === 2 ? '#7c4a2a' : '#2a3c78' });
  const LOOKS = {
    guide: mkLook({ skin: SKINS[1], hs: 0, hc: HAIRS[1], shirt: '#5a9a4a', pants: '#6a4c2e', shoe: '#3a2616' }),
    merchant: mkLook({ skin: SKINS[0], hs: 1, hc: HAIRS[4], shirt: '#8a7a4a', pants: '#5a4a34', shoe: '#3a2616', beard: HAIRS[4] }),
    zombie: mkLook({ skin: KINDPAL.zombie.skin, hs: 4, hc: KINDPAL.zombie.hair, shirt: KINDPAL.zombie.shirt, pants: KINDPAL.zombie.pants, shoe: KINDPAL.zombie.shoe }),
    skeleton: mkLook({ skin: KINDPAL.skeleton.skin, hs: -1, hc: '#000', shirt: KINDPAL.skeleton.shirt, pants: KINDPAL.skeleton.pants, shoe: KINDPAL.skeleton.shoe })
  };
  const NOEQ = [null, null, null];
  const rgba = (c, a) => { const [r, g, b] = hex(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
  function slimeImg(col, w, h, sq, o) {
    const W2 = Math.round(w / Math.sqrt(sq)) + 2, H2 = Math.round(h * sq) + 2;
    const cv = mkcv(W2, H2), g = ctx2(cv);
    const bw = W2 - 2, bh = H2 - 2;
    const dome = (x, y) => {
      const X = x - 1 + 0.5, Y = y - 1 + 0.5;
      if (X < 0 || Y < 0 || X > bw || Y > bh) return false;
      const cx = bw / 2, k = Y / bh;
      const rx = cx * (k < 0.8 ? Math.sqrt(1 - ((0.8 - k) / 0.8) ** 2) : 1);
      const rr = Math.min(3, bh * 0.2);
      if (Y > bh - rr) { const rrx = cx - rr * (1 - Math.sqrt(1 - ((Y - (bh - rr)) / rr) ** 2)); return Math.abs(X - cx) <= rrx; }
      return Math.abs(X - cx) <= rx;
    };
    const [r, gg, b] = hex(col);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      if (!dome(x, y)) continue;
      const edge = !dome(x - 1, y) || !dome(x + 1, y) || !dome(x, y - 1) || !dome(x, y + 1);
      const edge2 = !dome(x - 2, y) || !dome(x + 2, y) || !dome(x, y - 2) || !dome(x, y + 2);
      const k = (y - 1) / bh;
      if (edge) g.fillStyle = rgba(shade(col, -0.35), 0.92);
      else if (edge2) g.fillStyle = rgba(col, 0.92);
      else g.fillStyle = rgba(shade(col, -0.05 + k * 0.18), 0.78);
      g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.55)';
    const hx = Math.round(bw * 0.22) + 1, hy = Math.round(bh * 0.22) + 1;
    g.fillRect(hx, hy, Math.max(2, Math.round(bw * 0.14)), 1); g.fillRect(hx - 1, hy + 1, 1, Math.max(1, Math.round(bh * 0.14)));
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(hx + 1, hy + 2, 2, 1);
    const ey = Math.round(bh * 0.42) + 1, ex1 = Math.round(bw * 0.32), ex2 = Math.round(bw * 0.62);
    const es = bw > 40 ? 3 : 2, eh = bw > 40 ? 4 : 3;
    g.fillStyle = '#10141c'; g.fillRect(ex1, ey, es, eh); g.fillRect(ex2, ey, es, eh);
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(ex1, ey, 1, 1); g.fillRect(ex2, ey, 1, 1);
    if (o && o.core) {
      g.fillStyle = o.core; const cx = Math.round(bw * 0.5), cy = Math.round(bh * 0.7);
      g.fillRect(cx - 2, cy, 5, 2); g.fillRect(cx - 1, cy - 1, 3, 4);
    }
    return cv;
  }
  const SLIMEDEF = {
    green: { c: '#52d048', w: 24, h: 18 }, blue: { c: '#4a8ef0', w: 32, h: 24 }, purple: { c: '#a050e0', w: 40, h: 30 }, red: { c: '#e04a48', w: 36, h: 26 },
    ice: { c: '#9fe0ff', w: 32, h: 24 }, lava: { c: '#ff7a1c', w: 36, h: 26 }, yellow: { c: '#e8d048', w: 28, h: 22 }, black: { c: '#4a4a66', w: 34, h: 24 }, jungle: { c: '#6ad060', w: 32, h: 24 }
  };
  const slimeCache = new Map();
  function slimeFrame(kind, f) {
    const key = kind + f;
    let c = slimeCache.get(key);
    if (!c) {
      const d = SLIMEDEF[kind];
      c = slimeImg(d.c, d.w, d.h, [0.82, 1, 1.2][f], { core: kind === 'blue' || kind === 'green' ? null : null });
      slimeCache.set(key, c);
    }
    return c;
  }
  function kingSlimeImg(f) {
    const sq = [0.88, 1, 1.12][f], w = 114, h = 78;
    const base = slimeImg('#3c70e8', w, h, sq, null);
    const cv = mkcv(base.width, base.height + 22), g = ctx2(cv);
    g.drawImage(base, 0, 22);
    const cx = base.width / 2, cy = 14;
    const crown = polyP([[cx - 18, cy + 8], [cx - 20, cy - 8], [cx - 10, cy], [cx - 4, cy - 12], [cx, cy - 2], [cx + 4, cy - 12], [cx + 10, cy], [cx + 20, cy - 8], [cx + 18, cy + 8]]);
    paintB(g, crown, ['#8c6a10', '#e4bc38', '#fff0a0'], 0, 0, cv.width, 30);
    g.fillStyle = '#e03048'; g.fillRect(Math.round(cx) - 1, cy + 1, 3, 4); g.fillStyle = '#3a70e0'; g.fillRect(Math.round(cx) - 12, cy + 2, 3, 3); g.fillRect(Math.round(cx) + 10, cy + 2, 3, 3);
    const nj = mkcv(24, 30), n = ctx2(nj);
    paintB(n, ellP(12, 8, 6, 6), ['#202028', '#38384a', '#585870'], 0, 0, 24, 30);
    paintB(n, rrP(6, 14, 18, 28, 2), ['#202028', '#38384a', '#585870'], 0, 0, 24, 30);
    n.fillStyle = '#ffffff'; n.fillRect(9, 7, 6, 2); n.fillStyle = '#000'; n.fillRect(10, 7, 1, 2); n.fillRect(13, 7, 1, 2);
    g.globalAlpha = 0.85; g.drawImage(nj, Math.round(cx - 12), Math.round(cv.height * 0.5)); g.globalAlpha = 1;
    return cv;
  }
  const ksCache = [];
  const kingFrame = f => ksCache[f] || (ksCache[f] = kingSlimeImg(f));
  function batImg(f, kind) {
    const cv = mkcv(30, 20), g = ctx2(cv);
    const body = kind === 'ice' ? ['#7a9ab8', '#b4d4ee', '#e8f8ff'] : kind === 'hell' ? ['#5a1408', '#c8401c', '#ff9a50'] : ['#2c1a42', '#4e3270', '#7a58a8'];
    const wing = kind === 'ice' ? ['#8aaac8', '#c4e0f8', '#f0fcff'] : kind === 'hell' ? ['#4a1008', '#a03018', '#e8702c'] : ['#241636', '#3c2858', '#5e4488'];
    const up = [-7, 0, 6][f], tip = [-9, 1, 8][f];
    const lw = polyP([[13, 9], [8, 8 + up * 0.5], [2, 6 + tip], [4, 11 + tip * 0.3], [7, 13 + tip * 0.2], [10, 14], [13, 13]]);
    const rw = polyP([[17, 9], [22, 8 + up * 0.5], [28, 6 + tip], [26, 11 + tip * 0.3], [23, 13 + tip * 0.2], [20, 14], [17, 13]]);
    paintB(g, lw, wing, 0, 0, 30, 20); paintB(g, rw, wing, 0, 0, 30, 20);
    paintB(g, ellP(15, 11, 3.8, 4.6), body, 0, 0, 30, 20);
    g.fillStyle = kind === 'hell' ? '#ffe060' : '#ff3030'; g.fillRect(13, 10, 1, 1); g.fillRect(16, 10, 1, 1);
    g.fillStyle = '#e8e0f0'; g.fillRect(13, 14, 1, 1); g.fillRect(16, 14, 1, 1);
    paintB(g, orP(polyP([[12, 7], [12, 4], [14, 6]]), polyP([[18, 7], [18, 4], [16, 6]])), body, 0, 0, 30, 20);
    return outlineCv(cv);
  }
  const batCache = new Map();
  const batFrame = (f, kind) => { const k = kind + f; return batCache.get(k) || (batCache.set(k, batImg(f, kind)), batCache.get(k)); };
  function eyeImg(iris, f) {
    const cv = mkcv(44, 28), g = ctx2(cv);
    const tail = (x, y) => { const t = (x - 2) / 14; if (t < 0 || t > 1) return false; const yy = 14 + Math.sin(t * 6 + f * 1.6) * (1.5 + t * 2); return Math.abs(y + 0.5 - yy) < 1.7 - t * 0.6; };
    paintB(g, tail, ['#8a2040', '#c04060', '#e88098'], 0, 0, 44, 28);
    paintB(g, ellP(28, 14, 12, 12), ['#a8a0b0', '#f0eaf0', '#ffffff'], 0, 0, 44, 28);
    g.fillStyle = '#c42838'; [[20, 8, 4, 1], [19, 10, 3, 1], [21, 19, 4, 1], [22, 21, 3, 1], [26, 4, 1, 3], [30, 4, 1, 3], [34, 6, 2, 1]].forEach(a => g.fillRect(a[0], a[1], a[2], a[3]));
    paintB(g, ellP(33, 14, 6, 6.5), iris, 0, 0, 44, 28);
    paintB(g, ellP(34.6, 14, 2.6, 3.4), ['#000', '#000', '#101010'], 0, 0, 44, 28);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(31, 11, 2, 1);
    return outlineCv(cv);
  }
  const IRIS = { blue: ['#18307c', '#3c68d8', '#84a8ff'], green: ['#145a28', '#38b058', '#90f0a8'], purple: ['#401070', '#8c3cc8', '#d498ff'], red: ['#6a1010', '#d03030', '#ff9090'] };
  const eyeCache = new Map();
  const eyeFrame = (k, f) => { const key = k + f; return eyeCache.get(key) || (eyeCache.set(key, eyeImg(IRIS[k], f)), eyeCache.get(key)); };
  function eaterImg(f) {
    const cv = mkcv(42, 34), g = ctx2(cv);
    const wp = ['#2c1840', '#50307c', '#8458b4'];
    const up = f ? 5 : -2;
    paintB(g, polyP([[16, 14], [8, 10 + up], [1, 6 + up], [6, 15], [12, 20]]), wp, 0, 0, 42, 34);
    paintB(g, polyP([[16, 20], [8, 24 - up], [2, 28 - up], [8, 22], [14, 18]]), wp, 0, 0, 42, 34);
    paintB(g, ellP(24, 17, 14, 11), ['#24142e', '#3e2858', '#6a4a92'], 0, 0, 42, 34);
    paintB(g, polyP([[30, 9], [41, 14], [41, 21], [30, 25], [27, 17]]), ['#3a0c18', '#7a1428', '#b43048'], 0, 0, 42, 34);
    g.fillStyle = '#f4e8c8'; for (let i = 0; i < 4; i++) { g.fillRect(33 + i * 2, 12 + i, 1, 3); g.fillRect(33 + i * 2, 22 - i, 1, 3); }
    g.fillStyle = '#ffe060'; g.fillRect(24, 11, 3, 2); g.fillRect(24, 22, 3, 2);
    g.fillStyle = '#7ac860'; g.fillRect(14, 12, 3, 2); g.fillRect(16, 21, 2, 2); g.fillRect(19, 15, 2, 3);
    return outlineCv(cv);
  }
  const eaterCache = [];
  const eaterFrame = f => eaterCache[f] || (eaterCache[f] = eaterImg(f));
  function wormSeg(kind, part, S) {
    const cv = mkcv(S + 2, S + 2), g = ctx2(cv), c = S / 2 + 1;
    const P = kind === 'giant' ? ['#4a2a18', '#9a6a46', '#d8a878'] : kind === 'eow' ? ['#2a1a38', '#52386e', '#8a68b0'] : ['#2c3a24', '#58704a', '#92b078'];
    const sp = kind === 'giant' ? '#e8c8a0' : kind === 'eow' ? '#c8a0e8' : '#c0d8a0';
    if (part === 'tail') paintB(g, polyP([[2, c - S * 0.28], [S * 0.6, c - S * 0.42], [S + 1, c], [S * 0.6, c + S * 0.42], [2, c + S * 0.28]]), P, 0, 0, S + 2, S + 2);
    else paintB(g, ellP(c, c, S / 2, S / 2), P, 0, 0, S + 2, S + 2);
    if (part === 'body') {
      g.fillStyle = sp; g.fillRect(Math.round(c) - 1, Math.round(c) - 3, 2, 2); g.fillRect(Math.round(c) + 3, Math.round(c) + 2, 2, 2); g.fillRect(Math.round(c) - 4, Math.round(c) + 2, 2, 1);
      g.fillStyle = P[0]; g.fillRect(Math.round(c) - 1, 1, 2, 2); g.fillRect(Math.round(c) - 1, S - 1, 2, 2);
    }
    if (part === 'head') {
      paintB(g, polyP([[c + S * 0.1, c - S * 0.3], [S + 1, c - S * 0.12], [S + 1, c + S * 0.12], [c + S * 0.1, c + S * 0.3], [c + S * 0.28, c]]), ['#2a0810', '#6a1428', '#a82c44'], 0, 0, S + 2, S + 2);
      g.fillStyle = '#f0e8d0'; for (let i = 0; i < 3; i++) { g.fillRect(Math.round(c + S * 0.3 + i * 3), Math.round(c - S * 0.2 + i), 1, 3); g.fillRect(Math.round(c + S * 0.3 + i * 3), Math.round(c + S * 0.2 - i - 2), 1, 3); }
      g.fillStyle = kind === 'eow' ? '#ffe060' : '#ff3030'; g.fillRect(Math.round(c - 2), Math.round(c - S * 0.28), 2, 2); g.fillRect(Math.round(c - 2), Math.round(c + S * 0.2), 2, 2);
    }
    return outlineCv(cv);
  }
  const wormCache = new Map();
  const wormImg = (kind, part, S) => { const k = kind + part + S; return wormCache.get(k) || (wormCache.set(k, wormSeg(kind, part, S)), wormCache.get(k)); };
  function impImg(f) {
    const cv = mkcv(36, 36), g = ctx2(cv);
    const up = f ? 5 : -3;
    const wp = ['#4a0c08', '#a02c14', '#e86a2c'];
    paintB(g, polyP([[14, 14], [5, 8 + up], [1, 14 + up], [4, 18], [10, 22]]), wp, 0, 0, 36, 36);
    paintB(g, polyP([[22, 14], [31, 8 + up], [35, 14 + up], [32, 18], [26, 22]]), wp, 0, 0, 36, 36);
    paintB(g, rrP(13, 15, 23, 29, 3), ['#5a1008', '#c43c1c', '#ff8a44'], 0, 0, 36, 36);
    paintB(g, segP(14, 28, 13, 34, 1.8, 1.4), ['#5a1008', '#c43c1c', '#ff8a44'], 0, 0, 36, 36);
    paintB(g, segP(22, 28, 23, 34, 1.8, 1.4), ['#5a1008', '#c43c1c', '#ff8a44'], 0, 0, 36, 36);
    paintB(g, ellP(18, 11, 6.5, 6), ['#5a1008', '#d04420', '#ff9a58'], 0, 0, 36, 36);
    paintB(g, segP(14, 7, 11, 1, 1.6, 0.5), ['#2a0808', '#702010', '#c06030'], 0, 0, 36, 36);
    paintB(g, segP(22, 7, 25, 1, 1.6, 0.5), ['#2a0808', '#702010', '#c06030'], 0, 0, 36, 36);
    g.fillStyle = '#ffee50'; g.fillRect(14, 10, 3, 2); g.fillRect(20, 10, 3, 2);
    g.fillStyle = '#300808'; g.fillRect(16, 14, 4, 1);
    paintB(g, segP(23, 24, 32, 20, 1.3, 1.3), ['#5a1008', '#c43c1c', '#ff8a44'], 0, 0, 36, 36);
    return outlineCv(cv);
  }
  const impCache = [];
  const impFrame = f => impCache[f] || (impCache[f] = impImg(f));
  function eocImg(phase, f) {
    const S = 120, cv = mkcv(S, S), g = ctx2(cv);
    const c = 62, r = 52;
    const tailP = (x, y) => { const t = (x - 4) / 34; if (t < 0 || t > 1) return false; const yy = c + Math.sin(t * 5 + f * 1.2) * (4 + t * 6); return Math.abs(y + 0.5 - yy) < 5 - t * 3; };
    paintB(g, tailP, ['#7a1c3a', '#b83c5c', '#e87c98'], 0, 0, S, S);
    if (phase === 1) {
      paintB(g, ellP(c + 8, c, r, r), ['#a09aa8', '#ece6ec', '#ffffff'], 0, 0, S, S);
      g.fillStyle = '#c42838';
      for (let i = 0; i < 16; i++) { const a = i * 0.7 + 0.3, rr = 30 + (i % 3) * 7, x = c + 8 + Math.cos(a) * rr, y = c + Math.sin(a) * rr; g.fillRect(Math.round(x), Math.round(y), 5 + (i % 3), 2); g.fillRect(Math.round(x + 2), Math.round(y - 3), 2, 4); }
      paintB(g, ellP(c + 34, c, 22, 24), ['#0e1a64', '#2c5ccc', '#7aa4ff'], 0, 0, S, S);
      paintB(g, ellP(c + 40, c, 11, 14), ['#000', '#000', '#0c0c0c'], 0, 0, S, S);
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(c + 26, c - 14, 6, 3); g.fillRect(c + 24, c - 11, 3, 3);
    } else {
      paintB(g, ellP(c + 8, c, r, r), ['#6a1428', '#c0384c', '#f08090'], 0, 0, S, S);
      g.fillStyle = '#7a0c1c';
      for (let i = 0; i < 14; i++) { const a = i * 0.9 + 0.1, rr = 36 + (i % 3) * 6, x = c + 8 + Math.cos(a) * rr, y = c + Math.sin(a) * rr; g.fillRect(Math.round(x), Math.round(y), 5, 2); g.fillRect(Math.round(x + 2), Math.round(y - 3), 2, 4); }
      paintB(g, ellP(c + 26, c, 30, 36), ['#1a0206', '#3a0612', '#5a1020'], 0, 0, S, S);
      g.fillStyle = '#fff4dc';
      for (let i = 0; i < 12; i++) {
        const a = -1.45 + i * (2.9 / 11), rx = c + 26 + Math.cos(a) * 30, ry = c + Math.sin(a) * 36;
        const tx = Math.cos(a), ty = Math.sin(a);
        g.beginPath(); g.moveTo(rx - ty * 3.5, ry + tx * 3.5); g.lineTo(rx - tx * 11, ry - ty * 11); g.lineTo(rx + ty * 3.5, ry - tx * 3.5); g.closePath(); g.fill();
      }
      g.fillStyle = '#c0384c'; g.fillRect(c + 8, c - 6, 28, 12);
      g.fillStyle = '#e86078'; g.fillRect(c + 10, c - 5, 24, 3);
    }
    return outlineCv(cv);
  }
  const eocCache = new Map();
  const eocFrame = (ph, f) => { const k = ph + '_' + f; return eocCache.get(k) || (eocCache.set(k, eocImg(ph, f)), eocCache.get(k)); };
  const sprites = {};
  function servantImg(f) {
    const cv = mkcv(30, 22), g = ctx2(cv);
    const tail = (x, y) => { const t = (x - 1) / 8; if (t < 0 || t > 1) return false; return Math.abs(y + 0.5 - (11 + Math.sin(t * 5 + f * 1.8) * 2)) < 1.2; };
    paintB(g, tail, ['#8a2040', '#c04060', '#e88098'], 0, 0, 30, 22);
    paintB(g, ellP(19, 11, 9, 9), ['#a8a0b0', '#f0eaf0', '#ffffff'], 0, 0, 30, 22);
    paintB(g, ellP(23, 11, 4.6, 5), ['#401070', '#8c3cc8', '#d498ff'], 0, 0, 30, 22);
    g.fillStyle = '#000'; g.fillRect(24, 10, 2, 3);
    g.fillStyle = '#c42838'; g.fillRect(14, 7, 3, 1); g.fillRect(13, 14, 3, 1);
    return outlineCv(cv);
  }
  const servCache = [];
  const servFrame = f => servCache[f] || (servCache[f] = servantImg(f));
  const npcHeadIcon = (look) => { const cv = mkcv(22, 22), g = ctx2(cv); g.drawImage(playerFrame(look, NOEQ, 0, true, null), -5, -1); return cv; };
  const DAYLEN = 54000, NIGHTLEN = 32400;
  const SKYKEYS = [
    [0.00, '#2c3a78', '#e8946a'], [0.04, '#4a78c8', '#f0b88a'], [0.12, '#4c90e4', '#b4dcf8'], [0.5, '#3c84e8', '#9cd0fc'], [0.88, '#4c90e4', '#b4dcf8'], [0.96, '#5a5aa8', '#f0a070'], [1.00, '#26204e', '#d86a4a']
  ];
  const NIGHTKEYS = [[0, '#1c1a48', '#8a4a58'], [0.06, '#0e1030', '#26285a'], [0.5, '#070818', '#10142e'], [0.94, '#0e1030', '#26285a'], [1, '#2c3a78', '#e8946a']];
  const keyMix = (keys, f) => {
    for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) { const a = keys[i - 1], b = keys[i], k = (f - a[0]) / (b[0] - a[0] || 1); return [mix(a[1], b[1], k), mix(a[2], b[2], k)]; }
    const l = keys[keys.length - 1]; return [l[1], l[2]];
  };
  const skyAt = (day, tod) => day ? keyMix(SKYKEYS, tod / DAYLEN) : keyMix(NIGHTKEYS, tod / NIGHTLEN);
  const ambientAt = (day, tod) => {
    if (day) {
      const f = tod / DAYLEN, e = Math.min(f, 1 - f) * 54000 / 3600;
      const k = clamp(e, 0, 1);
      return [lerp(0.2, 1, k), lerp(0.22, 1, k), lerp(0.36, 0.98, k)];
    }
    const f = tod / NIGHTLEN, e = Math.min(f, 1 - f) * 32400 / 3600, k = 1 - clamp(e, 0, 1);
    return [lerp(0.2, 0.22, k), lerp(0.22, 0.24, k), lerp(0.36, 0.4, k)];
  };
  const stars = (() => { const r = rngf(77), a = []; for (let i = 0; i < 140; i++) a.push([r(), r() * 0.8, 0.4 + r() * 0.6, r() * 6.28, r() < 0.2 ? 2 : 1]); return a; })();
  const sunImg = (() => { const cv = mkcv(64, 64), g = ctx2(cv); const gr = g.createRadialGradient(32, 32, 6, 32, 32, 32); gr.addColorStop(0, 'rgba(255,250,200,0.9)'); gr.addColorStop(0.4, 'rgba(255,230,120,0.35)'); gr.addColorStop(1, 'rgba(255,220,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ffe870'; g.beginPath(); g.arc(32, 32, 15, 0, 7); g.fill(); g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(30, 30, 11, 0, 7); g.fill(); g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(28, 28, 5, 0, 7); g.fill(); return cv; })();
  const moonImg = (() => { const cv = mkcv(40, 40), g = ctx2(cv); g.fillStyle = '#e4e8f4'; g.beginPath(); g.arc(20, 20, 13, 0, 7); g.fill(); g.fillStyle = '#c4c8dc'; [[15, 14, 4], [24, 21, 3], [17, 25, 2.4], [25, 13, 2]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); g.fillStyle = '#f8faff'; g.beginPath(); g.arc(16, 15, 6, 0, 7); g.globalAlpha = 0.5; g.fill(); return cv; })();
  const mkCloud = seed => {
    const r = rngf(seed), w = 90 + (r() * 80 | 0), h = 34, cv = mkcv(w, h), g = ctx2(cv);
    for (let i = 0; i < 9; i++) { const x = 14 + r() * (w - 28), y = 14 + r() * 8, rr = 7 + r() * 9; g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr * 0.78, 0, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(150,175,210,0.45)'; g.fillRect(0, 22, w, 14);
    return cv;
  };
  const clouds = [1, 2, 3, 4, 5, 6].map(s => mkCloud(s * 13));
  const cloudPos = (() => { const r = rngf(5), a = []; for (let i = 0; i < 12; i++) a.push([r(), r() * 0.42, i % 6, 0.3 + r() * 0.5]); return a; })();
  const BGLAYERS = {};
  const hillFn = (w, seed, base, amps) => { const r = rngf(seed), ph = amps.map(() => r() * 6.28); return x => base + amps.reduce((s, a, i) => s + a * Math.sin(2 * Math.PI * (i + 1 + (i > 1 ? i : 0)) * x / w + ph[i]), 0); };
  function mkBgLayer(kind, idx) {
    const w = 640, h = 220, cv = mkcv(w, h), g = ctx2(cv), seed = kind.length * 100 + idx * 17;
    const cols = {
      forest: [['#7fa3c4', '#93b4cf'], ['#3f7a52', '#4d8c5e'], ['#1f5a2a', '#2a7034']],
      desert: [['#d6b377', '#e4c48a'], ['#c99a4c', '#d8ac5e'], ['#b88236', '#cc9444']],
      snow: [['#a8bcd8', '#c4d4ea'], ['#58769a', '#6a88ac'], ['#2a5a56', '#366a64']],
      corrupt: [['#4a3a70', '#5a4a86'], ['#33264f', '#403060'], ['#201436', '#2a1a46']],
      ocean: [['#8aaccc', '#9ebcd8'], ['#6a94b8', '#7ea4c6'], ['#4a7aa6', '#5c8cb6']]
    }[kind] || [['#7fa3c4', '#93b4cf'], ['#3f7a52', '#4d8c5e'], ['#1f5a2a', '#2a7034']];
    const amps = [[16, 9, 4], [14, 8, 3], [12, 7, 3]][idx];
    const fn = hillFn(w, seed, [96, 130, 160][idx], amps);
    const r = rngf(seed + 5);
    const gr = g.createLinearGradient(0, 40, 0, h);
    gr.addColorStop(0, cols[idx][1]); gr.addColorStop(1, cols[idx][0]);
    g.fillStyle = gr;
    for (let x = 0; x < w; x++) {
      let y = fn(x);
      if (kind === 'corrupt') y -= Math.abs(Math.sin(x * 0.11 + seed)) ** 6 * 26 * (idx + 1) * 0.5;
      if (kind === 'snow' && idx === 0) y -= Math.abs(Math.sin(x * 0.02 + seed)) ** 3 * 34;
      g.fillRect(x, Math.floor(y), 1, h - y);
      if (kind === 'snow' && idx === 0 && y < 90) { g.fillStyle = '#f2f8ff'; g.fillRect(x, Math.floor(y), 1, 6 + (90 - y) * 0.2); g.fillStyle = gr; }
    }
    if (idx >= 1) {
      for (let x = 6; x < w; x += 7 + (r() * 10 | 0)) {
        const y = fn(x);
        if (kind === 'forest') { g.fillStyle = idx === 2 ? '#174a20' : '#356a48'; g.beginPath(); g.ellipse(x, y - 5 - r() * 4, 6 + r() * 3, 8 + r() * 3, 0, 0, 7); g.fill(); g.fillRect(x - 1, y - 3, 2, 6); }
        else if (kind === 'snow') { g.fillStyle = idx === 2 ? '#1c4a48' : '#46688a'; const hh = 14 + r() * 12; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x, y - hh); g.lineTo(x + 6, y); g.fill(); g.fillStyle = '#e8f2ff'; g.fillRect(x - 1, y - hh, 2, 2); }
        else if (kind === 'corrupt') { g.fillStyle = idx === 2 ? '#150c26' : '#241838'; const hh = 12 + r() * 20; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + (r() - 0.5) * 4, y - hh); g.lineTo(x + 3, y); g.fill(); }
        else if (kind === 'desert') { if (r() < 0.35) { g.fillStyle = idx === 2 ? '#6a8a36' : '#8a9a48'; const hh = 10 + r() * 8; g.fillRect(x - 1, y - hh, 3, hh); g.fillRect(x - 4, y - hh * 0.6, 3, 2); g.fillRect(x - 4, y - hh * 0.6 - 4, 2, 5); } }
        g.fillStyle = gr;
      }
    }
    return cv;
  }
  const bgLayer = (kind, idx) => { const k = kind + idx; return BGLAYERS[k] || (BGLAYERS[k] = mkBgLayer(kind, idx)); };
  const BGKIND = ['forest', 'desert', 'snow', 'corrupt', 'ocean', 'forest'];
  const HELLGRAD = ['#1c0a0a', '#4a1408', '#8a2a0c'];
  function drawSky(g, BW, BH, camX, camY, surfPx, tod, day, bgB, mph, tmr) {
    const [top, bot] = skyAt(day, tod);
    const horizon = clamp(surfPx - camY, -400, BH + 400);
    const gr = g.createLinearGradient(0, 0, 0, Math.max(BH, horizon + 80));
    gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
    const dayness = day ? 1 : 0;
    const f = day ? tod / DAYLEN : tod / NIGHTLEN;
    const starA = day ? clamp(1 - Math.min(f, 1 - f) * 12, 0, 1) * 0.0 + clamp((0.12 - Math.min(f, 1 - f)) * 3, 0, 0.5) * (f < 0.5 ? (f < 0.06 ? 1 : 0) : (f > 0.94 ? 1 : 0)) : clamp(Math.min(f, 1 - f) * 8, 0, 1);
    if (starA > 0.02) {
      const hor = clamp(horizon, 0, BH);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const sx = (s[0] * BW * 1.2 - camX * 0.02 + BW * 4) % (BW * 1.2) - BW * 0.1, sy = s[1] * Math.min(hor, BH * 0.9) - camY * 0.02 + 8;
        if (sy < 0 || sy > hor) continue;
        const tw = 0.6 + 0.4 * Math.sin(tmr * 0.04 * (0.5 + s[2]) + s[3]);
        g.fillStyle = 'rgba(255,255,255,' + (starA * s[2] * tw).toFixed(3) + ')';
        g.fillRect(Math.floor(sx), Math.floor(sy), s[4], s[4]);
      }
    }
    const arcW = BW * 0.9, arcH = Math.min(horizon, BH) * 0.72 + 30;
    const fx = day ? tod / DAYLEN : tod / NIGHTLEN;
    const bx = BW * 0.05 + arcW * fx, by = horizon - 40 - Math.sin(fx * Math.PI) * arcH - camY * 0.0;
    if (day) { g.drawImage(sunImg, Math.round(bx - 32), Math.round(by - 32)); }
    else {
      g.drawImage(moonImg, Math.round(bx - 20), Math.round(by - 20));
      if (mph) { g.fillStyle = 'rgba(8,10,28,' + (mph === 4 ? 0.0 : 0.82) + ')'; g.save(); g.beginPath(); g.arc(bx, by, 13, 0, 7); g.clip(); g.fillRect(bx - 14 + (mph - 4) * 5, by - 14, 28, 28); g.restore(); }
    }
    const cA = day ? 1 : 0.18;
    for (let i = 0; i < cloudPos.length; i++) {
      const c = cloudPos[i], im = clouds[c[2]];
      const cx = ((c[0] * (BW + 400) + tmr * c[3] * 0.1 - camX * 0.06) % (BW + 400) + (BW + 400)) % (BW + 400) - 200, cy = c[1] * Math.max(60, Math.min(horizon, BH)) * 0.9 - camY * 0.04 + 14;
      if (cy < -40 || cy > horizon) continue;
      g.globalAlpha = cA * (bgB === 3 ? 0.35 : 1);
      g.drawImage(im, Math.round(cx), Math.round(cy));
    }
    g.globalAlpha = 1;
  }
  function drawBgLayers(g, BW, BH, camX, camY, surfPx, kind, alpha, dark) {
    if (alpha <= 0.01) return;
    g.globalAlpha = alpha;
    for (let i = 0; i < 3; i++) {
      const L = bgLayer(kind, i), f = [0.08, 0.17, 0.3][i];
      const ox = -Math.floor((camX * f) % L.width), y = Math.round(surfPx - camY - [190, 150, 118][i] + camY * 0 - (camY - surfPx) * [0.04, 0.07, 0.1][i] * 0);
      if (y > BH || y + L.height < 0) continue;
      for (let x = ox - L.width; x < BW; x += L.width) { if (x + L.width < 0) continue; g.drawImage(L, x, y); }
      if (y + L.height < BH) { g.fillStyle = [i === 0 ? '#9ebcd8' : i === 1 ? '#3f7a52' : '#1f5a2a'][0]; }
    }
    g.globalAlpha = 1;
  }
  const SIZES = { small: [2400, 800, 'Small'], medium: [3600, 1000, 'Medium'], large: [4800, 1200, 'Large'] };
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const WORLDMSG = ['Generating world terrain', 'Adding sand', 'Generating hills', 'Digging caves', 'Placing dirt in rock', 'Planting ores', 'Growing mushroom biome', 'Corrupting the world', 'Adding gems', 'Making the world dirty', 'Filling lakes', 'Planting trees', 'Spreading grass', 'Placing chests', 'Planting life crystals', 'Heating the underworld', 'Smoothing the world', 'Settling liquids'];
  function newWorld(w, h, name, seed, sizeKey) {
    const n = w * h;
    return {
      id: '', name, seed, size: sizeKey, w, h, t: new Uint8Array(n), wl: new Uint8Array(n), lq: new Uint8Array(n), fl: new Uint8Array(n), fr: new Uint8Array(n),
      top: new Int16Array(w), surf: new Int16Array(w), bio: new Uint8Array(w), tod: 13500, day: true, days: 0, moon: 0, chests: new Map(), npcs: [],
      flags: { orbs: 0, kingSlime: 0, eoc: 0, eow: 0, merchant: 0, guideDead: 0, mushX: 0, mushY: 0 },
      surfBase: Math.round(h * 0.28), rockY: Math.round(h * 0.40), hellY: Math.round(h * 0.84), spaceY: Math.round(h * 0.07), spawnX: w >> 1, spawnY: 0, created: Date.now(), played: 0
    };
  }
  async function genWorld(w, h, name, seed, sizeKey, prog) {
    const Wd = newWorld(w, h, name, seed, sizeKey);
    const { t, wl, lq, fl, fr, surf, bio } = Wd;
    const { surfBase, rockY, hellY } = Wd;
    const rnd = rngf(seed), nz = mkNoise(seed), nc = mkNoise(seed + 11), nb = mkNoise(seed + 23);
    let last = now();
    const slice = async () => { if (now() - last > 40) { await new Promise(r => setTimeout(r, 0)); last = now(); } };
    const P = async (i, f = 0) => { prog(WORLDMSG[i], (i + f) / WORLDMSG.length); await new Promise(r => setTimeout(r, 0)); last = now(); };
    const ix = (x, y) => y * w + x;
    const rint = (a, b) => a + (rnd() * (b - a + 1) | 0);
    await P(0);
    const flip = rnd() < 0.5, desertLeft = rnd() < 0.5;
    const seaY = surfBase + 4;
    const cx = w >> 1;
    const ow = Math.round(w * 0.07);
    for (let x = 0; x < w; x++) {
      let f = x / w + nz.n1(x / 70 + 300) * 0.012;
      if (flip) f = 1 - f;
      let b = BIOME.FOREST;
      if (f < 0.07 || f > 0.93) b = BIOME.OCEAN;
      else if (f < 0.20) b = desertLeft ? BIOME.DESERT : BIOME.SNOW;
      else if (f >= 0.32 && f < 0.43) b = BIOME.CORRUPT;
      else if (f >= 0.70) b = desertLeft ? BIOME.SNOW : BIOME.DESERT;
      bio[x] = b;
    }
    const hg = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      let base = surfBase + nz.f1(x / 260 + 3, 4) * 34 + nz.f1(x / 55 + 9, 3) * 6 - Math.max(0, nz.f1(x / 420 + 700, 3)) * 36;
      const b = bio[x];
      if (b === BIOME.DESERT) base = surfBase + 3 + nz.f1(x / 90 + 20, 3) * 10;
      else if (b === BIOME.SNOW) base += nz.f1(x / 120 + 40, 4) * 12;
      else if (b === BIOME.CORRUPT) base += nz.f1(x / 17 + 60, 3) * 14;
      hg[x] = base;
    }
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, w - 1 - x), t_ = clamp(d / (ow * 1.25), 0, 1);
      hg[x] = lerp(seaY + 46, hg[x], sstep(0.3, 1, t_));
      hg[x] = lerp(hg[x], Math.min(hg[x], seaY - 3), sstep(ow * 0.85, ow * 1.15, d));
    }
    let sh = 0; for (let x = cx - 8; x <= cx + 8; x++) sh += hg[x]; sh /= 17;
    for (let x = cx - 70; x <= cx + 70; x++) { const k = sstep(70, 22, Math.abs(x - cx)); hg[x] = lerp(hg[x], sh, k); }
    for (let pass = 0; pass < 2; pass++) { const c = Float32Array.from(hg); for (let x = 2; x < w - 2; x++) hg[x] = (c[x - 2] + c[x - 1] * 2 + c[x] * 3 + c[x + 1] * 2 + c[x + 2]) / 9; }
    for (let x = 0; x < w; x++) surf[x] = Math.round(hg[x]);
    await P(1);
    const dirtBot = new Int16Array(w);
    for (let x = 0; x < w; x++) dirtBot[x] = rockY + Math.round(nz.f1(x / 40 + 80, 3) * 14);
    for (let x = 0; x < w; x++) {
      const s = surf[x], b0 = bio[x], db = dirtBot[x];
      for (let y = s; y < hellY; y++) {
        const i = ix(x, y), d = y - s;
        const b = d > 14 ? bio[clamp(x + Math.round(nb.n1(y / 26 + 7) * 9), 0, w - 1)] : b0;
        let tt;
        const pk = nz.f2(x / 15 + 7, y / 15 + 3, 2);
        if (b === BIOME.DESERT) {
          if (d < 52 + nz.n1(x / 20) * 8) tt = T.SAND; else if (d < 90 && y < rockY + 10) tt = pk > 0.1 ? T.SANDSTONE : T.SAND; else tt = pk > 0.35 ? T.SANDSTONE : T.STONE;
          if (y > rockY + 10 && d >= 52) tt = T.STONE;
        } else if (b === BIOME.OCEAN) {
          tt = d < 22 ? T.SAND : (d < 34 ? (pk > 0 ? T.SANDSTONE : T.SAND) : (y < db ? (pk > 0.3 ? T.STONE : T.DIRT) : T.STONE));
        } else if (b === BIOME.SNOW) {
          if (d < 3) tt = T.SNOWGRASS; else if (d < 10) tt = T.SNOW; else if (y < db + 25) tt = pk > 0.15 ? T.ICE : T.SNOW; else tt = pk > 0.3 ? T.ICE : T.STONE;
          if (y > db + 25 && pk < -0.3) tt = T.SNOW;
        } else if (b === BIOME.CORRUPT) {
          if (y < db) tt = d < 1 ? T.CGRASS : (pk > 0.28 ? T.EBONSTONE : T.DIRT); else tt = pk < -0.45 ? T.DIRT : T.EBONSTONE;
        } else {
          if (y < db) { tt = d > 5 && pk > 0.34 + (d < 14 ? 0.16 : 0) ? T.STONE : T.DIRT; } else { tt = pk < -0.38 ? T.DIRT : T.STONE; }
          const cl = nz.f2(x / 9 + 30, y / 9 + 30, 2);
          if (cl > 0.46 && y < db && d > 4) tt = T.CLAY;
        }
        t[i] = tt;
        const wallStart = 3 + (nz.n1(x / 8 + 100) * 2.4 | 0);
        if (d >= wallStart) wl[i] = b === BIOME.DESERT ? WL.SAND : b === BIOME.SNOW ? WL.ICE : b === BIOME.CORRUPT ? WL.EBON : (y < db ? WL.DIRT : WL.STONE);
      }
      if (x % 160 === 0) await slice();
    }
    await P(2);
    const sw = Math.round(w / 40);
    const digWorm = (x0, y0, len, rmin, rmax, ang0, wob) => {
      let x = x0, y = y0, a = ang0;
      for (let i = 0; i < len; i++) {
        const r = rmin + (rmax - rmin) * (0.5 + 0.5 * Math.sin(i * 0.3 + x0));
        const R = Math.ceil(r);
        for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const xx = Math.round(x) + dx, yy = Math.round(y) + dy;
          if (xx < 3 || yy < 2 || xx >= w - 3 || yy >= hellY - 6) continue;
          const j = ix(xx, yy);
          const tid = t[j];
          if (tid === T.AIR || tid === T.BEDROCK) continue;
          t[j] = T.AIR;
        }
        a += (rnd() - 0.5) * wob;
        x += Math.cos(a) * 1.2; y += Math.sin(a) * 1.2;
      }
    };
    await P(3);
    for (let x = 4; x < w - 4; x++) {
      for (let y = surf[x] + 9; y < hellY - 6; y++) {
        const d = y - surf[x], df = clamp((y - surfBase) / (hellY - surfBase), 0, 1);
        const a = nc.f2(x * 0.016, y * 0.027, 2);
        const tun = 0.016 + 0.022 * df;
        let carve = Math.abs(a) < tun;
        if (!carve && y > rockY - 30) { const b2 = nc.f2(x * 0.02 + 50, y * 0.03 + 20, 2); if (b2 > 0.4 - 0.16 * df) carve = true; }
        if (carve && t[ix(x, y)] !== T.AIR) t[ix(x, y)] = T.AIR;
      }
      if (x % 40 === 0) await slice();
    }
    for (let i = 0; i < sw; i++) {
      const x = rint(ow + 10, w - ow - 10);
      if (Math.abs(x - cx) < 50) continue;
      digWorm(x, surf[x], rint(70, 200), 1.6, 3.4, Math.PI / 2 + (rnd() - 0.5) * 1.2, 0.7);
      if (i % 10 === 0) await slice();
    }
    for (let i = 0; i < sw * 2; i++) {
      const x = rint(10, w - 10), y = rint(rockY - 20, hellY - 40);
      digWorm(x, y, rint(60, 160), 1.4, 3, rnd() * 6.28, 1.0);
      if (i % 10 === 0) await slice();
    }
    await P(4);
    const corX = []; for (let x = 0; x < w; x++) if (bio[x] === BIOME.CORRUPT) corX.push(x);
    const cX0 = corX.length ? corX[0] : cx, cX1 = corX.length ? corX[corX.length - 1] : cx;
    const orbSpots = [], altarSpots = [];
    await P(7);
    const nchasm = Math.max(3, Math.round((cX1 - cX0) / 22));
    for (let c = 0; c < nchasm; c++) {
      const x0 = rint(cX0 + 6, cX1 - 6), wid = rint(3, 6), depth = rint(Math.round((rockY - surfBase) * 0.8), Math.round(h * 0.34));
      let x = x0;
      const y0 = surf[x0] - 2;
      for (let y = y0; y < y0 + depth + surfBase - 20 && y < hellY - 12; y++) {
        x += (rnd() - 0.5) * 1.4; x = clamp(x, x0 - 12, x0 + 12);
        const ww = wid * (0.75 + 0.5 * nz.n1(y / 7 + c * 30)) * (y - y0 < 12 ? 1.3 : 1);
        for (let dx = -Math.ceil(ww); dx <= Math.ceil(ww); dx++) {
          const xx = Math.round(x) + dx;
          if (Math.abs(dx) <= ww) { if (xx > 3 && xx < w - 3) { t[ix(xx, y)] = T.AIR; } }
          else if (Math.abs(dx) <= ww + 2 && xx > 3 && xx < w - 3) { const j = ix(xx, y); if (t[j] === T.DIRT || t[j] === T.STONE || t[j] === T.CLAY) t[j] = T.EBONSTONE; }
        }
        if (y > surf[x0] + 8) for (let dx = -Math.ceil(ww) - 2; dx <= Math.ceil(ww) + 2; dx++) { const xx = Math.round(x) + dx; if (xx > 3 && xx < w - 3) { const j = ix(xx, y); if (wl[j] === WL.DIRT || wl[j] === WL.STONE || wl[j] === 0) wl[j] = WL.EBON; } }
      }
      const by = y0 + depth + surfBase - 20 - 2;
      const room = rint(6, 10);
      for (let dy = -4; dy <= 2; dy++) for (let dx = -room; dx <= room; dx++) { const xx = Math.round(x) + dx, yy = by + dy; if (xx > 3 && xx < w - 3 && yy < hellY - 8 && (dx * dx) / (room * room) + (dy * dy) / 20 <= 1) { t[ix(xx, yy)] = T.AIR; wl[ix(xx, yy)] = WL.EBON; } }
      orbSpots.push([Math.round(x), by + 2]);
      if (c % 2 === 0) altarSpots.push([Math.round(x) + room - 3, by + 2]);
      await slice();
    }
    await P(5);
    const ore = (tile, count, y0, y1, rmin, rmax, xs) => {
      for (let k = 0; k < count; k++) {
        let x = xs ? xs[rnd() * xs.length | 0] : rint(6, w - 6), y = rint(Math.round(y0), Math.round(y1));
        const steps = rint(rmin * 3, rmax * 4);
        for (let s = 0; s < steps; s++) {
          const R = rnd() * (rmax - rmin) * 0.5 + rmin * 0.5 + 1;
          const xx = Math.round(x + (rnd() - 0.5) * R * 1.2), yy = Math.round(y + (rnd() - 0.5) * R * 1.2);
          if (xx < 3 || xx >= w - 3 || yy < 3 || yy >= h - 8) continue;
          const j = ix(xx, yy), tt = t[j];
          if (tt === T.STONE || tt === T.DIRT || tt === T.EBONSTONE || tt === T.ICE || tt === T.SANDSTONE || tt === T.ASH || tt === T.CLAY) t[j] = tile;
          x += (rnd() - 0.5) * 2; y += (rnd() - 0.5) * 2;
        }
      }
    };
    const area = w * h;
    ore(T.COPPER, Math.round(area / 5200), surfBase + 10, rockY + (hellY - rockY) * 0.55, 2, 4);
    ore(T.IRON, Math.round(area / 7000), surfBase + (rockY - surfBase) * 0.8, rockY + (hellY - rockY) * 0.8, 2, 4);
    await slice();
    ore(T.SILVER, Math.round(area / 9500), rockY + 10, hellY - 40, 2, 4);
    ore(T.GOLD, Math.round(area / 13000), rockY + (hellY - rockY) * 0.4, hellY - 30, 2, 4);
    ore(T.DEMONITE, Math.round(area / 16000), surfBase + 30, hellY - 70, 2, 4, corX);
    await P(8);
    const gemY = [[0.42, 0.56], [0.48, 0.63], [0.54, 0.7], [0.6, 0.75], [0.66, 0.8], [0.72, 0.83]];
    const airAdj = (x, y) => t[ix(x - 1, y)] === T.AIR || t[ix(x + 1, y)] === T.AIR || t[ix(x, y - 1)] === T.AIR || t[ix(x, y + 1)] === T.AIR;
    for (let g = 0; g < 6; g++) {
      const cnt = Math.round(area / 60000);
      for (let k = 0, tries = 0; k < cnt && tries < cnt * 60; tries++) {
        const x = rint(6, w - 6), y = rint(Math.round(h * gemY[g][0]), Math.round(h * gemY[g][1]));
        const tt = t[ix(x, y)];
        if ((tt === T.STONE || tt === T.ICE || tt === T.EBONSTONE) && airAdj(x, y)) {
          t[ix(x, y)] = T.AMETHYST + g;
          const n = rint(0, 3);
          for (let q = 0; q < n; q++) { const xx = x + rint(-1, 1), yy = y + rint(-1, 1); const t2 = t[ix(xx, yy)]; if (t2 === T.STONE || t2 === T.ICE) t[ix(xx, yy)] = T.AMETHYST + g; }
          k++;
        }
      }
    }
    await P(6);
    const mx = (() => { for (let k = 0; k < 40; k++) { const x = rint(Math.round(w * 0.22), Math.round(w * 0.78)); if (Math.abs(x - cx) > 140 && bio[x] === BIOME.FOREST) return x; } return Math.round(w * 0.3); })();
    const my = Math.round(rockY + (hellY - rockY) * 0.45), mrx = Math.round(w * 0.022 + 24), mry = 26;
    Wd.flags.mushX = mx; Wd.flags.mushY = my;
    for (let y = my - mry; y <= my + mry; y++) for (let x = mx - mrx; x <= mx + mrx; x++) {
      const d = ((x - mx) / mrx) ** 2 + ((y - my) / mry) ** 2 + nb.f2(x / 12, y / 12, 2) * 0.35;
      if (d > 1 || x < 4 || x >= w - 4) continue;
      const j = ix(x, y), cave = nc.f2(x / 14 + 9, y / 11 + 5, 2) > -0.1;
      if (cave && d < 0.78) t[j] = T.AIR; else if (t[j] !== T.AIR) t[j] = T.MUD;
      wl[j] = WL.MUSH;
    }
    await P(9);
    const poolFill = (sx, sy, rise, lava, limit, open) => {
      const L = sy - rise;
      const seen = new Map(), st = [[sx, sy]];
      seen.set(sy * w + sx, 1);
      while (st.length) {
        const [x, y] = st.pop();
        if (seen.size > limit) return false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx, yy = y + dy;
          if (yy < L || xx < 2 || xx >= w - 2 || yy >= h - 4) continue;
          const j = yy * w + xx;
          if (seen.has(j) || t[j] !== T.AIR) continue;
          if (!open && wl[j] === 0 && yy < rockY) return false;
          seen.set(j, 1); st.push([xx, yy]);
        }
      }
      for (const j of seen.keys()) { lq[j] = 255; fl[j] = lava ? 1 : 0; }
      return true;
    };
    for (let k = 0, tries = 0; k < Math.round(area / 22000) && tries < 800; tries++) {
      const x = rint(10, w - 10), y = rint(rockY - 10, Math.round(h * 0.7));
      if (t[ix(x, y)] === T.AIR && t[ix(x, y + 1)] !== T.AIR && lq[ix(x, y)] === 0) { if (poolFill(x, y, rint(2, 7), false, 420)) k++; }
    }
    for (let k = 0, tries = 0; k < Math.round(area / 12000) && tries < 1500; tries++) {
      const x = rint(10, w - 10), y = rint(Math.round(h * 0.66), hellY - 6);
      if (t[ix(x, y)] === T.AIR && t[ix(x, y + 1)] !== T.AIR && lq[ix(x, y)] === 0) { if (poolFill(x, y, rint(2, 8), true, 520)) k++; }
    }
    for (let k = 0, tries = 0; k < Math.round(w / 60) && tries < 400; tries++) {
      const x = rint(ow + 20, w - ow - 20);
      if (Math.abs(x - cx) < 70 || bio[x] === BIOME.CORRUPT || bio[x] === BIOME.DESERT) continue;
      const y = surf[x] - 1;
      if (poolFill(x, y, rint(2, 5), false, 500, true)) k++;
    }
    for (let x = 0; x < w; x++) {
      if (hg[x] > seaY && (x < ow * 1.05 || x > w - 1 - ow * 1.05)) { for (let y = seaY; y < surf[x]; y++) { const j = ix(x, y); if (t[j] === T.AIR) lq[j] = 255; } }
    }
    await P(10);
    for (let y = hellY; y < h; y++) {
      const dd = (y - hellY) / (h - hellY);
      for (let x = 0; x < w; x++) {
        const j = ix(x, y);
        const u = nc.f2(x / 24 + 5, y / 11 + 9, 3);
        const open = u > 0.1 - dd * 0.62;
        t[j] = open ? T.AIR : T.ASH;
        wl[j] = WL.HELL;
        if (open && dd > 0.58) { lq[j] = 255; fl[j] = 1; }
      }
      if (y % 8 === 0) await slice();
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) { t[ix(x, h - 1 - k)] = T.BEDROCK; wl[ix(x, h - 1 - k)] = WL.HELL; lq[ix(x, h - 1 - k)] = 0; }
    for (let x = 0; x < w; x++) { const y = hellY - 1 - (nz.n1(x / 9 + 500) * 3 | 0); for (let yy = y; yy < hellY + 4; yy++) if (t[ix(x, yy)] !== T.AIR && t[ix(x, yy)] !== T.ASH) t[ix(x, yy)] = T.ASH; }
    ore(T.HELLSTONE, Math.round(area / 7000), hellY + 8, h - 6, 2, 4);
    await P(11);
    const free = (x, y) => t[ix(x, y)] === T.AIR && lq[ix(x, y)] === 0;
    const isGround = tt => tt === T.DIRT || tt === T.STONE || tt === T.GRASS || tt === T.SAND || tt === T.SNOWGRASS || tt === T.CGRASS || tt === T.SNOW || tt === T.ICE || tt === T.EBONSTONE || tt === T.SANDSTONE || tt === T.MUD || tt === T.MGRASS || tt === T.CLAY || tt === T.GRAYBRICK || tt === T.ASH || tt === T.OBSIDIAN || tt === T.WOOD || tt === T.GLASS;
    for (let x = 4; x < w - 4; x++) {
      const s = surf[x], b = bio[x];
      const j = ix(x, s);
      if (t[j] === T.DIRT && b !== BIOME.OCEAN && b !== BIOME.DESERT && b !== BIOME.SNOW && b !== BIOME.CORRUPT) t[j] = T.GRASS;
      if (b === BIOME.FOREST && t[j] === T.DIRT) t[j] = T.GRASS;
    }
    for (let x = 4; x < w - 4; x++) {
      for (let y = Math.max(8, surf[x] - 6); y < Math.min(hellY, surf[x] + 40); y++) {
        const j = ix(x, y);
        if (t[j] === T.DIRT && t[j - w] === T.AIR && wl[j - w] === 0 && lq[j - w] === 0) {
          const b = bio[x];
          if (b === BIOME.FOREST) t[j] = T.GRASS; else if (b === BIOME.CORRUPT) t[j] = T.CGRASS;
        }
      }
    }
    await P(12);
    const growTree = (x, y, kind) => {
      const ht = kind === 'corrupt' ? rint(5, 9) : kind === 'palm' ? rint(8, 14) : rint(7, 16);
      for (let k = 1; k <= ht + 2; k++) if (t[ix(x, y - k)] !== T.AIR || lq[ix(x, y - k)] !== 0) return false;
      for (let k = 1; k <= ht; k++) {
        const j = ix(x, y - k);
        t[j] = T.TREE;
        let br = 0;
        if (kind !== 'palm' && k > 2 && k < ht - 1) { if (rnd() < 0.22) br |= 1; if (rnd() < 0.22) br |= 2; }
        fr[j] = br;
      }
      return true;
    };
    for (let x = 6; x < w - 6; x++) {
      const s = surf[x], j = ix(x, s), b = bio[x], tt = t[j];
      if (lq[ix(x, s - 1)] !== 0 || t[ix(x, s - 1)] !== T.AIR) continue;
      if (Math.abs(x - cx) < 6) { if (tt === T.GRASS && rnd() < 0.4) t[ix(x, s - 1)] = T.TGRASS; continue; }
      if ((tt === T.GRASS || tt === T.SNOWGRASS || tt === T.CGRASS) && rnd() < (tt === T.CGRASS ? 0.07 : 0.14)) {
        let ok = true; for (let q = 1; q <= 3; q++) if (x - q >= 0 && t[ix(x - q, s - 1)] === T.TREE) ok = false;
        if (ok && t[ix(x - 1, surf[x - 1])] !== T.AIR && growTree(x, s, tt === T.GRASS ? 'forest' : tt === T.SNOWGRASS ? 'snow' : 'corrupt')) { x += 2; continue; }
      }
      if (tt === T.SAND && b === BIOME.OCEAN && rnd() < 0.05 && lq[ix(x, s - 1)] === 0 && surf[x] <= seaY + 2) { if (growTree(x, s, 'palm')) { x += 3; continue; } }
      if (tt === T.SAND && b === BIOME.DESERT && rnd() < 0.07) {
        const ht = rint(2, 6); let ok = true;
        for (let k = 1; k <= ht; k++) if (t[ix(x, s - k)] !== T.AIR || t[ix(x - 1, s - k)] === T.CACTUS || t[ix(x + 1, s - k)] === T.CACTUS) ok = false;
        if (ok) { for (let k = 1; k <= ht; k++) t[ix(x, s - k)] = T.CACTUS; x += 2; continue; }
      }
      if (tt === T.GRASS) { const r = rnd(); if (r < 0.4) t[ix(x, s - 1)] = T.TGRASS; else if (r < 0.46) { t[ix(x, s - 1)] = T.FLOWER; fr[ix(x, s - 1)] = rint(0, 3); } else if (r < 0.475) t[ix(x, s - 1)] = T.MUSH; }
      if (tt === T.CGRASS && rnd() < 0.2) t[ix(x, s - 1)] = T.CTHORN;
    }
    await P(13);
    for (let x = 4; x < w - 4; x++) {
      const y0 = surf[x];
      for (let y = y0 + 1; y < hellY - 2; y++) {
        if (rnd() > 0.04) continue;
        const j = ix(x, y);
        if (t[j] === T.GRASS && t[j + w] === T.AIR && wl[j + w] === 0) { const len = rint(2, 8); for (let k = 1; k <= len && t[ix(x, y + k)] === T.AIR; k++) { t[ix(x, y + k)] = T.VINE; fr[ix(x, y + k)] = k % 3; } }
      }
    }
    for (let x = 4; x < w - 4; x++) {
      for (let y = Math.round(my - mry); y <= my + mry; y++) {
        const j = ix(x, y);
        if (t[j] === T.MUD && t[j - w] === T.AIR && lq[j - w] === 0) {
          t[j] = T.MGRASS;
          const r = rnd();
          if (r < 0.2) t[j - w] = T.GMUSH;
          else if (r < 0.26) {
            const ht = rint(5, 10);
            let ok = true; for (let k = 1; k <= ht; k++) if (t[ix(x, y - k)] !== T.AIR) ok = false;
            if (ok) for (let k = 1; k <= ht; k++) { t[ix(x, y - k)] = T.MUSHTREE; }
          }
        } else if (t[j] === T.MUD && t[j + w] === T.AIR && wl[j] === WL.MUSH) t[j] = T.MGRASS;
      }
    }
    const loot = (y) => {
      const f = (y - surfBase) / (hellY - surfBase), it_ = [];
      const add = (id, a, b) => it_.push({ id, n: rint(a, b) });
      const pick = arr => arr[rnd() * arr.length | 0];
      if (f < 0.4) { add(pick(['torch', 'rope', 'woodenArrow', 'wood']), 6, 20); add(pick(['copperBar', 'ironBar', 'lesserHeal', 'glowMush']), 2, 6); add('cu', 20, 99); add('ag', 1, 6); if (rnd() < 0.3) add('lesserMana', 1, 3); }
      else if (f < 0.75) { add(pick(['torch', 'woodenArrow', 'flamingArrow', 'rope']), 10, 40); add(pick(['ironBar', 'silverBar', 'lesserHeal', 'goldBar']), 3, 8); add('ag', 8, 40); add(pick(['lesserHeal', 'lesserMana', 'glowMush']), 2, 5); if (rnd() < 0.18) add(pick(['cloudBottle', 'horseshoe', 'hermes', 'magicMirror', 'bandRegen']), 1, 1); }
      else { add(pick(['flamingArrow', 'torch', 'unholyArrow']), 15, 50); add(pick(['goldBar', 'silverBar', 'healPotion', 'demoniteBar']), 4, 10); add('ag', 20, 90); add('au', 1, 3); add(pick(['healPotion', 'lesserMana']), 2, 6); if (rnd() < 0.32) add(pick(['cloudBottle', 'horseshoe', 'hermes', 'balloon', 'bandRegen', 'bandStar', 'magicMirror']), 1, 1); }
      const inv = new Array(40).fill(null);
      let k = 0; it_.forEach(o => { if (IT[o.id]) inv[k++] = o; });
      return inv;
    };
    const placeObj = (x, y, tid) => {
      const d = TD[tid], ow_ = d.ob[0], oh = d.ob[1];
      for (let dy = 0; dy < oh; dy++) for (let dx = 0; dx < ow_; dx++) { const j = ix(x + dx, y + dy); t[j] = tid; fr[j] = dx | dy << 4; }
    };
    const placeChest = (x, y) => { placeObj(x, y, T.CHEST); Wd.chests.set(y * w + x, { x, y, items: loot(y) }); };
    await P(14);
    const nch = Math.round(w / 34);
    for (let k = 0, tries = 0; k < nch && tries < nch * 100; tries++) {
      const x = rint(8, w - 10), y = rint(Math.round(surfBase + 30), hellY - 16);
      if (free(x, y) && free(x + 1, y) && free(x, y + 1) && free(x + 1, y + 1) && isGround(t[ix(x, y + 2)]) && isGround(t[ix(x + 1, y + 2)]) && t[ix(x, y + 2)] !== T.ASH) { placeChest(x, y); k++; }
    }
    const ncr = Math.round(w / 90);
    await P(15);
    for (let k = 0, tries = 0; k < ncr && tries < ncr * 150; tries++) {
      const x = rint(8, w - 10), y = rint(Math.round(rockY - 30), hellY - 16);
      if (free(x, y) && free(x + 1, y) && free(x, y + 1) && free(x + 1, y + 1) && isGround(t[ix(x, y + 2)]) && isGround(t[ix(x + 1, y + 2)]) && t[ix(x, y + 2)] !== T.ASH) { placeObj(x, y, T.CRYSTAL); k++; }
    }
    orbSpots.forEach(([x, y]) => { for (let k = 0; k < 14; k++) { if (free(x, y) && free(x + 1, y) && free(x, y - 1) && free(x + 1, y - 1) && isGround(t[ix(x, y + 1)]) && isGround(t[ix(x + 1, y + 1)])) { placeObj(x, y - 1, T.ORB); return; } y++; } });
    altarSpots.forEach(([x, y]) => { for (let k = 0; k < 14; k++) { if (free(x, y) && free(x + 1, y) && free(x + 2, y) && free(x, y - 1) && free(x + 1, y - 1) && free(x + 2, y - 1) && isGround(t[ix(x, y + 1)]) && isGround(t[ix(x + 1, y + 1)]) && isGround(t[ix(x + 2, y + 1)])) { placeObj(x, y - 1, T.ALTAR); return; } y++; } });
    await P(16);
    let sy = 0; for (let y = 0; y < h; y++) { if (t[ix(cx, y)] !== T.AIR && !PLANT[t[ix(cx, y)]] && t[ix(cx, y)] !== T.TREE) { sy = y; break; } }
    Wd.spawnX = cx; Wd.spawnY = sy - 3;
    for (let x = 0; x < w; x++) { let y = 0; while (y < h && t[ix(x, y)] === T.AIR && wl[ix(x, y)] === 0) y++; Wd.top[x] = y; }
    await P(17);
    Wd.npcs.push({ k: 'guide', x: cx * 16, y: (sy - 3) * 16, home: null });
    return Wd;
  }
  let G = null, W = null;
  const gt = (x, y) => y < 0 ? T.AIR : (x < 0 || x >= W.w || y >= W.h) ? T.BEDROCK : W.t[y * W.w + x];
  const gwl = (x, y) => (x < 0 || y < 0 || x >= W.w || y >= W.h) ? 0 : W.wl[y * W.w + x];
  const glq = (x, y) => (x < 0 || y < 0 || x >= W.w || y >= W.h) ? 0 : W.lq[y * W.w + x];
  const solidAt = (x, y) => SOLID[gt(x, y)] === 1;
  const chunks = new Map();
  let chunkTick = 0;
  const ckey = (cx, cy) => cy * 4096 + cx;
  function dirtyChunk(cx, cy) { const c = chunks.get(ckey(cx, cy)); if (c) c.dirty = true; }
  function dirtyTile(x, y) {
    const cx = x >> 4, cy = y >> 4, lx = x & 15, ly = y & 15;
    dirtyChunk(cx, cy);
    if (lx === 0) dirtyChunk(cx - 1, cy); else if (lx === 15) dirtyChunk(cx + 1, cy);
    if (ly === 0) dirtyChunk(cx, cy - 1); else if (ly === 15) dirtyChunk(cx, cy + 1);
  }
  function clearChunks() { chunks.clear(); }
  const wallConn = (x, y) => gwl(x, y) !== 0 || x < 0 || x >= W.w || y >= W.h;
  function drawCell(g, x, y, px, py) {
    const i = y * W.w + x, tt = W.t[i], wv = W.wl[i];
    const v = (hash2(x, y, 5) * 3) | 0;
    if (wv) {
      const m = (wallConn(x, y - 1) ? 1 : 0) | (wallConn(x, y + 1) ? 2 : 0) | (wallConn(x - 1, y) ? 4 : 0) | (wallConn(x + 1, y) ? 8 : 0);
      g.drawImage(wallStrip(wv), m * 16, (v & 1) * 16, 16, 16, px, py, 16, 16);
    } else if (tt === T.AIR || !SOLID[tt]) {
      if (y > W.surf[x] + 6 && y < W.hellY) g.drawImage(voidStrip, v * 16, 0, 16, 16, px, py, 16, 16);
      else if (y >= W.hellY && y < W.h) { g.fillStyle = '#1a0808'; g.fillRect(px, py, 16, 16); }
    }
    if (tt === T.AIR) return;
    const d = TD[tt];
    if (d.ter || tt === T.GLASS) {
      const m = (TER[gt(x, y - 1)] ? 1 : 0) | (TER[gt(x, y + 1)] ? 2 : 0) | (TER[gt(x - 1, y)] ? 4 : 0) | (TER[gt(x + 1, y)] ? 8 : 0);
      g.drawImage(tileStrip(tt), m * 16, v * 16, 16, 16, px, py, 16, 16);
    } else if (d.ob) {
      const f = W.fr[i];
      g.drawImage(objCanvas(tt), (f & 15) * 16, (f >> 4) * 16, 16, 16, px, py, 16, 16);
    } else if (tt === T.PLATFORM) g.drawImage(tileStrip(tt), 0, v * 16, 16, 16, px, py, 16, 16);
    else if (tt === T.TREE || tt === T.CACTUS) g.drawImage(tileStrip(tt), 0, v * 16, 16, 16, px, py, 16, 16);
    else if (tt === T.FLOWER) g.drawImage(smallTile(tt, W.fr[i] & 3), px, py);
    else if (tt === T.TGRASS || tt === T.VINE) g.drawImage(smallTile(tt, v), px, py);
    else if (tt === T.SAPLING || tt === T.TORCH || tt === T.ROPE || tt === T.MUSH || tt === T.GMUSH || tt === T.CTHORN || tt === T.MUSHTREE) g.drawImage(smallTile(tt, 0), px, py);
  }
  function renderChunk(cx, cy, c) {
    const g = c.g;
    g.clearRect(0, 0, 256, 256);
    const x0 = cx * 16, y0 = cy * 16;
    for (let ly = 0; ly < 16; ly++) {
      const y = y0 + ly;
      if (y >= W.h) break;
      for (let lx = 0; lx < 16; lx++) { const x = x0 + lx; if (x >= W.w) break; drawCell(g, x, y, lx * 16, ly * 16); }
    }
    c.dirty = false;
  }
  function getChunk(cx, cy) {
    const k = ckey(cx, cy);
    let c = chunks.get(k);
    if (!c) { const cv = mkcv(256, 256); c = { cv, g: ctx2(cv), dirty: true, used: 0 }; chunks.set(k, c); }
    if (c.dirty) renderChunk(cx, cy, c);
    c.used = chunkTick;
    return c;
  }
  function pruneChunks() {
    if (chunks.size < 140) return;
    const arr = [...chunks.entries()].sort((a, b) => a[1].used - b[1].used);
    for (let i = 0; i < arr.length - 100; i++) chunks.delete(arr[i][0]);
  }
  function drawChunks(g, camX, camY, BW, BH) {
    chunkTick++;
    const cx0 = Math.max(0, Math.floor(camX / 256)), cy0 = Math.max(0, Math.floor(camY / 256));
    const cx1 = Math.min((W.w - 1) >> 4, Math.floor((camX + BW) / 256)), cy1 = Math.min((W.h - 1) >> 4, Math.floor((camY + BH) / 256));
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) g.drawImage(getChunk(cx, cy).cv, cx * 256 - camX, cy * 256 - camY);
    if ((chunkTick & 63) === 0) pruneChunks();
  }
  function drawLiquids(g, camX, camY, BW, BH, tmr) {
    const tx0 = Math.max(0, camX >> 4), ty0 = Math.max(0, camY >> 4), tx1 = Math.min(W.w - 1, (camX + BW) >> 4), ty1 = Math.min(W.h - 1, (camY + BH) >> 4);
    const w = W.w;
    for (let y = ty0; y <= ty1; y++) {
      for (let x = tx0; x <= tx1; x++) {
        const i = y * w + x, a = W.lq[i];
        if (!a) continue;
        const lava = W.fl[i] & 1;
        const above = y > 0 ? W.lq[i - w] : 0;
        const px = x * 16 - camX, py = y * 16 - camY;
        let h = above ? 16 : Math.max(3, Math.ceil(a / 255 * 16));
        if (!above && W.t[i] !== T.AIR && SOLID[W.t[i]]) continue;
        if (lava) {
          g.fillStyle = 'rgba(255,96,22,0.95)'; g.fillRect(px, py + 16 - h, 16, h);
          g.fillStyle = 'rgba(255,200,70,0.9)'; if (!above) g.fillRect(px, py + 16 - h, 16, 2);
          if (((x * 7 + y * 3 + (tmr >> 4)) & 7) === 0) { g.fillStyle = 'rgba(255,230,120,0.8)'; g.fillRect(px + 4, py + 16 - h + 4, 3, 1); }
        } else {
          g.fillStyle = 'rgba(46,112,232,0.58)'; g.fillRect(px, py + 16 - h, 16, h);
          if (!above) {
            const wv = Math.round(Math.sin(tmr * 0.06 + x * 0.9) * 0.9);
            g.fillStyle = 'rgba(190,225,255,0.7)'; g.fillRect(px, py + 16 - h + wv, 16, 1);
            g.fillStyle = 'rgba(120,180,255,0.35)'; g.fillRect(px, py + 17 - h + wv, 16, 1);
          } else if (((x * 5 + y * 11 + (tmr >> 5)) & 15) === 0) { g.fillStyle = 'rgba(190,225,255,0.3)'; g.fillRect(px + 5, py + 7, 4, 1); }
        }
      }
    }
  }
  const treeKindAt = (x, y) => { let yy = y; while (gt(x, yy) === T.TREE) yy++; const b = gt(x, yy); return b === T.SNOWGRASS || b === T.SNOW || b === T.ICE ? 'snow' : b === T.CGRASS || b === T.EBONSTONE ? 'corrupt' : b === T.SAND ? 'palm' : 'forest'; };
  function drawDecor(g, camX, camY, BW, BH, tmr) {
    const tx0 = Math.max(0, (camX >> 4) - 5), ty0 = Math.max(0, (camY >> 4) - 6), tx1 = Math.min(W.w - 1, ((camX + BW) >> 4) + 5), ty1 = Math.min(W.h - 1, ((camY + BH) >> 4) + 4);
    const w = W.w;
    for (let y = ty0; y <= ty1; y++) {
      for (let x = tx0; x <= tx1; x++) {
        const tt = W.t[y * w + x];
        if (tt === T.TREE) {
          const sway = Math.round(Math.sin(tmr * 0.02 + x * 0.37) * 1.4);
          const px = x * 16 - camX, py = y * 16 - camY;
          if (y > 0 && W.t[(y - 1) * w + x] !== T.TREE) {
            const kind = treeKindAt(x, y);
            const im = canopyFor(kind === 'palm' ? 'forest' : kind);
            if (kind === 'palm') {
              g.fillStyle = '#2c7a2a';
              for (let k = 0; k < 6; k++) { const a = -Math.PI * (0.1 + 0.16 * k), ex = px + 8 + Math.cos(a) * 26, ey = py - 4 + Math.sin(a) * 18 + 8; g.strokeStyle = k % 2 ? '#2c8c28' : '#3cb43c'; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 8, py); g.quadraticCurveTo(px + 8 + Math.cos(a) * 14, py - 12 + Math.sin(a) * 10, ex, ey + 10); g.stroke(); }
            } else g.drawImage(im, px + 8 - 48 + sway, py - 62);
          }
          if (y + 1 < W.h && W.t[(y + 1) * w + x] !== T.TREE) g.drawImage(rootSprite, px - 16, py);
          const fl_ = W.fr[y * w + x];
          if (fl_ & 3) {
            const kind = treeKindAt(x, y);
            if (kind !== 'palm') {
              if (fl_ & 1) g.drawImage(leafBr(kind, -1), px - 22 + sway, py - 4);
              if (fl_ & 2) g.drawImage(leafBr(kind, 1), px + 6 + sway, py - 4);
            }
          }
        } else if (tt === T.MUSHTREE) {
          if (y > 0 && W.t[(y - 1) * w + x] !== T.MUSHTREE) g.drawImage(canopyFor('mush'), x * 16 - camX + 8 - 36, y * 16 - camY - 36, 72, 72);
        } else if (tt === T.CACTUS) {
          const h1 = hash2(x, y, 9);
          if (h1 > 0.72 && y > 0 && W.t[(y - 1) * w + x] === T.CACTUS) {
            const sd = hash2(x, y, 3) < 0.5 ? -1 : 1;
            if (W.t[y * w + x + sd] === T.AIR) {
              if (sd < 0) g.drawImage(cactusArm, x * 16 - camX - 14, y * 16 - camY - 4);
              else { g.save(); g.translate(x * 16 - camX + 30, y * 16 - camY - 4); g.scale(-1, 1); g.drawImage(cactusArm, 0, 0); g.restore(); }
            }
          }
        }
      }
    }
  }
  function drawFlames(g, camX, camY, BW, BH, tmr) {
    const tx0 = Math.max(0, camX >> 4), ty0 = Math.max(0, camY >> 4), tx1 = Math.min(W.w - 1, (camX + BW) >> 4), ty1 = Math.min(W.h - 1, (camY + BH) >> 4);
    const am = ambientAt(W.day, W.tod), amx = Math.max(am[0], am[1], am[2]);
    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const tt = W.t[y * W.w + x];
      const dk = y < W.surf[x] && !W.wl[y * W.w + x] ? Math.max(0, 1 - amx * 1.25) : 1;
      if (tt === T.TORCH) {
        const px = x * 16 - camX, py = y * 16 - camY, f = (tmr + x * 13) >> 3 & 3;
        g.globalCompositeOperation = 'lighter';
        g.fillStyle = 'rgba(255,150,40,' + (0.12 * dk) + ')'; g.beginPath(); g.arc(px + 8, py + 6, 15, 0, 7); g.fill();
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#d03000'; g.fillRect(px + 6, py + 2 + (f & 1), 4, 5);
        g.fillStyle = '#ff9a20'; g.fillRect(px + 7, py + 1 + (f & 1) + (f === 2 ? 1 : 0), 2, 5);
        g.fillStyle = '#fff2a0'; g.fillRect(px + 7, py + 4, 2, 2);
      } else if (tt === T.LANTERN) {
        const px = x * 16 - camX, py = y * 16 - camY;
        g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,200,100,' + (0.1 * dk) + ')'; g.beginPath(); g.arc(px + 8, py + 8, 16, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
      } else if (tt === T.GMUSH || tt === T.MUSHTREE) {
        const px = x * 16 - camX, py = y * 16 - camY;
        g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(60,110,255,0.10)'; g.beginPath(); g.arc(px + 8, py + 8, 14, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
      } else if (tt === T.CRYSTAL || tt === T.ORB) {
        const px = x * 16 - camX, py = y * 16 - camY;
        if (((W.fr[y * W.w + x]) & 15) === 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = tt === T.CRYSTAL ? 'rgba(255,60,120,0.14)' : 'rgba(150,60,255,0.14)'; g.beginPath(); g.arc(px + 16, py + 16, 22 + Math.sin(tmr * 0.05) * 2, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
      }
    }
  }
  const LTAB = new Float32Array(NT * 3);
  for (let i = 0; i < NT; i++) if (TD[i].lt) { LTAB[i * 3] = TD[i].lt[0]; LTAB[i * 3 + 1] = TD[i].lt[1]; LTAB[i * 3 + 2] = TD[i].lt[2]; }
  const LAVAL = [1, 0.42, 0.12];
  const LM = { w: 0, h: 0, x0: 0, y0: 0, r: null, g: null, b: null, dec: null, cv: null, ctx: null, img: null };
  function ensureLM(w, h) {
    if (LM.w === w && LM.h === h) return;
    LM.w = w; LM.h = h;
    const n = w * h;
    LM.r = new Float32Array(n); LM.g = new Float32Array(n); LM.b = new Float32Array(n); LM.dec = new Float32Array(n);
    LM.cv = mkcv(w, h); LM.ctx = LM.cv.getContext('2d'); LM.img = LM.ctx.createImageData(w, h);
    for (let i = 3; i < LM.img.data.length; i += 4) LM.img.data[i] = 255;
  }
  const LPAD = 12;
  const GAM = new Uint8Array(1024); for (let i = 0; i < 1024; i++) GAM[i] = Math.round(255 * Math.pow(i / 1023, 0.8));
  function computeLight(camX, camY, BW, BH, ambient, dyn) {
    const x0 = Math.max(0, (camX >> 4) - LPAD), y0 = Math.max(0, (camY >> 4) - LPAD);
    const x1 = Math.min(W.w - 1, ((camX + BW) >> 4) + LPAD), y1 = Math.min(W.h - 1, ((camY + BH) >> 4) + LPAD);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    ensureLM(w, h);
    LM.x0 = x0; LM.y0 = y0;
    const { r, g, b, dec } = LM;
    r.fill(0); g.fill(0); b.fill(0);
    const ar = ambient[0], ag = ambient[1], ab = ambient[2];
    const T_ = W.t, WL_ = W.wl, LQ = W.lq, FL = W.fl, TOP = W.top, ww = W.w;
    for (let y = 0; y < h; y++) {
      const gy = y0 + y;
      for (let x = 0; x < w; x++) {
        const gx = x0 + x, gi = gy * ww + gx, i = y * w + x, tt = T_[gi];
        let d;
        if (SOLID[tt]) d = tt === T.GLASS ? 0.94 : 0.64;
        else if (WL_[gi]) d = 0.9;
        else d = 0.955;
        if (tt === T.TREE || tt === T.CACTUS) d = 0.84;
        dec[i] = d;
        if (gy < TOP[gx] && !SOLID[tt]) { r[i] = ar; g[i] = ag; b[i] = ab; }
        const li = tt * 3;
        if (LTAB[li] > r[i] || LTAB[li + 1] > g[i] || LTAB[li + 2] > b[i]) { if (LTAB[li] > r[i]) r[i] = LTAB[li]; if (LTAB[li + 1] > g[i]) g[i] = LTAB[li + 1]; if (LTAB[li + 2] > b[i]) b[i] = LTAB[li + 2]; }
        if (LQ[gi] && (FL[gi] & 1)) { if (LAVAL[0] > r[i]) r[i] = LAVAL[0]; if (LAVAL[1] > g[i]) g[i] = LAVAL[1]; if (LAVAL[2] > b[i]) b[i] = LAVAL[2]; }
      }
    }
    for (let k = 0; k < dyn.length; k++) {
      const s = dyn[k], x = Math.floor(s[0] / 16) - x0, y = Math.floor(s[1] / 16) - y0;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const i = y * w + x;
      if (s[2] > r[i]) r[i] = s[2]; if (s[3] > g[i]) g[i] = s[3]; if (s[4] > b[i]) b[i] = s[4];
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < h; y++) {
        let o = y * w;
        for (let x = 1; x < w; x++) { const i = o + x, d = dec[i], p = i - 1; const a1 = r[p] * d, a2 = g[p] * d, a3 = b[p] * d; if (a1 > r[i]) r[i] = a1; if (a2 > g[i]) g[i] = a2; if (a3 > b[i]) b[i] = a3; }
        for (let x = w - 2; x >= 0; x--) { const i = o + x, d = dec[i], p = i + 1; const a1 = r[p] * d, a2 = g[p] * d, a3 = b[p] * d; if (a1 > r[i]) r[i] = a1; if (a2 > g[i]) g[i] = a2; if (a3 > b[i]) b[i] = a3; }
      }
      for (let x = 0; x < w; x++) {
        for (let y = 1; y < h; y++) { const i = y * w + x, d = dec[i], p = i - w; const a1 = r[p] * d, a2 = g[p] * d, a3 = b[p] * d; if (a1 > r[i]) r[i] = a1; if (a2 > g[i]) g[i] = a2; if (a3 > b[i]) b[i] = a3; }
        for (let y = h - 2; y >= 0; y--) { const i = y * w + x, d = dec[i], p = i + w; const a1 = r[p] * d, a2 = g[p] * d, a3 = b[p] * d; if (a1 > r[i]) r[i] = a1; if (a2 > g[i]) g[i] = a2; if (a3 > b[i]) b[i] = a3; }
      }
    }
    const data = LM.img.data;
    for (let i = 0, j = 0, n = w * h; i < n; i++, j += 4) {
      data[j] = r[i] > 1 ? 255 : GAM[(r[i] * 1023) | 0]; data[j + 1] = g[i] > 1 ? 255 : GAM[(g[i] * 1023) | 0]; data[j + 2] = b[i] > 1 ? 255 : GAM[(b[i] * 1023) | 0];
    }
    LM.ctx.putImageData(LM.img, 0, 0);
  }
  function lightAt(tx, ty) {
    const x = tx - LM.x0, y = ty - LM.y0;
    if (!LM.r || x < 0 || y < 0 || x >= LM.w || y >= LM.h) return 1;
    const i = y * LM.w + x;
    return Math.max(LM.r[i], LM.g[i], LM.b[i]);
  }
  const tileDiff = [];
  const liqActive = new Set();
  const fallQ = [];
  const tileHits = new Map();
  const wakeLiquid = (x, y) => { if (x < 1 || y < 1 || x >= W.w - 1 || y >= W.h - 1) return; liqActive.add(y * W.w + x); liqActive.add(y * W.w + x - 1); liqActive.add(y * W.w + x + 1); liqActive.add((y - 1) * W.w + x); liqActive.add((y + 1) * W.w + x); };
  function recomputeTop(x) { let y = 0; const w = W.w; while (y < W.h && W.t[y * w + x] === T.AIR && W.wl[y * w + x] === 0) y++; W.top[x] = y; }
  function pushDiff(x, y) { if (G && G.net && G.net.role === 'host') tileDiff.push(y * W.w + x); }
  function setTile(x, y, tt, f) {
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) return;
    const i = y * W.w + x;
    W.t[i] = tt;
    W.fr[i] = f === undefined ? 0 : f;
    if (tt !== T.AIR) { if (y < W.top[x]) W.top[x] = y; } else if (y === W.top[x] && W.wl[i] === 0) recomputeTop(x);
    if (tt !== T.AIR && W.lq[i] && SOLID[tt]) W.lq[i] = 0;
    dirtyTile(x, y);
    wakeLiquid(x, y);
    pushDiff(x, y);
    W.dirty = 1;
    if (SOLID[tt] === 0 || tt === T.AIR) { if (fallQ.length < 400) fallQ.push(y - 1 | 0, x); }
    if (TD[tt].fall) fallQ.push(y, x);
  }
  function setWallAt(x, y, wv) {
    if (x < 0 || y < 0 || x >= W.w || y >= W.h) return;
    const i = y * W.w + x;
    W.wl[i] = wv;
    if (wv) { if (y < W.top[x]) W.top[x] = y; } else if (y === W.top[x] && W.t[i] === T.AIR) recomputeTop(x);
    dirtyTile(x, y);
    pushDiff(x, y);
    W.dirty = 1;
  }
  function stepFalling() {
    let n = 0;
    while (fallQ.length && n < 24) {
      const x = fallQ.pop(), y = fallQ.pop();
      n++;
      const tt = gt(x, y);
      if (!TD[tt].fall) continue;
      const below = gt(x, y + 1);
      if (below === T.AIR || (!SOLID[below] && !TD[below].ob && below !== T.TREE)) {
        if (y + 1 >= W.h) continue;
        setTile(x, y, T.AIR);
        setTile(x, y + 1, tt);
        fallQ.push(y + 1, x);
      }
    }
  }
  const PLANTF = new Uint8Array(NT);
  [T.TGRASS, T.FLOWER, T.MUSH, T.GMUSH, T.SAPLING, T.CTHORN].forEach(k => { PLANTF[k] = 1; });
  function supported(x, y) {
    const tt = gt(x, y), d = TD[tt];
    if (tt === T.AIR) return true;
    const below = gt(x, y + 1), above = gt(x, y - 1);
    if (PLANTF[tt]) return SOLID[below] === 1 && !PLAT[below];
    if (tt === T.TORCH) return SOLID[below] === 1 || PLAT[below] === 1 || solidAt(x - 1, y) || solidAt(x + 1, y) || gwl(x, y) !== 0;
    if (tt === T.TREE) return below === T.TREE || (SOLID[below] === 1 && below !== T.CACTUS);
    if (tt === T.CACTUS) return below === T.SAND || below === T.CACTUS;
    if (tt === T.VINE) return above === T.VINE || above === T.GRASS || above === T.MGRASS;
    if (tt === T.MUSHTREE) return below === T.MUSHTREE || below === T.MGRASS || below === T.MUD;
    if (tt === T.ROPE) return true;
    if (d.ob) {
      const f = W.fr[y * W.w + x], ox = x - (f & 15), oy = y - (f >> 4), ow_ = d.ob[0], oh = d.ob[1];
      if (x !== ox || y !== oy) return true;
      if (tt === T.LANTERN) return SOLID[gt(x, y - 1)] === 1;
      if (tt === T.DOORC || tt === T.DOORO) return SOLID[gt(x, y - 1)] === 1 && SOLID[gt(x, y + oh)] === 1;
      if (tt === T.SIGN) return true;
      for (let dx = 0; dx < ow_; dx++) { const b = gt(ox + dx, oy + oh); if (!(SOLID[b] || PLAT[b] || TD[b].plat)) return false; }
      return true;
    }
    return true;
  }
  function refreshAround(x, y) {
    const cells = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]];
    for (const [cx, cy] of cells) {
      const tt = gt(cx, cy);
      if (tt === T.AIR) continue;
      if (!supported(cx, cy)) { if (TD[tt].ob) { const f = W.fr[cy * W.w + cx]; const ox = cx - (f & 15), oy = cy - (f >> 4); if (gt(ox, oy) === tt) breakTile(ox, oy, { noDrop: false, force: true }); } else breakTile(cx, cy, { force: true }); }
    }
  }
  function chestBlocked(x, y) { const ch = W.chests.get(y * W.w + x); return ch && ch.items.some(s => s); }
  function dropAt(px, py, id, n, vx, vy) { if (G.net && G.net.role === 'guest') return; spawnItem(px, py, id, n, vx, vy); }
  function breakTile(x, y, o = {}) {
    const tt = gt(x, y);
    if (tt === T.AIR) return false;
    const d = TD[tt];
    if (d.ob) {
      const f = W.fr[y * W.w + x], ox = x - (f & 15), oy = y - (f >> 4);
      if (gt(ox, oy) !== tt) return false;
      if (tt === T.CHEST && chestBlocked(ox, oy) && !o.force) return false;
      const ow_ = d.ob[0], oh = d.ob[1];
      for (let dy = 0; dy < oh; dy++) for (let dx = 0; dx < ow_; dx++) { if (gt(ox + dx, oy + dy) === tt) setTile(ox + dx, oy + dy, T.AIR); }
      if (tt === T.CHEST) { const ch = W.chests.get(oy * W.w + ox); if (ch) { ch.items.forEach(s => { if (s) dropAt(ox * 16 + 16, oy * 16 + 16, s.id, s.n); }); W.chests.delete(oy * W.w + ox); } }
      if (tt === T.ORB) onOrbBroken(ox, oy);
      else if (d.drop && !o.noDrop) dropAt(ox * 16 + ow_ * 8, oy * 16 + oh * 8, d.drop, 1, 0, -1);
      sfxAt(d.snd === 'glass' ? 'glass' : d.snd === 'wood' ? 'wood' : 'stone', ox * 16, oy * 16);
      spawnTileParts(ox * 16 + ow_ * 8, oy * 16 + oh * 8, d.col, 8);
      for (let dx = 0; dx < ow_; dx++) refreshAround(ox + dx, oy);
      refreshAround(ox, oy + oh - 1);
      return true;
    }
    if (tt === T.TREE) {
      let cnt = 0;
      for (let k = y; gt(x, k) === T.TREE; k--) {
        const f = W.fr[k * W.w + x];
        setTile(x, k, T.AIR);
        cnt++;
        const nw = 1 + (hash2(x, k, 31) < 0.4 ? 1 : 0);
        dropAt(x * 16 + 8, k * 16 + 8, 'wood', nw, (hash2(x, k, 4) - 0.5) * 2, -1);
        if (f & 3) spawnTileParts(x * 16 + 8, k * 16 + 8, '#2c8c28', 4);
      }
      if (hash2(x, y, 77) < 0.3) dropAt(x * 16 + 8, (y - cnt) * 16 + 8, 'acorn', 1, 0, -1);
      sfxAt('wood', x * 16, y * 16);
      spawnTileParts(x * 16 + 8, y * 16 + 8, '#6b4a2c', 8);
      refreshAround(x, y);
      return true;
    }
    setTile(x, y, T.AIR);
    if (d.drop && !o.noDrop) {
      let id = d.drop;
      if (tt === T.GRASS || tt === T.CGRASS || tt === T.MGRASS) id = tt === T.MGRASS ? 'mud' : 'dirt';
      dropAt(x * 16 + 8, y * 16 + 8, id, 1, (rnd01() - 0.5), -1);
    }
    if (tt === T.TGRASS && rnd01() < 0.03) dropAt(x * 16 + 8, y * 16 + 8, 'acorn', 1, 0, -1);
    sfxAt(d.snd, x * 16, y * 16);
    spawnTileParts(x * 16 + 8, y * 16 + 8, d.col, tt === T.AIR ? 0 : 6);
    refreshAround(x, y);
    return true;
  }
  const rnd01 = () => Math.random();
  function breakWall(x, y) {
    const wv = gwl(x, y);
    if (!wv) return false;
    const d = WD[wv];
    setWallAt(x, y, 0);
    if (d && d.drop) dropAt(x * 16 + 8, y * 16 + 8, d.drop, 1, 0, -1);
    sfxAt('stone', x * 16, y * 16);
    spawnTileParts(x * 16 + 8, y * 16 + 8, d ? d.col : '#555', 5);
    return true;
  }
  function onOrbBroken(x, y) {
    W.flags.orbs = (W.flags.orbs || 0) + 1;
    const r = rnd01();
    const id = r < 0.5 ? 'vilethorn' : 'bandStar';
    dropAt(x * 16 + 16, y * 16 + 16, id, 1, 0, -2);
    for (let i = 0; i < 6; i++) spawnTileParts(x * 16 + 16, y * 16 + 16, '#b070f0', 3);
    sfxAt('orb', x * 16, y * 16);
    if (W.flags.orbs % 3 === 0) { bmsg('You feel an evil presence watching you...', '#b070f0'); G.pendingEoW = 180; }
    else bmsg('A shadow orb was smashed (' + (W.flags.orbs % 3) + '/3)', '#c8a0ff');
  }
  function toolPower(it_) { return Math.max(it_.pick || 0, it_.axe || 0, it_.hammer || 0); }
  function mineAt(p, x, y, it_) {
    const tt = gt(x, y), key = y * W.w + x;
    if (tt === T.AIR) {
      if (it_.hammer && gwl(x, y)) {
        let h = tileHits.get(key + 0.5); if (!h) { h = { d: 0, t: 0 }; tileHits.set(key + 0.5, h); }
        h.d += it_.hammer; h.t = G.tick;
        sfxAt('stone', x * 16, y * 16);
        if (h.d >= 60) { tileHits.delete(key + 0.5); breakWall(x, y); return 2; }
        return 1;
      }
      return 0;
    }
    const d = TD[tt];
    if (PLANT[tt] && !d.climb && tt !== T.TORCH) { if (toolPower(it_) || it_.t === 'weapon') { breakTile(x, y, {}); return 2; } return 0; }
    if (tt === T.TORCH || tt === T.ROPE) { breakTile(x, y, {}); return 2; }
    let power = 0;
    if (d.tool === 'p') power = it_.pick || 0;
    else if (d.tool === 'a') power = it_.axe || 0;
    else if (d.tool === 'h') power = it_.hammer || 0;
    else if (d.tool === 'x') power = Math.max(it_.pick || 0, it_.axe || 0, it_.hammer || 0);
    if (tt === T.CHEST && chestBlocked(x - (W.fr[key] & 15), y - (W.fr[key] >> 4))) return 0;
    if (tt === T.TREE) power = it_.axe || 0;
    if (!power) return 0;
    if (d.mp && power < d.mp) { if (!p.noMineMsg || G.tick - p.noMineMsg > 120) { p.noMineMsg = G.tick; if (p === G.me) addMsg('Your pickaxe is too weak for this ' + d.n.toLowerCase(), '#ff9090'); } return 0; }
    if (d.hp <= 0) return 0;
    let ok = key;
    if (d.ob) { const f = W.fr[key]; ok = (y - (f >> 4)) * W.w + (x - (f & 15)); }
    let h = tileHits.get(ok); if (!h) { h = { d: 0, t: 0, x, y }; tileHits.set(ok, h); }
    h.d += power; h.t = G.tick;
    sfxAt(d.snd, x * 16, y * 16);
    if (rnd01() < 0.6) spawnTileParts(x * 16 + 8, y * 16 + 8, d.col, 2);
    if (h.d >= d.hp) { tileHits.delete(ok); breakTile(x, y, {}); return 2; }
    return 1;
  }
  function decayHits() { for (const [k, h] of tileHits) if (G.tick - h.t > 70) tileHits.delete(k); }
  function entBlocksCell(x, y, skip) {
    const l = x * 16, t_ = y * 16;
    const hit = e => e && e !== skip && !e.dead && e.x < l + 16 && e.x + e.w > l && e.y < t_ + 16 && e.y + e.h > t_;
    for (const p of G.players.values()) if (hit(p)) return true;
    for (const e of G.ents) if (e.k !== 'item' && e.hp > 0 && hit(e)) return true;
    for (const n of G.npcs) if (hit(n)) return true;
    return false;
  }
  function adjSupport(x, y) { return solidAt(x - 1, y) || solidAt(x + 1, y) || solidAt(x, y - 1) || solidAt(x, y + 1) || PLAT[gt(x, y + 1)] === 1 || gwl(x, y) !== 0 || TD[gt(x, y + 1)].plat === 1; }
  function canPlace(p, x, y, it_) {
    if (x < 1 || y < 1 || x >= W.w - 1 || y >= W.h - 1) return false;
    const tt = gt(x, y);
    const replaceable = tt === T.AIR || (PLANT[tt] && tt !== T.TORCH && !TD[tt].climb) || tt === T.TGRASS;
    if (it_.t === 'wall') {
      if (gwl(x, y) === it_.wall) return false;
      if (SOLID[tt] && !(tt === T.GLASS)) return false;
      return adjSupport(x, y) || gwl(x - 1, y) || gwl(x + 1, y) || gwl(x, y - 1) || gwl(x, y + 1) || SOLID[gt(x - 1, y)] || SOLID[gt(x + 1, y)];
    }
    const tid = it_.tile;
    const d = TD[tid];
    if (!replaceable) return false;
    if (it_.sp === 'torch') return adjSupport(x, y) && true;
    if (tid === T.SAPLING) { const b = gt(x, y + 1); return (b === T.GRASS || b === T.CGRASS || b === T.SNOWGRASS || b === T.SAND) && gt(x, y) === T.AIR; }
    if (tid === T.ROPE) return solidAt(x, y - 1) || gt(x, y - 1) === T.ROPE || adjSupport(x, y);
    if (d.ob) {
      const ow_ = d.ob[0], oh = d.ob[1], ox = x, oy = y - oh + 1;
      for (let dy = 0; dy < oh; dy++) for (let dx = 0; dx < ow_; dx++) { const t2 = gt(ox + dx, oy + dy); if (t2 !== T.AIR && !(PLANT[t2] && t2 !== T.TORCH)) return false; if (entBlocksCell(ox + dx, oy + dy, null) && (tid === T.DOORC)) return false; }
      for (let dy = 0; dy < oh; dy++) for (let dx = 0; dx < ow_; dx++) if (glq(ox + dx, oy + dy) > 120) return false;
      if (tid === T.LANTERN) return SOLID[gt(x, y - 1)] === 1;
      if (tid === T.DOORC) return SOLID[gt(ox, oy - 1)] === 1 && SOLID[gt(ox, oy + oh)] === 1;
      if (tid === T.SIGN) return true;
      for (let dx = 0; dx < ow_; dx++) { const b = gt(ox + dx, oy + oh); if (!(SOLID[b] || PLAT[b] || TD[b].plat)) return false; }
      return true;
    }
    if (tid === T.PLATFORM) return adjSupport(x, y) || gt(x - 1, y) === T.PLATFORM || gt(x + 1, y) === T.PLATFORM;
    if (!adjSupport(x, y) && gwl(x, y) === 0) return false;
    if (SOLID[tid] && entBlocksCell(x, y, null)) return false;
    return true;
  }
  function doPlace(x, y, it_) {
    if (it_.t === 'wall') { setWallAt(x, y, it_.wall); sfxAt('stone', x * 16, y * 16); return true; }
    const tid = it_.tile, d = TD[tid];
    if (d.ob) {
      const ow_ = d.ob[0], oh = d.ob[1], ox = x, oy = y - oh + 1;
      for (let dy = 0; dy < oh; dy++) for (let dx = 0; dx < ow_; dx++) setTile(ox + dx, oy + dy, tid, dx | dy << 4);
      if (tid === T.CHEST) W.chests.set(oy * W.w + ox, { x: ox, y: oy, items: new Array(40).fill(null) });
      sfxAt(d.snd === 'glass' ? 'glass' : 'wood', x * 16, y * 16);
      refreshAround(x, y);
      return true;
    }
    const prev = gt(x, y);
    if (PLANT[prev] && prev !== T.TORCH) breakTile(x, y, { noDrop: true });
    setTile(x, y, tid, tid === T.FLOWER ? (hash2(x, y, 1) * 4 | 0) : 0);
    if (W.lq[y * W.w + x] && SOLID[tid]) { W.lq[y * W.w + x] = 0; }
    if (tid === T.SAPLING) W.saplings = (W.saplings || new Map()).set(y * W.w + x, G.tick + 1800 + (rnd01() * 3600 | 0));
    sfxAt(d.snd, x * 16, y * 16);
    return true;
  }
  function growSapling(x, y) {
    if (gt(x, y) !== T.SAPLING) return;
    const base = y + 1, ground = gt(x, base);
    const ht = 7 + (rnd01() * 8 | 0);
    for (let k = 0; k <= ht + 2; k++) { const t2 = gt(x, y - k); if (k > 0 && (t2 !== T.AIR && t2 !== T.TGRASS)) return; }
    if (gt(x - 1, y) === T.TREE || gt(x + 1, y) === T.TREE) return;
    setTile(x, y, T.AIR);
    for (let k = 0; k < ht; k++) { let br = 0; if (k > 2 && k < ht - 2) { if (rnd01() < 0.22) br |= 1; if (rnd01() < 0.22) br |= 2; } setTile(x, y - k, T.TREE, br); }
  }
  function tickSaplings() {
    if (!W.saplings) return;
    for (const [k, t_] of W.saplings) { if (G.tick >= t_) { W.saplings.delete(k); growSapling(k % W.w, (k / W.w) | 0); } }
  }
  function toggleDoor(x, y, px) {
    const tt = gt(x, y);
    if (tt !== T.DOORC && tt !== T.DOORO) return false;
    const f = W.fr[y * W.w + x], ox = x - (f & 15), oy = y - (f >> 4);
    const open = tt === T.DOORC;
    if (!open) { for (let dy = 0; dy < 3; dy++) if (entBlocksCellDoor(ox, oy + dy)) return false; }
    for (let dy = 0; dy < 3; dy++) setTile(ox, oy + dy, open ? T.DOORO : T.DOORC, dy << 4);
    sfxAt('door', ox * 16, oy * 16);
    return true;
  }
  function entBlocksCellDoor(x, y) {
    const l = x * 16, t_ = y * 16;
    const hit = e => e && !e.dead && e.x < l + 16 && e.x + e.w > l && e.y < t_ + 16 && e.y + e.h > t_;
    for (const p of G.players.values()) if (hit(p)) return true;
    for (const n of G.npcs) if (hit(n)) return true;
    return false;
  }
  function stepLiquids() {
    if (!liqActive.size) return;
    const arr = Array.from(liqActive);
    liqActive.clear();
    arr.sort((a, b) => b - a);
    const w = W.w, H = W.h, LQ = W.lq, FL = W.fl, T_ = W.t;
    let budget = 3200;
    const wake = j => liqActive.add(j);
    const touchChanged = (j) => { wake(j); wake(j - 1); wake(j + 1); wake(j - w); wake(j + w); dirtyLiq = true; };
    for (let n = 0; n < arr.length; n++) {
      const i = arr[n];
      if (budget-- <= 0) { liqActive.add(i); continue; }
      let a = LQ[i];
      if (!a) continue;
      const lava = FL[i] & 1;
      if (lava && (G.tick % 3) !== 0) { liqActive.add(i); continue; }
      const x = i % w, y = (i / w) | 0;
      if (y >= H - 2) continue;
      const jb = i + w, tb = T_[jb];
      let moved = false;
      if (!SOLID[tb] && !PLAT[tb]) {
        const ab = LQ[jb];
        if (ab === 0 || (FL[jb] & 1) === lava) {
          const space = 255 - ab;
          if (space > 0) {
            const mv = a < space ? a : space;
            if (PLANT[tb] && tb !== T.ROPE && tb !== T.AIR) breakTile(x, y + 1, {});
            LQ[i] -= mv; LQ[jb] = ab + mv; FL[jb] = (FL[jb] & 254) | lava;
            a -= mv; moved = true;
            touchChanged(jb);
          }
        } else {
          const lj = lava ? i : jb;
          setTile(lj % w, (lj / w) | 0, T.OBSIDIAN); LQ[lj] = 0; FL[lj] = 0;
          const wj = lava ? jb : i; LQ[wj] = Math.max(0, LQ[wj] - 40);
          sfxAt('hiss', x * 16, y * 16);
          touchChanged(i); moved = true; a = LQ[i];
        }
      }
      if (a > 0 && (SOLID[tb] || PLAT[tb] || LQ[jb] >= 250 || (FL[jb] & 1) !== lava)) {
        const first = ((x + y + G.tick) & 1) ? -1 : 1;
        for (let k = 0; k < 2 && a > 0; k++) {
          const dir = k === 0 ? first : -first, j = i + dir, xx = x + dir;
          if (xx < 1 || xx >= w - 1) continue;
          const tj = T_[j];
          if (SOLID[tj] || PLAT[tj]) continue;
          const aj = LQ[j];
          if (aj > 0 && (FL[j] & 1) !== lava) {
            const lj = lava ? i : j;
            setTile(lj % w, (lj / w) | 0, T.OBSIDIAN); LQ[lj] = 0; FL[lj] = 0;
            const wj = lava ? j : i; LQ[wj] = Math.max(0, LQ[wj] - 40);
            sfxAt('hiss', x * 16, y * 16); touchChanged(i); moved = true; a = LQ[i];
            continue;
          }
          const diff = a - aj;
          if (diff > 1) {
            const mv = diff >> 1;
            if (mv > 0) {
              if (PLANT[tj] && tj !== T.ROPE) breakTile(xx, y, {});
              LQ[i] -= mv; LQ[j] = aj + mv; FL[j] = (FL[j] & 254) | lava; a -= mv; moved = true;
              touchChanged(j);
            }
          }
        }
      }
      if (LQ[i] > 0 && LQ[i] < 5 && (SOLID[tb] || PLAT[tb]) && LQ[i - w] === 0) { LQ[i] = 0; moved = true; }
      if (moved) { touchChanged(i); }
      else if (lava) wake(i);
      if (moved && G.net && G.net.role === 'host') liqDiff.add(i);
    }
  }
  let dirtyLiq = false;
  const liqDiff = new Set();
  const liqLevelAt = (px, py) => { const x = Math.floor(px / 16), y = Math.floor(py / 16); if (x < 0 || y < 0 || x >= W.w || y >= W.h) return 0; return W.lq[y * W.w + x]; };
  const lavaAt = (px, py) => { const x = Math.floor(px / 16), y = Math.floor(py / 16); if (x < 0 || y < 0 || x >= W.w || y >= W.h) return false; const i = y * W.w + x; return W.lq[i] > 40 && (W.fl[i] & 1) === 1; };
  const waterAt = (px, py) => { const x = Math.floor(px / 16), y = Math.floor(py / 16); if (x < 0 || y < 0 || x >= W.w || y >= W.h) return false; const i = y * W.w + x; return W.lq[i] > 60 && (W.fl[i] & 1) === 0; };
  const PLATC = new Uint8Array(NT);
  for (let i = 0; i < NT; i++) PLATC[i] = (TD[i].p || TD[i].plat) ? 1 : 0;
  let nextId = 1;
  const newId = () => nextId++;
  const EPS = 0.001;
  function bodyFree(x, y, w, h) {
    const c0 = Math.floor(x / 16), c1 = Math.floor((x + w - EPS) / 16), r0 = Math.floor(y / 16), r1 = Math.floor((y + h - EPS) / 16);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (SOLID[gt(c, r)] === 1) return false;
    return true;
  }
  function moveBody(e, o) {
    const w = e.w, h = e.h;
    e.og = e.gnd; e.gnd = false; e.ceil = false; e.bx = 0;
    const dropT = o && o.drop;
    let dx = e.vx;
    if (dx !== 0) {
      const dir = dx > 0 ? 1 : -1;
      const r0 = Math.floor(e.y / 16), r1 = Math.floor((e.y + h - EPS) / 16);
      let nx = e.x + dx, hit = -1000000;
      if (dir > 0) {
        const cs = Math.floor((e.x + w - EPS) / 16) + 1, ce = Math.floor((nx + w - EPS) / 16);
        for (let c = cs; c <= ce && hit === -1000000; c++) for (let r = r0; r <= r1; r++) if (SOLID[gt(c, r)] === 1) { hit = c; break; }
        if (hit !== -1000000) nx = hit * 16 - w;
      } else {
        const cs = Math.floor((e.x + EPS) / 16) - 1, ce = Math.floor(nx / 16);
        for (let c = cs; c >= ce && hit === -1000000; c--) for (let r = r0; r <= r1; r++) if (SOLID[gt(c, r)] === 1) { hit = c; break; }
        if (hit !== -1000000) nx = (hit + 1) * 16;
      }
      if (hit !== -1000000) {
        let stepped = false;
        if (o && o.step && (e.og || e.inW)) {
          for (let k = 1; k <= (o.step | 0 || 1) && !stepped; k++) {
            const ny = Math.floor((e.y + h - EPS) / 16) * 16 + 16 - k * 16 - h + (e.y + h) % 16 * 0;
            const feetRow = Math.floor((e.y + h - EPS) / 16);
            const newY = (feetRow + 1 - k) * 16 - h;
            if (newY < e.y && e.y - newY <= k * 16 + 0.5 && bodyFree(e.x + (dir > 0 ? 0.5 : -0.5), newY, w, h) && bodyFree(nx + dir * 0.5, newY, w, h)) {
              e.y = newY; e.x = e.x + dx; if (e.vy > 0) e.vy = 0; stepped = true;
            }
          }
        }
        if (!stepped) { e.x = nx; e.vx = 0; e.bx = dir; }
      } else e.x = nx;
    }
    let dy = e.vy;
    if (dy !== 0) {
      const dir = dy > 0 ? 1 : -1;
      const c0 = Math.floor(e.x / 16), c1 = Math.floor((e.x + w - EPS) / 16);
      let ny = e.y + dy, hit = -1000000;
      if (dir > 0) {
        const b = e.y + h, rs = Math.floor((b - EPS) / 16) + 1, re = Math.floor((ny + h - EPS) / 16);
        for (let r = rs; r <= re && hit === -1000000; r++) for (let c = c0; c <= c1; c++) { const t_ = gt(c, r); if (SOLID[t_] === 1 || (PLATC[t_] && !dropT && b <= r * 16 + 0.01)) { hit = r; break; } }
        if (hit !== -1000000) { ny = hit * 16 - h; e.vy = 0; e.gnd = true; }
      } else {
        const rs = Math.floor((e.y + EPS) / 16) - 1, re = Math.floor(ny / 16);
        for (let r = rs; r >= re && hit === -1000000; r--) for (let c = c0; c <= c1; c++) if (SOLID[gt(c, r)] === 1) { hit = r; break; }
        if (hit !== -1000000) { ny = (hit + 1) * 16; e.vy = 0; e.ceil = true; }
      }
      e.y = ny;
    }
    const maxX = (W.w - 2) * 16 - w;
    if (e.x < 32) { e.x = 32; if (e.vx < 0) e.vx = 0; }
    if (e.x > maxX) { e.x = maxX; if (e.vx > 0) e.vx = 0; }
    if (e.y < 0) { e.y = 0; if (e.vy < 0) e.vy = 0; }
    if (e.y + h > W.h * 16 - 16) { e.y = W.h * 16 - 16 - h; e.vy = 0; e.gnd = true; }
  }
  function updateLiquidFlags(e) {
    const cx = e.x + e.w / 2, cy = e.y + e.h * 0.55, fy = e.y + e.h - 3;
    e.inW = waterAt(cx, cy) || waterAt(cx, fy);
    e.inL = lavaAt(cx, cy) || lavaAt(cx, fy);
    e.headW = waterAt(cx, e.y + 6);
  }
  const parts = [];
  const texts = [];
  function spawnTileParts(x, y, col, n) {
    if (!G || G.noFx) return;
    for (let i = 0; i < n && parts.length < 600; i++) parts.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12, vx: (Math.random() - 0.5) * 2.4, vy: -Math.random() * 2.4, g: 0.16, life: 26 + (Math.random() * 14 | 0), max: 40, col, s: 2 });
  }
  function spawnSpark(x, y, col, n, spd = 2) {
    for (let i = 0; i < n && parts.length < 600; i++) { const a = Math.random() * 6.283, v = Math.random() * spd; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, life: 14 + (Math.random() * 12 | 0), max: 26, col, s: 2, glow: 1 }); }
  }
  function spawnBlood(x, y, col, n, dir) {
    for (let i = 0; i < n && parts.length < 600; i++) parts.push({ x, y, vx: dir * (0.5 + Math.random() * 2) + (Math.random() - 0.5), vy: -Math.random() * 2.5, g: 0.18, life: 22 + (Math.random() * 12 | 0), max: 34, col, s: 2 });
  }
  function stepParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.98;
      if (--p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); }
    }
    for (let i = texts.length - 1; i >= 0; i--) { const t_ = texts[i]; t_.y += t_.vy; t_.vy *= 0.96; if (--t_.life <= 0) texts.splice(i, 1); }
  }
  function addText(x, y, s, col, big) { if (texts.length > 40) texts.shift(); texts.push({ x, y, s, col, vy: -1.6, life: 50, big }); }
  function drawParts(g, camX, camY) {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      g.globalAlpha = Math.min(1, p.life / 14);
      g.fillStyle = p.col;
      g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.s, p.s);
    }
    g.globalAlpha = 1;
  }
  function drawTexts(g, camX, camY) {
    g.textAlign = 'center';
    for (let i = 0; i < texts.length; i++) {
      const t_ = texts[i];
      g.globalAlpha = Math.min(1, t_.life / 18);
      g.font = (t_.big ? 'bold 13' : 'bold 10') + 'px sans-serif';
      g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(t_.s, Math.round(t_.x - camX), Math.round(t_.y - camY));
      g.fillStyle = t_.col; g.fillText(t_.s, Math.round(t_.x - camX), Math.round(t_.y - camY));
    }
    g.globalAlpha = 1;
  }
  function spawnItem(px, py, id, n, vx, vy) {
    if (!IT[id] || n <= 0) return null;
    const e = { id: newId(), k: 'item', it: id, n, x: px - 6, y: py - 6, w: 12, h: 12, vx: vx === undefined ? (Math.random() - 0.5) * 2 : vx, vy: vy === undefined ? -1.5 : vy, t: 0, pd: 36, hp: 1 };
    G.ents.push(e);
    return e;
  }
  function stepItem(e) {
    e.t++;
    if (e.pd > 0) e.pd--;
    updateLiquidFlags(e);
    if (e.inL && e.t > 20) { e.hp = 0; spawnSpark(e.x + 6, e.y + 6, '#ff8030', 6); return; }
    e.vy = Math.min(e.vy + (e.inW ? 0.08 : 0.28), e.inW ? 2 : 8);
    if (e.inW) e.vx *= 0.9;
    moveBody(e, { step: 0 });
    if (e.gnd) e.vx *= 0.86;
    if (e.id === 'x') e.hp = 0;
    if (e.life && --e.life <= 0) e.hp = 0;
    if (e.it === 'fallenStar' && W.day && G.tick % 30 === 0) { e.hp = 0; spawnSpark(e.x + 6, e.y + 6, '#ffe080', 8); }
  }
  function findSlot(inv, id, st) {
    for (let i = 0; i < inv.length; i++) if (inv[i] && inv[i].id === id && inv[i].n < st) return i;
    return -1;
  }
  function addToInv(p, id, n) {
    const d = IT[id];
    if (!d) return 0;
    if (d.t === 'coin') { p.coins += COIN_IDS[id] * n; return 0; }
    const st = d.st;
    if (d.t === 'ammo') {
      for (let i = 0; i < p.ammo.length && n > 0; i++) { const s = p.ammo[i]; if (s && s.id === id && s.n < st) { const m = Math.min(n, st - s.n); s.n += m; n -= m; } }
      for (let i = 0; i < p.ammo.length && n > 0; i++) if (!p.ammo[i]) { const m = Math.min(n, st); p.ammo[i] = { id, n: m }; n -= m; }
      if (n <= 0) return 0;
    }
    while (n > 0) {
      const i = findSlot(p.inv, id, st);
      if (i < 0) break;
      const m = Math.min(n, st - p.inv[i].n); p.inv[i].n += m; n -= m;
    }
    while (n > 0) {
      let i = p.inv.findIndex(s => !s);
      if (i < 0) break;
      const m = Math.min(n, st); p.inv[i] = { id, n: m }; n -= m;
    }
    return n;
  }
  function canTake(p, id, n) {
    const d = IT[id];
    if (!d) return false;
    if (d.t === 'coin') return true;
    const st = d.st;
    let room = 0;
    const scan = arr => { for (const s of arr) { if (!s) room += st; else if (s.id === id) room += st - s.n; } };
    scan(p.inv);
    if (d.t === 'ammo') scan(p.ammo);
    return room >= Math.min(n, 1);
  }
  const invCount = (p, id) => { let n = 0; for (const s of p.inv) if (s && s.id === id) n += s.n; if (IT[id] && IT[id].t === 'ammo') for (const s of p.ammo) if (s && s.id === id) n += s.n; return n; };
  function invTake(p, id, n) {
    for (const arr of [p.inv, p.ammo]) for (let i = 0; i < arr.length && n > 0; i++) { const s = arr[i]; if (s && s.id === id) { const m = Math.min(n, s.n); s.n -= m; n -= m; if (s.n <= 0) arr[i] = null; } }
    return n <= 0;
  }
  function stepItemPickup(e) {
    if (e.pd > 0) return;
    let best = null, bd = 1e9;
    for (const p of G.players.values()) {
      if (p.dead) continue;
      const dx = p.x + p.w / 2 - (e.x + 6), dy = p.y + p.h / 2 - (e.y + 6), d = dx * dx + dy * dy;
      if (d < bd && canTake(p, e.it, e.n)) { bd = d; best = p; }
    }
    if (!best) return;
    const dd = Math.sqrt(bd);
    if (dd < 90) {
      const dx = best.x + best.w / 2 - (e.x + 6), dy = best.y + best.h / 2 - (e.y + 6), k = Math.min(1, 3.4 / Math.max(1, dd));
      if (dd > 20) { e.vx += dx / dd * 0.5; e.vy += dy / dd * 0.5 - 0.28; const sp = Math.hypot(e.vx, e.vy); if (sp > 6) { e.vx *= 6 / sp; e.vy *= 6 / sp; } }
    }
    if (dd < 22) {
      const left = addToInv(best, e.it, e.n);
      const got = e.n - left;
      if (got > 0) {
        if (best === G.me) { onPickupLocal(e.it, got); } else if (best.remote) sendTo(best.id, { t: 'give', it: e.it, n: got });
        e.n = left;
        if (e.n <= 0) e.hp = 0;
      }
    }
  }
  function onPickupLocal(id, n) {
    const d = IT[id];
    if (d.t === 'coin') sfxAt('coin', G.me.x, G.me.y); else sfxAt('grab', G.me.x, G.me.y);
    G.pickLog.push({ id, n, t: 150 });
    if (G.pickLog.length > 5) G.pickLog.shift();
  }
  const RUNACC = 0.08, RUNSLOW = 0.2, GRAV = 0.4, MAXFALL = 10, JUMPSPD = 5.01, JUMPH = 15, PW = 20, PH = 42;
  const HPCAP = 400, MPCAP = 200;
  const AUTH = () => !G.net || G.net.role === 'host';
  function newCharacter(name, o = {}) {
    return {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name || 'Player', sk: o.sk ?? 1, hs: o.hs ?? 0, hc: o.hc ?? 1, sh: o.sh ?? 0, pn: o.pn ?? 1, ey: o.ey ?? 0,
      hpMax: 100, manaMax: 20, hp: 100, coins: 0, inv: [{ id: 'copperShortsword', n: 1 }, { id: 'copperPickaxe', n: 1 }, { id: 'copperAxe', n: 1 }].concat(new Array(37).fill(null)),
      ammo: [null, null, null, null], armor: [null, null, null, null, null, null], created: Date.now(), played: 0, deaths: 0, kills: 0, spawn: null
    };
  }
  function mkPlayer(id, name, ch) {
    const p = {
      id, name: name || ch.name, ch, k: 'player', look: lookFromChar(ch), x: 0, y: 0, px: 0, py: 0, w: PW, h: PH, vx: 0, vy: 0, dir: 1, gnd: false, og: false, ceil: false, bx: 0,
      inv: ch.inv, ammo: ch.ammo, armor: ch.armor, coins: ch.coins | 0, hpMax: ch.hpMax, hp: Math.max(1, ch.hp || ch.hpMax), manaMax: ch.manaMax, mana: ch.manaMax,
      sel: 0, in: { l: 0, r: 0, j: 0, up: 0, dn: 0, use: 0, alt: 0, ax: 0, ay: 0 }, useT: 0, swing: 0, swingMax: 1, swingIt: null, swingAng: 0, swingStyle: 'swing', hits: null,
      jumpT: 0, jHeld: false, dj: false, coyote: 0, jbuf: 0, iv: 0, dead: false, respT: 0, breath: 200, fallTop: 0, fr: 0, frT: 0, regT: 0, mpDelay: 0, sick: 0, fire: 0,
      st: { def: 0, jump2: 0, runMax: 3, noFall: 0, jumpH: JUMPH, regen: 0, light: null, manaB: 0 }, dropT: 0, climb: false, mirror: 0, lastHurt: 0, why: '', afk: 0, aimAng: 0, kills: 0,
      remote: false, spawn: ch.spawn || null, hold: null, shootT: 0, mpT: 0, invOpen: false, lastSent: 0, lt: 0
    };
    calcStats(p);
    return p;
  }
  function calcStats(p) {
    const s = p.st;
    s.def = 0; s.jump2 = 0; s.runMax = 3; s.noFall = 0; s.jumpH = JUMPH; s.regen = 0; s.light = null; s.manaB = 0;
    const sets = {};
    for (let i = 0; i < 6; i++) {
      const a = p.armor[i], d = a && IT[a.id];
      if (!d) continue;
      if (i < 3) { s.def += d.def || 0; if (d.light) s.light = d.light; sets[d.set] = (sets[d.set] || 0) + 1; }
      if (d.jump2) s.jump2 = 1;
      if (d.runMax) s.runMax = Math.max(s.runMax, d.runMax);
      if (d.noFall) s.noFall = 1;
      if (d.jumpBoost) s.jumpH += 10;
      if (d.regen) s.regen += d.regen;
      if (d.manaMax) s.manaB += d.manaMax;
    }
    if (sets.wood === 3) s.def += 1;
    p.manaMax = p.ch.manaMax + s.manaB;
    p.hpMax = p.ch.hpMax;
    if (p.hp > p.hpMax) p.hp = p.hpMax;
    if (p.mana > p.manaMax) p.mana = p.manaMax;
  }
  const pcx = p => p.x + p.w / 2, pcy = p => p.y + p.h / 2;
  function placePlayerAtSpawn(p) {
    let sx, sy;
    if (p.spawn) { sx = p.spawn[0] * 16 + 8 - PW / 2; sy = p.spawn[1] * 16 - PH; }
    else { sx = W.spawnX * 16 + 8 - PW / 2; sy = W.spawnY * 16 - PH + 16; }
    let n = 0;
    while (!bodyFree(sx, sy, PW, PH) && n++ < 60) sy -= 16;
    p.x = p.px = sx; p.y = p.py = sy; p.vx = p.vy = 0; p.fallTop = p.y;
  }
  function slotArr(p, k) { return k < 40 ? p.inv : k < 44 ? p.ammo : p.armor; }
  const selItem = p => { const s = p.inv[p.sel]; return s ? IT[s.id] : null; };
  function consumeSel(p, n = 1) { const s = p.inv[p.sel]; if (!s) return; s.n -= n; if (s.n <= 0) p.inv[p.sel] = null; }
  const tileOfPx = v => Math.floor(v / 16);
  function inReach(p, tx, ty, ext) {
    const dx = tx * 16 + 8 - pcx(p), dy = ty * 16 + 8 - pcy(p);
    return Math.abs(dx) <= (5.5 + (ext || 0)) * 16 && Math.abs(dy) <= (4.6 + (ext || 0)) * 16;
  }
  const dmgVar = d => Math.max(1, Math.round(d * (0.85 + Math.random() * 0.3)));
  function stepPlayerPhys(p) {
    const I = p.in;
    p.px = p.x; p.py = p.y;
    const st = p.st;
    updateLiquidFlags(p);
    const ccx = Math.floor((p.x + p.w / 2) / 16), ccy = Math.floor((p.y + p.h / 2) / 16), ccy2 = Math.floor((p.y + p.h - 4) / 16);
    const onRope = gt(ccx, ccy) === T.ROPE || gt(ccx, ccy2) === T.ROPE;
    if (onRope && (I.up || I.dn) && !p.dead) p.climb = true;
    if (!onRope) p.climb = false;
    let maxRun = st.runMax;
    if (p.inW || p.inL) maxRun *= p.inL ? 0.4 : 0.6;
    const left = I.l && !I.r, right = I.r && !I.l;
    if (p.dead) { p.vx *= 0.9; }
    else {
      if (left) {
        if (p.vx > -maxRun) { if (p.vx > RUNSLOW) p.vx -= RUNSLOW; p.vx -= RUNACC; }
        else if (p.vx < -maxRun - 0.1) p.vx += 0.1;
        if (p.swing <= 0) p.dir = -1;
      } else if (right) {
        if (p.vx < maxRun) { if (p.vx < -RUNSLOW) p.vx += RUNSLOW; p.vx += RUNACC; }
        else if (p.vx > maxRun + 0.1) p.vx -= 0.1;
        if (p.swing <= 0) p.dir = 1;
      } else {
        const f = p.gnd ? RUNSLOW : (p.inW ? 0.06 : 0.05);
        if (p.vx > f) p.vx -= f; else if (p.vx < -f) p.vx += f; else p.vx = 0;
      }
    }
    if (p.gnd) { p.coyote = 4; p.dj = false; } else if (p.coyote > 0) p.coyote--;
    if (I.j && !p.dead) {
      if (!p.jHeld) p.jbuf = 5;
      p.jHeld = true;
    } else { p.jHeld = false; p.jumpT = 0; }
    if (p.jbuf > 0) p.jbuf--;
    if (!p.dead) {
      if (p.climb) {
        p.vy = I.up ? -2.2 : I.dn ? 2.2 : 0;
        if (p.jbuf > 0 && I.j) { p.climb = false; p.vy = -JUMPSPD; p.jumpT = 8; p.jbuf = 0; p.coyote = 0; }
        if (left || right) p.vx = clamp(p.vx, -1.6, 1.6);
        else p.vx *= 0.6;
      } else if (p.inW && !p.inL) {
        if (I.j) { p.vy = Math.max(p.vy - 0.35, -3.2); if (!p.headW && p.vy > -2.5) { p.vy = -JUMPSPD; p.jumpT = 6; } }
        else p.vy = Math.min(p.vy + 0.12, 3);
        if (p.vy < 0 && !I.j) p.vy *= 0.92;
        p.jbuf = 0;
      } else if (p.inL) {
        if (I.j) p.vy = Math.max(p.vy - 0.3, -2.4); else p.vy = Math.min(p.vy + 0.2, 2.5);
        p.jbuf = 0;
      } else {
        if (p.jbuf > 0) {
          if (p.coyote > 0) { p.vy = -JUMPSPD; p.jumpT = st.jumpH; p.jbuf = 0; p.coyote = 0; p.gnd = false; sfxAt('jump', p.x, p.y); }
          else if (st.jump2 && !p.dj) { p.dj = true; p.vy = -JUMPSPD; p.jumpT = st.jumpH; p.jbuf = 0; p.fallTop = p.y; sfxAt('puff', p.x, p.y); spawnPuff(p); }
        }
        if (p.jumpT > 0 && I.j) { p.vy = -JUMPSPD; p.jumpT--; if (p.ceil) p.jumpT = 0; }
        else { p.jumpT = 0; p.vy = Math.min(p.vy + GRAV, MAXFALL); }
      }
    } else p.vy = Math.min(p.vy + GRAV, MAXFALL);
    if (I.dn && !p.climb && p.gnd) p.dropT = 10;
    if (p.dropT > 0) p.dropT--;
    const wasG = p.gnd, vyBefore = p.vy;
    moveBody(p, { step: 1, drop: p.dropT > 0 || p.climb });
    if (p.bx && !p.dead) {
      const tx = Math.floor((p.bx > 0 ? p.x + p.w + 1 : p.x - 1) / 16);
      for (let r = Math.floor(p.y / 16); r <= Math.floor((p.y + p.h - 1) / 16); r++) { const tt = gt(tx, r); if (tt === T.DOORC) { if (AUTH()) toggleDoor(tx, r, p.x); else sendNet({ t: 'door', x: tx, y: r }); break; } }
    }
    if (!wasG && p.gnd) onLand(p, vyBefore);
    if (p.gnd) { if (p.inW === false) p.fallTop = p.y; } else if (p.vy < 0 || p.inW || p.climb || p.inL) p.fallTop = p.y;
    if (!p.gnd && p.y < p.fallTop) p.fallTop = p.y;
    if (p.gnd) p.fallTop = p.y;
    if ((p.inW || p.climb) && !p.gnd) p.fallTop = p.y;
  }
  function onLand(p, vy) {
    const tiles = (p.y - p.fallTop) / 16;
    if (tiles > 25 && !p.st.noFall && !p.inW && !p.inL && !p.dead && vy > 0) {
      const dmg = Math.round((tiles - 25) * 10);
      damagePlayerLocal(p, dmg, 0, 0, 'fell', true);
    } else if (vy > 6) sfxAt('land', p.x, p.y);
    p.fallTop = p.y;
  }
  function spawnPuff(p) { if (!G || G.noFx) return; for (let i = 0; i < 8; i++) parts.push({ x: p.x + 10 + (Math.random() - 0.5) * 12, y: p.y + 42, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 0.6, g: 0, life: 24, max: 24, col: '#e8f0f8', s: 3 }); }
  const DEATHMSG = { fell: 'fell to a deadly height', drown: 'drowned', lava: 'tried to swim in lava', burn: 'burned to death', mob: 'was slain', boss: 'was slain' };
  function damagePlayerLocal(p, dmg, kx, ky, why, ignoreDef, src) {
    if (p.dead || p.iv > 0 && !ignoreDef) return false;
    const def = ignoreDef ? 0 : p.st.def;
    dmg = Math.max(1, Math.round(dmg - def * 0.5));
    if (G.hardcoreTest) dmg = 1;
    p.hp -= dmg;
    p.iv = ignoreDef && why !== 'fell' ? 20 : 40;
    p.lastHurt = G.tick;
    p.regT = 0;
    if (kx || ky) { p.vx = kx; p.vy = ky; p.jumpT = 0; p.climb = false; }
    p.why = why === 'mob' && src ? 'was slain by ' + src : DEATHMSG[why] || 'was slain';
    sfxAt('hurt', p.x, p.y);
    addText(pcx(p), p.y - 4, String(dmg), '#ff5050', true);
    spawnBlood(pcx(p), pcy(p), '#c01818', 6, kx ? Math.sign(kx) : 1);
    if (p === G.me) G.shake = Math.min(8, 2 + dmg / 8);
    if (p.hp <= 0) { p.hp = 0; killPlayer(p); }
    return true;
  }
  function killPlayer(p) {
    p.dead = true; p.respT = 600; p.vx *= 0.5; p.jumpT = 0; p.climb = false; p.mirror = 0; p.swing = 0; p.fire = 0;
    sfxAt('death', p.x, p.y);
    spawnBlood(pcx(p), pcy(p), '#c01818', 22, 1); spawnBlood(pcx(p), pcy(p), '#c01818', 22, -1);
    p.ch.deaths++;
    if (p === G.me || p.remote) {
      const lose = Math.floor(p.coins / 2);
      if (lose > 0 && AUTH()) { dropCoins(pcx(p), pcy(p), lose); }
      if (lose > 0) p.coins -= lose;
      const msg = p.name + ' ' + p.why + '.';
      if (G.net && G.net.role === 'host') { sendNet({ t: 'msg', s: msg, c: '#ff6060' }); }
      addMsg(msg, '#ff6060');
    }
  }
  function dropCoins(x, y, n) {
    const ids = ['pt', 'au', 'ag', 'cu'], vals = [1e6, 1e4, 100, 1];
    for (let i = 0; i < 4; i++) { const c = Math.floor(n / vals[i]); n -= c * vals[i]; if (c > 0) spawnItem(x, y, ids[i], c, (Math.random() - 0.5) * 3, -2); }
  }
  function respawnPlayer(p) {
    p.dead = false; p.hp = p.hpMax; p.mana = p.manaMax; p.iv = 120; p.fire = 0; p.breath = 200; p.sick = 0;
    placePlayerAtSpawn(p);
    if (p === G.me) { G.camSnap = true; addMsg('You have respawned.', '#a0ffa0'); }
  }
  function stepPlayerVitals(p) {
    if (p.iv > 0) p.iv--;
    if (p.dead) { if (p.respT > 0) p.respT--; if (p.respT <= 0 && p === G.me) respawnPlayer(p); return; }
    if (p.sick > 0) p.sick--;
    if (p.inL) { if (damagePlayerLocal(p, 50, 0, 0, 'lava', true)) p.fire = 300; }
    if (p.fire > 0) { p.fire--; if (p.fire % 30 === 0) damagePlayerLocal(p, 4, 0, 0, 'burn', true); if (p.inW) p.fire = 0; }
    if (p.headW) { p.breath--; if (p.breath <= 0) { p.breath = 0; if (G.tick % 12 === 0) damagePlayerLocal(p, 4, 0, 0, 'drown', true); } }
    else if (p.breath < 200) p.breath = Math.min(200, p.breath + 4);
    p.regT += 1 + p.st.regen * 0.8;
    const still = Math.abs(p.vx) < 0.1 && p.gnd;
    const need = still ? 55 : 110;
    if (p.regT >= need * (G.tick - p.lastHurt < 300 ? 2 : 1) && p.hp < p.hpMax) { p.regT = 0; p.hp = Math.min(p.hpMax, p.hp + 1 + (p.hpMax > 200 ? 1 : 0)); }
    if (p.mpDelay > 0) p.mpDelay--;
    else if (p.mana < p.manaMax) { p.mpT += 1; if (p.mpT >= Math.max(3, 22 - p.manaMax / 20)) { p.mpT = 0; p.mana = Math.min(p.manaMax, p.mana + 1 + (p.manaMax / 40 | 0)); } }
    if (p.mirror > 0) { p.mirror--; if (G.tick % 3 === 0) spawnSpark(pcx(p), pcy(p), '#a0d8ff', 1, 1.5); if (p.mirror === 0) { placePlayerAtSpawn(p); if (p === G.me) G.camSnap = true; for (let i = 0; i < 16; i++) spawnSpark(pcx(p), pcy(p), '#a0d8ff', 1, 3); sfxAt('mirror', p.x, p.y); } }
    if (p.hp <= 0 && !p.dead) killPlayer(p);
    const mv = Math.abs(p.vx);
    if (p.gnd && mv > 0.2) { p.frT += mv * 0.07; p.fr = 1 + (Math.floor(p.frT * 8) % 8); }
    else if (!p.gnd && !p.climb) { p.fr = 9; p.frT = 0; }
    else { p.fr = 0; p.frT = 0; }
    if (p.climb && (p.in.up || p.in.dn)) p.fr = 1 + (Math.floor(G.tick / 5) % 8);
  }
  function findAmmo(p, type) {
    for (let i = 0; i < 4; i++) { const s = p.ammo[i]; if (s && IT[s.id].ammo === type) return { arr: p.ammo, i }; }
    for (let i = 0; i < p.inv.length; i++) { const s = p.inv[i]; if (s && IT[s.id].t === 'ammo' && IT[s.id].ammo === type) return { arr: p.inv, i }; }
    return null;
  }
  function pointAng(p, ax, ay) { return Math.atan2(ay - (p.y + 14), ax - pcx(p)); }
  const SWINGSTYLE = it_ => it_.style === 'stab' ? 'stab' : it_.style === 'bow' || it_.style === 'staff' ? 'aim' : it_.t === 'weapon' || it_.t === 'tool' ? 'swing' : 'use';
  function beginSwing(p, it_, ax, ay) {
    p.swingIt = it_.id;
    p.swingStyle = SWINGSTYLE(it_);
    p.swingMax = Math.max(8, it_.use | 0);
    if (it_.t === 'use' || it_.t === 'boss') p.swingMax = 18;
    p.swing = p.swingMax;
    p.swingAng = pointAng(p, ax, ay);
    p.dir = ax >= pcx(p) ? 1 : -1;
    p.hits = new Set();
  }
  function tryUse(p) {
    if (p.dead || p.useT > 0 || p.mirror > 0) return;
    const slot = p.inv[p.sel];
    if (!slot) return;
    const it_ = IT[slot.id];
    if (!it_) return;
    const I = p.in, ax = I.ax, ay = I.ay, tx = tileOfPx(ax), ty = tileOfPx(ay);
    const act = { it: it_.id, ax: Math.round(ax), ay: Math.round(ay), tx, ty, sel: p.sel };
    const t = it_.t;
    if (t === 'tool' && (it_.pick || it_.axe || it_.hammer)) {
      if (!inReach(p, tx, ty)) { p.useT = 4; return; }
      p.useT = it_.use; beginSwing(p, it_, ax, ay); act.a = 'mine'; doAct(p, act); return;
    }
    if (t === 'tool' && it_.mirror) { p.useT = 40; p.mirror = 90; beginSwing(p, it_, ax, ay); sfxAt('mirror0', p.x, p.y); return; }
    if (t === 'block' || t === 'wall') {
      if (!inReach(p, tx, ty)) { p.useT = 4; return; }
      if (!canPlace(p, tx, ty, it_)) { p.useT = 3; return; }
      p.useT = it_.use || 10; beginSwing(p, it_, ax, ay); p.swingMax = Math.max(8, p.useT); p.swing = p.swingMax; act.a = 'place';
      doPlaceLocal(p, act, slot); return;
    }
    if (t === 'weapon') {
      if (it_.style === 'bow') {
        const am = findAmmo(p, it_.ammo);
        if (!am) { p.useT = 12; if (p === G.me && G.tick - (p.noAmmoMsg || -999) > 120) { p.noAmmoMsg = G.tick; addMsg('No arrows', '#ff9090'); } return; }
        const as = am.arr[am.i], ad = IT[as.id];
        as.n--; if (as.n <= 0) am.arr[am.i] = null;
        p.useT = it_.use; beginSwing(p, it_, ax, ay); act.a = 'shoot'; act.am = ad.id; doAct(p, act); return;
      }
      if (it_.style === 'staff') {
        const cost = it_.mana || 0;
        if (p.mana < cost) { p.useT = 8; if (p === G.me && G.tick - (p.noManaMsg || -999) > 90) { p.noManaMsg = G.tick; sfxAt('nomana', p.x, p.y); } return; }
        p.mana -= cost; p.mpDelay = 80;
        p.useT = it_.use; beginSwing(p, it_, ax, ay); act.a = 'shoot'; doAct(p, act); return;
      }
      p.useT = it_.use; beginSwing(p, it_, ax, ay); act.a = 'swing'; doAct(p, act); return;
    }
    if (t === 'use') {
      if (it_.sick && p.sick > 0) { p.useT = 10; if (p === G.me) addMsg('Potion sickness: wait a moment', '#ff9090'); return; }
      if (it_.heal) { if (p.hp >= p.hpMax && !it_.sick) { p.useT = 6; return; } p.hp = Math.min(p.hpMax, p.hp + it_.heal); addText(pcx(p), p.y - 6, '+' + it_.heal, '#60ff60', true); if (it_.sick) p.sick = 3600; sfxAt('drink', p.x, p.y); }
      else if (it_.healMana) { if (p.mana >= p.manaMax) { p.useT = 6; return; } p.mana = Math.min(p.manaMax, p.mana + it_.healMana); addText(pcx(p), p.y - 6, '+' + it_.healMana, '#60a0ff', true); sfxAt('drink', p.x, p.y); }
      else if (it_.life) { if (p.ch.hpMax >= HPCAP) { p.useT = 10; return; } p.ch.hpMax += it_.life; calcStats(p); p.hp += it_.life; addText(pcx(p), p.y - 6, '+' + it_.life + ' max life', '#ff6080', true); sfxAt('crystal', p.x, p.y); }
      else if (it_.mana) { if (p.ch.manaMax >= MPCAP) { p.useT = 10; return; } p.ch.manaMax += it_.mana; calcStats(p); p.mana += it_.mana; addText(pcx(p), p.y - 6, '+' + it_.mana + ' max mana', '#60a0ff', true); sfxAt('crystal', p.x, p.y); }
      p.useT = it_.use; beginSwing(p, it_, ax, ay); consumeSel(p, 1); return;
    }
    if (t === 'boss') {
      const kind = it_.id === 'suspEye' ? 'eoc' : it_.id === 'slimeCrown' ? 'king' : 'eow';
      if (kind === 'eoc' && W.day) { p.useT = 30; if (p === G.me) addMsg('The Suspicious Looking Eye only works at night', '#ff9090'); return; }
      if (kind === 'eow' && W.bio[clamp(Math.floor(pcx(p) / 16), 0, W.w - 1)] !== BIOME.CORRUPT) { p.useT = 30; if (p === G.me) addMsg('Worm Food must be used in the Corruption', '#ff9090'); return; }
      if (AUTH() && bossAlive(kind)) { p.useT = 30; if (p === G.me) addMsg('That boss is already here', '#ff9090'); return; }
      p.useT = 40; beginSwing(p, it_, ax, ay); consumeSel(p, 1); act.a = 'summon'; act.kind = kind; doAct(p, act); return;
    }
  }
  function doAct(p, act) {
    if (AUTH()) applyAct(p, act); else sendNet(Object.assign({ t: 'act' }, act));
  }
  function doPlaceLocal(p, act, slot) {
    consumeSel(p, 1);
    if (AUTH()) applyAct(p, act); else { sendNet(Object.assign({ t: 'act' }, act)); }
  }
  function applyAct(p, act) {
    const it_ = IT[act.it];
    if (!it_) return;
    if (act.a === 'mine') {
      if (!p.remote || inReach(p, act.tx, act.ty, 1)) mineAt(p, act.tx, act.ty, it_);
    } else if (act.a === 'place') {
      if (inReach(p, act.tx, act.ty, 1.5) && canPlace(p, act.tx, act.ty, it_)) doPlace(act.tx, act.ty, it_);
      else if (p.remote) sendTo(p.id, { t: 'give', it: act.it, n: 1 });
      else addToInv(p, act.it, 1);
    } else if (act.a === 'shoot') {
      shootFrom(p, it_, act);
    } else if (act.a === 'summon') {
      spawnBoss(act.kind, p);
    } else if (act.a === 'swing') {
      if (p.remote) { beginSwing(p, it_, act.ax, act.ay); p.swingStyle = SWINGSTYLE(it_); }
    }
    if (p.remote && (act.a === 'mine' || act.a === 'swing' || act.a === 'shoot')) { p.swingIt = it_.id; p.swing = Math.max(8, it_.use | 0); p.swingMax = p.swing; p.swingStyle = SWINGSTYLE(it_); p.swingAng = pointAng(p, act.ax, act.ay); p.hits = new Set(); p.dir = act.ax >= pcx(p) ? 1 : -1; }
  }
  function shootFrom(p, it_, act) {
    const ax = act.ax, ay = act.ay;
    let ox = pcx(p) + p.dir * 6, oy = p.y + 14;
    let ang = Math.atan2(ay - oy, ax - ox);
    if (it_.style === 'bow') {
      const am = IT[act.am || 'woodenArrow'] || IT.woodenArrow;
      const spd = it_.spd || 8;
      spawnProj({ pt: 'arrow', x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, dmg: it_.dmg + (am.dmg || 5), kb: it_.kb || 1, owner: p.id, life: 240, grav: 0.1, gdelay: 15, fire: am.fire, pierce: am.id === 'unholyArrow' ? 1 : 0, rot: ang, am: am.id });
      sfxAt('bow', p.x, p.y);
    } else {
      const spd = it_.spd || 8, bolt = it_.bolt || 'amethyst';
      if (bolt === 'thorn') spawnProj({ pt: 'thorn', x: ox, y: oy, vx: Math.cos(ang) * 16, vy: Math.sin(ang) * 16, dmg: it_.dmg, kb: it_.kb, owner: p.id, life: 16, pierce: 99, rot: ang, bolt });
      else spawnProj({ pt: 'bolt', x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, dmg: it_.dmg, kb: it_.kb, owner: p.id, life: 100, bolt, rot: ang, pierce: 0, grav: 0 });
      sfxAt('magic', p.x, p.y);
    }
  }
  function swingHitTest(p) {
    if (!AUTH() || !p.swingIt || p.swing <= 0) return;
    const it_ = IT[p.swingIt];
    if (!it_ || !(it_.t === 'weapon' || it_.t === 'tool') || it_.style === 'bow' || it_.style === 'staff') return;
    const prog = 1 - p.swing / p.swingMax;
    if (prog < 0.18 || prog > 0.85) return;
    const reach = it_.style === 'stab' ? 36 : it_.big ? 52 : it_.t === 'tool' ? 34 : 42;
    let ang;
    if (p.swingStyle === 'stab') ang = p.swingAng;
    else ang = swingAngle(p.dir, prog);
    const sx = pcx(p) + p.dir * 2, sy = p.y + 15;
    for (const e of G.ents) {
      if (e.k !== 'mob' || e.hp <= 0 || e.nohit || p.hits.has(e.id)) continue;
      let hit = false;
      for (let f = 0.35; f <= 1.01; f += 0.2) {
        const qx = sx + Math.cos(ang) * reach * f, qy = sy + Math.sin(ang) * reach * f;
        if (qx > e.x - 6 && qx < e.x + e.w + 6 && qy > e.y - 6 && qy < e.y + e.h + 6) { hit = true; break; }
      }
      if (!hit) continue;
      p.hits.add(e.id);
      const dir = e.x + e.w / 2 > pcx(p) ? 1 : -1;
      let dmg = it_.dmg;
      if (it_.t === 'tool') dmg = Math.max(2, it_.dmg);
      hurtMob(e, dmgVar(dmg), (it_.kb || 3) * dir, p, true, it_.id === 'fieryGreatsword' ? 1 : 0);
    }
  }
  const easeSwing = t => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
  const swingAngle = (dir, prog) => { const e = easeSwing(prog); return dir > 0 ? lerp(-2.0, 0.9, e) : lerp(-Math.PI + 2.0, -Math.PI - 0.9, e); };
  const MOB = {
    greenSlime: { n: 'Green Slime', hp: 14, dmg: 6, def: 0, w: 24, h: 18, ai: 'slime', sl: 'green', coin: [3, 12], drops: [['gel', 1, 1, 2]], kbr: 0.1 },
    blueSlime: { n: 'Blue Slime', hp: 25, dmg: 7, def: 2, w: 32, h: 24, ai: 'slime', sl: 'blue', coin: [8, 24], drops: [['gel', 1, 1, 2]], kbr: 0.1 },
    purpleSlime: { n: 'Corrupt Slime', hp: 40, dmg: 12, def: 4, w: 40, h: 30, ai: 'slime', sl: 'purple', coin: [30, 70], drops: [['gel', 1, 1, 3]], kbr: 0.2 },
    iceSlime: { n: 'Ice Slime', hp: 35, dmg: 18, def: 3, w: 32, h: 24, ai: 'slime', sl: 'ice', coin: [20, 50], drops: [['gel', 1, 1, 3], ['ice', 0.3, 1, 3]], kbr: 0.15 },
    yellowSlime: { n: 'Sand Slime', hp: 30, dmg: 15, def: 4, w: 28, h: 22, ai: 'slime', sl: 'yellow', coin: [20, 50], drops: [['gel', 1, 1, 3], ['sand', 0.4, 1, 3]], kbr: 0.15 },
    blackSlime: { n: 'Black Slime', hp: 45, dmg: 15, def: 7, w: 34, h: 24, ai: 'slime', sl: 'black', coin: [40, 90], drops: [['gel', 1, 1, 3]], kbr: 0.2 },
    lavaSlime: { n: 'Lava Slime', hp: 50, dmg: 20, def: 5, w: 36, h: 26, ai: 'slime', sl: 'lava', coin: [60, 130], drops: [['gel', 1, 2, 4]], kbr: 0.2, fire: 1, light: [1, 0.45, 0.12], lavaOk: 1 },
    zombie: { n: 'Zombie', hp: 45, dmg: 14, def: 6, w: 20, h: 42, ai: 'walk', spd: 1.0, look: 'zombie', coin: [50, 110], drops: [['rottenChunk', 0.02, 1, 1]], kbr: 0.1, doors: 1 },
    skeleton: { n: 'Skeleton', hp: 60, dmg: 20, def: 8, w: 20, h: 42, ai: 'walk', spd: 1.15, look: 'skeleton', coin: [90, 180], drops: [['lesserHeal', 0.04, 1, 1]], kbr: 0.2 },
    demonEye: { n: 'Demon Eye', hp: 60, dmg: 18, def: 2, w: 30, h: 22, ai: 'eye', spd: 3.0, iris: 'blue', coin: [70, 140], drops: [['lens', 0.33, 1, 1]], kbr: 0.2, fly: 1 },
    caveBat: { n: 'Cave Bat', hp: 16, dmg: 13, def: 2, w: 20, h: 14, ai: 'bat', spd: 2.4, bat: 'cave', coin: [40, 100], drops: [], kbr: 0.1, fly: 1 },
    iceBat: { n: 'Ice Bat', hp: 22, dmg: 16, def: 3, w: 20, h: 14, ai: 'bat', spd: 2.6, bat: 'ice', coin: [60, 120], drops: [], kbr: 0.1, fly: 1 },
    hellBat: { n: 'Hellbat', hp: 28, dmg: 32, def: 0, w: 20, h: 14, ai: 'bat', spd: 3.0, bat: 'hell', coin: [100, 220], drops: [], kbr: 0.1, fly: 1, fire: 1, light: [1, 0.5, 0.15], lavaOk: 1 },
    eaterOfSouls: { n: 'Eater of Souls', hp: 40, dmg: 22, def: 8, w: 34, h: 26, ai: 'eater', spd: 3.2, coin: [100, 200], drops: [['rottenChunk', 0.7, 1, 2]], kbr: 0.3, fly: 1 },
    giantWorm: { n: 'Giant Worm', hp: 55, dmg: 20, def: 4, w: 20, h: 20, ai: 'worm', spd: 3.4, wk: 'giant', segs: 7, sz: 20, coin: [60, 140], drops: [], kbr: 1, fly: 1 },
    devourer: { n: 'Devourer', hp: 70, dmg: 26, def: 6, w: 22, h: 22, ai: 'worm', spd: 3.9, wk: 'dev', segs: 9, sz: 22, coin: [90, 200], drops: [['rottenChunk', 0.55, 1, 2]], kbr: 1, fly: 1 },
    fireImp: { n: 'Fire Imp', hp: 60, dmg: 28, def: 8, w: 22, h: 30, ai: 'imp', spd: 2.0, coin: [150, 300], drops: [], kbr: 0.4, fly: 1, light: [1, 0.5, 0.15], lavaOk: 1 },
    servant: { n: 'Servant of Cthulhu', hp: 10, dmg: 14, def: 0, w: 22, h: 22, ai: 'servant', spd: 4.2, coin: [0, 0], drops: [], kbr: 0.2, fly: 1, noCoin: 1 },
    king: { n: 'King Slime', hp: 1800, dmg: 40, def: 6, w: 114, h: 78, ai: 'king', boss: 'king', coin: [20000, 20000], drops: [['lesserHeal', 1, 5, 10]], kbr: 1, gold: 1 },
    eoc: { n: 'Eye of Cthulhu', hp: 2400, dmg: 24, def: 10, w: 96, h: 96, ai: 'eoc', boss: 'eoc', coin: [30000, 30000], drops: [['demoniteOre', 1, 30, 50], ['lesserHeal', 1, 5, 9]], kbr: 1, fly: 1 },
    eowH: { n: 'Eater of Worlds', hp: 90, dmg: 22, def: 2, w: 36, h: 36, ai: 'worm', spd: 4.1, wk: 'eow', boss: 'eow', sz: 34, coin: [0, 0], drops: [], kbr: 1, fly: 1, seg: 'head' },
    eowB: { n: 'Eater of Worlds', hp: 60, dmg: 16, def: 4, w: 36, h: 36, ai: 'worm', wk: 'eow', boss: 'eow', sz: 34, coin: [0, 0], drops: [], kbr: 1, fly: 1, seg: 'body' },
    eowT: { n: 'Eater of Worlds', hp: 60, dmg: 12, def: 8, w: 36, h: 36, ai: 'worm', wk: 'eow', boss: 'eow', sz: 34, coin: [0, 0], drops: [], kbr: 1, fly: 1, seg: 'tail' }
  };
  const MOBK = Object.keys(MOB);
  Object.keys(MOB).forEach(k => { MOB[k].id = k; });
  const BOSSN = { king: 'King Slime', eoc: 'Eye of Cthulhu', eow: 'Eater of Worlds' };
  const projs = [];
  function newMob(ty, x, y, o) {
    const m = MOB[ty];
    const e = Object.assign({ id: newId(), k: 'mob', ty, x: x - m.w / 2, y: y - m.h, px: x - m.w / 2, py: y - m.h, w: m.w, h: m.h, vx: 0, vy: 0, hp: m.hp, hpMax: m.hp, dir: Math.random() < 0.5 ? -1 : 1, gnd: false, f: 0, rot: 0, flash: 0, cd: 30 + (Math.random() * 60 | 0), cnt: 0, age: 0, fire: 0, ph: 1, tk: 0, back: 0, st: 0 }, o || {});
    if (m.iris && !e.iris) e.iris = ['blue', 'blue', 'green', 'purple'][Math.random() * 4 | 0];
    return e;
  }
  function spawnMob(ty, x, y, o) {
    if (!MOB[ty]) return null;
    const e = newMob(ty, x, y, o);
    G.ents.push(e);
    return e;
  }
  function bossAlive(kind) { return G.ents.some(e => e.k === 'mob' && e.hp > 0 && MOB[e.ty].boss === kind); }
  function spawnBoss(kind, p) {
    if (!AUTH()) return;
    const cx = pcx(p), cy = pcy(p);
    if (kind === 'king') {
      let x = cx + (Math.random() < 0.5 ? -300 : 300), y = cy - 150;
      const e = spawnMob('king', x, y, { cd: 90 });
      e.x = x - e.w / 2; e.y = y - e.h; e.px = e.x; e.py = e.y;
      announce('King Slime has awoken!', '#a0b8ff');
    } else if (kind === 'eoc') {
      const e = spawnMob('eoc', cx + (Math.random() < 0.5 ? -400 : 400), cy - 280, { ph: 1, st: 0, cd: 120 });
      e.x -= 0; e.y = cy - 280 - 96;
      announce('You feel an evil presence watching you...', '#ff7080'); announce('Eye of Cthulhu has awoken!', '#ff7080');
    } else if (kind === 'eow') {
      const n = 30, ids = [];
      const sx = cx + 260 * (Math.random() < 0.5 ? -1 : 1), sy = cy - 80;
      for (let i = 0; i < n; i++) {
        const ty = i === 0 ? 'eowH' : i === n - 1 ? 'eowT' : 'eowB';
        const e = spawnMob(ty, sx - i * 26, sy + 36, { vx: -0, vy: 0 });
        e.x = sx - i * 26 - 18; e.y = sy; e.px = e.x; e.py = e.y;
        e.hp = e.hpMax = MOB[ty].hp;
        ids.push(e);
      }
      for (let i = 0; i < ids.length; i++) { ids[i].prev = i > 0 ? ids[i - 1].id : 0; ids[i].next = i < ids.length - 1 ? ids[i + 1].id : 0; }
      ids[0].ang = sx > cx ? Math.PI : 0;
      announce('Eater of Worlds has awoken!', '#c090ff');
    }
    sfxAt('roar', cx, cy);
  }
  function announce(s, c) { addMsg(s, c); if (G.net && G.net.role === 'host') sendNet({ t: 'msg', s, c, big: 1 }); G.banner = { s, c, t: 220 }; if (G.net && G.net.role === 'host') sendNet({ t: 'ban', s, c }); }
  function nearestPlayer(e, maxD) {
    let best = null, bd = maxD * maxD;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    for (const p of G.players.values()) {
      if (p.dead) continue;
      const dx = pcx(p) - cx, dy = pcy(p) - cy, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; return d; };
  const mobDef = e => MOB[e.ty];
  function stepMob(e) {
    const m = MOB[e.ty];
    e.px = e.x; e.py = e.y; e.age++;
    if (e.flash > 0) e.flash--;
    if (e.back > 0) e.back--;
    if (e.fire > 0) { e.fire--; if (e.fire % 40 === 0 && !m.fire) { e.hp -= 3; addText(e.x + e.w / 2, e.y, '3', '#ff9a30'); if (e.hp <= 0) { killMob(e, null); return; } } }
    if (m.ai !== 'worm') updateLiquidFlags(e);
    if (e.inL && !m.lavaOk && !m.boss) { e.hp -= 2; if (e.hp <= 0) { killMob(e, null); return; } }
    const AI = AIS[m.ai];
    AI(e, m);
    if (e.hp <= 0) return;
    const wasG = e.gnd;
    if (m.ai !== 'worm' && m.ai !== 'eoc') {
      if (m.fly) { moveBody(e, null); if (e.bx) e.vx = -e.vx * 0.5; if (e.gnd || e.ceil) e.vy = -e.vy * 0.6; }
      else moveBody(e, { step: m.ai === 'walk' ? 1 : 0 });
    }
    void wasG;
    if (e.y > W.h * 16 - 20) { e.y = W.h * 16 - 40; e.vy = 0; }
    mobContact(e, m);
  }
  function mobContact(e, m) {
    if (e.hp <= 0 || e.noContact) return;
    const dmg = e.dmgOv || m.dmg;
    for (const p of G.players.values()) {
      if (p.dead || p.iv > 0) continue;
      if (p.x < e.x + e.w - 2 && p.x + p.w > e.x + 2 && p.y < e.y + e.h - 2 && p.y + p.h > e.y + 2) {
        const dir = pcx(p) > e.x + e.w / 2 ? 1 : -1;
        const kx = dir * (m.boss ? 5 : 4), ky = -3;
        if (p.remote) { sendTo(p.id, { t: 'hurt', d: dmg, kx, ky, by: m.n }); p.iv = 40; }
        else damagePlayerLocal(p, dmg, kx, ky, m.boss ? 'boss' : 'mob', false, m.n);
        if (m.fire && !p.remote) p.fire = Math.max(p.fire, 180);
        if (m.ai === 'eye' || m.ai === 'eater' || m.ai === 'bat' || m.ai === 'servant') { e.back = 50; e.vx = -dir * 3; e.vy = -1 + Math.random() * 2; }
        if (m.ai === 'slime') e.vx = -dir * 1.5;
        if (e.ai2) e.ai2.hit = 1;
      }
    }
    for (const n of G.npcs) {
      if (n.hp <= 0 || n.iv > 0) continue;
      if (n.x < e.x + e.w && n.x + n.w > e.x && n.y < e.y + e.h && n.y + n.h > e.y && !m.noNpc) { hurtNpc(n, Math.max(1, Math.round(m.dmg * 0.5)), e.x + e.w / 2 < n.x + n.w / 2 ? 3 : -3); }
    }
  }
  function aimAt(e, p) { return Math.atan2(pcy(p) - (e.y + e.h / 2), pcx(p) - (e.x + e.w / 2)); }
  const AIS = {
    slime(e, m) {
      const t = nearestPlayer(e, 560);
      if (e.inW) { e.vy = Math.max(e.vy - 0.35, -2.2); }
      e.vy = Math.min(e.vy + 0.3, 10);
      if (e.gnd) {
        e.vx *= 0.7;
        if (e.cd > 0) e.cd--;
        else {
          const dir = t ? (pcx(t) > e.x + e.w / 2 ? 1 : -1) : (Math.random() < 0.5 ? -1 : 1);
          e.cnt++;
          const big = e.cnt % 3 === 0;
          const up = t && pcy(t) < e.y - 40;
          e.vy = big || up ? -6.6 : -4.4; e.vx = dir * (big ? 2.4 : 1.7) * (m.sl === 'lava' ? 1.2 : 1); e.dir = dir;
          e.cd = t ? 40 + (Math.random() * 40 | 0) : 70 + (Math.random() * 110 | 0);
          e.gnd = false;
        }
        e.f = e.cd < 8 ? 0 : 1;
      } else e.f = e.vy < -1 ? 2 : e.vy > 1 ? 0 : 1;
      if (e.bx && !e.gnd) e.vx = -e.vx * 0.4;
    },
    walk(e, m) {
      const t = nearestPlayer(e, 640);
      e.vy = Math.min(e.vy + 0.3, 10);
      if (e.inW) { e.vy = Math.min(e.vy, 2); }
      const spd = m.spd * (e.inW ? 0.6 : 1);
      if (t) {
        const dir = pcx(t) > e.x + e.w / 2 ? 1 : -1;
        e.dir = Math.abs(pcx(t) - (e.x + e.w / 2)) > 6 ? dir : e.dir;
        if (e.dir > 0 ? e.vx < spd : e.vx > -spd) e.vx += e.dir * 0.12;
        if (e.gnd && t.y + t.h < e.y - 20 && Math.abs(pcx(t) - (e.x + e.w / 2)) < 90 && e.cd <= 0) { e.vy = -5.6; e.cd = 40; }
      } else {
        if (e.cd <= 0) { e.st = (Math.random() * 3 | 0) - 1; e.cd = 60 + (Math.random() * 120 | 0); }
        if (e.st) { e.dir = e.st; e.vx = clamp(e.vx + e.st * 0.08, -spd * 0.5, spd * 0.5); } else e.vx *= 0.8;
      }
      if (e.cd > 0) e.cd--;
      if (e.bx && e.gnd && e.cd <= 0) {
        const tx = Math.floor((e.bx > 0 ? e.x + e.w + 1 : e.x - 1) / 16);
        let door = false;
        if (m.doors) for (let r = Math.floor(e.y / 16); r <= Math.floor((e.y + e.h - 1) / 16); r++) { if (gt(tx, r) === T.DOORC) { toggleDoor(tx, r, e.x); door = true; break; } }
        if (!door) { e.vy = -5.6; e.cd = 30; }
        else e.cd = 20;
      }
      if (e.gnd && Math.abs(e.vx) > 0.2) { e.ph += Math.abs(e.vx) * 0.07; e.f = 1 + (Math.floor(e.ph * 8) % 8); } else if (!e.gnd) e.f = 9; else e.f = 0;
      if (!W.day || e.y > W.surf[clamp(Math.floor(e.x / 16), 0, W.w - 1)] * 16 + 200) { } else if (m.id === 'zombie' && W.day && e.age > 600 && !nearestPlayer(e, 440)) e.hp = 0;
      if (e.hp <= 0) e.dead = true;
    },
    eye(e, m) {
      const t = nearestPlayer(e, 800);
      e.age++;
      if (t && e.back <= 0) {
        const a = aimAt(e, t) + Math.sin(e.age * 0.04 + e.id) * 0.5;
        e.vx += Math.cos(a) * 0.09; e.vy += Math.sin(a) * 0.09;
      } else if (e.back > 0) { e.vx *= 0.99; e.vy *= 0.99; }
      else { e.vx += (Math.random() - 0.5) * 0.1; e.vy += (Math.random() - 0.5) * 0.1; }
      const sp = Math.hypot(e.vx, e.vy), mx = m.spd;
      if (sp > mx) { e.vx *= mx / sp; e.vy *= mx / sp; }
      e.rot = Math.atan2(e.vy, e.vx);
      e.f = (e.age >> 3) & 1;
      if (W.day && e.age > 300 && !nearestPlayer(e, 520) && Math.random() < 0.01) e.hp = 0, e.dead = true;
      if (W.day && e.age > 900) e.vy -= 0.02;
    },
    bat(e, m) {
      const t = nearestPlayer(e, 520);
      if (e.cd <= 0) { e.st = Math.random() * 6.28; e.cd = 20 + (Math.random() * 30 | 0); }
      e.cd--;
      let a = e.st;
      if (t && e.back <= 0) { const ta = aimAt(e, t); const d = angDiff(a, ta); a += d * 0.55; }
      e.vx += Math.cos(a) * 0.14; e.vy += Math.sin(a) * 0.14 + Math.sin(e.age * 0.4) * 0.03;
      e.vx *= 0.97; e.vy *= 0.97;
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > m.spd) { e.vx *= m.spd / sp; e.vy *= m.spd / sp; }
      e.dir = e.vx >= 0 ? 1 : -1;
      e.f = (e.age >> 2) % 3;
    },
    eater(e, m) {
      const t = nearestPlayer(e, 700);
      if (t && e.back <= 0) {
        const a = aimAt(e, t) + Math.sin(e.age * 0.05 + e.id) * 0.4;
        e.vx += Math.cos(a) * 0.11; e.vy += Math.sin(a) * 0.11;
      } else if (!t) { e.vx += (Math.random() - 0.5) * 0.08; e.vy += (Math.random() - 0.5) * 0.08; }
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > m.spd) { e.vx *= m.spd / sp; e.vy *= m.spd / sp; }
      e.rot = Math.atan2(e.vy, e.vx);
      e.dir = e.vx >= 0 ? 1 : -1;
      e.f = (e.age >> 3) & 1;
    },
    servant(e, m) {
      const t = nearestPlayer(e, 800);
      if (t && e.back <= 0) { const a = aimAt(e, t) + Math.sin(e.age * 0.08 + e.id) * 0.8; e.vx += Math.cos(a) * 0.2; e.vy += Math.sin(a) * 0.2; }
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > m.spd) { e.vx *= m.spd / sp; e.vy *= m.spd / sp; }
      e.rot = Math.atan2(e.vy, e.vx);
      e.f = (e.age >> 3) & 1;
      if (e.age > 1500) e.hp = 0, e.dead = true;
    },
    imp(e, m) {
      const t = nearestPlayer(e, 800);
      e.age++;
      if (t) {
        const dx = pcx(t) - (e.x + e.w / 2), dy = pcy(t) - (e.y + e.h / 2), d = Math.hypot(dx, dy);
        e.dir = dx > 0 ? 1 : -1;
        const want = 150;
        const k = d > want ? 1 : -0.4;
        e.vx += dx / d * 0.09 * k + Math.sin(e.age * 0.03) * 0.03; e.vy += dy / d * 0.09 * k + Math.cos(e.age * 0.05) * 0.03;
        if (e.cd <= 0 && d < 420) {
          e.cd = 110 + (Math.random() * 40 | 0);
          const a = Math.atan2(dy, dx);
          spawnProj({ pt: 'fire', x: e.x + e.w / 2, y: e.y + e.h / 2, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, dmg: 26, kb: 3, owner: 'e' + e.id, life: 160, hostile: 1, pierce: 0 });
          sfxAt('fire', e.x, e.y);
        }
      } else { e.vx += (Math.random() - 0.5) * 0.06; e.vy += (Math.random() - 0.5) * 0.06; }
      e.cd--;
      e.vx *= 0.97; e.vy *= 0.97;
      const sp = Math.hypot(e.vx, e.vy);
      if (sp > m.spd) { e.vx *= m.spd / sp; e.vy *= m.spd / sp; }
      e.f = (e.age >> 3) & 1;
    },
    worm(e, m) { wormStep(e, m); },
    king(e, m) { kingStep(e, m); },
    eoc(e, m) { eocStep(e, m); }
  };
  function wormStep(e, m) {
    if (!e.prev) {
      const t = nearestPlayer(e, 900);
      if (e.ang === undefined) e.ang = e.dir > 0 ? 0 : Math.PI;
      let want = e.ang;
      if (t) want = aimAt(e, t);
      else if (e.age % 90 === 0) e.wander = Math.random() * 6.28;
      if (!t) want = e.wander === undefined ? e.ang : e.wander;
      const turn = m.boss ? 0.045 : 0.05;
      const d = angDiff(e.ang, want);
      e.ang += clamp(d, -turn, turn);
      if (t && e.back > 0) e.ang += 0.05;
      const sp = m.spd * (t ? 1 : 0.6) * (m.boss && t && W.day ? 1 : 1);
      e.vx = Math.cos(e.ang) * sp; e.vy = Math.sin(e.ang) * sp;
      e.x += e.vx; e.y += e.vy;
      e.x = clamp(e.x, 40, W.w * 16 - 40 - e.w); e.y = clamp(e.y, 40, W.h * 16 - 60);
      e.rot = e.ang;
      e.dir = Math.cos(e.ang) >= 0 ? 1 : -1;
      if (m.boss && !t) { e.despawn = (e.despawn || 0) + 1; if (e.despawn > 600) e.hp = 0, e.dead = true; }
    } else {
      const pv = G.ents.find(q => q.id === e.prev);
      if (!pv || pv.hp <= 0) { e.prev = 0; return; }
      const dx = (pv.x + pv.w / 2) - (e.x + e.w / 2), dy = (pv.y + pv.h / 2) - (e.y + e.h / 2), d = Math.hypot(dx, dy), sp = m.sz * 0.78;
      if (d > sp) { const k = (d - sp) / d; e.x += dx * k; e.y += dy * k; }
      e.rot = Math.atan2(dy, dx);
      e.vx = dx * 0.1; e.vy = dy * 0.1;
    }
    e.f = 0;
    if (e.flash > 0 && false) e.f = 0;
    mobContact(e, m);
    e.noContact = true;
    e.noContact = false;
  }
  function kingStep(e, m) {
    const t = nearestPlayer(e, 1200);
    e.vy = Math.min(e.vy + 0.34, 12);
    const frac = e.hp / e.hpMax;
    if (!t) { e.despawn = (e.despawn || 0) + 1; if (e.despawn > 400) { e.hp = 0; e.dead = true; } e.vx *= 0.9; return; }
    e.despawn = 0;
    const cx = e.x + e.w / 2, dx = pcx(t) - cx;
    e.tk++;
    if (e.tele === undefined) e.tele = 600;
    if (e.gnd) {
      e.vx *= 0.6;
      if (e.cd > 0) e.cd--;
      else {
        e.cnt++;
        const big = e.cnt % 3 === 0;
        e.dir = dx > 0 ? 1 : -1;
        e.vx = e.dir * (big ? 4.2 : 3.2) * (frac < 0.5 ? 1.2 : 1);
        e.vy = big ? -11.5 : (pcy(t) < e.y - 60 ? -9 : -7.4);
        e.cd = frac < 0.5 ? 38 : 56;
        e.gnd = false;
        if (e.cnt % 4 === 0 && G.ents.filter(q => q.k === 'mob' && q.ty === 'blueSlime' && q.fromKing).length < 5) {
          const s = spawnMob('blueSlime', cx + (Math.random() - 0.5) * 40, e.y + 20, { fromKing: 1, vy: -3 });
          s.vx = (Math.random() - 0.5) * 4;
        }
      }
      e.f = e.cd < 10 ? 0 : 1;
    } else e.f = e.vy < -1 ? 2 : 1;
    e.tele--;
    if (e.tele <= 0 || Math.abs(dx) > 900 || Math.abs(pcy(t) - e.y) > 600) {
      e.tele = 520 + (Math.random() * 200 | 0);
      for (let i = 0; i < 24; i++) spawnSpark(cx, e.y + e.h / 2, '#7aa0ff', 1, 4);
      e.x = pcx(t) - e.w / 2 + (Math.random() < 0.5 ? -120 : 120); e.y = pcy(t) - 200 - e.h; e.vy = 0; e.vx = 0; e.cd = 30; e.gnd = false;
      for (let i = 0; i < 24; i++) spawnSpark(e.x + e.w / 2, e.y + e.h / 2, '#7aa0ff', 1, 4);
      sfxAt('teleport', e.x, e.y);
    }
    if (e.bx) e.vx = -e.vx * 0.4;
    moveBody(e, null);
    if (e.gnd && !e.og) { sfxAt('slam', e.x, e.y); G.shake = Math.max(G.shake || 0, 2); for (let i = 0; i < 10; i++) spawnTileParts(e.x + Math.random() * e.w, e.y + e.h, '#5a8aff', 1); }
  }
  function eocStep(e, m) {
    const t = nearestPlayer(e, 1400);
    e.px = e.x; e.py = e.y;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    const frac = e.hp / e.hpMax;
    if (W.day && !e.fled) { e.fled = true; announce('Eye of Cthulhu has fled with the dawn.', '#ff9090'); }
    if (e.fled) { e.vy -= 0.2; e.x += e.vx; e.y += e.vy; if (e.y < -200 || (e.age++ > 500)) { e.hp = 0; e.dead = true; } e.rot = -1.57; return; }
    if (!t) { e.despawn = (e.despawn || 0) + 1; if (e.despawn > 600) { e.hp = 0; e.dead = true; } e.vy -= 0.05; e.x += e.vx; e.y += e.vy; return; }
    e.despawn = 0;
    const tx = pcx(t), ty = pcy(t), dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy);
    if (e.ph === 1 && frac < 0.5) { e.ph = 2; e.st = 10; e.cd = 60; e.def2 = 1; e.dmgOv = 34; announce('Eye of Cthulhu enters its second phase!', '#ff5060'); sfxAt('roar', cx, cy); for (let i = 0; i < 30; i++) spawnBlood(cx, cy, '#c01818', 1, Math.random() < 0.5 ? 1 : -1); }
    e.tk++;
    const rec = t => e.rot = t;
    if (e.ph === 1) {
      if (e.st === 0) {
        const hx = tx, hy = ty - 190;
        e.vx += (hx - cx) * 0.0016 + Math.sin(e.tk * 0.03) * 0.03; e.vy += (hy - cy) * 0.0016;
        e.vx *= 0.97; e.vy *= 0.97;
        rec(Math.atan2(dy, dx));
        e.cd--;
        if (e.cd <= 0) { e.st = 1; e.cnt = 0; e.cd = 0; }
        if (e.tk % 200 === 100 && G.ents.filter(q => q.ty === 'servant').length < 6) { const s = spawnMob('servant', cx + 30, cy + 30, {}); s.vx = Math.random() * 4 - 2; s.vy = 2; sfxAt('roar', cx, cy); }
      } else if (e.st === 1) {
        if (e.cd === 0) { const a = Math.atan2(dy, dx); e.vx = Math.cos(a) * 9.5; e.vy = Math.sin(a) * 9.5; e.cd = 28; sfxAt('dash', cx, cy); rec(a); }
        e.cd--;
        if (e.cd <= 0 && e.cd > -3) { }
        if (e.cd < 0) { e.cnt++; e.cd = 0; if (e.cnt >= 3) { e.st = 0; e.cd = 140; } else { e.st = 2; e.cd = 24; } }
      } else if (e.st === 2) {
        e.vx *= 0.9; e.vy *= 0.9; rec(Math.atan2(dy, dx)); e.cd--;
        if (e.cd <= 0) { e.st = 1; e.cd = 0; }
      }
    } else {
      if (e.st === 10) {
        e.vx *= 0.93; e.vy *= 0.93; e.cd--; rec(Math.atan2(dy, dx));
        if (e.cd <= 0) { e.st = 11; e.cd = 0; e.cnt = 0; }
      } else if (e.st === 11) {
        if (e.cd === 0) { const a = Math.atan2(dy, dx); const sp = 11 + (frac < 0.25 ? 2 : 0); e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp; e.cd = 26; sfxAt('dash', cx, cy); rec(a); }
        e.cd--;
        if (e.cd < 0) { e.cnt++; e.cd = 0; if (e.cnt >= 4) { e.st = 12; e.cd = 90; e.cnt = 0; } else { e.st = 13; e.cd = 14; } }
      } else if (e.st === 13) {
        e.vx *= 0.88; e.vy *= 0.88; rec(Math.atan2(dy, dx)); e.cd--;
        if (e.cd <= 0) { e.st = 11; e.cd = 0; }
      } else if (e.st === 12) {
        const hx = tx + Math.cos(e.tk * 0.04) * 240, hy = ty - 150 + Math.sin(e.tk * 0.06) * 60;
        e.vx += (hx - cx) * 0.003; e.vy += (hy - cy) * 0.003; e.vx *= 0.96; e.vy *= 0.96; rec(Math.atan2(dy, dx));
        e.cd--;
        if (e.cd <= 0) { e.st = 11; e.cd = 0; e.cnt = 0; }
      }
    }
    const sp = Math.hypot(e.vx, e.vy);
    if (sp > 14) { e.vx *= 14 / sp; e.vy *= 14 / sp; }
    e.x += e.vx; e.y += e.vy;
    e.f = (e.tk >> 3) & 1;
    e.noContact = false;
    void d;
  }
  function dmgReduce(e, d, m) {
    let def = m.def;
    if (e.ty === 'eoc' && e.ph === 2) def = 0;
    return Math.max(1, Math.round(d - def * 0.5));
  }
  function hurtMob(e, dmg, kx, src, melee, fire) {
    if (e.hp <= 0) return;
    const m = MOB[e.ty];
    let d = dmgReduce(e, dmg, m);
    const crit = Math.random() < 0.04;
    if (crit) d *= 2;
    e.hp -= d; e.flash = 6;
    if (fire && !m.fire) e.fire = 240;
    if (kx) { e.vx += kx * (1 - m.kbr) * (m.boss ? 0.15 : 1); if (!m.fly && !m.boss) e.vy = Math.min(e.vy, -2 * (1 - m.kbr)); else if (m.fly && !m.boss) { e.vy += -0.5; } if (m.ai === 'worm') { e.vx = 0; } }
    addText(e.x + e.w / 2, e.y, String(d), crit ? '#ffa040' : '#ffe8d0', crit);
    spawnBlood(e.x + e.w / 2, e.y + e.h / 2, m.ai === 'slime' ? SLIMEDEF[m.sl] ? SLIMEDEF[m.sl].c : '#60c0ff' : '#b01818', 4, kx > 0 ? 1 : -1);
    sfxAt(m.ai === 'slime' ? 'slimehit' : 'mobhit', e.x, e.y);
    if (e.ty === 'eoc' && e.st === 0) e.cd = Math.min(e.cd, 60);
    if (G.net && G.net.role === 'host') sendNet({ t: 'fx', k: 'dmg', x: Math.round(e.x + e.w / 2), y: Math.round(e.y), v: d, c: crit ? 1 : 0 });
    if (e.hp <= 0) killMob(e, src);
  }
  function killMob(e, src) {
    if (e.hp > 0) e.hp = 0;
    if (e.dead === 'done') return;
    e.dead = 'done';
    const m = MOB[e.ty], cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    if (m.ai === 'slime') for (let i = 0; i < 8; i++) spawnBlood(cx, cy, SLIMEDEF[m.sl].c, 1, Math.random() < 0.5 ? 1 : -1);
    else { spawnBlood(cx, cy, '#b01818', 8, 1); spawnBlood(cx, cy, '#b01818', 8, -1); }
    sfxAt(m.boss ? 'bossdie' : 'mobdie', e.x, e.y);
    if (src && src.id !== undefined && src.k === 'player') { src.ch.kills = (src.ch.kills || 0) + 1; G.kills = (G.kills || 0) + 1; }
    if (m.ai === 'worm' && m.boss === 'eow') {
      const nx = e.next && G.ents.find(q => q.id === e.next), pv = e.prev && G.ents.find(q => q.id === e.prev);
      if (nx) { nx.prev = 0; nx.ty = 'eowH'; nx.hp = Math.min(nx.hp, MOB.eowH.hp); nx.ang = Math.atan2(nx.y - e.y, nx.x - e.x); }
      if (pv) { pv.next = 0; if (pv.prev) pv.ty = 'eowT'; else pv.ty = 'eowT'; }
      const left = G.ents.filter(q => q !== e && q.k === 'mob' && q.hp > 0 && MOB[q.ty].boss === 'eow').length;
      if (nx) { nx.x = nx.x; }
      if (!left) bossDefeated('eow', cx, cy, e);
      else if (Math.random() < 0.5) dropLoot(e, [['rottenChunk', 0.5, 1, 1]], [0, 0]);
      return;
    }
    if (m.boss) { bossDefeated(m.boss, cx, cy, e); return; }
    if (!AUTH()) return;
    dropLoot(e, m.drops, m.coin);
  }
  function dropLoot(e, drops, coin) {
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    for (const [id, pr, a, b] of drops) if (Math.random() < pr) spawnItem(cx, cy, id, a + (Math.random() * (b - a + 1) | 0), (Math.random() - 0.5) * 3, -2.5);
    const c = coin[0] + Math.random() * (coin[1] - coin[0]) | 0;
    if (c > 0) dropCoins(cx, cy, c);
    if (Math.random() < 0.05) spawnItem(cx, cy, 'heart', 1, (Math.random() - 0.5) * 2, -3);
    if (Math.random() < 0.04) spawnItem(cx, cy, 'manaStarPickup', 1, (Math.random() - 0.5) * 2, -3);
  }
  function bossDefeated(kind, cx, cy, e) {
    if (!AUTH()) return;
    W.flags[kind === 'king' ? 'kingSlime' : kind]++;
    announce(BOSSN[kind] + ' has been defeated!', '#ffe080');
    const D = MOB[e.ty];
    for (const [id, pr, a, b] of D.drops) if (Math.random() < pr) spawnItem(cx, cy, id, a + (Math.random() * (b - a + 1) | 0), (Math.random() - 0.5) * 5, -4);
    if (kind === 'king') { const pool = ['horseshoe', 'cloudBottle', 'balloon', 'hermes']; spawnItem(cx, cy, pool[Math.random() * pool.length | 0], 1, 0, -5); dropCoins(cx, cy, 20000 + (Math.random() * 10000 | 0)); }
    if (kind === 'eoc') { spawnItem(cx, cy, 'demoniteOre', 20 + (Math.random() * 20 | 0), (Math.random() - 0.5) * 4, -4); spawnItem(cx, cy, Math.random() < 0.5 ? 'bandRegen' : 'miningHelmet', 1, 0, -5); dropCoins(cx, cy, 30000 + (Math.random() * 15000 | 0)); }
    if (kind === 'eow') {
      spawnItem(cx, cy, 'demoniteOre', 30 + (Math.random() * 30 | 0), (Math.random() - 0.5) * 4, -4);
      spawnItem(cx, cy, 'shadowScale', 12 + (Math.random() * 12 | 0), (Math.random() - 0.5) * 4, -4);
      spawnItem(cx, cy, Math.random() < 0.5 ? 'vilethorn' : 'magicMirror', 1, 0, -5);
      dropCoins(cx, cy, 40000 + (Math.random() * 15000 | 0));
    }
    for (let i = 0; i < 40; i++) spawnSpark(cx, cy, '#ffe080', 1, 6);
  }
  function spawnProj(o) {
    const p = Object.assign({ id: newId(), k: 'proj', x: 0, y: 0, vx: 0, vy: 0, dmg: 1, kb: 1, owner: '', life: 60, grav: 0, gdelay: 0, pierce: 0, t: 0, hit: null, rot: 0, hostile: 0 }, o);
    p.px = p.x; p.py = p.y;
    p.hit = new Set();
    G.ents.push(p);
    return p;
  }
  function stepProj(q) {
    q.px = q.x; q.py = q.y; q.t++;
    if (q.t > q.gdelay) q.vy = Math.min(q.vy + q.grav, 14);
    const steps = Math.ceil(Math.hypot(q.vx, q.vy) / 6) || 1;
    for (let s = 0; s < steps; s++) {
      q.x += q.vx / steps; q.y += q.vy / steps;
      const tx = Math.floor(q.x / 16), ty = Math.floor(q.y / 16);
      if (SOLID[gt(tx, ty)] === 1 && !(q.pt === 'thorn')) {
        if (q.pt === 'arrow') { spawnTileParts(q.x, q.y, '#a8814b', 3); sfxAt('arrowhit', q.x, q.y); }
        else spawnSpark(q.x, q.y, projCol(q), 6, 2);
        q.hp = 0; q.dead = true; return;
      }
      if (q.pt === 'thorn' && SOLID[gt(tx, ty)] === 1) { q.vx *= 0.7; q.vy *= 0.7; q.life -= 4; }
      if (q.hostile) {
        for (const p of G.players.values()) {
          if (p.dead || p.iv > 0) continue;
          if (q.x > p.x && q.x < p.x + p.w && q.y > p.y && q.y < p.y + p.h) {
            const dir = q.vx > 0 ? 1 : -1;
            if (p.remote) { sendTo(p.id, { t: 'hurt', d: q.dmg, kx: dir * 3, ky: -2.5, by: 'Fire Imp' }); p.iv = 40; }
            else { damagePlayerLocal(p, q.dmg, dir * 3, -2.5, 'mob', false, 'Fire Imp'); p.fire = Math.max(p.fire, 150); }
            q.hp = 0; q.dead = true; spawnSpark(q.x, q.y, '#ff9030', 8, 3); return;
          }
        }
      } else {
        for (const e of G.ents) {
          if (e.k !== 'mob' || e.hp <= 0 || q.hit.has(e.id)) continue;
          if (q.x > e.x - 3 && q.x < e.x + e.w + 3 && q.y > e.y - 3 && q.y < e.y + e.h + 3) {
            q.hit.add(e.id);
            const own = G.players.get(q.owner);
            hurtMob(e, dmgVar(q.dmg), (q.vx > 0 ? 1 : -1) * (q.kb || 1), own || null, false, q.fire ? 1 : 0);
            if (q.pierce > 0) q.pierce--; else { q.hp = 0; q.dead = true; spawnSpark(q.x, q.y, projCol(q), 5, 2); return; }
          }
        }
      }
    }
    if (q.pt === 'arrow' || q.pt === 'bolt') q.rot = Math.atan2(q.vy, q.vx);
    if (q.pt === 'bolt' && q.t % 2 === 0) parts.push({ x: q.x, y: q.y, vx: 0, vy: 0, g: 0, life: 12, max: 12, col: projCol(q), s: 2 });
    if (q.pt === 'fire' && q.t % 2 === 0) parts.push({ x: q.x, y: q.y, vx: (Math.random() - 0.5), vy: -0.5, g: 0, life: 14, max: 14, col: '#ff9a30', s: 2 });
    if (q.fire && q.t % 3 === 0) parts.push({ x: q.x, y: q.y, vx: 0, vy: -0.4, g: 0, life: 12, max: 12, col: '#ff8020', s: 2 });
    if (--q.life <= 0) { q.hp = 0; q.dead = true; }
  }
  const BOLTC = { spark: '#ffd040', amethyst: '#c060ff', topaz: '#ffc030', sapphire: '#4a90ff', emerald: '#40e070', ruby: '#ff4050', diamond: '#d8f4ff', thorn: '#9a50d0' };
  const projCol = q => q.pt === 'fire' ? '#ff9030' : q.pt === 'arrow' ? '#c8a060' : BOLTC[q.bolt] || '#ffffff';
  function nearMobs(p) {
    let n = 0;
    const cx = pcx(p), cy = pcy(p);
    for (const e of G.ents) if (e.k === 'mob' && !MOB[e.ty].boss && e.hp > 0 && Math.abs(e.x - cx) < 1500 && Math.abs(e.y - cy) < 1000) n++;
    return n;
  }
  function spawnTable(x, y, bio, p) {
    const night = !W.day, surfY = W.surf[x];
    const hell = y >= W.hellY, cav = y >= W.rockY, under = y > surfY + 6;
    const L = [];
    if (hell) return [['lavaSlime', 10], ['fireImp', 8], ['hellBat', 10]];
    if (bio === BIOME.OCEAN) return under ? [['caveBat', 4]] : [];
    if (bio === BIOME.MUSHROOM) return [];
    if (bio === BIOME.CORRUPT) {
      if (cav) return [['eaterOfSouls', 10], ['devourer', 5], ['purpleSlime', 6], ['skeleton', 3]];
      if (under) return [['eaterOfSouls', 10], ['devourer', 4], ['purpleSlime', 5]];
      return night ? [['eaterOfSouls', 8], ['zombie', 5], ['purpleSlime', 3]] : [['eaterOfSouls', 5], ['purpleSlime', 6]];
    }
    if (cav) {
      L.push(['skeleton', 8], ['blackSlime', 6], ['blueSlime', 4], ['giantWorm', 4], [bio === BIOME.SNOW ? 'iceBat' : 'caveBat', 10]);
      if (bio === BIOME.SNOW) L.push(['iceSlime', 8]);
      if (bio === BIOME.DESERT) L.push(['yellowSlime', 5]);
      return L;
    }
    if (under) {
      L.push(['blueSlime', 10], ['greenSlime', 4], [bio === BIOME.SNOW ? 'iceBat' : 'caveBat', 8], ['giantWorm', 3], ['zombie', 2]);
      if (bio === BIOME.SNOW) L.push(['iceSlime', 8]);
      if (bio === BIOME.DESERT) L.push(['yellowSlime', 6]);
      return L;
    }
    if (night) {
      L.push(['zombie', 10], ['demonEye', 7], ['blueSlime', 3]);
      if (bio === BIOME.SNOW) L.push(['iceSlime', 6]);
      if (bio === BIOME.DESERT) L.push(['yellowSlime', 2]);
    } else {
      if (bio === BIOME.SNOW) L.push(['iceSlime', 10], ['blueSlime', 2]);
      else if (bio === BIOME.DESERT) L.push(['yellowSlime', 8], ['greenSlime', 2]);
      else L.push(['greenSlime', 10], ['blueSlime', 4]);
    }
    return L;
  }
  function pickWeighted(L) { let s = 0; for (const a of L) s += a[1]; let r = Math.random() * s; for (const a of L) { r -= a[1]; if (r <= 0) return a[0]; } return null; }
  function trySpawnFor(p) {
    const cnt = nearMobs(p);
    const cx = Math.floor(pcx(p) / 16), cy = Math.floor(pcy(p) / 16);
    const underground = cy > W.surf[clamp(cx, 0, W.w - 1)] + 6;
    const cap = 6 + (!W.day ? 3 : 0) + (underground ? 3 : 0);
    if (cnt >= cap) return;
    const view = G.viewTiles || [40, 24];
    for (let tr = 0; tr < 14; tr++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const dx = side * (view[0] / 2 + 6 + Math.random() * 20), dy = (Math.random() - 0.5) * (view[1] + 16);
      const tx = Math.floor(cx + dx), ty = Math.floor(cy + dy);
      if (tx < 3 || tx >= W.w - 3 || ty < 3 || ty >= W.h - 3) continue;
      let ok = true;
      for (const q of G.players.values()) if (!q.dead && Math.abs(tx - pcx(q) / 16) < view[0] / 2 + 3 && Math.abs(ty - pcy(q) / 16) < view[1] / 2 + 3) { ok = false; break; }
      if (!ok) continue;
      const bio = W.bio[tx];
      const tab = spawnTable(tx, ty, bio, p);
      if (!tab.length) continue;
      const ty2 = pickWeighted(tab);
      if (!ty2) continue;
      const m = MOB[ty2];
      if (m.fly) {
        if (SOLID[gt(tx, ty)] || SOLID[gt(tx + 1, ty)] || SOLID[gt(tx, ty + 1)] || glq(tx, ty) > 100) continue;
        if (ty2 === 'demonEye' && ty > W.surf[tx] + 4) continue;
        if (ty2 === 'caveBat' || ty2 === 'iceBat' || ty2 === 'hellBat') { }
        if (ty2 === 'eaterOfSouls' || ty2 === 'devourer' || ty2 === 'giantWorm') { }
      }
      if (m.ai === 'worm') {
        if (!SOLID[gt(tx, ty)] && !(SOLID[gt(tx, ty + 1)])) { }
        spawnWormMob(ty2, tx * 16 + 8, ty * 16 + 8);
        return;
      }
      if (!m.fly) {
        let fy = ty, n = 0;
        while (!SOLID[gt(tx, fy + 1)] && n++ < 40) fy++;
        if (n >= 40 || fy > ty + 30) continue;
        const wt = Math.ceil(m.w / 16) + 1, ht = Math.ceil(m.h / 16);
        let free = true;
        for (let yy = 0; yy < ht && free; yy++) for (let xx = 0; xx < wt; xx++) if (SOLID[gt(tx + xx - (wt >> 1), fy - yy)] || glq(tx + xx - (wt >> 1), fy - yy) > 150 && !m.lavaOk) { free = false; break; }
        if (!free) continue;
        if (ty2 !== 'lavaSlime' && glq(tx, fy) > 60) continue;
        const e = spawnMob(ty2, tx * 16 + 8, (fy + 1) * 16);
        return e;
      }
      spawnMob(ty2, tx * 16 + 8, ty * 16 + 16);
      return;
    }
  }
  function spawnWormMob(ty, x, y) {
    const m = MOB[ty], n = m.segs, arr = [];
    for (let i = 0; i < n; i++) {
      const e = newMob(ty, x - i * m.sz * 0.78, y + m.h / 2, { seg: i === 0 ? 'head' : i === n - 1 ? 'tail' : 'body' });
      e.hp = e.hpMax = Math.round(m.hp * (i === 0 ? 1 : 0.8));
      e.ang = Math.random() < 0.5 ? 0 : Math.PI;
      G.ents.push(e); arr.push(e);
    }
    for (let i = 0; i < arr.length; i++) { arr[i].prev = i > 0 ? arr[i - 1].id : 0; arr[i].next = i < arr.length - 1 ? arr[i + 1].id : 0; }
  }
  function stepSpawner() {
    if (G.tick % 24 !== 0) return;
    if (G.tick < 300) return;
    for (const p of G.players.values()) {
      if (p.dead) continue;
      const night = !W.day;
      const cx = Math.floor(pcx(p) / 16), cy = Math.floor(pcy(p) / 16);
      const underground = cy > W.surf[clamp(cx, 0, W.w - 1)] + 6;
      let rate = night ? 0.28 : 0.14;
      if (underground) rate = 0.22;
      if (cy >= W.hellY) rate = 0.25;
      let npcNear = 0;
      for (const n of G.npcs) if (Math.abs(n.x / 16 - cx) < 60 && Math.abs(n.y / 16 - cy) < 40) npcNear++;
      if (npcNear >= 2) rate *= 0.5;
      if (Math.random() < rate) trySpawnFor(p);
    }
    if (!W.day && G.tick % 240 === 0 && Math.random() < 0.35) {
      const ps = [...G.players.values()].filter(p => !p.dead && pcy(p) < W.rockY * 16);
      if (ps.length) {
        const p = ps[Math.random() * ps.length | 0];
        const x = pcx(p) + (Math.random() - 0.5) * 1200, y = Math.max(40, p.y - 700);
        const e = { id: newId(), k: 'fstar', x, y, px: x, py: y, w: 8, h: 8, vx: 4 + Math.random() * 2, vy: 5 + Math.random() * 2, hp: 1, age: 0 };
        G.ents.push(e);
      }
    }
  }
  function stepStar(e) {
    e.px = e.x; e.py = e.y; e.age++;
    e.x += e.vx; e.y += e.vy;
    if (Math.random() < 0.6) parts.push({ x: e.x, y: e.y, vx: -e.vx * 0.1, vy: -e.vy * 0.1, g: 0, life: 20, max: 20, col: Math.random() < 0.5 ? '#fff0a0' : '#ffffff', s: 2 });
    const tx = Math.floor(e.x / 16), ty = Math.floor(e.y / 16);
    if (SOLID[gt(tx, ty)] === 1 || e.y > W.h * 16 || e.x < 0 || e.x > W.w * 16) {
      e.hp = 0;
      if (AUTH() && e.y < W.h * 16 - 100 && e.y > 0 && ty < W.rockY) { const it_ = spawnItem(e.x, e.y - 8, 'fallenStar', 1, 0, -1); if (it_) it_.life = 3600 * 3; }
      for (let i = 0; i < 10; i++) spawnSpark(e.x, e.y, '#fff0a0', 1, 3);
    }
  }
  function stepEnts() {
    const list = G.ents;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.hp <= 0 && !e.dead) { e.dead = true; }
      if (e.dead) continue;
      if (e.k === 'mob') stepMob(e);
      else if (e.k === 'proj') stepProj(e);
      else if (e.k === 'item') { stepItem(e); stepItemPickup(e); }
      else if (e.k === 'fstar') stepStar(e);
    }
    let j = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.dead || e.hp <= 0 && e.k !== 'mob') { if (e.k === 'mob' && e.dead !== 'done' && e.hp <= 0) { } continue; }
      if (e.k === 'mob' && e.hp <= 0) continue;
      if (e.k === 'mob' && !MOB[e.ty].boss) {
        let far = true;
        for (const p of G.players.values()) if (Math.abs(pcx(p) - e.x) < 1900 && Math.abs(pcy(p) - e.y) < 1200) { far = false; break; }
        if (far) continue;
      }
      list[j++] = e;
    }
    list.length = j;
  }
  const NPCDEF = {
    guide: { n: 'Guide', look: 'guide', hp: 250, names: ['Andrew', 'Jack', 'Alex', 'Ben', 'Cody', 'Dan', 'Eric', 'Finn'] },
    merchant: { n: 'Merchant', look: 'merchant', hp: 250, names: ['Edwin', 'Dwyer', 'Alvin', 'Bran', 'Cecil', 'Dale', 'Ford', 'Gus'] }
  };
  const GUIDE_TIPS = [
    'You can use your copper pickaxe to dig through dirt and your copper axe to chop down trees. Use the mouse wheel or the number keys to pick a tool.',
    'Wood is the first thing every adventurer needs. Chop a tree, then build a Work Bench from 10 wood to unlock more recipes.',
    'Night brings zombies and demon eyes. Build a house with walls, a door, a table, a chair and a torch, and I will move in.',
    'A valid house needs a door, a chair, a table or work bench and a light source, all inside enclosed walls with a background wall.',
    'Ores hide deeper underground. Smelt ore into bars at a Furnace, then forge tools and armor on an Iron Anvil.',
    'Torches light the way and keep you safe from the dark. Craft them from wood and gel dropped by slimes.',
    'Mana Crystals and Life Crystals make you stronger. Fallen stars drop from the sky at night, collect five for a Mana Crystal.',
    'Watch out for the Corruption. Its shadow orbs can be smashed with a hammer, and the third one calls the Eater of Worlds.',
    'Slimes drop gel, and a gold bar plus gel makes a Slime Crown. Use it to challenge King Slime.',
    'Lens from demon eyes crafted at a Demon Altar make a Suspicious Looking Eye. Use it at night to face the Eye of Cthulhu.',
    'Lava is deadly and water slows you down. An obsidian bridge forms where they meet.',
    'Right-click doors, chests and beds. Sleeping in a bed sets your spawn point.'
  ];
  const nameTaken = nm => G.npcs.some(n => n.name === nm);
  function newNpc(ty, x, y, o) {
    const d = NPCDEF[ty];
    let nm = d.names[Math.random() * d.names.length | 0];
    for (let i = 0; i < 8 && nameTaken(nm); i++) nm = d.names[Math.random() * d.names.length | 0];
    return Object.assign({ id: newId(), k: 'npc', ty, name: nm, x: x - 10, y: y - 42, px: x - 10, py: y - 42, w: 20, h: 42, vx: 0, vy: 0, dir: 1, hp: d.hp, hpMax: d.hp, iv: 0, home: null, gnd: false, fr: 0, frT: 0, cd: 60, st: 0, talk: 0, flash: 0 }, o || {});
  }
  function hurtNpc(n, dmg, kx) {
    if (n.hp <= 0 || n.iv > 0) return;
    n.hp -= dmg; n.iv = 30; n.flash = 6; n.vx = kx; n.vy = -2.5;
    addText(n.x + 10, n.y, String(dmg), '#ffa0a0');
    spawnBlood(n.x + 10, n.y + 20, '#c01818', 5, kx > 0 ? 1 : -1);
    sfxAt('hurt', n.x, n.y);
    if (n.hp <= 0) killNpc(n);
  }
  function killNpc(n) {
    n.hp = 0; n.dead = true;
    announce(n.name + ' the ' + NPCDEF[n.ty].n + ' was slain.', '#ff7070');
    W.npcDead = W.npcDead || {};
    W.npcDead[n.ty] = W.days;
    if (n.ty === 'guide') W.flags.guideDead++;
    for (let i = 0; i < 18; i++) spawnBlood(n.x + 10, n.y + 20, '#c01818', 1, Math.random() < 0.5 ? 1 : -1);
  }
  function floodRoom(sx, sy) {
    const seen = new Map(), q = [[sx, sy]];
    seen.set(sy * W.w + sx, 1);
    let doors = 0, light = 0, table = 0, chair = 0, ok = true;
    const bounds = [sx, sy, sx, sy];
    while (q.length) {
      const [x, y] = q.pop();
      const t = gt(x, y);
      if (t === T.DOORC || t === T.DOORO) { doors++; continue; }
      if (SOLID[t]) continue;
      if (seen.size > 750) { ok = false; break; }
      if (t === T.CHAIR) chair++;
      if (t === T.TABLE || t === T.WORKBENCH) table++;
      if (TD[t].lt) light++;
      if (!WHOUSE[gwl(x, y)]) { ok = false; break; }
      if (x < bounds[0]) bounds[0] = x; if (y < bounds[1]) bounds[1] = y; if (x > bounds[2]) bounds[2] = x; if (y > bounds[3]) bounds[3] = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * W.w + nx;
        if (nx < 1 || ny < 1 || nx >= W.w - 1 || ny >= W.h - 1) { ok = false; break; }
        if (!seen.has(k)) { seen.set(k, 1); q.push([nx, ny]); }
      }
      if (!ok) break;
    }
    if (!ok || seen.size < 60) return null;
    if (!doors || !light || !table || !chair) return null;
    return { n: seen.size, b: bounds, cells: seen };
  }
  function scanHouses() {
    const out = [], used = new Set();
    for (const p of G.players.values()) {
      const px = Math.floor(pcx(p) / 16), py = Math.floor(pcy(p) / 16);
      for (let y = Math.max(2, py - 36); y < Math.min(W.h - 2, py + 36); y++) for (let x = Math.max(2, px - 70); x < Math.min(W.w - 2, px + 70); x++) {
        if (W.t[y * W.w + x] !== T.CHAIR) continue;
        const f = W.fr[y * W.w + x];
        const k = y * W.w + x;
        if (used.has(k)) continue;
        const r = floodRoom(x, y);
        if (!r) continue;
        for (const ck of r.cells.keys()) used.add(ck);
        void f;
        out.push({ x, y, b: r.b, n: r.n });
      }
    }
    return out;
  }
  function assignHomes() {
    const hs = scanHouses();
    G.houses = hs;
    const taken = new Set();
    for (const n of G.npcs) {
      if (n.home) {
        const h = hs.find(h => Math.abs(h.x - n.home.x) <= 12 && Math.abs(h.y - n.home.y) <= 8 && n.home.x >= h.b[0] && n.home.x <= h.b[2] && n.home.y >= h.b[1] && n.home.y <= h.b[3]);
        if (h && !taken.has(h)) { taken.add(h); continue; }
        n.home = null;
      }
    }
    for (const n of G.npcs) {
      if (n.home) continue;
      const h = hs.find(h => !taken.has(h));
      if (h) { taken.add(h); n.home = { x: h.x, y: h.y }; announce(n.name + ' the ' + NPCDEF[n.ty].n + ' has a new home.', '#a0e0ff'); }
    }
  }
  function playerWealth() {
    let m = 0;
    for (const p of G.players.values()) m = Math.max(m, p.coins | 0);
    return m;
  }
  function npcArrivals() {
    const have = ty => G.npcs.some(n => n.ty === ty && n.hp > 0);
    const dead = W.npcDead || {};
    if (!have('guide') && dead.guide !== undefined && W.days > dead.guide) {
      const sp = [...G.players.values()][0];
      const x = W.spawnX * 16 + 8, y = W.spawnY * 16 + 16;
      G.npcs.push(newNpc('guide', x, y));
      delete dead.guide;
      announce('The Guide has returned.', '#a0e0ff');
      void sp;
    }
    if (!have('merchant') && (dead.merchant === undefined || W.days > dead.merchant) && W.day && playerWealth() >= 5000 && G.houses && G.houses.length > G.npcs.filter(n => n.home).length) {
      const h = G.houses.find(h => !G.npcs.some(n => n.home && Math.abs(n.home.x - h.x) < 3 && Math.abs(n.home.y - h.y) < 3));
      if (h) {
        const n = newNpc('merchant', h.x * 16 + 8, (h.y + 1) * 16, { home: { x: h.x, y: h.y } });
        G.npcs.push(n); W.flags.merchant = 1; delete dead.merchant;
        announce('The Merchant has arrived!', '#a0e0ff');
      }
    }
  }
  function stepNpc(n) {
    n.px = n.x; n.py = n.y;
    if (n.iv > 0) n.iv--;
    if (n.flash > 0) n.flash--;
    updateLiquidFlags(n);
    n.vy = Math.min(n.vy + 0.3, 9);
    if (n.inW) n.vy = Math.min(n.vy, 1.5);
    if (n.inL) { n.hp -= 1; if (n.hp <= 0) { killNpc(n); return; } n.vy = -2; }
    if (n.hp < n.hpMax && G.tick % 120 === 0) n.hp++;
    let target = null;
    const cx = n.x + 10;
    if (n.home) {
      const hx = n.home.x * 16 + 8;
      if (!W.day) target = hx;
      else if (n.cd <= 0) { n.st = Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? -1 : 1); n.cd = 60 + (Math.random() * 180 | 0); n.wx = hx + (Math.random() - 0.5) * 220; }
      else if (n.wx !== undefined && n.st !== 0) target = n.wx;
    } else {
      if (n.cd <= 0) { n.st = Math.random() < 0.55 ? 0 : (Math.random() < 0.5 ? -1 : 1); n.cd = 60 + (Math.random() * 200 | 0); n.wx = W.spawnX * 16 + (Math.random() - 0.5) * 700; }
      else if (n.wx !== undefined && n.st !== 0) target = n.wx;
    }
    n.cd--;
    let want = 0;
    if (target !== null && Math.abs(target - cx) > 6) want = target > cx ? 1 : -1;
    if (n.talk > 0) { want = 0; n.talk--; }
    if (want) { n.dir = want; n.vx = clamp(n.vx + want * 0.1, -1.1, 1.1); } else n.vx *= 0.7;
    let threat = false;
    for (const e of G.ents) if (e.k === 'mob' && e.hp > 0 && !MOB[e.ty].boss && Math.abs(e.x - n.x) < 130 && Math.abs(e.y - n.y) < 60) { threat = true; n.vx = clamp(n.vx + (e.x < n.x ? 1 : -1) * 0.12, -1.6, 1.6); n.dir = e.x < n.x ? 1 : -1; }
    void threat;
    moveBody(n, { step: 1 });
    if (n.bx && n.gnd) {
      const tx = Math.floor((n.bx > 0 ? n.x + n.w + 1 : n.x - 1) / 16);
      let door = false;
      for (let r = Math.floor(n.y / 16); r <= Math.floor((n.y + n.h - 1) / 16); r++) { if (gt(tx, r) === T.DOORC) { toggleDoor(tx, r, n.x); door = true; break; } }
      if (!door && n.cd % 20 === 0) n.vy = -5.6;
    }
    if (n.gnd && Math.abs(n.vx) > 0.15) { n.frT += Math.abs(n.vx) * 0.07; n.fr = 1 + (Math.floor(n.frT * 8) % 8); } else if (!n.gnd) n.fr = 9; else n.fr = 0;
    if (n.y > W.h * 16 - 40) { n.y = W.surf[W.spawnX] * 16 - 60; n.vy = 0; }
  }
  function stepNpcs() {
    for (let i = G.npcs.length - 1; i >= 0; i--) {
      const n = G.npcs[i];
      if (n.dead) { G.npcs.splice(i, 1); continue; }
      stepNpc(n);
    }
    if (G.tick % 300 === 120) assignHomes();
    if (G.tick % 600 === 360) npcArrivals();
  }
  function npcAt(px, py) {
    for (const n of G.npcs) if (px >= n.x - 4 && px <= n.x + n.w + 4 && py >= n.y - 4 && py <= n.y + n.h + 2) return n;
    return null;
  }
  function npcLine(n) {
    const me = G.me;
    if (n.ty === 'guide') {
      if (!W.day) return 'Be careful out there. The undead walk at night, and the demon eyes are worse.';
      return GUIDE_TIPS[G.tipN % GUIDE_TIPS.length];
    }
    const lines = ['Looking to buy something? I have the finest wares around.', 'I can sell you torches, ropes, arrows and tools for your coin.', 'Mind the lava. I would hate to lose a customer.', 'Business is good since you built this house.'];
    return lines[(me ? me.ch.deaths + G.tick / 600 | 0 : 0) % lines.length];
  }
  function serializeNpc(n) { return { ty: n.ty, name: n.name, x: Math.round(n.x), y: Math.round(n.y), home: n.home, hp: n.hp }; }
  function restoreNpc(o) { const n = newNpc(o.ty, o.x + 10, o.y + 42, { name: o.name, home: o.home, hp: o.hp || NPCDEF[o.ty].hp }); return n; }
  const UI = { w: 960, h: 600, dpr: 1, S: 1, zs: 2, camX: 0, camY: 0, open: false, held: null, chest: null, chestItems: null, shop: false, talk: null, map: false, recSel: -1, recScroll: 0, shopScroll: 0, btns: [], mx: -99, my: -99, mouse: false, touch: false, hover: null, trash: [null], near: {}, recList: [], recT: 0, craftHold: 0, narrow: false, L: null, tipItem: null, helpOpen: false, mmOn: true };
  const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';
  function txt(h, s, x, y, col, px, al, bold) {
    h.font = (bold === false ? '' : 'bold ') + px + 'px ' + FONT;
    h.textAlign = al || 'left'; h.textBaseline = 'alphabetic';
    h.lineWidth = Math.max(2, px / 4); h.lineJoin = 'round'; h.strokeStyle = 'rgba(0,0,0,0.88)';
    h.strokeText(s, x, y);
    h.fillStyle = col || '#fff'; h.fillText(s, x, y);
  }
  function wrapText(h, s, maxW, px) {
    h.font = 'bold ' + px + 'px ' + FONT;
    const words = String(s).split(' '), lines = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (h.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function btn(x, y, w, hh, k, a, b, o) { UI.btns.push(Object.assign({ x, y, w, h: hh, k, a, b }, o || {})); }
  function hitBtn(x, y) {
    for (let i = UI.btns.length - 1; i >= 0; i--) { const b = UI.btns[i]; if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return b; }
    return null;
  }
  function panelBox(h, x, y, w, hh, a) {
    const r = 8 * UI.S;
    h.beginPath(); h.roundRect ? h.roundRect(x, y, w, hh, r) : h.rect(x, y, w, hh);
    h.fillStyle = 'rgba(22,28,64,' + (a || 0.82) + ')'; h.fill();
    h.lineWidth = 1.5; h.strokeStyle = 'rgba(150,170,255,0.45)'; h.stroke();
  }
  function iconDraw(h, id, x, y, size, alpha) {
    const ic = iconOf(id);
    if (!ic) return;
    let k = size / 24;
    if (ic.width * k > size) k = size / ic.width;
    if (ic.height * k > size) k = Math.min(k, size / ic.height);
    const w = ic.width * k, hh = ic.height * k;
    h.imageSmoothingEnabled = false;
    if (alpha !== undefined) h.globalAlpha = alpha;
    h.drawImage(ic, Math.round(x + (size - w) / 2), Math.round(y + (size - hh) / 2), Math.round(w), Math.round(hh));
    h.globalAlpha = 1;
  }
  function slotBg(h, x, y, s, o) {
    o = o || {};
    h.beginPath(); h.roundRect ? h.roundRect(x, y, s, s, 4 * UI.S) : h.rect(x, y, s, s);
    const gr = h.createLinearGradient(0, y, 0, y + s);
    gr.addColorStop(0, o.sel ? 'rgba(98,110,196,0.95)' : 'rgba(66,80,160,0.82)'); gr.addColorStop(1, o.sel ? 'rgba(60,70,150,0.95)' : 'rgba(36,46,110,0.82)');
    h.fillStyle = gr; h.fill();
    h.lineWidth = o.sel ? 2.4 : 1.4; h.strokeStyle = o.sel ? '#ffe680' : o.hover ? '#ffffff' : 'rgba(170,184,255,0.55)'; h.stroke();
    if (o.tint) { h.fillStyle = o.tint; h.fill(); }
  }
  function drawStack(h, st, x, y, s, o) {
    o = o || {};
    slotBg(h, x, y, s, o);
    if (o.label) txt(h, o.label, x + s / 2, y + s * 0.62, 'rgba(180,196,255,0.5)', s * 0.28, 'center');
    if (!st) return;
    iconDraw(h, st.id, x + s * 0.1, y + s * 0.1, s * 0.8, o.dim ? 0.4 : 1);
    if (st.n > 1) txt(h, String(st.n), x + s * 0.12, y + s * 0.92, '#fff', s * 0.3);
  }
  const SPEEDT = u => u <= 8 ? 'Insanely fast' : u <= 20 ? 'Very fast' : u <= 25 ? 'Fast' : u <= 30 ? 'Average' : u <= 35 ? 'Slow' : u <= 45 ? 'Very slow' : 'Extremely slow';
  const KBT = k => k <= 0 ? 'No' : k <= 1.5 ? 'Extremely weak' : k <= 3 ? 'Very weak' : k <= 4 ? 'Weak' : k <= 6 ? 'Average' : k <= 7 ? 'Strong' : k <= 9 ? 'Very strong' : 'Extremely strong';
  function tipLines(id, n) {
    const d = IT[id];
    const L = [{ s: d.n + (n > 1 ? ' (' + n + ')' : ''), c: RARC[d.rar] || '#fff' }];
    const add = (s, c) => L.push({ s, c: c || '#ddd' });
    if (d.t === 'weapon' || (d.t === 'tool' && !d.mirror)) {
      const cls = d.style === 'bow' ? 'ranged' : d.style === 'staff' ? 'magic' : 'melee';
      if (d.dmg) add(d.dmg + ' ' + cls + ' damage');
      add(SPEEDT(d.use) + ' speed');
      if (d.kb) add(KBT(d.kb) + ' knockback');
      if (d.mana) add('Uses ' + d.mana + ' mana');
    }
    if (d.pick) add(d.pick + '% pickaxe power');
    if (d.axe) add(d.axe + '% axe power');
    if (d.hammer) add(d.hammer + '% hammer power');
    if (d.t === 'armor') { add(d.def + ' defense'); if (d.tip) add(d.tip, '#9fe0ff'); }
    if (d.t === 'ammo') add(d.dmg + ' ammo damage');
    if (d.t === 'block' || d.t === 'wall') add('Can be placed');
    if (d.t === 'use' && d.sick) add('Potion sickness for 1 minute', '#ff9a9a');
    if (d.tip && d.t !== 'armor') add(d.tip, '#cfe');
    if (d.t === 'acc') add('Equippable accessory', '#a0c0ff');
    if (d.v > 0) add('Value: ' + coinText(d.v), '#ffe9a0');
    else if (d.t !== 'block' && d.t !== 'wall' && d.t !== 'coin') add('No value', '#999');
    return L;
  }
  function drawTip(h, lines, mx, my) {
    const px = 13 * UI.S;
    h.font = 'bold ' + px + 'px ' + FONT;
    let w = 0;
    for (const l of lines) w = Math.max(w, h.measureText(l.s).width);
    w += 18 * UI.S; const hh = lines.length * (px + 4 * UI.S) + 10 * UI.S;
    let x = mx + 18, y = my + 20;
    if (x + w > UI.w - 4) x = mx - w - 12;
    if (y + hh > UI.h - 4) y = UI.h - hh - 4;
    if (x < 4) x = 4;
    h.beginPath(); h.roundRect ? h.roundRect(x, y, w, hh, 6) : h.rect(x, y, w, hh);
    h.fillStyle = 'rgba(14,16,48,0.95)'; h.fill(); h.lineWidth = 1.5; h.strokeStyle = 'rgba(160,176,255,0.6)'; h.stroke();
    lines.forEach((l, i) => txt(h, l.s, x + 9 * UI.S, y + 9 * UI.S + px + i * (px + 4 * UI.S) - 2, l.c, px));
  }
  function layout() {
    const w = UI.w, hh = UI.h;
    const narrow = w < 720 || w < hh * 0.9;
    const S = narrow ? clamp(w / 462, 0.6, 1.25) : clamp(Math.min(w / 990, hh / 650), 0.6, 1.5);
    UI.S = S; UI.narrow = narrow;
    const sl = 40 * S, gap = 4 * S, pitch = sl + gap, x0 = narrow ? Math.max(4, (w - 10 * pitch + gap) / 2) : 10 * S, y0 = 8 * S;
    UI.L = { S, narrow, sl, gap, pitch, x0, y0 };
    return UI.L;
  }
  const slotXY = (L, i) => ({ x: L.x0 + (i % 10) * L.pitch, y: L.y0 + Math.floor(i / 10) * L.pitch });
  function drawInvSlot(h, name, arr, i, x, y, s, o) {
    o = o || {};
    const hov = UI.hover && UI.hover.k === 'slot' && UI.hover.a === name && UI.hover.b === i;
    const st = arr[i];
    let dim = false;
    if (UI.held && !accepts(name, i, UI.held.id)) dim = true;
    drawStack(h, st, x, y, s, { sel: o.sel, hover: hov, label: o.label, dim: false });
    void dim;
    btn(x, y, s, s, 'slot', name, i);
    if (hov && st && !UI.held) UI.tipItem = st;
  }
  function drawHotbarAndInv(h) {
    const p = G.me, L = UI.L, n = UI.open ? 40 : 10;
    for (let i = 0; i < n; i++) {
      const { x, y } = slotXY(L, i);
      const hov = UI.hover && UI.hover.k === 'slot' && UI.hover.a === 'inv' && UI.hover.b === i;
      drawStack(h, p.inv[i], x, y, L.sl, { sel: i === p.sel, hover: hov });
      if (i < 10) txt(h, String((i + 1) % 10), x + L.sl - 4 * L.S, y + 10 * L.S, 'rgba(255,255,255,0.65)', 9.5 * L.S, 'right');
      btn(x, y, L.sl, L.sl, 'slot', 'inv', i);
      if (hov && p.inv[i] && !UI.held) UI.tipItem = p.inv[i];
    }
    if (!UI.open) {
      const s = p.inv[p.sel];
      if (s) txt(h, IT[s.id].n, L.x0 + 5 * L.pitch - L.gap / 2, L.y0 + L.pitch + 12 * L.S, '#fff', 12 * L.S, 'center');
    }
  }
  const EQLAB = ['Head', 'Body', 'Legs', 'Acc', 'Acc', 'Acc'];
  function drawEquip(h, x, y) {
    const p = G.me, L = UI.L;
    for (let i = 0; i < 6; i++) {
      const sx = x + i * L.pitch;
      drawInvSlot(h, 'armor', p.armor, i, sx, y, L.sl, { label: EQLAB[i] });
    }
    txt(h, 'Defense ' + p.st.def, x + 6 * L.pitch + 8 * L.S, y + L.sl * 0.62, '#9fd0ff', 13 * L.S);
  }
  function drawCoinsAmmo(h, x, y) {
    const p = G.me, L = UI.L;
    const c = coinSplit(p.coins | 0);
    const ks = ['pt', 'au', 'ag', 'cu'];
    txt(h, 'Coins', x, y + 10 * L.S, '#fff', 11 * L.S);
    ks.forEach((k, i) => {
      const v = c[k];
      h.imageSmoothingEnabled = false;
      h.globalAlpha = v ? 1 : 0.35;
      h.drawImage(coinImg[k], x, y + 14 * L.S + i * 18 * L.S, 18 * L.S, 18 * L.S);
      h.globalAlpha = 1;
      txt(h, String(v), x + 22 * L.S, y + 28 * L.S + i * 18 * L.S, v ? '#fff' : '#889', 12 * L.S);
    });
    const ax = x + 62 * L.S;
    txt(h, 'Ammo', ax, y + 10 * L.S, '#fff', 11 * L.S);
    for (let i = 0; i < 4; i++) drawInvSlot(h, 'ammo', p.ammo, i, ax, y + 14 * L.S + i * 18 * L.S * 0 + i * (L.sl * 0.5 + 2), L.sl * 0.5, {});
  }
  function drawTrash(h, x, y) {
    const L = UI.L;
    drawInvSlot(h, 'trash', UI.trash, 0, x, y, L.sl, { label: 'Trash' });
  }
  function nearStations() {
    const p = G.me, cx = Math.floor(pcx(p) / 16), cy = Math.floor(pcy(p) / 16), n = {};
    for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 5; x <= cx + 5; x++) {
      const t = gt(x, y);
      if (t === T.WORKBENCH) n.bench = 1; else if (t === T.FURNACE) n.furnace = 1; else if (t === T.HELLFORGE) { n.forge = 1; n.furnace = 1; } else if (t === T.ANVIL) n.anvil = 1; else if (t === T.ALTAR) n.altar = 1;
    }
    return n;
  }
  function canCraft(r) {
    const p = G.me;
    if (r.st && !UI.near[r.st]) return false;
    for (const k in r.ins) if (invCount(p, k) < r.ins[k]) return false;
    return true;
  }
  function refreshRecipes() {
    UI.near = nearStations();
    const a = [], b = [];
    for (const r of RECIPES) (canCraft(r) ? a : b).push(r);
    UI.recList = a.concat(b);
    UI.recCan = a.length;
    if (UI.recSel >= UI.recList.length) UI.recSel = -1;
  }
  function giveOrDropMe(id, n) {
    const p = G.me;
    const left = addToInv(p, id, n);
    if (left > 0) tossItem(id, left);
    if (IT[id].t === 'armor' || IT[id].t === 'acc') calcStats(p);
  }
  function tossItem(id, n) {
    const p = G.me;
    if (AUTH()) spawnItem(pcx(p) + p.dir * 18, p.y + 10, id, n, p.dir * 2.2, -2.2).pd = 80;
    else sendNet({ t: 'toss', it: id, n, dir: p.dir });
  }
  function doCraft(r) {
    const p = G.me;
    if (!canCraft(r)) return false;
    for (const k in r.ins) invTake(p, k, r.ins[k]);
    giveOrDropMe(r.out, r.n);
    sfxAt('craft', p.x, p.y);
    refreshRecipes();
    return true;
  }
  function drawCraft(h, x, y, w, hh) {
    const p = G.me, L = UI.L, S = L.S;
    panelBox(h, x, y, w, hh);
    btn(x, y, w, hh, 'panel');
    txt(h, 'Crafting', x + 10 * S, y + 17 * S, '#fff', 13 * S);
    const st = Object.keys(UI.near).map(k => STNAME[k]).join(', ');
    txt(h, st ? 'Near: ' + st : 'No crafting station nearby', x + w - 10 * S, y + 17 * S, st ? '#9fe0a0' : '#aab', 10.5 * S, 'right');
    const gs = 36 * S, gg = 4 * S;
    const detH = 74 * S;
    const gx = x + 10 * S, gy = y + 26 * S, gw = w - 20 * S, gh = hh - 26 * S - detH - 8 * S;
    const cols = Math.max(3, Math.floor(gw / (gs + gg))), rows = Math.max(1, Math.floor(gh / (gs + gg)));
    const total = UI.recList.length, maxScroll = Math.max(0, Math.ceil(total / cols) - rows);
    UI.recScroll = clamp(UI.recScroll, 0, maxScroll);
    UI.recCols = cols; UI.recRows = rows;
    btn(gx, gy, gw, gh, 'recarea');
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = (r + UI.recScroll) * cols + c;
      if (idx >= total) break;
      const rec = UI.recList[idx], can = idx < UI.recCan;
      const sx = gx + c * (gs + gg), sy = gy + r * (gs + gg);
      const hov = UI.hover && UI.hover.k === 'rec' && UI.hover.a === idx;
      slotBg(h, sx, sy, gs, { sel: idx === UI.recSel, hover: hov });
      iconDraw(h, rec.out, sx + gs * 0.1, sy + gs * 0.1, gs * 0.8, can ? 1 : 0.32);
      if (rec.n > 1) txt(h, String(rec.n), sx + 3 * S, sy + gs - 4 * S, can ? '#fff' : '#889', 10 * S);
      btn(sx, sy, gs, gs, 'rec', idx);
      if (hov && !UI.held) UI.tipItem = { id: rec.out, n: rec.n };
    }
    if (maxScroll > 0) {
      const bx = gx + gw - 6 * S, th = gh * rows / Math.ceil(total / cols), ty = gy + (gh - th) * (UI.recScroll / maxScroll);
      h.fillStyle = 'rgba(160,176,255,0.25)'; h.fillRect(bx, gy, 4 * S, gh);
      h.fillStyle = 'rgba(200,214,255,0.7)'; h.fillRect(bx, ty, 4 * S, th);
    }
    const dy = y + hh - detH - 4 * S;
    h.fillStyle = 'rgba(8,10,34,0.5)'; h.fillRect(x + 6 * S, dy, w - 12 * S, detH);
    const rec = UI.recSel >= 0 ? UI.recList[UI.recSel] : null;
    if (!rec) { txt(h, 'Select a recipe', x + w / 2, dy + detH / 2 + 4 * S, '#aab', 12 * S, 'center'); return; }
    const can = UI.recSel < UI.recCan;
    const bs = 44 * S;
    slotBg(h, x + 12 * S, dy + 8 * S, bs, { sel: can });
    iconDraw(h, rec.out, x + 12 * S + bs * 0.1, dy + 8 * S + bs * 0.1, bs * 0.8);
    if (rec.n > 1) txt(h, String(rec.n), x + 16 * S, dy + 8 * S + bs - 4 * S, '#fff', 11 * S);
    txt(h, IT[rec.out].n, x + 18 * S + bs, dy + 20 * S, RARC[IT[rec.out].rar] || '#fff', 12.5 * S);
    let ix = x + 18 * S + bs;
    const iy = dy + 30 * S;
    for (const k in rec.ins) {
      const have = invCount(p, k), ok = have >= rec.ins[k];
      iconDraw(h, k, ix, iy, 22 * S);
      txt(h, rec.ins[k] + (ok ? '' : ' (' + have + ')'), ix + 11 * S, iy + 33 * S, ok ? '#fff' : '#ff8a8a', 10.5 * S, 'center');
      ix += 36 * S;
    }
    if (rec.st) txt(h, 'Needs ' + STNAME[rec.st], x + 18 * S + bs, dy + detH - 4 * S, UI.near[rec.st] ? '#9fe0a0' : '#ff9a8a', 10 * S);
    const bw = 62 * S, bh = 26 * S, bx = x + w - bw - 12 * S, by = dy + detH - bh - 8 * S;
    h.beginPath(); h.roundRect ? h.roundRect(bx, by, bw, bh, 5 * S) : h.rect(bx, by, bw, bh);
    h.fillStyle = can ? (UI.hover && UI.hover.k === 'craft' ? '#4aa84a' : '#2e7c34') : '#3a3f55'; h.fill();
    h.strokeStyle = can ? '#9fe09a' : '#667'; h.lineWidth = 1.5; h.stroke();
    txt(h, 'Craft', bx + bw / 2, by + bh * 0.68, can ? '#fff' : '#99a', 12.5 * S, 'center');
    btn(bx, by, bw, bh, 'craft');
  }
  function drawChest(h, x, y) {
    const L = UI.L, S = L.S;
    const w = 10 * L.pitch + 12 * S;
    panelBox(h, x - 6 * S, y - 22 * S, w, 4 * L.pitch + 66 * S);
    btn(x - 6 * S, y - 22 * S, w, 4 * L.pitch + 66 * S, 'panel');
    txt(h, 'Chest', x, y - 6 * S, '#fff', 13 * S);
    for (let i = 0; i < 40; i++) {
      const sx = x + (i % 10) * L.pitch, sy = y + Math.floor(i / 10) * L.pitch;
      drawInvSlot(h, 'chest', UI.chestItems, i, sx, sy, L.sl, {});
    }
    const by = y + 4 * L.pitch + 4 * S, bw = 100 * S, bh = 24 * S;
    [['Loot All', 'loot'], ['Deposit All', 'dep'], ['Quick Stack', 'stack']].forEach((q, i) => {
      const bx = x + i * (bw + 8 * S);
      const hov = UI.hover && UI.hover.k === 'cbtn' && UI.hover.a === q[1];
      h.beginPath(); h.roundRect ? h.roundRect(bx, by, bw, bh, 5 * S) : h.rect(bx, by, bw, bh);
      h.fillStyle = hov ? 'rgba(96,112,200,0.95)' : 'rgba(54,66,150,0.9)'; h.fill(); h.strokeStyle = 'rgba(190,204,255,0.6)'; h.lineWidth = 1.2; h.stroke();
      txt(h, q[0], bx + bw / 2, by + bh * 0.68, '#fff', 11.5 * S, 'center');
      btn(bx, by, bw, bh, 'cbtn', q[1]);
    });
  }
  function chestChanged(i) {
    if (!UI.chest) return;
    if (!AUTH()) sendNet({ t: 'cset', k: UI.chest.k, i, s: UI.chestItems[i] });
    else chestNotify(UI.chest.k, i, null);
  }
  function chestAll(op) {
    const p = G.me, arr = UI.chestItems;
    if (!arr) return;
    if (op === 'loot') {
      for (let i = 0; i < 40; i++) if (arr[i]) { const left = addToInv(p, arr[i].id, arr[i].n); if (left <= 0) arr[i] = null; else arr[i].n = left; chestChanged(i); }
    } else if (op === 'dep') {
      for (let i = 10; i < 40; i++) if (p.inv[i]) { const s = p.inv[i]; const left = putChest(s.id, s.n); if (left <= 0) p.inv[i] = null; else s.n = left; }
    } else if (op === 'stack') {
      for (let i = 0; i < 40; i++) {
        const s = p.inv[i];
        if (!s || i < 10 && false) continue;
        if (i < 10) continue;
        if (!arr.some(q => q && q.id === s.id)) continue;
        const left = putChest(s.id, s.n);
        if (left <= 0) p.inv[i] = null; else s.n = left;
      }
    }
    sfxAt('grab', p.x, p.y);
  }
  function putChest(id, n) {
    const arr = UI.chestItems, st = IT[id].st;
    for (let i = 0; i < 40 && n > 0; i++) if (arr[i] && arr[i].id === id && arr[i].n < st) { const m = Math.min(n, st - arr[i].n); arr[i].n += m; n -= m; chestChanged(i); }
    for (let i = 0; i < 40 && n > 0; i++) if (!arr[i]) { const m = Math.min(n, st); arr[i] = { id, n: m }; n -= m; chestChanged(i); }
    return n;
  }
  function openChest(x, y) {
    const k = y * W.w + x;
    UI.chest = { x, y, k };
    UI.open = true; UI.shop = false; UI.talk = null;
    if (AUTH()) {
      let c = W.chests.get(k);
      if (!c) { c = { x, y, items: new Array(40).fill(null) }; W.chests.set(k, c); }
      UI.chestItems = c.items;
      chestView(k, G.me.id, true);
    } else {
      UI.chestItems = new Array(40).fill(null);
      sendNet({ t: 'cget', k });
    }
    sfxAt('door', x * 16, y * 16);
  }
  function closeChest() {
    if (UI.chest) { if (AUTH()) chestView(UI.chest.k, G.me.id, false); else sendNet({ t: 'cclose', k: UI.chest.k }); }
    UI.chest = null; UI.chestItems = null;
  }
  function drawShop(h, x, y, w, hh) {
    const p = G.me, L = UI.L, S = L.S;
    panelBox(h, x, y, w, hh);
    btn(x, y, w, hh, 'panel');
    txt(h, 'Merchant Shop', x + 10 * S, y + 18 * S, '#fff', 13 * S);
    txt(h, 'Shift+click an item to sell it', x + w - 10 * S, y + 18 * S, '#aab', 10 * S, 'right');
    const rh = 34 * S, top = y + 28 * S, rows = Math.max(1, Math.floor((hh - 36 * S) / rh));
    UI.shopRows = rows;
    UI.shopScroll = clamp(UI.shopScroll, 0, Math.max(0, SHOP.length - rows));
    for (let r = 0; r < rows; r++) {
      const idx = r + UI.shopScroll;
      if (idx >= SHOP.length) break;
      const [id, price] = SHOP[idx], ry = top + r * rh, can = (p.coins | 0) >= price;
      const hov = UI.hover && UI.hover.k === 'shop' && UI.hover.a === idx;
      h.fillStyle = hov ? 'rgba(96,112,200,0.55)' : 'rgba(40,52,120,0.5)'; h.fillRect(x + 8 * S, ry, w - 16 * S, rh - 3 * S);
      iconDraw(h, id, x + 12 * S, ry + 3 * S, 26 * S);
      txt(h, IT[id].n, x + 44 * S, ry + 14 * S, '#fff', 11.5 * S);
      txt(h, coinText(price), x + 44 * S, ry + 27 * S, can ? '#ffe9a0' : '#ff9a8a', 10 * S);
      btn(x + 8 * S, ry, w - 16 * S, rh - 3 * S, 'shop', idx);
      if (hov && !UI.held) UI.tipItem = { id, n: 1 };
    }
  }
  function buyItem(idx) {
    const p = G.me, [id, price] = SHOP[idx];
    if ((p.coins | 0) < price) { sfxAt('nomana', p.x, p.y); return; }
    if (!canTake(p, id, 1)) { addMsg('Inventory full', '#ff9090'); return; }
    p.coins -= price;
    const d = IT[id];
    addToInv(p, id, d.t === 'ammo' ? 1 : 1);
    sfxAt('buy', p.x, p.y);
  }
  function sellSlot(i) {
    const p = G.me, s = p.inv[i];
    if (!s) return;
    const d = IT[s.id], each = Math.floor(d.v / 5);
    if (each <= 0) { addMsg('The merchant does not want that', '#ff9090'); return; }
    p.coins += each * s.n; p.inv[i] = null;
    addMsg('Sold ' + d.n + ' for ' + coinText(each * s.n), '#ffe9a0');
    sfxAt('coin', p.x, p.y);
  }
  function drawTalk(h) {
    const n = UI.talk, L = UI.L, S = L.S;
    if (!n || !G.npcs.includes(n)) { UI.talk = null; return; }
    const w = Math.min(UI.w - 20, 520 * S), x = (UI.w - w) / 2;
    const text = UI.talkText || npcLine(n);
    const lines = wrapText(h, text, w - 24 * S, 12.5 * S);
    const hh = 40 * S + lines.length * 17 * S + 44 * S, y = UI.h - hh - (UI.touch ? 110 * S : 14 * S);
    panelBox(h, x, y, w, hh, 0.9);
    btn(x, y, w, hh, 'panel');
    const look = LOOKS[NPCDEF[n.ty].look];
    h.imageSmoothingEnabled = false;
    h.drawImage(npcHeadIcon(look), x + 10 * S, y + 8 * S, 26 * S, 26 * S);
    txt(h, n.name + ' the ' + NPCDEF[n.ty].n, x + 42 * S, y + 26 * S, '#ffe680', 14 * S);
    lines.forEach((l, i) => txt(h, l, x + 14 * S, y + 52 * S + i * 17 * S, '#fff', 12.5 * S, 'left'));
    const by = y + hh - 34 * S, bw = 90 * S, bh = 26 * S;
    const bs = n.ty === 'guide' ? [['Help', 'help'], ['Close', 'close']] : [['Shop', 'shop'], ['Close', 'close']];
    bs.forEach((q, i) => {
      const bx = x + w - (bs.length - i) * (bw + 8 * S);
      const hov = UI.hover && UI.hover.k === 'tbtn' && UI.hover.a === q[1];
      h.beginPath(); h.roundRect ? h.roundRect(bx, by, bw, bh, 5 * S) : h.rect(bx, by, bw, bh);
      h.fillStyle = hov ? 'rgba(96,112,200,0.95)' : 'rgba(54,66,150,0.9)'; h.fill(); h.strokeStyle = 'rgba(190,204,255,0.6)'; h.lineWidth = 1.2; h.stroke();
      txt(h, q[0], bx + bw / 2, by + bh * 0.68, '#fff', 12 * S, 'center');
      btn(bx, by, bw, bh, 'tbtn', q[1]);
    });
  }
  function talkTo(n) {
    UI.talk = n; UI.talkText = null; n.talk = 180; UI.shop = false;
    if (n.ty === 'guide') G.tipN = G.tipN || 0;
    sfxAt('click');
  }
  function accepts(name, i, id) {
    const d = IT[id];
    if (!d) return false;
    if (name === 'armor') { if (i === 0) return d.t === 'armor' && d.slot === 'h'; if (i === 1) return d.t === 'armor' && d.slot === 'b'; if (i === 2) return d.t === 'armor' && d.slot === 'l'; return d.t === 'acc'; }
    if (name === 'ammo') return d.t === 'ammo';
    if (name === 'trash') return true;
    return true;
  }
  const arrOf = name => { const p = G.me; return name === 'inv' ? p.inv : name === 'ammo' ? p.ammo : name === 'armor' ? p.armor : name === 'chest' ? UI.chestItems : UI.trash; };
  function slotChanged(name, i) {
    const p = G.me;
    if (name === 'armor') calcStats(p);
    else if (name === 'chest') chestChanged(i);
  }
  function quickMove(name, i) {
    const p = G.me, arr = arrOf(name), s = arr[i];
    if (!s) return;
    const d = IT[s.id];
    if (UI.shop && name === 'inv') { sellSlot(i); return; }
    if (name === 'inv') {
      if (UI.chest) { const left = putChest(s.id, s.n); if (left <= 0) arr[i] = null; else s.n = left; return; }
      if (d.t === 'armor' || d.t === 'acc') {
        let ti = d.t === 'armor' ? (d.slot === 'h' ? 0 : d.slot === 'b' ? 1 : 2) : -1;
        if (ti < 0) { for (let k = 3; k < 6; k++) if (!p.armor[k]) { ti = k; break; } if (ti < 0) ti = 3; }
        const prev = p.armor[ti]; p.armor[ti] = s; arr[i] = prev; calcStats(p); sfxAt('grab', p.x, p.y); return;
      }
      const lo = i < 10 ? 10 : 0, hi = i < 10 ? 40 : 10;
      for (let k = lo; k < hi; k++) if (p.inv[k] && p.inv[k].id === s.id && p.inv[k].n < d.st) { const m = Math.min(s.n, d.st - p.inv[k].n); p.inv[k].n += m; s.n -= m; if (s.n <= 0) { arr[i] = null; return; } }
      for (let k = lo; k < hi; k++) if (!p.inv[k]) { p.inv[k] = s; arr[i] = null; return; }
      return;
    }
    const left = addToInv(p, s.id, s.n);
    if (left <= 0) arr[i] = null; else s.n = left;
    slotChanged(name, i);
  }
  function slotClick(name, i, right, shift) {
    const p = G.me, arr = arrOf(name);
    if (!arr) return;
    const s = arr[i], H = UI.held;
    if (shift && !H) { quickMove(name, i); return; }
    if (!H) {
      if (!s) return;
      if (right && s.n > 1) { const hv = Math.ceil(s.n / 2); UI.held = { id: s.id, n: hv }; s.n -= hv; }
      else { UI.held = { id: s.id, n: s.n }; arr[i] = null; }
      sfxAt('grab', p.x, p.y);
      slotChanged(name, i);
      return;
    }
    if (!accepts(name, i, H.id)) return;
    const d = IT[H.id];
    if (!s) {
      if (right && H.n > 1) { arr[i] = { id: H.id, n: 1 }; H.n--; }
      else { arr[i] = { id: H.id, n: H.n }; UI.held = null; }
    } else if (s.id === H.id) {
      const room = d.st - s.n, m = right ? Math.min(1, room) : Math.min(room, H.n);
      s.n += m; H.n -= m; if (H.n <= 0) UI.held = null;
    } else if (!right) {
      arr[i] = { id: H.id, n: H.n }; UI.held = { id: s.id, n: s.n };
    } else return;
    sfxAt('grab', p.x, p.y);
    slotChanged(name, i);
  }
  function dropHeld() {
    const H = UI.held;
    if (!H) return;
    UI.held = null;
    tossItem(H.id, H.n);
  }
  function returnHeld() {
    const H = UI.held;
    if (!H) return;
    UI.held = null;
    giveOrDropMe(H.id, H.n);
  }
  function closePanels() {
    returnHeld();
    closeChest();
    UI.open = false; UI.shop = false; UI.talk = null; UI.map = false;
  }
  function uiClick(b, right, shift) {
    if (!b) return false;
    const p = G.me;
    switch (b.k) {
      case 'slot': slotClick(b.a, b.b, right, shift); return true;
      case 'rec': {
        if (UI.recSel === b.a && !right) { if (!doCraft(UI.recList[b.a])) sfxAt('nomana', p.x, p.y); UI.craftHold = 1; }
        else { UI.recSel = b.a; sfxAt('click'); }
        return true;
      }
      case 'craft': {
        const r = UI.recSel >= 0 ? UI.recList[UI.recSel] : null;
        if (r && !doCraft(r)) sfxAt('nomana', p.x, p.y);
        UI.craftHold = 1;
        return true;
      }
      case 'cbtn': chestAll(b.a); return true;
      case 'shop': buyItem(b.a); return true;
      case 'tbtn': {
        if (b.a === 'close') UI.talk = null;
        else if (b.a === 'help') { G.tipN = (G.tipN || 0) + 1; UI.talkText = GUIDE_TIPS[G.tipN % GUIDE_TIPS.length]; sfxAt('click'); }
        else if (b.a === 'shop') { UI.shop = true; UI.open = true; UI.talk = null; sfxAt('click'); }
        return true;
      }
      case 'hbar': p.sel = b.a; sfxAt('click'); return true;
      case 'panel': case 'recarea': return true;
      case 'tbtn2': return true;
    }
    return false;
  }
  function addMsg(s, col) {
    if (!G) return;
    G.msgs.push({ s, col: col || '#fff', t: 480 });
    if (G.msgs.length > 7) G.msgs.shift();
  }
  const MM = { cv: null, g: null, seen: null, last: 0 };
  function mmInit() {
    MM.cv = mkcv(W.w, W.h); MM.g = MM.cv.getContext('2d');
    MM.seen = new Uint8Array(W.w * W.h);
  }
  const SKYMAP = [120, 168, 232], WALLMAP = [44, 36, 34], CAVEMAP = [18, 14, 14];
  function mmColor(x, y) {
    const i = y * W.w + x, t = W.t[i];
    if (W.lq[i] > 40) return W.fl[i] & 1 ? [226, 84, 26] : [44, 98, 214];
    if (t) { const c = hex(TD[t].col); return c; }
    if (y < W.surf[x] && !W.wl[i]) return SKYMAP;
    if (W.wl[i]) return WALLMAP;
    return CAVEMAP;
  }
  function mmReveal(camX, camY, BW, BH) {
    if (!MM.cv || MM.cv.width !== W.w) mmInit();
    const x0 = Math.max(0, (camX >> 4) - 2), y0 = Math.max(0, (camY >> 4) - 2), x1 = Math.min(W.w - 1, ((camX + BW) >> 4) + 2), y1 = Math.min(W.h - 1, ((camY + BH) >> 4) + 2);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    if (w <= 0 || h <= 0) return;
    const img = MM.g.createImageData(w, h);
    const d = img.data, sn = MM.seen;
    let any = false;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = y * W.w + x, j = ((y - y0) * w + (x - x0)) * 4;
      let on = sn[k];
      if (!on && lightAt(x, y) > 0.17 && y < W.h - 2) { sn[k] = 1; on = 1; }
      if (!on) continue;
      const c = mmColor(x, y);
      d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
      any = true;
    }
    if (any) {
      const tmp = mkcv(w, h);
      tmp.getContext('2d').putImageData(img, 0, 0);
      MM.g.clearRect(x0, y0, w, h);
      MM.g.drawImage(tmp, x0, y0);
    }
  }
  const clockStr = () => {
    let hrs = W.day ? 4.5 + W.tod / 3600 : 19.5 + W.tod / 3600;
    hrs %= 24;
    const hh = Math.floor(hrs), mm = Math.floor((hrs - hh) * 60), ap = hh >= 12 ? 'PM' : 'AM', h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ':' + String(mm).padStart(2, '0') + ' ' + ap;
  };
  const layerName = (ty, tx) => ty < W.spaceY ? 'Space' : ty >= W.hellY ? 'Underworld' : ty > W.rockY ? 'Caverns' : ty > W.surf[tx] + 6 ? 'Underground' : 'Surface';
  const BIONAME = ['Forest', 'Desert', 'Snow', 'The Corruption', 'Ocean', 'Mushroom'];
  function drawBars(h, x, y, p, S, align) {
    const nh = Math.min(20, Math.ceil(p.hpMax / 20)), per = 10;
    const hs = 22 * S, step = 24 * S;
    const rows = Math.ceil(nh / per);
    const rowW = Math.min(nh, per) * step;
    const sx = align === 'right' ? x - rowW : x;
    txt(h, 'Life: ' + Math.ceil(p.hp) + '/' + p.hpMax, sx + rowW / 2, y - 3 * S, '#fff', 11.5 * S, 'center');
    h.imageSmoothingEnabled = false;
    for (let i = 0; i < nh; i++) {
      const c = i % per, r = Math.floor(i / per);
      const fill = clamp((p.hp - i * 20) / 20, 0, 1);
      const cx = sx + c * step + hs / 2, cy = y + r * step + hs / 2;
      if (fill <= 0) h.drawImage(hearts().empty, cx - hs / 2, cy - hs * 0.45, hs, hs * 0.91);
      else {
        const sc = fill >= 1 ? 1 : 0.62 + 0.38 * fill;
        const pulse = p.hp < p.hpMax * 0.25 ? 1 + 0.06 * Math.sin(G.tick * 0.25) : 1;
        const ww = hs * sc * pulse, hh2 = hs * 0.91 * sc * pulse;
        h.drawImage(hearts().img, cx - ww / 2, cy - hh2 / 2, ww, hh2);
      }
    }
    const nm = Math.ceil(p.manaMax / 20);
    const mx = align === 'right' ? x + 6 * S + hs * 0.2 : sx + rowW + 10 * S;
    if (nm > 0) {
      txt(h, 'Mana', mx + hs / 2, y - 3 * S, '#9ec2ff', 10.5 * S, 'center');
      for (let i = 0; i < nm; i++) {
        const fill = clamp((p.mana - i * 20) / 20, 0, 1);
        const cx = mx + hs / 2, cy = y + i * (hs * 0.95) + hs / 2;
        if (fill <= 0) h.drawImage(starEmpty, cx - hs / 2, cy - hs / 2, hs, hs);
        else { const sc = fill >= 1 ? 1 : 0.62 + 0.38 * fill; h.drawImage(starImg, cx - hs * sc / 2, cy - hs * sc / 2, hs * sc, hs * sc); }
      }
    }
    let by = y + rows * step + 2 * S;
    if (p.breath < 200) {
      for (let i = 0; i < 10; i++) {
        const f = clamp((p.breath - i * 20) / 20, 0, 1);
        if (f <= 0) continue;
        const bx = sx + i * 15 * S + 7 * S;
        h.beginPath(); h.arc(bx, by + 8 * S, 6 * S * (0.5 + f * 0.5), 0, 7);
        h.fillStyle = 'rgba(150,210,255,0.35)'; h.fill(); h.lineWidth = 1.5; h.strokeStyle = 'rgba(210,240,255,0.9)'; h.stroke();
      }
      by += 18 * S;
    }
    if (p.sick > 0) { txt(h, 'Potion Sickness ' + Math.floor(p.sick / 3600) + ':' + String(Math.floor(p.sick / 60) % 60).padStart(2, '0'), sx, by + 12 * S, '#ff9a9a', 10.5 * S); by += 14 * S; }
    return by;
  }
  function drawMinimap(h, x, y, w, hh) {
    const p = G.me, S = UI.S;
    h.fillStyle = 'rgba(8,10,28,0.8)'; h.fillRect(x, y, w, hh);
    if (MM.cv) {
      const z = 1.3 * S * 1.2, tw = w / z, th = hh / z;
      let sx = pcx(p) / 16 - tw / 2, sy = pcy(p) / 16 - th / 2;
      sx = clamp(sx, 0, W.w - tw); sy = clamp(sy, 0, W.h - th);
      h.imageSmoothingEnabled = false;
      h.drawImage(MM.cv, sx, sy, tw, th, x, y, w, hh);
      const dot = (px, py, col, r) => { const dx = x + (px / 16 - sx) * z, dy = y + (py / 16 - sy) * z; if (dx < x || dy < y || dx > x + w || dy > y + hh) return; h.fillStyle = col; h.fillRect(dx - r, dy - r, r * 2, r * 2); };
      for (const n of G.npcs) dot(n.x + 10, n.y + 20, '#ffe060', 2 * S);
      for (const q of G.players.values()) if (q !== p && !q.dead) dot(pcx(q), pcy(q), '#6af0ff', 2.4 * S);
      dot(pcx(p), pcy(p), '#ffffff', 2.6 * S);
    }
    h.lineWidth = 2; h.strokeStyle = 'rgba(190,204,255,0.7)'; h.strokeRect(x, y, w, hh);
    btn(x, y, w, hh, 'minimap');
  }
  function drawFullMap(h) {
    const S = UI.S, w = UI.w, hh = UI.h;
    h.fillStyle = 'rgba(4,6,20,0.88)'; h.fillRect(0, 0, w, hh);
    btn(0, 0, w, hh, 'panel');
    const mw = w - 40 * S, mh = hh - 90 * S, k = Math.min(mw / W.w, mh / W.h), dw = W.w * k, dh = W.h * k, x = (w - dw) / 2, y = 40 * S + (mh - dh) / 2;
    h.fillStyle = 'rgba(0,0,0,0.5)'; h.fillRect(x, y, dw, dh);
    h.imageSmoothingEnabled = false;
    if (MM.cv) h.drawImage(MM.cv, x, y, dw, dh);
    h.lineWidth = 2; h.strokeStyle = 'rgba(190,204,255,0.7)'; h.strokeRect(x, y, dw, dh);
    const dot = (px, py, col, r, nm) => { const dx = x + px / 16 * k, dy = y + py / 16 * k; h.fillStyle = col; h.beginPath(); h.arc(dx, dy, r, 0, 7); h.fill(); h.lineWidth = 1.5; h.strokeStyle = '#000'; h.stroke(); if (nm) txt(h, nm, dx, dy - r - 3, col, 10.5 * S, 'center'); };
    dot(W.spawnX * 16, W.spawnY * 16, '#ffe060', 3.5 * S, null);
    for (const n of G.npcs) dot(n.x + 10, n.y + 20, '#ffe060', 3 * S, n.name);
    for (const q of G.players.values()) if (!q.dead) dot(pcx(q), pcy(q), q === G.me ? '#ffffff' : '#6af0ff', 4 * S * (1 + 0.15 * Math.sin(G.tick * 0.2)), q.name);
    txt(h, W.name + '  -  press M or Esc to close', w / 2, 26 * S, '#fff', 14 * S, 'center');
  }
  function bossBar(h) {
    const S = UI.S, groups = {};
    for (const e of G.ents) if (e.k === 'mob' && e.hp > 0) { const b = MOB[e.ty].boss; if (b) { const g = groups[b] || (groups[b] = { hp: 0, max: 0 }); g.hp += e.hp; g.max += e.hpMax; } }
    let i = 0;
    for (const b in groups) {
      const g = groups[b], w = Math.min(UI.w - 40, 340 * S), x = (UI.w - w) / 2, y = UI.h - (UI.touch ? 140 * S : 44 * S) - i * 38 * S;
      h.fillStyle = 'rgba(0,0,0,0.6)'; h.fillRect(x - 2, y - 2, w + 4, 20 * S + 4);
      const gr = h.createLinearGradient(0, y, 0, y + 20 * S); gr.addColorStop(0, '#e03a3a'); gr.addColorStop(1, '#8a1414');
      h.fillStyle = gr; h.fillRect(x, y, w * clamp(g.hp / g.max, 0, 1), 20 * S);
      h.lineWidth = 2; h.strokeStyle = '#ffd0a0'; h.strokeRect(x - 2, y - 2, w + 4, 20 * S + 4);
      txt(h, BOSSN[b] + '  ' + Math.ceil(g.hp) + '/' + g.max, x + w / 2, y + 15 * S, '#fff', 12 * S, 'center');
      i++;
    }
  }
  function clipText(h, p) {
    const S = UI.S;
    for (const t of texts) {
      const sx = (t.x - UI.camX) * UI.zs, sy = (t.y - UI.camY) * UI.zs;
      if (sx < -40 || sy < -40 || sx > UI.w + 40 || sy > UI.h + 40) continue;
      h.globalAlpha = Math.min(1, t.life / 18);
      txt(h, t.s, sx, sy, t.col, (t.big ? 16 : 12) * Math.max(0.8, S), 'center');
    }
    h.globalAlpha = 1;
    void p;
  }
  function drawNames(h) {
    const S = UI.S;
    for (const q of G.players.values()) {
      if (q === G.me || q.dead) continue;
      const x = (lerp(q.px, q.x, G.alpha) + q.w / 2 - UI.camX) * UI.zs, y = (lerp(q.py, q.y, G.alpha) - 8 - UI.camY) * UI.zs;
      txt(h, q.name, x, y, '#bfe8ff', 12 * Math.max(0.85, S), 'center');
      const w = 36 * S, bx = x - w / 2;
      h.fillStyle = 'rgba(0,0,0,0.6)'; h.fillRect(bx, y + 4, w, 5);
      h.fillStyle = '#d83a3a'; h.fillRect(bx + 1, y + 5, (w - 2) * clamp(q.hp / q.hpMax, 0, 1), 3);
    }
    for (const n of G.npcs) {
      const near = G.me && Math.abs(pcx(G.me) - (n.x + 10)) < 150 && Math.abs(pcy(G.me) - (n.y + 20)) < 100;
      if (!near) continue;
      const x = (lerp(n.px, n.x, G.alpha) + 10 - UI.camX) * UI.zs, y = (n.y - 6 - UI.camY) * UI.zs;
      txt(h, n.name, x, y, '#ffe680', 12 * Math.max(0.85, S), 'center');
    }
    for (const e of G.ents) {
      if (e.k !== 'mob' || e.hp <= 0 || e.hp >= e.hpMax || MOB[e.ty].boss || e.ty === 'servant') continue;
      const x = (lerp(e.px, e.x, G.alpha) + e.w / 2 - UI.camX) * UI.zs, y = (lerp(e.py, e.y, G.alpha) - 6 - UI.camY) * UI.zs, w = 30 * S, bx = x - w / 2;
      h.fillStyle = 'rgba(0,0,0,0.6)'; h.fillRect(bx, y, w, 5);
      h.fillStyle = e.hp / e.hpMax > 0.5 ? '#5ad84a' : e.hp / e.hpMax > 0.25 ? '#e8c43a' : '#e04a3a'; h.fillRect(bx + 1, y + 1, (w - 2) * e.hp / e.hpMax, 3);
    }
  }
  function drawTouch(h) {
    const ts = clamp(UI.h / 430, 0.85, 1.4), a = [];
    const jx = 78 * ts, jy = UI.h - 84 * ts;
    UI.joy = { x: jx, y: jy, r: 54 * ts, active: UI.joyOn, dx: UI.joyDx || 0, dy: UI.joyDy || 0 };
    h.globalAlpha = 0.55;
    h.beginPath(); h.arc(jx, jy, 54 * ts, 0, 7); h.fillStyle = 'rgba(20,28,70,0.6)'; h.fill(); h.lineWidth = 3; h.strokeStyle = 'rgba(190,204,255,0.8)'; h.stroke();
    h.beginPath(); h.arc(jx + (UI.joyDx || 0) * 30 * ts, jy + (UI.joyDy || 0) * 30 * ts, 24 * ts, 0, 7); h.fillStyle = 'rgba(190,204,255,0.75)'; h.fill();
    h.globalAlpha = 1;
    const mk = (id, cx, cy, r, label, on) => {
      h.globalAlpha = on ? 0.9 : 0.6;
      h.beginPath(); h.arc(cx, cy, r, 0, 7); h.fillStyle = on ? 'rgba(90,110,210,0.9)' : 'rgba(20,28,70,0.65)'; h.fill(); h.lineWidth = 2.5; h.strokeStyle = 'rgba(190,204,255,0.85)'; h.stroke();
      h.globalAlpha = 1;
      txt(h, label, cx, cy + 4.5 * ts, '#fff', 12 * ts, 'center');
      a.push({ id, x: cx, y: cy, r });
    };
    mk('jump', UI.w - 62 * ts, UI.h - 78 * ts, 36 * ts, 'JUMP', UI.tJump);
    mk('down', UI.w - 62 * ts - 78 * ts, UI.h - 52 * ts, 24 * ts, 'DOWN', UI.tDown);
    mk('heal', UI.w - 62 * ts, UI.h - 78 * ts - 62 * ts, 22 * ts, 'HEAL', false);
    const sy = UI.narrow ? UI.L.y0 + UI.L.pitch + 40 * UI.S * 0 : 0;
    void sy;
    const cx = UI.w - 24 * ts;
    let yy = UI.narrow ? UI.L.y0 + UI.L.pitch + 50 * ts : 150 * ts + 16;
    if (UI.narrow) yy = Math.max(yy, 130 * ts);
    mk('inv', cx, yy, 19 * ts, 'INV', UI.open);
    mk('map', cx, yy + 46 * ts, 19 * ts, 'MAP', UI.map);
    mk('pause', cx, yy + 92 * ts, 19 * ts, 'II', false);
    UI.tbtns = a;
  }
  function drawCursor(h) {
    if (!UI.mouse || UI.touch || UI.mx < 0) return;
    const x = UI.mx, y = UI.my, S = Math.max(0.9, UI.S);
    h.save(); h.translate(x, y); h.scale(S, S);
    h.beginPath(); h.moveTo(0, 0); h.lineTo(0, 17); h.lineTo(4.5, 13); h.lineTo(8, 20); h.lineTo(11, 18.6); h.lineTo(7.6, 12); h.lineTo(13, 12); h.closePath();
    h.lineWidth = 2.6; h.strokeStyle = '#000'; h.lineJoin = 'round'; h.stroke();
    const gr = h.createLinearGradient(0, 0, 0, 20); gr.addColorStop(0, '#9fc8ff'); gr.addColorStop(1, '#3a6cd8');
    h.fillStyle = gr; h.fill(); h.lineWidth = 1; h.strokeStyle = '#fff'; h.stroke();
    h.restore();
  }
  function drawHeld(h) {
    if (!UI.held) return;
    const s = 34 * UI.S, x = UI.touch ? UI.tx : UI.mx + 10, y = UI.touch ? UI.ty : UI.my + 10;
    iconDraw(h, UI.held.id, x, y, s);
    if (UI.held.n > 1) txt(h, String(UI.held.n), x + 2, y + s, '#fff', 11 * UI.S);
  }
  function drawHUD(h) {
    const p = G.me;
    if (!p) return;
    UI.hover = UI.mouse || UI.touch ? hitBtn(UI.mx, UI.my) : null;
    UI.btns.length = 0; UI.tipItem = null;
    const L = layout(), S = L.S, w = UI.w;
    if (G.tick % 6 === 0 && (UI.open || UI.recList.length === 0)) refreshRecipes();
    const wide = !L.narrow;
    if (UI.map) {
      drawFullMap(h);
      drawCursor(h);
      return;
    }
    clipText(h, p);
    drawNames(h);
    let afterY;
    const vx = wide ? w - 14 * S - 30 * S : L.x0, vy = wide ? L.y0 + 16 * S : L.y0 + L.pitch * (UI.open ? 4 : 1) + 26 * S;
    if (wide) {
      afterY = drawBars(h, vx - 10 * S, vy, p, S, 'right');
      const mw = 152 * S, mh = 100 * S;
      if (UI.mmOn) { drawMinimap(h, w - 14 * S - mw, Math.max(afterY + 8 * S, 100 * S), mw, mh); }
      const iy = Math.max(afterY + 8 * S, 100 * S) + (UI.mmOn ? mh + 6 * S : 0);
      const tx = clamp(Math.floor(pcx(p) / 16), 0, W.w - 1), ty = Math.floor(pcy(p) / 16);
      txt(h, clockStr() + '  ' + layerName(ty, tx), w - 14 * S, iy + 12 * S, '#fff', 11.5 * S, 'right');
      txt(h, Math.abs(Math.round((ty - W.surf[tx]) * 2)) + ' ft ' + (ty >= W.surf[tx] ? 'below' : 'above') + ' - ' + BIONAME[W.bio[tx]], w - 14 * S, iy + 27 * S, '#cfe', 10.5 * S, 'right');
    } else {
      afterY = drawBars(h, vx, vy, p, S, 'left');
      const tx = clamp(Math.floor(pcx(p) / 16), 0, W.w - 1);
      txt(h, clockStr() + ' ' + layerName(Math.floor(pcy(p) / 16), tx), w - 8 * S, vy - 6 * S, '#fff', 10.5 * S, 'right');
    }
    drawHotbarAndInv(h);
    if (UI.open) {
      const invBottom = L.y0 + 4 * L.pitch;
      const eqY = invBottom + 10 * L.S;
      if (wide) {
        drawEquip(h, L.x0, eqY);
        const cx = L.x0 + 10 * L.pitch + 16 * S;
        drawCoinsAmmo(h, cx, L.y0 - 2 * S);
        drawTrash(h, cx + 106 * S, L.y0 + 4 * L.pitch * 0.5);
        const cy = eqY + L.pitch + 12 * S;
        const craftW = 10 * L.pitch, craftH = UI.h - cy - 10 * S;
        drawCraft(h, L.x0, cy, craftW, craftH);
        const rx = cx + 124 * S, ry = Math.max(afterY + 8 * S, 100 * S) + (UI.mmOn ? 112 * S : 0) + 44 * S;
        if (UI.chest) drawChest(h, rx, ry);
        else if (UI.shop) drawShop(h, rx - 6 * S, ry - 24 * S, Math.min(10 * L.pitch + 12 * S, w - rx - 14 * S + 6 * S), UI.h - ry + 14 * S);
      } else {
        const ey = invBottom + 8 * S;
        drawEquip(h, L.x0, ey);
        drawCoinsAmmoRow(h, L.x0, ey + L.pitch + 4 * S);
        const cy = ey + L.pitch + 4 * S + 26 * S;
        const panelH = UI.h - cy - (UI.touch ? 8 : 6) * S;
        if (UI.chest) drawChest(h, L.x0, cy + 22 * S);
        else if (UI.shop) drawShop(h, L.x0 - 4 * S, cy, 10 * L.pitch + 8 * S, panelH);
        else drawCraft(h, L.x0 - 4 * S, cy, 10 * L.pitch + 8 * S, panelH);
        drawTrash(h, L.x0 + 10 * L.pitch - L.sl, ey + L.pitch + 0.5 * S);
      }
    }
    drawTalk(h);
    const my = UI.mmOn && wide ? 0 : 0;
    void my;
    bossBar(h);
    const mbase = UI.touch ? UI.h - 190 * clamp(UI.h / 430, 0.85, 1.4) : UI.h - 14 * S;
    if (!UI.open) {
      for (let i = 0; i < G.msgs.length; i++) {
        const m = G.msgs[G.msgs.length - 1 - i];
        h.globalAlpha = Math.min(1, m.t / 60);
        txt(h, m.s, 10 * S, mbase - i * 16 * S, m.col, 12.5 * S);
      }
      h.globalAlpha = 1;
      const pk = G.pickLog;
      for (let i = 0; i < pk.length; i++) {
        const q = pk[pk.length - 1 - i];
        h.globalAlpha = Math.min(1, q.t / 40);
        iconDraw(h, q.id, 10 * S, UI.h * 0.42 + i * 24 * S, 20 * S);
        txt(h, (q.n > 1 ? q.n + ' ' : '') + IT[q.id].n, 34 * S, UI.h * 0.42 + i * 24 * S + 15 * S, RARC[IT[q.id].rar] || '#fff', 12 * S);
      }
      h.globalAlpha = 1;
    }
    if (G.banner && G.banner.t > 0) {
      const b = G.banner, a = Math.min(1, b.t / 40), sc = 1 + Math.max(0, (b.t - 190)) * 0.01;
      h.globalAlpha = a;
      txt(h, b.s, w / 2, UI.h * 0.2, b.c, 24 * S * sc, 'center');
      h.globalAlpha = 1;
    }
    if (p.dead) {
      h.fillStyle = 'rgba(70,0,0,0.5)'; h.fillRect(0, 0, w, UI.h);
      txt(h, 'You were slain...', w / 2, UI.h * 0.4, '#ff6060', 34 * S, 'center');
      txt(h, p.name + ' ' + p.why + '.', w / 2, UI.h * 0.4 + 30 * S, '#fff', 14 * S, 'center');
      txt(h, 'Respawning in ' + Math.ceil(p.respT / 60) + '...', w / 2, UI.h * 0.4 + 60 * S, '#ffd0d0', 16 * S, 'center');
    }
    if (UI.touch) drawTouch(h);
    if (UI.tipItem) drawTip(h, tipLines(UI.tipItem.id, UI.tipItem.n), UI.mx, UI.my);
    if (UI.held) drawHeld(h);
    drawCursor(h);
  }
  function drawCoinsAmmoRow(h, x, y) {
    const p = G.me, L = UI.L, S = L.S;
    const c = coinSplit(p.coins | 0);
    let cx = x;
    ['pt', 'au', 'ag', 'cu'].forEach(k => {
      h.imageSmoothingEnabled = false;
      h.globalAlpha = c[k] ? 1 : 0.35;
      h.drawImage(coinImg[k], cx, y, 18 * S, 18 * S);
      h.globalAlpha = 1;
      txt(h, String(c[k]), cx + 19 * S, y + 14 * S, c[k] ? '#fff' : '#889', 11.5 * S);
      cx += 54 * S;
    });
    for (let i = 0; i < 4; i++) drawInvSlot(h, 'ammo', p.ammo, i, x + 10 * L.pitch - (4 - i) * (L.sl * 0.55 + 2) - 0.5 * S, y - 8 * S, L.sl * 0.55, {});
  }
  let api = null, AC = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, sndQ = [], musicOn = true, sfxVol = 0.7, musVol = 0.5;
  function audioInit() {
    if (AC) { if (AC.state === 'suspended') AC.resume().catch(() => { }); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    try {
      AC = new C();
      master = AC.createGain(); master.gain.value = 0.9;
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp); comp.connect(AC.destination);
      sfxBus = AC.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
      musBus = AC.createGain(); musBus.gain.value = musVol * 0.35; musBus.connect(master);
      const n = AC.sampleRate * 1.5;
      noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { AC = null; }
  }
  function setVolumes() { if (sfxBus) sfxBus.gain.value = sfxVol; if (musBus) musBus.gain.value = musVol * 0.35; }
  function tone(o) {
    const t0 = AC.currentTime + (o.d || 0);
    const osc = AC.createOscillator(), g = AC.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t0 + o.dur);
    const v = (o.vol || 0.2) * (o.pan === undefined ? 1 : 1);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.01, o.dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    let out = g;
    if (o.pan !== undefined && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    out.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }
  function noise(o) {
    const t0 = AC.currentTime + (o.d || 0);
    const src = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f0 || 1000, t0); f.Q.value = o.q || 0.8;
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f1), t0 + o.dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + Math.min(0.008, o.dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f); f.connect(g);
    let out = g;
    if (o.pan !== undefined && AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p; }
    out.connect(sfxBus);
    src.start(t0, Math.random()); src.stop(t0 + o.dur + 0.05);
  }
  const SND = {
    jump: (p) => tone({ f0: 280, f1: 560, dur: 0.1, vol: 0.08, pan: p }),
    puff: (p) => noise({ ft: 'bandpass', f0: 1800, f1: 600, dur: 0.14, vol: 0.12, pan: p }),
    land: (p) => { noise({ f0: 320, dur: 0.1, vol: 0.2, pan: p }); tone({ f0: 90, f1: 50, dur: 0.1, vol: 0.14, pan: p }); },
    hurt: (p) => { tone({ f0: 240, f1: 110, dur: 0.2, type: 'sawtooth', vol: 0.12, pan: p }); noise({ ft: 'bandpass', f0: 900, dur: 0.12, vol: 0.12, pan: p }); },
    death: (p) => { tone({ f0: 320, f1: 50, dur: 0.7, type: 'square', vol: 0.1, pan: p }); noise({ f0: 500, f1: 80, dur: 0.6, vol: 0.2, pan: p }); },
    grab: (p) => tone({ f0: 700, f1: 1250, dur: 0.07, vol: 0.09, pan: p }),
    coin: (p) => { tone({ f0: 1318, dur: 0.09, vol: 0.09, type: 'triangle', pan: p }); tone({ f0: 1760, dur: 0.14, vol: 0.09, type: 'triangle', d: 0.06, pan: p }); },
    bow: (p) => { noise({ ft: 'highpass', f0: 2500, dur: 0.12, vol: 0.12, pan: p }); tone({ f0: 220, f1: 90, dur: 0.1, vol: 0.1, type: 'triangle', pan: p }); },
    magic: (p) => { tone({ f0: 500, f1: 1300, dur: 0.22, vol: 0.09, pan: p }); tone({ f0: 750, f1: 1700, dur: 0.22, vol: 0.05, type: 'triangle', pan: p }); },
    nomana: (p) => tone({ f0: 130, dur: 0.1, type: 'square', vol: 0.06, pan: p }),
    drink: (p) => { for (let i = 0; i < 3; i++) tone({ f0: 300 + i * 80, f1: 420 + i * 90, dur: 0.07, vol: 0.09, d: i * 0.08, pan: p }); },
    crystal: (p) => [600, 800, 1000, 1300, 1600].forEach((f, i) => tone({ f0: f, dur: 0.22, vol: 0.07, d: i * 0.07, type: 'triangle', pan: p })),
    mirror0: (p) => tone({ f0: 500, f1: 1500, dur: 1.2, vol: 0.07, type: 'triangle', pan: p }),
    mirror: (p) => tone({ f0: 1500, f1: 400, dur: 0.5, vol: 0.09, type: 'triangle', pan: p }),
    stone: (p) => { noise({ ft: 'bandpass', f0: 1000, f1: 500, dur: 0.07, vol: 0.14, pan: p }); tone({ f0: 160, f1: 110, dur: 0.06, vol: 0.09, pan: p }); },
    metal: (p) => { noise({ ft: 'bandpass', f0: 2400, dur: 0.06, vol: 0.12, pan: p }); tone({ f0: 900, f1: 700, dur: 0.1, vol: 0.05, type: 'triangle', pan: p }); },
    wood: (p) => { noise({ ft: 'bandpass', f0: 600, dur: 0.07, vol: 0.14, pan: p }); tone({ f0: 210, f1: 140, dur: 0.07, vol: 0.1, type: 'triangle', pan: p }); },
    glass: (p) => { noise({ ft: 'highpass', f0: 4000, dur: 0.1, vol: 0.1, pan: p }); tone({ f0: 2400, f1: 1800, dur: 0.1, vol: 0.04, pan: p }); },
    dirt: (p) => noise({ f0: 700, f1: 300, dur: 0.08, vol: 0.14, pan: p }),
    sand: (p) => noise({ ft: 'bandpass', f0: 2200, dur: 0.1, vol: 0.1, pan: p }),
    snow: (p) => noise({ ft: 'bandpass', f0: 1500, dur: 0.1, vol: 0.09, pan: p }),
    plant: (p) => noise({ ft: 'bandpass', f0: 3000, dur: 0.08, vol: 0.08, pan: p }),
    hiss: (p) => noise({ ft: 'highpass', f0: 3000, dur: 0.45, vol: 0.14, pan: p }),
    door: (p) => { tone({ f0: 170, f1: 120, dur: 0.1, type: 'square', vol: 0.05, pan: p }); noise({ ft: 'bandpass', f0: 500, dur: 0.1, vol: 0.1, pan: p }); },
    orb: (p) => { tone({ f0: 120, dur: 0.6, vol: 0.14, pan: p }); tone({ f0: 126, dur: 0.6, vol: 0.14, pan: p }); noise({ f0: 300, dur: 0.4, vol: 0.12, pan: p }); },
    roar: (p) => { tone({ f0: 110, f1: 45, dur: 1.1, type: 'sawtooth', vol: 0.16, pan: p }); noise({ f0: 600, f1: 100, dur: 1, vol: 0.2, pan: p }); },
    dash: (p) => noise({ ft: 'bandpass', f0: 300, f1: 2400, dur: 0.3, vol: 0.14, pan: p }),
    slam: (p) => { noise({ f0: 260, dur: 0.3, vol: 0.28, pan: p }); tone({ f0: 70, f1: 40, dur: 0.3, vol: 0.2, pan: p }); },
    teleport: (p) => { tone({ f0: 1000, f1: 200, dur: 0.35, vol: 0.1, type: 'triangle', pan: p }); noise({ ft: 'bandpass', f0: 3000, f1: 400, dur: 0.3, vol: 0.08, pan: p }); },
    fire: (p) => noise({ ft: 'bandpass', f0: 1400, f1: 500, dur: 0.22, vol: 0.12, pan: p }),
    mobhit: (p) => { noise({ ft: 'bandpass', f0: 500, dur: 0.07, vol: 0.16, pan: p }); tone({ f0: 170, f1: 90, dur: 0.1, type: 'square', vol: 0.06, pan: p }); },
    slimehit: (p) => tone({ f0: 330, f1: 140, dur: 0.14, vol: 0.14, pan: p }),
    mobdie: (p) => { tone({ f0: 210, f1: 60, dur: 0.3, type: 'sawtooth', vol: 0.1, pan: p }); noise({ f0: 400, dur: 0.15, vol: 0.12, pan: p }); },
    bossdie: (p) => { tone({ f0: 180, f1: 30, dur: 1.6, type: 'sawtooth', vol: 0.18, pan: p }); noise({ f0: 800, f1: 60, dur: 1.5, vol: 0.25, pan: p }); },
    arrowhit: (p) => noise({ ft: 'bandpass', f0: 1800, dur: 0.05, vol: 0.1, pan: p }),
    ui: () => tone({ f0: 900, dur: 0.04, vol: 0.05, type: 'triangle' }),
    click: () => { tone({ f0: 600, dur: 0.05, vol: 0.06, type: 'triangle' }); },
    craft: (p) => { tone({ f0: 500, f1: 800, dur: 0.1, vol: 0.08, type: 'triangle', pan: p }); tone({ f0: 800, f1: 1000, dur: 0.12, vol: 0.08, type: 'triangle', d: 0.08, pan: p }); },
    buy: (p) => { tone({ f0: 1200, dur: 0.07, vol: 0.08, type: 'triangle', pan: p }); tone({ f0: 1600, dur: 0.12, vol: 0.08, type: 'triangle', d: 0.07, pan: p }); },
    dawn: () => [523, 659, 784, 1046].forEach((f, i) => tone({ f0: f, dur: 0.6, vol: 0.06, type: 'sine', d: i * 0.18 })),
    dusk: () => [784, 659, 523, 392].forEach((f, i) => tone({ f0: f, dur: 0.6, vol: 0.06, type: 'sine', d: i * 0.18 }))
  };
  const NETSND = new Set(['mobhit', 'slimehit', 'mobdie', 'bossdie', 'roar', 'dash', 'slam', 'teleport', 'fire', 'arrowhit', 'hiss', 'death', 'hurt', 'orb']);
  const sndRate = new Map();
  function playSnd(name, x, y) {
    if (!AC || !api || api.muted || AC.state !== 'running') return;
    const f = SND[name];
    if (!f) return;
    let pan = 0, vol = 1;
    if (x !== undefined && G && G.me) {
      const dx = x - pcx(G.me), dy = y - pcy(G.me), d = Math.hypot(dx * 0.7, dy);
      vol = clamp(1 - d / 900, 0, 1);
      if (vol <= 0.02) return;
      pan = clamp(dx / 700, -0.8, 0.8);
    }
    const last = sndRate.get(name) || 0, t = performance.now();
    if (t - last < 35) return;
    sndRate.set(name, t);
    const sv = sfxBus.gain.value;
    sfxBus.gain.value = sv * vol;
    try { f(pan); } catch (e) { }
    sfxBus.gain.value = sv;
  }
  function sfxAt(name, x, y) {
    playSnd(name, x, y);
    if (G && G.net && G.net.role === 'host' && NETSND.has(name) && sndQ.length < 12) sndQ.push([name, Math.round(x), Math.round(y)]);
  }
  const SCALES = { forest: [0, 2, 4, 7, 9], night: [0, 3, 5, 7, 10], snow: [0, 2, 4, 7, 11], desert: [0, 1, 4, 5, 7, 8], corrupt: [0, 1, 3, 6, 7], cave: [0, 3, 5, 6, 10], hell: [0, 1, 4, 6, 7], boss: [0, 1, 3, 6, 7] };
  let musT = 0, musIdx = 0;
  function musicMode() {
    if (!G || !G.me) return 'forest';
    if (G.ents.some(e => e.k === 'mob' && e.hp > 0 && MOB[e.ty].boss)) return 'boss';
    const p = G.me, ty = Math.floor(pcy(p) / 16), tx = clamp(Math.floor(pcx(p) / 16), 0, W.w - 1);
    if (ty >= W.hellY) return 'hell';
    if (ty > W.surf[tx] + 8) return W.bio[tx] === BIOME.CORRUPT ? 'corrupt' : 'cave';
    const b = W.bio[tx];
    if (b === BIOME.CORRUPT) return 'corrupt';
    if (!W.day) return 'night';
    return b === BIOME.SNOW ? 'snow' : b === BIOME.DESERT ? 'desert' : 'forest';
  }
  function musicTick(dt) {
    if (!AC || !musicOn || !api || api.muted || AC.state !== 'running' || !G || !G.me) return;
    musT -= dt;
    if (musT > 0) return;
    const mode = musicMode();
    const sc = SCALES[mode] || SCALES.forest;
    const base = mode === 'hell' ? 41 : mode === 'cave' ? 46 : mode === 'corrupt' ? 44 : mode === 'boss' ? 43 : mode === 'night' ? 48 : 55;
    const fast = mode === 'boss' ? 0.3 : mode === 'forest' || mode === 'snow' || mode === 'desert' ? 0.9 : 1.5;
    const n = mode === 'boss' ? 2 : 1 + (Math.random() < 0.35 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const deg = sc[Math.random() * sc.length | 0], oct = Math.random() < 0.3 ? 12 : 0, up = mode === 'boss' ? 0 : (Math.random() < 0.5 ? 12 : 0);
      const f = 440 * Math.pow(2, (base + deg + oct + up - 69) / 12);
      const d = i * 0.12;
      tone({ f0: f, dur: mode === 'boss' ? 0.5 : 2.2, vol: 0.12, type: mode === 'boss' || mode === 'hell' ? 'sawtooth' : 'triangle', bus: musBus, d });
      if (mode !== 'boss' && Math.random() < 0.4) tone({ f0: f * 1.5, dur: 2.6, vol: 0.05, type: 'sine', bus: musBus, d: d + 0.2 });
    }
    if (musIdx++ % 6 === 0) tone({ f0: 440 * Math.pow(2, (base - 12 - 69) / 12), dur: 4, vol: 0.12, type: 'sine', bus: musBus });
    musT = fast * (0.8 + Math.random() * 1.2) * (mode === 'boss' ? 0.5 : 1.5);
  }
  function flushSnd() {
    if (!sndQ.length) return;
    sendNet({ t: 'snd', s: sndQ });
    sndQ = [];
  }
  const IN = { k: new Set(), ptrs: new Map(), joyId: null, useId: null, mUse: false, mDown: false, scrollAcc: 0 };
  let hudEl = null;
  const toHud = e => { const r = hudEl.getBoundingClientRect(); return { x: (e.clientX - r.left) * UI.w / Math.max(1, r.width), y: (e.clientY - r.top) * UI.h / Math.max(1, r.height) }; };
  const worldAx = x => UI.camX + x / UI.zs, worldAy = y => UI.camY + y / UI.zs;
  const inField = e => { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); };
  function inputTick(p) {
    const I = p.in, k = IN.k;
    const left = k.has('KeyA') || k.has('ArrowLeft'), right = k.has('KeyD') || k.has('ArrowRight');
    const up = k.has('KeyW') || k.has('ArrowUp'), jmp = up || k.has('Space'), dn = k.has('KeyS') || k.has('ArrowDown');
    const jx = UI.joyOn ? UI.joyDx : 0, jy = UI.joyOn ? UI.joyDy : 0;
    const off = p.dead || paused;
    I.l = !off && (left || jx < -0.3) ? 1 : 0;
    I.r = !off && (right || jx > 0.3) ? 1 : 0;
    I.j = !off && (jmp || UI.tJump || jy < -0.6) ? 1 : 0;
    I.up = !off && (up || jy < -0.6) ? 1 : 0;
    I.dn = !off && (dn || UI.tDown || jy > 0.6) ? 1 : 0;
    if (IN.useId != null) { const q = IN.ptrs.get(IN.useId); if (q) { I.ax = worldAx(q.x); I.ay = worldAy(q.y); } }
    else if (UI.mouse && !UI.touch) { I.ax = worldAx(UI.mx); I.ay = worldAy(UI.my); }
    I.use = !off && (IN.mUse || IN.useId != null || IN.tap > 0) ? 1 : 0;
    if (IN.tap > 0) IN.tap--;
    if (UI.craftHold && (IN.mDown || IN.ptrs.size) && UI.recSel >= 0) {
      UI.craftHold++;
      if (UI.craftHold > 24 && UI.craftHold % 5 === 0 && UI.recList[UI.recSel] && !doCraft(UI.recList[UI.recSel])) UI.craftHold = 0;
    } else if (!IN.mDown && !IN.ptrs.size) UI.craftHold = 0;
  }
  function quickUse(kind) {
    const p = G.me;
    if (!p || p.dead || paused) return;
    for (let i = 0; i < 40; i++) {
      const s = p.inv[i];
      if (!s) continue;
      const d = IT[s.id];
      if (d.t === 'use' && (kind === 'heal' ? d.heal : d.healMana)) {
        if (kind === 'heal' && d.sick && p.sick > 0) { addMsg('Potion sickness: wait a moment', '#ff9090'); return; }
        const old = p.sel; p.sel = i; p.useT = 0;
        tryUse(p);
        p.sel = old;
        return;
      }
    }
    addMsg(kind === 'heal' ? 'No healing potions' : 'No mana potions', '#ff9090');
  }
  function toggleInv() {
    if (UI.open || UI.map) closePanels();
    else { UI.open = true; sfxAt('click'); }
  }
  function interactAt(p, ax, ay) {
    if (p.dead) return false;
    const n = npcAt(ax, ay);
    if (n && Math.abs(pcx(p) - (n.x + 10)) < 110 && Math.abs(pcy(p) - (n.y + 20)) < 90) { talkTo(n); return true; }
    const tx = Math.floor(ax / 16), ty = Math.floor(ay / 16), tt = gt(tx, ty);
    if (!tt) return false;
    if (!inReach(p, tx, ty, 1)) return false;
    const i = ty * W.w + tx, ox = tx - (W.fr[i] & 15), oy = ty - (W.fr[i] >> 4);
    if (tt === T.DOORC || tt === T.DOORO) {
      if (AUTH()) toggleDoor(tx, ty); else sendNet({ t: 'door', x: tx, y: ty });
      return true;
    }
    if (tt === T.CHEST) { openChest(ox, oy); return true; }
    if (tt === T.BED) {
      p.spawn = [ox + 2, oy];
      if (p.ch.spawns) p.ch.spawns[W.id] = p.spawn;
      addMsg('Spawn point set', '#a0ffa0'); sfxAt('click');
      return true;
    }
    if (tt === T.SIGN) { addMsg('The sign is blank.', '#d8c8a0'); return true; }
    return false;
  }
  function pressTB(id, down) {
    const p = G.me;
    if (id === 'jump') UI.tJump = down;
    else if (id === 'down') UI.tDown = down;
    else if (!down) return;
    else if (id === 'heal') quickUse('heal');
    else if (id === 'inv') toggleInv();
    else if (id === 'map') { UI.map = !UI.map; sfxAt('click'); }
    else if (id === 'pause') openPause();
    void p;
  }
  function handleBtn(b, right, shift) {
    const p = G.me;
    if (b.k === 'minimap') { UI.map = true; sfxAt('click'); return true; }
    if (b.k === 'slot' && !UI.open && b.a === 'inv') { p.sel = b.b; sfxAt('click'); return true; }
    return uiClick(b, right, shift);
  }
  function onDown(e) {
    if (!G || paused || !hudEl) return;
    audioInit();
    const pt = toHud(e), p = G.me;
    if (e.pointerType === 'touch') { touchDown(e, pt); return; }
    UI.mouse = true; UI.touch = false; UI.mx = pt.x; UI.my = pt.y;
    try { hudEl.setPointerCapture(e.pointerId); } catch (x) { }
    e.preventDefault();
    const right = e.button === 2;
    IN.mDown = true;
    UI.hover = hitBtn(pt.x, pt.y);
    const b = UI.hover;
    if (b) { handleBtn(b, right, e.shiftKey); return; }
    if (UI.map) { UI.map = false; return; }
    if (UI.held) { dropHeld(); return; }
    if (p.dead) return;
    if (right) { interactAt(p, worldAx(pt.x), worldAy(pt.y)); return; }
    if (e.button === 0) {
      if (UI.talk) UI.talk = null;
      IN.mUse = true; IN.tap = 2;
    }
  }
  function onMove(e) {
    if (!G || !hudEl) return;
    const pt = toHud(e);
    if (e.pointerType === 'touch') { touchMove(e, pt); return; }
    UI.mouse = true; UI.touch = false; UI.mx = pt.x; UI.my = pt.y;
  }
  function onUp(e) {
    if (e.pointerType === 'touch') { touchUp(e); return; }
    IN.mDown = false; IN.mUse = false; UI.craftHold = 0;
  }
  function touchDown(e, pt) {
    UI.touch = true; UI.mouse = false; UI.mx = pt.x; UI.my = pt.y;
    const id = e.pointerId, p = G.me;
    try { hudEl.setPointerCapture(id); } catch (x) { }
    e.preventDefault();
    for (const tb of UI.tbtns || []) {
      if (Math.hypot(pt.x - tb.x, pt.y - tb.y) <= tb.r * 1.2) { IN.ptrs.set(id, { k: 'tb', id: tb.id, x: pt.x, y: pt.y }); pressTB(tb.id, true); return; }
    }
    UI.hover = hitBtn(pt.x, pt.y);
    const b = UI.hover;
    if (b) {
      const scr = b.k === 'rec' || b.k === 'recarea' || b.k === 'shop';
      IN.ptrs.set(id, { k: 'ui', b, x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, acc: 0, moved: false });
      if (!scr) handleBtn(b, false, false);
      return;
    }
    if (UI.map) { UI.map = false; return; }
    if (UI.held) { dropHeld(); return; }
    if (p.dead) return;
    if (!UI.open && pt.x < UI.w * 0.42 && pt.y > UI.h * 0.3 && IN.joyId == null) {
      IN.joyId = id; UI.joyOn = true; UI.joyDx = 0; UI.joyDy = 0;
      IN.ptrs.set(id, { k: 'joy', x: pt.x, y: pt.y });
      touchMove(e, pt);
      return;
    }
    const ax = worldAx(pt.x), ay = worldAy(pt.y);
    IN.ptrs.set(id, { k: 'use', x: pt.x, y: pt.y });
    if (UI.talk) UI.talk = null;
    if (interactAt(p, ax, ay)) { IN.ptrs.get(id).k = 'none'; return; }
    if (IN.useId == null) { IN.useId = id; IN.tap = 2; UI.tx = pt.x; UI.ty = pt.y; }
  }
  function touchMove(e, pt) {
    const q = IN.ptrs.get(e.pointerId);
    UI.mx = pt.x; UI.my = pt.y;
    if (!q) return;
    q.x = pt.x; q.y = pt.y;
    if (q.k === 'joy' && UI.joy) {
      const dx = (pt.x - UI.joy.x) / UI.joy.r, dy = (pt.y - UI.joy.y) / UI.joy.r, m = Math.hypot(dx, dy) || 1, s = m > 1 ? 1 / m : 1;
      UI.joyDx = dx * s; UI.joyDy = dy * s;
    } else if (q.k === 'ui') {
      const dy = pt.y - q.sy;
      if (Math.abs(dy) > 10) q.moved = true;
      if (q.moved) {
        const step = 38, n = Math.trunc(dy / step) - q.acc;
        if (n) {
          q.acc += n;
          if (q.b.k === 'shop') UI.shopScroll -= n; else UI.recScroll -= n;
        }
      }
    } else if (q.k === 'use') { UI.tx = pt.x; UI.ty = pt.y; }
  }
  function touchUp(e) {
    const id = e.pointerId, q = IN.ptrs.get(id);
    IN.ptrs.delete(id);
    if (!q) return;
    if (q.k === 'tb') pressTB(q.id, false);
    else if (q.k === 'joy') { IN.joyId = null; UI.joyOn = false; UI.joyDx = 0; UI.joyDy = 0; }
    else if (q.k === 'use' && IN.useId === id) IN.useId = null;
    else if (q.k === 'ui' && !q.moved && (q.b.k === 'rec' || q.b.k === 'shop' || q.b.k === 'recarea')) handleBtn(q.b, false, false);
    if (!IN.ptrs.size) UI.craftHold = 0;
  }
  function onWheel(e) {
    if (!G || paused) return;
    e.preventDefault();
    const pt = toHud(e), p = G.me;
    UI.mx = pt.x; UI.my = pt.y; UI.mouse = true; UI.touch = false;
    const h = hitBtn(pt.x, pt.y), d = e.deltaY > 0 ? 1 : -1;
    if (UI.open && h && (h.k === 'rec' || h.k === 'recarea')) { UI.recScroll += d; return; }
    if (UI.open && h && h.k === 'shop') { UI.shopScroll += d; return; }
    if (UI.open && UI.shop && h && h.k === 'panel') { UI.shopScroll += d; return; }
    IN.scrollAcc += e.deltaY;
    if (Math.abs(IN.scrollAcc) >= 40) { const s = Math.sign(IN.scrollAcc); IN.scrollAcc = 0; p.sel = (p.sel + s + 10) % 10; sfxAt('click'); }
  }
  function onKeyDown(e) {
    if (!G || inField(e) || SCENE !== 'play') return;
    const c = e.code;
    if (paused) { if (c === 'Escape') { closePause(); e.preventDefault(); } return; }
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(c)) e.preventDefault();
    audioInit();
    const p = G.me;
    if (c === 'Escape') {
      e.preventDefault();
      if (UI.open || UI.map || UI.held || UI.talk || UI.chest || UI.shop) closePanels(); else openPause();
      return;
    }
    if (e.repeat) { IN.k.add(c); return; }
    IN.k.add(c);
    if (p.dead) return;
    if (c === 'KeyE' || c === 'KeyI' || c === 'Tab') { toggleInv(); return; }
    if (c === 'KeyM') { UI.map = !UI.map; sfxAt('click'); return; }
    if (c === 'KeyH') { quickUse('heal'); return; }
    if (c === 'KeyJ') { quickUse('mana'); return; }
    if (c === 'KeyN') { UI.mmOn = !UI.mmOn; return; }
    const m = /^Digit(\d)$/.exec(c);
    if (m) { p.sel = (+m[1] + 9) % 10; sfxAt('click'); }
  }
  function onKeyUp(e) { IN.k.delete(e.code); }
  function inputReset() {
    IN.k.clear(); IN.ptrs.clear(); IN.joyId = null; IN.useId = null; IN.mUse = false; IN.mDown = false;
    UI.joyOn = false; UI.joyDx = 0; UI.joyDy = 0; UI.tJump = false; UI.tDown = false; UI.craftHold = 0;
  }
  function bindInput(el) {
    hudEl = el;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') { UI.mx = -99; UI.my = -99; } });
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('wheel', onWheel, { passive: false });
    return [
      ['keydown', onKeyDown], ['keyup', onKeyUp], ['blur', inputReset]
    ];
  }
  const DBN = 'gameplay-terraria';
  const SETK = 'gameplay:terraria:set', LASTK = 'gameplay:terraria:last';
  let dbP = null;
  const memKV = { worlds: new Map(), wdata: new Map(), chars: new Map() };
  function db() {
    if (!dbP) dbP = new Promise(res => {
      try {
        const r = indexedDB.open(DBN, 1);
        r.onupgradeneeded = () => { const d = r.result; for (const s of ['worlds', 'wdata', 'chars']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' }); };
        r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null);
        setTimeout(() => res(null), 4000);
      } catch (e) { res(null); }
    });
    return dbP;
  }
  function kv(store, op, val) {
    return db().then(d => {
      if (!d) {
        const m = memKV[store];
        if (op === 'all') return [...m.values()];
        if (op === 'get') return m.get(val);
        if (op === 'put') { m.set(val.id, val); return true; }
        m.delete(val); return true;
      }
      return new Promise(res => {
        try {
          const tx = d.transaction(store, op === 'all' || op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(store);
          const r = op === 'all' ? st.getAll() : op === 'get' ? st.get(val) : op === 'put' ? st.put(val) : st.delete(val);
          if (op === 'put' || op === 'del') tx.oncomplete = () => res(true);
          r.onsuccess = () => { if (op === 'all' || op === 'get') res(r.result); };
          r.onerror = () => res(op === 'all' ? [] : null); tx.onerror = () => res(op === 'all' ? [] : null); tx.onabort = () => res(op === 'all' ? [] : null);
        } catch (e) { res(op === 'all' ? [] : null); }
      });
    });
  }
  const listWorlds = () => kv('worlds', 'all').then(l => (l || []).filter(w => w && w.id).sort((a, b) => (b.last || 0) - (a.last || 0)));
  const listChars = () => kv('chars', 'all').then(l => (l || []).filter(c => c && c.id).sort((a, b) => (b.last || b.created || 0) - (a.last || a.created || 0)));
  const deleteWorld = id => Promise.all([kv('worlds', 'del', id), kv('wdata', 'del', id)]);
  const deleteChar = id => kv('chars', 'del', id);
  const saveChar = ch => { ch.last = Date.now(); return kv('chars', 'put', JSON.parse(JSON.stringify(ch))); };
  const yieldUi = () => new Promise(r => setTimeout(r, 0));
  async function encAsync(a) {
    const parts = [];
    let tot = 0;
    for (let i = 0; i < a.length; i += 262144) { const e = rleEnc(a.subarray(i, Math.min(a.length, i + 262144))); parts.push(e); tot += e.length; if (a.length > 600000) await yieldUi(); }
    const o = new Uint8Array(tot);
    let k = 0;
    for (const p of parts) { o.set(p, k); k += p.length; }
    return o;
  }
  const worldMeta = Wd => ({ id: Wd.id, name: Wd.name, size: Wd.size, seed: Wd.seed, w: Wd.w, h: Wd.h, days: Wd.days, created: Wd.created, last: Date.now(), played: Wd.played | 0, evil: (Wd.flags.eow ? 1 : 0) + (Wd.flags.eoc ? 1 : 0) + (Wd.flags.kingSlime ? 1 : 0) });
  async function worldData(Wd) {
    const [t, wl, lq, fl, fr] = [await encAsync(Wd.t), await encAsync(Wd.wl), await encAsync(Wd.lq), await encAsync(Wd.fl), await encAsync(Wd.fr)];
    const chests = [];
    Wd.chests.forEach((c, k) => { if (c.items.some(s => s)) chests.push([k, c.items.map(s => s ? [s.id, s.n] : 0)]); else chests.push([k, 0]); });
    return {
      id: Wd.id, ver: 1, t, wl, lq, fl, fr, surf: Int16Array.from(Wd.surf), bio: Uint8Array.from(Wd.bio), tod: Wd.tod, day: Wd.day, days: Wd.days, moon: Wd.moon, flags: Object.assign({}, Wd.flags),
      spawnX: Wd.spawnX, spawnY: Wd.spawnY, chests, npcs: G && G.npcs ? G.npcs.filter(n => n.hp > 0).map(serializeNpc) : Wd.npcs, npcDead: Wd.npcDead || {}, sap: Wd.saplings ? [...Wd.saplings].map(([k, v]) => [k, v - (G ? G.tick : 0)]) : []
    };
  }
  function restoreWorld(meta, d) {
    const Wd = newWorld(meta.w, meta.h, meta.name, meta.seed, meta.size);
    const n = meta.w * meta.h;
    Wd.id = meta.id; Wd.created = meta.created; Wd.played = meta.played | 0;
    Wd.t = rleDec(d.t, n); Wd.wl = rleDec(d.wl, n); Wd.lq = rleDec(d.lq, n); Wd.fl = rleDec(d.fl, n); Wd.fr = rleDec(d.fr, n);
    Wd.surf = Int16Array.from(d.surf); Wd.bio = Uint8Array.from(d.bio);
    Wd.tod = d.tod; Wd.day = d.day; Wd.days = d.days; Wd.moon = d.moon;
    Object.assign(Wd.flags, d.flags || {});
    Wd.spawnX = d.spawnX; Wd.spawnY = d.spawnY; Wd.npcs = d.npcs || []; Wd.npcDead = d.npcDead || {};
    for (const [k, items] of d.chests || []) Wd.chests.set(k, { x: k % meta.w, y: (k / meta.w) | 0, items: items ? items.map(s => s ? { id: s[0], n: s[1] } : null) : new Array(40).fill(null) });
    Wd.saplingsInit = d.sap || [];
    const prev = W; W = Wd;
    for (let x = 0; x < Wd.w; x++) recomputeTop(x);
    W = prev;
    return Wd;
  }
  async function loadWorld(id) {
    const [meta, d] = [await kv('worlds', 'get', id), await kv('wdata', 'get', id)];
    if (!meta || !d) return null;
    return restoreWorld(meta, d);
  }
  let saving = false;
  async function saveFog(ch) {
    if (!MM.seen || !W) return;
    ch.maps = ch.maps || {};
    ch.maps[W.id] = b64e(await encAsync(MM.seen));
  }
  function syncChar(p) {
    const ch = p.ch;
    ch.coins = p.coins | 0; ch.hp = Math.max(1, Math.round(p.hp)); ch.spawns = ch.spawns || {};
    if (p.spawn) ch.spawns[W.id] = p.spawn;
  }
  async function saveNow(withWorld) {
    if (!G || !G.me || saving) return;
    saving = true;
    try {
      const p = G.me;
      syncChar(p);
      p.ch.played = (p.ch.played | 0) + Math.floor((Date.now() - (G.sessT || Date.now())) / 1000); G.sessT = Date.now();
      await saveFog(p.ch);
      await saveChar(p.ch);
      if (withWorld !== false && AUTH() && !G.isGuestWorld) {
        W.played = (W.played | 0) + 0;
        const d = await worldData(W);
        await Promise.all([kv('worlds', 'put', worldMeta(W)), kv('wdata', 'put', d)]);
        W.dirty = 0;
      }
    } catch (e) { if (window.console) console.warn('save failed', e); }
    saving = false;
  }
  function saveSoon() { if (G && !saving && G.tick - (G.lastSave || 0) > 120) { G.lastSave = G.tick; saveNow(); } }
  function loadSettings() {
    try { const s = JSON.parse(localStorage.getItem(SETK) || 'null'); if (s) { if (typeof s.sfx === 'number') sfxVol = s.sfx; if (typeof s.mus === 'number') musVol = s.mus; if (typeof s.music === 'boolean') musicOn = s.music; if (typeof s.mm === 'boolean') UI.mmOn = s.mm; } } catch (e) { }
    setVolumes();
  }
  function storeSettings() { try { localStorage.setItem(SETK, JSON.stringify({ sfx: sfxVol, mus: musVol, music: musicOn, mm: UI.mmOn })); } catch (e) { } setVolumes(); }
  const getLast = () => { try { return JSON.parse(localStorage.getItem(LASTK) || 'null') || {}; } catch (e) { return {}; } };
  const setLast = o => { try { localStorage.setItem(LASTK, JSON.stringify(Object.assign(getLast(), o))); } catch (e) { } };
  let uiEl = null;
  const M = { mode: 'solo', ch: null, draft: null, confirm: null, back: 'title', room: null, pickHost: false, wname: '', wsize: 'small', wseed: '', joinT: 0 };
  const WNAMES = ['Greenfield', 'Hollow Peak', 'Mossbrook', 'Dunewatch', 'Frostmere', 'Ashgrove', 'Copper Vale', 'Ember Reach', 'Stonehaven', 'Lantern Bay', 'Mirefall', 'Skyhook'];
  const SIZEDESC = { small: 'Quick trips, fast to explore', medium: 'More caves and ores', large: 'A long expedition' };
  const fmtTime = s => { s = s | 0; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + 'h ' + m + 'm' : m + 'm'; };
  const fmtDate = t => { try { return new Date(t).toLocaleDateString(); } catch (e) { return ''; } };
  const btnH = (a, label, o) => '<button class="tr-b' + (o && o.cls ? ' ' + o.cls : '') + '" data-a="' + a + '"' + (o && o.d ? Object.keys(o.d).map(k => ' data-' + k + '="' + esc(o.d[k]) + '"').join('') : '') + '>' + label + '</button>';
  function drawPreview(cv, ch) {
    cv.width = 40; cv.height = 56;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 40, 56);
    g.drawImage(charImg(lookFromChar(ch), NOEQ, 0, false), 0, 0);
  }
  function paintPreviews() { uiEl.querySelectorAll('canvas[data-ch]').forEach(cv => { const ch = M.chMap && M.chMap.get(cv.dataset.ch); if (ch) drawPreview(cv, ch); }); }
  function genProg(msg, f) {
    const b = uiEl && uiEl.querySelector('#trprog'), t = uiEl && uiEl.querySelector('#trprogt');
    if (b) b.style.width = Math.round(clamp(f, 0, 1) * 100) + '%';
    if (t && msg) t.textContent = msg;
  }
  function showMenu(name, arg) {
    if (!uiEl) return;
    M.name = name;
    if (!name) { uiEl.innerHTML = ''; uiEl.style.display = 'none'; return; }
    uiEl.style.display = 'flex';
    uiEl.className = 'tr-ui tr-s-' + name;
    (SCREENS[name] || SCREENS.title)(arg || {});
    uiEl.scrollTop = 0;
  }
  const panel = (title, body, foot) => '<div class="tr-panel"><h2>' + title + '</h2><div class="tr-body">' + body + '</div>' + (foot ? '<div class="tr-foot">' + foot + '</div>' : '') + '</div>';
  const SCREENS = {
    title() {
      uiEl.innerHTML = '<div class="tr-logo"><span>TERRARIA</span><small>Dig. Fight. Build.</small></div><div class="tr-menu">' +
        btnH('solo', 'Single Player') + btnH('multi', 'Multiplayer') + btnH('settings', 'Settings', { d: { back: 'title' } }) + btnH('help', 'How to Play', { d: { back: 'title' } }) + '</div>';
    },
    wait() { uiEl.innerHTML = panel('Multiplayer', '<p class="tr-c">Opening the party lobby...</p>'); },
    gen(a) { uiEl.innerHTML = panel(a.t || 'Working', '<p class="tr-c" id="trprogt">' + esc(a.s || 'Please wait...') + '</p><div class="tr-bar"><i id="trprog"></i></div>'); },
    chars() {
      uiEl.innerHTML = panel('Select Player', '<p class="tr-c">Loading...</p>');
      listChars().then(list => {
        if (M.name !== 'chars') return;
        if (!list.length) { M.draft = randomDraft(); showMenu('charnew'); return; }
        M.chMap = new Map(list.map(c => [c.id, c]));
        const cards = list.map(c => {
          const sure = M.confirm === 'c' + c.id;
          return '<div class="tr-card"><canvas data-ch="' + esc(c.id) + '" class="tr-pv"></canvas><div class="tr-ci"><b>' + esc(c.name) + '</b><span>Life ' + c.hpMax + ' &nbsp; Mana ' + c.manaMax + '</span><span>' + fmtTime(c.played) + ' played</span></div><div class="tr-ca">' +
            (sure ? btnH('delchar', 'Delete?', { cls: 'tr-red', d: { id: c.id } }) + btnH('noconf', 'No') : btnH('pickchar', 'Play', { d: { id: c.id } }) + btnH('askdelc', 'X', { cls: 'tr-sm', d: { id: c.id } })) + '</div></div>';
        }).join('');
        uiEl.innerHTML = panel('Select Player', '<div class="tr-list">' + cards + '</div>', btnH('newchar', 'New Player') + btnH('back', 'Back'));
        paintPreviews();
      });
    },
    charnew() {
      const d = M.draft;
      const sw = (k, arr) => '<div class="tr-sw">' + arr.map((c, i) => '<button data-a="opt" data-k="' + k + '" data-v="' + i + '" class="tr-sq' + (d[k] === i ? ' on' : '') + '" style="background:' + c + '"></button>').join('') + '</div>';
      const row = (l, h) => '<div class="tr-row"><label>' + l + '</label>' + h + '</div>';
      const hs = '<div class="tr-sw">' + [0, 1, 2, 3, 4].map(i => '<button data-a="opt" data-k="hs" data-v="' + i + '" class="tr-sq tr-tx' + (d.hs === i ? ' on' : '') + '">' + (i + 1) + '</button>').join('') + '</div>';
      const eys = '<div class="tr-sw">' + ['#2a3c78', '#3a8c4a', '#7c4a2a'].map((c, i) => '<button data-a="opt" data-k="ey" data-v="' + i + '" class="tr-sq' + (d.ey === i ? ' on' : '') + '" style="background:' + c + '"></button>').join('') + '</div>';
      uiEl.innerHTML = panel('New Player', '<div class="tr-cn"><canvas id="trprev" class="tr-pv big"></canvas><div class="tr-opts"><div class="tr-row"><label>Name</label><input id="trname" maxlength="16" value="' + esc(d.name) + '" autocomplete="off" spellcheck="false"></div>' +
        row('Skin', sw('sk', SKINS)) + row('Hair', hs) + row('Hair color', sw('hc', HAIRS)) + row('Shirt', sw('sh', SHIRTS)) + row('Pants', sw('pn', PANTS)) + row('Eyes', eys) + '</div></div>',
        btnH('rand', 'Randomize') + btnH('createchar', 'Create', { cls: 'tr-go' }) + btnH('back', 'Back'));
      drawPreview(uiEl.querySelector('#trprev'), d);
    },
    worlds(a) {
      uiEl.innerHTML = panel(M.pickHost ? 'Choose a world to host' : 'Select World', '<p class="tr-c">Loading...</p>');
      listWorlds().then(list => {
        if (M.name !== 'worlds') return;
        const cards = list.map(w => {
          const sure = M.confirm === 'w' + w.id, sz = SIZES[w.size] ? SIZES[w.size][2] : '';
          return '<div class="tr-card"><div class="tr-ci wide"><b>' + esc(w.name) + '</b><span>' + sz + ' &nbsp; Day ' + ((w.days | 0) + 1) + ' &nbsp; Bosses ' + (w.evil | 0) + '/3</span><span>Last played ' + fmtDate(w.last) + '</span></div><div class="tr-ca">' +
            (sure ? btnH('delworld', 'Delete?', { cls: 'tr-red', d: { id: w.id } }) + btnH('noconf', 'No') : btnH('pickworld', M.pickHost || M.mode === 'multi' ? 'Host' : 'Play', { d: { id: w.id } }) + btnH('askdelw', 'X', { cls: 'tr-sm', d: { id: w.id } })) + '</div></div>';
        }).join('') || '<p class="tr-c">No worlds yet. Create one to start.</p>';
        uiEl.innerHTML = panel(M.pickHost ? 'Choose a world to host' : 'Select World', '<div class="tr-list">' + cards + '</div>',
          btnH('newworld', 'New World') + (M.mode === 'multi' && !M.pickHost ? btnH('joingame', 'Join a Friend') : '') + (M.pickHost ? '' : btnH('back', 'Back')));
        void a;
      });
    },
    worldnew() {
      if (!M.wname) M.wname = WNAMES[Math.random() * WNAMES.length | 0];
      const sz = Object.keys(SIZES).map(k => '<button data-a="wsize" data-v="' + k + '" class="tr-opt' + (M.wsize === k ? ' on' : '') + '"><b>' + SIZES[k][2] + '</b><span>' + SIZES[k][0] + ' x ' + SIZES[k][1] + '</span><i>' + SIZEDESC[k] + '</i></button>').join('');
      uiEl.innerHTML = panel('New World', '<div class="tr-row"><label>Name</label><input id="trwname" maxlength="20" value="' + esc(M.wname) + '" autocomplete="off" spellcheck="false"></div><div class="tr-sizes">' + sz + '</div><div class="tr-row"><label>Seed</label><input id="trwseed" maxlength="24" value="' + esc(M.wseed) + '" placeholder="random" autocomplete="off" spellcheck="false"></div>',
        btnH('createworld', 'Create', { cls: 'tr-go' }) + btnH('backworlds', 'Back'));
    },
    pause() {
      const on = NET.role && G && G.players.size > 1 || NET.role === 'host';
      const code = api.net && api.net.code ? '<p class="tr-c">Party code <b>' + esc(api.net.code) + '</b> &nbsp; Players ' + (G ? G.players.size : 1) + '</p>' : '';
      uiEl.innerHTML = panel('Paused', code + '<div class="tr-menu">' + btnH('resume', 'Resume', { cls: 'tr-go' }) + btnH('settings', 'Settings', { d: { back: 'pause' } }) + btnH('help', 'How to Play', { d: { back: 'pause' } }) +
        (NET.role === 'host' ? btnH('lobby', 'Party Lobby') : '') + btnH('quit', NET.role === 'guest' ? 'Leave Game' : 'Save &amp; Exit') + '</div>');
      void on;
    },
    settings() {
      uiEl.innerHTML = panel('Settings', '<div class="tr-row"><label>Effects</label><input type="range" min="0" max="100" value="' + Math.round(sfxVol * 100) + '" data-r="sfx"></div><div class="tr-row"><label>Music</label><input type="range" min="0" max="100" value="' + Math.round(musVol * 100) + '" data-r="mus"></div>' +
        '<div class="tr-row"><label>Music on</label><button class="tr-b tr-sm' + (musicOn ? ' tr-go' : '') + '" data-a="tmusic">' + (musicOn ? 'On' : 'Off') + '</button></div><div class="tr-row"><label>Minimap</label><button class="tr-b tr-sm' + (UI.mmOn ? ' tr-go' : '') + '" data-a="tmm">' + (UI.mmOn ? 'On' : 'Off') + '</button></div>', btnH('backs', 'Back'));
    },
    help() {
      uiEl.innerHTML = panel('How to Play', '<div class="tr-help"><p><b>Move</b> A / D, jump W or Space, down S (drop through platforms).</p><p><b>Use item</b> left click: swing, mine, shoot, place. Hold to keep going. <b>Right click</b> opens doors, chests, beds, talks to townspeople.</p><p><b>Hotbar</b> keys 1-0 or mouse wheel. <b>E</b> or Tab inventory and crafting. <b>H</b> quick heal, <b>J</b> quick mana, <b>M</b> map, <b>N</b> minimap, <b>Esc</b> menu.</p><p><b>Craft</b> in the inventory. Stand next to a workbench, furnace, anvil or other station to unlock recipes.</p><p><b>Night</b> brings zombies and demon eyes. Build a house with walls, a door, a table, a chair and light so the Guide and Merchant move in.</p><p><b>Bosses</b> King Slime (Slime Crown), Eye of Cthulhu (Suspicious Looking Eye at night), Eater of Worlds (Worm Food in the Corruption, or smash 3 shadow orbs).</p><p><b>Touch</b> left stick to move, tap to use, buttons for jump, inventory and map.</p><p><b>Online</b> 2 to 4 players. The host keeps the world; use Multiplayer, pick a world, and share the party code.</p></div>', btnH('backs', 'Back'));
    },
    join() {
      uiEl.innerHTML = panel('Joining game', '<p class="tr-c" id="trprogt">Receiving world...</p><div class="tr-bar"><i id="trprog" style="width:' + Math.round((NET.prog || 0) * 100) + '%"></i></div>', btnH('quit', 'Leave'));
    },
    disc() {
      uiEl.innerHTML = panel('Disconnected', '<p class="tr-c">' + esc(NET.discMsg || 'The connection ended.') + '</p>', btnH('totitle', 'Main Menu'));
    }
  };
  function randomDraft() {
    const r = n => Math.random() * n | 0;
    return { name: 'Player', sk: r(SKINS.length), hs: r(5), hc: r(HAIRS.length), sh: r(SHIRTS.length), pn: r(PANTS.length), ey: r(3) };
  }
  const ACT = {
    solo() { M.mode = 'solo'; M.pickHost = false; showMenu('chars'); },
    multi() {
      if (!api.net) return;
      M.mode = 'multi'; M.pickHost = false; showMenu('chars');
    },
    settings(d) { M.back = d.back || 'title'; showMenu('settings'); },
    help(d) { M.back = d.back || 'title'; showMenu('help'); },
    back() { M.confirm = null; showMenu(M.mode ? 'title' : 'title'); },
    backs() { showMenu(M.back === 'pause' ? 'pause' : 'title'); },
    totitle() { showMenu('title'); },
    askdelc(d) { M.confirm = 'c' + d.id; showMenu('chars'); },
    askdelw(d) { M.confirm = 'w' + d.id; showMenu('worlds'); },
    noconf() { const w = M.name; M.confirm = null; showMenu(w); },
    delchar(d) { M.confirm = null; deleteChar(d.id).then(() => showMenu('chars')); },
    delworld(d) { M.confirm = null; deleteWorld(d.id).then(() => showMenu('worlds')); },
    newchar() { M.draft = randomDraft(); showMenu('charnew'); },
    opt(d, e) { const n = uiEl.querySelector('#trname'); if (n) M.draft.name = n.value; M.draft[d.k] = +d.v; showMenu('charnew'); void e; },
    rand() { const n = uiEl.querySelector('#trname'), nm = n ? n.value : M.draft.name; M.draft = randomDraft(); M.draft.name = nm; showMenu('charnew'); },
    createchar() {
      const n = uiEl.querySelector('#trname'), nm = ((n && n.value) || 'Player').replace(/[<>&"']/g, '').trim().slice(0, 16) || 'Player';
      const d = M.draft;
      const ch = newCharacter(nm, d);
      ch.spawns = {}; ch.maps = {};
      saveChar(ch).then(() => { M.ch = ch; showMenu('worlds'); });
    },
    pickchar(d) {
      const ch = M.chMap && M.chMap.get(d.id);
      if (!ch) return;
      ch.spawns = ch.spawns || {}; ch.maps = ch.maps || {};
      M.ch = ch; M.confirm = null; showMenu('worlds');
    },
    newworld() { M.wname = ''; showMenu('worldnew'); },
    backworlds() { showMenu('worlds'); },
    wsize(d) { const n = uiEl.querySelector('#trwname'), s = uiEl.querySelector('#trwseed'); if (n) M.wname = n.value; if (s) M.wseed = s.value; M.wsize = d.v; showMenu('worldnew'); },
    async createworld() {
      const n = uiEl.querySelector('#trwname'), s = uiEl.querySelector('#trwseed');
      const name = ((n && n.value) || 'World').replace(/[<>&"']/g, '').trim().slice(0, 20) || 'World', seedS = ((s && s.value) || '').trim();
      M.wseed = ''; M.wname = '';
      showMenu('gen', { t: 'Creating world', s: 'Starting...' });
      const sk = M.wsize, [w, h] = SIZES[sk];
      const seed = seedS ? (/^\d{1,10}$/.test(seedS) ? (+seedS) >>> 0 : strSeed(seedS)) : (Math.random() * 4294967296) >>> 0;
      let Wd;
      try {
        Wd = await genWorld(w, h, name, seed, sk, genProg);
        Wd.id = 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        genProg('Saving world...', 1);
        await Promise.all([kv('worlds', 'put', worldMeta(Wd)), kv('wdata', 'put', await worldData(Wd))]);
      } catch (e) { if (window.console) console.error(e); showMenu('worlds'); return; }
      beginWorld(Wd);
    },
    async pickworld(d) {
      showMenu('gen', { t: 'Loading world', s: 'Reading save...' });
      const Wd = await loadWorld(d.id);
      if (!Wd) { showMenu('worlds'); return; }
      beginWorld(Wd);
    },
    joingame() { openRoom(M.ch, null); },
    resume() { closePause(); },
    lobby() { if (NET.role === 'host') { closePause(); roomAgain(); } },
    quit() { closePause(); leaveToTitle(); },
    tmusic() { musicOn = !musicOn; storeSettings(); showMenu('settings'); },
    tmm() { UI.mmOn = !UI.mmOn; storeSettings(); showMenu('settings'); }
  };
  function beginWorld(Wd) {
    const ch = M.ch;
    if (M.mode === 'multi') {
      if (M.pickHost && M.room) { const r = M.room; M.room = null; M.pickHost = false; startHost(ch, Wd, r); }
      else openRoom(ch, Wd);
    } else startSolo(ch, Wd);
  }
  function openRoom(ch, Wd) {
    NET.ch = ch; M.ch = ch; M.mode = 'multi';
    showMenu('wait');
    api.net.room(roomOpts()).then(r => {
      if (!alive) return;
      if (!r) { leaveOnline(); showMenu('title'); return; }
      if (r.role === 'host') {
        if (Wd) onRoom(r, () => startHost(ch, Wd, r));
        else { NET.role = 'host'; NET.me = r.id; NET.hostId = r.id; M.room = r; M.pickHost = true; showMenu('worlds'); }
      } else onRoom(r, null);
    });
  }
  function openPause() {
    if (SCENE !== 'play' || !G || paused) return;
    paused = true; closePanels(); inputReset();
    showMenu('pause');
  }
  function closePause() {
    if (!paused) { if (M.name === 'pause') showMenu(null); return; }
    paused = false; showMenu(null); inputReset();
  }
  function bindMenus() {
    uiEl.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      const f = ACT[b.dataset.a];
      if (f) { audioInit(); f(b.dataset, e); }
    });
    uiEl.addEventListener('input', e => {
      const r = e.target.dataset && e.target.dataset.r;
      if (!r) return;
      const v = e.target.value / 100;
      if (r === 'sfx') sfxVol = v; else musVol = v;
      storeSettings();
    });
    uiEl.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { const go = uiEl.querySelector('.tr-go'); if (go) go.click(); } e.stopPropagation(); });
    uiEl.addEventListener('keyup', e => e.stopPropagation());
  }
  function autoResume() {
    const inv = api.net && api.net.invite;
    if (!inv) return;
    showMenu('wait');
    const last = getLast();
    let hs = null;
    try { hs = JSON.parse(sessionStorage.getItem('gameplay:terraria:host') || 'null'); } catch (e) { }
    listChars().then(async cl => {
      let ch = cl.find(c => c.id === (inv === 'NEW' && hs ? hs.cid : last.ch)) || cl[0];
      if (!ch) { let pn = 'Player'; try { const pr = JSON.parse(localStorage.getItem('gameplay:profile') || '{}'); pn = String(pr.username || pr.displayName || 'Player').replace(/[<>&"']/g, '').slice(0, 16) || 'Player'; } catch (e) { } ch = newCharacter(pn); ch.spawns = {}; ch.maps = {}; await saveChar(ch); }
      ch.spawns = ch.spawns || {}; ch.maps = ch.maps || {};
      let Wd = null;
      if (inv === 'NEW') { const wid = hs && hs.wid || last.w; if (wid) Wd = await loadWorld(wid); }
      if (!alive) return;
      openRoom(ch, Wd);
    });
  }
  const NET = { role: null, me: null, hostId: null, loaded: false, rgGot: 0, rgN: 0, rw: 0, streams: new Map(), sid: 0, gsid: 0, early: [], viewers: new Map(), names: new Map(), prog: 0, ch: null, bound: false, discMsg: '', pendingRoom: null };
  const sendNet = (m, fast) => { if (!NET.role || !api || !api.net) return; try { api.net.send(m, fast); } catch (e) { } };
  const sendTo = (id, m, fast) => { if (NET.role !== 'host' || !api || !api.net) return false; try { return api.net.sendTo(id, m, fast); } catch (e) { return false; } };
  function bmsg(s, c) { addMsg(s, c); if (G && G.net && G.net.role === 'host') sendNet({ t: 'msg', s, c }); }
  const r1 = v => Math.round(v * 10) / 10;
  const lookOf = ch => ({ sk: ch.sk, hs: ch.hs, hc: ch.hc, sh: ch.sh, pn: ch.pn, ey: ch.ey });
  const IRISK = ['blue', 'green', 'purple', 'red'], SEGK = ['head', 'body', 'tail'], STYK = ['swing', 'stab', 'aim', 'use'];
  function chestView(k, pid, on) {
    let s = NET.viewers.get(k);
    if (!s) NET.viewers.set(k, s = new Set());
    if (on) s.add(pid); else s.delete(pid);
  }
  function chestNotify(k, i, origin) {
    const s = NET.viewers.get(k);
    if (!s || !s.size || NET.role !== 'host') return;
    const c = W.chests.get(k), st = c && c.items[i];
    for (const pid of s) if (pid !== origin && pid !== G.me.id) sendTo(pid, { t: 'c1', k, i, s: st ? [st.id, st.n] : 0 });
  }
  const sanStack = s => (s && IT[s.id] && s.n > 0 ? { id: s.id, n: Math.min(IT[s.id].st, s.n | 0) } : null);
  function worldHeader() {
    const rw = Math.ceil(W.w / 64), rh = Math.ceil(W.h / 64);
    return {
      t: 'init', rn: rw * rh, rw, w: { id: W.id, name: W.name, seed: W.seed, size: W.size, w: W.w, h: W.h, tod: W.tod, day: W.day, days: W.days, moon: W.moon, spawnX: W.spawnX, spawnY: W.spawnY, flags: W.flags, surfBase: W.surfBase, rockY: W.rockY, hellY: W.hellY, spaceY: W.spaceY, created: W.created },
      surf: b64e(new Uint8Array(W.surf.buffer.slice(0))), bio: b64e(W.bio)
    };
  }
  function plList() { return [...G.players.values()].map(p => ({ pid: p.id, name: p.name, look: lookOf(p.ch), host: p === G.me ? 1 : 0 })); }
  function startStream(id) {
    if (NET.streams.has(id)) return;
    const hd = worldHeader(), p = G.players.get(id), sid = ++NET.sid;
    hd.pl = plList(); hd.you = id; hd.sid = sid;
    if (!sendTo(id, hd)) return;
    const rw = hd.rw, n = hd.rn, cx = p ? ((p.x / 16) >> 6) : 0, cy = p ? ((p.y / 16) >> 6) : 0, ord = [];
    for (let i = 0; i < n; i++) ord.push(i);
    ord.sort((a, b) => Math.hypot((a % rw) - cx, ((a / rw) | 0) - cy) - Math.hypot((b % rw) - cx, ((b / rw) | 0) - cy));
    NET.streams.set(id, { ord, i: 0, rw, sid });
  }
  const PLANES = ['t', 'wl', 'lq', 'fl', 'fr'];
  function regionMsg(i, rw, sid) {
    const rx = (i % rw) * 64, ry = ((i / rw) | 0) * 64, w = Math.min(64, W.w - rx), h = Math.min(64, W.h - ry);
    const d = PLANES.map(k => {
      const a = new Uint8Array(w * h), src = W[k];
      for (let y = 0; y < h; y++) a.set(src.subarray((ry + y) * W.w + rx, (ry + y) * W.w + rx + w), y * w);
      return b64e(rleEnc(a));
    });
    return { t: 'rg', i, d, sid };
  }
  function netStream() {
    for (const [id, s] of NET.streams) {
      for (let k = 0; k < 2 && s.i < s.ord.length; k++) { if (!sendTo(id, regionMsg(s.ord[s.i++], s.rw, s.sid))) { NET.streams.delete(id); break; } }
      if (s.i >= s.ord.length) { NET.streams.delete(id); sendTo(id, { t: 'rgdone', sid: s.sid }); }
    }
  }
  function applyRegion(m) {
    const rw = NET.rw, rx = (m.i % rw) * 64, ry = ((m.i / rw) | 0) * 64, w = Math.min(64, W.w - rx), h = Math.min(64, W.h - ry);
    PLANES.forEach((k, pi) => {
      const a = rleDec(b64d(m.d[pi]), w * h), dst = W[k];
      for (let y = 0; y < h; y++) dst.set(a.subarray(y * w, y * w + w), (ry + y) * W.w + rx);
    });
    NET.rgGot++;
    if (m.i >= 0) for (let cy = ry >> 4; cy <= (ry + h - 1) >> 4; cy++) for (let cx = rx >> 4; cx <= (rx + w - 1) >> 4; cx++) dirtyChunk(cx, cy);
  }
  function buildSnap() {
    const ps = [...G.players.values()];
    const near = e => { for (const p of ps) if (Math.abs(e.x - p.x) < 1500 && Math.abs(e.y - p.y) < 1000) return true; return false; };
    const m = [], it = [], q = [], s = [];
    for (const e of G.ents) {
      if (e.dead || !near(e)) continue;
      if (e.k === 'mob') { if (e.hp > 0) m.push([e.id, MOBK.indexOf(e.ty), r1(e.x), r1(e.y), e.f | 0, Math.round(e.rot * 100), e.dir, Math.ceil(e.hp), e.hpMax, e.flash > 0 ? 1 : 0, e.ph, e.fire > 0 ? 1 : 0, Math.max(0, IRISK.indexOf(e.iris)), Math.max(0, SEGK.indexOf(e.seg)), e.st | 0]); }
      else if (e.k === 'item') it.push([e.id, e.it, e.n, r1(e.x), r1(e.y)]);
      else if (e.k === 'proj') q.push([e.id, e.pt, r1(e.x), r1(e.y), Math.round(e.rot * 100), e.bolt || e.am || '', e.hostile ? 1 : 0, e.fire ? 1 : 0]);
      else if (e.k === 'fstar') s.push([e.id, r1(e.x), r1(e.y)]);
    }
    const pl = ps.map(p => {
      const eq = p === G.me ? [0, 1, 2].map(i => p.armor[i] ? p.armor[i].id : null) : (p.eq || [null, null, null]);
      const held = p === G.me ? (p.inv[p.sel] ? p.inv[p.sel].id : null) : (p.heldId || null);
      return [p.id, r1(p.x), r1(p.y), p.dir, p.fr, p.swing | 0, p.swingMax | 0, Math.round(p.swingAng * 100), Math.max(0, STYK.indexOf(p.swingStyle)), p.swingIt || '', held || '', Math.ceil(p.hp), p.hpMax, p.dead ? 1 : 0, eq[0], eq[1], eq[2], r1(p.vx)];
    });
    const n = G.npcs.map(o => [o.id, o.ty, o.name, r1(o.x), r1(o.y), o.dir, o.fr, o.hp, o.hpMax]);
    return { t: 'es', tod: W.tod, day: W.day ? 1 : 0, days: W.days, moon: W.moon, m, i: it, q, s, p: pl, n };
  }
  const rmIdx = new Map();
  function getRemote(id, name, look) {
    let p = G.players.get(id);
    if (!p) {
      const ch = Object.assign(newCharacter(name, look || {}), { id });
      p = mkPlayer(id, name, ch); p.remote = true;
      p.tx = p.x; p.ty = p.y; p.eq = [null, null, null]; p.heldId = null;
      G.players.set(id, p);
    } else if (look) { Object.assign(p.ch, look); p.look = lookFromChar(p.ch); }
    return p;
  }
  function applySnap(m) {
    W.tod = m.tod; W.day = !!m.day; W.days = m.days; W.moon = m.moon;
    const old = new Map();
    for (const e of G.ents) old.set(e.id, e);
    const list = [];
    for (const a of m.m || []) {
      let e = old.get(a[0]);
      const ty = MOBK[a[1]];
      if (!ty) continue;
      if (!e) { e = newMob(ty, 0, 0, { id: a[0] }); e.x = e.px = a[2]; e.y = e.py = a[3]; }
      e.ty = ty; e.w = MOB[ty].w; e.h = MOB[ty].h;
      e.tx = a[2]; e.ty2 = a[3]; e.f = a[4]; e.rot = a[5] / 100; e.dir = a[6]; e.hp = a[7]; e.hpMax = a[8]; e.flash = a[9] ? 6 : 0; e.ph = a[10]; e.fire = a[11] ? 100 : 0; e.iris = IRISK[a[12]]; e.seg = SEGK[a[13]]; e.st = a[14];
      list.push(e); old.delete(a[0]);
    }
    for (const a of m.i || []) {
      let e = old.get(a[0]);
      if (!e) e = { id: a[0], k: 'item', it: a[1], n: a[2], x: a[3], y: a[4], px: a[3], py: a[4], w: 12, h: 12, hp: 1, t: 0 };
      e.n = a[2]; e.tx = a[3]; e.ty2 = a[4];
      list.push(e); old.delete(a[0]);
    }
    for (const a of m.q || []) {
      let e = old.get(a[0]);
      if (!e) e = { id: a[0], k: 'proj', pt: a[1], x: a[2], y: a[3], px: a[2], py: a[3], w: 4, h: 4, hp: 1, t: 0 };
      e.tx = a[2]; e.ty2 = a[3]; e.rot = a[4] / 100; e.bolt = a[5]; e.am = a[5]; e.hostile = a[6]; e.fire = a[7];
      list.push(e); old.delete(a[0]);
    }
    for (const a of m.s || []) {
      let e = old.get(a[0]);
      if (!e) e = { id: a[0], k: 'fstar', x: a[1], y: a[2], px: a[1], py: a[2], w: 8, h: 8, hp: 1 };
      e.tx = a[1]; e.ty2 = a[2];
      list.push(e); old.delete(a[0]);
    }
    for (const e of old.values()) if (e.k === 'mob' && e.hp > 0) spawnBlood(e.x + e.w / 2, e.y + e.h / 2, '#b01818', 3, 1);
    G.ents = list;
    const seen = new Set();
    for (const a of m.p || []) {
      if (a[0] === G.me.id) continue;
      const nm = NET.names ? NET.names.get(a[0]) : null;
      const p = getRemote(a[0], nm || 'Player');
      seen.add(a[0]);
      p.tx = a[1]; p.ty = a[2]; p.dir = a[3]; p.fr = a[4]; p.swing = a[5]; p.swingMax = a[6] || 1; p.swingAng = a[7] / 100; p.swingStyle = STYK[a[8]]; p.swingIt = a[9] || null; p.heldId = a[10] || null;
      p.hp = a[11]; p.hpMax = a[12]; p.dead = !!a[13]; p.eq = [a[14], a[15], a[16]]; p.vx = a[17];
      if (Math.hypot(p.tx - p.x, p.ty - p.y) > 200) { p.x = p.px = p.tx; p.y = p.py = p.ty; }
    }
    for (const id of [...G.players.keys()]) if (id !== G.me.id && !seen.has(id) && NET.role === 'guest') G.players.delete(id);
    const nold = new Map();
    for (const n of G.npcs) nold.set(n.id, n);
    const nl = [];
    for (const a of m.n || []) {
      let n = nold.get(a[0]);
      if (!n) { n = newNpc(a[1], a[3] + 10, a[4] + 42, { id: a[0], name: a[2] }); n.x = n.px = a[3]; n.y = n.py = a[4]; }
      n.tx = a[3]; n.ty2 = a[4]; n.dir = a[5]; n.fr = a[6]; n.hp = a[7]; n.hpMax = a[8];
      nl.push(n);
    }
    G.npcs = nl;
  }
  function stepGuestSmooth() {
    for (const e of G.ents) {
      e.px = e.x; e.py = e.y;
      const dx = e.tx - e.x, dy = e.ty2 - e.y;
      if (Math.abs(dx) > 240 || Math.abs(dy) > 240) { e.x = e.tx; e.y = e.ty2; } else { e.x += dx * 0.45; e.y += dy * 0.45; }
      e.t = (e.t || 0) + 1;
    }
    for (const n of G.npcs) { n.px = n.x; n.py = n.y; if (n.tx !== undefined) { n.x += (n.tx - n.x) * 0.4; n.y += (n.ty2 - n.y) * 0.4; } }
    for (const p of G.players.values()) if (p !== G.me) { p.px = p.x; p.py = p.y; p.x += (p.tx - p.x) * 0.45; p.y += (p.ty - p.y) * 0.45; if (p.swing > 0) p.swing--; }
  }
  function stepRemotes() {
    for (const p of G.players.values()) {
      if (!p.remote) continue;
      p.px = p.x; p.py = p.y;
      p.x += (p.tx - p.x) * 0.5; p.y += (p.ty - p.y) * 0.5;
      if (p.iv > 0) p.iv--;
      if (p.swing > 0) p.swing--;
      p.inv.fill(null); p.ammo.fill(null); p.coins = 0;
    }
  }
  function applyTd(c) {
    for (const a of c) {
      const i = a[0];
      if (i < 0 || i >= W.t.length) continue;
      W.t[i] = a[1]; W.wl[i] = a[2]; W.fr[i] = a[3]; W.lq[i] = a[4]; W.fl[i] = a[5];
      const x = i % W.w, y = (i / W.w) | 0;
      dirtyTile(x, y); recomputeTop(x);
    }
  }
  function netHostTick() {
    const online = G.players.size > 1;
    if (tileDiff.length) {
      if (online) {
        const seen = new Set(), c = [];
        for (const i of tileDiff) { if (seen.has(i)) continue; seen.add(i); c.push([i, W.t[i], W.wl[i], W.fr[i], W.lq[i], W.fl[i]]); }
        for (let k = 0; k < c.length; k += 500) sendNet({ t: 'td', c: c.slice(k, k + 500) });
      }
      tileDiff.length = 0;
    }
    if (liqDiff.size && G.tick % 3 === 0) {
      if (online) { const c = []; for (const i of liqDiff) { if (c.length > 900) break; c.push([i, W.lq[i], W.fl[i]]); } sendNet({ t: 'ld', c }); }
      liqDiff.clear();
    }
    if (online) {
      if (G.tick % 3 === 0) sendNet(buildSnap(), true);
      netStream();
      flushSnd();
    }
  }
  function guestStateMsg() {
    const p = G.me;
    return { t: 'ps', x: r1(p.x), y: r1(p.y), vx: r1(p.vx), vy: r1(p.vy), dir: p.dir, fr: p.fr, gnd: p.gnd ? 1 : 0, sel: p.sel, hp: Math.ceil(p.hp), hpMax: p.hpMax, dead: p.dead ? 1 : 0, held: p.inv[p.sel] ? p.inv[p.sel].id : null, eq: [0, 1, 2].map(i => p.armor[i] ? p.armor[i].id : null) };
  }
  function applyPS(p, m) {
    if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) return;
    p.tx = m.x; p.ty = m.y; p.vx = +m.vx || 0; p.vy = +m.vy || 0; p.dir = m.dir < 0 ? -1 : 1; p.fr = clamp(m.fr | 0, 0, 9); p.gnd = !!m.gnd; p.sel = clamp(m.sel | 0, 0, 9);
    p.hp = clamp(+m.hp || 1, 0, 1000); p.hpMax = clamp(+m.hpMax || 100, 20, 400); p.dead = !!m.dead;
    p.heldId = IT[m.held] ? m.held : null;
    p.eq = (Array.isArray(m.eq) ? m.eq : []).slice(0, 3).map(x => IT[x] ? x : null);
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 300) { p.x = p.tx; p.y = p.ty; }
  }
  function hostData(m, from) {
    const p = G.players.get(from);
    switch (m.t) {
      case 'hello': {
        const name = String(m.name || 'Player').replace(/[<>&"']/g, '').slice(0, 16) || 'Player';
        const look = m.look || {};
        const ex = G.players.get(from);
        if (ex) G.players.delete(from);
        const q = getRemote(from, name, { sk: look.sk | 0, hs: look.hs | 0, hc: look.hc | 0, sh: look.sh | 0, pn: look.pn | 0, ey: look.ey | 0 });
        q.name = name; q.ch.name = name;
        NET.names.set(from, name);
        placePlayerAtSpawn(q); q.tx = q.x; q.ty = q.y;
        if (!ex) bmsg(name + ' joined the game.', '#a0ffa0');
        sendNet({ t: 'pj', pid: from, name, look: lookOf(q.ch) });
        startStream(from);
        return;
      }
      case 'ps': if (p) applyPS(p, m); return;
      case 'act': {
        if (!p || !m.it || !IT[m.it]) return;
        const act = { a: m.a, it: m.it, ax: +m.ax || 0, ay: +m.ay || 0, tx: m.tx | 0, ty: m.ty | 0, sel: m.sel | 0, am: m.am, kind: m.kind };
        if (!['mine', 'place', 'shoot', 'swing', 'summon'].includes(act.a)) return;
        p.in.ax = act.ax; p.in.ay = act.ay;
        applyAct(p, act);
        return;
      }
      case 'door': if (p && Math.abs(pcx(p) - m.x * 16) < 160 && Math.abs(pcy(p) - m.y * 16) < 160) toggleDoor(m.x | 0, m.y | 0); return;
      case 'toss': if (p && IT[m.it] && m.n > 0) { const d = m.dir < 0 ? -1 : 1, e = spawnItem(pcx(p) + d * 18, p.y + 10, m.it, Math.min(999, m.n | 0), d * 2.2, -2.2); if (e) e.pd = 80; } return;
      case 'cget': {
        const k = m.k | 0;
        if (!p || gt(k % W.w, (k / W.w) | 0) !== T.CHEST) return;
        let c = W.chests.get(k);
        if (!c) { c = { x: k % W.w, y: (k / W.w) | 0, items: new Array(40).fill(null) }; W.chests.set(k, c); }
        chestView(k, from, true);
        sendTo(from, { t: 'cdat', k, items: c.items.map(s => s ? [s.id, s.n] : 0) });
        return;
      }
      case 'cset': {
        const k = m.k | 0, c = W.chests.get(k), i = m.i | 0;
        if (!c || i < 0 || i > 39) return;
        c.items[i] = sanStack(m.s);
        chestNotify(k, i, from);
        return;
      }
      case 'cclose': chestView(m.k | 0, from, false); return;
      case 'died': if (typeof m.s === 'string') bmsg(m.s.slice(0, 120), '#ff6060'); return;
    }
  }
  function guestData(m) {
    switch (m.t) {
      case 'init': guestInit(m); return;
      case 'rg': if (G && W && !NET.loaded && m.sid === NET.gsid) { applyRegion(m); NET.prog = NET.rgGot / Math.max(1, NET.rgN); if (NET.rgGot >= NET.rgN) guestLoaded(); } return;
      case 'rgdone': if (G && W && !NET.loaded && m.sid === NET.gsid && NET.rgGot >= NET.rgN) guestLoaded(); return;
      case 'pj': if (m.pid !== NET.me) { NET.names.set(m.pid, m.name); if (G) { const p = getRemote(m.pid, m.name, m.look); p.name = m.name; } } return;
      case 'es': if (G && NET.loaded) applySnap(m); return;
      case 'td': if (G && W && NET.loaded && Array.isArray(m.c)) applyTd(m.c); return;
      case 'ld': if (G && W && NET.loaded && Array.isArray(m.c)) for (const a of m.c) { if (a[0] >= 0 && a[0] < W.lq.length) { W.lq[a[0]] = a[1]; W.fl[a[0]] = a[2]; } } return;
      case 'give': if (G && G.me && IT[m.it]) { giveOrDropMe(m.it, Math.max(1, m.n | 0)); onPickupLocal(m.it, m.n | 0); } return;
      case 'hurt': if (G && G.me && !G.me.dead && Number.isFinite(m.d)) { damagePlayerLocal(G.me, clamp(m.d, 1, 400), +m.kx || 0, +m.ky || 0, 'mob', false, String(m.by || 'a monster')); } return;
      case 'msg': if (G) addMsg(String(m.s || '').slice(0, 140), m.c); return;
      case 'ban': if (G) G.banner = { s: String(m.s || '').slice(0, 80), c: m.c || '#fff', t: 220 }; return;
      case 'fx': if (G && m.k === 'dmg') addText(m.x, m.y, String(m.v), m.c ? '#ffa040' : '#ffe8d0', !!m.c); return;
      case 'snd': if (Array.isArray(m.s)) for (const s of m.s.slice(0, 12)) playSnd(s[0], s[1], s[2]); return;
      case 'cdat': if (UI.chest && UI.chest.k === m.k && Array.isArray(m.items)) { UI.chestItems.length = 0; for (let i = 0; i < 40; i++) UI.chestItems.push(m.items[i] ? sanStack({ id: m.items[i][0], n: m.items[i][1] }) : null); } return;
      case 'c1': if (UI.chest && UI.chest.k === m.k && UI.chestItems && m.i >= 0 && m.i < 40) UI.chestItems[m.i] = m.s ? sanStack({ id: m.s[0], n: m.s[1] }) : null; return;
    }
  }
  function bindNet() {
    if (NET.bound || !api.net) return;
    NET.bound = true;
    api.net.on('data', (m, from) => {
      if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
      try { if (NET.role === 'host' && G) hostData(m, from); else if (NET.role === 'host') { if (m.t === 'hello') NET.early.push([m, from]); } else if (NET.role === 'guest') guestData(m, from); } catch (e) { if (window.console) console.warn(e); }
    });
    api.net.on('leave', p => {
      if (NET.role !== 'host' || !G || !p) return;
      const q = G.players.get(p.id);
      if (q) { G.players.delete(p.id); bmsg(q.name + ' left the game.', '#ffff80'); sendNet({ t: 'pl', pid: p.id }); }
      for (const s of NET.viewers.values()) s.delete(p.id);
      NET.streams.delete(p.id);
    });
    api.net.on('rejoin', p => { if (NET.role === 'host' && G && p && G.players.get(p.id)) startStream(p.id); });
    api.net.on('close', r => {
      if (NET.role === 'guest') { NET.role = null; NET.discMsg = r === 'kicked' ? 'You were kicked from the game.' : r === 'lost' ? 'Connection lost.' : 'The host closed the game.'; leaveToTitle('disc'); }
      else if (NET.role === 'host') { NET.role = null; if (G) G.net = null; }
    });
    api.net.on('lobby', () => { if (NET.role === 'guest') roomAgain(); });
  }
  const roomOpts = () => ({ title: 'Terraria', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, name: NET.ch ? NET.ch.name : 'Player' });
  function roomAgain() {
    paused = true;
    api.net.room(roomOpts()).then(r => { paused = false; if (!r) { leaveToTitle(); return; } onRoom(r, null); });
  }
  function onRoom(r, hostStart) {
    NET.me = r.id;
    if (r.role === 'host') { NET.role = 'host'; NET.hostId = r.id; if (hostStart) hostStart(); else if (G) G.net = NET; }
    else {
      NET.role = 'guest'; const h = (r.players || []).find(p => p.host); NET.hostId = h ? h.id : null;
      if (G && G.me && G.me.id !== NET.me) { G.players.delete(G.me.id); G.me.id = NET.me; G.players.set(NET.me, G.me); }
      NET.loaded = false; NET.prog = 0; showMenu('join');
      sendNet({ t: 'hello', name: NET.ch.name, look: lookOf(NET.ch) });
    }
  }
  function guestInit(m) {
    const w = m.w || {};
    if (!(w.w > 100 && w.h > 100 && w.w <= 5000 && w.h <= 1300)) return;
    const ch = NET.ch;
    resetState();
    W = newWorld(w.w, w.h, String(w.name || 'World'), w.seed | 0, w.size);
    Object.assign(W, { id: String(w.id), tod: w.tod, day: !!w.day, days: w.days | 0, moon: w.moon | 0, spawnX: w.spawnX, spawnY: w.spawnY, surfBase: w.surfBase, rockY: w.rockY, hellY: w.hellY, spaceY: w.spaceY, created: w.created });
    Object.assign(W.flags, w.flags || {});
    W.surf = Int16Array.from(new Int16Array(b64d(m.surf).buffer.slice(0))); W.bio = b64d(m.bio);
    NET.gsid = m.sid; NET.rgGot = 0; NET.rgN = m.rn | 0; NET.rw = m.rw | 0; NET.loaded = false; NET.prog = 0;
    makeGame(W, ch, NET);
    G.isGuestWorld = true;
    NET.names.clear();
    for (const o of m.pl || []) if (o.pid !== NET.me) { NET.names.set(o.pid, o.name); const p = getRemote(o.pid, o.name, o.look); p.name = o.name; }
    showMenu('join');
  }
  function guestLoaded() {
    NET.loaded = true;
    for (let x = 0; x < W.w; x++) recomputeTop(x);
    clearChunks();
    const p = G.me;
    p.spawn = (p.ch.spawns || {})[W.id] || null;
    placePlayerAtSpawn(p);
    G.camSnap = true;
    enterPlay();
  }
  function leaveOnline() {
    if (NET.role) { try { api.net.close(); } catch (e) { } }
    NET.role = null; NET.streams.clear(); NET.viewers.clear(); NET.loaded = false;
    if (G) G.net = null;
  }
  let SCENE = 'title', paused = false, rootEl = null, wrapEl = null, wcv = null, wg = null, hcv = null, hg = null;
  let fgCv = null, fgG = null, litCv = null, litG = null, resizeObs = null;
  let BW = 480, BH = 300, dprN = 1, zsDev = 2, accT = 0, lastNow = 0, tmr = 0, alive = false, camFX = 0, camFY = 0, camX = 0, camY = 0;
  let titleT = 0, errCount = 0, quitting = false;
  const fps = { n: 0, t: 0, v: 60, worst: 60 };
  const STEPS = 1 / TPS;
  const GEMCOL = { amethyst: '#c060ff', topaz: '#ffc030', sapphire: '#4a8cff', emerald: '#40e070', ruby: '#ff4050', diamond: '#e0f8ff', spark: '#ffd040', thorn: '#7ad040' };

  function resetState() {
    chunks.clear(); tileHits.clear(); liqActive.clear(); fallQ.length = 0; tileDiff.length = 0; liqDiff.clear();
    parts.length = 0; texts.length = 0; projs.length = 0; nextId = 1; MM.cv = null; MM.g = null; MM.seen = null;
    NET.streams.clear(); NET.viewers.clear();
    UI.open = false; UI.held = null; UI.chest = null; UI.chestItems = null; UI.shop = false; UI.talk = null; UI.map = false; UI.recSel = -1; UI.recScroll = 0; UI.helpOpen = false; UI.trash = [null];
  }
  function mkNpcFrom(o) {
    const ty = o.ty || o.k;
    if (!NPCDEF[ty]) return null;
    const n = newNpc(ty, o.x + 10, o.y + 42, o.name ? { name: o.name, home: o.home || null } : { home: o.home || null });
    if (o.hp) n.hp = o.hp;
    return n;
  }
  function mmRestore(b64) {
    try {
      const a = rleDec(b64d(b64), W.w * W.h);
      MM.seen.set(a);
      const img = MM.g.createImageData(W.w, 1);
      for (let y = 0; y < W.h; y++) {
        let any = false;
        const d = img.data;
        d.fill(0);
        for (let x = 0; x < W.w; x++) {
          if (!MM.seen[y * W.w + x]) continue;
          const c = mmColor(x, y), j = x * 4;
          d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255; any = true;
        }
        if (any) MM.g.putImageData(img, 0, y);
      }
    } catch (e) { }
  }
  function makeGame(Wd, ch, net) {
    W = Wd;
    const id = net ? NET.me : 'me';
    const me = mkPlayer(id, ch.name, ch);
    me.spawn = (ch.spawns && ch.spawns[W.id]) || null;
    G = {
      tick: 0, me, players: new Map([[id, me]]), ents: [], npcs: [], net: net || null, msgs: [], pickLog: [], shake: 0, camSnap: true, banner: null, kills: 0, noFx: false,
      viewTiles: [Math.ceil(BW / 16), Math.ceil(BH / 16)], tipN: 0, houses: [], alpha: 0, tmr: 0, surfS: 0, pendingEoW: 0, sessT: Date.now(), lastSave: 0, isGuestWorld: false, scoreT: 0
    };
    for (const o of Wd.npcs || []) { const n = mkNpcFrom(o); if (n) G.npcs.push(n); }
    Wd.npcs = [];
    if (Wd.saplingsInit && Wd.saplingsInit.length) Wd.saplings = new Map(Wd.saplingsInit.map(([k, v]) => [k, v + G.tick]));
    mmInit();
    if (ch.maps && ch.maps[W.id]) mmRestore(ch.maps[W.id]);
    if (!net || net.role === 'host') placePlayerAtSpawn(me);
    G.surfS = W.surf[clamp(Math.floor(me.x / 16), 0, W.w - 1)] * 16;
    refreshRecipes();
    return G;
  }
  function enterPlay() {
    SCENE = 'play'; paused = false; accT = 0; lastNow = now();
    showMenu(null);
    audioInit();
    if (G && G.me) { setLast({ ch: G.me.ch.id, w: W.id }); G.sessT = Date.now(); addMsg('Welcome to ' + W.name + '.', '#a0e0ff'); }
    inputReset();
    resize();
    camFX = G.me.x + 10 - BW / 2; camFY = G.me.y + 21 - BH / 2; G.camSnap = true;
  }
  function startSolo(ch, Wd) {
    resetState();
    NET.role = null; NET.me = null;
    makeGame(Wd, ch, null);
    enterPlay();
  }
  function startHost(ch, Wd, roomR) {
    resetState();
    NET.ch = ch; NET.role = 'host'; NET.me = roomR.id; NET.hostId = roomR.id; NET.names.clear();
    makeGame(Wd, ch, NET);
    for (const p of roomR.players || []) if (p.id !== roomR.id) NET.names.set(p.id, p.name);
    try { sessionStorage.setItem('gameplay:terraria:host', JSON.stringify({ code: roomR.code || (api.net.code), wid: Wd.id, cid: ch.id })); } catch (e) { }
    enterPlay();
    const ea = NET.early.splice(0);
    for (const [m, from] of ea) hostData(m, from);
    addMsg('Party code ' + (api.net.code || '') + '. Friends join from the lobby.', '#ffe080');
  }

  function stepTime() {
    W.tod++;
    const len = W.day ? DAYLEN : NIGHTLEN;
    if (W.tod >= len) {
      W.tod = 0; W.day = !W.day;
      if (W.day) { W.days++; W.moon = (W.moon + 1) & 7; playSnd('dawn'); if (AUTH()) bmsg('Day ' + (W.days + 1) + ' begins.', '#ffe9a0'); }
      else { playSnd('dusk'); if (AUTH()) bmsg('Night falls.', '#a0b0ff'); }
    }
  }
  function lightSources() {
    const dyn = [];
    const add = (x, y, c, k) => dyn.push([x, y, c[0] * k, c[1] * k, c[2] * k]);
    for (const p of G.players.values()) {
      if (p.dead) continue;
      add(pcx(p), p.y + 14, [0.62, 0.66, 0.8], 0.4);
      const held = p === G.me ? (p.inv[p.sel] && p.inv[p.sel].id) : p.heldId;
      if (held === 'torch') add(pcx(p) + p.dir * 6, p.y + 12, [1, 0.8, 0.45], 1);
      if (p.st.light) add(pcx(p), p.y + 6, Array.isArray(p.st.light) ? p.st.light : [1, 0.9, 0.6], 1);
      else if (p.remote && p.eq && p.eq[0] === 'miningHelmet') add(pcx(p), p.y + 6, [1, 0.92, 0.6], 1);
      if (p.fire > 0) add(pcx(p), pcy(p), [1, 0.5, 0.15], 0.8);
    }
    for (const e of G.ents) {
      if (e.k === 'mob') { const L = MOB[e.ty] && MOB[e.ty].light; if (L && e.hp > 0) add(e.x + e.w / 2, e.y + e.h / 2, L, 1); }
      else if (e.k === 'proj') { if (e.fire || e.pt === 'fire') add(e.x, e.y, [1, 0.5, 0.15], 0.9); else if (e.pt === 'bolt') { const c = hex(GEMCOL[e.bolt] || '#c060ff'); add(e.x, e.y, [c[0] / 255, c[1] / 255, c[2] / 255], 0.85); } }
      else if (e.k === 'fstar') add(e.x, e.y, [1, 0.9, 0.5], 1);
      else if (e.k === 'item' && e.it === 'fallenStar') add(e.x, e.y, [1, 0.9, 0.5], 0.8);
    }
    return dyn;
  }

  function simTick() {
    const me = G.me, host = AUTH();
    G.tick++;
    inputTick(me);
    stepPlayerPhys(me);
    stepPlayerVitals(me);
    if (me.in.use && !paused) tryUse(me);
    if (me.useT > 0) me.useT--;
    if (me.swing > 0) me.swing--;
    if (G.shake > 0.05) G.shake *= 0.9; else G.shake = 0;
    stepTime();
    if (host) {
      for (const p of G.players.values()) { if (p !== me) { p.px = p.x; p.py = p.y; } swingHitTest(p); }
      stepSpawner();
      stepEnts();
      stepRemotes();
      stepNpcs();
      stepLiquids();
      stepFalling();
      tickSaplings();
      decayHits();
      if (G.tick % 600 === 300) npcArrivals();
      if (G.pendingEoW > 0 && --G.pendingEoW === 0) {
        const t = [...G.players.values()].find(q => !q.dead) || me;
        spawnBoss('eow', t);
      }
      netHostTick();
    } else {
      stepGuestSmooth();
      if (G.tick % 2 === 0) sendNet(guestStateMsg(), true);
      if (me.dead && !me.sentDead) { me.sentDead = true; sendNet({ t: 'died', s: me.name + ' ' + me.why + '.' }); }
      if (!me.dead) me.sentDead = false;
    }
    stepParts();
    for (let i = G.msgs.length - 1; i >= 0; i--) if (--G.msgs[i].t <= 0) G.msgs.splice(i, 1);
    for (let i = G.pickLog.length - 1; i >= 0; i--) if (--G.pickLog[i].t <= 0) G.pickLog.splice(i, 1);
    if (G.banner && --G.banner.t <= 0) G.banner = null;
    if (UI.talk && G.npcs.indexOf(UI.talk) < 0 && UI.talk.dead) closePanels();
    if (G.tick % 60 === 0) {
      const sc = (me.ch.kills | 0) * 5 + W.days * 20 + (W.flags.kingSlime ? 500 : 0) + (W.flags.eoc ? 500 : 0) + (W.flags.eow ? 500 : 0);
      if (sc !== G.score) { G.score = sc; api.score(sc); }
    }
    if (host && !G.isGuestWorld && G.tick % (G.players.size > 1 ? 1200 : 3600) === 0) saveSoon();
    else if (!host && G.tick % 3600 === 0) saveSoon();
  }

  function resize() {
    if (!wrapEl || !wcv) return;
    const cssW = Math.max(240, wrapEl.clientWidth), cssH = Math.max(240, wrapEl.clientHeight);
    dprN = Math.min(2, window.devicePixelRatio || 1);
    const devW = Math.round(cssW * dprN), devH = Math.round(cssH * dprN);
    const tcss = clamp(cssW / 36, 17, 40);
    zsDev = Math.max(1, Math.round(tcss * dprN / 16));
    BW = Math.ceil(devW / zsDev); BH = Math.ceil(devH / zsDev);
    if (wcv.width !== BW || wcv.height !== BH) {
      wcv.width = BW; wcv.height = BH; fgCv.width = BW; fgCv.height = BH; litCv.width = BW; litCv.height = BH;
      wg.imageSmoothingEnabled = false; fgG.imageSmoothingEnabled = false;
    }
    wcv.style.width = (BW * zsDev / dprN) + 'px'; wcv.style.height = (BH * zsDev / dprN) + 'px';
    if (hcv.width !== devW || hcv.height !== devH) { hcv.width = devW; hcv.height = devH; }
    hg.setTransform(dprN, 0, 0, dprN, 0, 0);
    UI.w = cssW; UI.h = cssH; UI.dpr = dprN; UI.zs = zsDev / dprN;
    if (G) G.viewTiles = [Math.ceil(BW / 16), Math.ceil(BH / 16)];
  }

  function spr(g, img, x, y, flip) {
    if (!flip) { g.drawImage(img, Math.round(x), Math.round(y)); return; }
    g.save(); g.translate(Math.round(x + img.width), Math.round(y)); g.scale(-1, 1); g.drawImage(img, 0, 0); g.restore();
  }
  function sprRot(g, img, cx, cy, rot, flipY) {
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(rot);
    if (flipY) g.scale(1, -1);
    g.drawImage(img, -(img.width >> 1), -(img.height >> 1));
    g.restore();
  }
  function withFlash(g, fl, fn) {
    fn();
    if (fl > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.55; fn(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }
  function holdOf(p) {
    const id = p === G.me ? (p.inv[p.sel] && p.inv[p.sel].id) : p.heldId;
    const it_ = id && IT[id];
    if (!it_) return null;
    const sw = p.swing > 0 && p.swingIt === id;
    const t = it_.t;
    const tool = t === 'weapon' || t === 'tool';
    if (!sw && !tool) return null;
    const prog = sw ? 1 - p.swing / Math.max(1, p.swingMax) : 0;
    return { id, it: it_, sw, prog, style: sw ? p.swingStyle : 'idle', ang: p.swingAng };
  }
  function drawChar(g, look, eq, fr, dir, x, y, kind, hold, p) {
    const flip = dir < 0;
    if (!hold) { spr(g, charImg(look, eq, fr, false, kind), x - 10, y - 8, flip); return; }
    const body = charImg(look, eq, fr, true, kind), arm = armImg(look, eq, kind);
    g.save();
    g.translate(Math.round(x + 10), Math.round(y - 8));
    if (flip) g.scale(-1, 1);
    g.drawImage(body, -20, 0);
    const w2l = a => flip ? Math.PI - a : a;
    let al, extra = 0, off = 0, sc = 1, mode = 'dia';
    const bob = fr > 0 && fr < 9 ? Math.sin(fr * 0.8 + (p ? p.frT : 0) * 3) * 0.28 : 0;
    const it_ = hold.it;
    if (hold.style === 'swing') { al = w2l(swingAngle(dir, hold.prog)); }
    else if (hold.style === 'stab') { al = w2l(hold.ang); off = Math.sin(hold.prog * Math.PI) * 9; }
    else if (hold.style === 'aim') { al = w2l(hold.ang); if (it_.style === 'bow') mode = 'bow'; }
    else if (hold.style === 'use') { al = -0.9 + Math.sin(hold.prog * Math.PI) * 0.5; mode = 'small'; sc = 0.7; }
    else { al = 1.2 + bob; extra = -1.5; }
    if (it_.big && hold.style === 'swing') sc = 1.25;
    if (hold.style === 'idle' && it_.big) sc = 1.15;
    g.translate(0, 24.5);
    g.rotate(al);
    g.drawImage(arm, -3, -6);
    g.translate(11.5 + off, 0);
    const ic = iconOf(hold.id);
    if (mode === 'bow') g.drawImage(ic, -15, -12);
    else if (mode === 'small') { g.rotate(-al + 0); g.scale(sc, sc); g.drawImage(ic, -ic.width / 2, -ic.height / 2 - 2); }
    else { g.rotate(Math.PI / 4 + extra); g.scale(sc, sc); g.drawImage(ic, -5, -22); }
    g.restore();
  }
  function drawPlayerEnt(g, p, a) {
    if (p.dead) return;
    const x = Math.round(lerp(p.px, p.x, a)), y = Math.round(lerp(p.py, p.y, a));
    const eq = p === G.me ? [p.armor[0] && p.armor[0].id, p.armor[1] && p.armor[1].id, p.armor[2] && p.armor[2].id] : (p.eq || NOEQ);
    if (p.iv > 0 && (G.tick >> 2 & 1)) g.globalAlpha = 0.5;
    if (p.mirror > 0) g.globalAlpha = 0.4 + 0.3 * Math.sin(G.tick * 0.5);
    drawChar(g, p.look, eq, p.fr | 0, p.dir, x, y, undefined, holdOf(p), p);
    g.globalAlpha = 1;
  }
  function drawNpcEnt(g, n, a) {
    const x = Math.round(lerp(n.px, n.x, a)), y = Math.round(lerp(n.py, n.y, a));
    withFlash(g, n.flash, () => drawChar(g, LOOKS[n.ty], NOEQ, n.fr | 0, n.dir, x, y, n.ty, null, null));
  }
  function drawMob(g, e, a) {
    const m = MOB[e.ty];
    if (!m || e.hp <= 0) return;
    const ix = lerp(e.px === undefined ? e.x : e.px, e.x, a), iy = lerp(e.py === undefined ? e.y : e.py, e.y, a);
    const cx = ix + e.w / 2, cy = iy + e.h / 2, fl = e.flash, dir = e.dir || 1, f = e.f | 0;
    switch (m.ai) {
      case 'slime': { const im = slimeFrame(m.sl, clamp(f, 0, 2)); withFlash(g, fl, () => g.drawImage(im, Math.round(cx - im.width / 2), Math.round(iy + e.h - im.height + 1))); break; }
      case 'king': { const im = kingFrame(clamp(f, 0, 2)); withFlash(g, fl, () => g.drawImage(im, Math.round(cx - im.width / 2), Math.round(iy + e.h - im.height + 2))); if (e.ph !== 2 || true) { const c = iconOf('slimeCrown'); g.drawImage(c, Math.round(cx - c.width / 2), Math.round(iy - 6 + (f === 0 ? 4 : 0))); } break; }
      case 'walk': withFlash(g, fl, () => drawChar(g, LOOKS[m.look], NOEQ, f, dir, Math.round(ix), Math.round(iy), m.look, null, null)); break;
      case 'eye': { const im = eyeFrame(e.iris || 'blue', f & 1); withFlash(g, fl, () => sprRot(g, im, cx, cy, e.rot, Math.cos(e.rot) < 0)); break; }
      case 'bat': { const im = batFrame(f % 3, m.bat); withFlash(g, fl, () => spr(g, im, cx - im.width / 2, cy - im.height / 2, dir < 0)); break; }
      case 'eater': { const im = eaterFrame(f & 1); withFlash(g, fl, () => sprRot(g, im, cx, cy, e.rot, Math.cos(e.rot) < 0)); break; }
      case 'imp': { const im = impFrame(f & 1); withFlash(g, fl, () => spr(g, im, cx - im.width / 2, cy - im.height / 2, dir < 0)); break; }
      case 'servant': { const im = servFrame(f & 1); withFlash(g, fl, () => sprRot(g, im, cx, cy, e.rot, Math.cos(e.rot) < 0)); break; }
      case 'eoc': { const im = eocFrame(e.ph === 2 ? 2 : 1, f & 1); withFlash(g, fl, () => sprRot(g, im, cx, cy, e.rot, false)); break; }
      case 'worm': {
        const part = e.seg || m.seg || 'body', im = wormImg(m.wk, part, m.sz);
        withFlash(g, fl, () => sprRot(g, im, cx, cy, e.rot, false));
        break;
      }
    }
  }
  function drawItemEnt(g, e, a) {
    const ic = iconOf(e.it), ix = lerp(e.px === undefined ? e.x : e.px, e.x, a), iy = lerp(e.py === undefined ? e.y : e.py, e.y, a);
    const k = Math.min(0.75, 15 / Math.max(ic.width, ic.height)), bob = Math.sin((e.t || 0) * 0.08 + e.id) * 1.2;
    g.save(); g.translate(Math.round(ix + 6), Math.round(iy + 6 + bob)); g.scale(k, k); g.drawImage(ic, -ic.width / 2, -ic.height / 2); g.restore();
    if (e.it === 'fallenStar') { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,230,120,0.25)'; g.beginPath(); g.arc(ix + 6, iy + 6 + bob, 8, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
  }
  function drawProj(g, q, a) {
    const x = lerp(q.px === undefined ? q.x : q.px, q.x, a), y = lerp(q.py === undefined ? q.y : q.py, q.y, a), r = q.rot || 0;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(r);
    if (q.pt === 'arrow') {
      g.fillStyle = '#6a4a2a'; g.fillRect(-9, -1, 14, 2);
      g.fillStyle = q.am === 'unholyArrow' ? '#a070d0' : q.fire ? '#ff8030' : '#c8c8d0'; g.fillRect(4, -2, 4, 4);
      g.fillStyle = '#e8e8e8'; g.fillRect(-10, -2, 3, 1); g.fillRect(-10, 1, 3, 1);
      if (q.fire) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,140,40,0.5)'; g.beginPath(); g.arc(6, 0, 5, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    } else if (q.pt === 'bolt') {
      const c = GEMCOL[q.bolt] || '#c060ff';
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = c; g.globalAlpha = 0.35; g.fillRect(-12, -2, 10, 4);
      g.globalAlpha = 0.5; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      g.fillStyle = c; g.fillRect(-3, -3, 6, 6); g.fillStyle = '#fff'; g.fillRect(-1, -1, 3, 3);
    } else if (q.pt === 'thorn') {
      g.fillStyle = '#4a9a30'; g.fillRect(-14, -2, 20, 4); g.fillStyle = '#8a3ec8'; g.fillRect(2, -3, 6, 6); g.fillStyle = '#b8f070'; g.fillRect(-10, -1, 8, 1);
    } else {
      g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,100,20,0.5)'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
      g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ff9a30'; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.fillStyle = '#ffe080'; g.beginPath(); g.arc(1, 0, 2.5, 0, 7); g.fill();
    }
    g.restore();
  }
  function drawStar(g, e, a) {
    const x = lerp(e.px === undefined ? e.x : e.px, e.x, a), y = lerp(e.py === undefined ? e.y : e.py, e.y, a);
    g.globalCompositeOperation = 'lighter';
    for (let i = 1; i < 8; i++) { g.fillStyle = 'rgba(255,220,100,' + (0.35 - i * 0.04) + ')'; g.fillRect(Math.round(x - 3 * i * 1.0 - 2), Math.round(y - 4 * i * 1.2 - 2), 4, 4); }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#ffe070'; g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(G.tick * 0.1);
    g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i & 1 ? 3 : 7, an = i * Math.PI / 5; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.fill(); g.restore();
  }
  function drawEntities(g, a) {
    for (const n of G.npcs) drawNpcEnt(g, n, a);
    for (const e of G.ents) if (e.k === 'mob' && !e.dead) drawMob(g, e, a);
    for (const e of G.ents) if (e.k === 'item') drawItemEnt(g, e, a);
    for (const e of G.ents) { if (e.k === 'proj') drawProj(g, e, a); else if (e.k === 'fstar') drawStar(g, e, a); }
    for (const p of G.players.values()) if (p !== G.me) drawPlayerEnt(g, p, a);
    drawPlayerEnt(g, G.me, a);
  }
  function drawCracks(g) {
    for (const h of tileHits.values()) {
      if (h.x === undefined) continue;
      const tt = gt(h.x, h.y), d = TD[tt];
      if (!d || !d.hp) continue;
      const st = Math.min(3, Math.floor(h.d / d.hp * 4));
      if (st < 0) continue;
      const px = h.x * 16 - camX, py = h.y * 16 - camY;
      if (px < -16 || py < -16 || px > BW || py > BH) continue;
      g.strokeStyle = 'rgba(0,0,0,0.65)'; g.lineWidth = 1; g.beginPath();
      for (let i = 0; i <= st; i++) {
        const r1 = hash2(h.x, h.y, i * 7 + 1), r2 = hash2(h.x, h.y, i * 7 + 2), r3 = hash2(h.x, h.y, i * 7 + 3);
        g.moveTo(px + 8, py + 8);
        g.lineTo(px + 8 + (r1 - 0.5) * 16, py + 8 + (r2 - 0.5) * 16);
        g.lineTo(px + 8 + (r1 - 0.5) * 20 + (r3 - 0.5) * 5, py + 8 + (r2 - 0.5) * 20);
      }
      g.stroke();
    }
  }
  function drawTileCursor(g) {
    if (UI.touch || !UI.mouse || UI.mx < 0 || UI.hover || UI.map) return;
    const ax = UI.camX + UI.mx / UI.zs, ay = UI.camY + UI.my / UI.zs, tx = Math.floor(ax / 16), ty = Math.floor(ay / 16);
    const p = G.me;
    if (p.dead || !selItem(p)) return;
    const t = selItem(p).t;
    if (t !== 'tool' && t !== 'block' && t !== 'wall') return;
    const ok = inReach(p, tx, ty);
    g.strokeStyle = ok ? 'rgba(255,255,255,0.85)' : 'rgba(255,90,90,0.55)'; g.lineWidth = 1;
    g.strokeRect(tx * 16 - camX + 0.5, ty * 16 - camY + 0.5, 15, 15);
  }

  function renderPlay(dt) {
    const me = G.me, a = G.alpha;
    const tx = lerp(me.px, me.x, a) + me.w / 2, ty = lerp(me.py, me.y, a) + me.h / 2;
    const gx = tx - BW / 2, gy = ty - BH / 2;
    if (G.camSnap) { camFX = gx; camFY = gy; G.camSnap = false; }
    else { const k = 1 - Math.exp(-dt * 10); camFX += (gx - camFX) * k; camFY += (gy - camFY) * k; }
    let sx = 0, sy = 0;
    if (G.shake > 0) { sx = (Math.random() - 0.5) * G.shake; sy = (Math.random() - 0.5) * G.shake; }
    camX = Math.round(clamp(camFX + sx, 0, Math.max(0, W.w * 16 - BW))); camY = Math.round(clamp(camFY + sy, 0, Math.max(0, W.h * 16 - BH)));
    UI.camX = camX; UI.camY = camY;
    tmr++;
    const tile = clamp(Math.floor(tx / 16), 0, W.w - 1);
    const sT = W.surf[tile] * 16;
    G.surfS += (sT - G.surfS) * 0.05;
    const surfPx = G.surfS;
    const bio = W.bio[tile];
    const ty16 = Math.floor(ty / 16);
    const g = wg;
    drawSky(g, BW, BH, camX, camY, surfPx, W.tod, W.day, bio, W.day ? 0 : (W.moon || 0), tmr);
    const depthA = clamp(1 - (camY + BH * 0.5 - surfPx) / 420, 0, 1);
    if (depthA > 0.01) drawBgLayers(g, BW, BH, camX, camY, surfPx - 6, BGKIND[bio] || 'forest', depthA, 0);
    const c0 = Math.max(0, camX >> 4), c1 = Math.min(W.w - 1, (camX + BW) >> 4);
    g.fillStyle = '#0c0809';
    for (let c = c0; c <= c1; c++) { const y0 = W.surf[c] * 16 + 6 - camY; if (y0 < BH) g.fillRect(c * 16 - camX, Math.max(0, y0), 16, BH - Math.max(0, y0)); }
    fgG.clearRect(0, 0, BW, BH);
    drawChunks(fgG, camX, camY, BW, BH);
    drawDecor(fgG, camX, camY, BW, BH, tmr);
    fgG.save(); fgG.translate(-camX, -camY); drawEntities(fgG, a); fgG.restore();
    drawLiquids(fgG, camX, camY, BW, BH, tmr);
    const amb = ambientAt(W.day, W.tod);
    computeLight(camX, camY, BW, BH, amb, lightSources());
    litG.globalCompositeOperation = 'copy';
    litG.drawImage(fgCv, 0, 0);
    litG.globalCompositeOperation = 'multiply';
    litG.imageSmoothingEnabled = true;
    litG.drawImage(LM.cv, 0, 0, LM.w, LM.h, LM.x0 * 16 - camX, LM.y0 * 16 - camY, LM.w * 16, LM.h * 16);
    litG.globalCompositeOperation = 'destination-in';
    litG.drawImage(fgCv, 0, 0);
    litG.globalCompositeOperation = 'source-over';
    g.drawImage(litCv, 0, 0);
    drawFlames(g, camX, camY, BW, BH, tmr);
    drawParts(g, camX, camY);
    drawCracks(g);
    drawTileCursor(g);
    if (G.tick % 4 === 0) mmReveal(camX, camY, BW, BH);
    hg.clearRect(0, 0, UI.w, UI.h);
    drawHUD(hg);
    void ty16;
  }

  const TITLEWALK = { x: 0 };
  function renderTitle() {
    titleT++;
    const g = wg, cx = titleT * 0.5, surfPx = BH * 0.66;
    const tod = (20000 + titleT * 12) % DAYLEN;
    drawSky(g, BW, BH, cx, 0, surfPx, tod, true, 0, 0, titleT);
    drawBgLayers(g, BW, BH, cx, 0, surfPx, 'forest', 1, 0);
    const gy = Math.round(surfPx);
    g.fillStyle = '#5a3c22'; g.fillRect(0, gy, BW, BH - gy);
    const sc = cx | 0, o = sc % 16, ti = sc >> 4;
    g.fillStyle = '#6b4a2c';
    for (let i = 0, x = -o; x < BW; x += 16, i++) for (let y = gy + 16, j = 1; y < BH; y += 16, j++) if (hash2(ti + i, j, 9) < 0.5) g.fillRect(x + 2, y + 2, 12, 12);
    g.fillStyle = '#4fa83a'; g.fillRect(0, gy, BW, 5);
    g.fillStyle = '#6cc84e'; g.fillRect(0, gy, BW, 2);
    for (let i = 0, x = -(sc % 8); x < BW; x += 8, i++) { g.fillStyle = '#3e8a2c'; g.fillRect(x, gy + 5, 4, 2 + (hash2((sc >> 3) + i, 3, 4) * 3 | 0)); }
    TITLEWALK.x = (titleT * 0.9) % (BW + 120) - 60;
    const fr = 1 + ((titleT >> 2) % 8);
    const lk = NET.ch ? lookFromChar(NET.ch) : LOOKS.guide;
    spr(g, charImg(lk, NOEQ, fr, false), TITLEWALK.x - 20, gy - 48, false);
    const sl = slimeFrame('green', (titleT >> 5) % 3), sxp = BW - ((titleT * 0.4) % (BW + 80));
    g.drawImage(sl, Math.round(sxp), gy - sl.height + 2);
    hg.clearRect(0, 0, UI.w, UI.h);
  }

  function frame() {
    if (!alive) return;
    const t = now();
    let dt = (t - lastNow) / 1000;
    lastNow = t;
    if (dt > 0.25) dt = 0.25;
    fps.n++;
    if (t - fps.t >= 1000) { fps.v = fps.n * 1000 / (t - fps.t); fps.n = 0; fps.t = t; }
    try {
      if (SCENE === 'play' && G && W && (NET.role !== 'guest' || NET.loaded)) {
        const multi = G.net && G.players.size > 1;
        const run = !paused || multi || !AUTH();
        if (run) { accT += dt; let n = 0; while (accT >= STEPS && n < 5) { simTick(); accT -= STEPS; n++; } if (n >= 5) accT = 0; } else accT = 0;
        G.alpha = accT / STEPS;
        renderPlay(dt);
        musicTick(dt);
      } else if (SCENE === 'title') renderTitle();
    } catch (e) { if (++errCount < 8 && window.console) console.error(e); }
  }

  function leaveToTitle(why) {
    if (quitting) return;
    quitting = true;
    const done = () => {
      quitting = false;
      try { if (G && G.me && (G.score | 0) > 0) api.submit(G.score); } catch (e) { }
      leaveOnline();
      try { sessionStorage.removeItem('gameplay:terraria:host'); } catch (e) { }
      G = null; W = null; SCENE = 'title'; paused = false; resetState(); api.score(0);
      NET.discMsg = why === 'disc' ? NET.discMsg : '';
      inputReset();
      showMenu(why === 'disc' ? 'disc' : 'title');
    };
    if (G && G.me && why !== 'disc') saveNow().then(done, done); else done();
  }
  function mountGame(root, a) {
    api = a; alive = true; rootEl = root; quitting = false; paused = false; SCENE = 'title'; G = null; W = null; errCount = 0; accT = 0;
    NET.bound = false; NET.role = null; NET.me = null; NET.loaded = false; NET.discMsg = ''; NET.ch = null; NET.early.length = 0;
    AC = null; master = null; sfxBus = null; musBus = null; noiseBuf = null; sndQ = [];
    root.innerHTML = '<div class="tr-wrap"><canvas class="tr-world"></canvas><canvas class="tr-hud"></canvas><div class="tr-ui"></div></div>';
    wrapEl = root.querySelector('.tr-wrap'); wcv = root.querySelector('.tr-world'); hcv = root.querySelector('.tr-hud'); uiEl = root.querySelector('.tr-ui');
    wg = wcv.getContext('2d', { alpha: false }); hg = hcv.getContext('2d');
    fgCv = mkcv(1, 1); fgG = ctx2(fgCv); litCv = mkcv(1, 1); litG = ctx2(litCv);
    resetState();
    bindMenus();
    for (const [t, f] of bindInput(hcv)) a.on(window, t, f);
    try { UI.touch = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches); } catch (e) { }
    resize();
    if (window.ResizeObserver) { resizeObs = new ResizeObserver(() => { resize(); uiEl.style.fontSize = clamp(Math.min(UI.w / 52, UI.h / 34), 10, 19) + 'px'; }); resizeObs.observe(wrapEl); }
    a.on(window, 'resize', resize);
    uiEl.style.fontSize = clamp(Math.min(UI.w / 52, UI.h / 34), 10, 19) + 'px';
    loadSettings();
    bindNet();
    a.on(window, 'pagehide', () => { if (G && SCENE === 'play') saveNow(); });
    a.on(document, 'visibilitychange', () => { if (document.hidden && G && SCENE === 'play') saveNow(); });
    showMenu('title');
    lastNow = now(); fps.t = lastNow; fps.n = 0;
    a.loop(frame);
    autoResume();
    root.__tr = {
      G: () => G, W: () => W, M, NET, UI, fps, scene: () => SCENE, paused: () => paused, cam: () => [camX, camY], zs: () => zsDev, bw: () => [BW, BH],
      quick: async (size, name) => {
        const ch = newCharacter(name || 'Tester'); ch.spawns = {}; ch.maps = {};
        const sk = size || 'small', [w, h] = SIZES[sk];
        const Wd = await genWorld(w, h, 'Test', 12345, sk, () => { });
        Wd.id = 'wq' + Date.now().toString(36);
        M.ch = ch; startSolo(ch, Wd);
        return true;
      }
    };
    return {
      destroy() {
        alive = false;
        if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
        try { if (G && SCENE === 'play') saveNow(); } catch (e) { }
        try { leaveOnline(); } catch (e) { }
        try { if (AC) AC.close(); } catch (e) { }
        AC = null; G = null; W = null; chunks.clear(); delete root.__tr;
      }
    };
  }
  const GC = '.gm-terraria';
  Ameplay.register({
    id: 'terraria',
    title: 'Terraria',
    category: 'Action',
    ownPause: true,
    tint: '#4a9a3a',
    blurb: 'Dig, build and fight in a procedural 2D world: caves, ores, biomes, bosses, NPCs, saved worlds and 2 to 4 player online co-op.',
    help: '<kbd>A</kbd><kbd>D</kbd> move · <kbd>W</kbd>/<kbd>Space</kbd> jump · <kbd>S</kbd> drop through platforms · left click use, mine, place · right click doors, chests, beds, NPCs · <kbd>1</kbd>-<kbd>0</kbd>/wheel hotbar · <kbd>E</kbd> inventory and crafting · <kbd>H</kbd> heal · <kbd>J</kbd> mana · <kbd>M</kbd> map · <kbd>N</kbd> minimap · <kbd>Esc</kbd> menu · touch: stick to move, tap to use, buttons for jump, inventory and map',
    better: 'high',
    format: v => v + ' pts',
    width: 1000,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 52 42 24"/><path d="M30 12c10-2 20 4 24 14-4-4-9-6-15-5-4 1-7 3-9 6-2-5-2-10 0-15z"/><path d="M8 58h16M8 52h6" opacity=".4"/><path d="M44 46l10 10M50 40l8 8" opacity=".5"/></svg>',
    css: `
${GC}{gap:0}
${GC} .tr-wrap{position:relative;width:min(100%,1100px,calc((100dvh - var(--goff,250px)) * 1.6));aspect-ratio:16/10;overflow:hidden;background:#0a0c18;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:var(--r);font-family:"Trebuchet MS","Segoe UI",Verdana,sans-serif}
${GC} .tr-world,${GC} .tr-hud{position:absolute;left:0;top:0;display:block;border-radius:0}
${GC} .tr-world{image-rendering:pixelated;image-rendering:crisp-edges}
${GC} .tr-hud{width:100%;height:100%;cursor:none}
${GC} .tr-ui{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:1em;overflow:auto;padding:1em;color:#fff;font-size:14px;z-index:3;box-sizing:border-box}
${GC} .tr-ui.tr-s-pause,${GC} .tr-ui.tr-s-settings,${GC} .tr-ui.tr-s-help,${GC} .tr-ui.tr-s-join,${GC} .tr-ui.tr-s-wait,${GC} .tr-ui.tr-s-disc{background:rgba(6,8,22,.62)}
${GC} .tr-ui.tr-s-chars,${GC} .tr-ui.tr-s-charnew,${GC} .tr-ui.tr-s-worlds,${GC} .tr-ui.tr-s-worldnew,${GC} .tr-ui.tr-s-gen{background:rgba(6,8,22,.5)}
${GC} .tr-ui *{box-sizing:border-box}
${GC} .tr-logo{display:flex;flex-direction:column;align-items:center;margin-top:-1em}
${GC} .tr-logo span{font-size:5.2em;font-weight:900;letter-spacing:.06em;line-height:1;color:#7ed35a;text-shadow:0 .06em 0 #2f6a22,0 .12em 0 #5a3a1c,0 .18em 0 #3a2410,0 .3em .4em rgba(0,0,0,.6),.04em 0 0 #1c3a12,-.04em 0 0 #1c3a12;-webkit-text-stroke:.04em #173a10;background:linear-gradient(#a6ee7c 0,#5cb83a 48%,#6a4422 52%,#8a6034 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 .08em 0 #1a2c10)}
${GC} .tr-logo small{margin-top:.8em;font-size:1.25em;font-weight:700;color:#ffe9a0;text-shadow:0 2px 0 #000,0 0 8px rgba(0,0,0,.8)}
${GC} .tr-menu{display:flex;flex-direction:column;gap:.55em;width:min(19em,90%);margin:0 auto}
${GC} .tr-b{font:inherit;font-weight:800;font-size:1.25em;color:#fff;background:linear-gradient(#4c5fb4,#2c3a86);border:.12em solid #0a1030;outline:.1em solid #8896e8;outline-offset:-.22em;border-radius:.4em;padding:.5em 1em;cursor:pointer;text-shadow:0 .09em 0 #000,.07em 0 0 #000,-.07em 0 0 #000;min-height:2.4em;transition:transform .08s}
${GC} .tr-b:hover{background:linear-gradient(#6a7ee0,#3c4cb0);color:#ffe680}
${GC} .tr-b:active{transform:scale(.97)}
${GC} .tr-b.tr-go{background:linear-gradient(#58b84a,#2c7a28);outline-color:#a0f090}
${GC} .tr-b.tr-red{background:linear-gradient(#c04848,#7a2020);outline-color:#f09090}
${GC} .tr-b.tr-sm{font-size:1em;padding:.3em .8em;min-height:0;min-width:2.6em}
${GC} .tr-panel{background:linear-gradient(#26356f,#141c44);border:.16em solid #0a1030;outline:.1em solid #6a7ad0;outline-offset:-.3em;border-radius:.7em;padding:1.1em 1.3em;width:min(46em,96%);max-height:96%;display:flex;flex-direction:column;gap:.8em;box-shadow:0 .5em 1.5em rgba(0,0,0,.6)}
${GC} .tr-panel h2{margin:0;font-size:1.7em;text-align:center;color:#ffe680;text-shadow:0 .08em 0 #000,.06em 0 0 #000,-.06em 0 0 #000}
${GC} .tr-body{overflow:auto;min-height:0;display:flex;flex-direction:column;gap:.7em;padding:.1em}
${GC} .tr-foot{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap}
${GC} .tr-foot .tr-b{font-size:1.1em;min-width:8em}
${GC} .tr-c{text-align:center;margin:.3em 0;font-size:1.1em;color:#e8ecff}
${GC} .tr-list{display:flex;flex-direction:column;gap:.5em}
${GC} .tr-card{display:flex;align-items:center;gap:.9em;background:rgba(8,12,40,.65);border:.1em solid #4452a8;border-radius:.5em;padding:.5em .8em}
${GC} .tr-ci{flex:1;display:flex;flex-direction:column;gap:.15em;min-width:0}
${GC} .tr-ci b{font-size:1.25em;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${GC} .tr-ci span{font-size:.95em;color:#b8c4ff}
${GC} .tr-ca{display:flex;gap:.4em}
${GC} .tr-ca .tr-b{font-size:1.05em;padding:.35em .9em;min-height:2.2em}
${GC} .tr-pv{width:3.4em;height:4.8em;image-rendering:pixelated;flex:none}
${GC} .tr-pv.big{width:10em;height:14em}
${GC} .tr-cn{display:flex;gap:1.4em;align-items:center;flex-wrap:wrap;justify-content:center}
${GC} .tr-opts{display:flex;flex-direction:column;gap:.55em;flex:1;min-width:16em}
${GC} .tr-row{display:flex;align-items:center;gap:.8em;flex-wrap:wrap}
${GC} .tr-row label{width:6.5em;font-weight:800;color:#ffe9a0;flex:none}
${GC} .tr-row input[type=text],${GC} .tr-row input:not([type]){flex:1;min-width:8em;font:inherit;font-size:1.1em;padding:.4em .6em;border-radius:.4em;border:.12em solid #0a1030;background:#0c1238;color:#fff;outline:0}
${GC} .tr-row input[type=range]{flex:1;min-width:8em}
${GC} .tr-sw{display:flex;gap:.35em;flex-wrap:wrap}
${GC} .tr-sq{width:1.9em;height:1.9em;border-radius:.35em;border:.14em solid #0a1030;cursor:pointer;padding:0;font:inherit;font-weight:800;color:#fff}
${GC} .tr-sq.tr-tx{background:#2c3a86}
${GC} .tr-sq.on{outline:.16em solid #ffe680;outline-offset:.05em}
${GC} .tr-sizes{display:flex;gap:.6em;flex-wrap:wrap}
${GC} .tr-opt{flex:1;min-width:9em;display:flex;flex-direction:column;gap:.15em;align-items:center;font:inherit;color:#fff;background:rgba(8,12,40,.65);border:.14em solid #4452a8;border-radius:.5em;padding:.6em;cursor:pointer}
${GC} .tr-opt b{font-size:1.2em}
${GC} .tr-opt span{color:#b8c4ff;font-size:.95em}
${GC} .tr-opt i{color:#ffe9a0;font-size:.85em;font-style:normal}
${GC} .tr-opt.on{border-color:#ffe680;background:rgba(60,76,176,.7)}
${GC} .tr-bar{height:1.1em;background:#0a1030;border-radius:.6em;overflow:hidden;border:.1em solid #4452a8}
${GC} .tr-bar i{display:block;height:100%;width:0;background:linear-gradient(#8ee66a,#3c9a2c);transition:width .15s}
${GC} .tr-help{display:flex;flex-direction:column;gap:.6em;font-size:1em;line-height:1.4;color:#e8ecff}
${GC} .tr-help p{margin:0}
${GC} .tr-help b{color:#ffe680}
@media (max-width:640px){${GC} .tr-wrap{width:100%;aspect-ratio:auto;height:clamp(380px,calc(100dvh - var(--goff,250px)),135vw)}${GC} .tr-logo span{font-size:3.6em}${GC} .tr-panel{padding:.8em}${GC} .tr-card{gap:.6em}${GC} .tr-row label{width:100%}}
`,
    mount: mountGame
  });
  Ameplay.covers['terraria'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="trx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c84e8"/><stop offset=".75" stop-color="#a8d8fc"/><stop offset="1" stop-color="#d8ecfc"/></linearGradient><linearGradient id="trx-dirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5230"/><stop offset="1" stop-color="#3e2814"/></linearGradient></defs><rect width="400" height="300" fill="url(#trx-sky)"/><circle cx="318" cy="56" r="34" fill="#fff6b0" opacity=".5"/><circle cx="318" cy="56" r="22" fill="#fffbe0"/><g fill="#fff" opacity=".92"><rect x="30" y="46" width="90" height="16" rx="8"/><rect x="52" y="34" width="44" height="16" rx="8"/><rect x="180" y="28" width="66" height="12" rx="6"/></g><path d="M0 170Q60 120 130 160T260 150T400 170V300H0Z" fill="#6aa8d8" opacity=".5"/><path d="M0 190Q80 150 160 184T320 176T400 190V300H0Z" fill="#3f8a52"/><rect y="204" width="400" height="96" fill="url(#trx-dirt)"/><path d="M0 204Q50 196 100 204T200 204T300 202T400 204V214H0Z" fill="#58b043"/><path d="M0 204h400v4H0z" fill="#8ee06a"/><g fill="#2a1c0e" opacity=".55"><rect x="40" y="232" width="24" height="18"/><rect x="70" y="262" width="30" height="16"/><rect x="300" y="240" width="26" height="22"/></g><g><rect x="120" y="248" width="14" height="14" fill="#c8c8d0"/><rect x="134" y="256" width="14" height="14" fill="#b8b8c4"/><rect x="104" y="262" width="14" height="14" fill="#d86a2c"/><rect x="236" y="236" width="14" height="14" fill="#e8c43c"/><rect x="250" y="250" width="14" height="14" fill="#e8c43c"/><rect x="222" y="262" width="14" height="14" fill="#6ab8e8"/></g><rect x="86" y="130" width="14" height="76" fill="#7a5630"/><rect x="90" y="130" width="4" height="76" fill="#56391e"/><circle cx="93" cy="116" r="30" fill="#2f8a30"/><circle cx="74" cy="126" r="20" fill="#3aa03a"/><circle cx="114" cy="124" r="22" fill="#2a7a2c"/><g transform="translate(206 204)"><rect x="-8" y="-20" width="7" height="20" fill="#3b3f9a"/><rect x="1" y="-20" width="7" height="20" fill="#30347f"/><rect x="-9" y="-44" width="18" height="24" fill="#58a050"/><rect x="-9" y="-62" width="18" height="18" fill="#e3a97f"/><rect x="-9" y="-64" width="18" height="7" fill="#5e3a1c"/><rect x="2" y="-56" width="3" height="3" fill="#1c2878"/><g transform="translate(9 -40) rotate(-40)"><rect x="-2" y="-30" width="4" height="34" fill="#8b5a2b"/><path d="M-14-30h28v6h-8v4h-12v-4h-8z" fill="#c8ccd8"/></g></g><g transform="translate(300 204)"><path d="M-22 0Q-22-26 0-26T22 0Z" fill="#4a8ef0" opacity=".85"/><circle cx="-7" cy="-11" r="2.6" fill="#10204a"/><circle cx="7" cy="-11" r="2.6" fill="#10204a"/></g></svg>`;
})();
