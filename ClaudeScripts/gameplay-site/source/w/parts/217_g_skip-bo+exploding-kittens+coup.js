(() => {
  'use strict';
  const R = n => Math.floor(Math.random() * n);
  const pick = a => a[R(a.length)];
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const css = s => s.replace(/(-?\d*\.?\d+)([ut])\b/g, (m, n, k) => k === 'u' ? `calc(var(--u)*${n})` : `max(11px,calc(var(--u)*${n}))`);
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const BOTNAMES = ['Milo', 'Luna', 'Pixel', 'Juno', 'Biscuit', 'Nova', 'Tango', 'Olive', 'Pepper', 'Ziggy', 'Mochi', 'Rusty', 'Willow', 'Sprout', 'Echo', 'Fable'];
  const AVC = ['#e5484d', '#3e8ef7', '#2fb36d', '#f5a524', '#9b5de5', '#f15bb5', '#00b8d9', '#8d6e63'];
  const avatar = (name, i) => `<span class="av" style="background:${AVC[i % AVC.length]}">${esc(String(name || '?').trim().charAt(0).toUpperCase())}</span>`;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const now = () => Date.now();

  const ICON_MENU = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';

  function mkSnd(api) {
    let ac = null, mst = null, nb = null;
    const get = () => {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        mst = ac.createGain(); mst.gain.value = .55; mst.connect(ac.destination);
        nb = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const tone = (f, d, type, v, t0, f2) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (t0 || 0);
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .1, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(mst); o.start(t); o.stop(t + d + .03);
    };
    const noise = (d, f, q, v, t0, f2) => {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + (t0 || 0);
      s.buffer = nb; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + d); bp.Q.value = q || 1;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .1, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(bp); bp.connect(g); g.connect(mst); s.start(t); s.stop(t + d + .03);
    };
    const T = {
      tap: () => tone(660, .05, 'sine', .07),
      tick: () => tone(1200, .025, 'square', .03),
      card: () => { noise(.09, 2600, .7, .22, 0, 1200); tone(180, .05, 'triangle', .05); },
      deal: () => noise(.05, 3200, 1, .18),
      flip: () => { noise(.06, 4000, 1, .15); tone(900, .04, 'square', .03); },
      coin: () => { tone(1319, .08, 'square', .05); tone(1976, .18, 'square', .05, .06); },
      good: () => { tone(660, .1, 'sine', .08); tone(990, .14, 'sine', .08, .08); },
      bad: () => tone(220, .22, 'triangle', .1, 0, 110),
      win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .28, 'triangle', .09, i * .12)),
      lose: () => { tone(330, .3, 'sine', .1, 0, 160); tone(247, .45, 'sine', .1, .25, 120); },
      whoosh: () => noise(.28, 600, .6, .2, 0, 3200),
      boom: () => { noise(.8, 180, .4, .7, 0, 50); tone(90, .55, 'sawtooth', .3, 0, 30); },
      meow: () => { tone(520, .14, 'sawtooth', .045, 0, 900); tone(900, .26, 'sawtooth', .045, .1, 520); },
      nope: () => { tone(190, .16, 'square', .08, 0, 100); tone(150, .22, 'square', .08, .12, 70); },
      buzz: () => tone(110, .28, 'sawtooth', .09),
      zap: () => tone(1500, .2, 'sawtooth', .06, 0, 200),
      shuffle: () => range(0, 6).forEach(i => noise(.07, 2200 + i * 150, .8, .16, i * .06)),
      stab: () => { noise(.14, 1800, 2, .32); tone(420, .12, 'sawtooth', .1, 0, 100); },
      reveal: () => { tone(300, .25, 'sine', .08, 0, 640); tone(640, .2, 'sine', .07, .18); },
      drum: () => tone(120, .18, 'sine', .22, 0, 55),
      clear: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .07)),
      fuse: () => noise(.5, 5000, 3, .12, 0, 2500),
      defuse: () => { tone(880, .06, 'square', .06); tone(1320, .12, 'square', .06, .09); noise(.2, 2500, 1, .1, .1); },
      crystal: () => [1047, 1319, 1568].forEach((f, i) => tone(f, .35, 'sine', .06, i * .09))
    };
    return n => { if (!get()) return; try { if (T[n]) T[n](); } catch (e) {} };
  }

  const BASE = id => css(`
.gm-${id}{gap:0}
.gm-${id} [hidden]{display:none!important}
.gm-${id} button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-${id} .tb{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(10,20,30,.3);container-type:size;background:var(--tbg,#145c32);touch-action:manipulation}
.gm-${id} .tb-in{--u:1cqw;position:absolute;inset:0;font-family:var(--sans);color:#fff;font-size:1.5t;line-height:1.2}
.gm-${id} .tb-board{position:absolute;inset:0}
.gm-${id} .tb-fly{position:absolute;pointer-events:none;z-index:40;will-change:transform}
.gm-${id} .tb-hud{position:absolute;left:1u;top:1u;display:flex;align-items:center;gap:1u;z-index:30;pointer-events:none}
.gm-${id} .tb-hud>*{pointer-events:auto}
.gm-${id} .tb-ico{width:5.2u;height:5.2u;min-width:30px;min-height:30px;border-radius:30%;border:2px solid rgba(255,255,255,.28);background:rgba(0,0,0,.32);color:#fff;display:grid;place-items:center;padding:.9u}
.gm-${id} .tb-net{display:flex;align-items:center;gap:.6u;padding:.5u 1.1u;border-radius:1.4u;background:rgba(0,0,0,.36);font:800 1.4t var(--sans)}
.gm-${id} .tb-net i{width:.9u;height:.9u;min-width:7px;min-height:7px;border-radius:50%;background:#5be27a}
.gm-${id} .tb-net.bad i{background:#ff5b4b}
.gm-${id} .tb-pane{position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:1.5u;background:rgba(5,10,18,.62);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-${id} .tb-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-${id} .tb-pane.solid{background:var(--tbg2,var(--tbg));-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-${id} .tb-box{width:100%;max-width:44u;margin:auto;background:linear-gradient(#2a3552,#161d33);border:3px solid rgba(255,255,255,.16);border-radius:2.4u;padding:2u 2u 1.6u;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:tbin .35s cubic-bezier(.2,1.4,.4,1)}
.gm-${id} .tb-box.wide{max-width:58u}
@keyframes tbin{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.gm-${id} .tb-box h3{margin:.2u 0 1u;font:900 2.6t var(--sans);letter-spacing:.2px}
.gm-${id} .tb-box p{margin:.7u 0;font:700 1.6t/1.4 var(--sans);color:rgba(255,255,255,.88)}
.gm-${id} .tb-kick{font:900 1.3t var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--a2,#fcc916)!important;margin:0 0 .2u!important}
.gm-${id} .tb-big{display:block;width:100%;min-height:6u;margin:1u 0;border:0;border-radius:1.8u;color:#fff;font:900 2.2t/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:.7u 1u;background:var(--a1,#d33)}
.gm-${id} .tb-big:active{transform:translateY(2px)}
.gm-${id} .tb-big small{display:block;font:800 1.3t var(--sans);opacity:.9;text-shadow:none;margin-top:.3u}
.gm-${id} .tb-big.b{background:var(--b1,#2a8)}
.gm-${id} .tb-big.c{background:var(--a2,#fcc916);color:#221a00;text-shadow:none}
.gm-${id} .tb-sm{min-height:4.6u;min-width:44px;padding:0 1.6u;border-radius:1.4u;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 1.5t var(--sans);margin:.4u}
.gm-${id} .tb-sm:disabled{opacity:.4}
.gm-${id} .tb-row{display:flex;justify-content:center;flex-wrap:wrap;gap:.4u}
.gm-${id} .tb-opt{display:flex;align-items:center;gap:1u;margin:.9u 0;text-align:left}
.gm-${id} .tb-opt>span{flex:0 0 32%;font:800 1.5t/1.2 var(--sans);color:rgba(255,255,255,.88)}
.gm-${id} .tb-opt>span small{display:block;font:700 1.2t/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:.2u}
.gm-${id} .tb-seg{flex:1;display:flex;gap:.5u}
.gm-${id} .tb-seg button{flex:1;min-height:4.6u;min-width:30px;border-radius:1.2u;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 1.5t var(--sans);padding:0 .4u}
.gm-${id} .tb-seg button.on{background:var(--a2,#fcc916);border-color:#fff;color:#1b1b1f}
.gm-${id} .tb-title{width:100%;max-width:40u;text-align:center}
.gm-${id} .tb-tag{font:800 1.6t var(--sans);color:rgba(255,255,255,.88);margin:.6u 0 .8u;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-${id} .tb-rec{font:800 1.3t var(--sans)!important;color:rgba(255,255,255,.6)!important}
.gm-${id} .tb-rules{text-align:left}
.gm-${id} .tb-rules p{font:700 1.45t/1.45 var(--sans)!important;margin:.6u 0}
.gm-${id} .tb-rules h4{margin:1.2u 0 .2u;font:900 1.5t var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:var(--a2,#fcc916)}
.gm-${id} .tb-tbl{width:100%;border-collapse:collapse;margin:.8u 0;font:800 1.5t var(--sans)}
.gm-${id} .tb-tbl td{padding:.5u .4u;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-${id} .tb-tbl td:first-child{text-align:left}
.gm-${id} .tb-tbl tr.win td{color:var(--a2,#fcc916)}
.gm-${id} .av{display:inline-grid;place-items:center;width:3u;height:3u;min-width:20px;min-height:20px;border-radius:50%;border:2px solid #fff;color:#fff;font:900 1.4t var(--sans);text-shadow:0 1px 1px rgba(0,0,0,.4);flex:none}
.gm-${id} .tb-wait{display:inline-block;width:3u;height:3u;border-radius:50%;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;animation:tbspin 1s linear infinite;margin:.6u}
@keyframes tbspin{to{transform:rotate(360deg)}}
.gm-${id} .tb.port .tb-hud{left:1.5u;top:1.5u}
.gm-${id} .tb.port .tb-ico{width:8u;height:8u}
.gm-${id} .tb.port .tb-net{font-size:3t}
.gm-${id} .tb.port .tb-box{max-width:96u;padding:4u 4u 3.4u;border-radius:5u}
.gm-${id} .tb.port .tb-box h3{font-size:5.8t}
.gm-${id} .tb.port .tb-box p,.gm-${id} .tb.port .tb-opt>span,.gm-${id} .tb.port .tb-seg button,.gm-${id} .tb.port .tb-sm{font-size:3.6t}
.gm-${id} .tb.port .tb-big{font-size:5t;min-height:13u;border-radius:4u}
.gm-${id} .tb.port .tb-big small{font-size:3.3t}
.gm-${id} .tb.port .tb-title{max-width:92u}
.gm-${id} .tb.port .tb-tag{font-size:3.8t}
.gm-${id} .tb.port .tb-rec,.gm-${id} .tb.port .tb-kick{font-size:3.2t!important}
.gm-${id} .tb.port .tb-rules p{font-size:3.4t!important}
.gm-${id} .tb.port .tb-rules h4{font-size:3.4t}
.gm-${id} .tb.port .tb-tbl{font-size:3.6t}
.gm-${id} .tb.port .tb-seg button{min-height:9.5u}
.gm-${id} .tb.port .av{width:6u;height:6u;font-size:3t}
@media (prefers-reduced-motion:reduce){.gm-${id} *{animation-duration:.01s!important}}
`);

  function table(S) {
    return function mount(root, api) {
      const opt = Object.assign({ mode: 'cpu', bots: S.defBots, diff: 'Normal', wins: 0, games: 0 }, S.optDef || {}, api.load() || {});
      if (opt.mode !== 'cpu' && opt.mode !== 'online') opt.mode = 'cpu';
      opt.bots = Math.max(1, Math.min(S.max - 1, +opt.bots || S.defBots));
      if (!DIFFS.includes(opt.diff)) opt.diff = 'Normal';
      const saveOpt = () => api.save(opt);
      const snd = mkSnd(api);

      const wrap = mk('div', 'tb'), inn = mk('div', 'tb-in'), board = mk('div', 'tb-board'), hud = mk('div', 'tb-hud'), pane = mk('div', 'tb-pane');
      hud.innerHTML = `<button class="tb-ico" data-h="menu" aria-label="Menu" hidden>${ICON_MENU}</button><div class="tb-net" hidden><i></i><span></span></div>`;
      pane.hidden = true;
      inn.append(board, hud, pane); wrap.append(inn); root.append(wrap);
      const bMenu = hud.querySelector('[data-h=menu]'), netEl = hud.querySelector('.tb-net');

      const M = { mode: 'cpu', role: 'local', eng: null, seat: 0, n: 2, names: [], bot: [], pid: [], players: [], size: 0, botsOn: false, tmr: 0, pend: new Set(), hooked: false, diff: 'Normal', counted: false, menu: false, overShown: false, info: null };
      let tok = 0, scene = 'title', PORT = null, idleAt = 0, paneH = null, ui = null;
      const holds = new Map();

      const rc = x => !x ? null : x.getBoundingClientRect ? x.getBoundingClientRect() : x;
      const q = key => board.querySelector(`[data-k="${key}"]`);
      const rect = key => { const e = typeof key === 'string' ? q(key) : key; if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
      function applyHolds() { board.querySelectorAll('[data-k]').forEach(e => { e.style.visibility = holds.get(e.dataset.k) > 0 ? 'hidden' : ''; }); }
      function hold(key) {
        holds.set(key, (holds.get(key) || 0) + 1);
        let done = false;
        return () => { if (done) return; done = true; holds.set(key, holds.get(key) - 1); applyHolds(); };
      }
      function busy(ms) { idleAt = Math.max(idleAt, performance.now() + ms); }
      function fly(o) {
        const tr = rc(typeof o.to === 'string' ? q(o.to) : o.to);
        let fr = rc(typeof o.from === 'string' ? q(o.from) : o.from);
        const rel = o.hold ? hold(o.hold) : null;
        if (o.hold) applyHolds();
        if (!tr || !tr.width || reduced()) { if (rel) rel(); if (o.done) o.done(); return; }
        const ib = inn.getBoundingClientRect(), k = (ib.width / inn.offsetWidth) || 1;
        if (!fr) fr = { left: ib.left + ib.width / 2 - tr.width / 2, top: ib.top + ib.height / 2 - tr.height / 2, width: tr.width, height: tr.height };
        const d = mk('div', 'tb-fly ' + (o.cls || ''), o.html);
        d.style.cssText = `left:${(tr.left - ib.left) / k}px;top:${(tr.top - ib.top) / k}px;width:${tr.width / k}px;height:${tr.height / k}px`;
        inn.append(d);
        const dx = ((fr.left + fr.width / 2) - (tr.left + tr.width / 2)) / k, dy = ((fr.top + fr.height / 2) - (tr.top + tr.height / 2)) / k;
        const s0 = o.s0 != null ? o.s0 : Math.max(.2, Math.min(3, fr.width / tr.width));
        const dur = o.dur || 420, delay = o.delay || 0;
        busy(delay + dur);
        const a = d.animate([
          { transform: `translate(${dx}px,${dy}px) scale(${s0}) rotate(${o.r0 || 0}deg)`, opacity: o.o0 != null ? o.o0 : 1 },
          { transform: `translate(0px,0px) scale(1) rotate(${o.r1 || 0}deg)`, opacity: 1 }
        ], { duration: dur, delay, easing: o.ease || 'cubic-bezier(.2,.8,.25,1)', fill: 'both' });
        const fin = () => { d.remove(); if (rel) rel(); if (o.done) o.done(); };
        a.onfinish = fin; a.oncancel = fin;
      }
      function burst(at, n, cols, o = {}) {
        if (reduced()) return;
        const ib = inn.getBoundingClientRect(), k = (ib.width / inn.offsetWidth) || 1, r = rc(at);
        if (!r) return;
        const cx = (r.left + r.width / 2 - ib.left) / k, cy = (r.top + r.height / 2 - ib.top) / k;
        for (let i = 0; i < n; i++) {
          const p = mk('i', 'tb-fly'), s = (o.size || 8) * (.5 + Math.random()), a = Math.random() * Math.PI * 2, v = (o.speed || 90) * (.4 + Math.random());
          p.style.cssText = `left:${cx - s / 2}px;top:${cy - s / 2}px;width:${s}px;height:${s * (o.tall ? 1.8 : 1)}px;border-radius:${o.sq ? '2px' : '50%'};background:${cols[i % cols.length]}`;
          inn.append(p);
          const an = p.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + (o.grav || 0)}px) rotate(${R(360)}deg) scale(.2)`, opacity: 0 }], { duration: (o.dur || 700) * (.7 + Math.random() * .6), easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'both' });
          an.onfinish = () => p.remove();
        }
        busy(o.dur || 700);
      }
      function shake(el, amp = 6, ms = 420) {
        if (reduced() || !el || !el.animate) return;
        const f = []; for (let i = 0; i < 9; i++) f.push({ transform: `translate(${(Math.random() - .5) * amp * 2}px,${(Math.random() - .5) * amp * 2}px)` });
        f.push({ transform: 'none' });
        el.animate(f, { duration: ms });
      }

      function fit() {
        const port = (root.clientWidth || 800) < 640;
        if (port === PORT) return;
        PORT = port;
        wrap.classList.toggle('port', port); wrap.classList.toggle('land', !port);
        const W = port ? 360 : 960, H = 600;
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        if (ui && ui.layout) ui.layout(port);
      }

      function showPane(key, html, fn, cls) {
        pane.className = 'tb-pane ' + (cls || ''); pane.dataset.k = key; pane.innerHTML = html; pane.hidden = false; paneH = fn; pane.scrollTop = 0;
      }
      function hidePane() { pane.hidden = true; pane.innerHTML = ''; pane.dataset.k = ''; paneH = null; }
      api.on(pane, 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneH) return;
        snd('tap'); paneH(b.dataset.a, b);
      });
      const seg = (k, vals, labels) => `<div class="tb-seg">${vals.map((v, i) => `<button class="${opt[k] === v ? 'on' : ''}" data-a="seg" data-k="${k}" data-i="${i}">${labels ? labels[i] : v}</button>`).join('')}</div>`;
      const segClick = (b, again, vals) => { opt[b.dataset.k] = vals[+b.dataset.i]; saveOpt(); again(); };
      const hud0 = () => {
        const g = scene === 'game';
        bMenu.hidden = !g;
        netEl.hidden = !(g && M.mode === 'online');
      };

      const overHtml = (title, kicker, text, rows, btns) => `<div class="tb-box"><p class="tb-kick">${kicker}</p><h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${rows || ''}${btns}</div>`;

      function showTitle() {
        scene = 'title'; M.mode = 'cpu'; M.role = 'local'; M.eng = null; hud0(); hidePane(); ui.clear && ui.clear();
        showPane('title', `<div class="tb-title">${S.logo}<p class="tb-tag">${S.tag}</p>
<button class="tb-big" data-a="cpu">Play vs bots<small>${S.min - 1}-${S.max - 1} computer opponents</small></button>
<button class="tb-big b" data-a="online">Online party<small>${S.min}-${S.max} players, each on their own device</small></button>
<div class="tb-row"><button class="tb-sm" data-a="rules">How to play</button></div>
<p class="tb-rec">Games won ${opt.wins} of ${opt.games}</p></div>`, a => {
          if (a === 'cpu') { opt.mode = 'cpu'; saveOpt(); setup(); }
          else if (a === 'online') startOnline();
          else if (a === 'rules') rules(showTitle);
        }, 'clear');
      }
      function setup() {
        const ex = (S.extra || []).map(x => `<div class="tb-opt"><span>${x.t}${x.sub ? `<small>${x.sub}</small>` : ''}</span>${seg(x.k, x.vals, x.labels)}</div>`).join('');
        showPane('setup', `<div class="tb-box"><h3>vs bots</h3><div class="tb-opt"><span>Opponents</span>${seg('bots', range(1, S.max - 1))}</div><div class="tb-opt"><span>Bot skill</span>${seg('diff', DIFFS)}</div>${ex}
<button class="tb-big" data-a="go">Deal!</button><div class="tb-row"><button class="tb-sm" data-a="rules">How to play</button><button class="tb-sm" data-a="back">Back</button></div></div>`, (a, b) => {
          if (a === 'seg') segClick(b, setup, b.dataset.k === 'bots' ? range(1, S.max - 1) : b.dataset.k === 'diff' ? DIFFS : S.extra.find(x => x.k === b.dataset.k).vals);
          else if (a === 'go') newMatch();
          else if (a === 'rules') rules(setup);
          else showTitle();
        });
      }
      function rules(back) { showPane('rules', `<div class="tb-box wide tb-rules"><h3 style="text-align:center">How to play</h3>${S.rules}<button class="tb-big c" data-a="back">Got it</button></div>`, () => back()); }
      function menu() {
        if (scene !== 'game') return;
        const online = M.mode === 'online';
        M.menu = true;
        showPane('menu', `<div class="tb-box"><p class="tb-kick">${online ? 'Online' : 'Paused'}</p><h3>Menu</h3><button class="tb-big b" data-a="resume">Resume</button><button class="tb-big c" data-a="rules">How to play</button><button class="tb-big" data-a="quit">${online ? 'Leave game' : 'Quit to title'}</button></div>`, a => {
          if (a === 'resume') { M.menu = false; hidePane(); kick(); }
          else if (a === 'rules') rules(menu);
          else { M.menu = false; leave(); }
        });
      }
      function leave() {
        tok++; clearTimeout(M.tmr); M.pend.clear();
        if (M.mode === 'online') api.net.close();
        M.menu = false; M.eng = null; showTitle();
      }

      function seats(n, humans, names) {
        M.n = n; M.bot = Array(n).fill(true); M.names = []; M.pid = Array(n).fill(null);
        const pool = shuf(BOTNAMES.slice());
        for (let i = 0; i < n; i++) {
          if (humans[i]) { M.bot[i] = false; M.names[i] = humans[i].name; M.pid[i] = humans[i].id; }
          else M.names[i] = pool.pop();
        }
      }
      function info() {
        return M.info = { n: M.n, seat: M.seat, names: M.names, bot: M.bot, online: M.mode === 'online', diff: M.diff, opt };
      }
      function newMatch() {
        tok++; clearTimeout(M.tmr); M.pend.clear(); M.overShown = false; M.counted = false; M.menu = false;
        const online = M.mode === 'online' && M.role === 'host';
        M.diff = opt.diff;
        let n, humans = [];
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(p => p.id === x.id && !p.away));
          M.players = live;
          const k = Math.min(S.max, live.length);
          n = Math.max(S.min, Math.min(S.max, M.botsOn ? Math.max(k, M.size || k) : k));
          if (k > n) n = k;
          live.slice(0, k).forEach((p, i) => { humans[i] = p; });
        } else {
          M.mode = 'cpu'; M.role = 'local'; n = 1 + opt.bots; humans[0] = { name: 'You', id: null };
        }
        M.seat = 0;
        seats(n, humans);
        const cfg = { online }; (S.extra || []).forEach(x => { cfg[x.k] = opt[x.k]; });
        M.eng = S.create(n, cfg, M.diff);
        scene = 'game'; hud0(); hidePane();
        ui.start(info());
        if (online) M.pid.forEach((id, s) => { if (id && s) api.net.sendTo(id, setupMsg(s, true)); });
        api.score(opt.wins);
        flush(true);
      }
      const setupMsg = (s, fresh) => { const m = { t: 'setup', n: M.n, seat: s, names: M.names, bot: M.bot }; if (!fresh) m.v = M.eng.view(s); return m; };
      const filt = (e, s) => { if (!e.priv) return e; const o = Object.assign({}, e); const p = o.priv[s]; delete o.priv; return p ? Object.assign(o, p) : o; };
      function flush(first) {
        const eng = M.eng, es = eng.takeEv(), ms = eng.tmo();
        if (M.role === 'host') M.pid.forEach((id, s) => { if (id && !M.bot[s] && s !== M.seat) { const v = eng.view(s); v.dl = ms; api.net.sendTo(id, { t: 'u', es: es.map(e => filt(e, s)), v }); } });
        const v = eng.view(M.seat); v.dl = ms;
        M.view = v;
        ui.update(v, es.map(e => filt(e, M.seat)), !!first);
        if (eng.over) { onOver(v); return; }
        after();
      }
      const holdAll = () => api.paused || M.menu;
      function after() {
        const eng = M.eng;
        if (!eng || eng.over) return;
        for (const s of eng.who()) if (M.bot[s] && !M.pend.has(s)) {
          M.pend.add(s);
          const t = tok, wait = Math.max(S.botDelay(eng, s, M.diff), idleAt - performance.now() + 250);
          api.timeout(() => { M.pend.delete(s); if (t === tok && M.eng) botGo(s); }, wait);
        }
        arm();
      }
      function botGo(s) {
        const eng = M.eng;
        if (!eng || eng.over || !eng.who().includes(s)) return;
        if (holdAll()) { M.pend.add(s); const t = tok; api.timeout(() => { M.pend.delete(s); if (t === tok && M.eng) botGo(s); }, 400); return; }
        if (idleAt - performance.now() > 150) { M.pend.add(s); const t = tok; api.timeout(() => { M.pend.delete(s); if (t === tok && M.eng) botGo(s); }, idleAt - performance.now()); return; }
        let a = null;
        try { a = eng.bot(s, M.diff); } catch (e) { console.error(e); }
        if (!a || !eng.act(s, a)) { const f = eng.fallback(s); if (f) eng.act(s, f); }
        flush();
      }
      function arm() {
        clearTimeout(M.tmr);
        const eng = M.eng;
        if (!eng || eng.over) return;
        const ms = eng.tmo();
        if (!ms) return;
        const t = tok;
        M.tmr = api.timeout(() => {
          if (t !== tok || !M.eng) return;
          if (holdAll() || idleAt - performance.now() > 100) { eng.extend(600); return arm(); }
          eng.timeout(); flush();
        }, ms);
      }
      function kick() { if (M.eng) after(); }
      function send(a) {
        if (scene !== 'game' || M.menu) return false;
        if (M.role === 'guest') { api.net.send({ t: 'a', a }); return true; }
        if (!M.eng || !M.eng.act(M.seat, a)) return false;
        flush(); return true;
      }

      function onOver(v) {
        if (M.overShown) return;
        M.overShown = true;
        const t = tok;
        if (!M.counted) {
          M.counted = true;
          if (v.over.win === M.seat) { opt.wins++; if (M.mode === 'cpu') api.submit(opt.wins); }
          opt.games++; saveOpt(); api.score(opt.wins);
        }
        api.timeout(() => { if (t === tok) showOver(v); }, S.overDelay || 1700);
      }
      function showOver(v) {
        const me = v.over.win === M.seat, wn = M.names[v.over.win];
        snd(me ? 'win' : 'lose');
        const rows = S.stats ? S.stats(v, M.info) : '';
        let btns;
        if (M.mode === 'cpu') btns = `<button class="tb-big" data-a="again">Play again</button><div class="tb-row"><button class="tb-sm" data-a="setup">Change setup</button><button class="tb-sm" data-a="title">Menu</button></div>`;
        else if (M.role === 'host') btns = `<button class="tb-big" data-a="again">Rematch</button><div class="tb-row"><button class="tb-sm" data-a="lobby">Back to lobby</button><button class="tb-sm" data-a="leave">Leave</button></div>`;
        else btns = `<p>Waiting for the host…</p><div class="tb-row"><button class="tb-sm" data-a="leave">Leave</button></div>`;
        showPane('over', overHtml(me ? 'You win!' : esc(wn) + ' wins', me ? 'Victory' : 'Game over', S.overText ? S.overText(v, M.info, me) : '', rows, btns), a => {
          if (a === 'again') { if (M.mode === 'online' && M.role !== 'host') return; newMatch(); }
          else if (a === 'setup') setup();
          else if (a === 'title') showTitle();
          else if (a === 'lobby') startOnline();
          else leave();
        });
      }

      function seatToBot(id) {
        const s = M.pid.indexOf(id);
        if (s < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[s];
        M.pid[s] = null; M.bot[s] = true; M.names[s] = who + ' (bot)';
        api.net.send({ t: 'seats', names: M.names, bot: M.bot });
        api.toast(who + ' left. A bot takes the seat.');
        if (ui.refresh) ui.refresh();
        kick();
      }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
        api.net.on('rejoin', p => {
          if (M.mode !== 'online' || M.role !== 'host' || !M.eng || !p) return;
          const s = M.pid.indexOf(p.id);
          if (s < 0 || M.bot[s]) return;
          api.net.sendTo(p.id, setupMsg(s));
          const v = M.eng.view(s); v.dl = M.eng.tmo();
          api.net.sendTo(p.id, { t: 'u', es: [], v, sync: 1 });
        });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || !M.role || M.role === 'local') return;
          tok++; M.role = 'local'; M.eng = null; scene = 'title'; hud0(); M.menu = false;
          snd('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
          showPane('left', `<div class="tb-box"><p class="tb-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="tb-big b" data-a="room">Online lobby</button><button class="tb-big" data-a="cpu">Play vs bots</button></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); showTitle(); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || scene !== 'game') return;
          const on = api.net.connected, hn = M.pid.filter((id, s) => id && !M.bot[s] && s !== M.seat).length;
          netEl.classList.toggle('bad', !on && M.role === 'guest');
          netEl.lastChild.textContent = M.role === 'guest' && !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }
      async function startOnline() {
        tok++; const t = tok;
        hookNet();
        clearTimeout(M.tmr); M.pend.clear(); M.eng = null; M.menu = false;
        scene = 'title'; hud0(); hidePane(); ui.clear && ui.clear();
        M.mode = 'online'; M.role = null; opt.mode = 'online'; saveOpt();
        const r = await api.net.room({ title: S.title, sizes: range(S.min, S.max), defaultSize: S.defOnline || S.max, min: S.min, max: S.max, bots: true });
        if (!api.alive || t !== tok) return;
        if (!r) { M.mode = 'cpu'; M.role = 'local'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, S.max); M.botsOn = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') newMatch();
        else showPane('wait', `<div class="tb-box"><p class="tb-kick">Online</p><h3>Connected!</h3><div class="tb-wait"></div><p>Waiting for the host to deal…</p><div class="tb-row"><button class="tb-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leave(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const s = M.pid.indexOf(from);
          if (s < 0 || s === M.seat || M.bot[s]) return;
          if (d.t === 'a' && d.a && typeof d.a === 'object') {
            if (M.eng.act(s, d.a)) flush();
            else { const v = M.eng.view(s); v.dl = M.eng.tmo(); api.net.sendTo(from, { t: 'u', es: [], v, sync: 1 }); }
          }
        } else {
          if (d.t === 'setup') {
            tok++; M.mode = 'online'; M.role = 'guest'; M.seat = d.seat; M.n = d.n; M.names = d.names; M.bot = d.bot; M.overShown = false; M.counted = false; M.menu = false;
            scene = 'game'; hud0(); hidePane();
            ui.start(info());
            if (d.v) { M.view = d.v; ui.update(d.v, [], true); }
          } else if (M.role !== 'guest' || scene !== 'game') return;
          else if (d.t === 'u') {
            M.view = d.v;
            ui.update(d.v, d.sync ? [] : d.es, !!d.sync);
            if (d.v.over) onOver(d.v);
          } else if (d.t === 'seats') { M.names = d.names; M.bot = d.bot; if (M.info) { M.info.names = d.names; M.info.bot = d.bot; } if (ui.refresh) ui.refresh(); }
        }
      }

      api.on(bMenu, 'click', () => { snd('tap'); menu(); });
      api.on(window, 'keydown', e => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        if (e.key === 'Escape') {
          if (scene === 'game') { if (!pane.hidden && pane.dataset.k === 'menu') { M.menu = false; hidePane(); kick(); } else if (pane.hidden) menu(); e.preventDefault(); }
          return;
        }
        if (scene === 'game' && pane.hidden && ui.key) ui.key(e);
      });

      const h = {
        api, board, snd, send, fly, hold, rd: applyHolds, rect, q, burst, shake, busy, menu,
        get port() { return PORT; },
        get info() { return M.info; },
        get view() { return M.view; },
        get paused() { return holdAll(); }
      };
      ui = S.ui(h);
      fit();
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
      if (ro) ro.observe(root);
      api.on(window, 'resize', fit);
      root._tb = { M, ui, get eng() { return M.eng; }, idleAt: () => idleAt, holds, opt, h };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { if (ro) ro.disconnect(); } };
    };
  }

  const SB_CSS = css(`
.gm-skip-bo{--tbg:#0f4d5c;--a1:#e0453a;--a2:#ffd84a;--b1:#2f7de1}
.gm-skip-bo .tb{background:radial-gradient(ellipse at 50% 30%,#177085,#0b3a48 70%);border:3px solid #072833}
.gm-skip-bo .tb-pane.solid,.gm-skip-bo .tb-pane.clear{background:transparent}
.gm-skip-bo .sbc{position:relative;width:100%;aspect-ratio:5/7;container-type:size;border-radius:11%/8%;background:#fff;box-shadow:0 .5cqh 0 rgba(0,0,0,.28),0 1cqh 2cqh rgba(0,0,0,.25);flex:none}
.gm-skip-bo .sbc .f{position:absolute;inset:5%;border-radius:9%/6.5%;overflow:hidden;background:linear-gradient(160deg,var(--c1),var(--c2))}
.gm-skip-bo .sbc .f::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(255,255,255,.14) 0 7%,transparent 7% 14%)}
.gm-skip-bo .sbc .f::after{content:'';position:absolute;left:12%;right:12%;top:20%;bottom:20%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.34),rgba(255,255,255,0) 70%)}
.gm-skip-bo .sbc.b{--c1:#4b98ff;--c2:#1a51bf}.gm-skip-bo .sbc.g{--c1:#4fcf75;--c2:#1b843e}.gm-skip-bo .sbc.r{--c1:#ff7662;--c2:#c2261b}.gm-skip-bo .sbc.w{--c1:#a259ff;--c2:#4a1fa8}
.gm-skip-bo .sbc b{position:absolute;left:0;right:0;top:50%;transform:translateY(-52%);text-align:center;font:900 52cqh/1 var(--sans);color:#fff;-webkit-text-stroke:4cqh #1d1d3a;paint-order:stroke fill;text-shadow:0 3cqh 0 rgba(0,0,0,.25);z-index:1}
.gm-skip-bo .sbc i{position:absolute;left:9%;top:5%;font:900 15cqh/1 var(--sans);font-style:normal;color:#fff;-webkit-text-stroke:2cqh #1d1d3a;paint-order:stroke fill;z-index:1}
.gm-skip-bo .sbc i.r{left:auto;right:9%;top:auto;bottom:5%;transform:rotate(180deg)}
.gm-skip-bo .sbc u{position:absolute;left:0;right:0;text-align:center;font:900 25cqh/1 var(--sans);text-decoration:none;color:#fff;-webkit-text-stroke:3.5cqh #1d1d3a;paint-order:stroke fill;z-index:1}
.gm-skip-bo .sbc u:nth-of-type(1){top:22%}.gm-skip-bo .sbc u:nth-of-type(2){top:48%}
.gm-skip-bo .sbc s{position:absolute;left:0;right:0;bottom:8%;text-align:center;font:900 20cqh/1 var(--sans);text-decoration:none;color:#ffd84a;z-index:1}
.gm-skip-bo .sbc.wd .f::after{background:radial-gradient(circle,rgba(255,216,74,.75),rgba(255,216,74,0) 70%)}
.gm-skip-bo .sbc.wd b{color:#ffe98a}
.gm-skip-bo .sbc.bk .f{background:repeating-conic-gradient(from 0deg at 50% 50%,#c93a4b 0 15deg,#8c1d33 15deg 30deg)}
.gm-skip-bo .sbc.bk .f::before{inset:14%;border-radius:50%;background:radial-gradient(circle,#ffd84a 0 40%,#2a1450 42% 100%);border:1.5cqh solid #fff}
.gm-skip-bo .sbc.bk .f::after{display:none}
.gm-skip-bo .slot{width:100%;aspect-ratio:5/7;border-radius:11%/8%;border:.25u dashed rgba(255,255,255,.28);display:grid;place-items:center;font:900 3t var(--sans);color:rgba(255,255,255,.26)}
.gm-skip-bo .cnt{position:absolute;right:-.6u;top:-.6u;min-width:2.1u;padding:.1u .5u;border-radius:1u;background:#1a1330;border:2px solid #fff;color:#fff;font:900 1.3t var(--sans);text-align:center;z-index:3}
.gm-skip-bo label{display:block;font:800 1.15t var(--sans);letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.62);margin-top:.5u;text-align:center}
.gm-skip-bo .sb-root{display:flex;flex-direction:column;padding:4.6u 1.2u .8u}
.gm-skip-bo .sb-bar{position:absolute;left:50%;top:.8u;transform:translateX(-50%);padding:.4u 2u;border-radius:2u;background:rgba(0,0,0,.35);font:900 1.6t var(--sans);white-space:nowrap;z-index:2}
.gm-skip-bo .sb-bar.me{background:#ffd84a;color:#2a1e00}
.gm-skip-bo .sb-opps{display:flex;gap:.8u;justify-content:center;flex:none}
.gm-skip-bo .sb-op{--cw:4.6u;flex:1 1 0;max-width:23u;min-width:0;padding:.6u .7u .9u;border-radius:1.2u;background:rgba(0,0,0,.26);border:2px solid transparent}
.gm-skip-bo .sb-opps.n1 .sb-op{--cw:5.8u;max-width:30u}.gm-skip-bo .sb-opps.n2 .sb-op{--cw:5.4u;max-width:28u}.gm-skip-bo .sb-opps.n3 .sb-op{--cw:4.8u}.gm-skip-bo .sb-opps.n4 .sb-op,.gm-skip-bo .sb-opps.n5 .sb-op{--cw:3.6u}
.gm-skip-bo .sb-op.turn{border-color:#ffd84a;background:rgba(255,216,74,.14);box-shadow:0 0 1.5u rgba(255,216,74,.4)}
.gm-skip-bo .sb-on{display:flex;align-items:center;gap:.5u;font:800 1.3t var(--sans);margin-bottom:.6u;min-width:0}
.gm-skip-bo .sb-on b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.gm-skip-bo .sb-on .av{width:2.2u;height:2.2u;min-width:16px;min-height:16px;font-size:1.1t}
.gm-skip-bo .sb-hn{display:flex;align-items:center;gap:.3u;font:900 1.2t var(--sans);opacity:.85}
.gm-skip-bo .sb-hn i{display:inline-block;width:.9u;height:1.25u;min-width:6px;min-height:8px;border-radius:2px;background:linear-gradient(#c93a4b,#8c1d33);border:1px solid #fff}
.gm-skip-bo .sb-or{display:flex;align-items:flex-end;gap:.9u}
.gm-skip-bo .sb-op .sb-st{position:relative;width:calc(var(--cw)*1.25);flex:none}
.gm-skip-bo .sb-od{display:flex;gap:.35u;flex:1;min-width:0;justify-content:flex-end}
.gm-skip-bo .sb-op .sb-dp{position:relative;width:calc(var(--cw)*.8);flex:none}
.gm-skip-bo .sb-dp em{position:absolute;right:-.2u;bottom:-.4u;font:900 1.05t var(--sans);font-style:normal;background:#1a1330;border:1.5px solid #fff;border-radius:.8u;padding:0 .35u;z-index:3}
.gm-skip-bo .sb-dp .cas.under{position:absolute;inset:-2px -2px auto 2px;aspect-ratio:5/7;border-radius:11%/8%;background:#e5e5ee;box-shadow:0 0 0 1px rgba(0,0,0,.2)}
.gm-skip-bo .sb-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:.8u;min-height:0;padding:1.2u 0}
.gm-skip-bo .sb-hint{text-align:center;font:700 1.35t var(--sans);color:rgba(255,255,255,.65);pointer-events:none}
.gm-skip-bo .sb-cen{display:flex;align-items:flex-start;justify-content:center;gap:3u}
.gm-skip-bo .sb-draw{--cw:7.4u}.gm-skip-bo .sb-bp{--cw:6.8u}
.gm-skip-bo .sb-draw,.gm-skip-bo .sb-bp{position:relative;width:var(--cw);flex:none;text-align:center;border-radius:1u}
.gm-skip-bo .sb-draw .pile{position:relative;filter:drop-shadow(1px 1px 0 #5a1426) drop-shadow(2px 2px 0 #5a1426)}
.gm-skip-bo .sb-bps{display:flex;gap:1.4u}
.gm-skip-bo .sb-bp .under{position:absolute;left:3%;right:-3%;top:-2%;aspect-ratio:5/7;border-radius:11%/8%;background:#cdd3e2;box-shadow:0 0 0 1px rgba(0,0,0,.2)}
.gm-skip-bo .sb-bp.tgt,.gm-skip-bo .sb-dp.tgt{animation:sbglow .9s ease-in-out infinite alternate;cursor:pointer}
@keyframes sbglow{from{filter:drop-shadow(0 0 .2u #ffd84a)}to{filter:drop-shadow(0 0 1.3u #ffd84a)}}
.gm-skip-bo .sb-me{flex:none;margin:0 -1.2u -.8u;padding:1u 1u 1.2u;display:flex;flex-direction:column;align-items:center;gap:1.2u;background:linear-gradient(transparent,rgba(0,0,0,.25))}
.gm-skip-bo .sb-me.turn{background:linear-gradient(transparent,rgba(255,216,74,.18))}
.gm-skip-bo .sb-mrow{display:flex;align-items:flex-start;gap:3u}
.gm-skip-bo .sb-st.mine{--cw:7.4u;position:relative;width:var(--cw);cursor:pointer;border-radius:1u}
.gm-skip-bo .sb-md{display:flex;gap:1.4u}
.gm-skip-bo .sb-md .sb-dp{--cw:6.8u;position:relative;width:var(--cw);min-height:calc(var(--cw)*1.4);cursor:pointer;border-radius:1u}
.gm-skip-bo .sb-md .sb-dp .cas{position:absolute;left:0;right:0}
.gm-skip-bo .sb-md .sb-dp .slot{position:absolute;left:0;top:0}
.gm-skip-bo .sel .sbc{transform:translateY(-1u);box-shadow:0 0 0 .3u #ffd84a,0 0 1.6u #ffd84a}
.gm-skip-bo .sb-hand{display:flex;gap:1.1u;justify-content:center;min-height:10.7u;align-items:flex-start}
.gm-skip-bo .sb-hc{--cw:7.6u;position:relative;width:var(--cw);cursor:pointer;touch-action:none;transition:transform .12s}
.gm-skip-bo .sb-hc:hover{transform:translateY(-.5u)}
.gm-skip-bo .sb-hc kbd{display:none}
.gm-skip-bo .sb-wait{align-self:center;font:700 1.4t var(--sans);color:rgba(255,255,255,.55)}
.gm-skip-bo .sb-ghost{position:absolute;pointer-events:none;z-index:45;transform:rotate(4deg) scale(1.08);filter:drop-shadow(0 .8u 1u rgba(0,0,0,.4))}
.gm-skip-bo .sb-ghost .sbc,.gm-skip-bo .tb-fly .sbc{width:100%;height:100%;aspect-ratio:auto}
.gm-skip-bo .sb-logo{display:flex;justify-content:center;align-items:center;gap:.4u;margin:.2u 0 1.2u}
.gm-skip-bo .sb-logo span{display:grid;place-items:center;width:5.6u;height:7.8u;min-width:30px;border-radius:.9u;border:.35u solid #fff;font:900 4.4t var(--sans);color:#fff;-webkit-text-stroke:.35u #1d1d3a;paint-order:stroke fill;transform:rotate(var(--r));box-shadow:0 .5u 0 rgba(0,0,0,.3);animation:sblg 2.4s ease-in-out infinite alternate}
.gm-skip-bo .sb-logo span.b{background:linear-gradient(#4b98ff,#1a51bf)}.gm-skip-bo .sb-logo span.g{background:linear-gradient(#4fcf75,#1b843e)}.gm-skip-bo .sb-logo span.r{background:linear-gradient(#ff7662,#c2261b)}
.gm-skip-bo .sb-logo span:nth-child(odd){animation-delay:-1.2s}
.gm-skip-bo .sb-logo em{font:900 4t var(--sans);font-style:normal;color:#ffd84a}
@keyframes sblg{from{translate:0 -.3u}to{translate:0 .3u}}
.gm-skip-bo .tb.port .sb-root{padding:12u 1.4u .8u}
.gm-skip-bo .tb.port .sb-bar{top:2.6u;font-size:3.6t;padding:.8u 3.4u}
.gm-skip-bo .tb.port .sb-opps{flex-wrap:wrap;gap:1u}
.gm-skip-bo .tb.port .sb-op{flex:0 0 calc(33.3% - .7u);max-width:none;--cw:5.8u;padding:1.2u 1.1u 1.6u}
.gm-skip-bo .tb.port .sb-opps.n1 .sb-op,.gm-skip-bo .tb.port .sb-opps.n2 .sb-op{flex:0 0 calc(50% - .5u);--cw:8u}
.gm-skip-bo .tb.port .sb-opps.n1 .sb-op{flex-basis:60%}
.gm-skip-bo .tb.port .sb-on{font-size:3.3t;gap:1u;margin-bottom:1.2u}
.gm-skip-bo .tb.port .sb-on .av{width:5u;height:5u;font-size:2.8t}
.gm-skip-bo .tb.port .sb-hn{font-size:2.8t}
.gm-skip-bo .tb.port .sb-hn i{width:2u;height:2.8u}
.gm-skip-bo .tb.port .sb-dp em{font-size:2.4t}
.gm-skip-bo .tb.port .cnt{font-size:2.8t;min-width:4.6u;right:-1.2u;top:-1.2u}
.gm-skip-bo .tb.port label{font-size:2.6t;margin-top:1u}
.gm-skip-bo .tb.port .sb-hint{font-size:3.1t}
.gm-skip-bo .tb.port .sb-cen{gap:1.6u}
.gm-skip-bo .tb.port .sb-bps{gap:1.2u}
.gm-skip-bo .tb.port .sb-draw,.gm-skip-bo .tb.port .sb-bp{--cw:15.4u}.gm-skip-bo .tb.port .sb-cen{gap:1.2u}
.gm-skip-bo .tb.port .sb-me{margin:0 -1.4u -.8u;gap:2.4u;padding:2u 1.4u 2u}
.gm-skip-bo .tb.port .sb-mrow{gap:1.6u}
.gm-skip-bo .tb.port .sb-st.mine{--cw:15.4u}
.gm-skip-bo .tb.port .sb-md{gap:1.2u}
.gm-skip-bo .tb.port .sb-md .sb-dp{--cw:15.4u}
.gm-skip-bo .tb.port .sb-hand{gap:1.2u;min-height:24u}
.gm-skip-bo .tb.port .sb-hc{--cw:17.6u}
.gm-skip-bo .tb.port .sb-logo span{width:11u;height:15u;font-size:8t}
.gm-skip-bo .tb.port .sb-logo{gap:.8u}
`);

  const sbFits = (c, cnt) => c === 0 || c === cnt + 1;
  const sbKey = c => c || 13;

  function SkipBo(n, cfg) {
    const E = { n, over: null, ev: [], dl: 0 };
    const sn = cfg && cfg.stock === 'short' ? 10 : n <= 4 ? 30 : 20;
    const deck = [];
    for (let v = 1; v <= 12; v++) for (let i = 0; i < 12; i++) deck.push(v);
    for (let i = 0; i < 18; i++) deck.push(0);
    shuf(deck);
    E.draw = deck; E.stock = []; E.hand = []; E.disc = []; E.done = [];
    E.build = [[], [], [], []]; E.bc = [[], [], [], []];
    for (let p = 0; p < n; p++) { E.stock.push(E.draw.splice(-sn)); E.hand.push([]); E.disc.push([[], [], [], []]); }
    E.turn = R(n); E.round = 0;
    const sortH = p => E.hand[p].sort((a, b) => sbKey(a) - sbKey(b));
    const drawTo = (p, k) => {
      const got = [];
      while (got.length < k) {
        if (!E.draw.length) {
          if (!E.done.length) break;
          E.draw = shuf(E.done); E.done = []; E.ev.push({ k: 'reshuffle' });
        }
        got.push(E.draw.pop());
      }
      if (got.length) { E.hand[p].push(...got); sortH(p); E.ev.push({ k: 'draw', p, n: got.length, priv: { [p]: { cards: got } } }); }
    };
    const startTurn = () => {
      for (let g = 0; g <= n; g++) {
        if (g === n) {
          let w = 0;
          for (let q = 1; q < n; q++) if (E.stock[q].length < E.stock[w].length) w = q;
          E.over = { win: w, stalemate: true }; E.ev.push({ k: 'win', p: w });
          return;
        }
        drawTo(E.turn, 5 - E.hand[E.turn].length);
        E.ev.push({ k: 'turn', p: E.turn });
        if (E.hand[E.turn].length) return;
        E.turn = (E.turn + 1) % n;
      }
    };
    E.start = () => startTurn();
    E.start();
    E.who = () => E.over ? [] : [E.turn];
    E.tmo = () => 0;
    E.timeout = () => {};
    E.extend = () => {};
    E.takeEv = () => { const e = E.ev; E.ev = []; return e; };
    E.act = (p, a) => {
      if (E.over || p !== E.turn || !a) return false;
      if (a.t === 'play') {
        const to = a.to | 0;
        if (to < 0 || to > 3) return false;
        const pile = E.build[to];
        let c, ev = { k: 'play', p, src: a.src, to };
        if (a.src === 'hand') { ev.i = a.i | 0; c = E.hand[p][ev.i]; }
        else if (a.src === 'stock') c = E.stock[p][E.stock[p].length - 1];
        else if (a.src === 'disc') { ev.d = a.d | 0; const st = E.disc[p][ev.d]; if (!st) return false; c = st[st.length - 1]; }
        else return false;
        if (c === undefined || !sbFits(c, pile.length)) return false;
        if (a.src === 'hand') E.hand[p].splice(ev.i, 1);
        else if (a.src === 'stock') E.stock[p].pop();
        else E.disc[p][ev.d].pop();
        pile.push(pile.length + 1); E.bc[to].push(c);
        ev.c = c; ev.val = pile.length;
        E.ev.push(ev);
        if (pile.length === 12) {
          E.done.push(...E.bc[to]); E.build[to] = []; E.bc[to] = [];
          E.ev.push({ k: 'clear', to });
        }
        if (!E.stock[p].length) { E.over = { win: p }; E.ev.push({ k: 'win', p }); return true; }
        if (a.src === 'hand' && !E.hand[p].length) {
          drawTo(p, 5);
          if (!E.hand[p].length) { E.turn = (E.turn + 1) % n; startTurn(); }
        }
        return true;
      }
      if (a.t === 'disc') {
        const i = a.i | 0, d = a.to | 0;
        if (d < 0 || d > 3 || i < 0 || i >= E.hand[p].length) return false;
        const c = E.hand[p].splice(i, 1)[0];
        E.disc[p][d].push(c);
        E.ev.push({ k: 'disc', p, c, to: d, i });
        E.turn = (E.turn + 1) % n; E.round++;
        startTurn();
        return true;
      }
      return false;
    };
    E.view = s => ({
      n, turn: E.turn, over: E.over, drawN: E.draw.length, doneN: E.done.length,
      hand: E.hand[s].slice(), handN: E.hand.map(h => h.length),
      stockN: E.stock.map(x => x.length), stockTop: E.stock.map(x => x.length ? x[x.length - 1] : null),
      disc: E.disc.map(ds => ds.map(d => d.slice())),
      build: E.build.map((b, i) => ({ n: b.length, w: b.length ? E.bc[i][E.bc[i].length - 1] === 0 : false }))
    });
    E.fallback = p => ({ t: 'disc', i: 0, to: 0 });
    E.bot = (p, diff) => sbBot(E, p, diff);
    return E;
  }

  function sbPlan(counts, hand, disc, sTop, maxDepth) {
    let nodes = 0;
    const seen = new Set();
    const rec = (cnt, hd, ds, depth) => {
      if (cnt.some(c => sbFits(sTop, c))) return [];
      if (depth === 0 || nodes > 5000) return null;
      const key = depth + '|' + cnt.slice().sort().join(',') + '|' + hd.join(',') + '|' + ds.map(d => d.join('.')).join(';');
      if (seen.has(key)) return null;
      seen.add(key);
      nodes++;
      const opts = [];
      const hs = new Set();
      hd.forEach((c, i) => { if (!hs.has(c)) { hs.add(c); opts.push({ src: 'hand', i, c }); } });
      ds.forEach((d, j) => { if (d.length) opts.push({ src: 'disc', d: j, c: d[d.length - 1] }); });
      opts.sort((a, b) => (a.c === 0) - (b.c === 0));
      for (const o of opts) {
        const tried = new Set();
        for (let to = 0; to < 4; to++) {
          if (!sbFits(o.c, cnt[to]) || tried.has(cnt[to])) continue;
          tried.add(cnt[to]);
          const c2 = cnt.slice(); c2[to] = c2[to] + 1 === 12 ? 0 : c2[to] + 1;
          let h2 = hd, d2 = ds;
          if (o.src === 'hand') { h2 = hd.slice(); h2.splice(o.i, 1); } else { d2 = ds.map(x => x.slice()); d2[o.d].pop(); }
          const r = rec(c2, h2, d2, depth - 1);
          if (r) return [{ src: o.src, i: o.i, d: o.d, c: o.c, to }, ...r];
        }
      }
      return null;
    };
    for (let d = 1; d <= maxDepth; d++) { seen.clear(); const r = rec(counts, hand, disc, d); if (r && r.length) return r; }
    return null;
  }

  function sbBot(E, p, diff) {
    const counts = E.build.map(b => b.length), hand = E.hand[p], disc = E.disc[p];
    const st = E.stock[p], sTop = st[st.length - 1];
    const play = (src, c, to, i, d) => ({ t: 'play', src, to, i, d });
    const bestPile = c => {
      const ok = counts.map((n, j) => j).filter(j => sbFits(c, counts[j]));
      if (!ok.length) return -1;
      return c === 0 ? ok.sort((a, b) => counts[b] - counts[a])[0] : ok[0];
    };
    const sp = bestPile(sTop);
    if (sp >= 0) return play('stock', sTop, sp);
    const easy = diff === 'Easy';
    {
      const plan = sbPlan(counts, hand, disc.map(d => d.slice()), sTop, diff === 'Hard' ? 6 : easy ? 1 : 2);
      if (plan) { const m = plan[0]; return play(m.src, m.c, m.to, m.i, m.d); }
    }
    const opp = [];
    for (let o = 0; o < E.n; o++) if (o !== p) opp.push(E.stock[o][E.stock[o].length - 1]);
    const cands = [];
    const consider = (src, c, i, d) => {
      for (let to = 0; to < 4; to++) {
        if (!sbFits(c, counts[to])) continue;
        if (c === 0 && !(src === 'hand' && hand.length === 1)) continue;
        let sc = (src === 'disc' ? 3 : 2) + (src === 'hand' && hand.length === 1 ? 6 : 0);
        const nc = counts[to] + 1;
        if (nc < 12 && opp.some(o => o === nc + 1)) sc -= diff === 'Hard' ? 2.5 : 0;
        if (nc === 12) sc += 2;
        if (diff === 'Hard' && sTop) sc += counts[to] < sTop ? (nc < sTop ? 3 : 4) : -1.5;
        if (src === 'disc' && disc[d].length > 1) sc += 1;
        cands.push({ sc: sc + Math.random() * .5, mv: play(src, c, to, i, d) });
      }
    };
    const seenC = new Set();
    hand.forEach((c, i) => { if (!seenC.has(c)) { seenC.add(c); consider('hand', c, i); } });
    disc.forEach((d, j) => { if (d.length) consider('disc', d[d.length - 1], 0, j); });
    cands.sort((a, b) => b.sc - a.sc);
    if (easy) { const ok = cands.filter(c => c.sc > 0); if (ok.length && Math.random() < .8) return pick(ok).mv; }
    else if (cands.length && cands[0].sc > 0) return cands[0].mv;
    const need = new Set();
    if (sTop) {
      for (let to = 0; to < 4; to++) if (counts[to] < sTop) for (let v = counts[to] + 1; v <= Math.min(12, sTop); v++) need.add(v);
    }
    let best = null;
    hand.forEach((c, i) => {
      for (let d = 0; d < 4; d++) {
        const stk = disc[d], top = stk.length ? stk[stk.length - 1] : null;
        let sc = 0;
        if (c === 0) sc -= 60;
        if (need.has(c)) sc -= 14;
        if (top === null) sc += 4 + c * .1;
        else if (top === c + 1) sc += 9;
        else if (top === c) sc += 6;
        else if (top > c) sc += 2 - (top - c) * .3;
        else sc -= 3 + (c - top) * 1.2;
        if (stk.length >= 6) sc -= 3;
        if (diff === 'Hard' && top !== null && need.has(top)) sc -= 8;
        if (diff === 'Hard' && top !== null && top < c) sc -= 3;
        if (easy) sc = sc * .5 + Math.random() * 6;
        sc += Math.random() * .4;
        if (!best || sc > best.sc) best = { sc, mv: { t: 'disc', i, to: d } };
      }
    });
    return best ? best.mv : E.fallback(p);
  }

  const SB_COL = v => v === 0 ? 'w' : v <= 4 ? 'b' : v <= 8 ? 'g' : 'r';
  const sbCard = (v, extra) => v === 0
    ? `<div class="sbc w${extra ? ' ' + extra : ''}"><div class="f"><u>SKIP</u><u>BO</u><s>&#9733;</s></div></div>`
    : `<div class="sbc ${SB_COL(v)}${extra ? ' ' + extra : ''}"><div class="f"><i>${v}</i><b>${v}</b><i class="r">${v}</i></div></div>`;
  const sbBack = extra => `<div class="sbc bk${extra ? ' ' + extra : ''}"><div class="f"><s></s></div></div>`;

  const sbUI = h => {
    const api = h.api;
    let V = null, sel = null, drag = null, statusMsg = '', info = null;
    const tgt = [];
    const root = h.board;
    root.classList.add('sb-root');

    const myCard = () => {
      if (!sel || !V) return undefined;
      if (sel.src === 'hand') return V.hand[sel.i];
      if (sel.src === 'stock') return V.stockTop[info.seat];
      const d = V.disc[info.seat][sel.d]; return d[d.length - 1];
    };
    const myTurn = () => V && !V.over && V.turn === info.seat;

    function discHTML(p, j, mine) {
      const st = V.disc[p][j], n = st.length;
      const cls = 'sb-dp' + (mine && sel && sel.src === 'hand' && myTurn() ? ' tgt' : '') + (mine && sel && sel.src === 'disc' && sel.d === j ? ' sel' : '');
      let inner = '';
      if (!n) inner = '<div class="slot"></div>';
      else if (mine) {
        const vis = st.slice(-4);
        inner = vis.map((c, i) => `<div class="cas" style="top:calc(var(--cw)*${(i * .3).toFixed(2)})">${sbCard(c, i === vis.length - 1 ? 'top' : '')}</div>`).join('') + (n > 4 ? `<em>${n}</em>` : '');
      } else {
        inner = (n > 1 ? `<div class="cas under"></div>` : '') + sbCard(st[n - 1]);
        if (n > 1) inner += `<em>${n}</em>`;
      }
      return `<div class="${cls}" data-k="d${p}_${j}" ${mine ? `data-drop="d${j}" data-src="disc" data-d="${j}"` : ''} style="${mine && n > 1 ? `height:calc(var(--cw)*${(1.4 + (Math.min(n, 4) - 1) * .3).toFixed(2)})` : ''}">${inner}</div>`;
    }

    function render() {
      if (!V || !info) return;
      const me = info.seat, n = info.n, v = V;
      const order = []; for (let k = 1; k < n; k++) order.push((me + k) % n);
      const turnName = v.turn === me ? 'Your turn' : info.names[v.turn] + (info.bot[v.turn] ? ' is thinking…' : ' is playing…');
      const opps = order.map(p => {
        const top = v.stockTop[p];
        return `<div class="sb-op${v.turn === p && !v.over ? ' turn' : ''}" data-k="p${p}"><div class="sb-on">${avatar(info.names[p], p)}<b>${esc(info.names[p])}</b><span class="sb-hn" data-k="oh${p}">${v.handN[p]}<i></i></span></div>
<div class="sb-or"><div class="sb-st" data-k="s${p}">${top === null ? '<div class="slot"></div>' : sbCard(top)}<span class="cnt">${v.stockN[p]}</span></div><div class="sb-od">${[0, 1, 2, 3].map(j => discHTML(p, j, false)).join('')}</div></div></div>`;
      }).join('');
      const c = myCard();
      const mid = v.build.map((b, j) => {
        const ok = sel && myTurn() && sbFits(c, b.n);
        return `<div class="sb-bp${ok ? ' tgt' : ''}" data-k="b${j}" data-drop="b${j}">${b.n ? `<div class="under"></div>` + sbCard(b.n, b.w ? 'wd' : '') : '<div class="slot">1</div>'}<label>${b.n ? 'next ' + (b.n + 1) : 'start'}</label></div>`;
      }).join('');
      const top = v.stockTop[me];
      const hand = !v.hand.length ? `<div class="sb-wait">${v.turn === me ? '' : 'Your hand fills up at the start of your turn.'}</div>` : v.hand.map((c, i) => `<div class="sb-hc${sel && sel.src === 'hand' && sel.i === i ? ' sel' : ''}" data-k="h${i}" data-src="hand" data-i="${i}">${sbCard(c)}<kbd>${i + 1}</kbd></div>`).join('');
      root.innerHTML = `<div class="sb-bar${v.turn === me && !v.over ? ' me' : ''}">${esc(turnName)}</div>
<div class="sb-opps n${order.length}">${opps}</div>
<div class="sb-mid"><div class="sb-hint">${myTurn() ? (sel ? 'Tap a glowing pile, or discard a hand card to end your turn.' : 'Pick a card, then a pile. Discard a hand card to end your turn.') : '&nbsp;'}</div><div class="sb-cen"><div class="sb-draw" data-k="dk"><div class="pile">${sbBack()}</div><span class="cnt">${v.drawN}</span><label>draw</label></div><div class="sb-bps">${mid}</div></div></div>
<div class="sb-me${v.turn === me && !v.over ? ' turn' : ''}"><div class="sb-mrow"><div class="sb-st mine${sel && sel.src === 'stock' ? ' sel' : ''}" data-k="s${me}" data-src="stock">${top === null ? '<div class="slot"></div>' : sbCard(top)}<span class="cnt">${v.stockN[me]}</span><label>stock</label></div>
<div class="sb-md">${[0, 1, 2, 3].map(j => discHTML(me, j, true)).join('')}</div></div><div class="sb-hand">${hand}</div></div>`;
      h.rd();
    }

    function select(s) {
      if (!myTurn()) return;
      if (sel && sel.src === s.src && sel.i === s.i && sel.d === s.d) { sel = null; render(); return; }
      if (s.src === 'disc' && !V.disc[info.seat][s.d].length) return;
      sel = s; h.snd('tap'); render();
    }
    function dropOn(drop) {
      if (!sel || !myTurn()) return false;
      let a;
      if (drop.startsWith('b')) a = { t: 'play', src: sel.src, i: sel.i, d: sel.d, to: +drop.slice(1) };
      else if (sel.src === 'hand') a = { t: 'disc', i: sel.i, to: +drop.slice(1) };
      else return false;
      if (a.t === 'play' && !sbFits(myCard(), V.build[a.to].n)) { h.snd('bad'); h.shake(h.q('b' + a.to), 4, 260); return false; }
      sel = null;
      const ok = h.send(a);
      if (!ok) { h.snd('bad'); render(); }
      return ok;
    }
    function autoPlay() {
      const c = myCard(); if (c === undefined) return;
      const ok = V.build.map((b, j) => j).filter(j => sbFits(c, V.build[j].n));
      if (!ok.length) { h.snd('bad'); return; }
      const to = c === 0 ? ok.sort((a, b) => V.build[b].n - V.build[a].n)[0] : ok[0];
      dropOn('b' + to);
    }

    api.on(root, 'click', e => {
      if (drag && drag.moved) return;
      const s = e.target.closest('[data-src]');
      if (s && root.contains(s)) {
        const o = { src: s.dataset.src, i: s.dataset.i !== undefined ? +s.dataset.i : undefined, d: s.dataset.d !== undefined ? +s.dataset.d : undefined };
        if (sel && o.src === 'disc' && sel.src === 'hand') { dropOn('d' + o.d); return; }
        if (sel && sel.src === o.src && sel.i === o.i && sel.d === o.d) { autoPlay(); return; }
        select(o); return;
      }
      const d = e.target.closest('[data-drop]');
      if (d && sel) dropOn(d.dataset.drop);
      else if (sel) { sel = null; render(); }
    });
    api.on(root, 'pointerdown', e => {
      if (e.button) return;
      const s = e.target.closest('[data-src]');
      if (!s || !myTurn()) return;
      drag = { s, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId, ghost: null };
    });
    api.on(window, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 9) return;
        drag.moved = true;
        const o = { src: drag.s.dataset.src, i: drag.s.dataset.i !== undefined ? +drag.s.dataset.i : undefined, d: drag.s.dataset.d !== undefined ? +drag.s.dataset.d : undefined };
        if (o.src === 'disc' && !V.disc[info.seat][o.d].length) { drag = null; return; }
        sel = o; render();
        const card = (root.querySelector(`[data-src="${o.src}"]${o.i !== undefined ? `[data-i="${o.i}"]` : ''}${o.d !== undefined ? `[data-d="${o.d}"]` : ''}`) || drag.s);
        const r = card.getBoundingClientRect(), ib = root.getBoundingClientRect(), k = ib.width / root.offsetWidth || 1;
        const g = document.createElement('div'); g.className = 'sb-ghost';
        g.innerHTML = sbCard(myCard());
        g.style.cssText = `width:${Math.min(r.width, 9 * ib.width / 100) / k}px;height:${Math.min(r.width, 9 * ib.width / 100) / k * 1.4}px`;
        root.append(g); drag.ghost = g; drag.k = k;
        const sc = root.querySelector('.sel'); if (sc) sc.style.opacity = '.35';
      }
      const ib = root.getBoundingClientRect(), g = drag.ghost;
      g.style.left = (e.clientX - ib.left) / drag.k - g.offsetWidth / 2 + 'px';
      g.style.top = (e.clientY - ib.top) / drag.k - g.offsetHeight / 2 + 'px';
    });
    const endDrag = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag;
      if (d.moved && d.ghost) {
        d.ghost.style.display = 'none';
        const el = e ? document.elementFromPoint(e.clientX, e.clientY) : null;
        d.ghost.remove();
        const t = el && el.closest ? el.closest('[data-drop]') : null;
        if (!(t && dropOn(t.dataset.drop))) { if (sel) { sel = null; } render(); }
        setTimeout(() => { drag = null; }, 0);
      } else drag = null;
    };
    api.on(window, 'pointerup', endDrag);
    api.on(window, 'pointercancel', endDrag);

    function key(e) {
      if (!myTurn()) return;
      const k = e.key.toLowerCase();
      if (/^[1-5]$/.test(k)) { if (V.hand[+k - 1] !== undefined) select({ src: 'hand', i: +k - 1 }); e.preventDefault(); }
      else if (k === 's') { select({ src: 'stock' }); e.preventDefault(); }
      else if (k === 'enter' || k === ' ') { if (sel) autoPlay(); e.preventDefault(); }
      else if (k === 'backspace') { sel = null; render(); }
      else if ('zxcv'.includes(k) && k.length === 1 && sel) { dropOn('b' + 'zxcv'.indexOf(k)); }
      else if ('qwer'.includes(k) && k.length === 1) {
        const j = 'qwer'.indexOf(k);
        if (sel && sel.src === 'hand') dropOn('d' + j); else select({ src: 'disc', d: j });
      }
    }

    function flights(es, old, snaps, first) {
      const me = info.seat;
      let t = 0;
      const step = 360;
      for (const e of es) {
        if (e.k === 'draw') {
          const mine = e.p === me;
          if (mine) {
            const prev = first ? [] : old.hand.slice(), idx = [];
            V.hand.forEach((c, i) => { const j = prev.indexOf(c); if (j >= 0) prev.splice(j, 1); else idx.push(i); });
            idx.forEach((i, m) => { h.fly({ from: snaps.dk, to: 'h' + i, html: sbBack(), hold: 'h' + i, delay: t + m * 90, dur: 380, done: () => { const el = h.q('h' + i); if (el && el.animate) el.animate([{ transform: 'rotateY(80deg) scale(1.06)' }, { transform: 'none' }], { duration: 200 }); } }); });
            if (idx.length) { for (let m = 0; m < idx.length; m++) setTimeout(() => h.snd('deal'), t + m * 90); t += idx.length * 90 + 120; }
          } else {
            for (let m = 0; m < Math.min(e.n, 5); m++) { h.fly({ from: snaps.dk, to: 'oh' + e.p, html: sbBack(), cls: 'sb-sm', delay: t + m * 70, dur: 340 }); }
            setTimeout(() => h.snd('deal'), t);
            t += 140;
          }
        } else if (e.k === 'play' || e.k === 'disc') {
          let from;
          if (e.k === 'disc') from = e.p === me ? snaps['h' + e.i] : snaps['oh' + e.p];
          else from = e.src === 'hand' ? (e.p === me ? snaps['h' + e.i] : snaps['oh' + e.p]) : e.src === 'stock' ? snaps['s' + e.p] : snaps['d' + e.p + '_' + e.d];
          const to = e.k === 'disc' ? 'd' + e.p + '_' + e.to : 'b' + e.to;
          const html = e.k === 'disc' ? sbCard(e.c) : sbCard(e.val, e.c === 0 ? 'wd' : '');
          const fc = e.k === 'play' && e.p === me && e.i !== undefined && drag === null ? null : null;
          const tt = t;
          h.fly({ from, to, html, hold: to, delay: tt, dur: 420, r0: e.p === me ? 0 : R(20) - 10, r1: e.k === 'disc' ? R(10) - 5 : 0, done: () => { h.snd('card'); } });
          if (e.k === 'play') {
            const clr = es.find(x => x.k === 'clear' && x.to === e.to);
            if (clr) setTimeout(() => { h.burst(h.q('b' + e.to), 26, ['#ffd84a', '#ff6a58', '#43c06a', '#3f8cff', '#fff'], { speed: 110, size: 9 }); h.snd('clear'); }, tt + 440);
          }
          t += step;
        } else if (e.k === 'reshuffle') { setTimeout(() => h.snd('shuffle'), t); t += 300; }
        else if (e.k === 'turn' && e.p === me) setTimeout(() => h.snd('tick'), Math.max(0, t));
        else if (e.k === 'win') {
          setTimeout(() => { const el = h.q('s' + e.p) || h.q('p' + e.p); h.burst(el, 50, ['#ffd84a', '#ff6a58', '#43c06a', '#3f8cff', '#f15bb5'], { speed: 180, size: 11, dur: 1100 }); }, t + 300);
        }
      }
    }

    return {
      start(inf) { info = inf; V = null; sel = null; drag = null; root.innerHTML = ''; },
      clear() { root.innerHTML = ''; V = null; },
      layout() { render(); },
      refresh() { render(); },
      key,
      update(v, es, first) {
        const old = V || { hand: [] };
        const snaps = {};
        const me = info.seat;
        snaps.dk = h.rect('dk');
        for (const e of es) {
          if (e.k === 'play') { const k = e.src === 'hand' ? (e.p === me ? 'h' + e.i : 'oh' + e.p) : e.src === 'stock' ? 's' + e.p : 'd' + e.p + '_' + e.d; snaps[k] = snaps[k] || h.rect(k); }
          else if (e.k === 'disc') { const k = e.p === me ? 'h' + e.i : 'oh' + e.p; snaps[k] = snaps[k] || h.rect(k); }
        }
        V = v;
        if (sel) {
          if (!myTurn()) sel = null;
          else if (sel.src === 'hand' && sel.i >= v.hand.length) sel = null;
        }
        render();
        flights(es, old, snaps, first);
      }
    };
  };

  const SB_RULES = `<p>Be the first to play every card from your <b>stock pile</b>. Build the four centre piles in order from 1 up to 12, using hand cards, the top of your stock and the top of your discard piles.</p>
<h4>Your turn</h4>
<p>Start with five cards (you draw back up to five). Play any number of cards, in any order, from your hand, your stock top, or the top of any of your four discard piles. A centre pile must go 1, 2, 3 ... 12. When it reaches 12 it is cleared away. Play all five hand cards and you draw five more and keep going.</p>
<p>Your turn ends when you <b>discard one hand card</b> onto any of your four discard piles. You may stack discards in any order; only the top card can be played.</p>
<h4>Skip-Bo cards</h4>
<p>The 18 Skip-Bo cards are wild. Play one to stand in for the next number on any centre pile.</p>
<h4>Winning</h4>
<p>Play your last stock card and you win. With 2-4 players the stock is 30 cards, with 5-6 players it is 20.</p>
<h4>Controls</h4>
<p>Tap or click a card then a pile, or drag it. Tap a selected card again to play it on the first pile it fits. Keys: <b>1</b>-<b>5</b> hand, <b>S</b> stock, <b>Z X C V</b> centre piles, <b>Q W E R</b> discard piles, <b>Enter</b> auto-play.</p>`;

  const SB_LOGO = `<div class="sb-logo">${'SKIP'.split('').map((c, i) => `<span class="${['b', 'g', 'r', 'b'][i]}" style="--r:${[-8, 4, -3, 7][i]}deg">${c}</span>`).join('')}<em>-</em>${'BO'.split('').map((c, i) => `<span class="${['g', 'r'][i]}" style="--r:${[-5, 6][i]}deg">${c}</span>`).join('')}</div>`;

  const SBX = {
    id: 'skip-bo', title: 'Skip-Bo', min: 2, max: 6, defBots: 2, defOnline: 4,
    logo: SB_LOGO, tag: 'Empty your stock pile first. Build 1 to 12, discard to end your turn.',
    rules: SB_RULES,
    extra: [{ k: 'stock', t: 'Stock pile', sub: 'Cards to get rid of', vals: ['std', 'short'], labels: ['Standard', 'Short (10)'] }],
    optDef: { stock: 'std' },
    create: (n, cfg) => SkipBo(n, cfg),
    botDelay: (e, s, d) => (d === 'Easy' ? 900 : 700) + R(500),
    ui: sbUI,
    stats: (v, info) => `<table class="tb-tbl">${v.stockN.map((c, i) => [i, c]).sort((a, b) => a[1] - b[1]).map(([i, c]) => `<tr class="${i === v.over.win ? 'win' : ''}"><td>${esc(info.names[i])}</td><td>${c ? c + ' left in stock' : 'Stock cleared'}</td></tr>`).join('')}</table>`
  };

  Ameplay.register({
    id: 'skip-bo',
    title: 'Skip-Bo',
    category: 'Board',
    tint: '#1f6fbf',
    blurb: 'Race to empty your stock pile. Build 1 to 12 in the middle, use wilds, discard to end your turn.',
    help: 'Tap a card then a pile (or drag it) · tap a selected card again to auto-play · discard a hand card to end your turn · <kbd>1</kbd>-<kbd>5</kbd> hand · <kbd>S</kbd> stock · <kbd>Z</kbd><kbd>X</kbd><kbd>C</kbd><kbd>V</kbd> piles',
    better: 'high',
    width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="24" height="34" rx="4" transform="rotate(-10 20 31)"/><rect x="22" y="12" width="24" height="34" rx="4"/><rect x="36" y="16" width="24" height="34" rx="4" transform="rotate(10 48 33)"/><path d="M34 22v18M27 31h14"/></svg>',
    _t: { SkipBo, sbBot, sbPlan },
    css: BASE('skip-bo') + SB_CSS,
    mount: table(SBX)
  });

  const EK_N = { K: 'Exploding Kitten', D: 'Defuse', N: 'Nope', A: 'Attack', S: 'Skip', F: 'Favor', H: 'Shuffle', T: 'See the Future', c0: 'Tacocat', c1: 'Hairy Potato Cat', c2: 'Rainbow-Ralphing Cat', c3: 'Cattermelon', c4: 'Beard Cat' };
  const EK_ORD = ['A', 'S', 'F', 'H', 'T', 'N', 'D', 'c0', 'c1', 'c2', 'c3', 'c4', 'K'];
  const EK_ALL = EK_ORD.slice(0, 12);
  const EK_DESC = {
    K: 'Draw this and you are out, unless you play a Defuse.',
    D: 'Saves you from an Exploding Kitten. It is used automatically, then you hide the kitten back in the deck.',
    N: 'Stops any action except a Kitten or a Defuse. Play it any time. A Nope can be Noped.',
    A: 'End your turn without drawing. The next player takes 2 turns in a row. Attacks stack.',
    S: 'End one of your turns without drawing a card.',
    F: 'Choose a player. They pick a card from their hand and give it to you.',
    H: 'Shuffle the draw pile.',
    T: 'Secretly look at the top 3 cards of the draw pile.',
    cat: 'Play two matching cats to steal a random card, or three to name the card you want.'
  };
  const EK_WIN = { quick: 1500, normal: 2400, relaxed: 4200 };
  const ekCat = c => c[0] === 'c';
  const ekSort = a => a.sort((x, y) => EK_ORD.indexOf(x) - EK_ORD.indexOf(y));
  const EK_ACT = { A: 1, S: 1, F: 1, H: 1, T: 1 };

  function Kittens(n, cfg) {
    cfg = cfg || {};
    const W = EK_WIN[cfg.nope] || EK_WIN.normal, TL = cfg.online ? 75000 : 0;
    const E = { n, over: null, ev: [], phase: 'turn', pend: null, out: [], dl: 0, passed: new Set(), disc: [], round: 0 };
    const base = [];
    const add = (c, k) => { for (let i = 0; i < k; i++) base.push(c); };
    add('N', 5); add('A', 4); add('S', 4); add('F', 4); add('H', 4); add('T', 5);
    for (let c = 0; c < 5; c++) add('c' + c, 4);
    shuf(base);
    E.hand = []; E.alive = Array(n).fill(true); E.known = Array.from({ length: n }, () => []);
    for (let p = 0; p < n; p++) E.hand.push(ekSort(['D'].concat(base.splice(0, 7))));
    E.deck = base;
    for (let i = 0; i < n - 1; i++) E.deck.push('K');
    for (let i = 0; i < Math.min(2, 6 - n); i++) E.deck.push('D');
    shuf(E.deck);
    E.turn = R(n); E.left = 1; E.att = false;
    E.ev.push({ k: 'deal' }, { k: 'turn', p: E.turn, left: 1 });
    const arm = ms => { E.dl = ms ? now() + ms : 0; };
    arm(TL);
    const alive = () => range(0, n - 1).filter(p => E.alive[p]);
    const nextOf = p => { for (let k = 1; k <= n; k++) { const q = (p + k) % n; if (E.alive[q]) return q; } return p; };
    const startTurn = (p, left, att) => { E.turn = p; E.left = left; E.att = att; E.phase = 'turn'; E.pend = null; E.round++; arm(TL); E.ev.push({ k: 'turn', p, left }); };
    const endTurn = () => {
      E.left--;
      if (E.left > 0) { E.phase = 'turn'; E.pend = null; arm(TL); E.ev.push({ k: 'turn', p: E.turn, left: E.left }); }
      else startTurn(nextOf(E.turn), 1, false);
    };
    const explode = p => {
      E.alive[p] = false; E.out.push(p);
      const lost = E.hand[p]; E.hand[p] = [];
      E.disc.push('K', ...lost);
      E.ev.push({ k: 'boom', p, cards: lost.slice() });
      const al = alive();
      if (al.length === 1) { E.over = { win: al[0] }; E.phase = 'over'; E.dl = 0; E.ev.push({ k: 'win', p: al[0] }); return; }
      startTurn(nextOf(p), 1, false);
    };
    const draw = p => {
      if (!E.deck.length) { endTurn(); return; }
      const c = E.deck.pop();
      E.known.forEach(k => k.shift());
      if (c === 'K') {
        E.ev.push({ k: 'kitten', p });
        const i = E.hand[p].indexOf('D');
        if (i >= 0) {
          E.hand[p].splice(i, 1); E.disc.push('D');
          E.ev.push({ k: 'defuse', p });
          E.phase = 'insert'; arm(TL ? 40000 : 0);
        } else explode(p);
        return;
      }
      E.hand[p].push(c); ekSort(E.hand[p]);
      E.ev.push({ k: 'draw', p, priv: { [p]: { c } } });
      endTurn();
    };
    const insert = (p, pos) => {
      pos = Math.max(0, Math.min(E.deck.length, pos | 0));
      E.deck.splice(E.deck.length - pos, 0, 'K');
      E.known.forEach((k, q) => {
        if (q === p) { const a = k.slice(0, 8); while (a.length < pos) a.push(null); if (pos <= 8) a.splice(pos, 0, 'K'); E.known[q] = a.slice(0, 8); }
        else E.known[q] = k.slice(0, pos);
      });
      E.ev.push({ k: 'insert', p, priv: { [p]: { pos } } });
      endTurn();
    };
    const finishPend = () => { const P = E.pend; E.disc.push(...P.cards, ...P.nopes.map(() => 'N')); };
    const back = () => { E.pend = null; E.phase = 'turn'; arm(TL); };
    const resolve = () => {
      const P = E.pend, ok = P.nopes.length % 2 === 0, p = P.p;
      E.ev.push({ k: 'resolve', ok, kind: P.kind, p });
      arm(0);
      if (!ok) { finishPend(); back(); return; }
      if (P.kind === 'F') {
        if (E.hand[P.target].length) { E.phase = 'favor'; arm(TL ? 40000 : 0); }
        else { finishPend(); back(); }
        return;
      }
      finishPend();
      if (P.kind === 'S') { E.pend = null; E.ev.push({ k: 'skip', p }); endTurn(); return; }
      if (P.kind === 'A') {
        const k = (E.att ? E.left : 0) + 2, to = nextOf(p);
        E.ev.push({ k: 'attack', p, to, n: k });
        startTurn(to, k, true); return;
      }
      if (P.kind === 'H') { shuf(E.deck); E.known.forEach((k, q) => { E.known[q] = []; }); E.ev.push({ k: 'shuffle', p }); }
      else if (P.kind === 'T') {
        const top = E.deck.slice(-3).reverse();
        E.known[p] = top.slice();
        E.ev.push({ k: 'peek', p, n: top.length, priv: { [p]: { cards: top } } });
      } else if (P.kind === 'P') {
        const t = P.target, h = E.hand[t];
        if (h.length) {
          const c = h.splice(R(h.length), 1)[0];
          E.hand[p].push(c); ekSort(E.hand[p]);
          E.ev.push({ k: 'steal', p, t, priv: { [p]: { c }, [t]: { c } } });
        } else E.ev.push({ k: 'steal', p, t, miss: true });
      } else if (P.kind === 'R') {
        const t = P.target, i = E.hand[t].indexOf(P.name);
        if (i >= 0) {
          const c = E.hand[t].splice(i, 1)[0];
          E.hand[p].push(c); ekSort(E.hand[p]);
          E.ev.push({ k: 'steal', p, t, name: P.name, c, hit: true });
        } else E.ev.push({ k: 'steal', p, t, name: P.name, miss: true });
      }
      back();
    };
    const give = i => {
      const P = E.pend, t = P.target, p = P.p;
      const c = E.hand[t].splice(i, 1)[0];
      E.hand[p].push(c); ekSort(E.hand[p]);
      E.ev.push({ k: 'give', p: t, to: p, priv: { [p]: { c }, [t]: { c } } });
      finishPend(); back();
    };
    E.who = () => {
      if (E.over) return [];
      if (E.phase === 'turn' || E.phase === 'insert') return [E.turn];
      if (E.phase === 'favor') return [E.pend.target];
      return alive().filter(p => !E.passed.has(p) && E.hand[p].includes('N'));
    };
    E.tmo = () => E.dl && !E.over ? Math.max(1, E.dl - now()) : 0;
    E.extend = ms => { if (E.dl) E.dl = Math.max(E.dl, now() + ms); };
    E.timeout = () => {
      if (E.over) return;
      if (E.phase === 'nope') resolve();
      else if (E.phase === 'turn') draw(E.turn);
      else if (E.phase === 'favor') { const t = E.pend.target; give(R(E.hand[t].length)); }
      else if (E.phase === 'insert') insert(E.turn, R(E.deck.length + 1));
    };
    E.takeEv = () => { const e = E.ev; E.ev = []; return e; };
    E.act = (p, a) => {
      if (E.over || !a || !E.alive[p]) return false;
      const H = E.hand[p];
      if (E.phase === 'nope') {
        if (a.t === 'nope') {
          const i = H.indexOf('N');
          if (i < 0) return false;
          H.splice(i, 1); E.pend.nopes.push(p); E.passed.clear(); arm(W);
          E.ev.push({ k: 'nope', p, n: E.pend.nopes.length });
          return true;
        }
        if (a.t === 'pass') { E.passed.add(p); return true; }
        return false;
      }
      if (E.phase === 'favor') {
        if (p !== E.pend.target || a.t !== 'give') return false;
        const i = a.i | 0;
        if (i < 0 || i >= H.length) return false;
        give(i); return true;
      }
      if (p !== E.turn) return false;
      if (E.phase === 'insert') { if (a.t !== 'insert') return false; insert(p, a.pos); return true; }
      if (E.phase !== 'turn') return false;
      if (a.t === 'draw') { draw(p); return true; }
      if (a.t !== 'play' || !Array.isArray(a.cards)) return false;
      const idx = [...new Set(a.cards.map(x => x | 0))].sort((x, y) => x - y);
      if (!idx.length || idx.length > 3 || idx.some(i => i < 0 || i >= H.length)) return false;
      const ids = idx.map(i => H[i]);
      let kind, target = -1, name = null;
      if (ids.length === 1) { if (!EK_ACT[ids[0]]) return false; kind = ids[0]; }
      else if (ekCat(ids[0]) && ids.every(c => c === ids[0])) kind = ids.length === 2 ? 'P' : 'R';
      else return false;
      if (kind === 'F' || kind === 'P' || kind === 'R') {
        target = a.target | 0;
        if (!E.alive[target] || target === p || !E.hand[target].length) return false;
      }
      if (kind === 'R') { if (!EK_ALL.includes(a.name)) return false; name = a.name; }
      for (let j = idx.length - 1; j >= 0; j--) H.splice(idx[j], 1);
      E.pend = { p, kind, cards: ids, target, name, nopes: [] };
      E.phase = 'nope'; E.passed.clear(); arm(W);
      E.ev.push({ k: 'play', p, kind, cards: ids, idx, target, name });
      return true;
    };
    E.view = s => ({
      n, turn: E.turn, left: E.left, att: E.att, phase: E.phase, deckN: E.deck.length, kit: alive().length - 1,
      discN: E.disc.length, discTop: E.disc.slice(-4), hand: E.hand[s].slice(), handN: E.hand.map(h => h.length),
      alive: E.alive.slice(), out: E.out.slice(), known: E.known[s].slice(),
      pend: E.pend ? { p: E.pend.p, kind: E.pend.kind, cards: E.pend.cards.slice(), target: E.pend.target, name: E.pend.name, nopes: E.pend.nopes.slice() } : null,
      over: E.over, round: E.round
    });
    E.fallback = p => {
      if (E.phase === 'nope') return { t: 'pass' };
      if (E.phase === 'favor') return { t: 'give', i: 0 };
      if (E.phase === 'insert') return { t: 'insert', pos: 0 };
      return { t: 'draw' };
    };
    E.bot = (p, diff) => ekBot(E, p, diff);
    return E;
  }

  function ekBot(E, p, diff) {
    const L = diff === 'Hard' ? 2 : diff === 'Normal' ? 1 : 0;
    const H = E.hand[p], n = E.n;
    const al = range(0, n - 1).filter(q => E.alive[q] && q !== p);
    const has = c => H.indexOf(c);
    const cnt = c => H.filter(x => x === c).length;
    const kn = E.known[p];
    const nextAlive = q => { for (let k = 1; k < n; k++) { const x = (q + k) % n; if (E.alive[x]) return x; } return -1; };
    if (E.phase === 'nope') {
      const P = E.pend, live = P.nopes.length % 2 === 0;
      let hurt = 0;
      if (P.p === p) hurt = -1;
      else if (P.target === p) hurt = P.kind === 'F' ? 1 : 2;
      else if (P.kind === 'A' && nextAlive(P.p) === p) hurt = 3;
      const go = (live && hurt > 0 && Math.random() < [.3, .8, .96][L]) || (!live && hurt < 0 && Math.random() < [.2, .6, .9][L]);
      return go && has('N') >= 0 ? { t: 'nope' } : { t: 'pass' };
    }
    if (E.phase === 'favor') {
      const val = c => ({ D: 9, N: 7, A: 6, S: 5, F: 3, H: 3, T: 4 }[c] || (cnt(c) >= 2 ? 3 : 1));
      if (!L) return { t: 'give', i: R(H.length) };
      let bi = 0; H.forEach((c, i) => { if (val(c) < val(H[bi])) bi = i; });
      return { t: 'give', i: bi };
    }
    if (E.phase === 'insert') {
      const D = E.deck.length, more = E.left - 1 > 0;
      let pos;
      if (more) pos = L ? D : R(D + 1);
      else if (L === 2) pos = Math.random() < .75 ? 0 : Math.min(D, 1 + R(2));
      else if (L === 1) pos = R(Math.min(D, 4) + 1);
      else pos = R(D + 1);
      return { t: 'insert', pos };
    }
    const kits = E.alive.filter(Boolean).length - 1;
    const r = kn[0] === 'K' ? 1 : kn[0] ? 0 : E.deck.length ? kits / E.deck.length : 1;
    const d = has('D') >= 0 ? r * .4 : r;
    const play = (c, extra) => Object.assign({ t: 'play', cards: [has(c)] }, extra || {});
    let tg = -1, bs = -1;
    al.forEach(q => { if (!E.hand[q].length) return; const s = E.hand[q].length + Math.random() * 1.5; if (s > bs) { bs = s; tg = q; } });
    if (kn[0] === 'K' || d >= [.42, .22, .16][L]) {
      if (kn[0] === 'K' && L === 2 && has('A') >= 0) return play('A');
      if (has('S') >= 0) return play('S');
      if (has('A') >= 0) return play('A');
      if (kn[0] === 'K' && has('H') >= 0) return play('H');
    }
    if (L && !kn.length && has('T') >= 0 && Math.random() < [0, .55, .9][L]) return play('T');
    for (let c = 0; c < 5; c++) {
      const id = 'c' + c, k = cnt(id);
      if (k >= 2 && tg >= 0 && Math.random() < [.35, .7, .9][L]) {
        const idx = []; H.forEach((x, i) => { if (x === id && idx.length < (k >= 3 && L ? 3 : 2)) idx.push(i); });
        const o = { cards: idx, target: tg };
        if (idx.length === 3) o.name = L === 2 ? 'D' : pick(['D', 'N', 'A', 'S']);
        return Object.assign({ t: 'play' }, o);
      }
    }
    if (has('F') >= 0 && tg >= 0 && Math.random() < [.3, .55, .7][L]) return play('F', { target: tg });
    if (has('A') >= 0 && Math.random() < [.05, .15, .22][L]) return play('A');
    if (has('H') >= 0 && Math.random() < [.08, .1, .1][L]) return play('H');
    if (!L && has('S') >= 0 && Math.random() < .12) return play('S');
    return { t: 'draw' };
  }

  const EK_I = 'stroke="#1b1030" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  const EK_I2 = 'stroke="#1b1030" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  const ekEye = (x, y, col, rx = 4.6, ry = 5.6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col || '#fff'}" ${EK_I2}/><ellipse cx="${x}" cy="${y + .4}" rx="1.5" ry="${ry - 1.4}" fill="#1b1030"/>`;
  const ekFace = (fill, o = {}) => `<path d="M-20,-5L-18,-27L-4,-16ZM20,-5L18,-27L4,-16Z" fill="${fill}" ${EK_I}/><path d="M-17,-10L-15.5,-21L-8.5,-15.5ZM17,-10L15.5,-21L8.5,-15.5Z" fill="${o.ear || '#ff9db5'}"/><ellipse rx="23" ry="19.5" fill="${fill}" ${EK_I}/>${o.mid || ''}${ekEye(-9, -2, o.eye)}${ekEye(9, -2, o.eye)}${o.brow ? `<path d="M-16,-11L-4,-6M16,-11L4,-6" ${EK_I}/>` : ''}<path d="M-3,5.5h6l-3,3.6z" fill="#ff6f95" ${EK_I2}/>${o.mouth || `<path d="M0,9q-4.5,5-9,1.5M0,9q4.5,5 9,1.5" fill="none" ${EK_I2}/>`}<path d="M-24,3l-13,-3M-24,7l-13,3M24,3l13,-3M24,7l13,3" fill="none" stroke="#1b1030" stroke-width="1.6" stroke-linecap="round"/>`;
  const ekStar = (cx, cy, r1, r2, n, rot) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1); }
    return d + 'Z';
  };
  const ekSpark = (x, y, s, f = '#fff') => `<path d="M${x},${y - s}Q${x},${y} ${x + s},${y}Q${x},${y} ${x},${y + s}Q${x},${y} ${x - s},${y}Q${x},${y} ${x},${y - s}Z" fill="${f}"/>`;
  const ekPaw = (x, y, s, fill, o = '') => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="8" rx="15" ry="12.5" fill="${fill}" ${EK_I}/><ellipse cx="-18" cy="-8" rx="6.2" ry="8.2" transform="rotate(-24 -18 -8)" fill="${fill}" ${EK_I}/><ellipse cx="-6.5" cy="-17" rx="6.2" ry="8.6" fill="${fill}" ${EK_I}/><ellipse cx="6.5" cy="-17" rx="6.2" ry="8.6" fill="${fill}" ${EK_I}/><ellipse cx="18" cy="-8" rx="6.2" ry="8.2" transform="rotate(24 18 -8)" fill="${fill}" ${EK_I}/>${o}</g>`;

  const EK_ART = {
    K: `<path d="${ekStar(50, 52, 47, 30, 11, .2)}" fill="#ffd23f" ${EK_I}/><path d="${ekStar(50, 52, 36, 23, 11, .5)}" fill="#ff7a1a" ${EK_I2}/><g transform="translate(50 56) scale(1.3)">${ekFace('#2d2144', { eye: '#ffe95c', brow: 1, ear: '#7a2d52', mouth: `<path d="M-9,10q9,6 18,0" fill="#fff" ${EK_I2}/><path d="M-5,11.5l1.8,3.6l1.8,-3zM3.4,11.7l1.8,3.6l1.8,-3.6z" fill="#1b1030"/>` })}</g><path d="M50,24q-2,-9 8,-13" fill="none" ${EK_I}/>${ekSpark(60, 10, 7, '#fff7a8')}${ekSpark(18, 22, 5, '#fff')}${ekSpark(84, 76, 5, '#fff')}`,
    D: `<circle cx="40" cy="66" r="25" fill="#2d2144" ${EK_I}/><path d="M23,58a18,18 0 0 1 13,-11" stroke="#8b78c8" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="33" y="36" width="15" height="11" rx="2.5" fill="#8b8fa8" ${EK_I}/><path d="M40,36q0,-9 -6,-14" fill="none" ${EK_I}/><path d="M58,20q8,-3 12,3" fill="none" ${EK_I}/><g transform="translate(48 22) rotate(18) scale(1.5)"><path d="M0,0L-17,-9L-16,-4Z" fill="#e8ecf5" ${EK_I2}/><path d="M0,0L-17,5L-16,0Z" fill="#e8ecf5" ${EK_I2}/><path d="M0,0L10,8M0,0L10,-1" stroke="#1b1030" stroke-width="2.4" stroke-linecap="round"/><circle cx="14" cy="11" r="5" fill="none" stroke="#1b1030" stroke-width="2.6"/><circle cx="14" cy="-2" r="5" fill="none" stroke="#1b1030" stroke-width="2.6"/></g>${ekSpark(82,54,8,'#fff')}${ekSpark(14,30,6,'#b8ffd7')}${ekSpark(78,86,5,'#fff')}`,
    N: `<circle cx="50" cy="50" r="40" fill="#fff" ${EK_I}/>${ekPaw(50, 54, .95, '#1b1030')}<circle cx="50" cy="50" r="30" fill="none" stroke="#e5484d" stroke-width="9"/><path d="M29,71L71,29" stroke="#e5484d" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="50" r="34.5" fill="none" stroke="#1b1030" stroke-width="2"/><circle cx="50" cy="50" r="25.5" fill="none" stroke="#1b1030" stroke-width="2"/>`,
    A: `<path d="M12,20Q40,44 22,92" fill="none" stroke="#fff1d8" stroke-width="7" stroke-linecap="round"/><path d="M32,12Q60,40 44,96" fill="none" stroke="#fff1d8" stroke-width="7" stroke-linecap="round" opacity=".85"/><path d="M52,10Q80,36 66,96" fill="none" stroke="#fff1d8" stroke-width="7" stroke-linecap="round" opacity=".7"/>${ekPaw(62, 58, 1.12, '#ffe6c2', '<path d="M-24,-14l-2,-16 6,13zM-12,-24l-2,-18 7,16zM2,-24l2,-18 4,18zM14,-14l4,-16 2,16z" fill="#fff" stroke="#1b1030" stroke-width="2" stroke-linejoin="round"/>')}${ekSpark(18, 66, 6, '#fff3b0')}`,
    S: `<path d="M12,28h14M6,50h22M12,72h14" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/><path d="M32,20L58,50L32,80" fill="none" stroke="#1b1030" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M58,20L84,50L58,80" fill="none" stroke="#1b1030" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M32,20L58,50L32,80" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="M58,20L84,50L58,80" fill="none" stroke="#ffe95c" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`,
    F: `<path d="M50,44C26,28 30,8 44,10Q50,12 50,20Q50,12 56,10C70,8 74,28 50,44Z" fill="#ff5d8f" ${EK_I} transform="translate(0 -2) scale(1.1) translate(-5 4)"/>${ekPaw(50, 72, 1.05, '#fff1d8')}${ekSpark(16, 30, 7, '#fff')}${ekSpark(86, 44, 6, '#fff')}<path d="M30,84q20,12 40,0" fill="none" stroke="#1b1030" stroke-width="0"/>`,
    H: `<g transform="translate(50 52)"><g transform="rotate(-26) translate(-4 -2)"><rect x="-13" y="-19" width="26" height="38" rx="4" fill="#ffe95c" ${EK_I2}/></g><g transform="rotate(26) translate(4 -2)"><rect x="-13" y="-19" width="26" height="38" rx="4" fill="#ff8a8a" ${EK_I2}/></g><rect x="-13" y="-21" width="26" height="38" rx="4" fill="#fff" ${EK_I2}/><circle cy="-2" r="7" fill="#9b5de5" ${EK_I2}/></g><path d="M14,40A38,38 0 0 1 56,12" fill="none" stroke="#1b1030" stroke-width="11" stroke-linecap="round"/><path d="M14,40A38,38 0 0 1 56,12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M86,60A38,38 0 0 1 44,88" fill="none" stroke="#1b1030" stroke-width="11" stroke-linecap="round"/><path d="M86,60A38,38 0 0 1 44,88" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M54,2L68,12L54,22Z" fill="#fff" ${EK_I2}/><path d="M46,98L32,88L46,78Z" fill="#fff" ${EK_I2}/>`,
    T: `<path d="M28,92Q50,80 72,92L68,76H32Z" fill="#c9923a" ${EK_I}/><circle cx="50" cy="44" r="31" fill="url(#ekball)" ${EK_I}/><path d="M28,32A26,26 0 0 1 46,18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/><ellipse cx="50" cy="46" rx="14" ry="9" fill="#fff6a8" ${EK_I2}/><ellipse cx="50" cy="46" rx="3.4" ry="9" fill="#1b1030"/>${ekSpark(12, 18, 7, '#fff')}${ekSpark(88, 30, 6, '#fff3b0')}${ekSpark(84, 76, 5, '#fff')}<defs><radialGradient id="ekball" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#bff4ff"/><stop offset=".6" stop-color="#7b6bff"/><stop offset="1" stop-color="#3a1f9a"/></radialGradient></defs>`,
    c0: `<g transform="translate(50 40) scale(1.12)">${ekFace('#ffb86b', { ear: '#ff8d6b' })}</g><path d="M6,60Q6,95 50,95Q94,95 94,60Z" fill="#ffd23f" ${EK_I}/><path d="M6,60Q14,52 22,60Q30,52 38,60Q46,52 54,60Q62,52 70,60Q78,52 86,60Q92,54 94,60" fill="#5bd16b" ${EK_I2}/><circle cx="26" cy="72" r="4.4" fill="#e5484d" ${EK_I2}/><circle cx="48" cy="78" r="4.8" fill="#e5484d" ${EK_I2}/><circle cx="72" cy="71" r="4" fill="#e5484d" ${EK_I2}/><path d="M16,84Q50,96 84,84" fill="none" stroke="#e59a10" stroke-width="3" stroke-linecap="round"/>`,
    c1: `<path d="M50,92C20,92 8,70 14,48C20,28 38,22 52,22C70,22 90,30 90,56C90,80 74,92 50,92Z" fill="#b98863" ${EK_I}/><path d="M26,34L24,12L40,26ZM74,34L76,12L60,26Z" fill="#b98863" ${EK_I}/><path d="M30,60q4,-3 8,0M60,76q4,-3 8,0M70,46q4,-3 8,0" fill="none" stroke="#8a5f3e" stroke-width="3" stroke-linecap="round"/>${ekEye(36, 52)}${ekEye(64, 52)}<path d="M46,62h8l-4,4.5z" fill="#ff6f95" ${EK_I2}/><path d="M50,67q-5,6 -11,2M50,67q5,6 11,2" fill="none" ${EK_I2}/><path d="M44,22q-6,-10 2,-18M52,22q0,-12 8,-16M58,23q6,-8 14,-8" fill="none" stroke="#1b1030" stroke-width="2.4" stroke-linecap="round"/><path d="M16,60l-10,-3M16,66l-10,4M84,60l10,-3M84,66l10,4" fill="none" stroke="#1b1030" stroke-width="1.6" stroke-linecap="round"/>`,
    c2: `<g transform="translate(46 38) scale(1.15)">${ekFace('#ffd2e8', { ear: '#ff8fc4', mouth: `<ellipse cx="0" cy="12" rx="6" ry="5.5" fill="#7a1f4a" ${EK_I2}/>` })}</g><path d="M46,54Q74,62 78,96" fill="none" stroke="#1b1030" stroke-width="18" stroke-linecap="round"/><path d="M46,54Q74,62 78,96" fill="none" stroke="#ff4d4d" stroke-width="3.2" stroke-linecap="round" transform="translate(-7 0)"/><path d="M46,54Q74,62 78,96" fill="none" stroke="#ff9f1a" stroke-width="3.2" stroke-linecap="round" transform="translate(-3.4 0)"/><path d="M46,54Q74,62 78,96" fill="none" stroke="#ffe95c" stroke-width="3.2" stroke-linecap="round"/><path d="M46,54Q74,62 78,96" fill="none" stroke="#43c06a" stroke-width="3.2" stroke-linecap="round" transform="translate(3.4 0)"/><path d="M46,54Q74,62 78,96" fill="none" stroke="#3f8cff" stroke-width="3.2" stroke-linecap="round" transform="translate(7 0)"/>${ekSpark(14, 84, 6, '#fff')}${ekSpark(88, 22, 6, '#fff')}`,
    c3: `<path d="M6,44A44,46 0 0 0 94,44Z" fill="#4fcf75" ${EK_I}/><path d="M12,44A38,40 0 0 0 88,44Z" fill="#fff3c4"/><path d="M16,44A34,36 0 0 0 84,44Z" fill="#ff5d73"/><path d="M6,44H94" stroke="#1b1030" stroke-width="3"/><path d="M14,44L10,24L28,36ZM86,44L90,24L72,36Z" fill="#4fcf75" ${EK_I}/><path d="M16,40L14,30L22,36ZM84,40L86,30L78,36Z" fill="#ff9db5"/>${ekEye(36, 56)}${ekEye(64, 56)}<path d="M46,66h8l-4,4.5z" fill="#1b1030"/><path d="M50,71q-5,6 -11,2M50,71q5,6 11,2" fill="none" ${EK_I2}/><ellipse cx="26" cy="74" rx="2.4" ry="3.6" fill="#1b1030" transform="rotate(20 26 74)"/><ellipse cx="74" cy="74" rx="2.4" ry="3.6" fill="#1b1030" transform="rotate(-20 74 74)"/><ellipse cx="50" cy="82" rx="2.4" ry="3.6" fill="#1b1030"/>`,
    c4: `<g transform="translate(50 36) scale(1.1)">${ekFace('#c9d0ff', { ear: '#9aa6ff' })}</g><path d="M22,50Q12,64 22,74Q20,88 36,88Q42,98 50,93Q58,98 64,88Q80,88 78,74Q88,64 78,50Q66,60 50,58Q34,60 22,50Z" fill="#efeae0" ${EK_I}/><path d="M32,74q6,4 8,12M68,74q-6,4 -8,12M50,66v12" fill="none" stroke="#c9c0b0" stroke-width="3" stroke-linecap="round"/><path d="M50,53Q40,46 30,52Q24,56 28,61Q32,63 34,60Q44,64 50,58Q56,64 66,60Q68,63 72,61Q76,56 70,52Q60,46 50,53Z" fill="#8a6a46" ${EK_I2}/>`
  };

  const EK_CL = { K: ['#2a1b46', '#0f0a1e'], D: ['#3ac37e', '#127a4a'], N: ['#f0555c', '#8c1a2b'], A: ['#ff9a4a', '#c43d0a'], S: ['#4b98ff', '#1a4fb8'], F: ['#ffd95a', '#e08f10'], H: ['#a96bff', '#5a2aa8'], T: ['#2fd3d6', '#0b6a96'], c0: ['#ffc15e', '#e07b1c'], c1: ['#c9976f', '#7e5535'], c2: ['#ff8fcf', '#c2328f'], c3: ['#6bdc8f', '#1f8f55'], c4: ['#9ea9ff', '#4a56c9'] };
  const ekCardHTML = (id, extra) => `<div class="ekc ${ekCat(id) ? 'cat ' : ''}${id}${extra ? ' ' + extra : ''}" style="--c1:${EK_CL[id][0]};--c2:${EK_CL[id][1]}"><div class="ekf"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${EK_ART[id]}</svg><b>${EK_N[id]}</b></div></div>`;
  const ekBackHTML = extra => `<div class="ekc bk${extra ? ' ' + extra : ''}"><div class="ekf"><svg viewBox="0 0 100 100"><path d="${ekStar(50, 50, 40, 25, 10, .15)}" fill="#ffb02e" stroke="#fff3c4" stroke-width="3" stroke-linejoin="round"/><path d="M30,60L32,34L44,46ZM70,60L68,34L56,46Z" fill="#1b1030"/><ellipse cx="50" cy="56" rx="21" ry="17" fill="#1b1030"/><ellipse cx="42" cy="54" rx="3.4" ry="4.6" fill="#ffe95c"/><ellipse cx="58" cy="54" rx="3.4" ry="4.6" fill="#ffe95c"/></svg></div></div>`;

  const EK_CSS = css(`
.gm-exploding-kittens{--tbg:#2b1646;--a1:#ff7a1a;--a2:#ffd23f;--b1:#7b4dd6}
.gm-exploding-kittens .tb{background:radial-gradient(ellipse at 50% 38%,#4a2478,#241042 70%);border:3px solid #130828}
.gm-exploding-kittens .tb-pane.solid,.gm-exploding-kittens .tb-pane.clear{background:transparent}
.gm-exploding-kittens .ekc{position:relative;width:100%;aspect-ratio:5/7;container-type:size;border-radius:9%/6.5%;background:#fff;box-shadow:0 .5cqh 0 rgba(0,0,0,.3),0 1cqh 2cqh rgba(0,0,0,.28);flex:none}
.gm-exploding-kittens .ekf{position:absolute;inset:4.5%;border-radius:7%/5%;background:linear-gradient(160deg,var(--c1),var(--c2));overflow:hidden;display:flex;flex-direction:column;border:.6cqh solid #1b1030}
.gm-exploding-kittens .ekf svg{flex:1;min-height:0;width:100%;padding:2% 4% 0;display:block}
.gm-exploding-kittens .ekf b{flex:none;display:grid;place-items:center;text-align:center;height:21%;font:900 6.4cqh/1.02 var(--sans);color:#fff;-webkit-text-stroke:1.5cqh #1b1030;paint-order:stroke fill;padding:0 3%;text-transform:uppercase;background:rgba(0,0,0,.2)}
.gm-exploding-kittens .ekc.bk .ekf{background:radial-gradient(circle at 50% 46%,#6b34a8,#1b1030 72%)}
.gm-exploding-kittens .ekc.bk .ekf svg{padding:6%}
.gm-exploding-kittens .tb-fly .ekc{width:100%;height:100%;aspect-ratio:auto}
.gm-exploding-kittens kbd{font:800 1.1t var(--sans);background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.5);border-radius:.6u;padding:0 .5u;margin-left:.6u}
.gm-exploding-kittens label{display:block;font:800 1.15t var(--sans);letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.62);margin-top:.6u;text-align:center}
.gm-exploding-kittens .cnt{position:absolute;right:-.7u;top:-.7u;min-width:2.1u;padding:.1u .5u;border-radius:1u;background:#1a1330;border:2px solid #fff;color:#fff;font:900 1.3t var(--sans);text-align:center;z-index:3}
.gm-exploding-kittens .slot{width:100%;aspect-ratio:5/7;border-radius:9%/6.5%;border:.25u dashed rgba(255,255,255,.28)}
.gm-exploding-kittens .ekc.q .ekf{background:#3a2a66;display:grid;place-items:center}
.gm-exploding-kittens .ekc.q i{font:900 44cqh var(--sans);font-style:normal;color:#fff}
.gm-exploding-kittens .ek-ui{position:absolute;inset:0;display:flex;flex-direction:column;padding:4.4u 1.4u .8u}
.gm-exploding-kittens .ek-bar{position:absolute;left:50%;top:.8u;transform:translateX(-50%);padding:.4u 2u;border-radius:2u;background:rgba(0,0,0,.4);font:900 1.6t var(--sans);white-space:nowrap;z-index:2}
.gm-exploding-kittens .ek-bar.me{background:#ffd23f;color:#2a1e00}
.gm-exploding-kittens .ek-bar.nope{background:#e5484d}
.gm-exploding-kittens .ek-opps{display:flex;justify-content:center;gap:1.2u;flex:none}
.gm-exploding-kittens .ek-op{position:relative;width:20u;padding:.7u .9u .8u;border-radius:1.2u;background:rgba(0,0,0,.28);border:2px solid transparent;flex:none}
.gm-exploding-kittens .ek-opps.n1 .ek-op{width:30u}
.gm-exploding-kittens .ek-op.turn{border-color:#ffd23f;background:rgba(255,210,63,.14);box-shadow:0 0 1.5u rgba(255,210,63,.4)}
.gm-exploding-kittens .ek-op.out{opacity:.42;filter:grayscale(.85)}
.gm-exploding-kittens .ek-op.tgt{cursor:pointer;border-color:#ffd23f;animation:ekglow .8s ease-in-out infinite alternate}
.gm-exploding-kittens .ek-op kbd{position:absolute;top:-.8u;right:-.6u;margin:0}
.gm-exploding-kittens .ek-on{display:flex;align-items:center;gap:.5u;font:800 1.35t var(--sans);min-width:0}
.gm-exploding-kittens .ek-on .av{width:2.4u;height:2.4u;min-width:16px;min-height:16px;font-size:1.1t}
.gm-exploding-kittens .ek-on b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-exploding-kittens .ek-on em{font:900 1.3t var(--sans);font-style:normal;background:#ff7a1a;border-radius:1u;padding:0 .5u}
.gm-exploding-kittens .ek-or{display:flex;align-items:center;gap:.8u;margin-top:.5u;height:3.9u}
.gm-exploding-kittens .ek-ofan{display:flex;align-items:center;flex:1;min-width:0}
.gm-exploding-kittens .ek-ofan i{display:block;width:2.6u;height:3.7u;border-radius:.45u;margin-left:-1.5u;background:linear-gradient(#7a3fc0,#2a1450);border:1.5px solid #fff3c4;flex:none}
.gm-exploding-kittens .ek-ofan i:first-child{margin-left:0}
.gm-exploding-kittens .ek-ofan i.e{background:transparent;border:2px dashed rgba(255,255,255,.3)}
.gm-exploding-kittens .ek-cn{font:900 1.8t var(--sans)}
.gm-exploding-kittens .ek-mid{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;padding:.6u 0}
.gm-exploding-kittens .ek-cen{display:flex;align-items:center;justify-content:center;gap:3u}
.gm-exploding-kittens .ek-deck,.gm-exploding-kittens .ek-disc{--cw:9.4u;position:relative;width:var(--cw);flex:none;text-align:center;border-radius:1u}
.gm-exploding-kittens .ek-stk{position:relative}
.gm-exploding-kittens .ek-stk .ekc.s0{position:relative}
.gm-exploding-kittens .ek-stk .ekc.s1,.gm-exploding-kittens .ek-stk .ekc.s2{position:absolute;left:0;top:0}
.gm-exploding-kittens .ek-stk .ekc.s1{transform:translate(.35u,.35u)}
.gm-exploding-kittens .ek-stk .ekc.s2{transform:translate(.7u,.7u)}
.gm-exploding-kittens .ek-stk .ekc.s0{transform:translate(-.2u,-.2u)}
.gm-exploding-kittens .ek-deck.go{cursor:pointer;animation:ekglow .9s ease-in-out infinite alternate}
.gm-exploding-kittens .ek-ctr{width:36u;min-height:15u;display:flex;align-items:center;justify-content:center}
.gm-exploding-kittens .ek-pend{display:flex;flex-direction:column;align-items:center;gap:.6u}
.gm-exploding-kittens .ek-pcs{display:flex;align-items:center;justify-content:center;padding-right:1.5u}
.gm-exploding-kittens .ek-pc{width:8.4u;margin:0 -.8u}
.gm-exploding-kittens .ek-pn{position:relative;width:6.2u;margin-left:-2.2u;transform:rotate(calc(var(--j)*7deg - 4deg));z-index:2}
.gm-exploding-kittens .ek-pn em{position:absolute;left:-1u;right:-1u;bottom:-1.7u;text-align:center;font:800 1t var(--sans);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
.gm-exploding-kittens .ek-pt{margin:.3u 0 0;font:800 1.35t/1.25 var(--sans);text-align:center;max-width:36u;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.gm-exploding-kittens .ek-pt b.no{color:#ff7b7b}.gm-exploding-kittens .ek-pt b.yes{color:#7dffb0}
.gm-exploding-kittens .ek-tm{width:22u;height:.8u;border-radius:1u;background:rgba(255,255,255,.18);overflow:hidden}
.gm-exploding-kittens .ek-tm i{display:block;height:100%;background:#ff6a58;animation:ektm linear forwards}
@keyframes ektm{from{width:100%}to{width:0}}
.gm-exploding-kittens .ek-kz{width:10u}
.gm-exploding-kittens .ek-acts{display:flex;gap:1u;justify-content:center;align-items:center;min-height:4.8u}
.gm-exploding-kittens .ek-btn{min-height:4.4u;padding:0 2.2u;border-radius:1.4u;border:0;font:900 1.6t var(--sans);color:#fff;background:#6a4fb0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25),0 3px 8px rgba(0,0,0,.3)}
.gm-exploding-kittens .ek-btn:active{transform:translateY(2px)}
.gm-exploding-kittens .ek-btn.play{background:#2fb36d}
.gm-exploding-kittens .ek-btn.draw{background:#ff7a1a}
.gm-exploding-kittens .ek-btn.nope{background:#e5484d;font-size:2.2t;padding:0 3.4u;animation:ekpulse .45s ease-in-out infinite alternate}
@keyframes ekpulse{from{transform:scale(1)}to{transform:scale(1.08)}}
@keyframes ekglow{from{filter:drop-shadow(0 0 .2u #ffd23f)}to{filter:drop-shadow(0 0 1.3u #ffd23f)}}
.gm-exploding-kittens .ek-info{display:flex;align-items:center;justify-content:center;gap:2.4u;font:700 1.25t var(--sans);color:rgba(255,255,255,.72);min-height:3.6u}
.gm-exploding-kittens .ek-info .kit svg{width:3.4u;height:3.2u;vertical-align:-1u;margin-right:.6u}
.gm-exploding-kittens .ek-info .kit b{color:#ffd23f}
.gm-exploding-kittens .ek-kn{display:flex;align-items:center;gap:.5u}
.gm-exploding-kittens .ek-kn span{margin-right:.4u;font-weight:800}
.gm-exploding-kittens .ek-mc{width:2.9u}
.gm-exploding-kittens .ek-mc.k .ekc{box-shadow:0 0 0 .25u #ff4d4d,0 0 1u #ff4d4d}
.gm-exploding-kittens .ek-me{flex:none;margin:0 -1.4u -.8u;padding:.2u 1u .6u;display:flex;flex-direction:column;align-items:center;gap:.2u;background:linear-gradient(transparent,rgba(0,0,0,.3))}
.gm-exploding-kittens .ek-me.turn{background:linear-gradient(transparent,rgba(255,210,63,.18))}
.gm-exploding-kittens .ek-hint{min-height:2.6u;display:flex;align-items:center;font:700 1.3t/1.2 var(--sans);color:rgba(255,255,255,.78);text-align:center;max-width:92u;pointer-events:none}
.gm-exploding-kittens .ek-hint b{color:#ffd23f;margin-right:.5u}
.gm-exploding-kittens .ek-hand{display:flex;justify-content:center;align-items:flex-end;height:17u;padding-top:2.8u;width:100%}
.gm-exploding-kittens .ek-hc{--cw:10.8u;width:var(--cw);flex:none;position:relative;cursor:pointer;transition:transform .12s;touch-action:manipulation}
.gm-exploding-kittens .ek-hc:hover{transform:translateY(-.8u)}
.gm-exploding-kittens .ek-hc.sel{transform:translateY(-2.8u)}
.gm-exploding-kittens .ek-hc.sel .ekc{box-shadow:0 0 0 .3u #ffd23f,0 0 1.8u #ffd23f}
.gm-exploding-kittens .ek-hc.glow .ekc{animation:ekglowc .6s ease-in-out infinite alternate}
@keyframes ekglowc{from{box-shadow:0 0 0 .2u #fff,0 0 .6u #ffd23f}to{box-shadow:0 0 0 .3u #ffd23f,0 0 2u #ffd23f}}
.gm-exploding-kittens .ek-hc.cur .ekc{outline:.3u dashed #fff;outline-offset:.2u}
.gm-exploding-kittens .ek-ovl{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:1.5u;background:rgba(10,4,24,.64);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.gm-exploding-kittens .ek-dlg{width:min(100%,54u);background:linear-gradient(#2a3552,#161d33);border:3px solid rgba(255,255,255,.16);border-radius:2.4u;padding:1.8u 2u 1.6u;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:tbin .3s cubic-bezier(.2,1.4,.4,1)}
.gm-exploding-kittens .ek-dlg.wide{width:min(100%,84u)}
.gm-exploding-kittens .ek-dlg h3{margin:.2u 0 .6u;font:900 2.4t var(--sans)}
.gm-exploding-kittens .ek-ins{display:flex;gap:2.4u;align-items:center;justify-content:center;margin:.8u 0}
.gm-exploding-kittens .ek-ins .ek-kz{width:11u;flex:none}
.gm-exploding-kittens .ek-ctl{flex:1;text-align:left;min-width:0}
.gm-exploding-kittens .ek-bar2{display:flex;gap:1px;height:3.2u;align-items:center}
.gm-exploding-kittens .ek-bar2 i{flex:1;height:70%;background:rgba(255,255,255,.2);border-radius:1px}
.gm-exploding-kittens .ek-bar2 i.on{background:#ff7a1a;height:100%}
.gm-exploding-kittens .ek-lb{display:flex;justify-content:space-between;font:800 1.1t var(--sans);opacity:.65}
.gm-exploding-kittens .ek-ctl input{width:100%;height:3.4u;accent-color:#ff7a1a;margin:.4u 0}
.gm-exploding-kittens .ek-pos{margin:.2u 0 .6u;font:800 1.45t var(--sans);color:#ffd23f}
.gm-exploding-kittens .ek-names{display:grid;grid-template-columns:repeat(6,1fr);gap:1u;margin:.8u 0 1u}
.gm-exploding-kittens .ek-names button{background:none;border:0;padding:0;cursor:pointer;transition:transform .1s}
.gm-exploding-kittens .ek-names button:hover{transform:translateY(-.5u) scale(1.05)}
.gm-exploding-kittens .ek-pk{display:flex;gap:1.6u;justify-content:center;margin:1u 0}
.gm-exploding-kittens .ek-pk>div{width:11.5u;animation:ekflip .5s both;animation-delay:var(--d)}
.gm-exploding-kittens .ek-pk span{display:block;font:900 1.3t var(--sans);color:#ffd23f;margin-bottom:.4u;text-transform:uppercase;letter-spacing:1px}
@keyframes ekflip{from{transform:rotateY(90deg) scale(.8);opacity:0}to{transform:none;opacity:1}}
.gm-exploding-kittens .ek-fx{position:absolute;inset:0;pointer-events:none;z-index:35;overflow:hidden}
.gm-exploding-kittens .ek-fx.dim::before{content:'';position:absolute;inset:0;background:rgba(10,4,24,.74);animation:ekfade .3s}
@keyframes ekfade{from{opacity:0}to{opacity:1}}
.gm-exploding-kittens .ek-anchor{position:absolute;left:50%;top:48%;width:15u;height:21u;transform:translate(-50%,-50%);pointer-events:none}
.gm-exploding-kittens .ek-big{position:absolute;z-index:3}
.gm-exploding-kittens .ek-big.dead{filter:grayscale(.9) brightness(.55);transform:translate(-7u,.6u) rotate(-12deg) scale(.9);transition:all .4s}
.gm-exploding-kittens .ek-big.dz{transform:translate(2u,0) rotate(8deg)}
.gm-exploding-kittens .ek-big.boom{animation:ekboom .55s forwards}
@keyframes ekboom{to{transform:scale(2.4);opacity:0;filter:brightness(4)}}
.gm-exploding-kittens .ek-flash{position:absolute;inset:0;background:#fff;animation:ekflash .65s forwards}
@keyframes ekflash{from{opacity:.95}to{opacity:0}}
.gm-exploding-kittens .ek-ban{position:absolute;left:50%;top:38%;font:900 6t var(--sans);letter-spacing:2px;color:#fff;-webkit-text-stroke:.5u #1b1030;paint-order:stroke fill;text-shadow:0 .6u 0 rgba(0,0,0,.3);white-space:nowrap;animation:ekslam 1s both;text-align:center;z-index:5}
.gm-exploding-kittens .ek-ban small{display:block;font:800 1.8t var(--sans);letter-spacing:.2px;-webkit-text-stroke:0;text-shadow:0 2px 4px #000}
.gm-exploding-kittens .ek-ban.attack{color:#ff9a4a}.gm-exploding-kittens .ek-ban.skip{color:#6fb0ff}.gm-exploding-kittens .ek-ban.shuf{color:#c79bff}.gm-exploding-kittens .ek-ban.good{color:#7dffb0}.gm-exploding-kittens .ek-ban.bad{color:#ff5959;font-size:7t}
.gm-exploding-kittens .ek-ban.small{font-size:2.4t;top:46%;letter-spacing:.3px;-webkit-text-stroke:.35u #1b1030;animation-name:ekrise}
@keyframes ekslam{0%{transform:translate(-50%,-50%) scale(2.6) rotate(-6deg);opacity:0}16%{transform:translate(-50%,-50%) scale(.94) rotate(-3deg);opacity:1}28%{transform:translate(-50%,-50%) scale(1.04) rotate(-3deg)}80%{opacity:1}100%{transform:translate(-50%,-58%) scale(1) rotate(-3deg);opacity:0}}
@keyframes ekrise{0%{transform:translate(-50%,-30%);opacity:0}15%{transform:translate(-50%,-50%);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-80%);opacity:0}}
.gm-exploding-kittens .ek-stamp{position:absolute;transform:translate(-50%,-50%) rotate(-14deg);font:900 4.6t var(--sans);color:#e5484d;border:.5u solid #e5484d;padding:.1u 1.4u;border-radius:1u;background:rgba(255,255,255,.92);animation:ekstamp .9s both;z-index:6;white-space:nowrap;left:50%;top:50%}
@keyframes ekstamp{0%{transform:translate(-50%,-50%) rotate(-14deg) scale(3.2);opacity:0}20%{transform:translate(-50%,-50%) rotate(-14deg) scale(1);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-50%) rotate(-14deg) scale(1);opacity:0}}
.gm-exploding-kittens .ek-logo{display:flex;flex-direction:column;align-items:center;margin:.2u 0 .8u}
.gm-exploding-kittens .ek-logo svg{width:13u;height:13u;min-width:70px;min-height:70px;animation:eklg 1.6s ease-in-out infinite alternate}
.gm-exploding-kittens .ek-logo b{font:900 4.6t/1 var(--sans);color:#fff;letter-spacing:1px;-webkit-text-stroke:.5u #1b1030;paint-order:stroke fill;text-shadow:0 .5u 0 rgba(0,0,0,.35)}
.gm-exploding-kittens .ek-logo b+b{color:#ffd23f}
@keyframes eklg{from{transform:rotate(-4deg) scale(1)}to{transform:rotate(4deg) scale(1.06)}}
.gm-exploding-kittens .tb.port .ek-ui{padding:11u 1.4u .8u}
.gm-exploding-kittens .tb.port .ek-bar{top:2.4u;font-size:3.6t;padding:.8u 3.4u}
.gm-exploding-kittens .tb.port .ek-opps{flex-wrap:wrap;gap:1u}
.gm-exploding-kittens .tb.port .ek-op{width:calc(50% - .5u);padding:1.2u 1.4u 1.4u}
.gm-exploding-kittens .tb.port .ek-opps.n1 .ek-op{width:70%}
.gm-exploding-kittens .tb.port .ek-on{font-size:3.3t;gap:1u}
.gm-exploding-kittens .tb.port .ek-on .av{width:5.6u;height:5.6u;font-size:2.8t}
.gm-exploding-kittens .tb.port .ek-on em{font-size:3t}
.gm-exploding-kittens .tb.port .ek-or{height:7.4u;gap:1.4u}
.gm-exploding-kittens .tb.port .ek-ofan i{width:4.8u;height:6.8u;margin-left:-3.1u;border-radius:.8u}
.gm-exploding-kittens .tb.port .ek-cn{font-size:3.8t}
.gm-exploding-kittens .tb.port .ek-op kbd{font-size:2.6t}
.gm-exploding-kittens .tb.port .ek-deck,.gm-exploding-kittens .tb.port .ek-disc{--cw:19u}
.gm-exploding-kittens .tb.port .ek-cen{gap:1.6u}
.gm-exploding-kittens .tb.port .ek-ctr{width:50u;min-height:28u}
.gm-exploding-kittens .tb.port .ek-pc{width:16u;margin:0 -1.2u}
.gm-exploding-kittens .tb.port .ek-pn{width:11u;margin-left:-4u}
.gm-exploding-kittens .tb.port .ek-pn em{font-size:2.4t;bottom:-3.4u}
.gm-exploding-kittens .tb.port .ek-pt{font-size:3.2t;max-width:50u}
.gm-exploding-kittens .tb.port .ek-tm{width:38u;height:1.4u}
.gm-exploding-kittens .tb.port .ek-kz{width:18u}
.gm-exploding-kittens .tb.port label{font-size:2.6t}
.gm-exploding-kittens .tb.port .cnt{font-size:2.8t;min-width:4.6u;right:-1.2u;top:-1.2u}
.gm-exploding-kittens .tb.port .ek-btn{min-height:9.5u;font-size:3.6t;padding:0 4u;border-radius:3u}
.gm-exploding-kittens .tb.port .ek-btn.nope{font-size:5t}
.gm-exploding-kittens .tb.port .ek-acts{min-height:10u;gap:2u;flex-wrap:wrap}
.gm-exploding-kittens .tb.port .ek-info{font-size:2.8t;flex-direction:column;gap:.8u;min-height:7u}
.gm-exploding-kittens .tb.port .ek-info .kit svg{width:7u;height:6.6u}
.gm-exploding-kittens .tb.port .ek-mc{width:6.4u}
.gm-exploding-kittens .tb.port .ek-me{margin:0 -1.4u -.8u;padding:.4u 1.4u 1.4u}
.gm-exploding-kittens .tb.port .ek-hint{min-height:6.4u;font-size:3t}
.gm-exploding-kittens .tb.port .ek-hand{height:35u;padding-top:5.4u}
.gm-exploding-kittens .tb.port .ek-hand{justify-content:flex-start;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
.gm-exploding-kittens .tb.port .ek-hand::-webkit-scrollbar{display:none}
.gm-exploding-kittens .tb.port .ek-hc:first-child{margin-left:auto}
.gm-exploding-kittens .tb.port .ek-hc:last-child{margin-right:auto}
.gm-exploding-kittens .tb.port .ek-hc{--cw:21u}
.gm-exploding-kittens .tb.port .ek-hc.sel{transform:translateY(-5u)}
.gm-exploding-kittens .tb.port .ek-dlg{width:100%;padding:3.6u 3.4u 3.2u;border-radius:5u}
.gm-exploding-kittens .tb.port .ek-dlg h3{font-size:5.4t}
.gm-exploding-kittens .tb.port .ek-ins{flex-direction:column;gap:2u}
.gm-exploding-kittens .tb.port .ek-ins .ek-kz{width:26u}
.gm-exploding-kittens .tb.port .ek-ctl{width:100%}
.gm-exploding-kittens .tb.port .ek-bar2{height:7u}
.gm-exploding-kittens .tb.port .ek-lb{font-size:2.8t}
.gm-exploding-kittens .tb.port .ek-ctl input{height:8u}
.gm-exploding-kittens .tb.port .ek-pos{font-size:3.6t}
.gm-exploding-kittens .tb.port .ek-names{grid-template-columns:repeat(4,1fr);gap:2u}
.gm-exploding-kittens .tb.port .ek-pk{gap:2.4u}
.gm-exploding-kittens .tb.port .ek-pk>div{width:25u}
.gm-exploding-kittens .tb.port .ek-pk span{font-size:2.8t}
.gm-exploding-kittens .tb.port .ek-anchor{width:34u;height:47.6u}
.gm-exploding-kittens .tb.port .ek-ban{font-size:12t}
.gm-exploding-kittens .tb.port .ek-ban.bad{font-size:13t}
.gm-exploding-kittens .tb.port .ek-ban small{font-size:4t}
.gm-exploding-kittens .tb.port .ek-ban.small{font-size:4.6t}
.gm-exploding-kittens .tb.port .ek-stamp{font-size:10t}
.gm-exploding-kittens .tb.port .ek-logo svg{width:30u;height:30u}
.gm-exploding-kittens .tb.port .ek-logo b{font-size:10t}
`);

  const ekU = x => `calc(var(--u)*${x.toFixed(2)})`;
  const ekText = (P, info, me) => {
    const nm = q => q === me ? 'you' : info.names[q];
    const who = P.p === me ? 'You' : info.names[P.p], tg = P.target >= 0 ? nm(P.target) : '';
    const c = EK_N[P.cards[0]];
    return {
      S: `${who} played Skip`, A: `${who} played Attack`, F: `${who} asks ${tg} for a Favor`, H: `${who} played Shuffle`, T: `${who} played See the Future`,
      P: `${who} plays two ${c}s to steal from ${tg}`, R: `${who} plays three ${c}s and asks ${tg} for ${EK_N[P.name]}`
    }[P.kind];
  };

  const ekUI = h => {
    const api = h.api, root = h.board;
    root.classList.add('ek-root');
    const ui = mk('div', 'ek-ui'), fx = mk('div', 'ek-fx'), anchor = mk('div', 'ek-anchor');
    anchor.dataset.k = 'anchor';
    fx.append(anchor);
    root.append(ui, fx);
    let V = null, info = null, sel = [], mode = null, pp = null, look = null, peek = null, insPos = 0, recv = 0, late = 0, cur = 0, curK = null;

    const me = () => info.seat;
    const nm = q => q === me() ? 'You' : info.names[q];
    const myTurn = () => V && !V.over && V.phase === 'turn' && V.turn === me() && V.alive[me()];
    const myIns = () => V && !V.over && V.phase === 'insert' && V.turn === me();
    const myGive = () => V && !V.over && V.phase === 'favor' && V.pend && V.pend.target === me();
    const canNope = () => V && !V.over && V.phase === 'nope' && V.alive[me()] && V.hand.includes('N');
    const targets = () => range(0, V.n - 1).filter(q => q !== me() && V.alive[q] && V.handN[q] > 0);
    const plays = () => {
      if (!sel.length) return null;
      const ids = sel.map(i => V.hand[i]);
      if (ids.length === 1) { const c = ids[0]; return EK_ACT[c] ? { kind: c, need: c === 'F' ? 't' : '', label: 'Play ' + EK_N[c] } : null; }
      if (ekCat(ids[0]) && ids.every(c => c === ids[0])) {
        if (ids.length === 2) return { kind: 'P', need: 't', label: 'Play pair: steal' };
        if (ids.length === 3) return { kind: 'R', need: 'tn', label: 'Play three: name a card' };
      }
      return null;
    };
    const rem = () => V && V.dl ? Math.max(0, V.dl - (performance.now() - recv)) : 0;

    function status() {
      const v = V, m = me();
      if (v.over) return v.over.win === m ? 'You are the last cat standing!' : nm(v.over.win) + ' survived!';
      if (!v.alive[m]) return 'You exploded. Watching the rest...';
      if (v.phase === 'insert') return v.turn === m ? 'Defused! Hide the kitten' : nm(v.turn) + ' is hiding a kitten...';
      if (v.phase === 'favor') return v.pend.target === m ? nm(v.pend.p) + ' asks for a favor' : nm(v.pend.target) + ' is choosing a card to give';
      if (v.phase === 'nope') return canNope() ? 'Nope it?' : 'Nope window...';
      if (v.turn === m) return v.left > 1 ? `Your turn  x${v.left}` : 'Your turn';
      return nm(v.turn) + (info.bot[v.turn] ? ' is thinking...' : ' is playing...') + (v.left > 1 ? '  x' + v.left : '');
    }
    function hint() {
      if (look) return `<b>${EK_N[look]}</b> ${ekCat(look) ? EK_DESC.cat : EK_DESC[look]}`;
      if (!V.alive[me()]) return 'Better luck next time.';
      if (myGive()) return `Tap a card to give to ${esc(nm(V.pend.p))}.`;
      if (mode === 'target') return pp.kind === 'F' ? 'Tap a player to ask for a favor.' : 'Tap a player to steal from.';
      if (myTurn()) return sel.length ? 'Tap the glowing button to play, or tap the card again.' : 'Tap a card to select it, or tap the draw pile to end your turn.';
      if (canNope()) return 'Tap NOPE! or a Nope card to stop it.';
      return '&nbsp;';
    }

    function render() {
      if (!V || !info) return;
      const v = V, m = me(), port = h.port;
      const turnMine = myTurn(), cw = port ? 21 : 10.8, W = port ? 96 : 77;
      const order = []; for (let k = 1; k < v.n; k++) order.push((m + k) % v.n);
      const tg = mode === 'target' ? targets() : [];
      const opps = order.map((q, oi) => {
        const dead = !v.alive[q], cnt = v.handN[q], act = v.turn === q && !dead && !v.over;
        const fan = cnt ? range(0, Math.min(cnt, 8) - 1).map(i => `<i${i === Math.min(cnt, 8) - 1 ? ` data-k="oh${q}"` : ''}></i>`).join('') : `<i class="e" data-k="oh${q}"></i>`;
        const tgi = tg.indexOf(q);
        return `<div class="ek-op${act ? ' turn' : ''}${dead ? ' out' : ''}${tgi >= 0 ? ' tgt' : ''}" data-k="p${q}" ${tgi >= 0 ? `data-tgt="${q}"` : ''}>
<div class="ek-on">${avatar(info.names[q], q)}<b>${esc(info.names[q])}</b>${act && v.left > 1 ? `<em>x${v.left}</em>` : ''}</div>
<div class="ek-or"><div class="ek-ofan">${fan}</div><span class="ek-cn">${dead ? 'OUT' : cnt}</span></div>${tgi >= 0 ? `<kbd>${tgi + 1}</kbd>` : ''}</div>`;
      }).join('');
      const top = v.discTop.length ? v.discTop[v.discTop.length - 1] : null;
      const P = v.pend;
      const canDraw = turnMine && !mode;
      const pend = P ? `<div class="ek-pend" data-k="pend"><div class="ek-pcs">${P.cards.map((c, i) => `<div class="ek-pc" data-k="pc${i}">${ekCardHTML(c)}</div>`).join('')}${P.nopes.map((q, j) => `<div class="ek-pn" data-k="pn${j}" style="--j:${j}">${ekCardHTML('N')}<em>${esc(nm(q))}</em></div>`).join('')}</div>
<p class="ek-pt">${esc(ekText(P, info, m))}${P.nopes.length ? (P.nopes.length % 2 ? '<br><b class="no">Noped!</b>' : '<br><b class="yes">Un-noped!</b>') : ''}</p>${v.phase === 'nope' && rem() ? `<div class="ek-tm"><i style="animation-duration:${Math.round(rem())}ms"></i></div>` : ''}</div>`
        : v.phase === 'insert' && !myIns() ? `<div class="ek-pend" data-k="pend"><div class="ek-kz" data-k="kz">${ekCardHTML('K')}</div><p class="ek-pt">${esc(nm(v.turn))} hides the kitten...</p></div>` : '';
      const dk = `<div class="ek-deck${canDraw ? ' go' : ''}" data-k="deck" ${canDraw ? 'data-draw="1"' : ''}><div class="ek-stk">${ekBackHTML('s2')}${ekBackHTML('s1')}${ekBackHTML('s0')}</div><span class="cnt">${v.deckN}</span><label>${canDraw ? 'Tap to draw' : 'Draw pile'}</label></div>`;
      const ds = `<div class="ek-disc" data-k="disc">${top ? ekCardHTML(top) : '<div class="slot"></div>'}<label>Discard</label></div>`;
      const known = v.known.some(Boolean) ? `<div class="ek-kn"><span>Top of the pile</span>${v.known.map((c, i) => `<div class="ek-mc${c === 'K' ? ' k' : ''}">${c ? ekCardHTML(c) : `<div class="ekc q"><div class="ekf"><i>?</i></div></div>`}</div>`).join('')}</div>` : '';
      const nopeBtn = canNope() ? `<button class="ek-btn nope" data-do="nope">NOPE!<kbd>N</kbd></button>` : '';
      const pl = turnMine && !mode ? plays() : null;
      const acts = [
        nopeBtn,
        pl ? `<button class="ek-btn play" data-do="play">${pl.label}</button>` : '',
        turnMine && !mode ? `<button class="ek-btn draw" data-draw="1">Draw a card<kbd>D</kbd></button>` : '',
        mode === 'target' ? `<button class="ek-btn" data-do="cancel">Cancel</button>` : ''
      ].join('');
      const giving = myGive();
      const step = v.hand.length > 1 ? Math.max(port ? 10.5 : 0, Math.min(cw * 1.06, (W - cw) / (v.hand.length - 1))) : 0;
      const hand = v.alive[m] ? v.hand.map((c, i) => `<div class="ek-hc${sel.includes(i) ? ' sel' : ''}${giving || (canNope() && c === 'N') ? ' glow' : ''}${turnMine && cur === i && !port ? ' cur' : ''}" data-k="h${i}" data-i="${i}" style="${i ? `margin-left:${ekU(step - cw)};` : ''}z-index:${i + 1}">${ekCardHTML(c)}</div>`).join('') : '';
      let ovl = '';
      if (myIns() && performance.now() >= late) {
        const n = v.deckN;
        ovl = `<div class="ek-ovl"><div class="ek-dlg"><p class="tb-kick">Defused!</p><h3>Hide the kitten</h3><div class="ek-ins"><div class="ek-kz" data-k="kz">${ekCardHTML('K')}</div><div class="ek-ctl"><div class="ek-bar2">${range(0, n).map(i => `<i class="${i === insPos ? 'on' : ''}"></i>`).join('')}</div><div class="ek-lb"><span>Top</span><span>Bottom</span></div><input type="range" min="0" max="${n}" value="${insPos}" aria-label="Position in the draw pile"><p class="ek-pos">${insText(n)}</p><div class="tb-row"><button class="tb-sm" data-ins="0">Top</button><button class="tb-sm" data-ins="r">Random</button><button class="tb-sm" data-ins="${n}">Bottom</button></div></div></div><button class="tb-big" data-do="insert">Hide it!</button></div></div>`;
      } else if (mode === 'name') {
        ovl = `<div class="ek-ovl"><div class="ek-dlg wide"><p class="tb-kick">Three of a kind</p><h3>Name a card to take from ${esc(nm(pp.target))}</h3><div class="ek-names">${EK_ALL.map(c => `<button data-name="${c}">${ekCardHTML(c)}</button>`).join('')}</div><button class="tb-sm" data-do="cancel">Cancel</button></div></div>`;
      } else if (peek) {
        ovl = `<div class="ek-ovl" data-do="closepeek"><div class="ek-dlg"><p class="tb-kick">See the Future</p><h3>Top of the draw pile</h3><div class="ek-pk">${peek.map((c, i) => `<div style="--d:${i * .16}s"><span>${['Next', '2nd', '3rd'][i]}</span>${ekCardHTML(c)}</div>`).join('')}</div><button class="tb-big c" data-do="closepeek">Got it</button></div></div>`;
      }
      const hsl = (ui.querySelector('.ek-hand') || {}).scrollLeft || 0;
      ui.innerHTML = `<div class="ek-bar${turnMine ? ' me' : ''}${v.phase === 'nope' ? ' nope' : ''}">${esc(status())}</div>
<div class="ek-opps n${order.length}">${opps}</div>
<div class="ek-mid"><div class="ek-cen">${dk}<div class="ek-ctr">${pend}</div>${ds}</div><div class="ek-acts">${acts}</div><div class="ek-info"><span class="kit">${ekKitSvg}Kittens left in the pile: <b>${v.kit}</b></span>${known}</div></div>
<div class="ek-me${turnMine ? ' turn' : ''}"><div class="ek-hint">${hint()}</div><div class="ek-hand">${hand}</div></div>${ovl}`;
      const hd = ui.querySelector('.ek-hand'); if (hd && hsl) hd.scrollLeft = hsl;
      h.rd();
    }
    const insText = n => insPos === 0 ? 'On top: the next card drawn' : insPos >= n ? 'At the very bottom' : `${insPos} card${insPos > 1 ? 's' : ''} down from the top`;

    function sendAct(a) {
      sel = []; mode = null; pp = null; look = null;
      const ok = h.send(a);
      if (!ok) { h.snd('bad'); render(); }
      return ok;
    }
    function playSel() {
      const pl = plays(); if (!pl) return;
      const cards = sel.slice();
      if (!pl.need) { sendAct({ t: 'play', cards }); return; }
      const tg = targets();
      if (!tg.length) { api.toast('Nobody has any cards to take.'); return; }
      pp = { cards, kind: pl.kind, need: pl.need };
      if (tg.length === 1) { chooseTarget(tg[0]); return; }
      mode = 'target'; h.snd('tap'); render();
    }
    function chooseTarget(q) {
      if (pp.need === 'tn') { pp.target = q; mode = 'name'; h.snd('tap'); render(); return; }
      sendAct({ t: 'play', cards: pp.cards, target: q });
    }
    function tapCard(i) {
      const c = V.hand[i]; look = c;
      if (myGive()) { sendAct({ t: 'give', i }); return; }
      if (canNope() && c === 'N') { sendAct({ t: 'nope' }); return; }
      if (!myTurn() || mode) { h.snd('tap'); render(); return; }
      cur = i;
      if (sel.includes(i)) {
        if (sel.length === 1 && EK_ACT[c]) { playSel(); return; }
        sel = sel.filter(x => x !== i);
      } else if (ekCat(c) && sel.length && V.hand[sel[0]] === c && sel.length < 3) sel = sel.concat(i);
      else sel = [i];
      h.snd('tap'); render();
    }
    const setPos = p => {
      insPos = Math.max(0, Math.min(V.deckN, p));
      const r = ui.querySelector('input[type=range]'); if (r) r.value = insPos;
      ui.querySelectorAll('.ek-bar2 i').forEach((e, i) => e.classList.toggle('on', i === insPos));
      const t = ui.querySelector('.ek-pos'); if (t) t.textContent = insText(V.deckN);
    };

    api.on(root, 'click', e => {
      if (!V || !info) return;
      const t = e.target;
      if (peek) { peek = null; render(); return; }
      let b = t.closest('[data-do]');
      if (b) {
        const a = b.dataset.do;
        if (a === 'nope') sendAct({ t: 'nope' });
        else if (a === 'play') playSel();
        else if (a === 'cancel') { mode = null; pp = null; h.snd('tap'); render(); }
        else if (a === 'insert') sendAct({ t: 'insert', pos: insPos });
        return;
      }
      if ((b = t.closest('[data-ins]'))) { h.snd('tap'); setPos(b.dataset.ins === 'r' ? R(V.deckN + 1) : +b.dataset.ins); return; }
      if ((b = t.closest('[data-name]'))) { if (pp) sendAct({ t: 'play', cards: pp.cards, target: pp.target, name: b.dataset.name }); return; }
      if ((b = t.closest('[data-tgt]'))) { chooseTarget(+b.dataset.tgt); return; }
      if ((b = t.closest('[data-i]'))) { tapCard(+b.dataset.i); return; }
      if (t.closest('[data-draw]') && myTurn() && !mode) { sendAct({ t: 'draw' }); return; }
      if (sel.length || look) { sel = []; look = null; render(); }
    });
    api.on(root, 'input', e => { if (e.target.type === 'range') setPos(+e.target.value); });

    function key(e) {
      if (!V || !info || V.over) return;
      const k = e.key.toLowerCase();
      if (peek) { peek = null; render(); e.preventDefault(); return; }
      if (k === 'n' && canNope()) { sendAct({ t: 'nope' }); e.preventDefault(); return; }
      if (myIns()) {
        if (k === 'arrowleft' || k === 'arrowup') setPos(insPos - 1);
        else if (k === 'arrowright' || k === 'arrowdown') setPos(insPos + 1);
        else if (k === 'enter' || k === ' ') sendAct({ t: 'insert', pos: insPos });
        else return;
        e.preventDefault(); return;
      }
      if (mode === 'target' && /^[1-4]$/.test(k)) { const t = targets()[+k - 1]; if (t !== undefined) chooseTarget(t); return; }
      if (k === 'backspace' && mode) { mode = null; pp = null; render(); return; }
      if (myGive()) return;
      if (!myTurn() || mode) return;
      if (k === 'd') { sendAct({ t: 'draw' }); e.preventDefault(); }
      else if (k === 'arrowleft') { cur = Math.max(0, cur - 1); sel = []; look = V.hand[cur]; render(); e.preventDefault(); }
      else if (k === 'arrowright') { cur = Math.min(V.hand.length - 1, cur + 1); sel = []; look = V.hand[cur]; render(); e.preventDefault(); }
      else if (k === ' ') { if (V.hand.length) tapCard(Math.min(cur, V.hand.length - 1)); e.preventDefault(); }
      else if (k === 'enter' || k === 'p') { if (plays()) playSel(); e.preventDefault(); }
    }

    const place = (el, r) => {
      const ib = root.getBoundingClientRect(), k = ib.width / root.offsetWidth || 1;
      el.style.cssText += `;left:${(r.left - ib.left) / k}px;top:${(r.top - ib.top) / k}px;width:${r.width / k}px;height:${r.height / k}px`;
    };
    const say = (html, cls, ms) => {
      const b = mk('div', 'ek-ban ' + (cls || ''), html);
      fx.append(b); setTimeout(() => b.remove(), ms || 1100);
      return b;
    };
    const stamp = (r, text) => {
      const s = mk('div', 'ek-stamp', text);
      fx.append(s);
      if (r) { const ib = root.getBoundingClientRect(), k = ib.width / root.offsetWidth || 1; s.style.left = (r.left + r.width / 2 - ib.left) / k + 'px'; s.style.top = (r.top + r.height / 2 - ib.top) / k + 'px'; }
      setTimeout(() => s.remove(), 900);
    };
    const later = (ms, fn) => { api.timeout(() => { if (api.alive && V) fn(); }, Math.max(0, ms)); };
    const dim = (on) => fx.classList.toggle('dim', on);
    const srcOf = (p, c, old, snaps) => {
      if (p === me() && old) { const i = old.hand.indexOf(c); if (i >= 0 && snaps['h' + i]) return snaps['h' + i]; }
      return 'oh' + p;
    };
    const bigCard = (id, cls) => {
      const el = mk('div', 'ek-big ' + (cls || ''), ekCardHTML(id));
      fx.append(el); place(el, h.rect(anchor) || { left: 0, top: 0, width: 100, height: 140 });
      return el;
    };

    function flights(es, old, snaps, first) {
      const m = me();
      let t = 0;
      const cleared = old && old.pend && !V.pend;
      const cancelled = es.some(e => e.k === 'resolve' && !e.ok);
      if (cleared) {
        const from = ['pc0', 'pc1', 'pc2'].map(k => snaps[k]).filter(Boolean).concat(range(0, 11).map(j => snaps['pn' + j]).filter(Boolean));
        if (cancelled) { stamp(snaps.pend, 'NOPED!'); h.snd('nope'); t += 700; }
        from.forEach((r, i) => h.fly({ from: r, to: 'disc', html: ekCardHTML(i < old.pend.cards.length ? old.pend.cards[i] : 'N'), hold: 'disc', delay: t + i * 70, dur: 380, r1: R(14) - 7, done: () => h.snd('card') }));
        t += 380 + from.length * 70;
      }
      for (const e of es) {
        if (e.k === 'deal') {
          let d = 0;
          for (let r = 0; r < 8; r++) for (let q = 0; q < V.n; q++) {
            if (q === m) { if (r < V.hand.length) h.fly({ from: 'deck', to: 'h' + r, html: ekBackHTML(), hold: 'h' + r, delay: d, dur: 340 }); }
            else if (r < 5) h.fly({ from: 'deck', to: 'oh' + q, html: ekBackHTML(), hold: 'oh' + q, delay: d, dur: 340, cls: 'sm' });
            if (r === 0 || r === 4) setTimeout(() => h.snd('deal'), d);
            d += 34;
          }
          t = Math.max(t, d + 300);
        } else if (e.k === 'draw') {
          if (e.p === m && e.c) {
            const i = V.hand.lastIndexOf(e.c);
            h.fly({ from: 'deck', to: 'h' + i, html: ekBackHTML(), hold: 'h' + i, delay: t, dur: 400, done: () => { const el = h.q('h' + i); if (el && el.animate) el.animate([{ transform: 'rotateY(90deg) scale(1.05)' }, { transform: 'none' }], { duration: 220 }); } });
            setTimeout(() => h.snd('flip'), t + 300);
          } else h.fly({ from: 'deck', to: 'oh' + e.p, html: ekBackHTML(), hold: 'oh' + e.p, delay: t, dur: 380, cls: 'sm' });
          setTimeout(() => h.snd('deal'), t);
          t += 450;
        } else if (e.k === 'play') {
          e.cards.forEach((c, i) => {
            const from = e.p === m && snaps['h' + e.idx[i]] ? snaps['h' + e.idx[i]] : 'oh' + e.p;
            h.fly({ from, to: 'pc' + i, html: ekCardHTML(c), hold: 'pc' + i, delay: t + i * 90, dur: 440, r0: R(24) - 12, done: () => h.snd(ekCat(c) ? 'meow' : 'card') });
          });
          t += 460 + e.cards.length * 90;
        } else if (e.k === 'nope') {
          const j = e.n - 1;
          const from = e.p === m && old && old.hand.includes('N') && snaps['h' + old.hand.indexOf('N')] ? snaps['h' + old.hand.indexOf('N')] : 'oh' + e.p;
          h.fly({ from, to: 'pn' + j, html: ekCardHTML('N'), hold: 'pn' + j, delay: t, dur: 340, s0: 1.4, ease: 'cubic-bezier(.3,1.5,.5,1)', done: () => { h.snd('nope'); const el = h.q('pn' + j); if (el) { h.shake(el, 3, 280); stamp(h.rect(el), 'NOPE!'); } } });
          t += 600;
        } else if (e.k === 'skip') {
          later(t, () => { say('SKIP', 'skip', 1000); h.snd('whoosh'); }); t += 700;
        } else if (e.k === 'attack') {
          later(t, () => { say(`ATTACK!<small>${esc(nm(e.to))} takes ${e.n} turns</small>`, 'attack', 1300); h.snd('zap'); h.shake(root, 5, 360); }); t += 900;
        } else if (e.k === 'shuffle') {
          const d = h.q('deck');
          later(t, () => { h.snd('shuffle'); say('SHUFFLE', 'shuf', 900); const s = h.q('deck'); if (s && s.animate && !reduced()) s.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg) scale(1.08)' }, { transform: 'rotate(8deg) scale(1.08)' }, { transform: 'rotate(-5deg)' }, { transform: 'none' }], { duration: 700 }); });
          t += 800;
        } else if (e.k === 'peek') {
          if (e.p === m && e.cards) { later(t + 200, () => { h.snd('crystal'); peek = e.cards; render(); api.timeout(() => { if (peek === e.cards) { peek = null; render(); } }, 9000); }); t += 400; }
          else later(t, () => { h.snd('crystal'); say(`${esc(nm(e.p))} peeks at the future`, 'small', 1100); });
        } else if (e.k === 'steal') {
          if (e.miss && e.name) later(t, () => say(`${esc(nm(e.t))} has no ${esc(EK_N[e.name])}`, 'small', 1300));
          else if (e.miss) later(t, () => say('Nothing to steal', 'small', 900));
          else {
            const c = e.c || (e.p === m || e.t === m ? null : null);
            const idxNew = e.p === m && e.c ? V.hand.lastIndexOf(e.c) : -1;
            const from = e.t === m && e.c ? srcOf(m, e.c, old, snaps) : 'oh' + e.t;
            const to = idxNew >= 0 ? 'h' + idxNew : 'oh' + e.p;
            h.fly({ from, to, html: e.c && (e.p === m || e.t === m) ? ekCardHTML(e.c) : ekBackHTML(), hold: to, delay: t, dur: 520, r0: R(30) - 15, done: () => h.snd('flip') });
            later(t, () => { if (e.p === m && e.c) say(`You stole ${esc(EK_N[e.c])}`, 'small', 1300); else if (e.t === m && e.c) say(`${esc(nm(e.p))} stole your ${esc(EK_N[e.c])}`, 'small', 1300); });
            t += 640;
          }
        } else if (e.k === 'give') {
          const idxNew = e.to === m && e.c ? V.hand.lastIndexOf(e.c) : -1;
          const from = e.p === m && e.c ? srcOf(m, e.c, old, snaps) : 'oh' + e.p;
          const to = idxNew >= 0 ? 'h' + idxNew : 'oh' + e.to;
          h.fly({ from, to, html: e.c && (e.to === m || e.p === m) ? ekCardHTML(e.c) : ekBackHTML(), hold: to, delay: t, dur: 520, done: () => h.snd('flip') });
          later(t, () => { if (e.to === m && e.c) say(`${esc(nm(e.p))} gave you ${esc(EK_N[e.c])}`, 'small', 1300); });
          t += 640;
        } else if (e.k === 'kitten') {
          const tt = t, p = e.p;
          later(tt, () => {
            dim(true); h.snd('fuse');
            h.fly({ from: 'deck', to: anchor, html: ekCardHTML('K'), dur: 520, s0: .5, r0: -12, ease: 'cubic-bezier(.2,1.2,.4,1)', done: () => { if (!V) return; curK = bigCard('K', 'kz'); curK.animate && !reduced() && curK.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }], { duration: 90, iterations: 8, direction: 'alternate' }); } });
          });
          t += 1250;
        } else if (e.k === 'defuse') {
          const tt = t;
          const from = e.p === m ? srcOf(m, 'D', old, snaps) : 'oh' + e.p;
          later(tt, () => {
            h.fly({ from, to: anchor, html: ekCardHTML('D'), dur: 460, s0: .6, r0: 18, done: () => {
              h.snd('defuse');
              const el = bigCard('D', 'dz'); if (curK) curK.classList.add('dead');
              say(`${e.p === m ? 'You' : esc(nm(e.p))} defused it!`, 'good', 1300);
              h.burst(anchor, 36, ['#7dffb0', '#fff', '#ffe95c', '#4fd6ff'], { speed: 150, size: 9 });
              setTimeout(() => { el.remove(); if (curK) curK.remove(); curK = null; dim(false); }, 1250);
            } });
          });
          t += 2000;
        } else if (e.k === 'boom') {
          const tt = t;
          later(tt, () => {
            h.snd('boom');
            const fl = mk('div', 'ek-flash'); fx.append(fl); setTimeout(() => fl.remove(), 700);
            h.shake(root, 12, 620);
            h.burst(anchor, 70, ['#ff7a1a', '#ffd23f', '#ff4d4d', '#fff', '#3a1f5a'], { speed: 260, size: 15, dur: 1100 });
            if (curK) { curK.classList.add('boom'); const k = curK; setTimeout(() => k.remove(), 600); curK = null; }
            say(`${e.p === m ? 'You' : esc(nm(e.p))} exploded!`, 'bad', 1500);
            setTimeout(() => dim(false), 1500);
          });
          t += 1900;
        } else if (e.k === 'insert') {
          const s = snaps.kz;
          if (s) h.fly({ from: s, to: 'deck', html: ekCardHTML('K'), delay: t, dur: 500, ease: 'ease-in', done: () => h.snd('shuffle') });
          later(t, () => { if (e.p !== m) say(`${esc(nm(e.p))} hid the kitten`, 'small', 1100); });
          t += 560;
        } else if (e.k === 'turn') {
          if (e.p === m && !first) setTimeout(() => h.snd('tick'), t);
        } else if (e.k === 'win') {
          later(t + 250, () => { const el = h.q('p' + e.p) || h.q('h0'); h.burst(el, 50, ['#ffd23f', '#ff7a1a', '#a96bff', '#4fd6ff', '#fff'], { speed: 200, size: 11, dur: 1200 }); });
        }
      }
      return t;
    }

    return {
      start(inf) { info = inf; V = null; sel = []; mode = null; pp = null; look = null; peek = null; late = 0; cur = 0; ui.innerHTML = ''; fx.querySelectorAll('.ek-ban,.ek-big,.ek-stamp,.ek-flash').forEach(e => e.remove()); dim(false); curK = null; },
      clear() { ui.innerHTML = ''; V = null; dim(false); },
      layout() { render(); },
      refresh() { render(); },
      key,
      update(v, es, first) {
        const old = V, snaps = {};
        if (old) {
          for (let i = 0; i < old.hand.length; i++) snaps['h' + i] = h.rect('h' + i);
          ['pend', 'kz', 'deck', 'disc'].forEach(k => { snaps[k] = h.rect(k); });
          for (let i = 0; i < 3; i++) snaps['pc' + i] = h.rect('pc' + i);
          for (let j = 0; j < 12; j++) { const r = h.rect('pn' + j); if (!r) break; snaps['pn' + j] = r; }
        }
        recv = performance.now();
        V = v;
        if (!old || old.hand.join() !== v.hand.join() || !myTurn()) { sel = []; mode = null; pp = null; }
        if (!old || old.turn !== v.turn || old.phase !== v.phase) look = null;
        cur = Math.min(cur, Math.max(0, v.hand.length - 1));
        if (!v.alive[me()] || v.over) peek = null;
        late = 0;
        render();
        const end = first ? 0 : flights(es, old, snaps, first);
        if (end > 0) h.busy(end);
        if (myIns() && end > 0) { late = performance.now() + end; render(); later(end + 30, () => { late = 0; render(); }); }
        if (v.over && !first) later(end, () => {});
      }
    };
  };

  const ekKitSvg = `<svg viewBox="-30 -32 60 56" aria-hidden="true">${ekFace('#ffb86b', { ear: '#ff8d6b' })}</svg>`;
  const EK_LOGO = `<div class="ek-logo"><svg viewBox="0 0 100 100"><path d="${ekStar(50, 52, 47, 30, 11, .2)}" fill="#ffd23f" ${EK_I}/><path d="${ekStar(50, 52, 36, 23, 11, .5)}" fill="#ff7a1a" ${EK_I2}/><g transform="translate(50 56) scale(1.3)">${ekFace('#2d2144', { eye: '#ffe95c', brow: 1, ear: '#7a2d52' })}</g></svg><b>EXPLODING</b><b>KITTENS</b></div>`;

  const EK_RULES = `<p>Be the last player alive. Every turn you play any cards you like, then <b>draw a card</b> to end your turn. Draw an <b>Exploding Kitten</b> and you are out, unless you have a <b>Defuse</b>.</p>
<h4>Setup</h4>
<p>Each player starts with one Defuse and seven cards. The draw pile holds one fewer Kitten than there are players, plus spare Defuses.</p>
<h4>Action cards</h4>
<p><b>Attack</b>: end your turn without drawing. The next player takes two turns in a row. If you were attacked yourself, they take your remaining turns plus two.</p>
<p><b>Skip</b>: end one turn without drawing. <b>Favor</b>: a player of your choice gives you a card of their choice. <b>Shuffle</b>: shuffle the draw pile. <b>See the Future</b>: secretly look at the top three cards.</p>
<h4>Nope</h4>
<p>Play a <b>Nope</b> at any time to cancel another player's action. A Nope can be Noped, and so on. The window restarts after every Nope. A Nope cannot stop an Exploding Kitten or a Defuse.</p>
<h4>Cat cards</h4>
<p>The five cat cards do nothing alone. Play <b>two of the same cat</b> to steal a random card from a player. Play <b>three of the same cat</b> to name a card: if that player has it, they must hand it over.</p>
<h4>Defuse</h4>
<p>When you draw a Kitten and hold a Defuse, it is played automatically. Then you secretly put the Kitten back into the draw pile anywhere you like, even on top for the next player.</p>
<h4>Controls</h4>
<p>Tap a card to select it and tap it again (or press the Play button) to play it. Tap two or three matching cats to play them together. Tap the draw pile or press <b>D</b> to draw. Press <b>N</b> or tap NOPE! to Nope. <b>Left</b>/<b>Right</b>, <b>Space</b> and <b>Enter</b> work on a keyboard.</p>`;

  const EKX = {
    id: 'exploding-kittens', title: 'Exploding Kittens', min: 2, max: 5, defBots: 2, defOnline: 4,
    logo: EK_LOGO, tag: 'Draw cards. Do not draw the Kitten. Nope everything.',
    rules: EK_RULES,
    extra: [{ k: 'nope', t: 'Nope window', sub: 'Time to react to a card', vals: ['quick', 'normal', 'relaxed'], labels: ['Quick', 'Normal', 'Relaxed'] }],
    optDef: { nope: 'normal' },
    create: (n, cfg) => Kittens(n, cfg),
    botDelay: (e, s, d) => e.phase === 'nope' ? 350 + R(650) : (d === 'Easy' ? 1100 : 850) + R(700),
    ui: ekUI,
    overText: (v, info, me) => me ? 'You are the last cat standing.' : '',
    stats: (v, info) => {
      const order = [v.over.win].concat(v.out.slice().reverse());
      return `<table class="tb-tbl">${order.map((q, i) => `<tr class="${i ? '' : 'win'}"><td>${i + 1}. ${esc(info.names[q])}</td><td>${i ? 'Exploded' : 'Survived'}</td></tr>`).join('')}</table>`;
    }
  };

  Ameplay.register({
    id: 'exploding-kittens',
    title: 'Exploding Kittens',
    category: 'Board',
    tint: '#ff7a1a',
    blurb: 'Draw cards, dodge the Kitten, Nope your friends. The last player standing wins.',
    help: 'Tap a card, tap again to play it · tap the draw pile to draw · <kbd>N</kbd> Nope · <kbd>D</kbd> draw · <kbd>←</kbd><kbd>→</kbd> <kbd>Space</kbd> <kbd>Enter</kbd>',
    better: 'high',
    width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 4l5 9 10-4-2 10 10 3-8 7 6 9-11 0 1 10-9-6-9 6 1-10-11 0 6-9-8-7 10-3-2-10 10 4z"/><path d="M22 44l1-9 6 4M42 44l-1-9-6 4"/><ellipse cx="32" cy="42" rx="11" ry="9"/><circle cx="28" cy="41" r="1.2"/><circle cx="36" cy="41" r="1.2"/></svg>',
    _t: { Kittens, ekBot, ekCardHTML },
    css: BASE('exploding-kittens') + EK_CSS,
    mount: table(EKX)
  });

  const CP_N = { D: 'Duke', A: 'Assassin', C: 'Captain', B: 'Ambassador', S: 'Contessa' };
  const CP_ORD = ['D', 'A', 'C', 'B', 'S'];
  const CP_ACT = {
    income: { cost: 0, cl: '' }, aid: { cost: 0, cl: '' }, coup: { cost: 7, cl: '' },
    tax: { cost: 0, cl: 'D' }, assassinate: { cost: 3, cl: 'A' }, steal: { cost: 0, cl: 'C' }, exchange: { cost: 0, cl: 'B' }
  };
  const CP_BLK = { aid: ['D'], steal: ['C', 'B'], assassinate: ['S'] };
  const CP_TG = { coup: 1, assassinate: 1, steal: 1 };
  const CP_VAL = { D: 3, A: 2.6, C: 2.4, S: 2, B: 1.3 };

  function Coup(n, cfg) {
    cfg = cfg || {};
    const TW = cfg.online ? 18000 : 0, TA = cfg.online ? 60000 : 0, TL = cfg.online ? 40000 : 0;
    const E = { n, over: null, ev: [], phase: 'act', turn: 0, A: null, dl: 0, passed: new Set(), out: [], xc: null, lp: -1, cont: null, round: 0 };
    E.deck = [];
    CP_ORD.forEach(c => { for (let i = 0; i < 3; i++) E.deck.push(c); });
    shuf(E.deck);
    E.hid = range(0, n - 1).map(() => [E.deck.pop(), E.deck.pop()]);
    E.rev = range(0, n - 1).map(() => []);
    E.coins = Array(n).fill(2);
    E.pers = range(0, n - 1).map(() => ({ bl: .7 + Math.random() * .6, ch: .7 + Math.random() * .6 }));
    E.turn = R(n);
    if (n === 2) E.coins[E.turn] = 1;
    E.ev.push({ k: 'deal' }, { k: 'turn', p: E.turn });

    const live = q => E.hid[q].length > 0;
    const alive = () => range(0, n - 1).filter(live);
    const arm = ms => { E.dl = ms ? now() + ms : 0; };
    arm(TA);
    const coin = (from, to, k) => {
      if (k <= 0) return;
      if (from >= 0) E.coins[from] -= k;
      if (to >= 0) E.coins[to] += k;
      E.ev.push({ k: 'coin', from, to, n: k });
    };
    const chk = () => {
      const al = alive();
      if (al.length > 1 || E.over) return !!E.over;
      E.over = { win: al[0] }; E.phase = 'over'; E.dl = 0; E.ev.push({ k: 'win', p: al[0] });
      return true;
    };
    const startTurn = p => { E.turn = p; E.phase = 'act'; E.A = null; E.passed.clear(); E.round++; arm(TA); E.ev.push({ k: 'turn', p }); };
    const nextTurn = () => {
      if (chk()) return;
      for (let k = 1; k <= n; k++) { const q = (E.turn + k) % n; if (live(q)) { startTurn(q); return; } }
    };
    const doLose = (p, i, cont) => {
      const c = E.hid[p].splice(i, 1)[0];
      E.rev[p].push(c);
      const dead = !E.hid[p].length;
      E.ev.push({ k: 'lose', p, c, dead });
      if (dead) { E.out.push(p); coin(p, -1, E.coins[p]); }
      if (chk()) return;
      cont();
    };
    const lose = (p, cont) => {
      if (!live(p)) { cont(); return; }
      if (E.hid[p].length === 1) { doLose(p, 0, cont); return; }
      E.phase = 'lose'; E.lp = p; E.cont = cont; arm(TL);
    };
    const elig = () => {
      const A = E.A;
      if (!A) return [];
      if (E.phase === 'chal') return alive().filter(q => q !== A.p);
      if (E.phase === 'block') return A.kind === 'aid' ? alive().filter(q => q !== A.p) : live(A.target) ? [A.target] : [];
      if (E.phase === 'bchal') return alive().filter(q => q !== A.blocker);
      return [];
    };
    const resolve = () => {
      const A = E.A, p = A.p, t = A.target;
      E.ev.push({ k: 'resolve', kind: A.kind, p, target: t });
      if (A.kind === 'income') { coin(-1, p, 1); nextTurn(); }
      else if (A.kind === 'aid') { coin(-1, p, 2); nextTurn(); }
      else if (A.kind === 'tax') { coin(-1, p, 3); nextTurn(); }
      else if (A.kind === 'steal') { if (live(t)) coin(t, p, Math.min(2, E.coins[t])); nextTurn(); }
      else if (A.kind === 'exchange') {
        E.xc = [E.deck.pop(), E.deck.pop()];
        E.phase = 'xchg'; arm(TA);
        E.ev.push({ k: 'xchg', p, priv: { [p]: { cards: E.xc.slice() } } });
      } else if (live(t)) lose(t, nextTurn);
      else nextTurn();
    };
    const afterChal = () => {
      const A = E.A;
      if (!live(A.p)) nextTurn();
      else if (CP_BLK[A.kind]) openWin('block');
      else resolve();
    };
    const cancel = () => {
      const A = E.A, d = CP_ACT[A.kind].cost;
      if (d && live(A.p)) coin(-1, A.p, d);
      E.ev.push({ k: 'cancel', p: A.p, kind: A.kind });
      nextTurn();
    };
    const closeWin = () => {
      if (E.phase === 'chal') afterChal();
      else if (E.phase === 'block') resolve();
      else { E.ev.push({ k: 'blocked', p: E.A.blocker, c: E.A.bc }); nextTurn(); }
    };
    const openWin = ph => { E.phase = ph; E.passed.clear(); arm(TW); if (!elig().length) closeWin(); };
    const settle = (who, c, chal, good, bad) => {
      E.ev.push({ k: 'challenge', p: chal, on: who, c });
      const i = E.hid[who].indexOf(c);
      if (i >= 0) {
        E.ev.push({ k: 'reveal', p: who, c, i });
        E.hid[who].splice(i, 1); E.deck.push(c); shuf(E.deck);
        const nc = E.deck.pop(); E.hid[who].splice(i, 0, nc);
        E.ev.push({ k: 'swap', p: who, i, priv: { [who]: { c: nc } } });
        lose(chal, good);
      } else {
        E.ev.push({ k: 'caught', p: who, c });
        lose(who, bad);
      }
    };
    const declare = (p, k, t) => {
      const d = CP_ACT[k];
      if (d.cost) coin(p, -1, d.cost);
      E.A = { p, kind: k, target: t, claim: d.cl, blocker: -1, bc: '' };
      E.ev.push({ k: 'act', p, kind: k, target: t, claim: d.cl, cost: d.cost });
      if (d.cl) openWin('chal');
      else if (CP_BLK[k]) openWin('block');
      else resolve();
    };

    E.who = () => {
      if (E.over) return [];
      if (E.phase === 'act' || E.phase === 'xchg') return [E.turn];
      if (E.phase === 'lose') return [E.lp];
      return elig().filter(q => !E.passed.has(q));
    };
    E.tmo = () => E.dl && !E.over ? Math.max(1, E.dl - now()) : 0;
    E.extend = ms => { if (E.dl) E.dl = Math.max(E.dl, now() + ms); };
    E.timeout = () => {
      if (E.over) return;
      if (E.phase === 'chal' || E.phase === 'block' || E.phase === 'bchal') closeWin();
      else E.act(E.who()[0], E.fallback(E.who()[0]));
    };
    E.takeEv = () => { const e = E.ev; E.ev = []; return e; };
    E.act = (p, a) => {
      if (E.over || !a || !live(p)) return false;
      const ph = E.phase, A = E.A;
      if (ph === 'act') {
        if (p !== E.turn || a.t !== 'act') return false;
        const k = a.k, d = CP_ACT[k];
        if (!d || (E.coins[p] >= 10 && k !== 'coup') || E.coins[p] < d.cost) return false;
        let t = -1;
        if (CP_TG[k]) { t = a.target | 0; if (t === p || t < 0 || t >= n || !live(t)) return false; }
        declare(p, k, t); return true;
      }
      if (ph === 'lose') {
        if (p !== E.lp || a.t !== 'lose') return false;
        const i = a.i | 0;
        if (i < 0 || i >= E.hid[p].length) return false;
        doLose(p, i, E.cont); return true;
      }
      if (ph === 'xchg') {
        if (p !== E.turn || a.t !== 'keep' || !Array.isArray(a.idx)) return false;
        const pool = E.hid[p].concat(E.xc), k = E.hid[p].length, idx = [...new Set(a.idx.map(x => x | 0))].sort((x, y) => x - y);
        if (idx.length !== k || idx.some(i => i < 0 || i >= pool.length)) return false;
        const rest = pool.filter((c, i) => !idx.includes(i));
        E.hid[p] = idx.map(i => pool[i]); E.deck.push(...rest); shuf(E.deck); E.xc = null;
        E.ev.push({ k: 'xdone', p }); nextTurn(); return true;
      }
      if (ph !== 'chal' && ph !== 'block' && ph !== 'bchal') return false;
      if (!elig().includes(p) || E.passed.has(p)) return false;
      if (a.t === 'pass') {
        E.passed.add(p);
        if (elig().every(q => E.passed.has(q))) closeWin();
        return true;
      }
      if (ph === 'block') {
        if (a.t !== 'block' || !CP_BLK[A.kind].includes(a.c)) return false;
        A.blocker = p; A.bc = a.c;
        E.ev.push({ k: 'block', p, c: a.c });
        openWin('bchal'); return true;
      }
      if (a.t !== 'challenge') return false;
      if (ph === 'chal') settle(A.p, A.claim, p, afterChal, cancel);
      else settle(A.blocker, A.bc, p, () => { E.ev.push({ k: 'blocked', p: A.blocker, c: A.bc }); nextTurn(); }, () => { E.ev.push({ k: 'unblock', p: A.blocker }); A.blocker = -1; resolve(); });
      return true;
    };
    E.view = s => ({
      n, turn: E.turn, phase: E.phase, coins: E.coins.slice(), hn: E.hid.map(h => h.length), rev: E.rev.map(r => r.slice()),
      hand: E.hid[s].slice(), deckN: E.deck.length,
      A: E.A ? { p: E.A.p, kind: E.A.kind, target: E.A.target, claim: E.A.claim, blocker: E.A.blocker, bc: E.A.bc } : null,
      wait: E.who(), lp: E.phase === 'lose' ? E.lp : -1, xc: E.phase === 'xchg' && s === E.turn ? E.xc.slice() : null,
      out: E.out.slice(), over: E.over, all: E.over ? E.hid.map(h => h.slice()) : null, round: E.round
    });
    E.fallback = p => {
      if (E.phase === 'act') {
        if (E.coins[p] >= 10) { const o = alive().filter(q => q !== p); return { t: 'act', k: 'coup', target: pick(o) }; }
        return { t: 'act', k: 'income' };
      }
      if (E.phase === 'lose') return { t: 'lose', i: R(E.hid[p].length) };
      if (E.phase === 'xchg') return { t: 'keep', idx: range(0, E.hid[p].length - 1) };
      return { t: 'pass' };
    };
    E.bot = (p, diff) => cpBot(E, p, diff);
    return E;
  }

  function cpBot(E, p, diff) {
    const L = diff === 'Hard' ? 2 : diff === 'Normal' ? 1 : 0;
    const me = E.hid[p], n = E.n, A = E.A, P = E.pers[p], co = E.coins[p];
    const live = q => E.hid[q].length > 0;
    const opp = range(0, n - 1).filter(q => q !== p && live(q));
    const has = c => me.includes(c);
    const seen = c => E.rev.reduce((s, r) => s + r.filter(x => x === c).length, 0) + me.filter(x => x === c).length;
    const unk = () => E.deck.length + opp.reduce((s, q) => s + E.hid[q].length, 0);
    const pHas = (q, c) => {
      const u = 3 - seen(c), N = unk();
      if (u <= 0 || N <= 0) return 0;
      return 1 - Math.pow(1 - u / N, E.hid[q].length);
    };
    const trust = (q, c) => { const h = pHas(q, c), br = [.9, .8, .5][L]; return h / (h + (1 - h) * br || 1); };
    const val = (c, mine) => (CP_VAL[c] || 1) - (mine.filter(x => x === c).length > 1 ? .9 : 0);
    const threat = q => E.coins[q] * .6 + E.hid[q].length * 2 + (E.coins[q] >= 7 ? 3 : 0) + (E.coins[q] >= 10 ? 4 : 0) + Math.random() * (L ? 1 : 12);
    const best = f => { let b = -1, s = -1e9; opp.forEach(q => { const v = f(q); if (v > s) { s = v; b = q; } }); return b; };
    const chal = (who, c, danger) => {
      if (!L) return Math.random() < (danger > 1 ? .4 : .17);
      if (seen(c) >= 3) return true;
      const tr = trust(who, c), myInf = me.length;
      const gain = (1 - tr) * (1 + danger + (E.hid[who].length === 1 ? .9 : 0)), loss = tr * (myInf === 1 ? 2.3 : 1.1);
      const sc = gain - loss;
      const pr = sc > 0 ? Math.min(.95, .25 + sc * .8) : Math.max(0, .05 + sc * .12);
      return Math.random() < pr * P.ch * [.55, 1, .6][L];
    };

    if (E.phase === 'lose') {
      let bi = 0, bv = 1e9;
      me.forEach((c, i) => { const v = val(c, me) + Math.random() * (L ? .35 : 1.6); if (v < bv) { bv = v; bi = i; } });
      return { t: 'lose', i: bi };
    }
    if (E.phase === 'xchg') {
      const pool = me.concat(E.xc), k = me.length;
      const sc = pool.map((c, i) => ({ i, v: val(c, pool) + Math.random() * (L ? .3 : 1.8) })).sort((a, b) => b.v - a.v);
      return { t: 'keep', idx: sc.slice(0, k).map(x => x.i) };
    }
    if (E.phase === 'chal') {
      let d = .25;
      if (A.kind === 'assassinate' && A.target === p) { d = me.length === 1 ? 1.8 : 1.1; if (has('S') && seen(A.claim) < 3 && !(L === 2 && me.length === 1 && trust(A.p, 'A') < .4)) return { t: 'pass' }; }
      else if (A.kind === 'steal' && A.target === p) d = .45;
      else if (A.kind === 'tax' || A.kind === 'exchange') d = .15 + E.coins[A.p] * .03;
      return chal(A.p, A.claim, d) ? { t: 'challenge' } : { t: 'pass' };
    }
    if (E.phase === 'block') {
      if (A.kind === 'aid') {
        if (has('D')) return Math.random() < [.45, .8, .92][L] ? { t: 'block', c: 'D' } : { t: 'pass' };
        return seen('D') < 3 && Math.random() < P.bl * [.03, .08, .12][L] ? { t: 'block', c: 'D' } : { t: 'pass' };
      }
      if (A.kind === 'steal') {
        if (has('C') || has('B')) return Math.random() < [.7, .92, .97][L] ? { t: 'block', c: has('C') && has('B') ? pick(['C', 'B']) : has('C') ? 'C' : 'B' } : { t: 'pass' };
        if (co < 2) return { t: 'pass' };
        const c = seen('C') <= seen('B') ? 'C' : 'B';
        return seen(c) < 3 && Math.random() < P.bl * [.12, .28, .38][L] ? { t: 'block', c } : { t: 'pass' };
      }
      if (has('S')) return { t: 'block', c: 'S' };
      if (seen('S') >= 3) return { t: 'pass' };
      const bp = me.length === 1 ? [.55, .85, .95][L] : P.bl * [.12, .3, .42][L];
      return Math.random() < bp ? { t: 'block', c: 'S' } : { t: 'pass' };
    }
    if (E.phase === 'bchal') {
      let d = .3;
      if (A.p === p) d = A.kind === 'assassinate' ? .9 : A.kind === 'steal' ? .35 : .4;
      else if (A.target === p && A.kind === 'assassinate') d = 0;
      else d = .1;
      return chal(A.blocker, A.bc, d) ? { t: 'challenge' } : { t: 'pass' };
    }

    const coup = () => ({ t: 'act', k: 'coup', target: best(q => threat(q) + (E.hid[q].length === 1 ? 2.5 : 0)) });
    if (co >= 10) return coup();
    if (co >= 7 && Math.random() < [.45, .93, 1][L]) return coup();
    const o = [];
    const bl = P.bl * [1.15, .8, .35][L];
    o.push([.8, { t: 'act', k: 'income' }]);
    const blockers = opp.length;
    o.push([L ? 1.6 - Math.min(1, blockers * (seen('D') < 3 ? .12 : 0)) : 1.8, { t: 'act', k: 'aid' }]);
    o.push([has('D') ? 3.2 : seen('D') >= 3 && L ? 0 : 1.15 * bl, { t: 'act', k: 'tax' }]);
    if (co >= 3) {
      const t = best(q => threat(q) + (E.hid[q].length === 1 ? 2 : 0));
      const w = has('A') ? 3.6 : seen('A') >= 3 ? 0 : 1 * bl * (co >= 5 ? 1.2 : .8);
      o.push([co >= 7 ? w * .5 : w, { t: 'act', k: 'assassinate', target: t }]);
    }
    const rich = opp.filter(q => E.coins[q] >= 2);
    if (rich.length) {
      const t = best(q => E.coins[q] * 1.2 + Math.random());
      o.push([has('C') ? 2.7 : seen('C') >= 3 ? 0 : 1 * bl, { t: 'act', k: 'steal', target: t }]);
    }
    const weak = !has('D') && !has('A') && !has('C');
    o.push([has('B') ? (weak ? 2.2 : 1.1) : weak ? .6 * bl : .3 * bl, { t: 'act', k: 'exchange' }]);
    const tot = o.reduce((s, x) => s + x[0], 0);
    let r = Math.random() * tot;
    for (const x of o) { r -= x[0]; if (r <= 0) return x[1]; }
    return o[0][1];
  }

  const CP_INK = '#24152e';
  const CP_S = `stroke="${CP_INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const CP_SK = '#f4cba2';
  const cpEyes = (y, o) => {
    o = o || {};
    const c = o.c || CP_INK;
    return `<ellipse cx="42.5" cy="${y}" rx="2.2" ry="${o.ry || 2.8}" fill="${c}"/><ellipse cx="57.5" cy="${y}" rx="2.2" ry="${o.ry || 2.8}" fill="${c}"/>`
      + (o.hi === false ? '' : `<circle cx="43.2" cy="${y - 1}" r=".8" fill="#fff"/><circle cx="58.2" cy="${y - 1}" r=".8" fill="#fff"/>`);
  };
  const CP_ART = {
    D: `<path d="M8 100Q10 76 34 70L66 70Q90 76 92 100Z" fill="#6a2fb8" ${CP_S}/>
<path d="M44 66h12v8q-6 4-12 0z" fill="#e9b88c" ${CP_S}/>
<path d="M22 74Q50 94 78 74L72 64Q50 78 28 64Z" fill="#fffaf0" ${CP_S}/>
<g fill="${CP_INK}"><path d="M36 74l1.6 5 1.6-5zM47 78l1.6 5 1.6-5zM58 78l1.6 5 1.6-5zM68 74l1.6 5 1.6-5z"/></g>
<ellipse cx="50" cy="50" rx="17" ry="19" fill="${CP_SK}" ${CP_S}/>
${cpEyes(49)}
<path d="M37 43Q42 40 47 43M53 43Q58 40 63 43" fill="none" stroke="#5b3a1e" stroke-width="2.6" stroke-linecap="round"/>
<path d="M50 52l-2 5h4z" fill="#e0a578"/>
<path d="M36 57Q43 51 50 56Q57 51 64 57Q57 62 50 58Q43 62 36 57Z" fill="#5b3a1e" ${CP_S}/>
<path d="M44 62Q50 78 56 62Q50 66 44 62Z" fill="#5b3a1e" ${CP_S}/>
<path d="M31 36L34 18L42 28L50 14L58 28L66 18L69 36Q50 42 31 36Z" fill="#ffd23f" ${CP_S}/>
<path d="M31 36Q50 42 69 36L69 41Q50 47 31 41Z" fill="#f2a516" ${CP_S}/>
<circle cx="34" cy="17" r="2.6" fill="#e5484d" ${CP_S}/><circle cx="50" cy="13" r="2.8" fill="#3e8ef7" ${CP_S}/><circle cx="66" cy="17" r="2.6" fill="#2fb36d" ${CP_S}/>
<circle cx="50" cy="39" r="2.2" fill="#e5484d" stroke="${CP_INK}" stroke-width="1.4"/>`,
    A: `<path d="M6 100Q8 72 32 66L68 66Q92 72 94 100Z" fill="#2a2c38" ${CP_S}/>
<path d="M24 70Q16 34 50 18Q84 34 76 70Q64 58 50 58Q36 58 24 70Z" fill="#383b4b" ${CP_S}/>
<path d="M30 56Q28 36 50 28Q72 36 70 56Q60 64 50 64Q40 64 30 56Z" fill="#0b0b12" ${CP_S}/>
<path d="M38 46l9 3-9 3z" fill="#ff4a4a"/><path d="M62 46l-9 3 9 3z" fill="#ff4a4a"/>
<path d="M39 47.4l5 1.4-5 1.4z" fill="#fff"/><path d="M61 47.4l-5 1.4 5 1.4z" fill="#fff"/>
<path d="M34 58Q50 74 66 58L66 68Q50 82 34 68Z" fill="#8a1f33" ${CP_S}/>
<path d="M36 64Q50 76 64 64" fill="none" stroke="#c23a52" stroke-width="1.6"/>
<g transform="rotate(28 66 82)"><path d="M63.5 56h5l1.6 28h-8.2z" fill="#e8eef5" ${CP_S}/><path d="M66 58v24" stroke="#9fb0c3" stroke-width="1.6"/><rect x="58" y="83" width="16" height="4.4" rx="2" fill="#ffd23f" ${CP_S}/><rect x="64" y="87" width="4.4" height="10" rx="1.6" fill="#8a1f33" ${CP_S}/><circle cx="66.2" cy="99" r="2.6" fill="#ffd23f" ${CP_S}/></g>`,
    C: `<path d="M8 100Q10 74 32 68L68 68Q90 74 92 100Z" fill="#c62f3d" ${CP_S}/>
<path d="M32 68L44 100M68 68L56 100" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>
<circle cx="34" cy="86" r="2" fill="#ffd23f"/><circle cx="66" cy="86" r="2" fill="#ffd23f"/><circle cx="37" cy="94" r="2" fill="#ffd23f"/><circle cx="63" cy="94" r="2" fill="#ffd23f"/>
<path d="M40 68L50 84L60 68Z" fill="#fffaf0" ${CP_S}/>
<path d="M44 64h12v6q-6 4-12 0z" fill="#e9b88c" ${CP_S}/>
<ellipse cx="50" cy="52" rx="17" ry="19" fill="${CP_SK}" ${CP_S}/>
<path d="M33 52Q34 72 50 72Q66 72 67 52Q62 62 50 62Q38 62 33 52Z" fill="#4a2f1a" ${CP_S}/>
<path d="M42 62Q50 58 58 62Q50 66 42 62Z" fill="#fffaf0" opacity=".0"/>
<path d="M36 44Q42 41 47 44" fill="none" stroke="#4a2f1a" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="42.5" cy="50" rx="2.2" ry="2.8" fill="${CP_INK}"/><circle cx="43.2" cy="49" r=".8" fill="#fff"/>
<path d="M32 40Q50 48 68 38" fill="none" stroke="#111" stroke-width="1.8"/>
<ellipse cx="57.5" cy="50" rx="5.2" ry="4.6" fill="#15151d" ${CP_S}/>
<path d="M45 57l-1.6 5.4M56 57l1.6 5.4" stroke="#4a2f1a" stroke-width="1.2" opacity="0"/>
<path d="M47 58Q50 60 53 58" fill="none" stroke="#a3573c" stroke-width="1.8" stroke-linecap="round"/>
<path d="M17 42L50 15L83 42Q50 32 17 42Z" fill="#1d2a52" ${CP_S}/>
<path d="M17 42Q50 32 83 42" fill="none" stroke="#ffd23f" stroke-width="3"/>
<path d="M60 22Q78 4 86 18Q76 16 68 30Z" fill="#fffaf0" ${CP_S}/>
<circle cx="50" cy="26" r="3" fill="#ffd23f" ${CP_S}/>`,
    B: `<path d="M8 100Q10 76 32 70L68 70Q90 76 92 100Z" fill="#169c62" ${CP_S}/>
<path d="M20 76Q34 66 38 72Q44 64 50 72Q56 64 62 72Q66 66 80 76Q66 88 50 86Q34 88 20 76Z" fill="#fffaf0" ${CP_S}/>
<path d="M44 66h12v6q-6 4-12 0z" fill="#e9b88c" ${CP_S}/>
<ellipse cx="50" cy="50" rx="16" ry="18" fill="${CP_SK}" ${CP_S}/>
<path d="M33 46Q30 54 34 60M67 46Q70 54 66 60" fill="none" stroke="#9aa3ad" stroke-width="3.4" stroke-linecap="round"/>
${cpEyes(48, { ry: 2.3 })}
<circle cx="42.5" cy="48" r="6.4" fill="#cfe9ff" fill-opacity=".45" stroke="${CP_INK}" stroke-width="1.8"/><circle cx="57.5" cy="48" r="6.4" fill="#cfe9ff" fill-opacity=".45" stroke="${CP_INK}" stroke-width="1.8"/><path d="M48.9 48h2.2" stroke="${CP_INK}" stroke-width="1.8"/>
<path d="M37 40Q42 37 47 40M53 40Q58 37 63 40" fill="none" stroke="#7d848e" stroke-width="2.4" stroke-linecap="round"/>
<path d="M44 58Q50 63 56 58" fill="none" stroke="#a3573c" stroke-width="2" stroke-linecap="round"/>
<path d="M30 34h40l-3 -16h-34z" fill="#12804e" ${CP_S}/>
<ellipse cx="50" cy="35" rx="26" ry="4.4" fill="#0f6a41" ${CP_S}/>
<rect x="33" y="27" width="34" height="5" fill="#ffd23f" stroke="${CP_INK}" stroke-width="1.4"/>
<path d="M60 20Q82 4 88 22Q78 14 68 24Z" fill="#fffaf0" ${CP_S}/>
<g transform="rotate(-14 74 88)"><rect x="56" y="80" width="38" height="13" rx="6.5" fill="#f7e8b8" ${CP_S}/><ellipse cx="94" cy="86.5" rx="3.4" ry="6.5" fill="#e9d295" ${CP_S}/><path d="M64 84h22M64 88h16" stroke="#b79a52" stroke-width="1.4" stroke-linecap="round"/><path d="M74 80v13" stroke="#c62f3d" stroke-width="3.6"/><circle cx="74" cy="86.5" r="3.6" fill="#e5484d" ${CP_S}/></g>`,
    S: `<path d="M8 100Q10 76 30 72L70 72Q90 76 92 100Z" fill="#c8213f" ${CP_S}/>
<path d="M14 76Q50 28 86 76Q70 62 50 62Q30 62 14 76Z" fill="#fff4f8" ${CP_S}/>
<path d="M18 74Q50 46 82 74" fill="none" stroke="#e7b5c5" stroke-width="1.6"/>
<path d="M44 66h12v8q-6 4-12 0z" fill="#e9b88c" ${CP_S}/>
<ellipse cx="50" cy="50" rx="16" ry="18.5" fill="${CP_SK}" ${CP_S}/>
<path d="M32 50Q28 24 50 22Q72 24 68 50Q64 36 50 34Q36 36 32 50Z" fill="#3a1c2b" ${CP_S}/>
<ellipse cx="50" cy="24" rx="12" ry="7" fill="#3a1c2b" ${CP_S}/>
<circle cx="31" cy="46" r="4.4" fill="#3a1c2b" ${CP_S}/><circle cx="69" cy="46" r="4.4" fill="#3a1c2b" ${CP_S}/>
${cpEyes(49, { ry: 2.4 })}
<path d="M39 47Q42.5 44.5 46 47M54 47Q57.5 44.5 61 47" fill="none" stroke="${CP_INK}" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="38" cy="55" rx="3.2" ry="2" fill="#ff8aa3" opacity=".6"/><ellipse cx="62" cy="55" rx="3.2" ry="2" fill="#ff8aa3" opacity=".6"/>
<path d="M44 58Q50 64 56 58Q50 60.4 44 58Z" fill="#d6203c" ${CP_S}/>
<circle cx="56" cy="53" r=".9" fill="${CP_INK}"/>
<path d="M40 30L44 20L50 27L56 20L60 30Z" fill="#ffd23f" ${CP_S}/><circle cx="50" cy="26" r="2.2" fill="#3e8ef7" stroke="${CP_INK}" stroke-width="1.2"/>
<g fill="#fffaf0" stroke="${CP_INK}" stroke-width="1.2"><circle cx="36" cy="76" r="2.2"/><circle cx="42" cy="79" r="2.2"/><circle cx="50" cy="80" r="2.2"/><circle cx="58" cy="79" r="2.2"/><circle cx="64" cy="76" r="2.2"/></g>
<g><path d="M62 98L55 64Q76 52 98 70Z" fill="#ffd6e0" ${CP_S}/><path d="M62 98L66 62M62 98L77 59M62 98L88 62" stroke="#e08aa0" stroke-width="1.4" fill="none"/><path d="M55 64Q76 52 98 70" fill="none" stroke="#c8213f" stroke-width="3"/></g>`
  };
  const CP_CL = {
    D: ['#8c4ee0', '#4a1f94'], A: ['#585c74', '#1a1b26'], C: ['#3b8cf0', '#1b4aa0'], B: ['#2fc27f', '#127a49'], S: ['#f0566e', '#a3142f']
  };
  const CP_DESC = {
    D: 'Tax: take 3 coins. Blocks Foreign Aid.',
    A: 'Assassinate: pay 3 coins, target loses an influence.',
    C: 'Steal: take 2 coins from a player. Blocks stealing.',
    B: 'Exchange: draw 2 cards, keep what you like. Blocks stealing.',
    S: 'Blocks assassination.'
  };
  const CP_SHORT = { D: 'Tax / blocks aid', A: 'Assassinate', C: 'Steal / blocks', B: 'Exchange / blocks', S: 'Blocks assassins' };
  const CP_BACK = `<svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice"><rect width="100" height="140" fill="#1c2352"/><g fill="none" stroke="#3a4690" stroke-width="1.4"><path d="M0 20L120 140M0 50L90 140M0 80L60 140M0 110L30 140M20 0L120 100M50 0L120 70M80 0L120 40"/><path d="M100 20L-20 140M100 50L10 140M100 80L40 140M100 110L70 140M80 0L-20 100M50 0L-20 70M20 0L-20 40"/></g><circle cx="50" cy="70" r="27" fill="#2b3478" stroke="#ffd23f" stroke-width="3"/><circle cx="50" cy="70" r="21" fill="none" stroke="#ffd23f" stroke-width="1.2" stroke-dasharray="2 3"/><path d="M34 80L31 58L42 67L50 52L58 67L69 58L66 80Z" fill="#ffd23f" stroke="#24152e" stroke-width="2" stroke-linejoin="round"/><circle cx="31" cy="57" r="3" fill="#ffd23f" stroke="#24152e" stroke-width="1.4"/><circle cx="50" cy="51" r="3.2" fill="#ffd23f" stroke="#24152e" stroke-width="1.4"/><circle cx="69" cy="57" r="3" fill="#ffd23f" stroke="#24152e" stroke-width="1.4"/><rect x="34" y="80" width="32" height="5" rx="1.6" fill="#f2a516" stroke="#24152e" stroke-width="1.6"/></svg>`;
  const cpCardHTML = (c, o) => `<div class="cpc ${c ? 'k' + c : 'bk'}${o ? ' ' + o : ''}">${c ? `<div class="cpf" style="--c1:${CP_CL[c][0]};--c2:${CP_CL[c][1]}"><b>${CP_N[c]}</b><svg viewBox="0 0 100 100" aria-hidden="true">${CP_ART[c]}</svg><i>${CP_SHORT[c]}</i></div>` : `<div class="cpf">${CP_BACK}</div>`}</div>`;
  const cpDot = c => `<span class="cpd" style="--c1:${CP_CL[c][0]};--c2:${CP_CL[c][1]}"></span>`;
  const cpCoin = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#f2b21a" stroke="#7a4d00" stroke-width="1.6"/><circle cx="12" cy="12" r="7.4" fill="#ffd95a" stroke="#c98a0a" stroke-width="1.2"/><path d="M7.6 14.4L7 9.4l2.7 2.2L12 8.6l2.3 3L17 9.4l-.6 5z" fill="#c98a0a"/><path d="M8 7.4a6.6 6.6 0 0 1 4-1.5" fill="none" stroke="#fff7cf" stroke-width="1.4" stroke-linecap="round"/></svg>`;

  const CP_CSS = css(`
.gm-coup{--tbg:#22102c;--a1:#d9363e;--a2:#ffd23f;--b1:#2f7de0}
.gm-coup .tb{background:radial-gradient(ellipse at 50% 34%,#4b2250,#1b0c26 74%);border:3px solid #0d0616}
.gm-coup .tb-pane.solid,.gm-coup .tb-pane.clear{background:transparent}
.gm-coup .cpc{position:relative;width:100%;aspect-ratio:5/7;container-type:inline-size;border-radius:8%/5.8%;background:#fff4d6;box-shadow:0 .4u 0 rgba(0,0,0,.32),0 .8u 1.6u rgba(0,0,0,.3);flex:none}
.gm-coup .cpf{position:absolute;inset:3.6%;border-radius:6%/4.4%;background:linear-gradient(165deg,var(--c1),var(--c2));overflow:hidden;display:flex;flex-direction:column;border:max(1px,1.5cqw) solid #24152e}
.gm-coup .cpf svg{flex:1;min-height:0;width:100%;display:block}
.gm-coup .cpf b{flex:none;display:block;text-align:center;font:900 max(9px,10.6cqw)/1.1 var(--sans);letter-spacing:0;text-transform:uppercase;color:#fff;-webkit-text-stroke:max(1px,2.4cqw) #24152e;paint-order:stroke fill;padding:6% 2% 1%}
.gm-coup .cpc.kA .cpf b,.gm-coup .cpc.kS .cpf b{font-size:max(8px,9.4cqw)}
.gm-coup .cpc.kB .cpf b{font-size:max(7px,8.6cqw);padding-top:8%}
.gm-coup .cpf i{flex:none;display:block;text-align:center;font:800 max(8.5px,8.6cqw)/1.15 var(--sans);font-style:normal;color:#fff;background:rgba(20,8,30,.42);padding:3.5% 3%;min-height:2.2em}
.gm-coup .cpc.bk .cpf{border-color:#ffd23f;background:#1c2352}
.gm-coup .cpc.mini b,.gm-coup .cpc.mini i{display:none}
.gm-coup .cpc.mini .cpf{border-width:max(1px,2.4cqw)}
.gm-coup .cpc.mid i{display:none}
.gm-coup .cpc.lost{filter:grayscale(.6) brightness(.72)}
.gm-coup .cpc.lost::after{content:"";position:absolute;inset:0;background:linear-gradient(to top right,transparent 47%,rgba(217,54,62,.95) 48.5%,rgba(217,54,62,.95) 51.5%,transparent 53%);border-radius:inherit;pointer-events:none}
.gm-coup .tb-fly .cpc{width:100%;height:100%;aspect-ratio:auto}
.gm-coup .cpd{display:inline-block;width:1.2u;height:1.2u;min-width:9px;min-height:9px;border-radius:50%;background:linear-gradient(135deg,var(--c1),var(--c2));border:2px solid #fff;flex:none}
.gm-coup kbd{font:800 1.05t var(--sans);background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.5);border-radius:.6u;padding:0 .5u;margin-left:.6u}
.gm-coup .cp-ui{position:absolute;inset:0;display:flex;flex-direction:column;padding:.8u 1.4u 1u}
.gm-coup .cp-bar{align-self:center;flex:none;display:flex;align-items:center;height:3.4u;padding:0 2.2u;border-radius:2u;background:rgba(0,0,0,.42);font:900 1.5t var(--sans);white-space:nowrap;margin-bottom:.8u;max-width:62u;overflow:hidden;text-overflow:ellipsis}
.gm-coup .cp-bar.me{background:#ffd23f;color:#2a1e00}
.gm-coup .cp-bar.alert{background:#d9363e}
.gm-coup .cp-opps{display:flex;justify-content:center;gap:1u;flex:none}
.gm-coup .cp-op{position:relative;width:16.6u;height:12.6u;padding:.6u .8u;border-radius:1.3u;background:rgba(0,0,0,.3);border:2px solid transparent;flex:none;display:flex;flex-direction:column;justify-content:space-between;transition:background .2s,border-color .2s}
.gm-coup .cp-opps.n1 .cp-op{width:28u}
.gm-coup .cp-opps.n2 .cp-op{width:22u}
.gm-coup .cp-op.turn{border-color:#ffd23f;background:rgba(255,210,63,.13);box-shadow:0 0 1.5u rgba(255,210,63,.35)}
.gm-coup .cp-op.wait:not(.turn){border-color:rgba(125,255,176,.55);background:rgba(125,255,176,.1)}
.gm-coup .cp-op.out{opacity:.46;filter:grayscale(.8)}
.gm-coup .cp-op.tgt{cursor:pointer;border-color:#ffd23f;animation:cpglow .8s ease-in-out infinite alternate}
@keyframes cpglow{from{box-shadow:0 0 .5u rgba(255,210,63,.3)}to{box-shadow:0 0 2.2u rgba(255,210,63,.95)}}
.gm-coup .cp-op kbd{position:absolute;top:-.8u;right:-.6u;margin:0}
.gm-coup .cp-on{display:flex;align-items:center;gap:.5u;font:800 1.3t var(--sans);min-width:0}
.gm-coup .cp-on .av{width:2.4u;height:2.4u;min-width:16px;min-height:16px;font-size:1.1t}
.gm-coup .cp-on b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-coup .cp-or{display:flex;align-items:flex-end;justify-content:space-between;gap:.6u}
.gm-coup .cp-sl{display:flex;gap:.6u}
.gm-coup .cp-sl>div{width:4.5u}
.gm-coup .cp-co{display:flex;align-items:center;gap:.4u;font:900 2t var(--sans);text-shadow:0 2px 3px rgba(0,0,0,.5)}
.gm-coup .cp-co svg,.gm-coup .cp-cn svg,.gm-coup .cp-bank svg{width:2.4u;height:2.4u;min-width:14px;min-height:14px;display:block;flex:none}
.gm-coup .cp-mid{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:1.6u;padding:.4u 0}
.gm-coup .cp-side{display:flex;flex-direction:column;align-items:center;gap:.7u;width:10u;flex:none}
.gm-coup .cp-deck{position:relative;width:7.4u;flex:none}
.gm-coup .cp-deck .cpc{position:absolute;left:0;top:0}
.gm-coup .cp-deck .cpc:nth-child(1){transform:translate(.5u,.5u)}
.gm-coup .cp-deck .cpc:nth-child(2){transform:translate(.25u,.25u)}
.gm-coup .cp-deck .cpc:nth-child(3){position:relative}
.gm-coup .cp-deck .cnt{position:absolute;right:-1u;top:-.8u;min-width:2.1u;padding:.1u .5u;border-radius:1u;background:#1a1330;border:2px solid #fff;color:#fff;font:900 1.2t var(--sans);text-align:center;z-index:3}
.gm-coup .cp-lb{font:800 1t var(--sans);letter-spacing:.7px;text-transform:uppercase;color:rgba(255,255,255,.6);text-align:center;margin-top:.3u}
.gm-coup .cp-bank{display:flex;align-items:center;justify-content:center;gap:.3u;margin-top:.6u}
.gm-coup .cp-co>span,.gm-coup .cp-cn>span{display:block;line-height:0}
.gm-coup .tb-fly svg{width:100%;height:100%;display:block}
.gm-coup .cp-bank svg{margin-left:-.9u}
.gm-coup .cp-bank svg:first-child{margin-left:0}
.gm-coup .cp-stage{flex:1;min-width:0;max-width:50u;align-self:stretch;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7u;padding:1u 1.4u;border-radius:1.8u;background:rgba(0,0,0,.3);border:2px solid rgba(255,210,63,.28);text-align:center}
.gm-coup .cp-stage>.cp-ht{text-align:center}
.gm-coup .cp-hd{display:flex;align-items:center;justify-content:center;gap:1.2u}
.gm-coup .cp-hd .cpc{width:6.4u}
.gm-coup .cp-ht{font:900 1.85t/1.2 var(--sans);text-shadow:0 2px 4px rgba(0,0,0,.6);text-align:left;min-width:0}
.gm-coup .cp-ht small{display:block;font:700 1.2t/1.3 var(--sans);color:rgba(255,255,255,.75);margin-top:.3u}
.gm-coup .cp-ht b{color:#ffd23f}
.gm-coup .cp-ht b.bad{color:#ff7b7b}
.gm-coup .cp-ht b.good{color:#7dffb0}
.gm-coup .cp-pr{display:flex;flex-wrap:wrap;justify-content:center;gap:.8u}
.gm-coup .cp-b{position:relative;min-height:4.6u;min-width:12u;padding:.4u 1.6u;border-radius:1.4u;border:0;color:#fff;font:900 1.6t/1.1 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -4px 0 rgba(0,0,0,.24),0 4px 10px rgba(0,0,0,.35);background:#3b6fd6;display:inline-flex;align-items:center;justify-content:center;gap:.6u}
.gm-coup .cp-b:active{transform:translateY(2px)}
.gm-coup .cp-b.ch{background:#d9363e}
.gm-coup .cp-b.ok{background:#2f9e5e}
.gm-coup .cp-b.bl{background:linear-gradient(135deg,var(--c1),var(--c2))}
.gm-coup .cp-b.cn{background:#6b5a7e;font-size:1.3t;min-height:3.8u}
.gm-coup .cp-b:disabled{opacity:.45}
.gm-coup .cp-tm{width:26u;height:.7u;border-radius:1u;background:rgba(255,255,255,.18);overflow:hidden}
.gm-coup .cp-tm i{display:block;height:100%;background:#ff6a58;animation:cptm linear forwards}
@keyframes cptm{from{width:100%}to{width:0}}
.gm-coup .cp-wt{display:flex;gap:.6u;justify-content:center;align-items:center;font:700 1.15t var(--sans);color:rgba(255,255,255,.75)}
.gm-coup .cp-wt .av{width:2.2u;height:2.2u;min-width:15px;min-height:15px;font-size:1t;opacity:.55}
.gm-coup .cp-wt .av.p{opacity:1;box-shadow:0 0 0 2px #7dffb0}
.gm-coup .cp-logc{width:25u;flex:none;align-self:stretch;display:flex;flex-direction:column;justify-content:flex-end;gap:.5u;min-width:0}
.gm-coup .cp-log{display:flex;flex-direction:column;justify-content:flex-end;gap:.3u;min-height:0;overflow:hidden;flex:1}
.gm-coup .cp-log p{margin:0;font:700 1.15t/1.25 var(--sans);color:rgba(255,255,255,.66);text-align:left}
.gm-coup .cp-log p:last-child{color:#fff}
.gm-coup .cp-log p b{color:#ffd23f}
.gm-coup .cp-rv{display:flex;gap:.6u;justify-content:flex-start;align-items:center;flex-wrap:wrap;min-height:2.6u}
.gm-coup .cp-rv>span{display:inline-flex;align-items:center;gap:.3u;font:900 1.1t var(--sans);background:rgba(0,0,0,.35);border-radius:1u;padding:.2u .6u .2u .4u}
.gm-coup .cp-rv em{font:800 1t var(--sans);font-style:normal;color:rgba(255,255,255,.55);margin-right:.3u}
.gm-coup .cp-me{flex:none;display:flex;align-items:flex-end;gap:1.6u;height:22.6u;padding-bottom:.2u}
.gm-coup .cp-hand{display:flex;gap:1.2u;flex:none}
.gm-coup .cp-mc{position:relative;width:13.4u;flex:none;transition:transform .15s}
.gm-coup .cp-mc.pick{cursor:pointer;animation:cpglow .8s ease-in-out infinite alternate;border-radius:1.2u}
.gm-coup .cp-mc.cur .cpc{outline:.45u solid #ffd23f;outline-offset:.2u}
.gm-coup .cp-mi{flex:none;display:flex;flex-direction:column;gap:.7u;width:11u;align-self:flex-end;padding-bottom:.4u}
.gm-coup .cp-mn{display:flex;align-items:center;gap:.5u;font:800 1.35t var(--sans);min-width:0}
.gm-coup .cp-mn b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.gm-coup .cp-cn{display:flex;align-items:center;gap:.6u;font:900 3.6t var(--sans);text-shadow:0 2px 4px rgba(0,0,0,.5)}
.gm-coup .cp-cn svg{width:4u;height:4u}
.gm-coup .cp-must{font:900 1.15t/1.2 var(--sans);color:#ffd23f}
.gm-coup .cp-acts{flex:1;min-width:0;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:.7u;align-self:stretch;padding:.2u 0}
.gm-coup .cp-a{position:relative;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:.2u;padding:.4u .9u .4u 1.5u;border-radius:1.3u;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.09);color:#fff;text-align:left;min-width:0;overflow:hidden}
.gm-coup .cp-a::before{content:"";position:absolute;left:0;top:0;bottom:0;width:.6u;background:linear-gradient(var(--c1,#aab),var(--c2,#667))}
.gm-coup .cp-a b{font:900 1.45t/1.1 var(--sans);white-space:nowrap}
.gm-coup .cp-a small{font:700 1.05t/1.2 var(--sans);color:rgba(255,255,255,.72)}
.gm-coup .cp-a kbd{position:absolute;top:.3u;right:.4u;margin:0}
.gm-coup .cp-a.on{background:linear-gradient(135deg,rgba(255,210,63,.32),rgba(255,210,63,.1));border-color:#ffd23f}
.gm-coup .cp-a:disabled{opacity:.38}
.gm-coup .cp-a.must{border-color:#ffd23f;animation:cpglow .8s ease-in-out infinite alternate}
.gm-coup .cp-a.help{align-items:center;background:rgba(255,255,255,.04);font:900 2t var(--sans)}
.gm-coup .cp-a.help::before{display:none}
.gm-coup .cp-ovl{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(10,4,18,.7);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);padding:1.5u}
.gm-coup .cp-dlg{width:100%;max-width:60u;text-align:center;background:linear-gradient(#2e1a46,#170c28);border:3px solid rgba(255,255,255,.16);border-radius:2.4u;padding:1.6u 2u 1.6u;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:tbin .3s cubic-bezier(.2,1.4,.4,1);max-height:100%;overflow:auto}
.gm-coup .cp-dlg h3{margin:.2u 0 .6u;font:900 2.4t var(--sans)}
.gm-coup .cp-dlg p{margin:.4u 0;font:700 1.35t/1.35 var(--sans);color:rgba(255,255,255,.85)}
.gm-coup .cp-dlg .tb-kick{font:900 1.2t var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#ffd23f!important;margin:0!important}
.gm-coup .cp-cs{display:flex;justify-content:center;gap:1.6u;margin:1u 0;flex-wrap:wrap}
.gm-coup .cp-cs .cp-pk{position:relative;width:14u;cursor:pointer;border-radius:1.2u;transition:transform .12s}
.gm-coup .cp-cs .cp-pk:hover,.gm-coup .cp-cs .cp-pk.cur{transform:translateY(-.8u) scale(1.04)}
.gm-coup .cp-cs .cp-pk.keep .cpc{outline:.5u solid #7dffb0;outline-offset:.25u}
.gm-coup .cp-cs .cp-pk.cur .cpc{box-shadow:0 0 2u rgba(255,210,63,.9),0 .4u 0 rgba(0,0,0,.3)}
.gm-coup .cp-cs .cp-pk kbd{position:absolute;top:-1u;left:-.8u;margin:0;z-index:2;font-size:1.4t;padding:.1u .8u;background:#ffd23f;color:#2a1e00;border-color:#fff}
.gm-coup .cp-cs .cp-pk em{position:absolute;right:-.8u;top:-.8u;width:3u;height:3u;border-radius:50%;background:#2f9e5e;border:2px solid #fff;display:none;place-items:center;font:900 1.6t var(--sans);font-style:normal;z-index:2}
.gm-coup .cp-cs .cp-pk.keep em{display:grid}
.gm-coup .cp-ref{display:grid;grid-template-columns:repeat(2,1fr);gap:1u 1.6u;text-align:left;margin:.8u 0}
.gm-coup .cp-ref>div{display:flex;gap:1u;align-items:center}
.gm-coup .cp-ref .cpc{width:6.4u}
.gm-coup .cp-ref p{margin:0;font:700 1.15t/1.3 var(--sans)}
.gm-coup .cp-ref p b{display:block;font:900 1.35t var(--sans);color:#ffd23f}
.gm-coup .cp-fx{position:absolute;inset:0;pointer-events:none;z-index:30;overflow:hidden}
.gm-coup .cp-fx.dim::before{content:"";position:absolute;inset:0;background:rgba(6,2,12,.5)}
.gm-coup .cp-anchor{position:absolute;left:50%;top:44%;width:12u;height:16.8u;transform:translate(-50%,-50%)}
.gm-coup .cp-big{position:absolute;z-index:3;animation:cpbig .45s cubic-bezier(.2,1.3,.4,1) both}
@keyframes cpbig{from{transform:scale(.4) rotate(-10deg);opacity:0}to{transform:none;opacity:1}}
.gm-coup .cp-big.flip{animation:cpflip .6s ease-out both}
@keyframes cpflip{0%{transform:rotateY(180deg) scale(.7);opacity:.2}60%{transform:rotateY(0) scale(1.12);opacity:1}100%{transform:none;opacity:1}}
.gm-coup .cp-big.out{animation:cpout .5s ease-in both}
@keyframes cpout{to{transform:scale(.3) translateY(8u);opacity:0}}
.gm-coup .cp-big.shatter{animation:cpshat .7s ease-in both}
@keyframes cpshat{0%{transform:none}25%{transform:rotate(-4deg) scale(1.06)}60%{transform:rotate(5deg) scale(1.02);filter:grayscale(.9) brightness(.6)}100%{transform:translateY(5u) rotate(14deg) scale(.7);opacity:0;filter:grayscale(1) brightness(.4)}}
.gm-coup .cp-cap{position:absolute;left:50%;top:calc(44% + 11u);transform:translateX(-50%);white-space:nowrap;padding:.5u 2u;border-radius:2u;background:rgba(0,0,0,.72);font:900 1.7t var(--sans);animation:cpcap .35s ease both;z-index:4}
@keyframes cpcap{from{transform:translateX(-50%) scale(.7);opacity:0}to{transform:translateX(-50%);opacity:1}}
.gm-coup .cp-ban{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) rotate(-3deg);padding:.8u 3.4u;border-radius:1.6u;background:linear-gradient(135deg,var(--c1,#d9363e),var(--c2,#8a1020));border:.4u solid #fff;color:#fff;font:900 4.2t/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;text-shadow:0 .3u 0 rgba(0,0,0,.35);white-space:nowrap;box-shadow:0 1.2u 3u rgba(0,0,0,.5);animation:cpban 1.1s cubic-bezier(.2,1.4,.4,1) both;text-align:center;z-index:5}
.gm-coup .cp-ban small{display:block;font:800 1.6t var(--sans);letter-spacing:0;text-transform:none;margin-top:.5u}
@keyframes cpban{0%{transform:translate(-50%,-50%) scale(.3) rotate(-14deg);opacity:0}18%{transform:translate(-50%,-50%) scale(1.14) rotate(-3deg);opacity:1}30%{transform:translate(-50%,-50%) scale(1) rotate(-3deg)}85%{opacity:1}100%{transform:translate(-50%,-62%) scale(1) rotate(-3deg);opacity:0}}
.gm-coup .cp-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(255,80,60,.75),rgba(255,40,40,0) 70%);animation:cpfl .6s ease-out both}
@keyframes cpfl{from{opacity:1}to{opacity:0}}
.gm-coup .cp-stamp{position:absolute;transform:translate(-50%,-50%) rotate(-12deg);font:900 3.4t var(--sans);color:#ff5252;border:.35u solid #ff5252;border-radius:1u;padding:0 1u;background:rgba(0,0,0,.55);letter-spacing:.06em;animation:cpban .9s ease both;z-index:5}
.gm-coup .cp-dag{position:absolute;width:5u;height:14u;z-index:6}
.gm-coup .cp-fly{position:absolute;z-index:6;width:3u;height:3u}
.gm-coup .cp-logo{display:flex;flex-direction:column;align-items:center;margin:.2u 0 .8u}
.gm-coup .cp-logo svg{width:16u;height:11u;min-width:90px;min-height:62px;animation:cplg 1.8s ease-in-out infinite alternate}
.gm-coup .cp-logo b{font:900 6t/1 var(--sans);color:#ffd23f;letter-spacing:.2em;-webkit-text-stroke:.5u #24152e;paint-order:stroke fill;text-shadow:0 .5u 0 rgba(0,0,0,.35);padding-left:.2em}
@keyframes cplg{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-.8u) rotate(3deg)}}
@media (prefers-reduced-motion:reduce){.gm-coup .cp-op.tgt,.gm-coup .cp-mc.pick,.gm-coup .cp-a.must{animation:none}}
.gm-coup .tb.port .cp-logo svg{width:38u;height:26u}
.gm-coup .tb.port .cp-logo b{font-size:14t}
.gm-coup .tb.port .cp-ui{padding:1.5u 2u 1.5u}
.gm-coup .tb.port .cp-bar{height:8u;padding:0 4u;font-size:3.6t;margin-bottom:1u;max-width:70u}
.gm-coup .tb.port .cp-opps{flex-wrap:wrap;gap:1.2u;align-content:flex-start}
.gm-coup .tb.port .cp-op{width:31.4u;height:18.4u;padding:1.1u 1.4u;border-radius:2.4u}
.gm-coup .tb.port .cp-opps.n1 .cp-op{width:48u}
.gm-coup .tb.port .cp-opps.n2 .cp-op{width:48u}
.gm-coup .tb.port .cp-on{gap:1u;font-size:3.5t}
.gm-coup .tb.port .cp-on .av{width:5.4u;height:5.4u;font-size:2.8t}
.gm-coup .tb.port .cp-sl>div{width:8.4u}
.gm-coup .tb.port .cp-sl{gap:1.2u}
.gm-coup .tb.port .cp-co{font-size:4.6t;gap:.8u}
.gm-coup .tb.port .cp-co svg,.gm-coup .tb.port .cp-bank svg{width:5.2u;height:5.2u}
.gm-coup .tb.port .cp-op kbd{font-size:3t;top:-1.6u;right:-1u;padding:0 1.2u;border-radius:1.2u}
.gm-coup .tb.port .cp-mid{flex-direction:column;gap:1.2u;padding:1.2u 0;align-items:stretch;justify-content:flex-start}
.gm-coup .tb.port .cp-stage{flex:1;max-width:none;align-self:stretch;padding:2u 2.4u;gap:1.6u;border-radius:3.2u;position:relative}
.gm-coup .tb.port .cp-hd{gap:2.4u}
.gm-coup .tb.port .cp-hd .cpc{width:13u}
.gm-coup .tb.port .cp-ht{font-size:4.2t}
.gm-coup .tb.port .cp-ht small{font-size:3.2t}
.gm-coup .tb.port .cp-pr{gap:1.6u;width:100%}
.gm-coup .tb.port .cp-b{min-height:11u;min-width:26u;font-size:4t;border-radius:3u;padding:.8u 3u;flex:1 1 auto}
.gm-coup .tb.port .cp-b.cn{font-size:3.4t;min-height:9u;flex:none}
.gm-coup .tb.port .cp-tm{width:60u;height:1.4u}
.gm-coup .tb.port .cp-wt{font-size:3.2t;gap:1.2u}
.gm-coup .tb.port .cp-wt .av{width:5u;height:5u;font-size:2.6t}
.gm-coup .tb.port .cp-side{flex-direction:row;width:auto;gap:4u;justify-content:flex-end;align-items:center;padding-right:2u}
.gm-coup .tb.port .cp-deck{width:6.4u}
.gm-coup .tb.port .cp-lb{display:none}
.gm-coup .tb.port .cp-logc{width:auto;align-self:stretch;flex:none}
.gm-coup .tb.port .cp-log{max-height:12u}
.gm-coup .tb.port .cp-log p{font-size:3.1t}
.gm-coup .tb.port .cp-rv{display:none}
.gm-coup .tb.port .cp-me{height:auto;flex-wrap:wrap;gap:1.6u;align-items:flex-end;justify-content:center}
.gm-coup .tb.port .cp-hand{gap:2.4u}
.gm-coup .tb.port .cp-mc{width:21u}
.gm-coup .tb.port .cp-mi{width:auto;flex:1;min-width:30u;gap:1.4u;padding-bottom:.6u}
.gm-coup .tb.port .cp-mn{font-size:3.6t;gap:1u}
.gm-coup .tb.port .cp-cn{font-size:8t;gap:1.4u}
.gm-coup .tb.port .cp-cn svg{width:8u;height:8u}
.gm-coup .tb.port .cp-must{font-size:3.2t}
.gm-coup .tb.port .cp-acts{flex:none;width:100%;grid-template-columns:repeat(2,1fr);grid-auto-rows:11.6u;gap:1.4u}
.gm-coup .tb.port .cp-a{padding:.6u 2u .6u 3u;border-radius:2.6u;gap:.4u}
.gm-coup .tb.port .cp-a::before{width:1.4u}
.gm-coup .tb.port .cp-a b{font-size:3.9t}
.gm-coup .tb.port .cp-a small{font-size:2.9t}
.gm-coup .tb.port .cp-a kbd{display:none}
.gm-coup .tb.port .cp-a.help{font-size:4t}
.gm-coup .tb.port .cp-dlg{max-width:94u;padding:3u 3u 3u;border-radius:5u}
.gm-coup .tb.port .cp-dlg h3{font-size:5.4t}
.gm-coup .tb.port .cp-dlg p{font-size:3.5t}
.gm-coup .tb.port .cp-dlg .tb-kick{font-size:3t!important}
.gm-coup .tb.port .cp-cs{gap:2.4u}
.gm-coup .tb.port .cp-cs .cp-pk{width:26u}
.gm-coup .tb.port .cp-cs .cp-pk kbd{display:none}
.gm-coup .tb.port .cp-cs .cp-pk em{width:7u;height:7u;font-size:4t}
.gm-coup .tb.port .cp-ref{grid-template-columns:1fr;gap:1.6u}
.gm-coup .tb.port .cp-ref .cpc{width:14u}
.gm-coup .tb.port .cp-ref p{font-size:3.2t}
.gm-coup .tb.port .cp-ref p b{font-size:3.8t}
.gm-coup .tb.port .cp-anchor{width:30u;height:42u;top:38%}
.gm-coup .tb.port .cp-cap{font-size:4t;padding:1u 4u;top:calc(38% + 24u)}
.gm-coup .tb.port .cp-ban{font-size:8t;padding:1.4u 6u}
.gm-coup .tb.port .cp-ban small{font-size:3.6t}
.gm-coup .tb.port .cp-stamp{font-size:7t}
`);

  const CP_AI = {
    income: { n: 'Income', k: 'i', s: () => '+1 coin' },
    aid: { n: 'Foreign Aid', k: 'f', s: () => '+2 coins' },
    coup: { n: 'Coup', k: 'c', s: () => 'Pay 7 coins' },
    tax: { n: 'Tax', k: 't', cl: 'D', s: () => 'Duke: +3 coins' },
    assassinate: { n: 'Assassinate', k: 'a', cl: 'A', s: () => 'Assassin: pay 3' },
    steal: { n: 'Steal', k: 's', cl: 'C', s: () => 'Captain: take 2' },
    exchange: { n: 'Exchange', k: 'e', cl: 'B', s: () => 'Ambassador: swap' }
  };
  const CP_KEYS = Object.keys(CP_AI);

  const cpUI = h => {
    const api = h.api, root = h.board;
    root.classList.add('cp-root');
    const ui = mk('div', 'cp-ui'), fx = mk('div', 'cp-fx'), anchor = mk('div', 'cp-anchor');
    anchor.dataset.k = 'anchor';
    fx.append(anchor);
    root.append(ui, fx);
    let V = null, info = null, mode = null, cur = 0, keep = [], ref = false, log = [], recv = 0, late = 0, big = null;

    const me = () => info.seat;
    const nm = q => q === me() ? 'You' : info.names[q];
    const nmb = q => `<b>${esc(nm(q))}</b>`;
    const vb = (q, a, b) => `${nmb(q)} ${q === me() ? a : b}`;
    const alive = () => V.alive;
    const live = q => V.hn[q] > 0;
    const myTurn = () => V && !V.over && V.phase === 'act' && V.turn === me() && live(me());
    const waiting = () => V && !V.over && V.wait.includes(me()) && (V.phase === 'chal' || V.phase === 'block' || V.phase === 'bchal');
    const myLose = () => V && !V.over && V.phase === 'lose' && V.lp === me();
    const myXchg = () => V && !V.over && V.phase === 'xchg' && V.turn === me() && V.xc;
    const targets = () => range(0, V.n - 1).filter(q => q !== me() && live(q));
    const rem = () => V && V.dl ? Math.max(0, V.dl - (performance.now() - recv)) : 0;
    const canAct = k => myTurn() && V.coins[me()] >= (CP_ACT[k].cost) && (V.coins[me()] < 10 || k === 'coup');
    const blocks = () => V.A && CP_BLK[V.A.kind] || [];

    const actLine = A => {
      const P = A.p, T = A.target, you = T === me();
      const tg = T >= 0 ? (you ? '<b>you</b>' : nmb(T)) : '';
      return {
        income: [`${vb(P, 'take', 'takes')} Income`, '+1 coin. Nobody can stop it.'],
        aid: [`${vb(P, 'take', 'takes')} Foreign Aid`, '+2 coins. A Duke can block it.'],
        coup: [`${vb(P, 'launch', 'launches')} a Coup on ${tg}`, 'Pays 7 coins. Cannot be blocked or challenged.'],
        tax: [`${vb(P, 'claim', 'claims')} the <b>Duke</b>`, 'to collect Tax: +3 coins.'],
        assassinate: [`${vb(P, 'claim', 'claims')} the <b>Assassin</b>`, `to assassinate ${tg}. Paid 3 coins.`],
        steal: [`${vb(P, 'claim', 'claims')} the <b>Captain</b>`, `to steal 2 coins from ${tg}.`],
        exchange: [`${vb(P, 'claim', 'claims')} the <b>Ambassador</b>`, 'to exchange cards with the court.']
      }[A.kind];
    };
    const blkLine = A => [`${vb(A.blocker, 'claim', 'claims')} the <b>${CP_N[A.bc]}</b>`, `to block ${A.p === me() ? 'your' : esc(nm(A.p)) + '&#39;s'} ${CP_AI[A.kind].n}.`];

    function status() {
      const v = V, m = me();
      if (v.over) return v.over.win === m ? 'You hold the court!' : nm(v.over.win) + ' rules the court!';
      if (!live(m)) return 'You are out. Watching the court...';
      if (v.phase === 'lose') return v.lp === m ? 'Choose an influence to lose' : nm(v.lp) + ' loses an influence';
      if (v.phase === 'xchg') return v.turn === m ? 'Exchange: choose your cards' : nm(v.turn) + ' is exchanging';
      if (v.phase === 'act') return v.turn === m ? (v.coins[m] >= 10 ? 'Your turn: you must Coup' : 'Your turn') : nm(v.turn) + (info.bot[v.turn] ? ' is thinking...' : ' is choosing...');
      return waiting() ? 'Your call' : 'Waiting for responses...';
    }
    const bar = () => { const v = V; return v.over ? '' : myTurn() || waiting() || myLose() || myXchg() ? ' me' : ''; };

    function stage() {
      const v = V, m = me(), A = v.A;
      let head = '', pr = '', wt = '', card = '';
      if (v.over) head = `<div class="cp-ht">${v.over.win === m ? 'You win!' : esc(nm(v.over.win)) + ' wins'}</div>`;
      else if (v.phase === 'act') {
        if (v.turn === m && live(m)) {
          if (mode) head = `<div class="cp-ht">${CP_AI[mode.k].n}: choose a target<small>Tap a player${targets().length > 1 ? ' or press its number' : ''}.</small></div>`, pr = `<button class="cp-b cn" data-do="cancel">Cancel</button>`;
          else head = `<div class="cp-ht">${v.coins[m] >= 10 ? 'You have 10 coins:<br>you <b>must</b> Coup' : 'Your move'}<small>${v.coins[m] >= 10 ? 'Pick a player to eliminate an influence.' : 'Choose an action below. Bluffing is allowed!'}</small></div>`;
        } else head = `<div class="cp-ht">${nmb(v.turn)} ${v.turn === m ? 'move' : info.bot[v.turn] ? 'is thinking...' : 'is choosing...'}<small>${v.coins[v.turn] >= 10 ? 'Has 10 coins: must Coup.' : 'Waiting for an action.'}</small></div>`;
      } else if (v.phase === 'lose') {
        head = `<div class="cp-ht">${v.lp === m ? 'You lose an influence' : nmb(v.lp) + ' loses an influence'}<small>${v.lp === m ? 'Choose which card to reveal.' : 'Waiting for the choice...'}</small></div>`;
      } else if (v.phase === 'xchg') {
        head = `<div class="cp-ht">${nmb(v.turn)} ${v.turn === m ? 'draw two cards' : 'draws two cards'}<small>${v.turn === m ? 'Choose what to keep.' : 'Exchanging with the court deck.'}</small></div>`;
      } else if (A) {
        const L = v.phase === 'bchal' ? blkLine(A) : actLine(A);
        const cl = v.phase === 'bchal' ? A.bc : A.claim;
        if (cl) card = cpCardHTML(cl, 'mid');
        head = `<div class="cp-hd">${card}<div class="cp-ht">${L[0]}<small>${L[1]}</small></div></div>`;
        if (waiting()) {
          if (v.phase === 'block') pr = blocks().map((c, i) => `<button class="cp-b bl" style="--c1:${CP_CL[c][0]};--c2:${CP_CL[c][1]}" data-do="block" data-c="${c}">Block as ${CP_N[c]}${blocks().length > 1 ? `<kbd>${i + 1}</kbd>` : '<kbd>B</kbd>'}</button>`).join('') + `<button class="cp-b ok" data-do="pass">Allow<kbd>Space</kbd></button>`;
          else pr = `<button class="cp-b ch" data-do="chal">Challenge!<kbd>C</kbd></button><button class="cp-b ok" data-do="pass">Allow<kbd>Space</kbd></button>`;
        }
        const w = v.wait.filter(q => q !== m);
        if (w.length) wt = `<div class="cp-wt">${waiting() ? 'Also deciding' : 'Waiting for'} ${w.map(q => `<span class="av p" title="${esc(nm(q))}" style="background:${AVC[q % AVC.length]}">${esc(nm(q).charAt(0).toUpperCase())}</span>`).join('')}</div>`;
        else if (!waiting() && v.wait.length === 0) wt = '';
        if (!waiting() && v.wait.includes(m) === false && live(m) && (v.phase === 'chal' || v.phase === 'block' || v.phase === 'bchal') && (v.phase === 'bchal' ? A.blocker !== m : v.phase === 'chal' ? A.p !== m : (A.kind === 'aid' ? A.p !== m : A.target === m))) wt = `<div class="cp-wt">You allowed it. Waiting...</div>` + wt;
      }
      const tm = (V.phase === 'chal' || V.phase === 'block' || V.phase === 'bchal') && rem() ? `<div class="cp-tm"><i style="animation-duration:${Math.round(rem())}ms"></i></div>` : '';
      return `${head}${pr ? `<div class="cp-pr">${pr}</div>` : ''}${wt}${tm}`;
    }

    function slots(q) {
      const v = V, m = me(), a = [];
      if (q === m) v.hand.forEach(c => a.push({ c }));
      else for (let i = 0; i < v.hn[q]; i++) a.push({ c: v.all ? v.all[q][i] : null });
      v.rev[q].forEach(c => a.push({ c, lost: true }));
      return a;
    }

    function render() {
      if (!V || !info) return;
      const v = V, m = me(), port = h.port;
      const order = []; for (let k = 1; k < v.n; k++) order.push((m + k) % v.n);
      const tg = mode ? targets() : [];
      const opps = order.map(q => {
        const dead = !live(q), tgi = tg.indexOf(q);
        const act = v.turn === q && !dead && !v.over;
        const wt = !v.over && (v.wait.includes(q) || v.lp === q) && !(v.phase === 'act');
        const sl = slots(q).map((s, i) => `<div data-k="os${q}_${i}">${cpCardHTML(s.c, 'mini' + (s.lost ? ' lost' : ''))}</div>`).join('');
        return `<div class="cp-op${act ? ' turn' : ''}${wt ? ' wait' : ''}${dead ? ' out' : ''}${tgi >= 0 ? ' tgt' : ''}" data-k="p${q}" ${tgi >= 0 ? `data-tgt="${q}"` : ''}>
<div class="cp-on">${avatar(info.names[q], q)}<b>${esc(info.names[q])}</b></div>
<div class="cp-or"><div class="cp-sl">${sl}</div><div class="cp-co"><span data-k="oc${q}">${cpCoin}</span>${v.coins[q]}</div></div>${tgi >= 0 ? `<kbd>${tgi + 1}</kbd>` : ''}</div>`;
      }).join('');
      const mySl = slots(m).map((s, i) => `<div class="cp-mc" data-k="ms${i}">${cpCardHTML(s.c, s.lost ? 'lost' : '')}</div>`).join('');
      const must = myTurn() && v.coins[m] >= 10;
      const acts = CP_KEYS.map(k => {
        const d = CP_AI[k], en = canAct(k), cl = d.cl ? CP_CL[d.cl] : null;
        const sub = k === 'coup' && !en && myTurn() ? 'Needs 7 coins' : k === 'assassinate' && !en && myTurn() && v.coins[m] < 3 ? 'Needs 3 coins' : d.s();
        return `<button class="cp-a${mode && mode.k === k ? ' on' : ''}${must && k === 'coup' ? ' must' : ''}" ${en ? '' : 'disabled'} data-act="${k}" style="${cl ? `--c1:${cl[0]};--c2:${cl[1]}` : k === 'coup' ? '--c1:#ff7a7a;--c2:#b81d2a' : '--c1:#cfd6e4;--c2:#7f8aa3'}"><b>${d.n}</b><small>${sub}</small><kbd>${d.k.toUpperCase()}</kbd></button>`;
      }).join('') + `<button class="cp-a help" data-do="ref" aria-label="Characters">?</button>`;
      const revCount = CP_ORD.map(c => ({ c, n: v.rev.reduce((s, r) => s + r.filter(x => x === c).length, 0) })).filter(x => x.n);
      const rv = `<div class="cp-rv"><em>Lost</em>${revCount.length ? revCount.map(x => `<span>${cpDot(x.c)}${x.n}/3</span>`).join('') : '<em>none yet</em>'}</div>`;
      const lg = log.slice(port ? -2 : -5).map(l => `<p>${l}</p>`).join('');
      const bank = `<div class="cp-bank" data-k="bank">${cpCoin}${cpCoin}${cpCoin}</div>`;
      const deck = `<div><div class="cp-deck" data-k="deck">${cpCardHTML(null, 'mini')}${cpCardHTML(null, 'mini')}${cpCardHTML(null, 'mini')}<span class="cnt">${v.deckN}</span></div><div class="cp-lb">Court deck</div></div>`;
      let ovl = '';
      if (myLose() && performance.now() >= late) {
        ovl = `<div class="cp-ovl"><div class="cp-dlg"><p class="tb-kick">Lose an influence</p><h3>Which card do you reveal?</h3><div class="cp-cs">${v.hand.map((c, i) => `<div class="cp-pk${cur === i ? ' cur' : ''}" data-lose="${i}" data-k="lp${i}"><kbd>${i + 1}</kbd>${cpCardHTML(c)}</div>`).join('')}</div><p>The card is revealed face up for everyone and is out of the game.</p></div></div>`;
      } else if (myXchg() && performance.now() >= late) {
        const pool = v.hand.concat(v.xc), k = v.hand.length;
        ovl = `<div class="cp-ovl"><div class="cp-dlg"><p class="tb-kick">Exchange</p><h3>Keep ${k} card${k > 1 ? 's' : ''}</h3><div class="cp-cs">${pool.map((c, i) => `<div class="cp-pk${keep.includes(i) ? ' keep' : ''}${cur === i ? ' cur' : ''}" data-pk="${i}"><kbd>${i + 1}</kbd><em>&#10003;</em>${cpCardHTML(c)}</div>`).join('')}</div><button class="tb-big ${keep.length === k ? '' : 'b'}" data-do="keep" ${keep.length === k ? '' : 'disabled'}>${keep.length === k ? 'Keep these' : `Pick ${k - keep.length} more`}</button></div></div>`;
      } else if (ref) {
        ovl = `<div class="cp-ovl" data-do="ref"><div class="cp-dlg"><p class="tb-kick">Characters</p><h3>Who can do what</h3><div class="cp-ref">${CP_ORD.map(c => `<div>${cpCardHTML(c, 'mid')}<p><b>${CP_N[c]}</b>${CP_DESC[c]}</p></div>`).join('')}</div><p>Income +1. Foreign Aid +2 (Duke blocks). Coup: pay 7, forced at 10.</p><button class="tb-big c" data-do="ref">Got it</button></div></div>`;
      }
      ui.innerHTML = `<div class="cp-bar${bar()}${v.phase === 'lose' || v.phase === 'chal' ? '' : ''}">${esc(status())}</div>
<div class="cp-opps n${order.length}">${opps}</div>
<div class="cp-mid"><div class="cp-side">${deck}${bank}</div><div class="cp-stage">${stage()}</div><div class="cp-logc"><div class="cp-log">${lg}</div>${rv}</div></div>
<div class="cp-me"><div class="cp-hand">${mySl}</div><div class="cp-mi"><div class="cp-mn">${avatar(info.names[m], m)}<b>${esc(info.names[m])}</b></div><div class="cp-cn"><span data-k="mc">${cpCoin}</span>${v.coins[m]}</div>${must ? '<div class="cp-must">Coup is forced</div>' : ''}</div><div class="cp-acts">${acts}</div></div>${ovl}`;
      h.rd();
    }

    function send(a) {
      mode = null; keep = [];
      const ok = h.send(a);
      if (!ok) { h.snd('bad'); render(); }
      return ok;
    }
    function pickAction(k) {
      if (!canAct(k)) { h.snd('bad'); return; }
      if (!CP_TG[k]) { send({ t: 'act', k }); return; }
      const t = targets();
      if (t.length === 1) { send({ t: 'act', k, target: t[0] }); return; }
      mode = { k }; h.snd('tap'); render();
    }
    function pickTarget(q) {
      if (!mode) return;
      send({ t: 'act', k: mode.k, target: q });
    }
    function toggleKeep(i) {
      const k = V.hand.length;
      if (keep.includes(i)) keep = keep.filter(x => x !== i);
      else { keep = keep.concat(i); if (keep.length > k) keep.shift(); }
      cur = i; h.snd('tap'); render();
    }
    const chalOk = () => waiting() && (V.phase === 'chal' || V.phase === 'bchal');

    api.on(root, 'click', e => {
      if (!V || !info) return;
      const t = e.target;
      let b;
      if ((b = t.closest('[data-do]'))) {
        const a = b.dataset.do;
        if (a === 'ref') { ref = !ref; h.snd('tap'); render(); }
        else if (a === 'cancel') { mode = null; h.snd('tap'); render(); }
        else if (a === 'chal' && chalOk()) send({ t: 'challenge' });
        else if (a === 'pass' && waiting()) send({ t: 'pass' });
        else if (a === 'block' && waiting()) send({ t: 'block', c: b.dataset.c });
        else if (a === 'keep' && myXchg() && keep.length === V.hand.length) send({ t: 'keep', idx: keep.slice() });
        return;
      }
      if ((b = t.closest('[data-lose]')) && myLose()) { send({ t: 'lose', i: +b.dataset.lose }); return; }
      if ((b = t.closest('[data-pk]')) && myXchg()) { toggleKeep(+b.dataset.pk); return; }
      if ((b = t.closest('[data-act]'))) { pickAction(b.dataset.act); return; }
      if ((b = t.closest('[data-tgt]'))) { pickTarget(+b.dataset.tgt); return; }
      if (mode) { mode = null; render(); }
    });

    function key(e) {
      if (!V || !info || V.over) return;
      const k = e.key.toLowerCase();
      if (ref) { ref = false; render(); e.preventDefault(); return; }
      if (myLose() && performance.now() >= late) {
        const n = V.hand.length;
        if (k === 'arrowleft') cur = (cur + n - 1) % n;
        else if (k === 'arrowright') cur = (cur + 1) % n;
        else if (k === 'enter' || k === ' ') { send({ t: 'lose', i: Math.min(cur, n - 1) }); e.preventDefault(); return; }
        else if (/^[1-2]$/.test(k) && +k <= n) { send({ t: 'lose', i: +k - 1 }); e.preventDefault(); return; }
        else return;
        h.snd('tap'); render(); e.preventDefault(); return;
      }
      if (myXchg() && performance.now() >= late) {
        const n = V.hand.length + V.xc.length;
        if (k === 'arrowleft') cur = (cur + n - 1) % n;
        else if (k === 'arrowright') cur = (cur + 1) % n;
        else if (k === ' ') { toggleKeep(Math.min(cur, n - 1)); e.preventDefault(); return; }
        else if (k === 'enter') { if (keep.length === V.hand.length) send({ t: 'keep', idx: keep.slice() }); e.preventDefault(); return; }
        else if (/^[1-4]$/.test(k) && +k <= n) { toggleKeep(+k - 1); e.preventDefault(); return; }
        else return;
        h.snd('tap'); render(); e.preventDefault(); return;
      }
      if (waiting()) {
        if (k === 'c' && chalOk()) send({ t: 'challenge' });
        else if (k === ' ' || k === 'enter' || k === 'p') send({ t: 'pass' });
        else if (V.phase === 'block' && (k === 'b' || /^[1-2]$/.test(k))) { const bl = blocks(), c = bl[k === 'b' ? 0 : +k - 1]; if (c) send({ t: 'block', c }); else return; }
        else return;
        e.preventDefault(); return;
      }
      if (mode) {
        if (/^[1-5]$/.test(k)) { const t = targets()[+k - 1]; if (t !== undefined) pickTarget(t); e.preventDefault(); }
        else if (k === 'backspace' || k === 'x') { mode = null; render(); e.preventDefault(); }
        return;
      }
      if (myTurn()) {
        const a = CP_KEYS.find(x => CP_AI[x].k === k);
        if (a) { pickAction(a); e.preventDefault(); }
      }
    }

    const place = (el, r) => {
      const ib = root.getBoundingClientRect(), k = ib.width / root.offsetWidth || 1;
      el.style.cssText += `;left:${(r.left - ib.left) / k}px;top:${(r.top - ib.top) / k}px;width:${r.width / k}px;height:${r.height / k}px`;
    };
    const later = (ms, fn) => { api.timeout(() => { if (api.alive && V) fn(); }, Math.max(0, ms)); };
    const say = (html, cl, ms, sub) => {
      const b = mk('div', 'cp-ban', html + (sub ? `<small>${sub}</small>` : ''));
      if (cl) b.style.cssText = `--c1:${CP_CL[cl][0]};--c2:${CP_CL[cl][1]}`;
      fx.append(b); setTimeout(() => b.remove(), ms || 1100);
    };
    const cap = (html, ms) => { const c = mk('div', 'cp-cap', html); fx.append(c); setTimeout(() => c.remove(), ms || 1300); };
    const stamp = (key, text) => {
      const r = h.rect(key); if (!r) return;
      const s = mk('div', 'cp-stamp', text), ib = root.getBoundingClientRect(), k = ib.width / root.offsetWidth || 1;
      s.style.left = (r.left + r.width / 2 - ib.left) / k + 'px'; s.style.top = (r.top + r.height / 2 - ib.top) / k + 'px';
      fx.append(s); setTimeout(() => s.remove(), 900);
    };
    const bigCard = (c, cls) => {
      const el = mk('div', 'cp-big ' + (cls || ''), cpCardHTML(c));
      fx.append(el); place(el, h.rect(anchor) || { left: 0, top: 0, width: 100, height: 140 });
      return el;
    };
    const dim = on => fx.classList.toggle('dim', on);
    const slotKey = (q, i) => q === me() ? 'ms' + i : 'os' + q + '_' + i;
    const coinKey = q => q < 0 ? 'bank' : q === me() ? 'mc' : 'oc' + q;
    const tile = q => q === me() ? 'ms0' : 'p' + q;

    function flights(es, old, snaps, first) {
      const m = me();
      let t = 0;
      for (const e of es) {
        if (e.k === 'deal') {
          let d = 0;
          for (let r = 0; r < 2; r++) for (let q = 0; q < V.n; q++) {
            h.fly({ from: 'deck', to: slotKey(q, r), html: cpCardHTML(null), hold: slotKey(q, r), delay: d, dur: 380 });
            setTimeout(() => h.snd('deal'), d);
            d += 80;
          }
          for (let q = 0; q < V.n; q++) { for (let j = 0; j < 2; j++) h.fly({ from: 'bank', to: coinKey(q), html: cpCoin, hold: coinKey(q), delay: d + j * 60, dur: 420, cls: 'cp-fly' }); d += 50; }
          t = Math.max(t, d + 400);
        } else if (e.k === 'coin') {
          const n = Math.min(6, e.n);
          for (let i = 0; i < n; i++) h.fly({ from: coinKey(e.from), to: coinKey(e.to), html: cpCoin, hold: e.to >= 0 ? coinKey(e.to) : null, delay: t + i * 80, dur: 460, cls: 'cp-fly', r0: R(60) - 30, done: () => h.snd('coin') });
          t += 460 + n * 80;
        } else if (e.k === 'act') {
          if (e.kind === 'coup') later(t, () => { say('COUP!', null, 1100, `${esc(nm(e.p))} vs ${esc(nm(e.target))}`); h.snd('drum'); }), t += 600;
          else if (e.claim) { later(t, () => { say(CP_N[e.claim], e.claim, 1000, `${esc(nm(e.p))} claims`); h.snd('reveal'); }); t += 750; }
          else if (e.kind === 'aid') { later(t, () => say('Foreign Aid', null, 800)); t += 450; }
        } else if (e.k === 'challenge') {
          later(t, () => { say('Challenge!', null, 1100, `${esc(nm(e.p))} calls ${esc(nm(e.on))} out`); h.snd('drum'); const el = h.q('p' + e.on) || h.q('ms0'); if (el) h.shake(el, 4, 380); });
          t += 950;
        } else if (e.k === 'reveal') {
          const tt = t, i = e.i;
          const from = e.p === m && old && snaps['ms' + i] ? snaps['ms' + i] : slotKey(e.p, i);
          later(tt, () => {
            dim(true); h.snd('flip');
            h.fly({ from, to: anchor, html: cpCardHTML(e.c), dur: 480, s0: .4, r0: -8, ease: 'cubic-bezier(.2,1.2,.4,1)', done: () => {
              if (!V) return;
              big = bigCard(e.c, 'flip'); h.snd('good');
              cap(`${esc(nm(e.p))} ${e.p === m ? 'show' : 'shows'} the ${CP_N[e.c]}!`, 1500);
            } });
          });
          later(tt + 1900, () => { if (big) { big.classList.add('out'); const b = big; setTimeout(() => b.remove(), 500); big = null; } dim(false); });
          t += 2300;
        } else if (e.k === 'swap') {
          const key = slotKey(e.p, e.i);
          h.fly({ from: 'deck', to: key, html: cpCardHTML(null), hold: key, delay: t, dur: 420, done: () => { h.snd('flip'); const el = h.q(key); if (el && el.animate && !reduced()) el.animate([{ transform: 'rotateY(90deg)' }, { transform: 'none' }], { duration: 240 }); } });
          t += 520;
        } else if (e.k === 'caught') {
          later(t, () => { stamp(tile(e.p), 'BLUFF!'); h.snd('bad'); cap(`${esc(nm(e.p))} ${e.p === m ? 'have' : 'has'} no ${CP_N[e.c]}`, 1300); h.shake(h.q('p' + e.p), 6, 420); });
          t += 1100;
        } else if (e.k === 'lose') {
          const tt = t, p = e.p;
          let i = 0;
          if (p === m && old) { const j = old.hand.indexOf(e.c); i = j >= 0 ? j : 0; }
          else i = Math.max(0, (old ? old.hn[p] : 1) - 1);
          const from = p === m && snaps['ms' + i] ? snaps['ms' + i] : slotKey(p, Math.min(i, 1));
          const dest = V.rev[p].length - 1;
          const key = slotKey(p, Math.max(0, Math.min(1, V.hn[p] + dest)));
          later(tt, () => {
            dim(true); h.snd('flip');
            h.fly({ from, to: anchor, html: cpCardHTML(e.c), hold: key, dur: 420, s0: .4, ease: 'cubic-bezier(.2,1.2,.4,1)', done: () => {
              if (!V) return;
              const el = bigCard(e.c, 'shatter'); h.snd('bad'); h.shake(root, 5, 300);
              cap(`${esc(nm(p))} ${p === m ? 'lose' : 'loses'} the ${CP_N[e.c]}`, 1200);
              setTimeout(() => { el.remove(); dim(false); }, 1000);
            } });
          });
          if (e.dead) { later(tt + 1300, () => { stamp(tile(p), 'OUT!'); h.snd('lose'); }); t += 700; }
          t += 1500;
        } else if (e.k === 'block') {
          later(t, () => { say(CP_N[e.c], e.c, 1000, `${esc(nm(e.p))} blocks`); h.snd('reveal'); }); t += 800;
        } else if (e.k === 'blocked') {
          later(t, () => { stamp(tile(e.p), 'BLOCKED'); h.snd('buzz'); }); t += 800;
        } else if (e.k === 'unblock') {
          later(t, () => cap('The block fails!', 1100)); t += 500;
        } else if (e.k === 'cancel') {
          later(t, () => { say('Action failed', null, 900); }); t += 450;
        } else if (e.k === 'resolve' && (e.kind === 'coup' || e.kind === 'assassinate')) {
          const tt = t;
          later(tt, () => {
            const to = tile(e.target);
            const r = h.rect(to), fr = h.rect(tile(e.p));
            if (e.kind === 'assassinate' && r && fr) {
              h.snd('stab');
              h.fly({ from: fr, to: r, html: `<svg viewBox="0 0 20 60" style="width:100%;height:100%"><path d="M10 2L15 40L10 44L5 40Z" fill="#e8eef5" stroke="#24152e" stroke-width="2" stroke-linejoin="round"/><rect x="3" y="43" width="14" height="5" rx="2" fill="#ffd23f" stroke="#24152e" stroke-width="2"/><rect x="8" y="48" width="4" height="10" rx="2" fill="#8a1f33" stroke="#24152e" stroke-width="1.6"/></svg>`, cls: 'cp-dag', dur: 380, s0: .6, r0: 40, r1: 180, ease: 'ease-in' });
            } else h.snd('boom');
            setTimeout(() => {
              const fl = mk('div', 'cp-flash'); fx.append(fl); setTimeout(() => fl.remove(), 700);
              h.burst(to, e.kind === 'coup' ? 44 : 26, ['#ff5252', '#ffd23f', '#fff', '#ff9a3c'], { speed: e.kind === 'coup' ? 170 : 120, size: 10, dur: 800 });
              h.shake(h.q(to), 7, 420);
            }, e.kind === 'assassinate' ? 380 : 0);
          });
          t += 900;
        } else if (e.k === 'xchg') {
          for (let j = 0; j < 2; j++) h.fly({ from: 'deck', to: tile(e.p), html: cpCardHTML(null), delay: t + j * 140, dur: 420 });
          later(t, () => h.snd('whoosh')); t += 760;
        } else if (e.k === 'xdone') {
          for (let j = 0; j < 2; j++) h.fly({ from: tile(e.p), to: 'deck', html: cpCardHTML(null), delay: t + j * 140, dur: 420 });
          later(t, () => h.snd('shuffle')); t += 700;
        } else if (e.k === 'turn') {
          if (e.p === m && !first) setTimeout(() => h.snd('tick'), t);
        } else if (e.k === 'win') {
          later(t + 250, () => { const el = h.q(tile(e.p)); h.burst(el, 56, ['#ffd23f', '#d9363e', '#8c4ee0', '#3b8cf0', '#fff'], { speed: 210, size: 11, dur: 1300 }); });
        }
      }
      return t;
    }

    const logLine = e => {
      const m = me();
      if (e.k === 'act') {
        const T = e.target >= 0 ? nmb(e.target) : '';
        return {
          income: `${vb(e.p, 'take', 'takes')} Income.`, aid: `${vb(e.p, 'take', 'takes')} Foreign Aid.`,
          coup: `${vb(e.p, 'pay', 'pays')} 7 for a Coup on ${T}.`,
          tax: `${vb(e.p, 'claim', 'claims')} Duke: Tax.`, assassinate: `${vb(e.p, 'claim', 'claims')} Assassin against ${T}.`,
          steal: `${vb(e.p, 'claim', 'claims')} Captain: steal from ${T}.`, exchange: `${vb(e.p, 'claim', 'claims')} Ambassador: Exchange.`
        }[e.kind];
      }
      if (e.k === 'challenge') return `${vb(e.p, 'challenge', 'challenges')} ${nmb(e.on)}!`;
      if (e.k === 'reveal') return `${nmb(e.p)} ${e.p === m ? 'show' : 'shows'} the ${CP_N[e.c]}.`;
      if (e.k === 'caught') return `${nmb(e.p)} ${e.p === m ? 'have' : 'has'} no ${CP_N[e.c]}: bluff caught.`;
      if (e.k === 'lose') return `${nmb(e.p)} ${e.p === m ? 'lose' : 'loses'} the ${CP_N[e.c]}${e.dead ? ' and ' + (e.p === m ? 'are' : 'is') + ' out' : ''}.`;
      if (e.k === 'block') return `${vb(e.p, 'block', 'blocks')} as ${CP_N[e.c]}.`;
      if (e.k === 'blocked') return 'The block stands.';
      if (e.k === 'unblock') return 'The block fails.';
      if (e.k === 'cancel') return 'The action fails.';
      if (e.k === 'coin' && e.to >= 0 && e.from >= 0) return `${vb(e.to, 'steal', 'steals')} ${e.n} from ${nmb(e.from)}.`;
      return null;
    };

    return {
      start(inf) { info = inf; V = null; mode = null; keep = []; ref = false; log = []; late = 0; cur = 0; big = null; ui.innerHTML = ''; fx.querySelectorAll('.cp-ban,.cp-big,.cp-stamp,.cp-flash,.cp-cap').forEach(e => e.remove()); dim(false); },
      clear() { ui.innerHTML = ''; V = null; dim(false); },
      layout() { render(); },
      refresh() { render(); },
      key,
      update(v, es, first) {
        const old = V, snaps = {};
        if (old) {
          for (let i = 0; i < 2; i++) snaps['ms' + i] = h.rect('ms' + i);
          snaps.deck = h.rect('deck');
        }
        recv = performance.now();
        V = v;
        es.forEach(e => { const l = logLine(e); if (l) { log.push(l); if (log.length > 30) log.shift(); } });
        if (!old || old.phase !== v.phase || old.turn !== v.turn) { mode = null; cur = 0; keep = []; }
        late = 0;
        render();
        const end = first ? 0 : flights(es, old, snaps, first);
        if (end > 0) h.busy(end);
        if ((myLose() || myXchg()) && end > 0) { late = performance.now() + end; render(); later(end + 30, () => { late = 0; render(); }); }
        if (first && es.some(e => e.k === 'deal')) { const end2 = flights(es.filter(e => e.k === 'deal'), null, {}, false); h.busy(end2); }
      }
    };
  };

  const CP_LOGO = `<div class="cp-logo"><svg viewBox="0 0 120 80"><path d="M20 62L12 22L38 40L60 10L82 40L108 22L100 62Z" fill="#ffd23f" stroke="#24152e" stroke-width="4" stroke-linejoin="round"/><path d="M20 62Q60 72 100 62L100 72Q60 82 20 72Z" fill="#f2a516" stroke="#24152e" stroke-width="4" stroke-linejoin="round"/><circle cx="12" cy="20" r="6" fill="#e5484d" stroke="#24152e" stroke-width="3.4"/><circle cx="60" cy="9" r="6.4" fill="#3e8ef7" stroke="#24152e" stroke-width="3.4"/><circle cx="108" cy="20" r="6" fill="#2fb36d" stroke="#24152e" stroke-width="3.4"/><circle cx="60" cy="58" r="6" fill="#e5484d" stroke="#24152e" stroke-width="3"/></svg><b>COUP</b></div>`;

  const CP_RULES = `<p>Bluff, bribe and eliminate. Each player secretly holds <b>two influence cards</b>. Lose both and you are out. The last player standing wins.</p>
<h4>Your turn</h4>
<p>Take <b>one action</b>. You can claim any character, even if you do not hold it. Everyone else may <b>challenge</b> your claim.</p>
<p><b>Income</b>: +1 coin. <b>Foreign Aid</b>: +2 coins (a Duke can block it). <b>Coup</b>: pay 7 coins, a player of your choice loses an influence. It cannot be stopped. With 10 or more coins you <b>must</b> Coup.</p>
<h4>Characters</h4>
<p><b>Duke</b>: Tax, take 3 coins. Blocks Foreign Aid.</p>
<p><b>Assassin</b>: pay 3 coins, a player loses an influence. The Contessa blocks it.</p>
<p><b>Captain</b>: steal 2 coins from a player. The Captain or the Ambassador blocks it.</p>
<p><b>Ambassador</b>: draw two cards from the court deck, keep any, return the rest. Blocks stealing.</p>
<p><b>Contessa</b>: blocks assassination.</p>
<h4>Challenges</h4>
<p>Anyone can challenge a claim before it happens. The challenged player shows the card. If they have it, the challenger loses an influence and the player takes a fresh card from the deck. If they do not, they lose an influence and the action fails (the Assassin's 3 coins come back).</p>
<h4>Blocks</h4>
<p>After a claim is not challenged, the target can <b>block</b> by claiming the right character. Blocks can be challenged by anyone too. If a block stands, the action fails (the 3 coins for an assassination are lost).</p>
<h4>Losing influence</h4>
<p>You choose which card to reveal. Revealed cards stay face up. If you lose a challenge on an assassination, you can lose both cards at once.</p>
<h4>Controls</h4>
<p>Tap an action, then tap the target. Tap <b>Challenge</b>, <b>Block</b> or <b>Allow</b> when asked. The <b>?</b> button shows the characters. Keys: <b>I F C T A S E</b> pick an action, <b>1-5</b> a target or card, <b>C</b> challenge, <b>B</b> block, <b>Space</b> allow, <b>Left</b>/<b>Right</b> and <b>Enter</b> in the card pickers.</p>`;

  const CPX = {
    id: 'coup', title: 'Coup', min: 2, max: 6, defBots: 3, defOnline: 4,
    logo: CP_LOGO, tag: 'Lie, steal and topple the court.',
    rules: CP_RULES,
    create: (n, cfg) => Coup(n, cfg),
    botDelay: (e, s, d) => e.phase === 'act' ? (d === 'Easy' ? 1500 : 1100) + R(800) : e.phase === 'lose' || e.phase === 'xchg' ? 900 + R(700) : 700 + R(1300),
    ui: cpUI,
    overText: (v, info, me) => me ? 'The court is yours.' : '',
    stats: (v, info) => {
      const order = [v.over.win].concat(v.out.slice().reverse());
      return `<table class="tb-tbl">${order.map((q, i) => `<tr class="${i ? '' : 'win'}"><td>${i + 1}. ${esc(info.names[q])}</td><td>${i ? 'Out' : 'Survived with ' + v.coins[q] + ' coins'}</td></tr>`).join('')}</table>`;
    }
  };

  Ameplay.register({
    id: 'coup',
    title: 'Coup',
    category: 'Board',
    tint: '#7b3fc4',
    blurb: 'Bluff, challenge and block your way to the last surviving influence.',
    help: 'Tap an action, then a target · <kbd>I</kbd><kbd>F</kbd><kbd>C</kbd><kbd>T</kbd><kbd>A</kbd><kbd>S</kbd><kbd>E</kbd> actions · <kbd>C</kbd> challenge · <kbd>B</kbd> block · <kbd>Space</kbd> allow',
    better: 'high',
    width: 960,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 44L8 18l14 11 10-17 10 17 14-11-4 26z"/><path d="M12 44q20 6 40 0v8q-20 6-40 0z"/><circle cx="32" cy="36" r="2"/></svg>',
    _t: { Coup, cpBot, cpCardHTML },
    css: BASE('coup') + CP_CSS,
    mount: table(CPX)
  });

})();
