
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const svCopy = v => JSON.parse(JSON.stringify(v));
  const svFix = (def, s) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return svCopy(def);
    const out = Object.assign({}, s);
    for (const k of Object.keys(def)) {
      const a = def[k], b = s[k];
      if (typeof a === 'number') out[k] = typeof b === 'number' && isFinite(b) ? b : a;
      else if (typeof a === 'boolean') out[k] = b == null ? a : !!b;
      else if (typeof a === 'string') out[k] = typeof b === 'string' && b ? b : a;
      else if (Array.isArray(a)) out[k] = Array.isArray(b) ? b : svCopy(a);
      else if (a && typeof a === 'object') out[k] = svFix(a, b);
      else if (b === undefined) out[k] = a;
    }
    return out;
  };
  const svOnly = (def, s) => { for (const k of Object.keys(s)) if (!Object.prototype.hasOwnProperty.call(def, k)) delete s[k]; return s; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = a => a[Math.random() * a.length | 0];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const eo = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const eio = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bounce = t => { t = clamp(t, 0, 1); return 1 + Math.sin(t * Math.PI) * .25 * (1 - t); };
  const FONT = '"Trebuchet MS", "Segoe UI", "Arial Rounded MT Bold", system-ui, sans-serif';
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  const short = n => {
    n = Math.floor(n);
    if (n < 10000) return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let i = 0, v = n;
    while (v >= 1000 && i < SUF.length - 1) { v /= 1000; i++; }
    return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace(/\.?0+$/, '') + SUF[i];
  };
  const money = n => '$' + short(n);
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const shade = (c, k) => {
    let [r, g, b] = rgb(c);
    if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | (b | 0)).toString(16).slice(1);
  };
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return '#' + ((1 << 24) | (Math.round(lerp(x[0], y[0], t)) << 16) | (Math.round(lerp(x[1], y[1], t)) << 8) | Math.round(lerp(x[2], y[2], t))).toString(16).slice(1); };
  const alpha = (c, a) => { const [r, g, b] = rgb(c); return `rgba(${r},${g},${b},${a})`; };
  const rrp = (c, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const tr = (s, o) => { const g = window.gpI18n; if (g && g.t) return g.t(s, o); return o ? String(s).replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : s; };
  const i18 = (s, o) => tr(s, o);
  const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const makeAudio = api => {
    let ac = null, master = null, nb = null;
    const get = () => {
      if (!ac) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
          nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nb.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; }
      }
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const tone = (f, d = .12, type = 'sine', v = .08, f2 = 0, delay = 0) => {
      if (api.muted) return;
      const a = get(); if (!a) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(master); o.start(t); o.stop(t + d + .04);
    };
    const noise = (d = .2, v = .1, fc = 1500, delay = 0, type = 'lowpass', f2 = 0) => {
      if (api.muted) return;
      const a = get(); if (!a) return;
      const t = a.currentTime + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nb; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(fc, t);
      if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + d + .05);
    };
    const close = () => { if (ac) { try { ac.close(); } catch (e) {} ac = null; } };
    return { tone, noise, get, close };
  };

  const makeMusic = (au, o) => {
    const { bpm = 100, root = 261.63, scale = [0, 2, 4, 7, 9], pat = [0, 2, 4, 2, 5, 4, 2, 1], bass = [0, 0, 3, 4], wave = 'triangle', vol = .035 } = o;
    let acc = 0, step = 0, on = true;
    const sp = 60 / bpm / 2;
    const deg = (d, oct = 0) => root * Math.pow(2, (scale[((d % scale.length) + scale.length) % scale.length] + 12 * (Math.floor(d / scale.length) + oct)) / 12);
    return {
      get on() { return on; },
      toggle() { on = !on; return on; },
      update(dt) {
        if (!on) return;
        acc += dt;
        if (acc > .5) acc = 0;
        while (acc >= sp) {
          acc -= sp;
          const n = pat[step % pat.length];
          if (n >= 0) au.tone(deg(n, 1), sp * 1.7, wave, vol, 0);
          if (step % 4 === 0) au.tone(deg(bass[(step >> 2) % bass.length], -1), sp * 3.2, 'sine', vol * 1.6, 0);
          if (step % 2 === 1) au.noise(.03, vol * .5, 6000, 0, 'highpass');
          step++;
        }
      }
    };
  };

  const makeStage = (api, W, H) => {
    const { canvas, ctx, toLocal } = api.canvas(W, H);
    canvas.style.touchAction = 'none';
    const S = {
      W, H, ctx, canvas, api, mx: -999, my: -999, down: false, downX: 0, downY: 0, pressed: false, released: false, moved: 0,
      keys: new Set(), hit: new Set(), hitS: new Set(), pressedS: false, lock: false, mkScr: false, downBtn: false, cursor: 'default', t: 0, fx: [], shake: 0, onKey: null, onWheel: null, wheel: 0, touch: false
    };
    const au = S.au = makeAudio(api);
    const coarse = window.matchMedia ? matchMedia('(pointer: coarse)') : { matches: false };
    S.rotOn = () => !S.rotOff && coarse.matches && innerHeight > innerWidth * 1.1;
    api.on(canvas, 'pointerdown', e => {
      if (S.rotOn()) { S.rotOff = true; e.preventDefault(); return; }
      const p = toLocal(e);
      S.mx = p.x; S.my = p.y; S.downX = p.x; S.downY = p.y; S.down = true; S.pressed = true; S.moved = 0;
      S.touch = e.pointerType === 'touch'; S.downBtn = false; S.pressedS = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      au.get();
      e.preventDefault();
    });
    api.on(canvas, 'pointermove', e => {
      const p = toLocal(e);
      S.moved += Math.abs(p.x - S.mx) + Math.abs(p.y - S.my);
      S.mx = p.x; S.my = p.y;
      if (e.pointerType === 'touch') S.touch = true;
    });
    const up = e => {
      if (e.type === 'pointercancel') { S.down = false; return; }
      const p = toLocal(e);
      S.mx = p.x; S.my = p.y;
      if (S.down) { S.down = false; S.released = true; }
    };
    api.on(canvas, 'pointerup', up);
    api.on(canvas, 'pointercancel', up);
    api.on(canvas, 'pointerleave', e => { if (!S.down && e.pointerType !== 'touch') { S.mx = -999; S.my = -999; } });
    api.on(canvas, 'wheel', e => { S.wheel += Math.sign(e.deltaY); if (S.onWheel) { e.preventDefault(); } }, { passive: false });
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (!S.keys.has(e.code)) { S.hit.add(e.code); S.hitS.add(e.code); }
      S.keys.add(e.code);
      S.lastKey = e.key;
      if (S.onKey) S.onKey(e);
    });
    api.on(window, 'keyup', e => S.keys.delete(e.code));
    api.on(window, 'blur', () => { S.keys.clear(); S.down = false; });
    S.inside = (x, y, w, h, px = S.mx, py = S.my) => px >= x && px <= x + w && py >= y && py <= y + h;
    S.hover = (x, y, w, h) => !S.lock && S.inside(x, y, w, h);
    S.clickIn = (x, y, w, h) => !S.lock && S.released && S.inside(x, y, w, h) && S.inside(x, y, w, h, S.downX, S.downY);
    S.pressIn = (x, y, w, h) => !S.lock && S.pressed && S.inside(x, y, w, h);
    S.key = c => S.hit.has(c);
    S.ks = c => S.hitS.has(c);
    S.clearSim = () => { S.hitS.clear(); S.pressedS = false; };
    S.endFrame = () => {
      if (S.rotOn()) {
        ctx.fillStyle = 'rgba(15,10,30,.86)'; ctx.fillRect(0, 0, W, H);
        const a = Math.min(1, Math.max(0, Math.sin(S.t * 1.6) * 1.4)) * Math.PI / 2;
        ctx.save(); ctx.translate(W / 2, H / 2 - 70); ctx.rotate(-a); rrp(ctx, -48, -86, 96, 172, 16); ctx.fillStyle = '#2a2438'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#4cc9f0'; rrp(ctx, -36, -70, 72, 132, 6); ctx.fill(); ctx.restore();
        S.text('Turn your phone sideways', W / 2, H / 2 + 76, 44, '#fff', 'center', '#2a2438');
        S.text('This game is made for landscape. Tap to play anyway.', W / 2, H / 2 + 132, 26, '#ffe9c4', 'center', null, 800);
      }
      S.pressed = false; S.released = false; S.hit.clear(); S.wheel = 0;
      const c = S.lock ? 'default' : S.cursor;
      if (canvas.style.cursor !== c) canvas.style.cursor = c;
      S.cursor = 'default'; S.lock = false;
    };
    S.text = (s, x, y, size, fill = '#fff', align = 'center', stroke = null, weight = 900, base = 'middle') => {
      s = tr(String(s));
      ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = base;
      if (stroke) { ctx.lineWidth = Math.max(2, size * .2); ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
      ctx.fillStyle = fill; ctx.fillText(s, x, y);
    };
    S.tw = (s, size, weight = 900) => { ctx.font = `${weight} ${size}px ${FONT}`; return ctx.measureText(tr(String(s))).width; };
    S.fit = (s, maxW, size, weight = 900) => { s = tr(String(s)); let z = size; ctx.font = `${weight} ${z}px ${FONT}`; while (z > 8 && ctx.measureText(s).width > maxW) { z -= 1; ctx.font = `${weight} ${z}px ${FONT}`; } return z; };
    S.wrap = (s, x, y, maxW, lh, size, fill = '#fff', align = 'left', weight = 800, stroke = null) => {
      ctx.font = `${weight} ${size}px ${FONT}`;
      const words = tr(String(s)).split(' '), lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur);
      lines.forEach((l, i) => S.text(l, x, y + i * lh, size, fill, align, stroke, weight, 'top'));
      return lines.length * lh;
    };
    S.panel = (x, y, w, h, o = {}) => {
      const { fill = '#fff', line = '#2a2438', r = 14, lw = 3, sh = 5, grad = null } = o;
      if (sh) { rrp(ctx, x, y + sh, w, h, r); ctx.fillStyle = alpha(line, .85); ctx.fill(); }
      rrp(ctx, x, y, w, h, r);
      if (grad) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, grad[0]); g.addColorStop(1, grad[1]); ctx.fillStyle = g; } else ctx.fillStyle = fill;
      ctx.fill();
      if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
    };
    S.btn = (x, y, w, h, label, o = {}) => {
      const { color = '#ff9f1c', textc = '#fff', size = 20, enabled = true, sub = null, r = 14, line = '#2a2438', badge = null, on = false, icon = null } = o;
      const en = enabled && !S.lock;
      if (!S.lock && S.pressed && S.inside(x, y, w, h)) S.downBtn = true;
      const hov = en && S.inside(x, y, w, h);
      const prs = hov && S.down && S.inside(x, y, w, h, S.downX, S.downY);
      const off = prs ? 4 : 0, base = enabled ? color : '#9a96a6';
      const top = prs ? shade(base, -.08) : hov ? shade(base, .12) : base;
      rrp(ctx, x, y + 5, w, h, r); ctx.fillStyle = shade(base, -.5); ctx.fill();
      ctx.save(); ctx.translate(0, off);
      rrp(ctx, x, y, w, h, r);
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(top, .22)); g.addColorStop(.55, top); g.addColorStop(1, shade(top, -.14));
      ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = line; ctx.stroke();
      ctx.save(); rrp(ctx, x + 3, y + 3, w - 6, h * .42, r - 3); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); ctx.restore();
      if (icon) icon(x + (label ? 22 : w / 2), y + h / 2);
      const lx = x + w / 2 + (icon && label ? 12 : 0);
      if (label) {
        const sz = S.fit(label, w - 18 - (icon ? 28 : 0), size);
        S.text(label, lx, y + h / 2 - (sub ? sz * .32 : 0), sz, enabled ? textc : '#e6e3ee', 'center', shade(base, -.55));
        if (sub) S.text(sub, lx, y + h / 2 + sz * .62, Math.max(10, sz * .62), enabled ? '#fff' : '#e6e3ee', 'center', shade(base, -.55), 800);
      }
      if (on) { rrp(ctx, x - 3, y - 3, w + 6, h + 6, r + 2); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      ctx.restore();
      if (badge != null && badge !== '') {
        ctx.beginPath(); ctx.arc(x + w - 4, y + 4, 11, 0, TAU); ctx.fillStyle = '#e63946'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = line; ctx.stroke();
        S.text(String(badge), x + w - 4, y + 5, 13, '#fff');
      }
      if (hov) S.cursor = 'pointer';
      return en && S.released && S.inside(x, y, w, h) && S.inside(x, y, w, h, S.downX, S.downY);
    };
    const add = o => { o.scr = S.mkScr; S.fx.push(o); };
    S.pop = (x, y, s, col = '#fff', size = 22, o = {}) => add({ k: 'text', x, y, s, col, size, t: 0, life: o.life || 1.1, vy: o.vy == null ? -60 : o.vy, sc: o.sc || 1, stroke: o.stroke || '#2a2438', vx: o.vx || 0 });
    S.spark = (x, y, n = 8, col = '#ffd23f', sp = 160, g = 300, life = .7) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = rnd(.3, 1) * sp; add({ k: 'dot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .3, g, col: Array.isArray(col) ? pick(col) : col, r: rnd(2, 5), t: 0, life: life * rnd(.6, 1.2) }); }
    };
    S.confetti = (x, y, n = 40) => {
      const cols = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff9f1c'];
      for (let i = 0; i < n; i++) { const a = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(180, 520); add({ k: 'conf', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, col: pick(cols), w: rnd(5, 10), h: rnd(3, 6), rot: rnd(0, TAU), vr: rnd(-9, 9), t: 0, life: rnd(1.1, 2.0) }); }
    };
    S.stepFx = dt => {
      const f = S.fx;
      for (let i = f.length - 1; i >= 0; i--) {
        const p = f[i]; p.t += dt;
        if (p.t >= p.life) { f.splice(i, 1); continue; }
        if (p.k === 'text') { p.y += p.vy * dt; p.x += p.vx * dt; p.vy *= Math.pow(.2, dt); }
        else if (p.k === 'dot' || p.k === 'conf') { p.vy += (p.g == null ? 520 : p.g) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(.4, dt); if (p.k === 'conf') p.rot += p.vr * dt; }
        else if (p.k === 'ring') { }
      }
      if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 30);
    };
    S.drawFx = scr => {
      for (const p of S.fx) {
        if (!!p.scr !== !!scr) continue;
        const u = p.t / p.life;
        if (p.k === 'text') {
          const sc = p.sc * (u < .15 ? .6 + eo(u / .15) * .5 + Math.sin(u / .15 * Math.PI) * .25 : 1.1 - u * .15);
          ctx.save(); ctx.globalAlpha = u > .65 ? 1 - (u - .65) / .35 : 1; ctx.translate(p.x, p.y); ctx.scale(sc, sc);
          S.text(p.s, 0, 0, p.size, p.col, 'center', p.stroke); ctx.restore();
        } else if (p.k === 'dot') {
          ctx.globalAlpha = 1 - u * u; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - u * .5), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        } else if (p.k === 'conf') {
          ctx.save(); ctx.globalAlpha = u > .7 ? 1 - (u - .7) / .3 : 1; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.t * 8 + p.rot)); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
        } else if (p.k === 'ring') {
          ctx.globalAlpha = 1 - u; ctx.strokeStyle = p.col; ctx.lineWidth = p.lw || 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * eo(u), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    };
    S.ring = (x, y, r0, r1, col = '#fff', life = .5, lw = 3) => add({ k: 'ring', x, y, r0, r1, col, t: 0, life, lw });
    return S;
  };

  const modalFrame = (S, x, y, w, h, title, o = {}) => {
    const { ctx } = S;
    ctx.fillStyle = 'rgba(15,10,30,.55)'; ctx.fillRect(0, 0, S.W, S.H);
    S.panel(x, y, w, h, { fill: o.fill || '#fff8e7', r: 20, lw: 4, sh: 7 });
    if (title) {
      S.panel(x + 24, y - 20, w - 48, 44, { fill: o.head || '#ff7b54', r: 14, lw: 3, sh: 4 });
      S.text(title, x + w / 2, y + 2, 24, '#fff', 'center', '#7a2e12');
    }
  };

  const icoCoin = (c, x, y, r = 10) => {
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#ffc928'; c.fill(); c.lineWidth = Math.max(2, r * .18); c.strokeStyle = '#8a5a00'; c.stroke();
    c.beginPath(); c.arc(x, y, r * .62, 0, TAU); c.strokeStyle = '#ffe58a'; c.lineWidth = Math.max(1.5, r * .14); c.stroke();
    c.fillStyle = '#b57a00'; c.font = `900 ${r * 1.1}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', x, y + r * .06);
  };
  const star = (c, x, y, r, fill, stroke = '#8a5a00') => {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = Math.max(1.5, r * .16); c.lineJoin = 'round'; c.strokeStyle = stroke; c.stroke();
  };
  const heart = (c, x, y, r, fill, stroke = '#5a1020') => {
    c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .7, y - r * 1.1, x, y - r * .4);
    c.bezierCurveTo(x + r * .7, y - r * 1.1, x + r * 1.5, y - r * .1, x, y + r * .9); c.closePath();
    c.fillStyle = fill; c.fill(); c.lineWidth = Math.max(1.5, r * .18); c.lineJoin = 'round'; c.strokeStyle = stroke; c.stroke();
  };
  const speakerIcon = (c, x, y, on) => {
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 9, y - 4); c.lineTo(x - 4, y - 4); c.lineTo(x + 2, y - 10); c.lineTo(x + 2, y + 10); c.lineTo(x - 4, y + 4); c.lineTo(x - 9, y + 4); c.closePath(); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.lineCap = 'round';
    if (on) { c.beginPath(); c.arc(x + 3, y, 6, -.9, .9); c.stroke(); c.beginPath(); c.arc(x + 3, y, 11, -.9, .9); c.stroke(); }
    else { c.beginPath(); c.moveTo(x + 6, y - 5); c.lineTo(x + 13, y + 5); c.moveTo(x + 13, y - 5); c.lineTo(x + 6, y + 5); c.stroke(); }
  };
  const note = (c, x, y, col = '#fff') => {
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.ellipse(x - 4, y + 7, 5, 4, -.4, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x, y - 8); c.lineTo(x + 7, y - 5); c.stroke();
  };

  const FISH = [
    { id: 'minnow', n: 'Minnow', d0: 0, d1: 34, v: 1, len: 30, h: 13, c: '#9fd8d4', c2: '#f4fffd', k: 'fish' },
    { id: 'sardine', n: 'Sardine', d0: 12, d1: 60, v: 3, len: 38, h: 14, c: '#a8b9c9', c2: '#e8f1f8', k: 'fish', pat: 'stripe' },
    { id: 'bluegill', n: 'Bluegill', d0: 24, d1: 90, v: 7, len: 42, h: 24, c: '#4f8fd0', c2: '#ffb347', k: 'fish', pat: 'belly' },
    { id: 'clown', n: 'Clownfish', d0: 40, d1: 130, v: 14, len: 40, h: 22, c: '#ff7b1c', c2: '#ffffff', k: 'fish', pat: 'bands' },
    { id: 'mackerel', n: 'Mackerel', d0: 70, d1: 190, v: 28, len: 58, h: 20, c: '#2f8f83', c2: '#d7efe9', k: 'fish', pat: 'wave' },
    { id: 'puffer', n: 'Pufferfish', d0: 120, d1: 270, v: 52, len: 42, h: 40, c: '#e3c05c', c2: '#fff4c9', k: 'puffer' },
    { id: 'angel', n: 'Angelfish', d0: 180, d1: 360, v: 95, len: 46, h: 54, c: '#f4d35e', c2: '#2b6cb0', k: 'angel' },
    { id: 'lion', n: 'Lionfish', d0: 260, d1: 460, v: 170, len: 58, h: 38, c: '#c0392b', c2: '#fff1e0', k: 'lion' },
    { id: 'tuna', n: 'Bluefin Tuna', d0: 360, d1: 620, v: 310, len: 82, h: 34, c: '#274c8f', c2: '#c8d6e8', k: 'tuna' },
    { id: 'squid', n: 'Squid', d0: 500, d1: 800, v: 560, len: 66, h: 30, c: '#e07a8f', c2: '#ffd1da', k: 'squid' },
    { id: 'sword', n: 'Swordfish', d0: 640, d1: 980, v: 980, len: 104, h: 30, c: '#4a5d8a', c2: '#d9e2f2', k: 'sword' },
    { id: 'jelly', n: 'Moon Jelly', d0: 800, d1: 1200, v: 1700, len: 52, h: 56, c: '#c77dff', c2: '#f2d9ff', k: 'jelly' },
    { id: 'angler', n: 'Anglerfish', d0: 1000, d1: 1500, v: 3000, len: 60, h: 46, c: '#4a3b57', c2: '#fff27a', k: 'angler' },
    { id: 'lantern', n: 'Lanternfish', d0: 1250, d1: 1800, v: 5200, len: 46, h: 20, c: '#3b6fd4', c2: '#8ff7ff', k: 'lantern' },
    { id: 'viper', n: 'Viperfish', d0: 1500, d1: 2100, v: 9000, len: 72, h: 24, c: '#1f5f5b', c2: '#a8ffe8', k: 'viper' },
    { id: 'gulper', n: 'Gulper Eel', d0: 1800, d1: 2500, v: 16000, len: 120, h: 24, c: '#2a2336', c2: '#ff5d8f', k: 'eel' },
    { id: 'oar', n: 'Oarfish', d0: 2100, d1: 3000, v: 30000, len: 150, h: 20, c: '#c9d6e3', c2: '#ff3b3b', k: 'oar' },
    { id: 'kraken', n: 'Giant Squid', d0: 2500, d1: 3600, v: 60000, len: 120, h: 50, c: '#a02c4b', c2: '#ffb3c6', k: 'squid' }
  ];
  const FBY = {}; FISH.forEach(f => { FBY[f.id] = f; });
  const JUNK = { id: 'junk', n: 'Old Boot', v: 1, len: 30, h: 24, c: '#6b4b2a', c2: '#a98254', k: 'junk', d0: 0, d1: 400 };
  FBY.junk = JUNK;
  const GOLD_X = 12;
  const TF_PXM = 5;
  const TF_UP = {
    depth: { n: 'Line Length', max: 80, cost: l => Math.round(20 * Math.pow(1.38, l) + l * 8), eff: l => `${tfDepth(l)} m`, ic: 'depth' },
    cap: { n: 'Strength', max: 150, cost: l => Math.round(14 * Math.pow(1.26, l) + l * 6), eff: l => `${tfCap(l)} fish`, ic: 'cap' },
    val: { n: 'Fish Value', max: 80, cost: l => Math.round(120 * Math.pow(1.45, l)), eff: l => `x${(1 + .12 * l).toFixed(2)}`, ic: 'val' },
    reel: { n: 'Reel Speed', max: 24, cost: l => Math.round(260 * Math.pow(1.8, l)), eff: l => `x${(1 + .06 * l).toFixed(2)}`, ic: 'reel' },
    off: { n: 'Offline Earnings', max: 40, cost: l => Math.round(120 * Math.pow(1.4, l)), eff: l => `${Math.round(tfOffFrac(l) * 100)}% / ${tfOffHours(l)}h`, ic: 'off' }
  };
  const tfDepth = l => Math.round(40 + 12 * l + .3 * l * l);
  const tfCap = l => 3 + l;
  const tfOffFrac = l => Math.min(1, .1 + .02 * l);
  const tfOffHours = l => 2 + Math.floor(l / 4);
  const AUTO_COST = 3000;
  const BOATS = [[0, 'Rowboat'], [150, 'Fishing Boat'], [600, 'Trawler'], [1500, 'Research Ship']];

  const tfSpawn = (maxM, lvlVal, rng = Math.random) => {
    const out = [], n = Math.ceil(maxM * .16) + 4, W = 960;
    for (let i = 0; i < n; i++) {
      const d = 2 + rng() * (maxM - 6);
      let sp = null;
      if (rng() < (d < 300 ? .055 : 0)) sp = JUNK;
      else {
        const cands = FISH.filter(f => d >= f.d0 && d <= f.d1);
        if (!cands.length) sp = FISH[FISH.length - 1];
        else {
          let tot = 0; const w = cands.map(f => { const m = (f.d0 + f.d1) / 2, r = (f.d1 - f.d0) / 2; const x = 1 - Math.abs(d - m) / r; tot += .15 + x; return .15 + x; });
          let r = rng() * tot, j = 0; while (j < w.length - 1 && r > w[j]) { r -= w[j]; j++; }
          sp = cands[j];
        }
      }
      const size = .85 + rng() * .5, gold = sp !== JUNK && rng() < .025;
      const dir = rng() < .5 ? -1 : 1;
      out.push({ sp, size, gold, x: rng() * W, y: d * TF_PXM, dir, v: (22 + rng() * 52) * (sp.k === 'sword' || sp.k === 'tuna' ? 1.6 : sp.k === 'jelly' ? .45 : 1), ph: rng() * TAU, hooked: false, val: 0 });
    }
    out.forEach(f => { f.val = tfFishVal(f, lvlVal); });
    return out;
  };
  const tfFishVal = (f, lv) => Math.max(1, Math.round(f.sp.v * f.size * f.size * (f.gold ? GOLD_X : 1) * (1 + .12 * lv)));

  const drawFishBody = (c, sp, s, t, ph, gold) => {
    const L = sp.len * s, Hh = sp.h * s, wag = Math.sin(t * 7 + ph);
    const col = gold ? '#ffcf33' : sp.c, col2 = gold ? '#fff2a8' : sp.c2, ol = shade(col, -.58);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = Math.max(1.8, 2.2 * s);
    const eye = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#222'; c.stroke(); c.beginPath(); c.arc(x + r * .25, y, r * .5, 0, TAU); c.fillStyle = '#111'; c.fill(); };
    const body = (cx, rx, ry) => { c.beginPath(); c.ellipse(cx, 0, rx, ry, 0, 0, TAU); };
    const tail = (x, w, hh, fill) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - w, -hh + wag * hh * .35); c.quadraticCurveTo(x - w * .65, wag * hh * .2, x - w, hh + wag * hh * .35); c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = ol; c.stroke(); };
    const k = sp.k;
    if (k === 'jelly') {
      const pul = Math.sin(t * 3 + ph) * .08;
      c.strokeStyle = alpha(col2, .8); c.lineWidth = 2.2 * s;
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * Hh * .13, Hh * .1); for (let j = 1; j <= 5; j++) c.lineTo(i * Hh * .13 + Math.sin(t * 4 + j + i + ph) * 4 * s, Hh * .1 + j * Hh * .13); c.stroke(); }
      c.beginPath(); c.ellipse(0, 0, L * .5 * (1 - pul), Hh * .38 * (1 + pul), 0, Math.PI, TAU); c.quadraticCurveTo(L * .2, Hh * .18, 0, Hh * .12); c.quadraticCurveTo(-L * .2, Hh * .18, -L * .5 * (1 - pul), 0);
      const g = c.createRadialGradient(0, -Hh * .1, 2, 0, 0, L * .5); g.addColorStop(0, '#f6e6ff'); g.addColorStop(1, alpha(col, .9)); c.fillStyle = g; c.fill(); c.strokeStyle = shade(col, -.45); c.lineWidth = 2.2 * s; c.stroke();
      c.fillStyle = alpha('#fff', .55); c.beginPath(); c.ellipse(-L * .15, -Hh * .2, L * .12, Hh * .06, -.4, 0, TAU); c.fill();
      return;
    }
    if (k === 'squid') {
      c.strokeStyle = ol; c.fillStyle = col2;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-L * .12, i * Hh * .09); c.quadraticCurveTo(-L * .35, i * Hh * .13 + wag * 4 * s, -L * .55, i * Hh * .17 + wag * 6 * s); c.lineWidth = 4 * s; c.stroke(); c.lineWidth = 2.4 * s; c.strokeStyle = col; c.stroke(); c.strokeStyle = ol; }
      c.beginPath(); c.moveTo(L * .5, 0); c.quadraticCurveTo(L * .22, -Hh * .55, -L * .12, -Hh * .3); c.lineTo(-L * .12, Hh * .3); c.quadraticCurveTo(L * .22, Hh * .55, L * .5, 0); c.fillStyle = col; c.fill(); c.lineWidth = 2.2 * s; c.stroke();
      c.beginPath(); c.moveTo(L * .5, 0); c.lineTo(L * .64, -Hh * .35); c.lineTo(L * .4, -Hh * .1); c.closePath(); c.fillStyle = col; c.fill(); c.stroke();
      c.fillStyle = alpha(col2, .6); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(L * (.05 + i * .08), -Hh * .1 + (i % 2) * Hh * .12, 2.2 * s, 0, TAU); c.fill(); }
      eye(L * .08, -Hh * .08, 5 * s); return;
    }
    if (k === 'puffer') {
      const r = Hh * .5;
      c.strokeStyle = ol; c.fillStyle = col2;
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); c.lineTo(Math.cos(a) * (r + 7 * s), Math.sin(a) * (r + 7 * s)); c.lineWidth = 2.2 * s; c.stroke(); }
      tail(-r * .85, r * .8, r * .55, col);
      body(0, r * 1.05, r); const g = c.createLinearGradient(0, -r, 0, r); g.addColorStop(0, col); g.addColorStop(.65, col); g.addColorStop(1, col2); c.fillStyle = g; c.fill(); c.strokeStyle = ol; c.stroke();
      c.fillStyle = alpha(ol, .35); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-r * .4 + (i % 3) * r * .35, -r * .45 + (i >> 1) * r * .12, 2 * s, 0, TAU); c.fill(); }
      c.beginPath(); c.arc(r * .95, r * .15, 3 * s, 0, TAU); c.fillStyle = '#ff8a8a'; c.fill(); eye(r * .45, -r * .2, 6 * s); return;
    }
    if (k === 'eel' || k === 'oar') {
      const seg = 18, thick = Hh * (k === 'oar' ? .38 : .5);
      c.beginPath();
      for (let i = 0; i <= seg; i++) { const u = i / seg, x = L * (.5 - u), y = Math.sin(u * 6 - t * 5 + ph) * Hh * .45 * u; c.lineTo(x, y - thick * (1 - u * .8)); }
      for (let i = seg; i >= 0; i--) { const u = i / seg, x = L * (.5 - u), y = Math.sin(u * 6 - t * 5 + ph) * Hh * .45 * u; c.lineTo(x, y + thick * (1 - u * .8)); }
      c.closePath(); const g = c.createLinearGradient(0, -thick, 0, thick); g.addColorStop(0, col); g.addColorStop(1, shade(col, k === 'oar' ? -.2 : .15)); c.fillStyle = g; c.fill(); c.strokeStyle = ol; c.stroke();
      if (k === 'oar') { c.strokeStyle = col2; c.lineWidth = 3 * s; c.beginPath(); for (let i = 1; i < 8; i++) { const u = i / 12; c.moveTo(L * (.5 - u), Math.sin(u * 6 - t * 5 + ph) * Hh * .45 * u - thick); c.lineTo(L * (.5 - u) + 4, Math.sin(u * 6 - t * 5 + ph) * Hh * .45 * u - thick - 14 * s); } c.stroke(); }
      else { c.beginPath(); c.arc(L * .46, thick * .4, thick * 1.1, .1, Math.PI * .95); c.strokeStyle = ol; c.lineWidth = 2.5 * s; c.stroke(); c.fillStyle = col2; c.beginPath(); c.arc(L * .5, -thick * .35, 3 * s, 0, TAU); c.fill(); }
      eye(L * .4, -thick * .35, 4.5 * s); return;
    }
    if (k === 'junk') {
      c.fillStyle = col; c.strokeStyle = ol; c.beginPath(); c.moveTo(-L * .2, -Hh * .5); c.lineTo(L * .05, -Hh * .5); c.lineTo(L * .08, Hh * .1); c.quadraticCurveTo(L * .5, Hh * .1, L * .5, Hh * .45); c.lineTo(-L * .2, Hh * .45); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = col2; c.fillRect(-L * .2, Hh * .3, L * .7, Hh * .15); return;
    }
    if (k === 'sword') {
      c.beginPath(); c.moveTo(L * .5, 0); c.lineTo(L * .3, -2 * s); c.lineTo(L * .3, 2 * s); c.closePath(); c.fillStyle = '#cfd6e6'; c.fill(); c.strokeStyle = ol; c.stroke();
    }
    if (k === 'angler') {
      c.beginPath(); c.moveTo(L * .1, -Hh * .45); c.quadraticCurveTo(L * .35, -Hh * 1.05, L * .55, -Hh * .5); c.strokeStyle = ol; c.lineWidth = 2 * s; c.stroke();
      const gl = c.createRadialGradient(L * .55, -Hh * .5, 1, L * .55, -Hh * .5, 12 * s); gl.addColorStop(0, '#fffbd0'); gl.addColorStop(1, 'rgba(255,242,122,0)'); c.fillStyle = gl; c.beginPath(); c.arc(L * .55, -Hh * .5, 12 * s, 0, TAU); c.fill();
    }
    tail(-L * .38, L * .26, Hh * (k === 'tuna' ? .55 : .42), k === 'lion' || k === 'angel' ? shade(col, .1) : shade(col, -.1));
    if (k === 'lion') {
      c.fillStyle = col2; c.strokeStyle = ol;
      for (let i = 0; i < 7; i++) { const a = -Math.PI * .88 + i * .26; c.beginPath(); c.moveTo(Math.cos(a) * L * .1, Math.sin(a) * Hh * .4); c.lineTo(Math.cos(a) * L * .38 - 6 * s, Math.sin(a) * Hh * 1.05); c.lineTo(Math.cos(a) * L * .1 + 8 * s, Math.sin(a) * Hh * .4); c.closePath(); c.fill(); c.stroke(); }
    }
    if (k === 'angel') {
      c.fillStyle = shade(col, -.08); c.strokeStyle = ol;
      c.beginPath(); c.moveTo(-L * .05, -Hh * .35); c.quadraticCurveTo(-L * .1, -Hh * .85, -L * .42, -Hh * .8); c.quadraticCurveTo(-L * .2, -Hh * .4, -L * .25, -Hh * .25); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-L * .05, Hh * .35); c.quadraticCurveTo(-L * .1, Hh * .85, -L * .42, Hh * .8); c.quadraticCurveTo(-L * .2, Hh * .4, -L * .25, Hh * .25); c.closePath(); c.fill(); c.stroke();
    }
    if (k === 'tuna' || k === 'fish' || k === 'viper' || k === 'lantern' || k === 'sword') {
      c.fillStyle = shade(col, -.15); c.beginPath(); c.moveTo(-L * .05, -Hh * .45); c.quadraticCurveTo(L * .08, -Hh * .85, L * .18, -Hh * .42); c.closePath(); c.fill(); c.strokeStyle = ol; c.stroke();
    }
    c.save(); body(L * .02, L * .4, Hh * .5);
    const g = c.createLinearGradient(0, -Hh * .5, 0, Hh * .5); g.addColorStop(0, shade(col, -.12)); g.addColorStop(.55, col); g.addColorStop(1, k === 'tuna' || k === 'lion' ? col2 : shade(col2, -.1)); c.fillStyle = g; c.fill();
    c.clip();
    if (sp.pat === 'bands' || k === 'lion') { c.fillStyle = k === 'lion' ? '#fff1e0' : '#fff'; for (const bx of [.18, -.08, -.3]) { c.fillRect(L * bx, -Hh, L * .08, Hh * 2); c.strokeStyle = ol; c.lineWidth = 1.4; c.strokeRect(L * bx, -Hh, L * .08, Hh * 2); } }
    if (sp.pat === 'stripe') { c.fillStyle = alpha('#3a5a8c', .55); c.fillRect(-L * .5, -Hh * .15, L, Hh * .12); }
    if (sp.pat === 'belly') { c.fillStyle = col2; c.beginPath(); c.ellipse(L * .05, Hh * .55, L * .4, Hh * .3, 0, 0, TAU); c.fill(); }
    if (sp.pat === 'wave') { c.strokeStyle = alpha(ol, .5); c.lineWidth = 2 * s; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-L * .3 + i * L * .12, -Hh * .5); c.quadraticCurveTo(-L * .24 + i * L * .12, -Hh * .1, -L * .3 + i * L * .12, Hh * .1); c.stroke(); } }
    if (k === 'angel') { c.fillStyle = col2; for (const bx of [.1, -.12]) c.fillRect(L * bx, -Hh, L * .06, Hh * 2); }
    if (k === 'lantern' || k === 'viper') { c.fillStyle = col2; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-L * .25 + i * L * .1, Hh * .28, 1.8 * s, 0, TAU); c.fill(); } }
    c.restore();
    c.beginPath(); c.ellipse(L * .02, 0, L * .4, Hh * .5, 0, 0, TAU); c.strokeStyle = ol; c.lineWidth = Math.max(1.8, 2.2 * s); c.stroke();
    c.fillStyle = alpha('#fff', .35); c.beginPath(); c.ellipse(L * .05, -Hh * .27, L * .2, Hh * .08, -.05, 0, TAU); c.fill();
    c.fillStyle = shade(col, -.1); c.beginPath(); c.moveTo(-L * .05, Hh * .05); c.quadraticCurveTo(-L * .18, Hh * .3 + wag * 3, -L * .02, Hh * .32); c.quadraticCurveTo(L * .02, Hh * .2, -L * .05, Hh * .05); c.fill(); c.strokeStyle = ol; c.lineWidth = 1.6; c.stroke();
    if (k === 'viper') { c.strokeStyle = '#eefaf6'; c.lineWidth = 1.8 * s; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(L * .36 - i * 2.2 * s, Hh * .12); c.lineTo(L * .34 - i * 2.2 * s, Hh * .34); } c.stroke(); }
    c.beginPath(); c.moveTo(L * .4, Hh * .08); c.quadraticCurveTo(L * .35, Hh * .14, L * .3, Hh * .1); c.strokeStyle = ol; c.lineWidth = 1.6; c.stroke();
    eye(L * (k === 'puffer' ? .28 : .27), -Hh * .1, Math.max(3, Hh * (k === 'viper' || k === 'lantern' ? .2 : .15)));
    if (gold) { c.strokeStyle = '#fff'; c.lineWidth = 1.6; const q = (t * 2 + ph) % 3; if (q < 1) { const x = L * (.4 - q * .8); c.beginPath(); c.moveTo(x - 5, -Hh * .3); c.lineTo(x + 5, -Hh * .3); c.moveTo(x, -Hh * .3 - 5); c.lineTo(x, -Hh * .3 + 5); c.stroke(); } }
  };

  const drawBoat = (c, x, t, tier, bob) => {
    c.save(); c.translate(x, bob);
    const hull = ['#c1432c', '#2f6db5', '#3d4b5c', '#e8edf2'][tier], trim = ['#fff', '#ffcf5c', '#e8c547', '#2f6db5'][tier];
    const s = [1, 1.25, 1.6, 1.9][tier];
    c.scale(s, s);
    c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
    if (tier >= 2) { c.fillStyle = tier === 3 ? '#f4f7fa' : '#d9e0e8'; c.beginPath(); c.moveTo(-26, -34); c.lineTo(10, -34); c.lineTo(10, -8); c.lineTo(-26, -8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#7fd0ff'; c.fillRect(-22, -30, 10, 12); c.fillRect(-8, -30, 10, 12); c.strokeRect(-22, -30, 10, 12); c.strokeRect(-8, -30, 10, 12); c.fillStyle = '#e63946'; c.fillRect(-14, -44, 12, 10); c.strokeRect(-14, -44, 12, 10); }
    c.beginPath(); c.moveTo(-72, -16); c.lineTo(72, -16); c.quadraticCurveTo(62, 14, 40, 18); c.lineTo(-44, 18); c.quadraticCurveTo(-66, 14, -72, -16); c.closePath();
    const g = c.createLinearGradient(0, -16, 0, 18); g.addColorStop(0, shade(hull, .12)); g.addColorStop(1, shade(hull, -.18)); c.fillStyle = g; c.fill(); c.stroke();
    c.fillStyle = trim; c.beginPath(); c.moveTo(-70, -14); c.lineTo(70, -14); c.lineTo(68, -8); c.lineTo(-68, -8); c.closePath(); c.fill(); c.stroke();
    if (tier < 2) {
      c.fillStyle = '#f4c7a1'; c.beginPath(); c.arc(-22, -50, 11, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(-22, -57, 20, 5, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(-22, -58, 10, Math.PI, TAU); c.fill(); c.stroke();
      c.fillStyle = '#222'; c.beginPath(); c.arc(-18, -51, 1.8, 0, TAU); c.fill();
      c.fillStyle = '#3a86ff'; c.beginPath(); c.moveTo(-34, -16); c.quadraticCurveTo(-36, -44, -22, -42); c.quadraticCurveTo(-8, -44, -10, -16); c.closePath(); c.fill(); c.stroke();
    }
    const rx = tier < 2 ? 52 : 70;
    c.strokeStyle = '#2a2438'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(tier < 2 ? -8 : 20, tier < 2 ? -30 : -14); c.quadraticCurveTo(24, -64, rx, -52); c.stroke();
    c.strokeStyle = '#a0703c'; c.lineWidth = 2.6; c.stroke();
    c.restore();
    return [x + (tier < 2 ? 52 : 70) * s, bob - 52 * s];
  };

  const mountFishing = (root, api) => {
    const W = 960, H = 600, S = makeStage(api, W, H), c = S.ctx, au = S.au;
    const music = makeMusic(au, { bpm: 92, root: 220, scale: [0, 2, 4, 7, 9], pat: [4, -1, 2, 4, 5, -1, 4, 2, 0, -1, 2, 4, 2, -1, -1, -1], bass: [0, 3, 4, 2], vol: .03 });
    const defSave = { coins: 0, lv: { depth: 0, cap: 0, val: 0, reel: 0, off: 0 }, hold: [], dex: {}, auto: false, hasAuto: false, last: Date.now(), earned: 0, casts: 0, bestHaul: 0, deepest: 0, mk: {}, tut: 0, mus: true, sold: 0, mkT: 0 };
    const sv = svOnly(defSave, svFix(defSave, api.load()));
    for (const k of Object.keys(defSave.lv)) sv.lv[k] = clamp(Math.floor(sv.lv[k]) || 0, 0, TF_UP[k].max);
    sv.hold = sv.hold.filter(h => h && typeof h === 'object' && FBY[h.id] && isFinite(h.v) && isFinite(h.size)).slice(0, 400);
    for (const k of Object.keys(sv.dex)) { const q = sv.dex[k]; if (!q || typeof q !== 'object' || Array.isArray(q) || !FBY[k]) delete sv.dex[k]; else sv.dex[k] = { n: clamp(Math.floor(+q.n || 0), 0, 1e9), best: clamp(+q.best || 0, 0, 10), gold: clamp(Math.floor(+q.gold || 0), 0, 1e9) }; }
    for (const k of ['casts', 'bestHaul', 'deepest', 'tut', 'sold']) sv[k] = clamp(+sv[k] || 0, 0, 1e15);
    if (typeof sv.mkT !== 'number' || !isFinite(sv.mkT)) sv.mkT = 0;
    for (const k of Object.keys(sv.mk)) if (typeof sv.mk[k] !== 'number' || !isFinite(sv.mk[k]) || sv.mk[k] <= 0) delete sv.mk[k];
    sv.coins = Math.max(0, sv.coins); sv.earned = Math.max(0, sv.earned);
    if (sv.last > Date.now()) sv.last = Date.now();
    if (!sv.mus && music.on) music.toggle();
    const persist = () => { sv.last = Date.now(); api.save(sv); if (Date.now() - lastSub > 30000) { lastSub = Date.now(); api.submit(sv.earned); } };
    const maxM = () => tfDepth(sv.lv.depth), maxPx = () => maxM() * TF_PXM;
    const capN = () => tfCap(sv.lv.cap);
    const reel = () => 1 + .06 * sv.lv.reel;
    const diveTime = () => (4 + .5 * Math.sqrt(maxM())) / reel();
    const tier = () => { let t = 0; BOATS.forEach((b, i) => { if (maxM() >= b[0]) t = i; }); return t; };
    const mult = id => sv.mk[id] || 1;
    const sellPrice = h => Math.max(1, Math.round(h.v * mult(h.id)));
    const holdValue = () => sv.hold.reduce((a, h) => a + sellPrice(h), 0);
    const estHaul = () => {
      const r = mulberry(7), fs = tfSpawn(maxM(), sv.lv.val, r);
      fs.sort((a, b) => b.val - a.val);
      return fs.slice(0, capN()).reduce((a, f) => a + (f.gold ? f.val * .3 : f.val), 0) * .72;
    };
    const castSecs = () => diveTime() * 1.6 + 3.2;
    const offRate = () => estHaul() / castSecs() * tfOffFrac(sv.lv.off);

    const sPop = (...a) => { S.mkScr = true; S.pop(...a); S.mkScr = false; };
    let lastSub = 0;
    let state = 'idle', hook = { x: W / 2, y: 0, tx: W / 2, vx: 0 }, fishes = [], hooked = [], camY = -170, t0 = 0, haulQ = [], haulT = 0, haulTot = 0, haulN = 0;
    let modal = null, scrollY = 0, trail = [], bubbles = [], snow = [], clouds = [], gulls = [], shakeT = 0, idleT = 0, comboN = 0, fullFlash = 0, coinFly = [], sellT = 0, msg = null, coinsShown = sv.coins, depthShown = 0, newDex = [], lastTier = tier();
    for (let i = 0; i < 70; i++) snow.push({ x: rnd(0, W), y: rnd(0, 2000), r: rnd(1, 2.6), s: rnd(.3, 1) });
    for (let i = 0; i < 6; i++) clouds.push({ x: rnd(0, W), y: rnd(10, 110), s: rnd(.6, 1.4), v: rnd(4, 10) });
    for (let i = 0; i < 3; i++) gulls.push({ x: rnd(0, W), y: rnd(30, 120), ph: rnd(0, TAU), v: rnd(20, 40) });
    let skyT = Math.random() * 100;

    const offline = () => {
      const el = Math.max(0, (Date.now() - (sv.last || Date.now())) / 1000);
      if (el < 45 || sv.casts < 2) return;
      const cap = tfOffHours(sv.lv.off) * 3600, secs = Math.min(el, cap), earn = Math.floor(offRate() * secs);
      if (earn < 1) return;
      sv.coins += earn; sv.earned += earn;
      modal = { k: 'welcome', earn, secs, capped: el > cap, t: 0 };
    };
    offline();
    if (!sv.hasAuto) sv.auto = false;
    const startHint = () => { if (sv.tut < 3 && !modal) msg = { s: sv.tut === 0 ? 'Tap or press Space to cast the hook' : sv.tut === 1 ? 'Steer with the mouse or A/D and dodge fish going down' : 'Fish you meet on the way up are caught', t: 0 }; };
    startHint();

    const cast = () => {
      if (state !== 'idle' || modal) return;
      fishes = tfSpawn(maxM(), sv.lv.val);
      hooked = []; hook.y = 0; hook.vx = 0; state = 'drop'; t0 = 0; comboN = 0; trail = [];
      sv.casts++;
      au.noise(.35, .12, 1400, 0, 'bandpass', 500); au.tone(520, .16, 'sine', .06, 180);
      S.ring(hook.x, 8, 4, 36, '#fff', .5, 3);
      for (let i = 0; i < 10; i++) bubbles.push({ x: hook.x + rnd(-8, 8), y: rnd(0, 10), r: rnd(2, 5), v: rnd(30, 90), life: rnd(.6, 1.4), t: 0 });
      if (msg) msg = null;
    };
    const endCast = () => {
      state = 'haul'; haulQ = hooked.slice(); hooked = []; haulT = 0; haulTot = 0; haulN = 0;
      hook.y = 0;
    };
    const finishHaul = () => {
      if (haulTot > sv.bestHaul) sv.bestHaul = haulTot;
      sPop(W / 2, 150, haulN ? tr('HAUL  {n} fish  {m}', { n: haulN, m: money(haulTot) }) : 'Nothing this time!', haulN ? '#fff' : '#ffd0d0', 30, { life: 1.8, vy: -20 });
      state = 'idle'; idleT = 0;
      if (sv.tut < 3) { sv.tut++; startHint(); }
      if (sv.auto && sv.hasAuto) sellAll(true);
      persist();
      const nt = tier(); if (nt !== lastTier) { lastTier = nt; msg = { s: tr('New boat: {b}!', { b: tr(BOATS[nt][1]) }), t: 0 }; au.tone(523, .5, 'triangle', .08, 1046); S.mkScr = true; S.confetti(W / 2, 260, 40); S.mkScr = false; }
    };
    const sellAll = quiet => {
      if (!sv.hold.length) return;
      const tot = holdValue();
      sv.coins += tot; sv.earned += tot; sv.sold += sv.hold.length;
      sv.hold = []; sellT = .01;
      au.tone(880, .18, 'square', .05, 1320); au.tone(1175, .25, 'sine', .06, 1760, .09); au.noise(.2, .05, 5000, 0, 'highpass');
      sPop(150, 105, '+' + money(tot), '#ffe14d', 30, { life: 1.4 });
      for (let i = 0; i < 14; i++) coinFly.push({ x: 160 + rnd(-30, 30), y: 115, t: -i * .03, vx: rnd(-40, 40) });
      persist();
    };
    const sellOne = id => {
      const list = sv.hold.filter(h => h.id === id); if (!list.length) return;
      const tot = list.reduce((a, h) => a + sellPrice(h), 0);
      sv.hold = sv.hold.filter(h => h.id !== id); sv.coins += tot; sv.earned += tot; sv.sold += list.length;
      au.tone(880, .15, 'square', .05, 1320); sPop(S.mx, S.my - 10, '+' + money(tot), '#ffe14d', 22); persist();
    };
    const upCost = k => TF_UP[k].cost(sv.lv[k]);
    const buy = k => {
      const U = TF_UP[k]; if (sv.lv[k] >= U.max) return;
      const cst = upCost(k); if (sv.coins < cst) { au.tone(160, .15, 'sawtooth', .05); sPop(S.mx, S.my - 20, 'Not enough coins', '#ff9b9b', 16); return; }
      sv.coins -= cst; sv.lv[k]++;
      au.tone(660, .12, 'square', .05, 990); au.tone(990, .2, 'sine', .07, 1480, .08);
      S.mkScr = true; S.spark(S.mx, S.my, 14, ['#ffe14d', '#fff', '#7ff0b2']); S.ring(S.mx, S.my, 6, 50, '#ffe14d', .5); S.mkScr = false;
      if (k === 'depth') { sv.deepest = Math.max(sv.deepest, 0); }
      persist();
    };
    const buyAuto = () => {
      if (sv.hasAuto) { sv.auto = !sv.auto; au.tone(sv.auto ? 800 : 400, .12, 'square', .04); persist(); return; }
      if (sv.coins < AUTO_COST) { au.tone(160, .15, 'sawtooth', .05); sPop(S.mx, S.my - 20, 'Not enough coins', '#ff9b9b', 16); return; }
      sv.coins -= AUTO_COST; sv.hasAuto = true; sv.auto = true; au.tone(660, .2, 'triangle', .07, 1320); S.mkScr = true; S.confetti(S.mx, S.my, 24); S.mkScr = false; persist();
    };

    const hookRad = 15;
    const stepFish = dt => {
      for (const f of fishes) {
        if (f.hooked) continue;
        f.x += f.dir * f.v * dt; f.ph += dt;
        if (f.x > W + 120) f.x = -120; else if (f.x < -120) f.x = W + 120;
      }
    };
    const tryHook = () => {
      if (hooked.length >= capN()) return;
      for (const f of fishes) {
        if (f.hooked) continue;
        const L = f.sp.len * f.size * .5 + hookRad - 4, Hh = f.sp.h * f.size * .5 + hookRad - 2;
        const dx = (f.x - hook.x) / L, dy = (f.y + Math.sin(f.ph * 2) * 4 - hook.y) / Hh;
        if (dx * dx + dy * dy <= 1) {
          f.hooked = true; f.hx = f.x; f.hy = f.y; hooked.push(f); comboN++;
          const pitch = Math.min(1900, 520 * Math.pow(1.07, hooked.length));
          au.tone(pitch, .12, 'triangle', .07, pitch * 1.5); au.noise(.1, .04, 3000, 0, 'bandpass');
          S.pop(f.x, f.y - Hh - 6 - camY * 0, `+${short(f.val)}`, f.gold ? '#ffe14d' : '#fff', f.gold ? 24 : 18, { life: .8 });
          S.ring(f.x, f.y, 6, 34, '#fff', .35, 2.5); S.spark(f.x, f.y, 6, f.gold ? ['#ffe14d', '#fff'] : ['#fff', '#aef'], 140, 200, .5);
          if (state === 'drop') { shakeT = .12; S.shake = Math.max(S.shake, 5); }
          if (hooked.length >= capN()) { fullFlash = 1; au.tone(1200, .25, 'sine', .07, 600); S.pop(hook.x, hook.y - 40, 'FULL!', '#ffb703', 28); if (state === 'drop') { state = 'rise'; } }
          if (hooked.length >= capN()) break;
        }
      }
    };
    const aiSteer = dt => {
      const mxp = maxPx();
      if (state === 'drop') {
        let best = hook.tx, bs = -1e9;
        for (let x = 60; x <= W - 60; x += 30) {
          let sc = -Math.abs(x - hook.x) * .12, near = 1e9;
          for (const f of fishes) {
            if (f.hooked) continue;
            const dy = f.y - hook.y;
            if (dy < -30 || dy > 230) continue;
            const reach = f.sp.len * f.size * .5 + 20 + Math.abs(f.v) * dy / 220 * .9;
            const g = Math.abs(f.x - x) - reach;
            if (g < near) near = g;
          }
          sc += Math.min(near, 80) * 2;
          if (sc > bs) { bs = sc; best = x; }
        }
        hook.tx = lerp(hook.tx, best, Math.min(1, dt * 3));
      } else if (state === 'rise') {
        let tgt = null, bd = 1e9;
        for (const f of fishes) {
          if (f.hooked) continue;
          const dy = hook.y - f.y;
          if (dy < 0 || dy > 260) continue;
          const sc = dy - f.val * .002;
          if (sc < bd) { bd = sc; tgt = f; }
        }
        hook.tx = tgt ? lerp(hook.tx, tgt.x + tgt.dir * tgt.v * .25, Math.min(1, dt * 3.5)) : lerp(hook.tx, W / 2 + 60, dt * .8);
      }
    };

    const update = dt => {
      S.t += dt; skyT += dt;
      if (msg) msg.t += dt;
      if (music) music.update(dt);
      mk(dt);
      if (modal) {
        if (modal.k === 'welcome') modal.t += dt;
        stepFish(dt);
        return;
      }
      const inPlay = state === 'drop' || state === 'rise';
      if (state === 'idle') {
        idleT += dt;
        if (sv.auto && sv.hasAuto && idleT > .9 && !modal) cast();
        hook.x = lerp(hook.x, boatTip[0], Math.min(1, dt * 6)); hook.tx = hook.x;
      }
      if (inPlay) {
        if (sv.auto && sv.hasAuto && !S.down && !S.keys.size) aiSteer(dt);
        else {
          let dx = 0;
          if (S.keys.has('ArrowLeft') || S.keys.has('KeyA')) dx -= 1;
          if (S.keys.has('ArrowRight') || S.keys.has('KeyD')) dx += 1;
          if (dx) hook.tx = clamp(hook.tx + dx * 620 * dt, 20, W - 20);
          else if (S.down || (!S.touch && S.mx > 0 && S.mx < W)) hook.tx = clamp(S.mx, 20, W - 20);
        }
        const ax = (hook.tx - hook.x) * 14 - hook.vx * 6.5;
        hook.vx += ax * dt; hook.vx = clamp(hook.vx, -560, 560); hook.x = clamp(hook.x + hook.vx * dt, 14, W - 14);
        const spd = maxPx() / diveTime();
        if (state === 'drop') {
          hook.y += spd * dt * (1 + Math.min(.35, hook.y / maxPx() * .35));
          if (hook.y >= maxPx()) { hook.y = maxPx(); state = 'rise'; S.ring(hook.x, hook.y, 4, 40, '#9ff', .5); au.tone(300, .25, 'sine', .05, 150); sv.deepest = Math.max(sv.deepest, maxM()); }
        } else {
          const full = hooked.length >= capN();
          hook.y -= spd * dt * (full ? 2.8 : 1.7);
          if (hook.y <= 0) { hook.y = 0; endCast(); }
        }
        tryHook();
        stepFish(dt);
        trail.push({ x: hook.x, y: hook.y, t: 0 }); if (trail.length > 24) trail.shift();
        if (Math.random() < dt * 14) bubbles.push({ x: hook.x + rnd(-6, 6), y: hook.y - 6, r: rnd(1.5, 4), v: rnd(30, 70), life: rnd(.8, 1.6), t: 0 });
        hooked.forEach((f, i) => {
          const a = i * 2.4 + S.t * 2.2, rr = 14 + Math.sqrt(i) * 13;
          const tx = hook.x + Math.cos(a) * rr * .9, ty = hook.y - 20 - Math.abs(Math.sin(a)) * rr * .9 - Math.floor(i / 3) * 6;
          f.x = lerp(f.x, tx, Math.min(1, dt * 14)); f.y = lerp(f.y, ty, Math.min(1, dt * 14));
        });
      }
      if (state === 'haul') {
        haulT += dt;
        while (haulQ.length && haulT >= .09 * (haulN + 1) * .9) {
          const f = haulQ.shift(); haulN++; haulTot += f.val;
          const id = f.sp.id;
          sv.hold.push({ id, v: f.val, size: f.size, gold: f.gold });
          const dx = sv.dex[id] || (sv.dex[id] = { n: 0, best: 0, gold: 0 });
          if (!dx.n) { newDex.push(f.sp.n); sPop(W / 2, 200 + newDex.length * 30, tr('NEW: {f}!', { f: tr(f.sp.n) }), '#9ef0ff', 26, { life: 1.8, vy: -15 }); au.tone(784, .15, 'triangle', .07); au.tone(1047, .3, 'triangle', .07, 0, .12); }
          dx.n++; dx.best = Math.max(dx.best, f.size); if (f.gold) dx.gold++;
          const pit = Math.min(2200, 480 * Math.pow(1.045, haulN));
          au.tone(pit, .1, 'sine', .08, pit * 1.6); au.noise(.05, .04, 4000, 0, 'highpass');
          const big = f.val >= 500 || f.gold;
          S.pop(boatTip[0] - 70 + rnd(-24, 24), boatTip[1] + 10 - 40, '+' + short(f.val), f.gold ? '#ffe14d' : f.val >= 1000 ? '#ffb347' : '#fff', big ? 26 : 19, { life: .9, vy: -90 });
          S.spark(boatTip[0] - 70, 10, 5, f.gold ? ['#ffe14d', '#fff'] : ['#fff', '#8ef'], 150, 300, .5);
          if (big) { S.shake = 6; S.confetti(boatTip[0] - 60, 0, 8); }
        }
        if (!haulQ.length && haulT > .09 * haulN * .9 + .25) finishHaul();
      }
      coinsShown = lerp(coinsShown, sv.coins, Math.min(1, dt * 9)); if (Math.abs(coinsShown - sv.coins) < 1) coinsShown = sv.coins;
      if (fullFlash > 0) fullFlash -= dt * 2.5;
      if (sellT > 0) sellT += dt;
    };
    const mk = dt => {
      sv.mkT = (sv.mkT || 0) + dt;
      if (sv.mkT > 40) {
        sv.mkT = 0;
        FISH.forEach(f => { const m = sv.mk[f.id] || 1; sv.mk[f.id] = clamp(m + (1 - m) * .18 + rnd(-.16, .2), .65, 1.7); });
      }
    };

    let boatTip = [W / 2 + 62, -50];
    const depthCol = d => {
      const st = [[0, '#58d0ee'], [60, '#2fa3de'], [200, '#1c64b5'], [500, '#12388a'], [1000, '#0a1d58'], [2000, '#050f33'], [3500, '#02050f']];
      let i = 0; while (i < st.length - 2 && d > st[i + 1][0]) i++;
      return mix(st[i][1], st[i + 1][1], clamp((d - st[i][0]) / (st[i + 1][0] - st[i][0]), 0, 1));
    };
    const drawSky = sy => {
      const g = c.createLinearGradient(0, 0, 0, sy); g.addColorStop(0, '#74c8ff'); g.addColorStop(1, '#d6f3ff'); c.fillStyle = g; c.fillRect(0, 0, W, sy + 2);
      c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(790, sy - 120 - Math.sin(skyT * .02) * 6, 46, 0, TAU); c.fill(); c.fillStyle = alpha('#fff6b0', .35); c.beginPath(); c.arc(790, sy - 120, 70, 0, TAU); c.fill();
      for (const cl of clouds) {
        cl.x += cl.v * .016; if (cl.x > W + 120) cl.x = -120;
        const x = cl.x, y = sy - 130 + cl.y * .55 - 20;
        c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.arc(x, y, 22 * cl.s, 0, TAU); c.arc(x + 24 * cl.s, y - 8 * cl.s, 28 * cl.s, 0, TAU); c.arc(x + 52 * cl.s, y, 22 * cl.s, 0, TAU); c.rect(x, y, 52 * cl.s, 22 * cl.s); c.fill();
      }
      for (const gl of gulls) {
        gl.x += gl.v * .016; if (gl.x > W + 40) gl.x = -40;
        const x = gl.x, y = sy - 90 + gl.y * .4 + Math.sin(skyT + gl.ph) * 6, fl = Math.sin(skyT * 6 + gl.ph) * 5;
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 12, y + fl); c.quadraticCurveTo(x - 5, y - 6, x, y); c.quadraticCurveTo(x + 5, y - 6, x + 12, y + fl); c.stroke();
      }
    };
    const drawWorld = () => {
      const surf = -camY;
      if (surf > 0) drawSky(surf);
      const wy0 = Math.max(0, surf), top = camY, bot = camY + H;
      const dTop = Math.max(0, top) / TF_PXM, dBot = bot / TF_PXM;
      const g = c.createLinearGradient(0, wy0, 0, H), span = H - wy0;
      for (let i = 0; i <= 8; i++) { const u = i / 8; g.addColorStop(u, depthCol(Math.max(0, (camY + wy0 + u * span) / TF_PXM))); }
      c.fillStyle = g; c.fillRect(0, wy0, W, H - wy0);
      c.save(); c.translate(0, -camY);
      const dm = Math.max(0, camY) / TF_PXM;
      const rayA = clamp(1 - dm / 220, 0, 1) * .22;
      if (rayA > .01) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) { const x = 90 + i * 170 + Math.sin(S.t * .5 + i * 2) * 36; const g2 = c.createLinearGradient(0, 0, 0, 520); g2.addColorStop(0, alpha('#ffffff', rayA)); g2.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g2; c.beginPath(); c.moveTo(x - 24, 0); c.lineTo(x + 24, 0); c.lineTo(x + 100 + Math.sin(S.t * .4 + i) * 30, 520); c.lineTo(x - 70, 520); c.closePath(); c.fill(); }
        c.restore();
      }
      const surfaceWave = (y, col, amp, ph) => { c.beginPath(); c.moveTo(0, y + 30); for (let x = 0; x <= W; x += 16) c.lineTo(x, y + Math.sin(x * .03 + S.t * 1.6 + ph) * amp); c.lineTo(W, y + 30); c.closePath(); c.fillStyle = col; c.fill(); };
      for (const p of snow) {
        const wy = camY + (((p.y - S.t * 6 * p.s - camY * (.25 + p.s * .3)) % (H + 40) + (H + 40)) % (H + 40)) - 20;
        if (wy < 8) continue;
        c.globalAlpha = .35 + p.s * .4; c.fillStyle = '#d9f6ff'; c.beginPath(); c.arc(p.x + Math.sin(S.t * .6 + p.y) * 8, wy, p.r, 0, TAU); c.fill();
      }
      c.globalAlpha = 1;
      for (let m = 50; m <= maxM() + 50; m += m < 200 ? 25 : m < 1000 ? 50 : 100) {
        const y = m * TF_PXM; if (y < top - 20 || y > bot + 20) continue;
        c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 2; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); c.setLineDash([]);
        S.text(m + ' m', 14, y - 10, 15, 'rgba(255,255,255,.55)', 'left', null, 800);
      }
      const floor = maxPx() + 70;
      if (bot > floor - 40) {
        c.fillStyle = '#c7a86a'; c.beginPath(); c.moveTo(0, floor); for (let x = 0; x <= W; x += 20) c.lineTo(x, floor + Math.sin(x * .02) * 8 + (x % 80 === 0 ? -4 : 0)); c.lineTo(W, floor + 400); c.lineTo(0, floor + 400); c.closePath();
        const gs = c.createLinearGradient(0, floor - 10, 0, floor + 200); gs.addColorStop(0, '#d9bf86'); gs.addColorStop(1, '#8c7240'); c.fillStyle = gs; c.fill(); c.strokeStyle = '#4a3a1c'; c.lineWidth = 3; c.stroke();
        const deepc = depthCol(maxM());
        for (let i = 0; i < 9; i++) { const x = 60 + i * 110 + (i % 3) * 14, h = 40 + (i * 37) % 60; c.strokeStyle = mix('#2fa86a', deepc, .55); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, floor + 4); for (let j = 1; j <= 5; j++) c.lineTo(x + Math.sin(S.t * 1.2 + j + i) * 6 * (j / 5), floor - h * j / 5); c.stroke(); }
        for (let i = 0; i < 5; i++) { const x = 100 + i * 190, cc = ['#ff6b8b', '#ff9f43', '#c77dff', '#4dd4ac', '#ff6b6b'][i]; c.fillStyle = mix(cc, deepc, .4); c.strokeStyle = shade(cc, -.5); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 24, floor + 6); c.quadraticCurveTo(x - 30, floor - 30, x - 14, floor - 38); c.quadraticCurveTo(x - 8, floor - 18, x, floor - 44); c.quadraticCurveTo(x + 10, floor - 18, x + 16, floor - 36); c.quadraticCurveTo(x + 34, floor - 28, x + 26, floor + 6); c.closePath(); c.fill(); c.stroke(); }
        c.fillStyle = '#7a6a50'; c.strokeStyle = '#2a2438'; c.lineWidth = 3; for (const [x, w] of [[300, 50], [640, 70], [860, 40]]) { c.beginPath(); c.ellipse(x, floor + 10, w, w * .5, 0, Math.PI, TAU); c.fill(); c.stroke(); }
        S.text('Ocean floor', W / 2, floor + 60, 20, 'rgba(255,255,255,.65)', 'center', null, 800);
        S.text('Buy Line Length to dive deeper', W / 2, floor + 88, 14, 'rgba(255,255,255,.5)', 'center', null, 700);
      }
      const bob = Math.sin(S.t * 1.7) * 3;
      surfaceWave(0, alpha('#8fe3ff', .5), 4, 0);
      boatTip = drawBoat(c, W / 2, S.t, tier(), bob - 10 + 4);
      surfaceWave(6, alpha('#2fa3de', .55), 5, 2);
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 14) c[x ? 'lineTo' : 'moveTo'](x, Math.sin(x * .03 + S.t * 1.6) * 4); c.stroke();
      for (const f of fishes) {
        if (f.hooked) continue;
        const sy = f.y - camY; if (sy < -80 || sy > H + 80) continue;
        const d = f.dir;
        c.save(); c.translate(f.x, f.y + Math.sin(f.ph * 2) * 4); c.scale(d, 1);
        if (f.sp.k === 'angler' || f.sp.k === 'lantern') { c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(0, 0, 4, 0, 0, 60); gl.addColorStop(0, alpha(f.sp.c2, .28)); gl.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 60, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over'; }
        if (f.gold) { c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(0, 0, 4, 0, 0, 55); gl.addColorStop(0, 'rgba(255,214,70,.55)'); gl.addColorStop(1, 'rgba(255,214,70,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 55, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over'; }
        drawFishBody(c, f.sp, f.size, S.t, f.ph, f.gold);
        c.restore();
      }
      if (state !== 'idle') {
        if (state !== 'haul') {
          c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); trail.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p.x, p.y)); c.stroke();
          c.strokeStyle = '#f5f1e6'; c.lineWidth = 2; c.beginPath(); c.moveTo(boatTip[0], boatTip[1]); const mx = (boatTip[0] + hook.x) / 2, my = Math.min(hook.y, 80) * .5; c.quadraticCurveTo(mx, my + 20, hook.x, hook.y - 14); c.stroke();
        }
      } else {
        c.strokeStyle = '#f5f1e6'; c.lineWidth = 2; c.beginPath(); c.moveTo(boatTip[0], boatTip[1]); c.lineTo(boatTip[0], boatTip[1] + 30); c.stroke();
      }
      if (state === 'idle' || state === 'drop' || state === 'rise') {
        c.save(); c.translate(hook.x, state === 'idle' ? boatTip[1] + 30 : hook.y);
        c.strokeStyle = '#d6dde6'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 4); c.arc(-7, 4, 7, 0, Math.PI * .95); c.stroke(); c.strokeStyle = '#6a7686'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#ff5d5d'; c.beginPath(); c.ellipse(-12, 3, 3, 2, 0, 0, TAU); c.fill();
        c.restore();
      }
      for (const f of hooked) {
        c.save(); c.translate(f.x, f.y); c.rotate(Math.sin(S.t * 8 + f.ph) * .3 + (state === 'drop' ? Math.PI / 2 : -Math.PI / 2 + .0) * 0 + Math.PI / 2 * (f.x > hook.x ? 1 : -1) * .5); c.scale(f.dir, 1);
        drawFishBody(c, f.sp, f.size, S.t * 1.6, f.ph, f.gold); c.restore();
      }
      if (state === 'haul') {
        for (const f of haulQ) { c.save(); c.translate(boatTip[0] - 50, boatTip[1] + 20); c.rotate(Math.sin(S.t * 9 + f.ph) * .4); drawFishBody(c, f.sp, f.size * .7, S.t * 2, f.ph, f.gold); c.restore(); break; }
      }
      for (const b of bubbles) { c.globalAlpha = Math.max(0, 1 - b.t / b.life) * .8; c.strokeStyle = '#d6f7ff'; c.lineWidth = 1.6; c.beginPath(); c.arc(b.x + Math.sin(b.t * 6 + b.r) * 3, b.y, b.r, 0, TAU); c.stroke(); }
      c.globalAlpha = 1;
      S.drawFx(false);
      c.restore();
      const dd = (camY + H * .5) / TF_PXM;
      const vg = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,10,30,${clamp(.15 + dd / 1500, 0, .55)})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    };

    const upIcon = (k, x, y, r = 16) => {
      c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#2a2438'; c.lineWidth = 3;
      if (k === 'depth') { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -r); c.lineTo(r * .8, -r * .1); c.lineTo(r * .3, -r * .1); c.lineTo(r * .3, r); c.lineTo(-r * .3, r); c.lineTo(-r * .3, -r * .1); c.lineTo(-r * .8, -r * .1); c.closePath(); c.scale(1, -1); c.fill(); c.stroke(); }
      else if (k === 'cap') { c.fillStyle = '#fff'; drawFishBody(c, FBY.minnow, .85, 0, 0, false); }
      else if (k === 'val') icoCoin(c, 0, 0, r);
      else if (k === 'reel') { c.fillStyle = '#e8eef5'; c.beginPath(); c.arc(0, 0, r * .85, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#6a7686'; c.beginPath(); c.arc(0, 0, r * .3, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(r * .3, 0); c.lineTo(r * 1.1, -r * .4); c.stroke(); }
      else if (k === 'off') { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r * .9, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, -r * .55); c.lineTo(0, 0); c.lineTo(r * .4, r * .3); c.stroke(); }
      c.restore();
    };
    const drawUpgradeBar = () => {
      const keys = ['depth', 'cap', 'val', 'reel', 'off'];
      const bw = 142, gap = 8, x0 = 14, y = H - 104;
      keys.forEach((k, i) => {
        const U = TF_UP[k], lv = sv.lv[k], x = x0 + i * (bw + gap), maxed = lv >= U.max, cst = U.cost(lv), can = sv.coins >= cst && !maxed;
        const pulse = can ? .5 + Math.sin(S.t * 5 + i) * .5 : 0;
        S.panel(x, y, bw, 92, { fill: '#fff8e7', r: 14, lw: 3, sh: 4 });
        c.save(); rrp(c, x + 3, y + 3, bw - 6, 24, 11); c.fillStyle = can ? '#7bd88f' : '#ffd5a0'; c.fill(); c.restore();
        upIcon(k === 'cap' ? 'cap' : k, x + 20, y + 15, 9);
        S.text(U.n, x + 38 + (bw - 38) / 2 - 2, y + 15, S.fit(U.n, bw - 52, 13), '#2a2438', 'center', null, 900);
        S.text(maxed ? 'MAX' : U.eff(lv) + '  >  ' + U.eff(lv + 1), x + bw / 2, y + 40, S.fit(maxed ? 'MAX' : U.eff(lv) + ' > ' + U.eff(lv + 1), bw - 10, 12), '#5a4a6a', 'center', null, 800);
        S.text(tr('Lv {n}', { n: lv + 1 }), x + bw / 2, y + 55, 11, '#8a7a9a', 'center', null, 800);
        if (S.btn(x + 8, y + 62, bw - 16, 24, maxed ? 'MAXED' : money(cst), { color: can ? '#3ecf6c' : '#c9c1d6', size: 14, enabled: can, r: 10 })) buy(k);
        if (pulse) { c.save(); c.globalAlpha = pulse * .5; rrp(c, x - 2, y - 2, bw + 4, 96, 16); c.strokeStyle = '#7bff9a'; c.lineWidth = 3; c.stroke(); c.restore(); }
      });
      const x = x0 + 5 * (bw + gap), w = W - x - 14;
      S.panel(x, y, w, 92, { fill: '#e9f6ff', r: 14, lw: 3, sh: 4 });
      S.text('Auto-Fisher', x + w / 2, y + 17, 13, '#2a2438', 'center', null, 900);
      S.text(sv.hasAuto ? (sv.auto ? 'Casting for you' : 'Paused') : 'Fishes by itself', x + w / 2, y + 38, 11, '#5a4a6a', 'center', null, 800);
      if (S.btn(x + 8, y + 52, w - 16, 32, sv.hasAuto ? (sv.auto ? 'ON' : 'OFF') : money(AUTO_COST), { color: sv.hasAuto ? (sv.auto ? '#3ecf6c' : '#8a7fa8') : sv.coins >= AUTO_COST ? '#3ecf6c' : '#c9c1d6', size: 16, enabled: sv.hasAuto || sv.coins >= AUTO_COST, r: 10 })) buyAuto();
    };
    const hudBtn = (x, y, label, fn, o = {}) => { if (S.btn(x, y, o.w || 92, 36, label, Object.assign({ color: '#5e7ce2', size: 14, r: 12 }, o))) fn(); };
    const drawHud = () => {
      S.panel(14, 12, 236, 46, { fill: '#2a2a44', line: '#14122a', r: 23, lw: 3, sh: 4 });
      icoCoin(c, 40, 35, 16); S.text(short(coinsShown), 62, 36, S.fit(short(coinsShown), 170, 26), '#ffe14d', 'left', '#14122a');
      const hv = holdValue(), hn = sv.hold.length;
      if (hn) {
        S.panel(14, 70, 236, 76, { fill: '#fff8e7', r: 16, lw: 3, sh: 4 });
        S.text(tr('Catch: {n} fish', { n: hn }), 28, 88, 15, '#2a2438', 'left', null, 900);
        S.text(tr('worth {m}', { m: money(hv) }), 28, 108, 13, '#6a4a2a', 'left', null, 800);
        if (S.btn(142, 82, 100, 54, 'SELL', { color: '#ffb703', size: 24, sub: money(hv), r: 14 }) || (state === 'idle' && S.key('KeyE'))) sellAll();
        if (sellT > 0 && sellT < .6) { c.save(); c.globalAlpha = 1 - sellT / .6; c.fillStyle = '#fff'; rrp(c, 14, 70, 236, 76, 16); c.fill(); c.restore(); }
      }
      if (state === 'idle') {
        hudBtn(W - 14 - 100, 14, 'Fish Book', () => { modal = { k: 'dex' }; }, { w: 100, color: '#2ba7a0' });
        hudBtn(W - 14 - 204, 14, 'Market', () => { modal = { k: 'market' }; }, { w: 100, color: '#e8734a' });
      }
      hudBtn(W - 14 - 46, 58 - 0, '', () => { music.toggle(); sv.mus = music.on; persist(); }, { w: 46, color: music.on ? '#5e7ce2' : '#8a7fa8', icon: (x, y) => note(c, x, y) });
      const inP = state === 'drop' || state === 'rise';
      const dm = Math.round(hook.y / TF_PXM);
      if (inP) {
        S.panel(W / 2 - 120, 12, 240, 40, { fill: 'rgba(20,18,42,.82)', line: '#14122a', r: 20, lw: 3, sh: 3 });
        S.text(`${dm} m`, W / 2 - 84, 33, 20, '#9ff3ff', 'center', '#14122a');
        S.text(`/ ${maxM()} m`, W / 2 - 38, 34, 13, '#9aa3c8', 'left', null, 800);
        const cp = capN(), show = Math.min(cp, 14);
        for (let i = 0; i < show; i++) { const x = W / 2 + 20 + i * 7; c.fillStyle = i < Math.min(hooked.length, show) * (show / Math.min(cp, show)) ? '#ffd23f' : 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(x, 33, 3, 0, TAU); c.fill(); }
        S.text(`${hooked.length}/${cp}`, W / 2 + 20 + show * 7 + 8, 33, 13, fullFlash > 0 ? '#ffd23f' : '#fff', 'left', '#14122a');
        const pr = state === 'drop' ? hook.y / maxPx() : 1 - hook.y / maxPx();
        S.panel(W / 2 - 120, 56, 240, 10, { fill: 'rgba(0,0,0,.35)', line: '#14122a', r: 5, lw: 2, sh: 0 });
        rrp(c, W / 2 - 118, 58, Math.max(6, 236 * (state === 'drop' ? pr * .5 : .5 + (1 - hook.y / maxPx()) * .5)), 6, 3); c.fillStyle = state === 'drop' ? '#4cc9f0' : '#ffd23f'; c.fill();
        S.text(state === 'drop' ? 'Dodge the fish!' : 'Grab fish on the way up!', W / 2, 82, 15, '#fff', 'center', '#14122a');
      }
      if (state === 'idle' && !modal) {
        drawUpgradeBar();
        if (!sv.auto) {
          S.btn(W / 2 - 100, 250, 200, 56, 'CAST', { color: '#ff5d5d', size: 28, r: 28, sub: 'tap anywhere / Space' }) && cast();
        }
        if (S.released && !S.downBtn && !S.lock && S.my > 70 && S.my < H - 118 && !S.inside(14, 70, 236, 76)) cast();
      }
      if (msg) {
        const a = Math.min(1, msg.t * 3) * (msg.t > 6 ? Math.max(0, 1 - (msg.t - 6)) : 1);
        c.save(); c.globalAlpha = a; S.panel(W / 2 - 260, H - 168, 520, 40, { fill: 'rgba(20,18,42,.88)', r: 20, lw: 3, sh: 3 }); S.text(msg.s, W / 2, H - 148, S.fit(msg.s, 480, 17), '#fff', 'center', null, 800); c.restore();
        if (msg.t > 7) msg = null;
      }
    };
    const drawDexCard = (x, y, w, h, f) => {
      const d = sv.dex[f.id];
      S.panel(x, y, w, h, { fill: d ? '#ffffff' : '#d9d3e6', r: 12, lw: 2.5, sh: 3 });
      c.save(); rrp(c, x + 4, y + 4, w - 8, h * .52, 9); c.clip(); c.fillStyle = d ? mix(depthCol(f.d0 + 20), '#5ec6e8', .3) : '#4a4460'; c.fillRect(x, y, w, h);
      c.translate(x + w / 2, y + h * .3); const sc = Math.min(1, (w - 30) / (f.len * 1.25), (h * .4) / (f.h * 1.25 + 8)); c.scale(sc, sc);
      if (d) drawFishBody(c, f, 1.1, S.t, 0, false); else { c.filter = 'brightness(0)'; drawFishBody(c, f, 1.1, S.t, 0, false); c.filter = 'none'; c.globalAlpha = .6; }
      c.restore();
      S.text(d ? f.n : '???', x + w / 2, y + h * .62, S.fit(d ? f.n : '???', w - 8, 13), '#2a2438', 'center', null, 900);
      S.text(`${f.d0}-${f.d1} m`, x + w / 2, y + h * .74, 10.5, '#6a5a7a', 'center', null, 800);
      S.text(d ? `${money(f.v)}  ·  x${d.n}` : 'Not caught yet', x + w / 2, y + h * .88, 11, d ? '#b86b00' : '#8a7a9a', 'center', null, 800);
      if (d && d.gold) star(c, x + w - 12, y + 12, 8, '#ffd23f');
    };
    const drawModal = () => {
      if (!modal) return;
      S.lock = false;
      if (modal.k === 'welcome') {
        modalFrame(S, 250, 130, 460, 300, 'Welcome back!', { head: '#2ba7a0' });
        S.text(tr('Your crew fished for {t}', { t: (modal.secs >= 3600 ? Math.floor(modal.secs / 3600) + 'h ' : '') + Math.floor(modal.secs % 3600 / 60) + 'm' }), W / 2, 190, 18, '#5a4a6a', 'center', null, 800);
        if (modal.capped) S.text('Offline limit reached. Upgrade Offline Earnings to stay away longer.', W / 2, 214, 12, '#c0392b', 'center', null, 800);
        icoCoin(c, W / 2 - 100, 270, 26); const cnt = Math.floor(modal.earn * eo(modal.t / 1.2));
        S.text('+' + short(cnt), W / 2 - 62, 272, 46, '#e69b00', 'left', '#fff6dc');
        S.text(tr('{p}% of your normal haul, up to {h}h', { p: Math.round(tfOffFrac(sv.lv.off) * 100), h: tfOffHours(sv.lv.off) }), W / 2, 330, 13, '#6a5a7a', 'center', null, 700);
        if (S.btn(W / 2 - 90, 362, 180, 52, 'Collect', { color: '#3ecf6c', size: 24 }) || S.key('Enter') || S.key('Space')) { modal = null; au.tone(880, .2, 'triangle', .07, 1320); persist(); }
      } else if (modal.k === 'dex') {
        modalFrame(S, 40, 50, W - 80, H - 90, tr('Fish Book  {a}/{b}', { a: Object.keys(sv.dex).length, b: FISH.length }), { head: '#2ba7a0' });
        const cw = 122, ch = 118, cols = 7;
        FISH.forEach((f, i) => drawDexCard(58 + (i % cols) * (cw + 8), 92 + Math.floor(i / cols) * (ch + 8), cw, ch, f));
        const tot = Object.values(sv.dex).reduce((a, d) => a + d.n, 0);
        S.text(tr('Total caught {a}   ·   Casts {b}   ·   Best haul {c}   ·   Earned {d}', { a: short(tot), b: short(sv.casts), c: money(sv.bestHaul), d: money(sv.earned) }), W / 2, H - 82, 14, '#5a4a6a', 'center', null, 800);
        if (S.btn(W / 2 - 70, H - 68, 140, 40, 'Close', { color: '#e8734a', size: 18 })) modal = null;
      } else if (modal.k === 'market') {
        modalFrame(S, 150, 50, W - 300, H - 90, 'Fish Market', { head: '#e8734a' });
        S.text('Prices drift every few seconds. Sell when the board is green.', W / 2, 90, 14, '#5a4a6a', 'center', null, 800);
        const have = {}; sv.hold.forEach(h => { have[h.id] = (have[h.id] || 0) + 1; });
        const ids = Object.keys(have);
        if (!ids.length) S.text('Your catch is empty. Go fishing!', W / 2, 250, 20, '#8a7a9a', 'center', null, 800);
        ids.slice(0, 8).forEach((id, i) => {
          const f = FBY[id], y = 112 + i * 42, m = mult(id), tot = sv.hold.filter(h => h.id === id).reduce((a, h) => a + sellPrice(h), 0);
          c.save(); c.translate(190, y + 18); const sc = Math.min(1, 40 / f.len); c.scale(sc, sc); drawFishBody(c, f, 1, S.t, 0, false); c.restore();
          S.text(`${tr(f.n)}  x${have[id]}`, 230, y + 18, 15, '#2a2438', 'left', null, 900);
          const col = m >= 1.12 ? '#2e9c53' : m <= .88 ? '#c0392b' : '#8a6a1a';
          S.text(`${m >= 1.02 ? '▲' : m <= .98 ? '▼' : '•'} ${Math.round(m * 100)}%`, 420, y + 18, 15, col, 'left', null, 900);
          S.text(money(tot), 520, y + 18, 16, '#b86b00', 'left', null, 900);
          if (S.btn(640, y + 4, 90, 32, 'Sell', { color: '#ffb703', size: 15, r: 10 })) sellOne(id);
        });
        if (sv.hold.length && S.btn(W / 2 - 220, H - 76, 200, 40, tr('Sell all {m}', { m: money(holdValue()) }), { color: '#ffb703', size: 16 })) { sellAll(); modal = null; }
        if (S.btn(W / 2 + 20, H - 76, 140, 40, 'Close', { color: '#e8734a', size: 18 })) modal = null;
      }
      if (S.pressed && modal && modal.k !== 'welcome' && !S.inside(40, 50, W - 80, H - 90)) modal = null;
    };

    api.score(sv.coins);
    const keysFrame = () => {
      if (S.key('KeyM')) { music.toggle(); sv.mus = music.on; }
      if (modal) { if (S.key('Escape')) modal = null; return; }
      if (state === 'idle' && (S.key('Space') || S.key('Enter') || S.key('ArrowDown') || S.key('KeyS'))) cast();
      else if (state === 'drop' && S.key('Space') && hook.y > 60) state = 'rise';
    };
    const sim = dt => {
      update(dt);
      for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t += dt; b.y -= b.v * dt; if (b.t > b.life || b.y < 0) bubbles.splice(i, 1); }
      S.stepFx(dt);
      for (let i = coinFly.length - 1; i >= 0; i--) { const k = coinFly[i]; k.t += dt; if (k.t > .7) coinFly.splice(i, 1); }
      let camT;
      if (state === 'idle' || state === 'haul') camT = -170; else camT = clamp(hook.y - H * .42, -170, Math.max(-170, maxPx() + 140 - H));
      camY = lerp(camY, camT, Math.min(1, dt * (state === 'haul' ? 5 : 6.5)));
    };
    let accF = 0;
    api.loop(dt => {
      keysFrame();
      accF += dt; let n = 0;
      while (accF >= 1 / 120 && n < 8) { sim(1 / 120); accF -= 1 / 120; n++; }
      if (n >= 8) accF = 0;
      c.save();
      if (S.shake > 0) c.translate(rnd(-S.shake, S.shake) * .5, rnd(-S.shake, S.shake) * .5);
      drawWorld();
      c.restore();
      c.save(); S.lock = !!modal; drawHud(); c.restore();
      for (const k of coinFly) { if (k.t < 0) continue; const u = k.t / .7, x = lerp(k.x, 40, eio(u)) + Math.sin(u * 9) * 8, y = lerp(k.y, 35, eio(u)); icoCoin(c, x, y, 9 * (1 - u * .3)); }
      drawModal();
      S.drawFx(true);
      api.score(sv.coins);
      S.endFrame();
    });
    root.__dbg = { sv, get s() { return { state, hx: hook.x, hy: hook.y, camY, hooked: hooked.length, cap: capN(), modal: modal && modal.k, fishes: fishes.filter(f => !f.hooked).map(f => ({ x: f.x, y: f.y, w: f.sp.len * f.size, dir: f.dir, v: f.v, val: f.val })), coins: sv.coins, hold: sv.hold.length }; }, cost: k => upCost(k) };
    api.interval(persist, 15000);
    api.on(window, 'beforeunload', persist);
    return { destroy() { persist(); au.close(); } };
  };

  Ameplay.register({
    id: 'reel-deep', title: 'Reel Deep', category: 'Arcade', tint: '#2fa3de',
    blurb: 'Cast your hook, dodge the fish on the way down and scoop up a big haul on the way back. Sell your catch, upgrade your line, strength and offline earnings, and discover 18 species from the shallows to the deepest trench.',
    help: 'Tap, click or <kbd>Space</kbd> to cast · move the mouse, drag a finger or <kbd>A</kbd>/<kbd>D</kbd> (<kbd>←</kbd>/<kbd>→</kbd>) to steer · avoid fish going down, catch them coming up · <kbd>E</kbd> sells · <kbd>M</kbd> music',
    better: 'high', width: 960, format: v => '$' + short(v),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24q12-8 24 0t24 0"/><path d="M32 4v34"/><path d="M32 38a8 8 0 1 0 8-8"/><ellipse cx="22" cy="50" rx="10" ry="6"/><path d="M32 50l8-6v12z"/></svg>',
    css: '.gm-reel-deep{gap:0;min-height:0;justify-content:flex-start}.gm-reel-deep .g-canvas{border-radius:14px;background:#0a1d58}',
    mount(root, api) { return mountFishing(root, api); }
  });

  const PZ = {
    TOPS: [
      { id: 'pep', n: 'Pepperoni', day: 1, per: 3, price: 1.5 },
      { id: 'mush', n: 'Mushrooms', day: 1, per: 4, price: 1.2 },
      { id: 'onion', n: 'Onions', day: 2, per: 5, price: 1 },
      { id: 'pepper', n: 'Green Peppers', day: 3, per: 4, price: 1.1 },
      { id: 'saus', n: 'Sausage', day: 4, per: 3, price: 1.6 },
      { id: 'olive', n: 'Black Olives', day: 5, per: 5, price: 1.2 },
      { id: 'bacon', n: 'Bacon', day: 6, per: 3, price: 1.8 },
      { id: 'pine', n: 'Pineapple', day: 8, per: 4, price: 1.4 },
      { id: 'ham', n: 'Ham', day: 10, per: 3, price: 1.6 },
      { id: 'jala', n: 'Jalapenos', day: 12, per: 4, price: 1.3 },
      { id: 'anch', n: 'Anchovies', day: 14, per: 3, price: 1.7 },
      { id: 'tom', n: 'Tomato Slices', day: 16, per: 3, price: 1.2 }
    ],
    SAUCES: [
      { id: 'mar', n: 'Tomato', day: 1, col: '#c8321e', price: 0 },
      { id: 'bbq', n: 'Barbecue', day: 7, col: '#6e2c14', price: .8 },
      { id: 'alf', n: 'White', day: 9, col: '#f3e8c8', price: .8 }
    ],
    UPS: [
      { id: 'oven', n: 'Extra Oven Slot', max: 2, cost: [160, 420], rank: [2, 5], d: 'More pizzas bake at once.' },
      { id: 'tipjar', n: 'Tip Jar', max: 4, cost: [110, 260, 520, 950], rank: [1, 3, 6, 9], d: 'Tips grow 8% per level.' },
      { id: 'guide', n: 'Cutter Guide', max: 1, cost: [260], rank: [3], d: 'Shows where the other cuts should go.' },
      { id: 'ladle', n: 'Wide Ladle', max: 2, cost: [140, 340], rank: [2, 5], d: 'Sauce and cheese cover more per swipe.' },
      { id: 'steady', n: 'Steady Scoop', max: 2, cost: [220, 520], rank: [3, 6], d: 'Toppings land in a tighter pile.' },
      { id: 'dough', n: 'Fresh Dough', max: 3, cost: [180, 460, 950], rank: [2, 5, 8], d: 'Pizzas sell for 15% more per level.' },
      { id: 'timer', n: 'Oven Timer', max: 1, cost: [1100], rank: [9], d: 'Pizzas pop out at the bell, nearly perfect.' }
    ]
  };
  PZ.TB = {}; PZ.TOPS.forEach(t => { PZ.TB[t.id] = t; });
  PZ.SB = {}; PZ.SAUCES.forEach(t => { PZ.SB[t.id] = t; });
  const OU = {
    CUST: [
      { n: 'Bex', day: 1, skin: '#f5c8a0', hair: '#6b3b1d', hs: 'bob', shirt: '#ff7aa8', acc: {}, tip: 1.1, pat: 1.05 },
      { n: 'Omar', day: 1, skin: '#8d5a3b', hair: '#1e1a18', hs: 'short', shirt: '#3a86ff', acc: { glasses: 1 }, tip: 1, pat: 1 },
      { n: 'Fern', day: 1, skin: '#f0b98e', hair: '#d9a441', hs: 'bun', shirt: '#6bbf59', acc: {}, tip: 1.2, pat: 1.1 },
      { n: 'Gil', day: 2, skin: '#e8b08a', hair: '#8a8a8a', hs: 'bald', shirt: '#b5651d', acc: { mustache: '#7a7a7a' }, tip: .9, pat: .9 },
      { n: 'Suki', day: 3, skin: '#f7d6b5', hair: '#16121a', hs: 'long', shirt: '#9b5de5', acc: {}, tip: 1.15, pat: 1 },
      { n: 'Zeke', day: 4, skin: '#d9a073', hair: '#3a2410', hs: 'spiky', shirt: '#e63946', acc: { hat: ['cap', '#1d3557'] }, tip: .85, pat: .85 },
      { n: 'Ines', day: 5, skin: '#6e4228', hair: '#120c0a', hs: 'curly', shirt: '#ffb703', acc: { glasses: 1 }, tip: 1.2, pat: 1.1 },
      { n: 'Lars', day: 6, skin: '#f2c6a0', hair: '#c9531e', hs: 'short', shirt: '#2a9d8f', acc: { beard: '#a8431a' }, tip: 1, pat: 1 },
      { n: 'Pia', day: 7, skin: '#c98d62', hair: '#2b1a12', hs: 'pony', shirt: '#f06595', acc: {}, tip: 1.25, pat: 1.05 },
      { n: 'Tam', day: 8, skin: '#f5c8a0', hair: '#e8c547', hs: 'mohawk', shirt: '#4cc9f0', acc: {}, tip: .8, pat: .8 },
      { n: 'Nell', day: 9, skin: '#e9b896', hair: '#e6e6e6', hs: 'curly', shirt: '#7b6ad8', acc: { glasses: 1 }, tip: 1.3, pat: 1.2 },
      { n: 'Ravi', day: 10, skin: '#a8714d', hair: '#0f0f12', hs: 'spiky', shirt: '#222831', acc: { hat: ['beanie', '#f4a261'] }, tip: .95, pat: .9 },
      { n: 'Wren', day: 11, skin: '#f8d3b4', hair: '#ff6fb5', hs: 'long', shirt: '#80ed99', acc: {}, tip: 1.1, pat: 1 },
      { n: 'Otis', day: 12, skin: '#dba27c', hair: '#555555', hs: 'short', shirt: '#6c757d', acc: { beard: '#bbbbbb', glasses: 1 }, tip: 1, pat: 1.15 },
      { n: 'Juno', day: 13, skin: '#f1c9a5', hair: '#1b7f4a', hs: 'bob', shirt: '#ffd166', acc: {}, tip: 1.15, pat: 1 },
      { n: 'Kai', day: 14, skin: '#f0c9a2', hair: '#121212', hs: 'bun', shirt: '#ef476f', acc: {}, tip: 1.05, pat: 1.05 },
      { n: 'Uma', day: 15, skin: '#7a4a2c', hair: '#201512', hs: 'pony', shirt: '#118ab2', acc: { glasses: 1 }, tip: 1.2, pat: 1.1 },
      { n: 'Bo', day: 16, skin: '#e9b48e', hair: '#703a1b', hs: 'bald', shirt: '#ff9f1c', acc: { beard: '#703a1b', hat: ['cap', '#e63946'] }, tip: .9, pat: .85 }
    ],
    CRITICS: [
      { n: 'Madame Crumb', skin: '#f2cfb0', hair: '#f0f0f0', hs: 'bun', shirt: '#ff9ecd', acc: { glasses: 1 }, tip: 3.5 },
      { n: 'Sir Basil', skin: '#f2c8a2', hair: '#4a2a12', hs: 'short', shirt: '#2f3e9e', acc: { hat: ['cap', '#b8860b'], mustache: '#4a2a12' }, tip: 3.3 },
      { n: 'Chef Ottavia', skin: '#f0bf98', hair: '#2a2a2a', hs: 'bun', shirt: '#f8f8f8', acc: { hat: ['chef', '#ffffff'] }, tip: 3 },
      { n: 'Dr. Pickles', skin: '#f5c8a0', hair: '#9a9a9a', hs: 'curly', shirt: '#8d6e3f', acc: { glasses: 1, mustache: '#9a9a9a' }, tip: 3.2 },
      { n: 'Lady Marigold', skin: '#c98d62', hair: '#5a1a6e', hs: 'long', shirt: '#7a2bbf', acc: { glasses: 1 }, tip: 3.2 },
      { n: 'Captain Brine', skin: '#e0a47a', hair: '#e8e8e8', hs: 'short', shirt: '#1d3557', acc: { hat: ['cap', '#111111'], beard: '#e8e8e8' }, tip: 3 },
      { n: 'Inspector Gravy', skin: '#a8714d', hair: '#111111', hs: 'short', shirt: '#3a3a44', acc: { glasses: 1 }, tip: 3.6 },
      { n: 'DJ Sizzle', skin: '#8d5a3b', hair: '#00e5ff', hs: 'mohawk', shirt: '#ff00a8', acc: { glasses: 1 }, tip: 3.4 }
    ],
    DECOR: [
      { id: 'plant', n: 'Potted Plant', cost: 80, rank: 1, pat: .04, d: 'A leafy friend by the door.' },
      { id: 'clock', n: 'Wall Clock', cost: 120, rank: 2, pat: .04, d: 'Customers like knowing the time.' },
      { id: 'lights', n: 'String Lights', cost: 180, rank: 3, pat: .05, d: 'Warm lights over the counter.' },
      { id: 'jukebox', n: 'Jukebox', cost: 340, rank: 4, pat: .07, d: 'Music makes the wait shorter.' },
      { id: 'tank', n: 'Fish Tank', cost: 560, rank: 6, pat: .08, d: 'Something to watch while waiting.' },
      { id: 'arcade', n: 'Arcade Cabinet', cost: 900, rank: 8, pat: .1, d: 'The best waiting room in town.' }
    ],
    SHARED: [
      { id: 'chairs', n: 'Comfy Chairs', max: 3, cost: [120, 300, 640], rank: [1, 4, 9], d: 'Customers wait 10% longer per level.' }
    ]
  };
  const BG = {
    L: [
      { id: 'bunB', n: 'Bottom Bun', day: 1, h: 20, price: 0 },
      { id: 'bunT', n: 'Top Bun', day: 1, h: 30, price: 0 },
      { id: 'patty', n: 'Patty', day: 1, h: 16, price: 1.6 },
      { id: 'cheese', n: 'Cheese', day: 1, h: 5, price: .5 },
      { id: 'lettuce', n: 'Lettuce', day: 1, h: 8, price: .4 },
      { id: 'ketchup', n: 'Ketchup', day: 1, h: 4, price: .2, sauce: '#d0281c' },
      { id: 'tomato', n: 'Tomato', day: 2, h: 7, price: .5 },
      { id: 'mustard', n: 'Mustard', day: 3, h: 4, price: .2, sauce: '#f2c21b' },
      { id: 'onion', n: 'Onion', day: 4, h: 6, price: .4 },
      { id: 'pickle', n: 'Pickles', day: 5, h: 5, price: .4 },
      { id: 'bacon', n: 'Bacon', day: 6, h: 6, price: .9 },
      { id: 'mayo', n: 'Mayo', day: 7, h: 4, price: .2, sauce: '#f6f0dc' },
      { id: 'egg', n: 'Fried Egg', day: 9, h: 8, price: .8 },
      { id: 'avo', n: 'Avocado', day: 11, h: 6, price: .9 },
      { id: 'jala', n: 'Jalapenos', day: 13, h: 5, price: .5 }
    ],
    DONE: [
      { id: 'medium', n: 'Medium', v: .72, day: 1 },
      { id: 'well', n: 'Well Done', v: 1, day: 1 },
      { id: 'rare', n: 'Rare', v: .45, day: 3 }
    ],
    UPS: [
      { id: 'grill', n: 'Bigger Grill', max: 1, cost: [380], rank: [3], d: 'Two more spots on the grill.' },
      { id: 'tray', n: 'Warming Tray', max: 1, cost: [240], rank: [3], d: 'Holds two more cooked patties.' },
      { id: 'tipjar', n: 'Tip Jar', max: 4, cost: [110, 260, 520, 950], rank: [1, 3, 6, 9], d: 'Tips grow 8% per level.' },
      { id: 'bell', n: 'Grill Bell', max: 1, cost: [300], rank: [4], d: 'Rings when a side is rare, medium or well done.' },
      { id: 'steady', n: 'Steady Hands', max: 2, cost: [200, 480], rank: [4, 7], d: 'Ingredients land closer to the middle.' },
      { id: 'buns', n: 'Bakery Buns', max: 3, cost: [180, 460, 950], rank: [4, 6, 9], d: 'Burgers sell for 15% more per level.' }
    ]
  };
  BG.B = {}; BG.L.forEach(t => { BG.B[t.id] = t; });
  BG.DB = {}; BG.DONE.forEach(t => { BG.DB[t.id] = t; });
  const SH = {
    SIZE: [{ id: 's', n: 'Small', w: 74, h: 112, price: 3.5 }, { id: 'm', n: 'Medium', w: 88, h: 142, price: 4.5 }, { id: 'l', n: 'Large', w: 102, h: 172, price: 5.5 }],
    SYR: [
      { id: 'van', n: 'Vanilla', day: 1, col: '#f6ead0' },
      { id: 'choc', n: 'Chocolate', day: 1, col: '#7a4a2c' },
      { id: 'straw', n: 'Strawberry', day: 3, col: '#f48fb1' },
      { id: 'mango', n: 'Mango', day: 5, col: '#ffb547' },
      { id: 'mint', n: 'Mint', day: 7, col: '#9de0c0' },
      { id: 'berry', n: 'Blueberry', day: 9, col: '#8f86e0' }
    ],
    MIX: [
      { id: 'strawb', n: 'Strawberries', day: 1, col: '#e53950', price: .6 },
      { id: 'cookie', n: 'Cookie Bits', day: 1, col: '#6b4226', price: .6 },
      { id: 'chip', n: 'Choc Chips', day: 2, col: '#3b2416', price: .5 },
      { id: 'banana', n: 'Banana', day: 4, col: '#ffe27a', price: .5 },
      { id: 'blue', n: 'Blueberries', day: 6, col: '#3f51b5', price: .6 },
      { id: 'mallow', n: 'Marshmallows', day: 8, col: '#fff4f8', price: .6 },
      { id: 'nut', n: 'Peanuts', day: 10, col: '#c98a4a', price: .5 }
    ],
    BLEND: [{ id: 'chunky', n: 'Chunky', v: .34, day: 2 }, { id: 'regular', n: 'Regular', v: .67, day: 1 }, { id: 'smooth', n: 'Smooth', v: 1, day: 1 }],
    DRIZ: [
      { id: 'none', n: 'No Sauce', day: 1, col: null },
      { id: 'choc', n: 'Choc Sauce', day: 1, col: '#4a2614' },
      { id: 'cara', n: 'Caramel', day: 2, col: '#d98a1e' },
      { id: 'straw', n: 'Berry Sauce', day: 4, col: '#d6336c' },
      { id: 'blue', n: 'Blue Sauce', day: 8, col: '#3b5bdb' }
    ],
    SPR: [
      { id: 'none', n: 'No Sprinkles', day: 1, cols: null },
      { id: 'rainbow', n: 'Rainbow', day: 1, cols: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#ff9ff3'] },
      { id: 'choc', n: 'Choc Flakes', day: 3, cols: ['#3b2416', '#5a3a22'] },
      { id: 'nuts', n: 'Crushed Nuts', day: 6, cols: ['#c98a4a', '#e0b07a'] }
    ],
    TOP: [
      { id: 'cherry', n: 'Cherry', day: 1, price: .3 },
      { id: 'wafer', n: 'Wafer', day: 1, price: .4 },
      { id: 'cookie', n: 'Cookie', day: 2, price: .5 },
      { id: 'gummy', n: 'Gummy Bear', day: 5, price: .4 },
      { id: 'straw', n: 'Strawberry', day: 7, price: .4 },
      { id: 'choc', n: 'Choc Square', day: 9, price: .5 }
    ],
    UPS: [
      { id: 'blender', n: 'Extra Blender', max: 1, cost: [360], rank: [6], d: 'Blend three shakes at once.' },
      { id: 'tipjar', n: 'Tip Jar', max: 4, cost: [110, 260, 520, 950], rank: [1, 3, 6, 9], d: 'Tips grow 8% per level.' },
      { id: 'line', n: 'Fill Line Sensor', max: 1, cost: [320], rank: [6], d: 'The pump slows down near the fill line.' },
      { id: 'meter', n: 'Blend Marks', max: 1, cost: [260], rank: [6], d: 'Shows the target mark on every blender.' },
      { id: 'cream', n: 'Cream Nozzle', max: 1, cost: [280], rank: [7], d: 'Whipped cream stops at the right height.' },
      { id: 'cups', n: 'Fancy Cups', max: 3, cost: [180, 460, 950], rank: [6, 8, 10], d: 'Shakes sell for 15% more per level.' }
    ]
  };
  ['SYR', 'MIX', 'DRIZ', 'SPR', 'TOP', 'SIZE', 'BLEND'].forEach(k => { SH[k + 'B'] = {}; SH[k].forEach(t => { SH[k + 'B'][t.id] = t; }); });
  const pzRank = pts => 1 + Math.floor(Math.sqrt(pts / 90));
  const pzRankPts = r => 90 * (r - 1) * (r - 1);
  const PCOL = [[0, '#e9a0a0'], [.45, '#c46a5a'], [.72, '#9a5638'], [1, '#6e3b22'], [1.3, '#2b1a12']];
  const pattyCol = v => { let i = 0; while (i < PCOL.length - 2 && v > PCOL[i + 1][0]) i++; return mix(PCOL[i][1], PCOL[i + 1][1], clamp((v - PCOL[i][0]) / (PCOL[i + 1][0] - PCOL[i][0]), 0, 1)); };
  const doneName = v => v < .3 ? 'Raw' : v < .58 ? 'Rare' : v < .86 ? 'Medium' : v < 1.15 ? 'Well Done' : 'Burnt';
  const bgLayer = (c, id, x, yb, w, o = {}) => {
    const k = w / 150, L = BG.B[id], h = L.h * k, hw = w / 2, ol = '#2a1b14';
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = Math.max(1.2, 2.4 * k); c.strokeStyle = ol;
    if (id === 'bunB') {
      c.beginPath(); c.moveTo(x - hw, yb - h); c.lineTo(x + hw, yb - h); c.quadraticCurveTo(x + hw, yb, x + hw - 14 * k, yb); c.lineTo(x - hw + 14 * k, yb); c.quadraticCurveTo(x - hw, yb, x - hw, yb - h); c.closePath();
      c.fillStyle = '#e3a058'; c.fill(); c.stroke(); c.fillStyle = '#f6dcae'; c.fillRect(x - hw + 3 * k, yb - h + 1, w - 6 * k, 5 * k);
    } else if (id === 'bunT') {
      c.beginPath(); c.moveTo(x - hw, yb); c.quadraticCurveTo(x - hw, yb - h * 1.1, x, yb - h * 1.05); c.quadraticCurveTo(x + hw, yb - h * 1.1, x + hw, yb); c.closePath();
      const g = c.createLinearGradient(0, yb - h, 0, yb); g.addColorStop(0, '#f0b468'); g.addColorStop(1, '#c97c34'); c.fillStyle = g; c.fill(); c.stroke();
      c.fillStyle = '#fff6dc'; for (let i = 0; i < 9; i++) { const sx = x - hw * .7 + i * hw * .175, sy = yb - h * (.45 + .35 * Math.sin((i / 8) * Math.PI)); c.beginPath(); c.ellipse(sx, sy, 3 * k + .5, 1.6 * k + .4, (i - 4) * .15, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(x - hw * .35, yb - h * .7, hw * .25, h * .12, -.2, 0, TAU); c.fill();
    } else if (id === 'patty') {
      const col = pattyCol(o.cook == null ? .8 : o.cook);
      rrp(c, x - hw + 3 * k, yb - h, w - 6 * k, h, h * .45); c.fillStyle = col; c.fill(); c.stroke();
      c.strokeStyle = shade(col, -.35); c.lineWidth = Math.max(1, 1.4 * k);
      for (let i = 0; i < 5; i++) { const sx = x - hw * .7 + i * hw * .35; c.beginPath(); c.moveTo(sx, yb - h * .55); c.lineTo(sx + 6 * k, yb - h * .45); c.stroke(); }
    } else if (id === 'cheese') {
      c.beginPath(); c.moveTo(x - hw - 4 * k, yb - h); c.lineTo(x + hw + 4 * k, yb - h); c.lineTo(x + hw + 2 * k, yb); c.lineTo(x + hw * .55, yb); c.lineTo(x + hw * .45, yb + 8 * k); c.lineTo(x + hw * .32, yb); c.lineTo(x - hw * .3, yb); c.lineTo(x - hw * .42, yb + 10 * k); c.lineTo(x - hw * .55, yb); c.lineTo(x - hw - 2 * k, yb); c.closePath();
      c.fillStyle = '#ffc93c'; c.fill(); c.stroke();
    } else if (id === 'lettuce') {
      c.beginPath(); c.moveTo(x - hw - 6 * k, yb - h * .3);
      for (let i = 0; i <= 10; i++) { const sx = x - hw - 6 * k + i * (w + 12 * k) / 10; c.quadraticCurveTo(sx - 5 * k, yb - h * (i % 2 ? 1.2 : .7), sx, yb - h * (i % 2 ? .5 : 1)); }
      c.lineTo(x + hw + 4 * k, yb); c.lineTo(x - hw - 4 * k, yb); c.closePath(); c.fillStyle = '#6cc04a'; c.fill(); c.stroke();
      c.strokeStyle = '#a8e07a'; c.lineWidth = Math.max(1, 1.2 * k); c.beginPath(); c.moveTo(x - hw * .8, yb - h * .45); c.lineTo(x + hw * .8, yb - h * .45); c.stroke();
    } else if (id === 'tomato') {
      for (const sx of [-.48, .02, .5]) { rrp(c, x + sx * hw - hw * .44, yb - h, hw * .92, h, h * .5); c.fillStyle = '#e8412c'; c.fill(); c.stroke(); c.fillStyle = '#ff8a70'; c.fillRect(x + sx * hw - hw * .3, yb - h * .65, hw * .6, h * .3); }
    } else if (id === 'onion') {
      for (const sx of [-.55, 0, .55]) { c.beginPath(); c.ellipse(x + sx * hw, yb - h / 2, hw * .36, h / 2, 0, 0, TAU); c.fillStyle = '#f3e8f6'; c.fill(); c.strokeStyle = '#8e5fa8'; c.stroke(); }
    } else if (id === 'pickle') {
      for (const sx of [-.6, -.2, .2, .6]) { c.beginPath(); c.ellipse(x + sx * hw, yb - h / 2, hw * .2, h / 2, 0, 0, TAU); c.fillStyle = '#7ab648'; c.fill(); c.strokeStyle = '#2f5a1a'; c.stroke(); c.fillStyle = '#c6e89a'; c.beginPath(); c.arc(x + sx * hw, yb - h / 2, Math.max(1, 1.4 * k), 0, TAU); c.fill(); }
    } else if (id === 'bacon') {
      for (const off of [-.25, .25]) { c.beginPath(); c.moveTo(x - hw - 2 * k, yb - h * .5 + off * h); for (let i = 0; i <= 6; i++) c.lineTo(x - hw - 2 * k + i * (w + 4 * k) / 6, yb - h * (i % 2 ? .9 : .2) + off * h); c.lineWidth = Math.max(2, 4.2 * k); c.strokeStyle = '#7a2016'; c.stroke(); c.lineWidth = Math.max(1, 2.2 * k); c.strokeStyle = '#e07a68'; c.stroke(); }
    } else if (id === 'egg') {
      c.beginPath(); c.ellipse(x, yb - h * .45, hw * 1.02, h * .5, 0, 0, TAU); c.fillStyle = '#fffaf0'; c.fill(); c.stroke();
      c.beginPath(); c.ellipse(x + hw * .1, yb - h * .7, hw * .32, h * .55, 0, Math.PI, TAU); c.fillStyle = '#ffb21e'; c.fill(); c.stroke();
    } else if (id === 'avo') {
      for (const sx of [-.5, 0, .5]) { c.beginPath(); c.ellipse(x + sx * hw, yb - h / 2, hw * .32, h / 2, 0, 0, TAU); c.fillStyle = '#b9d96a'; c.fill(); c.strokeStyle = '#3e5a1a'; c.stroke(); c.fillStyle = '#e4f2a8'; c.beginPath(); c.ellipse(x + sx * hw, yb - h / 2, hw * .2, h * .28, 0, 0, TAU); c.fill(); }
    } else if (id === 'jala') {
      for (const sx of [-.6, -.2, .2, .6]) { c.beginPath(); c.ellipse(x + sx * hw, yb - h / 2, hw * .18, h / 2, 0, 0, TAU); c.fillStyle = '#4caf3c'; c.fill(); c.strokeStyle = '#1f5f1a'; c.stroke(); c.fillStyle = '#e8f4b0'; c.beginPath(); c.arc(x + sx * hw, yb - h / 2, Math.max(1, 1.6 * k), 0, TAU); c.fill(); }
    } else if (L.sauce) {
      c.beginPath(); c.moveTo(x - hw * .9, yb - h * .5);
      for (let i = 0; i <= 8; i++) { const sx = x - hw * .9 + i * hw * .225; c.quadraticCurveTo(sx - 4 * k, yb + h * (i % 2 ? 1.4 : .2), sx, yb - h * .5); }
      c.lineTo(x + hw * .9, yb - h); c.lineTo(x - hw * .9, yb - h); c.closePath(); c.fillStyle = L.sauce; c.fill(); c.lineWidth = Math.max(1, 1.6 * k); c.strokeStyle = shade(L.sauce, -.45); c.stroke();
    }
    c.restore();
    return h;
  };
  const bgIcon = (c, id, x, y, s) => {
    if (id === 'patty') { c.save(); c.beginPath(); c.arc(x, y, 15 * s, 0, TAU); c.fillStyle = pattyCol(.75); c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a1b14'; c.stroke(); c.restore(); return; }
    const L = BG.B[id], w = 40 * s, h = L.h * w / 150;
    bgLayer(c, id, x, y + Math.max(h, 6 * s) / 2, w);
  };
  const bgStack = (c, layers, x, yb, w, cooks) => {
    let y = yb, pi = 0;
    for (const id of layers) { y -= bgLayer(c, id, x, y, w, id === 'patty' ? { cook: cooks ? cooks[pi++] : .8 } : {}) * .92; }
    return yb - y;
  };
  const shCup = (c, x, yb, sz, o = {}) => {
    const S2 = SH.SIZEB[sz] || SH.SIZE[1], w = S2.w * (o.k || 1), h = S2.h * (o.k || 1), tw = w, bw = w * .72;
    c.save(); c.lineJoin = 'round'; c.lineWidth = Math.max(1.4, 3 * (o.k || 1)); c.strokeStyle = '#2a2438';
    const path = () => { c.beginPath(); c.moveTo(x - tw / 2, yb - h); c.lineTo(x + tw / 2, yb - h); c.lineTo(x + bw / 2, yb); c.lineTo(x - bw / 2, yb); c.closePath(); };
    path(); c.fillStyle = 'rgba(230,245,255,.55)'; c.fill();
    if (o.fill > 0) {
      c.save(); path(); c.clip();
      const fh = h * clamp(o.fill, 0, 1.2) * .86, top = yb - fh, col = o.col || '#f6ead0';
      c.fillStyle = col; c.fillRect(x - tw, top, tw * 2, fh + 2);
      if (o.blend != null) { c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x - tw, top, tw * 2, fh * .3); }
      if (o.mix && o.mix.length) {
        const rr = mulberry(o.seed || 7), big = o.blend == null ? 1 : clamp(1.2 - o.blend, .15, 1);
        for (let i = 0; i < 36; i++) { const m = SH.MIXB[o.mix[i % o.mix.length]]; if (!m) continue; const px = x + (rr() - .5) * tw * .9, py = top + 6 + rr() * (fh - 10); c.fillStyle = m.col; c.beginPath(); c.arc(px, py, (2 + rr() * 3.5) * big * (o.k || 1), 0, TAU); c.fill(); }
      }
      c.restore();
    }
    path(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(1, 2.5 * (o.k || 1)); c.beginPath(); c.moveTo(x - tw / 2 + 8 * (o.k || 1), yb - h + 8); c.lineTo(x - bw / 2 + 6 * (o.k || 1), yb - 8); c.stroke();
    if (o.line) { c.setLineDash([6, 5]); c.strokeStyle = 'rgba(42,36,56,.55)'; c.lineWidth = 2; const ly = yb - h * .86; c.beginPath(); c.moveTo(x - tw / 2 + 2, ly); c.lineTo(x + tw / 2 - 2, ly); c.stroke(); c.setLineDash([]); }
    c.restore();
    return { top: yb - h, w: tw };
  };
  const shTopping = (c, id, x, y, s) => {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineWidth = 2; c.strokeStyle = '#2a2438';
    if (id === 'cherry') { c.strokeStyle = '#3e6b1a'; c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(2, -16, 9, -20); c.stroke(); c.strokeStyle = '#2a2438'; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fillStyle = '#d61f3c'; c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-3, -3, 2.4, 0, TAU); c.fill(); }
    else if (id === 'wafer') { c.rotate(-.35); rrp(c, -5, -22, 10, 30, 3); c.fillStyle = '#e8b86a'; c.fill(); c.stroke(); c.strokeStyle = '#b9853a'; c.lineWidth = 1.2; for (let i = -18; i < 6; i += 6) { c.beginPath(); c.moveTo(-4, i); c.lineTo(4, i + 3); c.stroke(); } }
    else if (id === 'cookie') { c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.fillStyle = '#c98a4a'; c.fill(); c.stroke(); c.fillStyle = '#3b2416'; for (const [a, b] of [[-4, -3], [3, -4], [1, 3], [-3, 4], [5, 2]]) { c.beginPath(); c.arc(a, b, 1.8, 0, TAU); c.fill(); } }
    else if (id === 'gummy') { c.fillStyle = '#ff6b6b'; c.beginPath(); c.arc(-4, -9, 3.5, 0, TAU); c.arc(4, -9, 3.5, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(0, -4, 6, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 5, 7, 8, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(-2, 2, 2, 0, TAU); c.fill(); }
    else if (id === 'straw') { c.beginPath(); c.moveTo(0, 10); c.quadraticCurveTo(-11, 0, -7, -6); c.quadraticCurveTo(0, -10, 7, -6); c.quadraticCurveTo(11, 0, 0, 10); c.fillStyle = '#e53950'; c.fill(); c.stroke(); c.fillStyle = '#5bb04a'; c.beginPath(); c.moveTo(-6, -7); c.lineTo(0, -12); c.lineTo(6, -7); c.lineTo(0, -5); c.closePath(); c.fill(); c.fillStyle = '#ffe27a'; for (const [a, b] of [[-3, -1], [3, -1], [0, 3]]) { c.beginPath(); c.arc(a, b, 1, 0, TAU); c.fill(); } }
    else if (id === 'choc') { c.rotate(.3); rrp(c, -9, -9, 18, 18, 3); c.fillStyle = '#5a3420'; c.fill(); c.stroke(); c.strokeStyle = '#3b2010'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 8); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke(); }
    c.restore();
  };
  const shMixIcon = (c, id, x, y, s) => {
    const m = SH.MIXB[id]; if (!m) return;
    c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 2; c.strokeStyle = '#2a2438';
    if (id === 'strawb') shTopping(c, 'straw', 0, 0, 1);
    else if (id === 'cookie') shTopping(c, 'cookie', 0, 0, 1);
    else if (id === 'banana') { c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fillStyle = '#fff1b0'; c.fill(); c.stroke(); c.fillStyle = '#c9a85a'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(Math.cos(i * 2.1) * 3, Math.sin(i * 2.1) * 3, 1.4, 0, TAU); c.fill(); } }
    else if (id === 'mallow') { for (const [a, b] of [[-5, 2], [5, 2], [0, -5]]) { rrp(c, a - 5, b - 5, 10, 10, 3); c.fillStyle = '#fff4f8'; c.fill(); c.stroke(); } }
    else { for (const [a, b, r] of [[-5, 3, 5], [5, 3, 5], [0, -5, 5.5]]) { c.beginPath(); if (id === 'chip') { c.moveTo(a - r, b + r * .6); c.quadraticCurveTo(a, b - r * 1.6, a + r, b + r * .6); c.closePath(); } else c.arc(a, b, r, 0, TAU); c.fillStyle = m.col; c.fill(); c.stroke(); } }
    c.restore();
  };
  const shCream = (c, x, y, w, amt, k = 1) => {
    if (amt <= 0) return 0;
    const hh = 22 * k * clamp(amt, 0, 1.4);
    c.save(); c.lineWidth = Math.max(1.5, 2.4 * k); c.lineJoin = 'round'; c.strokeStyle = '#a9a2bb';
    for (let i = 0; i < 3; i++) {
      const ww = w * (1 - i * .26) * .5, yy = y - i * hh * .78 - hh * .3;
      c.beginPath(); c.ellipse(x, yy, ww, hh * .5, 0, 0, TAU); c.fillStyle = '#fffdf8'; c.fill(); c.stroke();
      c.fillStyle = 'rgba(200,190,220,.45)'; c.beginPath(); c.ellipse(x + ww * .15, yy + hh * .22, ww * .8, hh * .18, 0, 0, Math.PI); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x - ww * .35, yy - hh * .18, ww * .28, hh * .12, -.3, 0, TAU); c.fill();
    }
    c.beginPath(); c.moveTo(x - 7 * k, y - hh * 2.05); c.quadraticCurveTo(x - 2 * k, y - hh * 2.9, x + 6 * k, y - hh * 2.75); c.quadraticCurveTo(x + 4 * k, y - hh * 2.3, x + 8 * k, y - hh * 2.05); c.closePath(); c.fillStyle = '#fffdf8'; c.fill(); c.stroke();
    c.restore();
    return hh * 2.6;
  };
  const shMini = (c, x, y, s, o) => {
    const sy = SH.SYRB[o.syrup], k = s * .34;
    shCup(c, x, y + 20 * s, o.size, { k, fill: 1, col: sy ? sy.col : '#f6ead0', mix: o.mix, blend: 1, seed: 3 });
    const top = y + 20 * s - SH.SIZEB[o.size].h * k;
    shCream(c, x, top + 2, SH.SIZEB[o.size].w * k, 1, k);
    if (o.tops && o.tops.length) shTopping(c, o.tops[0].t, x, top - 12 * k, k * 1.3);
  };
  const decorDraw = (c, id, t) => {
    c.save(); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
    if (id === 'plant') { c.translate(604, 408); c.fillStyle = '#c0663a'; c.beginPath(); c.moveTo(-18, -34); c.lineTo(18, -34); c.lineTo(13, 0); c.lineTo(-13, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#4caf50'; for (const [a, r] of [[-.9, 26], [-.3, 32], [.3, 30], [.9, 24], [0, 38]]) { c.save(); c.translate(0, -34); c.rotate(a + Math.sin(t * 1.5 + a) * .04); c.beginPath(); c.ellipse(0, -r * .55, 7, r * .55, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); } }
    else if (id === 'clock') { c.translate(606, 196); c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.fillStyle = '#fffaf0'; c.fill(); c.lineWidth = 5; c.stroke(); c.lineWidth = 3; const a = t * .5; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); c.moveTo(0, 0); c.lineTo(Math.cos(a / 12) * 10, Math.sin(a / 12) * 10); c.stroke(); c.fillStyle = '#2a2438'; c.beginPath(); c.arc(0, 0, 3, 0, TAU); c.fill(); }
    else if (id === 'lights') { c.strokeStyle = '#3a2a22'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 132); for (let x = 0; x <= 960; x += 80) c.quadraticCurveTo(x - 40, 158, x, 132); c.stroke(); const cols = ['#ffd23f', '#ff6b6b', '#4cc9f0', '#80ed99']; for (let i = 0; i < 24; i++) { const x = 20 + i * 40, y = 132 + Math.sin((x % 80) / 80 * Math.PI) * 12 + 6, on = (Math.sin(t * 3 + i) > -.6); c.fillStyle = on ? cols[i % 4] : shade(cols[i % 4], -.4); c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); if (on) { c.fillStyle = alpha(cols[i % 4], .25); c.beginPath(); c.arc(x, y, 11, 0, TAU); c.fill(); } } }
    else if (id === 'jukebox') { c.translate(36, 408); rrp(c, -30, -118, 60, 118, 26); c.fillStyle = '#c0392b'; c.fill(); c.stroke(); rrp(c, -22, -100, 44, 40, 18); c.fillStyle = '#ffd23f'; c.fill(); c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = ['#4cc9f0', '#80ed99', '#ff6b6b'][i]; c.fillRect(-18 + i * 13, -52, 10, 30 + Math.sin(t * 6 + i * 2) * 4); } note(c, 22, -128 + Math.sin(t * 3) * 4, '#2a2438'); }
    else if (id === 'tank') { c.translate(165, 262); rrp(c, -56, -40, 112, 70, 8); c.fillStyle = '#7fd4ff'; c.fill(); c.lineWidth = 4; c.stroke(); c.fillStyle = '#e8c27a'; c.fillRect(-52, 18, 104, 8); for (let i = 0; i < 2; i++) { const fx = Math.sin(t * .7 + i * 2) * 36, fy = -12 + i * 16, d = Math.cos(t * .7 + i * 2) > 0 ? 1 : -1; c.fillStyle = i ? '#ffd23f' : '#ff7b1c'; c.lineWidth = 2; c.beginPath(); c.ellipse(fx, fy, 9, 5, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(fx - d * 8, fy); c.lineTo(fx - d * 15, fy - 5); c.lineTo(fx - d * 15, fy + 5); c.closePath(); c.fill(); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(30, -10 - (t * 20) % 40, 3, 0, TAU); c.fill(); }
    else if (id === 'arcade') { c.translate(104, 408); c.fillStyle = '#5a3fd0'; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, -120); c.lineTo(30, -120); c.lineTo(30, 0); c.closePath(); c.fill(); c.stroke(); rrp(c, -22, -106, 44, 36, 4); c.fillStyle = '#14141a'; c.fill(); c.stroke(); c.fillStyle = ['#80ed99', '#ffd23f', '#ff6b6b'][Math.floor(t * 2) % 3]; c.fillRect(-14 + (t * 30) % 22, -94, 6, 6); c.fillStyle = '#ffd23f'; c.fillRect(-26, -64, 52, 12); c.fillStyle = '#e63946'; c.beginPath(); c.arc(-8, -58, 4, 0, TAU); c.fill(); c.fillStyle = '#4cc9f0'; c.beginPath(); c.arc(8, -58, 4, 0, TAU); c.fill(); }
    c.restore();
  };
  const QUADS = [[0, 1], [2, 3], [0, 2], [1, 3]];

  const pzTop = (c, id, x, y, rot, s = 1, sd = 0) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 1.8;
    const o = '#2a1b14';
    if (id === 'pep') { c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.fillStyle = '#c4301f'; c.fill(); c.strokeStyle = '#6e1409'; c.stroke(); c.fillStyle = '#e25a3a'; c.beginPath(); c.arc(-2.5, -2.5, 6, 0, TAU); c.fill(); c.fillStyle = '#8f2112'; for (const [a, b] of [[4, 3], [-4, 4], [3, -5], [-6, -1]]) { c.beginPath(); c.arc(a, b, 1.6, 0, TAU); c.fill(); } }
    else if (id === 'mush') { c.beginPath(); c.moveTo(-9, -2); c.quadraticCurveTo(-10, -11, 0, -11); c.quadraticCurveTo(10, -11, 9, -2); c.lineTo(3, -2); c.lineTo(3, 9); c.quadraticCurveTo(0, 11, -3, 9); c.lineTo(-3, -2); c.closePath(); c.fillStyle = '#e6d5b8'; c.fill(); c.strokeStyle = '#7a6244'; c.stroke(); c.fillStyle = '#f7ecd6'; c.beginPath(); c.arc(-3, -7, 3, 0, TAU); c.fill(); }
    else if (id === 'onion') { c.strokeStyle = '#8e5fa8'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 9, 0, 4.9); c.stroke(); c.strokeStyle = '#f2e8f6'; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 6, .4, 5.3); c.stroke(); c.strokeStyle = '#cfa8dc'; c.beginPath(); c.arc(0, 0, 3, 1, 5.8); c.stroke(); }
    else if (id === 'pepper') { c.strokeStyle = '#2f7d32'; c.lineWidth = 3.4; c.beginPath(); c.arc(0, 0, 8, .3, 5); c.stroke(); c.strokeStyle = '#7ccf63'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 8, .5, 4.8); c.stroke(); }
    else if (id === 'saus') { c.beginPath(); c.moveTo(-9, -3); c.quadraticCurveTo(-4, -10, 4, -8); c.quadraticCurveTo(11, -3, 8, 5); c.quadraticCurveTo(0, 11, -8, 6); c.closePath(); c.fillStyle = '#8a4b2a'; c.fill(); c.strokeStyle = '#4a230f'; c.stroke(); c.fillStyle = '#b9703f'; c.beginPath(); c.arc(-2, -2, 2.4, 0, TAU); c.arc(4, 2, 1.8, 0, TAU); c.arc(-4, 4, 1.4, 0, TAU); c.fill(); }
    else if (id === 'olive') { c.beginPath(); c.arc(0, 0, 7.5, 0, TAU); c.fillStyle = '#2a2a33'; c.fill(); c.strokeStyle = '#000'; c.stroke(); c.beginPath(); c.arc(0, 0, 2.6, 0, TAU); c.fillStyle = '#d8b88a'; c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-4, -4, 1.6, 0, TAU); c.fill(); }
    else if (id === 'bacon') { c.beginPath(); c.moveTo(-14, -3); c.quadraticCurveTo(-7, -7, 0, -3); c.quadraticCurveTo(7, 1, 14, -3); c.lineTo(14, 3); c.quadraticCurveTo(7, 7, 0, 3); c.quadraticCurveTo(-7, -1, -14, 3); c.closePath(); c.fillStyle = '#d65a4a'; c.fill(); c.strokeStyle = '#6a1e14'; c.stroke(); c.strokeStyle = '#f6d6c4'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-4, -3, 1, 0); c.quadraticCurveTo(6, 3, 11, 0); c.stroke(); }
    else if (id === 'pine') { c.beginPath(); c.moveTo(-8, -7); c.lineTo(8, -5); c.lineTo(6, 7); c.lineTo(-7, 6); c.closePath(); c.fillStyle = '#ffd93b'; c.fill(); c.strokeStyle = '#a07a00'; c.stroke(); c.strokeStyle = '#ffee99'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4, -4); c.lineTo(4, -2); c.moveTo(-3, 1); c.lineTo(3, 3); c.stroke(); }
    else if (id === 'ham') { c.beginPath(); c.moveTo(-9, -8); c.lineTo(9, -7); c.lineTo(8, 8); c.lineTo(-8, 7); c.closePath(); c.fillStyle = '#f08a9a'; c.fill(); c.strokeStyle = '#8a3040'; c.stroke(); c.fillStyle = '#f9b6c0'; c.beginPath(); c.arc(-3, -3, 3.5, 0, TAU); c.fill(); }
    else if (id === 'jala') { c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fillStyle = '#4caf3c'; c.fill(); c.strokeStyle = '#1f5f1a'; c.stroke(); c.beginPath(); c.arc(0, 0, 4.6, 0, TAU); c.fillStyle = '#d7f2a0'; c.fill(); c.fillStyle = '#f4f1c8'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(Math.cos(i * 1.26) * 2.3, Math.sin(i * 1.26) * 2.3, .9, 0, TAU); c.fill(); } }
    else if (id === 'anch') { c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(-6, -6, 3, -3); c.lineTo(13, -6); c.lineTo(11, 0); c.lineTo(13, 6); c.lineTo(3, 3); c.quadraticCurveTo(-6, 6, -13, 0); c.closePath(); c.fillStyle = '#7e8b97'; c.fill(); c.strokeStyle = '#3a444e'; c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-8, -1, 1.4, 0, TAU); c.fill(); }
    else if (id === 'tom') { c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.fillStyle = '#e8412c'; c.fill(); c.strokeStyle = '#7a1a0c'; c.stroke(); c.fillStyle = '#ff9a7a'; for (let i = 0; i < 5; i++) { const a = i * 1.257; c.beginPath(); c.ellipse(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 2.2, 1.3, a, 0, TAU); c.fill(); } }
    void o; void sd;
    c.restore();
  };

  const pzRender = (pz, R, withTops = true) => {
    const D = Math.ceil(R * 2 + 24), cv = pz.cv && pz.cv.width === D ? pz.cv : (pz.cv = document.createElement('canvas'));
    cv.width = D; cv.height = D;
    const c = cv.getContext('2d'), cx = D / 2, cy = D / 2;
    c.save(); c.translate(cx, cy);
    c.beginPath(); c.arc(0, 4, R + 3, 0, TAU); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
    c.beginPath(); c.arc(0, 0, R, 0, TAU); const g = c.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R); g.addColorStop(0, '#f1c987'); g.addColorStop(1, '#d99b4a'); c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#8a5a22'; c.stroke();
    c.beginPath(); c.arc(0, 0, R * .88, 0, TAU); c.fillStyle = '#f4dba5'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(138,90,34,.5)'; c.stroke();
    c.save(); c.beginPath(); c.arc(0, 0, R * .88, 0, TAU); c.clip();
    if (pz.sauceCv) c.drawImage(pz.sauceCv, -R, -R, R * 2, R * 2);
    if (pz.cheeseCv) c.drawImage(pz.cheeseCv, -R, -R, R * 2, R * 2);
    if (withTops) for (const p of pz.pieces) pzTop(c, p.t, p.x * R / pz.R0, p.y * R / pz.R0, p.a, p.s * R / pz.R0);
    c.restore();
    c.restore();
    return cv;
  };

  const tintFor = r => {
    const st = [[0, [255, 240, 200, 0]], [.55, [255, 215, 120, .1]], [1, [235, 150, 45, .3]], [1.25, [140, 70, 22, .55]], [1.6, [28, 18, 14, .85]]];
    let i = 0; while (i < st.length - 2 && r > st[i + 1][0]) i++;
    const u = clamp((r - st[i][0]) / (st[i + 1][0] - st[i][0]), 0, 1), a = st[i][1], b = st[i + 1][1];
    return `rgba(${Math.round(lerp(a[0], b[0], u))},${Math.round(lerp(a[1], b[1], u))},${Math.round(lerp(a[2], b[2], u))},${lerp(a[3], b[3], u).toFixed(3)})`;
  };
  const tmpCv = document.createElement('canvas');
  const pzDraw = (c, pz, x, y, R, cook = 0) => {
    const cv = pz.cv; if (!cv) return;
    const D = cv.width, S2 = R * 2 + 24 * R / pz.R0;
    if (cook <= 0.02) { c.drawImage(cv, x - S2 / 2, y - S2 / 2, S2, S2); return; }
    if (tmpCv.width !== D) { tmpCv.width = D; tmpCv.height = D; }
    const t = tmpCv.getContext('2d'); t.clearRect(0, 0, D, D); t.globalCompositeOperation = 'source-over'; t.drawImage(cv, 0, 0);
    t.globalCompositeOperation = 'source-atop'; t.fillStyle = tintFor(cook); t.fillRect(0, 0, D, D);
    if (cook > .85) { t.fillStyle = `rgba(255,214,120,${clamp((cook - .85) * .6, 0, .35)})`; t.beginPath(); t.arc(D / 2, D / 2, R * D / S2 * .96, 0, TAU); t.arc(D / 2, D / 2, R * D / S2 * .86, 0, TAU, true); t.fill(); }
    t.globalCompositeOperation = 'source-over';
    c.drawImage(tmpCv, x - S2 / 2, y - S2 / 2, S2, S2);
  };

  const pzMini = (c, x, y, R, tk, a = 1) => {
    c.save(); c.globalAlpha = a;
    c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = '#e3b36b'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#7a4a1a'; c.stroke();
    c.beginPath(); c.arc(x, y, R * .84, 0, TAU); c.fillStyle = PZ.SB[tk.sauce].col; c.fill();
    c.beginPath(); c.arc(x, y, R * .8, 0, TAU); c.fillStyle = 'rgba(255,232,150,.55)'; c.fill();
    c.strokeStyle = 'rgba(60,30,10,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - R, y); c.lineTo(x + R, y); c.moveTo(x, y - R); c.lineTo(x, y + R); c.stroke();
    for (const t of tk.tops) for (const q of t.q) { const qx = x + (q % 2 ? 1 : -1) * R * .42, qy = y + (q >> 1 ? 1 : -1) * R * .42; pzTop(c, t.t, qx + (t.i - (tk.tops.length - 1) / 2) * R * .22, qy + (t.i % 2 ? 1 : -1) * R * .12, t.i, R / 34); }
    c.restore();
  };

  const pzHair = (c, L, x, y, r, front) => {
    c.fillStyle = L.hair; c.strokeStyle = shade(L.hair, -.55); c.lineWidth = 2.4; c.lineJoin = 'round';
    const hs = L.hs;
    if (!front) {
      if (hs === 'long') { rrp(c, x - r * 1.12, y - r * .6, r * 2.24, r * 2.5, r * .9); c.fill(); c.stroke(); }
      if (hs === 'bun') { c.beginPath(); c.arc(x, y - r * 1.15, r * .45, 0, TAU); c.fill(); c.stroke(); }
      if (hs === 'pony') { c.beginPath(); c.ellipse(x + r * 1.2, y + r * .5, r * .32, r * .85, -.3, 0, TAU); c.fill(); c.stroke(); }
      if (hs === 'curly') { for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; c.beginPath(); c.arc(x + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * .92, r * .36, 0, TAU); c.fill(); c.stroke(); } }
      return;
    }
    if (hs === 'bald') { c.fillStyle = alpha(L.hair, .6); c.beginPath(); c.ellipse(x - r * .95, y + r * .1, r * .17, r * .26, 0, 0, TAU); c.ellipse(x + r * .95, y + r * .1, r * .17, r * .26, 0, 0, TAU); c.fill(); return; }
    c.beginPath(); c.moveTo(x - r * 1.04, y + r * .1);
    if (hs === 'spiky') { c.lineTo(x - r * 1.1, y - r * .5); c.lineTo(x - r * .8, y - r * 1.05); c.lineTo(x - r * .45, y - r * .8); c.lineTo(x - r * .1, y - r * 1.3); c.lineTo(x + r * .25, y - r * .85); c.lineTo(x + r * .65, y - r * 1.15); c.lineTo(x + r * .85, y - r * .55); c.lineTo(x + r * 1.06, y - r * .5); }
    else if (hs === 'mohawk') { c.lineTo(x - r * .95, y - r * .3); c.quadraticCurveTo(x - r * .3, y - r * .6, x - r * .2, y - r * 1.5); c.lineTo(x + r * .2, y - r * 1.5); c.quadraticCurveTo(x + r * .3, y - r * .6, x + r * .95, y - r * .3); }
    else { c.quadraticCurveTo(x - r * 1.2, y - r * 1.3, x, y - r * 1.2); c.quadraticCurveTo(x + r * 1.2, y - r * 1.3, x + r * 1.04, y + r * .1); }
    c.lineTo(x + r * 1.04, y - r * .05);
    c.quadraticCurveTo(x + r * .5, y - r * .5, x, y - r * .55); c.quadraticCurveTo(x - r * .5, y - r * .5, x - r * 1.04, y - r * .05); c.closePath();
    if (hs === 'bob' || hs === 'long') { c.moveTo(x - r * 1.04, y); }
    c.fill(); c.stroke();
    if (hs === 'bob') { c.beginPath(); c.moveTo(x - r * 1.1, y - r * .1); c.lineTo(x - r * 1.1, y + r * .85); c.quadraticCurveTo(x - r * .9, y + r * 1.05, x - r * .7, y + r * .7); c.lineTo(x - r * .75, y - r * .2); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x + r * 1.1, y - r * .1); c.lineTo(x + r * 1.1, y + r * .85); c.quadraticCurveTo(x + r * .9, y + r * 1.05, x + r * .7, y + r * .7); c.lineTo(x + r * .75, y - r * .2); c.closePath(); c.fill(); c.stroke(); }
  };
  const pzFace = (c, L, x, y, s, mood, t, talk, look = 0) => {
    const r = 25 * s, o = '#2a2438';
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    pzHair(c, L, x, y, r, false);
    c.fillStyle = L.skin; c.strokeStyle = o; c.lineWidth = 2.6;
    c.beginPath(); c.arc(x - r * 1.0, y + r * .1, r * .22, 0, TAU); c.arc(x + r * 1.0, y + r * .1, r * .22, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(x, y, r * 1.02, r * 1.06, 0, 0, TAU); c.fill(); c.stroke();
    pzHair(c, L, x, y, r, true);
    const blink = (t % 4.3) < .13;
    const ey = y + r * .08, ex = r * .42;
    for (const sx of [-1, 1]) {
      if (blink) { c.strokeStyle = o; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + sx * ex - r * .17, ey); c.lineTo(x + sx * ex + r * .17, ey); c.stroke(); }
      else { c.fillStyle = '#fff'; c.strokeStyle = o; c.lineWidth = 2; c.beginPath(); c.ellipse(x + sx * ex, ey, r * .2, r * .24, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#1a1226'; c.beginPath(); c.arc(x + sx * ex + look * r * .08, ey + r * .02, r * .11, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + sx * ex + look * r * .08 - r * .03, ey - r * .03, r * .035, 0, TAU); c.fill(); }
      c.strokeStyle = shade(L.hair, -.2); c.lineWidth = 2.8;
      c.beginPath(); c.moveTo(x + sx * ex - sx * r * .22, ey - r * .36 + (mood >= 3 ? -r * .12 : 0)); c.lineTo(x + sx * ex + sx * r * .22, ey - r * .36 + (mood >= 3 ? r * .12 : mood === 2 ? r * .05 : 0) - (mood === 0 ? r * .04 : 0)); c.stroke();
    }
    if (mood <= 1) { c.fillStyle = 'rgba(255,120,140,.35)'; c.beginPath(); c.ellipse(x - r * .66, y + r * .42, r * .2, r * .12, 0, 0, TAU); c.ellipse(x + r * .66, y + r * .42, r * .2, r * .12, 0, 0, TAU); c.fill(); }
    c.fillStyle = shade(L.skin, -.12); c.beginPath(); c.arc(x, y + r * .25, r * .06, 0, TAU); c.fill();
    const my = y + r * .6;
    c.strokeStyle = o; c.lineWidth = 2.6;
    if (talk) { const op = (Math.sin(t * 16) * .5 + .5); c.fillStyle = '#7a1f2b'; c.beginPath(); c.ellipse(x, my, r * .24, r * (.06 + op * .16), 0, 0, TAU); c.fill(); c.stroke(); }
    else if (mood === 0) { c.fillStyle = '#7a1f2b'; c.beginPath(); c.moveTo(x - r * .34, my - r * .02); c.quadraticCurveTo(x, my + r * .5, x + r * .34, my - r * .02); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(x - r * .22, my, r * .44, r * .08); }
    else if (mood === 1) { c.beginPath(); c.moveTo(x - r * .3, my); c.quadraticCurveTo(x, my + r * .3, x + r * .3, my); c.stroke(); }
    else if (mood === 2) { c.beginPath(); c.moveTo(x - r * .25, my + r * .06); c.lineTo(x + r * .25, my + r * .06); c.stroke(); }
    else { c.beginPath(); c.moveTo(x - r * .3, my + r * .16); c.quadraticCurveTo(x, my - r * .16, x + r * .3, my + r * .16); c.stroke(); }
    const a = L.acc || {};
    if (a.beard) { c.fillStyle = a.beard; c.beginPath(); c.moveTo(x - r * .98, y + r * .25); c.quadraticCurveTo(x - r * .9, y + r * 1.25, x, y + r * 1.22); c.quadraticCurveTo(x + r * .9, y + r * 1.25, x + r * .98, y + r * .25); c.quadraticCurveTo(x + r * .5, y + r * .6, x, y + r * .5); c.quadraticCurveTo(x - r * .5, y + r * .6, x - r * .98, y + r * .25); c.fill(); c.strokeStyle = shade(a.beard, -.5); c.lineWidth = 2; c.stroke(); if (!talk) { c.strokeStyle = o; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - r * .24, my + r * .1); c.quadraticCurveTo(x, my + r * (mood === 0 ? .42 : .22), x + r * .24, my + r * .1); c.stroke(); } }
    if (a.mustache) { c.fillStyle = a.mustache; c.strokeStyle = shade(a.mustache, -.5); c.lineWidth = 1.8; c.beginPath(); c.moveTo(x, y + r * .42); c.quadraticCurveTo(x - r * .45, y + r * .3, x - r * .62, y + r * .55); c.quadraticCurveTo(x - r * .3, y + r * .62, x, y + r * .5); c.quadraticCurveTo(x + r * .3, y + r * .62, x + r * .62, y + r * .55); c.quadraticCurveTo(x + r * .45, y + r * .3, x, y + r * .42); c.fill(); c.stroke(); }
    if (a.glasses) { c.strokeStyle = '#2a2438'; c.lineWidth = 2.6; c.fillStyle = 'rgba(190,230,255,.25)'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(x + sx * ex, ey, r * .33, 0, TAU); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(x - ex + r * .33, ey); c.lineTo(x + ex - r * .33, ey); c.stroke(); }
    if (a.hat) {
      const [ty, col] = a.hat; c.fillStyle = col; c.strokeStyle = shade(col, -.55); c.lineWidth = 2.6;
      if (ty === 'cap') { c.beginPath(); c.moveTo(x - r * 1.05, y - r * .2); c.quadraticCurveTo(x - r, y - r * 1.4, x, y - r * 1.38); c.quadraticCurveTo(x + r, y - r * 1.4, x + r * 1.05, y - r * .2); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x - r * 1.05, y - r * .2); c.lineTo(x + r * 1.5, y - r * .15); c.quadraticCurveTo(x + r * 1.5, y - r * .45, x + r * 1.0, y - r * .5); c.lineTo(x - r * 1.0, y - r * .5); c.closePath(); c.fill(); c.stroke(); }
      else if (ty === 'beanie') { c.beginPath(); c.moveTo(x - r * 1.05, y - r * .25); c.quadraticCurveTo(x - r * 1.1, y - r * 1.5, x, y - r * 1.5); c.quadraticCurveTo(x + r * 1.1, y - r * 1.5, x + r * 1.05, y - r * .25); c.closePath(); c.fill(); c.stroke(); c.fillStyle = shade(col, -.2); rrp(c, x - r * 1.1, y - r * .62, r * 2.2, r * .42, r * .15); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - r * 1.55, r * .22, 0, TAU); c.fill(); c.stroke(); }
      else if (ty === 'chef') { c.fillStyle = '#fff'; c.beginPath(); c.arc(x - r * .55, y - r * 1.25, r * .5, 0, TAU); c.arc(x, y - r * 1.5, r * .6, 0, TAU); c.arc(x + r * .55, y - r * 1.25, r * .5, 0, TAU); c.rect(x - r * .9, y - r * 1.25, r * 1.8, r * .85); c.fill(); c.stroke(); c.fillRect(x - r * .9, y - r * 1.2, r * 1.8, r * .76); c.strokeRect(x - r * .9, y - r * 1.2, r * 1.8, r * .76); }
    }
    c.restore();
  };
  const pzBody = (c, L, x, y, s, wave = 0) => {
    c.save(); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
    c.fillStyle = L.skin; c.fillRect(x - 8 * s, y - 56 * s, 16 * s, 16 * s); c.strokeRect(x - 8 * s, y - 56 * s, 16 * s, 16 * s);
    c.beginPath(); c.moveTo(x - 46 * s, y + 4); c.quadraticCurveTo(x - 46 * s, y - 40 * s, x - 14 * s, y - 46 * s); c.lineTo(x + 14 * s, y - 46 * s); c.quadraticCurveTo(x + 46 * s, y - 40 * s, x + 46 * s, y + 4); c.closePath();
    const g = c.createLinearGradient(0, y - 46 * s, 0, y); g.addColorStop(0, shade(L.shirt, .12)); g.addColorStop(1, shade(L.shirt, -.15)); c.fillStyle = g; c.fill(); c.stroke();
    c.fillStyle = L.skin; c.beginPath(); c.moveTo(x - 12 * s, y - 46 * s); c.lineTo(x, y - 34 * s); c.lineTo(x + 12 * s, y - 46 * s); c.closePath(); c.fill(); c.stroke();
    c.restore();
  };
  const pzCust = (c, L, x, y, s, mood, t, talk, look) => { pzBody(c, L, x, y, s); pzFace(c, L, x, y - 82 * s, s, mood, t, talk, look); };

  const pzClip = (poly, a, b, c0, keep) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dp = (a * p[0] + b * p[1] + c0) * keep, dq = (a * q[0] + b * q[1] + c0) * keep;
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  };
  const pzSlices = (lines, R) => {
    const n = lines.length, res = [];
    for (let m = 0; m < 1 << n; m++) {
      let poly = [[-R * 2, -R * 2], [R * 2, -R * 2], [R * 2, R * 2], [-R * 2, R * 2]];
      for (let i = 0; i < n && poly.length; i++) {
        const l = lines[i], dx = l.x1 - l.x0, dy = l.y1 - l.y0, a = dy, b = -dx, c0 = -(a * l.x0 + b * l.y0);
        poly = pzClip(poly, a, b, c0, m >> i & 1 ? 1 : -1);
      }
      if (poly.length >= 3) { let cx = 0, cy = 0; poly.forEach(p => { cx += p[0]; cy += p[1]; }); res.push({ poly, cx: cx / poly.length, cy: cy / poly.length }); }
    }
    return res;
  };
  const pzCutScore = (lines, k, R) => {
    if (!lines.length) return 0;
    let off = 0; const angs = [];
    for (const l of lines) {
      const dx = l.x1 - l.x0, dy = l.y1 - l.y0, len = Math.hypot(dx, dy);
      off += Math.abs(l.x0 * dy - l.y0 * dx) / len;
      let a = Math.atan2(dy, dx); a = ((a % Math.PI) + Math.PI) % Math.PI; angs.push(a);
    }
    off /= lines.length;
    angs.sort((p, q) => p - q);
    const ideal = Math.PI / k; let best = 1e9;
    for (let i = 0; i < angs.length; i++) {
      let dev = 0;
      for (let j = 0; j < angs.length; j++) { let d = angs[j] - angs[i]; d = ((d % Math.PI) + Math.PI) % Math.PI; const e = j + 0 === i ? 0 : Math.abs(d - Math.round(d / ideal) * ideal); dev += e; }
      best = Math.min(best, dev / Math.max(1, angs.length - 1));
    }
    if (angs.length === 1) best = 0;
    const gapN = clamp(best / (ideal * .5), 0, 1), offN = clamp(off / (R * .22), 0, 1);
    return clamp(1 - .45 * offN - .55 * gapN, 0, 1);
  };

  const tkHead = (S, c, tk, x, y, w, bubble) => {
    c.fillStyle = '#e63946'; c.beginPath(); c.arc(x + w / 2, y + 8, 6, 0, TAU); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2; c.stroke();
    if (bubble) S.text(tr('{name} orders:', { name: tk.cu.L.n }), x + 12, y + 30, S.fit(tr('{name} orders:', { name: tk.cu.L.n }), w - 24, 17), '#2a2438', 'left');
    else { S.text(tr('ORDER #{n}', { n: tk.id }), x + 12, y + 30, 18, '#2a2438', 'left'); S.text(tk.cu.L.n, x + w - 12, y + 30, S.fit(tk.cu.L.n, w - 130, 16), '#c0392b', 'right'); }
    c.strokeStyle = '#d4c7a4'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x + 10, y + 44); c.lineTo(x + w - 10, y + 44); c.stroke(); c.setLineDash([]);
  };
  const tick2 = (c, x, y, ok) => { rrp(c, x, y, 18, 18, 4); c.fillStyle = ok ? '#7bd88f' : '#eee8d8'; c.fill(); c.lineWidth = 2; c.strokeStyle = ok ? '#1f6f3a' : '#c4b898'; c.stroke(); if (ok) { c.strokeStyle = '#1f6f3a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 4, y + 9); c.lineTo(x + 8, y + 13); c.lineTo(x + 14, y + 5); c.stroke(); } };

  const pizzaKit = X => {
    const { S, c, au, up, toast } = X;
    const PX = 450, PY = 352, PR = 150;
    let D = null;
    const bakeName = s => fmtTime(s);
    const unlockedTops = day => PZ.TOPS.filter(t => t.day <= day);
    const unlockedSauces = day => PZ.SAUCES.filter(t => t.day <= day);
    const mkCv = () => { const cv = document.createElement('canvas'); cv.width = PR * 2; cv.height = PR * 2; return cv; };
    const newPz = () => ({ R0: PR, pieces: [], sauceCv: mkCv(), cheeseCv: null, sauce: null, sauceCells: new Set(), cheeseCells: new Set(), cv: null });
    const gen = (day, critic) => {
      const tops = unlockedTops(day), sauces = unlockedSauces(day);
      let n = critic ? Math.min(tops.length, day < 6 ? 3 : 4) : day < 2 ? 1 : day < 4 ? rint(1, 2) : day < 7 ? rint(2, 3) : rint(2, 4);
      n = Math.min(n, tops.length);
      const chosen = shuffle(tops.slice()).slice(0, n), load = [0, 0, 0, 0], out = [];
      chosen.forEach((t, i) => {
        let q = null;
        for (let tries = 0; tries < 8 && !q; tries++) {
          const r = Math.random(), mode = day < 3 ? (r < .35 ? 'all' : 'half') : day < 6 ? (r < .25 ? 'all' : r < .85 ? 'half' : 'one') : (r < .15 ? 'all' : r < .65 ? 'half' : 'one');
          const cand = mode === 'all' ? [0, 1, 2, 3] : mode === 'half' ? pick(QUADS).slice() : [rint(0, 3)];
          if (cand.every(x => load[x] < 3)) q = cand;
        }
        if (!q) q = [rint(0, 3)];
        q.forEach(x => load[x]++); out.push({ t: t.id, q, i });
      });
      const sauce = sauces.length > 1 && Math.random() < .4 ? pick(sauces).id : 'mar';
      const bake = critic ? rint(9, 14) * 3 : day < 3 ? rint(7, 9) * 3 : rint(6, 13) * 3;
      const cuts = critic ? pick([6, 8]) : day < 3 ? 4 : day < 6 ? pick([4, 6]) : pick([4, 6, 8]);
      let price = 6 + PZ.SB[sauce].price + out.reduce((a, t) => a + PZ.TB[t.t].price * t.q.length / 2, 0);
      price *= 1 + .15 * up('dough');
      return { sauce, tops: out, bake, cuts, price: Math.round(price * 20) / 20 };
    };
    const ticket = (tk, x, y, w, live, bubble) => {
      const S2 = S, h = 120 + tk.tops.length * 26 + (tk.tops.length ? 30 : 0);
      S2.panel(x, y, w, h, { fill: '#fffdf2', line: '#7a5a2a', r: 8, lw: 3, sh: 4 });
      tkHead(S, c, tk, x, y, w, bubble);
      pzMini(c, x + 52, y + 92, 38, tk);
      S.text(tr('Sauce: {s}', { s: tr(PZ.SB[tk.sauce].n) }), x + 102, y + 66, S.fit(tr('Sauce: {s}', { s: tr(PZ.SB[tk.sauce].n) }), w - 110, 13), '#2a2438', 'left', null, 800);
      S.text(tr('Bake: {t}', { t: bakeName(tk.bake) }), x + 102, y + 88, 14, '#c0392b', 'left'); S.text(tr('Cut into {n}', { n: tk.cuts }), x + 102, y + 110, 14, '#2f6db5', 'left');
      const cnt = {}; if (live && live.pieces) for (const p of live.pieces) { const k = p.t + p.q; cnt[k] = (cnt[k] || 0) + 1; }
      if (tk.tops.length) S.text('TL   TR   BL   BR', x + w - 52, y + 142, 9, '#8a7a5a', 'center', null, 800);
      tk.tops.forEach((t, i) => {
        const yy = y + 162 + i * 26; pzTop(c, t.t, x + 24, yy, 0, .9);
        S.text(PZ.TB[t.t].n, x + 44, yy, S.fit(tr(PZ.TB[t.t].n), w - 150, 13), '#2a2438', 'left', null, 800);
        for (let q = 0; q < 4; q++) {
          const need = t.q.includes(q), got = cnt[t.t + q] || 0, ok = need && got >= PZ.TB[t.t].per * .7, bad = !need && got > 0, qx = x + w - 94 + q * 21;
          rrp(c, qx, yy - 9, 18, 18, 4); c.fillStyle = need ? (ok ? '#7bd88f' : '#ffd0a0') : bad ? '#ff8a8a' : '#eee8d8'; c.fill(); c.lineWidth = 2; c.strokeStyle = need ? '#8a5a22' : '#c4b898'; c.stroke();
          if (ok) { c.strokeStyle = '#1f6f3a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(qx + 4, yy); c.lineTo(qx + 8, yy + 4); c.lineTo(qx + 14, yy - 4); c.stroke(); }
        }
      });
      return h;
    };
    const ensureBuild = () => {
      const k = D.k; if (k.bld) return;
      const tk = X.next('new'); if (!tk) return;
      const pz = newPz(); k.bld = { tk, pz, phase: 0, tool: null, held: null, last: null, cheeseCv: mkCv() }; tk.pz = pz; tk.state = 'building';
    };
    const focus = tk => {
      const k = D.k;
      if (tk.state !== 'new') return;
      if (k.bld && (k.bld.pz.pieces.length || k.bld.pz.sauceCells.size)) return;
      if (k.bld) k.bld.tk.state = 'new';
      const pz = newPz(); k.bld = { tk, pz, phase: 0, tool: null, held: null, last: null, cheeseCv: mkCv() }; tk.pz = pz; tk.state = 'building';
    };
    const CELL = 10, inner = PR * .86;
    const cellsTotal = (() => { let n = 0; for (let x = -PR; x < PR; x += CELL) for (let y = -PR; y < PR; y += CELL) if (Math.hypot(x + CELL / 2, y + CELL / 2) < inner) n++; return n; })();
    const markCells = (set, lx, ly, r) => {
      for (let x = Math.floor((lx - r) / CELL) * CELL; x <= lx + r; x += CELL) for (let y = Math.floor((ly - r) / CELL) * CELL; y <= ly + r; y += CELL) {
        const cx = x + CELL / 2, cy = y + CELL / 2;
        if (Math.hypot(cx - lx, cy - ly) < r && Math.hypot(cx, cy) < inner) set.add(x * 1000 + y);
      }
    };
    const stampSauce = (b, lx, ly) => {
      const pz = b.pz, col = PZ.SB[pz.sauce].col, r = 20 * (1 + .25 * up('ladle')), cx = lx + PR, cy = ly + PR, g = pz.sauceCv.getContext('2d');
      g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      g.fillStyle = shade(col, .18); g.globalAlpha = .55; g.beginPath(); g.arc(cx - r * .25, cy - r * .3, r * .5, 0, TAU); g.fill(); g.globalAlpha = 1;
      markCells(pz.sauceCells, lx, ly, r * .95);
    };
    const stampCheese = (b, lx, ly) => {
      const pz = b.pz, r = 22 * (1 + .25 * up('ladle')), g = b.cheeseCv.getContext('2d');
      for (let i = 0; i < 7; i++) {
        const a = rnd(0, TAU), d = Math.sqrt(Math.random()) * r, x = lx + Math.cos(a) * d + PR, y = ly + Math.sin(a) * d + PR;
        g.save(); g.translate(x, y); g.rotate(rnd(0, TAU)); g.fillStyle = Math.random() < .5 ? '#ffe27a' : '#fff0a8'; g.strokeStyle = 'rgba(190,140,30,.55)'; g.lineWidth = 1; rrp(g, -6, -1.8, 12, 3.6, 1.8); g.fill(); g.stroke(); g.restore();
      }
      markCells(pz.cheeseCells, lx, ly, r * .9);
      if (!pz.cheeseCv) pz.cheeseCv = b.cheeseCv;
    };
    const dropTop = (b, id, lx, ly) => {
      const T = PZ.TB[id], rr = 40 * (up('steady') ? (up('steady') === 1 ? .8 : .64) : 1), mine = [];
      for (let i = 0; i < T.per; i++) {
        let x, y, tries = 0;
        do { const a = rnd(0, TAU), d = Math.sqrt(Math.random()) * rr; x = lx + Math.cos(a) * d; y = ly + Math.sin(a) * d; tries++; } while ((Math.hypot(x, y) > inner - 8 || mine.some(m => Math.hypot(m[0] - x, m[1] - y) < 21)) && tries < 14);
        mine.push([x, y]);
        if (Math.hypot(x, y) > inner - 4) { const k = (inner - 8) / Math.hypot(x, y); x *= k; y *= k; }
        b.pz.pieces.push({ t: id, x, y, a: rnd(0, TAU), s: rnd(1.28, 1.42), q: (x >= 0 ? 1 : 0) + (y >= 0 ? 2 : 0), born: S.t });
      }
      au.noise(.08, .08, 700, 0, 'lowpass'); au.tone(220 + rnd(0, 40), .08, 'sine', .05, 120);
      S.spark(PX + lx, PY + ly, 4, ['#fff', '#ffe9b0'], 80, 200, .4);
    };
    const topAcc = (tk, pz) => {
      const cnt = {}; for (const p of pz.pieces) { const k = p.t + p.q; cnt[k] = (cnt[k] || 0) + 1; }
      let exp = 0, got = 0, matched = 0; const ex = {};
      for (const t of tk.tops) for (const q of t.q) { const e = PZ.TB[t.t].per; ex[t.t + q] = e; exp += e; }
      for (const k in cnt) got += cnt[k];
      for (const k in ex) matched += Math.min(ex[k], cnt[k] || 0);
      const tot = Math.max(exp, got);
      return tot ? matched / tot : 1;
    };
    const sendToOven = () => {
      const b = D.k.bld; if (!b) return;
      if (!b.pz.pieces.length && b.tk.tops.length) { toast('Add some toppings first'); return; }
      const pz = b.pz, tk = b.tk, cov = k => clamp(pz[k].size / (cellsTotal * .9), 0, 1);
      const sauceS = cov('sauceCells') * (pz.sauce === tk.sauce ? 1 : .3), cheeseS = cov('cheeseCells'), acc = topAcc(tk, pz);
      tk.sc.top = Math.round(100 * (.12 * sauceS + .18 * cheeseS + .70 * acc));
      pzRender(pz, PR, true); tk.state = 'tray'; D.k.bld = null;
      au.tone(392, .1, 'triangle', .07, 523); au.noise(.2, .06, 900, .05, 'lowpass', 300);
      ensureBuild();
    };
    const loadOven = (tk, slot) => { slot.tk = tk; slot.t = 0; slot.belled = false; slot.autoAt = 0; tk.state = 'oven'; au.noise(.3, .08, 600, 0, 'lowpass', 200); au.tone(180, .15, 'square', .03, 120); };
    const takeOut = slot => {
      const tk = slot.tk; if (!tk) return;
      tk.cookR = slot.t / tk.bake; const err = Math.abs(tk.cookR - 1);
      tk.sc.bake = Math.round(err <= .06 ? 100 : Math.max(0, 100 - (err - .06) * 165));
      tk.state = 'cut'; slot.tk = null; slot.t = 0; slot.autoAt = 0;
      au.noise(.25, .07, 1200, 0, 'bandpass', 500); au.tone(300, .12, 'triangle', .05, 200);
      S.pop(slot.sx || 480, 250, tk.sc.bake >= 95 ? 'PERFECT!' : tk.sc.bake >= 75 ? 'Nice bake' : tk.sc.bake >= 45 ? 'Meh...' : 'Ouch!', tk.sc.bake >= 95 ? '#ffe14d' : tk.sc.bake >= 75 ? '#fff' : '#ff9b9b', 26);
    };
    const ensureCut = () => {
      const k = D.k;
      if (k.cut && k.cut.tk.state === 'cutting') return;
      const tk = X.next('cut');
      if (!tk) { k.cut = null; return; }
      k.cut = { tk, lines: [], drag: null, bad: 0 }; tk.state = 'cutting';
    };
    const circleHit = (x0, y0, x1, y1) => {
      const dx = x1 - x0, dy = y1 - y0, a = dx * dx + dy * dy, b = 2 * (x0 * dx + y0 * dy), cc = x0 * x0 + y0 * y0 - PR * PR, disc = b * b - 4 * a * cc;
      if (disc <= 0) return null;
      const s = Math.sqrt(disc), t1 = (-b - s) / (2 * a), t2 = (-b + s) / (2 * a);
      return { x0: x0 + dx * t1, y0: y0 + dy * t1, x1: x0 + dx * t2, y1: y0 + dy * t2 };
    };
    const serve = () => {
      const k = D.k, ct = k.cut; if (!ct) return;
      const n = ct.tk.cuts / 2; if (ct.lines.length !== n) return;
      ct.tk.sc.cut = Math.round(100 * pzCutScore(ct.lines, n, PR));
      k.anim = { tk: ct.tk, slices: pzSlices(ct.lines, PR) };
      X.serve(ct.tk); k.cut = null;
    };
    const pzRender2 = (pz, b) => {
      const R = PR, D2 = R * 2 + 24, cv = pzRender2.cv || (pzRender2.cv = document.createElement('canvas'));
      if (cv.width !== D2) { cv.width = D2; cv.height = D2; }
      const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, D2, D2); g.translate(D2 / 2, D2 / 2);
      g.beginPath(); g.arc(0, 4, R + 3, 0, TAU); g.fillStyle = 'rgba(0,0,0,.22)'; g.fill();
      g.beginPath(); g.arc(0, 0, R, 0, TAU); const gr = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R); gr.addColorStop(0, '#f1c987'); gr.addColorStop(1, '#d99b4a'); g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = '#8a5a22'; g.stroke();
      g.beginPath(); g.arc(0, 0, R * .88, 0, TAU); g.fillStyle = '#f4dba5'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(138,90,34,.45)'; g.stroke();
      g.save(); g.beginPath(); g.arc(0, 0, R * .88, 0, TAU); g.clip();
      if (pz.sauceCells.size) g.drawImage(pz.sauceCv, -R, -R);
      if (b.cheeseCv && pz.cheeseCells.size) g.drawImage(b.cheeseCv, -R, -R);
      for (const p of pz.pieces) { const age = clamp((S.t - p.born) * 9, 0, 1); pzTop(g, p.t, p.x, p.y, p.a, p.s * (age < 1 ? 1 + (1 - age) * .5 : 1)); }
      g.restore();
      return cv;
    };
    const drawBuild = () => {
      X.bg('#d9a066', '#a8703c');
      c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 140; y < 600; y += 38) c.fillRect(0, y, 960, 2);
      ensureBuild(); const b = D.k.bld;
      X.sidePanel('');
      if (!b) { X.emptyMsg('No orders to build', 'Take an order at the Order station (1)'); if (S.btn(460, 400, 200, 46, 'Go to Order', { color: '#e8584a', size: 18 })) X.go('order'); return; }
      const pz = b.pz, tk = b.tk, phase = b.phase;
      S.text('SAUCE', 114, 150, 13, phase === 0 ? '#ffe14d' : '#cdb08a', 'center', null, 900);
      unlockedSauces(D.day).forEach((s, i) => {
        const x = 18 + i * 66, y = 160, on = phase === 0, sel = b.tool && b.tool.k === 'sauce' && b.tool.id === s.id;
        if (S.btn(x, y, 60, 60, '', { color: sel ? '#ffe14d' : on ? '#fff3dc' : '#b79c78', enabled: on && !pz.sauceCells.size, r: 12 })) { b.tool = { k: 'sauce', id: s.id }; pz.sauce = s.id; au.tone(440, .08, 'sine', .05); }
        c.save(); c.translate(x + 30, y + 26); c.lineJoin = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#2a2438'; c.fillStyle = s.col; rrp(c, -11, -10, 22, 28, 8); c.fill(); c.stroke(); c.fillStyle = '#e8e8e8'; rrp(c, -6, -20, 12, 12, 3); c.fill(); c.stroke(); c.restore();
        S.text(s.n, x + 30, y + 51, S.fit(tr(s.n), 56, 10), '#2a2438', 'center', null, 900);
      });
      S.text('CHEESE', 114, 240, 13, phase === 1 ? '#ffe14d' : '#cdb08a', 'center', null, 900);
      { const x = 18, y = 250, on = phase === 1, sel = b.tool && b.tool.k === 'cheese';
        if (S.btn(x, y, 60, 60, '', { color: sel ? '#ffe14d' : on ? '#fff3dc' : '#b79c78', enabled: on, r: 12 })) { b.tool = { k: 'cheese' }; au.tone(440, .08, 'sine', .05); }
        c.save(); c.translate(x + 30, y + 28); c.lineWidth = 2.4; c.strokeStyle = '#2a2438'; c.fillStyle = '#e8e8e8'; rrp(c, -12, -6, 24, 26, 6); c.fill(); c.stroke(); c.fillStyle = '#ffe27a'; rrp(c, -14, -16, 28, 12, 5); c.fill(); c.stroke(); c.restore(); S.text('Cheese', x + 30, y + 51, 10, '#2a2438', 'center', null, 900); }
      S.text('TOPPINGS', 114, 330, 13, phase === 2 ? '#ffe14d' : '#cdb08a', 'center', null, 900);
      unlockedTops(D.day).forEach((t, i) => {
        const x = 18 + (i % 3) * 66, y = 342 + Math.floor(i / 3) * 62, on = phase === 2, sel = b.tool && b.tool.k === 'top' && b.tool.id === t.id, hov = on && S.hover(x, y, 60, 56);
        rrp(c, x, y, 60, 56, 10); c.fillStyle = on ? (sel ? '#ffe14d' : hov ? '#fff8e0' : '#fff3dc') : '#b79c78'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        c.save(); if (!on) c.globalAlpha = .45; pzTop(c, t.id, x + 30, y + 22, 0, 1.4); c.restore();
        S.text(t.n.split(' ')[0], x + 30, y + 46, S.fit(tr(t.n.split(' ')[0]), 56, 10), '#2a2438', 'center', null, 900);
        if (hov) S.cursor = 'grab';
        if (on && S.pressIn(x, y, 60, 56)) { b.tool = { k: 'top', id: t.id }; b.held = { id: t.id, drag: true }; au.tone(520, .06, 'sine', .05); }
      });
      c.save(); c.beginPath(); c.arc(PX, PY + 6, PR + 22, 0, TAU); c.fillStyle = '#9aa3ad'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#4a525c'; c.stroke(); c.beginPath(); c.arc(PX, PY + 6, PR + 14, 0, TAU); c.fillStyle = '#b8c0c8'; c.fill(); c.restore();
      const tmp = pzRender2(pz, b);
      c.drawImage(tmp, PX - tmp.width / 2, PY - tmp.height / 2);
      if (b.held || phase === 2) {
        c.save(); c.setLineDash([8, 8]); c.strokeStyle = b.held ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)'; c.lineWidth = b.held ? 2.4 : 1.8; c.beginPath(); c.moveTo(PX - PR, PY); c.lineTo(PX + PR, PY); c.moveTo(PX, PY - PR); c.lineTo(PX, PY + PR); c.stroke(); c.restore();
        if (b.held) { S.text('TL', PX - PR * .5, PY - PR * .5, 14, 'rgba(255,255,255,.6)'); S.text('TR', PX + PR * .5, PY - PR * .5, 14, 'rgba(255,255,255,.6)'); S.text('BL', PX - PR * .5, PY + PR * .5, 14, 'rgba(255,255,255,.6)'); S.text('BR', PX + PR * .5, PY + PR * .5, 14, 'rgba(255,255,255,.6)'); }
      }
      const overPz = Math.hypot(S.mx - PX, S.my - PY) < PR * .9;
      if (b.tool && (b.tool.k === 'sauce' || b.tool.k === 'cheese') && S.down && overPz && !S.downBtn && !S.lock) {
        const lx = S.mx - PX, ly = S.my - PY;
        if (b.tool.k === 'sauce' && phase === 0 && pz.sauce) { if (!b.last || Math.hypot(lx - b.last[0], ly - b.last[1]) > 5) { stampSauce(b, lx, ly); b.last = [lx, ly]; if (Math.random() < .3) au.noise(.06, .03, 800, 0, 'lowpass'); } }
        else if (b.tool.k === 'cheese' && phase === 1) { if (!b.last || Math.hypot(lx - b.last[0], ly - b.last[1]) > 7) { stampCheese(b, lx, ly); b.last = [lx, ly]; if (Math.random() < .3) au.noise(.05, .025, 5000, 0, 'highpass'); } }
      } else b.last = null;
      if (b.held && b.held.drag && S.released) {
        if (overPz) { dropTop(b, b.held.id, S.mx - PX, S.my - PY); b.held = null; }
        else if (Math.hypot(S.downX - S.mx, S.downY - S.my) < 10) b.held.drag = false;
        else b.held = null;
      } else if (b.held && !b.held.drag && S.released && !S.downBtn) {
        if (overPz) dropTop(b, b.held.id, S.mx - PX, S.my - PY); else b.held = null;
      }
      if (b.held) {
        c.save(); c.globalAlpha = .9; pzTop(c, b.held.id, S.mx, S.my, S.t * .6, 1.8); c.restore();
        S.text('Click the pizza to drop more, click elsewhere to put it away', PX, 592, 12, '#fff3dc', 'center', '#3a1f0e', 800);
      }
      const covS = clamp(pz.sauceCells.size / (cellsTotal * .9), 0, 1), covC = clamp(pz.cheeseCells.size / (cellsTotal * .9), 0, 1);
      const stepName = ['1. Pick a sauce and paint it on', '2. Sprinkle the cheese', '3. Drag toppings onto the right quarters'][phase];
      S.panel(PX - 180, 134, 360, 30, { fill: 'rgba(42,36,56,.85)', r: 15, lw: 0, sh: 0 }); S.text(stepName, PX, 149, S.fit(tr(stepName), 340, 15), '#fff');
      if (phase === 0) {
        S.text(tr('Coverage {n}%', { n: Math.round(covS * 100) }), PX, PY + PR + 34, 15, '#fff3dc', 'center', '#3a1f0e');
        if (S.btn(PX - 80, 540, 160, 40, 'Next: Cheese', { color: '#3ecf6c', size: 16, enabled: covS >= .5 && !!pz.sauce })) { b.phase = 1; b.tool = null; au.tone(660, .1, 'triangle', .06); }
      } else if (phase === 1) {
        S.text(tr('Coverage {n}%', { n: Math.round(covC * 100) }), PX, PY + PR + 34, 15, '#fff3dc', 'center', '#3a1f0e');
        if (S.btn(PX - 80, 540, 160, 40, 'Next: Toppings', { color: '#3ecf6c', size: 16, enabled: covC >= .5 })) { b.phase = 2; b.tool = null; au.tone(660, .1, 'triangle', .06); }
      } else if (S.btn(PX - 80, 540, 160, 40, 'Send to oven', { color: '#e8584a', size: 17 })) sendToOven();
      if (S.btn(PX + PR + 24, 540, 76, 40, 'Redo', { color: '#8a7fa8', size: 14, enabled: b.pz.pieces.length > 0 || pz.sauceCells.size > 0 })) { tk.state = 'new'; D.k.bld = null; focus(tk); }
      ticket(tk, 712, 132, 240, pz);
      X.tipBox(phase === 0 ? 'Pick the sauce on the ticket, then hold the mouse on the pizza and paint it all over.' : phase === 1 ? 'Hold and move over the pizza to sprinkle the cheese.' : 'Drag a topping from the left onto each quarter ticked on the ticket. TL means top left.');
    };
    const drawBake = () => {
      X.bg('#6b3a2a', '#4a2619');
      c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 130; y < 600; y += 24) { c.fillRect(0, y, 960, 2); for (let x = (y / 24 % 2) * 40; x < 960; x += 80) c.fillRect(x, y, 2, 24); }
      X.sidePanel('READY TO BAKE');
      const k = D.k, tray = D.tickets.filter(t => t.state === 'tray').sort((a, b) => a.id - b.id), free = k.slots.find(s => !s.tk);
      tray.slice(0, 5).forEach((tk, i) => {
        const x = 18, y = 164 + i * 84;
        rrp(c, x, y, 194, 76, 10); c.fillStyle = '#fff3dc'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        pzDraw(c, tk.pz, x + 38, y + 38, 31, 0);
        S.text('#' + tk.id, x + 112, y + 20, 16, '#2a2438', 'left'); S.text(tk.cu.L.n, x + 112, y + 40, S.fit(tk.cu.L.n, 76, 12), '#6a5a7a', 'left', null, 800); S.text(tr('Bake {t}', { t: bakeName(tk.bake) }), x + 112, y + 60, 13, '#c0392b', 'left');
        const hov = S.hover(x, y, 194, 76);
        if (hov) { S.cursor = free ? 'pointer' : 'not-allowed'; rrp(c, x, y, 194, 76, 10); c.lineWidth = 4; c.strokeStyle = free ? '#3ecf6c' : '#e63946'; c.stroke(); }
        if (S.clickIn(x, y, 194, 76)) { if (free) loadOven(tk, free); else toast('All oven slots are busy'); }
      });
      if (!tray.length) { S.text('Nothing waiting', 114, 330, 15, '#ffe9c4', 'center', null, 800); S.text('Build a pizza first', 114, 352, 13, '#d9bf9a', 'center', null, 700); }
      if (tray.length > 5) S.text(tr('+{n} more', { n: tray.length - 5 }), 114, 590, 13, '#ffe9c4');
      const n = k.slots.length, ax = 236, aw = 960 - ax - 12, sw = (aw - (n - 1) * 12) / n;
      k.slots.forEach((s, i) => {
        const x = ax + i * (sw + 12), y = 134, h = 452; s.sx = x + sw / 2;
        rrp(c, x, y, sw, h, 16); c.fillStyle = '#2b2b33'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#14141a'; c.stroke();
        const r = s.tk ? s.t / s.tk.bake : 0, hot = s.tk ? 1 : .25;
        rrp(c, x + 10, y + 10, sw - 20, 262, 12); const og = c.createRadialGradient(x + sw / 2, y + 150, 10, x + sw / 2, y + 150, sw * .8); og.addColorStop(0, `rgba(255,170,60,${.55 * hot + .15})`); og.addColorStop(1, '#2a0f08'); c.fillStyle = og; c.fill(); c.lineWidth = 3; c.strokeStyle = '#5b5b66'; c.stroke();
        c.save(); rrp(c, x + 10, y + 10, sw - 20, 262, 12); c.clip();
        if (s.tk) { pzDraw(c, s.tk.pz, x + sw / 2, y + 150, Math.min(100, sw / 2 - 24), r); if (r > 1.25) { c.fillStyle = `rgba(40,40,40,${clamp((r - 1.25) * .6, 0, .45)})`; c.fillRect(x, y, sw, 280); } }
        else { S.text('EMPTY', x + sw / 2, y + 120, 20, 'rgba(255,255,255,.4)'); if (X.sv.served < 3) S.wrap('Click a pizza on the left to load it. Take it out when the dial is in the green!', x + 24, y + 150, sw - 48, 17, 14, 'rgba(255,255,255,.75)', 'left', 700); }
        c.restore();
        c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(x + 14, y + 14); c.lineTo(x + sw * .5, y + 14); c.lineTo(x + 14, y + 120); c.closePath(); c.fill();
        if (s.tk) {
          const tk = s.tk, cx = x + sw / 2, dy = y + 322, dr = 52;
          c.beginPath(); c.arc(cx, dy, dr, 0, TAU); c.fillStyle = '#fff8e7'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#14141a'; c.stroke();
          c.beginPath(); c.arc(cx, dy, dr - 8, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(r / 1.6, 0, 1)); c.lineWidth = 9; c.strokeStyle = r < .9 ? '#4cc9f0' : r < 1.06 ? '#3ecf6c' : r < 1.25 ? '#ffa94d' : '#e63946'; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
          const ta = -Math.PI / 2 + TAU * (1 / 1.6); c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + Math.cos(ta) * (dr - 16), dy + Math.sin(ta) * (dr - 16)); c.lineTo(cx + Math.cos(ta) * (dr + 2), dy + Math.sin(ta) * (dr + 2)); c.stroke();
          S.text(fmtTime(Math.min(s.t, tk.bake * 1.6)), cx, dy - 6, 20, '#2a2438'); S.text('/ ' + fmtTime(tk.bake), cx, dy + 14, 12, '#6a5a7a', 'center', null, 800);
          const lab = r < .6 ? 'Raw' : r < .9 ? 'Almost' : r < 1.06 ? 'PERFECT' : r < 1.25 ? 'Overdone' : 'BURNT!';
          S.text(`#${tk.id} ${tk.cu.L.n}`, cx, y + 392, S.fit(`#${tk.id} ${tk.cu.L.n}`, sw - 16, 15), '#fff3dc', 'center', null, 900);
          S.text(lab, cx, y + 412, 15, r < 1.06 && r >= .9 ? '#7bff9a' : r < .9 ? '#9ad7ff' : '#ff9b7a', 'center', '#14141a');
          if (S.btn(x + 14, y + 420, sw - 28, 26, 'Take out', { color: r >= .9 && r < 1.1 ? '#3ecf6c' : '#e8584a', size: 16, r: 10 }) || (!S.lock && S.key('Digit' + (i + 5)))) takeOut(s);
          if (s.belled && !up('timer') && Math.sin(S.t * 14) > 0 && r < 1.3) { rrp(c, x - 2, y - 2, sw + 4, h + 4, 18); c.lineWidth = 4; c.strokeStyle = '#ffe14d'; c.stroke(); }
        } else if (S.btn(x + sw / 2 - 60, y + 300, 120, 44, 'Load', { color: tray.length ? '#3ecf6c' : '#8a8498', size: 18, enabled: tray.length > 0 })) loadOven(tray[0], s);
      });
    };
    const drawCut = () => {
      X.bg('#9fb7c9', '#7a95aa');
      c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < 960; x += 48) c.fillRect(x, 124, 2, 476);
      const k = D.k, sv2 = D.serving;
      if (!sv2) ensureCut();
      const ct = k.cut;
      S.panel(PX - PR - 30, PY - PR - 26, PR * 2 + 60, PR * 2 + 66, { fill: '#c98a50', line: '#5a3418', r: 22, lw: 5, sh: 5 });
      c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 6; i++) c.fillRect(PX - PR - 22, PY - PR - 14 + i * 56, PR * 2 + 44, 3);
      if (sv2 && k.anim && k.anim.tk === sv2.tk) {
        const t = clamp(sv2.t / .7, 0, 1);
        for (const sl of k.anim.slices) {
          const d = Math.hypot(sl.cx, sl.cy) || 1, off = eo(t) * 20;
          c.save(); c.translate(PX + sl.cx / d * off, PY + sl.cy / d * off); c.beginPath(); c.moveTo(sl.poly[0][0], sl.poly[0][1]); for (const p of sl.poly) c.lineTo(p[0], p[1]); c.closePath(); c.clip(); pzDraw(c, sv2.tk.pz, 0, 0, PR, sv2.tk.cookR); c.restore();
        }
        if (sv2.t > .75) { const kk = eo((sv2.t - .75) / .35); c.save(); c.globalAlpha = kk; S.panel(PX - 130, PY - 40, 260, 80, { fill: '#fff', r: 14 }); S.text('Boxed up!', PX, PY, 30, '#2a2438'); c.restore(); }
        return;
      }
      if (!ct) {
        S.text('No pizza to cut', PX, PY - 10, 28, '#fff', 'center', '#2a3a4a'); S.text('Bake a pizza first (3)', PX, PY + 26, 16, '#fff', 'center', '#2a3a4a', 800);
        const cnt = k.slots.filter(s => s.tk).length; if (cnt) S.text(tr('{n} baking right now', { n: cnt }), PX, PY + 52, 14, '#e8f4ff', 'center', '#2a3a4a', 800);
        return;
      }
      const tk = ct.tk, n = tk.cuts / 2;
      pzDraw(c, tk.pz, PX, PY, PR, tk.cookR);
      c.lineCap = 'round';
      for (const l of ct.lines) { c.lineWidth = 4; c.strokeStyle = 'rgba(40,20,10,.85)'; c.beginPath(); c.moveTo(PX + l.x0, PY + l.y0); c.lineTo(PX + l.x1, PY + l.y1); c.stroke(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(PX + l.x0 + 1.5, PY + l.y0 + 1.5); c.lineTo(PX + l.x1 + 1.5, PY + l.y1 + 1.5); c.stroke(); }
      if (up('guide') && ct.lines.length) {
        const l = ct.lines[0], a0 = Math.atan2(l.y1 - l.y0, l.x1 - l.x0);
        c.setLineDash([6, 8]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2;
        for (let i = 1; i < n; i++) { const a = a0 + i * Math.PI / n; c.beginPath(); c.moveTo(PX - Math.cos(a) * PR, PY - Math.sin(a) * PR); c.lineTo(PX + Math.cos(a) * PR, PY + Math.sin(a) * PR); c.stroke(); }
        c.setLineDash([]);
      } else if (up('guide')) { c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n; c.beginPath(); c.arc(PX + Math.cos(a) * (PR + 8), PY + Math.sin(a) * (PR + 8), 3, 0, TAU); c.fill(); } }
      if (ct.lines.length < n && S.pressed && !S.downBtn && !S.lock && S.inside(PX - PR - 40, PY - PR - 30, PR * 2 + 80, PR * 2 + 70)) ct.drag = { x0: S.mx, y0: S.my };
      if (ct.drag) {
        if (S.down) { c.lineWidth = 3; c.setLineDash([10, 8]); c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(ct.drag.x0, ct.drag.y0); c.lineTo(S.mx, S.my); c.stroke(); c.setLineDash([]); c.fillStyle = '#d9dde3'; c.save(); c.translate(S.mx, S.my); c.rotate(Math.atan2(S.my - ct.drag.y0, S.mx - ct.drag.x0) - Math.PI / 2); c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.lineTo(4, 38); c.lineTo(-4, 38); c.closePath(); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#5a3418'; rrp(c, -5, 38, 10, 22, 3); c.fill(); c.stroke(); c.restore(); }
        else {
          const d = ct.drag; ct.drag = null; const len = Math.hypot(S.mx - d.x0, S.my - d.y0);
          const hit = len > 60 ? circleHit(d.x0 - PX, d.y0 - PY, S.mx - PX, S.my - PY) : null;
          if (hit && Math.hypot(hit.x1 - hit.x0, hit.y1 - hit.y0) > PR * 1.1) { ct.lines.push(hit); au.noise(.18, .1, 6000, 0, 'highpass', 1800); au.tone(900, .06, 'square', .03, 1400); S.mkScr = true; S.spark(PX + (hit.x0 + hit.x1) / 2, PY + (hit.y0 + hit.y1) / 2, 6, '#fff', 120, 200, .35); S.mkScr = false; }
          else { ct.bad = 1.2; au.tone(200, .12, 'sawtooth', .04); }
        }
      }
      if (ct.bad > 0) S.text('Cut all the way across the pizza', PX, PY - PR - 44, 16, '#ffe14d', 'center', '#2a3a4a');
      S.text(tr('Cut {a} / {b} lines   ·   {c} slices', { a: ct.lines.length, b: n, c: tk.cuts }), PX, PY + PR + 40, 16, '#fff', 'center', '#2a3a4a');
      if (S.btn(PX - 200, 548, 120, 40, 'Redo cuts', { color: '#8a7fa8', size: 14, enabled: ct.lines.length > 0 })) ct.lines = [];
      if (S.btn(PX - 66, 548, 120, 40, 'Undo', { color: '#8a7fa8', size: 14, enabled: ct.lines.length > 0 })) ct.lines.pop();
      if (S.btn(PX + 68, 548, 150, 40, 'Box it up!', { color: '#e8584a', size: 17, enabled: ct.lines.length === n }) || (ct.lines.length === n && !S.lock && S.key('Enter'))) serve();
      ticket(tk, 712, 132, 240, null);
      X.tipBox('Drag across the whole pizza through the middle. Space the cuts evenly, like the spokes of a wheel.');
    };
    return {
      id: 'pizza', n: 'Pizza Corner', food: 'Pizza', unlock: 1, pat: 1, gap: 1, ups: PZ.UPS,
      th: { wall: ['#ffe8c2', '#ffd49a'], trim: ['#c0392b', '#e8584a'], sign: '#2b3a2d', signT: '#ffe14d', counter: ['#6a3f20', '#d9a066', '#a8703c'], bar: ['#d94a3d', '#b53226'], tab: '#f08a4b', intro: ['#ffb75e', '#ed5d3f'] },
      st: [{ id: 'build', n: 'Build' }, { id: 'bake', n: 'Bake' }, { id: 'cut', n: 'Cut' }],
      rows: [['Topping', 'top'], ['Baking', 'bake'], ['Cutting', 'cut']],
      hint0: 'Click the customer at the counter to take the order, then go to the Build station (2).',
      help: [['BUILD', 'Paint the sauce, sprinkle the cheese, then drag toppings onto the quarters the ticket asks for (TL means top left).'], ['BAKE', 'Load the pizza into an oven slot. Take it out when the dial reaches the green mark. The oven bell rings when it is ready.'], ['CUT', 'Drag straight across the pizza through the middle. Space the cuts evenly, then box it up and serve.']],
      menu: day => unlockedTops(day).map(t => (x, y) => pzTop(c, t.id, x, y, 0, .9)),
      newItems: day => PZ.TOPS.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => pzTop(c, t.id, x, y, 0, 1.5) })).concat(PZ.SAUCES.filter(t => t.day === day && t.day > 1).map(t => ({ n: t.n, d: (x, y) => { c.fillStyle = t.col; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2.5; c.stroke(); } }))),
      icon: (x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); const R = 50; c.beginPath(); c.arc(0, 4, R + 3, 0, TAU); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fillStyle = '#e3a857'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7a4a1a'; c.stroke(); c.beginPath(); c.arc(0, 0, R * .84, 0, TAU); c.fillStyle = '#c8321e'; c.fill(); c.beginPath(); c.arc(0, 0, R * .8, 0, TAU); c.fillStyle = '#ffd96a'; c.fill(); for (let i = 0; i < 6; i++) { const a = i * 1.05 + .3, d = i === 5 ? 0 : R * .5; pzTop(c, i % 3 === 0 ? 'pep' : i % 3 === 1 ? 'mush' : 'olive', Math.cos(a) * d, Math.sin(a) * d, a, 1.1); } c.restore(); },
      floaty: t => { for (let i = 0; i < 14; i++) pzTop(c, ['pep', 'mush', 'olive', 'pepper', 'pine'][i % 5], (i * 137 + t * 18) % 1020 - 30, ((i * 89) % 520) + 40, i + t * .4, 2.2 + (i % 3) * .5); },
      gen, ticket, focus,
      mini: (c2, x, y, tk) => pzMini(c2, x, y, 19, tk),
      stage: tk => ({ new: ['BUILD', '#9aa3ad', 'build'], building: ['BUILD', '#9aa3ad', 'build'], tray: ['BAKE', '#ffa94d', 'bake'], oven: ['OVEN', '#e63946', 'bake'], cut: ['CUT', '#4cc9f0', 'cut'], cutting: ['CUT', '#4cc9f0', 'cut'], serving: ['SERVE', '#3ecf6c', 'cut'] })[tk.state] || ['', '#9aa3ad', null],
      isSel: tk => !!((D.k.bld && D.k.bld.tk === tk) || (D.k.cut && D.k.cut.tk === tk)),
      badge: id => id === 'build' ? D.tickets.filter(t => t.state === 'new' || t.state === 'building').length : id === 'bake' ? D.tickets.filter(t => t.state === 'tray').length + D.k.slots.filter(s => s.tk && s.belled).length : D.tickets.filter(t => t.state === 'cut' || t.state === 'cutting').length,
      dayInit: d => { D = d; D.day = X.RS.day; D.k = { bld: null, cut: null, anim: null, slots: [] }; for (let i = 0; i < 2 + up('oven'); i++) D.k.slots.push({ tk: null, t: 0, belled: false, autoAt: 0 }); },
      tick: dt => {
        const k = D.k;
        for (const s of k.slots) {
          if (!s.tk) continue;
          s.t += dt; const r = s.t / s.tk.bake;
          if (!s.belled && r >= 1) { s.belled = true; au.tone(1760, .5, 'sine', .08); au.tone(2093, .6, 'sine', .06, 0, .02); if (D.station !== 'bake') toast('Ding! A pizza is ready in the oven'); S.mkScr = true; S.ring(s.sx || 480, 330, 10, 90, '#ffe14d', .6, 4); S.mkScr = false; if (up('timer')) s.autoAt = s.t + rnd(0, .05) * s.tk.bake; }
          if (up('timer') && s.autoAt && s.t >= s.autoAt) { s.autoAt = 0; takeOut(s); continue; }
          if (r > 1.25 && Math.random() < dt * 5 && D.station === 'bake') S.fx.push({ k: 'dot', x: (s.sx || 480) + rnd(-50, 50), y: 340, vx: rnd(-10, 10), vy: rnd(-60, -110), g: -30, col: 'rgba(60,60,60,.7)', r: rnd(5, 10), t: 0, life: 1.2, scr: true });
        }
        if (k.cut) k.cut.bad = Math.max(0, k.cut.bad - dt);
      },
      leave: tk => { const k = D.k; if (k.bld && k.bld.tk === tk) k.bld = null; if (k.cut && k.cut.tk === tk) k.cut = null; k.slots.forEach(s => { if (s.tk === tk) { s.tk = null; s.t = 0; } }); },
      draw: { build: drawBuild, bake: drawBake, cut: drawCut }
    };
  };
  const lcs = (a, b) => { const m = a.length, n = b.length, d = []; for (let i = 0; i <= m; i++) { d.push(new Array(n + 1).fill(0)); } for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] + 1 : Math.max(d[i - 1][j], d[i][j - 1]); return d[m][n]; };
  const burgerKit = X => {
    const { S, c, au, up, toast } = X;
    let D = null;
    const BX = 468, BY = 556, GX = 236, GW = 464;
    const avail = day => BG.L.filter(t => t.day <= day && t.id !== 'bunB' && t.id !== 'bunT' && t.id !== 'patty');
    const dones = day => BG.DONE.filter(t => t.day <= day);
    const sideScore = (v, t) => { const e = Math.abs(v - t); return e <= .05 ? 100 : Math.max(0, 100 - (e - .05) * 220); };
    const pScore = (p, done) => Math.round((sideScore(p.a, BG.DB[done].v) + sideScore(p.b, BG.DB[done].v)) / 2);
    const gen = (day, critic) => {
      const tops = avail(day), nP = critic ? rint(2, 3) : day < 3 ? 1 : day < 6 ? rint(1, 2) : rint(1, 3);
      const nT = Math.min(tops.length, (critic ? 1 : 0) + (day < 2 ? rint(2, 3) : day < 5 ? rint(2, 4) : rint(3, 6)));
      const mid = shuffle(tops.slice()).slice(0, nT).map(t => t.id);
      for (let i = 0; i < nP; i++) mid.splice(rint(0, mid.length), 0, 'patty');
      const layers = ['bunB'].concat(mid, ['bunT']);
      let price = 4 + layers.reduce((a, id) => a + BG.B[id].price, 0);
      price *= 1 + .15 * up('buns');
      return { layers, done: pick(dones(day)).id, price: Math.round(price * 20) / 20 };
    };
    const ticket = (tk, x, y, w, live, bubble) => {
      const n = tk.layers.length, h = 92 + n * 23;
      S.panel(x, y, w, h, { fill: '#fffdf2', line: '#7a5a2a', r: 8, lw: 3, sh: 4 });
      tkHead(S, c, tk, x, y, w, bubble);
      const dn = BG.DB[tk.done], col = pattyCol(dn.v);
      rrp(c, x + 12, y + 52, w - 24, 26, 13); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a2438'; c.stroke();
      S.text(tr('Patties: {d}', { d: tr(dn.n) }), x + w / 2, y + 65, S.fit(tr('Patties: {d}', { d: tr(dn.n) }), w - 40, 14), '#fff', 'center', '#2a1b14');
      const built = live ? live.map(l => l.id) : null;
      for (let i = 0; i < n; i++) {
        const id = tk.layers[n - 1 - i], yy = y + 98 + i * 23, idx = n - 1 - i;
        bgIcon(c, id, x + 30, yy, .8);
        S.text(BG.B[id].n, x + 58, yy, S.fit(tr(BG.B[id].n), w - 100, 13), '#2a2438', 'left', null, 800);
        if (built) tick2(c, x + w - 32, yy - 9, built[idx] === id);
      }
      return h;
    };
    const need = () => {
      const k = D.k, out = {};
      for (const t of D.tickets) { if (t.state !== 'new' && t.state !== 'building') continue; const used = k.bld && k.bld.tk === t ? k.bld.layers.filter(l => l.id === 'patty').length : 0; out[t.done] = (out[t.done] || 0) + Math.max(0, t.layers.filter(l => l === 'patty').length - used); }
      return out;
    };
    const ensureBuild = () => { const k = D.k; if (k.bld) return; const tk = X.next('new'); if (!tk) return; k.bld = { tk, layers: [], held: null, drop: null }; tk.state = 'building'; };
    const focus = tk => { const k = D.k; if (tk.state !== 'new') return; if (k.bld && k.bld.layers.length) return; if (k.bld) k.bld.tk.state = 'new'; k.bld = { tk, layers: [], held: null, drop: null }; tk.state = 'building'; };
    const trayMax = () => 6 + 2 * up('tray');
    const toTray = (i) => {
      const k = D.k, p = k.grill[i].p; if (!p) return;
      if (k.tray.length >= trayMax()) { toast('The warming tray is full'); au.tone(180, .15, 'sawtooth', .05); return; }
      k.tray.push(p); k.grill[i].p = null; au.tone(520, .06, 'sine', .05); au.noise(.1, .05, 1500, 0, 'bandpass');
    };
    const flip = p => { if (p.flip > 0) return; p.flip = .32; p.side = 1 - p.side; au.noise(.16, .1, 2200, 0, 'bandpass', 900); au.tone(240, .06, 'triangle', .04, 360); };
    const stackH = b => b.layers.reduce((a, l) => a + BG.B[l.id].h * .92, 0);
    const drawPattyTop = (p, x, y, r) => {
      const up2 = p.side === 0 ? p.b : p.a, sc = p.flip > 0 ? Math.abs(Math.cos((1 - p.flip / .32) * Math.PI)) : 1;
      c.save(); c.translate(x, y - (p.flip > 0 ? Math.sin((1 - p.flip / .32) * Math.PI) * 26 : 0)); c.scale(1, Math.max(.08, sc));
      c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = pattyCol(up2); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1b14'; c.stroke();
      if (up2 > .3) { c.strokeStyle = alpha('#1a0e08', clamp((up2 - .3) * 1.4, 0, .75)); c.lineWidth = 5; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-r * .7, i * r * .45 - r * .25); c.lineTo(r * .7, i * r * .45 + r * .25); c.stroke(); } }
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(-r * .3, -r * .35, r * .35, r * .18, -.4, 0, TAU); c.fill();
      c.restore();
    };
    const meter = (x, y, w, v, lab) => {
      rrp(c, x, y, w, 10, 5); c.fillStyle = '#3a3a44'; c.fill();
      const zones = [[.3, '#e9a0a0'], [.58, '#c46a5a'], [.86, '#9a5638'], [1.15, '#6e3b22'], [1.4, '#2b1a12']]; let a0 = 0;
      for (const [z, col] of zones) { c.fillStyle = alpha(col, .55); c.fillRect(x + w * a0 / 1.4, y + 2, w * (z - a0) / 1.4, 6); a0 = z; }
      for (const d of BG.DONE) { const tx = x + w * d.v / 1.4; c.fillStyle = '#fff'; c.fillRect(tx - 1, y - 2, 2, 14); }
      const vx = x + w * clamp(v, 0, 1.4) / 1.4; c.fillStyle = '#ffe14d'; c.beginPath(); c.moveTo(vx, y - 1); c.lineTo(vx - 5, y - 8); c.lineTo(vx + 5, y - 8); c.closePath(); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 1.5; c.stroke();
      S.text(lab, x - 6, y + 5, 10, '#ffe9c4', 'right', null, 900);
    };
    const drawGrill = () => {
      X.bg('#5a4a44', '#3a2e2a');
      const k = D.k;
      X.sidePanel('RAW PATTIES', '#6a7a8a', '#2a3440');
      rrp(c, 24, 166, 182, 150, 12); c.fillStyle = '#d8e8f4'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a3440'; c.stroke();
      for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(62 + (i % 3) * 52, 210 + Math.floor(i / 3) * 62, 22, 0, TAU); c.fillStyle = '#e9a0a0'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#8a3a3a'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(56 + (i % 3) * 52, 203 + Math.floor(i / 3) * 62, 6, 0, TAU); c.fill(); }
      const hovRaw = S.hover(24, 166, 182, 150);
      if (hovRaw) { S.cursor = 'pointer'; rrp(c, 24, 166, 182, 150, 12); c.lineWidth = 4; c.strokeStyle = '#ffe14d'; c.stroke(); }
      if (S.clickIn(24, 166, 182, 150)) { k.raw = !k.raw; au.tone(440, .06, 'sine', .05); }
      S.wrap('Click the box, then a free spot on the grill. Or click an empty spot straight away.', 24, 330, 182, 17, 13, '#eef4fa', 'left', 700);
      const nd = need(), keys = Object.keys(nd).filter(d => nd[d] > 0);
      S.text('STILL NEEDED', 115, 420, 13, '#ffe9c4', 'center', null, 900);
      if (!keys.length) S.text('Nothing for now', 115, 446, 13, '#d9e2ea', 'center', null, 800);
      keys.forEach((d, i) => { const have = k.tray.filter(p => doneName((p.a + p.b) / 2) === BG.DB[d].n).length; rrp(c, 24, 436 + i * 34, 182, 28, 8); c.fillStyle = pattyCol(BG.DB[d].v); c.fill(); S.text(tr('{n} × {d}', { n: nd[d], d: tr(BG.DB[d].n) }), 36, 450 + i * 34, 14, '#fff', 'left', '#2a1b14'); S.text(tr('{n} ready', { n: have }), 196, 450 + i * 34, 11, '#ffe9c4', 'right', '#2a1b14', 800); });
      const n = k.grill.length, cols = n / 2, sw = GW / cols;
      S.panel(GX - 6, 136, GW + 12, 446, { fill: '#2a2a30', line: '#111116', r: 16, lw: 4, sh: 4 });
      c.strokeStyle = '#4a4a54'; c.lineWidth = 4; for (let y = 150; y < 576; y += 18) { c.beginPath(); c.moveTo(GX + 6, y); c.lineTo(GX + GW - 6, y); c.stroke(); }
      k.grill.forEach((g, i) => {
        const cx = GX + (i % cols) * sw + sw / 2, cy = 250 + Math.floor(i / cols) * 210;
        g.x = cx; g.y = cy;
        if (!g.p) {
          const hov = S.hover(cx - 50, cy - 50, 100, 100);
          c.setLineDash([6, 6]); c.strokeStyle = hov ? '#ffe14d' : 'rgba(255,255,255,.22)'; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, 44, 0, TAU); c.stroke(); c.setLineDash([]);
          if (hov) S.cursor = 'pointer';
          if (S.clickIn(cx - 50, cy - 50, 100, 100)) { g.p = { a: 0, b: 0, side: 0, flip: 0, bells: 0, sz: 0 }; k.raw = false; au.noise(.5, .1, 2600, 0, 'bandpass', 1400); }
          return;
        }
        const p = g.p, dn = p.side === 0 ? p.a : p.b, burnt = dn > 1.25;
        c.fillStyle = alpha('#ff7a2a', .1 + .08 * Math.sin(S.t * 7 + i)); c.beginPath(); c.arc(cx, cy + 4, 56, 0, TAU); c.fill();
        if (k.drag && k.drag.i === i && k.drag.on) { c.globalAlpha = .35; drawPattyTop(p, cx, cy, 44); c.globalAlpha = 1; }
        else drawPattyTop(p, cx, cy, 44);
        if (burnt && Math.sin(S.t * 10 + i) > 0) { c.lineWidth = 4; c.strokeStyle = '#e63946'; c.beginPath(); c.arc(cx, cy, 52, 0, TAU); c.stroke(); }
        meter(cx - 46, cy + 56, 100, p.side === 0 ? p.a : p.b, tr('Down'));
        meter(cx - 46, cy + 74, 100, p.side === 0 ? p.b : p.a, tr('Up'));
        S.text(doneName(dn), cx, cy - 58, 13, burnt ? '#ff8a8a' : '#ffe9c4', 'center', '#14141a');
        if (S.btn(cx - 44, cy + 90, 88, 26, 'To tray', { color: '#3ecf6c', size: 13, r: 9 })) toTray(i);
        const hov = S.hover(cx - 46, cy - 46, 92, 92);
        if (hov) S.cursor = 'grab';
        if (!S.lock && S.pressed && !S.downBtn && S.inside(cx - 46, cy - 46, 92, 92)) k.drag = { i, on: false };
      });
      if (k.drag) {
        const g = k.grill[k.drag.i];
        if (!g || !g.p) k.drag = null;
        else if (S.down) { if (Math.hypot(S.mx - S.downX, S.my - S.downY) > 14) k.drag.on = true; if (k.drag.on) { drawPattyTop(g.p, S.mx, S.my, 40); S.cursor = 'grabbing'; } }
        else { if (k.drag.on) { if (S.mx > 700) toTray(k.drag.i); } else if (Math.hypot(S.mx - g.x, S.my - g.y) < 50) flip(g.p); k.drag = null; }
      }
      S.panel(712, 132, 240, 460, { fill: '#7a5a3a', line: '#3a2a1a', r: 12, lw: 4, sh: 3 });
      S.text(tr('WARMING TRAY {a}/{b}', { a: k.tray.length, b: trayMax() }), 832, 152, 13, '#ffe9c4', 'center', null, 900);
      k.tray.forEach((p, i) => { const x = 752 + (i % 2) * 120, y = 200 + Math.floor(i / 2) * 92; c.beginPath(); c.arc(x, y, 30, 0, TAU); c.fillStyle = pattyCol((p.a + p.b) / 2); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1b14'; c.stroke(); S.text(doneName((p.a + p.b) / 2), x + 20, y + 40, 12, '#fff3dc', 'center', '#2a1b14', 900); });
      if (!k.tray.length) S.wrap('Drag cooked patties here, or press To tray.', 728, 186, 208, 17, 14, '#f0dcc0', 'left', 700);
      if (k.raw) { c.save(); c.globalAlpha = .85; c.beginPath(); c.arc(S.mx, S.my, 30, 0, TAU); c.fillStyle = '#e9a0a0'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#8a3a3a'; c.stroke(); c.restore(); if (S.released && !S.inside(24, 166, 182, 150) && !k.grill.some(g => !g.p && S.inside(g.x - 50, g.y - 50, 100, 100))) k.raw = false; }
      if (X.sv.served < 3) { S.panel(236, 540, 464, 40, { fill: 'rgba(20,16,30,.85)', r: 12, lw: 0, sh: 0 }); S.text('Click a patty to flip it. Cook both sides to the ticket, then move it to the tray.', 468, 560, S.fit(tr('Click a patty to flip it. Cook both sides to the ticket, then move it to the tray.'), 448, 13, 800), '#fff', 'center', null, 800); }
    };
    const drawBuild = () => {
      X.bg('#e8c89a', '#c29a66');
      const k = D.k, sv2 = D.serving;
      if (!sv2) ensureBuild();
      const b = k.bld;
      X.sidePanel('INGREDIENTS', '#8a5a30', '#4a2a12');
      const bins = ['bunB', 'bunT', 'patty'].concat(avail(D.day).map(t => t.id));
      S.panel(GX - 6, 132, GW + 12, 60, { fill: '#7a5a3a', line: '#3a2a1a', r: 10, lw: 3, sh: 2 });
      S.text(k.tray.length ? 'TRAY' : 'TRAY EMPTY', GX + 8, 162, 11, '#ffe9c4', 'left', null, 900);
      k.tray.forEach((p, i) => {
        const x = GX + 86 + i * 50, y = 162, sel = b && b.held && b.held.p === p, hov = !!b && S.hover(x - 20, y - 22, 40, 44);
        c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fillStyle = pattyCol((p.a + p.b) / 2); c.fill(); c.lineWidth = sel ? 4 : 2.5; c.strokeStyle = sel ? '#ffe14d' : '#2a1b14'; c.stroke();
        S.text(doneName((p.a + p.b) / 2).split(' ')[0], x, y + 25, 9, '#fff3dc', 'center', '#2a1b14', 900);
        if (hov) S.cursor = 'pointer';
        if (b && !b.drop && S.clickIn(x - 20, y - 22, 40, 44)) { b.held = { id: 'patty', p }; au.tone(520, .06, 'sine', .05); }
      });
      if (sv2 && k.anim && k.anim.tk === sv2.tk) {
        const a = k.anim, t = clamp(sv2.t / .6, 0, 1);
        c.save(); c.translate(0, -eo(t) * 30); let y = BY; for (const l of a.layers) { y -= bgLayer(c, l.id, BX + l.off * (1 - t), y, 150, { cook: l.p ? (l.p.a + l.p.b) / 2 : 0 }) * .92; } c.restore();
        if (sv2.t > .6) { const kk = eo((sv2.t - .6) / .4); c.save(); c.globalAlpha = kk; S.panel(BX - 130, 300, 260, 80, { fill: '#fff', r: 14 }); S.text('Wrapped up!', BX, 340, 30, '#2a2438'); c.restore(); }
        return;
      }
      c.fillStyle = '#f4f4f8'; c.beginPath(); c.ellipse(BX, BY + 8, 120, 18, 0, 0, TAU); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke(); c.fillStyle = '#d8d8e0'; c.beginPath(); c.ellipse(BX, BY + 6, 90, 10, 0, 0, TAU); c.fill();
      if (!b) { X.emptyMsg('No burgers to build', 'Take an order at the Order station (1)', BX); return; }
      const tk = b.tk;
      bins.forEach((id, i) => {
        const x = 18 + (i % 3) * 66, y = 160 + Math.floor(i / 3) * 70, sel = b.held && b.held.id === id && id !== 'patty', hov = S.hover(x, y, 60, 64);
        rrp(c, x, y, 60, 64, 10); c.fillStyle = sel ? '#ffe14d' : hov ? '#fff8e0' : '#fff3dc'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        bgIcon(c, id, x + 30, y + 26, id === 'patty' ? .9 : 1.15);
        S.text(BG.B[id].n, x + 30, y + 54, S.fit(tr(BG.B[id].n), 56, 10), '#2a2438', 'center', null, 900);
        if (hov) S.cursor = 'pointer';
        if (!b.drop && S.clickIn(x, y, 60, 64)) {
          if (id === 'patty') { const p = k.tray[0]; if (!p) { toast('No cooked patties. Grill some first (2)'); au.tone(200, .12, 'sawtooth', .04); } else { b.held = { id: 'patty', p }; au.tone(520, .06, 'sine', .05); } }
          else { b.held = { id }; au.tone(520, .06, 'sine', .05); }
        }
      });
      const top = BY - stackH(b);
      let y = BY;
      for (const l of b.layers) y -= bgLayer(c, l.id, BX + l.off, y, 150, { cook: l.p ? (l.p.a + l.p.b) / 2 : 0 }) * .92;
      if (b.drop) bgLayer(c, b.drop.id, b.drop.x, b.drop.y, 150, { cook: b.drop.p ? (b.drop.p.a + b.drop.p.b) / 2 : 0 });
      const hx = clamp(S.mx, GX + 70, GX + GW - 70);
      if (b.held && !b.drop) {
        c.save(); c.globalAlpha = .9; bgLayer(c, b.held.id, hx, 236, 150, { cook: b.held.p ? (b.held.p.a + b.held.p.b) / 2 : 0 }); c.restore();
        c.setLineDash([5, 7]); c.strokeStyle = 'rgba(42,36,56,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, 244); c.lineTo(hx, top - 4); c.stroke(); c.setLineDash([]);
        if (S.released && !S.downBtn && S.inside(GX, 200, GW, 400) && !S.inside(GX, 132, GW, 66)) {
          const ty = top, off = (hx - BX) * (up('steady') === 2 ? .45 : up('steady') === 1 ? .7 : 1);
          b.drop = { id: b.held.id, p: b.held.p, x: hx, tx: BX + off, off, y: 236, vy: 0, ty };
          if (b.held.p) { const ix = k.tray.indexOf(b.held.p); if (ix >= 0) k.tray.splice(ix, 1); }
          b.held = null;
        }
      }
      S.panel(GX + 40, 200, GW - 80, 26, { fill: 'rgba(42,36,56,.8)', r: 13, lw: 0, sh: 0 });
      S.text(b.held ? 'Click to drop it on the burger' : 'Pick the next ingredient on the left', BX, 213, S.fit(tr(b.held ? 'Click to drop it on the burger' : 'Pick the next ingredient on the left'), GW - 100, 13), '#fff', 'center', null, 800);
      if (S.btn(GX + 12, 548, 100, 40, 'Undo', { color: '#8a7fa8', size: 14, enabled: b.layers.length > 0 && !b.drop })) { const l = b.layers.pop(); if (l.p && k.tray.length < trayMax()) k.tray.push(l.p); }
      if (S.btn(BX + 100, 548, 150, 40, 'Serve', { color: '#e8584a', size: 18, enabled: b.layers.length >= 2 && !b.drop }) || (b.layers.length >= 2 && !b.drop && !S.lock && S.key('Enter'))) {
        const ids = b.layers.map(l => l.id), seq = lcs(tk.layers, ids) / Math.max(tk.layers.length, ids.length), al = b.layers.reduce((a, l) => a + clamp(1 - Math.abs(l.off) / 45, 0, 1), 0) / b.layers.length;
        tk.sc.build = Math.round(100 * (.72 * seq + .28 * al));
        const ps = b.layers.filter(l => l.p).map(l => pScore(l.p, tk.done)), want = tk.layers.filter(l => l === 'patty').length;
        tk.sc.grill = Math.round(ps.reduce((a, v) => a + v, 0) / Math.max(want, ps.length));
        k.anim = { tk, layers: b.layers.slice() }; k.bld = null; X.serve(tk);
      }
      ticket(tk, 712, 132, 240, b.layers);
      X.tipBox('Stack from the bottom bun up, in the order on the ticket. Drop each layer right over the middle.');
    };
    return {
      id: 'burger', n: 'Burger Grill', food: 'Burger', unlock: 3, pat: .95, gap: .92, ups: BG.UPS,
      th: { wall: ['#d9eef7', '#b6d9ea'], trim: ['#1d6fa5', '#2a8fd0'], sign: '#e63946', signT: '#fff3c4', counter: ['#3a3a44', '#c0c6d0', '#8a909c'], bar: ['#2a8fd0', '#1d6fa5'], tab: '#4c9be0', intro: ['#8fd3ff', '#2a6fbf'] },
      st: [{ id: 'grill', n: 'Grill' }, { id: 'build', n: 'Build' }],
      rows: [['Grilling', 'grill'], ['Building', 'build']],
      hint0: 'Click the customer to take the order. Grill patties (2), then stack the burger (3).',
      help: [['GRILL', 'Put raw patties on the grill. Click a patty to flip it: both sides must reach the doneness on the ticket (rare, medium or well done). Move cooked patties to the warming tray.'], ['BUILD', 'Stack the burger from the bottom bun up, in the order on the ticket. Pick a layer, then click to drop it: the closer to the middle, the better. Press Serve when the top bun is on.']],
      menu: day => ['bunT', 'patty'].concat(avail(day).map(t => t.id)).map(id => (x, y) => bgIcon(c, id, x, y, id === 'patty' ? .75 : .85)),
      newItems: day => BG.L.filter(t => t.day === day && t.id !== 'bunB').map(t => ({ n: t.n, d: (x, y) => bgIcon(c, t.id, x, y, .8) })).concat(BG.DONE.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => { c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fillStyle = pattyCol(t.v); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2.5; c.stroke(); } }))),
      icon: (x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 44, 70, 10, 0, 0, TAU); c.fill(); bgStack(c, ['bunB', 'patty', 'cheese', 'lettuce', 'tomato', 'bunT'], 0, 42, 118); c.restore(); },
      floaty: t => { const ids = ['patty', 'cheese', 'tomato', 'lettuce', 'bunT', 'pickle']; for (let i = 0; i < 12; i++) { c.save(); c.translate((i * 151 + t * 20) % 1020 - 30, ((i * 97) % 520) + 40); c.rotate(Math.sin(t * .5 + i) * .3); bgIcon(c, ids[i % 6], 0, 0, 1.6); c.restore(); } },
      gen, ticket, focus,
      mini: (c2, x, y, tk) => { bgStack(c2, tk.layers, x, y + 20, 40); },
      stage: tk => { if (tk.state === 'serving') return ['SERVE', '#3ecf6c', 'build']; if (tk.state !== 'new' && tk.state !== 'building') return ['', '#9aa3ad', null]; const want = tk.layers.filter(l => l === 'patty').length; return D.k.tray.length >= want || (D.k.bld && D.k.bld.tk === tk) ? ['BUILD', '#4cc9f0', 'build'] : ['GRILL', '#ffa94d', 'grill']; },
      isSel: tk => !!(D.k.bld && D.k.bld.tk === tk),
      badge: id => id === 'grill' ? D.k.grill.filter(g => g.p && (g.p.side === 0 ? g.p.a : g.p.b) > .86).length : D.tickets.filter(t => t.state === 'new' || t.state === 'building').length,
      dayInit: d => { D = d; D.day = X.RS.day; D.k = { grill: [], tray: [], bld: null, anim: null, raw: false, drag: null, siz: 0 }; for (let i = 0; i < 6 + 2 * up('grill'); i++) D.k.grill.push({ p: null, x: 0, y: 0 }); },
      tick: dt => {
        const k = D.k; let on = 0;
        for (const g of k.grill) {
          const p = g.p; if (!p) continue; on++;
          if (p.flip > 0) p.flip = Math.max(0, p.flip - dt);
          const key = p.side === 0 ? 'a' : 'b', v0 = p[key];
          p[key] = Math.min(1.6, v0 + dt / 14);
          if (up('bell')) for (const d of BG.DONE) if (v0 < d.v && p[key] >= d.v) { au.tone(1568, .18, 'sine', .06); au.tone(2093, .25, 'sine', .04, 0, .05); }
          if (p[key] > 1.2 && Math.random() < dt * 4 && D.station === 'grill') S.fx.push({ k: 'dot', x: g.x + rnd(-30, 30), y: g.y, vx: rnd(-10, 10), vy: rnd(-60, -110), g: -30, col: 'rgba(60,60,60,.6)', r: rnd(5, 10), t: 0, life: 1.1, scr: true });
          if (Math.random() < dt * 3 && D.station === 'grill') S.fx.push({ k: 'dot', x: g.x + rnd(-36, 36), y: g.y + rnd(-20, 20), vx: rnd(-20, 20), vy: rnd(-40, -90), g: 60, col: 'rgba(255,240,200,.8)', r: rnd(1.5, 3), t: 0, life: .5, scr: true });
        }
        k.siz -= dt;
        if (on && k.siz <= 0) { k.siz = .45; if (D.station === 'grill') au.noise(.5, .012 + .004 * on, 3200, 0, 'bandpass', 2200); }
        const b = k.bld;
        if (b && b.drop) {
          const dp = b.drop; dp.vy += 2600 * dt; dp.y += dp.vy * dt; dp.x += (dp.tx - dp.x) * Math.min(1, dt * 3);
          if (dp.y >= dp.ty) { b.layers.push({ id: dp.id, off: dp.tx - BX, p: dp.p }); b.drop = null; au.noise(.08, .08, 700, 0, 'lowpass'); au.tone(200 + rnd(0, 60), .08, 'sine', .05, 130); S.mkScr = true; S.spark(dp.tx, dp.ty, 5, ['#fff', '#ffe9b0'], 90, 200, .35); S.mkScr = false; }
        }
      },
      leave: tk => { const k = D.k; if (k.bld && k.bld.tk === tk) { for (const l of k.bld.layers) if (l.p && k.tray.length < trayMax()) k.tray.push(l.p); k.bld = null; } },
      draw: { grill: drawGrill, build: drawBuild }
    };
  };
  const shakeKit = X => {
    const { S, c, au, up, toast } = X;
    let D = null;
    const CX = 468, CY = 540, POS = ['Left', 'Middle', 'Right'];
    const un = (arr, day) => arr.filter(t => t.day <= day);
    const acc2 = (want, got) => { const tot = Math.max(want.length, got.length); if (!tot) return 1; const w = want.slice(); let m = 0; for (const g of got) { const i = w.indexOf(g); if (i >= 0) { m++; w.splice(i, 1); } } return m / tot; };
    const gen = (day, critic) => {
      const mixes = un(SH.MIX, day), driz = un(SH.DRIZ, day), spr = un(SH.SPR, day), tops = un(SH.TOP, day);
      const nm = critic ? 2 : day < 3 ? 1 : rint(1, 2), mix = shuffle(mixes.slice()).slice(0, Math.min(nm, mixes.length)).map(m => m.id);
      const nt = critic ? 3 : day < 2 ? 1 : day < 5 ? rint(1, 2) : rint(1, 3), pos = shuffle([0, 1, 2]).slice(0, nt).sort();
      const tp = pos.map(p => ({ t: pick(tops).id, p }));
      const dz = Math.random() < .2 && !critic ? 'none' : pick(driz.filter(d => d.id !== 'none')).id;
      const sp = Math.random() < .3 && !critic ? 'none' : pick(spr.filter(d => d.id !== 'none')).id;
      const size = pick(SH.SIZE).id;
      let price = SH.SIZEB[size].price + mix.reduce((a, m) => a + SH.MIXB[m].price, 0) + tp.reduce((a, t) => a + SH.TOPB[t.t].price, 0) + (dz !== 'none' ? .3 : 0) + (sp !== 'none' ? .2 : 0);
      price *= 1 + .15 * up('cups');
      return { size, mix, syrup: pick(un(SH.SYR, day)).id, blend: pick(un(SH.BLEND, day)).id, driz: dz, spr: sp, tops: tp, price: Math.round(price * 20) / 20 };
    };
    const row = (x, y, w, lab, val, ok) => { S.text(lab, x + 12, y, 12, '#8a7a5a', 'left', null, 900); const lw = Math.min(90, S.tw(tr(lab), 12) + 8); S.text(val, x + 16 + lw, y, S.fit(tr(val), w - lw - 54, 14), '#2a2438', 'left', null, 900); if (ok != null) tick2(c, x + w - 32, y - 9, ok); };
    const ticket = (tk, x, y, w, live, bubble) => {
      const h = 290;
      S.panel(x, y, w, h, { fill: '#fffdf2', line: '#7a5a2a', r: 8, lw: 3, sh: 4 });
      tkHead(S, c, tk, x, y, w, bubble);
      const L = live || {};
      row(x, y + 62, w, 'CUP', SH.SIZEB[tk.size].n, L.size == null ? null : L.size === tk.size);
      row(x, y + 88, w, 'FLAVOUR', SH.SYRB[tk.syrup].n, L.syrup == null ? null : L.syrup === tk.syrup);
      S.text('MIX-INS', x + 12, y + 114, 12, '#8a7a5a', 'left', null, 900);
      tk.mix.forEach((m, i) => { shMixIcon(c, m, x + 90 + i * 70, y + 114, .9); S.text(SH.MIXB[m].n.split(' ')[0], x + 106 + i * 70, y + 114, S.fit(tr(SH.MIXB[m].n.split(' ')[0]), 46, 10), '#2a2438', 'left', null, 800); });
      if (L.mix) tick2(c, x + w - 32, y + 105, acc2(tk.mix, L.mix) === 1);
      row(x, y + 140, w, 'BLEND', SH.BLENDB[tk.blend].n, L.blend == null ? null : L.blend);
      row(x, y + 166, w, 'SAUCE', SH.DRIZB[tk.driz].n, L.driz == null ? null : L.driz);
      row(x, y + 192, w, 'SPRINKLES', SH.SPRB[tk.spr].n, L.spr == null ? null : L.spr);
      S.text('TOPPINGS', x + 12, y + 218, 12, '#8a7a5a', 'left', null, 900);
      for (let p = 0; p < 3; p++) {
        const bx = x + 18 + p * ((w - 36) / 3), bw = (w - 36) / 3 - 6, t = tk.tops.find(q => q.p === p), got = L.tops ? L.tops.find(q => q.p === p) : null;
        rrp(c, bx, y + 230, bw, 50, 8); c.fillStyle = got ? (t && got.t === t.t ? '#c9f2d2' : '#ffd0d0') : '#f4eedc'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#c4b898'; c.stroke();
        if (t) shTopping(c, t.t, bx + bw / 2, y + 252, .9);
        S.text(POS[p], bx + bw / 2, y + 273, S.fit(tr(POS[p]), bw - 6, 9), '#8a7a5a', 'center', null, 900);
      }
      return h;
    };
    const ensure = (key, from, to) => { const k = D.k; if (k[key] && k[key].tk.state === to) return; const tk = X.next(from); if (!tk) { k[key] = null; return; } k[key] = key === 'bld' ? { tk, size: null, mix: [], syrup: null, fill: 0, pump: null, drops: [] } : { tk, cream: 0, driz: [], dAmt: 0, dType: null, spr: [], sN: 0, sType: null, tops: [], tool: null, last: null }; tk.state = to; };
    const focus = tk => { const k = D.k; if (tk.state !== 'new' || (k.bld && (k.bld.size || k.bld.mix.length))) return; if (k.bld) k.bld.tk.state = 'new'; k.bld = { tk, size: null, mix: [], syrup: null, fill: 0, pump: null, drops: [] }; tk.state = 'building'; };
    const drawBuild = () => {
      X.bg('#ffd9e8', '#f2a6c6');
      c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < 960; x += 40) c.fillRect(x, 124, 20, 476);
      ensure('bld', 'new', 'building');
      const k = D.k, b = k.bld;
      X.sidePanel('', '#b05a86', '#5a1f40');
      if (!b) { X.emptyMsg('No shakes to build', 'Take an order at the Order station (1)', CX); return; }
      const tk = b.tk;
      S.text('CUP', 115, 148, 13, !b.size ? '#ffe14d' : '#f6d4e6', 'center', null, 900);
      SH.SIZE.forEach((s, i) => {
        const x = 18 + i * 66, y = 158, sel = b.size === s.id;
        if (S.btn(x, y, 60, 60, '', { color: sel ? '#ffe14d' : '#fff3f8', enabled: !b.mix.length && b.fill <= 0, r: 12 })) { b.size = s.id; au.tone(440, .08, 'sine', .05); }
        shCup(c, x + 30, y + 44, s.id, { k: .22 + i * .02 });
        S.text(s.n, x + 30, y + 52, S.fit(tr(s.n), 56, 10), '#2a2438', 'center', null, 900);
      });
      S.text('MIX-INS', 115, 236, 13, b.size && b.fill <= 0 ? '#ffe14d' : '#f6d4e6', 'center', null, 900);
      un(SH.MIX, D.day).forEach((m, i) => {
        const x = 18 + (i % 3) * 66, y = 246 + Math.floor(i / 3) * 62, on = !!b.size && b.fill <= 0 && b.mix.length < 3;
        if (S.btn(x, y, 60, 56, '', { color: '#fff3f8', enabled: on, r: 12 })) { b.mix.push(m.id); for (let j = 0; j < 6; j++) b.drops.push({ m: m.id, x: CX + rnd(-24, 24), y: 300 - j * 14, vy: 0 }); au.noise(.08, .06, 900, 0, 'lowpass'); au.tone(330, .06, 'sine', .04, 220); }
        c.save(); if (!on) c.globalAlpha = .5; shMixIcon(c, m.id, x + 30, y + 22, 1.1); c.restore();
        S.text(m.n.split(' ')[0], x + 30, y + 46, S.fit(tr(m.n.split(' ')[0]), 56, 10), '#2a2438', 'center', null, 900);
      });
      const sy0 = 246 + Math.ceil(un(SH.MIX, D.day).length / 3) * 62 + 8;
      S.text('FLAVOUR (HOLD)', 115, sy0, 12, b.size ? '#ffe14d' : '#f6d4e6', 'center', null, 900);
      un(SH.SYR, D.day).forEach((s, i) => {
        const x = 18 + (i % 3) * 66, y = sy0 + 10 + Math.floor(i / 3) * 56, on = !!b.size && (!b.syrup || b.syrup === s.id), hov = on && S.inside(x, y, 60, 50);
        rrp(c, x, y, 60, 50, 10); c.fillStyle = on ? (b.pump === s.id ? '#ffe14d' : hov ? '#fff' : '#fff3f8') : '#c9a0b6'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        c.fillStyle = s.col; rrp(c, x + 20, y + 8, 20, 22, 5); c.fill(); c.lineWidth = 2; c.stroke(); c.fillStyle = '#e8e8e8'; c.fillRect(x + 26, y + 3, 8, 6);
        S.text(s.n, x + 30, y + 40, S.fit(tr(s.n), 56, 10), '#2a2438', 'center', null, 900);
        if (hov) S.cursor = 'pointer';
        if (on && S.pressIn(x, y, 60, 50)) { b.pump = s.id; b.syrup = s.id; }
      });
      if (b.pump && !S.down) b.pump = null;
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(CX, CY + 4, 110, 16, 0, 0, TAU); c.fill();
      if (b.size) {
        const sy = b.syrup ? SH.SYRB[b.syrup].col : '#f6ead0', cup = shCup(c, CX, CY, b.size, { k: 1.5, fill: b.fill, col: sy, mix: b.mix, seed: tk.id, line: true });
        for (const d of b.drops) shMixIcon(c, d.m, d.x, d.y, .6);
        if (b.pump) { c.fillStyle = SH.SYRB[b.pump].col; c.fillRect(CX - 5, 170, 10, Math.max(0, cup.top + 20 - 170)); c.strokeStyle = 'rgba(42,36,56,.4)'; c.lineWidth = 2; c.strokeRect(CX - 5, 170, 10, Math.max(0, cup.top + 20 - 170)); }
        c.fillStyle = '#c0c6d0'; rrp(c, CX - 40, 140, 80, 34, 8); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        S.text(tr('Fill {n}%', { n: Math.round(b.fill * 100) }), CX + 140, CY - 40, 16, b.fill > 1.06 ? '#c0392b' : '#5a1f40', 'left');
      } else S.text('Pick a cup size', CX, 330, 24, '#5a1f40');
      const step = !b.size ? '1. Pick the cup size' : b.fill <= 0 ? '2. Add the mix-ins, then hold a flavour pump' : '3. Fill to the dotted line';
      S.panel(CX - 200, 186, 400, 28, { fill: 'rgba(42,36,56,.82)', r: 14, lw: 0, sh: 0 }); S.text(step, CX, 200, S.fit(tr(step), 380, 14), '#fff');
      if (S.btn(CX - 220, 552, 90, 40, 'Redo', { color: '#8a7fa8', size: 14, enabled: !!b.size })) { k.bld = { tk, size: null, mix: [], syrup: null, fill: 0, pump: null, drops: [] }; }
      if (S.btn(CX + 110, 552, 120, 40, 'To blender', { color: '#e8584a', size: 15, enabled: !!b.size && b.fill > .2 && !b.pump })) {
        const fa = clamp(1 - Math.abs(b.fill - 1) * 5, 0, 1);
        tk.sc.build = Math.round(100 * (.2 * (b.size === tk.size ? 1 : 0) + .35 * acc2(tk.mix, b.mix) + .15 * (b.syrup === tk.syrup ? 1 : 0) + .3 * fa));
        tk.made = { size: b.size, mix: b.mix.slice(), syrup: b.syrup, fill: b.fill }; tk.state = 'tray'; k.bld = null;
        au.tone(392, .1, 'triangle', .07, 523);
      }
      ticket(tk, 712, 132, 240, { size: b.size, syrup: b.syrup, mix: b.mix.length ? b.mix : null });
      X.tipBox('Pick the cup, add each mix-in once, then hold the flavour pump and let go at the dotted line.');
    };
    const drawBlend = () => {
      X.bg('#cfe8ff', '#8fbde6');
      X.sidePanel('READY TO BLEND', '#3a6a9a', '#1a3450');
      const k = D.k, tray = D.tickets.filter(t => t.state === 'tray').sort((a, b) => a.id - b.id), free = k.blenders.find(s => !s.tk);
      tray.slice(0, 5).forEach((tk, i) => {
        const x = 18, y = 164 + i * 84;
        rrp(c, x, y, 194, 76, 10); c.fillStyle = '#f2f8ff'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        shCup(c, x + 36, y + 68, tk.made.size, { k: .34, fill: tk.made.fill, col: SH.SYRB[tk.made.syrup].col, mix: tk.made.mix, seed: tk.id });
        S.text('#' + tk.id, x + 76, y + 20, 16, '#2a2438', 'left'); S.text(tk.cu.L.n, x + 76, y + 40, S.fit(tk.cu.L.n, 110, 12), '#6a5a7a', 'left', null, 800); S.text(SH.BLENDB[tk.blend].n, x + 76, y + 60, 13, '#2f6db5', 'left');
        const hov = S.hover(x, y, 194, 76);
        if (hov) { S.cursor = free ? 'pointer' : 'not-allowed'; rrp(c, x, y, 194, 76, 10); c.lineWidth = 4; c.strokeStyle = free ? '#3ecf6c' : '#e63946'; c.stroke(); }
        if (S.clickIn(x, y, 194, 76)) { if (free) { free.tk = tk; free.v = 0; free.on = false; tk.state = 'blending'; au.tone(300, .08, 'square', .04); } else toast('All blenders are busy'); }
      });
      if (!tray.length) { S.text('Nothing waiting', 114, 330, 15, '#e8f4ff', 'center', null, 800); S.text('Build a shake first', 114, 352, 13, '#c8dcf0', 'center', null, 700); }
      const n = k.blenders.length, ax = 236, aw = 960 - ax - 12, sw = (aw - (n - 1) * 12) / n;
      k.blenders.forEach((s, i) => {
        const x = ax + i * (sw + 12), cx = x + sw / 2, y = 134;
        rrp(c, x, y, sw, 452, 16); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a3450'; c.stroke();
        c.fillStyle = '#3a3a44'; rrp(c, cx - 70, 470, 140, 56, 10); c.fill(); c.lineWidth = 3; c.strokeStyle = '#14141a'; c.stroke();
        c.fillStyle = s.on ? '#3ecf6c' : '#8a8a96'; c.beginPath(); c.arc(cx + 46, 498, 8, 0, TAU); c.fill();
        c.fillStyle = '#c0c6d0'; rrp(c, cx - 14, 150, 28, 110, 6); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        const wob = s.on ? Math.sin(S.t * 60) * 2 : 0;
        c.fillStyle = '#9aa3ad'; c.fillRect(cx - 3 + wob, 256, 6, 80);
        if (s.tk) {
          const tk = s.tk, m = tk.made;
          shCup(c, cx + wob, 468, m.size, { k: 1, fill: m.fill, col: SH.SYRB[m.syrup].col, mix: m.mix, seed: tk.id, blend: s.v });
          if (s.on) for (let j = 0; j < 3; j++) { const a = S.t * 18 + j * 2.1; c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(cx + Math.cos(a) * 18, 420 + Math.sin(a) * 8, 3, 0, TAU); c.fill(); }
          const mx2 = x + 14, my = 170, mh = 260;
          rrp(c, mx2, my, 18, mh, 9); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#2a2438'; c.stroke();
          const fh = mh * clamp(s.v / 1.3, 0, 1); rrp(c, mx2 + 3, my + mh - fh, 12, Math.max(0, fh - 3), 6); c.fillStyle = s.v > 1.15 ? '#e63946' : '#4cc9f0'; c.fill();
          for (const bl of SH.BLEND) { const ty = my + mh - mh * bl.v / 1.3, tgt = bl.id === tk.blend && up('meter'); c.fillStyle = tgt ? '#3ecf6c' : '#2a2438'; c.fillRect(mx2 - 4, ty - 1.5, 26, 3); S.text(bl.n.slice(0, 1), mx2 + 30, ty, 11, tgt ? '#1f6f3a' : '#2a2438', 'left', null, 900); }
          S.text(`#${tk.id}  ${tr(SH.BLENDB[tk.blend].n)}`, cx, 546, S.fit(`#${tk.id}  ${tr(SH.BLENDB[tk.blend].n)}`, sw - 16, 15), '#1a3450', 'center', null, 900);
          if (!s.on && s.v <= 0) { if (S.btn(cx - 56, 552, 112, 30, 'Blend', { color: '#3ecf6c', size: 15, r: 10 }) || (!S.lock && S.key('Digit' + (i + 5)))) { s.on = true; au.tone(110, .3, 'sawtooth', .03, 160); } }
          else if (S.btn(cx - 56, 552, 112, 30, 'Stop', { color: '#e8584a', size: 15, r: 10 }) || (!S.lock && S.key('Digit' + (i + 5)))) stopB(s);
        } else {
          S.text('EMPTY', cx, 380, 20, 'rgba(26,52,80,.45)');
          if (S.btn(cx - 56, 552, 112, 30, 'Load', { color: tray.length ? '#3ecf6c' : '#8a8498', size: 15, enabled: tray.length > 0, r: 10 })) { s.tk = tray[0]; s.v = 0; s.on = false; tray[0].state = 'blending'; }
        }
      });
      if (X.sv.served < 3) { S.panel(240, 136, 460, 28, { fill: 'rgba(20,16,30,.8)', r: 12, lw: 0, sh: 0 }); S.text('Press Blend, then Stop at the mark the ticket asks for: Chunky, Regular or Smooth.', 470, 150, S.fit(tr('Press Blend, then Stop at the mark the ticket asks for: Chunky, Regular or Smooth.'), 440, 12, 800), '#fff', 'center', null, 800); }
    };
    const stopB = s => {
      const tk = s.tk; if (!tk) return;
      const e = Math.abs(s.v - SH.BLENDB[tk.blend].v);
      tk.sc.blend = Math.round(e <= .04 ? 100 : Math.max(0, 100 - (e - .04) * 260)); tk.blendV = s.v;
      tk.state = 'top'; s.tk = null; s.on = false; s.v = 0;
      S.pop(470, 300, tk.sc.blend >= 95 ? 'PERFECT!' : tk.sc.blend >= 75 ? 'Nice blend' : tk.sc.blend >= 45 ? 'Meh...' : 'Ouch!', tk.sc.blend >= 95 ? '#ffe14d' : '#fff', 26);
      au.tone(523, .1, 'triangle', .05); au.tone(659, .12, 'triangle', .05, 0, .08);
    };
    const drawTop = () => {
      X.bg('#fff0c8', '#f2c88a');
      const k = D.k, sv2 = D.serving;
      if (!sv2) ensure('top', 'top', 'topping');
      const b = k.top;
      X.sidePanel('', '#a8703c', '#4a2a12');
      if (sv2 && k.anim && k.anim.tk === sv2.tk) {
        const t = clamp(sv2.t / .6, 0, 1); c.save(); c.translate(0, -eo(t) * 30); drawCupTop(k.anim.b, k.anim.tk); c.restore();
        if (sv2.t > .6) { const kk = eo((sv2.t - .6) / .4); c.save(); c.globalAlpha = kk; S.panel(CX - 130, 300, 260, 80, { fill: '#fff', r: 14 }); S.text('Order up!', CX, 340, 30, '#2a2438'); c.restore(); }
        return;
      }
      if (!b) { X.emptyMsg('No shakes to top', 'Blend a shake first (3)', CX); return; }
      const tk = b.tk, tools = [{ k: 'cream', n: 'Whipped Cream' }].concat(un(SH.DRIZ, D.day).filter(d => d.id !== 'none').map(d => ({ k: 'driz', id: d.id, n: d.n, col: d.col })), un(SH.SPR, D.day).filter(d => d.id !== 'none').map(d => ({ k: 'spr', id: d.id, n: d.n, cols: d.cols })), un(SH.TOP, D.day).map(d => ({ k: 'top', id: d.id, n: d.n })));
      tools.forEach((tl, i) => {
        const x = 18 + (i % 3) * 66, y = 138 + Math.floor(i / 3) * 62, sel = b.tool && b.tool.k === tl.k && b.tool.id === tl.id, hov = S.hover(x, y, 60, 56);
        const dis = (tl.k === 'driz' && b.dType && b.dType !== tl.id) || (tl.k === 'spr' && b.sType && b.sType !== tl.id);
        rrp(c, x, y, 60, 56, 10); c.fillStyle = dis ? '#c9b8a0' : sel ? '#ffe14d' : hov ? '#fff8e0' : '#fff3dc'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
        c.save(); if (dis) c.globalAlpha = .45;
        if (tl.k === 'cream') shCream(c, x + 30, y + 30, 40, 1, .6);
        else if (tl.k === 'driz') { c.fillStyle = tl.col; rrp(c, x + 21, y + 8, 18, 26, 6); c.fill(); c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(x + 26, y + 8); c.lineTo(x + 30, y + 2); c.lineTo(x + 34, y + 8); c.fill(); }
        else if (tl.k === 'spr') { rrp(c, x + 20, y + 8, 20, 26, 5); c.fillStyle = '#f4f4f8'; c.fill(); c.lineWidth = 2; c.stroke(); for (let j = 0; j < 6; j++) { c.fillStyle = tl.cols[j % tl.cols.length]; c.fillRect(x + 23 + (j % 3) * 5, y + 16 + Math.floor(j / 3) * 7, 3, 4); } }
        else shTopping(c, tl.id, x + 30, y + 24, 1.1);
        c.restore();
        S.text(tl.n.split(' ')[0], x + 30, y + 47, S.fit(tr(tl.n.split(' ')[0]), 56, 10), '#2a2438', 'center', null, 900);
        if (hov && !dis) S.cursor = 'pointer';
        if (!dis && S.clickIn(x, y, 60, 56)) { b.tool = { k: tl.k, id: tl.id }; au.tone(520, .06, 'sine', .05); }
      });
      const g = drawCupTop(b, tk);
      const tool = b.tool, overCup = S.inside(CX - g.w / 2 - 20, g.top - 120, g.w + 40, 160);
      if (tool && tool.k === 'driz' && S.down && overCup && !S.downBtn && !S.lock) {
        const p = [clamp(S.mx, CX - g.w * .4, CX + g.w * .4), clamp(S.my, g.cTop - g.cH * .95, g.cTop - 6)];
        if (!b.last || Math.hypot(p[0] - b.last[0], p[1] - b.last[1]) > 6) { if (b.last && b.driz.length < 300) b.driz.push([b.last[0] - CX, b.last[1] - g.cTop, p[0] - CX, p[1] - g.cTop]); b.dAmt += b.last ? Math.hypot(p[0] - b.last[0], p[1] - b.last[1]) / 520 : 0; b.dType = tool.id; b.last = p; }
      } else b.last = null;
      if (tool && tool.k === 'spr' && S.clickIn(CX - g.w / 2 - 20, g.top - 120, g.w + 40, 160)) { b.sType = tool.id; b.sN++; const cols = SH.SPRB[tool.id].cols; for (let j = 0; j < 14; j++) b.spr.push([rnd(-g.w * .38, g.w * .38), rnd(-g.cH * .9, -4), cols[j % cols.length], rnd(0, 3)]); au.noise(.18, .06, 6000, 0, 'highpass'); }
      if (tool && tool.k === 'top') {
        for (let p = 0; p < 3; p++) {
          const px = CX + (p - 1) * g.w * .3, py = g.cTop - g.cH * (p === 1 ? .9 : .5), hov = S.hover(px - 26, py - 26, 52, 52);
          c.setLineDash([4, 4]); c.strokeStyle = hov ? '#e8584a' : 'rgba(42,36,56,.5)'; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, 20, 0, TAU); c.stroke(); c.setLineDash([]);
          if (hov) S.cursor = 'pointer';
          if (S.clickIn(px - 26, py - 26, 52, 52)) { b.tops = b.tops.filter(q => q.p !== p); b.tops.push({ t: tool.id, p }); au.tone(660, .06, 'sine', .05); au.noise(.06, .05, 900, 0, 'lowpass'); }
        }
        c.save(); c.globalAlpha = .85; shTopping(c, tool.id, S.mx, S.my, 1.4); c.restore();
      }
      const ck = tool && tool.k === 'cream';
      S.panel(CX - 210, 136, 420, 28, { fill: 'rgba(42,36,56,.82)', r: 14, lw: 0, sh: 0 });
      const hint = !tool ? 'Pick a tool on the left' : ck ? 'Hold on the shake to pipe cream up to the line' : tool.k === 'driz' ? 'Hold and move over the cream to drizzle' : tool.k === 'spr' ? 'Click the shake to shake sprinkles (about 3 times)' : 'Click a spot: left, middle or right';
      S.text(hint, CX, 150, S.fit(tr(hint), 400, 14), '#fff');
      if (S.btn(CX - 220, 552, 90, 40, 'Redo', { color: '#8a7fa8', size: 14 })) { k.top = { tk, cream: 0, driz: [], dAmt: 0, dType: null, spr: [], sN: 0, sType: null, tops: [], tool: null, last: null }; }
      if (S.btn(CX + 110, 552, 120, 40, 'Serve', { color: '#e8584a', size: 17, enabled: b.cream > .1 }) || (b.cream > .1 && !S.lock && S.key('Enter'))) {
        const cr = clamp(1 - Math.abs(b.cream - 1) * 3, 0, 1);
        const dz = tk.driz === 'none' ? (b.dAmt > 0 ? .4 : 1) : (b.dType === tk.driz ? 1 : .2) * clamp(b.dAmt >= .6 && b.dAmt <= 1.6 ? 1 : b.dAmt < .6 ? b.dAmt / .6 : 1 - (b.dAmt - 1.6) * .5, 0, 1);
        const sp = tk.spr === 'none' ? (b.sN ? .4 : 1) : (b.sType === tk.spr ? 1 : .2) * clamp(1 - Math.abs(b.sN - 3) * .3, 0, 1);
        const tw = tk.tops.length, tg = b.tops.length, tm = tk.tops.filter(q => b.tops.some(r => r.p === q.p && r.t === q.t)).length, ta = Math.max(tw, tg) ? tm / Math.max(tw, tg) : 1;
        tk.sc.top = Math.round(100 * (.25 * cr + .2 * dz + .15 * sp + .4 * ta));
        k.anim = { tk, b }; k.top = null; X.serve(tk);
      }
      const live = { size: tk.made.size, syrup: tk.made.syrup, mix: tk.made.mix, blend: (tk.sc.blend || 0) >= 75, driz: tk.driz === 'none' ? b.dAmt === 0 : b.dType === tk.driz && b.dAmt >= .6, spr: tk.spr === 'none' ? b.sN === 0 : b.sType === tk.spr && b.sN >= 2, tops: b.tops };
      ticket(tk, 712, 132, 240, live);
      S.text(tr('Cream {n}%', { n: Math.round(b.cream * 100) }), CX + 150, CY - 60, 15, b.cream > 1.1 ? '#c0392b' : '#4a2a12', 'left');
    };
    const drawCupTop = (b, tk) => {
      const m = tk.made, k = 1.5, cup = shCup(c, CX, CY, m.size, { k, fill: m.fill, col: SH.SYRB[m.syrup].col, mix: m.mix, seed: tk.id, blend: tk.blendV || 1 });
      const w = SH.SIZEB[m.size].w * k, cTop = cup.top + 4;
      if (!b.cream) { c.setLineDash([6, 5]); c.strokeStyle = 'rgba(42,36,56,.5)'; c.lineWidth = 2; const ly = cTop - 22 * k * 2.6; c.beginPath(); c.moveTo(CX - w * .3, ly); c.lineTo(CX + w * .3, ly); c.stroke(); c.setLineDash([]); }
      const ch = shCream(c, CX, cTop, w * .92, b.cream, k);
      if (b.cream > 0) { c.setLineDash([6, 5]); c.strokeStyle = 'rgba(42,36,56,.5)'; c.lineWidth = 2; const ly = cTop - 22 * k * 2.6; c.beginPath(); c.moveTo(CX - w * .45, ly); c.lineTo(CX - w * .3, ly); c.moveTo(CX + w * .3, ly); c.lineTo(CX + w * .45, ly); c.stroke(); c.setLineDash([]); }
      if (b.driz.length && b.dType) { c.save(); c.strokeStyle = SH.DRIZB[b.dType].col; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); for (const s of b.driz) { c.moveTo(CX + s[0], cTop + s[1]); c.lineTo(CX + s[2], cTop + s[3]); } c.stroke(); c.restore(); }
      for (const s of b.spr) { c.save(); c.translate(CX + s[0], cTop + s[1] * clamp(b.cream, .2, 1.2)); c.rotate(s[3]); c.fillStyle = s[2]; c.fillRect(-3, -1, 6, 2.4); c.restore(); }
      const cH = Math.max(ch, 22 * k * 2.6 * .4);
      for (const t of b.tops) shTopping(c, t.t, CX + (t.p - 1) * w * .3, cTop - cH * (t.p === 1 ? .9 : .5), 1.3);
      return { top: cup.top, w, cTop, cH };
    };
    return {
      id: 'shake', n: 'Shake Bar', food: 'Shake', unlock: 5, pat: .92, gap: .9, ups: SH.UPS,
      th: { wall: ['#fff0f6', '#ffd6e8'], trim: ['#8e44ad', '#b66fd6'], sign: '#ff6fb5', signT: '#fff', counter: ['#5a3a6a', '#f0d8f0', '#c8a0d0'], bar: ['#ff6fb5', '#d94a95'], tab: '#c86fd6', intro: ['#ffd1e8', '#b66fd6'] },
      st: [{ id: 'build', n: 'Build' }, { id: 'blend', n: 'Blend' }, { id: 'top', n: 'Top' }],
      rows: [['Building', 'build'], ['Blending', 'blend'], ['Topping', 'top']],
      hint0: 'Click the customer to take the order. Build (2), blend (3), then top the shake (4).',
      help: [['BUILD', 'Pick the cup size, add each mix-in on the ticket once, then hold the flavour pump and let go at the dotted line.'], ['BLEND', 'Load the cup into a blender, press Blend, then Stop at the right mark: Chunky, Regular or Smooth. Blenders keep running while you work elsewhere.'], ['TOP', 'Pipe whipped cream up to the line, drizzle the sauce, shake the sprinkles and put each topping on the left, middle or right spot.']],
      menu: day => un(SH.TOP, day).map(t => (x, y) => shTopping(c, t.id, x, y, .9)).concat(un(SH.MIX, day).map(m => (x, y) => shMixIcon(c, m.id, x, y, .8))),
      newItems: day => [].concat(SH.SYR.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => { c.fillStyle = t.col; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2.5; c.stroke(); } })), SH.MIX.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => shMixIcon(c, t.id, x, y, .9) })), SH.TOP.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => shTopping(c, t.id, x, y, .9) })), SH.DRIZ.filter(t => t.day === day && t.id !== 'none').map(t => ({ n: t.n, d: (x, y) => { c.fillStyle = t.col; rrp(c, x - 7, y - 11, 14, 22, 5); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2; c.stroke(); } })), SH.SPR.filter(t => t.day === day && t.id !== 'none').map(t => ({ n: t.n, d: (x, y) => { for (let j = 0; j < 6; j++) { c.fillStyle = t.cols[j % t.cols.length]; c.fillRect(x - 8 + (j % 3) * 6, y - 5 + Math.floor(j / 3) * 7, 4, 4); } } })), SH.BLEND.filter(t => t.day === day).map(t => ({ n: t.n, d: (x, y) => { c.fillStyle = '#4cc9f0'; rrp(c, x - 5, y - 11, 10, 22, 5); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2; c.stroke(); } }))),
      icon: (x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 46, 46, 8, 0, 0, TAU); c.fill(); const cup = shCup(c, 0, 46, 'm', { k: .62, fill: 1, col: '#f48fb1', mix: ['strawb'], blend: 1, seed: 4 }); shCream(c, 0, cup.top + 3, 52, 1, .62); shTopping(c, 'cherry', 0, cup.top - 34, 1.1); c.strokeStyle = '#e63946'; c.lineWidth = 5; c.beginPath(); c.moveTo(12, cup.top - 4); c.lineTo(26, cup.top - 50); c.stroke(); c.restore(); },
      floaty: t => { const ids = ['cherry', 'wafer', 'cookie', 'gummy', 'straw', 'choc']; for (let i = 0; i < 14; i++) shTopping(c, ids[i % 6], (i * 143 + t * 18) % 1020 - 30, ((i * 91) % 520) + 40, 1.8 + (i % 3) * .4); },
      gen, ticket, focus,
      mini: (c2, x, y, tk) => shMini(c2, x, y, 1, tk),
      stage: tk => ({ new: ['BUILD', '#9aa3ad', 'build'], building: ['BUILD', '#9aa3ad', 'build'], tray: ['BLEND', '#ffa94d', 'blend'], blending: ['BLENDER', '#e63946', 'blend'], top: ['TOP', '#4cc9f0', 'top'], topping: ['TOP', '#4cc9f0', 'top'], serving: ['SERVE', '#3ecf6c', 'top'] })[tk.state] || ['', '#9aa3ad', null],
      isSel: tk => !!((D.k.bld && D.k.bld.tk === tk) || (D.k.top && D.k.top.tk === tk)),
      badge: id => id === 'build' ? D.tickets.filter(t => t.state === 'new' || t.state === 'building').length : id === 'blend' ? D.tickets.filter(t => t.state === 'tray').length + D.k.blenders.filter(s => s.tk && s.on && s.v >= SH.BLENDB[s.tk.blend].v - .05).length : D.tickets.filter(t => t.state === 'top' || t.state === 'topping').length,
      dayInit: d => { D = d; D.day = X.RS.day; D.k = { bld: null, top: null, anim: null, blenders: [] }; for (let i = 0; i < 2 + up('blender'); i++) D.k.blenders.push({ tk: null, v: 0, on: false }); },
      tick: dt => {
        const k = D.k, b = k.bld;
        if (b) {
          if (b.pump && S.down) { const slow = up('line') && b.fill > .9 && b.fill < 1.05 ? .3 : 1; b.fill = Math.min(1.2, b.fill + dt * .34 * slow); if (Math.random() < dt * 12 && D.station === 'build') au.noise(.05, .02, 1200, 0, 'lowpass'); }
          for (const d of b.drops) { d.vy += 1600 * dt; d.y += d.vy * dt; }
          const floor = CY - 30; b.drops = b.drops.filter(d => d.y < floor);
        }
        for (const s of k.blenders) {
          if (!s.tk || !s.on) continue;
          const t0 = SH.BLENDB[s.tk.blend].v, v0 = s.v; s.v += dt / 7;
          if (v0 < t0 && s.v >= t0) { au.tone(1320, .15, 'sine', .05); if (D.station !== 'blend') toast('A shake is at its blend mark'); }
          if (s.v >= 1.3) { stopB(s); toast('A shake was over-blended'); }
        }
        const t = k.top;
        if (t && t.tool && t.tool.k === 'cream' && S.down && !S.downBtn && !S.lock && D.station === 'top' && S.mx > 236 && S.mx < 700 && S.my > 170 && S.my < 540) { const lim = up('cream') ? 1 : 1.5; if (t.cream < lim) { t.cream = Math.min(lim, t.cream + dt * .55); if (Math.random() < dt * 14) au.noise(.06, .025, 3000, 0, 'highpass'); } }
      },
      leave: tk => { const k = D.k; if (k.bld && k.bld.tk === tk) k.bld = null; if (k.top && k.top.tk === tk) k.top = null; k.blenders.forEach(s => { if (s.tk === tk) { s.tk = null; s.on = false; s.v = 0; } }); },
      draw: { build: drawBuild, blend: drawBlend, top: drawTop }
    };
  };
  const mountKitchen = (root, api) => {
    const W = 960, H = 600, S = makeStage(api, W, H), c = S.ctx, au = S.au;
    const music = makeMusic(au, { bpm: 116, root: 261.63, scale: [0, 2, 4, 5, 7, 9, 11], pat: [0, 2, 4, 2, 5, 4, 2, 0, 3, 5, 7, 5, 4, 2, 4, -1], bass: [0, 5, 3, 4], vol: .028, wave: 'triangle' });
    const KIDS = ['pizza', 'burger', 'shake'];
    const defR = () => ({ day: 1, ups: {}, deco: {}, bestDay: 0, served: 0 });
    const defSave = { v: 2, money: 0, pts: 0, served: 0, perfects: 0, tipsTotal: 0, earned: 0, lostTotal: 0, days: 0, tut: 0, mus: true, cur: 'pizza', R: { pizza: defR(), burger: defR(), shake: defR() } };
    const sv = svOnly(defSave, svFix(defSave, api.load()));
    const num = (v, a, b, d) => typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d;
    ['money', 'pts', 'served', 'perfects', 'tipsTotal', 'earned', 'lostTotal', 'days', 'tut'].forEach(k => { sv[k] = num(sv[k], 0, 1e12, 0); });
    if (!KIDS.includes(sv.cur)) sv.cur = 'pizza';
    let K = null, RS = null, scene = 'title', D = null, modal = null, confirmReset = false, toastT = 0, toastS = '', acc = 0;
    const st = { t: 0 };
    const persist = () => { api.save(sv); };
    const toast = s => { toastS = s; toastT = 2.2; };
    const fmtM = v => '$' + v.toFixed(2);
    const rank = () => pzRank(sv.pts);
    const up = id => RS ? RS.ups[id] || 0 : 0;
    const decoPat = () => OU.DECOR.reduce((a, d) => a + (RS && RS.deco[d.id] ? d.pat : 0), 0);
    const worked = () => sv.days + 1;
    const bg = (a, b) => { const g = c.createLinearGradient(0, 124, 0, 600); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 124, W, 476); };
    const sidePanel = (title, col = '#8a5a30', line = '#4a2a12') => { S.panel(8, 128, 214, 466, { fill: col, line, r: 12, lw: 4, sh: 3 }); c.fillStyle = 'rgba(255,255,255,.08)'; rrp(c, 14, 134, 202, 454, 8); c.fill(); if (title) S.text(title, 115, 150, 13, '#ffe9c4', 'center', null, 900); };
    const tipBox = s => { if (sv.served >= 3) return; S.panel(712, 446, 240, 98, { fill: 'rgba(42,36,56,.88)', r: 12, lw: 0, sh: 0 }); S.wrap(s, 724, 456, 216, 17, 14, '#fff', 'left', 700); };
    const emptyMsg = (a, b, x = 560) => { S.text(a, x, 320, 28, '#fff3dc', 'center', '#3a1f0e'); if (b) S.text(b, x, 356, 16, '#fff3dc', 'center', '#3a1f0e', 800); };
    const ctx = {
      S, c, au, W, H, up, toast, bg, sidePanel, tipBox, emptyMsg, fmtM,
      get D() { return D; }, get sv() { return sv; }, get RS() { return RS; },
      serve: tk => { tk.state = 'serving'; D.serving = { tk, t: 0 }; au.noise(.3, .1, 5000, 0, 'highpass', 1500); au.tone(1568, .1, 'triangle', .05); au.tone(1976, .14, 'triangle', .05, 0, .09); },
      next: st2 => D.tickets.filter(t => t.state === st2).sort((a, b) => a.id - b.id)[0] || null,
      go: id => { if (D.station !== id) { D.station = id; au.tone(600, .05, 'sine', .04); } }
    };
    const KITS = { pizza: pizzaKit(ctx), burger: burgerKit(ctx), shake: shakeKit(ctx) };
    svOnly(defSave.R, sv.R);
    KIDS.forEach(k => {
      const r = svOnly(defR(), sv.R[k]), ups = OU.SHARED.concat(KITS[k].ups);
      r.day = Math.floor(num(r.day, 1, 9999, 1)); r.bestDay = num(r.bestDay, 0, 1e9, 0); r.served = num(r.served, 0, 1e9, 0);
      if (!r.ups || typeof r.ups !== 'object' || Array.isArray(r.ups)) r.ups = {};
      if (!r.deco || typeof r.deco !== 'object' || Array.isArray(r.deco)) r.deco = {};
      for (const id of Object.keys(r.ups)) { const u = ups.find(q => q.id === id); if (!u || typeof r.ups[id] !== 'number' || !isFinite(r.ups[id])) delete r.ups[id]; else r.ups[id] = clamp(Math.floor(r.ups[id]), 0, u.max); }
      for (const id of Object.keys(r.deco)) { if (!OU.DECOR.some(d => d.id === id) || r.deco[id] !== true) delete r.deco[id]; }
    });
    if (rank() < KITS[sv.cur].unlock) sv.cur = 'pizza';
    if (!sv.mus && music.on) music.toggle();
    const setKit = id => { K = KITS[id]; RS = sv.R[id]; sv.cur = id; };
    setKit(sv.cur);

    const pool = () => OU.CUST.filter(x => x.day <= worked());
    const startDay = () => {
      const day = RS.day, N = Math.min(16, 6 + Math.floor(day * .9)), gap = Math.max(15, 25 - day * .55) * K.gap;
      const sched = []; let tt = 2;
      for (let i = 0; i < N; i++) { sched.push(tt); tt += gap * rnd(.75, 1.25); }
      const ci = day >= 2 ? (day - 2 + KIDS.indexOf(K.id) * 3) % OU.CRITICS.length : -1;
      D = { t: 0, sched, si: 0, len: tt + 50, N, custs: [], tickets: [], nid: 1, station: 'order', cid: 1, earned: 0, tips: 0, served: 0, lost: 0, scores: [], perfects: 0, ptsGain: 0, critic: ci, criticState: ci < 0 ? 'none' : 'wait', result: null, serving: null, pool: pool(), done: false, k: {} };
      K.dayInit(D);
      scene = 'play'; modal = null; persist();
    };
    const queueLen = () => D.custs.filter(x => x.state === 'queue' || x.state === 'enter').length;
    const benchCount = () => D.custs.filter(x => x.state === 'bench' || x.state === 'toBench').length;
    const spawnCust = critic => {
      let L;
      if (critic) L = OU.CRITICS[D.critic];
      else { const recent = D.custs.slice(-2).map(x => x.L); const cand = D.pool.filter(x => !recent.includes(x)); L = pick(cand.length ? cand : D.pool); }
      const pm = (L.pat || 1) * K.pat * (1 + .1 * up('chairs') + decoPat()) * (1 - Math.min(.3, RS.day * .012)) * (critic ? .85 : 1);
      const o = K.gen(RS.day, critic);
      if (critic) o.price = Math.round(o.price * 1.5 * 20) / 20;
      const cu = { id: D.cid++, L, critic, state: 'enter', x: W + 70, pat: 0, patMax: 115 * pm, tk: null, order: o, talk: 0, t: rnd(0, 5), leave: 0, mood: 0, slot: 0, bob: 0 };
      cu.pat = cu.patMax; D.custs.push(cu);
      au.tone(1318, .12, 'sine', .05); au.tone(1568, .2, 'sine', .05, 0, .1);
    };
    const QX = [190, 300, 410, 520], BXS = [680, 760, 840, 915];
    const moodOf = cu => { const f = cu.pat / cu.patMax; return f > .62 ? 0 : f > .36 ? 1 : f > .16 ? 2 : 3; };
    const takeOrder = cu => {
      if (benchCount() >= 4) { toast('The waiting area is full. Serve someone first!'); au.tone(180, .15, 'sawtooth', .05); return; }
      cu.state = 'ordering'; cu.talk = 2.3;
      au.tone(660, .08, 'sine', .06); au.tone(880, .1, 'sine', .06, 0, .07);
    };
    const finishOrder = cu => {
      const tk = Object.assign({ id: D.nid++, cu, state: 'new', sc: {}, born: D.t }, cu.order);
      cu.tk = tk; D.tickets.push(tk); cu.state = 'toBench'; cu.slot = [0, 1, 2, 3].find(i => !D.custs.some(x => x !== cu && (x.state === 'bench' || x.state === 'toBench') && x.slot === i));
      if (cu.slot == null) cu.slot = 3;
      au.tone(520, .06, 'square', .04); au.noise(.12, .05, 3000, 0, 'highpass');
      if (K.onTicket) K.onTicket(tk);
    };
    const finishServe = tk => {
      const cu = tk.cu, f = clamp(cu.pat / cu.patMax, 0, 1);
      tk.sc.order = Math.round(40 + 60 * clamp(f / .45, 0, 1));
      const keys = ['order'].concat(K.rows.map(r => r[1])), sc = tk.sc;
      const total = Math.round(keys.reduce((a, k) => a + (sc[k] || 0), 0) / keys.length);
      const tipMult = (cu.L.tip || 1) * (1 + .08 * up('tipjar')) * (1 + .02 * (rank() - 1));
      let tip = tk.price * Math.pow(clamp((total - 45) / 55, 0, 1), 1.6) * .42 * tipMult * (cu.critic ? 1.7 : 1);
      if (total >= 95) tip += .75 * tipMult;
      if (total >= 100) tip += .75;
      tip = Math.round(tip * 20) / 20;
      const pay = tk.price;
      D.earned += pay + tip; D.tips += tip; D.served++; D.scores.push(total);
      let pts = Math.round(total / 6 + tip * 1.2) + (total >= 95 ? 5 : 0);
      if (cu.critic) pts = Math.round(pts * 2);
      D.ptsGain += pts; if (total >= 95) D.perfects++;
      sv.money += pay + tip; sv.earned += pay + tip; sv.tipsTotal += tip; sv.served++; RS.served++; if (total >= 95) sv.perfects++;
      cu.state = 'served'; cu.leave = 0; cu.finalMood = total >= 80 ? 0 : total >= 55 ? 1 : total >= 35 ? 2 : 3;
      D.result = { cu, tk, total, tip, pay, t: 0, sc: Object.assign({}, sc), pts };
      tk.state = 'done';
      const snd = total >= 95 ? 3 : total >= 70 ? 2 : 1;
      for (let i = 0; i < snd * 2; i++) au.tone(784 * Math.pow(1.25, i % 4), .12, 'triangle', .06, 0, i * .07);
      au.tone(1568, .3, 'sine', .05, 0, .3);
      if (total >= 90) { S.mkScr = true; S.confetti(W / 2, 330, 36); S.mkScr = false; }
      persist(); api.score(Math.floor(sv.earned));
    };
    const customerLeaves = cu => {
      cu.state = 'angry'; cu.leave = 0; D.lost++; sv.lostTotal++; D.ptsGain -= 8;
      if (cu.tk) { const tk = cu.tk; tk.state = 'gone'; K.leave(tk); if (D.serving && D.serving.tk === tk) D.serving = null; }
      au.tone(220, .3, 'sawtooth', .05, 110);
      toast(tr('{name} got tired of waiting and left', { name: cu.L.n }));
    };
    const updateDay = dt => {
      D.t += dt;
      while (D.si < D.sched.length && D.t >= D.sched[D.si] && queueLen() < 4) { spawnCust(false); D.si++; }
      const regDone = D.si >= D.sched.length && !D.custs.some(x => !x.critic && !['served', 'angry', 'gone'].includes(x.state));
      if (D.criticState === 'wait' && regDone) { D.criticState = 'in'; spawnCust(true); }
      let qi = D.custs.some(x => x.state === 'ordering') ? 1 : 0;
      for (const cu of D.custs) {
        cu.t += dt;
        const active = ['enter', 'queue', 'ordering', 'toBench', 'bench'].includes(cu.state);
        if (active) { cu.pat -= dt * (cu.tk && cu.tk.state === 'serving' ? 0 : 1); if (cu.pat <= 0) { customerLeaves(cu); continue; } }
        if (cu.state === 'enter' || cu.state === 'queue') {
          const tx = QX[Math.min(3, qi++)];
          if (cu.state === 'enter') { cu.x += (tx - cu.x) * Math.min(1, dt * 2.6); cu.bob = Math.sin(cu.t * 12) * 2; if (Math.abs(cu.x - tx) < 3) { cu.state = 'queue'; cu.bob = 0; } }
          else cu.x += (tx - cu.x) * Math.min(1, dt * 6);
        } else if (cu.state === 'ordering') { cu.x += (QX[0] - cu.x) * Math.min(1, dt * 8); cu.talk -= dt; if (cu.talk <= 0) finishOrder(cu); }
        else if (cu.state === 'toBench') { const tx = BXS[cu.slot]; cu.x += (tx - cu.x) * Math.min(1, dt * 3.4); cu.bob = Math.sin(cu.t * 12) * 2; if (Math.abs(cu.x - tx) < 3) { cu.state = 'bench'; cu.bob = 0; } }
        else if (cu.state === 'bench') cu.x += (BXS[cu.slot] - cu.x) * Math.min(1, dt * 6);
        else if (cu.state === 'served' || cu.state === 'angry') { cu.leave += dt; if (cu.leave > .6) { cu.x += dt * 260; cu.bob = Math.sin(cu.t * 14) * 2; } if (cu.x > W + 90) cu.state = 'gone'; }
        cu.mood = cu.state === 'served' ? cu.finalMood : cu.state === 'angry' ? 3 : moodOf(cu);
      }
      D.custs = D.custs.filter(x => x.state !== 'gone');
      D.tickets = D.tickets.filter(t => t.state !== 'gone' || D.t - t.born < 600);
      K.tick(dt);
      if (D.serving) { D.serving.t += dt; if (D.serving.t > 1.1 && !D.result) { const tk = D.serving.tk; D.serving = null; finishServe(tk); } }
      const over = D.si >= D.sched.length && D.criticState !== 'wait' && D.custs.length === 0 && !D.result && !D.serving;
      if (over && !D.done) { D.done = true; endDay(); }
    };
    const endDay = () => {
      const rb = rank();
      sv.pts = Math.max(0, sv.pts + D.ptsGain); RS.bestDay = Math.max(RS.bestDay, D.earned);
      const ra = rank(); RS.day++; sv.days++;
      const nd = RS.day;
      const newItems = K.newItems(nd).map(t => t.n), newCust = OU.CUST.filter(x => x.day === worked()).map(x => x.n);
      const ups = OU.SHARED.concat(K.ups), newUps = ups.filter(u => u.rank.some((r, i) => r > rb && r <= ra && i < u.max)).map(u => u.n).concat(OU.DECOR.filter(d => d.rank > rb && d.rank <= ra).map(d => d.n));
      const newRest = KIDS.filter(k => KITS[k].unlock > rb && KITS[k].unlock <= ra).map(k => KITS[k].n);
      modal = { k: 'dayend', t: 0, day: nd - 1, rb, ra, newItems, newCust, newUps, newRest, avg: D.scores.length ? Math.round(D.scores.reduce((a, b) => a + b, 0) / D.scores.length) : 0, rankPts: sv.pts };
      persist(); api.score(Math.floor(sv.earned)); api.submit(Math.floor(sv.earned));
      au.tone(523, .2, 'triangle', .07); au.tone(659, .2, 'triangle', .07, 0, .15); au.tone(784, .4, 'triangle', .07, 0, .3);
      if (ra > rb) { S.mkScr = true; S.confetti(W / 2, 300, 50); S.mkScr = false; }
    };

    const stars = (x, y, pct, r = 10) => { for (let i = 0; i < 5; i++) star(c, x + i * (r * 2.2), y, r, pct >= (i + 1) * 20 - 6 ? '#ffd23f' : pct >= i * 20 + 8 ? '#ffe9a0' : '#d9d3e6', pct >= i * 20 + 8 ? '#8a5a00' : '#9a94a8'); };
    const hearts = (x, y, f, r = 6) => { for (let i = 0; i < 5; i++) { const on = f > (i + .5) / 5 - .1; heart(c, x + i * r * 2.3, y, r, on ? (f > .6 ? '#ff4d6d' : f > .3 ? '#ffa94d' : '#ff3b3b') : '#d9d3e6', on ? '#5a1020' : '#8a8498'); } };
    const sign = (x, y, w, h, name, sz) => { S.panel(x, y, w, h, { fill: K.th.sign, line: '#3a2a1a', r: 10, lw: 5, sh: 4 }); S.text(name, x + w / 2, y + h / 2 + 1, S.fit(name, w - 24, sz), K.th.signT, 'center', shade(K.th.sign, -.6)); };
    const drawWall = () => {
      const th = K.th, g = c.createLinearGradient(0, 120, 0, 420); g.addColorStop(0, th.wall[0]); g.addColorStop(1, th.wall[1]); c.fillStyle = g; c.fillRect(0, 120, W, 300);
      c.fillStyle = th.trim[0]; c.fillRect(0, 330, W, 90); c.fillStyle = th.trim[1]; for (let x = 0; x < W; x += 60) c.fillRect(x, 330, 30, 90);
      c.fillStyle = shade(th.trim[0], -.4); c.fillRect(0, 326, W, 8);
      c.fillStyle = '#7ed0ee'; rrp(c, 640, 150, 270, 120, 8); c.fill(); c.lineWidth = 6; c.strokeStyle = '#8a5a22'; c.stroke(); c.beginPath(); c.moveTo(775, 150); c.lineTo(775, 270); c.moveTo(640, 210); c.lineTo(910, 210); c.stroke();
      c.fillStyle = '#9be37e'; c.beginPath(); c.moveTo(640, 270); c.quadraticCurveTo(700, 220, 760, 270); c.lineTo(640, 270); c.fill();
      sign(40, 140, 250, 74, K.n, 30);
      S.panel(330, 148, 240, 96, { fill: '#fffaf0', line: '#8a5a22', r: 6, lw: 4, sh: 3 });
      S.text('TODAY', 450, 164, 13, '#c0392b', 'center', null, 900);
      K.menu(RS.day).slice(0, 12).forEach((d, i) => d(352 + (i % 6) * 38, 192 + Math.floor(i / 6) * 30));
      for (const d of OU.DECOR) if (RS.deco[d.id]) decorDraw(c, d.id, S.t);
    };
    const drawCounter = () => {
      c.fillStyle = K.th.counter[0]; c.fillRect(0, 440, W, 160);
      const g = c.createLinearGradient(0, 410, 0, 440); g.addColorStop(0, K.th.counter[1]); g.addColorStop(1, K.th.counter[2]); c.fillStyle = g; c.fillRect(0, 410, W, 30);
      c.fillStyle = '#2a2438'; c.fillRect(0, 438, W, 4); c.fillRect(0, 408, W, 3);
      for (let x = 20; x < W; x += 160) { rrp(c, x, 460, 140, 120, 10); c.fillStyle = shade(K.th.counter[0], .1); c.fill(); c.strokeStyle = shade(K.th.counter[0], -.35); c.lineWidth = 3; c.stroke(); c.fillStyle = shade(K.th.counter[0], .2); rrp(c, x + 10, 470, 120, 100, 8); c.fill(); }
    };
    const drawCust = cu => {
      const s = cu.state === 'bench' || cu.state === 'toBench' ? .78 : .95, y = 412 + (cu.bob || 0);
      pzCust(c, cu.L, cu.x, y, s, cu.mood, cu.t, cu.state === 'ordering', Math.sin(cu.t) * .6);
      if (cu.critic && s > .9) { c.fillStyle = '#ffd23f'; rrp(c, cu.x - 36, y - 140 * s - 6, 72, 18, 8); c.fill(); c.lineWidth = 2; c.strokeStyle = '#8a5a00'; c.stroke(); S.text('CRITIC', cu.x, y - 140 * s + 3, 11, '#6a3a00'); }
    };
    const drawBubble = cu => {
      const x = 250, y = 128, w = 280, f = 1 - clamp(cu.talk / 2.3, 0, 1);
      c.save(); c.globalAlpha = clamp(f * 4, 0, 1);
      const h = K.ticket(Object.assign({ id: 0, cu }, cu.order), x, y, w, null, true);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 4, y + 40); c.lineTo(cu.x + 20, 250); c.lineTo(x + 4, y + 70); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 2, y + 40); c.lineTo(cu.x + 20, 250); c.lineTo(x + 2, y + 70); c.stroke();
      c.restore(); void h;
    };
    const drawOrder = () => {
      drawWall();
      const q = D.custs.filter(x => x.state !== 'bench' && x.state !== 'toBench'), b = D.custs.filter(x => x.state === 'bench' || x.state === 'toBench');
      S.panel(640, 278, 300, 24, { fill: K.th.sign, line: '#3a2a1a', r: 8, lw: 3, sh: 2 }); S.text('WAITING AREA', 790, 290, 13, K.th.signT);
      for (const cu of D.custs) if (cu.state === 'served' || cu.state === 'angry') drawCust(cu);
      for (const cu of b) drawCust(cu);
      for (const cu of q) if (cu.state !== 'served' && cu.state !== 'angry') drawCust(cu);
      drawCounter();
      for (const cu of D.custs) if (cu.state !== 'served' && cu.state !== 'angry') hearts(cu.x - 2 * 2.3 * 7, 460, clamp(cu.pat / cu.patMax, 0, 1), 7);
      for (const cu of b) if (cu.tk) { S.panel(cu.x - 24, 412, 48, 22, { fill: '#fff8e7', r: 8, lw: 2.5, sh: 0 }); S.text('#' + cu.tk.id, cu.x, 424, 14, '#2a2438'); }
      const fc = D.custs.find(x => x.state === 'queue' && Math.abs(x.x - QX[0]) < 6), talking = D.custs.find(x => x.state === 'ordering');
      if (talking) drawBubble(talking);
      if (fc && !talking) {
        const hov = S.hover(fc.x - 50, 290, 100, 130), bob = Math.sin(S.t * 4) * 3;
        S.panel(fc.x - 70, 258 + bob, 140, 28, { fill: hov ? '#ffe14d' : '#fff', r: 14, lw: 3, sh: 3 }); S.text('Take order!', fc.x, 272 + bob, S.fit(tr('Take order!'), 128, 16), '#2a2438');
        c.fillStyle = '#2a2438'; c.beginPath(); c.moveTo(fc.x - 8, 288 + bob); c.lineTo(fc.x, 298 + bob); c.lineTo(fc.x + 8, 288 + bob); c.fill();
        if (hov) S.cursor = 'pointer';
        if (S.clickIn(fc.x - 60, 250, 120, 170) || (!S.lock && (S.key('Space') || S.key('Enter')))) takeOrder(fc);
      }
      const inLine = q.filter(x => x.state === 'queue' || x.state === 'enter').length;
      S.text(tr('{a} in line   ·   {b}/4 waiting', { a: inLine, b: b.length }), 480, 520, 18, '#ffe9c4', 'center', '#3a1f0e');
      S.text(sv.served < 3 ? K.hint0 : 'Customers lose patience over time. Faster service means a better waiting score.', 480, 552, S.fit(tr(sv.served < 3 ? K.hint0 : 'Customers lose patience over time. Faster service means a better waiting score.'), 900, 14, 800), '#fff3dc', 'center', '#3a1f0e', 800);
    };
    const drawRail = () => {
      c.fillStyle = '#3a2a22'; c.fillRect(0, 52, W, 70); c.fillStyle = '#5a4034'; c.fillRect(0, 52, W, 4); c.fillStyle = '#2a1c16'; c.fillRect(0, 118, W, 4);
      const tks = D.tickets.filter(t => t.state !== 'done' && t.state !== 'gone').sort((a, b) => a.id - b.id);
      if (!tks.length) S.text('Orders you take appear here as tickets', W / 2, 88, 15, 'rgba(255,255,255,.4)', 'center', null, 800);
      tks.slice(0, 8).forEach((tk, i) => {
        const x = 10 + i * 118, y = 58, w = 112, h = 60, cu = tk.cu, f = clamp(cu.pat / cu.patMax, 0, 1), sg = K.stage(tk), sel = K.isSel(tk);
        rrp(c, x, y, w, h, 6); c.fillStyle = '#fffdf2'; c.fill(); c.lineWidth = sel ? 4 : 2.5; c.strokeStyle = sel ? '#ffe14d' : '#2a2438'; c.stroke();
        c.save(); rrp(c, x + 3, y + 3, 44, h - 12, 4); c.clip(); K.mini(c, x + 25, y + 31, tk); c.restore();
        S.text('#' + tk.id, x + 52, y + 12, 13, '#2a2438', 'left'); S.text(cu.L.n.split(' ').pop(), x + 52, y + 27, S.fit(cu.L.n.split(' ').pop(), 56, 11), '#6a5a7a', 'left', null, 800);
        rrp(c, x + 50, y + 33, 56, 14, 7); c.fillStyle = sg[1]; c.fill(); S.text(sg[0], x + 78, y + 41, S.fit(tr(sg[0]), 52, 10), '#fff', 'center', null, 900);
        rrp(c, x + 6, y + 52, w - 12, 5, 2.5); c.fillStyle = '#d9d3e6'; c.fill(); rrp(c, x + 6, y + 52, Math.max(4, (w - 12) * f), 5, 2.5); c.fillStyle = f > .6 ? '#3ecf6c' : f > .3 ? '#ffa94d' : '#e63946'; c.fill();
        if (S.clickIn(x, y, w, h) && sg[2]) { ctx.go(sg[2]); if (K.focus) K.focus(tk); }
      });
    };
    const drawTop = () => {
      const g = c.createLinearGradient(0, 0, 0, 52); g.addColorStop(0, K.th.bar[0]); g.addColorStop(1, K.th.bar[1]); c.fillStyle = g; c.fillRect(0, 0, W, 52); c.fillStyle = shade(K.th.bar[1], -.4); c.fillRect(0, 50, W, 3);
      const sh2 = shade(K.th.bar[1], -.5);
      S.text(tr('DAY {n}', { n: D.day }), 14, 17, 18, '#fff', 'left', sh2);
      const prog = clamp(D.t / D.len, 0, 1), mins = Math.floor(prog * 480), hh = 12 + Math.floor(mins / 60), mm = mins % 60;
      S.text(`${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')} PM`, 14, 38, 14, '#ffe9c4', 'left', sh2, 800);
      rrp(c, 92, 30, 90, 8, 4); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); rrp(c, 92, 30, Math.max(6, 90 * prog), 8, 4); c.fillStyle = '#ffe14d'; c.fill();
      const tabs = [['order', 'Order', queueLen()]].concat(K.st.map(s => [s.id, s.n, K.badge(s.id)]));
      tabs.forEach(([id, n, bd], i) => {
        const x = 196 + i * 114;
        if (S.btn(x, 6, 108, 40, n, { color: D.station === id ? '#ffd23f' : K.th.tab, textc: D.station === id ? '#6a3a00' : '#fff', size: 17, badge: bd || null, on: D.station === id, r: 12 }) || (!S.lock && S.key('Digit' + (i + 1)))) ctx.go(id);
      });
      icoCoin(c, 672, 26, 12); S.text(money(sv.money), 690, 26, 19, '#ffe14d', 'left', sh2);
      S.text(tr('{m} today', { m: fmtM(D.earned) }), 690, 44, 11, '#ffe9c4', 'left', null, 800);
      const rk = rank(), p0 = pzRankPts(rk), p1 = pzRankPts(rk + 1);
      S.panel(800, 8, 70, 36, { fill: '#fff8e7', r: 12, lw: 2.5, sh: 2 }); S.text('RANK', 835, 18, 10, '#8a6a3a', 'center', null, 900); S.text(String(rk), 835, 34, 17, '#c0392b');
      rrp(c, 806, 41, 58, 4, 2); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill(); rrp(c, 806, 41, Math.max(3, 58 * clamp((sv.pts - p0) / (p1 - p0), 0, 1)), 4, 2); c.fillStyle = '#3ecf6c'; c.fill();
      if (S.btn(880, 8, 36, 36, '', { color: music.on ? K.th.tab : '#8a7fa8', icon: (x, y) => note(c, x, y), r: 10 })) { music.toggle(); sv.mus = music.on; persist(); }
      if (S.btn(920, 8, 36, 36, '', { color: '#8a7fa8', icon: (x, y) => { c.fillStyle = '#fff'; c.fillRect(x - 6, y - 7, 4, 14); c.fillRect(x + 2, y - 7, 4, 14); }, r: 10 })) modal = { k: 'pause', t: 0 };
    };
    const drawResult = () => {
      const r = D.result; if (!r) return; S.lock = false;
      c.fillStyle = 'rgba(30,18,14,.62)'; c.fillRect(0, 0, W, H);
      const x = 200, y = 80, w = 560, h = 440, k = eo(r.t * 3);
      c.save(); c.translate(W / 2, H / 2); c.scale(.8 + .2 * k, .8 + .2 * k); c.translate(-W / 2, -H / 2); c.globalAlpha = k;
      S.panel(x, y, w, h, { fill: '#fff8e7', r: 22, lw: 4, sh: 7 });
      S.panel(x + 90, y - 18, w - 180, 42, { fill: r.total >= 95 ? '#ffb703' : K.th.tab, r: 14, lw: 3, sh: 3 });
      S.text(r.total >= 95 ? 'PERFECT!' : r.total >= 80 ? 'Great job!' : r.total >= 60 ? 'Pretty good' : r.total >= 40 ? 'Not great...' : 'Yikes!', x + w / 2, y + 4, 24, '#fff', 'center', '#6a2a10');
      c.save(); c.beginPath(); rrp(c, x + 24, y + 38, 150, 170, 14); c.clip(); c.fillStyle = '#ffe9c4'; c.fillRect(x + 24, y + 38, 150, 170); pzCust(c, r.cu.L, x + 99, y + 214, 1.55, r.cu.finalMood, S.t, false, 0); c.restore();
      c.lineWidth = 3; c.strokeStyle = '#2a2438'; rrp(c, x + 24, y + 38, 150, 170, 14); c.stroke();
      S.text(r.cu.L.n, x + 99, y + 228, S.fit(r.cu.L.n, 140, 16), '#2a2438', 'center');
      if (r.cu.critic) S.text('Food critic', x + 99, y + 246, 12, '#c0392b', 'center', null, 800);
      const rows = [['Waiting', r.sc.order]].concat(K.rows.map(([n, kk]) => [n, r.sc[kk] || 0]));
      const rh = Math.min(42, 176 / rows.length);
      rows.forEach(([n, v], i) => {
        const yy = y + 54 + i * rh, show = clamp(r.t * 2.4 - i * .5, 0, 1);
        S.text(n, x + 200, yy + 10, S.fit(tr(n), 104, 17), '#2a2438', 'left');
        c.save(); c.globalAlpha = show; stars(x + 314, yy + 10, v, 11); S.text(Math.round(v * show) + '%', x + w - 30, yy + 10, 17, v >= 90 ? '#2e9c53' : v >= 60 ? '#b86b00' : '#c0392b', 'right'); c.restore();
      });
      const tot = Math.round(r.total * clamp(r.t * 2 - 2, 0, 1));
      c.fillStyle = '#e9dfc0'; c.fillRect(x + 24, y + 256, w - 48, 3);
      S.text('Overall', x + 40, y + 284, 19, '#2a2438', 'left'); stars(x + 160, y + 284, tot, 14); S.text(tot + '%', x + w - 40, y + 284, 24, '#2a2438', 'right');
      const sh2 = clamp(r.t * 1.6 - 2.2, 0, 1);
      c.save(); c.globalAlpha = sh2;
      S.text(K.food, x + 40, y + 322, 17, '#6a5a7a', 'left'); S.text(fmtM(r.pay), x + w - 40, y + 322, 17, '#2a2438', 'right');
      S.text('Tip', x + 40, y + 350, 20, '#c0392b', 'left'); S.text('+' + fmtM(r.tip * sh2), x + w - 40, y + 350, 22, '#2e9c53', 'right');
      S.text(tr('Rank points +{n}', { n: r.pts }), x + 40, y + 378, 14, '#6a5a7a', 'left', null, 800);
      c.restore();
      if (r.t > 2.2 && !r.paid) { r.paid = true; au.tone(1568, .08, 'square', .05); au.tone(2093, .2, 'square', .05, 0, .07); }
      if (S.btn(x + w / 2 - 80, y + h - 50, 160, 40, 'Continue', { color: '#3ecf6c', size: 20 }) || (r.t > .7 && (S.key('Enter') || S.key('Space')))) { D.result = null; au.tone(660, .08, 'sine', .05); }
      c.restore();
    };
    const drawDayEnd = () => {
      const m = modal; S.lock = false;
      c.fillStyle = 'rgba(30,18,14,.7)'; c.fillRect(0, 0, W, H);
      const x = 130, y = 36, w = 700, h = 530;
      S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 160, y - 20, w - 320, 46, { fill: K.th.tab, r: 14, lw: 3, sh: 3 }); S.text(tr('Day {n} complete', { n: m.day }), x + w / 2, y + 3, 26, '#fff', 'center', '#6a2a10');
      const st2 = [['Earned', fmtM(D.earned)], ['Tips', fmtM(D.tips)], ['Served', String(D.served)], ['Lost', String(D.lost)], ['Average', m.avg + '%'], ['Perfect', String(D.perfects)]];
      st2.forEach(([kk, v], i) => { const xx = x + 40 + (i % 3) * 215, yy = y + 54 + Math.floor(i / 3) * 62; S.panel(xx, yy, 200, 52, { fill: '#fff', r: 12, lw: 2.5, sh: 2 }); S.text(kk, xx + 12, yy + 14, 11, '#8a7a9a', 'left', null, 900); S.text(v, xx + 12, yy + 36, 22, '#2a2438', 'left'); });
      S.text(tr('Chef rank {n}', { n: m.ra }) + (m.ra > m.rb ? '   ' + tr('RANK UP!') : ''), x + 40, y + 200, 22, m.ra > m.rb ? '#c0392b' : '#2a2438', 'left');
      const p0 = pzRankPts(m.ra), p1 = pzRankPts(m.ra + 1); rrp(c, x + 40, y + 216, w - 80, 14, 7); c.fillStyle = '#e9dfc0'; c.fill(); rrp(c, x + 40, y + 216, Math.max(8, (w - 80) * clamp((m.rankPts - p0) / (p1 - p0), 0, 1) * eo(m.t)), 14, 7); c.fillStyle = '#3ecf6c'; c.fill();
      S.text(tr('{a} / {b} rank points', { a: m.rankPts, b: p1 }), x + w - 40, y + 200, 13, '#6a5a7a', 'right', null, 800);
      let yy = y + 252;
      const unl = [];
      m.newRest.forEach(n => unl.push(['New restaurant', n])); m.newItems.forEach(n => unl.push(['New on the menu', n])); m.newCust.forEach(n => unl.push(['New customer', n])); m.newUps.forEach(n => unl.push(['In the shop', n]));
      S.text('UNLOCKED', x + 40, yy, 13, '#8a7a9a', 'left', null, 900); yy += 18;
      if (!unl.length) S.text('Nothing new today. Keep going!', x + 40, yy + 12, 15, '#6a5a7a', 'left', null, 800);
      unl.slice(0, 8).forEach(([kk, n], i) => { const bx = x + 40 + (i % 2) * 320, by = yy + Math.floor(i / 2) * 38; S.panel(bx, by, 300, 32, { fill: '#fff', r: 10, lw: 2, sh: 0 }); const kw = Math.min(140, S.tw(tr(kk), 12)); S.text(kk, bx + 12, by + 16, S.fit(tr(kk), 140, 12), '#c0392b', 'left', null, 900); S.text(n, bx + 22 + kw, by + 16, S.fit(tr(n), 300 - 34 - kw, 15), '#2a2438', 'left'); });
      if (S.btn(x + 40, y + h - 62, 190, 46, 'Shop', { color: '#4cc9f0', size: 18 })) modal = { k: 'shop', from: 'dayend', tab: 0, t: 0 };
      if (S.btn(x + w - 230, y + h - 62, 190, 46, 'Next day', { color: '#3ecf6c', size: 20 })) { modal = null; scene = 'intro'; st.t = 0; D = null; }
    };
    const drawShop = () => {
      S.lock = false; c.fillStyle = 'rgba(30,18,14,.78)'; c.fillRect(0, 0, W, H);
      const x = 60, y = 36, w = 840, h = 530;
      S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 280, y - 20, w - 560, 46, { fill: '#4cc9f0', r: 14, lw: 3, sh: 3 }); S.text(tr('{name} shop', { name: tr(K.n) }), x + w / 2, y + 3, S.fit(tr('{name} shop', { name: tr(K.n) }), w - 580, 24), '#fff', 'center', '#14607a');
      icoCoin(c, x + 40, y + 46, 14); S.text(money(sv.money), x + 62, y + 47, 22, '#b86b00', 'left'); S.text(tr('Chef rank {n}', { n: rank() }), x + w - 40, y + 47, 20, '#c0392b', 'right');
      ['Upgrades', 'Decor'].forEach((n, i) => { if (S.btn(x + w / 2 - 160 + i * 166, y + 30, 154, 34, n, { color: modal.tab === i ? '#ff9f1c' : '#b9b2c9', size: 16, on: modal.tab === i, r: 10 })) modal.tab = i; });
      const buy = (cx, cy) => { au.tone(660, .12, 'square', .05, 990); au.tone(990, .2, 'sine', .07, 1480, .08); S.mkScr = true; S.confetti(cx, cy, 14); S.mkScr = false; persist(); };
      if (modal.tab === 0) {
        OU.SHARED.concat(K.ups).forEach((u, i) => {
          const cx = x + 24 + (i % 2) * 410, cy = y + 76 + Math.floor(i / 2) * 98, lv = up(u.id), maxed = lv >= u.max, cost = u.cost[lv], need = u.rank[lv], locked = !maxed && rank() < need, can = !maxed && !locked && sv.money >= cost;
          S.panel(cx, cy, 394, 88, { fill: locked ? '#e6dfd0' : '#fff', r: 14, lw: 3, sh: 3 });
          S.text(u.n, cx + 14, cy + 18, S.fit(tr(u.n), 250, 18), '#2a2438', 'left');
          for (let kk = 0; kk < u.max; kk++) { rrp(c, cx + 14 + kk * 20, cy + 32, 16, 10, 4); c.fillStyle = kk < lv ? '#3ecf6c' : '#d9d3e6'; c.fill(); }
          S.wrap(u.d, cx + 14, cy + 48, 250, 15, 12, '#6a5a7a', 'left', 700);
          if (maxed) S.text('MAXED', cx + 326, cy + 60, 16, '#2e9c53', 'center');
          else if (S.btn(cx + 270, cy + 44, 112, 34, locked ? tr('Rank {n}', { n: need }) : money(cost), { color: can ? '#3ecf6c' : '#b9b2c9', size: 16, enabled: can, r: 10 })) { sv.money -= cost; RS.ups[u.id] = lv + 1; buy(cx + 330, cy + 60); }
          if (locked) S.text('Locked', cx + 330, cy + 22, 12, '#c0392b', 'center', null, 900);
        });
      } else {
        OU.DECOR.forEach((d, i) => {
          const cx = x + 24 + (i % 2) * 410, cy = y + 76 + Math.floor(i / 2) * 120, own = !!RS.deco[d.id], locked = !own && rank() < d.rank, can = !own && !locked && sv.money >= d.cost;
          S.panel(cx, cy, 394, 108, { fill: locked ? '#e6dfd0' : '#fff', r: 14, lw: 3, sh: 3 });
          c.save(); rrp(c, cx + 10, cy + 10, 88, 88, 10); c.clip(); c.fillStyle = shade(K.th.wall[0], -.05); c.fillRect(cx + 10, cy + 10, 88, 88);
          const P = { plant: [604, 380, .8], clock: [606, 196, 1.2], lights: [120, 150, 1], jukebox: [36, 350, .62], tank: [165, 262, .66], arcade: [104, 350, .62] }[d.id];
          c.translate(cx + 54, cy + 54); c.scale(P[2], P[2]); c.translate(-P[0], -P[1]); decorDraw(c, d.id, S.t); c.restore();
          c.lineWidth = 2.5; c.strokeStyle = '#2a2438'; rrp(c, cx + 10, cy + 10, 88, 88, 10); c.stroke();
          S.text(d.n, cx + 112, cy + 22, S.fit(tr(d.n), 270, 18), '#2a2438', 'left');
          S.wrap(d.d, cx + 112, cy + 38, 160, 15, 12, '#6a5a7a', 'left', 700);
          S.text(tr('Patience +{n}%', { n: Math.round(d.pat * 100) }), cx + 112, cy + 92, 12, '#2e9c53', 'left', null, 900);
          if (own) S.text('OWNED', cx + 330, cy + 70, 16, '#2e9c53', 'center');
          else if (S.btn(cx + 274, cy + 54, 108, 34, locked ? tr('Rank {n}', { n: d.rank }) : money(d.cost), { color: can ? '#3ecf6c' : '#b9b2c9', size: 16, enabled: can, r: 10 })) { sv.money -= d.cost; RS.deco[d.id] = true; buy(cx + 330, cy + 70); }
        });
      }
      if (S.btn(x + w / 2 - 90, y + h - 50, 180, 40, 'Done', { color: '#e8584a', size: 20 }) || S.key('Escape')) { const f = modal.from; modal = null; if (f === 'dayend') { scene = 'intro'; st.t = 0; D = null; } }
    };
    const drawPause = () => {
      S.lock = false; c.fillStyle = 'rgba(30,18,14,.7)'; c.fillRect(0, 0, W, H);
      S.panel(W / 2 - 200, 150, 400, 300, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.text('Paused', W / 2, 200, 34, '#2a2438');
      S.text('The clock stops while this is open.', W / 2, 236, 14, '#6a5a7a', 'center', null, 800);
      if (S.btn(W / 2 - 120, 270, 240, 50, 'Resume', { color: '#3ecf6c', size: 20 }) || (modal.t > .2 && (S.key('Escape') || S.key('Enter')))) modal = null;
      else if (S.btn(W / 2 - 120, 340, 240, 46, modal.sure ? 'Leave? The day is lost' : 'Quit the day', { color: modal.sure ? '#e63946' : '#8a7fa8', size: 16 })) {
        if (modal.sure) { D.tickets.forEach(t => { if (t.state !== 'done') t.state = 'gone'; }); D = null; modal = null; scene = 'intro'; st.t = 0; persist(); }
        else modal.sure = true;
      }
    };
    const drawIntro = () => {
      S.lock = !!modal;
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, K.th.intro[0]); g.addColorStop(1, K.th.intro[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      K.floaty(S.t);
      const px = W / 2 - 300, pw = 600;
      S.panel(px, 28, pw, 470, { fill: '#fff8e7', r: 26, lw: 5, sh: 8 });
      S.text(tr(K.n), W / 2, 62, 22, K.th.tab, 'center', null, 900);
      S.text(tr('DAY {n}', { n: RS.day }), W / 2, 104, 50, '#c0392b', 'center', '#fff', 900);
      const N = Math.min(16, 6 + Math.floor(RS.day * .9));
      S.text(tr('About {n} customers today', { n: N }) + (RS.day >= 2 ? '  +  ' + tr('a food critic') : ''), W / 2, 144, 17, '#6a5a7a', 'center', null, 800);
      const items = K.newItems(RS.day), nc = OU.CUST.filter(x => x.day === worked());
      let yy = 172;
      if (items.length) {
        S.text('NEW ON THE MENU', W / 2, yy, 13, '#8a7a9a', 'center', null, 900); yy += 18;
        const cw = 180, n = Math.min(9, items.length), rows = Math.ceil(n / 3);
        items.slice(0, 9).forEach((it, i) => { const r = Math.floor(i / 3), cnt = Math.min(3, n - r * 3), x0 = W / 2 - cnt * cw / 2 + (i % 3) * cw; S.panel(x0 + 4, yy + r * 40, cw - 8, 34, { fill: '#fff', r: 12, lw: 2.5, sh: 2 }); it.d(x0 + 24, yy + r * 40 + 17); S.text(it.n, x0 + 44, yy + r * 40 + 17, S.fit(tr(it.n), cw - 58, 14), '#2a2438', 'left'); });
        yy += Math.min(rows, 3) * 40 + 10;
      }
      if (nc.length) {
        S.text('NEW CUSTOMERS', W / 2, yy, 13, '#8a7a9a', 'center', null, 900); yy += 6;
        const cw = 110, x0 = W / 2 - nc.length * cw / 2;
        nc.forEach((L, i) => { const x = x0 + i * cw + cw / 2; c.save(); c.beginPath(); rrp(c, x - 46, yy, 92, 96, 12); c.clip(); c.fillStyle = '#ffe9c4'; c.fillRect(x - 46, yy, 92, 96); pzCust(c, L, x, yy + 114, .92, 0, S.t + i, false, 0); c.restore(); c.lineWidth = 2.5; c.strokeStyle = '#2a2438'; rrp(c, x - 46, yy, 92, 96, 12); c.stroke(); S.text(L.n, x, yy + 110, 14, '#2a2438'); });
        yy += 124;
      }
      if (!items.length && !nc.length) { S.text('Same menu, same regulars.', W / 2, yy + 30, 20, '#2a2438'); S.text('Faster hands, bigger tips!', W / 2, yy + 58, 16, '#6a5a7a', 'center', null, 800); }
      const cl = RS.day >= 2 ? OU.CRITICS[(RS.day - 2 + KIDS.indexOf(K.id) * 3) % OU.CRITICS.length] : null;
      if (cl) {
        const cy = 408; c.save(); c.beginPath(); rrp(c, px + 30, cy, 64, 76, 12); c.clip(); c.fillStyle = '#ffe9c4'; c.fillRect(px + 30, cy, 64, 76); pzCust(c, cl, px + 62, cy + 92, .66, 0, S.t, false, 0); c.restore(); c.lineWidth = 2.5; c.strokeStyle = '#2a2438'; rrp(c, px + 30, cy, 64, 76, 12); c.stroke();
        S.text(tr("Tonight's food critic: {name}", { name: cl.n }), px + 112, cy + 24, S.fit(tr("Tonight's food critic: {name}", { name: cl.n }), pw - 130, 20), '#c0392b', 'left');
        S.text('Arrives after the last customer. Big tip for a perfect order.', px + 112, cy + 52, S.fit(tr('Arrives after the last customer. Big tip for a perfect order.'), pw - 130, 13, 800), '#6a5a7a', 'left', null, 800);
      }
      if (S.btn(W / 2 - 100, 520, 200, 56, 'Open!', { color: '#3ecf6c', size: 22 }) || (!S.lock && st.t > .3 && (S.key('Enter') || S.key('Space')))) { au.tone(523, .1, 'triangle', .06); au.tone(784, .2, 'triangle', .06, 0, .08); startDay(); return; }
      if (S.btn(W / 2 - 300, 528, 130, 44, 'Shop', { color: '#4cc9f0', size: 18 })) modal = { k: 'shop', from: 'intro', tab: 0, t: 0 };
      if (S.btn(W / 2 + 170, 528, 130, 44, 'Back', { color: '#8a7fa8', size: 18 }) || (!S.lock && S.key('Escape'))) scene = 'title';
      if (modal && modal.k === 'shop') drawShop();
    };
    const drawHelp = () => {
      S.lock = false; c.fillStyle = 'rgba(30,18,14,.78)'; c.fillRect(0, 0, W, H);
      const x = 90, y = 36, w = 780, h = 530, hk = KITS[modal.kit || sv.cur]; S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 240, y - 20, w - 480, 46, { fill: '#4cc9f0', r: 14, lw: 3, sh: 3 }); S.text('How to play', x + w / 2, y + 3, 26, '#fff', 'center', '#14607a');
      KIDS.forEach((id, i) => { if (S.btn(x + 90 + i * 206, y + 38, 190, 34, KITS[id].n, { color: hk.id === id ? '#ff9f1c' : '#b9b2c9', size: 15, r: 10, on: hk.id === id })) modal.kit = id; });
      const items = [['ORDER', 'Click the customer at the counter (or press Space) to take the order. A ticket goes on the rail. Customers lose patience while they wait.']].concat(hk.help);
      items.forEach(([t, d], i) => { const yy = y + 88 + i * 82; S.text((i + 1) + '  ' + tr(t), x + 30, yy + 14, S.fit((i + 1) + '  ' + tr(t), 150, 20), '#c0392b', 'left'); S.wrap(d, x + 190, yy, w - 220, 19, 15, '#2a2438', 'left', 700); });
      S.text('Keys: 1-4 switch stations, Space takes the order, Enter confirms.', x + w / 2, y + h - 66, 14, '#6a5a7a', 'center', null, 800);
      if (S.btn(x + w / 2 - 70, y + h - 48, 140, 38, 'Got it', { color: '#3ecf6c', size: 18 }) || S.key('Escape')) modal = null;
    };
    const card = (id, x, y, w, h) => {
      const k = KITS[id], open = rank() >= k.unlock, sel = sv.cur === id, hov = !S.lock && S.inside(x, y, w, h), r2 = sv.R[id];
      c.save(); if (hov && open) { c.translate(0, -4); S.cursor = 'pointer'; }
      S.panel(x, y, w, h, { fill: open ? '#fff8e7' : '#d9d3c6', r: 20, lw: sel ? 5 : 4, sh: 6, line: sel ? '#c0392b' : '#2a2438' });
      c.save(); rrp(c, x + 12, y + 12, w - 24, 118, 14); c.clip(); const g = c.createLinearGradient(0, y, 0, y + 130); g.addColorStop(0, k.th.intro[0]); g.addColorStop(1, k.th.intro[1]); c.fillStyle = g; c.fillRect(x, y, w, 140);
      if (!open) c.globalAlpha = .5; k.icon(x + w / 2, y + 72, 1); c.restore();
      c.lineWidth = 3; c.strokeStyle = '#2a2438'; rrp(c, x + 12, y + 12, w - 24, 118, 14); c.stroke();
      S.text(k.n, x + w / 2, y + 150, S.fit(tr(k.n), w - 20, 20), '#2a2438');
      if (open) { S.text(tr('Day {n}', { n: r2.day }), x + w / 2, y + 174, 15, '#c0392b', 'center', null, 900); S.text(tr('{n} served', { n: r2.served }), x + w / 2, y + 194, 12, '#6a5a7a', 'center', null, 800); }
      else { c.save(); c.translate(x + w / 2, y + 72); c.fillStyle = '#2a2438'; rrp(c, -18, -6, 36, 28, 6); c.fill(); c.lineWidth = 5; c.strokeStyle = '#2a2438'; c.beginPath(); c.arc(0, -8, 11, Math.PI, TAU); c.stroke(); c.restore(); S.text(tr('Chef rank {n}', { n: k.unlock }), x + w / 2, y + 178, 15, '#6a5a7a', 'center', null, 900); }
      c.restore();
      if (S.clickIn(x, y, w, h)) {
        if (!open) { toast(tr('Reach chef rank {n} to open it', { n: k.unlock })); au.tone(200, .12, 'sawtooth', .04); }
        else { setKit(id); persist(); scene = 'intro'; st.t = 0; au.tone(523, .1, 'triangle', .06); au.tone(784, .2, 'triangle', .06, 0, .08); }
      }
    };
    const drawTitle = () => {
      S.lock = !!modal;
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffcf6e'); g.addColorStop(.55, '#ff8a4b'); g.addColorStop(1, '#c0392b'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, H / 2); c.rotate(S.t * .05); for (let i = 0; i < 16; i++) { c.rotate(TAU / 16); c.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,0)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(900, -140); c.lineTo(900, 140); c.fill(); } c.restore();
      S.panel(W / 2 - 250, 22, 500, 96, { fill: '#2b3a2d', line: '#5a3a1a', r: 18, lw: 6, sh: 6 });
      c.save(); c.translate(W / 2 - 196, 70); c.rotate(-.12); S.panel(-34, -22, 68, 44, { fill: '#fffdf2', line: '#7a5a2a', r: 4, lw: 3, sh: 0 }); c.fillStyle = '#c0392b'; c.fillRect(-26, -12, 40, 4); c.fillStyle = '#9a8a6a'; c.fillRect(-26, -2, 48, 3); c.fillRect(-26, 6, 34, 3); c.restore();
      S.text('ORDER UP!', W / 2 + 30, 72, 54, '#ffe14d', 'center', '#0e1a10');
      const cw = 250, gap = 24, x0 = W / 2 - (cw * 3 + gap * 2) / 2;
      KIDS.forEach((id, i) => card(id, x0 + i * (cw + gap), 150, cw, 210));
      const rk = rank(), p0 = pzRankPts(rk), p1 = pzRankPts(rk + 1);
      S.text(tr('Chef rank {n}', { n: rk }) + '   ·   ' + money(sv.money) + '   ·   ' + tr('{n} orders served', { n: sv.served }), W / 2, 398, 17, '#fff', 'center', '#7a1f16');
      rrp(c, W / 2 - 150, 412, 300, 10, 5); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); rrp(c, W / 2 - 150, 412, Math.max(8, 300 * clamp((sv.pts - p0) / (p1 - p0), 0, 1)), 10, 5); c.fillStyle = '#3ecf6c'; c.fill();
      if (S.btn(W / 2 - 150, 440, 300, 62, tr('Play: {name}', { name: tr(KITS[sv.cur].n) }), { color: '#3ecf6c', size: 24 }) || (!S.lock && (S.key('Enter') || S.key('Space')))) { scene = 'intro'; st.t = 0; au.tone(523, .1, 'triangle', .06); au.tone(784, .2, 'triangle', .06, 0, .08); }
      if (S.btn(W / 2 - 150, 516, 145, 40, 'How to play', { color: '#4cc9f0', size: 15 })) modal = { k: 'help', t: 0 };
      if (S.btn(W / 2 + 5, 516, 145, 40, confirmReset ? 'Sure? All progress' : 'Reset', { color: confirmReset ? '#e63946' : '#8a7fa8', size: 15 })) {
        if (confirmReset) { const fresh = svCopy(defSave); Object.keys(sv).forEach(k => delete sv[k]); Object.assign(sv, fresh); setKit('pizza'); persist(); confirmReset = false; toast('Progress reset'); api.score(0); }
        else { confirmReset = true; api.timeout(() => { confirmReset = false; }, 3000); }
      }
      if (modal && modal.k === 'help') drawHelp();
    };

    const tick = dt => {
      S.t += dt; music.update(dt); S.stepFx(dt); st.t += dt;
      if (toastT > 0) toastT -= dt;
      if (modal) modal.t = (modal.t || 0) + dt;
      if (scene === 'play' && D) { if (D.result) D.result.t += dt; else if (!modal) updateDay(dt); }
    };
    root.__dbg = { sv, get D() { return D; }, get K() { return K; }, get scene() { return scene; }, get modal() { return modal; }, startDay, setKit, KITS, QX, BXS, tick, finishServe, data: { PZ, BG, SH } };
    api.score(Math.floor(sv.earned));
    api.loop(dt => {
      acc += dt; let n = 0;
      while (acc >= 1 / 120 && n < 8) { tick(1 / 120); acc -= 1 / 120; n++; }
      if (n >= 8) acc = 0;
      c.fillStyle = '#2a1c16'; c.fillRect(0, 0, W, H);
      if (scene === 'play' && D) {
        S.lock = !!(modal || D.result);
        if (D.station === 'order') drawOrder(); else K.draw[D.station]();
        if (D) { drawRail(); drawTop(); }
        S.mkScr = false; S.drawFx(true); S.drawFx(false);
        if (D && D.result) drawResult();
        if (modal && modal.k === 'dayend') drawDayEnd();
        else if (modal && modal.k === 'shop') drawShop();
        else if (modal && modal.k === 'pause') drawPause();
      } else if (scene === 'intro') drawIntro();
      else drawTitle();
      if (toastT > 0) { c.save(); c.globalAlpha = Math.min(1, toastT * 3); S.panel(W / 2 - 250, H - 70, 500, 38, { fill: 'rgba(42,36,56,.92)', r: 19, lw: 0, sh: 0 }); S.text(toastS, W / 2, H - 51, S.fit(tr(toastS), 470, 16), '#fff'); c.restore(); }
      S.endFrame();
    });
    api.on(window, 'beforeunload', persist);
    api.on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') persist(); });
    return { destroy() { persist(); au.close(); } };
  };

  Ameplay.register({
    id: 'order-up', title: 'Order Up', category: 'Strategy', tint: '#e8584a',
    blurb: 'Run three restaurants. Take orders at the counter, then build, cook and finish every order at its stations: bake and slice pizzas, grill and stack burgers, blend and top shakes. Keep customers happy for bigger tips, rank up, unlock new restaurants, upgrades and decorations.',
    help: '<kbd>1</kbd>-<kbd>4</kbd> switch stations · click or <kbd>Space</kbd> to take an order · drag and click to build · <kbd>Enter</kbd> confirms · watch the timers: the bell means ready',
    better: 'high', width: 960, format: v => '$' + short(v),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 40h44"/><path d="M14 40a18 18 0 0 1 36 0"/><path d="M32 22v-6"/><path d="M27 16h10"/><path d="M8 48h48"/></svg>',
    css: '.gm-order-up{gap:0;min-height:0;justify-content:flex-start}.gm-order-up .g-canvas{border-radius:14px;background:#2a1c16}',
    mount(root, api) { return mountKitchen(root, api); }
  });

  const DK = {
    STATS: [
      { id: 'run', n: 'Running', col: '#ff7b54', dk: '#c2481f' },
      { id: 'swim', n: 'Swimming', col: '#3fa9f5', dk: '#1f6fb8' },
      { id: 'fly', n: 'Flying', col: '#9b7cf0', dk: '#6446c0' },
      { id: 'climb', n: 'Climbing', col: '#5fc26a', dk: '#2f8a3a' }
    ],
    COLS: [
      { id: 'yellow', n: 'Sunny', c: '#ffd23f', d: '#eba51c', b: '#ff8c1a', cost: 0 },
      { id: 'white', n: 'Snowy', c: '#fbfbf6', d: '#cfd3d6', b: '#ff9a2a', cost: 60 },
      { id: 'mallard', n: 'Mallard', c: '#9a7650', d: '#6a4d30', b: '#f2c230', cost: 120, head: '#2f9a63' },
      { id: 'blue', n: 'Bluebell', c: '#63bdf4', d: '#3490cc', b: '#ffb02e', cost: 160 },
      { id: 'pink', n: 'Bubblegum', c: '#ff94c4', d: '#e3629d', b: '#ffd23f', cost: 160 },
      { id: 'black', n: 'Shadow', c: '#5a5470', d: '#34304a', b: '#ff7a1a', cost: 220 },
      { id: 'purple', n: 'Grape', c: '#ae82f4', d: '#7d52d4', b: '#ffcf3a', cost: 220 },
      { id: 'green', n: 'Mint', c: '#74e0a0', d: '#42b574', b: '#ff9a2a', cost: 260 }
    ],
    ITEMS: [
      { id: 'cap', n: 'Red Cap', slot: 'hat', cost: 30, b: {}, d: 'Sporty and sturdy.' },
      { id: 'party', n: 'Party Hat', slot: 'hat', cost: 40, b: {}, d: 'Every race is a party.' },
      { id: 'top', n: 'Top Hat', slot: 'hat', cost: 70, b: {}, d: 'Very distinguished.' },
      { id: 'chef', n: 'Chef Hat', slot: 'hat', cost: 80, b: {}, d: 'Cooks up fast times.' },
      { id: 'band', n: 'Speed Band', slot: 'hat', cost: 110, b: { run: 2 }, d: '+2 Running' },
      { id: 'swimcap', n: 'Swim Cap', slot: 'hat', cost: 110, b: { swim: 2 }, d: '+2 Swimming' },
      { id: 'helmet', n: 'Climber Helmet', slot: 'hat', cost: 120, b: { climb: 2 }, d: '+2 Climbing' },
      { id: 'cowboy', n: 'Cowboy Hat', slot: 'hat', cost: 140, b: { run: 1, climb: 1 }, d: '+1 Running, +1 Climbing' },
      { id: 'pirate', n: 'Pirate Hat', slot: 'hat', cost: 180, b: { swim: 1, climb: 1 }, d: '+1 Swimming, +1 Climbing' },
      { id: 'wizard', n: 'Wizard Hat', slot: 'hat', cost: 260, b: { fly: 3 }, d: '+3 Flying' },
      { id: 'crown', n: 'Golden Crown', slot: 'hat', cost: 600, b: { run: 1, swim: 1, fly: 1, climb: 1 }, d: '+1 to every skill' },
      { id: 'shades', n: 'Sunglasses', slot: 'face', cost: 50, b: {}, d: 'Cool as ice.' },
      { id: 'monocle', n: 'Monocle', slot: 'face', cost: 70, b: {}, d: 'Quite so.' },
      { id: 'goggles', n: 'Swim Goggles', slot: 'face', cost: 130, b: { swim: 3 }, d: '+3 Swimming' },
      { id: 'aviator', n: 'Aviator Goggles', slot: 'face', cost: 150, b: { fly: 3 }, d: '+3 Flying' },
      { id: 'bow', n: 'Bow Tie', slot: 'neck', cost: 40, b: {}, d: 'Dapper.' },
      { id: 'bell', n: 'Gold Bell', slot: 'neck', cost: 60, b: {}, d: 'Ding ding!' },
      { id: 'scarf', n: 'Red Scarf', slot: 'neck', cost: 90, b: { run: 1, climb: 1 }, d: '+1 Running, +1 Climbing' },
      { id: 'cape', n: 'Hero Cape', slot: 'neck', cost: 300, b: { run: 1, fly: 2 }, d: '+1 Running, +2 Flying' }
    ],
    SLOTS: ['hat', 'face', 'neck'],
    NAMES: ['Quackers', 'Waddles', 'Puddles', 'Sir Quacksalot', 'Pebble', 'Ducky', 'Feathers', 'Splash', 'Biscuit', 'Nugget', 'Pip', 'Maple']
  };
  DK.CB = {}; DK.COLS.forEach(x => { DK.CB[x.id] = x; });
  DK.IB = {}; DK.ITEMS.forEach(x => { DK.IB[x.id] = x; });
  const dkNeed = n => 24 + 6 * n;
  const dkBase = (k, lv) => k === 'run' ? 150 + 7 * lv : k === 'swim' ? 110 + 6 * lv : k === 'fly' ? 130 + 6.5 * lv : 80 + 5 * lv;

  const dkHat = (c, id) => {
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#2a2438';
    const fs = (col) => { c.fillStyle = col; c.fill(); c.stroke(); };
    if (id === 'cap') {
      c.beginPath(); c.moveTo(-13, -5); c.quadraticCurveTo(-14, -23, 0, -22); c.quadraticCurveTo(14, -23, 13, -5); c.closePath(); fs('#e63946');
      c.beginPath(); c.moveTo(7, -6); c.quadraticCurveTo(20, -8, 25, -2); c.lineTo(8, -1); c.closePath(); fs('#b02030');
      c.beginPath(); c.arc(0, -22, 2.4, 0, TAU); fs('#fff');
    } else if (id === 'party') {
      c.beginPath(); c.moveTo(-9, -9); c.lineTo(9, -9); c.lineTo(1, -36); c.closePath(); fs('#9b5de5');
      c.strokeStyle = '#ffd23f'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-6, -17); c.lineTo(5, -22); c.moveTo(-3, -26); c.lineTo(3, -29); c.stroke();
      c.strokeStyle = '#2a2438'; c.lineWidth = 2.4; c.beginPath(); c.arc(1, -37, 4, 0, TAU); fs('#ffd23f');
    } else if (id === 'top') {
      c.beginPath(); c.ellipse(0, -10, 17, 4.5, 0, 0, TAU); fs('#2a2438');
      c.beginPath(); rrp(c, -10, -33, 20, 24, 3); fs('#34304a');
      c.fillStyle = '#e63946'; c.fillRect(-10, -18, 20, 5); c.strokeRect(-10, -18, 20, 5);
    } else if (id === 'chef') {
      c.beginPath(); c.arc(-8, -25, 8, 0, TAU); c.arc(0, -29, 9, 0, TAU); c.arc(8, -25, 8, 0, TAU); c.rect(-11, -24, 22, 14); fs('#fff');
      c.beginPath(); rrp(c, -12, -12, 24, 6, 2); fs('#f1f1f1');
    } else if (id === 'band') {
      c.beginPath(); rrp(c, -14.5, -11, 29, 7, 2.5); fs('#e63946'); c.fillStyle = '#fff'; c.fillRect(-14, -8.5, 28, 2);
      c.beginPath(); c.moveTo(-14, -8); c.lineTo(-24, -4); c.lineTo(-22, -12); c.closePath(); fs('#e63946');
    } else if (id === 'swimcap') {
      c.beginPath(); c.moveTo(-14.5, -3); c.quadraticCurveTo(-16, -22, 0, -21); c.quadraticCurveTo(16, -22, 14.5, -3); c.quadraticCurveTo(0, -9, -14.5, -3); c.closePath(); fs('#4cc9f0');
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -8); c.quadraticCurveTo(-7, -17, -3, -20); c.moveTo(4, -8); c.quadraticCurveTo(5, -17, 2, -20); c.stroke();
    } else if (id === 'helmet') {
      c.beginPath(); c.moveTo(-14.5, -4); c.quadraticCurveTo(-16, -24, 0, -23); c.quadraticCurveTo(16, -24, 14.5, -4); c.closePath(); fs('#ffb703');
      c.beginPath(); rrp(c, -15.5, -7, 31, 4, 2); fs('#e08a00');
      c.beginPath(); c.arc(10, -14, 4, 0, TAU); fs('#fff7c2');
    } else if (id === 'cowboy') {
      c.beginPath(); c.moveTo(-9, -9); c.quadraticCurveTo(-10, -26, -4, -26); c.quadraticCurveTo(0, -21, 4, -26); c.quadraticCurveTo(10, -26, 9, -9); c.closePath(); fs('#b27a44');
      c.beginPath(); c.ellipse(0, -9, 23, 5, 0, 0, TAU); fs('#9a6535');
      c.fillStyle = '#5a3418'; c.fillRect(-9, -14, 18, 4);
    } else if (id === 'pirate') {
      c.beginPath(); c.moveTo(-18, -8); c.quadraticCurveTo(-14, -26, 0, -22); c.quadraticCurveTo(14, -26, 18, -8); c.quadraticCurveTo(0, -3, -18, -8); c.closePath(); fs('#2a2438');
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -13, 3.4, 0, TAU); c.fill(); c.fillRect(-1, -9.5, 2, 3);
      c.fillStyle = '#2a2438'; c.beginPath(); c.arc(-1.3, -13.3, .9, 0, TAU); c.arc(1.3, -13.3, .9, 0, TAU); c.fill();
    } else if (id === 'wizard') {
      c.beginPath(); c.moveTo(-10, -9); c.quadraticCurveTo(-4, -26, 6, -42); c.quadraticCurveTo(10, -24, 10, -9); c.closePath(); fs('#4a3ba8');
      c.beginPath(); c.ellipse(0, -9, 19, 4.5, 0, 0, TAU); fs('#3a2d8a');
      c.fillStyle = '#ffd23f'; for (const [x, y] of [[0, -20], [4, -30], [-3, -13]]) { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }
    } else if (id === 'crown') {
      c.beginPath(); c.moveTo(-12, -6); c.lineTo(-14, -22); c.lineTo(-6, -14); c.lineTo(0, -26); c.lineTo(6, -14); c.lineTo(14, -22); c.lineTo(12, -6); c.closePath(); fs('#ffc928');
      c.fillStyle = '#e63946'; c.beginPath(); c.arc(0, -12, 2.4, 0, TAU); c.fill(); c.fillStyle = '#4cc9f0'; c.beginPath(); c.arc(-7, -10, 1.8, 0, TAU); c.arc(7, -10, 1.8, 0, TAU); c.fill();
    }
    c.restore();
  };
  const dkFace = (c, id, ex, ey) => {
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#2a2438';
    if (id === 'shades') {
      c.beginPath(); c.ellipse(ex + 1, ey, 8.5, 6.5, 0, 0, TAU); c.fillStyle = '#1d1a2a'; c.fill(); c.stroke();
      c.strokeStyle = '#2a2438'; c.beginPath(); c.moveTo(ex - 7, ey - 1); c.lineTo(ex - 20, ey - 2); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(ex - 2, ey - 2.5, 3, 1.6, -.4, 0, TAU); c.fill();
    } else if (id === 'monocle') {
      c.strokeStyle = '#d99a00'; c.lineWidth = 2.6; c.beginPath(); c.arc(ex + 1, ey, 8, 0, TAU); c.fillStyle = 'rgba(200,235,255,.3)'; c.fill(); c.stroke();
      c.lineWidth = 1.4; c.beginPath(); c.moveTo(ex + 5, ey + 7); c.quadraticCurveTo(ex + 9, ey + 16, ex + 2, ey + 22); c.stroke();
    } else if (id === 'goggles' || id === 'aviator') {
      const sw = id === 'goggles';
      c.strokeStyle = sw ? '#2a2438' : '#7a4a1a'; c.lineWidth = 4.4; c.beginPath(); c.moveTo(ex - 6, ey); c.lineTo(ex - 22, ey - 1); c.stroke();
      c.lineWidth = 3.4; c.strokeStyle = sw ? '#ff7b1c' : '#d9a441'; c.beginPath(); c.arc(ex + 1, ey, 8.4, 0, TAU); c.fillStyle = sw ? 'rgba(120,225,255,.65)' : 'rgba(255,225,130,.55)'; c.fill(); c.stroke();
      c.lineWidth = 1.6; c.strokeStyle = '#2a2438'; c.beginPath(); c.arc(ex + 1, ey, 10, 0, TAU); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(ex - 2, ey - 3, 2.6, 1.4, -.5, 0, TAU); c.fill();
    }
    c.restore();
  };
  const dkNeck = (c, id, t, behind) => {
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#2a2438';
    const nx = 7, ny = -33;
    if (id === 'cape') {
      if (!behind) { c.restore(); return; }
      const w = Math.sin(t * 9) * 3;
      c.beginPath(); c.moveTo(nx - 2, ny - 3); c.quadraticCurveTo(-18, ny + 4 + w, -46, -26 + w * 2); c.quadraticCurveTo(-30, -14, -18, -10); c.quadraticCurveTo(-4, -14, nx + 3, ny + 8); c.closePath(); c.fillStyle = '#e63946'; c.fill(); c.stroke();
    } else if (!behind) {
      if (id === 'bow') {
        c.beginPath(); c.moveTo(nx, ny + 6); c.lineTo(nx - 11, ny - 1); c.lineTo(nx - 11, ny + 13); c.closePath(); c.fillStyle = '#e63946'; c.fill(); c.stroke();
        c.beginPath(); c.moveTo(nx, ny + 6); c.lineTo(nx + 11, ny - 1); c.lineTo(nx + 11, ny + 13); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.arc(nx, ny + 6, 3.4, 0, TAU); c.fillStyle = '#b02030'; c.fill(); c.stroke();
      } else if (id === 'bell') {
        c.strokeStyle = '#e63946'; c.lineWidth = 3; c.beginPath(); c.moveTo(nx - 10, ny + 2); c.quadraticCurveTo(nx, ny + 9, nx + 10, ny + 2); c.stroke();
        c.strokeStyle = '#2a2438'; c.lineWidth = 2.2; c.beginPath(); c.arc(nx, ny + 11, 5, 0, TAU); c.fillStyle = '#ffc928'; c.fill(); c.stroke();
        c.beginPath(); c.arc(nx, ny + 13, 1.4, 0, TAU); c.fillStyle = '#2a2438'; c.fill();
      } else if (id === 'scarf') {
        const w = Math.sin(t * 9) * 2.5;
        c.beginPath(); c.moveTo(nx - 6, ny + 3); c.quadraticCurveTo(-8, ny - 2 + w, -22, ny + 4 + w * 1.6); c.lineTo(-22, ny + 12 + w * 1.6); c.quadraticCurveTo(-8, ny + 8 + w, nx - 4, ny + 11); c.closePath(); c.fillStyle = '#e63946'; c.fill(); c.stroke();
        c.beginPath(); rrp(c, nx - 10, ny + 1, 20, 9, 4); c.fillStyle = '#ff5a68'; c.fill(); c.stroke();
      }
    }
    c.restore();
  };

  const dkLook = () => ({ col: 'yellow', hat: null, face: null, neck: null });

  const duckDraw = (c, x, y, s, o = {}) => {
    const look = o.look || dkLook(), cl = DK.CB[look.col] || DK.COLS[0], t = o.t || 0, pose = o.pose || 'idle', flip = o.flip || 1;
    const headCol = cl.head || cl.c;
    c.save(); c.translate(x, y); c.scale(flip * s, s); c.lineJoin = 'round'; c.lineCap = 'round';
    if (o.rot) { c.translate(0, -24); c.rotate(o.rot); c.translate(0, 24); }
    const ph = t * (pose === 'run' ? 20 : pose === 'swim' ? 9 : 14);
    let bob = 0, hx = 15, hy = -47, lean = 0, mood = o.mood || 0;
    if (pose === 'idle') bob = Math.sin(t * 3) * 1.2;
    if (pose === 'run') { bob = -Math.abs(Math.sin(ph)) * 4; lean = .1; }
    if (pose === 'swim') { bob = Math.sin(t * 5) * 1.5; }
    if (pose === 'fly') { bob = Math.sin(t * 14) * 2; lean = o.lean == null ? -.1 : o.lean; }
    if (pose === 'climb') { bob = Math.sin(t * 12) * 1.2; lean = .12; }
    if (pose === 'happy') { bob = -Math.abs(Math.sin(t * 8)) * 8; }
    if (pose === 'sad') { hy += 4; hx -= 2; }
    if (pose === 'sleep') { hy += 7; hx += 2; }
    c.translate(0, bob);
    if (lean) { c.translate(0, -22); c.rotate(lean); c.translate(0, 22); }
    c.lineWidth = 2.6; c.strokeStyle = '#2a2438';
    dkNeck(c, look.neck, t, true);
    const foot = (fx, fy, ang, back) => {
      c.save(); c.translate(fx, fy); c.rotate(ang);
      c.strokeStyle = '#2a2438'; c.lineWidth = 2.6; c.fillStyle = back ? shade(cl.b, -.15) : cl.b;
      c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -1); c.stroke();
      c.beginPath(); c.moveTo(-2, -2); c.lineTo(10, 0); c.quadraticCurveTo(11, 3, 5, 3); c.quadraticCurveTo(0, 3.6, -3, 2); c.closePath(); c.fill(); c.stroke(); c.restore();
    };
    if (pose === 'fly') { foot(-12, -10, .7, true); foot(-6, -9, .9, false); }
    else if (pose === 'run' || pose === 'climb') {
      const a = Math.sin(ph) * 9, b = Math.sin(ph + Math.PI) * 9;
      foot(-5 + a, -Math.max(0, Math.cos(ph)) * 7, 0, true); foot(5 + b, -Math.max(0, -Math.cos(ph)) * 7, 0, false);
    } else if (pose === 'swim') { const a = Math.sin(ph) * 7; foot(-8 + a, 4, .5, true); foot(2 - a, 6, .5, false); }
    else if (pose === 'happy') { foot(-6, -Math.abs(Math.sin(t * 8)) * 0, 0, true); foot(5, 0, 0, false); }
    else { foot(-5, 0, 0, true); foot(5, 0, 0, false); }
    c.fillStyle = cl.d; c.beginPath(); c.moveTo(-20, -30); c.quadraticCurveTo(-34, -42 + (pose === 'run' ? Math.sin(ph) * 2 : 0), -38, -44); c.quadraticCurveTo(-30, -30, -22, -18); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, -23, 25, 19, 0, 0, TAU); c.fillStyle = cl.c; c.fill(); c.stroke();
    c.save(); c.beginPath(); c.ellipse(0, -23, 24, 18, 0, 0, TAU); c.clip(); c.fillStyle = shade(cl.c, .35); c.globalAlpha = .55; c.beginPath(); c.ellipse(6, -12, 18, 10, .1, 0, TAU); c.fill(); c.restore();
    if (pose !== 'fly') {
      const wa = pose === 'happy' ? -1.1 + Math.sin(t * 16) * .5 : pose === 'climb' ? -.5 + Math.sin(ph) * .8 : pose === 'run' ? Math.sin(ph) * .5 + .3 : pose === 'swim' ? Math.sin(ph) * .5 + .2 : .1;
      c.save(); c.translate(-3, -29); c.rotate(wa); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-16, 2, -17, 12); c.quadraticCurveTo(-5, 18, 5, 8); c.quadraticCurveTo(8, 2, 0, 0); c.closePath(); c.fillStyle = cl.d; c.fill(); c.stroke(); c.restore();
    }
    dkNeck(c, look.neck, t, false);
    c.beginPath(); c.arc(hx, hy, 14, 0, TAU); c.fillStyle = headCol; c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(hx - 4, hy - 7, 6, 3, -.5, 0, TAU); c.fill();
    c.fillStyle = cl.b; c.beginPath();
    const open = pose === 'happy' || o.talk ? 3 + Math.abs(Math.sin(t * 14)) * 3 : 0;
    c.moveTo(hx + 10, hy + 1); c.quadraticCurveTo(hx + 20, hy - 5, hx + 26, hy - 1 - open * .3); c.quadraticCurveTo(hx + 28, hy + 1, hx + 25, hy + 2); c.lineTo(hx + 10, hy + 2); c.closePath(); c.fill(); c.stroke();
    if (open > 1) { c.fillStyle = '#7a1f2b'; c.beginPath(); c.moveTo(hx + 10, hy + 2); c.lineTo(hx + 23, hy + 2.5); c.quadraticCurveTo(hx + 22, hy + 3 + open, hx + 17, hy + 3.5 + open); c.lineTo(hx + 10, hy + 3 + open); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(hx + 10, hy + 3 + open); c.quadraticCurveTo(hx + 20, hy + 3 + open, hx + 25, hy + 4 + open); c.quadraticCurveTo(hx + 20, hy + 9 + open, hx + 10, hy + 7 + open); c.closePath(); c.fillStyle = shade(cl.b, -.1); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,100,130,.4)'; c.beginPath(); c.ellipse(hx + 3, hy + 6, 4, 2.6, 0, 0, TAU); c.fill();
    const ex = hx + 5, ey = hy - 3, blink = (t % 4.1) < .12 || pose === 'sleep' || mood === 2;
    if (look.face !== 'shades' || true) {
      if (blink) { c.lineWidth = 2.4; c.beginPath(); c.moveTo(ex - 4, ey); c.quadraticCurveTo(ex, ey + 3, ex + 4, ey); c.stroke(); }
      else { c.fillStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.ellipse(ex, ey, 5, 5.6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#1a1226'; c.beginPath(); c.arc(ex + 1.6 + (o.look2 || 0), ey + .6, 2.8, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + 2.4 + (o.look2 || 0), ey - .6, 1, 0, TAU); c.fill(); }
    }
    if (mood === 1 || pose === 'sad') { c.lineWidth = 2.4; c.beginPath(); c.moveTo(ex - 6, ey - 8); c.lineTo(ex + 4, ey - 6); c.stroke(); }
    if (look.face) dkFace(c, look.face, ex, ey);
    if (look.hat) { c.save(); c.translate(hx, hy); c.rotate(pose === 'sad' ? .08 : 0); dkHat(c, look.hat); c.restore(); }
    if (pose === 'fly') {
      const a = Math.sin(t * 14) * .95 - .15;
      for (const k of [0, 1]) {
        c.save(); c.translate(-4 - k * 4, -32); c.rotate(-a * (k ? .8 : 1) - .2);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -26, -2, -46); c.quadraticCurveTo(8, -30, 12, -4); c.quadraticCurveTo(8, 4, 0, 0); c.closePath();
        c.fillStyle = k ? shade(cl.d, -.12) : cl.d; c.fill(); c.stroke();
        c.strokeStyle = shade(cl.d, -.3); c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -6); c.lineTo(-1, -32); c.moveTo(5, -6); c.lineTo(5, -26); c.stroke(); c.strokeStyle = '#2a2438'; c.lineWidth = 2.6;
        c.restore();
      }
    }
    if (pose === 'climb') {
      const sw = Math.sin(ph * .6);
      c.save(); c.translate(10, -30 - sw * 4); c.rotate(-.9 - sw * .4);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(0, 8); c.lineTo(0, -22); c.stroke();
      c.strokeStyle = '#2a2438'; c.lineWidth = 2.2; c.fillStyle = '#c9d1da'; c.beginPath(); c.moveTo(-8, -22); c.lineTo(8, -22); c.lineTo(10, -17); c.lineTo(-10, -17); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    if (pose === 'sleep') { c.fillStyle = '#fff'; c.font = '900 14px ' + FONT; c.fillText('z', hx + 18, hy - 20 - Math.sin(t * 2) * 3); c.font = '900 10px ' + FONT; c.fillText('z', hx + 28, hy - 30 - Math.sin(t * 2 + 1) * 3); }
    c.restore();
  };

  const duckHeadPreview = (c, x, y, s, look, itemId) => {
    const cl = DK.CB[look.col] || DK.COLS[0], it = itemId ? DK.IB[itemId] : null;
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.6; c.strokeStyle = '#2a2438';
    c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fillStyle = cl.head || cl.c; c.fill(); c.stroke();
    c.fillStyle = cl.b; c.beginPath(); c.moveTo(10, 1); c.quadraticCurveTo(20, -5, 28, -1); c.quadraticCurveTo(30, 2, 26, 4); c.quadraticCurveTo(18, 8, 10, 6); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.ellipse(5, -3, 5, 5.6, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#1a1226'; c.beginPath(); c.arc(6.6, -2.4, 2.8, 0, TAU); c.fill();
    const lk = it ? it : null;
    if (lk && lk.slot === 'face') dkFace(c, lk.id, 5, -3);
    else if (look.face) dkFace(c, look.face, 5, -3);
    c.save(); c.translate(0, 0); c.scale(1.12, 1.12);
    if (lk && lk.slot === 'hat') dkHat(c, lk.id); else if (look.hat) dkHat(c, look.hat);
    c.restore();
    c.restore();
  };

  const dkSkyCloud = (c, x, y, s, col = '#fff') => {
    c.fillStyle = col; c.beginPath(); c.arc(x, y, 22 * s, 0, TAU); c.arc(x + 24 * s, y - 10 * s, 28 * s, 0, TAU); c.arc(x + 52 * s, y, 22 * s, 0, TAU); c.rect(x, y, 52 * s, 22 * s); c.fill();
  };

  const mountDuck = (root, api) => {
    let FD = 1 / 60;
    const W = 960, H = 600, S = makeStage(api, W, H), c = S.ctx, au = S.au;
    const music = makeMusic(au, { bpm: 126, root: 293.66, scale: [0, 2, 4, 7, 9], pat: [0, 2, 4, 2, 5, 4, 2, -1, 3, 4, 5, 7, 5, 4, 2, 0], bass: [0, 3, 4, 2], vol: .026, wave: 'triangle' });
    const defSave = () => ({ name: 'Quackers', look: dkLook(), owned: {}, cols: { yellow: 1 }, st: { run: { lv: 1, xp: 0 }, swim: { lv: 1, xp: 0 }, fly: { lv: 1, xp: 0 }, climb: { lv: 1, xp: 0 } }, energy: 100, seeds: 6, money: 25, runs: [[], [], [], [], [], []], trophy: [0, 0, 0, 0, 0, 0], champ: false, nraces: 0, wins: 0, trains: 0, tut: 0, mus: true, bestM: { run: 0, swim: 0, fly: 0, climb: 0 } });
    const sv = svOnly(defSave(), svFix(defSave(), api.load()));
    for (const sl of DK.SLOTS) if (sv.look[sl] != null && !(DK.IB[sv.look[sl]] && DK.IB[sv.look[sl]].slot === sl)) sv.look[sl] = null;
    if (!DK.CB[sv.look.col]) sv.look.col = 'yellow';
    { const st0 = {}; for (const d of DK.STATS) { const q = sv.st[d.id] && typeof sv.st[d.id] === 'object' ? sv.st[d.id] : { lv: 1, xp: 0 }; st0[d.id] = { lv: clamp(Math.floor(q.lv) || 1, 1, 40), xp: clamp(+q.xp || 0, 0, 1e6) }; } sv.st = st0; }
    sv.name = String(sv.name).slice(0, 16) || 'Quackers';
    for (const k of ['bestM']) for (const d of DK.STATS) sv[k][d.id] = clamp(+sv[k][d.id] || 0, 0, 1e6);
    for (const k of ['owned', 'cols']) if (!sv[k] || typeof sv[k] !== 'object' || Array.isArray(sv[k])) sv[k] = k === 'cols' ? { yellow: 1 } : {};
    for (const k of ['nraces', 'wins', 'trains', 'tut']) sv[k] = clamp(Math.floor(+sv[k] || 0), 0, 1e7);
    sv.runs = sv.runs.length === 6 && sv.runs.every(r => Array.isArray(r) && r.every(x => Array.isArray(x) && Array.isArray(x[1]) && x[1].length === 5)) ? sv.runs : defSave().runs;
    sv.trophy = sv.trophy.length === 6 ? sv.trophy.map(t => clamp(Math.floor(t) || 0, 0, 5)) : defSave().trophy;
    sv.energy = clamp(sv.energy, 0, 100); sv.money = Math.max(0, sv.money); sv.seeds = Math.max(0, sv.seeds);
    { const d = defSave(); sv.look = Object.assign(d.look, sv.look); for (const k in d.st) sv.st[k] = Object.assign(d.st[k], sv.st[k]); sv.bestM = Object.assign(d.bestM, sv.bestM); sv.cols = sv.cols || { yellow: 1 }; sv.owned = sv.owned || {}; sv.runs = sv.runs && sv.runs.length === 6 ? sv.runs : d.runs; sv.trophy = sv.trophy && sv.trophy.length === 6 ? sv.trophy : d.trophy; }
    if (!sv.mus && music.on) music.toggle();
    let lastSub = 0;
    const progress = () => DK.STATS.reduce((a, s) => a + sv.st[s.id].lv, 0) * 100 + sv.trophy.reduce((a, t) => a + (t ? 5 - t : 0) * 400, 0) + (sv.champ ? 20000 : 0) + sv.wins * 25;
    const persist = () => { api.save(sv); api.score(progress()); if (Date.now() - lastSub > 30000) { lastSub = Date.now(); api.submit(progress()); } };
    const bonus = k => DK.SLOTS.reduce((a, sl) => a + (sv.look[sl] ? (DK.IB[sv.look[sl]].b[k] || 0) : 0), 0);
    const lvE = k => sv.st[k].lv + bonus(k);
    const MAXLV = 40, TCOST = 22, RCOST = 12;
    let scene = 'title', st = { t: 0 }, toastT = 0, toastS = '', confirmReset = false, modal = null;
    const toast = s => { toastS = s; toastT = 2.4; };
    const bar = (x, y, w, h, f, col, bg = 'rgba(42,36,56,.28)') => { rrp(c, x, y, w, h, h / 2); c.fillStyle = bg; c.fill(); if (f > .002) { rrp(c, x, y, Math.max(h, w * clamp(f, 0, 1)), h, h / 2); c.fillStyle = col; c.fill(); c.save(); rrp(c, x + 2, y + 2, Math.max(h - 4, w * clamp(f, 0, 1) - 4), h * .35, h * .2); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill(); c.restore(); } c.lineWidth = 2; c.strokeStyle = 'rgba(42,36,56,.7)'; rrp(c, x, y, w, h, h / 2); c.stroke(); };
    const quack = (p = 1) => { au.tone(540 * p, .09, 'square', .045, 400 * p); au.tone(470 * p, .13, 'square', .045, 330 * p, .1); };
    const sfx = {
      coin: () => { au.tone(1200, .07, 'square', .04); au.tone(1700, .12, 'square', .04, 0, .06); },
      splash: () => au.noise(.28, .1, 2200, 0, 'lowpass', 400),
      flap: () => au.noise(.07, .05, 2400, 0, 'bandpass', 900),
      jump: () => au.tone(320, .12, 'sine', .07, 640),
      thud: () => { au.tone(120, .15, 'sawtooth', .06, 60); au.noise(.1, .06, 500, 0, 'lowpass'); },
      beep: hi => au.tone(hi ? 880 : 440, hi ? .4 : .14, 'square', .05),
      cheer: () => { au.noise(.9, .07, 1600, 0, 'bandpass', 900); for (let i = 0; i < 5; i++) au.tone(520 + i * 120, .14, 'triangle', .05, 0, .06 * i); },
      lvl: () => { for (let i = 0; i < 5; i++) au.tone(520 * Math.pow(1.26, i), .16, 'triangle', .06, 0, i * .08); },
      click: () => au.tone(600, .05, 'sine', .04),
      eat: () => { au.noise(.06, .06, 3000, 0, 'highpass'); au.tone(700, .06, 'triangle', .05, 900, .07); au.tone(880, .08, 'triangle', .05, 0, .13); }
    };
    const addXp = (k, xp) => {
      const s = sv.st[k], from = s.lv; s.xp += xp;
      while (s.lv < MAXLV && s.xp >= dkNeed(s.lv)) { s.xp -= dkNeed(s.lv); s.lv++; }
      if (s.lv >= MAXLV) s.xp = 0;
      return s.lv - from;
    };
    const eat = () => {
      if (sv.seeds <= 0) { toast('No seeds left. Buy more in the shop or win races.'); return false; }
      if (sv.energy >= 100) { toast('Your duck is full of energy!'); return false; }
      sv.seeds--; sv.energy = Math.min(100, sv.energy + 35); sfx.eat(); persist(); return true;
    };

    const stIcon = (k, x, y, r, on = true) => {
      const s = DK.STATS.find(q => q.id === k);
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = on ? s.col : '#b9b2c9'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = '#2a2438'; c.stroke();
      c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineWidth = r * .16; c.lineCap = 'round'; c.lineJoin = 'round';
      const u = r / 16;
      c.save(); c.translate(x, y); c.scale(u, u);
      if (k === 'run') { c.beginPath(); c.moveTo(-8, 6); c.lineTo(-2, 2); c.lineTo(3, 7); c.moveTo(-2, 2); c.lineTo(2, -5); c.lineTo(9, -4); c.moveTo(2, -5); c.lineTo(-5, -4); c.stroke(); c.beginPath(); c.arc(4, -10, 3, 0, TAU); c.fill(); }
      else if (k === 'swim') { c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-5, -5, 0, 0); c.quadraticCurveTo(5, 5, 10, 0); c.moveTo(-10, 7); c.quadraticCurveTo(-5, 2, 0, 7); c.quadraticCurveTo(5, 12, 10, 7); c.stroke(); c.beginPath(); c.arc(0, -7, 3, 0, TAU); c.fill(); }
      else if (k === 'fly') { c.beginPath(); c.moveTo(-11, 3); c.quadraticCurveTo(-6, -9, 0, 2); c.quadraticCurveTo(6, -9, 11, 3); c.quadraticCurveTo(5, 0, 0, 8); c.quadraticCurveTo(-5, 0, -11, 3); c.closePath(); c.fill(); }
      else { c.beginPath(); c.moveTo(-9, 9); c.lineTo(-1, -8); c.lineTo(3, -1); c.lineTo(6, -5); c.lineTo(11, 9); c.closePath(); c.fill(); }
      c.restore();
    };
    const bolt = (x, y, r, col = '#ffd23f') => { c.beginPath(); c.moveTo(x + r * .2, y - r); c.lineTo(x - r * .7, y + r * .15); c.lineTo(x - r * .05, y + r * .15); c.lineTo(x - r * .3, y + r); c.lineTo(x + r * .7, y - r * .2); c.lineTo(x + r * .05, y - r * .2); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 2; c.lineJoin = 'round'; c.strokeStyle = '#2a2438'; c.stroke(); };
    const seed = (x, y, r) => { c.save(); c.translate(x, y); c.rotate(-.6); c.beginPath(); c.ellipse(0, 0, r, r * .55, 0, 0, TAU); c.fillStyle = '#c9a46a'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a2438'; c.stroke(); c.beginPath(); c.moveTo(-r * .7, 0); c.lineTo(r * .7, 0); c.strokeStyle = '#8a6a3a'; c.stroke(); c.restore(); };

    const drawSky = (t, top = '#7ed0ff', bot = '#d9f4ff') => {
      const g = c.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,220,.35)'; c.beginPath(); c.arc(800, 110, 62, 0, TAU); c.fill(); c.fillStyle = '#fff6a8'; c.beginPath(); c.arc(800, 110, 44, 0, TAU); c.fill();
      for (let i = 0; i < 4; i++) dkSkyCloud(c, ((t * (6 + i * 3) + i * 330) % 1200) - 140, 70 + i * 52, .8 + i * .12, 'rgba(255,255,255,.92)');
    };
    const drawFarm = t => {
      drawSky(t);
      c.fillStyle = '#9fdc8e'; c.beginPath(); c.moveTo(0, 330); c.quadraticCurveTo(160, 250, 320, 320); c.quadraticCurveTo(520, 380, 700, 300); c.quadraticCurveTo(840, 250, 960, 310); c.lineTo(960, 600); c.lineTo(0, 600); c.fill();
      c.fillStyle = '#7bc86c'; c.beginPath(); c.moveTo(0, 380); c.quadraticCurveTo(240, 330, 480, 385); c.quadraticCurveTo(720, 430, 960, 360); c.lineTo(960, 600); c.lineTo(0, 600); c.fill();
      c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      c.fillStyle = '#c0392b'; c.beginPath(); c.rect(70, 258, 150, 112); c.fill(); c.stroke();
      c.fillStyle = '#8f2a1f'; c.beginPath(); c.moveTo(56, 262); c.lineTo(145, 196); c.lineTo(234, 262); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); rrp(c, 110, 296, 70, 74, 4); c.fill(); c.stroke(); c.beginPath(); c.moveTo(110, 296); c.lineTo(180, 370); c.moveTo(180, 296); c.lineTo(110, 370); c.stroke();
      c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(145, 240, 10, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#3fb4e8'; c.beginPath(); c.ellipse(790, 430, 130, 34, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2.5; for (let i = 0; i < 3; i++) { const r = ((t * .5 + i / 3) % 1); c.globalAlpha = 1 - r; c.beginPath(); c.ellipse(780 + i * 30, 430 + (i - 1) * 8, 12 + r * 40, 4 + r * 10, 0, 0, TAU); c.stroke(); } c.globalAlpha = 1;
      c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.fillStyle = '#5a8f3a'; for (const rx of [680, 700, 906]) { c.beginPath(); c.moveTo(rx, 440); c.quadraticCurveTo(rx - 8, 400, rx - 2, 380 + Math.sin(t * 2 + rx) * 3); c.stroke(); c.fillStyle = '#7a5230'; c.beginPath(); c.ellipse(rx - 2, 380, 4, 10, 0, 0, TAU); c.fill(); c.stroke(); }
      c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.fillStyle = '#e8c78a';
      for (let x = 250; x < 640; x += 52) { c.beginPath(); rrp(c, x, 372, 10, 46, 3); c.fill(); c.stroke(); }
      c.beginPath(); rrp(c, 244, 382, 410, 8, 3); c.fill(); c.stroke(); c.beginPath(); rrp(c, 244, 402, 410, 8, 3); c.fill(); c.stroke();
      const rg = mulberry(7); for (let i = 0; i < 26; i++) { const x = rg() * W, y = 440 + rg() * 150, col = ['#ff6b8b', '#ffd23f', '#fff', '#b78cf5'][i % 4]; c.fillStyle = '#4a9a3a'; c.fillRect(x - 1, y, 2, 9); c.fillStyle = col; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); c.fillStyle = '#ffb703'; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); }
    };

    const drawHud = (showCoins = true) => {
      S.panel(8, 8, 312, 44, { fill: 'rgba(255,248,231,.96)', r: 14, lw: 3, sh: 3 });
      S.text(sv.name, 22, 24, S.fit(sv.name, 130, 17), '#2a2438', 'left');
      bolt(26, 41, 8); bar(40, 36, 150, 12, sv.energy / 100, sv.energy < TCOST ? '#e63946' : '#ffb703');
      S.text(String(Math.round(sv.energy)), 198, 42, 13, '#2a2438', 'left');
      seed(236, 40, 8); S.text('x' + sv.seeds, 248, 41, 15, '#2a2438', 'left');
      if (S.btn(274, 12, 42, 36, '', { color: sv.seeds > 0 && sv.energy < 100 ? '#3ecf6c' : '#b9b2c9', r: 10, icon: (x, y) => { seed(x - 1, y + 1, 9); S.text('+', x + 10, y - 7, 15, '#fff', 'center', '#2a2438'); } })) eat();
      if (showCoins) { S.panel(W - 150, 8, 142, 40, { fill: 'rgba(255,248,231,.96)', r: 14, lw: 3, sh: 3 }); icoCoin(c, W - 130, 28, 12); S.text(money(sv.money), W - 112, 29, 20, '#b86b00', 'left'); }
    };

    const trophyIcon = (x, y, r, tier) => {
      const col = tier === 1 ? '#ffc928' : tier === 2 ? '#d5dde6' : tier === 3 ? '#d98c4a' : '#cbc5da';
      c.save(); c.translate(x, y); c.scale(r / 20, r / 20); c.lineJoin = 'round'; c.lineWidth = 2.6; c.strokeStyle = '#2a2438';
      c.beginPath(); c.moveTo(-12, -14); c.lineTo(12, -14); c.quadraticCurveTo(12, 6, 0, 8); c.quadraticCurveTo(-12, 6, -12, -14); c.closePath(); c.fillStyle = col; c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-12, -10); c.quadraticCurveTo(-21, -10, -17, 0); c.quadraticCurveTo(-14, 4, -9, 3); c.moveTo(12, -10); c.quadraticCurveTo(21, -10, 17, 0); c.quadraticCurveTo(14, 4, 9, 3); c.stroke();
      c.beginPath(); rrp(c, -3, 8, 6, 7, 1); c.fill(); c.stroke(); c.beginPath(); rrp(c, -9, 15, 18, 5, 2); c.fillStyle = shade(col, -.2); c.fill(); c.stroke();
      if (tier) { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-5, -8, 2.6, 6, .2, 0, TAU); c.fill(); }
      c.restore();
    };

    let hubDuck = { hop: 0, say: 0, msg: '' };
    const tipMsg = () => {
      if (sv.trains === 0) return 'Welcome! Press TRAIN to make me faster.';
      if (sv.nraces === 0 && sv.trains < 3) return 'Nice! Train a few more times, then try a race.';
      if (sv.nraces === 0) return 'Ready? Hit RACE and win the Meadow Cup!';
      if (sv.energy < TCOST) return 'I am tired. Feed me seeds!';
      return pick(['Quack!', 'Let us win a trophy!', 'Check the shop for hats!', 'Train the skill the next cup needs.', 'Mash those arrow keys in races!']);
    };
    const drawHub = () => {
      st.t += FD; S.lock = !!modal;
      drawFarm(S.t);
      const bx = 480, by = 482, s = 2.6;
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(bx, by + 4, 56 * (1 - hubDuck.hop * .003), 12, 0, 0, TAU); c.fill();
      hubDuck.hop = Math.max(0, hubDuck.hop - 280 * (1 / 60) * 1.1);
      duckDraw(c, bx, by - Math.sin(clamp(hubDuck.hop / 40, 0, 1) * Math.PI) * 40, s, { look: sv.look, t: S.t, pose: sv.energy < TCOST ? 'sad' : hubDuck.hop > 0 ? 'happy' : 'idle', talk: hubDuck.say > 0 });
      if (S.hover(bx - 70, by - 150, 140, 160)) S.cursor = 'pointer';
      if (S.clickIn(bx - 70, by - 150, 140, 160)) { hubDuck.hop = 40; hubDuck.say = 1.6; hubDuck.msg = tipMsg(); quack(1 + rnd(-.1, .15)); }
      hubDuck.say = Math.max(0, hubDuck.say - FD);
      if (hubDuck.say > 0) { const w = Math.min(380, S.tw(hubDuck.msg, 15) + 36); S.panel(bx - w / 2, 230, w, 40, { fill: '#fff', r: 14, lw: 3, sh: 3 }); S.text(hubDuck.msg, bx, 250, 15, '#2a2438'); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(bx - 8, 269); c.lineTo(bx, 282); c.lineTo(bx + 8, 269); c.fill(); }
      drawHud();
      S.panel(12, 66, 232, 232, { fill: 'rgba(255,248,231,.95)', r: 16, lw: 3, sh: 4 });
      S.text('SKILLS', 128, 84, 14, '#8a7a9a', 'center', null, 900);
      DK.STATS.forEach((s2, i) => {
        const y = 100 + i * 48, lv = sv.st[s2.id].lv, b = bonus(s2.id);
        stIcon(s2.id, 40, y + 18, 15);
        S.text(s2.n, 64, y + 8, 15, '#2a2438', 'left'); S.text(i18('Lv {n}', { n: lv }) + (b ? ' +' + b : ''), 232, y + 8, 15, b ? '#2e9c53' : '#2a2438', 'right');
        bar(64, y + 22, 168, 11, lv >= MAXLV ? 1 : sv.st[s2.id].xp / dkNeed(lv), s2.col);
      });
      S.panel(W - 244, 66, 232, 172, { fill: 'rgba(255,248,231,.95)', r: 16, lw: 3, sh: 4 });
      S.text('CUPS', W - 128, 84, 14, '#8a7a9a', 'center', null, 900);
      CUPS.forEach((cp, i) => { const x = W - 226 + (i % 3) * 72, y = 112 + Math.floor(i / 3) * 52; trophyIcon(x + 22, y + 10, 17, sv.trophy[i]); S.text(cp.short, x + 22, y + 38, 11, '#6a5a7a', 'center', null, 800); });
      S.text(i18('{n} race wins', { n: sv.wins }), W - 128, 222, 14, '#2a2438', 'center', null, 800);
      const need = sv.energy < TCOST;
      const bw = 190, gap = 18, x0 = W / 2 - (bw * 3 + gap * 2) / 2;
      if (S.btn(x0, 508, bw, 70, 'TRAIN', { color: '#ff7b54', size: 28, sub: i18('-{n} energy', { n: TCOST }), badge: need ? '!' : null })) { scene = 'trainmenu'; sfx.click(); }
      if (S.btn(x0 + bw + gap, 508, bw, 70, 'RACE', { color: '#3fa9f5', size: 28, sub: i18('-{n} energy', { n: RCOST }) })) { scene = 'map'; sfx.click(); }
      if (S.btn(x0 + (bw + gap) * 2, 508, bw, 70, 'SHOP', { color: '#9b7cf0', size: 28, sub: 'hats and colours' })) { scene = 'shop'; shopSel = null; sfx.click(); }
      if (S.btn(W - 58, H - 56, 46, 44, '?', { color: '#4cc9f0', size: 24, r: 12 })) modal = { k: 'help' };
      if (S.btn(12, H - 56, 46, 44, '', { color: music.on ? '#f08a4b' : '#8a7fa8', r: 12, icon: (x, y) => note(c, x, y) })) { music.toggle(); sv.mus = music.on; persist(); }
      if (S.key('KeyE')) eat();
      if (modal && modal.k === 'help') drawHelp();
    };
    const drawHelp = () => {
      S.lock = false; c.fillStyle = 'rgba(20,14,40,.72)'; c.fillRect(0, 0, W, H);
      const x = 110, y = 40, w = 740, h = 520; S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 240, y - 20, w - 480, 46, { fill: '#4cc9f0', r: 14, lw: 3, sh: 3 }); S.text('How to play', x + w / 2, y + 3, 26, '#fff', 'center', '#14607a');
      const items = [['TRAIN', 'Each skill has a minigame. Run, swim, fly and climb to earn XP and level up. It costs energy.'], ['ENERGY', 'Eat seeds (E) to refill energy. Buy seeds in the shop or win them in races.'], ['RACE', 'Tournaments mix terrain: run and climb by alternating the left and right arrows (or A and D), jump with Space or Up, swim with Up and Down, fly by tapping Space.'], ['SHOP', 'Hats, goggles and capes give skill bonuses. Colours are pure style.'], ['GOAL', 'Finish top 3 in a cup to unlock the next one. Beat the Grand Championship to become the champion.']];
      items.forEach(([t, d], i) => { const yy = y + 44 + i * 82; S.text(t, x + 30, yy + 12, 20, '#c0392b', 'left'); S.wrap(d, x + 150, yy, w - 190, 20, 16, '#2a2438', 'left', 700); });
      S.text('Touch: tap the left half to run, swim and climb, the right half to jump, drag to steer in water.', x + w / 2, y + h - 66, 14, '#6a5a7a', 'center', null, 800);
      if (S.btn(x + w / 2 - 70, y + h - 48, 140, 38, 'Got it', { color: '#3ecf6c', size: 18 })) modal = null;
    };

    let shopSel = null, shopTab = 0, shopPage = 0;
    const equipped = it => sv.look[it.slot] === it.id;
    const drawShop = () => {
      S.lock = false;
      drawSky(S.t, '#b9a0f5', '#f2e8ff');
      c.fillStyle = '#8a6fd0'; c.fillRect(0, 430, W, 170); c.fillStyle = '#a58be8'; c.fillRect(0, 430, W, 8);
      drawHud();
      S.panel(30, 64, 300, 520, { fill: 'rgba(255,248,231,.96)', r: 20, lw: 4, sh: 5 });
      S.text(sv.name, 180, 92, S.fit(sv.name, 190, 24), '#2a2438');
      if (S.btn(44, 76, 34, 32, '<', { color: '#9b7cf0', size: 18, r: 10 })) { const i = DK.NAMES.indexOf(sv.name); sv.name = DK.NAMES[(i + DK.NAMES.length - 1) % DK.NAMES.length]; persist(); sfx.click(); }
      if (S.btn(282, 76, 34, 32, '>', { color: '#9b7cf0', size: 18, r: 10 })) { const i = DK.NAMES.indexOf(sv.name); sv.name = DK.NAMES[(i + 1) % DK.NAMES.length]; persist(); sfx.click(); }
      const pv = Object.assign({}, sv.look);
      if (shopSel) { if (shopSel.kind === 'item') pv[DK.IB[shopSel.id].slot] = shopSel.id; else pv.col = shopSel.id; }
      c.fillStyle = 'rgba(138,111,208,.25)'; c.beginPath(); c.ellipse(180, 380, 100, 20, 0, 0, TAU); c.fill();
      duckDraw(c, 180, 380, 3.4, { look: pv, t: S.t, pose: 'idle' });
      DK.STATS.forEach((s2, i) => { const x = 50 + (i % 2) * 140, y = 410 + Math.floor(i / 2) * 42; stIcon(s2.id, x + 12, y + 14, 11); const b = bonus(s2.id); S.text(i18('Lv {n}', { n: sv.st[s2.id].lv }), x + 30, y + 14, 14, '#2a2438', 'left'); if (b) S.text('+' + b, x + 82, y + 14, 14, '#2e9c53', 'left'); });
      S.text('Click an owned item to wear it again to remove it', 180, 560, 11, '#8a7a9a', 'center', null, 800);
      const tabs = ['Hats', 'Faces', 'Neck', 'Colours'];
      tabs.forEach((t, i) => { if (S.btn(350 + i * 144, 64, 136, 40, t, { color: shopTab === i ? '#ffd23f' : '#c9bfe6', textc: shopTab === i ? '#6a3a00' : '#fff', size: 17, on: shopTab === i, r: 12 })) { shopTab = i; shopPage = 0; sfx.click(); } });
      const list = shopTab === 3 ? DK.COLS : DK.ITEMS.filter(it => it.slot === DK.SLOTS[shopTab]);
      const per = 6, pages = Math.ceil(list.length / per); shopPage = Math.min(shopPage, pages - 1);
      let hov = null;
      list.slice(shopPage * per, shopPage * per + per).forEach((it, i) => {
        const x = 350 + (i % 2) * 288, y = 124 + Math.floor(i / 2) * 134, isCol = shopTab === 3;
        const owned = isCol ? !!sv.cols[it.id] : !!sv.owned[it.id], eq = isCol ? sv.look.col === it.id : equipped(it);
        const price = it.cost, can = sv.money >= price, h = S.hover(x, y, 276, 122);
        if (h) hov = it;
        S.panel(x, y, 276, 122, { fill: eq ? '#e5ffe9' : h ? '#fffdf2' : '#fff', line: eq ? '#2e9c53' : '#2a2438', r: 16, lw: 3, sh: 4 });
        c.save(); c.beginPath(); rrp(c, x + 10, y + 10, 70, 70, 12); c.fillStyle = '#efe8ff'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a2438'; c.stroke(); c.clip();
        duckHeadPreview(c, x + 42, y + 52, 1.5, isCol ? Object.assign({}, sv.look, { col: it.id, hat: null, face: null }) : Object.assign({}, sv.look, { col: sv.look.col }), isCol ? null : it.id); c.restore();
        S.text(it.n, x + 90, y + 24, S.fit(it.n, 176, 17), '#2a2438', 'left');
        if (!isCol) S.wrap(it.d, x + 90, y + 38, 176, 15, 12, it.b && Object.keys(it.b).length ? '#2e9c53' : '#6a5a7a', 'left', 800);
        else S.text(owned ? 'Owned' : 'A fresh coat of feathers', x + 90, y + 44, 12, '#6a5a7a', 'left', null, 800);
        if (eq) { S.text('WEARING', x + 90, y + 100, 15, '#2e9c53', 'left'); if (S.btn(x + 180, y + 84, 86, 30, isCol ? '' : 'Remove', { color: '#8a7fa8', size: 14, r: 10, enabled: !isCol })) { sv.look[it.slot] = null; persist(); sfx.click(); } }
        else if (owned) { if (S.btn(x + 160, y + 82, 106, 34, 'Wear', { color: '#3ecf6c', size: 16, r: 10 })) { if (isCol) sv.look.col = it.id; else sv.look[it.slot] = it.id; persist(); sfx.click(); quack(1.15); } }
        else if (S.btn(x + 160, y + 82, 106, 34, '$' + price, { color: can ? '#ffb703' : '#b9b2c9', size: 17, r: 10, enabled: can })) {
          sv.money -= price; if (isCol) { sv.cols[it.id] = 1; sv.look.col = it.id; } else { sv.owned[it.id] = 1; sv.look[it.slot] = it.id; }
          persist(); sfx.coin(); sfx.cheer(); S.mkScr = true; S.confetti(180, 330, 40); S.mkScr = false;
        }
      });
      shopSel = hov ? (shopTab === 3 ? { kind: 'col', id: hov.id } : { kind: 'item', id: hov.id }) : null;
      if (pages > 1) {
        if (S.btn(560, 544, 44, 34, '<', { color: '#9b7cf0', size: 18, r: 10, enabled: shopPage > 0 })) shopPage--;
        S.text(`${shopPage + 1} / ${pages}`, 640, 562, 16, '#fff', 'center', '#4a3a8a');
        if (S.btn(676, 544, 44, 34, '>', { color: '#9b7cf0', size: 18, r: 10, enabled: shopPage < pages - 1 })) shopPage++;
      }
      S.text('Seeds', 780, 548, 14, '#fff', 'left', '#4a3a8a');
      if (S.btn(830, 540, 100, 40, '$14 seed', { color: sv.money >= 14 ? '#3ecf6c' : '#b9b2c9', size: 14, r: 10, enabled: sv.money >= 14, icon: (x, y) => seed(x - 4, y, 8) })) { sv.money -= 14; sv.seeds++; persist(); sfx.coin(); }
      if (S.btn(350, 540, 110, 40, 'Back', { color: '#e8584a', size: 18 })) { scene = 'hub'; sfx.click(); }
    };

    const thumb = (k, x, y, w, h, t) => {
      c.save(); c.beginPath(); rrp(c, x, y, w, h, 14); c.clip();
      if (k === 'run') { const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#8fd8ff'); g.addColorStop(1, '#eaf8ff'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = '#d9533f'; c.fillRect(x, y + h * .62, w, h * .38); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x, y + h * .62 + i * h * .12); c.lineTo(x + w, y + h * .62 + i * h * .12); c.stroke(); } c.fillStyle = '#fff'; c.fillRect(x + w * .72, y + h * .5, 6, h * .22); c.fillRect(x + w * .72 + 26, y + h * .5, 6, h * .22); c.fillRect(x + w * .72, y + h * .5, 32, 6); }
      else if (k === 'swim') { const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#9fe3ff'); g.addColorStop(.3, '#3fb4e8'); g.addColorStop(1, '#1c64b5'); c.fillStyle = g; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= w; i += 8) c.lineTo(x + i, y + h * .3 + Math.sin(i * .12 + t * 3) * 4); c.stroke(); c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.arc(x + w * .75, y + h * .62, 14, 0, TAU); c.stroke(); }
      else if (k === 'fly') { const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#5fb0ff'); g.addColorStop(1, '#d9f4ff'); c.fillStyle = g; c.fillRect(x, y, w, h); dkSkyCloud(c, x + 30 + Math.sin(t) * 8, y + h * .6, .7); dkSkyCloud(c, x + w * .6, y + h * .3, .5); c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.ellipse(x + w * .78, y + h * .5, 10, 22, 0, 0, TAU); c.stroke(); }
      else { c.fillStyle = '#ffcf9a'; c.fillRect(x, y, w, h); c.fillStyle = '#a7805a'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + h * .75); c.lineTo(x + w, y + h * .1); c.lineTo(x + w, y + h); c.fill(); c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + h * .75); c.lineTo(x + w, y + h * .1); c.stroke(); c.fillStyle = '#8a8a96'; c.beginPath(); c.arc(x + w * .62, y + h * .28, 14, 0, TAU); c.fill(); c.stroke(); }
      c.restore();
      duckDraw(c, x + w * .34, y + h * (k === 'swim' ? .66 : k === 'fly' ? .72 : k === 'climb' ? .66 : .9), .95, { look: sv.look, t, pose: k, rot: k === 'climb' ? -.45 : 0 });
    };
    const drawTrainMenu = () => {
      S.lock = false;
      drawSky(S.t, '#ffb88a', '#ffe8d0'); c.fillStyle = '#7bc86c'; c.fillRect(0, 470, W, 130);
      drawHud();
      S.panel(W / 2 - 170, 60, 340, 48, { fill: '#ff7b54', r: 16, lw: 4, sh: 4 }); S.text('Training grounds', W / 2, 85, 26, '#fff', 'center', '#8a2e10');
      DK.STATS.forEach((s2, i) => {
        const x = 30 + (i % 2) * 455, y = 124 + Math.floor(i / 2) * 190, w = 445, h = 176;
        S.panel(x, y, w, h, { fill: '#fff8e7', r: 20, lw: 4, sh: 5 });
        thumb(s2.id, x + 12, y + 12, 180, 152, S.t);
        const lv = sv.st[s2.id].lv, b = bonus(s2.id), can = sv.energy >= TCOST;
        stIcon(s2.id, x + 218, y + 32, 15); S.text(s2.n, x + 240, y + 30, 21, '#2a2438', 'left');
        S.text(i18('Lv {n}', { n: lv }) + (b ? ' +' + b : ''), x + w - 16, y + 30, 20, b ? '#2e9c53' : '#c0392b', 'right');
        bar(x + 204, y + 52, w - 224, 12, lv >= MAXLV ? 1 : sv.st[s2.id].xp / dkNeed(lv), s2.col);
        S.text(lv >= MAXLV ? 'MAX' : `${sv.st[s2.id].xp} / ${dkNeed(lv)} XP`, x + 204, y + 78, 13, '#6a5a7a', 'left', null, 800);
        S.text(i18('Best {n} m', { n: Math.round(sv.bestM[s2.id]) }), x + w - 16, y + 78, 13, '#6a5a7a', 'right', null, 800);
        if (S.btn(x + 204, y + 96, w - 224, 56, can ? 'Train!' : 'Too tired', { color: can ? s2.col : '#b9b2c9', size: 22, sub: can ? i18('-{n} energy', { n: TCOST }) : 'eat a seed first', enabled: can })) startTrain(s2.id);
      });
      if (S.btn(30, 520, 120, 48, 'Back', { color: '#e8584a', size: 20 })) { scene = 'hub'; sfx.click(); }
    };

    const CB = { l: [20, 498, 116, 78], r: [146, 498, 116, 78], a: [698, 498, 242, 78], d: [580, 498, 108, 78] };
    const inR = (r, x = S.mx, y = S.my) => S.inside(r[0], r[1], r[2], r[3], x, y);
    let tapSide = 0;
    const readCtl = mode => {
      const k = c2 => S.ks(c2), has = c2 => S.keys.has(c2);
      const ctl = { l: k('ArrowLeft') || k('KeyA'), r: k('ArrowRight') || k('KeyD'), a: k('Space') || k('ArrowUp') || k('KeyW'), up: has('ArrowUp') || has('KeyW'), dn: has('ArrowDown') || has('KeyS'), ptrY: null, hl: has('ArrowLeft') || has('KeyA'), hr: has('ArrowRight') || has('KeyD'), ha: has('Space') || has('ArrowUp') || has('KeyW') };
      if (S.pressedS) {
        if (mode === 'fly') { if (!inR(CB.d)) ctl.a = true; }
        else if (inR(CB.l)) ctl.l = true;
        else if (inR(CB.r)) ctl.r = true;
        else if ((mode === 'run' || mode === 'climb') && inR(CB.a)) ctl.a = true;
        else if (S.touch && S.my > 120 && !inR(CB.d) && !inR(CB.a)) {
          if (S.mx < 520) { ctl[tapSide ? 'l' : 'r'] = true; tapSide ^= 1; }
          else if (mode === 'run' || mode === 'climb') ctl.a = true;
        }
      }
      if (S.down) {
        const dn = inR(CB.d, S.downX, S.downY) && inR(CB.d), au2 = inR(CB.a, S.downX, S.downY) && inR(CB.a);
        if (dn) { ctl.dn = true; ctl.hd = true; }
        if (au2 && mode === 'swim') { ctl.up = true; ctl.hu = true; }
        if (mode === 'swim' && !dn && !au2 && S.downY < 490 && S.my < 490 && !inR(CB.l, S.downX, S.downY) && !inR(CB.r, S.downX, S.downY)) ctl.ptrY = S.my;
        if (inR(CB.l, S.downX, S.downY) && inR(CB.l)) ctl.hl = true;
        if (inR(CB.r, S.downX, S.downY) && inR(CB.r)) ctl.hr = true;
        if (au2 && mode !== 'swim') ctl.ha = true;
      }
      return ctl;
    };
    const feed = (m, ctl, dt, fly) => {
      if (ctl.l) { m.pace += m.last === 'l' ? .35 : 1; m.last = 'l'; }
      if (ctl.r) { m.pace += m.last === 'r' ? .35 : 1; m.last = 'r'; }
      if (fly && ctl.a) m.pace += 1;
      m.pace *= Math.exp(-2.5 * dt);
    };
    const effOf = (m, fly) => clamp(m.pace / (fly ? 1.5 : S.touch ? 2.4 : 3), 0, 1);
    const drawCtl = (mode, ctl, label) => {
      const btn = (r, lab, sub, col, on, tri) => {
        c.save(); c.globalAlpha = on ? .96 : .66; S.panel(r[0], r[1] + (on ? 3 : 0), r[2], r[3] - (on ? 3 : 0), { fill: col, r: 18, lw: 3, sh: on ? 0 : 4 }); c.globalAlpha = 1;
        if (tri) { c.fillStyle = '#fff'; c.strokeStyle = '#2a2438'; c.lineWidth = 2.5; c.beginPath(); const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2 - 8, d = tri; c.moveTo(cx - 14 * d, cy); c.lineTo(cx + 10 * d, cy - 16); c.lineTo(cx + 10 * d, cy + 16); c.closePath(); c.fill(); c.stroke(); }
        else S.text(lab, r[0] + r[2] / 2, r[1] + r[3] / 2 - 8, 24, '#fff', 'center', '#2a2438');
        S.text(sub, r[0] + r[2] / 2, r[1] + r[3] - 16, 12, '#fff', 'center', '#2a2438', 800); c.restore();
      };
      if (mode !== 'fly') { btn(CB.l, '', 'A / left', '#3fa9f5', ctl.hl || ctl.l, 1); btn(CB.r, '', 'D / right', '#ff7b54', ctl.hr || ctl.r, -1); }
      if (mode === 'run' || mode === 'climb') btn(CB.a, 'JUMP', 'Space / Up', '#5fc26a', ctl.ha || ctl.a);
      if (mode === 'swim') { btn(CB.d, 'DIVE', 'Down / S', '#3fa9f5', ctl.dn); btn(CB.a, 'RISE', 'Up / W', '#5fc26a', ctl.up); }
      if (mode === 'fly') { btn(CB.a, 'FLAP', 'Space / tap', '#9b7cf0', ctl.ha || ctl.a); btn(CB.d, 'DIVE', 'Down / S', '#3fa9f5', ctl.dn); }
    };
    const popS = (x, y, s, col, sz = 24) => { S.mkScr = true; S.pop(x, y, s, col, sz); S.mkScr = false; };
    const sparkS = (x, y, n, col) => { S.mkScr = true; S.spark(x, y, n, col, 160, 300, .6); S.mkScr = false; };

    const XPF = { run: .2, swim: .24, fly: .21, climb: .3 };
    const TXT = {
      run: 'Alternate LEFT and RIGHT (A and D) as fast as you can to sprint. Press SPACE or UP to jump the hurdles.',
      swim: 'Mash LEFT and RIGHT to paddle. Steer with UP and DOWN, or drag with the mouse or a finger. Grab golden rings, dodge jellyfish, rocks and logs.',
      fly: 'Press SPACE (or click, or tap) in a steady rhythm to flap and stay in the air. Fly through golden rings. Avoid storm clouds and birds.',
      climb: 'Alternate LEFT and RIGHT (A and D) to climb the cliff. Press SPACE or UP to jump rolling boulders.'
    };
    let tr = null, lastCtl = {};
    const startTrain = k => {
      if (sv.energy < TCOST) { toast('Too tired! Feed your duck a seed.'); return; }
      tr = { k, phase: 'intro', t: 0, time: 25, m: { pace: 0, last: '' }, dist: 0, v: 0, jy: 0, jvy: 0, air: false, stun: 0, objs: [], nextObj: 520, cleared: 0, hits: 0, rings: 0, boost: 0, y: k === 'fly' ? 300 : 330, vy: 0, cd: 0, res: null, cnt: 3.4 };
      scene = 'train'; sfx.click();
    };
    const beginPlay = () => {
      if (sv.energy < TCOST) { toast('Too tired! Feed your duck a seed.'); scene = 'trainmenu'; return; }
      sv.energy -= TCOST; sv.trains++; tr.phase = 'count'; tr.cnt = 3.4; persist();
    };
    const finishTrain = () => {
      const k = tr.k, meters = tr.dist / 10, before = { lv: sv.st[k].lv, xp: sv.st[k].xp };
      const xp = Math.max(4, Math.round(meters * XPF[k] + tr.rings * 1.5 + tr.cleared));
      const up = addXp(k, xp), coins = Math.round(xp * .1);
      sv.money += coins; sv.bestM[k] = Math.max(sv.bestM[k], meters); persist();
      tr.res = { meters, xp, up, coins, before, t: 0, k }; tr.phase = 'result';
      if (up > 0) { sfx.lvl(); S.mkScr = true; S.confetti(W / 2, 330, 50); S.mkScr = false; } else sfx.cheer();
    };

    const groundSim = (dt, ctl, mode) => {
      const eff = effOf(tr.m, false), lv = lvE(mode), base = dkBase(mode, lv);
      const vt = base * (.35 + .86 * eff) * (tr.stun > 0 ? .3 : 1);
      tr.v += (vt - tr.v) * Math.min(1, dt * 4); tr.dist += tr.v * dt; tr.stun = Math.max(0, tr.stun - dt);
      if (ctl.a && !tr.air) { tr.jvy = 560; tr.air = true; sfx.jump(); }
      if (tr.air) { tr.jy += tr.jvy * dt; tr.jvy -= 1750 * dt; if (tr.jy <= 0) { tr.jy = 0; tr.air = false; } }
      while (tr.nextObj < tr.dist + 1100) { tr.objs.push({ wx: tr.nextObj, hit: false, ok: false, rot: 0 }); tr.nextObj += rnd(440, 650); }
      for (const o of tr.objs) {
        if (mode === 'climb') { o.wx -= 120 * dt; o.rot += dt * 4; }
        const rel = o.wx - tr.dist;
        if (!o.hit && !o.ok && Math.abs(rel) < (mode === 'climb' ? 26 : 20)) {
          if (tr.jy < (mode === 'climb' ? 40 : 34)) { o.hit = true; tr.stun = .75; tr.v *= .25; tr.hits++; sfx.thud(); S.shake = 6; popS(260, 330, 'Ouch!', '#ff9b9b'); }
          else { o.ok = true; tr.cleared++; sfx.coin(); popS(260, 330 - tr.jy, '+1', '#ffe14d', 22); }
        } else if (!o.ok && !o.hit && rel < -30) { o.ok = true; tr.cleared++; }
      }
      tr.objs = tr.objs.filter(o => o.wx - tr.dist > -260);
    };
    const swimSim = (dt, ctl) => {
      const eff = effOf(tr.m, false), lv = lvE('swim'), base = dkBase('swim', lv);
      const vt = base * (.35 + .86 * eff) * (tr.boost > 0 ? 1.3 : 1) * (tr.stun > 0 ? .3 : 1);
      tr.v += (vt - tr.v) * Math.min(1, dt * 4); tr.dist += tr.v * dt; tr.stun = Math.max(0, tr.stun - dt); tr.boost = Math.max(0, tr.boost - dt);
      if (ctl.ptrY != null) tr.y += (clamp(ctl.ptrY, 170, 505) - tr.y) * Math.min(1, dt * 9);
      else tr.y += ((ctl.dn ? 1 : 0) - (ctl.up ? 1 : 0)) * 310 * dt;
      tr.y = clamp(tr.y, 168, 510);
      while (tr.nextObj < tr.dist + 1100) {
        const r = Math.random(), t = r < .42 ? 'ring' : r < .62 ? 'jelly' : r < .8 ? 'rock' : 'log';
        tr.objs.push({ t, wx: tr.nextObj, y: t === 'ring' ? rnd(200, 490) : t === 'jelly' ? rnd(220, 440) : t === 'rock' ? 548 : 160, taken: false, hit: false, ph: rnd(0, 6) });
        tr.nextObj += rnd(250, 380);
      }
      for (const o of tr.objs) {
        const dx = o.wx - tr.dist, oy = o.t === 'jelly' ? o.y + Math.sin(S.t * 2 + o.ph) * 40 : o.y;
        if (o.taken || o.hit) continue;
        if (o.t === 'ring' && Math.abs(dx) < 30 && Math.abs(oy - tr.y) < 40) { o.taken = true; tr.rings++; tr.boost = 2; sfx.coin(); popS(260, tr.y - 30, 'BOOST', '#ffe14d', 22); sparkS(260, tr.y, 10, '#ffe14d'); }
        else if (o.t === 'jelly' && Math.abs(dx) < 34 && Math.abs(oy - tr.y) < 40) { o.hit = true; tr.stun = .8; tr.v *= .3; sfx.thud(); S.shake = 6; popS(260, tr.y - 30, 'Zap!', '#ff9bd0'); }
        else if (o.t === 'rock' && Math.abs(dx) < 34 && tr.y > 470) { o.hit = true; tr.stun = .8; tr.v *= .3; sfx.thud(); S.shake = 6; popS(260, tr.y - 30, 'Ouch!', '#ff9b9b'); }
        else if (o.t === 'log' && Math.abs(dx) < 48 && tr.y < 202) { o.hit = true; tr.stun = .8; tr.v *= .3; sfx.thud(); S.shake = 6; popS(260, tr.y + 30, 'Bonk!', '#ff9b9b'); }
      }
      tr.objs = tr.objs.filter(o => o.wx - tr.dist > -200);
    };
    const flySim = (dt, ctl) => {
      const lv = lvE('fly'), base = dkBase('fly', lv), grav = Math.max(520, 760 - lv * 5);
      tr.cd -= dt;
      if (ctl.a && tr.cd <= 0) { tr.vy = Math.max(tr.vy - 230, -350); tr.cd = .08; sfx.flap(); }
      tr.vy = clamp(tr.vy + (ctl.dn ? grav * 1.8 : grav) * dt, -360, 470); tr.y += tr.vy * dt;
      if (tr.y < 62) { tr.y = 62; tr.vy = Math.max(0, tr.vy); }
      if (tr.y > 515) { tr.y = 515; tr.vy = -280; tr.stun = .6; tr.v *= .4; sfx.thud(); S.shake = 6; popS(260, 470, 'Bump!', '#ff9b9b'); }
      const eff = effOf(tr.m, true), vt = base * (.35 + .86 * eff) * (tr.boost > 0 ? 1.3 : 1) * (tr.stun > 0 ? .35 : 1);
      tr.v += (vt - tr.v) * Math.min(1, dt * 4); tr.dist += tr.v * dt; tr.stun = Math.max(0, tr.stun - dt); tr.boost = Math.max(0, tr.boost - dt);
      while (tr.nextObj < tr.dist + 1100) {
        const r = Math.random(), t = r < .5 ? 'ring' : r < .75 ? 'cloud' : 'bird';
        tr.objs.push({ t, wx: tr.nextObj, y: rnd(110, 470), taken: false, hit: false, ph: rnd(0, 6) });
        tr.nextObj += rnd(250, 360);
      }
      for (const o of tr.objs) {
        if (o.t === 'bird') o.wx -= 110 * dt;
        const dx = o.wx - tr.dist; if (o.taken || o.hit) continue;
        if (o.t === 'ring' && Math.abs(dx) < 22 && Math.abs(o.y - tr.y) < 48) { o.taken = true; tr.rings++; tr.boost = 2; sfx.coin(); popS(260, tr.y - 40, 'BOOST', '#ffe14d', 22); sparkS(260, tr.y, 10, '#ffe14d'); }
        else if (o.t !== 'ring' && Math.hypot(dx, o.y - tr.y) < (o.t === 'cloud' ? 50 : 34)) { o.hit = true; tr.stun = .8; tr.v *= .35; tr.vy = 160; sfx.thud(); S.shake = 6; popS(260, tr.y - 30, o.t === 'cloud' ? 'Zap!' : 'Squawk!', '#ff9b9b'); }
      }
      tr.objs = tr.objs.filter(o => o.wx - tr.dist > -200);
    };

    const drawRing = (x, y, rx, ry, t) => {
      c.save(); c.translate(x, y); c.lineWidth = 7; c.strokeStyle = '#2a2438'; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.stroke();
      c.lineWidth = 4; c.strokeStyle = '#ffd23f'; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.stroke();
      c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(0, 0, rx - 1, ry - 1, 0, 3.6 + Math.sin(t * 3) * .2, 4.6); c.stroke(); c.restore();
    };
    const drawBoulder = (x, y, r, rot) => {
      c.save(); c.translate(x, y); c.rotate(rot); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr = r * (.88 + .12 * Math.sin(i * 2.7)); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fillStyle = '#9a8f86'; c.fill(); c.stroke();
      c.fillStyle = '#b8aea4'; c.beginPath(); c.arc(-r * .25, -r * .3, r * .35, 0, TAU); c.fill(); c.strokeStyle = '#6a625c'; c.lineWidth = 2; c.beginPath(); c.moveTo(r * .1, r * .1); c.lineTo(r * .5, r * .35); c.moveTo(-r * .4, r * .3); c.lineTo(-r * .1, r * .55); c.stroke(); c.restore();
    };
    const drawHurdle = (x, y) => {
      c.save(); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#fff';
      c.beginPath(); rrp(c, x - 18, y - 36, 6, 36, 2); c.fill(); c.stroke(); c.beginPath(); rrp(c, x + 12, y - 36, 6, 36, 2); c.fill(); c.stroke();
      c.beginPath(); rrp(c, x - 20, y - 38, 40, 10, 3); c.fillStyle = '#e63946'; c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(x - 6, y - 37, 8, 8); c.fillRect(x + 10, y - 37, 6, 8); c.restore();
    };
    const drawJelly = (x, y, t, ph) => {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      const sq = 1 + Math.sin(t * 5 + ph) * .1;
      c.strokeStyle = '#f08ad0'; c.lineWidth = 3.4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 8, 8); c.quadraticCurveTo(i * 8 + Math.sin(t * 4 + i) * 7, 24, i * 8 + Math.sin(t * 4 + i + 1) * 5, 40); c.stroke(); }
      c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, 8); c.quadraticCurveTo(-26 * sq, -34, 0, -34); c.quadraticCurveTo(26 * sq, -34, 26, 8); c.quadraticCurveTo(0, 14, -26, 8); c.closePath(); c.fillStyle = 'rgba(255,150,220,.92)'; c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-8, -20, 8, 5, -.4, 0, TAU); c.fill(); c.restore();
    };
    const drawBird = (x, y, t) => {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.scale(-1, 1);
      const w = Math.sin(t * 12) * 16;
      c.fillStyle = '#4a4a66'; c.beginPath(); c.ellipse(0, 0, 20, 12, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-4, -4); c.quadraticCurveTo(-8, -26 + w, 8, -30 + w); c.quadraticCurveTo(6, -10, 8, -2); c.closePath(); c.fillStyle = '#34344e'; c.fill(); c.stroke();
      c.fillStyle = '#4a4a66'; c.beginPath(); c.arc(18, -6, 9, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(25, -8); c.lineTo(36, -5); c.lineTo(25, -2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(20, -8, 3, 0, TAU); c.fill(); c.fillStyle = '#e63946'; c.beginPath(); c.arc(21, -8, 1.4, 0, TAU); c.fill(); c.restore();
    };
    const drawStorm = (x, y, t) => {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      const bl = [[-22, 6, 20], [0, -8, 28], [24, 6, 20]];
      for (const pass of [0, 1]) {
        const e = pass ? 0 : 3; c.fillStyle = pass ? '#6a6a8a' : '#2a2438';
        for (const [bx, by, br] of bl) { c.beginPath(); c.arc(bx, by, br + e, 0, TAU); c.fill(); }
        c.beginPath(); c.rect(-22 - e, 6 - e, 46 + e * 2, 20 + e * 2); c.fill();
      }
      c.fillStyle = '#7e7ea2'; c.beginPath(); c.arc(-8, -16, 12, 0, TAU); c.fill();
      if (Math.sin(t * 9) > 0) { c.fillStyle = '#ffe14d'; c.beginPath(); c.moveTo(-4, 24); c.lineTo(8, 24); c.lineTo(0, 38); c.lineTo(10, 38); c.lineTo(-8, 56); c.lineTo(-2, 42); c.lineTo(-10, 42); c.closePath(); c.fill(); c.stroke(); }
      c.restore();
    };

    const trainBg = k => {
      const d = tr.dist;
      if (k === 'run') {
        const g = c.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, '#6fc3f5'); g.addColorStop(1, '#d9f0ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        dkSkyCloud(c, ((-d * .03 + 120) % 1200 + 1200) % 1200 - 140, 70, 1, 'rgba(255,255,255,.9)'); dkSkyCloud(c, ((-d * .05 + 640) % 1200 + 1200) % 1200 - 140, 120, .8, 'rgba(255,255,255,.9)');
        c.fillStyle = '#7a6fa8'; c.fillRect(0, 190, W, 150); c.fillStyle = '#6a5f98'; c.fillRect(0, 190, W, 10);
        const cr = mulberry(11), off = (d * .35) % 28;
        for (let row = 0; row < 5; row++) for (let i = -2; i < 38; i++) { const x = i * 28 - off + (row % 2) * 14, y = 214 + row * 22; cr(); c.fillStyle = ['#ff6b8b', '#ffd23f', '#fff', '#6bd6ff', '#9be37e', '#b78cf5'][Math.floor(((i + 100) * 7 + row * 3 + Math.floor(d * .35 / 28) * 5) % 6)]; c.beginPath(); c.arc(x, y + (Math.sin(S.t * 6 + i + row) * 1.8), 7, 0, TAU); c.fill(); c.fillStyle = '#f0c8a0'; c.beginPath(); c.arc(x, y - 9 + Math.sin(S.t * 6 + i + row) * 1.8, 5, 0, TAU); c.fill(); }
        c.fillStyle = '#2a2438'; c.fillRect(0, 330, W, 6);
        const tg = c.createLinearGradient(0, 336, 0, 600); tg.addColorStop(0, '#e2674d'); tg.addColorStop(1, '#b8402c'); c.fillStyle = tg; c.fillRect(0, 336, W, 264);
        c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { const y = 380 + i * 60; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.8)'; const o2 = d % 200; for (let x = -o2; x < W; x += 200) c.fillRect(x, 480, 70, 5);
        c.font = '900 22px ' + FONT; c.fillStyle = 'rgba(255,255,255,.55)'; c.textAlign = 'center'; const m0 = Math.floor(d / 1000); for (let i = m0; i < m0 + 3; i++) { const x = 260 + i * 1000 - d; c.fillText(i * 100 + 'm', x, 560); }
      } else if (k === 'swim') {
        const g = c.createLinearGradient(0, 130, 0, 600); g.addColorStop(0, '#6fd3ff'); g.addColorStop(.35, '#2f9fe0'); g.addColorStop(1, '#0f4a9a'); c.fillStyle = '#9fe0ff'; c.fillRect(0, 0, W, 150);
        dkSkyCloud(c, ((-d * .03 + 300) % 1200 + 1200) % 1200 - 140, 40, .8, 'rgba(255,255,255,.95)');
        c.fillStyle = g; c.fillRect(0, 150, W, 450);
        c.save(); c.globalAlpha = .12; c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const x = i * 190 + Math.sin(S.t * .4 + i) * 40 - 40; c.beginPath(); c.moveTo(x, 150); c.lineTo(x + 70, 150); c.lineTo(x + 200, 560); c.lineTo(x + 90, 560); c.fill(); } c.restore();
        c.fillStyle = '#d8b878'; c.beginPath(); c.moveTo(0, 600); for (let x = 0; x <= W; x += 20) c.lineTo(x, 560 + Math.sin((x + d * .8) * .02) * 6); c.lineTo(W, 600); c.fill();
        c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.stroke();
        const pr = mulberry(5); for (let i = 0; i < 14; i++) { const x = ((i * 90 - (d * .6) % 1260) + 1260) % 1260 - 120, h = 40 + pr() * 40; c.strokeStyle = '#2f9a5a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 565); c.quadraticCurveTo(x + Math.sin(S.t * 2 + i) * 14, 565 - h * .5, x + Math.sin(S.t * 2 + i) * 8, 565 - h); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, 150 + Math.sin(x * .03 + S.t * 3 - d * .01) * 3); c.stroke();
      } else if (k === 'fly') {
        const g = c.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#4a9cf5'); g.addColorStop(.7, '#bfe8ff'); g.addColorStop(1, '#eaf8ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 6; i++) dkSkyCloud(c, ((-d * (.08 + i * .03) + i * 260) % 1400 + 1400) % 1400 - 180, 60 + i * 80, .9 + (i % 3) * .3, 'rgba(255,255,255,.85)');
        c.fillStyle = '#8fd47a'; c.beginPath(); c.moveTo(0, 600); for (let x = 0; x <= W; x += 20) c.lineTo(x, 556 + Math.sin((x + d * .25) * .011) * 22 + Math.sin((x + d * .25) * .03) * 6); c.lineTo(W, 600); c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke();
      } else {
        const g = c.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#ffb67a'); g.addColorStop(1, '#ffe9c8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = '#e0a070'; c.beginPath(); c.moveTo(0, 420); for (let x = 0; x <= W; x += 30) c.lineTo(x, 300 + Math.sin((x + d * .06) * .008) * 60 + Math.sin((x + d * .06) * .02) * 18); c.lineTo(W, 420); c.fill();
        c.fillStyle = '#c98c5c'; c.beginPath(); c.moveTo(0, 460); for (let x = 0; x <= W; x += 30) c.lineTo(x, 360 + Math.sin((x + d * .12) * .011 + 1) * 50); c.lineTo(W, 460); c.fill();
        dkSkyCloud(c, ((-d * .04 + 500) % 1200 + 1200) % 1200 - 140, 70, .9, 'rgba(255,255,255,.8)');
      }
    };

    const drawTrainPlay = () => {
      const k = tr.k, d = tr.dist, ctl = lastCtl;
      c.save(); if (S.shake > 0) c.translate(rnd(-S.shake, S.shake) * .6, rnd(-S.shake, S.shake) * .6);
      trainBg(k);
      if (k === 'run') {
        for (const o of tr.objs) { const x = 260 + o.wx - d; if (x > -40 && x < W + 40) { if (o.hit) { c.save(); c.translate(x, 470); c.rotate(.5); c.translate(-x, -470); drawHurdle(x, 470); c.restore(); } else drawHurdle(x, 470); } }
        c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(260, 472, 40 * (1 - tr.jy / 200), 9, 0, 0, TAU); c.fill();
        duckDraw(c, 260, 470 - tr.jy, 1.8, { look: sv.look, t: S.t * (.3 + tr.v / 200), pose: tr.air ? 'happy' : tr.stun > 0 ? 'sad' : 'run', rot: tr.stun > 0 ? -.2 : 0 });
      } else if (k === 'climb') {
        const a = .62;
        c.save(); c.translate(260, 470); c.rotate(-a);
        const gg = c.createLinearGradient(0, 0, 0, 300); gg.addColorStop(0, '#b78a5a'); gg.addColorStop(1, '#6a4a2a'); c.fillStyle = gg; c.fillRect(-900, 0, 2400, 700);
        c.strokeStyle = 'rgba(60,34,14,.4)'; c.lineWidth = 3; const off = d % 90; for (let x = -900 - off; x < 1500; x += 90) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x + 30, 60); c.lineTo(x + 8, 120); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = -900 - off; x < 1500; x += 90) c.fillRect(x + 40, 10, 16, 6);
        c.lineWidth = 4; c.strokeStyle = '#2a2438'; c.beginPath(); c.moveTo(-900, 0); c.lineTo(1500, 0); c.stroke();
        c.strokeStyle = '#e63946'; c.lineWidth = 3; const off2 = d % 140; for (let x = -900 - off2; x < 1500; x += 140) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -22); c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x, -24, 4, 0, TAU); c.fill(); }
        for (const o of tr.objs) { const x = o.wx - d; if (x > -90 && x < 1200) drawBoulder(x, -26, 26, o.rot); }
        duckDraw(c, 0, -(tr.jy), 1.8, { look: sv.look, t: S.t * (.3 + tr.v / 100), pose: tr.air ? 'happy' : tr.stun > 0 ? 'sad' : 'climb' });
        c.restore();
      } else if (k === 'swim') {
        for (const o of tr.objs) {
          const x = 260 + o.wx - d; if (x < -60 || x > W + 60 || o.taken) continue;
          if (o.t === 'ring') drawRing(x, o.y, 15, 30, S.t);
          else if (o.t === 'jelly') drawJelly(x, o.y + Math.sin(S.t * 2 + o.ph) * 40, S.t, o.ph);
          else if (o.t === 'rock') { c.save(); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#8a8a96'; c.beginPath(); c.moveTo(x - 36, 566); c.lineTo(x - 18, 506); c.lineTo(x - 4, 534); c.lineTo(x + 12, 492); c.lineTo(x + 38, 566); c.closePath(); c.fill(); c.stroke(); c.restore(); }
          else { c.save(); c.translate(x, 150 + Math.sin(S.t * 2 + x * .02) * 3); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#9a6a3a'; c.beginPath(); rrp(c, -56, -4, 112, 34, 16); c.fill(); c.stroke(); c.fillStyle = '#b8864e'; c.beginPath(); c.ellipse(-52, 13, 8, 15, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#6a4220'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, 8); c.lineTo(10, 12); c.moveTo(0, 20); c.lineTo(36, 18); c.stroke(); c.restore(); }
        }
        const sub = tr.y > 160;
        duckDraw(c, 260, tr.y + 24, 1.5, { look: sv.look, t: S.t * (.4 + tr.v / 140), pose: 'swim', rot: clamp((ctl.dn ? .25 : ctl.up ? -.25 : 0), -.3, .3) });
        c.fillStyle = 'rgba(47,159,224,.28)'; c.fillRect(0, 150, W, 450);
        if (sub && tr.v > 100) { c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 4; i++) { const bx = 230 - ((S.t * 90 + i * 40) % 160), by = tr.y + Math.sin(S.t * 6 + i) * 10; c.beginPath(); c.arc(bx, by, 3 + (i % 2) * 2, 0, TAU); c.fill(); } }
      } else {
        for (const o of tr.objs) {
          const x = 260 + o.wx - d; if (x < -70 || x > W + 70 || o.taken) continue;
          if (o.t === 'ring') drawRing(x, o.y, 14, 40, S.t); else if (o.t === 'cloud') drawStorm(x, o.y, S.t); else drawBird(x, o.y, S.t + o.ph);
        }
        duckDraw(c, 260, tr.y + 26, 1.5, { look: sv.look, t: S.t, pose: 'fly', lean: clamp(tr.vy / 700, -.4, .45) - .1 });
      }
      c.restore();
      if (tr.boost > 0) { c.save(); c.globalAlpha = .5; c.strokeStyle = '#fff'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const y = 200 + ((i * 97 + S.t * 400) % 300), x = 120 + ((i * 131 + S.t * 900) % 700); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 70, y); c.stroke(); } c.restore(); }
      S.panel(W / 2 - 150, 10, 300, 32, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 }); bar(W / 2 - 138, 20, 276, 12, tr.time / 25, '#3ecf6c');
      S.text(Math.ceil(Math.max(0, tr.time)) + 's', W / 2, 52, 18, '#fff', 'center', '#2a2438');
      S.panel(12, 8, 150, 44, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 }); S.text(Math.round(tr.dist / 10) + ' m', 87, 32, 24, '#2a2438');
      if (k !== 'run' && k !== 'climb') { S.panel(W - 150, 8, 138, 44, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 }); drawRing(W - 128, 30, 8, 14, S.t); S.text('x ' + tr.rings, W - 106, 31, 22, '#2a2438', 'left'); }
      else { S.panel(W - 150, 8, 138, 44, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 }); S.text(i18('Jumped {n}', { n: tr.cleared }), W - 81, 31, 16, '#2a2438'); }
      const eff = effOf(tr.m, k === 'fly');
      S.panel(300, 512, 270, 54, { fill: 'rgba(255,248,231,.9)', r: 14, lw: 3, sh: 2 }); S.text(k === 'fly' ? 'FLAP RHYTHM' : 'POWER', 435, 526, 12, '#6a5a7a', 'center', null, 900); bar(314, 538, 242, 16, eff, eff > .85 ? '#3ecf6c' : eff > .45 ? '#ffb703' : '#ff7b54');
      drawCtl(k, ctl);
    };

    const trainText = (s, x, y, w, size) => S.wrap(s, x, y, w, size + 5, size, '#2a2438', 'left', 700);
    const drawTrain = () => {
      S.lock = false;
      const k = tr.k, s2 = DK.STATS.find(q => q.id === k);
      if (tr.phase === 'intro') {
        S.lock = false; trainBgPreview(k);
        c.fillStyle = 'rgba(20,14,40,.55)'; c.fillRect(0, 0, W, H);
        const x = 180, y = 80, w = 600, h = 440; S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
        S.panel(x + 160, y - 20, w - 320, 46, { fill: s2.col, r: 14, lw: 3, sh: 3 }); S.text(i18('{s} training', { s: i18(s2.n) }), x + w / 2, y + 3, 24, '#fff', 'center', s2.dk);
        stIcon(k, x + 70, y + 110, 34);
        S.text(i18('Lv {n}', { n: sv.st[k].lv }) + (bonus(k) ? ' +' + bonus(k) : ''), x + 70, y + 160, 20, '#2a2438');
        trainText(TXT[k], x + 130, y + 76, w - 160, 18);
        S.text('Your top speed grows with every level.', x + w / 2, y + 222, 15, '#6a5a7a', 'center', null, 800);
        duckDraw(c, x + w / 2, y + (k === 'fly' ? 352 : 340), k === 'fly' ? 1.7 : 2.2, { look: sv.look, t: S.t, pose: k, rot: k === 'climb' ? -.4 : 0 });
        S.text(i18('Costs {a} energy   (you have {b})', { a: TCOST, b: Math.round(sv.energy) }), x + w / 2, y + 366, 15, sv.energy < TCOST ? '#c0392b' : '#6a5a7a', 'center', null, 800);
        if (S.btn(x + w / 2 - 110, y + 380, 220, 48, 'Start', { color: sv.energy >= TCOST ? '#3ecf6c' : '#b9b2c9', size: 24, enabled: sv.energy >= TCOST }) || (S.key('Enter') && sv.energy >= TCOST)) { beginPlay(); sfx.click(); }
        if (S.btn(x + 14, y + h - 56, 100, 40, 'Back', { color: '#e8584a', size: 16, r: 12 })) { scene = 'trainmenu'; sfx.click(); }
        return;
      }
      if (tr.phase === 'count' || tr.phase === 'play') {
        drawTrainPlay();
        if (tr.phase === 'count') {
          const n = Math.ceil(tr.cnt - .4), f = (tr.cnt - .4) % 1; c.save(); c.translate(W / 2, 250); const sc = 1 + (1 - f) * .5; c.scale(sc, sc); c.globalAlpha = .4 + f * .6; S.text(String(clamp(n, 1, 3)), 0, 0, 120, '#fff', 'center', '#2a2438'); c.restore();
        } else if (tr.t < .7) { c.save(); c.globalAlpha = 1 - tr.t / .7; S.text('GO!', W / 2, 250 - tr.t * 40, 120, '#ffe14d', 'center', '#2a2438'); c.restore(); }
        return;
      }
      drawTrainPlay();
      c.fillStyle = 'rgba(20,14,40,.6)'; c.fillRect(0, 0, W, H);
      const r = tr.res; r.t += FD;
      const x = 200, y = 60, w = 560, h = 480; S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 140, y - 20, w - 280, 46, { fill: r.up > 0 ? '#ffb703' : s2.col, r: 14, lw: 3, sh: 3 }); S.text(r.up > 0 ? 'LEVEL UP!' : 'Time!', x + w / 2, y + 3, 26, '#fff', 'center', '#6a3a00');
      duckDraw(c, x + 130, y + 190, 2.4, { look: sv.look, t: S.t, pose: r.xp > 30 ? 'happy' : 'idle', talk: r.t < 1.5 });
      S.text(Math.round(r.meters * eo(r.t * 1.6)) + ' m', x + 380, y + 90, 44, '#2a2438');
      S.text(k === 'run' || k === 'climb' ? i18('{n} obstacles cleared', { n: tr.cleared }) : i18('{n} rings collected', { n: tr.rings }), x + 380, y + 128, 17, '#6a5a7a', 'center', null, 800);
      const shown = Math.round(r.xp * eo((r.t - .4) * 1.4));
      S.text('+' + shown + ' XP', x + 380, y + 172, 30, s2.col === '#ffffff' ? '#000' : s2.dk, 'center');
      S.text('+$' + Math.round(r.coins * eo((r.t - .4) * 1.4)), x + 380, y + 206, 20, '#b86b00', 'center');
      stIcon(k, x + 60, y + 300, 18); S.text(i18(s2.n) + '  ' + i18('Lv {n}', { n: sv.st[k].lv }), x + 90, y + 300, 22, '#2a2438', 'left');
      const xp0 = r.up > 0 ? 0 : r.before.xp, frac = sv.st[k].lv >= MAXLV ? 1 : (r.up > 0 ? sv.st[k].xp : lerp(r.before.xp, sv.st[k].xp, eo((r.t - .4) * 1.2))) / dkNeed(sv.st[k].lv); void xp0;
      bar(x + 60, y + 326, w - 120, 18, frac, s2.col);
      S.text(i18('{a} / {b} XP to next level', { a: sv.st[k].xp, b: dkNeed(sv.st[k].lv) }), x + w / 2, y + 366, 14, '#6a5a7a', 'center', null, 800);
      if (r.up > 0) S.text(r.up > 1 ? i18('+{n} levels!', { n: r.up }) : '+1 level!', x + w - 70, y + 300, 22, '#c0392b', 'right');
      const again = sv.energy >= TCOST;
      if (S.btn(x + 40, y + h - 70, 220, 52, again ? 'Train again' : 'Too tired', { color: again ? '#3ecf6c' : '#b9b2c9', size: 20, enabled: again, sub: again ? `-${TCOST} energy` : null }) || (again && S.key('Enter'))) { const kk = tr.k; startTrain(kk); beginPlay(); }
      if (S.btn(x + w - 260, y + h - 70, 220, 52, 'Back', { color: '#ff7b54', size: 20 }) || S.key('Escape')) { scene = 'trainmenu'; sfx.click(); }
      if (!again) S.text('Eat a seed (E) to refill energy', x + w / 2, y + h - 80, 13, '#c0392b', 'center', null, 800);
    };
    const trainBgPreview = k => { const save = tr.dist; tr.dist = S.t * 120; trainBg(k); tr.dist = save; };
    const stepTrain = dt => {
      const k = tr.k;
      if (tr.phase === 'count') {
        tr.cnt -= dt; const n = Math.ceil(tr.cnt - .4);
        if (tr.lastN !== n) { tr.lastN = n; if (n >= 1 && n <= 3) sfx.beep(false); }
        if (tr.cnt <= .4) { tr.phase = 'play'; sfx.beep(true); }
        lastCtl = readCtl(k); return;
      }
      if (tr.phase !== 'play') return;
      const ctl = lastCtl = readCtl(k);
      tr.time -= dt; tr.t += dt;
      feed(tr.m, ctl, dt, k === 'fly');
      if (k === 'run' || k === 'climb') groundSim(dt, ctl, k); else if (k === 'swim') swimSim(dt, ctl); else flySim(dt, ctl);
      if (tr.time <= 0) { tr.time = 0; finishTrain(); }
    };

    const PAL = {
      meadow: { sky: ['#6fc3f5', '#d9f0ff'], g: '#7bc86c', gt: '#5aa84a', hill: ['#a9e09a', '#8fd07f'], deco: 'tree' },
      river: { sky: ['#8fd8ff', '#f4faff'], g: '#6cbf6a', gt: '#4ea24e', hill: ['#b4dca0', '#8fcf9f'], deco: 'reed' },
      rock: { sky: ['#ffae70', '#ffe9c8'], g: '#c98c5c', gt: '#a86e3e', hill: ['#e8b080', '#d29868'], deco: 'spire' },
      cloud: { sky: ['#4a9cf5', '#eaf8ff'], g: '#f4f8ff', gt: '#cfe0f2', hill: ['#ffffff', '#e4f2ff'], deco: 'puff' },
      jungle: { sky: ['#6fcf9a', '#e4fbe4'], g: '#4a9a4a', gt: '#2f7a3a', hill: ['#4a9a6a', '#2f7a50'], deco: 'palm' },
      stadium: { sky: ['#2a2a5a', '#7a66b0'], g: '#e2674d', gt: '#b8402c', hill: ['#4a3a7a', '#3a2c66'], deco: 'light' }
    };
    const RV = (n, col, hat, face, neck, lv, sk, acc, bias = {}) => ({ n, look: { col, hat, face, neck }, sk, acc, lv: { run: lv + (bias.run || 0), swim: lv + (bias.swim || 0), fly: lv + (bias.fly || 0), climb: lv + (bias.climb || 0) } });
    const CUPS = [
      {
        id: 'meadow', n: 'Meadow Cup', short: 'Meadow', pal: 'meadow', col: '#7bc86c', terr: ['run', 'swim'],
        blurb: 'A friendly warm-up on the farm. Sprint through the meadow and paddle across the pond.',
        rivals: [RV('Waddles', 'white', null, null, null, 2, .6, .7, { run: 1 }), RV('Dilly', 'mallard', 'cap', null, null, 3, .65, .74, { swim: 1 }), RV('Pippin', 'pink', 'party', null, 'bow', 4, .68, .78), RV('Gus', 'blue', null, 'shades', null, 5, .7, .8, { run: 1 })],
        races: [{ n: 'Farm Sprint', segs: [['run', 3000], ['swim', 1600], ['run', 2400]] }, { n: 'Pond Paddle', segs: [['swim', 2000], ['run', 2600], ['swim', 1800]] }, { n: 'Barnyard Dash', segs: [['run', 2000], ['swim', 1400], ['run', 2000], ['swim', 1400], ['run', 1800]] }]
      },
      {
        id: 'river', n: 'Riverbank Cup', short: 'River', pal: 'river', col: '#3fa9f5', terr: ['run', 'swim', 'climb'],
        blurb: 'Rivers, rapids and the first steep banks. Time to learn how to climb.',
        rivals: [RV('Reed', 'green', null, null, null, 6, .66, .76, { swim: 1 }), RV('Marla', 'purple', 'swimcap', null, null, 7, .7, .8, { swim: 2, climb: -1 }), RV('Otto', 'black', 'helmet', null, 'scarf', 8, .72, .82, { climb: 2 }), RV('Splashy', 'blue', null, 'goggles', null, 9, .74, .84, { run: -1 })],
        races: [{ n: 'Bank Scramble', segs: [['climb', 2000], ['run', 2600], ['swim', 1800]] }, { n: 'Rapids Run', segs: [['run', 2200], ['climb', 1800], ['swim', 2000], ['run', 1800]] }, { n: 'River Marathon', segs: [['swim', 1800], ['run', 2000], ['climb', 2200], ['swim', 1600], ['run', 1600]] }]
      },
      {
        id: 'rock', n: 'Rocky Pass Cup', short: 'Rocky', pal: 'rock', col: '#c98c5c', terr: ['run', 'swim', 'climb'],
        blurb: 'Boulders everywhere. The cliffs are long and the rivals are tough climbers.',
        rivals: [RV('Granite', 'black', 'helmet', null, null, 10, .7, .8, { climb: 3 }), RV('Pebble', 'mallard', 'cowboy', null, 'scarf', 11, .72, .82, { run: 1 }), RV('Boulder Bob', 'white', 'band', 'shades', null, 12, .74, .84, { climb: 1, swim: -2 }), RV('Dusty', 'yellow', 'pirate', null, null, 13, .76, .86)],
        races: [{ n: 'Cliff Hanger', segs: [['climb', 2400], ['run', 2000], ['climb', 2400]] }, { n: 'Canyon Crossing', segs: [['run', 2000], ['climb', 2400], ['swim', 1600], ['climb', 2000]] }, { n: 'Summit Rush', segs: [['climb', 2000], ['swim', 1800], ['run', 2000], ['climb', 2600], ['run', 1600]] }]
      },
      {
        id: 'cloud', n: 'Cloud Valley Cup', short: 'Cloud', pal: 'cloud', col: '#9b7cf0', terr: ['run', 'swim', 'climb', 'fly'],
        blurb: 'Gaps in the ground and birds in the sky. Your wings will finally pay off.',
        rivals: [RV('Skye', 'pink', 'wizard', 'aviator', null, 12, .72, .82, { fly: 3 }), RV('Nimbus', 'white', null, 'aviator', 'cape', 13, .74, .84, { fly: 2 }), RV('Gale', 'blue', 'top', null, null, 14, .76, .86, { fly: 1 }), RV('Zephyr', 'purple', 'crown', null, null, 15, .78, .88, { fly: 1 })],
        races: [{ n: 'First Flight', segs: [['run', 2000], ['fly', 2600], ['run', 1800]] }, { n: 'Sky Hop', segs: [['fly', 2400], ['swim', 1600], ['fly', 2400]] }, { n: 'Cloud Circuit', segs: [['run', 1600], ['fly', 2200], ['climb', 1800], ['fly', 2400], ['run', 1400]] }]
      },
      {
        id: 'jungle', n: 'Jungle Run Cup', short: 'Jungle', pal: 'jungle', col: '#2f8a3a', terr: ['run', 'swim', 'climb', 'fly'],
        blurb: 'Everything at once. Vines, rivers, cliffs and canyons with no time to breathe.',
        rivals: [RV('Vine', 'green', 'cowboy', null, 'scarf', 15, .74, .84), RV('Tiki', 'mallard', 'party', 'goggles', null, 16, .76, .86, { swim: 2 }), RV('Mango', 'yellow', 'chef', null, 'bell', 17, .78, .88, { fly: 2 }), RV('Rumble', 'black', 'pirate', 'shades', 'cape', 18, .8, .9, { run: 1, climb: 1 })],
        races: [{ n: 'Vine Swing', segs: [['run', 2000], ['swim', 1600], ['climb', 2000], ['fly', 2400], ['run', 1600]] }, { n: 'Canopy Climb', segs: [['climb', 2000], ['fly', 2200], ['run', 1800], ['swim', 1800], ['run', 1600]] }, { n: 'Temple Dash', segs: [['run', 1800], ['climb', 1800], ['swim', 1600], ['run', 1400], ['fly', 2400], ['climb', 1600], ['run', 1400]] }]
      },
      {
        id: 'grand', n: 'Grand Championship', short: 'Grand', pal: 'stadium', col: '#ffb703', terr: ['run', 'swim', 'climb', 'fly'],
        blurb: 'The final. One huge race against the best ducks in the world. Only gold makes you champion.',
        rivals: [RV('Lady Plume', 'white', 'crown', 'monocle', 'cape', 20, .82, .9, { fly: 2 }), RV('Turbo', 'blue', 'band', 'goggles', 'scarf', 21, .84, .91, { run: 2, swim: 1 }), RV('Dark Drake', 'black', 'wizard', 'shades', 'cape', 22, .85, .92, { climb: 2 }), RV('Sir Quackington', 'yellow', 'top', 'monocle', 'bow', 23, .88, .94, { run: 1, fly: 1 })],
        races: [{ n: 'The Grand Final', segs: [['run', 2200], ['swim', 1800], ['climb', 2200], ['fly', 2600], ['run', 1800], ['swim', 1600], ['climb', 2400], ['fly', 2400], ['run', 2000]] }]
      }
    ];
    const ordn = n => i18(n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'));
    const PTS = [10, 6, 3, 1, 0], MONEY = [3, 2, 1.3, .7, .3];
    const TERRN = { run: 'RUN', swim: 'SWIM', fly: 'FLY', climb: 'CLIMB' };
    const cupOpen = i => i === 0 || sv.trophy[i - 1] > 0;

    let rc = null;
    const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    const segAt = x => { const ss = rc.segs; for (let i = 0; i < ss.length; i++) if (x < ss[i].xe) return ss[i]; return ss[ss.length - 1]; };
    const Lat = (s, x) => s.L0 + (s.L1 - s.L0) * clamp((x - s.xs) / (s.xe - s.xs), 0, 1);
    const dipAt = (s, x) => s.k === 'swim' ? 380 * sm((x - s.xs) / 170) * sm((s.xe - x) / 170) : s.k === 'fly' ? 440 * sm((x - s.xs) / 130) * sm((s.xe - x) / 130) : 0;
    const Tat = x => { const s = segAt(x); return Lat(s, x) + dipAt(s, x) + (s.k === 'run' ? Math.sin(x * .006) * 9 * sm((x - s.xs) / 120) * sm((s.xe - x) / 120) : 0); };
    const fdAt = x => { const s = segAt(x); return s.k === 'swim' ? dipAt(s, x) : 0; };
    const slopeAt = x => Math.atan2(Tat(x + 8) - Tat(x - 8), 16);
    const hh = i => { let t = (i * 374761393 + 668265263) >>> 0; t = ((t ^ (t >>> 13)) * 1274126177) >>> 0; return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };

    const buildCourse = def => {
      const segs = [{ k: 'run', xs: 0, xe: 260, L0: 0, L1: 0, lead: true }];
      let x = 260, L = 0;
      for (const [k, len] of def.segs) { const L1 = k === 'climb' ? L - len * .5 : L; segs.push({ k, xs: x, xe: x + len, L0: L, L1, len }); x += len; L = L1; }
      const fin = x + 120; segs.push({ k: 'run', xs: x, xe: fin + 1600, L0: L, L1: L, tail: true });
      return { segs, fin };
    };
    const genObjs = segs => {
      const o = [];
      for (const s of segs) {
        if (s.lead || s.tail) continue;
        let x = s.xs + (s.k === 'climb' ? 560 : 300); const end = s.xe - 220;
        while (x < end) {
          const r = Math.random();
          if (s.k === 'run') { o.push({ t: r < .2 ? 'mud' : 'hurdle', x0: x, wx: x }); x += rnd(430, 620); }
          else if (s.k === 'climb') { o.push({ t: 'boulder', x0: x, wx: x, rot: 0, act: false, min: s.xs }); x += rnd(420, 640); }
          else if (s.k === 'swim') { const t = r < .42 ? 'ring' : r < .62 ? 'jelly' : r < .8 ? 'rock' : 'log'; o.push({ t, x0: x, wx: x, d: t === 'ring' ? rnd(50, 320) : rnd(80, 280), ph: rnd(0, 6) }); x += rnd(250, 380); }
          else { const t = r < .5 ? 'fring' : r < .75 ? 'cloud' : 'bird'; o.push({ t, x0: x, wx: x, fy: rnd(120, 420), ph: rnd(0, 6), act: false }); x += rnd(250, 360); }
        }
      }
      return o;
    };

    const startRace = (ci, ri) => {
      const cup = CUPS[ci], def = cup.races[ri], course = buildCourse(def), segs = course.segs;
      const racers = [{ id: 0, n: sv.name, look: sv.look, lane: 2, x: 150 - 2 * 22, v: 0, stun: 0, boost: 0, fin: null, ph: 0, mode: 'run', jy: 0 }];
      const lanes = [0, 1, 3, 4];
      cup.rivals.forEach((r, i) => racers.push({ id: i + 1, n: r.n, look: Object.assign({ col: 'yellow', hat: null, face: null, neck: null }, r.look), lane: lanes[i], x: 150 - lanes[i] * 22, v: 0, stun: 0, boost: 0, fin: null, ph: rnd(0, 6), sk: r.sk, acc: r.acc, lv: r.lv, ri: 0, dec: null, mode: 'run', jy: 0, dep: 14, fy: 470 }));
      const P = racers[0]; Object.assign(P, { m: { pace: 0, last: '' }, air: false, jvy: 0, dep: 14, fy: 470, vy: 0, cd: 0, mud: false, cleared: 0, hits: 0, rings: 0, meters: { run: 0, swim: 0, fly: 0, climb: 0 } });
      rc = { ci, ri, cup, def, pal: PAL[cup.pal], segs, fin: course.fin, objs: genObjs(segs), racers, P, riv: racers.slice(1), phase: 'intro', t: 0, cnt: 3.4, cam: { x: P.x - 300, y: -450 }, order: [], finT: 0, res: null, lastN: 0 };
      rc.objs.sort((a, b) => a.x0 - b.x0);
      rc.cam.y = Tat(P.x) - 450;
      scene = 'race'; lastCtl = {}; sfx.click();
    };
    const beginRace = () => {
      if (sv.energy < RCOST) { toast('Too tired! Feed your duck a seed.'); return; }
      sv.energy -= RCOST; persist(); rc.phase = 'count'; rc.cnt = 3.4; sfx.click();
    };

    const pDuckY = (P, cam) => {
      const s = segAt(P.x), mode = s.k;
      if (mode === 'swim') return Lat(s, P.x) + P.dep - cam.y + 24;
      if (mode === 'fly') return Lat(s, P.x) + P.fy - 470 - cam.y + 26;
      return Tat(P.x) - P.jy - cam.y;
    };
    const hitFx = (P, txt, col) => { P.stun = .75; P.v *= .25; P.hits++; sfx.thud(); S.shake = 6; popS(300, pDuckY(P, rc.cam) - 70, txt, col); };
    const switchMode = (P, to, from) => {
      if (to === 'swim') { P.dep = 14; P.jy = 0; P.air = false; sfx.splash(); sparkS(300, rc.cam ? pDuckY(P, rc.cam) : 200, 14, '#bfe8ff'); }
      else if (to === 'fly') { P.fy = from === 'swim' ? 420 : 470 - P.jy; P.vy = -120; P.jy = 0; P.air = false; }
      else { if (from === 'fly') { P.jy = Math.max(0, 470 - P.fy - 26); P.jvy = Math.max(-200, P.vy * .3); P.air = P.jy > 0; } else if (from === 'swim') { P.jy = 0; P.air = false; } }
      P.mode = to;
    };
    const crossObj = (r, o) => {
      if (o.t === 'ring' || o.t === 'fring') { if (Math.random() < r.acc * .7) { r.boost = 2; } }
      else if (Math.random() > r.acc) { r.stun = o.t === 'mud' ? .5 : .75; r.v *= .3; }
    };

    const stepPlayer = (R, dt) => {
      const P = R.P, s = segAt(P.x), mode = s.k;
      if (mode !== P.mode) switchMode(P, mode, P.mode);
      const ctl = P.fin ? {} : (lastCtl = readCtl(mode));
      feed(P.m, ctl, dt, mode === 'fly');
      const eff = P.fin ? 0 : effOf(P.m, mode === 'fly'), base = dkBase(mode, lvE(mode));
      const vt = base * (.35 + .86 * eff) * (P.stun > 0 ? .3 : 1) * (P.boost > 0 ? 1.3 : 1) * (P.mud ? .55 : 1);
      if (P.fin) P.v *= Math.exp(-1.6 * dt); else P.v += (vt - P.v) * Math.min(1, dt * 4);
      const dx0 = P.v * dt; P.x += dx0; P.stun = Math.max(0, P.stun - dt); P.boost = Math.max(0, P.boost - dt);
      if (!P.fin) P.meters[mode] += dx0 / 10;
      P.mud = false;
      const L = Lat(s, P.x);
      if (mode === 'run' || mode === 'climb') {
        if (ctl.a && !P.air) { P.jvy = 560; P.air = true; sfx.jump(); }
        if (P.air) { P.jy += P.jvy * dt; P.jvy -= 1750 * dt; if (P.jy <= 0) { P.jy = 0; P.air = false; } }
      } else if (mode === 'swim') {
        if (ctl.ptrY != null) P.dep += ((ctl.ptrY - (L - R.cam.y)) - P.dep) * Math.min(1, dt * 9);
        else P.dep += ((ctl.dn ? 1 : 0) - (ctl.up ? 1 : 0)) * 310 * dt;
        P.dep = clamp(P.dep, 12, Math.max(12, fdAt(P.x) - 26));
      } else {
        P.cd -= dt;
        const lv = lvE('fly'), grav = Math.max(520, 760 - lv * 5);
        if (ctl.a && P.cd <= 0) { P.vy = Math.max(P.vy - 230, -350); P.cd = .08; sfx.flap(); }
        P.vy = clamp(P.vy + (ctl.dn ? grav * 1.8 : grav) * dt, -360, 470); P.fy += P.vy * dt;
        if (P.fy < 62) { P.fy = 62; P.vy = Math.max(0, P.vy); }
        const dip = dipAt(s, P.x), fl = 434 + dip;
        if (dip < 100) { if (P.fy > fl) { P.fy = fl; P.vy = -280; P.stun = .6; P.v *= .4; sfx.thud(); S.shake = 6; popS(300, 400, 'Bump!', '#ff9b9b'); } }
        else if (P.fy > 610) { P.fy = 300; P.vy = 0; P.stun = 1.2; P.v *= .3; P.hits++; sfx.splash(); S.shake = 8; popS(300, 300, 'Whoa!', '#ff9b9b'); }
      }
      const dive = P.dep;
      for (const o of R.objs) {
        if (o.t === 'boulder') { if (!o.act && P.x > o.x0 - 1100) o.act = true; if (o.act && !o.gone) { o.wx -= 120 * dt; o.rot += dt * 4; if (o.wx < o.min - 80) o.gone = true; } }
        else if (o.t === 'bird') { if (!o.act && P.x > o.x0 - 1100) o.act = true; if (o.act) o.wx -= 110 * dt; }
        const dx = o.wx - P.x;
        if (o.done || o.gone || Math.abs(dx) > 100) continue;
        const sx = 300;
        if (o.t === 'hurdle') { if (Math.abs(dx) < 20) { o.done = true; if (P.jy < 34) { o.hit = true; hitFx(P, 'Ouch!', '#ff9b9b'); } else { P.cleared++; sfx.coin(); popS(sx, pDuckY(P, R.cam) - 80, '+1', '#ffe14d', 22); } } }
        else if (o.t === 'boulder') { if (Math.abs(dx) < 26) { o.done = true; if (P.jy < 40) hitFx(P, 'Ouch!', '#ff9b9b'); else { P.cleared++; sfx.coin(); popS(sx, pDuckY(P, R.cam) - 80, '+1', '#ffe14d', 22); } } }
        else if (o.t === 'mud') { if (Math.abs(dx) < 80 && P.jy < 14 && mode === 'run') P.mud = true; }
        else if (o.t === 'ring') { if (Math.abs(dx) < 30 && Math.abs(dive - o.d) < 42 && mode === 'swim') { o.done = true; P.rings++; P.boost = 2; sfx.coin(); popS(sx, pDuckY(P, R.cam) - 60, 'BOOST', '#ffe14d', 22); sparkS(sx, pDuckY(P, R.cam) - 20, 10, '#ffe14d'); } }
        else if (o.t === 'jelly') { if (Math.abs(dx) < 34 && mode === 'swim' && Math.abs(dive - (o.d + Math.sin(S.t * 2 + o.ph) * 40)) < 42) { o.done = true; hitFx(P, 'Zap!', '#ff9bd0'); } }
        else if (o.t === 'rock') { if (Math.abs(dx) < 34 && mode === 'swim' && dive > fdAt(o.wx) - 100) { o.done = true; hitFx(P, 'Ouch!', '#ff9b9b'); } }
        else if (o.t === 'log') { if (Math.abs(dx) < 48 && mode === 'swim' && dive < 42) { o.done = true; hitFx(P, 'Bonk!', '#ff9b9b'); } }
        else if (o.t === 'fring') { if (Math.abs(dx) < 22 && mode === 'fly' && Math.abs(o.fy - P.fy) < 48) { o.done = true; P.rings++; P.boost = 2; sfx.coin(); popS(sx, pDuckY(P, R.cam) - 60, 'BOOST', '#ffe14d', 22); sparkS(sx, pDuckY(P, R.cam) - 20, 10, '#ffe14d'); } }
        else if (o.t === 'cloud' || o.t === 'bird') { if (mode === 'fly' && Math.hypot(dx, o.fy - P.fy) < (o.t === 'cloud' ? 50 : 34)) { o.done = true; hitFx(P, o.t === 'cloud' ? 'Zap!' : 'Squawk!', '#ff9b9b'); P.vy = 160; } }
      }
    };
    const stepRival = (R, r, dt) => {
      const s = segAt(r.x), mode = s.k; r.mode = mode;
      if (r.fin != null) { r.v *= Math.exp(-1.6 * dt); r.x += r.v * dt; }
      else {
        const eff = clamp(r.sk + Math.sin(R.t * .9 + r.ph) * .1 + Math.sin(R.t * 2.3 + r.ph * 2) * .05, .3, 1);
        const rub = 1 - clamp((r.x - R.P.x) / 7000, -.07, .07);
        const vt = dkBase(mode, r.lv[mode]) * (.35 + .86 * eff) * (r.stun > 0 ? .3 : 1) * (r.boost > 0 ? 1.25 : 1) * rub;
        r.v += (vt - r.v) * Math.min(1, dt * 3); r.x += r.v * dt; r.stun = Math.max(0, r.stun - dt); r.boost = Math.max(0, r.boost - dt);
        while (r.ri < R.objs.length && R.objs[r.ri].x0 <= r.x) { crossObj(r, R.objs[r.ri]); r.ri++; r.dec = null; }
        if (r.x >= R.fin) { r.fin = R.t; R.order.push(r.id); }
      }
      if (mode === 'swim') { const fd = fdAt(r.x), tg = 60 + r.lane * 55 + Math.sin(R.t * 1.3 + r.ph) * 35; r.dep += (clamp(tg, 12, Math.max(12, fd - 26)) - r.dep) * Math.min(1, dt * 3); r.jy = 0; }
      else if (mode === 'fly') { const dip = dipAt(s, r.x), tg = 190 + r.lane * 45 + Math.sin(R.t * 1.7 + r.ph) * 60; r.fy += (Math.min(tg, dip < 100 ? 434 + dip : 1e9) - r.fy) * Math.min(1, dt * 3); r.jy = 0; }
      else {
        const o = R.objs[r.ri]; let hop = 0;
        if (o && (o.t === 'hurdle' || o.t === 'boulder' || o.t === 'mud') && o.x0 - r.x < 110 && o.x0 - r.x > -10) { if (r.dec == null) r.dec = Math.random() < r.acc; if (r.dec && r.stun <= 0) hop = 55 * Math.sin(Math.PI * clamp(1 - (o.x0 - r.x) / 110, 0, 1)); }
        r.jy += (hop - r.jy) * Math.min(1, dt * 18); r.dep = 14; r.fy = 470 - (r.jy > 0 ? 0 : 0);
      }
    };
    const standings = R => {
      const arr = R.racers.slice();
      arr.sort((a, b) => (a.dnf ? 1 : 0) - (b.dnf ? 1 : 0) || ((a.fin != null && b.fin != null) ? a.fin - b.fin : a.fin != null ? -1 : b.fin != null ? 1 : b.x - a.x));
      return arr;
    };
    const finishRace = R => {
      const arr = standings(R), place = arr.indexOf(R.P) + 1, pts = new Array(R.racers.length).fill(0);
      arr.forEach((r, i) => { pts[r.id] = PTS[i]; });
      const cupI = R.ci, money = Math.round((18 + cupI * 14) * MONEY[place - 1]), seeds = place === 1 ? 2 : place === 2 ? 1 : 0;
      const xp = {}, ups = {};
      for (const k in R.P.meters) { const x = Math.round(R.P.meters[k] * .1); xp[k] = x; if (R.P.meters[k] > 20) ups[k] = addXp(k, Math.max(1, x)); }
      sv.money += money; sv.seeds += seeds; sv.nraces++; if (place === 1) sv.wins++;
      sv.runs[cupI].push([place, pts]);
      persist();
      R.res = { arr, place, pts, money, seeds, xp, ups, t: 0, time: R.P.fin };
      R.phase = 'result';
      if (place <= 3) { sfx.cheer(); S.mkScr = true; S.confetti(W / 2, 200, place === 1 ? 70 : 30); S.mkScr = false; } else sfx.thud();
    };

    const stepRace = dt => {
      const R = rc, P = R.P;
      if (R.phase === 'intro' || R.phase === 'result') { R.res && (R.res.t += dt); return; }
      if (R.phase === 'count') {
        R.cnt -= dt; const n = Math.ceil(R.cnt - .4);
        if (R.lastN !== n) { R.lastN = n; if (n >= 1 && n <= 3) sfx.beep(false); }
        lastCtl = readCtl('run');
        if (R.cnt <= .4) { R.phase = 'race'; R.t = 0; sfx.beep(true); }
        return;
      }
      R.t += dt;
      stepPlayer(R, dt);
      for (const r of R.riv) stepRival(R, r, dt);
      if (P.x >= R.fin && P.fin == null) {
        P.fin = R.t; R.order.push(0); R.phase = 'fin'; R.finT = 0;
        S.mkScr = true; S.confetti(300, 260, 24); S.mkScr = false; sfx.cheer();
      }
      if (R.phase === 'fin') { R.finT += dt; if (R.finT > 6.5 || R.riv.every(r => r.fin != null) || R.t > 260) finishRace(R); }
      else if (R.t > 260) { P.fin = R.t; finishRace(R); }
      const s = segAt(P.x), mode = s.k, tx = mode === 'swim' ? Lat(s, P.x) - 150 : mode === 'fly' ? Lat(s, P.x) - 470 : Tat(P.x + 110) - 450;
      R.cam.y += (tx - R.cam.y) * Math.min(1, dt * 3.5); R.cam.x = P.x - 300;
    };

    const drawProp = (k, x, y, r) => {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      if (k === 'tree') {
        c.fillStyle = '#8a5a2a'; c.beginPath(); rrp(c, -6, -48, 12, 50, 3); c.fill(); c.stroke();
        c.fillStyle = '#4fae4a'; for (const [ox, oy, rr] of [[-18, -62, 22], [18, -62, 22], [0, -80, 28]]) { c.beginPath(); c.arc(ox, oy, rr * (.85 + r * .3), 0, TAU); c.fill(); c.stroke(); }
        c.fillStyle = '#62c25a'; c.beginPath(); c.arc(-6, -86, 12, 0, TAU); c.fill();
      } else if (k === 'reed') {
        for (let i = 0; i < 4; i++) { const ox = (i - 1.5) * 9, h = 60 + ((i * 37 + r * 90) % 40); c.strokeStyle = '#4a8a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(ox, 0); c.quadraticCurveTo(ox + 6, -h * .5, ox + 2 + (i - 1.5) * 3, -h); c.stroke(); c.fillStyle = '#8a5a2a'; c.strokeStyle = '#2a2438'; c.lineWidth = 2.4; c.beginPath(); rrp(c, ox + (i - 1.5) * 3 - 1, -h - 16, 6, 18, 3); c.fill(); c.stroke(); }
      } else if (k === 'spire') {
        const h = 70 + r * 70; c.fillStyle = '#a5784c'; c.beginPath(); c.moveTo(-26, 2); c.lineTo(-8, -h); c.lineTo(6, -h * .8); c.lineTo(14, -h * .95); c.lineTo(30, 2); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(-8, -h); c.lineTo(-26, 2); c.lineTo(-10, 2); c.lineTo(-2, -h * .6); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(60,34,14,.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, -h * .7); c.lineTo(8, -h * .3); c.moveTo(-14, -h * .3); c.lineTo(-8, -6); c.stroke();
      } else if (k === 'puff') {
        c.fillStyle = '#fff'; for (const [ox, oy, rr] of [[-20, -10, 16], [0, -18, 22], [22, -10, 16]]) { c.beginPath(); c.arc(ox, oy, rr, 0, TAU); c.fill(); c.stroke(); }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(-20, -10, 14, 0, TAU); c.arc(0, -18, 20, 0, TAU); c.arc(22, -10, 14, 0, TAU); c.fill();
      } else if (k === 'palm') {
        c.strokeStyle = '#2a2438'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(14, -50, 6, -96); c.stroke(); c.strokeStyle = '#9a6a3a'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(14, -50, 6, -96); c.stroke();
        c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#3aa04a';
        for (let i = 0; i < 6; i++) { const a = -Math.PI * .95 + i * Math.PI * .38; c.save(); c.translate(6, -96); c.rotate(a + Math.PI / 2 - .2); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -34, 0, -62); c.quadraticCurveTo(-14, -34, 0, 0); c.fill(); c.stroke(); c.restore(); }
        c.fillStyle = '#7a4a22'; c.beginPath(); c.arc(2, -92, 5, 0, TAU); c.arc(11, -90, 5, 0, TAU); c.fill();
      } else {
        c.fillStyle = '#4a4a6a'; c.beginPath(); rrp(c, -4, -120, 8, 122, 2); c.fill(); c.stroke();
        c.fillStyle = '#fff6c8'; c.beginPath(); rrp(c, -22, -140, 44, 24, 6); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,246,200,.18)'; c.beginPath(); c.moveTo(-22, -116); c.lineTo(22, -116); c.lineTo(70, 0); c.lineTo(-70, 0); c.closePath(); c.fill();
      }
      c.restore();
    };

    const drawObj = (R, o, cam) => {
      if (o.gone) return;
      const sx = o.wx - cam.x; if (sx < -120 || sx > W + 120) return;
      const s = segAt(o.x0), L = Lat(s, o.wx) - cam.y;
      switch (o.t) {
        case 'hurdle': { const y = Tat(o.wx) - cam.y; if (o.hit) { c.save(); c.translate(sx, y); c.rotate(.5); c.translate(-sx, -y); drawHurdle(sx, y); c.restore(); } else drawHurdle(sx, y); break; }
        case 'mud': { const y = Tat(o.wx) - cam.y; c.fillStyle = '#7a4f2a'; c.beginPath(); c.ellipse(sx, y + 4, 82, 12, 0, 0, TAU); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#9a6a3a'; c.beginPath(); c.ellipse(sx - 14, y + 1, 40, 5, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(sx - 34 + i * 34, y + 2 + Math.sin(S.t * 3 + i) * 2, 3, 0, TAU); c.fill(); } break; }
        case 'boulder': drawBoulder(sx, Tat(o.wx) - cam.y - 26, 26, o.rot); break;
        case 'ring': if (!o.done) drawRing(sx, L + o.d, 15, 30, S.t); break;
        case 'jelly': drawJelly(sx, L + o.d + Math.sin(S.t * 2 + o.ph) * 40, S.t, o.ph); break;
        case 'rock': { const y = Tat(o.wx) - cam.y; c.save(); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#8a8a96'; c.beginPath(); c.moveTo(sx - 36, y + 2); c.lineTo(sx - 18, y - 58); c.lineTo(sx - 4, y - 30); c.lineTo(sx + 12, y - 72); c.lineTo(sx + 38, y + 2); c.closePath(); c.fill(); c.stroke(); c.restore(); break; }
        case 'log': { c.save(); c.translate(sx, L + Math.sin(S.t * 2 + sx * .02) * 3); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#9a6a3a'; c.beginPath(); rrp(c, -56, -6, 112, 34, 16); c.fill(); c.stroke(); c.fillStyle = '#b8864e'; c.beginPath(); c.ellipse(-52, 11, 8, 15, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#6a4220'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, 6); c.lineTo(10, 10); c.moveTo(0, 18); c.lineTo(36, 16); c.stroke(); c.restore(); break; }
        case 'fring': if (!o.done) drawRing(sx, L + o.fy - 470, 14, 40, S.t); break;
        case 'cloud': drawStorm(sx, L + o.fy - 470, S.t); break;
        case 'bird': drawBird(sx, L + o.fy - 470, S.t + o.ph); break;
      }
    };

    const drawRacerAt = (R, r, cam) => {
      const s = segAt(r.x), mode = s.k, sx = r.x - cam.x;
      if (sx < -140 || sx > W + 140) return;
      const stun = r.stun > 0, isP = r === R.P, fin = r.fin != null;
      let y, pose = fin ? 'happy' : mode, rot = 0, sc = 1.5;
      if (mode === 'swim') { y = Lat(s, r.x) + r.dep - cam.y + 24; if (isP) rot = clamp((lastCtl.dn ? .25 : lastCtl.up ? -.25 : 0), -.3, .3); }
      else if (mode === 'fly') { y = Lat(s, r.x) + r.fy - 470 - cam.y + 26; rot = 0; }
      else { y = Tat(r.x) - r.jy - cam.y + (r.lane - 2) * 11; sc = 1.7; if (mode === 'climb') rot = slopeAt(r.x) * .9; if (stun) rot -= .2; if (r.jy > 12 && !fin) pose = 'happy'; }
      if (stun && !fin) pose = 'sad';
      const o = { look: r.look, t: S.t * (.3 + r.v / 190) + r.ph, pose, rot };
      if (mode === 'fly') o.lean = isP ? clamp(r.vy / 700, -.4, .45) - .1 : Math.sin(S.t * 3 + r.ph) * .15;
      if (mode === 'swim' || mode === 'fly') o.t = S.t * (.4 + r.v / 140) + r.ph;
      if (mode === 'run' || mode === 'climb') c.fillStyle = 'rgba(0,0,0,.18)', c.beginPath(), c.ellipse(sx, y + 3, 36 * (1 - r.jy / 200), 8, 0, 0, TAU), c.fill();
      c.save(); if (!isP && !fin) c.globalAlpha = 1;
      duckDraw(c, sx, y, sc * (isP ? 1.06 : 1), o);
      c.restore();
      if (isP) { S.text('YOU', sx, y - 118 * (sc / 1.7) - 16 + (mode === 'swim' || mode === 'fly' ? 16 : 0), 15, '#fff', 'center', '#2a2438'); c.fillStyle = '#ffd23f'; c.strokeStyle = '#2a2438'; c.lineWidth = 2.5; const ty = y - 118 * (sc / 1.7) + 4 + (mode === 'swim' || mode === 'fly' ? 16 : 0); c.beginPath(); c.moveTo(sx - 8, ty - 6); c.lineTo(sx + 8, ty - 6); c.lineTo(sx, ty + 4); c.closePath(); c.fill(); c.stroke(); }
    };

    const drawRaceWorld = (R, showDucks = true) => {
      const cam = R.cam, pal = R.pal, P = R.P;
      c.save(); if (S.shake > 0) c.translate(rnd(-S.shake, S.shake) * .6, rnd(-S.shake, S.shake) * .6);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal.sky[0]); g.addColorStop(.75, pal.sky[1]); g.addColorStop(1, pal.sky[1]); c.fillStyle = g; c.fillRect(-20, -20, W + 40, H + 40);
      if (R.cup.pal === 'stadium') { const sr = mulberry(3); c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.globalAlpha = .4 + sr() * .5; c.fillRect(sr() * W, sr() * 260, 2, 2); } c.globalAlpha = 1; }
      else { c.fillStyle = 'rgba(255,255,220,.35)'; c.beginPath(); c.arc(810, 100, 60, 0, TAU); c.fill(); c.fillStyle = '#fff6a8'; c.beginPath(); c.arc(810, 100, 42, 0, TAU); c.fill(); }
      const vy = clamp(-cam.y * .12, -60, 100);
      for (let i = 0; i < 5; i++) dkSkyCloud(c, ((-cam.x * (.04 + i * .015) + i * 290) % 1300 + 1300) % 1300 - 180, 60 + i * 55 + vy * .3, .8 + (i % 3) * .25, 'rgba(255,255,255,.85)');
      for (let layer = 0; layer < 2; layer++) {
        const par = layer ? .32 : .14, base = (layer ? 400 : 360) + vy, amp = layer ? 46 : 70;
        c.fillStyle = pal.hill[layer]; c.beginPath(); c.moveTo(-10, H + 10);
        for (let x = -10; x <= W + 10; x += 20) { const wx = x + cam.x * par; c.lineTo(x, base - amp * (.55 + .45 * Math.sin(wx * .0035 + layer * 2) * Math.cos(wx * .0011 + layer)) - 20 * Math.sin(wx * .011)); }
        c.lineTo(W + 10, H + 10); c.closePath(); c.fill();
        if (R.cup.pal === 'stadium' && layer === 1) { for (let i = 0; i < 90; i++) { const wx = i * 17 - (cam.x * par) % 1530; const x = ((wx % 1530) + 1530) % 1530 - 100; c.fillStyle = ['#ff6b8b', '#ffd23f', '#6bd6ff', '#9be37e', '#fff'][i % 5]; c.beginPath(); c.arc(x, base - 4 - (i % 3) * 14 + Math.sin(S.t * 5 + i) * 1.5, 5, 0, TAU); c.fill(); } }
      }
      for (const s of R.segs) if (s.k === 'fly') { const a = s.xs - cam.x, b = s.xe - cam.x; if (b < -50 || a > W + 50) continue; for (let i = 0; i < 6; i++) dkSkyCloud(c, a + 160 + ((i * 260 + S.t * 14) % Math.max(300, b - a - 200)), Lat(s, s.xs) - cam.y + 520 + (i % 2) * 24, 1.2, 'rgba(255,255,255,.95)'); }
      const step = 16, n = Math.ceil((W + 48) / step) + 1, x0 = cam.x - 24, pts = [];
      for (let i = 0; i <= n; i++) { const x = x0 + i * step; pts.push([x - cam.x, Tat(x) - cam.y, segAt(x).k]); }
      const waterSegs = R.segs.filter(s => s.k === 'swim' && s.xe > cam.x - 40 && s.xs < cam.x + W + 40);
      for (const s of waterSegs) {
        const a = Math.max(s.xs, cam.x - 30), b = Math.min(s.xe, cam.x + W + 30), top = Lat(s, s.xs) - cam.y;
        const wg = c.createLinearGradient(0, top, 0, top + 400); wg.addColorStop(0, '#6fd3ff'); wg.addColorStop(.5, '#2f9fe0'); wg.addColorStop(1, '#14529f');
        c.fillStyle = wg; c.beginPath(); c.moveTo(a - cam.x, top); for (let x = a; x <= b; x += 16) c.lineTo(x - cam.x, top); c.lineTo(b - cam.x, top + 420); c.lineTo(a - cam.x, top + 420); c.closePath(); c.fill();
      }
      let i = 0;
      while (i < n) {
        const k = pts[i][2]; let j = i; while (j + 1 <= n && pts[j + 1][2] === k) j++;
        const e = Math.min(j + 1, n);
        c.fillStyle = k === 'climb' ? '#b4885a' : k === 'swim' ? '#d8b878' : pal.g;
        c.beginPath(); c.moveTo(pts[i][0], H + 30); for (let t = i; t <= e; t++) c.lineTo(pts[t][0], pts[t][1]); c.lineTo(pts[e][0], H + 30); c.closePath(); c.fill();
        if (k !== 'swim' && k !== 'climb') { c.strokeStyle = pal.gt; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); for (let t = i; t <= e; t++) c.lineTo(pts[t][0], pts[t][1] + 6); c.stroke(); }
        if (k === 'climb') { c.strokeStyle = 'rgba(60,34,14,.22)'; c.lineWidth = 3; for (let t = i; t <= e; t += 3) { c.beginPath(); c.moveTo(pts[t][0], pts[t][1] + 22); c.lineTo(pts[t][0] + 22, pts[t][1] + 52); c.lineTo(pts[t][0] + 6, pts[t][1] + 86); c.stroke(); } c.strokeStyle = '#e63946'; c.lineWidth = 3; for (let t = i; t <= e; t += 8) { c.beginPath(); c.moveTo(pts[t][0], pts[t][1]); c.lineTo(pts[t][0], pts[t][1] - 18); c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(pts[t][0], pts[t][1] - 20, 3.5, 0, TAU); c.fill(); } }
        i = j + 1;
      }
      c.save(); c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 3; c.setLineDash([26, 22]); c.lineDashOffset = 0;
      for (const off of [48, 96, 144]) { c.beginPath(); for (let t = 0; t <= n; t++) { if (pts[t][2] === 'run' || pts[t][2] === 'fly') c.lineTo(pts[t][0], pts[t][1] + off); else c.moveTo(pts[t][0], pts[t][1] + off); } c.stroke(); }
      c.restore();
      c.strokeStyle = '#2a2438'; c.lineWidth = 3.5; c.lineJoin = 'round'; c.beginPath(); for (let t = 0; t <= n; t++) c.lineTo(pts[t][0], pts[t][1]); c.stroke();
      const cell = 170, dk = pal.deco;
      for (let ci = Math.floor((cam.x - 100) / cell); ci <= Math.floor((cam.x + W + 100) / cell); ci++) {
        if (hh(ci + 999) < .3) continue;
        const wx = ci * cell + hh(ci) * cell * .8, s = segAt(wx);
        if (s.k === 'swim' || s.k === 'fly' || s.lead && wx < 100) continue;
        const kind = s.k === 'climb' && dk !== 'spire' ? 'spire' : dk;
        if (dk === 'light' && hh(ci + 5) < .6) continue;
        drawProp(kind, wx - cam.x, Tat(wx) - cam.y + 2, hh(ci + 17));
      }
      R.segs.forEach((s, si) => {
        if (s.lead || s.tail) return;
        const pk = R.segs[si - 1].k, sxw = pk === 'swim' || pk === 'fly' ? s.xs + 50 : s.xs - 70, x = sxw - cam.x; if (x < -60 || x > W + 60) return;
        const y = Tat(sxw) - cam.y, st2 = DK.STATS.find(q => q.id === s.k);
        c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.fillStyle = '#e8c78a'; c.beginPath(); rrp(c, x - 3, y - 96, 6, 98, 2); c.fill(); c.stroke();
        S.panel(x - 46, y - 128, 92, 38, { fill: st2.col, r: 10, lw: 3, sh: 2 }); S.text(TERRN[s.k], x + 8, y - 109, 17, '#fff', 'center', st2.dk); stIcon(s.k, x - 28, y - 109, 11);
      });
      const gate = (wx, label, fin) => {
        const x = wx - cam.x; if (x < -140 || x > W + 140) return;
        const y = Tat(wx) - cam.y;
        c.lineWidth = 3; c.strokeStyle = '#2a2438';
        for (const dx of [-80, 80]) { c.fillStyle = '#e8e8f0'; c.beginPath(); rrp(c, x + dx - 6, y - 190, 12, 192, 3); c.fill(); c.stroke(); }
        c.save(); c.beginPath(); rrp(c, x - 86, y - 200, 172, 44, 8); c.clip(); c.fillStyle = '#fff'; c.fillRect(x - 90, y - 204, 180, 52);
        if (fin) { c.fillStyle = '#2a2438'; for (let a = 0; a < 18; a++) for (let b = 0; b < 4; b++) if ((a + b) % 2) c.fillRect(x - 90 + a * 10, y - 204 + b * 13, 10, 13); }
        else { c.fillStyle = '#3fa9f5'; c.fillRect(x - 90, y - 204, 180, 52); }
        c.restore(); c.strokeStyle = '#2a2438'; c.lineWidth = 3; c.beginPath(); rrp(c, x - 86, y - 200, 172, 44, 8); c.stroke();
        S.panel(x - 54, y - 194, 108, 32, { fill: fin ? '#ffb703' : '#fff', r: 8, lw: 3, sh: 0 }); S.text(label, x, y - 177, 20, fin ? '#fff' : '#3fa9f5', 'center', fin ? '#6a3a00' : null);
        c.fillStyle = fin ? 'rgba(42,36,56,.7)' : 'rgba(255,255,255,.9)'; for (let t = 0; t < 6; t++) c.fillRect(x - 2, y - 2 + t * 5, 4, 3);
      };
      gate(70, 'START', false); gate(R.fin, 'FINISH', true);
      for (const o of R.objs) if (o.t === 'ring' || o.t === 'jelly' || o.t === 'rock' || o.t === 'log' || o.t === 'hurdle' || o.t === 'mud' || o.t === 'boulder') drawObj(R, o, cam);
      if (showDucks) {
        const order = R.racers.slice().sort((a, b) => a.lane - b.lane);
        for (const r of order) drawRacerAt(R, r, cam);
      }
      for (const o of R.objs) if (o.t === 'fring' || o.t === 'cloud' || o.t === 'bird') drawObj(R, o, cam);
      for (const s of waterSegs) {
        const a = Math.max(s.xs, cam.x - 30), b = Math.min(s.xe, cam.x + W + 30), top = Lat(s, s.xs) - cam.y;
        c.save(); c.globalAlpha = .26; c.fillStyle = '#2f9fe0'; c.beginPath(); c.moveTo(a - cam.x, top);
        for (let x = a; x <= b; x += 16) c.lineTo(x - cam.x, top); for (let x = b; x >= a; x -= 16) c.lineTo(x - cam.x, Tat(x) - cam.y); c.closePath(); c.fill(); c.restore();
        c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath(); for (let x = a; x <= b; x += 8) c.lineTo(x - cam.x, top + Math.sin(x * .04 + S.t * 3) * 3); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); for (let x = a; x <= b; x += 8) c.lineTo(x - cam.x, top + 12 + Math.sin(x * .05 + S.t * 2.4 + 1) * 3); c.stroke();
        if (P.mode === 'swim' && P.x > s.xs && P.x < s.xe && P.v > 80) { c.fillStyle = 'rgba(255,255,255,.5)'; const py = top + P.dep + 24; for (let q = 0; q < 4; q++) { const bx = 270 - ((S.t * 90 + q * 40) % 160), by = py + Math.sin(S.t * 6 + q) * 10; c.beginPath(); c.arc(bx, by, 3 + (q % 2) * 2, 0, TAU); c.fill(); } }
      }
      if (P.boost > 0) { c.save(); c.globalAlpha = .5; c.strokeStyle = '#fff'; c.lineWidth = 3; for (let q = 0; q < 8; q++) { const y = 180 + ((q * 97 + S.t * 400) % 320), x = 120 + ((q * 131 + S.t * 900) % 700); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 70, y); c.stroke(); } c.restore(); }
      c.restore();
    };

    const drawRaceHud = R => {
      const P = R.P, s = segAt(P.x), mode = s.k, st2 = standings(R), place = st2.indexOf(P) + 1;
      S.panel(12, 8, 150, 60, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 });
      S.text(ordn(place), 87, 34, 40, place === 1 ? '#e0a000' : '#2a2438', 'center', place === 1 ? '#6a3a00' : null); S.text(i18('of {n}', { n: R.racers.length }), 87, 58, 12, '#6a5a7a', 'center', null, 800);
      const bx = 190, bw = 580, by = 16; S.panel(bx - 12, 6, bw + 24, 40, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 });
      const total = R.fin; let cx = 0;
      for (const sg of R.segs) { const a = bx + Math.min(sg.xs, total) / total * bw, b = bx + Math.min(sg.xe, total) / total * bw; if (b <= a) continue; const col = sg.lead || sg.tail ? '#c9bfe0' : DK.STATS.find(q => q.id === sg.k).col; c.fillStyle = col; c.fillRect(a, by + 8, b - a, 8); cx = b; }
      c.strokeStyle = '#2a2438'; c.lineWidth = 2; rrp(c, bx, by + 7, bw, 10, 5); c.stroke();
      for (const r of R.riv) { const x = bx + clamp(r.x / total, 0, 1) * bw; c.fillStyle = DK.CB[r.look.col].c; c.beginPath(); c.arc(x, by + 12, 7, 0, TAU); c.fill(); c.strokeStyle = '#2a2438'; c.lineWidth = 2; c.stroke(); }
      { const x = bx + clamp(P.x / total, 0, 1) * bw; c.fillStyle = DK.CB[sv.look.col].c; c.beginPath(); c.arc(x, by + 12, 10, 0, TAU); c.fill(); c.strokeStyle = '#e63946'; c.lineWidth = 3.5; c.stroke(); }
      S.text(i18('{n} m to go', { n: Math.max(0, Math.round((total - P.x) / 10)) }), bx + bw / 2, 40, 11, '#6a5a7a', 'center', null, 900);
      S.panel(W - 160, 8, 148, 44, { fill: 'rgba(255,248,231,.95)', r: 14, lw: 3, sh: 2 }); S.text(fmtTime(P.fin != null ? P.fin : R.t), W - 86, 31, 24, '#2a2438');
      const eff = effOf(P.m, mode === 'fly');
      S.panel(300, 512, 270, 54, { fill: 'rgba(255,248,231,.9)', r: 14, lw: 3, sh: 2 }); S.text(mode === 'fly' ? 'FLAP RHYTHM' : 'POWER', 435, 526, 12, '#6a5a7a', 'center', null, 900); bar(314, 538, 242, 16, eff, eff > .85 ? '#3ecf6c' : eff > .45 ? '#ffb703' : '#ff7b54');
      S.panel(12, 72, 124, 30, { fill: DK.STATS.find(q => q.id === mode).col, r: 10, lw: 3, sh: 2 }); S.text(TERRN[mode], 80, 88, 16, '#fff', 'center', '#2a2438');
      drawCtl(mode, lastCtl);
    };

    const tf = t => t == null ? 'DNF' : Math.floor(t / 60) + ':' + (t % 60).toFixed(1).padStart(4, '0');
    const stripDraw = (x, y, w, h, segs, lead = true) => {
      const tot = segs.reduce((a, s) => a + s[1], 0); let cx = x;
      c.save(); c.beginPath(); rrp(c, x, y, w, h, h / 2); c.clip();
      for (const [k, len] of segs) { const sw = len / tot * w; c.fillStyle = DK.STATS.find(q => q.id === k).col; c.fillRect(cx, y, sw + 1, h); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(cx, y, sw + 1, h * .35); c.fillStyle = 'rgba(42,36,56,.5)'; c.fillRect(cx + sw - 1, y, 2, h); cx += sw; }
      c.restore(); c.lineWidth = 2.5; c.strokeStyle = '#2a2438'; rrp(c, x, y, w, h, h / 2); c.stroke();
    };
    const lock = (x, y, r) => { c.save(); c.translate(x, y); c.scale(r / 14, r / 14); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(0, -4, 8, Math.PI, 0); c.stroke(); c.beginPath(); rrp(c, -11, -4, 22, 17, 4); c.fill(); c.stroke(); c.fillStyle = '#2a2438'; c.beginPath(); c.arc(0, 4, 2.6, 0, TAU); c.fill(); c.restore(); };
    const cupTotals = i => { const t = [0, 0, 0, 0, 0]; for (const r of sv.runs[i]) for (let k = 0; k < 5; k++) t[k] += r[1][k]; return t; };
    const cupOrder = i => { const t = cupTotals(i), rs = sv.runs[i], last = rs.length ? rs[rs.length - 1][1] : [0, 0, 0, 0, 0]; return [0, 1, 2, 3, 4].sort((a, b) => t[b] - t[a] || last[b] - last[a] || a - b); };
    const racerInfo = (cup, idx) => idx === 0 ? { n: sv.name, look: sv.look } : { n: cup.rivals[idx - 1].n, look: Object.assign({ col: 'yellow', hat: null, face: null, neck: null }, cup.rivals[idx - 1].look) };
    const rivLv = (cup, k) => Math.round(cup.rivals.reduce((a, r) => a + r.lv[k], 0) / cup.rivals.length);
    const medal = (x, y, r, tier) => { const col = tier === 1 ? '#ffc928' : tier === 2 ? '#d5dde6' : tier === 3 ? '#d98c4a' : '#cbc5da'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke(); c.beginPath(); c.arc(x, y, r * .72, 0, TAU); c.strokeStyle = 'rgba(42,36,56,.35)'; c.lineWidth = 2; c.stroke(); };

    const drawRaceIntro = () => {
      const R = rc, cup = R.cup, x = 100, y = 36, w = 760, h = 528;
      c.fillStyle = 'rgba(20,14,40,.5)'; c.fillRect(0, 0, W, H);
      S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 140, y - 20, w - 280, 48, { fill: cup.col, r: 14, lw: 3, sh: 3 }); S.text(cup.n, x + w / 2, y + 4, 24, '#fff', 'center', '#2a2438');
      S.text(i18('Race {a} of {b}:  {c}', { a: R.ri + 1, b: cup.races.length, c: i18(R.def.n) }), x + w / 2, y + 52, 22, '#2a2438');
      const total = R.def.segs.reduce((a, s) => a + s[1], 0);
      stripDraw(x + 50, y + 76, w - 100, 24, R.def.segs);
      S.text(`${Math.round(total / 10)} m`, x + w - 50, y + 118, 15, '#6a5a7a', 'right', null, 800);
      const used = []; for (const [k] of R.def.segs) if (!used.includes(k)) used.push(k);
      used.forEach((k, i) => { stIcon(k, x + 62 + i * 96, y + 118, 10); S.text(TERRN[k], x + 78 + i * 96, y + 118, 13, '#6a5a7a', 'left', null, 900); });
      S.text('YOU vs THE RIVALS', x + w / 2, y + 156, 14, '#8a7a9a', 'center', null, 900);
      used.forEach((k, i) => {
        const bx = x + 50 + i * ((w - 100) / used.length), bw = (w - 100) / used.length - 14, mine = lvE(k), rv = rivLv(cup, k), st2 = DK.STATS.find(q => q.id === k);
        S.panel(bx, y + 172, bw, 78, { fill: '#fff', r: 14, lw: 3, sh: 2 }); stIcon(k, bx + 24, y + 196, 13);
        S.text(st2.n, bx + 44, y + 196, 15, '#2a2438', 'left');
        S.text(i18('You  Lv {n}', { n: mine }), bx + 14, y + 222, 15, mine >= rv ? '#2e9c53' : '#c0392b', 'left'); S.text(i18('Rivals ~{n}', { n: rv }), bx + 14, y + 240, 13, '#6a5a7a', 'left', null, 800);
      });
      S.text('Starting grid', x + w / 2, y + 276, 14, '#8a7a9a', 'center', null, 900);
      R.racers.slice().sort((a, b) => a.id - b.id).forEach((r, i) => {
        const bx = x + 40 + i * 140;
        S.panel(bx, y + 292, 128, 108, { fill: r.id === 0 ? '#e5ffe9' : '#fff', line: r.id === 0 ? '#2e9c53' : '#2a2438', r: 14, lw: 3, sh: 2 });
        c.save(); c.beginPath(); rrp(c, bx + 4, y + 296, 120, 72, 10); c.clip(); duckDraw(c, bx + 64, y + 372, .95, { look: r.look, t: S.t + r.id, pose: 'idle' }); c.restore();
        S.text(r.n, bx + 64, y + 386, S.fit(r.n, 116, 14), '#2a2438');
      });
      const can = sv.energy >= RCOST;
      S.text(i18('Costs {a} energy   (you have {b})', { a: RCOST, b: Math.round(sv.energy) }), x + w / 2, y + 424, 14, can ? '#6a5a7a' : '#c0392b', 'center', null, 800);
      S.text('Mash LEFT and RIGHT to run, swim, climb. SPACE jumps and flaps. UP and DOWN steer in water.', x + w / 2, y + 446, 13, '#6a5a7a', 'center', null, 800);
      if (S.btn(x + w / 2 - 120, y + 460, 240, 54, can ? 'Start race!' : 'Too tired', { color: can ? '#3ecf6c' : '#b9b2c9', size: 24, enabled: can }) || (can && S.key('Enter'))) beginRace();
      if (S.btn(x + 16, y + h - 58, 100, 42, 'Back', { color: '#e8584a', size: 17, r: 12 })) { scene = 'cup'; sfx.click(); }
    };

    const drawRaceResult = () => {
      const R = rc, res = R.res, cup = R.cup, x = 90, y = 30, w = 780, h = 540;
      c.fillStyle = 'rgba(20,14,40,.62)'; c.fillRect(0, 0, W, H);
      S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 190, y - 20, w - 380, 48, { fill: res.place === 1 ? '#ffb703' : res.place <= 3 ? '#3fa9f5' : '#8a7fa8', r: 14, lw: 3, sh: 3 });
      S.text(res.place === 1 ? 'You won!' : res.place <= 3 ? 'On the podium!' : 'Race over', x + w / 2, y + 4, 26, '#fff', 'center', '#2a2438');
      const k = eo(clamp(res.t * 2, 0, 1));
      c.save(); c.translate(x + 120, y + 130); c.scale(k, k); medal(0, 0, 62, res.place <= 3 ? res.place : 0); S.text(ordn(res.place), 0, 2, 46, '#fff', 'center', '#2a2438'); c.restore();
      S.text(res.time != null ? tf(res.time) : 'DNF', x + 120, y + 218, 28, '#2a2438');
      S.text(i18('+{n} cup points', { n: PTS[res.place - 1] }), x + 120, y + 250, 17, '#2e9c53');
      res.arr.forEach((r, i) => {
        const ry = y + 66 + i * 52, me = r.id === 0, info = racerInfo(cup, r.id);
        S.panel(x + 250, ry, w - 280, 46, { fill: me ? '#e5ffe9' : '#fff', line: me ? '#2e9c53' : '#2a2438', r: 12, lw: 3, sh: 2 });
        S.text(String(i + 1), x + 272, ry + 24, 22, '#2a2438');
        c.save(); c.beginPath(); rrp(c, x + 296, ry + 3, 56, 40, 8); c.clip(); duckDraw(c, x + 324, ry + 52, .62, { look: info.look, t: S.t, pose: 'idle' }); c.restore();
        S.text(info.n, x + 366, ry + 24, S.fit(info.n, 150, 18), '#2a2438', 'left');
        S.text(r.dnf ? 'Gave up' : r.fin != null ? tf(r.fin) : i18('{n} m behind', { n: Math.max(1, Math.round((R.fin - r.x) / 10)) }), x + w - 150, ry + 24, 17, '#6a5a7a', 'right', null, 800);
        S.text('+' + res.pts[r.id], x + w - 60, ry + 24, 20, me ? '#2e9c53' : '#6a5a7a', 'right');
      });
      const ry = y + 340;
      S.panel(x + 30, ry, w - 60, 140, { fill: '#fff', r: 16, lw: 3, sh: 3 });
      S.text('REWARDS', x + w / 2, ry + 16, 13, '#8a7a9a', 'center', null, 900);
      icoCoin(c, x + 70, ry + 52, 14); S.text('+$' + Math.round(res.money * eo(clamp(res.t * 1.5, 0, 1))), x + 94, ry + 53, 22, '#b86b00', 'left');
      seed(x + 70, ry + 96, 12); S.text(res.seeds === 1 ? '+1 seed' : i18('+{n} seeds', { n: res.seeds }), x + 94, ry + 97, 20, '#6a4a1a', 'left');
      const ks = DK.STATS.filter(q => res.xp[q.id] > 0);
      ks.forEach((q, i) => {
        const cx = x + 280 + (i % 2) * 240, cy = ry + 44 + Math.floor(i / 2) * 50;
        stIcon(q.id, cx, cy, 13); S.text('+' + Math.round(res.xp[q.id] * eo(clamp(res.t * 1.4, 0, 1))) + ' XP', cx + 22, cy + 1, 18, q.dk, 'left');
        if (res.ups[q.id] > 0) S.text(i18('LEVEL UP! Lv {n}', { n: sv.st[q.id].lv }), cx + 22, cy + 22, 13, '#c0392b', 'left');
      });
      if (S.btn(x + w / 2 - 110, y + h - 52, 220, 44, 'Continue', { color: '#3ecf6c', size: 22 }) || S.key('Enter')) { scene = 'cup'; sfx.click(); }
    };

    const drawRaceScene = () => {
      S.lock = false; const R = rc;
      drawRaceWorld(R);
      if (R.phase === 'intro') { drawRaceIntro(); return; }
      if (R.phase === 'result') { drawRaceResult(); return; }
      drawRaceHud(R);
      if (R.phase === 'count') {
        const n = Math.ceil(R.cnt - .4), f = (R.cnt - .4) % 1; c.save(); c.translate(W / 2, 250); const sc = 1 + (1 - f) * .5; c.scale(sc, sc); c.globalAlpha = .4 + f * .6; S.text(String(clamp(n, 1, 3)), 0, 0, 130, '#fff', 'center', '#2a2438'); c.restore();
        S.text('Get ready to mash!', W / 2, 340, 22, '#fff', 'center', '#2a2438');
      } else if (R.phase === 'race') {
        if (R.t < .8) { c.save(); c.globalAlpha = 1 - R.t / .8; S.text('GO!', W / 2, 250 - R.t * 40, 130, '#ffe14d', 'center', '#2a2438'); c.restore(); }
        if (R.fq > 0) R.fq -= FD;
        if (S.btn(W - 160, 58, 148, 30, R.fq > 0 ? 'Really quit?' : 'Give up', { color: R.fq > 0 ? '#e63946' : '#8a7fa8', size: 13, r: 10 })) { if (R.fq > 0) { R.P.dnf = true; R.P.fin = null; finishRace(R); } else R.fq = 3; }
      } else {
        const st2 = standings(R), pl = st2.indexOf(R.P) + 1;
        S.text('FINISH!', W / 2, 190, 90, '#ffe14d', 'center', '#2a2438'); S.text(i18('{p} place', { p: ordn(pl) }), W / 2, 262, 36, '#fff', 'center', '#2a2438');
      }
    };

    let cupSel = 0, cupFinal = null;
    const NODES = [[130, 450], [300, 350], [470, 460], [640, 340], [800, 450], [790, 190]];
    const drawMap = () => {
      S.lock = false;
      drawSky(S.t, '#8fd8ff', '#e8f8ff');
      c.fillStyle = '#9fdc8e'; c.beginPath(); c.moveTo(0, 300); c.quadraticCurveTo(200, 240, 400, 290); c.quadraticCurveTo(620, 340, 960, 250); c.lineTo(960, 600); c.lineTo(0, 600); c.fill();
      c.fillStyle = '#7bc86c'; c.beginPath(); c.moveTo(0, 380); c.quadraticCurveTo(300, 330, 560, 390); c.quadraticCurveTo(780, 440, 960, 360); c.lineTo(960, 600); c.lineTo(0, 600); c.fill();
      c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#2a2438';
      c.fillStyle = '#b79bd8'; c.beginPath(); c.moveTo(640, 230); c.lineTo(740, 80); c.lineTo(790, 150); c.lineTo(840, 100); c.lineTo(960, 250); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(722, 108); c.lineTo(740, 80); c.lineTo(758, 112); c.lineTo(742, 104); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#3fb4e8'; c.beginPath(); c.ellipse(120, 340, 90, 24, 0, 0, TAU); c.fill(); c.stroke();
      drawHud();
      S.panel(W / 2 - 170, 58, 340, 46, { fill: '#3fa9f5', r: 16, lw: 4, sh: 4 }); S.text('Tournament map', W / 2, 82, 24, '#fff', 'center', '#14507a');
      c.lineCap = 'round'; c.strokeStyle = '#2a2438'; c.lineWidth = 22; c.beginPath(); NODES.forEach(([x, y], i) => { if (i === 0) c.moveTo(x, y); else { const [px, py] = NODES[i - 1]; c.quadraticCurveTo((px + x) / 2, Math.min(py, y) - 50 + (i % 2) * 90, x, y); } }); c.stroke();
      c.strokeStyle = '#f2d9a0'; c.lineWidth = 16; c.beginPath(); NODES.forEach(([x, y], i) => { if (i === 0) c.moveTo(x, y); else { const [px, py] = NODES[i - 1]; c.quadraticCurveTo((px + x) / 2, Math.min(py, y) - 50 + (i % 2) * 90, x, y); } }); c.stroke();
      c.setLineDash([10, 12]); c.strokeStyle = 'rgba(160,110,50,.6)'; c.lineWidth = 3; c.beginPath(); NODES.forEach(([x, y], i) => { if (i === 0) c.moveTo(x, y); else { const [px, py] = NODES[i - 1]; c.quadraticCurveTo((px + x) / 2, Math.min(py, y) - 50 + (i % 2) * 90, x, y); } }); c.stroke(); c.setLineDash([]);
      let hov = -1;
      CUPS.forEach((cp, i) => {
        const [x, y] = NODES[i], open = cupOpen(i), r = i === 5 ? 52 : 44, h2 = S.hover(x - r, y - r, r * 2, r * 2);
        if (h2) { hov = i; S.cursor = 'pointer'; }
        const sc = h2 ? 1.1 : 1 + Math.sin(S.t * 3 + i) * .015;
        c.save(); c.translate(x, y); c.scale(sc, sc);
        c.beginPath(); c.arc(0, 4, r, 0, TAU); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
        c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = open ? cp.col : '#b9b2c9'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a2438'; c.stroke();
        c.beginPath(); c.arc(0, 0, r - 8, 0, TAU); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
        if (open) trophyIcon(0, -2, r * .62, sv.trophy[i]); else lock(0, 2, r * .5);
        c.restore();
        const lw = 128; S.panel(x - lw / 2, y + r + 6, lw, 26, { fill: '#fff8e7', r: 10, lw: 3, sh: 2 }); S.text(cp.n, x, y + r + 20, S.fit(cp.n, lw - 10, 14), '#2a2438');
        if (open) cp.terr.forEach((k, j) => stIcon(k, x - (cp.terr.length - 1) * 11 + j * 22, y - r - 12, 9));
        if (sv.runs[i].length && open) S.text(`${sv.runs[i].length}/${cp.races.length}`, x + r - 6, y - r + 10, 13, '#fff', 'center', '#2a2438');
        if (h2 && S.released && S.inside(x - r, y - r, r * 2, r * 2, S.downX, S.downY) && !S.lock) { if (open) { cupSel = i; scene = 'cup'; sfx.click(); } else { toast(i18('Finish top 3 in {c} to unlock this.', { c: i18(CUPS[i - 1].n) })); sfx.thud(); } }
      });
      if (hov >= 0) { const cp = CUPS[hov]; S.panel(W / 2 - 250, 114, 500, 64, { fill: 'rgba(255,248,231,.97)', r: 14, lw: 3, sh: 3 }); S.wrap(cp.blurb, W / 2, 128, 464, 19, 15, '#2a2438', 'center', 700); }
      if (S.btn(12, H - 56, 120, 44, 'Back', { color: '#e8584a', size: 18 })) { scene = 'hub'; sfx.click(); }
    };

    const cupDone = i => sv.runs[i].length >= CUPS[i].races.length;
    const drawCup = () => {
      S.lock = !!cupFinal;
      const i = cupSel, cp = CUPS[i], pal = PAL[cp.pal], rs = sv.runs[i], done = cupDone(i);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal.sky[0]); g.addColorStop(1, pal.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = pal.g; c.fillRect(0, 500, W, 100); c.fillStyle = pal.gt; c.fillRect(0, 500, W, 10);
      drawHud();
      S.panel(30, 60, 900, 66, { fill: cp.col, r: 18, lw: 4, sh: 5 }); S.text(cp.n, 52, 92, 34, '#fff', 'left', '#2a2438');
      cp.terr.forEach((k, j) => stIcon(k, 480 + j * 38, 92, 14));
      trophyIcon(880, 92, 26, sv.trophy[i]);
      S.text(sv.trophy[i] ? ['', 'Gold trophy', 'Silver trophy', 'Bronze trophy'][sv.trophy[i]] : 'No trophy yet', 800, 94, 15, '#fff', 'right', '#2a2438');
      S.panel(30, 140, 520, 356, { fill: 'rgba(255,248,231,.96)', r: 18, lw: 4, sh: 5 });
      S.text('RACES', 290, 160, 14, '#8a7a9a', 'center', null, 900);
      cp.races.forEach((rc2, r) => {
        const y = 176 + r * 104, isDone = r < rs.length, isNext = r === rs.length && !done;
        S.panel(46, y, 488, 96, { fill: isNext ? '#fffdf0' : isDone ? '#eefaf0' : '#f1eef7', line: isNext ? '#ffb703' : '#2a2438', r: 14, lw: isNext ? 4 : 3, sh: 3 });
        c.beginPath(); c.arc(80, y + 30, 20, 0, TAU); c.fillStyle = isDone ? '#3ecf6c' : isNext ? '#ffb703' : '#b9b2c9'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a2438'; c.stroke(); S.text(isDone ? ordn(rs[r][0]) : String(r + 1), 80, y + 31, isDone ? 14 : 20, '#fff', 'center', '#2a2438');
        S.text(rc2.n, 116, y + 28, 22, '#2a2438', 'left');
        S.text(Math.round(rc2.segs.reduce((a, s) => a + s[1], 0) / 10) + ' m', 518, y + 28, 15, '#6a5a7a', 'right', null, 800);
        stripDraw(66, y + 58, 448, 20, rc2.segs);
        if (isDone) S.text(i18('+{n} pts', { n: rs[r][1][0] }), 518, y + 8, 14, '#2e9c53', 'right');
      });
      S.panel(570, 140, 360, 356, { fill: 'rgba(255,248,231,.96)', r: 18, lw: 4, sh: 5 });
      S.text(rs.length ? 'STANDINGS' : 'THE RIVALS', 750, 160, 14, '#8a7a9a', 'center', null, 900);
      const tot = cupTotals(i), ord = cupOrder(i);
      ord.forEach((idx, row) => {
        const y = 176 + row * 58, info = racerInfo(cp, idx), me = idx === 0;
        S.panel(584, y, 332, 52, { fill: me ? '#e5ffe9' : '#fff', line: me ? '#2e9c53' : '#2a2438', r: 12, lw: 3, sh: 2 });
        if (rs.length) S.text(String(row + 1), 604, y + 27, 20, '#2a2438');
        c.save(); c.beginPath(); rrp(c, 624, y + 4, 56, 44, 8); c.clip(); duckDraw(c, 652, y + 58, .66, { look: info.look, t: S.t + idx, pose: 'idle' }); c.restore();
        S.text(info.n, 692, y + 18, S.fit(info.n, 150, 17), '#2a2438', 'left');
        if (me) S.text('You', 692, y + 37, 12, '#2e9c53', 'left', null, 900);
        else S.text(i18('Lv ~{n}', { n: Math.round((cp.rivals[idx - 1].lv[cp.terr[0]] + cp.rivals[idx - 1].lv[cp.terr[cp.terr.length - 1]]) / 2) }), 692, y + 37, 12, '#6a5a7a', 'left', null, 800);
        if (rs.length) S.text(tot[idx] + ' pts', 900, y + 27, 20, me ? '#2e9c53' : '#2a2438', 'right');
      });
      if (!rs.length) S.text('Top 3 in the standings wins a trophy.', 750, 478, 12, '#6a5a7a', 'center', null, 800);
      const can = sv.energy >= RCOST && !done;
      if (!done && S.btn(560, 510, 300, 66, can ? i18('Race: {r}', { r: i18(cp.races[rs.length].n) }) : 'Too tired', { color: can ? '#3ecf6c' : '#b9b2c9', size: 22, enabled: can, sub: can ? i18('-{n} energy', { n: RCOST }) : 'eat a seed (E)' })) startRace(i, rs.length);
      if (S.btn(30, 520, 120, 52, 'Back', { color: '#e8584a', size: 20 })) { scene = 'map'; sfx.click(); }
      if (S.key('KeyE')) eat();
      if (done && !cupFinal) {
        const o = cupOrder(i), rank = o.indexOf(0) + 1; cupFinal = { rank, k: 0 };
        if (rank <= 3) { sfx.cheer(); S.mkScr = true; S.confetti(W / 2, 260, rank === 1 ? 80 : 40); S.mkScr = false; } else sfx.thud();
      }
      if (cupFinal) drawCupFinal(i);
    };
    const drawCupFinal = i => {
      const cp = CUPS[i], f = cupFinal, rank = f.rank; f.k += FD; S.lock = false;
      c.fillStyle = 'rgba(20,14,40,.68)'; c.fillRect(0, 0, W, H);
      const x = 200, y = 80, w = 560, h = 440; S.panel(x, y, w, h, { fill: '#fff8e7', r: 24, lw: 4, sh: 8 });
      S.panel(x + 100, y - 20, w - 200, 48, { fill: rank <= 3 ? '#ffb703' : '#8a7fa8', r: 14, lw: 3, sh: 3 }); S.text(i18('{c} complete', { c: i18(cp.n) }), x + w / 2, y + 4, 22, '#fff', 'center', '#2a2438');
      const k = eo(clamp(f.k * 2, 0, 1)); c.save(); c.translate(x + w / 2, y + 130); c.scale(k * 2.4, k * 2.4); trophyIcon(0, 0, 30, rank <= 3 ? rank : 0); c.restore();
      S.text(rank <= 3 ? ['', 'CHAMPION OF THE CUP!', 'Silver. So close!', 'Bronze. Well raced!'][rank] : i18('You finished {p}', { p: ordn(rank) }), x + w / 2, y + 230, 26, '#2a2438');
      const better = rank <= 3 && (!sv.trophy[i] || rank < sv.trophy[i]), bonusM = better ? [0, 100, 60, 30][rank] * (i + 1) : 0, bonusS = better && rank === 1 ? 3 : 0;
      if (rank <= 3) {
        S.text(better ? 'New trophy!' : 'You already own a better trophy.', x + w / 2, y + 266, 16, better ? '#2e9c53' : '#6a5a7a', 'center', null, 800);
        if (better) { icoCoin(c, x + w / 2 - 50, y + 304, 13); S.text('+$' + bonusM, x + w / 2 - 30, y + 305, 22, '#b86b00', 'left'); if (bonusS) { seed(x + w / 2 + 70, y + 304, 11); S.text('+' + bonusS, x + w / 2 + 86, y + 305, 20, '#6a4a1a', 'left'); } }
        if (i < CUPS.length - 1 && !sv.trophy[i + 1] && !cupOpen(i + 1)) S.text('The next cup is unlocked!', x + w / 2, y + 342, 17, '#3fa9f5');
      } else S.wrap('You need a top 3 finish in the standings for a trophy. Train your skills and try again.', x + w / 2, y + 272, 440, 22, 17, '#6a5a7a', 'center', 700);
      if (S.btn(x + w / 2 - 120, y + h - 70, 240, 52, rank <= 3 ? 'Collect' : 'OK', { color: '#3ecf6c', size: 24 }) || S.key('Enter')) {
        if (better) { sv.trophy[i] = rank; sv.money += bonusM; sv.seeds += bonusS; }
        sv.runs[i] = []; cupFinal = null; persist(); sfx.coin();
        if (i === CUPS.length - 1 && rank === 1) { sv.champ = true; persist(); scene = 'ending'; st = { t: 0 }; sfx.lvl(); }
        else scene = 'map';
      }
    };
    const drawEnding = () => {
      st.t += FD; S.lock = false;
      drawSky(S.t, '#2a2a5a', '#7a66b0'); c.fillStyle = '#e2674d'; c.fillRect(0, 470, W, 130); c.fillStyle = '#b8402c'; c.fillRect(0, 470, W, 10);
      const sr = mulberry(9); for (let i = 0; i < 60; i++) { c.fillStyle = ['#ff6b8b', '#ffd23f', '#6bd6ff', '#9be37e', '#fff'][i % 5]; c.beginPath(); c.arc(sr() * W, 380 + sr() * 80, 6, 0, TAU); c.fill(); }
      c.lineWidth = 4; c.strokeStyle = '#2a2438'; c.fillStyle = '#ffd23f'; c.beginPath(); rrp(c, 380, 420, 200, 70, 8); c.fill(); c.stroke(); S.text('1', 480, 456, 46, '#fff', 'center', '#6a3a00');
      duckDraw(c, 480, 420 - Math.abs(Math.sin(st.t * 3)) * 18, 3, { look: sv.look, t: S.t, pose: 'happy', talk: true });
      if (Math.random() < .12) { S.mkScr = true; S.confetti(rnd(100, 860), 80, 8); S.mkScr = false; }
      S.panel(W / 2 - 300, 40, 600, 100, { fill: '#ffb703', r: 22, lw: 5, sh: 6 }); S.text('GRAND CHAMPION!', W / 2, 78, 52, '#fff', 'center', '#6a3a00');
      S.text(i18('{n} beat the best ducks in the world.', { n: sv.name }), W / 2, 118, 18, '#6a3a00');
      trophyIcon(250, 330, 60, 1); trophyIcon(710, 330, 60, 1);
      if (S.btn(W / 2 - 130, 520, 260, 54, 'Keep playing', { color: '#3ecf6c', size: 22 })) { scene = 'hub'; sfx.click(); }
    };

    const drawTitle = () => {
      st.t += FD; S.lock = false;
      drawFarm(S.t);
      const bob = Math.sin(S.t * 2.4) * 8;
      S.panel(W / 2 - 290, 40, 580, 130, { fill: '#ffb703', r: 28, lw: 6, sh: 8 });
      S.text('QUACK CUP', W / 2, 98, 84, '#fff', 'center', '#7a3a00');
      S.text('train  .  race  .  become champion', W / 2, 148, 19, '#7a3a00', 'center', null, 900);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(W / 2, 520, 64, 13, 0, 0, TAU); c.fill();
      duckDraw(c, W / 2, 516 - Math.abs(Math.sin(S.t * 2.4)) * 14, 2.7, { look: sv.look, t: S.t, pose: 'idle', talk: Math.sin(S.t * .8) > .9 });
      const fresh = sv.trains === 0 && sv.nraces === 0;
      if (S.btn(W / 2 - 150, 196, 300, 74, fresh ? 'PLAY' : 'CONTINUE', { color: '#3ecf6c', size: 36, sub: fresh ? null : sv.name + '  .  ' + i18('{n} wins', { n: sv.wins }) }) || S.key('Enter') || S.key('Space')) { scene = 'hub'; sfx.click(); quack(); if (fresh) { hubDuck.say = 4.5; hubDuck.msg = tipMsg(); } }
      if (S.btn(W / 2 - 150, 284, 144, 44, '?  How to play', { color: '#4cc9f0', size: 15, r: 12 })) { scene = 'hub'; modal = { k: 'help' }; sfx.click(); }
      if (!fresh) {
        if (S.btn(W / 2 + 6, 284, 144, 44, confirmReset ? 'Really erase?' : 'New game', { color: confirmReset ? '#e63946' : '#8a7fa8', size: 15, r: 12 })) {
          if (confirmReset) { const d = defSave(); for (const k in sv) delete sv[k]; Object.assign(sv, d); confirmReset = false; persist(); sfx.thud(); } else { confirmReset = true; }
        }
      }
      if (confirmReset && S.pressed && !S.inside(W / 2 + 6, 284, 144, 44)) confirmReset = false;
      if (S.btn(12, H - 56, 46, 44, '', { color: music.on ? '#f08a4b' : '#8a7fa8', r: 12, icon: (x, y) => note(c, x, y) })) { music.toggle(); sv.mus = music.on; persist(); }
      S.text('Arrow keys / A D to mash  .  Space to jump and flap', W / 2, H - 28, 14, '#fff', 'center', '#3a6a2a', 800);
    };

    let accD = 0;
    api.loop(dt => {
      FD = dt; accD += dt; let n = 0;
      while (accD >= 1 / 120 && n < 8) {
        const h = 1 / 120; accD -= h; n++;
        S.t += h; S.stepFx(h); music.update(h);
        if (toastT > 0) toastT -= h;
        if (scene === 'train' && tr) stepTrain(h); else if (scene === 'race' && rc) stepRace(h);
        S.clearSim();
      }
      if (n >= 8) accD = 0;
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (scene === 'title') drawTitle();
      else if (scene === 'hub') drawHub();
      else if (scene === 'shop') drawShop();
      else if (scene === 'trainmenu') drawTrainMenu();
      else if (scene === 'train' && tr) drawTrain();
      else if (scene === 'map') drawMap();
      else if (scene === 'cup') drawCup();
      else if (scene === 'race' && rc) drawRaceScene();
      else if (scene === 'ending') drawEnding();
      else scene = 'hub';
      S.drawFx(true); S.drawFx(false);
      if (toastT > 0) { c.save(); c.globalAlpha = Math.min(1, toastT * 3); S.panel(W / 2 - 250, H - 72, 500, 38, { fill: 'rgba(42,36,56,.92)', r: 19, lw: 0, sh: 0 }); S.text(toastS, W / 2, H - 53, S.fit(toastS, 470, 16), '#fff'); c.restore(); }
      S.endFrame();
    });
    api.on(window, 'beforeunload', persist);
    root.__dbg = { S, sv, CUPS, segAt: x => segAt(x).k, Lat: x => Lat(segAt(x), x), fdAt, startTrain, beginPlay, startRace, beginRace, cupOpen, eat, get scene() { return scene; }, set scene(v) { scene = v; }, get tr() { return tr; }, get rc() { return rc; }, get cupFinal() { return cupFinal; }, set cupSel(v) { cupSel = v; }, get modal() { return modal; }, finishRace: () => finishRace(rc), fastForward: () => { rc.P.x = rc.fin - 20; } };
    return { destroy() { persist(); au.close(); } };
  };

  Ameplay.register({
    id: 'quack-cup', title: 'Quack Cup', category: 'Racing', tint: '#ffb703',
    blurb: 'Raise a racing duck. Train running, swimming, flying and climbing, feed it seeds, dress it up, then race rival ducks across six tournaments on real mixed terrain until you win the Grand Championship.',
    help: '<kbd>A</kbd> <kbd>D</kbd> or <kbd>←</kbd> <kbd>→</kbd> alternate to run, swim and climb · <kbd>Space</kbd> / <kbd>↑</kbd> jump and flap · <kbd>↑</kbd> <kbd>↓</kbd> steer in water · <kbd>E</kbd> eat a seed · on touch tap the on-screen buttons and drag to swim',
    better: 'high', width: 960, format: v => short(v),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 44 Q8 34 18 30 Q20 14 34 16 Q44 18 44 28 L54 30 L44 36 Q46 46 32 50 Q20 52 14 44Z"/><circle cx="36" cy="24" r="2" fill="currentColor"/></svg>',
    css: '.gm-quack-cup{gap:0;min-height:0;justify-content:flex-start}.gm-quack-cup .g-canvas{border-radius:14px;background:#7ed0ff}',
    mount(root, api) { return mountDuck(root, api); }
  });

})();
