(() => {
  'use strict';
  const ID = 'brawl-stars';
  const TAU = Math.PI * 2, DT = 1 / 30, DEG = Math.PI / 180;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const hyp = Math.hypot, rad2 = (a, b) => a * a + b * b;
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; };
  const mul32 = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const fmtT = s => { s = Math.max(0, Math.ceil(s)); return (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0'); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const T_FLOOR = 0, T_WALL = 1, T_CRATE = 2, T_BUSH = 3, T_WATER = 4, T_BOX = 6, T_MINE = 7;
  const solidT = t => t === 1 || t === 2 || t === 4 || t === 6;
  const shotT = t => t === 1 || t === 2 || t === 6;
  const CRATE_HP = 3200, BOX_HP = 3600;

  const MODES = {
    gem: { id: 'gem', name: 'Gem Grab', short: '3v3', teams: 2, per: 3, time: 180, blurb: 'Collect 10 gems and hold them for 15 seconds to win.', col: '#b45cff', col2: '#6b2bd8' },
    show: { id: 'show', name: 'Showdown', short: 'Solo', teams: 10, per: 1, time: 0, blurb: 'Last brawler standing. Smash boxes for power cubes. Stay out of the poison.', col: '#6dd13a', col2: '#2e8f1e' },
    ball: { id: 'ball', name: 'Brawl Ball', short: '3v3', teams: 2, per: 3, time: 120, blurb: 'Score 2 goals before the other team. Pass, kick and tackle.', col: '#3fa9ff', col2: '#1e63c9' }
  };

  const BR = [
    { id: 'bramble', name: 'Bramble', role: 'Shotgun Bruiser', cls: 'tank', hp: 4000, spd: 3.3, ammo: 3, reload: 1.6, cd: .55, need: 1800,
      atk: { k: 'fan', n: 5, sp: 28, range: 5.6, spd: 26, r: .22, dmg: 330, st: 0 }, sup: { k: 'fan', n: 9, sp: 66, range: 8, spd: 28, r: .26, dmg: 380, kb: 2.8, wall: 3200, st: 0 },
      supName: 'Mega Blast', desc: 'Five-pellet shotgun. Devastating up close. Super blasts through walls and shoves enemies away.', c1: '#b8743a', c2: '#3b78d6' },
    { id: 'talon', name: 'Talon', role: 'Sniper', cls: 'sniper', hp: 2400, spd: 3.3, ammo: 3, reload: 1.9, cd: .8, need: 2100,
      atk: { k: 'bolt', range: 11.8, spd: 44, r: .22, dmg: [650, 1500], st: 1 }, sup: { k: 'hop', back: 4.2, bombs: 4, fuse: .7, rad: 1.75, dmg: 950, wall: 1200 },
      supName: 'Backflip Bombs', desc: 'Long-range shots hit harder the farther they travel. Super flips away dropping bombs.', c1: '#6f8fb8', c2: '#f2c14a' },
    { id: 'dyna', name: 'Dyna', role: 'Thrower', cls: 'thrower', hp: 2700, spd: 3.2, ammo: 3, reload: 1.8, cd: .6, need: 2200,
      atk: { k: 'lob', range: 8.2, dur: .62, rad: 1.55, dmg: 1000, wall: 1300, st: 2 }, sup: { k: 'lob', range: 8, dur: .75, rad: 3.5, dmg: 2200, wall: 4200, kb: 3, st: 2, big: 1 },
      supName: 'Big Barrel', desc: 'Lobs dynamite over walls. Splash damage and cracks cover apart. Super is a huge blast.', c1: '#a58fa8', c2: '#f2b233' },
    { id: 'lulu', name: 'Lulu', role: 'Healer', cls: 'healer', hp: 3200, spd: 3.4, ammo: 3, reload: 1.5, cd: .5, need: 2000,
      atk: { k: 'wave', range: 6.8, spd: 15, r: .7, dmg: 480, heal: 420, st: 3 }, sup: { k: 'aoeheal', rad: 4.8, heal: 1500, self: .6 },
      supName: 'Encore', desc: 'Sound waves hurt enemies and heal friends. Super heals every ally around her.', c1: '#58c24a', c2: '#e8503a' },
    { id: 'vex', name: 'Vex', role: 'Assassin', cls: 'assassin', hp: 2700, spd: 4.1, ammo: 3, reload: 1.2, cd: .45, need: 1800,
      atk: { k: 'slash', dist: 2.7, dur: .13, dmg: 820, r: .8 }, sup: { k: 'leap', range: 6.2, dur: .5, rad: 1.9, dmg: 1500, self: 700, stun: .4 },
      supName: 'Pounce', desc: 'Fast slasher who dashes through enemies. Super leaps over walls and heals on impact.', c1: '#4b3a73', c2: '#ffd23a' },
    { id: 'zippy', name: 'Zippy', role: 'Ricochet Gunner', cls: 'bounce', hp: 2900, spd: 3.4, ammo: 3, reload: 1.5, cd: .55, need: 2000,
      atk: { k: 'bounce', range: 10.5, spd: 24, r: .26, dmg: 780, bounce: 3, st: 4 }, sup: { k: 'fan', n: 7, sp: 44, range: 14, spd: 24, r: .26, dmg: 620, bounce: 4, st: 4 },
      supName: 'Pinball', desc: 'Bullets bounce off walls to hit hiding enemies. Super fires a volley of ricochets.', c1: '#b9c4d2', c2: '#33d6e8' },
    { id: 'dusty', name: 'Dusty', role: 'Gunslinger', cls: 'gunner', hp: 3000, spd: 3.4, ammo: 3, reload: 1.6, cd: .75, need: 2200,
      atk: { k: 'burst', n: 6, gap: .07, range: 9.2, spd: 30, r: .2, dmg: 290, st: 5 }, sup: { k: 'burst', n: 14, gap: .05, range: 10.5, spd: 32, r: .22, dmg: 330, st: 5, wall: 1600 },
      supName: 'Bullet Storm', desc: 'Six-shot bursts at mid range. Super unloads a storm that tears through walls.', c1: '#8a8f99', c2: '#a8683a' },
    { id: 'rocco', name: 'Rocco', role: 'Heavy Brawler', cls: 'tank', hp: 6000, spd: 3.5, ammo: 3, reload: 1.2, cd: .5, need: 2000,
      atk: { k: 'punch', n: 2, gap: .12, range: 2.4, spd: 22, r: .95, dmg: 620, st: 6 }, sup: { k: 'leap', range: 6.8, dur: .55, rad: 2.3, dmg: 1600, stun: .9, self: 0 },
      supName: 'Body Slam', desc: 'Huge health, hits hard in your face. Super leaps over walls and stuns on landing.', c1: '#7c8794', c2: '#d63b3b' },
    { id: 'gizmo', name: 'Gizmo', role: 'Engineer', cls: 'turret', hp: 2900, spd: 3.4, ammo: 3, reload: 1.5, cd: .5, need: 2000,
      atk: { k: 'spark', range: 8.4, spd: 24, r: .26, dmg: 720, chain: 3.6, chainMul: .6, st: 7 }, sup: { k: 'turret', range: 6.5, hp: 1500, life: 12, cd: .7, dmg: 320, trange: 8.6 },
      supName: 'Auto Turret', desc: 'Sparks jump to a second enemy. Super builds a turret that shoots on its own.', c1: '#e9863a', c2: '#37c7b5' },
    { id: 'ember', name: 'Ember', role: 'Flamethrower', cls: 'flamer', hp: 3400, spd: 3.4, ammo: 3, reload: 1.5, cd: .7, need: 2100,
      atk: { k: 'flame', n: 6, gap: .07, range: 4.7, spd: 15, r: .55, dmg: 230, st: 8 }, sup: { k: 'puddle', range: 6.2, dur: .55, rad: 2.3, life: 5, dps: 900 },
      supName: 'Oil Fire', desc: 'Short-range flame bursts melt anything nearby. Super leaves a burning puddle.', c1: '#ee7a2a', c2: '#fff1d0' }
  ];
  const BRI = {};
  BR.forEach((b, i) => { BRI[b.id] = i; });

  const COLS = ['#3fa9ff', '#ff4a52'];
  const SOLO_COLS = ['#ff4a52', '#3fa9ff', '#ffc233', '#5fd04a', '#b45cff', '#ff8a2a', '#2fd1c2', '#ff6fb5', '#9aa6b8', '#c9d84a'];

  const TEAM_MAPS = [
    { mode: 'gem', id: 'quarry', name: 'Crystal Quarry', theme: 'mine', st: [
      ['M', 15, 9, 16, 10], ['#', 13, 7, 13, 7], ['#', 11, 9, 11, 10], ['#', 9, 4, 10, 5], ['#', 6, 2, 7, 2], ['#', 6, 7, 7, 7], ['b', 8, 8, 9, 9], ['b', 11, 2, 13, 3], ['b', 14, 4, 16, 5],
      ['x', 3, 3, 4, 3], ['x', 5, 5, 5, 6], ['#', 3, 6, 3, 6], ['b', 7, 9, 7, 10], ['~', 10, 7, 10, 8]
    ], sp: [[2.5, 8.5], [2.5, 10.5], [2.5, 12.5]] },
    { mode: 'gem', id: 'amethyst', name: 'Amethyst Run', theme: 'cave', st: [
      ['M', 15, 9, 16, 10], ['#', 12, 6, 14, 6], ['#', 12, 10, 12, 10], ['b', 9, 3, 11, 5], ['#', 8, 6, 8, 8], ['#', 5, 2, 6, 2], ['b', 4, 7, 6, 9], ['#', 6, 5, 6, 5], ['x', 2, 5, 3, 5], ['x', 9, 9, 10, 9],
      ['~', 14, 1, 16, 2], ['b', 15, 3, 16, 3], ['#', 10, 1, 10, 1], ['#', 3, 8, 3, 8]
    ], sp: [[2.5, 8.5], [3.5, 10.5], [2.5, 12.5]] },
    { mode: 'gem', id: 'canyon', name: 'Rust Canyon', theme: 'canyon', st: [
      ['M', 15, 9, 16, 10], ['#', 11, 8, 12, 8], ['#', 14, 6, 14, 7], ['b', 10, 4, 12, 6], ['#', 8, 3, 9, 3], ['#', 7, 5, 7, 6], ['x', 6, 8, 6, 9], ['b', 13, 1, 16, 2], ['#', 4, 5, 5, 5], ['b', 2, 2, 3, 3],
      ['~', 8, 8, 9, 10], ['x', 11, 10, 11, 10], ['#', 10, 1, 10, 2], ['b', 5, 8, 5, 8]
    ], sp: [[2.5, 8.5], [2.5, 10.5], [2.5, 12.5]] },
    { mode: 'ball', id: 'pitch', name: 'Pitch Perfect', theme: 'grass', st: [
      ['#', 0, 0, 3, 7], ['b', 9, 2, 12, 3], ['b', 9, 7, 11, 8], ['#', 7, 4, 8, 4], ['x', 6, 7, 6, 8], ['#', 13, 5, 13, 6], ['#', 13, 1, 14, 1], ['b', 5, 1, 5, 2], ['~', 16, 3, 16, 4]
    ], sp: [[6.5, 7.5], [6.5, 10.5], [6.5, 13.5]], goal: true },
    { mode: 'ball', id: 'sandbar', name: 'Sandbar Cup', theme: 'sand', st: [
      ['#', 0, 0, 3, 7], ['b', 10, 1, 13, 2], ['b', 6, 4, 7, 6], ['x', 12, 6, 13, 6], ['#', 10, 8, 10, 8], ['#', 14, 3, 14, 4], ['~', 8, 8, 9, 10], ['x', 4, 9, 4, 9], ['#', 16, 6, 16, 6]
    ], sp: [[6.5, 8.5], [6.5, 10.5], [6.5, 12.5]], goal: true },
    { mode: 'ball', id: 'ice', name: 'Ice Rink', theme: 'snow', st: [
      ['#', 0, 0, 3, 7], ['#', 8, 3, 9, 3], ['#', 8, 7, 8, 8], ['b', 11, 1, 13, 1], ['b', 12, 8, 14, 9], ['~', 14, 3, 15, 5], ['x', 5, 6, 5, 6], ['#', 12, 5, 12, 5], ['x', 16, 8, 16, 8]
    ], sp: [[6.5, 7.5], [5.5, 10.5], [6.5, 13.5]], goal: true }
  ];

  const SHOW_MAPS = [
    { mode: 'show', id: 'gulch', name: 'Cactus Gulch', theme: 'desert', size: 60, seed: 7, bush: 46, wall: 38, water: 4, box: 30 },
    { mode: 'show', id: 'ruins', name: 'Mossy Ruins', theme: 'moss', size: 60, seed: 31, bush: 56, wall: 44, water: 3, box: 30 },
    { mode: 'show', id: 'frost', name: 'Frost Lake', theme: 'snow', size: 60, seed: 59, bush: 36, wall: 30, water: 7, box: 28 }
  ];
  const MAPS = { gem: TEAM_MAPS.filter(m => m.mode === 'gem'), ball: TEAM_MAPS.filter(m => m.mode === 'ball'), show: SHOW_MAPS };

  function buildMap(def, seed) {
    if (def.mode === 'show') return buildShow(def, seed);
    const W = 33, H = 21, t = new Uint8Array(W * H), CH = { '.': 0, '#': 1, x: 2, b: 3, '~': 4, B: 6, M: 7 };
    const put = (c, x, y) => { for (const [px, py] of [[x, y], [W - 1 - x, y], [x, H - 1 - y], [W - 1 - x, H - 1 - y]]) t[py * W + px] = CH[c]; };
    for (const [c, x0, y0, x1, y1] of def.st) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) put(c, x, y);
    for (let x = 0; x < W; x++) { t[x] = 1; t[(H - 1) * W + x] = 1; }
    for (let y = 0; y < H; y++) { t[y * W] = 1; t[y * W + W - 1] = 1; }
    const sp = [def.sp.map(p => [p[0], p[1]]), def.sp.map(p => [W - p[0], p[1]])];
    const M = mkMap(W, H, t, def, sp);
    if (def.mode === 'gem') M.mine = [W / 2, H / 2];
    else {
      M.goal = [{ x0: 1, x1: 3, y0: 8, y1: 13 }, { x0: W - 3, x1: W - 1, y0: 8, y1: 13 }];
      M.ball = [W / 2, H / 2];
      for (let y = 8; y <= 12; y++) for (let x = 1; x <= 2; x++) { t[y * W + x] = 0; t[y * W + W - 1 - x] = 0; }
    }
    clearSpawn(M, sp[0]); clearSpawn(M, sp[1]);
    return M;
  }
  function mkMap(W, H, t, def, sp) {
    const hp = new Int16Array(W * H);
    for (let i = 0; i < t.length; i++) hp[i] = t[i] === 2 ? CRATE_HP : t[i] === 6 ? BOX_HP : 0;
    return { W, H, t, hp, id: def.id, name: def.name, theme: def.theme, mode: def.mode, sp, gone: [] };
  }
  function clearSpawn(M, list) {
    for (const [sx, sy] of list) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const x = Math.floor(sx) + i, y = Math.floor(sy) + j;
      if (x > 0 && y > 0 && x < M.W - 1 && y < M.H - 1 && solidT(M.t[y * M.W + x])) M.t[y * M.W + x] = 0;
    }
  }
  function buildShow(def, seed) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const M = genShow(def, (seed ^ def.seed) + attempt * 977);
      if (M) return M;
    }
    return genShow(def, def.seed, true);
  }
  function genShow(def, seed, force) {
    const W = def.size, H = def.size, t = new Uint8Array(W * H), R = mul32(seed), ri = (a, b) => a + (R() * (b - a + 1) | 0);
    const at = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? 1 : t[y * W + x];
    const set = (x, y, v) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) t[y * W + x] = v; };
    for (let x = 0; x < W; x++) { t[x] = 1; t[(H - 1) * W + x] = 1; }
    for (let y = 0; y < H; y++) { t[y * W] = 1; t[y * W + W - 1] = 1; }
    const blob = (v, n, rmin, rmax, dens) => { for (let k = 0; k < n; k++) { const cx = ri(4, W - 5), cy = ri(4, H - 5), r = rmin + R() * (rmax - rmin); for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (rad2(x - cx, y - cy) < r * r && R() < dens) set(x, y, v); } };
    blob(T_BUSH, def.bush, 1.6, 3.4, .86);
    blob(T_WATER, def.water, 2, 3.8, 1);
    for (let k = 0; k < def.wall; k++) {
      const x = ri(3, W - 6), y = ri(3, H - 6), shape = ri(0, 3), w = ri(1, 3), h = ri(1, 3);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (shape !== 3 || i === 0 || j === h - 1 || i === w - 1) set(x + i, y + j, T_WALL);
    }
    const sp = [], cx = W / 2, cy = H / 2, rad = W / 2 - 6;
    const a0 = R() * TAU;
    for (let i = 0; i < 10; i++) { const a = a0 + i / 10 * TAU + (R() - .5) * .25, rr2 = rad + (R() - .5) * 2.5; sp.push([cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2]); }
    for (const [x, y] of sp) for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) set(Math.floor(x) + i, Math.floor(y) + j, T_FLOOR);
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (i * i + j * j <= 9) set(Math.floor(cx) + i, Math.floor(cy) + j, T_FLOOR);
    const reach = new Uint8Array(W * H), q = [Math.floor(sp[0][1]) * W + Math.floor(sp[0][0])];
    reach[q[0]] = 1;
    for (let h = 0; h < q.length; h++) { const c = q[h], x = c % W, y = c / W | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const k = ny * W + nx; if (!reach[k] && !solidT(t[k])) { reach[k] = 1; q.push(k); } } }
    if (!force) for (const [x, y] of sp) if (!reach[Math.floor(y) * W + Math.floor(x)]) return null;
    let open = 0;
    for (let i = 0; i < t.length; i++) { if (!solidT(t[i]) && !reach[i]) t[i] = T_WALL; else if (!solidT(t[i])) open++; }
    const boxes = [];
    for (let tries = 0; boxes.length < def.box && tries < 800; tries++) {
      const x = ri(3, W - 4), y = ri(3, H - 4);
      if (t[y * W + x] !== T_FLOOR && t[y * W + x] !== T_BUSH) continue;
      if (sp.some(p => hyp(p[0] - x - .5, p[1] - y - .5) < 5) || hyp(cx - x, cy - y) < 3 && boxes.length > 3) continue;
      if (boxes.some(b => hyp(b[0] - x, b[1] - y) < 3.2)) continue;
      boxes.push([x, y]);
    }
    const bt = [];
    for (const [x, y] of boxes) { bt.push([x, y]); const n = R() < .4 ? ri(1, 2) : 0; for (let k = 0; k < n; k++) { const dx = ri(-1, 1), dy = ri(-1, 1); if (t[(y + dy) * W + x + dx] === T_FLOOR && !boxes.some(b => b[0] === x + dx && b[1] === y + dy)) bt.push([x + dx, y + dy]); } }
    for (const [x, y] of bt) t[y * W + x] = T_BOX;
    for (const [x, y] of sp) for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (t[(Math.floor(y) + j) * W + Math.floor(x) + i] === T_BOX) t[(Math.floor(y) + j) * W + Math.floor(x) + i] = T_FLOOR;
    const M = mkMap(W, H, t, def, [sp]);
    M.center = [cx, cy];
    return M;
  }

  const tileAt = (M, i, j) => i < 0 || j < 0 || i >= M.W || j >= M.H ? 1 : M.t[j * M.W + i];
  function blockedAt(M, x, y, r) {
    const i0 = Math.floor(x - r), i1 = Math.floor(x + r), j0 = Math.floor(y - r), j1 = Math.floor(y + r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!solidT(tileAt(M, i, j))) continue;
      const cx = x < i ? i : x > i + 1 ? i + 1 : x, cy = y < j ? j : y > j + 1 ? j + 1 : y;
      if (rad2(x - cx, y - cy) < r * r) return true;
    }
    return false;
  }
  function moveCirc(M, o, dx, dy, r) {
    let hit = 0;
    if (dx) { if (!blockedAt(M, o.x + dx, o.y, r)) o.x += dx; else { hit |= 1; const s = Math.sign(dx); let lo = 0, hi = Math.abs(dx); for (let k = 0; k < 5; k++) { const m = (lo + hi) / 2; if (blockedAt(M, o.x + s * m, o.y, r)) hi = m; else lo = m; } o.x += s * lo; } }
    if (dy) { if (!blockedAt(M, o.x, o.y + dy, r)) o.y += dy; else { hit |= 2; const s = Math.sign(dy); let lo = 0, hi = Math.abs(dy); for (let k = 0; k < 5; k++) { const m = (lo + hi) / 2; if (blockedAt(M, o.x, o.y + s * m, r)) hi = m; else lo = m; } o.y += s * lo; } }
    return hit;
  }
  function losClear(M, x0, y0, x1, y1) {
    const d = hyp(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / .3));
    for (let k = 1; k < n; k++) { const f = k / n; if (shotT(tileAt(M, Math.floor(lerp(x0, x1, f)), Math.floor(lerp(y0, y1, f))))) return false; }
    return true;
  }
  function walkClear(M, x0, y0, x1, y1, r) {
    const d = hyp(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / .3));
    for (let k = 1; k <= n; k++) { const f = k / n; if (blockedAt(M, lerp(x0, x1, f), lerp(y0, y1, f), r)) return false; }
    return true;
  }

  const THEMES = {
    mine: { g1: '#c9a06a', g2: '#bf9660', wall: '#7f7596', wallTop: '#a79db8', crate: '#b9793a', bush: '#4fb83a', bush2: '#3b9a2c', water: '#2fb4d8', sky: '#2a1d4a', fog: '#2a1d4a', accent: '#c06bff', skirt: '#4a3a66' },
    cave: { g1: '#8f7aae', g2: '#8670a5', wall: '#4e3f7a', wallTop: '#7a68b0', crate: '#a8703a', bush: '#3fb85a', bush2: '#2d9648', water: '#35c2e8', sky: '#1e1540', fog: '#1e1540', accent: '#ff6ad5', skirt: '#33265a' },
    canyon: { g1: '#e0a465', g2: '#d79b5c', wall: '#b5532f', wallTop: '#da7a4a', crate: '#a8703a', bush: '#6bbf3a', bush2: '#4d9d2a', water: '#2fb4d8', sky: '#7a3a22', fog: '#7a3a22', accent: '#ffb347', skirt: '#9a5a36' },
    grass: { g1: '#68c04a', g2: '#5eb542', wall: '#8a8f99', wallTop: '#b4b9c4', crate: '#c08040', bush: '#2f9e3a', bush2: '#238a2e', water: '#35b8e0', sky: '#2a6a3a', fog: '#2a6a3a', accent: '#ffffff', skirt: '#3f8f3a' },
    sand: { g1: '#f0d590', g2: '#e8cb82', wall: '#c9895a', wallTop: '#e6aa7c', crate: '#b9793a', bush: '#5fbe3a', bush2: '#459e2a', water: '#2fd0d8', sky: '#b88a50', fog: '#b88a50', accent: '#ffffff', skirt: '#c9a864' },
    snow: { g1: '#e8f2fb', g2: '#dcebf7', wall: '#7fa8d4', wallTop: '#b8d6f2', crate: '#b9793a', bush: '#4aa86a', bush2: '#368f56', water: '#7fd0f0', sky: '#8ab0d4', fog: '#8ab0d4', accent: '#7fb8ff', skirt: '#a9c8e4' },
    desert: { g1: '#ecc983', g2: '#e4bf77', wall: '#c7794a', wallTop: '#e49a68', crate: '#b9793a', bush: '#5fb83a', bush2: '#479a2a', water: '#2fcad0', sky: '#c9915a', fog: '#c9915a', accent: '#ffd36b', skirt: '#cf9f5c' },
    moss: { g1: '#58a64a', g2: '#4f9b43', wall: '#7c8478', wallTop: '#a3ad9c', crate: '#a8703a', bush: '#2f9a3a', bush2: '#217f2c', water: '#2fb0cf', sky: '#2c5f34', fog: '#2c5f34', accent: '#b8f06a', skirt: '#386f3a' }
  };

  const tkey = (cfgKey) => 'gameplay:bs:save:' + cfgKey;
  const SAVE_V = 1;


  const HIT_R = .5, BR_R = .4;
  const SIGHT = 2.7, SPAWN_SHIELD = 2, RESPAWN = 3, GEM_WIN = 10, GEM_CD = 15, BALL_WIN = 2;

  function newBr(i, p, slot) {
    const d = BR[p.br];
    return { i, name: p.name, br: p.br, team: p.team, slot, human: !!p.human, pid: p.pid || null, bot: p.human ? null : { }, x: 0, y: 0, px: 0, py: 0, aim: 0, face: 0,
      hp: d.hp, mhp: d.hp, ammo: d.ammo, rl: 0, cdT: 0, sup: 0, supR: false, alive: true, resp: 0, shield: 0, lastHit: -9, lastAtk: -9, rev: -9, stun: 0, slow: 0, kbx: 0, kby: 0,
      dash: null, jmp: null, gems: 0, cubes: 0, ball: false, ballCd: 0, mv: 0, kills: 0, dmg: 0, heal: 0, deaths: 0, pts: 0, taken: 0, place: 0, dieT: 0,
      in: { mx: 0, my: 0, aim: 0, f: 0, fa: 0, fd: 0, s: 0, sa: 0, sd: 0 }, fc: 0, sc: 0, iq: [], ack: 0, lastIn: null, q: [] };
  }

  function createSim(cfg) {
    const def = cfg.mapDef, M = buildMap(def, cfg.seed | 0), mode = cfg.mode;
    const S = { cfg, mode, M, tk: 0, time: 0, state: 0, stT: 3.2, brs: [], proj: [], zones: [], turrets: [], items: [], ev: [], pid: 0, left: MODES[mode].time, ot: false,
      gemT: 2.5, cd: [-1, -1], score: [0, 0], ball: null, poison: null, win: -2, res: null, out: [], over: 0, lvl: cfg.lvl == null ? 1 : cfg.lvl, rng: mul32((cfg.seed | 0) + 17), shown: 0 };
    const slots = {};
    cfg.players.forEach((p, i) => {
      const slot = slots[p.team] = (slots[p.team] == null ? 0 : slots[p.team] + 1);
      const b = newBr(i, p, slot);
      S.brs.push(b);
    });
    for (const b of S.brs) placeSpawn(S, b);
    if (mode === 'ball') S.ball = { x: M.ball[0], y: M.ball[1], px: M.ball[0], py: M.ball[1], vx: 0, vy: 0, car: -1, noPick: 0, last: -1 };
    if (mode === 'show') {
      const sp = M.sp[0], rs = S.rng;
      for (let k = sp.length - 1; k > 0; k--) { const j = rs() * (k + 1) | 0; [sp[k], sp[j]] = [sp[j], sp[k]]; }
      for (const b of S.brs) placeSpawn(S, b);
      S.poison = { cx: M.center[0], cy: M.center[1], r: hyp(M.W, M.H) / 2 + 2, t: 0, tick: 1 };
      S.left = 0;
    }
    return S;
  }

  function placeSpawn(S, b, jit) {
    const M = S.M;
    let sp;
    if (S.mode === 'show') sp = M.sp[0][b.slot * 0 + b.i % M.sp[0].length];
    else { const list = M.sp[b.team]; sp = list[b.slot % list.length]; }
    b.x = b.px = sp[0] + (jit ? (S.rng() - .5) * .6 : 0); b.y = b.py = sp[1] + (jit ? (S.rng() - .5) * .6 : 0);
    const cx = M.W / 2, cy = M.H / 2;
    b.aim = b.face = Math.atan2(cy - b.y, cx - b.x);
    b.kbx = b.kby = 0;
  }

  const bushAt = (S, b) => tileAt(S.M, Math.floor(b.x), Math.floor(b.y)) === T_BUSH;
  function canSee(S, team, b) {
    if (b.team === team || !bushAt(S, b) || S.time < b.rev) return true;
    for (const o of S.brs) if (o.alive && o.team === team && rad2(o.x - b.x, o.y - b.y) < SIGHT * SIGHT) return true;
    return false;
  }
  const enemies = (S, b) => S.brs.filter(o => o.alive && o.team !== b.team && !o.jmp);
  const teamGems = (S, t) => { let n = 0; for (const b of S.brs) if (b.team === t) n += b.gems; return n; };

  function addSup(S, b, amt) {
    if (b.supR) return;
    b.sup = Math.min(1, b.sup + amt / BR[b.br].need);
    if (b.sup >= 1) { b.supR = true; S.ev.push(['sr', b.i]); }
  }

  function hurt(S, t, amt, src, o) {
    if (!t.alive || t.jmp || t.shield > 0 || S.state !== 1) return 0;
    o = o || {};
    if (src && src !== t) amt *= 1 + .1 * src.cubes;
    amt = Math.round(amt);
    const real = Math.round(Math.min(amt, t.hp));
    t.hp -= amt; t.lastHit = S.time; t.taken += real; t.rev = Math.max(t.rev, S.time + .35);
    if (src && src !== t) { src.dmg += real; addSup(S, src, real); }
    S.ev.push(['d', t.i, amt, +t.x.toFixed(2), +t.y.toFixed(2), src ? src.i : -1, o.poison ? 1 : 0]);
    if (o.kb) knock(t, o.dx, o.dy, o.kb);
    if (o.stun) { t.stun = Math.max(t.stun, o.stun); dropBall(S, t); }
    if (t.hp <= 0) kill(S, t, src);
    return real;
  }
  function knock(t, dx, dy, dist) {
    const l = hyp(dx, dy) || 1;
    t.kbx += dx / l * dist * 9; t.kby += dy / l * dist * 9;
    t.dash = null;
  }
  function heal(S, t, amt, src) {
    if (!t.alive) return 0;
    const real = Math.min(Math.round(amt), t.mhp - t.hp);
    if (real <= 0) return 0;
    t.hp += real;
    S.ev.push(['h', t.i, real, +t.x.toFixed(2), +t.y.toFixed(2)]);
    if (src) { src.heal += real; if (src !== t) addSup(S, src, real * .6); }
    return real;
  }
  function dropBall(S, b) {
    if (!b.ball || !S.ball) return;
    b.ball = false; S.ball.car = -1; S.ball.noPick = .5; S.ball.x = b.x; S.ball.y = b.y;
    const a = S.rng() * TAU; S.ball.vx = Math.cos(a) * 5; S.ball.vy = Math.sin(a) * 5;
  }
  function popItem(S, k, x, y, ang, spd) {
    S.items.push({ id: ++S.pid, k, x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, age: 0 });
  }
  function aliveCount(S) { let n = 0; for (const b of S.brs) if (b.alive) n++; return n; }

  function kill(S, t, src) {
    t.alive = false; t.hp = 0; t.deaths++; t.dieT = S.time; t.kbx = t.kby = 0; t.dash = null; t.jmp = null; t.stun = 0; t.q = [];
    if (src && src !== t) src.kills++;
    S.ev.push(['k', t.i, src ? src.i : -1, +t.x.toFixed(2), +t.y.toFixed(2)]);
    dropBall(S, t);
    if (S.mode === 'gem') { for (let k = 0; k < t.gems; k++) popItem(S, 0, t.x, t.y, S.rng() * TAU, 2 + S.rng() * 3); t.gems = 0; }
    if (S.mode === 'show') {
      const n = 1 + t.cubes; for (let k = 0; k < n; k++) popItem(S, 1, t.x, t.y, S.rng() * TAU, 2 + S.rng() * 3);
      t.cubes = 0; t.place = aliveCount(S) + 1; S.out.push(t.i);
    } else t.resp = RESPAWN;
  }

  function respawn(S, b) {
    b.alive = true; b.hp = b.mhp = BR[b.br].hp * (1 + .1 * b.cubes); b.ammo = BR[b.br].ammo; b.rl = 0; b.cdT = 0; b.shield = SPAWN_SHIELD; b.stun = 0; b.slow = 0; b.q = [];
    placeSpawn(S, b, true);
    S.ev.push(['rs', b.i]);
  }

  function doAtk(S, b, a, ang, dist, sup) {
    const cx = Math.cos(ang), cy = Math.sin(ang), M = S.M;
    const bul = (an, ex) => emitBullet(S, b, b.x + Math.cos(an) * .45, b.y + Math.sin(an) * .45, an, a, ex);
    switch (a.k) {
      case 'fan': for (let k = 0; k < a.n; k++) bul(ang + (a.n > 1 ? k / (a.n - 1) - .5 : 0) * a.sp * DEG); break;
      case 'bolt': bul(ang, { d0: a.dmg[0], d1: a.dmg[1], dmg: a.dmg[0] }); break;
      case 'bounce': bul(ang); break;
      case 'wave': bul(ang, { pierce: 1 }); break;
      case 'spark': bul(ang); break;
      case 'burst': for (let k = 0; k < a.n; k++) b.q.push({ at: S.time + k * a.gap, ang, a, jit: 0 }); break;
      case 'punch': for (let k = 0; k < a.n; k++) b.q.push({ at: S.time + k * a.gap, ang, a, pierce: 1, off: .2 }); break;
      case 'flame': for (let k = 0; k < a.n; k++) b.q.push({ at: S.time + k * a.gap, ang, a, pierce: 1, jit: 7 }); break;
      case 'lob': {
        const dd = clamp(dist, 1.6, a.range), t = lobTarget(S, b, ang, dd);
        lobShot(S, b, a, t[0], t[1], a.dur);
        break;
      }
      case 'puddle': {
        const dd = clamp(dist, 1.6, a.range), t = lobTarget(S, b, ang, dd);
        lobShot(S, b, a, t[0], t[1], a.dur, { zone: { life: a.life, dps: a.dps }, rad: a.rad, dmg: 0, st: 11 });
        break;
      }
      case 'slash': b.dash = { dx: cx, dy: cy, spd: a.dist / a.dur, left: a.dur, dmg: a.dmg, r: a.r, hit: [] }; b.face = ang; break;
      case 'hop': {
        let d = 0;
        while (d < a.back && !blockedAt(M, b.x - cx * (d + .3), b.y - cy * (d + .3), BR_R)) d += .3;
        b.jmp = { sx: b.x, sy: b.y, tx: b.x - cx * d, ty: b.y - cy * d, t: 0, dur: .42, a, hop: 1, bombs: a.bombs, kind: 'hop' };
        break;
      }
      case 'leap': {
        let dd = clamp(dist, 1.6, a.range);
        while (dd > 1 && blockedAt(M, b.x + cx * dd, b.y + cy * dd, BR_R)) dd -= .25;
        b.jmp = { sx: b.x, sy: b.y, tx: b.x + cx * dd, ty: b.y + cy * dd, t: 0, dur: a.dur, a, kind: 'leap' };
        b.dash = null; b.stun = 0;
        break;
      }
      case 'aoeheal': {
        for (const o of S.brs) if (o.alive && o.team === b.team && rad2(o.x - b.x, o.y - b.y) <= a.rad * a.rad) heal(S, o, o === b ? a.heal * a.self : a.heal, b);
        S.ev.push(['x', +b.x.toFixed(2), +b.y.toFixed(2), a.rad, 20, 0]);
        break;
      }
      case 'turret': {
        let dd = clamp(dist, 1.4, a.range);
        while (dd > .5 && blockedAt(M, b.x + cx * dd, b.y + cy * dd, .35)) dd -= .25;
        for (const t of S.turrets) if (t.o === b.i) t.life = 0;
        S.turrets.push({ id: ++S.pid, o: b.i, team: b.team, x: b.x + cx * dd, y: b.y + cy * dd, hp: a.hp, mhp: a.hp, life: a.life, cd: .6, ang, a });
        S.ev.push(['x', +(b.x + cx * dd).toFixed(2), +(b.y + cy * dd).toFixed(2), 1.2, 21, 0]);
        break;
      }
    }
  }
  function lobTarget(S, b, ang, dd) {
    let x = b.x + Math.cos(ang) * dd, y = b.y + Math.sin(ang) * dd;
    x = clamp(x, 1.2, S.M.W - 1.2); y = clamp(y, 1.2, S.M.H - 1.2);
    return [x, y];
  }
  function lobShot(S, b, a, tx, ty, dur, ex) {
    const p = { id: ++S.pid, o: b.i, team: b.team, st: a.st, x: b.x, y: b.y, px: b.x, py: b.y, vx: 0, vy: 0, r: .2, dmg: a.dmg, rad: a.rad, kb: a.kb || 0, wall: a.wall || 0, stun: 0, lob: { sx: b.x, sy: b.y, tx, ty, t: 0, dur }, left: 99, hit: [], big: a.big || 0, bounce: 0, pierce: 0, heal: 0, chain: 0 };
    if (ex) Object.assign(p, ex);
    p.vx = (tx - b.x) / dur; p.vy = (ty - b.y) / dur;
    S.proj.push(p);
    return p;
  }
  function emitBullet(S, b, x, y, ang, a, ex) {
    const p = { id: ++S.pid, o: b.i, team: b.team, st: a.st || 0, x, y, px: x, py: y, vx: Math.cos(ang) * a.spd, vy: Math.sin(ang) * a.spd, r: a.r, dmg: a.dmg, left: a.range, range: a.range, hit: [], pierce: 0, bounce: a.bounce | 0,
      kb: a.kb || 0, wall: a.wall || 0, heal: a.heal || 0, chain: a.chain || 0, cm: a.chainMul || 0, tur: -1, a: ang };
    if (ex) Object.assign(p, ex);
    S.proj.push(p);
    return p;
  }

  function tryAttack(S, b, ang, dist) {
    if (!b.alive || b.stun > 0 || b.jmp || S.state !== 1) return false;
    const d = BR[b.br];
    if (b.ball) { kickBall(S, b, ang); return true; }
    if (b.cdT > 0 || b.ammo < 1) return false;
    b.ammo--; b.cdT = d.cd; b.lastAtk = S.time; b.rev = S.time + .9; b.face = ang; b.aim = ang;
    S.ev.push(['f', b.i, +ang.toFixed(3), 0]);
    doAtk(S, b, d.atk, ang, dist, false);
    return true;
  }
  function trySuper(S, b, ang, dist) {
    if (!b.alive || b.stun > 0 || b.jmp || S.state !== 1 || b.sup < 1) return false;
    const d = BR[b.br];
    b.sup = 0; b.supR = false; b.lastAtk = S.time; b.rev = S.time + 1; b.face = ang; b.aim = ang; b.cdT = Math.max(b.cdT, .3);
    S.ev.push(['f', b.i, +ang.toFixed(3), 1]);
    doAtk(S, b, d.sup, ang, dist, true);
    return true;
  }
  function kickBall(S, b, ang) {
    const B = S.ball;
    b.ball = false; B.car = -1; B.last = b.i; B.noPick = .3; b.ballCd = .6;
    B.x = b.x + Math.cos(ang) * .7; B.y = b.y + Math.sin(ang) * .7;
    if (blockedAt(S.M, B.x, B.y, .3)) { B.x = b.x; B.y = b.y; }
    B.vx = Math.cos(ang) * 17.5; B.vy = Math.sin(ang) * 17.5;
    b.lastAtk = S.time; b.face = ang; b.aim = ang;
    S.ev.push(['f', b.i, +ang.toFixed(3), 2]);
  }

  function damageTile(S, i, j, dmg) {
    const M = S.M, k = j * M.W + i, t = M.t[k];
    if (t !== 2 && t !== 6) return false;
    M.hp[k] -= dmg;
    S.ev.push(['tw', k, M.hp[k]]);
    if (M.hp[k] <= 0) {
      M.t[k] = 0; M.hp[k] = 0; M.gone.push(k);
      S.ev.push(['w', k, t]);
      if (t === 6) { const n = S.rng() < .35 ? 2 : 1; for (let q = 0; q < n; q++) popItem(S, 1, i + .5, j + .5, S.rng() * TAU, 2 + S.rng() * 2); }
      return true;
    }
    return false;
  }
  function applyGone(M, list) {
    for (const k of list) { if (M.t[k] === 2 || M.t[k] === 6) { M.t[k] = 0; M.hp[k] = 0; if (!M.gone.includes(k)) M.gone.push(k); } }
  }

  function boom(S, p) {
    const o = S.brs[p.o], rad = p.rad, r2 = rad * rad;
    if (p.dmg > 0) for (const t of S.brs) {
      if (!t.alive || t.team === p.team || t.jmp) continue;
      if (rad2(t.x - p.x, t.y - p.y) <= (rad + .3) * (rad + .3)) hurt(S, t, p.dmg, o, { kb: p.kb, dx: t.x - p.x, dy: t.y - p.y });
    }
    for (const t of S.turrets) if (t.team !== p.team && rad2(t.x - p.x, t.y - p.y) <= r2) hurtTurret(S, t, p.dmg);
    if (p.wall) {
      const i0 = Math.floor(p.x - rad), i1 = Math.floor(p.x + rad), j0 = Math.floor(p.y - rad), j1 = Math.floor(p.y + rad);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (rad2(i + .5 - p.x, j + .5 - p.y) <= r2 && i > 0 && j > 0 && i < S.M.W - 1 && j < S.M.H - 1) damageTile(S, i, j, p.wall);
    } else {
      const i0 = Math.floor(p.x - rad), i1 = Math.floor(p.x + rad), j0 = Math.floor(p.y - rad), j1 = Math.floor(p.y + rad);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (tileAt(S.M, i, j) === 6 && rad2(i + .5 - p.x, j + .5 - p.y) <= r2) damageTile(S, i, j, p.dmg);
    }
    if (S.ball && S.ball.car < 0 && rad2(S.ball.x - p.x, S.ball.y - p.y) < r2) { const l = hyp(S.ball.x - p.x, S.ball.y - p.y) || 1; S.ball.vx += (S.ball.x - p.x) / l * 11; S.ball.vy += (S.ball.y - p.y) / l * 11; S.ball.last = p.o; }
    if (p.zone) S.zones.push({ id: ++S.pid, o: p.o, team: p.team, x: p.x, y: p.y, r: rad, life: p.zone.life, dps: p.zone.dps, t: 0 });
    S.ev.push(['x', +p.x.toFixed(2), +p.y.toFixed(2), rad, p.st, p.big || 0]);
  }
  function hurtTurret(S, t, dmg) {
    t.hp -= dmg;
    S.ev.push(['dt', t.id, Math.round(dmg), +t.x.toFixed(2), +t.y.toFixed(2)]);
    if (t.hp <= 0) { t.life = 0; S.ev.push(['x', +t.x.toFixed(2), +t.y.toFixed(2), 1.2, 22, 0]); }
  }

  function stepProj(S) {
    const M = S.M;
    for (let pi = S.proj.length - 1; pi >= 0; pi--) {
      const p = S.proj[pi];
      p.px = p.x; p.py = p.y;
      if (p.lob) {
        const L = p.lob; L.t += DT;
        const f = Math.min(1, L.t / L.dur);
        p.x = lerp(L.sx, L.tx, f); p.y = lerp(L.sy, L.ty, f);
        if (f >= 1) { boom(S, p); S.proj.splice(pi, 1); }
        continue;
      }
      const sp = hyp(p.vx, p.vy), step = Math.min(sp * DT, p.left), n = Math.max(1, Math.ceil(step / .2)), sx = p.vx / sp * step / n, sy = p.vy / sp * step / n;
      let dead = false;
      for (let k = 0; k < n && !dead; k++) {
        const ox = p.x, oy = p.y;
        p.x += sx; p.y += sy;
        const ti = Math.floor(p.x), tj = Math.floor(p.y), tt = tileAt(M, ti, tj);
        if (shotT(tt)) {
          let gone = false;
          if (tt === 6) gone = damageTile(S, ti, tj, p.dmg);
          else if (tt === 2 && p.wall > 0) gone = damageTile(S, ti, tj, p.wall);
          if (gone && p.wall > 0) continue;
          if (p.bounce > 0 && tt !== 6) {
            p.bounce--;
            const oi = Math.floor(ox), oj = Math.floor(oy);
            let fx = oi !== ti, fy = oj !== tj;
            if (!fx && !fy) { fx = true; fy = true; }
            if (fx && fy) { const a1 = shotT(tileAt(M, ti, oj)), a2 = shotT(tileAt(M, oi, tj)); if (a1 && !a2) fy = false; else if (a2 && !a1) fx = false; }
            if (fx) p.vx = -p.vx;
            if (fy) p.vy = -p.vy;
            p.x = ox; p.y = oy;
            S.ev.push(['bn', +p.x.toFixed(2), +p.y.toFixed(2)]);
            continue;
          }
          dead = true; S.ev.push(['hw', +p.x.toFixed(2), +p.y.toFixed(2), p.st]);
          break;
        }
        const own = S.brs[p.o];
        for (const t of S.brs) {
          if (!t.alive || t.jmp || p.hit.includes(t.i)) continue;
          if (t.team === p.team) {
            if (p.heal && t.i !== p.o && rad2(t.x - p.x, t.y - p.y) < (p.r + HIT_R) * (p.r + HIT_R)) { heal(S, t, p.heal, own); p.hit.push(t.i); S.ev.push(['hi', +p.x.toFixed(2), +p.y.toFixed(2), p.st, 1]); }
            continue;
          }
          if (rad2(t.x - p.x, t.y - p.y) < (p.r + HIT_R) * (p.r + HIT_R)) {
            let dmg = p.dmg;
            if (p.d1) { const f = clamp((p.range - p.left) / p.range, 0, 1); dmg = lerp(p.d0, p.d1, f); }
            const real = hurt(S, t, dmg, own, { kb: p.kb, dx: p.vx, dy: p.vy });
            S.ev.push(['hi', +p.x.toFixed(2), +p.y.toFixed(2), p.st, 0]);
            p.hit.push(t.i);
            if (p.chain && real) {
              let best = null, bd = p.chain * p.chain;
              for (const e of S.brs) if (e.alive && e.team !== p.team && e !== t && !e.jmp && canSee(S, p.team, e)) { const d2 = rad2(e.x - t.x, e.y - t.y); if (d2 < bd && losClear(M, t.x, t.y, e.x, e.y)) { bd = d2; best = e; } }
              if (best) { S.ev.push(['ch', +t.x.toFixed(2), +t.y.toFixed(2), +best.x.toFixed(2), +best.y.toFixed(2)]); hurt(S, best, dmg * p.cm, own, {}); }
            }
            if (!p.pierce) { dead = true; break; }
          }
        }
        if (dead) break;
        for (const t of S.turrets) {
          if (t.team === p.team || t.life <= 0 || p.hit.includes('t' + t.id)) continue;
          if (rad2(t.x - p.x, t.y - p.y) < (p.r + .45) * (p.r + .45)) { hurtTurret(S, t, p.dmg); p.hit.push('t' + t.id); if (!p.pierce) { dead = true; break; } }
        }
        if (dead) break;
        const B = S.ball;
        if (B && B.car < 0 && !p.heal && !p.hit.includes('ball') && rad2(B.x - p.x, B.y - p.y) < (p.r + .42) * (p.r + .42)) {
          const l = hyp(p.vx, p.vy) || 1;
          B.vx += p.vx / l * 7; B.vy += p.vy / l * 7; const bs = hyp(B.vx, B.vy); if (bs > 15) { B.vx *= 15 / bs; B.vy *= 15 / bs; }
          B.last = p.o; p.hit.push('ball');
          if (!p.pierce) { dead = true; break; }
        }
      }
      p.left -= step;
      if (dead || p.left <= 0.001) S.proj.splice(pi, 1);
    }
  }

  function stepBr(S, b) {
    const d = BR[b.br], M = S.M;
    b.px = b.x; b.py = b.y;
    if (!b.alive) { if (S.mode !== 'show' && S.state === 1) { b.resp -= DT; if (b.resp <= 0) respawn(S, b); } return; }
    b.cdT = Math.max(0, b.cdT - DT); b.ballCd = Math.max(0, b.ballCd - DT); b.stun = Math.max(0, b.stun - DT); b.slow = Math.max(0, b.slow - DT); b.shield = Math.max(0, b.shield - DT);
    if (b.ammo < d.ammo) { b.rl += DT; if (b.rl >= d.reload) { b.rl = 0; b.ammo++; } } else b.rl = 0;
    if (S.time - b.lastHit > 3 && b.hp < b.mhp && S.state === 1) b.hp = Math.min(b.mhp, b.hp + b.mhp * .08 * DT);
    const inp = b.in;
    if (b.jmp) {
      const J = b.jmp; J.t += DT;
      const f = Math.min(1, J.t / J.dur);
      b.x = lerp(J.sx, J.tx, f); b.y = lerp(J.sy, J.ty, f);
      if (J.hop) { const k = J.a.bombs - J.bombs + 1; if (J.bombs > 0 && f >= k / (J.a.bombs + 1)) { J.bombs--; lobShot(S, b, J.a, b.x, b.y, J.a.fuse, { rad: J.a.rad, dmg: J.a.dmg, wall: J.a.wall, st: 10, kb: 0 }); } }
      if (f >= 1) {
        const a = J.a; b.jmp = null;
        if (J.kind === 'leap') {
          let hits = 0;
          for (const t of S.brs) if (t.alive && t.team !== b.team && !t.jmp && rad2(t.x - b.x, t.y - b.y) <= (a.rad + .3) * (a.rad + .3)) { if (hurt(S, t, a.dmg, b, { stun: a.stun, kb: .4, dx: t.x - b.x, dy: t.y - b.y })) hits++; }
          if (a.self && hits) heal(S, b, a.self, b);
          for (const t of S.turrets) if (t.team !== b.team && rad2(t.x - b.x, t.y - b.y) <= a.rad * a.rad) hurtTurret(S, t, a.dmg);
          S.ev.push(['x', +b.x.toFixed(2), +b.y.toFixed(2), a.rad, 23, 0]);
          const i0 = Math.floor(b.x - a.rad), j0 = Math.floor(b.y - a.rad);
          for (let j = j0; j <= j0 + 2 * Math.ceil(a.rad); j++) for (let i = i0; i <= i0 + 2 * Math.ceil(a.rad); i++) if (tileAt(M, i, j) === 6 && rad2(i + .5 - b.x, j + .5 - b.y) <= a.rad * a.rad) damageTile(S, i, j, a.dmg);
        }
      }
      b.mv = 0;
    } else if (b.dash) {
      const D = b.dash, s = D.spd * DT;
      const hit = moveCirc(M, b, D.dx * s, D.dy * s, BR_R);
      D.left -= DT; b.mv = 1; b.face = Math.atan2(D.dy, D.dx);
      for (const t of S.brs) if (t.alive && t.team !== b.team && !t.jmp && !D.hit.includes(t.i) && rad2(t.x - b.x, t.y - b.y) < (D.r + .45) * (D.r + .45)) { D.hit.push(t.i); hurt(S, t, D.dmg, b, { kb: .6, dx: D.dx, dy: D.dy }); S.ev.push(['hi', +t.x.toFixed(2), +t.y.toFixed(2), 12, 0]); }
      for (const t of S.turrets) if (t.team !== b.team && !D.hit.includes('t' + t.id) && rad2(t.x - b.x, t.y - b.y) < 1.1) { D.hit.push('t' + t.id); hurtTurret(S, t, D.dmg); }
      for (let j = Math.floor(b.y - 1); j <= Math.floor(b.y + 1); j++) for (let i = Math.floor(b.x - 1); i <= Math.floor(b.x + 1); i++) if (tileAt(M, i, j) === 6 && !D.hit.includes('k' + i + '_' + j) && rad2(i + .5 - b.x, j + .5 - b.y) < 1.4) { D.hit.push('k' + i + '_' + j); damageTile(S, i, j, D.dmg); }
      if (D.left <= 0 || hit) b.dash = null;
    } else {
      let mx = inp.mx, my = inp.my, l = hyp(mx, my);
      if (l > 1) { mx /= l; my /= l; l = 1; }
      if (b.stun > 0 || S.state !== 1) { mx = my = 0; l = 0; }
      const sp = d.spd * (b.slow > 0 ? .6 : 1);
      if (l > .05) moveCirc(M, b, mx * sp * DT, my * sp * DT, BR_R);
      b.mv = l > .05 ? 1 : 0;
      if (l > .05 && S.time - b.lastAtk > .45) b.face = Math.atan2(my, mx);
    }
    if (b.kbx || b.kby) {
      moveCirc(M, b, b.kbx * DT, b.kby * DT, BR_R);
      b.kbx *= .8; b.kby *= .8;
      if (Math.abs(b.kbx) + Math.abs(b.kby) < .3) b.kbx = b.kby = 0;
    }
    b.aim = inp.aim;
    if (S.time - b.lastAtk < .35) b.face = b.aim;
    if (b.q.length) {
      for (let k = b.q.length - 1; k >= 0; k--) {
        const e = b.q[k];
        if (S.time >= e.at - 1e-6) {
          b.q.splice(k, 1);
          if (b.stun > 0 || b.jmp) continue;
          const an = e.ang + (e.jit ? (S.rng() - .5) * 2 * e.jit * DEG : 0), off = e.off || .45;
          emitBullet(S, b, b.x + Math.cos(an) * off, b.y + Math.sin(an) * off, an, e.a, e.pierce ? { pierce: 1 } : null);
        }
      }
    }
  }

  function stepInput(S, b) {
    if (!b.human || !b.alive) return;
    const I = b.in;
    if (b.iq.length) { const q = b.iq.shift(); b.ack = q.s; b.lastIn = q; I.mx = q.mx; I.my = q.my; I.aim = q.aim; if (q.f > b.fc) { b.fc = q.f; I.fa = q.fa; I.fd = q.fd; I.fireNow = 1; } if (q.sc > b.sc) { b.sc = q.sc; I.sa = q.sa; I.sd = q.sd; I.supNow = 1; } }
    if (I.fireNow) { I.fireNow = 0; tryAttack(S, b, I.fa, I.fd); }
    if (I.supNow) { I.supNow = 0; trySuper(S, b, I.sa, I.sd); }
  }

  function stepItems(S) {
    const M = S.M;
    for (let k = S.items.length - 1; k >= 0; k--) {
      const it = S.items[k];
      it.age += DT;
      if (it.vx || it.vy) {
        const o = { x: it.x, y: it.y };
        moveCirc(M, o, it.vx * DT, it.vy * DT, .15); it.x = o.x; it.y = o.y;
        it.vx *= .86; it.vy *= .86; if (Math.abs(it.vx) + Math.abs(it.vy) < .05) it.vx = it.vy = 0;
      }
      if (it.age < .5) continue;
      for (const b of S.brs) {
        if (!b.alive || b.jmp || rad2(b.x - it.x, b.y - it.y) > .8 * .8) continue;
        if (it.k === 0) { if (S.mode !== 'gem') continue; b.gems++; b.pts++; }
        else { b.cubes++; b.pts++; const inc = BR[b.br].hp * .1; b.mhp += inc; b.hp += inc; }
        S.ev.push(['p', b.i, it.k, +it.x.toFixed(2), +it.y.toFixed(2)]);
        S.items.splice(k, 1);
        break;
      }
    }
  }

  function stepTurrets(S) {
    for (let k = S.turrets.length - 1; k >= 0; k--) {
      const t = S.turrets[k];
      t.life -= DT; t.cd -= DT;
      if (t.life <= 0) { S.turrets.splice(k, 1); S.ev.push(['tx', t.id]); continue; }
      let best = null, bd = t.a.trange * t.a.trange;
      for (const e of S.brs) if (e.alive && e.team !== t.team && !e.jmp && canSee(S, t.team, e)) { const d2 = rad2(e.x - t.x, e.y - t.y); if (d2 < bd && losClear(S.M, t.x, t.y, e.x, e.y)) { bd = d2; best = e; } }
      if (best) {
        t.ang = Math.atan2(best.y - t.y, best.x - t.x);
        if (t.cd <= 0) {
          t.cd = t.a.cd;
          emitBullet(S, S.brs[t.o], t.x + Math.cos(t.ang) * .5, t.y + Math.sin(t.ang) * .5, t.ang, { spd: 22, r: .22, dmg: t.a.dmg, range: t.a.trange + 1, st: 9 }, { tur: t.id });
          S.ev.push(['tf', t.id, +t.ang.toFixed(3)]);
        }
      }
    }
  }
  function stepZones(S) {
    for (let k = S.zones.length - 1; k >= 0; k--) {
      const z = S.zones[k];
      z.life -= DT; z.t += DT;
      if (z.life <= 0) { S.zones.splice(k, 1); continue; }
      if (z.t >= .25) {
        z.t -= .25;
        const o = S.brs[z.o];
        for (const b of S.brs) if (b.alive && b.team !== z.team && !b.jmp && rad2(b.x - z.x, b.y - z.y) <= (z.r + .2) * (z.r + .2)) hurt(S, b, z.dps * .25, o, {});
      }
    }
  }

  function stepBall(S) {
    const B = S.ball, M = S.M;
    B.px = B.x; B.py = B.y;
    B.noPick = Math.max(0, B.noPick - DT);
    if (B.car >= 0) {
      const c = S.brs[B.car];
      if (!c.alive || !c.ball) { B.car = -1; c.ball = false; }
      else { B.x = c.x + Math.cos(c.face) * .55; B.y = c.y + Math.sin(c.face) * .55; B.vx = B.vy = 0; if (blockedAt(M, B.x, B.y, .25)) { B.x = c.x; B.y = c.y; } return; }
    }
    const sp = hyp(B.vx, B.vy);
    if (sp > .02) {
      const n = Math.max(1, Math.ceil(sp * DT / .25));
      for (let k = 0; k < n; k++) {
        const ox = B.x, oy = B.y;
        B.x += B.vx * DT / n; B.y += B.vy * DT / n;
        if (blockedAt(M, B.x, B.y, .3)) {
          const tx = blockedAt(M, B.x, oy, .3), ty = blockedAt(M, ox, B.y, .3);
          if (tx || !ty) B.vx = -B.vx * .7;
          if (ty || !tx) B.vy = -B.vy * .7;
          B.x = ox; B.y = oy;
          S.ev.push(['bb', +B.x.toFixed(2), +B.y.toFixed(2)]);
        }
      }
      const f = Math.exp(-1.6 * DT);
      B.vx *= f; B.vy *= f;
      if (hyp(B.vx, B.vy) < .25) { B.vx = B.vy = 0; }
    }
    if (B.noPick <= 0 && hyp(B.vx, B.vy) < 9) {
      let best = null, bd = .95 * .95;
      for (const b of S.brs) if (b.alive && !b.jmp && b.ballCd <= 0 && b.stun <= 0) { const d2 = rad2(b.x - B.x, b.y - B.y); if (d2 < bd) { bd = d2; best = b; } }
      if (best) { best.ball = true; B.car = best.i; B.last = best.i; S.ev.push(['bp', best.i]); }
    }
  }

  function resetRound(S) {
    for (const b of S.brs) { b.alive = true; b.hp = b.mhp; b.ammo = BR[b.br].ammo; b.rl = 0; b.cdT = 0; b.shield = 1.5; b.ball = false; b.stun = 0; b.dash = null; b.jmp = null; b.q = []; b.resp = 0; placeSpawn(S, b, true); b.px = b.x; b.py = b.y; }
    const M = S.M;
    Object.assign(S.ball, { x: M.ball[0], y: M.ball[1], px: M.ball[0], py: M.ball[1], vx: 0, vy: 0, car: -1, noPick: 0 });
    S.proj = []; S.zones = []; S.turrets = [];
    S.state = 0; S.stT = 2.4;
  }

  function endMatch(S, win) {
    if (S.state === 3) return;
    S.state = 3; S.stT = 3.2; S.win = win;
    S.ev.push(['end', win]);
    S.res = buildResult(S, win);
  }
  function buildResult(S, win) {
    const sc = b => b.kills * 1500 + b.dmg + b.heal * .9 + b.pts * (S.mode === 'ball' ? 3500 : S.mode === 'gem' ? 700 : 1200) - b.deaths * 400;
    let place = {};
    if (S.mode === 'show') {
      const alive = S.brs.filter(b => b.alive);
      alive.forEach(b => { b.place = 1; });
      if (alive.length > 1) { alive.sort((a, c) => c.hp - a.hp); alive.forEach((b, k) => { b.place = k + 1; }); }
    }
    const players = S.brs.map(b => ({ i: b.i, name: b.name, br: b.br, team: b.team, human: b.human, kills: b.kills, dmg: b.dmg, heal: b.heal, deaths: b.deaths, pts: b.pts, place: b.place, score: Math.round(sc(b)) }));
    let pool = players.filter(p => S.mode === 'show' ? p.place === 1 : (win < 0 ? true : p.team === win));
    if (!pool.length) pool = players;
    let mvp = pool[0];
    for (const p of pool) if (p.score > mvp.score) mvp = p;
    players.forEach(p => { p.mvp = p === mvp ? 1 : 0; });
    return { mode: S.mode, win, players, map: S.M.name, score: S.score.slice(), dur: Math.round(S.time) };
  }

  function stepMode(S) {
    const M = S.M;
    if (S.mode === 'gem') {
      S.gemT -= DT;
      if (S.gemT <= 0) { S.gemT = 6.5; if (S.items.length < 24) popItem(S, 0, M.mine[0], M.mine[1], S.rng() * TAU, 3 + S.rng() * 2); }
      const g = [teamGems(S, 0), teamGems(S, 1)];
      S.g = g;
      for (let t = 0; t < 2; t++) {
        if (g[t] >= GEM_WIN) { if (S.cd[t] < 0) { S.cd[t] = GEM_CD; S.ev.push(['cd', t, 1]); } }
        else if (S.cd[t] >= 0) { S.cd[t] = -1; S.ev.push(['cd', t, 0]); }
        if (S.cd[t] >= 0) { S.cd[t] -= DT; if (S.cd[t] <= 0) { S.cd[t] = 0; endMatch(S, t); return; } }
      }
      S.left -= DT;
      if (S.left <= 0) {
        if (!S.ot) {
          if (g[0] !== g[1]) return endMatch(S, g[0] > g[1] ? 0 : 1);
          S.ot = true; S.left = 30; S.ev.push(['ot']);
        } else return endMatch(S, g[0] === g[1] ? -1 : g[0] > g[1] ? 0 : 1);
      } else if (S.ot && g[0] !== g[1]) return endMatch(S, g[0] > g[1] ? 0 : 1);
    } else if (S.mode === 'ball') {
      stepBall(S);
      const B = S.ball;
      for (let t = 0; t < 2; t++) {
        const g = M.goal[t];
        if (B.x > g.x0 && B.x < g.x1 && B.y > g.y0 && B.y < g.y1) {
          const sc = 1 - t;
          S.score[sc]++;
          if (S.brs[B.last] && S.brs[B.last].team === sc) S.brs[B.last].pts++;
          S.ev.push(['goal', sc, +B.x.toFixed(2), +B.y.toFixed(2)]);
          if (S.score[sc] >= BALL_WIN || S.ot) return endMatch(S, sc);
          S.state = 2; S.stT = 3;
          return;
        }
      }
      S.left -= DT;
      if (S.left <= 0) {
        if (!S.ot) {
          if (S.score[0] !== S.score[1]) return endMatch(S, S.score[0] > S.score[1] ? 0 : 1);
          S.ot = true; S.left = 60; S.ev.push(['ot']);
        } else endMatch(S, -1);
      }
    } else {
      const P = S.poison, t = S.time - 1;
      const t0 = 40, dur = 150, rmax = hyp(M.W, M.H) / 2 + 2, rmin = 3.5;
      P.r = t < t0 ? rmax : t < t0 + dur ? lerp(rmax, rmin, (t - t0) / dur) : t < t0 + dur + 30 ? lerp(rmin, 0.2, (t - t0 - dur) / 30) : .2;
      P.tick -= DT;
      if (P.tick <= 0) {
        P.tick += 1;
        const dmg = 450 + Math.max(0, t - t0) * 6;
        for (const b of S.brs) if (b.alive && !b.jmp && hyp(b.x - P.cx, b.y - P.cy) > P.r) hurt(S, b, dmg, null, { poison: 1 });
      }
      const al = S.brs.filter(b => b.alive);
      if (al.length <= 1) {
        al.forEach(b => { b.place = 1; });
        endMatch(S, al.length ? al[0].i : -1);
      }
    }
  }

  function step(S, botFn) {
    S.tk++;
    if (S.state === 3) { S.stT -= DT; for (const b of S.brs) { b.px = b.x; b.py = b.y; } if (S.stT <= 0) S.over = 1; return; }
    if (S.state === 0) {
      S.stT -= DT;
      for (const b of S.brs) { b.px = b.x; b.py = b.y; b.aim = b.in.aim; }
      if (S.stT <= 0) { S.state = 1; S.ev.push(['go']); }
      return;
    }
    if (S.state === 2) {
      S.stT -= DT;
      for (const b of S.brs) { b.px = b.x; b.py = b.y; }
      if (S.ball) { S.ball.px = S.ball.x; S.ball.py = S.ball.y; }
      if (S.stT <= 0) { resetRound(S); }
      return;
    }
    S.time += DT;
    if (botFn) for (const b of S.brs) if (b.bot && b.alive) botFn(S, b);
    for (const b of S.brs) stepInput(S, b);
    for (const b of S.brs) stepBr(S, b);
    stepProj(S); stepZones(S); stepTurrets(S); stepItems(S);
    stepMode(S);
    if (S.mode === 'show') S.shown = aliveCount(S);
  }

  const snapMove = (M, b, mx, my, spd) => {
    const l = hyp(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    if (hyp(mx, my) > .05) moveCirc(M, b, mx * spd * DT, my * spd * DT, BR_R);
  };

  function saveSim(S) {
    const core = {};
    for (const k of ['tk', 'time', 'state', 'stT', 'left', 'ot', 'gemT', 'cd', 'score', 'pid', 'out', 'shown', 'win']) core[k] = S[k];
    core.proj = S.proj; core.zones = S.zones; core.turrets = S.turrets; core.items = S.items;
    core.ball = S.ball; core.poison = S.poison;
    const brs = S.brs.map(b => { const o = {}; for (const k in b) if (k !== 'bot' && k !== 'iq' && k !== 'in' && k !== 'lastIn') o[k] = b[k]; return o; });
    return { v: SAVE_V, core, brs, gone: S.M.gone.slice(), hp: Array.from(S.M.hp).map((v, i) => v && v !== CRATE_HP && v !== BOX_HP ? [i, v] : null).filter(Boolean) };
  }
  function loadSim(S, d) {
    Object.assign(S, JSON.parse(JSON.stringify(d.core)));
    d.brs.forEach((o, i) => { if (S.brs[i]) Object.assign(S.brs[i], JSON.parse(JSON.stringify(o))); });
    applyGone(S.M, d.gone);
    for (const [i, v] of d.hp) S.M.hp[i] = v;
    S.ev = [];
  }


  const BOT_RANGE = { fan: [3.0, 5.6], bolt: [8.8, 11.8], lob: [6.6, 8.2], wave: [4.8, 6.8], slash: [1.4, 2.9], bounce: [6.5, 10.5], burst: [6.5, 9.2], punch: [1.1, 2.5], spark: [6, 8.4], flame: [2.6, 4.7] };
  const COLLECT_RANK = { healer: 0, thrower: 1, sniper: 2, bounce: 3, gunner: 4, turret: 5, flamer: 6, assassin: 7, tank: 8 };
  const REACT = [.5, .28, .12], AIMERR = [13, 6.5, 2.5], THINK = [.42, .3, .2];

  function navTile(S, x, y) { return clamp(Math.floor(y), 0, S.M.H - 1) * S.M.W + clamp(Math.floor(x), 0, S.M.W - 1); }
  function findPath(S, sx, sy, gx, gy) {
    const M = S.M, W = M.W, H = M.H, N = W * H;
    let nav = S.nav;
    if (!nav || nav.n !== N) nav = S.nav = { n: N, g: new Float32Array(N), from: new Int32Array(N), mark: new Int32Array(N), stamp: 0 };
    nav.stamp++;
    let s = navTile(S, sx, sy), g = navTile(S, gx, gy);
    if (solidT(M.t[g])) {
      let found = -1;
      for (let r = 1; r < 6 && found < 0; r++) for (let j = -r; j <= r && found < 0; j++) for (let i = -r; i <= r; i++) { const x = (g % W) + i, y = (g / W | 0) + j; if (x > 0 && y > 0 && x < W - 1 && y < H - 1 && !solidT(M.t[y * W + x])) { found = y * W + x; break; } }
      if (found < 0) return [];
      g = found;
    }
    if (s === g) return [];
    const gx0 = g % W, gy0 = g / W | 0;
    const heap = [], push = (f, k) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const hf = k => { const dx = Math.abs((k % W) - gx0), dy = Math.abs((k / W | 0) - gy0); return Math.max(dx, dy) + .414 * Math.min(dx, dy); };
    nav.g[s] = 0; nav.mark[s] = nav.stamp; nav.from[s] = -1;
    push(hf(s), s);
    let it = 0, done = false;
    const closed = new Uint8Array(N);
    while (heap.length && it++ < 2600) {
      const [, k] = pop();
      if (closed[k]) continue;
      closed[k] = 1;
      if (k === g) { done = true; break; }
      const x = k % W, y = k / W | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const nx = x + di, ny = y + dj;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nk = ny * W + nx;
        if (solidT(M.t[nk]) || closed[nk]) continue;
        if (di && dj && (solidT(M.t[y * W + nx]) || solidT(M.t[ny * W + x]))) continue;
        let c = nav.g[k] + (di && dj ? 1.414 : 1);
        if (solidT(M.t[ny * W + x + 0]) || solidT(M.t[y * W + nx])) c += .25;
        if (nav.mark[nk] !== nav.stamp || c < nav.g[nk]) { nav.mark[nk] = nav.stamp; nav.g[nk] = c; nav.from[nk] = k; push(c + hf(nk), nk); }
      }
    }
    if (!done) return [];
    const out = [];
    for (let k = g; k !== s && k >= 0; k = nav.from[k]) out.push([(k % W) + .5, (k / W | 0) + .5]);
    return out.reverse();
  }

  function botTargetsRange(d) { return BOT_RANGE[d.atk.k] || [5, 7]; }

  function botAct(S, b) {
    const st = b.bot, d = BR[b.br], M = S.M, lvl = S.lvl;
    if (!st.init) { st.init = 1; st.t = Math.random() * .3; st.path = []; st.pi = 0; st.sd = Math.random() < .5 ? 1 : -1; st.sT = 0; st.seen = 0; st.tg = null; st.gx = b.x; st.gy = b.y; st.rp = 0; st.stuck = 0; st.lx = b.x; st.ly = b.y; st.dodge = 0; st.ddir = 1; st.mode = ''; st.role = 'fight'; st.rt = 0; st.lastGoal = null; }
    if (S.state !== 1) { b.in.mx = b.in.my = 0; return; }
    st.t -= DT; st.sT -= DT; st.rp -= DT; st.dodge -= DT; st.stuck -= 0;
    if (st.t <= 0) { st.t = THINK[lvl] * (.8 + Math.random() * .4); botThink(S, b, st, d); }
    botMove(S, b, st, d);
  }

  function visEnemies(S, b) {
    const out = [];
    for (const e of S.brs) if (e.alive && e.team !== b.team && !e.jmp && canSee(S, b.team, e)) out.push(e);
    return out;
  }

  function botThink(S, b, st, d) {
    const M = S.M, lvl = S.lvl, atk = d.atk;
    const [pref, rng] = botTargetsRange(d);
    st.pref = pref; st.rng = rng;
    const ens = visEnemies(S, b);
    let tg = null, td = 1e9;
    for (const e of ens) { const dd = hyp(e.x - b.x, e.y - b.y) - (e.hp < e.mhp * .35 ? 1.2 : 0); if (dd < td) { td = dd; tg = e; } }
    const sight = S.mode === 'show' ? 9 : 14;
    st.tg = tg && hyp(tg.x - b.x, tg.y - b.y) < sight ? tg : null;
    st.box = null;
    let gx = null, gy = null, fight = 1, hurry = 0;
    const hpf = b.hp / b.mhp;
    const allies = S.brs.filter(o => o.alive && o.team === b.team && o !== b);
    st.flee = false;
    if (S.mode === 'gem') {
      const me = b.team, ot = 1 - me, g = S.g || [0, 0];
      const mates = S.brs.filter(o => o.alive && o.team === me && o.bot);
      let carrier = null, br = 99;
      for (const o of mates) { const r = COLLECT_RANK[BR[o.br].cls]; if (r < br) { br = r; carrier = o; } }
      st.role = carrier === b ? 'carrier' : 'fight';
      const mine = M.mine, own = M.sp[me][1];
      if (S.cd[ot] >= 0 && S.cd[ot] < 14) {
        let tgt = null, bg = -1;
        for (const o of S.brs) if (o.alive && o.team === ot && o.gems > bg) { bg = o.gems; tgt = o; }
        if (tgt) { gx = tgt.x; gy = tgt.y; hurry = 1; st.mode = 'hunt'; }
      } else if (g[me] >= GEM_WIN) {
        st.mode = 'hold';
        if (b.gems > 0) {
          let ax = own[0], ay = own[1];
          gx = ax; gy = ay; fight = 0;
          if (td < 6 && tg) { const l = td || 1; gx = clamp(b.x - (tg.x - b.x) / l * 6, 2, M.W - 2); gy = clamp(b.y - (tg.y - b.y) / l * 6, 2, M.H - 2); }
          st.flee = true;
        } else {
          let c = S.brs.find(o => o.alive && o.team === me && o.gems > 0);
          if (c) { gx = c.x + (own[0] < M.W / 2 ? -1 : 1) * 1.5 + (b.i % 2 ? 1.2 : -1.2); gy = c.y + 1.5 * (b.i % 3 - 1); } else { gx = mine[0]; gy = mine[1]; }
        }
      } else {
        st.mode = 'grab';
        let bestG = null, bd = 1e9;
        for (const it of S.items) if (it.k === 0) {
          let dd = hyp(it.x - b.x, it.y - b.y);
          const near = ens.some(e => hyp(e.x - it.x, e.y - it.y) < 3.2);
          if (near && hpf < .55) dd += 12;
          if (st.role !== 'carrier' && dd > 9) dd += 5;
          if (dd < bd) { bd = dd; bestG = it; }
        }
        if (bestG && bd < (st.role === 'carrier' ? 30 : 18)) { gx = bestG.x; gy = bestG.y; }
        else {
          const side = me === 0 ? -1 : 1, off = st.role === 'carrier' ? 3.2 : 2.2;
          const lane = ((b.i * 7) % 5 - 2) * 1.5;
          gx = mine[0] + side * off + (st.role === 'carrier' ? 0 : -side * 0.3); gy = mine[1] + lane;
        }
        if (st.role === 'carrier') {
          if (b.gems >= 3 && tg && td < 7) { st.flee = true; fight = 0; gx = own[0] + 3; gy = own[1]; }
          else if (tg && td < st.pref * .8) st.flee = true;
        }
        if (b.gems >= 6 && hpf < .6 && tg) { st.flee = true; gx = own[0] + 3; gy = own[1]; }
      }
    } else if (S.mode === 'ball') {
      const B = S.ball, me = b.team, ot = 1 - me;
      const atkG = M.goal[ot], defG = M.goal[me];
      const agx = ot === 1 ? atkG.x0 : atkG.x1, agy = (atkG.y0 + atkG.y1) / 2;
      const dgx = me === 0 ? defG.x1 + 2.5 : defG.x0 - 2.5, dgy = (defG.y0 + defG.y1) / 2;
      st.goalX = (atkG.x0 + atkG.x1) / 2; st.goalY = agy;
      const car = B.car >= 0 ? S.brs[B.car] : null;
      const order = allies.concat([b]).filter(o => o.alive).sort((p, q) => hyp(p.x - B.x, p.y - B.y) - hyp(q.x - B.x, q.y - B.y));
      const chaser = order[0] === b;
      if (b.ball) { st.mode = 'carry'; gx = agx; gy = agy; fight = 1; st.role = 'carrier'; }
      else if (car && car.team === me) {
        st.mode = 'support'; const dir = ot === 1 ? 1 : -1;
        gx = clamp(car.x + dir * 3.5, 3, M.W - 3); gy = clamp(car.y + (b.i % 2 ? 3 : -3), 2, M.H - 2); st.role = 'fight';
      } else if (car) {
        st.mode = 'tackle'; if (chaser || hyp(car.x - b.x, car.y - b.y) < 7 || BR[b.br].cls === 'tank') { gx = car.x; gy = car.y; } else { gx = dgx; gy = dgy + (b.i % 2 ? 3 : -3); }
        hurry = 1;
      } else {
        st.mode = 'ball';
        const ranged = BR[b.br].cls === 'sniper' || BR[b.br].cls === 'thrower';
        if (chaser && !(ranged && order.length > 1 && order[1] === b)) { gx = B.x + B.vx * .3; gy = B.y + B.vy * .3; hurry = 1; }
        else if (order[1] === b && !ranged) { gx = B.x + (ot === 1 ? 2 : -2); gy = B.y + (b.i % 2 ? 3 : -3); }
        else { gx = (dgx + B.x) / 2 + (me === 0 ? 1 : -1) * 2; gy = clamp(B.y, 4, M.H - 4); }
      }
      if (st.mode !== 'carry' && tg && td < 4 && hpf < .3) st.flee = true;
    } else {
      const P = S.poison, dc = hyp(b.x - P.cx, b.y - P.cy), pw = e => e.hp * (1 + .1 * e.cubes);
      const safe = P.r - 3.2;
      if (dc > safe) { const a = Math.atan2(b.y - P.cy, b.x - P.cx); const tr = Math.max(1, Math.min(safe - 2.5, P.r * .5)); gx = P.cx + Math.cos(a) * tr * .3 + (b.i % 3 - 1) * 1.5; gy = P.cy + Math.sin(a) * tr * .3 + (b.i % 3 - 1) * 1.5; st.mode = 'poison'; hurry = 1; }
      else if (!tg && hpf < .62 && S.time > 20) {
        st.mode = 'recover';
        if (!st.bush || hyp(st.bush[0] - b.x, st.bush[1] - b.y) > 14 || M.t[(st.bush[1] | 0) * M.W + (st.bush[0] | 0)] !== T_BUSH) {
          let bb = null, bd2 = 1e9;
          for (let j = Math.max(1, Math.floor(b.y - 9)); j <= Math.min(M.H - 2, Math.floor(b.y + 9)); j++) for (let i = Math.max(1, Math.floor(b.x - 9)); i <= Math.min(M.W - 2, Math.floor(b.x + 9)); i++) if (M.t[j * M.W + i] === T_BUSH && hyp(i - P.cx, j - P.cy) < P.r - 3) { const dd = hyp(i + .5 - b.x, j + .5 - b.y); if (dd < bd2) { bd2 = dd; bb = [i + .5, j + .5]; } }
          st.bush = bb;
        }
        if (st.bush) { gx = st.bush[0]; gy = st.bush[1]; } else { gx = b.x; gy = b.y; }
      }
      else if (tg && hpf < .35 && td < 9 && Math.random() < .9) { st.flee = true; st.mode = 'flee'; const l = td || 1; gx = clamp(b.x - (tg.x - b.x) / l * 8, 2, M.W - 2); gy = clamp(b.y - (tg.y - b.y) / l * 8, 2, M.H - 2); }
      else {
        let cube = null, bd = 1e9;
        for (const it of S.items) if (it.k === 1) { const dd = hyp(it.x - b.x, it.y - b.y); if (dd < bd && hyp(it.x - P.cx, it.y - P.cy) < P.r - 1) { bd = dd; cube = it; } }
        if (cube && bd < 22 && !(tg && td < 5 && pw(tg) > pw(b) * 1.3)) { gx = cube.x; gy = cube.y; st.mode = 'cube'; }
        else if (tg && hpf > .45 && (td < 4.5 || S.time > 16 && ( pw(b) >= pw(tg) * .8 && (td < 7.5 || aliveCount(S) <= 4)))) { st.mode = 'hunt'; gx = tg.x; gy = tg.y; }
        else {
          let bx = null; bd = 1e9;
          const i0 = Math.max(1, Math.floor(b.x - 16)), i1 = Math.min(M.W - 2, Math.floor(b.x + 16)), j0 = Math.max(1, Math.floor(b.y - 16)), j1 = Math.min(M.H - 2, Math.floor(b.y + 16));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (M.t[j * M.W + i] === T_BOX) { const dd = hyp(i + .5 - b.x, j + .5 - b.y); if (dd < bd && hyp(i - P.cx, j - P.cy) < P.r - 2) { bd = dd; bx = [i + .5, j + .5]; } }
          if (bx) { st.mode = 'box'; st.box = bx; gx = bx[0]; gy = bx[1]; if (bd < st.rng * .8) { gx = b.x; gy = b.y; } }
          else { st.mode = 'roam'; if (!st.roam || hyp(st.roam[0] - b.x, st.roam[1] - b.y) < 2 || Math.random() < .08) { const a = Math.random() * TAU, rr2 = Math.random() * Math.max(2, P.r - 6); st.roam = [clamp(P.cx + Math.cos(a) * rr2, 3, M.W - 3), clamp(P.cy + Math.sin(a) * rr2, 3, M.H - 3)]; } gx = st.roam[0]; gy = st.roam[1]; }
        }
      }
    }
    if (gx == null) { gx = b.x; gy = b.y; }
    if (st.tg && S.mode !== 'gem' && st.mode === 'hunt') { }
    if (!st.lastGoal || hyp(st.lastGoal[0] - gx, st.lastGoal[1] - gy) > 1.4 || !st.path.length || st.rp <= 0) {
      st.lastGoal = [gx, gy]; st.path = findPath(S, b.x, b.y, gx, gy); st.pi = 0; st.rp = 1.1;
    }
    st.gx = gx; st.gy = gy; st.fight = fight; st.hurry = hurry;
    st.allies = allies;
  }

  function leadAim(b, e, spd, extra) {
    const dx = e.x - b.x, dy = e.y - b.y, dist = hyp(dx, dy);
    const vx = (e.x - e.px) / DT, vy = (e.y - e.py) / DT;
    const t = (spd ? dist / spd : extra || 0) * .85;
    return [e.x + vx * t, e.y + vy * t];
  }

  function botMove(S, b, st, d) {
    const M = S.M, I = b.in, lvl = S.lvl, atk = d.atk;
    let tg = st.tg;
    if (tg && (!tg.alive || tg.jmp || !canSee(S, b.team, tg))) tg = st.tg = null;
    let mx = 0, my = 0;
    const pathMove = () => {
      const P = st.path;
      while (st.pi < P.length - 1 && walkClear(M, b.x, b.y, P[st.pi + 1][0], P[st.pi + 1][1], .36) && st.pi < P.length - 1 && hyp(P[st.pi + 1][0] - b.x, P[st.pi + 1][1] - b.y) < 6) st.pi++;
      if (st.pi < P.length && hyp(P[st.pi][0] - b.x, P[st.pi][1] - b.y) < .45) st.pi++;
      let tx, ty;
      if (st.pi < P.length) { tx = P[st.pi][0]; ty = P[st.pi][1]; } else { tx = st.gx; ty = st.gy; }
      const dx = tx - b.x, dy = ty - b.y, l = hyp(dx, dy);
      if (l > .15) { mx = dx / l; my = dy / l; }
      if (st.pi >= P.length && hyp(st.gx - b.x, st.gy - b.y) < .6) { mx = my = 0; }
    };
    const dist = tg ? hyp(tg.x - b.x, tg.y - b.y) : 99;
    const inCombat = tg && dist < st.rng * 1.35 && st.fight !== 0;
    pathMove();
    if (st.flee) { if (tg && dist < 10) { const l = dist || 1; const fx = -(tg.x - b.x) / l, fy = -(tg.y - b.y) / l; mx = mx * .6 + fx * .8; my = my * .6 + fy * .8; } }
    else if (inCombat && !(S.mode === 'show' && st.mode !== 'hunt' && dist > st.pref * 1.2) && !(st.mode === 'carry') && !(st.mode === 'cube' || st.mode === 'poison' || st.mode === 'grab' && st.role === 'carrier')) {
      const l = dist || 1, ux = (tg.x - b.x) / l, uy = (tg.y - b.y) / l, pr = st.pref;
      if (st.sT <= 0) { st.sT = .7 + Math.random() * 1.3; if (Math.random() < .5) st.sd = -st.sd; }
      let fwd = 0;
      if (dist > pr * 1.12) fwd = 1; else if (dist < pr * .75) fwd = -1;
      const cls = d.cls;
      if (cls === 'tank' || cls === 'assassin' || cls === 'flamer') fwd = dist > pr * .8 ? 1 : (cls === 'assassin' ? 0 : 0);
      const wsd = lvl >= 1 ? .55 : .25;
      const nx = ux * fwd + (-uy) * st.sd * wsd, ny = uy * fwd + ux * st.sd * wsd;
      const nl = hyp(nx, ny);
      if (nl > .05) { mx = nx / nl; my = ny / nl; if (fwd === 1 && walkClear(M, b.x, b.y, b.x + ux * 1.2, b.y + uy * 1.2, .36) === false) pathMove(); } else { mx = my = 0; }
    }
    if (lvl >= 1 && st.dodge <= 0) {
      for (const p of S.proj) {
        if (p.team === b.team || p.lob) continue;
        const dx = b.x - p.x, dy = b.y - p.y, dd = hyp(dx, dy);
        if (dd > 3.5) continue;
        const sp = hyp(p.vx, p.vy), dot = (dx * p.vx + dy * p.vy) / (dd * sp || 1);
        if (dot > .85 && Math.random() < (lvl === 2 ? .8 : .4)) { st.dodge = .35; st.ddir = Math.random() < .5 ? 1 : -1; st.dx = -p.vy / sp * st.ddir; st.dy = p.vx / sp * st.ddir; break; }
      }
    }
    if (st.dodge > 0 && st.dx !== undefined) { mx = st.dx; my = st.dy; }
    const moved = hyp(b.x - st.lx, b.y - st.ly);
    st.stuckT = (st.stuckT || 0) + DT;
    if (st.stuckT > .6) {
      if (moved < .25 && (mx || my) && !b.stun && !b.dash) { st.unstick = .5; st.ua = Math.random() * TAU; st.rp = 0; st.t = 0; }
      st.lx = b.x; st.ly = b.y; st.stuckT = 0;
    }
    if (st.unstick > 0) { st.unstick -= DT; mx = Math.cos(st.ua); my = Math.sin(st.ua); }
    I.mx = mx; I.my = my;

    let aimA = b.face, dd2 = 0;
    const a = atk;
    let target = tg;
    if (!target && S.mode === 'show' && st.box && hyp(st.box[0] - b.x, st.box[1] - b.y) < st.rng * .95) target = { x: st.box[0], y: st.box[1], px: st.box[0], py: st.box[1], box: 1, hp: 1, mhp: 1 };
    let healT = null;
    if (!target && d.cls === 'healer') { for (const o of st.allies || []) if (o.alive && o.hp < o.mhp * .7 && hyp(o.x - b.x, o.y - b.y) < st.rng && losClear(M, b.x, b.y, o.x, o.y)) healT = o; }
    if (target) {
      const dx = target.x - b.x, dy = target.y - b.y; dd2 = hyp(dx, dy);
      let pt = [target.x, target.y];
      if (!target.box) pt = leadAim(b, target, a.spd, a.dur);
      if (a.k === 'lob') pt = [target.x + (target.x - target.px) / DT * a.dur * .8, target.y + (target.y - target.py) / DT * a.dur * .8];
      aimA = Math.atan2(pt[1] - b.y, pt[0] - b.x);
      dd2 = hyp(pt[0] - b.x, pt[1] - b.y);
    } else if (healT) { aimA = Math.atan2(healT.y - b.y, healT.x - b.x); dd2 = hyp(healT.x - b.x, healT.y - b.y); }
    else if (mx || my) aimA = Math.atan2(my, mx);
    const err = AIMERR[lvl] * DEG * (target && !target.box ? 1 : .3);
    if (!st.aimN || st.aimT <= 0) { st.aimN = (Math.random() - .5) * 2; st.aimT = .25; }
    st.aimT -= DT;
    I.aim = aimA;
    const eligible = (target || healT) && b.alive;
    if (eligible) st.seen += DT; else st.seen = 0;
    const inRange = eligible && dd2 <= st.rng + (a.k === 'lob' ? .3 : .15);
    if (!inRange || st.seen < REACT[lvl] * (target && target.box ? 0 : 1)) { return; }
    const fireA = aimA + st.aimN * err;
    const tgt = target || healT;
    const needLos = a.k !== 'lob';
    let lx = tgt.x, ly = tgt.y;
    if (tgt.box) { const l = hyp(lx - b.x, ly - b.y) || 1, k = Math.max(0, 1 - .75 / l); lx = b.x + (lx - b.x) * k; ly = b.y + (ly - b.y) * k; }
    if (needLos && !losClear(M, b.x, b.y, lx, ly) && a.k !== 'bounce') return;
    if (b.ball) {
      return;
    }
    if (target && !target.box && b.sup >= 1 && botSuper(S, b, st, d, target, fireA, dd2)) return;
    if (b.ammo >= 1 && b.cdT <= 0) {
      if (d.cls === 'sniper' && b.ammo < 2 && dd2 > st.rng * .5 && hyp(tgt.x - b.x, tgt.y - b.y) > 4) return;
      tryAttack(S, b, fireA, dd2);
    }
  }

  function botSuper(S, b, st, d, tg, ang, dist) {
    const s = d.sup, M = S.M;
    let go = false, a = ang, dd = dist;
    const ens = visEnemies(S, b), close = ens.filter(e => hyp(e.x - b.x, e.y - b.y) < 5).length;
    switch (s.k) {
      case 'fan': go = dist < (s.range || 7) * .85 && (s.n > 8 ? dist < 6.5 : dist < s.range * .8); break;
      case 'hop': go = dist < 3.8 || b.hp < b.mhp * .45 && dist < 6; break;
      case 'lob': go = dist > 3.5 && dist < s.range || close >= 2; break;
      case 'aoeheal': go = false; break;
      case 'leap': go = dist > 2.5 && dist < s.range - .5 && (tg.hp < tg.mhp * .75 || close >= 2 || d.cls === 'tank'); break;
      case 'burst': go = dist < s.range * .85 && losClear(M, b.x, b.y, tg.x, tg.y); break;
      case 'turret': go = dist < 9; dd = Math.min(s.range, Math.max(2, dist - 2)); break;
      case 'puddle': go = dist > 2.5 && dist < s.range; break;
    }
    if (go) return trySuper(S, b, a, dd);
    return false;
  }

  function botSupportPass(S, b) {
    const d = BR[b.br];
    if (d.sup.k !== 'aoeheal' || b.sup < 1 || !b.alive) return;
    let need = 0, n = 0;
    for (const o of S.brs) if (o.alive && o.team === b.team && rad2(o.x - b.x, o.y - b.y) <= d.sup.rad * d.sup.rad) { need += o.mhp - o.hp; if (o.hp < o.mhp * .55) n++; }
    if (need > 2600 || n >= 1 && need > 1500) trySuper(S, b, 0, 0);
  }

  function botKick(S, b) {
    if (!b.ball || !b.alive || b.stun > 0) return;
    const st = b.bot, M = S.M;
    if (!st || !st.init) return;
    const gx = st.goalX, gy = st.goalY;
    const dist = hyp(gx - b.x, gy - b.y);
    st.kt = (st.kt || 0) - DT;
    if (st.kt > 0) return;
    const dirX = gx > b.x ? 1 : -1;
    const near = S.brs.some(o => o.alive && o.team !== b.team && hyp(o.x - b.x, o.y - b.y) < 2.2);
    let go = false;
    const ty = gy + (Math.random() - .5) * 2.4;
    if (dist < 10.5 && losClear(M, b.x, b.y, gx, ty)) go = true;
    else if (near && dist < 16 && losClear(M, b.x, b.y, gx, gy)) go = Math.random() < .5;
    if (go) { st.kt = .8; b.in.aim = Math.atan2(ty - b.y, gx - b.x); tryAttack(S, b, Math.atan2(ty - b.y, gx - b.x), dist); }
  }

  function botFn(S, b) {
    botAct(S, b);
    botSupportPass(S, b);
    if (S.mode === 'ball') botKick(S, b);
  }


  function makeRenderer(api, V, opts) {
    const { THREE, renderer, canvas } = V;
    const w = V.w, h = V.h;
    const col = hex => new THREE.Color(hex).convertSRGBToLinear();
    const bin = [];
    const own = o => (bin.push(o), o);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x1a1a2e, 1);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, w / h, .5, 220);
    const root = new THREE.Group(); scene.add(root);
    const dyn = new THREE.Group(); scene.add(dyn);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xb8b0a0, .62); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4e0, .78); sun.castShadow = true; scene.add(sun, sun.target);
    sun.shadow.mapSize.set(opts.small ? 1024 : 2048, opts.small ? 1024 : 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;

    const ctex = (W, H, draw, rep, aniso) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      draw(c.getContext('2d'), W, H);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso || 4;
      if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      bin.push(t);
      return t;
    };
    const G = {
      sph: new THREE.SphereGeometry(1, 18, 12), sphL: new THREE.SphereGeometry(1, 10, 8), box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 16), cone: new THREE.ConeGeometry(1, 1, 14),
      tor: new THREE.TorusGeometry(1, .2, 8, 22), oct: new THREE.OctahedronGeometry(1), ico: new THREE.IcosahedronGeometry(1, 1), icoF: new THREE.IcosahedronGeometry(1, 0), dode: new THREE.DodecahedronGeometry(1),
      hemi: new THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2), cir: new THREE.CircleGeometry(1, 28), ring: new THREE.RingGeometry(.78, 1, 32), plane: new THREE.PlaneGeometry(1, 1)
    };
    Object.values(G).forEach(g => bin.push(g));
    G.cir.rotateX(-Math.PI / 2); G.ring.rotateX(-Math.PI / 2); G.plane.rotateX(-Math.PI / 2);

    const blobTex = ctex(64, 64, (x, W) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.6, 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, W); });
    const glowTex = ctex(64, 64, (x, W) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, W); });
    const blobMat = own(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));

    let M = null, TH = null, S0 = 32, MT = 0;
    let mapG = null, wallsI = null, cratesI = null, boxesI = null, boxCapI = null, bushI = null, waterTex = null, waterI = null, decor = null, mapDispose = [];
    const tileIdx = {};
    const dummy = new THREE.Object3D(), tmpC = new THREE.Color();
    const cache = {};
    const cm = (k, f) => cache[k] || (cache[k] = f());

    function hexMix(a, b, t) { const A = new THREE.Color(a), B = new THREE.Color(b); A.lerp(B, t); return '#' + A.getHexString(); }
    function drawGround(c, W, H, s) {
      const x = c.getContext('2d'), R = mul32(M.W * 131 + M.H);
      x.fillStyle = TH.g1; x.fillRect(0, 0, W, H);
      for (let j = 0; j < M.H; j++) for (let i = 0; i < M.W; i++) {
        const t = M.t[j * M.W + i];
        x.fillStyle = ((i + j) & 1) ? TH.g2 : TH.g1;
        if (M.theme === 'grass') x.fillStyle = (i >> 1) & 1 ? TH.g2 : TH.g1;
        x.fillRect(i * s, j * s, s + 1, s + 1);
        if (t === T_BUSH) { x.fillStyle = hexMix(TH.bush2, '#000000', .25); x.beginPath(); x.arc((i + .5) * s, (j + .5) * s, s * .62, 0, TAU); x.fill(); }
        if (t === T_WATER) { x.fillStyle = hexMix(TH.water, '#000000', .35); x.fillRect(i * s, j * s, s + 1, s + 1); }
        if (t === T_WALL || t === T_CRATE || t === T_BOX) { x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(i * s, j * s, s + 1, s + 1); }
      }
      for (let k = 0; k < M.W * M.H * 3; k++) {
        const px = R() * W, py = R() * H, r = 1 + R() * s * .09;
        x.fillStyle = R() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.08)';
        if (M.theme === 'grass' || M.theme === 'moss') { x.fillStyle = R() < .5 ? 'rgba(20,80,20,.18)' : 'rgba(210,255,140,.14)'; x.fillRect(px, py, 1.5, r * 2.4); }
        else { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
      }
      x.strokeStyle = 'rgba(0,0,0,.06)'; x.lineWidth = 1;
      for (let i = 0; i <= M.W; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, H); x.stroke(); }
      for (let j = 0; j <= M.H; j++) { x.beginPath(); x.moveTo(0, j * s); x.lineTo(W, j * s); x.stroke(); }
      for (let j = 0; j < M.H; j++) for (let i = 0; i < M.W; i++) if (M.t[j * M.W + i] === T_WATER) {
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = s * .09;
        for (const [dx, dy, ax, ay, bx, by] of [[0, -1, 0, 0, 1, 0], [0, 1, 0, 1, 1, 1], [-1, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 1]]) if (tileAt(M, i + dx, j + dy) !== T_WATER) { x.beginPath(); x.moveTo((i + ax) * s, (j + ay) * s); x.lineTo((i + bx) * s, (j + by) * s); x.stroke(); }
      }
      if (M.mode === 'gem') {
        const cx = M.mine[0] * s, cy = M.mine[1] * s;
        let g = x.createRadialGradient(cx, cy, s * .4, cx, cy, s * 2.1); g.addColorStop(0, 'rgba(40,10,70,1)'); g.addColorStop(.62, 'rgba(60,20,90,.95)'); g.addColorStop(.7, TH.accent); g.addColorStop(.78, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, s * 2.1, 0, TAU); x.fill();
      }
      if (M.mode === 'ball') {
        const line = 'rgba(255,255,255,.85)';
        x.strokeStyle = line; x.lineWidth = s * .12; x.lineCap = 'round';
        const X0 = 3.5 * s, X1 = (M.W - 3.5) * s, Y0 = 1 * s, Y1 = (M.H - 1) * s;
        x.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
        x.beginPath(); x.moveTo(M.W / 2 * s, Y0); x.lineTo(M.W / 2 * s, Y1); x.stroke();
        x.beginPath(); x.arc(M.W / 2 * s, M.H / 2 * s, 3.2 * s, 0, TAU); x.stroke();
        x.beginPath(); x.arc(M.W / 2 * s, M.H / 2 * s, .3 * s, 0, TAU); x.fillStyle = line; x.fill();
        for (const t of [0, 1]) {
          const g = M.goal[t], gx = t === 0 ? 0 : M.W, dir = t === 0 ? 1 : -1;
          x.strokeRect(t === 0 ? X0 : X1 - 5 * s, (M.H / 2 - 4.5) * s, 5 * s, 9 * s);
          x.fillStyle = t === MT ? 'rgba(63,169,255,.5)' : 'rgba(255,74,82,.5)';
          x.fillRect(g.x0 * s - s, g.y0 * s, (g.x1 - g.x0 + 1) * s, (g.y1 - g.y0) * s);
          x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1;
          for (let k = 0; k <= 5; k++) { x.beginPath(); x.moveTo(g.x0 * s - s, (g.y0 + k) * s); x.lineTo((g.x1 + 1 - 1) * s, (g.y0 + k) * s); x.stroke(); }
          x.strokeStyle = line; x.lineWidth = s * .12;
        }
      }
    }
    function texStone(c1, top) {
      return ctex(64, 64, (x, W) => {
        x.fillStyle = top ? hexMix(c1, '#ffffff', .22) : c1; x.fillRect(0, 0, W, W);
        if (top) { x.fillStyle = hexMix(c1, '#ffffff', .4); x.fillRect(5, 5, W - 10, W - 10); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(5, W - 9, W - 10, 4); x.fillStyle = 'rgba(255,255,255,.3)'; for (let k = 0; k < 6; k++) x.fillRect(8 + k * 9, 9 + (k * 17) % 40, 5, 2); return; }
        x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 0, W, 6);
        x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, W - 10, W, 10);
        x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 2;
        for (let r = 0; r < 3; r++) { const y = 6 + r * 16; x.beginPath(); x.moveTo(0, y + 16); x.lineTo(W, y + 16); x.stroke(); for (let k = 0; k < 2; k++) { const px = ((r & 1) ? 16 : 0) + k * 32 + 16; x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + 16); x.stroke(); } }
        x.fillStyle = 'rgba(255,255,255,.1)'; for (let k = 0; k < 8; k++) x.fillRect((k * 23) % 60, (k * 13) % 50, 6, 3);
      });
    }
    function texCrate(c1, top) {
      return ctex(64, 64, (x, W) => {
        x.fillStyle = c1; x.fillRect(0, 0, W, W);
        x.fillStyle = hexMix(c1, '#000000', .25);
        for (let k = 0; k < 4; k++) x.fillRect(0, k * 16 + 14, W, 2);
        x.fillStyle = hexMix(c1, '#ffffff', .25); for (let k = 0; k < 4; k++) x.fillRect(0, k * 16, W, 2);
        x.fillStyle = hexMix(c1, '#3a2010', .45); x.fillRect(0, 0, 7, W); x.fillRect(W - 7, 0, 7, W); x.fillRect(0, 0, W, 7); x.fillRect(0, W - 7, W, 7);
        if (!top) { x.strokeStyle = hexMix(c1, '#3a2010', .45); x.lineWidth = 6; x.beginPath(); x.moveTo(4, 4); x.lineTo(W - 4, W - 4); x.moveTo(W - 4, 4); x.lineTo(4, W - 4); x.stroke(); }
        x.fillStyle = '#e8d08a'; for (const [px, py] of [[4, 4], [W - 4, 4], [4, W - 4], [W - 4, W - 4]]) { x.beginPath(); x.arc(px, py, 2.2, 0, TAU); x.fill(); }
      });
    }
    function texBox(top) {
      return ctex(64, 64, (x, W) => {
        const g = x.createLinearGradient(0, 0, 0, W); g.addColorStop(0, top ? '#c9a0ff' : '#8a55d8'); g.addColorStop(1, top ? '#9a5ae8' : '#5a2aa8'); x.fillStyle = g; x.fillRect(0, 0, W, W);
        x.fillStyle = '#ffd24a'; x.fillRect(0, 0, W, 6); x.fillRect(0, W - 6, W, 6); x.fillRect(0, 0, 6, W); x.fillRect(W - 6, 0, 6, W);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(10, 10, W - 20, 5);
        if (!top) { x.fillStyle = '#ffe9a8'; x.font = '900 30px sans-serif'; x.textAlign = 'center'; x.fillText('+', 32, 44); }
      });
    }
    function texBush() {
      return ctex(32, 32, (x, W) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, W); x.fillStyle = 'rgba(0,0,0,.10)'; for (let k = 0; k < 14; k++) { x.beginPath(); x.arc((k * 11) % 32, (k * 7) % 32, 3 + k % 3, 0, TAU); x.fill(); } });
    }
    function texWater() {
      return ctex(128, 128, (x, W) => {
        x.fillStyle = TH.water; x.fillRect(0, 0, W, W);
        x.fillStyle = 'rgba(255,255,255,.22)';
        for (let k = 0; k < 7; k++) { const py = 8 + k * 18, ph = k * 1.3; x.beginPath(); for (let px = 0; px <= W; px += 4) { const yy = py + Math.sin(px / W * TAU * 2 + ph) * 3; if (px === 0) x.moveTo(px, yy); else x.lineTo(px, yy); } x.lineTo(W, py + 5); x.lineTo(0, py + 5); x.closePath(); x.fill(); }
        x.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 8; k++) { x.beginPath(); x.arc((k * 37) % 128, (k * 53) % 128, 2, 0, TAU); x.fill(); }
      }, true);
    }
    function buildMapScene(map, myTeam) {
      clearMap();
      M = map; TH = THEMES[M.theme]; MT = myTeam | 0;
      S0 = Math.min(40, Math.floor(2048 / Math.max(M.W, M.H)));
      mapG = new THREE.Group(); root.add(mapG);
      const gc = document.createElement('canvas'); gc.width = M.W * S0; gc.height = M.H * S0;
      drawGround(gc, gc.width, gc.height, S0);
      const gt = new THREE.CanvasTexture(gc); gt.encoding = THREE.sRGBEncoding; gt.anisotropy = 8; mapDispose.push(gt);
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(M.W, M.H), new THREE.MeshLambertMaterial({ map: gt }));
      gm.rotation.x = -Math.PI / 2; gm.position.set(M.W / 2, 0, M.H / 2); gm.receiveShadow = true; mapG.add(gm); mapDispose.push(gm.geometry, gm.material);
      const sk = new THREE.Mesh(new THREE.PlaneGeometry(M.W + 120, M.H + 120), new THREE.MeshLambertMaterial({ color: col(TH.skirt) }));
      sk.rotation.x = -Math.PI / 2; sk.position.set(M.W / 2, -.02, M.H / 2); sk.receiveShadow = true; mapG.add(sk); mapDispose.push(sk.geometry, sk.material);
      scene.background = col(TH.sky); scene.fog = new THREE.Fog(col(TH.fog).getHex(), 38, 90);
      hemi.groundColor.copy(col(hexMix(TH.g1, '#000000', .35)));
      const cnt = { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 };
      for (let k = 0; k < M.t.length; k++) if (cnt[M.t[k]] != null) cnt[M.t[k]]++;
      const R = mul32(M.W * 17 + M.H * 3 + 5);
      const sideS = texStone(TH.wall, false), topS = texStone(TH.wall, true);
      const wallMats = [0, 0, 1, 1, 0, 0].map(k => new THREE.MeshLambertMaterial({ map: k ? topS : sideS }));
      wallsI = new THREE.InstancedMesh(G.box, wallMats, Math.max(1, cnt[1])); wallsI.castShadow = true; wallsI.receiveShadow = true;
      const sideC = texCrate(TH.crate, false), topC = texCrate(TH.crate, true);
      cratesI = new THREE.InstancedMesh(G.box, [0, 0, 1, 1, 0, 0].map(k => new THREE.MeshLambertMaterial({ map: k ? topC : sideC })), Math.max(1, cnt[2])); cratesI.castShadow = true; cratesI.receiveShadow = true;
      const sideB = texBox(false), topB = texBox(true);
      boxesI = new THREE.InstancedMesh(G.box, [0, 0, 1, 1, 0, 0].map(k => new THREE.MeshLambertMaterial({ map: k ? topB : sideB })), Math.max(1, cnt[6])); boxesI.castShadow = true; boxesI.receiveShadow = true;
      boxCapI = new THREE.InstancedMesh(G.oct, new THREE.MeshLambertMaterial({ color: col('#e8b8ff'), emissive: col('#a040ff') }), Math.max(1, cnt[6]));
      bushI = new THREE.InstancedMesh(G.ico, new THREE.MeshLambertMaterial({ map: texBush(), flatShading: true }), Math.max(1, cnt[3] * 4)); bushI.receiveShadow = true;
      waterTex = texWater();
      waterTex.repeat.set(1, 1);
      waterI = new THREE.InstancedMesh(G.plane, new THREE.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: .93 }), Math.max(1, cnt[4]));
      [wallsI, cratesI, boxesI, boxCapI, bushI, waterI].forEach(m => { mapG.add(m); mapDispose.push(m.geometry === G.box ? null : null); });
      const ci = { 1: 0, 2: 0, 3: 0, 4: 0, 6: 0 };
      tileIdx.w = {}; tileIdx.c = {}; tileIdx.b = {};
      const bushPos = [];
      for (let j = 0; j < M.H; j++) for (let i = 0; i < M.W; i++) {
        const t = M.t[j * M.W + i], k = j * M.W + i;
        if (t === 1) { const hh = .95 + R() * .12; dummy.position.set(i + .5, hh / 2, j + .5); dummy.scale.set(1, hh, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); wallsI.setMatrixAt(ci[1], dummy.matrix); tileIdx.w[k] = ci[1]++; }
        else if (t === 2) { dummy.position.set(i + .5, .46, j + .5); dummy.scale.set(.94, .92, .94); dummy.rotation.set(0, (R() - .5) * .12, 0); dummy.updateMatrix(); cratesI.setMatrixAt(ci[2], dummy.matrix); tileIdx.c[k] = ci[2]++; }
        else if (t === 6) { dummy.position.set(i + .5, .5, j + .5); dummy.scale.set(.92, .92, .92); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); boxesI.setMatrixAt(ci[6], dummy.matrix); dummy.position.set(i + .5, 1.18, j + .5); dummy.scale.set(.3, .4, .3); dummy.updateMatrix(); boxCapI.setMatrixAt(ci[6], dummy.matrix); tileIdx.b[k] = ci[6]++; }
        else if (t === 3) { bushPos.push([i, j]); }
        else if (t === 4) { dummy.position.set(i + .5, .02, j + .5); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); waterI.setMatrixAt(ci[4]++, dummy.matrix); }
      }
      let bi = 0;
      const bc = [col(TH.bush), col(TH.bush2), col(hexMix(TH.bush, '#ffffff', .15))];
      tileIdx.bush = {};
      for (const [i, j] of bushPos) {
        tileIdx.bush[j * M.W + i] = bi;
        for (let q = 0; q < 4; q++) {
          const ox = (q & 1 ? .27 : -.27) + (R() - .5) * .2, oz = (q & 2 ? .27 : -.27) + (R() - .5) * .2, s = .36 + R() * .12;
          dummy.position.set(i + .5 + ox, .38 + R() * .12, j + .5 + oz); dummy.scale.set(s, s * .95, s); dummy.rotation.set(R() * 3, R() * 3, 0); dummy.updateMatrix();
          bushI.setMatrixAt(bi, dummy.matrix); bushI.setColorAt(bi, bc[R() * 3 | 0]); bi++;
        }
      }
      bushI.count = bi;
      [wallsI, cratesI, boxesI, boxCapI, bushI, waterI].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
      wallsI.count = ci[1]; cratesI.count = ci[2]; boxesI.count = ci[6]; boxCapI.count = ci[6]; waterI.count = ci[4];
      if (M.mode === 'gem') buildMine();
      if (M.mode === 'ball') buildGoals();
      buildDecor(R);
      const cx = M.W / 2, cz = M.H / 2, ex = M.W / 2 + 3, ez = M.H / 2 + 3, sc = sun.shadow.camera;
      sun.position.set(cx - M.W * .22, 34, cz - M.H * .1 + 12); sun.target.position.set(cx, 0, cz);
      const rr = Math.max(ex, ez) * 1.18;
      sc.left = -rr; sc.right = rr; sc.top = rr; sc.bottom = -rr; sc.near = 1; sc.far = 110; sc.updateProjectionMatrix();
      renderer.shadowMap.needsUpdate = true;
    }
    function buildMine() {
      const g = new THREE.Group(); g.position.set(M.mine[0], 0, M.mine[1]);
      const cr = [[-.6, -.3, .38, '#c06bff'], [.5, -.5, .3, '#ff6ad5'], [.2, .6, .42, '#8a55ff'], [-.5, .5, .28, '#ff6ad5'], [0, 0, .5, '#d38aff']];
      for (const [x, z, s, c] of cr) {
        const m = new THREE.Mesh(G.oct, new THREE.MeshLambertMaterial({ color: col(c), emissive: col(c).multiplyScalar(.55), flatShading: true }));
        m.position.set(x, s * 1.1, z); m.scale.set(s * .6, s * 1.4, s * .6); m.rotation.y = x * 3; g.add(m);
      }
      mapG.add(g);
    }
    function buildGoals() {
      for (let t = 0; t < 2; t++) {
        const gl = M.goal[t], gx = t === 0 ? 0 : M.W;
        const mat = new THREE.MeshLambertMaterial({ color: col('#ffffff') });
        for (const y of [gl.y0, gl.y1]) {
          const p = new THREE.Mesh(G.cyl, mat); p.scale.set(.14, 1.1, .14); p.position.set(t === 0 ? gl.x1 : gl.x0, .55, y); p.castShadow = true; mapG.add(p);
          const s = new THREE.Mesh(G.sph, new THREE.MeshLambertMaterial({ color: col(t === MT ? COLS[0] : COLS[1]) })); s.scale.setScalar(.22); s.position.set(t === 0 ? gl.x1 : gl.x0, 1.15, y); mapG.add(s);
        }
        const net = new THREE.Mesh(G.box, new THREE.MeshBasicMaterial({ map: ctex(64, 64, (x, W) => { x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(0, 0, W, W); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(k * 16, 0); x.lineTo(k * 16, W); x.moveTo(0, k * 16); x.lineTo(W, k * 16); x.stroke(); } }, true), transparent: true, opacity: .8 }));
        net.scale.set(.08, .75, gl.y1 - gl.y0); net.position.set(t === 0 ? gl.x0 - 1 + .04 : gl.x1 + 1 - .04, .38, (gl.y0 + gl.y1) / 2); mapG.add(net);
      }
    }
    function buildDecor(R) {
      const th = M.theme, items = [];
      const kinds = th === 'snow' ? ['pine', 'rock'] : th === 'desert' || th === 'sand' || th === 'canyon' ? ['cactus', 'rock'] : th === 'mine' || th === 'cave' ? ['crystal', 'rock'] : ['tree', 'rock'];
      const n = Math.round((M.W + M.H) * 3.2);
      for (let k = 0; k < n; k++) {
        let x, y, tries = 0;
        do { x = -9 + R() * (M.W + 18); y = -9 + R() * (M.H + 18); tries++; } while ((x > -.2 && x < M.W + .2 && y > -.2 && y < M.H + .2) && tries < 20);
        if (x > -.2 && x < M.W + .2 && y > -.2 && y < M.H + .2) continue;
        items.push([x, y, kinds[R() < .35 ? 1 : 0], .7 + R() * .9, R() * TAU]);
      }
      const grp = new THREE.Group(); mapG.add(grp);
      const rm = new THREE.MeshLambertMaterial({ color: col(hexMix(TH.wall, '#ffffff', .1)), flatShading: true });
      const mk = (type, geo, matc, em) => { const arr = items.filter(i => i[2] === type); const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: col(matc), flatShading: true, emissive: em ? col(em) : 0x000000 }), Math.max(1, arr.length)); arr.forEach((it, q) => { dummy.position.set(it[0], 0, it[1]); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, it[4], 0); dummy.updateMatrix(); m.setMatrixAt(q, dummy.matrix); }); m.count = arr.length; grp.add(m); return arr; };
      const rocks = items.filter(i => i[2] === 'rock'), rI = new THREE.InstancedMesh(G.dode, rm, Math.max(1, rocks.length));
      rocks.forEach((it, q) => { dummy.position.set(it[0], .3 * it[3], it[1]); dummy.scale.set(.6 * it[3], .45 * it[3], .6 * it[3]); dummy.rotation.set(0, it[4], 0); dummy.updateMatrix(); rI.setMatrixAt(q, dummy.matrix); }); rI.count = rocks.length; grp.add(rI);
      const prop = (type, geo, matc, y0, sx, sy, em) => { const arr = items.filter(i => i[2] === type); const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: col(matc), flatShading: true, emissive: em ? col(em) : 0x000000 }), Math.max(1, arr.length)); arr.forEach((it, q) => { dummy.position.set(it[0], y0 * it[3], it[1]); dummy.scale.set(sx * it[3], sy * it[3], sx * it[3]); dummy.rotation.set(0, it[4], 0); dummy.updateMatrix(); m.setMatrixAt(q, dummy.matrix); }); m.count = arr.length; grp.add(m); return m; };
      prop('tree', G.ico, '#2f8f3a', 1.3, .9, 1.0); prop('tree', G.cyl, '#7a4a28', .45, .16, .9);
      prop('pine', G.cone, th === 'snow' ? '#e8f4ff' : '#2f7a4a', 1.4, .8, 2.2); prop('cactus', G.cyl, '#4f9a3a', .9, .22, 1.8); prop('crystal', G.oct, '#a766ff', .9, .35, 1.7, '#5a2aa0');
    }
    function clearMap() {
      if (mapG) { root.remove(mapG); mapG.traverse(o => { if (o.geometry && !Object.values(G).includes(o.geometry)) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); }
      mapDispose.forEach(o => { if (o && o.dispose) o.dispose(); }); mapDispose = [];
      mapG = null;
      for (const k in tileIdx) delete tileIdx[k];
    }
    function removeTile(k, t) {
      const zero = new THREE.Matrix4().makeScale(0, 0, 0);
      if (t === 2 && tileIdx.c[k] != null) { cratesI.setMatrixAt(tileIdx.c[k], zero); cratesI.instanceMatrix.needsUpdate = true; }
      if (t === 6 && tileIdx.b[k] != null) { boxesI.setMatrixAt(tileIdx.b[k], zero); boxCapI.setMatrixAt(tileIdx.b[k], zero); boxesI.instanceMatrix.needsUpdate = true; boxCapI.instanceMatrix.needsUpdate = true; }
      renderer.shadowMap.needsUpdate = true;
    }

    const PN = 2200, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 4), pSize = new Float32Array(PN), pV = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pGrow = new Float32Array(PN), pDrag = new Float32Array(PN), pGrav = new Float32Array(PN), pS0 = new Float32Array(PN);
    let pHead = 0, pCount = 0;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pg.setAttribute('col', new THREE.BufferAttribute(pCol, 4)); pg.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uScale: { value: 400 } },
      vertexShader: 'attribute vec4 col; attribute float size; varying vec4 vc; uniform float uScale; void main(){ vc=col; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*uScale/(-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying vec4 vc; void main(){ float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard; float a=smoothstep(0.5,0.12,d); gl_FragColor=vec4(vc.rgb, vc.a*a); }'
    });
    const pts = new THREE.Points(pg, pm); pts.frustumCulled = false; pts.renderOrder = 10; scene.add(pts);
    bin.push(pg, pm);
    const rgb = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
    function emit(x, y, z, vx, vy, vz, size, life, c, a, grow, drag, grav) {
      const i = pHead; pHead = (pHead + 1) % PN; pCount = Math.min(PN, pCount + 1);
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z; pV[i * 3] = vx; pV[i * 3 + 1] = vy; pV[i * 3 + 2] = vz;
      pS0[i] = size; pSize[i] = size; pLife[i] = life; pMax[i] = life; pGrow[i] = grow || 0; pDrag[i] = drag == null ? 1 : drag; pGrav[i] = grav || 0;
      pCol[i * 4] = c[0]; pCol[i * 4 + 1] = c[1]; pCol[i * 4 + 2] = c[2]; pCol[i * 4 + 3] = a;
    }
    function burst(x, y, z, n, hex, spd, size, life, o) {
      o = o || {};
      const c = Array.isArray(hex) ? hex : rgb(hex);
      for (let k = 0; k < n; k++) {
        const a = Math.random() * TAU, e = o.up ? Math.random() * .8 : (Math.random() - .5) * 1.4, s = spd * (.4 + Math.random() * .8);
        emit(x, y, z, Math.cos(a) * s * Math.cos(e), (o.vy == null ? Math.sin(Math.abs(e)) * s : o.vy * (.5 + Math.random())), Math.sin(a) * s * Math.cos(e), size * (.6 + Math.random() * .8), life * (.6 + Math.random() * .6), c, o.a == null ? 1 : o.a, o.grow, o.drag == null ? .9 : o.drag, o.grav == null ? 6 : o.grav);
      }
    }
    function updParticles(dt) {
      for (let i = 0; i < PN; i++) {
        if (pLife[i] <= 0) { pSize[i] = 0; continue; }
        pLife[i] -= dt;
        if (pLife[i] <= 0) { pSize[i] = 0; pCol[i * 4 + 3] = 0; continue; }
        const f = pLife[i] / pMax[i], dr = Math.pow(pDrag[i], dt * 30);
        pV[i * 3] *= dr; pV[i * 3 + 1] = pV[i * 3 + 1] * dr - pGrav[i] * dt; pV[i * 3 + 2] *= dr;
        pPos[i * 3] += pV[i * 3] * dt; pPos[i * 3 + 1] += pV[i * 3 + 1] * dt; pPos[i * 3 + 2] += pV[i * 3 + 2] * dt;
        if (pPos[i * 3 + 1] < .02 && pGrav[i] > 0) { pPos[i * 3 + 1] = .02; pV[i * 3 + 1] *= -.3; }
        pSize[i] = pS0[i] * (pGrow[i] ? 1 + pGrow[i] * (1 - f) : f > .25 ? 1 : f / .25 * .6 + .4);
        pCol[i * 4 + 3] = Math.min(1, f * 2.2) * (pCol[i * 4 + 3] > 0 ? Math.max(pCol[i * 4 + 3], .0) : 0) + (pCol[i * 4 + 3] <= 0 ? 0 : 0);
        if (pCol[i * 4 + 3] <= 0.0001) pCol[i * 4 + 3] = 0;
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.col.needsUpdate = true; pg.attributes.size.needsUpdate = true;
    }

    function stdMat(c, o) { return new THREE.MeshLambertMaterial(Object.assign({ color: col(c) }, o || {})); }
    function buildBrawlerModel(id, cl1, cl2) {
      const g = new THREE.Group(), mats = [], mc = {};
      const mat = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); if (mc[k]) return mc[k]; const m = stdMat(c, o); m.userData.base = m.color.clone(); m.userData.em = m.emissive ? m.emissive.clone() : null; mats.push(m); return mc[k] = m; };
      const add = (parent, geo, c, x, y, z, sx, sy, sz, o) => { const m = new THREE.Mesh(geo, mat(c, o)); m.position.set(x, y, z); m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); parent.add(m); return m; };
      const rig = { g, mats };
      const body = new THREE.Group(); g.add(body); rig.body = body;
      const legs = [add(body, G.box, '#2a2a3a', 0, .12, .18, .24, .24, .22), add(body, G.box, '#2a2a3a', 0, .12, -.18, .24, .24, .22)];
      rig.legs = legs;
      const eyes = (parent, x, y, z, sp, s, c) => { for (const sg of [-1, 1]) { add(parent, G.sph, '#ffffff', x, y, z + sg * sp, s, s * 1.15, s * .9); add(parent, G.sph, c || '#1a1a2a', x + s * .6, y, z + sg * sp, s * .55, s * .7, s * .55); } };
      const arms = (parent, c, x, y, z, s) => { rig.armL = add(parent, G.sph, c, x, y, -z, s); rig.armR = add(parent, G.sph, c, x, y, z, s); };
      let hd, bd;
      switch (id) {
        case 'bramble': {
          bd = add(body, G.sph, cl2, 0, .62, 0, .46, .5, .44);
          add(body, G.sph, '#e8c898', .2, .6, 0, .3, .36, .3);
          hd = add(body, G.sph, cl1, .02, 1.2, 0, .4, .36, .4);
          add(hd, G.sph, cl1, -.1, 1.15, .85, .32, .32, .32); add(hd, G.sph, cl1, -.1, 1.15, -.85, .32, .32, .32);
          add(hd, G.sph, '#e8b8a0', 0, 1.05, .85, .18); add(hd, G.sph, '#e8b8a0', 0, 1.05, -.85, .18);
          add(hd, G.sph, '#e8c898', .85, -.3, 0, .42, .34, .46); add(hd, G.sph, '#2a1a1a', 1.2, -.12, 0, .16, .12, .2);
          eyes(body, .32, 1.28, 0, .16, .08);
          arms(body, cl1, 0, .7, .5, .14);
          add(body, G.cyl, '#3a3a44', .55, .7, .22, .05, .9, .05).rotation.z = Math.PI / 2;
          add(body, G.box, '#7a4a28', .15, .62, .22, .3, .12, .1);
          rig.weapon = add(body, G.cyl, '#555566', .62, .7, .22, .06, .8, .06); rig.weapon.rotation.z = Math.PI / 2;
          break;
        }
        case 'talon': {
          bd = add(body, G.sph, cl1, 0, .62, 0, .4, .5, .4); add(body, G.sph, '#f0e6d0', .14, .56, 0, .3, .38, .28);
          hd = add(body, G.sph, cl1, .04, 1.2, 0, .38, .36, .38);
          add(hd, G.cone, '#ffc233', 1.05, -.1, 0, .3, .8, .3).rotation.z = -Math.PI / 2;
          for (let k = -1; k <= 1; k++) add(hd, G.cone, cl1, -1, 1.1, k * .5, .2, .7, .2).rotation.z = Math.PI / 2 + .6;
          eyes(body, .3, 1.27, 0, .14, .08, '#2a2a5a');
          const gg = add(body, G.tor, '#333344', .36, 1.28, .15, .12, .12, .12); gg.rotation.y = Math.PI / 2; add(body, G.sph, '#9fe8ff', .4, 1.28, .15, .09, .09, .03, { emissive: col('#3a8ab0') });
          add(body, G.tor, cl2, 0, .95, 0, .3, .3, .3).rotation.x = Math.PI / 2;
          arms(body, cl1, 0, .7, .46, .13);
          rig.weapon = add(body, G.cyl, '#3a3a48', .5, .75, .2, .045, 1.2, .045); rig.weapon.rotation.z = Math.PI / 2;
          add(body, G.cyl, '#222', .55, .85, .2, .07, .3, .07).rotation.z = Math.PI / 2;
          break;
        }
        case 'dyna': {
          bd = add(body, G.sph, cl1, 0, .58, 0, .44, .46, .44); add(body, G.sph, '#d9c4d9', .16, .5, 0, .3, .34, .28);
          hd = add(body, G.sph, cl1, .05, 1.12, 0, .4, .35, .4);
          add(hd, G.sph, '#ff9fb8', 1.0, -.1, 0, .3, .26, .3);
          const hm = add(body, G.hemi, cl2, .03, 1.28, 0, .46, .42, .46);
          add(body, G.cyl, '#8a6a10', .03, 1.3, 0, .52, .06, .52);
          add(body, G.sph, '#fff6c0', .42, 1.42, 0, .1, .1, .1, { emissive: col('#ffe680') });
          eyes(body, .33, 1.18, 0, .15, .08);
          arms(body, cl1, 0, .64, .48, .13);
          for (let k = -1; k <= 1; k++) add(body, G.cyl, '#d63b3b', -.38, .7, k * .12, .05, .5, .05);
          add(body, G.cyl, '#333', -.38, .98, 0, .02, .1, .02);
          rig.weapon = add(body, G.cyl, '#d63b3b', .4, .7, .45, .06, .45, .06); rig.weapon.rotation.z = Math.PI / 2;
          break;
        }
        case 'lulu': {
          bd = add(body, G.sph, cl1, 0, .56, 0, .44, .44, .44); add(body, G.sph, '#d8f5b0', .16, .5, 0, .3, .34, .28);
          hd = add(body, G.sph, cl1, .02, 1.12, 0, .46, .32, .5);
          for (const sg of [-1, 1]) { add(hd, G.sph, cl1, .5, 1.1, sg * .62, .34, .34, .34); }
          eyes(body, .3, 1.36, 0, .22, .1);
          add(body, G.box, '#2a1a1a', .45, 1.0, 0, .02, .04, .22);
          add(body, G.tor, cl2, 0, .9, 0, .27, .27, .27).rotation.x = Math.PI / 2;
          arms(body, cl1, 0, .64, .5, .13);
          const gt = new THREE.Group(); gt.position.set(.5, .55, .1); body.add(gt);
          add(gt, G.sph, '#a8683a', 0, 0, 0, .22, .3, .12); add(gt, G.sph, '#6a3a18', .02, 0, 0, .08, .08, .13);
          const nk = add(gt, G.cyl, '#7a4a28', .3, .3, 0, .04, .5, .04); nk.rotation.z = -.7;
          rig.weapon = gt;
          break;
        }
        case 'vex': {
          bd = add(body, G.sph, cl1, 0, .58, 0, .36, .46, .34); add(body, G.sph, '#6a5aa0', .15, .54, 0, .24, .34, .22);
          hd = add(body, G.sph, cl1, .04, 1.18, 0, .38, .34, .38);
          for (const sg of [-1, 1]) { const e = add(hd, G.cone, cl1, -.1, 1.0, sg * .6, .24, .6, .2); e.rotation.x = sg * -.25; add(hd, G.cone, '#ff9fd0', -.05, 1.0, sg * .62, .12, .42, .1).rotation.x = sg * -.25; }
          for (const sg of [-1, 1]) { const e = add(body, G.sph, cl2, .36, 1.2, sg * .15, .08, .1, .13, { emissive: col('#aa8800') }); e.rotation.x = sg * .4; }
          add(body, G.box, cl2, -.1, .95, 0, .32, .09, .5);
          add(body, G.box, cl2, -.5, .85, 0, .5, .14, .14).rotation.z = .3;
          arms(body, cl1, 0, .64, .42, .12);
          const tail = []; for (let k = 0; k < 4; k++) tail.push(add(body, G.sph, cl1, -.5 - k * .16, .3 + k * .1, k % 2 ? .08 : -.08, .1 - k * .01));
          rig.weapon = add(body, G.box, '#d8e0f0', .38, .66, .5, .3, .06, .04);
          break;
        }
        case 'zippy': {
          bd = add(body, G.sph, cl1, 0, .6, 0, .44, .46, .44); add(body, G.box, '#556677', .4, .6, 0, .06, .3, .3);
          add(body, G.sph, cl2, .42, .62, 0, .05, .06, .06, { emissive: col('#118899') });
          hd = add(body, G.sph, '#d8e0ea', .02, 1.18, 0, .4, .34, .4);
          add(body, G.sph, '#ffffff', .34, 1.2, 0, .16, .17, .17); add(body, G.sph, cl2, .46, 1.2, 0, .1, .11, .11, { emissive: col('#0fa8bc') });
          add(body, G.cyl, '#556677', 0, 1.6, 0, .03, .3, .03); add(body, G.sph, '#ff4a52', 0, 1.78, 0, .08, .08, .08, { emissive: col('#aa1a22') });
          arms(body, '#8a96a8', 0, .62, .5, .13);
          for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) add(body, G.tor, '#445566', 0, .15 + k * .05, sg * .18, .08, .08, .08).rotation.x = Math.PI / 2;
          rig.weapon = add(body, G.cyl, '#445566', .5, .66, .28, .08, .5, .08); rig.weapon.rotation.z = Math.PI / 2;
          break;
        }
        case 'dusty': {
          bd = add(body, G.sph, cl2, 0, .6, 0, .42, .48, .42); add(body, G.sph, '#d8d0c0', .15, .54, 0, .28, .36, .26);
          hd = add(body, G.sph, cl1, .02, 1.18, 0, .38, .34, .4);
          add(hd, G.box, '#2a2a30', .6, .05, 0, .6, .26, 1.1);
          add(hd, G.sph, '#eee8dc', 1.0, -.35, 0, .4, .3, .5); add(hd, G.sph, '#222', 1.38, -.12, 0, .13, .12, .15);
          for (const sg of [-1, 1]) add(hd, G.sph, cl1, -.2, 1.0, sg * .8, .28, .3, .24);
          eyes(body, .34, 1.22, 0, .15, .07);
          add(body, G.cyl, '#8a5a30', .02, 1.5, 0, .3, .1, .3); add(body, G.cyl, '#8a5a30', .02, 1.65, 0, .24, .24, .24); add(body, G.cyl, '#3a2410', .02, 1.56, 0, .25, .05, .25);
          arms(body, cl1, 0, .64, .46, .13);
          for (let k = 0; k < 4; k++) add(body, G.cyl, k % 2 ? '#2a2a30' : cl1, -.45 - k * .06, .35 + k * .04, 0, .09, .14, .09).rotation.z = Math.PI / 2;
          rig.weapon = add(body, G.box, '#5a5a66', .5, .66, .46, .3, .12, .08);
          add(body, G.box, '#5a5a66', .5, .66, -.46, .26, .12, .08);
          break;
        }
        case 'rocco': {
          bd = add(body, G.sph, cl1, 0, .66, 0, .56, .58, .56); add(body, G.sph, cl2, 0, .3, 0, .48, .26, .48);
          add(body, G.tor, '#ffc233', 0, .52, 0, .5, .5, .5).rotation.x = Math.PI / 2;
          hd = add(body, G.sph, cl1, .1, 1.34, 0, .38, .34, .38);
          add(hd, G.cone, '#f0e6d0', 1.2, -.2, 0, .2, .8, .2).rotation.z = -Math.PI / 2 + .35;
          for (const sg of [-1, 1]) add(hd, G.sph, cl1, -.3, .95, sg * .75, .2, .22, .16);
          add(hd, G.box, cl2, .3, .3, 0, .95, .26, 1.0);
          eyes(body, .38, 1.38, 0, .14, .07);
          arms(body, cl2, 0, .8, .66, .22);
          rig.weapon = null;
          break;
        }
        case 'gizmo': {
          bd = add(body, G.sph, cl1, 0, .52, 0, .36, .4, .34); add(body, G.box, '#555', 0, .38, 0, .4, .1, .38);
          hd = add(body, G.sph, cl1, .03, 1.02, 0, .42, .36, .44);
          for (const sg of [-1, 1]) { add(hd, G.cone, cl1, -.1, .5, sg * 1.1, .26, .8, .18).rotation.x = sg * -1.2; add(body, G.tor, '#334', .3, 1.1, sg * .17, .17, .17, .17).rotation.y = Math.PI / 2; add(body, G.sph, cl2, .34, 1.1, sg * .17, .12, .12, .05, { emissive: col('#18857a') }); }
          add(body, G.box, '#334', .28, 1.1, 0, .06, .05, .28);
          add(body, G.sph, '#fff', .38, .86, 0, .02, .02, .02);
          add(body, G.box, '#2a2a30', .46, .9, 0, .02, .04, .2);
          add(body, G.cyl, '#556', -.4, .7, 0, .17, .5, .17); add(body, G.cyl, '#778', -.4, 1.1, 0, .02, .5, .02); add(body, G.sph, '#ff4a52', -.4, 1.35, 0, .07, .07, .07, { emissive: col('#a01a22') });
          arms(body, cl1, 0, .56, .4, .12);
          rig.weapon = add(body, G.box, '#aab', .4, .62, .42, .4, .06, .06);
          add(body, G.tor, '#aab', .62, .62, .42, .1, .1, .1);
          break;
        }
        case 'ember': {
          bd = add(body, G.sph, cl1, 0, .6, 0, .4, .46, .38); add(body, G.sph, cl2, .15, .54, 0, .26, .34, .24);
          hd = add(body, G.sph, cl1, .04, 1.18, 0, .38, .34, .38);
          for (const sg of [-1, 1]) { add(hd, G.cone, cl1, -.15, 1.0, sg * .6, .24, .7, .2).rotation.x = sg * -.15; add(hd, G.cone, '#3a2010', -.15, 1.25, sg * .62, .12, .26, .1); }
          add(hd, G.sph, cl2, 1.0, -.38, 0, .36, .28, .44); add(hd, G.sph, '#222', 1.35, -.18, 0, .13, .11, .15);
          eyes(body, .33, 1.24, 0, .14, .07);
          arms(body, cl1, 0, .64, .46, .13);
          add(body, G.cyl, '#d63b3b', -.42, .72, 0, .18, .55, .18); add(body, G.cyl, '#555', -.42, 1.05, 0, .06, .1, .06);
          const tl = add(body, G.sph, cl1, -.62, .4, 0, .24, .2, .2); add(body, G.sph, cl2, -.82, .52, 0, .15, .13, .13);
          rig.weapon = add(body, G.cyl, '#555566', .5, .66, .3, .07, .6, .07); rig.weapon.rotation.z = Math.PI / 2;
          add(body, G.sph, '#ffb030', .82, .66, .3, .06, .06, .06, { emissive: col('#ff7a10') });
          break;
        }
      }
      rig.head = hd; rig.torso = bd;
      if (id === 'rocco') { g.scale.setScalar(1.22); }
      if (id === 'gizmo') { g.scale.setScalar(.92); }
      return rig;
    }

    const models = [];
    const root2 = new THREE.Group(); dyn.add(root2);
    function makeEntity(info, idx) {
      const d = BR[info.br];
      const rig = buildBrawlerModel(d.id, d.c1, d.c2);
      const piv = new THREE.Group(); piv.add(rig.g);
      const e = new THREE.Group(); e.add(piv);
      const sh = new THREE.Mesh(G.cir, blobMat); sh.scale.set(.62, 1, .62); sh.position.y = .03; sh.renderOrder = 1; e.add(sh);
      const ring = new THREE.Mesh(G.ring, new THREE.MeshBasicMaterial({ color: col('#ffffff'), transparent: true, opacity: .95, depthWrite: false })); ring.scale.setScalar(.62); ring.position.y = .045; ring.renderOrder = 2; e.add(ring);
      const bub = new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({ color: col('#8fe4ff'), transparent: true, opacity: .32, depthWrite: false })); bub.scale.set(.8, .95, .8); bub.position.y = .75; bub.visible = false; e.add(bub);
      const stars = new THREE.Group(); stars.position.y = 1.9; stars.visible = false;
      for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(G.oct, new THREE.MeshBasicMaterial({ color: col('#ffe040') })); s.scale.setScalar(.1); s.userData.k = k; stars.add(s); }
      e.add(stars);
      root2.add(e);
      return { e, piv, rig, sh, ring, bub, stars, idx, info, phase: Math.random() * 6, ang: 0, atk: 0, flash: 0, ko: -1, sp: 1, lastAlive: true, wob: 0, dash: 0, lx: 0, ly: 0 };
    }
    function setRoster(list) {
      for (const m of models) { root2.remove(m.e); m.rig.mats.forEach(x => x.dispose()); m.ring.material.dispose(); m.bub.material.dispose(); }
      models.length = 0;
      list.forEach((info, i) => models.push(makeEntity(info, i)));
    }

    const projPool = {};
    function mkProj(st) {
      const g = new THREE.Group();
      const m = (geo, c, s, em, o) => { const x = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(Object.assign({ color: col(c) }, o || {}))); x.scale.set(s[0], s[1], s[2]); g.add(x); return x; };
      switch (st) {
        case 0: m(G.sph, '#ffd24a', [.15, .15, .15]); m(G.sph, '#fff6c0', [.08, .08, .08]); break;
        case 1: { const b = m(G.cyl, '#ffee80', [.1, 1.0, .1]); b.rotation.z = Math.PI / 2; const c = m(G.cyl, '#ffffff', [.05, 1.1, .05]); c.rotation.z = Math.PI / 2; break; }
        case 2: { const big = m(G.cyl, '#d63b3b', [.13, .45, .13]); big.rotation.z = Math.PI / 2; m(G.sph, '#ffe680', [.08, .08, .08]).position.set(.3, 0, 0); g.userData.big = big; break; }
        case 3: { const t = m(G.tor, '#ff7ad5', [.5, .5, .2], 0, { transparent: true, opacity: .85 }); t.rotation.y = Math.PI / 2; t.scale.set(.18, .6, .6); m(G.sph, '#ffd0f0', [.13, .13, .13]); break; }
        case 4: m(G.sph, '#33d6e8', [.2, .2, .2]); m(G.sph, '#d0ffff', [.1, .1, .1]); break;
        case 5: { const b = m(G.cyl, '#ffcc40', [.07, .4, .07]); b.rotation.z = Math.PI / 2; break; }
        case 6: break;
        case 7: m(G.sph, '#7ad0ff', [.17, .17, .17]); m(G.sph, '#ffffff', [.09, .09, .09]); break;
        case 8: m(G.sph, '#ff8a20', [.3, .3, .3], 0, { transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false }); m(G.sph, '#ffe070', [.16, .16, .16], 0, { transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }); break;
        case 9: m(G.sph, '#9dff6a', [.17, .17, .17]); m(G.sph, '#ffffff', [.08, .08, .08]); break;
        case 10: { m(G.sph, '#25252f', [.28, .28, .28]); const l = m(G.sph, '#ff3030', [.07, .07, .07]); l.position.set(0, .3, 0); g.userData.led = l; break; }
        case 11: { const b = m(G.cyl, '#7a4a28', [.12, .3, .12]); m(G.cyl, '#c9a060', [.06, .12, .06]).position.y = .2; break; }
      }
      g.visible = false; dyn.add(g);
      return g;
    }
    function getProj(st) {
      const P = projPool[st] || (projPool[st] = { list: [], used: 0 });
      if (P.used >= P.list.length) P.list.push(mkProj(st));
      const m = P.list[P.used++]; m.visible = true; return m;
    }

    const zoneMeshes = [], turMeshes = [];
    function getZone(i) {
      if (!zoneMeshes[i]) {
        const g = new THREE.Group();
        const d = new THREE.Mesh(G.cir, new THREE.MeshBasicMaterial({ map: glowTex, color: col('#ff7a18'), transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending })); d.position.y = .05; g.add(d);
        const d2 = new THREE.Mesh(G.cir, new THREE.MeshBasicMaterial({ color: col('#301005'), transparent: true, opacity: .45, depthWrite: false })); d2.position.y = .04; g.add(d2);
        dyn.add(g); zoneMeshes[i] = { g, d, d2 };
      }
      return zoneMeshes[i];
    }
    function getTur(i) {
      if (!turMeshes[i]) {
        const g = new THREE.Group();
        const mt = n => new THREE.MeshLambertMaterial({ color: col(n) });
        const b = new THREE.Mesh(G.cyl, mt('#4a5260')); b.scale.set(.42, .3, .42); b.position.y = .15; g.add(b);
        const hd = new THREE.Group(); hd.position.y = .55; g.add(hd);
        const s = new THREE.Mesh(G.sph, mt('#37c7b5')); s.scale.set(.32, .28, .32); hd.add(s);
        const br = new THREE.Mesh(G.cyl, mt('#2a2a34')); br.scale.set(.07, .6, .07); br.rotation.z = Math.PI / 2; br.position.x = .4; hd.add(br);
        const ring = new THREE.Mesh(G.ring, new THREE.MeshBasicMaterial({ color: col('#fff'), transparent: true, opacity: .9, depthWrite: false })); ring.scale.setScalar(.55); ring.position.y = .05; g.add(ring);
        dyn.add(g); turMeshes[i] = { g, hd, ring };
      }
      return turMeshes[i];
    }

    const gemI = new THREE.InstancedMesh(G.oct, new THREE.MeshLambertMaterial({ color: col('#c27bff'), emissive: col('#7a30d0'), flatShading: true }), 48);
    const cubeI = new THREE.InstancedMesh(G.box, new THREE.MeshLambertMaterial({ color: col('#b46bff'), emissive: col('#6a20c0') }), 48);
    gemI.frustumCulled = false; cubeI.frustumCulled = false; gemI.count = 0; cubeI.count = 0; dyn.add(gemI, cubeI);
    const itemSh = new THREE.InstancedMesh(G.cir, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }), 96); itemSh.frustumCulled = false; dyn.add(itemSh);
    const ballM = new THREE.Group();
    {
      const bt = ctex(128, 64, (x, W, H) => { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#222'; for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { x.beginPath(); const cx = k * 32 + 16 + (r ? 16 : 0), cy = 16 + r * 32; for (let q = 0; q < 5; q++) { const a = q / 5 * TAU - Math.PI / 2; x.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); } x.fill(); } }, true);
      const b = new THREE.Mesh(new THREE.SphereGeometry(.36, 18, 12), new THREE.MeshLambertMaterial({ map: bt })); bin.push(b.geometry, b.material); b.castShadow = false; ballM.add(b); ballM.userData.b = b;
      const s = new THREE.Mesh(G.cir, blobMat); s.scale.setScalar(.45); s.position.y = .03; ballM.add(s); ballM.userData.s = s;
    }
    ballM.visible = false; dyn.add(ballM);

    const poisonRing = new THREE.Mesh(new THREE.RingGeometry(1, 80, 64, 1), new THREE.MeshBasicMaterial({ color: col('#58ff2a'), transparent: true, opacity: .34, depthWrite: false, side: THREE.DoubleSide }));
    poisonRing.rotation.x = -Math.PI / 2; poisonRing.position.y = 1.15; poisonRing.visible = false; poisonRing.renderOrder = 5; dyn.add(poisonRing);
    const poisonEdge = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 96, 1), new THREE.MeshBasicMaterial({ color: col('#b8ff5a'), transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide }));
    poisonEdge.rotation.x = -Math.PI / 2; poisonEdge.position.y = .08; poisonEdge.visible = false; dyn.add(poisonEdge);
    bin.push(poisonRing.geometry, poisonRing.material, poisonEdge.geometry, poisonEdge.material);

    const aimG = new THREE.Group(); dyn.add(aimG); aimG.visible = false;
    const aimMats = { line: new THREE.MeshBasicMaterial({ color: col('#ffffff'), transparent: true, opacity: .32, depthWrite: false, side: THREE.DoubleSide }), fan: new THREE.MeshBasicMaterial({ color: col('#ffffff'), transparent: true, opacity: .26, depthWrite: false, side: THREE.DoubleSide }), sup: new THREE.MeshBasicMaterial({ color: col('#ffd23a'), transparent: true, opacity: .38, depthWrite: false, side: THREE.DoubleSide }) };
    Object.values(aimMats).forEach(m => bin.push(m));
    const aimCache = {};
    function aimShape(br, sup) {
      const k = br + (sup ? 's' : 'm');
      if (aimCache[k]) return aimCache[k];
      const a = BR[br][sup ? 'sup' : 'atk'], grp = new THREE.Group(), mat = sup ? aimMats.sup : aimMats.line;
      let info = { kind: 'line', range: 6 };
      const lineM = (len, wd) => { const m = new THREE.Mesh(G.plane, mat); m.scale.set(len, 1, wd); m.position.set(len / 2, .06, 0); m.renderOrder = 3; grp.add(m); return m; };
      switch (a.k) {
        case 'fan': { const sp = a.sp * DEG, s = new THREE.Shape(); s.moveTo(0, 0); for (let q = 0; q <= 16; q++) { const an = -sp / 2 + sp * q / 16; s.lineTo(Math.cos(an) * a.range, Math.sin(an) * a.range); } const gm = new THREE.ShapeGeometry(s); gm.rotateX(-Math.PI / 2); gm.scale(1, 1, -1); const m = new THREE.Mesh(gm, sup ? aimMats.sup : aimMats.fan); m.position.y = .06; m.renderOrder = 3; grp.add(m); info.range = a.range; break; }
        case 'bolt': case 'wave': case 'bounce': case 'burst': case 'spark': case 'flame': case 'punch': lineM(a.range, Math.max(.45, a.r * 2)); info.range = a.range; break;
        case 'slash': lineM(a.dist, 1.2); info.range = a.dist; break;
        case 'lob': case 'puddle': case 'leap': { lineM(a.range, .12); info = { kind: 'lob', range: a.range, rad: a.rad }; break; }
        case 'hop': { const m = new THREE.Mesh(G.plane, mat); m.scale.set(a.back, 1, .5); m.position.set(-a.back / 2, .06, 0); grp.add(m); info.range = a.back; break; }
        case 'aoeheal': { const m = new THREE.Mesh(G.cir, mat); m.scale.setScalar(a.rad); m.position.y = .06; grp.add(m); info = { kind: 'self', range: 0 }; break; }
        case 'turret': { lineM(a.range, .12); info = { kind: 'lob', range: a.range, rad: 1 }; break; }
      }
      if (info.kind === 'lob') { const t = new THREE.Mesh(G.cir, mat); t.scale.setScalar(info.rad); t.position.y = .06; t.name = 'tgt'; grp.add(t); }
      grp.visible = false; aimG.add(grp);
      return aimCache[k] = { grp, info };
    }

    let shakeA = 0, camX = 0, camZ = 0, camInit = false, visW = 20;
    const vec = new THREE.Vector3(), ray = new THREE.Raycaster(), gplane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hudC = document.createElement('canvas'); hudC.className = 'bs-hud';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    hudC.width = Math.round(w * dpr); hudC.height = Math.round(h * dpr);
    const hx = hudC.getContext('2d');
    const floats = [];

    function project(x, y, z) { vec.set(x, z || 0, y).project(cam); return [(vec.x * .5 + .5) * w, (-vec.y * .5 + .5) * h, vec.z]; }
    function ground(cx, cy) {
      const r = canvas.getBoundingClientRect();
      const nx = ((cx - r.left) / r.width) * 2 - 1, ny = -((cy - r.top) / r.height) * 2 + 1;
      ray.setFromCamera({ x: nx, y: ny }, cam);
      const o = ray.ray.origin, d = ray.ray.direction;
      if (Math.abs(d.y) < 1e-4) return null;
      const t = -o.y / d.y;
      return { x: o.x + d.x * t, y: o.z + d.z * t };
    }

    function fx(ev, view) {
      const k = ev[0];
      switch (k) {
        case 'd': {
          const t = view.brs[ev[1]]; if (!t) break;
          const m = models[ev[1]]; if (m) m.flash = 1;
          const mine = ev[5] === view.me, victimMe = ev[1] === view.me, poison = ev[6];
          floats.push({ x: ev[3], y: ev[4], z: 1.7, t: 0, txt: String(ev[2]), c: poison ? '#9dff4a' : victimMe ? '#ff5a5a' : mine ? '#ffe040' : '#ffffff', s: mine ? 1.25 : 1, vx: (Math.random() - .5) * .6 });
          burst(ev[3], .8, ev[4], poison ? 3 : 5, poison ? '#7bff2a' : '#fff1a0', 2.6, .16, .35, { up: 1 });
          break;
        }
        case 'h': floats.push({ x: ev[3], y: ev[4], z: 1.7, t: 0, txt: '+' + ev[2], c: '#6dff7a', s: 1.1, vx: 0 }); burst(ev[3], .8, ev[4], 6, '#6dff7a', 1.4, .15, .6, { up: 1, grav: -1 }); break;
        case 'dt': floats.push({ x: ev[3], y: ev[4], z: 1.2, t: 0, txt: String(ev[2]), c: '#fff', s: .9, vx: 0 }); break;
        case 'hi': { const c = ev[4] ? '#7dff9a' : ev[3] === 8 ? '#ff9a30' : ev[3] === 7 ? '#7ad0ff' : ev[3] === 3 ? '#ff9ae0' : '#ffe680'; burst(ev[1], .8, ev[2], 7, c, 4, .2, .3, { up: 1 }); break; }
        case 'hw': burst(ev[1], .7, ev[2], 5, '#d8d0c0', 2.5, .22, .35, { up: 1 }); break;
        case 'bn': burst(ev[1], .7, ev[2], 6, '#7affff', 3, .16, .25); break;
        case 'bb': burst(ev[1], .4, ev[2], 3, '#ffffff', 2, .12, .2); break;
        case 'x': {
          const x = ev[1], y = ev[2], r = ev[3], st = ev[4], big = ev[5];
          if (st === 20) { burst(x, .3, y, 40, '#6dff7a', r * 1.8, .22, .9, { vy: 1.5, grav: -1, drag: .95 }); ringFx(x, y, r, '#6dff7a'); }
          else if (st === 21) { burst(x, .3, y, 14, '#37c7b5', 3, .2, .6, { up: 1 }); }
          else if (st === 22) { burst(x, .5, y, 22, '#ffb030', 5, .3, .7, { up: 1 }); burst(x, .5, y, 12, '#555', 3, .4, 1, { up: 1 }); shake(.15); }
          else if (st === 23) { ringFx(x, y, r, '#ffe680'); burst(x, .2, y, 26, '#d8c8a0', r * 2.4, .4, .6, { up: 1, grav: 3 }); shake(.35); }
          else {
            const c1 = st === 10 || st === 2 || st === 11 ? '#ffb030' : '#ffe680';
            burst(x, .5, y, 24 + (big ? 24 : 0), c1, r * 3.2, .38, .5, { up: 1 });
            burst(x, .5, y, 14, '#ff6a20', r * 2.2, .5, .6, { up: 1, grav: 0, grow: 1.5 });
            burst(x, .4, y, 12, '#444', r * 1.4, .5, .9, { up: 1, grav: -.5, drag: .94, a: .55 });
            ringFx(x, y, r, '#ffb030'); shake(big ? .5 : .22);
          }
          break;
        }
        case 'w': {
          const k2 = ev[1], i = k2 % M.W, j = k2 / M.W | 0;
          const c = ev[2] === 6 ? '#b46bff' : TH.crate;
          burst(i + .5, .5, j + .5, 22, c, 4, .3, .7, { up: 1 }); burst(i + .5, .4, j + .5, 8, '#d8d0c0', 1.6, .5, .8, { up: 1, grav: -.3, drag: .94, a: .5 });
          removeTile(k2, ev[2]);
          if (ev[2] === 6) burst(i + .5, .7, j + .5, 14, '#ffe27a', 3, .16, .6, { up: 1 });
          break;
        }
        case 'tw': { const k2 = ev[1]; const i = k2 % M.W, j = k2 / M.W | 0; burst(i + .5, .6, j + .5, 4, M.t[k2] === 6 ? '#c9a0ff' : TH.crate, 2.4, .18, .4, { up: 1 }); break; }
        case 'p': {
          const m = models[ev[1]];
          burst(ev[3], .5, ev[4], 10, ev[2] ? '#d38aff' : '#c06bff', 2.5, .16, .5, { up: 1 });
          break;
        }
        case 'k': {
          const m = models[ev[1]];
          const x = ev[3], y = ev[4];
          burst(x, .9, y, 36, '#ffe040', 6, .28, .8, { up: 1 }); burst(x, .9, y, 16, '#ffffff', 3, .4, 1, { up: 1, grav: -1, drag: .94, a: .8 });
          ringFx(x, y, 1.4, '#ffe040'); shake(ev[1] === view.me ? .5 : .25);
          if (m) { m.ko = 0; }
          floats.push({ x, y, z: 2.2, t: 0, txt: 'KO!', c: '#ff5050', s: 1.7, vx: 0 });
          break;
        }
        case 'rs': { const m = models[ev[1]]; if (m) { m.sp = 0; m.ko = -1; } const b = view.brs[ev[1]]; if (b) { burst(b.x, .5, b.y, 18, '#9fe8ff', 3, .24, .6, { up: 1 }); ringFx(b.x, b.y, 1, '#9fe8ff'); } break; }
        case 'f': {
          const m = models[ev[1]]; if (!m) break;
          m.atk = 1; m.face = ev[2];
          const b = view.brs[ev[1]];
          if (b && b.vis) {
            const st = ev[3] === 1 ? BR[b.br].sup.st : BR[b.br].atk.st;
            burst(b.x + Math.cos(ev[2]) * .7, .75, b.y + Math.sin(ev[2]) * .7, 6, '#fff2b0', 3, .2, .15);
          }
          break;
        }
        case 'ch': lightning(ev[1], ev[2], ev[3], ev[4]); break;
        case 'goal': { const c = ev[1] === view.myTeam ? COLS[0] : COLS[1]; for (let q = 0; q < 8; q++) setTimeout(() => confetti(ev[2] + (Math.random() - .5) * 6, ev[3] + (Math.random() - .5) * 6, c), q * 90); shake(.6); break; }
        case 'sr': { const b = view.brs[ev[1]]; if (b && b.vis) { burst(b.x, 1, b.y, 12, '#ffe040', 3, .2, .5, { up: 1, grav: -1 }); } break; }
        case 'bp': break;
        case 'tf': { const t = turMeshes; break; }
        case 'end': break;
      }
    }
    function ringFx(x, y, r, hex) {
      const n = Math.max(10, Math.round(r * 14));
      for (let k = 0; k < n; k++) { const a = k / n * TAU; emit(x + Math.cos(a) * r * .15, .12, y + Math.sin(a) * r * .15, Math.cos(a) * r * 3.2, 0, Math.sin(a) * r * 3.2, .22, .35, rgb(hex), .9, 0, .86, 0); }
    }
    function confetti(x, y, hex) {
      for (let k = 0; k < 24; k++) emit(x, 3, y, (Math.random() - .5) * 6, 2 + Math.random() * 4, (Math.random() - .5) * 6, .2, 1.6, rgb(['#ffe040', '#ff5a5a', '#5ab4ff', '#6dff7a', hex][k % 5]), 1, 0, .98, 6);
    }
    function lightning(x0, y0, x1, y1) {
      const n = 12;
      for (let k = 0; k <= n; k++) { const f = k / n; emit(lerp(x0, x1, f) + (Math.random() - .5) * .3, .8 + (Math.random() - .5) * .3, lerp(y0, y1, f) + (Math.random() - .5) * .3, 0, 0, 0, .22, .28, rgb('#9ae4ff'), 1, 0, 1, 0); }
    }
    function shake(a) { shakeA = Math.max(shakeA, a); }

    function setAim(info) {
      aimG.visible = !!info;
      for (const k in aimCache) aimCache[k].grp.visible = false;
      if (!info) return;
      const sh = aimShape(info.br, info.sup);
      sh.grp.visible = true;
      aimG.position.set(info.x, 0, info.y); aimG.rotation.y = -info.ang;
      aimMats.line.opacity = info.hold ? .6 : .38; aimMats.fan.opacity = info.hold ? .5 : .3; aimMats.sup.opacity = info.hold ? .65 : .45;
      const t = sh.grp.getObjectByName('tgt');
      if (t) { const d = clamp(info.dist, 1.6, sh.info.range); t.position.x = d; const l = sh.grp.children[0]; if (l && l.geometry === G.plane) { l.scale.x = d; l.position.x = d / 2; } }
    }

    const tmpV = new THREE.Vector3();
    function frame(view, dt, camT) {
      const t = performance.now() / 1000;
      aimG.visible = aimG.visible && true;
      for (const k in projPool) projPool[k].used = 0;
      let ig = 0, ic = 0;
      for (const m of models) { }
      for (let i = 0; i < models.length; i++) {
        const m = models[i], b = view.brs[i];
        if (!b) { m.e.visible = false; continue; }
        const vis = b.vis && (b.alive || m.ko >= 0 && m.ko < 1.1);
        m.e.visible = !!vis;
        if (!vis) { m.lastAlive = b.alive; continue; }
        const sp = hyp(b.x - m.lx, b.y - m.ly) / Math.max(dt, .001); m.lx = b.x; m.ly = b.y;
        m.sp = Math.min(1, m.sp + dt * 4);
        let y0 = 0, sc = 1, spin = 0;
        const jf = b.jmp;
        if (jf > 0) y0 = Math.sin(jf * Math.PI) * (b.kind === 'hop' ? 1.2 : 2.6);
        if (b.alive) {
          if (m.ko >= 0) m.ko = -1;
          const tgt = b.face;
          if (m.ang === undefined || m.fresh !== true) { m.ang = tgt; m.fresh = true; }
          m.ang += angDiff(m.ang, tgt) * Math.min(1, dt * 14);
          m.phase += (b.mv ? Math.min(sp, 6) : 0) * dt * 3.2;
          const moving = b.mv && sp > .3;
          const sw = moving ? Math.sin(m.phase * 2) : 0;
          m.rig.legs[0].position.x = sw * .14; m.rig.legs[1].position.x = -sw * .14;
          m.rig.legs[0].position.y = .12 + (moving ? Math.max(0, sw) * .07 : 0); m.rig.legs[1].position.y = .12 + (moving ? Math.max(0, -sw) * .07 : 0);
          if (m.rig.armL) { m.rig.armL.position.x = -sw * .12; m.rig.armR.position.x = sw * .12; }
          const bob = moving ? Math.abs(Math.sin(m.phase * 2)) * .06 : Math.sin(t * 2.2 + m.idx) * .015;
          m.atk = Math.max(0, m.atk - dt * 4.5);
          const sq = 1 - m.atk * .09;
          m.rig.body.position.y = bob + y0; m.rig.body.scale.set(1 + m.atk * .08, sq, 1 + m.atk * .05);
          m.rig.body.rotation.z = moving ? -.08 : 0; m.rig.body.rotation.x = Math.sin(m.phase) * .02;
          if (m.rig.weapon && m.atk > 0) m.rig.weapon.position.x += 0;
          if (m.sp < 1) sc = Math.min(1.12, m.sp * 1.2);
          m.piv.rotation.y = -m.ang;
          m.piv.scale.setScalar(sc);
          m.dashT = b.dash ? 1 : 0;
          if (b.dash) m.rig.body.rotation.z = -.5;
        } else {
          m.ko += dt;
          const f = m.ko;
          m.rig.body.position.y = f * 3.4 - f * f * 3.6 + .2; m.piv.rotation.y -= dt * 14; m.piv.rotation.z = f * 3;
          m.piv.scale.setScalar(Math.max(0, 1 - f * .7));
          if (f > 1.05) m.e.visible = false;
        }
        m.flash = Math.max(0, m.flash - dt * 5);
        const fl = m.flash;
        for (const mt of m.rig.mats) { if (mt.emissive) { mt.emissive.setRGB(fl * .8, fl * .8, fl * .8); if (mt.userData.em && fl === 0) mt.emissive.copy(mt.userData.em); else if (mt.userData.em) mt.emissive.add(mt.userData.em); } }
        const op = b.vis && b.bush && b.team === view.myTeam ? .55 : 1;
        for (const mt of m.rig.mats) { const tr = op < 1; if (mt.transparent !== tr) mt.transparent = tr; mt.opacity = op; }
        m.sh.material = blobMat;
        m.e.position.set(b.x, 0, b.y);
        m.sh.position.y = .03 - y0 * 0; m.sh.scale.setScalar(.62 * (1 - Math.min(.5, y0 * .18)));
        const tc = b.team === view.myTeam ? (b.i === view.me ? '#5bff6a' : COLS[0]) : (view.mode === 'show' ? '#ff4a52' : COLS[1]);
        m.ring.material.color.copy(col(b.i === view.me ? '#5bff6a' : view.mode === 'show' ? '#ff4a52' : (b.team === view.myTeam ? '#3fa9ff' : '#ff4a52')));
        m.ring.visible = b.alive;
        m.bub.visible = b.shield > 0 && b.alive; if (m.bub.visible) { m.bub.material.opacity = .22 + Math.sin(t * 8) * .08; m.bub.position.y = .75; }
        m.stars.visible = b.stun > 0 && b.alive;
        if (m.stars.visible) m.stars.children.forEach((s, k) => { const a = t * 5 + k * TAU / 3; s.position.set(Math.cos(a) * .35, Math.sin(t * 6 + k) * .05, Math.sin(a) * .35); s.rotation.y = t * 4; });
        if (b.alive && b.vis && Math.random() < dt * 1.0 && b.supR) emit(b.x + (Math.random() - .5) * .6, 1.5, b.y + (Math.random() - .5) * .6, 0, 1, 0, .12, .6, rgb('#ffe040'), 1, 0, 1, -1);
        if (b.alive && b.vis && sp > 2.5 && b.mv && !jf && Math.random() < dt * 10) emit(b.x - Math.cos(b.face) * .3, .08, b.y - Math.sin(b.face) * .3, 0, .3, 0, .22, .4, rgb(TH.g1), .35, .6, 1, 0);
      }
      const ballV = view.ball;
      if (ballV) {
        ballM.visible = true;
        const carried = ballV.car >= 0;
        const cb = carried ? view.brs[ballV.car] : null;
        ballM.position.set(ballV.x, .36 + (carried ? .12 + Math.abs(Math.sin(t * 8)) * .04 : 0), ballV.y);
        const bm = ballM.userData.b; bm.rotation.z -= (ballV.vx || 0) * dt * 1.2; bm.rotation.x += (ballV.vy || 0) * dt * 1.2;
        ballM.userData.s.position.y = -.33; ballM.userData.s.scale.setScalar(.45);
        ballM.visible = !(cb && !cb.vis);
      } else ballM.visible = false;
      for (const it of view.items) {
        const bob = .5 + Math.sin(t * 3 + it.id) * .07 + Math.max(0, .5 - it.age) * 1.2 * Math.sin(Math.min(1, it.age * 2) * Math.PI);
        dummy.position.set(it.x, bob, it.y); dummy.rotation.set(0, t * 2 + it.id, it.k ? .3 : 0); dummy.scale.setScalar(it.k ? .3 : .26); if (!it.k) dummy.scale.set(.2, .3, .2); dummy.updateMatrix();
        if (it.k) cubeI.setMatrixAt(ic++, dummy.matrix); else gemI.setMatrixAt(ig++, dummy.matrix);
        dummy.position.set(it.x, .03, it.y); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(.34); dummy.updateMatrix(); itemSh.setMatrixAt(ig + ic - 1, dummy.matrix);
        if (Math.random() < dt * 1.5) emit(it.x + (Math.random() - .5) * .5, bob + .2, it.y + (Math.random() - .5) * .5, 0, .6, 0, .1, .6, rgb(it.k ? '#e0b0ff' : '#f0d0ff'), 1, 0, 1, -.5);
      }
      gemI.count = ig; cubeI.count = ic; itemSh.count = ig + ic; gemI.instanceMatrix.needsUpdate = true; cubeI.instanceMatrix.needsUpdate = true; itemSh.instanceMatrix.needsUpdate = true;
      for (const p of view.proj) {
        if (p.st === 6) { continue; }
        const m = getProj(p.st);
        let z = .8;
        if (p.lob) { z = .6 + Math.sin(p.f * Math.PI) * (p.big ? 3.2 : 2.4); if (p.vx === 0 && p.vy === 0) z = .35; }
        m.position.set(p.x, z, p.y);
        m.rotation.set(0, -(p.a != null ? p.a : Math.atan2(p.vy, p.vx)), 0);
        if (p.st === 2) { m.rotation.set(t * 12, 0, 0); if (p.big) m.scale.setScalar(2.2); else m.scale.setScalar(1); }
        if (p.st === 10) { const bl = Math.sin(t * (10 + (p.f || 0) * 20)) > 0; m.userData.led.visible = bl; m.position.y = .3; m.scale.setScalar(1); }
        if (p.st === 8) { const g = 1 + p.life * 2.5; m.scale.setScalar(g); }
        if (p.st === 3) { m.scale.setScalar(1 + Math.sin(t * 20) * .06); }
        if (p.st === 11) { m.rotation.set(t * 10, t * 7, 0); }
        const TR = { 0: ['#ffd24a', .12, .2], 1: ['#fff6c0', .16, .3], 4: ['#33d6e8', .16, .3], 5: ['#ffcc40', .1, .2], 7: ['#7ad0ff', .14, .3], 9: ['#9dff6a', .12, .25], 3: ['#ff7ad5', .12, .5], 8: ['#ffa030', .3, .35], 2: ['#ffb030', .12, .3], 11: ['#ffb030', .1, .3] }[p.st];
        if (TR && Math.random() < dt * 60) emit(p.x, z, p.y, 0, 0, 0, TR[1] * (p.st === 8 ? 1.5 : 1), TR[2], rgb(TR[0]), p.st === 8 ? .6 : .8, p.st === 8 ? 1.5 : 0, .9, p.st === 8 ? -1 : 0);
      }
      for (const k in projPool) { const P = projPool[k]; for (let i = P.used; i < P.list.length; i++) P.list[i].visible = false; }
      view.zones.forEach((z, i) => {
        const o = getZone(i); o.g.visible = true; o.g.position.set(z.x, 0, z.y);
        const pul = 1 + Math.sin(t * 6 + i) * .04; o.d.scale.set(z.r * pul, 1, z.r * pul); o.d2.scale.set(z.r * .96, 1, z.r * .96);
        if (Math.random() < dt * 40) { const a = Math.random() * TAU, rr2 = Math.sqrt(Math.random()) * z.r; emit(z.x + Math.cos(a) * rr2, .2, z.y + Math.sin(a) * rr2, 0, 1.4, 0, .5, .55, rgb(Math.random() < .5 ? '#ff7a18' : '#ffc040'), .8, 1.2, .95, -.5); }
      });
      for (let i = view.zones.length; i < zoneMeshes.length; i++) zoneMeshes[i].g.visible = false;
      view.turrets.forEach((tu, i) => {
        const o = getTur(i); o.g.visible = true; o.g.position.set(tu.x, 0, tu.y); o.hd.rotation.y = -tu.ang;
        o.ring.material.color.copy(col(tu.team === view.myTeam ? '#3fa9ff' : '#ff4a52'));
      });
      for (let i = view.turrets.length; i < turMeshes.length; i++) turMeshes[i].g.visible = false;
      if (view.poison) {
        const P = view.poison;
        poisonRing.visible = poisonEdge.visible = true;
        poisonRing.position.set(P.cx, 1.15, P.cy); poisonRing.scale.set(Math.max(.2, P.r), Math.max(.2, P.r), 1);
        poisonEdge.position.set(P.cx, .08, P.cy); poisonEdge.scale.set(Math.max(.2, P.r), Math.max(.2, P.r), 1);
        poisonRing.material.opacity = .3 + Math.sin(t * 2) * .04;
        if (P.r < 80 && Math.random() < dt * 90) {
          const a = Math.random() * TAU; emit(P.cx + Math.cos(a) * (P.r + Math.random() * 1.5), .5 + Math.random() * .8, P.cy + Math.sin(a) * (P.r + Math.random() * 1.5), 0, .4, 0, 1.2 + Math.random(), 1.2, rgb('#7bff2a'), .5, .6, .97, 0);
        }
        if (view.me >= 0 && view.brs[view.me]) {
          const mb = view.brs[view.me];
          for (let q = 0; q < 2; q++) if (Math.random() < dt * 60) {
            const a = Math.atan2(mb.y - P.cy, mb.x - P.cx) + (Math.random() - .5) * 1.2, rr2 = P.r + (Math.random() - .3) * 3;
            emit(P.cx + Math.cos(a) * rr2, .5 + Math.random() * .8, P.cy + Math.sin(a) * rr2, 0, .4, 0, 1.4 + Math.random(), 1.3, rgb('#7bff2a'), .55, .6, .97, 0);
          }
        }
      } else poisonRing.visible = poisonEdge.visible = false;
      waterTex.offset.x = (t * .03) % 1; waterTex.offset.y = (t * .015) % 1;
      if (bushI && view.bushJit) { }
      updParticles(dt);

      shakeA = Math.max(0, shakeA - dt * 2.2);
      const tx = camT.x, tz = camT.y;
      if (!camInit) { camX = tx; camZ = tz; camInit = true; }
      const kk = 1 - Math.exp(-dt * (camT.snap ? 100 : 7));
      camX += (tx - camX) * kk; camZ += (tz - camZ) * kk;
      visW = camT.visW || 20;
      const asp = cam.aspect, hf = 2 * Math.atan(Math.tan(15 * DEG) * asp), dist = visW / 2 / Math.tan(hf / 2);
      const pitch = 61 * DEG;
      const visH = visW / asp / Math.sin(pitch);
      let cx = camX, cz = camZ;
      if (M) {
        const mx = 2.5, minX = visW / 2 - mx, maxX = M.W - visW / 2 + mx, minZ = visH / 2 - mx - 1, maxZ = M.H - visH / 2 + mx + 1.5;
        cx = minX < maxX ? clamp(cx, minX, maxX) : M.W / 2; cz = minZ < maxZ ? clamp(cz, minZ, maxZ) : M.H / 2;
      }
      const sx = shakeA > 0 ? (Math.random() - .5) * shakeA * .7 : 0, sz = shakeA > 0 ? (Math.random() - .5) * shakeA * .7 : 0;
      cam.position.set(cx + sx, Math.sin(pitch) * dist, cz + Math.cos(pitch) * dist + sz);
      cam.lookAt(cx + sx, 0, cz + sz);
      cam.updateMatrixWorld();
      pm.uniforms.uScale.value = h * .5 / Math.tan(15 * DEG) * (renderer.getPixelRatio ? renderer.getPixelRatio() : 1) * .5;
      renderer.render(scene, cam);
      drawHud(view, dt, t);
    }

    function rr(x, y, wd, ht, r) { hx.beginPath(); hx.moveTo(x + r, y); hx.arcTo(x + wd, y, x + wd, y + ht, r); hx.arcTo(x + wd, y + ht, x, y + ht, r); hx.arcTo(x, y + ht, x, y, r); hx.arcTo(x, y, x + wd, y, r); hx.closePath(); }
    function drawHud(view, dt, t) {
      hx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hx.clearRect(0, 0, w, h);
      const u = w / 960;
      hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.lineJoin = 'round';
      const order = view.brs.map((b, i) => i).filter(i => view.brs[i].vis && (view.brs[i].alive)).sort((a, b) => view.brs[a].y - view.brs[b].y);
      for (const i of order) {
        const b = view.brs[i], jf = b.jmp > 0 ? Math.sin(b.jmp * Math.PI) * 2 : 0;
        const [px, py] = project(b.x, b.y, 2.05 + jf);
        const me = i === view.me, ally = b.team === view.myTeam;
        const bw = (me ? 78 : 64) * u, bh = (me ? 14 : 10) * u;
        const x0 = px - bw / 2, y0 = py - bh / 2;
        hx.fillStyle = 'rgba(0,0,0,.55)'; rr(x0 - 2 * u, y0 - 2 * u, bw + 4 * u, bh + 4 * u, 5 * u); hx.fill();
        const f = clamp(b.hp / b.mhp, 0, 1);
        const c = me ? '#4cf05a' : ally ? '#3fa9ff' : '#ff4a52';
        hx.fillStyle = '#222'; rr(x0, y0, bw, bh, 4 * u); hx.fill();
        if (f > 0) { hx.fillStyle = c; rr(x0, y0, Math.max(bh * .6, bw * f), bh, 4 * u); hx.fill(); hx.fillStyle = 'rgba(255,255,255,.28)'; rr(x0 + 1, y0 + 1, Math.max(bh * .6, bw * f) - 2, bh * .38, 3 * u); hx.fill(); }
        if (me || view.mode === 'show') {
          hx.font = `900 ${(me ? 12 : 9) * u}px system-ui,sans-serif`; hx.lineWidth = 3 * u; hx.strokeStyle = '#111'; hx.fillStyle = '#fff';
          hx.strokeText(String(Math.ceil(b.hp)), px, py + .5 * u); hx.fillText(String(Math.ceil(b.hp)), px, py + .5 * u);
        }
        hx.font = `900 ${11 * u}px system-ui,sans-serif`; hx.lineWidth = 3.5 * u; hx.strokeStyle = '#111'; hx.fillStyle = me ? '#b6ffbc' : ally ? '#a8d8ff' : '#ffb0b0';
        if (!me || true) { hx.strokeText(b.name, px, y0 - 9 * u); hx.fillText(b.name, px, y0 - 9 * u); }
        let bx = x0 - 12 * u;
        if (b.gems > 0) { hx.fillStyle = '#c27bff'; hx.beginPath(); hx.moveTo(bx, py - 7 * u); hx.lineTo(bx + 6 * u, py); hx.lineTo(bx, py + 7 * u); hx.lineTo(bx - 6 * u, py); hx.closePath(); hx.fill(); hx.strokeStyle = '#fff'; hx.lineWidth = 1.4 * u; hx.stroke(); hx.font = `900 ${10 * u}px system-ui`; hx.fillStyle = '#fff'; hx.strokeStyle = '#111'; hx.lineWidth = 3 * u; hx.strokeText(b.gems, bx - 14 * u, py + 1); hx.fillText(b.gems, bx - 14 * u, py + 1); }
        if (b.cubes > 0) { hx.fillStyle = '#9a4aff'; hx.fillRect(x0 + bw + 4 * u, py - 6 * u, 12 * u, 12 * u); hx.strokeStyle = '#ffe27a'; hx.lineWidth = 1.6 * u; hx.strokeRect(x0 + bw + 4 * u, py - 6 * u, 12 * u, 12 * u); hx.font = `900 ${10 * u}px system-ui`; hx.fillStyle = '#fff'; hx.strokeStyle = '#111'; hx.lineWidth = 3 * u; hx.strokeText(b.cubes, x0 + bw + 26 * u, py + 1); hx.fillText(b.cubes, x0 + bw + 26 * u, py + 1); }
        if (b.ball) { hx.font = `${14 * u}px sans-serif`; hx.fillStyle = '#fff'; hx.fillText('⚽', px, y0 - 24 * u); }
        if (me) {
          const [ax, ay] = project(b.x, b.y, -.12);
          const n = b.mam, sw = 22 * u, gap = 3 * u, tot = n * sw + (n - 1) * gap;
          for (let q = 0; q < n; q++) {
            const fill = clamp(b.ammo - q, 0, 1);
            const qx = ax - tot / 2 + q * (sw + gap);
            hx.fillStyle = 'rgba(0,0,0,.6)'; rr(qx - 1.5 * u, ay - 1.5 * u, sw + 3 * u, 9 * u, 3 * u); hx.fill();
            hx.fillStyle = fill >= 1 ? '#ffb02a' : '#7a5a20'; rr(qx, ay, sw * fill, 6 * u, 2 * u); hx.fill();
          }
        }
      }
      for (let i = view.turrets.length - 1; i >= 0; i--) {
        const tu = view.turrets[i], [px, py] = project(tu.x, tu.y, 1.3), bw = 40 * u;
        hx.fillStyle = 'rgba(0,0,0,.55)'; rr(px - bw / 2 - 2, py - 5 * u, bw + 4, 10 * u, 4); hx.fill();
        hx.fillStyle = tu.team === view.myTeam ? '#3fa9ff' : '#ff4a52'; rr(px - bw / 2, py - 3 * u, bw * clamp(tu.hp / tu.mhp, 0, 1), 6 * u, 3); hx.fill();
      }
      if (M && view.mode === 'show') {
        for (const k in tileIdx.b) {
          const kk = +k;
          if (M.t[kk] === 6 && M.hp[kk] < BOX_HP) { const [px, py] = project(kk % M.W + .5, (kk / M.W | 0) + .5, 1.5), bw = 36 * u; hx.fillStyle = 'rgba(0,0,0,.55)'; rr(px - bw / 2 - 2, py - 4 * u, bw + 4, 8 * u, 3); hx.fill(); hx.fillStyle = '#c27bff'; rr(px - bw / 2, py - 2.5 * u, bw * clamp(M.hp[kk] / BOX_HP, 0, 1), 5 * u, 2); hx.fill(); }
        }
      }
      for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i]; f.t += dt;
        if (f.t > 1.1) { floats.splice(i, 1); continue; }
        const k = f.t / 1.1, [px, py] = project(f.x + f.vx * f.t, f.y, f.z + f.t * 1.4 - f.t * f.t * .5);
        const sc = (k < .12 ? .5 + k / .12 * .9 : 1.4 - k * .4) * f.s;
        hx.globalAlpha = k > .65 ? 1 - (k - .65) / .35 : 1;
        hx.font = `900 ${20 * u * sc}px system-ui,sans-serif`; hx.lineWidth = 4.5 * u; hx.strokeStyle = '#1a1030'; hx.fillStyle = f.c;
        hx.strokeText(f.txt, px, py); hx.fillText(f.txt, px, py);
        hx.globalAlpha = 1;
      }
    }

    function portrait(brId, size) {
      const rt = new THREE.WebGLRenderTarget(size * 2, size * 2);
      rt.texture.encoding = THREE.sRGBEncoding;
      const sc = new THREE.Scene(), cm2 = new THREE.PerspectiveCamera(26, 1, .1, 50);
      sc.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, .8)); const dl = new THREE.DirectionalLight(0xfff4e0, .8); dl.position.set(3, 6, 5); sc.add(dl);
      const d = BR[brId], rig = buildBrawlerModel(d.id, d.c1, d.c2);
      rig.g.rotation.y = -Math.PI / 2 + .55; sc.add(rig.g);
      cm2.position.set(0, 1.0, 4.2); cm2.lookAt(0, .78, 0);
      const pr = renderer.getRenderTarget(), oc = renderer.getClearColor(new THREE.Color()), oa = renderer.getClearAlpha();
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(sc, cm2);
      const px = new Uint8Array(size * size * 4 * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, size * 2, size * 2, px);
      renderer.setRenderTarget(pr); renderer.setClearColor(oc, oa);
      const c = document.createElement('canvas'); c.width = c.height = size * 2;
      const cx2 = c.getContext('2d'), id = cx2.createImageData(size * 2, size * 2);
      for (let y = 0; y < size * 2; y++) id.data.set(px.subarray((size * 2 - 1 - y) * size * 8, (size * 2 - y) * size * 8), y * size * 8);
      cx2.putImageData(id, 0, 0);
      rt.dispose(); rig.mats.forEach(m => m.dispose());
      c.style.width = c.style.height = '100%';
      return c;
    }

    function setView(vw, vh) { }
    function dispose() { clearMap(); setRoster([]); bin.forEach(o => { try { o.dispose && o.dispose(); } catch (e) {} }); }
    return { scene, cam, models, buildMapScene, setRoster, frame, fx, project, ground, shake, setAim, portrait, hudC, dispose, burst, emit, ringFx, floats, resetCam() { camInit = false; }, get map() { return M; } };
  }


  function makeAudio(api) {
    let ctx = null, master = null, nbuf = null, last = {}, listener = { x: 0, y: 0 };
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
        nbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = nbuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const tone = (f0, f1, dur, type, vol, delay) => {
      const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    };
    const noise = (dur, f0, f1, vol, delay, q) => {
      const t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = nbuf; fl.type = 'bandpass'; fl.Q.value = q || 1; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
    };
    const S = {
      click() { tone(700, 520, .07, 'square', .08); },
      pew(v) { tone(900, 260, .12, 'square', .09 * v); noise(.08, 3000, 1200, .06 * v); },
      pop(v) { tone(500, 200, .1, 'triangle', .12 * v); noise(.1, 1500, 400, .08 * v); },
      blast(v) { noise(.22, 900, 140, .32 * v, 0, .7); tone(150, 55, .26, 'sawtooth', .16 * v); },
      boom(v) { noise(.5, 700, 70, .55 * v, 0, .6); tone(110, 35, .5, 'sawtooth', .28 * v); },
      zap(v) { tone(1400, 400, .12, 'sawtooth', .1 * v); tone(2200, 700, .09, 'square', .05 * v, .02); },
      whoosh(v) { noise(.18, 500, 2400, .13 * v, 0, 2); },
      flame(v) { noise(.16, 1800, 700, .13 * v, 0, .5); },
      punch(v) { noise(.09, 600, 200, .3 * v); tone(180, 70, .1, 'sine', .3 * v); },
      slash(v) { noise(.1, 4000, 1500, .14 * v, 0, 3); },
      wave(v) { tone(440, 660, .24, 'sine', .14 * v); tone(660, 880, .24, 'sine', .08 * v, .05); },
      hit(v) { tone(260, 110, .08, 'square', .1 * v); noise(.05, 2200, 900, .07 * v); },
      hurt() { tone(330, 150, .14, 'sawtooth', .13); },
      heal() { tone(660, 990, .12, 'sine', .12); tone(990, 1320, .14, 'sine', .08, .08); },
      wall(v) { noise(.18, 800, 200, .22 * v, 0, .8); tone(120, 60, .12, 'triangle', .12 * v); },
      ko(v) { tone(500, 100, .45, 'sawtooth', .14 * v); noise(.3, 1500, 200, .18 * v); },
      pick(v) { tone(880, 1320, .09, 'sine', .12 * v); tone(1320, 1760, .09, 'sine', .08 * v, .06); },
      gem(v) { tone(1046, 1568, .1, 'triangle', .13 * v); },
      sup() { tone(523, 523, .1, 'square', .1); tone(784, 784, .1, 'square', .1, .09); tone(1046, 1046, .16, 'square', .1, .18); },
      super() { noise(.3, 300, 3000, .2, 0, 1.5); tone(220, 880, .3, 'sawtooth', .1); },
      tick() { tone(1100, 1100, .04, 'square', .07); },
      go() { tone(660, 660, .1, 'square', .12); tone(990, 990, .22, 'square', .12, .1); },
      count() { tone(520, 520, .09, 'square', .1); },
      goal() { for (let i = 0; i < 5; i++) tone(520 + i * 130, 520 + i * 130, .16, 'square', .1, i * .1); noise(.9, 3000, 800, .12, 0, .4); },
      whistle() { tone(2600, 2400, .35, 'sine', .12); tone(2650, 2450, .3, 'sine', .08, .05); },
      win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .22, 'square', .1, i * .13)); tone(1046, 1046, .5, 'triangle', .12, .55); },
      lose() { [440, 392, 349, 262].forEach((f, i) => tone(f, f * .97, .28, 'triangle', .12, i * .16)); },
      poison() { tone(120, 90, .3, 'sawtooth', .07); },
      cube() { tone(600, 1200, .14, 'triangle', .14); tone(900, 1800, .14, 'triangle', .09, .08); },
      bounce(v) { tone(700, 1000, .05, 'square', .06 * v); }
    };
    const KIND = { fan: 'blast', bolt: 'pew', bounce: 'pew', wave: 'wave', spark: 'zap', burst: 'pew', punch: 'punch', flame: 'flame', lob: 'whoosh', puddle: 'whoosh', slash: 'slash', hop: 'whoosh', leap: 'whoosh', aoeheal: 'heal', turret: 'pop' };
    return {
      unlock() { const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); },
      setListener(x, y) { listener.x = x; listener.y = y; },
      play(name, x, y, vol) {
        if (api.muted) return;
        const c = ensure(); if (!c || !S[name]) return;
        if (c.state !== 'running') { c.resume().catch(() => {}); return; }
        const now = c.currentTime;
        if (last[name] && now - last[name] < .035) return;
        last[name] = now;
        let v = vol == null ? 1 : vol;
        if (x != null) { const d = Math.hypot(x - listener.x, y - listener.y); v *= clamp(1.2 - d / 18, 0, 1); if (v < .06) return; }
        try { S[name](v); } catch (e) {}
      },
      atk(brId, sup, x, y, mine) {
        const k = BR[brId][sup ? 'sup' : 'atk'].k;
        this.play(sup ? (k === 'fan' || k === 'burst' ? 'blast' : KIND[k] || 'pew') : KIND[k] || 'pew', x, y, mine ? 1 : .8);
        if (sup) this.play('super', x, y, .5);
      },
      close() { if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }


  const OT = '-.12em 0 0 #0c0828,.12em 0 0 #0c0828,0 -.12em 0 #0c0828,0 .12em 0 #0c0828,-.1em -.1em 0 #0c0828,.1em .1em 0 #0c0828,-.1em .1em 0 #0c0828,.1em -.1em 0 #0c0828,0 .22em 0 #0c0828';
  const CSS = `
.gm-brawl-stars{gap:0;--bsf:"Lilita One","Arial Black",Impact,"Segoe UI",system-ui,sans-serif}
.gm-brawl-stars .bs-wrap{--u:1px;position:relative;max-width:100%;overflow:hidden;background:#241a58;border-radius:var(--r,10px);font-family:var(--bsf);font-size:calc(var(--u)*10);color:#fff;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;outline:0}
.gm-brawl-stars .bs-wrap canvas.bs-gl{display:block;width:100%;height:100%}
.gm-brawl-stars .bs-wrap canvas.bs-hud{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.gm-brawl-stars .ot{text-shadow:${OT};letter-spacing:.02em}
.gm-brawl-stars .bs-scr{position:absolute;inset:0;display:flex;flex-direction:column;padding:1.6em 2em 1.6em;box-sizing:border-box;background:linear-gradient(180deg,rgba(26,16,72,.72),rgba(18,10,52,.86));z-index:5}
.gm-brawl-stars .bs-scr.clear{background:linear-gradient(180deg,rgba(26,16,72,.35),rgba(18,10,52,.6))}
.gm-brawl-stars .bs-top{display:flex;align-items:center;justify-content:space-between;gap:1em;flex:none}
.gm-brawl-stars .bs-logo{font-size:4.6em;line-height:1;color:#ffd21f;transform:rotate(-2deg);text-shadow:${OT},0 .34em 0 rgba(0,0,0,.4);white-space:nowrap}
.gm-brawl-stars .bs-logo b{color:#fff;font-weight:400;margin-left:.2em}
.gm-brawl-stars .bs-logo i{font-style:normal;color:#ffd21f;font-size:.8em;vertical-align:.1em;margin:0 .1em}
.gm-brawl-stars .bs-pill{display:flex;align-items:center;gap:.5em;background:rgba(10,6,40,.75);border:.2em solid #0c0828;border-radius:2em;padding:.3em 1em .3em .5em;font-size:2.2em;line-height:1}
.gm-brawl-stars .bs-pill svg{width:1.2em;height:1.2em}
.gm-brawl-stars .bs-body{flex:1;min-height:0;display:flex;gap:1.6em;margin-top:1.2em}
.gm-brawl-stars .bs-card{background:linear-gradient(180deg,#3a2a9a,#2a1c78);border:.25em solid #0c0828;border-radius:1.4em;box-shadow:inset 0 .25em 0 rgba(255,255,255,.18),0 .4em 0 rgba(0,0,0,.35);padding:1.1em 1.3em;box-sizing:border-box;min-height:0}
.gm-brawl-stars .bs-left{width:27%;display:flex;flex-direction:column;gap:.6em;flex:none}
.gm-brawl-stars .bs-mid{flex:1;display:flex;flex-direction:column;gap:1em;min-width:0}
.gm-brawl-stars .bs-right{width:30%;display:flex;flex-direction:column;gap:.9em;flex:none}
.gm-brawl-stars .bs-port{width:100%;aspect-ratio:1.15;border-radius:1em;background:radial-gradient(circle at 50% 70%,#6e56ff,#3a2aa0 70%);border:.2em solid #0c0828;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.gm-brawl-stars .bs-port canvas{height:100%;width:auto;aspect-ratio:1}
.gm-brawl-stars .bs-nm{font-size:3.2em;line-height:1}
.gm-brawl-stars .bs-role{font-size:1.5em;color:#ffd21f;margin-top:-.2em}
.gm-brawl-stars .bs-desc{font-family:system-ui,"Segoe UI",sans-serif;font-weight:700;font-size:1.28em;line-height:1.25;color:#d8d0ff}
.gm-brawl-stars .bs-st{display:grid;grid-template-columns:auto 1fr;gap:.25em .7em;align-items:center;font-size:1.4em}
.gm-brawl-stars .bs-st i{display:block;height:.7em;border-radius:.4em;background:#0c0828;position:relative;overflow:hidden}
.gm-brawl-stars .bs-st i b{position:absolute;left:0;top:0;bottom:0;border-radius:.4em;background:linear-gradient(#7dff6a,#35c24a)}
.gm-brawl-stars .bs-sup{display:flex;gap:.6em;align-items:flex-start;font-size:1.28em;line-height:1.2}
.gm-brawl-stars .bs-sup b{color:#ffd21f;font-weight:400}
.gm-brawl-stars .bs-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.8em;flex:1;min-height:0;align-content:start}
.gm-brawl-stars .bs-bc{position:relative;border:.22em solid #0c0828;border-radius:1em;background:radial-gradient(circle at 50% 75%,#6e56ff,#3a2aa0 75%);cursor:pointer;padding:0;overflow:hidden;aspect-ratio:.92;box-shadow:inset 0 .2em 0 rgba(255,255,255,.2),0 .3em 0 rgba(0,0,0,.35);color:#fff;font-family:var(--bsf);display:flex;align-items:flex-end;justify-content:center}
.gm-brawl-stars .bs-bc canvas{position:absolute;left:0;top:0;width:100%;height:100%}
.gm-brawl-stars .bs-bc span{position:relative;font-size:1.25em;line-height:1;padding-bottom:.35em;text-shadow:${OT}}
.gm-brawl-stars .bs-bc em{position:absolute;right:.35em;top:.3em;font-style:normal;font-size:1.2em;display:flex;align-items:center;gap:.15em;text-shadow:${OT}}
.gm-brawl-stars .bs-bc em svg{width:1em;height:1em}
.gm-brawl-stars .bs-bc.on{border-color:#ffd21f;box-shadow:0 0 0 .22em #ffd21f,0 .3em 0 rgba(0,0,0,.35);transform:translateY(-.15em)}
.gm-brawl-stars .bs-bc.taken{filter:grayscale(.85) brightness(.7);cursor:not-allowed}
.gm-brawl-stars .bs-modes{display:flex;flex-direction:column;gap:.7em}
.gm-brawl-stars .bs-mode{border:.22em solid #0c0828;border-radius:1em;cursor:pointer;padding:.55em .9em;text-align:left;color:#fff;font-family:var(--bsf);position:relative;box-shadow:inset 0 .2em 0 rgba(255,255,255,.25),0 .3em 0 rgba(0,0,0,.35);overflow:hidden}
.gm-brawl-stars .bs-mode b{display:block;font-weight:400;font-size:2.2em;line-height:1.05;text-shadow:${OT}}
.gm-brawl-stars .bs-mode small{display:block;font-family:system-ui,"Segoe UI",sans-serif;font-weight:800;font-size:1.15em;line-height:1.2;opacity:.92;margin-top:.15em}
.gm-brawl-stars .bs-mode.on{outline:.25em solid #ffd21f;outline-offset:.05em;transform:translateY(-.1em)}
.gm-brawl-stars .bs-mapnav{display:flex;align-items:center;gap:.6em;justify-content:space-between;font-size:1.9em}
.gm-brawl-stars .bs-mapnav span{flex:1;text-align:center;line-height:1.05}
.gm-brawl-stars .bs-seg{display:flex;gap:.4em}
.gm-brawl-stars .bs-seg button{flex:1}
.gm-brawl-stars .bs-btn{border:.22em solid #0c0828;border-radius:1em;cursor:pointer;color:#fff;font-family:var(--bsf);font-size:2em;line-height:1;padding:.5em .9em;background:linear-gradient(#5f8bff,#2f5ae0);box-shadow:inset 0 .22em 0 rgba(255,255,255,.35),0 .35em 0 rgba(0,0,0,.4);text-shadow:${OT};touch-action:manipulation}
.gm-brawl-stars .bs-btn:active{transform:translateY(.2em);box-shadow:inset 0 .22em 0 rgba(255,255,255,.35),0 .15em 0 rgba(0,0,0,.4)}
.gm-brawl-stars .bs-btn.y{background:linear-gradient(#ffe85a,#ffb000);color:#fff}
.gm-brawl-stars .bs-btn.g{background:linear-gradient(#7dff6a,#2fb83c)}
.gm-brawl-stars .bs-btn.r{background:linear-gradient(#ff7a7a,#e02a3a)}
.gm-brawl-stars .bs-btn.s{font-size:1.5em;padding:.45em .6em}
.gm-brawl-stars .bs-btn.on{background:linear-gradient(#ffe85a,#ffb000)}
.gm-brawl-stars .bs-btn.big{font-size:3.2em;padding:.4em 1em}
.gm-brawl-stars .bs-btn[disabled]{filter:grayscale(1) brightness(.75);cursor:default}
.gm-brawl-stars .bs-lbl{font-size:1.4em;color:#ffd21f;margin-bottom:-.3em}
.gm-brawl-stars .bs-hud{pointer-events:none}
.gm-brawl-stars .bs-ui{position:absolute;inset:0;pointer-events:none;z-index:3}
.gm-brawl-stars .bs-ui>*{pointer-events:none}
.gm-brawl-stars .bs-ui .pe{pointer-events:auto}
.gm-brawl-stars .bs-ht{position:absolute;top:1em;left:50%;transform:translateX(-50%);display:flex;align-items:stretch;gap:.4em;font-size:1em}
.gm-brawl-stars .bs-hs{display:flex;align-items:center;gap:.5em;min-width:11em;padding:.3em .8em;border:.2em solid #0c0828;border-radius:.9em;font-size:2.4em;line-height:1;box-shadow:inset 0 .15em 0 rgba(255,255,255,.3)}
.gm-brawl-stars .bs-hs.t0{background:linear-gradient(#4fb4ff,#2573dc);justify-content:flex-end;flex-direction:row-reverse}
.gm-brawl-stars .bs-hs.t1{background:linear-gradient(#ff6b72,#d62a36)}
.gm-brawl-stars .bs-hs.sho{background:linear-gradient(#8fe04a,#3d9a22);min-width:7em;justify-content:center}
.gm-brawl-stars .bs-hs span{flex:1;text-align:center;text-shadow:${OT}}
.gm-brawl-stars .bs-hs svg{width:1em;height:1em;flex:none}
.gm-brawl-stars .bs-tm{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:4.4em;background:rgba(10,6,40,.8);border:.2em solid #0c0828;border-radius:.9em;font-size:2.4em;line-height:1;padding:.2em .5em}
.gm-brawl-stars .bs-tm small{font-size:.42em;color:#ffd21f;letter-spacing:.06em}
.gm-brawl-stars .bs-ban{position:absolute;left:0;right:0;top:24%;text-align:center;font-size:7em;line-height:1;opacity:0;transform:scale(.6);pointer-events:none;white-space:nowrap}
.gm-brawl-stars .bs-ban small{display:block;font-size:.3em;color:#ffd21f;margin-top:.2em}
.gm-brawl-stars .bs-ban.go{animation:bsban 1.6s ease-out forwards}
@keyframes bsban{0%{opacity:0;transform:scale(2.2)}12%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.9) translateY(-.3em)}}
.gm-brawl-stars .bs-cd{position:absolute;left:50%;top:6.4em;transform:translateX(-50%);font-size:2.6em;padding:.25em .9em;border:.12em solid #0c0828;border-radius:.8em;white-space:nowrap}
.gm-brawl-stars .bs-cd.t0{background:linear-gradient(#4fb4ff,#2573dc)}
.gm-brawl-stars .bs-cd.t1{background:linear-gradient(#ff6b72,#d62a36)}
.gm-brawl-stars .bs-cd[hidden],.gm-brawl-stars [hidden]{display:none!important}
.gm-brawl-stars .bs-mm{position:absolute;left:1em;top:1em;width:13em;height:13em;border:.2em solid #0c0828;border-radius:.8em;background:#000;opacity:.9}
.gm-brawl-stars .bs-menu{position:absolute;right:1em;top:1em;width:4em;height:4em;border-radius:50%;border:.2em solid #0c0828;background:rgba(10,6,40,.75);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.gm-brawl-stars .bs-menu svg{width:2em;height:2em}
.gm-brawl-stars .bs-alive{position:absolute;right:1em;top:6em;font-size:2em;display:flex;align-items:center;gap:.4em}
.gm-brawl-stars .bs-feed{position:absolute;right:1em;top:10em;display:flex;flex-direction:column;align-items:flex-end;gap:.3em;font-size:1.5em}
.gm-brawl-stars .bs-feed div{background:rgba(10,6,40,.7);border-radius:.6em;padding:.2em .6em;border:.12em solid #0c0828}
.gm-brawl-stars .bs-ctl{position:absolute;right:2em;bottom:4.4em;width:24em;height:20em;pointer-events:none}
.gm-brawl-stars .bs-ab,.gm-brawl-stars .bs-sb{position:absolute;border-radius:50%;pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;border:.3em solid #0c0828;box-shadow:inset 0 .25em 0 rgba(255,255,255,.4),0 .4em 0 rgba(0,0,0,.4);font-size:1em}
.gm-brawl-stars .bs-ab{right:0;bottom:0;width:11em;height:11em;background:radial-gradient(circle at 50% 35%,#ffb04a,#e0521a)}
.gm-brawl-stars .bs-ab.hold{filter:brightness(1.2)}
.gm-brawl-stars .bs-ab .ic{width:5.6em;height:5.6em}
.gm-brawl-stars .bs-ab .am{position:absolute;left:50%;bottom:-2.4em;transform:translateX(-50%);display:flex;gap:.3em}
.gm-brawl-stars .bs-ab .am i{display:block;width:3em;height:.8em;border-radius:.4em;background:#2a1a10;border:.15em solid #0c0828;overflow:hidden;position:relative}
.gm-brawl-stars .bs-ab .am i b{position:absolute;left:0;top:0;bottom:0;background:#ffb02a}
.gm-brawl-stars .bs-sb{right:12.6em;bottom:.4em;width:8em;height:8em;background:radial-gradient(circle at 50% 35%,#5a4a8a,#2a2050);filter:grayscale(.4)}
.gm-brawl-stars .bs-sb.rdy{background:radial-gradient(circle at 50% 35%,#ffe85a,#ff9a00);filter:none;animation:bspulse .9s infinite}
@keyframes bspulse{50%{transform:scale(1.08)}}
.gm-brawl-stars .bs-sb svg{position:absolute;inset:-.3em;width:calc(100% + .6em);height:calc(100% + .6em);transform:rotate(-90deg)}
.gm-brawl-stars .bs-sb .ic{width:4em;height:4em;position:relative}
.gm-brawl-stars .bs-hint{position:absolute;bottom:-1.6em;left:50%;transform:translateX(-50%);font-size:1.15em;font-family:system-ui,sans-serif;font-weight:800;color:#fff;opacity:.8;white-space:nowrap}
.gm-brawl-stars .bs-hb{position:absolute;left:50%;bottom:1.2em;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.3em}
.gm-brawl-stars .bs-stick{position:absolute;width:12em;height:12em;border-radius:50%;background:rgba(255,255,255,.14);border:.25em solid rgba(255,255,255,.4);pointer-events:none;display:none;margin:-6em 0 0 -6em}
.gm-brawl-stars .bs-stick i{position:absolute;left:50%;top:50%;width:5em;height:5em;margin:-2.5em 0 0 -2.5em;border-radius:50%;background:rgba(255,255,255,.55)}
.gm-brawl-stars .bs-end{align-items:stretch;gap:.8em}
.gm-brawl-stars .bs-eb{text-align:center;font-size:7em;line-height:1;margin:.05em 0 0;transform:rotate(-1.5deg)}
.gm-brawl-stars .bs-eb.w{color:#ffd21f}
.gm-brawl-stars .bs-eb.l{color:#ff6a6a}
.gm-brawl-stars .bs-eb.d{color:#cfd8ff}
.gm-brawl-stars .bs-es{text-align:center;font-size:2em;margin-top:-.4em;color:#ffd21f}
.gm-brawl-stars .bs-ebody{flex:1;min-height:0;display:flex;gap:1.4em}
.gm-brawl-stars .bs-mvp{width:26%;flex:none;display:flex;flex-direction:column;align-items:center;gap:.4em;text-align:center}
.gm-brawl-stars .bs-mvp .tag{background:linear-gradient(#ffe85a,#ffb000);color:#fff;border:.2em solid #0c0828;border-radius:.6em;padding:.1em .8em;font-size:2.2em;text-shadow:${OT}}
.gm-brawl-stars .bs-tbl{flex:1;overflow:auto;min-width:0}
.gm-brawl-stars .bs-tbl table{width:100%;border-collapse:collapse;font-size:1.5em}
.gm-brawl-stars .bs-tbl th{font-weight:400;color:#ffd21f;text-align:right;padding:.1em .5em;font-size:.8em}
.gm-brawl-stars .bs-tbl th:first-child,.gm-brawl-stars .bs-tbl td:first-child{text-align:left}
.gm-brawl-stars .bs-tbl td{text-align:right;padding:.28em .5em;border-top:.1em solid rgba(255,255,255,.12)}
.gm-brawl-stars .bs-tbl tr.me td{background:rgba(255,210,31,.2)}
.gm-brawl-stars .bs-tbl tr.t0 td:first-child{border-left:.35em solid #3fa9ff}
.gm-brawl-stars .bs-tbl tr.t1 td:first-child{border-left:.35em solid #ff4a52}
.gm-brawl-stars .bs-tbl td.nm{display:flex;align-items:center;gap:.5em}
.gm-brawl-stars .bs-tbl td.nm canvas{width:1.9em;height:1.9em;border-radius:.4em;background:#3a2aa0}
.gm-brawl-stars .bs-tbl td.nm b{font-weight:400;color:#ffd21f;font-size:.8em}
.gm-brawl-stars .bs-ebtn{display:flex;gap:1em;justify-content:center;flex:none;flex-wrap:wrap}
.gm-brawl-stars .bs-tro2{font-size:2.6em;display:flex;align-items:center;gap:.4em;justify-content:center}
.gm-brawl-stars .bs-tro2 svg{width:1.1em;height:1.1em}
.gm-brawl-stars .bs-pl{display:flex;flex-direction:column;gap:.4em;font-size:1.5em;overflow:auto}
.gm-brawl-stars .bs-pl div{display:flex;align-items:center;gap:.6em;background:rgba(10,6,40,.5);border-radius:.7em;padding:.25em .7em}
.gm-brawl-stars .bs-pl div span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-brawl-stars .bs-pl div em{font-style:normal;color:#ffd21f;font-size:.85em}
.gm-brawl-stars .bs-pl div.rdy em{color:#7dff6a}
.gm-brawl-stars .bs-msg{margin:auto;text-align:center;font-size:3em;display:flex;flex-direction:column;gap:.6em;align-items:center}
.gm-brawl-stars .bs-msg small{font-family:system-ui,sans-serif;font-weight:800;font-size:.46em;color:#d8d0ff;max-width:24em}
.gm-brawl-stars .bs-pause{position:absolute;inset:0;background:rgba(10,6,40,.78);z-index:8;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1em;font-size:1em}
.gm-brawl-stars .bs-pause b{font-weight:400;font-size:5em}
.gm-brawl-stars .bs-pause .bs-btn{min-width:10em}
.gm-brawl-stars .bs-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3em;z-index:9;background:#241a58}
.gm-brawl-stars .bs-por .bs-body{flex-direction:column;overflow:auto}
.gm-brawl-stars .bs-por .bs-scr,.gm-brawl-stars .bs-por .bs-body,.gm-brawl-stars .bs-por .bs-ebody{touch-action:pan-y;overscroll-behavior:contain}
.gm-brawl-stars .bs-por .bs-left .bs-desc{display:none}
.gm-brawl-stars .bs-por .bs-left,.gm-brawl-stars .bs-por .bs-right{width:auto}
.gm-brawl-stars .bs-por .bs-left{order:2}
.gm-brawl-stars .bs-por .bs-mid{order:1;flex:none}
.gm-brawl-stars .bs-por .bs-right{order:0}
.gm-brawl-stars .bs-por .bs-modes{flex-direction:row}
.gm-brawl-stars .bs-por .bs-mode{flex:1;padding:.4em .5em}
.gm-brawl-stars .bs-por .bs-mode b{font-size:1.7em}
.gm-brawl-stars .bs-por .bs-mode small{display:none}
.gm-brawl-stars .bs-por .bs-port{display:none}
.gm-brawl-stars .bs-por .bs-logo{font-size:3.6em}
.gm-brawl-stars .bs-por .bs-scr{padding:1.2em 1.2em}
.gm-brawl-stars .bs-por .bs-ht{font-size:.7em;top:.8em}
.gm-brawl-stars .bs-por .bs-hs{min-width:7em}
.gm-brawl-stars .bs-por .bs-mm{width:9em;height:9em;top:7em}
.gm-brawl-stars .bs-por .bs-ban{font-size:5em}
.gm-brawl-stars .bs-por .bs-ebody{flex-direction:column;overflow:auto}
.gm-brawl-stars .bs-por .bs-mvp{width:auto;flex-direction:row;justify-content:center}
.gm-brawl-stars .bs-por .bs-eb{font-size:5em}
.gm-brawl-stars .bs-por .bs-btn.big{font-size:2.6em}
.gm-brawl-stars .bs-por .bs-alive{top:11em}
.gm-brawl-stars .bs-por .bs-feed{top:14em}
.gm-brawl-stars .bs-por .bs-ctl{right:1.2em;bottom:2em}
.gm-brawl-stars .bs-por .bs-menu{width:3.4em;height:3.4em}
.gm-brawl-stars .bs-short .bs-logo{font-size:3.4em}
.gm-brawl-stars .bs-short .bs-desc{display:none}
`;


  const CUP = '<svg viewBox="0 0 24 24"><path d="M6 3h12v5a6 6 0 0 1-12 0z" fill="#ffd21f" stroke="#0c0828" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 5H3v2a4 4 0 0 0 4 4M18 5h3v2a4 4 0 0 1-4 4" fill="none" stroke="#0c0828" stroke-width="1.6"/><path d="M12 14v4m-4 3h8l-1-3H9z" fill="#ffd21f" stroke="#0c0828" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const GEMI = '<svg viewBox="0 0 24 24"><path d="M12 2l8 7-8 13L4 9z" fill="#c27bff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9h16M9 9l3-7 3 7-3 13z" stroke="#fff" fill="none" stroke-width="1" opacity=".6"/></svg>';
  const BALLI = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#0c0828" stroke-width="1.6"/><path d="M12 7l4 3-1.5 5h-5L8 10z" fill="#0c0828"/></svg>';
  const SKI = '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5" fill="#fff" stroke="#0c0828" stroke-width="1.6"/><path d="M4 21c0-5 4-7 8-7s8 2 8 7z" fill="#fff" stroke="#0c0828" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const ICATK = '<svg class="ic" viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="#fff"/><path d="M24 4v10M24 34v10M4 24h10M34 24h10M10 10l7 7M31 31l7 7M38 10l-7 7M17 31l-7 7" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
  const ICSUP = '<svg class="ic" viewBox="0 0 48 48"><path d="M27 3L9 27h13l-3 18 20-26H26z" fill="#fff" stroke="#0c0828" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  const MENUI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 5v14M18 5v14"/></svg>';
  const NAMES = ['Nova', 'Rex', 'Pip', 'Kira', 'Moxie', 'Bolt', 'Juno', 'Fang', 'Tess', 'Orla', 'Zed', 'Milo', 'Sage', 'Dax', 'Lumi', 'Rue', 'Otto', 'Vee', 'Brix', 'Cleo'];
  const LVLS = ['Easy', 'Normal', 'Hard'];
  const SHOW_PTS = [10, 8, 6, 4, 2, 0, -2, -3, -4, -5];
  const NET_O = { title: 'Brawl Stars', sizes: [2, 3, 4, 5, 6], defaultSize: 6, min: 2, max: 6, bots: true };
  const dmgScore = i => { const a = BR[i].atk; switch (a.k) { case 'fan': case 'burst': case 'punch': case 'flame': return a.dmg * a.n; case 'bolt': return a.dmg[1]; default: return a.dmg; } };

  function run(root, wrap, api, V) {
    const coarse = matchMedia('(pointer: coarse)').matches, por = V.h > V.w;
    wrap.style.width = V.canvas.style.width; wrap.style.aspectRatio = V.canvas.style.aspectRatio;
    V.canvas.style.width = '100%'; V.canvas.classList.add('bs-gl'); wrap.append(V.canvas);
    wrap.tabIndex = 0;
    if (por) wrap.classList.add('bs-por');
    const fit = () => { const cw = V.canvas.clientWidth; if (cw && coarse && !document.fullscreenElement) V.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / V.w); };
    const setU = () => { const cw = wrap.clientWidth; if (cw) wrap.style.setProperty('--u', (cw / (por ? 480 : 960)).toFixed(4) + 'px'); fit(); };
    setU();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(setU); ro.observe(wrap); }
    api.on(window, 'resize', setU);
    const R = makeRenderer(api, V, { small: coarse });
    wrap.append(R.hudC);
    const AU = makeAudio(api);
    const sv = Object.assign({ tro: {}, sel: 'bramble', mode: 'gem', maps: { gem: 0, ball: 0, show: 0 }, lvl: 1, st: { m: 0, w: 0, k: 0 } }, api.load() || {});
    sv.maps = Object.assign({ gem: 0, ball: 0, show: 0 }, sv.maps); sv.tro = sv.tro || {}; sv.st = Object.assign({ m: 0, w: 0, k: 0 }, sv.st);
    if (BRI[sv.sel] == null) sv.sel = 'bramble';
    const persist = () => api.save(sv);
    const troTotal = () => { let n = 0; for (const k in sv.tro) n += sv.tro[k] | 0; return n; };
    api.label('Trophies'); api.score(troTotal());
    const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
    const ui = el('<div class="bs-ui"></div>'); wrap.append(ui);
    let scr = null, state = 'load', Mt = null, dead = false;
    const port = {};
    const portOf = i => { if (!port[i]) { try { port[i] = R.portrait(i, 128); } catch (e) { port[i] = null; } } return port[i]; };
    const portCanvas = (i, cls) => { const c = document.createElement('canvas'); c.width = c.height = 256; const s = portOf(i); if (s) c.getContext('2d').drawImage(s, 0, 0, 256, 256); if (cls) c.className = cls; return c; };
    const clearScr = () => { if (scr) { scr.remove(); scr = null; } };
    const setScr = e => { clearScr(); scr = e; wrap.append(e); return e; };

    const banEl = el('<div class="bs-ban ot"></div>');
    const mmEl = el('<canvas class="bs-mm" width="130" height="130" hidden></canvas>');
    const htEl = el('<div class="bs-ht" hidden><div class="bs-hs t0"><span></span></div><div class="bs-tm"><div>0:00</div><small>TIME</small></div><div class="bs-hs t1"><span></span></div></div>');
    const cdEl = el('<div class="bs-cd ot" hidden></div>');
    const aliveEl = el('<div class="bs-alive ot" hidden></div>');
    const feedEl = el('<div class="bs-feed"></div>');
    const menuBtn = el('<button class="bs-menu pe" type="button" aria-label="Menu" hidden>' + MENUI + '</button>');
    const ctlEl = el('<div class="bs-ctl" hidden><div class="bs-sb"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#7dff6a" stroke-width="6" stroke-dasharray="289" stroke-dashoffset="289" stroke-linecap="round"/></svg>' + ICSUP + '</div><div class="bs-ab">' + ICATK + '<div class="am"><i><b></b></i><i><b></b></i><i><b></b></i></div></div></div>');
    const stickEl = el('<div class="bs-stick"><i></i></div>');
    ui.append(mmEl, htEl, cdEl, aliveEl, feedEl, banEl, ctlEl, stickEl, menuBtn);
    const hudShow = on => { htEl.hidden = !on; menuBtn.hidden = !on; ctlEl.hidden = !on; if (!on) { mmEl.hidden = true; cdEl.hidden = true; aliveEl.hidden = true; feedEl.innerHTML = ''; banEl.className = 'bs-ban ot'; } };
    const banner = (txt, sub, dur) => { banEl.innerHTML = txt + (sub ? '<small>' + sub + '</small>' : ''); banEl.className = 'bs-ban ot'; void banEl.offsetWidth; banEl.className = 'bs-ban ot go'; banEl.style.animationDuration = (dur || 1.6) + 's'; };
    const feed = txt => { const d = el('<div>' + txt + '</div>'); feedEl.append(d); while (feedEl.children.length > 3) feedEl.firstChild.remove(); api.timeout(() => d.remove(), 4200); };

    function brInfoHtml(i) {
      const d = BR[i], hp = d.hp / 6000, sp = (d.spd - 2.6) / 1.8, dm = dmgScore(i) / 1800;
      return { nm: d.name, role: d.role, desc: d.desc, hp, sp, dm, sup: d.supName, tro: sv.tro[d.id] | 0 };
    }
    function fillBr(root2, i) {
      const o = brInfoHtml(i);
      root2.querySelector('.bs-nm').textContent = o.nm;
      root2.querySelector('.bs-role').textContent = o.role + ' · ' + o.tro + ' trophies';
      root2.querySelector('.bs-desc').textContent = BR[i].desc;
      const bs = root2.querySelectorAll('.bs-st b');
      bs[0].style.width = clamp(o.hp * 100, 8, 100) + '%'; bs[1].style.width = clamp(o.sp * 100, 8, 100) + '%'; bs[2].style.width = clamp(o.dm * 100, 8, 100) + '%';
      root2.querySelector('.bs-sup span').textContent = o.sup;
      const p = root2.querySelector('.bs-port');
      if (p) { p.innerHTML = ''; p.append(portCanvas(i)); }
    }
    const leftCard = () => el('<div class="bs-card bs-left"><div class="bs-port"></div><div class="bs-nm ot"></div><div class="bs-role ot"></div><div class="bs-desc"></div><div class="bs-st ot"><span>Health</span><i><b></b></i><span>Speed</span><i><b></b></i><span>Damage</span><i><b></b></i></div><div class="bs-sup ot"><b>Super:</b><span></span></div></div>');
    const gridHtml = () => BR.map((d, i) => `<button class="bs-bc" data-b="${i}" type="button"><canvas width="256" height="256"></canvas><em>${CUP}<span class="tr">${sv.tro[d.id] | 0}</span></em><span>${d.name}</span></button>`).join('');
    function fillGrid(g) {
      g.querySelectorAll('.bs-bc').forEach(b => { const i = +b.dataset.b, s = portOf(i), c = b.querySelector('canvas'); if (s) c.getContext('2d').drawImage(s, 0, 0, 256, 256); });
    }
    const markSel = (g, i) => g.querySelectorAll('.bs-bc').forEach(b => b.classList.toggle('on', +b.dataset.b === i));
    const selIdx = () => BRI[sv.sel];
    const mapDefOf = mode => { const m = MAPS[mode]; return m[sv.maps[mode] % m.length]; };

    function modeBtns() {
      const col = { gem: 'linear-gradient(#c77bff,#7a3ad8)', show: 'linear-gradient(#8fe04a,#3d9a22)', ball: 'linear-gradient(#5fb8ff,#2a6fe0)' };
      return Object.keys(MODES).map(k => `<button class="bs-mode" data-m="${k}" type="button" style="background:${col[k]}"><b class="ot">${MODES[k].name}</b><small class="ot">${MODES[k].short}</small></button>`).join('');
    }

    function showHome() {
      leaveMatchState();
      state = 'home'; hudShow(false);
      const s = setScr(el('<div class="bs-scr"></div>'));
      s.innerHTML = `<div class="bs-top"><div class="bs-logo">BRAWL<b>STARS</b></div><div class="bs-pill ot">${CUP}<span class="tt">${troTotal()}</span></div></div><div class="bs-body"><div class="bs-mid"><div class="bs-lbl ot">Choose your brawler</div><div class="bs-grid">${gridHtml()}</div></div><div class="bs-right"><div class="bs-modes">${modeBtns()}</div><div class="bs-card" style="display:flex;flex-direction:column;gap:.5em"><div class="bs-mapnav"><button class="bs-btn s" data-a="mp" type="button">‹</button><span class="ot mn"></span><button class="bs-btn s" data-a="mn" type="button">›</button></div><div class="bs-desc mb"></div><div class="bs-seg">${LVLS.map((l, k) => `<button class="bs-btn s" data-l="${k}" type="button">${l}</button>`).join('')}</div></div><button class="bs-btn y big" data-a="play" type="button">PLAY</button><button class="bs-btn g" data-a="online" type="button">Play online</button></div></div>`;
      const left = leftCard(); s.querySelector('.bs-body').prepend(left);
      const grid = s.querySelector('.bs-grid'); fillGrid(grid);
      const upd = () => {
        const i = selIdx(); markSel(grid, i); fillBr(left, i);
        s.querySelectorAll('.bs-mode').forEach(b => b.classList.toggle('on', b.dataset.m === sv.mode));
        s.querySelector('.mn').textContent = mapDefOf(sv.mode).name;
        s.querySelector('.mb').textContent = MODES[sv.mode].blurb;
        s.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', +b.dataset.l === sv.lvl));
      };
      upd();
      s.addEventListener('click', e => {
        const t = e.target.closest('button'); if (!t) return;
        AU.unlock(); AU.play('click');
        if (t.dataset.b != null) { sv.sel = BR[+t.dataset.b].id; persist(); upd(); }
        else if (t.dataset.m) { sv.mode = t.dataset.m; persist(); upd(); }
        else if (t.dataset.l) { sv.lvl = +t.dataset.l; persist(); upd(); }
        else if (t.dataset.a === 'mp' || t.dataset.a === 'mn') { const n = MAPS[sv.mode].length; sv.maps[sv.mode] = (sv.maps[sv.mode] + (t.dataset.a === 'mn' ? 1 : n - 1)) % n; persist(); upd(); }
        else if (t.dataset.a === 'play') startSolo();
        else if (t.dataset.a === 'online') goOnline();
      });
      startDemo();
    }

    function msgScreen(title, sub, btns) {
      leaveMatchState(true); hudShow(false); state = 'msg';
      const s = setScr(el(`<div class="bs-scr"><div class="bs-msg ot">${title}<small>${sub || ''}</small><div class="bs-ebtn">${(btns || []).map((b, i) => `<button class="bs-btn ${b[2] || ''}" data-i="${i}" type="button">${b[0]}</button>`).join('')}</div></div></div>`));
      s.addEventListener('click', e => { const t = e.target.closest('button'); if (!t) return; AU.play('click'); const b = btns[+t.dataset.i]; if (b) b[1](); });
      return s;
    }

    const trophyDelta = (res, me) => {
      const p = res.players.find(q => q.i === me); if (!p) return 0;
      if (res.mode === 'show') return SHOW_PTS[clamp(p.place - 1, 0, 9)];
      if (res.win < 0) return 0;
      return res.win === p.team ? 8 : -5;
    };
    function applyTrophies(res, me) {
      const p = res.players.find(q => q.i === me); if (!p) return 0;
      const id = BR[p.br].id, d = trophyDelta(res, me), old = sv.tro[id] | 0, nw = Math.max(0, old + d);
      sv.tro[id] = nw; sv.st.m++; sv.st.k += p.kills; if (d > 0 && (res.mode === 'show' ? p.place === 1 : res.win === p.team)) sv.st.w++;
      persist(); const tot = troTotal(); api.score(tot); api.submit(tot);
      return nw - old;
    }
    function showEnd(res, me, net) {
      state = 'end'; hudShow(false); R.setAim(null);
      const mp = res.players.find(q => q.i === me), myTeam = mp ? mp.team : 0;
      const first = !Mt.counted; Mt.counted = true;
      const dt = first ? applyTrophies(res, me) : (Mt.dtro || 0); Mt.dtro = dt;
      let cls = 'd', big = 'DRAW', sub = '';
      if (res.mode === 'show') { const pl = mp ? mp.place : 10; cls = pl === 1 ? 'w' : pl <= 3 ? 'd' : 'l'; big = pl === 1 ? 'VICTORY' : '#' + pl; sub = pl === 1 ? 'Last brawler standing' : 'You placed #' + pl + ' of ' + res.players.length; }
      else if (res.win >= 0) { const w = res.win === myTeam; cls = w ? 'w' : 'l'; big = w ? 'VICTORY' : 'DEFEAT'; }
      const mvp = res.players.find(q => q.mvp) || res.players[0];
      const rows = res.players.slice().sort((a, b) => res.mode === 'show' ? a.place - b.place : (a.team === b.team ? b.score - a.score : (a.team === myTeam ? -1 : 1)));
      const col2 = res.mode === 'ball' ? ['Goals', p => p.pts] : res.mode === 'gem' ? ['Gems', p => p.pts] : ['Cubes', p => p.pts];
      const tr = rows.map(p => `<tr class="${p.i === me ? 'me ' : ''}t${res.mode === 'show' ? 1 : (p.team === myTeam ? 0 : 1)}"><td class="nm"><canvas width="64" height="64" data-b="${p.br}"></canvas>${esc(p.name)}${p.mvp ? ' <b>MVP</b>' : ''}</td><td>${res.mode === 'show' ? '#' + p.place : p.kills}</td><td>${Math.round(p.dmg)}</td><td>${Math.round(p.heal)}</td><td>${col2[1](p)}</td></tr>`).join('');
      const s = setScr(el(`<div class="bs-scr bs-end"><div class="bs-eb ot ${cls}">${big}</div><div class="bs-es ot">${sub || esc(res.map)}</div><div class="bs-ebody"><div class="bs-card bs-mvp"><div class="tag">MVP</div><div class="bs-port"></div><div class="bs-nm ot" style="font-size:2.6em">${esc(mvp.name)}</div><div class="bs-role ot">${BR[mvp.br].name} · ${mvp.kills} KOs</div></div><div class="bs-card bs-tbl"><table><tr><th>Brawler</th><th>${res.mode === 'show' ? 'Place' : 'KOs'}</th><th>Damage</th><th>Healed</th><th>${col2[0]}</th></tr>${tr}</table></div></div><div class="bs-tro2 ot">${CUP}<span>${dt >= 0 ? '+' : ''}${dt}</span><span style="opacity:.8;font-size:.6em">${troTotal()} total</span></div><div class="bs-ebtn"></div></div>`));
      s.querySelector('.bs-mvp .bs-port').append(portCanvas(mvp.br));
      s.querySelectorAll('canvas[data-b]').forEach(c => { const p = portOf(+c.dataset.b); if (p) c.getContext('2d').drawImage(p, 0, 0, 64, 64); });
      const eb = s.querySelector('.bs-ebtn');
      const add = (txt, cl, fn) => { const b = el(`<button class="bs-btn ${cl}" type="button">${txt}</button>`); b.onclick = () => { AU.play('click'); fn(); }; eb.append(b); return b; };
      if (!net) { add('Play again', 'y', () => startSolo()); add('Home', '', () => showHome()); }
      else if (net === 'host') { add('Rematch', 'y', () => hostRematch()); add('Lobby', '', () => goOnline()); add('Leave', 'r', () => leaveOnline()); }
      else { eb.append(el('<div class="bs-es ot" style="align-self:center">Waiting for the host…</div>')); add('Leave', 'r', () => leaveOnline()); }
      AU.play(cls === 'w' ? 'win' : cls === 'l' ? 'lose' : 'goal');
    }

    function showPause() {
      if (!Mt || state !== 'play' || wrap.querySelector('.bs-pause')) return;
      const online = Mt.role !== 'solo';
      if (!online) Mt.paused = true;
      const p = el(`<div class="bs-pause"><b class="ot">${online ? 'Menu' : 'Paused'}</b><button class="bs-btn y" data-a="r" type="button">Resume</button><button class="bs-btn r" data-a="l" type="button">${online ? 'Leave match' : 'Quit match'}</button></div>`);
      wrap.append(p);
      p.onclick = e => {
        const t = e.target.closest('button'); if (!t) return;
        AU.play('click'); p.remove(); if (Mt) Mt.paused = false;
        if (t.dataset.a === 'l') { if (online) leaveOnline(); else showHome(); }
      };
    }
    menuBtn.onclick = () => { AU.unlock(); showPause(); };


    const keys = api.keys;
    const ctl = { mouse: null, mouseT: -9, down: false, fire: null, sup: null, stick: null, ab: null, sb: null };
    const psc = () => wrap.clientWidth / (por ? 480 : 960) || 1;
    const rangeOf = (br, sup) => { const a = BR[br][sup ? 'sup' : 'atk']; return a.k === 'slash' ? a.dist : a.k === 'hop' ? a.back : a.k === 'aoeheal' ? 0 : a.range || 6; };
    const meView = () => (Mt && Mt.lastView && Mt.lastView.brs[Mt.me]) || null;
    const mouseRecent = () => ctl.mouse && performance.now() - ctl.mouseT < 4000 && !coarse;
    function autoAim(sup) {
      const v = Mt.lastView, me = meView(); if (!v || !me) return { a: 0, d: 5 };
      const rg = rangeOf(me.br, sup);
      let best = null, bd = 1e9;
      for (const b of v.brs) if (b.vis && b.alive && b.team !== me.team) { const d = hyp(b.x - me.x, b.y - me.y); if (d < bd) { bd = d; best = b; } }
      for (const t of v.turrets) if (t.team !== me.team) { const d = hyp(t.x - me.x, t.y - me.y); if (d < bd) { bd = d; best = t; } }
      if (best && bd <= rg + 1.6) return { a: Math.atan2(best.y - me.y, best.x - me.x), d: Math.max(1.6, bd) };
      if (v.mode === 'show' && Mt.M) {
        const M = Mt.M, R2 = Math.ceil(rg); let bx = null, bb = rg * 1.05;
        for (let j = Math.floor(me.y) - R2; j <= me.y + R2; j++) for (let i = Math.floor(me.x) - R2; i <= me.x + R2; i++) if (tileAt(M, i, j) === 6) { const d = hyp(i + .5 - me.x, j + .5 - me.y); if (d < bb) { bb = d; bx = [i + .5, j + .5]; } }
        if (bx) return { a: Math.atan2(bx[1] - me.y, bx[0] - me.x), d: Math.max(1.6, bb) };
      }
      if (v.ball && me.ball) { const g = Mt.M.goal[1 - me.team], gy = (g.y0 + g.y1) / 2, gx = me.team === 0 ? Mt.M.W - 2 : 2; return { a: Math.atan2(gy - me.y, gx - me.x), d: 10 }; }
      return { a: me.face, d: rg * .85 };
    }
    function mouseAim() {
      const me = meView(); if (!me || !ctl.mouse) return null;
      const g = R.ground(ctl.mouse[0], ctl.mouse[1]); if (!g) return null;
      return { a: Math.atan2(g.y - me.y, g.x - me.x), d: hyp(g.x - me.x, g.y - me.y) };
    }
    const aimFire = sup => (mouseRecent() && mouseAim()) || autoAim(sup);
    function sampleInput() {
      const me = meView();
      let mx = 0, my = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
      if (ctl.stick) { mx += ctl.stick.x; my += ctl.stick.y; }
      const l = hyp(mx, my); if (l > 1) { mx /= l; my /= l; }
      let aim = me ? me.face : 0, dist = 6, hold = false, sup = false, show = false;
      if (ctl.ab && ctl.ab.drag) { aim = ctl.ab.a; dist = ctl.ab.d; hold = true; show = true; }
      else if (ctl.sb && ctl.sb.drag) { aim = ctl.sb.a; dist = ctl.sb.d; hold = true; sup = true; show = true; }
      else if (ctl.ab) { const t = autoAim(false); aim = t.a; dist = t.d; hold = true; show = true; }
      else if (ctl.sb) { const t = autoAim(true); aim = t.a; dist = t.d; hold = true; sup = true; show = true; }
      else if (mouseRecent()) { const m = mouseAim(); if (m) { aim = m.a; dist = m.d; show = true; } }
      else if (l > .1) aim = Math.atan2(my, mx);
      return { mx, my, aim, dist, hold, sup, show };
    }
    function takeFire() {
      let f = null;
      if (ctl.fire) { f = ctl.fire; ctl.fire = null; }
      else if (ctl.down && mouseRecent()) f = mouseAim();
      else if (keys.has('Space') || keys.has('KeyJ')) f = aimFire(false);
      return f;
    }
    function takeSup() { const s = ctl.sup; ctl.sup = null; return s; }
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('pointerdown', e => {
      AU.unlock();
      if (state !== 'play' || !Mt || Mt.paused) return;
      const t = e.target, rect = wrap.getBoundingClientRect();
      if (t.closest('.bs-menu')) return;
      if (t.closest('.bs-ab')) { ctl.ab = { id: e.pointerId, x0: e.clientX, y0: e.clientY, a: 0, d: 0, drag: false }; try { wrap.setPointerCapture(e.pointerId); } catch (x) {} ctlEl.querySelector('.bs-ab').classList.add('hold'); e.preventDefault(); return; }
      if (t.closest('.bs-sb')) { ctl.sb = { id: e.pointerId, x0: e.clientX, y0: e.clientY, a: 0, d: 0, drag: false }; try { wrap.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); return; }
      if (e.pointerType === 'mouse') {
        ctl.mouse = [e.clientX, e.clientY]; ctl.mouseT = performance.now();
        if (e.button === 0) { ctl.down = true; ctl.fire = aimFire(false); }
        else if (e.button === 2) ctl.sup = aimFire(true);
        e.preventDefault(); return;
      }
      if (!ctl.stick && e.clientX - rect.left < rect.width * .58) {
        ctl.stick = { id: e.pointerId, cx: e.clientX, cy: e.clientY, x: 0, y: 0 };
        stickEl.style.display = 'block'; stickEl.style.left = (e.clientX - rect.left) + 'px'; stickEl.style.top = (e.clientY - rect.top) + 'px';
        stickEl.firstChild.style.transform = 'none';
        try { wrap.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      }
    });
    wrap.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') { ctl.mouse = [e.clientX, e.clientY]; ctl.mouseT = performance.now(); }
      const ps = psc();
      const dragOf = (o, sup) => {
        const dx = e.clientX - o.x0, dy = (e.clientY - o.y0) * 1.14, len = hyp(dx, dy);
        if (len > 12 * ps) { o.drag = true; o.a = Math.atan2(dy, dx); const me = meView(); o.d = clamp(len / (95 * ps), 0, 1) * (me ? rangeOf(me.br, sup) : 6); }
        else o.drag = false;
      };
      if (ctl.ab && ctl.ab.id === e.pointerId) dragOf(ctl.ab, false);
      if (ctl.sb && ctl.sb.id === e.pointerId) dragOf(ctl.sb, true);
      if (ctl.stick && ctl.stick.id === e.pointerId) {
        const R0 = 56 * ps, dx = e.clientX - ctl.stick.cx, dy = e.clientY - ctl.stick.cy, l = hyp(dx, dy), k = l > R0 ? R0 / l : 1;
        const vx = dx * k, vy = dy * k;
        ctl.stick.x = Math.abs(vx) < R0 * .12 && Math.abs(vy) < R0 * .12 ? 0 : vx / R0; ctl.stick.y = Math.abs(vx) < R0 * .12 && Math.abs(vy) < R0 * .12 ? 0 : vy / R0;
        stickEl.firstChild.style.transform = `translate(${vx / ps * 0.85}px,${vy / ps * 0.85}px)`;
      }
    });
    const pend = e => {
      if (ctl.ab && ctl.ab.id === e.pointerId) { const o = ctl.ab; ctl.ab = null; ctlEl.querySelector('.bs-ab').classList.remove('hold'); if (e.type === 'pointerup' && state === 'play' && Mt && !Mt.paused) ctl.fire = o.drag ? { a: o.a, d: o.d } : autoAim(false); }
      if (ctl.sb && ctl.sb.id === e.pointerId) { const o = ctl.sb; ctl.sb = null; if (e.type === 'pointerup' && state === 'play' && Mt && !Mt.paused) ctl.sup = o.drag ? { a: o.a, d: o.d } : autoAim(true); }
      if (ctl.stick && ctl.stick.id === e.pointerId) { ctl.stick = null; stickEl.style.display = 'none'; }
      if (e.pointerType === 'mouse' && e.button === 0) ctl.down = false;
    };
    wrap.addEventListener('pointerup', pend); wrap.addEventListener('pointercancel', pend);
    api.on(window, 'blur', () => { ctl.down = false; ctl.ab = ctl.sb = ctl.stick = null; stickEl.style.display = 'none'; });
    api.on(window, 'keydown', e => {
      if (state !== 'play' || !Mt || Mt.paused) return;
      const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      const c = e.code;
      if (c === 'Space' || c === 'KeyJ') { if (!e.repeat) ctl.fire = aimFire(false); e.preventDefault(); }
      else if (c === 'KeyE' || c === 'ShiftLeft' || c === 'ShiftRight' || c === 'KeyK' || c === 'KeyL') { if (!e.repeat) ctl.sup = aimFire(true); e.preventDefault(); }
      else if (c === 'ArrowUp' || c === 'ArrowDown' || c === 'ArrowLeft' || c === 'ArrowRight') e.preventDefault();
    });


    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const userName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile')); const n = p && (p.username || p.displayName); if (n) return String(n).slice(0, 16); } catch (e) {} return 'You'; };
    const resKey = () => 'gameplay:bs:res:' + api.net.code;
    const clearRes = () => { try { if (api.net.code) sessionStorage.removeItem(resKey()); } catch (e) {} };
    let mmBase = null, mmDirty = true;

    function leaveMatchState(keepNet) {
      if (Mt && Mt.role === 'host' && !keepNet) clearRes();
      Mt = null; R.setAim(null);
      const p = wrap.querySelector('.bs-pause'); if (p) p.remove();
      ctl.fire = ctl.sup = null; ctl.ab = ctl.sb = ctl.stick = null; stickEl.style.display = 'none';
    }
    const roster = ps => ps.map(p => ({ br: p.br }));
    function startDemo() {
      const mode = Math.random() < .6 ? 'gem' : 'ball', def = pick(MAPS[mode]), pool = shuffle([...BR.keys()]);
      const players = [];
      for (let i = 0; i < 6; i++) players.push({ name: NAMES[i], br: pool[i], team: i % 2, human: false });
      const S = createSim({ mode, mapDef: def, seed: Math.random() * 1e9 | 0, players, lvl: 1 });
      S.state = 1; S.stT = 0;
      Mt = { role: 'demo', mode, md: MODES[mode], M: S.M, S, players, me: -1, myTeam: 0, acc: 0, pendEv: [], follow: 0, followT: 0, lastView: null, seenSt: -1, snaps: [] };
      R.buildMapScene(S.M, 0); R.setRoster(roster(players)); R.resetCam();
    }
    function startSolo() {
      const mode = sv.mode, md = MODES[mode], def = mapDefOf(mode), names = shuffle(NAMES.slice()), pool = shuffle([...BR.keys()]);
      let pi = 0;
      const players = [{ name: userName(), br: selIdx(), team: 0, human: true }];
      if (mode === 'show') for (let i = 1; i < 10; i++) players.push({ name: names[i], br: pool[pi++ % pool.length], team: i, human: false });
      else { for (let i = 1; i < 3; i++) players.push({ name: names[i], br: pool[pi++ % pool.length], team: 0, human: false }); for (let i = 3; i < 6; i++) players.push({ name: names[i], br: pool[pi++ % pool.length], team: 1, human: false }); }
      startHostMatch({ role: 'solo', mode, def, seed: Math.random() * 1e9 | 0, players, lvl: sv.lvl, me: 0 });
    }
    function startHostMatch(o) {
      const cfg = { mode: o.mode, mapDef: o.def, seed: o.seed, lvl: o.lvl, players: o.players.map(p => ({ name: p.name, br: p.br, team: p.team, human: p.human, pid: p.pid })) };
      const S = createSim(cfg);
      if (o.saved) { loadSim(S, o.saved); o.players.forEach((p, i) => { const b = S.brs[i]; b.human = !!p.human; b.pid = p.pid || null; b.bot = p.human ? null : {}; b.iq = []; b.fc = 0; b.sc = 0; b.lastS = 0; }); }
      beginMatch({ role: o.role, mode: o.mode, M: S.M, S, players: o.players, me: o.me, myTeam: S.brs[o.me].team, def: o.def, seed: o.seed, lvl: o.lvl, pendEv: [], resumed: !!o.saved });
    }
    function beginMatch(o) {
      leaveMatchState(true);
      Mt = Object.assign({ acc: 0, paused: false, lastView: null, counted: false, seenSt: -1, snaps: [], evq: [], clk: 0, camPos: null, spec: -1, cd: -1, tkAcc: 0 }, o);
      Mt.md = MODES[Mt.mode];
      R.buildMapScene(Mt.M, Mt.myTeam); R.setRoster(roster(Mt.players)); R.resetCam();
      state = 'play'; clearScr(); hudShow(true); mmDirty = true;
      const hs = htEl.children, show = Mt.mode === 'show';
      const ic = Mt.mode === 'gem' ? GEMI : Mt.mode === 'ball' ? BALLI : SKI;
      hs[0].innerHTML = ic + '<span>0</span>'; hs[2].innerHTML = ic + '<span>0</span>';
      hs[0].className = 'bs-hs ' + (show ? 'sho' : 't0'); hs[2].hidden = show; hs[1].hidden = show;
      hs[1].querySelector('small').textContent = 'TIME';
      mmEl.hidden = !show; cdEl.hidden = true;
      if (!coarse && !ctlEl.querySelector('.bs-hint')) { ctlEl.querySelector('.bs-ab').append(el('<div class="bs-hint">Click / Space</div>')); ctlEl.querySelector('.bs-sb').append(el('<div class="bs-hint">Right click / E</div>')); }
      banner(Mt.md.name, Mt.resumed ? 'Match resumed' : Mt.md.blurb, 2.6);
      api.timeout(() => { try { wrap.focus({ preventScroll: true }); } catch (e) {} }, 50);
    }

    function hostInfo(S) { return { st: S.state, stT: S.stT, left: S.left, ot: S.ot, sc: S.score, cd: S.cd, g: S.g || [0, 0], shown: S.shown, pr: S.poison ? S.poison.r : 0, tm: S.time, win: S.win }; }
    function hostView(alpha) {
      const S = Mt.S, demo = Mt.role === 'demo', myTeam = Mt.myTeam, M = S.M;
      const brs = S.brs.map(b => {
        const d = BR[b.br], J = b.jmp, vis = demo || b.team === myTeam || canSee(S, myTeam, b);
        return { i: b.i, name: b.name, br: b.br, team: b.team, x: lerp(b.px, b.x, alpha), y: lerp(b.py, b.y, alpha), face: b.face, hp: b.hp, mhp: b.mhp, alive: b.alive, vis: vis && (b.alive || S.time - b.dieT < 1.3), mv: b.mv, bush: tileAt(M, Math.floor(b.x), Math.floor(b.y)) === T_BUSH, shield: b.shield, stun: b.stun, dash: !!b.dash, jmp: J ? J.t / J.dur : 0, kind: J ? J.kind : '', gems: b.gems, cubes: b.cubes, ball: b.ball, ammo: b.ammo + (b.ammo < d.ammo ? b.rl / d.reload : 0), mam: d.ammo, supR: b.supR, sup: b.sup, resp: b.resp };
      });
      return {
        brs, me: Mt.me, myTeam, mode: Mt.mode,
        items: S.items.map(it => ({ id: it.id, k: it.k, x: it.x, y: it.y, age: it.age })),
        proj: S.proj.map(p => ({ id: p.id, st: p.st, x: lerp(p.px, p.x, alpha), y: lerp(p.py, p.y, alpha), vx: p.vx, vy: p.vy, lob: !!p.lob, big: p.big, f: p.lob ? Math.min(1, p.lob.t / p.lob.dur) : 0, life: p.range ? clamp((p.range - p.left) / p.range, 0, 1) : 0 })),
        ball: S.ball ? { x: lerp(S.ball.px, S.ball.x, alpha), y: lerp(S.ball.py, S.ball.y, alpha), vx: S.ball.vx, vy: S.ball.vy, car: S.ball.car } : null,
        zones: S.zones.map(z => ({ x: z.x, y: z.y, r: z.r })),
        turrets: S.turrets.map(t => ({ id: t.id, x: t.x, y: t.y, ang: t.ang, team: t.team, hp: t.hp, mhp: t.mhp })),
        poison: S.poison ? { cx: S.poison.cx, cy: S.poison.cy, r: S.poison.r } : null
      };
    }

    function hostTick() {
      const S = Mt.S;
      if (Mt.role !== 'demo') {
        const b = S.brs[Mt.me];
        if (b) {
          const inp = sampleInput(); b.in.mx = inp.mx; b.in.my = inp.my; b.in.aim = inp.aim;
          const f = takeFire(); if (f) { b.in.fireNow = 1; b.in.fa = f.a; b.in.fd = f.d; }
          const s = takeSup(); if (s) { b.in.supNow = 1; b.in.sa = s.a; b.in.sd = s.d; }
        }
      }
      step(S, botFn);
      if (S.ev.length) {
        const evs = S.ev; S.ev = [];
        if (Mt.role === 'host') netSendEv(S.tk, evs);
        for (const e of evs) Mt.pendEv.push(e);
      }
      if (Mt.role === 'host') { if (S.tk % 2 === 0) netSendSnaps(); if (S.tk % 60 === 0) saveRes(); }
    }

    function camTarget(view, dt) {
      const me = view.brs[Mt.me];
      let x, y;
      if (Mt.role === 'demo') {
        Mt.followT -= dt;
        const al = view.brs.filter(b => b.alive);
        if (Mt.followT <= 0 || !view.brs[Mt.follow] || !view.brs[Mt.follow].alive) { Mt.followT = 5; if (al.length) Mt.follow = pick(al).i; }
        const f = view.brs[Mt.follow]; x = f.x; y = f.y;
      } else if (me && me.alive) { x = me.x; y = me.y; Mt.camPos = [x, y]; Mt.spec = -1; }
      else {
        if (view.mode === 'show') {
          let t = view.brs[Mt.spec];
          if (!t || !t.alive || !t.vis) { t = view.brs.find(b => b.alive && b.vis && b.i !== Mt.me); Mt.spec = t ? t.i : -1; }
          if (t) Mt.camPos = [t.x, t.y];
        }
        const p = Mt.camPos || [Mt.M.W / 2, Mt.M.H / 2]; x = p[0]; y = p[1];
      }
      return { x, y, visW: por ? 10.5 : 17.5 };
    }

    function buildMM() {
      const M = Mt.M, c = document.createElement('canvas'); c.width = c.height = 130;
      const x = c.getContext('2d'), s = 130 / M.W;
      x.fillStyle = TH_BG(M); x.fillRect(0, 0, 130, 130);
      for (let j = 0; j < M.H; j++) for (let i = 0; i < M.W; i++) {
        const t = M.t[j * M.W + i]; if (!t) continue;
        x.fillStyle = t === 1 ? '#6a6f78' : t === 2 ? '#9a6a38' : t === 3 ? '#2f8f3a' : t === 4 ? '#2f9fd0' : t === 6 ? '#b46bff' : '#fff';
        x.fillRect(i * s, j * s, s + .6, s + .6);
      }
      mmBase = c; mmDirty = false;
    }
    const TH_BG = M => THEMES[M.theme].g1;
    function drawMM(view) {
      if (mmDirty || !mmBase) buildMM();
      const x = mmEl.getContext('2d'), M = Mt.M, s = 130 / M.W;
      x.drawImage(mmBase, 0, 0);
      if (view.poison && view.poison.r < 80) {
        x.save(); x.beginPath(); x.rect(0, 0, 130, 130); x.arc(view.poison.cx * s, view.poison.cy * s, Math.max(0, view.poison.r * s), 0, TAU, true);
        x.fillStyle = 'rgba(90,255,40,.42)'; x.fill('evenodd'); x.restore();
        x.strokeStyle = '#c8ff6a'; x.lineWidth = 1.2; x.beginPath(); x.arc(view.poison.cx * s, view.poison.cy * s, Math.max(0, view.poison.r * s), 0, TAU); x.stroke();
      }
      for (const b of view.brs) {
        if (!b.alive || !b.vis) continue;
        x.fillStyle = b.i === view.me ? '#fff' : '#ff4a52'; x.strokeStyle = '#000'; x.lineWidth = 1;
        x.beginPath(); x.arc(b.x * s, b.y * s, b.i === view.me ? 3.6 : 2.8, 0, TAU); x.fill(); x.stroke();
      }
    }

    function updHud(info, view) {
      const hs = htEl.children, mine = Mt.myTeam, oth = 1 - mine, show = Mt.mode === 'show';
      const set = (e, v) => { const sp = e.querySelector('span'); const t = String(v); if (sp.textContent !== t) sp.textContent = t; };
      if (show) { set(hs[0], info.shown); }
      else {
        if (Mt.mode === 'gem') { set(hs[0], info.g[mine] + '/' + GEM_WIN); set(hs[2], info.g[oth] + '/' + GEM_WIN); }
        else { set(hs[0], info.sc[mine]); set(hs[2], info.sc[oth]); }
        const tt = fmtT(info.left), tm = hs[1].firstChild; if (tm.textContent !== tt) tm.textContent = tt;
        const lb = info.ot ? 'OVERTIME' : 'TIME', sm = hs[1].lastChild; if (sm.textContent !== lb) sm.textContent = lb;
      }
      if (Mt.mode === 'gem') {
        let ct = -1, who = 0;
        for (const t of [mine, oth]) if (info.cd[t] >= 0) { ct = info.cd[t]; who = t; break; }
        if (ct >= 0) { cdEl.hidden = false; const tx = (who === mine ? 'Hold ' : 'Stop them! ') + GEM_WIN + ' gems · ' + Math.ceil(ct); if (cdEl.textContent !== tx) cdEl.textContent = tx; cdEl.className = 'bs-cd ot ' + (who === mine ? 't0' : 't1'); if (Mt.cd !== Math.ceil(ct)) { Mt.cd = Math.ceil(ct); if (Mt.cd <= 5) AU.play('tick'); } } else { cdEl.hidden = true; Mt.cd = -1; }
      }
      if (info.st !== Mt.seenSt || (info.st === 0 && Math.ceil(info.stT) !== Mt.seenN)) {
        if (info.st === 0) { const n = Math.ceil(info.stT); if (n <= 3 && n >= 1) { banner(String(n), n === 3 ? Mt.md.name : '', .9); AU.play('count'); } Mt.seenN = n; }
        if (info.st === 3 && Mt.seenSt !== 3) {
          const me = view.brs[Mt.me];
          if (Mt.mode === 'show') banner(me && me.alive ? 'VICTORY' : 'GAME OVER', '', 2.8);
          else banner(info.win < 0 ? 'DRAW' : info.win === mine ? 'VICTORY' : 'DEFEAT', '', 2.8);
        }
        Mt.seenSt = info.st;
      }
      if (show) {
        const me = view.brs[Mt.me]; hs[1].hidden = true;
        if (info.pr < 80 && !Mt.pz) { Mt.pz = 1; banner('Poison closing in', 'Stay inside the safe area', 2); AU.play('poison'); }
      }
    }
    function updCtl(me) {
      const ab = ctlEl.querySelector('.bs-ab'), sb = ctlEl.querySelector('.bs-sb');
      if (!me) return;
      const bs = ab.querySelectorAll('.am i b');
      for (let q = 0; q < 3; q++) { const w = (clamp(me.ammo - q, 0, 1) * 100).toFixed(0) + '%'; if (bs[q].style.width !== w) bs[q].style.width = w; }
      const off = (289 * (1 - clamp(me.sup, 0, 1))).toFixed(0);
      const c = sb.querySelector('circle'); if (c.style.strokeDashoffset !== off) c.style.strokeDashoffset = off;
      sb.classList.toggle('rdy', !!me.supR);
    }

    function handleEv(ev, view) {
      R.fx(ev, view);
      if (Mt.role === 'demo') return;
      const k = ev[0], me = Mt.me, brs = view.brs;
      switch (k) {
        case 'f': { const b = brs[ev[1]]; if (!b) break; if (ev[3] === 2) AU.play('whoosh', b.x, b.y, .8); else AU.atk(b.br, ev[3] === 1, b.x, b.y, ev[1] === me); break; }
        case 'd': { if (ev[1] === me) AU.play('hurt'); else AU.play('hit', ev[3], ev[4], ev[5] === me ? 1 : .6); break; }
        case 'h': AU.play('heal', ev[3], ev[4], .7); break;
        case 'x': { const st = ev[4]; AU.play(st === 20 ? 'heal' : st >= 22 || ev[5] ? 'boom' : st === 21 ? 'pop' : 'blast', ev[1], ev[2], 1); break; }
        case 'w': AU.play('wall', (ev[1] % Mt.M.W) + .5, (ev[1] / Mt.M.W | 0) + .5, 1); mmDirty = true; break;
        case 'k': {
          AU.play('ko', ev[3], ev[4], 1);
          const v = brs[ev[1]], s = ev[2] >= 0 ? brs[ev[2]] : null;
          if (v) feed(s ? `<b style="color:#ffd21f">${esc(s.name)}</b> KO'd ${esc(v.name)}` : `${esc(v.name)} was poisoned`);
          if (ev[1] === me && Mt.mode === 'show') banner('ELIMINATED', '', 2.2);
          break;
        }
        case 'p': AU.play(ev[2] ? 'cube' : 'gem', ev[3], ev[4], ev[1] === me ? 1 : .6); break;
        case 'sr': if (ev[1] === me) AU.play('sup'); break;
        case 'go': banner('GO!', '', 1.2); AU.play('go'); break;
        case 'cd': if (ev[2]) { banner(ev[1] === Mt.myTeam ? 'HOLD ON!' : 'STOP THEM!', 'Gem countdown', 1.6); AU.play('whistle'); } break;
        case 'ot': banner('OVERTIME', '', 1.8); AU.play('whistle'); break;
        case 'goal': banner(ev[1] === Mt.myTeam ? 'GOAL!' : 'ENEMY GOAL', '', 2); AU.play('goal'); break;
        case 'bn': case 'bb': AU.play('bounce', ev[1], ev[2], .6); break;
        case 'bp': break;
        case 'end': AU.play('whistle'); break;
      }
    }

    function frame(dt) {
      if (dead) return;
      if (!Mt) { return; }
      let view, info;
      if (Mt.role === 'guest') { const g = guestFrame(dt); if (!g) { R.frame(emptyView(), dt, { x: 16, y: 10, visW: 17.5 }); return; } view = g.view; info = g.info; }
      else {
        const S = Mt.S;
        if (!Mt.paused) { Mt.acc += dt; let n = 0; while (Mt.acc >= DT && n < 4) { hostTick(); Mt.acc -= DT; n++; } if (Mt.acc > DT * 2) Mt.acc = 0; }
        view = hostView(Mt.acc / DT); info = hostInfo(S);
        if (Mt.role === 'demo' && S.over) { startDemo(); return; }
        if (Mt.role !== 'demo' && S.over && !Mt.ended && state === 'play') { Mt.ended = 1; finishHost(); }
      }
      Mt.lastView = view;
      const evs = Mt.role === 'guest' ? g_takeEv() : Mt.pendEv.splice(0);
      const cam = camTarget(view, dt); cam.snap = Mt.role === 'guest' ? false : false;
      for (const e of evs) handleEv(e, view);
      const me = view.brs[Mt.me];
      if (Mt.role !== 'demo') {
        updHud(info, view); updCtl(me);
        if (Mt.mode === 'show') drawMM(view);
        AU.setListener(cam.x, cam.y);
        if (state === 'play' && me && me.alive && !Mt.paused) {
          const inp = sampleInput();
          if (inp.show) R.setAim({ br: me.br, sup: inp.sup, x: me.x, y: me.y, ang: inp.aim, dist: inp.dist, hold: inp.hold }); else R.setAim(null);
        } else R.setAim(null);
      }
      R.frame(view, Mt.paused ? 0 : dt, cam);
    }
    const emptyView = () => ({ brs: [], me: -1, myTeam: 0, mode: 'gem', items: [], proj: [], zones: [], turrets: [], poison: null, ball: null });
    api.loop(frame);

    function finishHost() {
      const S = Mt.S, res = S.res || buildResult(S, S.win);
      clearRes(); Mt.res = res;
      if (Mt.role === 'host') { netSendAll({ t: 'res', r: res }); showEnd(res, Mt.me, 'host'); }
      else showEnd(res, Mt.me, null);
    }


    const NET = { bound: false, role: null, r: null, hum: [], mode: 'gem', mapIdx: 0, end: 0, phase: '', tryResume: api.net.invite === 'NEW', rdy: false, lastBr: -1 };
    const NET_DELAY = 4, r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
    const isHost = () => NET.role === 'host';
    const netSendEv = (k, e) => { try { api.net.send({ t: 'ev', k, e }); } catch (x) {} };
    const netSendAll = m => { try { api.net.send(m); } catch (x) {} };

    function makeSnap(S, rb) {
      const t = rb.team, M = S.M;
      const brs = S.brs.map(b => {
        const vis = b.team === t || canSee(S, t, b);
        if (!vis || (!b.alive && S.time - b.dieT > 1.3 && b.team !== t)) return [b.i];
        const d = BR[b.br], J = b.jmp;
        const fl = (b.alive ? 1 : 0) | (b.mv ? 2 : 0) | (b.shield > 0 ? 4 : 0) | (b.stun > 0 ? 8 : 0) | (b.supR ? 16 : 0) | (b.ball ? 32 : 0) | (b.dash ? 64 : 0) | (tileAt(M, Math.floor(b.x), Math.floor(b.y)) === T_BUSH ? 128 : 0) | (J && J.kind === 'hop' ? 256 : 0);
        return [b.i, r2(b.x), r2(b.y), r3(b.face), Math.round(b.hp), Math.round(b.mhp), r2(b.ammo + (b.ammo < d.ammo ? b.rl / d.reload : 0)), r3(b.sup), fl, b.gems, b.cubes, J ? r2(J.t / J.dur) : 0, r1(b.resp)];
      });
      return {
        t: 's', k: S.tk, a: rb.ack | 0,
        m: [S.state, r2(S.stT), r1(S.left), S.ot ? 1 : 0, S.score[0], S.score[1], S.cd[0] < 0 ? -1 : r1(S.cd[0]), S.cd[1] < 0 ? -1 : r1(S.cd[1]), S.g ? S.g[0] : 0, S.g ? S.g[1] : 0, S.shown, S.poison ? r1(S.poison.r) : 0, r1(S.time), S.win],
        b: brs,
        i: S.items.map(it => [it.id, it.k, r2(it.x), r2(it.y), r2(it.age)]),
        p: S.proj.map(p => [p.id, p.st, r2(p.x), r2(p.y), r1(p.vx), r1(p.vy), (p.lob ? 1 : 0) | (p.big ? 2 : 0), p.lob ? r2(Math.min(1, p.lob.t / p.lob.dur)) : 0, p.range ? r2(clamp((p.range - p.left) / p.range, 0, 1)) : 0]),
        z: S.zones.map(z => [z.id, r2(z.x), r2(z.y), r2(z.r)]),
        u: S.turrets.map(u => [u.id, u.team, r2(u.x), r2(u.y), Math.round(u.hp), u.mhp, r2(u.ang)]),
        l: S.ball ? [r2(S.ball.x), r2(S.ball.y), r1(S.ball.vx), r1(S.ball.vy), S.ball.car] : 0
      };
    }
    function netSendSnaps() {
      const S = Mt.S;
      for (const b of S.brs) if (b.human && b.pid && b.pid !== api.net.id) { try { api.net.sendTo(b.pid, makeSnap(S, b), true); } catch (x) {} }
    }
    function startMsg(i) {
      return { t: 'start', mode: Mt.mode, map: Mt.def.id, seed: Mt.seed, pl: Mt.players.map(p => [p.name, p.br, p.team]), me: i, gone: Mt.S.M.gone.slice(), lvl: Mt.lvl };
    }
    function saveRes() {
      if (!Mt || Mt.role !== 'host' || !api.net.code) return;
      try {
        sessionStorage.setItem(resKey(), JSON.stringify({ v: 1, mode: Mt.mode, def: Mt.def.id, seed: Mt.seed, lvl: Mt.lvl, t: Date.now(), pl: Mt.players.map((p, i) => ({ name: p.name, br: p.br, team: p.team, human: !!p.human, pid: p.pid || null, h: i === Mt.me ? 1 : 0 })), sim: saveSim(Mt.S) }));
      } catch (x) {}
    }
    api.on(window, 'pagehide', saveRes);
    function loadRes() {
      try { const o = JSON.parse(sessionStorage.getItem(resKey())); if (o && o.v === 1 && Date.now() - o.t < 600000 && o.sim && o.sim.v === SAVE_V) return o; } catch (x) {}
      return null;
    }

    function guestSeen(h) { return h.id; }
    function bindNet() {
      if (NET.bound) return; NET.bound = true;
      api.net.on('data', (m, from) => { try { onNetData(m, from); } catch (e) { console.error(e); } });
      api.net.on('leave', p => { if (isHost()) hostLeave(p); });
      api.net.on('rejoin', p => { if (isHost()) hostRejoin(p); });
      api.net.on('lobby', () => { if (NET.role === 'guest' && !dead) goOnline(); });
      api.net.on('close', why => {
        if (NET.role !== 'guest' || dead) return;
        NET.role = null;
        msgScreen(why === 'kicked' ? 'Removed from party' : why === 'lost' ? 'Connection lost' : 'Party closed', why === 'kicked' ? 'The host removed you from this party.' : why === 'lost' ? 'Check your internet connection and join again.' : 'The host left, so the party ended.', [['Home', () => showHome(), 'y']]);
      });
      api.interval(() => { if (NET.role === 'host' && NET.phase === 'pick') pickTick(); }, 400);
    }

    async function goOnline() {
      if (dead) return;
      leaveMatchState(true); hudShow(false); state = 'wait';
      setScr(el('<div class="bs-scr"><div class="bs-msg ot">Opening party…</div></div>'));
      bindNet();
      let r = null;
      try { r = await api.net.room(NET_O); } catch (e) { r = null; }
      if (dead || !api.alive) return;
      if (!r) { NET.role = null; showHome(); return; }
      NET.role = r.role; NET.r = r;
      if (r.role === 'host') hostEnter(r); else if (!(Mt && Mt.role === 'guest')) guestEnter();
    }
    function leaveOnline() {
      clearRes();
      try { api.net.close(); } catch (e) {}
      NET.role = null; NET.phase = ''; showHome();
    }

    function hostEnter(r) {
      NET.hum = r.players.map(p => ({ id: p.id, name: p.name, br: p.id === api.net.id ? selIdx() : -1, rdy: false }));
      const saved = NET.tryResume ? loadRes() : null;
      NET.tryResume = false;
      if (saved && MAPS[saved.mode]) {
        NET.phase = 'resume';
        msgScreen('Resume game?', 'A match was running before you refreshed.', [['Resume game', () => hostResume(saved), 'y'], ['New game', () => { clearRes(); hostPick(); }, '']]);
        return;
      }
      hostPick();
    }
    function hostResume(sv2) {
      const r = NET.r, def = MAPS[sv2.mode].find(d => d.id === sv2.def) || MAPS[sv2.mode][0];
      const pl = sv2.pl.map(p => {
        let human = false, pid = null;
        if (p.human) { if (p.h) { human = true; pid = api.net.id; } else { pid = p.pid; human = !!r.players.find(q => q.id === p.pid); } }
        return { name: p.name, br: p.br, team: p.team, human, pid };
      });
      const me = pl.findIndex(p => p.pid === api.net.id);
      NET.phase = 'play';
      startHostMatch({ role: 'host', mode: sv2.mode, def, seed: sv2.seed, players: pl, lvl: sv2.lvl, me: me < 0 ? 0 : me, saved: sv2.sim });
      pl.forEach((p, i) => { if (p.human && p.pid !== api.net.id) { try { api.net.sendTo(p.pid, startMsg(i)); } catch (x) {} } });
    }
    function hostPick() {
      NET.phase = 'pick'; NET.mode = sv.mode; NET.mapIdx = sv.maps[sv.mode];
      NET.hum.forEach(h => { h.rdy = false; });
      NET.end = performance.now() + 30000;
      showPick(); hostBroadcastSel();
    }
    function hostRematch() { leaveMatchState(true); hostPick(); }
    function hostBroadcastSel() {
      const mp = MAPS[NET.mode];
      netSendAll({ t: 'sel', mode: NET.mode, map: mp[NET.mapIdx % mp.length].id, pl: NET.hum.map(h => [h.id, h.name, h.br, h.rdy ? 1 : 0]), left: Math.max(0, (NET.end - performance.now()) / 1000) });
    }
    function pickTick() {
      const left = (NET.end - performance.now()) / 1000;
      if (state === 'pick') updPick(left);
      const allR = NET.hum.length && NET.hum.every(h => h.rdy);
      if (left <= 0 || allR) hostStart();
      else if (Math.floor(left) % 3 === 0 && !NET.sent3) { NET.sent3 = 1; hostBroadcastSel(); } else if (Math.floor(left) % 3 !== 0) NET.sent3 = 0;
    }
    function hostStart() {
      if (NET.phase !== 'pick') return;
      NET.phase = 'play';
      const r = NET.r, mode = NET.mode, md = MODES[mode], mp = MAPS[mode], def = mp[NET.mapIdx % mp.length], pool = shuffle([...BR.keys()]), names = shuffle(NAMES.slice());
      const pl = [];
      NET.hum.forEach((h, i) => pl.push({ name: h.name, br: h.br >= 0 ? h.br : pool[i % pool.length], team: mode === 'show' ? i : i % 2, human: true, pid: h.id }));
      if (r.bots) {
        const total = md.teams * md.per; let k = 0;
        if (mode === 'show') while (pl.length < total) { pl.push({ name: names[k++ % names.length], br: pool[(pl.length + 3) % pool.length], team: pl.length, human: false }); }
        else { const cnt = [0, 0]; pl.forEach(p => cnt[p.team]++); while (cnt[0] < md.per || cnt[1] < md.per) { const t = cnt[0] <= cnt[1] ? 0 : 1; const tt = cnt[t] < md.per ? t : 1 - t; pl.push({ name: names[k++ % names.length], br: pool[(pl.length + 3) % pool.length], team: tt, human: false }); cnt[tt]++; } }
      }
      const seed = Math.random() * 1e9 | 0;
      startHostMatch({ role: 'host', mode, def, seed, players: pl, lvl: sv.lvl, me: 0 });
      pl.forEach((p, i) => { if (p.human && p.pid !== api.net.id) { try { api.net.sendTo(p.pid, startMsg(i)); } catch (x) {} } });
      saveRes();
    }
    function hostLeave(p) {
      NET.hum = NET.hum.filter(h => h.id !== p.id);
      if (Mt && Mt.role === 'host') {
        const b = Mt.S.brs.find(q => q.pid === p.id);
        if (b && b.human) { b.human = false; b.bot = {}; b.iq = []; b.in.mx = b.in.my = 0; api.toast(esc(b.name) + ' left. A bot takes over.'); }
      } else if (NET.phase === 'pick') { hostBroadcastSel(); if (state === 'pick') updPick((NET.end - performance.now()) / 1000); }
    }
    function reseat(b) { b.human = true; b.bot = null; b.iq = []; b.fc = 0; b.sc = 0; b.lastS = 0; b.in.mx = b.in.my = 0; }
    function hostRejoin(p) {
      if (Mt && Mt.role === 'host' && NET.phase === 'play' && !Mt.ended) {
        const i = Mt.S.brs.findIndex(q => q.pid === p.id);
        if (i >= 0) { reseat(Mt.S.brs[i]); try { api.net.sendTo(p.id, startMsg(i)); } catch (x) {} }
      } else if (NET.phase === 'pick') {
        if (!NET.hum.find(h => h.id === p.id)) NET.hum.push({ id: p.id, name: p.name, br: -1, rdy: false });
        hostBroadcastSel();
      } else if (Mt && Mt.res) { try { api.net.sendTo(p.id, { t: 'res', r: Mt.res }); } catch (x) {} }
    }

    function guestEnter() {
      NET.phase = 'guest'; state = 'wait';
      msgScreen('Joined party', 'Waiting for the host to pick a mode…', [['Leave', () => leaveOnline(), 'r']]);
      sendPick(false);
    }
    function sendPick(rdy) { if (NET.role === 'guest') { try { api.net.send({ t: 'pick', br: selIdx(), rdy: rdy ? 1 : 0 }); } catch (x) {} } }

    function onNetData(m, from) {
      if (!m || typeof m !== 'object') return;
      if (isHost()) {
        if (m.t === 'pick') {
          const h = NET.hum.find(q => q.id === from);
          if (Mt && Mt.role === 'host' && NET.phase === 'play' && !Mt.ended) { const i = Mt.S.brs.findIndex(q => q.pid === from); if (i >= 0) { reseat(Mt.S.brs[i]); try { api.net.sendTo(from, startMsg(i)); } catch (x) {} } }
          else if (h && NET.phase === 'pick') { if (m.br >= 0 && m.br < BR.length) h.br = m.br | 0; h.rdy = !!m.rdy; hostBroadcastSel(); if (state === 'pick') updPick((NET.end - performance.now()) / 1000); }
        } else if (m.t === 'in') {
          if (!Mt || Mt.role !== 'host') return;
          const b = Mt.S.brs.find(q => q.pid === from);
          if (!b || !b.human || !Array.isArray(m.i)) return;
          for (const q of m.i) {
            if (!Array.isArray(q) || q.length < 10 || !(q[0] > (b.lastS || 0))) continue;
            b.lastS = q[0];
            const it = { s: q[0], mx: clamp(+q[1] || 0, -1, 1), my: clamp(+q[2] || 0, -1, 1), aim: +q[3] || 0, f: q[4] | 0, fa: +q[5] || 0, fd: +q[6] || 0, sc: q[7] | 0, sa: +q[8] || 0, sd: +q[9] || 0 };
            b.iq.push(it);
          }
          while (b.iq.length > 4) { const d = b.iq.shift(), n = b.iq[0]; if (d.f > n.f) { n.f = d.f; n.fa = d.fa; n.fd = d.fd; } if (d.sc > n.sc) { n.sc = d.sc; n.sa = d.sa; n.sd = d.sd; } }
        }
        return;
      }
      switch (m.t) {
        case 'sel': {
          if (NET.role !== 'guest') return;
          if (state !== 'pick') { leaveMatchState(true); NET.phase = 'guest'; NET.mode = m.mode; NET.mapId = m.map; NET.hum = m.pl.map(a => ({ id: a[0], name: a[1], br: a[2], rdy: !!a[3] })); NET.end = performance.now() + m.left * 1000; NET.rdy = false; showPick(); sendPick(false); }
          else { NET.mode = m.mode; NET.mapId = m.map; NET.hum = m.pl.map(a => ({ id: a[0], name: a[1], br: a[2], rdy: !!a[3] })); NET.end = performance.now() + m.left * 1000; updPick(m.left); }
          break;
        }
        case 'start': guestBegin(m); break;
        case 's': onSnap(m); break;
        case 'ev': onEv(m); break;
        case 'res': if (Mt && Mt.role === 'guest' && !Mt.ended) { Mt.ended = 1; Mt.res = m.r; showEnd(m.r, Mt.me, 'guest'); } break;
      }
    }

    function guestBegin(m) {
      if (Mt && Mt.role === 'guest' && Mt.seed === m.seed && state === 'play') return;
      const mp = MAPS[m.mode] || MAPS.gem, def = mp.find(d => d.id === m.map) || mp[0];
      const M = buildMap(def, m.seed | 0);
      for (const k of m.gone || []) { M.t[k] = 0; M.hp[k] = 0; M.gone.push(k); }
      const players = m.pl.map(a => ({ name: a[0], br: a[1], team: a[2], human: true }));
      NET.phase = 'guest';
      beginMatch({ role: 'guest', mode: m.mode, M, players, me: m.me, myTeam: players[m.me].team, def, seed: m.seed, lvl: m.lvl, pred: null, off: { x: 0, y: 0 }, pend: [], isq: 0, fc: 0, sc: 0, fa: 0, fd: 0, sa: 0, sd: 0, last3: [], gacc: 0, clkInit: false, usePred: false, myFace: null, faceT: 0, myMv: 0 });
    }
    function onEv(m) {
      if (!Mt || Mt.role !== 'guest') return;
      for (const e of m.e) { if (e[0] === 'w') { Mt.M.t[e[1]] = 0; Mt.M.hp[e[1]] = 0; } else if (e[0] === 'tw') Mt.M.hp[e[1]] = e[2]; }
      Mt.evq.push(m);
    }
    function g_takeEv() {
      const out = [];
      while (Mt.evq.length && Mt.evq[0].k <= Mt.clk) { for (const e of Mt.evq.shift().e) out.push(e); }
      if (Mt.evq.length > 80) { for (const q of Mt.evq.splice(0, Mt.evq.length - 40)) for (const e of q.e) out.push(e); }
      return out;
    }
    function onSnap(m) {
      if (!Mt || Mt.role !== 'guest' || Mt.ended) return;
      const sn = Mt.snaps;
      if (sn.length && m.k <= sn[sn.length - 1].k) return;
      sn.push(m); if (sn.length > 12) sn.shift();
      const target = m.k - NET_DELAY;
      if (!Mt.clkInit || Math.abs(Mt.clk - target) > 10) { Mt.clk = target; Mt.clkInit = true; } else Mt.clk += (target - Mt.clk) * .12;
      const my = m.b[Mt.me]; if (!my || my.length < 10) return;
      const fl = my[8], alive = !!(fl & 1), special = !!(fl & (8 | 64 | 256)) || my[11] > 0;
      Mt.myFl = fl; Mt.myAlive = alive;
      if (!Mt.pred) Mt.pred = { x: my[1], y: my[2] };
      if (!alive || special) { Mt.pred = { x: my[1], y: my[2] }; Mt.pend = []; Mt.off = { x: 0, y: 0 }; Mt.usePred = false; return; }
      const ox = Mt.pred.x, oy = Mt.pred.y, spd = BR[Mt.players[Mt.me].br].spd;
      Mt.pred = { x: my[1], y: my[2] };
      Mt.pend = Mt.pend.filter(p => p.s > m.a);
      for (const p of Mt.pend) snapMove(Mt.M, Mt.pred, p.mx, p.my, spd);
      const dx = Mt.pred.x - ox, dy = Mt.pred.y - oy;
      if (!Mt.usePred || hyp(dx, dy) > 2) Mt.off = { x: 0, y: 0 }; else { Mt.off.x -= dx; Mt.off.y -= dy; }
      Mt.usePred = true;
    }
    function guestTick() {
      const inp = sampleInput(), f = takeFire(), s = takeSup(), now = performance.now();
      const mx = r2(inp.mx), my = r2(inp.my);
      Mt.isq++;
      if (f) { Mt.fc++; Mt.fa = f.a; Mt.fd = f.d; Mt.faceT = now; Mt.myFace = f.a; }
      if (s) { Mt.sc++; Mt.sa = s.a; Mt.sd = s.d; Mt.faceT = now; Mt.myFace = s.a; }
      Mt.myMv = hyp(mx, my) > .05 ? 1 : 0;
      if (Mt.myMv && now - Mt.faceT > 450) Mt.myFace = Math.atan2(my, mx);
      Mt.last3.push([Mt.isq, mx, my, r3(inp.aim), Mt.fc, r3(Mt.fa), r2(Mt.fd), Mt.sc, r3(Mt.sa), r2(Mt.sd)]);
      if (Mt.last3.length > 3) Mt.last3.shift();
      if (Mt.usePred && Mt.pred) { snapMove(Mt.M, Mt.pred, mx, my, BR[Mt.players[Mt.me].br].spd); Mt.pend.push({ s: Mt.isq, mx, my }); if (Mt.pend.length > 90) Mt.pend.shift(); }
      try { api.net.send({ t: 'in', i: Mt.last3 }, !(f || s)); } catch (x) {}
    }
    function guestFrame(dt) {
      const sn = Mt.snaps; if (!sn.length) return null;
      if (!Mt.ended) {
        Mt.gacc += dt; let n = 0; while (Mt.gacc >= DT && n < 4) { guestTick(); Mt.gacc -= DT; n++; } if (Mt.gacc > DT * 2) Mt.gacc = 0;
      }
      Mt.clk += dt * 30;
      const k = Math.exp(-dt * 12); Mt.off.x *= k; Mt.off.y *= k;
      const last = sn[sn.length - 1];
      let A = sn[0], B = sn[0];
      for (let i = sn.length - 1; i >= 0; i--) if (sn[i].k <= Mt.clk) { A = sn[i]; B = sn[i + 1] || sn[i]; break; }
      const f = A === B ? 0 : clamp((Mt.clk - A.k) / (B.k - A.k), 0, 1);
      const M = Mt.M, myTeam = Mt.myTeam;
      const brs = Mt.players.map((p, i) => {
        const ra = A.b[i] || [i], rb = B.b[i] || [i], lastR = last.b[i] || [i];
        const src = (f < .5 ? ra : rb).length > 1 ? (f < .5 ? ra : rb) : (rb.length > 1 ? rb : ra);
        const mkBase = () => ({ i, name: p.name, br: p.br, team: p.team, x: 0, y: 0, face: 0, hp: 0, mhp: 1, alive: false, vis: false, mv: 0, bush: false, shield: 0, stun: 0, dash: false, jmp: 0, kind: '', gems: 0, cubes: 0, ball: false, ammo: 0, mam: BR[p.br].ammo, supR: false, sup: 0, resp: 0 });
        const o = mkBase();
        if (src.length < 2) return o;
        const fl = src[8];
        o.vis = true; o.alive = !!(fl & 1); o.mv = (fl & 2) ? 1 : 0; o.shield = (fl & 4) ? 1 : 0; o.stun = (fl & 8) ? 1 : 0; o.supR = !!(fl & 16); o.ball = !!(fl & 32); o.dash = !!(fl & 64); o.bush = !!(fl & 128);
        o.hp = src[4]; o.mhp = src[5]; o.ammo = src[6]; o.sup = src[7]; o.gems = src[9]; o.cubes = src[10]; o.jmp = src[11]; o.kind = (fl & 256) ? 'hop' : src[11] > 0 ? 'leap' : ''; o.resp = src[12];
        if (ra.length > 1 && rb.length > 1) { o.x = lerp(ra[1], rb[1], f); o.y = lerp(ra[2], rb[2], f); o.face = ra[3] + angDiff(ra[3], rb[3]) * f; if (ra[11] > 0 && rb[11] > 0) o.jmp = lerp(ra[11], rb[11], f); }
        else { o.x = src[1]; o.y = src[2]; o.face = src[3]; }
        if (i === Mt.me && lastR.length > 1) {
          o.hp = lastR[4]; o.mhp = lastR[5]; o.ammo = lastR[6]; o.sup = lastR[7]; o.supR = !!(lastR[8] & 16); o.gems = lastR[9]; o.cubes = lastR[10]; o.ball = !!(lastR[8] & 32); o.resp = lastR[12];
          if (Mt.usePred && Mt.pred && Mt.myAlive) { o.x = Mt.pred.x + Mt.off.x; o.y = Mt.pred.y + Mt.off.y; o.mv = Mt.myMv; if (Mt.myFace != null) o.face = Mt.myFace; }
        }
        return o;
      });
      const prevP = {}; for (const q of A.p) prevP[q[0]] = q;
      const proj = B.p.map(q => {
        const a = prevP[q[0]];
        let x = q[2], y = q[3];
        if (a && A !== B) { x = lerp(a[2], q[2], f); y = lerp(a[3], q[3], f); } else { const back = Math.max(0, B.k - Mt.clk) * DT; x -= q[4] * back; y -= q[5] * back; }
        return { id: q[0], st: q[1], x, y, vx: q[4], vy: q[5], lob: !!(q[6] & 1), big: (q[6] & 2) ? 1 : 0, f: a ? lerp(a[7], q[7], f) : q[7], life: q[8] };
      });
      const prevI = {}; for (const q of A.i) prevI[q[0]] = q;
      const items = B.i.map(q => { const a = prevI[q[0]]; return { id: q[0], k: q[1], x: a ? lerp(a[2], q[2], f) : q[2], y: a ? lerp(a[3], q[3], f) : q[3], age: q[4] }; });
      let ball = null;
      if (B.l) { const a = A.l || B.l; ball = { x: lerp(a[0], B.l[0], f), y: lerp(a[1], B.l[1], f), vx: B.l[2], vy: B.l[3], car: B.l[4] }; }
      const m = last.m;
      const view = {
        brs, me: Mt.me, myTeam, mode: Mt.mode, items, proj, ball,
        zones: B.z.map(z => ({ x: z[1], y: z[2], r: z[3] })),
        turrets: B.u.map(u => ({ id: u[0], team: u[1], x: u[2], y: u[3], hp: u[4], mhp: u[5], ang: u[6] })),
        poison: Mt.mode === 'show' ? { cx: M.W / 2, cy: M.H / 2, r: m[11] } : null
      };
      const info = { st: m[0], stT: m[1], left: m[2], ot: m[3], sc: [m[4], m[5]], cd: [m[6], m[7]], g: [m[8], m[9]], shown: m[10], pr: m[11], tm: m[12], win: m[13] };
      return { view, info };
    }

    function showPick() {
      state = 'pick'; hudShow(false);
      const host = isHost(), md = MODES[NET.mode];
      const mp = MAPS[NET.mode], def = host ? mp[NET.mapIdx % mp.length] : (mp.find(d => d.id === NET.mapId) || mp[0]);
      const s = setScr(el('<div class="bs-scr"></div>'));
      s.innerHTML = `<div class="bs-top"><div class="bs-logo" style="font-size:3.4em;text-shadow:${OT}"><span class="pm">${md.name}</span><b class="pn">${def.name}</b></div><div class="bs-pill ot"><span class="pt">30</span>s</div></div><div class="bs-body"><div class="bs-mid"><div class="bs-lbl ot">Pick your brawler</div><div class="bs-grid">${gridHtml()}</div></div><div class="bs-right">${host ? `<div class="bs-modes">${modeBtns()}</div><div class="bs-card"><div class="bs-mapnav"><button class="bs-btn s" data-a="mp" type="button">‹</button><span class="ot mn"></span><button class="bs-btn s" data-a="mn" type="button">›</button></div></div>` : ''}<div class="bs-card" style="flex:1"><div class="bs-lbl ot">Players</div><div class="bs-pl"></div></div><button class="bs-btn y big" data-a="rdy" type="button">READY</button><button class="bs-btn r" data-a="leave" type="button">Leave</button></div></div>`;
      const left = leftCard(); s.querySelector('.bs-body').prepend(left);
      const grid = s.querySelector('.bs-grid'); fillGrid(grid);
      s._upd = () => { markSel(grid, selIdx()); fillBr(left, selIdx()); };
      s._upd();
      s.addEventListener('click', e => {
        const t = e.target.closest('button'); if (!t) return;
        AU.unlock(); AU.play('click');
        if (t.dataset.b != null) {
          sv.sel = BR[+t.dataset.b].id; persist(); s._upd();
          if (host) { const h = NET.hum.find(q => q.id === api.net.id); if (h) { h.br = selIdx(); hostBroadcastSel(); } } else sendPick(NET.rdy);
          updPick((NET.end - performance.now()) / 1000);
        } else if (t.dataset.m && host) { NET.mode = t.dataset.m; sv.mode = NET.mode; NET.mapIdx = sv.maps[NET.mode]; persist(); NET.hum.forEach(h => { h.rdy = false; }); hostBroadcastSel(); updPick((NET.end - performance.now()) / 1000); }
        else if ((t.dataset.a === 'mp' || t.dataset.a === 'mn') && host) { const n = MAPS[NET.mode].length; NET.mapIdx = (NET.mapIdx + (t.dataset.a === 'mn' ? 1 : n - 1)) % n; sv.maps[NET.mode] = NET.mapIdx; persist(); NET.hum.forEach(h => { h.rdy = false; }); hostBroadcastSel(); updPick((NET.end - performance.now()) / 1000); }
        else if (t.dataset.a === 'rdy') {
          if (host) { const h = NET.hum.find(q => q.id === api.net.id); if (h) { h.rdy = !h.rdy; NET.rdy = h.rdy; hostBroadcastSel(); } }
          else { NET.rdy = !NET.rdy; sendPick(NET.rdy); }
          updPick((NET.end - performance.now()) / 1000);
        } else if (t.dataset.a === 'leave') leaveOnline();
      });
      updPick((NET.end - performance.now()) / 1000);
    }
    function updPick(left) {
      if (state !== 'pick' || !scr) return;
      const host = isHost(), mp = MAPS[NET.mode], def = host ? mp[NET.mapIdx % mp.length] : (mp.find(d => d.id === NET.mapId) || mp[0]);
      const q = sel => scr.querySelector(sel);
      q('.pm').textContent = MODES[NET.mode].name; q('.pn').textContent = def.name; q('.pt').textContent = Math.max(0, Math.ceil(left));
      const mn = q('.mn'); if (mn) mn.textContent = def.name;
      scr.querySelectorAll('.bs-mode').forEach(b => b.classList.toggle('on', b.dataset.m === NET.mode));
      const mine = NET.hum.find(h => h.id === (host ? api.net.id : api.net.id));
      q('.bs-pl').innerHTML = NET.hum.map(h => `<div class="${h.rdy ? 'rdy' : ''}"><span>${esc(h.name)}${h.id === api.net.id ? ' (you)' : ''}</span><em>${h.br >= 0 ? BR[h.br].name : '…'}${h.rdy ? ' ✓' : ''}</em></div>`).join('');
      const rb = q('[data-a="rdy"]'); rb.textContent = NET.rdy || (mine && mine.rdy) ? 'WAITING…' : 'READY'; rb.classList.toggle('g', !!(NET.rdy || (mine && mine.rdy)));
    }


    state = 'home';
    if (api.net.invite) goOnline(); else showHome();
    return () => {
      if (dead) return;
      dead = true;
      try { api.net.close(); } catch (e) {}
      try { ro && ro.disconnect(); } catch (e) {}
      try { AU.close(); } catch (e) {}
      try { R.dispose(); } catch (e) {}
    };
  }

  Ameplay.register({
    id: 'brawl-stars',
    title: 'Brawl Stars',
    category: 'Action',
    tint: '#ffb81f',
    blurb: 'Pick a brawler and fight 3v3 in Gem Grab and Brawl Ball or last alone in Showdown, with supers, bushes and bots.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · click or <kbd>Space</kbd> attack (aim with the mouse) · right click or <kbd>E</kbd> super · touch: left stick, drag the attack and super buttons to aim',
    better: 'high',
    width: 960,
    format: v => v + ' trophies',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="30" r="16"/><circle cx="26" cy="28" r="3" fill="currentColor" stroke="none"/><circle cx="38" cy="28" r="3" fill="currentColor" stroke="none"/><path d="M25 37q7 6 14 0"/><path d="M18 18l-5-8 9 4M46 18l5-8-9 4"/><path d="M20 52h24" stroke-width="4"/></svg>',
    css: CSS,
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'bs-wrap'; root.append(wrap);
      const ld = document.createElement('div'); ld.className = 'bs-load ot'; ld.textContent = 'Loading…'; wrap.append(ld);
      let cleanup = null, gone = false;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => {
        if (gone || !v || !api.alive) return;
        ld.remove();
        cleanup = run(root, wrap, api, v);
      });
      return { destroy() { gone = true; if (cleanup) cleanup(); } };
    }
  });
})();
