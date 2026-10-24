(() => {
  'use strict';
  const ID = 'retro-bowl';
  const BW = 480, BH = 270, SX = 7, SY = 3.5, FY0 = 54, FW = 53.3, FL = 120, CY = FW / 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const chance = p => Math.random() < p;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r1 = v => Math.round(v * 10) / 10;
  const sgn = v => v < 0 ? -1 : 1;
  const wsel = (items, ws) => { let t = 0; for (const w of ws) t += w; let r = Math.random() * t; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };

  const POS = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const NEED = { QB: 2, RB: 3, WR: 5, TE: 2, OL: 6, DL: 5, LB: 4, CB: 4, S: 3, K: 1, P: 1 };
  const START = { QB: 1, RB: 1, WR: 3, TE: 1, OL: 5, DL: 4, LB: 2, CB: 3, S: 2, K: 1, P: 1 };
  const SKL = { QB: 'ACC', RB: 'ELU', WR: 'HND', TE: 'HND', OL: 'BLK', DL: 'RSH', LB: 'TKL', CB: 'COV', S: 'COV', K: 'PWR', P: 'PWR' };
  const PM = { QB: 1.7, RB: 0.8, WR: 1.0, TE: 0.8, OL: 0.9, DL: 1.0, LB: 0.8, CB: 0.9, S: 0.7, K: 0.35, P: 0.3 };
  const SPD0 = { QB: 30, RB: 84, WR: 86, TE: 62, OL: 38, DL: 55, LB: 68, CB: 87, S: 80, K: 30, P: 28 };
  const ROSTER_MAX = 40;
  const WEEKS = 17;
  const ydps = s => 5 + clamp(s, 10, 99) * 0.042;

  const CONFS = ['Summit', 'Prairie'];
  const DIVS = ['North', 'South', 'East', 'West'];
  const TEAMS = [
    ['Frostfield', 'Mammoths', 'FRO', '#1d4f91', '#c0c8d4'], ['Ironvale', 'Forgers', 'IRV', '#7b2d26', '#f0a030'], ['Lakeshore', 'Herons', 'LKS', '#0e6f6a', '#f2f2f2'], ['Stonebridge', 'Gargoyles', 'STB', '#4a4a55', '#e8b923'],
    ['Sunport', 'Pelicans', 'SUN', '#e8602c', '#1b2a49'], ['Bayou City', 'Gars', 'BAY', '#2e7d32', '#ffd54f'], ['Copper Basin', 'Scorpions', 'CPR', '#b5651d', '#1c1c1c'], ['Gulfstream', 'Barracudas', 'GUL', '#00a6b5', '#ff6f61'],
    ['Harbor City', 'Anchors', 'HBR', '#14284b', '#c9a227'], ['Tidewater', 'Corsairs', 'TDW', '#5b2c83', '#f2c14e'], ['Granite Bay', 'Pilots', 'GRB', '#23395d', '#e04f39'], ['Brookhaven', 'Badgers', 'BRK', '#a4161a', '#f5f3ef'],
    ['Sierra Peak', 'Condors', 'SIE', '#0b6e4f', '#f4d35e'], ['Redwood', 'Lumberjacks', 'RDW', '#8c2f1b', '#d9b26f'], ['Silver Mesa', 'Coyotes', 'SLV', '#6c757d', '#ff8c42'], ['Cascade Falls', 'Otters', 'CAS', '#1b998b', '#2d3047'],
    ['Wheatland', 'Bison', 'WHT', '#7a4b1e', '#f4e285'], ['Dakota Ridge', 'Lynx', 'DKR', '#264653', '#e9c46a'], ['Glacier Point', 'Huskies', 'GLP', '#0a2463', '#fb3640'], ['Timberline', 'Moose', 'TMB', '#3d5a40', '#e4572e'],
    ['Rio Verde', 'Armadillos', 'RIO', '#2a9d8f', '#e76f51'], ['Lone Mesa', 'Roadrunners', 'LNM', '#c8553d', '#2d1e2f'], ['Cotton Valley', 'Mustangs', 'COT', '#f2f2f2', '#16423c'], ['Bluebonnet Bay', 'Stingrays', 'BLU', '#2b59c3', '#f5d547'],
    ['Liberty Hill', 'Founders', 'LHF', '#9d0208', '#14213d'], ['Riverton', 'Steamers', 'RVT', '#1e6091', '#f0ead2'], ['Millbrook', 'Miners', 'MIL', '#3a3a3a', '#f4a259'], ['Ashford', 'Knights', 'ASH', '#6a040f', '#adb5bd'],
    ['Sunset Coast', 'Surfers', 'SSC', '#ff7f50', '#073b4c'], ['Neon Valley', 'Aces', 'NEO', '#7209b7', '#4cc9f0'], ['Canyon Ridge', 'Rattlers', 'CNY', '#bc6c25', '#283618'], ['Pinecrest', 'Grizzlies', 'PNC', '#386641', '#f2e8cf']
  ];
  const SURN = ['Alvarez', 'Bennett', 'Carver', 'Dawson', 'Ellison', 'Foster', 'Gallo', 'Hayes', 'Ibarra', 'Jensen', 'Kowalski', 'Lawson', 'Mercer', 'Nakamura', 'Okafor', 'Pruitt', 'Quinn', 'Rowan', 'Sutton', 'Tanaka', 'Underhill', 'Vance', 'Whitaker', 'Yates', 'Zimmer', 'Abbott', 'Brandt', 'Calloway', 'Dunmore', 'Eastman', 'Fitch', 'Grayson', 'Holloway', 'Iverson', 'Jacobs', 'Keller', 'Larkin', 'Morrow', 'Navarro', 'Overton', 'Pickett', 'Ramos', 'Sawyer', 'Thorne', 'Upton', 'Valdez', 'Walsh', 'Xiong', 'Young', 'Zeller', 'Archer', 'Bishop', 'Crane', 'Delgado', 'Ewing', 'Fenwick', 'Garner', 'Hollis', 'Ingram', 'Joyner', 'Kemp', 'Landry', 'Maddox', 'Nolan', 'Ortega', 'Pearce', 'Quade', 'Reyes', 'Stroud', 'Tolliver', 'Ulrich', 'Voss', 'Wexler', 'Yoder', 'Zapata', 'Ashby', 'Booker', 'Cortez', 'Drummond', 'Egan', 'Frost', 'Gentry', 'Hardin', 'Ives', 'Jericho', 'Knox', 'Lowry', 'Merritt', 'Nash', 'Oakes', 'Paxton', 'Rafferty', 'Sloane', 'Trevino', 'Usher', 'Vega', 'Wolfe', 'York', 'Zane', 'Barlow', 'Coleman', 'Durant', 'Emerson', 'Flynn', 'Gibbs', 'Harlan', 'Irwin', 'Jarvis', 'Kline', 'Leary', 'Monroe', 'Novak', 'Osborne', 'Prescott', 'Rhodes', 'Spencer', 'Tate', 'Vaughn', 'Weston', 'Yoon', 'Zhao'];
  const INIT = 'ABCDEFGHJKLMNPRSTVWZ';
  const COACHES = ['Coach Mack', 'Coach Rivera', 'Coach Dunn', 'Coach Park'];

  const FONT_SRC = {
    A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.', C: '.####/#..../#..../#..../#..../#..../.####', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
    E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....', G: '.####/#..../#..../#..##/#...#/#...#/.####', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    I: '#####/..#../..#../..#../..#../..#../#####', J: '..###/...#./...#./...#./...#./#..#./.##..', K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
    M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#', O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
    Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#', S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
    U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..', W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
    0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '..#../.##../..#../..#../..#../..#../.###.', 2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '####./....#/....#/.###./....#/....#/####.',
    4: '...#./..##./.#.#./#..#./#####/...#./...#.', 5: '#####/#..../####./....#/....#/#...#/.###.', 6: '.###./#..../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
    8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/....#/.###.',
    '.': '././././././#', ',': '././././#/#/#', ':': './#/././././#/.', '!': '#/#/#/#/#/./#', '?': '.###./#...#/....#/...#./..#../...../..#..', '-': '.../.../.../###/.../.../...',
    '+': '...../..#../..#../#####/..#../..#../.....', '/': '....#/....#/...#./..#../.#.../#..../#....', '%': '##..#/##..#/...#./..#../.#.../#..##/#..##', "'": '#/#/././././.',
    '(': '..#/.#./#../#../#../.#./..#', ')': '#../.#./..#/..#/..#/.#./#..', '#': '.#.#./#####/.#.#./.#.#./#####/.#.#./.....', '=': '...../...../#####/...../#####/...../.....',
    '*': '...../#.#.#/.###./#####/.###./#.#.#/.....', '<': '...#/..#./.#../#.../.#../..#./...#', '>': '#.../.#../..#./...#/..#./.#../#...', '_': '...../...../...../...../...../...../#####',
    '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', '$': '..#../.####/#.#../.###./..#.#/####./..#..', ' ': '..../..../..../..../..../..../....'
  };
  const FONT = {};
  Object.keys(FONT_SRC).forEach(k => { FONT[k] = FONT_SRC[k].split('/'); });
  const glyphCache = {};
  function glyph(ch, col) {
    const k = col + ch;
    let g = glyphCache[k];
    if (g) return g;
    const rows = FONT[ch] || FONT['?'], w = rows[0].length;
    g = document.createElement('canvas'); g.width = w; g.height = 7;
    const c = g.getContext('2d'); c.fillStyle = col;
    for (let y = 0; y < 7; y++) for (let x = 0; x < w; x++) if (rows[y][x] === '#') c.fillRect(x, y, 1, 1);
    glyphCache[k] = g; return g;
  }
  function txtW(s, sc = 1) {
    let w = 0;
    for (const ch of s) w += (FONT[ch] || FONT['?'])[0].length + 1;
    return Math.max(0, w - 1) * sc;
  }
  function txt(c, s, x, y, col = '#fff', sc = 1, al = 'l', sh = null) {
    s = String(s).toUpperCase();
    const w = txtW(s, sc);
    x = Math.round(al === 'c' ? x - w / 2 : al === 'r' ? x - w : x); y = Math.round(y);
    if (sh) { let px = x + sc; for (const ch of s) { const g = glyph(ch, sh); c.drawImage(g, px, y + sc, g.width * sc, 7 * sc); px += (g.width + 1) * sc; } }
    for (const ch of s) { const g = glyph(ch, col); c.drawImage(g, x, y, g.width * sc, 7 * sc); x += (g.width + 1) * sc; }
    return w;
  }

  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const lum = h => { const [r, g, b] = hex(h); return 0.299 * r + 0.587 * g + 0.114 * b; };
  const cdist = (a, b) => { const p = hex(a), q = hex(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
  const shade = (h, f) => { const [r, g, b] = hex(h); const m = v => clamp(Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f), 0, 255); return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };

  let uid = 1;
  const stars = o => clamp(Math.round((o - 45) / 5) / 2, 0.5, 5);
  const starTxt = o => { const s = stars(o); let t = ''; for (let i = 1; i <= 5; i++) t += s >= i ? '<u class="sf">★</u>' : s >= i - 0.5 ? '<u class="sh">★</u>' : '<u class="se">★</u>'; return t; };
  const salFor = (pos, ovr) => r1(0.4 + Math.pow((clamp(ovr, 40, 99) - 40) / 55, 2.3) * 17 * PM[pos]);
  const money = v => '$' + (Math.round(v * 10) / 10).toFixed(1) + 'M';
  const moodWord = m => m >= 75 ? 'Happy' : m >= 50 ? 'Fine' : m >= 30 ? 'Upset' : 'Furious';
  const moodCol = m => m >= 75 ? '#5fe36b' : m >= 50 ? '#d9e35f' : m >= 30 ? '#f0a030' : '#ff5a4d';

  function newName(used) {
    for (let i = 0; i < 40; i++) {
      const n = INIT[Math.floor(Math.random() * INIT.length)] + '. ' + pick(SURN);
      if (!used || !used.has(n)) { if (used) used.add(n); return n; }
    }
    return 'X. ' + pick(SURN);
  }

  function mkPlayer(pos, ovr, o = {}) {
    ovr = Math.round(clamp(ovr, 38, 99));
    const age = o.age || (pos === 'QB' ? ri(23, 36) : pos === 'K' || pos === 'P' ? ri(22, 38) : ri(21, 33));
    const p = {
      id: uid++, n: o.n || newName(o.used), pos, ovr, age,
      spd: Math.round(clamp(SPD0[pos] + gauss() * 7 + (ovr - 70) * 0.22, 15, 99)),
      skl: Math.round(clamp(ovr + gauss() * 5, 35, 99)),
      pot: Math.round(clamp(ovr + (age <= 24 ? ri(2, 14) : age <= 27 ? ri(0, 4) : 0), ovr, 99)),
      yrs: o.yrs || ri(1, 4), mor: o.mor || ri(62, 88), inj: 0, rk: !!o.rk, st: {}
    };
    if (pos === 'QB') p.arm = Math.round(clamp(ovr + gauss() * 8, 40, 99));
    p.sal = o.sal != null ? o.sal : r1(salFor(pos, ovr) * rnd(0.85, 1.15));
    return p;
  }

  function stat(p, k, v = 1) { p.st[k] = (p.st[k] || 0) + v; }

  function buildRoster(t, used) {
    const r = [];
    for (const pos of POS) {
      const base = pos === 'K' || pos === 'P' ? t.st : ['DL', 'LB', 'CB', 'S'].includes(pos) ? t.def : t.off;
      for (let i = 0; i < NEED[pos]; i++) {
        const starter = i < START[pos];
        r.push(mkPlayer(pos, base + gauss() * 4 - (starter ? 0 : 11 + i * 1.5), { used }));
      }
    }
    return r;
  }

  function lineup(roster) {
    const L = {};
    for (const pos of POS) L[pos] = roster.filter(p => p.pos === pos && !p.inj).sort((a, b) => b.ovr - a.ovr);
    return L;
  }
  const avg = a => a.length ? a.reduce((s, p) => s + p.ovr, 0) / a.length : 45;
  function strength(L, fac) {
    const g = (pos, n) => L[pos].slice(0, n);
    const qb = L.QB[0] ? L.QB[0].ovr : 45;
    const off = qb * 0.38 + avg(g('RB', 1)) * 0.1 + avg(g('WR', 3)) * 0.22 + avg(g('TE', 1)) * 0.05 + avg(g('OL', 5)) * 0.25;
    const def = avg(g('DL', 4)) * 0.3 + avg(g('LB', 2)) * 0.2 + avg(g('CB', 3)) * 0.28 + avg(g('S', 2)) * 0.22;
    const st = (avg(g('K', 1)) + avg(g('P', 1))) / 2;
    const f = fac || { off: 1, def: 1 };
    return { off: off + (f.off - 1) * 1.2, def: def + (f.def - 1) * 1.2, st, ovr: (off + def) / 2 };
  }

  let ac = null, master = null, noiseBuf = null, mutedFn = () => false;
  function actx() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      try { ac = new A(); } catch (e) { return null; }
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  function tone(t, dur, type, f0, f1, vol, dest) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.03);
  }
  function burst(t, dur, f, q, vol, type = 'bandpass', swell = 0) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(swell ? 0.0001 : vol, t);
    if (swell) g.gain.exponentialRampToValueAtTime(vol, t + swell);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.03);
  }
  function snd(name) {
    if (mutedFn() || !actx()) return;
    const t = ac.currentTime + 0.004;
    switch (name) {
      case 'click': tone(t, 0.04, 'square', 880, 660, 0.05); break;
      case 'back': tone(t, 0.05, 'square', 520, 380, 0.05); break;
      case 'snap': burst(t, 0.09, 1800, 1.5, 0.35); tone(t, 0.08, 'triangle', 180, 90, 0.2); break;
      case 'hut': tone(t, 0.07, 'square', 320, 300, 0.1); tone(t + 0.14, 0.09, 'square', 380, 360, 0.1); break;
      case 'throw': burst(t, 0.18, 2600, 0.8, 0.18, 'bandpass'); tone(t, 0.16, 'sine', 420, 700, 0.07); break;
      case 'catch': burst(t, 0.07, 900, 2, 0.4); tone(t, 0.07, 'triangle', 260, 140, 0.18); break;
      case 'drop': tone(t, 0.12, 'triangle', 200, 110, 0.12); break;
      case 'tackle': burst(t, 0.16, 420, 0.9, 0.5); tone(t, 0.12, 'sine', 130, 55, 0.3); break;
      case 'sack': burst(t, 0.26, 360, 0.8, 0.6); tone(t, 0.2, 'sine', 110, 45, 0.35); break;
      case 'juke': burst(t, 0.1, 3200, 1, 0.12, 'highpass'); tone(t, 0.1, 'sine', 600, 900, 0.05); break;
      case 'dive': burst(t, 0.2, 700, 0.6, 0.3, 'lowpass'); break;
      case 'kick': burst(t, 0.1, 500, 1.5, 0.6); tone(t, 0.18, 'sine', 160, 55, 0.5); break;
      case 'whistle': { const o = ac.createOscillator(), lf = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 2900; lf.frequency.value = 38; lg.gain.value = 120; lf.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.setValueAtTime(0.12, t + 0.34); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42); o.connect(g); g.connect(master); o.start(t); lf.start(t); o.stop(t + 0.45); lf.stop(t + 0.45); break; }
      case 'cheer': burst(t, 1.6, 1300, 0.5, 0.22, 'bandpass', 0.35); burst(t, 1.4, 2400, 0.4, 0.1, 'bandpass', 0.2); break;
      case 'groan': burst(t, 1.1, 380, 0.7, 0.2, 'lowpass', 0.15); tone(t, 0.9, 'sawtooth', 190, 95, 0.05); break;
      case 'td': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(t + i * 0.12, 0.2, 'square', f, f, 0.09)); burst(t, 1.8, 1300, 0.5, 0.2, 'bandpass', 0.3); break;
      case 'turnover': tone(t, 0.18, 'sawtooth', 300, 200, 0.1); tone(t + 0.18, 0.3, 'sawtooth', 200, 90, 0.1); break;
      case 'good': tone(t, 0.1, 'square', 660, 660, 0.07); tone(t + 0.1, 0.2, 'square', 990, 990, 0.07); break;
      case 'miss': tone(t, 0.35, 'sawtooth', 300, 90, 0.08); break;
      case 'first': tone(t, 0.08, 'square', 740, 740, 0.07); tone(t + 0.09, 0.12, 'square', 1110, 1110, 0.07); break;
      case 'buy': tone(t, 0.07, 'square', 700, 700, 0.06); tone(t + 0.07, 0.07, 'square', 940, 940, 0.06); tone(t + 0.14, 0.12, 'square', 1250, 1250, 0.06); break;
      case 'fanfare': [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.16, 0.26, 'square', f, f, 0.08)); break;
    }
  }

  const DEF_SET = { ql: 150, snd: true, diff: 1, ring: true, vol: 5 };
  const DIFF_NAMES = ['Rookie', 'Pro', 'All-Pro'];
  const DIFF_ADJ = [-5, 0, 5];
  const QLENS = [[90, '1:30'], [150, '2:30'], [240, '4:00']];
  const FAC = [
    ['train', 'Training Complex', 'Players progress faster in the offseason'],
    ['med', 'Medical Center', 'Fewer injuries and faster recoveries'],
    ['stad', 'Stadium', 'Fans grow faster and the salary cap rises'],
    ['scout', 'Scouting Department', 'Draft prospect ratings are more accurate'],
    ['off', 'Offensive Coach', 'Boosts QB accuracy, hands and blocking'],
    ['def', 'Defensive Coach', 'Boosts your defense against opposing drives']
  ];
  const facCost = lvl => [0, 10, 20, 32, 48][lvl] || 0;
  const ROUND_NAMES = ['Wild Card', 'Divisional', 'Conference Final', 'Retro Bowl'];

  function mkTeam(i) {
    const d = TEAMS[i];
    const t = { id: i, city: d[0], name: d[1], ab: d[2], c1: d[3], c2: d[4], conf: i < 16 ? 0 : 1, div: Math.floor((i % 16) / 4), off: clamp(72 + gauss() * 6.5, 56, 90), def: clamp(72 + gauss() * 6.5, 56, 90), st: clamp(72 + gauss() * 6, 55, 90), w: 0, l: 0, t: 0, pf: 0, pa: 0 };
    t.nm = aiNames(t);
    return t;
  }
  function aiNames(t) {
    const used = new Set();
    const n = () => newName(used);
    return { QB: n(), RB: [n(), n()], WR: [n(), n(), n()], TE: n(), K: n(), P: n(), DL: [n(), n(), n(), n()], LB: [n(), n(), n()], CB: [n(), n(), n()], S: [n(), n()], OL: [n(), n(), n(), n(), n()] };
  }
  const tname = t => t.city + ' ' + t.name;

  function capOf(F) {
    return 150 + Math.round(F.fan / 100 * 15) + (F.fac.stad - 1) * 3;
  }
  const payroll = F => r1(F.roster.reduce((s, p) => s + p.sal, 0));

  function genSchedule(F) {
    const ids = [...Array(32).keys()];
    for (let i = ids.length - 1; i > 0; i--) { const j = ri(0, i); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const fixed = ids[0], rest = ids.slice(1), rounds = [];
    for (let r = 0; r < 31; r++) {
      const g = [[fixed, rest[0]]];
      for (let i = 1; i < 16; i++) g.push([rest[i], rest[31 - i]]);
      rounds.push(g);
      rest.unshift(rest.pop());
    }
    for (let i = rounds.length - 1; i > 0; i--) { const j = ri(0, i); [rounds[i], rounds[j]] = [rounds[j], rounds[i]]; }
    const sched = [];
    for (let w = 0; w < WEEKS; w++) {
      sched.push(rounds[w].map(([a, b], i) => (w + i) % 2 ? [a, b] : [b, a]).map(([h, a]) => ({ h, a, hs: null, as: null, ot: false, done: false })));
    }
    F.sched = sched;
  }

  function userRefresh(F) {
    const t = F.teams[F.tid], s = strength(lineup(F.roster), F.fac);
    t.off = s.off; t.def = s.def; t.st = s.st;
    return s;
  }

  function newFranchise(tid, coach, set, pv) {
    F = {
      v: 1, coach: coach || COACHES[0], tid, year: 2026, week: 1, phase: 'reg', teams: pv || TEAMS.map((_, i) => mkTeam(i)), roster: [], fa: [], sched: [], po: null,
      fac: { train: 1, med: 1, stad: 1, scout: 1, off: 1, def: 1 }, credits: 12, fan: 55, owner: 60, hist: [], news: [], draft: null, resign: null, awards: null,
      streak: 0, wins: 0, losses: 0, titles: 0, ptsTotal: 0
    };
    const used = new Set();
    F.roster = buildRoster(F.teams[tid], used);
    const p = payroll(F), cap = capOf(F);
    if (p > cap * 0.94) { const f = cap * 0.94 / p; F.roster.forEach(x => { x.sal = r1(Math.max(0.4, x.sal * f)); }); }
    userRefresh(F);
    genSchedule(F);
    genFA(F);
    return F;
  }

  function genFA(F, leftovers) {
    const used = new Set(F.roster.map(p => p.n));
    const fa = (leftovers || []).filter(p => chance(0.6));
    const want = 34 - fa.length;
    const w = { QB: 3, RB: 5, WR: 7, TE: 3, OL: 8, DL: 7, LB: 5, CB: 5, S: 4, K: 1.5, P: 1.5 };
    for (let i = 0; i < want; i++) {
      const pos = wsel(POS, POS.map(k => w[k]));
      const ovr = clamp(52 + Math.abs(gauss()) * 11 + rnd(0, 6), 50, 90);
      const p = mkPlayer(pos, ovr, { used, age: ri(24, 34) });
      fa.push(p);
    }
    fa.forEach(p => { p.ask = r1(Math.max(0.4, salFor(p.pos, p.ovr) * rnd(0.95, 1.3))); p.askYrs = ri(1, 3); p.mor = 70; });
    F.fa = fa.sort((a, b) => b.ovr - a.ovr);
  }

  function simDrivesPoints(o, d, n) {
    let s = 0, td = 0, fg = 0;
    const pTD = clamp(0.25 + (o - d) * 0.0085, 0.07, 0.55), pFG = 0.13;
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      if (r < pTD) { td++; s += chance(0.94) ? 7 : chance(0.5) ? 6 : 8; } else if (r < pTD + pFG) { fg++; s += 3; }
    }
    return { s, td, fg };
  }
  function simScore(ea, eb) {
    const n = ri(10, 12);
    const A = simDrivesPoints(ea.off, eb.def, n), B = simDrivesPoints(eb.off, ea.def, n);
    return { hs: A.s, as: B.s, A, B };
  }
  function effTeam(F, t) {
    if (t.id === F.tid) { const s = userRefresh(F); return { off: s.off, def: s.def }; }
    const adj = DIFF_ADJ[SET.diff] || 0;
    return { off: t.off + adj, def: t.def + adj };
  }
  function recordResult(F, g, reg) {
    const H = F.teams[g.h], A = F.teams[g.a];
    if (!reg) return;
    H.pf += g.hs; H.pa += g.as; A.pf += g.as; A.pa += g.hs;
    if (g.hs > g.as) { H.w++; A.l++; } else if (g.hs < g.as) { A.w++; H.l++; } else { H.t++; A.t++; }
  }
  function simGameObj(F, g, po) {
    const r = simScore(effTeam(F, F.teams[g.h]), effTeam(F, F.teams[g.a]));
    let hs = r.hs, as = r.as;
    if (hs === as) { g.ot = true; if (po || chance(0.55)) { if (chance(0.5)) hs += 3; else as += 3; } }
    g.hs = hs; g.as = as; g.done = true;
    return g;
  }

  const userGameIn = (F, games) => games.find(g => !g.done && (g.h === F.tid || g.a === F.tid));
  function curGames(F) {
    if (F.phase === 'reg') return F.sched[F.week - 1] || [];
    if (F.phase === 'po' && F.po) return F.po.games;
    return [];
  }
  const myGame = F => userGameIn(F, curGames(F));
  const pct = t => { const g = t.w + t.l + t.t; return g ? (t.w + t.t * 0.5) / g : 0; };
  const sortTeams = arr => arr.sort((a, b) => pct(b) - pct(a) || (b.pf - b.pa) - (a.pf - a.pa) || b.pf - a.pf || a.id - b.id);

  function newsAdd(F, s) { F.news.unshift(s); if (F.news.length > 24) F.news.length = 24; }

  function simOthers(F) {
    const games = curGames(F);
    for (const g of games) {
      if (g.done) continue;
      if (g.h === F.tid || g.a === F.tid) continue;
      simGameObj(F, g, F.phase === 'po');
      if (F.phase === 'reg') recordResult(F, g, true);
    }
  }

  function healWeek(F) {
    const lv = F.fac.med;
    F.roster.forEach(p => { if (p.inj > 0) { p.inj--; if (p.inj > 0 && lv >= 3 && chance(0.25)) p.inj--; } });
  }

  function seedsFor(F, conf) {
    return sortTeams(F.teams.filter(t => t.conf === conf)).slice(0, 6).map(t => t.id);
  }
  function startPlayoffs(F) {
    F.phase = 'po';
    const seeds = [seedsFor(F, 0), seedsFor(F, 1)];
    F.po = { round: 0, seeds, alive: [seeds[0].slice(), seeds[1].slice()], games: [], champ: null, runner: null, userOut: !(seeds[0].includes(F.tid) || seeds[1].includes(F.tid)), log: [] };
    seeds.forEach(s => s.forEach((id, i) => { F.teams[id].seed = i + 1; }));
    makeRound(F);
  }
  function seedOf(F, id) { return F.teams[id].seed || 9; }
  function makeRound(F) {
    const po = F.po, games = [];
    const mk = (a, b) => ({ h: a, a: b, hs: null, as: null, ot: false, done: false, neutral: false });
    if (po.round === 0) {
      for (let c = 0; c < 2; c++) { const s = po.seeds[c]; games.push(mk(s[2], s[5]), mk(s[3], s[4])); }
    } else if (po.round === 1 || po.round === 2) {
      for (let c = 0; c < 2; c++) {
        const a = po.alive[c].slice().sort((x, y) => seedOf(F, x) - seedOf(F, y));
        if (a.length === 4) games.push(mk(a[0], a[3]), mk(a[1], a[2]));
        else if (a.length === 2) games.push(mk(a[0], a[1]));
      }
    } else {
      const g = mk(po.alive[0][0], po.alive[1][0]); g.neutral = true; games.push(g);
    }
    po.games = games;
    const bye = po.round === 0 && (po.seeds[0].slice(0, 2).includes(F.tid) || po.seeds[1].slice(0, 2).includes(F.tid));
    po.userOut = !bye && !games.some(g => g.h === F.tid || g.a === F.tid);
  }
  function finishRound(F) {
    const po = F.po;
    const winners = po.games.map(g => (g.hs > g.as ? g.h : g.a));
    const ug = po.games.find(g => g.h === F.tid || g.a === F.tid);
    if (ug && (ug.hs > ug.as ? ug.h : ug.a) !== F.tid) po.elim = po.round;
    po.log.push({ round: po.round, games: po.games.map(g => ({ ...g })) });
    if (po.round === 0) {
      for (let c = 0; c < 2; c++) {
        const s = po.seeds[c];
        po.alive[c] = [s[0], s[1], ...po.games.filter(g => F.teams[g.h].conf === c).map(g => (g.hs > g.as ? g.h : g.a))];
      }
    } else if (po.round === 1 || po.round === 2) {
      for (let c = 0; c < 2; c++) po.alive[c] = po.games.filter(g => F.teams[g.h].conf === c).map(g => (g.hs > g.as ? g.h : g.a));
    } else {
      po.champ = winners[0];
      const g = po.games[0];
      po.runner = g.hs > g.as ? g.a : g.h;
      F.phase = 'end';
      return;
    }
    po.round++;
    makeRound(F);
  }
  function advanceWeek(F) {
    if (F.phase === 'reg') {
      F.week++;
      healWeek(F);
      if (F.week > WEEKS) startPlayoffs(F);
    } else if (F.phase === 'po') {
      healWeek(F);
      finishRound(F);
      if (F.phase === 'end') finalizeSeason(F);
    }
  }
  function userNextGame(F) {
    const g = myGame(F);
    if (!g) return null;
    const opp = g.h === F.tid ? g.a : g.h;
    return { g, opp: F.teams[opp], home: g.h === F.tid, neutral: !!g.neutral };
  }
  function stageName(F) {
    if (F.phase === 'reg') return 'Week ' + F.week;
    if (F.phase === 'po' && F.po) return ROUND_NAMES[F.po.round];
    return F.phase === 'end' ? 'Season over' : '';
  }

  function simWholeWeek(F, userAuto) {
    const ng = userNextGame(F);
    if (ng && userAuto) {
      const g = ng.g;
      const r = simScore(effTeam(F, F.teams[g.h]), effTeam(F, F.teams[g.a]));
      g.hs = r.hs; g.as = r.as;
      if (g.hs === g.as) { g.ot = true; if (F.phase === 'po' || chance(0.55)) { if (chance(0.5)) g.hs += 3; else g.as += 3; } }
      g.done = true;
      const mine = g.h === F.tid;
      const sim = { sc: mine ? [g.hs, g.as] : [g.as, g.hs], opp: ng.opp, ot: g.ot, playoff: F.phase === 'po', simmed: true, td: mine ? r.A.td : r.B.td, ydP: ri(180, 290), ydR: ri(60, 150) };
      if (F.phase === 'reg') recordResult(F, g, true);
      const sum = postGame(F, sim);
      simOthers(F);
      advanceWeek(F);
      return sum;
    }
    return null;
  }

  function rewardCredits(win, po, margin, tds) {
    return Math.max(1, Math.round((win ? 7 + (po ? 5 : 0) : 2) + Math.min(5, Math.floor(Math.abs(margin) / 7)) * (win ? 1 : 0) + tds * 0.5));
  }
  function postGame(F, M) {
    const [us, os] = M.sc, win = us > os, tie = us === os, margin = us - os, opp = M.opp;
    const mine = F.teams[F.tid];
    const strong = (opp.off + opp.def) / 2 > (mine.off + mine.def) / 2 + 3;
    const credits = rewardCredits(win, M.playoff, margin, M.td || 0);
    F.credits += credits;
    const d = { credits, fan: 0, owner: 0, inj: [], win, tie };
    if (win) { F.wins++; F.streak = F.streak > 0 ? F.streak + 1 : 1; d.fan = clamp(3 + margin / 14, 3, 6); d.owner = (strong ? 5 : 3) + (M.playoff ? 3 : 0); } else if (!tie) { F.losses++; F.streak = F.streak < 0 ? F.streak - 1 : -1; d.fan = -clamp(3 + Math.abs(margin) / 14, 3, 6) - (F.streak <= -3 ? 1 : 0); d.owner = -(strong ? 2 : 4); }
    if (F.streak >= 3) d.fan += 1;
    F.fan = clamp(F.fan + d.fan, 3, 100); F.owner = clamp(F.owner + d.owner, 0, 100);
    F.ptsTotal += us;
    const L = lineup(F.roster), starters = [];
    for (const pos of POS) starters.push(...L[pos].slice(0, START[pos]));
    const inj = (M.liveInj || []).slice();
    starters.forEach(p => {
      if (inj.includes(p)) return;
      if (chance(0.016 * (1 - (F.fac.med - 1) * 0.1))) { weeksInj(F, p); inj.push(p); }
    });
    d.inj = inj.map(p => p.n + ' (' + p.pos + ') out ' + p.inj + 'w');
    const sIds = new Set(starters.map(p => p.id));
    F.roster.forEach(p => {
      let m = win ? 2 : tie ? 0 : -2.5;
      const fair = salFor(p.pos, p.ovr);
      m += p.sal < fair * 0.72 ? -1.2 : 0.4;
      if (!sIds.has(p.id)) { const best = L[p.pos][0]; if (best && p.ovr >= best.ovr - 2 && !p.inj) m -= 1.8; }
      m += (65 - p.mor) * 0.03;
      p.mor = clamp(Math.round((p.mor + m) * 10) / 10, 4, 100);
    });
    newsAdd(F, (win ? 'WIN ' : tie ? 'TIE ' : 'LOSS ') + us + '-' + os + ' vs ' + opp.city + ' (' + stageName(F) + ')');
    M.summary = d;
    return d;
  }
  function weeksInj(F, p) {
    let w = pick([1, 1, 2, 2, 3, 4, 6, 8]);
    w = Math.max(1, Math.round(w * (1 - (F.fac.med - 1) * 0.1)));
    p.inj = w;
  }

  function finalizeSeason(F) {
    const me = F.teams[F.tid], po = F.po;
    const made = F.po && [...F.po.seeds[0], ...F.po.seeds[1]].includes(F.tid);
    const champ = po && po.champ === F.tid;
    let od = made ? 4 : -9;
    if (champ) { od += 20; F.titles++; F.credits += 40; }
    else if (po && po.runner === F.tid) { od += 6; F.credits += 14; }
    F.owner = clamp(F.owner + od, 0, 100);
    F.fan = clamp(F.fan + (champ ? 10 : made ? 2 : -4) + (F.fac.stad - 1), 3, 100);
    const rec = me.w + '-' + me.l + (me.t ? '-' + me.t : '');
    let res = made ? 'Made the playoffs' : 'Missed the playoffs';
    if (champ) res = 'RETRO BOWL CHAMPIONS';
    else if (po && po.runner === F.tid) res = 'Lost the Retro Bowl';
    else if (made) res = 'Eliminated in the ' + ROUND_NAMES[po.elim == null ? 0 : po.elim];
    F.hist.unshift({ year: F.year, rec, res, champ: po ? tname(F.teams[po.champ]) : '-', pts: me.pf, owner: Math.round(F.owner) });
    if (F.hist.length > 20) F.hist.length = 20;
    F.fired = F.owner <= 8;
    F.awards = { champ: po ? po.champ : null };
    newsAdd(F, F.year + ': ' + res);
  }

  function progressPlayer(F, p) {
    p.age++;
    const tf = F.fac.train, cush = (p.pos === 'QB' || p.pos === 'K' || p.pos === 'P') ? 2 : 0;
    const a = p.age - cush;
    let d;
    if (a <= 23) d = ri(1, 6); else if (a <= 26) d = ri(-1, 4); else if (a <= 29) d = ri(-2, 2); else if (a <= 32) d = ri(-4, 1); else d = ri(-6, -1);
    d += (tf - 1) * 0.6 * (d >= 0 ? 1 : 0.4);
    d = Math.round(clamp(d, -9, 9));
    p.ovr = clamp(p.ovr + d, 38, 99);
    p.skl = clamp(p.skl + d + ri(-2, 2), 35, 99);
    if (p.arm) p.arm = clamp(p.arm + (a > 31 ? -ri(0, 2) : ri(0, 1)), 40, 99);
    if (p.age > 28) p.spd = clamp(p.spd - ri(0, 3), 15, 99); else p.spd = clamp(p.spd + ri(0, 2), 15, 99);
    if (p.ovr > p.pot) p.pot = p.ovr;
    p.st = {}; p.inj = 0; p.rk = false;
    p.mor = clamp(p.mor + (65 - p.mor) * 0.3, 10, 100);
  }
  const retires = p => p.age >= 38 || (p.age >= 34 && p.ovr < 62 && chance(0.5)) || ((p.pos === 'K' || p.pos === 'P') && p.age >= 41);

  function startOffseason(F) {
    F.teams.forEach(t => {
      if (t.id === F.tid) return;
      t.off = clamp(t.off + gauss() * 3.4 + (72 - t.off) * 0.12, 54, 92);
      t.def = clamp(t.def + gauss() * 3.4 + (72 - t.def) * 0.12, 54, 92);
      t.st = clamp(t.st + gauss() * 3 + (72 - t.st) * 0.12, 54, 92);
      if (chance(0.4)) t.nm = aiNames(t);
    });
    const keep = [], expiring = [], retired = [];
    F.roster.forEach(p => {
      progressPlayer(F, p);
      p.yrs--;
      if (retires(p)) { retired.push(p); return; }
      if (p.yrs <= 0) expiring.push(p); else keep.push(p);
    });
    F.roster = keep;
    F.retired = retired.map(p => p.n + ' (' + p.pos + ')');
    F.resign = expiring.map(p => {
      const refuse = p.mor < 25;
      const base = salFor(p.pos, p.ovr) * (0.92 + (70 - p.mor) / 220);
      return { p, refuse, ask: [r1(Math.max(0.4, base * 1.12)), r1(Math.max(0.4, base)), r1(Math.max(0.4, base * 0.93))], left: false };
    });
    F.phase = 'resign';
    genDraft(F);
  }

  function genDraft(F) {
    const used = new Set(F.roster.map(p => p.n));
    const pros = [];
    const w = { QB: 3, RB: 6, WR: 8, TE: 4, OL: 10, DL: 9, LB: 7, CB: 7, S: 5, K: 1.2, P: 1.2 };
    for (let i = 0; i < 160; i++) {
      const pos = wsel(POS, POS.map(k => w[k]));
      const ovr = clamp(48 + Math.abs(gauss()) * 12 + rnd(-2, 4), 44, 90);
      const p = mkPlayer(pos, ovr, { used, age: ri(21, 23), rk: true, yrs: ri(3, 4), mor: 80 });
      p.pot = clamp(p.ovr + ri(3, 16), p.ovr, 99);
      p.sal = 0.5;
      pros.push(p);
    }
    pros.sort((a, b) => (b.ovr * 0.7 + b.pot * 0.3) - (a.ovr * 0.7 + a.pot * 0.3));
    const sg = 11 - F.fac.scout * 2;
    pros.forEach(p => { p.est = Math.round(clamp(p.ovr + gauss() * sg, 40, 99)); p.estPot = Math.round(clamp(p.pot + gauss() * sg, p.est, 99)); });
    const order = sortTeams(F.teams.map(t => t)).map(t => t.id).reverse();
    if (F.po && F.po.champ != null) {
      const ch = F.po.champ, ru = F.po.runner;
      const o2 = order.filter(id => id !== ch && id !== ru);
      o2.push(ru, ch);
      order.length = 0; order.push(...o2);
    }
    const picks = [];
    for (let r = 0; r < 4; r++) order.forEach(id => picks.push({ round: r + 1, team: id, pick: null }));
    F.draft = { pros, picks, i: 0, log: [], done: false };
  }
  function rookieSal(round, p) { return r1(clamp(0.5 + (5 - round) * 0.55 + (p.ovr - 55) * 0.06, 0.5, 4.5)); }
  function draftAiPick(F) {
    const D = F.draft, pk = D.picks[D.i];
    const cands = D.pros.slice(0, 8);
    const sc = cands.map(p => (p.ovr * 0.7 + p.pot * 0.3) + (p.pos === 'K' || p.pos === 'P' ? -22 : 0) + (p.pos === 'QB' ? -4 : 0) + rnd(0, 7));
    const best = cands[sc.indexOf(Math.max(...sc))];
    draftTake(F, best, pk.team);
  }
  function draftTake(F, p, team) {
    const D = F.draft, pk = D.picks[D.i];
    D.pros.splice(D.pros.indexOf(p), 1);
    pk.pick = p;
    if (team === F.tid) { p.sal = rookieSal(pk.round, p); p.yrs = pick([3, 3, 4]); p.rk = true; p.draftRd = pk.round; F.roster.push(p); }
    D.log.unshift(F.teams[team].ab + ' R' + pk.round + ': ' + p.pos + ' ' + p.n);
    D.i++;
    if (D.i >= D.picks.length) { D.done = true; F.leftovers = D.pros; }
  }
  function draftRunToUser(F) {
    const D = F.draft;
    while (D.i < D.picks.length && D.picks[D.i].team !== F.tid) draftAiPick(F);
    if (D.i >= D.picks.length) { D.done = true; F.leftovers = D.pros; }
  }
  function endDraft(F) {
    const D = F.draft;
    while (D.i < D.picks.length) { if (D.picks[D.i].team === F.tid) { draftTake(F, D.pros[0], F.tid); } else draftAiPick(F); }
    D.done = true; F.leftovers = D.pros;
  }

  function beginFreeAgency(F) {
    const left = (F.resign || []).filter(r => !r.signed).map(r => r.p);
    const lo = (F.leftovers || []).slice(0, 14).map(p => { p.ovr = Math.max(40, p.ovr - 1); return p; });
    left.forEach(p => { p.yrs = 0; });
    genFA(F, [...left, ...lo]);
    F.phase = 'fa';
  }
  function startSeason(F) {
    F.year++; F.week = 1; F.phase = 'reg'; F.po = null; F.awards = null; F.draft = null; F.resign = null; F.leftovers = null;
    F.teams.forEach(t => { t.w = 0; t.l = 0; t.t = 0; t.pf = 0; t.pa = 0; t.seed = 0; });
    F.roster.forEach(p => { p.st = {}; p.inj = 0; p.trained = false; });
    F.fan = clamp(F.fan + (F.fac.stad - 1) * 1.5, 3, 100);
    F.streak = 0;
    genSchedule(F);
    userRefresh(F);
    newsAdd(F, F.year + ' season begins');
  }

  function needPos(F) {
    const L = lineup(F.roster), out = [];
    for (const pos of POS) if (L[pos].length < NEED[pos] - (pos === 'OL' ? 1 : 0)) out.push(pos);
    return out;
  }
  function rosterIssues(F) {
    const out = [];
    if (F.roster.length > ROSTER_MAX) out.push('Roster has ' + F.roster.length + ' players (max ' + ROSTER_MAX + '). Release ' + (F.roster.length - ROSTER_MAX) + '.');
    if (payroll(F) > capOf(F)) out.push('Payroll ' + money(payroll(F)) + ' is over the cap ' + money(capOf(F)) + '.');
    for (const pos of POS) {
      const n = F.roster.filter(p => p.pos === pos).length;
      if (n < START[pos]) out.push('Need at least ' + START[pos] + ' ' + pos + ' (have ' + n + ').');
    }
    return out;
  }
  function stdName(F, id) { return tname(F.teams[id]); }

  let F = null, SET = { ...DEF_SET }, M = null, P = null;
  const fx = { parts: [], pops: [], shake: 0, flash: 0 };
  const inp = { ptr: null, keys: new Set(), hx: 0, hy: 0, hv: false, sel: 0, steer: null, lastUp: 0, lastDown: 0 };

  const RT = {
    go: s => [[38, 1.2 * s]], slant: s => [[2.2, 0], [7, -s * 7]], out5: s => [[5, 0], [0.5, s * 7]], drag: s => [[2.5, 0], [0.5, -s * 17]],
    check: s => [[3.5, s * 1.5], [1, 0]], flat: s => [[0.6, s * 3], [1.5, s * 8]], curl: s => [[10, 0], [-2.6, -s * 1.5]], dig: s => [[10.5, 0], [0.5, -s * 15]],
    out: s => [[9.5, 0], [0.5, s * 11]], seam: s => [[24, -s * 0.8]], post: s => [[9, 0], [26, -s * 10]], corner: s => [[10, 0], [24, s * 10]],
    wheel: s => [[2, s * 6], [30, s * 3]], hitch: s => [[6, 0], [-1.2, 0]]
  };
  const PLAYS = {
    p1: { id: 'p1', kind: 'pass', name: 'Quick Slants', tag: 'SHORT', routes: { WR1: 'slant', WR2: 'out5', WR3: 'drag', TE: 'check', RB: 'flat' }, blurb: 'Fast, safe throws. Low risk.' },
    p2: { id: 'p2', kind: 'pass', name: 'Curl and Dig', tag: 'MEDIUM', routes: { WR1: 'curl', WR2: 'dig', WR3: 'out', TE: 'seam', RB: 'check' }, blurb: 'Balanced. Needs a clean pocket.' },
    p3: { id: 'p3', kind: 'pass', name: 'Four Verticals', tag: 'DEEP', routes: { WR1: 'go', WR2: 'post', WR3: 'corner', TE: 'curl', RB: 'check' }, blurb: 'Bombs away. Big plays, big risk.' },
    r1: { id: 'r1', kind: 'run', name: 'Inside Run', tag: 'RUN', hole: 0, blurb: 'Power up the middle.' },
    r2: { id: 'r2', kind: 'run', name: 'Outside Run', tag: 'RUN', hole: 1, blurb: 'Take it to the edge.' },
    r3: { id: 'r3', kind: 'qbrun', name: 'QB Draw', tag: 'RUN', blurb: 'Fake the pass and scramble.' }
  };
  const SPECIAL = { fg: { id: 'fg', kind: 'fg', name: 'Field Goal' }, punt: { id: 'punt', kind: 'punt', name: 'Punt' }, spike: { id: 'spike', kind: 'spike', name: 'Spike' }, kneel: { id: 'kneel', kind: 'kneel', name: 'Kneel' } };

  const synth = (pos, ovr) => ({ id: -1, n: 'Sub', pos, ovr, spd: SPD0[pos], skl: ovr, arm: 70, mor: 70, age: 25, inj: 0, st: {}, sal: 0.5 });
  function offPl(pos, i) {
    const l = M.L[pos];
    if (l && l[i]) return l[i];
    const any = F ? F.roster.filter(p => p.pos === pos && !p.inj && !(l || []).includes(p)) : [];
    return any[0] || synth(pos, 48);
  }
  function defPl(pos, rating) {
    const ovr = clamp(rating + gauss() * 4, 45, 97);
    return { id: -2, n: 'Def', pos, ovr, spd: clamp(SPD0[pos] + (rating - 72) * 0.45 + gauss() * 6, 20, 99), skl: clamp(ovr + gauss() * 5, 40, 99), mor: 70, st: {} };
  }
  function derive(e, boost) {
    const p = e.pl, pos = p.pos, mf = 0.96 + 0.08 * (p.mor == null ? 70 : p.mor) / 100;
    e.mf = mf;
    e.spd = ydps(p.spd) * (0.985 + (mf - 1) * 0.5);
    e.hnd = ((pos === 'WR' || pos === 'TE') ? p.skl : p.ovr * 0.8) * mf + boost;
    e.elu = (pos === 'RB' ? p.skl : pos === 'WR' ? p.ovr * 0.9 : pos === 'QB' ? p.ovr * 0.6 : p.ovr * 0.72) * mf;
    e.blk = (pos === 'OL' ? p.skl : p.ovr * 0.6) * mf + boost;
    e.rsh = pos === 'DL' ? p.skl : p.ovr * 0.8;
    e.cov = (pos === 'CB' || pos === 'S') ? p.skl : p.ovr * 0.72;
    e.tkl = pos === 'LB' ? p.skl : p.ovr * 0.9;
  }
  function mkEnt(role, side, pl, x, y, boost = 0) {
    const e = { role, side, pl, x, y, vx: 0, vy: 0, face: side === 'o' ? 1 : -1, anim: Math.random() * 6, st: 'idle', stun: 0, cd: 0, eng: null, engT: 0, hist: [], down: false, jk: 0, dv: 0, jkcd: 0, slow: 0, bx: x, by: y };
    derive(e, boost);
    return e;
  }

  const THROW_ERR = [0.78, 1, 1.25];

  function setupPlay(call) {
    const los = 10 + M.yl, boost = (F ? (F.fac.off - 1) * 1.6 : 0), dr = M.opp.def + (DIFF_ADJ[SET.diff] || 0) * 0.8, dd = (M.oppDefStr != null ? M.oppDefStr : dr);
    P = { type: call.kind, call, los, t: 0, snapped: false, phase: 'pre', es: [], off: [], def: [], R: {}, carrier: null, ball: { x: los - 4, y: CY, z: 0, vx: 0, vy: 0, vis: true }, air: null, scheme: 'man', pocket: false, maxP: 0, passer: null, done: false, res: null, deadT: 0, anyCatch: false, qbPastLos: false, gain: 0, kk: null, msg: null, noClock: false };
    const shot = call.kind === 'pass' || call.kind === 'qbrun' || call.kind === 'two';
    const R = P.R;
    const add = (role, side, pl, x, y) => { const e = mkEnt(role, side, pl, x, y, side === 'o' ? boost : 0); R[role] = e; P.es.push(e); (side === 'o' ? P.off : P.def).push(e); return e; };
    if (call.kind === 'fg' || call.kind === 'punt' || call.kind === 'xp') {
      const kx = call.kind === 'punt' ? los - 12 : los - 7.5;
      for (let i = 0; i < 5; i++) add('OL' + (i + 1), 'o', offPl('OL', i), los - 0.5, CY + (i - 2) * 1.4);
      for (let i = 0; i < 2; i++) add('TE' + i, 'o', offPl('TE', i), los - 0.5, CY + (i ? 5.6 : -5.6));
      for (let i = 0; i < 2; i++) add('WR' + (i + 1), 'o', offPl('WR', i), los - 0.5, CY + (i ? 8.5 : -8.5));
      const kp = call.kind === 'punt' ? (M.L.P[0] || synth('P', 50)) : (M.L.K[0] || synth('K', 50));
      add('K', 'o', kp, kx, CY);
      if (call.kind !== 'punt') add('H', 'o', offPl('QB', 1) || offPl('QB', 0), los - 7.2, CY - 0.6);
      for (let i = 0; i < 4; i++) add('DL' + (i + 1), 'd', defPl('DL', dd), los + 1.1, CY + (i - 1.5) * 2.1);
      for (let i = 0; i < 7; i++) add('DB' + i, 'd', defPl('CB', dd), los + 6 + (i % 2) * 3, CY + (i - 3) * 3.6);
      P.kind = call.kind;
      const k = P.R.K;
      P.ball = { x: los - (call.kind === 'punt' ? 8 : 7.2), y: CY, z: 0, vx: 0, vy: 0, vis: true };
      P.kk = { charge: 0, aim: 0, ph: 0, state: 'wait', dist: 0, power: 0, wind: M.wind || 0 };
      if (call.kind === 'punt') { P.kk.dist = 0; }
      else { const d = call.kind === 'xp' ? 33 : (100 - M.yl) + 17; P.kk.dist = d; }
      P.kk.maxD = call.kind === 'punt' ? 44 + (k.pl.skl) * 0.36 : 36 + (k.pl.skl) * 0.46;
      P.kk.accMul = 1.38 - (k.pl.ovr) / 125;
      return P;
    }
    const qx = call.kind === 'pass' ? los - 4.6 : call.kind === 'qbrun' ? los - 3 : los - 2.3;
    add('QB', 'o', offPl('QB', 0), qx, CY);
    const rbx = call.kind === 'run' ? los - 5.2 : los - 4.6;
    add('RB', 'o', offPl('RB', 0), rbx, call.kind === 'run' ? CY : CY + 2.3);
    add('TE', 'o', offPl('TE', 0), los - 0.5, CY + 5.2);
    add('WR1', 'o', offPl('WR', 0), los - 0.3, CY - 19.5);
    add('WR2', 'o', offPl('WR', 1), los - 0.3, CY + 19.5);
    add('WR3', 'o', offPl('WR', 2), los - 1.2, CY - 9);
    for (let i = 0; i < 5; i++) add('OL' + (i + 1), 'o', offPl('OL', i), los - 0.5, CY + (i - 2) * 1.6);
    for (let i = 0; i < 4; i++) add('DL' + (i + 1), 'd', defPl('DL', dd), los + 1.2, CY + (i - 1.5) * 3.2);
    add('LB1', 'd', defPl('LB', dd), los + 4.6, CY - 4.6);
    add('LB2', 'd', defPl('LB', dd), los + 4.6, CY + 4.6);
    add('CB1', 'd', defPl('CB', dd), los + 6.5, CY - 19.5);
    add('CB2', 'd', defPl('CB', dd), los + 6.5, CY + 19.5);
    add('CB3', 'd', defPl('CB', dd), los + 5.5, CY - 9);
    add('S1', 'd', defPl('S', dd), los + 12.5, CY - 5.5);
    add('S2', 'd', defPl('S', dd), los + 13.5, CY + 6.5);
    P.qb = R.QB; P.passer = R.QB;
    P.qb.pl = R.QB.pl;
    P.ball = { x: los - 0.6, y: CY, z: 0, vx: 0, vy: 0, vis: true };
    const sd = P.es.filter(e => e.side === 'o');
    sd.forEach(e => { e.face = 1; });
    P.es.filter(e => e.side === 'd').forEach(e => { e.face = -1; });
    P.recv = ['WR1', 'WR2', 'WR3', 'TE', 'RB'].map(k => R[k]);
    if (call.kind === 'pass' || call.kind === 'two') {
      const side = k => (R[k].y < CY ? -1 : 1);
      P.recv.forEach(e => {
        const nm = call.routes[e.role], s = side(e.role);
        e.rt = []; let cx = e.x, cy = e.y;
        RT[nm](s).forEach(([dx, dy]) => { cx += dx; cy += dy; e.rt.push([cx, clamp(cy, 1.2, FW - 1.2)]); });
        e.ri = 0; e.rname = nm; e.st = 'route';
      });
    }
    return P;
  }

  function pickScheme() {
    const bl = 0.2 + SET.diff * 0.05;
    return wsel(['man', 'zone', 'blitz'], [0.4, 0.4 - SET.diff * 0.02, bl]);
  }

  function snapPlay() {
    if (!P || P.snapped) return;
    P.snapped = true; P.phase = 'snap'; P.t = 0;
    snd('snap');
    const R = P.R, los = P.los;
    if (P.kind === 'fg' || P.kind === 'punt' || P.kind === 'xp') { P.kk.state = 'charge'; P.phase = 'kick'; return; }
    P.scheme = pickScheme();
    const dl = [R.DL1, R.DL2, R.DL3, R.DL4], ol = [R.OL1, R.OL2, R.OL3, R.OL4, R.OL5];
    const pairIdx = [0, 1, 3, 4];
    const pass = P.type === 'pass' || P.type === 'two';
    dl.forEach((d, i) => {
      d.st = 'rush'; d.block = ol[pairIdx[i]]; ol[pairIdx[i]].block = d;
      d.tRush = clamp(2.75 + (d.block.blk - d.rsh) / 21 + rnd(-0.4, 0.4), 1.55, 5.4);
      d.p = 0; d.sx = d.x; d.sy = d.y;
    });
    const blz = P.scheme === 'blitz';
    P.es.filter(e => e.side === 'd').forEach(e => { e.cover = null; e.zone = null; });
    const lb1 = R.LB1, lb2 = R.LB2;
    if (pass) {
      if (blz) {
        lb1.st = 'rush'; lb1.block = R.OL3; R.OL3.block = lb1; lb1.tRush = clamp(2.1 + (R.OL3.blk - lb1.rsh) / 24 + rnd(-0.3, 0.3), 1.4, 4); lb1.p = 0; lb1.sx = lb1.x; lb1.sy = lb1.y;
      }
      if (P.scheme === 'zone') {
        R.CB1.zone = [los + 9, CY - 19]; R.CB2.zone = [los + 9, CY + 19]; R.CB3.zone = [los + 7.5, CY - 8]; lb1.zone = [los + 7, CY - 3]; lb2.zone = [los + 7, CY + 6.5]; R.S1.zone = [los + 17, CY - 11]; R.S2.zone = [los + 17, CY + 11];
        [R.CB1, R.CB2, R.CB3, lb1, lb2, R.S1, R.S2].forEach(e => { e.st = 'zone'; });
      } else {
        R.CB1.cover = R.WR1; R.CB2.cover = R.WR2; R.CB3.cover = R.WR3; R.CB1.st = R.CB2.st = R.CB3.st = 'man';
        if (!blz) { lb1.cover = R.TE; lb1.st = 'man'; }
        lb2.cover = R.RB; lb2.st = 'man';
        R.S1.zone = [los + 17, CY - 11]; R.S2.zone = [los + 17, CY + 11]; R.S1.st = R.S2.st = 'zone';
        if (blz) { R.S1.cover = R.TE; R.S1.zone = null; R.S1.st = 'man'; R.S2.zone = [los + 17, CY]; }
      }
      P.es.filter(e => e.side === 'd' && e.st === 'man').forEach(e => { e.lag = clamp(0.33 - (e.cov - 60) * 0.0042, 0.1, 0.4); });
    } else {
      P.es.filter(e => e.side === 'd' && !['rush'].includes(e.st)).forEach(e => { e.st = 'read'; e.readT = (e.role[0] === 'L' ? 0.38 : e.role[0] === 'S' ? 0.75 : 0.55) + rnd(0, 0.15) + (P.type === 'qbrun' ? 0.85 : 0); });
      const pairs = [[R.OL1, dl[0]], [R.OL2, dl[1]], [R.OL4, dl[2]], [R.OL5, dl[3]]];
      pairs.forEach(([o, d]) => { o.block = d; d.block = o; d.st = 'rush'; });
      dl.forEach(d => { d.runBlock = true; });
      R.OL3.block = (Math.abs(lb1.y - CY) < Math.abs(lb2.y - CY) ? lb1 : lb2);
      R.TE.block = lb2; R.WR1.block = R.CB1; R.WR2.block = R.CB2; R.WR3.block = R.CB3;
      if (P.type === 'qbrun') { R.RB.block = lb1; R.TE.block = lb2; }
      if (P.type === 'run') {
        const side = P.call.hole ? 1 : 0;
        R.RB.st = 'hand';
        P.hole = side ? { x: los + 1.5, y: CY + 8.5 } : { x: los + 1.2, y: CY + rnd(-2.2, 2.2) };
        R.TE.block = lb2;
      }
      if (P.type === 'qbrun') { P.qb.st = 'hold'; }
    }
    if (pass) { P.recv.forEach(e => { e.st = 'route'; }); R.QB.st = 'hold'; }
    if (P.type === 'run') R.QB.st = 'under';
    if (P.type !== 'qbrun') P.recv.forEach(e => { if (!e.rt) e.st = e.st; });
    P.ballT = 0.38;
    P.ballFrom = { x: los - 0.6, y: CY };
  }

  function accelTo(e, vx, vy, dt, acc) {
    const k = Math.min(1, acc * dt);
    e.vx += (vx - e.vx) * k; e.vy += (vy - e.vy) * k;
  }
  function steer(e, tx, ty, mul, dt, acc = 9) {
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    const sp = e.spd * mul * (e.slow > 0 ? 0.6 : 1);
    if (d < 0.05) accelTo(e, 0, 0, dt, 12);
    else { const m = Math.min(sp, d / Math.max(dt, 0.016) * 0.9); accelTo(e, dx / d * m, dy / d * m, dt, acc); }
  }
  function integrate(e, dt) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (Math.abs(e.vx) > 0.4) e.face = e.vx > 0 ? 1 : -1;
    const sp = Math.hypot(e.vx, e.vy);
    e.anim += dt * (3 + sp * 1.25);
    e.hist.push({ t: P.t, x: e.x, y: e.y });
    if (e.hist.length > 90) e.hist.shift();
  }
  function histAt(e, t) {
    const h = e.hist;
    for (let i = h.length - 1; i >= 0; i--) if (h[i].t <= t) return h[i];
    return h.length ? h[0] : { x: e.x, y: e.y };
  }

  function routeStep(e, dt) {
    if (e.ri >= e.rt.length) { steer(e, e.x + e.vx * 0.2, e.y + e.vy * 0.2, 0.2, dt, 6); return; }
    const [tx, ty] = e.rt[e.ri];
    if (Math.hypot(tx - e.x, ty - e.y) < 0.7) { e.ri++; if (e.ri >= e.rt.length) return; }
    const [nx, ny] = e.rt[Math.min(e.ri, e.rt.length - 1)];
    steer(e, nx, ny, 0.98, dt, 7.5);
  }
  function routePos(e, T) {
    let x = e.x, y = e.y, i = e.ri || 0, left = e.spd * 0.93 * T;
    while (left > 0 && e.rt && i < e.rt.length) {
      const [tx, ty] = e.rt[i], d = Math.hypot(tx - x, ty - y);
      if (d <= left) { x = tx; y = ty; left -= d; i++; } else { x += (tx - x) / d * left; y += (ty - y) / d * left; left = 0; }
    }
    if (left > 0 && e.rt && e.rt.length) { const vx = e.vx, vy = e.vy, m = Math.hypot(vx, vy) || 1; x += vx / m * Math.min(left, 1) * 0.2; y += vy / m * Math.min(left, 1) * 0.2; }
    return { x, y };
  }
  function leadFor(e, q) {
    const arm = (q.pl.arm || 70), sp = 22 + arm * 0.12;
    let T = Math.max(0.4, dist(q, e) / sp), pos = { x: e.x, y: e.y };
    for (let i = 0; i < 4; i++) { pos = e.rt ? routePos(e, T) : { x: e.x + e.vx * T, y: e.y + e.vy * T }; T = Math.max(0.42, dist(q, pos) / sp); }
    return { x: pos.x, y: clamp(pos.y, 0.8, FW - 0.8), T };
  }

  function nearestDef(e, skip) {
    let best = 99, bd = null;
    for (const d of P.def) {
      if (d === skip || d.stun > 0 || d.eng) continue;
      const k = Math.hypot((d.x - e.x), (d.y - e.y) * 1.0);
      if (k < best) { best = k; bd = d; }
    }
    return { d: bd, k: best };
  }
  function openness(e) { return nearestDef(e).k; }

  function carrierInput(c, dt) {
    let ix = 0, iy = 0, has = false;
    const K = inp.keys;
    if (K.has('ArrowLeft') || K.has('KeyA')) { ix -= 1; has = true; }
    if (K.has('ArrowRight') || K.has('KeyD')) { ix += 1; has = true; }
    if (K.has('ArrowUp') || K.has('KeyW')) { iy -= 1; has = true; }
    if (K.has('ArrowDown') || K.has('KeyS')) { iy += 1; has = true; }
    if (has) { const m = Math.hypot(ix, iy); ix /= m; iy /= m; return { x: c.x + ix * 6, y: c.y + iy * 6, key: true }; }
    const p = inp.ptr;
    if (p && p.down && p.steer) {
      return { x: p.wx, y: p.wy, key: false };
    }
    return null;
  }

  function tryJuke(dx, dy) {
    const c = P && P.carrier;
    if (!c || c.jkcd > 0 || c.diving || P.phase !== 'run') return false;
    let jx = dx, jy = dy;
    const m = Math.hypot(jx, jy);
    if (m < 0.01) {
      let best = null, bk = 99;
      for (const d of P.def) { if (d.stun > 0) continue; const k = Math.hypot(d.x - c.x, d.y - c.y); if (k < bk && d.x > c.x - 1) { bk = k; best = d; } }
      jy = best ? (best.y > c.y ? -1 : 1) : (c.y > CY ? -1 : 1); jx = 0.35;
    } else { jx /= m; jy /= m; }
    const mm = Math.hypot(jx, jy); jx /= mm; jy /= mm;
    c.jk = 0.36; c.jkcd = 0.95; c.jx = jx; c.jy = jy;
    c.vx = jx * c.spd * 1.15 + c.vx * 0.25; c.vy = jy * c.spd * 1.15 + c.vy * 0.25;
    snd('juke');
    P.jukes = (P.jukes || 0) + 1;
    for (const d of P.def) {
      if (d.stun > 0 || d.eng) continue;
      const k = Math.hypot(d.x - c.x, d.y - c.y);
      if (k < 3 && chance(0.56 - (d.tkl - 60) * 0.004)) { d.stun = 0.45; d.bit = true; fx.pops.push({ x: d.x, y: d.y - 2.5, t: 0.7, s: 'MISS', c: '#ffe14d' }); }
    }
    return true;
  }
  function tryDive() {
    const c = P && P.carrier;
    if (!c || c.diving || P.phase !== 'run' || c.jk > 0.15) return false;
    c.dv = 0.4; c.diving = true;
    c.vx = Math.max(c.vx, c.spd) * 1.1 + 0.8; c.vy *= 0.4;
    snd('dive');
    return true;
  }

  function startCarry(e, why) {
    P.carrier = e; P.phase = 'run'; e.st = 'carry'; e.jk = 0; e.dv = 0; e.jkcd = 0.2; e.slow = 0.22;
    P.carried = e;
    P.ball.vis = true;
  }

  function throwBall(tx, ty, tgt) {
    if (P.phase !== 'hold' || !P.qb || P.qbPastLos) return false;
    const q = P.qb, pl = q.pl, acc = pl.skl + (F ? (F.fac.off - 1) * 1.6 : 0);
    const arm = pl.arm || 70, sp = 22 + arm * 0.12;
    tx = clamp(tx, 1, FL - 1); ty = clamp(ty, -3, FW + 3);
    const d0 = Math.hypot(tx - q.x, ty - q.y);
    let sig = (1.15 - acc / 100 * 0.95) * (1 + d0 / 24) * THROW_ERR[SET.diff];
    const pm = P.maxP > 0.72 ? 1 + (P.maxP - 0.72) * 3.1 : 1;
    sig *= pm * (Math.hypot(q.vx, q.vy) > 1.2 ? 1.3 : 1) * (0.94 + (1 - q.mf) * 0.0);
    const lx = tx + gauss() * sig * 1.25, ly = ty + gauss() * sig;
    const d = Math.hypot(lx - q.x, ly - q.y);
    P.air = { sx: q.x, sy: q.y, tx: lx, ty: ly, T: Math.max(0.42, d / sp), u: 0, h: clamp(d * 0.2, 1.4, 8.5), tgt: tgt || null, aimX: tx, aimY: ty, hit: false };
    P.phase = 'air'; P.airT = 0;
    q.st = 'throw'; q.vx *= 0.3; q.vy *= 0.3;
    P.ball.vis = true;
    snd('throw');
    stat(P.qb.pl, 'pa');
    P.throwT = P.t;
    return true;
  }

  function recvAt(wx, wy, rad = 7) {
    let best = null, bk = rad;
    for (const e of P.recv) {
      const k = Math.hypot((e.x - wx), (e.y - wy) * 1.6);
      if (k < bk) { bk = k; best = e; }
    }
    return best;
  }
  function aimAssist(wx, wy) {
    if (!P || !P.qb) return { x: wx, y: wy, tgt: null };
    const q = P.qb;
    let best = null, bk = 4.6;
    for (const e of P.recv) {
      const L = leadFor(e, q);
      const k = Math.hypot(L.x - wx, (L.y - wy) * 1.3);
      if (k < bk) { bk = k; best = { x: L.x, y: L.y, tgt: e, T: L.T }; }
    }
    return best || { x: wx, y: wy, tgt: null };
  }
  function throwToRecv(e) {
    if (!P || P.phase !== 'hold' || !e) return false;
    const L = leadFor(e, P.qb);
    return throwBall(L.x, L.y, e);
  }

  function recvAIair(e, dt) {
    const a = P.air;
    if (e === a.tgt) { steer(e, a.tx, a.ty, 1.02, dt, 10); return true; }
    return false;
  }

  function ballPos() {
    const a = P.air, u = clamp(a.u, 0, 1);
    return { x: lerp(a.sx, a.tx, u), y: lerp(a.sy, a.ty, u), z: 4 * a.h * u * (1 - u) };
  }

  function resolveCatch() {
    const a = P.air, bx = a.tx, by = a.ty;
    P.ball.x = bx; P.ball.y = by; P.ball.z = 0;
    const offs = [], defs = [];
    for (const e of P.recv) { const k = Math.hypot(e.x - bx, (e.y - by) * 1.15); if (k < 2.6) offs.push({ e, k }); }
    for (const d of P.def) { if (d.stun > 0.2) continue; const k = Math.hypot(d.x - bx, (d.y - by) * 1.15); if (k < 2.6) defs.push({ e: d, k }); }
    offs.sort((p, q) => p.k - q.k); defs.sort((p, q) => p.k - q.k);
    const oc = offs[0], dc = defs[0];
    let outcome = 'inc';
    const dm = [0.9, 1, 1.12][SET.diff];
    const deepPen = 1 - clamp((Math.hypot(a.tx - a.sx, a.ty - a.sy) - 20) / 55, 0, 0.5);
    if (oc && !dc) {
      const hp = 0.5 + oc.e.hnd / 100 * 0.47;
      const pc = hp * clamp(1.12 - oc.k * 0.28, 0.35, 1);
      outcome = chance(pc * deepPen) ? 'catch' : 'drop';
    } else if (oc && dc) {
      const adv = dc.k - oc.k;
      const pInt = clamp((0.2 - adv * 0.1 + (dc.e.cov - oc.e.hnd) / 330) * dm, 0.02, 0.55);
      const pBrk = 0.26 + (dc.e.cov - 70) / 400;
      const r = Math.random();
      if (r < pInt) outcome = 'int';
      else if (r < pInt + pBrk) outcome = 'inc';
      else outcome = chance(clamp(0.5 + oc.e.hnd / 100 * 0.42 - 0.08, 0.45, 0.95) * deepPen) ? 'catch' : 'drop';
    } else if (!oc && dc) {
      outcome = chance(clamp(0.16 + (dc.e.cov - 70) / 250, 0.08, 0.36) * dm) ? 'int' : 'inc';
    }
    a.hit = true;
    if (outcome === 'catch') {
      const e = oc.e;
      P.catcher = e; P.catchX = e.x; P.anyCatch = true;
      e.x = bx; e.y = by; e.vx *= 0.5; e.vy *= 0.5;
      startCarry(e, 'catch');
      snd('catch'); fx.pops.push({ x: e.x, y: e.y - 3, t: 0.8, s: 'CATCH', c: '#ffffff' });
      stat(P.qb.pl, 'pc');
    } else if (outcome === 'int') {
      const d = dc.e;
      P.phase = 'ret'; P.carrier = d; d.st = 'carry'; d.x = bx; d.y = by; P.intBy = d; P.intX = bx;
      snd('turnover'); fx.pops.push({ x: bx, y: by - 3, t: 1.2, s: 'INTERCEPTED', c: '#ff5a4d' });
      stat(P.qb.pl, 'pi');
      P.retStart = P.t;
      P.es.filter(e => e.side === 'o').forEach(e => { e.st = 'chase'; });
    } else {
      P.phase = 'dead'; P.ball.z = 0; P.ball.vx = a.tx - a.sx; P.ball.vy = (a.ty - a.sy) * 0.4;
      const m = Math.hypot(P.ball.vx, P.ball.vy) || 1; P.ball.vx = P.ball.vx / m * 4; P.ball.vy = P.ball.vy / m * 4;
      snd(outcome === 'drop' ? 'drop' : 'drop');
      fx.pops.push({ x: bx, y: by - 3, t: 0.9, s: outcome === 'drop' ? 'DROPPED' : 'INCOMPLETE', c: '#ffcf6b' });
      endPlay({ kind: 'inc', yds: 0, endX: P.los, stopClock: true, text: outcome === 'drop' ? 'Pass dropped' : 'Pass incomplete' });
    }
  }

  function endPlay(res) {
    if (P.phase === 'over') return;
    P.phase = 'over'; P.res = res; P.deadT = 0;
    P.carrier = P.carrier;
    if (res.td) { fx.flash = 1; snd('td'); confetti(); }
  }
  function confetti() {
    for (let i = 0; i < 60; i++) fx.parts.push({ x: rnd(0, 1), y: rnd(-0.2, 0.2), vx: rnd(-40, 40), vy: rnd(10, 90), t: rnd(1.5, 3), c: pick(['#ff4d4d', '#ffe14d', '#4dff88', '#4db8ff', '#ffffff', '#ff8fe3']), conf: true });
  }
  function puff(x, y, n, c = '#e8e8e8') {
    for (let i = 0; i < n; i++) fx.parts.push({ wx: x, wy: y, vx: rnd(-9, 9), vy: rnd(-12, -2), t: rnd(0.25, 0.6), c, g: 28 });
  }

  function tackle(d, c, why) {
    const dv = !!c.diving;
    const pF = (dv ? 0.045 : 0.012) + (d.tkl - 70) * 0.0004 - (c.pl.pos === 'RB' ? 0.003 : 0) + (c.pl.pos === 'QB' ? 0.004 : 0);
    puff(c.x, c.y, 8);
    snd('tackle');
    fx.shake = Math.max(fx.shake, 0.18);
    if (chance(Math.max(0.004, pF))) { fumble(c, d); return; }
    const t = c.x;
    const gain = t - P.los;
    c.st = 'down'; c.down = true; c.vx *= 0.1; c.vy *= 0.1; d.vx = 0; d.vy = 0;
    P.ball.vis = true;
    const inj = chance(0.014 + Math.max(0, gain) * 0.0004) && c.pl.id > 0;
    if (inj) { weeksInj(F, c.pl); (M.liveInj = M.liveInj || []).push(c.pl); P.injured = c.pl; fx.pops.push({ x: c.x, y: c.y - 4, t: 1.6, s: 'INJURED', c: '#ff5a4d' }); }
    endTackle(c, 'tackle');
  }
  function endTackle(c, how) {
    const x = c.x;
    let kind = P.catcher ? 'comp' : 'run';
    if (P.type === 'qbrun' || (c === P.qb && !P.catcher)) kind = 'run';
    let end = x;
    let safety = false;
    if (end <= 10 && P.los + 0 > 10) safety = true;
    if (c === P.qb && !P.air && P.type === 'pass' && !P.qbRan) kind = 'sack';
    endPlay({ kind, yds: end - P.los, endX: end, carrier: c.pl, safety, stopClock: false, text: '' });
  }
  function fumble(c, d) {
    c.st = 'down'; c.down = true;
    P.ball.x = c.x; P.ball.y = c.y; P.ball.z = 0; P.ball.vx = rnd(-3, 3); P.ball.vy = rnd(-3, 3); P.ball.vis = true;
    P.phase = 'loose'; P.looseT = 0; P.looseFrom = c; P.fumbler = c;
    snd('turnover'); fx.pops.push({ x: c.x, y: c.y - 4, t: 1.4, s: 'FUMBLE!', c: '#ff5a4d' });
    fx.shake = 0.35;
  }

  function resolveLoose() {
    const b = P.ball;
    let ow = 0, dw = 0;
    P.es.forEach(e => { if (e.down) return; const k = Math.hypot(e.x - b.x, e.y - b.y); const w = 1 / (0.6 + k * k); if (e.side === 'o') ow += w; else dw += w; });
    const offWin = chance(clamp(ow / (ow + dw + 0.0001) * 0.9 + 0.04, 0.12, 0.86));
    const c = P.fumbler;
    const bx = clamp(b.x, 1, 119);
    if (offWin) {
      fx.pops.push({ x: bx, y: b.y - 3, t: 1.2, s: 'RECOVERED', c: '#5fe36b' });
      endPlay({ kind: P.catcher ? 'comp' : 'run', yds: bx - P.los, endX: bx, carrier: c.pl, fumLost: false, fumbled: true, text: '' });
    } else {
      fx.pops.push({ x: bx, y: b.y - 3, t: 1.2, s: 'LOST!', c: '#ff5a4d' });
      endPlay({ kind: 'fumble', yds: bx - P.los, endX: bx, carrier: c.pl, tov: 'fum', text: '' });
    }
  }

  function doSack() {
    const q = P.qb;
    const pr = P.es.filter(e => e.side === 'd' && e.st === 'rush' || e.sackBy).sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y))[0];
    q.st = 'down'; q.down = true; q.vx = 0; q.vy = 0;
    puff(q.x, q.y, 12);
    snd('sack'); fx.shake = 0.45;
    fx.pops.push({ x: q.x, y: q.y - 4, t: 1.2, s: 'SACKED', c: '#ff5a4d' });
    P.sackBy = pr;
    if (chance(0.06)) { fumble(q, pr); P.sackFum = true; return; }
    const end = q.x;
    endPlay({ kind: 'sack', yds: end - P.los, endX: end, carrier: q.pl, safety: end <= 10, stopClock: false, text: '' });
  }

  function liveTick(dt) {
    const R = P.R, q = P.qb;
    const ph = P.phase;
    if (ph === 'over') { P.deadT += dt; if (P.res && P.res.kind === 'inc') { P.ball.x += P.ball.vx * dt; P.ball.y += P.ball.vy * dt; P.ball.vx *= 0.9; P.ball.vy *= 0.9; } P.es.forEach(e => { if (!e.down) { accelTo(e, 0, 0, dt, 5); integrate(e, dt); } }); return; }
    const pass = P.type === 'pass' || P.type === 'two';
    if (P.ballT > 0 && P.phase === 'snap') {
      P.ballT -= dt;
      const u = 1 - clamp(P.ballT / 0.38, 0, 1);
      P.ball.x = lerp(P.ballFrom.x, q.x, u); P.ball.y = lerp(P.ballFrom.y, q.y, u); P.ball.z = Math.sin(u * Math.PI) * 0.5;
      if (P.ballT <= 0) {
        if (P.type === 'run') { P.phase = 'handoff'; } else if (P.type === 'qbrun') { startCarry(q, 'qb'); q.slow = 0; q.spd = Math.max(q.spd, 7.6); } else P.phase = 'hold';
      }
    }
    if (P.phase === 'handoff') {
      P.ball.x = q.x + 0.3; P.ball.y = q.y;
      const rb = R.RB;
      if (!rb.hOk) { rb.hOk = true; rb.hx = q.x - 0.3; rb.hy = CY; }
      if (Math.hypot(rb.x - (q.x - 0.2), rb.y - q.y) < 1.3 || P.t > 1.0) { startCarry(rb, 'rb'); rb.slow = 0; rb.auto = true; rb.side = P.call.hole; }
    }
    const carrier = P.carrier;
    const inRun = P.phase === 'run';
    if (pass && (P.phase === 'hold' || P.phase === 'air') && P.type === 'pass') {
      let mp = 0;
      P.es.forEach(e => { if (e.side === 'd' && e.st === 'rush' && e.p != null) mp = Math.max(mp, e.p); });
      P.maxP = mp;
    }

    P.es.forEach(e => { if (e.stun > 0) e.stun -= dt; if (e.cd > 0) e.cd -= dt; if (e.slow > 0) e.slow -= dt; if (e.jkcd > 0) e.jkcd -= dt; });
    if (P.phase === 'air') {
      const a = P.air;
      a.u += dt / a.T; P.airT += dt;
      const bp = ballPos(); P.ball.x = bp.x; P.ball.y = bp.y; P.ball.z = bp.z;
      if (a.u >= 1) { resolveCatch(); }
    }
    if (P.phase === 'loose') {
      P.looseT += dt;
      const b = P.ball; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.96; b.vy *= 0.96;
      b.z = Math.abs(Math.sin(P.looseT * 7)) * Math.max(0, 0.9 - P.looseT * 0.6);
      if (P.looseT > 1.15) resolveLoose();
    }

    for (const e of P.es) {
      if (e.down) { e.vx = 0; e.vy = 0; continue; }
      if (e.eng && e.eng.down) e.eng = null;
      if (e === P.carrier && (P.phase === 'run' || P.phase === 'ret')) continue;
      if (e.side === 'o') offAI(e, dt, pass);
      else defAI(e, dt, pass);
    }
    if (P.carrier && P.phase === 'run') carryMove(P.carrier, dt);
    if (P.carrier && P.phase === 'ret') retMove(P.carrier, dt);

    for (const e of P.es) { if (e.down) continue; integrate(e, dt); if (e.eng) e.eng = e.eng; }
    if (P.phase === 'run' || P.phase === 'ret') { const c = P.carrier; P.ball.x = c.x + c.face * 0.5; P.ball.y = c.y; P.ball.z = 0; }
    if (P.phase === 'hold') { P.ball.x = q.x + 0.4; P.ball.y = q.y; P.ball.z = 0; }
    if (P.phase === 'handoff') { P.ball.x = q.x + 0.4; P.ball.y = q.y; }
    if (P.phase === 'air' || P.phase === 'dead') { }

    blockTick(dt);
    if (P.phase === 'hold') holdCheck(dt);
    if (P.phase === 'run') runCheck(dt);
    if (P.phase === 'ret') retCheck(dt);
    if (P.phase === 'dead') { P.ball.x += P.ball.vx * dt; P.ball.y += P.ball.vy * dt; P.ball.vx *= 0.92; P.ball.vy *= 0.92; P.deadT += dt; }
    P.es.forEach(e => { e.y = clamp(e.y, -3, FW + 3); e.x = clamp(e.x, 0.5, FL - 0.5); });
  }

  function offAI(e, dt, pass) {
    const R = P.R, role = e.role;
    if (role === 'QB') {
      if (P.phase === 'hold') {
        const k = carrierInput(e, dt);
        let kx = null;
        if (inp.keys.has('ArrowLeft') || inp.keys.has('KeyA') || inp.keys.has('ArrowRight') || inp.keys.has('KeyD') || inp.keys.has('ArrowUp') || inp.keys.has('KeyW') || inp.keys.has('ArrowDown') || inp.keys.has('KeyS')) kx = k;
        else if (inp.ptr && inp.ptr.down && inp.ptr.scr) kx = { x: inp.ptr.wx, y: inp.ptr.wy };
        if (kx) {
          steer(e, kx.x, kx.y, 0.92, dt, 8);
          if (e.x > P.los - 0.2 || Math.hypot(e.x - e.bx, e.y - e.by) > 2.4) { if (!P.pocket) { P.pocket = true; P.rushFree = P.t; } }
        } else if (!P.pocket) steer(e, e.bx, e.by, 0.5, dt, 8); else accelTo(e, 0, 0, dt, 4);
        if (e.x > P.los + 0.1 && P.type === 'pass') { P.qbPastLos = true; P.qbRan = true; startCarry(e, 'qb'); e.slow = 0; }
        return;
      }
      if (P.phase === 'under' || P.phase === 'snap' || P.phase === 'handoff') { accelTo(e, 0, 0, dt, 6); return; }
      accelTo(e, 0, 0, dt, 4);
      if (P.phase === 'run' && P.carrier !== e) { steer(e, e.x + 3, e.y, 0.3, dt); }
      return;
    }
    if (role === 'RB' && (P.type === 'run' || P.type === 'qbrun')) {
      if (P.type === 'run' && (P.phase === 'snap' || P.phase === 'handoff')) {
        const q2 = R.QB;
        const hx = q2.x - 0.6, hy = q2.y + (P.call.hole ? 1.6 : 0);
        steer(e, hx, hy, 0.95, dt, 9);
        return;
      }
      if (P.type === 'qbrun' && e.block) { const b = e.block; steer(e, b.x - 1.2, b.y, 0.95, dt, 8); return; }
    }
    if (e.rt && (P.phase === 'hold' || P.phase === 'air' || P.phase === 'snap')) {
      if (P.phase === 'air' && recvAIair(e, dt)) return;
      if (P.phase === 'air') {
        const a = P.air;
        if (e !== a.tgt) { routeStep(e, dt); return; }
      }
      routeStep(e, dt); return;
    }
    if (P.phase === 'run' || P.phase === 'ret' || P.phase === 'dead' || P.phase === 'over') {
      if (P.phase === 'ret' || (e.side === 'o' && e.st === 'chase')) {
        const c = P.carrier; if (c) steer(e, c.x + c.vx * 0.3, c.y + c.vy * 0.3, 0.95, dt, 8);
        return;
      }
      if (e.block && !e.eng) { const b = e.block; steer(e, b.x - 0.6, b.y, 0.9, dt, 8); return; }
      if (e.eng) { accelTo(e, 0, 0, dt, 8); return; }
      if (e.rt) { const c = P.carrier; if (c) steer(e, c.x + 2, c.y + (e.y - c.y) * 0.1, 0.85, dt, 7); return; }
      accelTo(e, 0, 0, dt, 5);
      return;
    }
    if (e.block) {
      const b = e.block;
      if (e.eng) { accelTo(e, 0, 0, dt, 8); return; }
      if (P.type === 'run' || P.type === 'qbrun') { steer(e, b.x - 0.7, b.y, 0.9, dt, 8); return; }
    }
    if (e.role.startsWith('OL') && pass) { return; }
    accelTo(e, 0, 0, dt, 5);
  }

  function carryMove(c, dt) {
    if (c.jk > 0) c.jk -= dt;
    let spdMul = c.slow > 0 ? 0.55 : 1;
    if (c.diving) {
      c.dv -= dt; c.vy *= 0.94; c.vx *= 0.975;
      if (c.dv <= 0) { c.diving = false; c.st = 'down'; c.down = true; endTackle(c, 'dive'); }
      return;
    }
    if (c.jk > 0) { c.vx = lerp(c.vx, c.jx * c.spd * 1.1 + c.spd * 0.35, 0.08); c.vy = lerp(c.vy, c.jy * c.spd * 1.1, 0.08); return; }
    const inpT = carrierInput(c, dt);
    let tx, ty, mul = 0.97;
    if (inpT) { tx = inpT.x; ty = inpT.y; mul = 1; c.auto = null; }
    else if (c.auto && P.hole) {
      const h = P.hole;
      if (c.x < h.x - 0.4 || (c.side === 1 && c.x < P.los + 2.5)) { tx = h.x; ty = h.y; } else { c.auto = null; tx = c.x + 8; ty = c.y; }
    } else { tx = c.x + 8; ty = c.y + (c.y < 4 ? 1 : c.y > FW - 4 ? -1 : 0) * 2; }
    steer(c, tx, ty, mul * spdMul, dt, 8.5);
  }

  function retMove(c, dt) {
    let tx = c.x - 8, ty = c.y;
    const o = P.off.filter(e => e.role !== 'OL1' && !e.down);
    let n = null, nk = 99;
    for (const e of o) { const k = Math.hypot(e.x - c.x, e.y - c.y); if (k < nk) { nk = k; n = e; } }
    if (n && nk < 7) ty = c.y + (c.y > n.y ? 1 : -1) * 3;
    steer(c, tx, ty, 0.98, dt, 6);
  }

  function defAI(e, dt, pass) {
    const R = P.R;
    if (e.stun > 0) { accelTo(e, 0, 0, dt, 9); return; }
    if (e.st === 'chase' || P.phase === 'run' || P.phase === 'ret') {
      if (P.phase === 'ret') { if (e === P.carrier) return; if (e.eng) { accelTo(e, 0, 0, dt, 8); return; } steer(e, P.carrier.x - 8, P.carrier.y + (e.y - P.carrier.y) * 0.5, 0.8, dt, 7); return; }
      if (P.phase === 'run') {
        if (e.eng) { accelTo(e, 0, 0, dt, 8); return; }
        if (e.st === 'rush' && e.p != null && e.freeAt != null && P.t < e.freeAt) { accelTo(e, 0, 0, dt, 6); return; }
        const c = P.carrier;
        if (e.role[0] === 'D' && e.role[1] === 'L' && e.block && !e.block.down && e.runBlock && !e.shed) { return; }
        const dd = Math.hypot(c.x - e.x, c.y - e.y);
        const lead = clamp(dd / Math.max(e.spd, 5), 0, 1.1) * 0.85;
        steer(e, c.x + c.vx * lead, c.y + c.vy * lead, e.role[0] === 'D' && e.role[1] === 'L' ? 0.94 : e.role[0] === 'S' || e.role[0] === 'C' ? 1.04 : 1, dt, 8);
        return;
      }
    }
    if (P.phase === 'air') {
      const a = P.air;
      const d = Math.hypot(a.tx - e.x, a.ty - e.y);
      if (e.st === 'rush') { steer(e, P.qb.x, P.qb.y, 0.7, dt, 6); return; }
      if (d < 16 && P.airT > 0.22) { steer(e, a.tx, a.ty, 1, dt, 9); return; }
    }
    if (pass && P.phase === 'hold') {
      if (e.st === 'rush') { rushMove(e, dt); return; }
      if (e.st === 'man' && e.cover) {
        const r = e.cover;
        const h = histAt(r, P.t - e.lag);
        let tx = h.x + 0.4, ty = h.y;
        const dxr = r.x - e.x;
        if (r.x - P.los < 5 && Math.abs(r.y - e.y) > 3) tx = h.x + 1.2;
        steer(e, tx + (dxr < -0.5 ? 0 : 1.1), ty + (r.y > e.y ? 0.4 : -0.4), 0.985, dt, 8);
        return;
      }
      if (e.st === 'zone') {
        const [ax, ay] = e.zone;
        let tr = null, bk = 7;
        for (const r of P.recv) {
          const k = Math.hypot(r.x - ax, (r.y - ay) * 0.8);
          if (k < bk) { bk = k; tr = r; }
        }
        const deep = e.role[0] === 'S';
        if (tr) {
          const h = histAt(tr, P.t - 0.3);
          let tx = h.x + (deep ? 3 : 1), ty = h.y;
          if (!deep && tr.x < e.x - 1) tx = tr.x + 0.2;
          steer(e, tx, ty, 0.95, dt, 7);
        } else steer(e, ax, ay + (P.qb.y - CY) * 0.2, 0.7, dt, 6);
        return;
      }
      if (e.st === 'read') { accelTo(e, 0, 0, dt, 5); }
      return;
    }
    if (!pass && P.phase !== 'run') {
      if (e.st === 'rush') { if (e.p == null) e.p = 0; accelTo(e, 0, 0, dt, 5); return; }
      if (e.st === 'read') {
        e.readT -= dt;
        if (e.readT <= 0) { e.st = 'chase'; }
        accelTo(e, 0, 0, dt, 5);
        return;
      }
      accelTo(e, 0, 0, dt, 4);
      return;
    }
    if (e.st === 'rush') { rushMove(e, dt); return; }
    accelTo(e, 0, 0, dt, 4);
  }

  function rushMove(e, dt) {
    const q = P.qb;
    if (P.pocket && !e.free) {
      e.free = true;
      e.freeAt = P.t + Math.max(0, (0.55 - e.p) * e.tRush * 1.1);
    }
    if (e.free) {
      if (P.t < e.freeAt) { accelTo(e, 0, 0, dt, 6); return; }
      steer(e, q.x + q.vx * 0.3, q.y + q.vy * 0.3, 0.96, dt, 7);
      if (Math.hypot(e.x - q.x, e.y - q.y) < 1.05 && P.phase === 'hold') { e.sackBy = true; doSack(); }
      return;
    }
    e.p = clamp((P.t - 0.15) / e.tRush, 0, 1);
    const p = Math.pow(e.p, 1.6);
    const tx = lerp(e.sx, q.x, p), ty = lerp(e.sy, q.y, p) + Math.sin(P.t * 9 + e.sx) * 0.25 * (1 - p);
    e.x = tx; e.y = ty; e.vx = -1.2; e.vy = 0;
    if (e.block && !e.block.down) {
      const b = e.block, dx = q.x - e.x, dy = q.y - e.y, m = Math.hypot(dx, dy) || 1;
      b.x = e.x + dx / m * 1.0; b.y = e.y + dy / m * 1.0;
      b.vx = 0; b.vy = 0;
    }
    if (e.p >= 1 && P.phase === 'hold') { e.sackBy = true; doSack(); }
  }

  function blockTick(dt) {
    const pass = P.type === 'pass' || P.type === 'two';
    if (pass) return;
    for (const b of P.off) {
      if (!b.block || b.down) continue;
      const t = b.block;
      if (t.down) { b.eng = null; continue; }
      if (b.eng === t) {
        b.engT -= dt;
        const win = b.blk - (t.rsh || t.tkl || 60);
        const push = win > 0 ? 0.9 : -0.5;
        b.x += push * dt * 0.5; t.x += push * dt; b.vx = 0; b.vy = 0; t.vx = 0; t.vy = 0;
        t.y += (b.y - t.y) * dt * 3;
        if (b.engT <= 0) {
          b.eng = null; t.eng = null;
          if (chance(0.16 + win / 160)) { t.stun = 1.0; t.pancaked = true; t.runBlock = false; t.shed = true; if (t.st === 'rush') t.st = 'chase'; } else { t.shed = true; t.runBlock = false; if (t.st === 'rush') t.st = 'chase'; b.stun = 0.2; }
          b.block = null;
        }
        continue;
      }
      if (b.eng) continue;
      const k = Math.hypot(b.x - t.x, b.y - t.y);
      if (k < 1.5 && !t.eng) {
        b.eng = t; t.eng = b;
        const win = b.blk - (t.rsh || t.tkl || 60);
        b.engT = clamp(1.25 + win / 22, 0.45, 3.4) + rnd(0, 0.9);
        t.engT = b.engT;
      }
    }
    for (const t of P.def) {
      if (t.eng && !t.eng.eng) t.eng = null;
      if (t.eng && t.eng.eng === t) t.vx = t.vy = 0;
    }
  }

  function holdCheck(dt) {
    if (P.type === 'two' && P.t > 9) { endPlay({ kind: 'inc', yds: 0, endX: P.los, stopClock: true, text: 'Pass incomplete' }); }
    if (P.t > 11) { throwBall(P.los + 8, CY, null); }
  }

  function runCheck(dt) {
    const c = P.carrier;
    if (c.y < 0 || c.y > FW) {
      c.st = 'down'; c.down = true;
      endPlay({ kind: P.catcher ? 'comp' : 'run', yds: c.x - P.los, endX: c.x, carrier: c.pl, oob: true, stopClock: true, text: '' });
      fx.pops.push({ x: c.x, y: clamp(c.y, 2, FW - 2) - 3, t: 0.9, s: 'OUT OF BOUNDS', c: '#ffffff' });
      snd('whistle');
      return;
    }
    if (c.x >= 110) {
      c.st = 'down';
      endPlay({ kind: P.catcher ? 'comp' : 'run', yds: c.x - P.los, endX: 110, carrier: c.pl, td: true, text: '' });
      return;
    }
    for (const d of P.def) {
      if (d.stun > 0 || d.eng || d.cd > 0 || d.down) continue;
      const dx = Math.abs(d.x - c.x), dy = Math.abs(d.y - c.y);
      if (dx < 1.2 && dy < 1.15) {
        d.cd = 0.5;
        let near = 0;
        for (const o of P.def) if (o !== d && Math.hypot(o.x - c.x, o.y - c.y) < 1.8) near++;
        const jk = c.jk > 0;
        let pT = 0.58 + (d.tkl - c.elu) * 0.012 + near * 0.1 + (c.diving ? 0.28 : 0) - (jk ? 0.4 : 0) - (c.slow > 0 ? 0 : 0);
        if (c.pl.id > 0 && c.pl.pos === 'QB') pT += 0.06;
        if (chance(clamp(pT, 0.12, 0.97))) { c.diving = false; tackle(d, c, 'tackle'); return; }
        d.stun = 0.6; c.slow = 0.3; c.broke = (c.broke || 0) + 1;
        fx.pops.push({ x: c.x, y: c.y - 3, t: 0.7, s: 'BROKEN', c: '#9be86b' });
        puff(c.x, c.y, 4);
      }
    }
  }

  function retCheck(dt) {
    const c = P.carrier;
    if (c.x <= 10) {
      endPlay({ kind: 'int', yds: 0, endX: P.intX, tov: 'int', td6: true, retX: 10, text: '' });
      return;
    }
    if (c.y < 0 || c.y > FW) { endPlay({ kind: 'int', yds: 0, endX: P.intX, tov: 'int', retX: c.x, text: '' }); return; }
    for (const e of P.off) {
      if (e.down || e.cd > 0 || e.stun > 0) continue;
      if (e.role.startsWith('OL')) continue;
      if (Math.hypot(e.x - c.x, (e.y - c.y)) < 1.2) {
        e.cd = 0.5;
        const pT = e.role === 'QB' ? 0.38 : 0.62 + (e.pl.ovr - 65) * 0.004;
        if (chance(pT)) { c.down = true; c.st = 'down'; puff(c.x, c.y, 8); snd('tackle'); endPlay({ kind: 'int', yds: 0, endX: P.intX, tov: 'int', retX: c.x, text: '' }); return; }
        e.stun = 0.5;
      }
    }
    if (P.t - P.retStart > 7) endPlay({ kind: 'int', yds: 0, endX: P.intX, tov: 'int', retX: c.x, text: '' });
  }

  function kickTick(dt) {
    const k = P.kk, R = P.R, K = R.K;
    P.es.forEach(e => { accelTo(e, 0, 0, dt, 6); });
    if (k.state === 'charge') {
      k.ph += dt;
      const ptr = inp.ptr, kb = inp.keys;
      if (ptr && ptr.down && ptr.dragUp > 8) {
        k.charge = clamp(ptr.dragUp / 150, 0, 1);
        k.aim = clamp(ptr.dragDX / (ptr.dragUp + 30) * 1.7, -1, 1);
      } else {
        k.charge = clamp(k.ph / 1.3, 0, 1);
        const dx = (kb.has('ArrowRight') || kb.has('KeyD') ? 1 : 0) - (kb.has('ArrowLeft') || kb.has('KeyA') ? 1 : 0);
        if (dx) k.aim = clamp(k.aim + dx * dt * 1.4, -1, 1);
      }
      if (k.ph > 0.5) { P.ball.x = R.H ? R.H.x + 0.3 : K.x + 1; P.ball.y = R.H ? R.H.y : K.y; P.ball.z = 0; }
      else { const u = k.ph / 0.5; P.ball.x = lerp(P.los - 0.6, R.H ? R.H.x : K.x, u); P.ball.y = CY; P.ball.z = Math.sin(u * Math.PI) * 0.4; }
      if (k.early && k.ph >= 0.55) { k.early = false; kickRelease(); }
      else if (k.ph > 4.2) kickRelease();
    } else if (k.state === 'fly') {
      k.fly += dt;
      const u = clamp(k.fly / k.T, 0, 1);
      P.ball.x = lerp(k.sx, k.tx, u); P.ball.y = lerp(k.sy, k.ty, u); P.ball.z = 4 * k.h * u * (1 - u);
      K.kickT += dt;
      if (u >= 1) kickFinish();
    }
    if (P.phase === 'over') P.deadT += dt;
  }
  function kickRelease() {
    const k = P.kk;
    if (!P.snapped || k.state !== 'charge') return;
    if (k.ph < 0.55) { k.early = true; return; }
    const power = k.charge, K = P.R.K;
    k.state = 'fly'; k.fly = 0; k.power = power;
    const wind = k.wind;
    snd('kick');
    K.st = 'kick'; K.kickT = 0;
    const kd = power * k.maxD;
    if (P.kind === 'punt') {
      const noise = gauss() * (1.2 + kd * 0.05) * k.accMul;
      k.dist = kd; k.lat = k.aim * 14 + noise + wind * kd / 50;
      k.sx = P.ball.x; k.sy = CY; k.tx = P.los + kd; k.ty = CY + k.lat; k.h = clamp(kd * 0.28, 6, 17); k.T = clamp(1.4 + kd / 30, 1.5, 3.4);
      k.shank = chance(clamp((1.4 - k.accMul) * 0.02 + 0.015, 0.005, 0.05));
      if (k.shank) { k.tx = P.los + kd * 0.55; k.ty = CY + sgn(gauss()) * 12; k.h = 5; k.T = 1.1; }
      k.oob = k.ty < 0 || k.ty > FW;
      if (k.oob) k.ty = clamp(k.ty, -1.5, FW + 1.5);
    } else {
      const need = k.dist, over = Math.max(0, power - need / k.maxD * 1.12);
      const noise = gauss() * (0.85 + need * 0.035) * k.accMul * (1 + over * 3.2);
      const lat = k.aim * 11 + wind * need / 40 + noise;
      k.lat = lat; k.kd = kd;
      k.good = kd >= need - 0.5 && Math.abs(lat) <= 3.08;
      k.short = kd < need - 0.5;
      const goalX = 110;
      k.sx = P.ball.x; k.sy = CY;
      if (k.short) { k.tx = k.sx + (kd / Math.max(need, 1)) * (goalX - k.sx) * 0.98; k.ty = CY + lat * (kd / need); k.h = clamp(kd * 0.2, 3, 12); k.T = clamp(0.9 + kd / 38, 1, 2.4); }
      else { k.tx = goalX + 7; k.ty = CY + lat * (k.tx - k.sx) / Math.max(1, goalX - k.sx); k.h = clamp(need * 0.3, 5, 13); k.T = clamp(1.0 + need / 28, 1.2, 2.8); }
    }
    P.phase = 'kickfly';
  }
  function kickFinish() {
    const k = P.kk;
    k.state = 'done'; k.doneT = 0;
    if (P.kind === 'punt') {
      const landX = k.tx, landYl = landX - 10;
      let touchback = landYl >= 100, oob = k.ty < 0 || k.ty > FW;
      let fin;
      if (touchback) fin = 100;
      else {
        const roll = oob ? 0 : (chance(0.45) ? ri(1, 7) : 0), ret = oob ? 0 : (chance(0.45) ? 0 : ri(2, 14));
        fin = clamp(landYl + roll - ret, 1, 99);
        if (k.shank) fin = clamp(landYl - ri(0, 3), 1, 99);
      }
      endPlay({ kind: 'punt', yds: fin - M.yl, endX: 10 + fin, punt: { gross: Math.round(k.dist), net: Math.round(fin - M.yl), tb: touchback, oob, landYl: Math.round(landYl), fin }, stopClock: false, text: '' });
      snd('whistle');
    } else {
      const good = k.good;
      if (P.kind === 'xp') endPlay({ kind: 'xp', good, stopClock: true, dist: k.dist, text: '' });
      else endPlay({ kind: 'fg', good, dist: Math.round(k.dist), stopClock: true, short: k.short, text: '' });
      snd(good ? 'good' : 'miss');
      fx.pops.push({ x: k.tx, y: CY - 5, t: 1.4, s: good ? 'IT IS GOOD!' : (k.short ? 'SHORT!' : 'NO GOOD!'), c: good ? '#5fe36b' : '#ff5a4d' });
    }
  }

  const ordinal = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
  const yardTxt = (yl, mine) => {
    if (yl === 50) return 'the 50';
    const own = yl < 50;
    return own ? (mine ? 'own ' : 'their ') + yl : (mine ? 'opp ' : 'your ') + (100 - yl);
  };
  const clockTxt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const qtrTxt = q => q <= 4 ? ['1ST', '2ND', '3RD', '4TH'][q - 1] : 'OT';

  function newMatch(opts) {
    const opp = opts.opp, me = F.teams[F.tid];
    const L = lineup(F.roster), str = strength(L, F.fac);
    const adj = DIFF_ADJ[SET.diff] || 0;
    M = {
      me, opp, home: opts.home, neutral: !!opts.neutral, playoff: !!opts.playoff, L, str, sc: [0, 0], q: 1, qlen: SET.ql, clock: SET.ql, poss: 0, yl: 25, down: 1, togo: 10, firstYl: 35,
      ot: false, recv0: chance(0.5) ? 0 : 1, over: false, wind: rnd(-3.2, 3.2), td: 0, liveInj: [], oo: opp.off + adj, ud: str.def, oppDefStr: opp.def + adj, st: [{ pass: 0, rush: 0, to: 0, plays: 0, first: 0, pen: 0 }, { pass: 0, rush: 0, to: 0, plays: 0, first: 0, pen: 0 }],
      sr: [[0, 0, 0, 0], [0, 0, 0, 0]], drives: [0, 0], resTxt: '', otP: 0, started: false
    };
    return M;
  }

  function wRank(arr, kinds) {
    const items = [], ws = [];
    kinds.forEach(([pos, n, w]) => { (M.L[pos] || []).slice(0, n).forEach(p => { items.push(p); ws.push(w * Math.pow(p.ovr / 70, 2)); }); });
    return items.length ? wsel(items, ws) : { n: 'D. Rivera', st: {}, ovr: 60, pos: 'LB' };
  }
  const pickTkl = () => wRank(0, [['LB', 2, 3], ['S', 2, 2.4], ['DL', 4, 2], ['CB', 3, 1.6]]);
  const pickSack = () => wRank(0, [['DL', 4, 3], ['LB', 2, 1.2]]);
  const pickIntr = () => wRank(0, [['CB', 3, 2], ['S', 2, 2.2], ['LB', 2, 0.6]]);

  function ensureFirst(yl) {
    M.firstYl = Math.min(100, yl + 10);
    M.togo = M.firstYl - yl;
  }
  function setPoss(team, yl) {
    M.poss = team; M.yl = clamp(Math.round(yl), 1, 99); M.down = 1; ensureFirst(M.yl);
  }
  function kickoffResult() {
    if (chance(0.62)) return { yl: 25, txt: 'touchback', tb: true };
    const r = Math.round(clamp(21 + gauss() * 6 + (chance(0.06) ? 14 : 0), 9, 62));
    return { yl: r, txt: 'returned to the ' + r, tb: false };
  }

  function addPts(team, n) { M.sc[team] += n; }

  function oppFGgood(dist) {
    return chance(clamp(0.97 - (dist - 30) * 0.0125 + (M.opp.st - 72) * 0.003, 0.15, 0.97));
  }

  function simOppPlay(dr) {
    const nm = M.opp.nm, o = M.oo, d = M.ud + (F && F.fac ? 0 : 0), diff = o - d;
    const yl = M.yl, down = M.down, togo = M.togo;
    const lead = M.sc[1] - M.sc[0];
    const late = (M.q === 4 || M.q === 2) && M.clock < Math.max(35, M.qlen * 0.22);
    const goal = 100 - yl;
    const ev = { team: 1, yl, down, togo, txt: '', yds: 0, kind: '', burn: 8, end: false, res: null };
    const st = M.st[1];
    if (down === 4) {
      const fgd = goal + 17;
      const trailLate = late && lead < 0 && M.q === 4;
      let act = 'punt';
      if (fgd <= 50 && !(trailLate && lead < -3 && togo <= 4 && goal > 20)) act = 'fg';
      else if (fgd <= 56 && lead < -3 && late) act = 'fg';
      else if (goal <= 42 && togo <= 2 && chance(0.55)) act = 'go';
      else if (trailLate && togo <= 8 && lead < 0 && goal < 70) act = 'go';
      else if (goal <= 22) act = 'fg';
      if (act === 'fg') {
        const good = oppFGgood(fgd);
        ev.kind = 'fg'; ev.burn = 4; ev.end = true;
        if (good) { addPts(1, 3); ev.txt = nm.K + ' kicks a ' + fgd + '-yard field goal. GOOD!'; ev.res = 'fg'; ev.pts = 3; if (M.ot) { M.over = true; } }
        else { ev.txt = nm.K + ' misses from ' + fgd + ' yards. No good!'; ev.res = 'miss'; setPoss(0, Math.max(20, 100 - yl + 7)); }
        dr.fgd = fgd;
        return ev;
      }
      if (act === 'punt') {
        const gross = Math.round(clamp(41 + gauss() * 5 + (M.opp.st - 72) * 0.2, 28, 66));
        let land = yl + gross, tb = false;
        if (land >= 100) { tb = true; }
        const ret = tb ? 0 : (chance(0.4) ? 0 : ri(2, 12));
        const fin = tb ? 20 : clamp(100 - land + ret, 1, 99);
        ev.kind = 'punt'; ev.burn = 5; ev.end = true; ev.res = 'punt';
        ev.txt = nm.P + ' punts ' + gross + ' yards' + (tb ? ', touchback.' : ret ? ', returned ' + ret + '.' : ', fair catch.');
        setPoss(0, fin);
        return ev;
      }
    }
    const trailing = lead < 0;
    let passP = 0.46 + (togo > 7 ? 0.2 : 0) + (down >= 3 && togo > 3 ? 0.22 : 0) - (togo <= 2 ? 0.28 : 0) + (late && trailing ? 0.28 : 0) - (late && lead > 0 && M.q === 4 ? 0.34 : 0);
    const pass = chance(clamp(passP, 0.1, 0.95));
    let yds = 0, kind = '';
    if (pass) {
      const sackP = clamp(0.062 - diff * 0.0011, 0.02, 0.13), intP = clamp(0.026 - diff * 0.0004, 0.008, 0.06), comp = clamp(0.62 + diff * 0.0035, 0.45, 0.79);
      const r = Math.random();
      const wr = pick([nm.WR[0], nm.WR[0], nm.WR[1], nm.WR[2], nm.TE, nm.RB[0]]);
      if (r < sackP) {
        const loss = ri(3, 9), who = pickSack();
        yds = -loss; kind = 'sack'; ev.burn = 7; stat(who, 'sk');
        ev.txt = 'Sacked by ' + who.n + ' for a loss of ' + loss + '.';
        if (chance(0.06)) { ev.kind = 'fumble'; ev.txt += ' FUMBLE! Recovered by your defense!'; setPoss(0, 100 - (yl - loss)); ev.end = true; ev.res = 'fum'; st.to++; return ev; }
        sackFlag(true);
      } else if (r < sackP + intP) {
        const who = pickIntr(), ret = ri(0, 22);
        stat(who, 'ic'); st.to++;
        ev.kind = 'int'; ev.burn = 5; ev.end = true; ev.res = 'int';
        const spot = Math.min(99, yl + ri(4, 28));
        if (chance(0.03) && spot > 20) { ev.txt = wr ? nm.QB + ' is intercepted by ' + who.n + '. He takes it all the way back!' : ''; addPts(0, 7); ev.res = 'pick6'; M.td++; ev.pts = 7; return ev; }
        const uy = clamp(100 - spot + ret, 1, 99);
        ev.txt = nm.QB + ' is intercepted by ' + who.n + '! Returned ' + ret + ' yards.';
        setPoss(0, uy);
        return ev;
      } else if (r < sackP + intP + (1 - sackP - intP) * comp) {
        let g = Math.abs(gauss()) * 6.4 + 1.5 + diff * 0.05 + (chance(0.08) ? rnd(12, 36) : 0);
        yds = Math.round(clamp(g, 0, 98));
        if (down === 3 && chance(0.1 + diff * 0.004)) yds = Math.max(yds, togo + ri(0, 4));
        kind = 'pass'; ev.burn = 9 + (yds > 20 ? 2 : 0);
        const who = chance(0.4) ? pickTkl() : null;
        ev.txt = nm.QB + ' pass to ' + wr + ' complete for ' + yds + ' yard' + (yds === 1 ? '' : 's') + (who ? '. Tackle by ' + who.n : '') + '.';
        if (who) stat(who, 'tk');
        st.pass += yds;
      } else {
        kind = 'inc'; ev.burn = 3; ev.txt = nm.QB + ' pass intended for ' + wr + ' is incomplete.'; ev.stop = true;
        if (chance(0.3)) { const w = pickIntr(); ev.txt = nm.QB + ' pass for ' + wr + ' broken up by ' + w.n + '.'; }
      }
      if (kind === 'sack') st.pass += yds;
    } else {
      const g = Math.round(clamp(gauss() * 3.3 + 3.9 + diff * 0.045 + (chance(0.05) ? rnd(8, 30) : 0), -3, 80));
      yds = g; kind = 'run'; ev.burn = 10;
      const rb = pick([nm.RB[0], nm.RB[0], nm.RB[1]]);
      const dir = pick(['up the middle', 'to the left', 'to the right', 'off tackle']);
      const who = pickTkl(); stat(who, 'tk');
      if (chance(0.007)) {
        ev.kind = 'fumble'; ev.txt = rb + ' runs ' + dir + ' and FUMBLES! Your defense recovers.'; setPoss(0, 100 - (yl + Math.max(0, yds))); ev.end = true; ev.res = 'fum'; M.st[1].to++;
        return ev;
      }
      ev.txt = rb + ' runs ' + dir + ' for ' + yds + ' yard' + (Math.abs(yds) === 1 ? '' : 's') + '. Tackle by ' + who.n + '.';
      st.rush += yds;
    }
    ev.kind = kind; ev.yds = yds;
    const ny = yl + yds;
    st.plays++;
    if (ny >= 100) {
      ev.kind = 'td'; ev.end = true; ev.res = 'td'; ev.txt = ev.txt.replace(/\.$/, '') + '. TOUCHDOWN!';
      let pts = 6;
      if (!M.ot) {
        const two = lead < 0 && chance(0.0) ;
        pts += chance(0.95) ? 1 : 0;
      }
      addPts(1, pts); ev.pts = pts;
      if (M.ot) M.over = true;
      return ev;
    }
    if (ny <= 0 && yds < 0) {
      ev.kind = 'safety'; ev.end = true; ev.res = 'safety'; ev.txt += ' SAFETY!'; addPts(0, 2); ev.pts = 2; M.safetyBy = 0;
      return ev;
    }
    if (ny >= M.firstYl) { M.down = 1; M.yl = ny; ensureFirst(ny); ev.first = true; st.first++; ev.txt += ' First down.'; }
    else {
      M.yl = Math.max(1, ny); M.down++; M.togo = M.firstYl - M.yl;
      if (M.down > 4) { ev.end = true; ev.res = 'downs'; ev.txt += ' Turnover on downs!'; ev.kind = 'downs'; setPoss(0, 100 - M.yl); return ev; }
    }
    return ev;
  }
  const sackFlag = () => {};

  function burnClock(sec) {
    M.clock = Math.max(0, M.clock - sec);
  }

  function simOppDrive() {
    const dr = { lines: [], res: null, plays: 0, start: M.yl, startClock: M.clock, yds: 0, pts: 0, startQ: M.q };
    let guard = 0;
    while (guard++ < 40) {
      if (M.clock <= 0) { dr.res = dr.res || 'clock'; break; }
      const y0 = M.yl, d0 = M.down, t0 = M.togo;
      const ev = simOppPlay(dr);
      dr.plays++;
      burnClock(ev.burn * (0.9 + Math.random() * 0.2));
      dr.lines.push({ txt: ev.txt, yl: y0, down: d0, togo: t0, kind: ev.kind, first: ev.first, yds: ev.yds, td: ev.res === 'td' || ev.res === 'pick6', fg: ev.res === 'fg', bad: ['int', 'fum', 'downs', 'miss'].includes(ev.res), pts: ev.pts || 0, endYl: ev.end ? null : M.yl });
      if (ev.end) { dr.res = ev.res; dr.pts = ev.pts || 0; break; }
    }
    dr.yds = Math.max(0, (M.poss === 1 ? M.yl : (dr.lines.length ? dr.lines[dr.lines.length - 1].yl : dr.start)) - dr.start);
    dr.secs = Math.round(dr.startClock - M.clock);
    M.drives[1]++;
    return dr;
  }

  function applyDownState(newYl, res) {
    if (newYl >= 100) return 'td';
    if (newYl >= M.firstYl) { M.down = 1; M.yl = newYl; ensureFirst(newYl); return 'first'; }
    M.yl = Math.max(0, newYl); M.down++; M.togo = M.firstYl - M.yl;
    if (M.down > 4) return 'downs';
    return 'next';
  }

  function applyUserPlay(res) {
    const st = M.st[0];
    const ev = { head: '', sub: '', col: '#fff', snd: null, next: 'play', pts: 0, end: false };
    const kind = res.kind;
    const gainYl = res.endX == null ? M.yl : Math.round(res.endX - 10);
    const pl = res.carrier;
    st.plays++;
    const qb = P && P.qb && P.qb.pl;
    const rcv = P && P.catcher && P.catcher.pl;
    if (kind === 'inc') {
      M.down++; M.togo = M.firstYl - M.yl;
      ev.head = 'INCOMPLETE'; ev.sub = res.text; ev.col = '#ffcf6b';
      if (M.down > 4) { ev.head = 'TURNOVER ON DOWNS'; ev.col = '#ff5a4d'; setPoss(1, 100 - M.yl); ev.next = 'drive'; st.to++; }
      return ev;
    }
    if (kind === 'run' || kind === 'comp' || kind === 'sack') {
      if (res.safety || gainYl <= 0) {
        if (gainYl <= 0) { addPts(1, 2); ev.pts = 2; ev.head = 'SAFETY'; ev.sub = 'Tackled in your own end zone. 2 points for ' + M.opp.name + '.'; ev.col = '#ff5a4d'; ev.next = 'safety'; ev.end = true; return ev; }
      }
      const yds = Math.round(gainYl - M.yl);
      if (kind === 'comp') { st.pass += yds; if (qb) stat(qb, 'py', yds); if (rcv) { stat(rcv, 'rc'); stat(rcv, 'ryd', yds); } }
      else if (kind === 'run' && pl) { st.rush += yds; stat(pl, 'ra'); stat(pl, 'ry', yds); }
      else if (kind === 'sack') { st.pass += yds; }
      if (res.td) {
        addPts(0, 6); M.td++; ev.pts = 6; ev.head = 'TOUCHDOWN!'; ev.sub = kind === 'comp' && rcv ? rcv.n + ' hauls it in. ' + yds + ' yards.' : (pl ? pl.n : 'You') + ' runs it in.'; ev.col = '#ffe14d'; ev.next = 'pat'; ev.td = true;
        if (kind === 'comp') { if (qb) stat(qb, 'pt'); if (rcv) stat(rcv, 'rct'); } else if (pl) stat(pl, 'rt');
        if (M.ot) { ev.next = 'otwin'; }
        return ev;
      }
      const r = applyDownState(gainYl, res);
      const gl = (kind === 'sack' ? 'SACK' : kind === 'comp' ? 'COMPLETE' : 'RUN');
      ev.head = (yds >= 0 ? '+' : '') + yds + ' YARDS';
      ev.sub = kind === 'sack' ? 'Sacked' + (P.sackBy && P.sackBy.pl ? '' : '') : kind === 'comp' ? (rcv ? 'Complete to ' + rcv.n : 'Complete') : (pl ? pl.n + ' carries' : 'Run');
      if (kind === 'sack') { ev.head = 'SACK ' + yds; ev.col = '#ff5a4d'; }
      else if (yds >= 15) ev.col = '#5fe36b';
      else ev.col = '#ffffff';
      if (res.oob) ev.sub += ', out of bounds';
      if (r === 'first') { ev.head = 'FIRST DOWN'; ev.sub = (yds >= 0 ? '+' : '') + yds + ' yards. ' + ev.sub; ev.col = '#ffe14d'; ev.snd = 'first'; st.first++; }
      if (r === 'downs') { ev.head = 'TURNOVER ON DOWNS'; ev.col = '#ff5a4d'; setPoss(1, 100 - M.yl); ev.next = 'drive'; st.to++; }
      if (res.fumbled && !res.fumLost) ev.sub += ' (fumble recovered)';
      return ev;
    }
    if (kind === 'int') {
      st.to++;
      if (res.td6) { addPts(1, 7); ev.pts = 7; ev.head = 'PICK SIX'; ev.sub = 'Interception returned for a touchdown. 7 for ' + M.opp.name; ev.col = '#ff5a4d'; ev.next = 'drive_k'; ev.tdo = true; return ev; }
      const spotYl = Math.min(99, Math.round((res.endX || P.intX) - 10));
      const retX = res.retX == null ? res.endX : res.retX;
      const ret = Math.round((res.endX || retX) - retX);
      let oppYl = 100 - spotYl + Math.max(0, ret);
      if (spotYl >= 100 || (res.endX || 0) >= 110) oppYl = 20;
      setPoss(1, clamp(oppYl, 1, 99));
      ev.head = 'INTERCEPTED'; ev.sub = 'Returned ' + Math.max(0, ret) + ' yards'; ev.col = '#ff5a4d'; ev.next = 'drive';
      return ev;
    }
    if (kind === 'fumble') {
      st.to++;
      const spotYl = clamp(Math.round((res.endX || P.los) - 10), 1, 99);
      setPoss(1, 100 - spotYl);
      ev.head = 'FUMBLE LOST'; ev.sub = 'Recovered by ' + M.opp.name; ev.col = '#ff5a4d'; ev.next = 'drive';
      return ev;
    }
    if (kind === 'fg') {
      if (res.good) { addPts(0, 3); ev.pts = 3; ev.head = 'FIELD GOAL GOOD'; ev.sub = res.dist + ' yards'; ev.col = '#5fe36b'; ev.next = 'kickoff'; if (M.ot) ev.next = 'otwin'; stat(M.L.K[0] || { st: {} }, 'fg'); }
      else { setPoss(1, Math.max(20, 100 - (M.yl - 7))); ev.head = 'FIELD GOAL MISSED'; ev.sub = res.dist + ' yards'; ev.col = '#ff5a4d'; ev.next = 'drive'; }
      return ev;
    }
    if (kind === 'xp') {
      if (res.good) { addPts(0, 1); ev.head = 'EXTRA POINT GOOD'; ev.col = '#5fe36b'; ev.pts = 1; } else { ev.head = 'EXTRA POINT MISSED'; ev.col = '#ff5a4d'; }
      ev.next = 'kickoff';
      return ev;
    }
    if (kind === 'two') {
      if (res.td) { addPts(0, 2); ev.head = 'TWO-POINT GOOD'; ev.col = '#5fe36b'; ev.pts = 2; } else { ev.head = 'TWO-POINT FAILED'; ev.col = '#ff5a4d'; }
      ev.next = 'kickoff';
      return ev;
    }
    if (kind === 'punt') {
      const p = res.punt;
      const oppYl = p.tb ? 20 : clamp(100 - p.fin, 1, 99);
      setPoss(1, p.tb ? 20 : clamp(100 - p.fin, 1, 99));
      ev.head = 'PUNT ' + p.gross + ' YARDS'; ev.sub = p.tb ? 'Touchback' : p.oob ? 'Out of bounds' : 'Opponent takes over'; ev.col = '#ffffff'; ev.next = 'drive';
      return ev;
    }
    return ev;
  }

  function wrapQuarter() {
    const r = { type: 'none' };
    if (M.clock > 0) return r;
    if (M.q === 1 || M.q === 3) { M.q++; M.clock = M.qlen; r.type = 'qtr'; return r; }
    if (M.q === 2) { M.q = 3; M.clock = M.qlen; r.type = 'half'; return r; }
    if (M.q === 4) {
      if (M.sc[0] !== M.sc[1]) { M.over = true; r.type = 'end'; return r; }
      M.q = 5; M.ot = true; M.clock = Math.min(M.qlen, 120); r.type = 'ot'; M.otP = 0; return r;
    }
    if (M.sc[0] !== M.sc[1] || !M.playoff) { M.over = true; r.type = 'end'; return r; }
    M.q++; M.clock = Math.min(M.qlen, 120); r.type = 'ot2';
    return r;
  }

  let G = null, scene = 'title', clockT = 0, camX = 0, camInit = false;
  const bufC = document.createElement('canvas');
  bufC.width = BW; bufC.height = BH;
  const b = bufC.getContext('2d');
  b.imageSmoothingEnabled = false;
  const sxOf = x => x * SX - camX, syOf = y => FY0 + y * SY;
  const GRASS = ['#2f8f3a', '#2a8434'];
  const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#6b4423', '#f5d0a9'];
  const CROWD = ['#e8554e', '#f2c14e', '#4ea8e8', '#f2f2f2', '#6fd66f', '#c874e0', '#ff9a3c', '#2f3b73', '#5c6bb0'];
  const UI = { navy: '#0d1530', navy2: '#1a2550', line: '#3a4a8a', gold: '#ffe14d', red: '#ff5a4d', green: '#5fe36b', white: '#ffffff', dim: '#9fb0e8' };
  let stands = null, titleBg = null;

  function rngMk(seed) { let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }

  function buildStands() {
    const c = document.createElement('canvas');
    c.width = 960; c.height = FY0;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, FY0);
    gr.addColorStop(0, '#070d26'); gr.addColorStop(1, '#18224b');
    g.fillStyle = gr; g.fillRect(0, 0, 960, FY0);
    const rn = rngMk(777);
    for (let x = 30; x < 960; x += 120) {
      g.fillStyle = '#2b3566'; g.fillRect(x, 0, 3, 14);
      g.fillStyle = '#fff6c9'; g.fillRect(x - 6, 0, 15, 3);
      g.fillStyle = 'rgba(255,246,201,.22)'; g.fillRect(x - 9, 3, 21, 3);
    }
    for (let y = 9; y < 44; y += 3) {
      g.fillStyle = (y / 3) % 2 ? '#1f2a58' : '#18214a'; g.fillRect(0, y, 960, 3);
      for (let x = 0; x < 960; x += 3) if (rn() < 0.82) { g.fillStyle = CROWD[Math.floor(rn() * CROWD.length)]; g.fillRect(x, y, 2, 2); }
    }
    const ads = [['RETRO', '#c2410c'], ['BOWL', '#1d4ed8'], ['PIXEL', '#15803d'], ['GRIDIRON', '#7e22ce'], ['TOUCH', '#b91c1c'], ['PLAYBOOK', '#0e7490']];
    for (let i = 0; i < 16; i++) {
      const a = ads[i % ads.length], x = i * 60;
      g.fillStyle = a[1]; g.fillRect(x, 44, 59, 10);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 52, 59, 2);
      txt(g, a[0], x + 30, 46, '#ffffff', 1, 'c');
    }
    g.fillStyle = '#0a0f26'; g.fillRect(0, 43, 960, 1);
    stands = c;
  }

  function teamStyle(t, other) {
    let j = t.c1;
    if (other && cdist(j, other.c1) < 110) j = t.c2;
    const p = lum(t.c2) > 110 && cdist(j, t.c2) > 60 ? t.c2 : '#e0e0e0';
    const h = cdist(j, t.c2) > 120 ? t.c2 : shade(j, 0.3);
    return { j, p, h, n: lum(j) > 150 ? '#1a1a2a' : '#ffffff', c2: t.c2 };
  }

  function drawField() {
    const o = -((camX * 0.5) % 960);
    b.drawImage(stands, Math.round(o), 0);
    b.drawImage(stands, Math.round(o + 960), 0);
    const L = G ? G.tl : { c1: '#334', c2: '#fff', ab: 'YOU' }, Rr = G ? G.tr : { c1: '#433', c2: '#fff', ab: 'OPP' };
    const i0 = Math.max(0, Math.floor(camX / SX / 5)), i1 = Math.min(23, Math.ceil((camX + BW) / SX / 5));
    for (let i = i0; i <= i1; i++) {
      const xs = i * 5, sx = Math.round(xs * SX - camX);
      b.fillStyle = xs < 10 ? shade(L.c1, -0.12) : xs >= 110 ? shade(Rr.c1, -0.12) : GRASS[i & 1];
      b.fillRect(sx, FY0, 36, 187);
    }
    b.fillStyle = 'rgba(255,255,255,.72)';
    for (let k = 10; k <= 110; k += 5) {
      const sx = Math.round(k * SX - camX);
      if (sx < -2 || sx > BW + 1) continue;
      b.fillRect(sx, FY0, k === 10 || k === 110 ? 2 : 1, 187);
    }
    b.fillStyle = 'rgba(255,255,255,.5)';
    for (let k = 11; k < 110; k++) {
      if (k % 5 === 0) continue;
      const sx = Math.round(k * SX - camX);
      if (sx < 0 || sx > BW) continue;
      b.fillRect(sx, FY0, 1, 3); b.fillRect(sx, 237, 1, 3);
      b.fillRect(sx, FY0 + 22.5 * SY, 1, 2); b.fillRect(sx, FY0 + 30.3 * SY, 1, 2);
    }
    for (let k = 20; k <= 100; k += 10) {
      const sx = Math.round(k * SX - camX), n = Math.min(k - 10, 110 - k) + '';
      if (sx < -20 || sx > BW + 20) continue;
      txt(b, n, sx, FY0 + 4.5 * SY - 4, 'rgba(255,255,255,.62)', 2, 'c');
      txt(b, n, sx, FY0 + 47 * SY - 4, 'rgba(255,255,255,.62)', 2, 'c');
    }
    const mx = Math.round(60 * SX - camX);
    if (mx > -40 && mx < BW + 40) {
      b.fillStyle = 'rgba(0,0,0,.18)'; b.beginPath(); b.ellipse(mx, FY0 + CY * SY, 22, 17, 0, 0, 6.3); b.fill();
      b.fillStyle = 'rgba(255,255,255,.2)'; b.beginPath(); b.ellipse(mx, FY0 + CY * SY, 18, 13, 0, 0, 6.3); b.fill();
      txt(b, 'RB', mx, FY0 + CY * SY - 6, 'rgba(255,255,255,.7)', 2, 'c');
    }
    const ezTxt = (t, xc) => {
      const sx = Math.round(xc * SX - camX);
      if (sx < -40 || sx > BW + 40) return;
      txt(b, t.ab, sx, FY0 + CY * SY - 10, t.c2, 3, 'c', 'rgba(0,0,0,.3)');
      if (txtW(t.name.toUpperCase()) < 66) txt(b, t.name, sx, FY0 + CY * SY + 14, t.c2, 1, 'c');
    };
    ezTxt(L, 5); ezTxt(Rr, 115);
    b.fillStyle = '#e6e6e6'; b.fillRect(0, FY0 - 1, BW, 2); b.fillRect(0, 240, BW, 2);
    b.fillStyle = '#232c42'; b.fillRect(0, 242, BW, 28);
    b.fillStyle = '#2d3752'; b.fillRect(0, 242, BW, 4);
    for (let k = 0; k < 24; k++) {
      const sx = Math.round(k * 42 - ((camX * 1.0) % 42)) - 20;
      b.fillStyle = k % 3 ? L.c1 : '#3a4a6a'; b.fillRect(sx, 250, 6, 8); b.fillStyle = '#c8b090'; b.fillRect(sx + 1, 247, 4, 3);
    }
    b.fillStyle = '#ff7a2c';
    for (const yy of [0, FW]) for (const xx of [10, 110]) {
      const sx = Math.round(xx * SX - camX);
      if (sx > -4 && sx < BW + 4) b.fillRect(sx - 1, FY0 + yy * SY - (yy ? 0 : 1) - 3, 3, 4);
    }
  }

  function vline(x, col, w = 2, a = 1) {
    const sx = Math.round(sxOf(x));
    if (sx < -3 || sx > BW + 3) return;
    b.globalAlpha = a; b.fillStyle = col; b.fillRect(sx, FY0, w, 187); b.globalAlpha = 1;
  }

  function manDraw(e, T, mark) {
    const sx = Math.round(sxOf(e.x)), sy = Math.round(syOf(e.y)) + 4;
    if (sx < -16 || sx > BW + 16) return;
    const f = e.face || 1, pl = e.pl, sp = Math.hypot(e.vx, e.vy);
    const skin = SKINS[Math.abs(pl.id * 7 + (pl.id >> 2)) % SKINS.length];
    const R = (dx, dy, w, h, c) => { b.fillStyle = c; b.fillRect(Math.round(sx + (f > 0 ? dx : -dx - w)), sy + dy, w, h); };
    b.fillStyle = 'rgba(0,0,0,.28)'; b.beginPath(); b.ellipse(sx, sy + 1, e.down || e.diving ? 8 : 5, 2, 0, 0, 6.3); b.fill();
    if (e.down) {
      R(-8, -4, 6, 4, T.p); R(-3, -6, 7, 6, T.j); R(-2, -7, 5, 1, shade(T.j, 0.2)); R(4, -6, 5, 5, T.h); R(8, -4, 1, 2, '#ddd'); R(-4, -3, 2, 2, skin);
      return;
    }
    if (e.diving) {
      R(-9, -6, 6, 3, T.p); R(-4, -9, 8, 6, T.j); R(4, -9, 5, 5, T.h); R(8, -7, 1, 2, '#ddd'); R(6, -5, 6, 2, skin);
      if (P && P.carrier === e) R(9, -5, 4, 2, '#8b4513');
      return;
    }
    const s = Math.sin(e.anim), moving = sp > 0.7;
    const o1 = moving ? Math.round(s * 2.4) : 0, o2 = -o1;
    const crouch = e.eng || e.st === 'block' || (e.role && e.role.startsWith('OL') && P && P.phase !== 'over') ? 2 : 0;
    const lean = moving && sp > 5 ? 1 : 0;
    R(-3 + o1, -6, 2, 6 - (moving ? Math.abs(o1) > 1 ? 1 : 0 : 0), T.p); R(1 + o2, -6, 2, 6 - (moving ? Math.abs(o2) > 1 ? 1 : 0 : 0), T.p);
    R(-3 + o1, -1, 3, 1, '#222'); R(1 + o2, -1, 3, 1, '#222');
    R(-3 + lean, -12 + crouch, 6, 6 - crouch, T.j);
    R(-4 + lean, -13 + crouch, 8, 2, shade(T.j, 0.18));
    R(-1 + lean, -10 + crouch, 2, 2, T.n);
    R(-2 + lean * 2, -17 + crouch, 5, 4, T.h);
    R(-2 + lean * 2, -17 + crouch, 5, 1, shade(T.h, 0.3));
    R(3 + lean * 2, -15 + crouch, 1, 2, '#e4e4e4');
    R(1 + lean * 2, -14 + crouch, 2, 1, skin);
    const carry = P && P.carrier === e;
    const isQB = P && P.qb === e;
    if (isQB && (P.phase === 'hold' || P.phase === 'snap')) {
      R(2, -15, 2, 4, skin); R(2, -17, 4, 2, '#8b4513');
    } else if (e.st === 'throw') {
      R(2, -16, 5, 2, skin); R(-4, -10, 2, 3, skin);
    } else if (carry) {
      R(1, -11, 3, 2, skin); R(1, -10, 4, 2, '#8b4513'); R(-5, -11 + Math.round(s), 2, 3, skin);
    } else if (e.eng || crouch) {
      R(2, -10, 4, 2, skin); R(-5, -10, 2, 2, skin);
    } else {
      const sw = moving ? Math.round(s * 2) : 0;
      R(2 + sw, -11, 2, 4, skin); R(-5 - sw, -11, 2, 4, skin);
    }
    if (e.stun > 0 && e.side === 'd') { b.fillStyle = '#ffe14d'; b.fillRect(sx - 2, sy - 22, 1, 1); b.fillRect(sx + 2, sy - 21, 1, 1); b.fillRect(sx, sy - 23, 1, 1); }
    if (e.st === 'kick' && e.kickT != null && e.kickT < 0.3) { R(2, -6, 6, 2, T.p); R(7, -7, 2, 3, '#222'); }
    if (mark) {
      const bob = Math.round(Math.sin(clockT * 8) * 1.5);
      b.fillStyle = UI.gold; b.fillRect(sx - 2, sy - 25 + bob, 5, 1); b.fillRect(sx - 1, sy - 24 + bob, 3, 1); b.fillRect(sx, sy - 23 + bob, 1, 1);
    }
  }

  function drawBall() {
    if (!P || !P.ball || !P.ball.vis) return;
    const bl = P.ball, ph = P.phase;
    if (ph === 'run' || ph === 'ret' || ph === 'hold' || ph === 'handoff') return;
    const sx = Math.round(sxOf(bl.x)), sy = Math.round(syOf(bl.y));
    const z = (bl.z || 0) * 4.5;
    b.fillStyle = 'rgba(0,0,0,.3)'; b.beginPath(); b.ellipse(sx, sy + 4, 3, 1.5, 0, 0, 6.3); b.fill();
    let ang = 0;
    if (P.phase === 'air' && P.air) { const a = P.air; ang = Math.atan2((a.ty - a.sy) * SY * 0.4 - Math.cos(Math.PI * a.u) * 6, (a.tx - a.sx) * SX); }
    else if (P.phase === 'kickfly' && P.kk) { const k = P.kk; ang = Math.atan2(-Math.cos(Math.PI * clamp(k.fly / k.T, 0, 1)) * 8, (k.tx - k.sx) * SX); }
    else ang = clockT * 9;
    b.save(); b.translate(sx, sy + 3 - z); b.rotate(ang);
    b.fillStyle = '#7a3b12'; b.beginPath(); b.ellipse(0, 0, 3.4, 2, 0, 0, 6.3); b.fill();
    b.fillStyle = '#a85a22'; b.fillRect(-2, -1, 3, 1);
    b.fillStyle = '#fff'; b.fillRect(-1, 0, 2, 1);
    b.restore();
  }

  function drawRoutes() {
    if (!P || P.type !== 'pass' && P.type !== 'two' || P.phase !== 'pre' || G.s !== 'pre') return;
    b.fillStyle = 'rgba(255,255,255,.75)';
    P.recv.forEach(e => {
      if (!e.rt) return;
      let px = e.x, py = e.y;
      for (const [tx, ty] of e.rt) {
        const d = Math.hypot((tx - px) * SX, (ty - py) * SY), n = Math.floor(d / 4);
        for (let i = 1; i <= n; i++) b.fillRect(Math.round(sxOf(px + (tx - px) * i / n)), Math.round(syOf(py + (ty - py) * i / n)), 2, 2);
        px = tx; py = ty;
      }
      const sx = Math.round(sxOf(px)), sy = Math.round(syOf(py));
      b.fillStyle = UI.gold; b.fillRect(sx - 2, sy - 2, 5, 5); b.fillStyle = 'rgba(255,255,255,.75)';
    });
  }
  function drawRunPreview() {
    if (!P || P.phase !== 'pre' || P.type !== 'run') return;
    const hx = P.call.hole ? P.los + 1.5 : P.los + 1.2, hy = P.call.hole ? CY + 8.5 : CY;
    const rb = P.R.RB;
    b.fillStyle = 'rgba(255,255,255,.8)';
    const x0 = rb.x, y0 = rb.y;
    const n = 9;
    for (let i = 1; i <= n; i++) b.fillRect(Math.round(sxOf(x0 + (hx - x0) * i / n)), Math.round(syOf(y0 + (hy - y0) * i / n)), 2, 2);
    const sx = Math.round(sxOf(hx)), sy = Math.round(syOf(hy));
    b.fillStyle = UI.gold; b.fillRect(sx - 2, sy - 2, 5, 5);
    for (let i = 1; i <= 10; i++) b.fillRect(sx + i * 2, sy - 1, 1, 3);
  }

  function drawHoldUI() {
    if (!P || P.phase !== 'hold' || P.type !== 'pass' && P.type !== 'two') return;
    const q = P.qb;
    P.recv.forEach((e, i) => {
      const sx = Math.round(sxOf(e.x)), sy = Math.round(syOf(e.y)) + 4;
      if (sx < -10 || sx > BW + 10) return;
      const k = openness(e), col = k > 4.8 ? UI.green : k > 2.8 ? '#ffd24d' : UI.red;
      b.fillStyle = 'rgba(0,0,0,.55)'; b.fillRect(sx - 4, sy - 33, 9, 9);
      b.fillStyle = col; b.fillRect(sx - 3, sy - 32, 7, 7);
      txt(b, String(i + 1), sx, sy - 31, '#10162e', 1, 'c');
      b.fillStyle = col; b.fillRect(sx - 1, sy - 24, 3, 1);
    });
    const sx = Math.round(sxOf(q.x)), sy = Math.round(syOf(q.y)) + 4;
    b.fillStyle = 'rgba(0,0,0,.6)'; b.fillRect(sx - 11, sy - 31, 22, 4);
    const pr = clamp(P.maxP, 0, 1);
    b.fillStyle = pr > 0.7 ? UI.red : pr > 0.4 ? '#ffd24d' : UI.green; b.fillRect(sx - 10, sy - 30, Math.round(20 * pr), 2);
    const p = inp.ptr;
    if (p && p.down && p.dragging && !p.scr) {
      const aim = aimAssist(p.wx, p.wy);
      const ax = aim.x, ay = aim.y;
      const d = Math.hypot(ax - q.x, ay - q.y), h = clamp(d * 0.2, 1.4, 8.5);
      for (let i = 1; i <= 18; i++) {
        const u = i / 18, wx = lerp(q.x, ax, u), wy = lerp(q.y, ay, u), z = 4 * h * u * (1 - u);
        b.fillStyle = aim.tgt ? 'rgba(255,225,77,.95)' : 'rgba(255,255,255,.8)';
        b.fillRect(Math.round(sxOf(wx)), Math.round(syOf(wy) - z * 4.5) + 2, 2, 2);
      }
      const tx = Math.round(sxOf(ax)), ty = Math.round(syOf(ay));
      b.strokeStyle = aim.tgt ? UI.gold : '#fff'; b.lineWidth = 1;
      b.strokeRect(tx - 6, ty - 3, 12, 7);
      b.beginPath(); b.moveTo(tx - 9, ty); b.lineTo(tx - 6, ty); b.moveTo(tx + 6, ty); b.lineTo(tx + 9, ty); b.moveTo(tx, ty - 6); b.lineTo(tx, ty - 3); b.moveTo(tx, ty + 3); b.lineTo(tx, ty + 6); b.stroke();
    }
  }

  function drawKickUI() {
    if (!P || !P.kk) return;
    const k = P.kk, K = P.R.K, bl = P.ball;
    const postX = 118.6;
    const px = Math.round(sxOf(postX));
    if (P.kind !== 'punt' && px > -10 && px < BW + 20) {
      const y1 = Math.round(syOf(CY - 3.08)), y2 = Math.round(syOf(CY + 3.08));
      b.fillStyle = '#f2c230'; b.fillRect(px - 1, FY0 + CY * SY - 2, 3, 12);
      b.fillRect(px - 1, y1 - 24, 2, 26); b.fillRect(px - 1, y2 - 24, 2, 26);
      b.fillRect(px - 1, y1 - 2, 2, y2 - y1 + 2);
      b.fillRect(px - 1, y1 - 24, 4, 1); b.fillRect(px - 1, y2 - 24, 4, 1);
    }
    if (k.state === 'charge' || k.state === 'wait') {
      const sx = Math.round(sxOf(K.x)), sy = Math.round(syOf(K.y));
      const mx = sx - 22, my = sy - 36, mh = 44;
      b.fillStyle = 'rgba(0,0,0,.65)'; b.fillRect(mx - 2, my - 2, 10, mh + 4);
      b.fillStyle = '#222b52'; b.fillRect(mx, my, 6, mh);
      const need = P.kind === 'punt' ? 1 : clamp(k.dist / k.maxD, 0, 1.05);
      const ok = Math.abs(k.charge - need) < 0.05 || k.charge >= need && k.charge < need + 0.1;
      b.fillStyle = k.charge >= need - 0.0 ? (k.charge < need + 0.12 ? UI.green : '#ffd24d') : '#ff9a3c';
      if (P.kind === 'punt') b.fillStyle = k.charge > 0.92 ? UI.green : '#ffd24d';
      b.fillRect(mx, my + mh - Math.round(mh * k.charge), 6, Math.round(mh * k.charge));
      b.fillStyle = '#fff'; b.fillRect(mx - 2, my + mh - Math.round(mh * Math.min(1, need)) - 1, 10, 2);
      txt(b, Math.round(k.charge * k.maxD) + ' YD', mx + 3, my + mh + 4, ok ? UI.green : '#fff', 1, 'c');
      if (P.kind !== 'punt') txt(b, 'NEED ' + Math.round(k.dist), mx + 3, my - 11, UI.gold, 1, 'c');
      const t0x = bl.x, t0y = CY;
      const tx = P.kind === 'punt' ? t0x + 30 : postX, lat = k.aim * (P.kind === 'punt' ? 14 : 11) * (P.kind === 'punt' ? 30 / 44 : 1) + k.wind * (P.kind === 'punt' ? 0.4 : (postX - t0x) / 40);
      const ty = CY + lat;
      for (let i = 1; i <= 26; i++) {
        const u = i / 26;
        b.fillStyle = 'rgba(255,255,255,.7)';
        b.fillRect(Math.round(sxOf(lerp(t0x, tx, u))), Math.round(syOf(lerp(t0y, ty, u))) + 3, 2, 2);
      }
      const wx = 240, wy = 26;
      b.fillStyle = 'rgba(0,0,0,.55)'; b.fillRect(wx - 34, wy - 3, 68, 12);
      txt(b, 'WIND', wx - 30, wy, UI.dim, 1);
      const wv = k.wind;
      txt(b, Math.abs(wv).toFixed(1), wx + 10, wy, '#fff', 1);
      b.fillStyle = Math.abs(wv) < 0.6 ? '#7a86b8' : UI.gold;
      if (Math.abs(wv) >= 0.6) { const d = wv > 0 ? 1 : -1, cx = wx + 28; b.fillRect(cx, wy + 1, 1, 5); for (let i = 0; i < 3; i++) b.fillRect(cx - i, wy + (d > 0 ? 6 - i : 1 + i), 1 + i * 2, 1); }
    }
  }

  function drawPops() {
    for (const p of fx.pops) {
      const a = clamp(p.t / 0.5, 0, 1), sx = Math.round(sxOf(p.x)), sy = Math.round(syOf(p.y) - (p.t0 - p.t) * 14);
      b.globalAlpha = a;
      txt(b, p.s, sx, sy, p.c, 1, 'c', '#000');
      b.globalAlpha = 1;
    }
    for (const q of fx.parts) {
      const a = clamp(q.t / 0.4, 0, 1);
      b.globalAlpha = a; b.fillStyle = q.c;
      if (q.conf) b.fillRect(Math.round(q.x * BW), Math.round(q.y * BH), 2, 3);
      else b.fillRect(Math.round(sxOf(q.wx) + (q.ox || 0)), Math.round(syOf(q.wy) - 6 + (q.oy || 0)), 2, 2);
      b.globalAlpha = 1;
    }
  }

  function stepFx(dt) {
    for (const p of fx.pops) { if (p.t0 == null) p.t0 = p.t; p.t -= dt; }
    fx.pops = fx.pops.filter(p => p.t > 0);
    for (const q of fx.parts) {
      q.t -= dt;
      if (q.conf) { q.x += q.vx * dt / BW; q.y += q.vy * dt / BH; q.vy += 70 * dt; }
      else { q.ox = (q.ox || 0) + q.vx * dt; q.oy = (q.oy || 0) + q.vy * dt; q.vy += (q.g || 20) * dt; }
    }
    fx.parts = fx.parts.filter(q => q.t > 0);
    fx.shake = Math.max(0, fx.shake - dt * 1.2);
    fx.flash = Math.max(0, fx.flash - dt * 1.4);
  }

  const ydTxt = yl => yl === 50 ? '50' : yl < 50 ? 'OWN ' + yl : 'OPP ' + (100 - yl);
  const dnTxt = () => (M.down === 1 ? '1ST' : M.down === 2 ? '2ND' : M.down === 3 ? '3RD' : '4TH') + ' & ' + (M.firstYl >= 100 ? 'GOAL' : Math.max(1, M.togo));

  function drawHUD() {
    b.fillStyle = 'rgba(8,13,34,.9)'; b.fillRect(0, 0, BW, 21);
    b.fillStyle = UI.line; b.fillRect(0, 21, BW, 1);
    const me = G.tl, op = G.tr;
    b.fillStyle = me.c1; b.fillRect(5, 5, 9, 11); b.fillStyle = me.c2; b.fillRect(5, 5, 9, 2);
    txt(b, me.ab, 18, 7, '#fff', 1);
    txt(b, M.sc[0], 44, 4, UI.gold, 2);
    b.fillStyle = op.c1; b.fillRect(BW - 14, 5, 9, 11); b.fillStyle = op.c2; b.fillRect(BW - 14, 5, 9, 2);
    txt(b, op.ab, BW - 18, 7, '#fff', 1, 'r');
    txt(b, M.sc[1], BW - 44, 4, UI.gold, 2, 'r');
    const hasMe = M.poss === 0;
    b.fillStyle = '#c47a3a'; b.fillRect(hasMe ? 72 : BW - 76, 8, 5, 3);
    txt(b, (M.ot ? 'OT' : 'Q' + M.q) + '  ' + clockTxt(M.clock), 240, 3, '#fff', 1, 'c');
    const st = G.s === 'drive' || G.s === 'final' ? '' : dnTxt() + ' ON ' + ydTxt(M.yl);
    txt(b, st, 240, 12, UI.gold, 1, 'c');
  }

  function drawBanner() {
    const bn = G.banner;
    if (!bn || bn.t <= 0) return;
    const a = clamp(Math.min(bn.t, bn.dur - bn.t) / 0.18, 0, 1);
    const y = 92, h = bn.sub ? 52 : 40;
    b.globalAlpha = a * 0.82; b.fillStyle = '#060a1e'; b.fillRect(0, y, BW, h);
    b.globalAlpha = a; b.fillStyle = bn.col; b.fillRect(0, y, BW, 2); b.fillRect(0, y + h - 2, BW, 2);
    const sc = txtW(bn.text, 4) < 440 ? 4 : 3;
    txt(b, bn.text, 240, y + 7, bn.col, sc, 'c', '#000');
    if (bn.sub) txt(b, bn.sub, 240, y + 7 + sc * 7 + 5, '#ffffff', 1, 'c');
    b.globalAlpha = 1;
  }

  function camStep(dt) {
    let tx;
    const ph = P ? P.phase : null;
    if (!P) tx = (10 + M.yl) * SX - 200;
    else if (ph === 'run') tx = P.carrier.x * SX - 190 - clamp(P.carrier.vx, 0, 12) * 4;
    else if (ph === 'ret') tx = P.carrier.x * SX - 290;
    else if (ph === 'air') tx = P.ball.x * SX - 240;
    else if (ph === 'kickfly') tx = P.ball.x * SX - 240;
    else if (ph === 'loose') tx = P.ball.x * SX - 240;
    else if (ph === 'over') tx = (P.res && P.res.endX != null && P.res.kind !== 'punt' && P.res.kind !== 'fg' && P.res.kind !== 'xp' ? P.res.endX : P.ball.x) * SX - 230;
    else tx = (P.kind === 'punt' ? P.los - 8 : P.los) * SX - 200;
    tx = clamp(tx, 0, 120 * SX - BW);
    if (!camInit) { camX = tx; camInit = true; }
    const k = 1 - Math.exp(-dt * (ph === 'run' || ph === 'air' ? 9 : 5));
    camX += (tx - camX) * k;
  }

  function drawGame() {
    drawField();
    if (G.showLines !== false) {
      const los = P ? P.los : 10 + M.yl;
      vline(los, '#4f8dff', 2, 0.9);
      if (M.firstYl < 100) vline(10 + M.firstYl, UI.gold, 2, 0.95);
    }
    drawRoutes(); drawRunPreview();
    if (P) {
      const sorted = P.es.slice().sort((a, c) => a.y - c.y);
      const mine = G.tsMe, opp = G.tsOp;
      const mark = P.phase === 'hold' ? P.qb : P.phase === 'run' ? P.carrier : null;
      for (const e of sorted) manDraw(e, e.side === 'o' ? mine : opp, e === mark);
      drawBall();
      drawHoldUI();
      drawKickUI();
    }
    drawPops();
    drawHUD();
    drawBanner();
    if (fx.flash > 0) { b.globalAlpha = fx.flash * 0.6; b.fillStyle = '#fff'; b.fillRect(0, 0, BW, BH); b.globalAlpha = 1; }
    if (G.hint && (G.s === 'pre')) {
      const blink = Math.sin(clockT * 5) > -0.3;
      if (blink) txt(b, G.hint, 240, 226, '#fff', 1, 'c', '#000');
    }
  }

  function buildTitle() {
    const c = document.createElement('canvas');
    c.width = BW; c.height = BH;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, BH);
    gr.addColorStop(0, '#0a1038'); gr.addColorStop(0.5, '#3b2a78'); gr.addColorStop(0.72, '#c2467a'); gr.addColorStop(1, '#ff9a5c');
    g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
    const rn = rngMk(42);
    for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.3 + rn() * 0.7).toFixed(2) + ')'; g.fillRect(Math.floor(rn() * BW), Math.floor(rn() * 120), 1, 1); }
    g.fillStyle = '#12163f';
    g.beginPath(); g.moveTo(0, 190);
    for (let x = 0; x <= BW; x += 16) g.lineTo(x, 175 + Math.sin(x * 0.07) * 6 + (x % 48 === 0 ? -8 : 0));
    g.lineTo(BW, 270); g.lineTo(0, 270); g.fill();
    g.fillStyle = '#0c0f2d'; g.fillRect(0, 205, BW, 65);
    for (let x = 18; x < BW; x += 52) { g.fillStyle = '#ffd84d'; for (let k = 0; k < 4; k++) g.fillRect(x + k * 4, 200, 2, 2); g.fillStyle = '#1d2260'; g.fillRect(x + 5, 202, 2, 20); }
    g.fillStyle = '#1f7a35'; g.fillRect(0, 232, BW, 38);
    g.fillStyle = '#2a8f40'; for (let x = 0; x < BW; x += 48) g.fillRect(x, 232, 24, 38);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(0, 232, BW, 1); g.fillRect(0, 250, BW, 1);
    titleBg = c;
  }
  function drawTitle() {
    b.drawImage(titleBg, 0, 0);
    const t = clockT;
    const bx = 60 + ((t * 70) % 360), u = (bx - 60) / 360, by = 188 - Math.sin(u * Math.PI) * 120;
    const T1 = { j: '#d9382f', p: '#e0e0e0', h: '#f4f4f4', n: '#fff' };
    const fake = (x, y, face, anim, vx) => ({ x: 0, y: 0, face, anim, vx, vy: 0, pl: { id: 3 }, role: 'WR', st: 'idle', stun: 0, down: false, eng: null });
    const man = (sx, sy, col, face, anim, vx, ball) => {
      const e = fake(0, 0, face, anim, vx);
      const ox = camX; camX = 0;
      e.x = sx / SX; e.y = (sy - FY0) / SY - 1.1;
      P_title(e, col, ball);
      camX = ox;
    };
    const T2 = { j: '#2a62c8', p: '#e8e8e8', h: '#ffd84d', n: '#fff' };
    man(60, 238, T1, 1, t * 8, 6);
    man(160 + Math.sin(t) * 3, 244, T2, -1, t * 8, 1);
    man(290, 236, T1, 1, t * 9, 7);
    man(420 - ((t * 20) % 20), 242, T2, -1, t * 9, 2);
    b.save(); b.translate(Math.round(bx), Math.round(by)); b.rotate(u * 6.28 * 2 + 0.3);
    b.fillStyle = '#7a3b12'; b.beginPath(); b.ellipse(0, 0, 6, 3.4, 0, 0, 6.3); b.fill(); b.fillStyle = '#fff'; b.fillRect(-2, -1, 4, 2); b.restore();
    const ty = 36 + Math.round(Math.sin(t * 2) * 2);
    txt(b, 'RETRO', 240, ty, '#fff', 6, 'c', '#1a1450');
    txt(b, 'RETRO', 240, ty - 1, UI.gold, 6, 'c');
    txt(b, 'BOWL', 240, ty + 52, '#fff', 8, 'c', '#1a1450');
    txt(b, 'BOWL', 240, ty + 51, '#ff6a3d', 8, 'c');
    txt(b, 'PIXEL FOOTBALL FRANCHISE', 240, ty + 112, '#ffe9b8', 1, 'c', '#1a1450');
  }
  function P_title(e, T, ball) {
    const keep = P;
    P = null;
    manDraw(e, T, false);
    P = keep;
  }

  function render(dt) {
    clockT += dt;
    if (!stands) buildStands();
    if (!titleBg) buildTitle();
    stepFx(dt);
    b.fillStyle = '#000'; b.fillRect(0, 0, BW, BH);
    let shx = 0, shy = 0;
    if (scene === 'title') drawTitle();
    else if (scene === 'game' && G && M) {
      camStep(dt);
      if (fx.shake > 0) { shx = Math.round((Math.random() - 0.5) * 6 * fx.shake); shy = Math.round((Math.random() - 0.5) * 6 * fx.shake); }
      drawGame();
    }
    const c = view.ctx;
    c.imageSmoothingEnabled = false;
    c.drawImage(bufC, shx * 2, shy * 2, BW * 2, BH * 2);
  }

  const CSS = `
.gm-retro-bowl{--n0:#080d22;--n1:#0d1530;--n2:#1a2550;--n3:#243374;--ln:#3a4a8a;--gd:#ffe14d;--rd:#ff5a4d;--gr:#5fe36b;--dm:#9fb0e8;--bl:#4db8ff;width:100%;gap:10px;color:#fff;font-family:ui-monospace,'Cascadia Mono','SFMono-Regular',Consolas,Menlo,monospace;font-weight:700;text-transform:uppercase;letter-spacing:.02em;justify-content:flex-start;min-height:0}
.gm-retro-bowl *{box-sizing:border-box}
.gm-retro-bowl [hidden]{display:none!important}
.gm-retro-bowl .rb-stage{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px))*1.7778));aspect-ratio:16/9;background:#000;border:3px solid var(--ln);border-radius:6px;overflow:hidden;flex:none}
.gm-retro-bowl .rb-stage .g-canvas{position:absolute;inset:0;width:100%!important;height:100%!important;border-radius:0;background:#000;image-rendering:pixelated;touch-action:none;display:block}
.gm-retro-bowl .rb-ui{width:min(100%,960px);display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:stretch;min-height:44px;background:var(--n1);border:2px solid var(--ln);border-radius:6px;padding:8px}
.gm-retro-bowl .rb-b{font:inherit;text-transform:uppercase;color:#fff;background:var(--n3);border:2px solid #5a6fd0;border-bottom-width:4px;border-radius:5px;padding:9px 14px;cursor:pointer;font-size:13px;line-height:1.1;min-height:40px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .08s,filter .12s}
.gm-retro-bowl .rb-b:hover{filter:brightness(1.18)}
.gm-retro-bowl .rb-b:active{transform:translateY(2px);border-bottom-width:2px}
.gm-retro-bowl .rb-b.pri{background:#e8a317;color:#1b1300;border-color:#ffd25a}
.gm-retro-bowl .rb-b.grn{background:#1f9d3f;border-color:#6bf08a}
.gm-retro-bowl .rb-b.red{background:#b3342b;border-color:#ff8a7e}
.gm-retro-bowl .rb-b.sm{padding:5px 9px;font-size:11px;min-height:28px;border-bottom-width:3px}
.gm-retro-bowl .rb-b[disabled]{opacity:.38;pointer-events:none}
.gm-retro-bowl .rb-b.on{background:#e8a317;color:#1b1300;border-color:#ffd25a}
.gm-retro-bowl .rb-b.big{font-size:17px;padding:13px 22px;min-width:220px}
.gm-retro-bowl .rb-calls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:100%}
.gm-retro-bowl .rb-call{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:7px 10px;min-height:46px}
.gm-retro-bowl .rb-call i{font-style:normal;background:#0d1530;color:var(--gd);border-radius:3px;padding:1px 5px;font-size:11px;margin-right:6px}
.gm-retro-bowl .rb-call b{font-size:12px}
.gm-retro-bowl .rb-call small{font-size:10px;color:var(--dm);font-weight:700}
.gm-retro-bowl .rb-call.run{border-color:#6bd28a;background:#1b4a3a}
.gm-retro-bowl .rb-call.sp{border-color:#ffd25a;background:#4a3a14}
.gm-retro-bowl .rb-info{width:100%;text-align:center;font-size:12px;color:var(--dm)}
.gm-retro-bowl .rb-info b{color:#fff}
.gm-retro-bowl .rb-pop{position:absolute;inset:3% 4%;background:rgba(8,13,34,.95);border:3px solid var(--ln);border-radius:6px;padding:12px;overflow:auto;display:flex;flex-direction:column;gap:8px;z-index:5}
.gm-retro-bowl .rb-pop h3{margin:0;font-size:clamp(14px,2.4vw,20px);color:var(--gd)}
.gm-retro-bowl .rb-pop p{margin:0;font-size:12px;color:var(--dm)}
.gm-retro-bowl .rb-pl{display:flex;flex-direction:column;gap:3px;font-size:12px;overflow:auto;flex:1;min-height:60px}
.gm-retro-bowl .rb-pl div{padding:3px 6px;background:#101a42;border-left:3px solid #3a4a8a;line-height:1.25}
.gm-retro-bowl .rb-pl div.f{border-color:var(--gd)}
.gm-retro-bowl .rb-pl div.s{border-color:var(--gr);background:#12332a}
.gm-retro-bowl .rb-pl div.x{border-color:var(--rd);background:#3a1620}
.gm-retro-bowl .rb-pl em{font-style:normal;color:var(--dm);margin-right:6px}
.gm-retro-bowl .rb-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.gm-retro-bowl .rb-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;font-size:11px}
.gm-retro-bowl .rb-stats div{background:#101a42;border-radius:4px;padding:6px 8px}
.gm-retro-bowl .rb-stats span{display:block;color:var(--dm);font-size:10px}
.gm-retro-bowl .rb-stats b{font-size:15px}
.gm-retro-bowl .rb-menu{width:min(100%,960px);background:var(--n1);border:3px solid var(--ln);border-radius:6px;padding:14px;text-align:left;display:flex;flex-direction:column;gap:12px}
.gm-retro-bowl .rb-nav{display:flex;flex-wrap:wrap;gap:6px}
.gm-retro-bowl .rb-hd{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.gm-retro-bowl .rb-ti{flex:1;min-width:180px}
.gm-retro-bowl .rb-ti h2{margin:0;font-size:clamp(18px,3.4vw,28px);color:var(--gd)}
.gm-retro-bowl .rb-ti p{margin:3px 0 0;font-size:12px;color:var(--dm)}
.gm-retro-bowl .bd{font-style:normal;display:inline-flex;align-items:center;justify-content:center;min-width:46px;height:34px;padding:0 6px;border-radius:5px;border:2px solid rgba(255,255,255,.55);font-size:14px;font-weight:900}
.gm-retro-bowl .rb-ms{min-width:200px;display:flex;flex-direction:column;gap:5px;font-size:11px}
.gm-retro-bowl .rb-ms p{margin:0;color:var(--dm)}
.gm-retro-bowl .rb-ms p b{color:#fff}
.gm-retro-bowl .mt{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--dm)}
.gm-retro-bowl .mt span{width:46px}
.gm-retro-bowl .mt div{flex:1;height:9px;background:#080d22;border:1px solid var(--ln);border-radius:2px;overflow:hidden}
.gm-retro-bowl .mt i{display:block;height:100%}
.gm-retro-bowl .mt b{width:26px;text-align:right;color:#fff}
.gm-retro-bowl .rb-card{background:var(--n2);border:2px solid var(--ln);border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:8px}
.gm-retro-bowl .rb-card h3{margin:0;font-size:15px;color:var(--gd)}
.gm-retro-bowl .rb-card p{margin:0;font-size:12px;color:var(--dm);line-height:1.4;text-transform:none;font-weight:600}
.gm-retro-bowl .rb-vs{display:flex;align-items:center;justify-content:space-around;gap:10px;flex-wrap:wrap}
.gm-retro-bowl .rb-vs div{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;text-align:center}
.gm-retro-bowl .rb-vs .at{font-size:20px;color:var(--gd)}
.gm-retro-bowl .rb-note{background:#14301f;border:2px solid #3a8a55;border-radius:5px;padding:8px 10px;font-size:12px;color:#c9f5d6}
.gm-retro-bowl .rb-warn{background:#3a1620;border:2px solid #a8404f;border-radius:5px;padding:8px 10px;font-size:12px;color:#ffc4cb}
.gm-retro-bowl .rb-scroll{overflow-x:auto;max-width:100%}
.gm-retro-bowl .rb-tbl{width:100%;border-collapse:collapse;font-size:12px;min-width:480px}
.gm-retro-bowl .rb-tbl th{text-align:left;color:var(--dm);font-size:10px;padding:5px 6px;border-bottom:2px solid var(--ln);white-space:nowrap}
.gm-retro-bowl .rb-tbl td{padding:5px 6px;border-bottom:1px solid #1d2a5c;white-space:nowrap}
.gm-retro-bowl .rb-tbl tr.me td{background:#223a7a}
.gm-retro-bowl .rb-tbl tr.in td:first-child{border-left:3px solid var(--gr)}
.gm-retro-bowl .rb-tbl tr.inj td{color:#ff9a8e}
.gm-retro-bowl .rb-tbl td.n{font-variant-numeric:tabular-nums;text-align:right}
.gm-retro-bowl .st{color:var(--gd);letter-spacing:0;font-size:11px;white-space:nowrap}
.gm-retro-bowl .st u{text-decoration:none}
.gm-retro-bowl .st .se{color:#3a4a8a}
.gm-retro-bowl .st .sh{background:linear-gradient(90deg,var(--gd) 50%,#3a4a8a 50%);-webkit-background-clip:text;background-clip:text;color:transparent}
.gm-retro-bowl .rb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.gm-retro-bowl .rb-teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px}
.gm-retro-bowl .rb-team{display:flex;gap:8px;align-items:center;text-align:left;padding:7px 8px;min-height:50px}
.gm-retro-bowl .rb-team.on{outline:3px solid var(--gd);background:#3a4fa8}
.gm-retro-bowl .rb-team small{display:block;font-size:10px;color:var(--dm);margin-top:2px}
.gm-retro-bowl .rb-fac{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px}
.gm-retro-bowl .pips{display:flex;gap:4px}
.gm-retro-bowl .pips i{width:20px;height:9px;background:#080d22;border:1px solid var(--ln)}
.gm-retro-bowl .pips i.on{background:var(--gd);border-color:#fff}
.gm-retro-bowl .rb-h{margin:0;font-size:15px;color:var(--gd)}
.gm-retro-bowl .rb-sub{font-size:11px;color:var(--dm);margin:0}
.gm-retro-bowl .rb-opt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.gm-retro-bowl .rb-opt>span{min-width:120px;font-size:12px;color:var(--dm)}
.gm-retro-bowl .rb-menu .rb-title{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px}
@media (min-width:901px){.gm-retro-bowl .rb-ui{min-height:140px;align-content:flex-start}.gm-retro-bowl .rb-menu{height:696px;overflow-y:auto}.gm-retro-bowl .rb-calls.pl{grid-template-columns:repeat(6,minmax(0,1fr))}.gm-retro-bowl .rb-calls.spr{display:flex}.gm-retro-bowl .rb-calls.spr .rb-call{flex:1;min-height:36px;flex-direction:row;align-items:center;gap:8px}}
@media (max-width:560px){.gm-retro-bowl .rb-calls{grid-template-columns:repeat(2,minmax(0,1fr))}.gm-retro-bowl .rb-b.big{min-width:0;width:100%}.gm-retro-bowl .rb-menu{padding:10px}.gm-retro-bowl .rb-pop{inset:2%;padding:8px}}
`;

  let view = null, root = null, stageEl = null, uiEl = null, menuEl = null, popEl = null, apiRef = null;
  let menuName = 'home', notice = '', posTab = 'ALL', confirmId = null, setupSel = 0, setupCoach = 0, PV = null, pendingTab = null;
  let draftTab = 'ALL', setupQuick = false, realF = null;

  const T = id => F.teams[id];
  const rec = t => t.w + '-' + t.l + (t.t ? '-' + t.t : '');
  const bdg = t => `<i class="bd" style="background:${t.c1};color:${t.c2}">${t.ab}</i>`;
  const bt = (a, label, cls = '', data = '') => `<button class="rb-b ${cls}" data-a="${a}" ${data}>${label}</button>`;
  const meter = (label, v, col) => `<div class="mt"><span>${label}</span><div><i style="width:${clamp(v, 0, 100)}%;background:${col}"></i></div><b>${Math.round(v)}</b></div>`;
  const stageLine = () => F.phase === 'reg' ? 'Week ' + F.week + ' of ' + WEEKS : F.phase === 'po' ? ROUND_NAMES[F.po.round] : F.phase === 'end' ? 'Season complete' : F.phase === 'resign' ? 'Re-sign players' : F.phase === 'draft' ? 'The draft' : F.phase === 'fa' ? 'Free agency' : '';
  const ovrOf = t => (t.off + t.def) / 2;
  const tabs = (cur, act) => ['ALL', ...POS].map(p => `<button class="rb-b sm ${cur === p ? 'on' : ''}" data-a="${act}" data-v="${p}">${p}</button>`).join('');

  function saveF() {
    if (!apiRef || G && G.quick) return;
    let d = null;
    try { d = apiRef.load(); } catch (e) {}
    apiRef.save({ v: 1, F: F || (d && d.F) || null, SET });
  }
  function loadSave() {
    const d = apiRef.load();
    if (!d || !d.F || !d.F.teams || !d.F.roster) return false;
    F = d.F;
    if (d.SET) Object.assign(SET, d.SET);
    let mx = 0;
    const scan = p => { if (p && p.id > mx) mx = p.id; };
    F.roster.forEach(scan); F.fa.forEach(scan);
    if (F.draft) F.draft.pros.forEach(scan);
    (F.resign || []).forEach(r => scan(r.p));
    uid = mx + 1000;
    return true;
  }
  const hasSave = () => { try { const d = apiRef.load(); return !!(d && d.F && d.F.teams); } catch (e) { return false; } };

  function navHtml(cur) {
    const items = [['home', 'HOME'], ['roster', 'ROSTER'], ['fa', 'FREE AGENTS'], ['fac', 'FACILITIES'], ['stand', 'STANDINGS'], ['sched', 'SCHEDULE'], ['news', 'NEWS']];
    return `<div class="rb-nav">${items.map(([k, l]) => `<button class="rb-b sm ${cur === k ? 'on' : ''}" data-a="go" data-v="${k}">${l}</button>`).join('')}</div>`;
  }
  function headHtml() {
    const me = T(F.tid);
    return `<div class="rb-hd">${bdg(me)}<div class="rb-ti"><h2>${esc(tname(me))}</h2><p>${F.year} · ${esc(stageLine())} · ${rec(me)} · ${esc(F.coach)}</p></div><div class="rb-ms">${meter('FANS', F.fan, '#4db8ff')}${meter('OWNER', F.owner, '#ffd24d')}<p>CREDITS <b>${F.credits}</b> · PAYROLL <b>${money(payroll(F))}</b> / ${money(capOf(F))}</p></div></div>`;
  }

  function titleHtml() {
    const sv = hasSave();
    return `<div class="rb-ui-t">${sv ? bt('continue', 'CONTINUE FRANCHISE', 'pri big') : ''}${bt('newf', 'NEW FRANCHISE', sv ? 'big' : 'pri big')}${bt('quick', 'QUICK GAME', 'big')}${bt('go', 'SETTINGS', 'sm', 'data-v="settings"')}${bt('go', 'HOW TO PLAY', 'sm', 'data-v="help"')}</div>`;
  }

  function nextGameHtml() {
    const ng = userNextGame(F), me = T(F.tid);
    if (F.phase === 'end') {
      const po = F.po, h = F.hist[0];
      return `<div class="rb-card"><h3>${F.year} SEASON COMPLETE</h3><p>${h ? esc(h.rec + ' · ' + h.res) : ''}</p>${po && po.champ != null ? `<p>Retro Bowl champions: <b style="color:#fff">${esc(tname(T(po.champ)))}</b></p>` : ''}${F.fired ? `<div class="rb-warn">The owner is not happy with your results. You have been fired.</div>` : ''}<div class="rb-row">${F.fired ? bt('fired', 'START OVER', 'pri big') : bt('offseason', 'CONTINUE TO OFFSEASON', 'pri big')}</div></div>`;
    }
    if (!ng) {
      const bye = F.phase === 'po' && !F.po.userOut;
      return `<div class="rb-card"><h3>${F.phase === 'po' ? ROUND_NAMES[F.po.round].toUpperCase() : 'BYE WEEK'}</h3><p>${F.phase === 'po' ? (bye ? 'Your team has a first-round bye.' : 'Your team is not playing this round.') : 'No game this week.'}</p><div class="rb-row">${bt('simnext', 'SIM NEXT ROUND', 'pri')}${bt('simseason', 'SIM TO THE END')}</div></div>`;
    }
    const opp = ng.opp, s = strength(lineup(F.roster), F.fac), mo = ovrOf(opp), mm = (s.off + s.def) / 2;
    const issues = rosterIssues(F).filter(x => !x.startsWith('Payroll'));
    return `<div class="rb-card"><h3>${F.phase === 'po' ? ROUND_NAMES[F.po.round].toUpperCase() : 'WEEK ' + F.week}</h3><div class="rb-vs"><div>${bdg(me)}<b>${esc(me.name)}</b><span class="st">${starTxt(mm)}</span>OVR ${Math.round(mm)}</div><div class="at">${ng.neutral ? 'VS' : ng.home ? 'VS' : 'AT'}</div><div>${bdg(opp)}<b>${esc(opp.name)}</b><span class="st">${starTxt(mo)}</span>OVR ${Math.round(mo)} · ${rec(opp)}</div></div>${issues.length ? `<div class="rb-warn">${issues.map(esc).join('<br>')}</div>` : ''}<div class="rb-row">${bt('play', 'PLAY GAME', 'pri big', issues.length ? 'disabled' : '')}${bt('sim', 'SIM GAME', '')}${F.phase === 'reg' ? bt('simplay', 'SIM TO PLAYOFFS') : ''}${bt('simseason', 'SIM SEASON')}</div></div>`;
  }

  function hubHtml() {
    const L = lineup(F.roster), s = strength(L, F.fac);
    let h = headHtml() + navHtml('home');
    if (notice) h += `<div class="rb-note">${esc(notice)}</div>`;
    h += nextGameHtml();
    const inj = F.roster.filter(p => p.inj > 0);
    h += `<div class="rb-card"><h3>TEAM</h3><div class="rb-stats"><div><span>OFFENSE</span><b>${Math.round(s.off)}</b></div><div><span>DEFENSE</span><b>${Math.round(s.def)}</b></div><div><span>SPECIAL TEAMS</span><b>${Math.round(s.st)}</b></div><div><span>QB</span><b>${esc(L.QB[0] ? L.QB[0].n : '-')} ${L.QB[0] ? L.QB[0].ovr : ''}</b></div><div><span>INJURED</span><b>${inj.length}</b></div><div><span>STREAK</span><b>${F.streak > 0 ? 'W' + F.streak : F.streak < 0 ? 'L' + -F.streak : '-'}</b></div></div>${inj.length ? `<p>Out: ${inj.map(p => esc(p.n) + ' (' + p.pos + ', ' + p.inj + 'w)').join(', ')}</p>` : ''}</div>`;
    h += `<div class="rb-row">${bt('go', 'TITLE SCREEN', 'sm', 'data-v="title"')}${bt('go', 'SETTINGS', 'sm', 'data-v="settings"')}</div>`;
    return h;
  }

  function rosterHtml() {
    let h = headHtml() + navHtml('roster');
    const L = lineup(F.roster), starters = new Set();
    for (const pos of POS) L[pos].slice(0, START[pos]).forEach(p => starters.add(p.id));
    const list = F.roster.filter(p => posTab === 'ALL' || p.pos === posTab).sort((a, c) => POS.indexOf(a.pos) - POS.indexOf(c.pos) || c.ovr - a.ovr);
    const cap = capOf(F), pay = payroll(F);
    h += `<div class="rb-row"><span class="rb-sub">${F.roster.length} / ${ROSTER_MAX} PLAYERS · PAYROLL ${money(pay)} OF ${money(cap)} CAP${pay > cap ? ' <b style="color:#ff5a4d">OVER CAP</b>' : ''}</span></div><div class="rb-nav">${tabs(posTab, 'tab')}</div>`;
    h += `<div class="rb-scroll"><table class="rb-tbl"><tr><th>NAME</th><th>POS</th><th>AGE</th><th>OVR</th><th>RATING</th><th>SPD</th><th>SALARY</th><th>YRS</th><th>MORALE</th><th>STATUS</th><th></th></tr>`;
    for (const p of list) {
      const sure = confirmId === p.id;
      h += `<tr class="${starters.has(p.id) ? 'in' : ''} ${p.inj ? 'inj' : ''}"><td>${esc(p.n)}${p.rk ? ' (R)' : ''}</td><td>${p.pos}</td><td class="n">${p.age}</td><td class="n">${p.ovr}</td><td class="st">${starTxt(p.ovr)}</td><td class="n">${p.spd}</td><td class="n">${money(p.sal)}</td><td class="n">${p.yrs}</td><td style="color:${moodCol(p.mor)}">${moodWord(p.mor)}</td><td>${p.inj ? 'OUT ' + p.inj + 'W' : starters.has(p.id) ? 'STARTER' : 'BENCH'}</td><td>${bt('cut', sure ? 'SURE?' : 'RELEASE', 'sm ' + (sure ? 'red' : ''), `data-id="${p.id}"`)}</td></tr>`;
    }
    h += '</table></div><p class="rb-sub">Green marker = starter. Release players to fit under the cap. Low morale players may refuse to re-sign.</p>';
    return h;
  }

  function faHtml() {
    let h = headHtml() + navHtml('fa');
    const cap = capOf(F), pay = payroll(F);
    h += `<div class="rb-row"><span class="rb-sub">CAP SPACE ${money(cap - pay)} · ROSTER ${F.roster.length} / ${ROSTER_MAX}</span></div><div class="rb-nav">${tabs(posTab, 'tab')}</div>`;
    if (notice) h += `<div class="rb-note">${esc(notice)}</div>`;
    const list = F.fa.filter(p => posTab === 'ALL' || p.pos === posTab).sort((a, c) => c.ovr - a.ovr);
    h += `<div class="rb-scroll"><table class="rb-tbl"><tr><th>NAME</th><th>POS</th><th>AGE</th><th>OVR</th><th>RATING</th><th>ASK</th><th>YRS</th><th></th></tr>`;
    for (const p of list) {
      const can = F.roster.length < ROSTER_MAX && pay + p.ask <= cap;
      h += `<tr><td>${esc(p.n)}</td><td>${p.pos}</td><td class="n">${p.age}</td><td class="n">${p.ovr}</td><td class="st">${starTxt(p.ovr)}</td><td class="n">${money(p.ask)}</td><td class="n">${p.askYrs}</td><td>${bt('sign', 'SIGN', 'sm grn', `data-id="${p.id}" ${can ? '' : 'disabled'}`)}</td></tr>`;
    }
    h += '</table></div>';
    if (F.phase === 'fa') h += `<div class="rb-row">${bt('autofill', 'FILL ROSTER SPOTS', '')}${bt('startseason', 'START ' + (F.year + 1) + ' SEASON', 'pri big')}</div>`;
    return h;
  }

  function facHtml() {
    let h = headHtml() + navHtml('fac');
    h += `<p class="rb-sub">Spend coaching credits (earned from every game) to upgrade your franchise. Level 1 to 5.</p>${notice ? `<div class="rb-note">${esc(notice)}</div>` : ''}<div class="rb-fac">`;
    for (const [k, name, desc] of FAC) {
      const lv = F.fac[k], cost = facCost(lv), max = lv >= 5;
      h += `<div class="rb-card"><h3>${name}</h3><div class="pips">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')}</div><p>${desc}</p>${bt('up', max ? 'MAX LEVEL' : 'UPGRADE · ' + cost + ' CREDITS', 'pri', `data-id="${k}" ${max || F.credits < cost ? 'disabled' : ''}`)}</div>`;
    }
    return h + '</div>';
  }

  function standHtml() {
    let h = headHtml() + navHtml('stand');
    for (let c = 0; c < 2; c++) {
      const seeds = seedsFor(F, c);
      h += `<h3 class="rb-h">${CONFS[c]} CONFERENCE</h3>`;
      for (let d = 0; d < 4; d++) {
        const ts = sortTeams(F.teams.filter(t => t.conf === c && t.div === d));
        h += `<div class="rb-scroll"><table class="rb-tbl"><tr><th>${DIVS[d]}</th><th>W</th><th>L</th><th>T</th><th>PF</th><th>PA</th><th>SEED</th></tr>${ts.map(t => `<tr class="${t.id === F.tid ? 'me' : ''}"><td>${esc(tname(t))}</td><td class="n">${t.w}</td><td class="n">${t.l}</td><td class="n">${t.t}</td><td class="n">${t.pf}</td><td class="n">${t.pa}</td><td class="n">${seeds.includes(t.id) ? seeds.indexOf(t.id) + 1 : ''}</td></tr>`).join('')}</table></div>`;
      }
    }
    return h;
  }

  function schedHtml() {
    let h = headHtml() + navHtml('sched');
    h += `<div class="rb-scroll"><table class="rb-tbl"><tr><th>WEEK</th><th>OPPONENT</th><th>RESULT</th></tr>`;
    F.sched.forEach((wk, i) => {
      const g = wk.find(x => x.h === F.tid || x.a === F.tid);
      if (!g) return;
      const home = g.h === F.tid, opp = T(home ? g.a : g.h);
      let r = '';
      if (g.done) { const us = home ? g.hs : g.as, th = home ? g.as : g.hs; r = (us > th ? 'W ' : us < th ? 'L ' : 'T ') + us + '-' + th + (g.ot ? ' OT' : ''); }
      h += `<tr class="${F.phase === 'reg' && F.week === i + 1 ? 'me' : ''}"><td class="n">${i + 1}</td><td>${home ? 'VS' : 'AT'} ${esc(tname(opp))}</td><td>${r}</td></tr>`;
    });
    h += '</table></div>';
    if (F.po) {
      h += `<h3 class="rb-h">PLAYOFFS</h3><div class="rb-scroll"><table class="rb-tbl"><tr><th>ROUND</th><th>GAME</th><th>SCORE</th></tr>`;
      const rows = [];
      F.po.log.forEach(r => r.games.forEach(g => rows.push([ROUND_NAMES[r.round], g])));
      if (F.phase === 'po') F.po.games.forEach(g => rows.push([ROUND_NAMES[F.po.round], g]));
      for (const [rn, g] of rows) h += `<tr class="${g.h === F.tid || g.a === F.tid ? 'me' : ''}"><td>${rn}</td><td>${esc(T(g.a).ab)} AT ${esc(T(g.h).ab)}</td><td>${g.done ? g.as + '-' + g.hs : ''}</td></tr>`;
      h += '</table></div>';
    }
    return h;
  }

  function newsHtml() {
    let h = headHtml() + navHtml('news');
    h += `<h3 class="rb-h">LATEST</h3><div class="rb-pl">${F.news.map(n => `<div>${esc(n)}</div>`).join('') || '<div>Nothing yet.</div>'}</div>`;
    h += `<h3 class="rb-h">SEASONS</h3><div class="rb-scroll"><table class="rb-tbl"><tr><th>YEAR</th><th>RECORD</th><th>RESULT</th><th>CHAMPION</th><th>POINTS</th></tr>${F.hist.map(x => `<tr><td>${x.year}</td><td>${x.rec}</td><td>${esc(x.res)}</td><td>${esc(x.champ)}</td><td class="n">${x.pts}</td></tr>`).join('')}</table></div>`;
    h += `<p class="rb-sub">TITLES ${F.titles} · WINS ${F.wins} · LOSSES ${F.losses}</p>`;
    return h;
  }

  function resignHtml() {
    let h = headHtml() + navHtml('resign');
    h += `<h3 class="rb-h">CONTRACTS EXPIRING</h3><p class="rb-sub">${F.retired && F.retired.length ? 'Retired: ' + esc(F.retired.join(', ')) + '. ' : ''}Re-sign players before they hit free agency. Longer deals cost less per year.</p>${notice ? `<div class="rb-note">${esc(notice)}</div>` : ''}`;
    if (!F.resign.length) h += '<p class="rb-sub">Nobody is expiring.</p>';
    else {
      h += `<div class="rb-scroll"><table class="rb-tbl"><tr><th>NAME</th><th>POS</th><th>AGE</th><th>OVR</th><th>MORALE</th><th>OFFER</th></tr>`;
      for (const r of F.resign) {
        const p = r.p;
        h += `<tr><td>${esc(p.n)}</td><td>${p.pos}</td><td class="n">${p.age}</td><td class="n">${p.ovr}</td><td style="color:${moodCol(p.mor)}">${moodWord(p.mor)}</td><td>${r.signed ? 'RE-SIGNED' : r.refuse ? 'REFUSES TO RE-SIGN' : [1, 2, 3].map(y => bt('resign', y + 'Y ' + money(r.ask[y - 1]), 'sm grn', `data-id="${p.id}" data-y="${y}"`)).join(' ')}</td></tr>`;
      }
      h += '</table></div>';
    }
    h += `<div class="rb-row">${bt('todraft', 'GO TO THE DRAFT', 'pri big')}</div>`;
    return h;
  }

  function draftHtml() {
    const D = F.draft;
    let h = headHtml() + navHtml('draft');
    if (D.done) {
      h += `<div class="rb-card"><h3>THE DRAFT IS OVER</h3><p>Your rookies joined the roster. Next up: free agency.</p>${bt('tofa', 'GO TO FREE AGENCY', 'pri big')}</div><h3 class="rb-h">LAST PICKS</h3><div class="rb-pl">${D.log.slice(0, 14).map(x => `<div>${esc(x)}</div>`).join('')}</div>`;
      return h;
    }
    const pk = D.picks[D.i], mine = pk.team === F.tid;
    h += `<div class="rb-card"><h3>ROUND ${pk.round} · PICK ${(D.i % 32) + 1}${mine ? ' · YOU ARE ON THE CLOCK' : ''}</h3><p>${esc(tname(T(pk.team)))} picks next. Prospect ratings are estimates; a better Scouting Department makes them more accurate.</p><div class="rb-row">${bt('draftsim', 'SIM TO MY PICK', mine ? '' : 'pri')}${bt('draftauto', 'AUTO DRAFT THE REST')}</div></div>`;
    const list = D.pros.filter(p => draftTab === 'ALL' || p.pos === draftTab).sort((a, c) => (c.est + c.estPot * 0.6 - (c.pos === 'K' || c.pos === 'P' ? 25 : 0)) - (a.est + a.estPot * 0.6 - (a.pos === 'K' || a.pos === 'P' ? 25 : 0))).slice(0, 30);
    h += `<div class="rb-nav">${tabs(draftTab, 'dtab')}</div><div class="rb-scroll"><table class="rb-tbl"><tr><th>NAME</th><th>POS</th><th>AGE</th><th>EST OVR</th><th>RATING</th><th>POTENTIAL</th><th></th></tr>`;
    for (const p of list) h += `<tr><td>${esc(p.n)}</td><td>${p.pos}</td><td class="n">${p.age}</td><td class="n">${p.est}</td><td class="st">${starTxt(p.est)}</td><td class="st">${starTxt(p.estPot)}</td><td>${bt('draft', 'DRAFT', 'sm pri', `data-id="${p.id}" ${mine ? '' : 'disabled'}`)}</td></tr>`;
    h += `</table></div><h3 class="rb-h">LATEST PICKS</h3><div class="rb-pl">${D.log.slice(0, 8).map(x => `<div>${esc(x)}</div>`).join('')}</div>`;
    return h;
  }

  function setupHtml() {
    if (!PV) PV = TEAMS.map((_, i) => mkTeam(i));
    let h = `<h2 class="rb-h">CHOOSE YOUR TEAM</h2><p class="rb-sub">Ratings are random every new franchise. Pick a contender or build a dynasty from the bottom.</p>`;
    for (let c = 0; c < 2; c++) {
      h += `<h3 class="rb-h">${CONFS[c]} CONFERENCE</h3><div class="rb-teams">`;
      for (let i = c * 16; i < c * 16 + 16; i++) {
        const t = PV[i], o = ovrOf(t);
        h += `<button class="rb-b rb-team ${setupSel === i ? 'on' : ''}" data-a="pickteam" data-id="${i}">${bdg(t)}<span>${esc(t.city)}<br>${esc(t.name)}<small class="st">${starTxt(o)}</small></span></button>`;
      }
      h += '</div>';
    }
    h += `<div class="rb-card"><h3>${esc(tname(PV[setupSel]))}</h3><p>OFF ${Math.round(PV[setupSel].off)} · DEF ${Math.round(PV[setupSel].def)} · ST ${Math.round(PV[setupSel].st)}</p><div class="rb-opt"><span>COACH</span>${COACHES.map((c, i) => bt('coach', c, 'sm ' + (setupCoach === i ? 'on' : ''), `data-v="${i}"`)).join('')}</div>${optRows()}<div class="rb-row">${setupQuick ? bt('startq', 'PLAY QUICK GAME', 'pri big') : bt('startf', 'START FRANCHISE', 'pri big')}${bt('go', 'BACK', '', 'data-v="title"')}</div></div>`;
    return h;
  }

  function optRows() {
    const q = QLENS.map(([s, l]) => bt('ql', l, 'sm ' + (SET.ql === s ? 'on' : ''), `data-v="${s}"`)).join('');
    const d = DIFF_NAMES.map((n, i) => bt('diff', n, 'sm ' + (SET.diff === i ? 'on' : ''), `data-v="${i}"`)).join('');
    return `<div class="rb-opt"><span>QUARTER LENGTH</span>${q}</div><div class="rb-opt"><span>DIFFICULTY</span>${d}</div><div class="rb-opt"><span>SOUND</span>${bt('snd', SET.snd ? 'ON' : 'OFF', 'sm ' + (SET.snd ? 'on' : ''))}</div>`;
  }

  function settingsHtml() {
    return `<h2 class="rb-h">SETTINGS</h2><div class="rb-card">${optRows()}<p>Quarter length and difficulty apply to the next game you play. The Esc key pauses the game.</p>${F ? `<div class="rb-row">${bt('go', 'BACK TO FRANCHISE', 'pri', 'data-v="home"')}${bt('go', 'TITLE SCREEN', '', 'data-v="title"')}</div>` : `<div class="rb-row">${bt('go', 'TITLE SCREEN', 'pri', 'data-v="title"')}</div>`}${hasSave() ? `<div class="rb-row">${bt('wipe', confirmId === 'wipe' ? 'REALLY DELETE THE SAVED FRANCHISE?' : 'DELETE SAVED FRANCHISE', 'sm red')}</div>` : ''}</div>`;
  }

  function helpHtml() {
    return `<h2 class="rb-h">HOW TO PLAY</h2><div class="rb-card"><h3>CALL A PLAY</h3><p>Pick a pass or run, then tap the field or press Space to snap. Fourth down: choose a field goal or punt.</p><h3>PASSING</h3><p>Receivers run their routes. Tap a receiver (or press 1 to 5) to throw to him. Drag to aim the throw: a trajectory arc and a lock-on box show where the ball goes. The bar over the QB is pass rush pressure; hold the ball too long and you are sacked. Drag from the QB, or use the arrow keys, to scramble.</p><h3>RUNNING</h3><p>With the ball, hold the pointer or use the arrows to steer. Swipe (or press J) to juke defenders. Tap (or press Space) to dive for extra yards, but diving raises fumble risk.</p><h3>KICKING</h3><p>Drag up and release to kick. Drag length is power, drag sideways is aim. With keys: hold Space time to charge, arrows to aim, Space again to kick. Watch the wind.</p><h3>FRANCHISE</h3><p>Win games to earn coaching credits and keep the fans and the owner happy. Upgrade facilities, manage the salary cap, re-sign stars, draft rookies and sign free agents. Win the Retro Bowl.</p></div>${bt('go', 'BACK', 'pri', `data-v="${F ? 'home' : 'title'}"`)}`;
  }

  function menuHtml(n) {
    switch (n) {
      case 'setup': return setupHtml();
      case 'settings': return settingsHtml();
      case 'help': return helpHtml();
    }
    if (!F) return setupHtml();
    switch (n) {
      case 'roster': return rosterHtml();
      case 'fa': return faHtml();
      case 'fac': return facHtml();
      case 'stand': return standHtml();
      case 'sched': return schedHtml();
      case 'news': return newsHtml();
      case 'resign': return resignHtml();
      case 'draft': return draftHtml();
      default: return hubHtml();
    }
  }

  function showScene(name) {
    stageEl.hidden = !(name === 'title' || name === 'game');
    uiEl.hidden = stageEl.hidden;
    menuEl.hidden = !stageEl.hidden;
  }
  function homeFor() {
    if (!F) return 'title';
    return { resign: 'resign', draft: 'draft', fa: 'fa' }[F.phase] || 'home';
  }
  function renderMenu() {
    menuEl.innerHTML = menuHtml(menuName);
  }
  function go(n, keep) {
    if (!keep) notice = '';
    if (n === 'home') n = homeFor();
    if (n === 'title') { toTitle(); return; }
    if ((n === 'roster' || n === 'fa' || n === 'fac' || n === 'stand' || n === 'sched' || n === 'news') && !F) n = 'setup';
    menuName = n; confirmId = null;
    scene = 'menu'; G = null; P = null; M = null;
    showScene('menu'); popEl.innerHTML = ''; popEl.hidden = true;
    renderMenu();
    if (F && !(n === 'setup' || n === 'settings' || n === 'help')) saveF();
    apiRef.label('Wins');
    if (F) apiRef.score(F.wins);
    menuEl.scrollIntoView({ block: 'nearest' });
  }

  const CALLS = ['p1', 'p2', 'p3', 'r1', 'r2', 'r3'];
  const RES_TXT = { td: 'TOUCHDOWN', fg: 'FIELD GOAL', miss: 'FIELD GOAL MISSED', punt: 'PUNT', int: 'INTERCEPTED', fum: 'FUMBLE', downs: 'TURNOVER ON DOWNS', pick6: 'PICK SIX FOR YOU', safety: 'SAFETY FOR YOU', clock: 'END OF THE QUARTER' };
  const bad = (p) => p;

  function banner(text, sub, col, dur, cb) {
    G.banner = { text, sub, col, t: dur, dur };
    G.after = cb || null;
  }
  const scoreTxt = () => M.sc[0] + ' - ' + M.sc[1];

  function toTitle() {
    if (realF) { F = realF; realF = null; }
    scene = 'title'; G = null; P = null; M = null; camX = 0; camInit = false;
    showScene('title'); popEl.hidden = true; popEl.innerHTML = '';
    menuEl.innerHTML = '';
    renderUI();
    apiRef.label('Wins'); apiRef.score(F ? F.wins : 0);
  }

  function beginGame(opp, home, quick, playoff, neutral) {
    newMatch({ opp, home, neutral, playoff });
    M.recv0 = chance(0.5) ? 0 : 1;
    M.snap = {};
    F.roster.forEach(p => { M.snap[p.id] = { ...p.st }; });
    G = { s: 'intro', banner: null, after: null, tl: T(F.tid), tr: opp, quick: !!quick, hint: '', resolving: false, showLines: true, paused: false, uiKey: '', pat: null, dr: null };
    G.tsMe = teamStyle(G.tl, opp); G.tsOp = teamStyle(opp, G.tl);
    P = null; fx.parts = []; fx.pops = []; fx.shake = 0; fx.flash = 0;
    scene = 'game'; camInit = false;
    showScene('game'); popEl.hidden = true; popEl.innerHTML = '';
    apiRef.label('Score'); apiRef.score(0);
    banner(playoff ? ROUND_NAMES[F.po.round].toUpperCase() : 'KICKOFF', (M.recv0 === 0 ? 'You receive the opening kick' : tname(opp) + ' receive the kick') + ' · ' + (home ? 'Home' : neutral ? 'Neutral site' : 'Away'), UI.gold, 2, () => kickoffFor(M.recv0));
    snd('whistle');
    renderUI();
  }

  function kickoffFor(team) {
    const k = kickoffResult();
    setPoss(team, k.yl);
    G.s = 'koff'; P = null;
    snd('kick');
    banner(team === 0 ? 'YOUR BALL' : 'OPPONENT BALL', (k.tb ? 'Touchback' : 'Kick ' + k.txt) + ' · ' + ydTxt(M.yl), '#ffffff', 1.4, nextSnap);
    renderUI();
  }
  function freeKick(team) {
    setPoss(team, ri(33, 46));
    G.s = 'koff'; P = null;
    banner(team === 0 ? 'YOUR BALL' : 'OPPONENT BALL', 'Free kick · ' + ydTxt(M.yl), '#ffffff', 1.4, nextSnap);
    renderUI();
  }

  function cont() { if (M.poss === 1) runOppDrive(); else toCall(); }
  function nextSnap() {
    const w = wrapQuarter();
    if (M.over) { finishGame(); return; }
    if (w.type === 'qtr') { snd('whistle'); banner('END OF QUARTER ' + (M.q - 1), scoreTxt(), UI.gold, 1.6, cont); return; }
    if (w.type === 'half') { snd('whistle'); banner('HALFTIME', scoreTxt(), UI.gold, 2.2, () => kickoffFor(1 - M.recv0)); return; }
    if (w.type === 'ot' || w.type === 'ot2') { snd('whistle'); banner('OVERTIME', 'Sudden death · ' + scoreTxt(), UI.gold, 2, () => kickoffFor(chance(0.5) ? 0 : 1)); return; }
    cont();
  }

  function toCall() {
    G.s = 'call'; P = null; G.hint = ''; G.pat = null;
    setupPlay(PLAYS.p1);
    renderUI();
  }

  function situation() {
    return `<b>${dnTxt()}</b> on ${ydTxt(M.yl)} · ${esc(G.tl.ab)} ${M.sc[0]} - ${M.sc[1]} ${esc(G.tr.ab)} · ${M.ot ? 'OT' : 'Q' + M.q} ${clockTxt(M.clock)}`;
  }
  function callBtn(id, i) {
    const c = PLAYS[id];
    return `<button class="rb-b rb-call ${c.kind === 'pass' ? '' : 'run'}" data-a="call" data-id="${id}"><span><i>${i}</i><b>${c.name}</b></span><small>${c.tag} · ${c.blurb}</small></button>`;
  }
  function renderUI() {
    if (scene === 'title') { uiEl.innerHTML = titleHtml(); return; }
    if (!G || !M) { uiEl.innerHTML = ''; return; }
    const s = G.s, ph = P ? P.phase : '';
    let h = `<div class="rb-info">${s === 'drive' || s === 'final' ? '' : situation()}</div>`;
    if (s === 'call') {
      const dist = 100 - M.yl + 17;
      const sp = [];
      sp.push(`<button class="rb-b rb-call sp" data-a="call" data-id="fg"><span><i>F</i><b>Field Goal</b></span><small>${dist} yards</small></button>`);
      sp.push(`<button class="rb-b rb-call sp" data-a="call" data-id="punt"><span><i>P</i><b>Punt</b></span><small>Give up the ball</small></button>`);
      if ((M.q === 2 || M.q === 4) && M.clock <= 75) sp.push(`<button class="rb-b rb-call sp" data-a="call" data-id="spike"><span><i>S</i><b>Spike</b></span><small>Stop the clock</small></button>`);
      if (M.q === 4 && M.sc[0] > M.sc[1] && M.down < 4 && M.clock <= 180) sp.push(`<button class="rb-b rb-call sp" data-a="call" data-id="kneel"><span><i>K</i><b>Kneel</b></span><small>Run out the clock</small></button>`);
      h += `<div class="rb-calls pl">${CALLS.map((id, i) => callBtn(id, i + 1)).join('')}</div><div class="rb-calls spr">${sp.join('')}</div>`;
    } else if (s === 'pre') {
      h += `${bt('snap', 'SNAP (SPACE)', 'pri big')}${bt('back', 'CHANGE PLAY', '')}`;
    } else if (s === 'pat') {
      h += `${bt('pat', 'KICK EXTRA POINT (1)', 'pri', 'data-v="xp"')}${bt('pat', 'GO FOR 2: PASS (2)', '', 'data-v="two"')}${bt('pat', 'GO FOR 2: RUN (3)', '', 'data-v="tworun"')}`;
    } else if (s === 'live' && P) {
      if (ph === 'hold' && (P.type === 'pass' || P.type === 'two')) {
        h += P.recv.map((e, i) => bt('throw', `${i + 1} ${esc(e.pl.n)}`, 'sm', `data-i="${i}"`)).join('');
      } else if (ph === 'run') {
        h += `${bt('juke', 'JUKE (J / SWIPE)', 'pri')}${bt('dive', 'DIVE (SPACE / TAP)', 'red')}`;
      } else if (P.kk && P.kk.state === 'charge') {
        h += `${bt('aim', 'AIM LEFT', 'sm', 'data-d="-1"')}${bt('kick', 'KICK (SPACE)', 'pri big')}${bt('aim', 'AIM RIGHT', 'sm', 'data-d="1"')}`;
      }
    }
    uiEl.innerHTML = h;
  }

  function chooseCall(id) {
    if (G.s !== 'call') return;
    const sp = SPECIAL[id];
    if (sp && sp.kind === 'spike') {
      M.down++; M.clock = Math.max(0, M.clock - 1); snd('whistle');
      G.s = 'koff';
      if (M.down > 4) { setPoss(1, 100 - M.yl); banner('TURNOVER ON DOWNS', 'Spike on 4th down', UI.red, 1.5, nextSnap); return; }
      M.togo = M.firstYl - M.yl;
      banner('SPIKE', 'Clock stopped', '#fff', 1, nextSnap);
      return;
    }
    if (sp && sp.kind === 'kneel') {
      M.down++; M.clock = Math.max(0, M.clock - 40); M.yl = Math.max(1, M.yl - 1); M.togo = M.firstYl - M.yl; snd('tackle');
      G.s = 'koff';
      banner('KNEEL', 'Clock runs', '#fff', 1, nextSnap);
      return;
    }
    const call = PLAYS[id] || sp;
    if (!call) return;
    setupPlay(call);
    G.call = call; G.s = 'pre';
    G.hint = P.kind === 'fg' ? 'SNAP, THEN DRAG UP TO KICK OR HOLD SPACE' : P.kind === 'punt' ? 'SNAP, THEN DRAG UP TO PUNT' : 'TAP THE FIELD OR PRESS SPACE TO SNAP';
    snd('hut');
    renderUI();
  }

  function snap() {
    if (G.s !== 'pre' || !P) return;
    G.s = 'live'; G.resolving = false;
    snapPlay();
    renderUI();
  }

  function tickPlay(dt) {
    if (!P || !P.snapped) return;
    P.t += dt;
    if (P.kind === 'fg' || P.kind === 'punt' || P.kind === 'xp') kickTick(dt); else liveTick(dt);
  }

  function resolveLive() {
    const res = P.res;
    if (G.pat) { resolvePat(res); return; }
    const kk = res.kind === 'fg' || res.kind === 'punt';
    let burn = kk ? 5 : res.stopClock ? clamp(P.t * 0.7 + 3, 3, 8) : clamp(P.t + 7, 7, 16);
    if (res.td) burn = Math.min(burn, M.clock);
    M.clock = Math.max(0, M.clock - burn);
    if (P.injured) { G.injNote = P.injured.n + ' (' + P.injured.pos + ') hurt'; }
    const ev = applyUserPlay(res);
    if (ev.snd) snd(ev.snd);
    if (res.kind === 'int' || res.kind === 'fumble') snd('groan');
    if (ev.td) snd('cheer');
    const sub = (ev.sub || '') + (P.injured ? ' · ' + P.injured.n + ' is injured' : '');
    banner(ev.head, sub, ev.col, ev.td ? 2.2 : 1.5, () => follow(ev));
    G.s = 'koff';
    P = null;
    renderUI();
  }

  function follow(ev) {
    if (M.ot && M.sc[0] !== M.sc[1]) { M.over = true; finishGame(); return; }
    switch (ev.next) {
      case 'pat': startPat(); break;
      case 'kickoff': kickoffFor(1); break;
      case 'drive_k': kickoffFor(0); break;
      case 'safety': freeKick(1); break;
      case 'otwin': M.over = true; finishGame(); break;
      default: nextSnap();
    }
  }

  function startPat() {
    G.s = 'pat'; P = null; G.hint = '';
    renderUI();
  }
  function doPat(kind) {
    if (G.s !== 'pat') return;
    M.down = 1;
    if (kind === 'xp') { M.yl = 85; M.firstYl = 100; setupPlay({ kind: 'xp' }); G.pat = 'xp'; }
    else if (kind === 'two') { M.yl = 98; M.firstYl = 100; setupPlay({ ...PLAYS.p1, kind: 'two' }); G.pat = 'two'; }
    else { M.yl = 98; M.firstYl = 100; setupPlay(PLAYS.r1); G.pat = 'two'; }
    G.s = 'pre';
    G.hint = kind === 'xp' ? 'SNAP, THEN DRAG UP TO KICK' : 'TWO-POINT TRY: SNAP IT';
    snd('hut');
    renderUI();
  }
  function resolvePat(res) {
    const xp = G.pat === 'xp', ok = xp ? !!res.good : !!res.td;
    if (ok) addPts(0, xp ? 1 : 2);
    G.pat = null; G.s = 'koff'; P = null;
    if (!ok) snd('groan');
    banner(xp ? (ok ? 'EXTRA POINT GOOD' : 'EXTRA POINT MISSED') : (ok ? 'TWO-POINT GOOD' : 'TWO-POINT FAILED'), scoreTxt(), ok ? UI.green : UI.red, 1.3, () => { if (M.ot) { M.over = true; finishGame(); } else kickoffFor(1); });
    renderUI();
  }

  function runOppDrive() {
    G.s = 'drive'; P = null;
    const dr = simOppDrive();
    G.dr = dr;
    const opp = G.tr;
    const cls = l => l.td || l.fg ? 'x' : l.bad ? 's' : l.pts && !l.td && !l.fg ? 's' : l.first ? 'f' : '';
    const lines = dr.lines.map(l => `<div class="${l.pts && (dr.res === 'pick6' || dr.res === 'safety') ? 's' : cls(l)}"><em>${ordinal(l.down)} &amp; ${Math.max(1, l.togo)} · ${yardTxt(l.yl, false)}</em>${esc(l.txt)}</div>`).join('');
    const res = RES_TXT[dr.res] || 'DRIVE OVER';
    popEl.hidden = false;
    popEl.innerHTML = `<h3>${esc(opp.city.toUpperCase())} DRIVE</h3><p>${dr.plays} PLAYS · ${dr.yds} YARDS · ${clockTxt(dr.secs)} · <b style="color:${dr.res === 'td' || dr.res === 'fg' ? '#ff5a4d' : dr.res === 'clock' ? '#ffe14d' : '#5fe36b'}">${res}</b> · SCORE ${scoreTxt()}</p><div class="rb-pl">${lines}</div><div class="rb-row"><button class="rb-b pri" data-a="dcont">CONTINUE (SPACE)</button></div>`;
    renderUI();
    if (dr.res === 'td' || dr.res === 'fg') snd('groan');
    else if (dr.res === 'int' || dr.res === 'fum' || dr.res === 'downs' || dr.res === 'pick6' || dr.res === 'safety' || dr.res === 'miss') snd('cheer');
  }
  function afterDrive() {
    const dr = G.dr;
    popEl.hidden = true; popEl.innerHTML = '';
    if (M.ot && M.sc[0] !== M.sc[1]) M.over = true;
    if (M.over) { finishGame(); return; }
    const r = dr.res;
    if (r === 'td' || r === 'fg') { kickoffFor(0); return; }
    if (r === 'pick6') { kickoffFor(1); return; }
    if (r === 'safety') { freeKick(0); return; }
    nextSnap();
  }

  function commitGame() {
    const ng = userNextGame(F);
    if (!ng) return;
    const g = ng.g, mine = g.h === F.tid;
    g.hs = mine ? M.sc[0] : M.sc[1]; g.as = mine ? M.sc[1] : M.sc[0]; g.done = true; g.ot = M.ot;
    if (F.phase === 'reg') recordResult(F, g, true);
    postGame(F, M);
    simOthers(F);
    advanceWeek(F);
  }

  function simRest() {
    const tot = M.qlen * 4;
    const left = (4 - M.q) * M.qlen + M.clock;
    const f = clamp(left / tot, 0, 1);
    const me = effTeam(F, T(F.tid)), op = effTeam(F, G.tr);
    const r = simScore({ off: me.off, def: me.def }, { off: op.off, def: op.def });
    M.sc[0] += Math.round(r.hs * f); M.sc[1] += Math.round(r.as * f);
    if (M.sc[0] === M.sc[1]) { if (chance(0.5)) M.sc[0] += 3; else M.sc[1] += 3; }
    M.td += Math.round(r.A.td * f);
    M.over = true; M.simmed = true;
    popEl.hidden = true; popEl.innerHTML = '';
    G.paused = false; P = null;
    finishGame();
  }

  function leaders() {
    const best = (k, want) => {
      let bp = null, bv = 0;
      F.roster.forEach(p => { const v = (p.st[k] || 0) - ((M.snap[p.id] || {})[k] || 0); if (v > bv) { bv = v; bp = p; } });
      return bp ? bp.n + ' ' + bv + ' ' + want : '-';
    };
    return { py: best('py', 'PASS YDS'), ry: best('ry', 'RUSH YDS'), rc: best('ryd', 'REC YDS') };
  }

  function finishGame() {
    G.s = 'final'; P = null; G.banner = null; G.after = null;
    const win = M.sc[0] > M.sc[1], tie = M.sc[0] === M.sc[1];
    let sum = null;
    if (!G.quick) { commitGame(); sum = M.summary; saveF(); apiRef.score(F.wins); apiRef.submit(F.wins); }
    else { apiRef.score(M.sc[0]); apiRef.submit(M.sc[0] - M.sc[1] > 0 ? M.sc[0] - M.sc[1] : 0); }
    snd(win ? 'fanfare' : tie ? 'whistle' : 'groan');
    const me = G.tl, op = G.tr, lead = leaders(), st = M.st;
    const fin = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
    popEl.hidden = false;
    popEl.innerHTML = `<h3>FINAL · ${win ? 'YOU WIN!' : tie ? 'TIE GAME' : 'YOU LOSE'}${M.ot ? ' (OT)' : ''}</h3><p>${esc(tname(me))} ${M.sc[0]} - ${M.sc[1]} ${esc(tname(op))}${M.simmed ? ' · REST OF THE GAME SIMULATED' : ''}</p><div class="rb-stats">${fin('YOUR PASS YDS', st[0].pass)}${fin('YOUR RUSH YDS', st[0].rush)}${fin('YOUR TURNOVERS', st[0].to)}${fin('YOUR FIRST DOWNS', st[0].first)}${fin('OPP PASS YDS', st[1].pass)}${fin('OPP RUSH YDS', st[1].rush)}${fin('OPP TURNOVERS', st[1].to)}${fin('OPP FIRST DOWNS', st[1].first)}</div><p>PASSING: ${esc(lead.py)} · RUSHING: ${esc(lead.ry)} · RECEIVING: ${esc(lead.rc)}</p>${sum ? `<p>REWARDS: +${sum.credits} COACHING CREDITS · FANS ${sum.fan >= 0 ? '+' : ''}${Math.round(sum.fan)} · OWNER ${sum.owner >= 0 ? '+' : ''}${sum.owner}${sum.inj.length ? ' · INJURIES: ' + esc(sum.inj.join(', ')) : ''}</p>` : '<p>QUICK GAME: NOTHING IS SAVED</p>'}<div class="rb-row"><button class="rb-b pri big" data-a="afterfinal">CONTINUE (SPACE)</button></div>`;
    if (sum) notice = (win ? 'WIN ' : tie ? 'TIE ' : 'LOSS ') + M.sc[0] + '-' + M.sc[1] + ' vs ' + tname(op) + ' · +' + sum.credits + ' credits';
    renderUI();
  }

  function simSeason(toPlayoffs) {
    let guard = 0;
    while (F.phase === 'reg' && guard++ < 40) {
      if (userNextGame(F)) simWholeWeek(F, true); else { simOthers(F); advanceWeek(F); }
    }
    if (!toPlayoffs) {
      while (F.phase === 'po' && guard++ < 80) {
        if (userNextGame(F)) simWholeWeek(F, true); else { simOthers(F); advanceWeek(F); }
      }
    }
  }
  const lastResult = () => F.news.find(x => /^(WIN|LOSS|TIE)/.test(x)) || '';

  function signFA(p) {
    p.sal = p.ask; p.yrs = p.askYrs; p.mor = 75;
    F.fa = F.fa.filter(x => x !== p); F.roster.push(p);
  }
  function act(a, d, el) {
    snd('click');
    switch (a) {
      case 'continue': if (!F && !loadSave()) return; go('home'); break;
      case 'newf': PV = null; setupSel = ri(0, 31); setupQuick = false; go('setup'); break;
      case 'quick': PV = null; setupSel = ri(0, 31); setupQuick = true; go('setup'); break;
      case 'pickteam': setupSel = +d.id; renderMenu(); break;
      case 'coach': setupCoach = +d.v; renderMenu(); break;
      case 'go': go(d.v); break;
      case 'ql': SET.ql = +d.v; saveF(); renderMenu(); break;
      case 'diff': SET.diff = +d.v; saveF(); renderMenu(); break;
      case 'snd': SET.snd = !SET.snd; saveF(); renderMenu(); break;
      case 'wipe':
        if (confirmId === 'wipe') { apiRef.save({ v: 1, F: null, SET }); F = null; confirmId = null; renderMenu(); }
        else { confirmId = 'wipe'; renderMenu(); }
        break;
      case 'startf': {
        const pv = PV; PV = null; setupQuick = false;
        F = newFranchise(setupSel, COACHES[setupCoach], SET, pv);
        saveF();
        notice = 'Welcome, ' + F.coach + '. Win games, earn coaching credits and build a champion.';
        go('home', true);
        break;
      }
      case 'startq': {
        const pv = PV; PV = null; setupQuick = false;
        realF = F;
        F = newFranchise(setupSel, COACHES[setupCoach], SET, pv);
        const ng = userNextGame(F);
        beginGame(ng.opp, ng.home, true, false, false);
        break;
      }
      case 'fired': F = null; apiRef.save({ v: 1, F: null, SET }); PV = null; setupSel = ri(0, 31); go('setup'); break;
      case 'play': { const ng = userNextGame(F); if (!ng) return; beginGame(ng.opp, ng.home, false, F.phase === 'po', ng.neutral); break; }
      case 'sim': {
        const s = simWholeWeek(F, true);
        notice = lastResult() + (s ? ' · +' + s.credits + ' credits' : '');
        go('home', true); break;
      }
      case 'simplay': simSeason(true); notice = 'Regular season simulated. ' + (T(F.tid).w) + '-' + T(F.tid).l + ' final record.'; go('home', true); break;
      case 'simseason': simSeason(false); notice = 'Season simulated.'; go('home', true); break;
      case 'simnext': {
        if (userNextGame(F)) simWholeWeek(F, true); else { simOthers(F); advanceWeek(F); }
        notice = 'Round simulated.'; go('home', true); break;
      }
      case 'offseason': startOffseason(F); go('home'); break;
      case 'tab': posTab = d.v; renderMenu(); break;
      case 'dtab': draftTab = d.v; renderMenu(); break;
      case 'cut': {
        const id = +d.id;
        if (confirmId === id) {
          const p = F.roster.find(x => x.id === id);
          F.roster = F.roster.filter(x => x.id !== id); confirmId = null;
          notice = 'Released ' + (p ? p.n : '') + '.'; saveF(); go(menuName, true);
        } else { confirmId = id; renderMenu(); }
        break;
      }
      case 'sign': {
        const p = F.fa.find(x => x.id === +d.id);
        if (!p) return;
        if (F.roster.length >= ROSTER_MAX) { notice = 'Roster is full. Release someone first.'; renderMenu(); return; }
        if (payroll(F) + p.ask > capOf(F)) { notice = 'Not enough cap space.'; renderMenu(); return; }
        signFA(p);
        notice = 'Signed ' + p.n + ' (' + p.pos + ' ' + p.ovr + ') for ' + money(p.sal) + '.'; snd('buy'); saveF(); renderMenu();
        break;
      }
      case 'autofill': {
        let n = 0;
        for (const pos of POS) {
          while (F.roster.length < ROSTER_MAX && F.roster.filter(x => x.pos === pos).length < START[pos] + (pos === 'K' || pos === 'P' ? 0 : 1)) {
            const c = F.fa.filter(x => x.pos === pos && payroll(F) + x.ask <= capOf(F)).sort((a, c2) => c2.ovr / (c2.ask + 1) - a.ovr / (a.ask + 1) + (c2.ovr - a.ovr) * 0.02)[0];
            if (!c) break;
            signFA(c); n++;
          }
        }
        notice = n ? 'Signed ' + n + ' free agent' + (n > 1 ? 's' : '') + ' to fill the empty spots.' : 'Nobody needed.'; if (n) snd('buy'); saveF(); renderMenu();
        break;
      }
      case 'up': {
        const k = d.id, lv = F.fac[k], c = facCost(lv);
        if (lv >= 5 || F.credits < c) return;
        F.credits -= c; F.fac[k] = lv + 1;
        notice = FAC.find(x => x[0] === k)[1] + ' upgraded to level ' + (lv + 1) + '.'; snd('buy'); saveF(); renderMenu();
        break;
      }
      case 'resign': {
        const r = F.resign.find(x => x.p.id === +d.id), y = +d.y;
        if (!r || r.signed || r.refuse) return;
        r.p.sal = r.ask[y - 1]; r.p.yrs = y; r.signed = true; F.roster.push(r.p);
        notice = 'Re-signed ' + r.p.n + '.'; snd('buy'); saveF(); renderMenu();
        break;
      }
      case 'todraft': F.phase = 'draft'; draftRunToUser(F); saveF(); go('draft'); break;
      case 'draft': {
        const p = F.draft.pros.find(x => x.id === +d.id);
        if (!p || F.draft.picks[F.draft.i].team !== F.tid) return;
        draftTake(F, p, F.tid); draftRunToUser(F);
        notice = 'Drafted ' + p.n + ' (' + p.pos + ').'; snd('buy'); saveF(); renderMenu();
        break;
      }
      case 'draftsim': draftRunToUser(F); saveF(); renderMenu(); break;
      case 'draftauto': endDraft(F); saveF(); renderMenu(); break;
      case 'tofa': beginFreeAgency(F); saveF(); go('fa'); break;
      case 'startseason': {
        const iss = rosterIssues(F);
        if (iss.length) { notice = iss.join(' '); renderMenu(); return; }
        startSeason(F); saveF(); notice = F.year + ' season. Good luck, coach.'; go('home', true);
        break;
      }
      case 'call': chooseCall(d.id); break;
      case 'snap': snap(); break;
      case 'back': if (G.s === 'pre') { if (G.pat) { startPat(); } else toCall(); } break;
      case 'pat': doPat(d.v); break;
      case 'throw': if (P && P.phase === 'hold') throwToRecv(P.recv[+d.i]); break;
      case 'juke': { const k = inp.keys; tryJuke(((k.has('ArrowRight') || k.has('KeyD')) ? 1 : 0) - ((k.has('ArrowLeft') || k.has('KeyA')) ? 1 : 0), ((k.has('ArrowDown') || k.has('KeyS')) ? 1 : 0) - ((k.has('ArrowUp') || k.has('KeyW')) ? 1 : 0)); break; }
      case 'dive': tryDive(); break;
      case 'kick': kickRelease(); break;
      case 'aim': if (P && P.kk) P.kk.aim = clamp(P.kk.aim + (+d.d) * 0.25, -1, 1); break;
      case 'dcont': afterDrive(); break;
      case 'afterfinal': popEl.hidden = true; popEl.innerHTML = ''; if (G.quick) toTitle(); else go('home', true); break;
      case 'gmenu':
        if (!G || G.s === 'drive' || G.s === 'final') return;
        G.paused = true; popEl.hidden = false;
        popEl.innerHTML = `<h3>GAME MENU</h3><p>${scoreTxt()} · ${M.ot ? 'OT' : 'Q' + M.q} ${clockTxt(M.clock)}</p><div class="rb-row"><button class="rb-b pri" data-a="gresume">RESUME</button><button class="rb-b" data-a="simrest">SIM REST OF GAME</button><button class="rb-b red" data-a="quitgame">QUIT (GAME DOES NOT COUNT)</button></div>`;
        break;
      case 'gresume': G.paused = false; popEl.hidden = true; popEl.innerHTML = ''; break;
      case 'simrest': simRest(); break;
      case 'quitgame': popEl.hidden = true; popEl.innerHTML = ''; if (G.quick) toTitle(); else go('home'); break;
    }
    if (el && el.blur) el.blur();
  }

  function onKey(e) {
    const k = e.code;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    inp.keys.add(k);
    if (scene === 'title') {
      if (k === 'Enter' || k === 'Space') { e.preventDefault(); act(hasSave() || F ? 'continue' : 'newf', {}); }
      return;
    }
    if (scene !== 'game' || !G) return;
    if (k === 'Space' || k.startsWith('Arrow')) e.preventDefault();
    if (e.repeat) return;
    if (G.paused) { if (k === 'Space' || k === 'Enter') popEl.querySelector('.pri') && popEl.querySelector('.pri').click(); return; }
    if (G.s === 'drive' || G.s === 'final') {
      if (k === 'Space' || k === 'Enter') { const b2 = popEl.querySelector('.pri'); if (b2) b2.click(); }
      return;
    }
    const dig = /^(Digit|Numpad)(\d)$/.exec(k), n = dig ? +dig[2] : 0;
    if (G.s === 'call') {
      if (n >= 1 && n <= 6) chooseCall(CALLS[n - 1]);
      else if (k === 'KeyF') chooseCall('fg');
      else if (k === 'KeyP') chooseCall('punt');
      else if (k === 'KeyS' && (M.q === 2 || M.q === 4) && M.clock <= 75) chooseCall('spike');
      else if (k === 'KeyK' && M.q === 4 && M.sc[0] > M.sc[1] && M.down < 4 && M.clock <= 180) chooseCall('kneel');
    } else if (G.s === 'pat') {
      if (n === 1) doPat('xp'); else if (n === 2) doPat('two'); else if (n === 3) doPat('tworun');
    } else if (G.s === 'pre') {
      if (k === 'Space' || k === 'Enter') snap();
      else if (k === 'Backspace' || k === 'Escape') { if (!G.pat) toCall(); }
    } else if (G.s === 'live' && P) {
      const ph = P.phase;
      if (ph === 'hold' && n >= 1 && n <= 5) throwToRecv(P.recv[n - 1]);
      else if (ph === 'run') {
        if (k === 'KeyJ' || k === 'ShiftLeft' || k === 'ShiftRight') act('juke', {});
        else if (k === 'Space') tryDive();
      } else if (P.kk && P.kk.state === 'charge' && k === 'Space') kickRelease();
    }
  }
  function onKeyUp(e) { inp.keys.delete(e.code); }

  function ptrWorld(e) {
    const p = view.toLocal(e), bx = p.x / 2, by = p.y / 2;
    return { lx: p.x, ly: p.y, bx, by, wx: (bx + camX) / SX, wy: (by - FY0) / SY };
  }
  function onPtrDown(e) {
    e.preventDefault();
    actx();
    if (scene !== 'game' || !G || G.paused) return;
    try { view.canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const w = ptrWorld(e), now = performance.now();
    const q = P && P.qb;
    inp.ptr = { down: true, id: e.pointerId, ...w, x0: w.lx, y0: w.ly, wx0: w.wx, wy0: w.wy, t0: now, dragging: false, scr: false, steer: false, dragUp: 0, dragDX: 0, samples: [{ t: now, x: w.bx, y: w.by }], kick: false, snapped: false, nearQB: !!q && Math.hypot(w.wx - q.x, (w.wy - q.y) * 1.4) < 6 };
    const p = inp.ptr;
    if (G.s === 'pre') { snap(); p.snapped = true; return; }
    if (G.s === 'live' && P && P.kk && P.kk.state === 'charge') p.kick = true;
  }
  function onPtrMove(e) {
    const p = inp.ptr;
    if (!p || e.pointerId !== p.id) return;
    const w = ptrWorld(e), now = performance.now();
    p.lx = w.lx; p.ly = w.ly; p.bx = w.bx; p.by = w.by; p.wx = w.wx; p.wy = w.wy;
    if (Math.hypot(w.lx - p.x0, w.ly - p.y0) > 14) p.dragging = true;
    if (!G || G.s !== 'live' || !P) return;
    if (P.phase === 'hold' && p.dragging && p.nearQB && !p.scr && P.type === 'pass') p.scr = true;
    p.dragUp = p.y0 - w.ly; p.dragDX = w.lx - p.x0;
    if (P.phase === 'run') {
      p.samples.push({ t: now, x: w.bx, y: w.by });
      while (p.samples.length > 1 && now - p.samples[0].t > 120) p.samples.shift();
      const s0 = p.samples[0], d = Math.hypot(w.bx - s0.x, w.by - s0.y);
      if (d > 24 && now - s0.t < 130) { tryJuke((w.bx - s0.x) / SX, (w.by - s0.y) / SY); p.samples = [{ t: now, x: w.bx, y: w.by }]; p.dragging = true; }
    }
  }
  function onPtrUp(e) {
    const p = inp.ptr;
    if (!p || e.pointerId !== p.id) return;
    inp.ptr = null;
    if (!G || G.s !== 'live' || !P || p.snapped) return;
    const dt = performance.now() - p.t0;
    if (P.phase === 'hold' && (P.type === 'pass' || P.type === 'two') && !p.scr) {
      if (p.dragging) { const a = aimAssist(p.wx, p.wy); throwBall(a.x, a.y, a.tgt); }
      else { const r = recvAt(p.wx0, p.wy0, 11); if (r) throwToRecv(r); }
    } else if (P.phase === 'run' && !p.dragging && dt < 280) tryDive();
    else if (p.kick && P.kk && P.kk.state === 'charge') kickRelease();
  }

  function updateGame(dt) {
    if (G.banner) {
      G.banner.t -= dt;
      if (G.banner.t <= 0) { const cb = G.after; G.after = null; G.banner = null; if (cb) cb(); }
    }
    if (!G) return;
    if (G.s === 'live' && P) {
      if (inp.ptr) inp.ptr.steer = P.phase === 'run';
      const n = dt > 0.028 ? 2 : 1;
      for (let i = 0; i < n; i++) tickPlay(dt / n);
      if (P.phase === 'over' && !G.resolving) {
        const r = P.res, wait = r.td ? 2 : r.kind === 'fg' || r.kind === 'xp' ? 1.3 : r.kind === 'punt' ? 1 : 0.85;
        if (P.deadT > wait) { G.resolving = true; resolveLive(); }
      }
    }
    if (G) {
      const key = G.s + ':' + (P ? P.phase + (P.kk ? P.kk.state : '') : '');
      if (key !== G.uiKey) { G.uiKey = key; renderUI(); }
    }
  }

  function setupDom(api, rootEl) {
    stageEl = document.createElement('div'); stageEl.className = 'rb-stage';
    rootEl.append(stageEl);
    view = api.canvas(960, 540, stageEl);
    popEl = document.createElement('div'); popEl.className = 'rb-pop'; popEl.hidden = true;
    const mb = document.createElement('button');
    mb.className = 'rb-b sm'; mb.dataset.a = 'gmenu'; mb.textContent = 'MENU'; mb.style.cssText = 'position:absolute;right:6px;bottom:6px;z-index:4;opacity:.85';
    stageEl.append(popEl, mb);
    uiEl = document.createElement('div'); uiEl.className = 'rb-ui';
    menuEl = document.createElement('div'); menuEl.className = 'rb-menu'; menuEl.hidden = true;
    rootEl.append(uiEl, menuEl);
    stageEl.__mb = mb;
  }

  Ameplay.register({
    id: ID,
    title: 'Retro Bowl',
    category: 'Sports',
    tint: '#e8a317',
    blurb: 'Pixel football and franchise management. Call plays, throw the ball, win the Retro Bowl.',
    help: 'Pick a play · <kbd>Space</kbd> or tap to snap · tap a receiver or <kbd>1</kbd>-<kbd>5</kbd> to throw, drag to aim · arrows steer, <kbd>J</kbd> or swipe to juke, <kbd>Space</kbd> or tap to dive · drag up to kick',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="50" height="50" rx="11" opacity=".3"/><ellipse cx="32" cy="32" rx="19" ry="11" transform="rotate(-35 32 32)" fill="currentColor" fill-opacity=".25"/><path d="M26 38l12-12M29 29l6 6M32 26l6 6M25 32l6 6"/></svg>',
    css: CSS,
    mount(rootEl, api) {
      apiRef = api; root = rootEl;
      F = null; M = null; P = null; G = null; scene = 'title'; realF = null; PV = null;
      setupDom(api, rootEl);
      try { const d = api.load(); if (d && d.SET) Object.assign(SET, d.SET); } catch (e) {}
      mutedFn = () => api.muted || !SET.snd;
      api.on(rootEl, 'click', e => {
        const el = e.target.closest('[data-a]');
        if (!el || el.disabled) return;
        act(el.dataset.a, el.dataset, el);
      });
      api.on(window, 'keydown', onKey);
      api.on(window, 'keyup', onKeyUp);
      api.on(window, 'blur', () => inp.keys.clear());
      const cv = view.canvas;
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('pointerdown', onPtrDown);
      cv.addEventListener('pointermove', onPtrMove);
      cv.addEventListener('pointerup', onPtrUp);
      cv.addEventListener('pointercancel', onPtrUp);
      api.loop(dt => {
        if (scene === 'game' && G && !G.paused) updateGame(dt);
        if (scene === 'game' || scene === 'title') {
          stageEl.__mb.hidden = scene !== 'game' || !G || G.s === 'drive' || G.s === 'final';
          render(dt);
        }
      });
      toTitle();
      api.label('Wins');
      api.score(0);
    }
  });
window.__rb={w2s:(x,y)=>{const r=view.canvas.getBoundingClientRect();return {x:r.left+((x*SX-camX)*2)*r.width/960,y:r.top+((FY0+y*SY)*2)*r.height/540}},PLAYS,setupPlay,snapPlay,tickPlay,tryJuke,tryDive,throwToRecv,beginGame,get P(){return P},get M(){return M},get G(){return G},get F(){return F},set F(v){F=v},get SET(){return SET},inp,openness,simSeason,go,startOffseason:()=>startOffseason(F),renderMenu,saveF,loadSave};
})();
