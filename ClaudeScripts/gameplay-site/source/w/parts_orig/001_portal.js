(() => {
'use strict';
const CATS = ['3D', 'Arcade', 'Action', 'Racing', 'Sports', 'Puzzle', 'Board', 'Reflex', 'Timing', 'Memory', 'Quiz', 'Skill', 'Idle'];
const RECAT = { racer: 'Racing', '2048': 'Puzzle', shooter: 'Action', minesweeper: 'Puzzle', clicker: 'Idle', 'word-guess': 'Puzzle', golf: 'Sports', 'connect-four': 'Board', tictactoe: 'Board', slide: 'Puzzle', 'lights-out': 'Puzzle' };
const ORDER = ['blockcraft-3d', 'dash-cube', 'sky-runner', 'road-hopper', 'slither', 'flap-bird', 'brick-bros', 'rocket-soccer', 'slope-3d', 'tunnel-run', 'fling-birds', 'bomb-blast', 'fire-water', 'paper-land', 'cell-feast', 'hole-city', 'garden-defense', 'night-survivors', 'demon-halls', 'bean-royale', 'hoop-flop', 'maze-tanks', 'last-card', 'candy-rope', 'moto-stunts', 'cookie-baker', 'block-roll', 'marble-chain', 'sea-battle', 'snake', 'highway-3d', 'racer', 'tetra', '2048', 'shooter', 'hill-climb', 'pool', 'helix-3d', 'dino-run', 'reaction', 'chess', 'minesweeper', 'hoops-3d', 'clicker', 'fruit-slice', 'word-guess', 'sky-pilot', 'golf', 'tanks-3d', 'bubble-pop', 'pairs', 'target-range-3d', 'breakout', 'asteroids', 'penalty-3d', 'stack', 'sudoku', 'marble-3d', 'trivia', 'invaders', 'bowling-3d', 'kart-circuit', 'aim', 'maze-3d', 'connect-four', 'gem-swap', 'asteroids-3d', 'glide', 'jetpack', 'cube-3d', 'solitaire', 'perfect-stop', 'piano-tiles', 'math-sprint', 'tower-defense', 'whack', 'air-hockey', 'typing', 'maze-muncher', 'rhythm', 'checkers', 'pong', 'sky-jump', 'tictactoe', 'archery', 'sequence', 'pinball', 'slide', 'box-pusher', 'number-memory', 'reversi', 'lights-out', 'pipe-connect', 'knife-throw', 'stick-bridge', 'cps-test', 'chimp-test', 'hangman', 'true-false', 'deep-miner'];
const NEW = ['slope-3d', 'tunnel-run', 'rocket-soccer', 'hole-city', 'demon-halls', 'bean-royale', 'block-roll', 'flap-bird', 'slither', 'cell-feast', 'paper-land', 'fling-birds', 'candy-rope', 'brick-bros', 'garden-defense', 'night-survivors', 'bomb-blast', 'last-card', 'fire-water', 'maze-tanks', 'hoop-flop', 'sea-battle', 'marble-chain', 'moto-stunts', 'cookie-baker'];
const MP = ['rocket-soccer', 'bomb-blast', 'fire-water', 'hoop-flop', 'maze-tanks', 'last-card', 'sea-battle', 'pool', 'air-hockey', 'pong', 'chess', 'checkers', 'connect-four', 'reversi', 'tictactoe'];
const POPULAR = ['blockcraft-3d', 'dash-cube', 'sky-runner', 'slither', 'road-hopper', 'flap-bird', 'rocket-soccer', 'brick-bros', 'bomb-blast'];
const HOT = ['blockcraft-3d', 'dash-cube', 'slither', 'rocket-soccer', 'bomb-blast', 'slope-3d', 'fire-water', 'hoop-flop', 'sky-runner'];
const TINT = { reaction: '#ff6b6b', snake: '#4cc38a', '2048': '#f5a623', racer: '#5b8def', 'perfect-stop': '#a06cd5', pairs: '#ff8fab', trivia: '#ffd166', aim: '#ef476f', golf: '#7bd389', minesweeper: '#8d99ae', shooter: '#3d348b', stack: '#ff9f68', sequence: '#06d6a0', 'math-sprint': '#118ab2', whack: '#9bc53d', breakout: '#e76f51', tictactoe: '#48cae4', typing: '#6d597a', glide: '#90e0ef', rhythm: '#7209b7', 'word-guess': '#6aaa64', slide: '#f28482', pong: '#2b2d42', 'connect-four': '#4361ee', 'number-memory': '#f72585', clicker: '#e9c46a', 'lights-out': '#22223b',
  'sky-runner': '#ff7a59', 'road-hopper': '#7ed957', 'helix-3d': '#ff4d8d', 'highway-3d': '#3a86ff', 'sky-pilot': '#4cc9f0', 'marble-3d': '#9b5de5', 'hoops-3d': '#f77f00', 'bowling-3d': '#8338ec', 'penalty-3d': '#2a9d8f', 'maze-3d': '#577590', 'target-range-3d': '#d62828', 'tanks-3d': '#6a994e', 'cube-3d': '#ffbe0b', 'asteroids-3d': '#14213d', 'blockcraft-3d': '#52b788',
  'dino-run': '#f4a261', 'sky-jump': '#a2d2ff', 'dash-cube': '#00b4d8', jetpack: '#fb5607', 'stick-bridge': '#6d6875', asteroids: '#1b263b', invaders: '#240046', 'maze-muncher': '#023e8a', pinball: '#c1121f', 'tower-defense': '#588157', 'fruit-slice': '#ff006e', 'hill-climb': '#f6bd60', 'kart-circuit': '#ef233c', pool: '#1b4332', 'air-hockey': '#00a6fb', archery: '#bc6c25', 'knife-throw': '#9d4edd', 'piano-tiles': '#212529', tetra: '#5e60ce', 'bubble-pop': '#48bfe3', 'gem-swap': '#b5179e', 'box-pusher': '#b08968', 'pipe-connect': '#0096c7', chess: '#495057', checkers: '#9e2a2b', reversi: '#2d6a4f', solitaire: '#386641', sudoku: '#4895ef', 'cps-test': '#ff595e', 'chimp-test': '#8ac926', hangman: '#ffca3a', 'true-false': '#1982c4', 'deep-miner': '#6f4518' };
const CAT_TINT = { '3D': '#6c5ce7', Arcade: '#ff6b6b', Action: '#d62828', Racing: '#3a86ff', Sports: '#2a9d8f', Puzzle: '#4361ee', Board: '#495057', Reflex: '#f5a623', Timing: '#a06cd5', Memory: '#06d6a0', Quiz: '#ffb703', Skill: '#ef476f', Idle: '#bc6c25' };
const C = Object.freeze({
  bg: '#ffffff', surface: '#ffffff', sunk: '#f3f4f7', sunk2: '#e9ebf0', line: '#e6e8ee', line2: '#d4d8e0',
  ink: '#1f1d2b', ink2: '#3d3a4d', muted: '#6e6c80', soft: '#a3a1b3',
  accent: '#6c5ce7', good: '#22b07d', bad: '#ef4f4f',
  tones: ['#fff3d6', '#ffe1a1', '#ffc86e', '#ffaa4d', '#ff8a3d', '#f6663a', '#e3463f', '#c53352', '#8e2a63', '#4a1f5c'],
  hues: ['#ef5350', '#ffa726', '#26b37a', '#3d8bfd', '#a855f7', '#6c5ce7']
});
const KEY = 'gameplay:v1';
let S = null;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!S || typeof S !== 'object') S = {};
S.best = S.best || {}; S.plays = S.plays || {}; S.recent = Array.isArray(S.recent) ? S.recent : []; S.muted = !!S.muted;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

(() => {
  const rr = function (x, y, w, h, r) {
    const a = Array.isArray(r) ? r : [r == null ? 0 : r], v = q => typeof q === 'number' ? q : (q && q.x) || 0;
    let tl, tr, br, bl;
    if (a.length === 1) tl = tr = br = bl = v(a[0]);
    else if (a.length === 2) { tl = br = v(a[0]); tr = bl = v(a[1]); }
    else if (a.length === 3) { tl = v(a[0]); tr = bl = v(a[1]); br = v(a[2]); }
    else { tl = v(a[0]); tr = v(a[1]); br = v(a[2]); bl = v(a[3]); }
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    const m = Math.min(w, h) / 2;
    tl = Math.min(tl, m); tr = Math.min(tr, m); br = Math.min(br, m); bl = Math.min(bl, m);
    this.moveTo(x + tl, y);
    this.arcTo(x + w, y, x + w, y + h, tr);
    this.arcTo(x + w, y + h, x, y + h, br);
    this.arcTo(x, y + h, x, y, bl);
    this.arcTo(x, y, x + w, y, tl);
    this.closePath();
  };
  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = rr;
  if (window.Path2D && !Path2D.prototype.roundRect) Path2D.prototype.roundRect = rr;
  if (!Element.prototype.requestPointerLock) Element.prototype.requestPointerLock = function () {
    setTimeout(() => document.dispatchEvent(new Event('pointerlockerror')), 0);
    const p = Promise.reject(new Error('Pointer lock is not supported')); p.catch(() => {}); return p;
  };
  if (!document.exitPointerLock) document.exitPointerLock = () => {};
  try { if (!navigator.vibrate) navigator.vibrate = () => false; } catch (e) {}
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    const live = new Set();
    const Tracked = function (...a) { const c = new AC(...a); live.add(c); return c; };
    Tracked.prototype = AC.prototype;
    window.AudioContext = Tracked; window.webkitAudioContext = Tracked;
    const unlock = () => live.forEach(c => { if (c.state === 'closed') live.delete(c); else if (c.state !== 'running') c.resume().catch(() => {}); });
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach(t => addEventListener(t, unlock, { capture: true, passive: true }));
  }
})();

