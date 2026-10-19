
(() => {
  'use strict';

  const CFG = {
    FLEET: [['Carrier', 5], ['Battleship', 4], ['Cruiser', 3], ['Submarine', 3], ['Destroyer', 2]],
    ROWS: 'ABCDEFGHIJ',
    FALL: 420,
    STAGGER: 330,
    SINK_AT: 480,
    AFTER_MISS: 450,
    AFTER_HIT: 650,
    AFTER_SINK: 1750,
    THINK: [650, 1100],
    PASS_DELAY: 1100,
    END_DELAY: 900,
    HARD_HIT_W: 40,
    PARITY_BONUS: 1.3,
    SWAP_MS: 340,
    BANNER_MS: 1900,
    CELL: 34
  };
  const NAMES = CFG.FLEET.map(f => f[0]), LENS = CFG.FLEET.map(f => f[1]);
  const F = (w, px) => `${w} ${px}px Nunito, "Arial Rounded MT Bold", system-ui, sans-serif`;
  const okCell = i => Number.isInteger(i) && i >= 0 && i < 100;
  const coord = i => CFG.ROWS[(i / 10) | 0] + (i % 10 + 1);
  const seeded = s => () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const easeBack = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  const cellsOf = (r, c, v, len) => { const a = []; for (let k = 0; k < len; k++) a.push(v ? (r + k) * 10 + c : r * 10 + c + k); return a; };
  const fits = (r, c, v, len) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && c >= 0 && (v ? r + len <= 10 && c < 10 : c + len <= 10 && r < 10);
  function canPlace(list, k, r, c, v, noTouch) {
    const len = LENS[k];
    if (!fits(r, c, v, len)) return false;
    const mine = cellsOf(r, c, v, len);
    for (const s of list) {
      if (!s.on || s.k === k) continue;
      for (const j of cellsOf(s.r, s.c, s.v, LENS[s.k])) {
        const jr = (j / 10) | 0, jc = j % 10;
        for (const i of mine) {
          if (noTouch ? Math.abs(((i / 10) | 0) - jr) <= 1 && Math.abs(i % 10 - jc) <= 1 : i === j) return false;
        }
      }
    }
    return true;
  }
  function randomFleet(noTouch, rnd = Math.random) {
    for (;;) {
      const list = [];
      let ok = true;
      for (let k = 0; k < 5 && ok; k++) {
        ok = false;
        for (let t = 0; t < 300; t++) {
          const v = rnd() < .5 ? 1 : 0, len = LENS[k];
          const r = Math.floor(rnd() * (v ? 11 - len : 10)), c = Math.floor(rnd() * (v ? 10 : 11 - len));
          if (canPlace(list, k, r, c, v, noTouch)) { list.push({ k, r, c, v, on: true }); ok = true; break; }
        }
      }
      if (ok) return list;
    }
  }
  const mkView = () => ({ cells: new Uint8Array(100), t: new Float64Array(100), sunk: [], reveal: null });
  const mkPlayer = () => ({ ships: [], occ: new Int8Array(100).fill(-1), recv: new Uint8Array(100), recvT: new Float64Array(100), view: mkView(), shots: 0, hits: 0, last: null });
  function setFleet(p, list) {
    p.ships = list.map(s => ({ k: s.k, r: s.r, c: s.c, v: s.v, len: LENS[s.k], cells: cellsOf(s.r, s.c, s.v, LENS[s.k]), hits: 0 }));
    p.occ.fill(-1);
    p.ships.forEach((s, n) => s.cells.forEach(i => { p.occ[i] = n; }));
  }
  const afloat = p => p.ships.filter(s => s.hits < s.len).length;
  function defend(p, cells, t0) {
    const res = [];
    cells.forEach((i, n) => {
      const t = t0 + n * CFG.STAGGER + CFG.FALL, si = p.occ[i], hit = si >= 0;
      p.recv[i] = hit ? 2 : 1; p.recvT[i] = t;
      const o = { i, h: hit ? 1 : 0, s: -1 };
      if (hit) { const s = p.ships[si]; s.hits++; if (s.hits === s.len) { o.s = s.k; o.c = s.cells.slice(); } }
      res.push(o);
    });
    return { res, lost: p.ships.length > 0 && p.ships.every(s => s.hits >= s.len) };
  }
  function absorb(view, res, t0) {
    res.forEach((o, n) => {
      const t = t0 + n * CFG.STAGGER + CFG.FALL;
      view.cells[o.i] = o.h ? 2 : 1; view.t[o.i] = t;
      if (o.s >= 0) view.sunk.push({ k: o.s, cells: o.c || [], t });
    });
  }

  const nb8 = (i, f) => { const r = (i / 10) | 0, c = i % 10; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const a = r + dr, b = c + dc; if ((dr || dc) && a >= 0 && a < 10 && b >= 0 && b < 10) f(a * 10 + b); } };
  function rndOf(K, blk, useBlk, rnd) { const a = []; for (let i = 0; i < 100; i++) if (K[i] === 0 && !(useBlk && blk[i])) a.push(i); return a.length ? a[Math.floor(rnd() * a.length)] : null; }
  function hunt(K, blk, rnd) {
    const free = i => K[i] === 0 && !blk[i], inb = (a, b) => a >= 0 && a < 10 && b >= 0 && b < 10;
    const line = [], adj = [];
    for (let i = 0; i < 100; i++) {
      if (K[i] !== 2) continue;
      const r = (i / 10) | 0, c = i % 10;
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        if (!inb(r + dr, c + dc)) continue;
        const j = (r + dr) * 10 + c + dc;
        if (!free(j)) continue;
        adj.push(j);
        if (inb(r - dr, c - dc) && K[(r - dr) * 10 + c - dc] === 2) line.push(j);
      }
    }
    const pool = line.length ? line : adj;
    if (pool.length) return pool[Math.floor(rnd() * pool.length)];
    const p = rndOf(K, blk, true, rnd);
    return p != null ? p : rndOf(K, blk, false, rnd);
  }
  function parity(K, blk, rem, rnd) {
    const m = rem.length ? Math.min(...rem) : 2, a = [];
    for (let i = 0; i < 100; i++) if (K[i] === 0 && !blk[i] && (((i / 10) | 0) + i % 10) % m === 0) a.push(i);
    return a.length ? a[Math.floor(rnd() * a.length)] : hunt(K, blk, rnd);
  }
  function dens(K, blk, rem, rnd, wHit) {
    const sc = new Float64Array(100);
    let hits = 0;
    for (let i = 0; i < 100; i++) if (K[i] === 2) hits++;
    for (const len of rem) for (let v = 0; v < 2; v++) for (let r = 0; r < (v ? 11 - len : 10); r++) for (let c = 0; c < (v ? 10 : 11 - len); c++) {
      let k = 0, ok = true;
      for (let q = 0; q < len; q++) { const i = v ? (r + q) * 10 + c : r * 10 + c + q, s = K[i]; if (s === 1 || s === 3 || (s === 0 && blk[i])) { ok = false; break; } if (s === 2) k++; }
      if (!ok) continue;
      const w = k ? Math.pow(wHit, k) : 1;
      for (let q = 0; q < len; q++) { const i = v ? (r + q) * 10 + c : r * 10 + c + q; if (K[i] === 0) sc[i] += w; }
    }
    const m = rem.length ? Math.min(...rem) : 2;
    let best = -1, pool = [];
    for (let i = 0; i < 100; i++) {
      if (K[i] !== 0 || blk[i] || !sc[i]) continue;
      let s = sc[i];
      if (!hits && (((i / 10) | 0) + i % 10) % m === 0) s *= CFG.PARITY_BONUS;
      if (s > best + 1e-9) { best = s; pool = [i]; } else if (Math.abs(s - best) <= 1e-9) pool.push(i);
    }
    if (pool.length) return pool[Math.floor(rnd() * pool.length)];
    const p = rndOf(K, blk, true, rnd);
    return p != null ? p : rndOf(K, blk, false, rnd);
  }
  function aiPick(view, n, diff, noTouch, rnd = Math.random) {
    const K = Uint8Array.from(view.cells), sunkK = new Set(), blk = new Uint8Array(100);
    for (const s of view.sunk) { sunkK.add(s.k); for (const i of s.cells) K[i] = 3; }
    if (noTouch) for (const s of view.sunk) for (const i of s.cells) nb8(i, j => { blk[j] = 1; });
    const rem = LENS.filter((_, k) => !sunkK.has(k)), out = [];
    for (let s = 0; s < n; s++) {
      const p = diff === 'easy' ? rndOf(K, blk, false, rnd) : diff === 'normal' ? hunt(K, blk, rnd) : diff === 'hard' ? (K.includes(2) ? hunt(K, blk, rnd) : parity(K, blk, rem, rnd)) : dens(K, blk, rem, rnd, 1000);
      if (p == null) break;
      out.push(p); K[p] = 1;
    }
    return out;
  }

  function makeAudio(api) {
    let ac = null, master = null, noise = null, echo = null, soft = null;
    const init = () => {
      if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac.state !== 'closed'; }
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return false;
      try { ac = new A(); } catch (e) { return false; }
      master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
      soft = ac.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 900; soft.connect(master);
      const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noise = b;
      const dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter();
      dl.delayTime.value = .34; fb.gain.value = .42; lp.type = 'lowpass'; lp.frequency.value = 2400;
      echo = ac.createGain();
      echo.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(master);
      return true;
    };
    const ok = () => !api.muted && init();
    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
    const osc = (type, f0, f1, t, dur, peak, dest, a = .005) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, a, peak, dur); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + a + dur + .05);
    };
    const nz = (t, dur, peak, type, f0, f1, q, a = .005) => {
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; s.loop = true;
      f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env(g, t, a, peak, dur); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + a + dur + .05);
    };
    return {
      unlock: init,
      ping() { if (!ok()) return; const t = ac.currentTime; osc('sine', 1180, 1110, t, 1.2, .3); osc('sine', 1180, 1120, t, .45, .2, echo); osc('sine', 2360, 2290, t, .2, .03); },
      whistle() { if (!ok()) return; const t = ac.currentTime; osc('sine', 1500, 480, t, CFG.FALL / 1000, .035, master, .05); },
      splash() {
        if (!ok()) return;
        const t = ac.currentTime;
        nz(t, .55, .55, 'bandpass', 2600, 380, .9); nz(t + .02, .3, .22, 'highpass', 5200, 2600, .7); osc('sine', 360, 85, t, .15, .25);
        for (let k = 0; k < 5; k++) { const f = 500 + Math.random() * 700; osc('sine', f, f * 1.9, t + .16 + k * .06 + Math.random() * .05, .05, .05); }
      },
      boom(big) {
        if (!ok()) return;
        const t = ac.currentTime;
        nz(t, big ? 1.5 : .95, .95, 'lowpass', 2000, 80, .7); osc('sine', 125, 36, t, big ? .8 : .55, .75); osc('triangle', 90, 30, t, .45, .35);
        nz(t + .04, .45, .18, 'highpass', 3200, 1400, .5);
      },
      sink() {
        if (!ok()) return;
        const t = ac.currentTime + .15;
        nz(t, 2.2, .45, 'lowpass', 520, 55, 1.2, .25); osc('sawtooth', 140, 38, t, 2, .12, soft, .35); osc('sine', 70, 30, t + .2, 1.8, .25, master, .3);
        for (let k = 0; k < 14; k++) { const f = 260 + Math.random() * 520; osc('sine', f, f * 2.3, t + .35 + k * .12 + Math.random() * .08, .06, .05); }
      },
      close() { if (ac) { try { ac.close(); } catch (e) {} ac = null; } }
    };
  }

  function shipArt(g, k, u, wreck) {
    const len = LENS[k], w = len * u, mid = u / 2, top = u * .16, bot = u * .84, hh = bot - top, sub = k === 3;
    const hull = new Path2D();
    if (sub) hull.roundRect(u * .07, u * .25, w - u * .14, u * .5, u * .25);
    else {
      const sx = u * .07, bx = w - u * .04, br = Math.min(u * .95, w * .4);
      hull.moveTo(sx + u * .14, top);
      hull.lineTo(bx - br, top);
      hull.bezierCurveTo(bx - br * .35, top, bx - u * .08, mid - hh * .18, bx, mid);
      hull.bezierCurveTo(bx - u * .08, mid + hh * .18, bx - br * .35, bot, bx - br, bot);
      hull.lineTo(sx + u * .14, bot);
      hull.quadraticCurveTo(sx, bot, sx, bot - u * .14);
      hull.lineTo(sx, top + u * .14);
      hull.quadraticCurveTo(sx, top, sx + u * .14, top);
      hull.closePath();
    }
    g.save();
    g.save(); g.translate(u * .05, u * .08); g.fillStyle = 'rgba(0,8,24,.42)'; g.fill(hull); g.restore();
    let gr = g.createLinearGradient(0, top, 0, bot);
    gr.addColorStop(0, sub ? '#b6bdc7' : '#e8ecf1'); gr.addColorStop(.5, sub ? '#7c8490' : '#a9b0ba'); gr.addColorStop(1, sub ? '#424953' : '#5b626c');
    g.fillStyle = gr; g.fill(hull);
    g.save(); g.clip(hull);
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, top, w, hh * .2);
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, bot - hh * .18, w, hh * .18);
    g.restore();
    g.lineWidth = u * .045; g.strokeStyle = '#30363f'; g.stroke(hull);
    const block = (x0, x1, y0, y1, c1, c2) => {
      const gg = g.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, c1 || '#f3f5f8'); gg.addColorStop(1, c2 || '#949ca7');
      g.fillStyle = gg; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, u * .06); g.fill();
      g.lineWidth = u * .03; g.strokeStyle = '#38404a'; g.stroke();
    };
    const turret = (x, dir, r = u * .18) => {
      g.fillStyle = '#454c56';
      for (const oy of [-.07, .025]) g.fillRect(dir > 0 ? x : x - u * .44, mid + oy * u, u * .44, u * .045);
      const tg = g.createRadialGradient(x - r * .3, mid - r * .35, r * .1, x, mid, r);
      tg.addColorStop(0, '#f6f7f9'); tg.addColorStop(1, '#838b96');
      g.fillStyle = tg; g.beginPath(); g.arc(x, mid, r, 0, 7); g.fill(); g.lineWidth = u * .03; g.strokeStyle = '#333a43'; g.stroke();
    };
    const funnel = (x, y) => { g.fillStyle = '#3c434d'; g.beginPath(); g.ellipse(x, y, u * .11, u * .08, 0, 0, 7); g.fill(); g.fillStyle = '#1b1f25'; g.beginPath(); g.ellipse(x, y, u * .06, u * .04, 0, 0, 7); g.fill(); };
    if (k === 0) {
      g.fillStyle = '#7f8792'; g.beginPath(); g.roundRect(u * .22, top + u * .06, w - u * 1.1, hh - u * .12, u * .05); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = u * .035; g.setLineDash([u * .16, u * .12]);
      g.beginPath(); g.moveTo(u * .35, mid + u * .17); g.lineTo(w - u * 1.05, mid + u * .17); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(u * .3, bot - u * .1); g.lineTo(u * 2.2, top + u * .12); g.stroke();
      g.fillStyle = 'rgba(30,34,40,.35)'; g.fillRect(u * .9, top + u * .1, u * .3, u * .18); g.fillRect(u * 2.6, top + u * .1, u * .3, u * .18);
      block(u * 3.1, u * 3.85, top - u * .04, top + u * .27); funnel(u * 3.6, top + u * .12);
      g.fillStyle = '#5d6570';
      for (const px of [1.35, 1.95]) { g.beginPath(); g.moveTo(px * u, mid + u * .02); g.lineTo(px * u + u * .2, mid - u * .06); g.lineTo(px * u + u * .2, mid + u * .1); g.closePath(); g.fill(); }
    } else if (k === 1) {
      turret(u * .85, -1); turret(u * 2.95, 1);
      block(u * 1.32, u * 2.5, top + u * .1, bot - u * .1); block(u * 1.6, u * 2.2, top + u * .2, bot - u * .2, '#ffffff', '#b3bac4');
      funnel(u * 2.33, mid);
      g.strokeStyle = '#3a414b'; g.lineWidth = u * .03; g.beginPath(); g.moveTo(u * 1.45, mid); g.lineTo(u * 1.15, mid); g.stroke();
    } else if (k === 2) {
      turret(u * .6, -1, u * .16); turret(u * 2.12, 1, u * .16);
      block(u * .95, u * 1.8, top + u * .12, bot - u * .12); funnel(u * 1.6, mid);
    } else if (sub) {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(u * .3, mid - u * .015, w - u * .6, u * .03);
      block(u * 1.15, u * 1.9, mid - u * .13, mid + u * .13, '#a4acb7', '#4d5560');
      g.strokeStyle = '#2f353d'; g.lineWidth = u * .04; g.beginPath(); g.moveTo(u * 1.4, mid); g.lineTo(u * 1.4, mid - u * .26); g.stroke();
      g.fillStyle = '#4b525c';
      g.beginPath(); g.moveTo(u * .3, mid - u * .22); g.lineTo(u * .06, mid - u * .32); g.lineTo(u * .14, mid - u * .1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(u * .3, mid + u * .22); g.lineTo(u * .06, mid + u * .32); g.lineTo(u * .14, mid + u * .1); g.closePath(); g.fill();
    } else {
      block(u * .42, u * 1.02, top + u * .14, bot - u * .14); funnel(u * .86, mid); turret(u * 1.3, 1, u * .14);
    }
    for (let q = 0; q < len; q++) {
      const x = q * u + u / 2;
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x, mid + u * .015, u * .085, 0, 7); g.fill();
      g.fillStyle = '#1a1e24'; g.beginPath(); g.arc(x, mid, u * .075, 0, 7); g.fill();
    }
    if (wreck) {
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(80,16,8,.55)'; g.fillRect(0, 0, w, u);
      const rnd = seeded(k + 3);
      for (let n = 0; n < len * 3; n++) { g.fillStyle = 'rgba(15,8,6,.45)'; g.beginPath(); g.arc(rnd() * w, top + rnd() * hh, u * (.06 + rnd() * .12), 0, 7); g.fill(); }
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
  }
  function pegArt(g, cx, cy, r, red) {
    g.fillStyle = 'rgba(0,8,25,.45)'; g.beginPath(); g.arc(cx + r * .25, cy + r * .45, r * 1.02, 0, 7); g.fill();
    g.fillStyle = red ? '#9a1510' : '#9fa7b2'; g.beginPath(); g.arc(cx, cy + r * .2, r, 0, 7); g.fill();
    const gr = g.createRadialGradient(cx - r * .35, cy - r * .45, r * .1, cx, cy - r * .1, r);
    gr.addColorStop(0, red ? '#ff9284' : '#ffffff'); gr.addColorStop(.55, red ? '#e5352b' : '#eef1f5'); gr.addColorStop(1, red ? '#b41e16' : '#c3c9d2');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy - r * .06, r * .93, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(cx - r * .32, cy - r * .42, r * .28, r * .15, -.6, 0, 7); g.fill();
  }

  Ameplay.register({
    id: 'sea-battle',
    title: 'Sea Battle',
    category: 'Board',
    tint: '#1e4f9c',
    blurb: 'Hide your fleet, call your shots and sink every enemy ship.',
    help: '<kbd>Drag</kbd> ships, tap a ship to rotate it (or <kbd>Space</kbd>, right-click or the wheel while dragging), <kbd>R</kbd> random · click a square to fire, a hit lets you fire again · <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> aim, <kbd>Enter</kbd> fire',
    better: 'low',
    format: v => v + ' shots',
    width: 920,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 38h48l-6 10H14z"/><path d="M20 38v-7h16v7M26 31v-6h6"/><path d="M36 34h10"/><circle cx="46" cy="16" r="7"/><path d="M46 6v4M46 22v4M36 16h4M52 16h4"/></svg>',
    sim: { aiPick, randomFleet, canPlace, defend, absorb, mkPlayer, setFleet, afloat, LENS, CFG },
    mount(root, api) {
      const portrait = (root.clientWidth || innerWidth) < 640;
      const W = portrait ? 400 : 900, H = portrait ? 636 : 590, CELL = CFG.CELL;
      const { canvas, ctx, toLocal } = api.canvas(W, H);
      canvas.style.touchAction = 'none';
      canvas.style.borderRadius = '16px';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const au = makeAudio(api);
      const sv = api.load() || {};
      const opt = {
        mode: ['cpu', 'online'].includes(sv.mode) ? sv.mode : 'cpu',
        diff: ['easy', 'normal', 'hard', 'expert'].includes(sv.diff) ? sv.diff : 'hard',
        salvo: !!sv.salvo, noTouch: !!sv.noTouch, chain: sv.chain !== false
      };
      const saveOpt = () => api.save({ ...opt });
      const S = {
        screen: 'menu', mode: opt.mode, rules: { salvo: false, noTouch: false, chain: true }, gen: 0, diff: opt.diff,
        P: [mkPlayer(), mkPlayer()], me: 0, turn: 0, first: 0, busy: 0, over: false, winner: -1,
        placing: 0, pl: null, drag: null, selDock: -1, shakeShip: null,
        aim: 44, armed: -1, sel: [], locked: null, pass: null, banner: null, result: null, focusHold: 0,
        focus: 0, quitT: 0, menuRow: 0, kbd: false, cardHidden: false, submitted: false, newBest: false,
        shk: 0, note: null, cpuAim: null, firstCpu: false, ptr: null, press: null,
        coarse: matchMedia('(pointer: coarse)').matches
      };
      const N = { role: null, live: false, r: 0, n: 0, pending: null, myReady: false, theirReady: false, myRe: false, theirRe: false, hooked: false };
      const parts = [], shells = [], flashes = [];
      let ui = [];

      const at = (t, fn) => { const g = S.gen; api.timeout(() => { if (g === S.gen && api.alive) fn(); }, Math.max(0, t - performance.now())); };
      const nameOf = pi => pi === S.me ? 'You' : S.mode === 'cpu' ? 'CPU' : 'Your friend';

      const BD = (x, y, cell) => { const lab = cell * .6, pad = cell * .3; return { x, y, cell, lab, pad, gx: x + pad + lab, gy: y + pad + lab, size: cell * 11.2 }; };
      const lerpBD = (a, b, f) => BD(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.cell + (b.cell - a.cell) * f);
      const LB = portrait ? { big: BD(10, 46, CELL), mini: BD(8, 432, 17) } : { left: BD(30, 66, CELL), right: BD(490, 66, CELL) };
      function boards() {
        if (!portrait) return { own: LB.left, tgt: LB.right };
        if (S.screen === 'place') return { own: LB.big, tgt: LB.mini };
        const f = easeIO(S.focus);
        return { own: lerpBD(LB.mini, LB.big, f), tgt: lerpBD(LB.big, LB.mini, f) };
      }
      const cellAt = (b, x, y) => { const c = Math.floor((x - b.gx) / b.cell), r = Math.floor((y - b.gy) / b.cell); return c >= 0 && c < 10 && r >= 0 && r < 10 ? r * 10 + c : -1; };
      const cellXY = (b, i) => ({ x: b.gx + (i % 10) * b.cell + b.cell / 2, y: b.gy + ((i / 10) | 0) * b.cell + b.cell / 2 });
      const boardOf = pi => pi === S.me ? boards().own : boards().tgt;
      const dockPos = k => portrait
        ? [{ x: 14, y: 438 }, { x: 200, y: 438 }, { x: 14, y: 482 }, { x: 132, y: 482 }, { x: 250, y: 482 }][k]
        : { x: 512, y: 118 + k * 52 };

      const off = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, g]; };
      const TM = 16, trayC = {}, shipC = [], wreckC = [], pegC = [];
      function renderTray(kind) {
        const b = BD(TM, TM, CELL), sz = b.size + TM * 2, [cv, g] = off(sz, sz), gs = CELL * 10;
        g.save(); g.shadowColor = 'rgba(0,8,24,.6)'; g.shadowBlur = 16; g.shadowOffsetY = 7;
        g.fillStyle = '#5c636c'; g.beginPath(); g.roundRect(b.x, b.y, b.size, b.size, 14); g.fill(); g.restore();
        let gr = g.createLinearGradient(b.x, b.y, b.x + b.size * .3, b.y + b.size);
        gr.addColorStop(0, '#cfd3d8'); gr.addColorStop(.5, '#a9afb6'); gr.addColorStop(1, '#858c95');
        g.fillStyle = gr; g.beginPath(); g.roundRect(b.x, b.y, b.size, b.size, 14); g.fill();
        gr = g.createLinearGradient(0, b.y, 0, b.y + b.size);
        gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(.5, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.45)');
        g.strokeStyle = gr; g.lineWidth = 2.5; g.beginPath(); g.roundRect(b.x + 1.5, b.y + 1.5, b.size - 3, b.size - 3, 12.5); g.stroke();
        const rnd = seeded(kind === 'ocean' ? 7 : 11);
        for (let n = 0; n < 900; n++) { g.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'; g.fillRect(b.x + 4 + rnd() * (b.size - 8), b.y + 4 + rnd() * (b.size - 8), 1.4, 1.4); }
        g.font = F(900, 13); g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let k = 0; k < 10; k++) {
          for (const [t, x, y] of [[String(k + 1), b.gx + k * CELL + CELL / 2, b.y + b.pad + b.lab / 2 + 1], [CFG.ROWS[k], b.x + b.pad + b.lab / 2, b.gy + k * CELL + CELL / 2 + 1]]) {
            g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText(t, x + .6, y + 1);
            g.fillStyle = '#2a323c'; g.fillText(t, x, y);
          }
        }
        if (kind === 'target') {
          g.fillStyle = '#0e2246'; g.beginPath(); g.roundRect(b.gx - 3, b.gy - 3, gs + 6, gs + 6, 6); g.fill();
          gr = g.createLinearGradient(0, b.gy, 0, b.gy + gs); gr.addColorStop(0, 'rgba(70,110,190,.25)'); gr.addColorStop(1, 'rgba(0,0,0,.2)');
          g.fillStyle = gr; g.fillRect(b.gx, b.gy, gs, gs);
        } else {
          g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.roundRect(b.gx - 3, b.gy - 3, gs + 6, gs + 6, 6); g.fill(); g.restore();
        }
        g.strokeStyle = 'rgba(0,8,26,.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(b.gx - 1.5, b.gy - 1.5, gs + 3, gs + 3, 5); g.stroke();
        g.strokeStyle = kind === 'target' ? 'rgba(110,150,225,.22)' : 'rgba(255,255,255,.24)'; g.lineWidth = 1;
        g.beginPath();
        for (let k = 1; k < 10; k++) { g.moveTo(b.gx + k * CELL, b.gy); g.lineTo(b.gx + k * CELL, b.gy + gs); g.moveTo(b.gx, b.gy + k * CELL); g.lineTo(b.gx + gs, b.gy + k * CELL); }
        g.stroke();
        for (let i = 0; i < 100; i++) {
          const x = b.gx + (i % 10) * CELL + CELL / 2, y = b.gy + ((i / 10) | 0) * CELL + CELL / 2, R = kind === 'target' ? 5.8 : 4.4;
          g.fillStyle = kind === 'target' ? 'rgba(140,175,240,.2)' : 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(x, y + 1, R + 1.2, 0, 7); g.fill();
          g.fillStyle = kind === 'target' ? '#040b1a' : 'rgba(3,22,55,.78)'; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
          g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.arc(x, y - .9, R * .78, 0, 7); g.fill();
        }
        return cv;
      }
      function buildArt() {
        trayC.ocean = renderTray('ocean'); trayC.target = renderTray('target');
        for (let k = 0; k < 5; k++) {
          for (const [arr, wr] of [[shipC, false], [wreckC, true]]) { const [c, g] = off(LENS[k] * CELL, CELL); shipArt(g, k, CELL, wr); arr[k] = c; }
        }
        for (let red = 0; red < 2; red++) { const [c, g] = off(CELL, CELL); pegArt(g, CELL / 2, CELL / 2, CELL * .25, !!red); pegC[red] = c; }
      }
      buildArt();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (api.alive) buildArt(); }).catch(() => {});

      const WW = portrait ? 64 : 120, WH = portrait ? 100 : 78;
      const wc = document.createElement('canvas'); wc.width = WW; wc.height = WH;
      const wg = wc.getContext('2d'), wimg = wg.createImageData(WW, WH), wbuf = new Uint32Array(wimg.data.buffer), wd = new Float32Array(WW * WH);
      for (let y = 0, p = 0; y < WH; y++) for (let x = 0; x < WW; x++, p++) wd[p] = Math.hypot(x - WW * .3, y - WH * .7);
      const cl = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;
      function water(t) {
        for (let y = 0, p = 0; y < WH; y++) for (let x = 0; x < WW; x++, p++) {
          const v = Math.sin(x * .16 + t * .35) + Math.sin(y * .13 - t * .28) + Math.sin((x + y) * .08 + t * .2) + Math.sin(wd[p] * .22 - t * .45);
          const c0 = 1 - Math.abs(Math.sin(v * 1.2)), ca = c0 * c0 * c0 * c0 * c0 * c0;
          wbuf[p] = 0xff000000 | (cl(118 + v * 5 + ca * 26) << 16) | (cl(82 + v * 4 + ca * 24) << 8) | cl(34 + v * 2 + ca * 16);
        }
        wg.putImageData(wimg, 0, 0);
      }
      water(0);
      const [bgC, bgG] = off(W, H);
      {
        const g = bgG, gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#1d4f7d'); gr.addColorStop(.55, '#163f68'); gr.addColorStop(1, '#0f2f52');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        const rg = g.createRadialGradient(W * .5, -H * .1, 10, W * .5, -H * .1, H * 1.1);
        rg.addColorStop(0, 'rgba(160,210,240,.22)'); rg.addColorStop(1, 'rgba(160,210,240,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        const rnd = seeded(5);
        g.lineCap = 'round';
        for (let k = 0; k < 26; k++) {
          const y = H * (k / 26) + rnd() * 12, amp = 3 + rnd() * 4, len = 60 + rnd() * 140, x0 = rnd() * W;
          g.strokeStyle = `rgba(200,230,255,${.03 + rnd() * .035})`; g.lineWidth = 1.5 + rnd() * 1.5;
          g.beginPath();
          for (let x = 0; x <= len; x += 6) { const yy = y + Math.sin(x / len * Math.PI * 2) * amp; if (x) g.lineTo(x0 + x, yy); else g.moveTo(x0 + x, yy); }
          g.stroke();
        }
      }

      const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
      function txt(s, x, y, px, col, align = 'left', w = 900, maxW = 0) {
        ctx.font = F(w, px);
        if (maxW) { let q = px; while (q > 9 && ctx.measureText(s).width > maxW) { q--; ctx.font = F(w, q); } }
        ctx.textAlign = align; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,8,24,.55)'; ctx.fillText(s, x + 1, y + 1.5);
        ctx.fillStyle = col; ctx.fillText(s, x, y);
      }
      const PAL = {
        navy: ['#3c6fc4', '#22488c', '#122a58', '#4c80d8', '#fff'],
        red: ['#f0504a', '#c62828', '#7a1212', '#ff6b63', '#fff'],
        on: ['#ffd166', '#f2a91d', '#9c6205', '#ffdd88', '#3a2600'],
        off: ['#2b4f8e', '#1d3a6c', '#0d2044', '#34599e', '#d3e2ff']
      };
      function button(id, x, y, w, h, label, act, o = {}) {
        const now = performance.now(), pressed = S.press && S.press.u === id && now - S.press.t < 140;
        const hov = !o.dis && S.ptr && !S.ptr.touch && S.ptr.x >= x && S.ptr.x <= x + w && S.ptr.y >= y && S.ptr.y <= y + h;
        const pal = PAL[o.style || 'navy'], lip = Math.max(3, Math.round(h * .1)), dy = pressed ? lip * .8 : 0, r = o.r != null ? o.r : Math.min(h / 2, 16);
        ctx.save();
        if (o.dis) ctx.globalAlpha = .45;
        if (o.pulse) { ctx.shadowColor = 'rgba(255,90,80,.8)'; ctx.shadowBlur = 10 + 8 * Math.sin(now / 200); }
        ctx.fillStyle = 'rgba(0,8,25,.35)'; rr(x, y + lip + 2, w, h - lip, r); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = pal[2]; rr(x, y + lip, w, h - lip, r); ctx.fill();
        const gr = ctx.createLinearGradient(0, y + dy, 0, y + dy + h - lip);
        gr.addColorStop(0, hov ? pal[3] : pal[0]); gr.addColorStop(1, pal[1]);
        ctx.fillStyle = gr; rr(x, y + dy, w, h - lip, r); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5; rr(x + 1.5, y + dy + 1.5, w - 3, h - lip - 3, Math.max(1, r - 1.5)); ctx.stroke();
        ctx.font = F(900, o.fs || Math.round(h * .38)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let q = o.fs || Math.round(h * .38);
        while (q > 9 && ctx.measureText(label).width > w - 12) { q--; ctx.font = F(900, q); }
        ctx.fillStyle = pal[4]; ctx.fillText(label, x + w / 2, y + dy + (h - lip) / 2 + 1);
        ctx.restore();
        ui.push({ id, x, y, w, h, act, dis: !!o.dis });
      }
      function panel(x, y, w, h, a = .82) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,6,20,.5)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        ctx.fillStyle = `rgba(20,44,92,${a})`; rr(x, y, w, h, 14); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(160,195,255,.28)'; ctx.lineWidth = 1.5; rr(x + .75, y + .75, w - 1.5, h - 1.5, 13.5); ctx.stroke();
      }
      function shipAt(k, x, y, cell, v, alpha, wreck) {
        const spr = (wreck ? wreckC : shipC)[k];
        if (!spr) return;
        ctx.save();
        if (alpha != null) ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        if (v) { ctx.translate(cell, 0); ctx.rotate(Math.PI / 2); }
        ctx.drawImage(spr, 0, 0, LENS[k] * cell, cell);
        ctx.restore();
      }
      function shipMid(k, cx, cy, cell, ang, alpha) {
        const spr = shipC[k];
        if (!spr) return;
        ctx.save();
        if (alpha != null) ctx.globalAlpha = alpha;
        ctx.translate(cx, cy); ctx.rotate(ang);
        ctx.drawImage(spr, -LENS[k] * cell / 2, -cell / 2, LENS[k] * cell, cell);
        ctx.restore();
      }
      const anim = [];
      let lastPlace = 0;
      const shipOnBoard = (b, k, r, c, v, a, wr) => shipAt(k, b.gx + c * b.cell, b.gy + r * b.cell, b.cell, v, a, wr);
      function shipFromCells(b, k, cells, a, wr) {
        if (!cells || cells.length !== LENS[k]) return;
        const mn = Math.min(...cells), v = cells.length > 1 && Math.abs(cells[1] - cells[0]) === 10 ? 1 : 0;
        shipOnBoard(b, k, (mn / 10) | 0, mn % 10, v, a, wr);
      }
      function peg(b, i, red, t, now) {
        const c = b.cell, p = cellXY(b, i), q = (now - t) / 280;
        let s = 1, dy = 0;
        if (q < 1) { s = Math.max(.01, easeBack(Math.max(0, q))); dy = -(1 - q) * (1 - q) * c * .9; }
        const sz = c * s;
        ctx.drawImage(pegC[red ? 1 : 0], p.x - sz / 2, p.y - sz / 2 + dy, sz, sz);
      }
      function drawTray(b, kind) {
        const s = b.cell / CELL;
        if (kind === 'ocean') {
          ctx.drawImage(wc, b.gx, b.gy, b.cell * 10, b.cell * 10);
          ctx.fillStyle = 'rgba(60,140,200,.22)'; ctx.fillRect(b.gx, b.gy, b.cell * 10, b.cell * 10);
        }
        ctx.drawImage(trayC[kind], b.x - TM * s, b.y - TM * s, (CELL * 11.2 + TM * 2) * s, (CELL * 11.2 + TM * 2) * s);
      }
      function reticle(b, i, now, col, lock) {
        const p = cellXY(b, i), c = b.cell, h = c * (.5 + (lock ? .02 : .05) * Math.sin(now / 140)), L = c * .2;
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        ctx.fillRect(b.gx, p.y - c / 2, c * 10, c); ctx.fillRect(p.x - c / 2, b.gy, c, c * 10);
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, c * .08); ctx.lineCap = 'round';
        ctx.beginPath();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const x = p.x + sx * h, y = p.y + sy * h;
          ctx.moveTo(x, y - sy * L); ctx.lineTo(x, y); ctx.lineTo(x - sx * L, y);
        }
        ctx.moveTo(p.x - c * .14, p.y); ctx.lineTo(p.x + c * .14, p.y); ctx.moveTo(p.x, p.y - c * .14); ctx.lineTo(p.x, p.y + c * .14);
        ctx.stroke();
      }
      function sonar(b, now) {
        const cx = b.gx + b.cell * 5, cy = b.gy + b.cell * 5, R = b.cell * 7, a = (now / 900) % (Math.PI * 2);
        ctx.save();
        ctx.beginPath(); ctx.rect(b.gx, b.gy, b.cell * 10, b.cell * 10); ctx.clip();
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        gr.addColorStop(0, 'rgba(90,255,180,.22)'); gr.addColorStop(1, 'rgba(90,255,180,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a - .7, a); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(120,255,200,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
        const ring = (now / 1400) % 1;
        ctx.strokeStyle = `rgba(120,255,200,${.4 * (1 - ring)})`; ctx.beginPath(); ctx.arc(cx, cy, ring * R, 0, 7); ctx.stroke();
        ctx.restore();
      }

      function explode(x, y, c, big) {
        const now = performance.now();
        flashes.push({ x, y, r: c * (big ? 1.7 : 1.2), t: now, d: 240 });
        const n = big ? 24 : 16;
        for (let k = 0; k < n; k++) { const a = Math.random() * 7, sp = c * (1 + Math.random() * 3.2); parts.push({ kind: 'fire', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - c * 1.5, g: -c * .5, life: 0, max: .45 + Math.random() * .4, r: c * (.1 + Math.random() * .12), grow: c * .45 }); }
        for (let k = 0; k < 10; k++) { const a = Math.random() * 7, sp = c * (4 + Math.random() * 6); parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - c * 2, g: c * 14, life: 0, max: .3 + Math.random() * .3, r: 1.5 }); }
        for (let k = 0; k < (big ? 8 : 5); k++) parts.push({ kind: 'smoke', x: x + (Math.random() - .5) * c * .5, y, vx: (Math.random() - .5) * c, vy: -c * (.8 + Math.random()), g: 0, life: 0, max: 1 + Math.random() * .7, r: c * .15, grow: c * .7 });
        for (let k = 0; k < 5; k++) { const a = -Math.PI * Math.random(), sp = c * (3 + Math.random() * 3); parts.push({ kind: 'debris', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: c * 16, life: 0, max: .6, r: c * .06 }); }
      }
      function splash(x, y, c) {
        parts.push({ kind: 'ring', x, y, vx: 0, vy: 0, g: 0, life: 0, max: .7, r: c * .12, grow: c * .8 });
        parts.push({ kind: 'ring', x, y, vx: 0, vy: 0, g: 0, life: -.12, max: .6, r: c * .1, grow: c * .55 });
        for (let k = 0; k < 16; k++) { const a = -Math.PI / 2 + (Math.random() - .5) * 1.6, sp = c * (3 + Math.random() * 4.5); parts.push({ kind: 'drop', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: c * 20, life: 0, max: .55 + Math.random() * .3, r: c * (.05 + Math.random() * .06) }); }
      }
      const shake = a => { S.shk = Math.max(S.shk, a); };
      function banner(text, sub, dur = CFG.BANNER_MS) { S.banner = { text, sub, t: performance.now(), dur }; }

      function impact(def, o) {
        const b = boardOf(def), p = cellXY(b, o.i);
        if (o.h) { explode(p.x, p.y, b.cell, false); au.boom(false); shake(7); }
        else { splash(p.x, p.y, b.cell); au.splash(); }
      }
      function sunkFx(def, o) {
        const now = performance.now();
        (o.c || []).forEach((i, n) => at(now + n * 90, () => { const b = boardOf(def), p = cellXY(b, i); explode(p.x, p.y, b.cell, true); }));
        au.sink(); au.boom(true); shake(12);
        const name = NAMES[o.s];
        if (def === S.me) banner(`${nameOf(1 - def)} sunk your ${name}!`, 'Ship lost');
        else banner(`You sunk my ${name}!`, '— ' + nameOf(def));
      }
      function playVolley(def, res, t0) {
        let end = t0, sunk = false, hit = false;
        res.forEach((o, n) => {
          const t = t0 + n * CFG.STAGGER, hitT = t + CFG.FALL;
          shells.push({ pi: def, i: o.i, t: hitT });
          at(t, () => au.whistle());
          at(hitT, () => impact(def, o));
          if (o.s >= 0) { sunk = true; at(hitT + CFG.SINK_AT, () => sunkFx(def, o)); }
          if (o.h) hit = true;
          end = hitT;
        });
        S.busy = end + (sunk ? CFG.AFTER_SINK : hit ? CFG.AFTER_HIT : CFG.AFTER_MISS);
        S.result = { t: t0 + CFG.FALL, def, res };
        S.focusHold = def === S.me ? 1 : 0;
      }
      function turnEnd(lost, hit) {
        const att = S.turn, tb = S.busy;
        if (lost) {
          S.over = true; S.winner = att;
          if (S.mode === 'online') send({ t: 'reveal', r: N.r, ships: S.P[0].ships.map(s => ({ k: s.k, r: s.r, c: s.c, v: s.v })) });
          at(tb + CFG.END_DELAY, finish);
          return;
        }
        const again = S.rules.chain && !S.rules.salvo && hit;
        S.turn = again ? att : 1 - att;
        if (again) S.note = { text: att === S.me ? 'Hit! Fire again.' : nameOf(att) + ' hit and fires again', t: tb, cells: [] };
        if (S.mode === 'cpu') { if (S.turn === 1) at(tb + (again ? 60 : 120), cpuAim); else at(tb, () => au.ping()); }
        else if (S.turn === 0) at(tb, () => au.ping());
      }
      function volley(att, cells) {
        const def = 1 - att, t0 = Math.max(performance.now(), S.busy) + 20, d = defend(S.P[def], cells, t0);
        absorb(S.P[att].view, d.res, t0);
        S.P[att].shots += cells.length; S.P[att].hits += d.res.filter(o => o.h).length;
        S.P[def].last = { res: d.res, t: t0 };
        playVolley(def, d.res, t0);
        if (S.mode === 'cpu') api.score(S.P[0].shots || '—');
        turnEnd(d.lost, d.res.some(o => o.h));
      }
      const freeCells = v => { let n = 0; for (let i = 0; i < 100; i++) if (!v.cells[i]) n++; return n; };
      const shotsAllowed = () => S.rules.salvo ? Math.max(1, Math.min(afloat(S.P[S.me]), freeCells(S.P[S.me].view))) : 1;
      function cpuAim() {
        if (S.screen !== 'battle' || S.over || S.turn !== 1) return;
        const v = S.P[1].view, n = S.rules.salvo ? Math.min(afloat(S.P[1]), freeCells(v)) : 1;
        const cells = aiPick(v, n, S.diff, S.rules.noTouch);
        const now = performance.now(), think = (CFG.THINK[0] + Math.random() * (CFG.THINK[1] - CFG.THINK[0])) * (S.P[1].view.cells.some(v => v === 2) ? .7 : 1) + (portrait ? CFG.SWAP_MS : 0);
        S.cpuAim = { cells, t: now, dur: think, from: Math.floor(Math.random() * 100) };
        au.ping();
        at(now + think, () => { S.cpuAim = null; if (cells.length) volley(1, cells); });
      }
      const canAct = () => S.screen === 'battle' && (!portrait || S.focus === 0) && !S.over && !S.pass && S.turn === S.me && performance.now() >= S.busy && !N.pending && !(S.mode === 'cpu' && S.me !== 0);
      function fireAt(cells) {
        if (!canAct() || !cells.length) return;
        const v = S.P[S.me].view;
        if (cells.some(i => !okCell(i) || v.cells[i])) return;
        S.armed = -1; S.sel = [];
        if (S.mode === 'online') {
          N.pending = { n: N.n, cells: cells.slice() }; S.locked = cells.slice();
          send({ t: 'fire', r: N.r, n: N.n, cells });
          return;
        }
        volley(S.turn, cells);
      }
      function toggleSel(i) {
        const k = S.sel.indexOf(i);
        if (k >= 0) S.sel.splice(k, 1);
        else if (S.sel.length < shotsAllowed()) S.sel.push(i);
        else { api.sfx('bad'); return; }
        api.sfx('tick');
      }
      function fireButton() {
        if (S.rules.salvo) { if (S.sel.length === shotsAllowed()) fireAt(S.sel.slice()); else api.sfx('bad'); }
        else if (S.armed >= 0) fireAt([S.armed]);
        else if (S.aim >= 0 && !S.P[S.me].view.cells[S.aim]) fireAt([S.aim]);
      }

      function contPass() { S.pass = null; }
      function resetRound() {
        S.gen++; api.hideOverlay();
        S.over = false; S.winner = -1; S.busy = 0; S.banner = null; S.sel = []; S.armed = -1; S.locked = null; S.pass = null;
        S.cardHidden = false; S.submitted = false; S.newBest = false; S.note = null; S.cpuAim = null; S.result = null; S.focus = 0; S.focusHold = 0;
        parts.length = 0; shells.length = 0; flashes.length = 0;
        S.P = [mkPlayer(), mkPlayer()]; S.me = 0; S.turn = 0;
      }
      function newPlacement(pi) {
        S.placing = pi; S.me = pi;
        S.pl = CFG.FLEET.map((f, k) => ({ k, r: 0, c: 0, v: 0, on: false }));
        S.drag = null; S.selDock = -1; S.screen = 'place';
      }
      function startGame() {
        S.mode = opt.mode; S.diff = opt.diff;
        resetRound();
        api.score('—');
        if (S.mode === 'online') { goOnline(); return; }
        S.rules = { salvo: opt.salvo, noTouch: opt.noTouch, chain: opt.chain };
        setFleet(S.P[1], randomFleet(S.rules.noTouch)); newPlacement(0);
      }
      function startBattle(first) {
        S.screen = 'battle'; S.turn = first; S.busy = 0; S.aim = 44; S.sel = []; S.armed = -1;
        S.focus = first !== S.me ? 1 : 0; S.focusHold = S.focus;
        const now = performance.now();
        banner(first === S.me ? 'You fire first!' : nameOf(first) + ' fires first', 'Battle stations', 1300);
        if (S.mode === 'cpu' && first === 1) at(now + 1300, cpuAim);
        else if (first === S.me) at(now + 400, () => au.ping());
      }
      function ready() {
        if (S.screen !== 'place' || S.drag) return;
        if (S.mode === 'online' && N.myReady) return;
        if (!S.pl.every(s => s.on)) { api.toast('Place all 5 ships first'); api.sfx('bad'); return; }
        api.sfx('good');
        setFleet(S.P[S.placing], S.pl);
        if (S.mode === 'cpu') { startBattle(S.firstCpu ? 1 : 0); return; }
        N.myReady = true; send({ t: 'ready', r: N.r });
        if (N.role === 'host' && N.theirReady) go();
      }
      function randomize() { if (S.screen !== 'place' || S.drag || (S.mode === 'online' && N.myReady)) return; S.pl = randomFleet(S.rules.noTouch); S.selDock = -1; au.unlock(); api.sfx('pop'); }
      function clearFleet() { if (S.screen !== 'place' || S.drag || (S.mode === 'online' && N.myReady)) return; S.pl.forEach(s => { s.on = false; }); anim.length = 0; S.selDock = -1; api.sfx('tap'); }
      function rotateShip(k) {
        const s = S.pl[k], nv = s.v ? 0 : 1, len = LENS[k];
        for (let sh = 0; sh < len; sh++) {
          const r = nv ? s.r - sh : s.r, c = nv ? s.c : s.c - sh;
          if (canPlace(S.pl, k, r, c, nv, S.rules.noTouch)) { s.r = r; s.c = c; s.v = nv; api.sfx('tick'); return; }
        }
        S.shakeShip = { k, t: performance.now() }; api.sfx('bad');
      }
      function placeSelected(i) {
        const k = S.selDock, r = (i / 10) | 0, c = i % 10, len = LENS[k];
        for (const v of [0, 1]) for (let sh = 0; sh < len; sh++) {
          const rr2 = v ? r - sh : r, cc = v ? c : c - sh;
          if (canPlace(S.pl, k, rr2, cc, v, S.rules.noTouch)) { Object.assign(S.pl[k], { r: rr2, c: cc, v, on: true }); S.selDock = -1; api.sfx('pop'); return; }
        }
        api.sfx('bad');
      }
      function finish() {
        if (S.screen !== 'battle') return;
        S.screen = 'over'; S.cardHidden = false;
        const w = S.winner;
        if (S.mode !== 'online') S.P[S.me].view.reveal = S.P[1 - S.me].ships.map(s => ({ k: s.k, r: s.r, c: s.c, v: s.v }));
        if (S.mode === 'cpu' && w === 0 && !S.submitted) { S.submitted = true; S.newBest = api.submit(S.P[0].shots); }
        api.sfx(w === S.me ? 'win' : 'lose');
      }
      function toMenu() {
        S.gen++; api.hideOverlay();
        if (N.hooked && (S.mode === 'online' || N.role)) { N.role = null; N.live = false; N.pending = null; api.net.close(); }
        S.screen = 'menu'; S.pass = null; S.banner = null; S.drag = null;
        parts.length = 0; shells.length = 0; flashes.length = 0;
        api.score('—');
      }
      function again() {
        if (S.screen !== 'over') return;
        if (S.mode === 'online') { rematch(); return; }
        if (S.mode === 'cpu') S.firstCpu = !S.firstCpu;
        startGame();
      }
      function quit() {
        const now = performance.now();
        if (now - S.quitT < 2200) { S.quitT = 0; toMenu(); } else { S.quitT = now; api.sfx('tap'); }
      }

      const send = m => { if (N.hooked) api.net.send(m); };
      function hookNet() {
        if (N.hooked) return;
        N.hooked = true;
        api.net.on('data', onData);
        api.net.on('close', () => {
          if (S.mode !== 'online' || !N.role) return;
          N.role = null; N.live = false; N.pending = null;
          if (S.screen === 'over') { api.toast('Your friend left'); return; }
          S.gen++; S.over = true; S.pass = null;
          api.sfx('lose');
          api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'New room', onAction: () => startGame(), secondary: 'Menu', onSecondary: toMenu });
        });
      }
      async function goOnline() {
        hookNet();
        N.role = null; N.live = false; N.r = 0; N.pending = null;
        S.screen = 'lobby';
        const role = await api.net.lobby({ title: 'Battleship online', text: 'Create a room and send the code or link to a friend on another device, or type their code to join. The host picks the rules.' });
        if (!api.alive || S.mode !== 'online' || S.screen !== 'lobby') return;
        if (!role) { toMenu(); return; }
        N.role = role; N.live = true; S.screen = 'wait';
        if (role === 'guest') send({ t: 'hi' });
      }
      function hostRound() {
        const first = (N.r + 1) % 2 ? 'host' : 'guest';
        const rules = { salvo: opt.salvo, noTouch: opt.noTouch, chain: opt.chain };
        send({ t: 'setup', r: N.r + 1, salvo: rules.salvo, noTouch: rules.noTouch, chain: rules.chain, first });
        onlineRound(N.r + 1, rules, first);
      }
      function onlineRound(r, rules, first) {
        resetRound();
        N.r = r; N.n = 0; N.pending = null; N.myReady = N.theirReady = N.myRe = N.theirRe = false;
        S.rules = rules; S.first = first === N.role ? 0 : 1;
        newPlacement(0);
        api.sfx('pop');
      }
      function go() { send({ t: 'go', r: N.r }); startBattle(S.first); }
      function incoming(d) {
        if (d.r !== N.r || S.screen !== 'battle' || S.over || S.turn !== 1 || d.n !== N.n) return;
        const me = S.P[0], allowed = S.rules.salvo ? 5 - me.view.sunk.length : 1, cells = Array.isArray(d.cells) ? d.cells : [];
        if (!cells.length || cells.length > allowed || new Set(cells).size !== cells.length || !cells.every(i => okCell(i) && !me.recv[i])) return;
        const t0 = Math.max(performance.now(), S.busy) + 20, r = defend(me, cells, t0);
        send({ t: 'res', r: N.r, n: N.n, res: r.res, lost: r.lost });
        N.n++;
        S.P[1].shots += cells.length; S.P[1].hits += r.res.filter(o => o.h).length;
        me.last = { res: r.res, t: t0 };
        playVolley(0, r.res, t0);
        turnEnd(r.lost, r.res.some(o => o.h));
      }
      function result(d) {
        const p = N.pending;
        if (!p || d.r !== N.r || d.n !== p.n || S.screen !== 'battle' || !Array.isArray(d.res)) return;
        const res = d.res.filter(o => o && okCell(o.i) && p.cells.includes(o.i) && !S.P[0].view.cells[o.i]).map(o => ({
          i: o.i, h: o.h ? 1 : 0,
          s: o.h && Number.isInteger(o.s) && o.s >= 0 && o.s < 5 ? o.s : -1,
          c: Array.isArray(o.c) ? o.c.filter(okCell).slice(0, 5) : []
        }));
        N.pending = null; N.n++; S.locked = null;
        const t0 = Math.max(performance.now(), S.busy) + 20;
        absorb(S.P[0].view, res, t0);
        S.P[0].shots += res.length; S.P[0].hits += res.filter(o => o.h).length;
        playVolley(1, res, t0);
        turnEnd(!!d.lost, res.some(o => o.h));
      }
      const validShip = s => s && Number.isInteger(s.k) && s.k >= 0 && s.k < 5 && fits(s.r, s.c, s.v ? 1 : 0, LENS[s.k]);
      function onData(d) {
        if (S.mode !== 'online' || !N.role || !d || typeof d !== 'object') return;
        const host = N.role === 'host';
        if (d.t === 'hi') { if (host && S.screen === 'wait') hostRound(); }
        else if (d.t === 'setup') { if (!host && Number.isInteger(d.r) && d.r > N.r) onlineRound(d.r, { salvo: !!d.salvo, noTouch: !!d.noTouch, chain: d.chain !== false }, d.first === 'guest' ? 'guest' : 'host'); }
        else if (d.t === 'ready') { if (d.r === N.r && S.screen === 'place') { N.theirReady = true; if (host && N.myReady) go(); } }
        else if (d.t === 'go') { if (!host && d.r === N.r && S.screen === 'place' && N.myReady) startBattle(S.first); }
        else if (d.t === 'fire') incoming(d);
        else if (d.t === 'res') result(d);
        else if (d.t === 'reveal') { if (d.r === N.r && Array.isArray(d.ships)) S.P[0].view.reveal = d.ships.filter(validShip).slice(0, 5).map(s => ({ k: s.k, r: s.r, c: s.c, v: s.v ? 1 : 0 })); }
        else if (d.t === 're') { if (d.r === N.r) { N.theirRe = true; if (S.screen === 'over' && host && N.myRe) hostRound(); else api.sfx('pop'); } }
      }
      function rematch() {
        if (!N.live || S.screen !== 'over' || N.myRe) return;
        N.myRe = true; send({ t: 're', r: N.r });
        if (N.role === 'host' && N.theirRe) hostRound();
      }

      const hitUi = (x, y) => { for (let k = ui.length - 1; k >= 0; k--) { const u = ui[k]; if (!u.dis && x >= u.x && x <= u.x + u.w && y >= u.y && y <= u.y + u.h) return u; } return null; };
      api.on(canvas, 'pointerdown', e => {
        au.unlock();
        if (e.button > 0) return;
        const p = toLocal(e), touch = e.pointerType !== 'mouse';
        if (touch) S.coarse = true;
        S.ptr = { x: p.x, y: p.y, touch };
        e.preventDefault();
        if (S.pass) { contPass(); return; }
        const u = hitUi(p.x, p.y);
        if (u) { S.press = { u: u.id, t: performance.now() }; api.sfx('tap'); u.act(); return; }
        if (S.screen === 'place') placeDown(p, e);
        else if (S.screen === 'battle') battleDown(p, touch);
      });
      function battleDown(p, touch) {
        const i = cellAt(boards().tgt, p.x, p.y);
        if (i < 0 || !canAct()) return;
        S.aim = i;
        if (S.P[S.me].view.cells[i]) { api.sfx('bad'); return; }
        if (S.rules.salvo) { toggleSel(i); return; }
        if (!touch || S.armed === i) fireAt([i]);
        else { S.armed = i; api.sfx('tick'); }
      }
      function placeDown(p, e) {
        if (S.mode === 'online' && N.myReady) return;
        const b = boards().own, i = cellAt(b, p.x, p.y);
        let k = -1, from = null, ox = 0, oy = 0;
        if (i >= 0) {
          k = S.pl.findIndex(s => s.on && cellsOf(s.r, s.c, s.v, LENS[s.k]).includes(i));
          if (k >= 0) { from = 'grid'; const s = S.pl[k]; ox = p.x - (b.gx + s.c * b.cell); oy = p.y - (b.gy + s.r * b.cell); }
        }
        if (k < 0) for (let q = 0; q < 5; q++) {
          const s = S.pl[q], d = dockPos(q);
          if (s.on) continue;
          if (p.x >= d.x - 4 && p.x <= d.x + LENS[q] * CELL + 4 && p.y >= d.y - 6 && p.y <= d.y + CELL + 6) { k = q; from = 'dock'; ox = p.x - d.x; oy = p.y - d.y; break; }
        }
        if (k < 0) { if (i >= 0 && S.selDock >= 0) placeSelected(i); return; }
        S.drag = { k, from, ox, oy, x: p.x, y: p.y, x0: p.x, y0: p.y, moved: false, v: from === 'dock' ? 0 : S.pl[k].v, touch: e.pointerType !== 'mouse', id: e.pointerId };
        if (from === 'dock') { const d = dockPos(k); anim[k] = { x: d.x + LENS[k] * CELL / 2, y: d.y + CELL / 2, a: 0 }; }
        try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      }
      function turnDrag() {
        const d = S.drag;
        if (!d) return;
        d.v ^= 1; const t = d.ox; d.ox = d.oy; d.oy = t; d.moved = true; api.sfx('tick');
      }
      api.on(canvas, 'contextmenu', e => { if (S.screen === 'place') { e.preventDefault(); if (S.drag) turnDrag(); } });
      api.on(canvas, 'wheel', e => { if (S.drag && S.screen === 'place') { e.preventDefault(); turnDrag(); } }, { passive: false });
      function snap(d) {
        const b = boards().own, len = LENS[d.k];
        const gx = d.x - d.ox, gy = d.y - d.oy - (d.touch && d.moved ? CELL : 0);
        const c = Math.round((gx - b.gx) / b.cell), r = Math.round((gy - b.gy) / b.cell);
        const cx = gx + (d.v ? CELL / 2 : len * CELL / 2), cy = gy + (d.v ? len * CELL / 2 : CELL / 2);
        if (cx < b.gx - CELL || cx > b.gx + b.cell * 10 + CELL || cy < b.gy - CELL || cy > b.gy + b.cell * 10 + CELL) return { gx, gy, near: false };
        return { gx, gy, near: true, r, c, ok: canPlace(S.pl, d.k, r, c, d.v, S.rules.noTouch) };
      }
      api.on(window, 'pointermove', e => {
        const p = toLocal(e);
        S.ptr = { x: p.x, y: p.y, touch: e.pointerType !== 'mouse' };
        const d = S.drag;
        if (d && e.pointerId === d.id) { d.x = p.x; d.y = p.y; if (!d.moved && Math.hypot(p.x - d.x0, p.y - d.y0) > 7) d.moved = true; return; }
        if (S.screen === 'battle' && (e.pointerType === 'mouse' || e.buttons)) {
          const i = cellAt(boards().tgt, p.x, p.y);
          if (i >= 0) { S.aim = i; if (e.pointerType !== 'mouse' && S.armed >= 0 && !S.P[S.me].view.cells[i]) S.armed = i; }
        }
      });
      function endDrag(e, cancel) {
        const d = S.drag;
        if (!d || e.pointerId !== d.id) return;
        S.drag = null;
        if (S.screen !== 'place') return;
        const s = S.pl[d.k];
        if (!d.moved && !cancel) {
          if (d.from === 'grid') rotateShip(d.k);
          else { S.selDock = S.selDock === d.k ? -1 : d.k; api.sfx('tap'); }
          return;
        }
        const sn = snap(d);
        if (!cancel && sn.near && sn.ok) { Object.assign(s, { r: sn.r, c: sn.c, v: d.v, on: true }); S.selDock = -1; api.sfx('pop'); }
        else if (d.moved) api.sfx('bad');
      }
      api.on(window, 'pointerup', e => endDrag(e, false));
      api.on(window, 'pointercancel', e => endDrag(e, true));

      const ROWS = [
        { k: 'mode', label: 'Mode', opts: [['cpu', 'vs CPU'], ['online', 'Online']] },
        { k: 'diff', label: 'CPU', opts: [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['expert', 'Admiral']], dis: () => opt.mode !== 'cpu' },
        { k: 'salvo', label: 'Rules', opts: [[false, 'Classic'], [true, 'Salvo']] },
        { k: 'chain', label: 'On a hit', opts: [[true, 'Fire again'], [false, 'Next player']], dis: () => opt.salvo },
        { k: 'noTouch', label: 'Ships', opts: [[false, 'May touch'], [true, 'No touching']] }
      ];
      function setOpt(k, v) { opt[k] = v; saveOpt(); }
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
        if (document.querySelector('.g-overlay.show')) return;
        au.unlock();
        const k = e.code;
        if (S.pass) { if (k === 'Enter' || k === 'Space') { e.preventDefault(); contPass(); } return; }
        if (S.screen === 'menu') {
          if (k === 'Enter' || k === 'Space') { e.preventDefault(); api.sfx('tap'); startGame(); return; }
          if (k === 'ArrowUp' || k === 'ArrowDown') { S.kbd = true; S.menuRow = (S.menuRow + (k === 'ArrowUp' ? ROWS.length - 1 : 1)) % ROWS.length; api.sfx('tick'); }
          if (k === 'ArrowLeft' || k === 'ArrowRight') {
            S.kbd = true;
            const row = ROWS[S.menuRow], o = row.opts, cur = o.findIndex(x => x[0] === opt[row.k]);
            setOpt(row.k, o[(cur + (k === 'ArrowLeft' ? o.length - 1 : 1)) % o.length][0]); api.sfx('tick');
          }
        } else if (S.screen === 'place') {
          if ((k === 'Space' || k === 'KeyQ' || k === 'KeyE') && S.drag) { e.preventDefault(); turnDrag(); }
          else if (k === 'KeyR') randomize();
          else if (k === 'KeyC') clearFleet();
          else if (k === 'Enter') { e.preventDefault(); ready(); }
        } else if (S.screen === 'battle') {
          const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10 }[k];
          if (mv) {
            e.preventDefault();
            const r = (S.aim / 10) | 0, c = S.aim % 10;
            if ((mv === -1 && c > 0) || (mv === 1 && c < 9) || (mv === -10 && r > 0) || (mv === 10 && r < 9)) S.aim += mv;
            S.armed = -1;
          } else if (k === 'Enter' || k === 'Space') {
            e.preventDefault();
            if (!canAct()) return;
            const taken = S.P[S.me].view.cells[S.aim];
            if (S.rules.salvo) { if (k === 'Enter' && S.sel.length === shotsAllowed()) fireButton(); else if (!taken) toggleSel(S.aim); }
            else if (!taken) fireAt([S.aim]); else api.sfx('bad');
          }
        } else if (S.screen === 'over') {
          if (k === 'Enter' || k === 'Space') { e.preventDefault(); again(); }
        }
      });

      function title3d(text, x, y, px) {
        ctx.save();
        ctx.font = F(900, px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        for (let d = 8; d >= 1; d--) { ctx.fillStyle = d > 5 ? '#4a0a0c' : '#a8171c'; ctx.fillText(text, x + d * .45, y + d); }
        ctx.lineWidth = px * .13; ctx.strokeStyle = '#0a1d42'; ctx.strokeText(text, x, y);
        const gr = ctx.createLinearGradient(0, y - px / 2, 0, y + px / 2);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(.55, '#e7eefb'); gr.addColorStop(1, '#b9cbe8');
        ctx.fillStyle = gr; ctx.fillText(text, x, y);
        ctx.restore();
      }
      function drawMenu(now) {
        const ty = portrait ? 60 : 74;
        title3d('BATTLESHIP', W / 2, ty, portrait ? 50 : 72);
        txt('The classic game of naval combat', W / 2, ty + (portrait ? 38 : 50), portrait ? 13 : 15, '#bcd3ff', 'center', 800);
        const bob = Math.sin(now / 700) * 2, hy = portrait ? 116 : 146, hc = portrait ? 28 : 34;
        shipAt(1, W / 2 - hc * 4 - 14, hy + bob, hc, 0);
        shipAt(3, W / 2 + 14, hy - bob, hc, 0);
        ctx.drawImage(pegC[1], W / 2 - hc * 4 - 46, hy + bob, hc, hc);
        ctx.drawImage(pegC[0], W / 2 + 14 + hc * 3 + 8, hy - bob, hc, hc);
        const px = portrait ? 12 : 170, pw = portrait ? 376 : 560, py = portrait ? 156 : 180, rowH = portrait ? 66 : 54, ph = rowH * ROWS.length + 16;
        panel(px, py, pw, ph);
        ROWS.forEach((row, j) => {
          const dis = row.dis && row.dis(), y = py + 8 + j * rowH;
          if (S.kbd && S.menuRow === j) { ctx.strokeStyle = 'rgba(255,209,102,.7)'; ctx.lineWidth = 2; rr(px + 6, y, pw - 12, rowH, 10); ctx.stroke(); }
          let bx, by, bw, bh = 44;
          if (portrait) { txt(row.label.toUpperCase(), px + 16, y + 12, 12, '#9ec0ff', 'left', 900); bx = px + 12; by = y + 22; bw = pw - 24; bh = 40; }
          else { txt(row.label.toUpperCase(), px + 26, y + rowH / 2, 14, '#9ec0ff', 'left', 900); bx = px + 130; by = y + (rowH - 44) / 2 + 1; bw = pw - 146; }
          const n = row.opts.length, gap = 8, w = (bw - gap * (n - 1)) / n;
          row.opts.forEach(([v, label], q) => {
            button('m' + j + q, bx + q * (w + gap), by, w, bh, label, () => { S.kbd = false; S.menuRow = j; setOpt(row.k, v); }, { style: opt[row.k] === v ? 'on' : 'off', dis, fs: portrait ? 14 : 15 });
          });
        });
        const by = py + ph + (portrait ? 12 : 14);
        button('play', W / 2 - (portrait ? 120 : 130), by, portrait ? 240 : 260, 60, opt.mode === 'online' ? 'PLAY ONLINE' : 'PLAY', startGame, { style: 'red', fs: 24, pulse: true });
        txt(S.coarse ? 'Sink all 5 enemy ships to win' : 'Enter to play · arrow keys change options', W / 2, by + 76, 12, '#a8c4ee', 'center', 800);
        txt('White peg = miss · red peg = hit', W / 2, by + 94, 12, '#a8c4ee', 'center', 800);
      }
      function drawWait(text, sub) {
        ctx.fillStyle = 'rgba(4,12,30,.55)'; ctx.fillRect(0, 0, W, H);
        const cw = portrait ? 340 : 420, x = (W - cw) / 2, y = H / 2 - 90;
        panel(x, y, cw, 180, .94);
        txt(text, W / 2, y + 50, 22, '#fff', 'center', 900, cw - 30);
        txt(sub, W / 2, y + 84, 13, '#a8c4ee', 'center', 800, cw - 30);
        button('wmenu', W / 2 - 70, y + 112, 140, 46, 'Leave', toMenu);
      }
      function fleetPanel(x, y, w, h, title, info, cols, ic, rowH, own) {
        panel(x, y, w, h, .78);
        const af = info.filter(s => !s.sunk).length;
        txt(title, x + 12, y + 15, 11, '#9ec0ff', 'left', 900);
        txt(`${af} afloat`, x + w - 12, y + 15, 11, af ? '#cfe0ff' : '#ff8a80', 'right', 900);
        const colW = (w - 16) / cols;
        info.forEach((s, j) => {
          const per = Math.ceil(info.length / cols), col = Math.floor(j / per), row = j % per;
          const cx = x + 10 + col * colW, cy = y + 28 + row * rowH;
          shipAt(s.k, cx, cy + (rowH - ic) / 2 - 1, ic, 0, s.sunk ? .95 : 1, s.sunk);
          const nx = cx + ic * 5 + 6, fs = rowH < 22 ? 11 : 13;
          txt(NAMES[s.k], nx, cy + rowH / 2, fs, s.sunk ? '#ff9a90' : '#fff', 'left', 800);
          if (s.sunk) { ctx.font = F(800, fs); const tw = ctx.measureText(NAMES[s.k]).width; ctx.strokeStyle = '#ff5246'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(nx - 2, cy + rowH / 2); ctx.lineTo(nx + tw + 2, cy + rowH / 2); ctx.stroke(); }
          const st = s.sunk ? 'SUNK' : own ? (s.hits ? `${s.hits}/${LENS[s.k]}` : 'OK') : '';
          if (st) txt(st, cx + colW - 8, cy + rowH / 2, fs - 1, s.sunk ? '#ff5246' : s.hits ? '#ffb347' : '#7ee0a8', 'right', 900);
        });
      }
      const ownInfo = p => p.ships.map(s => ({ k: s.k, hits: s.hits, sunk: s.hits >= s.len }));
      const enemyInfo = v => LENS.map((_, k) => ({ k, sunk: v.sunk.some(s => s.k === k) }));

      function drawOwn(b, now, pl) {
        drawTray(b, 'ocean');
        pl.ships.forEach(s => shipOnBoard(b, s.k, s.r, s.c, s.v));
        for (let i = 0; i < 100; i++) if (pl.recv[i] && now >= pl.recvT[i]) peg(b, i, pl.recv[i] === 2, pl.recvT[i], now);
        if (S.note && now - S.note.t < 4000) {
          const a = 1 - (now - S.note.t) / 4000;
          ctx.strokeStyle = `rgba(255,214,110,${a})`; ctx.lineWidth = 2.5;
          for (const i of S.note.cells) { const p = cellXY(b, i); ctx.beginPath(); ctx.arc(p.x, p.y, b.cell * (.42 + .08 * Math.sin(now / 150)), 0, 7); ctx.stroke(); }
        }
      }
      function drawTarget(b, now, v, interactive) {
        drawTray(b, 'target');
        if (v.reveal && S.screen === 'over') v.reveal.forEach(s => { if (!v.sunk.some(q => q.k === s.k)) shipOnBoard(b, s.k, s.r, s.c, s.v, .6); });
        v.sunk.forEach(s => { if (now >= s.t + CFG.SINK_AT) shipFromCells(b, s.k, s.cells, Math.min(1, (now - s.t - CFG.SINK_AT) / 300), true); });
        for (let i = 0; i < 100; i++) if (v.cells[i] && now >= v.t[i]) peg(b, i, v.cells[i] === 2, v.t[i], now);
        if (!interactive) return;
        if (S.locked) for (const i of S.locked) reticle(b, i, now, '#ff5246', true);
        if (!canAct()) return;
        S.sel.forEach((i, n) => {
          const p = cellXY(b, i);
          ctx.fillStyle = 'rgba(255,140,40,.35)'; ctx.fillRect(p.x - b.cell / 2 + 2, p.y - b.cell / 2 + 2, b.cell - 4, b.cell - 4);
          reticle(b, i, now, '#ff9a3c', true);
          txt(String(n + 1), p.x + b.cell * .3, p.y - b.cell * .3, Math.round(b.cell * .3), '#fff', 'center', 900);
        });
        if (S.armed >= 0) reticle(b, S.armed, now, '#ff5246', true);
        const showAim = S.aim >= 0 && (!S.coarse || S.kbd || (S.ptr && !S.ptr.touch));
        if (showAim && S.aim !== S.armed) reticle(b, S.aim, now, v.cells[S.aim] ? 'rgba(200,210,230,.6)' : '#ffd54a', false);
      }
      function drawShells(now) {
        for (const s of shells) {
          const q = 1 - (s.t - now) / CFG.FALL;
          if (q < 0 || q > 1) continue;
          const b = boardOf(s.pi), p = cellXY(b, s.i), c = b.cell;
          ctx.fillStyle = `rgba(0,0,0,${.15 + q * .35})`; ctx.beginPath(); ctx.ellipse(p.x, p.y, c * (.1 + q * .22), c * (.06 + q * .13), 0, 0, 7); ctx.fill();
          const x = p.x + (1 - q) * c * 1.4, y = p.y - (1 - q) * (1 - q) * c * 6;
          const x2 = p.x + (1 - q + .08) * c * 1.4, y2 = p.y - Math.pow(1 - q + .08, 2) * c * 6;
          ctx.strokeStyle = 'rgba(255,230,180,.5)'; ctx.lineWidth = c * .08; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x2 + (x2 - x) * 2, y2 + (y2 - y) * 2); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = '#2a2f37'; ctx.beginPath(); ctx.arc(x, y, c * (.09 + q * .05), 0, 7); ctx.fill();
        }
      }
      function drawParts(now) {
        for (const f of flashes) {
          const q = (now - f.t) / f.d;
          if (q < 0 || q > 1) continue;
          const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
          gr.addColorStop(0, `rgba(255,255,220,${1 - q})`); gr.addColorStop(.4, `rgba(255,190,60,${.8 * (1 - q)})`); gr.addColorStop(1, 'rgba(255,90,20,0)');
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (.6 + q * .6), 0, 7); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        for (const p of parts) {
          if (p.life < 0) continue;
          const a = p.life / p.max, r = p.r + (p.grow || 0) * a;
          if (p.kind === 'smoke') { ctx.fillStyle = `rgba(55,58,66,${.5 * (1 - a)})`; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
          else if (p.kind === 'drop') { ctx.fillStyle = `rgba(225,242,255,${1 - a * .6})`; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
          else if (p.kind === 'ring') { ctx.strokeStyle = `rgba(230,245,255,${.8 * (1 - a)})`; ctx.lineWidth = 2.5 * (1 - a) + .5; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * .7, 0, 0, 7); ctx.stroke(); }
          else if (p.kind === 'debris') { ctx.fillStyle = '#2b2f36'; ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2); }
        }
        ctx.globalCompositeOperation = 'lighter';
        for (const p of parts) {
          if (p.life < 0) continue;
          const a = p.life / p.max;
          if (p.kind === 'fire') {
            const r = p.r + p.grow * a;
            ctx.fillStyle = a < .3 ? `rgba(255,230,140,${.9 - a})` : `rgba(255,${Math.round(150 - a * 120)},40,${.7 * (1 - a)})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
          } else if (p.kind === 'spark') {
            ctx.strokeStyle = `rgba(255,220,120,${1 - a})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      function drawBanner(now) {
        const b = S.banner;
        if (!b) return;
        const q = (now - b.t) / b.dur;
        if (q >= 1) { S.banner = null; return; }
        if (q < 0) return;
        const sIn = easeBack(Math.min(1, q * 5)), al = q > .85 ? (1 - q) / .15 : 1;
        const cy = portrait ? 236 : 256, bw = portrait ? 384 : 640, bh = portrait ? 74 : 86;
        ctx.save(); ctx.globalAlpha = al; ctx.translate(W / 2, cy); ctx.scale(sIn, sIn);
        ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#7a1212'; ctx.beginPath(); ctx.moveTo(-bw / 2 - 18, -bh / 2 + 10); ctx.lineTo(-bw / 2, -bh / 2 + 10); ctx.lineTo(-bw / 2, bh / 2 + 6); ctx.lineTo(-bw / 2 - 18, bh / 2 + 6); ctx.lineTo(-bw / 2 - 8, bh / 4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bw / 2 + 18, -bh / 2 + 10); ctx.lineTo(bw / 2, -bh / 2 + 10); ctx.lineTo(bw / 2, bh / 2 + 6); ctx.lineTo(bw / 2 + 18, bh / 2 + 6); ctx.lineTo(bw / 2 + 8, bh / 4); ctx.closePath(); ctx.fill();
        const gr = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2); gr.addColorStop(0, '#e53935'); gr.addColorStop(1, '#a51b1b');
        ctx.fillStyle = gr; rr(-bw / 2, -bh / 2, bw, bh, 10); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; rr(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10, 7); ctx.stroke();
        txt(b.text.toUpperCase(), 0, b.sub ? -9 : 0, portrait ? 22 : 30, '#fff', 'center', 900, bw - 40);
        if (b.sub) txt(b.sub, 0, bh / 2 - 17, portrait ? 12 : 14, '#ffd9d4', 'center', 800);
        ctx.restore();
      }
      function resultText(now) {
        const r = S.result, att = 1 - r.def, coords = r.res.map(o => coord(o.i)).join(', ');
        const who = r.def === S.me ? nameOf(att) + ' fired' : 'Firing';
        if (now < r.t) return `${who} at ${coords}…`;
        const hits = r.res.filter(o => o.h).length, sunk = r.res.some(o => o.s >= 0);
        if (r.res.length === 1) return `${r.def === S.me ? nameOf(att) + ' fired at ' : ''}${coords}: ${sunk ? 'Sunk!' : hits ? 'Hit!' : 'Miss'}`;
        return `${r.def === S.me ? nameOf(att) + "'s salvo" : 'Salvo'}: ${hits} hit${hits === 1 ? '' : 's'}, ${r.res.length - hits} miss${r.res.length - hits === 1 ? '' : 'es'}`;
      }
      function statusText(now) {
        if (S.screen === 'place') {
          if (S.mode === 'online' && N.myReady) return N.theirReady ? 'Starting…' : 'Waiting for your friend to deploy…';
          return 'Deploy your fleet';
        }
        if (S.screen === 'over') {
          return S.winner === S.me ? 'Victory! Enemy fleet destroyed' : 'Defeat: your fleet is sunk';
        }
        if (N.pending) return 'Firing at ' + N.pending.cells.map(coord).join(', ') + '…';
        if (S.result && now < S.busy) return resultText(now);
        if (S.over) return 'Battle over';
        if (S.turn === S.me) {
          if (S.note && now - S.note.t < 4000) return S.note.text;
          if (S.rules.salvo) return `Salvo: pick ${shotsAllowed()} targets (${S.sel.length} picked)`;
          return S.armed >= 0 ? `Tap ${coord(S.armed)} again or FIRE` : 'Your turn: pick a target';
        }
        return nameOf(S.turn) + ' is aiming…';
      }
      function drawHud(now) {
        const st = statusText(now);
        if (portrait) {
          txt(st, 12, 23, 16, '#fff', 'left', 900, 300);
        } else {
          txt(st, 30, 28, 20, '#fff', 'left', 900, 560);
        }
        if (S.mode === 'online' && N.live && api.net.connected) txt(`online · ${api.net.rtt || '…'} ms`, portrait ? 316 : 784, portrait ? 40 : 56, 10, '#8fb3ff', 'right', 800);
        const quitting = now - S.quitT < 2200;
        if (portrait) button('quit', 322, 4, 72, 38, quitting ? 'Quit?' : 'Menu', quit, { style: quitting ? 'red' : 'navy', fs: 14 });
        else button('quit', 792, 8, 86, 40, quitting ? 'Quit?' : 'Menu', quit, { style: quitting ? 'red' : 'navy', fs: 15 });
      }
      function drawPlace(now) {
        const b = boards().own;
        drawTray(b, 'ocean');
        if (!portrait) { txt('YOUR OCEAN', b.x + 4, 56, 12, '#9ec0ff', 'left', 900); }
        const d = S.drag, locked = S.mode === 'online' && N.myReady;
        const dtp = Math.min(.05, Math.max(0, (now - (lastPlace || now)) / 1000)); lastPlace = now;
        const fA = 1 - Math.exp(-dtp * 15);
        S.pl.forEach(s => {
          if (!s.on || (d && d.k === s.k)) return;
          let ox = 0;
          if (S.shakeShip && S.shakeShip.k === s.k && now - S.shakeShip.t < 300) ox = Math.sin((now - S.shakeShip.t) / 18) * 4;
          const len = LENS[s.k], tx = b.gx + (s.c + (s.v ? .5 : len / 2)) * b.cell, ty = b.gy + (s.r + (s.v ? len / 2 : .5)) * b.cell, ta = s.v ? Math.PI / 2 : 0;
          const A = anim[s.k] || (anim[s.k] = { x: tx, y: ty, a: ta });
          A.x += (tx - A.x) * fA; A.y += (ty - A.y) * fA; A.a += (ta - A.a) * fA;
          if (Math.abs(tx - A.x) < .05) A.x = tx; if (Math.abs(ty - A.y) < .05) A.y = ty; if (Math.abs(ta - A.a) < .002) A.a = ta;
          shipMid(s.k, A.x + ox, A.y, b.cell, A.a);
        });
        if (!portrait) {
          panel(490, 66, 381, 381);
          txt('DRAG YOUR SHIPS', 512, 92, 13, '#9ec0ff', 'left', 900);
          txt(S.rules.salvo ? 'Salvo rules' : 'Classic rules', 850, 92, 12, '#cfe0ff', 'right', 800);
        }
        for (let k = 0; k < 5; k++) {
          const s = S.pl[k], p = dockPos(k), w = LENS[k] * CELL;
          ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(170,200,255,.35)'; ctx.lineWidth = 1.5; rr(p.x, p.y + 3, w, CELL - 6, 10); ctx.stroke(); ctx.setLineDash([]);
          if (!s.on && !(d && d.k === k)) {
            if (S.selDock === k) { ctx.fillStyle = 'rgba(255,209,102,.3)'; rr(p.x - 4, p.y - 3, w + 8, CELL + 6, 10); ctx.fill(); }
            shipAt(k, p.x, p.y, CELL, 0);
          }
          if (!portrait) txt(`${NAMES[k]} (${LENS[k]})`, p.x + w + 14, p.y + CELL / 2, 14, s.on ? '#7ee0a8' : '#fff', 'left', 800);
        }
        if (!portrait) txt(S.rules.noTouch ? 'Ships may not touch' : 'Ships may touch, no overlaps', 512, 408, 12, '#a8c4ee', 'left', 800);
        if (d && d.moved) {
          const sn = snap(d), len = LENS[d.k];
          if (sn.near) {
            for (let q = 0; q < len; q++) {
              const r = sn.r + (d.v ? q : 0), c = sn.c + (d.v ? 0 : q);
              if (r < 0 || r > 9 || c < 0 || c > 9) continue;
              ctx.fillStyle = sn.ok ? 'rgba(80,230,140,.4)' : 'rgba(255,70,60,.45)';
              ctx.fillRect(b.gx + c * b.cell + 1, b.gy + r * b.cell + 1, b.cell - 2, b.cell - 2);
            }
          }
          if (sn.near && sn.ok) shipOnBoard(b, d.k, sn.r, sn.c, d.v, .3);
          const tx = sn.gx + (d.v ? CELL / 2 : len * CELL / 2), ty = sn.gy + (d.v ? len * CELL / 2 : CELL / 2), ta = d.v ? Math.PI / 2 : 0;
          const A = anim[d.k] || (anim[d.k] = { x: tx, y: ty, a: ta }), fD = 1 - Math.exp(-dtp * 30);
          A.x += (tx - A.x) * fD; A.y += (ty - A.y) * fD; A.a += (ta - A.a) * (1 - Math.exp(-dtp * 18));
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 9;
          shipMid(d.k, A.x, A.y, CELL * 1.04, A.a, .95);
          ctx.restore();
        }
        const all = S.pl.every(s => s.on);
        if (portrait) {
          button('rnd', 10, 532, 120, 46, 'Random', randomize, { dis: locked });
          button('clr', 138, 532, 120, 46, 'Clear', clearFleet, { dis: locked });
          button('rdy', 266, 532, 124, 46, locked ? 'Waiting…' : 'Ready', ready, { style: 'red', dis: !all || locked, pulse: all && !locked });
          txt(S.selDock >= 0 ? 'Now tap a square to place it' : 'Drag ships onto the grid · tap a ship to rotate', W / 2, 598, 12, '#cfe0ff', 'center', 800, 380);
          txt((S.rules.salvo ? 'Salvo' : 'Classic') + ' rules · ' + (S.rules.noTouch ? 'ships may not touch' : 'ships may touch'), W / 2, 618, 11, '#8fb3ff', 'center', 800, 380);
        } else {
          button('rnd', 490, 462, 120, 48, 'Random', randomize, { dis: locked });
          button('clr', 620, 462, 120, 48, 'Clear', clearFleet, { dis: locked });
          button('rdy', 750, 462, 121, 48, locked ? 'Waiting…' : 'Ready', ready, { style: 'red', dis: !all || locked, pulse: all && !locked });
          txt('Drag ships onto your ocean grid.', 34, 470, 14, '#fff', 'left', 800);
          txt(S.coarse ? 'Tap a placed ship to rotate it.' : 'Click a ship to rotate · Space or right-click while dragging', 34, 492, 13, '#cfe0ff', 'left', 800);
          txt('R = random fleet · C = clear · Enter = ready', 34, 512, 13, '#8fb3ff', 'left', 800);
        }
        if (locked) {
          ctx.fillStyle = 'rgba(4,12,30,.45)'; ctx.fillRect(portrait ? 0 : 490, portrait ? 430 : 66, portrait ? W : 381, portrait ? 96 : 381);
          txt(N.theirReady ? 'Starting…' : 'Waiting for your friend…', portrait ? W / 2 : 680, portrait ? 478 : 256, 18, '#fff', 'center', 900);
        }
      }
      function drawBattle(now) {
        const { own, tgt } = boards(), me = S.P[S.me];
        const tgtActive = (S.turn === S.me && now >= S.busy && !S.over) || (now < S.busy && S.focusHold === 0);
        const ownActive = !tgtActive && !S.over && S.screen === 'battle';
        const glow = (b, on) => { if (!on) return; ctx.save(); ctx.shadowColor = 'rgba(255,214,110,.9)'; ctx.shadowBlur = 16 + 6 * Math.sin(now / 250); ctx.strokeStyle = 'rgba(255,214,110,.8)'; ctx.lineWidth = 3; rr(b.x - 3, b.y - 3, b.size + 6, b.size + 6, 16); ctx.stroke(); ctx.restore(); };
        const sx = S.shk ? (Math.random() - .5) * S.shk : 0, sy = S.shk ? (Math.random() - .5) * S.shk : 0;
        ctx.save(); ctx.translate(sx, sy);
        const drawO = () => { glow(own, ownActive && S.screen === 'battle'); drawOwn(own, now, me); if (S.cpuAim || (S.mode === 'online' && S.turn !== S.me && now >= S.busy && !S.over)) sonar(own, now); if (S.cpuAim) cpuReticle(own, now); };
        const drawT = () => { glow(tgt, tgtActive && S.screen === 'battle'); drawTarget(tgt, now, me.view, S.screen === 'battle'); };
        if (portrait && S.focus > .5) { drawT(); drawO(); } else { drawO(); drawT(); }
        drawShells(now);
        drawParts(now);
        ctx.restore();
        if (!portrait) {
          txt('YOUR OCEAN', own.x + 4, 56, 12, '#9ec0ff', 'left', 900);
          txt('TARGET GRID', tgt.x + 4, 56, 12, '#9ec0ff', 'left', 900);
          fleetPanel(30, 456, 381, 124, 'YOUR FLEET', ownInfo(me), 2, 10, 28, true);
          fleetPanel(490, 456, 381, 124, 'ENEMY FLEET', enemyInfo(me.view), 2, 10, 28, false);
          const acc = me.shots ? Math.round(me.hits / me.shots * 100) + '%' : '—';
          [['SHOTS', me.shots], ['HITS', me.hits], ['ACC', acc]].forEach(([k, v], j) => {
            txt(k, 450, 180 + j * 64, 11, '#9ec0ff', 'center', 900);
            txt(String(v), 450, 202 + j * 64, 22, '#fff', 'center', 900);
          });
          if (S.rules.salvo && S.screen === 'battle') {
            const n = afloat(me);
            txt('SALVO', 450, 384, 11, '#ffd166', 'center', 900);
            for (let k = 0; k < n; k++) { ctx.fillStyle = k < S.sel.length ? '#ff9a3c' : '#e8ecf1'; rr(434 + (k % 3) * 12, 396 + Math.floor(k / 3) * 22, 8, 18, 4); ctx.fill(); }
          }
        } else {
          const enemyView = S.focus < .5;
          if (enemyView) fleetPanel(206, 432, 186, 112, 'ENEMY FLEET', enemyInfo(me.view), 1, 9, 16.4, false);
          else fleetPanel(206, 432, 186, 112, 'YOUR FLEET', ownInfo(me), 1, 9, 16.4, true);
          const acc = me.shots ? Math.round(me.hits / me.shots * 100) + '%' : '—';
          txt(`Shots ${me.shots} · Hits ${me.hits} · ${acc}`, 299, 620, 12, '#cfe0ff', 'center', 800, 186);
        }
        if (S.screen === 'battle') {
          const need = S.rules.salvo || S.armed >= 0 || S.coarse;
          if (need) {
            const n = shotsAllowed(), ready2 = canAct() && (S.rules.salvo ? S.sel.length === n : S.armed >= 0);
            const label = S.rules.salvo ? `FIRE ${S.sel.length}/${n}` : 'FIRE';
            if (portrait) button('fire', 206, 552, 186, 50, label, fireButton, { style: 'red', dis: !ready2, pulse: ready2, fs: 20 });
            else button('fire', 646, 8, 136, 40, label, fireButton, { style: 'red', dis: !ready2, pulse: ready2, fs: 16 });
          }
        } else if (S.cardHidden) {
          if (portrait) button('res', 206, 552, 186, 50, 'Results', () => { S.cardHidden = false; }, { style: 'red', fs: 18 });
          else button('res', 646, 8, 136, 40, 'Results', () => { S.cardHidden = false; }, { style: 'red', fs: 16 });
        }
      }
      function cpuReticle(b, now) {
        const a = S.cpuAim, t = a.cells[0];
        if (t == null) return;
        const q = Math.min(1, (now - a.t) / (a.dur * .75)), e = easeIO(q);
        const f = cellXY(b, a.from), p = cellXY(b, t);
        const x = f.x + (p.x - f.x) * e, y = f.y + (p.y - f.y) * e;
        const fake = { ...b, gx: x - b.cell / 2, gy: y - b.cell / 2 };
        reticle(fake, 0, now, q >= 1 ? '#ff5246' : '#7dffc4', q >= 1);
        if (q >= 1) a.cells.slice(1).forEach(i => reticle(b, i, now, '#ff5246', true));
      }
      function drawCard(now) {
        ctx.fillStyle = 'rgba(3,10,26,.5)'; ctx.fillRect(0, 0, W, H);
        const cw = portrait ? 364 : 440, ch = 268, x = (W - cw) / 2, y = portrait ? 150 : 150;
        panel(x, y, cw, ch, .96);
        const two = false, win = S.winner === S.me, me = S.P[S.me];
        const kick = S.newBest ? 'NEW BEST!' : S.mode === 'cpu' ? 'VS CPU · ' + (S.diff === 'expert' ? 'ADMIRAL' : S.diff.toUpperCase()) : 'ONLINE';
        txt(kick, W / 2, y + 26, 13, S.newBest ? '#ffd166' : '#8fb3ff', 'center', 900);
        title3d(two ? `PLAYER ${S.winner + 1} WINS!` : win ? 'VICTORY!' : 'DEFEAT', W / 2, y + 70, portrait ? 38 : 44);
        txt(win ? (two ? `Player ${S.winner + 1} sank the whole fleet.` : 'You sank the entire enemy fleet.') : 'Your whole fleet has been sunk.', W / 2, y + 110, 14, '#cfe0ff', 'center', 800, cw - 30);
        const acc = me.shots ? Math.round(me.hits / me.shots * 100) + '%' : '—';
        const stats = [['SHOTS', me.shots], ['HITS', me.hits], ['ACCURACY', acc]];
        if (S.mode === 'cpu') stats.push(['BEST', api.best != null ? api.best : '—']);
        const sw = (cw - 30) / stats.length;
        stats.forEach(([k, v], j) => {
          const sx = x + 15 + j * sw;
          ctx.fillStyle = 'rgba(255,255,255,.07)'; rr(sx + 3, y + 128, sw - 6, 54, 10); ctx.fill();
          txt(k, sx + sw / 2, y + 143, 10, '#9ec0ff', 'center', 900);
          txt(String(v), sx + sw / 2, y + 166, 20, '#fff', 'center', 900);
        });
        let line = '';
        if (S.mode === 'online') line = !N.live ? 'Your friend left.' : N.myRe ? (N.theirRe ? 'Starting…' : 'Waiting for your friend…') : N.theirRe ? 'Your friend wants a rematch!' : '';
        if (line) txt(line, W / 2, y + 196, 13, '#ffd166', 'center', 900);
        const bw = (cw - 40) / 3, by = y + 208;
        button('again', x + 12, by, bw + 16, 48, S.mode === 'online' ? (N.myRe ? 'Waiting…' : 'Rematch') : 'Play again', again, { style: 'red', dis: S.mode === 'online' && (!N.live || N.myRe), fs: 16 });
        button('menu2', x + 20 + bw + 16, by, bw - 8, 48, 'Menu', toMenu, { fs: 16 });
        button('view', x + 28 + bw * 2 + 8, by, bw - 8, 48, 'Boards', () => { S.cardHidden = true; }, { fs: 16 });
      }

      function update(dt, now) {
        const goal = S.screen === 'over' ? 0 : S.screen !== 'battle' ? 0 : now < S.busy ? S.focusHold : S.over ? S.focusHold : S.turn === S.me ? 0 : 1;
        const step = dt * 1000 / CFG.SWAP_MS;
        S.focus = S.focus < goal ? Math.min(goal, S.focus + step) : Math.max(goal, S.focus - step);
        for (let k = parts.length - 1; k >= 0; k--) {
          const p = parts[k];
          p.life += dt;
          if (p.life > p.max) { parts.splice(k, 1); continue; }
          if (p.life < 0) continue;
          p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.kind === 'fire' || p.kind === 'smoke') { p.vx *= .96; p.vy *= .96; }
        }
        if (parts.length > 700) parts.splice(0, parts.length - 700);
        for (let k = shells.length - 1; k >= 0; k--) if (now > shells[k].t + 60) shells.splice(k, 1);
        for (let k = flashes.length - 1; k >= 0; k--) if (now > flashes[k].t + flashes[k].d) flashes.splice(k, 1);
        S.shk = S.shk > .3 ? S.shk * Math.pow(.004, dt) : 0;
        if ((S.screen === 'battle' || S.screen === 'over') && !S.pass && Math.random() < dt * 3) {
          const { own, tgt } = boards(), me = S.P[S.me], pool = [];
          me.view.sunk.forEach(s => { if (now > s.t + CFG.SINK_AT) s.cells.forEach(i => pool.push([tgt, i])); });
          me.ships.forEach(s => s.cells.forEach(i => { if (me.recv[i] === 2 && now > me.recvT[i] + 600) pool.push([own, i]); }));
          if (pool.length) {
            const [b, i] = pool[Math.floor(Math.random() * pool.length)], p = cellXY(b, i);
            parts.push({ kind: 'smoke', x: p.x + (Math.random() - .5) * b.cell * .3, y: p.y, vx: b.cell * .25, vy: -b.cell * .7, g: 0, life: 0, max: 1.4, r: b.cell * .08, grow: b.cell * .4 });
          }
        }
      }
      let frame = 0;
      function draw(now) {
        ui = [];
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(bgC, 0, 0, W, H);
        const vg = ctx.createRadialGradient(W / 2, H * .45, H * .2, W / 2, H * .5, H * .85);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,10,28,.32)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        const sc = S.screen;
        if (sc === 'menu' || sc === 'lobby') drawMenu(now);
        else if (sc === 'wait') { drawMenu(now); ui = []; drawWait(N.role === 'host' ? 'Friend connected!' : 'Connected!', N.role === 'host' ? 'Setting up the battle…' : 'Waiting for the host to start…'); }
        else if (sc === 'place') { drawPlace(now); drawHud(now); }
        else if (sc === 'battle' || sc === 'over') {
          drawBattle(now); drawHud(now); drawBanner(now);
          if (sc === 'over' && !S.cardHidden) drawCard(now);
        }
        canvas.style.cursor = S.ptr && !S.ptr.touch && hitUi(S.ptr.x, S.ptr.y) ? 'pointer' : sc === 'place' && S.drag ? 'grabbing' : 'default';
      }
      api.loop((dt, t) => {
        const now = performance.now();
        if ((frame++ & 1) === 0) water(now / 1000);
        update(dt, now);
        draw(now);
      });
      draw(performance.now());

      root._sb = { S, N, opt, boards, W, H, startGame, ready, randomize, canAct };
      if (api.net.invite) { opt.mode = 'online'; startGame(); }
      return { destroy() { S.gen++; au.close(); delete root._sb; } };
    }
  });

  Ameplay.covers['sea-battle'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="sbt-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6fc0"/><stop offset="1" stop-color="#0f3a78"/></linearGradient>
<linearGradient id="sbt-tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a6abb"/><stop offset="1" stop-color="#173a73"/></linearGradient>
<linearGradient id="sbt-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f5"/><stop offset=".5" stop-color="#a9b0ba"/><stop offset="1" stop-color="#5b626c"/></linearGradient>
<radialGradient id="sbt-red" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff9284"/><stop offset=".6" stop-color="#e5352b"/><stop offset="1" stop-color="#a31b14"/></radialGradient>
<radialGradient id="sbt-wht" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#eef1f5"/><stop offset="1" stop-color="#b9c0ca"/></radialGradient>
<radialGradient id="sbt-boom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient><pattern id="sbt-hp" x="22" y="20" width="45" height="49.5" patternUnits="userSpaceOnUse"><path d="M45 0v49.5M0 49.5h45" stroke="#3b62a8" stroke-width="3" opacity=".55"/><circle cx="22.5" cy="24.75" r="7" fill="#040b1a"/></pattern></defs>
<rect width="400" height="300" fill="url(#sbt-bg)"/>
<path d="M0 60q50-14 100 0t100 0 100 0 100 0M0 250q50-14 100 0t100 0 100 0 100 0" stroke="#5fa4e8" stroke-width="5" fill="none" opacity=".45"/>
<g transform="translate(46 34)"><rect x="6" y="10" width="308" height="236" rx="18" fill="#08224d" opacity=".45"/><rect width="308" height="236" rx="18" fill="url(#sbt-tray)"/>
<rect x="22" y="20" width="270" height="198" rx="8" fill="#0e2246"/>
<rect x="22" y="20" width="270" height="198" fill="url(#sbt-hp)"/></g>
<g transform="translate(70 120)"><path d="M10 0h176q34 0 50 26-16 26-50 26H10Q0 52 0 42V10Q0 0 10 0z" fill="#0a2550" opacity=".4" transform="translate(6 8)"/>
<path d="M10 0h176q34 0 50 26-16 26-50 26H10Q0 52 0 42V10Q0 0 10 0z" fill="url(#sbt-hull)" stroke="#30363f" stroke-width="3"/>
<rect x="78" y="10" width="62" height="32" rx="5" fill="#f3f5f8" stroke="#38404a" stroke-width="3"/><rect x="94" y="16" width="30" height="20" rx="4" fill="#fff" stroke="#38404a" stroke-width="2"/>
<g fill="#454c56"><rect x="8" y="20" width="30" height="5"/><rect x="8" y="28" width="30" height="5"/><rect x="170" y="20" width="30" height="5"/><rect x="170" y="28" width="30" height="5"/></g>
<circle cx="44" cy="26" r="12" fill="#c7cdd5" stroke="#333a43" stroke-width="3"/><circle cx="164" cy="26" r="12" fill="#c7cdd5" stroke="#333a43" stroke-width="3"/>
<g fill="#1a1e24"><circle cx="22" cy="26" r="4"/><circle cx="66" cy="26" r="4"/><circle cx="150" cy="26" r="4"/><circle cx="196" cy="26" r="4"/></g></g>
<circle cx="218" cy="138" r="40" fill="url(#sbt-boom)"/>
<g><circle cx="222" cy="149" r="17" fill="#9a1510"/><circle cx="218" cy="141" r="16" fill="url(#sbt-red)"/><ellipse cx="212" cy="134" rx="5" ry="3" fill="#fff" opacity=".8"/></g>
<g><circle cx="292" cy="88" r="15" fill="#9fa7b2"/><circle cx="288" cy="81" r="14" fill="url(#sbt-wht)"/></g>
<g><circle cx="98" cy="232" r="15" fill="#9fa7b2"/><circle cx="94" cy="225" r="14" fill="url(#sbt-wht)"/></g>
<g><circle cx="300" cy="232" r="15" fill="#9a1510"/><circle cx="296" cy="225" r="14" fill="url(#sbt-red)"/></g>
<g stroke="#ffd54a" stroke-width="6" stroke-linecap="round" fill="none"><path d="M318 170v-12h12M354 158h12v12M366 194v12h-12M330 206h-12v-12"/><path d="M342 172v20M332 182h20"/></g>
<g fill="#e1f2ff"><circle cx="256" cy="74" r="4"/><circle cx="270" cy="62" r="3"/><circle cx="306" cy="66" r="3.5"/><circle cx="314" cy="80" r="3"/></g>
</svg>`;
})();

