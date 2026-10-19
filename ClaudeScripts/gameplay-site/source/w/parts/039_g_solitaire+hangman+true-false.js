
(() => {
  'use strict';
  const C = Ameplay.colors;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const mmss = v => Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0');

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

  Ameplay.register({
    id: 'solitaire',
    title: 'Solitaire',
    category: 'Board',
    better: 'low',
    format: mmss,
    width: 960,
    blurb: 'Classic Klondike. Build four suits from Ace to King.',
    help: 'Drag cards · double-click to send home · touch: tap a card to auto-move it, tap the deck to draw · <kbd>Space</kbd> draws · <kbd>Z</kbd> undo',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="16" width="26" height="38" rx="4" transform="rotate(-12 21 35)" opacity=".3" fill="currentColor"/><rect x="28" y="10" width="28" height="40" rx="4"/><path d="M42 36c-5-3.5-8-6-8-9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-3 5.5-8 9z" fill="currentColor"/></svg>',
    css: `
.gm-solitaire{gap:12px}
.gm-solitaire .sol-bar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px 20px;width:100%}
.gm-solitaire .sol-bar .g-stat{min-width:58px}
.gm-solitaire .sol-bar .g-stat .v{font-size:20px}
.gm-solitaire .sol-seg{display:inline-flex;padding:3px;border-radius:999px;background:var(--sunk);border:1px solid var(--line)}
.gm-solitaire .sol-seg button{height:30px;padding:0 14px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer}
.gm-solitaire .sol-seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(31,29,43,.14)}
.gm-solitaire .sol-btns{display:flex;gap:8px}
.gm-solitaire .sol-btns .warn{background:var(--bad);border-color:var(--bad);color:#fff}
.gm-solitaire canvas{background:#1d6b3c;box-shadow:0 14px 34px -18px rgba(10,60,30,.7)}
@media (pointer:coarse){.gm-solitaire .sol-seg{padding:1px}.gm-solitaire .sol-seg button{height:40px}.gm-solitaire .sol-btns .g-btn{height:40px}}
`,
    mount(root, api) {
      const narrow = root.clientWidth < 620;
      const W = narrow ? 520 : 960, H = narrow ? 600 : 640;
      const CW = narrow ? 68 : 100, CH = Math.round(CW * 1.4), R = CW * .08;
      const MX = narrow ? 8 : 30, GAP = (W - 2 * MX - 7 * CW) / 6;
      const TOP = narrow ? 10 : 18, TABY = TOP + CH + (narrow ? 14 : 22);
      const FD = narrow ? 8 : 12, FU = narrow ? 22 : 36, FAN = narrow ? 14 : 24, PAD = 2;
      const STOCK = 0, WASTE = 1, FND = 2, TAB = 6;
      const SC = Math.min(window.devicePixelRatio || 1, 2);
      const saved = api.load() || {};
      let pref = saved.draw === 3 ? 3 : 1, drawN = pref;

      root.innerHTML = `<div class="sol-bar">
        <div class="g-stat"><span class="k">Time</span><span class="v" data-t>0:00</span></div>
        <div class="g-stat"><span class="k">Moves</span><span class="v" data-m>0</span></div>
        <div class="sol-seg"><button type="button" data-d="1">Draw 1</button><button type="button" data-d="3">Draw 3</button></div>
        <div class="sol-btns"><button type="button" class="g-btn sm ghost" data-u>Undo</button><button type="button" class="g-btn sm" data-n>New deal</button></div>
      </div>`;
      const tEl = root.querySelector('[data-t]'), mEl = root.querySelector('[data-m]'), newBtn = root.querySelector('[data-n]');
      const segBtns = [...root.querySelectorAll('[data-d]')];
      const { canvas: cv, ctx } = api.canvas(W, H);

      const colX = i => MX + i * (CW + GAP);
      const slotX = p => p === STOCK ? colX(0) : p === WASTE ? colX(1) : p < TAB ? colX(p + 1) : colX(p - TAB);
      const slotY = p => p < TAB ? TOP : TABY;

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
        if (narrow) {
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
          if (narrow) court(g, r, s, CW * .13, CH * .33, CW * .74, CH * .6);
          else court(g, r, s, CW * .22, CH * .1, CW * .56, CH * .8);
        } else if (narrow) {
          g.fillStyle = col; suitPath(g, s, CW * .5, CH * .64, CW * (r === 1 ? .56 : .46)); g.fill();
        } else if (r === 1) {
          g.fillStyle = col; suitPath(g, s, CW / 2, CH / 2, CW * .46); g.fill();
          g.strokeStyle = RED[s] ? 'rgba(212,42,60,.25)' : 'rgba(31,29,43,.18)'; g.lineWidth = 1.2;
          g.beginPath(); g.ellipse(CW / 2, CH / 2, CW * .34, CW * .34, 0, 0, Math.PI * 2); g.stroke();
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
        const gr = g.createLinearGradient(0, 0, CW, CH); gr.addColorStop(0, '#3a7ae0'); gr.addColorStop(1, '#173f9a');
        g.fillStyle = gr; g.fill(); g.clip();
        g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.1;
        for (let d = -CH; d < CW + CH; d += CW * .1) { line(g, d, 0, d + CH, CH); line(g, d, CH, d + CH, 0); }
        g.beginPath(); g.ellipse(CW / 2, CH / 2, CW * .24, CH * .2, 0, 0, Math.PI * 2);
        g.fillStyle = '#1f56b8'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6; g.stroke();
        g.fillStyle = '#fff'; suitPath(g, 2, CW / 2, CH / 2, CW * .2); g.fill();
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
      const faces = [], back = makeBack(), shadow = makeShadow(3, .28), lift = makeShadow(10, .32);
      for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) faces.push(makeFace(s, r));

      const bg = document.createElement('canvas');
      bg.width = Math.round(W * SC); bg.height = Math.round(H * SC);
      {
        const g = bg.getContext('2d'); g.setTransform(SC, 0, 0, SC, 0, 0);
        const gr = g.createRadialGradient(W / 2, H * .38, 20, W / 2, H * .45, Math.max(W, H) * .78);
        gr.addColorStop(0, '#2f9b5b'); gr.addColorStop(.55, '#22804a'); gr.addColorStop(1, '#155a33');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (let i = 0; i < W * H / 30; i++) {
          g.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.06)';
          g.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
        }
        const slot = (x, y) => {
          g.beginPath(); g.roundRect(x + 1, y + 1, CW - 2, CH - 2, R);
          g.fillStyle = 'rgba(0,0,0,.14)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.22)'; g.stroke();
        };
        for (let p = 0; p < 13; p++) slot(slotX(p), slotY(p));
        g.fillStyle = 'rgba(255,255,255,.2)';
        [0, 1, 2, 3].forEach(s => { suitPath(g, s, slotX(FND + s) + CW / 2, TOP + CH / 2, CW * .4); g.fill(); });
        g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = CW * .05; g.lineCap = 'round';
        const sx = slotX(STOCK) + CW / 2, sy = TOP + CH / 2, rr = CW * .2;
        g.beginPath(); g.arc(sx, sy, rr, -Math.PI * .35, Math.PI * 1.45); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.32)'; g.beginPath();
        const ax = sx + Math.cos(-Math.PI * .35) * rr, ay = sy + Math.sin(-Math.PI * .35) * rr;
        g.moveTo(ax + CW * .1, ay - CW * .01); g.lineTo(ax - CW * .04, ay - CW * .09); g.lineTo(ax - CW * .02, ay + CW * .08); g.closePath(); g.fill();
        const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .75);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
        g.fillStyle = v; g.fillRect(0, 0, W, H);
      }

      const cards = [];
      for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) cards.push({ id: cards.length, s, r, up: false, f: 0, x: 0, y: 0, tx: 0, ty: 0, delay: 0, p: 0, i: 0, drag: false });
      let piles = [], hist = [], moves = 0, secs = 0, shown = -1, running = false, won = false, auto = false, autoT = 0;
      let drag = null, lastTap = { c: null, t: 0 }, cascade = null, newTok = 0, confirmNew = false;

      function layout() {
        for (let p = 0; p < 13; p++) {
          const pile = piles[p], n = pile.length, x0 = slotX(p), y0 = slotY(p);
          let fd = FD, fu = FU;
          if (p >= TAB) {
            let nd = 0; for (const c of pile) if (!c.up) nd++;
            const nu = n - nd, avail = H - y0 - CH - 8;
            if (nd * fd + Math.max(0, nu - 1) * fu > avail) {
              fd = Math.min(fd, narrow ? 5 : 8);
              fu = Math.max(narrow ? 9 : 12, (avail - nd * fd) / Math.max(1, nu - 1));
            }
          }
          const fan = drawN === 3 ? 3 : 1;
          let y = y0;
          for (let i = 0; i < n; i++) {
            const c = pile[i]; c.p = p; c.i = i;
            if (p >= TAB) { c.tx = x0; c.ty = y; y += c.up ? fu : fd; }
            else if (p === WASTE) { c.tx = x0 + Math.max(0, i - (n - fan)) * FAN; c.ty = y0; }
            else { c.tx = x0; c.ty = y0 - Math.floor(i / 6) * 1.2; }
          }
        }
      }
      function hud() { mEl.textContent = moves; }
      function setDraw(n) {
        pref = n; segBtns.forEach(b => b.classList.toggle('on', +b.dataset.d === n));
        api.save({ draw: n });
      }
      function deal() {
        piles = Array.from({ length: 13 }, () => []); drawN = pref;
        hist = []; moves = 0; secs = 0; shown = -1; running = false; won = false; auto = false; cascade = null; drag = null;
        confirmNew = false; newBtn.textContent = 'New deal'; newBtn.classList.remove('warn');
        const deck = shuffle(cards.slice());
        for (const c of deck) { c.up = false; c.f = 0; c.drag = false; c.delay = 0; c.x = slotX(STOCK); c.y = TOP; }
        let k = 0, seq = 0;
        for (let row = 0; row < 7; row++) for (let col = row; col < 7; col++) {
          const c = deck[k++]; c.up = row === col; c.delay = .15 + seq++ * .032; piles[TAB + col].push(c);
        }
        while (k < 52) piles[STOCK].push(deck[k++]);
        layout(); hud(); tEl.textContent = '0:00'; api.score(0);
        api.sfx('pop');
      }
      const snapshot = () => hist.push({ p: piles.map(a => a.slice()), up: cards.map(c => c.up) });
      function begin() { if (!running && !won) running = true; }
      function after() {
        moves++; hud(); layout();
        let home = 0; for (let f = 0; f < 4; f++) home += piles[FND + f].length;
        if (home === 52) return win();
        if (!auto) {
          let hidden = false;
          for (let t = TAB; t < 13 && !hidden; t++) for (const c of piles[t]) if (!c.up) { hidden = true; break; }
          if (!hidden) { auto = true; autoT = .45; }
        }
      }
      function canMove(c, n, p) {
        const pile = piles[p], top = pile[pile.length - 1];
        if (p >= FND && p < TAB) return n === 1 && (top ? top.s === c.s && c.r === top.r + 1 : c.r === 1);
        if (p >= TAB) return top ? top.up && RED[top.s] !== RED[c.s] && c.r === top.r - 1 : c.r === 13;
        return false;
      }
      function move(from, i, to) {
        snapshot(); begin();
        const moved = piles[from].splice(i);
        piles[to].push(...moved);
        const src = piles[from], last = src[src.length - 1];
        if (from >= TAB && last && !last.up) { last.up = true; api.timeout(() => api.sfx('tick'), 120); }
        api.sfx(to < TAB ? 'good' : 'tap');
        after();
      }
      function drawStock() {
        if (won || auto || drag) return;
        const s = piles[STOCK], w = piles[WASTE];
        if (!s.length && !w.length) return;
        snapshot(); begin();
        if (s.length) {
          const n = Math.min(drawN, s.length);
          for (let k = 0; k < n; k++) { const c = s.pop(); c.up = true; c.delay = k * .07; w.push(c); }
          api.sfx('tick');
        } else {
          while (w.length) { const c = w.pop(); c.up = false; s.push(c); }
          api.sfx('pop');
        }
        after();
      }
      function undo() {
        if (!hist.length || won || auto || drag) return;
        const h = hist.pop();
        piles = h.p; cards.forEach((c, i) => { c.up = h.up[i]; });
        moves++; hud(); layout(); api.sfx('tap');
      }
      function autoSend(c) {
        const pile = piles[c.p], top = c.i === pile.length - 1;
        if (c.p >= FND && c.p < TAB) return;
        if (top) for (let f = FND; f < TAB; f++) if (canMove(c, 1, f)) return move(c.p, c.i, f);
        if (c.p === WASTE && !top) return;
        const n = pile.length - c.i;
        let empty = -1;
        for (let t = TAB; t < 13; t++) {
          if (t === c.p || !canMove(c, n, t)) continue;
          if (piles[t].length) return move(c.p, c.i, t);
          if (empty < 0) empty = t;
        }
        if (empty >= 0 && !(c.p >= TAB && c.i === 0)) return move(c.p, c.i, empty);
        api.sfx('bad');
      }
      function autoStep() {
        let best = null;
        const consider = c => { if (!best || c.r < best.r) best = c; };
        for (const p of [STOCK, WASTE]) piles[p].forEach(consider);
        for (let t = TAB; t < 13; t++) { const pile = piles[t]; if (pile.length) consider(pile[pile.length - 1]); }
        if (!best) return;
        for (let f = FND; f < TAB; f++) {
          if (!canMove(best, 1, f)) continue;
          piles[best.p].splice(best.i, 1); best.up = true; best.delay = 0; piles[f].push(best);
          api.sfx('tick'); after(); return;
        }
        auto = false;
      }
      function win() {
        won = true; running = false; auto = false;
        const t = Math.max(1, Math.round(secs));
        tEl.textContent = mmss(t); api.score(t);
        const isBest = api.submit(t);
        api.sfx('win');
        const done = () => {
          if (!cascade || cascade.done) return;
          cascade.done = true;
          api.overlay({
            kicker: isBest ? 'New best!' : 'Solved',
            title: 'You win!',
            stats: [['Time', mmss(t)], ['Moves', moves], ['Best', api.best != null ? mmss(api.best) : '—']],
            button: 'Play again', onAction: deal
          });
        };
        api.timeout(() => {
          if (!won) return;
          const trail = document.createElement('canvas');
          trail.width = bg.width; trail.height = bg.height;
          const tg = trail.getContext('2d'); tg.drawImage(bg, 0, 0); tg.setTransform(SC, 0, 0, SC, 0, 0);
          const order = [];
          for (let r = 13; r >= 1; r--) for (let f = 0; f < 4; f++) { const c = piles[FND + f][r - 1]; if (c) order.push(c); }
          cascade = { trail, tg, order, fly: [], next: 0, t: 0, done: false, finish: done };
        }, 550);
      }
      function stepCascade(dt) {
        const cs = cascade;
        if (cs.done) return;
        cs.t -= dt;
        if (cs.t <= 0 && cs.next < cs.order.length) {
          cs.t = .16;
          const c = cs.order[cs.next++];
          piles[c.p].pop();
          c.vx = (Math.random() < .5 ? -1 : 1) * (140 + Math.random() * 260);
          c.vy = -Math.random() * 380;
          cs.fly.push(c);
        }
        for (let k = cs.fly.length - 1; k >= 0; k--) {
          const c = cs.fly[k];
          c.vy += 1700 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.y + CH > H) { c.y = H - CH; c.vy *= -.72; }
          if (c.x + CW < 0 || c.x > W) { cs.fly.splice(k, 1); continue; }
          cs.tg.drawImage(faces[c.id], c.x - PAD, c.y - PAD, CW + 2 * PAD, CH + 2 * PAD);
        }
        if (cs.next >= cs.order.length && !cs.fly.length) cs.finish();
      }

      function hit(x, y) {
        const inR = (rx, ry) => x >= rx && x <= rx + CW && y >= ry && y <= ry + CH;
        if (inR(slotX(STOCK), TOP)) return { p: STOCK, c: null };
        const w = piles[WASTE];
        if (w.length) { const c = w[w.length - 1]; if (inR(c.tx, c.ty)) return { p: WASTE, c }; }
        for (let f = FND; f < TAB; f++) { const pile = piles[f]; if (pile.length && inR(slotX(f), TOP)) return { p: f, c: pile[pile.length - 1] }; }
        for (let t = TAB; t < 13; t++) {
          const pile = piles[t];
          for (let i = pile.length - 1; i >= 0; i--) if (inR(pile[i].tx, pile[i].ty)) return { p: t, c: pile[i] };
        }
        return null;
      }
      function dropTarget(lead, n) {
        let best = -1, bestA = 0;
        for (let p = FND; p < 13; p++) {
          if (p === lead.p) continue;
          const pile = piles[p], top = pile[pile.length - 1];
          const rx = top ? top.tx : slotX(p), ry = top ? top.ty : slotY(p);
          const ox = Math.min(lead.x + CW, rx + CW) - Math.max(lead.x, rx);
          const oy = Math.min(lead.y + CH, ry + CH + (p >= TAB ? 24 : 0)) - Math.max(lead.y, ry);
          const a = ox > 0 && oy > 0 ? ox * oy : 0;
          if (a > bestA && canMove(lead, n, p)) { bestA = a; best = p; }
        }
        return best;
      }

      cv.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        if (cascade && !cascade.done) { cascade.finish(); return; }
        if (won || auto || drag) return;
        const pt = toLocal(e), h = hit(pt.x, pt.y);
        if (!h) return;
        if (h.p === STOCK) { drawStock(); return; }
        const c = h.c;
        if (!c || !c.up || c.delay > 0) return;
        const now = performance.now(), touch = e.pointerType === 'touch' || e.pointerType === 'pen';
        if (!touch && lastTap.c === c && now - lastTap.t < 420) { lastTap.c = null; autoSend(c); return; }
        lastTap.c = c; lastTap.t = now;
        const pile = piles[c.p];
        const group = pile.slice(c.i);
        drag = { id: e.pointerId, group, sx: pt.x, sy: pt.y, dx: pt.x - c.x, dy: pt.y - c.y, rel: group.map(g => g.ty - c.ty), moved: false, touch };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', e => {
        const pt = toLocal(e);
        if (!drag) {
          if (e.pointerType === 'mouse') { const h = hit(pt.x, pt.y), on = !!h && !won && (h.p === STOCK || (h.c && h.c.up)); const cur = on ? 'pointer' : ''; if (cv.style.cursor !== cur) cv.style.cursor = cur; }
          return;
        }
        if (e.pointerId !== drag.id) return;
        if (!drag.moved) {
          if (Math.abs(pt.x - drag.sx) + Math.abs(pt.y - drag.sy) < (drag.touch ? 12 : 5)) return;
          drag.moved = true; lastTap.c = null;
          drag.group.forEach(c => { c.drag = true; });
          api.sfx('tap');
        }
        drag.group.forEach((c, k) => { c.x = pt.x - drag.dx; c.y = pt.y - drag.dy + drag.rel[k]; });
      });
      const release = e => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag; drag = null;
        d.group.forEach(c => { c.drag = false; });
        if (!d.moved) { if (d.touch && e.type === 'pointerup') autoSend(d.group[0]); return; }
        const lead = d.group[0], to = dropTarget(lead, d.group.length);
        if (to >= 0) move(lead.p, lead.i, to);
      };
      cv.addEventListener('pointerup', release);
      cv.addEventListener('pointercancel', release);
      const toLocal = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };

      segBtns.forEach(b => b.addEventListener('click', () => {
        const n = +b.dataset.d;
        if (n === pref) return;
        setDraw(n);
        if (!moves || won) deal(); else { api.toast(`Draw ${n} starts with the next deal`); }
      }));
      root.querySelector('[data-u]').addEventListener('click', undo);
      newBtn.addEventListener('click', () => {
        if (moves && !won && !confirmNew) {
          confirmNew = true; newBtn.textContent = 'Sure?'; newBtn.classList.add('warn');
          const tok = ++newTok;
          api.timeout(() => { if (tok === newTok && confirmNew) { confirmNew = false; newBtn.textContent = 'New deal'; newBtn.classList.remove('warn'); } }, 2500);
          return;
        }
        newTok++; api.hideOverlay(); deal();
      });
      api.on(window, 'keydown', e => {
        if (cascade && !cascade.done) { cascade.finish(); return; }
        if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        if (e.code === 'Space' || e.code === 'KeyD') drawStock();
        else if (e.code === 'KeyZ' || e.code === 'KeyU' || e.code === 'Backspace') { e.preventDefault(); undo(); }
      });

      function drawCard(c, lifted) {
        const flipS = Math.abs(1 - 2 * c.f), img = c.f >= .5 ? faces[c.id] : back;
        const sh = lifted ? lift : shadow;
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
      }
      const moving = c => c.delay > 0 || Math.abs(c.x - c.tx) + Math.abs(c.y - c.ty) > .8;
      function render() {
        if (cascade) {
          ctx.drawImage(cascade.trail, 0, 0, W, H);
          for (let f = FND; f < TAB; f++) { const p = piles[f]; if (p.length) drawCard(p[p.length - 1], false); }
          return;
        }
        ctx.drawImage(bg, 0, 0, W, H);
        for (let p = 0; p < 13; p++) for (const c of piles[p]) if (!c.drag && !moving(c)) drawCard(c, false);
        for (let p = 0; p < 13; p++) for (const c of piles[p]) if (!c.drag && moving(c)) drawCard(c, true);
        if (drag && drag.moved) for (const c of drag.group) drawCard(c, true);
      }

      api.loop(dt => {
        if (running) {
          secs += dt;
          const s = Math.floor(secs);
          if (s !== shown) { shown = s; tEl.textContent = mmss(s); api.score(s); }
        }
        const k = 1 - Math.exp(-dt * 16);
        if (!cascade) for (const c of cards) {
          if (c.drag) continue;
          if (c.delay > 0) { c.delay -= dt; continue; }
          const ex = c.tx - c.x, ey = c.ty - c.y;
          if (Math.abs(ex) + Math.abs(ey) < .4) { c.x = c.tx; c.y = c.ty; } else { c.x += ex * k; c.y += ey * k; }
          const ft = c.up ? 1 : 0;
          if (c.f !== ft) c.f = ft > c.f ? Math.min(1, c.f + dt * 4.5) : Math.max(0, c.f - dt * 4.5);
        }
        if (auto && !won) { autoT -= dt; if (autoT <= 0) { autoT = .085; autoStep(); } }
        if (cascade) stepCascade(dt);
        render();
      });

      setDraw(pref);
      deal();
    }
  });

  const HM = {
    Animals: 'ELEPHANT,GIRAFFE,KANGAROO,PENGUIN,DOLPHIN,CHEETAH,OCTOPUS,BUTTERFLY,CROCODILE,HEDGEHOG,SQUIRREL,FLAMINGO,GORILLA,RHINOCEROS,HIPPOPOTAMUS,ZEBRA,TORTOISE,PEACOCK,LOBSTER,JELLYFISH,PORCUPINE,ARMADILLO,CHAMELEON,KOALA,PANDA,RACCOON,BEAVER,OSTRICH,PELICAN,WALRUS,MEERKAT,LEOPARD,HAMSTER,RABBIT,CAMEL,BUFFALO,SEAHORSE,SALAMANDER,GRASSHOPPER,POLAR BEAR,SEA TURTLE,GOLDFISH,WOODPECKER,ALLIGATOR,ANTELOPE,CATERPILLAR',
    Food: 'SPAGHETTI,PANCAKE,CHOCOLATE,PINEAPPLE,AVOCADO,BROCCOLI,SANDWICH,STRAWBERRY,BLUEBERRY,WATERMELON,CUCUMBER,MUSHROOM,PRETZEL,BURRITO,LASAGNA,OMELETTE,CROISSANT,CINNAMON,PUMPKIN,CARROT,NOODLES,DUMPLING,MUFFIN,WAFFLE,YOGURT,CHEESECAKE,MEATBALL,PEANUT BUTTER,FRENCH FRIES,ICE CREAM,HOT DOG,GARLIC BREAD,APPLE PIE,FRUIT SALAD,TOMATO SOUP,CUPCAKE,BAGEL,MANGO,COCONUT,RASPBERRY,GRAPEFRUIT,ZUCCHINI,CAULIFLOWER,ASPARAGUS,SPINACH,LEMONADE,CARAMEL,VANILLA,OATMEAL,MACARONI',
    Sports: 'BASKETBALL,FOOTBALL,BASEBALL,VOLLEYBALL,BADMINTON,TENNIS,SWIMMING,CYCLING,GYMNASTICS,ARCHERY,FENCING,ROWING,SURFING,SKATEBOARDING,SNOWBOARDING,MARATHON,BOXING,WRESTLING,KARATE,CRICKET,RUGBY,HOCKEY,GOLF,BOWLING,SAILING,TABLE TENNIS,ICE SKATING,HIGH JUMP,LONG JUMP,POLE VAULT,JAVELIN,TRIATHLON,HANDBALL,WATER POLO,ROCK CLIMBING,DIVING,SKIING,LACROSSE,SOFTBALL,KAYAKING',
    Countries: 'BRAZIL,CANADA,AUSTRALIA,ARGENTINA,MEXICO,JAPAN,CHINA,INDIA,EGYPT,KENYA,NIGERIA,MOROCCO,PORTUGAL,SPAIN,FRANCE,GERMANY,ITALY,GREECE,NORWAY,SWEDEN,FINLAND,DENMARK,ICELAND,IRELAND,POLAND,AUSTRIA,SWITZERLAND,BELGIUM,NETHERLANDS,THAILAND,VIETNAM,INDONESIA,PHILIPPINES,MALAYSIA,SINGAPORE,NEW ZEALAND,SOUTH AFRICA,CHILE,PERU,COLOMBIA,CUBA,JAMAICA,MONACO,CROATIA,HUNGARY,ETHIOPIA,MADAGASCAR,MONGOLIA,NEPAL',
    Movies: 'POPCORN,CINEMA,DIRECTOR,SCREENPLAY,BLOCKBUSTER,SEQUEL,TRAILER,PREMIERE,SOUNDTRACK,CAMERA,CLOSE UP,SPECIAL EFFECTS,STUNT DOUBLE,RED CARPET,MOVIE STAR,COMEDY,THRILLER,ANIMATION,DOCUMENTARY,WESTERN,MUSICAL,HORROR,ROMANCE,SCIENCE FICTION,CARTOON,SUPERHERO,VILLAIN,PLOT TWIST,HAPPY ENDING,OPENING NIGHT,BOX OFFICE,TICKET,AUDIENCE,PRODUCER,CASTING,REHEARSAL,SUBTITLES,CREDITS,FILM CREW,SPOTLIGHT',
    Science: 'ATOM,MOLECULE,GRAVITY,ELECTRON,PROTON,NEUTRON,MAGNET,TELESCOPE,MICROSCOPE,LABORATORY,EXPERIMENT,HYPOTHESIS,PHOTOSYNTHESIS,EVOLUTION,OXYGEN,HYDROGEN,CARBON,NITROGEN,ENERGY,FRICTION,VELOCITY,GALAXY,PLANET,ASTEROID,COMET,ECLIPSE,BACTERIA,GENETICS,CHEMISTRY,PHYSICS,BIOLOGY,THERMOMETER,BATTERY,CIRCUIT,ELECTRICITY,FOSSIL,SKELETON,ORBIT,SOLAR SYSTEM,BLACK HOLE,PERIODIC TABLE',
    Jobs: 'ASTRONAUT,FIREFIGHTER,TEACHER,DOCTOR,NURSE,DENTIST,PILOT,CHEF,BAKER,FARMER,CARPENTER,PLUMBER,ELECTRICIAN,MECHANIC,ARCHITECT,ENGINEER,SCIENTIST,LIBRARIAN,JOURNALIST,PHOTOGRAPHER,MUSICIAN,PAINTER,LAWYER,JUDGE,POLICE OFFICER,VETERINARIAN,PHARMACIST,ACCOUNTANT,CASHIER,GARDENER,LIFEGUARD,TAILOR,BUTCHER,FLORIST,PROGRAMMER,ASTRONOMER,ZOOKEEPER',
    'At home': 'REFRIGERATOR,TOOTHBRUSH,PILLOW,BLANKET,CURTAINS,BOOKSHELF,WARDROBE,MICROWAVE,DISHWASHER,KETTLE,TOASTER,SOFA,CARPET,MIRROR,LAMP,CANDLE,UMBRELLA,SCISSORS,BATHTUB,SHOWER,STAIRCASE,DOORBELL,WINDOW,CHIMNEY,FIREPLACE,CUPBOARD,FRYING PAN,ALARM CLOCK,WASHING MACHINE,VACUUM CLEANER,COAT HANGER,LIGHT BULB,TELEVISION,REMOTE CONTROL,LAUNDRY BASKET',
    Nature: 'MOUNTAIN,WATERFALL,RAINBOW,THUNDERSTORM,HURRICANE,TORNADO,GLACIER,DESERT,RAINFOREST,VOLCANO,CANYON,MEADOW,ISLAND,OCEAN,RIVER,LAGOON,CAVE,CLIFF,WILDFLOWER,SUNFLOWER,OAK TREE,PINE CONE,SNOWFLAKE,AVALANCHE,SUNSET,SUNRISE,MOONLIGHT,BREEZE,BLIZZARD,PEBBLE,CORAL REEF,SAND DUNE,NORTHERN LIGHTS,LIGHTNING,FOREST,SWAMP,VALLEY',
    Music: 'GUITAR,PIANO,VIOLIN,TRUMPET,SAXOPHONE,DRUMS,FLUTE,CLARINET,HARMONICA,ACCORDION,CELLO,XYLOPHONE,TAMBOURINE,UKULELE,HARP,TROMBONE,ORCHESTRA,CONDUCTOR,MELODY,RHYTHM,HARMONY,CONCERT,MICROPHONE,HEADPHONES,CHOIR,LULLABY,KEYBOARD,BANJO,BAGPIPES,TUBA,OBOE,SYMPHONY,METRONOME',
    Transport: 'BICYCLE,MOTORCYCLE,HELICOPTER,SUBMARINE,SAILBOAT,TRACTOR,AMBULANCE,FIRE ENGINE,SCOOTER,TRAIN,TRAM,CANOE,HOT AIR BALLOON,SPACESHIP,ROCKET,TAXI,FERRY,CABLE CAR,BULLDOZER,LIMOUSINE,CARAVAN,MINIBUS,YACHT,GONDOLA'
  };
  const HM_CATS = Object.keys(HM);
  const HM_LIST = HM_CATS.map(c => HM[c].split(','));
  const HM_MAX = 7;
  const HM_SVG = `<svg class="hm-art" viewBox="0 0 220 240" aria-hidden="true">
    <g class="hm-gal">
      <path pathLength="1" d="M18 222C60 218 120 224 202 219"/>
      <path pathLength="1" d="M58 222C55 160 60 90 56 26"/>
      <path pathLength="1" d="M48 28C90 24 130 30 164 26"/>
      <path pathLength="1" d="M57 72C72 56 84 44 98 29"/>
    </g>
    <g class="hm-fig">
      <path pathLength="1" d="M150 27C152 40 148 50 150 60"/>
      <path pathLength="1" d="M150 60C163 59 171 70 170 81C169 93 160 101 149 100C137 99 130 90 130 79C131 68 139 60 152 61"/>
      <path pathLength="1" d="M150 100C152 120 148 140 151 158"/>
      <path pathLength="1" d="M150 116C140 124 132 132 124 142"/>
      <path pathLength="1" d="M150 116C160 123 168 131 177 140"/>
      <path pathLength="1" d="M151 158C144 172 138 186 130 202"/>
      <path pathLength="1" d="M151 158C158 172 164 186 172 202"/>
      <g class="hm-face"><circle cx="143" cy="77" r="2.6"/><circle cx="157" cy="77" r="2.6"/><circle class="hm-cheek" cx="138.5" cy="86" r="3.4"/><circle class="hm-cheek" cx="161.5" cy="86" r="3.4"/><path class="hm-mouth" d="M142 87Q150 94 158 87"/></g>
    </g>
  </svg>`;
  const MOUTH = { happy: 'M142 87Q150 94 158 87', calm: 'M143 89Q150 91 157 89', worried: 'M143 91Q150 85 157 91', joy: 'M141 85Q150 98 159 85' };

  Ameplay.register({
    id: 'hangman',
    title: 'Hangman',
    category: 'Quiz',
    better: 'high',
    format: v => v + ' streak',
    width: 760,
    blurb: 'Guess the hidden word letter by letter before the drawing is done.',
    help: 'Type letters or tap the keyboard · <kbd>?</kbd> hint (costs a try) · <kbd>Enter</kbd> next word',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 56h28M16 56V8h26v8"/><path d="M16 18l8-10" opacity=".3"/><circle cx="42" cy="22" r="6"/><path d="M42 28v13M42 32l-7 6M42 32l7 6M42 41l-6 10M42 41l6 10"/><path d="M48 58h10" opacity=".3"/></svg>',
    css: `
.gm-hangman{gap:14px;justify-content:flex-start}
.gm-hangman .hm-top{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;width:100%}
.gm-hangman .hm-chip{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px;border-radius:999px;background:#fff4d1;color:#8a5a00;font:900 14px/1 var(--sans);letter-spacing:.01em}
.gm-hangman .hm-chip span{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.gm-hangman .hm-sel{height:38px;padding:0 12px;font-size:14px;border-radius:999px;cursor:pointer}
.gm-hangman .hm-lives{display:flex;align-items:center;gap:5px;height:38px;padding:0 14px;border-radius:999px;background:var(--sunk)}
.gm-hangman .hm-lives i{width:10px;height:10px;border-radius:50%;background:var(--good)}
.gm-hangman .hm-lives i.gone{background:var(--line-2);animation:gmHmLose .4s var(--ease)}
.gm-hangman .hm-lives b{margin-left:6px;font:900 13px/1 var(--sans);color:var(--ink-2);font-variant-numeric:tabular-nums}
.gm-hangman .hm-main{display:flex;align-items:center;justify-content:center;gap:18px 30px;width:100%;flex-wrap:wrap}
.gm-hangman .hm-paper{position:relative;width:min(250px,58vw);aspect-ratio:220/240;border-radius:20px;background:#fffdf5 repeating-linear-gradient(0deg,transparent 0 23px,rgba(80,120,200,.12) 23px 24px);border:1px solid #efe6cf;box-shadow:0 14px 30px -18px rgba(120,90,20,.5),inset 0 0 0 6px #fffdf5}
.gm-hangman .hm-paper::before{content:"";position:absolute;left:26px;top:0;bottom:0;width:2px;background:rgba(239,79,79,.25)}
.gm-hangman .hm-art{position:relative;width:100%;height:100%;display:block}
.gm-hangman .hm-art path{fill:none;stroke:#2b2840;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;opacity:0;transition:stroke-dashoffset .55s cubic-bezier(.5,.1,.3,1)}
.gm-hangman .hm-art .hm-gal path{stroke:#7a5230;stroke-width:6}
.gm-hangman .hm-art path.on{stroke-dashoffset:0;opacity:1}
.gm-hangman .hm-art.reset path,.gm-hangman .hm-art.reset .hm-face{transition:none!important}
.gm-hangman .hm-face{opacity:0;transition:opacity .3s .35s}
.gm-hangman .hm-face.on{opacity:1}
.gm-hangman .hm-face circle{fill:#2b2840;stroke:none}
.gm-hangman .hm-face .hm-cheek{fill:#ff8fa3;opacity:.55}
.gm-hangman .hm-face .hm-mouth{stroke-width:3.2;opacity:1;stroke-dasharray:none;stroke-dashoffset:0;transition:none}
.gm-hangman .hm-fig.jump{animation:gmHmJump .6s var(--spring) 2;transform-box:fill-box;transform-origin:50% 100%}
.gm-hangman .hm-paper.shake{animation:gmHmShake .38s var(--ease)}
.gm-hangman .hm-side{display:flex;flex-direction:column;align-items:center;gap:16px;flex:1 1 300px;max-width:440px;min-width:0}
.gm-hangman .hm-word{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 22px;width:100%}
.gm-hangman .hm-w{display:flex;gap:6px}
.gm-hangman .hm-t{width:var(--tw,36px);height:calc(var(--tw,36px) * 1.3);display:grid;place-items:center;border-bottom:4px solid #2b2840;border-radius:2px;font:900 calc(var(--tw,36px) * .78)/1 var(--sans);color:var(--ink)}
.gm-hangman .hm-t i{font-style:normal;transform:scale(0)}
.gm-hangman .hm-t.on i{transform:none;animation:gmHmPop .4s var(--spring)}
.gm-hangman .hm-t.on{border-color:var(--accent)}
.gm-hangman .hm-t.miss i{color:var(--bad)}
.gm-hangman .hm-t.miss{border-color:var(--bad)}
.gm-hangman .hm-t.win{animation:gmHmHop .55s var(--spring) both}
.gm-hangman .hm-kb{display:flex;flex-direction:column;gap:7px;width:min(560px,100%)}
.gm-hangman .hm-kr{display:flex;justify-content:center;gap:5px}
.gm-hangman .hm-kb button{flex:1 1 0;min-width:0;max-width:48px;height:50px;padding:0;border:0;border-radius:11px;background:#fff;box-shadow:inset 0 0 0 2px var(--line),0 3px 0 var(--line);color:var(--ink);font:900 17px/1 var(--sans);cursor:pointer;touch-action:manipulation}
.gm-hangman .hm-kb button:active{transform:translateY(2px);box-shadow:inset 0 0 0 2px var(--line-2),0 1px 0 var(--line-2)}
.gm-hangman .hm-kb button.ok{background:var(--good);color:#fff;box-shadow:0 3px 0 #178a60;animation:gmHmPop .3s var(--spring)}
.gm-hangman .hm-kb button.no{background:var(--sunk);color:var(--soft);box-shadow:none;text-decoration:line-through;animation:gmHmPop .3s var(--spring)}
.gm-hangman .hm-kb button.hint{background:#ffca3a;color:#5a3f00;box-shadow:0 3px 0 #d9a514}
.gm-hangman .hm-hint{height:38px}
@media (pointer:coarse){.gm-hangman .hm-hint,.gm-hangman .hm-sel{height:40px}}
@media (hover:hover){.gm-hangman .hm-kb button:not(.ok):not(.no):hover{box-shadow:inset 0 0 0 2px var(--accent),0 3px 0 var(--line)}}
@media (max-width:520px){.gm-hangman .hm-kb button{height:46px;font-size:15px;border-radius:9px}.gm-hangman .hm-kr{gap:4px}.gm-hangman .hm-paper{width:min(200px,52vw)}}
@keyframes gmHmPop{0%{transform:scale(.4)}100%{transform:none}}
@keyframes gmHmHop{40%{transform:translateY(-12px)}70%{transform:translateY(2px)}}
@keyframes gmHmJump{40%{transform:translateY(-10px)}}
@keyframes gmHmShake{20%{transform:translateX(-6px) rotate(-1deg)}45%{transform:translateX(5px) rotate(1deg)}70%{transform:translateX(-3px)}}
@keyframes gmHmLose{0%{transform:scale(1.6);background:var(--bad)}}
`,
    mount(root, api) {
      const saved = api.load() || {};
      let streak = Math.max(0, saved.streak | 0), recent = Array.isArray(saved.recent) ? saved.recent : [];
      let cat = HM_CATS.includes(saved.cat) ? saved.cat : 'mix';
      root.innerHTML = `<div class="hm-top">
          <div class="hm-chip"><span>Category</span><b data-cat>—</b></div>
          <select class="g-input hm-sel" aria-label="Category"><option value="mix">All categories</option>${HM_CATS.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
          <div class="hm-lives">${'<i></i>'.repeat(HM_MAX)}<b data-left></b></div>
          <button type="button" class="g-btn sm ghost hm-hint">Hint</button>
        </div>
        <div class="hm-main"><div class="hm-paper">${HM_SVG}</div>
          <div class="hm-side"><div class="hm-word"></div></div>
        </div>
        <div class="hm-kb">${['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(r => `<div class="hm-kr">${[...r].map(k => `<button type="button" tabindex="-1" data-k="${k}">${k}</button>`).join('')}</div>`).join('')}</div>`;
      const $ = s => root.querySelector(s);
      const art = $('.hm-art'), paper = $('.hm-paper'), fig = $('.hm-fig'), face = $('.hm-face'), mouth = $('.hm-mouth');
      const gal = [...root.querySelectorAll('.hm-gal path')], parts = [...root.querySelectorAll('.hm-fig > path')];
      const dots = [...root.querySelectorAll('.hm-lives i')], leftEl = $('[data-left]'), catEl = $('[data-cat]');
      const wordEl = $('.hm-word'), sel = $('.hm-sel'), hintBtn = $('.hm-hint');
      const keys = {};
      root.querySelectorAll('[data-k]').forEach(b => { keys[b.dataset.k] = b; });
      sel.value = cat;
      let word = '', used = new Set(), miss = 0, playing = false, tiles = [];
      const persist = () => api.save({ streak, recent, cat });

      function lives() {
        dots.forEach((d, i) => d.classList.toggle('gone', i >= HM_MAX - miss));
        leftEl.textContent = HM_MAX - miss + ' left';
        hintBtn.disabled = !playing || HM_MAX - miss <= 1;
        mouth.setAttribute('d', miss <= 2 ? MOUTH.happy : miss <= 4 ? MOUTH.calm : MOUTH.worried);
      }
      function newWord() {
        const ci = cat === 'mix' ? Math.floor(Math.random() * HM_CATS.length) : HM_CATS.indexOf(cat);
        const list = HM_LIST[ci], pool = list.filter(w => !recent.includes(w));
        word = pick(pool.length ? pool : list);
        recent = recent.concat(word).slice(-80); persist();
        catEl.textContent = HM_CATS[ci];
        used = new Set(); miss = 0; playing = true;
        art.classList.add('reset');
        [...gal, ...parts].forEach(p => { p.classList.remove('on'); p.style.transitionDelay = ''; });
        face.classList.remove('on'); fig.classList.remove('jump');
        void art.getBoundingClientRect();
        art.classList.remove('reset');
        gal.forEach((p, i) => { p.style.transitionDelay = i * 120 + 'ms'; p.classList.add('on'); });
        Object.values(keys).forEach(b => { b.className = ''; });
        const words = word.split(' '), longest = Math.max(...words.map(w => w.length));
        const room = wordEl.clientWidth || 300;
        wordEl.style.setProperty('--tw', Math.max(18, Math.min(38, Math.floor((room - (longest - 1) * 6) / longest))) + 'px');
        wordEl.innerHTML = words.map(w => `<div class="hm-w">${[...w].map(ch => `<div class="hm-t" data-c="${ch}"><i>${ch}</i></div>`).join('')}</div>`).join('');
        tiles = [...wordEl.querySelectorAll('.hm-t')];
        lives(); api.score(streak);
      }
      function reveal(ch) {
        let n = 0;
        tiles.forEach(t => { if (t.dataset.c === ch) { t.classList.add('on'); n++; } });
        return n;
      }
      const solved = () => tiles.every(t => t.classList.contains('on'));
      function wrong() {
        miss++;
        const p = parts[miss - 1];
        p.style.transitionDelay = ''; p.classList.add('on');
        if (miss === 2) face.classList.add('on');
        restart(paper, 'shake');
        lives();
      }
      function guess(ch) {
        if (!playing || used.has(ch)) return;
        used.add(ch);
        const b = keys[ch];
        if (word.includes(ch)) {
          reveal(ch); b.className = 'ok'; api.sfx('good');
          if (solved()) win();
        } else {
          b.className = 'no'; api.sfx('bad'); wrong();
          if (miss >= HM_MAX) lose();
        }
      }
      function hint() {
        if (!playing || HM_MAX - miss <= 1) return;
        const left = [...new Set(tiles.filter(t => !t.classList.contains('on')).map(t => t.dataset.c))];
        if (!left.length) return;
        const ch = pick(left);
        used.add(ch); keys[ch].className = 'hint';
        reveal(ch); api.sfx('pop'); wrong();
        if (solved()) win();
      }
      function win() {
        playing = false; lives();
        streak++; persist(); api.score(streak);
        const isBest = api.submit(streak);
        api.sfx('win');
        mouth.setAttribute('d', MOUTH.joy);
        if (miss >= 2) restart(fig, 'jump');
        tiles.forEach((t, i) => { t.style.animationDelay = i * 45 + 'ms'; t.classList.add('win'); });
        api.timeout(() => api.overlay({
          kicker: isBest ? 'New best!' : 'Solved',
          title: word.toLowerCase().replace(/\b\w/g, m => m.toUpperCase()),
          text: miss ? `Solved with ${miss} miss${miss > 1 ? 'es' : ''}. Keep the streak going!` : 'Flawless. Not a single miss!',
          stats: [['Streak', streak], ['Best', api.best ?? '—']],
          button: 'Next word', onAction: newWord
        }), 1000);
      }
      function lose() {
        playing = false; lives();
        const lost = streak;
        streak = 0; persist(); api.score(0);
        api.sfx('lose');
        tiles.forEach(t => { if (!t.classList.contains('on')) t.classList.add('on', 'miss'); });
        api.timeout(() => api.overlay({
          kicker: 'Out of tries',
          title: word.toLowerCase().replace(/\b\w/g, m => m.toUpperCase()),
          text: lost ? `That was the word. Your streak of ${lost} ends here.` : 'That was the word. A fresh one is waiting.',
          stats: [['Streak', lost], ['Best', api.best ?? '—']],
          button: 'Play again', onAction: newWord
        }), 1200);
      }

      root.querySelector('.hm-kb').addEventListener('pointerdown', e => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        e.preventDefault(); guess(b.dataset.k);
      });
      hintBtn.addEventListener('click', hint);
      sel.addEventListener('change', () => {
        cat = sel.value; persist(); sel.blur();
        if (playing && !used.size) newWord(); else if (playing) api.toast('New category from the next word');
      });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || (e.target && e.target.tagName === 'SELECT')) return;
        if (e.key === '?') { hint(); return; }
        if (/^[a-z]$/i.test(e.key)) guess(e.key.toUpperCase());
      });

      lives();
      api.score(streak);
      api.overlay({
        kicker: 'Quiz', title: 'Hangman',
        text: `Guess the hidden word one letter at a time. ${HM_MAX} wrong guesses and the drawing is finished. A hint reveals a letter but costs a try.`,
        stats: streak ? [['Current streak', streak], ['Best', api.best ?? '—']] : null,
        button: 'Play', onAction: newWord
      });
    }
  });

  const TF_DATA = {
    Animals: [
      ['An octopus has three hearts.', 1, 'Two pump blood through the gills and one pumps it around the body.'],
      ['Bats are blind.', 0, 'Bats can see. Many also use echolocation to hunt in the dark.'],
      ['A group of crows is called a murder.', 1, 'It is the traditional collective noun for crows.'],
      ['Wild penguins live at the North Pole.', 0, 'Wild penguins live almost entirely in the Southern Hemisphere.'],
      ['Spiders are insects.', 0, 'Spiders are arachnids, with eight legs. Insects have six.'],
      ['Dolphins are mammals.', 1, 'They breathe air and feed their young on milk.'],
      ['Goldfish can only remember things for three seconds.', 0, 'Experiments show goldfish can remember things for months.'],
      ['The blue whale is the largest animal known to have ever lived.', 1, 'It is heavier than even the biggest dinosaurs.'],
      ['Koalas are a type of bear.', 0, 'Koalas are marsupials that carry their young in a pouch.'],
      ['Ostriches bury their heads in the sand when scared.', 0, 'A myth. They lower their heads to the ground to tend their nests.'],
      ['The cheetah is the fastest land animal.', 1, 'It can sprint at around 100 km/h in short bursts.'],
      ['Sharks are mammals.', 0, 'Sharks are fish. They breathe through gills.'],
      ['Butterflies can taste with their feet.', 1, 'Taste sensors on their feet help them find the right plants.'],
      ['Hummingbirds can fly backwards.', 1, 'Their figure-of-eight wingbeats let them hover and reverse.'],
      ['A starfish is a fish.', 0, 'Sea stars are echinoderms, related to sea urchins.'],
      ['Owls can turn their heads a full 360 degrees.', 0, 'Owls can turn their heads about 270 degrees.'],
      ['Camels store water in their humps.', 0, 'The humps store fat, which the camel can use for energy.'],
      ['A group of lions is called a herd.', 0, 'A group of lions is called a pride.'],
      ['Giraffes have the same number of neck bones as humans.', 1, 'Both have seven. A giraffe’s are just much longer.'],
      ['Polar bears have black skin.', 1, 'Under their see-through fur, the skin is black to soak up heat.'],
      ['Chameleons change colour mainly to blend into their background.', 0, 'They change colour mostly to signal mood and control temperature.'],
      ['Male seahorses carry the eggs until they hatch.', 1, 'The male has a brood pouch and gives birth to the young.'],
      ['Snakes have eyelids.', 0, 'Snakes have a clear scale over each eye instead of eyelids.'],
      ['Penguins are mammals.', 0, 'Penguins are flightless birds that “fly” underwater.'],
      ['Giant pandas eat mostly meat.', 0, 'Bamboo makes up about 99% of a giant panda’s diet.'],
      ['Crocodiles can stick their tongues out.', 0, 'A crocodile’s tongue is held in place by a membrane.'],
      ['Bats are the only mammals that can truly fly.', 1, 'Flying squirrels and similar animals can only glide.'],
      ['An ostrich’s eye is bigger than its brain.', 1, 'Each eye is about 5 cm across, larger than its brain.'],
      ['Dogs only see in black and white.', 0, 'Dogs see colour, mainly blues and yellows.'],
      ['Flamingos are pink because of what they eat.', 1, 'Pigments in the algae and shrimp they eat colour their feathers.'],
      ['The platypus is a mammal that lays eggs.', 1, 'It is one of the very few egg-laying mammals.'],
      ['A baby kangaroo is called a cub.', 0, 'A baby kangaroo is called a joey.'],
      ['Snails have teeth.', 1, 'They have thousands of tiny teeth on a ribbon called a radula.'],
      ['Horses can doze while standing up.', 1, 'Special locking joints let them rest on their feet.'],
      ['Electric eels are true eels.', 0, 'Electric eels are a kind of knifefish, not true eels.'],
      ['Rabbits are rodents.', 0, 'Rabbits are lagomorphs, a separate group from rodents.'],
      ['Hippos are closely related to whales.', 1, 'Whales and hippos share a common ancestor.'],
      ['A tiger’s skin is striped as well as its fur.', 1, 'The stripes show on the skin underneath the fur too.'],
      ['Adult insects have eight legs.', 0, 'Insects have six legs. Spiders, which are not insects, have eight.'],
      ['Sharks have skeletons made of bone.', 0, 'Their skeletons are made of cartilage, like your ears.'],
      ['Jellyfish have no brain.', 1, 'They have a simple net of nerves instead.'],
      ['A turtle can crawl out of its shell.', 0, 'The shell is part of its skeleton, fused to the spine and ribs.'],
      ['Crows can recognise individual human faces.', 1, 'Studies show crows remember faces for years.'],
      ['Cats have more bones than adult humans.', 1, 'Cats have around 230 bones. Adult humans have 206.'],
      ['Most frogs absorb water through their skin instead of drinking.', 1, 'Frogs take in water through a patch of skin on their belly.'],
      ['Honeybees make honey from pollen.', 0, 'Honey is made from flower nectar. Pollen is food for the young bees.']
    ],
    Space: [
      ['The Sun is a star.', 1, 'It is a medium-sized star, the closest one to Earth.'],
      ['The Moon makes its own light.', 0, 'Moonlight is sunlight reflected off the Moon’s surface.'],
      ['Venus is the hottest planet in the Solar System.', 1, 'Its thick carbon dioxide atmosphere traps heat, making it hotter than Mercury.'],
      ['Venus is the closest planet to the Sun.', 0, 'Mercury is the closest. Venus is second.'],
      ['Saturn is the largest planet in the Solar System.', 0, 'Jupiter is the largest. Saturn is second.'],
      ['Mars is red because of rusty dust on its surface.', 1, 'Iron oxide in its soil and dust gives Mars its colour.'],
      ['There is no gravity on the International Space Station.', 0, 'Gravity there is about 90% of Earth’s. Astronauts float because they are falling around Earth.'],
      ['Saturn is the only planet with rings.', 0, 'Jupiter, Uranus and Neptune have rings too, just much fainter.'],
      ['Sunlight takes about eight minutes to reach Earth.', 1, 'It takes about 8 minutes and 20 seconds.'],
      ['The Great Wall of China can be seen from the Moon with the naked eye.', 0, 'It is far too narrow to see from the Moon.'],
      ['A day on Venus is longer than a year on Venus.', 1, 'Venus spins once every 243 Earth days but orbits the Sun in 225.'],
      ['Neptune is the farthest planet from the Sun.', 1, 'Pluto, once counted, is now classed as a dwarf planet.'],
      ['Pluto is classified as a dwarf planet.', 1, 'Astronomers reclassified it in 2006.'],
      ['The Moon has a thick atmosphere like Earth’s.', 0, 'The Moon has only an extremely thin layer of gas.'],
      ['Stars twinkle because of Earth’s atmosphere.', 1, 'Moving layers of air bend their light back and forth.'],
      ['Earth is the only planet in the Solar System not named after a god.', 1, 'The other planets are named after Roman or Greek gods.'],
      ['The Sun orbits the Earth.', 0, 'Earth orbits the Sun, once a year.'],
      ['Olympus Mons on Mars is the largest volcano in the Solar System.', 1, 'It is around two and a half times as tall as Mount Everest.'],
      ['Sound travels through space just like through air.', 0, 'Space is almost a vacuum, so there is nothing to carry sound.'],
      ['A light-year is a measure of time.', 0, 'It is a distance: how far light travels in one year.'],
      ['The Sun is made mostly of helium.', 0, 'It is mostly hydrogen, about three quarters of its mass.'],
      ['Uranus spins on its side.', 1, 'Its axis is tilted by about 98 degrees.'],
      ['Mars has no moons.', 0, 'Mars has two small moons, Phobos and Deimos.'],
      ['The Milky Way is a spiral galaxy.', 1, 'It is a barred spiral galaxy with long, curved arms.'],
      ['The Moon is slowly moving away from Earth.', 1, 'It drifts about 3.8 cm farther away each year.'],
      ['Earth is closest to the Sun in July.', 0, 'Earth is closest to the Sun in early January.'],
      ['The seasons are caused by Earth’s changing distance from the Sun.', 0, 'Seasons are caused by the tilt of Earth’s axis.'],
      ['A comet’s tail points away from the Sun.', 1, 'Sunlight and the solar wind push the tail away from the Sun.'],
      ['Neil Armstrong was the first person in space.', 0, 'Yuri Gagarin was first, in 1961. Armstrong was first on the Moon.'],
      ['Saturn would float in a giant bathtub of water.', 1, 'Its average density is lower than that of water.'],
      ['The Moon has the same side facing Earth almost all the time.', 1, 'It spins once for every orbit, so we always see the same face.']
    ],
    'Human body': [
      ['Adults have more bones than newborn babies.', 0, 'Babies have around 300 bones. Many fuse, leaving 206 in adults.'],
      ['The human heart has two chambers.', 0, 'It has four: two atria and two ventricles.'],
      ['Humans use only 10% of their brains.', 0, 'Brain scans show we use virtually all of it.'],
      ['The liver is the body’s largest organ.', 0, 'The skin is the largest organ. The liver is the largest internal one.'],
      ['Blood is blue inside your veins.', 0, 'Blood is always red. Veins only look bluish through the skin.'],
      ['The thigh bone is the longest bone in the body.', 1, 'The femur is the longest and strongest bone.'],
      ['Toenails grow faster than fingernails.', 0, 'Fingernails grow several times faster.'],
      ['The smallest bone in the body is in the ear.', 1, 'The stapes, or stirrup, in the middle ear.'],
      ['Cracking your knuckles causes arthritis.', 0, 'Studies have found no link between the two.'],
      ['Red blood cells carry oxygen around the body.', 1, 'They use a protein called haemoglobin.'],
      ['Each part of the tongue can taste only one flavour.', 0, 'The “tongue map” is a myth. All areas detect all basic tastes.'],
      ['The heart beats about 100,000 times a day.', 1, 'At around 70 beats per minute, that adds up fast.'],
      ['Hair and nails keep growing after death.', 0, 'Skin dries and shrinks, which makes them look longer.'],
      ['The liver can regrow after part of it is removed.', 1, 'It can regenerate to near full size.'],
      ['Teeth are bones.', 0, 'Teeth are not bones. They can’t heal themselves the way bones do.'],
      ['Tooth enamel is the hardest substance in the human body.', 1, 'It is even harder than bone.'],
      ['A full set of adult teeth, including wisdom teeth, is 36.', 0, 'A full adult set is 32, including four wisdom teeth.'],
      ['Goosebumps are caused by tiny muscles at the base of hairs.', 1, 'The muscles contract and make the hairs stand up.'],
      ['Newborn babies have kneecaps made of solid bone.', 0, 'Their kneecaps are cartilage and turn to bone over several years.'],
      ['The left lung is slightly smaller than the right lung.', 1, 'It leaves room for the heart.'],
      ['Identical twins have identical fingerprints.', 0, 'Even identical twins have different fingerprints.'],
      ['The brain itself has no pain receptors.', 1, 'Headaches come from tissues around the brain.'],
      ['Muscles make up more of your weight than bones.', 1, 'Muscle is roughly 40% of body weight, bone about 15%.'],
      ['Humans have more than two lungs.', 0, 'Humans have two lungs.'],
      ['Your stomach is lined with acid strong enough to dissolve some metals.', 1, 'Stomach acid is hydrochloric acid, which can dissolve zinc.'],
      ['Your nose can help you taste food.', 1, 'Much of what we call flavour actually comes from smell.']
    ],
    Geography: [
      ['The Pacific is the largest ocean on Earth.', 1, 'It is larger than all the land on Earth combined.'],
      ['The Sahara is the largest desert on Earth.', 0, 'Antarctica is the largest desert. The Sahara is the largest hot desert.'],
      ['Mount Everest is the highest mountain above sea level.', 1, 'Its peak is about 8,849 m above sea level.'],
      ['The Amazon River flows into the Pacific Ocean.', 0, 'It flows east into the Atlantic.'],
      ['Sydney is the capital of Australia.', 0, 'The capital is Canberra.'],
      ['Toronto is the capital of Canada.', 0, 'The capital is Ottawa.'],
      ['Africa is the continent with the most countries.', 1, 'It has 54 countries.'],
      ['Russia stretches across two continents.', 1, 'It spans Europe and Asia.'],
      ['Greenland is mostly covered in ice.', 1, 'About 80% of Greenland is covered by an ice sheet.'],
      ['People float easily in the Dead Sea.', 1, 'Its water is so salty that people bob on the surface.'],
      ['The Nile flows from south to north.', 1, 'It flows north into the Mediterranean Sea.'],
      ['Venice is the capital of Italy.', 0, 'Rome is the capital of Italy.'],
      ['Mount Kilimanjaro is in Kenya.', 0, 'It is in Tanzania, near the border with Kenya.'],
      ['Argentina is the largest country in South America.', 0, 'Brazil is the largest. Argentina is second.'],
      ['The equator passes through Brazil.', 1, 'It crosses northern Brazil near the mouth of the Amazon.'],
      ['Switzerland has a coastline.', 0, 'Switzerland is landlocked.'],
      ['Monaco is smaller than Central Park in New York.', 1, 'Monaco covers about 2 km². Central Park is about 3.4 km².'],
      ['Japan is made up of thousands of islands.', 1, 'It has four main islands and thousands of smaller ones.'],
      ['The Atlantic is the largest ocean.', 0, 'The Pacific is the largest. The Atlantic is second.'],
      ['Lake Baikal in Russia is the deepest lake in the world.', 1, 'It is more than 1,600 m deep.'],
      ['The Panama Canal links the Atlantic and Pacific Oceans.', 1, 'Ships use it to avoid sailing around South America.'],
      ['Istanbul lies on two continents.', 1, 'It sits on both sides of the Bosphorus, in Europe and Asia.'],
      ['The Andes are the longest mountain range on land.', 1, 'They run about 7,000 km down South America.'],
      ['London is farther north than Paris.', 1, 'London is at about 51.5° N, Paris at about 48.9° N.'],
      ['Madagascar lies off the west coast of Africa.', 0, 'It lies off the south-east coast, in the Indian Ocean.'],
      ['Mount Fuji is in China.', 0, 'Mount Fuji is in Japan.'],
      ['New Zealand is north of Australia.', 0, 'New Zealand lies to the south-east of Australia.'],
      ['Egypt has land in both Africa and Asia.', 1, 'The Sinai Peninsula is in Asia.'],
      ['The Hawaiian Islands were formed by volcanoes.', 1, 'They were built up by volcanic eruptions from the sea floor.'],
      ['Greenland is the largest island in the world.', 1, 'Australia is larger but counts as a continent.'],
      ['The Great Barrier Reef is off the coast of Brazil.', 0, 'It lies off Queensland, in north-east Australia.'],
      ['Spain and Italy share the Iberian Peninsula.', 0, 'The Iberian Peninsula is shared by Spain and Portugal.'],
      ['New York City is the capital of the United States.', 0, 'The capital is Washington, D.C.'],
      ['The Danube flows through ten countries.', 1, 'More than any other river in the world.'],
      ['Venice is built on a group of small islands.', 1, 'More than 100 islands linked by bridges.'],
      ['The Amazon rainforest lies mostly in Brazil.', 1, 'About 60% of it is in Brazil.'],
      ['The Mediterranean Sea meets the Atlantic at the Strait of Gibraltar.', 1, 'The strait separates Spain from Morocco.'],
      ['The River Thames flows through Paris.', 0, 'The Thames flows through London. Paris is on the Seine.'],
      ['Iceland has active volcanoes.', 1, 'It sits on the Mid-Atlantic Ridge and has many active volcanoes.'],
      ['The Arctic is a continent.', 0, 'The Arctic is mostly frozen ocean. Antarctica is the continent.']
    ],
    History: [
      ['The Great Pyramid of Giza was built by ancient Egyptians.', 1, 'It was built around 4,500 years ago.'],
      ['Napoleon was unusually short for his time.', 0, 'At around 1.69 m he was about average for a Frenchman of his era.'],
      ['Vikings wore horned helmets into battle.', 0, 'There is no evidence. The image comes from 19th-century art and opera.'],
      ['Neil Armstrong was the first person to walk on the Moon.', 1, 'He stepped onto the Moon in July 1969.'],
      ['The Titanic sank on its first voyage.', 1, 'It sank in April 1912 after hitting an iceberg.'],
      ['Julius Caesar was the first Roman emperor.', 0, 'Augustus was the first emperor. Caesar ruled as dictator.'],
      ['World War I ended in 1945.', 0, 'World War I ended in 1918. World War II ended in 1945.'],
      ['The Berlin Wall fell in 1979.', 0, 'It fell in November 1989.'],
      ['Columbus first reached the Americas in 1492.', 1, 'He landed in the Caribbean in October 1492.'],
      ['The ancient Olympic Games began in Greece.', 1, 'They were held at Olympia, traditionally from 776 BC.'],
      ['Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.', 1, 'She lived around 2,000 years before the Moon landing and 2,500 after the pyramid.'],
      ['The Wright brothers made their first powered flight in 1903.', 1, 'At Kitty Hawk, North Carolina.'],
      ['Marie Curie won Nobel Prizes in two different sciences.', 1, 'Physics in 1903 and Chemistry in 1911.'],
      ['Gutenberg invented his printing press in China.', 0, 'Gutenberg worked in Mainz, Germany, around 1440.'],
      ['The Statue of Liberty was a gift from the United Kingdom.', 0, 'It was a gift from France, dedicated in 1886.'],
      ['The Great Fire of London happened in 1666.', 1, 'It burned for several days in September 1666.'],
      ['The Colosseum is in Athens.', 0, 'The Colosseum is in Rome.'],
      ['The Eiffel Tower was built for the 1889 World’s Fair.', 1, 'It was the entrance arch to the Paris Exposition.'],
      ['Machu Picchu was built by the Aztecs.', 0, 'It was built by the Inca, high in the Andes of Peru.'],
      ['The Hundred Years’ War lasted exactly 100 years.', 0, 'It lasted 116 years, from 1337 to 1453.'],
      ['Einstein won his Nobel Prize for the theory of relativity.', 0, 'He won it for explaining the photoelectric effect.'],
      ['Pompeii was buried by an eruption of Mount Vesuvius.', 1, 'The eruption happened in AD 79.'],
      ['The first modern Olympic Games were held in Paris.', 0, 'They were held in Athens in 1896.'],
      ['Magna Carta dates from 1215.', 1, 'King John agreed to it at Runnymede in 1215.'],
      ['Humans and non-bird dinosaurs lived at the same time.', 0, 'They died out about 66 million years before humans appeared.'],
      ['The USA and the Soviet Union fought each other directly in the Cold War.', 0, 'They never fought each other directly. That’s why it was “cold”.'],
      ['Vincent van Gogh sold very few paintings in his lifetime.', 1, 'He became famous only after his death in 1890.'],
      ['Ancient Egyptians mummified cats.', 1, 'Huge numbers of cat mummies have been found.'],
      ['Tutankhamun’s tomb was discovered in 1922.', 1, 'It was found by Howard Carter’s team.'],
      ['Leonardo da Vinci painted the Mona Lisa.', 1, 'He worked on it in the early 1500s.'],
      ['Charles Dickens wrote Romeo and Juliet.', 0, 'William Shakespeare wrote it in the 1590s.'],
      ['The ancient Romans used the number zero in their numerals.', 0, 'Roman numerals have no symbol for zero.']
    ],
    Science: [
      ['Water boils at 100 °C at sea level.', 1, 'At higher altitudes it boils at lower temperatures.'],
      ['Lightning never strikes the same place twice.', 0, 'Tall buildings can be struck many times a year.'],
      ['Diamonds are made of carbon.', 1, 'They are carbon atoms packed in a very strong crystal.'],
      ['Sound travels faster than light.', 0, 'Light is almost a million times faster.'],
      ['Protons have a negative charge.', 0, 'Protons are positive. Electrons are negative.'],
      ['Glass is a liquid that slowly flows over centuries.', 0, 'Glass is a solid. Old windows were simply made unevenly.'],
      ['Water expands when it freezes.', 1, 'That is why ice floats and frozen pipes can burst.'],
      ['The chemical symbol for gold is Au.', 1, 'It comes from the Latin word “aurum”.'],
      ['The chemical symbol for iron is Ir.', 0, 'Iron is Fe. Ir is iridium.'],
      ['Plants take in carbon dioxide and give out oxygen.', 1, 'This happens during photosynthesis.'],
      ['In a vacuum, heavy objects fall faster than light ones.', 0, 'Without air, everything falls at the same rate.'],
      ['Bananas are slightly radioactive.', 1, 'They contain a tiny amount of radioactive potassium-40.'],
      ['Pure water is an excellent conductor of electricity.', 0, 'Pure water conducts poorly. Dissolved salts carry the current.'],
      ['Oxygen is the most common gas in Earth’s air.', 0, 'Nitrogen is about 78% of the air; oxygen about 21%.'],
      ['Helium is lighter than air.', 1, 'That is why helium balloons float.'],
      ['The north poles of two magnets attract each other.', 0, 'Like poles repel. Opposite poles attract.'],
      ['Absolute zero is 0 °C.', 0, 'Absolute zero is −273.15 °C, or 0 kelvin.'],
      ['Mercury is a metal that is liquid at room temperature.', 1, 'It is the only metal that is liquid at room temperature.'],
      ['Atoms are mostly empty space.', 1, 'The nucleus is tiny compared with the whole atom.'],
      ['Salt water freezes at a lower temperature than fresh water.', 1, 'That is why salt is spread on icy roads.'],
      ['Light travels at about 300,000 km per second.', 1, 'Nothing travels faster through empty space.'],
      ['The Statue of Liberty is green because its copper skin has weathered.', 1, 'Copper slowly forms a green layer called a patina.'],
      ['Water is made of hydrogen and nitrogen.', 0, 'Water is H₂O: two hydrogen atoms and one oxygen atom.'],
      ['Ice is denser than liquid water.', 0, 'Ice is less dense, which is why it floats.'],
      ['Diamond is the hardest natural mineral.', 1, 'It scores 10, the top of the Mohs hardness scale.'],
      ['Thunder is caused by air heated by lightning expanding rapidly.', 1, 'The sudden expansion creates a shock wave we hear as thunder.'],
      ['Acids have a pH higher than 7.', 0, 'Acids are below 7. Bases, or alkalis, are above 7.'],
      ['Plants get most of their mass from the soil.', 0, 'Most of it comes from carbon dioxide in the air.'],
      ['A fire needs oxygen to keep burning.', 1, 'Take the oxygen away and the flame goes out.'],
      ['Clouds are made of tiny water droplets or ice crystals.', 1, 'They form when water vapour cools and condenses.'],
      ['Rust forms when iron reacts with oxygen and water.', 1, 'The reddish-brown flakes are iron oxide.'],
      ['Cold air rises because it is lighter than warm air.', 0, 'Warm air is less dense, so warm air rises.'],
      ['A rainbow has red on its outer edge.', 1, 'In a main rainbow, red is on the outside and violet inside.'],
      ['Humans and bananas share some of the same genes.', 1, 'Many basic genes for running cells are shared by all living things.'],
      ['Gold is a good conductor of electricity.', 1, 'That is why it is used in electronic connectors.'],
      ['A compass needle points to the geographic South Pole.', 0, 'Its north end points towards Earth’s magnetic north.']
    ],
    Food: [
      ['Tomatoes are fruits, botanically speaking.', 1, 'They grow from a flower and contain seeds.'],
      ['Peanuts are true nuts.', 0, 'Peanuts are legumes, like peas and beans.'],
      ['Honey can stay edible for thousands of years.', 1, 'Edible honey has been found in ancient Egyptian tombs.'],
      ['White chocolate contains cocoa solids.', 0, 'It is made from cocoa butter, sugar and milk, without cocoa solids.'],
      ['The first cultivated carrots were orange.', 0, 'Early carrots were mostly purple or yellow.'],
      ['Bananas grow on trees.', 0, 'The banana plant is a giant herb, not a tree.'],
      ['Sushi always contains raw fish.', 0, 'Sushi means vinegared rice. Many kinds have no raw fish at all.'],
      ['Coffee beans are the seeds of a fruit.', 1, 'They come from the red “cherries” of the coffee plant.'],
      ['Potatoes were first grown in South America.', 1, 'They were domesticated in the Andes thousands of years ago.'],
      ['Rice is the seed of a type of grass.', 1, 'Rice is a cereal grain, like wheat and corn.'],
      ['An avocado is a berry, botanically speaking.', 1, 'It is a large berry with a single seed.'],
      ['Pineapples grow on trees.', 0, 'They grow from a low, spiky plant on the ground.'],
      ['Strawberries are true berries.', 0, 'Botanically they are not. Bananas, oddly, are.'],
      ['Bananas are berries, botanically speaking.', 1, 'Botanically, a banana is a berry.'],
      ['Chocolate is harmful to dogs.', 1, 'It contains theobromine, which dogs process very slowly.'],
      ['Cucumbers are only about half water.', 0, 'Cucumbers are about 95% water.'],
      ['Popcorn pops because water inside the kernel turns to steam.', 1, 'The steam builds pressure until the kernel bursts.'],
      ['Vanilla comes from an orchid.', 1, 'Vanilla pods are the fruit of a climbing orchid.'],
      ['Saffron comes from a flower.', 1, 'It is the dried threads from the centre of the saffron crocus.'],
      ['Brown eggs are more nutritious than white eggs.', 0, 'Shell colour depends on the breed of hen, not nutrition.'],
      ['Apples float in water.', 1, 'About a quarter of an apple’s volume is air.'],
      ['Chilli peppers get their heat from a chemical called capsaicin.', 1, 'Capsaicin triggers heat sensors in your mouth.'],
      ['Eating carrots gives you night vision.', 0, 'Carrots help healthy eyes, but the night-vision claim was wartime propaganda.'],
      ['Fortune cookies were invented in China.', 0, 'They were popularised in the United States.'],
      ['Broccoli and cabbage belong to the same plant species.', 1, 'Broccoli, cabbage, kale and cauliflower are all one species.'],
      ['Traditional dried pasta is made from durum wheat.', 1, 'Durum wheat semolina gives pasta its firm bite.'],
      ['Parmesan cheese comes from Greece.', 0, 'Parmigiano Reggiano is made in northern Italy.'],
      ['Ketchup was once sold as a medicine.', 1, 'In the 1830s, tomato ketchup pills were sold in the United States.'],
      ['Lemons contain more sugar than strawberries.', 0, 'Strawberries contain roughly twice as much sugar.'],
      ['Cashews, almonds and walnuts all grow on trees.', 1, 'They are all tree nuts.']
    ],
    Numbers: [
      ['Zero is an even number.', 1, 'It divides by 2 with no remainder.'],
      ['The angles of a triangle add up to 180 degrees.', 1, 'This is true for any flat triangle.'],
      ['Pi is exactly 3.14.', 0, 'Pi is 3.14159… and its digits go on forever.'],
      ['1 is a prime number.', 0, 'A prime has exactly two factors. 1 has only one.'],
      ['2 is the only even prime number.', 1, 'Every other even number can be divided by 2.'],
      ['A hexagon has five sides.', 0, 'A hexagon has six sides. A pentagon has five.'],
      ['A square is a special kind of rectangle.', 1, 'It has four right angles, like every rectangle.'],
      ['The square root of 64 is 6.', 0, 'The square root of 64 is 8.'],
      ['Dividing 100 by one half gives 50.', 0, 'Dividing by ½ doubles a number, so the answer is 200.'],
      ['An octagon has eight sides.', 1, 'Stop signs are octagons.'],
      ['Every prime number is odd.', 0, '2 is prime and even.'],
      ['A full circle has 360 degrees.', 1, 'A right angle is a quarter of that: 90 degrees.'],
      ['6 × 7 = 48.', 0, '6 × 7 = 42.'],
      ['A leap year has 366 days.', 1, 'The extra day is 29 February.'],
      ['0.999… repeating forever is equal to 1.', 1, 'There is no number between them, so they are equal.'],
      ['A dozen is 13.', 0, 'A dozen is 12. A “baker’s dozen” is 13.'],
      ['The Roman numeral L means 100.', 0, 'L means 50. C means 100.'],
      ['The numbers 1 to 10 add up to 55.', 1, '1 + 2 + … + 10 = 55.'],
      ['A millennium is 100 years.', 0, 'A millennium is 1,000 years. A century is 100.'],
      ['11 × 11 = 111.', 0, '11 × 11 = 121.'],
      ['15% of 200 is 30.', 1, '10% is 20 and 5% is 10, so 30.'],
      ['A cube has eight corners.', 1, 'It has 8 corners, 12 edges and 6 faces.'],
      ['One quarter is bigger than one third.', 0, 'One third (0.33) is bigger than one quarter (0.25).'],
      ['A negative number times a negative number is positive.', 1, 'For example, −2 × −3 = 6.'],
      ['A right angle measures 90 degrees.', 1, 'It is the corner of a square.'],
      ['There are 1,000 metres in a kilometre.', 1, '“Kilo” means a thousand.'],
      ['Half of a half is a third.', 0, 'Half of a half is a quarter.'],
      ['A triangle can have two right angles.', 0, 'Two right angles already make 180 degrees, leaving nothing for the third.']
    ],
    'Arts & more': [
      ['The word “alphabet” comes from the first two Greek letters.', 1, 'Alpha and beta.'],
      ['The word “bookkeeper” has three double letters in a row.', 1, 'oo, kk and ee.'],
      ['A haiku traditionally has three lines.', 1, 'Usually with 5, 7 and 5 syllables.'],
      ['Mixing red and blue paint makes green.', 0, 'Red and blue make purple. Blue and yellow make green.'],
      ['A standard piano has 88 keys.', 1, '52 white keys and 36 black keys.'],
      ['In chess, pawns can move backwards.', 0, 'Pawns only ever move forwards.'],
      ['In chess, the queen can move any number of squares in a straight line.', 1, 'Across, up, down or diagonally.'],
      ['A standard deck has 52 cards, not counting jokers.', 1, 'Four suits of 13 cards each.'],
      ['A marathon is 42.195 km long.', 1, 'That is just over 26 miles.'],
      ['The Olympic symbol has six rings.', 0, 'It has five interlocking rings.'],
      ['A football (soccer) team has 9 players on the pitch.', 0, 'Each team has 11 players, including the goalkeeper.'],
      ['Basketball was invented in the United States.', 1, 'James Naismith invented it in Massachusetts in 1891.'],
      ['In tennis, a score of zero is called “love”.', 1, 'Love, 15, 30, 40, game.'],
      ['In golf, the lowest score wins.', 1, 'Fewer strokes is better.'],
      ['On a standard keyboard, Q is on the bottom row of letters.', 0, 'Q starts the top row of letters: QWERTY.'],
      ['There are 26 letters in the English alphabet.', 1, 'From A to Z.'],
      ['Leonardo da Vinci painted The Starry Night.', 0, 'Vincent van Gogh painted it in 1889.'],
      ['Beethoven kept composing after he lost his hearing.', 1, 'He wrote his Ninth Symphony while almost completely deaf.'],
      ['Mozart was born in Salzburg.', 1, 'He was born there in 1756.'],
      ['A violin has six strings.', 0, 'A violin has four strings: G, D, A and E.'],
      ['Morse code uses dots and dashes.', 1, 'Short and long signals spell out letters.'],
      ['A palindrome reads the same forwards and backwards.', 1, 'Like “level” or “racecar”.'],
      ['Sherlock Holmes was created by Agatha Christie.', 0, 'He was created by Arthur Conan Doyle.'],
      ['Antonyms are words with the same meaning.', 0, 'Antonyms are opposites. Synonyms mean the same.'],
      ['The Statue of Liberty holds her torch in her right hand.', 1, 'Her left arm holds a tablet.'],
      ['The Leaning Tower of Pisa leans because of soft ground.', 1, 'Its foundations sank into soft soil during building.'],
      ['The Eiffel Tower is made mainly of iron.', 1, 'It is built from wrought iron.'],
      ['Big Ben is the name of the great bell in the clock tower.', 1, 'The tower itself is called the Elizabeth Tower.'],
      ['A rainbow is traditionally said to have seven colours.', 1, 'Red, orange, yellow, green, blue, indigo and violet.'],
      ['The Mona Lisa hangs in the Louvre in Paris.', 1, 'It is one of the most visited paintings in the world.'],
      ['A sonnet traditionally has 14 lines.', 1, 'Shakespeare wrote more than 150 of them.'],
      ['The bagpipes are a brass instrument.', 0, 'Bagpipes are woodwind instruments with reeds.']
    ]
  };
  const TF = [];
  for (const [cat, rows] of Object.entries(TF_DATA)) for (const [q, a, e] of rows) TF.push({ q, a: !!a, e, cat });

  Ameplay.register({
    id: 'true-false',
    title: 'True or False',
    category: 'Quiz',
    better: 'high',
    width: 760,
    blurb: 'Rapid-fire facts. Decide true or false before the timer runs out.',
    help: '<kbd>←</kbd> or <kbd>F</kbd> false · <kbd>→</kbd> or <kbd>T</kbd> true · or tap the big buttons',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="32" r="13"/><path d="M14 32l4.5 4.5L27 28"/><circle cx="44" cy="32" r="13" fill="currentColor" opacity=".3"/><path d="M39 27l10 10M49 27L39 37"/></svg>',
    css: `
.gm-true-false{gap:14px}
.gm-true-false .tf-hud{display:flex;align-items:center;justify-content:space-between;gap:10px;width:min(640px,100%)}
.gm-true-false .tf-lives{display:flex;gap:6px}
.gm-true-false .tf-lives svg{width:28px;height:28px;fill:#ff5470;filter:drop-shadow(0 2px 3px rgba(255,84,112,.35))}
.gm-true-false .tf-lives svg.gone{fill:var(--line-2);filter:none;animation:gmTfHeart .45s var(--ease)}
.gm-true-false .tf-score{font:900 30px/1 var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.gm-true-false .tf-score.bump{animation:gmTfBump .35s var(--spring)}
.gm-true-false .tf-mult{display:flex;align-items:center;gap:8px;height:38px;padding:0 6px 0 14px;border-radius:999px;background:var(--sunk);font:800 12.5px/1 var(--sans);color:var(--muted)}
.gm-true-false .tf-mult b{display:grid;place-items:center;min-width:42px;height:28px;padding:0 8px;border-radius:999px;background:linear-gradient(135deg,#ffb238,#ff6b3d);color:#fff;font:900 15px/1 var(--sans)}
.gm-true-false .tf-mult b.pop{animation:gmTfBump .45s var(--spring)}
.gm-true-false .tf-stage{position:relative;width:min(640px,100%);padding:clamp(14px,3vw,22px);border-radius:26px;background:linear-gradient(135deg,#4f8dff 0%,#6c5ce7 55%,#b05cf0 100%);box-shadow:0 18px 40px -22px rgba(76,60,200,.7)}
.gm-true-false .tf-card{position:relative;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:26px 22px;border-radius:20px;background:#fff;text-align:center;box-shadow:0 8px 0 rgba(30,20,90,.18);overflow:hidden}
.gm-true-false .tf-card.in{animation:gmTfIn .38s var(--spring)}
.gm-true-false .tf-card.ok{box-shadow:0 8px 0 rgba(30,20,90,.18),inset 0 0 0 4px var(--good)}
.gm-true-false .tf-card.no{box-shadow:0 8px 0 rgba(30,20,90,.18),inset 0 0 0 4px var(--bad);animation:gmTfShake .4s var(--ease)}
.gm-true-false .tf-cat{padding:5px 12px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font:900 11px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase}
.gm-true-false .tf-q{margin:0;max-width:30em;font:900 clamp(19px,3.2vw,26px)/1.3 var(--sans);letter-spacing:-.01em;color:var(--ink)}
.gm-true-false .tf-exp{max-width:32em;padding:10px 14px;border-radius:12px;background:#fff1f1;color:#a12b2b;font:700 14.5px/1.45 var(--sans)}
.gm-true-false .tf-exp b{color:#7d1d1d}
.gm-true-false .tf-stamp{position:absolute;top:14px;right:16px;padding:4px 10px;border:3px solid;border-radius:8px;font:900 15px/1 var(--sans);letter-spacing:.08em;transform:rotate(8deg);animation:gmTfStamp .3s var(--spring)}
.gm-true-false .tf-stamp.t{color:var(--good)}
.gm-true-false .tf-stamp.f{color:var(--bad)}
.gm-true-false .tf-float{position:absolute;left:50%;top:44%;font:900 30px/1 var(--sans);color:var(--good);pointer-events:none;animation:gmTfFloat .8s var(--ease) forwards}
.gm-true-false .tf-timer{height:12px;margin-top:14px;border-radius:999px;background:rgba(255,255,255,.28);overflow:hidden}
.gm-true-false .tf-timer i{display:block;height:100%;border-radius:inherit;background:#7dffb8;transform-origin:0 50%}
.gm-true-false .tf-timer i.mid{background:#ffd166}
.gm-true-false .tf-timer i.low{background:#ff6b6b}
.gm-true-false .tf-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:min(640px,100%)}
.gm-true-false .tf-b{display:flex;align-items:center;justify-content:center;gap:10px;height:clamp(64px,11vw,80px);border:0;border-radius:20px;color:#fff;font:900 clamp(20px,3.4vw,26px)/1 var(--sans);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gm-true-false .tf-b svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.gm-true-false .tf-b kbd{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.3);color:#fff}
.gm-true-false .tf-f{background:linear-gradient(180deg,#ff6b6b,#ef4f4f);box-shadow:0 6px 0 #c23a3a}
.gm-true-false .tf-t{background:linear-gradient(180deg,#34cf95,#22b07d);box-shadow:0 6px 0 #178a60}
.gm-true-false .tf-b.hit{animation:gmTfPress .22s var(--ease)}
.gm-true-false .tf-b:disabled{opacity:.55}
@media (max-width:520px){.gm-true-false .tf-b kbd{display:none}.gm-true-false .tf-card{min-height:180px;padding:22px 16px}.gm-true-false .tf-mult span{display:none}}
@keyframes gmTfIn{from{opacity:0;transform:translateX(40px) scale(.96)}}
@keyframes gmTfShake{20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(2px)}}
@keyframes gmTfStamp{from{transform:rotate(8deg) scale(2);opacity:0}}
@keyframes gmTfFloat{from{transform:translate(-50%,0);opacity:1}to{transform:translate(-50%,-50px);opacity:0}}
@keyframes gmTfBump{40%{transform:scale(1.25)}}
@keyframes gmTfPress{40%{transform:translateY(4px) scale(.97)}}
@keyframes gmTfHeart{0%{transform:scale(1.5)}}
`,
    mount(root, api) {
      const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21C5 15.6 2 12.4 2 8.6 2 5.5 4.4 3 7.4 3c1.9 0 3.6 1 4.6 2.5C13 4 14.7 3 16.6 3 19.6 3 22 5.5 22 8.6c0 3.8-3 7-10 12.4z"/></svg>';
      root.innerHTML = `<div class="tf-hud">
          <div class="tf-lives">${HEART.repeat(3)}</div>
          <div class="tf-score" data-s>0</div>
          <div class="tf-mult"><span data-st>Streak 0</span><b data-x>x1</b></div>
        </div>
        <div class="tf-stage">
          <div class="tf-card"><span class="tf-cat" data-c>Ready</span><p class="tf-q" data-q>Press Play to start.</p><div class="tf-exp" data-e hidden></div></div>
          <div class="tf-timer"><i data-bar></i></div>
        </div>
        <div class="tf-btns">
          <button type="button" class="tf-b tf-f" data-a="0"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>False<kbd>←</kbd></button>
          <button type="button" class="tf-b tf-t" data-a="1"><svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></svg>True<kbd>→</kbd></button>
        </div>`;
      const $ = s => root.querySelector(s);
      const card = $('.tf-card'), qEl = $('[data-q]'), cEl = $('[data-c]'), eEl = $('[data-e]'), bar = $('[data-bar]');
      const sEl = $('[data-s]'), xEl = $('[data-x]'), stEl = $('[data-st]'), hearts = [...root.querySelectorAll('.tf-lives svg')];
      const btns = [...root.querySelectorAll('.tf-b')];
      let deck = [], qi = 0, lives = 3, score = 0, streak = 0, bestStreak = 0, correct = 0, mult = 1;
      let phase = 'idle', limit = 1, left = 1, seq = 0, skipAt = 0, barCls = '';

      const multFor = s => 1 + Math.min(4, Math.floor(s / 4));
      function hud() {
        sEl.textContent = score; stEl.textContent = 'Streak ' + streak;
        const m = multFor(streak);
        if (m !== mult) { mult = m; xEl.textContent = 'x' + m; if (m > 1) restart(xEl, 'pop'); }
        hearts.forEach((h, i) => h.classList.toggle('gone', i >= lives));
        api.score(score);
      }
      function setBar(frac) {
        bar.style.transform = `scaleX(${Math.max(0, frac).toFixed(4)})`;
        const cls = frac > .5 ? '' : frac > .25 ? 'mid' : 'low';
        if (cls !== barCls) { bar.className = cls; barCls = cls; }
      }
      function start() {
        deck = shuffle(TF.slice()); qi = -1;
        lives = 3; score = 0; streak = 0; bestStreak = 0; correct = 0; mult = 0;
        hud(); next();
      }
      function next() {
        seq++;
        qi++;
        if (qi >= deck.length) { deck = shuffle(TF.slice()); qi = 0; }
        const f = deck[qi];
        card.classList.remove('ok', 'no');
        card.querySelectorAll('.tf-stamp,.tf-float').forEach(el => el.remove());
        eEl.hidden = true;
        cEl.textContent = f.cat; qEl.textContent = f.q;
        restart(card, 'in');
        limit = Math.max(2.6, 6 - correct * .09) + Math.min(2, f.q.length * .02);
        left = limit; setBar(1);
        phase = 'ask';
      }
      function stamp(isTrue) {
        const s = document.createElement('div');
        s.className = 'tf-stamp ' + (isTrue ? 't' : 'f'); s.textContent = isTrue ? 'TRUE' : 'FALSE';
        card.append(s);
      }
      function answer(v) {
        if (phase === 'reveal') { if (performance.now() >= skipAt) { seq++; lives > 0 ? next() : over(); } return; }
        if (phase !== 'ask') return;
        const f = deck[qi], ok = v === f.a;
        if (v !== null) restart(btns[v ? 1 : 0], 'hit');
        stamp(f.a);
        if (ok) {
          streak++; correct++; bestStreak = Math.max(bestStreak, streak);
          const m = multFor(streak), pts = m * (10 + Math.round(10 * left / limit));
          score += pts;
          card.classList.add('ok');
          const fl = document.createElement('div'); fl.className = 'tf-float'; fl.textContent = '+' + pts; card.append(fl);
          restart(sEl, 'bump');
          api.sfx('good'); hud();
          phase = 'flash';
          const tok = ++seq;
          api.timeout(() => { if (tok === seq) next(); }, 520);
        } else {
          lives--; streak = 0;
          card.classList.add('no');
          eEl.innerHTML = `<b>${f.a ? 'True.' : 'False.'}</b> ${f.e}`;
          eEl.hidden = false;
          if (v === null) cEl.textContent = 'Time’s up';
          api.sfx(lives > 0 ? 'bad' : 'lose'); hud();
          phase = 'reveal'; skipAt = performance.now() + 700;
          const tok = ++seq;
          api.timeout(() => { if (tok === seq) lives > 0 ? next() : over(); }, 3200);
        }
      }
      function over() {
        phase = 'over'; setBar(0);
        const isBest = score > 0 && api.submit(score);
        api.overlay({
          kicker: isBest ? 'New best!' : 'Game over',
          title: score + ' points',
          text: correct ? `You got ${correct} right with a best streak of ${bestStreak}.` : 'Out of lives. Read fast, answer faster!',
          stats: [['Score', score], ['Correct', correct], ['Streak', bestStreak], ['Best', api.best ?? '—']],
          button: 'Play again', onAction: start
        });
      }

      btns.forEach(b => b.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); answer(b.dataset.a === '1'); }));
      card.addEventListener('pointerdown', () => { if (phase === 'reveal') answer(undefined); });
      api.on(window, 'keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.code === 'ArrowLeft' || e.code === 'KeyF') answer(false);
        else if (e.code === 'ArrowRight' || e.code === 'KeyT') answer(true);
      });
      api.loop(dt => {
        if (phase !== 'ask') return;
        left -= dt;
        setBar(left / limit);
        if (left <= 0) answer(null);
      });

      hud(); setBar(1);
      api.overlay({
        kicker: 'Quiz', title: 'True or False',
        text: 'Statements fly in fast. Decide if each is true or false before the bar runs out. Streaks raise your multiplier, three mistakes and you’re out.',
        stats: api.best != null ? [['Best', api.best]] : null,
        button: 'Play', onAction: start
      });
    }
  });
})();