const games = [], byId = new Map();
const Ameplay = window.Ameplay = {
  colors: C,
  covers: {},
  register(g) {
    if (!g || typeof g.id !== 'string' || typeof g.mount !== 'function') return console.warn('[gameplay] invalid game', g);
    if (byId.has(g.id)) games.splice(games.indexOf(byId.get(g.id)), 1);
    if (g.tint && !TINT[g.id]) TINT[g.id] = g.tint;
    if (RECAT[g.id]) g.category = RECAT[g.id];
    if (!CATS.includes(g.category)) g.category = 'Arcade';
    if (g.category === '3D') g.is3d = true;
    games.push(g); byId.set(g.id, g);
  }
};

const TONES = { tap: [520, .05, 'sine', .05], tick: [1200, .025, 'square', .015], good: [660, .12, 'sine', .07, 990], bad: [200, .2, 'triangle', .08, 110], win: [523, .35, 'sine', .07, 1046], lose: [330, .4, 'sine', .07, 140], hit: [140, .08, 'triangle', .1, 70], pop: [880, .06, 'sine', .05, 440] };
let ac = null;
function sfx(name) {
  const t = TONES[name];
  if (S.muted || !t) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const [f, d, type, vol, f2] = t, now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
    g.gain.setValueAtTime(.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + .01);
    g.gain.exponentialRampToValueAtTime(.0001, now + d);
    o.connect(g).connect(ac.destination); o.start(now); o.stop(now + d + .03);
  } catch (e) {}
}

const $ = s => document.querySelector(s);
const frame = $('#frame'), toastEl = $('#toast'), gamebox = $('#gamebox');
const BASE_TITLE = document.title;
const fmt = (g, v) => v == null ? '—' : g.format ? g.format(v) : String(v);
const isField = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
const filter = { cat: 'All', q: '' };
let cur = null, ov = null, toastTimer = 0;

