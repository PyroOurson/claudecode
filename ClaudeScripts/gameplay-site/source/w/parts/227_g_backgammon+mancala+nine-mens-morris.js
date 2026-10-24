(() => {
  'use strict';
  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const now = () => performance.now();
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const easeOut = t => 1 - (1 - t) ** 3;
  const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  const winsFmt = v => v + (v === 1 ? ' win' : ' wins');
  const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  const pick = a => a[Math.random() * a.length | 0];
  const clone = o => JSON.parse(JSON.stringify(o));

  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function shadowEll(x, cx, cy, rx, ry, a) {
    x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore();
  }
  function grain(x, X, Y, W, H, base, lines, rand, vert) {
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    const L = vert ? H : W, Tk = vert ? W : H, n = Math.round(Tk / 1.5);
    for (let i = 0; i < n; i++) {
      const off = rand() * Tk, amp = .5 + rand() * 2.6, fq = .01 + rand() * .03, ph = rand() * 7;
      x.strokeStyle = lines[rand() * lines.length | 0];
      x.globalAlpha = .05 + rand() * .17; x.lineWidth = .35 + rand() * 1.4;
      x.beginPath();
      for (let a = -6; a <= L + 6; a += 5) {
        const q = off + Math.sin(a * fq + ph) * amp + Math.sin(a * fq * 3.1 + ph * 2) * amp * .35;
        if (vert) { if (a === -6) x.moveTo(X + q, Y + a); else x.lineTo(X + q, Y + a); }
        else if (a === -6) x.moveTo(X + a, Y + q); else x.lineTo(X + a, Y + q);
      }
      x.stroke();
    }
    x.restore();
  }
  function knots(x, X, Y, W, H, rand, n, dark) {
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    for (let i = 0; i < n; i++) {
      const cx = X + rand() * W, cy = Y + rand() * H, r = 4 + rand() * 9;
      for (let k = 4; k >= 1; k--) {
        x.strokeStyle = dark; x.globalAlpha = .06 + rand() * .07; x.lineWidth = 1;
        x.beginPath(); x.ellipse(cx, cy, r * k * .55 + rand(), r * k * .3, rand() * .3, 0, 7); x.stroke();
      }
    }
    x.restore();
  }

  const Snd = api => {
    let ac = null, nb = null;
    const ctx = () => {
      if (api.muted) return null;
      try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; }
    };
    const tone = (f, d, type, vol, f2, at) => {
      const c = ctx(); if (!c) return;
      const t = c.currentTime + (at || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol || .05, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .03);
    };
    const noise = (d, f, q, vol, at) => {
      const c = ctx(); if (!c) return;
      if (!nb) { nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
      const t = c.currentTime + (at || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      s.buffer = nb; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(fl).connect(g).connect(c.destination); s.start(t, Math.random() * .5); s.stop(t + d + .02);
    };
    return {
      clack(v) { const k = v || 1; noise(.05, 1500 + Math.random() * 500, 2.5, .22 * k); tone(190 + Math.random() * 40, .07, 'triangle', .07 * k, 95); },
      slide() { noise(.12, 900, 1.2, .06); },
      shake() { for (let i = 0; i < 12; i++) noise(.045, 2600 + Math.random() * 1800, 3, .07, i * .05 + Math.random() * .02); },
      die() { for (let i = 0; i < 3; i++) { noise(.05, 1700 + Math.random() * 900, 2.5, .17 / (i + 1), i * (.07 + i * .03)); tone(210 + Math.random() * 60, .06, 'triangle', .05 / (i + 1), 110, i * (.07 + i * .03)); } },
      seed() { const f = 1250 + Math.random() * 500; tone(f, .07, 'sine', .035, f * .8); noise(.025, 4200, 4, .05); },
      store() { tone(520, .1, 'sine', .05, 340); noise(.05, 1800, 2, .09); },
      pop() { tone(880, .06, 'sine', .04, 440); },
      mill() { tone(392, .16, 'sine', .06); tone(494, .16, 'sine', .06, 0, .09); tone(587, .26, 'sine', .07, 0, .18); noise(.1, 2500, 2, .06, .18); },
      take() { tone(300, .1, 'triangle', .06, 140); noise(.08, 1100, 1.6, .1); },
      cube() { tone(440, .08, 'square', .02); tone(660, .12, 'square', .02, 0, .08); },
      bad() { tone(200, .16, 'triangle', .06, 120); },
      again() { tone(660, .1, 'sine', .05); tone(990, .18, 'sine', .05, 0, .09); }
    };
  };

  const PAL = (p, th) => `
${p}{--tb-bg:${th.bg};--tb-card:${th.card};--tb-ink:${th.ink};--tb-mute:${th.mute};--tb-acc:${th.acc};--tb-accd:${th.accd};--tb-on:${th.on};--tb-line:${th.line}}`;

  const kitCss = p => `
${p}{display:flex;flex-direction:column;align-items:stretch;gap:10px;width:100%;box-sizing:border-box;padding:12px;border-radius:16px;background:var(--tb-bg);color:var(--tb-ink);font-family:var(--sans);min-height:0}
${p} .tb-cv{position:relative;display:flex;justify-content:center;align-items:center;width:100%}
${p} .tb-cv canvas{flex:none;border-radius:10px;background:transparent;cursor:pointer;box-shadow:0 18px 36px -22px rgba(0,0,0,.85),0 3px 8px -3px rgba(0,0,0,.5);touch-action:none}
${p} .tb-cv canvas[hidden]{display:none}
${p} .tb-dock{display:flex;flex-direction:column;gap:8px;width:100%}
${p} .tb-opts{display:flex;gap:6px 10px;flex-wrap:wrap;justify-content:center}
${p} .tb-seg{display:flex;padding:3px;border-radius:999px;background:var(--tb-card)}
${p} .tb-seg[hidden],${p} .tb-pc[hidden],${p} .tb-btns .g-btn[hidden],${p} .tb-log[hidden]{display:none}
${p} .tb-seg button{min-width:0;border:0;background:none;padding:7px 12px;border-radius:999px;font:800 12.5px/1 var(--sans);color:var(--tb-mute);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s}
${p} .tb-seg button:hover{color:var(--tb-ink)}
${p} .tb-seg button.on{background:var(--tb-acc);color:var(--tb-on)}
${p} .tb-sc{display:grid;grid-template-columns:minmax(0,1fr) minmax(120px,1.15fr) minmax(0,1fr);gap:8px;align-items:stretch}
${p} .tb-pc{display:flex;align-items:center;gap:9px;min-width:0;padding:7px 10px;border-radius:12px;background:var(--tb-card);border:2px solid transparent;transition:border-color .25s,box-shadow .25s}
${p} .tb-pc.on{border-color:var(--tb-acc);box-shadow:0 0 0 3px rgba(255,255,255,.04)}
${p} .tb-chip{flex:none;width:26px;height:26px;border-radius:50%;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25),0 2px 5px rgba(0,0,0,.4)}
${p} .tb-pc div{min-width:0;flex:1}
${p} .tb-pc b{display:block;font-weight:900;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .tb-pc small{display:block;min-height:16px;font-size:12px;font-weight:800;color:var(--tb-mute);line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .tb-pc small em{font-style:normal;color:var(--tb-acc)}
${p} .tb-dots{display:none;gap:3px}
${p} .tb-pc.think .tb-dots{display:flex}
${p} .tb-dots i{width:6px;height:6px;border-radius:50%;background:var(--tb-acc);animation:${p.slice(1)}-dot 1s infinite ease-in-out}
${p} .tb-dots i:nth-child(2){animation-delay:.15s}
${p} .tb-dots i:nth-child(3){animation-delay:.3s}
@keyframes ${p.slice(1)}-dot{0%,80%,100%{transform:scale(.5);opacity:.35}40%{transform:none;opacity:1}}
${p} .tb-st{display:flex;align-items:center;justify-content:center;text-align:center;min-height:34px;padding:4px 8px;font-weight:900;font-size:13.5px;line-height:1.3;color:var(--tb-ink)}
${p} .tb-st.turn{border-radius:12px;background:var(--tb-acc);color:var(--tb-on)}
${p} .tb-st.win{color:#7be0a3}
${p} .tb-st.loss{color:#ff8f7d}
${p} .tb-st.warn{color:#ffc35c}
${p} .tb-log{max-height:58px;overflow:auto;padding:6px 10px;border-radius:12px;background:var(--tb-card);font:700 12px/1.6 var(--mono);color:var(--tb-mute);scrollbar-width:thin}
${p} .tb-log p{margin:0;display:flex;gap:8px;white-space:nowrap}
${p} .tb-log em{font-style:normal;color:var(--tb-acc);min-width:62px}
${p} .tb-log .cur{color:var(--tb-ink)}
${p} .tb-btns{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
${p} .tb-btns .g-btn{flex:0 1 auto;min-width:92px;height:38px;padding:0 16px;background:var(--tb-acc);border-color:var(--tb-acc);color:var(--tb-on);box-shadow:0 3px 0 var(--tb-accd)}
${p} .tb-btns .g-btn:hover{background:var(--tb-acc);border-color:var(--tb-acc);filter:brightness(1.08)}
${p} .tb-btns .g-btn.ghost{background:var(--tb-card);border-color:var(--tb-card);color:var(--tb-ink);box-shadow:0 3px 0 rgba(0,0,0,.28)}
${p} .tb-btns .g-btn.hot{animation:${p.slice(1)}-hot 1.2s infinite}
@keyframes ${p.slice(1)}-hot{50%{box-shadow:0 3px 0 var(--tb-accd),0 0 0 4px rgba(255,255,255,.22)}}
${p} .tb-cn{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:800;color:var(--tb-mute)}
${p} .tb-cn[hidden]{display:none}
${p} .tb-cn i{width:8px;height:8px;border-radius:50%;background:#e0584a}
${p} .tb-cn.on i{background:#3fcf8e;box-shadow:0 0 0 3px rgba(63,207,142,.2)}
@media (max-width:620px){
  ${p}{padding:8px;gap:8px}
  ${p} .tb-opts{order:9}
  ${p} .tb-sc{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  ${p} .tb-st{grid-column:1/-1;grid-row:2;min-height:30px}
  ${p} .tb-btns .g-btn{flex:1 1 40%;min-width:0;padding:0 8px}
}
@media (pointer:coarse){${p} .tb-seg button{min-height:38px}${p} .tb-btns .g-btn{height:42px}}`;

  function mkDock(spec, onSeg, onBtn) {
    const root = el('div', 'tb-dock'), segs = spec.segs || [];
    let h = '';
    if (segs.length) h += '<div class="tb-opts">' + segs.map(s => `<div class="tb-seg" data-k="${s.k}" role="radiogroup" aria-label="${esc(s.lab || s.k)}">${s.vals.map(([v, l]) => `<button type="button" role="radio" aria-checked="false" data-v="${v}">${l}</button>`).join('')}</div>`).join('') + '</div>';
    const pc = i => `<div class="tb-pc" data-i="${i}"><i class="tb-chip"></i><div><b></b><small></small></div><span class="tb-dots"><i></i><i></i><i></i></span></div>`;
    h += `<div class="tb-sc">${pc(0)}<div class="tb-st" role="status" aria-live="polite"></div>${pc(1)}</div>`;
    if (spec.log) h += '<div class="tb-log" hidden></div>';
    h += '<div class="tb-cn" hidden><i></i><span></span></div>';
    h += '<div class="tb-btns">' + Array.from({ length: spec.btns || 4 }, () => '<button type="button" class="g-btn sm" hidden></button>').join('') + '</div>';
    root.innerHTML = h;
    root.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.b) return onBtn(b.dataset.b);
      const sg = b.closest('.tb-seg');
      if (sg && b.dataset.v !== undefined) onSeg(sg.dataset.k, b.dataset.v);
    });
    const q = s => root.querySelector(s), cards = [...root.querySelectorAll('.tb-pc')], bt = [...root.querySelectorAll('.tb-btns .g-btn')], stEl = q('.tb-st'), logEl = q('.tb-log'), cn = q('.tb-cn');
    return {
      el: root,
      seg(k, v) { const sg = root.querySelector(`.tb-seg[data-k="${k}"]`); if (sg) sg.querySelectorAll('button').forEach(b => { const on = b.dataset.v === String(v); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }); },
      segHide(k, hide) { const sg = root.querySelector(`.tb-seg[data-k="${k}"]`); if (sg) sg.hidden = !!hide; },
      segVals(k, vals) { const sg = root.querySelector(`.tb-seg[data-k="${k}"]`); if (sg) sg.innerHTML = vals.map(([v, l]) => `<button type="button" role="radio" aria-checked="false" data-v="${v}">${l}</button>`).join(''); },
      card(i, o) {
        const c = cards[i];
        if (o.hide !== undefined) c.hidden = !!o.hide;
        if (o.name !== undefined) c.querySelector('b').textContent = o.name;
        if (o.sub !== undefined) c.querySelector('small').innerHTML = o.sub;
        if (o.on !== undefined) c.classList.toggle('on', !!o.on);
        if (o.think !== undefined) c.classList.toggle('think', !!o.think);
        if (o.chip !== undefined) c.querySelector('.tb-chip').style.background = o.chip;
      },
      st(t, cls) { stEl.textContent = t; stEl.className = 'tb-st' + (cls ? ' ' + cls : ''); },
      btn(i, label, id, o) {
        const b = bt[i]; if (!b) return;
        o = o || {};
        b.hidden = !label; if (!label) return;
        if (b.textContent !== label) b.textContent = label;
        b.dataset.b = id; b.disabled = !!o.dis;
        b.classList.toggle('ghost', !!o.ghost);
        b.classList.toggle('hot', !!o.hot);
      },
      btns(list) { for (let i = 0; i < bt.length; i++) { const x = list[i]; if (x) this.btn(i, x[0], x[1], x[2]); else this.btn(i, ''); } },
      log(html) { if (!logEl) return; logEl.hidden = !html; if (html) { logEl.innerHTML = html; logEl.scrollTop = logEl.scrollHeight; } },
      conn(on, text) { cn.hidden = on === null; if (on === null) return; cn.classList.toggle('on', !!on); cn.lastChild.textContent = text; }
    };
  }

  function mkView(api, root, box, W, H, wantPortrait) {
    const land = api.canvas(W, H, box), port = wantPortrait ? api.canvas(H, W, box) : null;
    const dock = 150;
    const fit = (c, w, h) => { c.canvas.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px) - ${dock}px) * ${(w / h).toFixed(4)}))`; c.canvas.style.minWidth = '0'; };
    fit(land, W, H); if (port) { fit(port, H, W); port.canvas.hidden = true; }
    const v = {
      rot: false, W, H, cur: land, dirty: true, w0: 0,
      get ctx() { return v.cur.ctx; },
      get canvas() { return v.cur.canvas; },
      canvases: port ? [land.canvas, port.canvas] : [land.canvas],
      check() {
        if (!port) return false;
        const w = root.clientWidth;
        if (w === v.w0) return false;
        v.w0 = w;
        const rot = w > 0 && w < 600;
        if (rot === v.rot) return false;
        v.rot = rot; v.cur = rot ? port : land;
        land.canvas.hidden = rot; port.canvas.hidden = !rot; v.dirty = true;
        return true;
      },
      begin() {
        const c = v.ctx; c.save(); c.clearRect(0, 0, v.rot ? H : W, v.rot ? W : H);
        if (v.rot) { c.translate(H, 0); c.rotate(Math.PI / 2); }
        return c;
      },
      end() { v.ctx.restore(); },
      local(e) {
        const p = v.cur.toLocal(e);
        return v.rot ? { x: p.y, y: H - p.x } : p;
      }
    };
    return v;
  }

  function table(api, root, G, cfg) {
    const saved = api.load() || {}, opt = {};
    for (const s of cfg.segs) { const m = s.vals.find(([v]) => String(v) === String(saved[s.k])); opt[s.k] = m ? m[0] : s.def; }
    const T = { api, root, G, cfg, opt, snd: Snd(api), mode: 'cpu', role: 'local', me: 0, hs: 0, cpu: [false, true], S: null, guestId: null, streak: 0, touch: false, think: -1 };
    if (matchMedia('(pointer: coarse)').matches) { root.classList.add('touch'); T.touch = true; }
    const box = el('div', 'tb-cv');
    const D = mkDock({ segs: [{ k: 'mode', lab: 'Mode', vals: [['cpu', 'vs CPU'], ['online', 'Online']] }, ...cfg.segs], btns: cfg.btns || 4, log: cfg.log }, onSeg, onBtn);
    root.append(box, D.el);
    T.box = box; T.D = D;
    const send = m => { try { api.net.send(m); } catch (e) {} };
    let cpuTimer = 0, gen = 0, ovUp = false, overDone = false, hooked = false, netTok = 0, inTurn = false, stack = [];
    const persist = () => api.save({ ...opt });
    const cardOf = seat => seat === T.me ? 0 : 1;
    T.name = seat => {
      if (seat === T.me) return 'You';
      if (T.mode === 'cpu') return 'AI';
      if (T.cpu[seat]) return 'Bot';
      const p = (api.net.players || []).find(q => q.id !== api.net.id);
      return p && p.name ? p.name : 'Friend';
    };
    T.mine = () => T.S && G.toAct(T).includes(T.me) && !ovUp;
    T.canUndo = () => T.mode === 'cpu' && stack.length > 0;
    T.overUp = () => ovUp;
    T.online = () => T.mode === 'online';
    T.gen = () => gen;
    T.later = (fn, ms) => { const g = gen; return api.timeout(() => { if (g === gen) fn(); }, ms); };

    function refresh() {
      if (!T.S) return;
      for (const s of cfg.segs) {
        D.seg(s.k, opt[s.k]);
        D.segHide(s.k, s.k === 'diff' ? T.mode !== 'cpu' : T.mode === 'online' && !(T.role === 'host' && G.canRestart(T)));
      }
      D.seg('mode', T.mode);
      G.refresh(T);
      conn();
    }
    T.refresh = refresh;
    function conn() {
      if (T.mode !== 'online' || !T.role) return D.conn(null);
      const bot = T.role === 'host' && T.cpu[1 - T.hs];
      D.conn(bot ? true : !!api.net.connected, bot ? 'Playing a bot' : api.net.connected ? 'Connected' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : 'Connection lost');
    }
    function setThink(seat) {
      if (T.think === seat) return;
      T.think = seat;
      D.card(0, { think: seat === T.me }); D.card(1, { think: seat >= 0 && seat !== T.me });
    }
    function kick() {
      clearTimeout(cpuTimer);
      if (!T.S || T.role === 'guest' || !T.role || overDone) return setThink(-1);
      const seats = G.toAct(T).filter(s => T.cpu[s]);
      if (!seats.length) return setThink(-1);
      const seat = seats[0], g = gen;
      setThink(seat);
      const wait = Math.max(G.wait(T, seat), G.busyUntil ? G.busyUntil(T) - now() : 0);
      cpuTimer = setTimeout(function go() {
        if (g !== gen || !api.alive) return;
        if (api.paused || document.hidden) { cpuTimer = setTimeout(go, 300); return; }
        if (G.busyUntil && G.busyUntil(T) > now() + 30) { cpuTimer = setTimeout(go, G.busyUntil(T) - now()); return; }
        const i = G.cpu(T, seat);
        if (!i || !submit(seat, i)) setThink(-1);
      }, wait);
    }
    T.kick = kick;
    function submit(seat, intent) {
      const ev = G.apply(T, seat, intent);
      if (!ev) return false;
      changed(ev);
      return true;
    }
    function resetSeats() {
      T.cpu = [false, false];
      if (T.mode === 'cpu') T.cpu[1 - T.me] = true; else T.cpu[1 - T.hs] = !T.guestId;
    }
    function changed(ev) {
      const nw = ev.find(e => e.k === 'new');
      if (nw) {
        gen++; clearTimeout(cpuTimer); stack = []; inTurn = false; overDone = false; ovUp = false; api.hideOverlay();
        if (nw.swap) { T.hs ^= 1; T.me = T.role === 'guest' ? 1 - T.hs : T.hs; resetSeats(); }
        api.score(T.mode === 'cpu' ? T.streak : '—');
      }
      G.events(T, ev);
      if (T.role === 'host') { send({ t: 'u', s: T.S, ev, hs: T.hs }); keep(); }
      if (!G.toAct(T).includes(T.me)) inTurn = false;
      refresh(); kick(); checkOver();
    }
    T.act = intent => {
      if (!T.S || ovUp) return false;
      if (T.role === 'guest') { send({ t: 'i', i: intent }); return true; }
      if (T.role !== 'host' && T.role !== 'local') return false;
      const fresh = !inTurn, snap = cfg.snapUndo && T.mode === 'cpu' && fresh && intent.t !== 'next' && intent.t !== 'resign' ? JSON.stringify(T.S) : null;
      const ok = submit(T.me, intent);
      if (ok && snap) stack.push(snap);
      if (ok) inTurn = G.toAct(T).includes(T.me) && !G.result(T);
      return ok;
    };
    T.undo = () => {
      if (!T.canUndo() || ovUp) return;
      gen++; clearTimeout(cpuTimer);
      T.S = JSON.parse(stack.pop()); overDone = false; inTurn = false; api.hideOverlay();
      G.events(T, [{ k: 'sync' }]);
      refresh(); kick();
    };
    const SK = 'gmtb:' + G.title;
    function keep() {
      try {
        if (T.mode !== 'online' || !api.net.code) return;
        if (!T.S || G.result(T) || !G.started(T)) sessionStorage.removeItem(SK);
        else sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), s: T.S, hs: T.hs }));
      } catch (e) { }
    }
    function resumeOffer() {
      let sv = null;
      try { const x = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (x && x.code === api.net.code && x.s && x.s.phase === 'play' && Date.now() - x.at < 432e5) sv = x; } catch (e) { }
      if (!sv) return false;
      ovUp = true;
      const go = () => {
        ovUp = false; api.hideOverlay();
        gen++; clearTimeout(cpuTimer); stack = []; inTurn = false; overDone = false;
        T.S = sv.s; T.hs = sv.hs | 0; T.me = T.hs; resetSeats();
        G.events(T, [{ k: 'sync' }]);
        send({ t: 'u', s: T.S, ev: [{ k: 'sync' }], hs: T.hs });
        refresh(); kick();
      };
      api.overlay({ kicker: 'Online', title: 'Game in progress', text: 'A saved game was found for this party. Resume it or start a new one.', button: 'Resume game', onAction: go, secondary: 'New game', onSecondary: () => { ovUp = false; api.hideOverlay(); begin(); } });
      return true;
    }
    function begin() {
      gen++; clearTimeout(cpuTimer); stack = []; inTurn = false; overDone = false; ovUp = false; api.hideOverlay();
      T.me = T.role === 'guest' ? 1 - T.hs : T.hs;
      resetSeats();
      T.S = G.create(T);
      G.events(T, [{ k: 'new' }]);
      if (T.role === 'host') send({ t: 'u', s: T.S, ev: [{ k: 'new' }], hs: T.hs });
      api.score(T.mode === 'cpu' ? T.streak : '—');
      refresh(); kick();
    }
    function newGame(swap) {
      if (T.role === 'guest') return;
      if (T.mode === 'cpu' && cfg.swap && swap) T.hs ^= 1;
      begin();
    }
    T.newGame = newGame;

    function checkOver() {
      if (overDone || !T.S) return;
      const r = G.result(T);
      if (!r) return;
      overDone = true; inTurn = false;
      const g = gen, res = r.w < 0 ? 'draw' : r.w === T.me ? 'win' : 'loss', fin = r.final !== false;
      let best = false;
      if (T.mode === 'cpu' && fin) { if (res === 'win') { T.streak++; best = api.submit(T.streak); } else if (res === 'loss') T.streak = 0; api.score(T.streak); }
      refresh();
      api.timeout(() => api.sfx(res === 'loss' ? 'lose' : res === 'draw' ? 'pop' : 'win'), 250);
      const wait = Math.max(900, (G.busyUntil ? G.busyUntil(T) - now() : 0) + 650);
      api.timeout(() => {
        if (g !== gen || !T.S) return;
        ovUp = true;
        const on = T.mode === 'online';
        api.overlay({
          kicker: best ? 'New best!' : r.kicker || (res === 'win' ? 'Victory' : res === 'loss' ? 'Defeat' : 'Draw'),
          title: r.title,
          text: r.text + (T.mode !== 'cpu' || !fin ? '' : res === 'win' ? ` Win streak: ${winsFmt(T.streak)}.` : res === 'loss' ? ' Your win streak resets.' : ' Your win streak is safe.'),
          stats: r.stats ? (T.mode === 'cpu' && fin ? [...r.stats, ['Streak', T.streak]] : r.stats) : null,
          button: fin ? (on ? 'Rematch' : 'Play again') : 'Next game',
          onAction: () => { ovUp = false; T.act({ t: 'next' }); refresh(); },
          secondary: 'View board', onSecondary: () => { ovUp = false; refresh(); }
        });
      }, wait);
    }

    function setMode(m) {
      if (m === T.mode) return;
      if (T.mode === 'online') { netTok++; api.net.close(); }
      T.mode = m; T.guestId = null; ovUp = false; api.hideOverlay();
      if (m === 'online') { T.role = null; goOnline(); } else { T.role = 'local'; T.hs = 0; newGame(false); }
    }
    async function goOnline() {
      hook();
      const tok = ++netTok;
      gen++; clearTimeout(cpuTimer); setThink(-1);
      T.mode = 'online'; T.role = null; T.guestId = null; overDone = false; ovUp = false; stack = []; api.hideOverlay();
      D.seg('mode', 'online');
      if (!T.S) { T.role = null; T.me = 0; T.cpu = [false, false]; T.S = G.create(T); G.events(T, [{ k: 'sync' }]); }
      T.role = null;
      G.refresh(T); D.conn(null);
      const r = await api.net.room({ title: G.title, sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true });
      if (!api.alive || tok !== netTok || T.mode !== 'online') return;
      if (!r) return setMode('cpu');
      T.role = r.role;
      if (r.role === 'host') {
        const g = (r.players || []).find(q => !q.host);
        T.guestId = g ? g.id : null;
        T.hs = Math.random() < .5 ? 0 : 1;
        if (!resumeOffer()) begin();
      } else {
        T.S = G.create(T); G.events(T, [{ k: 'sync' }]);
        G.refresh(T); D.st('Connected · waiting for the host…');
      }
    }
    function hook() {
      if (hooked) return;
      hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => {
        if (T.mode !== 'online' || T.role !== 'host' || !p || p.id !== T.guestId) return;
        T.guestId = null; T.cpu[1 - T.hs] = true;
        api.toast((p.name || 'Your friend') + ' left. A bot takes the seat.');
        refresh(); kick();
      });
      api.net.on('rejoin', p => {
        if (T.mode === 'online' && T.role === 'host' && p && p.id === T.guestId && T.S) api.net.sendTo(p.id, { t: 'u', s: T.S, ev: [{ k: 'sync' }], hs: T.hs });
      });
      api.net.on('lobby', () => { if (T.mode === 'online' && T.role !== 'host') goOnline(); });
      api.net.on('close', reason => {
        if (T.mode !== 'online' || T.role !== 'guest') return;
        T.role = null; gen++; ovUp = true; clearTimeout(cpuTimer);
        api.sfx('lose');
        const kicked = reason === 'kicked', left = reason === 'host-left';
        api.overlay({
          kicker: 'Online', title: kicked ? 'You were removed' : left ? 'The host left' : 'Connection lost',
          text: kicked ? 'The host removed you from the party.' : left ? 'The host ended the party.' : 'The connection to the host was lost.',
          button: 'New party', onAction: () => { ovUp = false; goOnline(); },
          secondary: 'Play vs CPU', onSecondary: () => { ovUp = false; setMode('cpu'); }
        });
      });
      api.interval(() => { if (T.mode === 'online') conn(); }, 1000);
    }
    function onData(d, from) {
      if (!d || typeof d !== 'object' || T.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (d.t === 'i' && d.i && typeof d.i === 'object' && T.role === 'host' && T.S && from === T.guestId) submit(1 - T.hs, d.i);
      } else if (d.t === 'u' && d.s && typeof d.s === 'object') {
        T.role = 'guest'; T.hs = d.hs | 0; T.me = 1 - T.hs;
        const ev = Array.isArray(d.ev) ? d.ev : [];
        T.S = d.s;
        if (ev.some(e => e.k === 'new' || e.k === 'sync')) { gen++; overDone = false; ovUp = false; api.hideOverlay(); }
        G.events(T, ev);
        if (ev.some(e => e.k === 'new')) api.score('—');
        refresh(); checkOver();
      }
    }

    function onSeg(k, v) {
      if (k === 'mode') return setMode(v);
      const s = cfg.segs.find(x => x.k === k), m = s && s.vals.find(([x]) => String(x) === v);
      if (!m || opt[k] === m[0]) return;
      api.sfx('tick');
      opt[k] = m[0]; persist(); D.seg(k, m[0]);
      if (k === 'diff') return;
      if (T.mode === 'cpu') newGame(false);
      else if (T.role === 'host' && G.canRestart(T)) begin();
    }
    function onBtn(id) {
      if (id === 'leave') return setMode('cpu');
      if (id === 'lobby') { if (T.role === 'host') goOnline(); return; }
      if (id === 'undo') return T.undo();
      if (id === 'next') { api.sfx('tick'); return T.act({ t: 'next' }); }
      if (id === 'new') {
        if (T.mode !== 'cpu') return;
        const live = !G.result(T) && G.started(T);
        if (live && T.streak) { api.toast('Resigned · streak reset'); T.streak = 0; }
        return newGame(!live);
      }
      G.btn(T, id);
    }
    T.start = () => {
      if (api.net.invite) { T.mode = 'online'; T.role = null; goOnline(); }
      else { T.role = 'local'; begin(); }
    };
    return T;
  }

  const bgIdx = (s, p) => s ? 24 - p : p - 1;
  const bgSg = s => s ? -1 : 1;
  const bgStart = () => {
    const pts = new Array(24).fill(0);
    [[24, 2], [13, 5], [8, 3], [6, 5]].forEach(([p, n]) => { pts[p - 1] += n; pts[24 - p] -= n; });
    return { pts, bar: [0, 0], off: [0, 0] };
  };
  const bgCnt = (P, s, p) => P.pts[s ? 24 - p : p - 1] * (s ? -1 : 1);
  const bgCopy = P => ({ pts: P.pts.slice(), bar: P.bar.slice(), off: P.off.slice() });
  const bgKey = P => String.fromCharCode(...P.pts.map(v => v + 20), P.bar[0] + 20, P.bar[1] + 20, P.off[0] + 20, P.off[1] + 20);

  function bgSingles(P, s, d) {
    const out = [], sg = s ? -1 : 1;
    if (P.bar[s]) {
      const t = 25 - d;
      if (P.pts[s ? 24 - t : t - 1] * sg > -2) out.push({ f: 25, t });
      return out;
    }
    let hi = 0;
    for (let p = 24; p >= 1; p--) if (P.pts[s ? 24 - p : p - 1] * sg > 0) { hi = p; break; }
    if (!hi) return out;
    const home = hi <= 6;
    for (let p = hi; p >= 1; p--) {
      if (P.pts[s ? 24 - p : p - 1] * sg <= 0) continue;
      const t = p - d;
      if (t >= 1) { if (P.pts[s ? 24 - t : t - 1] * sg > -2) out.push({ f: p, t }); }
      else if (home && (t === 0 || p === hi)) out.push({ f: p, t: 0 });
    }
    return out;
  }
  function bgDo(P, s, m) {
    const sg = s ? -1 : 1;
    let hit = false;
    if (m.f === 25) P.bar[s]--; else P.pts[bgIdx(s, m.f)] -= sg;
    if (m.t === 0) P.off[s]++;
    else {
      const i = bgIdx(s, m.t);
      if (P.pts[i] === -sg) { P.pts[i] = 0; P.bar[1 - s]++; hit = true; }
      P.pts[i] += sg;
    }
    return hit;
  }
  function bgUndo(P, s, m, hit) {
    const sg = s ? -1 : 1;
    if (m.t === 0) P.off[s]--;
    else { const i = bgIdx(s, m.t); P.pts[i] -= sg; if (hit) { P.pts[i] = -sg; P.bar[1 - s]--; } }
    if (m.f === 25) P.bar[s]++; else P.pts[bgIdx(s, m.f)] += sg;
  }
  function bgDepth(P, s, left, memo) {
    if (!left.length) return 0;
    const k = bgKey(P) + left.join('');
    const c = memo.get(k);
    if (c !== undefined) return c;
    let best = 0;
    const tried = new Set();
    for (let i = 0; i < left.length && best < left.length; i++) {
      const d = left[i];
      if (tried.has(d)) continue;
      tried.add(d);
      const ms = bgSingles(P, s, d);
      if (!ms.length) continue;
      const rest = left.slice(0, i).concat(left.slice(i + 1));
      for (const m of ms) {
        const h = bgDo(P, s, m);
        const v = 1 + bgDepth(P, s, rest, memo);
        bgUndo(P, s, m, h);
        if (v > best) best = v;
        if (best === left.length) break;
      }
    }
    memo.set(k, best);
    return best;
  }
  function bgLegal(P, s, left) {
    const res = [];
    if (!left.length) return res;
    const memo = new Map(), total = bgDepth(P, s, left, memo);
    if (!total) return res;
    const tried = new Set();
    for (let i = 0; i < left.length; i++) {
      const d = left[i];
      if (tried.has(d)) continue;
      tried.add(d);
      const rest = left.slice(0, i).concat(left.slice(i + 1));
      for (const m of bgSingles(P, s, d)) {
        const h = bgDo(P, s, m);
        const v = 1 + bgDepth(P, s, rest, memo);
        bgUndo(P, s, m, h);
        if (v === total) res.push({ f: m.f, t: m.t, d });
      }
    }
    if (total === 1 && left.length === 2 && left[0] !== left[1]) {
      const big = Math.max(left[0], left[1]), bs = res.filter(m => m.d === big);
      if (bs.length) return bs;
    }
    return res;
  }
  function bgPlays(P0, s, dice) {
    const P = bgCopy(P0), left0 = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : [dice[0], dice[1]];
    const memo = new Map(), total = bgDepth(P, s, left0, memo), out = new Map();
    if (!total) return [];
    let bigOnly = 0;
    if (total === 1 && left0.length === 2) {
      const big = Math.max(left0[0], left0[1]);
      for (const m of bgSingles(P, s, big)) { bigOnly = big; break; }
    }
    const seen = new Set(), seq = [];
    const rec = left => {
      if (!left.length || seq.length === total) {
        if (seq.length === total) { const k = bgKey(P); if (!out.has(k)) out.set(k, { m: seq.map(x => ({ ...x })), P: bgCopy(P) }); }
        return;
      }
      const sk = bgKey(P) + '/' + left.join('') + '/' + seq.length;
      if (seen.has(sk)) return;
      seen.add(sk);
      const tried = new Set();
      for (let i = 0; i < left.length; i++) {
        const d = left[i];
        if (tried.has(d) || (bigOnly && d !== bigOnly)) continue;
        tried.add(d);
        const rest = left.slice(0, i).concat(left.slice(i + 1));
        for (const m of bgSingles(P, s, d)) {
          const h = bgDo(P, s, m);
          if (1 + bgDepth(P, s, rest, memo) === total - seq.length) { seq.push({ f: m.f, t: m.t, d, hit: h }); rec(rest); seq.pop(); }
          bgUndo(P, s, m, h);
        }
      }
    };
    rec(left0);
    return [...out.values()];
  }
  function bgPips(P, s) {
    let n = P.bar[s] * 25;
    for (let p = 1; p <= 24; p++) { const c = bgCnt(P, s, p); if (c > 0) n += c * p; }
    return n;
  }
  const BG_HW = [0, .6, 2.2, 3.4, 4.4, 5.2, 4.4, 3.6, 2.8, 1.6, 1, .5, .5];
  const BG_W = { pip: .85, blot: 7, blotHome: 1.5, prime: .9, anchor: 1, bar: 9, barH: 1.3, mine: 2, mineH: 3, stack: 1.6, hw: 1, outer: .5 };
  const BG_A = new Int8Array(26), BG_B = new Int8Array(26);
  function bgHitRoll(p, a, b, bo, bq, nq) {
    const A = BG_A, open = x => x >= 1 && x <= 24 && A[x] < 2;
    if (a === b) {
      if (bo) {
        if (!open(a)) return false;
        if (p % a === 0) {
          const k = p / a;
          if (k <= 5 - bo) { let ok = true; for (let j = 1; j < k; j++) if (!open(j * a)) ok = false; if (ok) return true; }
        }
        const n = 4 - bo;
        if (n > 0) for (let z = 0; z < nq; z++) {
          const q = bq[z], d = p - q;
          if (q < p && d % a === 0 && d / a <= n) { let ok = true; for (let j = 1; j < d / a; j++) if (!open(q + j * a)) ok = false; if (ok) return true; }
        }
        return false;
      }
      for (let z = 0; z < nq; z++) {
        const q = bq[z], d = p - q;
        if (q < p && d % a === 0 && d / a <= 4) { let ok = true; for (let j = 1; j < d / a; j++) if (!open(q + j * a)) ok = false; if (ok) return true; }
      }
      return false;
    }
    if (bo >= 2) return (p === a && open(a)) || (p === b && open(b));
    if (bo === 1) {
      for (let r = 0; r < 2; r++) {
        const x = r ? b : a, y = r ? a : b;
        if (!open(x)) continue;
        if (p === x || x + y === p) return true;
        for (let z = 0; z < nq; z++) if (bq[z] + y === p) return true;
      }
      return false;
    }
    for (let z = 0; z < nq; z++) {
      const q = bq[z];
      if (q >= p) continue;
      const d = p - q;
      if (d === a || d === b) return true;
      if (d === a + b && (open(q + a) || open(q + b))) return true;
    }
    return false;
  }
  function bgEval(P, s, lite) {
    const o = 1 - s, A = BG_A, B = BG_B;
    A.fill(0); B.fill(0);
    let pipM = P.bar[s] * 25, pipO = P.bar[o] * 25, maxM = P.bar[s] ? 25 : 0, minO = P.bar[o] ? 0 : 99;
    for (let p = 1; p <= 24; p++) {
      const c = bgCnt(P, s, p);
      if (c > 0) { A[p] = c; pipM += c * p; if (p > maxM) maxM = p; }
      else if (c < 0) { B[p] = -c; pipO += -c * (25 - p); if (p < minO) minO = p; }
    }
    const contact = maxM > minO;
    if (!contact) {
      let w = 0;
      for (let p = 1; p <= 3; p++) if (A[p] > 2) w += (A[p] - 2) * (4 - p) * .35;
      return pipO - pipM - w + P.off[s] * .1;
    }
    let sc = (pipO - pipM) * BG_W.pip;
    let myHome = 0, oHome = 0;
    for (let p = 1; p <= 6; p++) if (A[p] >= 2) myHome++;
    for (let p = 19; p <= 24; p++) if (B[p] >= 2) oHome++;
    let run = 0, bestRun = 0;
    for (let p = 1; p <= 12; p++) {
      if (A[p] >= 2) { sc += BG_HW[p] * BG_W.hw; run++; if (run > bestRun) bestRun = run; } else run = 0;
      if (A[p] > 3) sc -= (A[p] - 3) * BG_W.stack;
    }
    for (let p = 13; p <= 18; p++) if (A[p] >= 2) { sc += BG_W.outer; if (A[p] > 4) sc -= (A[p] - 4); }
    if (bestRun >= 3) sc += BG_W.prime * bestRun * bestRun;
    run = 0;
    for (let p = 1; p <= 24; p++) { if (A[p] >= 2) { run++; if (run > bestRun) bestRun = run; } else run = 0; }
    const behind = pipM > pipO ? 1 : .45;
    for (let p = 19; p <= 24; p++) if (A[p] >= 2) sc += (p === 20 || p === 21 ? 5.5 : p === 19 || p === 22 ? 3.5 : 1.8) * behind * BG_W.anchor;
    if (P.bar[o]) sc += P.bar[o] * (BG_W.bar + BG_W.barH * myHome);
    if (P.bar[s]) sc -= P.bar[s] * (BG_W.mine + BG_W.mineH * oHome);
    let nq = 0; const bq = BG_BQ;
    for (let p = 1; p <= 24; p++) if (B[p] > 0) bq[nq++] = p;
    for (let p = 1; p <= 24; p++) {
      if (A[p] !== 1) continue;
      const loss = (25 - p) + BG_W.blot + BG_W.blotHome * oHome;
      let hits = 0;
      for (let r = 0; r < 36; r++) if (bgHitRoll(p, r % 6 + 1, (r / 6 | 0) + 1, P.bar[o], bq, nq)) hits++;
      sc -= hits / 36 * loss * (lite ? .8 : 1);
    }
    return sc;
  }
  const BG_BQ = new Int8Array(26);
  function bgEvalLite(P, s) {
    const o = 1 - s;
    let pipM = P.bar[s] * 25, pipO = P.bar[o] * 25, blots = 0, made = 0;
    for (let p = 1; p <= 24; p++) {
      const c = bgCnt(P, s, p);
      if (c > 0) { pipM += c * p; if (c === 1) blots += (25 - p) * .22 + 2; else if (p <= 12) made += BG_HW[p] * .5; }
      else if (c < 0) pipO += -c * (25 - p);
    }
    return pipO - pipM - blots + made + P.bar[o] * 9 - P.bar[s] * 3;
  }
  const BG_ROLLS = (() => { const r = []; for (let a = 1; a <= 6; a++) for (let b = a; b <= 6; b++) r.push([a, b, a === b ? 1 : 2]); return r; })();
  function bgRaceWp(P, s) {
    const pm = bgPips(P, s), po = bgPips(P, 1 - s), diff = po - pm + 4, sd = 1.54 * Math.sqrt((pm + po) / 2);
    return 1 / (1 + Math.exp(-1.702 * diff / sd));
  }
  function bgWp(P, s) {
    const e = bgEval(P, s, false), pm = bgPips(P, s), po = bgPips(P, 1 - s);
    let contact = false, maxM = P.bar[s] ? 25 : 0, minO = P.bar[1 - s] ? 0 : 99;
    for (let p = 1; p <= 24; p++) { const c = bgCnt(P, s, p); if (c > 0 && p > maxM) maxM = p; if (c < 0 && p < minO) minO = p; }
    contact = maxM > minO;
    const sd = 1.54 * Math.sqrt((pm + po) / 2) * (contact ? 1.35 : 1);
    return 1 / (1 + Math.exp(-1.702 * (e + (contact ? 3 : 4)) / sd));
  }
  function bgChoose(S, seat, level) {
    const P = { pts: S.pts, bar: S.bar, off: S.off }, dice = S.dice;
    const plays = bgPlays(P, seat, dice);
    if (!plays.length) return [];
    if (plays.length === 1) return plays[0].m;
    const o = 1 - seat;
    for (const pl of plays) pl.v = bgEval(pl.P, seat, false) + (level === 0 ? (Math.random() - .5) * 26 : level === 1 ? (Math.random() - .5) * 2 : 0);
    plays.sort((a, b) => b.v - a.v);
    if (level === 0 && Math.random() < .25) return plays[Math.min(plays.length - 1, Math.random() * 4 | 0)].m;
    if (level < 2) return plays[0].m;
    const top = plays.slice(0, 9);
    for (const pl of top) {
      let tot = 0, wsum = 0;
      for (const [a, b, w] of BG_ROLLS) {
        const reps = bgPlays(pl.P, o, [a, b]);
        let bv = -1e9;
        if (!reps.length) bv = bgEvalLite(pl.P, o);
        else for (const r of reps) { const v = bgEvalLite(r.P, o); if (v > bv) bv = v; }
        tot += -bv * w; wsum += w;
      }
      const L = tot / wsum;
      pl.v2 = L;
      pl.f = pl.v * .35 + L * .65;
    }
    top.sort((a, b) => b.f - a.f);
    return top[0].m;
  }
  function bgCubeWanted(S, seat, level) {
    if (S.crawford || S.len < 2 || S.phase !== 'roll' || (S.cube.own !== -1 && S.cube.own !== seat) || S.cube.v >= 64) return false;
    const need = S.len - S.score[seat], oppNeed = S.len - S.score[1 - seat], v = S.cube.v;
    if (v * 2 >= S.len && v >= oppNeed) return false;
    if (S.score[seat] === S.len - 1) return false;
    const P = { pts: S.pts, bar: S.bar, off: S.off }, wp = bgWp(P, seat);
    const lo = level === 2 ? .69 : .74, hi = level === 2 ? .92 : .88;
    if (level === 0) return Math.random() < .08 && wp > .8;
    const pm = bgPips(P, seat), po = bgPips(P, 1 - seat);
    let contact = false, maxM = P.bar[seat] ? 25 : 0, minO = P.bar[1 - seat] ? 0 : 99;
    for (let p = 1; p <= 24; p++) { const c = bgCnt(P, seat, p); if (c > 0 && p > maxM) maxM = p; if (c < 0 && p < minO) minO = p; }
    contact = maxM > minO;
    if (!contact) return wp > .71 && wp < .985 && po - pm >= .08 * pm;
    return wp >= lo && wp <= hi;
  }
  function bgTakes(S, seat, level) {
    const P = { pts: S.pts, bar: S.bar, off: S.off }, wp = bgWp(P, seat);
    const need = S.len - S.score[seat], v = S.cube.v * 2;
    const pt = level === 0 ? .32 : level === 1 ? .27 : .235;
    if (need <= v && S.len - S.score[1 - seat] <= S.cube.v * 2 && wp < .5) return wp > .15;
    return wp >= pt;
  }
  function bgNotation(ms) {
    const nm = x => x === 25 ? 'bar' : x === 0 ? 'off' : x;
    return ms.map(m => nm(m.f) + '/' + nm(m.t) + (m.hit ? '*' : '')).join(' ');
  }
  function bgNew(T, prev) {
    const P = bgStart(), len = T.opt.match;
    const S = {
      pts: P.pts, bar: P.bar, off: P.off, turn: -1, phase: 'open', dice: null, left: [], od: null, tie: false,
      cube: { v: 1, own: -1 }, offer: null, score: [0, 0], len, crawford: false, crawfordUsed: false, nextCrawford: false,
      game: 1, stack: [], mvs: [], log: [], res: null, matchW: -1, rdy: [false, false], last: null, seq: 0
    };
    if (prev && prev.matchW < 0 && prev.len === len) {
      S.score = prev.score.slice(); S.game = prev.game + 1; S.crawfordUsed = prev.crawfordUsed || prev.nextCrawford;
      S.crawford = prev.nextCrawford;
    }
    return S;
  }
  const bgCanDouble = (S, seat) => S.phase === 'roll' && S.turn === seat && !S.crawford && S.len > 1 && (S.cube.own === -1 || S.cube.own === seat) && S.cube.v < 64;
  function bgFinish(S, w, kind) {
    const l = 1 - w, P = { pts: S.pts, bar: S.bar, off: S.off };
    let mult = 1;
    if (kind === 'bear' && S.off[l] === 0) {
      mult = 2;
      if (S.bar[l] > 0) mult = 3;
      else for (let p = 1; p <= 6; p++) if (bgCnt(P, w, p) < 0) mult = 3;
    }
    const pts = S.cube.v * mult;
    S.score[w] += pts;
    if (S.score[w] >= S.len) S.matchW = w;
    S.nextCrawford = S.matchW < 0 && !S.crawfordUsed && !S.crawford && S.len > 1 && (S.score[0] === S.len - 1 || S.score[1] === S.len - 1);
    S.res = { w, pts, kind, mult, v: S.cube.v };
    S.phase = 'over'; S.stack = [];
    S.log.push({ s: w, t: 'res', x: kind === 'drop' ? 'drops' : kind === 'resign' ? 'resigns' : mult === 3 ? 'backgammon' : mult === 2 ? 'gammon' : 'wins', p: pts });
  }
  const bgRoll = () => [1 + Math.random() * 6 | 0, 1 + Math.random() * 6 | 0];
  function bgStartMove(S, seat, dice) {
    S.turn = seat; S.phase = 'move'; S.dice = dice.slice();
    S.left = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : [dice[0], dice[1]];
    S.stack = []; S.mvs = [];
  }
  function bgApply(T, seat, i) {
    const S = T.S;
    if (!i || typeof i.t !== 'string') return null;
    const P = { pts: S.pts, bar: S.bar, off: S.off };
    S.seq++;
    if (i.t === 'next') {
      if (S.phase !== 'over') return null;
      S.rdy[seat] = true;
      if (!S.rdy.every((r, q) => r || T.cpu[q])) return [{ k: 'rdy' }];
      const fin = S.matchW >= 0, N = bgNew(T, fin ? null : S);
      for (const k of Object.keys(S)) delete S[k];
      Object.assign(S, N);
      return [{ k: 'new', swap: false }];
    }
    if (S.phase === 'over') return null;
    if (i.t === 'resign') {
      if (S.phase === 'open') return null;
      bgFinish(S, 1 - seat, 'resign');
      return [{ k: 'over' }];
    }
    if (i.t === 'roll') {
      if (S.phase === 'open') {
        const d = bgRoll();
        S.od = d; S.tie = d[0] === d[1];
        if (S.tie) return [{ k: 'open', d, tie: true }];
        bgStartMove(S, d[0] > d[1] ? 0 : 1, d);
        return [{ k: 'open', d, tie: false }];
      }
      if (S.phase !== 'roll' || S.turn !== seat) return null;
      const d = bgRoll();
      bgStartMove(S, seat, d);
      return [{ k: 'roll', s: seat, d }];
    }
    if (i.t === 'dbl') {
      if (!bgCanDouble(S, seat)) return null;
      S.phase = 'offer'; S.offer = seat;
      return [{ k: 'dbl', s: seat }];
    }
    if (i.t === 'take' || i.t === 'drop') {
      if (S.phase !== 'offer' || seat !== 1 - S.offer) return null;
      if (i.t === 'take') {
        S.cube.v *= 2; S.cube.own = seat; S.phase = 'roll'; S.offer = null;
        return [{ k: 'take', s: seat }];
      }
      bgFinish(S, S.offer, 'drop'); S.offer = null;
      return [{ k: 'over' }];
    }
    if (S.turn !== seat || S.phase !== 'move') return null;
    if (i.t === 'mv') {
      const lg = bgLegal(P, seat, S.left), m = lg.find(x => x.f === i.f && x.d === i.d);
      if (!m) return null;
      S.stack.push({ pts: S.pts.slice(), bar: S.bar.slice(), off: S.off.slice(), left: S.left.slice(), n: S.mvs.length });
      const hit = bgDo(P, seat, m);
      S.left.splice(S.left.indexOf(m.d), 1);
      S.mvs.push({ f: m.f, t: m.t, d: m.d, hit });
      const ev = [{ k: 'mv', s: seat, f: m.f, t: m.t, hit, d: m.d }];
      if (S.off[seat] === 15) { S.log.push({ s: seat, d: S.dice, m: bgNotation(S.mvs) }); bgFinish(S, seat, 'bear'); ev.push({ k: 'over' }); }
      return ev;
    }
    if (i.t === 'undo') {
      if (!S.stack.length) return null;
      const z = S.stack.pop();
      S.pts = z.pts; S.bar = z.bar; S.off = z.off; S.left = z.left; S.mvs.length = z.n;
      return [{ k: 'undo' }];
    }
    if (i.t === 'end') {
      if (bgLegal(P, seat, S.left).length) return null;
      S.log.push({ s: seat, d: S.dice, m: bgNotation(S.mvs) || 'no move' });
      S.last = { s: seat, d: S.dice };
      S.turn = 1 - seat; S.phase = 'roll'; S.dice = null; S.left = []; S.stack = []; S.mvs = [];
      return [{ k: 'turn', s: S.turn }];
    }
    return null;
  }

  const BGW = 984, BGH = 640, BR = 26, BSP = 52;
  const bgX = q => q <= 6 ? 460 + (6 - q) * 64 + 32 : q <= 12 ? 20 + (12 - q) * 64 + 32 : q <= 18 ? 20 + (q - 13) * 64 + 32 : 460 + (q - 19) * 64 + 32;
  const bgSlot = (q, k) => q >= 13 ? { x: bgX(q), y: 46 + k * BSP } : { x: bgX(q), y: 594 - k * BSP };
  const bgTri = (c, q, w) => {
    const x = bgX(q), top = q >= 13, y0 = top ? 20 : 620, y1 = top ? 278 : 362;
    c.beginPath(); c.moveTo(x - w, y0); c.lineTo(x + w, y0); c.lineTo(x, y1); c.closePath();
  };
  const BG_CHK = [
    { a: '#fffaf0', b: '#eadcc0', c: '#b9a57f', edge: '#8a7552', ring: '#cdbb97', ink: '#3b2b17' },
    { a: '#5d534b', b: '#2d2723', c: '#0f0c0a', edge: '#000', ring: '#4b4037', ink: '#f2e6cc' }
  ];
  const BG_PIPS = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];

  function bgBoardImg() {
    const dpr = dprOf(), cv = cnv(BGW * dpr, BGH * dpr), c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const rand = rng(4242);
    c.save(); rr(c, 0, 0, BGW, BGH, 18); c.clip();
    grain(c, 0, 0, BGW, BGH, '#5e3517', ['#3d210d', '#7e4b22', '#4a290f', '#92602f'], rand, false);
    knots(c, 0, 0, BGW, BGH, rand, 6, '#35200d');
    c.restore();
    const bevel = c.createLinearGradient(0, 0, 0, BGH);
    bevel.addColorStop(0, 'rgba(255,220,160,.35)'); bevel.addColorStop(.08, 'rgba(255,220,160,0)'); bevel.addColorStop(.92, 'rgba(0,0,0,0)'); bevel.addColorStop(1, 'rgba(0,0,0,.45)');
    rr(c, 1, 1, BGW - 2, BGH - 2, 17); c.strokeStyle = bevel; c.lineWidth = 2; c.stroke();
    const half = (x, w) => {
      c.save(); c.beginPath(); c.rect(x, 20, w, 600); c.clip();
      grain(c, x, 20, w, 600, '#2c1a0e', ['#1c0f07', '#43291a', '#241409', '#4f3220'], rand, false);
      const sh = c.createLinearGradient(0, 20, 0, 620);
      sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(.06, 'rgba(0,0,0,0)'); sh.addColorStop(.94, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = sh; c.fillRect(x, 20, w, 600);
      const sv = c.createLinearGradient(x, 0, x + w, 0);
      sv.addColorStop(0, 'rgba(0,0,0,.45)'); sv.addColorStop(.035, 'rgba(0,0,0,0)'); sv.addColorStop(.965, 'rgba(0,0,0,0)'); sv.addColorStop(1, 'rgba(0,0,0,.45)');
      c.fillStyle = sv; c.fillRect(x, 20, w, 600);
      c.restore();
    };
    half(20, 384); half(460, 384);
    for (let q = 1; q <= 24; q++) {
      const light = q % 2 === 1;
      c.save(); bgTri(c, q, 30); c.clip();
      const x = bgX(q) - 30, top = q >= 13, y = top ? 20 : 362;
      grain(c, x, y, 60, 258, light ? '#d6b57a' : '#7a3a24', light ? ['#b4915a', '#e8cf9c', '#c6a46c'] : ['#5c2716', '#94503a', '#6a301d'], rand, true);
      const g = c.createLinearGradient(bgX(q) - 30, 0, bgX(q) + 30, 0);
      g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.22)');
      c.fillStyle = g; c.fillRect(x, y, 60, 258);
      c.restore();
      bgTri(c, q, 30); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.4; c.stroke();
    }
    c.save(); c.beginPath(); c.rect(404, 0, 56, BGH); c.clip();
    grain(c, 404, 0, 56, BGH, '#69401d', ['#432610', '#865227', '#52300f'], rand, true);
    const bg = c.createLinearGradient(404, 0, 460, 0);
    bg.addColorStop(0, 'rgba(0,0,0,.5)'); bg.addColorStop(.12, 'rgba(255,210,150,.14)'); bg.addColorStop(.88, 'rgba(255,210,150,.1)'); bg.addColorStop(1, 'rgba(0,0,0,.5)');
    c.fillStyle = bg; c.fillRect(404, 0, 56, BGH);
    c.restore();
    for (const y of [92, 508]) {
      const hg = c.createLinearGradient(414, 0, 450, 0);
      hg.addColorStop(0, '#c9a45a'); hg.addColorStop(.5, '#f1dc9b'); hg.addColorStop(1, '#a98238');
      rr(c, 414, y, 36, 40, 4); c.fillStyle = hg; c.fill(); c.strokeStyle = 'rgba(60,35,5,.7)'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = 'rgba(60,35,5,.7)';
      for (const dy of [9, 31]) { c.beginPath(); c.arc(423, y + dy, 2.2, 0, 7); c.arc(441, y + dy, 2.2, 0, 7); c.fill(); }
    }
    const well = (y, h) => {
      c.save(); c.beginPath(); c.rect(862, y, 96, h); c.clip();
      grain(c, 862, y, 96, h, '#2a190d', ['#1a0e06', '#432818', '#22130a'], rand, true);
      const w1 = c.createLinearGradient(0, y, 0, y + h);
      w1.addColorStop(0, 'rgba(0,0,0,.55)'); w1.addColorStop(.12, 'rgba(0,0,0,0)'); w1.addColorStop(.88, 'rgba(0,0,0,0)'); w1.addColorStop(1, 'rgba(0,0,0,.4)');
      c.fillStyle = w1; c.fillRect(862, y, 96, h);
      c.restore();
      c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; c.strokeRect(862, y, 96, h);
    };
    well(28, 222); well(390, 222);
    rr(c, 866, 262, 88, 116, 10); c.fillStyle = 'rgba(0,0,0,.22)'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
    return cv;
  }

  function bgChk(c, x, y, col, al, sh) {
    const P = BG_CHK[col], r = BR;
    c.save(); c.globalAlpha = al === undefined ? 1 : al;
    if (sh !== 0) shadowEll(c, x + 1.5, y + 5, r * 1.08, r * .78, .34);
    const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .08, x, y, r * 1.08);
    g.addColorStop(0, P.a); g.addColorStop(.55, P.b); g.addColorStop(1, P.c);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = P.edge; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = P.ring; c.lineWidth = 2; c.globalAlpha *= .8;
    c.beginPath(); c.arc(x, y, r * .76, 0, 7); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.arc(x, y, r * .5, 0, 7); c.stroke();
    c.globalAlpha = (al === undefined ? 1 : al) * (col ? .22 : .55); c.strokeStyle = '#fff'; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r * .9, Math.PI * 1.08, Math.PI * 1.42); c.stroke();
    c.restore();
  }
  function bgFlat(c, x, y, col) {
    const P = BG_CHK[col];
    c.save();
    const g = c.createLinearGradient(0, y - 6, 0, y + 6);
    g.addColorStop(0, P.a); g.addColorStop(.5, P.b); g.addColorStop(1, P.c);
    rr(c, x - 38, y - 6.5, 76, 13, 5.5); c.fillStyle = g; c.fill();
    c.strokeStyle = P.edge; c.lineWidth = 1.2; c.stroke();
    c.restore();
  }
  function bgDie(c, x, y, v, col, ang, sc, al) {
    const s = 44 * sc, P = BG_CHK[col];
    c.save(); c.translate(x, y); c.globalAlpha = al;
    shadowEll(c, 3, 6, s * .66, s * .44, .35);
    c.rotate(ang);
    const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    g.addColorStop(0, P.a); g.addColorStop(1, P.c);
    rr(c, -s / 2, -s / 2, s, s, s * .2); c.fillStyle = g; c.fill();
    c.strokeStyle = P.edge; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = P.ink;
    const u = s * .25;
    for (const [px, py] of BG_PIPS[v] || []) { c.beginPath(); c.arc(px * u, py * u, s * .082, 0, 7); c.fill(); }
    c.restore();
  }
  function bgCup(c, x, y, ang, al, glow) {
    c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha = al;
    shadowEll(c, 4, 36, 36, 12, .35);
    if (glow) { c.shadowColor = 'rgba(255,214,102,.9)'; c.shadowBlur = 18 * glow; }
    c.beginPath(); c.moveTo(-27, -38); c.lineTo(27, -38); c.lineTo(21, 38); c.quadraticCurveTo(0, 46, -21, 38); c.closePath();
    const g = c.createLinearGradient(-27, 0, 27, 0);
    g.addColorStop(0, '#2d190c'); g.addColorStop(.3, '#7a4a28'); g.addColorStop(.55, '#5b3519'); g.addColorStop(1, '#25140a');
    c.fillStyle = g; c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = '#1a0e06'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#e3bf6a'; rr(c, -28, -42, 56, 10, 4); c.fill(); c.strokeStyle = '#7a5a1c'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#120a04'; c.beginPath(); c.ellipse(0, -37, 24, 4.5, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(240,200,140,.35)'; c.lineWidth = 1; c.setLineDash([3, 3]);
    c.beginPath(); c.moveTo(-23, -20); c.lineTo(-17.5, 30); c.moveTo(23, -20); c.lineTo(17.5, 30); c.stroke(); c.setLineDash([]);
    c.restore();
  }
  function bgCube(c, x, y, v, al, glow, upright) {
    c.save(); c.translate(x, y); c.globalAlpha = al;
    shadowEll(c, 3, 5, 36, 26, .35);
    if (glow) { c.shadowColor = 'rgba(255,214,102,.95)'; c.shadowBlur = 16 * glow; }
    rr(c, -26, -26, 52, 52, 9);
    const g = c.createLinearGradient(-26, -26, 26, 26);
    g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#cdbb97');
    c.fillStyle = g; c.fill(); c.shadowBlur = 0;
    c.strokeStyle = '#8a7552'; c.lineWidth = 2; c.stroke();
    rr(c, -21, -21, 42, 42, 6); c.strokeStyle = 'rgba(138,117,82,.5)'; c.lineWidth = 1; c.stroke();
    if (upright) c.rotate(-Math.PI / 2);
    c.fillStyle = '#7a1f14'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `900 ${v >= 16 ? 24 : 30}px Georgia,serif`; c.fillText(String(v), 0, 2);
    c.restore();
  }

  function bgGame(api, root) {
    const V = {
      fl: [], dice: [], cup: null, busy: 0, sel: null, reach: new Map(), legal: [], lk: '', down: null, drag: null, hover: null, kf: -1,
      last: [], turnMv: [], cube: 0, endK: '', endT: 0, tap: null, sure: false, planK: '', plan: [], dirty: true, anim: false, img: null
    };
    let T = null, view = null, cvsList = [];
    const sk = S => S.game + ':' + S.log.length + ':' + S.mvs.length + ':' + S.stack.length + ':' + S.phase;
    const PO = S => ({ pts: S.pts, bar: S.bar, off: S.off });
    const slot = (s, p, k) => {
      if (p === 25) return s === T.me ? { x: 432, y: 356 + Math.min(k, 4) * BSP } : { x: 432, y: 284 - Math.min(k, 4) * BSP };
      if (p === 0) return s === T.me ? { x: 910, y: 604 - k * 14, flat: 1 } : { x: 910, y: 36 + k * 14, flat: 1 };
      return bgSlot(s === T.me ? p : 25 - p, k);
    };
    const cnt = (S, s, p) => p === 25 ? S.bar[s] : p === 0 ? S.off[s] : bgCnt(PO(S), s, p);
    const halfC = s => ({ x: s === T.me ? 652 : 212, y: 320 });
    const colOf = s => s === T.me ? 0 : 1;

    function rest(s, i, seed) {
      const r = rng(seed * 7919 + i * 131 + 17), h = halfC(s);
      return { x: h.x + (i ? 34 : -34) + (r() - .5) * 14, y: h.y + (r() - .5) * 16, a: (r() - .5) * 1.1 };
    }
    const mkDice = (vals, seats, seed) => vals.map((v, i) => ({ v, s: seats[i], i, segs: [{ k: 'rest', t0: 0, dur: 0, to: rest(seats[i], i, seed) }] }));
    function dieAt(d, t) {
      const sg = d.segs;
      if (t < sg[0].t0) return null;
      let cur = sg[0];
      for (const q of sg) if (t >= q.t0) cur = q;
      if (cur.k === 'rest' || t >= cur.t0 + cur.dur) { const to = cur.to; return { x: to.x, y: to.y, a: to.a, v: d.v, z: 0 }; }
      const p = (t - cur.t0) / cur.dur;
      if (cur.k === 'glide') { const e = easeIO(p); return { x: lerp(cur.from.x, cur.to.x, e), y: lerp(cur.from.y, cur.to.y, e), a: lerp(cur.from.a, cur.to.a, e), v: d.v, z: Math.sin(p * Math.PI) * 6 }; }
      const e = easeOut(p), bounce = Math.abs(Math.sin(p * Math.PI * 2.3)) * (1 - p) * 46;
      return { x: lerp(cur.from.x, cur.to.x, e), y: lerp(cur.from.y, cur.to.y, e) - bounce, a: lerp(cur.from.a, cur.to.a, e) + (1 - e) * cur.spin, v: p < .72 ? 1 + (Math.floor(now() / 55 + d.i * 3) % 6) : d.v, z: bounce };
    }
    const diceEnd = () => V.dice.reduce((m, d) => Math.max(m, ...d.segs.map(s => s.t0 + s.dur)), 0);

    function resetView(keep) {
      const S = T.S;
      V.fl = []; V.cup = null; V.sel = null; V.reach = new Map(); V.legal = []; V.lk = ''; V.down = null; V.drag = null; V.kf = -1; V.sure = false; V.plan = []; V.planK = '';
      if (!keep) { V.turnMv = []; V.last = []; }
      V.dice = [];
      if (S.phase === 'move' && S.dice) V.dice = mkDice(S.dice, [S.turn, S.turn], S.game * 13 + S.log.length);
      else if (S.phase === 'open' && S.od) V.dice = mkDice(S.od, [0, 1], S.game * 13 + 5);
      V.cube = cubeTarget();
      V.busy = 0; V.dirty = true;
    }
    function cubeTarget() {
      const S = T.S;
      if (S.phase === 'offer') return S.offer === T.me ? -.7 : .7;
      return S.cube.own === -1 ? 0 : S.cube.own === T.me ? 1 : -1;
    }

    function addFlight(s, f, t, ia, ib, t0, dur, ghost) {
      const a = slot(s, f, ia), b = slot(s, t, ib);
      V.fl.push({ s, f, t, a, b, t0, dur, ghost: !!ghost, sw: t === 0 });
      V.busy = Math.max(V.busy, t0 + dur);
    }
    function onMove(e) {
      const S = T.S, s = e.s, tm = now();
      let start = tm;
      for (const f of V.fl) if (!f.ghost) start = Math.max(start, f.t0 + f.dur * .55);
      const ia = cnt(S, s, e.f), ib = e.t === 0 ? S.off[s] - 1 : cnt(S, s, e.t) - 1;
      const A = slot(s, e.f, ia), B = slot(s, e.t, ib);
      const dist = Math.hypot(A.x - B.x, A.y - B.y), dur = 220 + 150 * Math.min(1, dist / 560);
      addFlight(s, e.f, e.t, ia, ib, start, dur);
      V.turnMv.push({ s, f: e.f, t: e.t });
      T.later(() => { if (e.t === 0) T.snd.slide(); else T.snd.clack(); }, Math.max(0, start + dur - tm));
      if (e.hit) {
        const o = 1 - s, hp = 25 - e.t;
        addFlight(o, hp, 25, 0, S.bar[o] - 1, start + dur * .6, 380, true);
        T.later(() => T.snd.take(), Math.max(0, start + dur * .6 - tm));
      }
    }
    function onRoll(s, d) {
      const tm = now(), h = halfC(s);
      T.snd.shake();
      V.cup = { s, t0: tm, dur: 620 };
      const seed = Math.floor(Math.random() * 1e6);
      V.dice = d.map((v, i) => {
        const rp = rest(s, i, seed), from = { x: h.x + (i ? 8 : -8), y: h.y - 26, a: 0 };
        return { v, s, i, segs: [{ k: 'tumble', t0: tm + 620, dur: 560, from, to: rp, spin: (Math.random() < .5 ? -1 : 1) * (5 + Math.random() * 4) }] };
      });
      T.later(() => T.snd.die(), 760);
      V.busy = Math.max(V.busy, tm + 1200);
    }
    function onOpen(e) {
      const tm = now(), seed = Math.floor(Math.random() * 1e6);
      T.snd.shake();
      const S = T.S, from = i => ({ x: 432, y: 320 + (i ? 30 : -30), a: 0 });
      V.dice = e.d.map((v, i) => {
        const rp2 = { x: halfC(i).x, y: 320 + (Math.random() - .5) * 14, a: (Math.random() - .5) * 1.2 };
        const segs = [{ k: 'tumble', t0: tm + 250, dur: 600, from: from(i), to: rp2, spin: (i ? -1 : 1) * 7 }];
        if (!e.tie) {
          const st = S.turn, tgt = rest(st, i, seed + 1);
          segs.push({ k: 'glide', t0: tm + 1750, dur: 520, from: rp2, to: tgt });
        }
        return { v, s: i, i, segs };
      });
      T.later(() => T.snd.die(), 450);
      V.busy = Math.max(V.busy, e.tie ? tm + 900 : tm + 2300);
    }

    function reachFrom(f) {
      const S = T.S, me = T.me, res = new Map();
      const walk = (P, left, cur, chain) => {
        const lg = bgLegal(P, me, left).filter(m => m.f === cur), seen = new Set();
        for (const m of lg) {
          if (seen.has(m.d)) continue;
          seen.add(m.d);
          const P2 = bgCopy(P), hit = bgDo(P2, me, m), l2 = left.slice();
          l2.splice(l2.indexOf(m.d), 1);
          const ch = chain.concat([{ f: m.f, t: m.t, d: m.d, hit }]);
          const old = res.get(m.t), hits = ch.filter(x => x.hit).length;
          if (!old || old.length > ch.length || (old.length === ch.length && old.filter(x => x.hit).length > hits)) res.set(m.t, ch);
          if (m.t > 0 && l2.length) walk(P2, l2, m.t, ch);
        }
      };
      walk(bgCopy(PO(S)), S.left.slice(), f, []);
      return res;
    }
    function setSel(f) {
      V.sel = f; V.kf = -1;
      V.reach = f === null ? new Map() : reachFrom(f);
      V.dirty = true;
    }
    const srcs = () => [...new Set(V.legal.map(m => m.f))];
    function go(chain) {
      setSel(null);
      for (const m of chain) if (!T.act({ t: 'mv', f: m.f, d: m.d })) break;
    }
    function autoMove(f) {
      const ms = V.legal.filter(m => m.f === f).sort((a, b) => b.d - a.d);
      if (ms.length) go([ms[0]]);
    }
    function cands() {
      const S = T.S;
      if (!T.mine() || S.phase !== 'move' || S.turn !== T.me) return [];
      return (V.sel === null ? srcs() : [...V.reach.keys()]).sort((a, b) => b - a);
    }

    function target(p) {
      const S = T.S;
      if (cupRect(p)) return { k: 'cup' };
      if (p.x >= 856 && p.x <= 964) {
        if (p.y >= 256 && p.y <= 384) return { k: 'cube' };
        return p.y > 384 ? { k: 'off' } : { k: 'ooff' };
      }
      if (p.x > 404 && p.x < 460) return p.y >= 310 ? { k: 'bar' } : { k: 'obar' };
      const L = p.x >= 20 && p.x < 404 ? 0 : p.x >= 460 && p.x < 844 ? 1 : -1;
      if (L < 0 || p.y < 20 || p.y > 620) return null;
      const col = Math.floor((p.x - (L ? 460 : 20)) / 64), top = p.y < 320;
      return { k: 'pt', q: L ? (top ? 19 + col : 6 - col) : (top ? 13 + col : 12 - col) };
    }
    function cupRect(p) {
      const S = T.S;
      if (!T.mine() || !(S.phase === 'open' || (S.phase === 'roll' && S.turn === T.me)) || V.cup) return false;
      const h = halfC(T.me);
      return Math.abs(p.x - h.x) < 50 && Math.abs(p.y - h.y) < 56;
    }
    const dOf = tg => tg ? (tg.k === 'pt' ? tg.q : tg.k === 'bar' ? 25 : tg.k === 'off' ? 0 : -1) : -1;
    function press(tg, wasSel, dbl) {
      const S = T.S;
      if (!tg || !T.mine()) return;
      if (tg.k === 'cup') return void T.act({ t: 'roll' });
      if (tg.k === 'cube') { if (bgCanDouble(S, T.me)) { T.act({ t: 'dbl' }); } return; }
      if (S.phase !== 'move' || S.turn !== T.me) return;
      const d = dOf(tg);
      if (d < 0) return;
      if (V.sel !== null && V.reach.has(d)) return go(V.reach.get(d));
      if (d >= 1 && V.legal.some(m => m.f === d)) {
        if (dbl) return autoMove(d);
        return setSel(wasSel && V.sel === d && d !== 25 ? null : d);
      }
      setSel(null);
    }
    function wire(cvs) {
      cvs.addEventListener('pointerdown', e => {
        if (e.button > 0 || !e.isPrimary || T.overUp()) return;
        e.preventDefault();
        const p = view.local(e), tg = target(p), d = dOf(tg), wasSel = V.sel === d;
        let src = null;
        if (T.mine() && T.S.phase === 'move' && T.S.turn === T.me && d >= 1 && !(V.sel !== null && V.reach.has(d)) && V.legal.some(m => m.f === d)) {
          src = d;
          if (V.sel !== d) setSel(d);
        }
        V.down = { id: e.pointerId, tg, x0: p.x, y0: p.y, src, wasSel, moved: false };
        V.drag = null;
        try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
        V.dirty = true;
      });
      cvs.addEventListener('pointermove', e => {
        const p = view.local(e), dn = V.down;
        if (dn && dn.id === e.pointerId) {
          if (!dn.moved && Math.hypot(p.x - dn.x0, p.y - dn.y0) > 8) dn.moved = true;
          if (dn.moved && dn.src !== null) V.drag = { x: p.x, y: p.y, f: dn.src };
          V.dirty = true;
          return;
        }
        const tg = target(p), d = dOf(tg);
        const act = tg && T.S && T.mine() && (tg.k === 'cup' || (tg.k === 'cube' && bgCanDouble(T.S, T.me)) || (T.S.phase === 'move' && T.S.turn === T.me && (d >= 1 && V.legal.some(m => m.f === d) || (V.sel !== null && V.reach.has(d)))));
        const cur = act ? 'pointer' : 'default';
        if (cvs.style.cursor !== cur) cvs.style.cursor = cur;
        const hv = tg && tg.k === 'pt' && act ? tg.q : null;
        if (hv !== V.hover) { V.hover = hv; V.dirty = true; }
      });
      const up = e => {
        const dn = V.down;
        if (!dn || dn.id !== e.pointerId) return;
        V.down = null; V.drag = null; V.dirty = true;
        if (e.type !== 'pointerup') return;
        const p = view.local(e), tg = target(p);
        if (dn.moved && dn.src !== null) {
          const d = dOf(tg);
          if (V.sel !== null && V.reach.has(d)) go(V.reach.get(d));
          return;
        }
        const tm = now(), d0 = dOf(dn.tg), dbl = V.tap && V.tap.d === d0 && tm - V.tap.t < 380 && d0 >= 1;
        V.tap = { d: d0, t: tm };
        if (dn.moved) return;
        if (dn.src !== null && dn.wasSel && !dbl && dn.src !== 25) return setSel(null);
        press(dn.tg, false, dbl);
      };
      cvs.addEventListener('pointerup', up);
      cvs.addEventListener('pointercancel', up);
      cvs.addEventListener('pointerleave', () => { if (V.hover !== null) { V.hover = null; V.dirty = true; } });
      cvs.addEventListener('contextmenu', e => e.preventDefault());
    }

    function onKey(e) {
      if (!T || !T.S || T.overUp() || e.ctrlKey || e.metaKey || e.altKey || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
      const S = T.S, me = T.me, mine = T.mine();
      const k = e.code;
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
        const c = cands();
        if (!c.length) return;
        e.preventDefault();
        const dir = k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 1;
        V.kf = V.kf < 0 ? (dir > 0 ? 0 : c.length - 1) : (V.kf + dir + c.length) % c.length;
        V.dirty = true; return;
      }
      if (k === 'Space' || k === 'Enter' || k === 'NumpadEnter') {
        if (!mine) return;
        e.preventDefault();
        if (S.phase === 'open' || (S.phase === 'roll' && S.turn === me)) return void T.act({ t: 'roll' });
        if (S.phase === 'offer') return void T.act({ t: 'take' });
        if (S.phase === 'move' && S.turn === me) {
          if (!V.legal.length) return void T.act({ t: 'end' });
          const c = cands();
          if (V.kf < 0 || V.kf >= c.length) { V.kf = 0; V.dirty = true; return; }
          const d = c[V.kf];
          if (V.sel === null) { setSel(d); V.kf = 0; } else if (V.reach.has(d)) go(V.reach.get(d));
        }
        return;
      }
      if (e.repeat) return;
      if (k === 'KeyU' || k === 'Backspace') {
        if (S.phase === 'offer' && mine && k === 'Backspace') return void T.act({ t: 'drop' });
        if (mine && S.phase === 'move' && S.stack.length) { e.preventDefault(); T.act({ t: 'undo' }); }
      } else if (k === 'KeyD') { if (mine && bgCanDouble(S, me)) T.act({ t: 'dbl' }); }
      else if (k === 'KeyR') { if (mine && (S.phase === 'roll' || S.phase === 'open')) T.act({ t: 'roll' }); }
      else if (k === 'KeyT') { if (mine && S.phase === 'offer') T.act({ t: 'take' }); }
      else if (k === 'KeyP') { if (mine && S.phase === 'offer') T.act({ t: 'drop' }); }
    }

    function nameOf(s) { return T.name(s); }
    function leftStr(S) { return S.left.slice().sort((a, b) => b - a).join(' · '); }
    function refresh(T0) {
      const S = T.S, D = T.D, me = T.me, opp = 1 - me, P = PO(S);
      const k = sk(S) + ':' + me;
      if (V.lk !== k) {
        V.lk = k;
        V.legal = S.phase === 'move' && S.turn === me ? bgLegal(P, me, S.left) : [];
        if (V.sel !== null && !V.legal.some(m => m.f === V.sel)) { V.sel = null; V.reach = new Map(); }
        if (V.sel === null && V.legal.length && S.bar[me] > 0 && T.mine()) setSel(25);
        else if (V.sel !== null) V.reach = reachFrom(V.sel);
        V.kf = -1;
      }
      V.dirty = true;
      const mine = T.mine(), over = S.phase === 'over';
      const sub = s => `Pips <em>${bgPips(P, s)}</em>${S.len > 1 ? ` · ${S.score[s]}/${S.len}` : ''}${S.cube.own === s ? ' · cube' : ''}`;
      D.card(0, { name: 'You', chip: 'radial-gradient(circle at 35% 30%,#fffaf0,#cdbb97)', sub: sub(me), on: !over && (S.phase === 'offer' ? S.offer === me : S.turn === me) });
      D.card(1, { name: nameOf(opp), chip: 'radial-gradient(circle at 35% 30%,#5d534b,#14100d)', sub: sub(opp), on: !over && (S.phase === 'offer' ? S.offer === opp : S.turn === opp) });
      let st = '', cls = '';
      const cw = S.crawford && S.phase !== 'over' ? 'Crawford game, no doubling · ' : '';
      if (S.phase === 'open') { st = mine ? (S.tie ? 'Tie, roll again' : 'Roll to see who starts') : 'Opening roll…'; cls = mine ? 'turn' : ''; }
      else if (S.phase === 'roll') {
        if (S.turn === me) { st = cw + (bgCanDouble(S, me) ? 'Your roll, or double first' : 'Your roll'); cls = 'turn'; }
        else st = cw + nameOf(opp) + ' to roll';
      } else if (S.phase === 'move') {
        if (S.turn === me) {
          if (!V.legal.length) { st = S.mvs.length ? 'Turn complete' : 'No legal move'; cls = S.mvs.length ? 'turn' : 'warn'; }
          else { st = 'Play ' + leftStr(S); cls = 'turn'; }
        } else st = nameOf(opp) + ' is moving…';
      } else if (S.phase === 'offer') {
        if (S.offer === opp) { st = nameOf(opp) + ' doubles to ' + S.cube.v * 2 + '. Take or drop?'; cls = 'warn'; }
        else st = 'Waiting for ' + nameOf(opp) + ' to answer your double…';
      } else if (over) {
        const r = S.res;
        st = (r.w === me ? 'You win ' : nameOf(r.w) + ' wins ') + r.pts + (r.pts === 1 ? ' point' : ' points');
        cls = r.w === me ? 'win' : 'loss';
        if (S.rdy[me]) { st = 'Waiting for ' + nameOf(opp) + '…'; cls = ''; }
        else if (S.matchW < 0) st += ' · next game';
      }
      D.st(st, cls);
      const b = [];
      if (S.phase === 'open' && mine) b.push(['Roll', 'roll', { hot: 1 }]);
      if (S.phase === 'roll' && S.turn === me && mine) {
        b.push(['Roll', 'roll', { hot: 1 }]);
        if (bgCanDouble(S, me)) b.push(['Double to ' + S.cube.v * 2, 'dbl', { ghost: 1 }]);
      }
      if (S.phase === 'offer' && S.offer === opp && mine) b.push(['Take', 'take', { hot: 1 }], ['Drop', 'drop', { ghost: 1 }]);
      if (S.phase === 'move' && S.turn === me && mine) {
        if (!V.legal.length) b.push(['Done', 'end', { hot: 1 }]);
        if (S.stack.length) b.push(['Undo', 'bundo', { ghost: 1 }]);
      }
      if (over && S.rdy[me] === false && !T.overUp()) b.push([S.matchW >= 0 ? (T.online() ? 'Rematch' : 'Play again') : 'Next game', 'next', { hot: 1 }]);
      if (T.online() && !over && S.phase !== 'open') b.push([V.sure ? 'Sure?' : 'Resign', 'resign', { ghost: 1 }]);
      if (T.mode === 'cpu') b.push(['New game', 'new', { ghost: 1 }]);
      if (T.online()) { if (T.role === 'host') b.push(['Lobby', 'lobby', { ghost: 1 }]); b.push(['Leave', 'leave', { ghost: 1 }]); }
      D.btns(b.slice(0, 5));
      D.log(S.log.length ? S.log.slice(-14).map((l, i, a) => {
        const who = l.s === me ? 'You' : nameOf(l.s);
        return l.t === 'res' ? `<p><em>${esc(who)}</em><span class="cur">${l.x} · ${l.p} pt</span></p>` : `<p><em>${esc(who)}</em><span${i === a.length - 1 ? ' class="cur"' : ''}>${l.d[0]}-${l.d[1]} ${esc(l.m)}</span></p>`;
      }).join('') : '');
      if (mine && S.phase === 'move' && S.turn === me && !V.legal.length) {
        if (V.endK !== k) {
          V.endK = k; clearTimeout(V.endT);
          V.endT = T.later(() => {
            const S2 = T.S;
            if (!S2 || sk(S2) + ':' + T.me !== k || !T.mine() || S2.phase !== 'move') return;
            if (bgLegal(PO(S2), T.me, S2.left).length) return;
            T.act({ t: 'end' });
          }, S.mvs.length ? 1100 : 1600);
        }
      } else V.endK = '';
    }

    function drawMarks(c, tm) {
      const S = T.S, pul = .5 + .5 * Math.sin(tm / 260);
      for (const m of V.last) { for (const p of [m.f, m.t]) { if (p >= 1 && p <= 24) { bgTri(c, m.s === T.me ? p : 25 - p, 30); c.fillStyle = 'rgba(255,240,200,.09)'; c.fill(); } } }
      if (V.hover !== null && V.hover !== V.sel) { bgTri(c, V.hover, 30); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill(); }
      if (V.sel !== null) {
        if (V.sel >= 1 && V.sel <= 24) { bgTri(c, V.sel, 30); c.fillStyle = 'rgba(255,214,102,.3)'; c.fill(); c.strokeStyle = 'rgba(255,214,102,.9)'; c.lineWidth = 2.5; c.stroke(); }
        else if (V.sel === 25) { rr(c, 408, 326, 48, 288, 8); c.fillStyle = 'rgba(255,214,102,.22)'; c.fill(); c.strokeStyle = 'rgba(255,214,102,.9)'; c.lineWidth = 2.5; c.stroke(); }
        for (const [d, ch] of V.reach) {
          const one = ch.length === 1, col = one ? '124,224,150' : '255,196,90';
          if (d >= 1) {
            bgTri(c, d, 30); c.fillStyle = `rgba(${col},${.2 + .12 * pul})`; c.fill(); c.strokeStyle = `rgba(${col},.85)`; c.lineWidth = 2; c.stroke();
            const sp = bgSlot(d, Math.min(4, Math.max(0, bgCnt(PO(S), T.me, d))));
            c.fillStyle = `rgba(${col},${.55 + .3 * pul})`; c.beginPath(); c.arc(sp.x, sp.y, 9, 0, 7); c.fill();
            c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5; c.stroke();
          } else {
            rr(c, 862, 390, 96, 222, 8); c.fillStyle = `rgba(${col},${.16 + .12 * pul})`; c.fill(); c.strokeStyle = `rgba(${col},.85)`; c.lineWidth = 2.5; c.stroke();
          }
        }
      }
      const cl = cands();
      if (V.kf >= 0 && V.kf < cl.length) {
        const d = cl[V.kf];
        c.save(); c.setLineDash([7, 5]); c.strokeStyle = '#fff'; c.lineWidth = 3;
        if (d >= 1 && d <= 24) bgTri(c, d, 30); else if (d === 25) { c.beginPath(); c.rect(408, 326, 48, 288); } else { c.beginPath(); c.rect(862, 390, 96, 222); }
        c.stroke(); c.restore();
      }
    }
    function drawStacks(c, tm) {
      const S = T.S, me = T.me, pend = {}, ghosts = [], flying = [];
      for (const f of V.fl) {
        const k = f.s + ':' + f.t;
        if (tm < f.t0 + f.dur) { pend[k] = (pend[k] || 0) + 1; if (tm < f.t0) { if (f.ghost) ghosts.push(f); } else flying.push(f); }
      }
      const dragF = V.drag ? V.drag.f : -1;
      for (const s of [me, 1 - me]) {
        const col = colOf(s);
        for (let p = 1; p <= 24; p++) {
          let n = cnt(S, s, p) - (pend[s + ':' + p] || 0);
          if (s === me && p === dragF) n--;
          if (n <= 0) continue;
          const m = Math.min(n, 5);
          for (let k = 0; k < m; k++) { const q = slot(s, p, k); bgChk(c, q.x, q.y, col); }
          if (n > 5) { const q = slot(s, p, 4); lab(c, String(n), q.x, q.y, '900 22px Georgia,serif', BG_CHK[col].ink); }
        }
        let nb = S.bar[s] - (pend[s + ':25'] || 0);
        if (s === me && dragF === 25) nb--;
        for (let k = 0; k < Math.min(nb, 5); k++) { const q = slot(s, 25, k); bgChk(c, q.x, q.y, col); }
        if (nb > 5) { const q = slot(s, 25, 4); lab(c, String(nb), q.x, q.y, '900 22px Georgia,serif', BG_CHK[col].ink); }
        const no = S.off[s] - (pend[s + ':0'] || 0);
        for (let k = 0; k < no; k++) { const q = slot(s, 0, k); bgFlat(c, q.x, q.y, col); }
      }
      for (const f of ghosts) bgChk(c, f.a.x, f.a.y, colOf(f.s));
      for (const f of flying) {
        const p = clamp01((tm - f.t0) / f.dur), e = easeIO(p);
        const x = lerp(f.a.x, f.b.x, e), y = lerp(f.a.y, f.b.y, e) - Math.sin(p * Math.PI) * 26;
        if (f.t === 0) { bgFlat(c, x, y, colOf(f.s)); } else bgChk(c, x, y, colOf(f.s));
      }
      if (V.drag) bgChk(c, V.drag.x, V.drag.y - 8, 0);
    }
    function lab(c, s, x, y, font, fill) {
      c.save(); c.translate(x, y); if (view.rot) c.rotate(-Math.PI / 2);
      c.font = font; c.fillStyle = fill; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 1); c.restore();
    }
    function drawDice(c, tm) {
      const S = T.S, left = S.left ? S.left.slice() : [];
      const used = [];
      if (S.phase === 'move' && S.dice) {
        if (S.dice[0] === S.dice[1]) { const u = 4 - left.length; used[0] = u >= 1; used[1] = u >= 2; }
        else { const l = left.slice(); for (let i = 0; i < 2; i++) { const j = l.indexOf(S.dice[i]); if (j >= 0) l.splice(j, 1); else used[i] = true; } }
      }
      let any = false;
      for (const d of V.dice) {
        const sg = d.segs[d.segs.length - 1];
        if (tm < sg.t0 + sg.dur) any = true;
        const st = dieAt(d, tm); if (!st) continue;
        bgDie(c, st.x, st.y, st.v, colOf(d.s), st.a, 1 + st.z / 120, used[d.i] ? .38 : 1);
      }
      if (S.phase === 'move' && S.dice && S.dice[0] === S.dice[1] && V.dice.length && !any) {
        const h = halfC(S.turn);
        lab(c, '× ' + left.length, h.x, h.y + 46, '800 17px var(--sans),system-ui,sans-serif', 'rgba(255,240,205,.85)');
      }
      return any;
    }
    function drawCup(c, tm) {
      const S = T.S, cp = V.cup;
      if (cp) {
        const t = tm - cp.t0, h = halfC(cp.s);
        if (t < cp.dur) {
          const sh = Math.sin(t / 38) * 7 * (1 - t / cp.dur * .3);
          bgCup(c, h.x + sh, h.y - 12 + Math.cos(t / 31) * 4, Math.sin(t / 53) * .22, 1, 0);
        } else if (t < cp.dur + 520) {
          const p = (t - cp.dur) / 520, e = easeOut(p), dir = cp.s === T.me ? 1 : -1;
          bgCup(c, h.x + dir * e * 34, h.y - 12 - e * 8, dir * e * 1.5, 1 - p, 0);
        } else V.cup = null;
        return true;
      }
      const prompt = T.mine() && (S.phase === 'open' || (S.phase === 'roll' && S.turn === T.me));
      if (prompt) {
        const h = halfC(T.me), pul = .5 + .5 * Math.sin(tm / 300);
        bgCup(c, h.x, h.y - 6 + Math.sin(tm / 450) * 2, -.06, 1, .5 + .5 * pul);
        lab(c, 'ROLL', h.x, h.y + 58, '900 15px var(--sans),system-ui,sans-serif', 'rgba(255,224,150,.95)');
        return true;
      }
      if (S.phase === 'roll' && S.turn !== T.me && !V.dice.length) {
        const h = halfC(S.turn);
        bgCup(c, h.x, h.y - 6, 0, .55, 0);
      }
      return false;
    }
    function drawCubeAll(c, dt) {
      const S = T.S, tg = cubeTarget();
      const dv = tg - V.cube;
      if (Math.abs(dv) > .004) V.cube += dv * Math.min(1, dt * 9); else V.cube = tg;
      const y = 320 + V.cube * 40;
      const v = S.phase === 'offer' ? S.cube.v * 2 : S.cube.own === -1 && S.cube.v === 1 ? 64 : S.cube.v;
      const can = T.mine() && bgCanDouble(S, T.me) && S.phase === 'roll';
      bgCube(c, 910, y, v, S.phase === 'offer' ? 1 : S.cube.own === -1 && S.cube.v === 1 ? .8 : 1, S.phase === 'offer' ? 1 : can ? .6 + .4 * Math.sin(now() / 280) : 0, view.rot);
      return Math.abs(dv) > .004 || can || S.phase === 'offer';
    }

    function draw(dt) {
      const tm = now(), S = T.S;
      view.check();
      for (let i = V.fl.length - 1; i >= 0; i--) if (tm >= V.fl[i].t0 + V.fl[i].dur) V.fl.splice(i, 1);
      const c = view.begin();
      if (!V.img) V.img = bgBoardImg();
      c.drawImage(V.img, 0, 0, BGW, BGH);
      drawMarks(c, tm);
      drawStacks(c, tm);
      let an = V.fl.length > 0;
      an = drawDice(c, tm) || an;
      an = drawCup(c, tm) || an;
      an = drawCubeAll(c, dt) || an;
      if (V.sel !== null || V.drag) an = true;
      view.end();
      V.anim = an;
    }

    const G = {
      title: 'Backgammon',
      create: T0 => bgNew(T0, null),
      apply: (T0, seat, i) => bgApply(T0, seat, i),
      toAct: T0 => { const S = T0.S; return S.phase === 'open' ? [0, 1] : S.phase === 'roll' || S.phase === 'move' ? [S.turn] : S.phase === 'offer' ? [1 - S.offer] : []; },
      cpu: (T0, seat) => {
        const S = T0.S, lv = T0.opt.diff | 0;
        if (S.phase === 'open') return { t: 'roll' };
        if (S.phase === 'offer') return { t: bgTakes(S, seat, lv) ? 'take' : 'drop' };
        if (S.phase === 'roll') return bgCubeWanted(S, seat, lv) ? { t: 'dbl' } : { t: 'roll' };
        const P = PO(S), lg = bgLegal(P, seat, S.left);
        if (!lg.length) return { t: 'end' };
        const key = S.game + ':' + S.log.length + ':' + S.dice.join('');
        if (V.planK !== key) { V.planK = key; V.plan = S.mvs.length ? [] : bgChoose(S, seat, lv); }
        const pm = V.plan[S.mvs.length];
        if (pm && lg.some(m => m.f === pm.f && m.d === pm.d)) return { t: 'mv', f: pm.f, d: pm.d };
        let best = null, bv = -1e9;
        for (const m of lg) { const P2 = bgCopy(P); bgDo(P2, seat, m); const v = bgEval(P2, seat, true); if (v > bv) { bv = v; best = m; } }
        return { t: 'mv', f: best.f, d: best.d };
      },
      wait: (T0, seat) => {
        const S = T0.S;
        if (S.phase === 'open') return 1700;
        if (S.phase === 'offer') return 1300;
        if (S.phase === 'roll') return 800;
        return S.mvs.length ? 430 : 650;
      },
      busyUntil: () => Math.max(V.busy, diceEnd()),
      result: T0 => {
        const S = T0.S;
        if (S.phase !== 'over' || !S.res) return null;
        const r = S.res, me = T0.me, win = r.w === me, opp = T0.name(1 - me), fin = S.matchW >= 0;
        const kind = r.kind === 'drop' ? (win ? opp + ' dropped the double' : 'You dropped the double') : r.kind === 'resign' ? (win ? opp + ' resigned' : 'You resigned') : r.mult === 3 ? 'Backgammon' : r.mult === 2 ? 'Gammon' : 'Single game';
        return {
          w: r.w, final: fin,
          kicker: fin ? (win ? 'Match won' : 'Match lost') : (win ? 'Game won' : 'Game lost'),
          title: (win ? 'You win ' : opp + ' wins ') + r.pts + (r.pts === 1 ? ' point' : ' points'),
          text: kind + (S.len > 1 ? `. Match score ${S.score[me]} to ${S.score[1 - me]}, first to ${S.len}.` : '.') + (S.nextCrawford ? ' Next is the Crawford game: no doubling.' : ''),
          stats: [['Points', r.pts], ['Cube', r.v], ['Score', S.score[me] + ' - ' + S.score[1 - me]]]
        };
      },
      events: (T0, ev) => {
        const S = T0.S;
        for (const e of ev) {
          if (e.k === 'new' || e.k === 'sync') resetView(e.k === 'sync');
          else if (e.k === 'open') onOpen(e);
          else if (e.k === 'roll') { V.last = V.last.filter(m => m.s !== e.s); onRoll(e.s, e.d); }
          else if (e.k === 'mv') onMove(e);
          else if (e.k === 'undo') { V.fl = []; V.busy = 0; V.turnMv.pop(); T0.snd.pop(); setSel(null); }
          else if (e.k === 'turn') {
            V.last = V.turnMv.slice(); V.turnMv = []; V.dice = []; V.cup = null; setSel(null);
            if (V.last.length && V.last[0].s === T0.me) V.last = [];
          }
          else if (e.k === 'dbl') { T0.snd.cube(); V.cup = null; }
          else if (e.k === 'take') { T0.snd.cube(); }
          else if (e.k === 'over') { V.sel = null; V.reach = new Map(); }
          else if (e.k === 'rdy') T0.snd.pop();
        }
        V.dirty = true;
      },
      refresh,
      canRestart: T0 => T0.S.log.length === 0 && T0.S.phase !== 'over' && T0.S.game === 1,
      started: T0 => T0.S.phase !== 'open',
      btn: (T0, id) => {
        const S = T0.S;
        T0.snd.pop();
        if (id === 'bundo') return T0.act({ t: 'undo' });
        if (id === 'resign') {
          if (!V.sure) { V.sure = true; refresh(); T0.later(() => { V.sure = false; refresh(); }, 2600); return; }
          V.sure = false; return T0.act({ t: 'resign' });
        }
        if (id === 'next') return T0.act({ t: 'next' });
        T0.act({ t: id });
      }
    };

    const cfg = {
      segs: [
        { k: 'diff', lab: 'Difficulty', vals: [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], def: 1 },
        { k: 'match', lab: 'Match length', vals: [[1, '1 pt'], [3, '3 pts'], [5, '5 pts'], [7, '7 pts']], def: 3 }
      ],
      btns: 5, log: true
    };
    T = table(api, root, G, cfg);
    view = mkView(api, root, T.box, BGW, BGH, true);
    cvsList = view.canvases;
    cvsList.forEach(wire);
    api.on(window, 'keydown', onKey);
    api.loop(dt => { if (V.dirty || V.anim || view.check()) { V.dirty = false; draw(dt); } });
    T.start();
  }

  const maOwn = s => 6 + 7 * s;
  const maOpp = j => 12 - j;
  function maSow(P, s, p) {
    const idx = 7 * s + p, skip = maOwn(1 - s), own = maOwn(s);
    let n = P[idx], i = idx, last = idx;
    const path = [];
    P[idx] = 0;
    while (n > 0) {
      i = (i + 1) % 14;
      if (i === skip) continue;
      P[i]++; n--; path.push(i); last = i;
    }
    let cap = null;
    if (last !== own && last >= 7 * s && last <= 7 * s + 5 && P[last] === 1 && P[maOpp(last)] > 0) {
      const o = maOpp(last), tot = P[o] + 1;
      cap = { p: last, o, n: tot };
      P[own] += tot; P[last] = 0; P[o] = 0;
    }
    return { path, cap, extra: last === own, last };
  }
  function maSides(P) {
    let a = 0, b = 0;
    for (let i = 0; i < 6; i++) { a += P[i]; b += P[7 + i]; }
    return [a, b];
  }
  function maSweep(P) {
    const [a, b] = maSides(P);
    if (a && b) return false;
    P[6] += a; P[13] += b;
    for (let i = 0; i < 6; i++) { P[i] = 0; P[7 + i] = 0; }
    return true;
  }
  function maNew(T, prev) {
    const seeds = T.opt.seeds, P = new Array(14).fill(seeds);
    P[6] = 0; P[13] = 0;
    return { pits: P, turn: prev ? 1 - prev.first : 0, first: prev ? 1 - prev.first : 0, phase: 'play', seeds, rdy: [false, false], log: [], res: null, n: 0, last: null };
  }
  function maApply(T, seat, i) {
    const S = T.S;
    if (!i || typeof i.t !== 'string') return null;
    if (i.t === 'next') {
      if (S.phase !== 'over') return null;
      S.rdy[seat] = true;
      if (!S.rdy.every((r, q) => r || T.cpu[q])) return [{ k: 'rdy' }];
      const N = maNew(T, S);
      for (const k of Object.keys(S)) delete S[k];
      Object.assign(S, N);
      return [{ k: 'new', swap: false }];
    }
    if (S.phase !== 'play') return null;
    if (i.t === 'resign') {
      S.phase = 'over';
      S.res = { w: 1 - seat, a: S.pits[6], b: S.pits[13], kind: 'resign' };
      return [{ k: 'over' }];
    }
    if (i.t !== 'mv' || seat !== S.turn || !Number.isInteger(i.p) || i.p < 0 || i.p > 5 || !S.pits[7 * seat + i.p]) return null;
    const P = S.pits, pre = P.slice(), r = maSow(P, seat, i.p);
    S.n++;
    const over = maSweep(P);
    let note = r.extra ? 'extra turn' : r.cap ? 'captures ' + r.cap.n : '';
    S.log.push({ s: seat, p: i.p, n: pre[7 * seat + i.p], x: note });
    const ev = { k: 'sow', s: seat, f: 7 * seat + i.p, path: r.path, cap: r.cap, extra: r.extra && !over, pre, post: P.slice(), over };
    S.last = { s: seat, f: ev.f, end: r.last };
    if (over) {
      S.phase = 'over';
      S.res = { w: P[6] > P[13] ? 0 : P[6] < P[13] ? 1 : -1, a: P[6], b: P[13], kind: 'end' };
    } else if (!r.extra) S.turn = 1 - seat;
    return [ev];
  }

  let MA_T0 = 0, MA_N = 0, MA_STOP = false;
  function maEval(P, root) {
    const ro = maOwn(root), op = maOwn(1 - root);
    const side = root ? 7 : 0, oside = root ? 0 : 7;
    let mine = 0, theirs = 0;
    for (let i = 0; i < 6; i++) { mine += P[side + i]; theirs += P[oside + i]; }
    return (P[ro] - P[op]) + .28 * (mine - theirs);
  }
  function maSearch(P, s, d, al, be, root) {
    if (++MA_N % 512 === 0 && performance.now() > MA_T0) MA_STOP = true;
    if (MA_STOP) return 0;
    const ro = maOwn(root), op = maOwn(1 - root);
    if (d <= 0) return maEval(P, root);
    const maxi = s === root, base = 7 * s, own = maOwn(s);
    let best = maxi ? -1e9 : 1e9, any = false;
    const order = [];
    for (let p = 5; p >= 0; p--) {
      const n = P[base + p];
      if (!n) continue;
      order.push(p);
    }
    order.sort((a, b) => (P[base + b] === 6 - b ? 1 : 0) - (P[base + a] === 6 - a ? 1 : 0));
    for (const p of order) {
      any = true;
      const Q = P.slice(), r = maSow(Q, s, p);
      let v;
      if (maSweep(Q)) { const df = Q[ro] - Q[op]; v = df > 0 ? 100 + df : df < 0 ? -100 + df : 0; }
      else v = maSearch(Q, r.extra ? s : 1 - s, r.extra ? d : d - 1, al, be, root);
      if (MA_STOP) return 0;
      if (maxi) { if (v > best) best = v; if (best > al) al = best; } else { if (v < best) best = v; if (best < be) be = best; }
      if (al >= be) break;
    }
    return any ? best : maEval(P, root);
  }
  function maChoose(P0, s, level, ms) {
    const moves = [];
    for (let p = 0; p < 6; p++) if (P0[7 * s + p]) moves.push(p);
    if (moves.length <= 1) return moves[0];
    if (level === 0) {
      if (Math.random() < .3) return moves[Math.random() * moves.length | 0];
    }
    const depthCap = level === 0 ? 3 : level === 1 ? 5 : 30, budget = level === 0 ? 40 : level === 1 ? 90 : (ms || 420);
    let best = moves[0], bestV = -1e9;
    const t0 = performance.now();
    MA_T0 = t0 + budget;
    let scores = moves.map(() => 0);
    for (let d = 1; d <= depthCap; d++) {
      MA_STOP = false; MA_N = 0;
      let curBest = -1, curV = -1e9, al = -1e9;
      const sc = [];
      for (const p of moves) {
        const Q = P0.slice(), r = maSow(Q, s, p);
        let v;
        if (maSweep(Q)) { const df = Q[maOwn(s)] - Q[maOwn(1 - s)]; v = df > 0 ? 100 + df : df < 0 ? -100 + df : 0; }
        else v = maSearch(Q, r.extra ? s : 1 - s, r.extra ? d : d - 1, -1e9, 1e9, s);
        if (MA_STOP) { curBest = -2; break; }
        v += (level === 0 ? (Math.random() - .5) * 5 : level === 1 ? (Math.random() - .5) * .8 : Math.random() * .01);
        sc.push(v);
        if (v > curV) { curV = v; curBest = p; }
      }
      if (curBest === -2) break;
      best = curBest; bestV = curV; scores = sc;
      if (Math.abs(bestV) >= 100) break;
      if (performance.now() > MA_T0) break;
    }
    return best;
  }

  const MW = 960, MH = 450;
  const MA_COL = ['#d6573a', '#e9ab3a', '#3fa7a0', '#7467cc', '#e6dfcf', '#c4466c', '#5b9b4a'];
  const maPitX = i => 205 + 110 * i;
  const maPos = v => v <= 5 ? { x: maPitX(v), y: 310, rx: 37, ry: 37 } : v === 6 ? { x: 878, y: 225, rx: 40, ry: 150, st: 1 } : v <= 12 ? { x: maPitX(12 - v), y: 140, rx: 37, ry: 37 } : { x: 82, y: 225, rx: 40, ry: 150, st: 1 };
  const maStep = n => { for (const t of [4, 6, 8, 12, 16, 24, 32, 48, 72]) if (n <= t) return t; return 110; };
  const maSeedAt = (n, k, rx, ry) => {
    const N = maStep(n), rho = Math.sqrt((k + .5) / N), th = k * 2.39996323 + .7, sr = Math.min(13, Math.sqrt(.5 * rx * ry / N));
    return { x: Math.cos(th) * rho * (rx - sr * .5), y: Math.sin(th) * rho * (ry - sr * .5), r: sr };
  };
  const maHash = (a, k) => (a * 3 + k * 5 + (a * k) % 4) % 7;
  function maSeed(c, x, y, r, col, al) {
    c.save(); if (al !== undefined) c.globalAlpha = al;
    c.fillStyle = 'rgba(0,0,0,.38)'; c.beginPath(); c.ellipse(x + r * .22, y + r * .42, r * .95, r * .7, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(x - r * .38, y - r * .42, r * .1, x, y, r * 1.05);
    g.addColorStop(0, '#fff'); g.addColorStop(.22, col); g.addColorStop(1, 'rgba(0,0,0,.65)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = col; c.globalCompositeOperation = 'multiply'; c.globalAlpha = (al === undefined ? 1 : al) * .35; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.restore();
    c.save(); c.globalAlpha = (al === undefined ? 1 : al) * .7; c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(x - r * .35, y - r * .4, r * .26, r * .16, -.7, 0, 7); c.fill(); c.restore();
  }
  function maBoardImg() {
    const dpr = dprOf(), cv = cnv(MW * dpr, MH * dpr), c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const rand = rng(1717);
    c.save(); rr(c, 0, 0, MW, MH, 30); c.clip();
    grain(c, 0, 0, MW, MH, '#7a4a22', ['#5a3216', '#9a6532', '#6a3d1a', '#b07a3e'], rand, false);
    knots(c, 0, 0, MW, MH, rand, 7, '#4a2810');
    const vg = c.createLinearGradient(0, 0, 0, MH);
    vg.addColorStop(0, 'rgba(255,230,180,.28)'); vg.addColorStop(.1, 'rgba(255,230,180,0)'); vg.addColorStop(.9, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)');
    c.fillStyle = vg; c.fillRect(0, 0, MW, MH);
    c.restore();
    rr(c, 1.5, 1.5, MW - 3, MH - 3, 29); c.strokeStyle = 'rgba(40,20,5,.7)'; c.lineWidth = 3; c.stroke();
    c.save(); rr(c, 20, 20, MW - 40, MH - 40, 22); c.clip();
    grain(c, 20, 20, MW - 40, MH - 40, '#8c5a2b', ['#6a3f1b', '#a87036', '#7a4a22', '#bb8444'], rand, false);
    const sh = c.createLinearGradient(0, 20, 0, MH - 20);
    sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(.12, 'rgba(0,0,0,0)'); sh.addColorStop(.88, 'rgba(255,220,170,0)'); sh.addColorStop(1, 'rgba(255,220,170,.18)');
    c.fillStyle = sh; c.fillRect(20, 20, MW - 40, MH - 40);
    c.restore();
    rr(c, 20, 20, MW - 40, MH - 40, 22); c.strokeStyle = 'rgba(30,14,3,.75)'; c.lineWidth = 2.5; c.stroke();
    const well = (x, y, rx, ry) => {
      c.save();
      c.fillStyle = 'rgba(255,225,170,.28)'; c.beginPath(); c.ellipse(x + 1.5, y + 2.5, rx + 5, ry + 5, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(20,8,0,.55)'; c.beginPath(); c.ellipse(x - 1.5, y - 2, rx + 5, ry + 5, 0, 0, 7); c.fill();
      const g = c.createRadialGradient(x - rx * .25, y - ry * .3, Math.min(rx, ry) * .1, x, y, Math.max(rx, ry) * 1.05);
      g.addColorStop(0, '#3b2111'); g.addColorStop(.7, '#2a160a'); g.addColorStop(1, '#4a2b15');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx + 3, ry + 3, 0, 0, 7); c.fill();
      c.restore();
    };
    for (let v = 0; v < 14; v++) { const p = maPos(v); if (p.st) { c.save(); rr(c, p.x - 52, p.y - 168, 104, 336, 52); c.fillStyle = 'rgba(255,225,170,.25)'; c.fill(); c.restore(); well(p.x, p.y, 44, 160); } else well(p.x, p.y, 46, 46); }
    return cv;
  }

  function maGame(api, root) {
    const V = { vis: new Array(14).fill(0), ops: [], fl: [], busy: 0, hover: -1, kf: -1, banner: null, dirty: true, anim: false, img: null, dock: false, hist: [] };
    let T = null, view = null;
    const vidx = a => (a + 7 * T.me) % 14;
    const cpos = a => maPos(vidx(a));
    const own = s => maOwn(s);

    function reset() {
      V.vis = T.S.pits.slice(); V.ops = []; V.fl = []; V.busy = 0; V.banner = null; V.kf = -1; V.dirty = true;
    }
    function landing(P, s, p) {
      const idx = 7 * s + p, skip = maOwn(1 - s);
      let n = P[idx], i = idx;
      while (n > 0) { i = (i + 1) % 14; if (i === skip) continue; n--; }
      return i;
    }
    function sow(e) {
      const tm = now(), t0 = Math.max(tm, V.busy), n = e.path.length, dt = clamp(2200 / Math.max(n, 1), 105, 200);
      let t = t0;
      const op = (at, f) => V.ops.push({ at, f });
      op(t, () => { V.vis = e.pre.slice(); V.vis[e.f] = 0; T.snd.slide(); V.dock = true; });
      t += 260;
      let prev = e.f;
      e.path.forEach((a, i) => {
        const from = prev, at = t + i * dt;
        op(at, () => V.fl.push({ a: cpos(from), b: cpos(a), t0: at, dur: dt * 1.05, idx: a, left: n - i - 1 }));
        prev = a;
      });
      t += (n - 1) * dt + dt * 1.05 + 70;
      const st = own(e.s);
      if (e.cap) {
        op(t, () => {
          const c = e.cap, tot = V.vis[c.p] + V.vis[c.o];
          T.snd.take();
          for (let k = 0; k < tot; k++) { const src = k < V.vis[c.p] ? c.p : c.o; V.fl.push({ a: cpos(src), b: cpos(st), t0: now() + k * 42, dur: 420, idx: st, left: -1, cap: 1 }); }
          V.vis[c.p] = 0; V.vis[c.o] = 0;
        });
        t += e.cap.n * 42 + 520;
      }
      if (e.over) {
        op(t, () => {
          let k = 0;
          for (const a of [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]) {
            const sto = a < 6 ? 6 : 13;
            for (let q = 0; q < V.vis[a]; q++) V.fl.push({ a: cpos(a), b: cpos(sto), t0: now() + (k++) * 38, dur: 420, idx: sto, left: -1, cap: 1 });
            V.vis[a] = 0;
          }
          V.dock = true;
        });
        t += 1300;
      }
      if (e.extra) op(t, () => { V.banner = { t0: now(), text: 'Extra turn' }; T.snd.again(); });
      t += 150;
      op(t, () => { V.vis = e.post.slice(); V.fl = []; V.dock = true; });
      V.busy = t;
    }

    function pitAt(p) {
      for (let i = 0; i < 6; i++) if (Math.abs(p.x - maPitX(i)) < 52 && Math.abs(p.y - 310) < 62) return i;
      return -1;
    }
    function play(pi) {
      const S = T.S;
      if (!T.mine() || S.phase !== 'play' || S.turn !== T.me || now() < V.busy || pi < 0 || !S.pits[7 * T.me + pi]) return;
      V.kf = -1;
      T.act({ t: 'mv', p: pi });
    }
    function wire(cvs) {
      cvs.addEventListener('pointermove', e => {
        const i = pitAt(view.local(e)), S = T.S;
        const ok = i >= 0 && T.mine() && S.phase === 'play' && S.turn === T.me && now() >= V.busy && S.pits[7 * T.me + i] > 0;
        const h = ok ? i : -1;
        cvs.style.cursor = ok ? 'pointer' : 'default';
        if (h !== V.hover) { V.hover = h; V.dirty = true; }
      });
      cvs.addEventListener('pointerleave', () => { if (V.hover !== -1) { V.hover = -1; V.dirty = true; } });
      cvs.addEventListener('pointerdown', e => {
        if (e.button > 0 || !e.isPrimary || T.overUp()) return;
        e.preventDefault();
        const i = pitAt(view.local(e));
        if (e.pointerType === 'touch' || e.pointerType === 'pen') V.hover = -1;
        play(i);
      });
    }
    function onKey(e) {
      if (!T || !T.S || T.overUp() || e.ctrlKey || e.metaKey || e.altKey || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
      const S = T.S, me = T.me, k = e.code;
      const has = p => S.pits[7 * me + p] > 0;
      const dg = /^(Digit|Numpad)([1-6])$/.exec(k);
      if (dg) { e.preventDefault(); play(+dg[2] - 1); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        const dir = k === 'ArrowLeft' ? -1 : 1;
        let p = V.kf < 0 ? (dir > 0 ? -1 : 6) : V.kf;
        for (let n = 0; n < 6; n++) { p += dir; if (p < 0 || p > 5) p = (p + 6) % 6; if (has(p)) { V.kf = p; V.dirty = true; e.preventDefault(); return; } }
      } else if (k === 'Enter' || k === 'Space' || k === 'NumpadEnter') {
        if (V.kf >= 0) { e.preventDefault(); play(V.kf); }
        else if (T.mine() && S.turn === me) { e.preventDefault(); for (let p = 0; p < 6; p++) if (has(p)) { V.kf = p; V.dirty = true; break; } }
      } else if (e.repeat) return;
      else if (k === 'KeyU') T.undo();
    }

    function refresh() {
      const S = T.S, D = T.D, me = T.me, opp = 1 - me, over = S.phase === 'over', tm = now(), busy = tm < V.busy;
      const vis = busy || V.ops.length ? V.vis : S.pits;
      const side = s => { let n = 0; for (let i = 0; i < 6; i++) n += vis[7 * s + i]; return n; };
      const sub = s => `Store <em>${vis[own(s)]}</em> · on side ${side(s)}`;
      D.card(0, { name: 'You', chip: 'radial-gradient(circle at 35% 30%,#fff,#e9ab3a)', sub: sub(me), on: !over && S.turn === me });
      D.card(1, { name: T.name(opp), chip: 'radial-gradient(circle at 35% 30%,#fff,#3fa7a0)', sub: sub(opp), on: !over && S.turn === opp });
      let st = '', cls = '';
      if (over) {
        const r = S.res, a = S.pits[own(me)], b = S.pits[own(opp)];
        st = r.w < 0 ? `Draw ${a} to ${b}` : r.w === me ? `You win ${a} to ${b}` : `${T.name(r.w)} wins ${b} to ${a}`;
        cls = r.w < 0 ? '' : r.w === me ? 'win' : 'loss';
        if (S.rdy[me]) { st = 'Waiting for ' + T.name(opp) + '…'; cls = ''; }
      } else if (busy) st = S.turn === me ? 'Sowing…' : T.name(opp) + ' is sowing…';
      else if (S.turn === me) { st = S.last && S.last.s === me ? 'Extra turn, move again' : 'Your move'; cls = 'turn'; }
      else st = T.name(opp) + ' to move';
      D.st(st, cls);
      const b = [];
      if (T.mode === 'cpu') { if (T.canUndo()) b.push(['Undo', 'undo', { ghost: 1 }]); b.push(['New game', 'new', { ghost: 1 }]); }
      else {
        if (over && S.rdy[me] === false && !T.overUp()) b.push(['Rematch', 'next', { hot: 1 }]);
        if (!over) b.push([V.sure ? 'Sure?' : 'Resign', 'resign', { ghost: 1 }]);
        if (T.role === 'host') b.push(['Lobby', 'lobby', { ghost: 1 }]);
        b.push(['Leave', 'leave', { ghost: 1 }]);
      }
      D.btns(b);
      D.log(S.log.slice(-12).map((l, i, a) => `<p><em>${l.s === me ? 'You' : esc(T.name(l.s))}</em><span${i === a.length - 1 ? ' class="cur"' : ''}>pit ${l.p + 1} · ${l.n} seed${l.n === 1 ? '' : 's'}${l.x ? ' · ' + l.x : ''}</span></p>`).join(''));
      V.dirty = true;
    }

    function lab(c, s, x, y, font, fill) {
      c.save(); c.translate(x, y); if (view.rot) c.rotate(-Math.PI / 2);
      c.font = font; c.fillStyle = fill; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 1); c.restore();
    }
    function pill(c, x, y, s, bg, ink, w) {
      c.save(); c.translate(x, y); if (view.rot) c.rotate(-Math.PI / 2);
      rr(c, -w / 2, -12, w, 24, 12); c.fillStyle = bg; c.fill(); c.strokeStyle = 'rgba(40,20,5,.55)'; c.lineWidth = 1.2; c.stroke();
      c.font = '900 15px Georgia,serif'; c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(s), 0, 1);
      c.restore();
    }

    function draw() {
      const tm = now(), S = T.S;
      view.check();
      while (V.ops.length && V.ops[0].at <= tm) V.ops.shift().f();
      for (let i = V.fl.length - 1; i >= 0; i--) {
        const f = V.fl[i];
        if (tm >= f.t0 + f.dur) {
          V.vis[f.idx]++; V.fl.splice(i, 1);
          if (f.idx === 6 || f.idx === 13) { T.snd.store(); V.dock = true; } else T.snd.seed();
        }
      }
      if (V.dock) { V.dock = false; refresh(); }
      const busy = tm < V.busy || V.ops.length > 0 || V.fl.length > 0;
      const c = view.begin();
      if (!V.img) V.img = maBoardImg();
      c.drawImage(V.img, 0, 0, MW, MH);
      const mineTurn = T.mine() && S.phase === 'play' && S.turn === T.me && !busy;
      const focus = mineTurn ? (V.kf >= 0 ? V.kf : V.hover) : -1;
      if (mineTurn && focus >= 0 && S.pits[7 * T.me + focus] > 0) {
        const la = landing(S.pits, T.me, focus), lp = vidx(la), pp = maPos(lp), op = maPos(focus), pulse = .5 + .5 * Math.sin(tm / 200);
        const mineSide = la >= 7 * T.me && la <= 7 * T.me + 5, capt = mineSide && la !== 7 * T.me + focus && S.pits[la] === 0 && S.pits[12 - la] > 0;
        c.save(); c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,230,150,.95)';
        c.beginPath(); c.arc(op.x, op.y, 52, 0, 7); c.stroke();
        c.strokeStyle = lp === 6 ? `rgba(120,230,150,${.6 + .4 * pulse})` : capt ? `rgba(255,140,110,${.6 + .4 * pulse})` : 'rgba(255,255,255,.55)'; c.setLineDash([8, 6]); c.lineWidth = 3;
        c.beginPath();
        if (pp.st) c.ellipse(pp.x, pp.y, 52, 162, 0, 0, 7); else c.arc(pp.x, pp.y, 52, 0, 7);
        c.stroke(); c.restore();
      } else if (mineTurn) {
        for (let i = 0; i < 6; i++) if (S.pits[7 * T.me + i] > 0) { const p = maPos(i); c.save(); c.strokeStyle = `rgba(255,230,150,${.25 + .15 * Math.sin(tm / 300 + i)})`; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, 52, 0, 7); c.stroke(); c.restore(); }
      }
      const pend = {};
      for (let v = 0; v < 14; v++) {
        const a = (v + 7 * T.me) % 14, p = maPos(v), n = V.vis[a];
        for (let k = 0; k < n; k++) { const q = maSeedAt(n, k, p.rx - (p.st ? 4 : 0), p.ry - (p.st ? 6 : 0)); maSeed(c, p.x + q.x, p.y + q.y, q.r, MA_COL[maHash(a, k)]); }
      }
      for (const f of V.fl) {
        const p = clamp01((tm - f.t0) / f.dur);
        if (p <= 0 && !f.cap) continue;
        if (p <= 0) continue;
        pend[f.idx] = (pend[f.idx] || 0) + 1;
        const e = easeIO(p), x = lerp(f.a.x, f.b.x, e), y = lerp(f.a.y, f.b.y, e) - Math.sin(p * Math.PI) * 30;
        maSeed(c, x, y, 11, MA_COL[maHash(f.idx, V.vis[f.idx] + pend[f.idx] - 1)]);
        if (f.left >= 0) {
          c.save(); c.translate(x, y - 24); if (view.rot) c.rotate(-Math.PI / 2);
          rr(c, -13, -10, 26, 20, 10); c.fillStyle = 'rgba(30,14,3,.85)'; c.fill();
          c.font = '900 13px Georgia,serif'; c.fillStyle = '#ffe6a6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(f.left + 1), 0, 1);
          c.restore();
        }
      }
      for (let v = 0; v < 14; v++) {
        const a = (v + 7 * T.me) % 14, p = maPos(v), n = V.vis[a];
        if (p.st) pill(c, p.x, 424, n, v === 6 ? '#f1d27a' : '#e8d8b4', '#3a2312', 44);
        else pill(c, p.x, v <= 5 ? 376 : 74, n, v <= 5 ? '#f3e6c8' : '#d3bd94', '#3a2312', 36);
      }
      lab(c, 'YOU', 878, 30, '900 14px var(--sans),system-ui,sans-serif', 'rgba(255,236,190,.85)');
      lab(c, T.name(1 - T.me).toUpperCase().slice(0, 10), 82, 30, '900 14px var(--sans),system-ui,sans-serif', 'rgba(255,236,190,.85)');
      if (V.banner) {
        const q = (tm - V.banner.t0) / 1200;
        if (q >= 1) V.banner = null;
        else {
          const a = q < .15 ? q / .15 : q > .7 ? (1 - q) / .3 : 1;
          c.save(); c.globalAlpha = a; c.translate(480, 225 - q * 12); if (view.rot) c.rotate(-Math.PI / 2);
          rr(c, -110, -26, 220, 52, 26); c.fillStyle = 'rgba(30,14,3,.86)'; c.fill(); c.strokeStyle = '#e9ab3a'; c.lineWidth = 2.5; c.stroke();
          c.font = '900 26px Georgia,serif'; c.fillStyle = '#ffe6a6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(V.banner.text, 0, 2);
          c.restore();
        }
      }
      view.end();
      V.anim = busy || !!V.banner || mineTurn;
    }

    const G = {
      title: 'Mancala',
      create: T0 => maNew(T0, null),
      apply: (T0, seat, i) => maApply(T0, seat, i),
      toAct: T0 => T0.S.phase === 'play' ? [T0.S.turn] : [],
      cpu: (T0, seat) => {
        const p = maChoose(T0.S.pits, seat, T0.opt.diff | 0);
        return { t: 'mv', p };
      },
      wait: () => 750,
      busyUntil: () => V.busy,
      result: T0 => {
        const S = T0.S;
        if (S.phase !== 'over' || !S.res) return null;
        const r = S.res, me = T0.me, a = S.pits[own(me)], b = S.pits[own(1 - me)], opp = T0.name(1 - me);
        return {
          w: r.w,
          title: r.w < 0 ? `Draw, ${a} each` : r.w === me ? `You win ${a} to ${b}` : `${opp} wins ${b} to ${a}`,
          text: r.kind === 'resign' ? (r.w === me ? opp + ' resigned.' : 'You resigned.') : r.w < 0 ? 'A rare dead heat.' : r.w === me ? 'More seeds in your store at the end.' : 'More seeds in their store at the end.',
          stats: [['Your store', a], ['Their store', b], ['Moves', S.n]]
        };
      },
      events: (T0, ev) => {
        for (const e of ev) {
          if (e.k === 'new' || e.k === 'sync') reset();
          else if (e.k === 'sow') sow(e);
          else if (e.k === 'rdy') T0.snd.pop();
          else if (e.k === 'over' && T0.S.res && T0.S.res.kind === 'resign') V.vis = T0.S.pits.slice();
        }
        V.dirty = true;
      },
      refresh,
      canRestart: T0 => T0.S.n === 0 && T0.S.phase === 'play',
      started: T0 => T0.S.n > 0,
      btn: (T0, id) => {
        T0.snd.pop();
        if (id === 'resign') {
          if (!V.sure) { V.sure = true; refresh(); T0.later(() => { V.sure = false; refresh(); }, 2600); return; }
          V.sure = false; T0.act({ t: 'resign' });
        }
      }
    };
    const cfg = {
      segs: [
        { k: 'diff', lab: 'Difficulty', vals: [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], def: 1 },
        { k: 'seeds', lab: 'Seeds per pit', vals: [[4, '6 × 4'], [6, '6 × 6']], def: 4 }
      ],
      btns: 4, log: true, snapUndo: true
    };
    T = table(api, root, G, cfg);
    view = mkView(api, root, T.box, MW, MH, true);
    view.canvases.forEach(wire);
    api.on(window, 'keydown', onKey);
    api.loop(() => { if (V.dirty || V.anim || view.check()) { V.dirty = false; draw(); } });
    T.start();
  }

  const NM_ADJ = (() => {
    const a = Array.from({ length: 24 }, () => []);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) {
      const i = r * 8 + k, nx = r * 8 + (k + 1) % 8;
      a[i].push(nx); a[nx].push(i);
      if (k % 2 === 1 && r < 2) { a[i].push(i + 8); a[i + 8].push(i); }
    }
    return a;
  })();
  const NM_MILLS = (() => {
    const m = [];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) m.push([r * 8 + 2 * q, r * 8 + 2 * q + 1, r * 8 + (2 * q + 2) % 8]);
    for (let k = 1; k < 8; k += 2) m.push([k, 8 + k, 16 + k]);
    return m;
  })();
  const NM_MM = NM_MILLS.map(a => (1 << a[0]) | (1 << a[1]) | (1 << a[2]));
  const NM_OF = Array.from({ length: 24 }, (_, i) => NM_MM.filter(q => q & (1 << i)));
  const NM_DEG = NM_ADJ.map(a => a.length);
  const nmXY = i => {
    const r = i >> 3, k = i & 7, a = r, b = 6 - r;
    const g = [[a, a], [3, a], [b, a], [b, 3], [b, b], [3, b], [a, b], [a, 3]][k];
    return g;
  };
  const nmPop = m => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
  const nmIn = (m, i) => { for (const q of NM_OF[i]) if ((m & q) === q) return true; return false; };
  const nmMillMask = m => { let r = 0; for (const q of NM_MM) if ((m & q) === q) r |= q; return r; };
  const nmMasks = S => { let a = 0, b = 0; for (let i = 0; i < 24; i++) { if (S.b[i] === 0) a |= 1 << i; else if (S.b[i] === 1) b |= 1 << i; } return [a, b]; };

  function nmMoves(me, op, hand) {
    const out = [], all = me | op, fly = hand === 0 && nmPop(me) === 3, om = nmMillMask(op);
    const add = (f, t) => {
      const nm = (f === 24 ? me : me & ~(1 << f)) | (1 << t);
      if (nmIn(nm, t)) {
        let rem = op & ~om;
        if (!rem) rem = op;
        if (!rem) { out.push(f | t << 5 | 31 << 10); return; }
        for (let r = 0; r < 24; r++) if (rem & (1 << r)) out.push(f | t << 5 | r << 10);
      } else out.push(f | t << 5 | 31 << 10);
    };
    if (hand > 0) { for (let t = 0; t < 24; t++) if (!(all & (1 << t))) add(24, t); }
    else if (fly) { for (let f = 0; f < 24; f++) if (me & (1 << f)) for (let t = 0; t < 24; t++) if (!(all & (1 << t))) add(f, t); }
    else for (let f = 0; f < 24; f++) if (me & (1 << f)) for (const t of NM_ADJ[f]) if (!(all & (1 << t))) add(f, t);
    return out;
  }
  function nmMobility(me, op, hand) {
    const all = me | op;
    if (hand === 0 && nmPop(me) === 3) return 18;
    let n = 0;
    for (let f = 0; f < 24; f++) if (me & (1 << f)) for (const t of NM_ADJ[f]) if (!(all & (1 << t))) n++;
    return n;
  }
  function nmEval(me, op, hm, ho) {
    const pm = nmPop(me) + hm, po = nmPop(op) + ho;
    let v = 13 * (pm - po);
    v += 1.3 * (nmMobility(me, op, hm) - nmMobility(op, me, ho));
    let cm = 0, co = 0, tm = 0, to = 0;
    const all = me | op;
    for (const q of NM_MM) {
      const a = me & q, b = op & q;
      if (a === q) cm++; else if (b === q) co++;
      else if (!b && nmPop(a) === 2) tm++;
      else if (!a && nmPop(b) === 2) to++;
    }
    v += 4 * (cm - co) + 5 * tm - 5 * to;
    if (hm + ho > 0) for (let i = 0; i < 24; i++) { const w = NM_DEG[i] === 4 ? 2 : NM_DEG[i] === 3 ? 1.1 : .5; if (me & (1 << i)) v += w; else if (op & (1 << i)) v -= w; }
    return v;
  }

  let NM_TT = new Map(), NM_T0 = 0, NM_N = 0, NM_STOP = false;
  function nmSearch(me, op, hm, ho, d, al, be, ply, q) {
    if (++NM_N % 1024 === 0 && performance.now() > NM_T0) NM_STOP = true;
    if (NM_STOP) return 0;
    if (nmPop(me) + hm < 3) return -1000 + ply;
    const moves = nmMoves(me, op, hm);
    if (!moves.length) return -1000 + ply;
    let stand = -1e9;
    if (d <= 0) {
      stand = nmEval(me, op, hm, ho);
      if (q >= 2 || stand >= be) return stand;
      if (stand > al) al = stand;
    }
    const key = me + ',' + op + ',' + hm + ',' + ho;
    const tt = d > 0 ? NM_TT.get(key) : null;
    let first = -1;
    if (tt) { if (tt.d >= d) { if (tt.f === 0) return tt.v; if (tt.f === 1 && tt.v >= be) return tt.v; if (tt.f === 2 && tt.v <= al) return tt.v; } first = tt.m; }
    const mv = (d <= 0 ? moves.filter(m => (m >> 10) !== 31) : moves).map(m => ({ m, o: (m === first ? 1000 : 0) + ((m >> 10) !== 31 ? 100 : 0) + ((m & 31) === 24 ? NM_DEG[(m >> 5) & 31] : 0) }));
    mv.sort((a, b) => b.o - a.o);
    if (!mv.length) return stand;
    let best = d <= 0 ? stand : -1e9, bm = mv[0].m;
    const al0 = al;
    for (const { m } of mv) {
      const f = m & 31, t = (m >> 5) & 31, r = m >> 10;
      let nm = (f === 24 ? me : me & ~(1 << f)) | (1 << t), no = op;
      if (r !== 31) no = op & ~(1 << r);
      const v = -nmSearch(no, nm, ho, f === 24 ? hm - 1 : hm, d - 1, -be, -al, ply + 1, q + 1);
      if (NM_STOP) return 0;
      if (v > best) { best = v; bm = m; }
      if (v > al) al = v;
      if (al >= be) break;
    }
    if (d <= 0) return best;
    if (NM_TT.size > 400000) NM_TT = new Map();
    NM_TT.set(key, { d, v: best, f: best <= al0 ? 2 : best >= be ? 1 : 0, m: bm });
    return best;
  }
  function nmChoose(S, seat, level, ms) {
    const [m0, m1] = nmMasks(S), me = seat ? m1 : m0, op = seat ? m0 : m1, hm = S.hand[seat], ho = S.hand[1 - seat];
    const moves = nmMoves(me, op, hm);
    if (!moves.length) return null;
    const dec = m => ({ f: (m & 31) === 24 ? -1 : m & 31, t: (m >> 5) & 31, r: (m >> 10) === 31 ? -1 : m >> 10 });
    if (moves.length === 1) return dec(moves[0]);
    if (level === 0 && Math.random() < .3) {
      const mills = moves.filter(m => (m >> 10) !== 31);
      return dec(mills.length && Math.random() < .7 ? mills[Math.random() * mills.length | 0] : moves[Math.random() * moves.length | 0]);
    }
    const cap = level === 0 ? 1 : level === 1 ? 3 : 5, budget = level === 0 ? 40 : level === 1 ? 130 : (ms || 300);
    NM_T0 = performance.now() + budget;
    let best = moves[0], order = moves.slice();
    const seen = S.rep || {};
    for (let d = 1; d <= cap; d++) {
      NM_STOP = false; NM_N = 0;
      let curBest = -1, curV = -1e9, al = -1e9;
      const sc = [];
      for (const m of order) {
        const f = m & 31, t = (m >> 5) & 31, r = m >> 10;
        const nm = (f === 24 ? me : me & ~(1 << f)) | (1 << t), no = r !== 31 ? op & ~(1 << r) : op;
        let v = -nmSearch(no, nm, ho, f === 24 ? hm - 1 : hm, d - 1, -1e9, -al, 1, 0);
        if (NM_STOP) { curBest = -2; break; }
        if (hm === 0 && ho === 0 && Math.abs(v) < 900) {
          const b2 = S.b.slice();
          if (f !== 24) b2[f] = -1;
          b2[t] = seat;
          if (r !== 31) b2[r] = -1;
          if ((seen[b2.map(x => x + 1).join('') + (1 - seat) + '00'] || 0) >= 2) v = Math.min(v, 0) - .5;
        }
        v += level === 0 ? (Math.random() - .5) * 8 : level === 1 ? (Math.random() - .5) * 5 : Math.random() * .01;
        sc.push([m, v]);
        if (v > curV) { curV = v; curBest = m; al = Math.max(al, v - 1e-9); }
      }
      if (curBest === -2) break;
      best = curBest;
      sc.sort((a, b) => b[1] - a[1]);
      order = sc.map(x => x[0]);
      if (Math.abs(curV) >= 900 || performance.now() > NM_T0) break;
    }
    return dec(best);
  }

  function nmNew(T, prev) {
    const first = prev ? 1 - prev.first : 0;
    return { b: new Array(24).fill(-1), hand: [9, 9], turn: first, first, rm: false, phase: 'play', rdy: [false, false], log: [], res: null, n: 0, quiet: 0, rep: {}, last: null, mills: [0, 0] };
  }
  const nmCount = (S, s) => { let n = 0; for (let i = 0; i < 24; i++) if (S.b[i] === s) n++; return n; };
  const nmTotal = (S, s) => nmCount(S, s) + S.hand[s];
  const nmFlying = (S, s) => S.hand[s] === 0 && nmCount(S, s) === 3;
  function nmLegal(S, s) {
    const out = [], fly = nmFlying(S, s);
    if (S.hand[s] > 0) { for (let t = 0; t < 24; t++) if (S.b[t] < 0) out.push({ f: -1, t }); return out; }
    for (let f = 0; f < 24; f++) if (S.b[f] === s) {
      if (fly) { for (let t = 0; t < 24; t++) if (S.b[t] < 0) out.push({ f, t }); }
      else for (const t of NM_ADJ[f]) if (S.b[t] < 0) out.push({ f, t });
    }
    return out;
  }
  function nmRemovable(S, s) {
    const o = 1 - s, mask = nmMasks(S)[o];
    const om = nmMillMask(mask), out = [];
    for (let i = 0; i < 24; i++) if (S.b[i] === o && (!(om & (1 << i)) || om === mask)) out.push(i);
    return out;
  }
  function nmKey(S) { return S.b.map(v => v + 1).join('') + S.turn + S.hand.join(''); }
  function nmEnd(S, w, why) {
    S.phase = 'over'; S.rm = false;
    S.res = { w, why };
  }
  function nmAfter(S, seat, ev) {
    const o = 1 - seat;
    S.turn = o;
    if (S.hand[0] === 0 && S.hand[1] === 0) {
      const k = nmKey(S);
      S.rep[k] = (S.rep[k] || 0) + 1;
      if (S.rep[k] >= 3) { nmEnd(S, -1, 'rep'); ev.push({ k: 'over' }); return; }
      if (S.quiet >= (nmFlying(S, 0) && nmFlying(S, 1) ? 20 : 60)) { nmEnd(S, -1, 'quiet'); ev.push({ k: 'over' }); return; }
    }
    if (S.hand[o] === 0 && nmLegal(S, o).length === 0) { nmEnd(S, seat, 'blocked'); ev.push({ k: 'over' }); }
  }
  function nmApply(T, seat, i) {
    const S = T.S;
    if (!i || typeof i.t !== 'string') return null;
    if (i.t === 'next') {
      if (S.phase !== 'over') return null;
      S.rdy[seat] = true;
      if (!S.rdy.every((r, q) => r || T.cpu[q])) return [{ k: 'rdy' }];
      const N = nmNew(T, S);
      for (const k of Object.keys(S)) delete S[k];
      Object.assign(S, N);
      return [{ k: 'new', swap: false }];
    }
    if (S.phase !== 'play') return null;
    if (i.t === 'resign') { nmEnd(S, 1 - seat, 'resign'); return [{ k: 'over' }]; }
    if (seat !== S.turn) return null;
    const isP = n => Number.isInteger(n) && n >= 0 && n < 24;
    if (S.rm) {
      if (i.t !== 'rm' || !isP(i.p) || !nmRemovable(S, seat).includes(i.p)) return null;
      const o = 1 - seat;
      S.b[i.p] = -1; S.rm = false; S.quiet = 0; S.n++;
      S.log.push({ s: seat, t: 'x', p: i.p });
      const ev = [{ k: 'rm', s: seat, p: i.p }];
      if (nmTotal(S, o) < 3) { S.turn = o; nmEnd(S, seat, 'pieces'); ev.push({ k: 'over' }); return ev; }
      nmAfter(S, seat, ev);
      return ev;
    }
    let ev;
    if (i.t === 'pl') {
      if (S.hand[seat] <= 0 || !isP(i.p) || S.b[i.p] >= 0) return null;
      S.b[i.p] = seat; S.hand[seat]--;
      S.log.push({ s: seat, t: 'p', p: i.p });
      ev = [{ k: 'pl', s: seat, p: i.p }];
    } else if (i.t === 'mv') {
      if (S.hand[seat] > 0 || !isP(i.f) || !isP(i.p) || S.b[i.f] !== seat || S.b[i.p] >= 0) return null;
      if (!nmFlying(S, seat) && !NM_ADJ[i.f].includes(i.p)) return null;
      S.b[i.f] = -1; S.b[i.p] = seat;
      S.log.push({ s: seat, t: 'm', f: i.f, p: i.p });
      ev = [{ k: 'mv', s: seat, f: i.f, p: i.p, fly: nmFlying(S, seat) }];
    } else return null;
    S.n++; S.quiet++;
    S.last = { s: seat, f: i.t === 'mv' ? i.f : -1, p: i.p };
    const [m0, m1] = nmMasks(S), mine = seat ? m1 : m0;
    if (nmIn(mine, i.p)) {
      const rem = nmRemovable(S, seat);
      if (rem.length) {
        S.rm = true;
        ev[0].mill = NM_MILLS.filter((a, j) => (NM_MM[j] & (1 << i.p)) && (mine & NM_MM[j]) === NM_MM[j]).flat();
        return ev;
      }
    }
    nmAfter(S, seat, ev);
    return ev;
  }

  const NMW = 900, NMH = 620, NMU = 80, NMOX = 210, NMOY = 70, NMR = 25;
  const nmPt = i => { const g = nmXY(i); return { x: NMOX + g[0] * NMU, y: NMOY + g[1] * NMU }; };
  const nmName = i => { const g = nmXY(i); return 'abcdefg'[g[0]] + (7 - g[1]); };
  const nmSlot = (x, k) => ({ x, y: 310 + (k - 4) * 44 });
  const NM_TRAY = [80, 820];

  function nmPiece(c, x, y, r, light, al, lift) {
    c.save();
    if (al !== undefined) c.globalAlpha = al;
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x + r * .12 + (lift || 0) * .4, y + r * .26 + (lift || 0), r * .98, r * .78, 0, 0, 7); c.fill();
    const yy = y - (lift || 0);
    const g = c.createRadialGradient(x - r * .35, yy - r * .4, r * .08, x, yy, r * 1.05);
    if (light) { g.addColorStop(0, '#fffaf0'); g.addColorStop(.5, '#efe0bd'); g.addColorStop(1, '#a89468'); }
    else { g.addColorStop(0, '#7a665a'); g.addColorStop(.45, '#3a2a22'); g.addColorStop(1, '#120a06'); }
    c.fillStyle = g; c.beginPath(); c.arc(x, yy, r, 0, 7); c.fill();
    c.lineWidth = 1.4; c.strokeStyle = light ? 'rgba(90,64,28,.7)' : 'rgba(0,0,0,.8)'; c.stroke();
    c.beginPath(); c.arc(x, yy, r * .66, 0, 7); c.strokeStyle = light ? 'rgba(120,90,40,.4)' : 'rgba(255,255,255,.14)'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = light ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.22)';
    c.beginPath(); c.ellipse(x - r * .34, yy - r * .4, r * .3, r * .17, -.7, 0, 7); c.fill();
    c.restore();
  }
  function nmBoardImg() {
    const dpr = dprOf(), cv = cnv(NMW * dpr, NMH * dpr), c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const rand = rng(2929);
    c.save(); rr(c, 0, 0, NMW, NMH, 30); c.clip();
    grain(c, 0, 0, NMW, NMH, '#b98445', ['#9a6a30', '#d2a05a', '#a87638', '#e0b476'], rand, false);
    knots(c, 0, 0, NMW, NMH, rand, 6, '#7a4c1c');
    const vg = c.createLinearGradient(0, 0, 0, NMH);
    vg.addColorStop(0, 'rgba(255,240,200,.3)'); vg.addColorStop(.12, 'rgba(255,240,200,0)'); vg.addColorStop(.88, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
    c.fillStyle = vg; c.fillRect(0, 0, NMW, NMH);
    c.restore();
    rr(c, 1.5, 1.5, NMW - 3, NMH - 3, 29); c.strokeStyle = 'rgba(50,28,8,.75)'; c.lineWidth = 3; c.stroke();
    for (const x of NM_TRAY) {
      c.save();
      rr(c, x - 52, 92, 104, 436, 30); c.fillStyle = 'rgba(255,235,190,.3)'; c.fill();
      rr(c, x - 51, 90, 104, 436, 30); c.fillStyle = 'rgba(30,14,2,.45)'; c.fill();
      rr(c, x - 50, 92, 100, 432, 29);
      const g = c.createLinearGradient(0, 92, 0, 524); g.addColorStop(0, '#4a2c12'); g.addColorStop(1, '#6a4220');
      c.fillStyle = g; c.fill();
      c.restore();
    }
    const edges = [];
    for (let i = 0; i < 24; i++) for (const j of NM_ADJ[i]) if (j > i) edges.push([i, j]);
    const stroke = (dx, dy, col, w) => {
      c.save(); c.translate(dx, dy); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
      c.beginPath();
      for (const [i, j] of edges) { const a = nmPt(i), b = nmPt(j); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
      c.stroke(); c.restore();
    };
    stroke(1.5, 2, 'rgba(255,235,190,.45)', 7);
    stroke(-.5, -1, 'rgba(30,14,2,.7)', 7);
    stroke(0, 0, '#3a2010', 5);
    for (let i = 0; i < 24; i++) {
      const p = nmPt(i);
      c.fillStyle = 'rgba(255,235,190,.4)'; c.beginPath(); c.arc(p.x + 1, p.y + 2, 13, 0, 7); c.fill();
      const g = c.createRadialGradient(p.x - 3, p.y - 3, 1, p.x, p.y, 13);
      g.addColorStop(0, '#2a1608'); g.addColorStop(1, '#4a2c12');
      c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, 12, 0, 7); c.fill();
    }
    return cv;
  }

  function nmGame(api, root) {
    const V = { show: new Array(24).fill(-1), hv: [9, 9], lost: [0, 0], ops: [], fl: [], fx: [], busy: 0, hover: -1, kf: -1, sel: -1, drag: null, banner: null, mill: null, dirty: true, anim: false, img: null, dock: false, sure: false };
    let T = null, view = null;

    function sync() {
      const S = T.S;
      V.show = S.b.slice(); V.hv = S.hand.slice();
      V.lost = [9 - nmTotal(S, 0), 9 - nmTotal(S, 1)];
      V.dock = true; V.dirty = true;
    }
    function reset() {
      V.ops = []; V.fl = []; V.fx = []; V.busy = 0; V.banner = null; V.mill = null; V.sel = -1; V.kf = -1; V.drag = null;
      sync();
    }
    const trayX = s => NM_TRAY[s === T.me ? 1 : 0];
    function schedule(e) {
      const t0 = Math.max(now(), V.busy);
      let t = t0;
      const op = (at, f) => V.ops.push({ at, f });
      const millOp = () => {
        if (!e.mill) return;
        op(t, () => { V.mill = { pts: e.mill, t0: now() }; V.banner = { t0: now(), text: 'Mill!' }; T.snd.mill(); V.dock = true; });
        t += 620;
      };
      if (e.k === 'pl') {
        op(t, () => {
          const k = V.hv[e.s] - 1; V.hv[e.s]--;
          const a = nmSlot(trayX(e.s), Math.max(k, 0)), b = nmPt(e.p);
          V.fl.push({ a, b, t0: now(), dur: 380, s: e.s, arc: 34, land: () => { V.show[e.p] = e.s; T.snd.clack(); V.dock = true; } });
          V.dock = true;
        });
        t += 400;
        millOp();
      } else if (e.k === 'mv') {
        const dur = e.fly ? 560 : 340;
        op(t, () => {
          V.show[e.f] = -1;
          V.fl.push({ a: nmPt(e.f), b: nmPt(e.p), t0: now(), dur, s: e.s, arc: e.fly ? 70 : 14, land: () => { V.show[e.p] = e.s; T.snd.clack(); V.dock = true; } });
          if (e.fly) T.snd.slide();
          V.dock = true;
        });
        t += dur + 30;
        millOp();
      } else if (e.k === 'rm') {
        op(t, () => {
          const p = nmPt(e.p), o = V.show[e.p] >= 0 ? V.show[e.p] : 1 - e.s;
          V.show[e.p] = -1; V.lost[o]++;
          V.fx.push({ x: p.x, y: p.y, t0: now(), s: o });
          T.snd.take(); V.dock = true;
        });
        t += 560;
      }
      op(t, () => { V.dock = true; });
      V.busy = t;
    }

    const mineTurn = () => {
      const S = T.S;
      return T.mine() && S.phase === 'play' && S.turn === T.me && now() >= V.busy && !V.ops.length && !V.fl.length;
    };
    function targets() {
      const S = T.S, out = { pick: new Set(), dest: new Set(), mode: '' };
      if (!mineTurn()) return out;
      if (S.rm) { out.mode = 'rm'; for (const p of nmRemovable(S, T.me)) out.pick.add(p); return out; }
      if (S.hand[T.me] > 0) { out.mode = 'pl'; for (const m of nmLegal(S, T.me)) out.dest.add(m.t); return out; }
      out.mode = 'mv';
      for (const m of nmLegal(S, T.me)) { out.pick.add(m.f); if (m.f === V.sel) out.dest.add(m.t); }
      return out;
    }
    function pointAt(p, rad) {
      let best = -1, bd = (rad || 40) * (rad || 40);
      for (let i = 0; i < 24; i++) { const q = nmPt(i), d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d < bd) { bd = d; best = i; } }
      return best;
    }
    function click(p) {
      const S = T.S, tg = targets();
      if (p < 0 || !tg.mode) return false;
      if (tg.mode === 'rm') { if (tg.pick.has(p)) { T.act({ t: 'rm', p }); return true; } return false; }
      if (tg.mode === 'pl') { if (tg.dest.has(p)) { V.kf = -1; T.act({ t: 'pl', p }); return true; } return false; }
      if (V.sel >= 0 && tg.dest.has(p)) { const f = V.sel; V.sel = -1; T.act({ t: 'mv', f, p }); return true; }
      if (S.b[p] === T.me && tg.pick.has(p)) { V.sel = V.sel === p ? -1 : p; V.dirty = true; return true; }
      V.sel = -1; V.dirty = true;
      return false;
    }
    function wire(cvs) {
      cvs.addEventListener('pointermove', e => {
        const lp = view.local(e), i = pointAt(lp, 36), tg = targets();
        if (V.drag) { V.drag.x = lp.x; V.drag.y = lp.y; if (Math.hypot(lp.x - V.drag.x0, lp.y - V.drag.y0) > 10) V.drag.moved = true; V.dirty = true; return; }
        const ok = i >= 0 && (tg.pick.has(i) || tg.dest.has(i));
        cvs.style.cursor = ok ? 'pointer' : 'default';
        const h = ok ? i : -1;
        if (h !== V.hover) { V.hover = h; V.dirty = true; }
      });
      cvs.addEventListener('pointerleave', () => { if (V.hover !== -1) { V.hover = -1; V.dirty = true; } });
      cvs.addEventListener('pointerdown', e => {
        if (e.button > 0 || !e.isPrimary || T.overUp()) return;
        e.preventDefault();
        const lp = view.local(e), i = pointAt(lp, 38);
        if (e.pointerType === 'touch' || e.pointerType === 'pen') V.hover = -1;
        const tg = targets();
        if (tg.mode === 'mv' && i >= 0 && tg.pick.has(i) && T.S.b[i] === T.me) {
          const was = V.sel === i;
          V.sel = i; V.kf = -1;
          V.drag = { p: i, x: lp.x, y: lp.y, x0: lp.x, y0: lp.y, moved: false, was };
          try { cvs.setPointerCapture(e.pointerId); } catch (er) { }
          V.dirty = true;
          return;
        }
        click(i);
      });
      const up = e => {
        const d = V.drag;
        if (!d) return;
        V.drag = null; V.dirty = true;
        if (!d.moved) { if (d.was) V.sel = -1; return; }
        const i = pointAt(view.local(e), 44);
        if (i >= 0 && i !== d.p) click(i);
      };
      cvs.addEventListener('pointerup', up);
      cvs.addEventListener('pointercancel', () => { V.drag = null; V.dirty = true; });
    }
    function onKey(e) {
      if (!T || !T.S || T.overUp() || e.ctrlKey || e.metaKey || e.altKey || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) return;
      const k = e.code;
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (arrows[k]) {
        e.preventDefault();
        let [dx, dy] = arrows[k];
        if (view.rot) [dx, dy] = [dy ? dy : 0, dx ? -dx : 0];
        const tg = targets(), cand = [...tg.pick, ...tg.dest];
        if (!cand.length) return;
        if (V.kf < 0) { V.kf = V.sel >= 0 ? V.sel : cand[0]; V.dirty = true; return; }
        const c0 = nmPt(V.kf);
        let best = -1, bs = 1e9;
        for (const j of cand) {
          if (j === V.kf) continue;
          const q = nmPt(j), vx = q.x - c0.x, vy = q.y - c0.y, al = vx * dx + vy * dy, pp = Math.abs(vx * dy - vy * dx);
          if (al < 10) continue;
          const s = al + pp * 2.2;
          if (s < bs) { bs = s; best = j; }
        }
        if (best >= 0) { V.kf = best; V.dirty = true; }
      } else if (k === 'Enter' || k === 'Space' || k === 'NumpadEnter') {
        e.preventDefault();
        const tg = targets();
        if (V.kf < 0) { const cand = [...tg.pick, ...tg.dest]; if (cand.length) { V.kf = V.sel >= 0 ? V.sel : cand[0]; V.dirty = true; } return; }
        click(V.kf);
        if (T.S.b[V.kf] !== T.me || !targets().mode) V.dirty = true;
      } else if (e.repeat) return;
      else if (k === 'KeyU') T.undo();
      else if (k === 'KeyX' || k === 'Backspace') { V.sel = -1; V.dirty = true; }
    }

    function refresh() {
      const S = T.S, D = T.D, me = T.me, opp = 1 - me, over = S.phase === 'over';
      const bd = s => { let n = 0; for (let i = 0; i < 24; i++) if (V.show[i] === s) n++; return n; };
      const sub = s => `Hand <em>${V.hv[s]}</em> · Lost ${V.lost[s]}`;
      D.card(0, { name: 'You', chip: 'radial-gradient(circle at 35% 30%,#fff,#d8c79b)', sub: sub(me), on: !over && S.turn === me });
      D.card(1, { name: T.name(opp), chip: 'radial-gradient(circle at 35% 30%,#8a7466,#2a1c14)', sub: sub(opp), on: !over && S.turn === opp });
      let st = '', cls = '';
      const busy = now() < V.busy || V.ops.length > 0 || V.fl.length > 0;
      if (over) {
        const r = S.res;
        st = r.w < 0 ? 'Draw' : r.w === me ? 'You win' : T.name(r.w) + ' wins'; cls = r.w < 0 ? '' : r.w === me ? 'win' : 'loss';
        if (S.rdy[me]) { st = 'Waiting for ' + T.name(opp) + '…'; cls = ''; }
      } else if (S.turn === me) {
        if (S.rm) st = 'Mill! Remove an opponent piece';
        else if (S.hand[me] > 0) st = `Place a piece · ${S.hand[me]} left`;
        else st = nmFlying(S, me) ? 'Flying: move to any empty point' : 'Move a piece';
        cls = 'turn';
      } else st = busy ? T.name(opp) + ' is moving…' : T.name(opp) + ' to move';
      D.st(st, cls);
      const b = [];
      if (T.mode === 'cpu') { if (T.canUndo()) b.push(['Undo', 'undo', { ghost: 1 }]); b.push(['New game', 'new', { ghost: 1 }]); }
      else {
        if (over && S.rdy[me] === false && !T.overUp()) b.push(['Rematch', 'next', { hot: 1 }]);
        if (!over) b.push([V.sure ? 'Sure?' : 'Resign', 'resign', { ghost: 1 }]);
        if (T.role === 'host') b.push(['Lobby', 'lobby', { ghost: 1 }]);
        b.push(['Leave', 'leave', { ghost: 1 }]);
      }
      D.btns(b);
      D.log(S.log.slice(-14).map((l, i, a) => {
        const who = l.s === me ? 'You' : esc(T.name(l.s)), txt = l.t === 'p' ? 'places ' + nmName(l.p) : l.t === 'm' ? nmName(l.f) + ' to ' + nmName(l.p) : 'removes ' + nmName(l.p);
        return `<p><em>${who}</em><span${i === a.length - 1 ? ' class="cur"' : ''}>${txt}</span></p>`;
      }).join(''));
      V.dirty = true;
    }

    function lab(c, s, x, y, font, fill) {
      c.save(); c.translate(x, y); if (view.rot) c.rotate(-Math.PI / 2);
      c.font = font; c.fillStyle = fill; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 1); c.restore();
    }
    function pill(c, x, y, s, w) {
      c.save(); c.translate(x, y); if (view.rot) c.rotate(-Math.PI / 2);
      rr(c, -w / 2, -13, w, 26, 13); c.fillStyle = 'rgba(30,14,3,.78)'; c.fill(); c.strokeStyle = 'rgba(230,190,110,.55)'; c.lineWidth = 1.2; c.stroke();
      c.font = '800 14px var(--sans),system-ui,sans-serif'; c.fillStyle = '#ffe6a6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 1);
      c.restore();
    }

    function draw() {
      const tm = now(), S = T.S;
      view.check();
      while (V.ops.length && V.ops[0].at <= tm) V.ops.shift().f();
      for (let i = V.fl.length - 1; i >= 0; i--) {
        const f = V.fl[i];
        if (tm >= f.t0 + f.dur) { V.fl.splice(i, 1); f.land(); }
      }
      V.fx = V.fx.filter(f => tm < f.t0 + 750);
      if (V.mill && tm > V.mill.t0 + 1500) V.mill = null;
      const busy = tm < V.busy || V.ops.length > 0 || V.fl.length > 0;
      if (!busy) {
        let bad = S.b.length !== V.show.length;
        for (let i = 0; i < 24 && !bad; i++) if (S.b[i] !== V.show[i]) bad = true;
        if (bad || S.hand[0] !== V.hv[0] || S.hand[1] !== V.hv[1] || V.lost[0] !== 9 - nmTotal(S, 0) || V.lost[1] !== 9 - nmTotal(S, 1)) sync();
      }
      if (V.sel >= 0 && !(S.phase === 'play' && S.turn === T.me && S.b[V.sel] === T.me && !S.rm && S.hand[T.me] === 0)) V.sel = -1;
      if (V.dock) { V.dock = false; refresh(); }
      const c = view.begin();
      if (!V.img) V.img = nmBoardImg();
      c.drawImage(V.img, 0, 0, NMW, NMH);
      const tg = targets(), pulse = .5 + .5 * Math.sin(tm / 220);
      const mm = nmMasks(S), mills = nmMillMask(mm[0]) | nmMillMask(mm[1]);
      for (const s of [T.me, 1 - T.me]) {
        for (let k = 0; k < V.hv[s]; k++) { const q = nmSlot(trayX(s), k); nmPiece(c, q.x, q.y, 21, s === T.me); }
      }
      c.save();
      for (const p of tg.dest) {
        const q = nmPt(p), hot = p === V.hover || p === V.kf;
        c.fillStyle = tg.mode === 'pl' ? `rgba(255,236,160,${hot ? .9 : .28 + .14 * pulse})` : `rgba(130,235,160,${hot ? .95 : .55 + .2 * pulse})`;
        c.beginPath(); c.arc(q.x, q.y, hot ? 17 : 12, 0, 7); c.fill();
        if (hot) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(q.x, q.y, 26, 0, 7); c.stroke(); }
      }
      c.restore();
      if (S.last && !busy && S.last.p >= 0) {
        const q = nmPt(S.last.p);
        c.save(); c.strokeStyle = 'rgba(255,214,110,.5)'; c.lineWidth = 2.5; c.setLineDash([4, 5]); c.beginPath(); c.arc(q.x, q.y, 31, 0, 7); c.stroke(); c.restore();
      }
      const dr = V.drag && V.drag.moved ? V.drag : null;
      for (let i = 0; i < 24; i++) {
        const o = V.show[i];
        if (o < 0 || (dr && dr.p === i)) continue;
        const q = nmPt(i), sel = V.sel === i;
        if (mills & (1 << i)) {
          c.save(); c.strokeStyle = 'rgba(255,205,90,.8)'; c.lineWidth = 3; c.beginPath(); c.arc(q.x, q.y, NMR + 5, 0, 7); c.stroke(); c.restore();
        }
        nmPiece(c, q.x, q.y, NMR, o === T.me, undefined, sel ? 7 : 0);
        if (tg.mode === 'rm' && tg.pick.has(i)) {
          c.save(); c.strokeStyle = `rgba(255,90,70,${.6 + .4 * pulse})`; c.lineWidth = 4; c.beginPath(); c.arc(q.x, q.y, NMR + 7, 0, 7); c.stroke();
          c.lineWidth = 3; c.beginPath(); c.moveTo(q.x - 10, q.y - 10); c.lineTo(q.x + 10, q.y + 10); c.moveTo(q.x + 10, q.y - 10); c.lineTo(q.x - 10, q.y + 10); c.stroke(); c.restore();
        } else if (tg.mode === 'mv' && tg.pick.has(i) && !sel) {
          c.save(); c.strokeStyle = `rgba(255,230,150,${.35 + .25 * pulse})`; c.lineWidth = 3; c.beginPath(); c.arc(q.x, q.y, NMR + 6, 0, 7); c.stroke(); c.restore();
        } else if (sel) {
          c.save(); c.strokeStyle = '#ffe28a'; c.lineWidth = 3.5; c.beginPath(); c.arc(q.x, q.y, NMR + 8, 0, 7); c.stroke(); c.restore();
        }
      }
      if (V.mill) {
        const a = 1 - (tm - V.mill.t0) / 1500, k = (tm - V.mill.t0) / 1500;
        c.save(); c.lineCap = 'round';
        const pts = V.mill.pts.map(nmPt);
        c.strokeStyle = `rgba(255,214,110,${Math.max(0, a) * (.6 + .4 * Math.sin(tm / 70))})`; c.lineWidth = 9 + 6 * k;
        c.beginPath(); pts.forEach((q, j) => j ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.stroke();
        c.restore();
      }
      for (const f of V.fl) {
        const p = clamp01((tm - f.t0) / f.dur), e = easeIO(p);
        const x = lerp(f.a.x, f.b.x, e), y = lerp(f.a.y, f.b.y, e) - Math.sin(p * Math.PI) * f.arc;
        nmPiece(c, x, y, NMR, f.s === T.me, undefined, Math.sin(p * Math.PI) * 6);
      }
      for (const f of V.fx) {
        const p = (tm - f.t0) / 750;
        nmPiece(c, f.x, f.y - p * 20, NMR * (1 + p * .5), f.s === T.me, Math.max(0, 1 - p * 1.6));
        c.save();
        for (let j = 0; j < 14; j++) {
          const an = j * 0.4488 + f.t0 * .001, d = 14 + p * 64 * (.6 + (j % 3) * .25), a = Math.max(0, 1 - p) * .9;
          c.fillStyle = j % 2 ? `rgba(255,214,110,${a})` : `rgba(255,150,90,${a})`;
          c.beginPath(); c.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d, 3.4 * (1 - p * .6), 0, 7); c.fill();
        }
        c.restore();
      }
      if (dr) nmPiece(c, dr.x, dr.y, NMR + 2, true, .95, 10);
      if (V.kf >= 0 && mineTurn()) {
        const q = nmPt(V.kf);
        c.save(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.setLineDash([6, 5]); c.beginPath(); c.arc(q.x, q.y, NMR + 12, 0, 7); c.stroke(); c.restore();
      }
      const FONT = '900 14px var(--sans),system-ui,sans-serif';
      lab(c, 'YOU', NM_TRAY[1], 66, FONT, 'rgba(255,236,190,.9)');
      lab(c, T.name(1 - T.me).toUpperCase().slice(0, 10), NM_TRAY[0], 66, FONT, 'rgba(255,236,190,.9)');
      pill(c, NM_TRAY[1], 560, 'Lost ' + V.lost[T.me], 84);
      pill(c, NM_TRAY[0], 560, 'Lost ' + V.lost[1 - T.me], 84);
      if (V.banner) {
        const q = (tm - V.banner.t0) / 1100;
        if (q >= 1) V.banner = null;
        else {
          const a = q < .15 ? q / .15 : q > .7 ? (1 - q) / .3 : 1;
          c.save(); c.globalAlpha = a; c.translate(450, 310 - q * 10); if (view.rot) c.rotate(-Math.PI / 2);
          rr(c, -90, -26, 180, 52, 26); c.fillStyle = 'rgba(30,14,3,.88)'; c.fill(); c.strokeStyle = '#e0b04a'; c.lineWidth = 2.5; c.stroke();
          c.font = '900 26px Georgia,serif'; c.fillStyle = '#ffe6a6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(V.banner.text, 0, 2);
          c.restore();
        }
      }
      view.end();
      V.anim = busy || !!V.banner || !!V.mill || V.fx.length > 0 || !!tg.mode || !!V.drag;
    }

    const G = {
      title: 'Nine Men\'s Morris',
      create: T0 => nmNew(T0, null),
      apply: (T0, seat, i) => nmApply(T0, seat, i),
      toAct: T0 => T0.S.phase === 'play' ? [T0.S.turn] : [],
      cpu: (T0, seat) => {
        const S = T0.S;
        if (S.rm) {
          const r = nmRemovable(S, seat), p = T0.nmPlan != null && r.includes(T0.nmPlan) ? T0.nmPlan : r[0];
          T0.nmPlan = null;
          return { t: 'rm', p };
        }
        const m = nmChoose(S, seat, T0.opt.diff | 0);
        if (!m) return null;
        T0.nmPlan = m.r >= 0 ? m.r : null;
        return m.f < 0 ? { t: 'pl', p: m.t } : { t: 'mv', f: m.f, p: m.t };
      },
      wait: (T0) => T0.S.rm ? 450 : 700,
      busyUntil: () => V.busy,
      result: T0 => {
        const S = T0.S;
        if (S.phase !== 'over' || !S.res) return null;
        const r = S.res, me = T0.me, opp = T0.name(1 - me);
        const mine = nmTotal(S, me), theirs = nmTotal(S, 1 - me);
        const why = { pieces: r.w === me ? opp + ' is down to two pieces.' : 'You are down to two pieces.', blocked: r.w === me ? opp + ' has no legal move.' : 'You have no legal move.', resign: r.w === me ? opp + ' resigned.' : 'You resigned.', rep: 'The same position came up three times.', quiet: 'No mill was made for too long.' }[r.why] || '';
        return {
          w: r.w,
          title: r.w < 0 ? 'Draw' : r.w === me ? 'You win' : opp + ' wins',
          text: why,
          stats: [['Your pieces', mine], ['Their pieces', theirs], ['Moves', S.n]]
        };
      },
      events: (T0, ev) => {
        for (const e of ev) {
          if (e.k === 'new' || e.k === 'sync') reset();
          else if (e.k === 'pl' || e.k === 'mv' || e.k === 'rm') schedule(e);
          else if (e.k === 'rdy') T0.snd.pop();
          else if (e.k === 'over' && T0.S.res && T0.S.res.why === 'resign') { V.ops = []; V.fl = []; V.busy = 0; sync(); }
        }
        V.dirty = true; V.dock = true;
      },
      refresh,
      canRestart: T0 => T0.S.n === 0 && T0.S.phase === 'play',
      started: T0 => T0.S.n > 0,
      btn: (T0, id) => {
        T0.snd.pop();
        if (id === 'resign') {
          if (!V.sure) { V.sure = true; refresh(); T0.later(() => { V.sure = false; refresh(); }, 2600); return; }
          V.sure = false; T0.act({ t: 'resign' });
        }
      }
    };
    const cfg = {
      segs: [{ k: 'diff', lab: 'Difficulty', vals: [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], def: 1 }],
      btns: 4, log: true, snapUndo: true
    };
    T = table(api, root, G, cfg);
    view = mkView(api, root, T.box, NMW, NMH, true);
    view.canvases.forEach(wire);
    api.on(window, 'keydown', onKey);
    api.loop(() => { if (V.dirty || V.anim || view.check()) { V.dirty = false; draw(); } });
    T.start();
  }

  Ameplay.register({
    id: 'backgammon',
    title: 'Backgammon',
    category: 'Board',
    blurb: 'Roll, hit and race your checkers home. Doubling cube, matches and a sharp AI.',
    help: 'Tap or drag a checker, then a highlighted point · double-tap to play the big die · <kbd>Space</kbd> roll · arrows + <kbd>Enter</kbd> · <kbd>D</kbd> double · <kbd>U</kbd> undo',
    better: 'high',
    format: winsFmt,
    width: 980,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="10" width="52" height="44" rx="4"/><path d="M32 10v44M12 10l4 20 4-20M24 10l4 20M44 54l4-20 4 20M36 54l4-20"/><circle cx="16" cy="46" r="3.5"/><circle cx="48" cy="22" r="3.5"/></svg>',
    css: kitCss('.gm-backgammon') + PAL('.gm-backgammon', { bg: '#241508', card: '#3b2412', ink: '#f6ead3', mute: '#bfa07a', acc: '#d9a441', accd: '#946a1a', on: '#2a1808', line: '#5a3b21' }),
    mount: (root, api) => bgGame(api, root)
  });

  Ameplay.register({
    id: 'mancala',
    title: 'Mancala',
    category: 'Board',
    blurb: 'Sow seeds around the board, chain extra turns and capture your rival\'s stones in Kalah.',
    help: 'Tap a pit on your side to sow · <kbd>1</kbd>-<kbd>6</kbd> or arrows + <kbd>Enter</kbd> · <kbd>U</kbd> undo',
    better: 'high',
    format: winsFmt,
    width: 980,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="16" width="54" height="32" rx="12"/><circle cx="17" cy="26" r="4.5"/><circle cx="29" cy="26" r="4.5"/><circle cx="41" cy="26" r="4.5"/><circle cx="17" cy="38" r="4.5"/><circle cx="29" cy="38" r="4.5"/><circle cx="41" cy="38" r="4.5"/><path d="M50 24v16"/></svg>',
    css: kitCss('.gm-mancala') + PAL('.gm-mancala', { bg: '#2a1809', card: '#432812', ink: '#f8ecd2', mute: '#c9a77c', acc: '#e9ab3a', accd: '#9a6a14', on: '#2c1806', line: '#5e3b1d' }),
    mount: (root, api) => maGame(api, root)
  });

  Ameplay.register({
    id: 'nine-mens-morris',
    title: 'Nine Men\'s Morris',
    category: 'Board',
    blurb: 'Place, slide and fly your nine pieces to form mills and capture the opposing army.',
    help: 'Click a point to place · click a piece then a green point to slide, or drag it · arrows + <kbd>Enter</kbd> · <kbd>U</kbd> undo',
    better: 'high',
    format: winsFmt,
    width: 980,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48"/><rect x="18" y="18" width="28" height="28"/><rect x="28" y="28" width="8" height="8"/><path d="M32 8v20M32 36v20M8 32h20M36 32h20"/><circle cx="8" cy="8" r="3.5" fill="currentColor"/><circle cx="32" cy="8" r="3.5" fill="currentColor"/><circle cx="56" cy="8" r="3.5" fill="currentColor"/></svg>',
    css: kitCss('.gm-nine-mens-morris') + PAL('.gm-nine-mens-morris', { bg: '#1b2330', card: '#2a364a', ink: '#eef3fb', mute: '#9db0cc', acc: '#e0b04a', accd: '#8f6b1c', on: '#2a1c04', line: '#3b4a63' }),
    mount: (root, api) => nmGame(api, root)
  });
})();
