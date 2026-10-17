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
