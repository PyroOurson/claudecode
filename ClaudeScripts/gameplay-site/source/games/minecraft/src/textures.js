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
