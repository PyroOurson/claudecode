
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
      { k: 'ice', name: 'ICE RINK', fric: .012, bounce: .92, roll: .04 },
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
      const cv = api.canvas(CW, CH), canvas = cv.canvas, ctx = cv.ctx, dpr = canvas.width / CW;
      const bgc = document.createElement('canvas'); bgc.width = Math.round(W * dpr); bgc.height = Math.round(H * dpr);
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
          popups.push({ text: KIND[kind] || 'NICE!', sub: '+' + pts, x: clamp(cx, 190, W - 190), y: Hh.y - 70, t: 0, team });
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
        cfg = c; GRAV = CFG.G * (c.lg ? .58 : 1); court = CFG.courts[c.court] || CFG.courts[0]; BT = CFG.balls[c.ball] || CFG.balls[0];
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
        const g = bg; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
        const R = seeded(11 + CFG.courts.indexOf(court) * 31), k = court.k;
        const lg = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s)); return gr; };
        const rr = (x, y, w, hh, r, f, s) => { g.beginPath(); g.roundRect(x, y, w, hh, r); g.fillStyle = f; g.fill(); if (s) { g.strokeStyle = s; g.lineWidth = 3; g.stroke(); } };
        crowd = [];
        if (k === 'gym') {
          g.fillStyle = lg(0, 160, ['#fff0d6', '#f7d9aa']); g.fillRect(0, 0, W, 160);
          for (let i = 0; i < 4; i++) { const x = 150 + i * 220; const gr = g.createRadialGradient(x, 18, 2, x, 18, 70); gr.addColorStop(0, 'rgba(255,255,240,.95)'); gr.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = gr; g.fillRect(x - 70, 0, 140, 90); rr(x - 26, 8, 52, 12, 6, '#fffef2', OUT); }
          g.strokeStyle = '#8a6a4a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 70); for (let x = 0; x <= W; x += 60) g.quadraticCurveTo(x + 30, 80, x + 60, 70); g.stroke();
          for (let x = 10, i = 0; x < W; x += 60, i++) { g.beginPath(); g.moveTo(x + 8, 72); g.lineTo(x + 38, 72); g.lineTo(x + 23, 104); g.closePath(); g.fillStyle = i % 2 ? TEAMS[1].c : TEAMS[0].c; g.fill(); g.strokeStyle = OUT; g.lineWidth = 2; g.stroke(); }
          for (let r = 0; r < 4; r++) { const y = 150 + r * 62; g.fillStyle = r % 2 ? '#43529a' : '#4c5ca8'; g.fillRect(0, y, W, 62); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, y, W, 5); }
          for (let r = 0; r < 4; r++) for (let x = 14 + (r % 2) * 18; x < W; x += 36) if (R() < .86) crowd.push({ x: x + R() * 8, y: 200 + r * 62, c: ['#ff6b6b', '#ffd23f', '#4ecdc4', '#ffffff', '#ff9f43', '#a29bfe', '#3b7cf4', '#f04848'][R() * 8 | 0], s: SKIN[R() * 5 | 0], ph: R() * 6 });
          g.fillStyle = '#2b2f55'; g.fillRect(0, 398, W, 42);
          const ad = ['#ff7a1a', '#2fbf71', '#3b7cf4', '#ffcc2e', '#e84393'];
          for (let i = 0; i < 8; i++) { const x = 6 + i * 120; rr(x, 403, 112, 32, 8, ad[i % 5], OUT); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x + 22, 419, 9, 0, TAU); g.fill(); rr(x + 38, 413, 60, 6, 3, 'rgba(255,255,255,.85)'); rr(x + 38, 423, 40, 5, 3, 'rgba(255,255,255,.6)'); }
          g.fillStyle = lg(FB, H, ['#f2b66e', '#dc9049']); g.fillRect(0, FB, W, H - FB);
          for (let i = -2; i < 30; i++) { const x = i * 40; g.strokeStyle = i % 2 ? 'rgba(120,60,20,.14)' : 'rgba(255,240,210,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(480 + (x - 480) * .86, FB); g.lineTo(x, H); g.stroke(); }
          g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(0, FB + 6, W, 10);
          for (let r = 1; r < 6; r++) { const y = FB + (H - FB) * (r / 6) ** 1.4; g.strokeStyle = 'rgba(120,60,20,.12)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
          const sg = g.createLinearGradient(0, FB, 0, FB + 60); sg.addColorStop(0, 'rgba(255,255,255,.2)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(0, FB, W, 60);
          for (let i = 0; i < 4; i++) { const x = 150 + i * 220, gg = g.createRadialGradient(x, FB + 40, 2, x, FB + 40, 90); gg.addColorStop(0, 'rgba(255,255,240,.22)'); gg.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = gg; g.fillRect(x - 90, FB, 180, 100); }
        } else if (k === 'beach') {
          g.fillStyle = lg(0, 340, ['#3fb2f2', '#8fd6ff', '#cff0ff']); g.fillRect(0, 0, W, 340);
          let gr = g.createRadialGradient(820, 92, 10, 820, 92, 120); gr.addColorStop(0, 'rgba(255,248,200,.9)'); gr.addColorStop(1, 'rgba(255,248,200,0)'); g.fillStyle = gr; g.fillRect(680, 0, 280, 230);
          g.fillStyle = '#fff2a6'; g.beginPath(); g.arc(820, 92, 44, 0, TAU); g.fill(); g.strokeStyle = '#ffd94a'; g.lineWidth = 4; g.stroke();
          for (const [cx, cy, s] of [[180, 80, 1], [430, 130, .8], [620, 60, .7]]) { g.fillStyle = 'rgba(255,255,255,.95)'; for (const [dx, dy, r] of [[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [52, 10, 20]]) { g.beginPath(); g.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU); g.fill(); } }
          g.fillStyle = lg(330, 412, ['#2aa6dc', '#1683bd']); g.fillRect(0, 330, W, 82);
          g.fillStyle = '#4caf5f'; g.beginPath(); g.ellipse(170, 334, 90, 18, 0, Math.PI, TAU); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.lineCap = 'round';
          for (let i = 0; i < 26; i++) { const x = R() * W, y = 345 + R() * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14 + R() * 18, y); g.stroke(); }
          g.fillStyle = lg(400, H, ['#fbe6ab', '#f2cd85', '#e9bb6b']); g.beginPath(); g.moveTo(0, 412); for (let x = 0; x <= W; x += 40) g.quadraticCurveTo(x + 20, 404 + (x % 80 ? 4 : -4), x + 40, 410); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
          g.fillStyle = 'rgba(190,140,70,.18)'; for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(R() * W, FB - 20 + R() * 120, 1.5 + R() * 1.5, 0, TAU); g.fill(); }
          for (const px of [270, 700]) {
            g.strokeStyle = OUT; g.lineWidth = 18; g.beginPath(); g.moveTo(px, 420); g.quadraticCurveTo(px - 20, 330, px + 18, 250); g.stroke();
            g.strokeStyle = '#a7743f'; g.lineWidth = 12; g.stroke();
            for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .55; g.fillStyle = i % 2 ? '#2f9e4a' : '#45b85a'; g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 18, 250); g.quadraticCurveTo(px + 18 + Math.cos(a) * 50, 250 + Math.sin(a) * 50 - 20, px + 18 + Math.cos(a) * 92, 250 + Math.sin(a) * 60 + 24); g.quadraticCurveTo(px + 18 + Math.cos(a) * 40, 250 + Math.sin(a) * 30, px + 18, 250); g.fill(); g.stroke(); }
            g.fillStyle = '#7a4f24'; for (const d of [-8, 8]) { g.beginPath(); g.arc(px + 18 + d, 258, 7, 0, TAU); g.fill(); }
          }
          g.fillStyle = OUT; g.fillRect(538, 330, 5, 100);
          for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(540, 322); g.arc(540, 330, 52, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); g.closePath(); g.fillStyle = i % 2 ? '#ffffff' : '#f04848'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 2.5; g.stroke(); }
        } else if (k === 'ice') {
          g.fillStyle = lg(0, 420, ['#86c3f0', '#c4e6ff', '#eef9ff']); g.fillRect(0, 0, W, 420);
          const mtn = (pts, f, cap) => { g.fillStyle = f; g.beginPath(); g.moveTo(0, 420); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(W, 420); g.closePath(); g.fill(); g.strokeStyle = 'rgba(29,27,38,.25)'; g.lineWidth = 2; g.stroke(); if (cap) for (const [x, y] of pts) if (y < 260) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 30, y + 40); g.lineTo(x - 10, y + 32); g.lineTo(x + 4, y + 44); g.lineTo(x + 30, y + 40); g.closePath(); g.fill(); } };
          mtn([[0, 300], [120, 190], [260, 280], [400, 150], [560, 270], [700, 170], [860, 260], [W, 210]], '#b9d3ec', true);
          mtn([[0, 360], [160, 290], [320, 350], [500, 280], [680, 350], [840, 300], [W, 340]], '#9dbcdb', false);
          for (let i = 0; i < 14; i++) { const x = 20 + i * 70 + R() * 30, s = .7 + R() * .5; for (let j = 0; j < 3; j++) { g.fillStyle = '#2f6f5b'; g.beginPath(); g.moveTo(x, 360 - (j * 18 + 30) * s); g.lineTo(x - (26 - j * 6) * s, 410 - j * 18 * s); g.lineTo(x + (26 - j * 6) * s, 410 - j * 18 * s); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, 360 - (j * 18 + 30) * s); g.lineTo(x - 8 * s, 372 - (j * 18 + 30) * s + 10); g.lineTo(x + 8 * s, 372 - (j * 18 + 30) * s + 10); g.closePath(); g.fill(); } }
          g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, 445); for (let x = 0; x <= W; x += 60) g.quadraticCurveTo(x + 30, 408 + R() * 10, x + 60, 432); g.lineTo(W, 445); g.closePath(); g.fill();
          g.fillStyle = lg(FB, H, ['#e8f9ff', '#bfe6f7', '#a3d7ee']); g.fillRect(0, FB, W, H - FB);
          g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { const x = R() * W; g.beginPath(); g.moveTo(x, FB + 10); g.lineTo(x - 40, H - 6); g.stroke(); }
          g.strokeStyle = 'rgba(120,170,200,.35)'; g.lineWidth = 2; for (let i = 0; i < 10; i++) { const x = R() * W, y = FB + 20 + R() * 70; g.beginPath(); g.ellipse(x, y, 60 + R() * 60, 8, 0, 0, Math.PI); g.stroke(); }
        } else if (k === 'street') {
          g.fillStyle = lg(0, 300, ['#5fb8ff', '#a9dcff', '#e3f4ff']); g.fillRect(0, 0, W, 300);
          for (let i = 0; i < 9; i++) { const x = i * 112 - 20, hh = 140 + R() * 120; g.fillStyle = i % 2 ? '#b9c7d8' : '#a6b5c9'; g.fillRect(x, 300 - hh, 100, hh); g.fillStyle = 'rgba(255,255,255,.55)'; for (let wy = 300 - hh + 14; wy < 290; wy += 22) for (let wx = x + 10; wx < x + 90; wx += 18) if (R() < .7) g.fillRect(wx, wy, 9, 12); }
          g.fillStyle = '#b5523b'; g.fillRect(0, 230, W, 210);
          for (let r = 0; r < 11; r++) for (let c2 = 0; c2 < 26; c2++) { const x = c2 * 40 - (r % 2) * 20, y = 230 + r * 19; g.fillStyle = (r * 7 + c2 * 3) % 5 ? '#c0603f' : '#a8492f'; g.fillRect(x + 1, y + 1, 38, 17); }
          const tags = [['#ff4fa3', 'HOOP'], ['#3fe0c5', 'DUNK'], ['#ffd23f', 'B-BALL'], ['#7c5cff', 'SWISH']];
          tags.forEach(([c3, t], i) => { const x = 120 + i * 220, y = 330 + (i % 2) * 24; g.save(); g.translate(x, y); g.rotate(-.08 + (i % 2) * .12); g.font = `900 44px ${FONT}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = OUT; g.strokeText(t, 0, 0); g.fillStyle = c3; g.fillText(t, 0, 0); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.6)'; g.strokeText(t, -2, -3); g.restore(); });
          g.strokeStyle = 'rgba(60,70,80,.55)'; g.lineWidth = 2;
          for (let x = -200; x < W + 200; x += 22) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x + 140, 440); g.moveTo(x + 140, 300); g.lineTo(x, 440); g.stroke(); }
          g.fillStyle = '#5d6672'; g.fillRect(0, 296, W, 6); for (let x = 30; x < W; x += 180) g.fillRect(x, 296, 7, 144);
          g.fillStyle = lg(FB, H, ['#5d6168', '#43464d']); g.fillRect(0, FB, W, H - FB);
          g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 160; i++) g.fillRect(R() * W, FB + R() * (H - FB), 2 + R() * 3, 2);
          g.strokeStyle = 'rgba(20,20,25,.35)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { const x = R() * W; g.beginPath(); g.moveTo(x, FB + 8); g.lineTo(x + 30 + R() * 40, FB + 30 + R() * 40); g.lineTo(x + 50, H); g.stroke(); }
        } else {
          g.fillStyle = lg(0, 410, ['#271f5e', '#5b3485', '#c75a86', '#ff9a6a', '#ffcf86']); g.fillRect(0, 0, W, 410);
          g.fillStyle = '#ffffff'; for (let i = 0; i < 50; i++) { g.globalAlpha = .4 + R() * .6; g.fillRect(R() * W, R() * 150, 2, 2); } g.globalAlpha = 1;
          g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(150, 80, 26, 0, TAU); g.fill(); g.fillStyle = '#5b3485'; g.beginPath(); g.arc(162, 72, 24, 0, TAU); g.fill();
          for (let layer = 0; layer < 2; layer++) {
            let x = -10;
            while (x < W) {
              const w = 50 + R() * 70, hh = (layer ? 90 : 150) + R() * (layer ? 120 : 140), y = 410 - hh;
              g.fillStyle = layer ? '#2a2152' : '#463a7c'; g.fillRect(x, y, w, hh);
              if (layer) { g.fillStyle = '#ffd36b'; for (let wy = y + 12; wy < 400; wy += 20) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (R() < .4) g.fillRect(wx, wy, 8, 10); }
              x += w + (layer ? 6 : 14);
            }
          }
          g.fillStyle = '#3a2f55'; g.fillRect(744, 290, 6, 120); g.fillRect(790, 290, 6, 120); rr(732, 230, 76, 66, 10, '#4a3a68', OUT); g.beginPath(); g.moveTo(726, 232); g.lineTo(770, 200); g.lineTo(814, 232); g.closePath(); g.fillStyle = '#3a2f55'; g.fill(); g.strokeStyle = OUT; g.stroke();
          g.fillStyle = '#a49ab5'; g.fillRect(0, 400, W, 40); g.fillStyle = '#c3bad3'; g.fillRect(0, 398, W, 8);
          g.strokeStyle = 'rgba(29,27,38,.25)'; g.lineWidth = 2; for (let x = 0; x < W; x += 80) { g.beginPath(); g.moveTo(x, 406); g.lineTo(x, 440); g.stroke(); }
          rr(120, 352, 90, 50, 6, '#8d8aa3', OUT); g.strokeStyle = '#6d6a84'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(132 + i * 18, 362); g.lineTo(132 + i * 18, 392); g.stroke(); }
          g.fillStyle = lg(FB, H, ['#83819a', '#66647c']); g.fillRect(0, FB, W, H - FB);
          g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) g.fillRect(R() * W, FB + R() * 100, 30 + R() * 40, 3);
          g.fillStyle = 'rgba(80,140,255,.18)'; g.beginPath(); g.ellipse(620, 512, 70, 10, 0, 0, TAU); g.fill();
        }
        const lc = k === 'ice' ? 'rgba(230,60,80,.75)' : k === 'beach' ? 'rgba(40,120,220,.7)' : 'rgba(255,255,255,.85)';
        g.strokeStyle = lc; g.lineWidth = 4; g.lineCap = 'round';
        if (k === 'beach') g.setLineDash([14, 12]);
        g.beginPath(); g.moveTo(480, FB + 4); g.lineTo(480, H - 4); g.stroke();
        g.beginPath(); g.ellipse(480, 496, 76, 20, 0, 0, TAU); g.stroke();
        for (const s of [1, -1]) {
          const x0 = s > 0 ? 0 : W;
          g.beginPath(); g.ellipse(x0 + s * 80, 494, 340, 44, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke();
          g.save(); g.setLineDash([]); g.fillStyle = k === 'gym' ? 'rgba(200,70,40,.22)' : 'rgba(255,255,255,.12)';
          g.beginPath(); g.moveTo(x0, FB + 8); g.lineTo(x0 + s * 200, FB + 8); g.lineTo(x0 + s * 225, H - 2); g.lineTo(x0, H - 2); g.closePath(); g.fill(); g.stroke(); g.restore();
        }
        g.setLineDash([]);
        g.fillStyle = 'rgba(29,27,38,.18)'; g.fillRect(0, H - 6, W, 6);
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
        const s = Hh.s, px = Hh.bx - s * 30, top = Hh.y - CFG.BOARD_UP, bot = Hh.y + CFG.BOARD_DN;
        rrect(px - 18, FLOOR - 24, 36, 34, 8, '#3a3f5c', OUT, 3);
        line(px, FLOOR - 12, px, Hh.y - 30, 15, OUT); line(px, FLOOR - 12, px, Hh.y - 30, 9, '#8f98b3'); line(px - 2, FLOOR - 12, px - 2, Hh.y - 30, 3, 'rgba(255,255,255,.55)'); line(px + 3, FLOOR - 12, px + 3, Hh.y - 30, 2.5, 'rgba(29,27,38,.25)');
        for (const bx2 of [px - 11, px + 11]) circ(bx2, FLOOR - 4, 2.4, '#c8cedd', OUT, 1.5);
        line(px, Hh.y - 30, Hh.bx - s * 8, Hh.y - 30, 12, OUT); line(px, Hh.y - 30, Hh.bx - s * 8, Hh.y - 30, 6, '#8f98b3');
        ctx.beginPath(); ctx.moveTo(Hh.bx, top); ctx.lineTo(Hh.bx - s * 26, top + 12); ctx.lineTo(Hh.bx - s * 26, bot + 12); ctx.lineTo(Hh.bx, bot); ctx.closePath();
        const bbg = ctx.createLinearGradient(Hh.bx, top, Hh.bx - s * 26, bot); bbg.addColorStop(0, '#ffffff'); bbg.addColorStop(.6, '#eef2fb'); bbg.addColorStop(1, '#cfd8ec');
        ctx.fillStyle = bbg; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(Hh.bx - s * 3, top + 5); ctx.lineTo(Hh.bx - s * 23, top + 14); ctx.lineTo(Hh.bx - s * 23, bot + 8); ctx.lineTo(Hh.bx - s * 3, bot - 4); ctx.closePath(); ctx.strokeStyle = 'rgba(143,152,179,.55)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(Hh.bx - s * 5, top + 8); ctx.lineTo(Hh.bx - s * 10, top + 10); ctx.lineTo(Hh.bx - s * 10, top + 38); ctx.lineTo(Hh.bx - s * 5, top + 36); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(Hh.bx - s * 6, bot - 34); ctx.lineTo(Hh.bx - s * 20, bot - 28); ctx.lineTo(Hh.bx - s * 20, bot - 2); ctx.lineTo(Hh.bx - s * 6, bot - 8); ctx.closePath();
        ctx.strokeStyle = '#f04848'; ctx.lineWidth = 3; ctx.stroke();
        line(Hh.bx, top + 2, Hh.bx, bot - 2, 4, '#c8cedd');
        const cx = (Hh.xb + Hh.xf) / 2, rw = CFG.RIMW / 2;
        ctx.beginPath(); ctx.ellipse(cx, Hh.y, rw, 7, 0, Math.PI, TAU); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#d4520f'; ctx.lineWidth = 4; ctx.stroke();
      }
      function drawNet(Hh) {
        const cx = (Hh.xb + Hh.xf) / 2, rw = CFG.RIMW / 2, nh = CFG.NET_H + Hh.net * 16, bw = rw * (.56 + Hh.net * .12), sw = Hh.netX, N = 6;
        const tx = i => cx - rw + i * 2 * rw / N, ty = i => Hh.y + Math.sin(i / N * Math.PI) * 6, bx = i => cx + sw - bw + i * 2 * bw / N;
        for (const [w, c] of [[4.5, 'rgba(29,27,38,.35)'], [2.2, 'rgba(255,255,255,.96)']]) {
          ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
          for (let i = 0; i < N; i++) { ctx.moveTo(tx(i), ty(i)); ctx.lineTo(bx(i + 1), Hh.y + nh); ctx.moveTo(tx(i + 1), ty(i + 1)); ctx.lineTo(bx(i), Hh.y + nh); }
          for (let r = 1; r <= 2; r++) { const f = r / 3; ctx.moveTo(lerp(tx(0), bx(0), f), lerp(Hh.y, Hh.y + nh, f)); ctx.lineTo(lerp(tx(N), bx(N), f), lerp(Hh.y, Hh.y + nh, f)); }
          ctx.moveTo(bx(0), Hh.y + nh); ctx.lineTo(bx(N), Hh.y + nh);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.ellipse(cx, Hh.y, rw, 7, 0, 0, Math.PI); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 4.5; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,170,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, Hh.y - 1, rw - 3, 5.5, 0, Math.PI * .15, Math.PI * .6); ctx.stroke();
        ctx.fillStyle = '#ffffff'; for (let i = 0; i <= N; i++) { ctx.beginPath(); ctx.arc(tx(i), ty(i) + 1, 1.8, 0, TAU); ctx.fill(); }
        line(Hh.bx, Hh.y, Hh.xb + Hh.s * 6, Hh.y + 3, 5, '#ff6a1a');
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
      function drawHead(p) {
        const hd = p.head, nk = p.neck, r = p.HR, L = p.look, hair = HAIRC[L[2] % 6];
        const ang = Math.atan2(hd.x - nk.x, nk.y - hd.y);
        ctx.save(); ctx.translate(hd.x, hd.y); ctx.rotate(ang); if (p.dir < 0) ctx.scale(-1, 1);
        if (L[1] === 1) circ(-r * .15, -r * .25, r * 1.2, hair, OUT, 3);
        circ(0, 0, r, SKIN[L[0] % 5], OUT, 3);
        circ(-r * .32, r * .08, r * .2, SKIN[L[0] % 5], OUT, 2);
        ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.beginPath(); ctx.arc(0, 0, r - 1.5, Math.PI * .1, Math.PI * .9); ctx.arc(0, -r * .25, r * .9, Math.PI * .9, Math.PI * .1, true); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(r * .25, -r * .5, r * .22, r * .1, -.3, 0, TAU); ctx.fill();
        if (L[1] === 0) { ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 1.02, Math.PI * 1.9); ctx.quadraticCurveTo(-r * .1, -r * .45, -r * .98, -r * .1); ctx.closePath(); ctx.fillStyle = hair; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke(); }
        else if (L[1] === 2) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 1.5, 0, TAU); ctx.clip(); ctx.fillStyle = hair; ctx.fillRect(-r, -r, r * 2, r * .55); ctx.fillStyle = TEAMS[p.team].c; ctx.fillRect(-r, -r * .5, r * 2, r * .28); ctx.restore(); circ(0, 0, r, null, OUT, 3); }
        else if (L[1] === 3) { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-r * .2, -r * .55, r * .3, r * .14, -.3, 0, TAU); ctx.fill(); }
        else if (L[1] === 4) { ctx.beginPath(); ctx.moveTo(-r * .95, -r * .2); for (let i = 0; i <= 5; i++) { const a = Math.PI + .2 + i * (Math.PI - .4) / 5; ctx.lineTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35); ctx.lineTo(Math.cos(a + .2) * r * .85, Math.sin(a + .2) * r * .85); } ctx.closePath(); ctx.fillStyle = hair; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke(); }
        let lx = ball.x - hd.x, ly = ball.y - hd.y; const ll = Math.hypot(lx, ly) || 1; lx /= ll; ly /= ll;
        const c = Math.cos(-ang), s = Math.sin(-ang); let ex = lx * c - ly * s; const ey = lx * s + ly * c; if (p.dir < 0) ex = -ex;
        for (const exx of [r * .18, r * .62]) { circ(exx, -r * .12, r * .21, '#ffffff', OUT, 2); circ(exx + ex * r * .09, -r * .12 + ey * r * .09, r * .1, OUT); circ(exx + ex * r * .09 - r * .04, -r * .12 + ey * r * .09 - r * .04, r * .04, '#ffffff'); }
        ctx.fillStyle = 'rgba(255,80,80,.3)'; ctx.beginPath(); ctx.ellipse(r * .78, r * .24, r * .17, r * .1, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        { const bl = p.happy > 0 ? -r * .12 : p.sad > 0 ? r * .1 : 0; ctx.beginPath(); ctx.moveTo(r * .0, -r * .46 + bl * .5); ctx.lineTo(r * .36, -r * .5 + bl); ctx.moveTo(r * .46, -r * .5 + bl); ctx.lineTo(r * .82, -r * .44 + bl * .4); ctx.stroke(); }
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        const air = p.ground > .25 && (p.hip.y - p.hip.py) > 2;
        if (p.happy > 0) { ctx.beginPath(); ctx.moveTo(r * .15, r * .32); ctx.quadraticCurveTo(r * .45, r * .78, r * .78, r * .3); ctx.closePath(); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.stroke(); }
        else if (p.sad > 0) { ctx.beginPath(); ctx.moveTo(r * .2, r * .55); ctx.quadraticCurveTo(r * .45, r * .3, r * .72, r * .55); ctx.stroke(); }
        else if (air) circ(r * .45, r * .45, r * .14, '#7a1f2b', OUT, 2);
        else { ctx.beginPath(); ctx.moveTo(r * .22, r * .4); ctx.quadraticCurveTo(r * .45, r * .58, r * .7, r * .38); ctx.stroke(); }
        ctx.restore();
      }
      function drawPlayer(p, held) {
        const T = TEAMS[p.team], L = p.look, skin = SKIN[L[0] % 5], { neck: nk, hip: hp, foot: ft, hand: hn } = p, s = p.s;
        let lx = ft.x - hp.x, ly = ft.y - hp.y; const ll = Math.hypot(lx, ly) || 1; lx /= ll; ly /= ll;
        const spread = (p.ground < .1 ? 4 : 10) * s, pxv = -ly * spread, pyv = lx * spread;
        const fB = [ft.x - pxv * p.dir, ft.y - pyv * p.dir], fF = [ft.x + pxv * p.dir, ft.y + pyv * p.dir];
        const lw = p.LR * 1.7, tw = p.TR * 2.1;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        line(hp.x, hp.y, fB[0], fB[1], lw + 6, OUT); line(hp.x, hp.y, fF[0], fF[1], lw + 6, OUT); line(nk.x, nk.y, hp.x, hp.y, tw + 6, OUT);
        for (const [f, dark] of [[fB, 1], [fF, 0]]) {
          line(hp.x, hp.y, f[0], f[1], lw, skin);
          if (dark) line(hp.x, hp.y, f[0], f[1], lw, 'rgba(0,0,0,.14)');
          line(hp.x, hp.y, lerp(hp.x, f[0], .42), lerp(hp.y, f[1], .42), lw + 4, T.d);
          line(hp.x, hp.y, lerp(hp.x, f[0], .42), lerp(hp.y, f[1], .42), 3, 'rgba(255,255,255,.55)');
          line(lerp(hp.x, f[0], .72), lerp(hp.y, f[1], .72), lerp(hp.x, f[0], .8), lerp(hp.y, f[1], .8), lw + 1, '#ffffff');
          ctx.save(); ctx.translate(f[0] + p.dir * 4 * s, f[1] + p.LR * .35); ctx.beginPath(); ctx.ellipse(0, 0, p.LR * 1.3, p.LR * .62, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = T.c; ctx.fillRect(-p.LR * .7, -p.LR * .15, p.LR * 1.2, p.LR * .3);
          ctx.fillStyle = '#9aa3bd'; ctx.beginPath(); ctx.ellipse(0, p.LR * .38, p.LR * 1.2, p.LR * .2, 0, 0, Math.PI); ctx.fill();
          ctx.strokeStyle = 'rgba(29,27,38,.55)'; ctx.lineWidth = 1.3; ctx.beginPath(); for (let q = 0; q < 3; q++) { ctx.moveTo(p.dir * p.LR * (.1 + q * .22) - 2, -p.LR * .4); ctx.lineTo(p.dir * p.LR * (.1 + q * .22) + 2, -p.LR * .1); } ctx.stroke(); ctx.restore();
        }
        line(nk.x, nk.y, hp.x, hp.y, tw, T.c);
        line(lerp(nk.x, hp.x, .12) + p.dir * tw * .26, lerp(nk.y, hp.y, .12), lerp(nk.x, hp.x, .88) + p.dir * tw * .26, lerp(nk.y, hp.y, .88), tw * .3, 'rgba(0,0,0,.14)');
        line(lerp(nk.x, hp.x, .9), lerp(nk.y, hp.y, .9), hp.x, hp.y, tw * 1.02, T.d);
        circ(lerp(nk.x, hp.x, .05), lerp(nk.y, hp.y, .05), tw * .44, T.d);
        line(lerp(nk.x, hp.x, .1) - p.dir * tw * .28, lerp(nk.y, hp.y, .1), lerp(nk.x, hp.x, .9) - p.dir * tw * .28, lerp(nk.y, hp.y, .9), tw * .22, 'rgba(255,255,255,.22)');
        const mx = lerp(nk.x, hp.x, .5), my = lerp(nk.y, hp.y, .5), ta = Math.atan2(nk.x - hp.x, hp.y - nk.y);
        ctx.save(); ctx.translate(mx, my); ctx.rotate(ta); if (mirror) ctx.scale(-1, 1);
        ctx.font = `900 ${Math.round(p.TR * 1.25)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = T.d; ctx.strokeText(String(L[3]), 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillText(String(L[3]), 0, 0);
        ctx.restore();
        drawHead(p);
        if (held) drawBall(ball);
        const aw = 11 * s;
        line(nk.x, nk.y, hn.x, hn.y, aw + 6, OUT); line(nk.x, nk.y, hn.x, hn.y, aw, skin);
        line(nk.x, nk.y, lerp(nk.x, hn.x, .22), lerp(nk.y, hn.y, .22), aw + 4, T.c);
        line(lerp(nk.x, hn.x, .74), lerp(nk.y, hn.y, .74), lerp(nk.x, hn.x, .84), lerp(nk.y, hn.y, .84), aw + 1, '#ffffff');
        line(lerp(nk.x, hn.x, .3), lerp(nk.y, hn.y, .3), lerp(nk.x, hn.x, .7), lerp(nk.y, hn.y, .7), aw * .26, 'rgba(255,255,255,.28)');
        circ(hn.x, hn.y, 7.5 * s, skin, OUT, 3);
        circ(hn.x - 2 * s, hn.y - 2.2 * s, 2 * s, 'rgba(255,255,255,.35)');
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
        ctx.drawImage(bgc, 0, 0, W, H);
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
            ctx.globalAlpha = a; ctx.font = `900 22px ${FONT}`; const w = ctx.measureText(txt).width + 44;
            rrect(cx - w / 2, y + 108, w, 38, 19, cfg.x2 ? '#ffd23f' : '#ffffff', OUT, 3);
            ctx.fillStyle = OUT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, cx, y + 128);
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
      function dim(a = .45) { ctx.fillStyle = `rgba(29,27,38,${a})`; ctx.fillRect(0, 0, CW, CH); }
      function logo(cx, cy, size) {
        const word = 'BASKET RANDOM';
        size *= 0.7;
        ctx.font = `900 ${size}px ${FONT}`; const w = ctx.measureText(word).width;
        let x = cx - w / 2;
        for (let i = 0; i < word.length; i++) {
          const ch = word[i], cw = ctx.measureText(ch).width, y = cy + Math.sin(clock * 3 + i * .7) * size * .04;
          if (ch !== ' ') {
            ctx.save(); ctx.translate(x + cw / 2, y); ctx.rotate(Math.sin(clock * 2 + i) * .04);
            const gr = ctx.createLinearGradient(0, -size * .4, 0, size * .4); gr.addColorStop(0, '#ffd23f'); gr.addColorStop(.5, '#ff8a1f'); gr.addColorStop(1, '#f0482a');
            ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
            ctx.lineWidth = size * .24; ctx.strokeStyle = OUT; ctx.strokeText(ch, 0, size * .08); ctx.strokeText(ch, 0, 0);
            ctx.fillStyle = gr; ctx.fillText(ch, 0, 0);
            ctx.restore();
          }
          x += cw;
        }
      }
      function drawTitle() {
        dim(.28);
        logo(CW / 2, PORT ? 215 : 112, PORT ? 112 : 108);
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
        drawWorld();
        drawWipe();
        if (screen === 'title' || screen === 'lobby') { drawTitle(); if (screen === 'lobby') dim(.2); return; }
        drawPopups(dt);
        drawScore();
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