function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}
function setBest(g, bump) {
  const b = $('#pBest'); b.textContent = fmt(g, S.best[g.id]);
  if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}

const glSet = new Set();
let fsScale = 1, fsT = [0, 0], fitRaf = 0, fitTimer = 0;
const c2Set = new Set();
const gpBudget = () => Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * Math.pow(window.devicePixelRatio || 1, 2) * 1.05);
function applyGlScale(s) {
  const want = Math.max(1, Math.min(4, (window.devicePixelRatio || 1) * Math.max(1, s))), B = gpBudget();
  glSet.forEach(e => {
    try {
      const { renderer, THREE } = e, v = renderer.getSize(new THREE.Vector2());
      let pr = Math.min(want, Math.sqrt(B / Math.max(1, v.x * v.y)));
      if (e.cap) pr = Math.min(pr, e.cap);
      if (Math.abs(renderer.getPixelRatio() - pr) < 0.01) return;
      e.own = true; renderer.setPixelRatio(pr); renderer.setSize(v.x, v.y, false); e.own = false;
    } catch (x) { e.own = false; }
  });
  c2Set.forEach(e => { try { gpRaster(e, Math.min(want, Math.sqrt(B / Math.max(1, e.w * e.h)))); } catch (x) {} });
}
const GP_CTX = ['fillStyle', 'strokeStyle', 'font', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'direction', 'letterSpacing', 'filter', 'lineDashOffset'];
function gpRaster(e, d, force) {
  if (e.manual && !force) return;
  d = force ? d : Math.round(d * 20) / 20;
  if (Math.abs(e.d - d) < 0.05 && !force) return;
  e.busy = true;
  try { gpRaster2(e, d); } finally { e.busy = false; }
}
function gpRaster2(e, d) {
  const c = e.canvas, ctx = e.ctx, st = {};
  GP_CTX.forEach(k => { if (k in ctx) st[k] = ctx[k]; });
  const dash = ctx.getLineDash ? ctx.getLineDash() : null, m = ctx.getTransform(), tmp = document.createElement('canvas');
  tmp.width = c.width; tmp.height = c.height;
  if (c.width && c.height) tmp.getContext('2d').drawImage(c, 0, 0);
  c.width = Math.round(e.w * d); c.height = Math.round(e.h * d);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  if (tmp.width && tmp.height) ctx.drawImage(tmp, 0, 0, c.width, c.height);
  GP_CTX.forEach(k => { if (k in st) { try { ctx[k] = st[k]; } catch (x) {} } });
  if (dash && ctx.setLineDash) ctx.setLineDash(dash);
  const k = d / e.d;
  ctx.setTransform(m.a * k, m.b * k, m.c * k, m.d * k, m.e * k, m.f * k);
  e.d = d;
}
function fitFullscreen() {
  const frameEl = document.getElementById('frame'), box = document.getElementById('gamebox');
  if (document.fullscreenElement !== box) {
    if (fsScale !== 1) { frameEl.style.transform = ''; fsScale = 1; applyGlScale(1); }
    return;
  }
  const st = box.querySelector('.play-stage'), root = frameEl.querySelector('.g-root');
  if (!root || !frameEl.offsetWidth) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const el of root.children) {
    if (!el.offsetWidth || !el.offsetHeight) continue;
    const pos = getComputedStyle(el).position;
    if (pos === 'absolute' || pos === 'fixed') continue;
    x0 = Math.min(x0, el.offsetLeft); y0 = Math.min(y0, el.offsetTop);
    x1 = Math.max(x1, el.offsetLeft + el.offsetWidth); y1 = Math.max(y1, el.offsetTop + el.offsetHeight);
  }
  if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = root.offsetWidth; y1 = root.offsetHeight; }
  const cx = root.offsetLeft + x0, cy = root.offsetTop + y0, cw = x1 - x0, ch = y1 - y0;
  const pad = 18, sw = st.clientWidth, sh = st.clientHeight;
  const s = Math.max(0.3, Math.min((sw - pad * 2) / cw, (sh - pad * 2) / ch, 4));
  const tx = (sw - cw * s) / 2 - frameEl.offsetLeft - cx * s, ty = (sh - ch * s) / 2 - frameEl.offsetTop - cy * s;
  if (fsScale !== 1 && Math.abs(s / fsScale - 1) < 0.03 && Math.abs(tx - fsT[0]) < 10 && Math.abs(ty - fsT[1]) < 10) return;
  frameEl.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  fsScale = s; fsT = [tx, ty]; applyGlScale(s);
}
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitFullscreen); };

