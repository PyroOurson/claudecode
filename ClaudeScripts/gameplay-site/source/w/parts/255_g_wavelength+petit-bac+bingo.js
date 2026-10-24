(() => {
  'use strict';

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ri = n => Math.random() * n | 0;
  const rnd = a => a[ri(a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = ri(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtT = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const BOTN = ['Robo', 'Pixel', 'Nova', 'Cogsworth', 'Bleep', 'Juno', 'Echo', 'Sprocket', 'Orbit', 'Waffle', 'Zap', 'Mochi', 'Ziggy', 'Pepper', 'Biscuit', 'Quark'];
  const botNames = (n, taken) => { const pool = shuffle(BOTN.filter(x => !taken.includes(x))); const out = []; for (let i = 0; i < n; i++) out.push(pool[i] || 'Bot ' + (i + 1)); return out; };

  const seg = (k, opts, cur) => `<div class="seg" data-k="${k}" role="radiogroup">${opts.map(([v, t]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  function bindSeg(wrap, fn) {
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.seg button');
      if (!b || b.getAttribute('aria-checked') === 'true') return;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      fn(b.parentNode.dataset.k, b.dataset.v);
    });
  }
  const setSeg = (wrap, k, v) => wrap.querySelectorAll(`.seg[data-k="${k}"] button`).forEach(x => x.setAttribute('aria-checked', String(x.dataset.v === String(v))));

  const KIT = p => `
${p}{gap:12px;align-items:stretch;justify-content:flex-start;padding:2px 0 8px;color:var(--ink);font-family:var(--sans);text-align:left;position:relative}
${p} [hidden]{display:none!important}
${p} button{font-family:inherit}
${p} .seg{display:inline-flex;padding:4px;gap:2px;border-radius:999px;background:var(--sunk);box-shadow:inset 0 1px 2px rgba(31,29,43,.08);flex-wrap:wrap}
${p} .seg button{border:0;background:none;padding:8px 13px;border-radius:999px;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button[aria-checked="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
${p} .xp{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:14px;overflow:auto;background:rgba(246,244,255,.86);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:inherit;animation:xpIn .25s var(--ease)}
${p} .xp>.xb{width:100%;max-width:440px;margin:auto;background:#fff;border:1px solid var(--line);border-radius:22px;padding:20px 18px;text-align:center;box-shadow:var(--sh-3);animation:xbIn .45s var(--spring)}
${p} .xb h3{margin:4px 0 8px;font:900 24px/1.1 var(--sans);letter-spacing:-.02em}
${p} .xb p{margin:6px 0 12px;font-size:14px;font-weight:700;line-height:1.5;color:var(--ink-2)}
${p} .xb .kick{display:inline-block;margin:0 0 6px;padding:4px 11px;border-radius:999px;background:var(--accent-soft);font:900 11px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
${p} .xb .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}
${p} .xb .row .g-btn{flex:1 1 auto}
@keyframes xpIn{from{opacity:0}}
@keyframes xbIn{from{opacity:0;transform:translateY(14px) scale(.95)}}
${p} .pnl{background:#fff;border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh-1)}
${p} .chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--sunk);font:800 12px/1.2 var(--sans);color:var(--ink-2);white-space:nowrap}
${p} .lab{font:900 10.5px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
${p} .opt{display:flex;align-items:center;justify-content:space-between;gap:10px 14px;flex-wrap:wrap;padding:9px 0;border-bottom:1px solid var(--line)}
${p} .opt:last-child{border-bottom:0}
${p} .opt>span{font:800 14px/1.25 var(--sans);color:var(--ink)}
${p} .opt>span small{display:block;margin-top:2px;font:700 11.5px/1.25 var(--sans);color:var(--muted)}
${p} .net{display:flex;align-items:center;gap:6px;font:800 12px var(--sans);color:var(--muted)}
${p} .net i{width:8px;height:8px;border-radius:50%;background:var(--good)}
${p} .net.bad i{background:var(--bad)}
${p} .tbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
${p} .tbar h2{margin:0;font:900 20px/1 var(--sans);letter-spacing:-.02em}
${p} .how{padding:12px 16px;font:600 13.5px/1.55 var(--sans);color:var(--ink-2)}
${p} .how b{color:var(--ink)}
${p} .how summary{cursor:pointer;font:900 13px var(--sans);color:var(--ink)}
${p} .how p{margin:8px 0 0}
${p} kbd{display:inline-block;min-width:20px;padding:1px 6px;border-radius:6px;border:1px solid var(--line-2);background:var(--sunk);font:800 11.5px var(--sans);text-align:center}
@media (pointer:coarse){${p} .seg button{min-height:40px}${p} .g-btn.sm{height:42px}}
@media (prefers-reduced-motion:reduce){${p} *{animation-duration:1ms!important;transition-duration:1ms!important}}
`;

  function mkPane(root) {
    const el = h('div', 'xp'); el.hidden = true; root.append(el);
    let fn = null, key = '';
    el.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && fn) fn(b.dataset.a, b); });
    return { el, get key() { return key; }, show(k, html, f) { key = k; fn = f; el.innerHTML = `<div class="xb">${html}</div>`; el.hidden = false; el.scrollTop = 0; }, hide() { el.hidden = true; key = ''; fn = null; } };
  }

  const PHV = { uh: [640, 1190, 2390], eh: [530, 1840, 2480], ih: [390, 1990, 2550], ee: [270, 2290, 3010], oo: [300, 870, 2240], aw: [570, 840, 2410], ah: [730, 1090, 2440], er: [490, 1350, 1690], l: [360, 1300, 2800], n: [260, 1700, 2600] };
  const DIPH = { eye: ['ah', 'ee'], ay: ['eh', 'ee'], ow: ['aw', 'oo'] };
  const GLIDE = { w: 'oo', r: 'er', y: 'ee' };
  const FRIC = { s: [7200, .05, .11], f: [4200, .03, .1], th: [5200, .025, .1], v: [3500, .02, .08], z: [6800, .035, .09], h: [1800, .03, .07] };
  const BURST = { t: [3600, .07], k: [2200, .07], d: [2800, .05], b: [900, .05], p: [1200, .06], g: [1800, .05], j: [3000, .06] };
  const NUMW = { 1: 'w uh n', 2: 't oo', 3: 'th r ee', 4: 'f aw', 5: 'f eye v', 6: 's ih k s', 7: 's eh v uh n', 8: 'ay t', 9: 'n eye n', 10: 't eh n', 11: 'ih l eh v uh n', 12: 't w eh l v', 13: 'th er t ee n', 14: 'f aw t ee n', 15: 'f ih f t ee n', 16: 's ih k s t ee n', 17: 's eh v uh n t ee n', 18: 'ay t ee n', 19: 'n eye n t ee n' };
  const TENW = { 2: 't w eh n t ee', 3: 'th er t ee', 4: 'f aw t ee', 5: 'f ih f t ee', 6: 's ih k s t ee', 7: 's eh v uh n t ee', 8: 'ay t ee', 9: 'n eye n t ee' };
  const LETW = { B: 'b ee', I: 'eye', N: 'eh n', G: 'j ee', O: 'ow' };
  const numTokens = n => n < 20 ? NUMW[n] : TENW[Math.floor(n / 10)] + (n % 10 ? ' | ' + NUMW[n % 10] : '');

  function Sfx(api) {
    let ac = null, master = null, nbuf = null;
    const ctx = () => {
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        ac = new A(); master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
        nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = nbuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const live = () => !api.muted && ctx();
    const tone = (f, d, type = 'sine', v = .06, f2 = 0, at = 0) => {
      const c = live(); if (!c) return;
      const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .03);
    };
    const noise = (d, v = .05, f = 2000, q = .8, f2 = 0, at = 0, type = 'bandpass') => {
      const c = live(); if (!c) return;
      const t = c.currentTime + at, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = nbuf; s.loop = true; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + d + .03);
    };
    const arp = (notes, step = .09, type = 'triangle', v = .06, len = .22) => notes.forEach((f, i) => tone(f, len, type, v, 0, i * step));
    function voiced(c, t, d, fa, fb, f0, f0b, v) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0b, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.03, d / 3)); g.gain.setValueAtTime(v, t + d * .7); g.gain.linearRampToValueAtTime(.0001, t + d);
      for (let k = 0; k < 3; k++) {
        const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = k ? 9 : 6;
        fl.frequency.setValueAtTime(fa[k], t); fl.frequency.linearRampToValueAtTime(fb[k], t + d);
        const ga = c.createGain(); ga.gain.value = [1, .7, .35][k];
        o.connect(fl); fl.connect(ga); ga.connect(g);
      }
      g.connect(master); o.start(t); o.stop(t + d + .03);
    }
    function speak(tokens, o = {}) {
      const c = live(); if (!c) return 0;
      let t = c.currentTime + (o.at || 0) + .02;
      const f0 = o.pitch || 112, sp = o.speed || 1;
      const list = tokens.split(' ').filter(Boolean);
      const t0 = t;
      list.forEach((k, i) => {
        const fall = f0 * (1 - .12 * i / list.length);
        if (PHV[k] && k !== 'l' && k !== 'n') { const d = .17 * sp; voiced(c, t, d, PHV[k], PHV[k], fall * 1.08, fall, .1); t += d * .92; }
        else if (DIPH[k]) { const d = .27 * sp; voiced(c, t, d, PHV[DIPH[k][0]], PHV[DIPH[k][1]], fall * 1.08, fall * .94, .1); t += d * .92; }
        else if (GLIDE[k]) { const d = .07 * sp; voiced(c, t, d, PHV[GLIDE[k]], PHV[GLIDE[k]], fall, fall, .06); t += d; }
        else if (k === 'l' || k === 'n') { const d = .09 * sp; voiced(c, t, d, PHV[k], PHV[k], fall, fall, k === 'n' ? .05 : .07); t += d; }
        else if (FRIC[k]) { const [fc, d, v] = FRIC[k]; noise(d * sp, v, fc, 1.4, 0, t - c.currentTime, 'bandpass'); t += d * sp * .9; }
        else if (BURST[k]) { const [fc, d] = BURST[k]; t += .018; noise(d, .1, fc, 1.1, 0, t - c.currentTime, 'bandpass'); if (k === 'j') noise(.07, .06, 5000, 1.2, 0, t - c.currentTime + .03); t += d * .6; }
        else if (k === '|') t += .1;
      });
      return t - t0;
    }
    return { tone, noise, arp, speak, ctx, live, close: () => { if (ac) ac.close().catch(() => {}); ac = null; } };
  }

  function Runtime(api, sp) {
    const X = { H: null, seat: 0, role: 'local', mode: 'menu', view: null, tok: 0, hooked: false, clk: 0, pids: [] };
    const SK = 'gameplay:res:' + sp.key;
    let lp = performance.now(), svT = 0, svW = 0, wasPaused = false;
    X.now = () => { const t = performance.now(); if (!(api.paused && X.role === 'local')) X.clk += t - lp; lp = t; return X.clk; };
    const hub = () => api.net.role === 'host';
    const leaderSeat = () => { const i = X.pids.indexOf(api.net.leader); return i < 0 ? X.seat : i; };
    const mine = (v, s) => { v.ld = s === leaderSeat() || X.role === 'local'; v.seat = s; v.on = X.mode === 'online'; return v; };
    const persist = force => {
      if (!(X.mode === 'online' && X.role === 'host' && X.H)) return;
      const t = performance.now();
      if (!force && t - svT < 500) { if (!svW) svW = api.timeout(() => { svW = 0; persist(true); }, 520); return; }
      svT = t;
      try {
        if (X.H.S.ph === 'over') sessionStorage.removeItem(SK);
        else sessionStorage.setItem(SK, JSON.stringify({ code: X.code || api.net.code, at: Date.now(), clk: X.clk, S: X.H.S }));
      } catch (e) {}
    };
    api.on(window, 'pagehide', () => persist(true));
    api.on(document, 'visibilitychange', () => { if (document.hidden) persist(true); });
    X.push = () => {
      if (!X.H || !api.alive) return;
      const now = X.now();
      X.view = mine(X.H.view(X.seat, now), X.seat);
      sp.onView(X.view);
      if (X.role === 'host') X.H.S.P.forEach((p, i) => {
        const id = X.pids[i];
        if (id && i !== X.seat && !p.bot) api.net.sendTo(id, { t: 'v', s: i, v: mine(X.H.view(i, now), i) });
      });
      persist(false);
    };
    X.act = m => {
      if (!X.H && X.role !== 'guest') return;
      if (X.role === 'guest') { api.net.send({ t: 'a', m }); return; }
      const r = X.H.act(X.seat, m, X.now(), true);
      if (r === 2) persist(false); else if (r) X.push();
    };
    const clearSave = () => { try { sessionStorage.removeItem(SK); } catch (e) {} };
    X.stop = () => {
      X.tok++; X.H = null; X.view = null; X.mode = 'menu'; X.role = 'local'; X.pids = [];  X.code = null;
      clearSave();
      if (api.net.role) api.net.close();
    };
    X.solo = o => {
      X.tok++; X.mode = 'solo'; X.role = 'local'; X.clk = 0; lp = performance.now(); X.pids = [null]; X.seat = 0;
      X.H = sp.build({ players: [{ id: null, name: o.name || 'You' }], size: 0, bots: true, solo: true, cfg: o.cfg });
      X.push();
    };
    function fresh(r) {
      const players = r.players.map(p => ({ id: p.id, name: p.name }));
      X.clk = 0; lp = performance.now();
      X.H = sp.build({ players, size: r.size, bots: !!r.bots, solo: false, cfg: sp.cfg() });
      X.pids = X.H.S.P.map(p => p.hid || null); X.seat = 0; X.mode = 'online';
      sp.onStart && sp.onStart();
      X.push(); persist(true);
    }
    function resume(r, sv) {
      const H = sp.restore(sv.S);
      const P = H.S.P, used = new Set(), map = P.map(() => null), cur = r.players;
      const take = (i, pl) => { map[i] = pl.id; used.add(pl.id); P[i].n = pl.name; P[i].hid = pl.id; };
      cur.forEach(pl => { const i = P.findIndex((p, j) => !p.bot && !map[j] && p.n === pl.name); if (i >= 0) take(i, pl); });
      cur.forEach(pl => { if (used.has(pl.id)) return; const i = P.findIndex((p, j) => !p.bot && !map[j]); if (i >= 0) take(i, pl); });
      P.forEach((p, i) => { if (!p.bot && !map[i]) H.seatOut(i); else if (p.bot) p.hid = null; });
      X.H = H; X.pids = map; X.seat = Math.max(0, map.indexOf(cur[0].id)); X.mode = 'online'; X.clk = sv.clk || 0; lp = performance.now();
      cur.forEach(pl => { if (!used.has(pl.id)) api.net.sendTo(pl.id, { t: 'w', msg: 'A game is in progress. You will join the next one.' }); });
      sp.onStart && sp.onStart();
      X.push(); persist(true);
    }
    function hostStart(r) {
      let sv = null;
      try { const x = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (x && x.code === api.net.code && x.S && x.S.P && Date.now() - x.at < 432e5 && (!sp.live || sp.live(x.S))) sv = x; } catch (e) {}
      if (!sv) return fresh(r);
      sp.askResume(sv.S, ok => ok ? resume(r, sv) : fresh(r), () => X.leave());
    }
    X.leave = () => { X.stop(); sp.onMenu(); };
    X.online = async () => {
      const tok = ++X.tok;
      hook();
      X.H = null; X.view = null; X.mode = 'online'; X.role = null; X.pids = [];
      sp.onLobby();
      const r = await api.net.room({ title: sp.title, sizes: sp.sizes, defaultSize: sp.def, min: 2, max: sp.max, bots: true });
      if (!api.alive || tok !== X.tok) return;
      if (!r) { X.mode = 'menu'; X.role = 'local'; return sp.onMenu(); }
      X.role = r.role; X.code = api.net.code;
      if (r.role === 'host') hostStart(r); else sp.onWait(r);
    };
    X.toLobby = () => { if (X.role === 'host') X.online(); else X.leave(); };
    function onData(m, from) {
      if (!m || !api.alive || X.mode !== 'online') return;
      if (X.role === 'host') {
        if (m.t !== 'a' || !X.H) return;
        const s = X.pids.indexOf(from);
        if (s < 0 || X.H.S.P[s].bot) return;
        let ch = false;
        try { ch = X.H.act(s, m.m, X.now(), s === leaderSeat()); } catch (e) { console.error(e); }
        if (ch === 2) persist(false); else if (ch) X.push(); else api.net.sendTo(from, { t: 'v', s, v: mine(X.H.view(s, X.now()), s) });
      } else if (m.t === 'v' && m.v) {
        X.seat = m.s | 0; X.view = m.v; sp.onView(m.v);
      } else if (m.t === 'w') sp.onWait(null, m.msg);
    }
    function hook() {
      if (X.hooked) return;
      X.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => {
        if (X.mode !== 'online' || X.role !== 'host' || !X.H || !p) return;
        const s = X.pids.indexOf(p.id);
        if (s < 0 || X.H.S.P[s].bot) return;
        const who = X.H.S.P[s].n;
        X.pids[s] = null; X.H.seatOut(s); X.push();
        api.toast(who + ' left. A bot takes over.');
      });
      api.net.on('rejoin', p => {
        if (X.mode !== 'online' || X.role !== 'host' || !X.H || !p) return;
        const s = X.pids.indexOf(p.id);
        if (s >= 0) api.net.sendTo(p.id, { t: 'v', s, v: mine(X.H.view(s, X.now()), s) });
      });
      api.net.on('lobby', () => { if (X.mode === 'online' && X.role === 'guest') X.online(); });
      api.net.on('close', reason => {
        if (X.mode !== 'online' || X.role !== 'guest') return;
        X.tok++; X.H = null; X.view = null; X.role = 'local';
        sp.onLeft(reason);
      });
    }
    api.interval(() => {
      if (!X.H) return;
      const now = X.now();
      const p = api.paused && X.role === 'local';
      if (wasPaused && !p) X.push();
      wasPaused = p;
      if (p) return;
      let ch = false;
      try { ch = X.H.tick(now); } catch (e) { console.error(e); }
      if (ch) X.push();
    }, 100);
    return X;
  }

  const lastOf = a => a[a.length - 1];
  const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10 < 4 ? n % 10 : 0]);
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0153/g, 'oe').replace(/\u00e6/g, 'ae').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

  const myName = () => {
    try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || '{}'); return clean(p.username || p.displayName, 16) || 'You'; } catch (e) { return 'You'; }
  };
  const BTN = (a, t, c) => `<button type="button" class="g-btn ${c || ''}" data-a="${a}">${t}</button>`;
  const REASON = { 'host-left': 'The host left, so the party ended.', kicked: 'The host removed you from the party.', lost: 'Connection to the party was lost.' };
  const GLUE_FR = {
    'How to play': 'Règles du jeu', 'Back': 'Retour', 'Play online with friends': 'Jouer en ligne avec des amis', 'Play solo': 'Jouer en solo', 'Leave this game?': 'Quitter la partie ?',
    'You will leave the party. A bot may take your seat.': 'Vous quittez le salon. Un bot peut prendre votre place.', 'Your current game will be lost.': 'La partie en cours sera perdue.',
    'Stay': 'Rester', 'Leave': 'Quitter', 'Online': 'En ligne', 'Hold on': 'Un instant', 'Joined': 'Salon rejoint', 'Waiting for the host to start the game.': 'En attente du lancement par l\'hôte.',
    'Party closed': 'Salon fermé', 'Back to menu': 'Retour au menu',
    'The host left, so the party ended.': 'L\'hôte est parti, le salon est fermé.', 'The host removed you from the party.': 'L\'hôte vous a retiré du salon.', 'Connection to the party was lost.': 'La connexion au salon a été perdue.',
    'The party ended.': 'Le salon est fermé.', 'Resume your game?': 'Reprendre la partie ?', 'Players who were in the party can rejoin it now.': 'Les joueurs du salon peuvent la rejoindre maintenant.',
    'Resume game': 'Reprendre', 'Start a new game': 'Nouvelle partie', 'Leave party': 'Quitter le salon', 'A game was in progress when this page was refreshed.': 'Une partie était en cours quand la page a été actualisée.'
  };

  function Glue(root, api, sp) {
    const pane = mkPane(root), sfx = Sfx(api);
    const L = { pane, sfx, X: null, menu: null };
    const V = x => typeof x === 'function' ? x() : x;
    const T = s => (sp.lang && sp.lang() === 'fr' && GLUE_FR[s]) || s;
    const how = back => pane.show('how', `<div class="kick">${sp.title}</div><h3>${T('How to play')}</h3><div class="how" style="text-align:left;padding:0">${V(sp.how)}</div><div class="row">${BTN('back', T('Back'))}</div>`, a => a === 'back' && back());
    L.menu = () => {
      pane.show('menu', `${V(sp.logo)}<div class="row" style="flex-direction:column;align-items:stretch;gap:10px;margin-top:14px">${sp.menuExtra ? V(sp.menuExtra) : ''}${BTN('solo', V(sp.soloLabel) || T('Play solo'))}${BTN('online', T('Play online with friends'), 'ghost')}${BTN('how', T('How to play'), 'ghost sm')}</div>`, (a, b) => {
        if (a === 'solo') { sfx.tone(520, .12, 'triangle', .05); pane.hide(); L.X.solo({ name: myName(), cfg: sp.cfg() }); }
        else if (a === 'online') { sfx.tone(520, .12, 'triangle', .05); L.X.online(); }
        else if (a === 'how') how(L.menu);
        else if (sp.menuAct) sp.menuAct(a, b, L.menu);
      });
      if (sp.menuBind) sp.menuBind(pane.el);
    };
    L.how = () => how(() => pane.hide());
    L.confirmLeave = () => pane.show('leave', `<h3>${T('Leave this game?')}</h3><p>${T(L.X.mode === 'online' ? 'You will leave the party. A bot may take your seat.' : 'Your current game will be lost.')}</p><div class="row">${BTN('stay', T('Stay'), 'ghost')}${BTN('leave', T('Leave'))}</div>`, a => { if (a === 'stay') pane.hide(); else { pane.hide(); L.X.leave(); } });
    const wait = (msg, title) => pane.show('wait', `<div class="kick">${T('Online')}</div><h3>${T(title)}</h3><p>${esc(T(msg))}</p><div class="row">${BTN('leave', T('Leave'), 'ghost')}</div>`, a => a === 'leave' && L.X.leave());
    L.X = Runtime(api, {
      key: sp.key, title: sp.title, sizes: sp.sizes, def: sp.def, max: sp.max,
      build: sp.build, restore: sp.restore, cfg: sp.cfg, live: sp.live,
      onView: v => { if (pane.key === 'wait' || pane.key === 'resume') pane.hide(); sp.onView(v); },
      onStart: () => { sp.onStart && sp.onStart(); },
      onMenu: () => { sp.onReset && sp.onReset(); L.menu(); },
      onLobby: () => { pane.hide(); sp.onReset && sp.onReset(); },
      onWait: (r, msg) => { if (msg) wait(msg, 'Hold on'); else if (r) wait('Waiting for the host to start the game.', 'Joined'); },
      onLeft: reason => { sp.onReset && sp.onReset(); pane.show('left', `<div class="kick">${T('Online')}</div><h3>${T('Party closed')}</h3><p>${esc(T(REASON[reason] || 'The party ended.'))}</p><div class="row">${BTN('menu', T('Back to menu'))}</div>`, () => { L.X.stop(); L.menu(); }); },
      askResume: (S, cb, leave) => pane.show('resume', `<div class="kick">${T('Online')}</div><h3>${T('Resume your game?')}</h3><p>${esc(sp.resumeInfo ? sp.resumeInfo(S) : T('A game was in progress when this page was refreshed.'))} ${T('Players who were in the party can rejoin it now.')}</p><div class="row">${BTN('yes', T('Resume game'))}${BTN('new', T('Start a new game'), 'ghost')}</div><div class="row">${BTN('leave', T('Leave party'), 'ghost sm')}</div>`, a => { if (a === 'leave') leave(); else { pane.hide(); cb(a === 'yes'); } })
    });
    L.start = () => { if (api.net.invite) L.X.online(); else L.menu(); };
    L.destroy = () => { sfx.close(); };
    return L;
  }

  const SPEC_RAW = [
    'Hot|Cold|Volcano:4,Spring morning:55,Freezer:96',
    'Soft|Hard|Marshmallow:5,Wooden floor:68,Diamond:97',
    'Loud|Quiet|Rock concert:4,Busy cafe:35,Library:95',
    'Sweet|Sour|Honey:5,Orange juice:45,Lemon:95',
    'Bright|Dark|Noon sun:4,Candle lit room:55,Deep cave:96',
    'Fast|Slow|Rocket:3,Bicycle:55,Snail:97',
    'Big|Small|Whale:4,Dog:50,Ant:97',
    'Tall|Short|Skyscraper:3,Door frame:40,Garden gnome:92',
    'Wet|Dry|Ocean:3,Damp towel:45,Desert:96',
    'Sharp|Dull|Razor blade:3,Kitchen scissors:30,Butter knife:85',
    'Thick|Thin|Tree trunk:5,Spaghetti:60,Hair strand:96',
    'Smooth|Rough|Silk:5,Skin:35,Sandpaper:96',
    'Heavy|Light|Elephant:4,Backpack:50,Feather:97',
    'Cheap|Expensive|Pocket change:4,Restaurant meal:50,Superyacht:97',
    'Old|New|Dinosaur bones:3,Grandma:40,Newborn baby:96',
    'Clean|Dirty|Operating room:4,Messy desk:60,Landfill:96',
    'Spicy|Mild|Ghost pepper:4,Chili curry:20,Plain rice:94',
    'Salty|Sweet|Sea water:4,Salted caramel:52,Cotton candy:96',
    'Crunchy|Mushy|Crisp apple:6,Cooked pasta:60,Overripe banana:94',
    'Loose|Tight|Baggy jeans:5,Regular shirt:50,Skinny jeans:93',
    'Flexible|Rigid|Rubber band:4,Plastic ruler:60,Steel beam:97',
    'Fragrant|Smelly|Fresh bread:7,Gym bag:75,Garbage truck:96',
    'Good|Evil|Santa Claus:3,Anti-hero:50,Dark lord:97',
    'Overrated|Underrated|Pumpkin spice:8,Average sequel:50,Cult classic:90',
    'Useful|Useless|Smartphone:5,Umbrella:30,Chocolate teapot:96',
    'Normal|Weird|Cereal for breakfast:5,Cat in costume:60,Pyjamas at a wedding:92',
    'Scary|Comforting|Horror movie:5,Dark alley:15,Warm blanket:96',
    'Funny|Serious|Clown:5,Sitcom:25,Courtroom:93',
    'Romantic|Unromantic|Candlelit dinner:4,Movie night:35,Parking ticket:95',
    'Healthy|Unhealthy|Kale salad:5,Plain pasta:50,Deep fried butter:97',
    'Safe|Dangerous|Padded room:4,Crossing road:45,Skydiving:90',
    'Easy|Hard|Breathing:2,Making pancakes:30,Brain surgery:96',
    'Boring|Exciting|Waiting room:4,Road trip:60,Rollercoaster:95',
    'Nerdy|Cool|Chess club:5,Hoodie:55,Rock star:94',
    'Fashionable|Outdated|Latest runway:4,Last year jeans:60,Fax machine:96',
    'Classy|Trashy|Opera night:4,Fast food:55,Reality TV brawl:94',
    'Polite|Rude|Saying please:5,Interrupting:70,Spitting on floor:96',
    'Smart|Stupid|Einstein:4,Average student:50,Walking into doors:95',
    'Brave|Cowardly|Firefighter:5,Trying karaoke:45,Hiding under bed:94',
    'Lucky|Unlucky|Lottery win:4,Four leaf clover:15,Broken mirror:90',
    'Famous|Unknown|Taylor Swift:3,Local mayor:60,Neighbour cat:96',
    'Rich|Poor|Billionaire:3,Teacher:60,Broke student:93',
    'Strong|Weak|Superman:3,Gym regular:35,Newborn kitten:94',
    'Beautiful|Ugly|Sunset:5,Parking lot:70,Swamp monster:97',
    'Young|Old|Toddler:4,College student:35,Retirement home:94',
    'Cute|Creepy|Puppy:4,Porcelain doll:62,Clown in sewer:96',
    'Relaxing|Stressful|Spa day:4,Reading:15,Tax deadline:95',
    'Breakfast food|Dinner food|Pancakes:4,Sandwich:42,Steak:95',
    'Snack|Meal|Popcorn:5,Burger:60,Thanksgiving feast:97',
    'Morning drink|Night drink|Coffee:12,Herbal tea:60,Whiskey:94',
    'Solo sport|Team sport|Marathon:5,Doubles tennis:55,Football:96',
    'Friendly animal|Dangerous animal|Golden retriever:5,Wild boar:60,Great white shark:96',
    'Urban|Rural|Times Square:3,Suburbs:45,Farm:96',
    'Winter activity|Summer activity|Skiing:4,Hiking:50,Beach volleyball:96',
    'Fantasy|Reality|Dragon tale:4,Historical novel:55,Biography:92',
    'Villain|Hero|Joker:4,Deadpool:50,Superman:96',
    'Scary movie|Feel-good movie|Saw:3,Thriller:35,Paddington:96',
    'Low-paid job|High-paid job|Intern:5,Teacher:40,Surgeon:92',
    'Boring job|Exciting job|Toll booth:4,Accountant:25,Stunt double:95',
    'Fits in a pocket|Needs a truck|Coin:3,Laptop:50,Grand piano:94',
    'Boring subject|Fascinating subject|Tax law:6,Algebra:35,Dinosaurs:90',
    'Night in|Night out|Pyjamas on sofa:4,Dinner with friends:55,Nightclub:96',
    'Bad habit|Good habit|Nail biting:5,Snoozing alarm:30,Daily exercise:94',
    'Believable|Unbelievable|Weather forecast:10,Magic trick:70,Alien abduction:96',
    'Grown-up|Childish|Paying bills:5,Cooking dinner:30,Playing with toys:95',
    'Messy|Tidy|Teenager bedroom:5,Busy kitchen:35,Hotel bed:95',
    'Sporty|Lazy|Olympian:3,Weekend jogger:30,Couch potato:96',
    'Introvert|Extrovert|Hermit:3,Coffee with one friend:35,Party host:95',
    'Morning person|Night owl|Sunrise yoga:4,Brunch:40,Midnight snack:96',
    'Impulsive|Cautious|Spontaneous tattoo:4,Last-minute trip:30,Checking locks thrice:94',
    'Optimistic|Pessimistic|Sunshine thoughts:5,Cloudy outlook:75,Doomsday prepper:96',
    'Casual|Formal|Pyjamas:4,Jeans and tee:25,Tuxedo:96',
    'Rare|Common|Unicorn:3,Four leaf clover:30,Pigeon:96',
    'Natural|Artificial|Waterfall:4,Bonsai tree:50,Plastic flower:96',
    'Modern|Ancient|Smartphone:3,Cassette tape:55,Pyramids:96',
    'Public|Private|Concert:4,Group chat:45,Diary:96',
    'Legal|Illegal|Buying bread:3,Jaywalking:70,Bank robbery:97',
    'Selfless|Selfish|Blood donor:5,Sharing fries:25,Stealing last cookie:90',
    'Humble|Arrogant|Quiet helper:6,Proud winner:55,Celebrity boasting:95',
    'Trustworthy|Suspicious|Best friend:4,Stranger:55,Used car salesman:92',
    'Kind|Cruel|Hugging a friend:4,Ignoring a text:55,Villain laugh:96',
    'Calm|Wild|Meditation:3,Park stroll:30,Mosh pit:96',
    'Quiet place|Noisy place|Library:4,Park:35,Stadium:96',
    'Sad song|Happy song|Funeral hymn:5,Ballad:25,Birthday song:95',
    'Slow dance|Fast dance|Wedding slow dance:5,Salsa:65,Breakdancing:95',
    'Expensive hobby|Cheap hobby|Yachting:3,Photography:40,Library reading:94',
    'Thoughtful gift|Thoughtless gift|Handmade album:4,Gift card:60,Regifted candle:94',
    'Best pizza topping|Worst pizza topping|Cheese:3,Mushroom:30,Gummy bears:97',
    'Pet|Wild animal|Hamster:4,Fox in garden:60,Tiger:96',
    'Under the sea|In the sky|Submarine:3,Boat:25,Airplane:95',
    'Day|Night|Sunrise:10,Dusk:62,Midnight:97',
    'Hot drink|Cold drink|Hot chocolate:4,Lukewarm water:50,Slushie:96',
    'Past|Future|Dinosaurs:5,Today:50,Flying cars:92',
    'Starter|Dessert|Soup:15,Main course:50,Ice cream:95',
    'Chaotic|Organized|Toddler party:5,Open plan office:40,Military parade:96',
    'Gentle|Violent|Lullaby:4,Pillow fight:35,Action movie:90',
    'Common knowledge|Expert knowledge|Colours:5,Capital cities:30,Quantum physics:95',
    'Weekday|Weekend|Monday morning:3,Friday night:70,Sunday brunch:96',
    'Indoor|Outdoor|Bathtub:10,Porch:62,Mountain top:96',
    'Work|Play|Meeting:5,Gardening:50,Video game:95',
    'Luxury|Necessity|Diamond ring:4,Smartphone:55,Water:97',
    'Mainstream|Alternative|Top 40 hit:5,Indie band:70,Experimental noise:96',
    'Realistic|Cartoonish|Photograph:3,Anime:75,Stick figure:96',
    'Delicious|Disgusting|Chocolate cake:4,Plain toast:50,Rotten egg:97',
    'Short|Long|Tweet:4,Sitcom episode:30,Trilogy marathon:95',
    'Light meal|Heavy meal|Salad:4,Sandwich:40,Full roast dinner:96',
    'Beginner|Expert|First day:3,Hobbyist:40,Grandmaster:97',
    'Gentle sport|Extreme sport|Bowls:5,Tennis:35,Base jumping:97',
    'Underwhelming|Overwhelming|Soggy sparkler:4,Good sandwich:45,Black Friday crowd:94',
    'Mundane|Magical|Stapler:4,Mirror:45,Wand:94',
    'Safe topic|Taboo topic|Weather chat:4,Salary:55,Politics at dinner:90',
    'Everyday|Once in a lifetime|Brushing teeth:3,Birthday:45,Moon landing:96',
    'Sticky|Slippery|Honey:5,Wet soap:80,Ice rink:96',
    'Round|Pointy|Ball:3,Ice cream cone:55,Needle:97',
    'Bitter|Sweet|Black coffee:5,Dark chocolate:35,Candy floss:97',
    'Sunny|Stormy|Beach day:4,Cloudy afternoon:55,Thunderstorm:96',
    'Lonely|Crowded|Desert island:4,Quiet cafe:35,Rush hour train:94',
    'Plain|Fancy|Cardboard box:4,Birthday cake:55,Royal palace:96',
    'Predictable|Surprising|Sunrise tomorrow:3,Rom-com ending:30,Plot twist:93',
    'Digital|Analog|Smartphone:4,Digital watch:20,Vinyl record:94',
    'Fresh|Stale|Just baked bread:4,Last week bread:70,Fossil biscuit:96',
    'Fleeting|Everlasting|Soap bubble:3,Birthday balloon:30,Pyramids:92',
    'Obvious|Mysterious|Stop sign:3,Locked box:60,Bermuda Triangle:96',
    'Flat|Mountainous|Pancake:3,Rolling hills:50,Himalayas:97',
    'Wise|Naive|Old owl:4,Teenager:60,Newborn puppy:92',
    'Forgettable|Memorable|Elevator music:4,Grocery list:30,First kiss:96',
    'Generous|Stingy|Millionaire donor:4,Splitting the bill:55,Counting pennies:94',
    'Touristy|Off the beaten path|Eiffel Tower:3,City park:45,Secret cove:95',
    'Hot-tempered|Easygoing|Volcano mood:3,Grumpy morning:30,Surfer dude:94',
    'Old-fashioned|Futuristic|Horse and cart:4,Today car:60,Spaceship:95',
    'Creative|Logical|Painting:4,Cooking:30,Mathematics:96',
    'Mountain|Ocean|Snowy peak:3,Lake:50,Coral reef:96',
    'Toy|Tool|Teddy bear:3,Swiss army knife:55,Hammer:94',
    'Useful superpower|Useless superpower|Flight:6,Telepathy:30,Talking to houseplants:92',
    'Warm colour|Cool colour|Red:5,Green:55,Blue:95',
    'Fast food|Slow food|Drive thru burger:4,Pizza delivery:25,Overnight stew:94',
    'Big city|Small town|New York:3,Medium town:55,Tiny village:96',
    'Instant|Eternal|Blink:3,Cooking dinner:50,Building a cathedral:97',
    'Comedy|Tragedy|Slapstick:5,Dramedy:50,Greek tragedy:96',
    'Pleasant weather|Terrible weather|Spring breeze:6,Drizzle:55,Hurricane:96',
    'Few|Many|Pair of shoes:5,Handful of coins:25,Stars in the sky:97',
    'Minor crime|Major crime|Littering:5,Shoplifting:30,Bank robbery:90',
    'Cuddly|Prickly|Teddy bear:3,Cat:25,Porcupine:94',
    'Raw|Burnt|Sushi:6,Medium rare steak:45,Charred toast:96',
    'Relaxing holiday|Adventure holiday|Spa weekend:4,City break:45,Safari trek:94',
    'Sleepy|Energetic|Hibernating bear:3,Monday morning:25,Kid on sugar:96',
    'Pleasant sound|Annoying sound|Birdsong:4,Rain:20,Chalkboard scratch:97',
    'Formal language|Slang|Legal contract:4,Email to boss:25,Text to friend:90',
    'Trivial|Vital|Dust speck:3,Daily newspaper:40,Heart transplant:96',
    'Near|Far|Next door:3,Another city:55,Mars:97',
    'Fragile|Durable|Eggshell:3,Phone screen:25,Anvil:97',
    'Underdressed|Overdressed|Beachwear at work:6,Smart casual:50,Ball gown at cafe:94',
    'Gloomy|Cheerful|Rainy funeral:4,Overcast Monday:25,Sunny parade:96',
    'Famous food|Local secret food|Pizza:5,Regional stew:55,Grandma recipe:94',
    'Gift for a child|Gift for a grandparent|Toy robot:4,Board game:35,Knitted slippers:96',
    'Easy to find|Hard to find|Phone in pocket:4,Lost sock:60,Needle in haystack:96',
    'Vegetable|Dessert|Broccoli:4,Carrot cake:60,Chocolate fondant:96',
    'Appropriate|Inappropriate|Handshake:4,Hug at interview:60,Singing at funeral:94',
    'Ancient hero|Modern hero|Hercules:4,Knight:20,Astronaut:90',
    'Useful tool|Pointless gadget|Hammer:5,Egg separator:70,Banana slicer:93',
    'Peaceful|Chaotic|Zen garden:3,Quiet street:25,Food fight:95'
  ];

  const SPEC = SPEC_RAW.map(s => {
    const [l, r, c] = s.split('|');
    return { l, r, c: c.split(',').map(x => { const k = x.lastIndexOf(':'); return [x.slice(0, k), +x.slice(k + 1)]; }) };
  });
  const WL_COL = ['#2f7bf6', '#f2791c'];
  const WL_TN = ['Blue', 'Orange'];
  const WL_TIMES = [null, { clue: 120, dial: 90, guess: 40 }, { clue: 60, dial: 45, guess: 20 }];
  const WL_DEF = { target: 10, timer: 0, wedge: 1, bot: 'normal' };
  const WL_SIG = { easy: 14, normal: 9, hard: 5 };
  const wlWedge = (d, w) => d <= 1.67 * w ? 4 : d <= 5 * w ? 3 : d <= 8.33 * w ? 2 : 0;
  const specCols = i => { const a = (i * 47 + 200) % 360, b = (a + 130 + (i * 29) % 90) % 360; return [`hsl(${a} 78% 54%)`, `hsl(${b} 78% 54%)`]; };
  const wlCfg = o => {
    const c = Object.assign({}, WL_DEF, o || {});
    c.target = [7, 10, 12].includes(+c.target) ? +c.target : 10;
    c.timer = [0, 1, 2].includes(+c.timer) ? +c.timer : 0;
    c.wedge = [.75, 1, 1.5].includes(+c.wedge) ? +c.wedge : 1;
    if (!WL_SIG[c.bot]) c.bot = 'normal';
    return c;
  };
  const clueBad = (txt, card) => {
    if (!txt) return 'Write a clue first.';
    if (/\d/.test(txt)) return 'No numbers in the clue.';
    const n = norm(txt).split(' ');
    for (const lab of [card.l, card.r]) {
      for (const w of norm(lab).split(' ')) if (w.length > 3 && n.includes(w)) return 'Do not use a word from the spectrum.';
    }
    return '';
  };

  function wlEngine(init) {
    const S = init.S || (() => {
      const o = wlCfg(init.o);
      const P = init.players.map((p, i) => ({ n: clean(p.name, 16) || 'Player', bot: false, t: i % 2, hid: p.id || null }));
      const size = init.solo ? 4 : Math.max(init.size || 0, P.length);
      if (init.solo) { P[0].t = 0; }
      if (init.bots || init.solo) {
        const nm = botNames(Math.max(0, size - P.length), P.map(p => p.n));
        for (let i = P.length, k = 0; i < size; i++, k++) P.push({ n: nm[k], bot: true, t: i % 2, hid: null });
      }
      const st = { g: 'wl', ph: 'teams', P, sc: [0, 0], tn: 0, first: ri(2), at: 0, ps: -1, pi: [ri(9), ri(9)], deck: [], cards: [], pick: -1, clue: '', dial: 50, votes: {}, vl: [], res: null, nx: {}, chat: [], o, dl: 0, ba: 0, bd: null, bv: {}, win: -1 };
      return st;
    })();
    const E = { S };
    const tms = () => WL_TIMES[S.o.timer];
    const members = t => S.P.map((p, i) => i).filter(i => S.P[i].t === t);
    const humans = list => list.filter(i => !S.P[i].bot);
    const guessers = () => members(S.at).filter(i => i !== S.ps);
    const voters = () => members(1 - S.at);
    const drawCard = () => { if (S.deck.length < 2) S.deck = shuffle(SPEC.map((c, i) => i)); return S.deck.pop(); };
    const setDl = (now, k) => { const t = tms(); S.dl = t ? now + t[k] * 1000 : 0; };

    function fill() {
      for (let t = 0; t < 2; t++) {
        while (members(t).length < 2) {
          const nm = botNames(1, S.P.map(p => p.n))[0];
          S.P.push({ n: nm, bot: true, as: true, t, hid: null });
        }
      }
    }
    function startGame(now) {
      S.P = S.P.filter(p => !p.as);
      fill();
      S.sc = [0, 0]; S.tn = 0; S.first = ri(2); S.win = -1; S.res = null; S.chat = [];
      startTurn(now);
    }
    function psychicOf(t) {
      const m = members(t), c = m.filter(i => !S.P[i].as), list = c.length ? c : m;
      const k = S.pi[t] % list.length; S.pi[t]++;
      return list[k];
    }
    function startTurn(now) {
      S.tn++;
      S.at = (S.first + S.tn - 1) % 2;
      S.ps = psychicOf(S.at);
      S.cards = [0, 1].map(() => ({ c: drawCard(), t: 8 + Math.random() * 84 }));
      S.pick = -1; S.clue = ''; S.dial = 50; S.votes = {}; S.vl = []; S.res = null; S.nx = {}; S.bd = null; S.bv = {};
      S.ph = 'clue'; setDl(now, 'clue');
      S.ba = S.P[S.ps].bot ? now + 2200 + Math.random() * 2600 : 0;
    }
    function botClue(now) {
      const k = ri(2), card = SPEC[S.cards[k].c], cl = rnd(card.c);
      S.cards[k].t = clamp(cl[1] + gauss() * 2.2, 7, 93);
      S.pick = k; S.clue = cl[0];
      enterDial(now);
    }
    function botDial(now) {
      if (S.bd || humans(guessers()).length) return false;
      const sg = WL_SIG[S.o.bot], t = S.cards[S.pick].t;
      S.bd = { from: S.dial, to: clamp(t + gauss() * sg, 3, 97), s: now + 1200, d: 2400 + Math.random() * 1600 };
      S.ba = S.bd.s + S.bd.d + 900;
      return true;
    }
    function enterDial(now) {
      S.ph = 'dial'; S.dial = 50; setDl(now, 'dial'); S.bd = null; S.ba = 0;
      botDial(now);
    }
    function lock(now) {
      S.ph = 'guess'; S.votes = {}; S.vl = []; S.bd = null; S.ba = 0; setDl(now, 'guess');
      S.bv = {};
      voters().forEach(i => { if (S.P[i].bot) S.bv[i] = now + 1600 + Math.random() * 3600; });
      if (!voters().length) reveal(now);
    }
    function castBot(i) {
      const t = S.cards[S.pick].t, dir = t < S.dial ? 'L' : 'R';
      const conf = clamp(.55 + Math.abs(t - S.dial) / 28, .55, .93) * (S.o.bot === 'hard' ? 1 : S.o.bot === 'easy' ? .85 : .93);
      S.votes[i] = Math.random() < conf ? dir : (dir === 'L' ? 'R' : 'L');
      S.vl.push(i);
    }
    function resolveVote() {
      const c = { L: 0, R: 0 };
      S.vl.forEach(i => { c[S.votes[i]]++; });
      if (!S.vl.length) return null;
      if (c.L === c.R) return S.votes[S.vl[0]];
      return c.L > c.R ? 'L' : 'R';
    }
    function reveal(now) {
      const t = S.cards[S.pick].t, d = Math.abs(t - S.dial), pts = wlWedge(d, S.o.wedge), dir = t < S.dial ? 'L' : 'R', vote = resolveVote();
      const bonus = pts < 4 && vote && vote === dir ? 1 : 0;
      S.sc[S.at] += pts; S.sc[1 - S.at] += bonus;
      S.res = { pts, bonus, dir, vote, d: Math.round(d * 10) / 10 };
      S.ph = 'reveal'; S.dl = now + 16000; S.nx = {};
    }
    function advance(now) {
      if (S.tn % 2 === 0 && Math.max(S.sc[0], S.sc[1]) >= S.o.target && S.sc[0] !== S.sc[1]) {
        S.ph = 'over'; S.win = S.sc[0] > S.sc[1] ? 0 : 1; S.dl = 0; return;
      }
      startTurn(now);
    }

    E.act = (seat, m, now, ld) => {
      const me = S.P[seat];
      if (!me || !m || typeof m !== 'object') return false;
      const act = me.t === S.at;
      switch (m.t) {
        case 'team':
          if (S.ph !== 'teams' || (m.v !== 0 && m.v !== 1)) return false;
          me.t = m.v; return true;
        case 'shuf': {
          if (S.ph !== 'teams' || !ld) return false;
          const hs = shuffle(S.P.map((p, i) => i).filter(i => !S.P[i].bot));
          hs.forEach((i, k) => { S.P[i].t = k % 2; });
          return true;
        }
        case 'opt': {
          if (!(S.ph === 'teams' || S.ph === 'over') || !ld) return false;
          const o = Object.assign({}, S.o); o[m.k] = m.v;
          if (!(m.k in WL_DEF)) return false;
          S.o = wlCfg(o); return true;
        }
        case 'start':
          if (S.ph !== 'teams' || !ld) return false;
          startGame(now); return true;
        case 'clue': {
          if (S.ph !== 'clue' || seat !== S.ps || (m.k !== 0 && m.k !== 1)) return false;
          const txt = clean(m.x, 80);
          if (clueBad(txt, SPEC[S.cards[m.k].c])) return false;
          S.pick = m.k; S.clue = txt; enterDial(now); return true;
        }
        case 'dial':
          if (S.ph !== 'dial' || !act || seat === S.ps || me.bot || typeof m.v !== 'number' || !isFinite(m.v)) return false;
          S.dial = Math.round(clamp(m.v, 0, 100) * 10) / 10; return true;
        case 'lock':
          if (S.ph !== 'dial' || !act || seat === S.ps || me.bot) return false;
          lock(now); return true;
        case 'vote':
          if (S.ph !== 'guess' || act || me.bot || (m.d !== 'L' && m.d !== 'R') || S.votes[seat]) return false;
          S.votes[seat] = m.d; S.vl.push(seat);
          if (voters().every(i => S.votes[i])) reveal(now);
          return true;
        case 'next':
          if (S.ph !== 'reveal' || me.bot || S.nx[seat]) return false;
          S.nx[seat] = 1;
          if (S.P.every((p, i) => p.bot || S.nx[i])) advance(now);
          return true;
        case 'say': {
          const x = clean(m.x, 140);
          if (!x || (S.ph === 'dial' && seat === S.ps)) return false;
          S.chat.push({ s: seat, t: me.t, x });
          if (S.chat.length > 60) S.chat.shift();
          return true;
        }
        case 'again':
          if (S.ph !== 'over' || !ld) return false;
          startGame(now); return true;
        case 'teams':
          if (S.ph !== 'over' || !ld) return false;
          S.P = S.P.filter(p => !p.as); S.ph = 'teams'; return true;
      }
      return false;
    };

    E.tick = now => {
      let ch = false;
      if (S.ph === 'clue') {
        if (S.P[S.ps].bot && now >= S.ba) { botClue(now); ch = true; }
        else if (S.dl && now >= S.dl) {
          S.res = { skip: 1 }; S.pick = -1; S.ph = 'reveal'; S.dl = now + 6000; S.nx = {}; ch = true;
        }
      } else if (S.ph === 'dial') {
        if (S.bd) {
          const k = clamp((now - S.bd.s) / S.bd.d, 0, 1), e = 1 - Math.pow(1 - k, 3), v = Math.round((S.bd.from + (S.bd.to - S.bd.from) * e) * 10) / 10;
          if (v !== S.dial) { S.dial = v; ch = true; }
          if (now >= S.ba) { lock(now); ch = true; }
        } else if (botDial(now)) ch = true;
        else if (S.dl && now >= S.dl) { lock(now); ch = true; }
      } else if (S.ph === 'guess') {
        for (const i of voters()) if (S.P[i].bot && !S.votes[i] && now >= S.bv[i]) { castBot(i); ch = true; }
        if (S.ph === 'guess') {
          if (voters().every(i => S.votes[i]) || (S.dl && now >= S.dl)) { reveal(now); ch = true; }
        }
      } else if (S.ph === 'reveal') {
        if (now >= S.dl) { advance(now); ch = true; }
      }
      return ch;
    };

    E.seatOut = i => {
      const p = S.P[i]; if (!p || p.bot) return;
      p.bot = true; p.hid = null;
      if (S.ph === 'clue' && i === S.ps) S.ba = 1;
      if (S.ph === 'guess' && S.votes[i] === undefined) S.bv[i] = 0;
    };

    E.view = (seat, now) => {
      const me = S.P[seat] || S.P[0], psy = seat === S.ps && S.ph !== 'teams' && S.ph !== 'over';
      const v = {
        g: 'wl', ph: S.ph, o: S.o, sc: S.sc, at: S.at, tn: S.tn, mt: me.t, psy: psy ? 1 : 0, ps: S.ps, win: S.win,
        P: S.P.map((p, i) => ({ n: p.n, t: p.t, bot: p.bot ? 1 : 0, as: p.as ? 1 : 0, ps: i === S.ps && S.ph !== 'teams' && S.ph !== 'over' ? 1 : 0, vo: S.votes[i] ? 1 : 0, nx: S.nx[i] ? 1 : 0 })),
        tl: S.dl ? Math.max(0, S.dl - now) : 0, clue: S.clue, dial: S.dial, res: S.res,
        chat: S.chat.filter(c => c.t === me.t).map(c => ({ n: S.P[c.s] ? S.P[c.s].n : '?', x: c.x, me: c.s === seat ? 1 : 0 }))
      };
      if (S.ph === 'clue') {
        v.hint = psy ? S.cards.map(c => ({ i: c.c, l: SPEC[c.c].l, r: SPEC[c.c].r, t: Math.round(c.t * 10) / 10 })) : null;
      } else if (S.pick >= 0) {
        const c = S.cards[S.pick];
        v.card = { i: c.c, l: SPEC[c.c].l, r: SPEC[c.c].r };
        if (psy || S.ph === 'reveal') v.tgt = Math.round(c.t * 10) / 10;
      }
      if (S.ph === 'guess') v.mv = S.votes[seat] || '';
      if (S.ph === 'reveal') v.votes = S.votes;
      return v;
    };
    return E;
  }

  const WL_CX = 210, WL_CY = 204, WL_R = 190, WL_RI = 174;
  const wlPol = (p, r) => { const a = Math.PI * (1 - p / 100); return [WL_CX + r * Math.cos(a), WL_CY - r * Math.sin(a)]; };
  const wlSector = (a, b, r) => {
    a = clamp(a, 0, 100); b = clamp(b, 0, 100);
    const [x1, y1] = wlPol(a, r), [x2, y2] = wlPol(b, r);
    return `M${WL_CX} ${WL_CY}L${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z`;
  };
  const wlHalf = (r, s) => s < 0
    ? `M${WL_CX} ${WL_CY}L${WL_CX - r} ${WL_CY}A${r} ${r} 0 0 1 ${WL_CX} ${WL_CY - r}Z`
    : `M${WL_CX} ${WL_CY}L${WL_CX} ${WL_CY - r}A${r} ${r} 0 0 1 ${WL_CX + r} ${WL_CY}Z`;
  const wlDialSVG = () => {
    let ticks = '';
    for (let p = 0; p <= 100; p += 5) {
      const big = p % 25 === 0, [x1, y1] = wlPol(p, WL_R - 1), [x2, y2] = wlPol(p, WL_R - (big ? 13 : 7));
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return `<svg class="wl-dial" viewBox="0 0 420 240" tabindex="0" role="slider" aria-label="Dial" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
<defs><linearGradient id="wlg" x1="0" x2="1" y1="0" y2="0"><stop class="g0" offset="0"/><stop class="g1" offset="1"/></linearGradient>
<clipPath id="wlc"><path d="M${WL_CX - WL_RI} ${WL_CY}A${WL_RI} ${WL_RI} 0 0 1 ${WL_CX + WL_RI} ${WL_CY}Z"/></clipPath>
<pattern id="wlp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="5" height="12" fill="rgba(255,255,255,.055)"/></pattern>
<linearGradient id="wld" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#383e72"/><stop offset="1" stop-color="#1c2042"/></linearGradient></defs>
<path class="face" d="M${WL_CX - WL_R} ${WL_CY}A${WL_R} ${WL_R} 0 0 1 ${WL_CX + WL_R} ${WL_CY}Z" fill="url(#wlg)"/>
<g class="tk" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-linecap="round">${ticks}</g>
<g clip-path="url(#wlc)">
<path d="${wlSector(0, 100, WL_RI)}" fill="rgba(255,255,255,.14)"/>
<g class="wd" opacity="0"><path class="w2 a"/><path class="w2 b"/><path class="w3 a"/><path class="w3 b"/><path class="w4"/><g class="wt" font-family="var(--sans)" font-weight="900" font-size="13" fill="#fff" text-anchor="middle"></g></g>
<g class="doors" data-s="closed"><g class="dl"><path d="${wlHalf(WL_RI + 2, -1)}" fill="url(#wld)"/><path d="${wlHalf(WL_RI + 2, -1)}" fill="url(#wlp)"/><path d="${wlHalf(WL_RI - 16, -1)}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/><path d="${wlHalf(WL_RI - 52, -1)}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2"/></g>
<g class="dr"><path d="${wlHalf(WL_RI + 2, 1)}" fill="url(#wld)"/><path d="${wlHalf(WL_RI + 2, 1)}" fill="url(#wlp)"/><path d="${wlHalf(WL_RI - 16, 1)}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/><path d="${wlHalf(WL_RI - 52, 1)}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2"/></g>
<line x1="${WL_CX}" y1="${WL_CY}" x2="${WL_CX}" y2="${WL_CY - WL_RI}" stroke="rgba(0,0,0,.35)" stroke-width="2"/></g>
</g>
<g class="nd" style="transform-origin:${WL_CX}px ${WL_CY}px;opacity:0"><path class="nb" d="M${WL_CX - 7} ${WL_CY}L${WL_CX} ${WL_CY - WL_R + 3}L${WL_CX + 7} ${WL_CY}Z" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle class="nh" cx="${WL_CX}" cy="${WL_CY}" r="17" stroke="#fff" stroke-width="4"/></g>
<rect x="${WL_CX - 150}" y="${WL_CY + 12}" width="300" height="2" rx="1" fill="rgba(0,0,0,.08)"/>
</svg>`;
  };

  const WL_HOW = `<p><b>Goal.</b> Two teams take turns. The <b>psychic</b> sees a hidden target on a spectrum between two opposites (for example Hot and Cold) and gives a clue that points to it. Their teammates turn the dial to where they think the target is.</p>
<p><b>Clue.</b> One word or short phrase. No numbers, and no word that appears on the spectrum. The psychic then stays silent.</p>
<p><b>Score.</b> The cover slides open. The target has a bullseye worth <b>4</b>, then <b>3</b> on each side, then <b>2</b>. Before the reveal the other team calls whether the target is further <b>left</b> or <b>right</b> of the dial. If they are right and the guess was not a bullseye, they win <b>1</b> point.</p>
<p><b>Win.</b> First team to the target score wins, once both teams have had the same number of turns. Ties play on.</p>
<p><b>Keys.</b> Drag the dial or use <kbd>&larr;</kbd><kbd>&rarr;</kbd> (hold <kbd>Shift</kbd> for big steps), <kbd>Enter</kbd> locks it in, <kbd>L</kbd> / <kbd>R</kbd> calls left or right.</p>
<p><b>Bots.</b> Bots fill empty seats. A bot psychic uses a prepared clue. Bot teammates guess close to the target with some error, so they are weaker or stronger by the bot level in the options.</p>`;

  function wlMount(root, api) {
    const app = h('div', 'wl-app');
    app.innerHTML = `<div class="wl-bar"><div class="wl-team t0" style="--tc:${WL_COL[0]}"><span class="nm">${WL_TN[0]}</span><b class="sc">0</b><i class="pr"><u></u></i></div>
<div class="wl-mid"><span class="rd"></span><span class="tm"></span></div>
<div class="wl-team t1" style="--tc:${WL_COL[1]}"><span class="nm">${WL_TN[1]}</span><b class="sc">0</b><i class="pr"><u></u></i></div>
<button type="button" class="wl-x" aria-label="Leave game" title="Leave game"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
<div class="wl-tb"><u></u></div>
<div class="wl-body"><div class="wl-stage"><div class="wl-clue"></div><div class="wl-dwrap">${wlDialSVG()}<div class="wl-pop" hidden></div></div><div class="wl-ends"><span class="e0"></span><span class="e1"></span></div></div>
<div class="wl-side"><div class="wl-panel pnl"></div><div class="wl-chat pnl" hidden><div class="lab">Team chat</div><div class="ms"></div><form class="cf"><input class="g-input" maxlength="140" placeholder="Talk with your team" aria-label="Team chat message" autocomplete="off"><button type="submit" class="g-btn sm">Send</button></form></div></div></div>`;
    root.append(app);
    app.hidden = true;
    const q = s => app.querySelector(s);
    const svg = q('.wl-dial'), doors = q('.doors'), nd = q('.nd'), wd = q('.wd'), panel = q('.wl-panel'), chatEl = q('.wl-chat'), ms = q('.ms');
    const L = { v: null, pk: 0, drag: false, local: 50, sentAt: 0, last: 50, key: '', opened: false, prev: { ph: '', tn: 0 }, T: { left: 0, at: 0, tot: 0 }, tickAt: 50, cn: -1, err: '' };

    const G = Glue(root, api, {
      key: 'wavelength', title: 'Wavelength', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], def: 6, max: 12,
      logo: `<svg viewBox="0 0 120 70" width="150" style="display:block;margin:0 auto 6px"><defs><linearGradient id="wlm" x1="0" x2="1"><stop offset="0" stop-color="#2f7bf6"/><stop offset="1" stop-color="#f2791c"/></linearGradient></defs><path d="M8 62a52 52 0 0 1 104 0z" fill="url(#wlm)"/><path d="M60 62L84 24" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="62" r="8" fill="#1c2042" stroke="#fff" stroke-width="3"/></svg><div class="kick">Team party game</div><h3>Wavelength</h3><p>Give a clue. Turn the dial. Read each other's minds.</p>`,
      how: WL_HOW, soloLabel: 'Play solo with bots',
      build: i => wlEngine({ players: i.players, size: i.size, bots: i.bots, solo: i.solo, o: i.cfg }),
      restore: S => wlEngine({ S }),
      live: S => S.ph !== 'teams' && S.ph !== 'over',
      cfg: () => ({}),
      resumeInfo: S => `Turn ${S.tn}, ${WL_TN[0]} ${S.sc[0]} - ${WL_TN[1]} ${S.sc[1]}.`,
      onView: v => render(v),
      onReset: () => { L.v = null; app.hidden = true; clearTimeout(L.rt); },
      onStart: () => {}
    });
    const X = G.X, sfx = G.sfx, pane = G.pane;
    api.label('Team points');

    const canDial = v => v.ph === 'dial' && v.mt === v.at && !v.psy;
    const canVote = v => v.ph === 'guess' && v.mt !== v.at && !v.mv;
    const pName = (v, i) => (v.P[i] || {}).n || '?';
    const teamTag = t => `<b style="color:${WL_COL[t]}">${WL_TN[t]}</b>`;

    function setDoors(s, instant) {
      if (doors.dataset.s === s) return;
      if (instant) { doors.classList.add('nt'); doors.dataset.s = s; void doors.getBoundingClientRect(); doors.classList.remove('nt'); }
      else doors.dataset.s = s;
    }
    function setNeedle(p) {
      nd.style.transform = `rotate(${((p - 50) * 1.8).toFixed(2)}deg)`;
      svg.setAttribute('aria-valuenow', Math.round(p));
    }
    function wedges(t, w) {
      const z = (a, b) => wlSector(t + a * w, t + b * w, WL_RI);
      const set = (cl, d) => { wd.querySelector(cl).setAttribute('d', d); };
      set('.w2.a', z(-8.33, -5)); set('.w3.a', z(-5, -1.67)); set('.w4', z(-1.67, 1.67)); set('.w3.b', z(1.67, 5)); set('.w2.b', z(5, 8.33));
      const lab = (d, n) => { const [x, y] = wlPol(clamp(t + d * w, 0, 100), WL_RI - 14); return `<text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}">${n}</text>`; };
      wd.querySelector('.wt').innerHTML = lab(-6.67, 2) + lab(-3.33, 3) + lab(0, 4) + lab(3.33, 3) + lab(6.67, 2);
    }

    function onPhase(v, pv) {
      const turnNew = pv.tn !== v.tn || pv.ph === '';
      if (v.ph === 'clue' && turnNew) { q('.wl-pop').hidden = true; L.pk = 0; L.opened = false; L.err = ''; setDoors('closed', true); if (v.psy) sfx.arp([660, 880], .09, 'triangle', .05); }
      if (v.ph === 'dial' && pv.ph !== 'dial') { L.drag = false; sfx.arp([523, 659, 784], .08, 'triangle', .05); }
      if (v.ph === 'guess' && pv.ph !== 'guess') sfx.tone(440, .12, 'square', .03, 330);
      if (v.ph === 'reveal') {
        if (pv.ph === 'guess' && pv.tn === v.tn && v.res && !v.res.skip) {
          L.opened = false;
          sfx.noise(.9, .05, 300, .8, 2400);
          L.rt = api.timeout(() => { L.opened = true; reveal(L.v); }, 900);
        } else { L.opened = true; api.timeout(() => reveal(L.v), 0); }
        if (v.res && v.res.skip) sfx.tone(180, .3, 'sawtooth', .04, 120);
      }
      if (v.ph === 'over' && pv.ph !== 'over') {
        const won = v.win === v.mt;
        sfx.arp(won ? [523, 659, 784, 1047, 1319] : [392, 349, 311, 262], .13, 'triangle', .06, .3);
        if (!v.on && won) api.submit(v.sc[v.mt]);
      }
      if (v.ph === 'teams' || v.ph === 'over') setDoors('closed', true);
    }

    function reveal(v) {
      if (!v || v.ph !== 'reveal' || !v.res || v.res.skip) return;
      setDoors('open'); bar(v); api.score(shown(v)[v.mt]);
      const r = v.res, pop = q('.wl-pop');
      pop.hidden = false; pop.className = 'wl-pop p' + r.pts;
      pop.innerHTML = r.pts ? `+${r.pts}` : 'Miss';
      pop.style.animation = 'none'; void pop.offsetWidth; pop.style.animation = '';
      api.timeout(() => { pop.hidden = true; }, 3200);
      const f = r.pts === 4 ? [523, 659, 784, 1047, 1319] : r.pts === 3 ? [523, 659, 784] : r.pts === 2 ? [523, 659] : [233, 196];
      api.timeout(() => sfx.arp(f, .1, r.pts ? 'triangle' : 'sawtooth', r.pts ? .06 : .04, .25), 700);
      updPanel(v);
    }

    const shown = v => {
      const sc = v.sc.slice();
      if (v.ph === 'reveal' && !L.opened && v.res && !v.res.skip) { sc[v.at] -= v.res.pts; sc[1 - v.at] -= v.res.bonus; }
      return sc;
    };
    function bar(v) {
      const live = v.ph !== 'teams' && v.ph !== 'over', sc = shown(v);
      [0, 1].forEach(t => {
        const e = q('.wl-team.t' + t);
        e.querySelector('.sc').textContent = sc[t];
        e.querySelector('u').style.width = Math.min(100, sc[t] / v.o.target * 100) + '%';
        e.classList.toggle('on', live && v.at === t);
        e.classList.toggle('me', v.mt === t);
      });
      q('.rd').textContent = v.ph === 'teams' ? 'First to ' + v.o.target : v.ph === 'over' ? 'Game over' : 'Turn ' + v.tn + ' - first to ' + v.o.target;
    }

    function stage(v) {
      const show = v.ph !== 'teams' && v.ph !== 'over';
      q('.wl-stage').hidden = !show;
      q('.wl-body').classList.toggle('ns', !show);
      if (!show) return;
      let card = v.card || null, tgt = v.tgt;
      if (v.ph === 'clue') { if (v.hint) { const c = v.hint[Math.min(L.pk, 1)]; card = c; tgt = c.t; } else card = null; }
      if (v.ph === 'reveal' && v.res && v.res.skip) card = null;
      const cols = specCols(card ? card.i : 11);
      q('.g0').setAttribute('stop-color', cols[0]); q('.g1').setAttribute('stop-color', cols[1]);
      q('.e0').innerHTML = card ? `<i style="background:${cols[0]}"></i>${esc(card.l)}` : '';
      q('.e1').innerHTML = card ? `${esc(card.r)}<i style="background:${cols[1]}"></i>` : '';
      if (tgt != null) { wedges(tgt, v.o.wedge); wd.setAttribute('opacity', 1); } else wd.setAttribute('opacity', 0);
      const peek = tgt != null && v.ph !== 'reveal';
      if (v.ph === 'reveal') setDoors(L.opened && v.res && !v.res.skip ? 'open' : 'closed', !L.opened && doors.dataset.s !== 'closed');
      else setDoors(peek ? 'peek' : 'closed', false);
      const showNd = v.ph === 'dial' || v.ph === 'guess' || v.ph === 'reveal';
      nd.style.opacity = showNd ? 1 : 0;
      nd.querySelector('.nb').setAttribute('fill', WL_COL[v.at]); nd.querySelector('.nh').setAttribute('fill', WL_COL[v.at]);
      const dg = L.drag && canDial(v);
      nd.classList.toggle('dg', dg);
      setNeedle(dg ? L.local : v.dial);
      svg.classList.toggle('can', canDial(v));
      const cl = q('.wl-clue');
      if (v.ph === 'clue') cl.innerHTML = v.psy ? `<span class="who">You are the psychic</span>Pick a card, then give a clue` : `<span class="who">${teamTag(v.at)} psychic</span>${esc(pName(v, v.ps))} is thinking of a clue`;
      else if (v.res && v.res.skip) cl.innerHTML = `<span class="who">Time is up</span>No clue was given`;
      else cl.innerHTML = `<span class="who">${esc(pName(v, v.ps))} (${WL_TN[v.at]}) says</span><q>${esc(v.clue)}</q>`;
    }

    const optsHTML = v => v.ld ? `<div class="wl-opts"><div class="opt"><span>Points to win</span>${seg('target', [[7, '7'], [10, '10'], [12, '12']], v.o.target)}</div>
<div class="opt"><span>Turn timer</span>${seg('timer', [[0, 'Off'], [1, 'Relaxed'], [2, 'Fast']], v.o.timer)}</div>
<div class="opt"><span>Scoring zones</span>${seg('wedge', [[.75, 'Narrow'], [1, 'Normal'], [1.5, 'Wide']], v.o.wedge)}</div>
<div class="opt"><span>Bot guessing<small>How close bots get to the target</small></span>${seg('bot', [['easy', 'Rusty'], ['normal', 'Normal'], ['hard', 'Sharp']], v.o.bot)}</div></div>` : `<p class="note">Options are set by the party leader: first to ${v.o.target}, timer ${['off', 'relaxed', 'fast'][v.o.timer]}.</p>`;

    function buildPanel(v) {
      let html = '';
      if (v.ph === 'teams') {
        const col = t => `<div class="tc" style="--tc:${WL_COL[t]}"><div class="th">${WL_TN[t]} team</div>${v.P.map((p, i) => p.t === t ? `<div class="pl${i === v.seat ? ' me' : ''}"><i></i>${esc(p.n)}${p.bot ? '<em>bot</em>' : ''}${i === v.seat ? '<em>you</em>' : ''}</div>` : '').join('') || '<div class="pl none">Empty</div>'}${v.mt !== t ? `<button type="button" class="g-btn ghost sm" data-a="tm${t}">Join ${WL_TN[t]}</button>` : ''}</div>`;
        html = `<div class="lab">Teams</div><div class="wl-teams">${col(0)}${col(1)}</div><p class="note">Empty seats are filled with bots so each team has two players.</p>${optsHTML(v)}
<div class="row">${v.ld && v.on ? BTN('shuf', 'Shuffle teams', 'ghost sm') : ''}${v.ld ? BTN('start', 'Start game') : '<span class="chip">Waiting for the host to start</span>'}</div>`;
      } else if (v.ph === 'clue') {
        if (v.psy) {
          html = `<div class="lab">Your cards <span class="chip" style="margin-left:6px">only you can see</span></div><div class="wl-cards">${v.hint.map((c, i) => `<button type="button" class="wl-card${i === L.pk ? ' on' : ''}" data-a="pk${i}"><span>${esc(c.l)}</span><i><u style="left:${c.t}%"></u></i><span>${esc(c.r)}</span></button>`).join('')}</div>
<form class="cf wl-cf"><input class="g-input" maxlength="80" placeholder="Your clue" aria-label="Your clue" autocomplete="off"><button type="submit" class="g-btn">Give clue</button></form><p class="err" role="alert"></p><p class="note">One concept. No numbers, no words from the spectrum. Then stay silent while your team turns the dial.</p>`;
        } else html = `<div class="lab">Waiting</div><p class="big">${esc(pName(v, v.ps))} is picking a card and writing a clue<span class="dots"></span></p>${v.mt === v.at ? '<p class="note">You are on the guessing team. When the clue arrives, discuss it and turn the dial.</p>' : '<p class="note">The other team is up. Get ready to call left or right once they lock in.</p>'}`;
      } else if (v.ph === 'dial') {
        if (v.psy) html = `<div class="lab">Dial</div><p class="big">Your team is guessing</p><p class="note">Do not speak. The dial position is shown live. The target is the bright zone only you can see.</p>`;
        else if (v.mt === v.at) html = `<div class="lab">Your move</div><p class="big">Where is the target?</p><p class="note">Drag the dial or use <kbd>&larr;</kbd><kbd>&rarr;</kbd>. Talk it over in the team chat.</p><div class="row">${BTN('lock', 'Lock in')}</div>`;
        else html = `<div class="lab">Watching</div><p class="big">${teamTag(v.at)} is turning the dial<span class="dots"></span></p><p class="note">Next you call whether the target is further left or right.</p>`;
      } else if (v.ph === 'guess') {
        if (v.mt === v.at) html = `<div class="lab">Locked in</div><p class="big">The other team is calling left or right<span class="dots"></span></p><p class="note vc"></p>`;
        else html = `<div class="lab">Your call</div><p class="big">Is the target further left or right of the needle?</p><div class="wl-lr"><button type="button" class="g-btn${v.mv === 'L' ? '' : ' ghost'}" data-a="vL"${v.mv ? ' disabled' : ''}>&larr; Left</button><button type="button" class="g-btn${v.mv === 'R' ? '' : ' ghost'}" data-a="vR"${v.mv ? ' disabled' : ''}>Right &rarr;</button></div><p class="note vc"></p>`;
      } else if (v.ph === 'reveal') {
        html = `<div class="lab">Result</div><div class="rs" hidden></div><div class="row"><button type="button" class="g-btn" data-a="next" disabled>Next turn</button></div><p class="note rc"></p>`;
      } else if (v.ph === 'over') {
        const w = v.win, you = w === v.mt;
        html = `<div class="wl-win" style="--tc:${WL_COL[w]}"><div class="kick">${v.on ? (you ? 'Your team wins' : 'Game over') : (you ? 'You win' : 'Game over')}</div><h3>${WL_TN[w]} team wins</h3><div class="fin"><span style="color:${WL_COL[0]}">${WL_TN[0]} ${v.sc[0]}</span><span style="color:${WL_COL[1]}">${WL_TN[1]} ${v.sc[1]}</span></div>${[...Array(26)].map(() => `<i class="cf" style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 1.6).toFixed(2)}s;--r:${(Math.random() * 360).toFixed(0)}deg;--c:${['#2f7bf6', '#f2791c', '#ffd23f', '#ff4f6d', '#3ddc97'][ri(5)]}"></i>`).join('')}</div>${v.ld ? `<div class="row">${BTN('again', 'Play again')}${BTN('teams', 'Change teams', 'ghost')}${v.on ? BTN('lobby', 'Back to lobby', 'ghost') : ''}</div>` : '<p class="note">Waiting for the host to start another game.</p>'}<div class="row">${BTN('leave', 'Leave', 'ghost sm')}</div>`;
      }
      panel.innerHTML = html;
    }

    function updPanel(v) {
      if (v.ph === 'guess') {
        const c = panel.querySelector('.vc');
        if (c) { const vs = v.P.filter((p, i) => p.t !== v.at), n = vs.filter(p => p.vo).length; c.textContent = `${n} of ${vs.length} have called it`; }
      } else if (v.ph === 'reveal') {
        const rs = panel.querySelector('.rs'), nb = panel.querySelector('[data-a=next]'), rc = panel.querySelector('.rc');
        if (!rs) return;
        const r = v.res, ok = L.opened || r.skip;
        rs.hidden = !ok;
        nb.disabled = !ok;
        if (ok && !rs.innerHTML) {
          const other = 1 - v.at;
          if (r.skip) rs.innerHTML = `<p class="big">No clue in time</p><p class="note">The turn is skipped. The next psychic is up.</p>`;
          else rs.innerHTML = `<p class="big">${['Missed', 'Missed', 'Close', 'So close', 'Bullseye'][r.pts]}${r.pts ? ` - ${teamTag(v.at)} scores +${r.pts}` : ''}</p>${v.votes && Object.keys(v.votes).length ? `<p class="note">${teamTag(other)} said <b>${r.vote === 'L' ? 'left' : 'right'}</b>. The target was ${r.dir === 'L' ? 'left' : 'right'} of the needle${r.bonus ? ` so they score <b>+1</b>.` : r.pts === 4 ? ' (not needed).' : '.'}</p>` : '<p class="note">The other team made no call.</p>'}`;
        }
        const hum = v.P.filter(p => !p.bot);
        rc.textContent = `${hum.filter(p => p.nx).length} of ${hum.length} ready` + (L.T.left ? ` - next turn in ${Math.ceil(Math.max(0, L.T.left - (performance.now() - L.T.at)) / 1000)}s` : '');
        if (v.P[v.seat] && v.P[v.seat].nx) { nb.disabled = true; nb.textContent = 'Ready'; }
      }
    }

    function chat(v) {
      chatEl.hidden = !(v.on && v.ph !== 'teams' && v.ph !== 'over');
      if (chatEl.hidden) return;
      chatEl.querySelector('.lab').innerHTML = `${teamTag(v.mt)} team chat`;
      const sig = v.chat.length + '|' + (v.chat.length ? v.chat[v.chat.length - 1].x : '');
      if (sig !== L.cn) {
        L.cn = sig;
        ms.innerHTML = v.chat.map(c => `<p class="${c.me ? 'me' : ''}"><b>${esc(c.n)}</b> ${esc(c.x)}</p>`).join('') || '<p class="none">No messages yet</p>';
        ms.scrollTop = ms.scrollHeight;
      }
      const inp = chatEl.querySelector('input'), off = v.ph === 'dial' && v.psy;
      inp.disabled = off; inp.placeholder = off ? 'The psychic stays silent' : 'Talk with your team';
    }

    function timer(v) {
      L.T.left = v.tl; L.T.at = performance.now();
      const tot = v.tl ? ((WL_TIMES[v.o.timer] || {})[v.ph === 'clue' ? 'clue' : v.ph] || 0) * 1000 : 0;
      L.T.tot = v.ph === 'reveal' ? (v.res && v.res.skip ? 6000 : 16000) : tot;
      drawTimer();
    }
    function drawTimer() {
      const v = L.v; if (!v) return;
      const t = q('.tm'), b = q('.wl-tb u');
      const left = L.T.left ? Math.max(0, L.T.left - (performance.now() - L.T.at)) : 0;
      t.textContent = left ? fmtT(left) : '';
      t.classList.toggle('hot', left > 0 && left < 10000 && v.ph !== 'reveal');
      b.style.width = left && L.T.tot ? Math.min(100, left / L.T.tot * 100) + '%' : '0';
      if (v.ph === 'reveal') panel.querySelector('.rc') && updPanel(v);
    }
    api.interval(() => {
      if (api.paused && X.role === 'local') { L.T.at = performance.now(); return; }
      if (!L.v) return;
      const left = L.T.left ? L.T.left - (performance.now() - L.T.at) : 0;
      if (left > 0 && left < 10000 && L.v.ph !== 'reveal' && Math.ceil(left / 1000) !== L.tk) { L.tk = Math.ceil(left / 1000); sfx.tone(880, .05, 'square', .02); }
      drawTimer();
    }, 250);

    function render(v) {
      app.hidden = false;
      const pv = L.prev, changed = v.ph !== pv.ph || v.tn !== pv.tn;
      L.v = v;
      if (changed) onPhase(v, pv);
      L.prev = { ph: v.ph, tn: v.tn };
      api.score(shown(v)[v.mt]);
      bar(v); stage(v);
      const key = v.ph === 'teams' ? 'teams' + JSON.stringify([v.P.map(p => [p.n, p.t, p.bot]), v.o, v.ld, v.mt, v.on]) : v.ph === 'over' ? 'over' + v.win + v.ld : [v.ph, v.tn, v.mt === v.at, v.psy, v.mv || '', v.ld].join('|');
      if (key !== L.key || changed) { L.key = key; buildPanel(v); }
      updPanel(v); chat(v); timer(v);
    }

    panel.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a, v = L.v; if (!v) return;
      if (a === 'tm0' || a === 'tm1') X.act({ t: 'team', v: +a[2] });
      else if (a === 'shuf') X.act({ t: 'shuf' });
      else if (a === 'start') X.act({ t: 'start' });
      else if (a === 'lock') lock();
      else if (a === 'vL' || a === 'vR') vote(a[1]);
      else if (a === 'next') next();
      else if (a === 'again') X.act({ t: 'again' });
      else if (a === 'teams') X.act({ t: 'teams' });
      else if (a === 'lobby') X.toLobby();
      else if (a === 'leave') X.leave();
      else if (a === 'pk0' || a === 'pk1') { L.pk = +a[2]; panel.querySelectorAll('.wl-card').forEach((c, i) => c.classList.toggle('on', i === L.pk)); stage(v); sfx.tone(600, .05, 'triangle', .04); }
    });
    bindSeg(panel, (k, val) => X.act({ t: 'opt', k, v: k === 'bot' ? val : +val }));
    panel.addEventListener('submit', e => {
      e.preventDefault();
      const v = L.v, inp = panel.querySelector('.wl-cf input'); if (!v || !inp) return;
      const card = v.hint[Math.min(L.pk, 1)], txt = clean(inp.value, 80), bad = clueBad(txt, card);
      const er = panel.querySelector('.err');
      if (bad) { er.textContent = bad; sfx.tone(180, .15, 'sawtooth', .04); inp.focus(); return; }
      er.textContent = '';
      sfx.tone(700, .1, 'triangle', .05);
      X.act({ t: 'clue', k: Math.min(L.pk, 1), x: txt });
    });
    panel.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' && e.key !== 'Escape') e.stopPropagation(); });
    chatEl.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const inp = chatEl.querySelector('input'), x = clean(inp.value, 140);
      if (x) { X.act({ t: 'say', x }); inp.value = ''; }
    });
    chatEl.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' && e.key !== 'Escape') e.stopPropagation(); });
    q('.wl-x').addEventListener('click', () => { const v = L.v; if (!v || v.ph === 'teams' || v.ph === 'over') X.leave(); else G.confirmLeave(); });

    function lock() { if (L.v && canDial(L.v)) { sfx.tone(300, .1, 'square', .05, 600); L.drag = false; sendDial(true); X.act({ t: 'lock' }); } }
    function vote(d) { if (L.v && canVote(L.v)) { sfx.tone(d === 'L' ? 400 : 560, .1, 'triangle', .05); X.act({ t: 'vote', d }); } }
    function next() { const v = L.v; if (v && v.ph === 'reveal' && L.opened && !(v.P[v.seat] || {}).nx) X.act({ t: 'next' }); }

    function sendDial(force) {
      const now = performance.now();
      if (!force && now - L.sentAt < 70) { clearTimeout(L.st); L.st = setTimeout(() => sendDial(true), 80); return; }
      clearTimeout(L.st); L.sentAt = now;
      X.act({ t: 'dial', v: L.local });
    }
    function setLocal(p) {
      p = clamp(Math.round(p * 10) / 10, 0, 100);
      if (p === L.local && L.drag) return;
      L.local = p; L.dragAt = performance.now(); setNeedle(p);
      if (Math.abs(p - L.tickAt) >= 2) { L.tickAt = p; sfx.tone(260 + p * 5, .03, 'square', .012); }
      sendDial(false);
    }
    const fromEvent = e => {
      const r = svg.getBoundingClientRect(), k = r.width / 420;
      const dx = e.clientX - (r.left + WL_CX * k), dy = (r.top + WL_CY * k) - e.clientY;
      if (dy <= 0 && Math.abs(dx) < 4 * k) return L.local;
      const a = dy < 0 ? (dx < 0 ? Math.PI : 0) : Math.atan2(dy, dx);
      return (1 - a / Math.PI) * 100;
    };
    svg.addEventListener('pointerdown', e => {
      if (!L.v || !canDial(L.v)) return;
      L.drag = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {}
      svg.focus({ preventScroll: true }); setLocal(fromEvent(e)); e.preventDefault();
    });
    svg.addEventListener('pointermove', e => { if (L.drag && L.v && canDial(L.v)) setLocal(fromEvent(e)); });
    const up = () => { if (L.drag) { L.drag = false; sendDial(true); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    const nudge = p => { if (!L.drag) L.local = L.v.dial; L.drag = true; setLocal(typeof p === 'function' ? p(L.local) : p); };
    svg.addEventListener('keydown', e => {
      const v = L.v; if (!v || !canDial(v)) return;
      const st = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nudge(p => p - st);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nudge(p => p + st);
      else if (e.key === 'Home') nudge(0); else if (e.key === 'End') nudge(100);
      else if (e.key === 'Enter') lock();
      else return;
      e.preventDefault(); e.stopPropagation();
    });
    svg.addEventListener('keyup', () => { if (L.drag) { L.drag = false; sendDial(true); } });
    api.interval(() => { if (L.drag && L.v && performance.now() - L.dragAt > 900 && !svg.matches(':active')) L.drag = false; }, 400);

    api.on(window, 'keydown', e => {
      const v = L.v;
      if (!v || !pane.el.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input,textarea,select,button')) return;
      const k = e.key;
      if (canDial(v)) {
        const st = e.shiftKey ? 5 : 1;
        if (k === 'ArrowLeft') nudge(p => p - st);
        else if (k === 'ArrowRight') nudge(p => p + st);
        else if (k === 'Enter' || k === ' ') lock();
        else return;
        e.preventDefault();
      } else if (canVote(v)) {
        if (k === 'l' || k === 'L' || k === 'ArrowLeft') vote('L'); else if (k === 'r' || k === 'R' || k === 'ArrowRight') vote('R'); else return;
        e.preventDefault();
      } else if (v.ph === 'reveal' && (k === 'Enter' || k === ' ')) { next(); e.preventDefault(); }
    });
    api.on(window, 'keyup', e => { if (L.drag && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { L.drag = false; sendDial(true); } });

    const sync = () => { if (L.v && L.v.ph === 'dial' && !L.drag) L.local = L.v.dial; };
    api.interval(sync, 200);

    root._wl = { L, X, G };
    G.start();
    return { destroy() { G.destroy(); } };
  }

  const WL_CSS = KIT('.gm-wavelength') + `
.gm-wavelength{--wb:#2f7bf6;--wo:#f2791c;container-type:normal}
.gm-wavelength .wl-app{container-type:inline-size;display:flex;flex-direction:column;gap:10px;width:100%}
.gm-wavelength .wl-bar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;align-items:center;gap:10px}
.gm-wavelength .wl-team{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;padding:9px 14px 12px;border-radius:16px;background:#fff;border:2px solid var(--line);box-shadow:var(--sh-1);transition:border-color .3s,box-shadow .3s,transform .3s var(--spring)}
.gm-wavelength .wl-team.t1{flex-direction:row-reverse;text-align:right}
.gm-wavelength .wl-team .nm{font:900 13px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--tc)}
.gm-wavelength .wl-team .sc{margin-left:auto;font:900 28px/1 var(--sans);font-variant-numeric:tabular-nums;color:var(--ink)}
.gm-wavelength .wl-team.t1 .sc{margin-left:0;margin-right:auto}
.gm-wavelength .wl-team .pr{position:absolute;left:0;right:0;bottom:0;height:5px;background:var(--sunk)}
.gm-wavelength .wl-team .pr u{display:block;height:100%;width:0;background:var(--tc);transition:width .9s var(--ease)}
.gm-wavelength .wl-team.on{border-color:var(--tc);box-shadow:0 0 0 4px color-mix(in srgb,var(--tc) 20%,transparent),var(--sh-2);transform:translateY(-2px)}
.gm-wavelength .wl-team.me:after{content:"YOUR TEAM";position:absolute;top:4px;left:14px;font:900 8.5px/1 var(--sans);letter-spacing:.1em;color:var(--muted)}
.gm-wavelength .wl-team.t1.me:after{left:auto;right:14px}
.gm-wavelength .wl-mid{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:84px;text-align:center}
.gm-wavelength .wl-mid .rd{font:800 11px/1.2 var(--sans);color:var(--muted)}
.gm-wavelength .wl-mid .tm{font:900 20px/1 var(--sans);font-variant-numeric:tabular-nums;min-height:20px}
.gm-wavelength .wl-mid .tm.hot{color:var(--bad);animation:wlHot .5s infinite alternate}
@keyframes wlHot{to{transform:scale(1.15)}}
.gm-wavelength .wl-x{width:40px;height:40px;border-radius:12px;border:2px solid var(--line-2);background:#fff;color:var(--ink-2);display:grid;place-items:center;cursor:pointer;padding:0;transition:border-color .2s,color .2s}
.gm-wavelength .wl-x:hover{border-color:var(--bad);color:var(--bad)}
.gm-wavelength .wl-tb{height:4px;border-radius:2px;background:var(--sunk);overflow:hidden;margin-top:-4px}
.gm-wavelength .wl-tb u{display:block;height:100%;width:0;background:var(--accent);transition:width .3s linear}
.gm-wavelength .wl-body{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
@container (min-width:800px){.gm-wavelength .wl-body{grid-template-columns:minmax(0,1.3fr) minmax(300px,1fr)}}
.gm-wavelength .wl-body.ns{grid-template-columns:minmax(0,640px);justify-content:center}
.gm-wavelength .wl-stage{display:flex;flex-direction:column;gap:6px;padding:10px 12px 12px;background:linear-gradient(#fff,#f6f4ff);border:1px solid var(--line);border-radius:22px;box-shadow:var(--sh-1)}
.gm-wavelength .wl-clue{min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font:800 15px/1.3 var(--sans);color:var(--ink-2)}
.gm-wavelength .wl-clue .who{font:900 10.5px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.gm-wavelength .wl-clue q{quotes:none;font:900 clamp(22px,5.4cqw,34px)/1.1 var(--sans);letter-spacing:-.02em;color:var(--ink);animation:wlClue .5s var(--spring);word-break:break-word}
@keyframes wlClue{from{opacity:0;transform:translateY(8px) scale(.9)}}
.gm-wavelength .wl-dwrap{position:relative;width:100%;max-width:620px;margin:0 auto}
.gm-wavelength .wl-dial{display:block;width:100%;height:auto;touch-action:none;user-select:none;-webkit-user-select:none;outline:0;overflow:visible}
.gm-wavelength .wl-dial.can{cursor:grab}
.gm-wavelength .wl-dial.can:focus-visible{filter:drop-shadow(0 0 6px var(--accent))}
.gm-wavelength .wl-dial .face{filter:drop-shadow(0 8px 12px rgba(31,29,43,.2))}
.gm-wavelength .wl-dial .w2{fill:#7be0ff}.gm-wavelength .wl-dial .w3{fill:#ffd23f}.gm-wavelength .wl-dial .w4{fill:#ff4f6d}
.gm-wavelength .wl-dial .wd{transition:opacity .4s}
.gm-wavelength .wl-dial .wt text{paint-order:stroke;stroke:rgba(0,0,0,.35);stroke-width:3px}
.gm-wavelength .doors{transition:opacity .35s}
.gm-wavelength .doors .dl,.gm-wavelength .doors .dr{transition:transform 1.15s cubic-bezier(.7,0,.2,1)}
.gm-wavelength .doors[data-s=open] .dl{transform:translateX(-190px)}
.gm-wavelength .doors[data-s=open] .dr{transform:translateX(190px)}
.gm-wavelength .doors[data-s=peek]{opacity:0}
.gm-wavelength .doors.nt,.gm-wavelength .doors.nt *{transition:none!important}
.gm-wavelength .nd{transition:transform .12s linear,opacity .3s;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}
.gm-wavelength .nd.dg{transition:opacity .3s}
.gm-wavelength .wl-pop{position:absolute;left:50%;top:6%;transform:translateX(-50%);padding:6px 18px;border-radius:999px;font:900 28px/1 var(--sans);color:#fff;background:#1c2042;box-shadow:var(--sh-3);animation:wlPop 3.2s var(--ease) both;pointer-events:none}
.gm-wavelength .wl-pop.p4{background:#ff4f6d}.gm-wavelength .wl-pop.p3{background:#f0a800}.gm-wavelength .wl-pop.p2{background:#2aa8d6}
@keyframes wlPop{0%{opacity:0;transform:translate(-50%,20px) scale(.5)}12%{opacity:1;transform:translate(-50%,0) scale(1.15)}22%{transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-14px)}}
.gm-wavelength .wl-ends{display:flex;justify-content:space-between;gap:10px;max-width:620px;width:100%;margin:0 auto}
.gm-wavelength .wl-ends span{display:inline-flex;align-items:center;gap:7px;max-width:48%;font:900 15px/1.15 var(--sans);color:var(--ink)}
.gm-wavelength .wl-ends .e1{text-align:right;flex-direction:row-reverse;margin-left:auto}
.gm-wavelength .wl-ends i{flex:none;width:12px;height:12px;border-radius:50%}
.gm-wavelength .wl-side{display:flex;flex-direction:column;gap:10px;min-width:0}
.gm-wavelength .wl-panel{padding:14px 16px;display:flex;flex-direction:column;gap:8px}
.gm-wavelength .wl-panel .big{margin:0;font:900 18px/1.25 var(--sans);letter-spacing:-.01em}
.gm-wavelength .wl-panel .note{margin:0;font:700 13px/1.45 var(--sans);color:var(--ink-2)}
.gm-wavelength .wl-panel .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.gm-wavelength .wl-panel .row .g-btn{flex:1 1 auto}
.gm-wavelength .wl-panel .err{margin:0;min-height:0;font:800 13px/1.3 var(--sans);color:var(--bad)}
.gm-wavelength .wl-panel .err:empty{display:none}
.gm-wavelength .dots:after{content:"";animation:wlDots 1.2s steps(4) infinite}
@keyframes wlDots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}
.gm-wavelength .cf{display:flex;gap:8px}
.gm-wavelength .cf .g-input{flex:1;min-width:0;height:44px;font-size:15px}
.gm-wavelength .cf .g-btn{height:44px}
.gm-wavelength .wl-cards{display:flex;flex-direction:column;gap:8px}
.gm-wavelength .wl-card{display:grid;grid-template-columns:minmax(0,1fr) minmax(70px,1.2fr) minmax(0,1fr);align-items:center;gap:8px;padding:10px 12px;border-radius:14px;border:2px solid var(--line);background:#fff;cursor:pointer;font:900 13px/1.15 var(--sans);color:var(--ink);transition:border-color .2s,box-shadow .2s,transform .2s}
.gm-wavelength .wl-card span:last-child{text-align:right}
.gm-wavelength .wl-card:hover{border-color:var(--line-2)}
.gm-wavelength .wl-card.on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.gm-wavelength .wl-card i{position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,#dcd8f0,#8d86c9)}
.gm-wavelength .wl-card u{position:absolute;top:-4px;width:6px;height:16px;margin-left:-3px;border-radius:3px;background:#ff4f6d;box-shadow:0 0 0 2px #fff}
.gm-wavelength .wl-lr{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0}
.gm-wavelength .wl-lr .g-btn{height:54px;font-size:17px}
.gm-wavelength .wl-teams{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gm-wavelength .wl-teams .tc{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:14px;border:2px solid color-mix(in srgb,var(--tc) 40%,#fff);background:color-mix(in srgb,var(--tc) 7%,#fff);min-width:0}
.gm-wavelength .wl-teams .th{font:900 12px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--tc)}
.gm-wavelength .wl-teams .pl{display:flex;align-items:center;gap:7px;font:800 14px/1.2 var(--sans);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-wavelength .wl-teams .pl i{flex:none;width:9px;height:9px;border-radius:50%;background:var(--tc)}
.gm-wavelength .wl-teams .pl em{font:800 10px/1 var(--sans);font-style:normal;padding:3px 6px;border-radius:999px;background:var(--sunk);color:var(--muted)}
.gm-wavelength .wl-teams .pl.me{font-weight:900}
.gm-wavelength .wl-teams .pl.none{color:var(--muted)}
.gm-wavelength .wl-opts{margin-top:2px}
.gm-wavelength .wl-win{position:relative;overflow:hidden;text-align:center;padding:18px 8px 10px;border-radius:16px;background:color-mix(in srgb,var(--tc) 9%,#fff);border:2px solid color-mix(in srgb,var(--tc) 40%,#fff)}
.gm-wavelength .wl-win h3{margin:2px 0 8px;font:900 28px/1.05 var(--sans);letter-spacing:-.02em;color:var(--tc)}
.gm-wavelength .wl-win .kick{display:inline-block;padding:4px 11px;border-radius:999px;background:var(--accent-soft);font:900 11px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.gm-wavelength .wl-win .fin{display:flex;justify-content:center;gap:18px;font:900 18px/1 var(--sans)}
.gm-wavelength .wl-win .cf{position:absolute;top:-10px;left:var(--x);width:8px;height:12px;background:var(--c);transform:rotate(var(--r));animation:wlConf 2.6s var(--d) ease-in both;pointer-events:none}
@keyframes wlConf{to{top:110%;transform:rotate(calc(var(--r) + 540deg))}}
.gm-wavelength .wl-chat{display:flex;flex-direction:column;gap:6px;padding:10px 12px}
.gm-wavelength .wl-chat .ms{height:112px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;font:700 13px/1.35 var(--sans)}
.gm-wavelength .wl-chat .ms p{margin:0;word-break:break-word}
.gm-wavelength .wl-chat .ms p b{color:var(--ink)}
.gm-wavelength .wl-chat .ms p.me b{color:var(--accent)}
.gm-wavelength .wl-chat .ms p.none{color:var(--muted)}
.gm-wavelength .wl-chat .g-input:disabled{background:var(--sunk);opacity:.7}
@media (max-width:520px){
.gm-wavelength .wl-bar{grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;grid-template-areas:"a b x" "m m m"}
.gm-wavelength .wl-bar .t0{grid-area:a}.gm-wavelength .wl-bar .t1{grid-area:b}.gm-wavelength .wl-bar .wl-x{grid-area:x}.gm-wavelength .wl-bar .wl-mid{grid-area:m;flex-direction:row;justify-content:center;gap:10px}
.gm-wavelength .wl-team{padding:8px 10px 11px}.gm-wavelength .wl-team .sc{font-size:24px}
.gm-wavelength .wl-team.me:after{display:none}
.gm-wavelength .wl-ends span{font-size:13.5px}
.gm-wavelength .wl-teams{grid-template-columns:1fr}
}
`;

  Ameplay.register({
    id: 'wavelength',
    title: 'Wavelength',
    category: 'Brain',
    tint: '#7c5cff',
    blurb: 'One psychic sees the target on a spectrum and gives a clue. Their team turns the dial, the other team calls left or right.',
    help: 'Drag the dial or <kbd>&larr;</kbd><kbd>&rarr;</kbd> · <kbd>Enter</kbd> lock in · <kbd>L</kbd>/<kbd>R</kbd> call left or right · team chat online',
    width: 980,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 46a23 23 0 0 1 46 0z"/><path d="M32 46l11-16"/><circle cx="32" cy="46" r="3.5"/><path d="M14 46a18 18 0 0 1 4-11"/></svg>',
    css: WL_CSS,
    mount: wlMount
  });

  const PB_RAW = [
    ['boy', 'Boy name', 'Prénom masculin', 1,
      `Aaron, Adam, Alan, Albert, Alex, Andrew, Anthony, Arthur, Ben, Benjamin, Bill, Bob, Brian, Bruce, Carl, Charles, Chris, Colin, Craig, Daniel, David, Dennis, Dylan, Edward, Eric, Ethan, Evan, Felix, Frank, Fred, Gary, George, Greg, Harry, Henry, Hugo, Ian, Isaac, Ivan, Jack, James, Jason, John, Jonathan, Joseph, Justin, Keith, Ken, Kevin, Kyle, Larry, Leo, Liam, Louis, Luke, Mark, Martin, Matthew, Max, Michael, Mike, Nathan, Neil, Nick, Noah, Oliver, Oscar, Owen, Patrick, Paul, Peter, Philip, Quentin, Quincy, Ralph, Richard, Robert, Ryan, Samuel, Scott, Sean, Simon, Steve, Thomas, Tim, Tom, Tony, Victor, Vincent, Walter, William, Wayne, Xavier, Yusuf, Zack, Zachary`,
      `Adam, Adrien, Alain, Alexandre, Antoine, Arnaud, Baptiste, Benoît, Bernard, Bruno, Cédric, Charles, Christophe, Clément, Damien, Daniel, David, Denis, Dylan, Édouard, Émile, Éric, Étienne, Fabien, Félix, François, Frédéric, Gabriel, Gaspard, Gérard, Guillaume, Gustave, Henri, Hervé, Hugo, Ibrahim, Igor, Isaac, Jacques, Jean, Jérôme, Julien, Karim, Kévin, Laurent, Léo, Louis, Lucas, Luc, Marc, Mathieu, Maxime, Michel, Nathan, Nicolas, Noé, Olivier, Oscar, Pascal, Patrick, Paul, Philippe, Pierre, Quentin, Raphaël, Rémi, Robert, Romain, Samuel, Sébastien, Simon, Stéphane, Thomas, Théo, Timothée, Ulysse, Urbain, Valentin, Victor, Vincent, William, Xavier, Yann, Yves, Zacharie`],
    ['girl', 'Girl name', 'Prénom féminin', 1,
      `Abigail, Alice, Amanda, Amy, Anna, Anne, Ashley, Barbara, Beth, Betty, Bella, Brenda, Carol, Caroline, Catherine, Charlotte, Chloe, Claire, Clara, Daisy, Dana, Debbie, Diana, Donna, Dorothy, Eleanor, Elizabeth, Ella, Emily, Emma, Erin, Eva, Fiona, Florence, Frances, Gabrielle, Grace, Gwen, Hannah, Heather, Helen, Holly, Ida, Irene, Isabel, Ivy, Jane, Jennifer, Jessica, Julia, Karen, Kate, Katie, Kelly, Laura, Lily, Linda, Lisa, Lucy, Maria, Martha, Mary, Megan, Mia, Molly, Nancy, Naomi, Natalie, Nicole, Nora, Olivia, Paula, Pamela, Penny, Rachel, Rebecca, Rose, Ruth, Sarah, Sophie, Susan, Tara, Teresa, Tina, Ursula, Vanessa, Victoria, Violet, Wendy, Whitney, Yvonne, Zoe`,
      `Adèle, Agathe, Alice, Amélie, Anaïs, Anne, Audrey, Aurélie, Béatrice, Brigitte, Camille, Capucine, Carole, Catherine, Céline, Charlotte, Chloé, Claire, Clara, Corinne, Delphine, Diane, Dominique, Édith, Éléonore, Élodie, Emma, Estelle, Eugénie, Fanny, Florence, Françoise, Gabrielle, Geneviève, Hélène, Henriette, Inès, Irène, Isabelle, Jacqueline, Jeanne, Julie, Juliette, Karine, Laura, Laurence, Léa, Louise, Lucie, Madeleine, Manon, Margaux, Marie, Marion, Mathilde, Mélanie, Nadine, Natacha, Nathalie, Noémie, Océane, Odile, Pauline, Pénélope, Quitterie, Rachel, Raphaëlle, Rose, Sabrina, Sandrine, Sarah, Sophie, Stéphanie, Sylvie, Thérèse, Ursule, Valérie, Véronique, Victoire, Virginie, Yasmine, Yvonne, Zoé`],
    ['animal', 'Animal', 'Animal', 1,
      `aardvark, alligator, ant, antelope, ape, baboon, badger, bat, bear, beaver, bison, buffalo, camel, cat, cheetah, chimpanzee, cow, coyote, crocodile, deer, dingo, dog, dolphin, donkey, eagle, eel, elephant, elk, emu, falcon, ferret, fox, frog, gazelle, giraffe, goat, gorilla, hamster, hare, hedgehog, hippo, horse, hyena, ibex, iguana, impala, jackal, jaguar, jellyfish, kangaroo, koala, kiwi, lemur, leopard, lion, lizard, llama, lobster, lynx, mole, monkey, moose, mouse, mule, narwhal, newt, ocelot, octopus, orangutan, ostrich, otter, owl, panda, panther, parrot, penguin, pig, platypus, porcupine, quail, quokka, rabbit, raccoon, rat, reindeer, rhino, salmon, seal, shark, sheep, sloth, snake, squirrel, swan, tiger, toad, turkey, turtle, unicorn fish, vulture, walrus, weasel, whale, wolf, wombat, yak, zebra`,
      `agneau, alligator, antilope, araignée, âne, blaireau, baleine, bison, bœuf, buffle, belette, castor, cerf, chameau, chat, cheval, chèvre, chien, chimpanzé, cochon, coyote, crocodile, daim, dauphin, dromadaire, écureuil, éléphant, élan, fourmi, furet, gazelle, girafe, gorille, grenouille, guépard, hamster, hérisson, hippopotame, hyène, iguane, jaguar, kangourou, koala, lapin, léopard, lézard, lion, loup, lynx, mouton, marmotte, mulet, mouflon, narval, ours, orang-outan, otarie, panda, panthère, phoque, pieuvre, poney, porc-épic, rat, renard, renne, requin, rhinocéros, sanglier, serpent, singe, souris, taupe, tigre, tortue, taureau, vache, vipère, wallaby, yack, zèbre, zébu`],
    ['country', 'Country', 'Pays', 1,
      `Afghanistan, Albania, Algeria, Argentina, Australia, Austria, Bahamas, Belgium, Bolivia, Brazil, Bulgaria, Cambodia, Canada, Chile, China, Colombia, Croatia, Cuba, Cyprus, Denmark, Ecuador, Egypt, England, Estonia, Ethiopia, Fiji, Finland, France, Georgia, Germany, Ghana, Greece, Guatemala, Haiti, Honduras, Hungary, Iceland, India, Indonesia, Iran, Iraq, Ireland, Israel, Italy, Jamaica, Japan, Jordan, Kazakhstan, Kenya, Korea, Kuwait, Laos, Latvia, Lebanon, Libya, Lithuania, Luxembourg, Madagascar, Malaysia, Mali, Malta, Mexico, Monaco, Mongolia, Morocco, Nepal, Netherlands, New Zealand, Nigeria, Norway, Oman, Pakistan, Panama, Peru, Philippines, Poland, Portugal, Qatar, Romania, Russia, Rwanda, Saudi Arabia, Scotland, Senegal, Serbia, Singapore, Slovakia, Slovenia, Somalia, Spain, Sri Lanka, Sweden, Switzerland, Syria, Taiwan, Thailand, Tunisia, Turkey, Uganda, Ukraine, Uruguay, USA, Venezuela, Vietnam, Wales, Yemen, Zambia, Zimbabwe`,
      `Afghanistan, Afrique du Sud, Albanie, Algérie, Allemagne, Angleterre, Arabie saoudite, Argentine, Arménie, Australie, Autriche, Belgique, Bolivie, Brésil, Bulgarie, Cambodge, Cameroun, Canada, Chili, Chine, Colombie, Congo, Corée, Croatie, Cuba, Danemark, Égypte, Équateur, Espagne, Estonie, Éthiopie, États-Unis, Finlande, France, Gabon, Géorgie, Ghana, Grèce, Guatemala, Guinée, Haïti, Hongrie, Inde, Indonésie, Irak, Iran, Irlande, Islande, Israël, Italie, Jamaïque, Japon, Jordanie, Kenya, Koweït, Laos, Lettonie, Liban, Libye, Lituanie, Luxembourg, Madagascar, Malaisie, Mali, Malte, Maroc, Mexique, Monaco, Mongolie, Népal, Niger, Nigeria, Norvège, Nouvelle-Zélande, Ouganda, Pakistan, Panama, Pays-Bas, Pérou, Philippines, Pologne, Portugal, Qatar, Roumanie, Russie, Rwanda, Sénégal, Serbie, Singapour, Slovaquie, Slovénie, Somalie, Suède, Suisse, Syrie, Tchad, Thaïlande, Tunisie, Turquie, Ukraine, Uruguay, Vénézuela, Vietnam, Yémen, Zambie, Zimbabwe`],
    ['city', 'City', 'Ville', 1,
      `Amsterdam, Athens, Atlanta, Auckland, Baghdad, Bangkok, Barcelona, Beijing, Berlin, Boston, Brussels, Budapest, Cairo, Calgary, Cape Town, Chicago, Copenhagen, Dallas, Delhi, Denver, Detroit, Dubai, Dublin, Edinburgh, Frankfurt, Geneva, Glasgow, Hamburg, Hanoi, Helsinki, Hong Kong, Houston, Istanbul, Jakarta, Jerusalem, Johannesburg, Karachi, Kyoto, Lagos, Lima, Lisbon, Liverpool, London, Los Angeles, Madrid, Manchester, Manila, Melbourne, Miami, Milan, Montreal, Moscow, Mumbai, Munich, Nairobi, Naples, New York, Oslo, Ottawa, Oxford, Paris, Perth, Philadelphia, Prague, Quebec, Rio de Janeiro, Rome, San Francisco, Santiago, Seattle, Seoul, Shanghai, Singapore, Stockholm, Sydney, Taipei, Tehran, Tokyo, Toronto, Utrecht, Vancouver, Venice, Vienna, Warsaw, Washington, Wellington, York, Zurich`,
      `Aix-en-Provence, Ajaccio, Amiens, Angers, Annecy, Avignon, Bayonne, Besançon, Biarritz, Bordeaux, Brest, Caen, Calais, Cannes, Carcassonne, Chambéry, Clermont-Ferrand, Colmar, Dijon, Dunkerque, Épinal, Évian, Grenoble, Hendaye, Honfleur, Issoudun, Joigny, Juan-les-Pins, La Rochelle, Le Havre, Le Mans, Lille, Limoges, Lorient, Lourdes, Lyon, Marseille, Metz, Montpellier, Mulhouse, Nancy, Nantes, Nice, Nîmes, Orléans, Paris, Pau, Perpignan, Poitiers, Quimper, Reims, Rennes, Rouen, Saint-Étienne, Saint-Malo, Strasbourg, Tarbes, Toulon, Toulouse, Tours, Troyes, Valence, Vannes, Versailles, Vichy, Villeurbanne, Albi, Auxerre, Beaune, Cherbourg, Dax, Évreux, Fréjus, Gap, Hyères, Laval, Menton, Narbonne, Oyonnax, Périgueux, Rodez, Sète, Thonon, Ussel, Vesoul`],
    ['fruit', 'Fruit', 'Fruit', 1,
      `apple, apricot, avocado, banana, blackberry, blueberry, cantaloupe, cherry, clementine, coconut, cranberry, currant, date, dragonfruit, elderberry, fig, grape, grapefruit, guava, honeydew, jackfruit, kiwi, kumquat, lemon, lime, lychee, mandarin, mango, melon, mulberry, nectarine, olive, orange, papaya, passion fruit, peach, pear, persimmon, pineapple, plum, pomegranate, quince, raspberry, redcurrant, satsuma, strawberry, tangerine, ugli fruit, watermelon`,
      `abricot, ananas, avocat, banane, bergamote, cassis, cerise, citron, citron vert, clémentine, coing, datte, figue, fraise, framboise, fruit de la passion, grenade, groseille, goyave, kaki, kiwi, litchi, mandarine, mangue, melon, mirabelle, mûre, myrtille, nectarine, noix de coco, orange, pamplemousse, papaye, pastèque, pêche, poire, pomme, prune, pruneau, raisin, rhubarbe, reine-claude, ugli`],
    ['veg', 'Vegetable', 'Légume', 1,
      `artichoke, asparagus, aubergine, beetroot, bean, broccoli, brussels sprout, cabbage, carrot, cauliflower, celery, chard, chickpea, chilli, corn, courgette, cucumber, daikon, eggplant, endive, fennel, garlic, ginger, horseradish, kale, kohlrabi, leek, lettuce, mushroom, okra, onion, parsnip, pea, pepper, potato, pumpkin, radish, rocket, spinach, squash, sweet potato, tomato, turnip, watercress, yam, zucchini`,
      `ail, artichaut, asperge, aubergine, betterave, blette, brocoli, carotte, céleri, champignon, chou, chou-fleur, chou de Bruxelles, citrouille, concombre, courge, courgette, cresson, endive, épinard, fenouil, fève, haricot vert, laitue, lentille, maïs, navet, oignon, panais, patate douce, petit pois, poireau, poivron, pomme de terre, potiron, radis, roquette, salade, topinambour, tomate`],
    ['food', 'Dish or food', 'Plat ou aliment', 1,
      `apple pie, bacon, bagel, burger, burrito, cake, casserole, cheese, chili, chicken, croissant, curry, doughnut, dumpling, eggs, enchilada, falafel, fajita, fish and chips, fries, goulash, granola, ham, hot dog, hummus, ice cream, jambalaya, jelly, kebab, ketchup, lasagna, lobster, macaroni, meatballs, muffin, noodles, nachos, omelette, pancakes, pasta, pizza, popcorn, pretzel, quiche, ramen, risotto, salad, sandwich, sausage, soup, spaghetti, steak, sushi, taco, toast, tuna, udon, waffles, wrap, yogurt, ziti`,
      `aligot, blanquette, boeuf bourguignon, bouillabaisse, burger, cassoulet, choucroute, coq au vin, couscous, crêpes, croque-monsieur, crudités, daube, escargots, fondue, frites, galette, gratin, hachis parmentier, jambon, kebab, lasagnes, moules frites, nems, omelette, pâtes, paella, pizza, pot-au-feu, poulet rôti, quiche, raclette, ratatouille, risotto, salade, sandwich, saucisson, soupe, steak frites, tartiflette, tajine, tarte, tortilla, velouté, vol-au-vent, yaourt, raviolis, gaufre`],
    ['drink', 'Drink', 'Boisson', 1,
      `ale, apple juice, beer, brandy, cappuccino, champagne, cider, cocktail, coffee, cola, cocoa, daiquiri, espresso, eggnog, fanta, ginger ale, gin, hot chocolate, iced tea, juice, kombucha, lager, latte, lemonade, margarita, martini, milk, milkshake, mojito, mocha, orange juice, port, punch, root beer, rum, sake, smoothie, soda, sprite, tea, tequila, vodka, water, whisky, wine, yerba mate`,
      `absinthe, armagnac, bière, bordeaux, café, calvados, cappuccino, champagne, chocolat chaud, cidre, cognac, cola, cocktail, coca, daiquiri, eau, espresso, expresso, fanta, gin, grenadine, infusion, jus d orange, jus de pomme, kir, kéfir, lait, limonade, martini, mojito, muscadet, orangina, pastis, perrier, porto, punch, rhum, ricard, rosé, sirop, smoothie, soda, thé, tisane, vin, vodka, whisky`],
    ['job', 'Job', 'Métier', 1,
      `accountant, actor, architect, artist, baker, banker, barber, builder, butcher, carpenter, chef, cleaner, cook, dancer, dentist, designer, doctor, driver, electrician, engineer, farmer, firefighter, fisherman, gardener, guard, hairdresser, illustrator, janitor, journalist, judge, lawyer, librarian, mechanic, miner, musician, nurse, optician, painter, pilot, plumber, police officer, professor, programmer, pharmacist, receptionist, sailor, scientist, secretary, singer, soldier, surgeon, tailor, teacher, translator, vet, waiter, welder, writer, zookeeper`,
      `acteur, agriculteur, architecte, artisan, avocat, boulanger, boucher, bibliothécaire, caissier, charpentier, chauffeur, chef, coiffeur, comptable, cuisinier, danseur, dentiste, docteur, électricien, éboueur, facteur, fleuriste, forgeron, gendarme, guide, infirmier, ingénieur, informaticien, instituteur, jardinier, journaliste, juge, kinésithérapeute, libraire, maçon, médecin, mécanicien, menuisier, musicien, notaire, ouvrier, pâtissier, pharmacien, pilote, plombier, policier, pompier, professeur, programmeur, ramoneur, secrétaire, serveur, soldat, traducteur, vendeur, vétérinaire, vigneron, zoologiste`],
    ['sport', 'Sport', 'Sport', 1,
      `archery, athletics, badminton, baseball, basketball, bowling, boxing, canoeing, climbing, cricket, curling, cycling, darts, diving, equestrian, fencing, football, golf, gymnastics, handball, hockey, hurling, ice hockey, judo, karate, kayaking, lacrosse, luge, marathon, netball, orienteering, polo, ping pong, rowing, rugby, running, sailing, skateboarding, skiing, snooker, soccer, softball, squash, surfing, swimming, table tennis, taekwondo, tennis, triathlon, volleyball, weightlifting, windsurfing, wrestling, yoga`,
      `aïkido, athlétisme, aviron, badminton, baseball, basket, biathlon, billard, boxe, canoë, curling, cyclisme, danse, équitation, escalade, escrime, football, golf, gymnastique, handball, hockey, haltérophilie, judo, karaté, kayak, lutte, luge, marathon, natation, patinage, pétanque, plongée, polo, parachutisme, rugby, ski, surf, squash, tennis, tir à l arc, triathlon, taekwondo, trampoline, voile, volley, water-polo, yoga, vélo`],
    ['color', 'Colour', 'Couleur', 1,
      `amber, azure, beige, black, blue, bronze, brown, burgundy, cerise, charcoal, crimson, cyan, emerald, fuchsia, gold, gray, green, grey, hazel, indigo, ivory, jade, khaki, lavender, lemon, lilac, lime, magenta, maroon, mauve, navy, olive, orange, orchid, peach, pink, plum, purple, red, rose, ruby, salmon, scarlet, silver, tan, teal, turquoise, ultramarine, vermilion, violet, white, wine, yellow`,
      `abricot, ambre, anthracite, argent, azur, beige, blanc, bleu, bordeaux, bronze, brun, carmin, cerise, chocolat, corail, crème, cyan, doré, écarlate, émeraude, fuchsia, gris, grenat, indigo, ivoire, jaune, kaki, lavande, lilas, magenta, marron, mauve, noir, ocre, olive, orange, orchidée, pourpre, rose, rouge, rubis, saumon, sable, turquoise, vert, vermillon, violet, vanille`],
    ['clothing', 'Clothing', 'Vêtement', 1,
      `anorak, apron, belt, bikini, blazer, blouse, boots, bra, cap, cape, cardigan, coat, corset, dress, dungarees, earmuffs, fleece, gloves, gown, hat, hoodie, jacket, jeans, jumper, kilt, kimono, leggings, mittens, nightgown, overalls, pants, poncho, pyjamas, raincoat, robe, sandals, scarf, shirt, shoes, shorts, skirt, slippers, socks, suit, sweater, swimsuit, tie, tights, trousers, t-shirt, uniform, vest, waistcoat, wellies`,
      `anorak, baskets, béret, blouse, blouson, bonnet, botte, bottines, bretelles, bikini, casquette, chapeau, chaussettes, chaussures, chemise, collants, costume, cravate, culotte, débardeur, écharpe, gants, gilet, imperméable, jean, jupe, kimono, legging, maillot, manteau, mitaines, pantalon, parka, pull, pyjama, robe, sandales, short, slip, soutien-gorge, sweat, tailleur, tee-shirt, trench, tunique, uniforme, veste, veston, vareuse`],
    ['body', 'Body part', 'Partie du corps', 1,
      `ankle, arm, back, belly, brain, calf, cheek, chest, chin, ear, elbow, eye, eyebrow, finger, foot, forehead, groin, gum, hair, hand, head, heart, heel, hip, intestine, jaw, kidney, knee, leg, lip, liver, lung, mouth, muscle, nail, neck, nose, palm, pelvis, rib, shin, shoulder, skin, skull, spine, stomach, thigh, thumb, toe, tongue, tooth, vein, waist, wrist`,
      `abdomen, avant-bras, bouche, bras, cerveau, cheville, cheveux, cil, cœur, côte, cou, coude, cuisse, dent, dos, doigt, épaule, estomac, foie, front, genou, gorge, hanche, intestin, jambe, joue, langue, lèvre, main, menton, mollet, muscle, nez, nuque, œil, ongle, oreille, orteil, os, paupière, peau, pied, poignet, poumon, rein, sourcil, talon, tête, tibia, ventre, visage, veine`],
    ['instr', 'Musical instrument', 'Instrument de musique', 1,
      `accordion, banjo, bagpipes, bass, bassoon, bongo, bugle, cello, clarinet, cymbals, drums, double bass, flute, french horn, guitar, glockenspiel, harmonica, harp, harpsichord, horn, kazoo, keyboard, lute, mandolin, maracas, oboe, organ, piano, piccolo, recorder, saxophone, sitar, synthesizer, tambourine, timpani, trombone, trumpet, tuba, ukulele, viola, violin, washboard, whistle, xylophone, zither`,
      `accordéon, alto, banjo, basse, basson, batterie, bugle, caisse claire, castagnettes, célesta, clarinette, clavecin, contrebasse, cor, cornemuse, cymbales, djembé, flûte, guitare, glockenspiel, harmonica, harpe, hautbois, kazoo, lyre, mandoline, maracas, orgue, piano, piccolo, saxophone, sitar, synthétiseur, tambour, tambourin, timbales, triangle, trombone, trompette, tuba, ukulélé, violon, violoncelle, xylophone, zurna`],
    ['vehicle', 'Vehicle', 'Véhicule', 1,
      `ambulance, aeroplane, bicycle, bike, boat, bus, cab, canoe, car, caravan, chopper, cruiser, digger, ferry, forklift, golf cart, go-kart, helicopter, hovercraft, jeep, jet, kayak, kart, lorry, limousine, moped, motorbike, minibus, ocean liner, pickup, quad bike, rocket, rickshaw, scooter, ship, sled, skateboard, submarine, taxi, tank, tractor, train, tram, truck, tugboat, unicycle, van, vespa, wagon, yacht, zeppelin`,
      `ambulance, autobus, autocar, avion, bateau, bicyclette, bus, bulldozer, camion, camionnette, canoë, caravane, char, cargo, deux-roues, ferry, fourgon, grue, hélicoptère, jet, kayak, limousine, moto, mobylette, métro, navire, paquebot, pédalo, quad, remorque, roller, sous-marin, scooter, taxi, tracteur, train, tramway, trottinette, tank, van, vélo, voilier, voiture, vélomoteur, yacht, zodiac`],
    ['tool', 'Tool', 'Outil', 0,
      `awl, axe, adze, brush, chisel, clamp, crowbar, drill, file, hacksaw, hammer, hoe, jackhammer, jigsaw, ladder, lathe, level, mallet, nail gun, pliers, plane, pick, rake, ruler, sander, saw, scissors, screwdriver, shovel, sledgehammer, spade, spanner, tape measure, trowel, vice, wrench, welder, wire cutters`,
      `balai, burin, ciseaux, clé, clé à molette, crochet, équerre, étau, faucille, foret, hache, lime, maillet, marteau, mètre, niveau, perceuse, pelle, pince, pinceau, pioche, rabot, râteau, ruban, scie, serre-joint, tournevis, truelle, tenaille, vilebrequin`],
    ['furniture', 'Piece of furniture', 'Meuble', 0,
      `armchair, bed, bench, bookcase, buffet, cabinet, chair, chest, couch, cradle, crib, cupboard, desk, divan, dresser, easy chair, futon, footstool, hammock, hutch, ottoman, pouf, rocking chair, shelf, sideboard, sofa, stool, table, trunk, tv stand, umbrella stand, vanity, wardrobe`,
      `armoire, banc, banquette, bibliothèque, bureau, buffet, canapé, chaise, chevet, coffre, commode, console, étagère, fauteuil, hamac, lit, lit superposé, meuble tv, miroir, pouf, placard, penderie, table, table basse, tabouret, tiroir, vaisselier, vitrine, secrétaire, siège, sommier, transat, coiffeuse`],
    ['flower', 'Flower or plant', 'Fleur ou plante', 0,
      `aster, azalea, begonia, bluebell, buttercup, camellia, carnation, chrysanthemum, crocus, daffodil, dahlia, daisy, edelweiss, fern, forget-me-not, foxglove, freesia, geranium, hibiscus, hyacinth, hydrangea, iris, ivy, jasmine, lavender, lily, lotus, magnolia, marigold, mimosa, narcissus, orchid, pansy, peony, petunia, poppy, primrose, rose, snapdragon, sunflower, tulip, violet, water lily, wisteria, zinnia`,
      `anémone, azalée, bégonia, bleuet, bruyère, camélia, capucine, chrysanthème, clématite, coquelicot, crocus, dahlia, edelweiss, fougère, freesia, géranium, glaïeul, hibiscus, hortensia, iris, jacinthe, jasmin, jonquille, lavande, lilas, lis, lotus, magnolia, marguerite, mimosa, muguet, narcisse, nénuphar, œillet, orchidée, pâquerette, pensée, pervenche, pivoine, primevère, rose, souci, tournesol, tulipe, violette, zinnia`],
    ['river', 'River', 'Fleuve ou rivière', 0,
      `Amazon, Amur, Avon, Brahmaputra, Colorado, Congo, Danube, Delaware, Don, Elbe, Euphrates, Ganges, Hudson, Indus, Irrawaddy, Jordan, Lena, Limpopo, Loire, Mekong, Mississippi, Missouri, Murray, Nile, Niger, Ob, Ohio, Orinoco, Po, Potomac, Rhine, Rhone, Rio Grande, Seine, Severn, Tagus, Tay, Thames, Tigris, Tiber, Ural, Volga, Vistula, Yangtze, Yukon, Zambezi`,
      `Allier, Adour, Aisne, Amazone, Ardèche, Aude, Charente, Cher, Dordogne, Danube, Doubs, Durance, Elbe, Escaut, Euphrate, Garonne, Gange, Hudson, Indus, Isère, Jourdain, Loire, Lot, Marne, Meuse, Moselle, Mékong, Niger, Nil, Oise, Orne, Oural, Rhin, Rhône, Rio Grande, Saône, Seine, Somme, Tamise, Tarn, Tibre, Tigre, Var, Vienne, Volga, Vistule, Yonne, Zambèze, Yang-Tsé`],
    ['brand', 'Brand', 'Marque', 0,
      `Adidas, Amazon, Apple, Audi, BMW, Burger King, Cadbury, Canon, Coca-Cola, Colgate, Dell, Disney, Dior, eBay, Ferrari, Fanta, Ford, Gap, Google, Gucci, H&M, Honda, Hyundai, IBM, Ikea, Intel, Jaguar, Kellogg, KFC, Kodak, Lego, Levi, Lipton, McDonald, Mercedes, Microsoft, Nescafe, Netflix, Nike, Nintendo, Nokia, Oreo, Pepsi, Philips, Puma, Pringles, Rolex, Samsung, Sony, Starbucks, Subway, Tesla, Toyota, Uber, Visa, Volvo, Walmart, Yamaha, Zara`,
      `Adidas, Airbus, Amazon, Apple, Audi, Auchan, Bic, BMW, Bonduelle, Boursin, Carrefour, Chanel, Citroën, Coca-Cola, Danone, Decathlon, Dior, Evian, Fnac, Ferrari, Gucci, Haribo, Hermès, Ikea, Kinder, Lacoste, Lego, Leclerc, Lidl, L Oréal, Michelin, Nike, Nestlé, Nutella, Orange, Peugeot, Perrier, Pepsi, Puma, Quechua, Renault, Rolex, Samsung, Sony, Tesla, Toyota, Uber, Vuitton, Volvo, Yves Rocher, Zara`],
    ['movie', 'Movie', 'Film', 0,
      `Alien, Avatar, Batman, Casablanca, Cars, Coco, Dune, Frozen, Gladiator, Godfather, Grease, Home Alone, Inception, Jaws, Joker, Jumanji, King Kong, Lion King, Matrix, Moana, Memento, Nemo, Oppenheimer, Psycho, Pulp Fiction, Rocky, Shrek, Spider-Man, Star Wars, Superman, Taxi Driver, Titanic, Toy Story, Up, Vertigo, Wall-E, Zootopia`,
      `Amélie, Astérix, Bienvenue chez les Ch tis, Camping, Cyrano, Delicatessen, Dune, Entre les murs, Fantômas, Gladiator, Intouchables, Jean de Florette, Joker, Kirikou, La Haine, Le Dîner de cons, Les Visiteurs, Léon, Microcosmos, Nikita, OSS 117, Paris, Rien à déclarer, Titanic, Taxi, Un prophète, Vaiana, Zazie dans le métro`],
    ['singer', 'Singer or band', 'Chanteur ou groupe', 0,
      `ABBA, AC/DC, Adele, Beyoncé, Beatles, Bob Marley, Bowie, Britney Spears, Bruno Mars, Coldplay, Dua Lipa, Drake, Eminem, Ed Sheeran, Elton John, Elvis, Foo Fighters, Frank Sinatra, Gaga, Genesis, Harry Styles, Hendrix, Imagine Dragons, Jay-Z, Justin Bieber, Kanye West, Katy Perry, Led Zeppelin, Madonna, Metallica, Michael Jackson, Nirvana, Oasis, Pink Floyd, Prince, Queen, Rihanna, Rolling Stones, Shakira, Taylor Swift, U2, Usher, Weeknd, Whitney Houston, Yes, ZZ Top`,
      `Aya Nakamura, Angèle, Bénabar, Brassens, Brel, Calogero, Céline Dion, Charles Aznavour, Claude François, Daft Punk, Dalida, Édith Piaf, Étienne Daho, Francis Cabrel, France Gall, Gims, Georges Moustaki, Hoshi, Indochine, Jacques Brel, Jul, Johnny Hallyday, Julien Clerc, Kendji Girac, Louane, Léo Ferré, Mylène Farmer, Nekfeu, Orelsan, Patrick Bruel, Phoenix, Renaud, Serge Gainsbourg, Stromae, Sardou, Téléphone, Vianney, Yves Montand, Zaz, Zazie`],
    ['cartoon', 'Cartoon character', 'Personnage de dessin animé', 0,
      `Aladdin, Bart Simpson, Bambi, Bugs Bunny, Casper, Daffy Duck, Donald Duck, Dumbo, Elsa, Fred Flintstone, Garfield, Goofy, Homer, Hello Kitty, Jerry, Kung Fu Panda, Mickey Mouse, Minnie, Mulan, Nemo, Olaf, Pikachu, Pinocchio, Popeye, Porky Pig, Quasimodo, Road Runner, Scooby-Doo, Shrek, Snoopy, SpongeBob, Tom, Tweety, Ursula, Velma, Winnie the Pooh, Woody, Yogi Bear, Zorro`,
      `Astérix, Alice, Babar, Bambi, Blanche-Neige, Bob l éponge, Cendrillon, Capitaine Flam, Dumbo, Donald, Dingo, Elsa, Garfield, Gaston, Heidi, Idéfix, Jerry, Kirikou, Lucky Luke, Mickey, Minnie, Mowgli, Obélix, Olaf, Pinocchio, Pluto, Popeye, Rahan, Simba, Schtroumpf, Tintin, Titeuf, Tom, Titi, Tournesol, Ulysse 31, Vaiana, Winnie, Woody, Zorro`],
    ['dessert', 'Dessert', 'Dessert', 0,
      `apple pie, baklava, banana split, brownie, cake, cheesecake, cobbler, crumble, cupcake, custard, doughnut, eclair, flan, fudge, gelato, gingerbread, ice cream, jelly, jam tart, key lime pie, lemon tart, macaron, meringue, mousse, muffin, nougat, panna cotta, pavlova, pie, pudding, rice pudding, sorbet, sundae, tart, tiramisu, trifle, waffle, yogurt`,
      `baba au rhum, beignet, brioche, brownie, cannelé, charlotte, chausson, clafoutis, crème brûlée, crème caramel, crêpe, croquembouche, éclair, far breton, flan, fondant, gâteau, gaufre, glace, île flottante, kouign-amann, macaron, madeleine, meringue, mille-feuille, mousse au chocolat, nougat, opéra, paris-brest, profiterole, panna cotta, riz au lait, saint-honoré, sorbet, tarte, tiramisu, tarte tatin, vacherin, yaourt`],
    ['cheese', 'Cheese', 'Fromage', 0,
      `American, Brie, Blue, Cheddar, Camembert, Cottage, Cream cheese, Edam, Emmental, Feta, Fontina, Gouda, Gorgonzola, Gruyère, Halloumi, Havarti, Jarlsberg, Limburger, Manchego, Mascarpone, Monterey Jack, Mozzarella, Muenster, Parmesan, Pecorino, Provolone, Quark, Ricotta, Roquefort, Stilton, Swiss, Wensleydale`,
      `Abondance, Beaufort, Boursin, Brie, Brillat-Savarin, Cantal, Camembert, Chaource, Chèvre, Comté, Coulommiers, Emmental, Epoisses, Feta, Fourme d Ambert, Gruyère, Gorgonzola, Laguiole, Livarot, Maroilles, Mimolette, Morbier, Munster, Neufchâtel, Ossau-Iraty, Pont-l Évêque, Parmesan, Raclette, Reblochon, Roquefort, Saint-Nectaire, Saint-Marcellin, Tomme, Vacherin, Valençay`],
    ['bird', 'Bird', 'Oiseau', 0,
      `albatross, blackbird, budgie, buzzard, canary, cardinal, chicken, cockatoo, crane, crow, cuckoo, dove, duck, eagle, emu, falcon, finch, flamingo, goose, gull, hawk, heron, hummingbird, ibis, jay, kestrel, kingfisher, kiwi, lark, magpie, nightingale, ostrich, owl, parrot, peacock, pelican, penguin, pigeon, quail, raven, robin, sparrow, stork, swallow, swan, toucan, turkey, vulture, woodpecker, wren`,
      `aigle, alouette, autruche, bécasse, bergeronnette, buse, canard, canari, cigogne, colibri, corbeau, coucou, cygne, dindon, étourneau, faisan, faucon, flamant rose, fauvette, geai, goéland, grue, hibou, hirondelle, héron, ibis, mésange, merle, moineau, mouette, oie, perroquet, pie, pigeon, pingouin, perdrix, pic vert, pinson, rossignol, rouge-gorge, tourterelle, toucan, vautour, vanneau, perruche`],
    ['insect', 'Insect or bug', 'Insecte', 0,
      `ant, aphid, bee, beetle, butterfly, caterpillar, cicada, cockroach, cricket, dragonfly, earwig, flea, fly, firefly, grasshopper, hornet, housefly, ladybird, locust, louse, mantis, mayfly, midge, mosquito, moth, praying mantis, silverfish, termite, tick, wasp, weevil`,
      `abeille, bourdon, cafard, chenille, cigale, coccinelle, criquet, cloporte, doryphore, éphémère, frelon, fourmi, grillon, guêpe, hanneton, libellule, luciole, mante religieuse, mite, moucheron, mouche, moustique, papillon, perce-oreille, pou, puce, puceron, sauterelle, scarabée, taon, termite, tique`],
    ['school', 'School subject', 'Matière scolaire', 0,
      `algebra, art, biology, chemistry, computing, drama, economics, English, French, geography, geometry, German, history, Latin, literature, maths, music, PE, philosophy, physics, politics, religion, science, Spanish, technology, woodwork`,
      `algèbre, anglais, art plastique, allemand, biologie, chimie, dessin, éducation physique, espagnol, économie, français, géographie, géométrie, grec, histoire, informatique, latin, littérature, maths, musique, philosophie, physique, SVT, sciences, sport, technologie, théâtre`],
    ['kitchen', 'Kitchen item', 'Objet de cuisine', 0,
      `apron, blender, bowl, bread bin, colander, cooker, corkscrew, cup, dishwasher, fork, freezer, fridge, frying pan, grater, kettle, knife, ladle, microwave, mixer, mug, oven, peeler, plate, pot, rolling pin, sink, spatula, spoon, stove, strainer, teapot, toaster, tongs, tray, whisk`,
      `assiette, bol, bouilloire, casserole, cafetière, chinois, cocotte, couteau, couvercle, cuillère, cuisinière, écumoire, éplucheur, évier, four, fourchette, frigo, grille-pain, hachoir, jatte, louche, marmite, mixeur, moulin, mug, nappe, passoire, poêle, planche à découper, plateau, râpe, réfrigérateur, spatule, tasse, théière, tire-bouchon, verre, wok, rouleau à pâtisserie`],
    ['toy', 'Toy or game', 'Jouet ou jeu', 0,
      `ball, barbie, blocks, board game, bouncy castle, cards, checkers, chess, crayons, dolls, dominoes, doll house, frisbee, hopscotch, jigsaw, jack-in-the-box, kite, lego, marbles, monopoly, nerf gun, puppet, puzzle, rocking horse, rattle, skipping rope, scooter, slinky, teddy bear, tag, top, trampoline, uno, yo-yo, xylophone`,
      `balle, ballon, barbie, billes, cerf-volant, cartes, cache-cache, corde à sauter, cubes, dames, dés, échecs, flipper, hochet, jeu de l oie, jenga, légo, loup, marelle, marionnette, monopoly, nounours, osselets, peluche, poupée, puzzle, quilles, toupie, train électrique, trottinette, tricycle, trampoline, yoyo, uno`],
    ['mountain', 'Mountain or range', 'Montagne', 0,
      `Aconcagua, Alps, Andes, Annapurna, Appalachians, Ben Nevis, Carpathians, Denali, Dolomites, Eiger, Elbrus, Everest, Fuji, Himalayas, Jungfrau, K2, Kilimanjaro, Kosciuszko, Lhotse, Matterhorn, McKinley, Olympus, Pyrenees, Rainier, Rockies, Snowdon, Table Mountain, Urals, Vesuvius, Whitney`,
      `Alpes, Annapurna, Aconcagua, Ballon d Alsace, Barre des Écrins, Cervin, Dent du Midi, Eiger, Etna, Everest, Fuji, Himalaya, Jungfrau, K2, Kilimandjaro, Lhotse, Mont Blanc, Mont Ventoux, Massif central, Olympe, Puy de Dôme, Pyrénées, Rhune, Sainte-Victoire, Table, Vercors, Vésuve, Vosges, Jura`],
    ['language', 'Language', 'Langue', 0,
      `Arabic, Bengali, Chinese, Czech, Danish, Dutch, English, Esperanto, Farsi, Finnish, French, German, Greek, Hebrew, Hindi, Hungarian, Italian, Japanese, Korean, Latin, Malay, Norwegian, Polish, Portuguese, Punjabi, Romanian, Russian, Spanish, Swahili, Swedish, Thai, Turkish, Ukrainian, Urdu, Vietnamese, Welsh, Yiddish, Zulu`,
      `Allemand, Anglais, Arabe, Basque, Breton, Bulgare, Catalan, Chinois, Coréen, Corse, Danois, Espagnol, Esperanto, Finnois, Français, Grec, Hébreu, Hindi, Hongrois, Italien, Japonais, Latin, Néerlandais, Norvégien, Occitan, Persan, Polonais, Portugais, Roumain, Russe, Suédois, Swahili, Tchèque, Thaï, Turc, Ukrainien, Vietnamien, Zoulou`],
    ['tree', 'Tree', 'Arbre', 0,
      `acacia, alder, apple, ash, aspen, bamboo, banyan, beech, birch, cedar, cherry, chestnut, cypress, elm, eucalyptus, fir, ginkgo, hazel, hawthorn, holly, juniper, larch, laurel, linden, maple, mahogany, oak, olive, palm, pine, plane, poplar, redwood, rowan, spruce, sycamore, teak, walnut, willow, yew`,
      `acacia, aulne, bambou, baobab, bouleau, cèdre, cerisier, châtaignier, chêne, cyprès, érable, eucalyptus, frêne, genévrier, hêtre, houx, if, laurier, mélèze, marronnier, noyer, olivier, orme, palmier, peuplier, pin, platane, pommier, sapin, saule, séquoia, sycomore, tilleul, tek, thuya`],
    ['feeling', 'Feeling', 'Sentiment', 0,
      `anger, anxiety, bliss, boredom, calm, courage, doubt, envy, fear, fun, guilt, grief, hope, happiness, humour, joy, jealousy, love, loneliness, nostalgia, panic, pride, regret, relief, sadness, shame, surprise, trust, worry`,
      `amour, angoisse, bonheur, colère, calme, chagrin, courage, doute, envie, espoir, fierté, gêne, honte, humour, joie, jalousie, lassitude, peur, panique, plaisir, rage, regret, soulagement, surprise, tristesse, tendresse, nostalgie`],
    ['hobby', 'Hobby', 'Loisir', 0,
      `baking, birdwatching, camping, chess, collecting, cooking, cycling, dancing, drawing, fishing, gaming, gardening, hiking, juggling, knitting, painting, photography, pottery, reading, sewing, singing, skating, travelling, woodworking, yoga`,
      `bricolage, broderie, cuisine, couture, danse, dessin, échecs, escalade, jardinage, jeux vidéo, jonglage, lecture, musique, natation, peinture, pêche, photographie, poterie, randonnée, tricot, théâtre, voyage, vélo, yoga`],
    ['celeb', 'Famous person', 'Personnalité célèbre', 0,
      `Albert Einstein, Beyoncé, Churchill, Da Vinci, Elvis, Frida Kahlo, Gandhi, Hawking, Isaac Newton, Jackie Chan, Kennedy, Lincoln, Mozart, Napoleon, Obama, Picasso, Queen Elizabeth, Ronaldo, Shakespeare, Tesla, Van Gogh, Washington, Zidane`,
      `Armstrong, Balzac, Cléopâtre, Debussy, Einstein, Flaubert, Gandhi, Hugo, Jeanne d Arc, Kennedy, Louis XIV, Molière, Napoléon, Pasteur, Picasso, Rodin, Sartre, Tesla, Voltaire, Zidane, Zola, Mozart, Curie`],
    ['verb', 'Verb', 'Verbe', 0,
      `act, ask, bake, build, call, carry, catch, climb, cook, cut, dance, draw, drink, eat, fall, find, fly, give, grow, help, hide, jump, kick, laugh, learn, listen, make, move, open, paint, play, read, run, sing, sleep, swim, talk, think, throw, understand, walk, watch, write`,
      `acheter, aimer, appeler, boire, chanter, chercher, courir, croire, danser, dessiner, dormir, écouter, écrire, finir, grandir, habiter, jouer, jeter, laver, lire, manger, marcher, nager, ouvrir, parler, penser, prendre, regarder, rire, sauter, tomber, trouver, utiliser, voir, voler`],
    ['adj', 'Adjective', 'Adjectif', 0,
      `angry, bad, big, brave, bright, calm, cold, cute, dark, dirty, easy, fast, funny, good, happy, heavy, hot, huge, kind, lazy, loud, new, old, polite, quick, quiet, sad, small, tall, ugly, warm, wild, young`,
      `agréable, beau, bruyant, calme, chaud, content, doux, drôle, dur, énorme, facile, froid, gentil, grand, gros, heureux, jeune, joli, lent, lourd, méchant, nouveau, petit, poli, rapide, sale, triste, vieux, vif`]
  ];

  PB_RAW.push(
    ['scary', 'Something scary', 'Quelque chose d\'effrayant', 0,
      `ghost, graveyard, haunted house, spider, snake, shark, skeleton, storm, vampire, werewolf, witch, zombie, clown, darkness, nightmare, monster, thunder, dentist, mummy, dragon, bat, cobra, creepy doll, trapdoor`,
      `fantôme, cimetière, maison hantée, araignée, serpent, requin, squelette, orage, vampire, loup-garou, sorcière, zombie, clown, noir, cauchemar, monstre, tonnerre, dentiste, momie, dragon, chauve-souris, cobra, poupée hantée`],
    ['beach', 'Something at the beach', 'Quelque chose à la plage', 0,
      `sand, sea, shell, sunscreen, towel, umbrella, wave, bucket, surfboard, seagull, crab, flip flops, sunglasses, swimsuit, starfish, lifeguard, sandcastle, pebble, ice cream, jellyfish, boat, dune, kite, tide`,
      `sable, mer, coquillage, crème solaire, serviette, parasol, vague, seau, planche de surf, mouette, crabe, tongs, lunettes de soleil, maillot de bain, étoile de mer, maître nageur, château de sable, galet, glace, méduse, bateau, dune, cerf-volant, marée`],
    ['gift', 'Gift', 'Cadeau', 0,
      `book, bike, ball, board game, camera, candle, chocolate, doll, flowers, game console, guitar, jewelry, jigsaw, keyboard, lego, necklace, perfume, phone, puzzle, ring, scarf, teddy bear, watch, wallet, headphones, sweater, toy car, vase, umbrella`,
      `livre, vélo, ballon, jeu de société, appareil photo, bougie, chocolat, poupée, fleurs, console, guitare, bijou, puzzle, clavier, lego, collier, parfum, téléphone, bague, écharpe, nounours, montre, portefeuille, casque, pull, voiture, vase, parapluie`],
    ['bathroom', 'Thing in a bathroom', 'Chose dans une salle de bain', 0,
      `bath, brush, comb, conditioner, curtain, faucet, floss, mirror, razor, shampoo, shower, sink, soap, sponge, toilet, toothbrush, toothpaste, towel, tub, scale, hairdryer, cotton, lotion, plunger`,
      `baignoire, brosse, peigne, après-shampoing, rideau, robinet, fil dentaire, miroir, rasoir, shampooing, douche, lavabo, savon, éponge, toilettes, brosse à dents, dentifrice, serviette, balance, sèche-cheveux, coton, lotion, ventouse`],
    ['cold', 'Something cold', 'Quelque chose de froid', 0,
      `ice, igloo, snow, snowman, freezer, fridge, glacier, iceberg, icicle, ice cream, winter, frost, blizzard, penguin, polar bear, arctic, sleet, slush, popsicle, sorbet`,
      `glace, igloo, neige, bonhomme de neige, congélateur, frigo, glacier, iceberg, glaçon, crème glacée, hiver, givre, blizzard, pingouin, ours polaire, arctique, grésil, sorbet, banquise, esquimau`],
    ['round', 'Something round', 'Quelque chose de rond', 0,
      `ball, balloon, bubble, button, clock, coin, cookie, donut, earth, globe, moon, orange, pizza, plate, ring, sun, wheel, pearl, marble, bowl, cd, orbit, tire, planet`,
      `ballon, bulle, bouton, horloge, pièce, biscuit, beignet, terre, globe, lune, orange, pizza, assiette, anneau, soleil, roue, perle, bille, bol, cd, orbite, pneu, planète`],
    ['sticky', 'Something sticky', 'Quelque chose de collant', 0,
      `glue, honey, jam, tape, gum, syrup, toffee, caramel, mud, sap, tar, cotton candy, spiderweb, sticker, lollipop, nougat, tree resin, velcro, slime, post it`,
      `colle, miel, confiture, scotch, chewing-gum, sirop, caramel, boue, sève, goudron, barbe à papa, toile d'araignée, autocollant, sucette, nougat, résine, velcro, slime, post-it`],
    ['shout', 'Something you shout', 'Quelque chose qu\'on crie', 0,
      `help, fire, goal, hooray, stop, ouch, bingo, bravo, cheers, hello, encore, eureka, gotcha, timber, yes, yippee, wow, watch out, victory, run`,
      `au secours, feu, but, hourra, stop, aïe, bingo, bravo, santé, bonjour, bis, eurêka, banzaï, victoire, oui, youpi, waouh, attention, courez, vive la france`],
    ['duo', 'Famous duo', 'Duo célèbre', 0,
      `Batman and Robin, Bonnie and Clyde, Laurel and Hardy, Romeo and Juliet, Tom and Jerry, Mario and Luigi, Asterix and Obelix, Sonny and Cher, Simon and Garfunkel, Ant and Dec, Starsky and Hutch, Ernie and Bert, Timon and Pumbaa, Holmes and Watson, Cheech and Chong, Wallace and Gromit, Itchy and Scratchy, Penn and Teller`,
      `Astérix et Obélix, Tom et Jerry, Laurel et Hardy, Roméo et Juliette, Batman et Robin, Bonnie et Clyde, Mario et Luigi, Starsky et Hutch, Tintin et Milou, Sherlock et Watson, Timon et Pumbaa, Bud Spencer et Terence Hill, Les Dupondt, Chip et Dale, Wallace et Gromit, Éric et Ramzy, Omar et Fred`],
    ['schoolbag', 'Item in a school bag', 'Objet dans un cartable', 0,
      `book, binder, calculator, compass, eraser, folder, glue, notebook, pen, pencil, ruler, scissors, sharpener, highlighter, lunchbox, planner, textbook, marker, protractor, tissue`,
      `livre, classeur, calculatrice, compas, gomme, chemise, colle, cahier, stylo, crayon, règle, ciseaux, taille-crayon, surligneur, gourde, agenda, manuel, feutre, rapporteur, mouchoir`],
    ['flies', 'Something that flies', 'Quelque chose qui vole', 0,
      `plane, bird, bee, kite, balloon, drone, rocket, helicopter, bat, butterfly, fly, glider, frisbee, eagle, wasp, dragonfly, paper plane, hot air balloon, jet, parachute`,
      `avion, oiseau, abeille, cerf-volant, ballon, drone, fusée, hélicoptère, chauve-souris, papillon, mouche, planeur, frisbee, aigle, guêpe, libellule, avion en papier, montgolfière, jet, parachute`],
    ['yellow', 'Something yellow', 'Quelque chose de jaune', 0,
      `banana, lemon, sun, duck, corn, cheese, butter, sunflower, school bus, taxi, honey, daffodil, canary, mustard, pineapple, rubber duck, lightning, star, pasta, egg yolk`,
      `banane, citron, soleil, canard, maïs, fromage, beurre, tournesol, bus scolaire, taxi, miel, jonquille, canari, moutarde, ananas, canard en plastique, éclair, étoile, pâtes, jaune d'oeuf`]
  );

  const PB_LET = 'ABCDEFGHIJLMNOPRSTV'.split('');
  const PB_DEF = { lang: typeof navigator !== 'undefined' && typeof navigator.language === 'string' && /^fr/i.test(navigator.language) ? 'fr' : 'en', rounds: 5, cats: 8, time: 90, src: 'classic', check: 'dict', bot: 'normal' };
  const PB_BOTP = { casual: .42, normal: .68, expert: .9 };
  const PB_BOTV = { casual: 1.3, normal: 1, expert: .8 };
  const pbCfg = o => {
    const c = Object.assign({}, PB_DEF, o || {});
    c.lang = c.lang === 'fr' ? 'fr' : 'en';
    c.rounds = [3, 5, 8].includes(+c.rounds) ? +c.rounds : 5;
    c.cats = [6, 8, 10, 12].includes(+c.cats) ? +c.cats : 8;
    c.time = [60, 90, 120, 180].includes(+c.time) ? +c.time : 90;
    if (!['classic', 'all', 'custom', 'mixed'].includes(c.src)) c.src = 'classic';
    if (c.check !== 'votes') c.check = 'dict';
    if (!PB_BOTP[c.bot]) c.bot = 'normal';
    c.sb = clamp(+c.sb | 0, 0, 3);
    return c;
  };
  const pbStrip = s => norm(s).replace(/^(?:the|a|an|le|la|les|l|un|une|des|du|de la|d) /, '');
  const pbSing = w => w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w;
  const pbCanon = s => pbStrip(s).split(' ').map(pbSing).join(' ');
  const pbFirst = s => pbStrip(s).charAt(0);
  const pbLev = (a, b) => {
    if (a === b) return 0;
    let p = Array.from({ length: b.length + 1 }, (x, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const c = [i];
      for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = c;
    }
    return p[b.length];
  };
  const pbSame = (a, b) => {
    const x = pbCanon(a), y = pbCanon(b);
    return x === y || (Math.min(x.length, y.length) >= 6 && pbLev(x, y) <= 1);
  };
  const PBC = {};
  PB_RAW.forEach(r => {
    const sp = s => s.split(',').map(x => x.trim()).filter(Boolean);
    PBC[r[0]] = { id: r[0], en: r[1], fr: r[2], core: r[3], w: { en: sp(r[4]), fr: sp(r[5]) }, s: {} };
  });
  const pbSet = (id, lang) => { const c = PBC[id]; return c.s[lang] || (c.s[lang] = new Set(c.w[lang].map(pbCanon))); };
  const pbMatch = label => { const n = norm(label); const c = Object.values(PBC).find(c => norm(c.en) === n || norm(c.fr) === n); return c ? c.id : ''; };
  const pbStatus = (a, cat, L, lang) => {
    const c = pbCanon(a);
    if (c.length < 2 || pbFirst(a) !== L.toLowerCase()) return 'bad';
    return cat.d && pbSet(cat.d, lang).has(c) ? 'ok' : 'unk';
  };
  const pbAnyWords = (L, lang) => {
    const out = [];
    Object.values(PBC).forEach(c => c.w[lang].forEach(w => { if (pbFirst(w) === L.toLowerCase() && !/ (and|et) /.test(w)) out.push(w); }));
    return out;
  };
  const pbBotWord = (cat, L, lang, p) => {
    let list = cat.d ? PBC[cat.d].w[lang].filter(w => pbFirst(w) === L.toLowerCase()) : [];
    if (!cat.d) { if (Math.random() > .5) return ''; list = pbAnyWords(L, lang); p = Math.min(p, .5); }
    return list.length && Math.random() < p ? rnd(list) : '';
  };

  function pbEngine(init) {
    const S = init.S || (() => {
      const o = pbCfg(init.o);
      const P = init.players.map(p => ({ n: clean(p.name, 16) || 'Player', bot: false, hid: p.id || null }));
      const nb = init.solo ? o.sb : (init.bots ? Math.max(0, (init.size || 0) - P.length) : 0);
      botNames(nb, P.map(p => p.n)).forEach(n => P.push({ n, bot: true, hid: null }));
      return { g: 'pb', ph: 'setup', o, cust: [], P, rd: 0, letter: '', usedL: [], cats: [], usedC: [], ans: [], bq: [], dl: 0, stopBy: -1, vt: {}, rdy: {}, hist: [], tot: P.map(() => 0) };
    })();
    const E = { S };
    const humans = () => S.P.filter(p => !p.bot).length;
    const blank = x => !String(x || '').trim();

    function pickCats() {
      const lang = S.o.lang, n = S.o.cats;
      const cust = S.cust.map((x, i) => ({ id: 'c' + i, n: x, d: pbMatch(x) }));
      const mk = c => ({ id: c.id, n: c[lang], d: c.id });
      let out = [];
      if (S.o.src === 'custom' && cust.length) out = shuffle(cust).slice(0, n);
      else {
        if (S.o.src === 'mixed') out = shuffle(cust).slice(0, n);
        const all = Object.values(PBC).filter(c => S.o.src === 'all' || c.core);
        let pool = all.filter(c => !S.usedC.includes(c.id) && !out.some(o => o.d === c.id));
        if (pool.length < n - out.length) { S.usedC = []; pool = all.filter(c => !out.some(o => o.d === c.id)); }
        out = out.concat(shuffle(pool).slice(0, n - out.length).map(mk));
      }
      out.forEach(c => { if (c.d && PBC[c.d]) S.usedC.push(c.d); });
      return out;
    }
    function nextRound(now) {
      if (S.rd >= S.o.rounds) { S.ph = 'over'; S.dl = 0; return; }
      S.rd++;
      let pool = PB_LET.filter(l => !S.usedL.includes(l));
      if (!pool.length) { S.usedL = []; pool = PB_LET.slice(); }
      S.letter = rnd(pool); S.usedL.push(S.letter);
      S.cats = pickCats();
      S.ans = S.P.map(() => S.cats.map(() => ''));
      S.vt = {}; S.rdy = {}; S.bq = []; S.stopBy = -1;
      S.ph = 'wheel'; S.dl = now + 3800;
    }
    function newGame(now) {
      S.rd = 0; S.usedL = []; S.usedC = []; S.hist = []; S.tot = S.P.map(() => 0);
      nextRound(now);
    }
    function plan(now) {
      const q = [], total = S.o.time * 1000, f = PB_BOTV[S.o.bot], pw = PB_BOTP[S.o.bot];
      S.P.forEach((p, i) => {
        if (!p.bot) return;
        let t = now + 3500 + Math.random() * 5000 * f, all = true;
        const per = Math.max(2500, (total * (.42 + Math.random() * .3) * f - 6000) / S.cats.length);
        shuffle(S.cats.map((c, ci) => ci)).forEach(ci => {
          t += per * (.55 + Math.random() * .9);
          const x = pbBotWord(S.cats[ci], S.letter, S.o.lang, pw);
          if (x) q.push({ at: t, k: 'a', p: i, i: ci, x }); else all = false;
        });
        if (all && Math.random() < .5) q.push({ at: t + 1200 + Math.random() * 2500, k: 's', p: i });
      });
      S.bq = q.sort((a, b) => a.at - b.at);
    }
    function elig(pi, st) {
      const h = humans();
      if (h <= 1) return 1;
      return h - (S.P[pi].bot ? 0 : 1) + (st === 'unk' ? S.P.filter((p, i) => p.bot && i !== pi).length : 0);
    }
    function evalRound() {
      return S.cats.map((cat, ci) => {
        const cells = S.P.map((p, pi) => {
          const a = (S.ans[pi] || [])[ci] || '', st = pbStatus(a, cat, S.letter, S.o.lang);
          const base = st === 'ok' || (st === 'unk' && S.o.check === 'votes');
          const vt = S.vt[ci + ':' + pi] || {};
          let yes = 0, no = 0;
          Object.keys(vt).forEach(k => { if (vt[k] > 0) yes++; else no++; });
          const el = elig(pi, st);
          return { a, st, el, yes, no, v: st === 'bad' ? false : yes * 2 > el ? true : no * 2 > el ? false : base, pts: 0, sh: 0 };
        });
        const grp = [];
        cells.forEach((c, pi) => {
          if (!c.v) return;
          const g = grp.find(g => pbSame(g.a, c.a));
          if (g) g.m.push(pi); else grp.push({ a: c.a, m: [pi] });
        });
        grp.forEach(g => g.m.forEach(pi => { cells[pi].pts = g.m.length > 1 ? 5 : 10; cells[pi].sh = g.m.length > 1 ? g.m.length : 0; }));
        return cells;
      });
    }
    function startReview(now) {
      S.ph = 'review'; S.rdy = {}; S.bq = [];
      S.dl = now + (humans() > 1 ? 55000 : 150000);
      if (humans() > 1) {
        S.cats.forEach((cat, ci) => S.P.forEach((p, pi) => {
          const a = S.ans[pi][ci];
          if (pbStatus(a, cat, S.letter, S.o.lang) !== 'unk') return;
          S.P.forEach((b, bi) => {
            if (!b.bot || bi === pi) return;
            S.bq.push({ at: now + 2500 + Math.random() * 14000, k: 'v', p: bi, c: ci, a: pi, d: Math.random() < (pbCanon(a).length >= 3 ? .62 : .3) ? 1 : -1 });
          });
        }));
        S.bq.sort((a, b) => a.at - b.at);
      }
    }
    function finishReview(now) {
      const ev = evalRound(), pts = S.P.map((p, pi) => ev.reduce((s, row) => s + row[pi].pts, 0));
      pts.forEach((x, i) => { S.tot[i] += x; });
      S.hist.push({ L: S.letter, pts });
      S.ph = 'round'; S.rdy = {}; S.bq = []; S.dl = now + 30000;
    }
    function stopRound(seat, now) { S.stopBy = seat; S.ph = 'stop'; S.dl = now + 2600; S.bq = []; }
    const allRdy = () => S.P.every((p, i) => p.bot || S.rdy[i]);

    E.act = (seat, m, now, ld) => {
      const me = S.P[seat];
      if (!me || !m || typeof m !== 'object') return false;
      switch (m.t) {
        case 'opt': {
          if (!(S.ph === 'setup' || S.ph === 'over') || !ld || !(m.k in PB_DEF)) return false;
          S.o = pbCfg(Object.assign({}, S.o, { [m.k]: m.v })); return true;
        }
        case 'cust':
          if (!(S.ph === 'setup' || S.ph === 'over') || !ld) return false;
          S.cust = String(m.x || '').split('\n').map(x => clean(x, 32)).filter(Boolean).slice(0, 14); return true;
        case 'start':
          if (S.ph !== 'setup' || !ld) return false;
          newGame(now); return true;
        case 'ans': {
          if (S.ph !== 'write' && S.ph !== 'stop') return false;
          const i = m.i | 0;
          if (i < 0 || i >= S.cats.length) return false;
          const was = !blank(S.ans[seat][i]), x = clean(m.x, 40);
          S.ans[seat][i] = x;
          return was !== !blank(x) ? true : 2;
        }
        case 'stop':
          if (S.ph !== 'write' || S.ans[seat].some(blank)) return false;
          stopRound(seat, now); return true;
        case 'vote': {
          if (S.ph !== 'review') return false;
          const c = m.c | 0, p = m.p | 0;
          if (c < 0 || c >= S.cats.length || p < 0 || p >= S.P.length || (p === seat && humans() > 1)) return false;
          if (pbStatus((S.ans[p] || [])[c], S.cats[c], S.letter, S.o.lang) === 'bad') return false;
          const k = c + ':' + p, d = m.d > 0 ? 1 : m.d < 0 ? -1 : 0;
          const vt = S.vt[k] || (S.vt[k] = {});
          if (d) vt[seat] = d; else delete vt[seat];
          return true;
        }
        case 'done':
          if (S.ph !== 'review' || S.rdy[seat]) return false;
          S.rdy[seat] = 1; if (allRdy()) finishReview(now); return true;
        case 'next':
          if (S.ph !== 'round' || S.rdy[seat]) return false;
          S.rdy[seat] = 1; if (allRdy()) nextRound(now); return true;
        case 'again':
          if (S.ph !== 'over' || !ld) return false;
          newGame(now); return true;
        case 'setup':
          if (S.ph !== 'over' || !ld) return false;
          S.ph = 'setup'; return true;
      }
      return false;
    };

    E.tick = now => {
      let ch = false;
      if (S.ph === 'wheel') {
        if (now >= S.dl) { S.ph = 'write'; S.dl = now + S.o.time * 1000; plan(now); ch = true; }
      } else if (S.ph === 'write') {
        while (S.bq.length && S.bq[0].at <= now && S.ph === 'write') {
          const b = S.bq.shift();
          if (b.k === 'a') { S.ans[b.p][b.i] = b.x; ch = true; }
          else if (b.k === 's' && !S.ans[b.p].some(blank)) { stopRound(b.p, now); ch = true; }
        }
        if (S.ph === 'write' && now >= S.dl) { S.stopBy = -1; S.ph = 'stop'; S.dl = now + 1800; S.bq = []; ch = true; }
      } else if (S.ph === 'stop') {
        if (now >= S.dl) { startReview(now); ch = true; }
      } else if (S.ph === 'review') {
        while (S.bq.length && S.bq[0].at <= now) {
          const b = S.bq.shift(), k = b.c + ':' + b.a;
          (S.vt[k] || (S.vt[k] = {}))['b' + b.p] = b.d; ch = true;
        }
        if (now >= S.dl || (humans() && allRdy())) { finishReview(now); ch = true; }
      } else if (S.ph === 'round') {
        if (now >= S.dl || (humans() && allRdy())) { nextRound(now); ch = true; }
      }
      return ch;
    };

    E.seatOut = i => {
      const p = S.P[i]; if (!p || p.bot) return;
      p.bot = true; p.hid = null;
    };

    E.view = (seat, now) => {
      const v = {
        g: 'pb', ph: S.ph, o: S.o, rd: S.rd, letter: S.ph === 'setup' ? '' : S.letter, cust: S.cust,
        cats: S.cats.map(c => ({ n: c.n })), tl: S.dl ? Math.max(0, S.dl - now) : 0, stopBy: S.stopBy,
        P: S.P.map((p, i) => ({ n: p.n, bot: p.bot ? 1 : 0, tot: S.tot[i], fill: (S.ans[i] || []).filter(x => !blank(x)).length, rdy: S.rdy[i] ? 1 : 0 })),
        mine: S.ans[seat] || [], hist: S.hist, h: humans()
      };
      if (S.ph === 'review' || S.ph === 'round') {
        const ev = evalRound();
        v.cells = ev.map((row, ci) => row.map((c, pi) => {
          const vt = S.vt[ci + ':' + pi] || {};
          return { a: c.a, st: c.st, v: c.v ? 1 : 0, y: c.yes, n: c.no, p: c.pts, sh: c.sh, mv: vt[seat] || 0, cv: c.st !== 'bad' && (pi !== seat || humans() <= 1) ? 1 : 0 };
        }));
      }
      return v;
    };
    return E;
  }

  const PB_CHK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  const PB_CRS = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const PB_COL = ['#ff7a3d', '#3d8bff', '#22b573', '#a55bff', '#f2b705', '#ef476f', '#00a6a6', '#8d99ae'];
  const pbHue = n => PB_COL[[...n].reduce((s, c) => s + c.charCodeAt(0), 0) % PB_COL.length];

  const pbWheelSVG = () => {
    const n = PB_LET.length, st = 360 / n, R = 142, r0 = 56;
    const pt = (a, r) => { const q = (a - 90) * Math.PI / 180; return [(150 + r * Math.cos(q)).toFixed(1), (150 + r * Math.sin(q)).toFixed(1)]; };
    let s = '';
    PB_LET.forEach((l, i) => {
      const [x1, y1] = pt(i * st - st / 2, R), [x2, y2] = pt(i * st + st / 2, R), [x3, y3] = pt(i * st + st / 2, r0), [x4, y4] = pt(i * st - st / 2, r0);
      s += `<path d="M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r0} ${r0} 0 0 0 ${x4} ${y4}Z" fill="${PB_COL[i % PB_COL.length]}" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="150" y="44" transform="rotate(${(i * st).toFixed(2)} 150 150)" text-anchor="middle" dominant-baseline="central" font-family="var(--sans)" font-weight="900" font-size="24" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width="3" paint-order="stroke">${l}</text>`;
    });
    return `<svg class="pw-svg" viewBox="0 0 300 300" role="img" aria-label="Letter wheel"><circle cx="150" cy="150" r="147" fill="#1c2042"/><g class="pw-rot" style="transform-origin:150px 150px">${s}</g><circle cx="150" cy="150" r="54" fill="#fff" stroke="#1c2042" stroke-width="5"/><text class="hub" x="150" y="152" text-anchor="middle" dominant-baseline="central" font-family="var(--sans)" font-weight="900" font-size="64" fill="#1c2042">?</text><path d="M136 1h28l-14 30z" fill="#e5383b" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;
  };

  const pbHow = fr => fr
    ? `<p><b>But.</b> Une lettre est tirée au hasard. Remplissez chaque catégorie avec un mot qui commence par cette lettre avant la fin du temps.</p>
<p><b>Stop !</b> Le premier joueur dont toutes les cases sont remplies peut crier Stop : la manche s'arrête pour tout le monde.</p>
<p><b>Vérification.</b> Les réponses sont comparées à un dictionnaire intégré. Un mot inconnu, ou une réponse que vous contestez, se vote : la majorité décide. En solo, vous jugez vous-même vos mots inconnus.</p>
<p><b>Points.</b> Une réponse valide que personne d'autre n'a écrite vaut <b>10</b>. La même réponse écrite par plusieurs joueurs vaut <b>5</b> chacun. Pluriels, accents et articles (le, la, les) sont ignorés.</p>
<p><b>Langue.</b> Français ou anglais, au choix dans le menu ou par l'hôte. Catégories personnalisées : une par ligne.</p>
<p><b>Clavier.</b> <kbd>Entrée</kbd> passe à la case vide suivante, puis au bouton Stop.</p>`
    : `<p><b>Goal.</b> A random letter is drawn. Fill every category with a word that starts with it before the time runs out.</p>
<p><b>Stop!</b> The first player with every box filled can call Stop. The round freezes for everyone.</p>
<p><b>Review.</b> Answers are checked against a built-in dictionary. Anything unknown, or anything you disagree with, is settled by vote: a majority flips the verdict. Alone, you judge your own unknown words.</p>
<p><b>Score.</b> A valid answer nobody else wrote scores <b>10</b>. The same answer written by several players scores <b>5</b> each. Plurals, accents and articles (the, le, la) are ignored.</p>
<p><b>Languages.</b> English or French, set in the menu or by the host. Custom categories: one per line.</p>
<p><b>Keys.</b> <kbd>Enter</kbd> jumps to the next empty box, then to Stop.</p>`;

  function pbMount(root, api) {
    const app = h('div', 'pb-app');
    app.innerHTML = `<div class="pb-bar"><div class="pb-let"><b>?</b></div><div class="pb-info"><span class="rd"></span><span class="sb"></span></div><div class="pb-mid"><span class="tm"></span></div><button type="button" class="pb-x" aria-label="Leave game" title="Leave game"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
<div class="pb-tb"><u></u></div><div class="pb-main"></div>`;
    root.append(app);
    app.hidden = true;
    const q = s => app.querySelector(s), main = q('.pb-main');
    const L = { v: null, lang: PB_DEF.lang, sb: 0, key: '', prev: { ph: '', rd: 0 }, T: { left: 0, at: 0, tot: 0 }, sent: [], pt: 0, ct: 0, landed: false, tk: 0, cust: null, sig: '' };
    const lg = () => L.v ? L.v.o.lang : L.lang;
    const t = (en, fr) => lg() === 'fr' ? fr : en;

    const G = Glue(root, api, {
      key: 'petit-bac', title: 'Petit Bac', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], def: 6, max: 12,
      lang: lg,
      logo: () => `<svg viewBox="0 0 120 70" width="150" style="display:block;margin:0 auto 6px"><rect x="8" y="14" width="30" height="40" rx="7" fill="#ff7a3d" transform="rotate(-10 23 34)"/><rect x="45" y="10" width="30" height="40" rx="7" fill="#3d8bff"/><rect x="82" y="14" width="30" height="40" rx="7" fill="#22b573" transform="rotate(10 97 34)"/><g font-family="var(--sans)" font-weight="900" font-size="26" fill="#fff" text-anchor="middle"><text x="23" y="42" transform="rotate(-10 23 34)">P</text><text x="60" y="38">B</text><text x="97" y="42" transform="rotate(10 97 34)">A</text></g></svg><div class="kick">${t('Word party game', 'Jeu de mots')}</div><h3>Petit Bac</h3><p>${t('One letter. Every category. Beat the clock and the other players.', 'Une lettre. Toutes les catégories. Battez le chrono et les autres joueurs.')}</p>`,
      how: () => pbHow(lg() === 'fr'),
      soloLabel: () => L.sb ? t('Play solo vs bots', 'Jouer en solo contre des bots') : t('Play solo against the clock', 'Jouer en solo contre la montre'),
      menuExtra: () => `<div class="pb-mx"><div class="opt"><span>${t('Language', 'Langue')}</span>${seg('lang', [['en', 'English'], ['fr', 'Français']], L.lang)}</div><div class="opt"><span>${t('Solo opponents', 'Adversaires en solo')}<small>${t('0 = race the clock', '0 = contre la montre')}</small></span>${seg('sb', [[0, '0'], [1, '1'], [2, '2'], [3, '3']], L.sb)}</div></div>`,
      menuBind: el => { if (el._pb) return; el._pb = 1; bindSeg(el, (k, val) => { if (k === 'lang') L.lang = val; else L.sb = +val; G.menu(); }); },
      build: i => pbEngine({ players: i.players, size: i.size, bots: i.bots, solo: i.solo, o: i.cfg }),
      restore: S => pbEngine({ S }),
      live: S => S.ph !== 'setup' && S.ph !== 'over',
      cfg: () => ({ lang: L.lang, sb: L.sb }),
      resumeInfo: S => S.o.lang === 'fr' ? `Manche ${S.rd}/${S.o.rounds}, lettre ${S.letter}.` : `Round ${S.rd} of ${S.o.rounds}, letter ${S.letter}.`,
      onView: v => render(v),
      onReset: () => { L.v = null; L.key = ''; L.prev = { ph: '', rd: 0 }; app.hidden = true; },
      onStart: () => {}
    });
    const X = G.X, sfx = G.sfx, pane = G.pane;
    api.label('Points');

    const me = v => v.P[v.seat] || v.P[0];
    const rankOf = v => {
      const ord = v.P.map((p, i) => i).sort((a, b) => v.P[b].tot - v.P[a].tot || a - b);
      const r = []; ord.forEach((pi, k) => { r[pi] = k && v.P[pi].tot === v.P[ord[k - 1]].tot ? r[ord[k - 1]] : k + 1; });
      return { ord, r };
    };

    function top(v) {
      const shown = v.letter && (v.ph !== 'wheel' || L.landed), lt = q('.pb-let b'), nl = shown ? v.letter : '?';
      if (lt.textContent !== nl) { lt.textContent = nl; lt.classList.remove('pop'); void lt.offsetWidth; lt.classList.add('pop'); }
      q('.rd').textContent = v.ph === 'setup' ? 'Petit Bac' : v.ph === 'over' ? t('Final results', 'Résultats finaux') : t('Round ', 'Manche ') + v.rd + '/' + v.o.rounds;
      q('.sb').textContent = v.on ? v.h + t(' players', ' joueurs') : v.P.length > 1 ? t('Solo vs ' + (v.P.length - 1) + ' bot' + (v.P.length > 2 ? 's' : ''), 'Solo contre ' + (v.P.length - 1) + ' bot' + (v.P.length > 2 ? 's' : '')) : t('Solo vs the clock', 'Solo contre la montre');
      q('.pb-x').title = t('Leave game', 'Quitter la partie');
    }

    function onPhase(v, pv) {
      if (v.ph === 'wheel') { L.landed = false; sfx.noise(.5, .04, 500, .8, 3000); }
      if (v.ph === 'write' && pv.ph !== 'write') sfx.arp([523, 784], .09, 'triangle', .05);
      if (v.ph === 'stop' && pv.ph !== 'stop') { sfx.noise(.45, .09, 900, .9, 180); sfx.tone(330, .25, 'sawtooth', .04, 160); flush(); }
      if (v.ph === 'review' && pv.ph !== 'review') sfx.arp([392, 494, 587], .08, 'triangle', .04);
      if (v.ph === 'round' && pv.ph !== 'round') sfx.arp([523, 659, 784], .09, 'triangle', .05);
      if (v.ph === 'over' && pv.ph !== 'over') {
        const r = rankOf(v), win = r.r[v.seat] === 1;
        sfx.arp(win ? [523, 659, 784, 1047, 1319] : [392, 349, 311, 262], .13, 'triangle', .06, .3);
        if (!v.on && v.P.length === 1 && v.o.check === 'dict') api.submit(me(v).tot);
      }
    }

    const optsHTML = v => {
      const o = v.o;
      if (!v.ld) {
        const src = { classic: t('Classic', 'Classiques'), all: t('Everything', 'Toutes'), custom: t('Custom', 'Perso'), mixed: t('Mixed', 'Mixte') }[o.src];
        return `<p class="note">${t('Set by the host', 'Réglé par l\'hôte')}: ${o.rounds} ${t('rounds', 'manches')} - ${o.cats} ${t('categories', 'catégories')} - ${fmtT(o.time * 1000)} - ${src} - ${o.lang === 'fr' ? 'Français' : 'English'}</p>`;
      }
      return `<div class="pb-opts"><div class="opt"><span>${t('Language', 'Langue')}</span>${seg('lang', [['en', 'English'], ['fr', 'Français']], o.lang)}</div>
<div class="opt"><span>${t('Rounds', 'Manches')}</span>${seg('rounds', [[3, '3'], [5, '5'], [8, '8']], o.rounds)}</div>
<div class="opt"><span>${t('Categories per round', 'Catégories par manche')}</span>${seg('cats', [[6, '6'], [8, '8'], [10, '10'], [12, '12']], o.cats)}</div>
<div class="opt"><span>${t('Time per round', 'Temps par manche')}</span>${seg('time', [[60, '1:00'], [90, '1:30'], [120, '2:00'], [180, '3:00']], o.time)}</div>
<div class="opt"><span>${t('Categories', 'Catégories')}<small>${t('Custom ones are checked by vote or dictionary', 'Les perso sont vérifiées par vote ou dico')}</small></span>${seg('src', [['classic', t('Classic', 'Classiques')], ['all', t('Everything', 'Toutes')], ['custom', t('Custom', 'Perso')], ['mixed', t('Mixed', 'Mixte')]], o.src)}</div>
<div class="opt"><span>${t('Answer check', 'Vérification')}</span>${seg('check', [['dict', t('Dictionary + votes', 'Dico + votes')], ['votes', t('Votes only', 'Votes seuls')]], o.check)}</div>
<div class="opt"><span>${t('Bot level', 'Niveau des bots')}</span>${seg('bot', [['casual', t('Casual', 'Détendu')], ['normal', 'Normal'], ['expert', 'Expert']], o.bot)}</div></div>`;
    };

    const BUILD = {
      setup: v => {
        const o = v.o, cu = (L.cust != null && v.ld ? L.cust : v.cust.join('\n'));
        return `<div class="pb-setup pnl"><div class="lab">${t('Players', 'Joueurs')}</div><div class="pb-pl">${v.P.map((p, i) => `<span class="chip${i === v.seat ? ' me' : ''}"><i style="background:${pbHue(p.n)}"></i>${esc(p.n)}${p.bot ? ' <small>bot</small>' : ''}</span>`).join('')}</div>
${optsHTML(v)}
<div class="pb-cu"${o.src === 'custom' || o.src === 'mixed' ? '' : ' hidden'}><div class="lab">${t('Your categories (one per line)', 'Vos catégories (une par ligne)')}</div><textarea class="g-input" rows="5" maxlength="480" ${v.ld ? '' : 'readonly'} placeholder="${t('Something red\nA reason to be late\nFamous duo', 'Quelque chose de rouge\nUne excuse pour être en retard\nDuo célèbre')}" aria-label="${t('Custom categories', 'Catégories perso')}">${esc(cu)}</textarea><p class="note">${t('Known names like Animal or Fruit use the dictionary. With none, the classic list is used.', 'Les noms connus (Animal, Fruit...) utilisent le dico. Sans catégorie, la liste classique est utilisée.')}</p></div>
<div class="pb-row">${v.ld ? `<button type="button" class="g-btn" data-a="start">${t('Start game', 'Lancer la partie')}</button>` : `<span class="chip">${t('Waiting for the host to start', 'En attente de l\'hôte')}</span>`}<button type="button" class="g-btn ghost sm" data-a="leave">${t('Leave', 'Quitter')}</button></div></div>`;
      },
      wheel: () => `<div class="pb-wheel">${pbWheelSVG()}<p class="pb-wt">${t('Drawing the letter', 'Tirage de la lettre')}<span class="dots"></span></p></div>`,
      write: v => `<div class="pb-prog"></div><div class="pb-cards">${v.cats.map((c, i) => `<label class="pb-card"><span class="cn">${esc(c.n)}</span><input class="pb-in" data-i="${i}" maxlength="40" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="next" placeholder="${v.letter}..." aria-label="${esc(c.n)}"></label>`).join('')}</div>
<div class="pb-foot"><button type="button" class="pb-stop" data-a="stop" disabled>${t('STOP!', 'STOP !')}</button><span class="pb-hint"></span></div><div class="pb-ban" hidden></div>`,
      review: v => `<div class="pb-note pnl"><b>${t('Check the answers', 'Vérifiez les réponses')}</b><span>${t('Green means known. Vote to accept or refuse any answer: a majority wins.', 'Vert = connu. Votez pour accepter ou refuser une réponse : la majorité décide.')}</span></div><div class="pb-rcs"></div>
<div class="pb-foot"><button type="button" class="g-btn pb-done" data-a="done">${t('Done', 'Terminé')}</button><span class="pb-hint"></span></div>`,
      round: v => {
        const { ord } = rankOf(v), last = v.hist[v.hist.length - 1] || { pts: [] }, mx = Math.max(1, ...v.P.map(p => p.tot));
        return `<div class="pb-res pnl"><div class="lab">${t('Letter', 'Lettre')} ${v.letter} - ${t('round results', 'résultats de la manche')}</div>${ord.map(pi => `<div class="pb-rk${pi === v.seat ? ' me' : ''}"><span class="n">${esc(v.P[pi].n)}${v.P[pi].bot ? ' <small>bot</small>' : ''}</span><i><u style="width:${(v.P[pi].tot / mx * 100).toFixed(1)}%;background:${pbHue(v.P[pi].n)}"></u></i><em class="d">+${last.pts[pi] || 0}</em><b>${v.P[pi].tot}</b></div>`).join('')}
<div class="pb-row"><button type="button" class="g-btn pb-nx" data-a="next">${v.rd >= v.o.rounds ? t('Final results', 'Résultats finaux') : t('Next round', 'Manche suivante')}</button><span class="pb-hint"></span></div></div>`;
      },
      over: v => {
        const { ord, r } = rankOf(v), pod = [1, 0, 2].filter(k => ord[k] != null), my = r[v.seat], solo = !v.on && v.P.length === 1;
        const title = solo ? t('Your score', 'Votre score') : my === 1 ? t('You win!', 'Vous gagnez !') : t('Game over', 'Partie terminée');
        return `<div class="pb-over pnl"><div class="kick">${title}</div><div class="pb-pod">${pod.map(k => { const pi = ord[k]; return `<div class="pd r${k + 1}${pi === v.seat ? ' me' : ''}"><span class="av" style="background:${pbHue(v.P[pi].n)}">${esc(v.P[pi].n.charAt(0).toUpperCase())}</span><b>${esc(v.P[pi].n)}</b><em>${v.P[pi].tot} pts</em><i style="--h:${v.P.length === 1 ? 60 : 38 + (3 - (k + 1)) * 22}px">${r[pi]}</i></div>`; }).join('')}</div>
<div class="pb-tw"><table class="pb-tbl"><thead><tr><th></th>${v.hist.map(x => `<th>${x.L}</th>`).join('')}<th>Total</th></tr></thead><tbody>${ord.map(pi => `<tr class="${pi === v.seat ? 'me' : ''}"><td>${esc(v.P[pi].n)}</td>${v.hist.map(x => `<td>${x.pts[pi] || 0}</td>`).join('')}<td><b>${v.P[pi].tot}</b></td></tr>`).join('')}</tbody></table></div>
${v.ld ? `<div class="pb-row"><button type="button" class="g-btn" data-a="again">${t('Play again', 'Rejouer')}</button><button type="button" class="g-btn ghost" data-a="setup">${t('Settings', 'Réglages')}</button>${v.on ? `<button type="button" class="g-btn ghost" data-a="lobby">${t('Back to lobby', 'Retour au salon')}</button>` : ''}</div>` : `<p class="note">${t('Waiting for the host to start another game.', 'En attente de l\'hôte pour une nouvelle partie.')}</p>`}
<div class="pb-row"><button type="button" class="g-btn ghost sm" data-a="leave">${t('Leave', 'Quitter')}</button></div></div>`;
      }
    };

    function land() {
      L.landed = true;
      const hub = main.querySelector('.hub'), v = L.v;
      if (hub && v) { hub.textContent = v.letter; hub.classList.add('pop'); }
      if (v) top(v);
      sfx.arp([523, 659, 784, 1047], .07, 'triangle', .06, .25);
    }
    function spin(v) {
      const el = main.querySelector('.pw-rot'); if (!el) return;
      const n = PB_LET.length, idx = Math.max(0, PB_LET.indexOf(v.letter)), fin = -(360 / n * idx) - 360 * 4, dur = clamp(v.tl - 700, 0, 3000);
      if (dur < 300 || reduced()) { el.style.transition = 'none'; el.style.transform = `rotate(${fin}deg)`; land(); return; }
      el.style.transition = 'none'; el.style.transform = 'rotate(0deg)'; void el.getBoundingClientRect();
      el.style.transition = `transform ${dur}ms cubic-bezier(.12,.55,.12,1)`; el.style.transform = `rotate(${fin}deg)`;
      const k = idx + 4 * n;
      for (let i = 1; i <= k; i++) api.timeout(() => sfx.tone(i % 2 ? 760 : 680, .025, 'square', .018), dur * (1 - Math.pow(1 - i / k, 1 / 3)));
      api.timeout(land, dur + 40);
    }

    const ins = () => [...main.querySelectorAll('.pb-in')];
    function flush() {
      clearTimeout(L.pt);
      const v = L.v; if (!v || (v.ph !== 'write' && v.ph !== 'stop')) return;
      ins().forEach(el => {
        const i = +el.dataset.i, x = clean(el.value, 40);
        if (x !== (L.sent[i] || '')) { L.sent[i] = x; X.act({ t: 'ans', i, x }); }
      });
    }
    function chk() {
      const v = L.v; if (!v) return;
      const all = ins(); let n = 0;
      all.forEach(el => {
        const has = !!el.value.trim(); if (has) n++;
        el.parentNode.classList.toggle('has', has);
        el.parentNode.classList.toggle('bad', has && pbFirst(el.value) !== v.letter.toLowerCase());
      });
      const full = n === all.length, st = main.querySelector('.pb-stop'), hint = main.querySelector('.pb-hint');
      if (st) st.disabled = !full || v.ph !== 'write';
      if (hint) hint.textContent = v.ph === 'stop' ? '' : full ? t('All filled. Press Stop to end the round!', 'Tout est rempli. Appuyez sur Stop !') : n + '/' + all.length + ' ' + t('filled', 'remplis');
    }

    function updWrite(v) {
      const n = v.cats.length;
      main.querySelector('.pb-prog').innerHTML = v.P.map((p, i) => `<span class="pp${i === v.seat ? ' me' : ''}"><b>${esc(p.n)}</b><i><u style="width:${(p.fill / n * 100).toFixed(0)}%;background:${pbHue(p.n)}"></u></i><em>${p.fill}/${n}</em></span>`).join('');
      const lock = v.ph === 'stop';
      ins().forEach(el => { el.readOnly = lock; });
      const ban = main.querySelector('.pb-ban');
      ban.hidden = !lock;
      if (lock) ban.innerHTML = v.stopBy >= 0 ? `<b>${t('STOP!', 'STOP !')}</b><span>${esc(v.P[v.stopBy].n)}</span>` : `<b>${t('Time is up!', 'Temps écoulé !')}</b>`;
      chk();
    }

    const cellHTML = (v, ci, pi) => {
      const c = v.cells[ci][pi], p = v.P[pi], mine = pi === v.seat, empty = !c.a;
      const tag = empty ? '' : c.st === 'bad' ? t('Invalid', 'Invalide') : c.st === 'ok' ? t('In dictionary', 'Dans le dico') : v.o.check === 'votes' ? t('Vote', 'À voter') : t('Unknown', 'Inconnu');
      const cls = empty ? 'em' : c.v ? 'ok' : 'no';
      const vt = c.cv && !empty ? `<span class="vt"><button type="button" class="vb y${c.mv > 0 ? ' on' : ''}" data-a="vt" data-c="${ci}" data-p="${pi}" data-d="1" title="${t('Accept', 'Accepter')}" aria-label="${t('Accept', 'Accepter')}">${PB_CHK}<small>${c.y}</small></button><button type="button" class="vb n${c.mv < 0 ? ' on' : ''}" data-a="vt" data-c="${ci}" data-p="${pi}" data-d="-1" title="${t('Refuse', 'Refuser')}" aria-label="${t('Refuse', 'Refuser')}">${PB_CRS}<small>${c.n}</small></button></span>` : '';
      return `<div class="pb-a ${cls}${mine ? ' me' : ''}"><span class="who">${esc(p.n)}</span><span class="tx"><b>${empty ? '-' : esc(c.a)}</b>${tag ? `<em class="tg s-${c.st}">${tag}</em>` : ''}</span>${vt}<span class="pt p${c.p}" title="${c.sh ? t('Shared by ' + c.sh, 'Partagé par ' + c.sh) : ''}">${c.p ? '+' + c.p : '0'}</span></div>`;
    };
    function updReview(v) {
      const sig = JSON.stringify(v.cells) + v.seat;
      if (sig !== L.sig) {
        L.sig = sig;
        const order = v.P.map((p, i) => i).sort((a, b) => a === v.seat ? -1 : b === v.seat ? 1 : a - b);
        main.querySelector('.pb-rcs').innerHTML = v.cats.map((c, ci) => `<div class="pb-rc"><h4>${esc(c.n)}</h4>${order.map(pi => cellHTML(v, ci, pi)).join("")}</div>`).join('');
      }
      const m = me(v), hum = v.P.filter(p => !p.bot), b = main.querySelector('.pb-done');
      b.disabled = !!m.rdy; b.textContent = m.rdy ? t('Waiting', 'En attente') : t('Done', 'Terminé');
      main.querySelector('.pb-hint').textContent = hum.length > 1 ? hum.filter(p => p.rdy).length + '/' + hum.length + ' ' + t('ready', 'prêts') : '';
    }
    function updRound(v) {
      const m = me(v), hum = v.P.filter(p => !p.bot), b = main.querySelector('.pb-nx');
      b.disabled = !!m.rdy;
      main.querySelector('.pb-hint').textContent = hum.length > 1 ? hum.filter(p => p.rdy).length + '/' + hum.length + ' ' + t('ready', 'prêts') : '';
    }

    const keyOf = v => v.ph === 'setup' ? 'setup' + v.ld + JSON.stringify([v.P.map(p => [p.n, p.bot]), v.o]) + (v.ld ? '' : JSON.stringify(v.cust)) + v.seat
      : v.ph === 'wheel' ? 'wheel' + v.rd : v.ph === 'write' || v.ph === 'stop' ? 'w' + v.rd : v.ph === 'review' ? 'rv' + v.rd : v.ph === 'round' ? 'rs' + v.rd : 'over' + v.ld + v.P.map(p => p.tot);

    function build(v) {
      const fn = BUILD[v.ph === 'stop' ? 'write' : v.ph]; if (!fn) return;
      L.sig = '';
      if (v.ph !== 'setup') L.cust = null;
      main.innerHTML = fn(v);
      if (v.ph === 'wheel') spin(v);
      else if (v.ph === 'write' || v.ph === 'stop') {
        L.sent = [];
        ins().forEach(el => { const i = +el.dataset.i; el.value = v.mine[i] || ''; L.sent[i] = el.value; });
        if (v.ph === 'write') { const e = ins().find(x => !x.value) || ins()[0]; if (e) e.focus({ preventScroll: true }); }
      }
      main.scrollTop = 0;
    }

    function timer(v) {
      L.T.left = v.tl; L.T.at = performance.now();
      L.T.tot = v.ph === 'write' ? v.o.time * 1000 : v.ph === 'review' ? (v.h > 1 ? 55000 : 150000) : v.ph === 'round' ? 30000 : 0;
      drawTimer();
    }
    function drawTimer() {
      const v = L.v; if (!v) return;
      const tm = q('.tm'), b = q('.pb-tb u'), live = v.ph === 'write' || v.ph === 'review' || v.ph === 'round';
      const left = live && L.T.left ? Math.max(0, L.T.left - (performance.now() - L.T.at)) : 0;
      tm.textContent = left ? fmtT(left) : '';
      tm.classList.toggle('hot', left > 0 && left < 10000 && v.ph === 'write');
      b.style.width = left && L.T.tot ? Math.min(100, left / L.T.tot * 100) + '%' : '0';
    }
    api.interval(() => {
      if (api.paused && X.role === 'local') { L.T.at = performance.now(); return; }
      const v = L.v; if (!v) return;
      const left = L.T.left ? L.T.left - (performance.now() - L.T.at) : 0;
      if (v.ph === 'write' && left > 0 && left < 10000 && Math.ceil(left / 1000) !== L.tk) { L.tk = Math.ceil(left / 1000); sfx.tone(880, .05, 'square', .02); }
      drawTimer();
    }, 250);

    function render(v) {
      app.hidden = false;
      const pv = L.prev, changed = v.ph !== pv.ph || v.rd !== pv.rd;
      L.v = v;
      if (changed) onPhase(v, pv);
      L.prev = { ph: v.ph, rd: v.rd };
      api.score(me(v).tot);
      top(v);
      const key = keyOf(v);
      if (key !== L.key) { L.key = key; build(v); }
      if (v.ph === 'write' || v.ph === 'stop') updWrite(v);
      else if (v.ph === 'review') updReview(v);
      else if (v.ph === 'round') updRound(v);
      timer(v);
    }

    main.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'), v = L.v; if (!b || b.disabled || !v) return;
      const a = b.dataset.a;
      if (a === 'start') { flushCust(); X.act({ t: 'start' }); }
      else if (a === 'stop') { flush(); sfx.tone(300, .1, 'square', .05, 600); X.act({ t: 'stop' }); }
      else if (a === 'done') X.act({ t: 'done' });
      else if (a === 'next') X.act({ t: 'next' });
      else if (a === 'again') X.act({ t: 'again' });
      else if (a === 'setup') X.act({ t: 'setup' });
      else if (a === 'lobby') X.toLobby();
      else if (a === 'leave') X.leave();
      else if (a === 'vt') {
        const c = +b.dataset.c, p = +b.dataset.p, d = +b.dataset.d, cur = v.cells[c][p].mv;
        sfx.tone(d > 0 ? 620 : 380, .07, 'triangle', .04);
        X.act({ t: 'vote', c, p, d: cur === d ? 0 : d });
      }
    });
    bindSeg(main, (k, val) => { flushCust(); X.act({ t: 'opt', k, v: val }); });
    function flushCust() {
      clearTimeout(L.ct);
      const ta = main.querySelector('textarea');
      if (ta && L.v && L.v.ph === 'setup' && L.v.ld) { L.cust = ta.value; X.act({ t: 'cust', x: ta.value }); }
    }
    main.addEventListener('input', e => {
      if (e.target.classList.contains('pb-in')) { chk(); clearTimeout(L.pt); L.pt = setTimeout(flush, 320); }
      else if (e.target.tagName === 'TEXTAREA') { L.cust = e.target.value; clearTimeout(L.ct); L.ct = setTimeout(flushCust, 450); }
    });
    main.addEventListener('focusout', e => { if (e.target.classList.contains('pb-in')) flush(); else if (e.target.tagName === 'TEXTAREA') flushCust(); });
    main.addEventListener('keydown', e => {
      const el = e.target;
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && e.key !== 'Escape') e.stopPropagation();
      if (!el.classList.contains('pb-in')) return;
      const all = ins(), i = all.indexOf(el), empty = x => !x.value.trim();
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nx = e.key === 'Enter' ? (all.slice(i + 1).find(empty) || all.slice(0, i).find(empty)) : all[i + 1];
        const st = main.querySelector('.pb-stop');
        if (nx) nx.focus(); else if (e.key === 'Enter' && st && !st.disabled) st.focus(); else el.blur();
      } else if (e.key === 'ArrowUp' && all[i - 1]) { e.preventDefault(); all[i - 1].focus(); }
    });
    q('.pb-x').addEventListener('click', () => { const v = L.v; if (!v || v.ph === 'setup' || v.ph === 'over') X.leave(); else G.confirmLeave(); });

    api.on(window, 'keydown', e => {
      const v = L.v;
      if (!v || !pane.el.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input,textarea,select,button')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        if (v.ph === 'review' && !me(v).rdy) X.act({ t: 'done' });
        else if (v.ph === 'round' && !me(v).rdy) X.act({ t: 'next' });
        else return;
        e.preventDefault();
      }
    });

    root._pb = { L, X, G, PBC, pbBotWord };
    G.start();
    return { destroy() { clearTimeout(L.pt); clearTimeout(L.ct); G.destroy(); } };
  }

  const PB_CSS = KIT('.gm-petit-bac') + `
.gm-petit-bac{--pc:#ff6b3d}
.gm-petit-bac .pb-app{container-type:inline-size;display:flex;flex-direction:column;gap:10px;width:100%}
.gm-petit-bac .pb-bar{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:12px}
.gm-petit-bac .pb-let{width:58px;height:58px;border-radius:16px;background:linear-gradient(135deg,#ff8a4c,#ff5436);color:#fff;display:grid;place-items:center;box-shadow:var(--sh-2),inset 0 -4px 0 rgba(0,0,0,.14)}
.gm-petit-bac .pb-let b{font:900 34px/1 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.18)}
.gm-petit-bac .pb-let b.pop{animation:pbPop .55s var(--spring)}
@keyframes pbPop{from{transform:scale(.3) rotate(-25deg);opacity:0}}
.gm-petit-bac .pb-info{display:flex;flex-direction:column;gap:3px;min-width:0}
.gm-petit-bac .pb-info .rd{font:900 18px/1.1 var(--sans);letter-spacing:-.01em}
.gm-petit-bac .pb-info .sb{font:800 12px/1.2 var(--sans);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-petit-bac .pb-mid .tm{font:900 26px/1 var(--sans);font-variant-numeric:tabular-nums;min-width:62px;text-align:right;display:block}
.gm-petit-bac .pb-mid .tm.hot{color:var(--bad);animation:pbHot .5s infinite alternate}
@keyframes pbHot{to{transform:scale(1.14)}}
.gm-petit-bac .pb-x{width:40px;height:40px;border-radius:12px;border:2px solid var(--line-2);background:#fff;color:var(--ink-2);display:grid;place-items:center;cursor:pointer;padding:0;transition:border-color .2s,color .2s}
.gm-petit-bac .pb-x:hover{border-color:var(--bad);color:var(--bad)}
.gm-petit-bac .pb-tb{height:4px;border-radius:2px;background:var(--sunk);overflow:hidden;margin-top:-4px}
.gm-petit-bac .pb-tb u{display:block;height:100%;width:0;background:var(--pc);transition:width .3s linear}
.gm-petit-bac .pb-main{position:relative;display:flex;flex-direction:column;gap:12px;min-width:0}
.gm-petit-bac .pb-setup,.gm-petit-bac .pb-res,.gm-petit-bac .pb-over{padding:16px 18px;display:flex;flex-direction:column;gap:10px;width:100%;max-width:720px;margin:0 auto}
.gm-petit-bac .pb-pl{display:flex;flex-wrap:wrap;gap:6px}
.gm-petit-bac .pb-pl .chip i,.gm-petit-bac .pb-mx .chip i{width:9px;height:9px;border-radius:50%}
.gm-petit-bac .pb-pl .chip.me{background:var(--accent-soft);color:var(--accent)}
.gm-petit-bac .pb-pl .chip small{font-weight:700;opacity:.7}
.gm-petit-bac .note{margin:0;font:700 12.5px/1.45 var(--sans);color:var(--ink-2)}
.gm-petit-bac .pb-cu textarea{width:100%;height:auto;min-height:104px;padding:10px 12px;resize:vertical;font:700 14px/1.4 var(--sans)}
.gm-petit-bac .pb-cu .lab{margin-bottom:6px}
.gm-petit-bac .pb-cu .note{margin-top:6px}
.gm-petit-bac .pb-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center;margin-top:4px}
.gm-petit-bac .pb-row .g-btn{flex:1 1 auto;min-width:120px}
.gm-petit-bac .pb-hint{font:800 12.5px/1.2 var(--sans);color:var(--muted)}
.gm-petit-bac .pb-mx{text-align:left;padding:0 4px}
.gm-petit-bac .pb-wheel{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 14px}
.gm-petit-bac .pw-svg{width:min(78vw,340px,100%);height:auto;filter:drop-shadow(0 14px 18px rgba(31,29,43,.28))}
.gm-petit-bac .pw-svg .hub.pop{animation:pbHub .6s var(--spring);transform-origin:150px 150px}
@keyframes pbHub{from{transform:scale(.2)}}
.gm-petit-bac .pb-wt{margin:0;font:900 16px/1 var(--sans);color:var(--ink-2)}
.gm-petit-bac .dots:after{content:"";animation:pbDots 1.2s steps(4) infinite}
@keyframes pbDots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}
.gm-petit-bac .pb-prog{display:flex;flex-wrap:wrap;gap:6px}
.gm-petit-bac .pb-prog .pp{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;background:#fff;border:1px solid var(--line);font:800 12px/1 var(--sans);max-width:100%}
.gm-petit-bac .pb-prog .pp.me{border-color:var(--pc)}
.gm-petit-bac .pb-prog .pp b{max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-petit-bac .pb-prog .pp i{width:46px;height:6px;border-radius:3px;background:var(--sunk);overflow:hidden}
.gm-petit-bac .pb-prog .pp u{display:block;height:100%;transition:width .4s var(--ease)}
.gm-petit-bac .pb-prog .pp em{font-style:normal;color:var(--muted);font-variant-numeric:tabular-nums}
.gm-petit-bac .pb-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:10px}
.gm-petit-bac .pb-card{display:flex;flex-direction:column;gap:5px;padding:10px 12px 12px;border-radius:16px;background:#fff;border:2px solid var(--line);box-shadow:var(--sh-1);transition:border-color .2s,box-shadow .2s}
.gm-petit-bac .pb-card:focus-within{border-color:var(--pc);box-shadow:0 0 0 4px color-mix(in srgb,var(--pc) 18%,transparent),var(--sh-1)}
.gm-petit-bac .pb-card.has{border-color:color-mix(in srgb,var(--good) 55%,#fff)}
.gm-petit-bac .pb-card.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 6%,#fff)}
.gm-petit-bac .pb-card .cn{font:900 11.5px/1.2 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.gm-petit-bac .pb-in{width:100%;height:44px;padding:0 12px;border-radius:12px;border:2px solid var(--line-2);background:var(--sunk);font:800 19px/1 var(--sans);color:var(--ink);outline:0;transition:background .2s,border-color .2s}
.gm-petit-bac .pb-in:focus{background:#fff;border-color:var(--pc)}
.gm-petit-bac .pb-in:read-only{opacity:.75}
.gm-petit-bac .pb-in::placeholder{color:var(--line-2);font-weight:900}
.gm-petit-bac .pb-foot{position:sticky;bottom:calc(6px + env(safe-area-inset-bottom,0px));z-index:5;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;padding:9px 12px;border-radius:20px;background:color-mix(in srgb,#fff 88%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:var(--sh-2)}
.gm-petit-bac .pb-stop{min-width:210px;height:56px;padding:0 28px;border:0;border-radius:16px;cursor:pointer;font:900 24px/1 var(--sans);letter-spacing:.06em;color:#fff;background:linear-gradient(#f0484b,#d62839);box-shadow:0 6px 0 #9b1c2a,0 12px 20px -6px rgba(214,40,57,.6);transition:transform .12s,box-shadow .12s,filter .2s}
.gm-petit-bac .pb-stop:not(:disabled):hover{filter:brightness(1.07)}
.gm-petit-bac .pb-stop:not(:disabled):active{transform:translateY(4px);box-shadow:0 2px 0 #9b1c2a}
.gm-petit-bac .pb-stop:disabled{cursor:not-allowed;filter:grayscale(.85);opacity:.5;box-shadow:0 6px 0 #9aa}
.gm-petit-bac .pb-stop:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.gm-petit-bac .pb-ban{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(28,32,66,.55);border-radius:20px;color:#fff;text-align:center;animation:xpIn .2s}
.gm-petit-bac .pb-ban b{font:900 clamp(44px,12cqw,92px)/1 var(--sans);letter-spacing:.02em;text-shadow:0 6px 0 rgba(0,0,0,.25);animation:pbBan .5s var(--spring)}
.gm-petit-bac .pb-ban span{font:900 22px/1 var(--sans)}
@keyframes pbBan{from{transform:scale(.3) rotate(-8deg);opacity:0}}
.gm-petit-bac .pb-note{padding:11px 14px;display:flex;flex-direction:column;gap:3px}
.gm-petit-bac .pb-note b{font:900 15px/1.2 var(--sans)}
.gm-petit-bac .pb-note span{font:700 12.5px/1.4 var(--sans);color:var(--ink-2)}
.gm-petit-bac .pb-rcs{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:10px}
.gm-petit-bac .pb-rc{padding:10px 12px;border-radius:16px;background:#fff;border:1px solid var(--line);box-shadow:var(--sh-1);display:flex;flex-direction:column;gap:2px;min-width:0}
.gm-petit-bac .pb-rc h4{margin:0 0 4px;font:900 12px/1.2 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.gm-petit-bac .pb-a{display:flex;align-items:center;gap:6px 8px;flex-wrap:wrap;padding:6px 8px;border-radius:10px;border-left:4px solid var(--line-2);background:var(--sunk)}
.gm-petit-bac .pb-a.ok{border-left-color:var(--good);background:color-mix(in srgb,var(--good) 9%,#fff)}
.gm-petit-bac .pb-a.no{border-left-color:var(--bad);background:color-mix(in srgb,var(--bad) 7%,#fff)}
.gm-petit-bac .pb-a.no .tx b{text-decoration:line-through;opacity:.7}
.gm-petit-bac .pb-a.em{opacity:.65}
.gm-petit-bac .pb-a.me .who{color:var(--accent)}
.gm-petit-bac .pb-a .who{flex:0 0 70px;font:900 11.5px/1.1 var(--sans);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-petit-bac .pb-a .tx{flex:1 1 90px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.gm-petit-bac .pb-a .tx b{font:800 15px/1.2 var(--sans);word-break:break-word}
.gm-petit-bac .pb-a .tg{padding:3px 7px;border-radius:999px;font:800 10.5px/1 var(--sans);font-style:normal;white-space:nowrap;background:var(--sunk);color:var(--ink-2)}
.gm-petit-bac .pb-a .tg.s-ok{background:color-mix(in srgb,var(--good) 18%,#fff);color:#16784a}
.gm-petit-bac .pb-a .tg.s-bad{background:color-mix(in srgb,var(--bad) 14%,#fff);color:var(--bad)}
.gm-petit-bac .pb-a .tg.s-unk{background:#fff1d6;color:#a06400}
.gm-petit-bac .pb-a .vt{display:inline-flex;gap:4px}
.gm-petit-bac .vb{display:inline-flex;align-items:center;gap:3px;height:30px;min-width:46px;padding:0 8px;border-radius:9px;border:2px solid var(--line-2);background:#fff;color:var(--ink-2);cursor:pointer;font:800 11.5px/1 var(--sans);justify-content:center;transition:background .15s,border-color .15s,color .15s}
.gm-petit-bac .vb.y:hover,.gm-petit-bac .vb.y.on{border-color:var(--good);color:#16784a;background:color-mix(in srgb,var(--good) 14%,#fff)}
.gm-petit-bac .vb.n:hover,.gm-petit-bac .vb.n.on{border-color:var(--bad);color:var(--bad);background:color-mix(in srgb,var(--bad) 10%,#fff)}
.gm-petit-bac .vb small{font-size:11.5px;font-variant-numeric:tabular-nums}
.gm-petit-bac .pb-a .pt{flex:0 0 36px;text-align:right;font:900 14px/1 var(--sans);font-variant-numeric:tabular-nums;color:var(--muted)}
.gm-petit-bac .pb-a .pt.p10{color:#16784a}.gm-petit-bac .pb-a .pt.p5{color:#c47a00}
.gm-petit-bac .pb-rk{display:grid;grid-template-columns:minmax(70px,1.1fr) minmax(0,2fr) auto auto;align-items:center;gap:10px;padding:6px 4px}
.gm-petit-bac .pb-rk .n{font:800 14px/1.2 var(--sans);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-petit-bac .pb-rk.me .n{color:var(--accent);font-weight:900}
.gm-petit-bac .pb-rk i{height:10px;border-radius:5px;background:var(--sunk);overflow:hidden}
.gm-petit-bac .pb-rk u{display:block;height:100%;border-radius:5px;transition:width .9s var(--ease)}
.gm-petit-bac .pb-rk em{font:900 13px/1 var(--sans);font-style:normal;color:#16784a;min-width:34px;text-align:right}
.gm-petit-bac .pb-rk b{font:900 18px/1 var(--sans);min-width:38px;text-align:right;font-variant-numeric:tabular-nums}
.gm-petit-bac .pb-over{text-align:center;align-items:stretch}
.gm-petit-bac .pb-over .kick{align-self:center;padding:4px 12px;border-radius:999px;background:var(--accent-soft);font:900 12px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.gm-petit-bac .pb-pod{display:flex;justify-content:center;align-items:flex-end;gap:12px;padding:10px 0 4px}
.gm-petit-bac .pd{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;flex:0 1 120px}
.gm-petit-bac .pd .av{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#fff;font:900 22px/1 var(--sans);box-shadow:var(--sh-2)}
.gm-petit-bac .pd b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:900 14px/1.2 var(--sans)}
.gm-petit-bac .pd.me b{color:var(--accent)}
.gm-petit-bac .pd em{font:800 12.5px/1 var(--sans);font-style:normal;color:var(--ink-2)}
.gm-petit-bac .pd i{width:100%;height:var(--h);border-radius:12px 12px 0 0;display:grid;place-items:center;font:900 26px/1 var(--sans);font-style:normal;color:#fff;background:linear-gradient(#b9b4d6,#8d86c9);transform-origin:bottom;animation:pbRise .9s var(--ease) both}
.gm-petit-bac .pd.r1 i{background:linear-gradient(#ffcf4a,#f0a800)}.gm-petit-bac .pd.r2 i{background:linear-gradient(#cfd5e2,#9aa3b8)}.gm-petit-bac .pd.r3 i{background:linear-gradient(#e4a671,#c0763a)}
@keyframes pbRise{from{transform:scaleY(.05)}}
.gm-petit-bac .pb-tw{overflow-x:auto;border-radius:12px;border:1px solid var(--line)}
.gm-petit-bac .pb-tbl{width:100%;border-collapse:collapse;font:800 13px/1.2 var(--sans);font-variant-numeric:tabular-nums}
.gm-petit-bac .pb-tbl th,.gm-petit-bac .pb-tbl td{padding:7px 10px;text-align:center;border-bottom:1px solid var(--line)}
.gm-petit-bac .pb-tbl th{background:var(--sunk);color:var(--muted);font-weight:900}
.gm-petit-bac .pb-tbl td:first-child,.gm-petit-bac .pb-tbl th:first-child{text-align:left;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-petit-bac .pb-tbl tr.me td{background:var(--accent-soft)}
.gm-petit-bac .pb-tbl tr:last-child td{border-bottom:0}
@media (max-width:520px){
.gm-petit-bac .pb-bar{grid-template-columns:auto minmax(0,1fr) auto auto;gap:8px}
.gm-petit-bac .pb-let{width:50px;height:50px;border-radius:14px}.gm-petit-bac .pb-let b{font-size:29px}
.gm-petit-bac .pb-mid .tm{font-size:22px;min-width:48px}
.gm-petit-bac .pb-setup,.gm-petit-bac .pb-res,.gm-petit-bac .pb-over{padding:12px}
.gm-petit-bac .pb-stop{min-width:0;flex:1 1 150px;font-size:21px}
.gm-petit-bac .pb-rk{grid-template-columns:minmax(60px,1fr) minmax(0,1fr) auto auto;gap:6px}
}
`;

  Ameplay.register({
    id: 'petit-bac',
    title: 'Petit Bac',
    category: 'Brain',
    tint: '#ff7a3d',
    blurb: 'Spin the letter wheel, fill every category before the clock runs out and call Stop. Unique answers score 10, shared ones 5. Français ou English.',
    help: 'Type answers · <kbd>Enter</kbd> next box then Stop · vote on answers in the review · solo vs the clock or bots · 2-12 online',
    width: 980,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="8"/><path d="M32 10v7M32 47v7M10 32h7M47 32h7M16.5 16.5l5 5M42.5 42.5l5 5M47.5 16.5l-5 5M21.5 42.5l-5 5"/></svg>',
    css: PB_CSS,
    mount: pbMount
  });

  const BG_NICK = `Kelly's eye|One little duck|Cup of tea|Knock at the door|Man alive|Half a dozen|Lucky seven|Garden gate|Doctor's orders|The big den|Legs eleven|One dozen|Unlucky for some|Valentine's day|Young and keen|Sweet sixteen|Dancing queen|Coming of age|Goodbye teens|One score|Key of the door|Two little ducks|Thee and me|Two dozen|Duck and dive|Pick and mix|Gateway to heaven|In a state|Rise and shine|Dirty Gertie|Get up and run|Buckle my shoe|Dirty knee|Ask for more|Jump and jive|Three dozen|More than eleven|Christmas cake|Steps|Naughty forty|Time for fun|Winnie the Pooh|Down on your knee|Droopy drawers|Halfway there|Up to tricks|Four and seven|Four dozen|Copper|Half a century|Tweak of the thumb|Cheeky chappie|Stuck in the tree|Clean the floor|Snakes alive|Was she worth it|Heinz varieties|Make them wait|Brighton line|Five dozen|Baker's bun|Tickety-boo|Tickle me|Red raw|Old age pension|Clickety click|Made in heaven|Saving grace|Either way up|Three score and ten|Bang on the drum|Six dozen|Queen bee|Candy store|Strive and strive|Trombones|Sunset strip|Heaven's gate|One more time|Eight and blank|Stop and run|Straight on through|Time for tea|Seven dozen|Staying alive|Between the sticks|Torquay in Devon|Two fat ladies|Nearly there|Top of the shop`.split('|');
  const BG_LET = 'BINGO';
  const BG_COL = ['#2f7bf6', '#e5383b', '#8d99ae', '#22b573', '#f2b705'];
  const bgRange = (a, b) => Array.from({ length: b - a + 1 }, (x, i) => a + i);

  const BG_DEF = { mode: '75', pat: 'line', cards: 2, speed: 'normal', bot: 'normal' };
  const BG_SPEED = { slow: 5500, normal: 4000, fast: 2600 };
  const BG_BOT = { slow: [2600, 6800], normal: [900, 3400], fast: [300, 1500] };
  const BG_PTS = { line: 10, two: 15, corners: 10, blackout: 20 };
  const BG_ALLOW = { 75: [1, 2, 4, 6], 90: [1, 2, 3, 6] };
  const bgCfg = o => {
    const c = Object.assign({}, BG_DEF, o || {});
    c.mode = c.mode === '90' ? '90' : '75';
    if (!['line', 'corners', 'blackout', 'classic'].includes(c.pat)) c.pat = 'line';
    c.cards = BG_ALLOW[c.mode].includes(+c.cards) ? +c.cards : 2;
    if (!BG_SPEED[c.speed]) c.speed = 'normal';
    if (!BG_BOT[c.bot]) c.bot = 'normal';
    c.sb = clamp(c.sb == null ? 3 : +c.sb | 0, 1, 5);
    return c;
  };
  const bgStages = o => o.pat !== 'classic' ? [o.pat] : o.mode === '75' ? ['line', 'corners', 'blackout'] : ['line', 'two', 'blackout'];

  const bgCard75 = () => {
    const t = Array(25).fill(0);
    for (let c = 0; c < 5; c++) shuffle(bgRange(c * 15 + 1, c * 15 + 15)).slice(0, 5).forEach((n, r) => { t[r * 5 + c] = n; });
    t[12] = 0;
    return t;
  };
  const bgPlace = cols => {
    for (let a = 0; a < 120; a++) {
      const rc = [0, 0, 0], pick = [];
      let ok = true;
      for (const c of shuffle(bgRange(0, 8)).sort((x, y) => cols[y].length - cols[x].length)) {
        const rows = shuffle([0, 1, 2]).sort((x, y) => rc[x] - rc[y]).slice(0, cols[c].length);
        if (rows.some(r => rc[r] >= 5)) { ok = false; break; }
        rows.forEach(r => { rc[r]++; });
        pick[c] = rows.sort();
      }
      if (!ok || rc.some(x => x !== 5)) continue;
      const t = Array(27).fill(0);
      pick.forEach((rows, c) => rows.forEach((r, j) => { t[r * 9 + c] = cols[c][j]; }));
      return t;
    }
    return null;
  };
  const bgStrip = () => {
    for (;;) {
      const need = [3, 4, 4, 4, 4, 4, 4, 4, 5], C = Array.from({ length: 6 }, () => Array(9).fill(1)), rem = Array(6).fill(6);
      let ok = true;
      for (let c = 0; c < 9 && ok; c++) for (let k = 0; k < need[c]; k++) {
        const cand = bgRange(0, 5).filter(t => rem[t] > 0 && C[t][c] < 3);
        if (!cand.length) { ok = false; break; }
        const mx = Math.max(...cand.map(t => rem[t])), t = rnd(cand.filter(x => rem[x] === mx));
        C[t][c]++; rem[t]--;
      }
      if (!ok || rem.some(x => x)) continue;
      const cols = Array.from({ length: 6 }, () => []);
      for (let c = 0; c < 9; c++) {
        const nums = shuffle(bgRange(c === 0 ? 1 : c * 10, c === 8 ? 90 : c * 10 + 9));
        let p = 0;
        for (let t = 0; t < 6; t++) cols[t][c] = nums.slice(p, p += C[t][c]).sort((a, b) => a - b);
      }
      const tk = cols.map(bgPlace);
      if (tk.every(Boolean)) return tk;
    }
  };

  const BG_GRP = {};
  const bgGroups = (mode, kind) => {
    const k = mode + kind; if (BG_GRP[k]) return BG_GRP[k];
    let g;
    if (mode === '75') {
      const L = [];
      for (let i = 0; i < 5; i++) { L.push(bgRange(0, 4).map(j => i * 5 + j)); L.push(bgRange(0, 4).map(j => j * 5 + i)); }
      L.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
      g = kind === 'corners' ? [[0, 4, 20, 24]] : kind === 'blackout' ? [bgRange(0, 24)] : L;
    } else {
      const rows = [0, 1, 2].map(r => bgRange(0, 8).map(c => r * 9 + c));
      g = kind === 'corners' ? [[0, 8, 18, 26]] : kind === 'blackout' ? [bgRange(0, 26)] : rows;
    }
    if (mode === '90' && kind === 'corners') g = null;
    return BG_GRP[k] = g;
  };
  const bgEdge = (card, r) => { const x = bgRange(0, 8).filter(c => card[r * 9 + c]); return [r * 9 + x[0], r * 9 + x[x.length - 1]]; };
  const bgGrp = (card, mode, kind) => mode === '90' && kind === 'corners' ? [[...bgEdge(card, 0), ...bgEdge(card, 2)]] : bgGroups(mode, kind);
  const bgMiss = (card, set, g) => g.filter(i => card[i] && !set.has(card[i])).length;
  const bgToGo = (card, set, mode, kind) => {
    const m = bgGrp(card, mode, kind).map(g => bgMiss(card, set, g)).sort((a, b) => a - b);
    return kind === 'two' ? m[0] + m[1] : m[0];
  };
  const bgDone = (card, set, mode, kind) => {
    const need = kind === 'two' ? 2 : 1, ok = bgGrp(card, mode, kind).filter(g => !bgMiss(card, set, g));
    return ok.length >= need ? [...new Set([].concat(...ok))].filter(i => card[i]) : null;
  };

  function bgEngine(init) {
    const S = init.S || (() => {
      const o = bgCfg(init.o);
      const P = init.players.map(p => ({ n: clean(p.name, 16) || 'Player', bot: false, hid: p.id || null, cards: [] }));
      const nb = init.solo ? o.sb : (init.bots ? Math.max(0, (init.size || 0) - P.length) : 0);
      botNames(nb, P.map(p => p.n)).forEach(n => P.push({ n, bot: true, hid: null, cards: [] }));
      return { g: 'bg', ph: 'setup', o, P, calls: [], bag: [], nx: 0, dl: 0, stage: 0, stages: bgStages(o), wins: [], sc: P.map(() => 0), lock: P.map(() => 0), mk: P.map(() => []), claim: null, bq: [], ev: [], evn: 0 };
    })();
    const E = { S };
    const max = () => S.o.mode === '90' ? 90 : 75;
    const kind = () => S.stages[S.stage];
    const cset = () => new Set(S.calls);
    const ev = (k, p) => { S.ev.push({ id: ++S.evn, k, p }); S.ev = S.ev.slice(-6); };

    function newGame(now) {
      S.stages = bgStages(S.o);
      S.P.forEach(p => { p.cards = S.o.mode === '90' ? bgStrip().slice(0, S.o.cards) : Array.from({ length: S.o.cards }, bgCard75); });
      S.mk = S.P.map(p => p.cards.map(() => []));
      S.calls = []; S.bag = shuffle(bgRange(1, max())); S.stage = 0; S.wins = []; S.sc = S.P.map(() => 0); S.lock = S.P.map(() => 0);
      S.claim = null; S.bq = []; S.ev = []; S.ph = 'draw'; S.nx = now + 3500; S.dl = 0;
    }
    function sched(now) {
      const set = cset(), [a, b] = BG_BOT[S.o.bot];
      S.P.forEach((p, i) => {
        if (!p.bot || S.bq.some(x => x.p === i)) return;
        if (p.cards.some(c => !bgToGo(c, set, S.o.mode, kind()))) S.bq.push({ at: now + 1500 + a + Math.random() * (b - a), p: i });
      });
      S.bq.sort((x, y) => x.at - y.at);
    }
    function draw(now) {
      if (!S.bag.length) { S.ph = 'over'; S.dl = 0; return; }
      S.calls.push(S.bag.pop());
      S.nx = now + BG_SPEED[S.o.speed];
      sched(now);
    }
    function check(seat) {
      const set = cset(), P = S.P[seat];
      for (let i = 0; i < P.cards.length; i++) { const cells = bgDone(P.cards[i], set, S.o.mode, kind()); if (cells) return { ci: i, cells }; }
      return null;
    }
    function claim(seat, now) {
      const me = S.P[seat];
      if (S.ph === 'verify' && S.claim.w.includes(seat)) return false;
      if (S.lock[seat] > S.calls.length) return false;
      const r = check(seat);
      if (!r) {
        if (me.bot) return false;
        S.lock[seat] = S.calls.length + 3; S.sc[seat] = Math.max(0, S.sc[seat] - 5); ev('bad', seat); return true;
      }
      S.sc[seat] += BG_PTS[kind()]; ev('win', seat);
      if (S.ph === 'verify') { S.claim.w.push(seat); S.wins[S.stage].push(seat); return true; }
      S.ph = 'verify'; S.dl = now + 4800; S.claim = { w: [seat], ci: r.ci, cells: r.cells, st: kind() };
      S.wins[S.stage] = [seat];
      return true;
    }
    function endVerify(now) {
      S.bq = []; S.claim = null;
      if (S.stage + 1 >= S.stages.length) { S.ph = 'over'; S.dl = 0; return; }
      S.stage++; S.ph = 'draw'; S.nx = now + 2600; S.dl = 0; sched(now);
    }

    E.act = (seat, m, now, ld) => {
      const me = S.P[seat];
      if (!me || !m || typeof m !== 'object') return false;
      switch (m.t) {
        case 'opt':
          if (!(S.ph === 'setup' || S.ph === 'over') || !ld || !(m.k in BG_DEF)) return false;
          S.o = bgCfg(Object.assign({}, S.o, { [m.k]: m.v })); return true;
        case 'start':
          if (S.ph !== 'setup' || !ld) return false;
          newGame(now); return true;
        case 'claim':
          if (S.ph !== 'draw' && S.ph !== 'verify') return false;
          return claim(seat, now);
        case 'daub': {
          if (S.ph !== 'draw' && S.ph !== 'verify') return false;
          const c = m.c | 0, i = m.i | 0, card = me.cards[c];
          if (!card || i < 0 || i >= card.length || !card[i] || !S.calls.includes(card[i])) return false;
          const a = S.mk[seat][c], k = a.indexOf(i);
          if (k >= 0) a.splice(k, 1); else a.push(i);
          return 2;
        }
        case 'again':
          if (S.ph !== 'over' || !ld) return false;
          newGame(now); return true;
        case 'setup':
          if (S.ph !== 'over' || !ld) return false;
          S.ph = 'setup'; return true;
      }
      return false;
    };

    E.tick = now => {
      let ch = false;
      if (S.ph === 'draw' || S.ph === 'verify') {
        while (S.bq.length && S.bq[0].at <= now && (S.ph === 'draw' || S.ph === 'verify')) { const b = S.bq.shift(); if (claim(b.p, now)) ch = true; }
      }
      if (S.ph === 'draw' && now >= S.nx) { draw(now); ch = true; }
      else if (S.ph === 'verify' && now >= S.dl) { endVerify(now); ch = true; }
      return ch;
    };

    E.seatOut = i => { const p = S.P[i]; if (!p || p.bot) return; p.bot = true; p.hid = null; };

    E.view = (seat, now) => {
      const set = cset(), mine = S.P[seat] ? S.P[seat].cards : [];
      const st = S.ph === 'draw' || S.ph === 'verify' || S.ph === 'over', k = S.stages[Math.min(S.stage, S.stages.length - 1)];
      const v = {
        g: 'bg', ph: S.ph, o: S.o, calls: S.calls, left: S.bag.length, stage: S.stage, stages: S.stages, kind: k,
        tl: S.ph === 'draw' ? Math.max(0, S.nx - now) : S.ph === 'verify' ? Math.max(0, S.dl - now) : 0,
        P: S.P.map((p, i) => ({ n: p.n, bot: p.bot ? 1 : 0, sc: S.sc[i], nc: p.cards.length, tg: st && p.cards.length ? Math.min(...p.cards.map(c => bgToGo(c, set, S.o.mode, k))) : 0, lk: Math.max(0, S.lock[i] - S.calls.length) })),
        mine, mk: S.mk[seat] || [], wins: S.wins.map(w => w.slice()), ev: S.ev
      };
      if (S.claim) { const w = S.P[S.claim.w[0]]; v.claim = { w: S.claim.w.slice(), card: w.cards[S.claim.ci], cells: S.claim.cells, st: S.claim.st }; }
      return v;
    };
    return E;
  }

  const BG_HOW = `<p><b>Goal.</b> Numbers are drawn one by one. Mark them on your cards and shout <b>BINGO</b> as soon as a card completes the pattern.</p>
<p><b>75-ball (US).</b> 5x5 cards, free centre. Lines run across, down or diagonally. <b>90-ball (UK).</b> 3x9 tickets with 15 numbers each. Six tickets make a strip that holds every number once. A line is one row of five.</p>
<p><b>Patterns.</b> Line, four corners, blackout (every number), or Classic: line, then four corners (UK: two lines), then blackout. Each stage is worth points: 10, 15 or 20.</p>
<p><b>Claims.</b> The host checks your cards against the numbers really called. A good claim shows the winning card to everyone. A false claim costs 5 points and locks your button for 3 balls. Simultaneous claims share the stage.</p>
<p><b>Marking.</b> Auto-daub marks called numbers for you. Switch it off to tap each number yourself, but only once it has been called.</p>
<p><b>Keys.</b> <kbd>B</kbd> or <kbd>Space</kbd> calls Bingo, <kbd>A</kbd> toggles auto-daub, <kbd>V</kbd> toggles the caller voice.</p>
<p><b>Bots.</b> Bots play full cards and call Bingo after a reaction time you can set.</p>`;

  const bgPatName = (k, mode) => ({ line: mode === '90' ? 'One line' : 'Line', two: 'Two lines', corners: 'Four corners', blackout: mode === '90' ? 'Full house' : 'Blackout' }[k]);
  const bgBallCol = (n, mode) => mode === '90' ? ['#2f7bf6', '#e5383b', '#8d99ae', '#22b573', '#f2b705'][Math.min(4, Math.floor((n - 1) / 18))] : BG_COL[Math.floor((n - 1) / 15)];
  const bgSay = (n, mode) => (mode === '75' ? LETW[BG_LET[Math.floor((n - 1) / 15)]] + ' | ' : '') + numTokens(n);
  const bgBall = (n, mode, s) => `<span class="bgb" style="--bc:${bgBallCol(n, mode)};--s:${s}px">${mode === '75' && s > 40 ? `<i class="lt">${BG_LET[Math.floor((n - 1) / 15)]}</i>` : ''}<span class="ds">${n}</span></span>`;

  function bgCardHTML(card, c, mode, extra) {
    const m75 = mode === '75';
    const cells = card.map((n, i) => !n ? (m75 ? `<span class="bc free" data-c="${c}" data-i="${i}"><svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 9.3l7.1-.7z"/></svg></span>` : '<span class="bc blank"></span>') : `<button type="button" class="bc" data-c="${c}" data-i="${i}" aria-label="${n}"><b>${n}</b></button>`).join('');
    return `<div class="bg-card ${m75 ? 'm75' : 'm90'}" data-c="${c}">${extra || ''}${m75 ? `<div class="bh">${[...BG_LET].map((l, k) => `<span style="background:${BG_COL[k]}">${l}</span>`).join('')}</div>` : ''}<div class="bgrid">${cells}</div></div>`;
  }

  function bgMount(root, api) {
    const app = h('div', 'bg-app');
    app.innerHTML = `<div class="bg-bar"><div class="bg-st"><b class="k"></b><span class="s"></span></div><div class="bg-cnt"></div><button type="button" class="bg-x" aria-label="Leave game" title="Leave game"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
<div class="bg-who"></div>
<div class="bg-scr" hidden></div>
<div class="bg-game" hidden>
<div class="bg-left"><div class="bg-call pnl"><div class="bg-cagew"><canvas class="bg-cage"></canvas></div><div class="bg-tray"><div class="bg-cur"></div><div class="bg-nick"></div></div><div class="bg-tmr"><u></u></div><div class="bg-last"></div><div class="bg-tg"><button type="button" class="chip bg-auto"></button><button type="button" class="chip bg-voice"></button></div></div><div class="bg-board pnl"></div></div>
<div class="bg-right"><div class="bg-cards"></div><div class="bg-dots"></div><div class="bg-foot"><button type="button" class="bg-bingo">BINGO!</button><span class="bg-hint"></span></div></div>
<div class="bg-ver" hidden></div></div>`;
    root.append(app);
    app.hidden = true;
    const q = s => app.querySelector(s), scr = q('.bg-scr'), game = q('.bg-game'), cardsEl = q('.bg-cards'), dotsEl = q('.bg-dots'), boardEl = q('.bg-board'), cur = q('.bg-cur'), ver = q('.bg-ver');
    const cvs = q('.bg-cage'), g2 = cvs.getContext('2d');
    const L = { dh: '', v: null, sb: 3, auto: true, voice: true, vis: -1, sched: 0, mk: [], ck: '', bk: '', prev: { ph: '', stage: -1 }, T: { left: 0, at: 0, tot: 0 }, shake: 0, ev: 0, vk: '', ang: 0 };
    try { const s = JSON.parse(localStorage.getItem('gameplay:bingo:pref') || '{}'); if (s.auto === false) L.auto = false; if (s.voice === false) L.voice = false; } catch (e) {}
    const savePref = () => { try { localStorage.setItem('gameplay:bingo:pref', JSON.stringify({ auto: L.auto, voice: L.voice })); } catch (e) {} };

    const G = Glue(root, api, {
      key: 'bingo', title: 'Bingo', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], def: 8, max: 16,
      logo: () => `<svg viewBox="0 0 120 70" width="150" style="display:block;margin:0 auto 6px"><g font-family="var(--sans)" font-weight="900" text-anchor="middle"><circle cx="24" cy="36" r="20" fill="#2f7bf6"/><circle cx="24" cy="36" r="12" fill="#fff"/><text x="24" y="41" font-size="14" fill="#1c2042">7</text><circle cx="60" cy="30" r="22" fill="#e5383b"/><circle cx="60" cy="30" r="13" fill="#fff"/><text x="60" y="36" font-size="16" fill="#1c2042">42</text><circle cx="96" cy="38" r="20" fill="#22b573"/><circle cx="96" cy="38" r="12" fill="#fff"/><text x="96" y="43" font-size="14" fill="#1c2042">58</text></g></svg><div class="kick">Party game</div><h3>Bingo</h3><p>Mark your numbers. Beat the bots and your friends to the call.</p>`,
      how: BG_HOW,
      soloLabel: () => 'Play solo vs ' + L.sb + ' bot' + (L.sb > 1 ? 's' : ''),
      menuExtra: () => `<div class="bg-mx"><div class="opt"><span>Bot players</span>${seg('sb', [[1, '1'], [2, '2'], [3, '3'], [5, '5']], L.sb)}</div></div>`,
      menuBind: el => { if (el._bg) return; el._bg = 1; bindSeg(el, (k, val) => { L.sb = +val; G.menu(); }); },
      build: i => bgEngine({ players: i.players, size: i.size, bots: i.bots, solo: i.solo, o: i.cfg }),
      restore: S => bgEngine({ S }),
      live: S => S.ph === 'draw' || S.ph === 'verify',
      cfg: () => ({ sb: L.sb }),
      resumeInfo: S => `${S.calls.length} balls called, ${bgPatName(S.stages[S.stage], S.o.mode)} stage.`,
      onView: v => render(v),
      onReset: () => { L.v = null; L.vis = -1; L.sched = 0; L.ck = ''; L.prev = { ph: '', stage: -1 }; app.hidden = true; },
      onStart: () => {}
    });
    const X = G.X, sfx = G.sfx, pane = G.pane;
    api.label('Points');

    const me = v => v.P[v.seat] || v.P[0];
    const calledSet = v => new Set(v.calls.slice(0, v.ph === 'draw' ? Math.max(0, L.vis) : v.calls.length));

    /* cage */
    const CS = 220, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = CS * dpr; cvs.height = CS * dpr;
    const R = CS / 2 - 6, balls = Array.from({ length: 24 }, (x, i) => ({ x: CS / 2 + (Math.random() - .5) * 90, y: CS / 2 + Math.random() * 60, vx: (Math.random() - .5) * 160, vy: 0, r: 13, c: BG_COL[i % 5], n: i * 3 % 75 + 1 }));
    function cage(dt) {
      if (!L.v || app.hidden || game.hidden) return;
      L.shake = Math.max(0, L.shake - dt * .9);
      const sh = L.shake, g = 640;
      for (const b of balls) {
        b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (sh > 0) { b.vx += (Math.random() - .5) * sh * 3200 * dt; b.vy -= Math.random() * sh * 2200 * dt; }
        const dx = b.x - CS / 2, dy = b.y - CS / 2, d = Math.hypot(dx, dy);
        if (d > R - b.r) {
          const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
          b.x = CS / 2 + nx * (R - b.r); b.y = CS / 2 + ny * (R - b.r);
          if (vn > 0) { b.vx -= 1.7 * vn * nx; b.vy -= 1.7 * vn * ny; }
        }
      }
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
        if (d < m && d > .01) {
          const nx = dx / d, ny = dy / d, p = (m - d) / 2, rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p;
          if (rv < 0) { a.vx += rv * nx * .9; a.vy += rv * ny * .9; b.vx -= rv * nx * .9; b.vy -= rv * ny * .9; }
        }
      }
      L.ang += dt * (.5 + sh * 9);
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      g2.clearRect(0, 0, CS, CS);
      const gl = g2.createRadialGradient(CS / 2 - 30, CS / 2 - 40, 10, CS / 2, CS / 2, R);
      gl.addColorStop(0, 'rgba(255,255,255,.95)'); gl.addColorStop(1, 'rgba(214,220,255,.55)');
      g2.fillStyle = gl; g2.beginPath(); g2.arc(CS / 2, CS / 2, R, 0, 7); g2.fill();
      for (const b of balls) {
        const gr = g2.createRadialGradient(b.x - 4, b.y - 4, 1, b.x, b.y, b.r);
        gr.addColorStop(0, '#fff'); gr.addColorStop(.25, b.c); gr.addColorStop(1, 'rgba(0,0,0,.55)');
        g2.fillStyle = gr; g2.beginPath(); g2.arc(b.x, b.y, b.r, 0, 7); g2.fill();
      }
      g2.strokeStyle = 'rgba(28,32,66,.55)'; g2.lineWidth = 2;
      for (let k = 0; k < 6; k++) {
        const a = L.ang + k * Math.PI / 6; g2.beginPath();
        g2.ellipse(CS / 2, CS / 2, R * Math.abs(Math.cos(a)), R, 0, 0, 7); g2.stroke();
      }
      g2.lineWidth = 5; g2.strokeStyle = '#1c2042'; g2.beginPath(); g2.arc(CS / 2, CS / 2, R, 0, 7); g2.stroke();
      g2.fillStyle = '#1c2042'; g2.fillRect(CS / 2 - 8, CS - 8, 16, 8);
    }
    api.loop(dt => cage(dt));

    /* calling */
    function announce(k) {
      const v = L.v; if (!v) return;
      const n = v.calls[k - 1], mode = v.o.mode;
      L.shake = 1; sfx.noise(1, .05, 280, .7, 900);
      api.timeout(() => {
        if (!L.v) return;
        cur.innerHTML = `<span class="drop">${bgBall(n, mode, 92)}</span>`;
        q('.bg-nick').textContent = mode === '90' ? BG_NICK[n - 1] || '' : '';
        sfx.tone(320, .16, 'sine', .09, 110);
        if (L.voice) sfx.speak(bgSay(n, mode), { pitch: 108 });
      }, 900);
      api.timeout(() => {
        L.vis = Math.max(L.vis, k);
        const w = L.v; if (w) { upd(w); sfx.tone(900, .04, 'triangle', .03); }
      }, 1500);
    }

    /* views */
    const keyOf = v => v.ph === 'setup' ? 'setup' + v.ld + JSON.stringify(v.o) + v.P.map(p => p.n) : v.ph === 'over' ? 'over' + v.ld + v.P.map(p => p.sc) + v.o.mode : 'g';
    const setupHTML = v => {
      const o = v.o, ld = v.ld;
      const chips = v.P.map((p, i) => `<span class="chip${i === v.seat ? ' me' : ''}">${esc(p.n)}${p.bot ? ' <small>bot</small>' : ''}</span>`).join('');
      const cl = BG_ALLOW[o.mode].map(n => [n, String(n)]);
      const stages = bgStages(o).map(k => bgPatName(k, o.mode)).join(' > ');
      return `<div class="bg-set pnl"><div class="lab">Players</div><div class="bg-pl">${chips}</div>
${ld ? `<div class="bg-opts"><div class="opt"><span>Variant</span>${seg('mode', [['75', '75-ball (US)'], ['90', '90-ball (UK)']], o.mode)}</div>
<div class="opt"><span>Pattern<small>${esc(stages)}</small></span>${seg('pat', [['line', o.mode === '90' ? 'One line' : 'Line'], ['corners', 'Corners'], ['blackout', o.mode === '90' ? 'Full house' : 'Blackout'], ['classic', 'Classic']], o.pat)}</div>
<div class="opt"><span>${o.mode === '90' ? 'Tickets' : 'Cards'} per player</span>${seg('cards', cl, o.cards)}</div>
<div class="opt"><span>Call speed</span>${seg('speed', [['slow', 'Relaxed'], ['normal', 'Normal'], ['fast', 'Fast']], o.speed)}</div>
<div class="opt"><span>Bot reaction</span>${seg('bot', [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Sharp']], o.bot)}</div></div>`
    : `<p class="note">Set by the host: ${o.mode}-ball - ${esc(stages)} - ${o.cards} ${o.mode === '90' ? 'tickets' : 'cards'} - ${o.speed} calls</p>`}
<div class="bg-row">${ld ? '<button type="button" class="g-btn" data-a="start">Start game</button>' : '<span class="chip">Waiting for the host to start</span>'}<button type="button" class="g-btn ghost sm" data-a="leave">Leave</button></div></div>`;
    };
    const overHTML = v => {
      const ord = v.P.map((p, i) => i).sort((a, b) => v.P[b].sc - v.P[a].sc || a - b), top = v.P[ord[0]].sc;
      const mine = me(v), won = mine.sc === top && top > 0;
      return `<div class="bg-set pnl bg-over"><div class="kick">${v.on || v.P.length > 1 ? (won ? 'You win!' : 'Game over') : 'Game over'}</div>
<div class="bg-rk">${ord.map(i => `<div class="rk${i === v.seat ? ' me' : ''}"><span class="n">${esc(v.P[i].n)}${v.P[i].bot ? ' <small>bot</small>' : ''}</span><b>${v.P[i].sc}</b></div>`).join('')}</div>
<div class="lab">Stages</div><div class="bg-wn">${v.stages.map((k, s) => `<div class="w"><b>${bgPatName(k, v.o.mode)}</b><span>${v.wins[s] ? v.wins[s].map(i => esc(v.P[i].n)).join(', ') : 'No winner'}</span></div>`).join('')}</div>
${v.ld ? `<div class="bg-row"><button type="button" class="g-btn" data-a="again">Play again</button><button type="button" class="g-btn ghost" data-a="setup">Settings</button>${v.on ? '<button type="button" class="g-btn ghost" data-a="lobby">Back to lobby</button>' : ''}</div>` : '<p class="note">Waiting for the host to start another game.</p>'}
<div class="bg-row"><button type="button" class="g-btn ghost sm" data-a="leave">Leave</button></div></div>`;
    };

    function buildBoard(v) {
      const m = v.o.mode, bk = m;
      if (L.bk === bk) return; L.bk = bk;
      if (m === '75') boardEl.innerHTML = BG_LET.split('').map((l, r) => `<div class="br"><b style="background:${BG_COL[r]}">${l}</b>${bgRange(r * 15 + 1, r * 15 + 15).map(n => `<i data-n="${n}">${n}</i>`).join('')}</div>`).join('');
      else boardEl.innerHTML = bgRange(0, 8).map(r => `<div class="br b90">${bgRange(1, 10).map(c => { const n = r * 10 + c; return `<i data-n="${n}">${n}</i>`; }).join('')}</div>`).join('');
    }
    function updBoard(v) {
      const set = calledSet(v), last = v.ph === 'draw' ? v.calls[Math.max(0, L.vis) - 1] : v.calls[v.calls.length - 1];
      boardEl.querySelectorAll('i[data-n]').forEach(e => { const n = +e.dataset.n; e.classList.toggle('c', set.has(n)); e.classList.toggle('l', n === last); e.style.setProperty('--bc', set.has(n) ? bgBallCol(n, v.o.mode) : ''); });
    }
    function marked(v, c) {
      const card = v.mine[c], set = calledSet(v);
      return new Set(card.map((n, i) => n && (L.auto ? set.has(n) : (L.mk[c] || []).includes(i)) ? n : 0).filter(Boolean));
    }
    function buildCards(v) {
      const sig = JSON.stringify(v.mine);
      if (sig === L.ck) return; L.ck = sig;
      L.mk = v.mk.map(a => a.slice());
      cardsEl.className = 'bg-cards n' + v.mine.length + ' ' + (v.o.mode === '75' ? 'm75' : 'm90');
      cardsEl.innerHTML = v.mine.map((c, i) => bgCardHTML(c, i, v.o.mode, `<div class="bt"><span>${v.o.mode === '90' ? 'Ticket' : 'Card'} ${i + 1}</span><em></em></div>`)).join('');
    }
    function updCards(v) {
      const dots = [];
      v.mine.forEach((card, c) => {
        const el = cardsEl.children[c]; if (!el) return;
        const mk = marked(v, c);
        el.querySelectorAll('.bc[data-i]').forEach(b => {
          const n = card[+b.dataset.i]; if (!n) return;
          const on = mk.has(n);
          if (on && !b.classList.contains('mk')) { b.classList.add('mk'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
          else if (!on) b.classList.remove('mk', 'pop');
        });
        const tg = bgToGo(card, mk, v.o.mode, v.kind), em = el.querySelector('.bt em');
        em.textContent = tg === 0 ? 'BINGO!' : tg + ' to go';
        el.classList.toggle('rdy', tg === 0);
        el.classList.toggle('near', tg === 1);
        dots[c] = `<button type="button" class="chip${tg === 0 ? ' rdy' : tg === 1 ? ' near' : ''}" data-d="${c}">${c + 1}<small>${tg === 0 ? 'BINGO' : tg}</small></button>`;
      });
      const dh = v.mine.length > 1 ? dots.join('') : '';
      if (dh !== L.dh) { L.dh = dh; dotsEl.innerHTML = dh; }
    }
    function updBtn(v) {
      const m = me(v), b = q('.bg-bingo'), rdy = v.mine.some((c, i) => !bgToGo(c, marked(v, i), v.o.mode, v.kind));
      const locked = m.lk > 0, can = (v.ph === 'draw' || v.ph === 'verify') && !locked;
      b.disabled = !can; b.classList.toggle('rdy', rdy && can);
      b.textContent = locked ? 'Locked' : 'BINGO!';
      q('.bg-hint').textContent = locked ? `False claim: locked for ${m.lk} more ball${m.lk > 1 ? 's' : ''}` : rdy ? 'Your card is complete. Call it!' : L.auto ? '' : 'Tap called numbers to mark them';
    }
    function updWho(v) {
      q('.bg-who').innerHTML = v.P.map((p, i) => `<span class="wp${i === v.seat ? ' me' : ''}${p.tg === 0 && v.ph === 'draw' ? ' hot' : ''}"><b>${esc(p.n)}</b><em>${p.sc}</em>${v.ph === 'draw' || v.ph === 'verify' ? `<small>${p.lk ? 'locked' : p.tg === 0 ? 'BINGO?' : p.tg + ' to go'}</small>` : ''}</span>`).join('');
    }
    function updCall(v) {
      const n = Math.max(0, L.vis), mode = v.o.mode;
      q('.bg-cnt').textContent = v.ph === 'draw' || v.ph === 'verify' ? `Ball ${Math.min(n, v.calls.length)} of ${mode}` : '';
      q('.bg-last').innerHTML = v.calls.slice(Math.max(0, n - 6), Math.max(0, n - 1)).reverse().map(c => bgBall(c, mode, 30)).join('');
      if (!n) { cur.innerHTML = `<span class="eyes">Eyes down!</span>`; q('.bg-nick').textContent = ''; }
      else if (!cur.firstChild || cur.querySelector('.eyes')) { const c = v.calls[n - 1]; cur.innerHTML = bgBall(c, mode, 92); q('.bg-nick').textContent = mode === '90' ? BG_NICK[c - 1] || '' : ''; }
      q('.bg-auto').textContent = 'Auto-daub: ' + (L.auto ? 'on' : 'off');
      q('.bg-voice').textContent = 'Voice: ' + (L.voice ? 'on' : 'off');
    }
    function updVer(v) {
      if (v.ph !== 'verify' || !v.claim) { ver.hidden = true; L.vk = ''; return; }
      const c = v.claim, el = Date.now() - (L.verAt || 0), ok = el > 1500;
      const names = c.w.map(i => esc(v.P[i].n)).join(' and ');
      const key = c.w.join() + c.st + ok;
      ver.hidden = false;
      if (key !== L.vk) {
        L.vk = key;
        const set = new Set(v.calls), cs = new Set(c.cells), card = c.card;
        const m75 = v.o.mode === '75';
        const cells = card.map((n, i) => !n ? (m75 ? '<span class="bc free mk"><b>*</b></span>' : '<span class="bc blank"></span>') : `<span class="bc${set.has(n) ? ' mk' : ''}${ok && cs.has(i) ? ' win' : ''}"><b>${n}</b></span>`).join('');
        ver.innerHTML = `<div class="bg-vb"><div class="lab">${bgPatName(c.st, v.o.mode)}</div><h3>${ok ? 'BINGO!' : 'Checking the card' + '...'}</h3><p>${ok ? `${names} ${c.w.length > 1 ? 'share' : 'wins'} the stage (+${BG_PTS[c.st]} each)` : `The host is checking ${names}'s card against the called numbers`}</p><div class="bg-card ${m75 ? 'm75' : 'm90'} ro">${m75 ? `<div class="bh">${[...BG_LET].map((l, k) => `<span style="background:${BG_COL[k]}">${l}</span>`).join('')}</div>` : ''}<div class="bgrid">${cells}</div></div>${ok ? '' : '<div class="scan"></div>'}</div>`;
        if (ok) sfx.arp([523, 659, 784, 1047, 1319], .1, 'triangle', .06, .3);
      }
    }
    function timer(v) {
      L.T.left = v.tl; L.T.at = performance.now(); L.T.tot = v.ph === 'draw' ? BG_SPEED[v.o.speed] : 0; drawTimer();
    }
    function drawTimer() {
      const v = L.v; if (!v) return;
      const left = L.T.left ? Math.max(0, L.T.left - (performance.now() - L.T.at)) : 0;
      q('.bg-tmr u').style.width = left && L.T.tot ? Math.min(100, left / L.T.tot * 100) + '%' : '0';
      if (v.ph === 'verify') updVer(v);
    }
    api.interval(() => { if (api.paused && X.role === 'local') { L.T.at = performance.now(); return; } drawTimer(); }, 200);

    function upd(v) {
      updBoard(v); updCards(v); updBtn(v); updCall(v);
    }

    function onPhase(v, pv) {
      if ((v.ph === 'draw') && (pv.ph !== 'draw' && pv.ph !== 'verify')) { L.vis = 0; L.sched = 0; L.ck = ''; L.ev = v.ev.length ? v.ev[v.ev.length - 1].id : 0; sfx.arp([392, 523, 659], .1, 'triangle', .05); }
      if (v.ph === 'verify' && pv.ph !== 'verify') { L.verAt = Date.now(); L.vk = ''; L.vis = v.calls.length; L.sched = v.calls.length; sfx.noise(.9, .05, 400, .8, 2200); }
      if (v.ph === 'draw' && pv.ph === 'verify' && pv.stage !== v.stage) { q('.bg-nick').textContent = ''; }
      if (v.ph === 'over' && pv.ph !== 'over') {
        const m = me(v), top = Math.max(...v.P.map(p => p.sc));
        sfx.arp(m.sc === top && top > 0 ? [523, 659, 784, 1047, 1319] : [392, 349, 311, 262], .13, 'triangle', .06, .3);
        if (!v.on) api.submit(m.sc);
      }
    }
    function events(v) {
      v.ev.forEach(e => {
        if (e.id <= L.ev) return;
        L.ev = e.id;
        if (e.k === 'bad') { sfx.tone(180, .3, 'sawtooth', .05, 110); api.toast(e.p === v.seat ? 'False Bingo! Locked for 3 balls (-5 points).' : v.P[e.p].n + ' called a false Bingo.'); }
      });
    }

    function render(v) {
      app.hidden = false;
      const pv = L.prev, changed = v.ph !== pv.ph || v.stage !== pv.stage;
      L.v = v;
      if (L.vis < 0) { L.vis = v.calls.length; L.sched = v.calls.length; L.ev = v.ev.length ? v.ev[v.ev.length - 1].id : 0; }
      if (changed) onPhase(v, pv);
      L.prev = { ph: v.ph, stage: v.stage };
      api.score(me(v).sc);
      const isGame = v.ph === 'draw' || v.ph === 'verify';
      game.hidden = !isGame; scr.hidden = isGame;
      q('.bg-who').hidden = v.ph === 'setup';
      q('.bg-st .k').textContent = v.ph === 'setup' ? 'Bingo' : bgPatName(v.kind, v.o.mode);
      q('.bg-st .s').textContent = v.ph === 'setup' ? (v.o.mode === '90' ? '90-ball' : '75-ball') : v.ph === 'over' ? 'Final scores' : v.stages.length > 1 ? `Stage ${v.stage + 1} of ${v.stages.length}` : (v.o.mode === '90' ? '90-ball' : '75-ball');
      if (isGame) {
        while (L.sched < v.calls.length && v.ph === 'draw') announce(++L.sched);
        buildBoard(v); buildCards(v); upd(v); updWho(v); events(v); updVer(v);
      } else {
        const key = keyOf(v);
        if (key !== L.key) { L.key = key; scr.innerHTML = v.ph === 'setup' ? setupHTML(v) : overHTML(v); }
        if (v.ph === 'over') updWho(v);
      }
      timer(v);
    }

    scr.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'), v = L.v; if (!b || !v) return;
      const a = b.dataset.a;
      if (a === 'start') X.act({ t: 'start' });
      else if (a === 'again') X.act({ t: 'again' });
      else if (a === 'setup') X.act({ t: 'setup' });
      else if (a === 'lobby') X.toLobby();
      else if (a === 'leave') X.leave();
    });
    bindSeg(scr, (k, val) => X.act({ t: 'opt', k, v: val }));
    q('.bg-x').addEventListener('click', () => { const v = L.v; if (!v || v.ph === 'setup' || v.ph === 'over') X.leave(); else G.confirmLeave(); });
    function claim() {
      const v = L.v; if (!v || !(v.ph === 'draw' || v.ph === 'verify') || me(v).lk) return;
      sfx.tone(420, .12, 'square', .05, 840);
      if (L.voice) sfx.speak('b ih n g ow', { pitch: 150, speed: .9 });
      X.act({ t: 'claim' });
    }
    q('.bg-bingo').addEventListener('click', claim);
    q('.bg-auto').addEventListener('click', () => { L.auto = !L.auto; savePref(); if (L.v) { L.ck = ''; buildCards(L.v); upd(L.v); } });
    q('.bg-voice').addEventListener('click', () => { L.voice = !L.voice; savePref(); if (L.v) updCall(L.v); });
    dotsEl.addEventListener('click', e => { const b = e.target.closest('[data-d]'), el = b && cardsEl.children[+b.dataset.d]; if (el) cardsEl.scrollTo({ left: el.offsetLeft - cardsEl.offsetLeft, behavior: reduced() ? 'auto' : 'smooth' }); });
    cardsEl.addEventListener('click', e => {
      const b = e.target.closest('button.bc'), v = L.v; if (!b || !v || v.ph !== 'draw') return;
      const c = +b.dataset.c, i = +b.dataset.i, n = v.mine[c][i];
      if (L.auto) return;
      if (!calledSet(v).has(n)) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); sfx.tone(160, .12, 'sawtooth', .03); return; }
      const a = L.mk[c] || (L.mk[c] = []), k = a.indexOf(i);
      if (k >= 0) a.splice(k, 1); else a.push(i);
      sfx.tone(k >= 0 ? 300 : 520, .06, 'triangle', .05);
      X.act({ t: 'daub', c, i });
      upd(v);
    });
    api.on(window, 'keydown', e => {
      const v = L.v;
      if (!v || !pane.el.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input,textarea,select,button')) return;
      const k = e.key.toLowerCase();
      if (k === 'b' || k === ' ' || k === 'enter') { if (v.ph === 'draw' || v.ph === 'verify') { claim(); e.preventDefault(); } }
      else if (k === 'a') q('.bg-auto').click();
      else if (k === 'v') q('.bg-voice').click();
    });

    root._bg = { L, X, G };
    G.start();
    return { destroy() { G.destroy(); } };
  }

  const BG_CSS = KIT('.gm-bingo') + `
.gm-bingo .bg-app{container-type:inline-size;display:flex;flex-direction:column;gap:10px;width:100%}
.gm-bingo .bg-bar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px}
.gm-bingo .bg-st{display:flex;flex-direction:column;gap:3px;min-width:0}
.gm-bingo .bg-st .k{font:900 20px/1.1 var(--sans);letter-spacing:-.01em}
.gm-bingo .bg-st .s{font:800 12px/1.2 var(--sans);color:var(--muted)}
.gm-bingo .bg-cnt{font:900 14px/1 var(--sans);color:var(--ink-2);font-variant-numeric:tabular-nums}
.gm-bingo .bg-x{width:40px;height:40px;border-radius:12px;border:2px solid var(--line-2);background:#fff;color:var(--ink-2);display:grid;place-items:center;cursor:pointer;padding:0;transition:border-color .2s,color .2s}
.gm-bingo .bg-x:hover{border-color:var(--bad);color:var(--bad)}
.gm-bingo .bg-who{display:flex;flex-wrap:wrap;gap:6px}
.gm-bingo .wp{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:#fff;border:1px solid var(--line);font:800 12.5px/1 var(--sans);max-width:100%}
.gm-bingo .wp.me{border-color:var(--accent);background:var(--accent-soft)}
.gm-bingo .wp b{max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-bingo .wp em{font-style:normal;font-variant-numeric:tabular-nums;color:var(--accent)}
.gm-bingo .wp small{font:800 11px/1 var(--sans);color:var(--muted)}
.gm-bingo .wp.hot small{color:#d6891a;animation:bgBl .8s infinite alternate}
@keyframes bgBl{to{opacity:.35}}
.gm-bingo .bg-scr{display:flex;flex-direction:column;align-items:center}
.gm-bingo .bg-set{padding:16px 18px;display:flex;flex-direction:column;gap:10px;width:100%;max-width:700px}
.gm-bingo .bg-pl{display:flex;flex-wrap:wrap;gap:6px}
.gm-bingo .bg-pl .chip.me{background:var(--accent-soft);color:var(--accent)}
.gm-bingo .bg-pl small{opacity:.7}
.gm-bingo .note{margin:0;font:700 12.5px/1.45 var(--sans);color:var(--ink-2)}
.gm-bingo .bg-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center;margin-top:4px}
.gm-bingo .bg-row .g-btn{flex:1 1 auto;min-width:120px}
.gm-bingo .bg-mx{text-align:left;padding:0 4px}
.gm-bingo .bg-over{text-align:center}
.gm-bingo .bg-over .kick{align-self:center;padding:4px 12px;border-radius:999px;background:var(--accent-soft);font:900 12px/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.gm-bingo .bg-rk{display:flex;flex-direction:column;gap:6px}
.gm-bingo .bg-rk .rk{display:flex;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:12px;background:var(--sunk);font:800 15px/1.2 var(--sans)}
.gm-bingo .bg-rk .rk:first-child{background:linear-gradient(90deg,#fff1c2,#ffe08a)}
.gm-bingo .bg-rk .rk.me .n{color:var(--accent)}
.gm-bingo .bg-rk .rk b{font-variant-numeric:tabular-nums;font-size:18px}
.gm-bingo .bg-wn{display:flex;flex-direction:column;gap:4px;text-align:left}
.gm-bingo .bg-wn .w{display:flex;justify-content:space-between;gap:10px;font:700 13.5px/1.3 var(--sans);padding:4px 2px;border-bottom:1px solid var(--line)}
.gm-bingo .bg-game{position:relative;display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
@container (min-width:780px){.gm-bingo .bg-game{grid-template-columns:minmax(250px,320px) minmax(0,1fr)}}
.gm-bingo .bg-left,.gm-bingo .bg-right{display:flex;flex-direction:column;gap:12px;min-width:0}
.gm-bingo .bg-call{padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px}
.gm-bingo .bg-cagew{width:min(100%,220px);aspect-ratio:1}
.gm-bingo .bg-cage{display:block;width:100%;height:100%}
.gm-bingo .bg-tray{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:118px;justify-content:center}
.gm-bingo .bg-nick{min-height:18px;font:800 14px/1.2 var(--sans);color:var(--ink-2);text-align:center}
.gm-bingo .eyes{font:900 22px/1.1 var(--sans);color:var(--accent);animation:bgBl 1s infinite alternate}
.gm-bingo .bgb{position:relative;display:inline-grid;place-items:center;width:var(--s,88px);height:var(--s,88px);border-radius:50%;background:radial-gradient(circle at 50% 50%,var(--bc) 60%,color-mix(in srgb,var(--bc) 60%,#000) 100%);box-shadow:inset -6px -8px 14px rgba(0,0,0,.3),inset 5px 6px 10px rgba(255,255,255,.4),0 8px 16px -6px rgba(0,0,0,.45);flex:none}
.gm-bingo .bgb .ds{width:64%;height:64%;border-radius:50%;background:#fff;display:grid;place-items:center;font:900 calc(var(--s,88px)*.3)/1 var(--sans);color:#1c2042;box-shadow:inset 0 0 0 2px rgba(0,0,0,.08)}
.gm-bingo .bgb .lt{position:absolute;top:7%;left:0;right:0;text-align:center;font:900 calc(var(--s,88px)*.15)/1 var(--sans);font-style:normal;color:#fff}
.gm-bingo .drop{display:inline-block;animation:bgDrop .75s cubic-bezier(.3,1.4,.5,1) both}
@keyframes bgDrop{0%{transform:translateY(-130px) scale(.35) rotate(-200deg);opacity:0}30%{opacity:1}100%{transform:none}}
.gm-bingo .bg-tmr{width:100%;height:4px;border-radius:2px;background:var(--sunk);overflow:hidden}
.gm-bingo .bg-tmr u{display:block;height:100%;width:0;background:var(--accent);transition:width .25s linear}
.gm-bingo .bg-last{display:flex;gap:5px;justify-content:center;min-height:30px;flex-wrap:wrap}
.gm-bingo .bg-last .bgb{opacity:.9}
.gm-bingo .bg-last .bgb .ds{font-size:11px}
.gm-bingo .bg-tg{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.gm-bingo .bg-tg .chip{border:0;cursor:pointer;font-family:inherit;transition:background .2s}
.gm-bingo .bg-tg .chip:hover{background:var(--accent-soft);color:var(--accent)}
.gm-bingo .bg-board{padding:8px;display:flex;flex-direction:column;gap:3px}
.gm-bingo .br{display:grid;grid-template-columns:22px repeat(15,minmax(0,1fr));gap:2px;align-items:center}
.gm-bingo .br.b90{grid-template-columns:repeat(10,minmax(0,1fr))}
.gm-bingo .br b{display:grid;place-items:center;height:20px;border-radius:5px;color:#fff;font:900 11px/1 var(--sans)}
.gm-bingo .br i{display:grid;place-items:center;height:20px;border-radius:5px;background:var(--sunk);color:var(--muted);font:800 10.5px/1 var(--sans);font-style:normal;font-variant-numeric:tabular-nums;transition:background .3s,color .3s}
.gm-bingo .br i.c{background:var(--bc);color:#fff}
.gm-bingo .br i.l{outline:2px solid #1c2042;outline-offset:1px;animation:bgBl .6s infinite alternate}
.gm-bingo .bg-cards{order:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,235px),1fr));gap:12px}
.gm-bingo .bg-cards.m90{grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.gm-bingo .bg-cards.n1{grid-template-columns:minmax(0,420px);justify-content:center}
.gm-bingo .bg-cards.m90.n1{grid-template-columns:minmax(0,560px)}
.gm-bingo .bg-card{padding:8px;border-radius:16px;background:#fff;border:2px solid var(--line);box-shadow:var(--sh-1);transition:border-color .3s,box-shadow .3s}
.gm-bingo .bg-card.near{border-color:#f2b705}
.gm-bingo .bg-card.rdy{border-color:var(--good);box-shadow:0 0 0 4px color-mix(in srgb,var(--good) 25%,transparent),var(--sh-2)}
.gm-bingo .bt{display:flex;justify-content:space-between;font:900 11px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:0 2px 6px}
.gm-bingo .bt em{font-style:normal;color:var(--ink-2)}
.gm-bingo .bg-card.rdy .bt em{color:var(--good)}
.gm-bingo .bh{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:4px}
.gm-bingo .bh span{display:grid;place-items:center;height:26px;border-radius:8px;color:#fff;font:900 16px/1 var(--sans)}
.gm-bingo .bgrid{display:grid;gap:4px}
.gm-bingo .m75 .bgrid{grid-template-columns:repeat(5,minmax(0,1fr))}
.gm-bingo .m90 .bgrid{grid-template-columns:repeat(9,minmax(0,1fr));gap:3px}
.gm-bingo .bc{position:relative;display:grid;place-items:center;aspect-ratio:1.12;min-width:0;padding:0;border-radius:10px;border:2px solid var(--line-2);background:#fff;color:var(--ink);cursor:pointer;font-family:inherit;overflow:hidden;transition:border-color .15s}
.gm-bingo .m90 .bc{aspect-ratio:.86;border-radius:7px;border-width:1.5px}
.gm-bingo .bc b{position:relative;z-index:1;font:900 clamp(15px,4.6cqw,24px)/1 var(--sans);font-variant-numeric:tabular-nums}
.gm-bingo .m90 .bc b{font-size:clamp(12px,2.6cqw,19px)}
.gm-bingo .bc:hover{border-color:var(--accent)}
.gm-bingo .bc.free{background:#ffe08a;color:#c47a00;cursor:default;border-color:#f2b705}
.gm-bingo .bc.blank{background:repeating-linear-gradient(135deg,#f3f1fa 0 5px,#e9e6f5 5px 10px);border-color:var(--line);cursor:default}
.gm-bingo .bc.mk:not(.free){border-color:#e5383b}
.gm-bingo .bc.mk:not(.free):after{content:"";position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,120,130,.8),rgba(229,56,59,.7));box-shadow:0 0 0 2px rgba(229,56,59,.4)}
.gm-bingo .bc.mk:not(.free) b{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.gm-bingo .bc.pop:after{animation:bgStamp .35s var(--spring)}
@keyframes bgStamp{from{transform:scale(2.2);opacity:0}}
.gm-bingo .bc.no{animation:bgNo .3s}
@keyframes bgNo{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.gm-bingo .bc.win{border-color:#f2b705;animation:bgWin .6s infinite alternate}
@keyframes bgWin{to{box-shadow:0 0 0 3px #f2b705,0 0 14px 2px rgba(242,183,5,.7)}}
.gm-bingo .bg-dots{display:none;gap:6px;flex-wrap:wrap;justify-content:center}
.gm-bingo .bg-dots .chip{border:0;cursor:pointer;font-family:inherit;display:inline-flex;gap:6px;align-items:center}
.gm-bingo .bg-dots .chip small{font:800 10.5px/1 var(--sans);color:var(--muted)}
.gm-bingo .bg-dots .chip small:before{content:'\\B7  '}
.gm-bingo .bg-dots .chip.near{background:#fff3c4}
.gm-bingo .bg-dots .chip.rdy{background:var(--good);color:#fff}
.gm-bingo .bg-dots .chip.rdy small{color:#fff}
.gm-bingo .bg-foot{order:3;position:relative;z-index:5;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;padding:9px 12px;border-radius:20px;background:color-mix(in srgb,#fff 88%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid var(--line);box-shadow:var(--sh-2)}
.gm-bingo .bg-bingo{min-width:220px;height:58px;padding:0 30px;border:0;border-radius:16px;cursor:pointer;font:900 26px/1 var(--sans);letter-spacing:.08em;color:#fff;background:linear-gradient(#2fc486,#1a9e68);box-shadow:0 6px 0 #11724b,0 12px 20px -6px rgba(26,158,104,.6);transition:transform .12s,box-shadow .12s,filter .2s}
.gm-bingo .bg-bingo:not(:disabled):active{transform:translateY(4px);box-shadow:0 2px 0 #11724b}
.gm-bingo .bg-bingo:disabled{cursor:not-allowed;filter:grayscale(.85);opacity:.5}
.gm-bingo .bg-bingo.rdy{animation:bgRdy .7s infinite alternate}
@keyframes bgRdy{to{transform:scale(1.07);filter:brightness(1.12)}}
.gm-bingo .bg-bingo:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.gm-bingo .bg-hint{font:800 12.5px/1.2 var(--sans);color:var(--muted);max-width:240px}
.gm-bingo .bg-ver{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;padding:10px;background:rgba(246,244,255,.9);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:20px;animation:xpIn .25s var(--ease)}
.gm-bingo .bg-vb{width:100%;max-width:440px;margin:auto;text-align:center;background:#fff;border:1px solid var(--line);border-radius:22px;padding:16px;box-shadow:var(--sh-3);animation:xbIn .45s var(--spring);position:relative;overflow:hidden}
.gm-bingo .bg-vb h3{margin:4px 0 6px;font:900 30px/1.05 var(--sans);letter-spacing:-.02em}
.gm-bingo .bg-vb p{margin:0 0 10px;font:700 14px/1.4 var(--sans);color:var(--ink-2)}
.gm-bingo .bg-vb .bg-card{box-shadow:none;max-width:400px;margin:0 auto}
.gm-bingo .bg-vb .bc{cursor:default}
.gm-bingo .scan{position:absolute;left:0;right:0;height:46px;background:linear-gradient(transparent,rgba(61,139,255,.28),transparent);animation:bgScan 1.2s linear infinite}
@keyframes bgScan{from{top:-46px}to{top:100%}}
@container (max-width:779px){
.gm-bingo .bg-right{gap:8px}
.gm-bingo .bg-foot{order:1;padding:7px 10px}
.gm-bingo .bg-dots{order:2;display:flex}
.gm-bingo .bg-cards{order:3;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;padding:2px 2px 8px;scrollbar-width:thin}
.gm-bingo .bg-card{flex:0 0 100%;scroll-snap-align:center;min-width:0}
.gm-bingo .bg-left{display:contents}
.gm-bingo .bg-call{order:1;display:grid;grid-template-columns:128px minmax(0,1fr);grid-template-areas:"cg tr" "cg lt" "cg tg" "tm tm";column-gap:12px;align-items:center;justify-items:center}
.gm-bingo .bg-cagew{grid-area:cg;width:128px}
.gm-bingo .bg-tray{grid-area:tr;min-height:100px}
.gm-bingo .bg-last{grid-area:lt}
.gm-bingo .bg-tg{grid-area:tg}
.gm-bingo .bg-tmr{grid-area:tm}
.gm-bingo .bg-right{order:2}
.gm-bingo .bg-board{order:3}
}
@media (max-width:520px){
.gm-bingo .bg-set{padding:12px}
.gm-bingo .bg-bingo{min-width:0;flex:1 1 160px;font-size:23px}
.gm-bingo .br{grid-template-columns:18px repeat(15,minmax(0,1fr));gap:1px}
.gm-bingo .br i{height:17px;font-size:9px}
.gm-bingo .br b{height:17px;font-size:10px}
.gm-bingo .bg-call{grid-template-columns:104px minmax(0,1fr)}
.gm-bingo .bg-cagew{width:104px}
}
`;

  Ameplay.register({
    id: 'bingo',
    title: 'Bingo',
    category: 'Board',
    tint: '#e5383b',
    blurb: 'Classic 75-ball and 90-ball Bingo with a tumbling ball cage and a talking caller. Several cards, line, corners or blackout, bots and friends.',
    help: '<kbd>B</kbd> or <kbd>Space</kbd> call Bingo · <kbd>A</kbd> auto-daub · <kbd>V</kbd> caller voice · tap numbers when auto-daub is off · 2-16 online',
    width: 1040,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="11"/><path d="M27 32h10M32 27v10" opacity=".0"/><path d="M29 28l3-3v14"/></svg>',
    css: BG_CSS,
    mount: bgMount
  });
})();
