
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIn = t => t * t * t;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const RK = id => id % 13 + 1;
  const ST = id => (id / 13) | 0;
  const RL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SN = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  const SG = ['\u2660', '\u2665', '\u2666', '\u2663'];
  const RN = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King'];
  const cardName = id => RN[RK(id)] + ' of ' + SN[ST(id)];
  const RED = '#d4272d', BLK = '#15161d';
  const suitCol = s => s === 1 || s === 2 ? RED : BLK;
  const deck52 = () => [...Array(52).keys()];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const NAMES = ['Rosa', 'Theo', 'Kai', 'Mila', 'Otto', 'Jade', 'Leo', 'Nora', 'Ivy', 'Finn', 'Zoe', 'Hugo'];
  const AVC = ['#e8553d', '#f2a93b', '#3fae6a', '#3a8fe0', '#8d5fd3', '#e05a9c', '#2fb5b0', '#7c8a99'];
  const SKIN = ['#f6d1b0', '#e9b58f', '#c98f66', '#8e5a3c', '#f2c6a0', '#d9a07a', '#fbdcc0', '#a8704c'];
  const HAIR = ['#3b2a20', '#1c1c24', '#b5651d', '#e1b04a', '#7a3b2e', '#5a5a66', '#2a1a4a', '#c8c8d0'];
  const ICON_MENU = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';

  function suitPath(x, s, z) {
    x.beginPath();
    if (s === 1) {
      x.moveTo(0, .5 * z);
      x.bezierCurveTo(-.95 * z, -.08 * z, -.42 * z, -.68 * z, 0, -.2 * z);
      x.bezierCurveTo(.42 * z, -.68 * z, .95 * z, -.08 * z, 0, .5 * z);
    } else if (s === 2) {
      x.moveTo(0, -.56 * z); x.lineTo(.4 * z, 0); x.lineTo(0, .56 * z); x.lineTo(-.4 * z, 0);
    } else if (s === 0) {
      x.moveTo(0, -.52 * z);
      x.bezierCurveTo(-1.0 * z, .08 * z, -.46 * z, .66 * z, 0, .22 * z);
      x.bezierCurveTo(.46 * z, .66 * z, 1.0 * z, .08 * z, 0, -.52 * z);
      x.moveTo(-.04 * z, .16 * z); x.quadraticCurveTo(-.05 * z, .42 * z, -.24 * z, .54 * z);
      x.lineTo(.24 * z, .54 * z); x.quadraticCurveTo(.05 * z, .42 * z, .04 * z, .16 * z);
    } else {
      const c = (cx, cy, r) => { x.moveTo(cx + r, cy); x.arc(cx, cy, r, 0, TAU); };
      c(0, -.27 * z, .23 * z); c(-.27 * z, .06 * z, .23 * z); c(.27 * z, .06 * z, .23 * z); c(0, -.02 * z, .2 * z);
      x.moveTo(-.04 * z, .1 * z); x.quadraticCurveTo(-.05 * z, .4 * z, -.24 * z, .54 * z);
      x.lineTo(.24 * z, .54 * z); x.quadraticCurveTo(.05 * z, .4 * z, .04 * z, .1 * z);
    }
    x.closePath();
  }
  function rrPath(x, cx, cy, w, h, r) { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, r); }

  const PIPS = {
    2: [[1, 0], [1, 1]],
    3: [[1, 0], [1, .5], [1, 1]],
    4: [[0, 0], [2, 0], [0, 1], [2, 1]],
    5: [[0, 0], [2, 0], [1, .5], [0, 1], [2, 1]],
    6: [[0, 0], [2, 0], [0, .5], [2, .5], [0, 1], [2, 1]],
    7: [[0, 0], [2, 0], [1, .25], [0, .5], [2, .5], [0, 1], [2, 1]],
    8: [[0, 0], [2, 0], [1, .25], [0, .5], [2, .5], [1, .75], [0, 1], [2, 1]],
    9: [[0, 0], [2, 0], [0, 1 / 3], [2, 1 / 3], [1, .5], [0, 2 / 3], [2, 2 / 3], [0, 1], [2, 1]],
    10: [[0, 0], [2, 0], [1, 1 / 6], [0, 1 / 3], [2, 1 / 3], [0, 2 / 3], [2, 2 / 3], [1, 5 / 6], [0, 1], [2, 1]]
  };

  function drawCourt(x, r, s, cw, ch) {
    const red = s === 1 || s === 2, main = red ? '#c8322e' : '#26325c', alt = red ? '#f0b53d' : '#d9a52d';
    const fw = cw * .62, fh = ch * .7;
    x.save();
    x.fillStyle = '#fdf4dd'; x.strokeStyle = suitCol(s); x.lineWidth = Math.max(1, cw * .012);
    x.beginPath(); x.rect(-fw / 2, -fh / 2, fw, fh); x.fill(); x.stroke();
    x.beginPath(); x.rect(-fw / 2, -fh / 2, fw, fh); x.clip();
    x.fillStyle = red ? 'rgba(210,50,45,.07)' : 'rgba(40,50,95,.07)';
    x.fillRect(-fw / 2, -fh / 2, fw, fh / 2);
    for (let h = 0; h < 2; h++) {
      x.save();
      if (h) x.rotate(Math.PI);
      x.translate(0, -fh * .25);
      const u = cw / 100;
      x.fillStyle = main;
      x.beginPath(); x.moveTo(-27 * u, 26 * u); x.quadraticCurveTo(-26 * u, 6 * u, -9 * u, 3 * u); x.lineTo(9 * u, 3 * u); x.quadraticCurveTo(26 * u, 6 * u, 27 * u, 26 * u); x.closePath(); x.fill();
      x.fillStyle = alt; x.beginPath(); x.moveTo(-4 * u, 3 * u); x.lineTo(4 * u, 3 * u); x.lineTo(0, 26 * u); x.closePath(); x.fill();
      x.fillStyle = alt; x.fillRect(-27 * u, 20 * u, 54 * u, 3.4 * u);
      x.fillStyle = '#f2cba2'; x.beginPath(); x.arc(0, -6 * u, 10.5 * u, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 1 * u;
      x.beginPath(); x.arc(-3.8 * u, -7 * u, 1 * u, 0, TAU); x.arc(3.8 * u, -7 * u, 1 * u, 0, TAU); x.fillStyle = '#222'; x.fill();
      x.beginPath(); x.arc(0, -3 * u, 3.4 * u, .2, Math.PI - .2); x.stroke();
      if (r === 13) {
        x.fillStyle = '#6a4a2a'; x.beginPath(); x.moveTo(-9 * u, -3 * u); x.quadraticCurveTo(0, 14 * u, 9 * u, -3 * u); x.quadraticCurveTo(0, 6 * u, -9 * u, -3 * u); x.fill();
        x.fillStyle = alt; x.beginPath(); x.moveTo(-11 * u, -14 * u); x.lineTo(-11 * u, -24 * u); x.lineTo(-5.5 * u, -18 * u); x.lineTo(0, -26 * u); x.lineTo(5.5 * u, -18 * u); x.lineTo(11 * u, -24 * u); x.lineTo(11 * u, -14 * u); x.closePath(); x.fill();
        x.strokeStyle = '#a97910'; x.stroke();
      } else if (r === 12) {
        x.fillStyle = '#7b4a24'; x.beginPath(); x.moveTo(-11.5 * u, -8 * u); x.quadraticCurveTo(-13 * u, -22 * u, 0, -20 * u); x.quadraticCurveTo(13 * u, -22 * u, 11.5 * u, -8 * u); x.lineTo(12 * u, 6 * u); x.lineTo(8 * u, 4 * u); x.lineTo(8 * u, -9 * u); x.quadraticCurveTo(0, -14 * u, -8 * u, -9 * u); x.lineTo(-8 * u, 4 * u); x.lineTo(-12 * u, 6 * u); x.closePath(); x.fill();
        x.fillStyle = alt; x.beginPath(); x.moveTo(-8 * u, -17 * u); x.lineTo(-8 * u, -23 * u); x.lineTo(-3 * u, -19 * u); x.lineTo(0, -25 * u); x.lineTo(3 * u, -19 * u); x.lineTo(8 * u, -23 * u); x.lineTo(8 * u, -17 * u); x.closePath(); x.fill();
      } else {
        x.fillStyle = main; x.beginPath(); x.moveTo(-12 * u, -10 * u); x.quadraticCurveTo(0, -30 * u, 12 * u, -10 * u); x.lineTo(14 * u, -8 * u); x.lineTo(-14 * u, -8 * u); x.closePath(); x.fill();
        x.fillStyle = alt; x.fillRect(-14 * u, -10 * u, 28 * u, 2.4 * u);
        x.strokeStyle = alt; x.lineWidth = 2 * u; x.beginPath(); x.moveTo(8 * u, -15 * u); x.quadraticCurveTo(22 * u, -26 * u, 20 * u, -8 * u); x.stroke();
      }
      x.fillStyle = suitCol(s); x.save(); x.translate(-18 * u, 14 * u); suitPath(x, s, 9 * u); x.fill(); x.restore();
      x.restore();
    }
    x.restore();
  }

  function drawFace(x, id, cw, ch) {
    const r = RK(id), s = ST(id), col = suitCol(s);
    x.fillStyle = '#fff'; x.strokeStyle = 'rgba(30,30,50,.28)'; x.lineWidth = 1;
    rrPath(x, 0, 0, cw, ch, cw * .09); x.fill(); x.stroke();
    x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
    const fs = cw * (r === 10 ? .22 : .26);
    for (let k = 0; k < 2; k++) {
      x.save();
      if (k) x.rotate(Math.PI);
      x.translate(-cw / 2 + cw * .15, -ch / 2 + ch * .1);
      x.font = `900 ${fs}px ${FONT}`; x.fillText(RL[r], 0, 0);
      x.translate(0, cw * .2 + ch * .015); suitPath(x, s, cw * .17); x.fill();
      x.restore();
    }
    if (r >= 11) drawCourt(x, r, s, cw, ch);
    else if (r === 1) { x.save(); suitPath(x, s, s === 0 ? cw * .62 : cw * .54); x.fill(); x.restore(); }
    else {
      const colX = [-cw * .2, 0, cw * .2], y0 = -ch * .29, y1 = ch * .29, z = cw * .21;
      for (const [c, rw] of PIPS[r]) {
        x.save(); x.translate(colX[c], lerp(y0, y1, rw));
        if (rw > .5) x.rotate(Math.PI);
        suitPath(x, s, z); x.fill(); x.restore();
      }
    }
  }

  function drawBack(x, cw, ch, c1, c2) {
    x.fillStyle = '#fff'; x.strokeStyle = 'rgba(30,30,50,.3)'; x.lineWidth = 1;
    rrPath(x, 0, 0, cw, ch, cw * .09); x.fill(); x.stroke();
    const m = cw * .07;
    rrPath(x, 0, 0, cw - m * 2, ch - m * 2, cw * .05);
    const g = x.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
    g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fill();
    x.save(); x.clip();
    x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = Math.max(1, cw * .018);
    const st = cw * .14;
    for (let i = -ch; i < cw + ch; i += st) {
      x.beginPath(); x.moveTo(-cw / 2 + i, -ch / 2); x.lineTo(-cw / 2 + i - ch, ch / 2); x.stroke();
      x.beginPath(); x.moveTo(-cw / 2 + i - ch, -ch / 2); x.lineTo(-cw / 2 + i, ch / 2); x.stroke();
    }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = Math.max(1, cw * .02);
    rrPath(x, 0, 0, cw - m * 3.2, ch - m * 3.2, cw * .04); x.stroke();
    x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(0, 0, cw * .24, cw * .24, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? cw * .08 : cw * .19; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    x.closePath(); x.fill();
  }

  function Core(root, api, c) {
    const K = { api, root, W: c.W, H: c.H, port: false, dpr: 1, t: 0, cw: 84, ch: 118, shake: 0, frame: null, onFit: null, back: c.back || ['#2457b8', '#102e6b'] };
    const wrap = document.createElement('div'); wrap.className = 'cg-wrap';
    const cv = document.createElement('canvas');
    const ui = document.createElement('div'); ui.className = 'cg-ui';
    const pane = document.createElement('div'); pane.className = 'cg-pane'; pane.hidden = true;
    const netEl = document.createElement('div'); netEl.className = 'cg-net'; netEl.hidden = true; netEl.innerHTML = '<i></i><span>Online</span>';
    ui.append(netEl, pane); wrap.append(cv, ui); root.append(wrap);
    const ctx = cv.getContext('2d');
    Object.assign(K, { wrap, cv, ui, pane, ctx, netEl });
    const opt = Object.assign({}, c.defaults || {}, api.load() || {});
    K.opt = opt;
    K.saveOpt = () => api.save(opt);

    let ac = null, master = null, noiseB = null;
    const audio = () => {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
        noiseB = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const nz = (t, dur, f, q, vol, f2, type) => {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noiseB; bp.type = type || 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
    };
    const tn = (t, dur, type, f0, f1, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    };
    K.sfx = (k, d) => {
      if (!audio()) return;
      const t = ac.currentTime + .005 + (d || 0);
      try {
        if (k === 'card') { nz(t, .08, 2600, .8, .42); nz(t, .05, 700, 1, .22); }
        else if (k === 'deal') nz(t, .05, 3400, 1.2, .22);
        else if (k === 'draw') nz(t, .14, 1500, .9, .28, 3800);
        else if (k === 'flip') { nz(t, .06, 3000, 1.1, .3); nz(t + .05, .07, 1200, .8, .22); }
        else if (k === 'slap') { nz(t, .1, 1800, .7, .5); tn(t, .12, 'triangle', 220, 90, .1); }
        else if (k === 'shuf') for (let i = 0; i < 12; i++) nz(t + i * .035, .05, 2200 + Math.random() * 1800, 1.1, .2);
        else if (k === 'eight') [392, 523, 659, 880].forEach((f, i) => tn(t + i * .055, .25, 'triangle', f, f * 1.01, .07));
        else if (k === 'skip') { tn(t, .1, 'square', 440, 300, .045); tn(t + .1, .14, 'square', 300, 180, .045); }
        else if (k === 'rev') { tn(t, .16, 'triangle', 300, 900, .07); tn(t + .16, .16, 'triangle', 900, 300, .07); }
        else if (k === 'plus') { tn(t, .22, 'triangle', 240, 110, .1); nz(t, .1, 300, .8, .18); }
        else if (k === 'turn') { tn(t, .08, 'sine', 880, 880, .045); tn(t + .08, .12, 'sine', 1320, 1320, .04); }
        else if (k === 'bad') tn(t, .14, 'square', 170, 110, .04);
        else if (k === 'tap') tn(t, .05, 'sine', 600, 600, .035);
        else if (k === 'ding') { tn(t, .3, 'sine', 1319, 1319, .06); tn(t, .5, 'sine', 2637, 2637, .02); }
        else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * .09, .3, 'triangle', f, f, .08)); tn(t + .5, .7, 'sine', 1047, 1047, .05); }
        else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * .14, .3, 'triangle', f, f * .98, .07));
        else if (k === 'drum') { tn(t, .22, 'sine', 130, 55, .3); nz(t, .12, 400, .6, .16, 120, 'lowpass'); }
        else if (k === 'roll') for (let i = 0; i < 9; i++) { tn(t + i * .075, .1, 'sine', 120 + i * 6, 60, .12 + i * .012); nz(t + i * .075, .05, 500, .8, .06 + i * .008); }
        else if (k === 'war') { tn(t, .5, 'sawtooth', 110, 55, .09); tn(t, .5, 'square', 165, 82, .04); tn(t + .12, .35, 'sawtooth', 146, 73, .07); nz(t, .45, 900, .5, .12, 100, 'lowpass'); }
        else if (k === 'speed') { tn(t, .1, 'square', 880, 880, .05); tn(t + .1, .22, 'square', 1320, 1760, .05); }
        else if (k === 'tick') tn(t, .04, 'square', 1500, 1500, .03);
        else if (k === 'go') { tn(t, .3, 'square', 1046, 1046, .06); tn(t, .3, 'sine', 523, 523, .06); }
        else if (k === 'whoosh') nz(t, .22, 700, .6, .18, 3200);
      } catch (e) {}
    };
    K.audio = audio;

    const timers = [], flights = [], parts = [], pops = [], banners = [];
    K.after = (s, fn) => { const o = { at: K.t + s, fn }; timers.push(o); return o; };
    K.cancel = o => { const i = timers.indexOf(o); if (i >= 0) timers.splice(i, 1); };
    K.reset = () => { timers.length = 0; flights.length = 0; parts.length = 0; pops.length = 0; banners.length = 0; K.shake = 0; };
    K.flights = flights;
    K.fly = o => { o.t0 = K.t + (o.delay || 0); o.dur = o.dur || .35; flights.push(o); return o; };
    K.busy = () => flights.length > 0;

    const sprites = new Map();
    K.setCard = (cw, ch) => { if (cw !== K.cw || ch !== K.ch) { K.cw = cw; K.ch = ch; sprites.clear(); } };
    const pad = () => Math.ceil(K.cw * .14);
    const spr = id => {
      const key = id < 0 ? 'b' + (K.backKey || '') : id;
      let s = sprites.get(key);
      if (s) return s;
      const cw = K.cw, ch = K.ch, p = pad(), k = K.dpr * 1.25;
      const c2 = document.createElement('canvas');
      c2.width = Math.ceil((cw + p * 2) * k); c2.height = Math.ceil((ch + p * 2) * k);
      const x = c2.getContext('2d'); x.scale(k, k); x.translate(cw / 2 + p, ch / 2 + p);
      x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = cw * .08; x.shadowOffsetY = cw * .04;
      if (id < 0) drawBack(x, cw, ch, K.back[0], K.back[1]); else drawFace(x, id, cw, ch);
      s = { c: c2, w: cw + p * 2, h: ch + p * 2 };
      sprites.set(key, s);
      return s;
    };
    K.setBack = (a, b) => { K.back = [a, b]; K.backKey = a + b; };
    K.card = (id, x, y, rot, s, o) => {
      const sp = spr(id);
      ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
      const sx = o && o.sx != null ? o.sx : 1;
      ctx.scale((s || 1) * sx, s || 1);
      if (o && o.alpha != null) ctx.globalAlpha = o.alpha;
      if (o && o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 20; }
      ctx.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
      if (o && o.dim) { ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(8,12,24,' + o.dim + ')'; rrPath(ctx, 0, 0, K.cw, K.ch, K.cw * .09); ctx.fill(); }
      ctx.restore();
    };
    K.rr = (x, y, w, h, r, fill, stroke, lw) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
    };
    K.text = (s, x, y, size, fill, o) => {
      o = o || {};
      ctx.save();
      ctx.font = `${o.weight || 900} ${size}px ${FONT}`;
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
      if (o.alpha != null) ctx.globalAlpha = o.alpha;
      if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 6; ctx.shadowOffsetY = 2; }
      if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || size * .16; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
      ctx.fillStyle = fill; ctx.fillText(s, x, y);
      ctx.restore();
    };
    K.suit = (s, x, y, z, fill, alpha) => {
      ctx.save(); ctx.translate(x, y); if (alpha != null) ctx.globalAlpha = alpha;
      ctx.fillStyle = fill || suitCol(s); suitPath(ctx, s, z); ctx.fill(); ctx.restore();
    };
    K.avatar = (cx, cy, r, i, o) => {
      o = o || {};
      ctx.save(); ctx.translate(cx, cy);
      if (o.ring) { ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, TAU); ctx.fillStyle = o.ring; ctx.shadowColor = o.ring; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0; }
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = AVC[i % 8]; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(0, r * .95, r * .75, r * .5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = SKIN[(i * 3 + 1) % 8]; ctx.beginPath(); ctx.arc(0, r * .05, r * .5, 0, TAU); ctx.fill();
      const hc = HAIR[(i * 5 + 2) % 8], kind = (i * 7 + 3) % 5;
      ctx.fillStyle = hc;
      if (kind === 0) { ctx.beginPath(); ctx.arc(0, -r * .1, r * .53, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); }
      else if (kind === 1) { ctx.beginPath(); ctx.arc(0, -r * .08, r * .55, Math.PI, TAU); ctx.lineTo(r * .55, r * .4); ctx.lineTo(r * .4, r * .4); ctx.lineTo(r * .4, -r * .1); ctx.lineTo(-r * .4, -r * .1); ctx.lineTo(-r * .4, r * .4); ctx.lineTo(-r * .55, r * .4); ctx.fill(); }
      else if (kind === 2) { ctx.beginPath(); ctx.arc(0, -r * .1, r * .52, Math.PI, TAU); ctx.fill(); ctx.fillStyle = AVC[(i + 3) % 8]; ctx.fillRect(-r * .6, -r * .22, r * 1.2, r * .12); ctx.beginPath(); ctx.arc(0, -r * .25, r * .45, Math.PI, TAU); ctx.fill(); }
      else if (kind === 3) { ctx.beginPath(); ctx.arc(0, -r * .12, r * .55, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.beginPath(); ctx.arc(-r * .5, -r * .02, r * .17, 0, TAU); ctx.arc(r * .5, -r * .02, r * .17, 0, TAU); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, -r * .16, r * .5, Math.PI, TAU); ctx.fill(); ctx.fillRect(-r * .5, -r * .16, r * .12, r * .4); ctx.fillRect(r * .38, -r * .16, r * .12, r * .4); }
      ctx.fillStyle = '#1b1b24';
      ctx.beginPath(); ctx.arc(-r * .18, r * .02, r * .06, 0, TAU); ctx.arc(r * .18, r * .02, r * .06, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#1b1b24'; ctx.lineWidth = Math.max(1, r * .05); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, r * .14, r * .17, .25, Math.PI - .25); ctx.stroke();
      if (i % 3 === 1) { ctx.beginPath(); ctx.arc(-r * .18, r * .02, r * .13, 0, TAU); ctx.moveTo(r * .31, r * .02); ctx.arc(r * .18, r * .02, r * .13, 0, TAU); ctx.moveTo(-r * .05, r * .02); ctx.lineTo(r * .05, r * .02); ctx.stroke(); }
      ctx.restore();
      ctx.lineWidth = 2; ctx.strokeStyle = o.edge || 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      if (o.dim) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); }
      ctx.restore();
    };

    K.burst = (x, y, n, o) => {
      o = o || {};
      const cols = o.colors || ['#ffd23f', '#ff5d73', '#4cc9f0', '#7bd88f', '#fff'];
      for (let i = 0; i < n; i++) {
        const a = o.up ? -Math.PI / 2 + rnd(-o.spread || -.9, o.spread || .9) : rnd(0, TAU), sp = rnd(o.min || 90, o.max || 380);
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g == null ? 520 : o.g, life: rnd(.7, 1.5) * (o.life || 1), age: 0, size: rnd(o.s0 || 4, o.s1 || 9), col: pick(cols), rot: rnd(0, TAU), vr: rnd(-9, 9), shape: o.shape || 'rect' });
      }
    };
    K.pop = (text, x, y, o) => {
      o = o || {};
      pops.push({ text, x, y, col: o.color || '#fff', size: o.size || 26, t0: K.t, life: o.life || 1.1, rise: o.rise == null ? 46 : o.rise, stroke: o.stroke || '#121214' });
    };
    K.banner = (text, sub, o) => {
      o = o || {};
      banners.push({ text, sub, t0: K.t, dur: o.dur || 1.5, c1: o.c1 || '#ffd23f', c2: o.c2 || '#ff7a18', band: o.band || 'rgba(10,10,20,.62)', size: o.size || 72, y: o.y });
    };

    const drawFx = dt => {
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i];
        if (K.t < f.t0) { if (f.hold) K.card(f.id, f.x0, f.y0, f.r0 || 0, f.s0 == null ? 1 : f.s0); continue; }
        const p = clamp((K.t - f.t0) / f.dur, 0, 1), e = (f.ease || easeInOut)(p);
        if (f.tgt) { const q = f.tgt(); f.x1 = q[0]; f.y1 = q[1]; f.r1 = q[2]; if (q[3] != null) f.s1 = q[3]; }
        const x = lerp(f.x0, f.x1, e), y = lerp(f.y0, f.y1, e) - (f.arc ? Math.sin(p * Math.PI) * f.arc : 0);
        const r = lerp(f.r0 || 0, f.r1 || 0, e), s = lerp(f.s0 == null ? 1 : f.s0, f.s1 == null ? 1 : f.s1, e) * (f.lift ? 1 + Math.sin(p * Math.PI) * f.lift : 1);
        let id = f.id, sx = 1;
        if (f.flip) {
          const q = clamp((p - (f.fa || 0)) / (f.fb || 1 - (f.fa || 0)), 0, 1);
          sx = Math.abs(Math.cos(q * Math.PI)); id = q < .5 ? -1 : f.id;
          if (sx < .02) sx = .02;
        }
        K.card(id, x, y, r, s, { sx, alpha: f.alpha, glow: f.glow });
        if (p >= 1) { flights.splice(i, 1); if (f.done) f.done(); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.age += dt;
        if (q.age > q.life) { parts.splice(i, 1); continue; }
        q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt; q.vx *= 1 - dt * .6;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.globalAlpha = clamp((q.life - q.age) / .4, 0, 1); ctx.fillStyle = q.col;
        if (q.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, q.size * .5, 0, TAU); ctx.fill(); }
        else if (q.shape === 'spark') { ctx.fillRect(-q.size * .15, -q.size, q.size * .3, q.size * 2); }
        else ctx.fillRect(-q.size / 2, -q.size / 3, q.size, q.size * .66);
        ctx.restore();
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const q = pops[i], p = (K.t - q.t0) / q.life;
        if (p >= 1) { pops.splice(i, 1); continue; }
        K.text(q.text, q.x, q.y - q.rise * easeOut(p), q.size * (p < .15 ? .6 + easeBack(p / .15) * .4 : 1), q.col, { stroke: q.stroke, alpha: p > .7 ? (1 - p) / .3 : 1 });
      }
      for (let i = banners.length - 1; i >= 0; i--) {
        const b = banners[i], p = (K.t - b.t0) / b.dur;
        if (p >= 1) { banners.splice(i, 1); continue; }
        const sc = p < .14 ? .3 + easeBack(p / .14) * .7 : 1 + Math.sin(p * 9) * .01, al = p > .8 ? (1 - p) / .2 : 1, y = b.y == null ? K.H * .42 : b.y;
        ctx.save(); ctx.globalAlpha = al;
        const bh = b.size * 1.5 * Math.min(1, sc);
        ctx.fillStyle = b.band; ctx.fillRect(0, y - bh / 2, K.W, bh);
        ctx.translate(K.W / 2, y); ctx.scale(sc, sc);
        const g = ctx.createLinearGradient(0, -b.size / 2, 0, b.size / 2); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2);
        K.text(b.text, 0, 0, b.size, g, { stroke: '#121214', lw: b.size * .12, shadow: 'rgba(0,0,0,.5)', blur: 14 });
        if (b.sub) K.text(b.sub, 0, b.size * .62, b.size * .27, '#fff', { stroke: '#121214', weight: 800 });
        ctx.restore();
      }
    };
    K.fxActive = () => flights.length > 0 || banners.length > 0;

    K.loop = fn => {
      api.loop((dtc, tt) => {
        const dt = dtc;
        K.t += dt;
        for (let i = 0; i < timers.length;) {
          if (timers[i].at <= K.t) { const o = timers.splice(i, 1)[0]; try { o.fn(); } catch (e) { console.error(e); } } else i++;
        }
        ctx.save();
        if (K.shake > .2) { ctx.translate(rnd(-K.shake, K.shake), rnd(-K.shake, K.shake)); K.shake *= Math.pow(.02, dt); } else K.shake = 0;
        if (K.bgc) ctx.drawImage(K.bgc, 0, 0, K.W, K.H);
        fn(dt, K.t);
        drawFx(dt);
        ctx.restore();
      });
    };

    K.fit = force => {
      const port = (root.clientWidth || 800) < 640;
      if (!force && port === K.port && K.W) return;
      K.port = port; K.W = port ? c.PW : c.W; K.H = port ? c.PH : c.H;
      K.dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(K.W * K.dpr); cv.height = Math.round(K.H * K.dpr); ctx.setTransform(K.dpr, 0, 0, K.dpr, 0, 0);
      wrap.style.width = `min(100%, ${K.W}px, calc((100dvh - var(--goff, 250px)) * ${(K.W / K.H).toFixed(4)}))`;
      wrap.style.aspectRatio = `${K.W} / ${K.H}`;
      wrap.classList.toggle('cg-port', port);
      sprites.clear();
      const b = document.createElement('canvas'); b.width = Math.round(K.W * K.dpr); b.height = Math.round(K.H * K.dpr);
      const bx = b.getContext('2d'); bx.scale(K.dpr, K.dpr); c.bg(bx, K.W, K.H, port); K.bgc = b;
      if (K.onFit) K.onFit();
    };
    api.on(window, 'resize', () => K.fit(false));
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => K.fit(false)); ro.observe(root); api.alive && (K.ro = ro); }

    K.pct = (el, x, y) => { el.style.left = (x / K.W * 100) + '%'; el.style.top = (y / K.H * 100) + '%'; };
    K.loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * K.W / r.width, y: (e.clientY - r.top) * K.H / r.height }; };

    let paneFn = null;
    K.show = (html, fn, cls) => { pane.className = 'cg-pane' + (cls ? ' ' + cls : ''); pane.innerHTML = html; pane.hidden = false; paneFn = fn || null; pane.scrollTop = 0; };
    K.hide = () => { pane.hidden = true; pane.innerHTML = ''; paneFn = null; };
    K.paneOpen = () => !pane.hidden;
    K.seg = (key, items, cur) => `<div class="cg-seg" data-k="${key}">${items.map(([v, l]) => `<button type="button" data-o="${key}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    K.optRow = (label, sub, key, items) => `<div class="cg-opt"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span>${K.seg(key, items, opt[key])}</div>`;
    api.on(pane, 'click', e => {
      const o = e.target.closest('[data-o]');
      if (o) {
        const k = o.dataset.o; let v = o.dataset.v;
        if (v === 'true') v = true; else if (v === 'false') v = false; else if (v !== '' && !isNaN(+v)) v = +v;
        opt[k] = v; K.saveOpt(); K.sfx('tap');
        o.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === o));
        if (K.onOpt) K.onOpt(k, v);
        return;
      }
      const b = e.target.closest('[data-a]');
      if (!b) return;
      K.sfx('tap');
      if (paneFn) paneFn(b.dataset.a, b);
    });
    K.btn = (cls, html, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = html; if (label) b.setAttribute('aria-label', label); ui.append(b); return b; };
    K.menuBtn = K.btn('cg-ico', ICON_MENU, 'Menu'); K.menuBtn.hidden = true;
    K.netBadge = (txt, bad) => { netEl.hidden = !txt; if (txt) { netEl.lastChild.textContent = txt; netEl.classList.toggle('bad', !!bad); } };
    K.rules = html => `<div class="cg-rules">${html}</div>`;
    return K;
  }

  const SHARED_CSS = `
.GM{gap:0}
.GM [hidden]{display:none!important}
.GM .cg-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(10,20,30,.3);touch-action:none;background:#14301f;font-family:var(--sans)}
.GM .cg-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.GM .cg-ui{position:absolute;inset:0;pointer-events:none;color:#fff}
.GM .cg-ui button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.GM .cg-ico{position:absolute;left:10px;top:10px;width:44px;height:44px;border-radius:14px;border:2px solid rgba(255,255,255,.22);background:rgba(0,0,0,.3);color:#fff;display:grid;place-items:center;padding:0;z-index:3}
.GM .cg-ico:hover{background:rgba(0,0,0,.45)}
.GM .cg-net{position:absolute;right:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.34);font:800 11px var(--sans);z-index:3}
.GM .cg-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.GM .cg-net.bad i{background:#ff5b4b}
.GM .cg-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;pointer-events:auto;background:rgba(3,10,16,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y;z-index:5}
.GM .cg-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.GM .cg-pane.top{align-items:flex-start;padding-top:48px}
.GM .cg-box{width:100%;max-width:400px;margin:auto;background:linear-gradient(#27345a,#141b33);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:cg-in .22s ease-out}
.GM .cg-box.wide{max-width:540px}
@keyframes cg-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.GM .cg-box h3{margin:2px 0 8px;font:900 23px var(--sans);letter-spacing:.2px;color:#fff}
.GM .cg-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.GM .cg-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--cg-hi,#ffd23f)!important;margin:0 0 2px!important}
.GM .cg-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px;transition:transform .12s}
.GM .cg-big:hover{transform:translateY(-1px)}
.GM .cg-big:active{transform:translateY(2px)}
.GM .cg-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
.GM .cg-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.GM .cg-big.blue{background:linear-gradient(#3d8cf0,#1659b5)}
.GM .cg-big.red{background:linear-gradient(#ff6a55,#cf2a1c)}
.GM .cg-big.gold{background:linear-gradient(#ffd84a,#e6a000);color:#2a1e00;text-shadow:none}
.GM .cg-big.slate{background:linear-gradient(#56627f,#333c58)}
.GM .cg-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.GM .cg-sm:hover{background:rgba(255,255,255,.2)}
.GM .cg-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.GM .cg-opt{display:flex;align-items:center;gap:10px;margin:8px 0;text-align:left}
.GM .cg-opt>span{flex:0 0 36%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
.GM .cg-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
.GM .cg-seg{flex:1;display:flex;gap:5px}
.GM .cg-seg button{flex:1;min-height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 4px}
.GM .cg-seg button.on{background:var(--cg-hi,#ffd23f);border-color:#fff;color:#1b1b1f}
.GM .cg-sec{margin:12px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:var(--cg-hi,#ffd23f)!important}
.GM .cg-logo{display:inline-block;margin:6px 0 4px;font:900 54px/.95 var(--sans);font-style:italic;letter-spacing:-1px;color:var(--cg-logo,#ffe27a);-webkit-text-stroke:3px #121214;paint-order:stroke fill;text-shadow:3px 4px 0 #121214,0 10px 22px rgba(0,0,0,.45)}
.GM .cg-tag{font:800 13px var(--sans);color:rgba(255,255,255,.85);margin:6px 0 10px;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.GM .cg-title{width:100%;max-width:380px;text-align:center;margin:auto}
.GM .cg-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans);color:#fff}
.GM .cg-tbl td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.GM .cg-tbl td:first-child{text-align:left}
.GM .cg-tbl tr.win td{color:var(--cg-hi,#ffd23f)}
.GM .cg-tbl i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.GM .cg-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:3px}
.GM .cg-bar b{display:block;height:100%;background:var(--cg-hi,#ffd23f);border-radius:3px}
.GM .cg-rules{text-align:left}
.GM .cg-rules p{font:700 13px/1.45 var(--sans)!important}
.GM .cg-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.GM .cg-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 6px}
.GM .cg-cols button{height:74px;border-radius:18px;border:4px solid #fff;font:900 17px var(--sans);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.3);box-shadow:inset 0 -6px 0 rgba(0,0,0,.2),0 6px 14px rgba(0,0,0,.3)}
.GM .cg-stats{display:flex;margin:10px 0;border-radius:14px;background:rgba(255,255,255,.08);overflow:hidden}
.GM .cg-stats div{flex:1;padding:8px 6px;border-right:1px solid rgba(255,255,255,.1)}
.GM .cg-stats div:last-child{border-right:0}
.GM .cg-stats span{display:block;font:900 9.5px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.GM .cg-stats b{font:900 19px var(--sans);font-variant-numeric:tabular-nums}
`;
  const css = (id, extra) => SHARED_CSS.replace(/\.GM/g, '.gm-' + id) + (extra || '').replace(/\.GM/g, '.gm-' + id);

  const iconSvg = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const CE_PTS = id => { const r = RK(id); return r === 8 ? 50 : r >= 10 ? 10 : r; };
  const CE_RULES = { draw: 'until', special: false, target: 100 };

  function CEGame(o) {
    const n = o.n, rules = Object.assign({}, CE_RULES, o.rules);
    const s = { n, scores: Array(n).fill(0), dealer: Math.floor(Math.random() * n), round: 0, stock: [], disc: [], hands: [], turn: 0, dir: 1, suit: 0, phase: 'idle', drew: false, passes: 0, winner: -1, champ: -1, tid: 0 };
    let ev = [];
    const E = e => ev.push(e);
    const nxt = (p, k = 1) => ((p + s.dir * k) % n + n) % n;
    const top = () => s.disc[s.disc.length - 1];
    const legal = id => RK(id) === 8 || ST(id) === s.suit || RK(id) === RK(top());
    const hasLegal = p => s.hands[p].some(legal);
    const snap = () => s.hands.map(h => h.slice());
    const dead = () => !s.stock.length;

    function draw1(p) {
      if (!s.stock.length) return -1;
      const id = s.stock.pop();
      s.hands[p].push(id);
      return id;
    }
    function drawN(p, k) {
      const ids = [];
      for (let i = 0; i < k; i++) { const id = draw1(p); if (id < 0) break; ids.push(id); }
      if (ids.length) E({ k: 'draw', p, ids });
      return ids;
    }
    function endRound(w, blocked) {
      let pts = 0;
      for (let q = 0; q < n; q++) if (q !== w) for (const id of s.hands[q]) pts += CE_PTS(id);
      if (blocked) pts -= s.hands[w].reduce((a, id) => a + CE_PTS(id), 0);
      s.scores[w] += pts; s.winner = w;
      const done = !rules.target || s.scores[w] >= rules.target;
      s.phase = done ? 'done' : 'end';
      if (done) { let b = 0; for (let q = 1; q < n; q++) if (s.scores[q] > s.scores[b]) b = q; s.champ = b; }
      E({ k: 'end', w, pts, blocked: !!blocked, hands: snap(), scores: s.scores.slice(), done, champ: s.champ });
    }
    function blockedEnd() {
      let w = 0, bp = 1e9, bc = 1e9;
      for (let q = 0; q < n; q++) {
        const p = s.hands[q].reduce((a, id) => a + CE_PTS(id), 0);
        if (p < bp || (p === bp && s.hands[q].length < bc)) { w = q; bp = p; bc = s.hands[q].length; }
      }
      endRound(w, true);
    }
    function pass(p) {
      E({ k: 'pass', p });
      if (dead()) { s.passes++; if (s.passes >= n) return blockedEnd(); } else s.passes = 0;
      begin(nxt(p));
    }
    function begin(p) {
      s.turn = p; s.drew = false; s.phase = 'play'; s.tid++;
      E({ k: 'turn', p });
      if (dead() && !hasLegal(p)) pass(p);
    }
    const g = {
      s, rules, legal, hasLegal,
      take() { const e = ev; ev = []; return e; },
      deal() {
        s.round++;
        if (s.round > 1) s.dealer = (s.dealer + 1) % n;
        s.stock = shuffle(deck52()); s.disc = []; s.hands = Array.from({ length: n }, () => []);
        s.dir = 1; s.passes = 0; s.winner = -1; s.champ = -1;
        const k = n === 2 ? 7 : 5;
        for (let r = 0; r < k; r++) for (let i = 1; i <= n; i++) s.hands[(s.dealer + i) % n].push(s.stock.pop());
        E({ k: 'deal', dealer: s.dealer, hands: snap() });
        let t = s.stock.pop();
        while (RK(t) === 8) { s.stock.unshift(t); t = s.stock.pop(); }
        s.disc.push(t); s.suit = ST(t);
        E({ k: 'flip', id: t });
        begin((s.dealer + 1) % n);
      },
      act(p, a) {
        if (!a || !(p >= 0 && p < n) || s.phase !== 'play' || p !== s.turn) return false;
        if (a.t === 'play') {
          const id = a.id, h = s.hands[p];
          if (!Number.isInteger(id) || !h.includes(id) || !legal(id)) return false;
          if (RK(id) === 8 && !(Number.isInteger(a.suit) && a.suit >= 0 && a.suit < 4)) return false;
          h.splice(h.indexOf(id), 1); s.disc.push(id);
          s.suit = RK(id) === 8 ? a.suit : ST(id); s.passes = 0;
          E({ k: 'play', p, id, suit: s.suit });
          if (!h.length) { endRound(p); return true; }
          const r = RK(id);
          if (rules.special && r === 2) {
            const q = nxt(p); drawN(q, 2); E({ k: 'skip', p: q }); begin(nxt(p, 2));
          } else if (rules.special && r === 12) {
            const q = nxt(p); E({ k: 'skip', p: q }); begin(nxt(p, 2));
          } else if (rules.special && r === 1) {
            s.dir = -s.dir; E({ k: 'rev', dir: s.dir });
            if (n === 2) { E({ k: 'skip', p: nxt(p) }); begin(p); } else begin(nxt(p));
          } else begin(nxt(p));
          return true;
        }
        if (a.t === 'draw') {
          if (hasLegal(p) || s.drew) return false;
          const ids = [];
          const lim = rules.draw === 'one' ? 1 : 200;
          for (let i = 0; i < lim; i++) {
            const id = draw1(p);
            if (id < 0) break;
            ids.push(id);
            if (legal(id)) break;
          }
          if (ids.length) E({ k: 'draw', p, ids });
          if (ids.length) s.passes = 0;
          if (ids.length && legal(ids[ids.length - 1])) { s.drew = true; s.tid++; E({ k: 'drew', p, id: ids[ids.length - 1] }); }
          else pass(p);
          return true;
        }
        if (a.t === 'pass') {
          if (!(rules.draw === 'one' && s.drew)) return false;
          pass(p);
          return true;
        }
        return false;
      },
      need() { return s.phase === 'end' || s.phase === 'done' || s.phase === 'idle' ? { k: s.phase, p: -1 } : { k: s.phase, p: s.turn }; },
      view(p) {
        return {
          n, me: p, hand: (s.hands[p] || []).slice(), counts: s.hands.map(h => h.length), top: s.disc.length ? top() : -1, disc: s.disc.slice(-4),
          suit: s.suit, dir: s.dir, turn: s.turn, phase: s.phase, stock: s.stock.length, discN: s.disc.length, scores: s.scores.slice(), drew: s.drew,
          round: s.round, dealer: s.dealer, winner: s.winner, champ: s.champ, rules, tid: s.tid
        };
      }
    };
    return g;
  }

  function ceFilter(e, me) {
    switch (e.k) {
      case 'deal': return { k: 'deal', dealer: e.dealer, counts: e.hands.map(h => h.length), mine: e.hands[me] || [] };
      case 'draw': return { k: 'draw', p: e.p, c: e.ids.length, ids: e.p === me ? e.ids : null };
      case 'drew': return { k: 'drew', p: e.p, id: e.p === me ? e.id : -1 };
      default: return e;
    }
  }

  const CE_AI = {
    Easy: { think: [1.0, 1.8], noise: 6, keep8: false, smart: 0 },
    Normal: { think: [.75, 1.3], noise: 1.2, keep8: true, smart: 1 },
    Hard: { think: [.55, 1.0], noise: 0, keep8: true, smart: 2 }
  };

  function ceBot(g, p, P, lacks) {
    const s = g.s, h = s.hands[p], n = s.n;
    const lg = h.filter(g.legal);
    if (!lg.length) return { t: 'draw' };
    const next = ((p + s.dir) % n + n) % n;
    const lk = (lacks && lacks[next]) || [0, 0, 0, 0];
    const cnt = [0, 0, 0, 0];
    for (const id of h) cnt[ST(id)]++;
    const seen = [0, 0, 0, 0];
    if (P.smart > 1) {
      for (const id of h) seen[ST(id)]++;
      for (const id of s.disc) seen[ST(id)]++;
    }
    const nextLow = s.hands[next].length <= 2;
    const bestSuit = rest => {
      let b = 0, bv = -1e9;
      for (let k = 0; k < 4; k++) {
        let v = 0;
        for (const id of rest) if (ST(id) === k && RK(id) !== 8) v += 3 + CE_PTS(id) * .06;
        if (P.smart) v += lk[k] * (nextLow ? 7 : 3.5);
        if (P.smart > 1) v -= (13 - seen[k]) * .12;
        v += Math.random() * (P.noise * .3 + .2);
        if (v > bv) { bv = v; b = k; }
      }
      return b;
    };
    const mk = id => ({ t: 'play', id, suit: RK(id) === 8 ? bestSuit(h.filter(x => x !== id)) : undefined });
    const non8 = lg.filter(id => RK(id) !== 8), eights = lg.filter(id => RK(id) === 8);
    if (!non8.length) return mk(eights[0]);
    if (h.length === 2 && eights.length) {
      const other = h.find(x => x !== eights[0]);
      if (other != null && !g.legal(other)) return mk(eights[0]);
    }
    const wantEight = eights.length && P.keep8 && (nextLow && h.length > 2 && P.smart > 1 && Math.random() < .35);
    if (wantEight) return mk(eights[0]);
    let best = non8[0], bv = -1e9;
    for (const id of non8) {
      const su = ST(id);
      let v = CE_PTS(id) * .18 + cnt[su] * .7 + Math.random() * P.noise;
      if (P.smart) {
        v += lk[su] * (nextLow ? 6 : 2.5);
        if (su !== s.suit) v += (cnt[su] - 1) * .5;
        if (RK(id) === 12 && g.rules.special) v += nextLow ? 5 : 1;
        if (RK(id) === 2 && g.rules.special) v += nextLow ? 6 : 1.5;
      }
      if (v > bv) { bv = v; best = id; }
    }
    return mk(best);
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const suitImgs = {};
  function suitImg(s, size) {
    const key = s + ':' + size;
    if (suitImgs[key]) return suitImgs[key];
    const c = document.createElement('canvas'); c.width = c.height = size * 2;
    const x = c.getContext('2d'); x.translate(size, size); x.fillStyle = suitCol(s); suitPath(x, s, size * 1.5); x.fill();
    return (suitImgs[key] = c.toDataURL());
  }

  const FELTS = { green: ['#27895a', '#0d4228', '#14301f'], blue: ['#2a5ea0', '#0f2c52', '#10213b'], wine: ['#8a2f45', '#3d1020', '#2a0c16'] };
  function feltBg(x, W, H, port, name) {
    const f = FELTS[name] || FELTS.green;
    const g = x.createRadialGradient(W / 2, H * .46, 20, W / 2, H * .46, Math.max(W, H) * .75);
    g.addColorStop(0, f[0]); g.addColorStop(.6, f[1]); g.addColorStop(1, f[2]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .05; x.fillStyle = '#fff';
    for (let i = 0; i < 1400; i++) x.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
    x.globalAlpha = 1;
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 3;
    x.beginPath(); x.ellipse(W / 2, H * .45, W * .45, H * .36, 0, 0, TAU); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.04)'; x.lineWidth = 2;
    x.beginPath(); x.ellipse(W / 2, H * .45, W * .43, H * .34, 0, 0, TAU); x.stroke();
  }

  const CE_RULES_HTML = `<h3>How to play</h3><div class="cg-rules">
<p><b>Goal:</b> be the first to play every card in your hand. Each player starts with 7 cards (5 when three or more play).</p>
<p><b>On your turn</b> play a card that matches the top card by <b>suit</b> or <b>rank</b>. Tap a card, or drag it onto the pile.</p>
<p><b>Eights are wild.</b> Play one any time and choose the suit the next player must follow.</p>
<p><b>Can't play?</b> Tap the stock to draw. With <b>Draw until you can play</b> you keep drawing until a card fits; with <b>Draw one card</b> you draw once and play it if it fits, otherwise you pass. When the stock runs out you pass instead; if nobody can move the round is blocked and the lowest hand wins.</p>
<p><b>Special cards</b> (optional): 2 makes the next player draw two and miss a turn, Queen skips the next player, Ace reverses direction.</p>
<p><b>Scoring:</b> the winner scores the cards left in the other hands: eights 50, K Q J 10 = 10 each, Ace 1, other cards face value. First to the target (100 by default) wins the game.</p>
<p><kbd>&larr;</kbd><kbd>&rarr;</kbd> pick a card, <kbd>Enter</kbd> play, <kbd>D</kbd> draw, <kbd>P</kbd> pass, <kbd>S</kbd><kbd>H</kbd><kbd>D</kbd><kbd>C</kbd> choose a suit.</p></div>`;

  const CE_CSS = `
.GM .ce-pass{position:absolute;min-width:96px;height:46px;border-radius:23px;border:3px solid #fff;background:linear-gradient(#56627f,#333c58);color:#fff;font:900 16px var(--sans);box-shadow:0 4px 0 #1a2038;transform:translate(-50%,-50%)}
.GM .ce-suits{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 4px}
.GM .ce-suits button{height:84px;border-radius:18px;border:4px solid rgba(0,0,0,.18);background:#fff;display:grid;place-items:center;box-shadow:inset 0 -6px 0 rgba(0,0,0,.1),0 6px 14px rgba(0,0,0,.3);padding:0}
.GM .ce-suits button:hover{border-color:#ffd23f;transform:translateY(-2px)}
.GM .ce-suits img{width:50px;height:50px}
.GM .ce-suits kbd{display:none}
.GM.cg-cep .cg-logo{font-size:46px}
`;

  Ameplay.register({
    id: 'crazy-eights',
    title: 'Crazy Eights',
    category: 'Board',
    tint: '#1f8a4c',
    blurb: 'Match suit or rank, play wild eights and be first to empty your hand. Two to six players, bots or online.',
    help: 'Tap or drag a card to play \u00b7 tap the stock to draw \u00b7 <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> \u00b7 <kbd>D</kbd> draw \u00b7 <kbd>P</kbd> pass \u00b7 <kbd>S</kbd><kbd>H</kbd><kbd>D</kbd><kbd>C</kbd> suit after an 8',
    width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: iconSvg('<rect x="8" y="14" width="26" height="38" rx="4" transform="rotate(-14 21 33)"/><rect x="28" y="10" width="26" height="38" rx="4" transform="rotate(10 41 29)" fill="currentColor" fill-opacity=".12"/><text x="41" y="36" font-size="22" font-weight="900" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial" transform="rotate(10 41 29)">8</text>'),
    css: css('crazy-eights', CE_CSS),
    mount(root, api) {
      const K = Core(root, api, { id: 'crazy-eights', W: 960, H: 600, PW: 360, PH: 640, defaults: { mode: 'cpu', cpus: 3, diff: 'Normal', draw: 'until', special: false, target: 100, felt: 'green', wins: 0 }, bg: (x, W, H, port) => feltBg(x, W, H, port, K.opt.felt) });
      const opt = K.opt, ctx = K.ctx;
      if (!CE_AI[opt.diff]) opt.diff = 'Normal';
      if (![1, 2, 3, 4, 5].includes(+opt.cpus)) opt.cpus = 3;
      const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, cpu: [], human: [], names: [], av: [], pids: [], players: [], lacks: [], lastV: null, awaiting: false, size: 0, bots: false, hooked: false, botTid: -1, paneShown: false, lastEnd: null };
      const D = { n: 2, hand: [], counts: [0, 0], pile: [], stock: 52, suit: -1, dir: 1, turn: -1, scores: [0, 0], chipT: -10, sel: -1, hover: -1 };
      const Q = [];
      let busy = 0, scene = 'title', viewer = 0, L = null, drag = null, picking = null, keyFocus = -1;
      const now = () => K.t;
      const isIdle = () => !Q.length && now() >= busy && !K.busy();
      const rel = p => ((p - viewer) % D.n + D.n) % D.n;
      const nm = p => (p === viewer ? 'You' : M.names[p] || 'Player');
      const view = () => (M.role === 'guest' ? M.lastV : M.eng ? M.eng.view(viewer) : null);
      const legalV = (V, id) => RK(id) === 8 || ST(id) === V.suit || RK(id) === RK(V.top);
      const sortKey = id => ST(id) * 20 + RK(id);

      const bPass = K.btn('ce-pass', 'Pass'); bPass.hidden = true;

      function layout() {
        const P = K.port, n = D.n, W = K.W, H = K.H;
        K.setCard(P ? 58 : 84, P ? 81 : 118);
        const cw = K.cw, ch = K.ch;
        L = { P, cw, ch, av: P ? 19 : 27, fan: P ? .3 : .42 };
        L.stock = { x: P ? W / 2 - 52 : W / 2 - 70, y: P ? 306 : 268 };
        L.disc = { x: P ? W / 2 + 52 : W / 2 + 70, y: L.stock.y };
        const S = P
          ? { 1: [[180, 62]], 2: [[100, 64], [260, 64]], 3: [[62, 70], [180, 56], [298, 70]], 4: [[50, 76], [130, 54], [230, 54], [310, 76]], 5: [[36, 62], [108, 62], [180, 62], [252, 62], [324, 62]] }
          : { 1: [[480, 74]], 2: [[200, 112], [760, 112]], 3: [[104, 258], [480, 74], [856, 258]], 4: [[100, 262], [330, 82], [630, 82], [860, 262]], 5: [[92, 292], [232, 118], [480, 74], [728, 118], [868, 292]] };
        L.seat = [{ x: W / 2, y: H - ch / 2 - 16 }].concat((S[n - 1] || S[1]).map(([x, y]) => ({ x, y })));
        K.pct(bPass, W / 2 + (P ? 100 : 188), H - ch - (P ? 62 : 52) - (D.hand.length > (P ? 7 : 14) ? 40 : 0));
      }
      K.onFit = () => { layout(); D.hand.forEach(e => { e.x = e.tx = L.stock.x; e.y = e.ty = L.stock.y; }); };

      function handSlots(cnt) {
        const P = L.P, cw = L.cw, ch = L.ch, W = K.W, H = K.H;
        const avail = P ? W - 14 : 780, minStep = P ? 30 : 44;
        let perRow = Math.max(1, Math.floor((avail - cw) / minStep) + 1);
        perRow = Math.max(perRow, Math.ceil(cnt / 3));
        const rows = Math.max(1, Math.ceil(cnt / perRow)), rowStep = rows > 2 ? (P ? 36 : 44) : (P ? 48 : 56);
        const bottom = H - 16 - ch / 2, out = [];
        for (let i = 0; i < cnt; i++) {
          const row = Math.floor(i / perRow), inRow = Math.min(perRow, cnt - row * perRow), j = i - row * perRow;
          const step = inRow > 1 ? Math.min(cw * .92, (avail - cw) / (inRow - 1)) : 0, off = j - (inRow - 1) / 2;
          out.push({ x: W / 2 + off * step, y: bottom - (rows - 1 - row) * rowStep + off * off * (P ? .5 : .7), r: off * (P ? .025 : .022), step });
        }
        return out;
      }

      function resetD(n) {
        D.n = n; D.hand = []; D.counts = Array(n).fill(0); D.pile = []; D.stock = 52; D.suit = -1; D.dir = 1; D.turn = -1; D.scores = Array(n).fill(0); D.sel = -1; D.hover = -1;
        Q.length = 0; K.reset(); busy = 0; drag = null; picking = null; M.botTid = -1; M.paneShown = false; M.awaiting = false;
        layout(); bPass.hidden = true;
      }

      function addHand(ids, fromHid) {
        for (const id of ids) D.hand.push({ id, x: L.stock.x, y: L.stock.y, tx: L.stock.x, ty: L.stock.y, tr: 0, r: 0, lift: 0, hid: !!fromHid });
        D.hand.sort((a, b) => sortKey(a.id) - sortKey(b.id));
      }
      function slotsUpdate(dt) {
        const sl = handSlots(D.hand.length), k = 1 - Math.pow(.0005, dt);
        D.hand.forEach((e, i) => {
          const s = sl[i]; e.tx = s.x; e.ty = s.y; e.tr = s.r; e.step = s.step;
          if (e.hid) { e.x = e.tx; e.y = e.ty; e.r = e.tr; return; }
          e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.r += (e.tr - e.r) * k;
          const tl = (drag && drag.e === e) ? 0 : (D.hover === i || keyFocus === i || D.sel === i) ? 22 : 0;
          e.lift += (tl - e.lift) * k;
        });
      }

      const seatPos = p => L.seat[rel(p)];
      const fanPos = p => { const s = seatPos(p); return p === viewer ? { x: s.x, y: s.y } : { x: s.x, y: s.y + L.av + (L.P ? 46 : 64) }; };
      function discTop() { return { x: L.disc.x, y: L.disc.y }; }

      function handleEvent(e) {
        const W = K.W;
        switch (e.k) {
          case 'deal': {
            K.hide(); M.paneShown = false; M.lastEnd = null; M.botTid = -1;
            D.hand = []; D.counts = Array(D.n).fill(0); D.pile = []; D.stock = 52; D.sel = -1; D.dir = 1;
            if (e.mine && e.mine.length) addHand(e.mine, true);
            const cnt = e.counts, k = Math.max(...cnt);
            let c = 0;
            const mine = D.hand.slice();
            const order = [];
            for (let r = 0; r < k; r++) for (let i = 1; i <= D.n; i++) { const p = (e.dealer + i) % D.n; if (r < cnt[p]) order.push([p, r]); }
            order.forEach(([p, r], idx) => {
              const dl = idx * .06;
              const done = () => { D.counts[p]++; K.sfx('deal'); };
              if (p === viewer) {
                const ent = mine[r];
                K.fly({ id: -1, x0: L.stock.x, y0: L.stock.y, r0: 0, s0: 1, tgt: () => [ent.tx, ent.ty, ent.tr, 1], x1: ent.tx, y1: ent.ty, dur: .38, delay: dl, hold: false, done: () => { ent.hid = false; D.counts[p]++; K.sfx('deal'); } });
              } else {
                const fp = fanPos(p);
                K.fly({ id: -1, x0: L.stock.x, y0: L.stock.y, r0: 0, s0: 1, x1: fp.x, y1: fp.y, r1: 0, s1: L.fan, dur: .34, delay: dl, done });
              }
              c = dl + .38;
            });
            D.stock = 52 - order.length;
            return c + .15;
          }
          case 'flip': {
            D.stock--;
            K.fly({ id: e.id, x0: L.stock.x, y0: L.stock.y, x1: L.disc.x, y1: L.disc.y, r1: rnd(-.2, .2), flip: true, dur: .5, done: () => { D.pile.push({ id: e.id, r: rnd(-.2, .2), ox: 0, oy: 0 }); D.suit = ST(e.id); D.chipT = now(); K.sfx('card'); } });
            return .6;
          }
          case 'turn': {
            D.turn = e.p; D.sel = -1;
            if (e.p === viewer && scene === 'game') K.sfx('turn');
            return 0;
          }
          case 'play': {
            const p = e.p, id = e.id, rr = rnd(-.35, .35), ox = rnd(-6, 6), oy = rnd(-6, 6);
            const land = () => { D.pile.push({ id, r: rr, ox, oy }); if (D.pile.length > 6) D.pile.shift(); D.suit = e.suit; D.chipT = now(); K.sfx('card'); if (RK(id) === 8) { K.sfx('eight'); K.burst(L.disc.x, L.disc.y, 22, { shape: 'dot', colors: [suitCol(e.suit) === RED ? '#ff6b6b' : '#fff', '#ffd23f', '#fff'], min: 60, max: 240, g: 200, s0: 3, s1: 7, life: .8 }); K.pop(SG[e.suit], L.disc.x + (L.P ? 0 : 0), L.disc.y - L.ch * .55, { size: 46, color: suitCol(e.suit) === RED ? '#ff5a5a' : '#fff' }); } };
            if (p === viewer) {
              const i = D.hand.findIndex(h => h.id === id);
              const ent = D.hand[i];
              const x0 = drag && drag.e === ent ? drag.x : ent ? ent.x : L.seat[0].x, y0 = drag && drag.e === ent ? drag.y : ent ? ent.y - ent.lift : L.seat[0].y, r0 = ent ? ent.r : 0;
              if (i >= 0) D.hand.splice(i, 1);
              if (drag && drag.e === ent) drag = null;
              D.counts[p] = D.hand.length;
              K.fly({ id, x0, y0, r0, x1: L.disc.x + ox, y1: L.disc.y + oy, r1: rr, dur: .3, arc: 30, done: land });
            } else {
              const fp = fanPos(p);
              D.counts[p]--;
              K.fly({ id, x0: fp.x, y0: fp.y, r0: 0, s0: L.fan, x1: L.disc.x + ox, y1: L.disc.y + oy, r1: rr, flip: true, fa: 0, fb: .55, dur: .46, arc: 36, done: land });
            }
            return .5;
          }
          case 'draw': {
            const c = e.c, gap = c > 6 ? .1 : .17;
            if (e.p === viewer && e.ids) {
              const before = D.hand.length;
              const fresh = e.ids.slice();
              addHand(fresh, true);
              fresh.forEach((id, i) => {
                const ent = D.hand.find(h => h.id === id);
                D.stock = Math.max(0, D.stock - 1);
                K.fly({ id, x0: L.stock.x, y0: L.stock.y, tgt: () => [ent.tx, ent.ty, ent.tr, 1], x1: ent.tx, y1: ent.ty, flip: true, fa: 0, fb: .6, dur: .42, delay: i * gap, done: () => { ent.hid = false; D.counts[viewer] = D.hand.filter(h => !h.hid).length; K.sfx('draw'); } });
              });
            } else {
              const fp = fanPos(e.p);
              for (let i = 0; i < c; i++) {
                D.stock = Math.max(0, D.stock - 1);
                K.fly({ id: -1, x0: L.stock.x, y0: L.stock.y, x1: fp.x, y1: fp.y, s1: L.fan, dur: .38, delay: i * gap, done: () => { D.counts[e.p]++; K.sfx('draw'); } });
              }
            }
            return c * gap + .42;
          }
          case 'drew': return 0;
          case 'pass': {
            const s = seatPos(e.p);
            K.pop('Pass', s.x, s.y - (e.p === viewer ? L.ch * .8 : 0), { size: 26, color: '#ffd23f' });
            K.sfx('bad');
            return .55;
          }
          case 'skip': { const s = seatPos(e.p); K.pop('Skip!', s.x, s.y, { size: 30, color: '#ff8a5b' }); K.sfx('skip'); return .5; }
          case 'rev': { D.dir = e.dir; K.sfx('rev'); K.pop('Reverse!', K.W / 2, L.disc.y - L.ch * .9, { size: 30, color: '#6fd0ff' }); return .5; }
          case 'end': {
            D.scores = e.scores.slice();
            M.lastEnd = e;
            api.score(e.scores[viewer]);
            if (e.w === viewer) { K.sfx('win'); K.burst(K.W / 2, K.H * .55, 60, { up: true, spread: 1.2, min: 200, max: 620 }); }
            else K.sfx('lose');
            e.hands.forEach((h, p) => { if (p !== e.w) { const s = seatPos(p); const v = h.reduce((a, id) => a + CE_PTS(id), 0); if (p !== viewer) K.pop('+' + v, s.x, s.y + L.av, { size: 22, color: '#ffd23f' }); } });
            return 1.1;
          }
        }
        return 0;
      }

      function pump() {
        if (now() < busy) return;
        while (Q.length) {
          const e = Q.shift();
          const d = handleEvent(e);
          if (d > 0) { busy = now() + d; return; }
        }
      }

      function flush() {
        const es = M.eng.take();
        if (!es.length) return;
        es.forEach(e => Q.push(ceFilter(e, viewer)));
        if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es: es.map(e => ceFilter(e, q)), v: M.eng.view(q) }); });
        trackLacks(es);
      }
      function trackLacks(es) {
        if (!M.lacks.length) return;
        let suit = M.eng.s.suit;
        for (const e of es) {
          if (e.k === 'play') suit = e.suit;
          if (e.k === 'draw' && M.lacks[e.p]) M.lacks[e.p][suit] = 1;
          if (e.k === 'play' && M.lacks[e.p]) M.lacks[e.p][ST(e.id)] = 0;
        }
      }

      function submit(a) {
        if (M.role === 'guest') { api.net.send({ t: 'act', a }); M.awaiting = true; return; }
        if (M.eng.act(viewer, a)) flush();
      }

      function canAct() {
        if (scene !== 'game' || !isIdle() || K.paneOpen() || M.awaiting || picking) return false;
        const V = view();
        return !!V && V.turn === viewer && V.phase === 'play';
      }
      function playable(V) { return V && V.turn === viewer && V.phase === 'play' ? V.hand.filter(id => legalV(V, id)) : []; }

      function tryPlay(ent) {
        if (!canAct()) return false;
        const V = view(), id = ent.id;
        if (!legalV(V, id)) { ent.shake = now(); K.sfx('bad'); toastHint(V); return false; }
        if (RK(id) === 8) { openSuitPick(id); return true; }
        D.hover = -1; D.sel = -1;
        submit({ t: 'play', id });
        return true;
      }
      function toastHint(V) {
        const top = V.top;
        K.pop(`Match ${SG[V.suit]} or ${RL[RK(top)]}`, K.W / 2, L.disc.y + L.ch * .8, { size: 22, color: '#fff', life: 1.2 });
      }
      function tryDraw() {
        if (!canAct()) return;
        const V = view();
        if (playable(V).length) { K.sfx('bad'); K.pop('You have a playable card', K.W / 2, L.stock.y + L.ch * .78, { size: 22, color: '#ffd23f', life: 1.2 }); return; }
        if (V.drew) return;
        submit({ t: 'draw' });
      }
      function tryPass() {
        if (!canAct()) return;
        const V = view();
        if (V.rules.draw === 'one' && V.drew) submit({ t: 'pass' });
      }

      function openSuitPick(id) {
        picking = id;
        const V = view();
        const counts = [0, 0, 0, 0]; V.hand.forEach(x => { if (x !== id) counts[ST(x)]++; });
        K.show(`<div class="cg-box"><p class="cg-kick">Wild eight</p><h3>Choose a suit</h3><div class="ce-suits">${[0, 1, 2, 3].map(s => `<button data-a="s${s}" aria-label="${SN[s]}"><img src="${suitImg(s, 30)}" alt="${SN[s]}"><small style="color:#444;font:800 11px var(--sans)">${counts[s]} in hand</small></button>`).join('')}</div><button class="cg-sm" data-a="cancel">Cancel</button></div>`, a => {
          const id2 = picking; picking = null; K.hide();
          if (a === 'cancel' || id2 == null) return;
          submit({ t: 'play', id: id2, suit: +a.slice(1) });
        }, 'clear');
      }

      function hitHand(x, y) {
        for (let i = D.hand.length - 1; i >= 0; i--) {
          const e = D.hand[i];
          if (e.hid) continue;
          const w = L.cw / 2, h = L.ch / 2, cy = e.y - e.lift;
          if (Math.abs(x - e.x) < w && Math.abs(y - cy) < h) {
            const nxt = D.hand[i + 1];
            if (nxt && !nxt.hid && Math.abs(nxt.y - e.y) < 10 && x > e.x + (e.step || 40) / 2 && Math.abs(x - nxt.x) < w && Math.abs(y - (nxt.y - nxt.lift)) < h) return i + 1;
            return i;
          }
        }
        return -1;
      }
      const hitStock = (x, y) => Math.abs(x - L.stock.x) < L.cw / 2 + 6 && Math.abs(y - L.stock.y) < L.ch / 2 + 6;

      api.on(K.cv, 'pointerdown', e => {
        K.audio();
        if (scene !== 'game' || K.paneOpen()) return;
        const p = K.loc(e);
        const i = hitHand(p.x, p.y);
        if (i >= 0) {
          const ent = D.hand[i];
          drag = { e: ent, x: ent.x, y: ent.y, x0: p.x, y0: p.y, ox: p.x - ent.x, oy: p.y - ent.y, moved: false, pid: e.pointerId, i };
          try { K.cv.setPointerCapture(e.pointerId); } catch (x) {}
          return;
        }
        if (hitStock(p.x, p.y)) tryDraw();
      });
      api.on(K.cv, 'pointermove', e => {
        const p = K.loc(e);
        if (drag) {
          if (e.pointerId !== drag.pid) return;
          if (Math.abs(p.x - drag.x0) > 8 || Math.abs(p.y - drag.y0) > 8) drag.moved = true;
          drag.x = p.x - drag.ox; drag.y = p.y - drag.oy;
          return;
        }
        if (e.pointerType === 'mouse' && scene === 'game') {
          D.hover = canAct() || !K.paneOpen() ? hitHand(p.x, p.y) : -1;
          K.cv.style.cursor = D.hover >= 0 || hitStock(p.x, p.y) ? 'pointer' : '';
        }
      });
      const endDrag = e => {
        if (!drag || e.pointerId !== drag.pid) return;
        const d = drag, p = K.loc(e);
        if (!d.moved) { drag = null; tryPlay(d.e); return; }
        const over = p.y < L.seat[0].y - L.ch * .75;
        if (over) { if (!tryPlay(d.e)) drag = null; else if (picking != null) d.e.hid = false; }
        else drag = null;
      };
      api.on(K.cv, 'pointerup', endDrag);
      api.on(K.cv, 'pointercancel', e => { if (drag && e.pointerId === drag.pid) drag = null; });
      api.on(K.cv, 'pointerleave', () => { D.hover = -1; });
      bPass.addEventListener('click', tryPass);

      api.on(window, 'keydown', e => {
        if (scene !== 'game' || e.ctrlKey || e.metaKey || e.altKey) return;
        if (picking != null) {
          const k = { s: 0, h: 1, d: 2, c: 3 }[e.key.toLowerCase()];
          if (k != null) { e.preventDefault(); const id2 = picking; picking = null; K.hide(); submit({ t: 'play', id: id2, suit: k }); }
          return;
        }
        if (K.paneOpen()) return;
        const n = D.hand.length;
        if (e.key === 'ArrowLeft') { e.preventDefault(); keyFocus = keyFocus < 0 ? n - 1 : Math.max(0, keyFocus - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); keyFocus = keyFocus < 0 ? 0 : Math.min(n - 1, keyFocus + 1); }
        else if ((e.key === 'Enter' || e.key === ' ') && keyFocus >= 0 && D.hand[keyFocus]) { e.preventDefault(); tryPlay(D.hand[keyFocus]); }
        else if (e.key.toLowerCase() === 'd') tryDraw();
        else if (e.key.toLowerCase() === 'p') tryPass();
      });

      function drawSeat(p, t) {
        const s = seatPos(p), V = view(), turn = D.turn === p && (M.eng && M.eng.s.phase === 'play' || (M.role === 'guest' && V && V.phase === 'play'));
        const r = L.av;
        K.avatar(s.x, s.y, r, M.av[p] || 0, { ring: turn ? '#ffd23f' : null, dim: false });
        const lbl = (M.cpu[p] && M.mode !== 'online' ? M.names[p] : M.names[p]) || 'Player';
        K.text(lbl.length > 11 ? lbl.slice(0, 10) + '.' : lbl, s.x, s.y + r + 13, L.P ? 11 : 14, '#fff', { stroke: 'rgba(0,0,0,.75)', weight: 900 });
        K.text(D.scores[p] + ' pts', s.x, s.y + r + (L.P ? 24 : 29), L.P ? 10 : 12, '#ffe9a0', { stroke: 'rgba(0,0,0,.6)', weight: 800 });
        const c = D.counts[p], show = Math.min(c, L.P ? 7 : 9), fp = fanPos(p);
        const sp = L.P ? 7 : 11;
        for (let i = 0; i < show; i++) { const o = i - (show - 1) / 2; K.card(-1, fp.x + o * sp, fp.y + Math.abs(o) * 1.2, o * .07, L.fan); }
        if (c > 0) {
          const bx = fp.x + (show * sp) / 2 + (L.P ? 12 : 16), by = fp.y + (L.P ? 4 : 6);
          ctx.beginPath(); ctx.arc(bx, by, L.P ? 9 : 12, 0, TAU); ctx.fillStyle = c === 1 ? '#e8282b' : 'rgba(0,0,0,.6)'; ctx.fill();
          K.text(String(c), bx, by + 1, L.P ? 11 : 14, '#fff', { weight: 900 });
        }
        if (c === 1 && D.turn !== p) K.text('LAST CARD!', fp.x, fp.y - (L.P ? 24 : 34), L.P ? 11 : 14, '#ff6a55', { stroke: '#fff', lw: 3 });
      }

      function drawPiles(t, V, canDraw, pl) {
        const st = L.stock, ds = L.disc, cw = L.cw;
        const layers = Math.min(6, Math.ceil(D.stock / 9));
        for (let i = layers; i >= 1; i--) K.card(-1, st.x - i * .6, st.y - i * 1.3, 0, 1);
        if (D.stock > 0) K.card(-1, st.x, st.y, 0, 1, canDraw ? { glow: '#ffd23f' } : null);
        else { K.rr(st.x - cw / 2, st.y - L.ch / 2, cw, L.ch, cw * .09, 'rgba(0,0,0,.18)', 'rgba(255,255,255,.25)', 2); }
        K.text(String(D.stock), st.x, st.y + L.ch / 2 + 14, L.P ? 11 : 13, 'rgba(255,255,255,.85)', { stroke: 'rgba(0,0,0,.6)', weight: 800 });
        if (canDraw) {
          const a = .6 + .4 * Math.sin(t * 6);
          K.text(V && V.rules.draw === 'one' ? 'DRAW' : 'DRAW', st.x, st.y - L.ch / 2 - 14, L.P ? 12 : 14, '#ffd23f', { stroke: '#121214', alpha: a });
        }
        K.rr(ds.x - cw / 2 - 5, ds.y - L.ch / 2 - 5, cw + 10, L.ch + 10, cw * .13, null, 'rgba(255,255,255,.12)', 2);
        D.pile.forEach((c, i) => K.card(c.id, ds.x + c.ox, ds.y + c.oy, c.r, 1));
        if (D.suit >= 0) {
          const age = now() - D.chipT, sc = age < .5 ? 1 + Math.sin(clamp(age / .5, 0, 1) * Math.PI) * .35 : 1;
          const cx = ds.x + cw / 2 + (L.P ? 4 : 18), cy = ds.y + L.ch / 2 - 8;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
          ctx.beginPath(); ctx.arc(0, 0, L.P ? 15 : 20, 0, TAU); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
          ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
          K.suit(D.suit, 0, 1, L.P ? 18 : 24);
          ctx.restore();
        }
        if (M.eng || M.lastV) {
          const rules = (V && V.rules) || opt;
          if (rules.special) {
            ctx.save(); ctx.translate((st.x + ds.x) / 2, st.y); ctx.rotate(t * .5 * D.dir);
            ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3; ctx.setLineDash([10, 12]);
            ctx.beginPath(); ctx.arc(0, 0, L.cw * 1.35, 0, TAU * .9); ctx.stroke(); ctx.restore();
          }
        }
      }

      function drawHand(t, V, pl) {
        const my = V && V.turn === viewer && V.phase === 'play' && isIdle() && !M.awaiting;
        D.hand.forEach((e, i) => {
          if (e.hid) return;
          if (drag && drag.e === e) return;
          const ok = my && pl.includes(e.id), dim = my && !ok ? .38 : 0;
          const shake = e.shake && now() - e.shake < .3 ? Math.sin((now() - e.shake) * 60) * 5 : 0;
          K.card(e.id, e.x + shake, e.y - e.lift, e.r, 1, { glow: ok ? '#ffe27a' : null, dim });
        });
        if (drag) K.card(drag.e.id, drag.x, drag.y, 0, 1.08, { glow: '#fff' });
      }

      function statusText(V, my, pl) {
        let msg = '', col = '#fff';
        if (!V || scene !== 'game') return;
        if (V.phase === 'play') {
          if (V.turn === viewer) {
            if (pl.length) msg = 'Your turn'; else msg = V.stock ? 'No playable card. Draw!' : 'Nothing to play. Pass';
            col = '#ffe27a';
            if (V.drew && V.rules.draw === 'one') msg = 'Play it or pass';
          } else msg = nm(V.turn) + (M.cpu[V.turn] ? ' is thinking\u2026' : '\u2019s turn');
        }
        if (msg) K.text(msg, K.W / 2, L.disc.y + L.ch / 2 + (L.P ? 40 : 38), L.P ? 14 : 18, col, { stroke: 'rgba(0,0,0,.7)', weight: 900 });
      }

      K.loop((dt, t) => {
        pump();
        if (scene === 'title') { drawTitle(t); return; }
        slotsUpdate(dt);
        const V = view(), my = !!V && V.turn === viewer && V.phase === 'play' && isIdle() && !M.awaiting && !K.paneOpen(), pl = my ? playable(V) : [];
        if (M.role !== 'guest' && M.eng && isIdle() && !K.paneOpen()) botTick();
        if (M.auto && my && M.role !== 'guest' && !M.autoWait) { M.autoWait = 1; K.after(.4, () => { M.autoWait = 0; if (canAct()) submit(ceBot(M.eng, viewer, CE_AI.Normal, M.lacks)); }); }
        if (isIdle() && !M.paneShown && M.lastEnd && (M.role === 'guest' ? V && (V.phase === 'end' || V.phase === 'done') : M.eng && (M.eng.s.phase === 'end' || M.eng.s.phase === 'done'))) showEnd();
        for (let p = 0; p < D.n; p++) if (p !== viewer) drawSeat(p, t);
        drawPiles(t, V, my && pl.length === 0 && !V.drew && V.stock > 0, pl);
        drawMe(t);
        drawHand(t, V, pl);
        statusText(V, my, pl);
        const showPass = my && V.rules.draw === 'one' && V.drew;
        if (bPass.hidden === showPass) bPass.hidden = !showPass;
      });

      function drawMe(t) {
        const s = L.seat[0], active = D.turn === viewer && view() && view().phase === 'play';
        const r = L.P ? 17 : 22, ax = L.P ? 26 : 50, ay = s.y - L.ch * .3 - (D.hand.length > (L.P ? 7 : 14) ? 28 : 0);
        K.avatar(ax, ay, r, M.av[viewer] || 0, { ring: active ? '#ffd23f' : null });
        K.text(D.scores[viewer] + ' pts', ax, ay + r + 12, L.P ? 10 : 12, '#ffe9a0', { stroke: 'rgba(0,0,0,.6)', weight: 800 });
      }

      function drawTitle(t) {
        const W = K.W, cx = W / 2, cy = K.port ? 150 : 150;
        const ids = [7, 33, 20, 46, 13 + 7];
        const order = [3 * 13 + 7, 1 * 13 + 7, 7, 2 * 13 + 7];
        order.forEach((id, i) => { const o = i - 1.5, b = Math.sin(t * 1.6 + i) * 4; K.card(id, cx + o * (K.port ? 56 : 76), cy + Math.abs(o) * 14 + b - 10, o * .24, K.port ? .8 : 1.05); });
      }

      function botTick() {
        const s = M.eng.s, nd = M.eng.need();
        if (nd.k !== 'play' || !M.cpu[nd.p] || M.botTid === s.tid) return;
        M.botTid = s.tid;
        const P = CE_AI[M.diff] || CE_AI.Normal, tok = M.tok, tid = s.tid, p = nd.p;
        K.after(rnd(P.think[0], P.think[1]), () => {
          if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid || M.eng.need().p !== p) return;
          const a = ceBot(M.eng, p, P, M.lacks);
          if (!M.eng.act(p, a)) M.eng.act(p, { t: 'draw' }) || M.eng.act(p, { t: 'pass' });
          flush();
        });
      }

      function showTitle() {
        scene = 'title'; K.menuBtn.hidden = true; K.netBadge('');
        M.tok++; M.eng = null; M.lastV = null; M.role = 'local'; M.mode = 'cpu';
        resetD(2); layout();
        K.show(`<div class="cg-title"><div class="cg-logo">Crazy<br>Eights</div><p class="cg-tag">Match the suit or rank. Eights are wild.</p>
<button class="cg-big green" data-a="cpu">Play vs CPU<small>${+opt.cpus + 1} players \u00b7 ${opt.diff}</small></button>
<button class="cg-big blue" data-a="online">Play online<small>2 to 6 players, bots can fill seats</small></button>
<div class="cg-row"><button class="cg-sm" data-a="opts">Options</button><button class="cg-sm" data-a="rules">How to play</button></div>${opt.wins ? `<p style="font-size:12px;opacity:.7">Games won: ${opt.wins}</p>` : ''}</div>`, a => {
          if (a === 'cpu') { opt.mode = 'cpu'; K.saveOpt(); newMatch(); }
          else if (a === 'online') startOnline();
          else if (a === 'opts') showOpts('title');
          else if (a === 'rules') showRules('title');
        }, 'clear');
      }
      function showRules(back) {
        K.show(`<div class="cg-box wide">${CE_RULES_HTML}<button class="cg-big slate" data-a="back">Back</button></div>`, () => (back === 'game' ? showMenu() : showTitle()));
      }
      function showOpts(back) {
        K.show(`<div class="cg-box wide"><p class="cg-kick">Options</p><h3>Game setup</h3>
${K.optRow('CPU opponents', 'Solo games', 'cpus', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']])}
${K.optRow('Difficulty', 'How well the CPUs play', 'diff', [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']])}
${K.optRow('When you can\u2019t play', '', 'draw', [['until', 'Draw until you can'], ['one', 'Draw one card']])}
${K.optRow('Special cards', '2 draw, Q skip, A reverse', 'special', [[false, 'Off'], [true, 'On']])}
${K.optRow('Play to', 'Points across rounds', 'target', [[0, '1 round'], [50, '50'], [100, '100'], [200, '200']])}
${K.optRow('Table', '', 'felt', [['green', 'Green'], ['blue', 'Blue'], ['wine', 'Wine']])}
<button class="cg-big green" data-a="back">Done</button></div>`, () => { K.fit(true); if (back === 'game') showMenu(); else showTitle(); });
      }
      K.onOpt = k => { if (k === 'felt') { const b = K.pane.scrollTop; K.fit(true); } };
      function showMenu() {
        K.show(`<div class="cg-box"><p class="cg-kick">Paused</p><h3>Menu</h3>
<button class="cg-big green" data-a="resume">Resume</button>
<button class="cg-big blue" data-a="rules">How to play</button>
${M.mode === 'online' ? '' : '<button class="cg-big gold" data-a="new">New game</button>'}
<button class="cg-big red" data-a="quit">${M.mode === 'online' ? 'Leave game' : 'Quit to menu'}</button></div>`, a => {
          if (a === 'resume') K.hide();
          else if (a === 'rules') showRules('game');
          else if (a === 'new') newMatch();
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }
      K.menuBtn.addEventListener('click', () => { if (scene === 'game') { if (K.paneOpen()) K.hide(); else showMenu(); } });

      const CPU_POOL = () => NAMES.slice().sort(() => Math.random() - .5);
      function seats(n, humanSeats) {
        M.cpu = Array(n).fill(false); M.human = Array(n).fill(false); M.names = []; M.av = [];
        const pool = CPU_POOL();
        for (let p = 0; p < n; p++) {
          M.human[p] = humanSeats.includes(p); M.cpu[p] = !M.human[p];
          M.names[p] = M.human[p] ? (M.mode === 'online' ? (M.players.find(x => x.id === M.pids[p]) || {}).name || 'Player' : 'You') : pool.pop();
          M.av[p] = M.human[p] ? p + 1 : (p + 3) % 8;
        }
        if (M.mode !== 'online') M.av[0] = 0;
      }
      function newMatch() {
        M.tok++;
        const online = M.mode === 'online' && M.role === 'host';
        if (!online) { M.mode = 'cpu'; M.role = 'local'; }
        M.diff = opt.diff;
        let n, humans;
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
          M.players = live;
          const k = clamp(live.length, 1, 6);
          n = clamp(M.bots ? Math.max(k, M.size || k) : k, 2, 6);
          humans = live.slice(0, k).map((x, i) => i);
          M.pids = Array(n).fill(null); humans.forEach((q, i) => { M.pids[q] = live[i].id; });
        } else { n = 1 + (+opt.cpus || 3); humans = [0]; }
        seats(n, humans);
        M.eng = CEGame({ n, rules: { draw: opt.draw, special: !!opt.special, target: +opt.target } });
        M.lacks = Array.from({ length: n }, () => [0, 0, 0, 0]);
        viewer = 0; resetD(n); D.scores = Array(n).fill(0);
        scene = 'game'; K.menuBtn.hidden = false; K.hide();
        K.netBadge(online ? 'Online' : '');
        if (online) sendSetups();
        api.label('Points'); api.score(0);
        startRound();
      }
      function startRound() {
        K.hide(); M.paneShown = false; M.lastEnd = null; M.botTid = -1;
        D.hand = []; D.counts = Array(D.n).fill(0); D.pile = []; D.stock = 52;
        M.eng.deal();
        flush();
      }
      function nextRound() { if (M.role === 'guest') return; startRound(); }

      function showEnd() {
        M.paneShown = true;
        const e = M.lastEnd, n = D.n;
        const done = e.done;
        const rows = [...Array(n).keys()].sort((a, b) => e.scores[b] - e.scores[a]).map(p => {
          const pts = e.hands[p].reduce((a, id) => a + CE_PTS(id), 0), tg = +opt.target || 0;
          const w = Math.max(0, Math.min(100, tg ? e.scores[p] / tg * 100 : 0));
          return `<tr class="${p === e.w ? 'win' : ''}"><td><i style="background:${AVC[(M.av[p] || 0) % 8]}"></i>${esc(nm(p))}${p === e.w ? ' \u2605' : ''}</td><td>${p === e.w ? (e.blocked ? '+' + e.pts : '+' + e.pts) : e.hands[p].length + ' cards (' + pts + ')'}</td><td><b>${e.scores[p]}</b>${tg ? `<div class="cg-bar"><b style="width:${w}%"></b></div>` : ''}</td></tr>`;
        }).join('');
        const champ = done ? e.champ : -1;
        const iw = champ === viewer;
        const title = done ? (iw ? 'You win the game!' : esc(nm(champ)) + (champ === viewer ? '' : ' wins the game')) : e.w === viewer ? 'You win the round!' : esc(nm(e.w)) + ' wins the round';
        if (done) {
          K.sfx(iw ? 'win' : 'lose');
          if (iw) { K.burst(K.W / 2, K.H * .5, 90, { up: true, spread: 1.3, min: 250, max: 700 }); opt.wins = (opt.wins || 0) + 1; K.saveOpt(); api.submit(opt.wins); }
        }
        const canNext = M.role !== 'guest';
        K.show(`<div class="cg-box"><p class="cg-kick">${done ? 'Game over' : 'Round ' + (M.eng ? M.eng.s.round : (M.lastV ? M.lastV.round : 1)) + (e.blocked ? ' \u00b7 blocked' : '')}</p><h3>${title}</h3>
<table class="cg-tbl"><tr style="opacity:.6;font-size:11px"><td>Player</td><td>This round</td><td>Total</td></tr>${rows}</table>
${done ? (M.mode === 'online' ? (canNext ? '<button class="cg-big green" data-a="again">Rematch</button><button class="cg-big blue" data-a="lobby">Back to lobby</button>' : '<p>Waiting for the host\u2026</p>') : '<button class="cg-big green" data-a="again">Play again</button>') : (canNext ? '<button class="cg-big green" data-a="next">Next round</button>' : '<p>Waiting for the host to deal\u2026</p>')}
<button class="cg-big slate" data-a="quit">${M.mode === 'online' ? 'Leave' : 'Menu'}</button></div>`, a => {
          if (a === 'next') nextRound();
          else if (a === 'again') { if (M.mode === 'online') newMatch(); else newMatch(); }
          else if (a === 'lobby') startOnline();
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        }, 'clear');
      }

      function sendSetups() {
        M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) sendSetup(id, q); });
      }
      function sendSetup(id, q) {
        api.net.sendTo(id, { t: 'setup', n: D.n, seat: q, cpu: M.cpu, human: M.human, names: M.names, av: M.av, rules: M.eng.rules });
      }
      function sendSync(id) {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(id);
        if (q < 0 || !M.human[q]) return;
        sendSetup(id, q);
        api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
      }
      function seatToCpu(id) {
        const q = M.pids.indexOf(id);
        if (q < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[q];
        M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (CPU)';
        api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
        api.toast(who + ' left. A CPU takes the seat.');
      }
      function leaveOnline() {
        M.tok++; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.lastV = null; M.pids = []; M.players = [];
        api.net.close(); showTitle();
      }
      function syncFromView(v) {
        D.hand = []; D.counts = v.counts.slice(); D.pile = v.disc.map(id => ({ id, r: rnd(-.25, .25), ox: rnd(-5, 5), oy: rnd(-5, 5) })); D.stock = v.stock; D.suit = v.suit; D.dir = v.dir; D.turn = v.turn; D.scores = v.scores.slice();
        addHand(v.hand, false);
        D.hand.forEach(e => { e.x = e.tx = L.seat[0].x; e.y = e.ty = L.seat[0].y; });
      }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToCpu(p.id); });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || !M.role || M.role === 'local') return;
          M.tok++; M.role = 'local'; M.eng = null; M.lastV = null; Q.length = 0;
          K.sfx('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
          K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="cg-big green" data-a="room">Online lobby</button><button class="cg-big red" data-a="cpu">Play vs CPU</button></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'cpu'; newMatch(); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || scene !== 'game') return;
          const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== viewer && M.human[q]).length;
          K.netBadge(!on && M.role === 'guest' ? 'Reconnecting\u2026' : M.role === 'host' ? 'Online \u00b7 ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' \u00b7 ' + api.net.rtt + ' ms' : ''), !on && M.role === 'guest');
        }, 1000);
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        K.hide(); scene = 'title'; K.menuBtn.hidden = true; resetD(2);
        M.mode = 'online'; M.role = null; M.eng = null; M.lastV = null;
        const r = await api.net.room({ title: 'Crazy Eights', sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 6); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') { viewer = 0; newMatch(); }
        else K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal\u2026</p><button class="cg-sm" data-a="leave">Leave</button></div>`, a => { if (a === 'leave') leaveOnline(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === viewer || !M.human[q]) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') { if (M.eng.act(q, d.a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 }); }
          return;
        }
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat;
          M.cpu = d.cpu; M.human = d.human; M.names = d.names; M.av = d.av; M.lastV = null; M.awaiting = false;
          scene = 'game'; K.menuBtn.hidden = false; K.hide(); resetD(d.n); layout();
          api.label('Points'); api.score(0);
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') {
          M.lastV = d.v; M.awaiting = false;
          if (d.sync) { Q.length = 0; K.reset(); busy = 0; syncFromView(d.v); api.score(d.v.scores[viewer]); }
          else d.es.forEach(e => Q.push(e));
        } else if (d.t === 'seats') { M.cpu = d.cpu; M.human = d.human; M.names = d.names; }
      }

      K.fit(true);
      if (api.net.invite) startOnline(); else showTitle();
      root._t = { M, D, Q, K, view, get viewer() { return viewer; }, get scene() { return scene; }, L: () => L, tryPlay, tryDraw, handSlots, isIdle, sendSync };
      return { destroy() { M.tok++; if (K.ro) K.ro.disconnect(); } };
    }
  });

  const WR = id => { const r = RK(id); return r === 1 ? 14 : r; };

  function WarGame() {
    const P = [[], []];
    const s = { piles: P, pot: [], rounds: 0, wars: 0, maxDepth: 0, maxPot: 0, streak: [0, 0], best: [0, 0], phase: 'play', winner: -1 };
    const d = shuffle(deck52());
    P[0] = d.slice(0, 26); P[1] = d.slice(26); s.piles = P;
    const cnt = () => [P[0].length, P[1].length];
    return {
      s,
      counts: cnt,
      round() {
        const ev = [];
        if (s.phase !== 'play') return ev;
        s.rounds++;
        const a = P[0].pop(), b = P[1].pop();
        s.pot.push(a, b);
        ev.push({ k: 'flip', cards: [a, b], depth: 0, counts: cnt() });
        let ca = a, cb = b, w = -1, depth = 0, short = -1;
        for (;;) {
          const ra = WR(ca), rb = WR(cb);
          if (ra !== rb) { w = ra > rb ? 0 : 1; ev.push({ k: 'cmp', w }); break; }
          ev.push({ k: 'cmp', w: -1 });
          depth++; s.wars++; if (depth > s.maxDepth) s.maxDepth = depth;
          const la = P[0].length, lb = P[1].length;
          if (!la || !lb) { w = la ? 0 : 1; short = la ? 1 : 0; ev.push({ k: 'war', depth, down: [0, 0], short, counts: cnt() }); break; }
          const da = Math.min(3, la - 1), db = Math.min(3, lb - 1);
          for (let i = 0; i < da; i++) s.pot.push(P[0].pop());
          for (let i = 0; i < db; i++) s.pot.push(P[1].pop());
          ev.push({ k: 'war', depth, down: [da, db], counts: cnt() });
          ca = P[0].pop(); cb = P[1].pop(); s.pot.push(ca, cb);
          ev.push({ k: 'flip', cards: [ca, cb], depth, war: true, counts: cnt() });
        }
        const n = s.pot.length;
        if (n > s.maxPot) s.maxPot = n;
        shuffle(s.pot);
        P[w].unshift(...s.pot); s.pot = [];
        s.streak[w]++; s.streak[1 - w] = 0; if (s.streak[w] > s.best[w]) s.best[w] = s.streak[w];
        ev.push({ k: 'take', w, n, depth, counts: cnt(), streak: s.streak[w] });
        if (!P[1 - w].length || s.rounds >= 3000) {
          const ww = !P[1 - w].length ? w : (P[0].length >= P[1].length ? 0 : 1);
          s.phase = 'over'; s.winner = ww;
          ev.push({ k: 'over', w: ww, stats: { rounds: s.rounds, wars: s.wars, depth: s.maxDepth, pot: s.maxPot, best: s.best.slice() }, counts: cnt() });
        }
        return ev;
      }
    };
  }

  const WAR_SPEED = { slow: [1.5, 1.1], normal: [1, .45], fast: [.5, .12], turbo: [.1, 0] };
  const WAR_BACKS = { blue: ['#2457b8', '#102e6b'], red: ['#c0392b', '#6e150c'], green: ['#1f8a5a', '#0c4a30'], purple: ['#7b4cc4', '#34175f'] };

  function warBg(x, W, H, port) {
    const g = x.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, Math.max(W, H) * .72);
    g.addColorStop(0, '#6b1a2a'); g.addColorStop(.55, '#33101a'); g.addColorStop(1, '#14070c');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .045; x.fillStyle = '#fff';
    for (let i = 0; i < 1500; i++) x.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
    x.globalAlpha = 1;
    const cy = H / 2;
    const gold = x.createLinearGradient(0, 0, W, 0); gold.addColorStop(0, 'rgba(255,200,90,0)'); gold.addColorStop(.5, 'rgba(255,200,90,.35)'); gold.addColorStop(1, 'rgba(255,200,90,0)');
    x.fillStyle = gold; x.fillRect(W * .08, cy - 1.5, W * .84, 3);
    x.strokeStyle = 'rgba(255,200,90,.16)'; x.lineWidth = 3;
    x.beginPath(); x.ellipse(W / 2, cy, W * .44, H * .36, 0, 0, TAU); x.stroke();
    x.save(); x.translate(W / 2, cy); x.globalAlpha = .06; x.fillStyle = '#ffd78a';
    for (let i = 0; i < 2; i++) { x.save(); x.rotate(i ? Math.PI / 4 : 0); x.fillRect(-4, -H * .3, 8, H * .6); x.fillRect(-H * .3, -4, H * .6, 8); x.restore(); }
    x.restore();
  }

  const WAR_RULES = `<h3>How to play</h3><div class="cg-rules">
<p><b>Goal:</b> win all 52 cards. The deck is split evenly, 26 each, face down.</p>
<p><b>Each round</b> both players flip their top card. The higher card wins both. Ace is high, 2 is low. The winner puts the cards under their pile.</p>
<p><b>War!</b> If the cards match, each player lays <b>three cards face down</b> and then flips <b>one more face up</b>. The higher of those wins every card on the table. If they match again, it is war again, as many times as it takes.</p>
<p>A player with fewer than four cards in a war puts down all but their last card and flips that one. A player with no cards left loses.</p>
<p>There are no decisions: it is luck, so tap <b>FLIP</b> (or Space) to play each round, or turn on <b>Auto</b> and pick a speed.</p></div>`;

  const WAR_CSS = `
.GM{--cg-hi:#ffcf5a;--cg-logo:#ffcf5a}
.GM .wr-flip{position:absolute;min-width:128px;height:56px;padding:0 20px;border-radius:28px;border:3px solid #fff;background:linear-gradient(#ffd84a,#e29800);color:#3a2300;font:900 22px var(--sans);letter-spacing:1px;box-shadow:0 5px 0 #8a5a00,0 10px 20px rgba(0,0,0,.4);transform:translate(-50%,-50%)}
.GM .wr-flip:active{transform:translate(-50%,-46%)}
.GM .wr-flip:disabled{filter:grayscale(.6) brightness(.8);opacity:.7}
.GM .wr-flip.hot{animation:wr-pulse .6s infinite alternate}
@keyframes wr-pulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.07)}}
.GM .wr-bar{position:absolute;right:10px;bottom:10px;display:flex;gap:6px;align-items:center;padding:6px;border-radius:16px;background:rgba(0,0,0,.4)}
.GM .cg-port .wr-bar{left:8px;right:8px;justify-content:center;gap:3px;padding:5px}.GM .cg-port .wr-bar button{padding:0 8px;font-size:12px;min-height:36px}.GM .cg-port .wr-flip{min-width:112px;height:48px;font-size:19px}
.GM .wr-bar button{min-height:38px;padding:0 11px;border-radius:11px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans)}
.GM .wr-bar button.on{background:#ffcf5a;border-color:#fff;color:#2a1a00}
.GM .wr-bar .sep{width:1px;height:24px;background:rgba(255,255,255,.2);margin:0 2px}
`;

  Ameplay.register({
    id: 'war',
    title: 'War',
    category: 'Board',
    tint: '#9b2335',
    blurb: 'The classic card battle: flip, compare, and go to war on a tie. Race through the deck against the computer or a friend online.',
    help: '<kbd>Space</kbd> flip \u00b7 <kbd>A</kbd> auto-play \u00b7 <kbd>1</kbd>\u2013<kbd>4</kbd> speed \u00b7 tap your deck or the FLIP button',
    width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: iconSvg('<rect x="8" y="12" width="24" height="36" rx="4" transform="rotate(-10 20 30)"/><rect x="30" y="16" width="24" height="36" rx="4" transform="rotate(10 42 34)" fill="currentColor" fill-opacity=".14"/><path d="M26 8l5 6 5-6M26 56l5-6 5 6" stroke-width="2"/>'),
    css: css('war', WAR_CSS),
    mount(root, api) {
      const K = Core(root, api, { id: 'war', W: 960, H: 600, PW: 360, PH: 640, defaults: { speed: 'normal', auto: false, back: 'blue', wins: 0 }, bg: warBg, back: WAR_BACKS.blue });
      const opt = K.opt, ctx = K.ctx;
      if (!WAR_SPEED[opt.speed]) opt.speed = 'normal';
      K.setBack(...WAR_BACKS[opt.back] || WAR_BACKS.blue);
      const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, names: ['You', 'Rosa'], av: [0, 3], pids: [], players: [], lastOver: null, hooked: false, rd: [false, false], auto: [false, false], cool: 0, shown: false, size: 2 };
      const D = { counts: [26, 26], lane: [null, null], flash: 0, rounds: 0, streak: 0, res: -1, cmpT: -9, sideTxt: ['', ''] };
      const Q = [];
      let busy = 0, scene = 'title', viewer = 0, L = null;
      const now = () => K.t;
      const isIdle = () => !Q.length && now() >= busy && !K.busy();
      const sideOf = p => (p === viewer ? 0 : 1);
      const plOf = side => (side === 0 ? viewer : 1 - viewer);
      const SP = () => WAR_SPEED[opt.speed];
      const newLane = () => ({ pot: [], down: 0, up: -1, upX: 0, glow: 0, dim: 0, hideUp: false });
      const view = () => ({ counts: D.counts });

      const bFlip = K.btn('wr-flip', 'FLIP'); bFlip.hidden = true;
      const bar = document.createElement('div'); bar.className = 'wr-bar'; bar.hidden = true;
      bar.innerHTML = `<button data-w="auto">Auto</button><span class="sep"></span>${['slow', 'normal', 'fast', 'turbo'].map((s, i) => `<button data-w="${s}" title="Speed ${i + 1}">${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}`;
      K.ui.append(bar);
      const syncBar = () => {
        bar.querySelector('[data-w=auto]').classList.toggle('on', !!opt.auto);
        bar.querySelectorAll('[data-w]').forEach(b => { if (b.dataset.w !== 'auto') b.classList.toggle('on', b.dataset.w === opt.speed); });
      };
      bar.addEventListener('click', e => {
        const b = e.target.closest('[data-w]'); if (!b) return;
        K.sfx('tap');
        if (b.dataset.w === 'auto') setAuto(!opt.auto); else { opt.speed = b.dataset.w; K.saveOpt(); syncBar(); }
      });
      function setAuto(v) {
        opt.auto = !!v; K.saveOpt(); syncBar();
        if (M.role === 'guest') api.net.send({ t: 'rdy', a: opt.auto, r: M.rd[viewer] });
        else M.auto[viewer] = opt.auto;
      }

      function layout() {
        const P = K.port, W = K.W, H = K.H;
        K.setCard(P ? 58 : 84, P ? 81 : 118);
        L = P
          ? { P, deck: [{ x: W / 2, y: 518 }, { x: W / 2, y: 112 }], lane: [378, 242], potX: 52, downX: 106, downStep: 28, upX0: W / 2, upX1: 268, av: 20 }
          : { P, deck: [{ x: W / 2, y: 516 }, { x: W / 2, y: 98 }], lane: [380, 220], potX: W / 2 - 220, downX: W / 2 - 112, downStep: 46, upX0: W / 2, upX1: W / 2 + 112, av: 26 };
        K.pct(bFlip, P ? W / 2 + 118 : W / 2 + 190, P ? 478 : 470);
        K.pct(bar, 0, 0); bar.style.left = ''; bar.style.top = ''; bar.style.right = P ? '8px' : '10px'; bar.style.bottom = P ? '8px' : '10px';
        D.lane.forEach(l => { if (l) l.upX = L.upX0; });
      }
      K.onFit = layout;
      const upPos = (side, war) => ({ x: war ? L.upX1 : L.upX0, y: L.lane[side] });
      const deckPos = side => L.deck[side];

      function resetD() {
        D.counts = [26, 26]; D.lane = [newLane(), newLane()]; D.flash = 0; D.rounds = 0; D.streak = 0; D.res = -1; D.sideTxt = ['', ''];
        Q.length = 0; K.reset(); busy = 0; M.rd = [false, false]; M.cool = 0; M.shown = false; M.lastOver = null;
        layout();
      }

      function dust(x, y) { K.burst(x, y, 8, { shape: 'dot', colors: ['#fff', '#ffe9b0'], min: 40, max: 150, g: 100, s0: 2, s1: 4, life: .5 }); }

      function handleEvent(e) {
        const sp = SP()[0], W = K.W;
        switch (e.k) {
          case 'flip': {
            const war = !!e.war;
            if (!war) M.rd = [false, false];
            const slow = war ? 1.4 : 1;
            e.cards.forEach((id, p) => {
              const side = sideOf(p), dp = deckPos(side), up = upPos(side, war), l = D.lane[side];
              l.hideUp = true;
              D.counts[side] = e.counts[p];
              K.fly({ id, x0: dp.x, y0: dp.y, x1: up.x, y1: up.y, r1: 0, flip: true, fa: .1, fb: .8, lift: .28, dur: .5 * sp * slow, delay: side === 0 ? 0 : .06 * sp, done: () => { l.up = id; l.upX = up.x; l.hideUp = false; D.counts[side] = e.counts[p]; K.sfx('flip'); dust(up.x, up.y + L.P * 0 + 20); if (war) K.shake = Math.max(K.shake, 7); } });
            });
            return (.5 * slow + .1) * sp + .06;
          }
          case 'cmp': {
            D.res = e.w;
            if (e.w >= 0) {
              const ws = sideOf(e.w);
              D.lane[ws].glow = 1; D.lane[1 - ws].dim = 1;
              K.sfx('ding');
              const up = upPos(ws, D.lane[ws].upX > L.upX0 + 1);
              K.pop(ws === 0 ? 'You win!' : nm(1) + ' wins', up.x, up.y - K.ch * .62 * (ws === 0 ? 1 : -1) + (ws === 0 ? 0 : 6), { size: L.P ? 18 : 24, color: ws === 0 ? '#9dffb0' : '#ffb0a0', life: .9 });
              return .55 * sp;
            }
            K.sfx('slap'); K.shake = 10; D.flash = .5;
            return .35 * Math.max(sp, .16);
          }
          case 'war': {
            const depth = e.depth, fast = SP()[0] < .3;
            const txt = depth === 1 ? 'WAR!' : depth === 2 ? 'DOUBLE WAR!' : depth === 3 ? 'TRIPLE WAR!' : 'WAR x' + depth + '!';
            if (!fast) {
              K.banner(txt, e.short >= 0 ? (e.short === viewer ? 'You have no cards left!' : nm(1) + ' has no cards left!') : 'Three face down, one face up', { c1: '#fff1a8', c2: '#ff4a1c', band: 'rgba(120,10,10,.72)', size: L.P ? 46 : 74, dur: 1.4 * Math.max(.7, sp), y: K.H / 2 });
              K.sfx('war'); K.sfx('roll', .15);
            }
            D.flash = 1; K.shake = 14 + Math.min(depth, 4) * 3;
            const t0 = fast ? 0 : .55 * sp;
            [0, 1].forEach(side => {
              const l = D.lane[side], dp = deckPos(side), p = plOf(side), n = e.down[p];
              if (l.up >= 0) { l.pot.push(l.up); l.up = -1; l.glow = 0; l.dim = 0; }
              for (let i = 0; i < n; i++) {
                const tx = L.downX + i * L.downStep, ty = L.lane[side];
                K.fly({ id: -1, x0: dp.x, y0: dp.y, x1: tx, y1: ty, r0: 0, r1: (i - 1) * .04, dur: .3 * Math.max(sp, .12), delay: t0 + i * .16 * Math.max(sp, .1) + (side === 0 ? 0 : .07 * sp), arc: 18, done: () => { l.down++; D.counts[side] = Math.max(0, D.counts[side] - 1); K.sfx('drum'); K.shake = Math.max(K.shake, 5); dust(tx, ty + 30); } });
              }
              D.counts[side] = e.counts[p] + n;
            });
            D.res = -1;
            return t0 + (3 * .16 + .35) * Math.max(sp, .12) + .25 * sp;
          }
          case 'take': {
            const side = sideOf(e.w), dp = deckPos(side);
            D.res = -1;
            let i = 0, last = 0;
            const emit = (id, x, y, r, rotAway) => {
              const dl = Math.min(i * .035, .5) * Math.max(sp, .1);
              K.fly({ id, x0: x, y0: y, r0: r, x1: dp.x, y1: dp.y, r1: rnd(-.3, .3), dur: .45 * Math.max(sp, .16), delay: dl, arc: 24, s1: .95, ease: easeInOut });
              last = dl + .45 * Math.max(sp, .16); i++;
            };
            D.lane.forEach((l, s) => {
              const y = L.lane[s];
              l.pot.forEach((id, k) => emit(id, L.potX + k * 1.5, y - k * 1.2, 0));
              for (let k = 0; k < l.down; k++) emit(-1, L.downX + k * L.downStep, y, (k - 1) * .04);
              if (l.up >= 0) emit(l.up, l.upX, y, 0);
              l.pot = []; l.down = 0; l.up = -1; l.glow = 0; l.dim = 0;
            });
            K.sfx('whoosh');
            const big = e.n >= 10;
            if (big) { K.burst(dp.x, dp.y, 40, { up: side === 0, spread: 1.4, min: 150, max: 460 }); K.shake = 8; }
            K.after(last, () => { D.counts = e.counts.map((c, p) => c).slice(); D.counts = [e.counts[plOf(0)], e.counts[plOf(1)]]; api.score(D.counts[0]); K.sfx('card'); K.pop('+' + e.n, dp.x + (L.P ? 54 : 84), dp.y - 24, { size: big ? 34 : 24, color: side === 0 ? '#9dffb0' : '#ffb0a0' }); M.deckBump = [side, now()]; });
            D.rounds++;
            if (e.streak >= 3) K.after(last * .6, () => K.pop(e.streak + ' in a row!', K.W / 2, L.lane[side] + (side === 0 ? 70 : -70), { size: 26, color: '#ffe27a' }));
            M.cool = (SP()[1] || 0);
            return last + .12 * sp;
          }
          case 'over': {
            M.lastOver = e;
            const win = sideOf(e.w) === 0;
            K.sfx(win ? 'win' : 'lose');
            K.banner(win ? 'VICTORY!' : 'DEFEAT', win ? 'You won all 52 cards' : nm(1) + ' took every card', { c1: win ? '#fff1a8' : '#ffb0a0', c2: win ? '#ff9a1c' : '#c0392b', size: L.P ? 56 : 90, dur: 2, y: K.H / 2 });
            if (win) { K.burst(K.W / 2, K.H / 2, 110, { up: true, spread: 1.3, min: 250, max: 720 }); }
            return 1.6;
          }
        }
        return 0;
      }
      const nm = side => (side === 0 ? 'You' : M.names[plOf(side)] || 'Rival');

      function pump() {
        if (now() < busy) return;
        while (Q.length) {
          const e = Q.shift();
          const d = handleEvent(e);
          if (d > 0) { busy = now() + d; return; }
        }
      }

      function flush(ev) {
        ev.forEach(e => Q.push(e));
        if (M.role === 'host') api.net.send({ t: 'ev', es: ev });
      }
      const ready = p => (M.mode === 'online' ? (M.role === 'host' ? (p === viewer ? M.auto[p] || M.rd[p] : (M.pids[p] ? M.auto[p] || M.rd[p] : true)) : false) : (p === viewer ? M.auto[p] || M.rd[p] : true));

      function wantFlip() {
        if (scene !== 'game' || K.paneOpen()) return;
        K.audio();
        if (M.role === 'guest') { M.rd[viewer] = true; api.net.send({ t: 'rdy', r: true, a: opt.auto }); }
        else M.rd[viewer] = true;
      }
      bFlip.addEventListener('click', wantFlip);
      api.on(K.cv, 'pointerdown', e => {
        K.audio();
        if (scene !== 'game' || K.paneOpen()) return;
        const p = K.loc(e), d = deckPos(0);
        if (Math.abs(p.x - d.x) < K.cw / 2 + 10 && Math.abs(p.y - d.y) < K.ch / 2 + 10) wantFlip();
      });
      api.on(window, 'keydown', e => {
        if (scene !== 'game' || K.paneOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); wantFlip(); }
        else if (e.key.toLowerCase() === 'a') setAuto(!opt.auto);
        else if ('1234'.includes(e.key) && e.key) { opt.speed = ['slow', 'normal', 'fast', 'turbo'][+e.key - 1]; K.saveOpt(); syncBar(); }
      });

      function warTick() {
        if (M.role === 'guest' || !M.eng || M.eng.s.phase !== 'play' || !isIdle() || K.paneOpen() || scene !== 'game') return;
        if (!ready(viewer) || (M.mode === 'online' && !ready(1 - viewer))) return;
        if (!M.rd[viewer] && now() < M.nextAt) return;
        M.rd = [false, false];
        flush(M.eng.round());
        M.nextAt = now() + (SP()[1] || 0);
      }

      K.loop((dt, t) => {
        pump();
        D.flash = Math.max(0, D.flash - dt * 1.6);
        if (scene === 'title') { drawTitle(t); return; }
        warTick();
        drawBoard(t, dt);
      });

      function drawDeck(side, t) {
        const d = deckPos(side), n = D.counts[side], layers = Math.min(9, Math.ceil(n / 3));
        let bump = 0;
        if (M.deckBump && M.deckBump[0] === side) { const a = now() - M.deckBump[1]; if (a < .4) bump = Math.sin(a / .4 * Math.PI) * .09; }
        if (n <= 0) { K.rr(d.x - K.cw / 2, d.y - K.ch / 2, K.cw, K.ch, K.cw * .09, 'rgba(0,0,0,.2)', 'rgba(255,255,255,.25)', 2); }
        else {
          for (let i = layers; i >= 1; i--) K.card(-1, d.x - i * .5, d.y - i * 1.6, 0, 1);
          K.card(-1, d.x, d.y, 0, 1 + bump, side === 0 && M.mode !== 'x' && !K.paneOpen() && isIdle() && !M.rd[viewer] && !opt.auto ? { glow: '#ffcf5a' } : null);
        }
        const ay = d.y, ax = d.x + (side === 0 ? -1 : -1) * (L.P ? 96 : 148);
        K.avatar(ax, ay, L.av, M.av[plOf(side)] || 0, { ring: null });
        K.text(nm(side), ax, ay + L.av + 14, L.P ? 12 : 15, '#fff', { stroke: 'rgba(0,0,0,.7)' });
        K.text(String(n), d.x + (L.P ? -1 : 1) * (K.cw / 2 + (L.P ? 18 : 24)), d.y, L.P ? 18 : 26, '#fff', { stroke: 'rgba(0,0,0,.7)' });
        const rp = plOf(side);
        if (M.mode === 'online' && (M.auto[rp] || M.rd[rp])) K.text(M.auto[rp] ? 'AUTO' : 'READY', ax, ay - L.av - 10, L.P ? 10 : 12, '#9dffb0', { stroke: 'rgba(0,0,0,.7)' });
      }

      function drawLane(side, t) {
        const l = D.lane[side], y = L.lane[side];
        const potN = l.pot.length;
        l.pot.slice(-7).forEach((id, i, arr) => K.card(id, L.potX + i * 1.6, y - i * 1.2, (i % 2 ? 1 : -1) * .03 * i, 1, { dim: .12 }));
        if (potN > 1) K.text('\u00d7' + potN, L.potX, y + K.ch / 2 + 14, 14, '#ffe27a', { stroke: 'rgba(0,0,0,.7)' });
        for (let i = 0; i < l.down; i++) K.card(-1, L.downX + i * L.downStep, y, (i - 1) * .04, 1);
        if (l.up >= 0 && !l.hideUp) K.card(l.up, l.upX, y, 0, 1 + l.glow * .06, { glow: l.glow ? '#ffd23f' : null, dim: l.dim ? .42 : 0 });
      }

      function drawBars(t) {
        const W = K.W, x0 = L.P ? 66 : 80, x1 = W - (L.P ? 84 : 110), y = L.P ? 26 : 18, h = 14;
        const pot = D.lane.reduce((a, l) => a + l.pot.length + l.down + (l.up >= 0 ? 1 : 0), 0) + K.flights.filter(f => f.id !== undefined).length * 0;
        const a = D.counts[1], b = D.counts[0], tot = Math.max(1, a + b + pot), w = x1 - x0;
        const wa = w * a / tot, wp = w * pot / tot, wb = w * b / tot;
        K.rr(x0 - 3, y - h / 2 - 3, w + 6, h + 6, 10, 'rgba(0,0,0,.45)');
        ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, 7); ctx.clip();
        const g1 = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g1.addColorStop(0, '#ff6a55'); g1.addColorStop(1, '#b81f12');
        const g2 = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g2.addColorStop(0, '#ffe27a'); g2.addColorStop(1, '#e09a00');
        const g3 = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g3.addColorStop(0, '#5aa7ff'); g3.addColorStop(1, '#1a54b8');
        ctx.fillStyle = g1; ctx.fillRect(x0, y - h / 2, wa, h);
        ctx.fillStyle = g2; ctx.fillRect(x0 + wa, y - h / 2, wp, h);
        ctx.fillStyle = g3; ctx.fillRect(x0 + wa + wp, y - h / 2, wb, h);
        ctx.restore();
        K.text(nm(1) + ' ' + a, x0, y + 20, L.P ? 11 : 12, '#ffb0a0', { align: 'left', stroke: 'rgba(0,0,0,.7)', weight: 800 });
        K.text('You ' + b, x1, y + 20, L.P ? 11 : 12, '#a9d1ff', { align: 'right', stroke: 'rgba(0,0,0,.7)', weight: 800 });
      }

      function drawBoard(t, dt) {
        if (D.flash > 0) { ctx.fillStyle = `rgba(200,20,20,${D.flash * .22})`; ctx.fillRect(0, 0, K.W, K.H); }
        drawBars(t);
        drawLane(0, t); drawLane(1, t);
        drawDeck(0, t); drawDeck(1, t);
        let msg = '';
        if (M.eng || M.role === 'guest') {
          if (M.role === 'guest' || (M.eng && M.eng.s.phase === 'play')) {
            if (!isIdle()) msg = '';
            else if (M.rd[viewer] && !opt.auto) msg = M.mode === 'online' ? 'Waiting for ' + nm(1) + '\u2026' : '';
            else if (opt.auto) msg = 'Auto-play';
            else msg = 'Tap FLIP';
          }
        }
        if (msg) K.text(msg, K.W / 2, K.H / 2 + .5, L.P ? 14 : 18, 'rgba(255,255,255,.55)', { stroke: 'rgba(0,0,0,.5)' });
        const ok = scene === 'game' && isIdle() && !K.paneOpen() && M.eng && M.eng.s.phase !== 'over' || (M.role === 'guest' && isIdle() && !K.paneOpen());
        bFlip.disabled = !ok || (M.rd[viewer] && M.mode === 'online');
        bFlip.classList.toggle('hot', ok && !M.rd[viewer] && !opt.auto);
        if (isIdle() && !M.shown && M.lastOver && !K.paneOpen()) showOver();
      }

      function drawTitle(t) {
        const cx = K.W / 2, cy = K.port ? 90 : 92;
        [[-1, 13 * 3 + 0], [1, 13 * 1 + 0]].forEach(([o, id], i) => {
          K.card(id, cx + o * (K.port ? 58 : 84), cy + Math.sin(t * 2 + i * 2) * 5, o * .22 + Math.sin(t * 2 + i * 2) * .03, K.port ? .8 : 1);
        });
        const k = (Math.sin(t * 4) + 1) / 2;
        K.text('VS', cx, cy, K.port ? 26 : 34, '#ffcf5a', { stroke: '#121214', alpha: .75 + k * .25 });
      }

      function showTitle() {
        scene = 'title'; K.menuBtn.hidden = true; bFlip.hidden = true; bar.hidden = true; K.netBadge('');
        M.tok++; M.eng = null; M.role = 'local'; M.mode = 'cpu';
        resetD(); layout();
        K.show(`<div class="cg-title"><div class="cg-logo">WAR</div><p class="cg-tag">Flip. Compare. Go to war.</p>
<button class="cg-big gold" data-a="cpu">Play vs CPU<small>Race through the deck</small></button>
<button class="cg-big blue" data-a="online">Play online<small>1 v 1 with a friend</small></button>
<div class="cg-row"><button class="cg-sm" data-a="opts">Options</button><button class="cg-sm" data-a="rules">How to play</button></div>${opt.wins ? `<p style="font-size:12px;opacity:.7">Games won: ${opt.wins}</p>` : ''}</div>`, a => {
          if (a === 'cpu') newMatch();
          else if (a === 'online') startOnline();
          else if (a === 'opts') showOpts('title');
          else if (a === 'rules') showRules('title');
        }, 'clear');
      }
      function showRules(back) { K.show(`<div class="cg-box wide">${WAR_RULES}<button class="cg-big slate" data-a="back">Back</button></div>`, () => (back === 'game' ? showMenu() : showTitle())); }
      function showOpts(back) {
        K.show(`<div class="cg-box wide"><p class="cg-kick">Options</p><h3>Game setup</h3>
${K.optRow('Speed', 'Animation and auto-play tempo', 'speed', [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['turbo', 'Turbo']])}
${K.optRow('Auto-play', 'Flip every round for you', 'auto', [[false, 'Off'], [true, 'On']])}
${K.optRow('Card back', '', 'back', [['blue', 'Blue'], ['red', 'Red'], ['green', 'Green'], ['purple', 'Purple']])}
<button class="cg-big green" data-a="back">Done</button></div>`, () => { M.auto[viewer] = !!opt.auto; if (back === 'game') showMenu(); else showTitle(); });
      }
      K.onOpt = k => { if (k === 'back') { K.setBack(...WAR_BACKS[opt.back]); K.fit(true); } if (k === 'auto') { M.auto[viewer] = !!opt.auto; syncBar(); } if (k === 'speed') syncBar(); };
      function showMenu() {
        K.show(`<div class="cg-box"><p class="cg-kick">Paused</p><h3>Menu</h3>
<button class="cg-big green" data-a="resume">Resume</button>
<button class="cg-big blue" data-a="rules">How to play</button>
<button class="cg-big slate" data-a="opts">Options</button>
${M.mode === 'online' ? '' : '<button class="cg-big gold" data-a="new">New game</button>'}
<button class="cg-big red" data-a="quit">${M.mode === 'online' ? 'Leave game' : 'Quit to menu'}</button></div>`, a => {
          if (a === 'resume') K.hide();
          else if (a === 'rules') showRules('game');
          else if (a === 'opts') showOpts('game');
          else if (a === 'new') newMatch();
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }
      K.menuBtn.addEventListener('click', () => { if (scene === 'game') { if (K.paneOpen()) K.hide(); else showMenu(); } });

      function newMatch() {
        M.tok++;
        const online = M.mode === 'online' && M.role === 'host';
        if (!online) { M.mode = 'cpu'; M.role = 'local'; M.names = ['You', pick(NAMES)]; M.av = [0, 3 + Math.floor(Math.random() * 5)]; M.pids = []; }
        viewer = 0;
        M.eng = WarGame();
        M.auto = [!!opt.auto, false]; M.nextAt = 0;
        resetD();
        scene = 'game'; K.menuBtn.hidden = false; bFlip.hidden = false; bar.hidden = false; K.hide(); syncBar();
        K.netBadge(online ? 'Online' : '');
        api.label('Cards'); api.score(26);
        if (online) api.net.send({ t: 'setup', names: M.names, av: M.av, seat: 1 });
        K.sfx('shuf');
      }

      function showOver() {
        M.shown = true;
        const e = M.lastOver, win = sideOf(e.w) === 0, st = e.stats;
        if (win && M.mode !== 'online') { opt.wins = (opt.wins || 0) + 1; K.saveOpt(); api.submit(opt.wins); }
        if (win && M.mode === 'online') { opt.wins = (opt.wins || 0) + 1; K.saveOpt(); api.submit(opt.wins); }
        const canNext = M.role !== 'guest';
        K.show(`<div class="cg-box"><p class="cg-kick">Game over</p><h3>${win ? 'You win!' : esc(nm(1)) + ' wins'}</h3>
<div class="cg-stats"><div><span>Rounds</span><b>${st.rounds}</b></div><div><span>Wars</span><b>${st.wars}</b></div><div><span>Biggest war</span><b>${st.depth ? '\u00d7' + st.depth : '-'}</b></div><div><span>Best streak</span><b>${st.best[plOf(0)]}</b></div></div>
${M.mode === 'online' ? (canNext ? '<button class="cg-big green" data-a="again">Rematch</button><button class="cg-big blue" data-a="lobby">Back to lobby</button>' : '<p>Waiting for the host\u2026</p>') : '<button class="cg-big green" data-a="again">Play again</button>'}
<button class="cg-big slate" data-a="quit">${M.mode === 'online' ? 'Leave' : 'Menu'}</button></div>`, a => {
          if (a === 'again') newMatch();
          else if (a === 'lobby') startOnline();
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }

      function leaveOnline() { M.tok++; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.pids = []; api.net.close(); showTitle(); }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => {
          if (M.mode === 'online' && M.role === 'host' && p && p.id === M.pids[1] && M.eng && M.eng.s.phase === 'play') {
            M.pids[1] = null; api.toast(M.names[1] + ' left. A CPU takes over.'); M.names[1] += ' (CPU)'; M.auto[1] = true;
          }
        });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && M.eng) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || !M.role || M.role === 'local') return;
          M.tok++; M.role = 'local'; M.eng = null; Q.length = 0; K.sfx('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>${h}</h3><p>The game ended.</p><button class="cg-big green" data-a="room">Online lobby</button><button class="cg-big red" data-a="cpu">Play vs CPU</button></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'cpu'; newMatch(); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || scene !== 'game') return;
          const on = api.net.connected;
          K.netBadge(!on && M.role === 'guest' ? 'Reconnecting\u2026' : 'Online' + (M.role === 'guest' && api.net.rtt ? ' \u00b7 ' + api.net.rtt + ' ms' : ''), !on && M.role === 'guest');
        }, 1000);
      }
      function sendSync(id) {
        api.net.sendTo(id, { t: 'setup', names: M.names, av: M.av, seat: 1 });
        const s = M.eng.s;
        api.net.sendTo(id, { t: 'sync', counts: M.eng.counts(), over: s.phase === 'over' ? { w: s.winner, stats: { rounds: s.rounds, wars: s.wars, depth: s.maxDepth, pot: s.maxPot, best: s.best.slice() } } : null });
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        K.hide(); scene = 'title'; K.menuBtn.hidden = true; bFlip.hidden = true; bar.hidden = true; resetD();
        M.mode = 'online'; M.role = null; M.eng = null;
        const r = await api.net.room({ title: 'War', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: false });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; return showTitle(); }
        M.role = r.role; M.players = r.players;
        if (r.role === 'host') {
          M.mode = 'online'; M.names = [r.players[0].name, (r.players[1] || {}).name || 'Player']; M.av = [1, 4]; M.pids = [r.players[0].id, (r.players[1] || {}).id];
          newMatch();
        } else K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal\u2026</p><button class="cg-sm" data-a="leave">Leave</button></div>`, a => { if (a === 'leave') leaveOnline(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng || from !== M.pids[1]) return;
          if (d.t === 'rdy') { if (d.r) M.rd[1] = true; if (typeof d.a === 'boolean') M.auto[1] = d.a; }
          return;
        }
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = 1;
          M.names = d.names; M.av = d.av;
          resetD(); scene = 'game'; K.menuBtn.hidden = false; bFlip.hidden = false; bar.hidden = false; K.hide(); syncBar();
          M.auto = [false, !!opt.auto]; if (opt.auto) api.net.send({ t: 'rdy', a: true, r: false });
          api.label('Cards'); api.score(26);
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') d.es.forEach(e => Q.push(e));
        else if (d.t === 'sync') { Q.length = 0; K.reset(); busy = 0; D.counts = [d.counts[viewer], d.counts[1 - viewer]]; D.lane = [newLane(), newLane()]; if (d.over) { Q.push({ k: 'over', w: d.over.w, stats: d.over.stats, counts: d.counts }); } }
      }

      K.fit(true);
      root._t = { M, D, Q, K, get viewer() { return viewer; }, get scene() { return scene; }, wantFlip, isIdle, sendSync };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; if (K.ro) K.ro.disconnect(); } };
    }
  });

  const sAdj = (a, b) => { const d = Math.abs(RK(a) - RK(b)); return d === 1 || d === 12; };

  function SpGame() {
    const d = shuffle(deck52());
    const s = { hand: [[], []], draw: [[], []], side: [[], []], cen: [[], []], phase: 'idle', winner: -1, plays: [0, 0], flips: 0, shuffles: 0 };
    for (let p = 0; p < 2; p++) {
      const c = d.splice(0, 26);
      s.cen[p] = [c.pop()];
      s.side[p] = c.splice(0, 5);
      s.hand[p] = c.splice(0, 5);
      s.draw[p] = c;
    }
    let ev = [];
    const top = i => s.cen[i][s.cen[i].length - 1];
    const can = p => s.hand[p].some(id => id != null && (sAdj(id, top(0)) || sAdj(id, top(1))));
    const view = p => ({
      hand: s.hand[p].slice(), oh: s.hand[1 - p].map(x => x != null), dn: [s.draw[p].length, s.draw[1 - p].length],
      sn: [s.side[0].length, s.side[1].length], top: [top(0), top(1)], cen: s.cen.map(a => a.slice(-4)), cn: [s.cen[0].length, s.cen[1].length], ph: s.phase
    });
    const check = () => {
      if (s.phase === 'play' && !can(0) && !can(1)) { s.phase = 'stuck'; ev.push({ k: 'stuck' }); }
    };
    const g = {
      s, view, can, top,
      take() { const e = ev; ev = []; return e; },
      deal() { ev.push({ k: 'deal', views: [view(0), view(1)] }); },
      start() { s.phase = 'play'; ev.push({ k: 'go' }); check(); },
      act(p, slot, pile) {
        if (s.phase !== 'play' || !(p === 0 || p === 1) || !(pile === 0 || pile === 1) || !Number.isInteger(slot) || slot < 0 || slot > 4) return false;
        const id = s.hand[p][slot];
        if (id == null || !sAdj(id, top(pile))) return false;
        s.cen[pile].push(id); s.plays[p]++;
        const ref = s.draw[p].length ? s.draw[p].pop() : null;
        s.hand[p][slot] = ref;
        ev.push({ k: 'play', p, slot, id, pile, ref, dn: s.draw[p].length });
        if (!s.draw[p].length && s.hand[p].every(x => x == null)) { s.phase = 'over'; s.winner = p; ev.push({ k: 'over', w: p, left: [0, 1].map(q => s.draw[q].length + s.hand[q].filter(x => x != null).length) }); return true; }
        check();
        return true;
      },
      flip() {
        if (s.phase !== 'stuck') return;
        if (!s.side[0].length && !s.side[1].length) {
          const pool = [];
          for (let i = 0; i < 2; i++) { const t = s.cen[i].pop(); pool.push(...s.cen[i]); s.cen[i] = [t]; }
          shuffle(pool); s.shuffles++;
          s.side[0] = pool.splice(0, pool.length >> 1); s.side[1] = pool;
          ev.push({ k: 'shuf', sn: [s.side[0].length, s.side[1].length], cn: [1, 1], top: [top(0), top(1)] });
        }
        const cards = [-1, -1];
        for (let i = 0; i < 2; i++) {
          const src = s.side[i].length ? s.side[i] : s.side[1 - i];
          const c = src.pop();
          if (c != null) { s.cen[i].push(c); cards[i] = c; }
        }
        s.flips++;
        ev.push({ k: 'flip', cards, sn: [s.side[0].length, s.side[1].length], top: [top(0), top(1)], cn: [s.cen[0].length, s.cen[1].length] });
        s.phase = 'play';
        check();
      }
    };
    return g;
  }

  function spFilter(e, me) {
    if (e.k === 'deal') return { k: 'deal', view: e.views[me] };
    if (e.k === 'play' && e.p !== me) return Object.assign({}, e, { ref: e.ref == null ? null : -2 });
    return e;
  }

  const SP_AI = { Casual: { react: 1.9, chain: .8, smart: 0 }, Quick: { react: 1.15, chain: .6, smart: 1 }, Lightning: { react: .55, chain: .5, smart: 2 } };

  function spMoves(g, p) {
    const h = g.s.hand[p], out = [];
    for (let i = 0; i < 5; i++) if (h[i] != null) for (let pile = 0; pile < 2; pile++) if (sAdj(h[i], g.top(pile))) out.push({ slot: i, pile });
    return out;
  }

  function spChain(ids, t0, t1) {
    let best = 0;
    for (let i = 0; i < ids.length; i++) {
      const a = sAdj(ids[i], t0), b = sAdj(ids[i], t1);
      if (!a && !b) continue;
      const rest = ids.slice(0, i).concat(ids.slice(i + 1));
      if (a) best = Math.max(best, 1 + spChain(rest, ids[i], t1));
      if (b) best = Math.max(best, 1 + spChain(rest, t0, ids[i]));
    }
    return best;
  }

  function spBot(g, p, P) {
    const mv = spMoves(g, p);
    if (!mv.length) return null;
    if (!P.smart) return pick(mv);
    const h = g.s.hand[p];
    let best = [], bv = -1;
    for (const m of mv) {
      const rest = []; for (let i = 0; i < 5; i++) if (i !== m.slot && h[i] != null) rest.push(h[i]);
      const t = [g.top(0), g.top(1)]; t[m.pile] = h[m.slot];
      let v = spChain(rest, t[0], t[1]) + Math.random() * (P.smart > 1 ? .01 : .9);
      if (v > bv) { bv = v; best = [m]; }
    }
    return best[0];
  }

  function spBg(x, W, H, port) {
    const g = x.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, Math.max(W, H) * .75);
    g.addColorStop(0, '#1f5f78'); g.addColorStop(.55, '#0f2f45'); g.addColorStop(1, '#07141f');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .04; x.fillStyle = '#fff';
    for (let i = 0; i < 1500; i++) x.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2);
    x.globalAlpha = 1;
    const cy = port ? 318 : 300;
    x.strokeStyle = 'rgba(120,220,255,.16)'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(W * .06, cy); x.lineTo(W * .94, cy); x.stroke();
    x.setLineDash([10, 12]); x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 2;
    x.beginPath(); x.arc(W / 2, cy, port ? 96 : 160, 0, TAU); x.stroke();
    x.setLineDash([]);
    x.save(); x.globalAlpha = .05; x.fillStyle = '#9fe8ff';
    for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(W / 2 + (i - 4) * W * .12 - 18, H); x.lineTo(W / 2 + (i - 4) * W * .12 + 18, H); x.lineTo(W / 2 + (i - 4) * W * .06, cy + 30); x.closePath(); x.fill(); }
    x.restore();
  }

  const SP_RULES = `<h3>How to play</h3><div class="cg-rules">