const libP = {};
const libUrl = n => (PATH_MODE ? location.origin + '/' : new URL('.', location.href).href) + 'gameplay/' + n;
function loadLib(name, urls) {
  if (window[name]) return Promise.resolve(window[name]);
  return libP[name] || (libP[name] = new Promise((res, rej) => {
    const tryAt = i => {
      if (i >= urls.length) { delete libP[name]; rej(new Error(name + ' failed to load')); return; }
      const s = document.createElement('script');
      s.src = urls[i]; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => window[name] ? res(window[name]) : tryAt(i + 1);
      s.onerror = () => { s.remove(); tryAt(i + 1); };
      document.head.append(s);
    };
    tryAt(0);
  }));
}
const loadThree = () => loadLib('THREE', [libUrl('three-r128.min.js'), 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', 'https://unpkg.com/three@0.128.0/build/three.min.js']);
let invite = null;
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const loadPeer = () => loadLib('Peer', [libUrl('peerjs-1.5.4.min.js'), 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js']);
function netErr(e) {
  const t = e && e.type;
  if (t === 'peer-unavailable') return 'Room not found. Check the code and try again.';
  if (t === 'room-full') return 'That room already has two players.';
  if (t === 'browser-incompatible') return 'This browser can’t play online.';
  if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed' || t === 'load') return 'Can’t reach the online server. Check your internet connection.';
  return 'Connection failed. Try again.';
}
function makeNet(g, add) {
  const ls = {};
  const emit = (t, d) => (ls[t] || []).slice().forEach(f => { try { f(d); } catch (e) { console.error(e); } });
  let peer = null, conn = null, hb = 0, lastRx = 0, gen = 0;
  const pid = code => 'gameplay-' + g.id + '-' + code;
  const wait = (p, ms, type) => new Promise((res, rej) => {
    const t = setTimeout(() => rej({ type }), ms);
    p(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
  });
  const drop = () => {
    if (!conn) return;
    conn = null; clearInterval(hb);
    emit('close');
  };
  const attach = c => {
    conn = c; lastRx = performance.now();
    c.on('data', d => {
      lastRx = performance.now();
      if (d && d.__hb) { try { c.send({ __hr: d.__hb }); } catch (e) {} return; }
      if (d && d.__hr) { net.rtt = Math.round(performance.now() - d.__hr); return; }
      if (d && (d.__hi || d.__full)) return;
      emit('data', d);
    });
    c.on('close', () => { if (conn === c) drop(); });
    c.on('error', () => { if (conn === c) drop(); });
    clearInterval(hb);
    hb = setInterval(() => {
      if (conn !== c) return clearInterval(hb);
      try { c.send({ __hb: performance.now() }); } catch (e) {}
      if (performance.now() - lastRx > 6000) drop();
    }, 1000);
    emit('open', net.role);
  };
  const newPeer = async id => {
    let Peer;
    try { Peer = await loadPeer(); } catch (e) { throw { type: 'load' }; }
    const p = new Peer(id, { debug: 0 });
    try { await wait((res, rej) => { p.on('open', res); p.on('error', rej); }, 12000, 'network'); }
    catch (e) { try { p.destroy(); } catch (x) {} throw e; }
    p.on('error', e => emit('error', e));
    p.on('disconnected', () => { try { if (!p.destroyed) p.reconnect(); } catch (e) {} });
    return p;
  };
  const net = {
    role: null, code: null, rtt: 0,
    get connected() { return !!(conn && conn.open); },
    get invite() { return invite && invite.id === g.id ? invite.code : null; },
    on(t, fn) { (ls[t] = ls[t] || []).push(fn); const off = () => { ls[t] = (ls[t] || []).filter(f => f !== fn); }; add(off); return off; },
    send(msg) { if (conn && conn.open) { try { conn.send(msg); } catch (e) {} } },
    link(code = net.code) { return location.origin + location.pathname + '#/' + g.id + '/' + code; },
    close() {
      gen++; clearInterval(hb);
      const c = conn, p = peer; conn = null; peer = null;
      try { if (c) c.close(); } catch (e) {}
      try { if (p) p.destroy(); } catch (e) {}
      net.role = null; net.code = null;
    },
    async host() {
      net.close();
      const my = gen;
      for (let i = 0; i < 4; i++) {
        const code = Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
        let p;
        try { p = await newPeer(pid(code)); } catch (e) { if (e && e.type === 'unavailable-id') continue; throw e; }
        if (my !== gen) { p.destroy(); return null; }
        peer = p; net.code = code; net.role = 'host';
        p.on('connection', c => c.on('open', () => {
          if (conn || my !== gen) { try { c.send({ __full: 1 }); } catch (e) {} setTimeout(() => c.close(), 400); return; }
          try { c.send({ __hi: 1 }); } catch (e) {}
          attach(c);
        }));
        return code;
      }
      throw { type: 'network' };
    },
    async join(code) {
      net.close();
      const my = gen;
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const p = await newPeer();
      if (my !== gen) { p.destroy(); return false; }
      peer = p;
      const c = p.connect(pid(code), { reliable: true, serialization: 'json' });
      try {
        await wait((res, rej) => {
          c.on('data', d => { if (d && d.__hi) res(); else if (d && d.__full) rej({ type: 'room-full' }); });
          p.on('error', rej);
        }, 15000, 'peer-unavailable');
      } catch (e) { if (my === gen) net.close(); throw e; }
      if (my !== gen) return false;
      if (invite && invite.id === g.id) invite = null;
      net.code = code; net.role = 'guest';
      attach(c);
      return true;
    },
    lobby(o = {}) {
      return new Promise(resolve => {
        const el = document.createElement('div');
        el.className = 'g-overlay g-net';
        frame.append(el); void el.offsetWidth; el.classList.add('show');
        let done = false;
        const finish = r => {
          if (done) return;
          done = true; offOpen();
          el.classList.remove('show'); el.style.pointerEvents = 'none';
          setTimeout(() => el.remove(), 400);
          resolve(r);
        };
        const offOpen = net.on('open', role => finish(role));
        const card = inner => { el.innerHTML = `<div class="g-ov-card"><p class="g-ov-kicker">Play online</p>${inner}</div>`; };
        const menu = (msg = '') => {
          card(`<h3 class="g-ov-title">${o.title || 'Play a friend'}</h3><p class="g-ov-text">${o.text || 'Create a room and send the code or link to a friend on another device, or type their code to join.'}</p><div class="g-ov-btns"><button class="g-btn" data-n="host">Create room</button><button class="g-btn ghost" data-n="back">Back</button></div><div class="g-net-row"><input class="g-input g-net-in" maxlength="4" placeholder="CODE" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Room code"><button class="g-btn ghost" data-n="join">Join</button></div><p class="g-net-st">${msg}</p>`);
        };
        const hosting = async () => {
          card('<h3 class="g-ov-title">Creating room…</h3><p class="g-net-st">Connecting to the server…</p>');
          try {
            const code = await net.host();
            if (done || !code) return;
            card(`<p class="g-ov-text" style="margin-bottom:6px">Your room code</p><div class="g-net-code">${code}</div><div class="g-ov-btns"><button class="g-btn" data-n="share">${navigator.share ? 'Share invite link' : 'Copy invite link'}</button></div><p class="g-net-st">Waiting for your friend to join…</p><button class="g-btn ghost sm" data-n="back">Cancel</button>`);
          } catch (e) { if (!done) menu(netErr(e)); }
        };
        const joining = async code => {
          code = String(code || '').toUpperCase().trim();
          if (!/^[A-Z0-9]{4}$/.test(code)) { const s = el.querySelector('.g-net-st'); if (s) s.textContent = 'Type the 4-character room code.'; return; }
          card(`<h3 class="g-ov-title">Joining ${code}…</h3><p class="g-net-st">Connecting to your friend…</p><button class="g-btn ghost sm" data-n="back">Cancel</button>`);
          try { await net.join(code); } catch (e) { if (!done) menu(netErr(e)); }
        };
        el.addEventListener('click', e => {
          const b = e.target.closest('[data-n]');
          if (!b || done) return;
          sfx('tap');
          const n = b.dataset.n;
          if (n === 'host') hosting();
          else if (n === 'join') joining(el.querySelector('.g-net-in').value);
          else if (n === 'back') { net.close(); finish(null); }
          else if (n === 'share') {
            const url = net.link();
            if (navigator.share) navigator.share({ title: g.title + ' on gameplay', text: `Play ${g.title} with me! Room code ${net.code}`, url }).catch(() => {});
            else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Invite link copied'), () => toast(url));
            else toast(url);
          }
        });
        el.addEventListener('keydown', e => {
          if (!e.target.matches('.g-net-in')) return;
          e.stopPropagation();
          if (e.key === 'Enter') { e.preventDefault(); joining(e.target.value); }
        });
        el.addEventListener('input', e => { if (e.target.matches('.g-net-in')) e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
        add(() => finish(null));
        if (net.invite) joining(net.invite); else menu();
      });
    }
  };
  add(() => net.close());
  return net;
}

function makeApi(g, root) {
  const fns = [], add = f => fns.push(f);
  let alive = true, keys = null, net = null;
  const api = {
    root, colors: C, sfx, toast,
    get alive() { return alive; },
    get muted() { return S.muted; },
    get net() { return net || (net = makeNet(g, add)); },
    get best() { return S.best[g.id] ?? null; },
    score(v) { if (alive) $('#pScore').textContent = typeof v === 'number' ? fmt(g, v) : (v ?? '—'); },
    submit(v) {
      if (!alive || typeof v !== 'number' || !isFinite(v) || !(v > 0)) return false;
      const b = S.best[g.id];
      if (b != null && (g.better === 'low' ? v >= b : v <= b)) return false;
      S.best[g.id] = v; save(); setBest(g, true); toast('New best · ' + fmt(g, v));
      return true;
    },
    overlay(o = {}) {
      api.hideOverlay();
      const el = document.createElement('div');
      el.className = 'g-overlay';
      const stats = o.stats && o.stats.length ? `<div class="g-ov-stats">${o.stats.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : '';
      el.innerHTML = `<div class="g-ov-card">${o.kicker ? `<p class="g-ov-kicker">${o.kicker}</p>` : ''}${o.title ? `<h3 class="g-ov-title">${o.title}</h3>` : ''}${o.text ? `<p class="g-ov-text">${o.text}</p>` : ''}${stats}<div class="g-ov-btns">${o.button === null ? '' : `<button class="g-btn" data-a="1">${o.button || 'Play'}</button>`}${o.secondary ? `<button class="g-btn ghost" data-a="2">${o.secondary}</button>` : ''}</div></div>`;
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !alive) return;
        api.hideOverlay(); sfx('tap'); frame.focus({ preventScroll: true });
        const fn = b.dataset.a === '1' ? o.onAction : o.onSecondary;
        if (fn) fn();
      });
      frame.append(el); void el.offsetWidth; el.classList.add('show');
      ov = { el, at: performance.now(), fire: () => { const b = el.querySelector('[data-a="1"]'); if (b) b.click(); } };
      return api.hideOverlay;
    },
    hideOverlay() {
      if (!ov) return;
      const { el } = ov; ov = null;
      el.classList.remove('show'); el.style.pointerEvents = 'none';
      setTimeout(() => el.remove(), 400);
    },
    on(t, type, fn, opt) { t.addEventListener(type, fn, opt); add(() => t.removeEventListener(type, fn, opt)); },
    timeout(fn, ms) { const id = setTimeout(() => alive && fn(), ms); add(() => clearTimeout(id)); return id; },
    interval(fn, ms) { const id = setInterval(() => alive && fn(), ms); add(() => clearInterval(id)); return id; },
    loop(fn) {
      let on = true, last = performance.now(), id = 0;
      const step = t => {
        if (!on || !alive) return;
        const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t;
        fn(dt, t);
        if (on) id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
      const stop = () => { on = false; cancelAnimationFrame(id); };
      add(stop); return stop;
    },
    canvas(w, h, parent = root) {
      const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.className = 'g-canvas';
      c.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
      c.style.aspectRatio = `${w} / ${h}`;
      const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parent.append(c);
      const c2e = { canvas: c, ctx, w, h, d: dpr, d0: dpr, busy: false, manual: false };
      ['setTransform', 'resetTransform', 'getImageData', 'putImageData'].forEach(k => {
        const f = ctx[k];
        if (typeof f !== 'function') return;
        ctx[k] = function () { if (!c2e.busy && !c2e.manual) { c2e.manual = true; if (Math.abs(c2e.d - c2e.d0) > 0.01) gpRaster(c2e, c2e.d0, true); } return f.apply(ctx, arguments); };
      });
      c2Set.add(c2e); add(() => c2Set.delete(c2e));
      if (fsScale !== 1) applyGlScale(fsScale);
      const toLocal = e => {
        const r = c.getBoundingClientRect(), p = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
        return { x: (p.clientX - r.left) * w / r.width, y: (p.clientY - r.top) * h / r.height };
      };
      return { canvas: c, ctx, w, h, toLocal };
    },
    async gl(w = 960, h = 600, opts = {}) {
      const wait = document.createElement('div');
      wait.className = 'g-loading'; wait.innerHTML = '<i></i><span>Loading 3D…</span>';
      root.append(wait);
      let THREE;
      try { THREE = await loadThree(); }
      catch (e) {
        wait.remove();
        if (alive) api.overlay({ kicker: 'Connection needed', title: 'Couldn’t load 3D', text: 'The 3D engine is downloaded the first time you play a 3D game. Check your internet connection and try again.', button: 'Retry', onAction: restartCurrent });
        return null;
      }
      wait.remove();
      if (!alive) return null;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', ...opts });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
      renderer.setSize(w, h, false);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const c = renderer.domElement;
      c.className = 'g-canvas';
      c.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
      c.style.aspectRatio = `${w} / ${h}`;
      root.append(c);
      add(() => { try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} c.remove(); });
      const glEntry = { renderer, THREE, canvas: c, w0: w, h0: h, cw: w, ch: h, own: false, cap: 0, fill: false };
      const spr = renderer.setPixelRatio.bind(renderer), rnd = renderer.render.bind(renderer);
      renderer.setPixelRatio = v => { if (!glEntry.own) glEntry.cap = v < (window.devicePixelRatio || 1) * 0.98 ? v : 0; return spr(v); };
      renderer.render = (sc, cam) => {
        if (cam && cam.isPerspectiveCamera && (glEntry.fill || cam.userData.gpA)) {
          const a = glEntry.cw / glEntry.ch, b = cam.userData.gpA || glEntry.w0 / glEntry.h0;
          if (Math.abs(cam.aspect - b) < 2e-3 && Math.abs(cam.aspect - a) > 1e-4) { cam.aspect = a; cam.updateProjectionMatrix(); }
          if (Math.abs(cam.aspect - a) < 1e-4) cam.userData.gpA = a;
        }
        return rnd(sc, cam);
      };
      glSet.add(glEntry); add(() => glSet.delete(glEntry));
      if (fsScale !== 1) applyGlScale(fsScale);
      const toLocal = e => {
        const r = c.getBoundingClientRect(), p = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
        return { x: (p.clientX - r.left) * w / r.width, y: (p.clientY - r.top) * h / r.height, nx: ((p.clientX - r.left) / r.width) * 2 - 1, ny: -((p.clientY - r.top) / r.height) * 2 + 1 };
      };
      return { THREE, renderer, canvas: c, w, h, toLocal };
    },
    swipe(fn, el = root) {
      let sx = 0, sy = 0, id = null;
      el.style.touchAction = 'none';
      api.on(el, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; id = e.pointerId; });
      api.on(el, 'pointerup', e => {
        if (id !== e.pointerId) return;
        id = null;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
    },
    get keys() {
      if (!keys) {
        keys = new Set();
        api.on(window, 'keydown', e => keys.add(e.code));
        api.on(window, 'keyup', e => keys.delete(e.code));
        api.on(window, 'blur', () => keys.clear());
      }
      return keys;
    },
    load() { try { return JSON.parse(localStorage.getItem('gameplay:save:' + g.id)); } catch (e) { return null; } },
    save(data) { try { localStorage.setItem('gameplay:save:' + g.id, JSON.stringify(data)); } catch (e) {} }
  };
  add(() => { ov = null; });
  return { api, add, kill() { alive = false; while (fns.length) { try { fns.pop()(); } catch (e) { console.error(e); } } } };
}

const coverCache = new Map();
function coverUrl(g) {
  if (coverCache.has(g.id)) return coverCache.get(g.id);
  let svg = Ameplay.covers[g.id];
  if (!svg) {
    const icon = (g.icon || '').replace('<svg', '<svg x="135" y="85" width="130" height="130"');
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${TINT[g.id] || '#6c5ce7'}"/><circle cx="200" cy="150" r="96" fill="#fff" opacity=".16"/><g style="color:#fff">${icon}</g></svg>`;
  }
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  coverCache.set(g.id, url);
  return url;
}
const img = (g, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${coverUrl(g)}" alt="" decoding="async" draggable="false">`;
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
function tile(g, i) {
  const b = S.best[g.id];
  return `<a class="am-tile" href="#/${g.id}" data-id="${g.id}" style="--c:${TINT[g.id] || '#6c5ce7'};--i:${i}"><div class="am-thumb">${img(g)}<span class="am-play">${PLAY}</span>${NEW.includes(g.id) ? '<span class="am-new">NEW</span>' : HOT.includes(g.id) ? '<span class="am-hot">HOT</span>' : ''}${g.is3d ? '<span class="am-3d">3D</span>' : ''}${MP.includes(g.id) ? '<span class="am-2p">2P</span>' : ''}${b != null ? `<span class="am-pill">Best ${fmt(g, b)}</span>` : ''}</div><div class="am-tile-b"><h3>${g.title}</h3><span>${g.category}</span></div></a>`;
}

function start(g) {
  frame.textContent = '';
  const root = document.createElement('div');
  root.className = 'g-root gm-' + g.id;
  frame.append(root);
  $('#pScore').textContent = '—'; setBest(g);
  const ctl = makeApi(g, root);
  cur = { g, kill: ctl.kill };
  const fail = e => { console.error('[gameplay]', g.id, e); if (ctl.api.alive) root.innerHTML = '<p class="g-muted">This game hit an error and could not start.</p>'; };
  const hook = r => {
    if (!r || typeof r.destroy !== 'function') return;
    if (ctl.api.alive) ctl.add(() => r.destroy());
    else { try { r.destroy(); } catch (e) {} }
  };
  try {
    const inst = g.mount(root, ctl.api);
    if (inst && typeof inst.then === 'function') inst.then(hook, fail); else hook(inst);
  } catch (e) {
    console.error('[gameplay]', g.id, e);
    root.innerHTML = '<p class="g-muted">This game hit an error and could not start.</p>';
  }
  frame.focus({ preventScroll: true });
}
function restartCurrent() {
  if (!cur) return;
  const g = cur.g; cur.kill();
  frame.classList.remove('swap'); void frame.offsetWidth; frame.classList.add('swap');
  start(g);
}
function related(g) {
  const same = games.filter(x => x !== g && x.category === g.category);
  const rest = games.filter(x => x !== g && x.category !== g.category);
  const shuffled = rest.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  return [...same, ...shuffled];
}
function openGame(g) {
  if (cur && cur.g === g) return;
  if (cur) cur.kill();
  S.plays[g.id] = (S.plays[g.id] || 0) + 1;
  S.recent = [g.id, ...S.recent.filter(id => id !== g.id)].slice(0, 8);
  save();
  document.title = g.title + ' — play free on gameplay';
  $('#pTitle').textContent = g.title; $('#crumbGame').textContent = g.title;
  $('#crumbCat').textContent = g.category; $('#crumbCat').dataset.cat = g.category;
  $('#pCat').textContent = g.category + ' game';
  $('#pThumb').innerHTML = img(g); $('#pThumb').style.setProperty('--c', TINT[g.id]);
  $('#pHelp').innerHTML = g.help || '';
  $('#pBlurb').textContent = g.blurb || '';
  const p = S.plays[g.id];
  $('#pFacts').innerHTML = `<span>Category <b>${g.category}</b></span><span>Played <b>${p}×</b></span><span>${g.better === 'low' ? 'Lower is better' : 'Higher is better'}</span>`;
  gamebox.style.setProperty('--fw', (g.width || 880) + 'px');
  const rel = related(g);
  $('#more').innerHTML = rel.slice(0, 12).map(tile).join('');
  $('#upnext').innerHTML = rel.slice(12, 20).concat(rel.slice(0, Math.max(0, 8 - rel.slice(12, 20).length))).map((x, i) => `<a class="am-next" href="#/${x.id}" style="--i:${i}">${img(x)}<div><b>${x.title}</b><span>${x.category}</span></div></a>`).join('');
  showView('game');
  scrollTo({ top: 0, behavior: 'instant' });
  gamebox.classList.remove('enter'); void gamebox.offsetWidth; gamebox.classList.add('enter');
  start(g);
  markSide();
}
function closeGame() {
  if (!cur) return;
  cur.kill(); cur = null;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  frame.textContent = '';
  document.title = BASE_TITLE;
}

let view = '', homeY = 0;
function showView(v) {
  closeSide();
  if (view === v) return false;
  if (view === 'home') homeY = scrollY;
  view = v;
  const home = $('#vHome'), game = $('#vGame');
  home.hidden = v !== 'home'; game.hidden = v !== 'game';
  const el = v === 'home' ? home : game;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  return true;
}
function renderHome() {
  const pop = POPULAR.map(id => byId.get(id)).filter(Boolean);
  $('#popular').innerHTML = pop.map(tile).join('');
  const rec = S.recent.map(id => byId.get(id)).filter(Boolean);
  $('#secRecent').hidden = !rec.length;
  $('#recent').innerHTML = rec.map(tile).join('');
  const gn = NEW.map(id => byId.get(id)).filter(Boolean), gm = MP.map(id => byId.get(id)).filter(Boolean);
  $('#secNew').hidden = !gn.length; $('#gridNew').innerHTML = gn.map(tile).join('');
  $('#secMp').hidden = !gm.length; $('#gridMp').innerHTML = gm.map(tile).join('');
  const g3 = games.filter(g => g.is3d);
  $('#sec3d').hidden = !g3.length;
  $('#grid3d').innerHTML = g3.slice(0, 10).map(tile).join('');
  $('#collage').innerHTML = ['blockcraft-3d', 'road-hopper', 'sky-runner'].map(id => byId.get(id)).filter(Boolean).map(g => `<a href="#/${g.id}" aria-label="Play ${g.title}">${img(g)}</a>`).join('');
  renderGrid();
}
function renderGrid() {
  const term = filter.q.trim().toLowerCase();
  const list = games.filter(g => (filter.cat === 'All' || g.category === filter.cat) && (!term || `${g.title} ${g.category} ${g.blurb || ''}${MP.includes(g.id) ? ' multiplayer 2 player two players online friends versus' : ''}${NEW.includes(g.id) ? ' new' : ''}`.toLowerCase().includes(term)));
  $('#grid').innerHTML = list.map(tile).join('');
  $('#empty').hidden = list.length > 0;
  $('#emptyQ').textContent = '“' + filter.q.trim() + '”';
  $('#allTitle span').textContent = term ? `Results for “${filter.q.trim()}”` : filter.cat === 'All' ? 'All games' : filter.cat + ' games';
  document.querySelectorAll('.am-chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === filter.cat)));
}
function renderChrome() {
  const counts = {};
  games.forEach(g => { counts[g.category] = (counts[g.category] || 0) + 1; });
  const cats = CATS.filter(c => counts[c]);
  $('#chips').innerHTML = ['All', ...cats].map(c => `<button class="am-chip" data-cat="${c}" style="--c:${CAT_TINT[c] || '#1f1d2b'}" aria-pressed="false">${c === 'All' ? '' : '<i></i>'}${c}</button>`).join('');
  $('#sideCats').innerHTML = cats.map(c => `<button class="am-side-link" data-cat="${c}" style="--c:${CAT_TINT[c]}"><i></i><span>${c}</span><small>${counts[c]}</small></button>`).join('');
  $('#sideGames').innerHTML = [...games].sort((a, b) => a.title.localeCompare(b.title)).map(g => `<a class="am-side-link" href="#/${g.id}" data-id="${g.id}">${img(g)}<span>${g.title}</span></a>`).join('');
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = games.length; });
  $('#q').placeholder = `Search ${games.length} games`;
}
function markSide() {
  document.querySelectorAll('#side .am-side-link').forEach(a => a.classList.toggle('on', a.hasAttribute('data-home') ? view === 'home' : !!(cur && a.dataset.id === cur.g.id)));
}
function toAll(smooth) { requestAnimationFrame(() => $('#all').scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })); }
function goCategory(cat) {
  filter.cat = cat; filter.q = ''; $('#q').value = '';
  if (location.hash !== '#all') location.hash = '#all';
  else { renderGrid(); toAll(true); }
}
function route() {
  const m = /^#\/([\w-]+)(?:\/([A-Za-z0-9]{4}))?$/.exec(location.hash), g = m && byId.get(m[1]);
  if (g && m[2]) { invite = { id: g.id, code: m[2].toUpperCase() }; history.replaceState(null, '', '#/' + g.id); if (cur && cur.g === g) return restartCurrent(); }
  if (g) return openGame(g);
  closeGame();
  const changed = showView('home');
  renderHome(); markSide();
  if (location.hash === '#all') toAll(!changed);
  else scrollTo({ top: changed ? homeY : 0, behavior: changed ? 'instant' : 'smooth' });
}
function randomGame() {
  const pool = games.filter(g => !cur || g !== cur.g);
  const g = pool[Math.floor(Math.random() * pool.length)];
  if (g) location.hash = '#/' + g.id;
}
function setMuted(m) {
  S.muted = m; save();
  document.querySelectorAll('[data-sound]').forEach(b => b.setAttribute('aria-pressed', String(!m)));
}
function closeSide() { document.body.classList.remove('side-open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }

function boot() {
  const rank = g => { const i = ORDER.indexOf(g.id); return i < 0 ? 999 : i; };
  games.sort((a, b) => rank(a) - rank(b));
  const css = games.map(g => g.css || '').join('\n');
  if (css.trim()) { const st = document.createElement('style'); st.textContent = css; document.head.append(st); }
  renderChrome(); setMuted(S.muted);

  const q = $('#q');
  q.addEventListener('input', () => {
    filter.q = q.value; filter.cat = 'All';
    if (view !== 'home') { location.hash = '#all'; return; }
    renderGrid(); toAll(true);
  });
  ['keydown', 'keyup'].forEach(t => q.addEventListener(t, e => e.stopPropagation()));
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('#grid .am-tile'); if (first) { location.hash = first.getAttribute('href'); q.blur(); } }
    if (e.key === 'Escape') { q.value = ''; filter.q = ''; renderGrid(); q.blur(); }
  });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]');
    if (c) { goCategory(c.dataset.cat); return; }
    if (e.target.closest('[data-random]')) { randomGame(); return; }
    if (e.target.closest('#side a')) closeSide();
  });
  $('#menuBtn').addEventListener('click', () => { const open = document.body.classList.toggle('side-open'); $('#menuBtn').setAttribute('aria-expanded', String(open)); });
  $('#scrim').addEventListener('click', closeSide);
  document.querySelectorAll('[data-sound]').forEach(b => b.addEventListener('click', () => { setMuted(!S.muted); b.blur(); if (!S.muted) sfx('tap'); }));
  const fs = $('[data-fs]');
  if (!document.fullscreenEnabled) fs.hidden = true;
  fs.addEventListener('click', () => { fs.blur(); document.fullscreenElement ? document.exitFullscreen() : gamebox.requestFullscreen().catch(() => {}); });
  document.addEventListener('fullscreenchange', () => {
    clearInterval(fitTimer);
    if (document.fullscreenElement === gamebox) { requestAnimationFrame(() => requestAnimationFrame(fitFullscreen)); fitTimer = setInterval(fitFullscreen, 700); }
    else fitFullscreen();
    frame.focus({ preventScroll: true });
  });
  addEventListener('resize', queueFit);
  if (window.ResizeObserver) new ResizeObserver(() => { if (document.fullscreenElement === gamebox) queueFit(); }).observe(frame);
  $('#pRestart').addEventListener('click', e => { e.currentTarget.blur(); restartCurrent(); });
  $('#reset').addEventListener('click', () => {
    if (!confirm('Reset every record, play count and saved game on this device?')) return;
    S.best = {}; S.plays = {}; S.recent = []; save();
    games.forEach(g => { try { localStorage.removeItem('gameplay:save:' + g.id); } catch (e) {} });
    if (view === 'home') renderHome(); else if (cur) setBest(cur.g);
    toast('All records cleared');
  });
  addEventListener('keydown', e => {
    if (e.key === '/' && !isField(e.target) && !cur) { e.preventDefault(); q.focus(); return; }
    if (!cur) return;
    if (ov && (e.key === 'Enter' || e.key === ' ') && !isField(e.target) && !(e.target.closest && e.target.closest('.am-top, .am-side, .play-bar'))) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat && performance.now() - ov.at > 600) ov.fire();
      return;
    }
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isField(e.target)) e.preventDefault();
  }, true);
  addEventListener('hashchange', route);
  route();
}

Ameplay.debug = { open: id => openGame(byId.get(id)), close: () => { closeGame(); showView('home'); renderHome(); }, games, fire: () => ov && ov.fire() };
document.addEventListener('DOMContentLoaded', boot);
})();
