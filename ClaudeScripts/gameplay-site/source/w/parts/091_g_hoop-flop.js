
(() => {
  'use strict';
  const ID = 'hoop-flop';

  const CFG = {
    W: 960, H: 540, FLOOR: 470, FB: 438, HZ: 120, ITERS: 6,
    G: 1500, JUMP: 760, JUMP_TAP: .68, JUMP_HOLD: .11, JUMP_CD: .2, COYOTE: .07, JUMP_UP: .55,
    KP: 5600, KD: 560, KMAX: 3400, KP_AIR: 1100, KD_AIR: 160, LEAN: .2,
    ARM_UP: .3, ARM_DOWN: 2.7, ARM_RATE_UP: 15, ARM_RATE_DOWN: 9, ARM_GRIP: .55, ARM_K: 430, ARM_C: 25, ARM_KD: 150, ARM_CD: 13,
    VMAX: 1250, GRAB: 12, GRAB_CD: .45, STEAL_CD: .5, STEAL_MIN: .3, TOE_POP: 300, FUMBLE_V: 560, BODY_K: .25,
    WIN: 5, X2: .14, GOAL_T: 2.1, WIPE_T: .45, SLOWMO: .55, SLOW: .35,
    RIMW: 80, BOARD_X: 46, BOARD_UP: 100, BOARD_DN: 24, NET_H: 50,
    THROW: { lo: 40, hi: 76, base: .014, dist: 1 / 12000, tilt: .1, air: .02, off: .003, short: .009, ang: .03 },
    SNAP_MS: 33, DELAY: 100,
    teams: [
      { name: 'RED', c: '#f04848', d: '#b8253a', l: '#ff9d8f' },
      { name: 'BLUE', c: '#3b7cf4', d: '#2453c2', l: '#9cc0ff' }
    ],
    courts: [
      { k: 'gym', name: 'GYM', fric: .32, bounce: 1, roll: .35 },
      { k: 'beach', name: 'BEACH', fric: .5, bounce: .58, roll: 2.2 },
      { k: 'ice', name: 'SNOW COURT', fric: .012, bounce: .92, roll: .04 },
      { k: 'roof', name: 'ROOFTOP', fric: .3, bounce: .95, roll: .45 },
      { k: 'street', name: 'STREET COURT', fric: .42, bounce: .9, roll: .5 }
    ],
    balls: [
      { k: 'basket', name: 'BASKETBALL', r: 16, im: 1, gs: 1, drag: .04, e: .78 },
      { k: 'beach', name: 'BEACH BALL', r: 27, im: 3.2, gs: .42, drag: .75, e: .82 },
      { k: 'heavy', name: 'HEAVY BALL', r: 15, im: .28, gs: 1.3, drag: .02, e: .32 },
      { k: 'bouncy', name: 'BOUNCY BALL', r: 12, im: 1.5, gs: 1, drag: .04, e: .94 },
      { k: 'giant', name: 'GIANT BALL', r: 34, im: 1.6, gs: .8, drag: .12, e: .74 }
    ],
    bodies: [
      { k: 'normal', name: '', HR: 21, T: 56, Lg: 64, A: 70, TR: 15, LR: 11, n: 2, s: 1 },
      { k: 'arms', name: 'LONG ARMS', A: 104 },
      { k: 'legs', name: 'SHORT LEGS', Lg: 34 },
      { k: 'heads', name: 'BIG HEADS', HR: 36 },
      { k: 'solo', name: 'ONE ON ONE', s: 1.32, n: 1 },
      { k: 'giants', name: 'BIG PLAYERS', s: 1.16 },
      { k: 'tiny', name: 'TINY PLAYERS', s: .84 }
    ],
    hoops: [{ name: 'LOW HOOPS', h: 200 }, { name: '', h: 250 }, { name: 'HIGH HOOPS', h: 300 }],
    ai: [
      { name: 'EASY', react: .3, gap: .45, reachX: 70, aLo: 15, aHi: 80, apexV: 500, flail: .45, mult: 1, block: .25, hop: 1.1 },
      { name: 'NORMAL', react: .16, gap: .25, reachX: 95, aLo: 38, aHi: 72, apexV: 300, flail: .12, mult: 2, block: .6, hop: .7 },
      { name: 'HARD', react: .07, gap: .12, reachX: 115, aLo: 48, aHi: 72, apexV: 170, flail: 0, mult: 3, block: .9, hop: .45 }
    ]
  };

  const TAU = Math.PI * 2, OUT = '#1d1b26', FONT = 'Nunito, system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
  const angN = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  const wpick = w => { let s = 0; for (const x of w) s += x; let r = Math.random() * s; for (let i = 0; i < w.length; i++) if ((r -= w[i]) < 0) return i; return 0; };
  const FXN = ['bounce', 'rim', 'board', 'swish', 'jump', 'bonk', 'thud', 'whoosh', 'grab', 'whistle', 'cheer', 'win', 'steal', 'goal', 'dust'];
  const PH = ['live', 'goal', 'wipe', 'end'];
  const KIND = ['DUNK!', 'SWISH!', 'BANK SHOT!', 'FROM DOWNTOWN!', 'NICE SHOT!', 'OWN GOAL!'];
  const KITS = [['#d8262e', '#8e1219', '#ff9a9a'], ['#f7c531', '#6b2c91', '#ffe48a'], ['#2f6fd8', '#173a80', '#9cc0ff'], ['#2e9a4a', '#185a2a', '#9be6ad'], ['#2b2b30', '#c4262e', '#8a8a92'], ['#f07a1e', '#8e420e', '#ffc28e'], ['#5b5f6a', '#24262c', '#b3b7c2'], ['#18a7b5', '#0b5a62', '#9ae8ef']];
  const SKIN = ['#f6d2ae', '#e8b48a', '#c98d5e', '#9a643f', '#6b4128'];
  const HAIRC = ['#2a1b14', '#5b3a22', '#e2b04a', '#c4532d', '#151515', '#7a7f8c'];
  const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  Ameplay.register({
    id: ID, title: 'Hoop Flop', category: 'Sports', tint: '#ff7a1a',
    blurb: 'Floppy 2v2 ragdoll hoops: you control both players on your side. First to 5 wins.',
    help: '<kbd>W</kbd> / <kbd>Space</kbd> / <kbd>↑</kbd> hold to jump &amp; raise arms, release with the ball to shoot · hold <kbd>S</kbd> / <kbd>↓</kbd> to go back · touch: JUMP and BACK buttons · online 2-player',
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14h14M8 14v14M12 22h10l-2 10h-6z"/><circle cx="42" cy="18" r="8"/><path d="M34 18h16M42 10v16"/><circle cx="40" cy="40" r="5"/><path d="M40 45v10M40 55l-4 6M40 55l4 6M40 48l-8-8M40 48l6-12"/></svg>',
    css: `.gm-hoop-flop canvas{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;border-radius:14px}`,
    mount(root, api) {
      const W = CFG.W, H = CFG.H, FLOOR = CFG.FLOOR, FB = CFG.FB, DT = 1 / CFG.HZ, TEAMS = CFG.teams;
      const PORT = matchMedia('(orientation: portrait) and (max-width: 820px)').matches;
      const OY = PORT ? 110 : 0, CW = W, CH = PORT ? OY + H + 236 : H;
      const COARSE = matchMedia('(pointer: coarse)').matches;
      const cv = api.canvas(CW, CH), canvas = cv.canvas, dpr = canvas.width / CW, PX = 4, mctx = cv.ctx;
      let ctx = mctx;
      const low = document.createElement('canvas'); low.width = CW / PX; low.height = Math.ceil(CH / PX);
      const lctx = low.getContext('2d');
      const bgc = document.createElement('canvas'); bgc.width = W / PX; bgc.height = Math.ceil(H / PX);
      const bg = bgc.getContext('2d');
      const net = api.net, invited = !!net.invite;
      const saved = api.load() || {};
      let mode = invited ? 'net' : saved.mode === 'net' ? 'net' : 'cpu';
      let diff = clamp(saved.diff == null ? 1 : +saved.diff || 0, 0, 2) | 0;
      const persist = () => api.save({ mode, diff });

      let screen = 'title', phase = 'live', rt = 0, pt = 0, slow = 0, acc = 0, clock = 0, roundK = 0, winner = -1, endT = 0, overT = 0, newBest = false, overPts = 0, lastScorer = 0, cheerT = 0;
      let GRAV = CFG.G, score = [0, 0], cfg = null, court = CFG.courts[0], BT = CFG.balls[0], BD = CFG.bodies[0], hoops = [], players = [], ball = null, looks = [];
      const bump = [0, 0], btn = [false, false], btnVis = [false, false], srcs = [new Set(), new Set()], ptrs = new Map();
      const back = [false, false], bsrcs = [new Set(), new Set()];
      let gBack = false, touchSeen = COARSE;
      let ais = [null, null], mirror = false, shake = 0, btns = [], popups = [], parts = [], crowd = [];
      const hist = new Float32Array(512); let histI = 0;
      let online = null, wired = false, lobbying = false, seq = 0, rseq = -1, gDown = false, gPressTs = 0, hostPressAt = 0, meRe = false, peerRe = false, off = 0, gK = -1;
      let fxOut = [];
      const snapBuf = [];
      const myTeam = () => online === 'guest' ? 1 : 0;


      let ac = null, mg = null, nbuf = null;
      const AC = () => {
        if (api.muted) return null;
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          mg = ac.createGain(); mg.gain.value = .5; mg.connect(ac.destination);
          nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      };
      const tone = (type, f0, f1, dur, vol, at = 0) => {
        const a = AC(); if (!a || vol <= 0) return;
        const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(mg); o.start(t); o.stop(t + dur + .03);
      };
      const noise = (ft, f0, f1, q, dur, vol, at = 0, att = .005) => {
        const a = AC(); if (!a || vol <= 0) return;
        const t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        s.buffer = nbuf; s.loop = true; f.type = ft; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(mg); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
      };
      const SND = {
        bounce(v) {
          v = clamp(v, .05, 1); const k = BT.k;
          if (k === 'beach') { tone('triangle', 300, 170, .16, .22 * v); noise('lowpass', 900, 300, 1, .06, .08 * v); }
          else if (k === 'heavy') { tone('sine', 95, 40, .22, .5 * v); noise('lowpass', 300, 120, 1, .1, .25 * v); }
          else if (k === 'bouncy') tone('sine', 560, 280, .09, .25 * v);
          else { tone('sine', 170, 62, .13, .45 * v); noise('lowpass', 600, 200, 1, .05, .15 * v); }
        },
        rim(v) { v = clamp(v, .15, 1); tone('square', 1240, 1180, .22, .05 * v); tone('triangle', 1870, 1800, .3, .08 * v); tone('sine', 620, 600, .25, .12 * v); },
        board(v) { v = clamp(v, .15, 1); noise('lowpass', 1100, 400, 1, .1, .3 * v); tone('sine', 190, 120, .1, .25 * v); },
        swish() { noise('bandpass', 3200, 900, 1.2, .38, .32, 0, .03); },
        jump(t) { const f = t ? 250 : 205; tone('sine', f, f * 2.4, .13, .15); tone('triangle', f * 2, f * 3, .06, .04); },
        bonk(v) { v = clamp(v, .2, 1); tone('sine', 740, 380, .09, .28 * v); tone('triangle', 1480, 900, .05, .07 * v); },
        thud(v) { v = clamp(v, .2, 1); noise('lowpass', 400, 120, 1, .08, .2 * v); tone('sine', 110, 60, .08, .18 * v); },
        whoosh() { noise('bandpass', 700, 2400, 1.5, .18, .12, 0, .04); },
        grab() { tone('sine', 900, 700, .045, .1); },
        steal() { tone('square', 500, 900, .08, .05); tone('sine', 900, 1300, .06, .06, .05); },
        whistle() { for (let i = 0; i < 2; i++) { tone('square', 2550, 2550, .15, .035, i * .19); tone('square', 2690, 2690, .15, .03, i * .19 + .02); } },
        cheer() {
          noise('bandpass', 900, 1300, .6, 2, .28, 0, .25); noise('bandpass', 2300, 1900, 1, 1.7, .1, .05, .2);
          for (let i = 0; i < 6; i++) { const f = rnd(460, 780); tone('sine', f, f * 1.5, rnd(.3, .6), .04, rnd(0, .7)); }
          for (let i = 0; i < 16; i++) noise('highpass', 1800, 1800, .7, .04, .1, rnd(0, 1.5));
        },
        win() { [523, 659, 784, 1047].forEach((f, i) => { tone('square', f, f, .2, .06, i * .12); tone('triangle', f / 2, f / 2, .26, .1, i * .12); }); tone('triangle', 1047, 1047, .6, .08, .5); },
        click() { tone('sine', 660, 900, .05, .12); }
      };
      const SGAP = { bounce: 50, rim: 60, board: 60, bonk: 70, thud: 70, jump: 40, grab: 60, steal: 100, whoosh: 60 };
      const sgate = {};
      const quiet = () => api.muted || screen === 'title' || screen === 'lobby';
      const snd = (n, a) => {
        if (quiet()) return;
        const now = performance.now();
        if (now < (sgate[n] || 0)) return;
        sgate[n] = now + (SGAP[n] || 0);
        try { SND[n](a); } catch (e) {}
      };


      const spawn = (x, y, vx, vy, life, c, s, kind) => { if (parts.length < 420) parts.push({ x, y, vx, vy, life, max: life, c, s, kind, rot: Math.random() * 6, vr: rnd(-10, 10) }); };
      const confetti = (x, y, n, cols, sp) => { for (let i = 0; i < n; i++) { const a = rnd(-Math.PI, 0), v = rnd(.3, 1) * sp; spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(1.2, 2.2), cols[i % cols.length], rnd(5, 9), 0); } };
      const FX = {
        bounce: v => snd('bounce', v / 100), rim: v => snd('rim', v / 100), board: v => snd('board', v / 100), swish: () => snd('swish'),
        jump: t => snd('jump', t), bonk: v => snd('bonk', v / 100), thud: v => snd('thud', v / 100), whoosh: () => snd('whoosh'),
        grab: () => snd('grab'), steal: () => snd('steal'), whistle: () => snd('whistle'), cheer: () => snd('cheer'),
        win: t => { snd('win'); cheerT = 3; for (let i = 0; i < 3; i++) confetti(W * (i + 1) / 4, 40, 30, [TEAMS[t].c, TEAMS[t].l, '#ffd23f', '#ffffff'], 520); },
        dust: (x, big) => { const c = court.k === 'beach' ? '#f3d18a' : court.k === 'ice' ? '#ffffff' : court.k === 'roof' ? '#b9b6c9' : '#f6d3a3'; for (let i = 0; i < (big ? 10 : 5); i++) spawn(x + rnd(-12, 12), FLOOR - 2, rnd(-90, 90), rnd(-60, -10), rnd(.3, .55), c, rnd(5, 10), 1); },
        goal: (team, kind, pts, side) => {
          const Hh = hoops[side]; if (!Hh) return;
          const cx = (Hh.xb + Hh.xf) / 2;
          shake = .35; bump[team] = 1; cheerT = 2.4; lastScorer = team;
          confetti(cx, Hh.y + 20, 46, [TEAMS[team].c, TEAMS[team].l, '#ffd23f', '#ffffff'], 560);
          popups.push({ text: kind === 5 ? 'OWN GOAL!' : 'BASKET!', sub: (kind < 4 ? KIND[kind] + '  ' : '') + '+' + pts, x: W / 2, y: 150, t: 0, team });
          snd('swish'); snd('cheer');
          for (const p of players) { p.happy = p.team === team ? 3 : 0; p.sad = p.team !== team ? 3 : 0; }
          setScoreText();
        }
      };
      const fx = (n, a = 0, b = 0, c = 0, d = 0) => {
        FX[n](a, b, c, d);
        if (online === 'host') fxOut.push([FXN.indexOf(n), a, b, c, d]);
      };
      const setScoreText = () => { if (screen === 'title' || screen === 'lobby') return; const l = mirror ? 1 : 0; api.score(score[l] + ' : ' + score[1 - l]); };


      const mkLooks = () => Array.from({ length: 4 }, () => [Math.random() * 5 | 0, Math.random() * 5 | 0, Math.random() * 6 | 0, 1 + Math.random() * 98 | 0]);
      const classic = () => ({ court: 0, ball: 0, body: 0, hoop: 1, x2: 0 });
      const randomCfg = prev => {
        let c, n = 0;
        do c = { court: Math.random() * CFG.courts.length | 0, ball: wpick([4, 2, 2, 2, 1.5]), body: wpick([3, 2, 2, 2, 0, 1.5, 1.5]), hoop: wpick([1, 2, 1]), x2: Math.random() < CFG.X2 ? 1 : 0, lg: Math.random() < .12 ? 1 : 0 };
        while (n++ < 30 && prev && c.court === prev.court && c.ball === prev.ball && c.body === prev.body && c.hoop === prev.hoop && c.lg === prev.lg);
        return c;
      };
      const makePlayer = (team, slot, x, look) => {
        const s = BD.s, HR = BD.HR * s, T = BD.T * s, Lg = BD.Lg * s, A = BD.A * s, TR = BD.TR * s, LR = BD.LR * s, dir = team ? -1 : 1;
        const P = (px, py, im, r) => ({ x: px, y: py, px, py, im, r, ax: 0, ay: 0 });
        const fy = FLOOR - LR, hy = fy - Lg, ny = hy - T, Hn = HR + 3 * s;
        const foot = P(x, fy, 1, LR), hip = P(x, hy, .6, TR * .9), neck = P(x, ny, .6, TR * .9), head = P(x, ny - Hn, 1, HR);
        const hand = P(x + dir * A * Math.sin(.44), ny + A * Math.cos(.44), 2, 7 * s);
        return {
          team, slot, dir, s, HR, T, Lg, A, TR, LR, Hn, Lh: Lg + T + Hn, head, neck, hip, foot, hand, look: look || [0, 0, 0, 7],
          body: [head, neck, hip, foot], pts: [head, neck, hip, foot, hand],
          cons: [[head, neck, Hn, 1], [neck, hip, T, 1], [hip, foot, Lg, 1], [head, hip, Hn + T, 1], [neck, foot, T + Lg, .45], [neck, hand, A, 1]],
          circ: [[head, head, 0, HR], [neck, hip, .25, TR], [neck, hip, .85, TR], [hip, foot, .5, LR + 1], [hip, foot, 1, LR]],
          phi: CFG.ARM_DOWN, phiV: 0, armV: 0, ground: 0, jt: 9, jdx: 0, jdy: -1, jcd: 0, cool: 0, happy: 0, sad: 0
        };
      };
      const makeBall = () => ({ x: W / 2 + rnd(-16, 16), y: 70, px: W / 2, py: 70, vx: rnd(-40, 40), vy: 0, ang: 0, av: rnd(-3, 3), r: BT.r, holder: null, hold: 0, thrown: null, rim: 0, board: 0, still: 0 });
      function buildRound(c, lk) {
        cfg = c; GRAV = CFG.G * (c.lg ? .58 : 1);
        { const ki = (c.court * 7 + c.ball * 3 + c.body * 5 + c.hoop + (lk && lk[0] ? lk[0][3] : 0)) % KITS.length, kj = (ki + 1 + ((lk && lk[1] ? lk[1][3] : 0) % (KITS.length - 1))) % KITS.length; [ki, kj].forEach((q, t) => { const K = KITS[q]; TEAMS[t].c = K[0]; TEAMS[t].d = K[1]; TEAMS[t].l = K[2]; }); } court = CFG.courts[c.court] || CFG.courts[0]; BT = CFG.balls[c.ball] || CFG.balls[0];
        BD = Object.assign({}, CFG.bodies[0], CFG.bodies[c.body] || {});
        const hh = (CFG.hoops[c.hoop] || CFG.hoops[1]).h;
        hoops = [0, 1].map(side => {
          const s = side ? -1 : 1, bx = side ? W - CFG.BOARD_X : CFG.BOARD_X, y = FLOOR - hh, xb = bx + s * 4, xf = bx + s * (4 + CFG.RIMW);
          return { side, s, bx, y, xb, xf, lo: Math.min(xb, xf), hi: Math.max(xb, xf), net: 0, netV: 0, netX: 0 };
        });
        players = [];
        const xs = BD.n === 1 ? [[330], [W - 330]] : [[170, 400], [W - 170, W - 400]];
        for (let t = 0; t < 2; t++) xs[t].forEach((x, i) => players.push(makePlayer(t, t * 2 + i, x, lk[t * 2 + i])));
        ball = makeBall();
        for (let i = 0; i < 128; i++) { hist[i * 4] = ball.x; hist[i * 4 + 1] = ball.y; hist[i * 4 + 2] = 0; hist[i * 4 + 3] = 0; }
        phase = 'live'; rt = 0; pt = 0; acc = 0;
        paintBg();
      }


      const lean = p => {
        const b = ball;
        if (back[p.team]) return -p.dir * CFG.LEAN * 1.35;
        if (b.holder && b.holder.team === p.team) return p.dir * CFG.LEAN * .8;
        const tx = b.holder ? b.holder.hip.x : b.x;
        return clamp((tx - p.foot.x) / 420, -1, 1) * CFG.LEAN;
      };
      const armA = p => Math.atan2(-(p.hand.y - p.neck.y), (p.hand.x - p.neck.x) * p.dir) * 180 / Math.PI;
      function stepPlayer(p, down) {
        const { head, neck, hip, foot, hand } = p;
        const ux = head.x - foot.x, uy = head.y - foot.y, L = Math.hypot(ux, uy) || 1, th = Math.atan2(ux, -uy), c = Math.cos(th), sn = Math.sin(th);
        const om = (((head.x - head.px) - (foot.x - foot.px)) * c + ((head.y - head.py) - (foot.y - foot.py)) * sn) / (L * DT);
        for (const q of p.pts) q.ax = q.ay = 0;
        if (p.ground < CFG.COYOTE) {
          const F = clamp(CFG.KP * angN(lean(p) - th) - CFG.KD * om, -CFG.KMAX, CFG.KMAX);
          const kn = (p.Lg + p.T) / p.Lh, kh = p.Lg / p.Lh;
          head.ax += F * c; head.ay += F * sn; neck.ax += F * kn * c; neck.ay += F * kn * sn; hip.ax += F * kh * c; hip.ay += F * kh * sn;
          foot.ax -= F * c; foot.ay -= F * sn;
        } else {
          const F = CFG.KP_AIR * angN(-th) - CFG.KD_AIR * om, R = [p.Lh, p.Lg + p.T, p.Lg, 0];
          let mr = 0, ms = 0;
          for (let i = 0; i < 4; i++) { const m = 1 / p.body[i].im; mr += m * R[i]; ms += m; }
          const rc = mr / ms;
          for (let i = 0; i < 4; i++) { const k = (R[i] - rc) / p.Lh, q = p.body[i]; q.ax += F * k * c; q.ay += F * k * sn; }
        }
        if (down && p.jt < CFG.JUMP_HOLD) { const a = CFG.JUMP * (1 - CFG.JUMP_TAP) / CFG.JUMP_HOLD; for (const q of p.body) { q.ax += p.jdx * a; q.ay += p.jdy * a; } }
        p.jt += DT; p.ground += DT; if (p.jcd > 0) p.jcd -= DT; if (p.cool > 0) p.cool -= DT;
        for (const q of p.pts) {
          const vx = (q.x - q.px) * .999, vy = (q.y - q.py) * .999;
          q.px = q.x; q.py = q.y; q.x += vx + q.ax * DT * DT; q.y += vy + (q.ay + GRAV) * DT * DT;
        }
        const tgt = down ? CFG.ARM_UP : CFG.ARM_DOWN, ph0 = p.phi, upw = tgt < p.phi;
        const kk = upw ? CFG.ARM_K : CFG.ARM_KD, cc = upw ? CFG.ARM_C : CFG.ARM_CD;
        p.armV += ((tgt - p.phi) * kk - p.armV * cc - om * .35) * DT;
        p.phi = clamp(p.phi + p.armV * DT, -.45, 3.25);
        if (p.phi === -.45 || p.phi === 3.25) p.armV *= -.3;
        p.phiV = (p.phi - ph0) / DT;
        const vx = ux / L, vy = uy / L, a = p.phi * p.dir, ca = Math.cos(a), sa = Math.sin(a);
        const tx = neck.x + (vx * ca - vy * sa) * p.A, ty = neck.y + (vx * sa + vy * ca) * p.A;
        hand.x += (tx - hand.x) * CFG.ARM_GRIP; hand.y += (ty - hand.y) * CFG.ARM_GRIP;
      }
      const solve = (a, b, rest, k) => {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1e-6, w = a.im + b.im;
        const f = (d - rest) / (d * w) * k;
        a.x += dx * f * a.im; a.y += dy * f * a.im; b.x -= dx * f * b.im; b.y -= dy * f * b.im;
      };
      const bound = q => {
        if (q.y > FLOOR - q.r) q.y = FLOOR - q.r;
        if (q.x < q.r + 2) q.x = q.r + 2; else if (q.x > W - q.r - 2) q.x = W - q.r - 2;
        if (q.y < -400) q.y = -400;
      };
      function jump(p) {
        if (p.ground >= CFG.COYOTE || p.jcd > 0) return false;
        let ux = p.head.x - p.foot.x, uy = p.head.y - p.foot.y; const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l;
        let jx = ux + lean(p) * .9 - (back[p.team] ? p.dir * .38 : 0), jy = uy - CFG.JUMP_UP, n = Math.hypot(jx, jy) || 1; jx /= n; jy /= n;
        if (jy > -.45) { jy = -.45; jx = Math.sign(jx) * Math.sqrt(1 - jy * jy); }
        const v = CFG.JUMP * CFG.JUMP_TAP * DT;
        for (const q of p.body) { const vx = (q.x - q.px) * .4; q.px = q.x - vx - jx * v; q.py = q.y - jy * v; }
        p.jdx = jx; p.jdy = jy; p.jt = 0; p.jcd = CFG.JUMP_CD; p.ground = 1;
        return true;
      }
      function press(t) {
        if (phase === 'wipe') return;
        let j = false;
        for (const p of players) if (p.team === t && jump(p)) j = true;
        if (j) fx('jump', t);
      }
      function release(t) { if (ball && ball.holder && ball.holder.team === t) throwBall(ball.holder); }
      function solveV(x0, y0, tx, ty, th, sg) {
        const G = GRAV * BT.gs, dr = BT.drag, c = Math.cos(th), s = Math.sin(th);
        const yAt = v => {
          let x = x0, y = y0, vx = sg * v * c, vy = -v * s;
          for (let i = 0; i < 400; i++) {
            const nx = x + vx * DT, ny = y + vy * DT;
            if ((nx - tx) * sg >= 0) { const u = (tx - x) / ((nx - x) || 1e-6); return y + (ny - y) * u; }
            vy += G * DT; vx *= 1 - dr * DT; vy *= 1 - dr * DT; x = nx; y = ny;
            if (y > FLOOR + 50) return 1e5;
          }
          return 1e5;
        };
        let lo = 60, hi = 2600;
        for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (yAt(m) > ty) lo = m; else hi = m; }
        return (lo + hi) / 2;
      }
      function throwBall(p) {
        const b = ball, T = CFG.THROW;
        b.holder = null; p.cool = CFG.GRAB_CD;
        const Hh = hoops[p.team === 0 ? 1 : 0], tx = (Hh.xb + Hh.xf) / 2, ty = Hh.y - 2;
        const dxs = tx - b.x, X = Math.abs(dxs), sg = Math.sign(dxs) || p.dir, Yup = b.y - ty;
        const a = armA(p), tilt = Math.abs(angN(Math.atan2(p.head.x - p.foot.x, p.foot.y - p.head.y)));
        let th, v;
        if (a < -10) { th = .45; v = rnd(260, 380); }
        else if (X < 24) { th = 1.5; v = Math.sqrt(2 * GRAV * BT.gs * Math.max(40, Yup + 40)); }
        else {
          th = clamp(a, 18, 78) * Math.PI / 180;
          const thMin = Math.atan2(2 * Yup, X) + .08;
          if (th < thMin) th = Math.min(1.4, thMin);
          v = solveV(b.x, b.y, tx, ty, th, sg);
          let sig = T.base + X * T.dist + tilt * T.tilt + (p.ground >= CFG.COYOTE && Math.abs((p.hip.y - p.hip.py) / DT) > 300 ? T.air : 0);
          const o = a < T.lo ? T.lo - a : a > T.hi ? a - T.hi : 0;
          sig += o * T.off;
          const bias = a < T.lo ? -(T.lo - a) * T.short : 0;
          v *= 1 + bias + gauss() * sig; th += gauss() * T.ang;
        }
        b.vx = sg * v * Math.cos(th); b.vy = -v * Math.sin(th);
        b.av = -sg * (14 + rnd(-3, 3)); b.thrown = { x: b.x, team: p.team }; b.rim = b.board = 0;
        fx('whoosh');
      }
      function tryGrab(p) {
        const b = ball, hd = p.hand, dx = b.x - hd.x, dy = b.y - hd.y, R = b.r + CFG.GRAB * p.s;
        if (p.cool > 0 || dx * dx + dy * dy > R * R) return false;
        if (!b.holder) { b.holder = p; b.hold = 0; b.thrown = null; fx('grab'); return true; }
        if (b.holder.team !== p.team && b.hold > CFG.STEAL_MIN && (Math.abs(p.phiV) > 3 || p.ground > CFG.COYOTE)) {
          b.holder.cool = CFG.STEAL_CD; b.holder = p; b.hold = 0; fx('steal'); return true;
        }
        return false;
      }
      function ballDyn(a, c, rad, e) {
        const b = ball, dx = c.x - a.x, dy = c.y - a.y, l2 = dx * dx + dy * dy;
        let t = l2 > 1e-6 ? ((b.x - a.x) * dx + (b.y - a.y) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cx = a.x + dx * t, cy = a.y + dy * t; let nx = b.x - cx, ny = b.y - cy;
        const d2 = nx * nx + ny * ny, R = b.r + rad;
        if (d2 >= R * R) return -1;
        const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d;
        const same = a === c, ws = same ? a.im : a.im * (1 - t) * (1 - t) + c.im * t * t, wc = ws * CFG.BODY_K, wb = BT.im, tot = wb + wc, pen = R - d;
        b.x += nx * pen * wb / tot; b.y += ny * pen * wb / tot;
        const mv = pen * wc / tot, ka = same ? 1 : (1 - t) * a.im / ws, kc = same ? 0 : t * c.im / ws;
        a.x -= nx * mv * ka; a.y -= ny * mv * ka; a.px -= nx * mv * ka; a.py -= ny * mv * ka;
        if (!same) { c.x -= nx * mv * kc; c.y -= ny * mv * kc; c.px -= nx * mv * kc; c.py -= ny * mv * kc; }
        const vax = (a.x - a.px) / DT, vay = (a.y - a.py) / DT, vcx = (c.x - c.px) / DT, vcy = (c.y - c.py) / DT;
        const ux = same ? vax : lerp(vax, vcx, t), uy = same ? vay : lerp(vay, vcy, t);
        const vr = (b.vx - ux) * nx + (b.vy - uy) * ny;
        if (vr < 0) {
          const j = -(1 + e) * vr / tot;
          b.vx += nx * j * wb; b.vy += ny * j * wb;
          const qa = (same ? a.im : (1 - t) * a.im) * CFG.BODY_K * j * DT, qc = t * c.im * CFG.BODY_K * j * DT;
          a.px += nx * qa; a.py += ny * qa;
          if (!same) { c.px += nx * qc; c.py += ny * qc; }
        }
        return Math.max(0, -vr);
      }
      function ballSeg(ax, ay, bx2, by2, rad, e, mu) {
        const b = ball, dx = bx2 - ax, dy = by2 - ay, l2 = dx * dx + dy * dy;
        let t = l2 > 0 ? ((b.x - ax) * dx + (b.y - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        let nx = b.x - (ax + dx * t), ny = b.y - (ay + dy * t);
        const d2 = nx * nx + ny * ny, R = b.r + rad;
        if (d2 >= R * R) return -1;
        const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d;
        b.x += nx * (R - d); b.y += ny * (R - d);
        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; spinFric(nx, ny, -(1 + e) * vn, mu == null ? .3 : mu); return -vn; }
        return 0;
      }
      function spinFric(nx, ny, jn, mu) {
        const b = ball, tx = -ny, ty = nx, slip = b.vx * tx + b.vy * ty - b.av * b.r;
        let J = -slip / 2.5; const lim = mu * jn;
        if (J > lim) J = lim; else if (J < -lim) J = -lim;
        b.vx += J * tx; b.vy += J * ty; b.av -= 1.5 * J / b.r;
      }
      function collidePlayers(last) {
        for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
          const A = players[i], B = players[j];
          if (Math.abs(A.hip.x - B.hip.x) > 260) continue;
          for (const ca of A.circ) for (const cb of B.circ) {
            const a0 = ca[0], a1 = ca[1], ta = ca[2], b0 = cb[0], b1 = cb[1], tb = cb[2];
            const ax = lerp(a0.x, a1.x, ta), ay = lerp(a0.y, a1.y, ta), bx2 = lerp(b0.x, b1.x, tb), by2 = lerp(b0.y, b1.y, tb);
            let nx = bx2 - ax, ny = by2 - ay; const d2 = nx * nx + ny * ny, R = ca[3] + cb[3];
            if (d2 >= R * R) continue;
            const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d;
            const wa = a0 === a1 ? a0.im : a0.im * (1 - ta) * (1 - ta) + a1.im * ta * ta, wb = b0 === b1 ? b0.im : b0.im * (1 - tb) * (1 - tb) + b1.im * tb * tb;
            const pen = (R - d) * .5, ma = pen * wa / (wa + wb), mb = pen * wb / (wa + wb);
            if (a0 === a1) { a0.x -= nx * ma; a0.y -= ny * ma; } else { const k0 = (1 - ta) * a0.im / wa, k1 = ta * a1.im / wa; a0.x -= nx * ma * k0; a0.y -= ny * ma * k0; a1.x -= nx * ma * k1; a1.y -= ny * ma * k1; }
            if (b0 === b1) { b0.x += nx * mb; b0.y += ny * mb; } else { const k0 = (1 - tb) * b0.im / wb, k1 = tb * b1.im / wb; b0.x += nx * mb * k0; b0.y += ny * mb * k0; b1.x += nx * mb * k1; b1.y += ny * mb * k1; }
            if (last && ball.holder && (ball.holder === A || ball.holder === B) && phase === 'live') {
              const rv = Math.hypot((A.hip.x - A.hip.px) - (B.hip.x - B.hip.px), (A.hip.y - A.hip.py) - (B.hip.y - B.hip.py)) / DT;
              if (rv > CFG.FUMBLE_V && ball.hold > .2) { const hd = ball.holder; hd.cool = .5; ball.holder = null; ball.vx = rnd(-200, 200); ball.vy = -rnd(200, 380); fx('bonk', 70); }
            }
            if (last && ca === A.circ[0] && cb === B.circ[0]) fx('bonk', 60);
          }
        }
      }
      function goal(Hh) {
        const b = ball, team = Hh.side === 1 ? 0 : 1, pts = cfg.x2 ? 2 : 1;
        let kind = 4;
        if (b.holder) kind = 0;
        else if (b.thrown && b.thrown.team !== team) kind = 5;
        else if (b.thrown && Math.abs(b.thrown.x - (Hh.xb + Hh.xf) / 2) > 430) kind = 3;
        else if (b.board) kind = 2;
        else if (b.thrown && !b.rim) kind = 1;
        if (b.holder) { b.holder.cool = .6; b.holder = null; b.vy = Math.max(b.vy, 260); b.vx *= .3; }
        score[team] += pts;
        phase = 'goal'; pt = 0; slow = CFG.SLOWMO;
        fx('goal', team, kind, pts, Hh.side);
      }
      function stepBall() {
        const b = ball;
        b.px = b.x; b.py = b.y;
        if (b.holder) {
          const p = b.holder, hd = p.hand, ax = hd.x - p.neck.x, ay = hd.y - p.neck.y, l = Math.hypot(ax, ay) || 1, o = b.r * .55 + 4 * p.s;
          b.x = hd.x + ax / l * o; b.y = Math.min(FLOOR - b.r, hd.y + ay / l * o);
          b.vx = (b.x - b.px) / DT; b.vy = (b.y - b.py) / DT; b.hold += DT; b.still = 0;
          for (const q of players) if (q.team !== p.team && tryGrab(q)) break;
        } else {
          b.vy += GRAV * BT.gs * DT;
          const dr = 1 - BT.drag * DT; b.vx *= dr; b.vy *= dr;
          b.x += b.vx * DT; b.y += b.vy * DT; b.ang += b.av * DT;
          if (b.y > FLOOR - b.r) {
            b.y = FLOOR - b.r;
            const mu = court.fric * 1.3 + .03;
            if (b.vy > 0) { const v = b.vy; b.vy = -v * BT.e * court.bounce; if (b.vy > -45) b.vy = 0; spinFric(0, -1, v - b.vy, mu); if (v > 90) fx('bounce', Math.round(clamp(v / 900, 0, 1) * 100)); }
            else spinFric(0, -1, GRAV * BT.gs * DT * 2, mu);
            const rr = 1 - court.roll * DT; b.vx *= rr; b.av *= rr;
          }
          if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { if (b.vx < -150) fx('thud', 50); const v = -b.vx; b.vx = v * .75; spinFric(1, 0, v * 1.75, .3); } }
          else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) { if (b.vx > 150) fx('thud', 50); const v = b.vx; b.vx = -v * .75; spinFric(-1, 0, v * 1.75, .3); } }
          if (b.y < -260 + b.r) { b.y = -260 + b.r; if (b.vy < 0) b.vy = -b.vy * .6; }
          for (const Hh of hoops) {
            let v = ballSeg(Hh.bx, Hh.y - CFG.BOARD_UP, Hh.bx, Hh.y + CFG.BOARD_DN, 5, .55, .28);
            if (v >= 0) { b.board = 1; if (v > 60) fx('board', Math.round(clamp(v / 800, 0, 1) * 100)); }
            v = ballSeg(Hh.xf, Hh.y, Hh.xf, Hh.y, 4.5, .5, .45);
            if (v < 0) { const vb = ballSeg(Hh.xb + Hh.s * 5, Hh.y, Hh.xb + Hh.s * 5, Hh.y, 4, .45, .4); if (vb > 40) fx('rim', Math.round(clamp(vb / 900, 0, 1) * 100)); }
            if (v >= 0) { b.rim = 1; if (v > 40) fx('rim', Math.round(clamp(v / 700, 0, 1) * 100)); }
            if (b.x > Hh.lo && b.x < Hh.hi && b.y > Hh.y && b.y < Hh.y + CFG.NET_H) { b.vx *= 1 - 5 * DT; b.vy *= 1 - 1.5 * DT; }
          }
          let grabbed = false;
          for (const p of players) if (tryGrab(p)) { grabbed = true; break; }
          if (!grabbed) for (const p of players) {
            let v = ballDyn(p.head, p.head, p.HR, .55); if (v > 260) fx('bonk', Math.round(clamp(v / 900, .2, 1) * 100));
            v = ballDyn(p.neck, p.hip, p.TR, .45); if (v > 300) fx('thud', 60);
            v = ballDyn(p.hip, p.foot, p.LR, .4);
            if (v >= 0 && b.y > FLOOR - b.r * 2.4) { b.vy = Math.min(b.vy, -CFG.TOE_POP * (BT.k === 'heavy' ? .5 : 1)); b.vx += (p.foot.x - p.foot.px) / DT * .3; }
            ballDyn(p.neck, p.hand, 6 * p.s, .3);
          }
          const sp = Math.abs(b.vx) + Math.abs(b.vy);
          b.still = sp < 25 && b.y < FLOOR - b.r - 4 ? b.still + DT : 0;
          if (b.still > 3 || !isFinite(b.x) || !isFinite(b.y)) { const nb = makeBall(); Object.assign(b, nb); }
        }
        if (phase === 'live') for (const Hh of hoops) if (b.py <= Hh.y && b.y > Hh.y && b.x > Hh.lo + 1 && b.x < Hh.hi - 1) { goal(Hh); break; }
      }
      function step() {
        for (const p of players) stepPlayer(p, btn[p.team]);
        for (let it = 0; it < CFG.ITERS; it++) {
          for (const p of players) { for (const c of p.cons) solve(c[0], c[1], c[2], c[3]); for (const q of p.pts) bound(q); }
          if (it & 1) collidePlayers(it === CFG.ITERS - 1);
        }
        for (const p of players) {
          for (const q of p.pts) if (q.y >= FLOOR - q.r - .5) {
            const k = q === p.foot ? court.fric : court.fric * .5 + .02;
            q.px = q.x - (q.x - q.px) * (1 - k);
            if (q === p.foot) { if (p.ground > .3) fx('dust', Math.round(q.x), p.ground > .7 ? 1 : 0); p.ground = 0; }
          }
          for (const q of p.pts) { const vx = q.x - q.px, vy = q.y - q.py, v = Math.hypot(vx, vy), m = CFG.VMAX * DT; if (v > m) { q.px = q.x - vx * m / v; q.py = q.y - vy * m / v; } }
          let bad = false;
          for (const q of p.pts) if (!isFinite(q.x) || !isFinite(q.y)) bad = true;
          if (bad) { const np = makePlayer(p.team, p.slot, p.team ? W - 300 : 300, p.look); for (let i = 0; i < 5; i++) Object.assign(p.pts[i], np.pts[i]); }
        }
        stepBall();
        const k = (histI & 127) * 4; hist[k] = ball.x; hist[k + 1] = ball.y; hist[k + 2] = ball.vx; hist[k + 3] = ball.vy; histI++;
      }


      const makeAI = (team, lvl) => ({ team, lvl, held: 0, up: 0, wait: .3, relA: 60, holdFor: .2 });
      const aiSet = (ai, d) => { const t = ai.team; if (btn[t] === d) return; btn[t] = d; ai.held = 0; ai.up = 0; d ? press(t) : release(t); };
      function aiTick(ai, dt) {
        const P = CFG.ai[ai.lvl], t = ai.team, b = ball;
        if (btn[t]) ai.held += dt; else ai.up += dt;
        if (phase !== 'live') { if (btn[t] && !(b.holder && b.holder.team === t)) aiSet(ai, false); if (phase !== 'goal') return; }
        const lag = Math.min(100, Math.round(P.react * CFG.HZ)), k = ((histI - 1 - lag) & 127) * 4;
        const bx = hist[k], by = hist[k + 1], bvx = hist[k + 2], bvy = hist[k + 3];
        const hd = b.holder;
        let wantBack = false;
        if (!(hd && hd.team === t) && phase === 'live') {
          const tx0 = hd ? hd.hip.x : bx, dB = (-players.find(p => p.team === t).dir);
          wantBack = players.every(p => p.team !== t || (tx0 - p.foot.x) * dB > (hd ? 30 : 80));
        }
        if (back[t] !== wantBack) back[t] = wantBack;
        if (hd && hd.team === t) {
          if (!btn[t]) { if (ai.up > ai.wait && hd.ground < CFG.COYOTE) { ai.relA = rnd(P.aLo, P.aHi); ai.wait = rnd(.05, P.gap + .2); aiSet(ai, true); } }
          else {
            const a = armA(hd), vy = (hd.hip.y - hd.hip.py) / DT, apex = hd.ground >= CFG.COYOTE && Math.abs(vy) < P.apexV;
            if ((a >= Math.min(ai.relA, 72) && (apex || ai.held > .55)) || ai.held > 1.1) aiSet(ai, false);
          }
          return;
        }
        if (btn[t]) { if (ai.held > ai.holdFor) aiSet(ai, false); return; }
        if (ai.up < P.gap) return;
        let tx, ty;
        if (hd) { tx = hd.hand.x; ty = hd.hand.y; }
        else { const tau = .22; tx = bx + bvx * tau; ty = Math.min(FLOOR - b.r, by + bvy * tau + .5 * GRAV * BT.gs * tau * tau); }
        let best = 1e9;
        for (const p of players) {
          if (p.team !== t) continue;
          const dx = Math.abs(tx - (p.foot.x + p.dir * 18)); if (dx < best) best = dx;
          if (p.ground >= CFG.COYOTE) continue;
          const top = p.neck.y - p.A - 200;
          if (dx < P.reachX * (hd ? 1.3 : 1) && ty > top && (!hd || Math.random() < P.block * dt * 8)) { ai.holdFor = hd ? rnd(.2, .35) : rnd(.16, .34); aiSet(ai, true); return; }
        }
        if (best >= P.reachX * .8 && ai.up > P.hop && by > 150) { ai.holdFor = rnd(.06, .14); aiSet(ai, true); return; }
        if (P.flail && Math.random() < P.flail * dt) { ai.holdFor = rnd(.08, .4); aiSet(ai, true); }
      }


      function resetInputs() {
        for (const s of srcs) s.clear(); for (const s of bsrcs) s.clear(); ptrs.clear(); btnVis[0] = btnVis[1] = false;
        btn[0] = btn[1] = false; back[0] = back[1] = false;
        if (online === 'guest' && (gDown || gBack)) { gDown = false; gBack = false; seq++; net.send({ t: 'i', d: 0, b: 0, s: seq, ts: Math.round(performance.now()) }); }
      }
      function setBack(t, src, on) {
        const s = bsrcs[t]; if (on) s.add(src); else s.delete(src);
        const d = s.size > 0;
        if (online === 'guest') { if (t === 1 && gBack !== d) { gBack = d; back[1] = d; seq++; net.send({ t: 'i', d: gDown ? 1 : 0, b: d ? 1 : 0, s: seq, ts: Math.round(performance.now()) }); } return; }
        back[t] = d;
      }
      function newAttract() {
        score = [0, 0]; looks = mkLooks(); popups.length = 0; parts.length = 0;
        buildRound(randomCfg(null), looks);
        ais = [makeAI(0, 1), makeAI(1, 1)];
      }
      function newMatch() {
        score = [0, 0]; bump[0] = bump[1] = 0; winner = -1; newBest = false; roundK++; looks = mkLooks(); popups.length = 0; parts.length = 0;
        resetInputs();
        buildRound(classic(), looks);
        ais = mode === 'cpu' ? [null, makeAI(1, diff)] : [null, null];
        screen = 'game'; overT = 0;
        fx('whistle'); setScoreText();
      }
      function toTitle() {
        if (online) { online = null; net.close(); }
        mirror = false; resetInputs(); screen = 'title'; newAttract();
      }
      function start(m) {
        mode = m; persist(); SND.click && snd('click');
        if (m === 'net') return goOnline();
        newMatch();
      }
      function matchOver() {
        phase = 'end'; endT = 0; winner = score[0] > score[1] ? 0 : 1;
        resetInputs(); ais = [null, null];
        screen = 'over'; overT = 0;
        if (mode === 'cpu') { overPts = (score[0] * 100 + (winner === 0 ? 500 : 0)) * CFG.ai[diff].mult; newBest = api.submit(overPts); }
        fx('win', winner);
      }
      function phaseUpdate(dt) {
        if (phase === 'live') rt += dt;
        else if (phase === 'goal') {
          pt += dt;
          if (pt > CFG.GOAL_T) {
            if (Math.max(score[0], score[1]) >= CFG.WIN) { if (screen === 'game') return matchOver(); score = [0, 0]; }
            phase = 'wipe'; pt = 0;
          }
        } else if (phase === 'wipe') {
          pt += dt;
          if (pt >= CFG.WIPE_T) { for (const t of [0, 1]) if (btn[t]) btn[t] = false; buildRound(randomCfg(cfg), looks); roundK++; fx('whistle'); }
        } else if (phase === 'end') {
          endT += dt;
          const want = (endT % .9) < .3;
          if (btn[winner] !== want) { btn[winner] = want; want ? press(winner) : release(winner); }
        }
      }
      function simFrame(dt) {
        let sdt = dt;
        if (slow > 0) { slow -= dt; sdt *= CFG.SLOW; }
        acc += sdt; let n = 0;
        while (acc >= DT && n < 12) { acc -= DT; n++; step(); }
        if (n >= 12) acc = 0;
        for (const ai of ais) if (ai) aiTick(ai, dt);
        phaseUpdate(dt);
      }


      function setBtn(t, d) {
        btnVis[t] = d;
        if (online === 'guest') {
          if (t === 1 && gDown !== d) { gDown = d; seq++; net.send({ t: 'i', d: d ? 1 : 0, b: gBack ? 1 : 0, s: seq, ts: Math.round(performance.now()) }); }
          return;
        }
        if (btn[t] === d) return;
        btn[t] = d;
        if (screen !== 'game') return;
        d ? press(t) : release(t);
      }
      function setSrc(t, src, on) {
        const s = srcs[t]; if (on) s.add(src); else s.delete(src);
        const d = s.size > 0;
        if (d !== btnVis[t] || (online !== 'guest' && d !== btn[t])) setBtn(t, d);
      }
      const keyTeam = code => {
        if (code === 'KeyW' || code === 'Space' || code === 'ArrowUp') return mode === 'net' ? myTeam() : 0;
        return -1;
      };
      const BACK_KEYS = { KeyS: 1, ArrowDown: 1, KeyA: 1, ArrowLeft: 1 };
      const padRects = () => {
        if (PORT) { const y0 = OY + H + 16, hh = CH - y0 - 16; return { back: { x: 18, y: y0, w: 300, h: hh }, jump: { x: 336, y: y0, w: CW - 354, h: hh } }; }
        if (!touchSeen) return null;
        return { back: { x: 12, y: H - 82, w: 124, h: 70 }, jump: { x: CW - 188, y: H - 82, w: 176, h: 70 } };
      };
      const pauseRect = () => ({ x: 14, y: PORT ? 14 : 12, w: 52, h: 52 });
      const inR = (q, r) => q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.h;
      function pause() { if (screen !== 'game' || online) return; resetInputs(); screen = 'pause'; snd('click'); }
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
        const t = screen === 'game' ? keyTeam(e.code) : -1;
        if (t >= 0) e.preventDefault();
        if (e.repeat) return;
        AC();
        if (screen === 'game') {
          if (e.code === 'KeyP') return pause();
          if (t >= 0) setSrc(t, 'k' + e.code, true);
          else if (BACK_KEYS[e.code]) { e.preventDefault(); setBack(mode === 'net' ? myTeam() : 0, 'k' + e.code, true); }
          return;
        }
        menuKey(e);
      });
      api.on(window, 'keyup', e => { for (const t of [0, 1]) { if (srcs[t].has('k' + e.code)) setSrc(t, 'k' + e.code, false); if (bsrcs[t].has('k' + e.code)) setBack(t, 'k' + e.code, false); } });
      api.on(canvas, 'pointerdown', e => {
        e.preventDefault(); AC();
        if (e.pointerType === 'touch') touchSeen = true;
        const q = cv.toLocal(e);
        if (screen === 'game') {
          if (!online && inR(q, pauseRect())) return pause();
          const t = mode === 'net' ? myTeam() : 0, pr = padRects();
          if (pr && inR(q, pr.back)) { ptrs.set(e.pointerId, -1 - t); setBack(t, 'p' + e.pointerId, true); return; }
          ptrs.set(e.pointerId, t); setSrc(t, 'p' + e.pointerId, true);
          return;
        }
        for (let i = btns.length - 1; i >= 0; i--) if (inR(q, btns[i])) { snd('click'); btns[i].act(); return; }
        if (screen === 'over' && overT > .8 && !online && q.y > OY && q.y < OY + 80) return;
      });
      const pup = e => { const t = ptrs.get(e.pointerId); if (t == null) return; ptrs.delete(e.pointerId); if (t < 0) setBack(-1 - t, 'p' + e.pointerId, false); else setSrc(t, 'p' + e.pointerId, false); };
      api.on(window, 'pointerup', pup); api.on(window, 'pointercancel', pup);
      api.on(window, 'blur', () => { if (screen === 'game') for (const t of [0, 1]) { for (const s of [...srcs[t]]) setSrc(t, s, false); for (const s of [...bsrcs[t]]) setBack(t, s, false); } });
      const MODES = ['cpu', 'net'];
      function menuKey(e) {
        const c = e.code, go = c === 'Enter' || c === 'Space' || c === 'KeyW' || c === 'ArrowUp';
        if (screen === 'title') {
          if (go) { e.preventDefault(); start(mode); }
          else if (c === 'Digit1' || c === 'Digit2') start(MODES[+c.slice(5) - 1]);
          else if (c === 'ArrowLeft' || c === 'ArrowRight') { e.preventDefault(); mode = MODES[(MODES.indexOf(mode) + 1) % 2]; persist(); snd('click'); }
          else if (c === 'ArrowDown') { e.preventDefault(); diff = (diff + 1) % 3; persist(); snd('click'); }
        } else if (screen === 'pause') {
          if (go || c === 'KeyP') { e.preventDefault(); screen = 'game'; }
        } else if (screen === 'over') {
          if (go && overT > .8) { e.preventDefault(); if (online) rematch(); else newMatch(); }
        } else if (screen === 'left') {
          if (go) { e.preventDefault(); toTitle(); }
        }
      }


      const cfgArr = () => [cfg.court, cfg.ball, cfg.body, cfg.hoop, cfg.x2 ? 1 : 0].concat(...looks, [cfg.lg ? 1 : 0]);
      function sendSnap() {
        const q = [];
        for (const p of players) for (const r of p.pts) q.push(Math.round(r.x * 2), Math.round(r.y * 2));
        q.push(Math.round(ball.x * 2), Math.round(ball.y * 2), Math.round(angN(ball.ang) * 100), ball.holder ? players.indexOf(ball.holder) : -1);
        net.send({ t: 's', T: Math.round(performance.now()), k: roundK, ph: PH.indexOf(phase), pt: Math.round((phase === 'live' ? rt : pt) * 1000), sc: score, q, c: cfgArr(), f: fxOut, end: screen === 'over' ? winner : -1 }, !fxOut.length);
        fxOut = [];
      }
      api.interval(() => { if (online === 'host' && (screen === 'game' || screen === 'over')) sendSnap(); }, CFG.SNAP_MS);
      api.interval(() => { if (online === 'guest') net.send({ t: 'i', d: gDown ? 1 : 0, b: gBack ? 1 : 0, s: seq }, true); }, 50);
      const setRemote = d => { if (btn[1] === d) return; btn[1] = d; if (screen === 'game') d ? press(1) : release(1); };
      function onMsg(m) {
        if (!online || !m) return;
        if (m.t === 're') { peerRe = true; if (online === 'host' && meRe) hostStart(); else if (!meRe) api.toast('Your friend wants a rematch'); return; }
        if (online === 'host') {
          if (m.t === 'i' && typeof m.s === 'number' && m.s >= rseq) back[1] = !!m.b;
          if (m.t === 'i' && typeof m.s === 'number' && m.s > rseq) {
            rseq = m.s; const s = m.s;
            if (m.d) { gPressTs = +m.ts || 0; hostPressAt = performance.now(); setRemote(true); }
            else {
              const want = (+m.ts || 0) - gPressTs, have = performance.now() - hostPressAt;
              if (want > have + 4 && want < 400) api.timeout(() => { if (rseq === s) setRemote(false); }, want - have);
              else setRemote(false);
            }
          }
          return;
        }
        if (m.t === 's' && typeof m.T === 'number' && Array.isArray(m.q) && Array.isArray(m.c)) {
          let j = snapBuf.length;
          while (j > 0 && snapBuf[j - 1].T > m.T) j--;
          if (j > 0 && snapBuf[j - 1].T === m.T) return;
          if (j === snapBuf.length) {
            const o = m.T - performance.now();
            off = !snapBuf.length || o > off || o < off - 400 ? o : off + (o - off) * .02;
          }
          snapBuf.splice(j, 0, m); if (snapBuf.length > 40) snapBuf.shift();
        }
      }
      function guestFrame() {
        if (!snapBuf.length) return;
        const now = performance.now() + off - CFG.DELAY;
        let i = snapBuf.length - 1; while (i > 0 && snapBuf[i].T > now) i--;
        const a = snapBuf[i], b = snapBuf[i + 1];
        if (a.k !== gK) {
          gK = a.k; const c = a.c, lk = [];
          for (let j = 0; j < 4; j++) lk.push(c.slice(5 + j * 4, 9 + j * 4));
          looks = lk; buildRound({ court: c[0] | 0, ball: c[1] | 0, body: c[2] | 0, hoop: c[3] | 0, x2: c[4] | 0, lg: c[21] | 0 }, lk);
        }
        for (const s of snapBuf) if (!s.done && s.T <= now) {
          s.done = 1;
          if (s.k === gK && Array.isArray(s.f)) for (const e of s.f) { const n = FXN[e[0]]; if (n && FX[n]) FX[n](e[1] | 0, e[2] | 0, e[3] | 0, e[4] | 0); }
        }
        const same = b && b.k === a.k, u = same ? clamp((now - a.T) / ((b.T - a.T) || 1), 0, 1) : 0, qa = a.q, qb = same ? b.q : qa;
        let j = 0;
        if (qa.length !== players.length * 10 + 4) return;
        for (const p of players) for (const r of p.pts) { r.px = r.x; r.py = r.y; r.x = lerp(qa[j], qb[j], u) / 2; r.y = lerp(qa[j + 1], qb[j + 1], u) / 2; j += 2; }
        ball.px = ball.x; ball.py = ball.y; ball.x = lerp(qa[j], qb[j], u) / 2; ball.y = lerp(qa[j + 1], qb[j + 1], u) / 2;
        const aa = qa[j + 2] / 100; ball.ang = aa + angN(qb[j + 2] / 100 - aa) * u;
        ball.holder = qa[j + 3] >= 0 ? players[qa[j + 3]] || null : null;
        for (const p of players) p.ground = p.foot.y >= FLOOR - p.LR - 1 ? 0 : 1;
        phase = PH[a.ph] || 'live';
        const tt = a.pt / 1000 + Math.max(0, now - a.T) / 1000;
        if (phase === 'live') rt = tt; else pt = tt;
        if (a.sc[0] !== score[0] || a.sc[1] !== score[1]) { score = [a.sc[0] | 0, a.sc[1] | 0]; setScoreText(); }
        if (a.end >= 0) { if (screen !== 'over') { winner = a.end; screen = 'over'; overT = 0; } }
        else if (screen === 'over' || screen === 'netwait') { screen = 'game'; meRe = peerRe = false; setScoreText(); }
      }
      function hostStart() {
        if (online !== 'host') return;
        meRe = peerRe = false; newMatch();
      }
      function rematch() {
        if (!online) return newMatch();
        if (meRe) return;
        meRe = true; net.send({ t: 're' });
        if (online === 'host' && peerRe) hostStart();
      }
      function wire() {
        if (wired) return;
        wired = true;
        net.on('open', role => {
          online = role; mirror = role === 'guest'; snapBuf.length = 0; gK = -1; rseq = -1; seq = 0; off = 0; fxOut = [];
          resetInputs(); screen = 'netwait'; ais = [null, null];
          if (role === 'host') api.timeout(hostStart, 400);
        });
        net.on('data', onMsg);
        net.on('close', () => {
          if (!online) return;
          online = null; resetInputs(); screen = 'left'; snd('thud', 1);
        });
      }
      async function goOnline() {
        if (lobbying || online) return;
        wire(); lobbying = true; screen = 'lobby';
        const role = await net.lobby({ title: 'Hoop Flop online', text: 'Create a room and send the code or invite link to a friend on another device, or type their code to join. First to 5 wins.' });
        lobbying = false;
        if (!role && api.alive && !online) toTitle();
      }


      function paintBg() {
        const g = bg; g.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0); g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = false;
        const R = seeded(11 + CFG.courts.indexOf(court) * 31), k = court.k, FT = 352;
        const F = (c, x, y, w, hh) => { g.fillStyle = c; g.fillRect(x, y, w, hh); };
        const P = (c, pts) => { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
        const cloud = (x, y, s, c) => { F(c, x, y, 120 * s, 24 * s); F(c, x + 20 * s, y - 16 * s, 64 * s, 20 * s); F(c, x + 44 * s, y - 28 * s, 32 * s, 16 * s); F(c, x - 16 * s, y + 8 * s, 156 * s, 16 * s); };
        const pine = (x, y, s, c, sn) => { for (let j = 0; j < 4; j++) { const w = (60 - j * 12) * s, yy = y - j * 26 * s; P(c, [x - w, yy, x + w, yy, x, yy - 44 * s]); if (sn) F(sn, x - w * .5, yy - 10 * s, w, 6 * s); } F('#6b4a2a', x - 6 * s, y, 12 * s, 20 * s); };
        crowd = [];
        let floorC = '#d9a46a', lineC = '#ffffff';
        if (k === 'gym') {
          F('#8c8c8c', 0, 0, W, FT);
          F('#4b4b4f', 0, 0, W, 56); F('#6e6e74', 0, 12, W, 8); F('#6e6e74', 0, 44, W, 8);
          for (let x = 0; x < W; x += 48) { F('#6e6e74', x, 12, 8, 40); g.strokeStyle = '#626268'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 8, 20); g.lineTo(x + 48, 44); g.stroke(); }
          F('#2f2f33', 0, 56, W, 4);
          for (let x = 0; x < W; x += 112) { F('#777779', x, 60, 4, 186); F('#9d9d9f', x + 4, 60, 4, 186); for (const yy of [84, 150, 216]) for (const xx of [24, 88]) { F('#a6a6a8', x + xx - 6, yy, 12, 4); F('#a6a6a8', x + xx - 2, yy - 4, 4, 12); } }
          F('#7a7a7c', 0, 240, W, 8);
          F('#83563a', 0, 248, W, FT - 248);
          for (let y = 248; y < FT; y += 20) { F('#6c4430', 0, y, W, 4); F('#9a6948', 0, y + 4, W, 4); }
          for (let x = 30; x < W; x += 150) F('#6c4430', x + (R() * 40 | 0), 248, 4, FT - 248);
          F('#5c3a26', 0, FT - 8, W, 8);
        } else if (k === 'beach') {
          F('#57bdf2', 0, 0, W, 120); F('#76cbf5', 0, 120, W, 80); F('#99daf7', 0, 200, W, 60);
          cloud(120, 90, 1.1, '#ffffff'); cloud(560, 60, .9, '#ffffff'); cloud(800, 150, .7, '#ffffff'); cloud(300, 200, .8, '#e6f6ff');
          F('#2f9fe0', 0, 260, W, FT - 260); for (let i = 0; i < 40; i++) F(i % 3 ? '#5fc0f0' : '#ffffff', R() * W | 0, 266 + (R() * (FT - 276) | 0), 16 + (R() * 30 | 0), 4);
          P('#f2d48e', [300, 270, 380, 244, 580, 244, 660, 270]); P('#3faa48', [330, 256, 400, 234, 560, 234, 630, 256]);
          for (const [tx, h] of [[380, 72], [430, 92], [490, 80], [545, 98], [590, 70]]) { g.strokeStyle = '#8a5a2c'; g.lineWidth = 8; g.beginPath(); g.moveTo(tx, 246); g.lineTo(tx + 8, 246 - h); g.stroke(); for (const a of [-2.6, -2.1, -1.1, -.5]) { g.strokeStyle = '#2f8a3a'; g.lineWidth = 10; g.beginPath(); g.moveTo(tx + 8, 246 - h); g.lineTo(tx + 8 + Math.cos(a) * 34, 246 - h - Math.sin(-a) * 10 + 14); g.stroke(); } }
          for (const sx2 of [150, 760]) { P('#5d6c7a', [sx2, 300, sx2 + 12, 276, sx2 + 22, 300]); F('#ffffff', sx2 - 8, 300, 38, 4); }
          floorC = '#f3d7a2';
        } else if (k === 'ice') {
          F('#e4e8ec', 0, 0, W, FT);
          for (let i = 0; i < 12; i++) pine(i * 90 + (R() * 30 | 0), 170 + (R() * 30 | 0), .9 + R() * .4, '#c8d0d6', '#ffffff');
          F('#8a5a38', 220, 150, 520, 140); P('#ffffff', [190, 156, 480, 70, 770, 156]); P('#6e4428', [210, 160, 480, 84, 750, 160]); P('#f6f8fa', [200, 156, 480, 76, 760, 156, 750, 166, 480, 90, 210, 166]);
          for (let y = 168; y < 290; y += 18) F('#72482c', 220, y, 520, 4);
          for (const wx of [270, 400, 540, 650]) { F('#3a2412', wx - 4, 196, 56, 52); F('#ffd04a', wx, 200, 48, 44); F('#3a2412', wx + 22, 200, 4, 44); }
          F('#ffffff', 220, 140, 520, 14);
          for (let x = 0; x < W; x += 26) { const hh = 70 + (x / 26 % 3) * 6; F('#8a5a38', x, FT - hh, 22, hh); F('#6e4428', x + 18, FT - hh, 4, hh); F('#ffffff', x - 2, FT - hh - 6, 26, 10); }
          F('#6e4428', 0, FT - 48, W, 6); F('#6e4428', 0, FT - 24, W, 6);
          floorC = '#f4f7fa'; lineC = '#e88a8a';
        } else if (k === 'street') {
          F('#8fe0f7', 0, 0, W, FT); F('#b4ecfa', 0, 120, W, 60);
          cloud(90, 80, .8, '#ffffff'); cloud(650, 50, 1, '#ffffff');
          for (let x = -10; x < W;) { const w = 40 + (R() * 70 | 0), hh = 60 + (R() * 130 | 0); F('#a9daee', x, 260 - hh, w, hh + 20); if (R() < .4) F('#a9daee', x + w / 2 - 4, 260 - hh - 24, 8, 24); for (let wy = 270 - hh; wy < 250; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 12) if (R() < .5) F('#c4e6f4', wx, wy, 6, 8); x += w + 4; }
          F('#a8724a', 0, 236, W, FT - 236);
          for (let x = 0; x < W; x += 24) { F('#8f5d3a', x, 236, 4, FT - 236); F('#b9845a', x + 4, 236, 4, FT - 236); const t = 236 - (x / 24 % 2) * 8; F('#a8724a', x, t, 24, 236 - t); F('#8f5d3a', x, t, 4, 236 - t); }
          F('#8f5d3a', 0, 262, W, 6); F('#8f5d3a', 0, 320, W, 6);
          for (let x = -20; x < W; x += 36) { const hh = 22 + (R() * 22 | 0); F('#5fbf3a', x, FT - hh, 40, hh); F('#7fd84a', x + 6, FT - hh, 20, 6); }
          floorC = '#3e4044';
        } else {
          F('#1f1a46', 0, 0, W, 140); F('#2f2560', 0, 140, W, 80); F('#4a2f72', 0, 220, W, 50); F('#7a3e7e', 0, 270, W, FT - 270);
          for (let i = 0; i < 60; i++) F('#ffffff', R() * W | 0, R() * 200 | 0, 4, 4);
          g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(150, 76, 26, 0, TAU); g.fill(); g.fillStyle = '#1f1a46'; g.beginPath(); g.arc(164, 66, 24, 0, TAU); g.fill();
          for (let layer = 0; layer < 2; layer++) for (let x = -10; x < W;) { const w = 50 + (R() * 70 | 0), hh = (layer ? 70 : 130) + (R() * (layer ? 90 : 110) | 0), y = FT - hh; F(layer ? '#231c4a' : '#3d3270', x, y, w, hh); if (layer) for (let wy = y + 12; wy < FT - 12; wy += 20) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (R() < .4) F('#ffd36b', wx, wy, 8, 10); x += w + (layer ? 6 : 14); }
          F('#a49ab5', 0, FT - 28, W, 28); F('#c3bad3', 0, FT - 30, W, 6); for (let x = 0; x < W; x += 80) F('#7d7590', x, FT - 24, 4, 24);
          floorC = '#77748e';
        }
        F(floorC, 0, FT, W, H - FT);
        if (k === 'gym') { for (let i = -6; i < 40; i++) { const x = i * 36; g.strokeStyle = i % 2 ? '#c9925a' : '#e2b37c'; g.lineWidth = 4; g.beginPath(); g.moveTo(480 + (x - 480) * .8, FT); g.lineTo(x, H); g.stroke(); } F('#e8b884', 0, FT, W, 8); }
        else if (k === 'beach') for (let i = 0; i < 90; i++) F('#e4c487', R() * W | 0, FT + (R() * (H - FT) | 0), 4, 4);
        else if (k === 'street') for (let i = 0; i < 120; i++) F(R() < .5 ? '#47494e' : '#36383c', R() * W | 0, FT + (R() * (H - FT) | 0), 4 + (R() * 8 | 0), 4);
        else if (k === 'ice') { for (let i = 0; i < 30; i++) F('#dfe9f2', R() * W | 0, FT + (R() * (H - FT) | 0), 30 + (R() * 50 | 0), 4); F('#ffffff', 0, FT, W, 8); }
        const by = FT + 46, fy = H - 22, L0 = 30, L1 = 0;
        g.strokeStyle = lineC; g.lineWidth = 4; g.lineJoin = 'miter';
        g.beginPath(); g.moveTo(L0 + 30, by); g.lineTo(W - L0 - 30, by); g.lineTo(W - L1, fy); g.lineTo(L1, fy); g.closePath(); g.stroke();
        g.beginPath(); g.moveTo(480, by); g.lineTo(480, fy); g.stroke();
        for (const s of [1, -1]) {
          const x0 = s > 0 ? 0 : W, kx = x => x0 + s * x;
          g.beginPath(); g.moveTo(kx(66), by); g.lineTo(kx(196), by); g.lineTo(kx(170), fy - 34); g.lineTo(kx(36), fy - 34); g.stroke();
        }
      }

      const line = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
      const circ = (x, y, r, f, s, sw = 3) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = sw; ctx.stroke(); } };
      const rrect = (x, y, w, hh, r, f, s, sw = 4) => { ctx.beginPath(); ctx.roundRect(x, y, w, hh, r); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = sw; ctx.stroke(); } };
      function chunky(txt, x, y, size, fill, sw, align = 'center') {
        ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = sw == null ? Math.max(4, size * .2) : sw; ctx.strokeStyle = OUT;
        ctx.strokeText(txt, x, y + size * .07); ctx.strokeText(txt, x, y);
        ctx.fillStyle = fill; ctx.fillText(txt, x, y);
      }
      function button(x, y, w, hh, label, col, colD, act, sel) {
        btns.push({ x, y, w, h: hh, act });
        if (sel) rrect(x - 8, y - 8, w + 16, hh + 22, 22, null, '#ffd23f', 6);
        rrect(x, y + 8, w, hh, 18, colD, OUT);
        rrect(x, y, w, hh, 18, col, OUT);
        rrect(x + 10, y + 7, w - 20, hh * .28, 10, 'rgba(255,255,255,.28)');
        chunky(label, x + w / 2, y + hh / 2 + 2, Math.round(hh * .4), '#ffffff');
      }

      function drawHoopBack(Hh) {
        const s = Hh.s, px = Hh.bx - s * 30, top = Hh.y - CFG.BOARD_UP, bot = Hh.y + CFG.BOARD_DN, py = top - 12;
        ctx.lineCap = 'butt';
        box(px, FLOOR + 8, px, py, 16, '#e9ebf0', 4); box(px + s * 4, FLOOR + 8, px + s * 4, py, 6, '#b9bdc8', 0);
        box(px, py, Hh.bx - s * 2, top + 34, 12, '#e9ebf0', 4);
        box(px, Hh.y - 26, Hh.bx - s * 2, Hh.y - 26, 12, '#e9ebf0', 4); box(px, Hh.y - 22, Hh.bx - s * 2, Hh.y - 22, 4, '#b9bdc8', 0);
        ctx.fillStyle = OUT; ctx.fillRect(px - 16, FLOOR - 4, 32, 14); ctx.fillStyle = '#6f7480'; ctx.fillRect(px - 12, FLOOR, 24, 6);
        box(Hh.bx, top, Hh.bx, bot, 12, '#f4f5f8', 4); box(Hh.bx - s * 3, top, Hh.bx - s * 3, bot, 4, '#c4c8d2', 0);
        const cx = (Hh.xb + Hh.xf) / 2, rw = CFG.RIMW / 2;
        ctx.fillStyle = OUT; ctx.fillRect(cx - rw - 4, Hh.y - 16, rw * 2 + 8, 18);
        ctx.fillStyle = '#e8322a'; ctx.fillRect(cx - rw, Hh.y - 12, rw * 2, 6);
        ctx.fillStyle = '#eef0f4'; ctx.fillRect(cx - rw + 6, Hh.y - 6, rw * 2 - 12, 6);
        ctx.fillStyle = '#b9bdc8'; for (let x = cx - rw + 10; x < cx + rw - 8; x += 12) ctx.fillRect(x, Hh.y - 6, 4, 6);
      }
      function drawNet(Hh) {
        const cx = (Hh.xb + Hh.xf) / 2, rw = CFG.RIMW / 2, nh = CFG.NET_H * .8 + Hh.net * 14, bw = rw * (.62 + Hh.net * .12), sw = Hh.netX, N = 5;
        ctx.lineCap = 'butt';
        for (let i = 0; i <= N; i++) { const x0 = cx - rw + 6 + i * (rw * 2 - 12) / N, x1 = cx + sw - bw + i * 2 * bw / N; box(x0, Hh.y + 4, x1, Hh.y + nh, 7, OUT, 0); }
        for (let i = 0; i <= N; i++) { const x0 = cx - rw + 6 + i * (rw * 2 - 12) / N, x1 = cx + sw - bw + i * 2 * bw / N; box(x0, Hh.y + 4, x1, Hh.y + nh, 4, i % 2 ? '#d8dbe2' : '#ffffff', 0); }
        for (const f of [.35, .7]) box(lerp(cx - rw + 6, cx + sw - bw, f), Hh.y + 4 + (nh - 4) * f, lerp(cx + rw - 6, cx + sw + bw, f), Hh.y + 4 + (nh - 4) * f, 4, '#ffffff', 0);
        ctx.fillStyle = OUT; ctx.fillRect(cx - rw - 4, Hh.y - 2, rw * 2 + 8, 12);
        ctx.fillStyle = '#e8322a'; ctx.fillRect(cx - rw, Hh.y, rw * 2, 6); ctx.fillRect(cx - rw, Hh.y - 12, 6, 18); ctx.fillRect(cx + rw - 6, Hh.y - 12, 6, 18);
        ctx.fillStyle = '#ff8a7a'; ctx.fillRect(cx - rw + 6, Hh.y, rw * 2 - 12, 2);
        ctx.fillStyle = '#e8322a'; ctx.fillRect(Math.min(Hh.bx, Hh.xb), Hh.y - 4, Math.abs(Hh.xb - Hh.bx) + 2, 8);
      }
      function updateNets(dt) {
        for (const Hh of hoops) {
          const cx = (Hh.xb + Hh.xf) / 2, inside = ball && ball.x > Hh.lo - 4 && ball.x < Hh.hi + 4 && ball.y > Hh.y - 4 && ball.y < Hh.y + CFG.NET_H + ball.r;
          Hh.netV += ((inside ? 1 : 0) - Hh.net) * 260 * dt - Hh.netV * 9 * dt; Hh.net = clamp(Hh.net + Hh.netV * dt, -.3, 1.4);
          Hh.netX = lerp(Hh.netX, inside ? (ball.x - cx) * .4 : 0, Math.min(1, dt * 8));
        }
      }
      function drawBall(b) {
        const r = b.r, k = BT.k;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang);
        if (k === 'beach') {
          circ(0, 0, r, '#ffffff');
          const cols = ['#f04848', '#ffd23f', '#3b7cf4'];
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, i * TAU / 3, i * TAU / 3 + TAU / 6); ctx.closePath(); ctx.fillStyle = cols[i]; ctx.fill(); }
          circ(0, 0, r * .2, '#ffffff', OUT, 2);
        } else if (k === 'heavy') {
          const gr = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); gr.addColorStop(0, '#7a62b8'); gr.addColorStop(1, '#2a2048');
          circ(0, 0, r, gr);
          for (const [x, y] of [[.25, -.3], [.5, -.05], [.2, .15]]) circ(x * r, y * r, r * .13, '#120c22');
        } else if (k === 'bouncy') {
          const gr = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); gr.addColorStop(0, '#d8ff7a'); gr.addColorStop(1, '#6cc21a');
          circ(0, 0, r, gr);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-r * 1.1, 0, r * .9, -.9, .9); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 1.1, 0, r * .9, Math.PI - .9, Math.PI + .9); ctx.stroke();
        } else {
          const gr = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); gr.addColorStop(0, '#ffad5a'); gr.addColorStop(1, '#e2611a');
          circ(0, 0, r, gr);
          ctx.strokeStyle = '#4a200c'; ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(110,40,0,.28)';
          for (let i = 0; i < 16; i++) { const a = i * 2.399, q = Math.sqrt((i + .5) / 16) * r * .86; ctx.beginPath(); ctx.arc(Math.cos(a) * q, Math.sin(a) * q, r * .05, 0, TAU); ctx.fill(); }
          ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
          ctx.beginPath(); ctx.arc(-r * 1.25, 0, r * .95, -.8, .8); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 1.25, 0, r * .95, Math.PI - .8, Math.PI + .8); ctx.stroke();
        }
        circ(0, 0, r, null, OUT, 3);
        ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.clip();
        const bsg = ctx.createRadialGradient(b.x - r * .35, b.y - r * .4, r * .2, b.x, b.y, r * 1.05); bsg.addColorStop(0, 'rgba(255,255,255,0)'); bsg.addColorStop(.65, 'rgba(0,0,0,0)'); bsg.addColorStop(1, 'rgba(40,10,0,.4)');
        ctx.fillStyle = bsg; ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
        ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, r - 2, Math.PI * .1, Math.PI * .55); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(b.x - r * .35, b.y - r * .4, r * .3, r * .17, -.6, 0, TAU); ctx.fill();
      }
      function shadow(x, y, r) {
        const k = clamp(1 - (FLOOR - y) / 420, .2, 1);
        ctx.fillStyle = `rgba(29,27,38,${.22 * k})`; ctx.beginPath(); ctx.ellipse(x, FLOOR + 3, r * k, r * .22 * k + 1, 0, 0, TAU); ctx.fill();
      }
      function box(x1, y1, x2, y2, w, col, o) {
        const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1e-6;
        ctx.save(); ctx.translate(x1, y1); ctx.rotate(Math.atan2(dy, dx));
        if (o) { ctx.fillStyle = OUT; ctx.fillRect(-o, -w / 2 - o, l + o * 2, w + o * 2); }
        ctx.fillStyle = col; ctx.fillRect(0, -w / 2, l, w);
        ctx.restore();
      }
      function drawHead(p) {
        const hd = p.head, nk = p.neck, r = p.HR, L = p.look, hair = HAIRC[L[2] % 6], skin = SKIN[L[0] % 5], q = r * .95;
        const ang = Math.atan2(hd.x - nk.x, nk.y - hd.y);
        ctx.save(); ctx.translate(hd.x, hd.y); ctx.rotate(ang); if (p.dir < 0) ctx.scale(-1, 1);
        const hs = L[1];
        if (hs === 1) { ctx.fillStyle = OUT; ctx.fillRect(-q - 8, -q - 18, q * 2 + 12, q + 22); ctx.fillStyle = hair; ctx.fillRect(-q - 4, -q - 14, q * 2 + 4, q + 18); }
        ctx.fillStyle = OUT; ctx.fillRect(-q - 4, -q - 4, q * 2 + 8, q * 2 + 8);
        ctx.fillStyle = skin; ctx.fillRect(-q, -q, q * 2, q * 2);
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(-q, q - 6, q * 2, 6); ctx.fillRect(-q, -q, 6, q * 2);
        if (hs === 0) { ctx.fillStyle = hair; ctx.fillRect(-q, -q, q * 2, q * .5); ctx.fillRect(-q, -q, q * .7, q * 1.1); }
        else if (hs === 1) { ctx.fillStyle = hair; ctx.fillRect(-q, -q, q * 2, q * .3); ctx.fillRect(-q, -q, q * .5, q); }
        else if (hs === 2) { ctx.fillStyle = hair; ctx.fillRect(-q, -q, q * 2, q * .35); ctx.fillStyle = TEAMS[p.team].c; ctx.fillRect(-q, -q * .65, q * 2, q * .3); ctx.fillStyle = hair; ctx.fillRect(-q, -q * .35, q * .55, q * .5); }
        else if (hs === 4) { ctx.fillStyle = hair; ctx.fillRect(-q, -q, q * 2, q * .45); for (let i = 0; i < 4; i++) ctx.fillRect(-q + i * q * .5, -q - 8, q * .3, 10); ctx.fillRect(-q, -q, q * .6, q * .9); }
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-q * .45, -q * .05, q * .35, q * .45);
        ctx.fillStyle = OUT;
        const ey = -q * .2;
        if (p.happy > 0) { ctx.fillRect(q * .35, ey, q * .3, 4); ctx.fillRect(q * .3, q * .4, q * .55, q * .3); }
        else if (p.sad > 0) { ctx.fillRect(q * .4, ey, 5, q * .3); ctx.fillRect(q * .25, q * .5, q * .55, 4); }
        else { ctx.fillRect(q * .4, ey - 2, 6, q * .42); const air = p.ground > .25 && (p.hip.y - p.hip.py) > 2; if (air) ctx.fillRect(q * .5, q * .45, q * .3, q * .3); else ctx.fillRect(q * .45, q * .55, q * .4, 4); }
        ctx.restore();
      }
      function drawPlayer(p, held) {
        const T = TEAMS[p.team], L = p.look, skin = SKIN[L[0] % 5], { neck: nk, hip: hp, foot: ft, hand: hn } = p, s = p.s, o = 4;
        let lx = ft.x - hp.x, ly = ft.y - hp.y; const ll = Math.hypot(lx, ly) || 1; lx /= ll; ly /= ll;
        const fx2 = ly * p.dir, fy2 = -lx * p.dir;
        const lw = p.LR * 2.1, tw = p.TR * 2.1, hx0 = hp.x - lx * 6, hy0 = hp.y - ly * 6;
        const at = k => [lerp(hx0, ft.x, k), lerp(hy0, ft.y, k)];
        const sh = at(1), shoeL = 14 * s + lw * .55;
        box(sh[0] - fx2 * lw * .55, sh[1] - fy2 * lw * .55, sh[0] + fx2 * shoeL, sh[1] + fy2 * shoeL, 12 * s, OUT, o);
        box(hx0, hy0, ft.x - lx * 4, ft.y - ly * 4, lw, skin, o);
        const a = at(0), b = at(.42); box(a[0], a[1], b[0], b[1], lw + 4, T.c, 0);
        box(b[0] - lx * 4, b[1] - ly * 4, b[0], b[1], lw + 4, T.d, 0);
        const c1 = at(.74), c2 = at(.9); box(c1[0], c1[1], c2[0], c2[1], lw, '#ffffff', 0);
        box(sh[0] - fx2 * lw * .55 + lx * 2, sh[1] - fy2 * lw * .55 + ly * 2, sh[0] + fx2 * shoeL + lx * 2, sh[1] + fy2 * shoeL + ly * 2, 4, '#e8e8e8', 0);
        const tx = nk.x - (hp.x - nk.x) * .05, ty = nk.y - (hp.y - nk.y) * .05;
        box(tx, ty, hp.x, hp.y, tw, T.c, o);
        box(tx, ty, hp.x, hp.y, 5, T.d, 0);
        const ux = (hp.x - nk.x), uy = (hp.y - nk.y), ul = Math.hypot(ux, uy) || 1, nx = -uy / ul * tw * .5, ny = ux / ul * tw * .5;
        box(tx + nx * .8, ty + ny * .8, hp.x + nx * .8, hp.y + ny * .8, 3, T.l, 0); box(tx - nx * .8, ty - ny * .8, hp.x - nx * .8, hp.y - ny * .8, 3, T.l, 0);
        drawHead(p);
        if (held) drawBall(ball);
        const aw = 10 * s, sx0 = lerp(nk.x, hp.x, .1), sy0 = lerp(nk.y, hp.y, .1);
        box(sx0, sy0, hn.x, hn.y, aw, skin, o);
        box(sx0, sy0, lerp(sx0, hn.x, .12), lerp(sy0, hn.y, .12), aw + 4, T.c, 0);
        box(lerp(sx0, hn.x, .85), lerp(sy0, hn.y, .85), hn.x, hn.y, aw, 'rgba(0,0,0,.12)', 0);
      }
      function drawCrowd() {
        if (court.k !== 'gym') return;
        const amp = cheerT > 0 ? 6 : 1.2;
        for (let i = 0; i < crowd.length; i++) {
          const c = crowd[i], y = c.y + Math.sin(clock * (cheerT > 0 ? 11 : 2) + c.ph) * amp;
          if (cheerT > 0) { ctx.strokeStyle = c.s; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(c.x - 9, y - 12); ctx.lineTo(c.x - 15, y - 34); ctx.moveTo(c.x + 9, y - 12); ctx.lineTo(c.x + 15, y - 34); ctx.stroke(); }
          ctx.fillStyle = c.c; ctx.beginPath(); ctx.roundRect(c.x - 12, y - 16, 24, 26, 8); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(c.x - 9, y - 15, 5, 22); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(c.x + 4, y - 14, 7, 24);
          ctx.fillStyle = c.s; ctx.beginPath(); ctx.arc(c.x, y - 26, 9, 0, TAU); ctx.fill();
          ctx.fillStyle = ['#3a2418', '#1d1b26', '#c8923c', '#8a4a1c', '#d8d8d8'][(c.ph * 100 | 0) % 5]; ctx.beginPath(); ctx.arc(c.x, y - 27, 9.4, Math.PI * 1.04, Math.PI * 1.96); ctx.quadraticCurveTo(c.x, y - 29, c.x - 9.2, y - 27); ctx.fill();
          ctx.fillStyle = '#1d1b26'; ctx.fillRect(c.x - 4.5, y - 26, 2, 2.4); ctx.fillRect(c.x + 2.5, y - 26, 2, 2.4);
          if (cheerT > 0) { ctx.fillStyle = '#7a1f2b'; ctx.beginPath(); ctx.ellipse(c.x, y - 21, 3, 2.6, 0, 0, TAU); ctx.fill(); } else { ctx.strokeStyle = 'rgba(29,27,38,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(c.x, y - 22.4, 2.4, .2, Math.PI - .2); ctx.stroke(); }
        }
      }
      function drawAmbient() {
        if (court.k === 'ice') { ctx.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 46; i++) { const x = ((i * 97 + clock * (14 + i % 4 * 6)) % (W + 20)) - 10, y = (i * 53 + clock * (28 + i % 5 * 9)) % FB; ctx.beginPath(); ctx.arc(x + Math.sin(clock + i) * 6, y, 1.5 + i % 3, 0, TAU); ctx.fill(); } }
        else if (court.k === 'beach') { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let i = 0; i < 8; i++) { const x = (i * 131 + clock * 18) % W, y = 352 + i * 7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y); ctx.stroke(); } }
        else if (court.k === 'roof') { ctx.fillStyle = 'rgba(255,255,255,.7)'; const bx = (clock * 40) % (W + 200) - 100; ctx.beginPath(); ctx.arc(bx, 110, 2.5, 0, TAU); ctx.fill(); ctx.fillStyle = Math.sin(clock * 6) > 0 ? '#ff5a5a' : '#ffffff'; ctx.beginPath(); ctx.arc(bx + 6, 110, 2, 0, TAU); ctx.fill(); }
      }
      function drawWorld() {
        ctx.save();
        if (shake > 0) ctx.translate(rnd(-1, 1) * shake * 14, rnd(-1, 1) * shake * 9);
        ctx.translate(0, OY);
        if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
        ctx.imageSmoothingEnabled = false; ctx.drawImage(bgc, 0, 0, W, H);
        drawCrowd(); drawAmbient();
        if (!ball) { ctx.restore(); return; }
        for (const p of players) shadow(p.foot.x, p.foot.y, 22 * p.s);
        if (!ball.holder) shadow(ball.x, ball.y, ball.r);
        for (const Hh of hoops) drawHoopBack(Hh);
        let inNet = null;
        for (const Hh of hoops) if (!ball.holder && ball.x > Hh.lo - 6 && ball.x < Hh.hi + 6 && ball.y > Hh.y - ball.r * .6 && ball.y < Hh.y + CFG.NET_H + ball.r) inNet = Hh;
        if (inNet) drawBall(ball);
        for (const Hh of hoops) drawNet(Hh);
        for (const p of players) drawPlayer(p, ball.holder === p);
        if (!ball.holder && !inNet) drawBall(ball);
        for (const q of parts) {
          const a = clamp(q.life / q.max, 0, 1);
          ctx.globalAlpha = q.kind === 1 ? a * .7 : Math.min(1, a * 2);
          ctx.fillStyle = q.c;
          if (q.kind === 0) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2); ctx.restore(); }
          else { ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (1.4 - a * .6), 0, TAU); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
        if (ball.y < -ball.r) { const x = clamp(ball.x, 20, W - 20); ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x - 12, 26); ctx.lineTo(x + 12, 26); ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke(); }
        ctx.restore();
      }


      const sx = x => mirror ? W - x : x;
      function drawScore() {
        const cx = CW / 2, y = PORT ? 22 : 10, tl = mirror ? 1 : 0, tr = 1 - tl;
        rrect(cx - 168, y, 336, 78, 24, 'rgba(29,27,38,.82)');
        for (const [t, x] of [[tl, cx - 88], [tr, cx + 88]]) {
          const T = TEAMS[t], b = 1 + bump[t] * .3;
          ctx.save(); ctx.translate(x, y + 39); ctx.scale(b, b);
          rrect(-62, -27, 124, 60, 16, T.d, OUT, 3); rrect(-62, -32, 124, 60, 16, T.c, OUT, 3); rrect(-54, -27, 108, 14, 7, 'rgba(255,255,255,.25)');
          chunky(String(score[t]), 0, -1, 46, '#ffffff', 8);
          ctx.restore();
          for (let i = 0; i < CFG.WIN; i++) circ(x - 40 + i * 20, y + 92, 6, i < score[t] ? T.c : 'rgba(255,255,255,.7)', OUT, 2.5);
        }
        if (cfg && cfg.x2) { rrect(cx - 26, y + 22, 52, 34, 12, '#ffd23f', OUT, 3); chunky('x2', cx, y + 40, 22, '#ffffff', 5); }
        else { ctx.save(); ctx.translate(cx, y + 39); circ(0, 0, 13, '#ff8a2a', OUT, 3); line(-13, 0, 13, 0, 2, '#4a200c'); line(0, -13, 0, 13, 2, '#4a200c'); ctx.restore(); }
        if (phase === 'live' && rt < 2.4 && cfg && screen === 'game') {
          const a = clamp(Math.min((rt - .35) * 4, (2.4 - rt) * 3), 0, 1);
          if (a > 0) {
            const bits = [court.name, BT.k !== 'basket' ? BT.name : '', BD.name, (CFG.hoops[cfg.hoop] || {}).name || '', cfg.lg ? 'LOW GRAVITY' : ''].filter(Boolean);
            const txt = bits.join('  ·  ') + (cfg.x2 ? '  ·  DOUBLE POINTS' : '');
            ctx.globalAlpha = a; ctx.font = `900 27px ${FONT}`; let tw0 = ctx.measureText(txt).width; if (tw0 > W - 70) { ctx.font = `900 ${27 * (W - 70) / tw0}px ${FONT}`; tw0 = ctx.measureText(txt).width; } const w = tw0 + 48;
            rrect(cx - w / 2, y + 106, w, 50, 24, cfg.x2 ? '#ffd23f' : '#ffffff', OUT, 3);
            ctx.fillStyle = OUT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, cx, y + 132);
            ctx.globalAlpha = 1;
          }
        }
      }
      function drawPads() {
        const pr = padRects();
        if (!pr || screen !== 'game') return;
        const t = myTeam(), T = TEAMS[t], al = PORT ? 1 : .55;
        const pad = (r, on, col, colD, big, small) => {
          const dy = on ? 6 : 0;
          ctx.globalAlpha = al;
          rrect(r.x, r.y + 8, r.w, r.h - 8, Math.min(30, r.h / 2), colD, OUT, 4);
          rrect(r.x, r.y + dy, r.w, r.h - 8, Math.min(30, r.h / 2), on ? T.l : col, OUT, 4);
          chunky(big, r.x + r.w / 2, r.y + dy + (small ? r.h * .38 : r.h * .46), PORT ? 50 : 30, '#ffffff', PORT ? 10 : 6);
          if (small) { ctx.font = `900 ${PORT ? 20 : 13}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(small, r.x + r.w / 2, r.y + dy + r.h * .7); }
          ctx.globalAlpha = 1;
        };
        pad(pr.back, back[t] && bsrcs[t].size > 0 || (online === 'guest' && gBack), '#7a7f9a', '#4e5270', '◀ BACK', PORT ? 'HOLD' : '');
        pad(pr.jump, btnVis[t], T.c, T.d, 'JUMP', PORT ? 'HOLD · RELEASE TO SHOOT' : '');
      }
      function drawWipe() {
        let u = 0;
        if (phase === 'wipe') u = clamp(pt / CFG.WIPE_T, 0, 1);
        else if (phase === 'live' && rt < .4 && (roundK > 0 || online === 'guest') && screen !== 'title') u = 1 - rt / .4;
        if (u <= 0) return;
        const T = TEAMS[lastScorer], x = lerp(-300, W + 300, u);
        ctx.save(); ctx.translate(0, OY); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
        for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? T.d : T.c; ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(x - i * 40, 0); ctx.lineTo(x - i * 40 - 180, H); ctx.lineTo(-300, H); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
      function drawPopups(dt) {
        for (let i = popups.length - 1; i >= 0; i--) {
          const q = popups[i]; q.t += dt;
          if (q.t > 1.9) { popups.splice(i, 1); continue; }
          const s = q.t < .2 ? q.t / .2 * 1.2 : q.t < .3 ? 1.2 - (q.t - .2) * 2 : 1, a = clamp((1.9 - q.t) * 3, 0, 1);
          ctx.save(); ctx.globalAlpha = a; ctx.translate(sx(q.x), OY + q.y - q.t * 20); ctx.scale(s, s); ctx.rotate(-.05);
          chunky(q.text, 0, 0, 52, '#ffd23f', 11); chunky(q.sub, 0, 52, 44, TEAMS[q.team].c, 10);
          ctx.restore();
        }
      }
      function pix(fn) {
        lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, low.width, low.height); lctx.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0); lctx.imageSmoothingEnabled = false;
        ctx = lctx; try { fn(); } finally { ctx = mctx; }
        mctx.imageSmoothingEnabled = false; mctx.drawImage(low, 0, 0, low.width * PX, low.height * PX); mctx.imageSmoothingEnabled = true;
      }
      function dim(a = .45) { ctx.fillStyle = `rgba(29,27,38,${a})`; ctx.fillRect(0, 0, CW, CH); }
      function logo(cx, cy, size) {
        const f = size * .66;
        [['BASKET', ['#ffffff', '#c3d2e4', '#6d84a6'], -f * .52], ['RANDOM', ['#fff27a', '#ffc21f', '#f07a12'], f * .52]].forEach(([word, st, dy], i) => {
          ctx.font = `900 ${f}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'miter';
          const y = cy + dy + Math.sin(clock * 3 + i) * f * .03, gr = ctx.createLinearGradient(0, y - f * .4, 0, y + f * .4);
          st.forEach((c, j) => gr.addColorStop(j / 2, c));
          ctx.lineWidth = f * .24; ctx.strokeStyle = OUT; ctx.strokeText(word, cx, y + f * .12); ctx.strokeText(word, cx, y);
          ctx.fillStyle = gr; ctx.fillText(word, cx, y);
        });
      }
      function drawTitle() {
        dim(.28);
        pix(() => logo(CW / 2, PORT ? 215 : 112, PORT ? 112 : 108));
        const B = PORT ? [[CW / 2, 420, 600, 104], [CW / 2, 544, 600, 104]] : [[320, 270, 280, 90], [640, 270, 280, 90]];
        const defs = [['VS CPU', '#ff8a1f', '#c45a00'], ['ONLINE', '#2fbf71', '#1d8a4f']];
        defs.forEach(([l, c, d], i) => button(B[i][0] - B[i][2] / 2, B[i][1] - B[i][3] / 2, B[i][2], B[i][3], l, c, d, () => start(MODES[i]), mode === MODES[i]));
        const dy = PORT ? 660 : 380, cw = PORT ? 190 : 132, chh = PORT ? 62 : 46;
        chunky('CPU', CW / 2 - cw * 2.05, dy, PORT ? 34 : 24, '#ffffff', 6);
        CFG.ai.forEach((a, i) => {
          const x = CW / 2 + (i - 1) * (cw + 12) - cw / 2, y = dy - chh / 2, on = i === diff;
          btns.push({ x, y, w: cw, h: chh, act: () => { diff = i; persist(); } });
          rrect(x, y, cw, chh, chh / 2, on ? '#ffd23f' : 'rgba(255,255,255,.88)', OUT, 3.5);
          ctx.font = `900 ${PORT ? 28 : 20}px ${FONT}`; ctx.fillStyle = OUT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.name, x + cw / 2, y + chh / 2 + 1);
        });
        const hy = PORT ? 740 : 452, fs = PORT ? 22 : 18;
        const hint = (t, y) => { ctx.font = `900 ${fs}px ${FONT}`; const w = ctx.measureText(t).width + 36; rrect(CW / 2 - w / 2, y - fs * .9, w, fs * 1.8, fs * .9, 'rgba(29,27,38,.72)'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, CW / 2, y); };
        hint(PORT ? 'JUMP: HOLD TO JUMP + RAISE ARMS  ·  BACK: GO BACKWARDS' : 'W / SPACE / ↑ = JUMP + ARMS UP   ·   HOLD S / ↓ = GO BACK', hy);
        hint('YOU CONTROL BOTH PLAYERS  ·  RELEASE WITH BALL = SHOOT', hy + (PORT ? 56 : 44));
      }
      function drawPause() {
        dim(.5); chunky('PAUSED', CW / 2, CH / 2 - 110, 80, '#ffffff', 14);
        button(CW / 2 - 150, CH / 2 - 30, 300, 84, 'RESUME', '#2fbf71', '#1d8a4f', () => { screen = 'game'; });
        button(CW / 2 - 150, CH / 2 + 80, 300, 84, 'MENU', '#ff8a1f', '#c45a00', toTitle);
      }
      function drawOver() {
        dim(clamp(overT * 1.2, 0, .5));
        if (overT < .5) return;
        const me = online ? myTeam() : 0, cy = CH / 2;
        const title = online ? (winner === me ? 'YOU WIN!' : 'FRIEND WINS!') : (winner === 0 ? 'YOU WIN!' : 'CPU WINS!');
        const s = Math.min(1, (overT - .5) * 5);
        ctx.save(); ctx.translate(CW / 2, cy - 150); ctx.scale(s, s); chunky(title, 0, 0, 84, winner === 0 ? TEAMS[0].l : TEAMS[1].l, 15); ctx.restore();
        const tl = mirror ? 1 : 0;
        chunky(score[tl] + '  -  ' + score[1 - tl], CW / 2, cy - 60, 64, '#ffffff', 12);
        if (mode === 'cpu') chunky((newBest ? 'NEW BEST!  ' : '') + overPts + ' PTS  ·  ' + CFG.ai[diff].name, CW / 2, cy + 2, 30, newBest ? '#ffd23f' : '#ffffff', 7);
        if (online) {
          if (meRe) chunky('WAITING FOR YOUR FRIEND…', CW / 2, cy + 2, 28, '#ffffff', 6);
          else if (peerRe) chunky('YOUR FRIEND WANTS A REMATCH', CW / 2, cy + 2, 28, '#ffd23f', 6);
          if (!meRe) button(CW / 2 - 310, cy + 50, 300, 86, 'REMATCH', '#2fbf71', '#1d8a4f', rematch);
          button(meRe ? CW / 2 - 150 : CW / 2 + 10, cy + 50, 300, 86, 'LEAVE', '#ff8a1f', '#c45a00', toTitle);
        } else {
          button(CW / 2 - 310, cy + 50, 300, 86, 'PLAY AGAIN', '#2fbf71', '#1d8a4f', newMatch);
          button(CW / 2 + 10, cy + 50, 300, 86, 'MENU', '#ff8a1f', '#c45a00', toTitle);
        }
      }
      function drawMsg(title, sub, act) {
        dim(.55); chunky(title, CW / 2, CH / 2 - 70, 64, '#ffffff', 12);
        if (sub) { ctx.font = `900 26px ${FONT}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(sub, CW / 2, CH / 2 - 10); }
        if (act) button(CW / 2 - 150, CH / 2 + 30, 300, 84, 'MENU', '#ff8a1f', '#c45a00', act);
      }
      function draw(dt) {
        btns = [];
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (PORT) { ctx.fillStyle = '#2b2a3d'; ctx.fillRect(0, 0, CW, CH); ctx.drawImage(bgc, 0, 0, bgc.width, 2, 0, 0, CW, OY); }
        pix(drawWorld);
        drawWipe();
        if (screen === 'title' || screen === 'lobby') { drawTitle(); if (screen === 'lobby') dim(.2); return; }
        pix(() => { drawPopups(dt); drawScore(); });
        drawPads();
        if (screen === 'game' && !online) {
          const r = pauseRect(); rrect(r.x, r.y, r.w, r.h, 16, 'rgba(255,255,255,.92)', OUT, 3);
          ctx.fillStyle = OUT; ctx.fillRect(r.x + 16, r.y + 14, 7, 24); ctx.fillRect(r.x + 29, r.y + 14, 7, 24);
        }
        if (online) { ctx.font = `900 18px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = net.rtt > 200 ? '#ff6b6b' : '#ffffff'; ctx.strokeStyle = OUT; ctx.lineWidth = 4; const t = (net.rtt || 0) + ' ms'; ctx.strokeText(t, CW - 16, PORT ? 20 : 14); ctx.fillText(t, CW - 16, PORT ? 20 : 14); }
        if (screen === 'game' && roundK > 0 && phase === 'live' && rt > 2.4 && rt < 7 && score[0] + score[1] === 0 && !PORT) {
          const t = 'HOLD W TO JUMP + RAISE ARMS   ·   HOLD S TO GO BACK   ·   RELEASE WITH THE BALL TO SHOOT';
          ctx.globalAlpha = clamp((7 - rt), 0, 1); ctx.font = `900 18px ${FONT}`; const w = ctx.measureText(t).width + 30;
          rrect(CW / 2 - w / 2, OY + 506, w, 28, 14, 'rgba(29,27,38,.7)'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, CW / 2, OY + 520); ctx.globalAlpha = 1;
        }
        if (screen === 'pause') drawPause();
        else if (screen === 'over') drawOver();
        else if (screen === 'left') drawMsg('YOUR FRIEND LEFT', 'The connection to your friend was lost.', toTitle);
        else if (screen === 'netwait') drawMsg('GET READY…', online === 'host' ? 'Your friend joined!' : 'Connected to your friend', null);
      }


      api.loop(dt => {
        clock += dt;
        if (shake > 0) shake = Math.max(0, shake - dt);
        if (cheerT > 0) cheerT -= dt;
        for (const t of [0, 1]) if (bump[t] > 0) bump[t] = Math.max(0, bump[t] - dt * 3);
        for (const p of players) { if (p.happy > 0) p.happy -= dt; if (p.sad > 0) p.sad -= dt; }
        if (screen === 'over') overT += dt;
        if (online === 'guest') guestFrame();
        else if (screen !== 'pause' && screen !== 'left' && !(screen === 'netwait' && online === 'host')) simFrame(dt);
        updateNets(dt);
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i]; q.life -= dt;
          if (q.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
          if (q.kind === 0) { q.vy += 520 * dt; q.vx *= 1 - 1.2 * dt; q.vy *= 1 - .9 * dt; q.rot += q.vr * dt; } else { q.vx *= 1 - 3 * dt; q.vy *= 1 - 3 * dt; }
          q.x += q.vx * dt; q.y += q.vy * dt;
        }
        draw(dt);
      });

      Object.defineProperty(root, '__hf', { configurable: true, value: {
        get state() { return { screen, phase, mode, diff, online, score: score.slice(), roundK, winner, cfg, players: players.length, ball: ball && { x: ball.x, y: ball.y, held: ball.holder ? players.indexOf(ball.holder) : -1 }, btn: btn.slice(), rt, pt }; },
        pos() { return players.map(p => [Math.round(p.head.x), Math.round(p.head.y), Math.round(p.foot.x), Math.round(p.foot.y)]); },
        start, toTitle, force(t) { if (screen === 'game' && phase === 'live' && online !== 'guest') { const Hh = hoops[t === 0 ? 1 : 0]; ball.holder = null; ball.thrown = null; ball.x = (Hh.xb + Hh.xf) / 2; ball.y = Hh.y - 30; ball.vx = 0; ball.vy = 200; } }
      } });

      if (invited) { mode = 'net'; persist(); newAttract(); goOnline(); }
      else newAttract();
      return { destroy() { try { if (ac) ac.close(); } catch (e) {} ac = null; } };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hfl-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#f6c98a"/></linearGradient><linearGradient id="hfl-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b468"/><stop offset="1" stop-color="#d98a43"/></linearGradient><radialGradient id="hfl-b" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffb35e"/><stop offset="1" stop-color="#e2611a"/></radialGradient></defs><rect width="400" height="300" fill="url(#hfl-w)"/><g fill="#4c5ca8"><rect y="80" width="400" height="44"/><rect y="124" width="400" height="44" fill="#43529a"/><rect y="168" width="400" height="40"/></g><g fill="#ffd23f" opacity=".9"><circle cx="20" cy="102" r="7"/><circle cx="74" cy="98" r="7" fill="#ff6b6b"/><circle cx="128" cy="102" r="7" fill="#4ecdc4"/><circle cx="182" cy="98" r="7"/><circle cx="236" cy="102" r="7" fill="#fff"/><circle cx="290" cy="98" r="7" fill="#a29bfe"/><circle cx="344" cy="102" r="7" fill="#ff6b6b"/><circle cx="46" cy="146" r="7" fill="#fff"/><circle cx="100" cy="142" r="7" fill="#3b7cf4"/><circle cx="154" cy="146" r="7" fill="#ff9f43"/><circle cx="208" cy="142" r="7" fill="#4ecdc4"/><circle cx="262" cy="146" r="7"/><circle cx="316" cy="142" r="7" fill="#f04848"/><circle cx="370" cy="146" r="7" fill="#fff"/><circle cx="20" cy="190" r="7" fill="#a29bfe"/><circle cx="128" cy="190" r="7" fill="#ffd23f"/><circle cx="236" cy="190" r="7" fill="#ff6b6b"/><circle cx="344" cy="190" r="7" fill="#4ecdc4"/></g><g stroke="#1d1b26" stroke-width="3"><path d="M10 40l20 0-10 22z" fill="#f04848"/><path d="M60 40l20 0-10 22z" fill="#3b7cf4"/><path d="M110 40l20 0-10 22z" fill="#f04848"/><path d="M160 40l20 0-10 22z" fill="#3b7cf4"/><path d="M210 40l20 0-10 22z" fill="#f04848"/></g><rect y="208" width="400" height="92" fill="url(#hfl-f)"/><path d="M0 222h400" stroke="#fff" stroke-opacity=".25" stroke-width="6"/><ellipse cx="170" cy="262" rx="70" ry="16" fill="none" stroke="#fff" stroke-width="4" opacity=".85"/><path d="M374 250V96h-34" fill="none" stroke="#1d1b26" stroke-width="14" stroke-linejoin="round"/><path d="M374 250V96h-34" fill="none" stroke="#8f98b3" stroke-width="7" stroke-linejoin="round"/><path d="M338 46l22 10v86l-22-10z" fill="#fff" stroke="#1d1b26" stroke-width="4" stroke-linejoin="round"/><path d="M342 108l12 5v20l-12-5z" fill="none" stroke="#f04848" stroke-width="3"/><path d="M262 132l12 40h40l12-40" fill="none" stroke="#1d1b26" stroke-opacity=".35" stroke-width="6"/><path d="M262 132l12 40h40l12-40M274 172l26-40 14 40M314 172l-26-40-14 40" fill="none" stroke="#fff" stroke-width="3.5"/><ellipse cx="295" cy="132" rx="38" ry="7" fill="none" stroke="#1d1b26" stroke-width="9"/><ellipse cx="295" cy="132" rx="38" ry="7" fill="none" stroke="#ff6a1a" stroke-width="5"/><path d="M150 100q70-80 136 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14" opacity=".9"/><ellipse cx="128" cy="276" rx="34" ry="6" fill="#1d1b26" opacity=".18"/><ellipse cx="276" cy="272" rx="30" ry="6" fill="#1d1b26" opacity=".18"/><g stroke-linecap="round" stroke-linejoin="round"><path d="M112 226l-16 40M118 226l2 44" stroke="#1d1b26" stroke-width="22"/><path d="M112 226l-16 40M118 226l2 44" stroke="#e8b48a" stroke-width="15"/><path d="M112 226l-6 16M118 226l1 17" stroke="#b8253a" stroke-width="19"/><path d="M134 158l-18 70" stroke="#1d1b26" stroke-width="40"/><path d="M134 158l-18 70" stroke="#f04848" stroke-width="33"/><ellipse cx="98" cy="270" rx="15" ry="8" fill="#fff" stroke="#1d1b26" stroke-width="3"/><ellipse cx="125" cy="274" rx="15" ry="8" fill="#fff" stroke="#1d1b26" stroke-width="3"/><circle cx="142" cy="132" r="26" fill="#e8b48a" stroke="#1d1b26" stroke-width="4"/><path d="M118 126q4-26 30-24 20 2 20 18-16-12-50 6z" fill="#2a1b14" stroke="#1d1b26" stroke-width="3"/><circle cx="150" cy="130" r="6" fill="#fff" stroke="#1d1b26" stroke-width="2.5"/><circle cx="163" cy="129" r="6" fill="#fff" stroke="#1d1b26" stroke-width="2.5"/><circle cx="152" cy="128" r="3" fill="#1d1b26"/><circle cx="165" cy="127" r="3" fill="#1d1b26"/><circle cx="158" cy="146" r="5" fill="#7a1f2b" stroke="#1d1b26" stroke-width="2.5"/><path d="M134 160l14-62" stroke="#1d1b26" stroke-width="18"/><path d="M134 160l14-62" stroke="#e8b48a" stroke-width="12"/><path d="M134 160l4-16" stroke="#f04848" stroke-width="15"/><circle cx="148" cy="96" r="9" fill="#e8b48a" stroke="#1d1b26" stroke-width="3"/><g transform="translate(40 4)"><path d="M232 214l20 46M226 216l-4 46" stroke="#1d1b26" stroke-width="22"/><path d="M232 214l20 46M226 216l-4 46" stroke="#9a643f" stroke-width="15"/><path d="M232 214l7 16M226 216l-2 17" stroke="#2453c2" stroke-width="19"/><path d="M216 150l14 66" stroke="#1d1b26" stroke-width="40"/><path d="M216 150l14 66" stroke="#3b7cf4" stroke-width="33"/><ellipse cx="256" cy="264" rx="15" ry="8" fill="#fff" stroke="#1d1b26" stroke-width="3"/><ellipse cx="220" cy="266" rx="15" ry="8" fill="#fff" stroke="#1d1b26" stroke-width="3"/><circle cx="208" cy="124" r="26" fill="#9a643f" stroke="#1d1b26" stroke-width="4"/><path d="M184 112q24-14 48 0" stroke="#1d1b26" stroke-width="12" fill="none"/><path d="M184 112q24-14 48 0" stroke="#3b7cf4" stroke-width="7" fill="none"/><circle cx="196" cy="122" r="6" fill="#fff" stroke="#1d1b26" stroke-width="2.5"/><circle cx="184" cy="123" r="6" fill="#fff" stroke="#1d1b26" stroke-width="2.5"/><circle cx="193" cy="120" r="3" fill="#1d1b26"/><circle cx="181" cy="121" r="3" fill="#1d1b26"/><path d="M182 138q8-6 16 0" stroke="#1d1b26" stroke-width="3" fill="none"/><path d="M216 152l-30-50" stroke="#1d1b26" stroke-width="18"/><path d="M216 152l-30-50" stroke="#9a643f" stroke-width="12"/><path d="M216 152l-9-14" stroke="#3b7cf4" stroke-width="15"/><circle cx="185" cy="100" r="9" fill="#9a643f" stroke="#1d1b26" stroke-width="3"/></g></g><circle cx="150" cy="76" r="17" fill="url(#hfl-b)" stroke="#1d1b26" stroke-width="3.5"/><path d="M133 76h34M150 59v34M138 64q8 12 0 24M162 64q-8 12 0 24" fill="none" stroke="#4a200c" stroke-width="2.2"/><ellipse cx="144" cy="69" rx="5" ry="3" fill="#fff" opacity=".5"/><path d="M120 58l-8-6M128 50l-4-9M106 72l-10-1" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;
})();

