
(() => {
  'use strict';

  const CFG = {
    roll: 0.25,
    fallG: 26,
    fallTime: 1.3,
    tipAccel: 26,
    introTime: 0.7,
    introDrop: 0.38,
    blockDrop: 0.42,
    bridgeTime: 0.3,
    sinkTime: 0.75,
    outroTime: 1.15,
    bannerTime: 2.2,
    yaw: -0.34,
    pitch: 0.93,
    fov: 32,
    tile: 0.96,
    tileH: 0.24
  };

  const VOID = 0, FLOOR = 1, FRAG = 2, GOAL = 3, SOFT = 4, HEAVY = 5, SPLIT = 6, BRIDGE = 7;
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const LEVELS = [
    { name: 'First Steps', code: '388247', par: 9, m: [
      'oooo',
      'oSoooooo',
      'oooo  oooo',
      '      oGoo',
      '      oooo'] },
    { name: 'Lean and Lie', code: '868885', par: 11, m: [
      '      oG',
      '      ooo',
      'oo    ooo',
      'oooo oooo',
      'oooSooo',
      'ooooooo'] },
    { name: 'Stand Tall', code: '561788', par: 14, m: [
      ' oooooo',
      ' oooooooo',
      'oo oooooo',
      'oG oo oo',
      'o ooooo',
      'oooooS'] },
    { name: 'Cracked Glass', code: '684340', par: 14, m: [
      '       Soo',
      'G   oooooo',
      'foooooooo',
      'offo oooo',
      'ofooo o',
      ' fffooo'] },
    { name: 'Long Way Round', code: '314500', par: 18, m: [
      '   oo G',
      '   oooo',
      'ooooooo',
      'ooSo oo',
      '     oo'] },
    { name: 'Glass Garden', code: '714813', par: 18, m: [
      '  oooooff',
      ' ooo ffff',
      ' oooofoff',
      '  ooo   So',
      'oooooooGoo',
      'oooo',
      'oooo'] },
    { name: 'Open Sesame', code: '371864', par: 16, m: [
      'ooo oooooo',
      'A o ooSo o',
      'ooooooo oo',
      'ooooo11ooo',
      'ooooo oooo',
      'ooooo oo G'], s: { A: 'soft 1+' } },
    { name: 'Heavy Step', code: '932692', par: 19, m: [
      '         oG',
      '   oo11oooo',
      'oooo   oooo',
      'ooooo  oooo',
      'oHooo  oooo',
      '  Soo'], s: { H: 'heavy 1+' } },
    { name: 'The Gap', code: '159224', par: 21, m: [
      ' oS',
      ' ooo',
      ' ooo',
      ' oo',
      'oooo ooo',
      'oooooooo',
      '   oGoo'] },
    { name: 'Flip Switch', code: '985203', par: 20, m: [
      '  oo  ooooo',
      'oooff11ooooo',
      'ffofooo   Go',
      'ooo ooo    o',
      'oAo  Soooooo',
      'oooooooooooo',
      'oo oo    ooo'], s: { A: 'soft 1t' } },
    { name: 'Two Doors', code: '719522', par: 26, m: [
      '     oBo',
      ' oo11ooo',
      'Soo  ooo  ooo',
      'ooo  ooo  ooo',
      'oAo   oo22ooG',
      '      oo  ooo'], s: { A: 'soft 1+', B: 'heavy 2+' } },
    { name: 'Splinter', code: '316466', par: 16, m: [
      '   ooooo   o',
      '  oooooooooo',
      '     ooX  SG',
      '      oo  o',
      '  oo   o  oo',
      'oooooooooooo',
      'oo'], s: { X: 'split 8,5 10,1' } },
    { name: 'Brittle Maze', code: '460328', par: 24, m: [
      '     oo',
      '  ooooo  oo',
      '  ooooS  oo',
      'Gooo ooofoo',
      ' oo    ofofo',
      '  oooo  fooo',
      '   oooooofo',
      '   oofffoo'] },
    { name: 'Reunion', code: '947182', par: 20, m: [
      '    ffo',
      '   fooooX',
      ' ooooffoo',
      'ooooff',
      'ooo o',
      '  ooooG',
      '  oooSo'], s: { X: 'split 2,2 5,3' } },
    { name: 'Pressure Plate', code: '703877', par: 26, m: [
      'ooo   oGfo',
      'oof   ofoo',
      'oo    oooo',
      'oooo11oo',
      ' H',
      'oo',
      'oS'], s: { H: 'heavy 1t' } },
    { name: 'Island Hop', code: '162478', par: 32, m: [
      'oSo',
      'ooo   oooo  ooo',
      'oooo11oooo22ooo',
      'oooo  oooo   oo',
      'oooo  oooo   oo',
      'oooA  ooo    ooo',
      '      ooB    oGo'], s: { A: 'soft 1+', B: 'soft 2+' } },
    { name: 'Switchback', code: '781299', par: 27, m: [
      'Soo',
      'ooo  oo',
      'o oo oo',
      'ooGo o',
      'oo  oo ooo',
      'oooooooooo',
      'ooo oooo'] },
    { name: 'Far Apart', code: '904523', par: 24, m: [
      '         ooooo',
      ' So        oooo',
      ' oo       ooooo',
      'Aoo oo    oo  o',
      'oooo11X       oo',
      '   oo         oo',
      '   oo         oG'], s: { A: 'soft 1+', X: 'split 12,2 13,0' } },
    { name: 'Closing Time', code: '120256', par: 26, m: [
      '   S',
      '   o',
      ' ooo ooo ooG',
      'Hoooo11ooooo',
      '   o   fffo',
      '       fo'], s: { H: 'heavy 1t' } },
    { name: 'Spiral Stair', code: '356076', par: 31, m: [
      'Soo',
      'ooooooooooo',
      ' oo o  oooo',
      'ooo o',
      'ooofoooooo',
      ' ooooooooo',
      '        oG'] },
    { name: 'Keyhole', code: '176298', par: 29, m: [
      '         oo',
      '       oooo',
      '  ooooooooo',
      'ooo  o oG o',
      'ooo  oooffo',
      'oooooo   ff',
      'o Hoo11ooo',
      'ooo S'], s: { H: 'heavy 1+' } },
    { name: 'Ferry', code: '846133', par: 34, m: [
      'oof   oooH',
      'Soo   oooo',
      'oooo  oooo22ooo',
      ' oAo11fooo    oo',
      ' ooo        oooo',
      ' ooo        oooo',
      '             Goo'], s: { A: 'soft 1t', H: 'heavy 2+' } },
    { name: 'Twin Paths', code: '666026', par: 28, m: [
      '   oo  offG',
      '  ooo  ffffffo',
      '  oo   ofo  fo',
      'oSoooX ooooooo',
      'oooo   o',
      'ooo  oooo   oo',
      ' ooo  oo o  oo',
      ' ooooooooooooo'], s: { X: 'split 2,7 4,3' } },
    { name: 'Long Haul', code: '315456', par: 32, m: [
      '    oooooS',
      '   oooooo',
      '  ooo  oo',
      'G oo',
      'oooooooo',
      'oooooooooo',
      ' oo o o  oo',
      '    ooo  oo'] },
    { name: 'Fault Line', code: '580566', par: 32, m: [
      'oooofo',
      'ooo fff',
      ' oo ffff',
      'ooo ofoo',
      'Goooo ooo',
      ' oooo  oo',
      '       ooS'] },
    { name: 'Relay', code: '386614', par: 32, m: [
      '      oo   oo',
      'ooooooof oooooo',
      'ooB11off o ooooo',
      'Ao  oooooo  oooo',
      'fo   ffo    o G',
      'oo  oooff22oo',
      'So  of'], s: { A: 'soft 1+', B: 'heavy 2t' } },
    { name: 'Echo', code: '432266', par: 30, m: [
      '     oooo',
      'oo   oooo',
      'ooo  o    oG',
      'ooSA o    oo',
      '  oooooo  ooo',
      ' oo oo o  o o',
      ' oooXooo11ooo',
      '  oooooo oo'], s: { X: 'split 6,7 7,5', A: 'soft 1t' } },
    { name: 'Tight Rope', code: '899563', par: 35, m: [
      'Soo   ooo',
      'ooo  oooo',
      ' ooo o oo',
      'ooooofffo',
      'oG  ooooo',
      '      ooo'] },
    { name: 'Toll Bridge', code: '459234', par: 34, m: [
      '              G',
      ' oo           o',
      'oooA11Bo      o',
      'ooo o oooooo oo',
      'ooooo    oooooo',
      ' o        22ooo',
      ' S           oo'], s: { A: 'heavy 1t', B: 'soft 2+' } },
    { name: 'Three Isles', code: '550151', par: 34, m: [
      '      oo',
      'oBo   oo',
      'Aooo11ooo',
      ' ooo   oo',
      ' ooo    o',
      '  o     oo22fff',
      '  o         oGff',
      '  S         ooof'], s: { A: 'heavy 1+', B: 'soft 2t' } },
    { name: 'Undertow', code: '396791', par: 38, m: [
      '  oo       ooo',
      '  oS       ooo',
      '  oo      ooooo',
      'ooooo  offooo o',
      'ooooo oooofoo o',
      'oo  ooooo   ooo',
      '    oo      ooo',
      '    oooooG',
      '    ooo oo'] },
    { name: 'Scatter', code: '478677', par: 34, m: [
      'fo    fo',
      'ff    fooo',
      'Xff   oooo',
      'SfooBofoo',
      ' fooffff',
      ' fooo off22ooo',
      'ooff    oo  ooo',
      'oo oo       G'], s: { X: 'split 1,3 5,4', B: 'heavy 2+' } },
    { name: 'Lockstep', code: '624644', par: 38, m: [
      'ooo',
      'ooooH11oooo',
      ' ooo o  oooG',
      'So ooooooo',
      'oooooooo',
      'oooo  oo'], s: { H: 'heavy 1t' } },
    { name: 'Labyrinth', code: '496201', par: 42, m: [
      '         fo',
      '        ofo',
      '        ffoo',
      '        fooo',
      '         ffo',
      'ooGo     f fo',
      'ooooooooooSoo',
      'oo ooo'] },
    { name: 'Grand Tour', code: '865792', par: 40, m: [
      '   oo',
      ' AooS',
      ' oo11ooo',
      ' ooo fffooo',
      'oo o ooff o oooo',
      'oooo   ff22ooooo',
      'ooHo      ooo oG',
      'oooo',
      ' oo'], s: { A: 'soft 1t', H: 'heavy 2t' } },
    { name: 'Overpass', code: '770105', par: 40, m: [
      '  o     ffo',
      'ooo  ooofoff',
      'oooXooofoSo  ooG',
      'o  o  o    fffff',
      'o oHoooooo ffo',
      'o oo oo oo11 o',
      'o   oo   o oo',
      'o   ooo  o oo',
      'oo  o oooo'], s: { X: 'split 8,8 5,4', H: 'heavy 1+' } },
    { name: 'Last Light', code: '866185', par: 46, m: [
      '     oo      oo',
      'oo   ooo     oo',
      'oo   ooo    oo',
      ' ooo ooo    oooo',
      'Gooooo    Sooo o',
      ' ooo ooo oo oooo',
      ' oo ooooooooo oo',
      '   ooo ooo ooooo',
      '   oo    ooo ooo'] },
    { name: 'Summit Run', code: '187642', par: 46, m: [
      '  S  oA',
      '  o11ooo',
      'ooooBooo',
      'oooo  oo',
      'oo     o     off',
      'oo     o     fff',
      'oo     oG22oooo'], s: { A: 'soft 1t', B: 'heavy 2t' } },
    { name: 'Keystone', code: '714262', par: 46, m: [
      '            oooG',
      '  ooooo    ooooo',
      'ooooo ooo 11 oo',
      'ooX offoooo',
      'oooofofoo oo',
      'ooo  ooo   o',
      ' ooo fofoooSoo',
      ' ooAooo',
      '   oooooffo'], s: { X: 'split 10,4 8,8', A: 'heavy 1t' } },
    { name: 'Apex', code: '107511', par: 50, m: [
      '    oooo',
      '   fo11oo',
      '  oof  oo',
      'ooooS   o',
      'oooo    ooooo',
      'o  o     oooo',
      'ooff      ooooG',
      'ffof',
      ' Hff'], s: { H: 'heavy 1t' } }
  ];

  function parseLevel(def) {
    const rows = def.m, h = rows.length, w = Math.max(...rows.map(r => r.length));
    const cell = new Uint8Array(w * h), br = new Int8Array(w * h).fill(-1), sw = new Map();
    let start = null, goal = null, nb = 0, m0 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x] || ' ', i = y * w + x;
      if (ch === ' ') continue;
      if (ch === 'o') cell[i] = FLOOR;
      else if (ch === 'f') cell[i] = FRAG;
      else if (ch === 'S') { cell[i] = FLOOR; start = [x, y]; }
      else if (ch === 'G') { cell[i] = GOAL; goal = [x, y]; }
      else if (ch >= '1' && ch <= '9') { cell[i] = BRIDGE; br[i] = ch.charCodeAt(0) - 49; nb = Math.max(nb, br[i] + 1); }
      else {
        const spec = def.s && def.s[ch];
        if (!spec) throw new Error('unknown cell ' + ch);
        const p = spec.split(' '), kind = p[0];
        const s = { kind, fx: [], to: null };
        if (kind === 'split') s.to = p.slice(1).map(q => q.split(',').map(Number));
        else for (const q of p.slice(1)) s.fx.push([q.charCodeAt(0) - 49, q[1]]);
        cell[i] = kind === 'soft' ? SOFT : kind === 'heavy' ? HEAVY : SPLIT;
        sw.set(i, s);
      }
    }
    for (const c of def.on || '') m0 |= 1 << (c.charCodeAt(0) - 49);
    return { w, h, cell, br, sw, start, goal, nb, m0, def };
  }

  const initState = L => ({ k: 0, x: L.start[0], y: L.start[1], o: 0, m: L.m0, c: null, a: 0 });

  function solid(L, m, x, y) {
    if (x < 0 || y < 0 || x >= L.w || y >= L.h) return false;
    const i = y * L.w + x, t = L.cell[i];
    if (t === VOID) return false;
    if (t === BRIDGE) return (m >> L.br[i] & 1) === 1;
    return true;
  }

  const blockCells = s => s.o === 0 ? [[s.x, s.y]] : s.o === 1 ? [[s.x, s.y], [s.x + 1, s.y]] : [[s.x, s.y], [s.x, s.y + 1]];

  function roll(s, d) {
    const { x, y, o } = s;
    if (o === 0) return d === 0 ? [x - 2, y, 1] : d === 1 ? [x + 1, y, 1] : d === 2 ? [x, y - 2, 2] : [x, y + 1, 2];
    if (o === 1) return d === 0 ? [x - 1, y, 0] : d === 1 ? [x + 2, y, 0] : d === 2 ? [x, y - 1, 1] : [x, y + 1, 1];
    return d === 0 ? [x - 1, y, 2] : d === 1 ? [x + 1, y, 2] : d === 2 ? [x, y - 1, 0] : [x, y + 2, 0];
  }

  function press(L, m, i, ev) {
    const s = L.sw.get(i);
    ev.push({ t: 'press', i });
    for (const [b, mode] of s.fx) {
      const was = m >> b & 1, now = mode === 't' ? 1 - was : mode === '+' ? 1 : 0;
      if (now !== was) { m ^= 1 << b; ev.push({ t: 'bridge', b, on: now }); }
    }
    return m;
  }

  function step(L, s, d) {
    const ev = [];
    if (s.k === 0) {
      const [x, y, o] = roll(s, d), n = { k: 0, x, y, o, m: s.m, c: null, a: 0 };
      const cells = blockCells(n);
      if (cells.some(c => !solid(L, n.m, c[0], c[1]))) return { s: n, r: 'fall', ev };
      const i0 = y * L.w + x;
      if (o === 0 && L.cell[i0] === FRAG) { ev.push({ t: 'break', i: i0 }); return { s: n, r: 'fall', ev }; }
      if (o === 0 && L.cell[i0] === GOAL) return { s: n, r: 'win', ev };
      let split = null;
      for (const [cx, cy] of cells) {
        const i = cy * L.w + cx, t = L.cell[i];
        if (t === SOFT || (t === HEAVY && o === 0)) n.m = press(L, n.m, i, ev);
        else if (t === SPLIT && o === 0) { ev.push({ t: 'press', i }); split = L.sw.get(i).to; }
      }
      if (cells.some(c => !solid(L, n.m, c[0], c[1]))) return { s: n, r: 'fall', ev };
      if (split) {
        const c = [split[0].slice(), split[1].slice()];
        ev.push({ t: 'split' });
        const n2 = { k: 1, x, y, o, m: n.m, c, a: 0 };
        if (c.some(p => !solid(L, n.m, p[0], p[1]))) return { s: n2, r: 'fall', ev };
        return { s: n2, r: 'ok', ev };
      }
      return { s: n, r: 'ok', ev };
    }
    const a = s.a, c = [s.c[0].slice(), s.c[1].slice()], p = c[a];
    p[0] += DIRS[d][0]; p[1] += DIRS[d][1];
    const n = { k: 1, x: 0, y: 0, o: 0, m: s.m, c, a };
    if (!solid(L, n.m, p[0], p[1])) return { s: n, r: 'fall', ev };
    const i = p[1] * L.w + p[0];
    if (L.cell[i] === SOFT) n.m = press(L, n.m, i, ev);
    if (c.some(q => !solid(L, n.m, q[0], q[1]))) return { s: n, r: 'fall', ev };
    const q = c[1 - a];
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) === 1) {
      ev.push({ t: 'merge' });
      return { s: { k: 0, x: Math.min(p[0], q[0]), y: Math.min(p[1], q[1]), o: p[1] === q[1] ? 1 : 2, m: n.m, c: null, a: 0 }, r: 'ok', ev };
    }
    return { s: n, r: 'ok', ev };
  }

  const stateKey = s => s.k === 0 ? s.x + ',' + s.y + ',' + s.o + '|' + s.m : s.c[0] + ';' + s.c[1] + '|' + s.m;

  function solve(L, limit = 3e6, from) {
    const s0 = from || initState(L), k0 = stateKey(s0), seen = new Map([[k0, null]]);
    let q = [s0], depth = 0;
    while (q.length && seen.size < limit) {
      const nq = [];
      depth++;
      for (const s of q) {
        const ks = stateKey(s);
        for (let a = 0; a < (s.k ? 2 : 1); a++) for (let d = 0; d < 4; d++) {
          const r = step(L, s.k ? { ...s, a } : s, d);
          if (r.r === 'fall') continue;
          const kn = r.r === 'win' ? 'WIN' : stateKey(r.s);
          if (seen.has(kn)) continue;
          seen.set(kn, [ks, s.k ? a * 4 + d : d, s.k]);
          if (r.r === 'win') {
            const path = [], raw = [];
            for (let k = 'WIN'; seen.get(k); k = seen.get(k)[0]) { const e = seen.get(k); raw.unshift(e[2] ? [e[1] >> 2, e[1] & 3] : [-1, e[1]]); path.unshift(e[2] ? 'cube' + (e[1] >> 2) + ':' + 'LRUD'[e[1] & 3] : 'LRUD'[e[1]]); }
            return { moves: depth, path, raw, states: seen.size };
          }
          nq.push(r.s);
        }
      }
      q = nq;
    }
    return { moves: -1, path: null, states: seen.size };
  }

  const LOGIC = { CFG, LEVELS, parseLevel, initState, step, solve, stateKey, blockCells, solid };

  const G = '.gm-block-roll';
  const pad2 = n => String(n).padStart(2, '0');
  const fmtTime = s => (s / 60 | 0) + ':' + pad2(s % 60 | 0);
  const rng = seed => () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const ARROW = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4 21 15h-5.5v5h-7v-5H3z"/></svg>';

  function canvasTex(THREE, size, draw, h) {
    const c = document.createElement('canvas');
    c.width = size; c.height = h || size;
    draw(c.getContext('2d'), size, h || size);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  const THEMES = [
    { name: 'Ember', css: '#ff8a4a', sky: ['#5e0800', '#b81c04', '#d83410', '#8e1000'], dk: '20,0,0', gl: '255,96,40', floor: ['#a3a6aa', 'rgba(70,70,76,.6)', 'rgba(255,255,255,.55)'], rock: 0x6a2a20, hemi: 0x4a1a10, goal: 0xffa040 },
    { name: 'Dusk', css: '#e49aff', sky: ['#14062e', '#3e1670', '#8a3a9e', '#24093f'], dk: '8,0,20', gl: '255,130,210', floor: ['#b2aec2', 'rgba(64,56,90,.6)', 'rgba(255,255,255,.55)'], rock: 0x3a2050, hemi: 0x2a1640, goal: 0xff8ae0 },
    { name: 'Glacier', css: '#8fe2ff', sky: ['#031a30', '#0b4672', '#2b88b2', '#052a46'], dk: '0,8,22', gl: '170,235,255', floor: ['#c2cad3', 'rgba(56,76,98,.6)', 'rgba(255,255,255,.6)'], rock: 0x1e3a50, hemi: 0x123048, goal: 0x7ae6ff },
    { name: 'Jade', css: '#c8f57a', sky: ['#021e16', '#0a4c32', '#2a8a52', '#033424'], dk: '0,14,6', gl: '220,255,150', floor: ['#b9bcae', 'rgba(58,68,48,.6)', 'rgba(255,255,255,.55)'], rock: 0x203820, hemi: 0x1a3020, goal: 0xd4ff6a }
  ];
  const WORLD = 10;
  const TIPS = { 0: ['Arrow keys roll the block. Stand it upright on the glowing hole.', 'Swipe or use the pad to roll. Stand the block upright on the glowing hole.'], 1: ['Wrong turn? Z takes the move back, even while falling.', 'Wrong turn? Undo takes the move back, even while falling.'], 3: ['New: orange tiles crack under an upright block. Lie flat on them.'], 6: ['New: a round switch opens the bridge. Any touch presses it.'], 7: ['New: X switches only click under an upright block.'], 9: ['This switch toggles: press it twice and the bridge closes again.'], 11: ['New: the split switch makes two cubes. Space swaps between them.', 'New: the split switch makes two cubes. SWAP picks the other one.'], 13: ['Bring the cubes side by side to join them back into a block.'] };

  function drawSky(g, w, h, th) {
    th = th || THEMES[0];
    const bg = g.createLinearGradient(0, 0, w * .25, h);
    bg.addColorStop(0, th.sky[0]); bg.addColorStop(.3, th.sky[1]); bg.addColorStop(.62, th.sky[2]); bg.addColorStop(1, th.sky[3]);
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const r = rng(9157);
    const puff = (x, y, rx, ry, a, col) => {
      g.save(); g.translate(x, y); g.rotate(a); g.scale(1, ry / rx);
      const n = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      n.addColorStop(0, col); n.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
      g.fillStyle = n; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
    };
    for (let i = 0; i < 26; i++) puff(r() * w, r() * h, (.12 + r() * .3) * w, (.03 + r() * .07) * w, (r() - .5) * .7, `rgba(${th.dk},${.18 + r() * .28})`);
    for (let i = 0; i < 12; i++) puff(r() * w, h * (.3 + r() * .5), (.1 + r() * .25) * w, (.03 + r() * .05) * w, (r() - .5) * .5, `rgba(${th.gl},${.1 + r() * .16})`);
    for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h * .7, s = r() < .15 ? 2.2 : 1.2; g.fillStyle = `rgba(255,255,255,${.15 + r() * .45})`; g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill(); }
    puff(w * .08, h * .92, w * .5, h * .22, -.2, `rgba(${th.dk},.55)`);
    puff(w * .95, h * .05, w * .45, h * .2, .1, `rgba(${th.dk},.45)`);
    const v = g.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .3, w * .5, h * .5, Math.max(w, h) * .78);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(${th.dk},.6)`);
    g.fillStyle = v; g.fillRect(0, 0, w, h);
  }

  const ledCache = {};
  function ledLogo(txt) {
    if (ledCache[txt]) return ledCache[txt];
    const st = 3, k = 8, H0 = 60, c0 = document.createElement('canvas'), g0 = c0.getContext('2d');
    g0.font = '900 58px "Arial Black","Arial Bold",Impact,sans-serif';
    const W0 = Math.ceil(g0.measureText(txt).width + txt.length * 6 + 12);
    c0.width = W0; c0.height = H0;
    g0.font = '900 58px "Arial Black","Arial Bold",Impact,sans-serif';
    if ('letterSpacing' in g0) g0.letterSpacing = '6px';
    g0.textBaseline = 'middle'; g0.fillStyle = '#fff'; g0.fillText(txt, 6, H0 / 2 + 3);
    const d = g0.getImageData(0, 0, W0, H0).data, cw = Math.floor(W0 / st), ch = Math.floor(H0 / st);
    const c = document.createElement('canvas'); c.width = cw * k + 24; c.height = ch * k + 24;
    const g = c.getContext('2d');
    g.shadowColor = 'rgba(255,120,30,.95)'; g.shadowBlur = 9;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const a = d[((y * st + 1) * W0 + x * st + 1) * 4 + 3];
      if (a < 110) continue;
      const cx = 12 + x * k + k / 2, cy = 12 + y * k + k / 2, gr = g.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, k * .46);
      gr.addColorStop(0, '#fffdf2'); gr.addColorStop(.6, '#ffe6b0'); gr.addColorStop(1, '#f7a050');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, k * .42, 0, 6.283); g.fill();
    }
    return (ledCache[txt] = c.toDataURL());
  }

  function drawTile(g, n, base, line, hi, seed) {
    g.fillStyle = base; g.fillRect(0, 0, n, n);
    const r = rng(seed);
    for (let i = 0; i < 46; i++) {
      const x = r() * n, y = r() * n, rad = n * (.06 + r() * .22), dk = r() < .55;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, dk ? `rgba(60,62,70,${.05 + r() * .09})` : `rgba(255,255,255,${.06 + r() * .12})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = `rgba(70,72,80,${.05 + r() * .08})`; g.lineWidth = 1 + r() * 1.5;
      g.beginPath(); let x = r() * n, y = r() * n; g.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (r() - .5) * n * .25; y += (r() - .5) * n * .25; g.lineTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 700; i++) { g.fillStyle = r() < .5 ? `rgba(0,0,0,${r() * .07})` : `rgba(255,255,255,${r() * .08})`; g.fillRect(r() * n, r() * n, 1.3, 1.3); }
    g.lineWidth = n * .05; g.strokeStyle = line; g.strokeRect(0, 0, n, n);
    g.lineWidth = n * .02; g.strokeStyle = hi; g.beginPath(); g.moveTo(n * .035, n * .97); g.lineTo(n * .035, n * .035); g.lineTo(n * .97, n * .035); g.stroke();
  }

  function drawRust(g, n, h) {
    g.fillStyle = '#6e3020'; g.fillRect(0, 0, n, h);
    const r = rng(4242);
    for (let i = 0; i < 180; i++) {
      const x = r() * n, y = r() * h, rad = 6 + r() * 34, dark = r() < .55;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, dark ? `rgba(40,16,10,${.1 + r() * .2})` : `rgba(170,92,56,${.12 + r() * .26})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 52; i++) {
      g.fillStyle = `rgba(55,18,6,${.12 + r() * .2})`;
      g.fillRect(r() * n, r() * h, 1 + r() * 2, 10 + r() * 40);
    }
    const img = g.getImageData(0, 0, n, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const k = (r() - .5) * 30; d[i] += k; d[i + 1] += k * .6; d[i + 2] += k * .4; }
    g.putImageData(img, 0, 0);
  }

  function extrudeBox(THREE, w, d, h, b, rr) {
    const s = new THREE.Shape(), x = w / 2 - b, z = d / 2 - b, r = Math.min(rr, x * .5);
    if (r > 0) {
      s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r); s.lineTo(x, z - r);
      s.quadraticCurveTo(x, z, x - r, z); s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r); s.lineTo(-x, -z + r);
      s.quadraticCurveTo(-x, -z, -x + r, -z);
    } else { s.moveTo(-x, -z); s.lineTo(x, -z); s.lineTo(x, z); s.lineTo(-x, z); s.lineTo(-x, -z); }
    const g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 3 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, b, 0);
    g.computeVertexNormals();
    return g;
  }

  function fitPR(api, v, hook) {
    const r = v.renderer, c = v.canvas, Q = [1, 0.8, 0.64, 0.5];
    let lvl = 0, cw = 0, avg = 0.016, t = -2, wait = 8, chk = 0, lf = -1, sf = 0, up = 0, was = 1;
    const apply = () => {
      const d = Math.min(2, window.devicePixelRatio || 1), B = Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * d * d * 1.05);
      const pr = Math.max(0.5, Math.min(4, d * cw / v.w, Math.sqrt(B / (v.w * v.h)))) * Q[lvl];
      if (Math.abs(r.getPixelRatio() - pr) > 0.01) r.setPixelRatio(pr);
      r.shadowMap.autoUpdate = lvl < 2;
    };
    const size = () => { const w = c.getBoundingClientRect().width; if (w && Math.abs(w - cw) > Math.max(2, cw * 0.02)) { cw = w; apply(); } };
    const set = n => { lvl = n; t = 0; apply(); if (hook) hook(lvl); };
    size(); api.on(window, 'resize', size);
    api.loop(dt => {
      const f = r.info.render.frame;
      if (f === lf || !(dt > 0)) return;
      lf = f;
      if (lvl > 1 && (sf ^= 1)) r.shadowMap.needsUpdate = true;
      avg += (dt - avg) * Math.min(1, dt * 1.5); t += dt;
      if ((chk += dt) > 1) { chk = 0; size(); }
      if (t < 1.5) return;
      if (avg > 0.021 && lvl < Q.length - 1 && (lvl < 2 || avg < was * 0.94)) { if (up && t < 6) wait = Math.min(64, wait * 2); up = 0; was = avg; set(lvl + 1); }
      else if (avg < 0.0175 && lvl && t > wait) { up = 1; set(lvl - 1); }
    });
  }

  function run(root, api, v, wrap, W, H, touch) {
    const { THREE, renderer, canvas } = v;
    wrap.prepend(canvas);
    fitPR(api, v);
    Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', borderRadius: '0' });
    const disp = [], track = o => { disp.push(o); return o; };
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CFG.fov, W / H, 0.1, 400);
    scene.background = track(canvasTex(THREE, 1024, (g, w, h) => drawSky(g, w, h, THEMES[0]), Math.round(1024 * H / W)));
    const hemi = new THREE.HemisphereLight(0xfff4ee, 0x4a1a10, 0.85);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0dc, 1.3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.025;
    scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight(0xffb08a, 0.4);
    scene.add(rim, rim.target);

    const texFloor = track(canvasTex(THREE, 128, (g, n) => drawTile(g, n, THEMES[0].floor[0], THEMES[0].floor[1], THEMES[0].floor[2], 77)));
    const texFrag = track(canvasTex(THREE, 128, (g, n) => drawTile(g, n, '#ec8240', 'rgba(130,50,14,.6)', 'rgba(255,214,170,.5)', 31)));
    const texRust = track(canvasTex(THREE, 256, drawRust, 512));
    for (const t of [texFloor, texFrag, texRust]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.offset.set(.5, .5); t.anisotropy = 4; }
    texRust.repeat.set(1, .5);
    const matFloor = track(new THREE.MeshStandardMaterial({ map: texFloor, metalness: .12, roughness: .62 }));
    const matFrag = track(new THREE.MeshStandardMaterial({ map: texFrag, metalness: .2, roughness: .55 }));
    const matDeco = track(new THREE.MeshStandardMaterial({ color: 0x575e6c, metalness: .75, roughness: .32 }));
    const matBlock = track(new THREE.MeshStandardMaterial({ map: texRust, bumpMap: texRust, bumpScale: .02, metalness: .4, roughness: .66 }));
    const matCubeOn = track(matBlock.clone());
    matCubeOn.emissive = new THREE.Color(0xff7a2a); matCubeOn.emissiveIntensity = .22;

    const tileGeo = track(extrudeBox(THREE, CFG.tile, CFG.tile, CFG.tileH, .045, 0));
    tileGeo.translate(0, -CFG.tileH, 0);
    const blockGeo = track(extrudeBox(THREE, 1, 1, 2, .075, .06));
    blockGeo.translate(0, -1, 0);
    const cubeGeo = track(extrudeBox(THREE, 1, 1, 1, .075, .06));
    cubeGeo.translate(0, -.5, 0);
    const softGeo = track(new THREE.CylinderGeometry(.25, .29, .07, 28));
    const barGeo = track(new THREE.BoxGeometry(.66, .07, .15));
    const arcGeo = track(new THREE.TorusGeometry(.27, .06, 6, 14, 2.2));
    arcGeo.rotateZ(Math.PI - 1.1); arcGeo.rotateX(-Math.PI / 2);

    const blockMesh = new THREE.Mesh(blockGeo, matBlock);
    blockMesh.castShadow = blockMesh.receiveShadow = true;
    const cubes = [0, 1].map(() => { const m = new THREE.Mesh(cubeGeo, matBlock); m.castShadow = m.receiveShadow = true; m.visible = false; scene.add(m); return m; });
    scene.add(blockMesh);
    const bodies = [blockMesh, ...cubes];
    const Q0 = [new THREE.Quaternion(), new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), Math.PI / 2), new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), Math.PI / 2)];
    const AX = [V3(0, 0, 1), V3(0, 0, 1), V3(1, 0, 0), V3(1, 0, 0)], ANG = [Math.PI / 2, -Math.PI / 2, -Math.PI / 2, Math.PI / 2];
    const qTmp = new THREE.Quaternion(), vTmp = V3(0, 0, 0), vTmp2 = V3(0, 0, 0);

    const lvGroup = new THREE.Group();
    scene.add(lvGroup);
    const rockGeo = track(new THREE.IcosahedronGeometry(1, 0));
    const rockMat = track(new THREE.MeshStandardMaterial({ color: THEMES[0].rock, roughness: .9, metalness: .05, flatShading: true }));
    const rocks = [];
    {
      const rr = rng(8821);
      for (let i = 0; i < 0; i++) {
        const m = new THREE.Mesh(rockGeo, rockMat);
        m.castShadow = false;
        m.userData = { a: rr() * 6.283, r: 0, y: -1.6 - rr() * 7, s: .35 + rr() * 1.1, sp: (rr() - .5) * .5, ph: rr() * 6.283, rf: 1 + rr() * 1.6, ax: rr(), az: rr() };
        scene.add(m); rocks.push(m);
      }
    }
    const matGoal = track(new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0xffa040, emissiveIntensity: 1.2, metalness: .3, roughness: .4 }));
    const texBeam = track(canvasTex(THREE, 8, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 64));
    const matBeam = track(new THREE.MeshBasicMaterial({ color: 0xffa040, map: texBeam, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide }));
    const rimGeo = track(new THREE.BoxGeometry(1.02, .05, .07));
    const beamGeo = track(new THREE.CylinderGeometry(.36, .44, 2.6, 28, 1, true));
    beamGeo.translate(0, 1.3, 0);
    const goalG = new THREE.Group();
    for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(rimGeo, matGoal); const a = k * Math.PI / 2; m.rotation.y = a; m.position.set(Math.sin(a) * .5, -.02, Math.cos(a) * .5); goalG.add(m); }
    const beam = new THREE.Mesh(beamGeo, matBeam);
    goalG.add(beam);
    scene.add(goalG);
    const matDust = track(new THREE.MeshBasicMaterial({ color: 0xe8e2da, transparent: true, opacity: .8, depthWrite: false }));
    const matSpark = track(new THREE.MeshBasicMaterial({ color: 0xffa040 }));
    const matShard = track(new THREE.MeshBasicMaterial({ color: 0xf08a3c }));
    const partGeo = track(new THREE.BoxGeometry(.09, .09, .09));
    const parts = [];
    for (let i = 0; i < 64; i++) { const m = new THREE.Mesh(partGeo, matDust); m.visible = false; m.userData = { v: V3(0, 0, 0), life: 0, max: 1, g: 0 }; scene.add(m); parts.push(m); }
    let partI = 0;
    function burst(x, y, z, n, mat, sp, up, g, life) {
      for (let i = 0; i < n; i++) {
        const m = parts[partI = (partI + 1) % parts.length], u = m.userData, a = Math.random() * 6.283, s = sp * (.4 + Math.random() * .6);
        m.material = mat; m.visible = true; m.position.set(x + Math.cos(a) * .3, y, z + Math.sin(a) * .3);
        u.v.set(Math.cos(a) * s, up * (.5 + Math.random() * .7), Math.sin(a) * s); u.life = u.max = life * (.6 + Math.random() * .5); u.g = g;
        m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      }
    }
    function updParts(dt) {
      for (const m of parts) {
        if (!m.visible) continue;
        const u = m.userData;
        u.life -= dt;
        if (u.life <= 0) { m.visible = false; continue; }
        u.v.y -= u.g * dt;
        m.position.addScaledVector(u.v, dt);
        m.scale.setScalar(Math.max(.05, u.life / u.max) * (m.material === matDust ? 1.6 : 1));
        m.rotation.x += dt * 4;
      }
    }
    let themeIdx = -1;
    function applyTheme(i) {
      const k = Math.floor(i / WORLD) % THEMES.length;
      if (k === themeIdx) return;
      themeIdx = k;
      const th = THEMES[k];
      const sc = scene.background.image;
      drawSky(sc.getContext('2d'), sc.width, sc.height, th);
      scene.background.needsUpdate = true;
      const fc = texFloor.image;
      drawTile(fc.getContext('2d'), fc.width, th.floor[0], th.floor[1], th.floor[2], 77);
      texFloor.needsUpdate = true;
      rockMat.color.setHex(th.rock);
      hemi.groundColor.setHex(th.hemi);
      matGoal.emissive.setHex(th.goal); matBeam.color.setHex(th.goal);
      for (const m of [matSpark]) m.color.setHex(th.goal);
    }
    function placeRocks() {
      const rx = L.w / 2 + 3.5, rz = L.h / 2 + 3.5;
      for (const m of rocks) {
        const u = m.userData, a = u.a;
        u.r = 1;
        m.position.set(Math.cos(a) * rx * u.rf, u.y, Math.sin(a) * rz * u.rf);
        m.scale.setScalar(u.s);
      }
    }
    let L = null, st = null, ox = 0, oz = 0, tiles = [], tileAt = [], bridgeMats = [];
    let hints = 0, lvl = 0, moves = 0, secs = 0, falls = 0, totalMoves = 0, totalSecs = 0, lastSec = -1;
    let phase = 'title', screen = null, anim = null, fall = null, timerOn = false, phaseT = 0, holdTouch = -1;
    const buffered = [];
    const queue = a => { if (buffered.length < 2) buffered.push(a); else buffered[1] = a; };
    const heldKeys = [];
    let camDist = 20;
    const camTarget = V3(0, 0, 0), camDir = V3(0, 1, 0);
    const axS = [0, 0], azS = [0, 0];

    const old = api.load() || {};
    const save = old.ver === 2 ? Object.assign({ unlocked: 0, cleared: 0, best: {}, stars: {} }, old) : { ver: 2, unlocked: Math.min(LEVELS.length - 1, old.unlocked | 0), cleared: Math.min(LEVELS.length, old.cleared | 0), best: {}, stars: {}, seenHelp: !!old.unlocked };
    if (!save.best || typeof save.best !== 'object') save.best = {};
    if (!save.stars || typeof save.stars !== 'object') save.stars = {};
    const totalStars = () => Object.values(save.stars).reduce((a, b) => a + (b | 0), 0);
    const starsFor = (n, par, h) => Math.min(h ? 2 : 3, n <= par ? 3 : n <= Math.ceil(par * 1.4) + 2 ? 2 : 1);
    const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.4l2.95 6.2 6.75.8-5 4.7 1.33 6.75L12 17.5l-6.03 3.35L7.3 14.1l-5-4.7 6.75-.8z"/></svg>';
    const stars3 = (n, cls) => `<span class="${cls}">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}" style="--d:${(.25 + k * .22).toFixed(2)}s">${STAR}</i>`).join('')}</span>`;
    const hist = [];
    const cloneSt = q => ({ ...q, c: q.c ? [q.c[0].slice(), q.c[1].slice()] : null });
    let undos = 0;
    const persist = () => api.save(save);
    api.score(save.cleared || 0);

    const $ = s => wrap.querySelector(s);
    const hud = { stage: $('[data-h="stage"]'), moves: $('[data-h="moves"]'), time: $('[data-h="time"]'), code: $('[data-h="code"]') };
    const elHud = $('.br-hud'), elBanner = $('.br-banner'), elScreen = $('.br-screen'), elSwap = $('.br-swap'), elPad = $('.br-pad'), elHint = $('.br-hint');

    let ac = null, master = null, noiseBuf = null;
    function audio() {
      if (api.muted) return null;
      if (!ac) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
          noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; return null; }
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }
    function tone(f0, f1, dur, type, vol, delay = 0) {
      const a = audio(); if (!a) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
    }
    function noise(dur, vol, ftype, f0, f1, delay = 0) {
      const a = audio(); if (!a) return;
      const t = a.currentTime + delay, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = noiseBuf; f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f).connect(g).connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
    }
    const SND = {
      land() { noise(.1, .32, 'lowpass', 900, 300); tone(120, 58, .12, 'sine', .32); },
      thud() { noise(.16, .45, 'lowpass', 700, 200); tone(95, 45, .2, 'sine', .45); },
      click() { tone(1500, 900, .035, 'square', .05); tone(520, 520, .07, 'triangle', .1); },
      bridge(on) { noise(.32, .16, 'bandpass', on ? 500 : 1400, on ? 1400 : 500); tone(on ? 260 : 390, on ? 390 : 260, .26, 'triangle', .07, .03); },
      fall() { tone(560, 60, 1.05, 'sine', .16); noise(.6, .06, 'bandpass', 1800, 300); },
      crack() { noise(.3, .42, 'highpass', 2600, 900); tone(330, 110, .18, 'square', .05); },
      split() { tone(260, 1300, .32, 'sine', .14); tone(520, 2600, .28, 'sine', .05, .05); noise(.3, .08, 'bandpass', 3000, 6000); },
      merge() { tone(880, 880, .09, 'triangle', .12); tone(1320, 1320, .14, 'triangle', .1, .07); },
      swap() { tone(700, 980, .06, 'sine', .08); },
      win() { tone(420, 90, .75, 'sine', .14); [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .3, 'triangle', .09, .55 + i * .1)); },
      tiles() { noise(.7, .07, 'bandpass', 400, 2400); },
      ui() { tone(660, 660, .05, 'sine', .06); },
      undo() { tone(700, 420, .09, 'sine', .08); noise(.08, .05, 'bandpass', 2400, 900); },
      star(i) { const f = 880 * Math.pow(1.26, i); tone(f, f, .22, 'triangle', .09); tone(f * 2, f * 2, .18, 'sine', .04, .02); },
      bad() { tone(220, 140, .2, 'triangle', .1); }
    };

    function clearLevel() {
      for (const t of tiles) lvGroup.remove(t.holder);
      for (const m of bridgeMats) m.dispose();
      tiles = []; tileAt = []; bridgeMats = [];
    }

    function buildLevel(def) {
      clearLevel();
      L = parseLevel(def);
      ox = (L.w - 1) / 2; oz = (L.h - 1) / 2;
      for (let b = 0; b < L.nb; b++) { const m = matFloor.clone(); m.emissive = new THREE.Color(0); bridgeMats.push(m); }
      const r = rng(1234 + L.w * 31 + L.h);
      const anchorDist = new Map();
      const isAnchor = i => L.cell[i] !== VOID && L.cell[i] !== BRIDGE && L.cell[i] !== GOAL;
      const queue = [];
      for (let i = 0; i < L.cell.length; i++) if (L.cell[i] === BRIDGE) {
        const x = i % L.w, y = i / L.w | 0;
        if (DIRS.some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < L.w && ny < L.h && isAnchor(ny * L.w + nx); })) { anchorDist.set(i, 0); queue.push(i); }
      }
      while (queue.length) {
        const i = queue.shift(), x = i % L.w, y = i / L.w | 0;
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy, j = ny * L.w + nx;
          if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h || L.cell[j] !== BRIDGE || L.br[j] !== L.br[i] || anchorDist.has(j)) continue;
          anchorDist.set(j, anchorDist.get(i) + 1); queue.push(j);
        }
      }
      for (let i = 0; i < L.cell.length; i++) {
        const t = L.cell[i];
        if (t === VOID || t === GOAL) continue;
        const x = i % L.w, y = i / L.w | 0;
        const mesh = new THREE.Mesh(tileGeo, t === FRAG ? matFrag : t === BRIDGE ? bridgeMats[L.br[i]] : matFloor);
        mesh.castShadow = mesh.receiveShadow = true;
        if (t === SOFT) { const d = new THREE.Mesh(softGeo, matDeco); d.position.y = .03; d.castShadow = true; mesh.add(d); }
        else if (t === HEAVY) {
          for (const a of [1, -1]) { const d = new THREE.Mesh(barGeo, matDeco); d.position.y = .03; d.rotation.y = a * Math.PI / 4; d.castShadow = true; mesh.add(d); }
        } else if (t === SPLIT) {
          for (const a of [0, 1]) { const d = new THREE.Mesh(arcGeo, matDeco); d.position.set(a ? -.05 : .05, .03, 0); d.rotation.y = a * Math.PI; d.castShadow = true; mesh.add(d); }
        }
        const holder = new THREE.Group();
        const tile = { i, x, y, t, holder, mesh, delay: r() * (CFG.introTime - CFG.introDrop), fold: 0, foldTo: 0, foldDelay: 0, hinge: -1, fallV: 0, spin: null, press: 0 };
        if (t === BRIDGE) {
          let best = 0, bd = 1e9;
          const ad = anchorDist.has(i) ? anchorDist.get(i) : 99;
          DIRS.forEach(([dx, dy], k) => {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h) return;
            const j = ny * L.w + nx;
            const score = isAnchor(j) ? 0 : L.cell[j] === BRIDGE && L.br[j] === L.br[i] && anchorDist.has(j) && anchorDist.get(j) < ad ? 1 : 9;
            if (score < bd) { bd = score; best = k; }
          });
          tile.hinge = best; tile.dist = ad === 99 ? 0 : ad;
          const [hx, hz] = DIRS[best];
          holder.position.set(x - ox + hx * .5, -CFG.tileH, y - oz + hz * .5);
          mesh.position.set(-hx * .5, CFG.tileH, -hz * .5);
          tile.fold = tile.foldTo = (L.m0 >> L.br[i] & 1) ? 0 : 1;
        } else holder.position.set(x - ox, 0, y - oz);
        tile.base = holder.position.clone();
        holder.add(mesh);
        lvGroup.add(holder);
        tiles.push(tile);
        tileAt[i] = tile;
      }
      applyFold(0);
      applyTheme(Math.max(0, LEVELS.indexOf(def)));
      placeRocks();
      fitCamera();
      goalG.position.set(L.goal[0] - ox, 0, L.goal[1] - oz); goalG.visible = true;
      hud.code.textContent = def.par;
    }

    const FOLD = [[-Math.PI, 'z'], [Math.PI, 'z'], [Math.PI, 'x'], [-Math.PI, 'x']];
    function applyFold(dt) {
      for (const t of tiles) {
        if (t.t !== BRIDGE) continue;
        if (t.foldDelay > 0) { t.foldDelay -= dt; continue; }
        if (t.fold !== t.foldTo) {
          const sp = dt / CFG.bridgeTime;
          t.fold = t.foldTo > t.fold ? Math.min(t.foldTo, t.fold + sp) : Math.max(t.foldTo, t.fold - sp);
        }
        const [ang, ax] = FOLD[t.hinge], k = t.fold, e = k * k * (3 - 2 * k);
        t.holder.rotation.set(0, 0, 0);
        t.holder.rotation[ax] = ang * e;
        t.holder.visible = t.fold < .999;
      }
      for (const m of bridgeMats) {
        const e = m.emissiveIntensity;
        if (e > 0) m.emissiveIntensity = Math.max(0, e - dt * 1.6);
      }
    }

    function setBridge(b, on, instant) {
      for (const t of tiles) {
        if (t.t !== BRIDGE || L.br[t.i] !== b) continue;
        t.foldTo = on ? 0 : 1;
        if (instant) { t.fold = t.foldTo; t.foldDelay = 0; } else t.foldDelay = (on ? t.dist : 0) * .06;
      }
      if (!instant) { const m = bridgeMats[b]; m.emissive.setHex(on ? 0x22d46a : 0xe8463a); m.emissiveIntensity = 1; }
    }

    function fitCamera(yaw = CFG.yaw) {
      const pts = [];
      for (let i = 0; i < L.cell.length; i++) {
        if (L.cell[i] === VOID) continue;
        const x = i % L.w - ox, z = (i / L.w | 0) - oz;
        for (const [dx, dz] of [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]]) { pts.push(V3(x + dx, 0, z + dz)); pts.push(V3(x + dx, -CFG.tileH, z + dz)); }
      }
      pts.push(V3(L.start[0] - ox, 2.1, L.start[1] - oz));
      camDir.set(Math.sin(yaw) * Math.cos(CFG.pitch), Math.sin(CFG.pitch), Math.cos(yaw) * Math.cos(CFG.pitch));
      camTarget.set(0, 0, 0);
      let dist = 30;
      const port = H > W, xr = port ? [-.96, .96] : [-.9, .9], yr = touch ? (port ? [-.5, .72] : [-.6, .7]) : [-.88, .7];
      const right = V3(0, 0, 0), up = V3(0, 0, 0), half = Math.tan(CFG.fov * Math.PI / 360);
      for (let k = 0; k < 7; k++) {
        camera.position.copy(camTarget).addScaledVector(camDir, dist);
        camera.lookAt(camTarget); camera.updateMatrixWorld();
        let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
        for (const p of pts) { vTmp.copy(p).project(camera); x0 = Math.min(x0, vTmp.x); x1 = Math.max(x1, vTmp.x); y0 = Math.min(y0, vTmp.y); y1 = Math.max(y1, vTmp.y); }
        const s = Math.max((x1 - x0) / (xr[1] - xr[0]), (y1 - y0) / (yr[1] - yr[0]));
        right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
        const hh = half * dist, hw = hh * camera.aspect;
        camTarget.addScaledVector(right, ((x0 + x1) / 2 - (xr[0] + xr[1]) / 2) * hw).addScaledVector(up, ((y0 + y1) / 2 - (yr[0] + yr[1]) / 2) * hh);
        dist *= Math.max(.5, Math.min(1.8, s));
      }
      camDist = dist;
      placeCamera(yaw);
      const span = Math.max(L.w, L.h) * .78 + 2;
      sun.position.set(-span * .55, span * 1.3, span * .75); sun.target.position.set(0, 0, 0);
      const sc = sun.shadow.camera;
      sc.left = sc.bottom = -span; sc.right = sc.top = span; sc.near = .5; sc.far = span * 4; sc.updateProjectionMatrix();
      rim.position.set(span, span * .6, -span);
      const o = V3(0, 0, 0).project(camera), px = V3(1, 0, 0).project(camera), pz = V3(0, 0, 1).project(camera);
      axS[0] = px.x - o.x; axS[1] = -(px.y - o.y) * H / W; azS[0] = pz.x - o.x; azS[1] = -(pz.y - o.y) * H / W;
    }
    function placeCamera(yaw) {
      camDir.set(Math.sin(yaw) * Math.cos(CFG.pitch), Math.sin(CFG.pitch), Math.cos(yaw) * Math.cos(CFG.pitch));
      camera.position.copy(camTarget).addScaledVector(camDir, camDist);
      camera.lookAt(camTarget);
    }

    function blockPos(s, out) {
      if (s.o === 0) return out.set(s.x - ox, 1, s.y - oz);
      if (s.o === 1) return out.set(s.x + .5 - ox, .5, s.y - oz);
      return out.set(s.x - ox, .5, s.y + .5 - oz);
    }
    function showState() {
      if (st.k === 0) {
        blockMesh.visible = true; blockMesh.scale.set(1, 1, 1);
        blockPos(st, blockMesh.position);
        cubes[0].visible = cubes[1].visible = false;
      } else {
        blockMesh.visible = false;
        cubes.forEach((m, k) => { m.visible = true; m.scale.set(1, 1, 1); m.position.set(st.c[k][0] - ox, .5, st.c[k][1] - oz); });
        markActive();
      }
    }
    function markActive() {
      cubes.forEach((m, k) => { m.material = st && st.k === 1 && st.a === k ? matCubeOn : matBlock; });
      const split = !!(st && st.k === 1);
      elSwap.hidden = !split; elHint.hidden = !split || touch;
    }

    function updHud(force) {
      hud.stage.textContent = pad2(lvl + 1);
      hud.moves.textContent = moves;
      const s = secs | 0;
      if (force || s !== lastSec) { lastSec = s; hud.time.textContent = fmtTime(s); }
    }

    function banner(html, dur) {
      elBanner.innerHTML = html;
      elBanner.classList.remove('show'); void elBanner.offsetWidth; elBanner.classList.add('show');
      bannerT = dur;
    }
    let bannerT = 0, tipT = 0;
    const elTip = $('.br-tip');
    function showTip(i) {
      const t = TIPS[i];
      if (!t || (save.stars[i + 1] | 0) > 0) { elTip.classList.remove('show'); tipT = 0; return; }
      elTip.textContent = touch && t[1] ? t[1] : t[0];
      elTip.classList.add('show'); tipT = 9;
    }

    function startStage(i) {
      lvl = Math.max(0, Math.min(LEVELS.length - 1, i));
      buildLevel(LEVELS[lvl]);
      st = initState(L);
      moves = 0; secs = 0; falls = 0; hints = 0; undos = 0; hist.length = 0; buffered.length = 0; anim = null; fall = null;
      goalG.visible = false;
      for (const t of tiles) { t.holder.position.copy(t.base); t.holder.position.y += 14 + (t.y + t.x * .3) * .05; }
      blockMesh.visible = false; cubes[0].visible = cubes[1].visible = false; markActive();
      phase = 'intro'; phaseT = 0; timerOn = false;
      elHud.hidden = false; elPad.hidden = !touch;
      updHud(true);
      banner(`<b>STAGE ${pad2(lvl + 1)}</b><span>${LEVELS[lvl].name}</span><i>${THEMES[Math.floor(lvl / WORLD) % THEMES.length].name.toUpperCase()} &middot; PAR ${LEVELS[lvl].par} &middot; CODE ${LEVELS[lvl].code}</i>`, CFG.bannerTime);
      if (lvl > save.unlocked) save.unlocked = lvl;
      save.last = lvl; persist();
      showTip(lvl);
      SND.tiles();
    }

    function dropBlock() {
      st = initState(L);
      showState();
      blockMesh.quaternion.copy(Q0[0]);
      blockMesh.position.y = 9;
      phase = 'drop'; phaseT = 0; hist.length = 0;
      goalG.visible = true;
      markActive();
    }

    function resetStage() {
      for (let b = 0; b < L.nb; b++) setBridge(b, L.m0 >> b & 1, true);
      for (const m of bridgeMats) m.emissiveIntensity = 0;
      for (const t of tiles) {
        t.spin = null; t.fallV = 0;
        if (t.t !== BRIDGE) { t.holder.position.copy(t.base); t.holder.rotation.set(0, 0, 0); t.holder.visible = true; }
      }
      applyFold(0);
      fall = null; anim = null; buffered.length = 0;
      dropBlock();
    }

    function restoreState(q) {
      for (let b = 0; b < L.nb; b++) setBridge(b, q.m >> b & 1, true);
      for (const m of bridgeMats) m.emissiveIntensity = 0;
      for (const t of tiles) {
        t.spin = null; t.fallV = 0;
        if (t.t !== BRIDGE) { t.holder.position.copy(t.base); t.holder.rotation.set(0, 0, 0); t.holder.visible = true; }
      }
      applyFold(0);
      fall = null; anim = null; splitFx = null; buffered.length = 0;
      st = cloneSt(q);
      showState();
      if (st.k === 0) blockMesh.quaternion.copy(Q0[st.o]); else cubes.forEach(m => m.quaternion.copy(Q0[0]));
      phase = 'play';
    }
    function undo() {
      if (screen || !hist.length || !(phase === 'play' || phase === 'roll' || phase === 'fall' || phase === 'busy')) return;
      const h = hist.pop();
      restoreState(h.s); moves = h.moves; undos++; updHud(); SND.undo();
      const m = st.k === 0 ? blockMesh : cubes[st.a]; m.scale.setScalar(1.06);
    }

    function heldDir() {
      if (holdTouch >= 0) return holdTouch;
      for (let k = heldKeys.length - 1; k >= 0; k--) { const d = KEYDIR[heldKeys[k]]; if (d != null) return d; }
      return -1;
    }

    function skipIntro() {
      if (phase !== 'intro') return;
      for (const t of tiles) t.holder.position.copy(t.base);
      dropBlock();
    }

    function act(d) {
      if (screen) return;
      if (phase === 'intro') skipIntro();
      if (d === 'swap') {
        if (phase === 'play') doSwap(); else if (phase === 'roll' || phase === 'busy' || phase === 'drop') queue('swap');
        return;
      }
      if (phase === 'play') doMove(d);
      else if (phase === 'roll' || phase === 'busy' || phase === 'drop') queue(d);
    }

    function doSwap() {
      if (!st || st.k !== 1) return;
      st.a = 1 - st.a; markActive(); SND.swap();
      const m = cubes[st.a]; m.scale.set(1.12, 1.12, 1.12);
    }

    function doMove(d) {
      hist.push({ s: cloneSt(st), moves }); if (hist.length > 300) hist.shift();
      const res = step(L, st, d);
      moves++; totalMoves++; updHud();
      timerOn = true;
      const mesh = st.k === 0 ? blockMesh : cubes[st.a];
      const cells = st.k === 0 ? blockCells(st) : [st.c[st.a]];
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const [cx, cy] of cells) { x0 = Math.min(x0, cx - .5); x1 = Math.max(x1, cx + .5); z0 = Math.min(z0, cy - .5); z1 = Math.max(z1, cy + .5); }
      const P = d === 0 ? V3(x0 - ox, 0, 0) : d === 1 ? V3(x1 - ox, 0, 0) : d === 2 ? V3(0, 0, z0 - oz) : V3(0, 0, z1 - oz);
      const pEnd = V3(0, 0, 0);
      if (st.k === 0) blockPos(res.s, pEnd); else { const c = st.c[st.a]; pEnd.set(c[0] + DIRS[d][0] - ox, .5, c[1] + DIRS[d][1] - oz); }
      mesh.scale.set(1, 1, 1);
      anim = { mesh, t: 0, P, axis: AX[d], ang: ANG[d], p0: mesh.position.clone(), q0: mesh.quaternion.clone(), pEnd, res, d };
      phase = 'roll';
    }

    function finishMove() {
      const { mesh, res, d, axis, ang, pEnd, q0 } = anim;
      qTmp.setFromAxisAngle(axis, ang);
      mesh.quaternion.copy(qTmp).multiply(q0).normalize();
      mesh.position.copy(pEnd);
      anim = null;
      const prevK = st.k;
      st = res.s;
      SND.land();
      if (res.r !== 'fall') { if (st.k === 0) for (const [cx, cy] of blockCells(st)) burst(cx - ox, .02, cy - oz, st.o === 0 ? 7 : 3, matDust, 1.1, .5, 1.2, .45); else { const c = st.c[st.a]; burst(c[0] - ox, .02, c[1] - oz, 4, matDust, 1, .5, 1.2, .4); } }
      let bridgeOff = false, splitEv = false, mergeEv = false, brokeTile = null;
      for (const e of res.ev) {
        if (e.t === 'press') { const t = tileAt[e.i]; if (t) t.press = 1; SND.click(); }
        else if (e.t === 'bridge') { setBridge(e.b, e.on, false); SND.bridge(e.on); if (!e.on) bridgeOff = true; }
        else if (e.t === 'break') brokeTile = tileAt[e.i];
        else if (e.t === 'split') splitEv = true;
        else if (e.t === 'merge') mergeEv = true;
      }
      if (res.r === 'win') {
        phase = 'sink'; phaseT = 0; timerOn = false; SND.win();
        return;
      }
      if (res.r === 'fall') {
        startFall(mesh, d, brokeTile, bridgeOff ? CFG.bridgeTime : 0, prevK);
        return;
      }
      if (splitEv) {
        phase = 'busy'; phaseT = 0; SND.split();
        splitFx = { t: 0 };
        cubes.forEach((m, k) => { m.visible = true; m.quaternion.copy(Q0[0]); m.position.set(st.c[k][0] - ox, 3.2, st.c[k][1] - oz); m.scale.set(.01, .01, .01); });
        markActive();
        return;
      }
      if (mergeEv) {
        cubes[0].visible = cubes[1].visible = false;
        blockMesh.visible = true; blockMesh.quaternion.copy(Q0[st.o]); blockPos(st, blockMesh.position);
        blockMesh.scale.set(1.08, 1.08, 1.08);
        SND.merge(); markActive();
      }
      phase = 'play';
      continueInput();
    }

    function continueInput() {
      if (phase !== 'play' || screen) return;
      while (buffered.length && buffered[0] === 'swap') { buffered.shift(); doSwap(); }
      if (buffered.length) { act(buffered.shift()); return; }
      const h = heldDir();
      if (h >= 0) doMove(h);
    }

    let splitFx = null;

    function startFall(mesh, d, brokeTile, delay, prevK) {
      phase = 'fall'; phaseT = 0; falls++;
      if (st.k === 1) { const j = st.c.findIndex(c => !solid(L, st.m, c[0], c[1])); if (j >= 0 && cubes[j] !== mesh) { mesh = cubes[j]; d = null; } }
      const f = { mesh, delay, t: 0, mode: 'free', vel: V3(0, 0, 0), spinAxis: V3(1, 0, 0), spin: 0, P: null, axis: null, sign: 1, ang: 0, w: 0, p0: null, q0: null, tile: brokeTile, prev: V3(0, 0, 0) };
      if (st.k === 0 && st.o !== 0) {
        const cs = blockCells(st), sup = cs.map(c => solid(L, st.m, c[0], c[1]));
        if (sup[0] !== sup[1]) {
          const out = sup[0] ? 1 : 0;
          f.mode = 'tip';
          f.P = V3((cs[0][0] + cs[1][0]) / 2 - ox, 0, (cs[0][1] + cs[1][1]) / 2 - oz);
          const dd = st.o === 1 ? (out ? 1 : 0) : (out ? 3 : 2);
          f.axis = AX[dd]; f.sign = Math.sign(ANG[dd]); f.w = 2.2;
          f.p0 = mesh.position.clone(); f.q0 = mesh.quaternion.clone();
        }
      }
      if (f.mode === 'free') {
        if (d != null && !brokeTile && delay === 0) {
          f.vel.set(DIRS[d][0] * 1.4, 0, DIRS[d][1] * 1.4);
          f.spinAxis.copy(AX[d]).multiplyScalar(Math.sign(ANG[d])); f.spin = 4.5;
        } else {
          f.spinAxis.set(Math.random() - .5, 0, Math.random() - .5).normalize(); f.spin = 1.2;
        }
      }
      if (brokeTile) { burst(brokeTile.x - ox, 0, brokeTile.y - oz, 14, matShard, 2.2, 3, 14, .9); SND.crack(); brokeTile.spin = V3(Math.random() - .5, 0, Math.random() - .5).normalize(); brokeTile.fallV = 0; }
      fall = f;
      api.timeout(() => { if (phase === 'fall') SND.fall(); }, delay * 1000 + 120);
    }

    function updFall(dt) {
      const f = fall;
      if (f.delay > 0) { f.delay -= dt; return; }
      f.t += dt;
      const m = f.mesh;
      if (f.mode === 'tip') {
        f.prev.copy(m.position);
        f.w += CFG.tipAccel * dt * .35; f.ang += f.w * dt;
        if (f.ang >= Math.PI / 2) {
          f.ang = Math.PI / 2;
          f.mode = 'free';
          f.vel.copy(m.position).sub(f.prev).divideScalar(Math.max(dt, 1e-3));
          f.spinAxis.copy(f.axis).multiplyScalar(f.sign); f.spin = f.w;
        }
        qTmp.setFromAxisAngle(f.axis, f.sign * f.ang);
        m.position.copy(f.p0).sub(f.P).applyQuaternion(qTmp).add(f.P);
        m.quaternion.copy(qTmp).multiply(f.q0);
      } else {
        f.vel.y -= CFG.fallG * dt;
        m.position.addScaledVector(f.vel, dt);
        qTmp.setFromAxisAngle(f.spinAxis, f.spin * dt);
        m.quaternion.premultiply(qTmp);
      }
      if (f.tile) {
        const t = f.tile;
        t.fallV -= CFG.fallG * dt;
        t.holder.position.y += t.fallV * dt;
        qTmp.setFromAxisAngle(t.spin, dt * 1.5);
        t.holder.quaternion.premultiply(qTmp);
      }
      if (f.t > CFG.fallTime) resetStage();
    }

    function stageCleared() {
      const n = lvl + 1, par = LEVELS[lvl].par, stars = starsFor(moves, par, hints);
      const prevBest = save.best[n], prevStars = save.stars[n] | 0;
      if (prevBest == null || moves < prevBest) save.best[n] = moves;
      if (stars > prevStars) save.stars[n] = stars;
      save.cleared = Math.max(save.cleared || 0, n);
      save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length - 1, n));
      persist();
      api.score(save.cleared);
      totalSecs += secs;
      api.submit(n);
      goalG.visible = false;
      const isBest = prevBest != null && moves < prevBest;
      const last = lvl + 1 >= LEVELS.length;
      setScreen('clear', `<p class="br-kick">STAGE ${pad2(n)} &middot; ${LEVELS[lvl].name}</p>
        <h3 class="br-h">${isBest ? 'New best!' : stars === 3 ? 'Perfect!' : 'Stage clear'}</h3>
        ${stars3(stars, 'br-stars')}
        <div class="br-stats2"><div><i>MOVES</i><b>${moves}</b></div><div><i>PAR</i><b>${par}</b></div><div><i>TIME</i><b>${fmtTime(secs | 0)}</b></div><div><i>FALLS</i><b>${falls}</b></div></div>
        <p class="br-sub">${stars < 3 ? (hints ? 'Hint used, 2 stars max. ' : '') + 'Finish in ' + par + ' moves for 3 stars' : 'Par reached'} &middot; best ${save.best[n]} &middot; ${totalStars()}/${LEVELS.length * 3} stars</p>
        <div class="br-row"><button class="br-b" data-act="retry">Retry</button><button class="br-b pri" data-act="${last ? 'end' : 'next'}">${last ? 'Finish' : 'Next stage'}</button></div>
        <button class="br-b ghost" data-act="stages">All stages</button>`);
      for (let k = 0; k < stars; k++) api.timeout(() => { if (screen === 'clear') SND.star(k); }, 280 + k * 220);
    }

    function updIntro(dt) {
      phaseT += dt;
      for (const t of tiles) {
        if (t.t === BRIDGE && t.fold >= .999) { t.holder.position.copy(t.base); continue; }
        const k = Math.max(0, Math.min(1, (phaseT - t.delay) / CFG.introDrop)), e = 1 - Math.pow(1 - k, 3);
        t.holder.position.set(t.base.x, t.base.y + (1 - e) * 14, t.base.z);
      }
      if (phaseT >= CFG.introTime) { for (const t of tiles) t.holder.position.copy(t.base); dropBlock(); }
    }

    function updOutro(dt) {
      phaseT += dt;
      for (const t of tiles) {
        const k = phaseT - t.delay * .6;
        if (k <= 0) continue;
        t.holder.position.y = t.base.y - .5 * CFG.fallG * .6 * k * k;
        t.holder.rotation.x = (t.base.x % 2 ? 1 : -1) * k * .8;
      }
      if (phaseT >= CFG.outroTime) phase = 'done';
    }

    function frame(dt, now) {
      if (screen === 'pause') { renderer.render(scene, camera); return; }
      if (timerOn && (phase === 'play' || phase === 'roll' || phase === 'busy' || phase === 'fall' || phase === 'drop')) { secs += dt; updHud(); }
      if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) elBanner.classList.remove('show'); }
      if (tipT > 0 && phase !== 'intro') { tipT -= dt; if (tipT <= 0 || phase === 'outro') { tipT = 0; elTip.classList.remove('show'); } }
      if (phase === 'title') {
        placeCamera(CFG.yaw + Math.sin(now / 4000) * .35);
      } else if (phase === 'intro') updIntro(dt);
      else if (phase === 'drop') {
        phaseT += dt;
        const k = Math.min(1, phaseT / CFG.blockDrop);
        blockMesh.position.y = 1 + 8 * (1 - k * k);
        if (k >= 1) { blockMesh.position.y = 1; SND.thud(); phase = 'play'; continueInput(); }
      } else if (phase === 'roll' && anim) {
        anim.t += dt;
        const k = Math.min(1, anim.t / CFG.roll), e = 1 - Math.cos(k * Math.PI / 2);
        qTmp.setFromAxisAngle(anim.axis, anim.ang * e);
        anim.mesh.position.copy(anim.p0).sub(anim.P).applyQuaternion(qTmp).add(anim.P);
        anim.mesh.quaternion.copy(qTmp).multiply(anim.q0);
        if (k >= 1) finishMove();
      } else if (phase === 'busy' && splitFx) {
        splitFx.t += dt;
        const k = Math.min(1, splitFx.t / .32);
        blockMesh.scale.setScalar(Math.max(.01, 1 - k * 1.6));
        blockMesh.visible = k < .6;
        cubes.forEach((m, j) => { const kk = Math.min(1, Math.max(0, (splitFx.t - .1) / .3)); m.scale.setScalar(Math.max(.01, kk)); m.position.y = .5 + 2.7 * (1 - kk) * (1 - kk); });
        if (splitFx.t >= .42) {
          splitFx = null; blockMesh.visible = false; blockMesh.scale.set(1, 1, 1);
          cubes.forEach((m, j) => { m.scale.set(1, 1, 1); m.position.y = .5; });
          SND.land(); phase = 'play'; continueInput();
        }
      } else if (phase === 'fall' && fall) updFall(dt);
      else if (phase === 'sink') {
        phaseT += dt;
        const k = Math.min(1, phaseT / CFG.sinkTime);
        blockMesh.position.y = 1 - 3.4 * k * k;
        if (k >= 1) { blockMesh.visible = false; phase = 'outro'; phaseT = 0; burst(goalG.position.x, .1, goalG.position.z, 26, matSpark, 1.6, 6, 9, 1.1); stageCleared(); }
      } else if (phase === 'outro') updOutro(dt);
      for (const m of rocks) { const u = m.userData; m.rotation.x += dt * u.sp * (1 + u.ax); m.rotation.z += dt * u.sp * (1 + u.az); m.position.y = u.y + Math.sin(now / 1800 + u.ph) * .25; }
      applyFold(dt);
      updParts(dt);
      if (goalG.visible) { const p = .5 + .5 * Math.sin(now / 320); matBeam.opacity = .22 + .2 * p; matGoal.emissiveIntensity = .7 + .7 * p; }
      for (const t of tiles) if (t.press > 0) { t.press = Math.max(0, t.press - dt * 5); for (const c of t.mesh.children) c.position.y = .03 - .035 * Math.sin(t.press * Math.PI); }
      for (const m of bodies) if (m.scale.x > 1.001 && !(phase === 'busy')) m.scale.setScalar(Math.max(1, m.scale.x - dt * .8));
      renderer.render(scene, camera);
    }

    function setScreen(name, html) {
      screen = name;
      elScreen.className = 'br-screen' + (name ? ' on ' + name : '');
      elScreen.innerHTML = html || '';
      elScreen.hidden = !name;
      elHud.classList.toggle('dim', !!name && name !== 'pause');
      wrap.classList.toggle('scr', !!name);
    }

    function showTitle() {
      phase = 'title'; timerOn = false; anim = null; fall = null;
      elHud.hidden = true; elPad.hidden = true; elSwap.hidden = true; elHint.hidden = true;
      elBanner.classList.remove('show'); bannerT = 0;
      buildLevel(LEVELS[Math.min(save.unlocked, LEVELS.length - 1)]);
      st = initState(L); showState(); blockMesh.quaternion.copy(Q0[0]);
      const cont = save.unlocked > 0;
      setScreen('title', `<div class="br-logo"><img alt="Block Roll" src="${ledLogo('BLOCK ROLL')}"></div>
        <div class="br-menu-list">
          <button class="br-b pri" data-act="${cont ? 'cont' : 'new'}">${cont ? 'Continue &middot; Stage ' + (save.unlocked + 1) : 'Play'}</button>
          <button class="br-b" data-act="stages">Stages</button>
          <div class="br-row"><button class="br-b" data-act="help">How to play</button><button class="br-b" data-act="code">Passcode</button></div>
        </div>
        <p class="br-foot">${save.cleared ? STAR + ' ' + totalStars() + '/' + LEVELS.length * 3 + ' &middot; ' + save.cleared + ' of ' + LEVELS.length + ' stages cleared' : LEVELS.length + ' stages in 4 worlds &middot; drop the block in the hole'}</p>`);
    }

    let codeBuf = '', codeMsg = '';
    function showCode() {
      const slots = Array.from({ length: 6 }, (_, k) => `<i class="${k < codeBuf.length ? 'f' : ''}">${codeBuf[k] || ''}</i>`).join('');
      setScreen('code', `<div class="br-crow"><div class="br-ccol"><h3 class="br-h">Load stage</h3>
        <p class="br-sub">Enter the six-digit passcode shown at the start of a stage</p>
        <div class="br-slots${codeMsg ? ' bad' : ''}">${slots}</div>
        <p class="br-msg">${codeMsg || '&nbsp;'}</p></div>
        <div class="br-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="br-k" data-key="${n}">${n}</button>`).join('')}<button class="br-k sm" data-key="back">&larr;</button><button class="br-k" data-key="0">0</button><button class="br-k ok" data-key="ok">OK</button></div></div>
        <button class="br-b ghost" data-act="title">Back</button>`);
    }
    function codeKey(k) {
      if (k === 'back') { codeBuf = codeBuf.slice(0, -1); codeMsg = ''; SND.ui(); }
      else if (k === 'ok') {
        const i = LEVELS.findIndex(l => l.code === codeBuf);
        if (i >= 0) { SND.merge(); setScreen(null); startStage(i); return; }
        codeMsg = codeBuf.length < 6 ? 'Six digits needed' : 'Unknown passcode'; SND.bad();
      } else if (codeBuf.length < 6) { codeBuf += k; codeMsg = ''; SND.ui(); }
      showCode();
    }

    function showStages() {
      const open = i => i <= save.unlocked + 2;
      let h = '';
      for (let w = 0; w * WORLD < LEVELS.length; w++) {
        const th = THEMES[w % THEMES.length];
        let ws = 0, cells = '';
        for (let i = w * WORLD; i < Math.min(LEVELS.length, (w + 1) * WORLD); i++) {
          const ok = open(i), sN = save.stars[i + 1] | 0, done = save.best[i + 1] != null;
          ws += sN;
          cells += `<button class="br-st${ok ? '' : ' lock'}${done ? ' done' : ''}${i === save.unlocked ? ' cur' : ''}" ${ok ? `data-stage="${i}"` : 'disabled'} aria-label="Stage ${i + 1}"><b>${i + 1}</b>${stars3(sN, 'br-mini')}</button>`;
        }
        h += `<div class="br-world" style="--c:${th.css}"><div class="br-wn"><b>${th.name}</b><span>${STAR}${ws}/${WORLD * 3}</span></div><div class="br-grid">${cells}</div></div>`;
      }
      setScreen('stages', `<h3 class="br-h">Stages</h3><p class="br-sub">${STAR.replace('<svg', '<svg class="br-si"')} ${totalStars()}/${LEVELS.length * 3} &middot; reach par for 3 stars &middot; the next three stages are always open</p><div class="br-worlds">${h}</div><button class="br-b ghost" data-act="title">Back</button>`);
    }

    function showHelp(first) {
      setScreen('help', `<h3 class="br-h">How to play</h3>
        <div class="br-help">
          <div><span class="ic blk"></span><p>Roll the block with the <b>arrow keys</b> (swipe or D-pad on touch). Stand it upright over the <b>square hole</b> to drop in.</p></div>
          <div><span class="ic hole"></span><p>Any part off the edge and the block falls &mdash; the stage restarts.</p></div>
          <div><span class="ic frag"></span><p><b>Orange tiles</b> are fragile: they give way if the block stands upright on them.</p></div>
          <div><span class="ic soft"></span><p><b>Round switches</b> work on any touch. They open, close or toggle bridges.</p></div>
          <div><span class="ic heavy"></span><p><b>X switches</b> are heavy: only an upright block presses them.</p></div>
          <div><span class="ic split"></span><p><b>Split switches</b> break the block into two cubes. <b>Space</b> (or SWAP) picks the cube; put them side by side to join up.</p></div>
          <div><span class="ic undo"></span><p><b>Z</b> or <b>Undo</b> takes a move back, even mid-fall. <b>R</b> restarts, <b>H</b> gives a hint.</p></div>
          <div><span class="ic star"></span><p>Finish in the <b>par</b> number of moves for <b>3 stars</b>. Hints cap a stage at 2 stars.</p></div>
        </div>
        <button class="br-b pri" data-act="${first ? 'new' : 'title'}">${first ? 'Play' : 'Got it'}</button>`);
    }

    function showPause() {
      if (screen || phase === 'title') return;
      setScreen('pause', `<h3 class="br-h">Paused</h3>
        <p class="br-sub">Stage ${pad2(lvl + 1)} &middot; ${LEVELS[lvl].name} &middot; passcode ${LEVELS[lvl].code}</p>
        <div class="br-menu-list">
          <button class="br-b pri" data-act="resume">Resume</button>
          <button class="br-b" data-act="restart">Restart stage</button>
          <button class="br-b" data-act="stages">All stages</button>
          <button class="br-b" data-act="title">Main menu</button>
        </div>`);
    }

    function showEnd() {
      phase = 'end'; timerOn = false; clearLevel(); blockMesh.visible = cubes[0].visible = cubes[1].visible = false;
      elHud.hidden = true; elPad.hidden = true;
      setScreen('end', `<div class="br-logo sm"><img alt="Well done" src="${ledLogo('WELL DONE')}"></div>
        <p class="br-sub">The final stage is cleared &mdash; all ${LEVELS.length} holes conquered. Go back for the stars you missed.</p>
        <div class="br-stats2"><div><i>STARS</i><b>${totalStars()}/${LEVELS.length * 3}</b></div><div><i>MOVES</i><b>${totalMoves}</b></div><div><i>TIME</i><b>${fmtTime(totalSecs | 0)}</b></div></div>
        <div class="br-menu-list"><button class="br-b pri" data-act="stages">All stages</button><button class="br-b" data-act="title">Main menu</button></div>`);
    }

    function doAct(a) {
      SND.ui();
      if (a === 'cont') { setScreen(null); startStage(save.unlocked); }
      else if (a === 'new') { if (!save.seenHelp) { save.seenHelp = true; persist(); showHelp(true); return; } setScreen(null); startStage(0); }
      else if (a === 'stages') showStages();
      else if (a === 'retry') { setScreen(null); startStage(lvl); }
      else if (a === 'next') { setScreen(null); startStage(lvl + 1); }
      else if (a === 'end') showEnd();
      else if (a === 'code') { codeBuf = ''; codeMsg = ''; showCode(); }
      else if (a === 'help') showHelp();
      else if (a === 'title') showTitle();
      else if (a === 'resume') setScreen(null);
      else if (a === 'restart') { setScreen(null); if (phase !== 'intro' && phase !== 'outro' && phase !== 'sink') { falls++; resetStage(); } }
      else if (a === 'pause') showPause();
    }

    api.on(wrap, 'click', e => {
      const b = e.target.closest('[data-act]');
      if (b) { e.preventDefault(); doAct(b.dataset.act); return; }
      const sb = e.target.closest('[data-stage]');
      if (sb && screen === 'stages') { e.preventDefault(); SND.ui(); setScreen(null); startStage(+sb.dataset.stage); return; }
      const k = e.target.closest('[data-key]');
      if (k && screen === 'code') codeKey(k.dataset.key);
      else if (screen === 'title' && e.target === elScreen) doAct(save.unlocked > 0 ? 'cont' : 'new');
    });

    const KEYDIR = { ArrowLeft: 0, KeyA: 0, ArrowRight: 1, KeyD: 1, ArrowUp: 2, KeyW: 2, ArrowDown: 3, KeyS: 3 };
    api.on(window, 'keydown', e => {
      const c = e.code;
      if (KEYDIR[c] != null || c === 'Space') e.preventDefault();
      if (screen === 'code') {
        if (/^Digit\d$|^Numpad\d$/.test(c)) codeKey(c.slice(-1));
        else if (c === 'Backspace') codeKey('back');
        else if (c === 'Enter' || c === 'NumpadEnter') codeKey('ok');
        return;
      }
      if (screen) {
        if (e.repeat) return;
        if (screen === 'clear' && c === 'KeyR') { doAct('retry'); return; }
        if (screen === 'title' && /^Digit\d$|^Numpad\d$/.test(c)) { codeBuf = ''; codeMsg = ''; codeKey(c.slice(-1)); return; }
        if (c === 'Enter' || c === 'Space' || (screen === 'title' && KEYDIR[c] != null)) { const b = elScreen.querySelector('.pri'); if (b) doAct(b.dataset.act); }
        else if (screen === 'pause' && c === 'KeyP') doAct('resume');
        return;
      }
      if (KEYDIR[c] != null) {
        const i = heldKeys.indexOf(c); if (i >= 0) heldKeys.splice(i, 1); heldKeys.push(c);
        if (!e.repeat) act(KEYDIR[c]);
        else if (phase === 'play') act(KEYDIR[c]);
      } else if (c === 'Space') { if (!e.repeat) act('swap'); }
      else if (c === 'KeyR' && !e.repeat) { if (phase === 'play' || phase === 'roll' || phase === 'busy') { falls++; resetStage(); } }
      else if (c === 'KeyP' && !e.repeat) showPause();
      else if (c === 'KeyH' && !e.repeat) hint();
      else if (c === 'KeyZ' || c === 'KeyU' || c === 'Backspace') { e.preventDefault(); undo(); }
    });
    api.on(window, 'keyup', e => { const i = heldKeys.indexOf(e.code); if (i >= 0) heldKeys.splice(i, 1); });
    api.on(window, 'blur', () => { heldKeys.length = 0; holdTouch = -1; });

    function swipeDir(dx, dy) {
      const n = Math.hypot(dx, dy); if (!n) return -1;
      const cands = [[-axS[0], -axS[1]], [axS[0], axS[1]], [-azS[0], -azS[1]], [azS[0], azS[1]]];
      let best = -1, bd = -2;
      cands.forEach(([x, y], k) => { const l = Math.hypot(x, y) || 1, dot = (x * dx + y * dy) / (l * n); if (dot > bd) { bd = dot; best = k; } });
      return best;
    }
    let sw = null;
    api.on(canvas, 'pointerdown', e => {
      if (screen) return;
      skipIntro();
      sw = { id: e.pointerId, x: e.clientX, y: e.clientY, done: false };
      audio();
    });
    api.on(canvas, 'pointermove', e => {
      if (!sw || sw.id !== e.pointerId || sw.done) return;
      const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
      if (Math.hypot(dx, dy) < 22) return;
      sw.done = true;
      act(swipeDir(dx, dy));
    });
    const endSw = e => { if (sw && sw.id === e.pointerId) sw = null; };
    api.on(canvas, 'pointerup', endSw); api.on(canvas, 'pointercancel', endSw);

    elPad.querySelectorAll('[data-d]').forEach(b => {
      const d = +b.dataset.d;
      api.on(b, 'pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) {} holdTouch = d; b.classList.add('dn'); audio(); act(d); });
      const up = () => { if (holdTouch === d) holdTouch = -1; b.classList.remove('dn'); };
      api.on(b, 'pointerup', up); api.on(b, 'pointercancel', up); api.on(b, 'lostpointercapture', up);
    });
    api.on(elSwap, 'pointerdown', e => { e.preventDefault(); audio(); act('swap'); });
    api.on($('.br-menu:not(.br-hintb):not(.br-undob)'), 'pointerdown', e => { e.preventDefault(); showPause(); });
    api.on($('.br-undob'), 'pointerdown', e => { e.preventDefault(); audio(); undo(); });
    api.on($('.br-hintb'), 'pointerdown', e => { e.preventDefault(); audio(); hint(); });
    function hint() {
      if (screen || phase !== 'play' || !st) return;
      const r = solve(L, 4e5, st.k ? { ...st, c: [st.c[0].slice(), st.c[1].slice()] } : { ...st });
      if (!r.raw || !r.raw.length) { banner('<b>NO WAY OUT</b><span>Press R to restart the stage</span>', 2); SND.bad(); return; }
      const [a, d] = r.raw[0], name = ['LEFT', 'RIGHT', 'UP', 'DOWN'][d], key = ['&larr;', '&rarr;', '&uarr;', '&darr;'][d];
      if (a >= 0 && st.k === 1 && a !== st.a) doSwap();
      hints++;
      banner(`<b>HINT ${key}</b><span>Roll ${name}${a >= 0 ? ' (glowing cube)' : ''} &middot; ${r.moves} moves left</span>`, 1.8);
    }
    api.on(wrap, 'touchstart', () => { if (!touch) { touch = true; wrap.classList.add('touch'); if (phase !== 'title' && phase !== 'end') elPad.hidden = false; markActive(); } }, { passive: true });

    showTitle();
    api.loop(frame);

    return () => {
      clearLevel();
      for (const o of disp) { try { o.dispose(); } catch (e) {} }
      if (ac) { try { ac.close(); } catch (e) {} ac = null; }
    };
  }


  Ameplay.register({
    id: 'block-roll',
    title: 'Block Roll',
    category: '3D',
    tint: '#b4532a',
    blurb: 'Roll the rusty block across 40 floating stages in four worlds and drop it in the hole. Reach par for three stars.',
    help: '<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> roll · <kbd>Space</kbd> swap cube · <kbd>Z</kbd> undo · <kbd>R</kbd> restart stage · <kbd>H</kbd> hint · <kbd>P</kbd> pause · touch: swipe or D-pad',
    better: 'high',
    format: v => v + '/' + LEVELS.length,
    width: 960,
    logic: LOGIC,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 44 32 56l24-12-24-12z"/><path d="M8 44v4l24 12 24-12v-4" opacity=".45"/><path d="M26 12l10 5v22l-10-5z"/><path d="M26 12l6-3 10 5-6 3M42 14v22l-6 3"/></svg>',
    css: `
