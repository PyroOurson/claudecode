(() => {
  'use strict';
  const ID = 'sky-runner';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = a => a[(Math.random() * a.length) | 0];
  const chance = p => Math.random() < p;
  const ease = t => t * t * (3 - 2 * t);
  const hash = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const fmt = n => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const CFG = {
    LANE: 2.5, PHW: 0.36, PHD: 0.32, H_STAND: 1.7, H_ROLL: 0.85,
    V0: 15.5, VMAX: 31, VTAU: 125,
    JUMP_H: 1.55, JUMP_T: 0.64, SNEAK_H: 4.6, SNEAK_T: 1.0, ROLL_T: 0.62, FALL_V: 34,
    LANE_T: 0.13, COYOTE: 0.09, BUFFER: 0.16, STEP: 1 / 120,
    ROOF: 3.55, THW: 1.17, CAR: 12, CGAP: 0.7, RAMP: 8.5,
    LOW_H: 1.0, HIGH_B: 1.12, HIGH_T: 2.95, BAR_D: 0.25,
    CHASE_T: 4.2, START_CHASE: 3.4, GHOST_T: 1.4, REVIVE_GHOST: 2.6,
    JET_Y: 8.6, BOARD_T: 30, MAG_R: 10,
    AHEAD: 230, BEHIND: 40, CHUNK: 40, ACT_D: 150, SCORE_K: 1.0
  };
  const LX = l => (l - 1) * CFG.LANE;
  const speedAt = t => CFG.V0 + (CFG.VMAX - CFG.V0) * (1 - Math.exp(-t / CFG.VTAU));
  const tscale = v => Math.pow(CFG.V0 / Math.max(CFG.V0, v), 0.42);

  const CITIES = [
    { id: 'subway', name: 'Subway City', sub: 'The classic yard',
      sky: ['#3a9cf0', '#8fd0ff', '#e3f4ff'], fog: '#cfe9fb', sun: '#fff4dc', hemi: ['#d8eeff', '#8a7a64'], light: 1.0,
      gravel: ['#a99b88', '#8c7e6c'], sleeper: '#6b4a32', side: '#b8ad9c', walk: '#c9c2b6', wall: '#c9c4b8', wallTop: '#a9a397',
      bld: [['#c4553f', '#9c3e2d'], ['#d9a066', '#b07c48'], ['#8e6a5a', '#6e5044'], ['#e3cfa8', '#bba67f'], ['#6f8fb0', '#556f8c']],
      win: '#a9d4ef', winF: '#efe9dc', style: 'brick', roof: 'flat', tree: 'round', leaf: ['#5cb83a', '#3f962c'], props: 'city', arch: '#d9582c',
      trains: [['#ef6a2c', '#b8d636', 'low'], ['#f5c21f', '#e2412c'], ['#3f7fd0', '#f2f2f2'], ['#b8d636', '#ef6a2c', 'low'], ['#d8443a', '#f2f2f2']] },
    { id: 'neworleans', name: 'New Orleans', sub: 'Halloween in the French Quarter',
      sky: ['#2a1d56', '#7a3f8f', '#f09a5a'], fog: '#b06b8f', sun: '#ffc48a', hemi: ['#c9a2ff', '#4a3550'], light: 0.85,
      gravel: ['#8a7f7a', '#6d625e'], sleeper: '#4c3426', side: '#8f8579', walk: '#9c9184', wall: '#7d7469', wallTop: '#5f574f',
      bld: [['#7b4f9e', '#5d3a7a'], ['#2f8f8a', '#22706c'], ['#e08a4a', '#b8693a'], ['#c75b6e', '#9c4455'], ['#e8d27a', '#bfa95a']],
      win: '#ffd36b', winF: '#2e2a33', style: 'balcony', roof: 'flat', tree: 'bare', leaf: ['#4a3a30', '#33281f'], props: 'pumpkin',
      trains: [['#7b4f9e', '#f2a62a'], ['#2f8f8a', '#f4e9c8'], ['#3a3346', '#f28a2a'], ['#c75b6e', '#f2f2f2'], ['#e0a23a', '#3a3346']] },
    { id: 'rio', name: 'Rio', sub: 'Carnival on the rails',
      sky: ['#1f8fe8', '#6fd0ff', '#fff2c8'], fog: '#d6f0f6', sun: '#fff1c4', hemi: ['#e6f6ff', '#8d8a5c'], light: 1.08,
      gravel: ['#b9a585', '#9a8768'], sleeper: '#6e4a2e', side: '#c9b98f', walk: '#e8dcc0', wall: '#f0e6cf', wallTop: '#d2c6aa',
      bld: [['#ff7aa8', '#d95c88'], ['#ffd23f', '#d9ad1f'], ['#4fd1c5', '#33aaa0'], ['#ff9a3d', '#d97a24'], ['#8fd65a', '#6fb33c']],
      win: '#5a7f9a', winF: '#ffffff', style: 'favela', roof: 'flat', tree: 'palm', leaf: ['#3fae3a', '#2c8a2a'], props: 'beach',
      trains: [['#2fbf71', '#ffd23f'], ['#ffd23f', '#2f6fd9'], ['#ff5a7a', '#ffffff'], ['#2f9fd9', '#ffffff'], ['#f2f2f2', '#2fbf71']] },
    { id: 'rome', name: 'Rome', sub: 'All tracks lead to Rome',
      sky: ['#3e94e0', '#9ad2f5', '#fbe9c8'], fog: '#efe0c6', sun: '#ffe8b8', hemi: ['#fff1dc', '#9a7a58'], light: 1.05,
      gravel: ['#b8a184', '#9a8366'], sleeper: '#6b452c', side: '#cdb593', walk: '#dccaa8', wall: '#e2c99d', wallTop: '#c7ad80',
      bld: [['#d9894a', '#b86d34'], ['#e8b45a', '#c4913e'], ['#c9664a', '#a44f37'], ['#f0d29a', '#cdb07a'], ['#b5734f', '#91593c']],
      win: '#3d5a40', winF: '#f3e6c8', style: 'shutter', roof: 'tile', tree: 'cypress', leaf: ['#3f6e3a', '#2d5229'], props: 'rome',
      trains: [['#2f8f4a', '#f2f2f2'], ['#c9302c', '#f2f2f2'], ['#f2f2f2', '#2f8f4a'], ['#e8b45a', '#5a3a2a'], ['#3f6fb8', '#f2f2f2']] },
    { id: 'paris', name: 'Paris', sub: 'Surf the Metro',
      sky: ['#5a8fd6', '#b2d3f2', '#f6e3ea'], fog: '#e4e3ee', sun: '#fff0e0', hemi: ['#eef0ff', '#8a8078'], light: 1.0,
      gravel: ['#a49c94', '#888079'], sleeper: '#5e4433', side: '#b8b2a8', walk: '#cfc9be', wall: '#d8d0bf', wallTop: '#bdb4a2',
      bld: [['#efe4cc', '#cfc2a4'], ['#e8dcc2', '#c9bb9b'], ['#f4ead6', '#d6c9ab'], ['#e3d3b4', '#c2b190']],
      win: '#6d8aa8', winF: '#f7f1e3', style: 'haussmann', roof: 'mansard', tree: 'round', leaf: ['#6fae4a', '#558f36'], props: 'paris',
      trains: [['#2f5fb8', '#f2f2f2'], ['#f2f2f2', '#2f5fb8'], ['#3aa88f', '#f2f2f2'], ['#b8302c', '#f2f2f2'], ['#e0c26a', '#2f3a5a']] },
    { id: 'tokyo', name: 'Tokyo', sub: 'Cherry blossom season',
      sky: ['#4a8fe8', '#a6cff8', '#ffe1ee'], fog: '#f2dfee', sun: '#fff0f4', hemi: ['#ffeefa', '#7f7a88'], light: 1.0,
      gravel: ['#9e9aa2', '#827e88'], sleeper: '#4c4048', side: '#b2aeb6', walk: '#d4d0d8', wall: '#dcd8de', wallTop: '#b9b4bd',
      bld: [['#e6e8ee', '#c4c8d2'], ['#9aa8bc', '#7a889c'], ['#f2e2d8', '#d4c0b4'], ['#c2ccd8', '#a0abb9'], ['#5a6a82', '#46546a']],
      win: '#8fd0f5', winF: '#4a5262', style: 'modern', roof: 'flat', tree: 'blossom', leaf: ['#ffb3d1', '#f28ab4'], props: 'tokyo',
      trains: [['#f2f2f2', '#e8508a'], ['#f2f2f2', '#3a9a4a'], ['#ffd23f', '#3a3a46'], ['#3a8fe0', '#f2f2f2'], ['#e8508a', '#f2f2f2']] },
    { id: 'london', name: 'London', sub: 'Mind the gap',
      sky: ['#6f8fb2', '#b6c8d8', '#e8ecef'], fog: '#d6dce2', sun: '#f4f1ea', hemi: ['#e4ebf2', '#77706a'], light: 0.95,
      gravel: ['#9a948c', '#7f7972'], sleeper: '#4e3f34', side: '#a9a39b', walk: '#bdb8b0', wall: '#a8664d', wallTop: '#86503c',
      bld: [['#9e5a44', '#7d4534'], ['#c48a6a', '#a26e52'], ['#dcd6c8', '#bab3a3'], ['#7a6658', '#5e4e43']],
      win: '#9fb8cc', winF: '#f4f2ec', style: 'brick', roof: 'chimney', tree: 'round', leaf: ['#4f9a44', '#3c7c33'], props: 'london',
      trains: [['#d8282c', '#f2f2f2'], ['#f2f2f2', '#d8282c'], ['#1f3f8f', '#f2f2f2'], ['#3a3a3f', '#ffd23f'], ['#d8282c', '#1f3f8f']] },
    { id: 'cairo', name: 'Cairo', sub: 'Desert run',
      sky: ['#3a8fd8', '#94cdf0', '#ffe9bf'], fog: '#f3e2bd', sun: '#fff0c2', hemi: ['#fff3d6', '#a8875a'], light: 1.1,
      gravel: ['#cdb48a', '#ad956c'], sleeper: '#71502f', side: '#dcc394', walk: '#e6d2a8', wall: '#e2c690', wallTop: '#c7a974',
      bld: [['#e6c48a', '#c4a26a'], ['#d9a86a', '#b88a50'], ['#f0dcb0', '#cdb98d'], ['#c99a62', '#a67e4c']],
      win: '#4a5a6a', winF: '#f6ead0', style: 'arch', roof: 'flat', tree: 'palm', leaf: ['#5aa33a', '#43822b'], props: 'cairo',
      trains: [['#2f9fd9', '#f2e6c8'], ['#e0a23a', '#2f3a5a'], ['#2fbf9f', '#f2f2f2'], ['#c9302c', '#f2e6c8'], ['#f2e6c8', '#2f9fd9']] }
  ];

  const CHARS = [
    { id: 'jake', name: 'Jake', price: 0, skin: '#e9b48a', hair: '#5a3420', hat: 'cap', hatA: '#d8322c', hatB: '#ffd23f', top: '#efebe2', vest: '#7fb2e5', under: '#9ea4ab', pants: '#79a6dc', shoeA: '#f2f2f2', shoeB: '#5cc43a', extra: '', hood: '#a7abb2', scarf: '#d8322c' },
    { id: 'tricky', name: 'Tricky', price: 6000, skin: '#f4c7a0', hair: '#e2541f', hat: 'beanie', hatA: '#d8322c', hatB: '#ffffff', top: '#2f6fd9', vest: '', under: '#ffffff', pants: '#3a3f5a', shoeA: '#ffffff', shoeB: '#d8322c', extra: 'pony' },
    { id: 'fresh', name: 'Fresh', price: 12000, skin: '#8a5a3c', hair: '#1f1814', hat: 'beanie', hatA: '#3a3f4a', hatB: '#ffd23f', top: '#ff9a2a', vest: '', under: '#ffffff', pants: '#2f3f5f', shoeA: '#f4f4f4', shoeB: '#2f2f3a', extra: 'phones' },
    { id: 'yutani', name: 'Yutani', price: 20000, skin: '#f0c49c', hair: '#2a1d16', hat: 'alien', hatA: '#6fd25a', hatB: '#ffffff', top: '#a95ad9', vest: '', under: '#ffd23f', pants: '#2a2f45', shoeA: '#ffd23f', shoeB: '#a95ad9', extra: '' }
  ];

  const PU = {
    jet: { name: 'Jetpack', col: '#ff5a3a' },
    sneak: { name: 'Super Sneakers', col: '#3ad16b' },
    mag: { name: 'Coin Magnet', col: '#e8343a' },
    x2: { name: '2X Multiplier', col: '#ffc21a' }
  };
  const UPG_COST = [300, 800, 1600, 3200, 6400];
  const puDur = lvl => 10 + lvl * 4;

  const MISSIONS = {
    coins: { t: n => `Collect ${fmt(n)} coins`, n: l => 150 + l * 60, run: false },
    coinsRun: { t: n => `Collect ${fmt(n)} coins in one run`, n: l => 60 + l * 25, run: true },
    jump: { t: n => `Jump ${n} times`, n: l => 20 + l * 6, run: false },
    roll: { t: n => `Roll ${n} times`, n: l => 15 + l * 5, run: false },
    score: { t: n => `Score ${fmt(n)} points in one run`, n: l => 1500 + l * 900, run: true },
    pu: { t: n => `Pick up ${n} power-ups`, n: l => 3 + l, run: false },
    jet: { t: n => n === 1 ? 'Pick up a Jetpack' : `Pick up ${n} Jetpacks`, n: l => 1 + Math.floor(l / 2), run: false },
    magCoins: { t: n => `Collect ${n} coins with a Coin Magnet`, n: l => 50 + l * 20, run: false },
    board: { t: n => n === 1 ? 'Use a hoverboard' : `Use ${n} hoverboards`, n: l => 1 + Math.floor(l / 3), run: false },
    bump: { t: n => `Bump into trains ${n} times`, n: l => 3 + l, run: false },
    dodge: { t: n => `Dodge ${n} barriers`, n: l => 20 + l * 8, run: false },
    roof: { t: n => `Run ${fmt(n)} m on top of trains`, n: l => 150 + l * 60, run: false },
    noCoin: { t: n => `Score ${fmt(n)} points without collecting coins`, n: l => 400 + l * 200, run: true },
    sneakJump: { t: n => `Jump ${n} times with Super Sneakers`, n: l => 6 + l * 2, run: false },
    mbox: { t: n => n === 1 ? 'Collect a Mystery Box' : `Collect ${n} Mystery Boxes`, n: l => 1 + Math.floor(l / 3), run: false },
    stumble: { t: n => `Stumble ${n} times`, n: l => 2 + Math.floor(l / 2), run: false }
  };
  const MKEYS = Object.keys(MISSIONS);
  const missionSet = lvl => {
    const out = [];
    let seed = lvl * 9.13 + 1;
    while (out.length < 3) {
      const k = MKEYS[Math.floor(hash(seed++) * MKEYS.length)];
      if (out.includes(k)) continue;
      if (lvl < 2 && (k === 'noCoin' || k === 'sneakJump' || k === 'mbox')) continue;
      out.push(k);
    }
    return out.map(k => ({ k, n: MISSIONS[k].n(lvl) }));
  };

  const FONT = '"Lilita One", "Nunito", "Arial Black", Impact, sans-serif';
  const GWORDS = ['SUBWAY', 'SURF', 'ZAP', 'YO!', 'KRU', 'WOW', 'FLY', 'BOOM', 'JAKE', 'RUSH', 'HEY', 'COOL', 'SPRAY', 'TAG', 'GO!'];
  const GCOLS = [['#ffd23f', '#ff7a1a'], ['#ff4fa3', '#a83cff'], ['#3ad1ff', '#2f6fd9'], ['#7cf03a', '#1fa84a'], ['#ff5a3a', '#ffd23f'], ['#ffffff', '#3ad1ff'], ['#c16bff', '#ff4fa3']];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function noise(g, x, y, w, h, n, a, cols) {
    for (let i = 0; i < n; i++) { g.globalAlpha = a * Math.random(); g.fillStyle = cols ? pick(cols) : (Math.random() < 0.5 ? '#000' : '#fff'); const s = 1 + Math.random() * 3; g.fillRect(x + Math.random() * w, y + Math.random() * h, s, s); }
    g.globalAlpha = 1;
  }
  function graffiti(g, word, cx, cy, size, cols, rot) {
    g.save(); g.translate(cx, cy); g.rotate(rot || 0);
    g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(word, size * 0.08, size * 0.1);
    g.lineWidth = size * 0.22; g.strokeStyle = '#1b1530'; g.strokeText(word, 0, 0);
    g.lineWidth = size * 0.1; g.strokeStyle = '#ffffff'; g.strokeText(word, 0, 0);
    const gr = g.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
    g.fillStyle = gr; g.fillText(word, 0, 0);
    g.globalAlpha = 0.5; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-size * 0.6, -size * 0.2, size * 0.12, size * 0.05, -0.4, 0, TAU); g.fill(); g.globalAlpha = 1;
    g.restore();
  }
  function splat(g, x, y, r, c) {
    g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    for (let i = 0; i < 7; i++) { const a = Math.random() * TAU, d = r * rnd(1.1, 1.9); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * rnd(0.12, 0.3), 0, TAU); g.fill(); }
    g.fillRect(x - r * 0.08, y, r * 0.16, r * rnd(1.2, 2.4));
  }
  function stripes(g, x, y, w, h, c1, c2, sw) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = c1; g.fillRect(x, y, w, h); g.fillStyle = c2;
    for (let i = -h; i < w + h; i += sw * 2) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); g.lineTo(x + i + h + sw, y); g.lineTo(x + i + sw, y + h); g.closePath(); g.fill(); }
    g.restore();
  }

  function mkTex(THREE, renderer) {
    const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const canvasTex = (c, rep) => {
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
      if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

    function atlas(city) {
      const S = 2048, c = cv(S, S), g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
      let sx = 0, sy = 0, sh = 0;
      const R = {};
      const alloc = (w, h) => { if (sx + w > S) { sx = 0; sy += sh + 2; sh = 0; } const r = [sx, sy, w, h]; sx += w + 2; sh = Math.max(sh, h); return r; };
      R.liv = []; R.front = []; R.frontLit = []; R.ends = [];
      city.trains.forEach((lv, i) => {
        const r = alloc(1020, 200); R.liv.push(r); paintLivery(g, r, lv, i);
      });
      city.trains.forEach((lv, i) => {
        const r = alloc(168, 200); R.front.push(r); paintFront(g, r, lv, false, i);
        const r2 = alloc(168, 200); R.frontLit.push(r2); paintFront(g, r2, lv, true, i);
        const r3 = alloc(168, 200); R.ends.push(r3); paintEnd(g, r3, lv);
      });
      R.graf = [];
      for (let i = 0; i < 4; i++) { const r = alloc(1020, 176); R.graf.push(r); paintWall(g, r, city, i); }
      R.fac = [];
      city.bld.forEach((b, i) => { const r = alloc(200, 400); R.fac.push(r); paintFacade(g, r, city, b, i); });
      R.white = alloc(16, 16);
      R.roofs = alloc(128, 128); g.fillStyle = shade(city.wallTop, -0.1); g.fillRect(...R.roofs); noise(g, ...R.roofs, 300, 0.12);
      R.low = alloc(256, 64); stripes(g, ...R.low, '#e8323a', '#ffffff', 22); g.strokeStyle = '#7a1018'; g.lineWidth = 6; g.strokeRect(R.low[0] + 3, R.low[1] + 3, 250, 58);
      R.high = alloc(256, 96); stripes(g, ...R.high, '#ffcf1f', '#26222e', 24); g.strokeStyle = '#26222e'; g.lineWidth = 8; g.strokeRect(R.high[0] + 4, R.high[1] + 4, 248, 88);
      R.ramp = alloc(128, 256); paintRamp(g, R.ramp);
      R.rampSide = alloc(128, 64); stripes(g, ...R.rampSide, '#ffcf1f', '#26222e', 14);
      R.mbox = alloc(128, 128); paintMbox(g, R.mbox);
      R.tunnel = alloc(256, 256); paintTunnel(g, R.tunnel, city);
      R.portal = alloc(512, 256); paintPortal(g, R.portal, city);
      R.platform = alloc(256, 64); paintPlatform(g, R.platform);
      R.arch = alloc(1020, 330); paintArch(g, R.arch, city);
      R.chev = alloc(256, 96); paintChev(g, R.chev);
      R.sig = alloc(64, 128); stripes(g, ...R.sig, '#ffffff', '#e8323a', 14);
      R.sign = alloc(256, 96); paintSign(g, R.sign, city);
      R.neon = alloc(128, 256); paintNeon(g, R.neon, city);
      const tex = canvasTex(c);
      const uv = (r, u0 = 0, v0 = 0, u1 = 1, v1 = 1) => [(r[0] + 1 + u0 * (r[2] - 2)) / S, 1 - (r[1] + 1 + v1 * (r[3] - 2)) / S, (r[0] + 1 + u1 * (r[2] - 2)) / S, 1 - (r[1] + 1 + v0 * (r[3] - 2)) / S];
      return { tex, R, uv, canvas: c };
    }

    function paintLivery(g, r, lv, i) {
      const [x, y, w, h] = r, base = lv[0], band = lv[1];
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(base, 0.18)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.25));
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      if (lv[2] === 'low') { const lg = g.createLinearGradient(0, y + h * 0.6, 0, y + h); lg.addColorStop(0, shade(band, 0.12)); lg.addColorStop(1, shade(band, -0.22)); g.fillStyle = lg; g.fillRect(x, y + h * 0.6, w, h * 0.4); g.fillStyle = shade(base, -0.3); g.fillRect(x, y + h * 0.6, w, 4); }
      else { g.fillStyle = band; g.fillRect(x, y + h * 0.6, w, h * 0.09); g.fillStyle = shade(band, -0.2); g.fillRect(x, y + h * 0.69, w, h * 0.02); }
      const doors = [0.2, 0.5, 0.8];
      for (const d of doors) {
        const dx = x + w * d - 34;
        g.fillStyle = shade(base, -0.12); g.fillRect(dx - 4, y + 10, 76, h - 22);
        g.fillStyle = '#2b3550'; rr(g, dx + 4, y + 30, 26, 66, 6); g.fill(); rr(g, dx + 38, y + 30, 26, 66, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(dx + 8, y + 34, 6, 50); g.fillRect(dx + 42, y + 34, 6, 50);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(dx + 33, y + 12, 2, h - 26);
      }
      for (let k = 0; k < 4; k++) {
        const wx = x + w * (0.035 + k * 0.3) + (k ? 0 : 0), ww = w * 0.12;
        if (k === 3) break;
        for (let j = 0; j < 2; j++) {
          const xx = wx + j * (ww + 10) + 30;
          g.fillStyle = shade(base, -0.4); rr(g, xx - 4, y + 22, ww + 8, 80, 12); g.fill();
          const gg = g.createLinearGradient(xx, y + 26, xx + ww, y + 98); gg.addColorStop(0, '#9fd8ff'); gg.addColorStop(0.5, '#3d5f8f'); gg.addColorStop(1, '#22304f');
          g.fillStyle = gg; rr(g, xx, y + 26, ww, 72, 9); g.fill();
          g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(xx + 8, y + 90); g.lineTo(xx + 26, y + 30); g.lineTo(xx + 38, y + 30); g.lineTo(xx + 20, y + 90); g.fill();
        }
      }
      if (i % 2 === 0 || Math.random() < 0.7) {
        const n = rint(1, 2);
        for (let k = 0; k < n; k++) graffiti(g, pick(GWORDS), x + w * (0.25 + k * 0.5) + rnd(-60, 60), y + h * rnd(0.62, 0.74), rnd(54, 74), pick(GCOLS), rnd(-0.12, 0.08));
        for (let k = 0; k < 3; k++) splat(g, x + rnd(20, w - 20), y + h * rnd(0.75, 0.9), rnd(5, 10), pick(GCOLS)[0]);
      }
      const dg = g.createLinearGradient(0, y + h * 0.8, 0, y + h); dg.addColorStop(0, 'rgba(40,30,20,0)'); dg.addColorStop(1, 'rgba(40,30,20,.55)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y, w, 6); g.fillRect(x, y + h - 8, w, 8);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y + 6, w, 3);
      noise(g, x, y, w, h, 600, 0.05);
    }
    function paintFront(g, r, lv, lit, i) {
      const [x, y, w, h] = r, base = lv[0], band = lv[1], cx = x + w / 2;
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(base, 0.2)); gr.addColorStop(1, shade(base, -0.25));
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = shade(base, -0.45); rr(g, x + 10, y + 18, w - 20, 86, 14); g.fill();
      const gg = g.createLinearGradient(x, y + 20, x + w, y + 100); gg.addColorStop(0, '#bfe6ff'); gg.addColorStop(0.45, '#4a6f9f'); gg.addColorStop(1, '#1f2a45');
      g.fillStyle = gg; rr(g, x + 15, y + 23, w - 30, 76, 10); g.fill();
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(x + 26, y + 92); g.lineTo(x + 56, y + 27); g.lineTo(x + 74, y + 27); g.lineTo(x + 44, y + 92); g.fill();
      g.fillStyle = '#1a1a22'; g.fillRect(cx - 2, y + 23, 4, 76);
      g.fillStyle = '#111'; rr(g, cx - 40, y + 3, 80, 13, 4); g.fill();
      g.fillStyle = lit ? '#ffb31a' : '#7a5a1a'; g.font = `900 11px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['EXPRESS', 'DOWNTOWN', 'UPTOWN', 'YARD', 'CENTRAL'][i % 5], cx, y + 10);
      g.fillStyle = band; g.fillRect(x, y + 110, w, 14);
      for (const s of [-1, 1]) {
        const lx = cx + s * 54, ly = y + 146;
        g.fillStyle = '#2a2a33'; g.beginPath(); g.arc(lx, ly, 16, 0, TAU); g.fill();
        if (lit) {
          const hg = g.createRadialGradient(lx, ly, 2, lx, ly, 14); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, '#fff6b0'); hg.addColorStop(1, '#ffc21a');
          g.fillStyle = hg;
        } else g.fillStyle = '#d9dde6';
        g.beginPath(); g.arc(lx, ly, 12, 0, TAU); g.fill();
        g.fillStyle = lit ? '#ff6a3a' : '#8a3a3a'; g.beginPath(); g.arc(lx - s * 26, ly, 6, 0, TAU); g.fill();
      }
      g.fillStyle = '#fff'; g.font = `900 26px ${FONT}`; g.fillText(String(10 + i * 7), cx, y + 147);
      g.fillStyle = '#2a2a33'; g.fillRect(x + 8, y + h - 24, w - 16, 20);
      g.fillStyle = '#ffcf1f'; for (let k = 0; k < 6; k++) g.fillRect(x + 12 + k * 26, y + h - 20, 12, 12);
      noise(g, x, y, w, h, 200, 0.05);
    }
    function paintEnd(g, r, lv) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(lv[0], -0.1); g.fillRect(x, y, w, h);
      g.fillStyle = shade(lv[0], -0.35); rr(g, x + w / 2 - 36, y + 20, 72, h - 40, 8); g.fill();
      g.fillStyle = '#2b3550'; rr(g, x + w / 2 - 24, y + 34, 48, 56, 6); g.fill();
      g.fillStyle = lv[1]; g.fillRect(x, y + 128, w, 18);
      noise(g, x, y, w, h, 200, 0.05);
    }
    function paintWall(g, r, city, i) {
      const [x, y, w, h] = r;
      g.fillStyle = city.wall; g.fillRect(x, y, w, h);
      for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + k * w / 8, y, 3, h); }
      g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + h * 0.5, w, 2);
      noise(g, x, y, w, h, 2500, 0.08);
      const n = 2 + (i % 2);
      for (let k = 0; k < n; k++) {
        const cx = x + w * (k + 0.5) / n + rnd(-30, 30), cy = y + h * rnd(0.45, 0.6);
        if (Math.random() < 0.5) splat(g, cx + rnd(-120, 120), cy + rnd(-40, 30), rnd(14, 26), pick(GCOLS)[1]);
        graffiti(g, pick(GWORDS), cx, cy, rnd(80, 110), pick(GCOLS), rnd(-0.1, 0.1));
      }
      for (let k = 0; k < 4; k++) { g.save(); g.translate(x + rnd(30, w - 30), y + rnd(20, h - 20)); g.rotate(rnd(-0.3, 0.3)); g.font = `900 22px ${FONT}`; g.fillStyle = pick(['#1b1530', '#c42a7a', '#2f6fd9']); g.fillText(pick(['jk', 'zip', 'srf', 'yo', 'xo', 'ss']), 0, 0); g.restore(); }
      const dg = g.createLinearGradient(0, y + h * 0.7, 0, y + h); dg.addColorStop(0, 'rgba(60,45,30,0)'); dg.addColorStop(1, 'rgba(60,45,30,.45)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
      g.fillStyle = city.wallTop; g.fillRect(x, y, w, 10);
    }
    function paintFacade(g, r, city, cols, i) {
      const [x, y, w, h] = r, st = city.style;
      const base = cols[0];
      g.fillStyle = base; g.fillRect(x, y, w, h);
      if (st === 'brick') {
        g.fillStyle = shade(base, -0.12);
        for (let yy = 0; yy < h; yy += 8) for (let xx = (yy / 8) % 2 ? 0 : 10; xx < w; xx += 20) g.fillRect(x + xx, y + yy, 18, 1.5), g.fillRect(x + xx, y + yy, 1.5, 8);
      } else noise(g, x, y, w, h, 1500, 0.06);
      const floors = st === 'modern' ? 9 : st === 'favela' ? 5 : 6, fh = h / floors;
      const cols2 = st === 'modern' ? 5 : st === 'haussmann' ? 3 : st === 'favela' ? 2 : 3;
      for (let f = 0; f < floors; f++) {
        const fy = y + f * fh;
        if (st === 'haussmann' || st === 'balcony') { g.fillStyle = shade(base, -0.18); g.fillRect(x, fy + fh - 6, w, 6); }
        if (f === floors - 1 && st !== 'modern') {
          g.fillStyle = shade(base, -0.3); g.fillRect(x, fy + fh * 0.2, w, fh * 0.8);
          if (st === 'brick' || st === 'arch') for (let k = 0; k < 2; k++) { g.fillStyle = city.winF; g.fillRect(x + 30 + k * 120, fy + fh * 0.3, 80, fh * 0.6); g.fillStyle = shade(city.win, -0.3); g.fillRect(x + 36 + k * 120, fy + fh * 0.36, 68, fh * 0.54); }
          continue;
        }
        for (let k = 0; k < cols2; k++) {
          const cw = w / cols2, wx = x + k * cw + cw * 0.2, ww = cw * 0.6, wy = fy + fh * 0.2, wh = fh * (st === 'haussmann' ? 0.62 : 0.55);
          const lit = city.win === '#ffd36b' ? Math.random() < 0.7 : Math.random() < 0.08;
          if (st === 'modern') { g.fillStyle = city.winF; g.fillRect(x + k * cw, wy - 2, cw, wh + 4); }
          g.fillStyle = st === 'modern' ? city.winF : city.winF; g.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
          const gg = g.createLinearGradient(wx, wy, wx + ww, wy + wh); gg.addColorStop(0, lit ? '#fff0b0' : shade(city.win, 0.35)); gg.addColorStop(1, lit ? '#ffb84a' : shade(city.win, -0.25));
          g.fillStyle = gg;
          if (st === 'arch') { g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.fill(); }
          else g.fillRect(wx, wy, ww, wh);
          g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(wx + 3, wy + 3, ww * 0.25, wh - 6);
          g.fillStyle = city.winF; g.fillRect(wx + ww / 2 - 1.5, wy, 3, wh);
          if (st === 'shutter') { g.fillStyle = city.win; g.fillRect(wx - 16, wy - 2, 12, wh + 4); g.fillRect(wx + ww + 4, wy - 2, 12, wh + 4); }
          if (st === 'haussmann' || st === 'balcony') {
            g.strokeStyle = '#2b2730'; g.lineWidth = 2; g.strokeRect(wx - 6, wy + wh * 0.65, ww + 12, wh * 0.35);
            for (let b = 0; b < 6; b++) g.fillStyle = '#2b2730', g.fillRect(wx - 6 + b * (ww + 12) / 5, wy + wh * 0.65, 2, wh * 0.35);
          }
          if (st === 'favela' && Math.random() < 0.5) { g.fillStyle = pick(['#ff5a7a', '#3ad1ff', '#ffd23f', '#7cf03a']); g.fillRect(wx - 6, wy + wh + 4, ww + 12, 8); }
        }
        if (st === 'brick' && f > 0 && f < floors - 1 && i % 2 === 0) {
          g.strokeStyle = '#2f2b33'; g.lineWidth = 3; g.strokeRect(x + w * 0.1, fy + fh * 0.78, w * 0.5, 2);
          for (let b = 0; b < 8; b++) g.fillStyle = '#2f2b33', g.fillRect(x + w * 0.1 + b * w * 0.07, fy + fh * 0.62, 2, fh * 0.16);
        }
      }
      if (st === 'modern' && i % 2 === 1) { g.fillStyle = pick(['#ff4fa3', '#3ad1ff', '#ffd23f']); rr(g, x + 20, y + h * 0.35, 60, 150, 8); g.fill(); g.fillStyle = '#fff'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText('寿', x + 50, y + h * 0.35 + 50); g.fillText('司', x + 50, y + h * 0.35 + 110); }
      const dg = g.createLinearGradient(0, y, 0, y + h); dg.addColorStop(0, 'rgba(255,255,255,.08)'); dg.addColorStop(1, 'rgba(0,0,0,.18)');
      g.fillStyle = dg; g.fillRect(x, y, w, h);
    }
    function paintRamp(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#e7b91f'; g.fillRect(x, y, w, h);
      for (let k = 0; k < h; k += 16) { g.fillStyle = '#b8901a'; g.fillRect(x, y + k, w, 5); g.fillStyle = '#f7d64a'; g.fillRect(x, y + k + 5, w, 2); }
      stripes(g, x, y, 14, h, '#ffcf1f', '#26222e', 10); stripes(g, x + w - 14, y, 14, h, '#ffcf1f', '#26222e', 10);
      noise(g, x, y, w, h, 300, 0.1);
    }
    function paintMbox(g, r) {
      const [x, y, w, h] = r;
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#b45cff'); gr.addColorStop(1, '#6a1fc9');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.strokeStyle = '#ffd23f'; g.lineWidth = 10; g.strokeRect(x + 5, y + 5, w - 10, h - 10);
      g.font = `900 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#3a0f7a'; g.strokeText('?', x + w / 2, y + h / 2 + 6);
      g.fillStyle = '#ffd23f'; g.fillText('?', x + w / 2, y + h / 2 + 6);
    }
    function paintTunnel(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(city.wall, -0.45); g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 16) for (let xx = (yy / 16) % 2 ? 0 : 16; xx < w; xx += 32) { g.fillStyle = shade(city.wall, -0.55); g.fillRect(x + xx, y + yy, 30, 1.5); g.fillRect(x + xx, y + yy, 1.5, 16); }
      noise(g, x, y, w, h, 800, 0.1);
      g.fillStyle = '#fff3c4'; g.fillRect(x, y + 6, w, 10);
    }
    function paintPortal(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = shade(city.wall, -0.15); g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 32) for (let xx = (yy / 32) % 2 ? 0 : 32; xx < w; xx += 64) { g.fillStyle = shade(city.wall, -0.3); g.fillRect(x + xx, y + yy, 62, 2); g.fillRect(x + xx, y + yy, 2, 32); }
      noise(g, x, y, w, h, 1500, 0.08);
      graffiti(g, pick(GWORDS), x + w * 0.22, y + h * 0.5, 54, pick(GCOLS), -0.1);
      graffiti(g, pick(GWORDS), x + w * 0.78, y + h * 0.55, 54, pick(GCOLS), 0.08);
    }
    function paintArch(g, r, city) {
      const [x, y, w, h] = r, a = city.arch || city.wall, n = 3, aw = w / n;
      g.fillStyle = a; g.fillRect(x, y, w, h);
      for (let yy = 0; yy < h; yy += 14) for (let xx = (yy / 14) % 2 ? 0 : 18; xx < w; xx += 36) { g.fillStyle = shade(a, -0.1); g.fillRect(x + xx, y + yy, 34, 1.5); g.fillRect(x + xx, y + yy, 1.5, 14); }
      noise(g, x, y, w, h, 2200, 0.07);
      for (let k = 0; k < n; k++) {
        const cx = x + aw * (k + 0.5), ow = aw * 0.62, top = y + h * 0.16, bot = y + h, rx = ow / 2;
        g.fillStyle = shade(a, -0.22); g.beginPath(); g.moveTo(cx - rx - 16, bot); g.lineTo(cx - rx - 16, top + rx); g.arc(cx, top + rx, rx + 16, Math.PI, 0); g.lineTo(cx + rx + 16, bot); g.closePath(); g.fill();
        const ig = g.createLinearGradient(0, top, 0, bot); ig.addColorStop(0, shade(a, -0.48)); ig.addColorStop(1, shade(a, -0.28));
        g.fillStyle = ig; g.beginPath(); g.moveTo(cx - rx, bot); g.lineTo(cx - rx, top + rx); g.arc(cx, top + rx, rx, Math.PI, 0); g.lineTo(cx + rx, bot); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(cx, top + rx, rx + 16, Math.PI * 1.02, Math.PI * 1.45); g.arc(cx, top + rx, rx + 6, Math.PI * 1.45, Math.PI * 1.02, true); g.fill();
        for (let q = 0; q < 4; q++) { g.fillStyle = q % 2 ? city.leaf[0] : city.leaf[1]; g.beginPath(); g.ellipse(cx - rx * 0.6 + q * rx * 0.42, bot - 8, rx * 0.34, h * 0.13, 0, Math.PI, 0); g.fill(); }
        g.fillStyle = shade(a, 0.12); g.fillRect(x + aw * k, y, 10, h);
      }
      g.fillStyle = shade(a, -0.12); g.fillRect(x, y, w, 16);
      g.fillStyle = shade(a, 0.15); g.fillRect(x, y + 16, w, 5);
      if (city.id === 'subway' || city.id === 'london') { graffiti(g, pick(GWORDS), x + aw * 1.0 + rnd(-40, 40), y + h * 0.82, 52, pick(GCOLS), rnd(-0.1, 0.1)); }
    }
    function paintChev(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#ffffff'; g.fillRect(x, y, w, h);
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
      g.fillStyle = '#e8323a';
      for (let k = -1; k < 3; k++) { const yy = y + h * 0.15 + k * h * 0.42; g.beginPath(); g.moveTo(x + 10, yy + h * 0.5); g.lineTo(x + w / 2, yy); g.lineTo(x + w - 10, yy + h * 0.5); g.lineTo(x + w - 10, yy + h * 0.72); g.lineTo(x + w / 2, yy + h * 0.22); g.lineTo(x + 10, yy + h * 0.72); g.closePath(); g.fill(); }
      g.restore();
      g.strokeStyle = '#b81f22'; g.lineWidth = 6; g.strokeRect(x + 3, y + 3, w - 6, h - 6);
    }
    function patch() {
      const c = cv(128, 128), g = c.getContext('2d');
      g.fillStyle = '#2f6fd9'; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k * TAU / 14, rr2 = k % 2 ? 50 : 60; g.lineTo(64 + Math.cos(a) * rr2, 64 + Math.sin(a) * rr2 * 0.8); } g.closePath(); g.fill();
      g.strokeStyle = '#12224a'; g.lineWidth = 4; g.stroke();
      graffiti(g, 'SS', 64, 66, 64, ['#fff36a', '#ff9a1a'], -0.08);
      return canvasTex(c);
    }
    function paintPlatform(g, r) {
      const [x, y, w, h] = r;
      g.fillStyle = '#d6d2c8'; g.fillRect(x, y, w, h);
      g.fillStyle = '#ffcf1f'; g.fillRect(x, y + h - 16, w, 10);
      for (let k = 0; k < w; k += 8) { g.fillStyle = '#c9a91a'; g.fillRect(x + k, y + h - 16, 2, 10); }
    }
    function paintSign(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = '#1f3f8f'; rr(g, x, y, w, h, 12); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; rr(g, x + 5, y + 5, w - 10, h - 10, 9); g.stroke();
      g.fillStyle = '#fff'; g.font = `900 ${city.name.length > 10 ? 30 : 38}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(city.name.toUpperCase(), x + w / 2, y + h / 2 + 2);
    }
    function paintNeon(g, r, city) {
      const [x, y, w, h] = r;
      g.fillStyle = '#2a2236'; g.fillRect(x, y, w, h);
      const c = city.id === 'tokyo' ? ['#ff4fa3', '#3ad1ff'] : city.id === 'neworleans' ? ['#ff9a2a', '#b45cff'] : ['#ffd23f', '#ff5a3a'];
      g.shadowColor = c[0]; g.shadowBlur = 14; g.fillStyle = c[0]; g.font = `900 52px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const t = city.id === 'tokyo' ? ['ラ', 'ー', 'メ'] : city.id === 'neworleans' ? ['J', 'A', 'Z'] : ['B', 'A', 'R'];
      t.forEach((s, k) => g.fillText(s, x + w / 2, y + 48 + k * 78));
      g.shadowBlur = 0; g.strokeStyle = c[1]; g.lineWidth = 6; g.strokeRect(x + 6, y + 6, w - 12, h - 12);
    }

    function track(city) {
      const W = 512, H = 512, c = cv(W, H), g = c.getContext('2d');
      g.fillStyle = city.gravel[0]; g.fillRect(0, 0, W, H);
      noise(g, 0, 0, W, H, 9000, 0.35, [city.gravel[1], shade(city.gravel[0], 0.25), shade(city.gravel[1], -0.3)]);
      const lw = W / 3.6;
      for (let l = 0; l < 3; l++) {
        const cx = W * (l + 0.5) / 3;
        g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(cx - lw * 0.5, 0, lw, H);
        for (let k = 0; k < 5; k++) {
          const yy = k * H / 5 + 8;
          g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx - lw * 0.62, yy + 6, lw * 1.24, 40);
          g.fillStyle = city.sleeper; g.fillRect(cx - lw * 0.62, yy, lw * 1.24, 38);
          g.fillStyle = shade(city.sleeper, 0.18); g.fillRect(cx - lw * 0.62, yy, lw * 1.24, 8);
          g.fillStyle = shade(city.sleeper, -0.25); for (let q = 0; q < 4; q++) g.fillRect(cx - lw * 0.55 + q * lw * 0.3, yy + 14 + q % 2 * 8, lw * 0.18, 2);
        }
      }
      const t = canvasTex(c, true);
      t.wrapS = THREE.ClampToEdgeWrapping;
      return t;
    }
    function fence() {
      const c = cv(128, 128), g = c.getContext('2d');
      g.strokeStyle = 'rgba(200,205,212,.95)'; g.lineWidth = 3;
      for (let i = -128; i < 256; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); }
      g.fillStyle = '#8f949c'; g.fillRect(0, 0, 128, 6); g.fillRect(0, 122, 128, 6);
      const t = canvasTex(c, true); return t;
    }
    function sky(city) {
      const c = cv(4, 256), g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, city.sky[0]); gr.addColorStop(0.55, city.sky[1]); gr.addColorStop(1, city.sky[2]);
      g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
      return canvasTex(c);
    }
    function skyline(city) {
      const W = 2048, H = 512, c = cv(W, H), g = c.getContext('2d');
      const far = shade(city.fog, -0.12), mid = shade(city.fog, -0.22);
      for (let k = 0; k < 7; k++) {
        const cx = rnd(0, W), cy = rnd(40, 200), s = rnd(40, 90);
        g.fillStyle = 'rgba(255,255,255,.75)';
        for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(cx + (q - 2) * s * 0.55, cy + Math.abs(q - 2) * s * 0.12, s * (q === 2 ? 0.6 : 0.42), 0, TAU); g.fill(); }
      }
      g.fillStyle = far;
      for (let x = 0; x < W;) { const bw = rnd(40, 110), bh = rnd(60, 190); g.fillRect(x, H - bh, bw, bh); x += bw + rnd(0, 10); }
      const L = city.id;
      g.fillStyle = mid;
      const cx = W / 2;
      if (L === 'paris') { g.beginPath(); g.moveTo(cx - 110, H); g.quadraticCurveTo(cx - 30, H - 160, cx - 8, H - 400); g.lineTo(cx + 8, H - 400); g.quadraticCurveTo(cx + 30, H - 160, cx + 110, H); g.closePath(); g.fill(); g.fillStyle = city.fog; g.beginPath(); g.ellipse(cx, H, 60, 70, 0, Math.PI, 0); g.fill(); g.fillStyle = mid; g.fillRect(cx - 70, H - 150, 140, 10); g.fillRect(cx - 40, H - 270, 80, 8); g.fillRect(cx - 2, H - 440, 4, 44); }
      else if (L === 'rio') { g.beginPath(); g.moveTo(cx - 600, H); g.quadraticCurveTo(cx - 300, H - 380, cx, H - 300); g.quadraticCurveTo(cx + 250, H - 200, cx + 500, H); g.fill(); g.fillRect(cx - 6, H - 372, 12, 74); g.fillRect(cx - 46, H - 352, 92, 10); g.beginPath(); g.arc(cx, H - 380, 9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(cx + 560, H); g.quadraticCurveTo(cx + 640, H - 330, cx + 720, H); g.fill(); }
      else if (L === 'rome') { g.fillRect(cx - 230, H - 200, 460, 200); g.fillStyle = city.fog; for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(cx - 200 + k * 50, H - 160 + r * 60, 15, 22, 0, 0, TAU); g.fill(); } g.fillStyle = mid; g.beginPath(); g.moveTo(cx + 230, H - 200); g.lineTo(cx + 230, H - 120); g.lineTo(cx + 170, H - 230); g.fill(); g.beginPath(); g.arc(cx + 520, H - 140, 90, Math.PI, 0); g.fill(); g.fillRect(cx + 430, H - 140, 180, 140); }
      else if (L === 'london') { g.fillRect(cx - 34, H - 380, 68, 380); g.beginPath(); g.moveTo(cx - 40, H - 380); g.lineTo(cx, H - 470); g.lineTo(cx + 40, H - 380); g.fill(); g.fillStyle = city.fog; g.beginPath(); g.arc(cx, H - 330, 24, 0, TAU); g.fill(); g.fillStyle = mid; g.fillRect(cx - 2, H - 346, 4, 18); g.fillRect(cx - 500, H - 180, 380, 180); g.lineWidth = 10; g.strokeStyle = mid; g.beginPath(); g.arc(cx + 420, H - 190, 160, 0, TAU); g.stroke(); for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(cx + 420, H - 190); g.lineTo(cx + 420 + Math.cos(k * TAU / 12) * 160, H - 190 + Math.sin(k * TAU / 12) * 160); g.lineWidth = 3; g.stroke(); } }
      else if (L === 'tokyo') { g.fillStyle = shade(city.fog, -0.05); g.beginPath(); g.moveTo(cx - 700, H); g.lineTo(cx - 350, H - 300); g.lineTo(cx - 300, H - 310); g.lineTo(cx, H); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - 410, H - 240); g.lineTo(cx - 350, H - 300); g.lineTo(cx - 300, H - 310); g.lineTo(cx - 250, H - 250); g.lineTo(cx - 330, H - 270); g.fill(); g.fillStyle = '#e8606a'; g.beginPath(); g.moveTo(cx + 200, H); g.lineTo(cx + 250, H - 420); g.lineTo(cx + 300, H); g.fill(); g.fillStyle = '#fff'; g.fillRect(cx + 228, H - 260, 44, 10); g.fillRect(cx + 238, H - 360, 24, 8); }
      else if (L === 'cairo') { for (const [px, ph] of [[cx - 380, 300], [cx - 60, 380], [cx + 260, 260]]) { g.fillStyle = mid; g.beginPath(); g.moveTo(px - ph, H); g.lineTo(px, H - ph); g.lineTo(px + ph, H); g.fill(); g.fillStyle = shade(city.fog, -0.3); g.beginPath(); g.moveTo(px, H - ph); g.lineTo(px + ph, H); g.lineTo(px + ph * 0.3, H); g.fill(); } }
      else if (L === 'neworleans') { g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(cx + 300, 150, 80, 0, TAU); g.fill(); g.fillStyle = mid; for (let k = 0; k < 5; k++) { const bx = cx - 600 + k * 260; g.fillRect(bx, H - 220, 160, 220); g.beginPath(); g.moveTo(bx - 10, H - 220); g.lineTo(bx + 80, H - 290); g.lineTo(bx + 170, H - 220); g.fill(); } g.fillRect(cx - 40, H - 330, 80, 330); g.beginPath(); g.moveTo(cx - 40, H - 330); g.lineTo(cx, H - 430); g.lineTo(cx + 40, H - 330); g.fill(); }
      else { for (let k = 0; k < 9; k++) { const bx = cx - 520 + k * 120, bh = 220 + hash(k) * 200; g.fillRect(bx, H - bh, 90, bh); if (k === 4) { g.fillRect(bx + 35, H - bh - 80, 20, 80); g.beginPath(); g.moveTo(bx + 30, H - bh - 80); g.lineTo(bx + 45, H - bh - 150); g.lineTo(bx + 60, H - bh - 80); g.fill(); } } g.fillStyle = shade(city.fog, -0.18); g.fillRect(0, H - 60, W, 60); }
      g.fillStyle = shade(city.fog, -0.16);
      for (let x = 0; x < W;) { const bw = rnd(50, 130), bh = rnd(30, 110); g.fillRect(x, H - bh, bw, bh); x += bw + rnd(0, 20); }
      const t = canvasTex(c);
      return t;
    }
    function coin() {
      const c = cv(128, 128), g = c.getContext('2d');
      const gr = g.createRadialGradient(50, 44, 6, 64, 64, 64); gr.addColorStop(0, '#fff6b0'); gr.addColorStop(0.6, '#ffcc1a'); gr.addColorStop(1, '#d48a00');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = '#b87400'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 44, 0, TAU); g.stroke();
      g.strokeStyle = '#fff2a0'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 50, 0, TAU); g.stroke();
      g.fillStyle = '#e09a00'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 13 : 30; g.lineTo(64 + Math.cos(a) * rr2, 64 + Math.sin(a) * rr2); }
      g.closePath(); g.fill();
      g.fillStyle = '#fff3a8'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 10 : 25; g.lineTo(62 + Math.cos(a) * rr2, 62 + Math.sin(a) * rr2); }
      g.closePath(); g.fill();
      return canvasTex(c);
    }
    function blob() {
      const c = cv(64, 64), g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return canvasTex(c);
    }
    function glow(col) {
      const c = cv(64, 64), g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return canvasTex(c);
    }
    function label(text, fg, bg, w = 128, h = 64, size = 44) {
      const c = cv(w, h), g = c.getContext('2d');
      if (bg) { g.fillStyle = bg; rr(g, 2, 2, w - 4, h - 4, 14); g.fill(); }
      g.font = `900 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = 8; g.strokeStyle = '#3a2a00'; g.strokeText(text, w / 2, h / 2 + 2); g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 2);
      return canvasTex(c);
    }
    function toon() {
      const c = cv(4, 1), g = c.getContext('2d');
      ['#7a7a7a', '#b4b4b4', '#e6e6e6', '#ffffff'].forEach((v, i) => { g.fillStyle = v; g.fillRect(i, 0, 1, 1); });
      const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
      return t;
    }
    return { atlas, track, fence, sky, skyline, coin, blob, glow, label, toon, patch };
  }

  const FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
  function mkGB(THREE, white) {
    const tc = new THREE.Color();
    return function GB() {
      const P = [], N = [], C = [], U = [];
      const api = {
        add(geo, color, map, opt) {
          const g = geo.index ? geo.toNonIndexed() : geo;
          if (g !== geo) geo.dispose();
          const pa = g.attributes.position.array, na = g.attributes.normal.array, ua = g.attributes.uv ? g.attributes.uv.array : null;
          const cnt = pa.length / 3;
          let y0 = 1e9, y1 = -1e9;
          for (let i = 0; i < cnt; i++) { const y = pa[i * 3 + 1]; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          const grad = !(opt && opt.flat) && y1 - y0 > 0.35, ih = 1 / Math.max(1e-4, y1 - y0);
          const box = cnt === 36 && map && !Array.isArray(map);
          for (let i = 0; i < cnt; i++) {
            const ny = na[i * 3 + 1];
            let rect = null, col = color;
            if (map) {
              if (Array.isArray(map)) rect = map;
              else if (box) { const e = map[FACES[(i / 6) | 0]]; if (e) { if (typeof e[0] === 'number') rect = e; else { rect = e[0]; if (e[1]) col = e[1]; } } }
            }
            tc.set(col); tc.convertSRGBToLinear();
            let f = ny < -0.5 ? 0.6 : ny > 0.5 ? 1.0 : 0.9;
            if (grad && !rect) f *= 0.74 + 0.26 * (pa[i * 3 + 1] - y0) * ih;
            if (opt && opt.k) f *= opt.k;
            P.push(pa[i * 3], pa[i * 3 + 1], pa[i * 3 + 2]); N.push(na[i * 3], ny, na[i * 3 + 2]);
            C.push(tc.r * f, tc.g * f, tc.b * f);
            if (rect && ua) U.push(rect[0] + ua[i * 2] * (rect[2] - rect[0]), rect[1] + ua[i * 2 + 1] * (rect[3] - rect[1]));
            else U.push(white[0], white[1]);
          }
          g.dispose();
          return api;
        },
        box(w, h, d, x, y, z, color, map, rot, opt) {
          const g = new THREE.BoxGeometry(w, h, d);
          if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
          g.translate(x, y, z);
          return api.add(g, color, map, opt);
        },
        cyl(rt, rb, h, seg, x, y, z, color, rot, opt) {
          const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, false);
          if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
          g.translate(x, y, z);
          return api.add(g, color, null, opt);
        },
        ball(r, x, y, z, color, sx, sy, sz, det) {
          const g = new THREE.IcosahedronGeometry(r, det == null ? 1 : det);
          g.scale(sx || 1, sy || 1, sz || 1); g.translate(x, y, z);
          return api.add(g, color, null, { flat: true });
        },
        quad(a, b, c, d, color, rect, opt) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
          g.computeVertexNormals();
          return api.add(g, color, rect, Object.assign({ flat: true }, opt || {}));
        },
        tri(a, b, c, color) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1], 2));
          g.computeVertexNormals();
          return api.add(g, color, null, { flat: true });
        },
        get size() { return P.length / 3; },
        build() {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
          g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
          g.computeBoundingSphere();
          return g;
        }
      };
      return api;
    };
  }

  function mkWorld(THREE, AT, city) {
    const { R, uv } = AT;
    const wuv = uv(R.white, 0.5, 0.5, 0.5, 0.5);
    const GB = mkGB(THREE, [wuv[0], wuv[1]]);
    const out = { bin: [] };
    const fin = b => { const g = b.build(); out.bin.push(g); return g; };
    const C = CFG, TW = C.THW * 2, BODY0 = 0.45, RB = 0.5, BODYH = C.ROOF - RB - BODY0;

    function car(liv, kind) {
      const b = GB(), L = C.CAR, zc = -L / 2;
      const side = uv(R.liv[liv]);
      const faceN = kind === 'front' ? uv(R.front[liv]) : kind === 'lit' ? uv(R.frontLit[liv]) : uv(R.ends[liv]);
      b.box(TW, BODYH, L - 0.1, 0, BODY0 + BODYH / 2, zc, '#ffffff', { px: side, nx: side, pz: faceN, nz: uv(R.ends[liv]), py: [null, '#b9bec6'] });
      const lv = city.trains[liv], roofC = lv[2] === 'low' ? shade(lv[1], 0.08) : shade(lv[0], 0.12);
      { const g = new THREE.CylinderGeometry(TW / 2, TW / 2, L - 0.1, 18, 1, false, -Math.PI / 2, Math.PI); g.rotateX(-Math.PI / 2); g.scale(1, RB / (TW / 2), 1); g.translate(0, C.ROOF - RB, zc); b.add(g, roofC, null, { flat: true }); }
      b.box(TW + 0.04, 0.08, L - 0.06, 0, C.ROOF - RB, zc, shade(lv[0], -0.35));
      b.box(0.9, 0.16, 2.0, 0, C.ROOF + 0.02, zc - L * 0.28, '#8f959e');
      b.box(0.9, 0.16, 2.0, 0, C.ROOF + 0.02, zc + L * 0.28, '#8f959e');
      b.box(TW - 0.5, 0.32, L - 1.6, 0, 0.3, zc, '#2c2d35');
      for (const zz of [-1.6, -L + 1.6]) {
        b.box(1.9, 0.34, 2.4, 0, 0.3, zz, '#3a3b44');
        for (const dz of [-0.75, 0.75]) for (const sx of [-1, 1]) b.cyl(0.3, 0.3, 0.12, 10, sx * 0.86, 0.32, zz + dz, '#1f2026', [0, 0, Math.PI / 2]);
      }
      if (kind !== 'mid') {
        b.box(TW - 0.2, 0.22, 0.24, 0, 0.55, -0.02, '#2a2a33');
        b.box(0.5, 0.18, 0.4, 0, 0.36, 0.1, '#55575f');
      } else b.box(1.0, 1.9, 0.5, 0, 1.5, 0.2, '#30323a');
      return fin(b);
    }
    out.car = { front: [], lit: [], mid: [] };
    for (let i = 0; i < city.trains.length; i++) { out.car.front.push(car(i, 'front')); out.car.lit.push(car(i, 'lit')); out.car.mid.push(car(i, 'mid')); }

    {
      const b = GB(), L = C.RAMP, w = 2.2, top = C.ROOF + 0.02, r = uv(R.ramp), sd = uv(R.rampSide);
      b.quad([-w / 2, 0.04, 0], [w / 2, 0.04, 0], [w / 2, top, -L], [-w / 2, top, -L], '#ffffff', r);
      for (const s of [-1, 1]) {
        const x = s * w / 2;
        if (s > 0) b.quad([x, 0, 0], [x, 0, -L], [x, top, -L], [x, 0.04, 0], '#8b8f98');
        else b.quad([x, 0, -L], [x, 0, 0], [x, 0.04, 0], [x, top, -L], '#8b8f98');
        b.box(0.12, 0.12, Math.hypot(L, top), x, top / 2 + 0.06, -L / 2, '#ffcf1f', null, [Math.atan2(top, L), 0, 0]);
        for (let k = 1; k < 4; k++) { const z = -L * k / 4, hh = top * k / 4; b.box(0.14, hh, 0.14, x * 0.9, hh / 2, z, '#6b6f78'); }
      }
      b.quad([-w / 2, 0, -L], [w / 2, 0, -L], [w / 2, top, -L], [-w / 2, top, -L], '#55585f');
      b.box(w + 0.1, 0.1, 0.3, 0, 0.05, -0.1, '#26222e');
      out.ramp = fin(b);
    }
    {
      const b = GB(), lw = 2.1, st = uv(R.low), ch = uv(R.chev);
      for (const sg of [-1, 1]) {
        b.box(0.1, 0.98, 0.1, sg * (lw / 2 - 0.08), 0.52, 0, '#f2f2f2');
        b.box(0.12, 0.42, 0.1, sg * (lw / 2 - 0.08), 0.21, 0.24, '#d6d9de', null, [0.7, 0, 0]);
      }
      b.box(lw + 0.3, 0.08, 0.9, 0, 0.04, 0.05, '#5fb4ec');
      b.box(lw + 0.2, 0.05, 0.8, 0, 0.09, 0.05, '#bfe4fb');
      b.box(lw, 0.34, 0.09, 0, 0.82, 0, '#ffffff', { pz: st, nz: st });
      b.box(lw * 0.82, 0.42, 0.06, 0, 0.42, 0, '#ffffff', { pz: ch, nz: ch });
      out.low = fin(b);
    }
    {
      const b = GB(), lw = 2.2, st = uv(R.low), ch = uv(R.chev);
      for (const sg of [-1, 1]) {
        b.box(0.14, C.HIGH_T, 0.14, sg * (lw / 2 - 0.02), C.HIGH_T / 2, 0, '#f2f2f2');
        b.box(0.5, 0.1, 0.6, sg * (lw / 2), 0.05, 0, '#5fb4ec');
      }
      b.box(lw, 0.42, 0.12, 0, C.HIGH_B + 0.28, 0, '#ffffff', { pz: st, nz: st });
      b.box(lw * 0.9, 0.8, 0.08, 0, C.HIGH_B + 0.9, 0, '#ffffff', { pz: ch, nz: ch });
      b.box(lw, 0.42, 0.12, 0, C.HIGH_T - 0.28, 0, '#ffffff', { pz: st, nz: st });
      out.high = fin(b);
      const lb = GB();
      for (const sx of [-1, 1]) for (const yy of [C.HIGH_B + 0.28, C.HIGH_T - 0.28]) lb.ball(0.16, sx * (lw / 2 + 0.05), yy, 0.02, '#3fa0ff', 1, 1, 0.8);
      out.highLamp = fin(lb);
    }
    {
      const b = GB(), wy = 7.6;
      for (let l = 0; l < 3; l++) { b.box(0.04, 0.04, C.CHUNK, LX(l), wy, -C.CHUNK / 2, '#2a2a30'); b.box(0.03, 0.03, C.CHUNK, LX(l), wy + 0.55, -C.CHUNK / 2, '#2a2a30'); }
      for (const z of [-10, -30]) {
        b.box(9.6, 0.05, 0.05, 0, wy + 0.85, z, '#2a2a30');
        for (let l = 0; l < 3; l++) b.box(0.03, 0.55, 0.03, LX(l), wy + 0.28, z, '#2a2a30');
      }
      for (const sg of [-1, 1]) { b.box(0.22, wy + 1.2, 0.22, sg * 5.0, (wy + 1.2) / 2, -10, '#5a5f6a'); b.box(0.22, wy + 1.2, 0.22, sg * 5.0, (wy + 1.2) / 2, -30, '#5a5f6a'); }
      out.wires = fin(b);
    }

    const T = city.tree;
    const lift = (b, dy) => ({ box: (w, h, d, x, y, z, ...q) => b.box(w, h, d, x, y + dy, z, ...q), cyl: (t, u, h, n, x, y, z, ...q) => b.cyl(t, u, h, n, x, y + dy, z, ...q), ball: (r, x, y, z, ...q) => b.ball(r, x, y + dy, z, ...q), add: (g, ...q) => { g.translate(0, dy, 0); return b.add(g, ...q); } });
    function signal(b, x, z) {
      const su = uv(R.sig);
      b.box(0.14, 4.4, 0.14, x, 2.2, z, '#ffffff', { px: su, nx: su, pz: su, nz: su });
      b.box(0.5, 0.12, 0.5, x, 0.06, z, '#4a4e58');
      b.box(0.5, 1.0, 0.36, x, 4.7, z, '#e8323a');
      b.box(0.58, 0.08, 0.42, x, 5.22, z, '#b81f22');
      b.box(0.26, 0.26, 0.04, x, 4.92, z + 0.19, '#5aff7a', null, null, { k: 1.4 }); b.box(0.26, 0.26, 0.04, x, 4.5, z + 0.19, '#5a1414');
    }
    function tree(b, x, z, s) {
      s = s || 1;
      const L = city.leaf;
      if (T === 'palm') {
        let px = x, py = 0;
        const lean = rnd(-0.2, 0.2);
        for (let k = 0; k < 5; k++) { b.cyl(0.16 * s, 0.2 * s, 1.5 * s, 6, px, py + 0.75 * s, z, '#8a6a44', [0, 0, lean * k * 0.3]); px -= Math.sin(lean * k * 0.3) * 1.5 * s; py += 1.45 * s; }
        for (let k = 0; k < 7; k++) {
          const a = k * TAU / 7;
          const g = new THREE.BoxGeometry(2.6 * s, 0.06, 0.6 * s); g.translate(1.3 * s, 0, 0); g.rotateZ(-0.45); g.rotateY(a); g.translate(px, py, z);
          b.add(g, k % 2 ? L[0] : L[1], null, { flat: true });
        }
        b.ball(0.35 * s, px, py, z, '#6b4a2a');
      } else if (T === 'cypress') {
        b.cyl(0.12, 0.16, 1, 5, x, 0.5, z, '#6b4a2a');
        b.cyl(0.12 * s, 0.75 * s, 5.5 * s, 7, x, 1 + 2.75 * s, z, L[0]);
        b.cyl(0.5 * s, 0.7 * s, 1.6 * s, 7, x, 1.4 + 0.8 * s, z, L[1]);
      } else if (T === 'bare') {
        b.cyl(0.14, 0.24, 3.4 * s, 6, x, 1.7 * s, z, L[0]);
        for (let k = 0; k < 5; k++) { const a = k * 1.3, h = 2 + k * 0.4; const g = new THREE.CylinderGeometry(0.04, 0.09, 1.8 * s, 4); g.translate(0, 0.9 * s, 0); g.rotateZ(0.8); g.rotateY(a); g.translate(x, h * s, z); b.add(g, L[1]); }
      } else {
        b.cyl(0.14 * s, 0.2 * s, 2.2 * s, 6, x, 1.1 * s, z, '#7a5434');
        const lc = T === 'blossom' ? ['#ffb3d1', '#f28ab4', '#ffd6e6'] : [L[0], L[1], shade(L[0], 0.15)];
        b.ball(1.3 * s, x, 2.9 * s, z, lc[0]);
        b.ball(0.95 * s, x + 0.7 * s, 2.4 * s, z + 0.4 * s, lc[1]);
        b.ball(0.9 * s, x - 0.6 * s, 3.4 * s, z - 0.3 * s, lc[2]);
      }
    }
    function bush(b, x, z) { const c = T === 'blossom' ? '#ff9ac4' : city.leaf[0]; b.ball(0.8, x, 0.45, z, c, 1.2, 0.7, 1.1); b.ball(0.6, x + 0.6, 0.4, z + 0.5, shade(c, -0.12), 1, 0.8, 1); }
    function prop(b, sg, x, z) {
      const P = city.props;
      if (P === 'pumpkin') { b.ball(0.42, x, 0.36, z, '#ff7a1a', 1.2, 0.85, 1.2); b.box(0.08, 0.2, 0.08, x, 0.78, z, '#3a7a2a'); b.box(0.36, 0.1, 0.02, x, 0.36, z + sg * 0, '#3a1a0a'); }
      else if (P === 'london') { b.box(0.9, 2.4, 0.9, x, 1.2, z, '#d8282c'); b.box(0.92, 0.2, 0.92, x, 2.45, z, '#b81f22'); b.box(0.02, 1.2, 0.6, x - sg * 0.46, 1.4, z, '#bfe0f0'); }
      else if (P === 'tokyo') { b.cyl(0.06, 0.06, 3, 5, x, 1.5, z, '#3a3a40'); b.ball(0.32, x, 2.6, z, '#e8323a', 1, 1.3, 1); b.ball(0.32, x, 1.9, z, '#ffd23f', 1, 1.3, 1); }
      else if (P === 'paris') { b.cyl(0.07, 0.1, 3.6, 6, x, 1.8, z, '#2f4a3a'); b.box(0.36, 0.5, 0.36, x, 3.8, z, '#2f4a3a'); b.box(0.26, 0.34, 0.26, x, 3.78, z, '#fff3b0'); }
      else if (P === 'rome') { b.cyl(0.35, 0.4, 2.6, 10, x, 1.3, z, '#efe2c4'); b.box(0.9, 0.25, 0.9, x, 2.7, z, '#e2d4b4'); }
      else if (P === 'cairo') { b.box(0.7, 0.4, 0.7, x, 0.2, z, '#cdb07a'); b.cyl(0.12, 0.32, 4, 4, x, 2.4, z, '#e6c48a', [0, Math.PI / 4, 0]); }
      else if (P === 'beach') { b.cyl(0.05, 0.05, 2.4, 5, x, 1.2, z, '#eee'); b.cyl(0.05, 1.3, 0.5, 8, x, 2.5, z, pick(['#ff5a7a', '#ffd23f', '#3ad1ff'])); }
      else { b.box(0.36, 0.7, 0.36, x, 0.35, z, '#e8323a'); b.box(0.5, 0.12, 0.2, x, 0.5, z, '#c42a2a'); }
    }
    function lamp(b, sg, x, z) {
      b.cyl(0.07, 0.09, 4.6, 6, x, 2.3, z, '#4a4e58');
      b.box(1.1, 0.08, 0.08, x - sg * 0.5, 4.55, z, '#4a4e58');
      b.box(0.4, 0.14, 0.24, x - sg * 1.0, 4.48, z, '#fff3c4');
    }
    function pole(b, sg, x, z) {
      b.cyl(0.13, 0.17, 7.5, 6, x, 3.75, z, '#7a5a3c');
      b.box(0.12, 0.12, 1.8, x, 7.0, z, '#6a4a2c', null, [0, 0, 0]);
      b.box(1.6, 0.1, 0.1, x, 6.6, z, '#6a4a2c');
      for (const d of [-0.6, 0.6]) b.box(0.08, 0.16, 0.08, x + d, 6.72, z, '#d9dde6');
    }
    function building(b, sg, x0, z0, len, h, k) {
      const dep = 9, fr = R.fac[k % R.fac.length], cx = sg * (x0 + dep / 2), cz = z0 - len / 2;
      const crop = Math.min(1, h / 15);
      const fu = uv(fr, 0, 1 - crop, 1, 1);
      const col = city.bld[k % city.bld.length];
      const m = sg < 0 ? { px: fu, pz: fu, nz: fu, py: [null, col[1]] } : { nx: fu, pz: fu, nz: fu, py: [null, col[1]] };
      b.box(dep, h, len, cx, h / 2, cz, '#ffffff', m);
      const st = city.roof, rc = col[1];
      if (st === 'mansard' || st === 'tile') {
        const rh = st === 'mansard' ? 2.6 : 2.0, ins = st === 'mansard' ? 1.0 : dep / 2 - 0.2, c2 = st === 'mansard' ? '#5d6b80' : '#c4553a';
        const xa = cx - dep / 2, xb = cx + dep / 2, za = cz + len / 2, zb = cz - len / 2, y = h, y2 = h + rh;
        const ia = xa + ins, ib = xb - ins, ja = za - Math.min(ins, len / 2 - 0.2), jb = zb + Math.min(ins, len / 2 - 0.2);
        b.quad([xa, y, za], [xb, y, za], [ib, y2, ja], [ia, y2, ja], c2);
        b.quad([xb, y, zb], [xa, y, zb], [ia, y2, jb], [ib, y2, jb], c2);
        b.quad([xb, y, za], [xb, y, zb], [ib, y2, jb], [ib, y2, ja], c2);
        b.quad([xa, y, zb], [xa, y, za], [ia, y2, ja], [ia, y2, jb], c2);
        if (st === 'mansard') { b.quad([ia, y2, ja], [ib, y2, ja], [ib, y2, jb], [ia, y2, jb], '#4a5568'); for (let q = 0; q < Math.floor(len / 3); q++) b.box(0.9, 1.1, 0.9, sg < 0 ? xb - 0.6 : xa + 0.6, h + 1.0, za - 1.5 - q * 3, '#e9e4d8'); }
      } else {
        b.box(dep, 0.5, 0.3, cx, h + 0.25, cz + len / 2 - 0.15, rc);
        b.box(dep, 0.5, 0.3, cx, h + 0.25, cz - len / 2 + 0.15, rc);
        b.box(0.3, 0.5, len, cx - sg * (dep / 2 - 0.15), h + 0.25, cz, rc);
        if (st === 'chimney') for (let q = 0; q < 2; q++) { b.box(0.8, 1.6, 0.8, cx + rnd(-2, 2), h + 0.8, cz + rnd(-len / 3, len / 3), '#8a4a3a'); }
        if (city.props === 'city' && chance(0.45)) {
          const tx = cx + rnd(-1.5, 1.5), tz = cz + rnd(-len / 4, len / 4);
          for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.box(0.12, 1.6, 0.12, tx + dx, h + 0.8, tz + dz, '#4a3a30');
          b.cyl(1.2, 1.2, 2.2, 10, tx, h + 2.7, tz, '#9a6a44');
          b.cyl(0.05, 1.35, 0.9, 10, tx, h + 4.25, tz, '#6a4a34');
        }
        if (chance(0.5)) b.box(1.4, 0.8, 1.2, cx + rnd(-2, 2), h + 0.4, cz + rnd(-len / 3, len / 3), '#a9adb5');
      }
      if (st === 'flat' && city.style === 'modern' && chance(0.6)) {
        b.box(0.2, 3.2, 1.6, sg * (x0 - 0.15), h * 0.55, cz + rnd(-len / 4, len / 4), '#ffffff', sg < 0 ? { px: uv(R.neon), nx: uv(R.neon) } : { nx: uv(R.neon), px: uv(R.neon) });
      }
    }
    function buildingRow(b, sg, x0) {
      let z = 0;
      let k = rint(0, 9);
      while (z > -C.CHUNK) {
        const len = Math.min(rnd(7, 13), C.CHUNK + z);
        if (len < 3) break;
        const h = city.style === 'modern' ? rnd(12, 26) : city.style === 'favela' ? rnd(5, 9) : rnd(8, 17);
        building(b, sg, x0 + (city.style === 'favela' ? rnd(0, 3) : rnd(0, 1.2)), z, len, h, k++);
        if (city.style === 'favela') building(b, sg, x0 + 7, z - 1, len, h + rnd(2, 5), k++);
        z -= len + (chance(0.3) ? rnd(1, 3) : 0);
      }
    }
    function ground(b, sg, x1) {
      b.box(1.7, 0.1, C.CHUNK, sg * (3.75 + 0.85), -0.03, -C.CHUNK / 2, city.side);
      b.box(x1 - 5.45, 0.14, C.CHUNK, sg * (5.45 + (x1 - 5.45) / 2), 0.0, -C.CHUNK / 2, city.walk);
      b.box(60, 0.1, C.CHUNK, sg * (x1 + 30), -0.02, -C.CHUNK / 2, shade(city.walk, -0.08));
    }

    function sideChunk(sg, kind) {
      const b = GB(), f = GB();
      const fence = (x, h, z0, z1) => {
        const r = [0, 0, Math.abs(z1 - z0) / 2.5, h / 2.5];
        const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), h); g.rotateY(Math.PI / 2); g.translate(x, h / 2 + 0.2, (z0 + z1) / 2);
        const ua = g.attributes.uv.array; for (let i = 0; i < ua.length; i += 2) { ua[i] *= r[2]; ua[i + 1] *= r[3]; }
        f.add(g, '#ffffff', [0, 0, 1, 1], { flat: true });
      };
      ground(b, sg, 9.5);
      if (kind < 4 && hash(sg * 3.1 + kind * 7.7 + city.light * 11) < 0.6) { const z = -rnd(6, 34); signal(b, sg * 4.15, z); }
      if (kind === 0) {
        const wx = sg * 5.7;
        for (let s = 0; s < 2; s++) {
          const z0 = -s * C.CHUNK / 2, gr = uv(R.graf[(s + rint(0, 3)) % 4]);
          b.box(0.4, 2.9, C.CHUNK / 2, wx, 1.45, z0 - C.CHUNK / 4, city.wall, sg < 0 ? { px: gr } : { nx: gr });
        }
        b.box(0.6, 0.18, C.CHUNK, wx, 2.95, -C.CHUNK / 2, city.wallTop);
        for (let z = 0; z > -C.CHUNK; z -= 10) b.box(0.6, 3.0, 0.5, wx - sg * 0.05, 1.5, z - 0.25, city.wallTop);
        if (city.props === 'pumpkin') for (let z = -4; z > -C.CHUNK; z -= rnd(6, 12)) { b.ball(0.38, wx, 3.35, z, '#ff7a1a', 1.2, 0.85, 1.2); b.box(0.06, 0.16, 0.06, wx, 3.72, z, '#3a7a2a'); }
        tree(b, sg * 7.6, -rnd(8, 14), rnd(0.9, 1.2)); tree(b, sg * 7.8, -rnd(26, 34), rnd(0.9, 1.2));
        buildingRow(b, sg, 10);
      } else if (kind === 1) {
        const fx = sg * 5.6;
        b.box(0.3, 0.3, C.CHUNK, fx, 0.15, -C.CHUNK / 2, '#a9a9a9');
        for (let z = 0; z >= -C.CHUNK; z -= 5) { b.cyl(0.07, 0.07, 2.7, 6, fx, 1.35, z, '#8f949c'); }
        b.box(0.08, 0.08, C.CHUNK, fx, 2.6, -C.CHUNK / 2, '#8f949c');
        fence(fx, 2.4, 0, -C.CHUNK);
        for (let z = -3; z > -C.CHUNK; z -= rnd(6, 10)) { if (chance(0.55)) tree(b, sg * rnd(6.8, 8.4), z, rnd(0.8, 1.15)); else bush(b, sg * rnd(6.5, 8), z); }
        prop(b, sg, sg * 8.7, -rnd(5, 35));
        buildingRow(b, sg, 10.5);
      } else if (kind === 2) {
        const px0 = 4.05, px1 = 10, ph = 1.15, cx = sg * (px0 + px1) / 2;
        b.box(px1 - px0, ph, C.CHUNK, cx, ph / 2, -C.CHUNK / 2, '#cfcac0');
        b.box(0.5, 0.04, C.CHUNK, sg * (px0 + 0.4), ph + 0.01, -C.CHUNK / 2, '#ffcf1f');
        for (let z = -4; z > -C.CHUNK; z -= 9) {
          b.box(0.34, 3.4, 0.34, sg * 8.2, ph + 1.7, z, '#5a6170');
          b.box(1.8, 0.45, 0.6, sg * 7.4, ph + 0.42, z - 3.5, '#3f86d9');
          b.box(1.8, 0.1, 0.6, sg * 7.4, ph + 0.2, z - 3.5, '#4a4e58');
        }
        b.box(6.4, 0.25, C.CHUNK, sg * 7.4, ph + 3.5, -C.CHUNK / 2, '#e9e6de');
        b.box(6.6, 0.1, C.CHUNK, sg * 7.4, ph + 3.66, -C.CHUNK / 2, '#d8282c');
        const sgu = uv(R.sign);
        b.box(0.16, 0.9, 2.6, sg * 5.2, ph + 2.75, -C.CHUNK / 2, '#ffffff', { px: sgu, nx: sgu });
        b.box(0.05, 0.6, 0.05, sg * 5.2, ph + 3.3, -C.CHUNK / 2 - 0.8, '#3a3a40'); b.box(0.05, 0.6, 0.05, sg * 5.2, ph + 3.3, -C.CHUNK / 2 + 0.8, '#3a3a40');
        const gr = uv(R.graf[rint(0, 3)]);
        b.box(0.4, 4.6, C.CHUNK, sg * 10.2, 2.3, -C.CHUNK / 2, city.wall, sg < 0 ? { px: gr } : { nx: gr });
        buildingRow(b, sg, 10.6);
      } else if (kind === 4) {
        const wx = sg * 5.9, ah = 6.4, a = city.arch || city.wall, au = uv(R.arch);
        for (let s = 0; s < 2; s++) b.box(0.8, ah, C.CHUNK / 2, wx, ah / 2, -s * C.CHUNK / 2 - C.CHUNK / 4, a, sg < 0 ? { px: au } : { nx: au });
        for (let s = 0; s <= 6; s++) { const z = -s * C.CHUNK / 6; b.box(0.5, ah + 0.1, 0.9, wx - sg * 0.5, (ah + 0.1) / 2, z, shade(a, 0.06)); }
        b.box(1.6, 0.35, C.CHUNK, wx + sg * 0.2, ah + 0.17, -C.CHUNK / 2, shade(a, -0.1));
        for (let z = -1.5; z > -C.CHUNK; z -= rnd(2.4, 3.6)) bush(lift(b, ah + 0.2), wx + sg * rnd(0.4, 1.4), z);
        for (let z = -4; z > -C.CHUNK; z -= rnd(7, 11)) tree(lift(b, ah - 0.6), sg * rnd(8, 9.5), z, rnd(1.1, 1.5));
        buildingRow(b, sg, 12);
      } else {
        const wx = sg * 5.6;
        b.box(0.5, 1.0, C.CHUNK, wx, 0.5, -C.CHUNK / 2, city.wall);
        b.box(0.6, 0.1, C.CHUNK, wx, 1.03, -C.CHUNK / 2, city.wallTop);
        pole(b, sg, sg * 4.6, -6); pole(b, sg, sg * 4.6, -26);
        lamp(b, sg, sg * 6.4, -16); lamp(b, sg, sg * 6.4, -36);
        for (let z = -2; z > -C.CHUNK; z -= rnd(5, 9)) { if (chance(0.7)) tree(b, sg * rnd(7, 9), z, rnd(0.85, 1.25)); else prop(b, sg, sg * rnd(7, 8.5), z); }
        buildingRow(b, sg, 11);
      }
      const geo = fin(b);
      const fg = f.size ? fin(f) : null;
      return { geo, fence: fg };
    }
    out.side = { L: [], R: [] };
    for (let k = 0; k < 5; k++) for (let v = 0; v < 2; v++) { out.side.L.push(sideChunk(-1, k)); out.side.R.push(sideChunk(1, k)); }

    {
      const b = GB(), tu = uv(R.tunnel, 0, 0, 1, 1), L = C.CHUNK;
      for (const sg of [-1, 1]) {
        b.box(0.8, 6.2, L, sg * 4.55, 3.1, -L / 2, shade(city.wall, -0.45), sg < 0 ? { px: [tu, '#ffffff'] } : { nx: [tu, '#ffffff'] });
        b.box(1.7, 0.1, L, sg * (3.75 + 0.85), -0.03, -L / 2, shade(city.side, -0.3));
        for (let z = -5; z > -L; z -= 10) b.box(0.5, 6.2, 0.6, sg * 4.05, 3.1, z, shade(city.wall, -0.45));
      }
      const n = 8, r = 4.75, cy = 6.0;
      for (let k = 0; k < n; k++) {
        const a0 = Math.PI * k / n, a1 = Math.PI * (k + 1) / n, am = (a0 + a1) / 2;
        const w = 2 * r * Math.sin(Math.PI / n / 2) + 0.05;
        b.box(w, 0.6, L, Math.cos(am) * (r + 0.3), cy + Math.sin(am) * (r + 0.3), -L / 2, shade(city.wall, -0.5), null, [0, 0, am - Math.PI / 2]);
      }
      out.tunnel = fin(b);
      const lb = GB();
      for (let z = -2; z > -L; z -= 8) { lb.box(0.5, 0.12, 3.2, 0, cy + r - 0.05, z, '#fff6d6'); for (const sg of [-1, 1]) lb.box(0.1, 0.3, 1.4, sg * 4.1, 4.4, z - 4, '#ffd27a'); }
      out.tunnelLamp = fin(lb);
      const p = GB(), pu = uv(R.portal);
      p.box(9, 13, 2.0, -9.2, 6.5, -1, city.wall, { pz: pu });
      p.box(9, 13, 2.0, 9.2, 6.5, -1, city.wall, { pz: pu });
      for (let x = -4.6; x < 4.6; x += 0.46) { const xm = x + 0.23, yb = 6.0 + Math.sqrt(Math.max(0, 5.0 * 5.0 - xm * xm)); p.box(0.47, 13 - yb, 2.0, xm, (13 + yb) / 2, -1, city.wall); }
      for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9; p.box(1.6, 1.1, 2.2, Math.cos(a) * 5.3, 6.0 + Math.sin(a) * 4.9, -1, shade(city.wallTop, -0.1), null, [0, 0, a - Math.PI / 2]); }
      for (const sg of [-1, 1]) p.box(1.1, 6.2, 2.2, sg * 5.25, 3.1, -1, shade(city.wallTop, -0.1));
      p.box(28, 0.6, 2.4, 0, 13.2, -1, city.wallTop);
      out.portal = fin(p);
    }
    {
      const b = GB();
      for (const sg of [-1, 1]) { b.box(0.35, 7.2, 0.35, sg * 4.5, 3.6, 0, '#6a707c'); b.box(0.7, 0.3, 0.7, sg * 4.5, 0.15, 0, '#4a4e58'); }
      b.box(9.4, 0.4, 0.4, 0, 7.0, 0, '#6a707c');
      b.box(9.4, 0.12, 0.12, 0, 6.6, 0, '#6a707c');
      for (let l = 0; l < 3; l++) { b.box(0.6, 1.0, 0.4, LX(l), 6.3, 0.05, '#2a2a33'); }
      out.gantry = fin(b);
      const lb = GB();
      for (let l = 0; l < 3; l++) { lb.box(0.26, 0.26, 0.05, LX(l), 6.55, 0.27, l === 1 ? '#3aff6a' : '#ff4a3a'); lb.box(0.26, 0.26, 0.05, LX(l), 6.12, 0.27, '#3a3a40'); }
      out.gantryLamp = fin(lb);
    }
    {
      const b = GB();
      for (let l = 0; l < 3; l++) for (const s of [-1, 1]) {
        const x = LX(l) + s * 0.62;
        b.box(0.1, 0.14, 320, x, 0.07, -140, '#7c818b', { py: [null, '#e6e9ef'] }, null, { flat: true });
        b.box(0.18, 0.03, 320, x, 0.015, -140, '#5a5d66', null, null, { flat: true });
      }
      out.rails = fin(b);
    }
    return out;
  }

  function mkChars(THREE, toonMap, bin) {
    const mats = new Map();
    const M = (hex, o) => {
      const k = hex + (o ? JSON.stringify(o) : '');
      if (!mats.has(k)) { const m = new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(hex).convertSRGBToLinear(), gradientMap: toonMap }, o || {})); mats.set(k, m); bin.add(m); }
      return mats.get(k);
    };
    const geos = new Map();
    const G = (k, f) => { if (!geos.has(k)) { const g = f(); geos.set(k, g); bin.add(g); } return geos.get(k); };
    const rbox = (w, h, d, n) => G(`rb${w},${h},${d},${n}`, () => {
      const g = new THREE.SphereGeometry(1, 16, 12), p = g.attributes.position;
      const e = n == null ? 0.45 : n;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        p.setXYZ(i, Math.sign(x) * Math.pow(Math.abs(x), e) * w / 2, Math.sign(y) * Math.pow(Math.abs(y), e) * h / 2, Math.sign(z) * Math.pow(Math.abs(z), e) * d / 2);
      }
      g.computeVertexNormals();
      return g;
    });
    const cyl = (rt, rb, h, seg) => G(`cy${rt},${rb},${h},${seg}`, () => { const g = new THREE.CylinderGeometry(rt, rb, h, seg || 10); g.translate(0, -h / 2, 0); return g; });
    const ball = (r, s) => G(`ba${r},${s}`, () => new THREE.SphereGeometry(r, s || 12, Math.max(6, (s || 12) * 0.7 | 0)));
    const mesh = (geo, mat, x, y, z, parent, sx, sy, sz) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0);
      if (sx) m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
      if (parent) parent.add(m);
      return m;
    };
    const grp = (x, y, z, parent) => { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(g); return g; };

    function limb(parent, x, y, len1, len2, r1, r2, c1, c2, endGeo, endMat, endPos, flare) {
      const f = flare || 0.9;
      const top = grp(x, y, 0, parent);
      mesh(cyl(r1, r1 * 0.92, len1, 12), M(c1), 0, 0, 0, top);
      mesh(ball(r1 * 1.02, 12), M(c1), 0, 0, 0, top);
      const mid = grp(0, -len1, 0, top);
      mesh(ball(r1 * 0.95, 12), M(c2), 0, 0, 0, mid);
      mesh(cyl(r2 * (f > 1 ? 0.95 : 1), r2 * f, len2, 12), M(c2), 0, 0, 0, mid);
      const end = grp(0, -len2, 0, mid);
      if (endGeo) mesh(endGeo, endMat, endPos[0], endPos[1], endPos[2], end);
      return { top, mid, end };
    }

    function hero(P) {
      const root = new THREE.Group();
      const body = grp(0, 0, 0, root);
      const spin = grp(0, 0.55, 0, body);
      const pelvis = grp(0, 0.33, 0, spin);
      mesh(rbox(0.5, 0.3, 0.34, 0.75), M(P.pants), 0, 0.02, 0, pelvis);
      mesh(rbox(0.52, 0.07, 0.36, 0.8), M(shade(P.pants, -0.3)), 0, 0.14, 0, pelvis);
      const torso = grp(0, 0.06, 0, pelvis);
      mesh(rbox(0.56, 0.6, 0.38, 0.72), M(P.top), 0, 0.28, 0, torso);
      mesh(rbox(0.58, 0.12, 0.4, 0.8), M(shade(P.top, -0.12)), 0, 0.02, 0, torso);
      if (P.vest) {
        for (const sx of [-1, 1]) mesh(rbox(0.2, 0.52, 0.08, 0.75), M(P.vest), sx * 0.16, 0.29, -0.16, torso);
        mesh(rbox(0.54, 0.54, 0.08, 0.75), M(P.vest), 0, 0.29, 0.165, torso);
        for (const sx of [-1, 1]) mesh(rbox(0.08, 0.52, 0.34, 0.75), M(P.vest), sx * 0.26, 0.29, 0, torso);
      }
      mesh(rbox(0.12, 0.4, 0.05, 0.8), M(P.under), 0, 0.3, -0.18, torso);
      mesh(rbox(0.44, 0.3, 0.24, 0.8), M(P.top), 0, 0.53, 0.16, torso);
      mesh(rbox(0.3, 0.18, 0.12, 0.8), M(shade(P.top, -0.25)), 0, 0.56, 0.2, torso);
      for (const sx of [-1, 1]) mesh(cyl(0.012, 0.012, 0.16, 5), M('#ffffff'), sx * 0.06, 0.5, -0.19, torso);
      mesh(rbox(0.32, 0.14, 0.07, 0.8), M(shade(P.top, -0.08)), 0, 0.13, -0.18, torso);
      const neck = grp(0, 0.56, 0, torso);
      mesh(cyl(0.08, 0.09, 0.08, 10), M(P.skin), 0, 0.06, 0, neck);
      const head = grp(0, 0.04, 0, neck);
      head.scale.setScalar(1.22);
      mesh(rbox(0.44, 0.46, 0.42, 0.82), M(P.skin), 0, 0.22, 0, head);
      mesh(ball(0.12, 12), M(P.skin), 0, 0.12, -0.08, head, 1.4, 0.8, 1.1);
      for (const sx of [-1, 1]) {
        mesh(ball(0.065, 10), M(P.skin), sx * 0.215, 0.2, 0.02, head, 0.55, 1, 0.9);
        mesh(ball(0.06, 12), M('#ffffff'), sx * 0.085, 0.25, -0.185, head, 1, 1.3, 0.55);
        mesh(ball(0.032, 10), M('#3a2a1a'), sx * 0.085, 0.245, -0.212, head, 1, 1.2, 0.5);
        mesh(ball(0.012, 6), M('#ffffff'), sx * 0.075, 0.26, -0.225, head);
        const br = mesh(rbox(0.1, 0.028, 0.035, 0.8), M(P.hair), sx * 0.09, 0.335, -0.195, head); br.rotation.z = -sx * 0.18;
      }
      mesh(ball(0.05, 10), M(shade(P.skin, -0.06)), 0, 0.18, -0.215, head, 1, 0.9, 1);
      const mo = mesh(G('mouth', () => new THREE.TorusGeometry(0.05, 0.014, 6, 12, Math.PI)), M('#7a2a2a'), 0, 0.12, -0.2, head); mo.rotation.z = Math.PI;
      mesh(rbox(0.46, 0.26, 0.4, 0.8), M(P.hair), 0, 0.31, 0.045, head);
      for (const sx of [-1, 1]) mesh(rbox(0.06, 0.14, 0.12, 0.8), M(P.hair), sx * 0.2, 0.27, -0.06, head);
      if (P.extra === 'pony') { mesh(rbox(0.17, 0.36, 0.17, 0.8), M(P.hair), 0, 0.18, 0.27, head); }
      if (P.hood) {
        mesh(rbox(0.46, 0.2, 0.2, 0.8), M(P.hood), 0, 0.0, 0.17, head);
        mesh(rbox(0.36, 0.2, 0.2, 0.8), M(P.hood), 0, 0.5, 0.2, torso);
      }
      if (P.scarf) { mesh(rbox(0.34, 0.12, 0.14, 0.8), M(P.scarf), 0, 0.555, -0.13, torso); const sc = mesh(rbox(0.16, 0.16, 0.05, 0.6), M(P.scarf), 0, 0.47, -0.2, torso); sc.rotation.z = Math.PI / 4; }
      if (P.extra === 'phones') { const t = new THREE.Mesh(G('torus', () => new THREE.TorusGeometry(0.17, 0.035, 6, 16)), M('#2f2f3a')); t.rotation.x = Math.PI / 2; t.position.set(0, 0.0, 0); neck.add(t); for (const s of [-1, 1]) mesh(rbox(0.08, 0.12, 0.12), M('#ff4fa3'), s * 0.17, 0.0, -0.02, neck); }
      if (P.hat === 'cap') {
        const dome = G('dome', () => new THREE.SphereGeometry(0.245, 20, 10, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.33, 0.015, head, 1, 0.9, 1.05);
        const fr = mesh(rbox(0.3, 0.17, 0.08, 0.8), M(P.hatB), 0, 0.42, -0.19, head); fr.rotation.x = -0.35;
        mesh(rbox(0.1, 0.05, 0.02, 0.8), M(P.hatA), 0, 0.43, -0.235, head).rotation.x = -0.35;
        const brim = mesh(rbox(0.4, 0.04, 0.3, 0.8), M(P.hatA), 0, 0.345, -0.3, head);
        brim.rotation.x = -0.14;
        mesh(cyl(0.25, 0.25, 0.04, 20), M(shade(P.hatA, -0.2)), 0, 0.355, 0.015, head);
        mesh(ball(0.03, 8), M(P.hatA), 0, 0.555, 0.015, head);
      } else if (P.hat === 'beanie') {
        const dome = G('dome2', () => new THREE.SphereGeometry(0.24, 16, 8, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.31, 0.02, head, 1, 1.05, 1);
        mesh(cyl(0.245, 0.245, 0.09, 16), M(P.hatB), 0, 0.36, 0.02, head);
        mesh(ball(0.07, 8), M(P.hatB), 0, 0.58, 0.02, head);
      } else if (P.hat === 'alien') {
        const dome = G('dome3', () => new THREE.SphereGeometry(0.24, 16, 8, 0, TAU, 0, Math.PI / 2));
        mesh(dome, M(P.hatA), 0, 0.31, 0.02, head, 1.05, 1.0, 1.05);
        for (const s of [-1, 1]) { const a = mesh(cyl(0.015, 0.015, 0.22, 5), M(P.hatA), s * 0.1, 0.72, 0.02, head); a.rotation.z = s * 0.4; mesh(ball(0.045, 8), M(P.hatB), s * 0.19, 0.74, 0.02, head); }
      }
      const handG = ball(0.095, 12), handM = M(P.skin);
      const armR = limb(torso, 0.33, 0.47, 0.27, 0.25, 0.092, 0.085, P.top, P.top, handG, handM, [0, -0.03, 0], 1.08);
      const armL = limb(torso, -0.33, 0.47, 0.27, 0.25, 0.092, 0.085, P.top, P.top, handG, handM, [0, -0.03, 0], 1.08);
      const can = grp(0, -0.06, -0.02, armR.end);
      mesh(cyl(0.05, 0.05, 0.2, 10), M('#e8323a'), 0, 0.1, 0, can);
      mesh(cyl(0.035, 0.05, 0.04, 10), M('#d9dde6'), 0, 0.14, 0, can);
      mesh(cyl(0.012, 0.012, 0.03, 6), M('#1d1b26'), 0, 0.17, 0, can);
      can.rotation.x = Math.PI / 2;
      can.visible = false;
      const shoe = (a, b) => {
        const g = grp(0, 0, 0);
        mesh(rbox(0.22, 0.16, 0.38, 0.72), M(a), 0, -0.03, -0.07, g);
        mesh(rbox(0.24, 0.07, 0.4, 0.75), M('#ffffff'), 0, -0.11, -0.07, g);
        mesh(rbox(0.2, 0.09, 0.12, 0.8), M('#ffffff'), 0, -0.05, -0.22, g);
        mesh(rbox(0.16, 0.09, 0.14, 0.8), M(b), 0, 0.03, 0.04, g);
        for (let k = 0; k < 3; k++) mesh(rbox(0.12, 0.018, 0.025, 0.8), M('#ffffff'), 0, 0.04 - k * 0.012, -0.08 - k * 0.05, g);
        return g;
      };
      const legR = limb(pelvis, 0.13, -0.02, 0.38, 0.35, 0.13, 0.12, P.pants, P.pants, null, null, null, 1.18);
      const legL = limb(pelvis, -0.13, -0.02, 0.38, 0.35, 0.13, 0.12, P.pants, P.pants, null, null, null, 1.18);
      for (const lg of [legR, legL]) mesh(cyl(0.15, 0.15, 0.06, 12), M(shade(P.pants, 0.15)), 0, 0.05, 0, lg.end);
      legR.end.add(shoe(P.shoeA, P.shoeB)); legL.end.add(shoe(P.shoeA, P.shoeB));
      const board = grp(0, 0.06, 0, root);
      mesh(rbox(0.66, 0.08, 1.6, 0.35), M('#ff4fa3'), 0, 0, 0, board);
      mesh(rbox(0.56, 0.03, 1.42, 0.35), M('#ffd23f'), 0, 0.045, 0, board);
      mesh(rbox(0.3, 0.032, 0.5, 0.35), M('#3ad1ff'), 0, 0.05, -0.2, board);
      mesh(rbox(0.5, 0.05, 1.3, 0.4), M('#7afcff', { emissive: new THREE.Color('#3ad1ff') }), 0, -0.06, 0, board);
      board.visible = false;
      const jet = grp(0, 0.26, 0.2, torso);
      for (const s of [-1, 1]) {
        mesh(cyl(0.1, 0.1, 0.42, 12), M('#7cd23a'), s * 0.12, 0.25, 0, jet);
        mesh(ball(0.1, 10), M('#ff8a1a'), s * 0.12, 0.27, 0, jet);
        mesh(cyl(0.06, 0.09, 0.1, 10), M('#9aa0aa'), s * 0.12, -0.17, 0, jet);
        const fl = mesh(G('flame', () => { const g = new THREE.ConeGeometry(0.09, 0.5, 8); g.rotateX(Math.PI); g.translate(0, -0.25, 0); return g; }), M('#ffb31a', { emissive: new THREE.Color('#ff7a1a') }), s * 0.12, -0.27, 0, jet);
        fl.name = 'fl';
      }
      mesh(rbox(0.12, 0.3, 0.1), M('#c9ccd2'), 0, 0.12, 0, jet);
      jet.visible = false;
      const R = { root, body, spin, pelvis, torso, neck, head, armL, armR, legL, legR, board, jet, can, ph: 0, lean: 0 };
      return R;
    }

    function guard() {
      const root = new THREE.Group();
      const body = grp(0, 0, 0, root);
      const pelvis = grp(0, 0.72, 0, body);
      const ol = '#7c8a3a', ol2 = '#5f6c2c', skin = '#e8a77c';
      mesh(rbox(0.7, 0.34, 0.54, 0.78), M(ol2), 0, 0, 0, pelvis);
      mesh(rbox(0.72, 0.08, 0.56, 0.8), M('#3a2a1e'), 0, 0.14, 0, pelvis);
      mesh(rbox(0.13, 0.09, 0.04, 0.8), M('#ffd23f'), 0, 0.14, -0.28, pelvis);
      const torso = grp(0, 0.06, 0, pelvis);
      mesh(rbox(0.86, 0.72, 0.66, 0.74), M(ol), 0, 0.34, 0, torso);
      mesh(ball(0.4, 18), M(ol), 0, 0.2, -0.16, torso, 1.08, 0.95, 1);
      for (let k = 0; k < 3; k++) mesh(ball(0.03, 8), M('#ffd23f'), 0, 0.44 - k * 0.16, -0.5 + Math.abs(k - 1) * 0.05, torso);
      for (const sx of [-1, 1]) { mesh(rbox(0.2, 0.14, 0.05, 0.8), M(ol2), sx * 0.22, 0.52, -0.33, torso); mesh(rbox(0.24, 0.08, 0.26, 0.8), M(ol2), sx * 0.4, 0.68, 0, torso); }
      mesh(rbox(0.12, 0.14, 0.04, 0.8), M('#ffd23f'), -0.22, 0.42, -0.36, torso);
      mesh(rbox(0.3, 0.12, 0.08, 0.8), M('#e8d9b0'), 0, 0.7, -0.24, torso);
      const neck = grp(0, 0.72, 0, torso);
      const head = grp(0, 0, 0, neck);
      head.scale.setScalar(1.1);
      mesh(rbox(0.48, 0.46, 0.46, 0.84), M(skin), 0, 0.2, 0, head);
      mesh(ball(0.17, 12), M(skin), 0, 0.06, -0.06, head, 1.45, 0.8, 1.15);
      mesh(ball(0.085, 12), M('#d98a66'), 0, 0.18, -0.245, head, 1, 0.95, 1);
      const mu = mesh(rbox(0.34, 0.08, 0.1, 0.7), M('#3a2416'), 0, 0.1, -0.23, head); mu.rotation.x = 0.1;
      for (const sx of [-1, 1]) { const m2 = mesh(rbox(0.14, 0.07, 0.08, 0.7), M('#3a2416'), sx * 0.17, 0.07, -0.21, head); m2.rotation.z = sx * 0.5; }
      for (const sx of [-1, 1]) { mesh(ball(0.042, 10), M('#ffffff'), sx * 0.09, 0.27, -0.2, head, 1, 1.15, 0.6); mesh(ball(0.022, 8), M('#1d1b26'), sx * 0.09, 0.27, -0.225, head); const br = mesh(rbox(0.14, 0.045, 0.04, 0.8), M('#3a2416'), sx * 0.09, 0.335, -0.205, head); br.rotation.z = sx * 0.3; mesh(ball(0.065, 10), M(skin), sx * 0.24, 0.2, 0, head, 0.55, 1, 0.9); }
      mesh(cyl(0.27, 0.25, 0.14, 20), M(ol), 0, 0.46, 0.01, head);
      mesh(rbox(0.6, 0.13, 0.58, 0.85), M(ol), 0, 0.55, 0.02, head);
      mesh(cyl(0.272, 0.272, 0.05, 20), M('#3a2a1e'), 0, 0.38, 0.01, head);
      const vz = mesh(rbox(0.4, 0.04, 0.22, 0.8), M('#16140f'), 0, 0.36, -0.25, head); vz.rotation.x = -0.18;
      mesh(rbox(0.12, 0.1, 0.03, 0.8), M('#ffd23f'), 0, 0.5, -0.29, head);
      const handG = ball(0.11, 12), handM = M(skin);
      const armR = limb(torso, 0.5, 0.58, 0.3, 0.27, 0.12, 0.11, ol, ol, handG, handM, [0, -0.03, 0]);
      const armL = limb(torso, -0.5, 0.58, 0.3, 0.27, 0.12, 0.11, ol, ol, handG, handM, [0, -0.03, 0]);
      const boot = () => { const g = grp(0, 0, 0); mesh(rbox(0.24, 0.16, 0.38, 0.75), M('#3a2416'), 0, -0.03, -0.07, g); mesh(rbox(0.26, 0.05, 0.4, 0.8), M('#22160e'), 0, -0.1, -0.07, g); return g; };
      const legR = limb(pelvis, 0.18, -0.04, 0.32, 0.3, 0.15, 0.13, ol2, ol2, null, null, null, 1.05);
      const legL = limb(pelvis, -0.18, -0.04, 0.32, 0.3, 0.15, 0.13, ol2, ol2, null, null, null, 1.05);
      legR.end.add(boot()); legL.end.add(boot());
      return { root, body, pelvis, torso, head, neck, armL, armR, legL, legR, ph: 0 };
    }

    function dog() {
      const root = new THREE.Group();
      const body = grp(0, 0.52, 0, root);
      const c = '#d9b07a', c2 = '#a87a4a', cream = '#f6ead2';
      mesh(rbox(0.36, 0.36, 0.82, 0.8), M(c), 0, 0, 0, body);
      mesh(rbox(0.3, 0.2, 0.56, 0.8), M(cream), 0, -0.1, -0.06, body);
      mesh(ball(0.2, 14), M(c), 0, 0.04, -0.3, body, 1, 1.05, 1);
      const col = mesh(G('collar', () => new THREE.TorusGeometry(0.15, 0.03, 6, 16)), M('#e8323a'), 0, 0.14, -0.4, body); col.rotation.x = 1.1;
      mesh(ball(0.035, 8), M('#ffd23f'), 0, 0.04, -0.52, body);
      const head = grp(0, 0.22, -0.46, body);
      mesh(rbox(0.32, 0.3, 0.32, 0.85), M(c), 0, 0.06, 0, head);
      mesh(rbox(0.2, 0.16, 0.24, 0.85), M(cream), 0, -0.02, -0.2, head);
      mesh(ball(0.05, 10), M('#1d1b26'), 0, 0.04, -0.33, head, 1.2, 0.9, 1);
      for (const sx of [-1, 1]) { mesh(ball(0.035, 8), M('#ffffff'), sx * 0.08, 0.13, -0.15, head); mesh(ball(0.022, 6), M('#1d1b26'), sx * 0.08, 0.13, -0.175, head); const e = mesh(rbox(0.1, 0.22, 0.14, 0.85), M(c2), sx * 0.16, 0.06, 0.04, head); e.rotation.z = sx * 0.35; }
      mesh(rbox(0.08, 0.03, 0.12, 0.85), M('#ff6a8a'), 0, -0.1, -0.27, head);
      const tail = grp(0, 0.12, 0.4, body);
      mesh(cyl(0.05, 0.03, 0.36, 8), M(c2), 0, 0, 0, tail); mesh(ball(0.05, 8), M(cream), 0, -0.36, 0, tail);
      tail.rotation.x = -2.3;
      const legs = [];
      for (const [x, z] of [[-0.12, -0.28], [0.12, -0.28], [-0.12, 0.28], [0.12, 0.28]]) {
        const l = grp(x, -0.08, z, body);
        mesh(ball(0.08, 10), M(c), 0, 0, 0, l);
        mesh(cyl(0.07, 0.055, 0.42, 10), M(c), 0, 0, 0, l);
        mesh(ball(0.07, 10), M(cream), 0, -0.43, -0.03, l, 1, 0.7, 1.3);
        legs.push(l);
      }
      return { root, body, head, tail, legs, ph: 0 };
    }

    function hoverboardModel() {
      const g = new THREE.Group();
      mesh(rbox(0.66, 0.08, 1.6, 0.35), M('#ff4fa3'), 0, 0, 0, g);
      mesh(rbox(0.56, 0.03, 1.42, 0.35), M('#ffd23f'), 0, 0.045, 0, g);
      return g;
    }

    function animHero(R, st, dt, t) {
      const L = R.legL, Rr = R.legR, AL = R.armL, AR = R.armR;
      const sp = st.speed || 0;
      if (st.mode === 'run' || st.mode === 'board') R.ph += dt * TAU * (1.55 + sp * 0.05);
      const ph = R.ph, s = Math.sin(ph), c = Math.cos(ph);
      let lL = 0, lR = 0, kL = 0, kR = 0, aL = 0, aR = 0, eL = 0.3, eR = 0.3, tor = 0, tw = 0, bob = 0, hx = 0, spinX = 0, spinY = 0.55, pelY = 0.33, lz = 0, lzr = 0, azL = 0.12, azR = -0.12, hy = 0;
      if (st.mode === 'run') {
        lL = 0.95 * s; lR = -0.95 * s;
        kL = -0.15 - 1.45 * Math.max(0, c); kR = -0.15 - 1.45 * Math.max(0, -c);
        aL = -0.85 * s; aR = 0.85 * s; eL = 1.25 + 0.25 * s; eR = 1.25 - 0.25 * s;
        tor = -0.28; tw = 0.18 * s; bob = 0.06 * Math.abs(c); hx = 0.12;
      } else if (st.mode === 'idle') {
        const b = Math.sin(t * 2.1);
        lL = 0.05; lR = -0.12; kL = -0.08; kR = -0.2; aL = 0.1 + 0.03 * b; aR = st.spray ? 1.5 + 0.1 * Math.sin(t * 9) : 0.35; eL = 0.25; eR = st.spray ? 0.25 : 1.2; azR = st.spray ? -0.25 : -0.15;
        tor = 0.02 * b; tw = st.spray ? -0.25 : 0.12; hy = Math.sin(t * 0.7) * 0.35 + (st.spray ? -0.4 : 0); bob = 0.012 * b; hx = -0.05;
      } else if (st.mode === 'board') {
        lL = 0.35 + 0.08 * s; lR = -0.25 - 0.08 * s; kL = -0.7; kR = -0.6; aL = 0.4; aR = -0.2; eL = 0.6; eR = 0.8; azL = 1.0; azR = -1.0; tor = -0.15; bob = 0.03 * s; tw = 0.0; pelY = 0.2;
      } else if (st.mode === 'jet') {
        lL = 0.25 + 0.1 * Math.sin(t * 6); lR = -0.15 - 0.1 * Math.sin(t * 6); kL = -0.7; kR = -0.9; aL = 0.9; aR = 0.9; eL = 1.6; eR = 1.6; azL = 0.25; azR = -0.25; tor = -0.55; hx = 0.4;
      } else if (st.mode === 'dead') {
        lL = 0.5; lR = 0.2; kL = -0.6; kR = -0.3; aL = 2.4; aR = 2.6; eL = 0.3; eR = 0.3; azL = 0.9; azR = -0.9; tor = 0.25; hx = -0.3;
      } else if (st.mode === 'caught') {
        lL = 0.1; lR = -0.1; kL = -0.1; kR = -0.1; aL = 0.3; aR = 0.3; eL = 1.6; eR = 1.6; azL = 0.5; azR = -0.5; tor = 0.15; hx = -0.2; hy = 0.5 * Math.sin(t * 3);
      }
      const w = st.air || 0;
      if (w > 0 && st.mode !== 'jet' && st.mode !== 'board') {
        const up = st.vy > 0 ? 1 : 0.6;
        lL = lerp(lL, 0.9 * up + 0.2, w); kL = lerp(kL, -1.7, w); lR = lerp(lR, -0.35, w); kR = lerp(kR, -1.0, w);
        aL = lerp(aL, 2.5, w); aR = lerp(aR, -0.6, w); eL = lerp(eL, 0.4, w); eR = lerp(eR, 0.9, w); azL = lerp(azL, 0.45, w); azR = lerp(azR, -0.5, w);
        tor = lerp(tor, -0.1, w); bob = lerp(bob, 0, w);
      } else if (w > 0 && st.mode === 'board') { kL = lerp(kL, -1.3, w); kR = lerp(kR, -1.2, w); lL = lerp(lL, 0.8, w); lR = lerp(lR, 0.2, w); }
      const r = st.roll || 0;
      if (r > 0) {
        const k = Math.min(1, Math.min(r, 1 - st.rollP) * 6 + (st.rollP < 1 ? 0.0 : 0));
        lL = lerp(lL, 2.0, k); lR = lerp(lR, 2.0, k); kL = lerp(kL, -2.4, k); kR = lerp(kR, -2.4, k);
        aL = lerp(aL, 1.3, k); aR = lerp(aR, 1.3, k); eL = lerp(eL, 1.9, k); eR = lerp(eL, 1.9, k); azL = lerp(azL, 0.2, k); azR = lerp(azR, -0.2, k);
        tor = lerp(tor, -0.75, k); hx = lerp(hx, 0.5, k);
        spinX = -TAU * ease(clamp(st.rollP, 0, 1)); spinY = lerp(0.55, 0.42, k); pelY = lerp(pelY, 0.12, k); bob = 0;
      }
      if (st.stumble > 0) { const q = st.stumble; tor += 0.5 * q; aL += 1.6 * q * Math.sin(t * 30); aR += 1.6 * q * Math.cos(t * 30); hy += 0.4 * q * Math.sin(t * 25); }
      R.legL.top.rotation.x = lL; R.legR.top.rotation.x = lR; R.legL.mid.rotation.x = kL; R.legR.mid.rotation.x = kR;
      R.legL.end.rotation.x = -0.25 * Math.max(0, -kL - 0.6); R.legR.end.rotation.x = -0.25 * Math.max(0, -kR - 0.6);
      R.legL.top.rotation.z = st.mode === 'board' ? -0.22 : -0.04; R.legR.top.rotation.z = st.mode === 'board' ? 0.22 : 0.04;
      R.armL.top.rotation.x = aL; R.armR.top.rotation.x = aR; R.armL.mid.rotation.x = eL; R.armR.mid.rotation.x = eR;
      R.armL.top.rotation.z = -azL; R.armR.top.rotation.z = -azR;
      R.torso.rotation.x = tor; R.torso.rotation.y = tw; R.head.rotation.x = hx; R.head.rotation.y = hy;
      R.spin.rotation.x = spinX; R.spin.position.y = spinY; R.pelvis.position.y = pelY + bob;
      R.body.rotation.z = st.leanZ || 0; R.body.rotation.x = st.mode === 'dead' ? -st.deadT * 0 : 0;
      R.board.visible = st.mode === 'board';
      R.board.rotation.z = st.mode === 'board' ? 0.06 * Math.sin(t * 5) : 0;
      R.board.position.y = st.mode === 'board' ? 0.1 + 0.04 * Math.sin(t * 6) : 0.06;
      R.body.position.y = st.mode === 'board' ? 0.16 + 0.04 * Math.sin(t * 6) : 0;
      R.body.rotation.y = st.mode === 'board' ? 0.55 : 0;
      R.jet.visible = st.mode === 'jet';
      if (R.jet.visible) for (const ch of R.jet.children) if (ch.name === 'fl') ch.scale.set(0.8, 0.5 + 0.35 * Math.random(), 0.8);
      R.can.visible = !!st.can;
    }
    function animGuard(Gd, sp, dt, t, mode) {
      if (mode === 'run') Gd.ph += dt * TAU * (1.7 + sp * 0.05);
      const s = Math.sin(Gd.ph), c = Math.cos(Gd.ph);
      if (mode === 'run') {
        Gd.legL.top.rotation.x = 0.8 * s; Gd.legR.top.rotation.x = -0.8 * s;
        Gd.legL.mid.rotation.x = -0.2 - 1.2 * Math.max(0, c); Gd.legR.mid.rotation.x = -0.2 - 1.2 * Math.max(0, -c);
        Gd.armL.top.rotation.x = -0.8 * s; Gd.armR.top.rotation.x = 0.8 * s + (Gd.grab ? 1.2 : 0);
        Gd.armL.mid.rotation.x = 1.2; Gd.armR.mid.rotation.x = 1.2;
        Gd.armL.top.rotation.z = 0.35; Gd.armR.top.rotation.z = -0.35;
        Gd.torso.rotation.x = -0.2; Gd.pelvis.position.y = 0.72 + 0.06 * Math.abs(c);
        Gd.head.rotation.y = 0;
      } else {
        Gd.legL.top.rotation.x = 0; Gd.legR.top.rotation.x = 0; Gd.legL.mid.rotation.x = 0; Gd.legR.mid.rotation.x = 0;
        Gd.armR.top.rotation.x = 1.9 + 0.2 * Math.sin(t * 8); Gd.armR.mid.rotation.x = 0.4; Gd.armL.top.rotation.x = 0.2; Gd.armL.top.rotation.z = 0.5; Gd.armL.mid.rotation.x = 1.6;
        Gd.torso.rotation.x = 0.05; Gd.pelvis.position.y = 0.72; Gd.head.rotation.y = 0.3 * Math.sin(t * 4);
      }
    }
    function animDog(D, sp, dt, t, mode) {
      if (mode === 'run') D.ph += dt * TAU * (2.2 + sp * 0.06);
      const s = Math.sin(D.ph), c = Math.cos(D.ph);
      if (mode === 'run') {
        D.legs[0].rotation.x = 0.9 * s; D.legs[1].rotation.x = 0.9 * Math.sin(D.ph + 0.4);
        D.legs[2].rotation.x = -0.9 * s; D.legs[3].rotation.x = -0.9 * Math.sin(D.ph + 0.4);
        D.body.position.y = 0.52 + 0.08 * Math.abs(c); D.body.rotation.x = 0.12 * c;
        D.tail.rotation.x = -2.0 + 0.3 * s; D.head.rotation.x = -0.1 * c;
      } else {
        for (const l of D.legs) l.rotation.x = 0;
        D.body.position.y = 0.52 + 0.12 * Math.abs(Math.sin(t * 9)); D.tail.rotation.x = -2.3; D.tail.rotation.z = 0.6 * Math.sin(t * 14); D.head.rotation.x = -0.3;
      }
    }
    return { hero, guard, dog, hoverboardModel, animHero, animGuard, animDog, M, G, rbox, mesh, grp, ball, cyl };
  }

  const trainLen = n => n * CFG.CAR + (n - 1) * CFG.CGAP;
  const HW = { train: CFG.THW, ramp: 1.1, low: 1.05, high: 1.1 };
  const laneOf = x => clamp(Math.round(x / CFG.LANE) + 1, 0, 2);

  function newWorld() {
    return {
      obs: [], coins: [], items: [], tunnels: [], genS: 0, free: [-1e9, -1e9, -1e9], uid: 0,
      nextPU: rnd(180, 260), nextKey: rnd(1200, 2000), nextBox: rnd(600, 1000), nextTun: rnd(450, 700),
      clear: [], lastKind: '', puBag: []
    };
  }
  function newRun() {
    return {
      s: 0, x: 0, lane: 1, xFrom: 0, lt: 1, ldir: 0, y: 0, vy: 0, g: 1, grounded: true, coyote: 0, jumpBuf: 0,
      rollT: 0, rollD: 1, h: CFG.H_STAND, t: 0, speed: CFG.V0, score: 0, coins: 0, keys: 0, mult: 1,
      x2: 0, jet: 0, jetD: 1, sneak: 0, sneakD: 1, mag: 0, magD: 1, x2D: 1, board: 0, ghost: 0, stumbleT: 0, chase: CFG.START_CHASE,
      dead: '', deadT: 0, revives: 0, warm: true, landT: 0, jumpT: 0, ev: [], hitObs: null,
      st: { jump: 0, roll: 0, pu: 0, jet: 0, magCoins: 0, board: 0, bump: 0, dodge: 0, roof: 0, sneakJump: 0, mbox: 0, stumble: 0, coinsRun: 0 }
    };
  }

  function addObs(W, k, lane, s0, len, extra) {
    const o = Object.assign({ k, lane, s0, s1: s0 + len, ps0: s0, len, v: 0, act: false, id: ++W.uid, mesh: null, hit: false, done: false }, extra || {});
    W.obs.push(o);
    W.free[lane] = Math.max(W.free[lane], o.s1 + 2);
    return o;
  }
  const addTrain = (W, lane, s0, cars, liv) => addObs(W, 'train', lane, s0, trainLen(cars), { cars, liv: liv == null ? rint(0, 4) : liv });
  const addRamp = (W, lane, s0) => addObs(W, 'ramp', lane, s0, CFG.RAMP);
  const addBar = (W, k, lane, s) => addObs(W, k, lane, s - CFG.BAR_D, CFG.BAR_D * 2);
  const addCoin = (W, lane, s, y) => W.coins.push({ lane, x: LX(lane), s, y, got: false, pull: false, px: 0, py: 0, ps: 0 });
  const addItem = (W, k, lane, s, y) => W.items.push({ k, lane, x: LX(lane), s, y, got: false, mesh: null });

  function inTunnel(W, s) { for (const t of W.tunnels) if (s >= t.s0 && s < t.s1) return t; return null; }
  function blocked(W, s0, s1) { for (const c of W.clear) if (s1 > c[0] && s0 < c[1]) return true; return false; }

  function coinLine(W, lane, s, n, y, gap) { for (let i = 0; i < n; i++) addCoin(W, lane, s + i * (gap || 2.2), y == null ? 0.9 : y); }
  function coinArc(W, lane, s, v, base) {
    const T = CFG.JUMP_T * tscale(v), L = v * T, n = 6;
    for (let i = 0; i < n; i++) { const f = i / (n - 1); addCoin(W, lane, s - L / 2 + f * L, (base || 0) + 0.9 + CFG.JUMP_H * 4 * f * (1 - f)); }
  }
  function rampCoins(W, lane, s) { for (let i = 0; i < 4; i++) { const f = (i + 0.5) / 4; addCoin(W, lane, s + f * CFG.RAMP, 0.9 + CFG.ROOF * f); } }

  function placePending(W, s, lanes, y) {
    if (!lanes.length) return;
    const lane = pick(lanes);
    if (s > W.nextKey) { addItem(W, 'key', lane, s, (y || 0) + 1.1); W.nextKey = s + rnd(1800, 3000); return true; }
    if (s > W.nextBox) { addItem(W, 'mbox', lane, s, (y || 0) + 0.75); W.nextBox = s + rnd(900, 1600); return true; }
    if (s > W.nextPU) {
      if (!W.puBag.length) W.puBag = ['mag', 'mag', 'x2', 'sneak', 'jet', 'mag', 'x2', 'sneak', 'jet'].sort(() => Math.random() - 0.5);
      addItem(W, W.puBag.pop(), lane, s, (y || 0) + 1.2); W.nextPU = s + rnd(320, 560); return true;
    }
    return false;
  }

  function freeLanes(W, s, margin) { const r = []; for (let l = 0; l < 3; l++) if (W.free[l] < s - (margin || 0)) r.push(l); return r; }

  function section(W, R) {
    const v = Math.max(R.speed, CFG.V0) * 1.03;
    const d = clamp((v - CFG.V0) / (CFG.VMAX - CFG.V0) + R.s / 9000, 0, 1);
    let s = W.genS;
    if (s > W.nextTun && !blocked(W, s, s + 200)) {
      const t0 = Math.ceil((s + 30) / CFG.CHUNK) * CFG.CHUNK, n = rint(2, 4);
      W.tunnels.push({ s0: t0, s1: t0 + n * CFG.CHUNK });
      W.nextTun = t0 + n * CFG.CHUNK + rnd(800, 1400);
    }
    if (blocked(W, s, s + 40)) { W.genS = s + 20; return; }
    const r = Math.random();
    let kind;
    if (s < 60) kind = 'coins';
    else if (W.lastKind === 'coins') kind = r < 0.45 ? 'bars' : r < 0.8 ? 'side' : 'mixed';
    else {
      const wt = { bars: 1.2, side: 1.3, mixed: 1.0, roof: 0.35 + 0.8 * d, moving: 0.25 + 1.0 * d, coins: 0.55 - 0.3 * d };
      let tot = 0; for (const k in wt) tot += wt[k];
      let q = Math.random() * tot; kind = 'bars';
      for (const k in wt) { q -= wt[k]; if (q <= 0) { kind = k; break; } }
      if (kind === W.lastKind && kind !== 'side' && Math.random() < 0.6) kind = 'side';
    }
    let end = s;
    const SP = Math.max(13, v * (0.95 - 0.2 * d));
    if (kind === 'coins') {
      const lane = rint(0, 2), n = rint(8, 13);
      coinLine(W, lane, s + 4, n);
      end = s + 4 + n * 2.2;
      placePending(W, end + 6, [0, 1, 2].filter(l => l !== lane));
    } else if (kind === 'bars') {
      const rows = rint(2, 3 + Math.round(d * 2));
      const cl = rint(0, 2);
      for (let i = 0; i < rows; i++) {
        const sr = s + 8 + i * SP * rnd(1.0, 1.25);
        const k = Math.random() < 0.55 - 0.35 * d ? 1 : Math.random() < 0.75 ? 2 : 3;
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, k);
        const types = {};
        for (const l of lanes) { types[l] = Math.random() < 0.55 ? 'low' : 'high'; addBar(W, types[l], l, sr); }
        const tl = types[cl];
        if (tl === 'low') coinArc(W, cl, sr, v);
        else if (tl === 'high') coinLine(W, cl, sr - 2.2, 3, 0.55);
        else coinLine(W, cl, sr - 4, 4);
        end = sr + 2;
      }
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'side' || kind === 'mixed') {
      const nT = kind === 'mixed' ? 1 : (Math.random() < 0.35 + 0.4 * d ? 2 : 1);
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
      if (nT === 2) s = Math.max(s, Math.max(...W.free) + v * 0.8);
      const tl = lanes.slice(0, nT), fl = lanes.slice(nT);
      let rampLane = -1, maxEnd = s;
      tl.forEach((l, i) => {
        const cars = rint(1, 3), st = s + 6 + rnd(0, 10) + (i ? rnd(0, 8) : 0);
        const ramp = (i === 0 && Math.random() < 0.55) || kind === 'mixed' && Math.random() < 0.6;
        if (ramp && rampLane < 0) { addRamp(W, l, st - CFG.RAMP); rampLane = l; }
        const o = addTrain(W, l, st, cars);
        maxEnd = Math.max(maxEnd, o.s1);
        if (l === rampLane) {
          rampCoins(W, l, st - CFG.RAMP);
          coinLine(W, l, st + 2, Math.max(3, Math.floor((o.len - 4) / 2.2)), CFG.ROOF + 0.9);
          if (s + 80 > W.nextPU || s > W.nextKey) placePending(W, o.s1 - 4, [l], CFG.ROOF);
        }
      });
      if (kind === 'mixed' && fl.length) {
        const bl = fl[0];
        for (let sb = s + 14; sb < maxEnd - 4; sb += SP * rnd(1.1, 1.5)) addBar(W, Math.random() < 0.5 ? 'low' : 'high', bl, sb);
        if (fl[1] != null) coinLine(W, fl[1], s + 8, Math.max(4, Math.floor((maxEnd - s - 12) / 2.2)));
      } else if (fl.length) {
        const bl = pick(fl);
        if (Math.random() < 0.5 + 0.3 * d) for (let sb = s + 24; sb < maxEnd - 8; sb += SP * rnd(1.4, 2.0)) { addBar(W, Math.random() < 0.5 ? 'low' : 'high', bl, sb); if (Math.random() < 0.4) coinArc(W, bl, sb, v); }
        else coinLine(W, bl, s + 10, Math.max(4, Math.floor((maxEnd - s - 16) / 2.2)));
      }
      end = maxEnd;
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'roof') {
      s = Math.max(s, Math.max(...W.free) + v * 1.05);
      const rl = rint(0, 2), st = s + 6 + CFG.RAMP;
      addRamp(W, rl, st - CFG.RAMP); rampCoins(W, rl, st - CFG.RAMP);
      const carsR = rint(2, 4);
      const o = addTrain(W, rl, st, carsR);
      coinLine(W, rl, st + 2, Math.floor((o.len - 4) / 2.2), CFG.ROOF + 0.9);
      let maxEnd = o.s1;
      if (Math.random() < 0.45) {
        const gap = rnd(4, 6), o2 = addTrain(W, rl, o.s1 + gap, rint(1, 2));
        coinArc(W, rl, o.s1 + gap / 2, v, CFG.ROOF);
        maxEnd = o2.s1;
      }
      for (const l of [0, 1, 2]) if (l !== rl) {
        const off = rnd(0, 8), cars = rint(1, 3);
        const o3 = addTrain(W, l, st + off, cars);
        maxEnd = Math.max(maxEnd, o3.s1);
      }
      placePending(W, o.s1 - 6, [rl], CFG.ROOF);
      end = maxEnd;
      placePending(W, end + 8, [0, 1, 2]);
    } else if (kind === 'moving') {
      const vt = rnd(8, 11) * (0.85 + 0.35 * d);
      const sm = s + 30;
      const meet = sm - vt * CFG.ACT_D / (v + vt);
      const cand = [0, 1, 2].filter(l => W.free[l] < meet - 16).sort(() => Math.random() - 0.5);
      let ml = -1, esc = -1;
      for (const l of cand) { const e = [0, 1, 2].filter(x => Math.abs(x - l) === 1 && W.free[x] < meet - 26); if (e.length) { ml = l; esc = pick(e); break; } }
      if (ml < 0) { W.genS = s + 12; W.lastKind = 'x'; return; }
      const cars = rint(1, 3);
      const o = addTrain(W, ml, sm, cars, rint(0, 4));
      o.v = vt; o.moving = true;
      const third = 3 - ml - esc;
      let maxEnd = o.s1;
      if (W.free[third] < meet - 26) {
        if (Math.random() < 0.55) { const o2 = addTrain(W, third, meet - rnd(4, 14), rint(1, 2)); maxEnd = Math.max(maxEnd, o2.s1); }
        else for (let sb = meet - 18; sb < meet + 26; sb += SP * 1.3) addBar(W, Math.random() < 0.5 ? 'low' : 'high', third, sb);
      }
      coinLine(W, esc, meet - 24, 10);
      W.free[esc] = Math.max(W.free[esc], meet + 8);
      end = Math.max(maxEnd, sm + 4);
    }
    W.lastKind = kind;
    W.genS = end + v * rnd(0.55, 0.85) * (1.25 - 0.4 * d);
  }

  function gen(W, R) { let n = 0; while (W.genS < R.s + CFG.AHEAD && n++ < 12) section(W, R); }

  function jetCoins(W, s0, s1) {
    let lane = rint(0, 2), s = s0;
    while (s < s1) {
      const n = rint(10, 16);
      const y = (inTunnel(W, s) ? 5.4 : CFG.JET_Y) + 0.8;
      for (let i = 0; i < n && s < s1; i++, s += 2.4) addCoin(W, lane, s, y);
      lane = clamp(lane + (Math.random() < 0.5 ? -1 : 1), 0, 2);
      s += 3;
    }
  }

  function supportAt(W, lane, s) {
    let h = 0;
    for (const o of W.obs) {
      if (o.lane !== lane || o.done || s < o.s0 - 0.05 || s > o.s1 + 0.05) continue;
      if (o.k === 'train') { if (o.v && !o.act) {} h = Math.max(h, CFG.ROOF); }
      else if (o.k === 'ramp') h = Math.max(h, CFG.ROOF * clamp((s - o.s0) / o.len, 0, 1));
    }
    return h;
  }

  function startJump(R) {
    const H = R.sneak > 0 ? CFG.SNEAK_H : CFG.JUMP_H, T = (R.sneak > 0 ? CFG.SNEAK_T : CFG.JUMP_T) * tscale(R.speed);
    R.g = 8 * H / (T * T); R.vy = 4 * H / T; R.grounded = false; R.coyote = 0; R.jumpBuf = 0; R.rollT = 0; R.jumpT = T;
    R.st.jump++; if (R.sneak > 0) R.st.sneakJump++;
    R.ev.push('jump');
  }
  function act(W, R, a) {
    if (R.dead) return;
    if (a === 'left' || a === 'right') {
      const dir = a === 'left' ? -1 : 1, nl = R.lane + dir;
      if (nl < 0 || nl > 2) { if (R.jet <= 0) stumble(W, R, 'edge'); return; }
      R.xFrom = R.x; R.lane = nl; R.lt = 0; R.ldir = dir; R.ev.push('lane');
    } else if (a === 'up') {
      if (R.jet > 0) return;
      if (R.grounded || R.coyote > 0) startJump(R); else R.jumpBuf = CFG.BUFFER;
    } else if (a === 'down') {
      if (R.jet > 0) return;
      R.rollD = CFG.ROLL_T * tscale(R.speed); R.rollT = R.rollD; R.st.roll++; R.jumpBuf = 0;
      if (!R.grounded) { R.vy = Math.min(R.vy, -CFG.FALL_V); }
      R.ev.push('roll');
    }
  }

  function stumble(W, R, why) {
    if (R.ghost > 0 || R.dead || R.stumbleT > 0) return;
    if (R.board > 0 && why !== 'edge') { R.board = 0; R.ghost = CFG.GHOST_T; R.ev.push('board_break'); return; }
    R.st.stumble++;
    if (why === 'train') R.st.bump++;
    R.stumbleT = 0.45;
    R.ev.push('bump');
    if (R.chase > 0.15 && !R.warm) { die(W, R, 'caught'); return; }
    R.warm = false;
    R.chase = CFG.CHASE_T;
  }
  function die(W, R, why) {
    R.dead = why; R.deadT = 0; R.vy = Math.min(R.vy, 0); R.rollT = 0;
    R.ev.push(why === 'caught' ? 'caught' : 'crash');
  }
  function crash(W, R, o) {
    if (R.ghost > 0 || o.hit) return;
    if (R.board > 0) { R.board = 0; R.ghost = CFG.GHOST_T; o.hit = true; R.ev.push('board_break'); return; }
    R.hitObs = o;
    die(W, R, 'crash');
  }
  function bounce(R) {
    const back = laneOf(R.xFrom);
    if (back !== R.lane) { R.xFrom = R.x; R.lane = back; R.lt = 0; R.ldir = -R.ldir; }
  }

  function givePU(W, R, k, lvl) {
    const D = puDur(lvl || 0);
    R.st.pu++;
    if (k === 'jet') {
      R.jet = D; R.jetD = D; R.st.jet++; R.board = R.board > 0 ? R.board : 0; R.rollT = 0;
      const sEnd = R.s + D * R.speed * 1.05;
      jetCoins(W, R.s + 18, sEnd - 12);
      W.clear.push([sEnd - 30, sEnd + 70]);
      for (const o of W.obs) if (o.s1 > sEnd - 30 && o.s0 < sEnd + 70) o.done = true;
      W.genS = Math.max(W.genS, R.s + 10);
    } else if (k === 'sneak') { R.sneak = D; R.sneakD = D; }
    else if (k === 'mag') { R.mag = D; R.magD = D; }
    else if (k === 'x2') { R.x2 = D; R.x2D = D; }
    R.ev.push('pu_' + k);
  }

  function step(W, R, dt, ctx) {
    if (R.dead) { R.deadT += dt; R.speed = damp(R.speed, 0, 9, dt); return; }
    R.t += dt;
    R.speed = speedAt(R.t);
    const ps = R.s;
    R.s += R.speed * dt;
    if (R.lt < 1) { R.lt = Math.min(1, R.lt + dt / CFG.LANE_T); }
    R.x = lerp(R.xFrom, LX(R.lane), ease(R.lt));
    const px = R.x;
    if (R.rollT > 0) { if (R.grounded || R.vy < 0) R.rollT -= dt; if (R.rollT < 0) R.rollT = 0; }
    R.h = R.rollT > 0 ? CFG.H_ROLL : CFG.H_STAND;
    R.ghost = Math.max(0, R.ghost - dt); R.stumbleT = Math.max(0, R.stumbleT - dt);
    if (R.chase > 0) { R.chase = Math.max(0, R.chase - dt); if (R.chase === 0) R.warm = false; }
    for (const k of ['sneak', 'mag', 'x2']) if (R[k] > 0) R[k] = Math.max(0, R[k] - dt);
    if (R.board > 0) { R.board -= dt; if (R.board <= 0) { R.board = 0; R.ghost = Math.max(R.ghost, 0.6); R.ev.push('board_end'); } }
    if (R.jumpBuf > 0) R.jumpBuf -= dt;
    const lane = laneOf(R.x);
    const sup = supportAt(W, lane, R.s);
    if (R.jet > 0) {
      R.jet -= dt;
      const tun = inTunnel(W, R.s + 25) || inTunnel(W, R.s);
      const ty = tun ? 5.4 : CFG.JET_Y;
      R.y = damp(R.y, ty, 3.2, dt); R.vy = 0; R.grounded = false; R.chase = 0;
      if (R.jet <= 0) { R.jet = 0; R.g = 22; R.vy = 0; R.ghost = Math.max(R.ghost, 2.2); R.ev.push('jet_end'); }
    } else {
      if (R.grounded) {
        if (sup < R.y - 0.05) { R.grounded = false; R.coyote = CFG.COYOTE; R.vy = 0; R.g = 8 * CFG.JUMP_H / Math.pow(CFG.JUMP_T * tscale(R.speed), 2); }
        else if (sup - R.y < 1.35) R.y = sup;
      }
      if (!R.grounded) {
        if (R.coyote > 0) R.coyote -= dt;
        R.vy -= R.g * dt; R.y += R.vy * dt;
        if (R.y <= sup && R.vy <= 0) {
          R.y = sup; R.grounded = true; R.landT = 0.18;
          R.ev.push(R.vy < -14 ? 'land_hard' : 'land'); R.vy = 0;
          if (R.jumpBuf > 0) startJump(R);
        }
      }
    }
    if (R.landT > 0) R.landT -= dt;
    if (R.grounded && R.y > CFG.ROOF - 0.1) R.st.roof += R.speed * dt;

    for (const o of W.obs) {
      if (o.done) continue;
      if (o.moving) {
        o.ps0 = o.s0;
        if (!o.act && o.s0 - R.s < CFG.ACT_D) { o.act = true; R.ev.push('horn'); }
        if (o.act) { o.s0 -= o.v * dt; o.s1 = o.s0 + o.len; }
      } else o.ps0 = o.s0;
    }
    R.mult = ctx.mult * (R.x2 > 0 ? 2 : 1);
    R.score += R.speed * dt * CFG.SCORE_K * R.mult;
    if (R.jet > 0) return;
    for (const o of W.obs) {
      if (o.done || o.hit) continue;
      if (o.s0 > R.s + 3 || o.s1 < R.s - 3) {
        if ((o.k === 'low' || o.k === 'high') && !o.passed && o.s1 < R.s - 1) { o.passed = true; if (Math.abs(R.x - LX(o.lane)) < 1.3) R.st.dodge++; }
        continue;
      }
      const ox = LX(o.lane), hw = HW[o.k] + CFG.PHW, dx = Math.abs(R.x - ox);
      if (dx >= hw) continue;
      const sNow = R.s + CFG.PHD > o.s0 && R.s - CFG.PHD < o.s1;
      if (!sNow) continue;
      const sPrev = ps + CFG.PHD > o.ps0 && ps - CFG.PHD < o.s1 + (o.ps0 - o.s0);
      const xPrev = Math.abs(px - ox) < hw;
      let solid = false;
      if (o.k === 'train') solid = R.y < CFG.ROOF - 0.45;
      else if (o.k === 'ramp') { const ry = CFG.ROOF * clamp((R.s - o.s0) / o.len, 0, 1); solid = R.y < ry - 1.3; }
      else if (o.k === 'low') solid = R.y < CFG.LOW_H - 0.08;
      else if (o.k === 'high') solid = R.y + R.h > CFG.HIGH_B + 0.06 && R.y < CFG.HIGH_T;
      if (!solid) continue;
      const shallow = dx > hw - 0.55 && R.lt < 1;
      if (!sPrev && !shallow) {
        if (R.ghost > 0) continue;
        crash(W, R, o); if (R.dead) return; continue;
      }
      if (R.ghost > 0) continue;
      bounce(R);
      stumble(W, R, o.k === 'train' ? 'train' : 'bar');
      if (R.dead) return;
    }
  }

  function collect(W, R, dt, lvl, onItem) {
    const cy = R.y + (R.rollT > 0 ? 0.45 : 0.85);
    const magR = R.mag > 0 ? CFG.MAG_R : 0;
    for (const c of W.coins) {
      if (c.got) continue;
      const ds = c.s - R.s;
      if (ds > 40) break;
      if (ds < -4) { c.got = true; c.missed = true; continue; }
      if (magR && !c.pull && ds < magR + 6 && ds > -2 && Math.abs(c.y - cy) < 12) { c.pull = true; c.mag = true; }
      if (c.pull) {
        const k = 1 - Math.exp(-14 * dt);
        c.x += (R.x - c.x) * k; c.y += (cy - c.y) * k; c.s += (R.s + 0.4 - c.s) * k + R.speed * dt * 0.0;
      }
      if (Math.abs(c.s - R.s) < 0.9 && Math.abs(c.x - R.x) < 0.95 && Math.abs(c.y - cy) < 1.05) {
        c.got = true; R.coins++; R.st.coinsRun++; if (c.mag) R.st.magCoins++;
        R.ev.push('coin');
      }
    }
    for (const it of W.items) {
      if (it.got) continue;
      if (it.s < R.s - 4) { it.got = true; continue; }
      if (Math.abs(it.s - R.s) < 1.1 && Math.abs(it.x - R.x) < 1.1 && Math.abs(it.y - cy) < 1.4) { it.got = true; onItem(it); }
    }
  }

  function cull(W, R, onDrop) {
    const lim = R.s - CFG.BEHIND;
    if (W.obs.length) { const keep = []; for (const o of W.obs) { if (o.s1 < lim || o.done && !o.mesh) { onDrop(o); } else if (o.done) { onDrop(o); } else keep.push(o); } W.obs = keep; }
    let i = 0; while (i < W.coins.length && (W.coins[i].got || W.coins[i].s < lim)) i++;
    if (i > 0) W.coins.splice(0, i);
    if (W.coins.length > 1) {
      let sorted = true; for (let k = 1; k < Math.min(W.coins.length, 60); k++) if (W.coins[k].s < W.coins[k - 1].s - 0.01 && !W.coins[k].pull) { sorted = false; break; }
      if (!sorted) W.coins.sort((a, b) => a.s - b.s);
    }
    W.items = W.items.filter(it => { if (it.got || it.s < lim) { onDrop(it); return false; } return true; });
    W.tunnels = W.tunnels.filter(t => t.s1 > lim - 100);
    W.clear = W.clear.filter(c => c[1] > lim);
  }

  function revive(W, R) {
    R.dead = ''; R.deadT = 0; R.ghost = CFG.REVIVE_GHOST; R.chase = 0; R.stumbleT = 0; R.revives++;
    R.t = Math.max(0, R.t * 0.9); R.speed = speedAt(R.t);
    R.vy = 0; R.lt = 1; R.x = LX(R.lane); R.xFrom = R.x;
    for (const o of W.obs) {
      if (o.s1 > R.s - 3 && o.s0 < R.s + 45) o.done = true;
      if (o.moving && o.s0 < R.s + CFG.ACT_D + 40 && o.s1 > R.s - 3) o.done = true;
    }
    if (R.hitObs) R.hitObs.done = true; R.hitObs = null;
    R.y = supportAt(W, R.lane, R.s); R.grounded = true;
    W.clear.push([R.s, R.s + 45]);
  }

  const ICO = {
    coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc91f" stroke="#b87400" stroke-width="2"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#e09a00" stroke-width="1.6"/><path d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="#fff3a8"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="5" fill="none" stroke="#ff3d3d" stroke-width="3.2"/><path d="M12.5 12H22M19 12v4M16 12v3" stroke="#ff3d3d" stroke-width="3.2" stroke-linecap="round"/><circle cx="8" cy="12" r="5" fill="none" stroke="#8a0f12" stroke-width="1" opacity=".6"/></svg>',
    board: '<svg viewBox="0 0 24 24"><rect x="2" y="8.5" width="20" height="7" rx="3.5" fill="#ff4fa3" stroke="#8a1f5a" stroke-width="1.4"/><rect x="5" y="10.4" width="14" height="3.2" rx="1.6" fill="#ffd23f"/><path d="M7 18h10" stroke="#3ad1ff" stroke-width="2" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M3 18l1.5-10 5 4.5L12 5l2.5 7.5 5-4.5L21 18z" fill="#ffd23f" stroke="#a87400" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    jet: '<svg viewBox="0 0 24 24"><rect x="4.5" y="3" width="6" height="13" rx="3" fill="#7cd23a" stroke="#2f6a12" stroke-width="1.2"/><rect x="13.5" y="3" width="6" height="13" rx="3" fill="#7cd23a" stroke="#2f6a12" stroke-width="1.2"/><path d="M4.5 6a3 3 0 016 0zM13.5 6a3 3 0 016 0z" fill="#ff8a1a"/><path d="M5.5 17h4l-2 5zM14.5 17h4l-2 5z" fill="#ffd23f"/></svg>',
    sneak: '<svg viewBox="0 0 24 24"><path d="M3 15c0-3 1-7 3-8l3 3c2 1 5 1 7 2s5 1 5 4v1H3z" fill="#ff9a1a" stroke="#8a4a00" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 16h18v2.5H3z" fill="#ffcf3a" stroke="#8a4a00" stroke-width="1.2"/><path d="M7 9l2-2.5 2 2.5M9 6.5V12" stroke="#7cf03a" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    mag: '<svg viewBox="0 0 24 24"><path d="M5 4v8a7 7 0 0014 0V4h-4.5v8a2.5 2.5 0 01-5 0V4z" fill="#e8343a" stroke="#7a1015" stroke-width="1.3"/><path d="M5 4h4.5v3H5zM14.5 4H19v3h-4.5z" fill="#ffd23f"/></svg>',
    x2: '<svg viewBox="0 0 24 24"><path d="M12 1.5l3 6.3 6.9.9-5 4.8 1.3 6.8L12 17l-6.2 3.3 1.3-6.8-5-4.8 6.9-.9z" fill="#ffc21a" stroke="#a86a00" stroke-width="1.3" stroke-linejoin="round"/><text x="12" y="14.6" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="7" fill="#7a3a00">2X</text></svg>',
    mbox: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#9a3cff" stroke="#ffd23f" stroke-width="2"/><text x="12" y="17.5" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="14" fill="#ffd23f">?</text></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="#fff"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="#fff"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="#fff"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5V20h-6v-5H9v5H3z" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.1l-6 3.3 1.3-6.7-5-4.7 6.8-.8z" fill="#ffd23f" stroke="#a86a00" stroke-width="1.3"/></svg>'
  };
  const SC = '.gm-' + ID;
  const OUT = 'text-shadow:0 2px 0 #12224a,0 -2px 0 #12224a,2px 0 0 #12224a,-2px 0 0 #12224a,1.5px 1.5px 0 #12224a,-1.5px 1.5px 0 #12224a,1.5px -1.5px 0 #12224a,-1.5px -1.5px 0 #12224a,0 4px 0 rgba(0,0,0,.25)';
  const CSS = `
${SC} .ss-stage{position:relative;max-width:100%;border-radius:var(--r,14px);overflow:hidden;container-type:inline-size;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;background:#3a9cf0;box-shadow:0 22px 44px -30px rgba(31,29,43,.6)}
${SC} .ss-stage canvas{display:block;width:100%;height:auto}
${SC} .ss-hud,${SC} .ss-scr{position:absolute;inset:0;font-family:"Lilita One","Nunito",system-ui,sans-serif;font-weight:400;color:#fff;line-height:1;letter-spacing:.02em;font-size:clamp(11px,2.1cqw,22px)}
${SC} .ss-hud{pointer-events:none;transition:opacity .25s}
${SC} .ss-hud.off{opacity:0}
${SC} .ss-hud button{pointer-events:auto}
${SC} button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
${SC} .ss-ic{display:inline-block;width:1.2em;height:1.2em;flex:none;vertical-align:middle}
${SC} .ss-ic svg{width:100%;height:100%;display:block}
${SC} .ss-pause{position:absolute;left:2.4%;top:3.2%;width:3.1em;height:3.1em;border-radius:.8em;background:linear-gradient(#4fb3ff,#1f6fd9);border:.18em solid #fff;box-shadow:0 .25em 0 #12224a;display:grid;place-items:center}
${SC} .ss-pause svg{width:62%}
${SC} .ss-tr{position:absolute;right:2%;top:2.6%;display:flex;flex-direction:column;align-items:flex-end;gap:.28em}
${SC} .ss-score{display:flex;align-items:stretch;gap:.22em;font-size:2.05em;${OUT}}
${SC} .ss-mult{color:#ffd23f;background:rgba(22,34,52,.52);border-radius:.28em;padding:.16em .32em .08em;transition:transform .2s;font-variant-numeric:tabular-nums}
${SC} .ss-sv{font-weight:400;background:rgba(22,34,52,.52);border-radius:.28em;padding:.16em .32em .08em;letter-spacing:.04em;font-variant-numeric:tabular-nums;min-width:4.1em;text-align:center}
${SC} .ss-mult.x2{color:#ff9a3a}
${SC} .ss-mult.pop{transform:scale(1.35)}
${SC} .ss-pill{display:flex;align-items:center;gap:.3em;font-size:1.55em;background:rgba(22,34,52,.52);border-radius:.28em;padding:.16em .32em .08em;${OUT}}
${SC} .ss-pill b{font-weight:400;font-variant-numeric:tabular-nums}
${SC} .ss-pill .ss-ic{width:1.15em;height:1.15em;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
${SC} .ss-keyp{transition:opacity .3s}
${SC} .ss-keyp.hide{opacity:0}
${SC} .ss-pus{position:absolute;left:2%;bottom:4%;display:flex;flex-direction:column-reverse;gap:.45em;align-items:flex-start}
${SC} .ss-pu{display:flex;align-items:center;gap:.3em}
${SC} .ss-pu .ss-ic{width:2.1em;height:2.1em;background:linear-gradient(#ffffff,#d9e2ec);border:.12em solid #2a3a52;border-radius:.4em;padding:.15em;box-sizing:border-box;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
${SC} .ss-pu i{display:block;width:6.4em;height:1.15em;border-radius:.3em;background:#fff;border:.12em solid #2a3a52;padding:.14em;box-sizing:border-box;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
${SC} .ss-pu i b{display:block;height:100%;border-radius:.12em;background:repeating-linear-gradient(90deg,#4fd12a 0 .3em,#2f9a14 .3em .38em)}
${SC} .ss-pu.low i b{background:repeating-linear-gradient(90deg,#ffb31a 0 .3em,#d9700a .3em .38em)}
${SC} .ss-hb{position:absolute;right:2.4%;bottom:4%;width:5em;height:5em;border-radius:50%;background:radial-gradient(circle at 50% 35%,#ff8ac6,#d61f7c);border:.2em solid #fff;box-shadow:0 .28em 0 #12224a;display:grid;place-items:center;transition:transform .12s,opacity .2s}
${SC} .ss-hb .ss-ic{width:64%;height:64%}
${SC} .ss-hb b{position:absolute;right:-.3em;bottom:-.25em;min-width:1.6em;height:1.6em;display:grid;place-items:center;border-radius:1em;background:#ffd23f;color:#7a3a00;border:.12em solid #fff;font-size:.95em}
${SC} .ss-hb.on{transform:scale(.88);opacity:.55}
${SC} .ss-hb.none{opacity:.35}
${SC} .ss-hint{position:absolute;left:0;right:0;top:31%;text-align:center;font-size:1.6em;${OUT};opacity:0;transition:opacity .3s}
${SC} .ss-hint.on{opacity:1}
${SC} .ss-hint small{display:block;font-size:.6em;margin-top:.4em;opacity:.9}
${SC} .ss-banner{position:absolute;left:50%;top:15%;transform:translate(-50%,-30%) scale(.7);background:linear-gradient(#5ad13a,#2e9a1a);border:.18em solid #fff;border-radius:.8em;padding:.55em 1.1em .45em;font-size:1.25em;box-shadow:0 .3em 0 #12224a;opacity:0;transition:all .3s cubic-bezier(.3,1.6,.5,1);white-space:nowrap;${OUT}}
${SC} .ss-banner.on{opacity:1;transform:translate(-50%,0) scale(1)}
${SC} .ss-banner.gold{background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-banner.blue{background:linear-gradient(#4fb3ff,#1f6fd9)}
${SC} .ss-big{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:3.4em;${OUT};opacity:0;transform:scale(.6);transition:all .25s}
${SC} .ss-big.on{opacity:1;transform:scale(1)}
${SC} .ss-scr{display:none;align-items:center;justify-content:center}
${SC} .ss-scr.on{display:flex}
${SC} .ss-home{flex-direction:column;justify-content:space-between;padding:2.6% 2.6% 3%;box-sizing:border-box;background:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 65%,rgba(0,20,60,.35))}
${SC} .ss-bar{display:flex;gap:.6em;justify-content:flex-end;width:100%;flex-wrap:wrap}
${SC} .ss-chip{display:flex;align-items:center;gap:.35em;background:rgba(18,34,74,.6);border:.13em solid rgba(255,255,255,.9);border-radius:2em;padding:.3em .75em .3em .35em;font-size:1.2em;${OUT}}
${SC} .ss-chip .ss-ic{width:1.35em;height:1.35em}
${SC} .ss-mid{flex:1;display:flex;align-items:flex-start;justify-content:space-between;width:100%;padding-top:1.2em}
${SC} .ss-logo{font-size:3.7em;line-height:.84;transform:rotate(-5deg);transform-origin:left;filter:drop-shadow(0.035em 0em 0 #12224a) drop-shadow(-0.035em 0em 0 #12224a) drop-shadow(0em 0.035em 0 #12224a) drop-shadow(0em -0.035em 0 #12224a) drop-shadow(0.075em 0em 0 #3aa8ff) drop-shadow(-0.075em 0em 0 #3aa8ff) drop-shadow(0em 0.075em 0 #3aa8ff) drop-shadow(0em -0.075em 0 #3aa8ff) drop-shadow(0.03em 0em 0 #12224a) drop-shadow(-0.03em 0em 0 #12224a) drop-shadow(0em 0.03em 0 #12224a) drop-shadow(0em -0.03em 0 #12224a) drop-shadow(0 .09em 0 rgba(0,0,0,.3))}
${SC} .ss-logo span{display:block;white-space:nowrap}
${SC} .ss-logo i{display:inline-block;font-style:normal;color:#ffc21a;background:linear-gradient(#fffbb0 8%,#ffd83a 42%,#ff9a1a 92%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;transform:rotate(var(--r)) translateY(var(--y))}
${SC} .ss-logo span+span{margin-left:.25em;font-size:1.12em}
${SC} .ss-tour{background:linear-gradient(#4fb3ff,#1f6fd9);border:.18em solid #fff;border-radius:1em;box-shadow:0 .3em 0 #12224a;padding:.55em .7em .6em;text-align:center;min-width:12em}
${SC} .ss-tour small{display:block;font-size:.8em;color:#ffd23f;${OUT};margin-bottom:.3em}
${SC} .ss-tour .row{display:flex;align-items:center;justify-content:space-between;gap:.4em}
${SC} .ss-tour .row b{font-weight:400;font-size:1.55em;${OUT};white-space:nowrap}
${SC} .ss-tour .row button{width:1.7em;height:1.7em;border-radius:50%;background:#ffd23f;color:#7a3a00;font-size:1.1em;border:.12em solid #fff;box-shadow:0 .15em 0 #12224a}
${SC} .ss-tour .sub{font-size:.85em;opacity:.95;margin-top:.35em}
${SC} .ss-bot{display:flex;flex-direction:column;align-items:center;gap:.9em;width:100%}
${SC} .ss-tap{font-size:3em;${OUT};animation:ss-pulse 1.1s ease-in-out infinite}
@keyframes ss-pulse{50%{transform:scale(1.07)}}
${SC} .ss-menu{display:flex;gap:.7em;flex-wrap:wrap;justify-content:center}
${SC} .ss-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.4em;min-width:7.2em;padding:.62em 1em .52em;border-radius:.75em;background:linear-gradient(#4fb3ff,#1f6fd9);border:.16em solid #fff;box-shadow:0 .28em 0 #12224a;font-size:1.25em;${OUT};transition:transform .08s}
${SC} .ss-btn:active{transform:translateY(.15em);box-shadow:0 .12em 0 #12224a}
${SC} .ss-btn.g{background:linear-gradient(#7be04a,#2e9a1a)}
${SC} .ss-btn.y{background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-btn.r{background:linear-gradient(#ff7a6a,#d8282c)}
${SC} .ss-btn.dis{filter:grayscale(.8) brightness(.85);cursor:default}
${SC} .ss-btn .ss-ic{width:1.2em;height:1.2em}
${SC} .ss-btn .bdg{position:absolute;top:-.7em;right:-.6em;background:#ffd23f;color:#7a3a00;text-shadow:none;border:.12em solid #fff;border-radius:1em;padding:.2em .4em .1em;font-size:.75em}
${SC} .ss-dim{background:rgba(8,18,44,.55);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
${SC} .ss-card{position:relative;width:min(92%,30em);max-height:90%;overflow:auto;box-sizing:border-box;background:linear-gradient(#3aa0ff,#1a5fc9);border:.22em solid #fff;border-radius:1.2em;box-shadow:0 .4em 0 #12224a,0 1em 3em rgba(0,0,0,.35);padding:1em 1.1em 1.2em;text-align:center;scrollbar-width:thin}
${SC} .ss-card h3{margin:0 0 .5em;font-weight:400;font-size:2em;color:#ffd23f;${OUT}}
${SC} .ss-card .x{position:absolute;right:.5em;top:.5em;width:2em;height:2em;border-radius:50%;background:linear-gradient(#ff7a6a,#d8282c);border:.13em solid #fff;font-size:1.05em;${OUT}}
${SC} .ss-tabs{display:flex;gap:.4em;justify-content:center;margin-bottom:.7em}
${SC} .ss-tabs button{padding:.45em .8em .35em;border-radius:.6em;background:rgba(0,0,0,.25);border:.12em solid rgba(255,255,255,.5);font-size:1.05em;${OUT}}
${SC} .ss-tabs button.on{background:#ffd23f;color:#7a3a00;text-shadow:none;border-color:#fff}
${SC} .ss-list{display:flex;flex-direction:column;gap:.5em;text-align:left}
${SC} .ss-row{display:flex;align-items:center;gap:.6em;background:rgba(10,30,80,.35);border:.12em solid rgba(255,255,255,.35);border-radius:.8em;padding:.5em .6em}
${SC} .ss-row .ss-ic{width:2.3em;height:2.3em;flex:none}
${SC} .ss-row .t{flex:1;min-width:0}
${SC} .ss-row .t b{display:block;font-weight:400;font-size:1.15em;${OUT}}
${SC} .ss-row .t small{display:block;font-family:"Nunito",system-ui,sans-serif;font-weight:800;font-size:.85em;opacity:.92;margin-top:.25em;letter-spacing:0}
${SC} .ss-pips{display:flex;gap:.22em;margin-top:.35em}
${SC} .ss-pips i{width:1.2em;height:.5em;border-radius:.3em;background:rgba(0,0,0,.35)}
${SC} .ss-pips i.on{background:#7be04a}
${SC} .ss-row .ss-btn{min-width:5.4em;font-size:1em;padding:.5em .6em .42em}
${SC} .ss-row .ss-btn .ss-ic{width:1.1em;height:1.1em}
${SC} .ss-prog{height:.6em;border-radius:1em;background:rgba(0,0,0,.35);overflow:hidden;margin-top:.4em}
${SC} .ss-prog b{display:block;height:100%;background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-row.done{background:rgba(46,154,26,.55)}
${SC} .ss-row.done .ss-prog b{background:#7be04a}
${SC} .ss-chk{width:2em;height:2em;border-radius:50%;flex:none;display:grid;place-items:center;background:rgba(0,0,0,.3);border:.12em solid rgba(255,255,255,.6)}
${SC} .ss-row.done .ss-chk{background:#2e9a1a;border-color:#fff}
${SC} .ss-chk svg{width:70%}
${SC} .ss-multi{display:flex;align-items:center;justify-content:center;gap:.5em;margin:.2em 0 .8em;font-size:1.2em;${OUT}}
${SC} .ss-multi .ss-ic{width:1.3em;height:1.3em}
${SC} .ss-multi b{font-weight:400;font-size:1.4em;color:#ffd23f}
${SC} .ss-chars{display:grid;grid-template-columns:repeat(4,1fr);gap:.5em}
@container (max-width: 640px){${SC} .ss-chars{grid-template-columns:repeat(2,1fr)}}
${SC} .ss-char{background:rgba(10,30,80,.35);border:.14em solid rgba(255,255,255,.4);border-radius:.9em;padding:.6em .5em;display:flex;flex-direction:column;align-items:center;gap:.45em}
${SC} .ss-char.sel{border-color:#ffd23f;background:rgba(255,210,63,.22)}
${SC} .ss-char canvas{width:4.4em;height:5.1em}
${SC} .ss-char b{font-weight:400;font-size:1.2em;${OUT}}
${SC} .ss-char .ss-btn{font-size:.95em;min-width:6em}
${SC} .ss-res{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:.5em;margin:.3em 0 .7em}
${SC} .ss-res div{background:rgba(10,30,80,.35);border-radius:.8em;padding:.55em .4em}
${SC} .ss-res small{display:block;font-size:.85em;color:#bfe0ff;margin-bottom:.3em}
${SC} .ss-res b{font-weight:400;font-size:1.7em;${OUT}}
${SC} .ss-res .big b{font-size:2.1em}
${SC} .ss-new{display:inline-block;background:linear-gradient(#ffe25a,#ffaa1a);color:#7a3a00;border:.13em solid #fff;border-radius:.6em;padding:.3em .6em .2em;margin-bottom:.4em;transform:rotate(-3deg);font-size:1.1em}
${SC} .ss-btns{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap;margin-top:.4em}
${SC} .ss-save .ss-card{width:min(80%,19em)}
${SC} .ss-over .ss-card,${SC} .ss-panel .ss-card,${SC} .ss-pausep .ss-card{width:min(94%,36em)}
${SC} .ss-over .ss-card h3{font-size:1.7em;margin-bottom:.3em}
${SC} .ss-over .ss-row,${SC} .ss-pausep .ss-row{padding:.35em .55em}
${SC} .ss-over .ss-row .t b,${SC} .ss-pausep .ss-row .t b{font-size:.95em}
${SC} .ss-over .ss-row small,${SC} .ss-pausep .ss-row small{display:none}
${SC} .ss-over .ss-list{gap:.3em}
${SC} .ss-over .ss-chk{width:1.5em;height:1.5em}
${SC} .ss-ring{position:relative;width:8em;height:8em;margin:.2em auto .8em}
${SC} .ss-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
${SC} .ss-ring .k{position:absolute;inset:0;display:grid;place-items:center}
${SC} .ss-ring .k .ss-ic{width:3.6em;height:3.6em}
${SC} .ss-small{font-family:"Nunito",system-ui,sans-serif;font-weight:800;font-size:.9em;opacity:.9;letter-spacing:0;margin:.4em 0 0}
${SC} .ss-toast{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);background:rgba(18,34,74,.75);border:.13em solid #fff;border-radius:1em;padding:.5em .9em .4em;font-size:1.1em;opacity:0;transition:opacity .25s;white-space:nowrap;${OUT}}
${SC} .ss-toast.on{opacity:1}
${SC} .ss-card{background:repeating-linear-gradient(0deg,rgba(70,100,140,.09) 0 1px,transparent 1px 1.3em),repeating-linear-gradient(90deg,rgba(70,100,140,.09) 0 1px,transparent 1px 1.3em),linear-gradient(#fbfcfd,#e9eef3);border:0;border-radius:.55em;box-shadow:0 .32em 0 #8d99a8,0 1em 2.6em rgba(0,0,0,.4);padding:2.3em 1.1em 1.2em}
${SC} .ss-card:before{content:"";position:absolute;left:.9em;right:.9em;top:.25em;height:1.5em;background:repeating-linear-gradient(90deg,transparent 0 .32em,#6f7882 .32em .44em,#eef1f4 .44em .6em,#6f7882 .6em .7em,transparent .7em 1.15em);border-radius:.3em;pointer-events:none}
${SC} .ss-card:after{content:"";position:absolute;left:.9em;right:.9em;top:1.45em;height:.42em;background:radial-gradient(circle at .51em 50%,#3a4250 .17em,transparent .19em) 0 0/1.15em 100% repeat-x;pointer-events:none}
${SC} .ss-card h3{color:#1f56a8;text-shadow:0 .06em 0 #fff,0 .1em 0 rgba(0,0,0,.12);letter-spacing:.01em}
${SC} .ss-card .x{right:auto;left:-.2em;top:-.2em;z-index:1}
${SC} .ss-row{background:linear-gradient(#7189a8,#4b6385);border:.12em solid #33465f;border-radius:.45em;box-shadow:inset 0 .12em 0 rgba(255,255,255,.25)}
${SC} .ss-row .t b{color:#ffd23f}
${SC} .ss-row.done{background:linear-gradient(#5fbf3a,#3a9420)}
${SC} .ss-row.done .t b{color:#fff}
${SC} .ss-tabs button{background:linear-gradient(#7189a8,#4b6385);border-color:#33465f}
${SC} .ss-multi{color:#1d3f73;text-shadow:none}
${SC} .ss-multi b{color:#fff;background:#33465f;border-radius:.4em;padding:.15em .45em .05em;${OUT}}
${SC} .ss-small{color:#3d5070;opacity:1}
${SC} .ss-res div{background:linear-gradient(#4a92ea,#1f60c4);border:.14em solid #12407f;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.55)}
${SC} .ss-res small{color:#ffd23f;${OUT}}
${SC} .ss-char{background:rgba(75,99,133,.14);border-color:rgba(51,70,95,.45)}
${SC} .ss-char.sel{border-color:#2e9a1a;background:rgba(95,191,58,.2)}
${SC} .ss-char b{color:#1f56a8;text-shadow:0 .06em 0 #fff}
${SC} .ss-btn{background:linear-gradient(#6f86a6,#3d5070);border-color:#fff}
${SC} .ss-btn.g{background:linear-gradient(#7be04a,#2e9a1a)}
${SC} .ss-dim{background:rgba(8,18,44,.45)}
@container (max-width: 640px){${SC} .ss-hud,${SC} .ss-scr{font-size:clamp(10px,3.1cqw,18px)}${SC} .ss-logo{font-size:3em}${SC} .ss-mid{flex-direction:column;gap:1em;align-items:center}${SC} .ss-logo{transform:rotate(-4deg);transform-origin:center;text-align:center}}
`;
  const ic = k => `<span class="ss-ic">${ICO[k]}</span>`;
  const logoW = (w, o) => [...w].map((c, i) => `<i style="--r:${[-7, 5, -3, 6, -5, 4, -6][(i + o) % 7]}deg;--y:${[0.03, -0.05, 0.02, -0.03, 0.05, -0.02, 0][(i + o) % 7]}em">${c}</i>`).join('');
  const HTML = `
<div class="ss-hud off">
  <button class="ss-pause" aria-label="Pause">${ICO.pause}</button>
  <div class="ss-tr">
    <div class="ss-score"><span class="ss-mult">x1</span><b class="ss-sv">0</b></div>
    <div class="ss-pill"><b class="ss-cv">0</b>${ic('coin')}</div>
    <div class="ss-pill ss-keyp hide"><b class="ss-kv">0</b>${ic('key')}</div>
  </div>
  <div class="ss-pus"></div>
  <button class="ss-hb" aria-label="Hoverboard">${ic('board')}<b class="ss-hbn">0</b></button>
  <div class="ss-hint"></div>
  <div class="ss-banner"></div>
  <div class="ss-big"></div>
  <div class="ss-toast"></div>
</div>
<div class="ss-scr ss-home">
  <div class="ss-bar"><div class="ss-chip">${ic('crown')}<b class="h-best">0</b></div><div class="ss-chip">${ic('coin')}<b class="h-coins">0</b></div><div class="ss-chip">${ic('key')}<b class="h-keys">0</b></div><div class="ss-chip">${ic('board')}<b class="h-boards">0</b></div></div>
  <div class="ss-mid">
    <div class="ss-logo"><span>${logoW('SUBWAY', 0)}</span><span>${logoW('SURFERS', 3)}</span></div>
    <div class="ss-tour"><small>WORLD TOUR</small><div class="row"><button class="t-prev" aria-label="Previous city">&#9664;</button><b class="t-name">Subway City</b><button class="t-next" aria-label="Next city">&#9654;</button></div><div class="sub t-sub"></div></div>
  </div>
  <div class="ss-bot">
    <div class="ss-tap">TAP TO PLAY</div>
    <div class="ss-menu"><button class="ss-btn y" data-o="missions">${ic('star')}Missions<span class="bdg h-mult">x1</span></button><button class="ss-btn g" data-o="shop">${ic('coin')}Shop</button><button class="ss-btn" data-o="chars">Surfers</button></div>
  </div>
</div>
<div class="ss-scr ss-dim ss-panel"><div class="ss-card"><button class="x" aria-label="Close">&#10005;</button><h3 class="p-title"></h3><div class="p-body"></div></div></div>
<div class="ss-scr ss-dim ss-save"><div class="ss-card"><h3>Save me!</h3><div class="ss-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="9"/><circle class="s-arc" cx="50" cy="50" r="44" fill="none" stroke="#ffd23f" stroke-width="9" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="k">${ic('key')}</div></div><button class="ss-btn g s-go">Use <b class="s-cost">1</b> ${ic('key')}</button><p class="ss-small s-have"></p><div class="ss-btns"><button class="ss-btn r s-skip">No thanks</button></div></div></div>
<div class="ss-scr ss-dim ss-over"><div class="ss-card"><h3 class="o-title">Game over</h3><div class="o-new"></div><div class="ss-res"><div class="big"><small>SCORE</small><b class="o-score">0</b></div><div><small>HIGH SCORE</small><b class="o-best">0</b></div><div><small>COINS</small><b class="o-coins">0</b></div></div><div class="ss-list o-ms"></div><div class="ss-btns"><button class="ss-btn g o-play">${ic('play')}Play</button><button class="ss-btn o-home">${ic('home')}Home</button><button class="ss-btn y o-shop">${ic('coin')}Shop</button></div></div></div>
<div class="ss-scr ss-dim ss-pausep"><div class="ss-card"><h3>Paused</h3><div class="ss-list pz-ms"></div><div class="ss-btns"><button class="ss-btn g pz-go">${ic('play')}Resume</button><button class="ss-btn pz-home">${ic('home')}Home</button></div></div></div>
`;

  function mkAudio(api) {
    let ctx = null, master = null, sfx = null, mus = null, nb = null, jetN = null, musOn = false, nextT = 0, step16 = 0;
    const AC = window.AudioContext || window.webkitAudioContext;
    function ensure() {
      if (!AC) return false;
      if (!ctx) {
        try {
          ctx = new AC();
          master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
          sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
          mus = ctx.createGain(); mus.gain.value = 0; mus.connect(master);
          const n = ctx.sampleRate; nb = ctx.createBuffer(1, n, n); const d = nb.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ctx = null; return false; }
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return true;
    }
    function tone(type, f0, f1, t, dur, vol, out, attack) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out || sfx); o.start(t); o.stop(t + dur + 0.02);
    }
    function noise(t, dur, vol, ftype, f0, f1, q, out) {
      const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = ftype || 'lowpass'; f.frequency.setValueAtTime(f0 || 1000, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out || sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    const S = {
      coin: t => { tone('sine', 1568, 1568, t, 0.07, 0.16); tone('sine', 2093, 2093, t + 0.05, 0.14, 0.14); },
      jump: t => { tone('triangle', 260, 620, t, 0.16, 0.18); noise(t, 0.16, 0.08, 'bandpass', 900, 2600, 1.2); },
      roll: t => { noise(t, 0.3, 0.2, 'lowpass', 1800, 300, 1); tone('sine', 220, 110, t, 0.2, 0.1); },
      lane: t => noise(t, 0.09, 0.06, 'bandpass', 1500, 3000, 1.5),
      land: t => tone('sine', 120, 60, t, 0.1, 0.18),
      land_hard: t => { tone('sine', 110, 45, t, 0.16, 0.28); noise(t, 0.1, 0.1, 'lowpass', 600, 200); },
      bump: t => { tone('square', 160, 70, t, 0.18, 0.12); noise(t, 0.15, 0.2, 'lowpass', 900, 200); },
      crash: t => { noise(t, 0.6, 0.45, 'lowpass', 2500, 120); tone('sine', 90, 30, t, 0.5, 0.45); tone('square', 300, 80, t, 0.25, 0.08); },
      caught: t => { for (let i = 0; i < 6; i++) tone('sine', 2800, 2600, t + i * 0.07, 0.06, 0.08); },
      pu: t => { [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, t + i * 0.06, 0.16, 0.16)); },
      key: t => { [1318, 1760, 2637].forEach((f, i) => tone('sine', f, f, t + i * 0.07, 0.3, 0.12)); },
      mbox: t => { [392, 523, 659, 784, 1046].forEach((f, i) => tone('square', f, f, t + i * 0.05, 0.12, 0.06)); },
      board_on: t => { tone('sawtooth', 200, 900, t, 0.35, 0.08); tone('sine', 400, 1600, t, 0.35, 0.12); },
      board_break: t => { noise(t, 0.4, 0.4, 'highpass', 800, 3000, 0.8); tone('square', 600, 90, t, 0.3, 0.1); },
      board_end: t => tone('sine', 900, 300, t, 0.3, 0.08),
      horn: t => { for (const f of [311, 370]) tone('sawtooth', f, f * 0.98, t, 0.75, 0.035, null, 0.05); },
      jet_end: t => tone('sine', 700, 200, t, 0.4, 0.1),
      mission: t => { [784, 988, 1175, 1568].forEach((f, i) => tone('triangle', f, f, t + i * 0.09, 0.25, 0.14)); },
      ui: t => tone('sine', 880, 1200, t, 0.06, 0.1),
      buy: t => { tone('sine', 1046, 1046, t, 0.08, 0.12); tone('sine', 1568, 1568, t + 0.07, 0.18, 0.12); }
    };
    const BASS = [43, 0, 0, 43, 0, 0, 46, 0, 41, 0, 0, 41, 0, 38, 0, 0];
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    function schedule() {
      const spb = 60 / 96 / 4;
      while (nextT < ctx.currentTime + 0.15) {
        const t = nextT, k = step16 % 16, bar = (step16 >> 4) % 4;
        if (k === 0 || k === 7 || k === 10) { tone('sine', 140, 45, t, 0.22, 0.42, mus); }
        if (k === 4 || k === 12) { noise(t, 0.16, 0.32, 'bandpass', 1800, 900, 0.7, mus); tone('triangle', 220, 140, t, 0.08, 0.12, mus); }
        if (k % 2 === 0) noise(t, 0.04, k % 4 === 2 ? 0.12 : 0.06, 'highpass', 7000, 0, 1, mus);
        const bn = BASS[k]; if (bn) tone('square', midi(bn + (bar === 3 ? 2 : 0)), midi(bn + (bar === 3 ? 2 : 0)), t, spb * 1.8, 0.07, mus, 0.01);
        if (k === 0 && bar % 2 === 0) [67, 70, 74].forEach(n => tone('triangle', midi(n), midi(n), t, spb * 6, 0.02, mus, 0.02));
        nextT += spb; step16++;
      }
    }
    return {
      unlock() { if (!api.muted) ensure(); },
      play(name) { if (api.muted || !S[name] || !ensure() || ctx.state === 'closed') return; try { S[name](ctx.currentTime + 0.005); } catch (e) {} },
      music(on) { musOn = on; },
      jet(on) {
        if (!ctx) return;
        if (on && !jetN && !api.muted) {
          const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = ctx.createGain(); g.gain.value = 0.12;
          s.connect(f); f.connect(g); g.connect(sfx); s.start(); jetN = { s, g };
        } else if (!on && jetN) { try { jetN.g.gain.setTargetAtTime(0, ctx.currentTime, 0.08); jetN.s.stop(ctx.currentTime + 0.3); } catch (e) {} jetN = null; }
      },
      tick() {
        if (!ctx || ctx.state !== 'running') return;
        if (api.muted) { if (jetN) this.jet(false); mus.gain.value = 0; return; }
        const target = musOn ? 0.55 : 0;
        mus.gain.value += (target - mus.gain.value) * 0.05;
        if (mus.gain.value > 0.01) { if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05; schedule(); }
      },
      close() { try { if (jetN) jetN.s.stop(); } catch (e) {} try { ctx && ctx.close(); } catch (e) {} ctx = null; }
    };
  }

  function ensureFont() {
    try {
      if (document.querySelector('link[data-ss-font]')) return;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Lilita+One&display=swap'; l.setAttribute('data-ss-font', '1');
      document.head.append(l);
    } catch (e) {}
  }
  function avatar(P) {
    const c = document.createElement('canvas'); c.width = 120; c.height = 140;
    const g = c.getContext('2d');
    g.fillStyle = P.top; rr(g, 22, 92, 76, 60, 22); g.fill();
    if (P.vest) { g.fillStyle = P.vest; g.fillRect(22, 100, 22, 40); g.fillRect(76, 100, 22, 40); }
    g.fillStyle = P.under; g.fillRect(54, 96, 12, 40);
    g.fillStyle = P.skin; g.beginPath(); g.ellipse(60, 62, 34, 36, 0, 0, TAU); g.fill();
    g.fillStyle = P.hair; g.beginPath(); g.ellipse(60, 44, 34, 20, 0, Math.PI, 0); g.fill();
    if (P.extra === 'pony') { g.beginPath(); g.ellipse(94, 66, 10, 22, 0.3, 0, TAU); g.fill(); }
    g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(60 + s * 13, 62, 8, 10, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#1d1b26'; for (const s of [-1, 1]) { g.beginPath(); g.arc(60 + s * 13, 64, 4.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#7a2a2a'; g.lineWidth = 3; g.beginPath(); g.arc(60, 78, 9, 0.2, Math.PI - 0.2); g.stroke();
    if (P.hat === 'cap') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 38, 35, 24, 0, Math.PI, 0); g.fill(); g.fillStyle = P.hatB; rr(g, 46, 18, 28, 18, 6); g.fill(); g.fillStyle = P.hatA; rr(g, 30, 34, 62, 9, 4); g.fill(); }
    else if (P.hat === 'beanie') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 40, 35, 30, 0, Math.PI, 0); g.fill(); g.fillStyle = P.hatB; g.fillRect(25, 34, 70, 10); g.beginPath(); g.arc(60, 9, 8, 0, TAU); g.fill(); }
    else if (P.hat === 'alien') { g.fillStyle = P.hatA; g.beginPath(); g.ellipse(60, 40, 36, 28, 0, Math.PI, 0); g.fill(); g.strokeStyle = P.hatA; g.lineWidth = 3; g.beginPath(); g.moveTo(48, 16); g.lineTo(40, 2); g.moveTo(72, 16); g.lineTo(80, 2); g.stroke(); g.fillStyle = P.hatB; g.beginPath(); g.arc(40, 3, 5, 0, TAU); g.arc(80, 3, 5, 0, TAU); g.fill(); }
    if (P.extra === 'phones') { g.strokeStyle = '#2f2f3a'; g.lineWidth = 6; g.beginPath(); g.arc(60, 100, 26, 0.1, Math.PI - 0.1); g.stroke(); }
    return c;
  }

  Ameplay.register({
    id: ID,
    title: 'Subway Surfers',
    category: '3D',
    tint: '#ffb31a',
    better: 'high',
    width: 960,
    blurb: 'Dash through the subway, surf the trains and outrun the Inspector and his dog.',
    help: '<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> switch lane · <kbd>↑</kbd>/<kbd>W</kbd> jump · <kbd>↓</kbd>/<kbd>S</kbd> roll · <kbd>Space</kbd> hoverboard · <kbd>P</kbd> pause · swipe and double-tap on touch',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="10" r="5"/><path d="M37 18l-7 14 8 7v11M30 32l-9 4h-5M26 22l11-4 6 8 8-1"/><path d="M8 60l10-20M56 60L46 40M18 50h28"/></svg>',
    css: CSS,
    core: { CFG, newWorld, newRun, step, act, gen, supportAt, speedAt },
    async mount(root, api) {
      ensureFont();
      const portrait = root.clientWidth > 0 && root.clientWidth < 600;
      const VW = portrait ? 600 : 960, VH = portrait ? 900 : 600;
      const v = await api.gl(VW, VH);
      if (!v) return;
      const { THREE, renderer } = v;
      const COARSE = matchMedia('(pointer: coarse)').matches;
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.NoToneMapping;
      let prCap = COARSE ? 1.6 : 2;
      const capPR = () => { if (renderer.getPixelRatio() > prCap + 0.01) renderer.setPixelRatio(prCap); };
      capPR();

      const wrap = document.createElement('div');
      wrap.className = 'ss-stage';
      wrap.style.width = v.canvas.style.width;
      wrap.style.aspectRatio = v.canvas.style.aspectRatio;
      v.canvas.style.width = '100%';
      root.append(wrap);
      wrap.append(v.canvas);
      wrap.insertAdjacentHTML('beforeend', HTML);
      const q = s => wrap.querySelector(s);
      const E = {
        hud: q('.ss-hud'), sv: q('.ss-sv'), cv: q('.ss-cv'), kv: q('.ss-kv'), keyp: q('.ss-keyp'), mult: q('.ss-mult'), pus: q('.ss-pus'), hb: q('.ss-hb'), hbn: q('.ss-hbn'),
        hint: q('.ss-hint'), banner: q('.ss-banner'), big: q('.ss-big'), toast: q('.ss-toast'), pause: q('.ss-pause'),
        home: q('.ss-home'), panel: q('.ss-panel'), ptitle: q('.p-title'), pbody: q('.p-body'), save: q('.ss-save'), over: q('.ss-over'), pausep: q('.ss-pausep'),
        hbest: q('.h-best'), hcoins: q('.h-coins'), hkeys: q('.h-keys'), hboards: q('.h-boards'), hmult: q('.h-mult'), tname: q('.t-name'), tsub: q('.t-sub'),
        sarc: q('.s-arc'), scost: q('.s-cost'), shave: q('.s-have'), sgo: q('.s-go')
      };

      const bin = new Set();
      const keep = x => (bin.add(x), x);
      const T = mkTex(THREE, renderer);
      const toonMap = keep(T.toon());
      const CH = mkChars(THREE, toonMap, bin);

      const loaded = api.load() || {};
      const save = {
        v: 2, coins: loaded.coins | 0, keys: loaded.keys == null ? 2 : loaded.keys | 0, boards: loaded.boards == null ? 3 : loaded.boards | 0,
        upg: Object.assign({ jet: 0, sneak: 0, mag: 0, x2: 0 }, loaded.upg || {}), ms: loaded.ms && loaded.ms.lvl ? loaded.ms : { lvl: 1, base: [0, 0, 0], done: [false, false, false] },
        chars: Array.isArray(loaded.chars) ? loaded.chars : ['jake'], char: loaded.char || 'jake', city: loaded.city | 0, runs: loaded.runs | 0, best: loaded.best | 0
      };
      if (!CHARS.find(c => c.id === save.char)) save.char = 'jake';
      save.city = clamp(save.city, 0, CITIES.length - 1);
      const persist = () => api.save(save);
      const au = mkAudio(api);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(portrait ? 70 : 60, VW / VH, 0.1, 520);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
      const sun = new THREE.DirectionalLight(0xffffff, 0.8);
      sun.position.set(-0.45, 1, 0.5);
      scene.add(hemi, sun, sun.target);
      scene.fog = new THREE.Fog(0xffffff, 70, 215);

      const blobTex = keep(T.blob());
      const blobMat = keep(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.85 }));
      const blobGeo = keep(new THREE.PlaneGeometry(1, 1)); blobGeo.rotateX(-Math.PI / 2);
      const mkBlob = s => { const m = new THREE.Mesh(blobGeo, blobMat); m.scale.set(s, 1, s * 1.2); m.renderOrder = 1; scene.add(m); return m; };
      const glowTex = { y: keep(T.glow('rgba(255,220,90,.8)')), w: keep(T.glow('rgba(255,255,220,.9)')), p: keep(T.glow('rgba(190,110,255,.8)')), r: keep(T.glow('rgba(255,90,90,.8)')), g: keep(T.glow('rgba(110,255,140,.8)')) };
      const glowMat = k => keep(new THREE.SpriteMaterial({ map: glowTex[k], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      const GM = { y: glowMat('y'), w: glowMat('w'), p: glowMat('p'), r: glowMat('r'), g: glowMat('g') };

      let ENV = null;
      const atlasMat = keep(new THREE.MeshLambertMaterial({ vertexColors: true }));
      const lampMat = keep(new THREE.MeshBasicMaterial({ vertexColors: true }));
      const railMat = keep(new THREE.MeshLambertMaterial({ vertexColors: true }));
      const fenceTex = keep(T.fence());
      const fenceMat = keep(new THREE.MeshLambertMaterial({ map: fenceTex, alphaTest: 0.5, side: THREE.DoubleSide }));
      const trackMat = keep(new THREE.MeshLambertMaterial({ color: 0xffffff }));
      const trackGeo = keep(new THREE.PlaneGeometry(CFG.LANE * 3, 320, 1, 1)); trackGeo.rotateX(-Math.PI / 2); trackGeo.translate(0, 0.005, -140);
      { const ua = trackGeo.attributes.uv.array; for (let i = 1; i < ua.length; i += 2) ua[i] *= 320 / 4; }
      const track = new THREE.Mesh(trackGeo, trackMat); scene.add(track);
      let rails = null;
      const farGeo = keep(new THREE.PlaneGeometry(900, 520)); farGeo.rotateX(-Math.PI / 2);
      const farMat = keep(new THREE.MeshLambertMaterial({ color: 0xffffff }));
      const far = new THREE.Mesh(farGeo, farMat); far.position.y = -0.08; scene.add(far);
      const skyMat = keep(new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthWrite: false }));
      const skyPlane = new THREE.Mesh(keep(new THREE.PlaneGeometry(560, 140)), skyMat); skyPlane.renderOrder = -1; scene.add(skyPlane);
      const sunSprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowTex.w, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })));
      sunSprite.scale.set(90, 90, 1); scene.add(sunSprite);

      function buildCity(i) {
        if (ENV) { ENV.dispose(); }
        const city = CITIES[i];
        const AT = T.atlas(city);
        const WG = mkWorld(THREE, AT, city);
        const trackTex = T.track(city), skyTex = T.sky(city), skylineTex = T.skyline(city);
        atlasMat.map = AT.tex; atlasMat.needsUpdate = true;
        trackMat.map = trackTex; trackMat.needsUpdate = true;
        skyMat.map = skylineTex; skyMat.needsUpdate = true;
        scene.background = skyTex;
        scene.fog.color.set(city.fog).convertSRGBToLinear();
        farMat.color.set(shade(city.walk, -0.12)).convertSRGBToLinear();
        hemi.color.set(city.hemi[0]).convertSRGBToLinear(); hemi.groundColor.set(city.hemi[1]).convertSRGBToLinear();
        sun.color.set(city.sun).convertSRGBToLinear();
        if (rails) scene.remove(rails);
        rails = new THREE.Mesh(WG.rails, railMat); scene.add(rails);
        ENV = { city, AT, WG, light: city.light, dispose() { AT.tex.dispose(); trackTex.dispose(); skyTex.dispose(); skylineTex.dispose(); WG.bin.forEach(g => g.dispose()); } };
        clearChunks(); clearObsMeshes();
      }

      const chunks = new Map();
      function clearChunks() { for (const arr of chunks.values()) for (const m of arr) scene.remove(m); chunks.clear(); }
      function chunkKind(i, side) { if (i >= -2 && i <= 0) return side < 0 ? 4 : 1; const h = hash(Math.floor(i / 2) * 7.31 + side * 13.7 + save.city * 3.3); return h < 0.36 ? 4 : h < 0.55 ? 0 : h < 0.72 ? 1 : h < 0.84 ? 2 : 3; }
      function makeChunk(i) {
        const arr = [], s0 = i * CFG.CHUNK, z = -s0, WG = ENV.WG;
        const add = (geo, mat, zz) => { const m = new THREE.Mesh(geo, mat); m.position.set(0, 0, zz); m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); arr.push(m); };
        const tun = W.tunnels.find(t => s0 >= t.s0 && s0 < t.s1);
        if (tun) { add(WG.tunnel, atlasMat, z); add(WG.tunnelLamp, lampMat, z); if (s0 === tun.s0) add(WG.portal, atlasMat, z); }
        else {
          const kl = chunkKind(i, -1) * 2 + (i & 1), kr = chunkKind(i, 1) * 2 + ((i >> 1) & 1);
          const L = WG.side.L[kl], Rr = WG.side.R[kr];
          add(L.geo, atlasMat, z); if (L.fence) add(L.fence, fenceMat, z);
          add(Rr.geo, atlasMat, z); if (Rr.fence) add(Rr.fence, fenceMat, z);
          if (((i % 3) + 3) % 3 === 1) { add(WG.gantry, atlasMat, z - 20); add(WG.gantryLamp, lampMat, z - 20); }
          add(WG.wires, atlasMat, z);
        }
        return arr;
      }
      function syncChunks(s) {
        const i0 = Math.floor((s - 50) / CFG.CHUNK), i1 = Math.floor((s + 215) / CFG.CHUNK);
        for (const [i, arr] of chunks) if (i < i0 || i > i1) { for (const m of arr) scene.remove(m); chunks.delete(i); }
        for (let i = i0; i <= i1; i++) if (!chunks.has(i)) chunks.set(i, makeChunk(i));
      }

      function obsMesh(o) {
        const WG = ENV.WG, g = new THREE.Group();
        if (o.k === 'train') {
          for (let c = 0; c < o.cars; c++) {
            const geo = c === 0 ? (o.moving ? WG.car.lit[o.liv] : WG.car.front[o.liv]) : WG.car.mid[o.liv];
            const m = new THREE.Mesh(geo, atlasMat); m.position.z = -c * (CFG.CAR + CFG.CGAP); g.add(m);
          }
          if (o.moving) for (const sx of [-0.73, 0.73]) { const sp = new THREE.Sprite(GM.w); sp.scale.set(2.2, 2.2, 1); sp.position.set(sx, 1.0, 0.25); g.add(sp); }
        } else if (o.k === 'ramp') g.add(new THREE.Mesh(WG.ramp, atlasMat));
        else if (o.k === 'low') { const m = new THREE.Mesh(WG.low, atlasMat); m.position.z = -CFG.BAR_D; g.add(m); }
        else if (o.k === 'high') { const m = new THREE.Mesh(WG.high, atlasMat); m.position.z = -CFG.BAR_D; g.add(m); const l = new THREE.Mesh(WG.highLamp, lampMat); l.position.z = -CFG.BAR_D; g.add(l); }
        g.position.set(LX(o.lane), 0, -o.s0);
        scene.add(g); o.mesh = g;
      }
      function dropMesh(o) { if (o.mesh) { scene.remove(o.mesh); o.mesh = null; } }
      function clearObsMeshes() { if (W) { for (const o of W.obs) dropMesh(o); for (const it of W.items) dropMesh(it); } }

      const coinGeo = keep(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 22)); coinGeo.rotateX(Math.PI / 2);
      const coinFace = keep(T.coin());
      const coinMats = [keep(new THREE.MeshLambertMaterial({ color: new THREE.Color('#ffb31a').convertSRGBToLinear(), emissive: new THREE.Color('#5a3200') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') })), keep(new THREE.MeshLambertMaterial({ map: coinFace, emissive: new THREE.Color('#3a2400') }))];
      const MAXC = 480;
      const coinIM = new THREE.InstancedMesh(coinGeo, coinMats, MAXC); coinIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); coinIM.frustumCulled = false; coinIM.count = 0; scene.add(coinIM);
      const dummy = new THREE.Object3D();

      const sparks = [];
      for (let i = 0; i < 14; i++) { const sp = new THREE.Sprite(GM.y); sp.visible = false; sp.userData.t = 0; scene.add(sp); sparks.push(sp); }
      let sparkI = 0;
      function spark(x, y, z, k, s) { const sp = sparks[sparkI++ % sparks.length]; sp.material = GM[k || 'y']; sp.position.set(x, y, z); sp.visible = true; sp.userData.t = 0; sp.userData.s = s || 1.4; }

      const IM = {};
      const itemModel = k => {
        const g = new THREE.Group(), M = CH.M, m = CH.mesh, rb = CH.rbox, cy = CH.cyl;
        if (k === 'jet') { for (const s of [-1, 1]) { m(cy(0.17, 0.17, 0.62, 12), M('#7cd23a'), s * 0.2, 0.31, 0, g); m(CH.ball(0.17, 10), M('#ff8a1a'), s * 0.2, 0.33, 0, g); m(cy(0.1, 0.15, 0.14, 10), M('#c9ccd2'), s * 0.2, -0.31, 0, g); } m(rb(0.18, 0.5, 0.12), M('#ffd23f'), 0, 0.05, 0, g); }
        else if (k === 'sneak') { m(rb(0.36, 0.26, 0.7, 0.5), M('#ff9a1a'), 0, 0.05, 0, g); m(rb(0.4, 0.12, 0.76, 0.5), M('#ffcf3a'), 0, -0.11, 0, g); m(rb(0.32, 0.36, 0.32, 0.5), M('#ff8a12'), 0, 0.24, 0.18, g); m(rb(0.2, 0.08, 0.26, 0.5), M('#7cd23a'), 0, 0.2, -0.1, g); for (const s of [-1, 1]) { m(rb(0.04, 0.16, 0.08, 0.5), M('#9cff6a', { emissive: new THREE.Color('#2a6a10') }), s * 0.19, 0.22, 0.18, g); m(rb(0.04, 0.08, 0.16, 0.5), M('#9cff6a', { emissive: new THREE.Color('#2a6a10') }), s * 0.19, 0.32, 0.18, g); } }
        else if (k === 'mag') { const t = new THREE.Mesh(CH.G('magT', () => new THREE.TorusGeometry(0.32, 0.12, 8, 18, Math.PI)), M('#e8343a')); t.rotation.z = Math.PI; g.add(t); for (const s of [-1, 1]) { m(cy(0.12, 0.12, 0.26, 10), M('#e8343a'), s * 0.32, 0.26, 0, g); m(cy(0.125, 0.125, 0.16, 10), M('#ffd23f'), s * 0.32, 0.4, 0, g); } g.position.y = 0; }
        else if (k === 'x2') { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const ge = CH.G('star', () => { const e = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }); e.translate(0, 0, -0.08); return e; }); g.add(new THREE.Mesh(ge, M('#ffc21a'))); const lt = keep(T.label('2X', '#ffffff', null, 128, 64, 52)); const pl = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.62, 0.31)), keep(new THREE.MeshBasicMaterial({ map: lt, transparent: true }))); pl.position.z = 0.15; g.add(pl); const pl2 = pl.clone(); pl2.rotation.y = Math.PI; pl2.position.z = -0.15; g.add(pl2); }
        else if (k === 'key') { const t = new THREE.Mesh(CH.G('keyT', () => new THREE.TorusGeometry(0.17, 0.06, 8, 16)), M('#ff3d3d')); t.position.y = 0.25; g.add(t); m(cy(0.055, 0.055, 0.5, 8), M('#ff3d3d'), 0, 0.1, 0, g); m(rb(0.16, 0.07, 0.06), M('#ff3d3d'), 0.08, -0.28, 0, g); m(rb(0.12, 0.07, 0.06), M('#ff3d3d'), 0.06, -0.16, 0, g); }
        else if (k === 'mbox') { const lt = keep(T.label('?', '#ffd23f', '#8a2fe8', 128, 128, 96)); g.add(new THREE.Mesh(CH.G('mbox', () => new THREE.BoxGeometry(0.75, 0.75, 0.75)), keep(new THREE.MeshLambertMaterial({ map: lt })))); }
        return g;
      };
      const ITEM_GLOW = { jet: 'g', sneak: 'y', mag: 'r', x2: 'y', key: 'r', mbox: 'p' };
      function itemMesh(it) {
        if (!IM[it.k]) IM[it.k] = itemModel(it.k);
        const g = new THREE.Group(); g.add(IM[it.k].clone());
        const sp = new THREE.Sprite(GM[ITEM_GLOW[it.k]]); sp.scale.set(2.1, 2.1, 1); g.add(sp);
        g.position.set(it.x, it.y, -it.s); scene.add(g); it.mesh = g;
      }

      const patchGeo = keep(new THREE.PlaneGeometry(0.4, 0.34)), patchMat = keep(new THREE.MeshLambertMaterial({ map: keep(T.patch()), transparent: true, alphaTest: 0.3 }));
      let hero = null, heroBlob = mkBlob(1.0);
      function buildHero() {
        if (hero) scene.remove(hero.root);
        const P = CHARS.find(c => c.id === save.char) || CHARS[0];
        hero = CH.hero(P);
        if (P.vest) { const pm = new THREE.Mesh(patchGeo, patchMat); pm.position.set(0, 0.33, 0.212); hero.torso.add(pm); }
        scene.add(hero.root);
      }
      const guard = CH.guard(), dog = CH.dog();
      scene.add(guard.root, dog.root);
      const gBlob = mkBlob(1.3), dBlob = mkBlob(0.9);

      let W = null, R = null, state = 'home', acc = 0, introT = 0, saveT = 0, overShown = false, hudScore = -1, hudCoins = -1, hudMult = -1, cullT = 0, tunK = 0, shake = 0;
      let gd = 30, gx = 0, gy = 0, dgx = 0, homeT = 0, sprayT = 0, leanZ = 0, prevX = 0, airW = 0, bannerT = 0, bigT = 0, toastT = 0, hintI = 0, msnap = null, saveCost = 1, runKeys = 0, runBonus = 0;
      const camP = new THREE.Vector3(), camL = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
      let camY = 0, noBlink = false;

      function resetWorld() {
        clearObsMeshes();
        W = newWorld(); R = newRun();
        addTrain(W, 0, -16, 3, 0);
        W.genS = 36;
        clearChunks();
        gen(W, R);
        acc = 0; gd = 30; leanZ = 0; airW = 0; camY = 0;
        msnap = Object.assign({}, R.st);
      }

      function hudBoards() { E.hbn.textContent = save.boards; E.hb.classList.toggle('none', save.boards <= 0); }
      function refreshHome() {
        E.hbest.textContent = fmt(save.best); E.hcoins.textContent = fmt(save.coins); E.hkeys.textContent = save.keys; E.hboards.textContent = save.boards;
        E.hmult.textContent = 'x' + save.ms.lvl;
        const c = CITIES[save.city]; E.tname.textContent = c.name; E.tsub.textContent = c.sub;
      }
      function show(el, on) { el.classList.toggle('on', !!on); }
      function toHome() {
        state = 'home';
        resetWorld();
        show(E.home, 1); show(E.over, 0); show(E.save, 0); show(E.pausep, 0); show(E.panel, 0);
        E.hud.classList.add('off');
        refreshHome();
        au.music(true); au.jet(false);
        homeT = 0;
        api.score(0);
      }
      function startRun() {
        if (state !== 'home') return;
        au.unlock(); au.play('ui');
        show(E.home, 0); show(E.panel, 0);
        E.hud.classList.remove('off');
        state = 'intro'; introT = 0; R.chase = CFG.START_CHASE; gd = 4.2; gx = 0;
        hudScore = hudCoins = hudMult = -1; runKeys = 0; runBonus = 0; saveCost = 1;
        hudBoards(); updPU(true);
        hintI = save.runs < 3 ? 0 : 99;
        au.music(true);
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_start', { city: CITIES[save.city].id }); } catch (e) {}
      }
      function playAgain() { show(E.over, 0); toHome(); startRun(); }

      function useBoard() {
        if ((state !== 'run' && state !== 'intro') || R.dead || R.board > 0 || save.boards <= 0) return;
        save.boards--; R.board = CFG.BOARD_T; R.st.board++; R.ghost = Math.max(R.ghost, 0.3);
        au.play('board_on'); hudBoards(); persist();
        flash('HOVERBOARD!', 'blue');
      }

      function flash(text, cls) { E.banner.textContent = text; E.banner.className = 'ss-banner on' + (cls ? ' ' + cls : ''); bannerT = 1.6; }
      function toast(text) { E.toast.textContent = text; E.toast.classList.add('on'); toastT = 1.8; }
      function big(text) { E.big.textContent = text; E.big.classList.add('on'); bigT = 0.9; }

      const msets = () => missionSet(save.ms.lvl);
      const MKEY = { coins: 'coinsRun', jump: 'jump', roll: 'roll', pu: 'pu', jet: 'jet', magCoins: 'magCoins', board: 'board', bump: 'bump', dodge: 'dodge', roof: 'roof', sneakJump: 'sneakJump', mbox: 'mbox', stumble: 'stumble' };
      function mprog(i, m) {
        if (save.ms.done[i]) return m.n;
        if (!R || state === 'home') return save.ms.base[i];
        if (m.k === 'coinsRun') return R.st.coinsRun;
        if (m.k === 'score') return Math.floor(R.score);
        if (m.k === 'noCoin') return R.st.coinsRun === 0 ? Math.floor(R.score) : 0;
        const key = MKEY[m.k];
        return save.ms.base[i] + (R.st[key] - (msnap[key] || 0));
      }
      function checkMissions() {
        const set = msets();
        let all = true;
        set.forEach((m, i) => {
          if (!save.ms.done[i] && mprog(i, m) >= m.n) { save.ms.done[i] = true; au.play('mission'); flash('Mission complete!'); }
          if (!save.ms.done[i]) all = false;
        });
        if (all) {
          const lvl = save.ms.lvl;
          if (lvl < 30) save.ms.lvl++;
          save.ms.base = [0, 0, 0]; save.ms.done = [false, false, false];
          msnap = Object.assign({}, R.st);
          const reward = 100 + lvl * 50;
          save.coins += reward; if (lvl % 3 === 0) save.keys++;
          flash('Multiplier x' + save.ms.lvl + '!  +' + reward, 'gold');
          E.mult.classList.add('pop'); setTimeout(() => E.mult.classList.remove('pop'), 300);
          persist();
        }
      }
      function bankMissions() {
        const set = msets();
        set.forEach((m, i) => {
          if (save.ms.done[i]) return;
          if (MISSIONS[m.k].run) return;
          const key = MKEY[m.k];
          save.ms.base[i] += R.st[key] - (msnap[key] || 0);
        });
        msnap = Object.assign({}, R.st);
      }
      function missionRows() {
        return msets().map((m, i) => {
          const p = Math.min(m.n, Math.floor(mprog(i, m))), done = save.ms.done[i];
          return `<div class="ss-row${done ? ' done' : ''}"><span class="ss-chk">${done ? ICO.check : ''}</span><div class="t"><b>${MISSIONS[m.k].t(m.n)}</b><div class="ss-prog"><b style="width:${(100 * p / m.n).toFixed(1)}%"></b></div><small>${fmt(p)} / ${fmt(m.n)}</small></div></div>`;
        }).join('');
      }

      const puState = {};
      function updPU(force) {
        const act = ['jet', 'sneak', 'mag', 'x2'].filter(k => R[k] > 0);
        if (R.board > 0) act.push('board');
        const key = act.join(',');
        if (force || key !== puState.key) {
          puState.key = key;
          E.pus.innerHTML = act.map(k => `<div class="ss-pu" data-k="${k}">${ic(k === 'board' ? 'board' : k)}<i><b></b></i></div>`).join('');
          puState.els = act.map(k => [k, E.pus.querySelector(`[data-k="${k}"]`)]);
        }
        for (const [k, el] of puState.els || []) {
          const f = k === 'board' ? R.board / CFG.BOARD_T : R[k] / (R[k + 'D'] || 1);
          el.querySelector('b').style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%';
          el.classList.toggle('low', f < 0.25);
        }
      }

      function onItem(it) {
        const lvl = save.upg[it.k] || 0;
        spark(it.x, it.y, -it.s, ITEM_GLOW[it.k] === 'p' ? 'p' : 'y', 3);
        if (it.k === 'key') { save.keys++; runKeys++; au.play('key'); E.kv.textContent = runKeys; E.keyp.classList.remove('hide'); toast('+1 Key'); persist(); return; }
        if (it.k === 'mbox') {
          R.st.mbox++; au.play('mbox');
          const r = Math.random();
          if (r < 0.5) { const c = pick([100, 150, 200, 250, 300, 500]); save.coins += c; runBonus += c; toast(`Mystery Box: +${c} coins`); }
          else if (r < 0.72) { save.boards++; hudBoards(); toast('Mystery Box: +1 Hoverboard'); }
          else if (r < 0.9) { save.keys++; runKeys++; E.kv.textContent = runKeys; E.keyp.classList.remove('hide'); toast('Mystery Box: +1 Key'); }
          else { const c = 1500; save.coins += c; runBonus += c; toast('JACKPOT! +1,500 coins'); }
          persist(); return;
        }
        givePU(W, R, it.k, lvl);
        au.play('pu');
        flash(PU[it.k].name.toUpperCase() + '!', it.k === 'x2' ? 'gold' : it.k === 'jet' ? '' : 'blue');
        updPU(true);
      }

      function handleEvents() {
        for (const e of R.ev) {
          if (e === 'coin') { au.play('coin'); spark(R.x, R.y + 1.0, -R.s - 0.6, 'y', 1.1); }
          else if (e.startsWith('pu_')) {}
          else if (e === 'crash') { au.play('crash'); shake = 0.5; }
          else if (e === 'caught') { au.play('bump'); au.play('caught'); }
          else if (e === 'bump') { au.play('bump'); shake = 0.25; }
          else if (e === 'board_break') { au.play('board_break'); shake = 0.3; spark(R.x, R.y + 0.3, -R.s, 'p', 4); hudBoards(); }
          else if (e === 'board_end') au.play('board_end');
          else if (e === 'jet_end') au.play('jet_end');
          else au.play(e);
        }
        R.ev.length = 0;
      }

      function showSave() {
        state = 'save'; saveT = 0;
        E.scost.textContent = saveCost; E.shave.textContent = `You have ${save.keys} key${save.keys === 1 ? '' : 's'}`;
        E.sgo.classList.toggle('dis', save.keys < saveCost);
        show(E.save, 1);
      }
      function useSave() {
        if (state !== 'save' || save.keys < saveCost) return;
        save.keys -= saveCost; saveCost *= 2; persist();
        show(E.save, 0); au.play('key');
        revive(W, R);
        clearObsDone();
        state = 'run'; big('GO!');
      }
      function clearObsDone() { for (const o of W.obs) if (o.done) dropMesh(o); }
      function gameOver() {
        if (state === 'over') return;
        state = 'over'; show(E.save, 0);
        au.jet(false); au.music(false);
        const sc = Math.floor(R.score);
        bankMissions();
        save.coins += R.coins; save.runs++;
        const isBest = sc > save.best; if (isBest) save.best = sc;
        persist();
        api.score(sc); api.submit(sc);
        q('.o-title').textContent = R.dead === 'caught' ? 'Caught!' : 'Crashed!';
        q('.o-new').innerHTML = isBest && sc > 0 ? '<span class="ss-new">NEW HIGH SCORE!</span>' : '';
        q('.o-score').textContent = fmt(sc); q('.o-best').textContent = fmt(save.best); q('.o-coins').textContent = fmt(R.coins + runBonus);
        q('.o-ms').innerHTML = missionRows();
        show(E.over, 1);
        E.hud.classList.add('off');
        if (window.Ameplay && Ameplay.analytics) try { Ameplay.analytics.track('subway_over', { score: sc, coins: R.coins, city: CITIES[save.city].id, t: Math.round(R.t) }); } catch (e) {}
      }
      function pause() {
        if (state !== 'run' && state !== 'intro') return;
        state = 'pause'; au.jet(false); au.music(false);
        q('.pz-ms').innerHTML = missionRows();
        show(E.pausep, 1);
      }
      function resume() { if (state !== 'pause') return; show(E.pausep, 0); state = 'run'; au.music(true); big('GO!'); }

      let panelKind = '', shopTab = 'up';
      function openPanel(kind) {
        panelKind = kind; au.unlock(); au.play('ui');
        renderPanel();
        show(E.panel, 1);
      }
      function renderPanel() {
        const k = panelKind;
        if (k === 'missions') {
          E.ptitle.textContent = 'Missions';
          E.pbody.innerHTML = `<div class="ss-multi">Score multiplier <b>x${save.ms.lvl}</b></div><div class="ss-list">${missionRows()}</div><p class="ss-small">Complete all three missions to raise your multiplier by +1 (up to x30) and win coins.</p>`;
        } else if (k === 'shop') {
          E.ptitle.textContent = 'Shop';
          let body = `<div class="ss-tabs"><button data-tab="up" class="${shopTab === 'up' ? 'on' : ''}">Upgrades</button><button data-tab="it" class="${shopTab === 'it' ? 'on' : ''}">Items</button></div><div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-list">`;
          if (shopTab === 'up') {
            for (const pk of ['jet', 'sneak', 'mag', 'x2']) {
              const lvl = save.upg[pk], maxed = lvl >= UPG_COST.length, cost = UPG_COST[lvl];
              body += `<div class="ss-row">${ic(pk)}<div class="t"><b>${PU[pk].name}</b><small>Lasts ${puDur(lvl)} s${maxed ? '' : ' → ' + puDur(lvl + 1) + ' s'}</small><div class="ss-pips">${UPG_COST.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div></div>${maxed ? '<button class="ss-btn dis">MAX</button>' : `<button class="ss-btn g${save.coins < cost ? ' dis' : ''}" data-buy="${pk}">${ic('coin')}${fmt(cost)}</button>`}</div>`;
            }
          } else {
            body += `<div class="ss-row">${ic('board')}<div class="t"><b>Hoverboard</b><small>Double tap or Space. Lasts 30 s and saves you from one crash. You have ${save.boards}.</small></div><button class="ss-btn g${save.coins < 300 ? ' dis' : ''}" data-buy="board">${ic('coin')}300</button></div>`;
            body += `<div class="ss-row">${ic('mbox')}<div class="t"><b>Mystery Box</b><small>Coins, keys, hoverboards or a jackpot!</small></div><button class="ss-btn g${save.coins < 500 ? ' dis' : ''}" data-buy="mbox">${ic('coin')}500</button></div>`;
            body += `<div class="ss-row">${ic('key')}<div class="t"><b>Key</b><small>Use keys to keep running after a crash (Save me). You have ${save.keys}.</small></div><button class="ss-btn g${save.coins < 2000 ? ' dis' : ''}" data-buy="key">${ic('coin')}2,000</button></div>`;
          }
          E.pbody.innerHTML = body + '</div>';
        } else if (k === 'chars') {
          E.ptitle.textContent = 'Surfers';
          E.pbody.innerHTML = `<div class="ss-multi">${ic('coin')}<b>${fmt(save.coins)}</b></div><div class="ss-chars">${CHARS.map(c => { const own = save.chars.includes(c.id), sel = save.char === c.id; return `<div class="ss-char${sel ? ' sel' : ''}" data-c="${c.id}"><span class="av"></span><b>${c.name}</b>${sel ? '<button class="ss-btn dis">Selected</button>' : own ? `<button class="ss-btn" data-sel="${c.id}">Select</button>` : `<button class="ss-btn g${save.coins < c.price ? ' dis' : ''}" data-unl="${c.id}">${ic('coin')}${fmt(c.price)}</button>`}</div>`; }).join('')}</div>`;
          E.pbody.querySelectorAll('.ss-char').forEach(el => el.querySelector('.av').replaceWith(avatar(CHARS.find(c => c.id === el.dataset.c))));
        }
      }
      function buy(what) {
        if (what === 'board') { if (save.coins < 300) return; save.coins -= 300; save.boards++; }
        else if (what === 'mbox') {
          if (save.coins < 500) return; save.coins -= 500;
          const r = Math.random(); let msg;
          if (r < 0.45) { const c = pick([200, 300, 400, 600, 800]); save.coins += c; msg = `+${c} coins`; }
          else if (r < 0.7) { save.boards += 2; msg = '+2 Hoverboards'; }
          else if (r < 0.92) { save.keys++; msg = '+1 Key'; }
          else { save.coins += 2500; msg = 'JACKPOT! +2,500 coins'; }
          toast('Mystery Box: ' + msg);
        } else if (what === 'key') { if (save.coins < 2000) return; save.coins -= 2000; save.keys++; }
        else if (PU[what]) { const l = save.upg[what], c = UPG_COST[l]; if (l >= UPG_COST.length || save.coins < c) return; save.coins -= c; save.upg[what]++; }
        au.play('buy'); persist(); renderPanel(); refreshHome();
      }
      api.on(E.panel, 'click', e => {
        const t = e.target.closest('button');
        if (e.target === E.panel || (t && t.classList.contains('x'))) { show(E.panel, 0); au.play('ui'); return; }
        if (!t) return;
        if (t.dataset.tab) { shopTab = t.dataset.tab; au.play('ui'); renderPanel(); }
        else if (t.dataset.buy) buy(t.dataset.buy);
        else if (t.dataset.sel) { save.char = t.dataset.sel; persist(); buildHero(); au.play('ui'); renderPanel(); }
        else if (t.dataset.unl) { const c = CHARS.find(x => x.id === t.dataset.unl); if (c && save.coins >= c.price) { save.coins -= c.price; save.chars.push(c.id); save.char = c.id; persist(); buildHero(); au.play('buy'); renderPanel(); refreshHome(); } }
      });
      api.on(q('.ss-menu'), 'click', e => { const b = e.target.closest('[data-o]'); if (b) openPanel(b.dataset.o); });
      const city = d => { save.city = (save.city + d + CITIES.length) % CITIES.length; persist(); au.unlock(); au.play('ui'); buildCity(save.city); resetWorld(); refreshHome(); };
      api.on(q('.t-prev'), 'click', () => city(-1));
      api.on(q('.t-next'), 'click', () => city(1));
      api.on(E.sgo, 'click', () => useSave());
      api.on(q('.s-skip'), 'click', () => { au.play('ui'); gameOver(); });
      api.on(q('.o-play'), 'click', () => { au.play('ui'); playAgain(); });
      api.on(q('.o-home'), 'click', () => { au.play('ui'); toHome(); });
      api.on(q('.o-shop'), 'click', () => { toHome(); openPanel('shop'); });
      api.on(q('.pz-go'), 'click', () => resume());
      api.on(q('.pz-home'), 'click', () => { au.play('ui'); show(E.pausep, 0); R.dead = 'quit'; gameOver(); toHome(); });
      api.on(E.pause, 'click', e => { E.pause.blur(); pause(); });
      api.on(E.hb, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); useBoard(); });

      function input(a) {
        if (state !== 'run' && state !== 'intro') return;
        act(W, R, a);
      }
      const KM = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
      api.on(window, 'keydown', e => {
        const k = e.code;
        if (state === 'run' || state === 'intro') {
          if (KM[k]) { e.preventDefault(); if (!e.repeat) input(KM[k]); }
          else if (k === 'Space') { e.preventDefault(); if (!e.repeat) useBoard(); }
          else if (k === 'KeyP') pause();
        } else if (state === 'home') {
          if (E.panel.classList.contains('on')) { if (k === 'Escape') show(E.panel, 0); return; }
          if (k === 'Space' || k === 'Enter' || k === 'ArrowUp' || k === 'KeyW') { e.preventDefault(); startRun(); }
          else if (k === 'ArrowLeft') city(-1); else if (k === 'ArrowRight') city(1);
        } else if (state === 'over') { if (k === 'Space' || k === 'Enter') { e.preventDefault(); playAgain(); } }
        else if (state === 'pause') { if (k === 'KeyP' || k === 'Space' || k === 'Enter') { e.preventDefault(); resume(); } }
        else if (state === 'save') { if (k === 'Space' || k === 'Enter') { e.preventDefault(); useSave(); } }
      });
      let pd = null, lastTap = 0, lastTapX = 0, lastTapY = 0;
      api.on(wrap, 'pointerdown', e => {
        if (e.target.closest('button') || e.target.closest('.ss-card')) return;
        au.unlock();
        pd = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), fired: false };
      });
      api.on(wrap, 'pointermove', e => {
        if (!pd || pd.id !== e.pointerId || pd.fired) return;
        const dx = e.clientX - pd.x, dy = e.clientY - pd.y, th = Math.max(16, wrap.clientWidth * 0.035);
        if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
        pd.fired = true;
        input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
      const pend = e => {
        if (!pd || pd.id !== e.pointerId) return;
        const p = pd; pd = null;
        if (p.fired) return;
        const now = performance.now();
        if (state === 'home' && e.type === 'pointerup' && !E.panel.classList.contains('on')) { startRun(); return; }
        if ((state === 'run' || state === 'intro') && now - p.t < 300) {
          if (now - lastTap < 330 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 60) { useBoard(); lastTap = 0; }
          else { lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY; }
        }
      };
      api.on(wrap, 'pointerup', pend);
      api.on(wrap, 'pointercancel', pend);
      api.on(document, 'visibilitychange', () => { if (document.hidden) pause(); });

      const HINTS = COARSE ? [['Swipe left or right', 'to switch lanes'], ['Swipe up to jump', 'swipe down to roll'], ['Double tap', 'to use a hoverboard']] : [['← → to switch lanes', 'or A / D'], ['↑ jump  ·  ↓ roll', 'roll in the air to drop fast'], ['Space: hoverboard', 'it saves you from one crash']];
      function hintTick() {
        if (hintI >= HINTS.length) return;
        const at = 1.0 + hintI * 3.4, t = R.t;
        if (t > at && t < at + 3.0) { if (!E.hint.classList.contains('on')) { E.hint.innerHTML = HINTS[hintI][0] + '<small>' + HINTS[hintI][1] + '</small>'; E.hint.classList.add('on'); } }
        else if (t >= at + 3.0) { E.hint.classList.remove('on'); hintI++; }
      }

      function syncWorld(dt, t) {
        const s = R.s;
        syncChunks(s);
        const ts = Math.floor(s / 4) * 4;
        track.position.z = -ts; rails.position.z = -ts;
        far.position.set(0, -0.08, -s - 200);
        for (const o of W.obs) {
          if (o.done) { dropMesh(o); continue; }
          if (!o.mesh && o.s0 < s + 215) obsMesh(o);
          if (o.mesh && o.moving) o.mesh.position.z = -o.s0;
        }
        for (const it of W.items) {
          if (it.got) { dropMesh(it); continue; }
          if (!it.mesh && it.s < s + 190) itemMesh(it);
          if (it.mesh) { it.mesh.children[0].rotation.y = t * 2.4; it.mesh.position.y = it.y + Math.sin(t * 3 + it.s) * 0.12; const sp = it.mesh.children[1]; const k = 1.9 + 0.25 * Math.sin(t * 6); sp.scale.set(k, k, 1); }
        }
        const spin = t * 3.2;
        let n = 0;
        for (const c of W.coins) {
          if (c.got) continue;
          const ds = c.s - s;
          if (ds > 180 || ds < -6) continue;
          dummy.position.set(c.x, c.y, -c.s); dummy.rotation.set(0, spin, 0); dummy.updateMatrix();
          coinIM.setMatrixAt(n++, dummy.matrix);
          if (n >= MAXC) break;
        }
        coinIM.count = n; coinIM.instanceMatrix.needsUpdate = true;
        for (const sp of sparks) if (sp.visible) { sp.userData.t += dt; const f = sp.userData.t / 0.3; if (f >= 1) sp.visible = false; else { const k = sp.userData.s * (0.4 + f); sp.scale.set(k, k, 1); sp.material.opacity = 1 - f; } }
      }

      function syncHero(dt, t) {
        const H = hero;
        const xv = (R.x - prevX) / Math.max(dt, 1e-3); prevX = R.x;
        leanZ = damp(leanZ, clamp(-xv * 0.018, -0.38, 0.38), 14, dt);
        airW = damp(airW, R.grounded || R.jet > 0 ? 0 : 1, 16, dt);
        let mode = 'run';
        if (state === 'home') mode = 'idle';
        else if (R.dead) mode = R.dead === 'caught' ? 'caught' : 'dead';
        else if (R.jet > 0) mode = 'jet';
        else if (R.board > 0) mode = 'board';
        const st = { mode, speed: R.speed, air: airW, vy: R.vy, roll: R.rollT > 0 ? 1 : 0, rollP: R.rollT > 0 ? 1 - R.rollT / R.rollD : 0, stumble: R.stumbleT / 0.45, leanZ: mode === 'run' || mode === 'board' ? leanZ : 0, spray: false, can: false, deadT: R.deadT };
        if (state === 'home') { sprayT += dt; st.spray = (sprayT % 7) > 3.5; st.can = true; }
        CH.animHero(H, st, dt, t);
        H.root.position.set(R.x, R.y, -R.s);
        let yaw = 0;
        if (state === 'home') yaw = st.spray ? 0.95 : 0.12 + 0.08 * Math.sin(t * 0.8);
        else if (state === 'intro') yaw = lerp(0.6, 0, ease(clamp(introT / 0.5, 0, 1)));
        else if (mode === 'run') yaw = clamp(-xv * 0.012, -0.35, 0.35);
        H.root.rotation.y = damp(H.root.rotation.y, yaw, 12, dt);
        if (mode === 'dead') { const k = clamp(R.deadT * 5, 0, 1); H.root.position.z += 0.6 * k; H.body.rotation.x = lerp(0, 1.25, ease(k)); H.root.position.y = R.y + 0.1 * Math.sin(k * Math.PI); }
        else H.body.rotation.x = 0;
        H.root.visible = noBlink || !(R.ghost > 0 && R.jet <= 0 && !R.dead && Math.floor(t * 12) % 3 === 0);
        const sup = R.jet > 0 ? supportAt(W, laneOf(R.x), R.s) : supportAt(W, laneOf(R.x), R.s);
        const hgt = Math.max(0, R.y - sup);
        heroBlob.position.set(R.x, sup + 0.03, -R.s);
        const bs = clamp(1 - hgt * 0.1, 0.35, 1);
        heroBlob.scale.set(0.95 * bs, 1, 1.1 * bs);
      }

      function syncGuard(dt, t) {
        let target = 30, vis = true;
        if (state === 'home') { target = 40; }
        else if (R.dead === 'caught' || R.dead === 'crash') target = R.dead === 'caught' ? 1.25 : 1.9;
        else if (R.jet > 0) target = 40;
        else if (R.chase > 0) target = 2.9;
        const k = target < gd ? (R.dead ? 4 : 2.6) : 0.7;
        gd = damp(gd, target, k, dt);
        if (gd > 20) vis = false;
        guard.root.visible = dog.root.visible = gBlob.visible = dBlob.visible = vis;
        if (!vis) return;
        gx = damp(gx, R.x + (R.dead ? 0.15 : R.x > 0.5 ? -0.85 : 0.85), 5, dt);
        const gs = R.s - gd;
        const sup = supportAt(W, laneOf(gx), gs);
        gy = damp(gy, sup, 10, dt);
        const run = !(R.dead && gd < target + 0.25);
        const sp = R.dead ? (run ? 9 : 0) : R.speed;
        guard.grab = !!R.dead;
        CH.animGuard(guard, sp, dt, t, run ? 'run' : 'grab');
        guard.root.position.set(gx, gy, -gs);
        guard.root.rotation.y = 0;
        gBlob.position.set(gx, gy + 0.03, -gs);
        dgx = damp(dgx, R.x + (gx > R.x ? -0.75 : 0.75), 6, dt);
        const ds = gs + (R.dead ? 0.2 : 1.1);
        const dsup = supportAt(W, laneOf(dgx), ds);
        CH.animDog(dog, sp * 1.05, dt, t, run ? 'run' : 'bark');
        dog.root.position.set(dgx, dsup, -ds);
        dBlob.position.set(dgx, dsup + 0.03, -ds);
      }

      function camRun(out, look, dt) {
        const tun = inTunnel(W, R.s + 2);
        const sp0 = supportAt(W, laneOf(R.x), R.s), yT = R.jet > 0 || R.grounded ? R.y : lerp(sp0, R.y, 0.6);
        camY = damp(camY, yT, R.jet > 0 ? 3 : 6, dt);
        const base = portrait ? 6.1 : 5.3, back = portrait ? 8.4 : 7.0;
        let cy = base + camY * 0.9;
        if (tun) cy = Math.min(cy, 8.6);
        out.set(R.x * 0.62, cy, -R.s + back);
        look.set(R.x * 0.85, 0.7 + camY * 0.88, -R.s - (portrait ? 8 : 9));
      }
      function camHome(out, look) {
        out.set(portrait ? 0.55 : 1.05, portrait ? 1.7 : 1.55, -R.s - (portrait ? 4.6 : 3.7));
        look.set(portrait ? 0.05 : -0.55, portrait ? 1.25 : 1.12, -R.s + 0.2);
      }

      function frameUI(dt) {
        const sc = Math.floor(R.score);
        if (sc !== hudScore) { hudScore = sc; E.sv.textContent = String(sc).padStart(6, '0'); if (state === 'run') api.score(sc); }
        if (R.coins !== hudCoins) { hudCoins = R.coins; E.cv.textContent = fmt(R.coins); }
        const m = save.ms.lvl * (R.x2 > 0 ? 2 : 1);
        if (m !== hudMult) { hudMult = m; E.mult.textContent = 'x' + m; E.mult.classList.toggle('x2', R.x2 > 0); }
        updPU(false);
        E.hb.classList.toggle('on', R.board > 0);
        if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) E.banner.classList.remove('on'); }
        if (bigT > 0) { bigT -= dt; if (bigT <= 0) E.big.classList.remove('on'); }
        if (toastT > 0) { toastT -= dt; if (toastT <= 0) E.toast.classList.remove('on'); }
      }

      let perfN = 0, perfT = 0, perfCool = 2;
      function perf(dt) {
        perfCool -= dt;
        if (state !== 'run' || perfCool > 0) { perfN = 0; perfT = 0; return; }
        perfN++; perfT += dt;
        if (perfN >= 90) {
          const avg = perfT / perfN;
          if (avg > 1 / 50 && prCap > 0.8) { prCap = Math.max(0.8, prCap * 0.82); renderer.setPixelRatio(prCap); perfCool = 2.5; }
          perfN = 0; perfT = 0;
        }
      }

      buildHero();
      buildCity(save.city);
      toHome();
      try { if (document.fonts && !document.fonts.check('40px "Lilita One"')) document.fonts.load('40px "Lilita One"').then(() => { if (api.alive && state === 'home' && document.fonts.check('40px "Lilita One"')) { buildCity(save.city); resetWorld(); } }).catch(() => {}); } catch (e) {}
      camHome(camP, camL);

      api.loop((dt, t) => {
        t /= 1000;
        capPR(); perf(dt);
        if (state === 'run' || state === 'intro') {
          acc += dt;
          let n = 0;
          const ctx = { mult: save.ms.lvl };
          if (R.dead) { step(W, R, dt, ctx); acc = 0; }
          else while (acc >= CFG.STEP && n++ < 10) { step(W, R, CFG.STEP, ctx); acc -= CFG.STEP; if (R.dead) break; }
          if (n >= 10) acc = 0;
          collect(W, R, dt, 0, onItem);
          if (!R.dead) gen(W, R);
          cullT -= dt;
          if (cullT <= 0) { cullT = 0.3; cull(W, R, dropMesh); W.coins = W.coins.filter(c => !c.got && c.s > R.s - CFG.BEHIND); }
          handleEvents();
          checkMissions();
          hintTick();
          au.jet(R.jet > 0 && !R.dead);
          if (state === 'intro') { introT += dt; if (introT >= 1.0) state = 'run'; }
          if (R.dead && R.dead !== 'quit' && R.deadT > 1.1) { if (R.dead === 'crash' || R.dead === 'caught') showSave(); }
          frameUI(dt);
        } else if (state === 'save') {
          saveT += dt;
          step(W, R, dt, { mult: save.ms.lvl });
          const f = clamp(saveT / 4.5, 0, 1);
          E.sarc.style.strokeDashoffset = (276.5 * f).toFixed(1);
          if (f >= 1) gameOver();
        } else if (state === 'over') step(W, R, dt, { mult: 1 });
        else if (state === 'home') homeT += dt;
        syncWorld(dt, t);
        syncHero(dt, t);
        syncGuard(dt, t);
        const tun = inTunnel(W, R.s);
        tunK = damp(tunK, tun ? 1 : 0, 4, dt);
        const L = ENV.light;
        hemi.intensity = (0.95 - 0.42 * tunK) * L; sun.intensity = (0.72 - 0.5 * tunK) * L;
        if (state === 'home') camHome(tmpP, tmpL);
        else if (state === 'intro') { camHome(camP, camL); camRun(tmpP, tmpL, dt); const k = ease(clamp(introT / 1.0, 0, 1)); tmpP.lerpVectors(camP, tmpP, k); tmpL.lerpVectors(camL, tmpL, k); }
        else if (state === 'pause') {}
        else camRun(tmpP, tmpL, dt);
        if (state !== 'pause') {
          if (state === 'run' || state === 'save' || state === 'over') { camP.x = damp(camP.x, tmpP.x, 9, dt); camP.y = damp(camP.y, tmpP.y, 7, dt); camP.z = tmpP.z; camL.x = damp(camL.x, tmpL.x, 9, dt); camL.y = damp(camL.y, tmpL.y, 7, dt); camL.z = tmpL.z; }
          else { camP.copy(tmpP); camL.copy(tmpL); }
        }
        cam.position.copy(camP);
        if (shake > 0) { shake = Math.max(0, shake - dt); cam.position.x += (Math.random() - 0.5) * shake * 0.6; cam.position.y += (Math.random() - 0.5) * shake * 0.6; }
        cam.lookAt(camL);
        skyPlane.position.set(cam.position.x * 0.9, 52, cam.position.z - 340);
        sunSprite.position.set(cam.position.x - 120, 150, cam.position.z - 330);
        sun.position.set(cam.position.x - 20, 40, cam.position.z + 25); sun.target.position.set(cam.position.x, 0, cam.position.z - 10);
        au.tick();
        renderer.render(scene, cam);
      });

      wrap._ss = { get W() { return W; }, get R() { return R; }, get state() { return state; }, save, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, pr: renderer.getPixelRatio(), geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }), act: a => input(a), set noBlink(v) { noBlink = v; }, clearChunks: () => clearChunks(), give(k) { if (state === 'run') onItem({ k, x: R.x, y: R.y, s: R.s }); }, city: d => city(d) };
      return {
        destroy() {
          au.close();
          if (ENV) ENV.dispose();
          const all = new Set(bin);
          scene.traverse(o => { if (o.geometry) all.add(o.geometry); const m = o.material; if (m) for (const x of Array.isArray(m) ? m : [m]) { all.add(x); if (x.map) all.add(x.map); } });
          for (const k in IM) IM[k].traverse(o => { if (o.geometry) all.add(o.geometry); });
          all.forEach(x => { try { x.dispose && x.dispose(); } catch (e) {} });
        }
      };
    }
  });

  const COVER = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ssc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a9cf0"/><stop offset=".6" stop-color="#8fd0ff"/><stop offset="1" stop-color="#e3f4ff"/></linearGradient><linearGradient id="ssc-tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb0f5"/><stop offset="1" stop-color="#2f6fc9"/></linearGradient><linearGradient id="ssc-to" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc24a"/><stop offset="1" stop-color="#e08a1a"/></linearGradient></defs><rect width="400" height="300" fill="url(#ssc-sky)"/><path d="M0 150V92h30V70h26v30h22V58h34v42h18V80h30v20h40V64h30v36h24V76h36v28h26V60h34v90z" fill="#b8d6ef"/><path d="M0 150v-30h40v-22h36v22h50v-16h30v16h120v-26h40v26h84v30z" fill="#9cc2e2"/><path d="M0 300V150h400v150z" fill="#a99b88"/><path d="M168 150h64l120 150H48z" fill="#9a8c78"/><g fill="#6b4a32"><path d="M160 162h80v6h-80zM146 182h108v8H146zM126 210h148v10H126zM96 250h208v12H96zM56 292h288v8H56z"/></g><g stroke="#e6e9ef" stroke-width="4"><path d="M186 150l-66 150M214 150l66 150"/></g><path d="M0 300l70-150h60L82 300z" fill="#c4c0b6"/><path d="M14 270l60-120V96L8 220z" fill="url(#ssc-tb)"/><path d="M74 150h56V92H74z" fill="url(#ssc-tb)"/><path d="M80 98h44v26H80z" fill="#22304f"/><circle cx="86" cy="138" r="5" fill="#fff6b0"/><circle cx="118" cy="138" r="5" fill="#fff6b0"/><text x="40" y="208" transform="rotate(-62 40 208)" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="30" fill="#ffd23f" stroke="#1b1530" stroke-width="3" paint-order="stroke">ZAP</text><path d="M268 150h58l74 98v52h-36z" fill="#d6a23a"/><path d="M270 150h56V88h-56z" fill="url(#ssc-to)"/><path d="M276 94h44v26h-44z" fill="#22304f"/><path d="M326 88l74 92v-58l-74-62z" fill="url(#ssc-to)"/><g transform="translate(200 236)"><path d="M-40 0h80v-20h-80z" fill="#fff"/><path d="M-40-20l14 0-14 20zM-12-20h14L-12 0h-14zM16-20h14L16 0H2zM40-20v20H30z" fill="#e8323a"/><path d="M-36 0v22M36 0v22" stroke="#d6d9de" stroke-width="5"/></g><g fill="#ffcc1a" stroke="#b87400" stroke-width="2.5"><circle cx="200" cy="196" r="7"/><circle cx="200" cy="176" r="6"/><circle cx="200" cy="160" r="5"/></g><g transform="translate(206 112) scale(1.05)"><ellipse cx="0" cy="98" rx="24" ry="6" fill="#000" opacity=".2"/><path d="M-10 52l-16 34 9 5 18-30zM8 52l16 30 10-5-14-30z" fill="#7fb2e5"/><path d="M-30 86h16v9h-20zM22 80l14-4 3 9-15 5z" fill="#2fbf5a"/><path d="M-34 93h22v4h-24zM24 88l17-5 1 4-17 5z" fill="#fff"/><path d="M-18 8h36l4 46h-44z" fill="#f4f4f4"/><path d="M-18 8h12v44h-14zM6 8h12l4 44H6z" fill="#6fa8dc"/><path d="M-3 10h6v40h-6z" fill="#d8322c"/><path d="M-18 12l-22 22 7 7 20-17zM18 12l20-18 7 7-21 20z" fill="#f4f4f4"/><circle cx="-37" cy="38" r="6" fill="#f1bf93"/><circle cx="42" cy="-8" r="6" fill="#f1bf93"/><rect x="38" y="-26" width="9" height="18" rx="3" fill="#e8323a"/><circle cy="-10" r="20" fill="#f1bf93"/><path d="M-20-12c0-22 40-22 40 0l-4-3c-6-10-26-10-32 0z" fill="#6b3f22"/><path d="M-21-14a21 18 0 0142 0z" fill="#e23a33"/><path d="M-9-30h18v10H-9z" fill="#fff"/><path d="M-24-14h30l-2 5h-30z" fill="#e23a33"/><circle cx="-7" cy="-6" r="3" fill="#1d1b26"/><circle cx="7" cy="-6" r="3" fill="#1d1b26"/><path d="M-6 4q6 5 12 0" stroke="#7a2a2a" stroke-width="2.5" fill="none" stroke-linecap="round"/></g><text x="200" y="44" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="38" fill="#ffd23f" stroke="#12224a" stroke-width="7" paint-order="stroke" transform="rotate(-4 200 44)">SUBWAY</text><text x="214" y="80" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="38" fill="#ff6a2a" stroke="#12224a" stroke-width="7" paint-order="stroke" transform="rotate(-4 214 80)">SURFERS</text></svg>`;
  Ameplay.covers[ID] = COVER;
  try { Object.defineProperty(Ameplay.covers, ID, { get: () => COVER, set() {}, enumerable: true, configurable: true }); } catch (e) {}
})();
