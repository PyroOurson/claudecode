(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const mmss = v => Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0');
  const mulberry = seed => {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  const shuffle = (a, rnd = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const RED = [0, 1, 1, 0];
  const RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const PIPS = [null, null,
    [[.5, .2], [.5, .8]],
    [[.5, .2], [.5, .5], [.5, .8]],
    [[.32, .2], [.68, .2], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.5, .5], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.32, .5], [.68, .5], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.5, .35], [.32, .5], [.68, .5], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.5, .35], [.32, .5], [.68, .5], [.5, .65], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.32, .4], [.68, .4], [.5, .5], [.32, .6], [.68, .6], [.32, .8], [.68, .8]],
    [[.32, .2], [.68, .2], [.5, .3], [.32, .4], [.68, .4], [.32, .6], [.68, .6], [.5, .7], [.32, .8], [.68, .8]]
  ];
  function suitPath(g, s, x, y, size, flip) {
    g.save(); g.translate(x, y); if (flip) g.rotate(Math.PI); g.scale(size, size);
    g.beginPath();
    if (s === 1) {
      g.moveTo(0, .5); g.bezierCurveTo(-.2, .32, -.5, .12, -.5, -.14);
      g.arc(-.25, -.14, .25, Math.PI, 0); g.arc(.25, -.14, .25, Math.PI, 0);
      g.bezierCurveTo(.5, .12, .2, .32, 0, .5);
    } else if (s === 2) {
      g.moveTo(0, -.5); g.quadraticCurveTo(.14, -.2, .4, 0); g.quadraticCurveTo(.14, .2, 0, .5);
      g.quadraticCurveTo(-.14, .2, -.4, 0); g.quadraticCurveTo(-.14, -.2, 0, -.5);
    } else if (s === 0) {
      g.moveTo(0, -.5); g.bezierCurveTo(.2, -.28, .5, -.1, .5, .12);
      g.arc(.25, .12, .25, 0, Math.PI); g.arc(-.25, .12, .25, 0, Math.PI);
      g.bezierCurveTo(-.5, -.1, -.2, -.28, 0, -.5);
      g.moveTo(0, .1); g.quadraticCurveTo(.04, .4, .2, .5); g.lineTo(-.2, .5); g.quadraticCurveTo(-.04, .4, 0, .1);
    } else {
      g.moveTo(.22, -.25); g.arc(0, -.25, .22, 0, Math.PI * 2);
      g.moveTo(-.02, .08); g.arc(-.24, .08, .22, 0, Math.PI * 2);
      g.moveTo(.46, .08); g.arc(.24, .08, .22, 0, Math.PI * 2);
      g.moveTo(.13, 0); g.arc(0, 0, .13, 0, Math.PI * 2);
      g.moveTo(0, .02); g.quadraticCurveTo(.04, .4, .2, .5); g.lineTo(-.2, .5); g.quadraticCurveTo(-.04, .4, 0, .02);
    }
    g.restore();
  }
  const dot = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const line = (g, a, b, c, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };

  function court(g, r, s, x, y, w, h) {
    const red = RED[s], main = red ? '#d2343f' : '#3457b8', alt = red ? '#3457b8' : '#d2343f';
    const gold = '#f1b531', ink = '#2a2638', skin = '#f9d6b5';
    g.save();
    g.beginPath(); g.roundRect(x, y, w, h, w * .07);
    g.fillStyle = '#fff5df'; g.fill(); g.clip();
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let k = 0; k < 2; k++) {
      g.save();
      if (k) { g.translate(x + w, y + h); g.rotate(Math.PI); } else g.translate(x, y);
      const u = w, hh = h / 2, cx = u / 2, hy = hh * .4, hr = u * .15;
      if (r === 13) {
        g.strokeStyle = '#a3abbd'; g.lineWidth = u * .045; line(g, u * .85, hh * .1, u * .85, hh);
        g.strokeStyle = gold; g.lineWidth = u * .05; line(g, u * .76, hh * .34, u * .94, hh * .34);
      } else if (r === 12) {
        g.strokeStyle = '#3f9a55'; g.lineWidth = u * .03; line(g, u * .16, hh, u * .16, hh * .42);
        g.fillStyle = alt;
        for (let i = 0; i < 5; i++) dot(g, u * .16 + Math.cos(i * 1.2566) * u * .055, hh * .34 + Math.sin(i * 1.2566) * u * .055, u * .04);
        g.fillStyle = gold; dot(g, u * .16, hh * .34, u * .035);
      } else {
        g.strokeStyle = '#8a5a2b'; g.lineWidth = u * .04; line(g, u * .15, hh * .16, u * .15, hh);
        g.fillStyle = '#b9c0cf'; g.beginPath(); g.moveTo(u * .15, hh * .02); g.lineTo(u * .21, hh * .2); g.lineTo(u * .09, hh * .2); g.closePath(); g.fill();
      }
      g.beginPath(); g.moveTo(u * .05, hh); g.bezierCurveTo(u * .07, hh * .72, u * .26, hh * .62, cx, hh * .62); g.bezierCurveTo(u * .74, hh * .62, u * .93, hh * .72, u * .95, hh); g.closePath();
      g.fillStyle = main; g.fill();
      g.beginPath(); g.moveTo(u * .35, hh); g.lineTo(u * .41, hh * .66); g.lineTo(u * .59, hh * .66); g.lineTo(u * .65, hh); g.closePath(); g.fillStyle = alt; g.fill();
      g.strokeStyle = gold; g.lineWidth = u * .035;
      g.beginPath(); g.moveTo(u * .41, hh * .66); g.lineTo(u * .35, hh); g.moveTo(u * .59, hh * .66); g.lineTo(u * .65, hh); g.stroke();
      g.fillStyle = gold;
      for (const [px, py] of [[.17, .9], [.25, .78], [.83, .9], [.75, .78], [.5, .8], [.5, .93]]) dot(g, u * px, hh * py, u * .022);
      g.beginPath(); g.ellipse(cx, hh * .64, u * .2, hh * .07, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.strokeStyle = ink; g.lineWidth = .7; g.stroke();
      if (r === 12) { g.beginPath(); g.ellipse(cx, hy + hr * .5, hr * 1.4, hr * 1.35, 0, 0, Math.PI * 2); g.fillStyle = '#e8a33a'; g.fill(); }
      g.beginPath(); g.arc(cx, hy, hr, 0, Math.PI * 2); g.fillStyle = skin; g.fill(); g.strokeStyle = ink; g.lineWidth = .7; g.stroke();
      if (r === 13) {
        g.beginPath(); g.moveTo(cx - hr * .92, hy + hr * .05); g.quadraticCurveTo(cx, hy + hr * 2.1, cx + hr * .92, hy + hr * .05);
        g.quadraticCurveTo(cx, hy + hr * .85, cx - hr * .92, hy + hr * .05); g.fillStyle = '#efe7da'; g.fill(); g.stroke();
      }
      g.fillStyle = ink; dot(g, cx - hr * .38, hy - hr * .08, u * .017); dot(g, cx + hr * .38, hy - hr * .08, u * .017);
      g.fillStyle = 'rgba(232,90,90,.35)'; dot(g, cx - hr * .55, hy + hr * .3, u * .028); dot(g, cx + hr * .55, hy + hr * .3, u * .028);
      if (r !== 13) { g.strokeStyle = '#c0392b'; g.lineWidth = .9; g.beginPath(); g.arc(cx, hy + hr * .2, hr * .3, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
      g.strokeStyle = ink; g.lineWidth = .7;
      if (r === 13) {
        g.beginPath(); g.moveTo(cx - hr, hy - hr * .55); g.lineTo(cx - hr * 1.08, hy - hr * 1.6); g.lineTo(cx - hr * .5, hy - hr * 1.05); g.lineTo(cx, hy - hr * 1.8);
        g.lineTo(cx + hr * .5, hy - hr * 1.05); g.lineTo(cx + hr * 1.08, hy - hr * 1.6); g.lineTo(cx + hr, hy - hr * .55); g.closePath();
        g.fillStyle = gold; g.fill(); g.stroke(); g.fillStyle = alt; dot(g, cx, hy - hr * .85, u * .025);
      } else if (r === 12) {
        g.beginPath(); g.moveTo(cx - hr * .95, hy - hr * .5);
        g.quadraticCurveTo(cx - hr * .8, hy - hr * 1.45, cx - hr * .4, hy - hr * .95); g.quadraticCurveTo(cx, hy - hr * 1.9, cx + hr * .4, hy - hr * .95);
        g.quadraticCurveTo(cx + hr * .8, hy - hr * 1.45, cx + hr * .95, hy - hr * .5); g.closePath();
        g.fillStyle = gold; g.fill(); g.stroke(); g.fillStyle = alt; dot(g, cx, hy - hr * 1.05, u * .025);
      } else {
        g.beginPath(); g.ellipse(cx, hy - hr * .72, hr * 1.18, hr * .5, -.12, 0, Math.PI * 2); g.fillStyle = alt; g.fill(); g.stroke();
        g.strokeStyle = gold; g.lineWidth = u * .03; g.beginPath(); g.moveTo(cx + hr * .5, hy - hr * .95); g.quadraticCurveTo(cx + hr * 1.3, hy - hr * 2.2, cx + hr * 2, hy - hr * 1.6); g.stroke();
      }
      g.restore();
    }
    g.restore();
    g.strokeStyle = main; g.lineWidth = .8; line(g, x + w * .06, y + h / 2, x + w * .94, y + h / 2);
    g.beginPath(); g.roundRect(x, y, w, h, w * .07); g.lineWidth = 1.3; g.stroke();
  }

  const SUIT_CH = ['♠', '♥', '♦', '♣'];
  const SUIT_NM = ['spades', 'hearts', 'diamonds', 'clubs'];

  const AUD = { ac: null };
  function audio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      AUD.ac = AUD.ac || new AC();
      if (AUD.ac.state === 'suspended') AUD.ac.resume();
      return AUD.ac;
    } catch (e) { return null; }
  }
  function mkSnd(api) {
    const nz = (() => { let b = null; return a => b || (b = (() => { const n = a.sampleRate * .3, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return buf; })()); })();
    const burst = (f, q, dur, vol, at = 0, bend = 1) => {
      if (api.muted) return;
      const a = audio(); if (!a) return;
      const t = a.currentTime + at, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nz(a); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(Math.max(60, f * bend), t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(fl).connect(g).connect(a.destination); s.start(t); s.stop(t + dur + .02);
    };
    const tone = (f, dur, type, vol, at = 0, f2 = 0) => {
      if (api.muted) return;
      const a = audio(); if (!a) return;
      const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
    };
    return {
      card: () => burst(2400, 1.2, .07, .16, 0, .5),
      flip: () => burst(3200, 1.5, .045, .09, 0, .6),
      pick: () => burst(1800, 1, .04, .08),
      deal: n => { for (let i = 0; i < n; i++) burst(2200 + i * 40, 1.2, .05, .1, i * .05, .6); },
      shuffle: () => { for (let i = 0; i < 9; i++) burst(1500 + Math.random() * 900, .9, .05, .09, i * .045); },
      peg: () => { tone(420, .09, 'sine', .16, 0, 300); burst(900, 2, .03, .05); },
      pegEnd: () => { tone(620, .12, 'triangle', .13, 0, 520); },
      ding: n => { tone(660 + (n || 0) * 40, .22, 'sine', .1); tone(990 + (n || 0) * 60, .3, 'sine', .06, .06); },
      fanfare: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => { tone(f, .5, 'triangle', .1, i * .11); tone(f * 2, .4, 'sine', .035, i * .11); }); },
      sweep: () => { burst(1200, .8, .35, .12, 0, 3); },
      nope: () => { tone(180, .16, 'square', .05, 0, 120); },
      thunk: () => { tone(160, .12, 'sine', .14, 0, 90); burst(500, 1, .05, .06); }
    };
  }

  function cardKit(CW, CH, bk) {
    const R = CW * .08, PAD = 2, SC = Math.min(window.devicePixelRatio || 1, 2);
    const mode = CW < 56 ? 0 : CW < 76 ? 1 : 2;
    const sprite = (w = CW, h = CH, pad = PAD) => {
      const cvs = document.createElement('canvas');
      cvs.width = Math.ceil((w + 2 * pad) * SC); cvs.height = Math.ceil((h + 2 * pad) * SC);
      const g = cvs.getContext('2d'); g.setTransform(SC, 0, 0, SC, pad * SC, pad * SC);
      return { cvs, g };
    };
    const cardBase = g => {
      g.beginPath(); g.roundRect(.5, .5, CW - 1, CH - 1, R);
      const gr = g.createLinearGradient(0, 0, 0, CH); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#f3f1ec');
      g.fillStyle = gr; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(40,36,60,.22)'; g.stroke();
    };
    function makeFace(s, r) {
      const { cvs, g } = sprite();
      cardBase(g);
      const col = RED[s] ? '#d42a3c' : '#1f1d2b';
      g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'top';
      const rankText = (x, y, size) => {
        g.font = `700 ${size}px Georgia, "Times New Roman", serif`;
        g.save(); g.translate(x, y); if (r === 10) g.scale(.74, 1); g.fillText(RANK[r], 0, 0); g.restore();
      };
      if (mode === 0) {
        rankText(CW * .32, CH * .035, CW * .4);
        suitPath(g, s, CW * .78, CH * .15, CW * .3); g.fill();
        suitPath(g, s, CW * .5, CH * .7, CW * .5); g.fill();
        return cvs;
      }
      if (mode === 1) {
        rankText(CW * .25, CH * .05, CW * .31);
        suitPath(g, s, CW * .76, CH * .14, CW * .26); g.fill();
      } else {
        for (let k = 0; k < 2; k++) {
          g.save(); if (k) { g.translate(CW, CH); g.rotate(Math.PI); }
          rankText(CW * .12, CH * .03, CW * .19);
          suitPath(g, s, CW * .12, CH * .2, CW * .12); g.fill();
          g.restore();
        }
      }
      if (r > 10) {
        if (mode === 1) court(g, r, s, CW * .13, CH * .33, CW * .74, CH * .6);
        else court(g, r, s, CW * .22, CH * .1, CW * .56, CH * .8);
      } else if (mode === 1) {
        g.fillStyle = col; suitPath(g, s, CW * .5, CH * .64, CW * (r === 1 ? .56 : .46)); g.fill();
      } else if (r === 1) {
        g.fillStyle = col; suitPath(g, s, CW / 2, CH / 2, CW * .46); g.fill();
        g.strokeStyle = RED[s] ? 'rgba(212,42,60,.25)' : 'rgba(31,29,43,.18)'; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(CW / 2, CH / 2, CW * .34, CW * .34, 0, 0, TAU); g.stroke();
      } else {
        g.fillStyle = col;
        for (const [px, py] of PIPS[r]) { suitPath(g, s, CW * px, CH * py, CW * .17, py > .5); g.fill(); }
      }
      return cvs;
    }
    function makeBack() {
      const { cvs, g } = sprite();
      cardBase(g);
      const m = CW * .055;
      g.save();
      g.beginPath(); g.roundRect(m, m, CW - 2 * m, CH - 2 * m, R * .6);
      const gr = g.createLinearGradient(0, 0, CW, CH); gr.addColorStop(0, bk[0]); gr.addColorStop(1, bk[1]);
      g.fillStyle = gr; g.fill(); g.clip();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.1;
      for (let d = -CH; d < CW + CH; d += CW * .1) { line(g, d, 0, d + CH, CH); line(g, d, CH, d + CH, 0); }
      g.beginPath(); g.ellipse(CW / 2, CH / 2, CW * .24, CH * .2, 0, 0, TAU);
      g.fillStyle = bk[2] || bk[1]; g.fill(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = '#fff'; suitPath(g, bk[3] == null ? 2 : bk[3], CW / 2, CH / 2, CW * .2); g.fill();
      g.restore();
      g.beginPath(); g.roundRect(m, m, CW - 2 * m, CH - 2 * m, R * .6); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.stroke();
      return cvs;
    }
    function makeShadow(blur, alpha) {
      const pad = Math.ceil(blur * 2 + 2), { cvs, g } = sprite(CW, CH, pad);
      g.shadowColor = `rgba(0,0,0,${alpha})`; g.shadowBlur = blur * SC;
      g.fillStyle = `rgba(0,0,0,${alpha})`; g.beginPath(); g.roundRect(1, 1, CW - 2, CH - 2, R); g.fill();
      return { cvs, pad };
    }
    const faces = [];
    for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) faces.push(makeFace(s, r));
    return { CW, CH, R, PAD, SC, mode, faces, back: makeBack(), shadow: makeShadow(3, .28), lift: makeShadow(10, .32), sprite };
  }

  function felt(W, H, SC, paint, tones) {
    const t = tones || ['#2f9b5b', '#22804a', '#155a33'];
    const bg = document.createElement('canvas');
    bg.width = Math.round(W * SC); bg.height = Math.round(H * SC);
    const g = bg.getContext('2d'); g.setTransform(SC, 0, 0, SC, 0, 0);
    const gr = g.createRadialGradient(W / 2, H * .38, 20, W / 2, H * .45, Math.max(W, H) * .78);
    gr.addColorStop(0, t[0]); gr.addColorStop(.55, t[1]); gr.addColorStop(1, t[2]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 30; i++) {
      g.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.06)';
      g.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
    }
    if (paint) paint(g);
    const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return bg;
  }
  const slotBox = (g, x, y, w, h, R) => {
    g.beginPath(); g.roundRect(x + 1, y + 1, w - 2, h - 2, R);
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.22)'; g.stroke();
  };
  const recycleMark = (g, cx, cy, rr, lw) => {
    g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = lw; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, rr, -Math.PI * .35, Math.PI * 1.45); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.32)'; g.beginPath();
    const ax = cx + Math.cos(-Math.PI * .35) * rr, ay = cy + Math.sin(-Math.PI * .35) * rr, k = rr / 8;
    g.moveTo(ax + 4 * k, ay - .4 * k); g.lineTo(ax - 1.6 * k, ay - 3.6 * k); g.lineTo(ax - .8 * k, ay + 3.2 * k); g.closePath(); g.fill();
  };

  const solCss = id => `
.gm-${id}{gap:12px}
.gm-${id} .sol-bar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px 18px;width:100%}
.gm-${id} .sol-bar .g-stat{min-width:56px}
.gm-${id} .sol-bar .g-stat .v{font-size:20px}
.gm-${id} .sol-seg{display:inline-flex;padding:3px;border-radius:999px;background:var(--sunk);border:1px solid var(--line)}
.gm-${id} .sol-seg button{height:30px;padding:0 13px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap}
.gm-${id} .sol-seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(31,29,43,.14)}
.gm-${id} .sol-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.gm-${id} .sol-btns .warn{background:var(--bad);border-color:var(--bad);color:#fff}
.gm-${id} .sol-num{width:78px;height:30px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);font:800 13px/1 var(--sans);text-align:center;outline:none}
.gm-${id} .sol-num:focus{border-color:var(--accent)}
.gm-${id} .sol-tog{height:30px;padding:0 13px;border-radius:999px;border:1px solid var(--line);background:var(--sunk);color:var(--muted);font:800 13px/1 var(--sans);cursor:pointer}
.gm-${id} .sol-tog.on{background:var(--accent);border-color:var(--accent);color:#fff}
.gm-${id} canvas{background:#1d6b3c;box-shadow:0 14px 34px -18px rgba(10,60,30,.7)}
@media (pointer:coarse){.gm-${id} .sol-seg{padding:1px}.gm-${id} .sol-seg button{height:40px}.gm-${id} .sol-btns .g-btn{height:40px}.gm-${id} .sol-num,.gm-${id} .sol-tog{height:40px}}
`;

  function confirmNew(api, btn, active, run) {
    let armed = false, tok = 0;
    const reset = () => { armed = false; btn.textContent = btn.dataset.label; btn.classList.remove('warn'); };
    btn.dataset.label = btn.textContent;
    btn.addEventListener('click', () => {
      if (active() && !armed) {
        armed = true; btn.textContent = 'Sure?'; btn.classList.add('warn');
        const t = ++tok;
        api.timeout(() => { if (t === tok && armed) reset(); }, 2500);
        return;
      }
      tok++; reset(); api.hideOverlay(); run();
    });
    return reset;
  }

  function table(root, api, o) {
    const { W, H, CW, CH } = o;
    const kit = cardKit(CW, CH, o.back);
    const { R, PAD, SC } = kit;
    const { canvas: cv, ctx, toLocal } = api.canvas(W, H);
    const bg = felt(W, H, SC, g => o.paint(g, kit));
    const T = { W, H, CW, CH, R, PAD, kit, cv, ctx, bg, piles: [], cards: [], hist: [], drag: null, hintG: null, cascade: null, sel: null, secs: 0, running: false, G: null, shown: -1 };
    for (let i = 0; i < o.n; i++) T.cards.push({ id: i, s: 0, r: 1, up: false, f: 0, x: 0, y: 0, tx: 0, ty: 0, delay: 0, p: 0, i: 0, drag: false });

    T.moving = c => c.delay > 0 || Math.abs(c.x - c.tx) + Math.abs(c.y - c.ty) > .8;
    T.snapshot = x => { T.hintG = null; T.sel = null; T.hist.push({ p: T.piles.map(a => a.slice()), up: T.cards.map(c => c.up), x }); };
    T.undo = () => {
      const h = T.hist.pop();
      T.piles = h.p; T.cards.forEach((c, i) => { c.up = h.up[i]; c.delay = 0; });
      T.hintG = null; T.sel = null;
      return h.x;
    };
    T.reset = () => { T.hist = []; T.hintG = null; T.sel = null; T.cascade = null; T.drag = null; T.secs = 0; T.shown = -1; T.running = false; T.cards.forEach(c => { c.drag = false; c.delay = 0; }); };
    T.bestDrop = group => {
      const lead = group[0], G = T.G;
      let best = -1, ba = 0;
      for (const p of G.drops(group)) {
        if (p === lead.p) continue;
        const z = G.zone(p);
        const ox = Math.min(lead.x + CW, z.x + z.w) - Math.max(lead.x, z.x), oy = Math.min(lead.y + CH, z.y + z.h) - Math.max(lead.y, z.y);
        const a = ox > 0 && oy > 0 ? ox * oy : 0;
        if (a > ba && G.can(group, p)) { ba = a; best = p; }
      }
      return best;
    };

    let lastTap = { c: null, t: 0 };
    const setSel = group => { T.sel = { group, p: group[0].p, i: group[0].i }; };
    cv.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      e.preventDefault();
      const G = T.G;
      if (T.cascade && !T.cascade.done) { T.cascade.finish(); return; }
      if (T.drag || (G.busy && G.busy())) return;
      const pt = toLocal(e), now = performance.now(), touch = e.pointerType === 'touch' || e.pointerType === 'pen';
      if (T.sel) {
        const grp = T.sel.group, p = G.pileAt ? G.pileAt(pt) : -1;
        if (p >= 0 && p !== grp[0].p && G.can(grp, p)) { T.sel = null; G.drop(grp, p); return; }
      }
      const h = G.grab(pt);
      if (!h) { T.sel = null; return; }
      if (h.click) { T.sel = null; h.click(); return; }
      if (h.bad) { T.sel = null; api.sfx('bad'); if (h.msg) api.toast(h.msg); return; }
      const c = h.group[0];
      if (!touch && lastTap.c === c && now - lastTap.t < 420) {
        lastTap.c = null; T.sel = null;
        if (!G.tap(h.group)) api.sfx('bad');
        return;
      }
      lastTap = { c, t: now };
      T.drag = { id: e.pointerId, group: h.group, sx: pt.x, sy: pt.y, dx: pt.x - c.x, dy: pt.y - c.y, rel: h.group.map(g => g.ty - c.ty), moved: false, touch };
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    });
    cv.addEventListener('pointermove', e => {
      const pt = toLocal(e), d = T.drag;
      if (!d) {
        if (e.pointerType === 'mouse') {
          const h = T.cascade || (T.G.busy && T.G.busy()) ? null : T.G.grab(pt), cur = h && !h.bad ? 'pointer' : '';
          if (cv.style.cursor !== cur) cv.style.cursor = cur;
        }
        return;
      }
      if (e.pointerId !== d.id) return;
      if (!d.moved) {
        if (Math.abs(pt.x - d.sx) + Math.abs(pt.y - d.sy) < (d.touch ? 12 : 5)) return;
        d.moved = true; lastTap.c = null; T.sel = null;
        d.group.forEach(c => { c.drag = true; });
        api.sfx('tap');
      }
      d.group.forEach((c, k) => { c.x = pt.x - d.dx; c.y = pt.y - d.dy + d.rel[k]; });
    });
    const release = e => {
      const d = T.drag;
      if (!d || e.pointerId !== d.id) return;
      T.drag = null;
      d.group.forEach(c => { c.drag = false; });
      const G = T.G;
      if (!d.moved) {
        if (e.type !== 'pointerup') return;
        if (d.touch) {
          if (T.sel && T.sel.group[0] === d.group[0]) T.sel = null;
          else if (!G.tap(d.group)) { setSel(d.group); api.sfx('tick'); }
        }
        else if (T.sel && T.sel.group[0] === d.group[0]) T.sel = null;
        else if (G.instant && G.instant(d.group)) G.tap(d.group);
        else { setSel(d.group); api.sfx('tick'); }
        return;
      }
      const to = T.bestDrop(d.group);
      if (to >= 0) G.drop(d.group, to);
      else if (G.dropFail) G.dropFail(d.group);
    };
    cv.addEventListener('pointerup', release);
    cv.addEventListener('pointercancel', release);

    const drawCard = (c, lifted) => {
      const flipS = Math.abs(1 - 2 * c.f), img = c.f >= .5 ? kit.faces[c.s * 13 + c.r - 1] : kit.back;
      const sh = lifted ? kit.lift : kit.shadow;
      const yl = c.y - (c.f > 0 && c.f < 1 ? Math.sin(c.f * Math.PI) * 6 : 0);
      if (flipS > .999) {
        ctx.drawImage(sh.cvs, c.x - sh.pad, c.y - sh.pad + (lifted ? 7 : 1.5), CW + 2 * sh.pad, CH + 2 * sh.pad);
        ctx.drawImage(img, c.x - PAD, yl - PAD, CW + 2 * PAD, CH + 2 * PAD);
      } else {
        ctx.save(); ctx.translate(c.x + CW / 2, 0); ctx.scale(Math.max(.02, flipS), 1);
        ctx.drawImage(sh.cvs, -CW / 2 - sh.pad, c.y - sh.pad + 3, CW + 2 * sh.pad, CH + 2 * sh.pad);
        ctx.drawImage(img, -CW / 2 - PAD, yl - PAD, CW + 2 * PAD, CH + 2 * PAD);
        ctx.restore();
      }
    };
    T.drawCard = drawCard;
    T.render = () => {
      const cs = T.cascade;
      if (cs) {
        ctx.drawImage(cs.trail, 0, 0, W, H);
        for (const p of T.piles) for (const c of p) drawCard(c, false);
        return;
      }
      ctx.drawImage(bg, 0, 0, W, H);
      const P = T.piles;
      for (const p of P) for (const c of p) if (!c.drag && !T.moving(c)) drawCard(c, false);
      if (T.G.under) T.G.under(ctx);
      for (const p of P) for (const c of p) if (!c.drag && T.moving(c)) drawCard(c, true);
      if (T.drag && T.drag.moved) for (const c of T.drag.group) drawCard(c, true);
      const sel = T.sel;
      if (sel) {
        const g = sel.group, lead = g[0], last = g[g.length - 1];
        ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.roundRect(lead.x - 1, lead.y - 1, CW + 2, last.y - lead.y + CH + 2, R); ctx.stroke();
        ctx.restore();
      }
      if (T.hintG) {
        ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14;
        ctx.globalAlpha = .55 + .45 * Math.sin(T.hintG.t * 9);
        for (const c of [T.hintG.s, T.hintG.d]) if (c) { ctx.beginPath(); ctx.roundRect(c.tx, c.ty, c.w || CW, c.h || CH, R); ctx.stroke(); }
        ctx.restore();
      }
      if (T.G.over) T.G.over(ctx);
    };

    T.celebrate = (order, done) => {
      api.timeout(() => {
        const trail = document.createElement('canvas');
        trail.width = bg.width; trail.height = bg.height;
        const tg = trail.getContext('2d'); tg.drawImage(bg, 0, 0); tg.setTransform(SC, 0, 0, SC, 0, 0);
        const cs = T.cascade = { trail, tg, order: order(), fly: [], next: 0, t: 0, done: false };
        cs.finish = () => { if (cs.done) return; cs.done = true; done(); };
        T.hintG = null; T.sel = null;
      }, 550);
    };
    const stepCascade = dt => {
      const cs = T.cascade;
      if (cs.done) return;
      cs.t -= dt;
      if (cs.t <= 0 && cs.next < cs.order.length) {
        cs.t = .16;
        const c = cs.order[cs.next++], pile = T.piles[c.p], at = pile.indexOf(c);
        if (at >= 0) pile.splice(at, 1);
        c.vx = (Math.random() < .5 ? -1 : 1) * (140 + Math.random() * 260);
        c.vy = -Math.random() * 380;
        cs.fly.push(c);
        api.sfx('tick');
      }
      for (let k = cs.fly.length - 1; k >= 0; k--) {
        const c = cs.fly[k];
        c.vy += 1700 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.y + CH > H) { c.y = H - CH; c.vy *= -.72; }
        if (c.x + CW < 0 || c.x > W) { cs.fly.splice(k, 1); continue; }
        cs.tg.drawImage(kit.faces[c.s * 13 + c.r - 1], c.x - PAD, c.y - PAD, CW + 2 * PAD, CH + 2 * PAD);
      }
      if (cs.next >= cs.order.length && !cs.fly.length) cs.finish();
    };

    T.start = () => api.loop(dt => {
      if (T.running) {
        T.secs += dt;
        const s = Math.floor(T.secs);
        if (s !== T.shown) { T.shown = s; if (o.onSecond) o.onSecond(s); }
      }
      if (T.hintG && (T.hintG.t -= dt) <= 0) T.hintG = null;
      if (T.sel && (T.sel.group[0].p !== T.sel.p || T.sel.group[0].i !== T.sel.i)) T.sel = null;
      const k = 1 - Math.exp(-dt * 16);
      if (!T.cascade) {
        for (const c of T.cards) {
          if (c.drag) continue;
          if (c.delay > 0) { c.delay -= dt; continue; }
          const ex = c.tx - c.x, ey = c.ty - c.y;
          if (Math.abs(ex) + Math.abs(ey) < .4) { c.x = c.tx; c.y = c.ty; } else { c.x += ex * k; c.y += ey * k; }
          const ft = c.up ? 1 : 0;
          if (c.f !== ft) c.f = ft > c.f ? Math.min(1, c.f + dt * 4.5) : Math.max(0, c.f - dt * 4.5);
        }
      }
      if (T.G.frame) T.G.frame(dt);
      if (T.cascade) stepCascade(dt);
      T.render();
    });
    T.toLocal = toLocal;
    return T;
  }

  Ameplay.register({
    id: 'spider-solitaire',
    title: 'Spider Solitaire',
    category: 'Board',
    width: 960,
    blurb: 'Eight runs from King down to Ace, one suit, two suits or four.',
    help: 'Drag a run of one suit onto a card one higher · tap or double-click to auto-move · click the deck to deal a row · <kbd>Space</kbd> deals · <kbd>H</kbd> hint · <kbd>Z</kbd> undo',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="22" width="22" height="32" rx="3.5" opacity=".35" fill="currentColor"/><rect x="20" y="14" width="22" height="32" rx="3.5" opacity=".6" fill="currentColor"/><rect x="31" y="8" width="23" height="34" rx="3.5"/><ellipse cx="42.5" cy="26" rx="4" ry="5" fill="currentColor"/><path d="M42.5 21v-3M38.5 23l-4-3M46.5 23l4-3M38 27l-5 1M47 27l5 1M39 30l-4 4M46 30l4 4"/></svg>',
    css: solCss('spider-solitaire') + `
.gm-spider-solitaire .sol-seg button{padding:0 12px}
`,
    mount(root, api) {
      const narrow = root.clientWidth < 620;
      const W = narrow ? 440 : 960, H = narrow ? 600 : 660;
      const CW = narrow ? 40 : 80, CH = Math.round(CW * 1.4);
      const MX = narrow ? 6 : 30, GAP = (W - 2 * MX - 10 * CW) / 9;
      const TOP = narrow ? 10 : 16, BOTY = H - CH - (narrow ? 8 : 14);
      const FD = narrow ? 6 : 10, FU = narrow ? 17 : 28, MINFU = narrow ? 9 : 13;
      const FND = 10, STOCK = 18, FSTEP = CW * .34, SOFF = narrow ? 9 : 20;
      const colX = t => MX + t * (CW + GAP);
      const fndX = f => MX + f * FSTEP;
      const stockX0 = narrow ? W - MX - CW - 62 : colX(9);
      const saved = api.load() || {};
      let pref = [1, 2, 4].includes(saved.suits) ? saved.suits : 1, suits = pref;
      const snd = mkSnd(api);

      root.innerHTML = `<div class="sol-bar">
        <div class="g-stat"><span class="k">Score</span><span class="v" data-s>500</span></div>
        <div class="g-stat"><span class="k">Time</span><span class="v" data-t>0:00</span></div>
        <div class="g-stat"><span class="k">Moves</span><span class="v" data-m>0</span></div>
        <div class="g-stat"><span class="k">Runs</span><span class="v" data-r>0/8</span></div>
        <div class="sol-seg"><button type="button" data-d="1">1 suit</button><button type="button" data-d="2">2 suits</button><button type="button" data-d="4">4 suits</button></div>
        <div class="sol-btns"><button type="button" class="g-btn sm ghost" data-h>Hint</button><button type="button" class="g-btn sm ghost" data-u>Undo</button><button type="button" class="g-btn sm" data-n>New deal</button></div>
      </div>`;
      const q = s => root.querySelector(s);
      const tEl = q('[data-t]'), mEl = q('[data-m]'), sEl = q('[data-s]'), rEl = q('[data-r]'), newBtn = q('[data-n]');
      const segBtns = [...root.querySelectorAll('[data-d]')];

      const T = table(root, api, {
        W, H, CW, CH, n: 104, back: ['#d4483e', '#8c1f1f', '#b32d2d', 0],
        onSecond: s => { tEl.textContent = mmss(s); },
        paint(g, kit) {
          for (let t = 0; t < 10; t++) slotBox(g, colX(t), TOP, CW, CH, kit.R);
          g.beginPath(); g.roundRect(fndX(0) + 1, BOTY + 1, fndX(7) + CW - fndX(0) - 2, CH - 2, kit.R); g.fillStyle = 'rgba(0,0,0,.14)'; g.fill();
          g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.14)';
          for (let f = 7; f >= 0; f--) { g.beginPath(); g.roundRect(fndX(f) + 1, BOTY + 1, CW - 2, CH - 2, kit.R); g.stroke(); }
          slotBox(g, stockX0, BOTY, CW, CH, kit.R);
          g.fillStyle = 'rgba(255,255,255,.2)'; suitPath(g, 2, stockX0 + CW / 2, BOTY + CH / 2, CW * .4); g.fill();
          g.save(); g.fillStyle = 'rgba(255,255,255,.35)'; g.font = `800 ${narrow ? 9 : 12}px system-ui, sans-serif`; g.textAlign = 'center';
          g.fillText('RUNS', fndX(0) + CW * .5 + 3.5 * FSTEP, BOTY - 5);
          g.fillText('DEAL', stockX0 + CW / 2, BOTY - 5);
          g.restore();
        }
      });
      const P = T.piles = Array.from({ length: 19 }, () => []);
      const cards = T.cards;
      let moves = 0, won = false, deals = 0;

      const completed = () => { let n = 0; for (let f = 0; f < 8; f++) if (P[FND + f].length) n++; return n; };
      const scoreNow = () => Math.max(0, 500 - moves + 100 * completed());
      function hud() {
        mEl.textContent = moves; sEl.textContent = scoreNow(); rEl.textContent = completed() + '/8';
        api.score(scoreNow());
      }
      const blocked = t => {
        const x0 = colX(t), x1 = x0 + CW;
        return (x0 < fndX(7) + CW && x1 > fndX(0)) || (x1 > stockX0 - 4 * SOFF);
      };
      function layout() {
        for (let t = 0; t < 10; t++) {
          const pile = P[t], x0 = colX(t);
          let nd = 0; for (const c of pile) if (!c.up) nd++;
          const nu = pile.length - nd, avail = (blocked(t) ? BOTY - 8 : H - 8) - TOP - CH;
          let fd = FD, fu = FU;
          if (nd * fd + Math.max(0, nu - 1) * fu > avail) {
            fd = Math.min(fd, narrow ? 4 : 6);
            fu = Math.max(MINFU, Math.min(FU, (avail - nd * fd) / Math.max(1, nu - 1)));
          }
          let y = TOP;
          pile.forEach((c, i) => { c.p = t; c.i = i; c.tx = x0; c.ty = y; y += c.up ? fu : fd; });
        }
        for (let f = 0; f < 8; f++) P[FND + f].forEach((c, i) => { c.p = FND + f; c.i = i; c.tx = fndX(f); c.ty = BOTY; });
        P[STOCK].forEach((c, i) => { c.p = STOCK; c.i = i; c.tx = stockX0 - Math.floor(i / 10) * SOFF; c.ty = BOTY; });
      }
      function deal() {
        suits = pref; T.reset(); moves = 0; won = false; deals = 0;
        for (const p of P) p.length = 0;
        const order = suits === 1 ? [0, 0, 0, 0, 0, 0, 0, 0] : suits === 2 ? [0, 1, 0, 1, 0, 1, 0, 1] : [0, 1, 2, 3, 0, 1, 2, 3];
        order.forEach((s, k) => { for (let r = 1; r <= 13; r++) { const c = cards[k * 13 + r - 1]; c.s = s; c.r = r; } });
        const deck = shuffle(cards.slice());
        let seq = 0;
        for (const c of deck) { c.up = false; c.f = 0; c.drag = false; c.delay = 0; c.x = stockX0; c.y = BOTY; }
        for (let i = 0; i < 54; i++) { const c = deck[i]; P[i % 10].push(c); c.delay = .1 + seq++ * .028; }
        for (let t = 0; t < 10; t++) P[t][P[t].length - 1].up = true;
        for (let i = 54; i < 104; i++) P[STOCK].push(deck[i]);
        layout(); hud(); tEl.textContent = '0:00';
        snd.deal(6);
      }
      const snap = () => T.snapshot(null);
      const begin = () => { if (!won) T.running = true; };

      function chainStart(pile) {
        let i = pile.length - 1;
        if (i < 0 || !pile[i].up) return -1;
        while (i > 0 && pile[i - 1].up && pile[i - 1].s === pile[i].s && pile[i - 1].r === pile[i].r + 1) i--;
        return i;
      }
      function sweep() {
        let any = false;
        for (let t = 0; t < 10; t++) {
          const pile = P[t], n = pile.length;
          if (n >= 13 && pile[n - 1].r === 1 && pile[n - 1].up) {
            const s = pile[n - 1].s;
            let ok = true;
            for (let k = 0; k < 13 && ok; k++) { const c = pile[n - 1 - k]; ok = c.up && c.s === s && c.r === k + 1; }
            if (!ok) continue;
            const run = pile.splice(n - 13).reverse();
            let f = 0; while (P[FND + f].length) f++;
            run.forEach((c, k) => { c.delay = k * .05; P[FND + f].push(c); });
            any = true;
            api.timeout(() => { snd.ding(completed()); }, 150);
          }
        }
        for (let t = 0; t < 10; t++) { const pile = P[t], c = pile[pile.length - 1]; if (c && !c.up) { c.up = true; api.timeout(() => snd.flip(), 100); } }
        return any;
      }
      function settle() {
        sweep(); layout(); hud();
        if (completed() === 8) return win();
        if (!listMoves().length && (!P[STOCK].length || P.slice(0, 10).some(p => !p.length))) {
          T.running = false; snd.nope();
          api.overlay({
            kicker: 'No moves left', title: 'Board is blocked', text: `${completed()} of 8 sequences completed.`,
            stats: [['Score', scoreNow()], ['Time', mmss(Math.round(T.secs))], ['Moves', moves]],
            button: 'Undo', onAction: undo, secondary: 'New deal', onSecondary: deal
          });
        }
      }
      function dealRow() {
        if (won || T.cascade) return;
        if (!P[STOCK].length) { api.toast('No more cards to deal'); return; }
        for (let t = 0; t < 10; t++) if (!P[t].length) { api.sfx('bad'); api.toast('Fill every empty column before dealing'); T.hintG = { s: { tx: colX(t), ty: TOP }, d: null, t: 1.6 }; return; }
        snap(); begin();
        for (let t = 0; t < 10; t++) { const c = P[STOCK].pop(); c.up = true; c.delay = t * .06; P[t].push(c); }
        snd.deal(10); deals++;
        settle();
      }
      function move(from, i, to) {
        snap(); begin();
        const grp = P[from].splice(i);
        P[to].push(...grp);
        moves++;
        snd.card();
        settle();
      }
      function undo() {
        if (!T.hist.length || won || T.cascade) return;
        api.hideOverlay(); begin(); T.undo(); moves++; layout(); hud(); snd.card();
      }

      function rate(pile, st, t2) {
        const lead = pile[st], top2 = P[t2][P[t2].length - 1];
        let sc = 0;
        if (!top2) {
          if (st === 0) return -1;
          sc = 4;
        } else {
          if (top2.r !== lead.r + 1 || !top2.up) return -1;
          if (top2.s === lead.s) sc += 12;
          else if (st > 0 && pile[st - 1].up && pile[st - 1].r === lead.r + 1) return -1;
          else sc += 1;
        }
        if (st > 0 && !pile[st - 1].up) sc += 9;
        if (st === 0) sc += 6;
        if (st > 0 && pile[st - 1].up && pile[st - 1].s === lead.s && pile[st - 1].r === lead.r + 1) sc -= 14;
        sc += Math.min(6, (top2 ? P[t2].length : 0) * .2);
        return sc;
      }
      function listMoves() {
        const out = [];
        for (let t = 0; t < 10; t++) {
          const pile = P[t], cs = chainStart(pile);
          if (cs < 0) continue;
          for (let st = cs; st < pile.length; st++) {
            for (let t2 = 0; t2 < 10; t2++) {
              if (t2 === t) continue;
              if (!P[t2].length && st !== cs) continue;
              const sc = rate(pile, st, t2);
              if (sc >= 0) out.push({ t, st, t2, sc });
            }
          }
        }
        return out.sort((a, b) => b.sc - a.sc);
      }
      function hint() {
        if (won || T.cascade || T.drag) return;
        const m = listMoves();
        if (m.length && m[0].sc >= 2) {
          const b = m[0], lead = P[b.t][b.st], top2 = P[b.t2][P[b.t2].length - 1];
          T.hintG = { s: lead, d: top2 || { tx: colX(b.t2), ty: TOP }, t: 2.6 };
          snd.pick(); return;
        }
        if (P[STOCK].length) {
          let empty = false; for (let t = 0; t < 10; t++) if (!P[t].length) empty = true;
          if (!empty) { T.hintG = { s: { tx: P[STOCK][P[STOCK].length - 1].tx, ty: BOTY }, d: null, t: 2.4 }; api.toast('Deal a new row'); return; }
          api.toast('Fill the empty column first');
        }
        if (m.length) { const b = m[0], lead = P[b.t][b.st], top2 = P[b.t2][P[b.t2].length - 1]; T.hintG = { s: lead, d: top2 || { tx: colX(b.t2), ty: TOP }, t: 2.6 }; return; }
        api.toast('No moves left · undo or start a new deal');
      }
      function autoMove(group) {
        const lead = group[0], pile = P[lead.p];
        let best = -1, bs = -1;
        for (let t2 = 0; t2 < 10; t2++) {
          if (t2 === lead.p) continue;
          const sc = rate(pile, lead.i, t2);
          if (sc > bs) { bs = sc; best = t2; }
        }
        if (best < 0) return false;
        move(lead.p, lead.i, best);
        return true;
      }

      function win() {
        won = true; T.running = false;
        const t = Math.max(1, Math.round(T.secs)), sc = scoreNow(), mult = suits === 1 ? 1 : suits === 2 ? 2 : 3;
        tEl.textContent = mmss(t); api.score(sc);
        const isBest = api.submit(sc * mult);
        const rec = api.load() || {};
        const key = 'best' + suits, prev = rec[key] || 0, fresh = sc > prev;
        if (fresh) { rec[key] = sc; }
        rec.won = (rec.won || 0) + 1; rec.suits = pref; api.save(rec);
        snd.fanfare();
        T.celebrate(() => {
          const order = [];
          for (let r = 13; r >= 1; r--) for (let f = 0; f < 8; f++) { const c = P[FND + f][r - 1]; if (c) order.push(c); }
          return order;
        }, () => api.overlay({
          kicker: isBest || fresh ? 'New best!' : 'Solved',
          title: 'You win!',
          stats: [['Score', sc], ['Time', mmss(t)], ['Moves', moves], [suits + (suits === 1 ? ' suit best' : ' suits best'), Math.max(prev, sc)]],
          button: 'Play again', onAction: deal
        }));
      }

      const inR = (pt, x, y, w, h) => pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
      T.G = {
        busy: () => won || T.cascade,
        grab(pt) {
          const stock = P[STOCK];
          if (stock.length && inR(pt, stockX0 - Math.floor((stock.length - 1) / 10) * SOFF, BOTY, CW + Math.floor((stock.length - 1) / 10) * SOFF, CH)) return { click: dealRow };
          for (let t = 0; t < 10; t++) {
            const pile = P[t];
            for (let i = pile.length - 1; i >= 0; i--) {
              const c = pile[i];
              if (!inR(pt, c.tx, c.ty, CW, CH)) continue;
              if (!c.up || c.delay > 0) return null;
              const cs = chainStart(pile);
              if (i < cs) return { bad: true };
              return { group: pile.slice(i) };
            }
          }
          return null;
        },
        pileAt(pt) {
          for (let t = 0; t < 10; t++) {
            const pile = P[t], last = pile[pile.length - 1], bottom = last ? last.ty + CH : TOP + CH;
            if (inR(pt, colX(t) - GAP / 2, TOP, CW + GAP, Math.max(CH, bottom - TOP))) return t;
          }
          return -1;
        },
        drops: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        zone(p) { const last = P[p][P[p].length - 1], bottom = last ? last.ty + CH : TOP + CH; return { x: colX(p), y: TOP, w: CW, h: bottom - TOP }; },
        can(group, p) {
          if (p < 0 || p > 9) return false;
          const top = P[p][P[p].length - 1], lead = group[0];
          return !top || (top.up && top.r === lead.r + 1);
        },
        drop(group, p) { move(group[0].p, group[0].i, p); },
        tap: autoMove
      };

      segBtns.forEach(b => b.addEventListener('click', () => {
        const n = +b.dataset.d;
        if (n === pref) return;
        pref = n; segBtns.forEach(x => x.classList.toggle('on', +x.dataset.d === n));
        const rec = api.load() || {}; rec.suits = n; api.save(rec);
        if (!moves || won) deal(); else api.toast(`${n} suit${n > 1 ? 's' : ''} starts with the next deal`);
      }));
      q('[data-u]').addEventListener('click', undo);
      q('[data-h]').addEventListener('click', hint);
      confirmNew(api, newBtn, () => moves > 0 && !won, deal);
      api.on(window, 'keydown', e => {
        if (T.cascade && !T.cascade.done) { T.cascade.finish(); return; }
        if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        if (e.code === 'Space' || e.code === 'KeyD') { e.preventDefault(); dealRow(); }
        else if (e.code === 'KeyH') hint();
        else if (e.code === 'KeyZ' || e.code === 'KeyU' || e.code === 'Backspace') { e.preventDefault(); undo(); }
      });

      segBtns.forEach(x => x.classList.toggle('on', +x.dataset.d === pref));
      T.start();
      deal();
      root._sp = { T, P, get moves() { return moves; }, listMoves, hint, dealRow, undo, deal, win: () => win(), get won() { return won; } };
    }
  });

  function fcDeal(n) {
    let seed = n >>> 0;
    const rnd = () => { seed = (Math.imul(seed, 214013) + 2531011) >>> 0; return (seed >>> 16) & 0x7fff; };
    const pool = Array.from({ length: 52 }, (_, i) => i), out = [];
    let left = 52;
    for (let k = 0; k < 52; k++) {
      const j = rnd() % left;
      const v = pool[j];
      out.push((3 - (v & 3)) * 13 + (v >> 2));
      pool[j] = pool[--left];
    }
    return out;
  }

  function fcSolver(cols0, cells0, found0) {
    const rk = c => c % 13 + 1, su = c => (c / 13) | 0;
    const csOf = col => String.fromCharCode.apply(null, col.map(c => 48 + c));
    const seen = new Set(), heap = [];
    const push = (f, st) => {
      heap.push([f, st]);
      let i = heap.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
        }
      }
      return top;
    };
    const keyOf = st => st.cs.slice().sort().join('|') + '#' + st.cells.slice().sort().join(',') + '#' + st.found.join(',');
    const stack = (c, top) => RED[su(c)] !== RED[su(top)] && rk(c) === rk(top) - 1;
    const heur = st => {
      const { cols, cells, found } = st;
      let h = (52 - found[0] - found[1] - found[2] - found[3]) * 2;
      for (let s = 0; s < 4; s++) {
        if (found[s] >= 13) continue;
        const code = s * 13 + found[s];
        if (cells.indexOf(code) >= 0) { h += 1; continue; }
        for (const col of cols) { const ix = col.indexOf(code); if (ix >= 0) { h += (col.length - 1 - ix) * 2; break; } }
      }
      for (const col of cols) for (let i = 0; i + 1 < col.length; i++) if (!stack(col[i + 1], col[i])) h += 1;
      for (const c of cells) if (c >= 0) h += 1;
      return h;
    };
    const trivial = st => {
      for (const col of st.cols) for (let i = 0; i + 1 < col.length; i++) if (rk(col[i + 1]) > rk(col[i])) return false;
      return true;
    };
    const safe = (c, found) => {
      const r = rk(c);
      if (r <= 2) return true;
      const s = su(c), o = RED[s] ? [0, 3] : [1, 2];
      return found[o[0]] >= r - 1 && found[o[1]] >= r - 1;
    };
    const child = (st, mv, cols, cells, found, cs) => ({ cols, cells, found, cs, g: st.g + 1, par: st, mv });
    function expand(st) {
      const { cols, cells, found, cs } = st, out = [];
      const srcs = [];
      for (let i = 0; i < 8; i++) if (cols[i].length) srcs.push({ k: 0, i, c: cols[i][cols[i].length - 1] });
      for (let i = 0; i < 4; i++) if (cells[i] >= 0) srcs.push({ k: 1, i, c: cells[i] });
      const apply = (sr, dest, di) => {
        const nf = found.slice(), nk = cells.slice(), nc = cols.slice(), ncs = cs.slice();
        if (sr.k === 0) { nc[sr.i] = cols[sr.i].slice(0, -1); ncs[sr.i] = csOf(nc[sr.i]); } else nk[sr.i] = -1;
        if (dest === 0) nf[su(sr.c)]++;
        else if (dest === 1) { nc[di] = cols[di].concat(sr.c); ncs[di] = csOf(nc[di]); }
        else nk[di] = sr.c;
        return child(st, { a: sr.k, ai: sr.i, b: dest, bi: di, c: sr.c }, nc, nk, nf, ncs);
      };
      for (const sr of srcs) if (rk(sr.c) === found[su(sr.c)] + 1) {
        const ch = apply(sr, 0, su(sr.c));
        if (safe(sr.c, found)) return [ch];
        out.push(ch);
      }
      for (const sr of srcs) {
        let emptyDone = false;
        for (let j = 0; j < 8; j++) {
          if (sr.k === 0 && j === sr.i) continue;
          if (cols[j].length) { if (stack(sr.c, cols[j][cols[j].length - 1])) out.push(apply(sr, 1, j)); }
          else if (!emptyDone && (sr.k === 1 || cols[sr.i].length > 1)) { out.push(apply(sr, 1, j)); emptyDone = true; }
        }
      }
      const ec = cells.indexOf(-1);
      if (ec >= 0) for (const sr of srcs) if (sr.k === 0) out.push(apply(sr, 2, ec));
      return out;
    }
    const root = { cols: cols0.map(c => c.slice()), cells: cells0.slice(), found: found0.slice(), g: 0, par: null, mv: null };
    root.cs = root.cols.map(csOf);
    push(heur(root), root); seen.add(keyOf(root));
    let nodes = 0;
    return {
      get nodes() { return nodes; },
      run(ms, cap) {
        const end = performance.now() + ms;
        while (heap.length && nodes < cap) {
          if ((nodes & 63) === 0 && performance.now() > end) return null;
          const st = pop()[1];
          nodes++;
          if (st.found[0] + st.found[1] + st.found[2] + st.found[3] === 52 || trivial(st)) {
            let a = st;
            if (!a.par) return { path: [] };
            while (a.par.par) a = a.par;
            return { path: [a.mv], first: a.mv };
          }
          for (const ch of expand(st)) {
            const k = keyOf(ch);
            if (seen.has(k)) continue;
            seen.add(k);
            push(heur(ch) + ch.g * .35, ch);
          }
        }
        return heap.length ? null : false;
      }
    };
  }

  Ameplay.register({
    id: 'freecell',
    title: 'FreeCell',
    category: 'Board',
    better: 'low',
    format: mmss,
    width: 960,
    blurb: 'Every card is face up. Free cells, careful planning, 32,000 numbered deals.',
    help: 'Drag cards or runs · tap or double-click to auto-move · click a card then its destination · <kbd>H</kbd> hint · <kbd>Z</kbd> undo · type a deal number to replay any of 1 to 32000',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="11" height="15" rx="2.5" opacity=".4"/><rect x="19" y="10" width="11" height="15" rx="2.5" opacity=".4"/><rect x="34" y="10" width="11" height="15" rx="2.5" fill="currentColor" opacity=".25"/><rect x="47" y="10" width="11" height="15" rx="2.5" fill="currentColor" opacity=".25"/><rect x="8" y="32" width="14" height="22" rx="3"/><rect x="26" y="32" width="14" height="22" rx="3" fill="currentColor" opacity=".25"/><rect x="44" y="32" width="14" height="22" rx="3"/></svg>',
    css: solCss('freecell') + `
.gm-freecell .sol-bar .sol-in{display:inline-flex;gap:6px;align-items:center}
`,
    mount(root, api) {
      const narrow = root.clientWidth < 620;
      const W = narrow ? 440 : 960, H = narrow ? 640 : 700;
      const CW = narrow ? 48 : 100, CH = Math.round(CW * 1.4);
      const MX = narrow ? 6 : 30, GAP = (W - 2 * MX - 8 * CW) / 7;
      const TOP = narrow ? 10 : 16, TABY = TOP + CH + (narrow ? 12 : 26);
      const FU = narrow ? 21 : 36, MINFU = narrow ? 13 : 17;
      const FOUND = 4, CASC = 8;
      const colX = k => MX + k * (CW + GAP);
      const snd = mkSnd(api);
      const saved = api.load() || {};
      let autoOn = saved.auto !== false;

      root.innerHTML = `<div class="sol-bar">
        <div class="g-stat"><span class="k">Deal</span><span class="v" data-n>#1</span></div>
        <div class="g-stat"><span class="k">Time</span><span class="v" data-t>0:00</span></div>
        <div class="g-stat"><span class="k">Moves</span><span class="v" data-m>0</span></div>
        <div class="sol-in"><input class="sol-num" type="number" inputmode="numeric" min="1" max="32000" placeholder="1-32000" data-in aria-label="Deal number"><button type="button" class="g-btn sm ghost" data-go>Play #</button></div>
        <button type="button" class="sol-tog" data-a title="Send safe cards to the foundations automatically">Auto-move</button>
        <div class="sol-btns"><button type="button" class="g-btn sm ghost" data-h>Hint</button><button type="button" class="g-btn sm ghost" data-u>Undo</button><button type="button" class="g-btn sm ghost" data-r>Restart</button><button type="button" class="g-btn sm" data-new>New deal</button></div>
      </div>`;
      const q = s => root.querySelector(s);
      const nEl = q('[data-n]'), tEl = q('[data-t]'), mEl = q('[data-m]'), inEl = q('[data-in]'), autoBtn = q('[data-a]'), newBtn = q('[data-new]'), goBtn = q('[data-go]');

      const T = table(root, api, {
        W, H, CW, CH, n: 52, back: ['#2f8fb5', '#144f73', '#1a6c96', 3],
        onSecond: s => { tEl.textContent = mmss(s); api.score(s); },
        paint(g, kit) {
          for (let k = 0; k < 8; k++) slotBox(g, colX(k), TOP, CW, CH, kit.R);
          g.fillStyle = 'rgba(255,255,255,.2)';
          for (let s = 0; s < 4; s++) { suitPath(g, s, colX(FOUND + s) + CW / 2, TOP + CH / 2, CW * .4); g.fill(); }
          g.fillStyle = 'rgba(255,255,255,.3)'; g.font = `800 ${narrow ? 9 : 12}px system-ui, sans-serif`; g.textAlign = 'center';
          g.fillText('FREE CELLS', colX(0) + (colX(3) + CW - colX(0)) / 2, TOP + CH + (narrow ? 9 : 16));
          g.fillText('FOUNDATIONS', colX(4) + (colX(7) + CW - colX(4)) / 2, TOP + CH + (narrow ? 9 : 16));
        }
      });
      const P = T.piles = Array.from({ length: 16 }, () => []);
      const cards = T.cards;
      cards.forEach((c, i) => { c.s = (i / 13) | 0; c.r = i % 13 + 1; });
      let dealNo = 1, moves = 0, won = false, mode = null, autoT = 0, counted = false, thinking = 0;

      function hud() { mEl.textContent = moves; nEl.textContent = '#' + dealNo; }
      function layout() {
        for (let k = 0; k < 4; k++) P[k].forEach((c, i) => { c.p = k; c.i = i; c.tx = colX(k); c.ty = TOP; });
        for (let s = 0; s < 4; s++) P[FOUND + s].forEach((c, i) => { c.p = FOUND + s; c.i = i; c.tx = colX(FOUND + s); c.ty = TOP; });
        for (let k = 0; k < 8; k++) {
          const pile = P[CASC + k], n = pile.length, avail = H - 8 - TABY - CH;
          const fu = n > 1 && (n - 1) * FU > avail ? Math.max(MINFU, avail / (n - 1)) : FU;
          pile.forEach((c, i) => { c.p = CASC + k; c.i = i; c.tx = colX(k); c.ty = TABY + i * fu; });
        }
      }
      function deal(no) {
        dealNo = no; T.reset(); moves = 0; won = false; mode = null; counted = false; thinking++;
        for (const p of P) p.length = 0;
        const order = fcDeal(no);
        let seq = 0;
        order.forEach((code, i) => {
          const c = cards[code]; c.up = true; c.f = 1; c.drag = false; c.x = W / 2 - CW / 2; c.y = -CH; c.delay = .05 + seq++ * .026;
          P[CASC + i % 8].push(c);
        });
        layout(); hud(); tEl.textContent = '0:00'; api.score(0);
        inEl.value = '';
        snd.deal(8);
        if (no === 11982) api.toast('Deal #11982 is the famous unwinnable one');
      }
      const newNo = () => { let n; do n = 1 + Math.floor(Math.random() * 32000); while (n === 11982 || n === dealNo); return n; };

      const free = () => { let n = 0; for (let k = 0; k < 4; k++) if (!P[k].length) n++; return n; };
      const emptyCols = () => { let n = 0; for (let k = 0; k < 8; k++) if (!P[CASC + k].length) n++; return n; };
      const maxMove = toEmpty => (free() + 1) * Math.pow(2, emptyCols() - (toEmpty ? 1 : 0));
      const seqOK = g => { for (let i = 0; i + 1 < g.length; i++) if (RED[g[i].s] === RED[g[i + 1].s] || g[i].r !== g[i + 1].r + 1) return false; return true; };
      const homeCount = () => P[4].length + P[5].length + P[6].length + P[7].length;
      const topOf = p => P[p][P[p].length - 1];

      function canTo(group, p) {
        const lead = group[0];
        if (p === lead.p) return false;
        if (p < 4) return group.length === 1 && !P[p].length;
        if (p < CASC) return group.length === 1 && lead.s === p - FOUND && lead.r === P[p].length + 1;
        const top = topOf(p);
        if (!top) return group.length <= maxMove(true);
        return RED[top.s] !== RED[lead.s] && top.r === lead.r + 1 && group.length <= maxMove(false);
      }
      function move(group, p, auto) {
        if (!auto) T.snapshot(moves);
        thinking++;
        if (!won) T.running = true;
        if (!counted) { counted = true; const r = api.load() || {}; r.played = (r.played || 0) + 1; api.save(r); }
        const from = group[0].p, i = group[0].i;
        const grp = P[from].splice(i);
        P[p].push(...grp);
        if (!auto) moves++;
        if (p >= FOUND && p < CASC) snd.ding(P[p].length % 6); else snd.card();
        settle();
      }
      function safeToHome(c) {
        if (c.r <= 2) return true;
        const o = RED[c.s] ? [0, 3] : [1, 2];
        return P[FOUND + o[0]].length >= c.r - 1 && P[FOUND + o[1]].length >= c.r - 1;
      }
      function nextHome(onlySafe) {
        let best = null;
        const tops = [];
        for (let k = 0; k < 4; k++) if (P[k].length) tops.push(P[k][0]);
        for (let k = 0; k < 8; k++) if (P[CASC + k].length) tops.push(topOf(CASC + k));
        for (const c of tops) if (c.r === P[FOUND + c.s].length + 1 && (!onlySafe || safeToHome(c)) && (!best || c.r < best.r)) best = c;
        return best;
      }
      function trivial() {
        for (let k = 0; k < 8; k++) { const p = P[CASC + k]; for (let i = 0; i + 1 < p.length; i++) if (p[i + 1].r > p[i].r) return false; }
        return true;
      }
      function hasMoves() {
        const tops = [];
        for (let k = 0; k < 4; k++) if (P[k].length) tops.push(P[k][0]);
        for (let k = 0; k < 8; k++) if (P[CASC + k].length) tops.push(topOf(CASC + k));
        if (free() > 0 && tops.some(c => c.p >= CASC)) return true;
        for (const c of tops) {
          if (c.r === P[FOUND + c.s].length + 1) return true;
          for (let k = 0; k < 8; k++) {
            const p = CASC + k;
            if (p === c.p) continue;
            const top = topOf(p);
            if (top ? RED[top.s] !== RED[c.s] && top.r === c.r + 1 : (c.p < 4 || P[c.p].length > 1)) return true;
          }
        }
        return false;
      }
      function settle() {
        layout(); hud();
        if (homeCount() === 52) return win();
        if (trivial()) mode = 'all'; else if (autoOn) mode = 'safe'; else mode = null;
        autoT = mode ? .2 : 0;
        if (!mode) checkStuck();
      }
      function checkStuck() {
        if (won || hasMoves()) return;
        T.running = false; snd.nope();
        api.overlay({
          kicker: 'No moves left', title: 'Stuck!', text: 'Every card is blocked. Undo a few moves, or try this deal again.',
          button: 'Undo', onAction: undo, secondary: 'Restart', onSecondary: () => deal(dealNo)
        });
      }
      function autoStep() {
        const c = nextHome(mode === 'safe');
        if (!c) { mode = null; checkStuck(); return; }
        move([c], FOUND + c.s, true);
      }
      function undo() {
        if (!T.hist.length || won || T.cascade) return;
        api.hideOverlay(); mode = null; thinking++;
        moves = T.undo(); layout(); hud(); snd.card();
        if (!won) T.running = true;
      }

      function stateForSolver() {
        return [Array.from({ length: 8 }, (_, k) => P[CASC + k].map(c => c.id)), [0, 1, 2, 3].map(k => P[k].length ? P[k][0].id : -1), [0, 1, 2, 3].map(s => P[FOUND + s].length)];
      }
      function showHint(mv) {
        const c = cards[mv.c];
        let d;
        if (mv.b === 0) d = { tx: colX(FOUND + c.s), ty: TOP };
        else if (mv.b === 2) d = { tx: colX(mv.bi), ty: TOP };
        else d = P[CASC + mv.bi].length ? topOf(CASC + mv.bi) : { tx: colX(mv.bi), ty: TABY };
        T.hintG = { s: c, d, t: 2.8 };
        snd.pick();
      }
      function hint() {
        if (won || T.cascade || T.drag || mode === 'all') return;
        const tok = ++thinking, [cols, cells, found] = stateForSolver(), sv = fcSolver(cols, cells, found);
        let shownMsg = false;
        const tick = () => {
          if (tok !== thinking || !api.alive) return;
          const r = sv.run(24, 160000);
          if (r === null) {
            if (!shownMsg && sv.nodes > 4000) { shownMsg = true; api.toast('Thinking…'); }
            if (sv.nodes >= 160000) return fallback();
            api.timeout(tick, 8); return;
          }
          if (r && r.first) return showHint(r.first);
          if (r) { const c = nextHome(false); if (c) return showHint({ c: c.id, b: 0, bi: c.s }); }
          api.toast('No winning line from here · undo a few moves');
        };
        const fallback = () => {
          const c = nextHome(false);
          if (c) return showHint({ c: c.id, b: 0, bi: c.s });
          api.toast('No clear hint · try undoing a few moves');
        };
        tick();
      }
      function autoMove(group) {
        const lead = group[0];
        if (group.length === 1 && canTo(group, FOUND + lead.s)) { move(group, FOUND + lead.s); return true; }
        let empty = -1, best = -1;
        for (let k = 0; k < 8; k++) {
          const p = CASC + k;
          if (!canTo(group, p)) continue;
          if (P[p].length) { if (best < 0 || P[p].length > P[best].length) best = p; }
          else if (empty < 0 && !(lead.p >= CASC && lead.i === 0)) empty = p;
        }
        if (best >= 0) { move(group, best); return true; }
        if (empty >= 0) { move(group, empty); return true; }
        if (group.length === 1 && lead.p >= CASC) for (let k = 0; k < 4; k++) if (!P[k].length) { move(group, k); return true; }
        return false;
      }

      function win() {
        won = true; T.running = false; mode = null;
        const t = Math.max(1, Math.round(T.secs));
        tEl.textContent = mmss(t); api.score(t);
        const isBest = api.submit(t);
        const r = api.load() || {};
        r.won = (r.won || 0) + 1; api.save(r);
        snd.fanfare();
        T.celebrate(() => {
          const order = [];
          for (let k = 13; k >= 1; k--) for (let s = 0; s < 4; s++) { const c = P[FOUND + s][k - 1]; if (c) order.push(c); }
          return order;
        }, () => api.overlay({
          kicker: isBest ? 'New best!' : 'Solved',
          title: 'Deal #' + dealNo + ' complete',
          stats: [['Time', mmss(t)], ['Moves', moves], ['Won', r.won + ' / ' + (r.played || r.won)], ['Best', api.best != null ? mmss(api.best) : '—']],
          button: 'Next deal', onAction: () => deal(newNo()), secondary: 'Replay', onSecondary: () => deal(dealNo)
        }));
      }

      const inR = (pt, x, y, w, h) => pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
      T.G = {
        busy: () => won || T.cascade || mode === 'all',
        frame(dt) {
          if (mode && !won && !T.drag) { autoT -= dt; if (autoT <= 0) { autoT = .13; autoStep(); } }
        },
        grab(pt) {
          for (let k = 0; k < 4; k++) if (P[k].length && inR(pt, colX(k), TOP, CW, CH)) return { group: [P[k][0]] };
          for (let k = 0; k < 8; k++) {
            const pile = P[CASC + k];
            for (let i = pile.length - 1; i >= 0; i--) {
              const c = pile[i];
              if (c.delay > 0 || !inR(pt, c.tx, c.ty, CW, CH)) continue;
              const g = pile.slice(i);
              return seqOK(g) ? { group: g } : { bad: true };
            }
          }
          return null;
        },
        pileAt(pt) {
          for (let k = 0; k < 4; k++) if (inR(pt, colX(k) - GAP / 2, TOP, CW + GAP, CH)) return k;
          if (inR(pt, colX(FOUND) - GAP / 2, TOP, colX(7) + CW + GAP - colX(FOUND), CH)) return FOUND + (T.sel ? T.sel.group[0].s : 0);
          for (let k = 0; k < 8; k++) {
            const pile = P[CASC + k], last = pile[pile.length - 1], bottom = last ? last.ty + CH : TABY + CH;
            if (inR(pt, colX(k) - GAP / 2, TABY, CW + GAP, Math.max(CH, bottom - TABY))) return CASC + k;
          }
          return -1;
        },
        drops: group => [0, 1, 2, 3, FOUND + group[0].s, 8, 9, 10, 11, 12, 13, 14, 15],
        zone(p) {
          if (p < 4) return { x: colX(p), y: TOP, w: CW, h: CH };
          if (p < CASC) return { x: colX(FOUND), y: TOP, w: colX(7) + CW - colX(FOUND), h: CH };
          const pile = P[p], last = pile[pile.length - 1], bottom = last ? last.ty + CH : TABY + CH;
          return { x: colX(p - CASC), y: TABY, w: CW, h: bottom - TABY };
        },
        can: canTo,
        drop(group, p) { move(group, p); },
        dropFail(group) {
          const lead = group[0];
          if (group.length < 2) return;
          for (let k = 0; k < 8; k++) {
            const p = CASC + k;
            if (p === lead.p) continue;
            const z = T.G.zone(p), ox = Math.min(lead.x + CW, z.x + z.w) - Math.max(lead.x, z.x);
            if (ox < CW * .35) continue;
            const top = topOf(p);
            if (top ? RED[top.s] !== RED[lead.s] && top.r === lead.r + 1 : true) {
              const m = maxMove(!top);
              api.toast(m === 1 ? 'Only one card at a time · free a cell or column' : `You can move ${m} cards at once here`);
              snd.nope(); return;
            }
          }
        },
        tap: autoMove
      };

      const setAuto = v => { autoOn = v; autoBtn.classList.toggle('on', v); const r = api.load() || {}; r.auto = v; api.save(r); };
      autoBtn.addEventListener('click', () => { setAuto(!autoOn); if (autoOn && !won && !mode) { mode = 'safe'; autoT = .1; } });
      q('[data-u]').addEventListener('click', undo);
      q('[data-h]').addEventListener('click', hint);
      const active = () => moves > 0 && !won;
      confirmNew(api, q('[data-r]'), active, () => deal(dealNo));
      confirmNew(api, newBtn, active, () => deal(newNo()));
      confirmNew(api, goBtn, active, () => {
        const n = Math.floor(+inEl.value);
        if (n >= 1 && n <= 32000) deal(n); else api.toast('Pick a deal from 1 to 32000');
      });
      inEl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') goBtn.click(); });
      inEl.addEventListener('keyup', e => e.stopPropagation());
      api.on(window, 'keydown', e => {
        if (e.target && e.target.tagName === 'INPUT') return;
        if (T.cascade && !T.cascade.done) { T.cascade.finish(); return; }
        if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        if (e.code === 'KeyH') hint();
        else if (e.code === 'KeyZ' || e.code === 'KeyU' || e.code === 'Backspace') { e.preventDefault(); undo(); }
      });

      setAuto(autoOn);
      T.start();
      const inv = parseInt((location.hash.match(/deal=(\d+)/) || [])[1], 10);
      deal(inv >= 1 && inv <= 32000 ? inv : newNo());
      root._fc = { T, P, deal, hint, undo, cards, get mode() { return mode; }, get won() { return won; }, get moves() { return moves; }, hasMoves, canTo, move, autoMove };
    }
  });

  Ameplay.register({
    id: 'pyramid-solitaire',
    title: 'Pyramid Solitaire',
    category: 'Board',
    width: 960,
    blurb: 'Clear the pyramid by pairing cards that add up to 13. Kings go alone.',
    help: 'Tap a free card, then its partner (pairs make 13, Kings go alone) · or drag one onto the other · click the deck to turn a card · <kbd>Space</kbd> draws · <kbd>H</kbd> hint · <kbd>Z</kbd> undo',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="8" width="14" height="19" rx="2.5"/><rect x="16" y="22" width="14" height="19" rx="2.5" fill="currentColor" opacity=".25"/><rect x="34" y="22" width="14" height="19" rx="2.5" fill="currentColor" opacity=".25"/><rect x="7" y="36" width="14" height="19" rx="2.5"/><rect x="25" y="36" width="14" height="19" rx="2.5"/><rect x="43" y="36" width="14" height="19" rx="2.5"/></svg>',
    css: solCss('pyramid-solitaire') + `
.gm-pyramid-solitaire canvas{background:#2a4d83}
`,
    mount(root, api) {
      const narrow = root.clientWidth < 620;
      const CW = narrow ? 54 : 88, CH = Math.round(CW * 1.4);
      const GX = narrow ? 3 : 8, RS = narrow ? 36 : 60;
      const W = narrow ? 420 : 960, TOP = narrow ? 12 : 14;
      const BY = TOP + 6 * RS + CH + (narrow ? 14 : 16), H = BY + CH + (narrow ? 12 : 14);
      const SX = narrow ? 12 : 34, WX = SX + CW + (narrow ? 12 : 22), RX = W - SX - CW;
      const STOCK = 0, WASTE = 1, GONE = 2, PY = 3;
      const rowX0 = r => W / 2 - ((r + 1) * CW + r * GX) / 2;
      const cellX = (r, i) => rowX0(r) + i * (CW + GX), cellY = r => TOP + r * RS;
      const idx = (r, i) => PY + r * (r + 1) / 2 + i;
      const RC = [];
      for (let r = 0; r < 7; r++) for (let i = 0; i <= r; i++) RC.push([r, i]);
      const snd = mkSnd(api);
      const saved = api.load() || {};
      let pref = [0, 1, 2, 99].includes(saved.redeals) ? saved.redeals : 2, redeals = pref, unl = pref === 99;

      root.innerHTML = `<div class="sol-bar">
        <div class="g-stat"><span class="k">Score</span><span class="v" data-s>0</span></div>
        <div class="g-stat"><span class="k">Time</span><span class="v" data-t>0:00</span></div>
        <div class="g-stat"><span class="k">Left</span><span class="v" data-l>28</span></div>
        <div class="g-stat"><span class="k">Redeals</span><span class="v" data-rd>2</span></div>
        <div class="sol-seg" title="Redeals of the deck"><button type="button" data-d="0">0</button><button type="button" data-d="1">1</button><button type="button" data-d="2">2</button><button type="button" data-d="99">&infin;</button></div>
        <div class="sol-btns"><button type="button" class="g-btn sm ghost" data-h>Hint</button><button type="button" class="g-btn sm ghost" data-u>Undo</button><button type="button" class="g-btn sm" data-n>New deal</button></div>
      </div>`;
      const q = s => root.querySelector(s);
      const tEl = q('[data-t]'), sEl = q('[data-s]'), lEl = q('[data-l]'), dEl = q('[data-rd]'), newBtn = q('[data-n]');
      const segBtns = [...root.querySelectorAll('.sol-seg [data-d]')];

      const T = table(root, api, {
        W, H, CW, CH, n: 52, back: ['#7d54c9', '#3d2270', '#5a38a0', 1],
        onSecond: s => { tEl.textContent = mmss(s); },
        paint(g, kit) {
          const sky = g.createLinearGradient(0, 0, 0, H);
          sky.addColorStop(0, '#3a6bb0'); sky.addColorStop(1, '#1b3566');
          g.fillStyle = sky; g.fillRect(0, 0, W, H);
          g.fillStyle = 'rgba(255,215,120,.07)';
          g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W * .9, H); g.lineTo(W * .1, H); g.closePath(); g.fill();
          for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${(.05 + Math.random() * .12).toFixed(2)})`; g.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4); }
          slotBox(g, SX, BY, CW, CH, kit.R); slotBox(g, WX, BY, CW, CH, kit.R); slotBox(g, RX, BY, CW, CH, kit.R);
          recycleMark(g, SX + CW / 2, BY + CH / 2, CW * .2, CW * .05);
          g.save(); g.fillStyle = 'rgba(255,255,255,.35)'; g.font = `800 ${narrow ? 9 : 12}px system-ui, sans-serif`; g.textAlign = 'center';
          g.fillText('DECK', SX + CW / 2, BY - 5); g.fillText('WASTE', WX + CW / 2, BY - 5); g.fillText('CLEARED', RX + CW / 2, BY - 5);
          g.restore();
        }
      });
      const P = T.piles = Array.from({ length: PY + 28 }, () => []);
      const cards = T.cards;
      let score = 0, moves = 0, won = false, rowDone = [], dry = 0;

      const free = p => {
        const c = P[p][0];
        if (!c) return false;
        if (p === WASTE) return false;
        const k = p - PY;
        let r = 0; while ((r + 1) * (r + 2) / 2 <= k) r++;
        if (r === 6) return true;
        const i = k - r * (r + 1) / 2;
        return !P[idx(r + 1, i)].length && !P[idx(r + 1, i + 1)].length;
      };
      const freeCards = () => {
        const out = [];
        for (let p = PY; p < PY + 28; p++) if (P[p].length && free(p)) out.push(P[p][0]);
        const w = P[WASTE];
        if (w.length) out.push(w[w.length - 1]);
        return out;
      };
      const isFree = c => c.p === WASTE ? P[WASTE][P[WASTE].length - 1] === c : c.p >= PY && free(c.p);
      const left = () => { let n = 0; for (let p = PY; p < PY + 28; p++) n += P[p].length; return n; };
      const rowsEmpty = () => { const out = []; for (let r = 0; r < 7; r++) { let e = true; for (let i = 0; i <= r; i++) if (P[idx(r, i)].length) e = false; out.push(e); } return out; };

      function hud() {
        sEl.textContent = score; lEl.textContent = left();
        dEl.textContent = unl ? '∞' : redeals;
        api.score(score);
      }
      function layout() {
        for (let k = 0; k < 28; k++) { const [r, i] = RC[k], c = P[PY + k][0]; if (c) { c.p = PY + k; c.i = 0; c.tx = cellX(r, i); c.ty = cellY(r); } }
        P[STOCK].forEach((c, i) => { c.p = STOCK; c.i = i; c.tx = SX; c.ty = BY - Math.floor(i / 6) * 1.2; });
        P[WASTE].forEach((c, i) => { c.p = WASTE; c.i = i; c.tx = WX; c.ty = BY; });
        P[GONE].forEach((c, i) => { c.p = GONE; c.i = i; c.tx = RX; c.ty = BY - Math.min(i, 24) * .5; });
      }
      function deal() {
        T.reset(); score = 0; moves = 0; dry = 0; won = false; redeals = pref; unl = pref === 99; rowDone = rowsEmpty();
        for (const p of P) p.length = 0;
        cards.forEach((c, i) => { c.s = (i / 13) | 0; c.r = i % 13 + 1; c.up = false; c.f = 0; c.drag = false; c.x = SX; c.y = BY; });
        const deck = shuffle(cards.slice());
        let seq = 0;
        for (let k = 0; k < 28; k++) { const c = deck[k]; c.up = true; c.delay = .1 + seq++ * .035; P[PY + k].push(c); }
        for (let k = 28; k < 52; k++) P[STOCK].push(deck[k]);
        rowDone = rowsEmpty();
        layout(); hud(); tEl.textContent = '0:00';
        snd.deal(7);
      }
      const snap = () => T.snapshot({ score, moves, redeals, rowDone: rowDone.slice(), dry });
      const begin = () => { if (!won) T.running = true; };

      function remove(list) {
        snap(); begin();
        list.forEach((c, k) => {
          const pile = P[c.p]; pile.splice(pile.indexOf(c), 1);
          c.up = true; c.delay = k * .08; P[GONE].push(c);
        });
        moves++; dry = 0; score += list.length === 2 ? 20 : 10;
        const now = rowsEmpty();
        for (let r = 0; r < 7; r++) if (now[r] && !rowDone[r]) { score += 10 * (7 - r); api.toast(`Row cleared · +${10 * (7 - r)}`); }
        rowDone = now;
        snd.card(); api.timeout(() => snd.ding(list.length), 140);
        layout(); hud();
        if (!left()) return win();
        checkStuck();
      }
      function draw() {
        if (won || T.cascade || T.drag) return;
        const s = P[STOCK], w = P[WASTE];
        if (s.length) {
          snap(); begin();
          const c = s.pop(); c.up = true; c.delay = 0; w.push(c);
          snd.flip(); T.hintG = null;
        } else if (w.length && (unl || redeals > 0)) {
          snap(); begin();
          while (w.length) { const c = w.pop(); c.up = false; s.push(c); }
          if (!unl) redeals--;
          snd.shuffle();
        } else { api.sfx('bad'); api.toast(w.length ? 'No redeals left' : 'The deck is empty'); return; }
        dry = pairs().length ? 0 : dry + 1;
        layout(); hud(); checkStuck();
      }
      function undo() {
        if (!T.hist.length || won || T.cascade) return;
        api.hideOverlay(); begin();
        const x = T.undo(); score = x.score; moves = x.moves; redeals = x.redeals; rowDone = x.rowDone; dry = x.dry;
        layout(); hud(); snd.card();
      }
      function pairs() {
        const fc = freeCards(), out = [];
        for (let a = 0; a < fc.length; a++) {
          if (fc[a].r === 13) out.push([fc[a]]);
          for (let b = a + 1; b < fc.length; b++) if (fc[a].r + fc[b].r === 13) out.push([fc[a], fc[b]]);
        }
        return out;
      }
      function checkStuck() {
        if (won) return;
        const canDraw = (P[STOCK].length || (P[WASTE].length && (unl || redeals > 0))) && dry < P[STOCK].length + P[WASTE].length;
        if (canDraw || pairs().length) return;
        T.running = false; snd.nope();
        api.overlay({
          kicker: 'No moves left', title: 'Pyramid stands', text: `${left()} cards remain in the pyramid.`,
          stats: [['Score', score], ['Time', mmss(Math.round(T.secs))]],
          button: 'Undo', onAction: undo, secondary: 'New deal', onSecondary: deal
        });
      }
      function hint() {
        if (won || T.cascade || T.drag) return;
        const ps = pairs();
        const rank = p => (p.length === 2 ? 10 : 6) + p.reduce((a, c) => a + (c.p >= PY ? 3 + RC[c.p - PY][0] * .1 : 0), 0);
        ps.sort((a, b) => rank(b) - rank(a));
        if (ps.length) { T.hintG = { s: ps[0][0], d: ps[0][1] || null, t: 2.6 }; snd.pick(); return; }
        if (P[STOCK].length) { T.hintG = { s: { tx: SX, ty: BY }, d: null, t: 2.4 }; api.toast('Turn a card from the deck'); return; }
        if (P[WASTE].length && (unl || redeals > 0)) { T.hintG = { s: { tx: SX, ty: BY }, d: null, t: 2.4 }; api.toast('Redeal the deck'); return; }
        api.toast('No moves left · undo or deal again');
      }
      function tap(group) {
        const lead = group[0];
        if (lead.r === 13) { remove([lead]); return true; }
        const part = freeCards().filter(c => c !== lead && c.r + lead.r === 13);
        if (part.length === 1) { remove([lead, part[0]]); return true; }
        return false;
      }

      function win() {
        won = true; T.running = false;
        const t = Math.max(1, Math.round(T.secs));
        const bonus = 500 + (P[STOCK].length + P[WASTE].length) * 10 + Math.max(0, 300 - t);
        score += bonus; hud(); tEl.textContent = mmss(t);
        const isBest = api.submit(score);
        snd.fanfare();
        T.celebrate(() => P[GONE].slice().reverse(), () => api.overlay({
          kicker: isBest ? 'New best!' : 'Cleared',
          title: 'Pyramid cleared!',
          stats: [['Score', score], ['Time', mmss(t)], ['Bonus', '+' + bonus], ['Best', api.best != null ? api.best : '—']],
          button: 'Play again', onAction: deal
        }));
      }

      const inR = (pt, x, y, w, h) => pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
      T.G = {
        busy: () => won || T.cascade,
        grab(pt) {
          if (inR(pt, SX, BY - 6, CW, CH + 6)) return { click: draw };
          const w = P[WASTE];
          if (w.length && inR(pt, WX, BY, CW, CH)) return { group: [w[w.length - 1]] };
          for (let k = 27; k >= 0; k--) {
            const c = P[PY + k][0];
            if (c && c.delay <= 0 && inR(pt, c.tx, c.ty, CW, CH)) return free(PY + k) ? { group: [c] } : { bad: true };
          }
          return null;
        },
        pileAt(pt) {
          const sel = T.sel && T.sel.group[0];
          if (sel && sel.r === 13 && inR(pt, RX, BY, CW, CH)) return GONE;
          const w = P[WASTE];
          if (w.length && inR(pt, WX, BY, CW, CH)) return WASTE;
          for (let k = 27; k >= 0; k--) { const c = P[PY + k][0]; if (c && inR(pt, c.tx, c.ty, CW, CH)) return PY + k; }
          return -1;
        },
        drops: () => { const a = [GONE, WASTE]; for (let k = 0; k < 28; k++) a.push(PY + k); return a; },
        zone(p) {
          if (p === GONE) return { x: RX, y: BY, w: CW, h: CH };
          if (p === WASTE) return { x: WX, y: BY, w: CW, h: CH };
          const [r, i] = RC[p - PY]; return { x: cellX(r, i), y: cellY(r), w: CW, h: CH };
        },
        can(group, p) {
          const lead = group[0];
          if (p === GONE) return lead.r === 13;
          if (p === lead.p) return false;
          const tg = p === WASTE ? P[WASTE][P[WASTE].length - 1] : P[p][0];
          return !!tg && tg !== lead && isFree(tg) && tg.r + lead.r === 13;
        },
        drop(group, p) {
          if (p === GONE) return remove([group[0]]);
          const tg = p === WASTE ? P[WASTE][P[WASTE].length - 1] : P[p][0];
          remove([group[0], tg]);
        },
        dropFail() {},
        instant: g => g[0].r === 13,
        tap
      };

      segBtns.forEach(b => b.addEventListener('click', () => {
        const n = +b.dataset.d;
        if (n === pref) return;
        pref = n; segBtns.forEach(x => x.classList.toggle('on', +x.dataset.d === n));
        api.save({ redeals: n });
        if (!moves || won) deal(); else api.toast('Redeals change with the next deal');
      }));
      q('[data-u]').addEventListener('click', undo);
      q('[data-h]').addEventListener('click', hint);
      confirmNew(api, newBtn, () => moves > 0 && !won, deal);
      api.on(window, 'keydown', e => {
        if (T.cascade && !T.cascade.done) { T.cascade.finish(); return; }
        if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        if (e.code === 'Space' || e.code === 'KeyD') { e.preventDefault(); draw(); }
        else if (e.code === 'KeyH') hint();
        else if (e.code === 'KeyZ' || e.code === 'KeyU' || e.code === 'Backspace') { e.preventDefault(); undo(); }
      });

      segBtns.forEach(x => x.classList.toggle('on', +x.dataset.d === pref));
      T.start();
      deal();
      root._py = { T, P, deal, hint, undo, draw, pairs, remove, freeCards, get won() { return won; }, get redeals() { return redeals; }, get score() { return score; } };
    }
  });

  const cbR = f => f % 13 + 1, cbS = f => (f / 13) | 0, cbV = f => Math.min(f % 13 + 1, 10);

  function cbCount(hand, st, crib) {
    const all = hand.concat(st), R = all.map(cbR), S = all.map(cbS), V = all.map(cbV), items = [];
    for (let m = 1; m < 32; m++) {
      let sum = 0; const ix = [];
      for (let i = 0; i < 5; i++) if (m >> i & 1) { sum += V[i]; ix.push(i); }
      if (sum === 15) items.push({ pts: 2, label: 'Fifteen', ix });
    }
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (R[i] === R[j]) items.push({ pts: 2, label: 'Pair', ix: [i, j] });
    for (let L = 5; L >= 3; L--) {
      let found = false;
      for (let m = 1; m < 32; m++) {
        const ix = [];
        for (let i = 0; i < 5; i++) if (m >> i & 1) ix.push(i);
        if (ix.length !== L) continue;
        const rs = ix.map(i => R[i]).sort((a, b) => a - b);
        let ok = true;
        for (let i = 1; i < L; i++) if (rs[i] !== rs[i - 1] + 1) { ok = false; break; }
        if (ok) { items.push({ pts: L, label: 'Run of ' + L, ix }); found = true; }
      }
      if (found) break;
    }
    if (S[0] === S[1] && S[1] === S[2] && S[2] === S[3]) {
      if (S[4] === S[0]) items.push({ pts: 5, label: 'Flush of 5', ix: [0, 1, 2, 3, 4] });
      else if (!crib) items.push({ pts: 4, label: 'Flush', ix: [0, 1, 2, 3] });
    }
    for (let i = 0; i < 4; i++) if (R[i] === 11 && S[i] === S[4]) items.push({ pts: 1, label: 'Nobs', ix: [i, 4] });
    let total = 0;
    for (const it of items) total += it.pts;
    return { total, items };
  }

  function cbPeg(seq, count) {
    const out = [];
    if (count === 15) out.push(['Fifteen', 2, -1]);
    if (count === 31) out.push(['Thirty-one', 2, -1]);
    const last = seq[seq.length - 1];
    let n = 1;
    for (let i = seq.length - 2; i >= 0 && seq[i] === last; i--) n++;
    if (n === 2) out.push(['Pair', 2, 2]); else if (n === 3) out.push(['Pair royal', 6, 3]); else if (n === 4) out.push(['Double pair royal', 12, 4]);
    for (let L = Math.min(seq.length, 7); L >= 3; L--) {
      const sl = seq.slice(-L).sort((a, b) => a - b);
      let ok = true;
      for (let i = 1; i < L; i++) if (sl[i] !== sl[i - 1] + 1) { ok = false; break; }
      if (ok) { out.push(['Run of ' + L, L, L]); break; }
    }
    return out;
  }
  const cbPegTotal = (seq, count) => cbPeg(seq, count).reduce((a, x) => a + x[1], 0);

  function cbEngine(opt) {
    const S = { phase: 'new', dealer: 0, hn: 0, scores: [0, 0], target: opt.target || 121, over: null };
    let ev = [];
    const E = e => ev.push(e);
    const face = k => S.deck[k];
    const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    function award(seat, pts, why, ks, i) {
      if (S.phase === 'over' || pts <= 0) return S.phase === 'over';
      S.scores[seat] = Math.min(S.target, S.scores[seat] + pts);
      E({ t: 'peg', seat, pts, why, ks: ks || [], to: S.scores[seat], i });
      if (S.scores[seat] >= S.target) {
        const l = S.scores[1 - seat];
        S.over = { w: seat, l, skunk: l < 61 ? 2 : l < 91 ? 1 : 0 };
        S.phase = 'over';
        E({ t: 'win', seat, skunk: S.over.skunk });
        return true;
      }
      return false;
    }
    function newHand() {
      S.hn++; S.dealer = 1 - S.dealer;
      S.deck = shuf(Array.from({ length: 52 }, (_, i) => i));
      const pone = 1 - S.dealer;
      S.h = [[], []];
      for (let i = 0; i < 12; i++) S.h[i % 2 === 0 ? pone : S.dealer].push(i);
      S.crib = []; S.keep = [[], []]; S.starter = -1; S.pile = []; S.count = 0; S.past = [[], []]; S.hand = [[], []];
      S.discarded = [false, false]; S.turn = -1; S.cs = null; S.goSaid = false; S.step = -1;
      S.phase = 'discard';
      E({ t: 'deal', dealer: S.dealer });
    }
    const canPlay = p => S.hand[p].some(k => S.count + cbV(face(k)) <= 31);
    function endSeq(last) {
      S.pile.forEach(p => S.past[p.seat].push(p.k));
      S.pile = []; S.count = 0; S.goSaid = false;
      E({ t: 'reset' });
      if (!S.hand[0].length && !S.hand[1].length) return startCount();
      const other = 1 - last;
      S.turn = S.hand[other].length ? other : last;
    }
    function afterPlay(seat) {
      if (S.count === 31) return endSeq(seat);
      const other = 1 - seat;
      if (canPlay(other)) { S.turn = other; return; }
      if (S.hand[other].length && !S.goSaid) { S.goSaid = true; E({ t: 'go', seat: other }); }
      if (canPlay(seat)) { S.turn = seat; return; }
      const lastCard = !S.hand[0].length && !S.hand[1].length;
      if (award(seat, 1, lastCard ? 'Last card' : 'Go', [])) return;
      endSeq(seat);
    }
    function startCount() { S.phase = 'count'; S.step = -1; nextStep(); }
    function scoreItems() {
      const cs = S.cs;
      for (let i = 0; i < cs.items.length; i++) { const it = cs.items[i]; if (award(cs.seat, it.pts, it.label, it.ks, i)) return true; }
      if (!cs.items.length) E({ t: 'nil', seat: cs.seat });
      return false;
    }
    function nextStep() {
      S.step++;
      if (S.step === 3) { newHand(); return; }
      const pone = 1 - S.dealer, seat = S.step === 0 ? pone : S.dealer, what = S.step === 2 ? 'crib' : 'hand';
      const ks = (what === 'crib' ? S.crib : S.keep[seat]).slice();
      const sc = cbCount(ks.map(face), face(S.starter), what === 'crib');
      S.cs = { seat, what, ks, total: sc.total, items: sc.items.map(it => ({ pts: it.pts, label: it.label, ks: it.ix.map(i => i === 4 ? S.starter : ks[i]) })), stage: 'review', revealed: true, claim: null, missed: 0, ready: [false, false] };
      E({ t: 'show', seat, what, ks, auto: opt.counting === 'auto' });
      if (opt.counting !== 'auto') { S.cs.stage = 'claim'; S.cs.revealed = false; return; }
      scoreItems();
    }

    function act(seat, a) {
      if (S.phase === 'over' || !a) return false;
      const pone = 1 - S.dealer;
      if (a.t === 'disc') {
        if (S.phase !== 'discard' || S.discarded[seat] || !Array.isArray(a.ks) || a.ks.length !== 2 || a.ks[0] === a.ks[1]) return false;
        if (!a.ks.every(k => S.h[seat].includes(k))) return false;
        S.h[seat] = S.h[seat].filter(k => !a.ks.includes(k));
        S.keep[seat] = S.h[seat].slice();
        S.crib.push(...a.ks); S.discarded[seat] = true;
        E({ t: 'disc', seat });
        if (S.discarded[0] && S.discarded[1]) { S.phase = 'cut'; S.hand = [S.keep[0].slice(), S.keep[1].slice()]; }
        return true;
      }
      if (a.t === 'cut') {
        if (S.phase !== 'cut' || seat !== pone) return false;
        S.starter = 12 + Math.floor(Math.random() * 40);
        E({ t: 'cut', k: S.starter });
        S.phase = 'play';
        if (cbR(face(S.starter)) === 11 && award(S.dealer, 2, 'His heels', [S.starter])) return true;
        S.turn = pone;
        return true;
      }
      if (a.t === 'play') {
        if (S.phase !== 'play' || S.turn !== seat || !S.hand[seat].includes(a.k)) return false;
        const v = cbV(face(a.k));
        if (S.count + v > 31) return false;
        S.hand[seat].splice(S.hand[seat].indexOf(a.k), 1);
        S.pile.push({ k: a.k, seat }); S.count += v;
        E({ t: 'play', seat, k: a.k, count: S.count });
        const seq = S.pile.map(p => cbR(face(p.k)));
        for (const [lbl, pts, n] of cbPeg(seq, S.count)) {
          if (award(seat, pts, lbl, n < 0 ? S.pile.map(p => p.k) : S.pile.slice(-n).map(p => p.k))) return true;
        }
        afterPlay(seat);
        return true;
      }
      if (S.phase !== 'count' || !S.cs) return false;
      const cs = S.cs;
      if (a.t === 'claim') {
        if (cs.stage !== 'claim' || seat !== cs.seat) return false;
        const n = clamp(Math.floor(+a.n) || 0, 0, 29), got = Math.min(n, cs.total);
        cs.claim = n; cs.revealed = true;
        E({ t: 'claim', seat, n });
        if (award(seat, got, got ? 'Counted ' + got : '', cs.ks)) return true;
        if (opt.counting === 'muggins') { cs.stage = 'mug'; cs.missed = Math.max(0, cs.total - n); }
        else cs.stage = 'review';
        return true;
      }
      if (a.t === 'mug' || a.t === 'pass') {
        if (cs.stage !== 'mug' || seat !== 1 - cs.seat) return false;
        cs.stage = 'review';
        if (a.t === 'mug') {
          if (cs.missed > 0) { E({ t: 'muggins', seat, n: cs.missed }); if (award(seat, cs.missed, 'Muggins', cs.ks)) return true; }
          else E({ t: 'nomug', seat });
        }
        return true;
      }
      if (a.t === 'next') {
        if (cs.stage !== 'review' || cs.ready[seat]) return false;
        cs.ready[seat] = true;
        if (cs.ready[0] && cs.ready[1]) nextStep();
        return true;
      }
      return false;
    }

    function need(seat) {
      const pone = 1 - S.dealer;
      if (S.phase === 'discard') return S.discarded[seat] ? null : 'disc';
      if (S.phase === 'cut') return seat === pone ? 'cut' : null;
      if (S.phase === 'play') return S.turn === seat ? 'play' : null;
      if (S.phase === 'count' && S.cs) {
        const cs = S.cs;
        if (cs.stage === 'claim') return seat === cs.seat ? 'claim' : null;
        if (cs.stage === 'mug') return seat !== cs.seat ? 'mug' : null;
        return cs.ready[seat] ? null : 'next';
      }
      return null;
    }
    function view(seat) {
      const opp = 1 - seat, f = {}, show = S.cs ? S.cs.ks : [];
      const vis = ks => ks.forEach(k => { f[k] = face(k); });
      const inShow = k => show.includes(k);
      const z = { mine: [], opp: [], crib: [], pile: [], pm: [], po: [], show: show.slice(), st: S.starter };
      if (S.phase === 'discard') { z.mine = S.h[seat].slice(); z.opp = S.h[opp].slice(); vis(z.mine); }
      else if (S.hand) { z.mine = S.hand[seat].slice(); z.opp = S.hand[opp].slice(); vis(z.mine); }
      z.crib = S.crib.filter(k => !inShow(k));
      z.pile = S.pile.map(p => p.k); vis(z.pile);
      if (S.past) { z.pm = S.past[seat].filter(k => !inShow(k)); z.po = S.past[opp].filter(k => !inShow(k)); vis(z.pm); vis(z.po); }
      if (S.cs && S.cs.revealed || (S.cs && S.cs.stage === 'claim')) vis(show);
      if (S.starter >= 0) vis([S.starter]);
      return {
        ph: S.phase, dl: S.dealer, tn: S.turn, hn: S.hn, sc: S.scores.slice(), tg: S.target, me: seat, z, f, cnt: S.count,
        ps: S.pile.map(p => p.seat),
        cs: S.cs ? { seat: S.cs.seat, what: S.cs.what, stage: S.cs.stage, revealed: S.cs.revealed, total: S.cs.stage === 'review' ? S.cs.total : null, items: S.cs.stage === 'review' ? S.cs.items : null, claim: S.cs.claim, ready: S.cs.ready.slice() } : null,
        need: need(seat),
        ok: S.phase === 'play' && S.turn === seat ? S.hand[seat].filter(k => S.count + cbV(face(k)) <= 31) : [],
        over: S.over
      };
    }
    return {
      S, act, view, need, face,
      take() { const e = ev; ev = []; return e; },
      start(firstDealer) { S.dealer = 1 - firstDealer; newHand(); }
    };
  }

  function cbDiscardAI(level, hand, dealer) {
    const have = new Set(hand), unseen = [];
    for (let f = 0; f < 52; f++) if (!have.has(f)) unseen.push(f);
    let best = null;
    const res = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
      const keep = hand.filter((_, x) => x !== i && x !== j), d1 = hand[i], d2 = hand[j];
      let h = 0;
      for (const st of unseen) h += cbCount(keep, st, false).total;
      h /= unseen.length;
      let c = 0;
      if (level === 2) {
        const n = 90;
        for (let t = 0; t < n; t++) {
          const a = unseen[Math.floor(Math.random() * 46)];
          let b, s2;
          do b = unseen[Math.floor(Math.random() * 46)]; while (b === a);
          do s2 = unseen[Math.floor(Math.random() * 46)]; while (s2 === a || s2 === b);
          c += cbCount([d1, d2, a, b], s2, true).total;
        }
        c /= n;
      }
      const ev = h + (dealer ? c : -c) + (level === 0 ? (Math.random() - .5) * 6 : level === 1 ? (Math.random() - .5) * 1.1 : 0);
      res.push({ i, j, ev });
    }
    res.sort((a, b) => b.ev - a.ev);
    best = res[0];
    return [best.i, best.j];
  }

  function cbPlayAI(level, hand, seq, count, unseen, oppN) {
    const legal = [];
    hand.forEach((f, i) => { if (count + cbV(f) <= 31) legal.push(i); });
    if (!legal.length) return -1;
    if (legal.length === 1) return legal[0];
    const U = unseen.reduce((a, b) => a + b, 0) || 1;
    const rows = legal.map(i => {
      const r = cbR(hand[i]), v = cbV(hand[i]), ns = seq.concat(r), nc = count + v, pts = cbPegTotal(ns, nc);
      let risk = 0, none = 1;
      for (let q = 1; q <= 13; q++) {
        const cnt = unseen[q];
        if (!cnt) continue;
        const pr = Math.min(1, oppN * cnt / U);
        if (nc + Math.min(q, 10) <= 31) { risk += pr * cbPegTotal(ns.concat(q), nc + Math.min(q, 10)); none *= 1 - pr; }
      }
      const goBonus = nc >= 20 && nc < 31 ? none * .7 : 0;
      return { i, pts, score: level === 2 ? pts - risk + goBonus - v * .02 : pts + (Math.random() - .5) * 1.2 };
    });
    if (level === 0) {
      if (Math.random() < .6) return legal[Math.floor(Math.random() * legal.length)];
      rows.sort((a, b) => b.pts - a.pts || Math.random() - .5);
      return rows[0].i;
    }
    rows.sort((a, b) => b.score - a.score);
    return rows[0].i;
  }

  const CB_RULES = `<div class="cb-rules">
<p><b>Goal.</b> Be first to peg 121 points. If you finish while the loser is under 91 it is a skunk, under 61 a double skunk.</p>
<p><b>Deal and crib.</b> Each player gets six cards and puts two face down in the crib. The crib belongs to the dealer and is counted for them at the end. The non-dealer cuts and a starter card is turned up. A Jack as starter scores 2 for the dealer (his heels).</p>
<p><b>The play.</b> The non-dealer leads. Play one card at a time, keeping the running count at 31 or less (court cards 10, Ace 1). Score 2 for reaching 15 or 31, 2 for a pair, 6 for three of a kind, 12 for four, a run of three or more scores its length (any order). 1 for Go or the last card.</p>
<p><b>The show.</b> Count each hand with the starter: each set of cards adding to 15 is 2, pairs 2, runs one per card, four of a suit in hand 4 (five with the starter 5, the crib needs all five), and the Jack of the starter's suit in hand is 1 (nobs). Non-dealer counts first, then the dealer, then the crib.</p>
<p><b>Counting.</b> Auto counts for you. Manual means you must enter your own total, and any shortfall is lost. Muggins means the opponent may claim whatever you missed.</p>
<p><b>Keys.</b> <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick a card, <kbd>Enter</kbd> or <kbd>&uarr;</kbd> play or select it, <kbd>1</kbd>-<kbd>6</kbd> pick directly, digits and <kbd>+</kbd><kbd>-</kbd> set your count, <kbd>Enter</kbd> confirms.</p></div>`;

  const CB_NAMES = ['Rookie', 'Regular', 'Sharp'];
  const CB_LVL = ['Easy', 'Medium', 'Hard'];

  Ameplay.register({
    id: 'cribbage',
    title: 'Cribbage',
    category: 'Board',
    width: 960,
    blurb: 'Peg round the board to 121: fifteens, pairs, runs, the crib and the cut.',
    help: 'Tap two cards for the crib · tap a card to play it · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · digits enter your count · Auto, Manual or Muggins counting in the menu',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="6" width="44" height="52" rx="8"/><g fill="currentColor" stroke="none"><circle cx="22" cy="16" r="1.8"/><circle cx="22" cy="23" r="1.8"/><circle cx="22" cy="30" r="1.8"/><circle cx="22" cy="37" r="1.8"/><circle cx="22" cy="44" r="1.8"/><circle cx="32" cy="16" r="1.8"/><circle cx="32" cy="23" r="1.8"/><circle cx="32" cy="30" r="1.8"/><circle cx="32" cy="37" r="1.8"/><circle cx="32" cy="44" r="1.8"/><circle cx="42" cy="16" r="1.8"/><circle cx="42" cy="23" r="1.8"/><circle cx="42" cy="30" r="1.8"/><circle cx="42" cy="37" r="1.8"/><circle cx="42" cy="44" r="1.8"/></g><path d="M32 16v14" stroke-width="3" stroke="#d1453b"/></svg>',
    css: solCss('cribbage') + `
.gm-cribbage .cb-wrap{position:relative;margin:0 auto}
.gm-cribbage .cb-wrap canvas{width:100%;display:block;touch-action:none;background:#14502e}
.gm-cribbage .cb-act{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 10px;padding:3px 10px;background:linear-gradient(180deg,rgba(4,26,14,0),rgba(4,26,14,.82) 40%);box-sizing:border-box}
.gm-cribbage .cb-act .g-btn:disabled{opacity:.55}
.gm-cribbage.cb-n .cb-act{padding-right:66px}
.gm-cribbage .cb-msg{font:700 14px/1.25 var(--sans);color:#fff;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-cribbage .cb-act .g-btn.ghost{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.4);color:#fff}
.gm-cribbage .cb-step{display:inline-flex;align-items:center;gap:6px}
.gm-cribbage .cb-step b{min-width:34px;text-align:center;font:800 20px/1 var(--sans);color:#fff}
.gm-cribbage .cb-step button{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink);font:800 20px/1 var(--sans);cursor:pointer}
.gm-cribbage .cb-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,32,18,.72);backdrop-filter:blur(3px);overflow:auto;padding:12px;z-index:3}
.gm-cribbage .cb-pane[hidden]{display:none}
.gm-cribbage .cb-box{width:min(100%,430px);background:var(--card,#fff);color:var(--ink);border-radius:18px;padding:20px 20px 16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 20px 50px -20px rgba(0,0,0,.6);margin:auto}
.gm-cribbage .cb-box h3{margin:0;font:800 26px/1.1 var(--sans)}
.gm-cribbage .cb-k{margin:0;font:800 11px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
.gm-cribbage .cb-box p{margin:0;font:600 13px/1.45 var(--sans);color:var(--ink2,var(--ink))}
.gm-cribbage .cb-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.gm-cribbage .cb-row>span{font:800 12px/1 var(--sans);color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.gm-cribbage .cb-btns{display:flex;gap:8px;flex-wrap:wrap}
.gm-cribbage .cb-btns .g-btn{flex:1 1 auto}
.gm-cribbage .cb-rules p{margin:0 0 8px}
.gm-cribbage .cb-rules kbd{font:700 11px var(--sans);border:1px solid var(--line);border-radius:5px;padding:1px 5px;margin:0 1px}
.gm-cribbage .cb-st{font:700 12px/1.4 var(--sans);color:var(--muted)}
@media (pointer:coarse){.gm-cribbage .cb-step button{width:40px;height:40px}}
`,
    mount(root, api) {
      const narrow = root.clientWidth < 620;
      const STRIP = narrow ? 54 : 46, W = narrow ? 420 : 960, H = (narrow ? 616 : 640) + STRIP;
      const CW = narrow ? 56 : 68, CH = Math.round(CW * 1.4);
      root.classList.toggle('cb-n', narrow);
      const snd = mkSnd(api);
      const saved = api.load() || {};
      const opt = { mode: saved.mode === 'online' ? 'online' : 'cpu', lvl: [0, 1, 2].includes(saved.lvl) ? saved.lvl : 1, counting: ['auto', 'manual', 'muggins'].includes(saved.counting) ? saved.counting : 'auto' };
      const stats = Object.assign({ w: 0, l: 0, sk: 0 }, saved.stats);
      const saveAll = () => api.save({ mode: opt.mode, lvl: opt.lvl, counting: opt.counting, stats });

      root.innerHTML = `<div class="sol-bar">
        <div class="g-stat"><span class="k" data-n0>You</span><span class="v" data-s0>0</span></div>
        <div class="g-stat"><span class="k" data-n1>CPU</span><span class="v" data-s1>0</span></div>
        <div class="g-stat"><span class="k">Hand</span><span class="v" data-hn>0</span></div>
        <div class="sol-btns"><button type="button" class="g-btn sm ghost" data-b="rules">Rules</button><button type="button" class="g-btn sm" data-b="menu">Menu</button></div>
      </div><div class="cb-wrap"></div>`;
      const q = s => root.querySelector(s);
      q('.cb-wrap').insertAdjacentHTML('beforeend', `<div class="cb-act"><span class="cb-msg" data-m></span><span class="cb-step" hidden><button type="button" data-c="-" aria-label="Less">&minus;</button><b data-n>0</b><button type="button" data-c="+" aria-label="More">+</button></span><button type="button" class="g-btn sm" data-x="a" hidden></button><button type="button" class="g-btn sm ghost" data-x="b" hidden></button></div>`);
      const wrap = q('.cb-wrap'), msgEl = q('[data-m]'), stepEl = q('.cb-step'), numEl = q('[data-n]'), bA = q('[data-x=a]'), bB = q('[data-x=b]');
      const sEl = [q('[data-s0]'), q('[data-s1]')], nEl = [q('[data-n0]'), q('[data-n1]')], hnEl = q('[data-hn]');

      const kit = cardKit(CW, CH, ['#2b5fb0', '#10285a', '#1c3f82', 1]);
      const SC = kit.SC;
      const { canvas: cv, ctx: g, toLocal } = api.canvas(W, H, wrap);
      cv.style.width = '100%';
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      const pane = document.createElement('div');
      pane.className = 'cb-pane'; pane.hidden = true; wrap.append(pane);

      const cx = narrow ? W / 2 : 236 + (W - 236 - 16) / 2;
      const B = narrow ? { x: 8, y: 6, w: W - 16, h: 112 } : { x: 14, y: 14, w: 200, h: 612 };
      const GP = narrow ? 3.4 : 5;
      const PP = narrow ? (B.w - 64 - 11 * GP) / 61 : (B.h - 74 - 11 * GP) / 61;
      const L = narrow ? {
        deck: { x: 12, y: 256 }, st: { x: 78, y: 256 }, crib: { x: 12, y: 352 }, pileX: 148, pileAvail: W - 148 - 12, pileStep: 22, pileY: 256,
        oppY: 146, oppStep: 30, meY: 536, meStep: 58, showY: 256, showStep: 58, nameOpp: 132, nameMe: 522, countY: 238,
        pastMe: { x: 12, y: 256 }, pastOpp: { x: 12, y: 256 }, panel: { x: 80, y: 350, w: W - 88, h: 124 }, popOpp: 232, popMe: 498, hand: W - 24
      } : {
        deck: { x: 252, y: 214 }, st: { x: 332, y: 214 }, crib: { x: 876, y: 0 }, pileX: 430, pileAvail: 380, pileStep: 34, pileY: 214,
        oppY: 38, oppStep: 46, meY: 522, meStep: 84, showY: 214, showStep: 82, nameOpp: 20, nameMe: 500, countY: 190,
        pastMe: { x: 252, y: 522 }, pastOpp: { x: 252, y: 38 }, panel: { x: cx - 200, y: 326, w: 400, h: 150 }, popOpp: 160, popMe: 472, hand: 560
      };
      const cribPos = dl => narrow ? L.crib : { x: L.crib.x, y: dl === 0 ? 392 : 120 };

      const hole = (side, n) => {
        const lanes = narrow ? [B.y + 30, B.y + 48, B.y + 66, B.y + 84] : [B.x + 44, B.x + 76, B.x + 124, B.x + 156];
        let inner, r;
        if (n === 0) { inner = 0; r = -1; } else if (n <= 60) { inner = 0; r = n - 1; } else if (n <= 120) { inner = 1; r = 120 - n; } else { inner = 1; r = -1; }
        const lane = side === 0 ? lanes[inner] : lanes[3 - inner];
        const along = (r + 1) * PP + Math.floor(Math.max(r, 0) / 5) * GP;
        return narrow ? { x: B.x + 34 + along, y: lane } : { x: lane, y: B.y + B.h - 30 - along };
      };
      const pegPos = (side, n) => {
        const n0 = Math.floor(n), a = hole(side, n0), b = hole(side, Math.min(121, n0 + 1)), t = n - n0;
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      };

      const boardImg = (() => {
        const c = document.createElement('canvas');
        c.width = Math.round(B.w * SC); c.height = Math.round(B.h * SC);
        const d = c.getContext('2d'); d.setTransform(SC, 0, 0, SC, -B.x * SC, -B.y * SC);
        const gr = d.createLinearGradient(B.x, B.y, narrow ? B.x : B.x + B.w, narrow ? B.y + B.h : B.y);
        gr.addColorStop(0, '#d1a063'); gr.addColorStop(.5, '#b9854a'); gr.addColorStop(1, '#8f5d2e');
        d.beginPath(); d.roundRect(B.x, B.y, B.w, B.h, 14); d.fillStyle = gr; d.fill();
        d.save(); d.clip();
        for (let i = 0; i < 90; i++) {
          d.strokeStyle = Math.random() < .5 ? 'rgba(60,30,8,.10)' : 'rgba(255,235,190,.08)'; d.lineWidth = .6 + Math.random() * 1.4;
          d.beginPath();
          if (narrow) { const y = B.y + Math.random() * B.h; d.moveTo(B.x, y); d.bezierCurveTo(B.x + B.w * .3, y + 3, B.x + B.w * .6, y - 3, B.x + B.w, y + 1); } else { const x = B.x + Math.random() * B.w; d.moveTo(x, B.y); d.bezierCurveTo(x + 3, B.y + B.h * .3, x - 3, B.y + B.h * .6, x + 1, B.y + B.h); }
          d.stroke();
        }
        d.restore();
        d.lineWidth = 2; d.strokeStyle = 'rgba(70,35,8,.65)'; d.stroke();
        d.beginPath(); d.roundRect(B.x + 4, B.y + 4, B.w - 8, B.h - 8, 11); d.strokeStyle = 'rgba(255,230,170,.35)'; d.lineWidth = 1; d.stroke();
        const hr = narrow ? 1.7 : 2.7;
        const holeDot = (p, r, big) => {
          d.beginPath(); d.arc(p.x, p.y, r, 0, TAU); d.fillStyle = big ? '#2a1304' : '#3a1d08'; d.fill();
          d.beginPath(); d.arc(p.x + .4, p.y + .5, r, Math.PI * .1, Math.PI * 1.05); d.strokeStyle = 'rgba(255,225,170,.35)'; d.lineWidth = .7; d.stroke();
        };
        for (let s = 0; s < 2; s++) {
          for (let n = 1; n <= 120; n++) holeDot(hole(s, n), hr);
          holeDot(hole(s, 0), hr * 1.5, true);
          const f = hole(s, 121);
          holeDot(f, hr * 2.1, true);
          d.beginPath(); d.arc(f.x, f.y, hr * 2.9, 0, TAU); d.strokeStyle = 'rgba(255,214,120,.8)'; d.lineWidth = 1.2; d.stroke();
        }
        d.fillStyle = 'rgba(40,18,4,.7)'; d.font = `800 ${narrow ? 7 : 9}px system-ui,sans-serif`; d.textAlign = 'center'; d.textBaseline = 'middle';
        for (let k = 1; k <= 12; k++) {
          const n = k * 5;
          const o = hole(0, n), o2 = hole(1, n), i = hole(0, 60 + n), i2 = hole(1, 60 + n);
          if (n <= 60) {
            if (narrow) { d.fillText(n, o.x, o.y - 8.5); d.fillText(n, o2.x, o2.y + 9); } else { d.fillText(n, o.x - 14, o.y); d.fillText(n, o2.x + 14, o2.y); }
          }
          const m = { x: (i.x + i2.x) / 2, y: (i.y + i2.y) / 2 };
          if (60 + n <= 120) d.fillText(60 + n, m.x, m.y);
        }
        const line = (nLo, nHi, label) => {
          const a = hole(0, nLo), b = hole(0, nHi), c2 = hole(1, nHi), a2 = hole(1, nLo);
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, mx2 = (a2.x + c2.x) / 2, my2 = (a2.y + c2.y) / 2;
          d.save(); d.strokeStyle = 'rgba(150,25,25,.85)'; d.lineWidth = 1.6; d.setLineDash([5, 3]);
          d.beginPath();
          if (narrow) { d.moveTo(mx, B.y + 14); d.lineTo(mx2, B.y + B.h - 14); } else { d.moveTo(B.x + 14, my); d.lineTo(B.x + B.w - 14, my2); }
          d.stroke(); d.restore();
          d.fillStyle = 'rgba(150,25,25,.95)'; d.font = `900 ${narrow ? 8 : 10}px system-ui,sans-serif`;
          if (narrow) d.fillText(label, mx, B.y + 8); else d.fillText(label, B.x + B.w / 2, my - 10);
        };
        line(90, 91, 'SKUNK');
        const t1 = hole(0, 60), t2 = hole(0, 61);
        d.save(); d.strokeStyle = 'rgba(150,25,25,.85)'; d.lineWidth = 1.6; d.setLineDash([5, 3]); d.beginPath();
        if (narrow) { const x = (t1.x + t2.x) / 2 + PP * .5 + GP / 2; d.moveTo(x, B.y + 14); d.lineTo(x, B.y + B.h - 14); d.stroke(); d.restore(); d.fillStyle = 'rgba(150,25,25,.95)'; d.font = '900 8px system-ui,sans-serif'; d.fillText('DOUBLE', x, B.y + 8); } else { const y = t1.y - PP * .5 - GP * .6; d.moveTo(B.x + 14, y); d.lineTo(B.x + B.w - 14, y); d.stroke(); d.restore(); d.fillStyle = 'rgba(150,25,25,.95)'; d.font = '900 9px system-ui,sans-serif'; d.fillText('DOUBLE SKUNK', B.x + B.w / 2, y - 10); }
        return c;
      })();

      const bgImg = felt(W, H, SC, null, ['#1f7a47', '#176238', '#0d3d22']);

      const K = Array.from({ length: 52 }, (_, k) => ({ k, x: L.deck.x, y: L.deck.y, tx: L.deck.x, ty: L.deck.y, fl: 0, tfl: 0, face: -1, lift: 0, delay: 0, z: 0, zone: 'deck', fly: false }));
      const D = {
        v: null, me: 0, names: ['You', 'CPU'], sc: [0, 0], peg: [{ a: 0, b: 0, tf: 0 }, { a: 0, b: 0, tf: 0 }], keep: null, ps: {}, cnt: 0, showOn: false, shown: 1e9, hi: [], msg: '',
        sel: [], cur: 0, hover: -1, collect: 0, dealT: -1, num: 0, won: null, ended: false, shake: {}, drag: null, clock: 0
      };
      const Q = [], pops = [];
      let busy = 0, cur = null, scene = 'title', paused = false, eng = null, cpuT = 0, role = 'local', tok = 0, uiSig = '', guestId = null, hooked = false, lastDing = 0, lastPegTick = 0, lastLand = 0;
      let online = { names: ['You', 'Guest'], ids: [null, null] };
      const side = seat => seat === D.me ? 0 : 1;
      const nm = seat => D.names[seat] || 'Player';

      const popAt = (sd, txt, col) => pops.push({ t: 0, txt, x: cx, y: sd === 0 ? L.popMe : L.popOpp, col: col || '#ffe08a' });

      function hardSync(v) {
        Q.length = 0; cur = null; busy = 0; pops.length = 0;
        D.v = v; D.me = v.me; D.keep = null; D.collect = 0; D.dealT = -1; D.hi = []; D.sel = [];
        D.cnt = v.cnt; D.sc = v.sc.slice(); D.showOn = !!v.cs; D.shown = 1e9; D.ps = {};
        v.z.pile.forEach((k, i) => { D.ps[k] = v.ps[i]; });
        for (let s = 0; s < 2; s++) { const p = D.peg[side(s)]; p.a = p.tf = v.sc[s]; p.b = Math.max(0, v.sc[s] - 1); }
        targets(0);
        K.forEach(c => { c.x = c.tx; c.y = c.ty; c.fl = c.tfl; c.delay = 0; });
        refreshHead();
      }
      function refreshHead() {
        const v = D.v;
        nEl[0].textContent = nm(D.me); nEl[1].textContent = nm(1 - D.me);
        sEl[0].textContent = D.sc[D.me]; sEl[1].textContent = D.sc[1 - D.me];
        hnEl.textContent = v ? v.hn : 0;
        api.score(D.sc[D.me]);
      }

      const rankSuitKey = (v, k) => { const f = v.f[k]; return f == null ? 99 : (f % 13) * 4 + ((f / 13) | 0); };

      function targets(dt) {
        const v = D.v;
        const set = (c, zone, x, y, up, z) => { c.zone = zone; c.tx = x; c.ty = y; c.tfl = up && c.face >= 0 ? 1 : 0; c.z = z; };
        if (!v) { K.forEach((c, i) => set(c, 'deck', L.deck.x, L.deck.y, false, i)); return; }
        const zs = v.z, cs = v.cs;
        K.forEach(c => { const f = v.f[c.k]; if (f != null) c.face = f; });
        if (D.collect > 0) { K.forEach((c, i) => set(c, 'deck', L.deck.x, L.deck.y, false, i)); return; }
        const taken = new Set();
        const put = (ids, fn) => ids.forEach((k, i) => { taken.add(k); fn(K[k], i, ids.length); });
        const dl = v.dl;
        const pile = D.keep || zs.pile;
        const pset = new Set(pile), pastM = zs.pm.filter(k => !pset.has(k)), pastO = zs.po.filter(k => !pset.has(k)), cribL = zs.crib.slice();
        let showIds = zs.show.slice();
        if (cs && !D.showOn) {
          if (cs.what === 'crib') cribL.push(...showIds); else (cs.seat === v.me ? pastM : pastO).push(...showIds);
          showIds = [];
        }
        const myCards = zs.mine.filter(k => !pile.includes(k));
        const sorted = myCards.slice().sort((a, b) => rankSuitKey(v, a) - rankSuitKey(v, b));
        const n = sorted.length, step = n > 1 ? Math.min(L.meStep, (L.hand - CW) / (n - 1)) : 0, x0 = cx - (CW + (n - 1) * step) / 2;
        const playOk = v.need === 'play' ? v.ok : null;
        put(sorted, (c, i) => {
          const lifted = D.sel.includes(c.k), hv = D.hover === c.k || (D.cur === i && D.kb);
          set(c, 'mine', x0 + i * step, L.meY - (lifted ? 20 : 0) - (hv && !lifted ? 8 : 0), true, 200 + i);
          c.dim = playOk && !playOk.includes(c.k);
        });
        const oo = zs.opp.filter(k => !pile.includes(k)), on = oo.length, ostep = on > 1 ? Math.min(L.oppStep, (L.hand - CW) / (on - 1)) : 0, ox = cx - (CW + (on - 1) * ostep) / 2;
        put(oo, (c, i) => { set(c, 'opp', ox + i * ostep, L.oppY, false, 100 + i); c.dim = false; });
        const pn = pile.length, pstep = pn > 1 ? Math.min(L.pileStep, (L.pileAvail - CW) / (pn - 1)) : 0;
        put(pile, (c, i) => { const sd = D.ps[c.k]; set(c, 'pile', L.pileX + i * pstep, L.pileY + (sd === v.me ? 9 : -9), true, 150 + i); c.dim = false; });
        const cp = cribPos(dl === v.me ? 0 : 1);
        put(cribL, (c, i) => { set(c, 'crib', cp.x + Math.min(i, 3) * 1.4, cp.y + Math.min(i, 3) * 1.4, false, 20 + i); c.dim = false; });
        put(pastM, (c, i) => { set(c, 'past', L.pastMe.x + (i % 6) * .6, L.pastMe.y + (i % 6) * .6, false, 10 + i); c.dim = false; });
        put(pastO, (c, i) => { set(c, 'past', L.pastOpp.x + (i % 6) * .6, L.pastOpp.y + (i % 6) * .6, false, 10 + i); c.dim = false; });
        const showAll = D.showOn && showIds.length && zs.st >= 0 ? showIds.concat(zs.st) : showIds;
        const sn = showAll.length, sx0 = cx - (CW + (sn - 1) * L.showStep) / 2;
        put(showAll, (c, i) => { set(c, 'show', sx0 + i * L.showStep, L.showY - (D.hi.includes(c.k) ? 16 : 0), true, 300 + i); c.dim = false; });
        if (zs.st >= 0 && !taken.has(zs.st)) { taken.add(zs.st); set(K[zs.st], 'st', L.st.x, L.st.y, true, 120); K[zs.st].dim = false; }
        K.forEach(c => { if (!taken.has(c.k)) { set(c, 'deck', L.deck.x, L.deck.y, false, c.k % 8); c.dim = false; } });
        if (D.drag && D.drag.moved) { const c = K[D.drag.k]; c.tx = D.drag.x - CW / 2; c.ty = D.drag.y - CH / 2; c.z = 400; c.x = c.tx; c.y = c.ty; }
      }

      function moveCards(dt) {
        for (const c of K) {
          if (c.delay > 0) { c.delay -= dt; continue; }
          const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.abs(dx) + Math.abs(dy), f = 1 - Math.exp(-dt * 13);
          if (d > 40) c.fly = true;
          if (d < .4) { c.x = c.tx; c.y = c.ty; if (c.fly) { c.fly = false; if (c.zone !== 'deck' && D.clock - lastLand > .05) { lastLand = D.clock; snd.card(); } } } else { c.x += dx * f; c.y += dy * f; }
          const df = c.tfl - c.fl;
          if (df) { const s = 7 * dt; c.fl = Math.abs(df) < s ? c.tfl : c.fl + Math.sign(df) * s; }
        }
      }

      function drawCard(c) {
        const s = Math.abs(Math.cos(c.fl * Math.PI)), up = c.fl > .5 && c.face >= 0;
        const spr = up ? kit.faces[c.face] : kit.back, sh = kit.shadow;
        const moving = Math.abs(c.tx - c.x) + Math.abs(c.ty - c.y) > 3;
        g.save();
        g.translate(c.x + CW / 2, c.y + CH / 2);
        if (moving || (D.drag && D.drag.moved && D.drag.k === c.k)) { const l = kit.lift; g.drawImage(l.cvs, -CW / 2 - l.pad, -CH / 2 - l.pad + 5, CW + 2 * l.pad, CH + 2 * l.pad); } else g.drawImage(sh.cvs, -CW / 2 - sh.pad, -CH / 2 - sh.pad + 1, CW + 2 * sh.pad, CH + 2 * sh.pad);
        const sk = D.shake[c.k];
        if (sk > 0) g.translate(Math.sin(sk * 60) * 5, 0);
        g.scale(Math.max(.02, s), 1);
        g.drawImage(spr, -CW / 2 - kit.PAD, -CH / 2 - kit.PAD, CW + 2 * kit.PAD, CH + 2 * kit.PAD);
        if (c.dim) { g.fillStyle = 'rgba(10,20,40,.38)'; g.beginPath(); g.roundRect(-CW / 2, -CH / 2, CW, CH, kit.R); g.fill(); }
        if (D.sel.includes(c.k) || D.hi.includes(c.k)) { g.strokeStyle = '#ffd34d'; g.lineWidth = 3; g.beginPath(); g.roundRect(-CW / 2 + 1, -CH / 2 + 1, CW - 2, CH - 2, kit.R); g.stroke(); }
        g.restore();
      }

      function drawPeg(sd, n, back, col, t) {
        const p = pegPos(sd, n), r = back ? (narrow ? 2.4 : 3.6) : (narrow ? 3.2 : 4.8);
        const act = !back && Math.abs(D.peg[sd].a - D.peg[sd].tf) > .05, lift = act ? 3 : 0;
        g.beginPath(); g.ellipse(p.x + 1, p.y + 2, r, r * .8, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
        const gr = g.createRadialGradient(p.x - r * .35, p.y - r * .35 - lift, r * .2, p.x, p.y - lift, r * 1.15);
        gr.addColorStop(0, '#fff'); gr.addColorStop(.35, col[0]); gr.addColorStop(1, col[1]);
        g.beginPath(); g.arc(p.x, p.y - lift, r, 0, TAU); g.fillStyle = gr; g.fill();
        g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.45)'; g.stroke();
      }

      function drawTable(dt) {
        g.drawImage(bgImg, 0, 0, W, H);
        g.drawImage(boardImg, B.x, B.y, B.w, B.h);
        const v = D.v;
        const cols = [['#ff6a5e', '#a31d17'], ['#6fa6ff', '#1c4aa6']];
        for (let sd = 0; sd < 2; sd++) {
          const p = D.peg[sd];
          drawPeg(sd, Math.min(121, p.b), true, cols[sd], 0);
          drawPeg(sd, Math.min(121, p.a), false, cols[sd], 0);
        }
        g.font = `800 ${narrow ? 9 : 11}px system-ui,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let sd = 0; sd < 2; sd++) {
          const seat = sd === 0 ? D.me : 1 - D.me, h = hole(sd, 0);
          g.fillStyle = sd ? '#173a7a' : '#8a1a14';
          if (narrow) g.fillText(nm(seat).slice(0, 8), B.x + 20, sd ? B.y + 75 : B.y + 39); else g.fillText(nm(seat).slice(0, 10), sd ? B.x + 140 : B.x + 60, B.y + 20);
        }
        if (!v) return;
        const dl = v.dl, fnt = narrow ? 12 : 14;
        const nameTag = (txt, x, y, sd, active, dealer) => {
          g.font = `800 ${fnt}px system-ui,sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
          const w = g.measureText(txt).width;
          g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(x - 8, y - 12, w + 16 + 52, 24, 12); g.fill();
          g.fillStyle = sd === 0 ? '#ff8a80' : '#8fb7ff'; g.beginPath(); g.arc(x + 2, y, 4, 0, TAU); g.fill();
          g.fillStyle = '#fff'; g.fillText(txt, x + 12, y);
          g.fillStyle = '#ffe08a'; g.fillText(D.sc[sd === 0 ? D.me : 1 - D.me], x + 12 + w + 8, y);
          if (active) { g.strokeStyle = '#ffd34d'; g.lineWidth = 2; g.beginPath(); g.roundRect(x - 8, y - 12, w + 16 + 52, 24, 12); g.stroke(); }
          if (dealer) {
            const dx = x + w + 16 + 52 + 14;
            g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(dx, y, 11, 0, TAU); g.fill();
            g.fillStyle = '#4a3200'; g.font = '900 12px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('D', dx, y + 1);
          }
        };
        const turn = v.ph === 'play' ? v.tn : v.ph === 'count' && v.cs ? (v.cs.stage === 'claim' ? v.cs.seat : -1) : -1;
        nameTag(nm(1 - v.me), narrow ? 12 : L.pastOpp.x + 80, L.nameOpp, 1, turn === 1 - v.me, dl !== v.me);
        nameTag(nm(v.me), narrow ? 12 : L.pastMe.x + 80, L.nameMe, 0, turn === v.me, dl === v.me);
        const cp = cribPos(dl === v.me ? 0 : 1);
        g.fillStyle = 'rgba(255,255,255,.4)'; g.font = `800 ${narrow ? 9 : 11}px system-ui,sans-serif`; g.textAlign = 'center';
        g.fillText('CRIB', cp.x + CW / 2, cp.y - 8 + (narrow ? 0 : 0));
        g.fillText('DECK', L.deck.x + CW / 2, L.deck.y - 8);
        g.beginPath(); g.roundRect(L.st.x + .5, L.st.y + .5, CW - 1, CH - 1, kit.R); g.fillStyle = 'rgba(0,0,0,.14)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; g.stroke();
        g.beginPath(); g.roundRect(cp.x + .5, cp.y + .5, CW - 1, CH - 1, kit.R); g.fillStyle = 'rgba(0,0,0,.14)'; g.fill(); g.stroke();
        for (let i = 3; i >= 0; i--) g.drawImage(kit.back, L.deck.x - i * 1.3 - kit.PAD, L.deck.y - i * 1.3 - kit.PAD, CW + 2 * kit.PAD, CH + 2 * kit.PAD);
        if (v.need === 'cut') { g.strokeStyle = '#ffd34d'; g.lineWidth = 3; g.globalAlpha = .5 + .5 * Math.sin(D.clock * 6); g.beginPath(); g.roundRect(L.deck.x - 3, L.deck.y - 3, CW + 6, CH + 6, kit.R + 2); g.stroke(); g.globalAlpha = 1; }
        if (v.ph === 'play' || (v.ph === 'count' && false)) {
          g.fillStyle = 'rgba(0,0,0,.45)'; const tw = narrow ? 110 : 150;
          g.beginPath(); g.roundRect(L.pileX, L.countY - 12, tw, 24, 12); g.fill();
          g.fillStyle = '#ffe08a'; g.font = `900 ${narrow ? 15 : 18}px system-ui,sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
          g.fillText('Count  ' + D.cnt, L.pileX + 14, L.countY + 1);
        }
        const order = K.slice().sort((a, b) => a.z - b.z);
        const skipRest = c => c.zone === 'deck' && c.x === c.tx && c.y === c.ty && c.fl === 0;
        for (const c of order) if (!skipRest(c)) drawCard(c);
        if (v.ph === 'count' && v.cs && D.showOn) drawPanel(v);
        for (let i = pops.length - 1; i >= 0; i--) {
          const p = pops[i]; p.t += dt;
          if (p.t > 1.5) { pops.splice(i, 1); continue; }
          g.globalAlpha = Math.min(1, (1.5 - p.t) * 2); g.font = `900 ${narrow ? 20 : 26}px system-ui,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 5; g.strokeStyle = 'rgba(20,10,0,.75)'; g.strokeText(p.txt, p.x, p.y - p.t * 26); g.fillStyle = p.col; g.fillText(p.txt, p.x, p.y - p.t * 26);
          g.globalAlpha = 1;
        }
      }

      function drawPanel(v) {
        const cs = v.cs, P = L.panel;
        g.fillStyle = 'rgba(8,28,18,.78)'; g.beginPath(); g.roundRect(P.x, P.y, P.w, P.h, 14); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.stroke();
        g.textBaseline = 'middle';
        const who = cs.what === 'crib' ? nm(v.dl) + '’s crib' : nm(cs.seat) + '’s hand';
        g.fillStyle = '#fff'; g.font = `800 ${narrow ? 13 : 15}px system-ui,sans-serif`; g.textAlign = 'left';
        g.fillText(who, P.x + 14, P.y + 18);
        if (!cs.items) {
          g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `600 ${narrow ? 12 : 13}px system-ui,sans-serif`;
          g.fillText(cs.stage === 'claim' ? 'Count the cards and claim your points' : cs.stage === 'mug' ? 'Counted ' + cs.claim + '. Anything missed?' : '', P.x + 14, P.y + 44);
          return;
        }
        const items = cs.items.slice(0, Math.min(D.shown, cs.items.length)), grp = [];
        for (const it of items) { const o = grp.find(x => x.l === it.label); if (o) { o.n++; o.p += it.pts; } else grp.push({ l: it.label, n: 1, p: it.pts }); }
        const lh = narrow ? 17 : 20;
        grp.forEach((o, i) => {
          const y = P.y + 42 + i * lh;
          g.fillStyle = '#fff'; g.font = `700 ${narrow ? 12 : 14}px system-ui,sans-serif`; g.textAlign = 'left';
          g.fillText(o.l + (o.n > 1 ? '  ×' + o.n : ''), P.x + 14, y);
          g.textAlign = 'right'; g.fillStyle = '#ffe08a'; g.fillText('+' + o.p, P.x + P.w - 14, y);
        });
        if (!items.length && D.shown >= cs.items.length) { g.fillStyle = 'rgba(255,255,255,.8)'; g.textAlign = 'left'; g.font = `700 ${narrow ? 13 : 15}px system-ui,sans-serif`; g.fillText('Nineteen · no points', P.x + 14, P.y + 44); }
        if (D.shown >= cs.items.length) {
          g.textAlign = 'right'; g.fillStyle = '#ffd34d'; g.font = `900 ${narrow ? 16 : 20}px system-ui,sans-serif`;
          g.fillText(cs.total + (cs.total === 1 ? ' point' : ' points'), P.x + P.w - 14, P.y + 18);
        }
      }

      function pegStep(dt) {
        for (let sd = 0; sd < 2; sd++) {
          const p = D.peg[sd];
          if (p.a < p.tf) {
            const na = Math.min(p.tf, p.a + 24 * dt);
            if (Math.floor(na) > Math.floor(p.a) && D.clock - lastPegTick > .04) { lastPegTick = D.clock; snd.peg(); }
            p.a = na;
          } else if (p.a > p.tf) p.a = p.tf;
        }
      }

      function wait(s) { busy = Math.max(busy, s); }
      function runEvent(e) {
        D.hi = [];
        if (e.t === 'deal') {
          D.collect = .5; D.dealT = 0; D.showOn = false; D.keep = null; D.cnt = 0; D.sel = []; D.msg = '';
          snd.shuffle(); wait(.5 + 12 * .07 + .55);
        } else if (e.t === 'disc') { snd.card(); wait(.3); }
        else if (e.t === 'cut') { snd.flip(); D.msg = ''; wait(.9); }
        else if (e.t === 'play') { D.ps[e.k] = e.seat; D.cnt = e.count; wait(.5); }
        else if (e.t === 'peg') {
          const p = D.peg[side(e.seat)];
          p.b = Math.min(121, Math.max(p.b, Math.floor(p.tf))); p.tf = e.to; D.sc[e.seat] = e.to;
          if (e.ks && e.ks.length) D.hi = e.ks.slice();
          popAt(side(e.seat), '+' + e.pts + ' ' + (e.why || ''), '#ffe08a');
          if (e.i != null) D.shown = e.i + 1;
          snd.ding(e.pts); refreshHead();
          wait(clamp(.55 + e.pts * .09, .7, 1.7));
        } else if (e.t === 'go') { popAt(side(e.seat), 'Go', '#fff'); wait(.55); }
        else if (e.t === 'reset') { D.keep = null; D.cnt = 0; snd.sweep(); wait(.55); }
        else if (e.t === 'show') { D.showOn = true; D.shown = e.auto ? 0 : 1e9; D.cnt = 0; snd.flip(); wait(1); }
        else if (e.t === 'claim') { popAt(side(e.seat), 'Counts ' + e.n, '#fff'); snd.pick(); wait(.8); }
        else if (e.t === 'nil') { popAt(side(e.seat), 'Nineteen', '#fff'); wait(.7); }
        else if (e.t === 'muggins') { popAt(side(e.seat), 'Muggins! +' + e.n, '#ff9d8a'); snd.nope(); wait(.9); }
        else if (e.t === 'nomug') { popAt(side(e.seat), 'Nothing missed', '#fff'); wait(.7); }
        else if (e.t === 'win') { D.won = e; snd.fanfare(); wait(1.4); }
      }

      function pump(dt) {
        if (busy > 0) busy -= dt;
        if (D.collect > 0) {
          D.collect -= dt;
          if (D.collect <= 0) {
            D.collect = 0;
            K.forEach(c => { c.delay = 0; });
            const z = D.v ? D.v.z : null;
            if (z) {
              const ids = z.mine.concat(z.opp);
              ids.sort((a, b) => a - b).forEach((k, i) => { K[k].delay = i * .07; });
              snd.deal(12);
            }
          }
        }
        while (busy <= 0 && D.collect <= 0) {
          if (!cur) {
            if (!Q.length) break;
            const en = Q.shift(), v = en.v;
            const hasReset = en.es.some(e => e.t === 'reset');
            const old = D.keep || (D.v ? D.v.z.pile.slice() : []);
            if (v.z.pile.length) v.z.pile.forEach((k, i) => { D.ps[k] = v.ps[i]; });
            D.v = v; D.me = v.me;
            if (hasReset) D.keep = old.concat(en.es.filter(e => e.t === 'play').map(e => e.k));
            cur = { es: en.es, i: 0 };
            D.sel = D.sel.filter(k => v.z.mine.includes(k));
            refreshHead();
          }
          if (cur.i >= cur.es.length) { cur = null; continue; }
          runEvent(cur.es[cur.i++]);
        }
      }
      const idle = () => !cur && !Q.length && busy <= 0 && D.collect <= 0;

      function healScores() {
        const v = D.v;
        if (!v || !idle()) return;
        for (let s = 0; s < 2; s++) if (D.sc[s] !== v.sc[s]) { D.sc[s] = v.sc[s]; D.peg[side(s)].tf = v.sc[s]; }
        if (D.keep) D.keep = null;
        if (D.shown < 1e9 && v.cs && v.cs.items && D.shown < v.cs.items.length) D.shown = 1e9;
      }

      function uiNow() {
        const v = D.v;
        let m = '', a = null, b = null, step = false, dis = false;
        if (scene !== 'game' || !v) { return { m, a, b, step }; }
        const ok = idle() && !D.won && !paused;
        const need = ok ? v.need : null, opp = nm(1 - v.me);
        if (D.won || v.over) m = 'Game over';
        else if (!ok) m = D.msg || (v.ph === 'play' ? 'Count ' + D.cnt : '');
        else if (v.ph === 'discard') {
          if (need === 'disc') { m = narrow ? 'Pick 2 for the crib' : (v.dl === v.me ? 'Your' : opp + '’s') + ' crib · choose 2 cards'; a = 'Put in crib'; dis = D.sel.length !== 2; } else m = 'Waiting for ' + opp + ' to discard';
        } else if (v.ph === 'cut') {
          if (need === 'cut') { m = 'Cut the deck'; a = 'Cut'; } else m = nm(1 - v.dl) + ' is cutting';
        } else if (v.ph === 'play') {
          m = need === 'play' ? 'Your turn · count ' + D.cnt : opp + '’s turn · count ' + D.cnt;
        } else if (v.ph === 'count' && v.cs) {
          const cs = v.cs;
          if (cs.stage === 'claim') {
            if (need === 'claim') { m = narrow ? 'Your count' : 'Count your ' + (cs.what === 'crib' ? 'crib' : 'hand'); a = 'Claim ' + D.num; step = true; } else m = nm(cs.seat) + ' is counting…';
          } else if (cs.stage === 'mug') {
            if (need === 'mug') { m = nm(cs.seat) + ' counts ' + cs.claim; a = 'Muggins!'; b = 'Fine'; } else m = nm(1 - cs.seat) + ' is checking';
          } else {
            m = (cs.what === 'crib' ? nm(v.dl) + '’s crib' : nm(cs.seat) + '’s hand') + ' · ' + cs.total + (cs.total === 1 ? ' point' : ' points');
            if (need === 'next') a = 'Continue'; else if (ok) m += ' · waiting for ' + opp;
          }
        }
        return { m, a, b, step, dis };
      }
      function refreshUI(force) {
        const u = uiNow(), sig = JSON.stringify([u, D.num, D.sel.length]);
        if (sig === uiSig && !force) return;
        uiSig = sig;
        msgEl.textContent = u.m;
        stepEl.hidden = !u.step; numEl.textContent = D.num;
        bA.hidden = !u.a; bB.hidden = !u.b;
        if (u.a) { bA.textContent = u.a; bA.disabled = !!u.dis; }
        if (u.b) bB.textContent = u.b;
      }

      function send(a) {
        if (!D.v || !idle()) return false;
        if (role === 'guest') { api.net.send({ t: 'act', a }); return true; }
        if (!eng) return false;
        const ok = eng.act(D.me, a);
        if (ok) flush();
        return ok;
      }
      function flush() {
        const es = eng.take();
        Q.push({ es, v: eng.view(D.me) });
        if (role === 'host' && guestId) api.net.sendTo(guestId, { t: 'ev', es, v: eng.view(1) });
      }

      function activateCard(k) {
        const v = D.v;
        if (!v || !idle() || paused) return;
        if (v.need === 'disc') {
          const i = D.sel.indexOf(k);
          if (i >= 0) D.sel.splice(i, 1); else { D.sel.push(k); if (D.sel.length > 2) D.sel.shift(); }
          snd.pick();
        } else if (v.need === 'play') {
          if (v.ok.includes(k)) { D.sel = []; send({ t: 'play', k }); } else { D.shake[k] = .35; snd.nope(); api.toast('That would go over 31'); }
        }
      }
      function press(which) {
        const v = D.v;
        if (!v || !idle() || paused) return;
        const need = v.need;
        if (which === 'a') {
          if (need === 'disc' && D.sel.length === 2) { const ks = D.sel.slice(); D.sel = []; send({ t: 'disc', ks }); }
          else if (need === 'cut') send({ t: 'cut' });
          else if (need === 'claim') { const n = D.num; D.num = 0; send({ t: 'claim', n }); }
          else if (need === 'mug') send({ t: 'mug' });
          else if (need === 'next') send({ t: 'next' });
        } else if (need === 'mug') send({ t: 'pass' });
      }

      function cardAt(x, y) {
        const v = D.v;
        if (!v) return -1;
        const mine = K.filter(c => c.zone === 'mine').sort((a, b) => b.z - a.z);
        for (const c of mine) if (x >= c.x && x <= c.x + CW && y >= c.y && y <= c.y + CH) return c.k;
        return -1;
      }
      let down = null;
      api.on(cv, 'pointerdown', e => {
        if (e.button > 0 || scene !== 'game') return;
        e.preventDefault(); audio();
        const p = toLocal(e), v = D.v;
        if (!v || !idle() || paused) return;
        if (v.need === 'cut' && p.x >= L.deck.x - 6 && p.x <= L.deck.x + CW + 6 && p.y >= L.deck.y - 6 && p.y <= L.deck.y + CH + 6) { press('a'); return; }
        const k = cardAt(p.x, p.y);
        if (k < 0) return;
        down = { k, sx: p.x, sy: p.y };
        D.drag = { k, x: p.x, y: p.y, moved: false };
        try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      });
      api.on(cv, 'pointermove', e => {
        const p = toLocal(e);
        if (down) {
          D.drag.x = p.x; D.drag.y = p.y;
          if (!D.drag.moved && Math.hypot(p.x - down.sx, p.y - down.sy) > 8) D.drag.moved = true;
        } else if (e.pointerType === 'mouse' && scene === 'game') { D.hover = idle() ? cardAt(p.x, p.y) : -1; D.kb = false; }
      });
      const up = e => {
        if (!down) return;
        const d = D.drag, k = down.k, p = toLocal(e);
        down = null; D.drag = null;
        if (!d.moved || p.y < L.meY - 46) activateCard(k);
      };
      api.on(cv, 'pointerup', up);
      api.on(cv, 'pointercancel', () => { down = null; D.drag = null; });
      api.on(cv, 'pointerleave', () => { D.hover = -1; });
      api.on(bA, 'click', () => press('a'));
      api.on(bB, 'click', () => press('b'));
      api.on(stepEl, 'click', e => {
        const b = e.target.closest('[data-c]');
        if (!b) return;
        D.num = clamp(D.num + (b.dataset.c === '+' ? 1 : -1), 0, 29); snd.pick();
      });
      api.on(window, 'keydown', e => {
        if (scene !== 'game' || !pane.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
        const v = D.v;
        if (!v) return;
        const mine = K.filter(c => c.zone === 'mine').sort((a, b) => a.x - b.x);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          if (!mine.length) return;
          D.kb = true; D.cur = clamp(D.cur + (e.key === 'ArrowRight' ? 1 : -1), 0, mine.length - 1); D.hover = mine[D.cur].k; e.preventDefault();
        } else if (v.need === 'claim' && /^[0-9]$/.test(e.key)) {
          const n = D.numTyped ? D.num * 10 + +e.key : +e.key; D.num = n > 29 ? +e.key : n; D.numTyped = true; e.preventDefault();
        } else if (v.need === 'claim' && (e.key === '+' || e.key === '=' || e.key === '-')) {
          D.numTyped = false; D.num = clamp(D.num + (e.key === '-' ? -1 : 1), 0, 29); e.preventDefault();
        } else if (v.need === 'claim' && e.key === 'Backspace') { D.num = Math.floor(D.num / 10); e.preventDefault(); }
        else if (/^[1-9]$/.test(e.key) && (v.need === 'disc' || v.need === 'play')) {
          const c = mine[+e.key - 1];
          if (c) { D.kb = true; D.cur = +e.key - 1; activateCard(c.k); }
        } else if (e.key === 'ArrowUp' || ((e.key === 'Enter' || e.key === ' ') && (v.need === 'disc' || v.need === 'play') && D.kb && mine[D.cur])) {
          const c = mine[D.cur];
          if (c && (v.need === 'disc' || v.need === 'play')) { activateCard(c.k); e.preventDefault(); }
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (!bA.hidden && !bA.disabled) { press('a'); e.preventDefault(); }
        } else if ((e.key === 'm' || e.key === 'M') && v.need === 'mug') press('a');
        else if ((e.key === 'n' || e.key === 'N') && v.need === 'mug') press('b');
        if (v.need !== 'claim') D.numTyped = false;
      });

      let paneFn = null;
      function showPane(html, fn) { pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0; paneFn = fn; }
      function hidePane() { pane.hidden = true; pane.innerHTML = ''; paneFn = null; }
      api.on(pane, 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneFn) return;
        snd.pick(); audio();
        paneFn(b.dataset.a, b);
      });
      const seg = (k, vals, labels) => `<div class="sol-seg" data-k="${k}">${vals.map((v, i) => `<button type="button" data-a="seg" data-v="${v}" class="${String(opt[k]) === String(v) ? 'on' : ''}">${labels[i]}</button>`).join('')}</div>`;
      function segClick(b, again) {
        const k = b.parentNode.dataset.k, raw = b.dataset.v;
        opt[k] = /^\d+$/.test(raw) ? +raw : raw;
        saveAll(); again();
      }
      function statLine() { return stats.w + stats.l ? `Record vs CPU: ${stats.w} won, ${stats.l} lost${stats.sk ? ', ' + stats.sk + ' skunk' + (stats.sk > 1 ? 's' : '') + ' inflicted' : ''}` : 'Play to 121. Skunk line at 91.'; }
      function title() {
        scene = 'title'; tok++; eng = null; role = 'local'; guestId = null; paused = false;
        Q.length = 0; cur = null; busy = 0; D.v = null; D.won = null; D.ended = false; pops.length = 0; D.sc = [0, 0];
        D.peg.forEach(p => { p.a = p.b = p.tf = 0; });
        refreshHead(); refreshUI(true);
        showPane(`<div class="cb-box"><p class="cb-k">Card game</p><h3>Cribbage</h3>
<div class="cb-row"><span>Play</span>${seg('mode', ['cpu', 'online'], ['vs CPU', 'Online'])}</div>
${opt.mode === 'cpu' ? `<div class="cb-row"><span>Opponent</span>${seg('lvl', [0, 1, 2], CB_LVL)}</div>` : ''}
<div class="cb-row"><span>Counting</span>${seg('counting', ['auto', 'manual', 'muggins'], ['Auto', 'Manual', 'Muggins'])}</div>
<p class="cb-st">${opt.counting === 'auto' ? 'Hands are counted for you.' : opt.counting === 'manual' ? 'You count your own hands. Missed points are lost.' : 'Count your own hands. Missed points can be stolen by the opponent.'}</p>
<div class="cb-btns"><button type="button" class="g-btn" data-a="play">${opt.mode === 'online' ? 'Create or join a party' : 'Deal'}</button><button type="button" class="g-btn ghost" data-a="rules">How to play</button></div>
<p class="cb-st">${statLine()}</p></div>`, (a, b) => {
          if (a === 'seg') segClick(b, title);
          else if (a === 'rules') rules(title);
          else if (a === 'play') { if (opt.mode === 'online') startOnline(); else startSolo(); }
        });
      }
      function rules(back) { showPane(`<div class="cb-box"><h3>How to play</h3>${CB_RULES}<div class="cb-btns"><button type="button" class="g-btn" data-a="back">Got it</button></div></div>`, () => back()); }
      function menu() {
        if (scene !== 'game') return;
        if (role === 'local') paused = true;
        showPane(`<div class="cb-box"><p class="cb-k">${role === 'local' ? 'Paused' : 'Online'}</p><h3>Menu</h3>
<div class="cb-btns"><button type="button" class="g-btn" data-a="resume">Resume</button><button type="button" class="g-btn ghost" data-a="rules">How to play</button></div>
<div class="cb-btns"><button type="button" class="g-btn ghost" data-a="quit">${role === 'local' ? 'Quit to title' : 'Leave game'}</button></div></div>`, a => {
          if (a === 'resume') { paused = false; hidePane(); } else if (a === 'rules') rules(menu);
          else if (a === 'quit') { if (role !== 'local') api.net.close(); title(); }
        });
      }
      api.on(q('[data-b=menu]'), 'click', () => { if (scene === 'game' && pane.hidden) menu(); else if (scene === 'game') { paused = false; hidePane(); } });
      api.on(q('[data-b=rules]'), 'click', () => { if (pane.hidden) { if (scene === 'game' && role === 'local') paused = true; rules(() => { paused = false; if (scene === 'game') hidePane(); else title(); }); } });

      function begin(first) {
        scene = 'game'; hidePane(); D.won = null; D.ended = false; D.num = 0; D.numTyped = false; D.sel = []; pops.length = 0; Q.length = 0; cur = null; busy = 0; D.keep = null; D.ps = {};
        D.sc = [0, 0]; D.peg.forEach(p => { p.a = p.b = p.tf = 0; }); D.showOn = false; D.cnt = 0; D.collect = 0;
        eng = cbEngine({ counting: opt.counting });
        eng.start(first);
        D.v = null;
        K.forEach(c => { c.x = c.tx = L.deck.x; c.y = c.ty = L.deck.y; c.fl = c.tfl = 0; c.face = -1; c.delay = 0; });
        flush();
        refreshHead(); refreshUI(true);
      }
      function startSolo() {
        tok++; role = 'local'; guestId = null;
        D.me = 0; D.names = ['You', CB_NAMES[opt.lvl]];
        begin(Math.random() < .5 ? 0 : 1);
        api.score(0);
      }
      function sendSetup(id) {
        api.net.sendTo(id, { t: 'setup', names: D.names, counting: opt.counting });
        if (eng) api.net.sendTo(id, { t: 'ev', es: [], v: eng.view(1), sync: 1 });
      }
      function hookNet() {
        if (hooked) return;
        hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => {
          if (role !== 'host' || !p || p.id !== guestId) return;
          guestId = null; D.names = [D.names[0], 'Bot']; refreshHead();
          api.toast(online.names[1] + ' left. A bot takes the seat.');
        });
        api.net.on('rejoin', p => { if (role === 'host' && p && p.id === guestId) sendSetup(p.id); });
        api.net.on('lobby', () => { if (role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (role !== 'guest' && role !== 'host') return;
          role = 'local'; eng = null; paused = true;
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          showPane(`<div class="cb-box"><p class="cb-k">Online</p><h3>${h}</h3><p>The online game has ended.</p><div class="cb-btns"><button type="button" class="g-btn" data-a="room">Online lobby</button><button type="button" class="g-btn ghost" data-a="title">Menu</button></div></div>`, a => {
            paused = false;
            if (a === 'room') startOnline(); else { api.net.close(); title(); }
          });
        });
        api.interval(() => { if (role === 'host' && eng) refreshHead(); }, 1500);
      }
      async function startOnline() {
        tok++; const my = tok;
        hookNet();
        hidePane(); scene = 'title'; paused = false; role = 'local'; eng = null; D.v = null; Q.length = 0; cur = null; busy = 0;
        opt.mode = 'online'; saveAll();
        const r = await api.net.room({ title: 'Cribbage', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true });
        if (!api.alive || my !== tok) return;
        if (!r) { opt.mode = 'cpu'; saveAll(); return title(); }
        if (r.role === 'host') {
          role = 'host';
          const g2 = r.players.find(p => !p.host);
          guestId = g2 ? g2.id : null;
          online.names = [r.players[0].name, g2 ? g2.name : 'Bot'];
          D.me = 0; D.names = online.names.slice();
          begin(Math.random() < .5 ? 0 : 1);
          if (guestId) sendSetup(guestId);
        } else {
          role = 'guest'; scene = 'game'; eng = null; D.v = null;
          showPane(`<div class="cb-box"><p class="cb-k">Online</p><h3>Connected</h3><p>Waiting for the host to deal…</p><div class="cb-btns"><button type="button" class="g-btn ghost" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') { api.net.close(); title(); } });
        }
      }
      function onData(d, from) {
        if (!d || !api.alive) return;
        if (api.net.role === 'host') {
          if (role !== 'host' || !eng || from !== guestId) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') {
            if (eng.act(1, d.a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: eng.view(1), sync: 1 });
          }
        } else if (d.t === 'setup') {
          role = 'guest'; scene = 'game'; D.names = d.names.slice(); D.me = 1; opt.counting = d.counting; hidePane(); paused = false; D.won = null; D.ended = false;
        } else if (d.t === 'ev' && role === 'guest' && d.v) {
          scene = 'game';
          if (d.sync) { hidePane(); hardSync(d.v); } else { if (!D.v) { D.v = d.v; D.me = d.v.me; } Q.push({ es: d.es, v: d.v }); }
          refreshHead();
        }
      }

      function cpuAct(seat, need) {
        const v = eng.view(seat), z = v.z, lvl = opt.lvl;
        if (need === 'disc') {
          const faces = z.mine.map(k => v.f[k]), [i, j] = cbDiscardAI(lvl, faces, v.dl === seat);
          return { t: 'disc', ks: [z.mine[i], z.mine[j]] };
        }
        if (need === 'cut') return { t: 'cut' };
        if (need === 'play') {
          const seen = new Array(14).fill(0), mark = k => { const f = v.f[k]; if (f != null) seen[cbR(f)]++; };
          z.mine.forEach(mark); z.pile.forEach(mark); z.pm.forEach(mark); z.po.forEach(mark); if (z.st >= 0) mark(z.st);
          const unseen = seen.map((n, r) => r ? 4 - n : 0), seq = z.pile.map(k => cbR(v.f[k]));
          const i = cbPlayAI(lvl, z.mine.map(k => v.f[k]), seq, v.cnt, unseen, z.opp.length);
          return { t: 'play', k: z.mine[i] };
        }
        if (need === 'claim') {
          const tot = cbCount(z.show.map(k => v.f[k]), v.f[z.st], v.cs.what === 'crib').total;
          let n = tot;
          if (opt.counting === 'muggins' && lvl === 0 && tot > 1 && Math.random() < .3) n = Math.max(0, tot - 1 - Math.floor(Math.random() * 2));
          return { t: 'claim', n };
        }
        if (need === 'mug') {
          const tot = cbCount(z.show.map(k => v.f[k]), v.f[z.st], v.cs.what === 'crib').total;
          return tot > v.cs.claim && Math.random() < [.35, .75, 1][lvl] ? { t: 'mug' } : { t: 'pass' };
        }
        return { t: 'next' };
      }
      const cpuDelay = n => ({ disc: 1.3, cut: .9, play: 1.1, claim: 1.5, mug: 1.1, next: .2 }[n] || 1);
      function cpuStep(dt) {
        if (!eng || role === 'guest' || paused || !idle() || D.won) { cpuT = 0; return; }
        for (let s = 0; s < 2; s++) {
          if (s === D.me || (s === 1 && role === 'host' && guestId)) continue;
          const need = eng.need(s);
          if (!need) continue;
          if (!cpuT) cpuT = cpuDelay(need) * (.8 + Math.random() * .4);
          cpuT -= dt;
          if (cpuT <= 0) { cpuT = 0; if (eng.act(s, cpuAct(s, need))) flush(); }
          return;
        }
        cpuT = 0;
      }

      function endCheck() {
        if (!D.won || D.ended || !idle()) return;
        D.ended = true;
        const w = D.won.seat, me = D.me, win = w === me, v = D.v;
        const sk = D.won.skunk, mine = D.sc[me], theirs = D.sc[1 - me];
        if (role === 'local') {
          if (win) { stats.w++; if (sk) stats.sk++; api.submit(stats.w); } else stats.l++;
          saveAll();
        }
        const tx = sk === 2 ? (win ? 'Double skunk!' : 'You were double skunked') : sk === 1 ? (win ? 'Skunk!' : 'You were skunked') : '';
        const head = win ? 'You win!' : nm(w) + ' wins';
        const btns = role === 'guest'
          ? `<p>Waiting for the host to start a rematch…</p><div class="cb-btns"><button type="button" class="g-btn ghost" data-a="leave">Leave</button></div>`
          : role === 'host'
            ? `<div class="cb-btns"><button type="button" class="g-btn" data-a="again">Rematch</button><button type="button" class="g-btn ghost" data-a="lobby">Back to lobby</button></div><div class="cb-btns"><button type="button" class="g-btn ghost" data-a="leave">Leave</button></div>`
            : `<div class="cb-btns"><button type="button" class="g-btn" data-a="again">Play again</button><button type="button" class="g-btn ghost" data-a="menu">Menu</button></div>`;
        showPane(`<div class="cb-box"><p class="cb-k">${tx || 'Game over'}</p><h3>${head}</h3><p>${esc(nm(me))} ${mine} · ${esc(nm(1 - me))} ${theirs}${role === 'local' ? '<br>' + statLine() : ''}</p>${btns}</div>`, a => {
          if (a === 'again') {
            if (role === 'host' && !guestId && api.net.players.some(p => !p.host && !p.inGame)) { tok++; startOnline(); }
            else if (role === 'host') { begin(1 - w); if (guestId) sendSetup(guestId); } else begin(1 - w);
          } else if (a === 'menu') title();
          else if (a === 'lobby') { tok++; startOnline(); }
          else if (a === 'leave') { api.net.close(); title(); }
        });
        snd.fanfare();
      }

      api.loop(dt => {
        D.clock += dt;
        if (!paused) { pump(dt); pegStep(dt); }
        for (const k in D.shake) { D.shake[k] -= dt; if (D.shake[k] <= 0) delete D.shake[k]; }
        healScores();
        if (idle()) D.hi = [];
        cpuStep(dt);
        endCheck();
        targets(dt);
        if (!paused) moveCards(dt);
        drawTable(dt);
        refreshUI();
      });

      api.on(window, 'resize', () => {});
      root._cb = { D, K, Q, opt, L, get eng() { return eng; }, get role() { return role; }, press, activateCard, idle, send, get scene() { return scene; }, get busy() { return busy; }, get cur() { return cur; }, stats, pane, size: () => [W, H], uiNow };
      refreshHead();
      if (api.net.invite) startOnline(); else title();
      return { destroy() { tok++; } };
    }
  });
})();