${G}{gap:0}
${G} .g-loading{display:none}
${G} .br-load{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2cqw;background:radial-gradient(ellipse at 50% 55%,#d83410 0,#a01400 50%,#3a0400 100%);font-weight:900;letter-spacing:.14em;font-size:clamp(12px,1.8cqw,18px);color:#ffe8de}
${G} .br-load i{width:max(34px,5cqw);height:max(34px,5cqw);border-radius:50%;border:4px solid rgba(255,205,180,.25);border-top-color:#ffb066;animation:spin .8s linear infinite}
${G} .br-wrap{position:relative;border-radius:var(--r);overflow:hidden;background:#7a0e02;touch-action:none;user-select:none;-webkit-user-select:none;container-type:inline-size;font-family:var(--sans);color:#fff}
${G} .br-hud{position:absolute;left:0;right:0;top:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:start;gap:2cqw;padding:1.6cqw 2.2cqw;pointer-events:none;font-family:Verdana,Tahoma,var(--sans);color:#d6d6d6;text-shadow:0 .25cqw 0 rgba(40,0,0,.85),0 0 .8cqw rgba(60,0,0,.8)}
${G} .br-hl{display:flex;gap:1.2cqw}
${G} .br-hc{font-size:clamp(18px,3.8cqw,38px);font-weight:900;letter-spacing:.04em;white-space:nowrap;line-height:1.1}
${G} .br-hc b{font-variant-numeric:tabular-nums}
${G} .br-hr{display:flex;flex-direction:column;align-items:flex-end;gap:.2cqw;line-height:1.15}
${G} .br-hr div{display:grid;grid-template-columns:auto minmax(4.2em,auto);gap:1.2cqw;font-size:clamp(12px,2.3cqw,23px);font-weight:700;white-space:nowrap}
${G} .br-hr i{font-style:normal;text-align:right}
${G} .br-hr b{font-weight:700;text-align:right;font-variant-numeric:tabular-nums;letter-spacing:.06em}
${G} .br-menu{pointer-events:auto;min-width:44px;height:max(34px,4.4cqw);padding:0 max(10px,1.4cqw);border:0;border-radius:.6cqw;background:rgba(40,0,0,.28);color:#d6d6d6;font:700 clamp(13px,2.3cqw,23px)/1 Verdana,Tahoma,var(--sans);text-shadow:inherit;cursor:pointer}
${G} .br-menu:hover{background:rgba(80,10,0,.45);color:#fff}
${G} .br-banner{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.9cqw;text-align:center;pointer-events:none;opacity:0;white-space:nowrap;padding:2cqw 7cqw;border-radius:50%;background:radial-gradient(closest-side,rgba(26,2,0,.82),rgba(26,2,0,0))}
${G} .br-banner.show{animation:brBan 2.2s ease forwards}
${G} .br-banner b{font-size:clamp(30px,7.4cqw,76px);font-weight:900;letter-spacing:.08em;color:#fff;text-shadow:0 .5cqw 0 #8f3d1f,0 1cqw 2cqw rgba(0,0,0,.55)}
${G} .br-banner span{font-size:clamp(14px,2.6cqw,26px);font-weight:900;color:#ffd9a8;text-shadow:0 2px 6px rgba(0,0,0,.6)}
${G} .br-banner i{font-style:normal;font-size:clamp(12px,1.9cqw,19px);font-weight:900;letter-spacing:.18em;color:#ffe8de;text-shadow:0 1px 4px #000,0 0 10px #000}
@keyframes brBan{0%{opacity:0;transform:translate(-50%,-30%) scale(.9)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-56%)}}
${G} .br-hint{position:absolute;left:50%;bottom:2.4cqw;transform:translateX(-50%);padding:.8cqw 2cqw;border-radius:999px;background:rgba(26,2,0,.6);font-size:clamp(11px,1.5cqw,15px);font-weight:800;pointer-events:none;white-space:nowrap}
${G} .br-swap{position:absolute;left:3cqw;bottom:3cqw;width:max(64px,11cqw);height:max(64px,11cqw);border-radius:50%;border:3px solid rgba(255,255,255,.5);background:radial-gradient(circle at 35% 30%,#c4643a,#7a2c12);color:#fff;font:900 clamp(12px,2cqw,18px)/1 var(--sans);letter-spacing:.06em;box-shadow:0 .6cqw 0 #4a1a08,0 1cqw 2.4cqw rgba(0,0,0,.5);cursor:pointer;touch-action:none}
${G} .br-swap:active{transform:translateY(.4cqw);box-shadow:0 .2cqw 0 #4a1a08}
${G} .br-pad{position:absolute;right:3cqw;bottom:3cqw;width:max(150px,25cqw);aspect-ratio:1;touch-action:none}
${G} .br-pad button{position:absolute;width:34%;height:34%;display:grid;place-items:center;border-radius:28%;border:2px solid rgba(255,255,255,.4);background:rgba(34,4,2,.62);color:#fff;padding:0;box-shadow:0 .5cqw 0 rgba(20,2,0,.7);touch-action:none;cursor:pointer}
${G} .br-pad button svg{width:58%;height:58%}
${G} .br-pad button.dn{background:rgba(196,100,58,.9);transform:translateY(.3cqw);box-shadow:0 .2cqw 0 rgba(20,2,0,.7)}
${G} .br-pad [data-d="2"]{left:33%;top:0}
${G} .br-pad [data-d="3"]{left:33%;bottom:0}
${G} .br-pad [data-d="3"] svg{transform:rotate(180deg)}
${G} .br-pad [data-d="0"]{left:0;top:33%}
${G} .br-pad [data-d="0"] svg{transform:rotate(-90deg)}
${G} .br-pad [data-d="1"]{right:0;top:33%}
${G} .br-pad [data-d="1"] svg{transform:rotate(90deg)}
${G} .br-screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.2cqw;padding:4cqw;text-align:center;background:radial-gradient(ellipse at 50% 45%,rgba(50,6,2,.35),rgba(26,2,0,.88))}
${G} .br-screen.title{background:radial-gradient(ellipse at 50% 56%,rgba(26,2,0,.7) 0,rgba(26,2,0,.5) 38%,rgba(26,2,0,.12) 100%)}
${G} .br-logo{display:flex;flex-direction:column;align-items:center;line-height:.86;margin-bottom:1cqw}
${G} .br-logo img{display:block;width:min(86cqw,780px);height:auto;filter:drop-shadow(0 0 2cqw rgba(0,0,0,.65))}
${G} .br-logo.sm img{width:min(80cqw,720px)}
${G} .br-menu-list{display:flex;flex-direction:column;gap:1.3cqw;width:min(88%,max(240px,38cqw))}
${G} .br-b{min-height:44px;height:max(44px,5.8cqw);border-radius:999px;border:2px solid rgba(255,205,180,.4);background:rgba(34,4,2,.72);color:#fff;font:900 clamp(14px,2.1cqw,21px)/1 var(--sans);letter-spacing:.03em;cursor:pointer;transition:transform .2s var(--spring),background .2s}
${G} .br-b:hover{transform:translateY(-2px);background:rgba(90,16,6,.85)}
${G} .br-b.pri{border:0;background:linear-gradient(#e8854a,#b0451f);box-shadow:0 .5cqw 0 #6a2510,0 1cqw 2cqw rgba(0,0,0,.45)}
${G} .br-b.pri:hover{background:linear-gradient(#f4985c,#c2522a)}
${G} .br-b.ghost{background:transparent;padding:0 6cqw}
${G} .br-foot{margin:0;padding:.9cqw 2.4cqw;border-radius:999px;background:rgba(26,2,0,.78);font-size:clamp(12px,1.7cqw,17px);font-weight:800;color:#ffe8de;text-shadow:0 1px 3px rgba(0,0,0,.6)}
${G} .br-h{margin:0;font-size:clamp(24px,4.6cqw,46px);font-weight:900;letter-spacing:.02em;text-shadow:0 .4cqw 0 #8f3d1f}
${G} .br-sub{margin:0;max-width:44em;font-size:clamp(12px,1.7cqw,17px);font-weight:700;color:#ffe8de;text-shadow:0 1px 3px rgba(0,0,0,.6)}
${G} .br-slots{display:flex;gap:1.2cqw}
${G} .br-slots i{width:max(34px,5.6cqw);height:max(44px,7cqw);display:grid;place-items:center;border-radius:1.2cqw;background:rgba(255,255,255,.08);border:2px solid rgba(255,205,180,.35);font:900 clamp(20px,3.6cqw,36px)/1 var(--sans);font-style:normal;color:#ffcf8a}
${G} .br-slots i.f{border-color:#ffb066;background:rgba(255,176,102,.12)}
${G} .br-slots.bad{animation:brShake .35s}
@keyframes brShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
${G} .br-msg{margin:-.6cqw 0;min-height:1.2em;font-size:clamp(11px,1.5cqw,15px);font-weight:800;color:#ff9a8a}
${G} .br-crow{display:flex;align-items:center;gap:5cqw}
${G} .br-ccol{display:flex;flex-direction:column;align-items:center;gap:2cqw;max-width:46cqw}
${G} .br-wrap.port .br-crow{flex-direction:column;gap:3cqw}
${G} .br-wrap.port .br-ccol{max-width:none}
${G} .br-keys{display:grid;grid-template-columns:repeat(3,max(56px,8.4cqw));gap:1cqw}
${G} .br-k{height:max(44px,5.6cqw);border-radius:1.4cqw;border:2px solid rgba(255,205,180,.35);background:rgba(34,4,2,.75);color:#fff;font:900 clamp(16px,2.5cqw,24px)/1 var(--sans);cursor:pointer}
${G} .br-k:active{background:rgba(196,100,58,.9)}
${G} .br-k.ok{background:linear-gradient(#e8854a,#b0451f);border:0}
${G} .br-help{display:grid;grid-template-columns:1fr 1fr;gap:1.6cqw 3cqw;max-width:min(96%,820px);text-align:left}
${G} .br-help div{display:flex;align-items:center;gap:1.6cqw}
${G} .br-help p{margin:0;font-size:clamp(11px,1.55cqw,15px);font-weight:700;line-height:1.35;color:#ffe8de}
${G} .br-help b{color:#ffcf8a}
${G} .ic{flex:none;position:relative;width:max(34px,5cqw);height:max(34px,5cqw);border-radius:16%;background:linear-gradient(#d3d6dd,#9aa0ab);box-shadow:inset 0 0 0 3px rgba(60,66,80,.35),0 .4cqw 0 #555c69}
${G} .ic.blk{width:max(22px,3.2cqw);height:max(40px,6cqw);border-radius:12%;background:linear-gradient(90deg,#a74a26,#7e321a);box-shadow:inset 0 0 0 2px rgba(40,10,0,.4),0 .4cqw 0 #4a1a08}
${G} .ic.hole{background:#1a0402;box-shadow:inset 0 0 0 4px #8d93a0}
${G} .ic.frag{background:linear-gradient(#f39a3c,#cf6c18);box-shadow:inset 0 0 0 3px rgba(140,60,10,.45),0 .4cqw 0 #8a4210}
${G} .ic.soft::after{content:"";position:absolute;inset:24%;border-radius:50%;background:#5f6674;box-shadow:inset 0 2px 0 rgba(255,255,255,.3)}
${G} .ic.heavy::before,${G} .ic.heavy::after{content:"";position:absolute;left:14%;right:14%;top:44%;height:12%;border-radius:2px;background:#5f6674;transform:rotate(45deg)}
${G} .ic.heavy::after{transform:rotate(-45deg)}
${G} .ic.split::before,${G} .ic.split::after{content:"";position:absolute;top:22%;bottom:22%;width:22%;border:3px solid #5f6674;border-radius:50%}
${G} .ic.split::before{left:20%;border-right-color:transparent}
${G} .ic.split::after{right:20%;border-left-color:transparent}
${G} .br-stats2{display:flex;gap:2cqw}
${G} .br-stats2 div{display:flex;flex-direction:column;gap:.4cqw;padding:1.4cqw 3cqw;border-radius:2cqw;background:rgba(255,255,255,.08)}
${G} .br-stats2 i{font-style:normal;font-size:clamp(10px,1.3cqw,13px);font-weight:900;letter-spacing:.14em;color:#ffc0a0}
${G} .br-stats2 b{font-size:clamp(20px,3.4cqw,34px);font-weight:900}
${G} .br-kick{margin:0;font-size:clamp(11px,1.6cqw,16px);font-weight:900;letter-spacing:.2em;color:#ffcf8a;text-shadow:0 1px 3px rgba(0,0,0,.6)}
${G} .br-stars{display:flex;gap:1.6cqw;align-items:flex-end}
${G} .br-stars i{display:block;width:max(46px,8cqw);height:max(46px,8cqw);color:rgba(0,0,0,.4)}
${G} .br-stars i:nth-child(2){width:max(58px,10.4cqw);height:max(58px,10.4cqw)}
${G} .br-stars svg{display:block;width:100%;height:100%;fill:currentColor;stroke:rgba(255,236,200,.35);stroke-width:.8;filter:drop-shadow(0 .35cqw 0 rgba(0,0,0,.35))}
${G} .br-stars i.on{color:#ffc93a;animation:brStar .55s var(--d) both cubic-bezier(.3,1.7,.5,1)}
@keyframes brStar{0%{transform:scale(0) rotate(-50deg);opacity:0}100%{transform:none;opacity:1}}
${G} .br-row{display:flex;gap:1.3cqw;width:100%}
${G} .br-screen>.br-row{width:min(92%,max(300px,46cqw))}
${G} .br-row .br-b{flex:1;padding:0 .6em}
${G} .br-screen.clear{background:radial-gradient(ellipse at 50% 50%,rgba(16,4,8,.62),rgba(10,2,6,.9))}
${G} .br-screen.stages{justify-content:safe center;overflow:auto;gap:1.6cqw}
${G} .br-si{display:inline-block;width:1.1em;height:1.1em;fill:#ffc93a;vertical-align:-.15em}
${G} .br-hud.dim{opacity:0}
${G} .br-tip{position:absolute;left:50%;bottom:7cqw;transform:translate(-50%,1cqw);max-width:min(80%,640px);padding:1cqw 2.4cqw;border-radius:1.6cqw;background:rgba(14,4,6,.78);border:1px solid rgba(255,205,180,.3);font-size:clamp(12px,1.7cqw,17px);font-weight:800;line-height:1.3;text-align:center;color:#ffe8de;pointer-events:none;opacity:0;transition:opacity .35s,transform .35s}
${G} .br-tip.show{opacity:1;transform:translate(-50%,0)}
${G} .br-wrap.scr .br-tip{visibility:hidden}
${G} .br-wrap.touch .br-tip{left:3cqw;bottom:3cqw;max-width:calc(94% - max(150px,25cqw));transform:translateY(1cqw);text-align:left}
${G} .br-wrap.touch .br-tip.show{transform:none}
${G} .br-wrap.scr .br-pad,${G} .br-wrap.scr .br-swap,${G} .br-wrap.scr .br-hint{visibility:hidden}
${G} .br-screen.help>.br-b{padding:0 3.2em}
${G} .br-worlds{display:flex;flex-direction:column;gap:1.2cqw;width:min(96%,860px)}
${G} .br-world{display:flex;align-items:center;gap:1.6cqw}
${G} .br-wn{flex:none;width:max(76px,11cqw);display:flex;flex-direction:column;align-items:flex-start;gap:.3cqw;text-align:left}
${G} .br-wn b{font-size:clamp(13px,2cqw,20px);font-weight:900;color:var(--c);text-shadow:0 1px 3px rgba(0,0,0,.6)}
${G} .br-wn span{display:flex;align-items:center;gap:.4cqw;font-size:clamp(10px,1.4cqw,14px);font-weight:800;color:#ffe8de}
${G} .br-wn svg{width:1.2em;height:1.2em;fill:#ffc93a}
${G} .br-grid{flex:1;display:grid;grid-template-columns:repeat(10,1fr);gap:.8cqw}
${G} .br-st{position:relative;aspect-ratio:1;min-height:40px;border-radius:1.2cqw;border:2px solid color-mix(in srgb,var(--c) 40%,transparent);background:rgba(14,4,6,.72);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3cqw;cursor:pointer;padding:0;font-family:var(--sans);transition:transform .15s,border-color .15s}
${G} .br-st b{font-size:clamp(13px,2cqw,20px);font-weight:900;line-height:1}
${G} .br-st:hover:not(.lock){transform:translateY(-2px);border-color:var(--c)}
${G} .br-st.done{background:linear-gradient(color-mix(in srgb,var(--c) 30%,transparent),rgba(255,255,255,.03)),rgba(14,4,6,.72)}
${G} .br-st.cur{box-shadow:0 0 0 2px var(--c),0 0 1.6cqw var(--c)}
${G} .br-st.lock{opacity:.32;cursor:default}
${G} .br-mini{display:flex;gap:1px}
${G} .br-mini i{display:block;width:max(9px,1.3cqw);height:max(9px,1.3cqw);color:rgba(255,255,255,.2)}
${G} .br-mini i.on{color:#ffc93a}
${G} .br-mini svg{display:block;width:100%;height:100%;fill:currentColor}
${G} .br-foot svg{display:inline-block;width:1.1em;height:1.1em;fill:#ffc93a;vertical-align:-.15em}
${G} .ic.undo{background:linear-gradient(#5c6a86,#3a4560);box-shadow:inset 0 0 0 3px rgba(20,30,50,.4),0 .4cqw 0 #232a3c}
${G} .ic.undo::after{content:"";position:absolute;inset:26%;border:3px solid #e8ecf4;border-left-color:transparent;border-radius:50%}
${G} .ic.star{background:none;box-shadow:none}
${G} .ic.star::after{content:"";position:absolute;inset:0;background:#ffc93a;clip-path:polygon(50% 4%,62% 37%,97% 38%,69% 59%,79% 93%,50% 73%,21% 93%,31% 59%,3% 38%,38% 37%)}
${G} .br-wrap.port .br-world{flex-direction:column;align-items:stretch;gap:.6cqw}
${G} .br-wrap.port .br-wn{flex-direction:row;width:auto;justify-content:space-between;align-items:center}
${G} .br-wrap.port .br-grid{grid-template-columns:repeat(5,1fr)}
${G} .br-wrap.port .br-st{aspect-ratio:auto;height:max(44px,10cqw)}
${G} .br-wrap.port .br-stats2{flex-wrap:wrap;justify-content:center}
${G} .br-wrap.port .br-help{grid-template-columns:1fr}
${G} .br-wrap.port .br-stats{gap:4cqw}
${G} .br-wrap.port .br-hud{grid-template-columns:1fr 1fr;row-gap:1cqw;padding:2.4cqw 3cqw}
${G} .br-wrap.port .br-hc{grid-row:2;grid-column:1/-1;text-align:center;font-size:clamp(18px,6cqw,40px)}
${G} .br-wrap.port .br-hr div{font-size:clamp(12px,3.6cqw,24px)}
${G} .br-wrap.port .br-hr div:last-child{display:none}
`,
    mount(root, api) {
      let touch = false;
      try { touch = matchMedia('(pointer: coarse)').matches; } catch (e) {}
      const port = innerWidth < 760 && innerHeight > innerWidth * 1.15;
      const W = port ? 720 : 960, H = port ? 960 : 600;
      const wrap = document.createElement('div');
      wrap.className = 'br-wrap' + (port ? ' port' : '') + (touch ? ' touch' : '');
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      wrap.style.aspectRatio = `${W} / ${H}`;
      wrap.innerHTML = `<div class="br-hud" hidden><div class="br-hl"><button class="br-menu" aria-label="Menu">Menu</button><button class="br-menu br-undob" aria-label="Undo">Undo</button><button class="br-menu br-hintb" aria-label="Hint">Hint</button></div><div class="br-hc">STAGE:&nbsp; <b data-h="stage">01</b></div><div class="br-hr"><div><i>Par:</i><b data-h="code">--</b></div><div><i>Moves:</i><b data-h="moves">0</b></div><div><i>Time:</i><b data-h="time">0:00</b></div></div></div>
        <div class="br-banner"></div>
        <div class="br-load"><i></i><span>LOADING</span></div>
        <div class="br-hint" hidden>Space &middot; switch cube</div>
        <div class="br-tip"></div>
        <button class="br-swap" hidden>SWAP</button>
        <div class="br-pad" hidden>${[2, 0, 1, 3].map(d => `<button data-d="${d}" aria-label="${['Left', 'Right', 'Up', 'Down'][d]}">${ARROW}</button>`).join('')}</div>
        <div class="br-screen" hidden></div>`;
      root.append(wrap);
      let cleanup = null;
      api.gl(W, H).then(v => { if (v && api.alive) { cleanup = run(root, api, v, wrap, W, H, touch); const ld = wrap.querySelector('.br-load'); if (ld) ld.remove(); } else { const ld = wrap.querySelector('.br-load'); if (ld) ld.remove(); } });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
  Ameplay.covers['block-roll'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="brk-bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#22408c"/><stop offset=".55" stop-color="#11205a"/><stop offset="1" stop-color="#060c2c"/></radialGradient><linearGradient id="brk-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5482a"/><stop offset="1" stop-color="#7a2f16"/></linearGradient><linearGradient id="brk-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a3a1e"/><stop offset="1" stop-color="#5e220e"/></linearGradient></defs><rect width="400" height="300" fill="url(#brk-bg)"/><path d="M115.7 63.2h0M291.7 159.8h0M302 162.9h0M273.8 190.8h0M149.7 212.4h0M279.2 16.2h0M369 242.2h0M49.1 153.9h0M257.5 173.2h0M364.8 272.5h0M334.9 99.7h0M61 89.3h0M374.9 167.2h0M291.7 263.4h0M224.3 152.6h0M168.6 57.9h0M146.2 103.2h0M265.8 277.3h0M162.2 85.1h0M145.8 127.2h0M245.6 70h0M362.6 137.4h0M253.7 154.9h0M202 206.7h0M283.3 75.3h0M234.7 105.2h0M317.9 263.3h0M44.4 245.8h0M61.4 23.4h0M398.5 66h0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/><path d="M0 276.2h0M131.7 225.6h0M326.7 72.6h0M273.6 140.4h0M369.3 206.6h0M148.9 100.6h0M171.4 88.5h0M23.4 82h0M363.6 16.5h0M205.9 49.7h0M133 159.5h0M345.2 190.5h0M375.8 119h0M132.2 117.4h0M31.1 122h0M252.9 43.3h0" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/><path d="M330 40l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#dfe6ff"/><path d="M60 230l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#dfe6ff" opacity=".8"/><path d="M168 153L197 167.5L168 182L139 167.5Z" fill="#050a22"/><path d="M170.3 95L197 108.3L197 117.3L170.3 104ZM112.3 95L139 108.3L139 117.3L112.3 104ZM199.3 109.5L226 122.8L226 131.8L199.3 118.5ZM141.3 109.5L168 122.8L168 131.8L141.3 118.5ZM83.3 109.5L110 122.8L110 131.8L83.3 118.5ZM228.3 124L255 137.3L255 146.3L228.3 133ZM170.3 124L197 137.3L197 146.3L170.3 133ZM112.3 124L139 137.3L139 146.3L112.3 133ZM257.3 138.5L284 151.8L284 160.8L257.3 147.5ZM199.3 138.5L226 151.8L226 160.8L199.3 147.5ZM141.3 138.5L168 151.8L168 160.8L141.3 147.5ZM83.3 138.5L110 151.8L110 160.8L83.3 147.5ZM228.3 153L255 166.3L255 175.3L228.3 162ZM170.3 153L197 166.3L197 175.3L170.3 162ZM112.3 153L139 166.3L139 175.3L112.3 162ZM257.3 167.5L284 180.8L284 189.8L257.3 176.5ZM199.3 167.5L226 180.8L226 189.8L199.3 176.5ZM83.3 167.5L110 180.8L110 189.8L83.3 176.5ZM286.3 182L313 195.3L313 204.3L286.3 191ZM228.3 182L255 195.3L255 204.3L228.3 191ZM170.3 182L197 195.3L197 204.3L170.3 191ZM112.3 182L139 195.3L139 204.3L112.3 191ZM199.3 196.5L226 209.8L226 218.8L199.3 205.5ZM141.3 196.5L168 209.8L168 218.8L141.3 205.5ZM170.3 211L197 224.3L197 233.3L170.3 220ZM199.3 225.5L226 238.8L226 247.8L199.3 234.5ZM228.3 240L255 253.3L255 262.3L228.3 249Z" fill="#8a909c"/><path d="M197 108.3L223.7 95L223.7 104L197 117.3ZM139 108.3L165.7 95L165.7 104L139 117.3ZM226 122.8L252.7 109.5L252.7 118.5L226 131.8ZM168 122.8L194.7 109.5L194.7 118.5L168 131.8ZM110 122.8L136.7 109.5L136.7 118.5L110 131.8ZM255 137.3L281.7 124L281.7 133L255 146.3ZM197 137.3L223.7 124L223.7 133L197 146.3ZM139 137.3L165.7 124L165.7 133L139 146.3ZM284 151.8L310.7 138.5L310.7 147.5L284 160.8ZM226 151.8L252.7 138.5L252.7 147.5L226 160.8ZM168 151.8L194.7 138.5L194.7 147.5L168 160.8ZM110 151.8L136.7 138.5L136.7 147.5L110 160.8ZM255 166.3L281.7 153L281.7 162L255 175.3ZM197 166.3L223.7 153L223.7 162L197 175.3ZM139 166.3L165.7 153L165.7 162L139 175.3ZM284 180.8L310.7 167.5L310.7 176.5L284 189.8ZM226 180.8L252.7 167.5L252.7 176.5L226 189.8ZM110 180.8L136.7 167.5L136.7 176.5L110 189.8ZM313 195.3L339.7 182L339.7 191L313 204.3ZM255 195.3L281.7 182L281.7 191L255 204.3ZM197 195.3L223.7 182L223.7 191L197 204.3ZM139 195.3L165.7 182L165.7 191L139 204.3ZM226 209.8L252.7 196.5L252.7 205.5L226 218.8ZM168 209.8L194.7 196.5L194.7 205.5L168 218.8ZM197 224.3L223.7 211L223.7 220L197 233.3ZM226 238.8L252.7 225.5L252.7 234.5L226 247.8ZM255 253.3L281.7 240L281.7 249L255 262.3Z" fill="#a8aeb9"/><path d="M257.3 196.5L284 209.8L284 218.8L257.3 205.5ZM286.3 211L313 224.3L313 233.3L286.3 220ZM228.3 211L255 224.3L255 233.3L228.3 220ZM257.3 225.5L284 238.8L284 247.8L257.3 234.5Z" fill="#b8601a"/><path d="M284 209.8L310.7 196.5L310.7 205.5L284 218.8ZM313 224.3L339.7 211L339.7 220L313 233.3ZM255 224.3L281.7 211L281.7 220L255 233.3ZM284 238.8L310.7 225.5L310.7 234.5L284 247.8Z" fill="#d5741f"/><path d="M197 81.7L223.7 95L197 108.3L170.3 95ZM139 81.7L165.7 95L139 108.3L112.3 95ZM226 96.2L252.7 109.5L226 122.8L199.3 109.5ZM168 96.2L194.7 109.5L168 122.8L141.3 109.5ZM110 96.2L136.7 109.5L110 122.8L83.3 109.5ZM255 110.7L281.7 124L255 137.3L228.3 124ZM197 110.7L223.7 124L197 137.3L170.3 124ZM139 110.7L165.7 124L139 137.3L112.3 124ZM284 125.2L310.7 138.5L284 151.8L257.3 138.5ZM226 125.2L252.7 138.5L226 151.8L199.3 138.5ZM168 125.2L194.7 138.5L168 151.8L141.3 138.5ZM110 125.2L136.7 138.5L110 151.8L83.3 138.5ZM255 139.7L281.7 153L255 166.3L228.3 153ZM197 139.7L223.7 153L197 166.3L170.3 153ZM139 139.7L165.7 153L139 166.3L112.3 153ZM284 154.2L310.7 167.5L284 180.8L257.3 167.5ZM226 154.2L252.7 167.5L226 180.8L199.3 167.5ZM110 154.2L136.7 167.5L110 180.8L83.3 167.5ZM313 168.7L339.7 182L313 195.3L286.3 182ZM255 168.7L281.7 182L255 195.3L228.3 182ZM197 168.7L223.7 182L197 195.3L170.3 182ZM139 168.7L165.7 182L139 195.3L112.3 182ZM226 183.2L252.7 196.5L226 209.8L199.3 196.5ZM168 183.2L194.7 196.5L168 209.8L141.3 196.5ZM197 197.7L223.7 211L197 224.3L170.3 211ZM226 212.2L252.7 225.5L226 238.8L199.3 225.5ZM255 226.7L281.7 240L255 253.3L228.3 240Z" fill="#c9cdd6"/><path d="M284 183.2L310.7 196.5L284 209.8L257.3 196.5ZM313 197.7L339.7 211L313 224.3L286.3 211ZM255 197.7L281.7 211L255 224.3L228.3 211ZM284 212.2L310.7 225.5L284 238.8L257.3 225.5Z" fill="#f0922f"/><path d="M197 86.3L214.4 95L197 103.7L179.6 95ZM139 86.3L156.4 95L139 103.7L121.6 95ZM226 100.8L243.4 109.5L226 118.2L208.6 109.5ZM168 100.8L185.4 109.5L168 118.2L150.6 109.5ZM110 100.8L127.4 109.5L110 118.2L92.6 109.5ZM255 115.3L272.4 124L255 132.7L237.6 124ZM197 115.3L214.4 124L197 132.7L179.6 124ZM139 115.3L156.4 124L139 132.7L121.6 124ZM284 129.8L301.4 138.5L284 147.2L266.6 138.5ZM226 129.8L243.4 138.5L226 147.2L208.6 138.5ZM168 129.8L185.4 138.5L168 147.2L150.6 138.5ZM110 129.8L127.4 138.5L110 147.2L92.6 138.5ZM255 144.3L272.4 153L255 161.7L237.6 153ZM197 144.3L214.4 153L197 161.7L179.6 153ZM139 144.3L156.4 153L139 161.7L121.6 153ZM284 158.8L301.4 167.5L284 176.2L266.6 167.5ZM226 158.8L243.4 167.5L226 176.2L208.6 167.5ZM110 158.8L127.4 167.5L110 176.2L92.6 167.5ZM313 173.3L330.4 182L313 190.7L295.6 182ZM255 173.3L272.4 182L255 190.7L237.6 182ZM197 173.3L214.4 182L197 190.7L179.6 182ZM139 173.3L156.4 182L139 190.7L121.6 182ZM226 187.8L243.4 196.5L226 205.2L208.6 196.5ZM168 187.8L185.4 196.5L168 205.2L150.6 196.5ZM197 202.3L214.4 211L197 219.7L179.6 211ZM226 216.8L243.4 225.5L226 234.2L208.6 225.5ZM255 231.3L272.4 240L255 248.7L237.6 240Z" fill="none" stroke="#7d8492" stroke-width="2" stroke-opacity=".55"/><path d="M284 187.8L301.4 196.5L284 205.2L266.6 196.5ZM313 202.3L330.4 211L313 219.7L295.6 211ZM255 202.3L272.4 211L255 219.7L237.6 211ZM284 216.8L301.4 225.5L284 234.2L266.6 225.5Z" fill="none" stroke="#a9561a" stroke-width="2" stroke-opacity=".55"/><ellipse cx="197" cy="124" rx="12" ry="6" fill="#5d6472"/><ellipse cx="197" cy="122.5" rx="9.5" ry="4.8" fill="#7b8291"/><path d="M193 114.5Q215 56.5 247 64.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10" opacity=".7"/><path d="M256 157L289 171.5L314 155L284 153L255 167.5L226 153Z" fill="#1d1b26" opacity=".22"/><path d="M226 89L255 103.5L255 167.5L226 153Z" fill="url(#brk-l)"/><path d="M255 103.5L284 89L284 153L255 167.5Z" fill="url(#brk-r)"/><path d="M255 74.5L284 89L255 103.5L226 89Z" fill="#cf6a3a"/><path d="M230 95L230 147" stroke="#e48a55" stroke-width="3" stroke-linecap="round" opacity=".6"/><circle cx="240" cy="119" r="4" fill="#6a2410" opacity=".45"/><circle cx="265" cy="121.5" r="5" fill="#6a2410" opacity=".4"/><circle cx="246" cy="147.5" r="3" fill="#6a2410" opacity=".4"/></svg>`;
})();

