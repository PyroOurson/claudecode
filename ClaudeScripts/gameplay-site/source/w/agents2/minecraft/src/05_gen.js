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
