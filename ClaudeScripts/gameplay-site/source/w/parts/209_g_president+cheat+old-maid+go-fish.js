(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const OM = 999;
  const rk = id => id === OM ? 0 : id % 13 + 2;
  const st = id => id === OM ? 4 : Math.floor((id % 52) / 13);
  const isRed = id => { const s = st(id); return s === 1 || s === 2; };
  const RL = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const RN = ['', '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];
  const RNP = ['', '', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens', 'jacks', 'queens', 'kings', 'aces'];
  const SCH = ['\u2660', '\u2665', '\u2666', '\u2663'];
  const SNAME = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  const cname = id => id === OM ? 'Old Maid' : RL[rk(id)] + SCH[st(id)];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const LEVELS = ['Easy', 'Normal', 'Hard', 'Expert'];
  const BOT_NAMES = ['Rosa', 'Theo', 'Kai', 'Mila', 'Otto', 'Jade', 'Leo', 'Nora', 'Ivy', 'Hugo', 'Zoe', 'Finn'];

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuf(a, R) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const deck = (decks = 1) => { const d = []; for (let k = 0; k < decks; k++) for (let i = 0; i < 52; i++) d.push(k * 52 + i); return d; };

  const SUIT_PATHS = [
    '<path d="M50 4C68 26 93 42 93 63c0 14-10 23-22 23-8 0-15-4-19-11 1 11 5 18 12 21H36c7-3 11-10 12-21-4 7-11 11-19 11-12 0-22-9-22-23C7 42 32 26 50 4z"/>',
    '<path d="M50 93C18 66 5 50 5 32 5 17 16 7 30 7c9 0 16 5 20 13 4-8 11-13 20-13 14 0 25 10 25 25 0 18-13 34-45 61z"/>',
    '<path d="M50 3C61 26 77 40 93 50 77 60 61 74 50 97 39 74 23 60 7 50 23 40 39 26 50 3z"/>',
    '<circle cx="50" cy="28" r="22"/><circle cx="25" cy="62" r="22"/><circle cx="75" cy="62" r="22"/><path d="M50 40v34c0 10-3 16-12 23h24c-9-7-12-13-12-23V40z"/>'
  ];
  const DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    SUIT_PATHS.map((p, i) => `<symbol id="cg-s${i}" viewBox="0 0 100 100">${p}</symbol>`).join('') + '</defs></svg>';
  const use = s => `<svg viewBox="0 0 100 100"><use href="#cg-s${s}"/></svg>`;
  const pip = (s, cx, cy, sz, flip) => `<svg class="pp" viewBox="0 0 100 100" style="left:${cx - sz / 2}px;top:${cy - sz / 2}px;width:${sz}px;height:${sz}px${flip ? ';transform:rotate(180deg)' : ''}"><use href="#cg-s${s}"/></svg>`;

  const PIPS = {
    2: [[0, 0], [0, 1]], 3: [[0, 0], [0, .5], [0, 1]],
    4: [[-1, 0], [1, 0], [-1, 1], [1, 1]], 5: [[-1, 0], [1, 0], [0, .5], [-1, 1], [1, 1]],
    6: [[-1, 0], [1, 0], [-1, .5], [1, .5], [-1, 1], [1, 1]],
    7: [[-1, 0], [1, 0], [0, .25], [-1, .5], [1, .5], [-1, 1], [1, 1]],
    8: [[-1, 0], [1, 0], [0, .25], [-1, .5], [1, .5], [0, .75], [-1, 1], [1, 1]],
    9: [[-1, 0], [1, 0], [-1, 1 / 3], [1, 1 / 3], [0, .5], [-1, 2 / 3], [1, 2 / 3], [-1, 1], [1, 1]],
    10: [[-1, 0], [1, 0], [0, 1 / 6], [-1, 1 / 3], [1, 1 / 3], [-1, 2 / 3], [1, 2 / 3], [0, 5 / 6], [-1, 1], [1, 1]]
  };

  function courtHalf(r, red, s) {
    const robe = red ? '#c62f3a' : '#2a56a8', robe2 = red ? '#8e1d27' : '#1b3c80', gold = '#e6b02a', skin = '#f4d0a8';
    let g = `<path d="M2 48C2 34 12 28 26 28s24 6 24 20z" fill="${robe}"/><path d="M2 48C2 40 5 35 9 32l4 16zM50 48c0-8-3-13-7-16l-4 16z" fill="${robe2}"/><path d="M15 29l11 14 11-14" fill="none" stroke="${gold}" stroke-width="2.6" stroke-linejoin="round"/>`;
    g += `<rect x="22.5" y="24" width="7" height="6" fill="${skin}"/>`;
    if (r === 13) {
      g += `<ellipse cx="26" cy="19.5" rx="7.4" ry="8.8" fill="${skin}" stroke="#8a5a2d" stroke-width=".5"/>`;
      g += '<path d="M18 21c0 10 4 13 8 13s8-3 8-13c-2 3.5-5 5-8 5s-6-1.500-8-5z" fill="#d7d9dd" stroke="#9a9ca2" stroke-width=".4"/>';
      g += '<path d="M18.300 17c0-8 3.500-11 7.700-11s7.700 3 7.700 11c-1.500-3-4-4.500-7.700-4.500s-6.200 1.500-7.700 4.500z" fill="#d7d9dd"/>';
      g += '<path d="M21.500 22.500q4.500-2.500 9 0q-4.500 1.500-9 0z" fill="#b9bbc0"/>';
      g += `<path d="M17.500 11.500l.8-9.500 4.200 4.300L26 0l3.500 6.300 4.200-4.300.8 9.500z" fill="${gold}" stroke="#9a6d12" stroke-width=".7"/><circle cx="26" cy="8.200" r="1.300" fill="#c62f3a"/>`;
    } else if (r === 12) {
      g += '<path d="M16.500 20c-1.500-11 3-16 9.500-16s11 5 9.500 16l2 15-6-4.500v-9.500h-11v9.500l-6 4.500z" fill="#7a4a24"/>';
      g += `<ellipse cx="26" cy="19.500" rx="7" ry="8.600" fill="${skin}" stroke="#8a5a2d" stroke-width=".5"/>`;
      g += '<path d="M19 17c1-5 4-7 7-7s6 2 7 7c-3-2.500-5-3-7-3s-4 .5-7 3z" fill="#7a4a24"/>';
      g += `<path d="M19.500 10l.5-6.500 3 3.500 3-5.500 3 5.500 3-3.500.5 6.500z" fill="${gold}" stroke="#9a6d12" stroke-width=".7"/><circle cx="26" cy="5.500" r="1.200" fill="#2a56a8"/>`;
    } else {
      g += '<path d="M17 21c-1-10 3-15 9-15s10 5 9 15l-2.500-2v-5h-13v5z" fill="#6b4423"/>';
      g += `<ellipse cx="26" cy="19.500" rx="7" ry="8.600" fill="${skin}" stroke="#8a5a2d" stroke-width=".5"/>`;
      g += `<path d="M17.500 14c0-7 4-10 8.500-10s8.500 3 8.500 10z" fill="${robe}" stroke="${robe2}" stroke-width=".6"/><path d="M16 14.500h20" stroke="${gold}" stroke-width="2.200" stroke-linecap="round"/>`;
      g += '<path d="M33 7c5-7 11-4 13 3-5-2.500-8-1.500-13-3z" fill="#f2f2f2" stroke="#b9b9b9" stroke-width=".4"/>';
    }
    g += '<circle cx="23" cy="19.500" r=".95" fill="#222"/><circle cx="29" cy="19.500" r=".95" fill="#222"/><path d="M26 20.200v2.800" stroke="#a46f45" stroke-width=".6" fill="none"/>';
    if (r !== 13) g += '<path d="M23.300 25.200q2.700 1.800 5.400 0" stroke="#9a3a3a" stroke-width=".9" fill="none" stroke-linecap="round"/>';
    g += `<svg x="3" y="35" width="9" height="9" viewBox="0 0 100 100" fill="${red ? '#fff' : '#fff'}" opacity=".9"><use href="#cg-s${s}"/></svg>`;
    return g;
  }
  function courtHTML(r, s) {
    const red = s === 1 || s === 2, c = red ? '#c8202f' : '#1c1c22';
    const half = courtHalf(r, red, s);
    return `<svg class="cg-court" viewBox="0 0 100 140"><rect x="22" y="24" width="56" height="92" rx="3" fill="#fbf4df" stroke="${c}" stroke-width="1.200"/><rect x="25" y="27" width="50" height="86" rx="2" fill="none" stroke="${c}" stroke-width=".5" opacity=".6"/>` +
      `<g transform="translate(24 22)">${half}</g><g transform="rotate(180 50 70) translate(24 22)">${half}</g><path d="M24 70h52" stroke="${c}" stroke-width=".6" opacity=".5"/></svg>`;
  }
  function omFace() {
    return '<svg class="cg-om" viewBox="0 0 100 140"><rect x="5" y="5" width="90" height="130" rx="8" fill="#fff1d6"/><rect x="9" y="9" width="82" height="122" rx="6" fill="none" stroke="#7b4fa3" stroke-width="1.500"/>' +
      '<path d="M22 130C24 104 36 96 50 96s26 8 28 34z" fill="#8e5bb5"/><path d="M40 98l10 12 10-12" fill="none" stroke="#f5e6ff" stroke-width="2.500"/><circle cx="50" cy="108" r="3" fill="#e6b02a"/>' +
      '<circle cx="50" cy="40" r="9" fill="#cfcfd6"/><circle cx="50" cy="40" r="9" fill="none" stroke="#9a9aa6" stroke-width="1"/>' +
      '<ellipse cx="50" cy="66" rx="18" ry="21" fill="#f4d0a8" stroke="#8a5a2d" stroke-width=".8"/>' +
      '<path d="M29 64C26 36 74 36 71 64c-3-9-8-15-21-15S32 55 29 64z" fill="#7b4fa3"/><path d="M29 64c0 8 1 14 4 18l-3 6 8-3 6-8-6-6zM71 64c0 8-1 14-4 18l3 6-8-3-6-8 6-6z" fill="#a67bd0"/>' +
      '<circle cx="42" cy="66" r="6" fill="rgba(200,230,255,.55)" stroke="#444" stroke-width="1.200"/><circle cx="58" cy="66" r="6" fill="rgba(200,230,255,.55)" stroke="#444" stroke-width="1.200"/><path d="M48 66h4" stroke="#444" stroke-width="1.200"/>' +
      '<circle cx="42" cy="66" r="1.600" fill="#222"/><circle cx="58" cy="66" r="1.600" fill="#222"/>' +
      '<circle cx="36" cy="75" r="3.500" fill="rgba(255,120,120,.45)"/><circle cx="64" cy="75" r="3.500" fill="rgba(255,120,120,.45)"/>' +
      '<path d="M44 80q6-4 12 0" stroke="#9a3a3a" stroke-width="1.600" fill="none" stroke-linecap="round"/><path d="M42 58l5-2M58 58l-5-2" stroke="#6b4423" stroke-width="1.200" stroke-linecap="round"/>' +
      '<path d="M40 88l10 5 10-5-5-4h-10z" fill="#c0392b"/>' +
      '<text x="50" y="22" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="11" fill="#7b4fa3" letter-spacing="1">OLD MAID</text>' +
      '<text x="50" y="129" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="8" fill="#fff5ff" letter-spacing="1" opacity="0">.</text></svg>';
  }

  const FACE = new Map();
  function faceHTML(id) {
    let h = FACE.get(id);
    if (h) return h;
    if (id === OM) { h = omFace(); FACE.set(id, h); return h; }
    const r = rk(id), s = st(id), col = isRed(id) ? '#c8202f' : '#17171c';
    let mid = '';
    if (r === 14) mid = pip(s, 50, 70, s === 0 ? 52 : 42, false);
    else if (r >= 11) mid = courtHTML(r, s);
    else for (const [cx, t] of PIPS[r]) mid += pip(s, 50 + cx * 15, 30 + 80 * t, 17, t > .5);
    const ix = `<b${r === 10 ? ' class="t"' : ''}>${RL[r]}</b>${use(s)}`;
    h = `<div class="cg-fi" style="color:${col}"><div class="cg-ix">${ix}</div><div class="cg-ix rv">${ix}</div>${mid}</div>`;
    FACE.set(id, h);
    return h;
  }

  let AC = null, MUTE = () => false;
  function actx() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
    } catch (e) { return null; }
    return AC;
  }
  function tone(f, d, type, v, f2, at) {
    const a = actx(); if (!a) return;
    const t = a.currentTime + (at || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .04);
  }
  let NBUF = null;
  function noise(d, f, q, v, at, type) {
    const a = actx(); if (!a) return;
    if (!NBUF) { NBUF = a.createBuffer(1, a.sampleRate, a.sampleRate); const ch = NBUF.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const t = a.currentTime + (at || 0), s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    s.buffer = NBUF; fl.type = type || 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl).connect(g).connect(a.destination); s.start(t, Math.random() * .5); s.stop(t + d + .03);
  }
  const SND = {
    deal() { noise(.07, 4200, .9, .14); tone(210, .05, 'triangle', .04, 120); },
    place() { noise(.06, 1700, 1, .18); tone(130, .08, 'sine', .14, 70); },
    flip() { noise(.05, 6200, .8, .1); },
    take() { noise(.14, 1400, .8, .14); noise(.1, 2600, .8, .08, .08); },
    slide() { noise(.16, 2200, .6, .08); },
    pick() { tone(900, .035, 'square', .02); },
    pass() { tone(320, .14, 'sine', .07, 210); },
    turn() { tone(660, .09, 'sine', .05, 990); },
    ping() { tone(880, .12, 'sine', .06, 1320); },
    book() { tone(660, .1, 'sine', .08); tone(990, .16, 'sine', .08, 0, .08); tone(1320, .2, 'sine', .06, 0, .17); },
    pair() { tone(740, .08, 'triangle', .07, 990); },
    bad() { tone(220, .22, 'triangle', .1, 110); },
    cheat() { tone(880, .13, 'square', .09, 440); tone(880, .13, 'square', .09, 440, .16); tone(1040, .22, 'square', .09, 520, .32); },
    reveal() { tone(300, .1, 'triangle', .08, 600); },
    boom() { noise(.35, 300, .5, .22, 0, 'lowpass'); tone(90, .35, 'sine', .2, 40); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .28, 'sine', .08, 0, i * .11)); },
    lose() { tone(392, .35, 'sine', .08, 330); tone(311, .5, 'sine', .08, 220, .25); },
    fish() { tone(500, .2, 'sine', .08, 300); tone(420, .26, 'sine', .08, 240, .18); }
  };
  const snd = n => { if (MUTE()) return; try { SND[n] && SND[n](); } catch (e) {} };

  const AVC = [
    { bg: '#ffcf4a', skin: '#f3c39b', hair: '#3b2416', shirt: '#e8282b', h: 0 },
    { bg: '#7ad3f7', skin: '#c98b5f', hair: '#1c1310', shirt: '#2fa84a', h: 1 },
    { bg: '#ff9db0', skin: '#f6d2b5', hair: '#d9822b', shirt: '#1d6fc8', h: 2 },
    { bg: '#b9a5ff', skin: '#8d5a3b', hair: '#121212', shirt: '#fcc916', h: 3 },
    { bg: '#8ee09a', skin: '#efc19d', hair: '#7a4a24', shirt: '#7a3fd0', h: 1 },
    { bg: '#ffb27a', skin: '#d9a07a', hair: '#2a2a33', shirt: '#14a3a3', h: 0 },
    { bg: '#9fe3e0', skin: '#f1c7a5', hair: '#a8452a', shirt: '#e85d9a', h: 2 },
    { bg: '#ffe08a', skin: '#6e4630', hair: '#151515', shirt: '#3b5bdb', h: 3 }
  ];
  const AVMEMO = new Map();
  function avatar(i, mood) {
    const key = i + ':' + (mood || 'n');
    let s = AVMEMO.get(key);
    if (s) return s;
    const a = AVC[i % AVC.length], m = mood || 'n';
    let h = `<svg viewBox="0 0 64 64"><defs><clipPath id="cg-ac${i}${m}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#cg-ac${i}${m})"><rect width="64" height="64" fill="${a.bg}"/><circle cx="22" cy="18" r="22" fill="#fff" opacity=".22"/>`;
    h += `<ellipse cx="32" cy="66" rx="25" ry="17" fill="${a.shirt}"/>`;
    if (a.h === 1 || a.h === 2) h += `<ellipse cx="32" cy="36" rx="19" ry="21" fill="${a.hair}"/>`;
    h += `<circle cx="32" cy="33" r="14" fill="${a.skin}"/>`;
    h += `<path d="M18 31C18 18 25 15 32 15s14 3 14 16c-2-6-6-9-14-9s-12 3-14 9z" fill="${a.hair}"/>`;
    if (a.h === 3) for (let k = -2; k <= 2; k++) h += `<circle cx="${32 + k * 5.500}" cy="${19 - (k === 0 ? 1 : 0)}" r="4.600" fill="${a.hair}"/>`;
    if (a.h === 2) h += `<circle cx="44" cy="21" r="5" fill="${a.hair}"/>`;
    const ey = m === 't' ? 31 : 33;
    if (m === 'a') h += `<path d="M22 28l7 3M42 28l-7 3" stroke="#222" stroke-width="2" stroke-linecap="round"/>`;
    if (m === 's') h += `<path d="M22 30l6-2M42 30l-6-2" stroke="#222" stroke-width="1.600" stroke-linecap="round"/>`;
    if (m === 'o') h += `<circle cx="26" cy="${ey}" r="2.600" fill="#fff" stroke="#222" stroke-width="1"/><circle cx="38" cy="${ey}" r="2.600" fill="#fff" stroke="#222" stroke-width="1"/><circle cx="26" cy="${ey}" r="1.100" fill="#222"/><circle cx="38" cy="${ey}" r="1.100" fill="#222"/>`;
    else h += `<circle cx="26" cy="${ey}" r="1.900" fill="#222"/><circle cx="38" cy="${ey}" r="1.900" fill="#222"/>`;
    h += '<circle cx="22" cy="38" r="2.600" fill="rgba(255,100,100,.4)"/><circle cx="42" cy="38" r="2.600" fill="rgba(255,100,100,.4)"/>';
    if (m === 'h') h += '<path d="M25 39q7 8 14 0z" fill="#8a2f2f" stroke="#222" stroke-width="1" stroke-linejoin="round"/>';
    else if (m === 's' || m === 'a') h += '<path d="M26 43q6-5 12 0" stroke="#222" stroke-width="1.800" fill="none" stroke-linecap="round"/>';
    else if (m === 'o') h += '<ellipse cx="32" cy="42" rx="3" ry="3.600" fill="#8a2f2f" stroke="#222" stroke-width="1"/>';
    else if (m === 't') h += '<path d="M28 41h8" stroke="#222" stroke-width="1.800" stroke-linecap="round"/>';
    else h += '<path d="M26 39q6 5 12 0" stroke="#222" stroke-width="1.800" fill="none" stroke-linecap="round"/>';
    h += '</g></svg>';
    AVMEMO.set(key, h);
    return h;
  }

  class Spr {
    constructor(layer) {
      this.el = mk('div', 'cg-c', '<div class="cg-ci"><div class="cg-f"></div><div class="cg-b"></div></div>');
      this.ci = this.el.firstChild; this.f = this.ci.firstChild;
      this.id = -1; this.x = 0; this.y = 0; this.r = 0; this.s = 1; this.z = 1; this.up = false; this.zone = null; this.ready = false;
      layer.append(this.el);
    }
    face(id) { if (id === this.id) return; this.id = id; this.f.innerHTML = id >= 0 ? faceHTML(id) : ''; }
    to(p, dur, delay) {
      if (p) Object.assign(this, p);
      const e = this.el.style, c = this.ci.style;
      if (!dur || !this.ready) {
        e.transition = 'none'; c.transition = 'none';
      } else {
        e.transition = `transform ${dur}s cubic-bezier(.2,.75,.25,1) ${delay || 0}s`;
        c.transition = `transform ${Math.min(.4, dur)}s ease ${delay || 0}s`;
      }
      e.transform = `translate3d(${(this.x - 50).toFixed(1)}px,${(this.y - 70).toFixed(1)}px,0) rotate(${this.r.toFixed(2)}deg) scale(${this.s.toFixed(3)})`;
      c.transform = this.up ? 'rotateY(0deg)' : 'rotateY(180deg)';
      e.zIndex = this.z;
      if (!dur || !this.ready) { void this.el.offsetWidth; this.ready = true; }
      return this;
    }
    cls(n, on) { this.el.classList.toggle(n, !!on); return this; }
    kill() { this.el.remove(); }
  }

  function fanPts(n, cx, cy, maxW, o) {
    const out = [];
    const gap = n > 1 ? Math.min(o.gap, maxW / (n - 1)) : 0;
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) - .5 : 0;
      out.push({ x: cx + (i - (n - 1) / 2) * gap, y: cy + (o.curve || 0) * t * t * 4, r: t * (o.rot || 0) * (n > 1 ? Math.min(1, (n - 1) * gap / (o.rotW || 200)) : 0) });
    }
    return out;
  }
  function rowPts(n, cx, cy, maxW, gapMax, minGap, rowH, maxRows) {
    const per = Math.max(1, Math.floor(maxW / minGap) + 1);
    const rows = Math.min(maxRows || 3, Math.ceil(n / per));
    const perRow = Math.ceil(n / rows);
    const out = [];
    for (let r = 0; r < rows; r++) {
      const cnt = Math.min(perRow, n - r * perRow);
      const gap = cnt > 1 ? Math.min(gapMax, maxW / (cnt - 1)) : 0;
      for (let i = 0; i < cnt; i++) out.push({ x: cx + (i - (cnt - 1) / 2) * gap, y: cy - (rows - 1 - r) * rowH, r: 0, row: r });
    }
    return out;
  }

  const BASECSS = `
@@{gap:0;position:relative}
@@ [hidden]{display:none!important}
@@ .cg-wrap{position:relative;border-radius:22px;overflow:hidden;background:linear-gradient(145deg,#8a5a2d,#4b2a11 60%,#6d4220);box-shadow:0 12px 34px rgba(30,15,5,.4),inset 0 0 0 2px rgba(255,220,160,.25);--f1:#2f8a56;--f2:#1c5e3a;--f3:#0f3a23;--bk:#1d4f9e;--bk2:#14377a;touch-action:manipulation}
@@ .cg-wrap[data-felt=blue]{--f1:#3a72b8;--f2:#24508a;--f3:#122e56}
@@ .cg-wrap[data-felt=red]{--f1:#a2323f;--f2:#6f1a26;--f3:#3d0b14}
@@ .cg-wrap[data-felt=purple]{--f1:#6b46a8;--f2:#47287a;--f3:#25134a}
@@ .cg-wrap[data-back=red]{--bk:#b3262e;--bk2:#7f1820}
@@ .cg-wrap[data-back=green]{--bk:#1f7d49;--bk2:#135630}
@@ .cg-wrap[data-back=black]{--bk:#34343c;--bk2:#1b1b20}
@@ .cg-stage{position:absolute;left:0;top:0;transform-origin:0 0;font-family:var(--sans,system-ui,sans-serif);color:#fff;overflow:hidden}
@@ .cg-felt{position:absolute;inset:11px;border-radius:40px;background:radial-gradient(ellipse at 50% 44%,var(--f1) 0%,var(--f2) 58%,var(--f3) 100%);box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),inset 0 6px 40px rgba(0,0,0,.45),0 0 0 3px rgba(255,220,160,.18)}
@@ .cg-felt::before{content:'';position:absolute;inset:0;border-radius:inherit;opacity:.07;background:repeating-radial-gradient(circle at 30% 20%,#fff 0 1px,transparent 1px 3px)}
@@ .cg-felt::after{content:'';position:absolute;inset:14px;border:2px dashed rgba(255,255,255,.14);border-radius:30px}
@@ .cg-decor{position:absolute;inset:0;pointer-events:none}
@@ .cg-seats,.cg-cards,.cg-ui{position:absolute;inset:0;pointer-events:none}
@@ .cg-seat.pick{pointer-events:auto;cursor:pointer}
@@ .cg-seat.pick .cg-av{box-shadow:0 0 0 3px rgba(91,226,122,.75),0 3px 8px rgba(0,0,0,.5)}
@@ .cg-seat.tgt .cg-av{box-shadow:0 0 0 4px #5be27a,0 0 20px 7px rgba(91,226,122,.85)}
@@ .cg-cards{perspective:1400px}
@@ .cg-c{position:absolute;left:0;top:0;width:100px;height:140px;transform-origin:50% 50%;will-change:transform;pointer-events:auto;cursor:default}
@@ .cg-c.hot{cursor:pointer}
@@ .cg-ci{position:absolute;inset:0;transform-style:preserve-3d}
@@ .cg-f,.cg-b{position:absolute;inset:0;border-radius:9px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.45)}
@@ .cg-f{background:linear-gradient(160deg,#fff,#f3f1ea);border:1px solid rgba(0,0,0,.25)}
@@ .cg-b{transform:rotateY(180deg);background-color:var(--bk);border:5px solid #fff;border-radius:9px;box-sizing:border-box;background-image:linear-gradient(45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.2) 75%),linear-gradient(45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.2) 75%);background-size:12px 12px;background-position:0 0,6px 6px}
@@ .cg-b::after{content:'';position:absolute;left:50%;top:50%;width:34px;height:50px;margin:-25px 0 0 -17px;border-radius:50%;background:radial-gradient(ellipse,#fff 0 22%,var(--bk2) 24% 52%,#fff 54% 62%,var(--bk) 64%);box-shadow:0 0 0 2px var(--bk2)}
@@ .cg-c.glow .cg-f{box-shadow:0 0 0 3px #ffd54a,0 0 16px 4px rgba(255,213,74,.8)}
@@ .cg-c.sel .cg-f{box-shadow:0 0 0 3px #5be27a,0 0 16px 4px rgba(91,226,122,.8)}
@@ .cg-c.dim .cg-f{filter:brightness(.62) saturate(.7)}
@@ .cg-c.pt .cg-b{box-shadow:0 0 0 3px #ffd54a,0 0 14px 3px rgba(255,213,74,.85)}
@@ .cg-fi{position:absolute;inset:0;font-family:Georgia,'Times New Roman',serif}
@@ .cg-ix{position:absolute;left:5px;top:4px;width:22px;display:flex;flex-direction:column;align-items:center;line-height:1}
@@ .cg-ix b{font-size:23px;font-weight:700;letter-spacing:-1px}
@@ .cg-ix b.t{font-size:20px;letter-spacing:-2px}
@@ .cg-ix svg{width:15px;height:15px;margin-top:1px;fill:currentColor}
@@ .cg-ix.rv{left:auto;top:auto;right:5px;bottom:4px;transform:rotate(180deg)}
@@ .cg-fi .pp{position:absolute;fill:currentColor}
@@ .cg-court,.cg-om{position:absolute;inset:0;width:100%;height:100%}
@@ .cg-seat{position:absolute;width:112px;margin:-30px 0 0 -56px;text-align:center;transition:opacity .3s,filter .3s;z-index:3}
@@ .cg-seat.out{opacity:.55;filter:grayscale(.6)}
@@ .cg-av{position:relative;width:48px;height:48px;margin:0 auto;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.5);border:3px solid #fff;box-sizing:content-box;background:#fff}
@@ .cg-av svg{display:block;width:100%;height:100%;border-radius:50%}
@@ .cg-ring{position:absolute;left:50%;top:-3px;width:60px;height:60px;margin-left:-30px;border-radius:50%;border:3px solid transparent;pointer-events:none;transition:border-color .2s}
@@ .cg-seat.turn .cg-ring{border-color:#ffd54a;box-shadow:0 0 0 3px rgba(255,213,74,.3),0 0 20px 6px rgba(255,213,74,.7);animation:cg-pulse .9s infinite alternate}
@@ .cg-ar{position:absolute;left:50%;top:-24px;margin-left:-8px;border:8px solid transparent;border-top:11px solid #ffd54a;border-bottom:0;opacity:0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
@@ .cg-seat.turn .cg-ar{opacity:1;animation:cg-bob .6s infinite alternate}
@@ .cg-nm{display:inline-block;margin-top:3px;max-width:112px;padding:2px 9px;border-radius:11px;background:rgba(0,0,0,.5);color:#fff;font:800 12px/1.3 var(--sans,system-ui);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:top}
@@ .cg-seat.turn .cg-nm{background:#ffd54a;color:#2a1e00}
@@ .cg-seat.me .cg-nm{background:rgba(255,255,255,.9);color:#143}
@@ .cg-seat.me.turn .cg-nm{background:#ffd54a;color:#2a1e00}
@@ .cg-sub{display:block;margin-top:2px;font:800 11px/1.2 var(--sans,system-ui);color:rgba(255,255,255,.92);text-shadow:0 1px 2px rgba(0,0,0,.7);min-height:13px}
@@ .cg-bd{position:absolute;left:50%;margin-left:14px;top:-8px;min-width:22px;height:22px;padding:0 5px;border-radius:11px;background:#ffd54a;color:#2a1e00;font:900 12px/22px var(--sans,system-ui);box-shadow:0 2px 5px rgba(0,0,0,.5);box-sizing:border-box}
@@ .cg-bd:empty{display:none}
@@ .cg-bub{position:absolute;left:50%;bottom:100%;transform:translate(-50%,6px) scale(.8);margin-bottom:4px;padding:4px 10px;border-radius:12px;background:#fff;color:#222;font:800 12px/1.25 var(--sans,system-ui);white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;box-shadow:0 3px 8px rgba(0,0,0,.4);z-index:8}
@@ .cg-bub.show{opacity:1;transform:translate(-50%,0) scale(1)}
@@ .cg-bub::after{content:'';position:absolute;left:50%;top:100%;margin-left:-5px;border:5px solid transparent;border-top-color:#fff}
@@ .cg-dots{position:absolute;left:50%;top:-20px;transform:translateX(-50%);display:none;gap:3px}
@@ .cg-seat.think .cg-dots{display:flex}
@@ .cg-seat.think .cg-ar{opacity:0}
@@ .cg-dots i{width:6px;height:6px;border-radius:50%;background:#fff;animation:cg-dot .8s infinite;box-shadow:0 1px 2px rgba(0,0,0,.5)}
@@ .cg-dots i:nth-child(2){animation-delay:.15s}
@@ .cg-dots i:nth-child(3){animation-delay:.3s}
@@ .cg-tm{position:absolute;left:50%;top:-6px;margin-left:-30px;width:60px;height:60px;pointer-events:none}
@@ .cg-tm circle{fill:none;stroke:#ff5b4b;stroke-width:3;stroke-dasharray:189;stroke-linecap:round;transform:rotate(-90deg);transform-origin:30px 30px}
@@ .cg-ui button{pointer-events:auto;cursor:pointer;font-family:var(--sans,system-ui);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@@ .cg-arrow{position:absolute;height:6px;margin-top:-3px;transform-origin:0 50%;background:repeating-linear-gradient(90deg,#ffd54a 0 10px,transparent 10px 18px);border-radius:3px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));animation:cg-arrow 1s both;z-index:4;pointer-events:none}
@@ .cg-btn{position:absolute;min-width:104px;height:48px;padding:0 20px;border-radius:24px;border:3px solid #fff;color:#fff;font:900 17px/1 var(--sans,system-ui);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 5px 12px rgba(0,0,0,.4);transform:translate(-50%,-50%);transition:filter .2s,opacity .2s,transform .12s;white-space:nowrap}
@@ .cg-btn:active:not(:disabled){transform:translate(-50%,-47%)}
@@ .cg-btn:disabled{filter:grayscale(.85) brightness(.7);opacity:.7;cursor:default}
@@ .cg-btn.go{background:linear-gradient(#45c463,#1f8a3a)}
@@ .cg-btn.no{background:linear-gradient(#ff5d4d,#cf2117)}
@@ .cg-btn.al{background:linear-gradient(#3d8cf0,#1659b5)}
@@ .cg-btn.gd{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
@@ .cg-btn.hot{animation:cg-throb .6s infinite alternate}
@@ .cg-btn.big{min-width:150px;height:56px;font-size:20px}
@@ .cg-ico{position:absolute;left:18px;top:18px;width:42px;height:42px;border-radius:14px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.32);color:#fff;display:grid;place-items:center;padding:0;z-index:6}
@@ .cg-tick{position:absolute;left:50%;transform:translateX(-50%);max-width:92%;padding:5px 14px;border-radius:14px;background:rgba(0,0,0,.42);font:800 13px/1.3 var(--sans,system-ui);text-align:center;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:5}
@@ .cg-tick.show{opacity:1}
@@ .cg-hint{position:absolute;left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:16px;background:rgba(255,213,74,.95);color:#2a1e00;font:900 15px/1.2 var(--sans,system-ui);box-shadow:0 4px 10px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s;white-space:nowrap;z-index:5}
@@ .cg-hint.show{opacity:1;animation:cg-throb2 .7s infinite alternate}
@@ .cg-log{position:absolute;left:18px;top:70px;width:176px;display:flex;flex-direction:column;gap:3px;pointer-events:none;z-index:2}
@@ .cg-log div{padding:3px 8px;border-radius:9px;background:rgba(0,0,0,.34);font:700 11px/1.3 var(--sans,system-ui);color:rgba(255,255,255,.92);animation:cg-in .25s}
@@ .cg-log div:nth-last-child(n+6){display:none}
@@ .cg-log div:nth-last-child(5){opacity:.45}
@@ .cg-log div:nth-last-child(4){opacity:.6}
@@ .cg-log div:nth-last-child(3){opacity:.75}
@@ .cg-wrap.port .cg-log{display:none}
@@ .cg-net{position:absolute;right:18px;top:18px;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;background:rgba(0,0,0,.4);font:800 11px var(--sans,system-ui);z-index:6}
@@ .cg-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
@@ .cg-net.bad i{background:#ff5b4b}
@@ .cg-lbl{position:absolute;transform:translate(-50%,-50%);padding:3px 10px;border-radius:11px;background:rgba(0,0,0,.45);font:800 12px/1.3 var(--sans,system-ui);pointer-events:none;white-space:nowrap;z-index:5}
@@ .cg-lbl.cg-rev{background:rgba(190,30,30,.85);color:#fff;letter-spacing:1px;animation:cg-throb2 .7s infinite alternate}
@@ .cg-claim{position:absolute;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:5;transition:opacity .2s}
@@ .cg-wrap.port .cg-claim b{font-size:28px}
@@ .cg-claim b{white-space:nowrap;display:block;font:900 38px/1 Georgia,'Times New Roman',serif;color:#ffe48a;text-shadow:0 3px 0 rgba(0,0,0,.4)}
@@ .cg-claim small{display:block;margin-top:2px;font:800 11px var(--sans,system-ui);letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 2px rgba(0,0,0,.6)}
@@ .cg-bar{position:absolute;transform:translate(-50%,-50%);width:220px;height:9px;border-radius:5px;background:rgba(0,0,0,.45);overflow:hidden;pointer-events:none;z-index:5;box-shadow:0 0 0 2px rgba(255,255,255,.25)}
@@ .cg-bar i{display:block;height:100%;width:100%;border-radius:5px;background:linear-gradient(90deg,#ff5b4b,#ffb84a)}
@@ .cg-rr{position:absolute;transform:translate(-50%,-50%);display:flex;gap:3px;z-index:6;pointer-events:auto}
@@ .cg-rr button{width:29px;height:36px;border-radius:7px;border:2px solid #fff;background:#fff;color:#17171c;font:800 15px Georgia,serif;cursor:pointer;padding:0;transition:transform .12s}
@@ .cg-rr button.on{background:#ffd54a;transform:translateY(-5px)}
@@ .cg-wrap.port .cg-rr button{width:23px;height:32px;font-size:13px}
@@ .cg-bn{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);padding:10px 28px;border-radius:20px;background:rgba(10,20,15,.82);border:3px solid #ffd54a;color:#ffd54a;font:900 34px/1.1 var(--sans,system-ui);letter-spacing:.5px;text-shadow:0 3px 0 rgba(0,0,0,.4);white-space:nowrap;pointer-events:none;animation:cg-banner 1.5s both;z-index:7}
@@ .cg-bn.red{border-color:#ff5b4b;color:#ff8070}
@@ .cg-bn.grn{border-color:#5be27a;color:#8dffa6}
@@ .cg-bn.blu{border-color:#6bb3ff;color:#a9d3ff}
@@ .cg-wrap.port .cg-bn{font-size:26px;padding:8px 20px}
@@ .cg-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(3,16,9,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;z-index:20;pointer-events:auto;touch-action:pan-y}
@@ .cg-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;align-items:flex-end;pointer-events:none}
@@ .cg-pane.clear>*{pointer-events:auto}
@@ .cg-box{width:100%;max-width:440px;margin:auto;background:linear-gradient(#26355a,#141c33);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 18px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:cg-box .35s cubic-bezier(.2,1.3,.4,1)}
@@ .cg-box.wide{max-width:600px}
@@ .cg-box h3{margin:2px 0 8px;font:900 24px var(--sans,system-ui);letter-spacing:.2px;color:#fff}
@@ .cg-box p{margin:6px 0;font:700 14px/1.4 var(--sans,system-ui);color:rgba(255,255,255,.88)}
@@ .cg-kick{font:900 11px var(--sans,system-ui)!important;letter-spacing:1.4px;text-transform:uppercase;color:#ffd54a!important;margin:0 0 2px!important}
@@ .cg-logo{font:900 44px/1 var(--sans,system-ui)!important;letter-spacing:-1px;color:#ffe48a!important;text-shadow:0 3px 0 #7a4a10,0 6px 12px rgba(0,0,0,.4);margin:2px 0 4px!important}
@@ .cg-wrap.port .cg-logo{font-size:34px!important}
@@ .cg-bigb{display:block;width:100%;min-height:50px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.1 var(--sans,system-ui);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px;cursor:pointer}
@@ .cg-bigb small{display:block;font:800 12px var(--sans,system-ui);opacity:.88;text-shadow:none;margin-top:2px}
@@ .cg-bigb.go{background:linear-gradient(#45c463,#1f8a3a)}
@@ .cg-bigb.al{background:linear-gradient(#3d8cf0,#1659b5)}
@@ .cg-bigb.no{background:linear-gradient(#ff5d4d,#cf2117)}
@@ .cg-bigb.gd{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
@@ .cg-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans,system-ui);margin:4px;cursor:pointer}
@@ .cg-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
@@ .cg-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
@@ .cg-opt>span{flex:0 0 38%;font:800 13px/1.2 var(--sans,system-ui);color:rgba(255,255,255,.88)}
@@ .cg-opt>span small{display:block;font:700 11px/1.25 var(--sans,system-ui);color:rgba(255,255,255,.55);margin-top:2px}
@@ .cg-seg{flex:1;display:flex;gap:5px;flex-wrap:wrap}
@@ .cg-seg button{flex:1;min-height:38px;min-width:38px;border-radius:11px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans,system-ui);padding:0 6px;cursor:pointer}
@@ .cg-seg button.on{background:#ffd54a;border-color:#fff;color:#1b1b1f}
@@ .cg-sec{margin:14px 0 2px!important;text-align:left;font:900 11px var(--sans,system-ui)!important;letter-spacing:1.3px;text-transform:uppercase;color:#ffd54a!important}
@@ .cg-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans,system-ui)}
@@ .cg-tbl td,.cg-tbl th{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right;color:#fff}
@@ .cg-tbl th{font:900 10px var(--sans,system-ui);letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.6)}
@@ .cg-tbl td:first-child,.cg-tbl th:first-child{text-align:left}
@@ .cg-tbl tr.win td{color:#ffd54a}
@@ .cg-tbl tr.me td{background:rgba(255,255,255,.07)}
@@ .cg-tbl i{display:inline-block;width:20px;height:20px;border-radius:50%;margin-right:7px;vertical-align:-5px;overflow:hidden;border:2px solid #fff;box-sizing:content-box}
@@ .cg-tbl i svg{display:block;width:100%;height:100%}
@@ .cg-rules{text-align:left}
@@ .cg-rules p{font:700 13px/1.45 var(--sans,system-ui)!important}
@@ .cg-rules b{color:#ffe48a}
@@ .cg-rules kbd{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:5px;padding:0 5px;font:800 11px var(--sans,system-ui)}
@@ .cg-big{font:900 54px/1 var(--sans,system-ui);color:#ffd54a;text-shadow:0 3px 0 rgba(0,0,0,.3)}
@@ .cg-mini{display:inline-block;vertical-align:middle;margin:0 1px;padding:1px 4px;border-radius:4px;background:#fff;color:#17171c;font:800 12px Georgia,serif}
@@ .cg-mini.r{color:#c8202f}
@keyframes cg-arrow{0%{clip-path:inset(0 100% 0 0);opacity:1}45%{clip-path:inset(0 0 0 0);opacity:1}85%{opacity:1}100%{clip-path:inset(0 0 0 0);opacity:0}}
@keyframes cg-pulse{from{box-shadow:0 0 0 3px rgba(255,213,74,.25),0 0 12px 3px rgba(255,213,74,.5)}to{box-shadow:0 0 0 4px rgba(255,213,74,.4),0 0 26px 9px rgba(255,213,74,.85)}}
@keyframes cg-bob{from{transform:translateY(0)}to{transform:translateY(5px)}}
@keyframes cg-dot{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-4px);opacity:1}}
@keyframes cg-throb2{from{transform:translateX(-50%) scale(1)}to{transform:translateX(-50%) scale(1.07)}}
@keyframes cg-throb{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.07)}}
@keyframes cg-in{from{opacity:0;transform:translateX(-8px)}}
@keyframes cg-box{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
@keyframes cg-banner{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}14%{transform:translate(-50%,-50%) scale(1.12);opacity:1}24%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{transform:translate(-50%,-62%) scale(1);opacity:0}}
`;
  const cssFor = (id, extra) => (BASECSS + (extra || '')).split('@@').join('.gm-' + id);

  function handPts(n, L, gapMax) {
    const h = L.hand, minGap = L.port ? 24 : 30, per = Math.floor(h.w / minGap) + 1;
    if (n <= per) return fanPts(n, h.x, h.y, h.w, { gap: gapMax || (L.port ? 42 : 58), curve: 6, rot: 7, rotW: 260 });
    return rowPts(n, h.x, h.y, h.w, gapMax || 58, minGap, 140 * h.s * .44, 3);
  }


  const THINK = { Easy: [900, 1700], Normal: [700, 1350], Hard: [560, 1100], Expert: [450, 900] };

  function boot(mod, root, api) {
    MUTE = () => api.muted;
    const R = Math.random;
    const opt = Object.assign({ n: mod.n0, diff: 'Normal', felt: 'green', back: 'blue', timer: 0, v: 1 }, api.load() || {});
    opt.rules = Object.assign({}, mod.rules0, opt.rules || {});
    if (!LEVELS.includes(opt.diff)) opt.diff = 'Normal';
    opt.n = clamp(+opt.n || mod.n0, mod.min, mod.max);
    const save = () => api.save(opt);

    root.insertAdjacentHTML('beforeend', DEFS);
    const wrap = mk('div', 'cg-wrap');
    wrap.dataset.felt = opt.felt; wrap.dataset.back = opt.back;
    const stage = mk('div', 'cg-stage', '<div class="cg-felt"></div><div class="cg-decor"></div><div class="cg-cards"></div><div class="cg-seats"></div><div class="cg-ui"></div><div class="cg-pane" hidden></div>');
    wrap.append(stage); root.append(wrap);
    const [feltEl, decor, cardsEl, seatsEl, uiEl, pane] = stage.children;

    const M = { mode: 'solo', role: 'local', n: 0, viewer: 0, human: [], bot: [], names: [], av: [], pids: [], eng: null, V: null, level: 'Normal', rules: {}, mem: [], tok: 0, hold: false, players: [], size: 0, bots: false, speed: 1, hooked: false, dl: 0, dlSeat: -1, waiting: false, tmo: 0 };
    const Q = [];
    let busy = false, W = 960, H = 600, port = false, L = {}, paneH = null, resultsOpen = false, ui = null, lastTurn = -2;
    const seats = [];

    const sleep = ms => new Promise(res => api.timeout(res, Math.max(0, ms * M.speed)));
    async function wait(ms) { await sleep(ms); while (api.paused || M.hold) await sleep(120 / M.speed); }
    function later(ms, fn) {
      api.timeout(() => { if (api.paused || M.hold) { later(150, fn); return; } fn(); }, Math.max(0, ms * M.speed));
    }
    const rel = p => ((p - M.viewer) % M.n + M.n) % M.n;

    const Z = {
      all: new Set(), byId: new Map(), zones: new Map(), lay: null,
      zone(name) { let z = this.zones.get(name); if (!z) { z = { name, list: [] }; this.zones.set(name, z); } return z; },
      list(name) { return this.zone(name).list; },
      make(id, at) {
        const s = new Spr(cardsEl);
        s.el._s = s;
        if (id >= 0) { s.face(id); this.byId.set(id, s); }
        this.all.add(s);
        s.to(Object.assign({ x: L.W / 2, y: L.H / 2, up: false, s: .5, r: 0, z: 1 }, at || {}), 0);
        return s;
      },
      put(name, s, idx) {
        if (s.zone) { const i = s.zone.list.indexOf(s); if (i >= 0) s.zone.list.splice(i, 1); }
        const z = this.zone(name);
        if (idx == null || idx < 0 || idx > z.list.length) z.list.push(s); else z.list.splice(idx, 0, s);
        s.zone = z;
        return s;
      },
      anon(name, last) {
        const l = this.zone(name).list;
        const c = []; for (let i = 0; i < l.length; i++) if (l[i].id < 0) c.push(i);
        if (!c.length) return null;
        const i = last ? c[c.length - 1] : c[Math.floor(R() * c.length)];
        return l[i];
      },
      reveal(s, id) {
        if (s.id >= 0 && s.id !== id && this.byId.get(s.id) === s) this.byId.delete(s.id);
        const o = this.byId.get(id);
        if (o && o !== s) { o.id = -1; o.f.innerHTML = ''; }
        s.face(id); this.byId.set(id, s);
        return s;
      },
      hide(s) {
        if (s.id >= 0 && this.byId.get(s.id) === s) this.byId.delete(s.id);
        s.id = -1; s.f.innerHTML = '';
        return s;
      },
      get(id, from, spawn) {
        let s = this.byId.get(id);
        if (s) return s;
        s = from && this.anon(from);
        if (s) return this.reveal(s, id);
        return this.make(id, spawn);
      },
      spawnAnon(spawn) { return this.make(-1, spawn); },
      relay(name, dur, stag) {
        const z = this.zone(name), pl = this.lay(name, z.list);
        z.list.forEach((s, i) => { const p = pl[i]; if (p) s.to(p, dur == null ? .35 : dur, (stag || 0) * i); });
      },
      all2(dur) { for (const z of this.zones.values()) this.relay(z.name, dur); },
      fit(name, ids, spawn, exact) {
        const z = this.zone(name), keep = [];
        for (const id of ids) {
          let s = this.byId.get(id);
          if (!s) { const a = this.anon(name); s = a ? this.reveal(a, id) : this.make(id, spawn); }
          if (s.zone !== z) this.put(name, s);
          keep.push(s);
        }
        const set = new Set(keep);
        for (const s of z.list.slice()) {
          if (set.has(s)) continue;
          if (s.id >= 0 || exact) { z.list.splice(z.list.indexOf(s), 1); s.zone = null; if (exact && s.id < 0) this.trash(s); }
        }
        z.list = keep.concat(z.list.filter(s => s.id < 0));
        z.list.forEach(s => { s.zone = z; });
      },
      count(name, n, spawn) {
        const z = this.zone(name);
        while (z.list.length > n) {
          let i = z.list.map((s, k) => s.id < 0 ? k : -1).filter(k => k >= 0).pop();
          if (i == null) i = z.list.length - 1;
          const s = z.list.splice(i, 1)[0]; s.zone = null; this.trash(s);
        }
        while (z.list.length < n) { const s = this.spawnAnon(spawn); this.put(name, s); }
      },
      trash(s) {
        if (s.id >= 0 && this.byId.get(s.id) === s) this.byId.delete(s.id);
        this.all.delete(s);
        s.el.style.transition = 'opacity .25s'; s.el.style.opacity = '0';
        setTimeout(() => s.kill(), 300);
      },
      sweep() {
        for (const s of Array.from(this.all)) if (!s.zone) { this.all.delete(s); if (s.id >= 0 && this.byId.get(s.id) === s) this.byId.delete(s.id); s.kill(); }
      },
      clear() {
        for (const s of this.all) s.kill();
        this.all.clear(); this.byId.clear(); this.zones.clear();
      }
    };

    function calcL() {
      const n = Math.max(2, M.n || 2);
      if (!port) L = { W, H, port, cx: 480, cy: 250, rx: 392, ry: 180, hand: { x: 500, y: 504, w: 600, s: .94 }, me: { x: 86, y: 528 }, btn: { x: 860, y: 520 }, btn2: { x: 860, y: 462 }, tickY: 14, hintY: 394, logX: 18 };
      else L = { W, H, port, cx: 190, cy: 262, rx: 142, ry: 186, hand: { x: 190, y: 590, w: 330, s: .78 }, me: { x: 46, y: 486 }, btn: { x: 296, y: 492 }, btn2: { x: 296, y: 436 }, tickY: 14, hintY: 442, logX: 18 };
      L.seat = [L.me];
      for (let r = 1; r < n; r++) {
        const a = Math.PI / 2 + TAU * r / n;
        L.seat[r] = { x: L.cx + L.rx * Math.cos(a), y: L.cy + L.ry * Math.sin(a) };
      }
    }
    function placeSeats() {
      seats.forEach(o => { const q = L.seat[rel(o.p)] || L.me; o.el.style.left = q.x + 'px'; o.el.style.top = q.y + 'px'; });
      placeUI();
    }
    const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };
    function placeUI() {
      at(tickEl, L.W / 2, L.hintY - 38);
      at(hintEl, L.W / 2, L.hintY);
    }

    function fit(force) {
      const p = (root.clientWidth || 800) < 640;
      if (force || p !== port) {
        port = p; W = p ? 380 : 960; H = p ? 680 : 600;
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        stage.style.width = W + 'px'; stage.style.height = H + 'px';
        wrap.classList.toggle('port', p);
        calcL();
        if (ui) { placeSeats(); if (M.V) ui.sync(M.V, true); ui.place && ui.place(); }
      }
      const k = (wrap.clientWidth || W) / W;
      stage.style.transform = `scale(${k})`;
    }

    const tickEl = mk('div', 'cg-tick');
    const hintEl = mk('div', 'cg-hint');
    const logEl = mk('div', 'cg-log');
    const menuB = mk('button', 'cg-ico', '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>');
    menuB.setAttribute('aria-label', 'Menu'); menuB.hidden = true;
    const netEl = mk('div', 'cg-net', '<i></i><span>Online</span>'); netEl.hidden = true;
    const resB = mk('button', 'cg-btn gd', 'Results'); resB.hidden = true;
    uiEl.append(tickEl, hintEl, logEl, menuB, netEl, resB);
    at(resB, 480, 300);

    function tick(text, ms) {
      tickEl.textContent = text; tickEl.classList.add('show');
      clearTimeout(tick.t); tick.t = setTimeout(() => tickEl.classList.remove('show'), ms || 2600);
    }
    function log(text) {
      const d = mk('div'); d.textContent = text; logEl.append(d);
      while (logEl.children.length > 8) logEl.firstChild.remove();
    }
    function hint(text) {
      if (text == null) { hintEl.classList.remove('show'); return; }
      hintEl.textContent = text; hintEl.classList.add('show');
    }
    function banner(text, cls, ms) {
      const b = mk('div', 'cg-bn' + (cls ? ' ' + cls : ''));
      b.textContent = text; uiEl.append(b);
      setTimeout(() => b.remove(), ms || 1600);
    }
    function btn(label, cls, fn) {
      const b = mk('button', 'cg-btn ' + (cls || ''), label);
      b.hidden = true;
      b.onclick = () => { if (!b.disabled) { snd('pick'); fn(); } };
      uiEl.append(b);
      return b;
    }

    function buildSeats() {
      seatsEl.textContent = ''; seats.length = 0;
      for (let p = 0; p < M.n; p++) {
        const el = mk('div', 'cg-seat' + (p === M.viewer ? ' me' : ''));
        el.innerHTML = '<div class="cg-av"></div><div class="cg-ring"></div><div class="cg-ar"></div><div class="cg-dots"><i></i><i></i><i></i></div><div class="cg-bd"></div><div class="cg-bub"></div><div class="cg-nm"></div><span class="cg-sub"></span>';
        seatsEl.append(el);
        const o = { p, el, av: el.children[0], bd: el.children[4], bub: el.children[5], nm: el.children[6], sub: el.children[7], mood: 'n', mt: 0, bt: 0 };
        o.av.innerHTML = avatar(M.av[p] || 0, 'n');
        o.nm.textContent = M.names[p] || '';
        seats.push(o);
      }
      placeSeats();
    }
    const seat = p => seats[p];
    const sh = {
      api, M, opt, Z, Q, root, wrap, stage, cardsEl, uiEl, decor, seats,
      get L() { return L; }, get port() { return port; },
      rel, wait, later, snd, tick, log, hint, banner, btn, at, R, mk, esc, avatar,
      name: p => M.names[p] || '',
      sub(p, t) { const o = seat(p); if (o) o.sub.textContent = t == null ? '' : t; },
      badge(p, t) { const o = seat(p); if (o) o.bd.textContent = t == null ? '' : t; },
      turn(p) { seats.forEach(o => o.el.classList.toggle('turn', o.p === p)); },
      think(p, on) { const o = seat(p); if (o) o.el.classList.toggle('think', !!on); },
      out(p, on) { const o = seat(p); if (o) o.el.classList.toggle('out', !!on); },
      mood(p, m, ms) {
        const o = seat(p); if (!o) return;
        o.av.innerHTML = avatar(M.av[p] || 0, m);
        clearTimeout(o.mt);
        if (m !== 'n' && ms !== 0) o.mt = setTimeout(() => { o.av.innerHTML = avatar(M.av[p] || 0, 'n'); }, ms || 1800);
      },
      say(p, text, ms) {
        const o = seat(p); if (!o) return;
        o.bub.textContent = text; o.bub.classList.add('show');
        clearTimeout(o.bt); o.bt = setTimeout(() => o.bub.classList.remove('show'), ms || 1800);
      },
      arrow(p, q, ms) {
        const a = sh.seatPos(p), b = sh.seatPos(q), d = Math.hypot(b.x - a.x, b.y - a.y);
        const el = mk('div', 'cg-arrow');
        el.style.cssText = `left:${a.x}px;top:${a.y}px;width:${d}px;transform:rotate(${Math.atan2(b.y - a.y, b.x - a.x)}rad)`;
        uiEl.append(el);
        setTimeout(() => el.remove(), ms || 1100);
      },
      act(a) { return act(a); },
      canAct() { return M.role !== 'guest' ? !!M.eng : !M.waiting; },
      seatPos: p => L.seat[rel(p)] || L.me,
      mine: () => M.viewer,
      results: () => showResultsAgain(),
      showPane, hidePane
    };

    function showPane(html, cls, h) {
      pane.className = 'cg-pane' + (cls ? ' ' + cls : '');
      pane.innerHTML = html; pane.hidden = false; paneH = h || null; pane.scrollTop = 0;
    }
    function hidePane() { pane.hidden = true; pane.innerHTML = ''; paneH = null; resultsOpen = false; }
    api.on(pane, 'click', e => {
      const sg = e.target.closest('.cg-seg button');
      if (sg) {
        const seg = sg.parentNode, def = SCHEMA[seg.dataset.k];
        if (def) {
          const v = def.vals[+sg.dataset.i][0];
          if (def.top) opt[def.k] = v; else opt.rules[def.k] = v;
          if (def.k === 'felt') wrap.dataset.felt = v;
          if (def.k === 'back') wrap.dataset.back = v;
          if (def.k === 'diff') M.level = v;
          save();
          Array.from(seg.children).forEach(c => c.classList.toggle('on', c === sg));
          snd('pick');
        }
        return;
      }
      const b = e.target.closest('[data-a]');
      if (b && paneH) { snd('pick'); paneH(b.dataset.a, b); }
    });

    const SCHEMA = {};
    const TOP = [
      { k: 'n', top: 1, label: 'Players', info: 'Including you', vals: Array.from({ length: mod.max - mod.min + 1 }, (_, i) => [mod.min + i, String(mod.min + i)]) },
      { k: 'diff', top: 1, label: 'Bot level', vals: LEVELS.map(l => [l, l]) }
    ];
    const TABLE = [
      { k: 'felt', top: 1, label: 'Table', vals: [['green', 'Green'], ['blue', 'Blue'], ['red', 'Red'], ['purple', 'Purple']] },
      { k: 'back', top: 1, label: 'Card back', vals: [['blue', 'Blue'], ['red', 'Red'], ['green', 'Green'], ['black', 'Black']] },
      { k: 'timer', top: 1, label: 'Online turn timer', info: 'Auto-plays when time runs out', vals: [[0, 'Off'], [20, '20s'], [40, '40s'], [60, '60s']] }
    ];
    [...TOP, ...mod.schema, ...TABLE].forEach(d => { SCHEMA[d.k] = d; });
    const optRow = d => {
      const cur = d.top ? opt[d.k] : opt.rules[d.k];
      return `<div class="cg-opt"><span>${d.label}${d.info ? `<small>${d.info}</small>` : ''}</span><div class="cg-seg" data-k="${d.k}">${d.vals.map(([v, t], i) => `<button data-i="${i}" class="${v === cur ? 'on' : ''}">${t}</button>`).join('')}</div></div>`;
    };

    function showTitle() {
      M.tok++; Q.length = 0; M.eng = null; M.V = null; M.mode = 'solo'; M.role = 'local'; M.n = 0; M.hold = false;
      resultsOpen = false; resB.hidden = true; menuB.hidden = true; netEl.hidden = true; hint(null); lastTurn = -2;
      seatsEl.textContent = ''; seats.length = 0; Z.clear(); logEl.textContent = '';
      uiEl.querySelectorAll('.cg-btn').forEach(b => { if (b !== resB) b.hidden = true; });
      ui.reset();
      const rules = mod.schema.map(optRow).join('');
      showPane(`<div class="cg-box wide"><p class="cg-kick">Card game</p><h3 class="cg-logo">${mod.title}</h3><p>${mod.tag}</p>` +
        `<button class="cg-bigb go" data-a="solo">Play vs bots<small>${mod.min}-${mod.max} players</small></button>` +
        `<button class="cg-bigb al" data-a="online">Play online<small>With friends, bots can fill empty seats</small></button>` +
        `<p class="cg-sec">Game</p>${TOP.map(optRow).join('')}<p class="cg-sec">Rules</p>${rules}<p class="cg-sec">Table</p>${TABLE.map(optRow).join('')}` +
        `<div class="cg-row"><button class="cg-sm" data-a="rules">How to play</button></div></div>`, '', a => {
        if (a === 'solo') newMatch(false);
        else if (a === 'online') startOnline();
        else if (a === 'rules') showRules(() => showTitle());
      });
    }
    function showRules(back) {
      showPane(`<div class="cg-box wide"><p class="cg-kick">${mod.title}</p><h3>How to play</h3><div class="cg-rules">${mod.help}</div><div class="cg-row"><button class="cg-bigb go" data-a="back" style="max-width:240px">Got it</button></div></div>`, '', () => back());
    }
    function ingameMenu() {
      if (!pane.hidden && !resultsOpen) return;
      const on = M.mode === 'online';
      if (!on) M.hold = true;
      const host = M.role !== 'guest';
      showPane(`<div class="cg-box"><p class="cg-kick">${mod.title}</p><h3>${on ? 'Menu' : 'Paused'}</h3>` +
        `<button class="cg-bigb go" data-a="resume">Resume</button><button class="cg-bigb al" data-a="rules">How to play</button>` +
        (!on ? '<button class="cg-bigb gd" data-a="new">New game</button>' : (host ? '<button class="cg-bigb gd" data-a="lobby">Back to lobby</button>' : '')) +
        `<button class="cg-bigb no" data-a="quit">${on ? 'Leave game' : 'Main menu'}</button></div>`, '', a => {
        if (a === 'resume') { M.hold = false; hidePane(); settle(); }
        else if (a === 'rules') showRules(() => { hidePane(); ingameMenu(); });
        else if (a === 'new') { M.hold = false; newMatch(false); }
        else if (a === 'lobby') { M.hold = false; startOnline(); }
        else if (a === 'quit') { M.hold = false; if (on) api.net.close(); showTitle(); }
      });
    }
    menuB.onclick = () => { snd('pick'); ingameMenu(); };

    function buildTable() {
      Z.clear(); Q.length = 0; logEl.textContent = '';
      calcL(); buildSeats(); ui.reset();
      menuB.hidden = false; resB.hidden = true; lastTurn = -2;
      for (let p = 0; p < M.n; p++) { sh.out(p, false); sh.sub(p, ''); sh.badge(p, ''); }
      netEl.hidden = M.mode !== 'online';
      wrap.dataset.felt = opt.felt; wrap.dataset.back = opt.back;
    }

    function newMatch(online) {
      M.shown = M.subm = null; M.tok++; busy = false; Q.length = 0; hidePane(); M.hold = false;
      const on = !!online || (M.mode === 'online' && M.role === 'host');
      let n, humans;
      if (on) {
        const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
        M.players = live;
        const k = Math.max(1, live.length);
        n = clamp(M.bots ? Math.max(k, M.size || k) : k, mod.min, mod.max);
        humans = live.map((x, i) => Math.round(i * n / Math.max(k, 1)));
        M.pids = Array(n).fill(null); humans.forEach((q, i) => { M.pids[q] = live[i].id; });
      } else { M.mode = 'solo'; M.role = 'local'; n = opt.n; humans = [0]; M.pids = []; }
      M.n = n; M.viewer = 0; M.level = opt.diff; M.rules = Object.assign({}, opt.rules);
      M.human = Array(n).fill(false); M.bot = Array(n).fill(false); M.names = []; M.av = [];
      const pool = shuf(BOT_NAMES.slice(), R), avs = shuf([...Array(8).keys()], R);
      for (let p = 0; p < n; p++) {
        M.human[p] = humans.includes(p); M.bot[p] = !M.human[p];
        const pl = on ? M.players[humans.indexOf(p)] : null;
        M.names[p] = M.human[p] ? (on ? (pl ? pl.name : 'Player') : 'You') : pool.pop();
        M.av[p] = avs[p % 8];
      }
      M.eng = mod.engine(n, M.rules, R, M.level, M.bot);
      M.mem = []; for (let p = 0; p < n; p++) if (M.bot[p]) M.mem[p] = mod.mem(n, p, null);
      M.V = null; M.over = false; M.waiting = false;
      buildTable();
      if (on) sendSetups();
      api.score(0);
      M.eng.deal(); flush();
    }
    function nextRound() {
      M.shown = null; hidePane(); resB.hidden = true;
      M.eng.deal(); flush();
    }

    function setupMsg(q) {
      return { t: 'setup', n: M.n, seat: q, names: M.names, av: M.av, human: M.human, bot: M.bot, rules: M.rules, level: M.level, timer: opt.timer };
    }
    function sendSetups() {
      M.pids.forEach((id, q) => { if (id && q !== M.viewer && M.human[q]) api.net.sendTo(id, setupMsg(q)); });
    }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !M.human[q]) return;
      api.net.sendTo(id, setupMsg(q));
      api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
    }
    function flush() {
      const es = M.eng.take();
      for (let q = 0; q < M.n; q++) {
        const f = es.map(e => mod.filter(e, q));
        if (M.bot[q] && M.mem[q]) f.forEach(e => mod.observe(M.mem[q], e, q));
        if (M.mode === 'online' && M.role === 'host' && M.human[q] && q !== M.viewer && M.pids[q]) api.net.sendTo(M.pids[q], { t: 'ev', es: f, v: M.eng.view(q) });
        if (q === M.viewer) Q.push(...f);
      }
      M.V = M.eng.view(M.viewer);
      pump();
    }

    async function pump() {
      if (busy) return;
      busy = true;
      const tok = M.tok;
      try {
        while (Q.length && tok === M.tok) {
          const e = Q.shift();
          if (e.k === 'deal' && resultsOpen) hidePane();
          try { await ui.event(e); } catch (x) { console.error(x); }
        }
      } finally { busy = false; }
      if (tok !== M.tok) { if (Q.length) pump(); return; }
      settle();
    }
    function settle() {
      if (!M.V || M.hold || !ui) return;
      ui.sync(M.V);
      ui.controls(M.V);
      const t = ui.turnOf(M.V);
      sh.turn(t);
      if (t !== lastTurn) {
        lastTurn = t;
        if (t === M.viewer && M.V.phase !== 'end' && M.V.phase !== 'done') snd('turn');
      }
      if (M.V.phase === 'end' || M.V.phase === 'done') { if (!resultsOpen && M.shown !== rkey()) showResults(); }
      else if (M.role !== 'guest' && M.eng) drive();
    }

    function drive() {
      if (!M.eng) return;
      const nd = M.eng.need();
      if (nd.k === 'end' || nd.k === 'done') return;
      if (mod.drive && mod.drive(sh, nd, botMove, doAct)) return;
      const p = nd.p;
      if (p < 0) return;
      if (M.bot[p]) botMove(p, 0);
      else if (M.mode === 'online' && opt.timer > 0) humanTimer(p);
    }
    function botMove(p, pre, fn) {
      const tid = M.eng.s.tid, tok = M.tok;
      sh.think(p, true);
      const [a, b] = THINK[M.level];
      later((pre || 0) + a + R() * (b - a), () => {
        sh.think(p, false);
        if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
        doAct(p, fn ? fn() : mod.bot(M.eng.view(p), p, M.level, M.mem[p], R));
      });
    }
    function humanTimer(p) {
      const tid = M.eng.s.tid, tok = M.tok, ms = opt.timer * 1000;
      if (M.dlSeat === p && M.dlTid === tid) return;
      M.dl = performance.now() + ms; M.dlSeat = p; M.dlTid = tid;
      api.net.send({ t: 'tm', ms, p });
      later(ms, () => {
        if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
        doAct(p, mod.auto(M.eng.view(p), p, R));
      });
    }
    function doAct(p, a) {
      if (!M.eng) return false;
      if (!a || !M.eng.act(p, a)) {
        const f = mod.auto(M.eng.view(p), p, R);
        if (!f || !M.eng.act(p, f)) { console.warn('[cards] stuck', mod.id, p, a); return false; }
      }
      flush();
      return true;
    }
    function act(a) {
      if (M.role === 'guest') {
        if (M.waiting) return false;
        M.waiting = true; api.net.send({ t: 'act', a }); ui.controls(M.V);
        return true;
      }
      if (!M.eng || M.hold || busy || Q.length) return false;
      if (!M.eng.act(M.viewer, a)) return false;
      flush();
      return true;
    }

    const rkey = () => M.V.phase + ':' + M.V.rid + ':' + M.V.tid;
    function showResults() {
      const r = ui.results(M.V);
      if (!r) return;
      resultsOpen = true; M.shown = rkey();
      const d = mk('div', '', r.html);
      if (M.role === 'guest') {
        d.querySelectorAll('[data-h]').forEach(x => x.remove());
        d.querySelector('.cg-box').insertAdjacentHTML('beforeend', '<p style="opacity:.8">Waiting for the host to continue&hellip;</p>');
      }
      if (M.mode === 'online' && M.role === 'host') {
        d.querySelectorAll('[data-a="again"]').forEach(x => { x.insertAdjacentHTML('afterend', '<button class="cg-bigb al" data-a="lobby">Back to lobby</button>'); });
      }
      if (M.mode === 'online') d.querySelectorAll('[data-a="menu"]').forEach(x => { x.textContent = 'Leave'; });
      showPane(d.innerHTML, r.cls || '', a => {
        if (a === 'next') nextRound();
        else if (a === 'again') newMatch(false);
        else if (a === 'lobby') startOnline();
        else if (a === 'menu') { if (M.mode === 'online') api.net.close(); showTitle(); }
        else if (a === 'view') { hidePane(); resB.hidden = false; }
        else if (a === 'rules') showRules(() => { hidePane(); showResults(); });
      });
      if (r.sound) snd(r.sound);
      if (r.score != null && M.subm !== rkey()) { M.subm = rkey(); api.submit(r.score); }
      if (M.mode === 'online' && M.role === 'host' && M.V.phase === 'end') {
        const tok = M.tok;
        later(10000, () => { if (tok === M.tok && resultsOpen && M.V.phase === 'end') nextRound(); });
      }
    }
    function showResultsAgain() { resB.hidden = true; resultsOpen = false; showResults(); }
    resB.onclick = () => { snd('pick'); showResultsAgain(); };

    function seatToBot(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const who = M.names[q];
      M.pids[q] = null; M.human[q] = false; M.bot[q] = true; M.names[q] = who + ' (Bot)';
      M.mem[q] = mod.mem(M.n, q, M.eng.view(q));
      api.net.send({ t: 'seats', human: M.human, bot: M.bot, names: M.names });
      const o = seat(q); if (o) o.nm.textContent = M.names[q];
      api.toast(who + ' left. A bot takes the seat.');
      M.dlSeat = -1;
      settle();
    }
    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || !M.role || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; Q.length = 0;
        snd('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        showPane(`<div class="cg-box"><p class="cg-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="cg-bigb go" data-a="room">Online lobby</button><button class="cg-bigb no" data-a="cpu">Play vs bots</button></div>`, '', a => {
          if (a === 'room') startOnline(); else { api.net.close(); showTitle(); }
        });
      });
      api.interval(() => {
        if (M.mode !== 'online' || !M.n) return;
        const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== M.viewer && M.human[q]).length;
        netEl.classList.toggle('bad', !on);
        netEl.lastChild.textContent = !on ? 'Reconnecting\u2026' : M.role === 'host' ? 'Online \u00b7 ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' \u00b7 ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    async function startOnline() {
      const tok = ++M.tok;
      hookNet();
      hidePane(); M.hold = false; Q.length = 0; busy = false;
      Z.clear(); seatsEl.textContent = ''; seats.length = 0; menuB.hidden = true; resB.hidden = true; hint(null); netEl.hidden = true;
      uiEl.querySelectorAll('.cg-btn').forEach(b => { if (b !== resB) b.hidden = true; });
      M.mode = 'online'; M.role = null; M.eng = null; M.V = null;
      const sizes = []; for (let i = mod.min; i <= mod.max; i++) sizes.push(i);
      const r = await api.net.room({ title: mod.title, sizes, defaultSize: clamp(opt.n, mod.min, mod.max), min: mod.min, max: mod.max, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { showTitle(); return; }
      M.role = r.role; M.players = r.players.slice(0, mod.max); M.bots = !!r.bots; M.size = +r.size || r.players.length;
      if (r.role === 'host') newMatch(true);
      else showPane('<div class="cg-box"><p class="cg-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal&hellip;</p><div class="cg-row"><button class="cg-sm" data-a="leave">Leave</button></div></div>', '', a => { if (a === 'leave') { api.net.close(); showTitle(); } });
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === M.viewer || !M.human[q]) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          if (M.eng.act(q, d.a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q) });
        }
        return;
      }
      if (d.t === 'setup') {
        M.shown = M.subm = null; M.tok++; busy = false; M.mode = 'online'; M.role = 'guest'; M.eng = null; M.V = null; M.waiting = false;
        M.n = d.n; M.viewer = d.seat; M.names = d.names; M.av = d.av; M.human = d.human; M.bot = d.bot; M.rules = d.rules; M.level = d.level;
        hidePane(); buildTable();
      } else if (M.role !== 'guest') return;
      else if (d.t === 'ev') {
        M.V = d.v; M.waiting = false;
        if (d.sync) { Q.length = 0; ui.reset(); ui.sync(M.V, true); settle(); }
        else { Q.push(...d.es); pump(); }
      } else if (d.t === 'seats') {
        M.human = d.human; M.bot = d.bot; M.names = d.names;
        seats.forEach(o => { o.nm.textContent = M.names[o.p] || ''; });
      } else if (d.t === 'tm') { M.dl = performance.now() + (+d.ms || 0); M.dlSeat = d.p; }
    }

    api.interval(() => {
      const o = seats[M.dlSeat];
      seats.forEach(s => { const r = s.el.querySelector('.cg-tm'); if (r && s !== o) r.remove(); });
      if (!o || M.dl <= performance.now() || M.mode !== 'online' || !opt.timer) return;
      let r = o.el.querySelector('.cg-tm');
      if (!r) { r = mk('div', 'cg-tm', '<svg viewBox="0 0 60 60" width="60" height="60"><circle cx="30" cy="30" r="27"/></svg>'); o.el.append(r); }
      const f = clamp((M.dl - performance.now()) / (opt.timer * 1000), 0, 1);
      r.firstChild.firstChild.style.strokeDashoffset = (170 * (1 - f)).toFixed(1);
    }, 250);

    api.on(window, 'keydown', e => {
      if (!pane.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (ui.key && ui.key(e)) e.preventDefault();
    });
    api.on(cardsEl, 'click', e => {
      const c = e.target.closest('.cg-c');
      if (c && c._s && ui.tap && pane.hidden) ui.tap(c._s, e);
    });
    api.on(root, 'pointerdown', () => actx());

    ui = mod.ui(sh);
    fit(true);
    if (window.ResizeObserver) new ResizeObserver(() => fit()).observe(root);
    api.on(window, 'resize', () => fit());
    api.interval(() => fit(), 500);
    root._cg = { M, sh, opt, ui, Q, Z, get busy() { return busy; }, set speed(v) { M.speed = v; }, flush, settle };
    calcL();
    if (api.net.invite) startOnline(); else showTitle();
  }

  const KIT = {
    spawn(sh, p, s) { const a = sh.seatPos(p); return { x: a.x, y: a.y - 10, s: s || .34, up: false, r: 0 }; },
    toward(sh, p, d) {
      const a = sh.seatPos(p), L = sh.L, dx = L.cx - a.x, dy = L.cy - a.y, m = Math.hypot(dx, dy) || 1;
      return { x: a.x + dx / m * d, y: a.y + dy / m * d, dx: dx / m, dy: dy / m };
    },
    mini(sh, p, list, o) {
      o = o || {};
      const a = sh.seatPos(p), sc = o.s || (sh.port ? .36 : .4), w = o.w || (sh.port ? 74 : 104);
      const pts = fanPts(list.length, a.x + (o.dx || 0), a.y - (o.dy == null ? 30 : o.dy), w, { gap: o.gap || 9, curve: 0, rot: 7, rotW: 90 });
      return list.map((s, i) => ({ x: pts[i].x, y: pts[i].y, s: sc, r: pts[i].r, up: false, z: 1 + i }));
    },
    async deal(sh, S, e, o) {
      const { Z } = sh, m = sh.mine(), n = e.n, cap = o.cap, sortFn = o.sort || KIT.byRank, mine = () => Z.list('hand:' + m);
      Z.clear(); S.reset(); S.counts = Array(n).fill(0); S.flip = false;
      Z.count('deck', 8, o.at()); Z.relay('deck', 0);
      const total = KIT.sum(e.counts), left = e.counts.slice(), mini = Array(n).fill(0), step = total > 70 ? 16 : 28;
      for (let p = 0; p < n; p++) sh.badge(p, '');
      await sh.wait(250);
      let j = 0, c = 0;
      while (c < total) {
        for (let p = 0; p < n; p++) {
          if (!left[p]) continue;
          left[p]--; c++; S.counts[p]++;
          if (p === m || mini[p] < cap) {
            const s = Z.make(p === m ? e.mine[j++] : -1, o.at());
            if (p !== m) mini[p]++;
            Z.put('hand:' + p, s); s.z = 40;
            Z.relay('hand:' + p, .25);
          }
          sh.badge(p, S.counts[p]);
          if (c % 2 === 0) snd('deal');
          await sh.wait(step);
        }
      }
      Z.count('deck', 0);
      S.flip = true;
      sortFn(mine());
      Z.relay('hand:' + m, .45, .02);
      snd('flip');
      await sh.wait(700);
    },
    hand(sh, list, sel, cur, up) {
      const L = sh.L, k = list.length, big = k > 22, sc = big ? L.hand.s * .78 : L.hand.s;
      const pts = big ? rowPts(k, L.hand.x, L.hand.y + 4, L.hand.w, 40, L.port ? 14 : 18, 140 * sc * .42, 4) : handPts(k, L, 54);
      return list.map((s, i) => ({ x: pts[i].x, y: pts[i].y - (sel.has(s.id) ? 26 : 0) - (i === cur ? 8 : 0), s: sc, r: pts[i].r || 0, up, z: 10 + i }));
    },
    byRank(list) { list.sort((a, b) => rk(a.id) - rk(b.id) || a.id - b.id); },
    sortIds(ids) { return ids.slice().sort((a, b) => rk(a) - rk(b) || a - b); },
    sum(a) { return a.reduce((x, y) => x + y, 0); },
    res(sh, o) {
      const rows = o.rows.map(r => `<tr class="${r.win ? 'win' : ''}${r.p === sh.mine() ? ' me' : ''}"><td><i>${avatar(sh.M.av[r.p] || 0, 'n')}</i>${esc(sh.name(r.p))}</td>${r.cols.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      return `<div class="cg-box wide"><p class="cg-kick">${esc(o.kick)}</p><h3>${esc(o.title)}</h3>${o.sub ? `<p>${o.sub}</p>` : ''}<table class="cg-tbl"><tr><th>${o.head0 || 'Player'}</th>${o.heads.map(h => `<th>${h}</th>`).join('')}</tr>${rows}</table>${o.extra || ''}` +
        (o.next ? `<button class="cg-bigb go" data-a="next" data-h>${o.next}</button>` : '<button class="cg-bigb go" data-a="again" data-h>Play again</button>') +
        '<button class="cg-bigb gd" data-a="view">View table</button><button class="cg-bigb no" data-a="menu">Main menu</button></div>';
    },
    lbl(sh, cls) { const d = mk('div', 'cg-lbl' + (cls ? ' ' + cls : '')); sh.uiEl.append(d); return d; },
    nm(sh, p) { return p === sh.mine() ? 'You' : sh.name(p); },
    vb(sh, p, a, b) { return p === sh.mine() ? a : b; }
  };

  const gfBook = r => [r - 2, 13 + r - 2, 26 + r - 2, 39 + r - 2];
  const gfVis = n => n <= 0 ? 0 : Math.min(8, 1 + Math.floor(n / 7));

  function gfEngine(n, rules, R) {
    const s = { n, hands: Array.from({ length: n }, () => []), stock: [], books: Array.from({ length: n }, () => []), turn: 0, tid: 0, phase: 'play', ev: [], hs: 5, rid: 1 };
    const emit = e => { s.ev.push(e); };
    const next = p => (p + 1) % n;
    const total = () => s.books.reduce((a, b) => a + b.length, 0);
    const targets = p => { const t = []; for (let q = 0; q < n; q++) if (q !== p && s.hands[q].length) t.push(q); return t; };
    function books(p) {
      const by = {};
      s.hands[p].forEach(id => { (by[rk(id)] = by[rk(id)] || []).push(id); });
      for (const k of Object.keys(by)) if (by[k].length === 4) {
        const r = +k;
        s.hands[p] = s.hands[p].filter(id => rk(id) !== r);
        s.books[p].push(r);
        emit({ k: 'book', p, r });
      }
    }
    function refill(p) {
      const k = Math.min(rules.refill === 'one' ? 1 : s.hs, s.stock.length);
      const ids = s.stock.splice(s.stock.length - k, k);
      s.hands[p].push(...ids);
      emit({ k: 'refill', p, ids });
      books(p);
    }
    function finish() {
      s.phase = 'done'; s.tid++;
      emit({ k: 'end', books: s.books.map(b => b.length) });
    }
    function begin(p) {
      for (let g = 0; g < 300; g++) {
        if (total() >= 13) return finish();
        s.turn = p;
        if (!s.hands[p].length && s.stock.length) refill(p);
        if (total() >= 13) return finish();
        if (!s.hands[p].length) { emit({ k: 'skip', p }); p = next(p); continue; }
        if (!targets(p).length) {
          if (!s.stock.length) { p = next(p); continue; }
          const id = s.stock.pop();
          s.hands[p].push(id);
          emit({ k: 'draw', p, id, lucky: false, solo: 1 });
          books(p);
          p = next(p);
          continue;
        }
        s.turn = p; s.tid++;
        emit({ k: 'turn', p });
        return;
      }
      finish();
    }
    return {
      s,
      take() { const e = s.ev; s.ev = []; return e; },
      need() { return s.phase === 'done' ? { k: 'done' } : { k: 'turn', p: s.turn }; },
      deal() {
        s.phase = 'play'; s.rid++;
        s.books = Array.from({ length: n }, () => []);
        s.hs = rules.hand || (n === 2 ? 7 : 5);
        const d = shuf(deck(1), R);
        s.hands = Array.from({ length: n }, () => []);
        for (let i = 0; i < s.hs; i++) for (let p = 0; p < n; p++) s.hands[p].push(d.pop());
        s.stock = d;
        const first = Math.floor(R() * n);
        emit({ k: 'deal', hands: s.hands.map(h => h.slice()), stock: s.stock.length, first, hs: s.hs });
        for (let p = 0; p < n; p++) books(p);
        begin(first);
      },
      act(p, a) {
        if (s.phase !== 'play' || p !== s.turn || !a || a.t !== 'ask') return false;
        const q = a.q, r = a.r;
        if (!Number.isInteger(q) || !Number.isInteger(r) || q < 0 || q >= n || q === p || !s.hands[q].length) return false;
        if (!s.hands[p].some(id => rk(id) === r)) return false;
        emit({ k: 'ask', p, q, r });
        const got = s.hands[q].filter(id => rk(id) === r);
        if (got.length) {
          s.hands[q] = s.hands[q].filter(id => rk(id) !== r);
          s.hands[p].push(...got);
          emit({ k: 'give', p, q, r, ids: got });
          books(p);
          begin(p);
        } else {
          emit({ k: 'fish', p, q, r });
          if (s.stock.length) {
            const id = s.stock.pop(), lucky = rk(id) === r && !!rules.lucky;
            s.hands[p].push(id);
            emit({ k: 'draw', p, id, lucky });
            books(p);
            if (lucky) { emit({ k: 'lucky', p }); begin(p); } else begin(next(p));
          } else { emit({ k: 'nofish', p }); begin(next(p)); }
        }
        return true;
      },
      view(p) {
        return { n, me: p, phase: s.phase, turn: s.phase === 'play' ? s.turn : -1, tid: s.tid, rid: s.rid, hand: KIT.sortIds(s.hands[p]), counts: s.hands.map(h => h.length), books: s.books.map(b => b.slice()), stock: s.stock.length, hs: s.hs };
      }
    };
  }

  function gfFilter(e, q) {
    if (e.k === 'deal') return { k: 'deal', n: e.hands.length, first: e.first, hs: e.hs, stock: e.stock, mine: KIT.sortIds(e.hands[q]), counts: e.hands.map(h => h.length) };
    if (e.k === 'draw' && e.p !== q && !e.lucky) return { k: 'draw', p: e.p, id: -1, lucky: false, solo: e.solo };
    if (e.k === 'refill' && e.p !== q) return { k: 'refill', p: e.p, ids: e.ids.map(() => -1) };
    return e;
  }

  function gfMem(n, p, V) {
    const m = { n, p, t: 0, has: Array.from({ length: n }, () => ({})), none: Array.from({ length: n }, () => ({})), booked: new Set() };
    if (V) V.books.forEach(b => b.forEach(r => m.booked.add(r)));
    return m;
  }
  function gfObserve(m, e) {
    if (e.k === 'deal') { m.t = 0; m.booked.clear(); m.has.forEach(o => { for (const k in o) delete o[k]; }); m.none.forEach(o => { for (const k in o) delete o[k]; }); }
    else if (e.k === 'ask') {
      m.t++;
      const o = m.has[e.p][e.r];
      m.has[e.p][e.r] = { c: Math.max(1, o ? o.c : 1), t: m.t };
      delete m.none[e.p][e.r];
    } else if (e.k === 'give') {
      const o = m.has[e.p][e.r];
      m.has[e.p][e.r] = { c: (o ? o.c : 1) + e.ids.length, t: m.t };
      delete m.has[e.q][e.r];
      m.none[e.q][e.r] = { t: m.t };
    } else if (e.k === 'fish') {
      delete m.has[e.q][e.r];
      m.none[e.q][e.r] = { t: m.t };
    } else if (e.k === 'draw' && e.lucky) {
      const r = rk(e.id), o = m.has[e.p][r];
      m.has[e.p][r] = { c: (o ? o.c : 0) + 1, t: m.t };
    } else if (e.k === 'book') {
      m.booked.add(e.r);
      for (let q = 0; q < m.n; q++) { delete m.has[q][e.r]; delete m.none[q][e.r]; }
    }
  }

  function gfBot(V, p, level, m, R) {
    const n = V.n, mine = {};
    V.hand.forEach(id => { mine[rk(id)] = (mine[rk(id)] || 0) + 1; });
    const ranks = Object.keys(mine).map(Number);
    const tg = []; for (let q = 0; q < n; q++) if (q !== p && V.counts[q]) tg.push(q);
    const win = { Easy: n, Normal: 3 * n, Hard: 9 * n, Expert: 1e9 }[level] || 3 * n;
    const noise = { Easy: 1.2, Normal: .35, Hard: .1, Expert: 0 }[level] || .3;
    const kn = (q, r) => { const o = m && m.has[q][r]; return o && m.t - o.t <= win ? o.c : 0; };
    const knTot = q => { let t = 0; if (m) for (const r in m.has[q]) t += kn(q, +r); return t; };
    let pool = V.stock;
    for (const q of tg) pool += Math.max(0, V.counts[q] - knTot(q));
    const opts = [];
    for (const r of ranks) {
      let K = 0; for (const q of tg) K += kn(q, r);
      const cu = Math.max(0, 4 - mine[r] - K);
      for (const q of tg) {
        const k = kn(q, r);
        let pr;
        if (k > 0) pr = 1;
        else {
          const hq = Math.max(0, V.counts[q] - knTot(q));
          pr = pool > 0 && cu > 0 ? 1 - Math.pow(1 - Math.min(1, hq / pool), cu) : 0;
          const z = m && m.none[q][r];
          if (z && m.t - z.t <= win) pr *= m.t - z.t <= n ? .08 : .45;
        }
        const val = pr * (1 + mine[r] * .85 + k * .5);
        opts.push({ q, r, v: val * (1 + (R() * 2 - 1) * noise) });
      }
    }
    if (!opts.length) return null;
    if (level === 'Easy' && R() < .45) { const o = opts[Math.floor(R() * opts.length)]; return { t: 'ask', q: o.q, r: o.r }; }
    opts.sort((a, b) => b.v - a.v);
    return { t: 'ask', q: opts[0].q, r: opts[0].r };
  }

  function gfAuto(V, p, R) {
    const mine = {};
    V.hand.forEach(id => { mine[rk(id)] = (mine[rk(id)] || 0) + 1; });
    const ranks = Object.keys(mine).map(Number).sort((a, b) => mine[b] - mine[a]);
    const tg = []; for (let q = 0; q < V.n; q++) if (q !== p && V.counts[q]) tg.push(q);
    if (!ranks.length || !tg.length) return null;
    return { t: 'ask', q: tg[Math.floor(R() * tg.length)], r: ranks[0] };
  }

  function gfUI(sh) {
    const { Z, M } = sh;
    const S = { counts: [], nb: [], stock: 0, selR: 0, selQ: -1, tid: -2, flip: true };
    const askB = sh.btn('Ask', 'go', () => ask());
    const stkL = KIT.lbl(sh);
    stkL.hidden = true;
    const me = () => sh.mine();
    const mine = () => Z.list('hand:' + me());
    const stockAt = () => ({ x: sh.L.cx, y: sh.L.cy + 10, s: .52, up: false, r: 0 });
    const bookBase = p => {
      const L = sh.L;
      if (p === me()) return L.port ? { x: 168, y: 486 } : { x: 120, y: 392 };
      const t = KIT.toward(sh, p, L.port ? 66 : 88);
      return { x: t.x, y: t.y };
    };

    Z.lay = (name, list) => {
      const L = sh.L, [kind, ps] = name.split(':'), p = +ps, k = list.length;
      if (kind === 'stock') return list.map((s, i) => ({ x: L.cx - i * .5, y: L.cy + 10 - i * .8, s: .52, r: 0, up: false, z: 2 + i }));
      if (kind === 'fly') return list.map((s, i) => ({ x: L.cx + (i - (k - 1) / 2) * (L.port ? 46 : 64), y: L.cy - 4, s: L.port ? .72 : .86, r: 0, up: true, z: 70 + i }));
      if (kind === 'hand' && p === me()) {
        const pts = handPts(k, L);
        return list.map((s, i) => ({ x: pts[i].x, y: pts[i].y - (S.selR && s.id >= 0 && rk(s.id) === S.selR ? 22 : 0), s: L.hand.s, r: pts[i].r, up: S.flip, z: 10 + i }));
      }
      if (kind === 'hand') return KIT.mini(sh, p, list);
      if (kind === 'book') {
        const b = bookBase(p), nb = Math.ceil(k / 4), gap = Math.min(L.port ? 15 : 18, 150 / Math.max(1, nb));
        return list.map((s, i) => { const bi = Math.floor(i / 4), j = i % 4; return { x: b.x + (bi - (nb - 1) / 2) * gap + j * 1.5, y: b.y - j * 1.5, s: L.port ? .36 : .42, r: 0, up: true, z: 3 + i }; });
      }
      return [];
    };

    function refreshSeat(p) {
      sh.badge(p, S.counts[p] ? S.counts[p] : '');
      sh.sub(p, S.nb[p] ? S.nb[p] + (S.nb[p] === 1 ? ' book' : ' books') : '');
    }
    function refreshAll() { for (let p = 0; p < S.counts.length; p++) refreshSeat(p); stkL.hidden = false; stkL.textContent = 'Stock ' + S.stock; const L = sh.L; sh.at(stkL, L.cx, L.cy + (L.port ? 62 : 70)); }
    function sortMine() { KIT.byRank(mine()); }

    function reset() {
      S.counts = []; S.nb = []; S.stock = 0; S.selR = 0; S.selQ = -1; S.tid = -2; S.flip = true;
      askB.hidden = true; stkL.hidden = true;
      sh.seats.forEach(o => o.el.classList.remove('pick', 'tgt'));
    }
    function place() { const L = sh.L; sh.at(askB, L.btn.x, L.btn.y); refreshAll(); }

    function sync(V, hard) {
      const m = me(), L = sh.L;
      S.counts = V.counts.slice(); S.nb = V.books.map(b => b.length); S.stock = V.stock;
      Z.fit('hand:' + m, V.hand, stockAt(), true);
      sortMine();
      for (let q = 0; q < V.n; q++) {
        if (q !== m) Z.count('hand:' + q, V.counts[q], KIT.spawn(sh, q));
        const ids = []; V.books[q].forEach(r => ids.push(...gfBook(r)));
        Z.fit('book:' + q, ids, KIT.spawn(sh, q), true);
      }
      Z.count('stock', gfVis(V.stock), stockAt());
      mine().forEach(s => s.cls('hot', V.phase === 'play' && V.turn === m));
      Z.all2(hard ? 0 : .25);
      Z.sweep();
      refreshAll();
      place();
    }

    async function fly(sprs, to, hideAfter, hold, from) {
      sprs.forEach(s => Z.put('fly', s));
      if (from) Z.relay(from, .3);
      Z.relay('fly', .4, .04);
      await sh.wait(hold || 800);
      sprs.forEach(s => Z.put(to, s));
      if (to === 'hand:' + me()) sortMine();
      Z.relay(to, .35);
      if (hideAfter) setTimeout(() => sprs.forEach(s => { if (s.zone && s.zone.name === to) Z.hide(s); }), 260);
      await sh.wait(380);
    }

    async function onDeal(e) {
      const m = me(), n = e.n;
      Z.clear(); reset();
      S.counts = Array(n).fill(0); S.nb = Array(n).fill(0); S.stock = e.stock + e.hs * n; S.flip = false;
      Z.count('stock', 8, stockAt()); Z.relay('stock', 0);
      refreshAll(); place();
      await sh.wait(250);
      let j = 0;
      for (let i = 0; i < e.hs; i++) for (let k = 0; k < n; k++) {
        const p = (e.first + k) % n;
        const id = p === m ? e.mine[j++] : -1;
        const s = Z.make(id, stockAt());
        Z.put('hand:' + p, s);
        s.z = 40;
        Z.relay('hand:' + p, .3);
        S.counts[p]++; S.stock--; refreshSeat(p); stkL.textContent = 'Stock ' + S.stock;
        snd('deal');
        await sh.wait(60);
      }
      await sh.wait(250);
      S.flip = true; S.stock = e.stock;
      Z.count('stock', gfVis(e.stock), stockAt());
      Z.relay('stock', .3);
      Z.relay('hand:' + m, .4, .05);
      snd('flip');
      refreshAll();
      sh.turn(e.first);
      sh.tick(KIT.nm(sh, e.first) + (e.first === m ? ' go first' : ' goes first'), 2200);
      await sh.wait(650);
    }

    async function event(e) {
      const m = me();
      if (e.k === 'deal') return onDeal(e);
      if (e.k === 'turn') { sh.turn(e.p); await sh.wait(140); return; }
      if (e.k === 'ask') {
        sh.turn(e.p);
        sh.say(e.p, 'Got any ' + RNP[e.r] + '?', 1800);
        sh.arrow(e.p, e.q, 1300);
        sh.log(KIT.nm(sh, e.p) + ' ask' + KIT.vb(sh, e.p, '', 's') + ' ' + KIT.nm(sh, e.q) + ' for ' + RNP[e.r]);
        snd('ping');
        if (e.q === m && e.p !== m) sh.tick(sh.name(e.p) + ' asks you for ' + RNP[e.r], 2000);
        await sh.wait(1000);
        return;
      }
      if (e.k === 'give') {
        const from = 'hand:' + e.q, to = 'hand:' + e.p;
        const sprs = e.ids.map(id => Z.get(id, from, KIT.spawn(sh, e.q)));
        S.counts[e.q] -= e.ids.length; S.counts[e.p] += e.ids.length;
        snd('take');
        sh.mood(e.q, 's'); sh.mood(e.p, 'h');
        sh.log(KIT.nm(sh, e.q) + ' hand' + KIT.vb(sh, e.q, '', 's') + ' over ' + e.ids.length + (e.ids.length > 1 ? ' cards' : ' card'));
        await fly(sprs, to, e.p !== m, 850, from);
        refreshSeat(e.p); refreshSeat(e.q);
        return;
      }
      if (e.k === 'fish') {
        sh.say(e.q, 'Go fish!', 1600);
        sh.mood(e.q, 'h'); sh.mood(e.p, 's');
        sh.log(KIT.nm(sh, e.q) + (e.q === m ? ' say' : ' says') + ' go fish');
        snd('fish');
        await sh.wait(850);
        return;
      }
      if (e.k === 'draw') {
        const stk = Z.list('stock');
        const s = stk.length ? stk[stk.length - 1] : Z.make(-1, stockAt());
        if (e.id >= 0) Z.reveal(s, e.id);
        S.counts[e.p]++; S.stock--;
        snd('deal');
        if (e.id >= 0 && e.p !== m) await fly([s], 'hand:' + e.p, true, 800);
        else {
          Z.put('hand:' + e.p, s);
          if (e.p === m) sortMine();
          s.z = 60;
          Z.relay('hand:' + e.p, .4);
          await sh.wait(520);
        }
        Z.count('stock', gfVis(S.stock), stockAt());
        Z.relay('stock', .25);
        refreshSeat(e.p); stkL.textContent = 'Stock ' + S.stock;
        if (e.solo) sh.log(KIT.nm(sh, e.p) + ' draw' + KIT.vb(sh, e.p, '', 's') + ' a card');
        return;
      }
      if (e.k === 'lucky') {
        sh.banner('Lucky catch!', 'grn', 1500);
        sh.say(e.p, 'Lucky! Again!', 1500);
        sh.mood(e.p, 'h');
        sh.log(KIT.nm(sh, e.p) + ' fished the card and go' + KIT.vb(sh, e.p, '', 'es') + ' again');
        snd('ping');
        await sh.wait(900);
        return;
      }
      if (e.k === 'refill') {
        const to = 'hand:' + e.p;
        for (const id of e.ids) {
          const stk = Z.list('stock');
          const s = stk.length ? stk[stk.length - 1] : Z.make(-1, stockAt());
          if (id >= 0) Z.reveal(s, id);
          Z.put(to, s); s.z = 60;
          S.counts[e.p]++; S.stock--;
          if (e.p === m) sortMine();
          Z.relay(to, .35);
          snd('deal');
          await sh.wait(110);
        }
        Z.count('stock', gfVis(S.stock), stockAt());
        Z.relay('stock', .25);
        refreshSeat(e.p); stkL.textContent = 'Stock ' + S.stock;
        sh.log(KIT.nm(sh, e.p) + ' draw' + KIT.vb(sh, e.p, '', 's') + ' a new hand');
        await sh.wait(300);
        return;
      }
      if (e.k === 'book') {
        const from = 'hand:' + e.p;
        const sprs = gfBook(e.r).map(id => Z.get(id, from, KIT.spawn(sh, e.p)));
        S.counts[e.p] -= 4; S.nb[e.p]++;
        snd('book');
        sh.mood(e.p, 'h', 2200);
        if (e.p === m) sh.banner('Book of ' + RNP[e.r] + '!', 'grn', 1700);
        else sh.tick(sh.name(e.p) + ' completes a book of ' + RNP[e.r], 2400);
        sh.log(KIT.nm(sh, e.p) + ' book' + KIT.vb(sh, e.p, '', 's') + ' ' + RNP[e.r]);
        await fly(sprs, 'book:' + e.p, false, 1000, from);
        refreshSeat(e.p);
        return;
      }
      if (e.k === 'skip') { sh.tick(sh.name(e.p) + ' has no cards and passes', 1800); await sh.wait(600); return; }
      if (e.k === 'nofish') { sh.tick('The stock is empty', 1800); sh.log('The stock is empty'); await sh.wait(650); return; }
      if (e.k === 'end') { sh.turn(-1); await sh.wait(500); }
    }

    function canPlay() { const V = M.V; return !!V && V.phase === 'play' && V.turn === me() && sh.canAct() && !M.hold; }
    function validTargets() { const V = M.V; return V ? V.counts.map((c, q) => q !== me() && c > 0 ? q : -1).filter(q => q >= 0) : []; }
    function ranksHeld() { const V = M.V, r = []; if (V) V.hand.forEach(id => { if (!r.includes(rk(id))) r.push(rk(id)); }); return r; }

    function controls(V) {
      const ok = canPlay(), m = me();
      if (V.tid !== S.tid) { S.tid = V.tid; S.selQ = -1; S.selR = 0; }
      if (ok) {
        const rs = ranksHeld(), ts = validTargets();
        if (!rs.includes(S.selR)) S.selR = rs.length === 1 ? rs[0] : 0;
        if (!ts.includes(S.selQ)) S.selQ = ts.length === 1 ? ts[0] : -1;
      } else { S.selR = 0; S.selQ = -1; }
      sh.seats.forEach(o => { const t = ok && o.p !== m && V.counts[o.p] > 0; o.el.classList.toggle('pick', t); o.el.classList.toggle('tgt', t && S.selQ === o.p); });
      askB.hidden = !ok;
      askB.disabled = !(S.selR && S.selQ >= 0);
      askB.classList.toggle('hot', !askB.disabled);
      sh.at(askB, sh.L.btn.x, sh.L.btn.y);
      if (!ok) sh.hint(null);
      else if (!S.selR) sh.hint('Pick a card to ask for');
      else if (S.selQ < 0) sh.hint('Who has ' + RNP[S.selR] + '?');
      else sh.hint('Ask ' + sh.name(S.selQ) + ' for ' + RNP[S.selR]);
      mine().forEach(s => { s.cls('hot', ok); s.cls('sel', !!S.selR && rk(s.id) === S.selR); });
      Z.relay('hand:' + m, .18);
    }
    function ask() {
      if (!canPlay() || !S.selR || S.selQ < 0) return;
      const a = { t: 'ask', q: S.selQ, r: S.selR };
      if (sh.act(a)) { askB.hidden = true; sh.hint(null); sh.seats.forEach(o => o.el.classList.remove('pick', 'tgt')); }
    }
    function setR(r) { S.selR = S.selR === r ? 0 : r; controls(M.V); }
    function setQ(q) { S.selQ = q; controls(M.V); snd('pick'); }

    sh.api.on(sh.root, 'click', e => {
      const el = e.target.closest && e.target.closest('.cg-seat');
      if (!el || !el.classList.contains('pick') || !canPlay()) return;
      const o = sh.seats.find(x => x.el === el);
      if (o) setQ(o.p);
    });

    return {
      reset, sync, event, controls, place,
      turnOf: V => V.turn,
      tap(spr) {
        if (!canPlay() || !spr.zone || spr.zone.name !== 'hand:' + me() || spr.id < 0) return;
        snd('pick'); setR(rk(spr.id));
      },
      key(e) {
        if (!canPlay()) return false;
        const k = e.key, rs = ranksHeld().sort((a, b) => a - b), ts = validTargets();
        if (k === 'ArrowLeft' || k === 'ArrowRight') {
          const i = rs.indexOf(S.selR), d = k === 'ArrowRight' ? 1 : -1;
          setR(rs[i < 0 ? (d > 0 ? 0 : rs.length - 1) : (i + d + rs.length) % rs.length]); snd('pick');
          return true;
        }
        if (k === 'ArrowUp' || k === 'ArrowDown') {
          const i = ts.indexOf(S.selQ), d = k === 'ArrowDown' ? 1 : -1;
          if (ts.length) setQ(ts[i < 0 ? 0 : (i + d + ts.length) % ts.length]);
          return true;
        }
        if (/^[1-9]$/.test(k) && ts[+k - 1] != null) { setQ(ts[+k - 1]); return true; }
        if (k === 'Enter' || k === ' ') { ask(); return true; }
        return false;
      },
      results(V) {
        const m = me(), cnt = V.books.map(b => b.length), best = Math.max(...cnt);
        const rows = cnt.map((c, p) => ({ p, cols: [c], win: c === best })).sort((a, b) => b.cols[0] - a.cols[0]);
        const win = rows.filter(r => r.win).map(r => r.p), mw = win.includes(m);
        const title = win.length > 1 ? (mw ? 'Tie for the win!' : 'It is a tie') : mw ? 'You win!' : sh.name(win[0]) + ' wins';
        return { html: KIT.res(sh, { kick: 'Go Fish', title, sub: 'You made ' + cnt[m] + (cnt[m] === 1 ? ' book.' : ' books.'), heads: ['Books'], rows }), sound: mw ? 'win' : 'lose', score: cnt[m] };
      }
    };
  }

  const GF = {
    id: 'go-fish', title: 'Go Fish', tag: 'Ask for a rank. Collect books of four.', min: 2, max: 6, n0: 4,
    rules0: { hand: 0, lucky: true, refill: 'full' },
    schema: [
      { k: 'hand', label: 'Starting hand', info: 'Standard is 7 for two players, else 5', vals: [[0, 'Standard'], [5, '5'], [7, '7']] },
      { k: 'lucky', label: 'Lucky fish', info: 'Draw the rank you asked for and go again', vals: [[true, 'On'], [false, 'Off']] },
      { k: 'refill', label: 'Empty hand', info: 'What you draw when you run out of cards', vals: [['full', 'New hand'], ['one', 'One card']] }
    ],
    help: '<p>Collect <b>books</b>: four cards of the same rank. Whoever makes the most books wins.</p><p><b>On your turn</b> pick a card from your hand (you must hold the rank you ask for), then pick the player you want to ask. If they hold any cards of that rank they must hand them <b>all</b> over, and you ask again.</p><p>If they have none they say <b>Go fish!</b> and you draw the top card of the stock. If it is the rank you asked for, show it and go again (Lucky fish). Otherwise your turn ends.</p><p>Four of a kind are laid down at once as a book. If your hand runs out you draw a fresh hand from the stock. The game ends when all 13 books are made.</p><p><kbd>Left</kbd>/<kbd>Right</kbd> choose a rank, <kbd>Up</kbd>/<kbd>Down</kbd> or <kbd>1</kbd>-<kbd>5</kbd> choose a player, <kbd>Enter</kbd> asks.</p>',
    engine: gfEngine, filter: gfFilter, mem: gfMem, observe: gfObserve, bot: gfBot, auto: gfAuto, ui: gfUI
  };

  function omEngine(n, rules, R, level, bots) {
    const s = { n, hands: Array.from({ length: n }, () => []), pairs: Array.from({ length: n }, () => []), out: [], turn: 0, target: 0, tid: 0, phase: 'play', ev: [], rid: 1, loser: -1 };
    const emit = e => { s.ev.push(e); };
    const dir = rules.dir === 'right' ? -1 : 1;
    const leak = { Easy: .55, Normal: .3, Hard: .12, Expert: .03 }[level] || .3;
    const alive = p => s.hands[p].length > 0;
    const step = (p, d) => { for (let k = 1; k < n; k++) { const q = ((p + d * k) % n + n) % n; if (alive(q)) return q; } return -1; };
    const same = (a, b) => a !== OM && b !== OM && rk(a) === rk(b) && (rules.pair !== 'color' || isRed(a) === isRed(b));
    function pairOff(h) {
      const out = [];
      for (let i = 0; i < h.length; i++) {
        for (let j = i + 1; j < h.length; j++) if (same(h[i], h[j])) { out.push([h[i], h[j]]); h.splice(j, 1); h.splice(i, 1); i--; break; }
      }
      return out;
    }
    function outOf(p) {
      if (s.out.includes(p)) return;
      s.out.push(p);
      emit({ k: 'out', p, place: s.out.length });
    }
    function finish() {
      const l = [...Array(n).keys()].find(alive);
      s.loser = l == null ? -1 : l;
      s.phase = 'done'; s.tid++;
      emit({ k: 'end', loser: s.loser, out: s.out.slice() });
    }
    function tell(t) {
      if (!bots || !bots[t]) return;
      if (R() < (s.hands[t].includes(OM) ? leak : leak * .35)) emit({ k: 'tell', p: t, mood: 'o' });
    }
    function begin(p) {
      if ([...Array(n).keys()].filter(alive).length <= 1) return finish();
      if (!alive(p)) p = step(p, 1);
      s.turn = p; s.target = step(p, dir); s.tid++;
      emit({ k: 'turn', p, t: s.target });
      tell(s.target);
    }
    return {
      s,
      take() { const e = s.ev; s.ev = []; return e; },
      need() { return s.phase === 'done' ? { k: 'done' } : { k: 'turn', p: s.turn }; },
      deal() {
        s.phase = 'play'; s.rid++; s.out = []; s.loser = -1;
        let d = deck(1);
        if (rules.maid === 'card') d.push(OM); else d = d.filter(id => id !== 49);
        shuf(d, R);
        s.hands = Array.from({ length: n }, () => []);
        d.forEach((id, k) => s.hands[k % n].push(id));
        emit({ k: 'deal', hands: s.hands.map(h => h.slice()) });
        s.pairs = s.hands.map(pairOff);
        emit({ k: 'pairs', lists: s.pairs.map(l => l.map(x => x.slice())) });
        for (let p = 0; p < n; p++) if (!alive(p)) outOf(p);
        begin(Math.floor(R() * n));
      },
      act(p, a) {
        if (s.phase !== 'play' || !a) return false;
        if (a.t === 'shuf') {
          if (s.hands[p].length < 2) return false;
          shuf(s.hands[p], R);
          emit({ k: 'shuf', p, order: s.hands[p].slice() });
          return true;
        }
        if (a.t !== 'draw' || p !== s.turn) return false;
        const t = s.target, h = s.hands[t], i = a.i;
        if (!Number.isInteger(i) || i < 0 || i >= h.length) return false;
        const len = h.length, id = h.splice(i, 1)[0], mine = s.hands[p];
        const pos = Math.floor(R() * (mine.length + 1));
        mine.splice(pos, 0, id);
        emit({ k: 'draw', p, t, i, n: len, id, pos });
        const j = mine.findIndex(x => x !== id && same(x, id));
        if (j >= 0) {
          const o = mine[j], k = mine.indexOf(id);
          mine.splice(Math.max(j, k), 1); mine.splice(Math.min(j, k), 1);
          s.pairs[p].push([id, o]);
          emit({ k: 'pair', p, ids: [id, o] });
        }
        if (!h.length) outOf(t);
        if (!mine.length) outOf(p);
        if (typeof a.arr === 'number' && mine.length > 1 && mine.includes(OM)) {
          mine.splice(mine.indexOf(OM), 1);
          mine.splice(Math.round(clamp(a.arr, 0, 1) * mine.length), 0, OM);
        }
        begin((p + 1) % n);
        return true;
      },
      view(p) {
        return { n, me: p, phase: s.phase, turn: s.phase === 'play' ? s.turn : -1, target: s.phase === 'play' ? s.target : -1, tid: s.tid, rid: s.rid, dir, hand: s.hands[p].slice(), counts: s.hands.map(h => h.length), pairs: s.pairs.map(l => l.map(x => x.slice())), out: s.out.slice(), loser: s.loser };
      }
    };
  }

  function omFilter(e, q) {
    if (e.k === 'deal') return { k: 'deal', n: e.hands.length, mine: e.hands[q].slice(), counts: e.hands.map(h => h.length) };
    if (e.k === 'draw' && e.p !== q && e.t !== q) return { k: 'draw', p: e.p, t: e.t, i: e.i, n: e.n, id: -1, pos: e.pos };
    if (e.k === 'shuf' && e.p !== q) return { k: 'shuf', p: e.p };
    return e;
  }
  function omMem(n) { return { n, pick: Array.from({ length: n }, () => [3, 6, 10, 6, 3]) }; }
  function omObserve(m, e) {
    if (e.k !== 'draw') return;
    const a = m.pick[e.p], b = Math.round(e.i / Math.max(1, e.n - 1) * 4);
    a[b] += 3;
    if (b > 0) a[b - 1] += 1.2;
    if (b < 4) a[b + 1] += 1.2;
  }
  function omBot(V, p, level, m, R) {
    const f = level === 'Easy' ? (R() + R() + R()) / 3 : level === 'Normal' ? (R() + R()) / 2 : R();
    const a = { t: 'draw', i: Math.min(V.counts[V.target] - 1, Math.floor(f * V.counts[V.target])) };
    if ((level === 'Hard' || level === 'Expert') && m) {
      let d = -1;
      for (let k = 1; k < V.n && d < 0; k++) { const q = ((p - V.dir * k) % V.n + V.n) % V.n; if (V.counts[q] > 0) d = q; }
      if (d >= 0) {
        const h = m.pick[d].map((c, b) => ({ b, c: c + R() * 1.5 })).sort((x, y) => x.c - y.c);
        a.arr = level === 'Expert' && R() < .2 ? R() : h[0].b / 4;
      }
    }
    return a;
  }
  function omAuto(V, p, R) { return V.counts[V.target] > 0 ? { t: 'draw', i: Math.floor(R() * V.counts[V.target]) } : null; }

  function omUI(sh) {
    const { Z, M } = sh;
    const S = { counts: [], pc: [], picking: -1, hl: -1, up: new Set(), flip: true, tid: -2 };
    const shufB = sh.btn('Shuffle', 'al', () => { if (canShuf()) sh.act({ t: 'shuf' }); });
    const me = () => sh.mine();
    const mine = () => Z.list('hand:' + me());
    const deckAt = () => ({ x: sh.L.cx, y: sh.L.cy, s: .52, up: false, r: 0 });
    const pileBase = p => {
      const L = sh.L;
      if (p === me()) return L.port ? { x: 170, y: 486 } : { x: 150, y: 440 };
      const t = KIT.toward(sh, p, L.port ? 84 : 116);
      return { x: t.x, y: t.y };
    };

    Z.lay = (name, list) => {
      const L = sh.L, [kind, ps] = name.split(':'), p = +ps, k = list.length;
      if (kind === 'deck') return list.map((s, i) => ({ x: L.cx - i * .5, y: L.cy - i * .8, s: .52, r: 0, up: false, z: 2 + i }));
      if (kind === 'fly') return list.map((s, i) => ({ x: L.cx + (i - (k - 1) / 2) * (L.port ? 50 : 70), y: L.cy - 4, s: L.port ? .74 : .9, r: 0, up: true, z: 70 + i }));
      if (kind === 'pick') {
        const w = L.port ? 320 : 560, gap = Math.min(L.port ? 52 : 70, k > 1 ? w / (k - 1) : 0);
        return list.map((s, i) => ({ x: L.cx + (i - (k - 1) / 2) * gap, y: L.cy - 6 - (i === S.hl ? 24 : 0), s: L.port ? .6 : .8, r: 0, up: false, z: 50 + i }));
      }
      if (kind === 'hand' && p === me()) {
        const pts = handPts(k, L, 54);
        return list.map((s, i) => ({ x: pts[i].x, y: pts[i].y - (S.up.has(s) ? 30 : 0), s: L.hand.s, r: pts[i].r, up: S.flip, z: 10 + i }));
      }
      if (kind === 'hand') return KIT.mini(sh, p, list);
      if (kind === 'pile') {
        const b = pileBase(p);
        return list.map((s, i) => { const id = s.id >= 0 ? s.id : i; return { x: b.x + (id * 37) % 17 - 8, y: b.y + (id * 53) % 11 - 5, s: L.port ? .34 : .4, r: (id * 29) % 41 - 20, up: true, z: 3 + i }; });
      }
      return [];
    };

    function refreshSeat(p) {
      sh.badge(p, S.counts[p] ? S.counts[p] : '');
      sh.sub(p, S.pc[p] ? S.pc[p] + (S.pc[p] === 1 ? ' pair' : ' pairs') : '');
    }
    function refreshAll() { for (let p = 0; p < S.counts.length; p++) refreshSeat(p); }
    function reset() {
      S.counts = []; S.pc = []; S.picking = -1; S.hl = -1; S.up.clear(); S.flip = true; S.tid = -2;
      shufB.hidden = true;
      sh.seats.forEach(o => o.el.classList.remove('tgt'));
    }
    function place() { const L = sh.L; sh.at(shufB, L.btn2.x, L.btn2.y); }
    function showPick(t) {
      Z.list('hand:' + t).slice().forEach(s => Z.put('pick', s));
      S.picking = t; S.hl = -1;
      Z.relay('pick', .4, .015);
    }
    function restorePick(dur) {
      const t = S.picking;
      if (t < 0) return;
      Z.list('pick').slice().forEach(s => Z.put('hand:' + t, s));
      S.picking = -1; S.hl = -1;
      Z.relay('hand:' + t, dur == null ? .35 : dur);
    }

    function sync(V, hard) {
      const m = me();
      restorePick(0);
      S.counts = V.counts.slice(); S.pc = V.pairs.map(l => l.length); S.up.clear();
      Z.fit('hand:' + m, V.hand, deckAt(), true);
      for (let q = 0; q < V.n; q++) {
        if (q !== m) Z.count('hand:' + q, V.counts[q], KIT.spawn(sh, q));
        const ids = []; V.pairs[q].forEach(pr => ids.push(...pr));
        Z.fit('pile:' + q, ids, KIT.spawn(sh, q), true);
        sh.out(q, V.out.includes(q) && q !== V.loser);
      }
      Z.all2(hard ? 0 : .25);
      Z.sweep();
      refreshAll(); place();
    }

    async function fly(sprs, to, hold, from, hideAfter) {
      sprs.forEach(s => Z.put('fly', s));
      if (from) Z.relay(from, .3);
      Z.relay('fly', .4, .05);
      await sh.wait(hold || 700);
      sprs.forEach(s => Z.put(to, s));
      Z.relay(to, .35);
      if (hideAfter) setTimeout(() => sprs.forEach(s => { if (s.zone && s.zone.name === to) Z.hide(s); }), 260);
      await sh.wait(360);
    }

    async function onDeal(e) {
      const m = me(), n = e.n;
      Z.clear(); reset();
      S.counts = Array(n).fill(0); S.pc = Array(n).fill(0); S.flip = false;
      Z.count('deck', 8, deckAt()); Z.relay('deck', 0);
      refreshAll();
      await sh.wait(250);
      const total = KIT.sum(e.counts), left = e.counts.slice();
      let j = 0, c = 0;
      while (c < total) {
        for (let p = 0; p < n; p++) {
          if (!left[p]) continue;
          left[p]--; c++;
          const s = Z.make(p === m ? e.mine[j++] : -1, deckAt());
          Z.put('hand:' + p, s); s.z = 40;
          Z.relay('hand:' + p, .25);
          S.counts[p]++; refreshSeat(p);
          if (c % 2 === 0) snd('deal');
          await sh.wait(34);
        }
      }
      Z.count('deck', 0);
      S.flip = true;
      Z.relay('hand:' + m, .4, .02);
      snd('flip');
      await sh.wait(650);
    }

    async function onPairs(e) {
      let any = false;
      e.lists.forEach((l, p) => l.forEach(pr => {
        pr.forEach(id => { const s = Z.get(id, 'hand:' + p, KIT.spawn(sh, p)); Z.put('pile:' + p, s); });
        S.counts[p] -= 2; S.pc[p]++; any = true;
      }));
      if (!any) return;
      for (let p = 0; p < e.lists.length; p++) { Z.relay('hand:' + p, .45, .01); Z.relay('pile:' + p, .5, .02); refreshSeat(p); }
      snd('pair');
      await sh.wait(900);
      sh.tick('Pairs are laid down. Avoid the Old Maid!', 2400);
    }

    async function event(e) {
      const m = me();
      if (e.k === 'deal') return onDeal(e);
      if (e.k === 'pairs') return onPairs(e);
      if (e.k === 'turn') {
        restorePick();
        sh.turn(e.p);
        sh.seats.forEach(o => o.el.classList.toggle('tgt', o.p === e.t));
        if (e.p !== m) { sh.arrow(e.p, e.t, 1100); sh.log(sh.name(e.p) + ' draws from ' + (e.t === m ? 'you' : sh.name(e.t))); }
        await sh.wait(e.p === m ? 120 : 520);
        return;
      }
      if (e.k === 'tell') { sh.mood(e.p, e.mood, 1700); return; }
      if (e.k === 'shuf') {
        if (e.p === m && e.order) {
          const z = Z.zone('hand:' + m);
          z.list = e.order.map(id => Z.byId.get(id)).filter(Boolean);
          Z.relay('hand:' + m, .5);
        }
        snd('slide');
        await sh.wait(350);
        return;
      }
      if (e.k === 'draw') {
        const t = e.t, p = e.p;
        let spr;
        if (t === m) {
          const l = Z.list('hand:' + m);
          spr = l[e.i] || l[l.length - 1];
          if (spr) { S.up.add(spr); Z.relay('hand:' + m, .2); }
        } else {
          if (S.picking !== t) { restorePick(); showPick(t); await sh.wait(520); }
          S.hl = e.i; Z.relay('pick', .2);
          spr = Z.list('pick')[e.i];
        }
        if (!spr) spr = Z.make(-1, KIT.spawn(sh, t));
        await sh.wait(p === m ? 250 : 650);
        if (e.id >= 0 && spr.id !== e.id) Z.reveal(spr, e.id);
        S.up.delete(spr);
        Z.put('hand:' + p, spr, p === m ? e.pos : undefined);
        if (p === m) spr.z = 60;
        restorePick();
        Z.relay('hand:' + p, .4); Z.relay('hand:' + t, .4);
        S.counts[t]--; S.counts[p]++;
        refreshSeat(p); refreshSeat(t);
        snd('take');
        if (t === m && p !== m) setTimeout(() => { if (spr.zone && spr.zone.name === 'hand:' + p) Z.hide(spr); }, 300);
        await sh.wait(520);
        return;
      }
      if (e.k === 'pair') {
        const from = 'hand:' + e.p;
        const sprs = e.ids.map(id => Z.get(id, from, KIT.spawn(sh, e.p)));
        S.counts[e.p] -= 2; S.pc[e.p]++;
        snd('pair');
        sh.mood(e.p, 'h', 1300);
        sh.log(KIT.nm(sh, e.p) + ' pair' + KIT.vb(sh, e.p, '', 's') + ' ' + RNP[rk(e.ids[0])]);
        await fly(sprs, 'pile:' + e.p, 760, from);
        refreshSeat(e.p);
        return;
      }
      if (e.k === 'out') {
        sh.out(e.p, true);
        sh.badge(e.p, '#' + e.place);
        sh.mood(e.p, 'h', 2400);
        sh.say(e.p, e.place === 1 ? 'I am out!' : 'Safe!', 1700);
        sh.log(KIT.nm(sh, e.p) + (e.p === m ? ' are' : ' is') + ' out (#' + e.place + ')');
        snd('ping');
        if (e.p === m) sh.banner('You are safe!', 'grn', 1600);
        await sh.wait(850);
        return;
      }
      if (e.k === 'end') {
        sh.turn(-1); restorePick(0);
        sh.seats.forEach(o => o.el.classList.remove('tgt'));
        if (e.loser >= 0) {
          const from = 'hand:' + e.loser;
          const s = Z.get(OM, from, KIT.spawn(sh, e.loser));
          sh.mood(e.loser, 's', 0);
          snd('boom');
          sh.banner(e.loser === m ? 'You are the Old Maid!' : sh.name(e.loser) + ' is the Old Maid!', 'red', 2200);
          await fly([s], from, 1500, from);
        }
        sh.badge(e.loser, 'OM');
        await sh.wait(300);
      }
    }

    function canPlay() { const V = M.V; return !!V && V.phase === 'play' && V.turn === me() && sh.canAct() && !M.hold; }
    function canShuf() { const V = M.V; return !!V && V.phase === 'play' && V.hand.length > 1 && sh.canAct() && !M.hold; }

    function controls(V) {
      const m = me(), my = V.phase === 'play' && V.turn === m, ok = canPlay();
      if (V.tid !== S.tid) { S.tid = V.tid; S.hl = -1; }
      if (my) { if (S.picking !== V.target) { restorePick(0); showPick(V.target); } }
      else if (S.picking >= 0) restorePick();
      sh.seats.forEach(o => o.el.classList.toggle('tgt', V.phase === 'play' && o.p === V.target));
      Z.list('pick').forEach(s => s.cls('hot', ok));
      if (my) sh.hint(ok ? (S.hl >= 0 ? 'Tap again to take it' : 'Pick a card from ' + sh.name(V.target)) : null);
      else sh.hint(null);
      shufB.hidden = !canShuf();
      sh.at(shufB, sh.L.btn2.x, sh.L.btn2.y);
      Z.relay('pick', .15);
    }
    function take(i) {
      if (!canPlay() || i < 0) return;
      const a = { t: 'draw', i };
      sh.act(a);
    }

    sh.api.on(sh.root, 'pointerover', e => {
      if (e.pointerType === 'touch' || !canPlay()) return;
      const c = e.target.closest && e.target.closest('.cg-c');
      if (!c || !c._s || !c._s.zone || c._s.zone.name !== 'pick') return;
      const i = Z.list('pick').indexOf(c._s);
      if (i !== S.hl) { S.hl = i; Z.relay('pick', .12); }
    });

    return {
      reset, sync, event, controls, place,
      turnOf: V => V.turn,
      tap(spr) {
        if (!canPlay() || !spr.zone || spr.zone.name !== 'pick') return;
        const i = Z.list('pick').indexOf(spr);
        if (i === S.hl) take(i);
        else { S.hl = i; snd('pick'); controls(M.V); }
      },
      key(e) {
        const k = e.key;
        if ((k === 's' || k === 'S') && canShuf()) { sh.act({ t: 'shuf' }); return true; }
        if (!canPlay()) return false;
        const cnt = Z.list('pick').length;
        if (k === 'ArrowLeft' || k === 'ArrowRight') {
          S.hl = S.hl < 0 ? (k === 'ArrowRight' ? 0 : cnt - 1) : (S.hl + (k === 'ArrowRight' ? 1 : -1) + cnt) % cnt;
          snd('pick'); controls(M.V);
          return true;
        }
        if ((k === 'Enter' || k === ' ') && S.hl >= 0) { take(S.hl); return true; }
        return false;
      },
      results(V) {
        const m = me(), order = V.out.filter(p => p !== V.loser).concat(V.loser >= 0 ? [V.loser] : []);
        const rows = order.map((p, i) => ({ p, cols: [V.pairs[p].length, p === V.loser ? '<b style="color:#ff8070">Old Maid</b>' : '#' + (i + 1)], win: i === 0 }));
        const place = order.indexOf(m) + 1, lose = V.loser === m;
        const title = lose ? 'You are the Old Maid!' : place === 1 ? 'You win!' : 'You are safe';
        const sub = lose ? 'Better luck next time.' : sh.name(V.loser) + ' is stuck with the Old Maid.';
        return { html: KIT.res(sh, { kick: 'Old Maid', title, sub, heads: ['Pairs', 'Result'], rows }), sound: lose ? 'lose' : 'win', score: V.n - place };
      }
    };
  }

  const OMG = {
    id: 'old-maid', title: 'Old Maid', tag: 'Draw, pair up, and do not get stuck with the Old Maid.', min: 2, max: 6, n0: 4,
    rules0: { maid: 'card', pair: 'rank', dir: 'left' },
    schema: [
      { k: 'maid', label: 'The Old Maid', info: 'The card nobody can pair', vals: [['card', 'Special card'], ['queen', 'Odd queen']] },
      { k: 'pair', label: 'Pairs', info: 'What counts as a pair', vals: [['rank', 'Same rank'], ['color', 'Rank and colour']] },
      { k: 'dir', label: 'Draw from', info: 'Which neighbour you take from', vals: [['left', 'Left'], ['right', 'Right']] }
    ],
    help: '<p>Pairs are laid down at once. Take turns drawing one card, unseen, from your neighbour\'s hand. If it matches a card in your hand, both go to your pile.</p><p>One card has no partner: the <b>Old Maid</b>. Whoever is left holding it at the end loses. Nobody can tell who has it, but bots sometimes look nervous.</p><p>The Old Maid is a special card, or the odd queen when you choose that option (the queen of clubs is removed). In colour mode a pair is the same rank and colour.</p><p>Pick a card with the mouse or <kbd>Left</kbd>/<kbd>Right</kbd> and <kbd>Enter</kbd>. On a phone tap once to look, again to take. <kbd>S</kbd> shuffles your hand, so tricky bots cannot learn where your cards sit.</p>',
    engine: omEngine, filter: omFilter, mem: omMem, observe: omObserve, bot: omBot, auto: omAuto, ui: omUI
  };

  const chNext = r => r === 14 ? 2 : r === 13 ? 14 : r + 1;
  const chIdx = r => r === 14 ? 0 : r - 1;
  const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
  const chSay = (n, r) => cap(n < 9 ? NUMW[n] : String(n)) + ' ' + (n === 1 ? RN[r] : RNP[r]);

  function chEngine(n, rules, R, level, bots) {
    const D = +rules.decks === 2 ? 2 : +rules.decks === 1 ? 1 : (n >= 6 ? 2 : 1);
    const max = rules.max === 'any' ? 999 : 4;
    const free = rules.rankmode === 'free';
    const win = Math.round((+rules.win || 3.5) * 1000);
    const s = { n, D, win, hands: Array.from({ length: n }, () => []), pile: [], last: null, rank: 14, phase: 'play', turn: 0, tid: 0, ev: [], rid: 1, winner: -1, passed: [], st: [] };
    const emit = e => { s.ev.push(e); };
    function end() {
      s.phase = 'done'; s.tid++;
      emit({ k: 'end', winner: s.winner });
      return true;
    }
    function advance(l, called) {
      s.phase = 'play'; s.last = null; s.passed = [];
      s.turn = (l.p + 1) % n;
      s.rank = free ? (called ? 0 : l.r) : chNext(l.r);
      s.tid++;
      emit({ k: 'turn', p: s.turn, r: s.rank });
    }
    function noCall() {
      const l = s.last;
      emit({ k: 'ok', p: l.p });
      if (!s.hands[l.p].length) { s.winner = l.p; return end(); }
      advance(l, false);
      return true;
    }
    function callIt(p) {
      const l = s.last, truth = l.ids.every(id => rk(id) === l.r), loser = truth ? p : l.p;
      s.st[p].calls++;
      if (!truth) { s.st[p].right++; s.st[l.p].caught++; }
      const taken = s.pile.slice();
      emit({ k: 'call', p, q: l.p, ids: l.ids.slice(), r: l.r, truth, loser });
      s.hands[loser].push(...taken); s.pile = [];
      emit({ k: 'take', p: loser, ids: taken });
      if (!s.hands[l.p].length) { s.winner = l.p; return end(); }
      advance(l, true);
      return true;
    }
    return {
      s,
      take() { const e = s.ev; s.ev = []; return e; },
      need() { return s.phase === 'done' ? { k: 'done' } : s.phase === 'call' ? { k: 'call', p: -1, last: s.last.p } : { k: 'turn', p: s.turn }; },
      deal() {
        s.rid++; s.phase = 'play'; s.pile = []; s.last = null; s.winner = -1; s.passed = [];
        s.rank = free ? 0 : 14;
        s.st = Array.from({ length: n }, () => ({ lies: 0, caught: 0, calls: 0, right: 0 }));
        const d = shuf(deck(D), R);
        s.hands = Array.from({ length: n }, () => []);
        d.forEach((id, k) => s.hands[k % n].push(id));
        s.turn = Math.floor(R() * n); s.tid++;
        emit({ k: 'deal', hands: s.hands.map(h => h.slice()), D });
        emit({ k: 'turn', p: s.turn, r: s.rank });
      },
      act(p, a) {
        if (!a) return false;
        if (s.phase === 'play') {
          if (a.t !== 'play' || p !== s.turn || !Array.isArray(a.ids)) return false;
          const ids = a.ids, h = s.hands[p];
          if (!ids.length || ids.length > Math.min(max, h.length)) return false;
          if (new Set(ids).size !== ids.length || !ids.every(id => Number.isInteger(id) && h.includes(id))) return false;
          let r = s.rank;
          if (!r) { r = a.r; if (!Number.isInteger(r) || r < 2 || r > 14) return false; }
          s.hands[p] = h.filter(id => !ids.includes(id));
          s.pile.push(...ids);
          s.rank = r;
          s.last = { p, ids: ids.slice(), r };
          if (ids.some(id => rk(id) !== r)) s.st[p].lies++;
          s.phase = 'call'; s.passed = []; s.tid++;
          emit({ k: 'play', p, ids: ids.slice(), r });
          return true;
        }
        if (s.phase === 'call') {
          if (p === -1) return a.t === 'close' ? noCall() : false;
          if (p === s.last.p || p < 0 || p >= n) return false;
          if (a.t === 'pass') {
            if (!s.passed.includes(p)) s.passed.push(p);
            if (s.passed.length >= n - 1) noCall();
            return true;
          }
          if (a.t === 'call') return callIt(p);
        }
        return false;
      },
      view(p) {
        const h = p >= 0 ? KIT.sortIds(s.hands[p]) : [];
        return { n, me: p, D, max, free, win, phase: s.phase, turn: s.phase === 'play' ? s.turn : -1, tid: s.tid, rid: s.rid, rank: s.rank, hand: h, counts: s.hands.map(x => x.length), pile: s.pile.length, last: s.last ? { p: s.last.p, n: s.last.ids.length, r: s.last.r } : null, passed: s.passed.slice(), winner: s.winner, st: s.st.map((x, q) => Object.assign({}, x, { lies: q === p || s.phase === 'done' ? x.lies : -1 })) };
      }
    };
  }

  function chFilter(e, q) {
    if (e.k === 'deal') return { k: 'deal', n: e.hands.length, D: e.D, mine: KIT.sortIds(e.hands[q]), counts: e.hands.map(h => h.length) };
    if (e.k === 'play' && e.p !== q) return { k: 'play', p: e.p, n: e.ids.length, r: e.r };
    if (e.k === 'take' && e.p !== q) return { k: 'take', p: e.p, n: e.ids.length };
    return e;
  }

  function chMem(n) { return { n, D: 1, kh: Array.from({ length: n }, () => new Set()), lr: Array.from({ length: n }, () => [1, 6]) }; }
  function chObserve(m, e) {
    if (e.k === 'deal') { m.D = e.D; m.kh.forEach(x => x.clear()); m.lr.forEach(x => { x[0] = 1; x[1] = 6; }); }
    else if (e.k === 'play') {
      m.lr[e.p][1]++;
      const kh = m.kh[e.p];
      let c = e.n;
      for (const id of Array.from(kh)) if (c > 0 && rk(id) === e.r) { kh.delete(id); c--; }
      for (const id of Array.from(kh)) if (c > 0) { kh.delete(id); c--; }
    } else if (e.k === 'call') {
      if (!e.truth) m.lr[e.q][0]++;
      e.ids.forEach(id => m.kh[e.loser].add(id));
    }
  }

  const LF = [0];
  for (let i = 1; i < 260; i++) LF[i] = LF[i - 1] + Math.log(i);
  const lc = (a, b) => b < 0 || b > a ? -Infinity : LF[a] - LF[b] - LF[a - b];
  const hypPmf = (N, K, nn, k) => k < 0 || k > K || k > nn || nn - k > N - K ? 0 : Math.exp(lc(K, k) + lc(N - K, nn - k) - lc(N, nn));
  const LIE_N = [0, .75, .2, .04, .01];

  function chLieProb(V, p, m, level) {
    const l = V.last, D4 = 4 * V.D, n = l.n;
    const mine = V.hand.filter(id => rk(id) === l.r).length;
    let known = 0, knownQ = 0, knownCards = 0;
    for (let o = 0; o < V.n; o++) {
      if (o === p || !m) continue;
      const kr = Array.from(m.kh[o]).filter(id => rk(id) === l.r).length;
      known += kr; knownCards += m.kh[o].size;
      if (o === l.p) knownQ = kr;
    }
    const avail = D4 - mine - (known - knownQ);
    if (n > avail) return 1;
    const N = Math.max(1, 52 * V.D - V.hand.length - knownCards);
    const K = clamp(D4 - mine - known, 0, N);
    const nn = clamp(V.counts[l.p] + n - (m ? m.kh[l.p].size : 0), 0, N);
    const br = level === 'Expert' ? .22 : level === 'Hard' ? .18 : .12;
    let h = 0, lie = 0;
    for (let x = 0; x <= Math.min(K, nn); x++) {
      const pr = hypPmf(N, K, nn, x);
      if (!pr) continue;
      const t = knownQ + x;
      if (t === n || (n >= V.max && t > n)) h += pr;
      else if (t > n) h += pr * .12;
      else if (t === 0) lie += pr * (LIE_N[Math.min(n, 4)] || 0);
      else lie += pr * br * (n === t + 1 ? 1 : .3);
    }
    if (level === 'Expert' && m) {
      const rate = clamp(m.lr[l.p][0] / m.lr[l.p][1] * 2, .4, 2.2);
      lie *= rate;
    }
    return h + lie > 0 ? lie / (h + lie) : 1;
  }

  function chCall(V, p, level, m, R) {
    const l = V.last, cq = V.counts[l.p];
    const pl = chLieProb(V, p, m, level);
    const CALL = { t: 'call' }, PASS = { t: 'pass' };
    if (level === 'Easy') return R() < (pl >= 1 ? .7 : cq === 0 ? .5 : .15) ? CALL : PASS;
    if (cq === 0) return pl > 0 || level !== 'Expert' ? CALL : PASS;
    if (pl >= 1) return CALL;
    const noise = { Normal: .18, Hard: .08, Expert: .03 }[level] || .1;
    let thr = { Normal: .8, Hard: .78, Expert: .76 }[level] || .7;
    if (cq <= 2) thr -= .2;
    if (V.hand.length <= 3) thr += .15;
    if (V.pile > 22) thr += .05;
        return pl + (R() * 2 - 1) * noise > thr ? CALL : PASS;
  }

  function chWait(V, p, r, q) {
    if (V.free) return 1;
    const a = chIdx(r), b = chIdx(q);
    for (let k = 1; k <= 13; k++) if ((a + k * V.n) % 13 === b) return k;
    return 13;
  }

  function chPlay(V, p, level, m, R, forceHonest) {
    const h = V.hand, max = Math.min(V.max, h.length), by = {};
    h.forEach(id => { (by[rk(id)] = by[rk(id)] || []).push(id); });
    let r = V.rank;
    if (!r) {
      const rs = Object.keys(by).map(Number);
      rs.sort((a, b) => by[b].length - by[a].length || R() - .5);
      r = rs[0];
    }
    const own = by[r] || [];
    const rest = h.filter(id => rk(id) !== r);
    const far = list => {
      const sc = id => chWait(V, p, r, rk(id)) - .6 * ((by[rk(id)] || []).length - 1) + R() * (level === 'Easy' ? 9 : level === 'Normal' ? 2.5 : .8);
      return list.slice().sort((a, b) => sc(b) - sc(a));
    };
    let ids = [];
    if (own.length) {
      ids = own.slice(0, max);
      const bluff = { Easy: 0, Normal: .06, Hard: .09, Expert: .13 }[level] || 0;
      if (!forceHonest && ids.length < max && ids.length <= 2 && rest.length > 2 && R() < bluff) ids.push(far(rest)[0]);
    } else {
      const cnt = level !== 'Easy' && level !== 'Normal' && rest.length > 8 && max >= 2 && R() < .18 ? 2 : (level === 'Easy' && R() < .25 ? 2 : 1);
      ids = far(rest).slice(0, Math.min(cnt, max));
    }
    const a = { t: 'play', ids };
    if (!V.rank) a.r = r;
    return a;
  }

  function chBot(V, p, level, m, R) {
    if (V.phase === 'call') return V.last && V.last.p !== p ? chCall(V, p, level, m, R) : null;
    if (V.phase === 'play' && V.turn === p) return chPlay(V, p, level, m, R);
    return null;
  }
  function chAuto(V, p, R) {
    if (V.phase === 'call') return V.last && V.last.p !== p ? { t: 'pass' } : null;
    if (V.phase === 'play' && V.turn === p) return chPlay(V, p, 'Normal', null, R, true);
    return null;
  }

  function chDrive(sh, nd, botMove, doAct) {
    if (nd.k !== 'call') return false;
    const M = sh.M, e = M.eng, tid = e.s.tid;
    if (M.chEng !== e || M.chTid !== tid) { M.chEng = e; M.chTid = tid; M.chSched = new Set(); }
    const tok = M.tok;
    for (let p = 0; p < M.n; p++) {
      if (!M.bot[p] || p === nd.last || M.chSched.has(p) || e.s.passed.includes(p)) continue;
      M.chSched.add(p);
      botMove(p, 0);
    }
    if (M.chTimer !== tid) {
      M.chTimer = tid;
      sh.later(e.s.win, () => {
        if (tok === M.tok && M.eng === e && e.s.tid === tid) doAct(-1, { t: 'close' });
      });
    }
    return true;
  }

  function chUI(sh) {
    const { Z, M } = sh;
    const CAP = 14;
    const S = { counts: [], pile: 0, sel: new Set(), cur: -1, rank: 0, tid: -2, ctid: -2, tap: [0, null], flip: true };
    S.reset = reset;
    const playB = sh.btn('Play', 'go', () => play());
    const callB = sh.btn('Cheat!', 'no', () => call());
    const fineB = sh.btn('Fine', 'al', () => pass());
    const claimEl = mk('div', 'cg-claim');
    const pileL = KIT.lbl(sh);
    const barEl = mk('div', 'cg-bar', '<i></i>');
    const rr = mk('div', 'cg-rr', [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(r => `<button data-r="${r}">${RL[r]}</button>`).join(''));
    sh.uiEl.append(claimEl, barEl, rr);
    barEl.hidden = true; rr.hidden = true; claimEl.hidden = true; pileL.hidden = true;
    const me = () => sh.mine();
    const mine = () => Z.list('hand:' + me());
    const pileAt = () => ({ x: sh.L.cx, y: sh.L.cy + 12, s: .6, up: false, r: 0 });
    const pj = s => s.pj || (s.pj = { x: Math.random() * 30 - 15, y: Math.random() * 20 - 10, r: Math.random() * 44 - 22 });

    Z.lay = (name, list) => {
      const L = sh.L, [kind, ps] = name.split(':'), p = +ps, k = list.length;
      if (kind === 'deck') return list.map((s, i) => ({ x: L.cx - i * .5, y: L.cy + 12 - i * .8, s: .52, r: 0, up: false, z: 2 + i }));
      if (kind === 'pile') return list.map((s, i) => { const j = pj(s); return { x: L.cx + j.x, y: L.cy + 12 + j.y, s: L.port ? .54 : .62, r: j.r, up: false, z: 3 + i }; });
      if (kind === 'fly') {
        const gap = Math.min(L.port ? 46 : 64, k > 1 ? (L.port ? 300 : 520) / (k - 1) : 0);
        return list.map((s, i) => ({ x: L.cx + (i - (k - 1) / 2) * gap, y: L.cy - 6, s: L.port ? .72 : .9, r: 0, up: true, z: 70 + i }));
      }
      if (kind === 'hand' && p === me()) return KIT.hand(sh, list, S.sel, S.cur, S.flip);
      if (kind === 'hand') return KIT.mini(sh, p, list);
      return [];
    };

    function setClaim(label, big) {
      claimEl.hidden = !big;
      claimEl.innerHTML = big ? `<small>${label}</small><b>${big}</b>` : '';
      const L = sh.L; sh.at(claimEl, L.cx, L.cy - (L.port ? 92 : 100));
    }
    function setPile(n) {
      S.pile = n;
      pileL.hidden = n <= 0;
      pileL.textContent = 'Pile ' + n;
      const L = sh.L; sh.at(pileL, L.cx, L.cy + (L.port ? 78 : 88));
    }
    function refreshSeat(p) { sh.badge(p, S.counts[p] || ''); }
    function refreshAll() { for (let p = 0; p < S.counts.length; p++) refreshSeat(p); }
    function reset() {
      S.counts = []; S.pile = 0; S.sel.clear(); S.cur = -1; S.rank = 0; S.tid = -2; S.ctid = -2; S.flip = true;
      playB.hidden = callB.hidden = fineB.hidden = true; barEl.hidden = true; rr.hidden = true; claimEl.hidden = true; pileL.hidden = true;
    }
    function place() {
      const L = sh.L;
      sh.at(playB, L.btn.x, L.btn.y); sh.at(callB, L.btn.x, L.btn.y); sh.at(fineB, L.btn2.x, L.btn2.y);
      sh.at(barEl, L.cx, L.hintY - 22); sh.at(rr, L.cx, L.hintY - (L.port ? 10 : 8));
      sh.at(claimEl, L.cx, L.cy - (L.port ? 92 : 100)); sh.at(pileL, L.cx, L.cy + (L.port ? 78 : 88));
    }
    function trim() {
      const l = Z.zone('pile').list;
      while (l.length > 16) { const s = l.shift(); s.zone = null; Z.trash(s); }
    }

    function sync(V, hard) {
      const m = me();
      S.counts = V.counts.slice(); S.sel.clear();
      Z.fit('hand:' + m, V.hand, pileAt(), true);
      KIT.byRank(mine());
      for (let q = 0; q < V.n; q++) if (q !== m) Z.count('hand:' + q, Math.min(CAP, V.counts[q]), KIT.spawn(sh, q));
      Z.count('pile', Math.min(16, V.pile), pileAt());
      Z.zone('fly').list.slice().forEach(s => { Z.put('pile', s); });
      setPile(V.pile);
      Z.all2(hard ? 0 : .25);
      Z.sweep();
      refreshAll();
      showClaim(V);
      place();
    }
    function showClaim(V) {
      if (V.phase === 'done') { setClaim('', ''); return; }
      if (V.phase === 'call' && V.last) setClaim(sh.name(V.last.p) + ' says', chSay(V.last.n, V.last.r).replace(/^(\w+) /, '$1 '));
      else if (V.rank) setClaim('Play', RL[V.rank]);
      else setClaim('Starter picks', '?');
      if (V.phase === 'call' && V.last) claimEl.lastChild.style.fontSize = '24px'; else if (claimEl.lastChild) claimEl.lastChild.style.fontSize = '';
    }

    async function fly(sprs, to, hold, from) {
      sprs.forEach(s => Z.put('fly', s));
      if (from) Z.relay(from, .3);
      Z.relay('fly', .4, .04);
      await sh.wait(hold || 800);
      sprs.forEach(s => Z.put(to, s));
      Z.relay(to, .4);
      await sh.wait(380);
    }

    async function event(e) {
      const m = me();
      if (e.k === 'deal') return KIT.deal(sh, S, e, { at: pileAt, cap: CAP });
      if (e.k === 'turn') {
        sh.turn(e.p);
        if (e.r) setClaim('Play', RL[e.r]); else setClaim('Starter picks', '?');
        claimEl.lastChild.style.fontSize = '';
        await sh.wait(180);
        return;
      }
      if (e.k === 'play') {
        const p = e.p, from = 'hand:' + p, k = e.ids ? e.ids.length : e.n;
        let sprs;
        if (p === m) sprs = e.ids.map(id => Z.get(id, from, KIT.spawn(sh, p)));
        else {
          sprs = [];
          for (let i = 0; i < k; i++) sprs.push(Z.anon(from, true) || Z.spawnAnon(KIT.spawn(sh, p)));
        }
        sprs.forEach(s => { pj(s); Z.put('pile', s); s.up = false; });
        S.counts[p] -= k; S.sel.clear();
        Z.relay('pile', .5, .06); Z.relay(from, .35);
        snd('place');
        sh.say(p, chSay(k, e.r), 2200);
        setClaim(sh.name(p) + ' says', chSay(k, e.r));
        claimEl.lastChild.style.fontSize = '24px';
        sh.log(KIT.nm(sh, p) + ' play' + KIT.vb(sh, p, '', 's') + ' ' + chSay(k, e.r).toLowerCase());
        setPile(S.pile + k);
        setTimeout(() => { if (p === m) sprs.forEach(s => { if (s.zone && s.zone.name === 'pile') Z.hide(s); }); trim(); }, 600);
        refreshSeat(p);
        await sh.wait(750);
        if (p !== m) Z.count(from, Math.min(CAP, S.counts[p]), KIT.spawn(sh, p));
        return;
      }
      if (e.k === 'ok') {
        sh.log('No one calls it');
        await sh.wait(220);
        return;
      }
      if (e.k === 'call') {
        sh.say(e.p, 'Cheat!', 1700);
        sh.mood(e.p, 'a', 2400); sh.mood(e.q, 'o', 2400);
        sh.banner('CHEAT!', 'red', 1300);
        snd('cheat');
        sh.log(KIT.nm(sh, e.p) + ' call' + KIT.vb(sh, e.p, '', 's') + ' ' + KIT.nm(sh, e.q) + ' out');
        await sh.wait(1150);
        const l = Z.zone('pile').list, k = e.ids.length, sprs = [];
        for (let i = 0; i < k; i++) sprs.push(l[l.length - k + i] || Z.make(-1, pileAt()));
        sprs.forEach((s, i) => { Z.reveal(s, e.ids[i]); Z.put('fly', s); });
        Z.relay('fly', .45, .08);
        snd('reveal');
        await sh.wait(1300);
        if (e.truth) { sh.banner('HONEST!', 'grn', 1500); sh.mood(e.q, 'h', 2400); sh.mood(e.p, 's', 2400); snd('ping'); }
        else { sh.banner('LIAR!', 'red', 1500); sh.mood(e.q, 's', 2400); sh.mood(e.p, 'h', 2400); snd('boom'); }
        await sh.wait(1000);
        return;
      }
      if (e.k === 'take') {
        const p = e.p, to = 'hand:' + p, src = Z.zone('fly').list.concat(Z.zone('pile').list);
        const total = e.ids ? e.ids.length : e.n;
        if (p === m) {
          e.ids.forEach(id => {
            let s = Z.byId.get(id);
            if (!s) { s = src.find(x => x.id < 0 && x.zone) || Z.make(-1, pileAt()); }
            Z.reveal(s, id);
            Z.put(to, s);
          });
          KIT.byRank(mine());
        } else {
          src.slice(0, Math.min(CAP, total)).forEach(s => { Z.put(to, s); setTimeout(() => Z.hide(s), 420); });
        }
        Z.zone('fly').list.slice().forEach(s => { s.zone = null; Z.trash(s); }); Z.zone('fly').list.length = 0;
        Z.zone('pile').list.slice().forEach(s => { s.zone = null; Z.trash(s); }); Z.zone('pile').list.length = 0;
        S.counts[p] += total;
        setPile(0);
        Z.relay(to, .55, .012);
        snd('take');
        sh.log(KIT.nm(sh, p) + ' pick' + KIT.vb(sh, p, '', 's') + ' up ' + total + ' cards');
        refreshSeat(p);
        await sh.wait(900);
        if (p !== m) Z.count(to, Math.min(CAP, S.counts[p]), KIT.spawn(sh, p));
        return;
      }
      if (e.k === 'end') {
        sh.turn(-1); setClaim('', '');
        sh.mood(e.winner, 'h', 0);
        snd('win');
        sh.banner(e.winner === m ? 'You win!' : sh.name(e.winner) + ' wins!', 'grn', 2000);
        await sh.wait(700);
      }
    }

    const canPlay = () => { const V = M.V; return !!V && V.phase === 'play' && V.turn === me() && sh.canAct() && !M.hold; };
    const canCall = () => { const V = M.V; return !!V && V.phase === 'call' && V.last && V.last.p !== me() && !V.passed.includes(me()) && sh.canAct() && !M.hold; };
    const rankNow = () => M.V && (M.V.rank || S.rank);

    function selIds() { return mine().map(s => s.id).filter(id => S.sel.has(id)); }
    function play() {
      if (!canPlay() || !S.sel.size || !rankNow()) return;
      const a = { t: 'play', ids: selIds() };
      if (!M.V.rank) a.r = S.rank;
      if (sh.act(a)) { S.sel.clear(); playB.hidden = true; rr.hidden = true; sh.hint(null); }
    }
    function call() { if (canCall() && sh.act({ t: 'call' })) { callB.hidden = true; fineB.hidden = true; barEl.hidden = true; sh.hint(null); } }
    function pass() { if (canCall() && sh.act({ t: 'pass' })) { callB.hidden = true; fineB.hidden = true; sh.hint('You let it go'); } }
    function relayMine() { Z.relay('hand:' + me(), .15); }
    function toggle(spr) {
      if (S.sel.has(spr.id)) S.sel.delete(spr.id);
      else if (S.sel.size < Math.min(M.V.max, mine().length)) S.sel.add(spr.id);
      else { sh.tick('You can play at most ' + M.V.max + ' cards', 1500); snd('bad'); }
      controls(M.V);
    }

    function controls(V) {
      const m = me(), pl = canPlay(), cl = canCall();
      if (V.tid !== S.tid) { S.tid = V.tid; S.sel.clear(); S.cur = -1; if (!V.free || V.rank) S.rank = V.rank; else S.rank = 0; }
      if (!pl) { S.sel.clear(); S.cur = -1; }
      const have = new Set(V.hand);
      Array.from(S.sel).forEach(id => { if (!have.has(id)) S.sel.delete(id); });
      const r = V.rank || S.rank;
      mine().forEach(s => { s.cls('hot', pl); s.cls('sel', S.sel.has(s.id)); s.cls('glow', pl && !!r && rk(s.id) === r && !S.sel.has(s.id)); });
      playB.hidden = !pl;
      playB.disabled = !(S.sel.size && r);
      playB.classList.toggle('hot', !playB.disabled);
      playB.textContent = S.sel.size ? 'Play ' + S.sel.size : 'Play';
      rr.hidden = !(pl && !V.rank);
      Array.from(rr.children).forEach(b => b.classList.toggle('on', +b.dataset.r === S.rank));
      callB.hidden = !cl; fineB.hidden = !cl;
      const showBar = V.phase === 'call' && V.last && (cl || V.last.p === m);
      if (showBar) {
        if (S.ctid !== V.tid) {
          S.ctid = V.tid;
          const f = barEl.firstChild;
          f.style.transition = 'none'; f.style.width = '100%';
          void f.offsetWidth;
          f.style.transition = `width ${V.win}ms linear`; f.style.width = '0%';
        }
        barEl.hidden = false;
      } else { barEl.hidden = true; S.ctid = -2; }
      if (pl) {
        if (!r) sh.hint('Pick the rank you will claim');
        else if (!S.sel.size) sh.hint('Select cards to play face down as ' + RNP[r]);
        else sh.hint('You claim: ' + chSay(S.sel.size, r).toLowerCase());
      } else if (cl) sh.hint('Is ' + sh.name(V.last.p) + ' cheating?');
      else if (V.phase === 'call' && V.last && V.last.p === m) sh.hint('Waiting for challenges...');
      else sh.hint(null);
      place();
      relayMine();
    }

    sh.api.on(rr, 'click', e => {
      const b = e.target.closest && e.target.closest('button');
      if (!b || !canPlay()) return;
      S.rank = +b.dataset.r; snd('pick'); controls(M.V);
    });

    return {
      reset, sync, event, controls, place,
      turnOf: V => V.phase === 'call' && V.last ? V.last.p : V.turn,
      tap(spr) {
        if (!canPlay() || !spr.zone || spr.zone.name !== 'hand:' + me() || spr.id < 0) return;
        const now = performance.now();
        if (S.tap[1] === spr && now - S.tap[0] < 380) {
          const r = rk(spr.id), max = Math.min(M.V.max, mine().length);
          const same = mine().filter(s => rk(s.id) === r).map(s => s.id);
          if (same.every(id => S.sel.has(id))) same.forEach(id => S.sel.delete(id));
          else { S.sel.clear(); same.slice(0, max).forEach(id => S.sel.add(id)); }
          S.tap = [0, null]; snd('pick'); controls(M.V);
          return;
        }
        S.tap = [now, spr];
        snd('pick'); toggle(spr);
      },
      key(e) {
        const k = e.key;
        if (canCall()) {
          if (k === 'c' || k === 'C' || k === 'b' || k === 'B') { call(); return true; }
          if (k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { pass(); return true; }
          return false;
        }
        if (!canPlay()) return false;
        const l = mine();
        if (k === 'ArrowLeft' || k === 'ArrowRight') {
          S.cur = S.cur < 0 ? (k === 'ArrowRight' ? 0 : l.length - 1) : clamp(S.cur + (k === 'ArrowRight' ? 1 : -1), 0, l.length - 1);
          snd('pick'); controls(M.V);
          return true;
        }
        if ((k === ' ' || k === 'ArrowUp' || k === 'ArrowDown') && l[S.cur]) { toggle(l[S.cur]); return true; }
        if (k === 'a' || k === 'A') {
          const r = rankNow();
          if (r) { S.sel.clear(); l.filter(s => rk(s.id) === r).slice(0, Math.min(M.V.max, l.length)).forEach(s => S.sel.add(s.id)); controls(M.V); }
          return true;
        }
        if (k === 'Enter') { play(); return true; }
        return false;
      },
      results(V) {
        const m = me(), won = V.winner === m;
        const order = [...Array(V.n).keys()].sort((a, b) => (a === V.winner ? -1 : b === V.winner ? 1 : 0) || V.counts[a] - V.counts[b]);
        const rows = order.map(p => ({ p, win: p === V.winner, cols: [V.counts[p], V.st[p].caught, V.st[p].right + '/' + V.st[p].calls] }));
        const title = won ? 'You win!' : sh.name(V.winner) + ' wins';
        const st = V.st[m];
        return { html: KIT.res(sh, { kick: 'Cheat', title, sub: 'You lied ' + st.lies + (st.lies === 1 ? ' time and were caught ' : ' times and were caught ') + st.caught + '.', heads: ['Cards', 'Caught', 'Calls'], rows }), sound: won ? 'win' : 'lose', score: won ? 1 : 0 };
      }
    };
  }

  const CHG = {
    id: 'cheat', title: 'Cheat', tag: 'Play face down, claim the rank, and get away with it.', min: 3, max: 8, n0: 4,
    rules0: { decks: 0, max: 4, rankmode: 'seq', win: 3.5 },
    schema: [
      { k: 'decks', label: 'Decks', info: 'Auto uses two from six players', vals: [[0, 'Auto'], [1, '1 deck'], [2, '2 decks']] },
      { k: 'max', label: 'Cards per turn', vals: [[4, 'Up to 4'], ['any', 'Any number']] },
      { k: 'rankmode', label: 'Rank to claim', info: 'In order, or chosen by whoever starts a pile', vals: [['seq', 'In order'], ['free', 'Starter picks']] },
      { k: 'win', label: 'Call window', info: 'Time to shout Cheat after each play', vals: [[2, 'Quick'], [3.5, 'Normal'], [6, 'Slow']] }
    ],
    help: '<p>Get rid of all your cards. On your turn play one to four cards <b>face down</b> and say what they are. The rank to claim goes <b>A, 2, 3 ... K</b> and round again, so you must claim that rank even when you hold none of it: you cheat.</p><p>After every play anyone may shout <b>Cheat!</b> The cards are turned over. If they were not all the claimed rank the player picks up the whole pile. If they were, the accuser does.</p><p>You need to survive the call window after playing your last cards to win. Bots count cards: a claim of five kings from one deck is impossible and gets called at once.</p><p>Click cards to select (double-click takes every copy of a rank), then <b>Play</b>. <kbd>C</kbd> calls Cheat, <kbd>Space</kbd> lets a play go. <kbd>Left</kbd>/<kbd>Right</kbd>, <kbd>Space</kbd> select, <kbd>A</kbd> all of the claimed rank, <kbd>Enter</kbd> plays.</p>',
    engine: chEngine, filter: chFilter, mem: chMem, observe: chObserve, bot: chBot, auto: chAuto, drive: chDrive, ui: chUI
  };

  const prBase = r => r === 2 ? 15 : r;
  const prPw = (r, rev) => rev ? 18 - prBase(r) : prBase(r);
  const prSort = ids => ids.slice().sort((a, b) => prBase(rk(a)) - prBase(rk(b)) || a - b);
  const prTitle = (pos, n) => pos === 0 ? 'President' : pos === n - 1 ? 'Scum' : n >= 4 && pos === 1 ? 'Vice President' : n >= 4 && pos === n - 2 ? 'Vice-Scum' : 'Neutral';
  const prOrd = i => (i + 1) + (i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th');
  const prDesc = (n, r) => n === 1 ? 'Single ' + RN[r] : n === 2 ? 'Pair of ' + RNP[r] : cap(n < 9 ? NUMW[n] : String(n)) + ' ' + RNP[r];
  const prC3 = id => id % 52 === 40;

  function prEngine(n, rules, R) {
    const D = +rules.decks === 1 ? 1 : +rules.decks === 2 ? 2 : (n >= 7 ? 2 : 1);
    const rounds = +rules.rounds || 3, revOn = rules.rev !== 'off', club = rules.start !== 'any';
    const s = { n, D, hands: [], cur: null, lead: -1, passed: [], rev: false, order: [], turn: 0, tid: 0, phase: 'play', ev: [], rid: 0, round: 0, rounds, scores: Array(n).fill(0), pts: Array(n).fill(0), pos: null, pend: [], must: -1, leader: 0 };
    const emit = e => { s.ev.push(e); };
    const act0 = p => s.hands[p].length > 0;
    const after = (p, any) => { for (let k = 1; k <= n; k++) { const q = (p + k) % n; if (act0(q) && (any || !s.passed.includes(q))) return q; } return -1; };
    const take = (p, ids) => { s.hands[p] = s.hands[p].filter(id => !ids.includes(id)); };
    function begin() {
      s.phase = 'play'; s.turn = s.leader; s.tid++;
      emit({ k: 'turn', p: s.turn });
    }
    function clear() {
      const to = act0(s.lead) ? s.lead : after(s.lead, true);
      emit({ k: 'clear', p: s.lead, to });
      s.cur = null; s.passed = []; s.turn = to; s.lead = to; s.tid++;
      emit({ k: 'turn', p: to });
    }
    function advance(p) {
      const q = after(p);
      if (q < 0 || q === s.lead) clear();
      else { s.turn = q; s.tid++; emit({ k: 'turn', p: q }); }
    }
    function endRound() {
      const pos = Array(n);
      s.order.forEach((p, i) => { pos[p] = i; });
      s.pts = pos.map(x => n - 1 - x);
      s.pts.forEach((x, p) => { s.scores[p] += x; });
      s.pos = pos; s.cur = null; s.tid++;
      s.phase = s.round >= s.rounds ? 'done' : 'end';
      emit({ k: 'end', order: s.order.slice(), pts: s.pts.slice(), done: s.phase === 'done' });
    }
    const okIds = (p, ids) => Array.isArray(ids) && new Set(ids).size === ids.length && ids.every(id => Number.isInteger(id) && s.hands[p].includes(id));
    return {
      s,
      take() { const e = s.ev; s.ev = []; return e; },
      need() { return s.phase === 'end' || s.phase === 'done' ? { k: 'done' } : s.phase === 'swap' ? { k: 'swap', p: s.pend[0].p } : { k: 'turn', p: s.turn }; },
      deal() {
        s.rid++; s.round++; s.phase = 'play'; s.cur = null; s.passed = []; s.rev = false; s.order = []; s.pend = []; s.must = -1;
        const d = shuf(deck(D), R);
        s.hands = Array.from({ length: n }, () => []);
        d.forEach((id, k) => s.hands[k % n].push(id));
        emit({ k: 'deal', hands: s.hands.map(h => h.slice()), D, rev: false, pos: s.pos });
        if (s.pos) {
          const by = []; s.pos.forEach((x, p) => { by[x] = p; });
          const pairs = n >= 4 ? [[0, n - 1, 2], [1, n - 2, 1]] : [[0, n - 1, 1]];
          for (const [a, b, c] of pairs) {
            const hi = by[a], lo = by[b], ids = prSort(s.hands[lo]).slice(-c);
            take(lo, ids); s.hands[hi].push(...ids);
            emit({ k: 'swap', from: lo, to: hi, ids });
            s.pend.push({ p: hi, to: lo, k: c });
          }
          s.leader = by[0];
        } else if (club) {
          const h = s.hands.findIndex(x => x.some(prC3));
          s.leader = h < 0 ? 0 : h;
          s.must = s.hands[s.leader].filter(prC3)[0];
        } else s.leader = Math.floor(R() * n);
        s.lead = s.leader;
        if (s.pend.length) { s.phase = 'swap'; s.tid++; } else begin();
      },
      act(p, a) {
        if (!a || s.phase === 'end' || s.phase === 'done') return false;
        if (s.phase === 'swap') {
          const pd = s.pend[0];
          if (a.t !== 'swap' || !pd || p !== pd.p || !okIds(p, a.ids) || a.ids.length !== pd.k) return false;
          take(p, a.ids); s.hands[pd.to].push(...a.ids);
          emit({ k: 'swap', from: p, to: pd.to, ids: a.ids.slice() });
          s.pend.shift(); s.tid++;
          if (!s.pend.length) begin();
          return true;
        }
        if (p !== s.turn) return false;
        if (a.t === 'pass') {
          if (!s.cur) return false;
          s.passed.push(p); s.tid++;
          emit({ k: 'pass', p });
          advance(p);
          return true;
        }
        if (a.t !== 'play' || !okIds(p, a.ids) || !a.ids.length || a.ids.length > 4 * D) return false;
        const ids = a.ids, r = rk(ids[0]), c = ids.length;
        if (!ids.every(id => rk(id) === r)) return false;
        if (s.cur) { if (c !== s.cur.n || prPw(r, s.rev) <= prPw(s.cur.r, s.rev)) return false; }
        else if (s.must >= 0 && !ids.includes(s.must)) return false;
        take(p, ids);
        s.cur = { p, ids: ids.slice(), r, n: c }; s.lead = p; s.must = -1; s.tid++;
        emit({ k: 'play', p, ids: ids.slice(), r, n: c });
        if (revOn && c >= 4) { s.rev = !s.rev; emit({ k: 'rev', on: s.rev }); }
        if (!act0(p)) { s.order.push(p); emit({ k: 'out', p, pos: s.order.length - 1 }); }
        const left = []; for (let q = 0; q < n; q++) if (act0(q)) left.push(q);
        if (left.length <= 1) { if (left.length) s.order.push(left[0]); endRound(); return true; }
        if (prPw(r, s.rev) === 15) clear(); else advance(p);
        return true;
      },
      view(p) {
        const must = s.phase === 'play' && p === s.turn && !s.cur && s.must >= 0 && s.hands[p].includes(s.must) ? s.must : -1;
        return { n, me: p, D, phase: s.phase, turn: s.phase === 'play' ? s.turn : -1, tid: s.tid, rid: s.rid, hand: p >= 0 ? prSort(s.hands[p]) : [], counts: s.hands.map(h => h.length), cur: s.cur && { p: s.cur.p, n: s.cur.n, r: s.cur.r, ids: s.cur.ids.slice() }, passed: s.passed.slice(), rev: s.rev, order: s.order.slice(), scores: s.scores.slice(), pts: s.pts.slice(), pos: s.pos && s.pos.slice(), round: s.round, rounds, pend: s.pend[0] ? { p: s.pend[0].p, to: s.pend[0].to, k: s.pend[0].k } : null, must, revOn, club };
      }
    };
  }

  function prFilter(e, q) {
    if (e.k === 'deal') return { k: 'deal', n: e.hands.length, D: e.D, mine: prSort(e.hands[q]), counts: e.hands.map(h => h.length), pos: e.pos };
    if (e.k === 'swap' && e.from !== q && e.to !== q) return { k: 'swap', from: e.from, to: e.to, n: e.ids.length };
    return e;
  }

  function prMem(n) { return { n, seen: new Set(), rev: false }; }
  function prObserve(m, e, q) {
    if (e.k === 'deal') { m.seen.clear(); m.rev = false; e.mine.forEach(id => m.seen.add(id)); }
    else if (e.k === 'play') e.ids.forEach(id => m.seen.add(id));
    else if (e.k === 'swap' && e.ids && (e.from === q || e.to === q)) e.ids.forEach(id => m.seen.add(id));
    else if (e.k === 'rev') m.rev = e.on;
  }

  function prMoves(V) {
    const by = {};
    V.hand.forEach(id => { (by[rk(id)] = by[rk(id)] || []).push(id); });
    const out = [];
    for (const k of Object.keys(by)) {
      const r = +k, g = V.must >= 0 && g0(by[r], V.must) ? by[r].slice().sort((a, b) => (a === V.must ? -1 : b === V.must ? 1 : 0)) : by[r];
      if (V.cur) {
        if (g.length >= V.cur.n && prPw(r, V.rev) > prPw(V.cur.r, V.rev)) out.push({ ids: g.slice(0, V.cur.n), r, n: V.cur.n, g: g.length });
      } else {
        if (V.must >= 0 && !g.includes(V.must)) continue;
        for (let c = 1; c <= g.length; c++) out.push({ ids: g.slice(0, c), r, n: c, g: g.length });
      }
    }
    return out;
  }
  const g0 = (g, id) => g.includes(id);

  function prOk(V, ids) {
    if (!ids.length || !ids.every(id => rk(id) === rk(ids[0]))) return false;
    const r = rk(ids[0]);
    if (V.cur) return ids.length === V.cur.n && prPw(r, V.rev) > prPw(V.cur.r, V.rev);
    return V.must < 0 || ids.includes(V.must);
  }

  function prGive(hand, k, level, R) {
    const by = {};
    hand.forEach(id => { by[rk(id)] = (by[rk(id)] || 0) + 1; });
    const sc = id => prBase(rk(id)) + (by[rk(id)] > 1 && level !== 'Easy' ? 7 : 0) + (level === 'Easy' ? R() * 8 : 0);
    return hand.slice().sort((a, b) => sc(a) - sc(b)).slice(0, k);
  }

  function prStrength(V, ids, rev) {
    let t = 0;
    for (const id of V.hand) if (!ids.includes(id)) t += prPw(rk(id), rev) - 9;
    return t;
  }

  function prSafe(V, m, r, n) {
    if (!m) return false;
    const unseen = {};
    for (let q = 2; q <= 14; q++) unseen[q] = 4 * V.D;
    m.seen.forEach(id => { unseen[rk(id)]--; });
    V.hand.forEach(id => { if (!m.seen.has(id)) unseen[rk(id)]--; });
    const pw = prPw(r, V.rev);
    for (let q = 2; q <= 14; q++) if (prPw(q, V.rev) > pw && unseen[q] >= n) return false;
    return true;
  }

  function prBot(V, p, level, m, R) {
    if (V.phase === 'swap') return V.pend && V.pend.p === p ? { t: 'swap', ids: prGive(V.hand, V.pend.k, level, R) } : null;
    if (V.phase !== 'play' || V.turn !== p) return null;
    const mv = prMoves(V), pw = x => prPw(x.r, V.rev), hl = V.hand.length;
    const opp = Math.min(...V.counts.filter((c, q) => q !== p && c > 0));
    const danger = opp <= 2;
    const out = mv.find(x => x.n === hl);
    const play = x => ({ t: 'play', ids: x.ids });
    if (out) return play(out);
    const rank = x => pw(x) + (x.g - x.n) * (level === 'Easy' ? 0 : level === 'Normal' ? 1 : 2.2);
    if (V.cur) {
      if (!mv.length) return { t: 'pass' };
      const c = mv.slice().sort((a, b) => rank(a) - rank(b));
      if (level === 'Easy') return R() < .15 ? { t: 'pass' } : play(c[Math.floor(R() * Math.min(3, c.length))]);
      const best = c[0], top = pw(best) >= 14 && V.cur.r !== 2;
      if (danger) {
        const safe = c.find(x => prSafe(V, m, x.r, x.n));
        return play(level === 'Expert' && safe ? safe : c[c.length - 1]);
      }
      if (top && hl > 4 && R() < (level === 'Normal' ? .35 : level === 'Hard' ? .6 : .8)) return { t: 'pass' };
      if (level !== 'Normal' && best.g > best.n && pw(best) >= 11 && hl > 6 && pw({ r: V.cur.r }) <= 8) return { t: 'pass' };
      return play(best);
    }
    let c = mv.slice();
    const quads = c.filter(x => x.n >= 4);
    if (V.revOn && quads.length) {
      const q = quads[0], now = prStrength(V, q.ids, V.rev), flip = prStrength(V, q.ids, !V.rev);
      if (level !== 'Easy' && flip > now + 4) return play(q);
      c = c.filter(x => x.n < 4);
      if (!c.length) c = quads;
    }
    if (level === 'Easy') return play(c[Math.floor(R() * c.length)]);
    const full = c.filter(x => x.n === x.g);
    const pool = full.length ? full : c;
    const score = x => pw(x) - (level === 'Normal' ? 0 : .7 * x.n) + (level === 'Expert' && prSafe(V, m, x.r, x.n) && hl > x.n + 1 ? 6 : 0);
    pool.sort((a, b) => score(a) - score(b));
    return play(pool[0]);
  }

  function prAuto(V, p, R) {
    if (V.phase === 'swap') return V.pend && V.pend.p === p ? { t: 'swap', ids: prGive(V.hand, V.pend.k, 'Normal', R) } : null;
    if (V.phase !== 'play' || V.turn !== p) return null;
    const mv = prMoves(V).sort((a, b) => prPw(a.r, V.rev) - prPw(b.r, V.rev) || b.n - a.n);
    if (!mv.length) return { t: 'pass' };
    const out = mv.find(x => x.n === V.hand.length);
    return { t: 'play', ids: (out || mv[0]).ids };
  }

  function prUI(sh) {
    const { Z, M } = sh;
    const CAP = 12;
    const S = { counts: [], sel: new Set(), cur: -1, tid: -2, pg: 0, flip: true, tap: [0, null] };
    S.reset = reset;
    const playB = sh.btn('Play', 'go', () => play());
    const passB = sh.btn('Pass', 'al', () => pass());
    const infoEl = mk('div', 'cg-claim');
    const revEl = KIT.lbl(sh, 'cg-rev');
    revEl.textContent = 'REVOLUTION: low beats high';
    sh.uiEl.append(infoEl);
    infoEl.hidden = true; revEl.hidden = true;
    const me = () => sh.mine();
    const sortHand = l => l.sort((a, b) => prBase(rk(a.id)) - prBase(rk(b.id)) || a.id - b.id);
    const mine = () => Z.list('hand:' + me());
    const pileAt = () => ({ x: sh.L.cx, y: sh.L.cy + 12, s: .5, up: false, r: 0 });
    const hs = (g, k) => { const x = Math.sin(g * 12.9898 + k * 78.233) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };

    Z.lay = (name, list) => {
      const L = sh.L, [kind, ps] = name.split(':'), p = +ps;
      if (kind === 'deck') return list.map((s, i) => ({ x: L.cx - i * .5, y: L.cy + 12 - i * .8, s: .52, r: 0, up: false, z: 2 + i }));
      if (kind === 'pile') {
        const gs = []; list.forEach(s => { if (!gs.includes(s.pg)) gs.push(s.pg); });
        const gap = L.port ? 24 : 34, sc = L.port ? .6 : .74;
        return list.map((s, i) => {
          const gi = gs.indexOf(s.pg), top = gi === gs.length - 1, k = list.filter(x => x.pg === s.pg), j = k.indexOf(s);
          const ox = top ? 0 : hs(s.pg, 1) * 46, oy = top ? 0 : hs(s.pg, 2) * 18;
          return { x: L.cx + ox + (j - (k.length - 1) / 2) * gap, y: L.cy + 14 + oy, s: sc, r: top ? hs(s.pg, 3) * 3 : hs(s.pg, 3) * 14, up: true, z: 5 + gi * 10 + j };
        });
      }
      if (kind === 'hand' && p === me()) return KIT.hand(sh, list, S.sel, S.cur, S.flip);
      if (kind === 'hand') return KIT.mini(sh, p, list);
      return [];
    };

    function reset() {
      S.counts = []; S.sel.clear(); S.cur = -1; S.tid = -2; S.flip = true; S.pg = 0;
      playB.hidden = passB.hidden = true; infoEl.hidden = true; revEl.hidden = true;
    }
    function place() {
      const L = sh.L;
      sh.at(playB, L.btn.x, L.btn.y); sh.at(passB, L.btn2.x, L.btn2.y);
      sh.at(infoEl, L.cx, L.cy - (L.port ? 92 : 100)); sh.at(revEl, L.cx, L.cy + (L.port ? 84 : 94));
    }
    function setInfo(small, big) {
      infoEl.hidden = !big;
      infoEl.innerHTML = big ? `<small>${esc(small)}</small><b>${esc(big)}</b>` : '';
      if (big && big.length > 12) infoEl.lastChild.style.fontSize = sh.port ? '22px' : '26px';
      place();
    }
    function info(V) {
      if (V.phase === 'end' || V.phase === 'done') setInfo('', '');
      else if (V.phase === 'swap') setInfo('Card swap', 'Trade up');
      else if (V.cur) setInfo(KIT.nm(sh, V.cur.p) + ' played', prDesc(V.cur.n, V.cur.r));
      else setInfo(V.turn >= 0 ? KIT.nm(sh, V.turn) + ' lead' + KIT.vb(sh, V.turn, '', 's') : '', 'Any set');
    }
    function subs(V) {
      for (let p = 0; p < V.n; p++) {
        const i = V.order.indexOf(p);
        sh.out(p, i >= 0);
        sh.sub(p, i >= 0 ? prOrd(i) + ' out' : V.passed.includes(p) ? 'Pass' : V.pos ? prTitle(V.pos[p], V.n) : '');
      }
    }
    function trashPile(keep) {
      const l = Z.zone('pile').list;
      l.slice().forEach(s => { if (keep && keep(s)) return; l.splice(l.indexOf(s), 1); s.zone = null; Z.trash(s); });
    }
    function trimPile() {
      const l = Z.zone('pile').list, gs = [];
      l.forEach(s => { if (!gs.includes(s.pg)) gs.push(s.pg); });
      const old = new Set(gs.slice(0, Math.max(0, gs.length - 3)));
      trashPile(s => !old.has(s.pg));
    }

    function sync(V, hard) {
      const m = me();
      S.counts = V.counts.slice(); S.sel.clear();
      Z.fit('hand:' + m, V.hand, pileAt(), true);
      sortHand(mine());
      for (let q = 0; q < V.n; q++) { if (q !== m) Z.count('hand:' + q, Math.min(CAP, V.counts[q]), KIT.spawn(sh, q)); sh.badge(q, V.counts[q]); }
      if (!V.cur) trashPile();
      else {
        const top = Z.zone('pile').list.filter(s => V.cur.ids.includes(s.id));
        if (top.length !== V.cur.ids.length) {
          trashPile();
          const g = ++S.pg;
          V.cur.ids.forEach(id => { const s = Z.get(id, null, pileAt()); s.pg = g; Z.put('pile', s); });
        }
      }
      revEl.hidden = !V.rev;
      Z.all2(hard ? 0 : .25);
      Z.sweep();
      info(V); subs(V); place();
    }

    async function swapAnim(e) {
      const m = me(), from = 'hand:' + e.from, to = 'hand:' + e.to, k = e.ids ? e.ids.length : e.n;
      const sprs = [];
      for (let i = 0; i < k; i++) {
        let s;
        if (e.ids && e.from === m) s = Z.get(e.ids[i], from, KIT.spawn(sh, e.from));
        else s = Z.anon(from, true) || Z.spawnAnon(KIT.spawn(sh, e.from));
        if (e.ids && e.to === m) Z.reveal(s, e.ids[i]);
        sprs.push(s);
      }
      sprs.forEach(s => { Z.put(to, s); if (e.to !== m) Z.hide(s); });
      S.counts[e.from] -= k; S.counts[e.to] += k;
      sh.badge(e.from, S.counts[e.from]); sh.badge(e.to, S.counts[e.to]);
      if (e.to === m) sortHand(mine());
      Z.relay(to, .5); Z.relay(from, .4);
      snd('take');
      const who = e.ids ? e.ids.map(cname).join(', ') : k + ' card' + (k > 1 ? 's' : '');
      if (e.to === m) sh.log('You receive ' + who + ' from ' + sh.name(e.from));
      else if (e.from === m) sh.log('You give ' + who + ' to ' + sh.name(e.to));
      else sh.log(sh.name(e.from) + ' gives ' + k + ' to ' + sh.name(e.to));
      await sh.wait(850);
      if (e.from !== m) Z.count(from, Math.min(CAP, S.counts[e.from]), KIT.spawn(sh, e.from));
      if (e.to !== m) Z.count(to, Math.min(CAP, S.counts[e.to]), KIT.spawn(sh, e.to));
    }

    async function event(e) {
      const m = me();
      if (e.k === 'deal') {
        const o = { at: pileAt, cap: CAP, sort: sortHand };
        await KIT.deal(sh, S, e, o);
        sh.seats.forEach((o2, p) => { o2.el.classList.remove('out'); sh.sub(p, e.pos ? prTitle(e.pos[p], e.n) : ''); });
        info({ phase: e.pos ? 'swap' : 'play', cur: null, turn: -1 });
        return;
      }
      if (e.k === 'swap') return swapAnim(e);
      if (e.k === 'turn') { sh.turn(e.p); await sh.wait(120); return; }
      if (e.k === 'play') {
        const p = e.p, from = 'hand:' + p, sprs = [], g = ++S.pg;
        for (const id of e.ids) {
          let s;
          if (p === m) s = Z.get(id, from, KIT.spawn(sh, p));
          else { s = Z.anon(from, true) || Z.spawnAnon(KIT.spawn(sh, p)); Z.reveal(s, id); }
          s.pg = g; sprs.push(s); Z.put('pile', s);
        }
        S.counts[p] -= e.n; S.sel.clear();
        trimPile();
        Z.relay('pile', .45, .04); Z.relay(from, .35);
        snd('place');
        sh.badge(p, S.counts[p]);
        sh.say(p, prDesc(e.n, e.r), 1600);
        setInfo(KIT.nm(sh, p) + ' played', prDesc(e.n, e.r));
        sh.log(KIT.nm(sh, p) + ' play' + KIT.vb(sh, p, '', 's') + ' ' + prDesc(e.n, e.r).toLowerCase());
        await sh.wait(620);
        if (p !== m) Z.count(from, Math.min(CAP, S.counts[p]), KIT.spawn(sh, p));
        return;
      }
      if (e.k === 'pass') {
        sh.say(e.p, 'Pass', 1200); snd('pass'); sh.sub(e.p, 'Pass');
        sh.log(KIT.nm(sh, e.p) + ' pass' + KIT.vb(sh, e.p, '', 'es'));
        await sh.wait(380);
        return;
      }
      if (e.k === 'rev') {
        revEl.hidden = !e.on;
        sh.banner(e.on ? 'REVOLUTION!' : 'Order restored', e.on ? 'red' : 'grn', 1700);
        snd(e.on ? 'cheat' : 'ping');
        sh.log(e.on ? 'Revolution: low cards now beat high cards' : 'Revolution reversed: high cards win again');
        await sh.wait(1000);
        return;
      }
      if (e.k === 'out') {
        sh.out(e.p, true); sh.sub(e.p, prOrd(e.pos) + ' out');
        sh.say(e.p, e.pos === 0 ? 'President!' : 'Out!', 1800);
        sh.mood(e.p, 'h', 1800);
        sh.banner(KIT.nm(sh, e.p) + (e.p === m ? ' are out: ' : ' is out: ') + prOrd(e.pos), e.p === m ? 'grn' : '', 1500);
        sh.log(KIT.nm(sh, e.p) + (e.p === m ? ' go out ' : ' goes out ') + '(' + prOrd(e.pos) + ')');
        snd(e.p === m ? 'win' : 'ping');
        await sh.wait(900);
        return;
      }
      if (e.k === 'clear') {
        const l = Z.zone('pile').list.slice(), a = sh.seatPos(e.to);
        Z.zone('pile').list.length = 0;
        l.forEach((s, i) => { s.zone = null; s.to({ x: a.x, y: a.y, s: .3, r: s.r + 20 }, .5, i * .02); setTimeout(() => Z.trash(s), 560); });
        snd('slide');
        sh.log(e.p === e.to ? KIT.nm(sh, e.p) + ' clear' + KIT.vb(sh, e.p, '', 's') + ' the table' : 'The table clears, ' + KIT.nm(sh, e.to) + ' lead' + KIT.vb(sh, e.to, '', 's'));
        setInfo('', '');
        sh.seats.forEach((o2, p) => { if (!o2.el.classList.contains('out')) sh.sub(p, ''); });
        await sh.wait(600);
        return;
      }
      if (e.k === 'end') {
        sh.turn(-1); setInfo('', ''); trashPile();
        snd('win');
        sh.banner(e.done ? 'Match over' : 'Round over', 'grn', 1800);
        await sh.wait(900);
      }
    }

    const canAct = () => { const V = M.V; return !!V && sh.canAct() && !M.hold; };
    const swapMe = () => { const V = M.V; return !!V && V.phase === 'swap' && V.pend && V.pend.p === me() && canAct(); };
    const turnMe = () => { const V = M.V; return !!V && V.phase === 'play' && V.turn === me() && canAct(); };
    const maxSel = () => swapMe() ? M.V.pend.k : M.V.cur ? M.V.cur.n : 4 * M.V.D;
    const selIds = () => mine().map(s => s.id).filter(id => S.sel.has(id));
    const legal = () => { const ids = selIds(); return swapMe() ? ids.length === M.V.pend.k : turnMe() && prOk(M.V, ids); };

    function play() {
      if (!legal()) { snd('bad'); return; }
      const swap = swapMe(), a = swap ? { t: 'swap', ids: selIds() } : { t: 'play', ids: selIds() };
      if (sh.act(a)) { S.sel.clear(); playB.hidden = true; passB.hidden = true; sh.hint(null); }
    }
    function pass() { if (turnMe() && M.V.cur && sh.act({ t: 'pass' })) { S.sel.clear(); playB.hidden = true; passB.hidden = true; sh.hint(null); } }
    function toggle(spr) {
      const id = spr.id;
      if (S.sel.has(id)) S.sel.delete(id);
      else {
        const first = Array.from(S.sel)[0];
        if (!swapMe() && first != null && rk(first) !== rk(id)) S.sel.clear();
        if (S.sel.size >= maxSel()) { if (maxSel() === 1 || swapMe()) { const f = Array.from(S.sel)[0]; S.sel.delete(f); } else S.sel.clear(); }
        S.sel.add(id);
      }
      controls(M.V);
    }
    function controls(V) {
      const sw = swapMe(), tm = turnMe(), my = sw || tm;
      if (V.tid !== S.tid) { S.tid = V.tid; S.sel.clear(); S.cur = -1; }
      if (!my) { S.sel.clear(); S.cur = -1; }
      const have = new Set(V.hand);
      Array.from(S.sel).forEach(id => { if (!have.has(id)) S.sel.delete(id); });
      const mv = tm ? prMoves(V) : [], ok = new Set(mv.map(x => x.r));
      mine().forEach(s => {
        s.cls('hot', my); s.cls('sel', S.sel.has(s.id));
        s.cls('glow', tm && ok.has(rk(s.id)) && !S.sel.has(s.id) && !S.sel.size);
        s.cls('dim', tm && !ok.has(rk(s.id)));
      });
      const lg = legal();
      playB.hidden = !my;
      playB.disabled = !lg;
      playB.classList.toggle('hot', lg);
      playB.textContent = sw ? 'Give ' + V.pend.k : S.sel.size ? 'Play ' + S.sel.size : 'Play';
      passB.hidden = !(tm && V.cur);
      passB.classList.toggle('hot', tm && !!V.cur && !mv.length);
      if (sw) sh.hint('Pick ' + V.pend.k + ' card' + (V.pend.k > 1 ? 's' : '') + ' to give to ' + sh.name(V.pend.to) + ' (' + S.sel.size + '/' + V.pend.k + ')');
      else if (tm) {
        if (V.must >= 0) sh.hint('You lead: start with the 3 of clubs');
        else if (V.cur) sh.hint(mv.length ? 'Beat the ' + prDesc(V.cur.n, V.cur.r).toLowerCase() + ' or pass' : 'Nothing beats it. Pass');
        else sh.hint('You lead: play any set of equal cards');
      } else if (V.phase === 'swap' && V.pend) sh.hint(sh.name(V.pend.p) + ' is choosing cards to give');
      else sh.hint(null);
      revEl.hidden = !V.rev;
      info(V); subs(V); place();
      Z.relay('hand:' + me(), .15);
    }

    return {
      reset, sync, event, controls, place,
      turnOf: V => V.phase === 'swap' ? (V.pend ? V.pend.p : -1) : V.turn,
      tap(spr) {
        if (!my0() || !spr.zone || spr.zone.name !== 'hand:' + me() || spr.id < 0) return;
        const now = performance.now();
        if (S.tap[1] === spr && now - S.tap[0] < 380 && !swapMe()) {
          const r = rk(spr.id), mx = maxSel(), same = mine().filter(s => rk(s.id) === r).map(s => s.id);
          if (same.every(id => S.sel.has(id)) && S.sel.size === same.length) same.forEach(id => S.sel.delete(id));
          else { S.sel.clear(); same.slice(0, mx).forEach(id => S.sel.add(id)); }
          S.tap = [0, null]; snd('pick'); controls(M.V);
          return;
        }
        S.tap = [now, spr];
        snd('pick'); toggle(spr);
      },
      key(e) {
        const k = e.key;
        if (!my0()) return false;
        const l = mine();
        if (k === 'ArrowLeft' || k === 'ArrowRight') {
          S.cur = S.cur < 0 ? (k === 'ArrowRight' ? 0 : l.length - 1) : clamp(S.cur + (k === 'ArrowRight' ? 1 : -1), 0, l.length - 1);
          snd('pick'); controls(M.V);
          return true;
        }
        if ((k === ' ' || k === 'ArrowUp' || k === 'ArrowDown') && l[S.cur]) { toggle(l[S.cur]); return true; }
        if ((k === 'a' || k === 'A') && l[S.cur] && !swapMe()) {
          const r = rk(l[S.cur].id);
          S.sel.clear(); l.filter(s => rk(s.id) === r).slice(0, maxSel()).forEach(s => S.sel.add(s.id));
          controls(M.V);
          return true;
        }
        if (k === 'Enter') { play(); return true; }
        if (k === 'p' || k === 'P') { pass(); return true; }
        return false;
      },
      results(V) {
        const m = me(), n = V.n, ord = V.order;
        const rows = ord.map((p, i) => ({ p, win: i === 0, cols: [prTitle(i, n), '+' + V.pts[p], V.scores[p]] }));
        const mi = ord.indexOf(m), t = prTitle(mi, n);
        let title = 'You are ' + (t === 'Neutral' ? 'Neutral' : 'the ' + t) + (mi === 0 ? '!' : '');
        let sub = 'Round ' + V.round + ' of ' + V.rounds + '.';
        let won = false;
        if (V.phase === 'done') {
          const best = Math.max(...V.scores), w = V.scores.map((x, p) => x === best ? p : -1).filter(p => p >= 0);
          won = w.includes(m);
          title = won ? (w.length > 1 ? 'You tied for the win!' : 'You win the match!') : sh.name(w[0]) + ' wins the match';
          sub = 'Final scores after ' + V.rounds + ' rounds.';
        }
        return { html: KIT.res(sh, { kick: V.phase === 'done' ? 'Match over' : 'President', title, sub, heads: ['Title', 'Round', 'Total'], rows, next: V.phase === 'end' ? 'Next round' : null }), sound: mi === 0 || won ? 'win' : mi === n - 1 ? 'lose' : 'ping', score: V.phase === 'done' ? (won ? 1 : 0) : null };
      }
    };
    function my0() { return swapMe() || turnMe(); }
  }

  const PRG = {
    id: 'president', title: 'President', tag: 'Shed your cards first. Rise to President, and make the Scum pay.', min: 3, max: 8, n0: 5,
    rules0: { decks: 0, rounds: 3, start: 'club', rev: 'on' },
    schema: [
      { k: 'rounds', label: 'Rounds', vals: [[3, '3'], [5, '5'], [8, '8']] },
      { k: 'start', label: 'First lead', info: 'Round one only', vals: [['club', '3 of clubs'], ['any', 'Random']] },
      { k: 'rev', label: 'Revolution', info: 'Four of a kind flips the order', vals: [['on', 'On'], ['off', 'Off']] },
      { k: 'decks', label: 'Decks', info: 'Auto adds a second deck from seven players', vals: [[0, 'Auto'], [1, '1 deck'], [2, '2 decks']] }
    ],
    help: '<p>Be the first to get rid of your cards. The lead plays a set of equal cards (one to four). Everyone after must play the <b>same number</b> of cards of a <b>higher rank</b>, or pass. <b>2s are highest</b>, then A, K ... down to 3. Once you pass you are out of that trick. When everyone else has passed, or a 2 (the top card) is played, the table clears and the last player to play leads again.</p><p>Finishing order gives <b>President, Vice President, Neutral, Vice-Scum, Scum</b>. Next round the Scum hands the best cards to the President (2 cards, 1 for the Vice ranks) and the President returns any cards they choose. The President leads.</p><p><b>Revolution:</b> four of a kind reverses the order of ranks until another four of a kind. Round one starts with the 3 of clubs.</p><p>Click cards (double-click takes every copy of a rank), then <b>Play</b>. <kbd>Left</kbd>/<kbd>Right</kbd> and <kbd>Space</kbd> select, <kbd>A</kbd> all of a rank, <kbd>Enter</kbd> plays, <kbd>P</kbd> passes.</p>',
    engine: prEngine, filter: prFilter, mem: prMem, observe: prObserve, bot: prBot, auto: prAuto, ui: prUI
  };

  Ameplay.register({
    id: 'go-fish',
    title: 'Go Fish',
    category: 'Board',
    tint: '#2f9bd6',
    blurb: 'Ask for a rank, fish from the stock and lay down books of four. Two to six players, bots at four levels, online.',
    help: 'Tap a card, tap a player, press Ask &middot; <kbd>&larr;</kbd><kbd>&rarr;</kbd> rank &middot; <kbd>&uarr;</kbd><kbd>&darr;</kbd> player &middot; <kbd>Enter</kbd> asks',
    width: 960,
    format: v => v + (v === 1 ? ' book' : ' books'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 32c8-13 24-15 36-5l14-9v28l-14-9C30 47 14 45 6 32z"/><circle cx="19" cy="29" r="1.8" fill="currentColor"/><path d="M28 24c3 5 3 11 0 16"/></svg>',
    _t: { engine: gfEngine, filter: gfFilter, mem: gfMem, observe: gfObserve, bot: gfBot, auto: gfAuto },
    css: cssFor('go-fish', ''),
    mount(root, api) { boot(GF, root, api); }
  });

  Ameplay.register({
    id: 'old-maid',
    title: 'Old Maid',
    category: 'Board',
    tint: '#b266d6',
    blurb: 'Draw from your neighbour, lay down pairs and never get stuck with the Old Maid. Bots with tells, two to six players, online.',
    help: 'Click a card to draw it (phones: tap twice) &middot; <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> &middot; <kbd>S</kbd> shuffle your hand',
    width: 960,
    format: v => v + ' beaten',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="8" width="36" height="48" rx="5"/><circle cx="32" cy="26" r="8"/><path d="M18 52c2-9 8-13 14-13s12 4 14 13M26 20c2-5 10-5 12 0"/></svg>',
    _t: { engine: omEngine, filter: omFilter, mem: omMem, observe: omObserve, bot: omBot, auto: omAuto },
    css: cssFor('old-maid', ''),
    mount(root, api) { boot(OMG, root, api); }
  });
  Ameplay.register({
    id: 'cheat',
    title: 'Cheat',
    category: 'Board',
    tint: '#d6584a',
    blurb: 'Play face down, claim the rank and shout Cheat! when you smell a bluff. Card-counting bots, three to eight players, online.',
    help: 'Click cards then Play &middot; double-click takes every copy &middot; <kbd>C</kbd> call Cheat &middot; <kbd>Space</kbd> let it go &middot; <kbd>&larr;</kbd><kbd>&rarr;</kbd> <kbd>Space</kbd> <kbd>Enter</kbd>',
    width: 960,
    format: v => v + ' won',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="28" height="40" rx="4"/><rect x="24" y="14" width="28" height="40" rx="4" transform="rotate(10 38 34)"/><path d="M34 30l8 8M42 30l-8 8"/></svg>',
    _t: { engine: chEngine, filter: chFilter, mem: chMem, observe: chObserve, bot: chBot, auto: chAuto },
    css: cssFor('cheat', ''),
    mount(root, api) { boot(CHG, root, api); }
  });
  Ameplay.register({
    id: 'president',
    title: 'President',
    category: 'Board',
    tint: '#c9a227',
    blurb: 'Shed your cards, rise to President and make the Scum hand over their best. Revolutions, card swaps, three to eight players, online.',
    help: 'Click cards then Play &middot; double-click takes every copy &middot; <kbd>&larr;</kbd><kbd>&rarr;</kbd> <kbd>Space</kbd> <kbd>Enter</kbd> &middot; <kbd>P</kbd> pass',
    width: 960,
    format: v => v + ' won',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 44l6-24 12 12 4-18 4 18 12-12 6 24z"/><path d="M12 52h40"/></svg>',
    _t: { engine: prEngine, filter: prFilter, mem: prMem, observe: prObserve, bot: prBot, auto: prAuto },
    css: cssFor('president', ''),
    mount(root, api) { boot(PRG, root, api); }
  });

})();
