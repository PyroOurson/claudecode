
(() => {
  'use strict';

  const H = v => v / 4096;
  const CFG = {
    W: 256, H: 240, HZ: 60,
    minWalk: H(0x130), walkAcc: H(0x98), runAcc: H(0xE4), relDec: H(0xD0), skidDec: H(0x1A0), skidTurn: H(0x900),
    maxWalk: H(0x1900), maxRun: H(0x2900), runTimer: 10, airDecThr: H(0x1D00),
    jumpSpd: [H(0x1000), H(0x2500)],
    jumpV: [H(0x4000), H(0x4000), H(0x5000)],
    jumpHeld: [H(0x200), H(0x1E0), H(0x280)],
    jumpFall: [H(0x700), H(0x600), H(0x900)],
    maxFall: H(0x4800), fallReset: H(0x4000), bonkV: 1,
    stompV: 4, springLo: 7, springHi: 12,
    eSpeed: 0.5, eGrav: 0.3125, eMaxFall: 4, shellSpeed: 3, shellWake: 300, hopV: 4, hopGrav: 0.1875,
    itemSpeed: 1, itemRise: 0.5, starV: 4.5, starGrav: 0.25,
    fbSpeed: 4, fbDown: 4, fbBounce: 3, fbGrav: 0.3125, fbMax: 2,
    bulletSpeed: 1, podV: 5, podGrav: 0.15625, flameSpeed: 1.5,
    timerFrames: 24, hurryAt: 100, invFrames: 150, starFrames: 720, multiCoinFrames: 240,
    stompPts: [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000],
    shellPts: [500, 800, 1000, 2000, 4000, 5000, 8000],
    flagPts: [[136, 5000], [120, 2000], [80, 800], [48, 400], [-99, 100]],
    coinPts: 200, brickPts: 50, itemPts: 1000, kickPts: 400, bossPts: 5000, timePts: 50, fireworkPts: 500,
    bossHp: 5, scrollX: 112
  };

  const T = { E: 0, GND: 1, BRK: 2, QC: 3, QP: 4, USED: 5, HARD: 6, PTL: 7, PTR: 8, PBL: 9, PBR: 10, HC: 11, H1: 12, BMC: 13, BS: 14, BP: 15, COIN: 16, LAVA: 17, TREE: 18, TREEL: 19, TREER: 20, TRUNK: 21, BRIDGE: 22, AXE: 23, CANT: 24, CANB: 25, B1: 26, SPT: 27, SPB: 28, SBT: 29, SBB: 30, LAVT: 31, CHAIN: 32 };
  const SOLID = new Uint8Array(40);
  [T.GND, T.BRK, T.QC, T.QP, T.USED, T.HARD, T.PTL, T.PTR, T.PBL, T.PBR, T.BMC, T.BS, T.BP, T.TREE, T.TREEL, T.TREER, T.BRIDGE, T.CANT, T.CANB, T.B1, T.SPT, T.SPB, T.SBT, T.SBB].forEach(t => SOLID[t] = 1);
  const CH = { B: T.BRK, '?': T.QC, M: T.QP, U: T.USED, X: T.HARD, h: T.HC, u: T.H1, C: T.BMC, S: T.BS, P: T.BP, L: T.B1, o: T.COIN, '#': T.GND, '~': T.LAVA, '=': T.BRIDGE, A: T.AXE, K: T.CANT, k: T.CANB, T: T.TREE, '<': T.TREEL, '>': T.TREER, '|': T.TRUNK, '.': T.E };

  const NES = { sky: '#5C94FC', blk: '#000000', wht: '#FCFCFC', brn: '#C84C0C', lt: '#FCBCB0', org: '#FC9838', gold: '#F8B800', grn: '#00A800', lgrn: '#80D010', dgrn: '#005800', red: '#D82800', ored: '#F83800', lava: '#FCA044', gry: '#7C7C7C', lgry: '#BCBCBC', teal: '#008888', lteal: '#9CFCF0', navy: '#0000BC', skin: '#FCBCB0', tan: '#FCE4A0', pur: '#940084', blu: '#3CBCFC' };
  const KIND = {
    over: { sky: NES.sky, a: NES.lt, b: NES.brn, k: NES.blk, walker: [NES.brn, NES.blk, NES.lt] },
    tree: { sky: NES.sky, a: NES.lt, b: NES.brn, k: NES.blk, walker: [NES.brn, NES.blk, NES.lt] },
    under: { sky: NES.blk, a: NES.lteal, b: NES.teal, k: NES.blk, walker: ['#0070EC', NES.blk, NES.lteal] },
    bonus: { sky: NES.blk, a: NES.lteal, b: NES.teal, k: NES.blk, walker: ['#0070EC', NES.blk, NES.lteal] },
    castle: { sky: NES.blk, a: NES.lgry, b: NES.gry, k: NES.blk, walker: [NES.gry, NES.blk, NES.lgry] }
  };
  const HERO_PAL = { a: '#D82800', d: '#887000', c: '#FC9838' };
  const FIRE_PAL = { a: '#FCE4A0', d: '#D82800', c: '#FC9838' };
  const STAR_PALS = [HERO_PAL, FIRE_PAL, { a: '#00A800', d: '#000000', c: '#FC9838' }, { a: '#000000', d: '#C84C0C', c: '#FCBCB0' }];

  const FONT = {
    '0': '384CC6C6C66438', '1': '1838181818187E', '2': '7CC60E3C78E0FE', '3': '7E0C183C06C67C', '4': '1C3C6CCCFE0C0C',
    '5': 'FCC0FC0606C67C', '6': '3C60C0FCC6C67C', '7': 'FEC60C18303030', '8': '78C4E4789E867C', '9': '7CC6C67E060C78',
    A: '386CC6C6FEC6C6', B: 'FCC6C6FCC6C6FC', C: '3C66C0C0C0663C', D: 'F8CCC6C6C6CCF8', E: 'FEC0C0FCC0C0FE', F: 'FEC0C0FCC0C0C0',
    G: '3E60C0CEC6663E', H: 'C6C6C6FEC6C6C6', I: '7E18181818187E', J: '1E060606C6C67C', K: 'C6CCD8F0F8DCCE', L: 'C0C0C0C0C0C0FE',
    M: 'C6EEFEFED6C6C6', N: 'C6E6F6FEDECEC6', O: '7CC6C6C6C6C67C', P: 'FCC6C6C6FCC0C0', Q: '7CC6C6C6DECC7A', R: 'FCC6C6CEF8DCCE',
    S: '78CCC07C06C67C', T: '7E181818181818', U: 'C6C6C6C6C6C67C', V: 'C6C6C6EE7C3810', W: 'C6C6D6FEFEEEC6', X: 'C6EE7C387CEEC6',
    Y: '6666663C181818', Z: 'FE0E1C3870E0FE', '-': '0000007C000000', '*': '00C66C386CC600', '!': '183C3C18180018', '.': '00000000003030',
    '@': '7C82BAA2BA827C', ':': '00303000303000', '?': '7CC60C18180018', ',': '00000000303060', "'": '18183000000000', '/': '060C183060C000', ' ': '00000000000000'
  };

  const grid = (w, h) => ({ w, h, d: new Array(w * h).fill('') });
  const gs = (g, x, y, ch) => { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.d[y * g.w + x] = ch; };
  const gget = (g, x, y) => (x >= 0 && y >= 0 && x < g.w && y < g.h) ? g.d[y * g.w + x] : '';
  const gEll = (g, cx, cy, rx, ry, ch) => { for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const u = (x + .5 - cx) / rx, v = (y + .5 - cy) / ry; if (u * u + v * v <= 1) g.d[y * g.w + x] = ch; } };
  const gRect = (g, x0, y0, x1, y1, ch) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) gs(g, x, y, ch); };
  const gPoly = (g, pts, ch) => {
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      let ins = false; const px = x + .5, py = y + .5;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ins = !ins; }
      if (ins) g.d[y * g.w + x] = ch;
    }
  };
  const gOut = (g, ch) => { const s = g.d.slice(); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { if (s[y * g.w + x]) continue; const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < g.w && yy < g.h && s[yy * g.w + xx]; if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) g.d[y * g.w + x] = ch; } };
  const art = rows => { const g = grid(rows[0].length, rows.length); rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] !== '.') g.d[y * g.w + x] = r[x]; }); return g; };
  const gFlipV = g => { const n = grid(g.w, g.h); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) n.d[(g.h - 1 - y) * g.w + x] = g.d[y * g.w + x]; return n; };

  const SMALL = {
    stand: ['......aaaaa.....', '.....aaaaaaaaa..', '.....dddccdc....', '....dcdcccdccc..', '....dcddcccdccc.', '....ddccccdddd..', '......ccccccc...', '.....ddaddd.....', '....dddaddaddd..', '...ddddaaaadddd.', '...ccdacaacadcc.', '...cccaaaaaaccc.', '...ccaaaaaaaacc.', '.....aaa..aaa...', '....ddd....ddd..', '...dddd....dddd.'],
    w1: ['......aaaaa.....', '.....aaaaaaaaa..', '.....dddccdc....', '....dcdcccdccc..', '....dcddcccdccc.', '....ddccccdddd..', '......ccccccc...', '....ddddaad.c...', '..cdddddaaadcc..', '.ccddddaaaaacc..', '.cc.aaacaacaa...', '....aaaaaaaaaa..', '...aaaaaaaaaaa..', '..ddaaa...aaa...', '..ddd......ddd..', '...dd......dddd.'],
    w2: ['......aaaaa.....', '.....aaaaaaaaa..', '.....dddccdc....', '....dcdcccdccc..', '....dcddcccdccc.', '....ddccccdddd..', '......ccccccc...', '.....ddaadd.....', '....dddadaddd...', '....ddaacaaddd..', '....ddaaaaaccc..', '.....dccaaaccd..', '......caaaaaad..', '.......aaaaa....', '.......ddd......', '.......dddd.....'],
    w3: ['......aaaaa.....', '.....aaaaaaaaa..', '.....dddccdc....', '....dcdcccdccc..', '....dcddcccdccc.', '....ddccccdddd..', '......ccccccc...', '.....ddaddd.....', '....ddddaaddd...', '....ddcaaaaddd..', '.....ccaacaaccc.', '......aaaaaaccd.', '.....aaaaaaaadd.', '....aaaa.aaaa...', '....ddd...ddd...', '....dddd...dddd.'],
    jump: ['.............ccc', '......aaaaa..ccc', '.....aaaaaaaaacc', '.....dddccdc.ddd', '....dcdcccdccddd', '....dcddcccdcccd', '....ddccccddddd.', '......ccccccccd.', '..ddddaddddad...', '.ddddddaddda...d', 'cccdddddaaaaa..d', 'ccc..aacaaacaadd', '.c.daaaaaaaaaddd', '..ddaaaaaaaaaddd', '.dddaaaaaaa.....', '.d..aaaa........'],
    skid: ['.......aaaaa....', '.....aaaaaaaaa..', '....dddccdcc....', '...dcdcccdccc...', '...dcddcccdccc..', '...ddccccdddd...', '.....cccccccdd..', '....dddaaddddcc.', '...dddddaaadacc.', '..ddddaaaaaaa...', '..aaccaacaaa....', '..aacccaaaaa....', '...accaaaaaa....', '....aaaaaaaa....', '....dd..ddd.....', '...ddd...ddd....'],
    die: ['.....aaaaaa.....', '..cc.aaaaaa.cc..', '.ccc.dcddcd.ccc.', '.cccdcdccdcdccc.', '.dd.dccddccd.dd.', '..d.cccccccc.d..', '..dd.cdddddcdd..', '...dd.cccccdd...', '....ddaaaadd....', '....dacaacad....', '...aaaaaaaaaa...', '...aaaaaaaaaa...', '....aaaaaaaa....', '....aaa..aaa....', '...ddd....ddd...', '..dddd....dddd..']
  };
  const BIG = {
    stand: ['.....aaaaaa.....', '....aaaaaaaaaa..', '...aaaaaaaaaaaa.', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '...dcccccdddd...', '....ccccccccc...', '.....ccccccc....', '....dddaaddd....', '...ddddaadddd...', '..dddddaaddaddd.', '.ddddddaaaaadddd', '.dddddaaaaaaaddd', 'ccdddaacaacaaddc', 'cccdaaaaaaaaadcc', 'cccaaaaaaaaaaacc', '..aaaaaaaaaaaa..', '..aaaaaaaaaaaa..', '..aaaaa..aaaaa..', '..aaaaa..aaaaa..', '..aaaa....aaaa..', '..aaaa....aaaa..', '..aaaa....aaaa..', '..aaaa....aaaa..', '..aaaa....aaaa..', '..aaaa....aaaa..', '.ddddd....ddddd.', 'dddddd....dddddd', 'dddddd....dddddd', '................'],
    w1: ['.....aaaaaa.....', '....aaaaaaaaaa..', '...aaaaaaaaaaaa.', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '...dcccccdddd...', '....ccccccccc...', '.....ccccccc....', '....dddaaddd....', '...ddddaadddd...', '..dddddaaddadd..', '.ddddddaaaaaddcc', 'cdddddaaaaaaadcc', 'ccddaaacaacaaacc', 'ccc.aaaaaaaaaa..', '.c..aaaaaaaaaa..', '...aaaaaaaaaaaa.', '..aaaaaaaaaaaaa.', '..aaaaaa..aaaaaa', '.aaaaaa....aaaaa', '.aaaaa......aaaa', 'aaaaa.......aaaa', 'aaaa.........aaa', 'aaaa.........aaa', 'aaa..........ddd', 'ddd.........dddd', 'dddd........dddd', 'dddd........ddd.', '.ddd............', '................'],
    w2: ['.....aaaaaa.....', '....aaaaaaaaaa..', '...aaaaaaaaaaaa.', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '...dcccccdddd...', '....ccccccccc...', '.....ccccccc....', '....dddaaddd....', '...ddddaadddd...', '...dddaadaadd...', '...ddaaaaaaddd..', '...ddaaaaaaddd..', '...ccaacaacaccc.', '...ccaaaaaaaccc.', '....caaaaaaaacc.', '....aaaaaaaaa...', '....aaaaaaaaa...', '.....aaaaaaaa...', '.....aaaa.aaa...', '.....aaaa.aaa...', '.....aaaa.aaa...', '.....aaa..aaa...', '.....aaa..aaa...', '.....aaa..aaa...', '.....aaa..aaa...', '....dddd.dddd...', '....ddddddddd...', '....dddd.dddd...', '................'],
    w3: ['.....aaaaaa.....', '....aaaaaaaaaa..', '...aaaaaaaaaaaa.', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '...dcccccdddd...', '....ccccccccc...', '.....ccccccc....', '....dddaaddd....', '...ddddaadddd...', '..dddddaaddadd..', '..ddddaaaaaaddd.', '..dcccaaaaaaddd.', '..ccccaacaacaccc', '..cccaaaaaaaaccc', '...caaaaaaaaaa..', '...aaaaaaaaaaa..', '...aaaaaaaaaaaa.', '...aaaaaa.aaaaa.', '..aaaaaa...aaaa.', '..aaaaa....aaaa.', '..aaaa.....aaaa.', '..aaaa......aaa.', '..aaa.......aaa.', '.ddd........ddd.', 'dddd.......dddd.', 'dddd.......ddddd', '.ddd........dddd', '................', '................'],
    jump: ['.....aaaaaa..ccc', '....aaaaaaaaaccc', '...aaaaaaaaaaacc', '...dddcccdcc.ddd', '..dccdcccdcccddd', '..dccddcccdcccdd', '..ddccccddddddd.', '...dcccccddddd..', '....cccccccccd..', '.....cccccccdd..', '..ddddddaaddddd.', '.dddddddaaddddd.', 'ddddddddaaadddd.', 'ddddddaaaaaaddd.', 'cccdaaaaaaaaaa..', 'cccaacaacaaaaa..', 'ccaaaaaaaaaaaa..', '.caaaaaaaaaaaa..', '..aaaaaaaaaaaaa.', '..aaaaaaa.aaaaaa', '.aaaaaaa...aaaaa', '.aaaaaa.....aaaa', 'aaaaaa.......aaa', 'aaaaa........ddd', 'aaaa.........ddd', 'dddd........dddd', 'dddd........dddd', 'ddddd...........', '.dddd...........', '..ddd...........', '................', '................'],
    skid: ['....aaaaaa......', '..aaaaaaaaaa....', '.aaaaaaaaaaaa...', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '..dccccccdddd...', '....ccccccccc...', '.....ccccccc....', '..dddddaaddd....', 'dddddddaadddd...', 'ccdddddaadddd...', 'cccddaaaaaaddd..', 'cccaaaaaaaaadd..', '...aacaacaacac..', '...aaaaaaaaaccc.', '...aaaaaaaaaacc.', '...aaaaaaaaaaa..', '...aaaaaaaaaa...', '..aaaaaaaaaa....', '.aaaaa..aaaa....', '.aaaa....aaaa...', '.aaaa....aaaa...', '.aaa......aaaa..', '.aaa.......aaa..', '.dddd.......ddd.', '.ddddd......dddd', '..dddd......dddd', '.............dd.', '................', '................'],
    crouch: ['.....aaaaaa.....', '....aaaaaaaaaa..', '...aaaaaaaaaaaa.', '...dddcccdcc....', '..dccdcccdcccc..', '..dccddcccdcccc.', '..ddccccdddddd..', '...dcccccdddd...', '..dddcccccccdd..', '.ddddddaaddddd..', 'ccdddddaaaaddcc.', 'cccddaacaacaaccc', '.ccaaaaaaaaaacc.', '..aaaaaaaaaaaa..', '.aaaaaaaaaaaaaa.', 'aaaaa......aaaaa', 'dddd........dddd', 'ddddd......ddddd']
  };
  const GOOMBA = ['......aaaa......', '.....aaaaaa.....', '....aaaaaaaa....', '...aaaaaaaaaa...', '..abbaaaaaabba..', '.aaacbbaabbcaaa.', '.aaacbcaacbcaaa.', 'aaaacbcaacbcaaaa', 'aaaacccaacccaaaa', 'aaaaaaaaaaaaaaaa', '.aaaaccccccaaaa.', '....cccccccc....', '...bbcccccccc...', '..bbbbbccccbb...', '..bbbbbbccbbbb..', '...bbbbb.bbbbb..'];
  const GFLAT = ['................', '................', '................', '................', '................', '................', '................', '................', '.....aaaaaa.....', '...aaaaaaaaaa...', '.aabbbaaaabbbaa.', 'aaaaacbaabcaaaaa', 'aaaaaaaaaaaaaaaa', '....cccccccc....', '..bbbbbccbbbbb..', '.bbbbbb..bbbbbb.'];
  const KOOPA0 = ['....ccc.........', '...ccccc........', '..cbbbcc........', '..cbabcc........', '.ccbabccc.......', '.ccbbbccc.......', 'ccccccccc.......', 'cccccccc........', '.acccccc........', '..aacccc........', '....cccc........', '.....ccc.aaaaa..', '.....cc.abbbbaa.', '....ccbabaaabbaa', '....ccbaabaaabaa', '...cccbaaababbaa', '...ccbbaaabbbbaa', '....cbbbaaabaaba', '.....cbbbbbaaaba', '......cbbbbbbbaa', '.......ccbbbbba.', '......ccccc.ccc.', '.....cccccc.cccc', '.....ccccc..cccc'];
  const KOOPA1 = ['....ccc.........', '...ccccc........', '..cbbbcc........', '..cbabcc........', '.ccbabccc.......', '.ccbbbccc.......', 'ccccccccc.......', 'cccccccc........', '.acccccc........', '..aacccc........', '....cccc........', '.....ccc.aaaaa..', '.....cc.abbbbaa.', '....ccbabaaabbaa', '....ccbaabaaabaa', '...cccbaaababbaa', '...ccbbaaabbbbaa', '....cbbbaaabaaba', '.....cbbbbbaaaba', '......cbbbbbbbaa', '.......cbbbbbba.', '........cccc.cc.', '.......ccccc.ccc', '.......cccc.cccc'];
  const SHELL = ['................', '................', '.....aaaaaa.....', '...aabbbbbbaa...', '..abaaaabaaaaba.', '.abaaaabbaaaaaba', '.baaaaabbaaaaaab', 'abaaaabaabaaaaba', 'abaaabaaaabaaaba', 'abbbbaaaaaabbbba', 'abaaabaaaabaaaba', '.baaaabbbbaaaab.', '.bbbbbbbbbbbbbb.', '..cbbbbbbbbbbc..', '...cccccccccc...', '................'];
  const SHELLPK = ['................', '................', '.....aaaaaa.....', '...aabbbbbbaa...', '..abaaaabaaaaba.', '.abaaaabbaaaaaba', '.baaaaabbaaaaaab', 'abaaaabaabaaaaba', 'abaaabaaaabaaaba', 'abbbbaaaaaabbbba', 'abaaabaaaabaaaba', '.baaaabbbbaaaab.', '.bbbbbbbbbbbbbb.', '.ccbbbbbbbbbbcc.', 'ccc.cccccccc.ccc', 'cc............cc'];
  const WING0 = ['.......bbb......', '......bbbbb.....', '.....bbabbb.....', '....bbabbbb.....', '...bbabbbbb.....', '...babbbbbb.....', '....bbbbbb......'];
  const WING1 = ['................', '................', '....bbbbbbb.....', '...bbabbbbbbb...', '....bbbabbbbbb..', '.....bbbbbbb....', '......bbbb......'];
  const PIR0 = ['..a..........a..', '.aa..........aa.', '.aac........caa.', 'aaacc......ccaaa', 'aaaacc....ccaaaa', 'abaaacc..ccaaaba', 'aaaaaacccaaaaaaa', '.aabaaaccaaabaa.', '..aaaaaaaaaaaa..', '...aaabaabaaa...', '.....aaaaaa.....', '.......dd.......', '.......dd.......', '.aaa...dd...aaa.', 'aaaaa..dd..aaaaa', 'adaaaa.dd.aaaada', '.adaaaadddaaada.', '..ddaaadddaadd..', '...dddaddaadd...', '.....ddddddd....', '.......dd.......', '.......dd.......', '.......dd.......', '.......dd.......'];
  const PIR1 = ['......aaaa......', '.....acaaca.....', '....aacaacaa....', '...aabcaacbaa...', '...aaacaacaaa...', '..abaacaacaaba..', '..aaaacaacaaaa..', '..aaaacaacaaaa..', '...abaccccabaa..', '....aaaccaaaa...', '.....aaaaaa.....', '.......dd.......', '.......dd.......', '.aaa...dd...aaa.', 'aaaaa..dd..aaaaa', 'adaaaa.dd.aaaada', '.adaaaadddaaada.', '..ddaaadddaadd..', '...dddaddaadd...', '.....ddddddd....', '.......dd.......', '.......dd.......', '.......dd.......', '.......dd.......'];
  const MUSH = ['................', '................', '.....aaaaaa.....', '...aaaccccaaa...', '..aaccccccccaa..', '.acaaccccccaaca.', '.ccaaaccccaaacc.', 'accaaaaaaaaaacca', 'accaaaaaaaaaacca', 'acaaaaaaaaaaaaca', 'aaaddddddddddaaa', '.aadddbddbdddaa.', '...dddbddbddd...', '...dddbddbddd...', '...dddddddddd...', '....dddddddd....'];
  const FLOWER = ['......aaaa......', '..aaaabbbbaaaa..', '.aabbbccccbbbaa.', 'aabbccccccccbbaa', '.aabbbccccbbbaa.', '..aaaabbbbaaaa..', '......aaaa......', '.......dd.......', '..dd...dd...dd..', '.dddd..dd..dddd.', '.ddddd.dd.ddddd.', '..ddddddddddddd.', '...dddddddddd...', '....dddddddd....', '.......dd.......', '.......dd.......'];
  const STARM = ['.......aa.......', '.......aa.......', '......aaaa......', '......aaaa......', '.....aaaaaa.....', 'aaaaaaacaaaaaaaa', '.aaaaaaaaaaaaaa.', '..aaaaabaabaaa..', '...aaaabaabaaa..', '....aaabaabaa...', '....aaaaaaaaa...', '...aaaaaaaaaaa..', '...aaaaa.aaaaa..', '..aaaa.....aaaa.', '..aaa.......aaa.', '.aa...........aa'];
  const BILL = ['......aaaaaaccc.', '....aaaaaaaacccc', '...aaaaaaaaacccc', '..aabbbaaaaaccc.', '.aabbabbaaaacccc', '.aabaabbaaaacccc', 'aaabbbbaaaaacccc', 'aaaaaaaaaaaacccc', 'aaaaaaaaaaaacccc', 'aaabbbbaaaaacccc', 'aaaaaabbaaaacccc', '.aaaaaaaaaaacccc', '.aaaaaaaaaaacccc', '..aaaaaaaaaaccc.', '....aaaaaaaacccc', '......aaaaaaccc.'];
  const BOWSER0 = ['....dbd....dbd..................', '....dbbd..dbbd....d.............', '...dbbbdddbbbd...dbd..d.........', '...dbeeeeeeebdd..dbd.dbd...d....', '..daeeaaaaaeeeaddbbd.dbbd.dbd...', '.daaeebbbbaeeeaadbbbddbbddbbd...', '.daaaabbbbaaaaaabbbbabbbbdbbd...', 'daaaaaddbbaaaaaaaaaaaaaaaabbbd..', 'daaaaaddbbaaaaaaaaaaaaaaaaabd...', 'cccccaddbbaaaaaaaaaaaaaaaaaabdd.', 'cdcccccaaaaaaaaaaaaaaaaaaaaaabbd', 'ccccccccaaaaaaaaaaaaaaaaaaaaabbb', 'cccccccccaaaaaaaaaaaaaaaaaaaabdd', 'ddddddddcaaaaaaaaaaaaaaaaaaaaad.', 'cbccbcccaaaaaaacccaaaaaaaaaaabdd', 'dccccccaaaaaafffffaaaaaaaaaaabbb', '.ddccddccccccccccccaaaaaaaaaabbd', '...dddcccccccccccccaaaaaaaaaabd.', '...dcccccfffffffffcaaaaaaaaaabdd', '..dbccccccccccccccccaaaaaaaabbbb', '..dccccccccccccccccaaaaaaaabbbbd', '..dbcccccfffffffffcaaaaaaabbddd.', '...dcccccccccccccccaaaaabbdd....', '...dbdcdccccccccccbbbbbbbaaadd..', '....d.ddffffffffffddcccccccaaad.', '........dcccccccdd.dcccccccaaaad', '........dcccccccd..dcccccccaddd.', '........dcccccccd..dcccccccd....', '........dcccccccd..dcccccccd....', '........dcccccccd..dcccccccd....', '........dbbdbbdbbd.dbbdbbdbbd...', '........dbbdbbdbbd.dbbdbbdbbd...'];
  const BOWSER1 = ['....dbd....dbd..................', '....dbbd..dbbd....d.............', '...dbbbdddbbbd...dbd..d.........', '...dbeeeeeeebdd..dbd.dbd...d....', '..daeeaaaaaeeeaddbbd.dbbd.dbd...', '.daaeebbbbaeeeaadbbbddbbddbbd...', '.daaaabbbbaaaaaabbbbabbbbdbbd...', 'daaaaaddbbaaaaaaaaaaaaaaaabbbd..', 'daaaaaddbbaaaaaaaaaaaaaaaaabd...', 'cccccaddbbaaaaaaaaaaaaaaaaaabdd.', 'cdcccccaaaaaaaaaaaaaaaaaaaaaabbd', 'ccccccccaaaaaaaaaaaaaaaaaaaaabbb', 'bddbddbdcaaaaaaaaaaaaaaaaaaaabdd', 'ddddddddcaaaaaaaaaaaaaaaaaaaaad.', 'dbddbdddaaaaaaacccaaaaaaaaaaabdd', 'dccccccaaaaaafffffaaaaaaaaaaabbb', '.ddccddccccccccccccaaaaaaaaaabbd', '...dddcccccccccccccaaaaaaaaaabd.', '...dcccccfffffffffcaaaaaaaaaabdd', '..dbccccccccccccccccaaaaaaaabbbb', '..dccccccccccccccccaaaaaaaabbbbd', '..dbcccccfffffffffcaaaaaaabbddd.', '...dcccccccccccccccaaaaabbdd....', '...dbdcdccccccccccbbbbbbbaaadd..', '....d.ddffffffffffdddcccccccaad.', '.......dccccccccdd..dcccccccaaad', '.......dcccccccd....dcccccccddd.', '.......dcccccccd....dcccccccd...', '.......dcccccccd....dcccccccd...', '.......dcccccccd....dcccccccd...', '.......dbbdbbdbbd...dbbdbbdbbd..', '.......dbbdbbdbbd...dbbdbbdbbd..'];
  const TOAD = ['...ddaaaaaadd...', '..daaaaaaaaaad..', '.daaaabbbbaaaad.', 'daaaabbbbbbaaaad', 'bbaaabbbbbbaaabb', 'bbbaaabbbbaaabbb', 'bbbaaaaaaaaaabbb', 'bbaaaaaaaaaaaabb', 'aaaaaaaaaaaaaaaa', 'aaaaaaccccaaaaaa', 'dddaccccccccaddd', '..dccccccccccd..', '..dcccdccdcccd..', '..dcccdccdcccd..', '..dccccccccccd..', '...dccccccccd...', '..deeeaaaaeeed..', '.dcceeaaaaeeccd.', '.dcceeaaaaeeccd.', '.dcceeaaaaeeccd.', '..deeeaaaaeeed..', '..deeeeeeeeeed..', '...dfffddfffd...', '...dfffddfffd...'];
  const PEACH = ['.....d..d.d.....', '....deddeded....', '....deeeeeed....', '....deeeeeed....', '...daaaaaaaad...', '...daaaaaaaad...', '...dccccccccd...', '..daccdccdccad..', '..daccccccccad..', '.daaaccffccaaad.', '.daaaccccccaaad.', '.daaaaaaaaaaaad.', '.daaaaffffaaaad.', '.daabbffffbbaad.', '.daccbffffbccad.', '.daccbffffbccad.', '.daccbbbbbbccad.', '..dbbbbbbbbbbd..', '..dbbbbbbbbbbd..', '..dbffffffffbd..', '..dbbbbbbbbbbd..', '.dbbbbbbbbbbbbd.', '.dbbbbbbbbbbbbd.', '.dbbbbbbbbbbbbd.'];
  const E16 = '................';

  function buildGrids() {
    const S = {};
    const flipH = rows => rows.map(r => r.split('').reverse().join(''));
    for (const k in SMALL) S['s_' + k] = art(SMALL[k]);
    for (const k in BIG) S['b_' + k] = art(BIG[k]);
    S.walker0 = art(GOOMBA); S.walker1 = art(flipH(GOOMBA)); S.walkerF = art(GFLAT);
    S.snail0 = art(KOOPA0); S.snail1 = art(KOOPA1);
    S.shell = art(SHELL); S.shellPeek = art(SHELLPK);
    S.wing0 = art(WING0); S.wing1 = art(WING1);
    S.plant0 = art(PIR0); S.plant1 = art(PIR1);
    S.bullet = art(BILL);
    S.boss0 = art(BOWSER0); S.boss1 = art(BOWSER1);
    S.berry = art(MUSH); S.pepper = art(FLOWER); S.gem = art(STARM);
    for (const [n, rx] of [['coin0', 4.6], ['coin1', 3.2], ['coin2', 1.2], ['coin3', 3.2]]) {
      const g = grid(16, 16); gEll(g, 8, 8, rx + 1, 7.2, 'b'); gEll(g, 8, 8, rx, 6.2, 'a');
      if (rx > 2) { gRect(g, 7, 4, 9, 12, 'b'); gs(g, 6, 3, 'c'); gs(g, 6, 4, 'c'); }
      S[n] = g;
    }
    const fb = grid(8, 8); gEll(fb, 4, 4, 3.6, 3.6, 'a'); gEll(fb, 4, 4, 2.4, 2.4, 'b'); gs(fb, 3, 3, 'c'); gs(fb, 4, 3, 'c'); gs(fb, 1, 1, 'a');
    S.fb = fb;
    const pod = grid(16, 16); gEll(pod, 8, 9, 6.5, 6.5, 'a'); gEll(pod, 8, 9.5, 4.5, 4.8, 'b'); gPoly(pod, [[4, 4], [8, 0], [12, 4]], 'a'); gRect(pod, 5, 8, 7, 11, 'c'); gRect(pod, 9, 8, 11, 11, 'c'); gs(pod, 6, 9, 'a'); gs(pod, 10, 9, 'a');
    S.pod = pod;
    const flame = f => { const g = grid(24, 8); gPoly(g, [[0, 4], [6, 0], [24, 2 + f], [16, 4], [24, 6 - f], [6, 8]], 'a'); gPoly(g, [[2, 4], [7, 2], [16, 4], [7, 6]], 'b'); gRect(g, 3, 3, 7, 5, 'c'); return g; };
    S.flame0 = flame(0); S.flame1 = flame(1);
    S.npc = art(TOAD); S.princess = art(PEACH);
    const flag = grid(16, 16); gPoly(flag, [[16, 0], [16, 16], [0, 1]], 'a'); gRect(flag, 9, 4, 14, 9, 'b'); gRect(flag, 9, 6, 14, 7, 'a'); gRect(flag, 11, 4, 12, 6, 'a'); gRect(flag, 12, 7, 13, 9, 'a');
    S.flag = flag;
    S.bean = art(['..dd..', '.daad.', 'daaaad', 'daaaad', '.daad.', '..dd..']);
    return S;
  }
  const GRIDS = buildGrids();

  function area(kind, w, extra) {
    const a = Object.assign({ kind, w, map: new Uint8Array(w * 15), spawns: [], pipes: [], flag: 0, castle: 0, axe: null, bridge: null, npc: 0, labels: [], camMax: 0 }, extra || {});
    const set = (x, y, t) => { if (x >= 0 && x < w && y >= 0 && y < 15) a.map[y * w + x] = t; };
    const B = {
      a,
      gnd(x0, x1, top = 13) { for (let x = x0; x <= x1; x++) for (let y = top; y < 15; y++) set(x, y, T.GND); return B; },
      fill(x0, y0, x1, y1, t) { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) set(x, y, t); return B; },
      row(x, y, s) { for (let i = 0; i < s.length; i++) if (s[i] !== ' ') set(x + i, y, CH[s[i]]); return B; },
      pipe(x, top, o = {}) {
        set(x, top, T.PTL); set(x + 1, top, T.PTR);
        for (let y = top + 1; y <= (o.bot || 12); y++) { set(x, y, T.PBL); set(x + 1, y, T.PBR); }
        if (o.plant) B.e('plant', x, top - 1);
        if (o.to) a.pipes.push({ k: 'down', x, y: top, to: o.to });
        return B;
      },
      side(x, y, to, top = 2) {
        set(x, y - 1, T.SPT); set(x, y, T.SPB); set(x + 1, y - 1, T.SBT); set(x + 1, y, T.SBB);
        for (let yy = top; yy <= y; yy++) { set(x + 2, yy, T.PBL); set(x + 3, yy, T.PBR); }
        a.pipes.push({ k: 'side', x, y, to });
        return B;
      },
      stair(x, n, dir = 1, base = 12) { for (let i = 0; i < n; i++) { const h = dir > 0 ? i + 1 : n - i; for (let k = 0; k < h; k++) set(x + i, base - k, T.HARD); } return B; },
      e(t, x, y = 12, o) { a.spawns.push({ t, x: x * 16, y: (y + 1) * 16, o: o || {}, done: false }); return B; },
      tree(x, y, n) { set(x, y, T.TREEL); set(x + n - 1, y, T.TREER); for (let i = 1; i < n - 1; i++) set(x + i, y, T.TREE); for (let yy = y + 1; yy < 15; yy++) for (let i = 1; i < n - 1; i++) set(x + i, yy, T.TRUNK); return B; },
      lift(x, y, kind, o) { return B.e('lift', x, y - 1, Object.assign({ kind, w: 3, rng: 64, spd: 0.02, ph: 0 }, o || {})); },
      spring(x, y) { return B.e('spring', x, y); },
      fbar(x, y, n = 6, spd = 0.05, a0 = 0) { set(x, y, T.USED); return B.e('firebar', x, y, { n, spd, a0 }); },
      cannon(x, y, h = 1) { set(x, y, T.CANT); for (let k = 1; k < h; k++) set(x, y + k, T.CANB); return B.e('cannon', x, y); },
      lava(x0, x1) { for (let x = x0; x <= x1; x++) { set(x, 13, T.LAVT); set(x, 14, T.LAVA); } return B; },
      pod(x, d = 0) { return B.e('pod', x, 14, { d }); },
      flag(x) { a.flag = x; set(x, 12, T.HARD); a.castle = x + 4; return B; },
      label(x, y, s) { a.labels.push({ x, y, s }); return B; },
      boss(x0, x1, axe, by, o) {
        for (let x = x0; x <= x1; x++) set(x, by, T.BRIDGE);
        set(x1, by - 1, T.CHAIN);
        a.bridge = { x0, x1, y: by }; a.axe = { x: x1 + 1, y: by - 1 }; set(x1 + 1, by - 1, T.AXE);
        a.camMax = (x1 + 4) * 16 - 256;
        return B.e('boss', x1 - 4, by - 1, Object.assign({ x0: (x0 + 3) * 16, x1: (x1 - 2) * 16, fire: 150 }, o || {}));
      }
    };
    return B;
  }

  function bonusRoom(back, extra) {
    const B = area('bonus', 16);
    B.gnd(0, 15).fill(0, 2, 0, 12, T.BRK).fill(3, 2, 11, 2, T.BRK).fill(3, 10, 10, 12, T.BRK);
    B.row(3, 9, 'oooooooo').row(3, 7, 'oooooooo').row(4, 5, 'oooooo');
    if (extra) B.row(3, 4, extra);
    B.side(12, 12, back);
    return B.a;
  }
  function exitArea(time) {
    const B = area('over', 40);
    B.gnd(0, 39).pipe(2, 11).stair(8, 8, 1).fill(16, 5, 16, 12, T.HARD).flag(26);
    return B.a;
  }

  const LEVELS = [
    { name: '1-1', time: 400, mid: 82, build() {
      const B = area('over', 212);
      B.gnd(0, 68).gnd(71, 85).gnd(89, 152).gnd(155, 211);
      B.row(16, 9, '?').row(20, 9, 'B?BMB').row(22, 5, '?').e('walker', 23);
      B.pipe(28, 11).pipe(38, 10).e('walker', 41).pipe(46, 9).e('walker', 50).e('walker', 51.5);
      B.pipe(57, 9, { to: { a: 1, x: 1.5, y: 3, out: 'drop' } });
      B.row(64, 8, 'u');
      B.row(77, 9, 'B?B').row(80, 5, 'BBBBBBBB').e('walker', 82, 4).e('walker', 84, 4);
      B.row(91, 5, 'BBB?').row(94, 9, 'C').e('walker', 97).e('walker', 98.5).row(100, 9, 'BS');
      B.row(106, 9, '?').row(109, 9, '?').row(109, 5, 'M').row(112, 9, '?').e('snail', 107);
      B.row(118, 9, 'B').row(121, 5, 'BBB').e('walker', 114).e('walker', 115.5).e('walker', 124).e('walker', 125.5);
      B.row(128, 5, 'B??B').row(129, 9, 'BB');
      B.stair(134, 4, 1).stair(140, 4, -1).stair(148, 4, 1).fill(152, 9, 152, 12, T.HARD).stair(155, 4, -1);
      B.pipe(163, 11).row(168, 9, 'BB?B').e('walker', 172).e('walker', 173.5).pipe(179, 11);
      B.stair(181, 8, 1).fill(189, 5, 189, 12, T.HARD).flag(198);
      return [B.a, bonusRoom({ a: 0, x: 163, y: 11, out: 'up' })];
    } },
    { name: '1-2', time: 400, mid: 92, build() {
      const B = area('under', 190);
      B.gnd(0, 79).gnd(82, 87).gnd(90, 119).gnd(128, 189).fill(0, 2, 0, 12, T.BRK).fill(6, 2, 140, 2, T.BRK).fill(147, 2, 189, 2, T.BRK);
      B.row(10, 9, 'M????').e('walker', 15).e('walker', 16.5);
      B.fill(22, 11, 23, 12, T.HARD).fill(26, 9, 27, 12, T.HARD).fill(30, 7, 31, 12, T.HARD).row(30, 6, 'oo').e('walker', 28).e('walker', 34);
      B.row(36, 9, 'BBCBBBB').row(36, 5, 'BBBBBBB').e('snail', 40, 8);
      B.row(46, 8, 'BBBBBPBB').row(47, 6, 'oooooo').e('walker', 49, 7).e('walker', 51, 7).e('snail', 56);
      B.pipe(62, 10, { plant: 1 }).e('walker', 66).pipe(68, 9, { plant: 1 }).e('walker', 71.5).pipe(74, 10, { plant: 1 });
      B.e('snail', 84, 12, { red: 1 });
      B.row(92, 9, 'BBBB').row(92, 5, 'BLBB').e('walker', 96).e('walker', 97.5).e('walker', 99);
      B.fill(102, 7, 102, 10, T.BRK).fill(103, 10, 108, 10, T.BRK).fill(109, 7, 109, 10, T.BRK).row(103, 9, 'oooooo').row(105, 6, 'C');
      B.e('snail', 112, 12, { red: 1 }).e('walker', 115).e('walker', 116.5);
      B.lift(120.5, 6, 'down', { spd: 1 }).lift(124.5, 12, 'up', { spd: 1 });
      B.pipe(132, 10, { plant: 1 }).row(136, 9, 'BBBB').row(141, 5, 'BBBBBB').row(141, 4, 'oooooo');
      B.e('walker', 148).e('walker', 149.5).e('snail', 153);
      B.side(156, 12, { a: 1, x: 2, y: 11, out: 'up' }, 3);
      B.gnd(160, 189).fill(160, 3, 161, 12, T.BRK).fill(164, 2, 168, 2, T.E);
      B.pipe(171, 10, { to: { level: 4 } }).pipe(176, 10, { to: { level: 5 } }).pipe(181, 10, { to: { level: 6 } });
      B.label(171, 8, '2-1').label(176, 8, '2-2').label(181, 8, '2-3').label(164.5, 5, 'SECRET WARP ZONE!');
      return [B.a, exitArea()];
    } },
    { name: '1-3', time: 300, mid: 83, build() {
      const B = area('tree', 172);
      B.gnd(0, 15);
      B.tree(18, 11, 4).tree(23, 8, 6).row(24, 6, 'oooo').e('walker', 27, 7);
      B.tree(31, 5, 4).row(31, 3, 'oooo').tree(37, 10, 5).e('snail', 40, 9, { red: 1 });
      B.tree(44, 7, 4).lift(48.5, 8, 'h', { rng: 64, spd: 0.025 });
      B.tree(57, 10, 7).e('walker', 60, 9).e('walker', 62, 9).row(58, 6, 'ooooo');
      B.tree(66, 7, 3).tree(71, 11, 5).row(72, 8, 'ooo');
      B.lift(76.5, 7, 'v', { rng: 64, spd: 0.02 });
      B.tree(81, 6, 5).row(82, 4, 'ooo').e('snail', 84, 5, { red: 1 });
      B.tree(88, 9, 4).e('snail', 93, 6, { wing: 'fly', red: 1 }).tree(96, 6, 4);
      B.lift(100.5, 7, 'h', { rng: 72, spd: 0.022 });
      B.tree(111, 9, 5).e('walker', 113, 8).tree(118, 5, 3).row(118, 3, 'ooo');
      B.tree(122, 8, 4).e('snail', 124, 7, { wing: 'hop' });
      B.lift(127.5, 9, 'v', { rng: 48, spd: 0.025 });
      B.tree(132, 7, 6).row(133, 5, 'oooo').tree(140, 10, 4);
      B.gnd(146, 171).stair(148, 6, 1).fill(154, 7, 154, 12, T.HARD).flag(162);
      return [B.a];
    } },
    { name: '1-4', time: 300, castle: 1, build() {
      const B = area('castle', 170);
      B.fill(0, 2, 169, 3, T.GND).fill(0, 8, 13, 14, T.GND).fill(14, 11, 24, 14, T.GND);
      B.lava(25, 27).pod(26).fill(28, 11, 40, 14, T.GND).fbar(33, 7, 6, 0.04).row(37, 7, 'M');
      B.lava(41, 44).pod(42, 40).pod(44, 90).fill(45, 9, 52, 14, T.GND).fbar(49, 5, 6, -0.045);
      B.fill(53, 4, 70, 5, T.GND).fill(53, 11, 70, 14, T.GND).fbar(58, 10, 5, 0.05).fbar(65, 6, 5, -0.05, 3);
      B.lava(71, 74).pod(72).pod(74, 60).fill(75, 10, 90, 14, T.GND).fbar(80, 9, 6, 0.045).fbar(86, 6, 6, -0.045, 1.5).row(83, 6, '?');
      B.lava(91, 97).fill(94, 9, 94, 14, T.GND).pod(92).pod(96, 70);
      B.fill(98, 10, 112, 14, T.GND).fbar(104, 9, 6, 0.06).fill(107, 4, 112, 6, T.GND);
      B.lava(113, 115).pod(114).fill(116, 9, 126, 14, T.GND);
      B.lava(127, 139).boss(127, 139, 1, 9).fill(140, 9, 169, 14, T.GND);
      B.a.npc = 152;
      return [B.a];
    } },
    { name: '2-1', time: 400, mid: 100, build() {
      const B = area('over', 226);
      B.gnd(0, 47).gnd(50, 92).gnd(96, 140).gnd(143, 170).gnd(174, 225);
      B.row(14, 9, 'B?B').row(15, 5, 'M').e('walker', 20).e('walker', 21.5).e('walker', 23);
      B.spring(30, 12).row(26, 3, 'oooooooo').e('snail', 34, 12, { wing: 'hop' }).pipe(38, 10, { plant: 1 });
      B.row(53, 9, 'BB?BB').row(54, 5, 'BBB').e('walker', 55, 4);
      B.cannon(62, 11, 2).e('walker', 66).e('walker', 67.5).e('walker', 69);
      B.pipe(72, 9, { plant: 1 }).pipe(78, 10, { to: { a: 1, x: 1.5, y: 3, out: 'drop' } });
      B.row(84, 9, 'C').e('snail', 86, 12, { red: 1 }).row(88, 5, 'BSBB');
      B.stair(97, 3, 1).e('snail', 103, 12, { wing: 'hop' }).e('snail', 107, 12, { wing: 'hop' });
      B.row(106, 9, '?B?B?').row(108, 5, 'u').e('walker', 112).e('walker', 113.5).e('walker', 115);
      B.cannon(118, 10, 3).pipe(124, 9).e('snail', 128).e('snail', 130, 12, { red: 1 });
      B.row(132, 9, 'BBBBBBB').row(132, 5, 'BB?BBBB').e('walker', 134, 8).e('walker', 136, 4);
      B.cannon(146, 11, 2).cannon(152, 10, 3).row(156, 8, 'BBBB').e('snail', 158, 7, { red: 1 });
      B.spring(162, 12).row(160, 4, 'oooooo').pipe(166, 11);
      B.stair(176, 4, 1).e('walker', 181).e('walker', 182.5).stair(185, 3, -1);
      B.stair(190, 8, 1).fill(198, 5, 198, 12, T.HARD).flag(206);
      return [B.a, bonusRoom({ a: 0, x: 166, y: 11, out: 'up' }, '  oooo  ')];
    } },
    { name: '2-2', time: 400, mid: 100, build() {
      const B = area('under', 180);
      B.gnd(0, 30).gnd(33, 60).gnd(64, 95).gnd(100, 140).gnd(149, 179).fill(0, 2, 0, 12, T.BRK).fill(6, 2, 179, 2, T.BRK);
      B.row(8, 9, '?M?').e('walker', 14).e('walker', 15.5).e('snail', 18, 12, { red: 1 });
      B.pipe(22, 10, { plant: 1 }).pipe(27, 9, { plant: 1 });
      B.cannon(36, 11, 2).row(40, 9, 'BBBBBB').row(40, 5, 'BBCBBB').e('snail', 42, 8, { red: 1 }).e('walker', 44, 4);
      B.e('walker', 48).e('walker', 49.5).e('walker', 51).pipe(54, 10, { plant: 1 }).pipe(58, 9, { plant: 1 });
      B.fill(66, 11, 67, 12, T.BRK).fill(70, 9, 71, 12, T.BRK).fill(74, 7, 75, 12, T.BRK).row(74, 6, 'oo').e('snail', 72, 12, { wing: 'hop' });
      B.row(80, 5, 'BBBBBBBB').row(80, 9, 'B P  B').cannon(86, 10, 3).e('walker', 89).e('walker', 90.5).pipe(92, 9, { plant: 1 });
      B.row(103, 9, 'BBBB').row(103, 5, 'BLBB').e('snail', 106, 12, { red: 1 }).e('walker', 110).e('walker', 111.5).e('walker', 113);
      B.fill(116, 7, 116, 10, T.BRK).fill(117, 10, 122, 10, T.BRK).fill(123, 7, 123, 10, T.BRK).row(117, 9, 'oooooo');
      B.pipe(127, 10, { plant: 1 }).pipe(133, 9, { plant: 1 }).e('snail', 137, 12, { wing: 'hop' });
      B.lift(141.5, 9, 'v', { rng: 64, spd: 0.025 }).lift(145, 9, 'v', { rng: 64, spd: 0.025, ph: 3.1 });
      B.cannon(152, 11, 2).e('walker', 156).e('walker', 157.5).row(160, 9, 'BB?BB');
      B.side(172, 12, { a: 1, x: 2, y: 11, out: 'up' }, 3);
      return [B.a, exitArea()];
    } },
    { name: '2-3', time: 300, mid: 90, build() {
      const B = area('tree', 196);
      B.gnd(0, 14);
      B.tree(17, 10, 3).tree(22, 7, 3).e('snail', 25, 5, { wing: 'fly', red: 1 }).lift(26.5, 8, 'h', { rng: 64, spd: 0.025 });
      B.tree(37, 9, 4).cannon(39, 8, 1).tree(44, 6, 3).tree(49, 10, 5).e('walker', 51, 9).e('walker', 52.5, 9);
      B.lift(55.5, 7, 'fall').lift(60.5, 9, 'fall');
      B.tree(66, 8, 4).e('snail', 68, 7, { wing: 'hop' }).tree(71, 8, 3).spring(72, 7).tree(75, 2, 7).row(76, 1, 'ooooo');
      B.tree(78, 10, 4).lift(83.5, 8, 'v', { rng: 72, spd: 0.022 });
      B.tree(89, 6, 4).e('snail', 90, 5, { red: 1 }).lift(94.5, 6, 'h', { rng: 80, spd: 0.02 });
      B.tree(107, 9, 5).e('walker', 109, 8).e('walker', 110.5, 8).e('snail', 114, 5, { wing: 'fly', red: 1 });
      B.tree(117, 7, 3).tree(122, 10, 4).cannon(124, 9, 1);
      B.lift(127.5, 9, 'fall').lift(132.5, 8, 'fall');
      B.tree(138, 6, 5).e('snail', 140, 5, { wing: 'hop' }).tree(145, 10, 3).lift(149.5, 8, 'h', { rng: 64, spd: 0.025 });
      B.tree(161, 8, 4).gnd(167, 195).stair(170, 8, 1).fill(178, 5, 178, 12, T.HARD).flag(186);
      return [B.a];
    } },
    { name: '2-4', time: 300, castle: 2, build() {
      const B = area('castle', 186);
      B.fill(0, 2, 185, 3, T.GND).fill(0, 8, 12, 14, T.GND).fill(13, 11, 22, 14, T.GND).row(17, 7, 'M');
      B.lava(23, 28).pod(24).pod(27, 50).lift(24, 10, 'h', { rng: 40, spd: 0.03 });
      B.fill(29, 11, 42, 14, T.GND).fbar(34, 10, 6, 0.07).fbar(39, 6, 6, -0.06, 2);
      B.lava(43, 52).pod(45).pod(50, 45).fill(47, 9, 48, 14, T.GND).fbar(47, 8, 5, 0.06);
      B.fill(53, 4, 72, 6, T.GND).fill(53, 11, 72, 14, T.GND).fbar(57, 10, 4, 0.08).fbar(62, 7, 4, -0.08, 2).fbar(67, 10, 4, 0.08, 4);
      B.lava(73, 84).pod(75).pod(79, 30).pod(83, 70).lift(75, 9, 'h', { rng: 96, spd: 0.02 });
      B.fill(85, 10, 104, 14, T.GND).fbar(92, 6, 12, 0.035).row(98, 6, '?');
      B.lava(105, 110).pod(107).fill(111, 10, 122, 14, T.GND).fbar(114, 9, 6, -0.07).fbar(119, 9, 6, 0.07, 3.1);
      B.lava(123, 128).fill(125, 9, 126, 14, T.GND).pod(124).pod(128, 40);
      B.fill(129, 9, 140, 14, T.GND).fill(133, 4, 140, 6, T.GND);
      B.lava(141, 153).boss(141, 153, 1, 9, { fire: 100, jump: 3.6 }).fill(154, 9, 185, 14, T.GND);
      B.a.npc = 166;
      return [B.a];
    } }
  ];

  const tileAt = (A, cx, cy) => cx < 0 || cx >= A.w ? T.HARD : cy < 0 || cy > 14 ? T.E : A.map[cy * A.w + cx];
  const solidAt = (A, cx, cy) => SOLID[tileAt(A, cx, cy)] === 1;
  const setTile = (A, cx, cy, t) => { if (cx >= 0 && cx < A.w && cy >= 0 && cy < 15) A.map[cy * A.w + cx] = t; };
  const ph = p => p.big && !p.crouch ? 32 : 16;
  const ev = (W, n) => W.ev.push(n);
  const rnd = W => (W.rng = (Math.imul(W.rng, 1103515245) + 12345) >>> 0) / 4294967296;
  const rowOf = s => s < CFG.jumpSpd[0] ? 0 : s < CFG.jumpSpd[1] ? 1 : 2;

  function newWorld(li, carry, fromMid, seed) {
    const L = LEVELS[li];
    const W = {
      li, areas: L.build(), ai: 0, A: null, ents: [], fx: [], bumps: [], multi: {},
      cam: 0, frame: 0, time: L.time, tf: 0, hurry: false, timeUp: false,
      score: carry.score || 0, coins: carry.coins || 0, lives: carry.lives == null ? 3 : carry.lives,
      state: 'play', st: 0, tp: 0, result: null, warp: 0, ev: [], prev: 0, rng: (seed >>> 0) || 1, mid: false, pit: false,
      flagY: 48, cflag: 0, fw: 0, fwn: 0, pipe: null, msg: 0, bx: 0,
      p: { x: 40, y: 208, vx: 0, vy: 0, face: 1, big: !!carry.big, fire: !!carry.fire, ground: true, jh: false, g1: CFG.jumpHeld[0], g2: CFG.jumpFall[0], airMax: CFG.maxWalk, jumpSpd: 0, run: 0, crouch: false, skid: false, star: 0, inv: 0, chain: 0, schain: 0, anim: 0, at: 0, lift: null, spring: null, throwT: 0, hide: false, behind: false }
    };
    W.A = W.areas[0];
    const p = W.p, c = fromMid && L.mid ? L.mid : 3;
    let r = 14;
    while (r > 2 && solidAt(W.A, c, r)) r--;
    p.y = (r + 1) * 16;
    if (fromMid && L.mid) {
      p.x = c * 16; W.mid = true;
      W.cam = Math.max(0, p.x - 40);
      for (const s of W.A.spawns) if (s.x < p.x + 40) s.done = true;
    }
    return W;
  }

  function enterArea(W, ai) {
    W.ai = ai; W.A = W.areas[ai]; W.ents = []; W.fx = []; W.bumps = [];
    for (const s of W.A.spawns) s.done = false;
  }

  function addScore(W, pts, x, y) {
    if (pts === 'up') { W.lives++; ev(W, '1up'); } else W.score += pts;
    if (x != null) W.fx.push({ t: 'txt', s: pts === 'up' ? '1UP' : String(pts), x, y, life: 0 });
  }
  const chainPts = (W, tbl, i, x, y) => addScore(W, i < tbl.length ? tbl[i] : 'up', x, y);
  function getCoin(W) {
    W.coins++; W.score += CFG.coinPts; ev(W, 'coin');
    if (W.coins >= 100) { W.coins -= 100; addScore(W, 'up'); }
  }
  function coinPop(W, cx, cy) { getCoin(W); W.fx.push({ t: 'coin', x: cx * 16, y: cy * 16 - 8, vy: -5, life: 0 }); }

  function killPlayer(W, pit) {
    if (W.state === 'die') return;
    const p = W.p;
    W.state = 'die'; W.st = 0; W.pit = !!pit;
    p.big = false; p.fire = false; p.star = 0; p.crouch = false; p.vx = 0; p.vy = 0; p.lift = null; p.spring = null;
    ev(W, 'die');
  }
  function hurt(W) {
    const p = W.p;
    if (p.inv > 0 || p.star > 0 || W.state !== 'play') return;
    if (p.big) { p.big = false; p.fire = false; p.crouch = false; W.state = 'shrink'; W.st = 0; ev(W, 'hurt'); }
    else killPlayer(W, false);
  }

  function step(W, inp) {
    W.ev.length = 0;
    const pr = inp & ~W.prev;
    W.prev = inp;
    W.frame++;
    const p = W.p;
    switch (W.state) {
      case 'play': play(W, inp, pr); break;
      case 'grow': case 'shrink': case 'power':
        if (++W.st >= 50) { if (W.state === 'shrink') p.inv = CFG.invFrames; W.state = 'play'; }
        break;
      case 'die': {
        W.st++;
        if (!W.pit) { if (W.st === 30) p.vy = -4; if (W.st > 30) { p.y += p.vy; p.vy = Math.min(p.vy + 0.25, 4); } }
        if (W.st > (W.pit ? 150 : 190)) { W.state = 'done'; W.result = 'dead'; }
        break;
      }
      case 'pipeIn': {
        const q = W.pipe;
        W.st++;
        if (q.k === 'down') p.y += 1; else { p.x += 0.75; p.at++; if (p.at >= 6) { p.at = 0; p.anim = p.anim % 3 + 1; } }
        if (W.st >= (q.k === 'down' ? 34 : 28)) travel(W, q.to);
        break;
      }
      case 'pipeOut': {
        const q = W.pipe;
        p.y -= 1;
        if (p.y <= q.y * 16) { p.y = q.y * 16; p.behind = false; p.ground = true; W.state = 'play'; }
        break;
      }
      case 'flag': {
        const A = W.A;
        W.flagY = Math.min(W.flagY + 2, 176);
        if (p.y < 192) { p.y = Math.min(p.y + 2, 192); p.at++; if (p.at >= 8) { p.at = 0; p.anim ^= 1; } }
        if (W.flagY >= 176 && p.y >= 192) { W.state = 'flag2'; W.st = 0; p.x = A.flag * 16 + 9; p.face = -1; }
        updFx(W);
        break;
      }
      case 'flag2':
        if (++W.st >= 26) { W.state = 'walk'; W.st = 0; p.face = 1; ev(W, 'clear'); }
        updFx(W);
        break;
      case 'walk': case 'axeWalk': {
        const A = W.A;
        p.vx = 1; p.x += 1; collideX(W);
        const py = p.y; p.y += p.vy; p.ground = false; floorCheck(W, py);
        if (p.ground) p.vy = 0; else p.vy = Math.min(p.vy + CFG.jumpFall[0], 4);
        p.at++; if (p.at >= 6) { p.at = 0; p.anim = p.anim % 3 + 1; }
        if (W.state === 'walk') {
          if (p.x >= (A.castle + 2) * 16) { p.hide = true; W.state = 'tally'; W.st = 0; W.tp = 0; }
        } else {
          camera(W);
          if (p.x >= A.npc * 16 - 36) { p.vx = 0; p.anim = 0; W.state = 'msg'; W.st = 0; }
        }
        updFx(W);
        break;
      }
      case 'axe': axeSeq(W); break;
      case 'msg':
        W.msg = ++W.st;
        if (W.st > 200) { W.state = 'tally'; W.st = 0; W.tp = 0; W.fwn = 0; }
        break;
      case 'tally': tally(W); break;
    }
  }

  function play(W, inp, pr) {
    const p = W.p;
    if (++W.tf >= CFG.timerFrames) {
      W.tf = 0;
      if (W.time > 0) {
        W.time--;
        if (W.time === CFG.hurryAt) { W.hurry = true; ev(W, 'hurry'); }
        if (W.time === 0) { W.timeUp = true; killPlayer(W, false); return; }
      }
    }
    if (p.inv > 0) p.inv--;
    if (p.star > 0) p.star--;
    for (const e of W.ents) if (e.t === 'lift' || e.t === 'spring') UPD[e.t](W, e);
    player(W, inp, pr);
    if (W.state !== 'play') return;
    for (let i = 0; i < W.ents.length; i++) { const e = W.ents[i]; if (!e.gone && e.t !== 'lift' && e.t !== 'spring') UPD[e.t](W, e); }
    enemyPairs(W);
    for (const e of W.ents) if (e.gone) { W.ents = W.ents.filter(x => !x.gone); break; }
    for (const b of W.bumps) b.t++;
    while (W.bumps.length && W.bumps[0].t >= 10) W.bumps.shift();
    updFx(W);
    camera(W);
    spawn(W);
  }

  function player(W, inp, pr) {
    const p = W.p, A = W.A, L = LEVELS[W.li];
    const left = inp & 1, right = inp & 2, down = inp & 4, aH = inp & 16;
    if (p.throwT > 0) p.throwT--;
    if (inp & 32) p.run = CFG.runTimer; else if (p.run > 0) p.run--;
    if (p.spring) { springRide(W, inp, pr); return; }
    if (p.lift) {
      const l = p.lift;
      if (l.gone || p.x + 13 <= l.x || p.x + 3 >= l.x + l.w) p.lift = null;
      else { p.x += l.dx; p.y = l.y; p.vy = 0; p.ground = true; }
    }
    if (p.ground) p.crouch = p.big && !!down;
    if (p.fire && (pr & 32) && !p.crouch) {
      let n = 0;
      for (const e of W.ents) if (e.t === 'fb') n++;
      if (n < CFG.fbMax) { W.ents.push({ t: 'fb', x: p.x + (p.face > 0 ? 14 : 2), y: p.y - (p.big ? 20 : 8), vx: p.face * CFG.fbSpeed, vy: CFG.fbDown, st: 0, tm: 0, gone: false }); p.throwT = 8; ev(W, 'fire'); }
    }
    if (p.ground && (pr & 16)) {
      const s = Math.abs(p.vx), r = rowOf(s);
      p.vy = -CFG.jumpV[r]; p.g1 = CFG.jumpHeld[r]; p.g2 = CFG.jumpFall[r];
      p.jh = true; p.ground = false; p.lift = null; p.jumpSpd = s; p.airMax = s > CFG.maxWalk ? CFG.maxRun : CFG.maxWalk;
      ev(W, p.big ? 'jumpbig' : 'jump');
    }
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    let s = Math.abs(p.vx);
    const sg = Math.sign(p.vx);
    if (p.ground) {
      const max = p.run > 0 ? CFG.maxRun : CFG.maxWalk;
      p.skid = false;
      if (dir && !p.crouch) {
        if (sg && sg !== dir) {
          p.skid = true; s -= CFG.skidDec;
          if (s < CFG.skidTurn) { s = 0; p.face = dir; p.skid = false; }
          p.vx = sg * s;
        } else {
          p.face = dir;
          if (s < CFG.minWalk) s = CFG.minWalk;
          else if (s < max) s = Math.min(max, s + (p.run > 0 ? CFG.runAcc : CFG.walkAcc));
          else if (s > max) s = Math.max(max, s - CFG.relDec);
          p.vx = dir * s;
        }
      } else p.vx = sg * Math.max(0, s - CFG.relDec);
    } else if (dir) {
      if (!sg || sg === dir) { s += s >= CFG.maxWalk ? CFG.runAcc : CFG.walkAcc; if (s > p.airMax) s = Math.max(p.airMax, Math.abs(p.vx)); p.vx = dir * s; }
      else { s -= s >= CFG.maxWalk ? CFG.runAcc : p.jumpSpd >= CFG.airDecThr ? CFG.relDec : CFG.walkAcc; p.vx = sg * s; }
    }
    if (p.ground && down) for (const q of A.pipes) if (q.k === 'down' && Math.abs(p.y - q.y * 16) < 0.01 && p.x + 8 >= q.x * 16 + 4 && p.x + 8 <= q.x * 16 + 28) { startPipe(W, q); return; }
    if (p.ground && right) for (const q of A.pipes) if (q.k === 'side' && Math.abs(p.y - (q.y + 1) * 16) < 0.01 && p.x + 13 >= q.x * 16 - 0.5 && p.x < q.x * 16) { startPipe(W, q); return; }
    p.x += p.vx;
    if (p.x < W.cam - 3) { p.x = W.cam - 3; if (p.vx < 0) p.vx = 0; }
    collideX(W);
    const wasG = p.ground, py = p.y;
    p.y += p.vy;
    p.ground = false;
    if (p.vy < 0) { headCheck(W); p.lift = null; } else { floorCheck(W, py); if (!p.ground) liftCheck(W, py); }
    if (p.ground) { p.vy = 0; p.chain = 0; p.jh = false; }
    else {
      if (wasG && p.vy >= 0) { const r = rowOf(Math.abs(p.vx)); p.g1 = CFG.jumpHeld[r]; p.g2 = CFG.jumpFall[r]; p.jh = false; p.jumpSpd = Math.abs(p.vx); p.airMax = p.jumpSpd > CFG.maxWalk ? CFG.maxRun : CFG.maxWalk; }
      if (!aH) p.jh = false;
      p.vy += (p.vy < 0 && p.jh) ? p.g1 : p.g2;
      if (p.vy >= CFG.maxFall) p.vy = CFG.fallReset;
    }
    if (p.spring) return;
    const h = ph(p), bt = p.y - h + 2;
    for (let c = Math.floor((p.x + 3) / 16); c <= Math.floor((p.x + 12) / 16); c++)
      for (let r = Math.max(0, Math.floor(bt / 16)); r <= Math.min(14, Math.floor((p.y - 1) / 16)); r++) {
        const t = tileAt(A, c, r);
        if (t === T.COIN) { setTile(A, c, r, T.E); getCoin(W); }
        else if (t === T.AXE) { startAxe(W); return; }
        else if ((t === T.LAVA || t === T.LAVT) && p.y >= r * 16 + 6) { killPlayer(W, true); return; }
      }
    if (p.y > 256) { killPlayer(W, true); return; }
    if (A.flag && p.x + 13 >= A.flag * 16 + 6 && p.x + 3 <= A.flag * 16 + 10) { startFlag(W); return; }
    if (L.mid && W.ai === 0 && p.x >= L.mid * 16) W.mid = true;
    if (p.ground) {
      const sp = Math.abs(p.vx);
      if (sp < 0.01) { p.anim = 0; p.at = 0; }
      else { p.at += sp > CFG.maxWalk + 0.2 ? 1.6 : sp >= 1 ? 1 : 0.6; if (p.at >= 5 || !p.anim) { p.at = 0; p.anim = p.anim % 3 + 1; } }
    }
  }

  function collideX(W) {
    const p = W.p, A = W.A, h = ph(p);
    const r0 = Math.floor((p.y - h + 2) / 16), r1 = Math.floor((p.y - 1) / 16);
    if (p.vx >= 0) { const c = Math.floor((p.x + 12) / 16); for (let r = r0; r <= r1; r++) if (solidAt(A, c, r)) { p.x = c * 16 - 13; if (p.vx > 0) p.vx = 0; break; } }
    if (p.vx <= 0) { const c = Math.floor((p.x + 3) / 16); for (let r = r0; r <= r1; r++) if (solidAt(A, c, r)) { p.x = (c + 1) * 16 - 3; if (p.vx < 0) p.vx = 0; break; } }
  }
  function floorCheck(W, py) {
    const p = W.p, A = W.A, r = Math.floor(p.y / 16), top = r * 16;
    if (py > top + 0.001) return;
    for (let c = Math.floor((p.x + 3) / 16); c <= Math.floor((p.x + 12) / 16); c++) if (solidAt(A, c, r)) { p.y = top; p.ground = true; return; }
  }
  function headCheck(W) {
    const p = W.p, A = W.A, h = ph(p), top = p.y - h + 2, r = Math.floor(top / 16);
    const cc = Math.floor((p.x + 8) / 16), cl = Math.floor((p.x + 3) / 16), cr = Math.floor((p.x + 12) / 16);
    const tc = tileAt(A, cc, r);
    if (SOLID[tc] || ((tc === T.HC || tc === T.H1) && (r + 1) * 16 - top <= -p.vy + 0.01)) {
      p.y = (r + 1) * 16 + h - 2; p.vy = CFG.bonkV; p.jh = false;
      hitBlock(W, cc, r);
      return;
    }
    if (cl !== cc && solidAt(A, cl, r)) p.x = (cl + 1) * 16 - 3;
    else if (cr !== cc && solidAt(A, cr, r)) p.x = cr * 16 - 13;
  }
  function liftCheck(W, py) {
    const p = W.p;
    for (const l of W.ents) {
      if (l.gone || (l.t !== 'lift' && l.t !== 'spring')) continue;
      const isL = l.t === 'lift', top = isL ? l.y : l.y - 32 + l.comp, lw = isL ? l.w : 16;
      if (p.x + 13 <= l.x || p.x + 3 >= l.x + lw) continue;
      if (l === p.lift) { p.y = top; p.ground = true; return; }
      if (py <= top - (l.dy || 0) + 0.5 && p.y >= top) {
        p.y = top; p.vy = 0; p.ground = true;
        if (isL) p.lift = l; else { p.spring = l; l.st = 1; l.tm = 0; l.hi = false; }
        return;
      }
    }
    p.lift = null;
  }
  function springRide(W, inp, pr) {
    const p = W.p, s = p.spring;
    s.tm++;
    if ((pr & 16) && s.tm >= 2) s.hi = true;
    s.comp = s.tm <= 4 ? s.tm * 4 : Math.max(0, 16 - (s.tm - 4) * 4);
    p.y = s.y - 32 + s.comp; p.vx *= 0.5; p.vy = 0; p.ground = true;
    if (s.tm >= 8) {
      p.spring = null; s.st = 0; s.comp = 0;
      p.vy = -(s.hi ? CFG.springHi : CFG.springLo); p.g1 = p.g2 = CFG.jumpFall[0]; p.jh = false; p.ground = false;
      p.airMax = CFG.maxWalk; p.jumpSpd = 0;
      ev(W, s.hi ? 'jumpbig' : 'jump');
    }
  }

  function startPipe(W, q) {
    const p = W.p;
    W.state = 'pipeIn'; W.st = 0; W.pipe = q;
    p.vx = 0; p.vy = 0; p.behind = true; p.crouch = false; p.lift = null; p.face = 1;
    if (q.k === 'down') p.x = q.x * 16 + 8;
    ev(W, 'pipe');
  }
  function travel(W, to) {
    const p = W.p;
    if (to.level != null) { W.state = 'done'; W.result = 'warp'; W.warp = to.level; return; }
    enterArea(W, to.a);
    const A = W.A;
    p.behind = false; p.anim = 0;
    if (to.out === 'up') { p.x = to.x * 16 + 8; p.y = to.y * 16 + 32; p.behind = true; W.state = 'pipeOut'; W.pipe = { y: to.y }; ev(W, 'pipe'); }
    else { p.x = to.x * 16; p.y = to.y * 16; p.vy = 0; p.ground = false; W.state = 'play'; }
    W.cam = Math.max(0, Math.min(p.x - 80, (A.camMax || A.w * 16 - 256)));
    spawn(W);
  }
  function startFlag(W) {
    const p = W.p, A = W.A, hgt = 192 - p.y;
    W.state = 'flag'; W.st = 0;
    for (const [hh, pts] of CFG.flagPts) if (hgt >= hh) { addScore(W, pts, A.flag * 16 + 14, Math.min(p.y - 8, 180)); break; }
    p.x = A.flag * 16 - 5; p.vx = 0; p.vy = 0; p.face = 1; p.crouch = false; p.lift = null; p.anim = 0; p.at = 0;
    W.flagY = 48;
    const d = W.time % 10;
    W.fwn = d === 1 || d === 3 || d === 6 ? d : 0;
    ev(W, 'flag');
  }
  function startAxe(W) {
    const A = W.A, p = W.p;
    W.state = 'axe'; W.st = 0; W.tp = 0;
    setTile(A, A.axe.x, A.axe.y, T.E); setTile(A, A.bridge.x1, A.bridge.y - 1, T.E);
    p.vx = 0; p.vy = 0; p.star = 0;
    W.bx = A.bridge.x1;
    ev(W, 'axe');
  }
  function axeSeq(W) {
    const A = W.A, b = A.bridge;
    W.st++;
    const boss = W.ents.find(e => e.t === 'boss' && !e.gone);
    if (W.tp === 0) {
      if (W.st > 20 && W.st % 4 === 0) {
        if (W.bx >= b.x0) { setTile(A, W.bx, b.y, T.E); W.bx--; ev(W, 'bridge'); }
        else { W.tp = 1; W.st = 0; if (boss && boss.st < 2) { boss.st = 3; boss.vy = 0; ev(W, 'bossfall'); } }
      }
    } else if (W.tp === 1) {
      if (boss) { boss.vy = Math.min(boss.vy + 0.2, 4); boss.y += boss.vy; if (boss.y > 300) boss.gone = true; }
      if (W.st > 70) { W.ents = W.ents.filter(e => e.t !== 'boss' && e.t !== 'flame' && e.t !== 'firebar'); W.state = 'axeWalk'; W.st = 0; A.camMax = 0; W.p.face = 1; ev(W, 'castleclear'); }
    }
    updFx(W);
  }
  function tally(W) {
    W.st++;
    if (W.tp === 0) {
      if (W.time > 0) { const d = Math.min(W.time, 2); W.time -= d; W.score += d * CFG.timePts; if (W.st % 3 === 0) ev(W, 'tick'); }
      else { W.tp = 1; W.st = 0; }
    } else if (W.tp === 1) {
      if (W.fw < W.fwn) {
        if (W.st % 36 === 18) { W.fw++; W.fx.push({ t: 'boom', x: W.A.castle * 16 + 40 + rnd(W) * 96 - 48, y: 48 + rnd(W) * 56, life: 0 }); W.score += CFG.fireworkPts; ev(W, 'boom'); }
      } else if (W.st > 24) { W.tp = 2; W.st = 0; }
    } else {
      if (!W.A.npc) W.cflag = Math.min(16, W.cflag + 0.5);
      if (W.st > 80) { W.state = 'done'; W.result = LEVELS[W.li].castle === 2 ? 'win' : 'clear'; }
    }
    updFx(W);
  }

  function camera(W) {
    const A = W.A, max = A.camMax || A.w * 16 - 256, t = W.p.x - CFG.scrollX;
    if (t > W.cam) W.cam = Math.min(t, max);
    if (W.cam < 0) W.cam = 0;
  }
  function spawn(W) {
    for (const s of W.A.spawns) if (!s.done && s.x < W.cam + 256 + 24) { s.done = true; if (s.x + 64 >= W.cam) W.ents.push(mkEnt(s)); }
  }
  function mkEnt(s) {
    const o = s.o, e = { t: s.t, x: s.x, y: s.y, vx: 0, vy: 0, gone: false, st: 0, tm: 0, h: 16, ground: false };
    switch (s.t) {
      case 'walker': e.vx = -CFG.eSpeed; break;
      case 'snail': e.vx = -CFG.eSpeed; e.red = !!o.red; e.wing = o.wing || ''; e.y0 = s.y; e.ph = 0; break;
      case 'plant': e.y0 = s.y; e.off = 0; e.tm = 40; break;
      case 'cannon': e.tm = 40; break;
      case 'firebar': e.cx = s.x + 8; e.cy = s.y - 8; e.n = o.n; e.spd = o.spd; e.ang = o.a0 || 0; break;
      case 'pod': e.y = 256; e.tm = 30 + (o.d || 0); break;
      case 'boss': e.hp = CFG.bossHp; e.x0 = o.x0; e.x1 = o.x1; e.fire = o.fire; e.jv = o.jump || 3; e.ft = 60; e.jt = 120; e.mt = 60; e.dir = -1; e.face = -1; e.h = 32; break;
      case 'lift': e.w = o.w * 16; e.kind = o.kind; e.x0 = s.x; e.y0 = s.y; e.rng = o.rng; e.spd = o.spd; e.ph = o.ph || 0; e.dx = 0; e.dy = 0; break;
      case 'spring': e.comp = 0; break;
    }
    return e;
  }

  function moveE(W, e, ledge, grav) {
    const A = W.A;
    e.x += e.vx;
    if (e.vx) {
      const c = Math.floor((e.vx > 0 ? e.x + 15 : e.x + 1) / 16);
      if (solidAt(A, c, Math.floor((e.y - 1) / 16)) || solidAt(A, c, Math.floor((e.y - e.h + 2) / 16))) { e.x = e.vx > 0 ? c * 16 - 16 : (c + 1) * 16 - 1; e.vx = -e.vx; e.hit = 1; }
    }
    e.vy = Math.min(e.vy + (grav || CFG.eGrav), CFG.eMaxFall);
    const py = e.y;
    e.y += e.vy; e.ground = false;
    const r = Math.floor(e.y / 16);
    if (e.vy >= 0 && py <= r * 16 + 0.01) for (let c = Math.floor((e.x + 2) / 16); c <= Math.floor((e.x + 13) / 16); c++) if (solidAt(A, c, r)) { e.y = r * 16; e.vy = 0; e.ground = true; break; }
    if (ledge && e.ground && !solidAt(A, Math.floor((e.x + 8 + Math.sign(e.vx) * 7) / 16), r)) e.vx = -e.vx;
  }
  function flipFall(e) { e.x += e.vx; e.y += e.vy; e.vy = Math.min(e.vy + 0.25, 4); if (e.y > 290) e.gone = true; }
  function offscreen(W, e) { if (e.x < W.cam - 64 || e.x > W.cam + 400 || e.y > 270) e.gone = true; }
  function flip(e, dir) { e.st = 2; e.vy = -3; e.vx = dir * 0.6; }
  function pBox(W) { const p = W.p, h = ph(p); return [p.x + 3, p.y - h + 2, p.x + 13, p.y]; }
  function overlapP(W, l, t, r, b) { const [pl, pt, pr, pb] = pBox(W); return pr > l && pl < r && pb > t && pt < b; }
  function touch(W, e) {
    if (W.state !== 'play') return 0;
    const p = W.p, et = e.y - e.h + 3;
    if (!overlapP(W, e.x + 2, et, e.x + 14, e.y)) return 0;
    if (p.star > 0) { starKill(W, e); return 0; }
    if (p.vy > 0 && p.y - et <= 6 + p.vy) return 1;
    return 2;
  }
  function starKill(W, e) {
    const p = W.p;
    flip(e, p.x < e.x ? 1 : -1);
    chainPts(W, CFG.stompPts, p.schain++, e.x, e.y - 16);
    ev(W, 'kick');
  }
  function bounce(W, e) {
    const p = W.p;
    p.vy = -CFG.stompV; p.jh = !!(W.prev & 16); p.ground = false; p.lift = null;
    if (e.y - e.h + 2 < p.y) p.y = e.y - e.h + 2;
    chainPts(W, CFG.stompPts, p.chain++, e.x, e.y - 16);
    ev(W, 'stomp');
  }

  const UPD = {
    walker(W, e) {
      if (e.st === 1) { if (++e.tm > 30) e.gone = true; return; }
      if (e.st === 2) return flipFall(e);
      moveE(W, e, false); e.tm++;
      const r = touch(W, e);
      if (r === 1) { e.st = 1; e.tm = 0; bounce(W, e); } else if (r === 2) hurt(W);
      offscreen(W, e);
    },
    snail(W, e) {
      if (e.st === 2) return flipFall(e);
      e.tm++;
      if (e.st === 0) {
        if (e.wing === 'fly') { e.ph += 0.025; e.y = e.y0 + 36 * Math.sin(e.ph); e.vx = W.p.x < e.x ? -0.0001 : 0.0001; }
        else { moveE(W, e, e.red, e.wing === 'hop' ? CFG.hopGrav : 0); if (e.wing === 'hop' && e.ground) e.vy = -CFG.hopV; }
        const r = touch(W, e);
        if (r === 1) { if (e.wing) { e.wing = ''; e.vy = 0; e.vx = -CFG.eSpeed; } else { e.st = 3; e.tm = 0; e.vx = 0; } bounce(W, e); }
        else if (r === 2) hurt(W);
      } else if (e.st === 3) {
        moveE(W, e, false);
        if (e.tm > CFG.shellWake) { e.st = 0; e.vx = W.p.x < e.x ? -CFG.eSpeed : CFG.eSpeed; }
        const r = touch(W, e);
        if (r) {
          const p = W.p;
          e.st = 4; e.kt = 12; e.chain = 0;
          e.vx = (p.x + 8 < e.x + 8 ? 1 : -1) * CFG.shellSpeed;
          if (r === 1) { p.vy = -CFG.stompV; p.jh = !!(W.prev & 16); p.ground = false; }
          addScore(W, CFG.kickPts, e.x, e.y - 16); ev(W, 'kick');
        }
      } else {
        e.hit = 0;
        moveE(W, e, false);
        if (e.hit && e.x > W.cam - 16 && e.x < W.cam + 256) ev(W, 'bump');
        if (e.kt > 0) e.kt--;
        for (const o of W.ents) {
          if (o === e || o.gone || Math.abs(o.x - e.x) > 14 || Math.abs(o.y - e.y) > 14) continue;
          if ((o.t === 'walker' && o.st === 0) || (o.t === 'snail' && o.st !== 2) || o.t === 'bullet' && o.st === 0) {
            flip(o, Math.sign(e.vx)); chainPts(W, CFG.shellPts, e.chain++, o.x, o.y - 16); ev(W, 'kick');
          }
        }
        const r = touch(W, e);
        if (r === 1) { e.st = 3; e.tm = 0; e.vx = 0; bounce(W, e); }
        else if (r === 2 && e.kt === 0) hurt(W);
      }
      offscreen(W, e);
    },
    plant(W, e) {
      const p = W.p;
      if (e.x < W.cam - 48) { e.gone = true; return; }
      e.tm--;
      if (e.st === 0) { if (e.tm <= 0) { if (Math.abs(p.x + 8 - (e.x + 16)) > 28) e.st = 1; else e.tm = 8; } }
      else if (e.st === 1) { e.off += 0.5; if (e.off >= 24) { e.off = 24; e.st = 2; e.tm = 70; } }
      else if (e.st === 2) { if (e.tm <= 0) e.st = 3; }
      else { e.off -= 0.5; if (e.off <= 0) { e.off = 0; e.st = 0; e.tm = 90; } }
      if (e.off > 3 && overlapP(W, e.x + 10, e.y0 - e.off + 3, e.x + 22, e.y0)) {
        if (p.star > 0) { e.gone = true; chainPts(W, CFG.stompPts, p.schain++, e.x + 8, e.y0 - 24); ev(W, 'kick'); }
        else hurt(W);
      }
    },
    cannon(W, e) {
      if (e.x < W.cam - 32) { e.gone = true; return; }
      if (e.x > W.cam + 256 || --e.tm > 0) return;
      const d = W.p.x - e.x;
      e.tm = 110 + Math.floor(rnd(W) * 130);
      if (Math.abs(d) < 32) return;
      const dir = d < 0 ? -1 : 1;
      W.ents.push({ t: 'bullet', x: e.x, y: e.y, vx: dir * CFG.bulletSpeed, vy: 0, st: 0, tm: 0, h: 14, gone: false });
      ev(W, 'cannon');
    },
    bullet(W, e) {
      if (e.st === 2) return flipFall(e);
      e.x += e.vx; e.tm++;
      if (e.tm > 16) { const r = touch(W, e); if (r === 1) { e.st = 2; e.vy = 0; e.vx = 0; bounce(W, e); } else if (r === 2) hurt(W); }
      if (e.x < W.cam - 48 || e.x > W.cam + 304) e.gone = true;
    },
    firebar(W, e) {
      e.ang += e.spd;
      if (e.cx < W.cam - 120) { e.gone = true; return; }
      const [pl, pt, pr, pb] = pBox(W), ca = Math.cos(e.ang), sa = Math.sin(e.ang);
      for (let i = 0; i < e.n; i++) {
        const fx = e.cx + ca * i * 8, fy = e.cy + sa * i * 8;
        if (fx + 3 > pl + 1 && fx - 3 < pr - 1 && fy + 3 > pt + 2 && fy - 3 < pb - 1) { hurt(W); break; }
      }
    },
    pod(W, e) {
      if (e.x < W.cam - 48) { e.gone = true; return; }
      if (e.st === 0) { if (--e.tm <= 0) { e.st = 1; e.vy = -CFG.podV; } return; }
      e.y += e.vy; e.vy += CFG.podGrav;
      if (e.y >= 256) { e.y = 256; e.st = 0; e.tm = 80 + Math.floor(rnd(W) * 100); return; }
      if (overlapP(W, e.x + 4, e.y - 14, e.x + 12, e.y - 2)) hurt(W);
    },
    boss(W, e) {
      const p = W.p;
      if (e.st === 2) return flipFall(e);
      if (e.x > W.cam + 256 + 48) return;
      e.face = p.x + 8 < e.x + 16 ? -1 : 1;
      if (--e.mt <= 0) { e.mt = 40 + Math.floor(rnd(W) * 80); e.dir = rnd(W) < 0.5 ? -1 : 1; }
      let vx = e.face > 0 ? 0.75 : e.dir * 0.5;
      if ((e.x + vx < e.x0 && vx < 0) || (e.x + vx > e.x1 + (e.face > 0 ? 48 : 0) && vx > 0)) { e.dir = -e.dir; vx = 0; }
      e.x += vx;
      e.vy = Math.min(e.vy + 0.1, 4);
      const py = e.y; e.y += e.vy; e.ground = false;
      const r = Math.floor(e.y / 16);
      if (e.vy >= 0 && py <= r * 16 + 0.01) for (let c = Math.floor((e.x + 4) / 16); c <= Math.floor((e.x + 27) / 16); c++) if (solidAt(W.A, c, r)) { e.y = r * 16; e.vy = 0; e.ground = true; break; }
      if (e.y > 280) { e.gone = true; return; }
      if (e.ground && --e.jt <= 0) { e.vy = -e.jv; e.jt = 80 + Math.floor(rnd(W) * 120); }
      if (--e.ft <= 0) {
        e.ft = e.fire + Math.floor(rnd(W) * e.fire);
        const by = W.A.bridge.y * 16;
        W.ents.push({ t: 'flame', x: e.face < 0 ? e.x - 20 : e.x + 28, y: e.y - 20, ty: by - [8, 24, 40][Math.floor(rnd(W) * 3)], vx: e.face * CFG.flameSpeed, gone: false, tm: 0 });
        ev(W, 'flame');
      }
      if (overlapP(W, e.x + 4, e.y - 28, e.x + 28, e.y)) hurt(W);
    },
    flame(W, e) {
      e.x += e.vx; e.tm++;
      if (Math.abs(e.y - e.ty) > 0.5) e.y += Math.sign(e.ty - e.y) * 0.5;
      if (e.x < W.cam - 40 || e.x > W.cam + 300) e.gone = true;
      if (overlapP(W, e.x + 3, e.y - 3, e.x + 21, e.y + 3)) hurt(W);
    },
    item(W, e) {
      if (e.em > 0) {
        e.em -= CFG.itemRise; e.y -= CFG.itemRise;
        if (e.em <= 0) { e.em = 0; if (e.k !== 'fire') e.vx = CFG.itemSpeed; if (e.k === 'star') e.vy = -CFG.starV; }
      } else if (e.k === 'star') { moveE(W, e, false, CFG.starGrav); if (e.ground) e.vy = -CFG.starV; }
      else if (e.k !== 'fire') moveE(W, e, false);
      if (e.em < 12 && overlapP(W, e.x + 2, e.y - 14, e.x + 14, e.y)) collect(W, e);
      offscreen(W, e);
    },
    fb(W, e) {
      if (e.st) { if (++e.tm > 8) e.gone = true; return; }
      const A = W.A;
      e.x += e.vx;
      if (solidAt(A, Math.floor(e.x / 16), Math.floor(e.y / 16))) { e.st = 1; ev(W, 'bump'); return; }
      e.vy = Math.min(e.vy + CFG.fbGrav, CFG.fbDown); e.y += e.vy;
      if (e.vy > 0 && solidAt(A, Math.floor(e.x / 16), Math.floor((e.y + 4) / 16))) { e.y = Math.floor((e.y + 4) / 16) * 16 - 4; e.vy = -CFG.fbBounce; }
      for (const o of W.ents) {
        if (o.gone || o === e) continue;
        let hit = false;
        if ((o.t === 'walker' && o.st === 0) || (o.t === 'snail' && o.st !== 2)) hit = Math.abs(o.x + 8 - e.x) < 11 && e.y > o.y - 18 && e.y < o.y + 3;
        else if (o.t === 'plant') hit = o.off > 3 && Math.abs(o.x + 16 - e.x) < 10 && e.y > o.y0 - o.off - 3 && e.y < o.y0;
        else if (o.t === 'boss' && o.st === 0) hit = e.x > o.x && e.x < o.x + 32 && e.y > o.y - 32 && e.y < o.y;
        if (!hit) continue;
        e.st = 1;
        if (o.t === 'plant') { o.gone = true; addScore(W, 200, o.x + 8, o.y0 - 24); }
        else if (o.t === 'boss') { if (--o.hp <= 0) { flip(o, Math.sign(e.vx)); o.vy = -2; addScore(W, CFG.bossPts, o.x + 8, o.y - 32); ev(W, 'bossfall'); } else ev(W, 'bump'); }
        else { flip(o, Math.sign(e.vx)); addScore(W, o.t === 'walker' ? 100 : 200, o.x, o.y - 16); }
        ev(W, 'kick');
        break;
      }
      if (e.x < W.cam - 8 || e.x > W.cam + 264 || e.y > 250) e.gone = true;
    },
    lift(W, e) {
      let nx = e.x, ny = e.y;
      if (e.kind === 'v') { e.ph += e.spd; ny = e.y0 + e.rng * (1 - Math.cos(e.ph)) / 2; }
      else if (e.kind === 'h') { e.ph += e.spd; nx = e.x0 + e.rng * (1 - Math.cos(e.ph)) / 2; }
      else if (e.kind === 'up') { ny -= e.spd; if (ny < 24) ny = 248; }
      else if (e.kind === 'down') { ny += e.spd; if (ny > 248) ny = 24; }
      else if (e.kind === 'fall') { if (W.p.lift === e) e.st = 1; if (e.st) { e.vy = Math.min(e.vy + 0.05, 2.5); ny += e.vy; } }
      e.dx = nx - e.x; e.dy = ny - e.y; e.x = nx; e.y = ny;
      if (Math.abs(e.dy) > 20 && W.p.lift === e) W.p.lift = null;
      if (e.x0 + e.w + 128 < W.cam || e.y > 320) e.gone = true;
    },
    spring(W, e) { if (W.p.spring !== e) { e.comp = 0; e.st = 0; } if (e.x < W.cam - 48) e.gone = true; }
  };
  function collect(W, e) {
    const p = W.p;
    e.gone = true;
    if (e.k === 'oneup') { addScore(W, 'up', e.x, e.y - 16); return; }
    addScore(W, CFG.itemPts, e.x, e.y - 16);
    ev(W, 'powerup');
    if (e.k === 'star') { p.star = CFG.starFrames; p.schain = 0; return; }
    if (!p.big) { p.big = true; W.state = 'grow'; W.st = 0; }
    else if (e.k === 'fire' && !p.fire) { p.fire = true; W.state = 'power'; W.st = 0; }
  }
  function enemyPairs(W) {
    const es = W.ents, wl = e => !e.gone && e.st === 0 && (e.t === 'walker' || (e.t === 'snail' && e.wing !== 'fly'));
    for (let i = 0; i < es.length; i++) {
      const a = es[i]; if (!wl(a)) continue;
      for (let j = i + 1; j < es.length; j++) {
        const b = es[j]; if (!wl(b)) continue;
        if (Math.abs(a.x - b.x) < 15 && Math.abs(a.y - b.y) < 12) {
          if ((a.x <= b.x && a.vx > 0) || (a.x > b.x && a.vx < 0)) a.vx = -a.vx;
          if ((b.x < a.x && b.vx > 0) || (b.x >= a.x && b.vx < 0)) b.vx = -b.vx;
        }
      }
    }
  }
  function bumpHit(W, cx, cy) {
    const top = cy * 16;
    for (const e of W.ents) {
      if (e.gone || Math.abs(e.y - top) > 2 || e.x + 14 < cx * 16 || e.x + 2 > cx * 16 + 16) continue;
      if ((e.t === 'walker' && e.st === 0) || (e.t === 'snail' && e.st !== 2)) { flip(e, e.x + 8 < cx * 16 + 8 ? -1 : 1); addScore(W, 100, e.x, e.y - 16); ev(W, 'kick'); }
      else if (e.t === 'item' && !e.em) { e.vy = -3.5; e.ground = false; if (e.k === 'grow' || e.k === 'oneup') e.vx = (e.x + 8 < cx * 16 + 8 ? -1 : 1) * CFG.itemSpeed; }
    }
    if (tileAt(W.A, cx, cy - 1) === T.COIN) { setTile(W.A, cx, cy - 1, T.E); coinPop(W, cx, cy - 1); }
  }
  function spawnItem(W, cx, cy, k) { W.ents.push({ t: 'item', k, x: cx * 16, y: cy * 16 + 16, vx: 0, vy: 0, em: 16, st: 0, tm: 0, h: 16, gone: false, ground: false }); ev(W, 'sprout'); }
  function hitBlock(W, cx, cy) {
    const A = W.A, p = W.p, t = tileAt(A, cx, cy);
    const bump = () => { W.bumps.push({ cx, cy, t: 0 }); bumpHit(W, cx, cy); };
    const used = () => { setTile(A, cx, cy, T.USED); bump(); };
    switch (t) {
      case T.BRK:
        if (p.big) {
          setTile(A, cx, cy, T.E); bumpHit(W, cx, cy);
          for (let i = 0; i < 4; i++) W.fx.push({ t: 'deb', x: cx * 16 + (i & 1) * 8, y: cy * 16 + (i >> 1) * 8, vx: (i & 1 ? 1 : -1) * 1.1, vy: i >> 1 ? -3 : -5, life: 0 });
          W.score += CFG.brickPts; ev(W, 'break');
        } else { bump(); ev(W, 'bump'); }
        break;
      case T.QC: case T.HC: used(); coinPop(W, cx, cy); break;
      case T.QP: case T.BP: used(); spawnItem(W, cx, cy, p.big ? 'fire' : 'grow'); break;
      case T.BS: used(); spawnItem(W, cx, cy, 'star'); break;
      case T.B1: case T.H1: used(); spawnItem(W, cx, cy, 'oneup'); break;
      case T.BMC: {
        const k = cx + ',' + cy;
        if (W.multi[k] == null) W.multi[k] = W.frame + CFG.multiCoinFrames;
        if (W.frame >= W.multi[k]) setTile(A, cx, cy, T.USED);
        bump(); coinPop(W, cx, cy);
        break;
      }
      default: ev(W, 'bump');
    }
  }
  function updFx(W) {
    let dead = false;
    for (const f of W.fx) {
      f.life++;
      if (f.t === 'txt') { if (f.life < 30) f.y -= 1; if (f.life > 54) f.dead = dead = true; }
      else if (f.t === 'coin') { f.y += f.vy; f.vy += 0.35; if (f.life > 28) { f.dead = dead = true; W.fx.push({ t: 'txt', s: String(CFG.coinPts), x: f.x, y: f.y, life: 0 }); } }
      else if (f.t === 'deb') { f.x += f.vx; f.y += f.vy; f.vy += 0.3; if (f.y > 260) f.dead = dead = true; }
      else if (f.life > (f.t === 'boom' ? 30 : 12)) f.dead = dead = true;
    }
    if (dead) W.fx = W.fx.filter(f => !f.dead);
  }

  const GAME = { CFG, T, LEVELS, newWorld, step, tileAt };

  function makeRenderer(ctx) {
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const cache = new Map();
    const rgb = c => [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
    const hex = v => '#' + v.map(n => ('0' + Math.max(0, Math.min(255, Math.round(n))).toString(16)).slice(-2)).join('');
    const mix = (a, b, t) => { const p = rgb(a), q = rgb(b); return hex(p.map((n, i) => n + (q[i] - n) * t)); };
    const lum = c => { const p = rgb(c); return p[0] * .3 + p[1] * .59 + p[2] * .11; };
    const lite = c => mix(c, '#FFF4C0', .34);
    const dark = c => mix(c, '#200848', .3);
    const rim = c => mix(c, '#10061C', .74);
    const NOEDGE = { bean: 1, fb: 1 };
    function spr(name, pal, fx, fy) {
      let key = name + (fx ? 'h' : '') + (fy ? 'v' : '');
      for (const k in pal) key += pal[k];
      let c = cache.get(key);
      if (!c) {
        const g = GRIDS[name], w = g.w, h = g.h, pad = 0;
        c = cv(w + pad * 2, h + pad * 2); c.pad = pad;
        const x = c.getContext('2d');
        const col = new Array(w * h).fill('');
        for (let i = 0; i < g.d.length; i++) {
          const ch = g.d[i]; if (!ch || !pal[ch]) continue;
          const px = i % w, py = (i / w) | 0;
          col[(fy ? h - 1 - py : py) * w + (fx ? w - 1 - px : px)] = pal[ch];
        }
        const at = (a, b) => a < 0 || b < 0 || a >= w || b >= h ? '' : col[b * w + a];
        const dk = q => !q || lum(q) < 46;
        for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
          const q = col[py * w + px];
          if (!q) {
            if (!pad) continue;
            let n = '';
            for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) { const m = at(px + dx, py + dy); if (m && !dk(m)) { n = m; break; } }
            if (n) { x.fillStyle = rim(n); x.fillRect(px + pad, py + pad, 1, 1); }
            continue;
          }
          let o = q;
          if (pad && !dk(q)) {
            const u = dk(at(px, py - 1)), d = dk(at(px, py + 1));
            if (u && !d) o = lite(q); else if (d && !u) o = dark(q);
          }
          x.fillStyle = o; x.fillRect(px + pad, py + pad, 1, 1);
        }
        cache.set(key, c);
      }
      return c;
    }
    const draw = (name, pal, x, y, fx, fy) => { const c = spr(name, pal, fx, fy); ctx.drawImage(c, Math.round(x) - c.pad, Math.round(y) - c.pad); };
    const glyphs = new Map();
    function glyph(chr, col) {
      const key = chr + col;
      let c = glyphs.get(key);
      if (!c) {
        c = cv(8, 8); const x = c.getContext('2d'); x.fillStyle = col;
        const hx = FONT[chr] || FONT[' '];
        for (let r = 0; r < 7; r++) { const v = parseInt(hx.substr(r * 2, 2), 16); for (let b = 0; b < 8; b++) if (v & (128 >> b)) x.fillRect(b, r, 1, 1); }
        glyphs.set(key, c);
      }
      return c;
    }
    function text(s, x, y, col = NES.wht, sc = 1, shadow) {
      s = String(s).toUpperCase();
      if (shadow) { ctx.globalAlpha = 0.5; for (let i = 0; i < s.length; i++) ctx.drawImage(glyph(s[i], '#000000'), Math.round(x + i * 8 * sc) + 1, Math.round(y) + 1, 8 * sc, 8 * sc); ctx.globalAlpha = 1; }
      for (let i = 0; i < s.length; i++) { const g = glyph(s[i], col); if (sc === 1) ctx.drawImage(g, Math.round(x + i * 8), Math.round(y)); else ctx.drawImage(g, Math.round(x + i * 8 * sc), Math.round(y), 8 * sc, 8 * sc); }
    }
    const tcache = new Map();
    const PIPEC = ['#006800', '#006800', '#00A800', '#00A800', '#58D810', '#58D810', '#B8F818', '#E0FC90', '#80D010', '#80D010', '#58C010', '#58C010', '#00A800', '#00A800', '#00A800', '#00A800', '#009000', '#009000', '#009000', '#007800', '#007800', '#006800', '#005800', '#005800', '#004800', '#004800', '#004800', '#004800'];
    function tile(t, kind, fr) {
      const key = t + kind + fr;
      let c = tcache.get(key);
      if (c) return c;
      c = cv(16, 16); const x = c.getContext('2d'), K = KIND[kind];
      const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
      const q = [NES.org, NES.org, NES.brn, '#883400'][fr & 3];
      switch (t) {
        case T.GND: {
          const lo = mix(K.b, K.k, .4), hi = mix(K.b, K.a, .7);
          R(K.b, 0, 0, 16, 16);
          R(K.a, 0, 0, 15, 1); R(K.a, 0, 0, 1, 15); R(K.k, 15, 0, 1, 16); R(K.k, 0, 15, 16, 1);
          R(K.k, 10, 0, 1, 7); R(K.k, 10, 6, 5, 1); R(K.a, 11, 1, 1, 5); R(K.a, 11, 7, 4, 1);
          R(K.k, 0, 9, 6, 1); R(K.k, 5, 9, 1, 6); R(K.a, 1, 10, 4, 1); R(K.a, 6, 10, 1, 5);
          R(hi, 1, 1, 8, 1); R(hi, 1, 2, 1, 6); R(lo, 9, 1, 1, 5); R(lo, 1, 8, 8, 1); R(lo, 11, 5, 3, 1); R(lo, 14, 1, 1, 5);
          R(lo, 1, 14, 4, 1); R(lo, 4, 10, 1, 4); R(lo, 6, 14, 8, 1); R(lo, 14, 8, 1, 6); R(hi, 7, 10, 7, 1); R(hi, 7, 11, 1, 3);
          R(K.k, 3, 3, 2, 2); R(K.a, 3, 3, 1, 1); R(K.k, 12, 11, 2, 1); R(K.k, 8, 13, 1, 1); R(K.a, 13, 3, 1, 1);
          break;
        }
        case T.BRK: case T.BMC: case T.BS: case T.BP: case T.B1: {
          const hi = mix(K.b, K.a, .8), lo = mix(K.b, K.k, .4);
          R(K.k, 0, 0, 16, 16);
          for (let r = 0; r < 4; r++) {
            const o = r & 1 ? 3 : 7, y = r * 4;
            for (const [a, w] of [[0, o], [o + 1, 7], [o + 9, 15 - o - 9]]) {
              if (w <= 0) continue;
              R(K.b, a, y, w, 3); R(hi, a, y, w, 1); R(lo, a, y + 2, w, 1);
            }
            R(K.a, 0, y, 1, 1);
          }
          R(mix(K.b, K.a, .5), 4, 5, 1, 1); R(mix(K.b, K.k, .6), 11, 9, 1, 1); R(mix(K.b, K.k, .6), 5, 1, 1, 1);
          break;
        }
        case T.QC: case T.QP: {
          const hiq = mix(q, '#FFF8D0', .5), loq = mix(q, '#401000', .35);
          R(K.k, 0, 0, 16, 16);
          R(q, 1, 1, 14, 14); R(hiq, 1, 1, 14, 1); R(hiq, 1, 1, 1, 14); R(loq, 1, 14, 14, 1); R(loq, 14, 1, 1, 14);
          R(mix(q, '#FFF8D0', .22), 2, 2, 12, 6);
          for (const [a, b] of [[2, 2], [12, 2], [2, 12], [12, 12]]) { R(NES.brn, a, b, 2, 2); R(NES.lt, a, b, 1, 1); }
          x.clearRect(0, 0, 1, 1); x.clearRect(15, 0, 1, 1); x.clearRect(0, 15, 1, 1); x.clearRect(15, 15, 1, 1);
          { const hx = FONT['?']; for (let r = 0; r < 7; r++) { const v = parseInt(hx.substr(r * 2, 2), 16); for (let b = 0; b < 8; b++) if (v & (128 >> b)) { R('#7C2C00', 5 + b, 5 + r, 1, 1); R(r < 4 ? NES.wht : '#FCE4A0', 4 + b, 4 + r, 1, 1); } } }
          break;
        }
        case T.USED: {
          const fill = kind === 'castle' ? K.b : NES.brn;
          R(K.k, 0, 0, 16, 16); R(fill, 1, 1, 14, 14); R(mix(fill, K.a, .55), 1, 1, 14, 1); R(mix(fill, K.a, .55), 1, 1, 1, 14); R(mix(fill, K.k, .5), 1, 14, 14, 1); R(mix(fill, K.k, .5), 14, 1, 1, 14);
          R(mix(fill, K.k, .25), 3, 3, 10, 10);
          for (const [a, b] of [[2, 2], [12, 2], [2, 12], [12, 12]]) { R(K.k, a, b, 2, 2); R(mix(fill, K.a, .7), a, b, 1, 1); }
          x.clearRect(0, 0, 1, 1); x.clearRect(15, 0, 1, 1); x.clearRect(0, 15, 1, 1); x.clearRect(15, 15, 1, 1);
          break;
        }
        case T.HARD: {
          const hi = mix(K.b, K.a, .85), lo = mix(K.b, K.k, .5);
          R(K.b, 0, 0, 16, 16); R(hi, 0, 0, 16, 2); R(hi, 0, 0, 2, 16); R(K.k, 0, 14, 16, 2); R(K.k, 14, 0, 2, 16);
          R(K.a, 2, 2, 12, 1); R(K.a, 2, 2, 1, 12); R(lo, 3, 13, 11, 1); R(lo, 13, 3, 1, 11);
          R(mix(K.b, K.a, .3), 4, 4, 8, 8); R(lo, 4, 11, 8, 1); R(lo, 11, 4, 1, 8); R(K.a, 4, 4, 7, 1); R(K.a, 4, 4, 1, 7);
          R(K.k, 7, 7, 2, 2); R(K.a, 7, 7, 1, 1);
          R(K.k, 15, 0, 1, 16); R(K.k, 0, 15, 16, 1);
          break;
        }
        case T.PTL: case T.PTR: case T.PBL: case T.PBR: {
          const top = t === T.PTL || t === T.PTR, left = t === T.PTL || t === T.PBL, o = left ? 0 : 16, i0 = top ? 0 : 2, w = top ? 32 : 28;
          for (let px = 0; px < 16; px++) {
            const gx = px + o - i0;
            if (gx < 0 || gx >= w) continue;
            const col = gx === 0 || gx === w - 1 ? NES.blk : PIPEC[Math.min(PIPEC.length - 1, Math.floor(gx / w * PIPEC.length))];
            R(col, px, 0, 1, 16);
            if (top) { R(mix(col, '#FFFFFF', .28), px, 1, 1, 1); R(mix(col, '#002000', .3), px, 12, 1, 3); }
          }
          if (top) { R(NES.blk, 0, 0, 16, 1); R(NES.blk, 0, 15, 16, 1); }
          break;
        }
        case T.SPT: case T.SPB: case T.SBT: case T.SBB: {
          const lip = t === T.SPT || t === T.SPB, upper = t === T.SPT || t === T.SBT, o = upper ? 0 : 16, i0 = lip ? 0 : 2, h = lip ? 32 : 28;
          for (let py = 0; py < 16; py++) {
            const gy = py + o - i0;
            if (gy < 0 || gy >= h) continue;
            const col = gy === 0 || gy === h - 1 ? NES.blk : PIPEC[Math.min(PIPEC.length - 1, Math.floor(gy / h * PIPEC.length))];
            R(col, 0, py, 16, 1);
            if (lip) { R(mix(col, '#FFFFFF', .28), 1, py, 1, 1); R(mix(col, '#002000', .3), 12, py, 3, 1); }
          }
          if (lip) { R(NES.blk, 0, 0, 1, 16); R(NES.blk, 15, 0, 1, 16); }
          break;
        }
        case T.COIN: { const cc = coinPal(fr, kind); x.drawImage(spr('coin0', cc), -1, -1); break; }
        case T.LAVT: case T.LAVA:
          R(NES.ored, 0, 0, 16, 16); R('#D82800', 0, 8, 16, 8); R('#B01800', 0, 13, 16, 3);
          if (t === T.LAVT) { for (let px = 0; px < 16; px++) { const hgt = 2 + Math.round(1.5 + 1.5 * Math.sin((px + fr * 2) * Math.PI / 8)); R(NES.lava, px, 0, 1, hgt); R('#FCE0A8', px, 0, 1, Math.max(0, hgt - 3) + 1); R(NES.blk, px, 0, 1, Math.max(0, hgt - 4)); } }
          else { R(NES.lava, (fr * 3) % 16, 6, 3, 1); R(NES.lava, (fr * 3 + 9) % 16, 11, 2, 1); R('#FCE0A8', (fr * 3) % 16, 6, 1, 1); R('#FC8830', (fr * 2 + 5) % 16, 3, 2, 2); }
          break;
        case T.TREE: case T.TREEL: case T.TREER:
          R(NES.lgrn, 0, 0, 16, 16); R(NES.blk, 0, 0, 16, 1); R(NES.grn, 0, 12, 16, 3); R(NES.blk, 0, 15, 16, 1);
          R(NES.grn, 3, 5, 3, 2); R(NES.grn, 10, 8, 3, 2); R('#B8F818', 6, 2, 4, 1);
          if (t === T.TREEL) { R(NES.blk, 0, 0, 1, 16); x.clearRect(0, 0, 2, 2); x.clearRect(0, 14, 2, 2); R(NES.blk, 1, 1, 1, 1); R(NES.blk, 1, 14, 1, 1); }
          if (t === T.TREER) { R(NES.blk, 15, 0, 1, 16); x.clearRect(14, 0, 2, 2); x.clearRect(14, 14, 2, 2); R(NES.blk, 14, 1, 1, 1); R(NES.blk, 14, 14, 1, 1); }
          break;
        case T.TRUNK:
          R('#AC7C00', 0, 0, 16, 16); R('#7C4000', 3, 0, 2, 16); R('#7C4000', 10, 0, 1, 16); R(NES.org, 6, 0, 1, 16); R(NES.blk, 0, 0, 1, 16); R(NES.blk, 15, 0, 1, 16);
          break;
        case T.BRIDGE:
          R(NES.blk, 0, 0, 16, 7); R(NES.brn, 0, 1, 16, 5); R(NES.org, 0, 1, 16, 1);
          for (let i = 0; i < 16; i += 4) R(NES.blk, i, 2, 1, 4);
          R(NES.lgry, 0, 9, 16, 1); R(NES.lgry, 2, 7, 1, 2); R(NES.lgry, 13, 7, 1, 2);
          break;
        case T.CHAIN:
          for (let i = 0; i < 7; i++) { R(NES.lgry, 1 + i * 2, 13 - i * 2, 2, 2); R(NES.gry, 2 + i * 2, 14 - i * 2, 1, 1); }
          break;
        case T.AXE:
          R('#7C4000', 9, 2, 3, 14); R(NES.blk, 8, 2, 1, 14);
          x.fillStyle = fr & 2 ? NES.wht : NES.lgry; x.beginPath(); x.moveTo(9, 1); x.lineTo(2, 0); x.quadraticCurveTo(-1, 6, 2, 12); x.lineTo(9, 10); x.closePath(); x.fill();
          R(NES.blk, 2, 0, 7, 1); R(NES.blk, 2, 12, 7, 1); R(NES.gry, 3, 3, 4, 1); R(NES.gry, 3, 8, 4, 1);
          break;
        case T.CANT:
          R(NES.blk, 0, 0, 16, 16); R('#3C3C3C', 1, 1, 14, 14); R(NES.gry, 2, 2, 3, 12); R(NES.lgry, 3, 3, 1, 9);
          R(NES.blk, 5, 4, 7, 8); R('#202020', 6, 5, 5, 6); R(NES.lgry, 0, 7, 16, 1);
          break;
        case T.CANB:
          R(NES.blk, 0, 0, 16, 16); R('#4C4C4C', 2, 0, 12, 16); R(NES.gry, 3, 0, 2, 16); R(NES.lgry, 5, 4, 2, 2); R(NES.lgry, 9, 4, 2, 2); R(NES.lgry, 5, 11, 2, 2); R(NES.lgry, 9, 11, 2, 2);
          break;
      }
      tcache.set(key, c);
      return c;
    }
    const coinPal = (fr, kind) => ({ a: [NES.org, NES.org, NES.brn, '#883400'][fr & 3], b: kind === 'over' || kind === 'tree' ? NES.brn : '#883400', c: NES.wht });
    const shapes = new Map();
    function shape(key, w, h, fn) { let c = shapes.get(key); if (!c) { c = cv(w, h); fn(c.getContext('2d')); shapes.set(key, c); } return c; }
    const lump = (x, pts, fill, line) => {
      x.fillStyle = line; for (const [cx, cy, r] of pts) { x.beginPath(); x.arc(cx, cy, r + 1, 0, 7); x.fill(); }
      x.fillStyle = fill; for (const [cx, cy, r] of pts) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    };
    const pix = x => { const d = x.getImageData(0, 0, x.canvas.width, x.canvas.height); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; x.putImageData(d, 0, 0); };
    const hill = big => shape('hill' + big, big ? 80 : 48, big ? 36 : 20, x => {
      const w = big ? 80 : 48, h = big ? 36 : 20;
      const dome = (ins, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(ins, h); x.quadraticCurveTo(w / 2, -h * (0.95 - ins * 0.025), w - ins, h); x.fill(); };
      dome(0, NES.blk); dome(2, NES.grn);
      x.fillStyle = NES.blk;
      for (const [a, b] of big ? [[32, 14], [44, 20], [36, 26], [52, 28], [26, 30]] : [[20, 10], [28, 14]]) { x.fillRect(a, b, 2, 4); x.fillRect(a + 2, b + 1, 1, 2); }
      x.fillStyle = NES.grn;
      for (const [a, b] of big ? [[32, 14], [44, 20], [36, 26], [52, 28], [26, 30]] : [[20, 10], [28, 14]]) x.fillRect(a + 1, b + 1, 1, 2);
      pix(x);
    });
    const puff = (n, cloud) => shape('puff' + n + cloud, 16 + n * 16 + 16, 26, x => {
      const pts = [];
      for (let i = 0; i <= n; i++) pts.push([16 + i * 16, cloud ? 12 : 14, 9], [8 + i * 16 + 8, cloud ? 16 : 18, 8]);
      pts.push([8, 18, 7], [16 + n * 16 + 8, 18, 7]);
      const ww = 16 + n * 16 + 16;
      if (cloud) {
        lump(x, pts.concat([[16 + n * 16 / 2, 18, 9]]), NES.wht, NES.blk);
        x.save(); x.globalCompositeOperation = 'source-atop';
        x.fillStyle = NES.blu; for (let i = 0; i <= n; i++) { x.fillRect(12 + i * 16, 20, 7, 1); x.fillRect(10 + i * 16, 19, 2, 1); x.fillRect(19 + i * 16, 19, 2, 1); }
        x.restore();
      } else {
        lump(x, pts, NES.lgrn, NES.blk); x.fillStyle = NES.lgrn; x.fillRect(4, 20, n * 16 + 28, 6);
        x.save(); x.globalCompositeOperation = 'source-atop';
        x.fillStyle = NES.grn; for (let i = 0; i <= n; i++) { x.fillRect(12 + i * 16, 11, 3, 2); x.fillRect(18 + i * 16, 14, 2, 2); }
        x.restore();
      }
      pix(x);
    });
    function decorFor(A) {
      if (A._decor) return A._decor;
      const out = [];
      if (A.kind === 'over' || A.kind === 'tree') for (let b = 0; b < A.w; b += 48) {
        const g = c => A.kind === 'over' && tileAt(A, c, 13) === T.GND && tileAt(A, c + 2, 13) === T.GND;
        if (g(b)) out.push(['hill1', b * 16, 208 - 36]);
        if (g(b + 16)) out.push(['hill0', (b + 16) * 16, 208 - 20]);
        for (const [c, r, n] of [[8, 3, 0], [19, 2, 0], [27, 3, 2], [36, 2, 1]]) out.push(['cloud' + n, (b + c) * 16, r * 16]);
        for (const [c, n] of [[11, 2], [23, 0], [41, 1]]) if (g(b + c)) out.push(['bush' + n, (b + c) * 16, 208 - 26]);
      }
      A._decor = out;
      return out;
    }
    function castle(x0, y0, cflag) {
      const K = KIND.over, bt = tile(T.BRK, 'over', 0);
      const B = (cx, cy) => ctx.drawImage(bt, x0 + cx * 16, y0 + cy * 16);
      for (let c = 0; c < 5; c++) { B(c, 3); B(c, 4); }
      for (let c = 1; c < 4; c++) { B(c, 1); B(c, 2); }
      for (const c of [0, 2, 4]) { ctx.drawImage(bt, 0, 8, 16, 8, x0 + c * 16, y0 + 40, 16, 8); }
      for (const c of [1, 3]) { ctx.drawImage(bt, 0, 8, 16, 8, x0 + c * 16, y0 + 8, 16, 8); }
      ctx.fillStyle = NES.blk;
      for (const c of [0, 2, 4]) ctx.fillRect(x0 + c * 16, y0 + 39, 16, 1);
      ctx.fillStyle = K.k;
      for (let c = 0; c < 5; c++) { ctx.fillRect(x0 + c * 16 + 1, y0 + 48 + 1, 14, 1); }
      ctx.fillStyle = NES.blk;
      ctx.fillRect(x0 + 32, y0 + 60, 16, 20); ctx.beginPath(); ctx.arc(x0 + 40, y0 + 60, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#301008'; ctx.fillRect(x0 + 34, y0 + 62, 12, 18); ctx.beginPath(); ctx.arc(x0 + 40, y0 + 60, 6, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#4C1C0C'; ctx.fillRect(x0 + 34, y0 + 62, 3, 18); ctx.fillStyle = '#C8A020'; ctx.fillRect(x0 + 43, y0 + 70, 2, 2);
      ctx.fillStyle = NES.blk; ctx.fillRect(x0 + 22, y0 + 26, 6, 10); ctx.fillRect(x0 + 52, y0 + 26, 6, 10);
      ctx.beginPath(); ctx.arc(x0 + 25, y0 + 26, 3, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(x0 + 55, y0 + 26, 3, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#F8D878'; ctx.fillRect(x0 + 23, y0 + 28, 1, 6); ctx.fillRect(x0 + 53, y0 + 28, 1, 6);
      if (cflag > 0) {
        ctx.fillStyle = NES.blk; ctx.fillRect(x0 + 38, y0 + 8 - cflag - 5, 3, cflag + 5);
        ctx.fillStyle = NES.lgry; ctx.fillRect(x0 + 39, y0 + 8 - cflag - 4, 1, cflag + 4);
        draw('flag', { a: NES.wht, b: NES.grn }, x0 + 40, y0 + 8 - cflag - 4, true);
      }
    }
    const heroPal = (W, fr) => {
      const p = W.p;
      if (p.star > 0) return STAR_PALS[(fr >> (p.star < 120 ? 3 : 1)) & 3];
      if (W.state === 'power') return (W.st >> 2) & 1 ? FIRE_PAL : HERO_PAL;
      return p.fire ? FIRE_PAL : HERO_PAL;
    };
    function hero(W, fr, cam) {
      const p = W.p;
      if (p.hide) return;
      if (p.inv > 0 && (fr & 2) && W.state === 'play') return;
      let big = p.big;
      if (W.state === 'grow') big = W.st > 44 || ((W.st >> 2) & 1) === 1;
      if (W.state === 'shrink') big = W.st < 6 || ((W.st >> 2) & 1) === 0;
      let f;
      if (W.state === 'die') f = 's_die';
      else {
        const pre = big ? 'b_' : 's_';
        if (big && p.crouch) f = 'b_crouch';
        else if (W.state === 'flag' || W.state === 'flag2') f = pre + (p.anim ? 'w2' : 'jump');
        else if (W.state === 'pipeIn' && W.pipe && W.pipe.k === 'down' || W.state === 'pipeOut') f = pre + 'stand';
        else if (!p.ground && W.state === 'play') f = pre + 'jump';
        else if (p.skid) f = pre + 'skid';
        else if (p.throwT > 0 && big) f = 'b_w1';
        else f = pre + (p.anim ? 'w' + p.anim : 'stand');
      }
      const h = big || f === 'b_crouch' ? 32 : 16;
      draw(f, heroPal(W, fr), p.x - cam, p.y - h, p.face < 0, false);
    }
    const SNAIL_G = { a: '#00A800', b: NES.wht, c: NES.org }, SNAIL_R = { a: NES.red, b: NES.wht, c: NES.org };
    const PLANT = { a: '#00A800', b: NES.wht, c: NES.red, d: NES.dgrn };
    const BULLET = { a: NES.blk, b: NES.wht, c: NES.gry };
    const BOSS = { a: '#00A800', b: NES.wht, c: NES.org, d: NES.blk, e: NES.red, f: NES.brn };
    const FIRE = { a: NES.ored, b: NES.lava, c: NES.wht };
    const CYC = [NES.red, NES.org, NES.wht, NES.lgrn];
    function itemDraw(e, fr, cam) {
      const x = e.x - cam, y = e.y - 16;
      if (e.k === 'grow') draw('berry', { a: NES.red, b: NES.blk, c: NES.wht, d: NES.lt }, x, y);
      else if (e.k === 'oneup') draw('berry', { a: NES.grn, b: NES.blk, c: NES.wht, d: NES.lt }, x, y);
      else if (e.k === 'fire') draw('pepper', { a: CYC[(fr >> 2) & 3], b: CYC[((fr >> 2) + 1) & 3], c: NES.tan, d: NES.grn }, x, y);
      else draw('gem', { a: [NES.gold, NES.org, NES.wht, NES.lgrn][(fr >> 2) & 3], b: NES.blk, c: NES.wht }, x, y);
    }
    function ent(W, e, fr, cam) {
      const x = e.x - cam, K = KIND[W.A.kind];
      switch (e.t) {
        case 'walker': {
          const pal = { a: K.walker[0], b: K.walker[1], c: K.walker[2] };
          if (W.A.kind !== 'over' && W.A.kind !== 'tree') pal.b = '#202020';
          if (e.st === 1) draw('walkerF', pal, x, e.y - 16);
          else draw(((e.tm >> 3) & 1) ? 'walker1' : 'walker0', pal, x, e.y - 16, false, e.st === 2);
          break;
        }
        case 'snail': {
          const pal = e.red ? SNAIL_R : SNAIL_G, fx = e.vx > 0;
          if (e.st === 0) {
            draw(((e.tm >> 3) & 1) ? 'snail1' : 'snail0', pal, x, e.y - 24, fx);
            if (e.wing) draw(((fr >> 3) & 1) ? 'wing1' : 'wing0', pal, x + (fx ? -5 : 5), e.y - 20, fx);
          } else if (e.st === 4) draw('shell', pal, x, e.y - 16, (fr >> 1) & 1);
          else draw(e.st === 3 && e.tm > CFG.shellWake - 70 && (fr & 4) ? 'shellPeek' : 'shell', pal, x, e.y - 16, false, e.st === 2);
          break;
        }
        case 'bullet': draw('bullet', BULLET, x, e.y - 16, e.vx > 0, e.st === 2); break;
        case 'boss': draw(e.ft > e.fire * 2 - 30 || e.ft < 20 ? 'boss1' : 'boss0', BOSS, x, e.y - 32, e.face > 0, e.st === 2); break;
        case 'flame': draw(((fr >> 2) & 1) ? 'flame1' : 'flame0', FIRE, x, e.y - 4, e.vx > 0); break;
        case 'firebar': {
          const ca = Math.cos(e.ang), sa = Math.sin(e.ang), f = (fr >> 2) & 3;
          for (let i = 0; i < e.n; i++) draw('fb', FIRE, e.cx + ca * i * 8 - cam - 4, e.cy + sa * i * 8 - 4, f & 1, f & 2);
          break;
        }
        case 'item': if (!e.em) itemDraw(e, fr, cam); break;
        case 'fb':
          if (e.st) { ctx.fillStyle = e.tm & 2 ? NES.wht : NES.lava; const r = 2 + e.tm; ctx.fillRect(Math.round(x - r), Math.round(e.y - 1), r * 2, 2); ctx.fillRect(Math.round(x - 1), Math.round(e.y - r), 2, r * 2); }
          else { const f = (fr >> 1) & 3; draw('fb', FIRE, x - 4, e.y - 4, f & 1, f & 2); }
          break;
        case 'lift': {
          const lx = Math.round(x), ly = Math.round(e.y);
          ctx.fillStyle = NES.blk; ctx.fillRect(lx, ly, e.w, 8);
          ctx.fillStyle = NES.org; ctx.fillRect(lx + 1, ly + 1, e.w - 2, 6);
          ctx.fillStyle = NES.lt; ctx.fillRect(lx + 1, ly + 1, e.w - 2, 1);
          ctx.fillStyle = '#C86800'; ctx.fillRect(lx + 1, ly + 5, e.w - 2, 2);
          ctx.fillStyle = NES.brn; for (let i = 4; i < e.w; i += 8) ctx.fillRect(lx + i - 1, ly + 3, 3, 2);
          ctx.fillStyle = NES.lt; for (let i = 4; i < e.w; i += 8) ctx.fillRect(lx + i - 1, ly + 3, 1, 1);
          ctx.fillStyle = NES.blk; ctx.fillRect(lx + 2, ly + 8, 1, 3); ctx.fillRect(lx + e.w - 3, ly + 8, 1, 3);
          break;
        }
        case 'spring': {
          const h = 32 - e.comp, sx = Math.round(x), sy = Math.round(e.y - h);
          ctx.fillStyle = NES.blk; ctx.fillRect(sx + 1, sy, 14, 5); ctx.fillRect(sx + 1, e.y - 5, 14, 5);
          ctx.fillStyle = NES.red; ctx.fillRect(sx + 2, sy + 1, 12, 3); ctx.fillRect(sx + 2, e.y - 4, 12, 3);
          ctx.fillStyle = '#FC7460'; ctx.fillRect(sx + 2, sy + 1, 12, 1); ctx.fillRect(sx + 2, e.y - 4, 12, 1);
          ctx.fillStyle = '#881400'; ctx.fillRect(sx + 2, sy + 3, 12, 1); ctx.fillRect(sx + 2, e.y - 2, 12, 1);
          ctx.fillStyle = NES.blk; for (let yy = sy + 5; yy < e.y - 5; yy += 3) ctx.fillRect(sx + 3 + ((yy >> 1) & 1) * 2, yy + 1, 8, 2);
          ctx.fillStyle = NES.lgry; for (let yy = sy + 5; yy < e.y - 5; yy += 3) ctx.fillRect(sx + 3 + ((yy >> 1) & 1) * 2, yy, 8, 1);
          ctx.fillStyle = NES.gry; for (let yy = sy + 5; yy < e.y - 5; yy += 3) ctx.fillRect(sx + 3 + ((yy >> 1) & 1) * 2, yy + 1, 8, 1);
          break;
        }
      }
    }
    function world(W, fr, opts = {}) {
      const A = W.A, cam = Math.floor(W.cam), K = KIND[A.kind], tf = (fr >> 3) % 6;
      const qf = [0, 0, 0, 1, 2, 1][tf];
      ctx.fillStyle = K.sky; ctx.fillRect(0, 0, 256, 240);
      for (const [n, dx, dy] of decorFor(A)) {
        if (dx - cam > 256 || dx - cam < -96) continue;
        const c = n.startsWith('hill') ? hill(+n[4]) : n.startsWith('cloud') ? puff(+n[5] + 1, true) : puff(+n[4], false);
        ctx.drawImage(c, dx - cam, dy);
      }
      if (A.castle && A.kind !== 'castle') castle(A.castle * 16 - cam, 128, W.cflag);
      if (A.flag) {
        const fx = A.flag * 16 + 7 - cam;
        ctx.fillStyle = NES.blk; ctx.fillRect(fx - 1, 40, 4, 152);
        ctx.fillStyle = NES.dgrn; ctx.fillRect(fx, 40, 2, 152); ctx.fillStyle = NES.lgrn; ctx.fillRect(fx, 40, 1, 152); ctx.fillStyle = '#E0FC90'; ctx.fillRect(fx, 40, 1, 152 >> 1);
        ctx.fillStyle = NES.blk; ctx.beginPath(); ctx.arc(fx + 1, 36, 4.5, 0, 7); ctx.fill();
        ctx.fillStyle = NES.grn; ctx.beginPath(); ctx.arc(fx + 1, 36, 3.5, 0, 7); ctx.fill();
        ctx.fillStyle = NES.dgrn; ctx.fillRect(fx + 1, 37, 3, 2);
        ctx.fillStyle = '#E0FC90'; ctx.fillRect(fx - 1, 34, 2, 2);
        draw('flag', { a: NES.wht, b: NES.grn }, fx - 15, W.flagY);
      }
      for (const e of W.ents) {
        if (e.t === 'plant') draw(((fr >> 3) & 1) ? 'plant1' : 'plant0', PLANT, e.x + 8 - cam, e.y0 - e.off);
        else if (e.t === 'item' && e.em) itemDraw(e, fr, cam);
        else if (e.t === 'pod' && e.st) draw('pod', FIRE, e.x - cam, e.y - 16, false, e.vy > 0);
      }
      if (W.p.behind && !opts.noHero) hero(W, fr, cam);
      const c0 = Math.floor(cam / 16), off = cam - c0 * 16;
      for (let r = 0; r < 15; r++) for (let c = 0; c <= 16; c++) {
        const t = tileAt(A, c0 + c, r);
        if (!t || t === T.HC || t === T.H1 || (c0 + c) >= A.w) continue;
        let dy = 0;
        for (const b of W.bumps) if (b.cx === c0 + c && b.cy === r) dy = -[0, 2, 4, 5, 6, 6, 5, 4, 2, 1][b.t] || 0;
        ctx.drawImage(tile(t, A.kind, t === T.QC || t === T.QP || t === T.COIN ? qf : t === T.AXE ? tf : t === T.LAVT || t === T.LAVA ? (fr >> 3) & 7 : 0), c * 16 - off, r * 16 + dy);
      }
      for (const e of W.ents) if (e.t !== 'plant' && e.t !== 'pod' && e.t !== 'fb' && !(e.t === 'item' && e.em)) ent(W, e, fr, cam);
      if (!W.p.behind && !opts.noHero) hero(W, fr, cam);
      for (const e of W.ents) if (e.t === 'fb') ent(W, e, fr, cam);
      for (const f of W.fx) {
        const x = f.x - cam;
        if (f.t === 'txt') text(f.s, x, f.y, NES.wht);
        else if (f.t === 'coin') draw('coin' + ((f.life >> 1) & 3), coinPal(0, 'over'), x, f.y);
        else if (f.t === 'deb') { ctx.fillStyle = K.k; ctx.fillRect(Math.round(x), Math.round(f.y), 8, 8); ctx.fillStyle = K.b; ctx.fillRect(Math.round(x) + 1, Math.round(f.y) + 1, 6, 6); ctx.fillStyle = K.a; ctx.fillRect(Math.round(x) + 1, Math.round(f.y) + 1, 6, 1); ctx.fillRect(Math.round(x) + 1, Math.round(f.y) + 1, 1, 6); ctx.fillStyle = mix(K.b, K.k, .5); ctx.fillRect(Math.round(x) + 1, Math.round(f.y) + 6, 6, 1); }
        else if (f.t === 'boom') {
          const r = Math.min(f.life, 14) + 2;
          ctx.fillStyle = f.life & 4 ? NES.wht : NES.lava;
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(f.y + Math.sin(a) * r), 2, 2); }
          ctx.fillStyle = NES.ored; ctx.fillRect(Math.round(x - 2), Math.round(f.y - 2), 4, 4);
        }
      }
      for (const l of A.labels) { const lx = l.x * 16 - cam; if (lx > -200 && lx < 256) text(l.s, lx, l.y * 16); }
      if (W.msg) {
        const fin = LEVELS[W.li].castle === 2;
        if (A.npc) { let r = 4; while (r < 14 && !solidAt(A, A.npc, r)) r++; fin ? draw('princess', { a: NES.org, b: NES.wht, c: NES.lt, d: NES.blk, e: NES.gold, f: NES.red }, A.npc * 16 - cam, r * 16 - 24) : draw('npc', { a: NES.wht, b: NES.red, c: NES.lt, d: NES.blk, e: '#0058F8', f: NES.brn }, A.npc * 16 - cam, r * 16 - 24); }
        text('THANK YOU MARIO!', 64, 56);
        if (W.msg > 60) { if (fin) { text('YOUR QUEST IS OVER.', 52, 80); text('WE PRESENT YOU A NEW', 48, 104); text('QUEST.', 104, 120); } else { text('BUT OUR PRINCESS IS IN', 40, 80); text('ANOTHER CASTLE!', 68, 96); } }
      }
    }
    function hud(st) {
      const T2 = (q, x, y) => text(q, x, y, NES.wht, 1, true);
      T2('MARIO', 24, 16); T2(String(st.score).padStart(6, '0'), 24, 24);
      const cf = st.coinFr || 0;
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(90, 25, 5, 7);
      ctx.fillStyle = [NES.org, NES.org, NES.brn, '#883400'][cf & 3]; ctx.fillRect(89, 24, 5, 7); ctx.fillStyle = NES.blk; ctx.fillRect(91, 25, 1, 5);
      ctx.fillStyle = NES.lt; ctx.fillRect(89, 24, 5, 1);
      T2('*' + String(st.coins).padStart(2, '0'), 96, 24);
      T2('WORLD', 144, 16); T2(st.world, 152, 24);
      T2('TIME', 200, 16); if (st.time != null) T2(String(st.time).padStart(3, '0'), 208, 24);
    }
    return { ctx, draw, text, world, hud, spr, tile };
  }

  function makeAudio(api) {
    let ac = null, master = null, nbuf = null, bus = null, song = null, sname = '', step = 0, nextT = 0, jEnd = 0;
    const waves = {};
    const audio = { tempo: 1 };
    const NOTE = { c: 0, 'c#': 1, d: 2, 'd#': 3, e: 4, f: 5, 'f#': 6, g: 7, 'g#': 8, a: 9, 'a#': 10, b: 11 };
    const parse = s => { const out = []; let at = 0; for (const tk of s.trim().split(/\s+/)) { const [n, l] = tk.split('.'); const len = +l; if (n !== '-') { const m = /^([a-g]#?)(\d)$/.exec(n); out.push({ s: at, f: m ? 440 * Math.pow(2, (12 * (+m[2] + 1) + NOTE[m[1]] - 69) / 12) : 0, n, d: len }); } at += len; } return { ev: out, len: at }; };
    const SONGS = {
      over: { sd: 0.1, loop: 1, ch: [
        ['p25', 0.5, 'c5.2 e5.2 g5.2 e5.1 g5.1 a5.2 g5.2 e5.4 f5.2 a5.2 c6.2 a5.2 g5.4 -.4 e5.2 g5.2 c6.2 b5.1 a5.1 g5.2 e5.2 d5.2 e5.2 c5.2 d5.2 e5.2 d5.2 c5.4 -.4 a4.2 c5.2 f5.2 c5.2 a5.3 g5.1 f5.4 g4.2 b4.2 d5.2 f5.2 e5.2 d5.2 c5.4 d5.1 e5.1 f5.2 e5.1 d5.1 c5.2 d5.2 g5.2 -.4 c6.2 g5.2 e5.2 d5.2 c5.4 -.4'],
        ['p12', 0.22, [['e4', 'g4'], ['f4', 'a4'], ['e4', 'g4'], ['e4', 'g4'], ['f4', 'a4'], ['d4', 'b3'], ['d4', 'f4'], ['e4', 'g4']].map(([a, b]) => `-.2 ${a}.1 -.1 -.2 ${b}.1 -.1 -.2 ${a}.1 -.1 -.2 ${b}.1 -.1`).join(' ')],
        ['tri', 0.55, [['c3', 'g3', 'c4'], ['f2', 'c3', 'f3'], ['c3', 'g3', 'c4'], ['g2', 'd3', 'g3'], ['f2', 'c3', 'f3'], ['g2', 'd3', 'g3'], ['g2', 'd3', 'g3'], ['c3', 'g3', 'c4']].map(([r, f, o]) => `${r}.2 -.2 ${f}.2 -.2 ${r}.2 -.2 ${f}.1 ${o}.1 -.2`).join(' ')],
        ['noi', 0.3, Array(8).fill('k.2 h.2 s.2 h.2 k.2 h.2 s.2 h.1 h.1').join(' ')]
      ] },
      under: { sd: 0.12, loop: 1, ch: [
        ['p50', 0.3, 'e4.1 -.1 g4.1 -.1 b4.1 -.1 a#4.1 -.1 a4.1 -.7 d4.1 -.1 f4.1 -.1 a4.1 -.1 g#4.1 -.1 g4.1 -.7 c4.1 -.1 e4.1 -.1 g4.1 -.1 f#4.1 -.1 f4.1 -.3 e4.1 -.1 d#4.1 -.1 e4.1 -.1 b3.1 -.1 e4.2 -.10'],
        ['tri', 0.6, 'e2.1 -.3 e2.1 -.3 e3.1 -.3 e2.1 -.3 d2.1 -.3 d2.1 -.3 d3.1 -.3 d2.1 -.3 c2.1 -.3 c2.1 -.3 c3.1 -.3 c2.1 -.3 b1.1 -.3 b1.1 -.3 e2.2 -.6'],
        ['noi', 0.18, Array(16).fill('h.1 -.3').join(' ')]
      ] },
      castle: { sd: 0.11, loop: 1, ch: [
        ['p25', 0.32, 'd5.1 c#5.1 d5.1 c#5.1 d5.1 a#4.1 d5.1 a4.1 d5.1 g#4.1 d5.1 a4.1 d5.1 a#4.1 d5.1 c#5.1 c5.1 b4.1 c5.1 b4.1 c5.1 g#4.1 c5.1 g4.1 c5.1 f#4.1 c5.1 g4.1 c5.1 g#4.1 c5.1 b4.1 g5.1 f#5.1 g5.1 f#5.1 g5.1 d#5.1 g5.1 d5.1 g5.1 c#5.1 g5.1 d5.1 g5.1 d#5.1 g5.1 f#5.1 d5.1 c#5.1 d5.1 c#5.1 d5.1 a#4.1 d5.1 a4.1 d5.1 g#4.1 d5.1 a4.1 d5.1 a#4.1 d5.1 c#5.1'],
        ['p12', 0.16, 'd4.16 c4.16 g4.16 d4.16'],
        ['tri', 0.55, 'd2.2 -.2 a1.2 -.2 d2.2 -.2 a#1.2 -.2 c2.2 -.2 g1.2 -.2 c2.2 -.2 g#1.2 -.2 g2.2 -.2 d2.2 -.2 g2.2 -.2 d#2.2 -.2 d2.2 -.2 a1.2 -.2 d2.2 -.2 c#2.2 -.2']
      ] },
      star: { sd: 0.075, loop: 1, ch: [
        ['p25', 0.45, 'c5.1 e5.1 g5.1 c6.1 g5.1 e5.1 c5.1 e5.1 d5.1 f5.1 a5.1 d6.1 a5.1 f5.1 d5.1 f5.1 b4.1 d5.1 g5.1 b5.1 g5.1 d5.1 b4.1 d5.1 c5.1 e5.1 g5.1 c6.1 e6.2 -.2'],
        ['tri', 0.55, 'c3.2 c4.2 c3.2 c4.2 d3.2 d4.2 d3.2 d4.2 g2.2 g3.2 g2.2 g3.2 c3.2 c4.2 c3.2 -.2'],
        ['noi', 0.28, Array(8).fill('k.1 h.1 s.1 h.1').join(' ')]
      ] },
      clear: { sd: 0.1, ch: [['p25', 0.5, 'c5.1 e5.1 g5.1 c6.3 f5.1 a5.1 c6.1 f6.3 g5.1 b5.1 d6.1 g6.3 e6.2 f6.2 g6.10'], ['p12', 0.25, 'e4.6 a4.6 b4.6 c5.14'], ['tri', 0.55, 'c3.6 f3.6 g3.6 g3.4 c3.10']] },
      castleclear: { sd: 0.11, ch: [['p25', 0.5, 'e5.2 g5.2 c6.4 g5.2 e5.2 a5.4 f5.2 a5.2 d6.4 b5.2 g5.2 c6.12'], ['tri', 0.55, 'c3.4 c3.4 f3.4 f3.4 g3.4 g3.4 c3.12']] },
      die: { sd: 0.1, ch: [['p25', 0.5, '-.4 c6.2 b5.2 a#5.2 a5.4 -.2 e5.2 c5.2 -.2 g4.2 c4.8'], ['tri', 0.5, '-.4 c3.6 f2.6 -.4 g2.2 c2.8']] },
      gameover: { sd: 0.13, ch: [['p25', 0.45, 'e5.4 d5.4 c5.6 -.2 a4.4 g4.4 e4.4 c4.12'], ['tri', 0.5, 'a2.8 f2.8 g2.8 c2.12']] },
      hurry: { sd: 0.07, ch: [['p25', 0.45, 'c6.1 c#6.1 d6.1 -.1 d6.1 d#6.1 e6.1 -.1 e6.1 f6.1 f#6.1 -.1 g6.4 -.4'], ['p12', 0.3, 'g5.1 g#5.1 a5.1 -.1 a5.1 a#5.1 b5.1 -.1 b5.1 c6.1 c#6.1 -.1 d6.4 -.4']] }
    };
    for (const k in SONGS) {
      const S = SONGS[k];
      S.chs = S.ch.map(([w, v, s]) => { const p = parse(s); const at = []; for (const e of p.ev) (at[e.s] = at[e.s] || []).push(e); S.len = Math.max(S.len || 0, p.len); return { w, v, at }; });
    }
    function ensure() {
      if (ac) return ac;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ac = new AC(); } catch (e) { return null; }
      master = ac.createGain(); master.gain.value = 0.2; master.connect(ac.destination);
      nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      for (const [k, duty] of [['p12', 0.125], ['p25', 0.25], ['p50', 0.5]]) {
        const n = 32, re = new Float32Array(n), im = new Float32Array(n);
        for (let i = 1; i < n; i++) { re[i] = Math.sin(2 * Math.PI * i * duty) / (i * Math.PI); im[i] = (1 - Math.cos(2 * Math.PI * i * duty)) / (i * Math.PI); }
        waves[k] = ac.createPeriodicWave(re, im);
      }
      return ac;
    }
    function tone(dest, w, f, t, d, v, f2) {
      const o = ac.createOscillator(), g = ac.createGain();
      if (w === 'tri') o.type = 'triangle'; else o.setPeriodicWave(waves[w] || waves.p50);
      o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + d * 0.6); g.gain.linearRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.03);
    }
    function noise(dest, t, d, v, rate, hp) {
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = nbuf; s.playbackRate.value = rate;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      if (hp) { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); f.connect(g); } else s.connect(g);
      g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
    }
    function stopMusic() { if (bus) { try { bus.gain.cancelScheduledValues(0); bus.gain.value = 0; bus.disconnect(); } catch (e) {} } bus = null; song = null; sname = ''; }
    function startSong(name) {
      stopMusic();
      if (!name || !ensure() || api.muted) return;
      bus = ac.createGain(); bus.gain.value = 1; bus.connect(master);
      song = SONGS[name]; sname = name; step = 0; nextT = ac.currentTime + 0.05;
      if (!song.loop) jEnd = nextT + song.len * song.sd + 0.25;
    }
    audio.music = name => {
      if (ac && ac.currentTime < jEnd) return;
      if (name === sname && (song || !name)) return;
      if (!name) { stopMusic(); return; }
      startSong(name);
    };
    audio.jingle = name => { jEnd = 0; startSong(name); };
    audio.stop = () => { jEnd = 0; stopMusic(); };
    audio.busy = () => !!(ac && ac.currentTime < jEnd);
    audio.pump = () => {
      if (!ac || !song) return;
      if (api.muted) { stopMusic(); jEnd = 0; return; }
      const sd = song.sd / (song.loop ? audio.tempo : 1);
      if (nextT < ac.currentTime - 0.3) nextT = ac.currentTime + 0.02;
      while (song && nextT < ac.currentTime + 0.15) {
        for (const ch of song.chs) {
          const evs = ch.at[step];
          if (!evs) continue;
          for (const e of evs) {
            const d = e.d * sd;
            if (ch.w === 'noi') { if (e.n === 'k') noise(bus, nextT, 0.12, ch.v * 1.4, 0.25); else if (e.n === 's') noise(bus, nextT, 0.1, ch.v, 1, 1500); else noise(bus, nextT, 0.04, ch.v * 0.7, 1, 6000); }
            else tone(bus, ch.w, e.f, nextT, Math.max(0.04, d * 0.92), ch.v * (ch.w === 'tri' ? 1 : 0.6));
          }
        }
        step++; nextT += sd;
        if (step >= song.len) { if (song.loop) step = 0; else { song = null; sname = ''; } }
      }
    };
    audio.sfx = name => {
      if (api.muted || !ensure()) return;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      const t = ac.currentTime + 0.005, m = master;
      const seq = (w, notes, d, v) => notes.forEach((f, i) => tone(m, w, f, t + i * d, d * 1.1, v));
      switch (name) {
        case 'jump': tone(m, 'p25', 330, t, 0.2, 0.32, 900); break;
        case 'jumpbig': tone(m, 'p25', 260, t, 0.24, 0.32, 720); break;
        case 'coin': tone(m, 'p25', 880, t, 0.07, 0.3); tone(m, 'p25', 1319, t + 0.07, 0.42, 0.28); break;
        case 'stomp': tone(m, 'p50', 500, t, 0.09, 0.3, 160); noise(m, t, 0.06, 0.25, 0.6); break;
        case 'kick': tone(m, 'p50', 1200, t, 0.06, 0.25, 600); break;
        case 'bump': tone(m, 'p50', 180, t, 0.09, 0.4, 90); break;
        case 'break': noise(m, t, 0.35, 0.45, 0.35); tone(m, 'p50', 150, t, 0.12, 0.25, 60); break;
        case 'sprout': seq('p25', [392, 523, 659, 784, 1047, 784, 1047], 0.04, 0.25); break;
        case 'powerup': seq('p25', [523, 659, 784, 1047, 659, 784, 1047, 1319, 784, 1047, 1319, 1568], 0.035, 0.26); break;
        case '1up': seq('p25', [1047, 1319, 1568, 2093, 1568, 2093], 0.07, 0.25); break;
        case 'pipe': case 'hurt': for (let i = 0; i < 3; i++) tone(m, 'p50', 600, t + i * 0.09, 0.08, 0.3, 200); break;
        case 'fire': tone(m, 'p50', 1600, t, 0.05, 0.2, 400); noise(m, t, 0.05, 0.15, 2); break;
        case 'tick': tone(m, 'p25', 1760, t, 0.03, 0.18); break;
        case 'boom': noise(m, t, 0.6, 0.6, 0.2); break;
        case 'cannon': noise(m, t, 0.3, 0.5, 0.25); tone(m, 'tri', 120, t, 0.15, 0.6, 50); break;
        case 'flame': noise(m, t, 0.7, 0.35, 0.5, 400); break;
        case 'bridge': noise(m, t, 0.08, 0.35, 0.8); break;
        case 'bossfall': tone(m, 'p50', 700, t, 1.2, 0.3, 60); break;
        case 'flag': tone(m, 'p25', 1500, t, 1.1, 0.25, 180); for (let i = 0; i < 8; i++) tone(m, 'p12', 1200 - i * 120, t + i * 0.13, 0.1, 0.12); break;
        case 'pause': seq('p25', [1319, 1047, 1319, 1047], 0.08, 0.25); break;
        case 'select': tone(m, 'p25', 988, t, 0.06, 0.25); break;
      }
    };
    audio.unlock = () => { if (ensure() && ac.state === 'suspended') ac.resume().catch(() => {}); };
    audio.destroy = () => { stopMusic(); if (ac) { try { ac.close(); } catch (e) {} } ac = null; };
    return audio;
  }

  const ID = 'brick-bros';
  GAME.makeRenderer = makeRenderer;
  const MUS = { over: 'over', tree: 'over', under: 'under', bonus: 'under', castle: 'castle' };
  const PLAYING = { play: 1, grow: 1, shrink: 1, power: 1, pipeIn: 1, pipeOut: 1 };

  Ameplay.register({
    id: ID,
    title: 'Brick Bros',
    category: 'Arcade',
    tint: '#5C94FC',
    blurb: 'Run, jump and stomp through 8 classic side-scrolling stages.',
    help: '<kbd>←</kbd> <kbd>→</kbd> move · <kbd>Z</kbd>/<kbd>Shift</kbd> run &amp; fire · <kbd>X</kbd>/<kbd>Space</kbd>/<kbd>↑</kbd> jump · <kbd>↓</kbd> pipes · <kbd>Enter</kbd> start/pause · on-screen pad on touch',
    width: 800,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="4"/><path d="M25 27a7 7 0 1 1 10 6c-2 1-3 2-3 5"/><circle cx="32" cy="45" r="1.5"/><circle cx="16" cy="16" r="1"/><circle cx="48" cy="16" r="1"/><circle cx="16" cy="48" r="1"/><circle cx="48" cy="48" r="1"/></svg>',
    css: `
.gm-brick-bros{gap:10px}
.gm-brick-bros .g-canvas{image-rendering:pixelated;image-rendering:crisp-edges;background:#000;border-radius:10px}
.gm-brick-bros .bb-pad{display:none;width:min(100%,520px);box-sizing:border-box;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:14px;background:linear-gradient(#d4d4d4,#b0b0b0);box-shadow:inset 0 2px 0 #f2f2f2,0 4px 0 #8a8a8a;touch-action:none;user-select:none;-webkit-user-select:none}
.gm-brick-bros.touch .bb-pad{display:flex}
.gm-brick-bros .bb-dpad{position:relative;width:112px;height:112px;flex:none;touch-action:none}
.gm-brick-bros .bb-dpad i{position:absolute;background:#1d1d1d;border-radius:5px;box-shadow:inset 0 -3px 0 #000}
.gm-brick-bros .bb-dpad .h{left:0;top:38px;width:112px;height:36px}
.gm-brick-bros .bb-dpad .v{left:38px;top:0;width:36px;height:112px}
.gm-brick-bros .bb-dpad b{position:absolute;width:0;height:0;border:8px solid transparent;opacity:.55}
.gm-brick-bros .bb-dpad b.on{opacity:1}
.gm-brick-bros .bb-dpad .al{left:6px;top:48px;border-right-color:#777;border-left:0}
.gm-brick-bros .bb-dpad .ar{right:6px;top:48px;border-left-color:#777;border-right:0}
.gm-brick-bros .bb-dpad .au{left:48px;top:6px;border-bottom-color:#777;border-top:0}
.gm-brick-bros .bb-dpad .ad{left:48px;bottom:6px;border-top-color:#777;border-bottom:0}
.gm-brick-bros .bb-dpad b.on.al{border-right-color:#fff}.gm-brick-bros .bb-dpad b.on.ar{border-left-color:#fff}.gm-brick-bros .bb-dpad b.on.ad{border-top-color:#fff}
.gm-brick-bros .bb-mid{display:flex;flex-direction:column;gap:10px;align-items:center}
.gm-brick-bros .bb-mid button{width:54px;height:30px;padding:0;border-radius:15px;border:0;background:#3a3a3a;color:#e8e8e8;font:900 9px/1 var(--sans);letter-spacing:.06em;box-shadow:inset 0 -3px 0 #111;touch-action:none}
.gm-brick-bros .bb-mid button.on{background:#111}
.gm-brick-bros .bb-ab{display:flex;gap:10px;padding:8px;border-radius:12px;background:#1d1d1d;flex:none}
.gm-brick-bros .bb-ab button{width:54px;height:54px;padding:0;border-radius:50%;border:0;background:radial-gradient(circle at 40% 35%,#ff6b5a,#c8102e 70%);box-shadow:0 4px 0 #5a0000;color:#fff;font:900 19px/1 var(--sans);touch-action:none}
.gm-brick-bros .bb-ab button.on{transform:translateY(3px);box-shadow:0 1px 0 #5a0000}
`,
    sim: GAME,
    mount(root, api) {
      const keys = api.keys;
      const view = api.canvas(768, 720);
      const ctx = view.ctx;
      view.canvas.style.imageRendering = 'pixelated';
      const off = document.createElement('canvas');
      off.width = 256; off.height = 240;
      const R = makeRenderer(off.getContext('2d'));
      const audio = makeAudio(api);
      root.insertAdjacentHTML('beforeend', '<div class="bb-pad"><div class="bb-dpad"><i class="h"></i><i class="v"></i><b class="al"></b><b class="ar"></b><b class="au"></b><b class="ad"></b></div><div class="bb-mid"><button data-k="sel">SELECT</button><button data-k="start">START</button></div><div class="bb-ab"><button data-k="b">B</button><button data-k="a">A</button></div></div>');
      const pad = root.querySelector('.bb-pad'), dpad = pad.querySelector('.bb-dpad');
      const btn = k => pad.querySelector(`[data-k="${k}"]`);
      const bB = btn('b'), bA = btn('a'), bSel = btn('sel'), bStart = btn('start');
      if (matchMedia('(pointer: coarse)').matches) root.classList.add('touch');

      const sv = Object.assign({ unlock: 0, top: 0 }, api.load() || {});
      let mode = 'title', timer = 0, frame = 0, sel = 0, paused = false, W = null, run = null, submitted = false, lastScore = -1, prevInp = 0, newBest = false, acc = 0, touchBits = 0;
      const titleW = GAME.newWorld(0, {}, false, 1);
      const STEP = 1 / 60;

      const has = (...c) => c.some(k => keys.has(k));
      const bits = () => (has('ArrowLeft', 'KeyA') ? 1 : 0) | (has('ArrowRight', 'KeyD') ? 2 : 0) | (has('ArrowDown', 'KeyS') ? 4 : 0) | (has('KeyX', 'Space', 'ArrowUp', 'KeyW', 'KeyK') ? 16 : 0) | (has('KeyZ', 'ShiftLeft', 'ShiftRight', 'KeyJ') ? 32 : 0) | (has('Enter', 'KeyP') ? 64 : 0) | touchBits;

      const save = () => api.save(sv);
      const unlock = li => { if (li > sv.unlock && li < LEVELS.length) { sv.unlock = li; save(); } };
      function startRun() {
        run = { li: sel, score: 0, coins: 0, lives: 3, big: false, fire: false, mid: false };
        submitted = false; newBest = false; mode = 'intro'; timer = 0; api.score(0); lastScore = 0;
        audio.unlock(); audio.stop();
      }
      function beginLevel() {
        W = GAME.newWorld(run.li, run, run.mid, (Math.random() * 1e9) | 0);
        mode = 'play'; paused = false; audio.tempo = 1; lastScore = -1;
      }
      function finish(won) {
        if (!submitted) { submitted = true; newBest = api.submit(run.score); }
        if (run.score > sv.top) { sv.top = run.score; save(); }
        mode = won ? 'win' : 'over'; timer = 0;
        if (won) { sv.unlock = LEVELS.length - 1; save(); } else audio.jingle('gameover');
      }
      function afterDeath() { if (run.lives <= 0) finish(false); else { mode = 'intro'; timer = 0; } }
      function onResult() {
        const r = W.result;
        run.score = W.score; run.coins = W.coins; run.lives = W.lives;
        if (r === 'clear' || r === 'warp') {
          run.big = W.p.big; run.fire = W.p.fire; run.mid = false;
          run.li = r === 'warp' ? W.warp : run.li + 1;
          unlock(run.li); mode = 'intro'; timer = 0;
        } else if (r === 'win') finish(true);
        else {
          run.lives--; run.big = false; run.fire = false; run.mid = W.mid;
          if (W.timeUp) { mode = 'timeup'; timer = 0; } else afterDeath();
        }
      }
      function toTitle() { mode = 'title'; timer = 0; W = null; sel = Math.min(sel, sv.unlock); audio.stop(); }
      function onEv(n) {
        if (n === 'die') audio.jingle('die');
        else if (n === 'flag') { audio.stop(); audio.sfx('flag'); }
        else if (n === 'clear') audio.jingle('clear');
        else if (n === 'axe') audio.stop();
        else if (n === 'castleclear') audio.jingle('castleclear');
        else if (n === 'hurry') { audio.tempo = 1.45; audio.jingle('hurry'); }
        else audio.sfx(n);
      }
      function tick() {
        frame++;
        const inp = bits(), pr = inp & ~prevInp;
        prevInp = inp;
        switch (mode) {
          case 'title':
            if (pr & 3 || pr & 128) { const n = sv.unlock + 1; sel = (sel + (pr & 1 ? n - 1 : 1)) % n; audio.sfx('select'); }
            else if (pr & 80) startRun();
            break;
          case 'intro': if (++timer > 165) beginLevel(); break;
          case 'play':
            if (pr & 64) { paused = !paused; audio.stop(); audio.sfx('pause'); }
            if (paused) break;
            GAME.step(W, inp & 63);
            for (const n of W.ev) onEv(n);
            if (W.score !== lastScore) api.score(lastScore = W.score);
            if (W.state === 'done') onResult();
            break;
          case 'timeup': if (++timer > 150) afterDeath(); break;
          case 'over': if (++timer > 280 || (timer > 60 && (pr & 80))) toTitle(); break;
          case 'win': if (++timer > 90 && (pr & 80)) toTitle(); break;
        }
        if (mode === 'play' && !paused && W) audio.music(PLAYING[W.state] ? (W.p.star > 50 ? 'star' : MUS[W.A.kind]) : null);
        else if (mode !== 'over') audio.music(null);
      }
      const coinFr = () => [0, 0, 0, 1, 2, 1][(frame >> 3) % 6];
      function hudFor(time, world) { return { score: run ? (W ? W.score : run.score) : 0, coins: run ? (W ? W.coins : run.coins) : 0, world: world || LEVELS[run ? run.li : sel].name, time, coinFr: coinFr() }; }
      function black() { const c = R.ctx; c.fillStyle = '#000'; c.fillRect(0, 0, 256, 240); }
      function render() {
        const c = R.ctx;
        if (mode === 'title') {
          R.world(titleW, frame);
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(41, 35, 178, 90);
          c.fillStyle = NES.blk; c.fillRect(39, 31, 178, 90);
          c.fillStyle = NES.lt; c.fillRect(40, 32, 176, 88);
          c.fillStyle = '#C07868'; c.fillRect(40, 118, 176, 2); c.fillRect(214, 32, 2, 88);
          c.fillStyle = NES.brn; c.fillRect(42, 34, 172, 84);
          c.fillStyle = '#E8661C'; c.fillRect(42, 34, 172, 38);
          c.fillStyle = '#E87C3C'; c.fillRect(42, 34, 172, 1); c.fillRect(42, 34, 1, 84);
          c.fillStyle = '#8C3004'; c.fillRect(42, 116, 172, 2); c.fillRect(212, 34, 2, 84);
          c.fillStyle = NES.blk; for (const [x, y] of [[45, 37], [209, 37], [45, 113], [209, 113]]) { c.fillRect(x, y, 2, 2); c.fillStyle = NES.lt; c.fillRect(x, y, 1, 1); c.fillStyle = NES.blk; }
          R.text('SUPER', 54, 40, NES.blk, 2); R.text('SUPER', 53, 39, NES.lt, 2);
          R.text('MARIO', 70, 61, '#5C1800', 3); R.text('MARIO', 69, 59, NES.blk, 3); R.text('MARIO', 68, 58, NES.lt, 3);
          R.text('BROS.', 70, 91, '#5C1800', 3); R.text('BROS.', 69, 89, NES.blk, 3); R.text('BROS.', 68, 88, NES.lt, 3);
          R.text('@2026 GAMEPLAY', 104, 124, NES.lt);
          R.text('1 PLAYER GAME', 88, 142);
          R.draw('bean', { a: NES.red, d: NES.blk }, 74, 143);
          R.text((sv.unlock ? '< ' : '  ') + 'WORLD ' + LEVELS[sel].name + (sv.unlock ? ' >' : ''), 72, 158);
          R.text('TOP- ' + String(sv.top).padStart(6, '0'), 96, 178);
          if ((frame >> 5) & 1) R.text('PUSH START', 88, 200);
          R.hud({ score: run ? run.score : 0, coins: 0, world: LEVELS[sel].name, time: null, coinFr: coinFr() });
        } else if (mode === 'intro') {
          black(); R.hud(hudFor(null));
          R.text('WORLD ' + LEVELS[run.li].name, 88, 80);
          R.draw('s_stand', HERO_PAL, 96, 102);
          R.text('*  ' + run.lives, 120, 108);
        } else if (mode === 'play') {
          R.world(W, frame);
          R.hud(hudFor(W.state === 'done' ? null : W.time));
          if (paused) R.text('PAUSE', 108, 112);
        } else if (mode === 'timeup') { black(); R.hud(hudFor(0)); R.text('TIME UP', 100, 116); }
        else if (mode === 'over') { black(); R.hud(hudFor(null)); R.text('GAME OVER', 92, 116); if (newBest && timer > 40) R.text('NEW BEST!', 92, 136, NES.gold); }
        else if (mode === 'win') {
          black(); R.hud(hudFor(null, '2-4'));
          R.text('CONGRATULATIONS!', 64, 72, NES.gold);
          R.text('ALL 8 STAGES CLEARED', 48, 96);
          R.text('SCORE ' + String(run.score).padStart(6, '0'), 76, 120);
          if (newBest) R.text('NEW BEST!', 92, 140, NES.gold);
          R.draw('s_jump', HERO_PAL, 120, 152 - Math.abs(Math.sin(frame / 12)) * 12);
          if (timer > 90 && (frame >> 5) & 1) R.text('PUSH START', 88, 196);
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, 768, 720);
      }
      function now() {
        if (mode !== 'play' || paused || acc < -STEP * 0.5) { tick(); render(); return; }
        tick(); acc -= STEP; render();
      }
      api.on(window, 'keydown', e => {
        if (e.repeat) return;
        if (/^(Arrow|Key[ADSWXZJKP]|Space|Enter|Shift)/.test(e.code)) { audio.unlock(); now(); }
      });
      const zone = (x, y) => {
        const d = dpad.getBoundingClientRect();
        if (x >= d.left - 14 && x <= d.right + 14 && y >= d.top - 14 && y <= d.bottom + 14) {
          const dx = x - (d.left + d.width / 2), dy = y - (d.top + d.height / 2), r = Math.hypot(dx, dy);
          if (r < d.width * 0.1) return 0;
          return (dx > r * 0.38 ? 2 : 0) | (dx < -r * 0.38 ? 1 : 0) | (dy > r * 0.55 ? 4 : 0) | (dy < -r * 0.55 ? 8 : 0);
        }
        const b = bB.getBoundingClientRect(), a = bA.getBoundingClientRect();
        if (y >= b.top - 26 && y <= b.bottom + 26 && x >= b.left - 18 && x <= a.right + 22) {
          const mid = (b.right + a.left) / 2;
          return Math.abs(x - mid) < 8 ? 48 : x < mid ? 32 : 16;
        }
        for (const [el, v] of [[bSel, 128], [bStart, 64]]) { const q = el.getBoundingClientRect(); if (x >= q.left - 6 && x <= q.right + 6 && y >= q.top - 6 && y <= q.bottom + 6) return v; }
        return 0;
      };
      const ptrs = new Map();
      const sync = () => {
        let v = 0; for (const b of ptrs.values()) v |= b;
        const prev = touchBits; touchBits = v;
        bA.classList.toggle('on', !!(v & 16)); bB.classList.toggle('on', !!(v & 32)); bSel.classList.toggle('on', !!(v & 128)); bStart.classList.toggle('on', !!(v & 64));
        for (const [cls, m] of [['al', 1], ['ar', 2], ['au', 8], ['ad', 4]]) dpad.querySelector('.' + cls).classList.toggle('on', !!(v & m));
        if (v & ~prev) now();
      };
      api.on(pad, 'pointerdown', e => { e.preventDefault(); root.classList.add('touch'); audio.unlock(); ptrs.set(e.pointerId, zone(e.clientX, e.clientY)); sync(); });
      api.on(window, 'pointermove', e => { if (ptrs.has(e.pointerId)) { const z = zone(e.clientX, e.clientY); if (z !== ptrs.get(e.pointerId)) { ptrs.set(e.pointerId, z); sync(); } } });
      const up = e => { if (ptrs.delete(e.pointerId)) sync(); };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);
      api.on(pad, 'contextmenu', e => e.preventDefault());
      api.on(view.canvas, 'pointerdown', e => {
        if (e.pointerType === 'touch') root.classList.add('touch');
        audio.unlock();
        if (mode === 'title') startRun();
        else if (mode === 'over' && timer > 60) toTitle();
        else if (mode === 'win' && timer > 90) toTitle();
      });
      api.loop(dt => {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n < 4) { tick(); acc -= STEP; n++; }
        render();
        audio.pump();
      });
      render();
      return { destroy() { audio.destroy(); } };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bbr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f86f7"/><stop offset="1" stop-color="#6fa3ff"/></linearGradient></defs><rect width="400" height="300" fill="url(#bbr-sky)"/><path d="M-10 252Q60 150 150 252Z" fill="#000"/><path d="M-6 252Q60 156 146 252Z" fill="#00A800"/><g fill="#000"><rect x="52" y="200" width="6" height="12"/><rect x="74" y="218" width="6" height="12"/><rect x="40" y="228" width="6" height="12"/></g><g fill="#fff" stroke="#000" stroke-width="3"><path d="M282 70a16 16 0 0 1 28-12a18 18 0 0 1 32 4a14 14 0 0 1 10 26h-62a14 14 0 0 1-8-18z"/></g><path d="M290 82h58" stroke="#3CBCFC" stroke-width="5"/><g fill="#fff" stroke="#000" stroke-width="3"><path d="M26 54a12 12 0 0 1 22-8a13 13 0 0 1 24 4a10 10 0 0 1 6 20h-46a10 10 0 0 1-6-16z"/></g><rect x="-8" y="252" width="36" height="36" fill="#C84C0C"/><path d="M-8 260.5h36M-8 269.5h36M-8 278.5h36M-8 287h36M8 252v8.5M26 252v8.5M-1 261v8.5M17 261v8.5M8 270v8.5M26 270v8.5M-1 279v8" stroke="#000" stroke-width="2.5"/><rect x="-8" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="28" y="252" width="36" height="36" fill="#C84C0C"/><path d="M28 260.5h36M28 269.5h36M28 278.5h36M28 287h36M44 252v8.5M62 252v8.5M35 261v8.5M53 261v8.5M44 270v8.5M62 270v8.5M35 279v8" stroke="#000" stroke-width="2.5"/><rect x="28" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="64" y="252" width="36" height="36" fill="#C84C0C"/><path d="M64 260.5h36M64 269.5h36M64 278.5h36M64 287h36M80 252v8.5M98 252v8.5M71 261v8.5M89 261v8.5M80 270v8.5M98 270v8.5M71 279v8" stroke="#000" stroke-width="2.5"/><rect x="64" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="100" y="252" width="36" height="36" fill="#C84C0C"/><path d="M100 260.5h36M100 269.5h36M100 278.5h36M100 287h36M116 252v8.5M134 252v8.5M107 261v8.5M125 261v8.5M116 270v8.5M134 270v8.5M107 279v8" stroke="#000" stroke-width="2.5"/><rect x="100" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="136" y="252" width="36" height="36" fill="#C84C0C"/><path d="M136 260.5h36M136 269.5h36M136 278.5h36M136 287h36M152 252v8.5M170 252v8.5M143 261v8.5M161 261v8.5M152 270v8.5M170 270v8.5M143 279v8" stroke="#000" stroke-width="2.5"/><rect x="136" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="172" y="252" width="36" height="36" fill="#C84C0C"/><path d="M172 260.5h36M172 269.5h36M172 278.5h36M172 287h36M188 252v8.5M206 252v8.5M179 261v8.5M197 261v8.5M188 270v8.5M206 270v8.5M179 279v8" stroke="#000" stroke-width="2.5"/><rect x="172" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="208" y="252" width="36" height="36" fill="#C84C0C"/><path d="M208 260.5h36M208 269.5h36M208 278.5h36M208 287h36M224 252v8.5M242 252v8.5M215 261v8.5M233 261v8.5M224 270v8.5M242 270v8.5M215 279v8" stroke="#000" stroke-width="2.5"/><rect x="208" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="244" y="252" width="36" height="36" fill="#C84C0C"/><path d="M244 260.5h36M244 269.5h36M244 278.5h36M244 287h36M260 252v8.5M278 252v8.5M251 261v8.5M269 261v8.5M260 270v8.5M278 270v8.5M251 279v8" stroke="#000" stroke-width="2.5"/><rect x="244" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="280" y="252" width="36" height="36" fill="#C84C0C"/><path d="M280 260.5h36M280 269.5h36M280 278.5h36M280 287h36M296 252v8.5M314 252v8.5M287 261v8.5M305 261v8.5M296 270v8.5M314 270v8.5M287 279v8" stroke="#000" stroke-width="2.5"/><rect x="280" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="316" y="252" width="36" height="36" fill="#C84C0C"/><path d="M316 260.5h36M316 269.5h36M316 278.5h36M316 287h36M332 252v8.5M350 252v8.5M323 261v8.5M341 261v8.5M332 270v8.5M350 270v8.5M323 279v8" stroke="#000" stroke-width="2.5"/><rect x="316" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="352" y="252" width="36" height="36" fill="#C84C0C"/><path d="M352 260.5h36M352 269.5h36M352 278.5h36M352 287h36M368 252v8.5M386 252v8.5M359 261v8.5M377 261v8.5M368 270v8.5M386 270v8.5M359 279v8" stroke="#000" stroke-width="2.5"/><rect x="352" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect x="388" y="252" width="36" height="36" fill="#C84C0C"/><path d="M388 260.5h36M388 269.5h36M388 278.5h36M388 287h36M404 252v8.5M422 252v8.5M395 261v8.5M413 261v8.5M404 270v8.5M422 270v8.5M395 279v8" stroke="#000" stroke-width="2.5"/><rect x="388" y="252" width="36" height="2.5" fill="#FCBCB0"/><rect y="288" width="400" height="12" fill="#C84C0C"/><path d="M0 288h400" stroke="#000" stroke-width="2.5"/><g><rect x="300" y="168" width="66" height="26" fill="#000"/><rect x="303" y="171" width="60" height="20" fill="#00A800"/><rect x="313" y="171" width="12" height="20" fill="#B8F818"/><rect x="306" y="194" width="54" height="58" fill="#000"/><rect x="309" y="194" width="48" height="58" fill="#00A800"/><rect x="318" y="194" width="10" height="58" fill="#B8F818"/><rect x="346" y="194" width="8" height="58" fill="#005800"/><rect x="351" y="171" width="9" height="20" fill="#005800"/></g><rect x="110" y="72" width="36" height="36" fill="#C84C0C"/><path d="M110 80.5h36M110 89.5h36M110 98.5h36M110 107h36M126 72v8.5M144 72v8.5M117 81v8.5M135 81v8.5M126 90v8.5M144 90v8.5M117 99v8" stroke="#000" stroke-width="2.5"/><rect x="110" y="72" width="36" height="2.5" fill="#FCBCB0"/><g><rect x="146" y="64" width="36" height="36" fill="#000"/><rect x="146" y="64" width="34" height="34" fill="#FC9838"/><rect x="146" y="64" width="34" height="2.5" fill="#FCBCB0"/><path d="M157 78a7 7 0 1 1 9 6v4" fill="none" stroke="#C84C0C" stroke-width="5"/><path d="M155 76a7 7 0 1 1 9 6v4" fill="none" stroke="#000" stroke-width="5"/><rect x="161.5" y="90" width="5" height="4" fill="#000"/></g><rect x="182" y="72" width="36" height="36" fill="#C84C0C"/><path d="M182 80.5h36M182 89.5h36M182 98.5h36M182 107h36M198 72v8.5M216 72v8.5M189 81v8.5M207 81v8.5M198 90v8.5M216 90v8.5M189 99v8" stroke="#000" stroke-width="2.5"/><rect x="182" y="72" width="36" height="2.5" fill="#FCBCB0"/><g><ellipse cx="164" cy="34" rx="9" ry="14" fill="#C84C0C"/><ellipse cx="164" cy="34" rx="7" ry="12" fill="#FC9838"/><rect x="162" y="26" width="4" height="16" fill="#C84C0C"/><rect x="159" y="24" width="2.5" height="5" fill="#fff"/></g><g fill="#fff" opacity=".9"><path d="M140 30l4 4M188 30l-4 4M136 46h6M186 46h6" stroke="#fff" stroke-width="3"/></g><path fill="#F8B800" d="M154 104h30v6h-30zM142 110h54v6h-54zM136 116h66v6h-66zM136 122h78v6h-78zM142 158h18v6h-18zM166 158h12v6h-12zM184 158h12v6h-12zM142 164h18v6h-18zM166 164h12v6h-12zM184 164h18v6h-18zM148 170h12v6h-12zM190 170h12v6h-12zM190 188h24v6h-24zM124 194h24v6h-24zM196 194h18v6h-18z"/><path fill="#0000BC" d="M142 128h12v6h-12zM172 128h6v6h-6zM136 134h6v6h-6zM148 134h6v6h-6zM178 134h6v6h-6zM136 140h6v6h-6zM148 140h6v6h-6zM136 146h12v6h-12zM184 146h6v6h-6zM160 158h6v6h-6zM178 158h6v6h-6zM160 164h6v6h-6zM178 164h6v6h-6zM160 170h30v6h-30zM148 176h54v6h-54zM136 182h72v6h-72zM130 188h24v6h-24z"/><path fill="#FCBCB0" d="M154 128h18v6h-18zM178 128h12v6h-12zM142 134h6v6h-6zM154 134h24v6h-24zM184 134h18v6h-18zM142 140h6v6h-6zM154 140h60v6h-60zM148 146h36v6h-36zM190 146h12v6h-12zM148 152h48v6h-48zM136 158h6v6h-6zM202 158h12v6h-12zM136 164h6v6h-6zM202 164h12v6h-12zM136 170h12v6h-12zM142 176h6v6h-6z"/><path fill="#000" d="M232 207h3v3h-3zM265 207h3v3h-3zM232 210h6v3h-6zM262 210h6v3h-6zM235 213h3v3h-3zM262 213h3v3h-3zM238 225h6v3h-6zM256 225h6v3h-6zM238 228h6v3h-6zM256 228h6v3h-6zM241 237h18v3h-18zM241 240h3v3h-3zM247 240h3v3h-3zM253 240h6v3h-6zM229 249h15v3h-15zM256 249h15v3h-15z"/><path fill="#D82800" d="M238 213h24v3h-24zM235 216h30v3h-30zM232 219h36v3h-36zM229 222h6v3h-6zM244 222h12v3h-12zM265 222h6v3h-6zM229 225h6v3h-6zM247 225h6v3h-6zM265 225h6v3h-6zM229 228h6v3h-6zM247 228h6v3h-6zM265 228h6v3h-6zM229 231h9v3h-9zM244 231h12v3h-12zM262 231h9v3h-9zM229 234h42v3h-42zM229 237h12v3h-12zM259 237h12v3h-12zM232 240h9v3h-9zM259 240h9v3h-9zM235 243h30v3h-30z"/><path fill="#FCBCB0" d="M235 222h9v3h-9zM256 222h9v3h-9zM235 225h3v3h-3zM244 225h3v3h-3zM253 225h3v3h-3zM262 225h3v3h-3zM235 228h3v3h-3zM244 228h3v3h-3zM253 228h3v3h-3zM262 228h3v3h-3zM238 231h6v3h-6zM256 231h6v3h-6zM244 240h3v3h-3zM250 240h3v3h-3zM232 246h12v3h-12zM256 246h12v3h-12z"/><path fill="#000" d="M270 207h3v3h-3zM303 207h3v3h-3zM270 210h6v3h-6zM300 210h6v3h-6zM273 213h3v3h-3zM300 213h3v3h-3zM276 225h6v3h-6zM294 225h6v3h-6zM276 228h6v3h-6zM294 228h6v3h-6zM279 237h18v3h-18zM279 240h3v3h-3zM285 240h3v3h-3zM291 240h6v3h-6zM270 249h15v3h-15zM291 249h15v3h-15z"/><path fill="#D82800" d="M276 213h24v3h-24zM273 216h30v3h-30zM270 219h36v3h-36zM267 222h6v3h-6zM282 222h12v3h-12zM303 222h6v3h-6zM267 225h6v3h-6zM285 225h6v3h-6zM303 225h6v3h-6zM267 228h6v3h-6zM285 228h6v3h-6zM303 228h6v3h-6zM267 231h9v3h-9zM282 231h12v3h-12zM300 231h9v3h-9zM267 234h42v3h-42zM267 237h12v3h-12zM297 237h12v3h-12zM270 240h9v3h-9zM297 240h9v3h-9zM273 243h30v3h-30z"/><path fill="#FCBCB0" d="M273 222h9v3h-9zM294 222h9v3h-9zM273 225h3v3h-3zM282 225h3v3h-3zM291 225h3v3h-3zM300 225h3v3h-3zM273 228h3v3h-3zM282 228h3v3h-3zM291 228h3v3h-3zM300 228h3v3h-3zM276 231h6v3h-6zM294 231h6v3h-6zM282 240h3v3h-3zM288 240h3v3h-3zM273 246h12v3h-12zM291 246h12v3h-12z"/><path d="M120 240c20 4 34 10 44 -18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10" opacity=".85"/></svg>`;
})();