<p><b>Goal:</b> be the first to get rid of all your cards. There are no turns: both players play at the same time.</p>
<p><b>Setup:</b> you hold five cards and have a draw pile. Each time you play a card the next one from your draw pile refills your hand. Two piles sit in the middle, and each side has a small stack of spare cards.</p>
<p><b>Playing:</b> put a card from your hand on either middle pile if it is <b>one rank higher or lower</b> than the top card. Ace and King count as neighbours, so the ranks wrap around (Q-K-A-2).</p>
<p><b>Stuck?</b> When neither player has a move, a card from each spare stack is flipped onto its pile at the same time. If the spare stacks run out, the middle piles are shuffled into new ones.</p>
<p><b>Both play at once.</b> If you both go for the same pile, whoever's card lands first stays; the other is sent back to your hand.</p>
<p>Drag a card to a pile, or just tap it. <kbd>1</kbd>-<kbd>5</kbd> play a card, <kbd>Z</kbd>/<kbd>&larr;</kbd> and <kbd>X</kbd>/<kbd>&rarr;</kbd> choose the pile when both fit.</p></div>`;

  const SP_CSS = `
.GM{--cg-hi:#7be0ff;--cg-logo:#7be0ff}
`;

  Ameplay.register({
    id: 'speed',
    title: 'Speed',
    category: 'Board',
    tint: '#d6402b',
    blurb: 'The real-time card duel: no turns, just play up or down a rank onto the two middle piles faster than your rival. Three CPU speeds, or race a friend online.',
    help: 'Drag or tap cards \u00b7 <kbd>1</kbd>\u2013<kbd>5</kbd> play \u00b7 <kbd>Z</kbd>/<kbd>X</kbd> or arrows pick the pile',
    width: 960,
    better: 'low',
    format: v => v + 's',
    icon: iconSvg('<rect x="6" y="14" width="22" height="32" rx="4" fill="currentColor" fill-opacity=".14"/><rect x="34" y="14" width="22" height="32" rx="4"/><path d="M22 54l10-8-10-2 12-10M40 6l-6 8 8 2" stroke-width="2.5"/>'),
    css: css('speed', SP_CSS),
    mount(root, api) {
      const K = Core(root, api, { id: 'speed', W: 960, H: 600, PW: 360, PH: 640, defaults: { diff: 'Quick', hints: true, back: 'red', wins: 0 }, bg: spBg, back: WAR_BACKS.red });
      const opt = K.opt, ctx = K.ctx;
      if (!SP_AI[opt.diff]) opt.diff = 'Quick';
      K.setBack(...(WAR_BACKS[opt.back] || WAR_BACKS.red));
      const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, names: ['You', 'Rival'], av: [0, 3], pids: [], hooked: false, clk: 0, q: [], bot: { at: 0, idle: true }, evn: 0, got: 0, last: null, shown: false, t0: 0, secs: 0, cpuSeat: true, myPlays: 0, flips: 0, syncAt: 0 };
      const D = { hand: [null, null, null, null, null], opp: [false, false, false, false, false], dn: [15, 15], sn: [5, 5], top: [-1, -1], cen: [[], []], cn: [1, 1], ph: 'idle', hold: {}, ohold: {}, pend: {}, px: [], py: [], ox: [], pulse: [0, 0], pref: 0, kb: false, drag: null, hover: -1, faceDown: false };
      let scene = 'title', viewer = 0, L = null;

      function layout() {
        const P = K.port, W = K.W;
        K.setCard(P ? 58 : 84, P ? 81 : 118);
        L = P
          ? { P, cy: 318, pile: [W / 2 - 62, W / 2 + 62], side: [28, W - 28], sideS: .7, hy: 566, hstep: 64, oy: 108, ostep: 38, os: .58, md: { x: W - 40, y: 470 }, od: { x: W - 36, y: 76 }, mav: { x: 32, y: 464 }, oav: { x: 92, y: 44 }, av: 19 }
          : { P, cy: 300, pile: [W / 2 - 96, W / 2 + 96], side: [W / 2 - 260, W / 2 + 260], sideS: .8, hy: 514, hstep: 106, oy: 78, ostep: 60, os: .62, md: { x: W - 104, y: 514 }, od: { x: W - 104, y: 96 }, mav: { x: 92, y: 514 }, oav: { x: 92, y: 78 }, av: 27 };
        D.px = []; D.py = []; D.ox = [];
      }
      K.onFit = layout;
      const pilePos = i => ({ x: L.pile[i], y: L.cy });
      const sidePos = i => ({ x: L.side[i], y: L.cy });
      const present = i => D.hand[i] != null || D.hold[i];
      const opresent = i => D.opp[i] || D.ohold[i];
      const vis = i => { let n = 0; for (let k = 0; k < i; k++) if (present(k)) n++; return n; };
      const ovis = i => { let n = 0; for (let k = 0; k < i; k++) if (opresent(k)) n++; return n; };
      const cnt = () => { let n = 0; for (let k = 0; k < 5; k++) if (present(k)) n++; return n; };
      const ocnt = () => { let n = 0; for (let k = 0; k < 5; k++) if (opresent(k)) n++; return n; };
      const hpos = i => ({ x: K.W / 2 + (vis(i) - (cnt() - 1) / 2) * L.hstep, y: L.hy });
      const opos = i => ({ x: K.W / 2 + (ovis(i) - (ocnt() - 1) / 2) * L.ostep, y: L.oy });
      const legal = id => id != null && id >= 0 && (sAdj(id, D.top[0]) || sAdj(id, D.top[1]));
      const lpiles = id => [0, 1].filter(i => sAdj(id, D.top[i]));
      const SPD = () => SP_AI[opt.diff];
      const nm = p => (p === viewer ? 'You' : M.names[p] || 'Rival');
      const myLeft = () => D.hand.filter(x => x != null).length + D.dn[0];
      const opLeft = () => D.opp.filter(Boolean).length + D.dn[1];

      function applyView(v) {
        D.hand = v.hand.slice(); D.opp = v.oh.slice(); D.dn = v.dn.slice(); D.sn = v.sn.slice(); D.top = v.top.slice();
        D.cen = v.cen.map(a => a.slice()); D.cn = v.cn.slice(); D.ph = v.ph;
        D.hold = {}; D.ohold = {}; D.pend = {}; D.drag = null;
      }

      function land(pile, id) {
        const c = D.cen[pile]; c.push(id); if (c.length > 4) c.shift();
        D.pulse[pile] = 1; K.sfx('card');
        const p = pilePos(pile);
        K.burst(p.x, p.y, 7, { shape: 'dot', colors: ['#fff', '#aeeaff'], min: 40, max: 160, g: 80, s0: 2, s1: 4, life: .45 });
      }

      function handleEvent(e) {
        switch (e.k) {
          case 'deal': {
            const v = e.view || e.views[viewer];
            K.reset(); applyView(v); D.ph = 'ready'; D.cen = [[], []]; D.faceDown = true; M.shown = false; M.myPlays = 0; M.flips = 0;
            K.sfx('shuf');
            for (let i = 0; i < 5; i++) {
              D.hold[i] = true; D.ohold[i] = true;
              const hp = hpos(i), op = opos(i), id = v.hand[i];
              K.fly({ id, x0: L.md.x, y0: L.md.y, x1: hp.x, y1: hp.y, flip: true, fa: .5, fb: .5, dur: .42, delay: .1 + i * .09, done: () => { D.hold[i] = false; K.sfx('deal'); } });
              K.fly({ id: -1, x0: L.od.x, y0: L.od.y, x1: op.x, y1: op.y, s0: 1, s1: L.os, dur: .42, delay: .14 + i * .09, done: () => { D.ohold[i] = false; } });
            }
            return;
          }
          case 'cd':
            K.pop(String(e.n), K.W / 2, K.H / 2, { size: L.P ? 80 : 120, life: .85, rise: 0, color: '#ffe27a' });
            K.sfx('tick');
            return;
          case 'go':
            D.ph = 'play'; D.faceDown = false; M.t0 = K.t;
            [0, 1].forEach(i => { const p = pilePos(i), id = D.top[i]; D.cen[i] = []; K.fly({ id, x0: p.x, y0: p.y, x1: p.x, y1: p.y, flip: true, fa: 0, fb: .8, dur: .45, done: () => land(i, id) }); });
            K.banner('SPEED!', 'Empty your hand first', { c1: '#c8f4ff', c2: '#1fa6e0', band: 'rgba(5,25,45,.7)', size: L.P ? 56 : 84, dur: 1.1, y: K.H * (L.P ? .42 : .45) });
            K.sfx('go');
            return;
          case 'play': {
            const me = e.p === viewer, to = pilePos(e.pile);
            D.top[e.pile] = e.id; D.cn[e.pile]++; if (D.ph === 'stuck') D.ph = 'play';
            if (me) {
              M.myPlays++;
              const from = D.pend[e.slot] || { x: D.px[e.slot] == null ? hpos(e.slot).x : D.px[e.slot], y: D.py[e.slot] == null ? L.hy : D.py[e.slot] };
              delete D.pend[e.slot];
              D.hand[e.slot] = e.ref; D.dn[0] = e.dn;
              K.fly({ id: e.id, x0: from.x, y0: from.y, x1: to.x, y1: to.y, r1: rnd(-.22, .22), dur: .2, done: () => land(e.pile, e.id) });
              if (e.ref != null) {
                D.hold[e.slot] = true; const hp = hpos(e.slot);
                K.fly({ id: e.ref, x0: L.md.x, y0: L.md.y, x1: hp.x, y1: hp.y, flip: true, fa: .45, fb: .55, dur: .36, delay: .05, done: () => { D.hold[e.slot] = false; } });
              }
            } else {
              const from = { x: D.ox[e.slot] == null ? opos(e.slot).x : D.ox[e.slot], y: L.oy };
              D.opp[e.slot] = e.ref != null; D.dn[1] = e.dn;
              K.fly({ id: e.id, x0: from.x, y0: from.y, x1: to.x, y1: to.y, s0: L.os, s1: 1, r1: rnd(-.22, .22), flip: true, fa: 0, fb: .5, dur: .26, done: () => land(e.pile, e.id) });
              if (e.ref != null) {
                D.ohold[e.slot] = true; const op = opos(e.slot);
                K.fly({ id: -1, x0: L.od.x, y0: L.od.y, x1: op.x, y1: op.y, s0: 1, s1: L.os, dur: .3, delay: .05, done: () => { D.ohold[e.slot] = false; } });
              }
            }
            return;
          }
          case 'stuck':
            D.ph = 'stuck'; K.sfx('tick');
            return;
          case 'flip': {
            D.top = e.top.slice(); D.cn = e.cn.slice(); D.ph = 'play'; M.flips++;
            const before = D.sn.slice();
            [0, 1].forEach(i => {
              const id = e.cards[i]; if (id < 0) return;
              const sp = sidePos(before[i] > 0 || before[1 - i] === 0 ? i : 1 - i), p = pilePos(i);
              K.fly({ id, x0: sp.x, y0: sp.y, x1: p.x, y1: p.y, s0: L.sideS, s1: 1, flip: true, fa: .1, fb: .7, lift: .25, dur: .55, delay: i * .05, done: () => land(i, id) });
            });
            D.sn = e.sn.slice();
            K.pop('SPEED!', K.W / 2, L.cy + (L.P ? 96 : 110), { size: L.P ? 30 : 40, color: '#8be8ff', life: 1 });
            K.sfx('speed'); K.shake = Math.max(K.shake, 6);
            return;
          }
          case 'shuf': {
            D.sn = e.sn.slice(); D.cn = e.cn.slice(); D.top = e.top.slice();
            const keep = D.cen.map(a => a[a.length - 1]);
            D.cen = [[keep[0]], [keep[1]]];
            for (let i = 0; i < 8; i++) { const a = i & 1, p = pilePos(a), sp = sidePos(a); K.fly({ id: -1, x0: p.x, y0: p.y, x1: sp.x, y1: sp.y, s1: L.sideS, dur: .4, delay: i * .04, arc: 30, r1: rnd(-.5, .5) }); }
            K.pop('Shuffling piles', K.W / 2, L.cy - (L.P ? 80 : 100), { size: L.P ? 18 : 24, color: '#ffe27a' });
            K.sfx('shuf');
            return;
          }
          case 'over': {
            D.ph = 'over'; M.last = e; M.secs = Math.max(1, Math.round(K.t - M.t0));
            const win = e.w === viewer;
            K.sfx(win ? 'win' : 'lose');
            K.banner(win ? 'YOU WIN!' : 'YOU LOSE', win ? 'Hand and deck cleared' : nm(e.w) + ' was faster', { c1: win ? '#fff1a8' : '#ffb0a0', c2: win ? '#ff9a1c' : '#c0392b', size: L.P ? 52 : 84, dur: 1.8, y: K.H / 2 });
            if (win) K.burst(K.W / 2, K.H / 2, 100, { up: true, spread: 1.3, min: 250, max: 700 });
            K.after(1.9, showOver);
            return;
          }
          case 'sync':
            K.reset(); applyView(e.view);
            return;
        }
      }

      const later = (sec, fn) => { M.q.push({ at: M.clk + sec, fn }); };
      function flush(ev) {
        if (!ev.length) return;
        ev.forEach(e => {
          handleEvent(e);
          if (e.k === 'stuck') { const tok = M.tok; later(1, () => { if (tok === M.tok && M.eng) { M.eng.flip(); flush(M.eng.take()); } }); }
          if (e.k === 'flip' || e.k === 'go') M.bot.at = Math.max(M.bot.at, M.clk + SPD().react * rnd(.6, 1.1));
        });
        if (M.role === 'host' && M.pids[1] && !M.cpuSeat) { M.evn++; api.net.sendTo(M.pids[1], { t: 'ev', n: M.evn, es: ev.map(e => spFilter(e, 1)) }); }
        else if (M.role === 'host') M.evn++;
      }

      function simTick(dt) {
        if (M.role === 'guest' || !M.eng) return;
        if (M.mode !== 'online' && K.paneOpen()) return;
        M.clk += dt;
        for (let i = 0; i < M.q.length;) { if (M.q[i].at <= M.clk) { const o = M.q.splice(i, 1)[0]; o.fn(); } else i++; }
        const g = M.eng;
        if (g.s.phase === 'play' && M.cpuSeat) {
          const P = SPD(), B = M.bot;
          if (M.clk >= B.at) {
            const m = spBot(g, 1, P);
            if (!m) { B.idle = true; B.at = M.clk + .05; }
            else if (B.idle) { B.idle = false; B.at = M.clk + P.react * rnd(.55, 1.05); }
            else { g.act(1, m.slot, m.pile); flush(g.take()); B.at = M.clk + P.react * P.chain * rnd(.7, 1.3); }
          }
        }
        if (M.role === 'host' && M.pids[1] && !M.cpuSeat) {
          M.syncAt += dt;
          if (M.syncAt > 1) { M.syncAt = 0; api.net.sendTo(M.pids[1], { t: 'fs', n: M.evn, view: g.view(1) }, true); }
        }
      }

      function bump(msg, x, y) { K.sfx('bad'); K.pop(msg, x, y, { size: L.P ? 16 : 20, color: '#ff9a8a', life: .7, rise: 24 }); }

      function tryPlay(slot, pile, from) {
        if (scene !== 'game' || K.paneOpen() || D.ph !== 'play') return false;
        const id = D.hand[slot];
        if (id == null || D.pend[slot]) return false;
        const lp = lpiles(id);
        const pos = from || { x: D.px[slot], y: D.py[slot] };
        if (!lp.length) { bump('No match', pos.x, pos.y - 40); return false; }
        if (pile == null) pile = lp.length === 1 ? lp[0] : (lp.includes(D.pref) ? D.pref : lp[0]);
        else if (!lp.includes(pile)) { bump('Not \u00b11', pos.x, pos.y - 40); return false; }
        D.pend[slot] = pos;
        if (M.role === 'guest') {
          api.net.send({ t: 'act', slot, pile });
          const tok = M.tok;
          api.timeout(() => { if (tok === M.tok) delete D.pend[slot]; }, 900);
          return true;
        }
        if (M.eng.act(viewer, slot, pile)) flush(M.eng.take());
        else { delete D.pend[slot]; bump('Too late!', pos.x, pos.y - 40); }
        return true;
      }

      function slotAt(p) {
        for (let k = 4; k >= 0; k--) {
          if (D.hand[k] == null || D.pend[k] || D.hold[k]) continue;
          const x = D.px[k], y = D.py[k];
          if (x != null && Math.abs(p.x - x) < K.cw / 2 + 3 && Math.abs(p.y - y) < K.ch / 2 + 3) return k;
        }
        return -1;
      }
      api.on(K.cv, 'pointerdown', e => {
        K.audio();
        if (scene !== 'game' || K.paneOpen() || D.ph !== 'play' || D.drag) return;
        const p = K.loc(e), k = slotAt(p);
        if (k < 0) return;
        try { K.cv.setPointerCapture(e.pointerId); } catch (x) {}
        D.drag = { slot: k, id: D.hand[k], dx: D.px[k] - p.x, dy: D.py[k] - p.y, x: D.px[k], y: D.py[k], sx: p.x, sy: p.y, pid: e.pointerId };
      });
      api.on(K.cv, 'pointermove', e => {
        const p = K.loc(e);
        if (D.drag && e.pointerId === D.drag.pid) { D.drag.x = p.x + D.drag.dx; D.drag.y = p.y + D.drag.dy; return; }
        D.hover = scene === 'game' && !K.paneOpen() ? slotAt(p) : -1;
        K.cv.style.cursor = D.hover >= 0 ? 'pointer' : '';
      });
      const endDrag = e => {
        const d = D.drag;
        if (!d || e.pointerId !== d.pid) return;
        D.drag = null;
        const p = K.loc(e), moved = Math.hypot(p.x - d.sx, p.y - d.sy);
        D.px[d.slot] = d.x; D.py[d.slot] = d.y;
        if (moved < 12) { tryPlay(d.slot, null); return; }
        let best = -1, bd = K.cw * 1.35;
        for (let i = 0; i < 2; i++) { const q = pilePos(i), dd = Math.hypot(d.x - q.x, d.y - q.y); if (dd < bd) { bd = dd; best = i; } }
        if (best >= 0) tryPlay(d.slot, best, { x: d.x, y: d.y });
      };
      api.on(K.cv, 'pointerup', endDrag);
      api.on(K.cv, 'pointercancel', e => { if (D.drag && e.pointerId === D.drag.pid) D.drag = null; });
      api.on(window, 'keydown', e => {
        if (scene !== 'game' || K.paneOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'z' || k === 'arrowleft') { D.pref = 0; D.kb = true; e.preventDefault(); }
        else if (k === 'x' || k === 'arrowright') { D.pref = 1; D.kb = true; e.preventDefault(); }
        else if (k >= '1' && k <= '5') {
          const n = +k - 1; let c = -1;
          for (let i = 0; i < 5; i++) if (present(i) && !D.hold[i]) { c++; if (c === n) { D.kb = true; tryPlay(i, null); break; } }
        }
      });

      function drawStack(n, x, y, s, max) {
        const k = Math.min(max, Math.ceil(n / 3));
        if (n <= 0) { K.rr(x - K.cw * s / 2, y - K.ch * s / 2, K.cw * s, K.ch * s, K.cw * s * .1, 'rgba(0,0,0,.18)', 'rgba(255,255,255,.28)', 2); return; }
        for (let i = k; i >= 0; i--) K.card(-1, x - i * .6, y - i * 1.7, 0, s);
      }

      function drawBoard(t, dt) {
        const P = L.P;
        for (let i = 0; i < 5; i++) {
          if (present(i)) {
            const h = hpos(i);
            if (D.px[i] == null) { D.px[i] = h.x; D.py[i] = h.y; }
            const f = Math.min(1, dt * 16);
            D.px[i] += (h.x - D.px[i]) * f; D.py[i] += (h.y - D.py[i]) * f;
          } else { D.px[i] = null; D.py[i] = null; }
          if (opresent(i)) { const o = opos(i); D.ox[i] = D.ox[i] == null ? o.x : D.ox[i] + (o.x - D.ox[i]) * Math.min(1, dt * 14); } else D.ox[i] = null;
        }
        [0, 1].forEach(i => { D.pulse[i] = Math.max(0, D.pulse[i] - dt * 3); });
        const dragging = D.drag && D.ph === 'play';
        [0, 1].forEach(i => {
          const s = sidePos(i);
          drawStack(D.sn[i], s.x, s.y, L.sideS, 4);
          if (D.sn[i] > 0) K.text(String(D.sn[i]), s.x, s.y + K.ch * L.sideS / 2 + 16, P ? 12 : 15, 'rgba(255,255,255,.75)', { stroke: 'rgba(0,0,0,.6)' });
        });
        [0, 1].forEach(i => {
          const p = pilePos(i), c = D.cen[i];
          const lg = dragging && sAdj(D.drag.id, D.top[i]);
          if (lg) { ctx.save(); ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 26; K.rr(p.x - K.cw / 2 - 5, p.y - K.ch / 2 - 5, K.cw + 10, K.ch + 10, K.cw * .13, 'rgba(125,255,176,.18)', '#7dffb0', 3); ctx.restore(); }
          else if (D.ph === 'play') K.rr(p.x - K.cw / 2 - 3, p.y - K.ch / 2 - 3, K.cw + 6, K.ch + 6, K.cw * .12, null, 'rgba(255,255,255,.16)', 2);
          if (D.faceDown) K.card(-1, p.x, p.y, 0, 1);
          c.forEach((id, k) => {
            const top = k === c.length - 1, r = top ? ((id * 37) % 11 - 5) * .012 : ((id * 53) % 13 - 6) * .03;
            K.card(id, p.x + (top ? 0 : ((id * 29) % 9 - 4)), p.y + (top ? 0 : ((id * 17) % 7 - 3)), r, 1 + (top ? D.pulse[i] * .05 : 0), top && D.pulse[i] > 0 ? { glow: 'rgba(160,230,255,' + D.pulse[i] + ')' } : null);
          });
        });
        if (D.kb && D.ph === 'play') { const p = pilePos(D.pref); ctx.save(); ctx.fillStyle = '#ffe27a'; ctx.translate(p.x, p.y + K.ch / 2 + 14); ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(8, 4); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill(); ctx.restore(); }

        const od = L.od, md = L.md;
        drawStack(D.dn[1], od.x, od.y, 1, 5); K.text(String(D.dn[1]), od.x, od.y + K.ch / 2 + 15, P ? 12 : 15, '#fff', { stroke: 'rgba(0,0,0,.65)' });
        drawStack(D.dn[0], md.x, md.y, 1, 5); K.text(String(D.dn[0]), md.x, md.y + (P ? -K.ch / 2 - 12 : K.ch / 2 + 15), P ? 12 : 15, '#fff', { stroke: 'rgba(0,0,0,.65)' });
        const info = (a, p, left) => {
          K.avatar(a.x, a.y, L.av, M.av[p] || 0, {});
          K.text(nm(p), a.x, a.y + L.av + 13, P ? 11 : 14, '#fff', { stroke: 'rgba(0,0,0,.7)' });
          K.text(left + ' left', a.x, a.y + L.av + (P ? 25 : 31), P ? 10 : 12, '#9ad9ee', { stroke: 'rgba(0,0,0,.6)', weight: 800 });
        };
        info(L.oav, 1 - viewer, opLeft()); info(L.mav, viewer, myLeft());

        for (let i = 0; i < 5; i++) if (opresent(i) && !D.ohold[i] && D.ox[i] != null) K.card(-1, D.ox[i], L.oy, 0, L.os);
        const pl = D.ph === 'play';
        for (let i = 0; i < 5; i++) {
          if (D.hand[i] == null || D.hold[i] || (D.drag && D.drag.slot === i)) continue;
          const pe = D.pend[i], id = D.hand[i], lift = i === D.hover && !D.drag ? -12 : 0;
          K.card(id, pe ? pe.x : D.px[i], (pe ? pe.y : D.py[i]) + lift, 0, 1, { alpha: pe ? .65 : 1, glow: pl && opt.hints && !pe && legal(id) ? '#8be8ff' : null, dim: pl && opt.hints && !pe && !legal(id) ? .28 : 0 });
        }
        if (D.drag) K.card(D.drag.id, D.drag.x, D.drag.y, 0, 1.08, { glow: '#fff' });

        if (D.ph === 'stuck') {
          const k = (Math.sin(t * 8) + 1) / 2;
          K.text('No moves\u2026', K.W / 2, L.cy + K.ch / 2 + (P ? 34 : 38), P ? 18 : 22, '#ffe27a', { stroke: 'rgba(0,0,0,.7)', alpha: .6 + k * .4 });
        } else if (pl && !opt.tip && K.t - M.t0 < 12) {
          K.text('Drag a card onto a pile - one rank up or down', K.W / 2, L.cy + K.ch / 2 + (P ? 34 : 40), P ? 12 : 16, 'rgba(255,255,255,.7)', { stroke: 'rgba(0,0,0,.6)' });
        }
        if (M.mode === 'online' && M.role === 'host' && M.cpuSeat && scene === 'game') K.text('CPU', L.oav.x, L.oav.y - L.av - 8, 10, '#ffe27a', { stroke: 'rgba(0,0,0,.6)' });
      }

      function drawTitle(t) {
        const cx = K.W / 2, cy = K.port ? 90 : 92, s = K.port ? .8 : 1;
        [[-1, 6], [1, 20]].forEach(([o, id], i) => K.card(id, cx + o * (K.port ? 56 : 80), cy + Math.sin(t * 3 + i * 3) * 5, o * .2 + Math.sin(t * 3 + i * 3) * .03, s));
        K.text('\u00b11', cx, cy, K.port ? 24 : 32, '#8be8ff', { stroke: '#06121c', alpha: .8 + Math.sin(t * 5) * .2 });
      }

      K.loop((dt, t) => {
        if (scene === 'title') { drawTitle(t); return; }
        simTick(dt);
        drawBoard(t, dt);
      });

      function showTitle() {
        scene = 'title'; K.menuBtn.hidden = true; K.netBadge('');
        M.tok++; M.eng = null; M.role = 'local'; M.mode = 'cpu'; M.q = [];
        K.reset(); D.ph = 'idle'; D.drag = null; D.cen = [[], []]; layout();
        K.show(`<div class="cg-title"><div class="cg-logo">SPEED</div><p class="cg-tag">No turns. Be faster.</p>
<button class="cg-big gold" data-a="cpu">Play vs CPU<small>${opt.diff} opponent</small></button>
<button class="cg-big blue" data-a="online">Play online<small>1 v 1 with a friend</small></button>
<div class="cg-row"><button class="cg-sm" data-a="opts">Options</button><button class="cg-sm" data-a="rules">How to play</button></div>${opt.wins ? `<p style="font-size:12px;opacity:.7">Games won: ${opt.wins}${opt.best ? ' \u00b7 best ' + opt.best + 's' : ''}</p>` : ''}</div>`, a => {
          if (a === 'cpu') newMatch(false);
          else if (a === 'online') startOnline();
          else if (a === 'opts') showOpts('title');
          else if (a === 'rules') showRules('title');
        }, 'clear');
      }
      function showRules(back) { K.show(`<div class="cg-box wide">${SP_RULES}<button class="cg-big slate" data-a="back">Back</button></div>`, () => (back === 'game' ? showMenu() : showTitle())); }
      function showOpts(back) {
        K.show(`<div class="cg-box wide"><p class="cg-kick">Options</p><h3>Game setup</h3>
${K.optRow('CPU speed', 'Reaction time of the computer', 'diff', [['Casual', 'Casual'], ['Quick', 'Quick'], ['Lightning', 'Lightning']])}
${K.optRow('Hints', 'Highlight cards you can play', 'hints', [[true, 'On'], [false, 'Off']])}
${K.optRow('Card back', '', 'back', [['red', 'Red'], ['blue', 'Blue'], ['green', 'Green'], ['purple', 'Purple']])}
<button class="cg-big green" data-a="back">Done</button></div>`, () => (back === 'game' ? showMenu() : showTitle()));
      }
      K.onOpt = k => { if (k === 'back') { K.setBack(...WAR_BACKS[opt.back]); K.fit(true); } };
      function showMenu() {
        K.show(`<div class="cg-box"><p class="cg-kick">${M.mode === 'online' ? 'Menu (game continues)' : 'Paused'}</p><h3>Menu</h3>
<button class="cg-big green" data-a="resume">Resume</button>
<button class="cg-big blue" data-a="rules">How to play</button>
<button class="cg-big slate" data-a="opts">Options</button>
${M.mode === 'online' ? '' : '<button class="cg-big gold" data-a="new">Restart</button>'}
<button class="cg-big red" data-a="quit">${M.mode === 'online' ? 'Leave game' : 'Quit to menu'}</button></div>`, a => {
          if (a === 'resume') K.hide();
          else if (a === 'rules') showRules('game');
          else if (a === 'opts') showOpts('game');
          else if (a === 'new') newMatch(false);
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }
      K.menuBtn.addEventListener('click', () => { if (scene === 'game') { if (K.paneOpen()) K.hide(); else showMenu(); } });

      function newMatch(online) {
        M.tok++;
        if (!online) { M.mode = 'cpu'; M.role = 'local'; M.cpuSeat = true; M.names = ['You', pick(NAMES)]; M.av = [0, 3 + Math.floor(Math.random() * 5)]; M.pids = []; }
        viewer = 0;
        M.eng = SpGame(); M.q = []; M.clk = 0; M.bot = { at: 0, idle: true }; M.evn = 0; M.shown = false; M.last = null; M.syncAt = 0;
        scene = 'game'; K.menuBtn.hidden = false; K.hide();
        K.netBadge(online ? 'Online' : '');
        if (online) { M.cpuSeat = !M.pids[1]; if (M.pids[1]) api.net.sendTo(M.pids[1], { t: 'setup', names: M.names, av: M.av }); }
        const g = M.eng, tok = M.tok;
        g.deal(); flush(g.take());
        [[.9, 3], [1.7, 2], [2.5, 1]].forEach(([s, n]) => later(s, () => { if (tok === M.tok) flush([{ k: 'cd', n }]); }));
        later(3.3, () => { if (tok === M.tok) { g.start(); flush(g.take()); } });
      }

      function showOver() {
        if (M.shown || scene !== 'game' || !M.last) return;
        M.shown = true;
        const e = M.last, win = e.w === viewer;
        if (win && (M.mode === 'online' || opt.diff !== 'Casual')) { opt.wins = (opt.wins || 0) + 1; opt.tip = true; if (!opt.best || M.secs < opt.best) opt.best = M.secs; K.saveOpt(); api.submit(M.secs); }
        const canNext = M.role !== 'guest';
        K.show(`<div class="cg-box"><p class="cg-kick">Game over</p><h3>${win ? 'You win!' : esc(nm(e.w)) + ' wins'}</h3>
<div class="cg-stats"><div><span>Time</span><b>${M.secs}s</b></div><div><span>Your plays</span><b>${M.myPlays}</b></div><div><span>Speed flips</span><b>${M.flips}</b></div><div><span>Your cards left</span><b>${e.left[viewer]}</b></div></div>
${M.mode === 'online' ? (canNext ? '<button class="cg-big green" data-a="again">Rematch</button><button class="cg-big blue" data-a="lobby">Back to lobby</button>' : '<p>Waiting for the host\u2026</p>') : '<button class="cg-big green" data-a="again">Play again</button>'}
<button class="cg-big slate" data-a="quit">${M.mode === 'online' ? 'Leave' : 'Menu'}</button></div>`, a => {
          if (a === 'again') newMatch(M.mode === 'online');
          else if (a === 'lobby') startOnline();
          else if (a === 'quit') { if (M.mode === 'online') leaveOnline(); else showTitle(); }
        });
      }

      function leaveOnline() { M.tok++; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.pids = []; api.net.close(); showTitle(); }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => {
          if (M.mode === 'online' && M.role === 'host' && p && p.id === M.pids[1] && M.eng && !M.cpuSeat) {
            M.cpuSeat = true; M.bot = { at: M.clk + 1, idle: true }; M.names[1] += ' (CPU)'; api.toast('Opponent left. A CPU takes over.');
          }
        });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && M.eng && p && p.id === M.pids[1]) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || !M.role || M.role === 'local') return;
          M.tok++; M.role = 'local'; M.eng = null; K.sfx('lose'); K.reset();
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>${h}</h3><p>The game ended.</p><button class="cg-big green" data-a="room">Online lobby</button><button class="cg-big red" data-a="cpu">Play vs CPU</button></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); newMatch(false); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || scene !== 'game') return;
          const on = api.net.connected;
          K.netBadge(!on && M.role === 'guest' ? 'Reconnecting\u2026' : 'Online' + (M.role === 'guest' && api.net.rtt ? ' \u00b7 ' + api.net.rtt + ' ms' : ''), !on && M.role === 'guest');
        }, 1000);
      }
      function sendSync(id) {
        api.net.sendTo(id, { t: 'setup', names: M.names, av: M.av, resync: 1 });
        api.net.sendTo(id, { t: 'sync', n: M.evn, view: M.eng.view(1) });
        const s = M.eng.s;
        if (s.phase === 'over') api.net.sendTo(id, { t: 'ev', n: M.evn, es: [{ k: 'over', w: s.winner, left: [0, 1].map(q => s.draw[q].length + s.hand[q].filter(x => x != null).length) }] });
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        K.hide(); scene = 'title'; K.menuBtn.hidden = true; K.reset(); D.cen = [[], []]; D.ph = 'idle';
        M.mode = 'online'; M.role = null; M.eng = null;
        const r = await api.net.room({ title: 'Speed', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: false });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; return showTitle(); }
        M.role = r.role;
        if (r.role === 'host') {
          M.names = [r.players[0].name, (r.players[1] || {}).name || 'Player']; M.av = [1, 4]; M.pids = [r.players[0].id, (r.players[1] || {}).id];
          newMatch(true);
        } else K.show(`<div class="cg-box"><p class="cg-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal\u2026</p><button class="cg-sm" data-a="leave">Leave</button></div>`, a => { if (a === 'leave') leaveOnline(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng || from !== M.pids[1] || M.cpuSeat) return;
          if (d.t === 'act') {
            if (M.eng.act(1, d.slot, d.pile)) flush(M.eng.take());
            else api.net.sendTo(from, { t: 'no', slot: d.slot });
          }
          return;
        }
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = 1; M.names = d.names; M.av = d.av; M.got = 0;
          if (!d.resync) { K.reset(); D.pend = {}; D.cen = [[], []]; }
          scene = 'game'; K.menuBtn.hidden = false; K.hide(); K.netBadge('Online');
        } else if (M.role !== 'guest') return;
        else if (d.t === 'ev') { M.got = d.n; d.es.forEach(handleEvent); }
        else if (d.t === 'no') { const p = D.pend[d.slot]; delete D.pend[d.slot]; bump('Too late!', p ? p.x : K.W / 2, (p ? p.y : L.hy) - 40); }
        else if (d.t === 'sync') { M.got = d.n; K.reset(); applyView(d.view); }
        else if (d.t === 'fs') {
          if (d.n !== M.got || K.busy() || D.drag || Object.keys(D.pend).length || D.ph === 'idle' || D.ph === 'ready') return;
          const v = d.view;
          if (JSON.stringify([v.hand, v.top, v.dn, v.sn]) !== JSON.stringify([D.hand, D.top, D.dn, D.sn])) applyView(v);
        }
      }

      K.fit(true);
      root._t = { M, D, K, SPD, get viewer() { return viewer; }, get scene() { return scene; }, tryPlay, legal, hpos, pilePos, sendSync };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; if (K.ro) K.ro.disconnect(); } };
    }
  });

  const CV_FONT = 'Nunito, Arial Rounded MT Bold, Arial, sans-serif';
  const cvTxt = (t, x, y, s, f, sw, extra) => `<text x="${x}" y="${y}" font-family="${CV_FONT}" font-weight="900" font-size="${s}" fill="${f}" stroke="#121214" stroke-width="${sw}" paint-order="stroke" text-anchor="middle"${extra || ''}>${t}</text>`;
  const cvCard = (x, y, r, rank, suit, s, face) => {
    const col = suit === '\u2665' || suit === '\u2666' ? '#d62839' : '#17171b';
    return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s || 1})"><rect x="-48" y="-68" width="96" height="136" rx="10" fill="#000" opacity=".28" transform="translate(4 7)"/><rect x="-48" y="-68" width="96" height="136" rx="10" fill="#fff"/>${face || ''}<text x="-35" y="-40" font-family="${CV_FONT}" font-weight="900" font-size="26" fill="${col}" text-anchor="middle">${rank}</text><text x="-35" y="-17" font-family="Arial, sans-serif" font-size="22" fill="${col}" text-anchor="middle">${suit}</text>${face ? '' : `<text x="4" y="24" font-family="Arial, sans-serif" font-size="68" fill="${col}" text-anchor="middle">${suit}</text>`}</g>`;
  };
  const cvBack = (x, y, r, c1, c2, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s || 1})"><rect x="-48" y="-68" width="96" height="136" rx="10" fill="#000" opacity=".28" transform="translate(4 7)"/><rect x="-48" y="-68" width="96" height="136" rx="10" fill="#fff"/><rect x="-42" y="-62" width="84" height="124" rx="7" fill="${c1}"/><rect x="-36" y="-56" width="72" height="112" rx="5" fill="none" stroke="${c2}" stroke-width="3" opacity=".6"/><path d="M0-26l7 17h19l-15 11 6 18-17-11-17 11 6-18-15-11h19z" fill="#fff" opacity=".9"/></g>`;

  Ameplay.covers['crazy-eights'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ce-g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2f9a62"/><stop offset=".6" stop-color="#17643c"/><stop offset="1" stop-color="#0a3320"/></radialGradient></defs><rect width="400" height="300" fill="url(#ce-g)"/><ellipse cx="200" cy="150" rx="170" ry="115" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="4"/>${cvCard(92, 168, -22, 'K', '\u2665', 1)}${cvCard(308, 168, 22, '8', '\u2666', 1)}<g transform="translate(200 146) rotate(-4)"><rect x="-56" y="-80" width="112" height="160" rx="12" fill="#000" opacity=".3" transform="translate(5 8)"/><rect x="-56" y="-80" width="112" height="160" rx="12" fill="#fff"/><rect x="-48" y="-72" width="96" height="144" rx="8" fill="#fff8e1" stroke="#e0a800" stroke-width="3"/>${cvTxt('8', 0, 28, 104, '#ffcf3f', 9)}<text x="-38" y="-44" font-family="Arial" font-size="24" fill="#17171b" text-anchor="middle">\u2660</text><text x="38" y="-44" font-family="Arial" font-size="24" fill="#d62839" text-anchor="middle">\u2665</text><text x="-38" y="64" font-family="Arial" font-size="24" fill="#d62839" text-anchor="middle">\u2666</text><text x="38" y="64" font-family="Arial" font-size="24" fill="#17171b" text-anchor="middle">\u2663</text></g><g fill="#fff"><path d="M300 56l5-14 5 14 14 5-14 5-5 14-5-14-14-5z"/><path d="M98 66l3-9 3 9 9 3-9 3-3 9-3-9-9-3z"/></g></svg>`;

  Ameplay.covers['war'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="wr-g" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#7a1c2e"/><stop offset=".6" stop-color="#3a1019"/><stop offset="1" stop-color="#14070c"/></radialGradient><linearGradient id="wr-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="1" stop-color="#ff7a1c"/></linearGradient></defs><rect width="400" height="300" fill="url(#wr-g)"/><g stroke="#ffd78a" stroke-opacity=".12" stroke-width="10"><path d="M200 0V300M0 150H400M60 20L340 280M340 20L60 280"/></g>${cvBack(60, 130, -8, '#2457b8', '#9fc1ff', .78)}${cvBack(78, 130, -4, '#2457b8', '#9fc1ff', .78)}${cvBack(322, 130, 8, '#2457b8', '#9fc1ff', .78)}${cvBack(340, 130, 4, '#2457b8', '#9fc1ff', .78)}${cvCard(140, 120, -10, '7', '\u2660', 1.05)}${cvCard(260, 120, 10, '7', '\u2665', 1.05)}<g transform="translate(200 238) rotate(-3) scale(.62)"><path d="M-110-4L-80-40 -60-18 -30-58 0-22 30-60 62-18 86-42 112-4 90 6 112 40 70 24 50 56 18 30-8 58-34 28-66 54-84 22-112 36-92 6z" fill="#e8282b" opacity=".92" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>${cvTxt('WAR!', 0, 20, 60, 'url(#wr-t)', 9)}</g></svg>`;

  Ameplay.covers['speed'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sp-g" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#23708c"/><stop offset=".6" stop-color="#0f3550"/><stop offset="1" stop-color="#06131e"/></radialGradient></defs><rect width="400" height="300" fill="url(#sp-g)"/><g stroke="#9fe8ff" stroke-linecap="round" opacity=".55"><path d="M10 70H110M30 100H150M0 130H90M20 172H130M10 202H110M40 232H150" stroke-width="5"/><path d="M290 70H390M250 100H370M310 130H400M270 172H380M290 202H390M250 232H360" stroke-width="5"/></g>${cvBack(54, 232, -8, '#c0392b', '#ffb0a0', .55)}${cvBack(346, 232, 8, '#c0392b', '#ffb0a0', .55)}${cvCard(134, 140, -9, '9', '\u2660', 1.05)}${cvCard(266, 140, 9, 'Q', '\u2666', 1.05)}<g transform="translate(200 142) rotate(-4)"><path d="M-14-78l-40 70h30l-14 66 54-84h-32l26-52z" fill="#ffd23f" stroke="#121214" stroke-width="6" stroke-linejoin="round"/></g>${cvTxt('\u00b11', 200, 268, 44, '#8be8ff', 7)}</svg>`;

})();
