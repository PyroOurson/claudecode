
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const sgn = v => v < 0 ? -1 : v > 0 ? 1 : 0;
  const r1 = v => Math.round(v * 10) / 10;
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = 'Nunito, system-ui, -apple-system, Segoe UI, sans-serif';
  const hex = (c, k) => {
    const n = parseInt(c.slice(1), 16);
    let r = n >> 16, g = n >> 8 & 255, b = n & 255;
    if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    r = r | 0; g = g | 0; b = b | 0;
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | (b | 0)).toString(16).slice(1);
  };
  const pathRR = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const txt = (c, s, x, y, size, col, al = 'center', w = 900, stroke) => {
    c.font = `${w} ${size}px ${FONT}`; c.textAlign = al; c.textBaseline = 'middle';
    if (stroke) { c.lineWidth = Math.max(2, size * .16); c.lineJoin = 'round'; c.strokeStyle = stroke; c.strokeText(s, x, y); }
    c.fillStyle = col; c.fillText(s, x, y);
  };

  const baseCss = (id, ac) => {
    const q = '.gm-' + id;
    return `
${q}{--ac:${ac};align-items:stretch;gap:12px;font-family:${FONT}}
${q} *{box-sizing:border-box}
${q} .hs-menu{position:relative;width:100%;max-width:980px;margin:0 auto;border-radius:16px;padding:clamp(12px,1.8vw,20px);color:#eaf0ff;background:radial-gradient(1200px 500px at 20% -10%,color-mix(in srgb,var(--ac) 38%,#0e1630),#0b1226 60%);box-shadow:0 16px 40px -22px rgba(5,10,30,.9);user-select:none}
${q} .hs-menu[hidden],${q} .hs-play[hidden],${q} .hs-ov[hidden]{display:none}
${q} .hs-logo{font:900 clamp(30px,5.4vw,52px)/1 ${FONT};letter-spacing:-.03em;margin:0;text-shadow:0 3px 0 rgba(0,0,0,.35)}
${q} .hs-logo b{color:var(--ac);font-weight:900}
${q} .hs-tag{margin:4px 0 10px;font-weight:700;opacity:.78;font-size:clamp(12px,1.6vw,15px)}
${q} .hs-sec{margin:10px 0 5px;font:900 11px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;opacity:.65}
${q} .hs-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${q} .hs-chip{appearance:none;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#eaf0ff;border-radius:999px;padding:8px 14px;font:800 13px/1 ${FONT};cursor:pointer;transition:transform .15s,background .15s,border-color .15s;min-height:36px}
${q} .hs-chip:hover{background:rgba(255,255,255,.16)}
${q} .hs-chip.on{background:var(--ac);border-color:var(--ac);color:#fff;box-shadow:0 6px 16px -8px var(--ac)}
${q} .hs-chip:disabled{opacity:.35;pointer-events:none}
${q} .hs-go{appearance:none;border:0;border-radius:14px;padding:14px 22px;font:900 clamp(14px,2vw,17px)/1 ${FONT};color:#fff;background:var(--ac);cursor:pointer;box-shadow:0 8px 0 color-mix(in srgb,var(--ac) 55%,#000),0 14px 24px -10px rgba(0,0,0,.6);transition:transform .12s,box-shadow .12s;min-height:48px}
${q} .hs-go:hover{transform:translateY(-2px)}
${q} .hs-go:active{transform:translateY(5px);box-shadow:0 3px 0 color-mix(in srgb,var(--ac) 55%,#000)}
${q} .hs-go.alt{background:#2c3a66;box-shadow:0 8px 0 #18213f,0 14px 24px -10px rgba(0,0,0,.6)}
${q} .hs-go.sm{padding:10px 16px;font-size:14px;min-height:40px;box-shadow:0 5px 0 color-mix(in srgb,var(--ac) 55%,#000)}
${q} .hs-go.alt.sm{box-shadow:0 5px 0 #18213f}
${q} .hs-go:disabled{opacity:.4;pointer-events:none}
${q} .hs-modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:8px;margin-top:4px}
${q} .hs-orow{display:flex;align-items:center;gap:10px;margin:5px 0;flex-wrap:wrap}
${q} .hs-orow .hs-sec{margin:0;min-width:112px}
${q} .hs-orow .hs-row{gap:6px}
${q} .hs-orow .hs-chip{padding:6px 11px;min-height:30px;font-size:12px}
${q} .hs-mode{appearance:none;text-align:left;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf0ff;border-radius:12px;padding:9px 11px;cursor:pointer;font-family:${FONT};transition:transform .15s,border-color .15s,background .15s}
${q} .hs-mode:hover{transform:translateY(-2px);background:rgba(255,255,255,.12);border-color:var(--ac)}
${q} .hs-mode b{display:block;font-size:15px;font-weight:900;margin-bottom:3px}
${q} .hs-mode span{display:block;font-size:11px;font-weight:600;opacity:.75;line-height:1.35}
${q} .hs-chars{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:6px}
${q} .hs-char{appearance:none;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);border-radius:12px;padding:6px 4px 8px;color:#eaf0ff;cursor:pointer;font:800 11px/1.2 ${FONT};display:flex;flex-direction:column;align-items:center;gap:3px}
${q} .hs-char canvas{width:54px;height:54px}
${q} .hs-char.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 35%,transparent)}
${q} .hs-char small{font-weight:700;opacity:.7;font-size:10px}
${q} .hs-info{margin-top:8px;padding:8px 12px;border-radius:12px;background:rgba(0,0,0,.28);font-size:13px;font-weight:600;line-height:1.45}
${q} .hs-info b{color:var(--ac)}
${q} .hs-help{margin:14px 0 0;font-size:12px;font-weight:600;opacity:.65;line-height:1.55}
${q} .hs-help kbd{background:rgba(255,255,255,.14);border-radius:5px;padding:1px 6px;font:800 11px ${FONT}}
${q} .hs-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
${q} .hs-play{position:relative;width:100%}
${q} .hs-stage{position:relative;margin:0 auto;container-type:inline-size;border-radius:14px;overflow:hidden;background:#000;line-height:0}
${q} .hs-stage canvas{width:100%!important;border-radius:0;touch-action:none;-webkit-touch-callout:none;display:block}
${q} .hs-ov{position:absolute;inset:0;z-index:3;display:grid;place-items:center;padding:3cqw;background:rgba(6,10,26,.72);backdrop-filter:blur(4px);color:#eaf0ff;line-height:1.3;overflow:auto}
${q} .hs-oc{width:min(100%,520px);text-align:center;padding:2.4cqw 3cqw}
${q} .hs-oh{margin:0 0 1.2cqw;font:900 clamp(20px,5.2cqw,44px)/1.05 ${FONT};letter-spacing:-.02em}
${q} .hs-op{margin:0 0 2cqw;font-weight:700;font-size:clamp(11px,2cqw,16px);opacity:.88}
${q} .hs-ob{display:flex;flex-wrap:wrap;gap:1.4cqw;justify-content:center;margin-top:1.6cqw}
${q} .hs-ob .hs-go{padding:clamp(8px,1.6cqw,14px) clamp(12px,2.4cqw,22px);min-height:0;font-size:clamp(11px,2cqw,16px)}
${q} .hs-stat{display:flex;gap:2cqw;justify-content:center;margin:0 0 2cqw;flex-wrap:wrap}
${q} .hs-stat div{background:rgba(255,255,255,.1);border-radius:10px;padding:.9cqw 2cqw;min-width:11cqw}
${q} .hs-stat span{display:block;font:900 clamp(8px,1.4cqw,11px) ${FONT};letter-spacing:.1em;text-transform:uppercase;opacity:.65}
${q} .hs-stat b{font:900 clamp(14px,3.2cqw,26px) ${FONT}}
${q} .hs-pad{display:none;justify-content:space-between;align-items:flex-end;gap:10px;padding:10px 4px 2px;touch-action:none;user-select:none;-webkit-user-select:none}
${q} .hs-pad.on{display:flex}
${q} .hs-pg{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
${q} .hs-pg.r{justify-content:flex-end}
${q} .hs-pb{width:clamp(54px,17vw,78px);height:clamp(54px,17vw,78px);border-radius:50%;border:3px solid rgba(255,255,255,.55);background:color-mix(in srgb,var(--ac) 55%,#14204a);color:#fff;font:900 clamp(11px,3.3vw,15px)/1.1 ${FONT};display:grid;place-items:center;text-align:center;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:0 5px 0 rgba(0,0,0,.35)}
${q} .hs-pb.mv{border-radius:22px;width:clamp(62px,19vw,92px);background:#27386b}
${q} .hs-pb.on{filter:brightness(1.5);transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
${q} .hs-pb.big{width:clamp(66px,21vw,96px);height:clamp(66px,21vw,96px)}
${q} .hs-pb.gold{background:#c78a07}
@media (max-width:640px){${q} .hs-menu{padding:12px}${q} .hs-chip{padding:7px 11px;font-size:12px}}
`;
  };

  function makeShell(root, api, G) {
    const net = api.net, invited = !!net.invite;
    const saved = api.load() || {};
    const sh = { picks: {}, api, G, root, opt: Object.assign({}, G.defaults, saved.opt || {}), prog: saved.prog || {}, net };
    sh.persist = () => api.save({ opt: sh.opt, prog: sh.prog });
    const STEP = 1 / (G.hz || 60);
    root.innerHTML = '<div class="hs-menu"></div><div class="hs-play" hidden><div class="hs-stage"><div class="hs-ov" hidden></div></div><div class="hs-pad"></div></div>';
    const menuEl = root.children[0], playEl = root.children[1], stage = playEl.children[0], ovEl = stage.children[0], padEl = playEl.children[1];
    const cv = api.canvas(G.W, G.H, stage);
    stage.prepend(cv.canvas);
    stage.style.width = `min(100%, ${G.W}px, calc((100dvh - var(--goff, 250px)) * ${(G.W / G.H).toFixed(4)}))`;
    sh.cv = cv; sh.ctx = cv.ctx; sh.canvas = cv.canvas; sh.W = G.W; sh.H = G.H;
    sh.scale = () => cv.canvas.width / G.W;

    let ac = null, mg = null, nb = null;
    sh.AC = () => {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        mg = ac.createGain(); mg.gain.value = .55; mg.connect(ac.destination);
        nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    sh.tone = (type, f0, f1, dur, vol, at = 0) => {
      const a = sh.AC(); if (!a || vol <= 0) return;
      const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(mg); o.start(t); o.stop(t + dur + .03);
    };
    sh.noise = (ft, f0, f1, q, dur, vol, at = 0, att = .005) => {
      const a = sh.AC(); if (!a || vol <= 0) return;
      const t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nb; s.loop = true; f.type = ft; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(mg); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    };
    const gate = {};
    const BASE_SND = {
      click() { sh.tone('sine', 660, 900, .05, .12); },
      beep() { sh.tone('square', 880, 880, .09, .06); },
      go() { sh.tone('square', 1320, 1320, .3, .07); sh.tone('triangle', 660, 660, .3, .1); },
      whistle() { for (let i = 0; i < 2; i++) { sh.tone('square', 2550, 2550, .15, .035, i * .19); sh.tone('square', 2690, 2690, .15, .03, i * .19 + .02); } },
      cheer() {
        sh.noise('bandpass', 900, 1300, .6, 1.8, .26, 0, .25); sh.noise('bandpass', 2300, 1900, 1, 1.5, .09, .05, .2);
        for (let i = 0; i < 5; i++) { const f = rnd(460, 780); sh.tone('sine', f, f * 1.5, rnd(.3, .6), .035, rnd(0, .7)); }
      },
      buzzer() { sh.tone('sawtooth', 150, 148, .7, .09); sh.tone('square', 152, 150, .7, .05); },
      win() { [523, 659, 784, 1047].forEach((f, i) => { sh.tone('square', f, f, .2, .05, i * .12); sh.tone('triangle', f / 2, f / 2, .26, .09, i * .12); }); sh.tone('triangle', 1047, 1047, .6, .08, .5); },
      lose() { sh.tone('sine', 330, 140, .6, .09); sh.tone('triangle', 220, 90, .8, .08, .2); }
    };
    sh.snd = (n, a, b) => {
      if (api.muted || scr === 'menu') return;
      const f = (G.sounds && G.sounds[n]) || BASE_SND[n];
      if (!f) return;
      const now = performance.now(), gp = (G.sndGap && G.sndGap[n]) || 0;
      if (now < (gate[n] || 0)) return;
      gate[n] = now + gp;
      try { f(sh, a, b); } catch (e) {}
    };
    sh.click = () => { if (!api.muted) { try { BASE_SND.click(); } catch (e) {} } };

    let scr = 'menu', role = 'local', S = null, V = null, plan = null, seats = [], me = 0, acc = 0, rk = 0, snapT = 0, saveT = 0, lastScore = '';
    const inp = [], netIn = [], mem = [];
    let netSeq = {};
    let seq = 0, lastMask = -1, lastSend = 0, off = 0, gK = -1, evq = [], hooked = false, lobbying = false, touchSeen = matchMedia('(pointer: coarse)').matches;
    const snaps = [];
    const SK = 'gameplay:rs-' + G.id;
    sh.get = () => ({ S, V, seats, me, role, plan, scr });
    sh.isHost = () => role === 'host';
    sh.isOnline = () => role !== 'local';
    sh.show = which => {
      scr = which;
      menuEl.hidden = which !== 'menu' && which !== 'lobby';
      playEl.hidden = !(which === 'play' || which === 'over' || which === 'wait');
    };
    sh.ov = html => { ovEl.innerHTML = html; ovEl.hidden = false; };
    sh.hideOv = () => { ovEl.hidden = true; ovEl.innerHTML = ''; };
    sh.card = (title, text, btns, extra = '') => sh.ov(`<div class="hs-oc"><h3 class="hs-oh">${title}</h3>${text ? `<p class="hs-op">${text}</p>` : ''}${extra}<div class="hs-ob">${btns}</div></div>`);
    sh.btn = (a, text, cls = '', data = '') => `<button type="button" class="hs-go ${cls}" data-a="${a}" ${data}>${text}</button>`;
    sh.orow = (label, html) => `<div class="hs-orow"><span class="hs-sec">${label}</span>${html}</div>`;
    sh.chips = (key, list, cur = sh.opt[key]) => `<div class="hs-row">${list.map(([v, l]) => `<button type="button" class="hs-chip${JSON.stringify(v) === JSON.stringify(cur) ? ' on' : ''}" data-opt="${key}" data-val="${esc(JSON.stringify(v))}">${l}</button>`).join('')}</div>`;
    sh.stats = list => `<div class="hs-stat">${list.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
    sh.endButtons = (extra = '') => {
      if (role === 'local') return extra + sh.btn('rematch', 'Play again') + sh.btn('menu', 'Menu', 'alt');
      if (role === 'host') return extra + sh.btn('rematch', 'Rematch') + sh.btn('lobby', 'Back to lobby', 'alt') + sh.btn('menu', 'Leave', 'alt');
      return '<p class="hs-op" style="width:100%">Waiting for the host to start a rematch…</p>' + sh.btn('menu', 'Leave', 'alt');
    };
    sh.renderMenu = () => { menuEl.innerHTML = G.menu(sh); if (G.menuDone) G.menuDone(sh, menuEl); };

    const localKeys = new Set();
    let tmask = 0;
    const ptr = new Map();
    const keyBit = c => (G.keymap[c] || 0);
    const localMask = () => { let m = tmask; for (const c of localKeys) m |= keyBit(c); return m; };
    padEl.innerHTML = `<div class="hs-pg l">${G.pad.filter(b => b.s === 'l').map(b => `<button type="button" class="hs-pb ${b.c || ''}" data-b="${b.b}">${b.t}</button>`).join('')}</div><div class="hs-pg r">${G.pad.filter(b => b.s === 'r').map(b => `<button type="button" class="hs-pb ${b.c || ''}" data-b="${b.b}">${b.t}</button>`).join('')}</div>`;
    const syncPad = () => padEl.classList.toggle('on', touchSeen);
    syncPad();
    const recompute = () => { tmask = 0; for (const b of ptr.values()) tmask |= b; padEl.querySelectorAll('[data-b]').forEach(el => el.classList.toggle('on', !!(tmask & +el.dataset.b))); };
    padEl.addEventListener('pointerdown', e => {
      const b = e.target.closest('[data-b]'); if (!b) return;
      e.preventDefault(); touchSeen = true; sh.AC();
      ptr.set(e.pointerId, +b.dataset.b); recompute();
    });
    const pmove = e => {
      if (!ptr.has(e.pointerId)) return;
      const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('.hs-pad [data-b]');
      const nb2 = b ? +b.dataset.b : 0;
      if (nb2 && ptr.get(e.pointerId) !== nb2) { ptr.set(e.pointerId, nb2); recompute(); }
    };
    const pup = e => { if (ptr.delete(e.pointerId)) recompute(); };
    api.on(window, 'pointermove', pmove); api.on(window, 'pointerup', pup); api.on(window, 'pointercancel', pup);
    api.on(window, 'pointerdown', e => { if (e.pointerType === 'touch' && !touchSeen) { touchSeen = true; syncPad(); } }, { capture: true });
    api.on(window, 'keydown', e => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (scr === 'play' && keyBit(e.code)) e.preventDefault();
      if (e.repeat) return;
      sh.AC();
      localKeys.add(e.code);
      if (scr === 'menu' && e.code === 'Enter') { const b = menuEl.querySelector('.hs-go:not(.alt)'); if (b) b.click(); }
      else if (scr === 'over' && e.code === 'Enter' && role !== 'guest') { const b = ovEl.querySelector('[data-a="rematch"],[data-a="next"],[data-a="again"]'); if (b) b.click(); }
    });
    api.on(window, 'keyup', e => localKeys.delete(e.code));
    api.on(window, 'blur', () => { localKeys.clear(); ptr.clear(); recompute(); });

    const emit = ev => {
      G.event(V, S, ev, sh);
      if (role === 'host') evq.push(ev);
    };
    sh.emit = emit;

    function sendCfgTo(i) {
      const s = seats[i];
      if (!s || !s.id || s.kind !== 'human' || i === me) return;
      net.sendTo(s.id, { t: 'cfg', k: rk, cfg: plan.cfg, seats: seats.map(q => ({ kind: q.kind, name: q.name, lvl: q.lvl, id: q.id })), me: i, meta: plan.meta });
    }
    function sendCfg() { for (let i = 0; i < seats.length; i++) sendCfgTo(i); }

    sh.begin = (p, resumeS) => {
      plan = p; seats = p.seats; me = Math.max(0, seats.findIndex(s => s.local));
      S = resumeS || G.newSim(p.cfg, seats, p);
      V = G.makeVis(S, sh);
      mem.length = 0; netIn.length = 0; netSeq = {}; acc = 0; evq = []; snapT = 0; lastScore = '';
      role = p.online ? 'host' : 'local';
      rk++;
      sh.show('play'); sh.hideOv();
      if (G.begin) G.begin(sh, S, V, !!resumeS);
      if (role === 'host') sendCfg();
      frame(0, performance.now());
    };

    function endMatch() {
      if (scr !== 'play') return;
      scr = 'over';
      if (role === 'host') { try { sessionStorage.removeItem(SK); } catch (e) {} flushSnap(performance.now()); }
      const h = G.overHtml(sh, S, plan, seats, me);
      if (h) sh.ov(h);
    }

    function simStep(lm) {
      for (let i = 0; i < seats.length; i++) {
        const s = seats[i];
        inp[i] = s.kind === 'human' ? (i === me ? lm : (netIn[i] | 0)) : G.ai(S, i, mem[i] || (mem[i] = {}), STEP, s, sh);
      }
      G.step(S, inp, STEP, emit);
    }
    function flushSnap(now) {
      snapT = now;
      const p = G.pack(S);
      net.send({ t: 's', T: Math.round(now), k: rk, a: p.a, d: p.d, f: evq }, !evq.length);
      evq = [];
    }
    function sendInput(m, now) {
      if (m !== lastMask || now - lastSend > 60) {
        const ch = m !== lastMask; lastMask = m; lastSend = now;
        net.send({ t: 'i', m, s: ++seq }, !ch);
      }
    }
    function guestFrame(now) {
      if (!snaps.length) return;
      const t = now + off - G.delay;
      let i = snaps.length - 1; while (i > 0 && snaps[i].T > t) i--;
      const a = snaps[i], b = snaps[i + 1];
      for (const s of snaps) if (!s.done && s.T <= t) { s.done = 1; if (s.k === gK && s.f) for (const e of s.f) G.event(V, S, e, sh); }
      const same = b && b.k === a.k && b.T - a.T < 300;
      const u = same ? clamp((t - a.T) / ((b.T - a.T) || 1), 0, 1) : 0;
      const A = a.a, B = same ? b.a : A;
      const arr = new Array(A.length);
      for (let j = 0; j < A.length; j++) arr[j] = A[j] + ((B[j] === undefined ? A[j] : B[j]) - A[j]) * u;
      G.unpack(S, arr, a.d);
      while (snaps.length > 3 && snaps[1].T < t - 1500) snaps.shift();
    }
    function frame(dt, now) {
      if (!S || (scr !== 'play' && scr !== 'over')) return;
      const lm = localMask();
      if (role === 'guest') { sendInput(lm, now); guestFrame(now); }
      else {
        if (scr === 'play') {
          acc += dt; let n = 0;
          while (acc >= STEP && n < 8) { acc -= STEP; n++; simStep(lm); if (S.over) break; }
          if (n >= 8) acc = 0;
        }
        if (role === 'host') {
          if (now - snapT >= G.snapMs) flushSnap(now);
          if (now - saveT > 1000 && scr === 'play') { saveT = now; saveResume(); }
        }
      }
      sh.alpha = role === 'guest' ? 1 : clamp(acc / STEP, 0, 1);
      G.vis(V, S, dt, sh);
      G.render(sh.ctx, S, V, sh);
      const st = G.scoreText ? G.scoreText(S) : '';
      if (st !== lastScore) { lastScore = st; api.score(st); }
      if (scr === 'play' && G.result(S)) endMatch();
    }
    api.loop((dt, now) => { if (scr === 'play' || scr === 'over') frame(dt, now); });

    function saveResume() {
      if (role !== 'host' || !S || S.over || !plan) return;
      try { sessionStorage.setItem(SK, JSON.stringify({ code: net.code, at: Date.now(), cfg: plan.cfg, S, meta: plan.meta, seats: seats.map(s => ({ kind: s.kind, name: s.name, lvl: s.lvl })) })); } catch (e) {}
    }

    function toMenu() {
      if (role !== 'local' || scr === 'wait' || scr === 'lobby' || scr === 'over') { try { net.close(); } catch (e) {} }
      role = 'local'; S = null; plan = null; sh.hideOv();
      sh.show('menu'); sh.renderMenu(); api.score('—');
    }
    sh.toMenu = toMenu;

    function hook() {
      if (hooked) return;
      hooked = true;
      net.on('data', (m, from) => {
        if (!m) return;
        if (role === 'host') {
          if (m.t === 'h') { sh.picks[from] = m.v; return; }
          if (m.t === 'i') {
            const i = seats.findIndex(s => s.id === from);
            if (i < 0 || i === me) return;
            if (typeof m.s === 'number' && m.s < (netSeq[i] || 0) - 50) return;
            netSeq[i] = Math.max(netSeq[i] || 0, m.s | 0);
            netIn[i] = m.m | 0;
          }
          return;
        }
        if (m.t === 'cfg') {
          plan = { cfg: m.cfg, seats: m.seats, online: true, meta: m.meta };
          seats = m.seats.map(s => Object.assign({}, s)); me = m.me | 0; seats[me].local = true;
          S = G.newSim(m.cfg, seats, plan); V = G.makeVis(S, sh);
          snaps.length = 0; off = 0; gK = m.k; lastMask = -1; role = 'guest'; lastScore = '';
          sh.show('play'); sh.hideOv();
          if (G.begin) G.begin(sh, S, V, false);
        } else if (m.t === 's' && role === 'guest' && Array.isArray(m.a)) {
          let j = snaps.length;
          while (j > 0 && snaps[j - 1].T > m.T) j--;
          if (j > 0 && snaps[j - 1].T === m.T) return;
          if (j === snaps.length) {
            const o = m.T - performance.now();
            off = !snaps.length || o > off || o < off - 400 ? o : off + (o - off) * .02;
          }
          snaps.splice(j, 0, m); if (snaps.length > 60) snaps.shift();
        }
      });
      net.on('leave', p => {
        if (role !== 'host' || !p) return;
        const i = seats.findIndex(s => s.id === p.id);
        if (i < 0 || seats[i].kind !== 'human') return;
        seats[i] = Object.assign({}, seats[i], { kind: 'cpu', id: null, lvl: sh.opt.cpu == null ? 2 : sh.opt.cpu });
        api.toast(p.name + ' left. A bot takes over.');
      });
      net.on('rejoin', p => {
        if (role !== 'host' || !p || !plan) return;
        const i = seats.findIndex(s => s.id === p.id);
        if (i >= 0) sendCfgTo(i);
      });
      net.on('lobby', () => { if (role === 'guest' || scr === 'wait' || scr === 'over') goOnline(); });
      net.on('close', why => {
        if (role === 'local' && scr !== 'wait') return;
        role = 'local'; S = null;
        sh.show('play');
        sh.card(why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost', why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.', sh.btn('menu', 'Menu'));
        scr = 'over'; sh.snd('lose');
      });
    }

    function mapSaved(sv, players) {
      const used = new Set(), out = [];
      sv.seats.forEach((s, i) => {
        if (s.kind !== 'human') { out.push({ kind: 'cpu', name: s.name, lvl: s.lvl }); return; }
        let p = players.find(q => !used.has(q.id) && q.name === s.name);
        if (!p && i === 0) p = players.find(q => q.host);
        if (p) { used.add(p.id); out.push({ kind: 'human', name: p.name, id: p.id, local: p.id === net.id }); }
        else out.push({ kind: 'cpu', name: s.name + ' (bot)', lvl: sh.opt.cpu == null ? 2 : sh.opt.cpu });
      });
      return out;
    }
    function hostReady(r) {
      const p = G.onlinePlan(sh, r);
      p.online = true;
      p.seats.forEach(s => { s.local = s.id === net.id; });
      let sv = null;
      try { const x = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (x && x.code === net.code && x.S && Date.now() - x.at < 432e5 && !x.S.over) sv = x; } catch (e) {}
      if (!sv) return sh.begin(p);
      sh.show('play');
      ctxClear();
      sh.card('Game in progress', G.resumeInfo ? G.resumeInfo(sv.S) : 'A saved game was found.', sh.btn('resume', 'Resume game') + sh.btn('newgame', 'New game', 'alt') + sh.btn('menu', 'Leave', 'alt'));
      sh.pendingResume = { sv, p };
    }
    async function goOnline() {
      if (lobbying) return;
      hook(); lobbying = true; role = 'local'; S = null; sh.picks = {}; sh.hideOv();
      sh.show('lobby');
      sh.renderMenu();
      const r = await net.room(G.room(sh));
      lobbying = false;
      if (!api.alive) return;
      if (!r) { toMenu(); return; }
      if (r.role === 'host') {
        if (G.hello && r.players.length > 1) await new Promise(res => api.timeout(res, 800));
        if (!api.alive) return;
        hostReady(r);
      } else {
        if (G.hello) net.send({ t: 'h', v: G.hello(sh) });
        role = 'local'; sh.show('wait'); ctxClear();
        sh.card('Connected', 'Waiting for the host to start…', sh.btn('menu', 'Leave', 'alt'));
      }
    }
    function ctxClear() { sh.ctx.fillStyle = '#0b1226'; sh.ctx.fillRect(0, 0, G.W, G.H); }
    sh.goOnline = goOnline;

    const act = (name, ds) => {
      sh.click();
      if (name === 'online') return goOnline();
      if (name === 'menu') return toMenu();
      if (name === 'lobby') return goOnline();
      if (name === 'rematch') {
        if (role === 'guest') return;
        const p = G.rematchPlan ? G.rematchPlan(sh, plan, S) : plan;
        return sh.begin(Object.assign({}, p));
      }
      if (name === 'resume' && sh.pendingResume) {
        const { sv, p } = sh.pendingResume; sh.pendingResume = null;
        p.cfg = sv.cfg; p.meta = sv.meta; p.seats = mapSaved(sv, net.players);
        return sh.begin(p, sv.S);
      }
      if (name === 'newgame' && sh.pendingResume) { const { p } = sh.pendingResume; sh.pendingResume = null; try { sessionStorage.removeItem(SK); } catch (e) {} return sh.begin(p); }
      G.act(sh, name, ds || {});
    };
    sh.act = act;
    const click = e => {
      const o = e.target.closest('[data-opt]');
      if (o && menuEl.contains(o)) { sh.opt[o.dataset.opt] = JSON.parse(o.dataset.val); sh.persist(); sh.click(); const y = menuEl.scrollTop; sh.renderMenu(); menuEl.scrollTop = y; return; }
      const a = e.target.closest('[data-a]');
      if (a && !a.disabled) act(a.dataset.a, Object.assign({}, a.dataset));
    };
    menuEl.addEventListener('click', click);
    ovEl.addEventListener('click', click);

    sh.start = () => {
      if (invited) goOnline(); else toMenu();
    };
    sh.destroy = () => { try { if (ac) ac.close(); } catch (e) {} ac = null; };
    return sh;
  }

  function register(G) {
    Ameplay.register(Object.assign({ category: 'Sports', css: baseCss(G.id, G.accent) + (G.css || '') }, G.reg, {
      id: G.id,
      mount(root, api) {
        const sh = makeShell(root, api, G);
        sh.start();
        return { destroy() { sh.destroy(); } };
      }
    }));
  }

  const SVC = { GY: 400, K: .5, NX0: 480, NX1: 520, NTOP: 140, NBOUNCE: 130, MVX: 15, MVY: 22, FUDGE: 5, SR: 100, BR: 25, LIM: [[50, 445], [555, 950]] };
  const SV_AI = [
    { name: 'Rookie Slime', short: 'Rookie', col: '#7fd1ff', tag: 'Slow and sloppy' },
    { name: 'Pathetic White Slime', short: 'Pathetic White', col: '#ffffff', tag: 'The classic first opponent' },
    { name: 'Angry Red Slime', short: 'Angry Red', col: '#e5231f', tag: 'Fast and mean' },
    { name: 'Slime Master', short: 'Slime Master', col: '#1b1b22', tag: 'The legendary one' }
  ];
  const SV_COLS = ['#27c24c', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6'];
  const SV_STAGES = [
    { name: 'Sky', sky: ['#4aa8ff', '#b9e6ff'], ground: '#e0bd78', gdark: '#b5935a', txt: '#3b2a10', ball: '#ffe94d' },
    { name: 'Cave', sky: ['#143018', '#2a5a2f'], ground: '#4a4a52', gdark: '#2e2e35', txt: '#ffffff', ball: '#9ab4ff' },
    { name: 'Sunset', sky: ['#5a2d6e', '#ff9a56'], ground: '#7a5a46', gdark: '#4d3829', txt: '#ffffff', ball: '#ffffff' }
  ];

  const svServe = (S, team) => {
    S.ball = { x: team ? 800 : 200, y: 356, vx: 0, vy: 0, px: team ? 800 : 200, py: 356 };
    S.sl.forEach((s, i) => {
      const t = i & 1, k = i >> 1;
      s.x = s.px = t ? [800, 620][k] : [200, 380][k]; s.y = s.py = 0; s.vx = 0; s.vy = 0;
    });
    S.serve = team;
  };
  function svNew(cfg) {
    const S = { cfg, n: cfg.n, sl: [], ball: null, sc: [0, 0], serve: 0, phase: 'ready', pt: 1.3, over: 0, win: -1, last: -1, pm: [], rally: 0, hits: 0, tt: 0 };
    for (let i = 0; i < cfg.n; i++) S.sl.push({ x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, jump: 0 });
    svServe(S, 0);
    return S;
  }
  function svCollide(S, s, i, emit) {
    const b = S.ball, dx = 2 * (b.x - s.x), dy = b.y - s.y, dist = Math.trunc(Math.sqrt(dx * dx + dy * dy));
    const dvx = b.vx - s.vx, dvy = b.vy - s.vy;
    if (dy > 0 && dist < SVC.BR + SVC.SR && dist > SVC.FUDGE) {
      b.x = s.x + Math.trunc(Math.trunc((SVC.SR + SVC.BR) / 2) * dx / dist);
      b.y = s.y + Math.trunc((SVC.SR + SVC.BR) * dy / dist);
      const something = Math.trunc((dx * dvx + dy * dvy) / dist);
      if (something <= 0) {
        b.vx += Math.trunc(s.vx - 2 * dx * something / dist);
        b.vy += Math.trunc(s.vy - 2 * dy * something / dist);
        b.vx = clamp(b.vx, -SVC.MVX, SVC.MVX); b.vy = clamp(b.vy, -SVC.MVY, SVC.MVY);
        emit([0, i, Math.min(1, (Math.abs(b.vx) + Math.abs(b.vy)) / 30)]);
        S.hits++;
      }
    }
  }
  function svStep(S, inp, dt, emit) {
    if (S.over) return;
    S.tt += dt;
    if (S.phase === 'ready') { S.pt -= dt; if (S.pt <= 0) { S.phase = 'play'; emit([5]); } return; }
    if (S.phase === 'point') {
      S.pt -= dt;
      if (S.pt <= 0) { svServe(S, S.last); S.phase = 'play'; S.rally = 0; S.hits = 0; }
      return;
    }
    const b = S.ball;
    b.px = b.x; b.py = b.y;
    for (let i = 0; i < S.n; i++) {
      const s = S.sl[i], m = inp[i] | 0, t = i & 1;
      s.px = s.x; s.py = s.y;
      const l = m & 1, r = m & 2;
      s.vx = l && r ? 0 : l ? -8 : r ? 8 : 0;
      if (s.y === 0 && (m & 4)) { s.vy = 31; emit([6, i]); }
      if (s.vx !== 0) s.x = clamp(s.x + s.vx, SVC.LIM[t][0], SVC.LIM[t][1]);
      if (s.vy !== 0 || s.y > 0) {
        s.vy -= 2; s.y += s.vy;
        if (s.y < 0) { s.y = 0; s.vy = 0; emit([7, i]); }
      }
    }
    b.vy -= 1;
    if (b.vy < -SVC.MVY) b.vy = -SVC.MVY;
    b.x += b.vx; b.y += b.vy;
    for (let i = 0; i < S.n; i++) svCollide(S, S.sl[i], i, emit);
    if (b.x < 15) { b.x = 15; b.vx = -b.vx; emit([2, 1]); }
    else if (b.x > 985) { b.x = 985; b.vx = -b.vx; emit([2, 1]); }
    if (b.x > SVC.NX0 && b.x < SVC.NX1 && b.y < SVC.NTOP) {
      if (b.vy < 0 && b.y > SVC.NBOUNCE) { b.vy *= -1; b.y = SVC.NBOUNCE; emit([1]); }
      else if (b.x < 500) { b.x = SVC.NX0; if (b.vx >= 0) b.vx = -b.vx; emit([1]); }
      else { b.x = SVC.NX1; if (b.vx <= 0) b.vx = -b.vx; emit([1]); }
    }
    if (b.y < 0) {
      b.y = 0;
      const w = b.x > 500 ? 0 : 1;
      S.sc[w]++; S.last = w;
      emit([3, w, b.x]);
      if (S.sc[w] >= S.cfg.win) { S.over = 1; S.win = w; emit([4, w]); }
      else { S.phase = 'point'; S.pt = .85; }
    }
  }

  const svMirror = (t, v) => t ? v : 1000 - v;
  function svLogicWhite(c, o) {
    const m = c.mem;
    if (c.bW < 500) m.state = -1;
    const xb = c.xBelow(125);
    let some;
    if (c.me.y > 0 && c.mW < 575) some = 0; else some = o.s0 + Math.trunc(o.s1 * Math.random());
    if (m.state !== -1 || (c.bVX === 0 && c.bW === 800)) {
      if (m.state === -1) {
        if (c.eW > 250) m.state = 0; else m.state = 1;
        if (Math.random() < .35) m.state = Math.trunc(2 * Math.random());
      }
      if (m.state === 0) { if (c.ball.y < 300 && c.ball.vy < -3) { c.toWall(); c.jump(); } }
      else if (m.state === 1) { if (c.ball.y < 300 && c.ball.vy < 0) { c.toNet(); c.jump(); } }
      return;
    }
    if (xb < 500) {
      if (Math.abs(c.mW - 666) < 20) c.stop(); else if (c.mW > 666) c.toNet(); else c.toWall();
      return;
    }
    if (Math.abs(c.mW - xb) < some) {
      if (c.me.y !== 0 || Math.random() < .3) return;
      const pj = () => { if (Math.random() <= o.j) c.jump(); };
      if ((c.mW >= 900 && c.bW > 830) || (c.mW <= 580 && c.bW < 530 && Math.abs(c.bW - c.mW) < 100)) pj();
      else if ((Math.pow(c.bW - c.mW, 2) * 2 + Math.pow(c.ball.y - c.me.y, 2) < 28900) && c.bW !== c.mW) pj();
      else if ((c.bVX * c.bVX + c.ball.vy * c.ball.vy < 20) && (c.bW - c.mW < 30) && c.bW !== c.mW) pj();
      else if (Math.abs(c.bW - c.mW) < 150 && c.ball.y > 50 && c.ball.y < 400 && Math.random() < o.p4) pj();
    }
    if (m.state === -1) {
      if (c.me.y === 0) {
        if (Math.abs(c.mW - xb) < some) c.stop();
        else if (xb + some < c.mW) c.toNet();
        else if (xb + some > c.mW) c.toWall();
      } else {
        if (c.mW < 575) return;
        if (c.mW > 900) { c.toWall(); return; }
        if (Math.abs(c.mW - c.bW) < some) c.stop();
        else if (c.bW < c.mW) c.toNet();
        else if (c.bW > c.mW) c.toWall();
      }
    }
  }
  function svLogicRed(c) {
    const m = c.mem;
    if (c.bW < 500) m.state = -1;
    const xb = c.xBelow(125);
    let some;
    if (c.me.y > 0 && c.mW < 575) some = 0; else some = 23 + Math.trunc(15 * Math.random());
    if (m.state !== -1 || (c.bVX === 0 && c.bW === 800)) {
      if (m.state === -1) {
        if (c.eW > 250) m.state = 0; else if (c.eW < 200) m.state = 1; else if (c.eW < 250) m.state = 2;
        if (Math.random() < .35) m.state = Math.trunc(3 * Math.random());
      }
      if (m.state === 0) { if (c.ball.y < 300 && c.ball.vy < -3) { c.toWall(); c.jump(); } }
      else if (m.state === 1) { if (c.ball.y < 300 && c.ball.vy < 0) { c.toNet(); c.jump(); } }
      else if (m.state === 2) {
        if (c.ball.vy > 12 && c.mW < 860) c.toWall();
        if (c.mW >= 860) c.stop();
        if (c.ball.vy === -3 && c.mW !== 800) c.jump();
        if (c.ball.vy < -12 && c.me.y !== 0 && c.mW >= 845) c.toNet();
      }
      return;
    }
    if (xb < 500) {
      if (Math.abs(c.mW - 800) < 20) c.stop(); else if (c.mW > 800) c.toNet(); else c.toWall();
      return;
    }
    if (Math.abs(c.mW - xb) < some) {
      if (c.me.y !== 0 || Math.random() < .3) return;
      const pj = () => { if (Math.random() <= .4) c.jump(); };
      if ((c.mW >= 900 && c.bW > 830) || (c.mW <= 580 && c.bW < 530 && Math.abs(c.bW - c.mW) < 100)) pj();
      else if ((Math.pow(c.bW - c.mW, 2) * 2 + Math.pow(c.ball.y - c.me.y, 2) < 28900) && c.bW !== c.mW) pj();
      else if ((c.bVX * c.bVX + c.ball.vy * c.ball.vy < 20) && (c.bW - c.mW < 30) && c.bW !== c.mW) pj();
      else if (Math.abs(c.bW - c.mW) < 150 && c.ball.y > 50 && c.ball.y < 400 && Math.random() < .5) pj();
    }
    if (m.state === -1) {
      if (c.me.y === 0) {
        if (Math.abs(c.mW - xb) < some) c.stop();
        else if (xb + some < c.mW) c.toNet();
        else if (xb + some > c.mW) c.toWall();
      } else {
        if (c.mW < 575) return;
        if (c.mW > 900) { c.toWall(); return; }
        if (Math.abs(c.mW - c.bW) < some) c.stop();
        else if (c.bW < c.mW) c.toNet();
        else if (c.bW > c.mW) c.toWall();
      }
    }
  }
  function svServeMaster(c) {
    const m = c.mem;
    if (m.state === -1) {
      if (Math.random() < .3) {
        if (c.eW < 30) m.state = 0; else if (c.eW > 200) m.state = 1; else m.state = 2;
      } else m.state = 2;
      if (Math.random() < .3) m.state = Math.trunc(Math.random() * 3);
    }
    if (m.state === 0 || m.state === 1) {
      const j = m.state === 0 ? 860 : 840;
      if (c.ball.vy > 12 && c.mW < j) c.toWall();
      if (c.mW > j) c.stop();
      if (c.ball.vy === -3 && c.mW !== 800) c.jump();
      if (m.state === 0 && c.ball.vy < -12 && c.me.y !== 0 && c.mW >= j - 15) c.toNet();
      if (c.bW < 700) m.state = -1;
    } else if (m.state === 2) {
      const limit = 770;
      if (c.ball.vy > 12 && c.mW > limit) c.toNet();
      if (c.mW <= limit) c.stop();
      if (c.ball.vy === -2 && c.mW !== 800) c.jump();
      if (c.me.y !== 0 && c.bW > 800) {
        m.state = 3;
        const prob = c.eW < 200 ? .7 : c.eW > 300 ? .3 : .5;
        if (Math.random() < prob) m.state++;
      }
    } else if (m.state === 3) {
      const limit = 585;
      if (c.mW > limit) c.toNet();
      if (c.mW <= limit) c.stop();
      if (c.bW <= 730) c.jump();
      if (c.bW < 540) m.state = -1;
    } else if (m.state === 4) {
      const limit = 585;
      if (c.mW > limit) c.toNet();
      if (c.mW <= limit) c.stop();
      if (c.bW <= 730) c.jump();
      if (c.bW < 600) c.toWall();
      if (c.bW < 580) c.stop();
      if (c.bW < 540) m.state = -1;
    }
  }
  function svLogicMaster(c) {
    const m = c.mem;
    if (m.state !== -1 || (c.bW === 800 && c.bVX === 0)) { svServeMaster(c); return; }
    if (c.bW < 500) m.state = -1;
    const xb = c.xBelowMe(c.me.y + c.me.vy + 30);
    const some = xb < 600 ? 0 : xb < 700 ? 10 : 20;
    if (xb < 450) {
      if (Math.abs(c.mW - 666) < 10) c.stop(); else if (666 < c.mW) c.toNet(); else if (666 > c.mW) c.toWall();
    } else if (Math.abs(c.mW - xb - some) < 10) c.stop();
    else if (xb + some < c.mW) c.toNet();
    else if (xb + some > c.mW) c.toWall();
    if ((c.mW <= 900 || Math.random() >= .4) && xb >= 620 && (c.ball.y >= 130 || c.ball.vy >= 0) && Math.random() >= .6) {
      if ((c.mW >= 900 && c.bW > 830) || (c.mW <= 580 && c.bW < 530 && Math.abs(c.bW - c.mW) < 100)) c.jump();
      else if (c.bW !== c.mW && Math.pow(c.bW - c.mW, 2) * 2 + Math.pow(c.ball.y - c.me.y, 2) < 185 * 185) c.jump();
      else if (c.bW !== c.mW && c.bVX * c.bVX + c.ball.vy * c.ball.vy < 20 && c.bW - c.mW < 30) c.jump();
      else if (Math.abs(c.bW - c.mW) < 150) { if (c.ball.y > 50 && c.ball.y < 250) c.jump(); }
    }
  }
  function svAI(S, i, mem, dt, seat) {
    const lvl = seat.lvl == null ? 2 : seat.lvl, t = i & 1, me = S.sl[i], ball = S.ball;
    if (S.phase !== 'play') { return 0; }
    if (mem.state === undefined) { mem.state = -1; mem.mv = 0; mem.age = 0; }
    const M = v => svMirror(t, v);
    let bx = ball.x, by = ball.y, bvx = ball.vx, bvy = ball.vy;
    if (lvl === 0) {
      mem.age = (mem.age || 0) - 1;
      if (mem.age <= 0 || !mem.snap) { mem.age = 11; mem.snap = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy }; }
      else { mem.snap.x += mem.snap.vx; mem.snap.y += mem.snap.vy; mem.snap.vy -= 1; }
      bx = mem.snap.x; by = mem.snap.y; bvx = mem.snap.vx; bvy = mem.snap.vy;
    }
    const ballM = { y: by, vy: bvy };
    const enemies = S.sl.filter((_, k) => (k & 1) !== t);
    const e = enemies[0];
    const c = {
      mem, me, ball: ballM, mW: M(me.x), bW: M(bx), bVX: t ? bvx : -bvx, eW: t ? e.x : 1000 - e.x,
      toNet() { mem.mv = 1; }, toWall() { mem.mv = 2; }, stop() { mem.mv = 0; }, jump() { mem.jmp = true; },
      xBelow(limit) {
        let y = ballM.y, vy = ballM.vy, n = 0;
        for (; n < 400; n++) { vy--; y += vy; if (y <= limit) break; }
        let w = c.bW, v = c.bVX;
        for (let k = 0; k < n; k++) { w += v; if (w < 0) { w = 0; v = -v; } else if (w > 1000) { w = 1000; v = -v; } }
        return w;
      },
      xBelowMe(limit) {
        let y = ballM.y, vy = ballM.vy, w = c.bW, v = c.bVX;
        for (let k = 0; k < 400; k++) {
          vy--; y += vy;
          if (y <= limit) return w;
          w += v;
          if (w <= 0) { w = 0; v = -v; } else if (w >= 1000) { w = 1000; v = -v; }
        }
        return w;
      }
    };
    mem.jmp = false;
    let primary = true;
    if (S.n > 2) {
      const mates = S.sl.map((s, k) => k).filter(k => (k & 1) === t);
      const land = c.bW < 500 ? 666 : c.xBelow(125);
      let best = -1, bd = 1e9;
      for (const k of mates) { const d = Math.abs(M(S.sl[k].x) - land) + (k === i ? -6 : 0); if (d < bd) { bd = d; best = k; } }
      primary = best === i;
      if (!primary) {
        const other = S.sl[best], tgt = M(other.x) < 760 ? 910 : 640;
        mem.mv = Math.abs(c.mW - tgt) < 22 ? 0 : tgt < c.mW ? 1 : 2;
        const dxm = Math.abs(c.bW - c.mW);
        if (me.y === 0 && dxm < 90 && by < 230 && by > 40 && bvy < 0 && c.bW > 500) mem.jmp = true;
      }
    }
    if (primary) {
      if (lvl <= 1) svLogicWhite(c, lvl === 0 ? { s0: 45, s1: 40, j: .5, p4: .4 } : { s0: 25, s1: 10, j: .85, p4: .666 });
      else if (lvl === 2) svLogicRed(c);
      else svLogicMaster(c);
    }
    let m = 0;
    if (mem.mv === 1) m |= t ? 1 : 2; else if (mem.mv === 2) m |= t ? 2 : 1;
    if (mem.jmp) m |= 4;
    return m;
  }

  const SV_EV = { hit: 0, net: 1, wall: 2, point: 3, win: 4, serve: 5, jump: 6, land: 7 };
  function svVis(S) {
    return { parts: [], rot: 0, ptxt: '', ptT: 0, pw: -1, pupil: [], shake: 0, conf: [], bgc: null, bgk: -1, bsc: 0, hitFlash: [0, 0, 0, 0], txtT: 0, readyT: 0 };
  }
  function svEvent(V, S, e, sh) {
    const k = e[0];
    if (k === 0) {
      const v = e[2];
      sh.snd('hit', v);
      const s = S.sl[e[1]]; if (s) { V.hitFlash[e[1]] = .18; for (let j = 0; j < 5; j++) V.parts.push({ x: S.ball.x, y: S.ball.y, vx: rnd(-90, 90), vy: rnd(60, 220) * v, life: rnd(.25, .5), c: '#fff', s: rnd(2, 4.5) }); }
    } else if (k === 1) sh.snd('net');
    else if (k === 2) sh.snd('wall');
    else if (k === 3) {
      sh.snd('floor');
      V.pw = e[1]; V.ptT = .85;
      for (let j = 0; j < 14; j++) V.parts.push({ x: e[2], y: 0, vx: rnd(-160, 160), vy: rnd(40, 240), life: rnd(.3, .7), c: SV_STAGES[S.cfg.stage || 0].gdark, s: rnd(2.5, 6) });
    } else if (k === 4) { sh.snd(S.cfg.humanTeam === e[1] || S.cfg.humanTeam == null ? 'win' : 'lose'); for (let j = 0; j < 90; j++) V.conf.push({ x: rnd(0, 1000), y: rnd(-80, 0), vx: rnd(-40, 40), vy: rnd(60, 190), r: rnd(0, 6), c: pick(['#ffd23f', '#ff5d73', '#4cc9f0', '#7ae582', '#fff']), s: rnd(5, 9) }); }
    else if (k === 5) sh.snd('go');
    else if (k === 6) sh.snd('jump');
    else if (k === 7) { const s = S.sl[e[1]]; if (s) for (let j = 0; j < 4; j++) V.parts.push({ x: s.x + rnd(-40, 40), y: 2, vx: rnd(-50, 50), vy: rnd(10, 60), life: rnd(.2, .4), c: SV_STAGES[S.cfg.stage || 0].gdark, s: rnd(2, 4) }); }
  }
  function svVisStep(V, S, dt) {
    V.rot += S.ball.vx * dt * 3;
    for (let i = 0; i < 4; i++) if (V.hitFlash[i] > 0) V.hitFlash[i] -= dt;
    if (V.ptT > 0) V.ptT -= dt;
    for (let i = V.parts.length - 1; i >= 0; i--) { const p = V.parts[i]; p.life -= dt; if (p.life <= 0) { V.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 600 * dt; if (p.y < 0) { p.y = 0; p.vy = 0; } }
    for (let i = V.conf.length - 1; i >= 0; i--) { const p = V.conf[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6; if (p.y > 520) V.conf.splice(i, 1); }
  }

  const svBgCache = {};
  function svBg(sh, st) {
    const sc = Math.min(2, sh.scale()), key = st + '@' + sc;
    if (svBgCache[key]) return svBgCache[key];
    const c = document.createElement('canvas'); c.width = 1000 * sc; c.height = 500 * sc;
    const g = c.getContext('2d'); g.scale(sc, sc);
    const T = SV_STAGES[st], GY = SVC.GY;
    const gr = g.createLinearGradient(0, 0, 0, GY); gr.addColorStop(0, T.sky[0]); gr.addColorStop(1, T.sky[1]);
    g.fillStyle = gr; g.fillRect(0, 0, 1000, GY);
    const R = (() => { let s = 7 + st * 13; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    if (st === 0) {
      g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(850, 80, 42, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,246,176,.25)'; g.beginPath(); g.arc(850, 80, 70, 0, TAU); g.fill();
      for (let i = 0; i < 7; i++) {
        const x = R() * 1000, y = 40 + R() * 170, s = .6 + R() * .9;
        g.fillStyle = 'rgba(255,255,255,.88)';
        for (const [dx, dy, r] of [[0, 0, 26], [28, -8, 32], [60, 0, 24], [30, 8, 26]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); g.fill(); }
      }
      g.fillStyle = '#3f9d5a'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= 1000; x += 20) g.lineTo(x, GY - 60 - Math.sin(x / 130) * 26 - Math.sin(x / 47) * 7); g.lineTo(1000, GY); g.fill();
      g.fillStyle = '#2f7f47'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= 1000; x += 20) g.lineTo(x, GY - 26 - Math.sin(x / 90 + 2) * 16); g.lineTo(1000, GY); g.fill();
    } else if (st === 1) {
      g.fillStyle = '#0c2010';
      for (let i = 0; i < 16; i++) { const x = i * 66 + R() * 30, h = 30 + R() * 90; g.beginPath(); g.moveTo(x - 22, 0); g.lineTo(x + 22, 0); g.lineTo(x + R() * 8 - 4, h); g.fill(); }
      for (const tx of [150, 850]) {
        const gl = g.createRadialGradient(tx, 150, 4, tx, 150, 150); gl.addColorStop(0, 'rgba(255,190,80,.8)'); gl.addColorStop(1, 'rgba(255,150,40,0)');
        g.fillStyle = gl; g.fillRect(tx - 150, 0, 300, 400);
        g.fillStyle = '#5a3b1e'; g.fillRect(tx - 5, 160, 10, 80); g.fillStyle = '#ffb340'; g.beginPath(); g.ellipse(tx, 150, 11, 20, 0, 0, TAU); g.fill();
      }
      g.fillStyle = '#17331a'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= 1000; x += 25) g.lineTo(x, GY - 50 - R() * 40); g.lineTo(1000, GY); g.fill();
    } else {
      g.fillStyle = '#ffe28a'; g.beginPath(); g.arc(500, GY - 40, 90, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,226,138,.25)'; g.beginPath(); g.arc(500, GY - 40, 150, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)';
      for (let i = 0; i < 5; i++) { const y = 70 + i * 36, x = R() * 700; g.fillRect(x, y, 200 + R() * 200, 6); }
      g.fillStyle = '#2d1738';
      for (const px of [90, 910]) {
        g.fillRect(px - 5, GY - 180, 10, 180);
        for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(px, GY - 180); const an = -Math.PI + a * .6 + (px > 500 ? 0 : -.3); g.quadraticCurveTo(px + Math.cos(an) * 60, GY - 230 + Math.sin(an) * 20, px + Math.cos(an) * 110, GY - 170 + Math.abs(Math.sin(an)) * 40); g.lineWidth = 7; g.strokeStyle = '#2d1738'; g.stroke(); }
      }
      g.fillStyle = '#3c2148'; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= 1000; x += 20) g.lineTo(x, GY - 28 - Math.sin(x / 100) * 16); g.lineTo(1000, GY); g.fill();
    }
    const gg = g.createLinearGradient(0, GY, 0, 500); gg.addColorStop(0, T.ground); gg.addColorStop(1, T.gdark);
    g.fillStyle = gg; g.fillRect(0, GY, 1000, 100);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, GY, 1000, 3);
    g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(R() * 1000, GY + 8 + R() * 90, 1 + R() * 3, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(500, GY + 3); g.lineTo(500, GY + 3); g.stroke(); g.setLineDash([]);
    svBgCache[key] = c;
    return c;
  }

  function svDrawSlime(c, S, V, i, al) {
    const s = S.sl[i], t = i & 1, cols = S.cfg.cols, col = cols[i] || '#3c3';
    const x = lerp(s.px, s.x, al), y = lerp(s.py, s.y, al), X = x, Y = SVC.GY - y * SVC.K, r = 50;
    const sq = clamp(s.vy * .0028, -.07, .09);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(X, SVC.GY + 4, r * (1 - Math.min(.5, y / 420)), 6, 0, 0, TAU); c.fill();
    c.save(); c.translate(X, Y); c.scale(1 - sq * .7, 1 + sq);
    const gr = c.createRadialGradient(-r * .3, -r * .55, 4, 0, -r * .15, r * 1.1);
    gr.addColorStop(0, hex(col, .45)); gr.addColorStop(.55, col); gr.addColorStop(1, hex(col, -.35));
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, r, Math.PI, TAU); c.closePath(); c.fill();
    c.lineWidth = 2.4; c.strokeStyle = 'rgba(0,0,0,.45)'; c.stroke();
    if (V.hitFlash[i] > 0) { c.fillStyle = `rgba(255,255,255,${V.hitFlash[i] * 2.2})`; c.beginPath(); c.arc(0, 0, r, Math.PI, TAU); c.closePath(); c.fill(); }
    const dir = t ? -1 : 1, ex = dir * r * .5, ey = -r * .5;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, ey, r / 4, 0, TAU); c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(0,0,0,.5)'; c.stroke();
    const bx = lerp(S.ball.px, S.ball.x, al), by = lerp(S.ball.py, S.ball.y, al);
    let dx = bx - (x + dir * r * .5), dy = (y + r) - by * 1;
    dx = bx - (x + ex); dy = ((Y + ey) - (SVC.GY - by * SVC.K)) * 2;
    const dd = Math.hypot(dx, dy) || 1, po = r / 8;
    c.fillStyle = '#111'; c.beginPath(); c.arc(ex + po * dx / dd, ey + po * dy / dd * 1, r / 8, 0, TAU); c.fill();
    c.restore();
  }
  function svDrawBall(c, S, V, sh, al) {
    const b = S.ball, x = lerp(b.px, b.x, al), y = lerp(b.py, b.y, al), X = x, Y = SVC.GY - y * SVC.K, R = 14.5;
    const h = Math.min(1, y / 900);
    c.fillStyle = `rgba(0,0,0,${.22 - h * .12})`; c.beginPath(); c.ellipse(X, SVC.GY + 5, R * (1 - h * .5), 3.5 * (1 - h * .4), 0, 0, TAU); c.fill();
    c.save(); c.translate(X, Y); c.rotate(V.rot);
    const T = SV_STAGES[S.cfg.stage || 0];
    const gr = c.createRadialGradient(-R * .35, -R * .4, 2, 0, 0, R * 1.1); gr.addColorStop(0, hex(T.ball.length === 7 ? T.ball : '#ffe94d', .55)); gr.addColorStop(.6, T.ball); gr.addColorStop(1, hex(T.ball, -.3));
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(40,30,0,.5)'; c.lineWidth = 1.4;
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
    c.beginPath(); c.arc(-R * 1.05, 0, R * .95, -.9, .9); c.stroke();
    c.beginPath(); c.arc(R * 1.05, 0, R * .95, Math.PI - .9, Math.PI + .9); c.stroke();
    c.beginPath(); c.moveTo(-R * .6, -R * .8); c.quadraticCurveTo(0, -R * .1, R * .6, -R * .8); c.stroke();
    c.restore();
  }
  function svRender(c, S, V, sh) {
    const al = sh.alpha == null ? 1 : sh.alpha, st = S.cfg.stage || 0, T = SV_STAGES[st];
    c.drawImage(svBg(sh, st), 0, 0, 1000, 500);
    const sc = S.sc, win = S.cfg.win;
    for (let t = 0; t < 2; t++) for (let k = 0; k < win; k++) {
      const x = t ? 1000 - 30 - k * 36 : 30 + k * 36;
      c.beginPath(); c.arc(x, 28, 12, 0, TAU);
      if (k < sc[t]) { c.fillStyle = '#ffd62a'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(0,0,0,.55)'; c.stroke(); }
      else { c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); c.lineWidth = 2; c.strokeStyle = T.txt === '#ffffff' ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.6)'; c.stroke(); }
    }
    const nm = S.cfg.names;
    txt(c, nm[0] || '', 30, 58, 15, T.txt === '#ffffff' ? '#fff' : '#fff', 'left', 900, 'rgba(0,0,0,.5)');
    txt(c, nm[1] || '', 970, 58, 15, '#fff', 'right', 900, 'rgba(0,0,0,.5)');
    c.fillStyle = 'rgba(20,20,30,.75)'; c.fillRect(496, SVC.GY - 52, 8, 52); c.beginPath(); c.arc(500, SVC.GY - 52, 4.2, 0, TAU); c.fill();
    c.fillStyle = '#fff';
    c.fillRect(498, SVC.GY - 52, 4, 52);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(500, SVC.GY - 52, 2.2, 0, TAU); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(500, SVC.GY - 52, 2, 52);
    for (let i = 0; i < S.n; i++) svDrawSlime(c, S, V, i, al);
    svDrawBall(c, S, V, sh, al);
    for (const p of V.parts) { c.globalAlpha = clamp(p.life * 3, 0, 1); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, SVC.GY - p.y * SVC.K, p.s, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    const me = sh.get().me, mi = S.sl[me];
    if (mi && S.phase !== 'over') {
      const x = lerp(mi.px, mi.x, al), y = lerp(mi.py, mi.y, al);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); const ay = SVC.GY - y * SVC.K - 62 + Math.sin(S.tt * 6) * 3; c.moveTo(x - 7, ay - 9); c.lineTo(x + 7, ay - 9); c.lineTo(x, ay); c.fill();
    }
    if (S.phase === 'point' && V.pw >= 0) {
      const t = V.pw, label = S.cfg.humanTeam == null ? `${nm[t]} scores!` : t === S.cfg.humanTeam ? 'Nice, you got the point!' : `${nm[t]} scores!`;
      txt(c, label, 500, SVC.GY + 52, 30, T.txt === '#ffffff' ? '#fff' : '#3b2a10', 'center', 900, T.txt === '#ffffff' ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.6)');
    }
    if (S.phase === 'ready') {
      const a = clamp(S.pt * 2, 0, 1);
      c.globalAlpha = a; txt(c, `First to ${win}`, 500, 190, 54, '#fff', 'center', 900, 'rgba(0,0,0,.55)');
      txt(c, S.sc[0] + S.sc[1] === 0 ? 'Get ready' : '', 500, 240, 26, '#fff', 'center', 800, 'rgba(0,0,0,.5)'); c.globalAlpha = 1;
    }
    if (S.phase === 'play' && S.rally === 0 && S.hits === 0 && S.tt < 99999) {
      const sv = S.serve;
      c.globalAlpha = .85; txt(c, sv === 0 ? '◀ serve' : 'serve ▶', S.ball.x, 300 - 0, 16, '#fff', 'center', 900, 'rgba(0,0,0,.55)'); c.globalAlpha = 1;
    }
    for (const p of V.conf) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); }
  }

  const svSnd = {
    hit(sh, v) { v = clamp(v || .5, .15, 1); sh.tone('sine', 190, 70, .12, .45 * v); sh.noise('lowpass', 700, 220, 1, .05, .12 * v); sh.tone('triangle', 420, 160, .05, .08 * v); },
    net() { sh.tone('triangle', 520, 300, .06, .14); sh.noise('highpass', 3000, 3000, .8, .04, .06); },
    wall() { sh.tone('sine', 110, 60, .09, .25); },
    floor() { sh.tone('sine', 150, 50, .22, .5); sh.noise('lowpass', 500, 120, 1, .12, .25); },
    jump() { sh.tone('sine', 260, 520, .09, .06); },
    go() { sh.tone('square', 880, 1320, .12, .05); }
  };

  function svPlan(sh, kind, idx, extra) {
    const o = sh.opt, lvl = kind === 'camp' ? [1, 2, 3][idx] : o.cpu;
    const mode2 = kind === '2v2', n = mode2 ? 4 : 2, ai = SV_AI[lvl];
    const stage = kind === 'camp' ? idx : o.stage;
    const cols = [o.color, ai.col, mode2 ? SV_COLS[(SV_COLS.indexOf(o.color) + 1) % SV_COLS.length] : '', mode2 ? hex(ai.col === '#ffffff' ? '#d8e6ff' : ai.col, ai.col === '#1b1b22' ? .22 : -.25) : ''];
    const seatsA = [{ kind: 'human', name: 'You', local: true }, { kind: 'cpu', name: ai.name, lvl }];
    if (mode2) { seatsA.push({ kind: 'cpu', name: 'Partner', lvl }, { kind: 'cpu', name: ai.name, lvl }); }
    return { cfg: { n, win: kind === 'camp' ? 7 : o.win, stage, cols: cols.slice(0, n), names: ['You', ai.short], humanTeam: 0, lvl }, seats: seatsA, meta: Object.assign({ kind, idx, lvl }, extra || {}) };
  }

  const SV = {
    id: 'slime-volley', accent: '#27c24c', W: 1000, H: 500, hz: 50, snapMs: 33, delay: 100,
    defaults: { cpu: 2, win: 7, stage: 0, color: '#27c24c' },
    keymap: { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, ArrowUp: 4, KeyW: 4, Space: 4 },
    pad: [{ s: 'l', b: 1, t: '◀', c: 'mv' }, { s: 'l', b: 2, t: '▶', c: 'mv' }, { s: 'r', b: 4, t: 'JUMP', c: 'big' }],
    sounds: svSnd, sndGap: { hit: 40, net: 60, wall: 60, jump: 80 },
    room: sh => ({ title: 'Slime Volleyball', sizes: [2, 4], defaultSize: 2, min: 2, max: 4, bots: true }),
    newSim: svNew, step: svStep, ai: svAI, makeVis: svVis, vis: svVisStep, event: svEvent, render: svRender,
    pack(S) {
      const a = [S.ball.x, S.ball.y]; S.sl.forEach(s => a.push(s.x, s.y));
      const d = [S.phase === 'play' ? 0 : S.phase === 'point' ? 1 : 2, S.sc[0], S.sc[1], S.serve, S.over, S.win, Math.round(S.pt * 100), S.last, S.hits, Math.round(S.tt * 10)];
      S.sl.forEach(s => d.push(s.vy));
      d.push(Math.round(S.ball.vx));
      return { a, d };
    },
    unpack(S, a, d) {
      const b = S.ball; b.px = b.x = a[0]; b.py = b.y = a[1];
      S.sl.forEach((s, i) => { s.px = s.x = a[2 + i * 2]; s.py = s.y = a[3 + i * 2]; s.vy = d[10 + i] || 0; });
      S.phase = ['play', 'point', 'ready'][d[0]] || 'play'; S.sc = [d[1], d[2]]; S.serve = d[3]; S.over = d[4]; S.win = d[5]; S.pt = d[6] / 100; S.last = d[7]; S.hits = d[8]; S.tt = d[9] / 10;
      b.vx = d[10 + S.n] || 0;
    },
    result: S => S.over,
    scoreText: S => S.sc[0] + ' : ' + S.sc[1],
    resumeInfo: S => `Saved game: ${S.sc[0]} : ${S.sc[1]}, first to ${S.cfg.win}.`,
    onlinePlan(sh, r) {
      const n = (r.bots ? r.size : r.players.length) > 2 ? 4 : 2;
      const seats = [];
      for (let i = 0; i < n; i++) {
        const p = r.players[i];
        if (p) seats.push({ kind: 'human', name: p.name, id: p.id });
        else seats.push({ kind: 'cpu', name: 'Bot', lvl: sh.opt.cpu });
      }
      const cols = ['#27c24c', '#e5231f', '#14b8a6', '#f59e0b'];
      const teamName = t => n === 2 ? seats[t].name : (seats[t].name + ' & ' + seats[t + 2].name);
      return { cfg: { n, win: sh.opt.win, stage: sh.opt.stage, cols: cols.slice(0, n), names: [teamName(0), teamName(1)], humanTeam: null, lvl: sh.opt.cpu }, seats, meta: { kind: 'online' } };
    },
    rematchPlan(sh, plan, S) {
      const m = plan.meta || {};
      if (m.kind === 'camp') {
        if (S && S.win === 0 && m.idx < 2) return svPlan(sh, 'camp', m.idx + 1, { run: m.run });
        return svPlan(sh, 'camp', 0, { run: { beaten: 0, pts: 0 } });
      }
      return Object.assign({}, plan, { seats: plan.seats.map(s => Object.assign({}, s)) });
    },
    begin(sh, S, V, resumed) { if (resumed) { S.phase = 'ready'; S.pt = 1.6; } },
    overHtml(sh, S, plan, seats, me) {
      const m = plan.meta || {}, myT = me & 1, won = S.win === myT;
      const online = plan.online;
      if (!online && m.kind === 'camp') {
        const run = m.run || { beaten: 0, pts: 0 };
        if (won) {
          const beaten = (run.beaten || 0) + 1, pts = (run.pts || 0) + S.sc[0];
          m.run = { beaten, pts };
          sh.api.submit(beaten * 100 + pts * 10);
          sh.snd('win');
          if (m.idx >= 2) return `<div class="hs-oc"><h3 class="hs-oh">You beat everyone!</h3><p class="hs-op">The Slime Master bows to you.</p>${sh.stats([['Beaten', beaten], ['Points', pts]])}<div class="hs-ob">${sh.btn('rematch', 'Do it all again')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
          return `<div class="hs-oc"><h3 class="hs-oh">You won!</h3><p class="hs-op">${S.sc[0]} : ${S.sc[1]} against ${SV_AI[m.lvl].name}. Next up: ${SV_AI[[1, 2, 3][m.idx + 1]].name}.</p><div class="hs-ob">${sh.btn('rematch', 'Next opponent')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
        }
        return `<div class="hs-oc"><h3 class="hs-oh">You lost :(</h3><p class="hs-op">${SV_AI[m.lvl].name} wins ${S.sc[1]} : ${S.sc[0]}. The campaign restarts from the first slime.</p><div class="hs-ob">${sh.btn('rematch', 'Retry')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
      }
      if (!online) {
        if (won) sh.api.submit(Math.max(1, (m.lvl + 1) * 100 + (S.sc[0] - S.sc[1]) * 10));
        return `<div class="hs-oc"><h3 class="hs-oh">${won ? 'You win!' : 'You lose'}</h3><p class="hs-op">${S.cfg.names[0]} ${S.sc[0]} : ${S.sc[1]} ${S.cfg.names[1]}</p><div class="hs-ob">${sh.endButtons()}</div></div>`;
      }
      return `<div class="hs-oc"><h3 class="hs-oh">${won ? 'You win!' : esc(S.cfg.names[S.win]) + ' wins'}</h3><p class="hs-op">${esc(S.cfg.names[0])} ${S.sc[0]} : ${S.sc[1]} ${esc(S.cfg.names[1])}</p><div class="hs-ob">${sh.endButtons()}</div></div>`;
    },
    menu(sh) {
      const o = sh.opt;
      return `<div class="hs-top"><div><h2 class="hs-logo">SLIME <b>VOLLEYBALL</b></h2><p class="hs-tag">The classic. Bump the ball over the net and make it hit the other side's floor. First to ${o.win}.</p></div></div>
<div class="hs-modes">
<button class="hs-mode" data-a="camp"><b>Campaign</b><span>Beat the Pathetic White Slime, the Angry Red Slime and the legendary Slime Master.</span></button>
<button class="hs-mode" data-a="quick"><b>Quick match 1v1</b><span>One game against a CPU slime of your choice.</span></button>
<button class="hs-mode" data-a="duo"><b>2v2 with a partner</b><span>You and a CPU partner against two CPU slimes.</span></button>
<button class="hs-mode" data-a="online"><b>Play online</b><span>1v1 or 2v2 with friends. Bots can fill empty seats.</span></button>
</div>
<p class="hs-sec">CPU level (quick match, 2v2 and bots)</p>${sh.chips('cpu', SV_AI.map((a, i) => [i, a.short + (i === 3 ? ' (legend)' : '')]))}
<p class="hs-sec">Points to win</p>${sh.chips('win', [[3, '3'], [5, '5'], [7, '7'], [10, '10']])}
<p class="hs-sec">Stage</p>${sh.chips('stage', SV_STAGES.map((s, i) => [i, s.name]))}
<p class="hs-sec">Your slime</p><div class="hs-row">${SV_COLS.map(c => `<button type="button" class="hs-chip${c === o.color ? ' on' : ''}" data-opt="color" data-val="${esc(JSON.stringify(c))}" style="width:44px;padding:0"><i style="display:block;width:20px;height:20px;border-radius:50%;margin:auto;background:${c};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.5)"></i></button>`).join('')}</div>
<p class="hs-help"><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> move, <kbd>↑</kbd> <kbd>W</kbd> or <kbd>Space</kbd> jump. Controller: stick or D-pad, A to jump. On touch screens use the on-screen buttons. ${SV_AI[o.cpu].name}: ${SV_AI[o.cpu].tag}.</p>`;
    },
    act(sh, a) {
      if (a === 'camp') sh.begin(svPlan(sh, 'camp', 0, { run: { beaten: 0, pts: 0 } }));
      else if (a === 'quick') sh.begin(svPlan(sh, '1v1', 0));
      else if (a === 'duo') sh.begin(svPlan(sh, '2v2', 0));
    },
    reg: {
      title: 'Slime Volleyball', tint: '#27c24c',
      blurb: 'The classic semicircle slimes: first to 7. Beat the legendary Slime Master, or play 1v1 and 2v2 online.',
      help: '<kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> move · <kbd>↑</kbd> / <kbd>W</kbd> / <kbd>Space</kbd> jump · touch: on-screen buttons · gamepad: stick + A',
      width: 1000, format: v => v + ' pts', better: 'high',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 52a18 18 0 0 1 36 0z"/><circle cx="31" cy="42" r="3.5"/><path d="M50 52V28"/><circle cx="44" cy="14" r="6"/></svg>'
    }
  };
  register(SV);

  function drawHead(c, d, x, y, r, face, o) {
    o = o || {};
    const lx = o.lx || 0, ly = o.ly || 0, mood = o.mood || 0, mo = o.mouth || 0, bl = o.blink || 0;
    c.save(); c.translate(x, y); c.scale(face, 1);
    const sk = d.sk, st = d.style, hc = d.hair, hc2 = d.hair2 || hex(hc, -.3);
    if (st === 'afro') {
      const g = c.createRadialGradient(-r * .2, -r * .7, r * .2, 0, -r * .3, r * 1.45);
      g.addColorStop(0, hex(hc, .18)); g.addColorStop(1, hc2);
      c.fillStyle = g; c.beginPath(); c.arc(-r * .08, -r * .3, r * 1.28, 0, TAU); c.fill();
    } else if (st === 'long') {
      c.fillStyle = hc2; pathRR(c, -r * 1.12, -r * .7, r * 1.05, r * 2.1, r * .5); c.fill();
    } else if (st === 'hood') {
      c.fillStyle = hc2; c.beginPath(); c.arc(-r * .05, -r * .02, r * 1.22, 0, TAU); c.fill();
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * 1.1, r * .6); c.quadraticCurveTo(-r * 1.9, r * 1.2, -r * 1.3, r * 1.7); c.quadraticCurveTo(-r * .6, r * 1.2, -r * .5, r * .9); c.fill();
    } else if (st === 'swirl') {
      c.strokeStyle = hc; c.lineWidth = r * .38; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r * .8, -r * .5); c.bezierCurveTo(-r * 1.9, -r * .7, -r * 1.9, r * .5, -r * 1.2, r * .4); c.bezierCurveTo(-r * .9, r * .35, -r * 1.1, -r * .1, -r * 1.35, 0); c.stroke();
    } else if (st === 'bun') {
      c.fillStyle = hc; c.beginPath(); c.arc(-r * .55, -r * 1.15, r * .38, 0, TAU); c.fill();
    }
    c.fillStyle = sk; c.beginPath(); c.arc(-r * .98, r * .08, r * .22, 0, TAU); c.fill();
    c.fillStyle = hex(sk, -.18); c.beginPath(); c.arc(-r * .98, r * .08, r * .11, 0, TAU); c.fill();
    const hg = c.createRadialGradient(r * .15, -r * .4, r * .12, 0, 0, r * 1.08);
    hg.addColorStop(0, hex(sk, .38)); hg.addColorStop(.55, sk); hg.addColorStop(1, hex(sk, -.22));
    c.fillStyle = hg; c.beginPath(); c.ellipse(0, 0, r, r * .97, 0, 0, TAU); c.fill();
    c.lineWidth = Math.max(1.5, r * .06); c.strokeStyle = 'rgba(20,10,0,.55)'; c.stroke();
    if (st === 'spiky' || st === 'flame') {
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * .98, -r * .1);
      const n = 6;
      for (let i = 0; i <= n; i++) {
        const a = -Math.PI * 1.02 + (Math.PI * 1.02 * i) / n, ah = a + Math.PI / (2 * n) * 1.0, k = st === 'flame' ? (i % 2 ? 1.62 : 1.38) : (i % 2 ? 1.55 : 1.3);
        c.lineTo(Math.cos(a) * r * 1.0, Math.sin(a) * r * .96);
        if (i < n) c.lineTo(Math.cos(ah) * r * k, Math.sin(ah) * r * k * .98);
      }
      c.lineTo(r * .88, -r * .22); c.quadraticCurveTo(r * .2, -r * .62, -r * .6, -r * .52); c.closePath(); c.fill();
      if (st === 'flame') { c.fillStyle = d.hair2 || '#ffd23f'; c.beginPath(); for (let i = 1; i < 6; i += 2) { const a = -Math.PI * 1.02 + (Math.PI * 1.02 * i) / 6; c.moveTo(Math.cos(a) * r * 1.02, Math.sin(a) * r * .98); c.lineTo(Math.cos(a + .26) * r * 1.38, Math.sin(a + .26) * r * 1.32); c.lineTo(Math.cos(a + .5) * r * 1.02, Math.sin(a + .5) * r * .98); } c.fill(); }
    } else if (st === 'mohawk') {
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * .85, -r * .3);
      for (let i = 0; i < 6; i++) { const u = i / 5; c.lineTo(-r * .85 + u * r * 1.5, -r * (1.35 + Math.sin(u * 3.14) * .5)); c.lineTo(-r * .85 + (u + .1) * r * 1.5, -r * (.95 + Math.sin(u * 3.14) * .3)); }
      c.lineTo(r * .62, -r * .58); c.quadraticCurveTo(0, -r * .7, -r * .85, -r * .3); c.fill();
      c.fillStyle = d.hair2 || hc2; c.beginPath(); c.arc(0, -r * .86, r * .3, 0, TAU); c.fill();
    } else if (st === 'afro') {
      c.fillStyle = hc; c.beginPath(); c.arc(r * .05, -r * .82, r * .4, Math.PI, TAU); c.fill();
    } else if (st === 'long' || st === 'swirl' || st === 'bun' || st === 'band') {
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * 1.0, r * .05); c.bezierCurveTo(-r * 1.2, -r * 1.25, r * .9, -r * 1.35, r * 1.0, -r * .2);
      c.quadraticCurveTo(r * .5, -r * .62, -r * .1, -r * .56); c.quadraticCurveTo(-r * .7, -r * .5, -r * 1.0, r * .05); c.fill();
    } else if (st === 'cap') {
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * 1.02, -r * .12); c.bezierCurveTo(-r * 1.1, -r * 1.3, r * 1.0, -r * 1.3, r * 1.0, -r * .22); c.lineTo(-r * 1.02, -r * .12); c.fill();
      c.fillStyle = hc2; c.beginPath(); c.ellipse(r * .96, -r * .2, r * .56, r * .15, -.06, 0, TAU); c.fill();
      c.fillStyle = d.hair2 || '#fff'; c.beginPath(); c.arc(r * .12, -r * .72, r * .13, 0, TAU); c.fill();
    } else if (st === 'hood') {
      c.fillStyle = hc; c.beginPath(); c.moveTo(-r * 1.05, r * .1); c.bezierCurveTo(-r * 1.1, -r * 1.3, r * 1.05, -r * 1.3, r * 1.05, -r * .12); c.quadraticCurveTo(r * .5, -r * .66, 0, -r * .6); c.quadraticCurveTo(-r * .7, -r * .55, -r * 1.05, r * .1); c.fill();
    } else if (st === 'bald') {
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-r * .1, -r * .7, r * .38, r * .14, -.3, 0, TAU); c.fill();
    }
    if (st === 'band' || d.acc === 'band') {
      c.fillStyle = d.accC || '#fff'; c.save(); c.rotate(-.06); c.fillRect(-r * 1.02, -r * .52, r * 2.04, r * .22); c.restore();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-r * 1.0, -r * .34, r * 2, r * .05);
    }
    const ex1 = r * .12, ex2 = r * .58, ey = -r * .1, ew = r * .22, eh = r * .3 * (1 - bl * .85);
    const pxo = clamp(lx, -1, 1) * r * .1, pyo = clamp(ly, -1, 1) * r * .12;
    for (const ex of [ex1, ex2]) {
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, ew, Math.max(r * .03, eh), 0, 0, TAU); c.fill();
      c.lineWidth = Math.max(1, r * .04); c.strokeStyle = 'rgba(0,0,0,.6)'; c.stroke();
      if (bl < .6) { c.fillStyle = d.eye || '#1a1410'; c.beginPath(); c.arc(ex + pxo, ey + pyo, r * .13, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + pxo + r * .04, ey + pyo - r * .05, r * .04, 0, TAU); c.fill(); }
    }
    c.strokeStyle = d.brow || hex(hc, -.35); c.lineWidth = r * .1; c.lineCap = 'round';
    const bw = mood === 1 ? .2 : mood === 3 ? -.18 : mood === 2 ? -.06 : 0;
    c.beginPath(); c.moveTo(ex1 - ew, ey - eh - r * .1 + bw * r * .6); c.lineTo(ex1 + ew, ey - eh - r * .1 - bw * r * .6); c.stroke();
    c.beginPath(); c.moveTo(ex2 - ew, ey - eh - r * .1 + bw * r * .6); c.lineTo(ex2 + ew, ey - eh - r * .1 - bw * r * .6); c.stroke();
    c.fillStyle = hex(sk, -.12); c.beginPath(); c.arc(r * .98, r * .12, r * .12, 0, TAU); c.fill();
    const my = r * .5, mx = r * .4;
    if (mo > .15 || mood === 3) {
      c.fillStyle = '#2a0a0a'; c.beginPath(); c.ellipse(mx, my, r * .26, r * (.1 + .22 * Math.max(mo, mood === 3 ? .8 : 0)), 0, 0, TAU); c.fill();
      c.fillStyle = '#e86a6a'; c.beginPath(); c.ellipse(mx, my + r * .12 * Math.max(mo, .5), r * .17, r * .08, 0, 0, TAU); c.fill();
    } else {
      c.strokeStyle = '#3a1608'; c.lineWidth = r * .08; c.beginPath();
      if (mood === 2) { c.arc(mx, my - r * .18, r * .34, .3, Math.PI - .3); } else if (mood === 1) { c.moveTo(mx - r * .25, my + r * .08); c.lineTo(mx + r * .25, my - r * .02); } else { c.arc(mx, my - r * .12, r * .28, .35, Math.PI - .35); }
      c.stroke();
    }
    const ac = d.acc;
    if (ac === 'shades') {
      c.fillStyle = '#10131c'; pathRR(c, -r * .12, ey - r * .26, r * 1.1, r * .5, r * .2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(r * .02, ey - r * .2); c.lineTo(r * .3, ey - r * .2); c.lineTo(r * .12, ey + r * .12); c.lineTo(-r * .04, ey + r * .12); c.fill();
      c.fillStyle = '#10131c'; c.fillRect(-r * .98, ey - r * .12, r * .9, r * .1);
    } else if (ac === 'goggles') {
      c.strokeStyle = d.accC || '#222'; c.lineWidth = r * .09; c.beginPath(); c.moveTo(-r * 1.0, ey - r * .02); c.lineTo(-r * .1, ey - r * .02); c.stroke();
      for (const ex of [ex1 + r * .02, ex2 + r * .02]) { c.fillStyle = d.lens || 'rgba(120,220,255,.55)'; c.beginPath(); c.arc(ex, ey, r * .29, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(ex - r * .08, ey - r * .1, r * .07, 0, TAU); c.fill(); }
    } else if (ac === 'mask') {
      c.fillStyle = d.accC || '#222'; c.beginPath(); c.moveTo(-r * 1.0, ey + r * .6); c.quadraticCurveTo(r * .5, ey + r * .05, r * 1.0, ey + r * .55); c.lineTo(r * .9, r * .95); c.quadraticCurveTo(0, r * 1.05, -r * .9, r * .9); c.fill();
    } else if (ac === 'scar') {
      c.strokeStyle = '#7a1f1f'; c.lineWidth = r * .07; c.beginPath(); c.moveTo(ex2 - r * .12, ey - r * .5); c.lineTo(ex2 + r * .1, ey + r * .45); c.stroke();
      c.lineWidth = r * .04; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(ex2 - r * .2, ey - r * .25 + i * r * .25); c.lineTo(ex2 + r * .12, ey - r * .2 + i * r * .25); c.stroke(); }
    } else if (ac === 'bolt') {
      c.fillStyle = '#ffe14a'; c.strokeStyle = '#8a6a00'; c.lineWidth = r * .03; c.beginPath(); c.moveTo(r * .45, r * .05); c.lineTo(r * .75, r * .05); c.lineTo(r * .58, r * .3); c.lineTo(r * .78, r * .3); c.lineTo(r * .42, r * .72); c.lineTo(r * .5, r * .4); c.lineTo(r * .32, r * .4); c.closePath(); c.fill(); c.stroke();
    } else if (ac === 'beard') {
      c.fillStyle = d.accC || hc2; c.beginPath(); c.moveTo(-r * .85, r * .35); c.quadraticCurveTo(-r * .8, r * 1.2, r * .1, r * 1.12); c.quadraticCurveTo(r * .9, r * 1.1, r * .94, r * .42); c.quadraticCurveTo(r * .6, r * .72, r * .22, r * .62); c.quadraticCurveTo(-r * .3, r * .7, -r * .85, r * .35); c.fill();
    } else if (ac === 'stache') {
      c.fillStyle = d.accC || hc2; c.beginPath(); c.ellipse(r * .55, r * .3, r * .3, r * .09, .1, 0, TAU); c.fill();
    } else if (ac === 'glasses') {
      c.strokeStyle = d.accC || '#222'; c.lineWidth = r * .07;
      for (const ex of [ex1, ex2]) { c.beginPath(); c.ellipse(ex, ey, r * .27, r * .31, 0, 0, TAU); c.stroke(); }
      c.beginPath(); c.moveTo(ex1 + r * .27, ey); c.lineTo(ex2 - r * .27, ey); c.moveTo(ex1 - r * .27, ey); c.lineTo(-r * .98, ey - r * .04); c.stroke();
    }
    c.restore();
  }

  function drawBall(c, x, y, r, rot, kind) {
    c.save(); c.translate(x, y); c.rotate(rot);
    if (kind === 'bball') {
      const g = c.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.1); g.addColorStop(0, '#ffb070'); g.addColorStop(.6, '#e8731c'); g.addColorStop(1, '#a64a08');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
      c.strokeStyle = '#3b1a04'; c.lineWidth = Math.max(1.2, r * .09); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke();
      c.beginPath(); c.arc(-r * 1.15, 0, r * .85, -1.0, 1.0); c.stroke(); c.beginPath(); c.arc(r * 1.15, 0, r * .85, Math.PI - 1.0, Math.PI + 1.0); c.stroke();
    } else {
      const g = c.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.1); g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#e9edf3'); g.addColorStop(1, '#a8b0bf');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
      c.fillStyle = '#20242e';
      const pent = (px, py, pr, a) => { c.beginPath(); for (let i = 0; i < 5; i++) { const an = a + i * TAU / 5; c.lineTo(px + Math.cos(an) * pr, py + Math.sin(an) * pr); } c.closePath(); c.fill(); };
      pent(0, 0, r * .36, -Math.PI / 2);
      for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + i * TAU / 5 + TAU / 10; pent(Math.cos(an) * r * .86, Math.sin(an) * r * .86, r * .26, an + Math.PI); }
      c.strokeStyle = 'rgba(30,36,50,.55)'; c.lineWidth = Math.max(1, r * .06);
      for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + i * TAU / 5; c.beginPath(); c.moveTo(Math.cos(an) * r * .36, Math.sin(an) * r * .36); c.lineTo(Math.cos(an) * r * .62, Math.sin(an) * r * .62); c.stroke(); }
      c.strokeStyle = 'rgba(30,36,50,.7)'; c.lineWidth = Math.max(1.2, r * .07); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    }
    c.restore();
  }

  const rrect = (c, x, y, w, h, r) => pathRR(c, x, y, w, h, Math.min(r, w / 2, h / 2));
  const crowdSeed = n => { let s = n * 7919 + 13; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  function drawCharIcon(cv, d, face) {
    const c = cv.getContext('2d'), s = cv.width;
    c.clearRect(0, 0, s, s);
    drawHead(c, d, s * .5, s * .52, s * .36, 1, { mood: 2 });
  }

  const HS = { W: 960, H: 540, GY: 470, GW: 104, CY: 306, CR: 8, BR: 21, HR: 34, HO: 60, KT: .34, GP: 2400, GB: 1650 };
  const HS_CH = [
    { id: 'blaze', name: 'Blaze', sk: '#e8a46c', hair: '#ff5a1f', hair2: '#ffd23f', style: 'flame', acc: 'band', accC: '#ffffff', kit: '#d92b2b', trim: '#ffd23f', shorts: '#6e1111', shoe: '#1b1b1b', spd: 1.02, jmp: 1, pow: 1.04, head: 1, sp: 'fire', spName: 'Fireball', spText: 'A blazing shot that burns through defenders and knocks them back.', rt: 4 },
    { id: 'frost', name: 'Frost', sk: '#f2d2b6', hair: '#cfeaff', hair2: '#8fc4f2', style: 'spiky', acc: 'goggles', accC: '#2b6ea8', lens: 'rgba(150,230,255,.6)', kit: '#27a9d8', trim: '#ffffff', shorts: '#0f4f73', shoe: '#e8f6ff', spd: .98, jmp: 1.02, pow: 1, head: 1.02, sp: 'ice', spName: 'Ice Shot', spText: 'An icy bolt. Whoever it touches is frozen solid for almost two seconds.', rt: 4 },
    { id: 'gale', name: 'Gale', sk: '#d79b6a', hair: '#34c46b', hair2: '#1c8a49', style: 'swirl', acc: 'none', kit: '#1fb3a3', trim: '#ffffff', shorts: '#0d5a52', shoe: '#ffffff', spd: 1.07, jmp: 1.05, pow: .97, head: .96, sp: 'tornado', spName: 'Tornado Shot', spText: 'The ball spirals up and down in a wild corkscrew that nobody can read.', rt: 3 },
    { id: 'volt', name: 'Volt', sk: '#8a5a3a', hair: '#ffe14a', hair2: '#d2a800', style: 'spiky', acc: 'bolt', kit: '#f2c200', trim: '#161616', shorts: '#161616', shoe: '#ffe14a', spd: 1.06, jmp: 1, pow: 1.02, head: .98, sp: 'volt', spName: 'Thunder Bolt', spText: 'A laser-straight lightning shot that stuns whoever it hits.', rt: 4 },
    { id: 'titan', name: 'Titan', sk: '#c28558', hair: '#2b1b12', hair2: '#4a3020', style: 'bald', acc: 'beard', accC: '#2b1b12', kit: '#7d3bd1', trim: '#ffd23f', shorts: '#3b1a6e', shoe: '#2a2a2a', spd: .92, jmp: .96, pow: 1.14, head: 1.14, sp: 'giant', spName: 'Meteor', spText: 'The ball swells to a giant and bulldozes anything in its way.', rt: 3 },
    { id: 'phantom', name: 'Phantom', sk: '#e6dcd2', hair: '#1a1424', hair2: '#2b2140', style: 'long', acc: 'mask', accC: '#14101c', kit: '#2a2140', trim: '#b46bff', shorts: '#14101c', shoe: '#b46bff', spd: 1.01, jmp: 1.08, pow: 1, head: .97, sp: 'ghost', spName: 'Shadow Shot', spText: 'The ball turns almost invisible mid-flight.', rt: 3 },
    { id: 'magnus', name: 'Magnus', sk: '#f0c8a0', hair: '#c9d1dc', hair2: '#8a95a6', style: 'afro', acc: 'shades', kit: '#2f6bff', trim: '#ffffff', shorts: '#16337a', shoe: '#ffffff', spd: .99, jmp: 1, pow: 1, head: 1.04, sp: 'homing', spName: 'Magnet Shot', spText: 'The ball hunts down the goal on its own.', rt: 4 },
    { id: 'boomer', name: 'Boomer', sk: '#b9774a', hair: '#ff4fa3', hair2: '#1b1b1b', style: 'mohawk', acc: 'goggles', accC: '#222222', lens: 'rgba(255,160,60,.55)', kit: '#ff8a1c', trim: '#161616', shorts: '#2a2a2a', shoe: '#161616', spd: 1, jmp: .98, pow: 1.08, head: 1, sp: 'bomb', spName: 'Bomb Shot', spText: 'A ticking bomb: it explodes on contact and blasts everyone nearby away.', rt: 3 }
  ];
  const HS_LV = [
    { n: 'Rookie', react: .36, spd: .76, dead: 26, err: 70, kick: .55, jump: .45, sp: .15, att: .5, press: 1.1 },
    { n: 'Amateur', react: .26, spd: .86, dead: 18, err: 44, kick: .7, jump: .6, sp: .3, att: .62, press: .8 },
    { n: 'Pro', react: .17, spd: .94, dead: 12, err: 26, kick: .84, jump: .78, sp: .55, att: .74, press: .64 },
    { n: 'Expert', react: .1, spd: 1, dead: 8, err: 14, kick: .94, jump: .9, sp: .8, att: .86, press: .58 },
    { n: 'Legend', react: .05, spd: 1.04, dead: 5, err: 6, kick: 1, jump: 1, sp: 1, att: 1, press: .54 }
  ];
  const HS_ITEMS = [
    { k: 'spd', n: 'Speed', c: '#ffd23f', t: 'S' },
    { k: 'jmp', n: 'Super jump', c: '#7ae582', t: 'J' },
    { k: 'big', n: 'Big head', c: '#ff7ab8', t: 'B' },
    { k: 'frz', n: 'Freeze', c: '#7fd8ff', t: 'F' },
    { k: 'pow', n: 'Power', c: '#ff7a3a', t: 'P' }
  ];
  const HS_FX = { fire: 1, ice: 2, tornado: 3, volt: 4, giant: 5, ghost: 6, homing: 7, bomb: 8 };
  const HS_FXN = [null, 'fire', 'ice', 'tornado', 'volt', 'giant', 'ghost', 'homing', 'bomb'];
  const hsHeadR = p => HS.HR * HS_CH[p.ch].head * (p.bg > 0 ? 1.42 : 1);

  function hsKickAngle(u) {
    const d2r = Math.PI / 180;
    if (u < .2) return (-85 + (-30) * (u / .2)) * d2r;
    if (u < .5) { const k = (u - .2) / .3; return (-115 + 175 * (k * k * (3 - 2 * k))) * d2r; }
    if (u < .72) return 60 * d2r;
    return (60 - 145 * ((u - .72) / .28)) * d2r;
  }
  function hsFoot(p) {
    const hx = p.x, hy = p.y - 22, L = 36 + (p.kt >= 0 ? 6 : 0);
    const f = p.face;
    if (p.kt < 0) return { x: p.x + f * 4, y: p.y - 12 };
    const a = hsKickAngle(p.kt / HS.KT);
    return { x: hx + Math.cos(a) * L * f, y: Math.min(HS.GY - 13, hy - Math.sin(a) * L) };
  }

  function hsReset(S, kick) {
    const W = HS.W;
    S.pl.forEach((p, i) => { p.x = p.px = i & 1 ? W - 300 : 300; p.y = p.py = HS.GY; p.vx = p.vy = 0; p.kt = -1; p.cd = 0; p.fr = 0; p.st = 0; p.bl = 0; });
    const b = S.ball;
    b.x = b.px = W / 2; b.y = b.py = 170; b.vx = b.vy = 0; b.fx = 0; b.ft = 0; b.r = HS.BR; b.own = -1; b.tt = 0; b.rot = 0;
    S.items.length = 0;
    S.phase = 'ready'; S.pt = kick ? 1.25 : 1.9;
  }
  function hsNew(cfg) {
    const S = { cfg, n: 2, pl: [], ball: { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, fx: 0, ft: 0, r: HS.BR, own: -1, tt: 0, rot: 0, last: -1 }, sc: [0, 0], clock: cfg.time, phase: 'ready', pt: 1.9, over: 0, win: -1, items: [], ni: 6, tt: 0, sd: 0, last: -1, shake: 0, lastTouch: -1, itemId: 1 };
    for (let i = 0; i < 2; i++) S.pl.push({ ch: cfg.chars[i], x: 0, y: HS.GY, px: 0, py: HS.GY, vx: 0, vy: 0, face: i ? -1 : 1, kt: -1, kp: 0, cd: 0, g: 0, fr: 0, sp: 0, jb: 0, bg: 0, st: 0, bl: 0, tch: 0, pm: 0, fpx: 0, fpy: 0, ground: 1, pw: 0 });
    hsReset(S, false);
    return S;
  }

  function hsCircle(S, b, cx, cy, cr, cvx, cvy, e, minOut, boost, who, emit, kind) {
    const dx = b.x - cx, dy = b.y - cy, rr = b.r + cr, d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr) return 0;
    let d = Math.sqrt(d2) || .001, nx = dx / d, ny = dy / d;
    if (d < .001) { nx = 0; ny = -1; }
    b.x = cx + nx * rr; b.y = cy + ny * rr;
    const rvx = b.vx - cvx, rvy = b.vy - cvy, vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < minOut) { const k = minOut / (sp || 1); if (sp < 1) { b.vx = nx * minOut; b.vy = ny * minOut; } else { b.vx *= k; b.vy *= k; } }
      b.vx += nx * boost; b.vy += ny * boost;
    }
    return 1;
  }

  function hsFxHit(S, b, p, pi, emit) {
    if (!b.fx || b.own === (pi & 1)) return;
    const k = HS_FXN[b.fx];
    if (k === 'fire') { p.vx = (b.vx >= 0 ? 1 : -1) * 620; p.vy = -380; p.st = .6; p.bl = 1.2; emit([13, pi]); }
    else if (k === 'ice') { p.fr = 1.8; p.vx = 0; emit([10, pi]); b.fx = 0; b.ft = 0; }
    else if (k === 'volt') { p.st = .8; p.vx = 0; emit([13, pi]); b.fx = 0; b.ft = 0; }
    else if (k === 'giant') { p.vx = (b.vx >= 0 ? 1 : -1) * 780; p.vy = -520; p.st = .7; emit([13, pi]); }
    else if (k === 'bomb') hsBoom(S, b, emit);
  }
  function hsBoom(S, b, emit) {
    emit([12, b.x, b.y]);
    S.pl.forEach((p, i) => {
      const cx = p.x, cy = p.y - 48, dx = cx - b.x, dy = cy - b.y, d = Math.hypot(dx, dy);
      if (d < 210 && (i & 1) !== b.own) { const k = 1 - d / 260, n = d || 1; p.vx = dx / n * 1050 * k + (dx >= 0 ? 160 : -160); p.vy = Math.min(-420, dy / n * 900 * k - 380); p.st = .9; emit([13, i]); }
    });
    b.fx = 0; b.ft = 0; b.vx *= .3; b.vy = -420; S.shake = .45;
  }

  function hsLaunch(S, p, pi, b, nx, ny, emit) {
    const ch = HS_CH[p.ch], t = pi & 1, gx = t ? 40 : HS.W - 40, gy = HS.GY - 80;
    let dx = gx - b.x, dy = gy - b.y, d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    let ax = dx * .8 + nx * .35, ay = dy * .8 + ny * .35, al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
    if (ay > .15) ay = .15;
    al = Math.hypot(ax, ay); ax /= al; ay /= al;
    const sp = 1040 * ch.pow;
    b.vx = ax * sp; b.vy = ay * sp;
    b.fx = HS_FX[ch.sp]; b.own = t; b.last = t;
    const k = ch.sp;
    b.ft = k === 'fire' ? 3 : k === 'ice' ? 2.6 : k === 'tornado' ? 1.5 : k === 'volt' ? .8 : k === 'giant' ? 2.8 : k === 'ghost' ? 1 : k === 'homing' ? 1.7 : 3.2;
    if (k === 'volt') { b.vx = (t ? -1 : 1) * 1500 * Math.min(1.05, ch.pow); b.vy = ay * 420 - 40; }
    if (k === 'giant') { b.vx *= .82; b.vy *= .82; }
    if (k === 'bomb') { b.vx *= .88; b.vy = Math.min(b.vy, -260); }
    b.tt = 0;
    emit([2, p.ch, t]);
  }

  function hsTouch(p, add) { if (p.tch <= 0) { p.g = Math.min(100, p.g + add); p.tch = .18; } }

  function hsStep(S, inp, dt, emit) {
    if (S.over) return;
    S.tt += dt;
    if (S.shake > 0) S.shake -= dt;
    const W = HS.W, GY = HS.GY, b = S.ball;
    if (S.phase === 'ready') {
      S.pt -= dt;
      S.pl.forEach(p => { p.px = p.x; p.py = p.y; });
      b.px = b.x; b.py = b.y;
      if (S.pt <= 0) { S.phase = S.sd ? 'sd' : 'play'; emit([5]); }
      return;
    }
    if (S.phase === 'over') return;
    if (S.phase === 'goal') {
      S.pt -= dt;
      b.px = b.x; b.py = b.y;
      b.vy += HS.GB * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y > GY - b.r) { b.y = GY - b.r; b.vy *= -.35; b.vx *= .8; }
      if (b.x < b.r) { b.x = b.r; b.vx *= -.2; } else if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -.2; }
      S.pl.forEach(p => { p.px = p.x; p.py = p.y; p.vx *= .9; });
      if (S.pt <= 0) {
        if (S.endAfter) { S.over = 1; S.phase = 'over'; emit([4, S.win]); return; }
        hsReset(S, true);
      }
      return;
    }
    b.px = b.x; b.py = b.y;
    if (S.cfg.time > 0 && S.phase === 'play') {
      S.clock -= dt;
      if (S.clock <= 0) {
        S.clock = 0;
        if (S.sc[0] !== S.sc[1]) { S.over = 1; S.phase = 'over'; S.win = S.sc[0] > S.sc[1] ? 0 : 1; emit([14]); emit([4, S.win]); return; }
        S.sd = 1; S.phase = 'sd'; emit([15]);
      }
    }
    for (let i = 0; i < 2; i++) {
      const p = S.pl[i], ch = HS_CH[p.ch], m = inp[i] | 0;
      p.px = p.x; p.py = p.y;
      const pf = p.fr > 0 || p.st > 0;
      if (p.fr > 0) p.fr -= dt;
      if (p.st > 0) p.st -= dt;
      if (p.sp > 0) p.sp -= dt;
      if (p.jb > 0) p.jb -= dt;
      if (p.bg > 0) p.bg -= dt;
      if (p.bl > 0) p.bl -= dt;
      if (p.tch > 0) p.tch -= dt;
      if (p.cd > 0) p.cd -= dt;
      const spd = 285 * ch.spd * (p.sp > 0 ? 1.42 : 1), jv = 800 * ch.jmp * (p.jb > 0 ? 1.3 : 1) - (p.bg > 0 ? 40 : 0);
      const ground = p.y >= GY - .5;
      if (p.fr > 0) { p.vx *= .85; }
      else {
        const l = m & 1, r = m & 2, tv = l && r ? 0 : l ? -spd : r ? spd : 0, slow = p.bl > 0 ? .7 : 1;
        if (p.st > 0) { p.vx *= .97; }
        else {
          const ac = ground ? 4600 : 2400;
          const tt = tv * slow;
          p.vx += clamp(tt - p.vx, -ac * dt, ac * dt);
        }
        if ((m & 4) && ground && p.st <= 0) { p.vy = -jv; emit([6, i]); }
        if ((m & 8) && p.kt < 0 && p.cd <= 0 && p.st <= 0) { p.kt = 0; p.kp = 0; emit([16, i]); }
        else if ((m & 16) && !(p.pm & 16) && p.kt < 0 && p.cd <= 0 && p.st <= 0) {
          if (p.g >= 100) { p.kt = 0; p.kp = 1; emit([16, i]); } else emit([17, i]);
        }
      }
      p.pm = m;
      if (p.kt >= 0) { p.kt += dt; if (p.kt >= HS.KT) { p.kt = -1; p.cd = p.kp ? .25 : .1; p.kp = 0; } }
      p.vy += HS.GP * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const hr = hsHeadR(p);
      p.x = clamp(p.x, hr + 4, W - hr - 4);
      if (p.y >= GY) { p.y = GY; if (p.vy > 200) emit([7, i]); p.vy = 0; }
      p.ground = p.y >= GY - .5 ? 1 : 0;
    }
    const p0 = S.pl[0], p1 = S.pl[1];
    {
      const r0 = hsHeadR(p0), r1 = hsHeadR(p1), c0y = p0.y - HS.HO, c1y = p1.y - HS.HO;
      const dx = p1.x - p0.x, dy = c1y - c0y, rr = r0 + r1 - 6, d = Math.hypot(dx, dy);
      if (d < rr && d > .001) {
        const nx = dx / d, ny = dy / d, pen = rr - d;
        p0.x -= nx * pen * .5; p1.x += nx * pen * .5;
        if (ny > .55) { p1.y += pen * .5; p0.y -= pen * .5; } else if (ny < -.55) { p1.y -= pen * .5; p0.y += pen * .5; }
        const rv = (p1.vx - p0.vx) * nx + (p1.vy - p0.vy) * ny;
        if (rv < 0) {
          const j = -rv * .85;
          p0.vx -= nx * j; p1.vx += nx * j;
          if (Math.abs(ny) > .55) { p0.vy -= ny * j; p1.vy += ny * j; if (ny > 0) p0.vy = Math.min(p0.vy, -380); else p1.vy = Math.min(p1.vy, -380); }
        }
        if (p0.y > GY) p0.y = GY; if (p1.y > GY) p1.y = GY;
      }
    }
    for (let i = 0; i < 2; i++) { const p = S.pl[i], f = hsFoot(p); p.fvx = (f.x - (p.fpx || f.x)) / dt; p.fvy = (f.y - (p.fpy || f.y)) / dt; p.fpx = f.x; p.fpy = f.y; }

    b.tt += dt;
    const k = HS_FXN[b.fx];
    if (b.ft > 0) { b.ft -= dt; if (b.ft <= 0) { b.ft = 0; if (k === 'bomb') hsBoom(S, b, emit); else b.fx = 0; } }
    let gm = 1;
    if (k === 'volt') gm = 0;
    else if (k === 'tornado') { gm = b.tt < 1.2 ? .15 : 1; b.vy += Math.sin(b.tt * 17) * 3600 * dt; b.vx *= 1 - dt * .3; }
    else if (k === 'homing') {
      gm = .3;
      const t = b.own, gx = t ? 40 : W - 40, gy = GY - 80, dx = gx - b.x, dy = gy - b.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(b.vx, b.vy) || 1;
      const tx = dx / d * sp, ty = dy / d * sp, st = Math.min(1, 7 * dt);
      b.vx += (tx - b.vx) * st; b.vy += (ty - b.vy) * st;
    }
    else if (k === 'giant') { b.r = lerp(b.r, 36, Math.min(1, dt * 14)); }
    if (k !== 'giant' && b.r > HS.BR) b.r = Math.max(HS.BR, b.r - 120 * dt);
    b.vy += HS.GB * gm * dt;
    const damp = k ? 0 : .22;
    b.vx -= b.vx * damp * dt; b.vy -= b.vy * damp * .5 * dt;
    const sp = Math.hypot(b.vx, b.vy), cap = k === 'volt' ? 1700 : 1150;
    if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.rot += b.vx * dt / b.r;

    const r = b.r;
    if (b.y > GY - r) {
      b.y = GY - r;
      if (b.vy > 0) {
        if (b.vy > 160) emit([9, Math.min(1, b.vy / 900)]);
        b.vy *= -.66; if (Math.abs(b.vy) < 70) b.vy = 0;
        if (k === 'bomb' && b.tt > .35) hsBoom(S, b, emit);
      }
      b.vx -= b.vx * 1.3 * dt;
    }
    if (b.y < r) { b.y = r; if (b.vy < 0) b.vy *= -.55; }
    const inGoalL = b.x < HS.GW + r && b.y > HS.CY, inGoalR = b.x > W - HS.GW - r && b.y > HS.CY;
    if (b.x < r) { b.x = r; if (b.vx < 0) b.vx *= inGoalL ? -.25 : -.72; }
    if (b.x > W - r) { b.x = W - r; if (b.vx > 0) b.vx *= inGoalR ? -.25 : -.72; }
    for (const sd of [0, 1]) {
      const ax = sd ? W - HS.GW : 0, bx = sd ? W : HS.GW, cy = HS.CY;
      const qx = clamp(b.x, ax, bx), dx = b.x - qx, dy = b.y - cy, rr = r + HS.CR, d2 = dx * dx + dy * dy;
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || .001, nx = dx / d, ny = dy / d;
        b.x = qx + nx * rr; b.y = cy + ny * rr;
        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) { b.vx -= 1.62 * vn * nx; b.vy -= 1.62 * vn * ny; if (Math.abs(vn) > 160) emit([8, Math.min(1, Math.abs(vn) / 900)]); }
        if (Math.abs(b.vy) < 12 && ny < -.9) b.vx += sd ? -70 : 70;
        if (k === 'volt' || k === 'tornado' || k === 'homing') { b.fx = 0; b.ft = 0; }
      }
    }
    const fxk = HS_FXN[b.fx];
    for (let i = 0; i < 2; i++) {
      const p = S.pl[i], t = i & 1, hr = hsHeadR(p), hy = p.y - HS.HO;
      let hit = 0;
      const heavy = fxk === 'giant' ? 1.25 : 1;
      if (hsCircle(S, b, p.x, hy, hr, p.vx, p.vy, .8 * heavy, 380, 50, i, emit)) {
        hit = 1; b.vx += (t ? -1 : 1) * 120; hsTouch(p, 7); emit([0, Math.min(1, Math.hypot(b.vx, b.vy) / 1000), i]); b.last = t; hsFxHit(S, b, p, i, emit);
      }
      if (hsCircle(S, b, p.x, p.y - 22, 15, p.vx, p.vy, .55, 160, 0, i, emit)) { hit = 1; hsTouch(p, 3); emit([0, .3, i]); b.last = t; hsFxHit(S, b, p, i, emit); }
      const f = hsFoot(p);
      if (p.kt >= 0) {
        const u = p.kt / HS.KT;
        if (u >= .18 && u <= .66 && !p.pw) {
          const dx = b.x - f.x, dy = b.y - f.y, rr = r + 15;
          if (dx * dx + dy * dy < rr * rr) {
            const d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d;
            p.pw = 1;
            const ch = HS_CH[p.ch];
            if (p.kp && p.g >= 100) {
              p.g = 0; hsLaunch(S, p, i, b, nx, ny, emit);
            } else {
              let ax = nx * .55 + (t ? -1 : 1) * .72, ay = ny * .55 - .42, al = Math.hypot(ax, ay);
              ax /= al; ay /= al;
              const kp = (690 + (p.kt > .12 ? 90 : 0)) * ch.pow * (p.bg > 0 ? 1.1 : 1);
              b.vx = ax * kp + (p.fvx || 0) * .12 + p.vx * .25; b.vy = ay * kp + (p.fvy || 0) * .1;
              if (b.fx) { b.fx = 0; b.ft = 0; }
              emit([1, Math.min(1, kp / 900), i]); hsTouch(p, 12);
            }
            b.x = f.x + nx * (r + 15.5); b.y = f.y + ny * (r + 15.5);
            b.last = t; hit = 1;
          }
        }
      } else p.pw = 0;
      if (p.kt >= 0 && p.kt < .02) p.pw = 0;
      if (!hit && p.kt < 0) {
        if (hsCircle(S, b, f.x, f.y, 13, p.vx, p.vy, .5, 90, 0, i, emit)) { hsTouch(p, 4); b.last = t; emit([0, .25, i]); hsFxHit(S, b, p, i, emit); }
      }
    }
    if (b.y > GY - r - 0.5 && Math.abs(b.vx) < 3) b.vx = 0;
    if (inGoalL || inGoalR || b.x < HS.GW - 12 || b.x > W - HS.GW + 12) {
      const L = b.x < HS.GW - 12 && b.y > HS.CY + HS.CR, R2 = b.x > W - HS.GW + 12 && b.y > HS.CY + HS.CR;
      if (L || R2) {
        const w = L ? 1 : 0;
        S.sc[w]++; S.last = w; S.phase = 'goal'; S.pt = 2.3; b.fx = 0; b.ft = 0; b.r = HS.BR;
        S.shake = .5;
        const lose = S.pl[1 - w]; lose.g = Math.min(100, lose.g + 22);
        emit([3, w, b.x]);
        const target = S.cfg.goalTarget;
        if (S.sd || (target && S.sc[w] >= target)) { S.win = w; S.endAfter = 1; }
        return;
      }
    }
    if (S.cfg.items && S.phase !== 'ready') {
      S.ni -= dt;
      if (S.ni <= 0 && S.items.length < 2) {
        S.ni = 8 + Math.random() * 5;
        const it = pick(HS_ITEMS);
        S.items.push({ id: S.itemId++, k: HS_ITEMS.indexOf(it), x: rnd(300, W - 300), y: -30, t: 9 });
      }
      for (let j = S.items.length - 1; j >= 0; j--) {
        const it = S.items[j];
        it.t -= dt; it.y = Math.min(GY - 150 + Math.sin(S.tt * 3 + it.id) * 8, it.y + 260 * dt);
        let taken = -1;
        for (let i = 0; i < 2; i++) { const p = S.pl[i]; if (Math.hypot(p.x - it.x, p.y - HS.HO - it.y) < hsHeadR(p) + 22 || Math.hypot(p.x - it.x, p.y - 30 - it.y) < 42) taken = i; }
        if (taken >= 0) {
          const p = S.pl[taken], o = S.pl[1 - taken], K = HS_ITEMS[it.k].k;
          if (K === 'spd') p.sp = 7; else if (K === 'jmp') p.jb = 7; else if (K === 'big') p.bg = 7; else if (K === 'frz') { o.fr = 1.7; emit([10, 1 - taken]); } else if (K === 'pow') p.g = Math.min(100, p.g + 60);
          emit([11, taken, it.k, it.x, it.y]);
          S.items.splice(j, 1);
        } else if (it.t <= 0) S.items.splice(j, 1);
      }
    }
  }

  function hsPredict(S, n, dtp) {
    const b = S.ball, out = [];
    let x = b.x, y = b.y, vx = b.vx, vy = b.vy;
    const W = HS.W, r = HS.BR;
    for (let k = 1; k <= n; k++) {
      vy += HS.GB * dtp; x += vx * dtp; y += vy * dtp;
      if (y > HS.GY - r) { y = HS.GY - r; vy *= -.66; vx *= .97; }
      if (y < r) { y = r; vy *= -.55; }
      if (x < r) { x = r; vx *= -.72; } else if (x > W - r) { x = W - r; vx *= -.72; }
      out.push([k * dtp, x, y]);
    }
    return out;
  }
  function hsAI(S, i, mem, dt, seat) {
    const L = HS_LV[clamp(seat.lvl == null ? 2 : seat.lvl, 0, 4)], p = S.pl[i], o = S.pl[1 - i], t = i & 1, dir = t ? -1 : 1, b = S.ball, W = HS.W, GY = HS.GY;
    if (S.phase !== 'play' && S.phase !== 'sd') { mem.tx = p.x; return 0; }
    if (p.fr > 0 || p.st > 0) return 0;
    const spd = 285 * HS_CH[p.ch].spd * (p.sp > 0 ? 1.42 : 1) * L.spd;
    mem.pt = (mem.pt || 0) - dt; mem.kd = (mem.kd || 0) - dt; mem.jd = (mem.jd || 0) - dt;
    const ownG = t ? W : 0, oppG = t ? 0 : W;
    if (mem.pt <= 0) {
      mem.pt0 = L.react * (.7 + Math.random() * .7); mem.pt = mem.pt0;
      const pr = hsPredict(S, 40, 1 / 24);
      let best = null;
      for (const q of pr) {
        const need = Math.abs(q[1] - dir * 0 - p.x) / spd;
        if (q[2] > GY - 105 && q[2] < GY - 22 && need <= q[0] + .12) { best = q; break; }
      }
      if (!best) best = pr.find(q => q[2] > GY - 60) || pr[pr.length - 1];
      mem.ix = best[1]; mem.iy = best[2]; mem.it = best[0];
      mem.et = (mem.et || 0) - mem.pt0;
      if (mem.et <= 0 || mem.err == null) { mem.et = .6; mem.err = (Math.random() - .5) * 2 * L.err; }
      const err = mem.err;
      const ballDir = (b.x - p.x) * dir;
      const danger = (b.vx * dir < -200 && Math.abs(b.x - ownG) < 420);
      let off = 52;
      if (ballDir < -10 || danger) off = 62;
      mem.tx = mem.ix - dir * off + err;
      const frac = (b.x - ownG) * dir / W;
      if (ballDir < -20 && Math.abs(b.x - ownG) < 300 && Math.abs(b.x - p.x) > 140) mem.tx = ownG + dir * (HS.GW + 40);
      else if (frac > L.press && !danger) mem.tx = ownG + dir * (HS.GW + 50 + frac * 150) + err * .5;
      mem.tx = clamp(mem.tx, 40, W - 40);
      if (mem.iy < GY - 130 && Math.abs(mem.ix - p.x) < 110) mem.jump = mem.it;
      else mem.jump = -1;
    }
    let m = 0;
    const dx = mem.tx - p.x;
    if (Math.abs(dx) > L.dead) m |= dx > 0 ? 2 : 1;
    const bdx = (b.x - p.x) * dir, bdy = b.y - (p.y - 30);
    const onG = p.y >= GY - .5;
    const above = b.y < GY - 135;
    if (onG && mem.jd <= 0) {
      let jump = 0;
      const front = bdx > -12 || (b.vx * dir < -250 && Math.abs(b.x - ownG) < 300);
      if (above && front && Math.abs(b.x - p.x) < 80 && b.vy > -200 && b.y > GY - 330 && Math.random() < L.jump) jump = 1;
      if (front && b.y < GY - 150 && Math.abs(b.x - p.x) < 100 && b.vy > 0 && b.y > GY - 260 && Math.random() < L.jump * .1) jump = 1;
      if (Math.abs(b.x - ownG) < 200 && b.y < GY - 120 && Math.abs(b.x - p.x) < 140 && b.vx * dir < -100 && Math.random() < L.jump * .2) jump = 1;
      if (Math.abs(b.x - o.x) < 160 && !above && o.y < GY - 40 && bdx > 0 && bdx < 120 && Math.random() < .02 * L.jump) jump = 1;
      if (jump) { m |= 4; mem.jd = .4; }
    }
    if (p.kt < 0 && p.cd <= 0 && mem.kd <= 0) {
      const fbx = (b.x + b.vx * .1 - (p.x + p.vx * .1)) * dir, fby = b.y + b.vy * .1 + HS.GB * .005 - (p.y - 30);
      const inRange = fbx > 14 && fbx < 78 && Math.abs(fby) < 50;
      if (inRange) {
        const ready = p.g >= 100 && Math.random() < L.sp;
        const goodSide = (oppG - b.x) * dir > 120;
        if (ready && goodSide) { m |= 16; mem.kd = .5; }
        else if (goodSide ? Math.random() < L.kick * (.5 + L.att * .5) : Math.random() < L.kick * .6) { m |= 8; mem.kd = .24 + (1 - L.kick) * .4; }
      }
    }
    if (p.g >= 100 && p.kt < 0 && (m & 16) === 0 && mem.kd <= 0) {
      const bdx2 = (b.x - p.x) * dir;
      const fb2 = (b.x + b.vx * .1 - (p.x + p.vx * .1)) * dir;
      if (fb2 > 14 && fb2 < 78 && Math.abs(b.y + b.vy * .1 - (p.y - 30)) < 52 && Math.random() < L.sp) { m |= 16; mem.kd = .5; }
    }
    return m;
  }

  const HS_STAGES = [
    { name: 'Stadium', sky: ['#5db4ff', '#cfeaff'], turf: ['#2f9e44', '#37b24d'], line: 'rgba(255,255,255,.7)', stand: '#8e9bb0', board: ['#e03131', '#1971c2', '#f08c00', '#2f9e44'], night: 0 },
    { name: 'Night Match', sky: ['#070b24', '#1c2a5e'], turf: ['#1f6f34', '#27823f'], line: 'rgba(255,255,255,.55)', stand: '#2e3652', board: ['#c92a2a', '#1864ab', '#e67700', '#2b8a3e'], night: 1 },
    { name: 'Beach', sky: ['#38b6ff', '#ffe8b0'], turf: ['#e6c27a', '#efd08c'], line: 'rgba(255,255,255,.7)', stand: '#b38b5d', board: ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c'], night: 0 },
    { name: 'Arctic', sky: ['#9ed0f0', '#eaf6ff'], turf: ['#bfe3f5', '#d3eefa'], line: 'rgba(255,255,255,.9)', stand: '#8aa3b8', board: ['#1c7ed6', '#e03131', '#2f9e44', '#f08c00'], night: 0 }
  ];
  const hsBgCache = {};
  function hsBg(sh, st) {
    const sc = Math.min(2, sh.scale()), key = st + '@' + sc;
    if (hsBgCache[key]) return hsBgCache[key];
    const c0 = document.createElement('canvas'); c0.width = HS.W * sc; c0.height = HS.H * sc;
    const c = c0.getContext('2d'); c.scale(sc, sc);
    const T = HS_STAGES[st], R = crowdSeed(st + 3), W = HS.W, GY = HS.GY;
    const g = c.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, T.sky[0]); g.addColorStop(1, T.sky[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, GY);
    if (st === 1) { c.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { c.globalAlpha = .3 + R() * .7; c.fillRect(R() * W, R() * 120, 1.6, 1.6); } c.globalAlpha = 1; }
    if (st === 0) { c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) { const x = R() * W, y = 30 + R() * 70; for (const [dx, dy, r] of [[0, 0, 22], [24, -6, 28], [52, 0, 20]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, TAU); c.fill(); } } }
    if (st === 2) {
      c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(800, 90, 40, 0, TAU); c.fill();
      c.fillStyle = '#2aa0e8'; c.fillRect(0, 230, W, 90);
      const sg = c.createLinearGradient(0, 230, 0, 320); sg.addColorStop(0, 'rgba(255,255,255,.4)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(0, 230, W, 90);
    }
    if (st === 3) {
      c.fillStyle = '#c3d9ea'; c.beginPath(); c.moveTo(0, 300); for (let x = 0; x <= W; x += 40) c.lineTo(x, 180 + Math.abs(Math.sin(x / 130)) * -80 + 90 + Math.sin(x / 47) * 12); c.lineTo(W, 300); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, 300); for (let x = 0; x <= W; x += 40) c.lineTo(x, 235 + Math.sin(x / 90 + 2) * 18); c.lineTo(W, 300); c.fill();
    }
    if (st !== 2 && st !== 3) {
      for (let tier = 0; tier < 4; tier++) {
        const y0 = 150 + tier * 48;
        c.fillStyle = hex(T.stand, tier * .05 - .1); c.fillRect(0, y0, W, 50);
        for (let x = 4; x < W; x += 15) {
          const hue = Math.floor(R() * 360), px = x + R() * 4, py = y0 + 8 + R() * 6;
          c.fillStyle = `hsl(${hue},${55 + R() * 25}%,${T.night ? 38 : 55}%)`; c.fillRect(px - 4.5, py + 7, 9, 12);
          c.fillStyle = `hsl(${20 + R() * 20},${45 + R() * 30}%,${T.night ? 50 : 72}%)`; c.beginPath(); c.arc(px, py + 4, 4.6, 0, TAU); c.fill();
        }
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, y0 + 46, W, 4);
      }
      if (T.night) {
        for (const x of [90, 480, 870]) {
          const gl = c.createRadialGradient(x, 60, 4, x, 60, 220); gl.addColorStop(0, 'rgba(255,255,230,.85)'); gl.addColorStop(1, 'rgba(255,255,230,0)');
          c.fillStyle = gl; c.fillRect(x - 220, 0, 440, 330);
          c.fillStyle = '#d8d8c8'; c.fillRect(x - 30, 52, 60, 14);
          for (let i = 0; i < 4; i++) { c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(x - 21 + i * 14, 59, 4.5, 0, TAU); c.fill(); }
        }
      }
    } else if (st === 2) {
      c.fillStyle = '#3a2a18';
      for (const [x, h, lean] of [[110, 230, -.12], [860, 250, .1]]) {
        c.save(); c.translate(x, 440); c.rotate(lean); c.fillRect(-6, -h, 12, h);
        c.fillStyle = '#2e9e4a';
        for (let i = 0; i < 7; i++) { c.save(); c.translate(0, -h); c.rotate(-1.3 + i * .45); c.beginPath(); c.ellipse(52, 0, 54, 11, 0, 0, TAU); c.fill(); c.restore(); }
        c.fillStyle = '#3a2a18'; c.restore();
      }
      c.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = 0; i < 5; i++) { const x = 100 + i * 200, y = 330; c.fillStyle = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#ff9ff3'][i]; c.beginPath(); c.moveTo(x - 38, y); c.quadraticCurveTo(x, y - 52, x + 38, y); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 1, y, 3, 26); }
    } else {
      c.fillStyle = '#ffffff';
      for (const [x, w] of [[130, 120], [760, 140]]) { c.beginPath(); c.moveTo(x - w / 2, 340); c.quadraticCurveTo(x, 340 - w * .85, x + w / 2, 340); c.fill(); c.fillStyle = '#9ec6dd'; c.beginPath(); c.arc(x, 340, w * .17, Math.PI, TAU); c.fill(); c.fillStyle = '#fff'; }
    }
    const bw = 120;
    for (let x = 0; x < W; x += bw) { c.fillStyle = T.board[((x / bw) | 0) & 3]; c.fillRect(x, 342, bw, 34); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x + 12, 354, bw - 24, 4); c.fillRect(x + 22, 362, bw - 44, 4); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x, 342, 2, 34); }
    c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(0, 376, W, 5);
    for (let i = 0; i < 8; i++) { c.fillStyle = i & 1 ? T.turf[0] : T.turf[1]; c.fillRect(0, 380 + i * (HS.H - 380) / 8, W, (HS.H - 380) / 8 + 1); }
    c.strokeStyle = T.line; c.lineWidth = 3;
    c.beginPath(); c.moveTo(W / 2, 400); c.lineTo(W / 2, HS.H); c.stroke();
    c.beginPath(); c.ellipse(W / 2, 480, 90, 24, 0, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(0, GY + 4); c.lineTo(W, GY + 4); c.stroke();
    hsBgCache[key] = c0;
    return c0;
  }
  function hsGoal(c, side) {
    const W = HS.W, GW = HS.GW, CY = HS.CY, GY = HS.GY;
    c.save();
    if (side) { c.translate(W, 0); c.scale(-1, 1); }
    c.fillStyle = 'rgba(15,20,30,.34)'; c.fillRect(0, CY, GW, GY - CY + 5);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.4;
    c.beginPath();
    for (let x = 0; x <= GW; x += 13) { c.moveTo(x, CY); c.lineTo(x, GY + 4); }
    for (let y = CY; y <= GY + 4; y += 13) { c.moveTo(0, y); c.lineTo(GW, y); }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.moveTo(0, CY - 26); c.lineTo(GW - 16, CY - 8); c.lineTo(0, CY); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.4; c.beginPath(); for (let i = 0; i <= 7; i++) { const x = i * (GW - 16) / 7; c.moveTo(x, CY - 26 + i * 18 / 7); c.lineTo(x, CY - 2); } c.stroke();
    c.fillStyle = '#ffffff'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2;
    c.beginPath(); c.arc(GW, CY + 0, HS.CR + 1, 0, TAU); c.fill();
    c.fillRect(GW - 4, CY, 8, GY - CY + 4);
    c.strokeRect(GW - 4, CY, 8, GY - CY + 4);
    c.fillRect(0, CY - HS.CR, GW, HS.CR * 2);
    c.strokeRect(0, CY - HS.CR, GW, HS.CR * 2);
    c.restore();
  }
  function hsDrawPlayer(c, S, V, i, al, sh) {
    const p = S.pl[i], ch = HS_CH[p.ch], t = i & 1, f = p.face;
    const x = lerp(p.px, p.x, al), y = lerp(p.py, p.y, al);
    const hr = hsHeadR(p), hy = y - HS.HO, b = S.ball;
    const bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al);
    let cel = 0;
    if (S.phase === 'goal' && S.last === t) cel = Math.abs(Math.sin(S.tt * 9)) * 18;
    const air = clamp((GYdist(y)) / 120, 0, 1);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x, HS.GY + 6, 30 * (1 - air * .45), 7 * (1 - air * .4), 0, 0, TAU); c.fill();
    c.save(); c.translate(0, -cel);
    const ph = V.walk[i], mv = Math.abs(p.vx) > 30 && p.y >= HS.GY - 1 ? 1 : 0, sw = Math.sin(ph) * 11 * mv;
    const hipY = y - 16, skin = hex(ch.sk, -.04);
    const leg = (hx, hy2, fx, fy, shoeA) => {
      c.strokeStyle = skin; c.lineCap = 'round'; c.lineWidth = 9; c.beginPath(); c.moveTo(hx, hy2); c.lineTo(fx, fy); c.stroke();
      c.strokeStyle = ch.kit; c.lineWidth = 10; const mx = hx + (fx - hx) * .45, my = hy2 + (fy - hy2) * .45; c.beginPath(); c.moveTo(fx + (mx - fx) * .55, fy + (my - fy) * .55); c.lineTo(fx, fy); c.stroke();
      c.save(); c.translate(fx, fy); c.rotate(shoeA); c.fillStyle = ch.shoe; c.beginPath(); c.ellipse(f * 5, 1, 13, 7.5, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(f * 8, -2, 6, 2.4, 0, 0, TAU); c.fill(); c.restore();
    };
    const airSpread = p.y < HS.GY - 2 ? 1 : 0;
    leg(x - f * 3, hipY, x - f * 8 - sw * f + airSpread * -f * 6, Math.min(HS.GY - 6, y - 5 - airSpread * 7 + Math.abs(sw) * -.3), -.1 * f);
    c.fillStyle = ch.kit; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2;
    rrect(c, x - 18, y - 46, 36, 34, 11); c.fill(); c.stroke();
    c.fillStyle = ch.trim; c.fillRect(x - 18, y - 33, 36, 6);
    c.fillStyle = ch.shorts; rrect(c, x - 16, y - 21, 32, 12, 5); c.fill();
    const fp = hsFoot(p);
    if (p.kt >= 0) leg(x + f * 3, hipY, fp.x, fp.y, Math.atan2(fp.y - hipY, (fp.x - x) * f) * .4 * f);
    else leg(x + f * 5, hipY, x + f * 9 + sw * f, y - 4 - Math.max(0, -sw) * .5, .04 * f);
    const aSw = Math.sin(ph + 1.4) * 9 * mv;
    c.fillStyle = skin; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + f * 20 + aSw * f, y - 22 + Math.abs(aSw) * .3 - (p.kt >= 0 ? 10 : 0), 6.5, 0, TAU); c.fill(); c.stroke();
    const dl = Math.hypot(bx - x, by - hy) || 1;
    const hot = p.g >= 100;
    if (hot) { const gl = c.createRadialGradient(x, hy, hr * .6, x, hy, hr * 1.9); gl.addColorStop(0, hex(ch.trim, .0) + '00'); gl.addColorStop(.55, ch.trim.length === 7 ? ch.trim + '55' : 'rgba(255,255,255,.3)'); gl.addColorStop(1, ch.trim + '00'); c.fillStyle = gl; c.beginPath(); c.arc(x, hy, hr * 1.9, 0, TAU); c.fill(); }
    const kicking = p.kt >= 0, hurt = p.st > 0 || p.fr > 0;
    drawHead(c, ch, x, hy, hr, f, { lx: (bx - x) / dl * f, ly: (by - hy) / dl, mood: hurt ? 3 : kicking ? 1 : cel > 0 ? 2 : 0, mouth: kicking ? .9 : cel > 0 ? .8 : hurt ? 1 : 0, blink: V.blink[i] });
    if (p.bl > 0) { for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(255,${120 + k * 40},30,.7)`; c.beginPath(); c.ellipse(x + (k - 1) * 14, y - 20 - ((S.tt * 120 + k * 40) % 50), 6 - k, 9, 0, 0, TAU); c.fill(); } }
    c.restore();
    if (p.fr > 0) {
      c.fillStyle = 'rgba(160,225,255,.52)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5;
      rrect(c, x - 40, y - hr * 2 - 18, 80, hr * 2 + 24 + 8, 14); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 22, y - hr * 2 - 8); c.lineTo(x - 8, y - hr * 2 + 20); c.moveTo(x + 18, y - 36); c.lineTo(x + 28, y - 8); c.stroke();
    }
    if (p.st > 0 && p.fr <= 0) { for (let k = 0; k < 3; k++) { const a = S.tt * 7 + k * 2.1; txt(c, '*', x + Math.cos(a) * 30, hy - hr - 8 + Math.sin(a) * 7, 20, '#ffe14a', 'center', 900, 'rgba(0,0,0,.4)'); } }
    if (p.sp > 0) { c.strokeStyle = 'rgba(255,230,80,.6)'; c.lineWidth = 3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - f * (36 + k * 10), y - 40 + k * 14); c.lineTo(x - f * (62 + k * 14), y - 40 + k * 14); c.stroke(); } }
    if (p.jb > 0) { c.strokeStyle = 'rgba(120,255,160,.7)'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, HS.GY + 2, 34, 8, 0, 0, TAU); c.stroke(); }
  }
  const GYdist = y => Math.max(0, HS.GY - y);

  function hsDrawBall(c, S, V, al) {
    const b = S.ball, x = lerp(b.px, b.x, al), y = lerp(b.py, b.y, al), r = b.r, k = HS_FXN[b.fx];
    const h = clamp((HS.GY - y) / 340, 0, 1);
    c.fillStyle = `rgba(0,0,0,${.3 - h * .18})`; c.beginPath(); c.ellipse(x, HS.GY + 6, r * (1.05 - h * .45), r * .26, 0, 0, TAU); c.fill();
    if (k) {
      const col = { fire: '255,120,20', ice: '120,210,255', tornado: '120,255,190', volt: '255,236,70', giant: '190,120,255', ghost: '210,190,255', homing: '255,110,190', bomb: '255,90,60' }[k];
      for (let i = V.trail.length - 1; i >= 0; i--) { const q = V.trail[i], a = i / V.trail.length; c.fillStyle = `rgba(${col},${a * .5})`; c.beginPath(); c.arc(q[0], q[1], r * (.35 + a * .65), 0, TAU); c.fill(); }
      const gl = c.createRadialGradient(x, y, r * .5, x, y, r * 2.4); gl.addColorStop(0, `rgba(${col},.7)`); gl.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = gl; c.beginPath(); c.arc(x, y, r * 2.4, 0, TAU); c.fill();
    }
    c.save();
    if (k === 'ghost') c.globalAlpha = .1 + .12 * Math.abs(Math.sin(S.tt * 14));
    drawBall(c, x, y, r, b.rot, 'soccer');
    c.restore();
    if (k === 'bomb') { c.fillStyle = 'rgba(40,10,10,.55)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); txt(c, Math.ceil(b.ft) + '', x, y + 1, r * 1.1, '#ff5a3a', 'center', 900); }
    if (k === 'ice') { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + b.rot; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5); c.stroke(); } }
  }

  function hsVis(S) { return { parts: [], trail: [], crowd: 0, walk: [0, 0], blink: [0, 0], bt: [2, 3], pops: [], flash: 0, flashC: '255,255,255', hint: 0, ring: [], lastPhase: '' }; }
  function hsBurst(V, x, y, n, col, sp, life, grav, s) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = rnd(.3, 1) * sp; V.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.5, 1) * life, l0: life, c: col, s: rnd(.6, 1) * s, g: grav }); }
  }
  const HS_SPCOL = { fire: '255,140,30', ice: '140,220,255', tornado: '120,255,190', volt: '255,236,70', giant: '190,130,255', ghost: '200,180,255', homing: '255,120,200', bomb: '255,100,60' };
  function hsEvent(V, S, e, sh) {
    const k = e[0], b = S.ball;
    if (k === 0) { sh.snd('head', e[1]); if (e[1] > .35) hsBurst(V, b.x, b.y, 4, '#fff', 120, .35, 300, 3); V.crowd = Math.max(V.crowd, .15); }
    else if (k === 1) { sh.snd('kick', e[1]); hsBurst(V, b.x, b.y, 7, '#ffffff', 220, .4, 400, 3.4); }
    else if (k === 2) { const sp = HS_CH[e[1]].sp; sh.snd('sp_' + sp); V.flash = .3; V.flashC = HS_SPCOL[sp]; hsBurst(V, b.x, b.y, 26, 'rgb(' + HS_SPCOL[sp] + ')', 380, .7, 0, 5); V.pops.push({ x: HS.W / 2, y: 128, t: 1.3, tx: HS_CH[e[1]].spName.toUpperCase() + '!', c: 'rgb(' + HS_SPCOL[sp] + ')', big: 1 }); V.crowd = 1; }
    else if (k === 3) { sh.snd('goal'); V.crowd = 1.6; V.flash = .5; V.flashC = '255,255,255'; hsBurst(V, e[2], b.y, 30, '#ffe14a', 420, .9, 500, 4); for (let i = 0; i < 40; i++) V.parts.push({ x: rnd(0, HS.W), y: rnd(-30, 20), vx: rnd(-40, 40), vy: rnd(120, 280), life: 2.2, l0: 2.2, c: pick(['#ffd23f', '#ff5d73', '#4cc9f0', '#7ae582', '#fff']), s: rnd(3, 5), g: 0, sq: 1 }); }
    else if (k === 4) { sh.snd(S.cfg.humanTeam === e[1] || S.cfg.humanTeam == null ? 'win' : 'lose'); }
    else if (k === 5) sh.snd('whistle2');
    else if (k === 6) { sh.snd('jump'); const p = S.pl[e[1]]; if (p) hsBurst(V, p.x, HS.GY, 5, 'rgba(255,255,255,.7)', 90, .4, 0, 3); }
    else if (k === 7) { const p = S.pl[e[1]]; if (p) hsBurst(V, p.x, HS.GY, 4, 'rgba(255,255,255,.6)', 90, .35, 0, 3); sh.snd('land'); }
    else if (k === 8) sh.snd('post', e[1]);
    else if (k === 9) sh.snd('bounce', e[1]);
    else if (k === 10) { sh.snd('freeze'); const p = S.pl[e[1]]; if (p) hsBurst(V, p.x, p.y - 50, 16, '#cdeeff', 220, .7, 200, 4); }
    else if (k === 11) { sh.snd('item'); V.pops.push({ x: e[3], y: e[4] - 20, t: 1.1, tx: HS_ITEMS[e[2]].n + '!', c: HS_ITEMS[e[2]].c }); hsBurst(V, e[3], e[4], 12, HS_ITEMS[e[2]].c, 220, .6, 0, 4); }
    else if (k === 12) { sh.snd('boom'); V.flash = .45; V.flashC = '255,160,60'; hsBurst(V, e[1], e[2], 40, 'rgb(255,150,50)', 560, .8, 100, 6); hsBurst(V, e[1], e[2], 22, '#444', 300, 1, -80, 7); }
    else if (k === 13) sh.snd('stun');
    else if (k === 14) sh.snd('whistle3');
    else if (k === 15) { V.pops.push({ x: HS.W / 2, y: 150, t: 2.2, tx: 'GOLDEN GOAL', c: '#ffd23f', big: 1 }); sh.snd('whistle2'); }
    else if (k === 16) sh.snd('swing');
    else if (k === 17) sh.snd('deny');
  }
  function hsVisStep(V, S, dt, sh) {
    const b = S.ball;
    if (sh.get().role === 'guest') S.tt += dt;
    V.crowd = Math.max(0, V.crowd - dt * .6);
    if (V.flash > 0) V.flash -= dt;
    V.hint += dt;
    S.pl.forEach((p, i) => {
      V.walk[i] += Math.abs(p.vx) * dt * .045;
      V.bt[i] -= dt; if (V.bt[i] < 0) { V.blink[i] = 1; if (V.bt[i] < -.12) { V.blink[i] = 0; V.bt[i] = rnd(1.5, 4); } }
    });
    if (b.fx) { V.trail.push([b.x, b.y]); if (V.trail.length > 12) V.trail.shift(); if (HS_FXN[b.fx] === 'fire') hsBurst(V, b.x, b.y, 1, 'rgb(255,' + (100 + Math.random() * 120 | 0) + ',30)', 70, .5, -160, 5); if (HS_FXN[b.fx] === 'volt' && Math.random() < .6) hsBurst(V, b.x, b.y, 1, '#fff6a0', 160, .25, 0, 3); }
    else if (V.trail.length) V.trail.shift();
    for (let i = V.parts.length - 1; i >= 0; i--) { const p = V.parts[i]; p.life -= dt; if (p.life <= 0) { V.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; if (p.y > HS.GY + 4 && p.g > 0) { p.y = HS.GY + 4; p.vy *= -.3; } }
    for (let i = V.pops.length - 1; i >= 0; i--) { V.pops[i].t -= dt; if (V.pops[i].t <= 0) V.pops.splice(i, 1); }
    if (S.phase !== V.lastPhase) { if (S.phase === 'ready') { V.trail.length = 0; } V.lastPhase = S.phase; }
  }
  function hsRender(c, S, V, sh) {
    const al = sh.alpha == null ? 1 : sh.alpha, W = HS.W, H = HS.H, T = HS_STAGES[S.cfg.stage || 0], b = S.ball;
    c.save();
    if (S.shake > 0) c.translate(rnd(-1, 1) * S.shake * 14, rnd(-1, 1) * S.shake * 10);
    c.drawImage(hsBg(sh, S.cfg.stage || 0), 0, 0, W, H);
    const e = V.crowd;
    if (e > .05) { c.fillStyle = `rgba(255,255,255,${Math.min(.14, e * .1)})`; c.fillRect(0, 150, W, 190); }
    hsGoal(c, 0); hsGoal(c, 1);
    for (const it of S.items) {
      const a = Math.min(1, it.t * 2), I = HS_ITEMS[it.k];
      c.globalAlpha = a; const gl = c.createRadialGradient(it.x, it.y, 3, it.x, it.y, 34); gl.addColorStop(0, I.c); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.beginPath(); c.arc(it.x, it.y, 34, 0, TAU); c.fill();
      c.fillStyle = I.c; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(it.x, it.y, 17, 0, TAU); c.fill(); c.stroke();
      txt(c, I.t, it.x, it.y + 1, 19, '#fff', 'center', 900, 'rgba(0,0,0,.45)'); c.globalAlpha = 1;
    }
    for (let i = 0; i < 2; i++) hsDrawPlayer(c, S, V, i, al, sh);
    hsDrawBall(c, S, V, al);
    for (const p of V.parts) {
      const a = clamp(p.life / (p.l0 * .6), 0, 1); c.globalAlpha = a;
      if (p.sq) { c.fillStyle = p.c; c.fillRect(p.x, p.y, p.s, p.s * .5); } else { c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, p.s * (.4 + a * .6), 0, TAU); c.fill(); }
    }
    c.globalAlpha = 1;
    c.restore();
    if (V.flash > 0) { c.fillStyle = `rgba(${V.flashC},${Math.min(.5, V.flash)})`; c.fillRect(0, 0, W, H); }
    hsHud(c, S, V, sh);
  }
  function hsHud(c, S, V, sh) {
    const W = HS.W, cfg = S.cfg;
    c.fillStyle = 'rgba(8,12,28,.78)'; rrect(c, W / 2 - 112, 8, 224, 58, 14); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 2; c.stroke();
    const secs = Math.max(0, Math.ceil(S.clock));
    txt(c, cfg.time > 0 ? (S.sd ? 'GOLDEN' : Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0')) : '', W / 2, 52, 17, S.clock < 10 && cfg.time > 0 && !S.sd ? '#ff6b6b' : '#fff', 'center', 900);
    txt(c, String(S.sc[0]), W / 2 - 66, 34, 40, '#fff', 'center', 900); txt(c, String(S.sc[1]), W / 2 + 66, 34, 40, '#fff', 'center', 900);
    txt(c, ':', W / 2, 32, 34, 'rgba(255,255,255,.6)', 'center', 900);
    S.pl.forEach((p, i) => {
      const ch = HS_CH[p.ch], left = i === 0, x0 = left ? 16 : W - 16, al = left ? 'left' : 'right';
      c.fillStyle = ch.kit; rrect(c, left ? 14 : W - 214, 10, 200, 26, 9); c.globalAlpha = .9; c.fill(); c.globalAlpha = 1;
      txt(c, cfg.names[i], x0 + (left ? 8 : -8), 24, 15, '#fff', al, 900, 'rgba(0,0,0,.5)');
      const bx = left ? 14 : W - 214, by = 40, bw = 200, full = p.g >= 100;
      c.fillStyle = 'rgba(0,0,0,.55)'; rrect(c, bx, by, bw, 12, 6); c.fill();
      const gg = c.createLinearGradient(bx, 0, bx + bw, 0); gg.addColorStop(0, '#ffb703'); gg.addColorStop(1, full ? '#fff27a' : '#ff6a00');
      c.fillStyle = gg; if (p.g > 2) { rrect(c, bx, by, bw * p.g / 100, 12, 6); c.fill(); }
      c.strokeStyle = full ? `rgba(255,255,255,${.6 + .4 * Math.sin(S.tt * 12)})` : 'rgba(255,255,255,.35)'; c.lineWidth = 2; rrect(c, bx, by, bw, 12, 6); c.stroke();
      if (full) txt(c, ch.spName.toUpperCase() + ' READY', bx + bw / 2, by + 6.5, 10, '#2a1600', 'center', 900);
      let ix = left ? 16 : W - 16;
      const icons = [[p.sp, '#ffd23f', 'S'], [p.jb, '#7ae582', 'J'], [p.bg, '#ff7ab8', 'B']];
      icons.forEach(([tm, col, l]) => { if (tm > 0) { c.fillStyle = col; c.beginPath(); c.arc(ix + (left ? 9 : -9), 66, 9, 0, TAU); c.fill(); txt(c, l, ix + (left ? 9 : -9), 67, 11, '#fff', 'center', 900); ix += left ? 22 : -22; } });
    });
    for (const q of V.pops) {
      const a = clamp(q.t * 2, 0, 1), k = q.big ? 1 + Math.max(0, q.t - 1) * .5 : 1;
      c.globalAlpha = a; txt(c, q.tx, q.x, q.y - (1.2 - q.t) * 20, (q.big ? 44 : 20) * k, q.c, 'center', 900, 'rgba(0,0,0,.6)'); c.globalAlpha = 1;
    }
    if (S.phase === 'ready') {
      const n = Math.ceil(S.pt - .6);
      if (S.sc[0] + S.sc[1] === 0 && S.tt < 3) txt(c, 'KICK OFF', W / 2, 150, 58, '#fff', 'center', 900, 'rgba(0,0,0,.55)');
      else if (n > 0) txt(c, String(n), W / 2, 150, 70, '#fff', 'center', 900, 'rgba(0,0,0,.55)');
    }
    if (S.phase === 'goal') {
      const k = Math.min(1, (2.3 - S.pt) * 5), w = S.last;
      c.save(); c.translate(W / 2, 170); c.scale(.6 + k * .5, .6 + k * .5);
      txt(c, 'GOAL!', 0, 0, 96, '#ffe14a', 'center', 900, 'rgba(0,0,0,.65)');
      txt(c, cfg.names[w], 0, 62, 28, '#fff', 'center', 900, 'rgba(0,0,0,.6)'); c.restore();
    }
    const me = sh.get().me, p = S.pl[me];
    if (p && V.hint < 4 && S.phase !== 'over') { const x = lerp(p.px, p.x, sh.alpha == null ? 1 : sh.alpha); c.globalAlpha = Math.min(1, 4 - V.hint); txt(c, 'YOU', x, p.y - HS.HO - hsHeadR(p) - 26, 17, '#fff', 'center', 900, 'rgba(0,0,0,.6)'); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 7, p.y - HS.HO - hsHeadR(p) - 14); c.lineTo(x + 7, p.y - HS.HO - hsHeadR(p) - 14); c.lineTo(x, p.y - HS.HO - hsHeadR(p) - 6); c.fill(); c.globalAlpha = 1; }
  }

  const hsSnd = {
    kick(sh, v) { v = clamp(v || .6, .2, 1); sh.tone('sine', 190, 70, .13, .55 * v); sh.noise('lowpass', 900, 250, 1, .07, .22 * v); },
    head(sh, v) { v = clamp(v || .5, .15, 1); sh.tone('sine', 260, 120, .09, .4 * v); sh.noise('lowpass', 600, 200, 1, .05, .12 * v); },
    swing(sh) { sh.noise('highpass', 1800, 700, .7, .12, .05); },
    deny(sh) { sh.tone('square', 190, 150, .12, .05); },
    jump(sh) { sh.tone('sine', 300, 560, .1, .05); },
    land(sh) { sh.noise('lowpass', 400, 150, 1, .06, .06); },
    bounce(sh, v) { sh.tone('sine', 130, 55, .14, .45 * clamp(v || .5, .2, 1)); },
    post(sh, v) { sh.tone('triangle', 980, 640, .35, .22); sh.tone('square', 1400, 900, .2, .04); sh.noise('highpass', 3000, 3000, 1, .08, .1); },
    goal(sh) {
      sh.tone('sawtooth', 233, 233, .8, .06); sh.tone('sawtooth', 311, 311, .8, .05); sh.tone('square', 466, 466, .8, .03);
      sh.noise('bandpass', 1000, 1500, .6, 2.2, .3, .05, .2); sh.noise('bandpass', 2400, 2000, 1, 1.8, .1, .1, .2);
      for (let i = 0; i < 5; i++) sh.tone('sine', rnd(500, 800), rnd(700, 1100), rnd(.3, .6), .03, rnd(0, .8));
    },
    whistle2(sh) { sh.tone('square', 2550, 2550, .26, .04); sh.tone('square', 2690, 2690, .26, .035, .02); },
    whistle3(sh) { for (let i = 0; i < 3; i++) { sh.tone('square', 2550, 2550, .2, .04, i * .3); sh.tone('square', 2690, 2690, .2, .035, i * .3 + .02); } },
    freeze(sh) { for (let i = 0; i < 6; i++) sh.tone('sine', rnd(1500, 3200), rnd(1200, 2400), .18, .05, i * .035); sh.noise('highpass', 5000, 4000, 1, .3, .1); },
    stun(sh) { sh.tone('square', 220, 90, .2, .08); },
    item(sh) { [660, 880, 1320].forEach((f, i) => sh.tone('square', f, f, .09, .045, i * .06)); },
    boom(sh) { sh.tone('sine', 120, 28, .7, .8); sh.noise('lowpass', 1500, 100, 1, .8, .6); sh.noise('bandpass', 600, 200, 1, .5, .3); },
    sp_fire(sh) { sh.noise('bandpass', 400, 1800, 1.2, .55, .35); sh.tone('sawtooth', 120, 400, .5, .1); sh.noise('highpass', 3000, 1500, 1, .4, .1, .1); },
    sp_ice(sh) { for (let i = 0; i < 5; i++) sh.tone('triangle', 2400 - i * 250, 1800 - i * 200, .25, .07, i * .04); sh.noise('highpass', 5000, 3000, 1, .3, .12); },
    sp_tornado(sh) { sh.noise('bandpass', 300, 1500, 2, .9, .3); sh.tone('sine', 200, 700, .9, .1); },
    sp_volt(sh) { sh.tone('sawtooth', 2000, 100, .28, .12); sh.noise('highpass', 2500, 800, 1, .25, .3); sh.tone('square', 90, 90, .3, .1); },
    sp_giant(sh) { sh.tone('sine', 90, 40, .9, .5); sh.noise('lowpass', 400, 80, 1, .8, .4); sh.tone('sawtooth', 70, 110, .8, .08); },
    sp_ghost(sh) { sh.tone('sine', 500, 300, .9, .06); sh.tone('sine', 505, 310, .9, .06, .02); sh.noise('bandpass', 1200, 400, 3, .8, .1); },
    sp_homing(sh) { for (let i = 0; i < 3; i++) sh.tone('sine', 1500, 1500, .14, .06, i * .13); sh.tone('triangle', 400, 900, .5, .08); },
    sp_bomb(sh) { for (let i = 0; i < 4; i++) sh.tone('square', 1300, 1300, .05, .04, i * .1); sh.tone('sawtooth', 160, 320, .4, .08); },
    win(sh) { [523, 659, 784, 1047, 1319].forEach((f, i) => { sh.tone('square', f, f, .18, .045, i * .11); sh.tone('triangle', f / 2, f / 2, .22, .08, i * .11); }); }
  };

  const hsShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const HS_LADDER = [0, 1, 1, 2, 2, 3, 4];
  const hsStat = v => '<i>' + '●'.repeat(Math.round(v)) + '<u>' + '●'.repeat(5 - Math.round(v)) + '</u></i>';

  function hsCfg(sh, mine, opp, lvl, extra) {
    const o = sh.opt;
    return Object.assign({ time: o.time, items: !!o.items, chars: [mine, opp], names: ['You', HS_CH[opp].name], lvl, stage: o.stage, humanTeam: 0, goalTarget: 0 }, extra || {});
  }
  function hsPlan(sh, cfg, meta) {
    return { cfg, seats: [{ kind: 'human', name: 'You', local: true }, { kind: 'cpu', name: HS_CH[cfg.chars[1]].name, lvl: cfg.lvl }], meta };
  }
  function hsPlanArcade(sh, run) {
    const idx = run.idx, opp = run.order[idx];
    return hsPlan(sh, hsCfg(sh, sh.opt.char, opp, HS_LADDER[idx], { stage: (sh.opt.stage + idx) % 4 }), { mode: 'arcade', run });
  }
  function hsNewArcade(sh) {
    const mine = sh.opt.char, others = hsShuffle(HS_CH.map((_, i) => i).filter(i => i !== mine));
    return hsPlanArcade(sh, { idx: 0, order: others, pts: 0, cont: 0 });
  }
  function hsNewTour(sh) {
    const mine = sh.opt.char, field = [mine].concat(hsShuffle(HS_CH.map((_, i) => i).filter(i => i !== mine)));
    return hsPlanTour(sh, { round: 0, alive: field, log: [] });
  }
  function hsPlanTour(sh, run) {
    const opp = run.alive[1], lvl = [1, 2, 3][run.round];
    return hsPlan(sh, hsCfg(sh, run.alive[0], opp, lvl, { stage: (sh.opt.stage + run.round) % 4 }), { mode: 'tour', run });
  }
  function hsPlanSurv(sh, run) {
    const mine = sh.opt.char, pool = HS_CH.map((_, i) => i).filter(i => i !== mine && i !== run.prev), opp = pick(pool);
    run.prev = opp;
    return hsPlan(sh, hsCfg(sh, mine, opp, Math.min(4, Math.floor(run.round / 2)), { time: 30, stage: (sh.opt.stage + run.round) % 4 }), { mode: 'surv', run });
  }
  function hsPlanVs(sh) {
    const o = sh.opt, opp = o.opp >= 0 && o.opp !== o.char ? o.opp : pick(HS_CH.map((_, i) => i).filter(i => i !== o.char));
    return hsPlan(sh, hsCfg(sh, o.char, opp, o.cpu), { mode: 'vs' });
  }
  const hsSimOther = (a, b) => {
    const pa = HS_CH[a].rt + 1 + Math.random() * 2.5, pb = HS_CH[b].rt + 1 + Math.random() * 2.5, w = pa >= pb ? 0 : 1;
    const lo = Math.random() * 3 | 0, hi = lo + 1 + (Math.random() * 3 | 0);
    return { a, b, sa: w === 0 ? hi : lo, sb: w === 0 ? lo : hi, w };
  };

  function hsBracket(run) {
    const names = ['Quarter-finals', 'Semi-finals', 'Final'];
    return run.log.map((rd, i) => `<div style="text-align:left;margin:0 0 1cqw"><span class="hs-op" style="display:block;margin:0 0 .4cqw;opacity:.6;font-size:clamp(9px,1.5cqw,12px);letter-spacing:.1em;text-transform:uppercase">${names[i]}</span>${rd.map(m => `<div style="font-weight:800;font-size:clamp(10px,1.9cqw,15px);${m.me ? 'color:var(--ac)' : 'opacity:.85'}">${HS_CH[m.a].name} ${m.sa} - ${m.sb} ${HS_CH[m.b].name}</div>`).join('')}</div>`).join('');
  }

  function hsMenu(sh) {
    const o = sh.opt, ch = HS_CH[o.char];
    return `<div class="hs-top"><div><h2 class="hs-logo">HEAD <b>SOCCER</b></h2><p class="hs-tag">Big heads, big kicks. Fill the power gauge and unleash your special shot.</p></div></div>
<div class="hs-modes">
<button class="hs-mode" data-a="arcade"><b>Arcade ladder</b><span>Beat all seven rivals, each tougher than the last.</span></button>
<button class="hs-mode" data-a="tour"><b>Tournament</b><span>Eight fighters, three rounds: quarter-final, semi-final, final.</span></button>
<button class="hs-mode" data-a="surv"><b>Survival</b><span>30-second rounds, three lives, ever smarter opponents.</span></button>
<button class="hs-mode" data-a="vs"><b>Versus CPU</b><span>Pick any rival and level for a single match.</span></button>
<button class="hs-mode" data-a="online"><b>Play online 1v1</b><span>Challenge a friend. A bot can take the empty seat.</span></button>
</div>
<p class="hs-sec" style="margin-top:8px">Choose your fighter</p>
<div class="hs-chars">${HS_CH.map((c, i) => `<button type="button" class="hs-char${i === o.char ? ' on' : ''}" data-opt="char" data-val="${i}"><canvas data-c="${i}" width="124" height="124"></canvas>${c.name}<small>${c.spName}</small></button>`).join('')}</div>
<div class="hs-info"><b>${ch.name}</b> · ${ch.spName}: ${ch.spText}<div style="margin-top:6px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px"><span>Speed ${hsStat(ch.spd * 3.6 - 1.1)}</span><span>Jump ${hsStat(ch.jmp * 3.6 - 1.1)}</span><span>Power ${hsStat(ch.pow * 3.6 - 1.1)}</span></div></div>
<style>.gm-head-soccer .hs-info i{font-style:normal;letter-spacing:1px;color:var(--ac)}.gm-head-soccer .hs-info u{text-decoration:none;opacity:.25;color:#fff}</style>
${sh.orow('Versus rival', sh.chips('opp', [[-1, 'Random']].concat(HS_CH.map((c, i) => [i, c.name]))))}
${sh.orow('CPU level', sh.chips('cpu', HS_LV.map((l, i) => [i, l.n])))}
${sh.orow('Match length', sh.chips('time', [[45, '45 s'], [60, '60 s'], [90, '90 s']]))}
${sh.orow('Power-ups', sh.chips('items', [[1, 'On'], [0, 'Off']]))}
${sh.orow('Stadium', sh.chips('stage', HS_STAGES.map((s, i) => [i, s.name])))}
<p class="hs-help"><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> run, <kbd>↑</kbd> <kbd>W</kbd> or <kbd>Space</kbd> jump, <kbd>X</kbd> or <kbd>K</kbd> kick, <kbd>Z</kbd> or <kbd>L</kbd> special shot once the gauge is full. Every touch fills the gauge. Controller: A jump, X kick, B special. On touch screens use the buttons.</p>`;
  }

  function hsOver(sh, S, plan, seats, me) {
    const m = plan.meta || {}, myT = me & 1, won = S.win === myT, sc = S.sc, online = plan.online;
    const line = `<p class="hs-op">${esc(S.cfg.names[0])} ${sc[0]} : ${sc[1]} ${esc(S.cfg.names[1])}</p>`;
    if (online) return `<div class="hs-oc"><h3 class="hs-oh">${won ? 'You win!' : esc(S.cfg.names[S.win]) + ' wins'}</h3>${line}<div class="hs-ob">${sh.endButtons()}</div></div>`;
    const diff = sc[myT] - sc[1 - myT];
    if (m.mode === 'arcade') {
      const run = m.run;
      if (won) {
        const gain = 100 * (run.idx + 1) + diff * 25 + Math.round(S.clock) * 2;
        run.pts += gain; run.won = 1;
        sh.snd('win');
        if (run.idx >= 6) {
          const total = Math.max(0, run.pts - run.cont * 150);
          sh.api.submit(total);
          return `<div class="hs-oc"><h3 class="hs-oh">Champion!</h3>${line}<p class="hs-op">You beat all seven rivals.</p>${sh.stats([['Score', total], ['Continues', run.cont]])}<div class="hs-ob">${sh.btn('rematch', 'New run')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
        }
        return `<div class="hs-oc"><h3 class="hs-oh">Victory!</h3>${line}<p class="hs-op">+${gain} points. Next: ${HS_CH[run.order[run.idx + 1]].name} (${run.idx + 2} of 7).</p><div class="hs-ob">${sh.btn('rematch', 'Next match')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
      }
      run.won = 0; run.cont++;
      return `<div class="hs-oc"><h3 class="hs-oh">Defeated</h3>${line}<p class="hs-op">Continue costs 150 points off your final score.</p><div class="hs-ob">${sh.btn('rematch', 'Continue')}${sh.btn('menu', 'Quit', 'alt')}</div></div>`;
    }
    if (m.mode === 'tour') {
      const run = m.run, rd = [{ a: S.cfg.chars[0], b: S.cfg.chars[1], sa: sc[0], sb: sc[1], w: S.win, me: 1 }];
      const nxt = [run.alive[0]];
      for (let i = 2; i < run.alive.length; i += 2) { const r = hsSimOther(run.alive[i], run.alive[i + 1]); rd.push(r); nxt.push(r.w === 0 ? r.a : r.b); }
      run.log.push(rd);
      if (won) {
        run.alive = nxt; run.round++; run.won = 1;
        if (run.round >= 3) {
          const total = 1000 + diff * 40;
          sh.api.submit(total); sh.snd('win');
          return `<div class="hs-oc"><h3 class="hs-oh">Tournament champion!</h3>${line}${hsBracket(run)}<div class="hs-ob">${sh.btn('rematch', 'New tournament')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
        }
        return `<div class="hs-oc"><h3 class="hs-oh">Round won!</h3>${line}${hsBracket(run)}<div class="hs-ob">${sh.btn('rematch', 'Next round')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
      }
      run.won = 0; sh.api.submit(run.round * 250 + Math.max(0, diff + 3) * 10);
      return `<div class="hs-oc"><h3 class="hs-oh">Knocked out</h3>${line}${hsBracket(run)}<div class="hs-ob">${sh.btn('rematch', 'New tournament')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
    }
    if (m.mode === 'surv') {
      const run = m.run;
      if (won) { run.pts += 100 + run.round * 40 + diff * 20; run.goals += sc[myT]; run.round++; run.won = 1; sh.snd('win'); return `<div class="hs-oc"><h3 class="hs-oh">Round ${run.round} cleared</h3>${line}${sh.stats([['Score', run.pts], ['Lives', '♥'.repeat(run.lives)]])}<div class="hs-ob">${sh.btn('rematch', 'Next round')}${sh.btn('menu', 'Quit', 'alt')}</div></div>`; }
      run.lives--; run.won = 0; run.goals += sc[myT];
      if (run.lives <= 0) { run.dead = 1; sh.api.submit(run.pts); return `<div class="hs-oc"><h3 class="hs-oh">Game over</h3>${line}${sh.stats([['Rounds', run.round], ['Score', run.pts]])}<div class="hs-ob">${sh.btn('rematch', 'Try again')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`; }
      return `<div class="hs-oc"><h3 class="hs-oh">Round lost</h3>${line}${sh.stats([['Score', run.pts], ['Lives', '♥'.repeat(run.lives)]])}<div class="hs-ob">${sh.btn('rematch', 'Retry round')}${sh.btn('menu', 'Quit', 'alt')}</div></div>`;
    }
    if (won) sh.api.submit(Math.max(1, (S.cfg.lvl + 1) * 100 + diff * 30 + Math.round(S.clock)));
    return `<div class="hs-oc"><h3 class="hs-oh">${won ? 'You win!' : 'You lose'}</h3>${line}<div class="hs-ob">${sh.endButtons()}</div></div>`;
  }

  const HS_PAD = [{ s: 'l', b: 1, t: '◀', c: 'mv' }, { s: 'l', b: 2, t: '▶', c: 'mv' }, { s: 'r', b: 16, t: 'POWER', c: 'gold' }, { s: 'r', b: 8, t: 'KICK', c: 'big' }, { s: 'r', b: 4, t: 'JUMP', c: 'big' }];

  const HS_G = {
    id: 'head-soccer', accent: '#ff7a1a', W: HS.W, H: HS.H, hz: 120, snapMs: 33, delay: 100,
    defaults: { char: 0, opp: -1, cpu: 2, time: 60, items: 1, stage: 0 },
    keymap: { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, ArrowUp: 4, KeyW: 4, Space: 4, KeyX: 8, KeyK: 8, KeyJ: 8, KeyZ: 16, KeyL: 16, KeyC: 16 },
    pad: HS_PAD, sounds: hsSnd, sndGap: { head: 50, kick: 60, swing: 90, bounce: 60, land: 90, post: 100, jump: 80 },
    room: () => ({ title: 'Head Soccer', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true }),
    hello: sh => ({ c: sh.opt.char }),
    newSim: hsNew, step: hsStep, ai: hsAI, makeVis: hsVis, vis: hsVisStep, event: hsEvent, render: hsRender,
    pack(S) {
      const b = S.ball, d = [['ready', 'play', 'goal', 'over', 'sd'].indexOf(S.phase), S.sc[0], S.sc[1], Math.round(S.clock * 10), S.over, S.win, Math.round(S.pt * 100), S.last, Math.round(b.vx), Math.round(b.vy), b.fx, Math.round(b.ft * 100), Math.round(b.rot * 100), S.sd, Math.round(S.shake * 100)];
      for (const p of S.pl) d.push(Math.round(p.vx), Math.round(p.vy), p.kt < 0 ? -1 : Math.round(p.kt * 1000), p.kp, Math.round(p.g), Math.round(p.fr * 100), Math.round(p.sp * 100), Math.round(p.jb * 100), Math.round(p.bg * 100), Math.round(p.st * 100), Math.round(p.bl * 100));
      for (const it of S.items) d.push(it.k, Math.round(it.x), Math.round(it.y), Math.round(it.t * 10), it.id);
      return { a: [b.x, b.y, S.pl[0].x, S.pl[0].y, S.pl[1].x, S.pl[1].y, b.r], d };
    },
    unpack(S, a, d) {
      const b = S.ball;
      b.px = b.x = a[0]; b.py = b.y = a[1]; b.r = a[6];
      S.pl.forEach((p, i) => { p.px = p.x = a[2 + i * 2]; p.py = p.y = a[3 + i * 2]; });
      S.phase = ['ready', 'play', 'goal', 'over', 'sd'][d[0]] || 'play';
      S.sc = [d[1], d[2]]; S.clock = d[3] / 10; S.over = d[4]; S.win = d[5]; S.pt = d[6] / 100; S.last = d[7]; b.vx = d[8]; b.vy = d[9]; b.fx = d[10]; b.ft = d[11] / 100; b.rot = d[12] / 100; S.sd = d[13]; S.shake = d[14] / 100;
      S.pl.forEach((p, i) => { const o = 15 + i * 11; p.vx = d[o]; p.vy = d[o + 1]; p.kt = d[o + 2] < 0 ? -1 : d[o + 2] / 1000; p.kp = d[o + 3]; p.g = d[o + 4]; p.fr = d[o + 5] / 100; p.sp = d[o + 6] / 100; p.jb = d[o + 7] / 100; p.bg = d[o + 8] / 100; p.st = d[o + 9] / 100; p.bl = d[o + 10] / 100; });
      S.items = [];
      for (let o = 37; o + 4 < d.length + 0; o += 5) S.items.push({ k: d[o], x: d[o + 1], y: d[o + 2], t: d[o + 3] / 10, id: d[o + 4] });
    },
    result: S => S.over,
    scoreText: S => S.sc[0] + ' : ' + S.sc[1],
    resumeInfo: S => `Saved match: ${S.sc[0]} : ${S.sc[1]}, ${Math.ceil(S.clock)} s left.`,
    onlinePlan(sh, r) {
      const used = new Set(), seats = [];
      const hostChar = sh.opt.char; used.add(hostChar);
      const chars = [hostChar];
      for (let i = 1; i < 2; i++) {
        const p = r.players[i];
        let c = p && sh.picks[p.id] && typeof sh.picks[p.id].c === 'number' ? sh.picks[p.id].c : -1;
        if (c < 0 || c >= HS_CH.length || used.has(c)) c = pick(HS_CH.map((_, k) => k).filter(k => !used.has(k)));
        used.add(c); chars.push(c);
      }
      for (let i = 0; i < 2; i++) { const p = r.players[i]; seats.push(p ? { kind: 'human', name: p.name, id: p.id } : { kind: 'cpu', name: HS_CH[chars[i]].name + ' (bot)', lvl: sh.opt.cpu }); }
      return { cfg: { time: sh.opt.time, items: !!sh.opt.items, chars, names: seats.map(s => s.name), stage: sh.opt.stage, humanTeam: null, lvl: sh.opt.cpu, goalTarget: 0 }, seats, meta: { mode: 'online' } };
    },
    rematchPlan(sh, plan, S) {
      const m = plan.meta || {};
      if (m.mode === 'arcade') {
        const run = m.run;
        if (run.won) { if (run.idx >= 6) return hsNewArcade(sh); run.idx++; run.won = 0; }
        return hsPlanArcade(sh, run);
      }
      if (m.mode === 'tour') {
        if (m.run.won && m.run.round < 3) return hsPlanTour(sh, m.run);
        return hsNewTour(sh);
      }
      if (m.mode === 'surv') {
        const run = m.run;
        if (run.dead) return hsPlanSurv(sh, { round: 0, lives: 3, pts: 0, goals: 0, prev: -1 });
        return hsPlanSurv(sh, run);
      }
      if (m.mode === 'vs') return hsPlanVs(sh);
      return Object.assign({}, plan, { seats: plan.seats.map(s => Object.assign({}, s)) });
    },
    begin(sh, S, V, resumed) { if (resumed) { S.phase = 'ready'; S.pt = 1.6; } },
    overHtml: hsOver,
    menu: hsMenu,
    menuDone(sh, el) { el.querySelectorAll('canvas[data-c]').forEach(cv => drawCharIcon(cv, HS_CH[+cv.dataset.c])); },
    act(sh, a) {
      if (a === 'arcade') sh.begin(hsNewArcade(sh));
      else if (a === 'tour') sh.begin(hsNewTour(sh));
      else if (a === 'surv') sh.begin(hsPlanSurv(sh, { round: 0, lives: 3, pts: 0, goals: 0, prev: -1 }));
      else if (a === 'vs') sh.begin(hsPlanVs(sh));
    },
    reg: {
      title: 'Head Soccer', tint: '#ff7a1a',
      blurb: 'Big-headed footballers, 60-second matches, charged special shots. Arcade, tournament, survival and online 1v1.',
      help: '<kbd>←</kbd> <kbd>→</kbd> run · <kbd>↑</kbd>/<kbd>Space</kbd> jump · <kbd>X</kbd> kick · <kbd>Z</kbd> special shot (gauge full) · touch buttons · gamepad A / X / B',
      width: 960, format: v => v + ' pts', better: 'high',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="24" r="14"/><circle cx="25" cy="22" r="2" fill="currentColor"/><circle cx="35" cy="22" r="2" fill="currentColor"/><path d="M24 29q6 5 12 0"/><path d="M20 40l-6 14M40 40l8 14"/><circle cx="52" cy="50" r="6"/></svg>'
    }
  };
  register(HS_G);

  const BL = { W: 1000, H: 560, GY: 470, RY: 255, RW: 34, BR: 15, HX: [92, 908], BBX: [26, 974], PJ: 640, SJ: 560, PG: 2200, BG: 1500, D3: 330, APEX: .26, SC: 24 };
  const BL_CH = [
    { id: 'flash', name: 'Flash', sk: '#c98a5b', hair: '#161616', hair2: '#e5e5e5', style: 'band', acc: 'none', accC: '#e8363d', kit: '#e8363d', trim: '#ffffff', shorts: '#8d1a20', shoe: '#ffffff', num: 1, spd: 1.1, jmp: 1.02, sht: 1, def: 1.05, dnk: 1, sp: 'turbo', spName: 'Turbo', spText: 'Supercharged speed, higher jumps and a longer steal reach.', rt: 4 },
    { id: 'sniper', name: 'Sniper', sk: '#f0c8a0', hair: '#5a3418', hair2: '#e0c07a', style: 'cap', acc: 'glasses', accC: '#222', kit: '#1f6fe0', trim: '#ffd23f', shorts: '#12408a', shoe: '#ffd23f', num: 7, spd: .98, jmp: .98, sht: 1.28, def: .95, dnk: .9, sp: 'fire', spName: 'Heat Check', spText: 'Every shot is a perfect release and the ball burns on its way in.', rt: 4 },
    { id: 'tank', name: 'Tank', sk: '#8a5a3a', hair: '#1a1a1a', hair2: '#2b2b2b', style: 'bald', acc: 'beard', accC: '#1a1a1a', kit: '#6a2fc0', trim: '#ffd23f', shorts: '#3b1a70', shoe: '#1a1a1a', num: 33, spd: .9, jmp: 1.02, sht: .9, def: 1.1, dnk: 1.25, sp: 'giant', spName: 'Power Mode', spText: 'Grow huge: dunk from far away and nothing can block or steal you.', rt: 4 },
    { id: 'hawk', name: 'Hawk', sk: '#7a4a2a', hair: '#1a1210', hair2: '#3a2a20', style: 'afro', acc: 'none', kit: '#14a35a', trim: '#ffffff', shorts: '#0b5f34', shoe: '#ffffff', num: 24, spd: 1.02, jmp: 1.1, sht: .96, def: 1.25, dnk: 1.05, sp: 'lock', spName: 'Lockdown', spText: 'Sky-high reach: steals and blocks almost always succeed.', rt: 3 },
    { id: 'chill', name: 'Chill', sk: '#f2d2b6', hair: '#bfe6ff', hair2: '#8cc4ee', style: 'spiky', acc: 'goggles', accC: '#2b6ea8', lens: 'rgba(150,230,255,.6)', kit: '#27a9d8', trim: '#ffffff', shorts: '#0f4f73', shoe: '#e8f6ff', num: 11, spd: 1, jmp: 1, sht: 1.08, def: 1, dnk: .95, sp: 'freeze', spName: 'Deep Freeze', spText: 'A cold wave freezes the other team, then slows them down.', rt: 3 },
    { id: 'ghost', name: 'Ghost', sk: '#e6dcd2', hair: '#2a2140', hair2: '#14101c', style: 'hood', acc: 'mask', accC: '#14101c', kit: '#2a2140', trim: '#b46bff', shorts: '#14101c', shoe: '#b46bff', num: 0, spd: 1.04, jmp: 1.04, sht: 1, def: 1, dnk: 1, sp: 'phase', spName: 'Phase Dribble', spText: 'Turn into a ghost: no steals, no blocks, no contested shots.', rt: 3 }
  ];
  const BL_LV = [
    { n: 'Rookie', react: .34, spd: .8, terr: .085, open: 120, steal: .35, block: .18, cross: .1, pass: .2, ag: .3 },
    { n: 'Pro', react: .22, spd: .9, terr: .055, open: 100, steal: .6, block: .4, cross: .25, pass: .35, ag: .5 },
    { n: 'All-Star', react: .13, spd: .97, terr: .035, open: 85, steal: .85, block: .65, cross: .4, pass: .5, ag: .7 },
    { n: 'Legend', react: .07, spd: 1.03, terr: .02, open: 72, steal: 1, block: .9, cross: .55, pass: .6, ag: .9 }
  ];
  const BL_SPDUR = { turbo: 7, fire: 7, giant: 7, lock: 7, freeze: 3.5, phase: 7 };
  const blDir = (S, t) => S.atk[t] > 500 ? 1 : -1;

  function blSolve(x0, y0, tx, ty, g) {
    const dist = Math.abs(tx - x0);
    const apex = Math.max(24, Math.min(y0, ty) - clamp(70 + dist * .2, 80, 230));
    const up = Math.max(10, y0 - apex), vy = -Math.sqrt(2 * g * up), tu = -vy / g, dn = Math.max(10, ty - apex), td = Math.sqrt(2 * dn / g), T = tu + td;
    return { vx: (tx - x0) / T, vy, T };
  }

  function blNew(cfg) {
    const n = cfg.n;
    const S = { cfg, n, pl: [], ball: { x: 500, y: 300, px: 500, py: 300, vx: 0, vy: 0, h: 0, ph: 0, shot: -1, rim: 0, tt: 0, pick: 0, rot: 0, pts: 2, from: 0, last: 0, tgt: -1, glow: 0, dunk: 0, pass: -1, passT: 0, lh: -1 }, sc: [0, 0], q: 1, clock: cfg.qlen, sclock: BL.SC, phase: 'ready', pt: 1.8, over: 0, win: -1, poss: 0, atk: [BL.HX[1], BL.HX[0]], tt: 0, shake: 0, scoreTeam: -1, freeze: [0, 0], sfrz: 0, qs: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] };
    for (let i = 0; i < n; i++) S.pl.push({ ch: cfg.chars[i], x: 500, y: BL.GY, px: 500, py: BL.GY, vx: 0, vy: 0, face: i & 1 ? -1 : 1, sh: 0, st: 0, dk: -1, dkd: 1, dkx: 0, dky: 0, dkb: 0, dks: 0, hd: 0, cr: 0, crd: 1, crc: 0, stm: 0, stc: 0, sp: 0, sb: 0, pm: 0, fz: 0, ld: 1, pts: 0, stl: 0, blk: 0 });
    blReset(S, 0);
    S.phase = 'ready'; S.pt = 1.8;
    return S;
  }
  function blReset(S, team) {
    const n = S.n, a = blDir(S, team);
    const offX = [500 - a * 180, 500 - a * 300], defX = [500 + a * 60, 500 + a * 170];
    const mates = [0, 1, 2, 3].filter(i => i < n && (i & 1) === team), foes = [0, 1, 2, 3].filter(i => i < n && (i & 1) !== team);
    mates.forEach((i, k) => { const p = S.pl[i]; p.x = p.px = offX[k]; p.y = p.py = BL.GY; p.vx = p.vy = 0; p.face = a; });
    foes.forEach((i, k) => { const p = S.pl[i]; p.x = p.px = defX[k]; p.y = p.py = BL.GY; p.vx = p.vy = 0; p.face = -a; });
    S.pl.forEach(p => { p.sh = 0; p.st = 0; p.dk = -1; p.cr = 0; p.crc = 0; p.stm = 0; p.stc = 0; p.pm = 0; p.dkb = 0; p.dks = 0; p.hd = 0; });
    const b = S.ball, hp = S.pl[mates[0]];
    b.h = mates[0]; b.shot = -1; b.vx = b.vy = 0; b.tt = 0; b.pick = 0; b.rim = 0; b.tgt = -1; b.glow = 0; b.ph = 0; b.dunk = 0; b.pass = -1; b.lh = -1;
    b.x = b.px = hp.x + hp.face * 28; b.y = b.py = BL.GY - 40;
    S.poss = team; S.sclock = BL.SC; S.sfrz = 0;
  }

  const blScale = p => (p.sp > 0 && BL_CH[p.ch].sp === 'giant') ? 1.28 : 1;
  function blSpeed(S, p, i) {
    const ch = BL_CH[p.ch];
    let s = 238 * ch.spd * (S.ball.h === i ? .94 : 1);
    if (p.sp > 0 && ch.sp === 'turbo') s *= 1.5;
    if (S.freeze[i & 1] > 0) s *= .4;
    return s;
  }
  function blHand(S, p) {
    const sc = blScale(p), f = p.face;
    if (p.dk >= 0) return { x: p.x + f * 30 * sc, y: p.y - 178 * sc };
    if (p.sh) { const k = clamp(p.st / .22, 0, 1); return { x: p.x + f * (12 + 10 * k) * sc, y: p.y - (110 + 78 * k) * sc }; }
    return { x: p.x + f * 28 * sc, y: p.y - 62 * sc };
  }
  function blReach(p) {
    const sc = blScale(p), air = p.y < BL.GY - 3, lock = p.sp > 0 && BL_CH[p.ch].sp === 'lock';
    return { x: p.x + p.face * 14, y: p.y - (air ? 200 : 150) * sc - (lock ? 25 : 0), r: (air ? 44 : 38) * sc + (lock ? 22 : 0) };
  }
  const blCharge = (p, v) => { p.sb = Math.min(100, p.sb + v); };

  function blRelease(S, i, emit, q) {
    const p = S.pl[i], b = S.ball, ch = BL_CH[p.ch], t = i & 1, hx = S.atk[t];
    const hand = blHand(S, p), dist = Math.abs(p.x - hx), fire = p.sp > 0 && ch.sp === 'fire', ghost = p.sp > 0 && ch.sp === 'phase';
    const early = p.st < BL.APEX ? -1 : 1;
    let sig = [.036, .056, .076, .096, .116][fire ? 0 : q] * (fire ? .8 : 1) / ch.sht * (.5 + dist / 380);
    const bias = fire ? 0 : (early < 0 ? [0, .03, .07, .12, .18] : [0, .05, .13, .24, .36])[q] * early / ch.sht;
    if (dist < 150) sig *= .55;
    let cont = 0;
    for (let j = 0; j < S.n; j++) {
      if ((j & 1) === t) continue;
      const o = S.pl[j], d = Math.abs(o.x - p.x);
      if (d < 150 && (o.x - p.x) * p.face >= -20) cont = Math.max(cont, (150 - d) / 150 + (o.y < BL.GY - 6 ? .6 : 0));
      else if (d < 100 && o.stm <= 0) cont = Math.max(cont, (100 - d) / 100 * .6 + (o.y < BL.GY - 6 ? .4 : 0));
    }
    if (!fire && !ghost) sig *= 1 + cont * 2.2;
    const sol = blSolve(hand.x, hand.y, hx, BL.RY + 4, BL.BG);
    b.h = -1; b.x = hand.x; b.y = hand.y; b.vx = sol.vx * (1 + bias + gauss() * sig); b.vy = sol.vy * (1 + gauss() * sig * .5);
    b.shot = i; b.rim = 0; b.tt = 0; b.pick = .18; b.from = t; b.last = t; b.lh = i; b.dunk = 0; b.pass = -1;
    b.pts = dist > BL.D3 ? 3 : 2;
    b.glow = fire ? 4 : 0;
    p.sh = 0; p.st = 0; S.sfrz = 1;
    emit([1, i, fire ? 0 : q, Math.round(dist), early]);
  }

  function blStartDunk(S, i, emit) {
    const p = S.pl[i], t = i & 1, hx = S.atk[t], hd = blDir(S, t);
    p.dk = 0; p.dkx = p.x; p.dky = p.y; p.dkd = .42 + Math.abs(hx - p.x) / 700; p.face = hd; p.vx = 0; p.vy = 0; p.sh = 0; p.dkb = 0; p.dks = 0; p.hd = 0;
    emit([2, i]);
  }
  function blStepDunk(S, i, dt, emit) {
    const p = S.pl[i], t = i & 1, hx = S.atk[t], hd = blDir(S, t), b = S.ball, sc = blScale(p), D = p.dkd;
    p.dk += dt;
    const u = Math.min(1, p.dk / D), k = Math.min(1, u / .8);
    p.x = lerp(p.dkx, hx - hd * 30 * sc, 1 - Math.pow(1 - u, 2.2));
    p.y = lerp(p.dky, BL.RY + 148 * sc, 1 - Math.pow(1 - k, 1.6));
    p.vx = 0; p.vy = 0;
    if (b.h === i) { b.x = p.x + hd * 30 * sc; b.y = p.y - 178 * sc; b.vx = b.vy = 0; }
    if (!p.dkb && u > .5 && b.h === i) {
      const prot = p.sp > 0 && (BL_CH[p.ch].sp === 'giant' || BL_CH[p.ch].sp === 'phase');
      if (!prot) {
        for (let j = 0; j < S.n; j++) {
          const o = S.pl[j];
          if ((j & 1) === t || o.y > BL.GY - 22 || o.stm > 0 || o.dk >= 0) continue;
          const r = blReach(o);
          if (Math.hypot(r.x - (p.x + hd * 20), r.y - (p.y - 150)) < r.r + 46 && (Math.random() < .5 || (o.sp > 0 && BL_CH[o.ch].sp === 'lock'))) {
            b.h = -1; b.vx = -hd * rnd(260, 420); b.vy = -rnd(120, 300); b.shot = -1; b.tt = 0; b.pick = .35; b.rim = 1; b.last = j & 1; b.lh = i;
            p.dk = -1; p.vy = 120; p.stm = .5; p.vx = -hd * 120;
            blCharge(o, 24); o.blk++; S.shake = .3;
            emit([4, j, i]);
            return;
          }
        }
      }
      p.dkb = 1;
    }
    if (u > .72 && b.h === i && !p.dks) {
      p.dks = 1; b.h = -1; b.x = hx; b.y = BL.RY - 18; b.vx = 0; b.vy = 420; b.shot = i; b.pts = 2; b.rim = 0; b.tt = 0; b.dunk = 1; b.from = t; b.last = t; b.pick = .5; b.lh = i;
    }
    if (u >= 1) {
      p.hd += dt;
      if (p.hd > .3) { p.dk = -1; p.hd = 0; p.dks = 0; }
    }
  }

  function blPass(S, i, emit) {
    const b = S.ball, p = S.pl[i];
    const mate = [0, 1, 2, 3].find(j => j < S.n && j !== i && (j & 1) === (i & 1));
    if (mate == null) return;
    const m = S.pl[mate], hand = blHand(S, p), T = clamp(Math.abs(m.x - p.x) / 1000 + .2, .22, .5);
    const tx = clamp(m.x + m.vx * T * .8, 50, 950), ty = m.y - 105;
    b.h = -1; b.x = hand.x; b.y = hand.y; b.vx = (tx - hand.x) / T; b.vy = (ty - hand.y - .5 * BL.BG * T * T) / T;
    b.tgt = mate; b.shot = -1; b.pick = .1; b.tt = 0; b.last = i & 1; b.pass = i; b.passT = S.tt; b.lh = i; b.dunk = 0;
    emit([5, i, mate]);
  }
  function blCross(S, i, dirIn, pf, emit) {
    const p = S.pl[i], t = i & 1, nd = dirIn !== 0 ? dirIn : pf;
    p.cr = .3; p.crd = nd; p.crc = 1.2; p.ld = nd; p.face = nd;
    let juked = 0;
    for (let j = 0; j < S.n; j++) {
      if ((j & 1) === t) continue;
      const o = S.pl[j], rel = o.x - p.x;
      if (o.stm > 0 || o.y < BL.GY - 6 || Math.sign(rel) !== nd || Math.abs(rel) > 130) continue;
      if (!(o.sp > 0 && BL_CH[o.ch].sp === 'turbo')) { o.stm = .32; o.vx = 0; juked++; }
    }
    if (juked) { blCharge(p, 16); emit([6, i]); } else emit([7, i]);
  }
  function blSteal(S, i, emit) {
    const p = S.pl[i], b = S.ball, t = i & 1;
    if (b.h < 0 || (b.h & 1) === t) return;
    const hi = b.h, h = S.pl[hi], ch = BL_CH[p.ch], lock = p.sp > 0 && ch.sp === 'lock', turbo = p.sp > 0 && ch.sp === 'turbo';
    p.stc = lock ? .45 : .75;
    const reach = (lock ? 118 : turbo ? 82 : 66) * blScale(p);
    if (Math.abs(h.x - p.x) > reach || (h.x - p.x) * p.face < -14 || h.sh || h.dk >= 0) { p.stm = Math.max(p.stm, .18); emit([8, i]); return; }
    if (h.cr > 0 || h.crc > .4) { p.stm = .55; emit([8, i]); return; }
    if (h.sp > 0 && (BL_CH[h.ch].sp === 'phase' || BL_CH[h.ch].sp === 'giant')) { p.stm = .4; emit([8, i]); return; }
    let pr = .38 * ch.def * (lock ? 2.6 : 1) * (1 + (1 - Math.abs(Math.cos(b.ph))) * .5);
    if (Math.abs(h.vx) < 20) pr += .12;
    pr = clamp(pr, .1, .95);
    if (Math.random() < pr) {
      b.h = i; b.ph = 0; b.pick = 0; b.tgt = -1; b.pass = -1; S.poss = t; S.sclock = BL.SC; blCharge(p, 24); p.stl++;
      h.stm = .35; emit([9, i, hi]);
    } else { p.stm = .3; emit([8, i]); }
  }

  function blStep(S, inp, dt, emit) {
    if (S.over) return;
    S.tt += dt;
    if (S.shake > 0) S.shake -= dt;
    for (let t = 0; t < 2; t++) if (S.freeze[t] > 0) S.freeze[t] -= dt;
    const b = S.ball, GY = BL.GY, n = S.n;
    for (const p of S.pl) { p.px = p.x; p.py = p.y; }
    b.px = b.x; b.py = b.y;
    if (S.phase === 'ready') {
      S.pt -= dt; if (S.pt <= 0) { S.phase = 'play'; emit([10]); }
      if (b.h >= 0) blHold(S, dt);
      return;
    }
    if (S.phase === 'qend') {
      S.pt -= dt;
      if (b.h >= 0) blHold(S, dt);
      if (S.pt <= 0) {
        if (S.q >= 4 && S.sc[0] !== S.sc[1]) { S.over = 1; S.phase = 'over'; S.win = S.sc[0] > S.sc[1] ? 0 : 1; emit([11, S.win]); return; }
        S.q++;
        if (S.q > 4) S.clock = 30; else S.clock = S.cfg.qlen;
        if (S.q === 3) S.atk = [S.atk[1], S.atk[0]];
        blReset(S, S.q & 1 ? 0 : 1);
        S.phase = 'ready'; S.pt = 1.6; emit([12, S.q]);
      }
      return;
    }
    const scoring = S.phase === 'score';
    if (scoring) {
      S.pt -= dt;
      if (S.pt <= 0) { blReset(S, 1 - S.scoreTeam); S.phase = 'ready'; S.pt = .7; return; }
    }
    for (let i = 0; i < n; i++) {
      const p = S.pl[i], ch = BL_CH[p.ch], t = i & 1, m = scoring ? 0 : (inp[i] | 0), hold = b.h === i;
      const pf = p.face;
      if (p.stm > 0) p.stm -= dt;
      if (p.stc > 0) p.stc -= dt;
      if (p.crc > 0) p.crc -= dt;
      if (p.fz > 0) p.fz -= dt;
      if (p.sp > 0) { p.sp -= dt; if (p.sp <= 0) { p.sp = 0; emit([14, i, 0]); } }
      const ground = p.y >= GY - .5;
      if (p.dk >= 0) { blStepDunk(S, i, dt, emit); p.pm = m; continue; }
      const stuck = p.stm > 0;
      const l = m & 1, r = m & 2, dirIn = l && r ? 0 : l ? -1 : r ? 1 : 0;
      if (dirIn) p.ld = dirIn;
      if (p.cr > 0) { p.cr -= dt; p.vx = p.crd * 540 * (p.sp > 0 && ch.sp === 'turbo' ? 1.25 : 1); }
      else if (stuck) p.vx *= Math.exp(-14 * dt);
      else { const sp = blSpeed(S, p, i), ac = ground ? 3800 : 1400; p.vx += clamp(dirIn * sp - p.vx, -ac * dt, ac * dt); }
      if (!stuck && p.sh === 0 && dirIn && p.cr <= 0) p.face = dirIn;
      const frozen = S.freeze[t] > 0;
      if ((m & 4) && ground && !stuck && !p.sh && !frozen) {
        p.vy = -BL.PJ * ch.jmp * (p.sp > 0 ? (ch.sp === 'turbo' ? 1.18 : ch.sp === 'lock' ? 1.3 : ch.sp === 'giant' ? 1.1 : 1) : 1);
        emit([15, i]);
      }
      const sE = (m & 8) && !(p.pm & 8), aE = (m & 16) && !(p.pm & 16), spE = (m & 32) && !(p.pm & 32), pE = (m & 64) && !(p.pm & 64);
      if (hold && !stuck) {
        if (sE && !p.sh) {
          const hx = S.atk[t], hd = blDir(S, t), dist = Math.abs(hx - p.x), giant = p.sp > 0 && ch.sp === 'giant';
          const dr = (giant ? 330 : 165) * ch.dnk, toward = (hx - p.x) * p.vx > 0 && Math.abs(p.vx) > 90;
          const wall = !giant && !(p.sp > 0 && ch.sp === 'phase') && S.pl.some((o, j) => (j & 1) !== t && o.y >= GY - 10 && o.stm <= 0 && (o.x - p.x) * hd > 0 && (o.x - p.x) * hd < 85);
          if (dist < dr && (dist < 110 * ch.dnk || toward || giant) && (hx - p.x) * hd > -10 && !wall) blStartDunk(S, i, emit);
          else { p.sh = 1; p.st = 0; p.face = hd; if (ground) p.vy = -BL.SJ; }
        }
        if (p.dk < 0) {
          if (aE && p.crc <= 0 && !p.sh && ground) blCross(S, i, dirIn, pf, emit);
          if (pE && n > 2 && !p.sh) blPass(S, i, emit);
        }
      }
      if (!hold && aE && p.stc <= 0 && !stuck && p.dk < 0) blSteal(S, i, emit);
      if (spE && p.sb >= 100 && p.sp <= 0) {
        p.sb = 0; p.sp = BL_SPDUR[ch.sp]; emit([14, i, 1]);
        if (ch.sp === 'freeze') { S.freeze[1 - t] = 3.4; for (let j = 0; j < n; j++) if ((j & 1) !== t) { S.pl[j].fz = 1.3; S.pl[j].stm = Math.max(S.pl[j].stm, 1.2); } }
      }
      if (p.sh && p.dk < 0) {
        p.st += dt;
        const rel = !(m & 8) || p.st > .52 || (ground && p.st > .12 && p.vy >= 0);
        if (b.h === i) {
          if (rel) {
            const err = Math.abs(p.st - BL.APEX);
            blRelease(S, i, emit, err < .035 ? 0 : err < .07 ? 1 : err < .11 ? 2 : err < .17 ? 3 : 4);
          }
        } else { p.sh = 0; p.st = 0; }
      }
      p.pm = m;
      p.vy += BL.PG * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.x = clamp(p.x, 50, BL.W - 50);
      if (p.y >= GY) { if (p.vy > 300) emit([16, i]); p.y = GY; p.vy = 0; }
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = S.pl[i], c = S.pl[j];
      if (a.dk >= 0 || c.dk >= 0 || a.cr > 0 || c.cr > 0 || a.y < GY - 40 || c.y < GY - 40) continue;
      const dx = c.x - a.x, ad = Math.abs(dx);
      if (ad < 38) { const push = (38 - ad) * .5 * Math.min(1, dt * 40), s = dx >= 0 ? 1 : -1; a.x = clamp(a.x - s * push, 50, 950); c.x = clamp(c.x + s * push, 50, 950); }
    }
    blBall(S, dt, emit);
    if (S.phase === 'play') {
      if (b.shot < 0 && !S.sfrz) S.sclock -= dt;
      if (S.sclock <= 0) {
        emit([17]);
        blReset(S, 1 - S.poss);
        S.phase = 'ready'; S.pt = 1.1;
        return;
      }
      S.clock -= dt;
      if (S.clock <= 0) {
        S.clock = 0;
        if (b.shot < 0 || b.tt > 2.8) { S.phase = 'qend'; S.pt = S.q === 2 ? 2.8 : 2.2; emit([18, S.q]); }
      }
    }
    if (S.sfrz && (b.h >= 0 || b.shot < 0)) S.sfrz = 0;
  }

  function blHold(S, dt) {
    const b = S.ball, p = S.pl[b.h];
    if (!p || p.dk >= 0) return;
    const f = p.face, sc = blScale(p), GY = BL.GY;
    if (p.sh) {
      const k = clamp(p.st / .22, 0, 1);
      b.x = p.x + f * (12 + 10 * k) * sc; b.y = p.y - (110 + 78 * k) * sc; b.vx = p.vx; b.vy = p.vy;
      return;
    }
    b.ph += dt * Math.PI / .46;
    let side = f * 28 * sc;
    if (p.cr > 0) side = f * 28 * sc * (1 - 2 * Math.min(1, (.3 - p.cr) / .22));
    const handY = p.y - 66 * sc, floorY = GY - BL.BR;
    b.x = p.x + side; b.y = floorY - (floorY - handY) * Math.abs(Math.cos(b.ph));
    if (p.y < GY - 2) b.y = Math.min(b.y, p.y - 40);
    b.vx = p.vx; b.vy = 0; b.rot += p.vx * dt / BL.BR;
  }

  function blBall(S, dt, emit) {
    const b = S.ball, GY = BL.GY, W = BL.W, R = BL.BR, n = S.n;
    if (b.h >= 0) { blHold(S, dt); return; }
    b.tt += dt; if (b.pick > 0) b.pick -= dt;
    if (b.glow > 0) b.glow -= dt;
    b.vy += BL.BG * dt;
    const py = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vx * dt / R;
    if (b.y > GY - R) {
      b.y = GY - R;
      if (b.vy > 120) emit([19, Math.min(1, b.vy / 900)]);
      b.vy *= -.72; if (Math.abs(b.vy) < 90) b.vy = 0;
      b.vx *= Math.exp(-1.8 * dt);
      if (b.shot >= 0 && !b.dunk) b.shot = -1;
    }
    if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * .6; } else if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * .6; }
    for (let s = 0; s < 2; s++) {
      const hx = BL.HX[s], bb = BL.BBX[s], dir = s ? -1 : 1, bx0 = bb + dir * 5;
      if (b.y > BL.RY - 125 && b.y < BL.RY + 22 && ((s === 0 && b.x - R < bx0 && b.x > bb - 10) || (s === 1 && b.x + R > bx0 && b.x < bb + 10))) {
        if ((s === 0 && b.vx < 0) || (s === 1 && b.vx > 0)) { b.x = bx0 + dir * R; if (Math.abs(b.vx) > 40) emit([20, Math.min(1, Math.abs(b.vx) / 500)]); b.vx = -b.vx * .3; b.vy *= .85; b.rim = 1; }
      }
      for (const ex of [hx - BL.RW, hx + BL.RW]) {
        const dx = b.x - ex, dy = b.y - BL.RY, rr = R + 3.5, d2 = dx * dx + dy * dy;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || .01, nx = dx / d, ny = dy / d;
          b.x = ex + nx * rr; b.y = BL.RY + ny * rr;
          const vn = b.vx * nx + b.vy * ny;
          if (vn < 0) { b.vx -= 1.58 * vn * nx; b.vy -= 1.58 * vn * ny; b.vx *= .94; if (Math.abs(vn) > 90) emit([21, Math.min(1, Math.abs(vn) / 500)]); b.rim = 1; }
        }
      }
      if (S.phase === 'play' && py < BL.RY && b.y >= BL.RY && b.vy > 0 && Math.abs(b.x - hx) < BL.RW - 3) {
        const sh = b.shot, team = sh >= 0 ? (sh & 1) : b.last;
        if (S.atk[team] === hx) blScore(S, team, sh, !b.rim, emit);
      }
      if (b.y > BL.RY && b.y < BL.RY + 52 && Math.abs(b.x - hx) < BL.RW && b.vy > 0) { b.vx *= 1 - 5 * dt; b.vy *= 1 - 2.4 * dt; }
    }
    if (S.phase === 'score') return;
    if (b.shot >= 0 && !b.dunk && b.tt > .3 && b.rim) b.shot = -1;
    if (b.shot >= 0 && b.tt > 4) b.shot = -1;
    if (b.shot >= 0 && !b.dunk) {
      const near = Math.min(Math.hypot(b.x - BL.HX[0], b.y - BL.RY), Math.hypot(b.x - BL.HX[1], b.y - BL.RY));
      if (!(near < 95 && b.vy > 0) && b.tt < .75) {
        for (let j = 0; j < n; j++) {
          const o = S.pl[j];
          if ((j & 1) === (b.shot & 1) || o.stm > 0 || o.y >= GY - 8 || o.dk >= 0) continue;
          const r = blReach(o);
          if (Math.hypot(b.x - r.x, b.y - r.y) < r.r + R) {
            const shooter = b.shot;
            b.vx = o.face * rnd(280, 520) + o.vx * .3; b.vy = -rnd(140, 340); b.shot = -1; b.tt = 0; b.pick = .35; b.rim = 1; b.last = j & 1; b.lh = shooter; b.glow = 0;
            blCharge(o, 24); o.blk++; S.shake = .25;
            emit([4, j, shooter]);
            return;
          }
        }
      }
    }
    if (b.pick <= 0 && b.shot < 0) {
      let best = -1, bd = 1e9;
      for (let j = 0; j < n; j++) {
        const o = S.pl[j];
        if (o.fz > 0 || o.dk >= 0 || o.sh) continue;
        if (j === b.lh && b.tt < .4) continue;
        const sc = blScale(o), air = o.y < GY - 3;
        const cx = o.x + o.face * 6, cy = o.y - (air ? 128 : 96) * sc, rr = (air ? 74 : 58) * sc;
        const d = Math.hypot((b.x - cx) * .9, (b.y - cy) * .8);
        if (d < rr && d < bd) {
          if (Math.hypot(b.vx, b.vy) > 1100 && b.tgt !== j) continue;
          bd = d; best = j;
        }
      }
      if (best >= 0) {
        const o = S.pl[best], t = best & 1, wasT = S.poss;
        const interc = b.pass >= 0 && (b.pass & 1) !== t && S.tt - b.passT < 1.2;
        const reb = b.rim;
        b.h = best; b.ph = 0; b.vx = b.vy = 0; b.shot = -1; b.tgt = -1; b.dunk = 0; b.pass = -1; b.rim = 0;
        o.sh = 0; o.st = 0;
        if (wasT !== t) { S.poss = t; S.sclock = BL.SC; if (interc) { blCharge(o, 22); o.stl++; emit([22, best]); } else emit([23, best]); }
        else if (reb) S.sclock = Math.max(S.sclock, 14);
      }
    }
  }

  function blScore(S, team, shooter, swish, emit) {
    const b = S.ball, dunk = b.dunk, pts = dunk ? 2 : b.pts;
    S.sc[team] += pts;
    S.qs[team][S.q <= 4 ? S.q - 1 : 4] += pts;
    S.phase = 'score'; S.pt = 1.5; S.scoreTeam = team;
    S.shake = dunk ? .5 : .15;
    if (shooter >= 0) { const p = S.pl[shooter]; blCharge(p, dunk ? 28 : 20); p.pts += pts; }
    emit([3, team, pts, shooter, dunk ? 1 : 0, swish ? 1 : 0]);
    b.shot = -1; b.dunk = 0; b.pick = 99; b.rim = 0;
  }

  function blLand(b, y) {
    const g = BL.BG, dy = b.y - y, disc = b.vy * b.vy - 2 * g * dy;
    if (disc < 0) return { x: b.x, t: 0 };
    const t = (-b.vy + Math.sqrt(disc)) / g;
    return { x: clamp(b.x + b.vx * t, 50, 950), t };
  }
  function blAI(S, i, mem, dt, seat) {
    if (S.phase !== 'play' || S.over) return 0;
    const p = S.pl[i], b = S.ball, t = i & 1, n = S.n, GY = BL.GY, ch = BL_CH[p.ch];
    const L = BL_LV[clamp((seat && seat.lvl) | 0, 0, 3)];
    mem.t = (mem.t || 0) + dt;
    const hx = S.atk[t], hd = hx > 500 ? 1 : -1, ox = S.atk[1 - t];
    let think = false;
    if ((mem.k = (mem.k === undefined ? 0 : mem.k) - dt) <= 0) { mem.k = L.react * rnd(.7, 1.3); think = true; }
    let m = 0;
    const tap = bit => { if (!(p.pm & bit)) m |= bit; };
    const go = (x, tol) => { const d = x - p.x; if (Math.abs(d) > tol) m |= d > 0 ? 2 : 1; };
    const foes = [], mates = [];
    for (let j = 0; j < n; j++) if (j !== i) ((j & 1) === t ? mates : foes).push(S.pl[j]);
    const mate = mates[0];
    const sp = p.sb >= 100 && p.sp <= 0;
    if (p.dk >= 0) return 0;

    if (b.h === i) {
      if (!mem.had) {
        mem.had = true; mem.hold = 0; mem.shoot = 0; mem.cx = 0;
        const r = Math.random(), pd = .05 + L.ag * .2 * ch.dnk, p3 = ch.sht > 1.15 ? .5 : .2;
        mem.spot = r < pd ? 100 : r < pd + p3 ? rnd(345, 400) : rnd(170, 290);
      }
      mem.hold += dt;
      if (p.sh) { if (p.st < mem.aim) m |= 8; return m; }
      const dist = Math.abs(hx - p.x);
      let ahead = 1e9, aheadF = null;
      for (const f of foes) { const d = (f.x - p.x) * hd; if (d > -10 && d < ahead) { ahead = d; aheadF = f; } }
      if (sp) {
        const near = dist < mem.spot + 130;
        if (ch.sp === 'turbo' ? dist > 250 : ch.sp === 'fire' || ch.sp === 'giant' ? near : ch.sp === 'phase' ? ahead < 170 : ch.sp === 'freeze' ? true : false) tap(32);
      }
      const clockPress = S.sclock < 3.2;
      if (dist <= mem.spot + 6 || clockPress) {
        const open = ahead > L.open || !aheadF || aheadF.stm > .2 || aheadF.y < GY - 40;
        if (open || mem.hold > 1.3 || clockPress) {
          mem.aim = clamp(BL.APEX + gauss() * L.terr, .12, .5);
          tap(8); mem.shoot = 1;
          return m;
        }
        if (n > 2 && mate && think && Math.random() < L.pass) { tap(64); return m; }
        if (think && p.crc <= 0 && aheadF && ahead < 110 && Math.random() < L.cross) { m = hd > 0 ? 2 : 1; tap(16); return m; }
        return m;
      }
      go(hx - hd * mem.spot, 6);
      if (think && aheadF && ahead < 100 && p.crc <= 0 && Math.random() < L.cross) { m = hd > 0 ? 2 : 1; tap(16); }
      else if (think && n > 2 && mate && aheadF && ahead < 120 && Math.random() < L.pass * .5 && Math.abs(mate.x - hx) < Math.abs(p.x - hx)) tap(64);
      return m;
    }
    mem.had = false; mem.shoot = 0;
    if (b.h >= 0 && (b.h & 1) === t) {
      const h = S.pl[b.h];
      if (think) {
        const hd0 = Math.abs(h.x - hx);
        mem.tx = hd0 > 300 ? h.x + hd * 150 : hx - hd * 230;
        if (h.sh) mem.tx = hx - hd * 80;
      }
      if (mem.tx !== undefined) go(mem.tx, 20);
      return m;
    }
    if (b.h >= 0) {
      const h = S.pl[b.h], d = h.x - p.x, ad = Math.abs(d);
      const mine = !mates.length || ad < Math.abs(mates[0].x - h.x) || (ad === Math.abs(mates[0].x - h.x) && i < b.h);
      if (sp && ch.sp === 'lock' && Math.abs(h.x - ox) < 420) tap(32);
      if (sp && ch.sp === 'turbo' && ad > 160) tap(32);
      if (think) {
        if (mine) {
          const gap = 58 + (3 - BL_LV.indexOf(L)) * 14, far = Math.abs(h.x - ox) > 520 ? 1.5 : 1;
          const dirH = Math.sign(ox - h.x) || 1;
          mem.tx = (p.x - h.x) * dirH < -10 ? h.x - dirH * 26 : h.x + dirH * gap * far;
        } else {
          const o2 = foes.find(f => f !== h);
          mem.tx = Math.abs(h.x - ox) < 300 || !o2 ? ox + Math.sign(h.x - ox) * 85 : o2.x + Math.sign(ox - o2.x) * 70;
        }
      }
      if (mem.tx !== undefined) go(mem.tx, 10);
      if (mine) {
        if (h.sh && !mem.hs) { mem.hs = true; if (ad < 125 && Math.random() < L.block && p.y >= GY - 1) mem.jumpAt = mem.t + L.react * rnd(.1, .6); }
        if (!h.sh) mem.hs = false;
        if (h.dk >= 0 && !mem.hdk) { mem.hdk = true; if (Math.abs(p.x - ox) < 150 && Math.random() < L.block * .7) mem.jumpAt = mem.t + .05; }
        if (h.dk < 0) mem.hdk = false;
        if (think && ad < 60 && !h.sh && h.dk < 0 && p.stc <= 0 && p.stm <= 0 && Math.random() < L.steal * .45) { m = (m & ~3) | (d > 0 ? 2 : 1); tap(16); }
      } else if (h.dk >= 0 && !mem.hdk) { mem.hdk = true; if (Math.abs(p.x - ox) < 150 && Math.random() < L.block * .6) mem.jumpAt = mem.t + .05; }
      else if (h.dk < 0) mem.hdk = false;
      if (mem.jumpAt && mem.t >= mem.jumpAt) { m |= 4; mem.jumpAt = 0; }
      return m;
    }
    const lim = b.shot >= 0 && (b.shot & 1) !== t;
    const land = blLand(b, GY - 100);
    let closest = true;
    const myD = Math.abs(land.x - p.x);
    for (const q of mates) if (Math.abs(land.x - q.x) < myD - 4 || (Math.abs(land.x - q.x) === myD && S.pl.indexOf(q) < i)) closest = false;
    if (b.shot >= 0 && (b.shot & 1) === t) {
      if (b.shot === i) { go(hx - hd * 90, 30); }
      else go(hx - hd * 70, 30);
    } else if (lim) {
      const hxo = ox + Math.sign(500 - ox) * 85;
      if (closest || myD < 150) go(clamp(land.x, 50, 950), 8); else go(hxo, 30);
      if (p.y >= GY - 1 && b.y < GY - 120 && Math.abs(b.x - p.x) < 90 && b.vy > -200 && Math.random() < L.block * .1) m |= 4;
    } else if (closest) {
      go(land.x, 6);
    } else {
      go(S.poss === t ? hx - hd * 250 : ox + (b.x - ox) * .4, 30);
    }
    const l2 = blLand(b, GY - 175);
    if (p.y >= GY - 1 && b.shot < 0 && l2.t > 0 && l2.t < .26 && Math.abs(l2.x - p.x) < 70 && b.vy > 0) m |= 4;
    return m;
  }

  const BL_COURTS = [
    { name: 'Arena', floor: ['#d9a35e', '#b9792f'], line: 'rgba(255,255,255,.92)', paint: 'rgba(205,50,60,.42)' },
    { name: 'Street', floor: ['#5b5f69', '#41444c'], line: 'rgba(255,214,64,.92)', paint: 'rgba(255,255,255,.1)' },
    { name: 'Beach', floor: ['#f0d6a0', '#dcb878'], line: 'rgba(255,255,255,.95)', paint: 'rgba(70,170,230,.3)' },
    { name: 'Rooftop', floor: ['#626b7d', '#454c5b'], line: 'rgba(90,240,255,.95)', paint: 'rgba(255,60,180,.24)' }
  ];
  const BL_SPCOL = { turbo: '90,200,255', fire: '255,140,30', giant: '190,130,255', lock: '90,255,150', freeze: '140,220,255', phase: '200,150,255' };
  const blBgCache = {};
  function blBg(sh, ci) {
    const sc = Math.min(2, sh.scale()), key = ci + '@' + sc;
    if (blBgCache[key]) return blBgCache[key];
    const c0 = document.createElement('canvas'); c0.width = BL.W * sc; c0.height = BL.H * sc;
    const c = c0.getContext('2d'); c.scale(sc, sc);
    const W = BL.W, H = BL.H, T = BL_COURTS[ci], R = crowdSeed(ci + 11), FT = 410;
    if (ci === 0) {
      const g = c.createLinearGradient(0, 0, 0, FT); g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#27346e'); c.fillStyle = g; c.fillRect(0, 0, W, FT);
      for (let tier = 0; tier < 4; tier++) {
        const y0 = 96 + tier * 78;
        c.fillStyle = `rgb(${24 + tier * 7},${30 + tier * 8},${58 + tier * 9})`; c.fillRect(0, y0, W, 80);
        for (let x = 6; x < W; x += 16) {
          const px = x + R() * 5, py = y0 + 10 + R() * 12;
          c.fillStyle = `hsl(${Math.floor(R() * 360)},${45 + R() * 30}%,${30 + tier * 4}%)`; c.fillRect(px - 5, py + 9, 10, 15);
          c.fillStyle = `hsl(${20 + R() * 20},${40 + R() * 30}%,${48 + tier * 3}%)`; c.beginPath(); c.arc(px, py + 5, 5, 0, TAU); c.fill();
          if (R() < .5) { px; c.fillStyle = `hsl(${Math.floor(R() * 360)},${45 + R() * 30}%,${30 + tier * 4}%)`; c.fillRect(px + 8, py + 33, 10, 14); c.fillStyle = `hsl(${20 + R() * 20},${40 + R() * 30}%,${48 + tier * 3}%)`; c.beginPath(); c.arc(px + 13, py + 29, 5, 0, TAU); c.fill(); }
        }
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, y0 + 74, W, 6);
      }
      for (const x of [140, 360, 640, 860]) { const gl = c.createRadialGradient(x, 14, 3, x, 14, 150); gl.addColorStop(0, 'rgba(255,255,235,.9)'); gl.addColorStop(1, 'rgba(255,255,235,0)'); c.fillStyle = gl; c.fillRect(x - 150, 0, 300, 220); c.fillStyle = '#ecebd8'; c.fillRect(x - 28, 8, 56, 12); }
      for (const [x, col] of [[250, '#c0392b'], [750, '#2f6fe0']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 34, 40); c.lineTo(x + 34, 40); c.lineTo(x + 34, 150); c.lineTo(x, 176); c.lineTo(x - 34, 150); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(x - 24, 62, 48, 5); c.fillRect(x - 24, 76, 48, 5); c.fillRect(x - 24, 90, 30, 5); }
      for (let x = 0; x < W; x += 125) { c.fillStyle = ['#1c2a5c', '#7a1f2a'][(x / 125) & 1]; c.fillRect(x, 376, 125, 34); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x + 16, 388, 93, 4); c.fillRect(x + 28, 396, 69, 4); }
    } else if (ci === 1) {
      const g = c.createLinearGradient(0, 0, 0, FT); g.addColorStop(0, '#ff9a5c'); g.addColorStop(.5, '#d85a8a'); g.addColorStop(1, '#6a3d8f'); c.fillStyle = g; c.fillRect(0, 0, W, FT);
      for (let i = 0; i < 12; i++) { const x = i * 90 - 20, h = 90 + R() * 140; c.fillStyle = `rgba(36,24,60,${.7 + R() * .2})`; c.fillRect(x, 330 - h, 80, h + 20); for (let wy = 330 - h + 10; wy < 320; wy += 18) for (let wx = x + 8; wx < x + 70; wx += 16) if (R() < .45) { c.fillStyle = R() < .5 ? '#ffd86a' : '#ffb347'; c.fillRect(wx, wy, 7, 9); } }
      c.fillStyle = '#8e4638'; c.fillRect(0, 250, W, 160);
      c.strokeStyle = 'rgba(40,12,8,.5)'; c.lineWidth = 1.5;
      for (let y = 250, r = 0; y < 410; y += 14, r++) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = (r & 1) * 22; x < W; x += 44) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); } }
      const tags = [['#2fe0b0', 210, 330], ['#ffe14a', 520, 312], ['#4ec3ff', 800, 340], ['#ff5d9a', 380, 350]];
      for (const [col, x, y] of tags) { c.strokeStyle = col; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 50, y); c.bezierCurveTo(x - 20, y - 40, x + 10, y + 30, x + 50, y - 10); c.stroke(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(x + 10, y + 26, 10, 0, TAU); c.stroke(); }
      c.strokeStyle = 'rgba(210,220,235,.38)'; c.lineWidth = 1.6; c.beginPath();
      for (let x = -120; x < W + 120; x += 22) { c.moveTo(x, 150); c.lineTo(x + 150, 300); c.moveTo(x + 150, 150); c.lineTo(x, 300); }
      c.stroke(); c.fillStyle = '#9aa3b5'; c.fillRect(0, 146, W, 6); c.fillRect(0, 298, W, 6);
      for (const x of [300, 700]) { c.fillStyle = '#2a2a32'; c.fillRect(x - 3, 150, 6, 260); c.fillRect(x - 3, 150, 40, 5); const gl = c.createRadialGradient(x + 36, 160, 2, x + 36, 160, 130); gl.addColorStop(0, 'rgba(255,230,160,.8)'); gl.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gl; c.fillRect(x - 100, 30, 280, 260); }
    } else if (ci === 2) {
      const g = c.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, '#3bb8ff'); g.addColorStop(1, '#ffeab8'); c.fillStyle = g; c.fillRect(0, 0, W, FT);
      c.fillStyle = '#fff6b0'; c.beginPath(); c.arc(790, 96, 46, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.88)'; for (let i = 0; i < 4; i++) { const x = R() * W, y = 40 + R() * 90; for (const [dx, dy, r] of [[0, 0, 24], [28, -8, 32], [62, 0, 22]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, TAU); c.fill(); } }
      const og = c.createLinearGradient(0, 226, 0, 330); og.addColorStop(0, '#2a9be0'); og.addColorStop(1, '#6fd0ef'); c.fillStyle = og; c.fillRect(0, 226, W, 104);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let y = 240; y < 326; y += 14) { c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + Math.sin(x / 30 + y) * 3); c.stroke(); }
      const sg = c.createLinearGradient(0, 322, 0, FT); sg.addColorStop(0, '#f6e2b0'); sg.addColorStop(1, '#e9cc90'); c.fillStyle = sg; c.fillRect(0, 322, W, FT - 322);
      for (const [x, h, lean] of [[190, 250, -.1], [830, 270, .09]]) {
        c.save(); c.translate(x, 400); c.rotate(lean); c.fillStyle = '#5a3d22'; c.fillRect(-7, -h, 14, h);
        c.fillStyle = '#2e9e4a'; for (let i = 0; i < 8; i++) { c.save(); c.translate(0, -h); c.rotate(-1.4 + i * .42); c.beginPath(); c.ellipse(56, 0, 58, 12, 0, 0, TAU); c.fill(); c.restore(); }
        c.restore();
      }
      for (let i = 0; i < 4; i++) { const x = 330 + i * 110, y = 392; c.fillStyle = ['#ff6b6b', '#4dabf7', '#ffd43b', '#ff9ff3'][i]; c.beginPath(); c.moveTo(x - 40, y); c.quadraticCurveTo(x, y - 58, x + 40, y); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 1, y, 3, 18); }
    } else {
      const g = c.createLinearGradient(0, 0, 0, FT); g.addColorStop(0, '#050a20'); g.addColorStop(.6, '#241c4d'); g.addColorStop(1, '#4a2a66'); c.fillStyle = g; c.fillRect(0, 0, W, FT);
      c.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { c.globalAlpha = .25 + R() * .7; c.fillRect(R() * W, R() * 200, 1.6, 1.6); } c.globalAlpha = 1;
      c.fillStyle = '#f4f1da'; c.beginPath(); c.arc(170, 90, 36, 0, TAU); c.fill(); c.fillStyle = '#05061a'; c.beginPath(); c.arc(184, 82, 32, 0, TAU); c.fill();
      for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 16; i++) { const x = i * 66 - 10 + layer * 30, h = (layer ? 110 : 160) + R() * 150; c.fillStyle = layer ? '#161337' : '#0b0a24'; c.fillRect(x, 400 - h, 60, h); for (let wy = 400 - h + 12; wy < 390; wy += 16) for (let wx = x + 8; wx < x + 52; wx += 14) if (R() < .4) { c.fillStyle = R() < .6 ? '#ffd86a' : R() < .5 ? '#5ad6ff' : '#ff6ac8'; c.fillRect(wx, wy, 6, 8); } }
      c.fillStyle = '#ff3fb0'; pathRR(c, 600, 120, 130, 44, 8); c.fill(); c.strokeStyle = '#ffd6f0'; c.lineWidth = 3; pathRR(c, 600, 120, 130, 44, 8); c.stroke(); c.fillStyle = '#fff'; c.fillRect(615, 136, 100, 6); c.fillRect(630, 148, 70, 5);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 200); c.quadraticCurveTo(250, 270, 500, 214); c.quadraticCurveTo(750, 168, 1000, 232); c.stroke();
      for (let i = 0; i < 18; i++) { const u = i / 17, x = u * W, y = i < 9 ? 200 + Math.sin(u * 3.1) * 30 + u * 20 : 214 + (u - .5) * -20 + Math.sin(u * 5) * 10; c.fillStyle = ['#ffd86a', '#ff6ac8', '#5ad6ff'][i % 3]; c.beginPath(); c.arc(x, 216 + Math.sin(i) * 12, 4, 0, TAU); c.fill(); }
      c.fillStyle = '#4b5164'; c.fillRect(0, 372, W, 38); c.fillStyle = '#5d6478'; c.fillRect(0, 372, W, 6);
      for (let x = 20; x < W; x += 60) { c.fillStyle = '#ffd86a'; c.beginPath(); c.arc(x, 392, 4, 0, TAU); c.fill(); }
    }
    const fg = c.createLinearGradient(0, FT, 0, H); fg.addColorStop(0, T.floor[0]); fg.addColorStop(1, T.floor[1]); c.fillStyle = fg; c.fillRect(0, FT, W, H - FT);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, FT, W, 5);
    c.strokeStyle = 'rgba(0,0,0,.13)'; c.lineWidth = 2;
    for (const y of [426, 444, 464, 488, 516, 548]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    if (ci === 0) { c.lineWidth = 1; for (let x = 0; x < W; x += 56) for (let k = 0; k < 6; k++) { const y0 = [FT, 426, 444, 464, 488, 516][k], y1 = [426, 444, 464, 488, 516, 548][k]; c.beginPath(); c.moveTo(x + (k * 23) % 56, y0); c.lineTo(x + (k * 23) % 56, y1); c.stroke(); } }
    if (ci === 1) { c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 2; c.beginPath(); c.moveTo(130, 430); c.lineTo(190, 470); c.lineTo(170, 520); c.moveTo(760, 440); c.lineTo(700, 490); c.lineTo(730, 548); c.stroke(); }
    c.fillStyle = T.paint;
    for (const s of [0, 1]) { c.save(); if (s) { c.translate(W, 0); c.scale(-1, 1); } c.beginPath(); c.moveTo(0, 428); c.lineTo(206, 436); c.lineTo(226, H); c.lineTo(0, H); c.fill(); c.strokeStyle = T.line; c.lineWidth = 3; c.stroke(); c.beginPath(); c.ellipse(206, 484, 22, 50, 0, -Math.PI / 2, Math.PI / 2); c.stroke(); c.restore(); }
    c.strokeStyle = T.line; c.lineWidth = 3;
    for (const x of [BL.HX[0] + BL.D3, BL.HX[1] - BL.D3]) { c.beginPath(); c.moveTo(x + (x < 500 ? 4 : -4), 418); c.lineTo(x + (x < 500 ? -6 : 6), H); c.stroke(); }
    c.beginPath(); c.moveTo(W / 2, 414); c.lineTo(W / 2, H); c.stroke();
    c.beginPath(); c.ellipse(W / 2, 486, 72, 26, 0, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(0, 414); c.lineTo(W, 414); c.stroke();
    blBgCache[key] = c0;
    return c0;
  }

  function blHoop(c, s, V, front) {
    const W = BL.W, ry = BL.RY, T = V.tt;
    c.save();
    if (s) { c.translate(W, 0); c.scale(-1, 1); }
    const sh = V.rim[s], jx = Math.sin(T * 60) * sh * 3, jy = Math.cos(T * 52) * sh * 2;
    if (!front) {
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(20, 506, 36, 9, 0, 0, TAU); c.fill();
      const pg = c.createLinearGradient(6, 0, 22, 0); pg.addColorStop(0, '#6c7588'); pg.addColorStop(.5, '#c6cddb'); pg.addColorStop(1, '#6c7588');
      c.fillStyle = pg; c.fillRect(7, 270, 13, 238);
      c.fillStyle = '#e8a41a'; pathRR(c, 0, 410, 28, 92, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, 410, 28, 6); c.fillRect(0, 456, 28, 4);
      c.save(); c.translate(jx * .5, jy * .5);
      c.fillStyle = '#8a93a6'; c.fillRect(18, ry - 12, 14, 8); c.fillRect(18, ry + 12, 14, 8);
      const bg = c.createLinearGradient(20, 0, 32, 0); bg.addColorStop(0, 'rgba(180,215,245,.95)'); bg.addColorStop(1, 'rgba(235,248,255,.95)');
      c.fillStyle = bg; pathRR(c, 20, ry - 126, 12, 150, 4); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(23, ry - 118, 3, 134);
      c.fillStyle = '#e8481c'; c.fillRect(31, ry - 6, 28, 9);
      c.restore();
      c.save(); c.translate(jx, jy);
      c.strokeStyle = '#a82d10'; c.lineWidth = 5; c.beginPath(); c.ellipse(92, ry, BL.RW, 7, 0, Math.PI, TAU); c.stroke();
      const amp = V.net[s], bx = 92 + Math.sin(T * 26) * amp * 10, by = ry + 46 + amp * 12;
      c.strokeStyle = 'rgba(255,255,255,.88)'; c.lineWidth = 1.7;
      c.beginPath();
      for (let i = 0; i <= 8; i++) {
        const u = i / 8, a = Math.PI + u * Math.PI, tx = 92 + Math.cos(a) * BL.RW, ty = ry + Math.sin(a) * 7;
        const ex = bx + Math.cos(a) * 17, ey = by + Math.sin(a) * 4;
        c.moveTo(tx, ty); c.quadraticCurveTo((tx + ex) / 2 + Math.sin(T * 30 + i) * amp * 5, (ty + ey) / 2, ex, ey);
      }
      for (let k = 1; k <= 3; k++) {
        const u = k / 4, cx = lerp(92, bx, u), cy = lerp(ry, by, u), rx = lerp(BL.RW, 17, u);
        c.moveTo(cx - rx, cy); c.quadraticCurveTo(cx, cy + 8 + amp * 3, cx + rx, cy);
      }
      c.stroke();
      c.restore();
    } else {
      c.translate(jx, jy);
      c.strokeStyle = '#ff6a2a'; c.lineWidth = 6; c.beginPath(); c.ellipse(92, ry, BL.RW, 7, 0, 0, Math.PI); c.stroke();
      c.strokeStyle = 'rgba(255,220,180,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(92, ry - 1, BL.RW - 2, 6, 0, .2, Math.PI - .2); c.stroke();
    }
    c.restore();
  }

  function blLimb(c, sx, sy, tx, ty, L, bend, col, w) {
    const dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1, m = Math.min(d, L * 2 - .5), a = Math.atan2(dy, dx), h = Math.sqrt(Math.max(0, L * L - m * m / 4));
    const hx = sx + Math.cos(a) * m, hy = sy + Math.sin(a) * m;
    const ex = sx + Math.cos(a) * m / 2 - Math.sin(a) * h * bend, ey = sy + Math.sin(a) * m / 2 + Math.cos(a) * h * bend;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
    return { x: hx, y: hy, ex, ey };
  }

  function blDrawPlayer(c, S, V, i, al, sh) {
    const p = S.pl[i], ch = BL_CH[p.ch], t = i & 1, b = S.ball, sc = blScale(p), f = p.face, seat = sh.get().seats[i];
    const x = lerp(p.px, p.x, al), y = lerp(p.py, p.y, al), bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al);
    const air = clamp((BL.GY - y) / 110, 0, 1), skin = hex(ch.sk, -.04), sleeve = ch.kit;
    const holder = b.h === i, ph = V.walk[i], mv = Math.abs(p.vx) > 40 && y >= BL.GY - 1 ? 1 : 0;
    const scoring = S.phase === 'score' && S.scoreTeam === t;
    const stum = p.stm > 0 && p.fz <= 0, swipe = p.stc > .5, dash = p.cr > 0;
    const celeb = scoring ? Math.abs(Math.sin(S.tt * 8 + i)) * 14 : 0;
    const ghost = p.sp > 0 && ch.sp === 'phase';
    c.fillStyle = `rgba(0,0,0,${.3 - air * .12})`; c.beginPath(); c.ellipse(x, BL.GY + 7, 34 * sc * (1 - air * .35), 8 * sc * (1 - air * .35), 0, 0, TAU); c.fill();
    if (p.sp > 0) {
      const col = BL_SPCOL[ch.sp], gl = c.createRadialGradient(x, y - 85 * sc, 10, x, y - 85 * sc, 120 * sc);
      gl.addColorStop(0, `rgba(${col},${.38 + .12 * Math.sin(S.tt * 10)})`); gl.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = gl; c.beginPath(); c.arc(x, y - 85 * sc, 120 * sc, 0, TAU); c.fill();
      if (ch.sp === 'turbo') { c.strokeStyle = `rgba(${col},.6)`; c.lineWidth = 3; for (let k = 0; k < 4; k++) { const yy = y - 30 - k * 28; c.beginPath(); c.moveTo(x - f * (30 + k * 6), yy); c.lineTo(x - f * (70 + k * 12 + (S.tt * 400 % 30)), yy); c.stroke(); } }
      if (ch.sp === 'lock') { c.strokeStyle = `rgba(${col},.7)`; c.lineWidth = 3; for (let k = 0; k < 2; k++) { c.beginPath(); c.ellipse(x, y - 150 * sc, 50 + k * 14 + Math.sin(S.tt * 8 + k) * 3, 12 + k * 3, 0, 0, TAU); c.stroke(); } }
    }
    c.save();
    if (ghost) c.globalAlpha = .6;
    c.translate(x, y - celeb); c.scale(f * sc, sc);
    if (stum) c.rotate(-.2 - Math.sin(S.tt * 25) * .04);
    else if (dash) c.rotate(.2);
    const hipY = -58, lx = (bx - x) * f / sc, ly = (by - y) / sc;
    let tuck = 0;
    if (air > .05 && !p.sh && p.dk < 0) tuck = 1;
    if (p.dk >= 0) tuck = 2;
    const sw = Math.sin(ph) * 20 * mv, lift = Math.cos(ph);
    let ff, bf;
    if (tuck === 2) { ff = [22, -36]; bf = [-14, -22]; }
    else if (tuck === 1) { ff = [16, -28]; bf = [-8, -14]; }
    else if (p.sh) { ff = [5, -6 * (1 - air)]; bf = [-5, -2]; }
    else if (stum) { ff = [20, 0]; bf = [-24, 0]; }
    else if (dash) { ff = [24, -4]; bf = [-28, -8]; }
    else { ff = [8 + sw, -Math.max(0, lift) * 9 * mv]; bf = [-6 - sw, -Math.max(0, -lift) * 9 * mv]; }
    const leg = (hx, f2, front) => {
      const q = blLimb(c, hx, hipY, f2[0], f2[1] - 6, 30, 1, skin, 12);
      c.strokeStyle = ch.shorts; c.lineWidth = 17; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hipY); c.lineTo(hx + (q.ex - hx) * .5, hipY + (q.ey - hipY) * .5); c.stroke();
      c.fillStyle = ch.shoe; c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(f2[0] + 6, f2[1] - 4, 15, 8, tuck ? .25 : 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(f2[0] - 8, f2[1] + 1, 28, 2);
    };
    let hf, hb;
    const handUp = [[16, -186], [4, -176]];
    const defend = !holder && b.h >= 0 && (b.h & 1) !== t && y >= BL.GY - 1 && Math.abs(S.pl[b.h].x - p.x) < 230;
    if (celeb > 0) { hf = [26, -176 + Math.sin(S.tt * 20) * 6]; hb = [-8, -172 + Math.cos(S.tt * 20) * 6]; }
    else if (p.dk >= 0) { hf = [lx, ly + 4]; hb = [2, -168]; }
    else if (p.sh && holder) { hf = [lx + 2, ly + 5]; hb = [lx - 4, ly + 4]; }
    else if (V.follow[i] > 0) { const k = V.follow[i] / .4; hf = [24 + (1 - k) * 4, -188 - k * 6 + (1 - k) * 10]; hb = [10, -176]; }
    else if (swipe) { hf = [92, -86 - (p.stc - .5) * 40]; hb = [-14, -96]; }
    else if (stum) { hf = [-18 + Math.sin(S.tt * 30) * 8, -120]; hb = [-30, -90 + Math.cos(S.tt * 30) * 10]; }
    else if (holder) { hf = [lx, clamp(ly - 12, -150, -48)]; hb = [-16 - sw * .4, -64]; }
    else if (air > .12) { hf = handUp[0]; hb = handUp[1]; }
    else if (defend) { hf = [34 + Math.sin(S.tt * 9) * 6, -112]; hb = [4 + Math.cos(S.tt * 9) * 6, -122]; }
    else { hf = [20 + Math.sin(ph) * 14 * mv, -62 + Math.abs(Math.cos(ph)) * 6 * mv]; hb = [-16 - Math.sin(ph) * 14 * mv, -64]; }
    const shy = -98;
    const armB = blLimb(c, -8, shy, hb[0], hb[1], 40, -1, hex(skin, -.1), 11);
    c.strokeStyle = hex(sleeve, -.25); c.lineWidth = 15; c.beginPath(); c.moveTo(-8, shy); c.lineTo(-8 + (armB.ex + 8) * .45, shy + (armB.ey - shy) * .45); c.stroke();
    c.fillStyle = hex(skin, -.1); c.beginPath(); c.arc(armB.x, armB.y, 7, 0, TAU); c.fill();
    leg(-6, bf, 0);
    c.fillStyle = ch.shorts; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2; pathRR(c, -22, -66, 44, 26, 8); c.fill(); c.stroke();
    c.fillStyle = ch.trim; c.fillRect(-21, -52, 42, 3);
    leg(8, ff, 1);
    c.fillStyle = ch.kit; c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; pathRR(c, -22, -114, 44, 56, 12); c.fill(); c.stroke();
    c.fillStyle = ch.trim; c.fillRect(-22, -64, 44, 5); pathRR(c, -9, -116, 18, 8, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-18, -108, 8, 40);
    c.save(); c.scale(f, 1); txt(c, String(ch.num), 0, -86, 22, ch.trim, 'center', 900, 'rgba(0,0,0,.4)'); c.restore();
    const dl = Math.hypot(lx - 2, ly + 132) || 1;
    const shout = p.sp > 0 && V.shout[i] > 0;
    drawHead(c, ch, 3, -134, 27, 1, { lx: (lx - 2) / dl, ly: (ly + 132) / dl, mood: stum ? 3 : p.sh || celeb || shout ? 1 + (celeb ? 1 : 0) : 0, mouth: stum ? 1 : shout ? .9 : celeb ? .8 : p.sh ? .3 : 0, blink: V.blink[i] });
    const armF = blLimb(c, 8, shy, hf[0], hf[1], 40, -1, skin, 12);
    c.strokeStyle = sleeve; c.lineWidth = 16; c.beginPath(); c.moveTo(8, shy); c.lineTo(8 + (armF.ex - 8) * .45, shy + (armF.ey - shy) * .45); c.stroke();
    c.fillStyle = skin; c.beginPath(); c.arc(armF.x, armF.y, 7.5, 0, TAU); c.fill();
    c.restore();
    if (p.fz > 0) {
      c.fillStyle = 'rgba(170,230,255,.5)'; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3;
      pathRR(c, x - 40, y - 172, 80, 178, 14); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 22, y - 150); c.lineTo(x - 6, y - 100); c.moveTo(x + 18, y - 70); c.lineTo(x + 28, y - 30); c.stroke();
    } else if (S.freeze[t] > 0) { c.fillStyle = 'rgba(150,220,255,.18)'; c.fillRect(x - 34, y - 166, 68, 170); }
    if (stum) for (let k = 0; k < 3; k++) { const a = S.tt * 8 + k * 2.1; txt(c, '*', x + Math.cos(a) * 30, y - 176 + Math.sin(a) * 7, 20, '#ffe14a', 'center', 900, 'rgba(0,0,0,.4)'); }
    if (p.sh && seat && seat.kind === 'human') blMeter(c, x, y - 190 * sc - 20, p.st);
    const me = sh.get().me;
    if (seat && seat.kind === 'human' && (i === me || sh.get().role === 'local' && i === me) && V.hint < 5 && S.phase !== 'over') {
      c.globalAlpha = Math.min(1, 5 - V.hint); const ty = y - 200 * sc - 8 - Math.sin(S.tt * 6) * 3;
      txt(c, 'YOU', x, ty - 14, 16, '#fff', 'center', 900, 'rgba(0,0,0,.6)'); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 7, ty - 4); c.lineTo(x + 7, ty - 4); c.lineTo(x, ty + 4); c.fill(); c.globalAlpha = 1;
    } else if (S.n > 2 && seat && seat.kind === 'human' && i === me) {
      const ty = y - 196 * sc - 6; c.fillStyle = ch.kit; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 7, ty - 8); c.lineTo(x + 7, ty - 8); c.lineTo(x, ty + 2); c.closePath(); c.fill(); c.stroke();
    }
  }
  function blMeter(c, x, y, st) {
    const w = 84, h = 10, mx = .52, x0 = x - w / 2;
    c.fillStyle = 'rgba(0,0,0,.6)'; pathRR(c, x0 - 2, y - 2, w + 4, h + 4, 6); c.fill();
    const z = (lo, hi, col) => { c.fillStyle = col; c.fillRect(x0 + lo / mx * w, y, (hi - lo) / mx * w, h); };
    z(0, mx, 'rgba(255,255,255,.14)'); z(BL.APEX - .11, BL.APEX + .11, 'rgba(255,120,60,.55)'); z(BL.APEX - .07, BL.APEX + .07, 'rgba(255,220,60,.8)'); z(BL.APEX - .035, BL.APEX + .035, '#47e26b');
    const cx = x0 + clamp(st / mx, 0, 1) * w; c.fillStyle = '#fff'; c.fillRect(cx - 1.5, y - 4, 3, h + 8);
  }

  function blDrawBall(c, S, V, al) {
    const b = S.ball, x = lerp(b.px, b.x, al), y = lerp(b.py, b.y, al), R = BL.BR;
    const h = clamp((BL.GY - y) / 300, 0, 1);
    c.fillStyle = `rgba(0,0,0,${.3 - h * .18})`; c.beginPath(); c.ellipse(x, BL.GY + 7, R * (1.05 - h * .4), R * .3, 0, 0, TAU); c.fill();
    if (b.glow > 0) {
      for (let i = V.trail.length - 1; i >= 0; i--) { const q = V.trail[i], a = i / V.trail.length; c.fillStyle = `rgba(255,${100 + a * 80 | 0},20,${a * .5})`; c.beginPath(); c.arc(q[0], q[1], R * (.4 + a * .7), 0, TAU); c.fill(); }
      const gl = c.createRadialGradient(x, y, R * .4, x, y, R * 2.6); gl.addColorStop(0, 'rgba(255,140,30,.75)'); gl.addColorStop(1, 'rgba(255,140,30,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y, R * 2.6, 0, TAU); c.fill();
    }
    drawBall(c, x, y, R, b.rot, 'bball');
  }

  function blVis() { return { parts: [], pops: [], net: [0, 0], rim: [0, 0], flash: 0, flashC: '255,255,255', walk: [0, 0, 0, 0], blink: [0, 0, 0, 0], bt: [2, 3, 4, 5], follow: [0, 0, 0, 0], shout: [0, 0, 0, 0], trail: [], hint: 0, tt: 0, dk: 0, crowd: 0, lastPhase: '' }; }
  function blBurst(V, x, y, n, col, sp, life, grav, s) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = rnd(.3, 1) * sp; V.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.5, 1) * life, l0: life, c: col, s: rnd(.6, 1) * s, g: grav }); }
  }
  const blPop = (V, x, y, tx, c, t, big) => V.pops.push({ x, y, t: t || 1.1, tx, c: c || '#fff', big });
  function blEvent(V, S, e, sh) {
    const k = e[0], b = S.ball, P = i => S.pl[i];
    if (k === 1) {
      const p = P(e[1]); sh.snd('shoot'); V.follow[e[1]] = .4;
      if (e[2] === 0) { blPop(V, p.x, p.y - 235, 'PERFECT!', '#47e26b'); blBurst(V, p.x + p.face * 20, p.y - 190, 10, '#9dffb4', 200, .5, 0, 3.5); }
      else if (e[2] >= 3) blPop(V, p.x, p.y - 235, e[4] < 0 ? 'EARLY' : 'LATE', '#ff7a5c', .8);
    } else if (k === 2) { sh.snd('swoosh'); }
    else if (k === 3) {
      const s = S.atk[e[1]] === BL.HX[0] ? 0 : 1, hx = BL.HX[s];
      V.net[s] = 1; V.rim[s] = e[4] ? 1 : .35; V.flash = e[4] ? .45 : .25; V.flashC = '255,255,255'; V.crowd = 1.5;
      sh.snd(e[4] ? 'dunk' : e[5] ? 'swish' : 'bucket'); sh.snd('cheer');
      blBurst(V, hx, BL.RY + 20, e[4] ? 34 : 18, '#ffe14a', e[4] ? 420 : 300, .9, 500, 4);
      for (let i = 0; i < 30; i++) V.parts.push({ x: rnd(0, BL.W), y: rnd(-30, 10), vx: rnd(-40, 40), vy: rnd(120, 260), life: 2, l0: 2, c: pick(['#ffd23f', '#ff5d73', '#4cc9f0', '#7ae582', '#fff']), s: rnd(3, 5), g: 0, sq: 1 });
      blPop(V, BL.W / 2, 175, e[4] ? 'SLAM DUNK!' : e[2] === 3 ? 'THREE POINTER!' : e[5] ? 'SWISH!' : 'BUCKET!', e[4] ? '#ff7a1a' : e[2] === 3 ? '#4cc9f0' : '#ffe14a', 1.5, 1);
    }
    else if (k === 4) { const p = P(e[1]); sh.snd('block'); V.flash = .2; V.flashC = '255,255,255'; blBurst(V, b.x, b.y, 16, '#fff', 300, .4, 200, 4); blPop(V, p.x, p.y - 230, 'BLOCKED!', '#ff5d73', 1.3, 1); S.shake = Math.max(S.shake, .25); }
    else if (k === 5) sh.snd('pass');
    else if (k === 6) { const p = P(e[1]); sh.snd('squeak'); blPop(V, p.x, p.y - 235, 'CROSSOVER!', '#4cc9f0', .9); blBurst(V, p.x, BL.GY, 8, 'rgba(255,255,255,.7)', 120, .4, 0, 3); }
    else if (k === 7) { const p = P(e[1]); sh.snd('squeak'); blBurst(V, p.x, BL.GY, 5, 'rgba(255,255,255,.6)', 100, .35, 0, 3); }
    else if (k === 8) sh.snd('swipe');
    else if (k === 9) { const p = P(e[1]); sh.snd('steal'); blPop(V, p.x, p.y - 235, 'STOLEN!', '#ffd23f', 1.1, 1); blBurst(V, p.x, p.y - 80, 10, '#ffd23f', 220, .4, 0, 3.5); }
    else if (k === 10) sh.snd('whistle');
    else if (k === 11) { sh.snd('buzzer'); const hu = sh.get().seats[sh.get().me]; sh.snd(e[1] === (sh.get().me & 1) ? 'win' : 'lose'); }
    else if (k === 12) { blPop(V, BL.W / 2, 200, e[1] > 4 ? 'OVERTIME' : 'QUARTER ' + e[1], '#fff', 1.5, 1); sh.snd('whistle'); }
    else if (k === 14) {
      const p = P(e[1]); if (e[2]) { const ch = BL_CH[p.ch]; sh.snd('sp_' + ch.sp); V.flash = .35; V.flashC = BL_SPCOL[ch.sp]; V.shout[e[1]] = 1.2; blBurst(V, p.x, p.y - 90, 26, 'rgb(' + BL_SPCOL[ch.sp] + ')', 380, .7, 0, 5); blPop(V, BL.W / 2, 175, ch.spName.toUpperCase() + '!', 'rgb(' + BL_SPCOL[ch.sp] + ')', 1.4, 1); }
    }
    else if (k === 15) sh.snd('jump');
    else if (k === 16) { const p = P(e[1]); sh.snd('land'); blBurst(V, p.x, BL.GY, 4, 'rgba(255,255,255,.55)', 90, .35, 0, 3); }
    else if (k === 17) { sh.snd('buzzer'); blPop(V, BL.W / 2, 200, 'SHOT CLOCK!', '#ff5d73', 1.4, 1); }
    else if (k === 18) { sh.snd('buzzer'); blPop(V, BL.W / 2, 200, e[1] > 4 ? 'FINAL' : 'END OF Q' + e[1], '#fff', 2, 1); }
    else if (k === 19) sh.snd('bounce', e[1]);
    else if (k === 20) sh.snd('board', e[1]);
    else if (k === 21) { sh.snd('rim', e[1]); const s = b.x < 500 ? 0 : 1; V.rim[s] = Math.max(V.rim[s], .6); }
    else if (k === 22) { const p = P(e[1]); sh.snd('steal'); blPop(V, p.x, p.y - 235, 'PICKED OFF!', '#ffd23f', 1.1, 1); }
    else if (k === 23) sh.snd('catch');
  }
  function blVisStep(V, S, dt, sh) {
    const b = S.ball;
    if (sh.get().role === 'guest') S.tt += dt;
    V.tt += dt; V.hint += dt;
    V.crowd = Math.max(0, V.crowd - dt * .6);
    if (V.flash > 0) V.flash -= dt;
    for (let s = 0; s < 2; s++) { V.net[s] = Math.max(0, V.net[s] - dt * .9); V.rim[s] = Math.max(0, V.rim[s] - dt * 2.2); }
    S.pl.forEach((p, i) => {
      V.walk[i] += Math.abs(p.vx) * dt * .04;
      V.bt[i] -= dt; if (V.bt[i] < 0) { V.blink[i] = 1; if (V.bt[i] < -.12) { V.blink[i] = 0; V.bt[i] = rnd(1.5, 4); } }
      if (V.follow[i] > 0) V.follow[i] -= dt;
      if (V.shout[i] > 0) V.shout[i] -= dt;
    });
    if (b.h >= 0 && S.pl[b.h] && !S.pl[b.h].sh && S.pl[b.h].dk < 0) {
      const k = Math.floor((b.ph - Math.PI / 2) / Math.PI);
      if (k > V.dk && S.phase !== 'score') sh.snd('dribble');
      V.dk = k;
    } else V.dk = -1;
    if (b.glow > 0) { V.trail.push([b.x, b.y]); if (V.trail.length > 12) V.trail.shift(); blBurst(V, b.x, b.y, 1, 'rgb(255,' + (100 + Math.random() * 120 | 0) + ',30)', 60, .45, -140, 5); }
    else if (V.trail.length) V.trail.shift();
    for (let i = V.parts.length - 1; i >= 0; i--) { const p = V.parts[i]; p.life -= dt; if (p.life <= 0) { V.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; if (p.y > BL.GY + 8 && p.g > 0) { p.y = BL.GY + 8; p.vy *= -.3; } }
    for (let i = V.pops.length - 1; i >= 0; i--) { V.pops[i].t -= dt; if (V.pops[i].t <= 0) V.pops.splice(i, 1); }
    if (S.phase !== V.lastPhase) { if (S.phase === 'ready') V.trail.length = 0; V.lastPhase = S.phase; }
  }

  function blRender(c, S, V, sh) {
    const al = sh.alpha == null ? 1 : sh.alpha, W = BL.W, H = BL.H;
    c.save();
    if (S.shake > 0) c.translate(rnd(-1, 1) * S.shake * 12, rnd(-1, 1) * S.shake * 8);
    c.drawImage(blBg(sh, S.cfg.court || 0), 0, 0, W, H);
    if (V.crowd > .05) { c.fillStyle = `rgba(255,255,255,${Math.min(.12, V.crowd * .08)})`; c.fillRect(0, 90, W, 320); }
    blHoop(c, 0, V, 0); blHoop(c, 1, V, 0);
    const order = S.pl.map((_, i) => i).sort((a, b2) => (S.pl[a].dk >= 0 ? 1 : 0) - (S.pl[b2].dk >= 0 ? 1 : 0));
    for (const i of order) blDrawPlayer(c, S, V, i, al, sh);
    blDrawBall(c, S, V, al);
    blHoop(c, 0, V, 1); blHoop(c, 1, V, 1);
    for (const p of V.parts) {
      const a = clamp(p.life / (p.l0 * .6), 0, 1); c.globalAlpha = a; c.fillStyle = p.c;
      if (p.sq) c.fillRect(p.x, p.y, p.s, p.s * .5); else { c.beginPath(); c.arc(p.x, p.y, p.s * (.4 + a * .6), 0, TAU); c.fill(); }
    }
    c.globalAlpha = 1;
    c.restore();
    if (V.flash > 0) { c.fillStyle = `rgba(${V.flashC},${Math.min(.45, V.flash)})`; c.fillRect(0, 0, W, H); }
    blHud(c, S, V, sh);
  }

  function blHud(c, S, V, sh) {
    const W = BL.W, cfg = S.cfg, seats = sh.get().seats;
    const tcol = [BL_CH[S.pl[0].ch].kit, BL_CH[S.pl[1].ch].kit], k = clamp(760 / (c.canvas.clientWidth || W), 1, 1.55);
    c.save(); c.translate(W / 2, 0); c.scale(k, k); c.translate(-W / 2, 0);
    c.fillStyle = 'rgba(8,12,28,.82)'; pathRR(c, W / 2 - 150, 8, 300, 62, 14); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 2; c.stroke();
    for (let t = 0; t < 2; t++) {
      const left = t === 0, x0 = W / 2 + (left ? -150 : 150);
      c.fillStyle = tcol[t]; pathRR(c, left ? x0 : x0 - 8, 8, 8, 62, 4); c.fill();
      txt(c, String(S.sc[t]), W / 2 + (left ? -100 : 100), 30, 40, '#fff', 'center', 900);
      txt(c, cfg.names[t], W / 2 + (left ? -100 : 100), 58, 12, 'rgba(255,255,255,.8)', 'center', 800);
      if (S.poss === t && S.phase !== 'over') { c.fillStyle = '#ffb347'; c.beginPath(); const px = W / 2 + (left ? -55 : 55); c.arc(px, 18, 5, 0, TAU); c.fill(); }
    }
    const secs = Math.max(0, Math.ceil(S.clock - .001)), ot = S.q > 4;
    txt(c, (ot ? 'OT' : 'Q' + S.q), W / 2, 20, 14, '#ffb347', 'center', 900);
    txt(c, Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), W / 2, 42, 22, S.clock < 10 ? '#ff6b6b' : '#fff', 'center', 900);
    const sc = Math.max(0, Math.ceil(S.sclock - .001)), warn = sc <= 5 && S.phase === 'play';
    c.fillStyle = warn ? `rgba(220,40,50,${.7 + .3 * Math.sin(S.tt * 14)})` : 'rgba(8,12,28,.82)'; pathRR(c, W / 2 - 24, 72, 48, 24, 8); c.fill();
    txt(c, String(sc), W / 2, 85, 16, '#fff', 'center', 900);
    c.restore();
    const chips = [[], []];
    S.pl.forEach((p, i) => chips[i & 1].push(i));
    chips.forEach((list, t) => {
      c.save(); c.translate(t ? W : 0, 0); c.scale(k, k); c.translate(t ? -W : 0, 0);
      list.forEach((i, k) => {
        const p = S.pl[i], ch = BL_CH[p.ch], left = t === 0, bx = left ? 10 : W - 190, by = 10 + k * 40, full = p.sb >= 100 && p.sp <= 0, nm = seats[i] && seats[i].kind === 'human' ? seats[i].name : ch.name;
        c.fillStyle = 'rgba(8,12,28,.72)'; pathRR(c, bx, by, 180, 34, 10); c.fill();
        c.fillStyle = ch.kit; pathRR(c, left ? bx : bx + 172, by, 8, 34, 4); c.fill();
        txt(c, nm.slice(0, 14), bx + (left ? 16 : 164), by + 11, 13, '#fff', left ? 'left' : 'right', 900);
        const w = 150, x1 = left ? bx + 16 : bx + 14;
        c.fillStyle = 'rgba(0,0,0,.55)'; pathRR(c, x1, by + 21, w, 8, 4); c.fill();
        if (p.sp > 0) { c.fillStyle = `rgb(${BL_SPCOL[ch.sp]})`; pathRR(c, x1, by + 21, Math.max(6, w * p.sp / BL_SPDUR[ch.sp]), 8, 4); c.fill(); }
        else if (p.sb > 2) { c.fillStyle = full ? `rgb(${BL_SPCOL[ch.sp]})` : '#ffb347'; pathRR(c, x1, by + 21, Math.max(6, w * p.sb / 100), 8, 4); c.fill(); }
        c.strokeStyle = full ? `rgba(255,255,255,${.6 + .4 * Math.sin(S.tt * 12)})` : 'rgba(255,255,255,.3)'; c.lineWidth = 1.5; pathRR(c, x1, by + 21, w, 8, 4); c.stroke();
        if (full) txt(c, ch.spName.toUpperCase() + ' READY', x1 + w / 2, by + 25.5, 8, '#101828', 'center', 900);
      });
      c.restore();
    });
    for (const q of V.pops) {
      const a = clamp(q.t * 2, 0, 1), k = q.big ? 1 + Math.max(0, q.t - 1) * .4 : 1;
      c.globalAlpha = a; txt(c, q.tx, q.x, q.y - (1.2 - q.t) * 18, (q.big ? 46 : 22) * k, q.c, 'center', 900, 'rgba(0,0,0,.65)'); c.globalAlpha = 1;
    }
    if (S.phase === 'ready') {
      const n = Math.ceil(S.pt - .5);
      if (S.tt < 3 && S.q === 1 && S.sc[0] + S.sc[1] === 0) txt(c, 'TIP OFF', W / 2, 150, 58, '#fff', 'center', 900, 'rgba(0,0,0,.55)');
      else if (n > 0 && S.pt > .5) txt(c, String(n), W / 2, 150, 66, '#fff', 'center', 900, 'rgba(0,0,0,.55)');
    }
    if (S.phase === 'qend') {
      c.fillStyle = 'rgba(8,12,28,.55)'; c.fillRect(0, 205, W, 100);
      txt(c, S.q > 4 ? 'FINAL' : S.q === 4 ? 'END OF REGULATION' : 'END OF QUARTER ' + S.q, W / 2, 240, 40, '#fff', 'center', 900);
      txt(c, S.sc[0] + '  -  ' + S.sc[1], W / 2, 280, 28, '#ffb347', 'center', 900);
    }
  }

  const blSnd = {
    dribble(sh) { sh.tone('sine', 120, 62, .08, .26); sh.noise('lowpass', 500, 200, 1, .05, .1); },
    bounce(sh, v) { v = clamp(v || .5, .2, 1); sh.tone('sine', 130, 55, .13, .5 * v); sh.noise('lowpass', 600, 200, 1, .06, .15 * v); },
    shoot(sh) { sh.noise('bandpass', 700, 1700, .8, .16, .07); },
    swoosh(sh) { sh.noise('bandpass', 500, 2400, .9, .35, .12); sh.tone('sawtooth', 150, 90, .3, .04); },
    swish(sh) { sh.noise('highpass', 3200, 2400, 1, .28, .14, .02); sh.tone('triangle', 1000, 700, .18, .04); },
    bucket(sh) { sh.noise('highpass', 3000, 2200, 1, .22, .1, .02); sh.tone('triangle', 800, 600, .15, .04); },
    dunk(sh) { sh.tone('sine', 100, 40, .55, .6); sh.noise('lowpass', 1200, 120, 1, .5, .45); sh.tone('triangle', 640, 380, .5, .18, .05); sh.tone('square', 1100, 700, .3, .04, .05); sh.noise('highpass', 3000, 2000, 1, .3, .12, .1); },
    rim(sh, v) { v = clamp(v || .5, .2, 1); sh.tone('triangle', 640, 410, .32, .26 * v); sh.tone('square', 1150, 760, .18, .04 * v); sh.noise('highpass', 3000, 3000, 1, .08, .06 * v); },
    board(sh, v) { v = clamp(v || .5, .2, 1); sh.tone('sine', 190, 120, .13, .42 * v); sh.noise('bandpass', 900, 500, 1, .08, .15 * v); },
    block(sh) { sh.noise('bandpass', 1500, 900, 1, .1, .32); sh.tone('square', 320, 140, .12, .06); },
    pass(sh) { sh.noise('bandpass', 1000, 1400, 1, .09, .08); },
    swipe(sh) { sh.noise('highpass', 2000, 800, .8, .1, .05); },
    steal(sh) { sh.tone('square', 520, 880, .1, .05); sh.tone('square', 880, 1320, .1, .05, .09); },
    catch(sh) { sh.noise('lowpass', 900, 400, 1, .05, .12); },
    squeak(sh) { sh.tone('sawtooth', 1700, 2300, .06, .025); sh.tone('sawtooth', 1900, 1500, .05, .02, .06); },
    jump(sh) { sh.tone('sine', 260, 440, .07, .035); },
    land(sh) { sh.noise('lowpass', 400, 150, 1, .06, .07); },
    sp_turbo(sh) { sh.noise('bandpass', 400, 3000, 1.5, .5, .25); sh.tone('sawtooth', 120, 600, .45, .08); },
    sp_fire(sh) { sh.noise('bandpass', 400, 1800, 1.2, .55, .3); sh.tone('sawtooth', 120, 400, .5, .09); },
    sp_giant(sh) { sh.tone('sine', 90, 40, .9, .5); sh.noise('lowpass', 400, 80, 1, .8, .35); },
    sp_lock(sh) { sh.tone('square', 220, 220, .3, .06); sh.tone('square', 330, 330, .3, .05, .12); sh.noise('highpass', 4000, 3000, 1, .2, .08); },
    sp_freeze(sh) { for (let i = 0; i < 6; i++) sh.tone('triangle', 2600 - i * 220, 1800 - i * 180, .22, .06, i * .035); sh.noise('highpass', 5000, 3000, 1, .3, .12); },
    sp_phase(sh) { sh.tone('sine', 500, 300, .9, .06); sh.tone('sine', 505, 310, .9, .06, .02); sh.noise('bandpass', 1200, 400, 3, .8, .09); },
    win(sh) { [523, 659, 784, 1047, 1319].forEach((f, i) => { sh.tone('square', f, f, .18, .045, i * .11); sh.tone('triangle', f / 2, f / 2, .22, .08, i * .11); }); }
  };

  const BL_PH = ['ready', 'play', 'score', 'qend', 'over'];
  const BL_PAD = [{ s: 'l', b: 1, t: '◀', c: 'mv' }, { s: 'l', b: 2, t: '▶', c: 'mv' }, { s: 'r', b: 8, t: 'SHOOT', c: 'big' }, { s: 'r', b: 4, t: 'JUMP', c: 'big' }, { s: 'r', b: 16, t: 'DASH', c: '' }, { s: 'r', b: 32, t: 'SPECIAL', c: 'gold' }, { s: 'r', b: 64, t: 'PASS', c: '' }];
  const blDots = v => { const n = Math.max(1, Math.min(5, Math.round((v - .75) * 11))); return '<i>' + '●'.repeat(n) + '<u>' + '●'.repeat(5 - n) + '</u></i>'; };
  const blOthers = (n, used) => { const out = [], pool = hsShuffle(BL_CH.map((_, i) => i).filter(i => !used.includes(i))); while (out.length < n) out.push(pool.pop()); return out; };

  function blPlan(sh, mode, lvl, extra) {
    const o = sh.opt, two = mode === 'v2', n = two ? 4 : 2, me = o.char;
    const rest = blOthers(n - 1, [me]);
    const chars = two ? [me, rest[0], rest[1], rest[2]] : [me, rest[0]];
    const seats = [{ kind: 'human', name: 'You', local: true }, { kind: 'cpu', name: BL_CH[chars[1]].name, lvl }];
    if (two) seats.push({ kind: 'cpu', name: BL_CH[chars[2]].name, lvl }, { kind: 'cpu', name: BL_CH[chars[3]].name, lvl });
    const names = two ? ['You & ' + BL_CH[chars[2]].name, BL_CH[chars[1]].name + ' & ' + BL_CH[chars[3]].name] : ['You', BL_CH[chars[1]].name];
    return { cfg: { n, chars, qlen: o.qlen, court: (extra && extra.court != null) ? extra.court : o.court, names, humanTeam: 0, lvl }, seats, meta: Object.assign({ mode, lvl }, extra || {}) };
  }
  const blLadderPlan = (sh, run) => blPlan(sh, 'ladder', [0, 1, 2, 3][Math.min(3, run.idx)], { run, court: (sh.opt.court + run.idx) % BL_COURTS.length });
  const blNewLadder = sh => blLadderPlan(sh, { idx: 0, pts: 0, cont: 0 });

  function blOver(sh, S, plan, seats, me) {
    const m = plan.meta || {}, myT = me & 1, won = S.win === myT, sc = S.sc, online = plan.online, diff = sc[myT] - sc[1 - myT];
    const line = `<p class="hs-op">${esc(S.cfg.names[0])} ${sc[0]} : ${sc[1]} ${esc(S.cfg.names[1])}${S.q > 4 ? ' (OT)' : ''}</p>`;
    const th = 'style="padding:0 .9em;opacity:.65;font-weight:700"', td = 'style="padding:0 .9em;font-weight:800"';
    const cols = S.q > 4 ? 5 : 4;
    const qrow = t => `<tr><td style="text-align:left;padding:0 .9em 0 0;font-weight:800">${esc(S.cfg.names[t])}</td>${S.qs[t].slice(0, cols).map(v => `<td ${td}>${v}</td>`).join('')}<td ${td}><b style="color:var(--ac)">${sc[t]}</b></td></tr>`;
    const prow = (p, i) => { const nm = seats[i] && seats[i].kind === 'human' ? seats[i].name : BL_CH[p.ch].name; return `<tr><td style="text-align:left;padding:0 .9em 0 0;font-weight:800;color:${i & 1 ? '#ffd0d0' : '#d0e6ff'}">${esc(String(nm).slice(0, 14))}</td><td ${td}>${p.pts}</td><td ${td}>${p.stl}</td><td ${td}>${p.blk}</td></tr>`; };
    const box = `<div style="display:flex;gap:2.4cqw;justify-content:center;flex-wrap:wrap;margin:.6cqw 0 1.2cqw;font-size:clamp(9px,1.7cqw,13px)"><table style="border-collapse:collapse;text-align:center"><tr><td></td>${Array.from({ length: cols }, (_, i) => `<td ${th}>${i < 4 ? 'Q' + (i + 1) : 'OT'}</td>`).join('')}<td ${th}>T</td></tr>${qrow(0)}${qrow(1)}</table><table style="border-collapse:collapse;text-align:center"><tr><td></td><td ${th}>PTS</td><td ${th}>STL</td><td ${th}>BLK</td></tr>${S.pl.map(prow).join('')}</table></div>`;
    const head = t => `<div class="hs-oc"><h3 class="hs-oh">${t}</h3>${line}${box}`;
    if (online) return head(won ? 'You win!' : esc(S.cfg.names[S.win]) + ' win') + `<div class="hs-ob">${sh.endButtons()}</div></div>`;
    if (m.mode === 'ladder') {
      const run = m.run;
      if (won) {
        const gain = 100 * (run.idx + 1) + diff * 10;
        run.pts += gain; run.won = 1; sh.snd('win');
        if (run.idx >= 3) {
          const total = Math.max(0, run.pts - run.cont * 120);
          sh.api.submit(total);
          return head('League champion!') + `<p class="hs-op">You beat all four levels.</p>${sh.stats([['Score', total], ['Continues', run.cont]])}<div class="hs-ob">${sh.btn('rematch', 'New run')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
        }
        return head('Victory!') + `<p class="hs-op">+${gain} points. Next: ${BL_LV[run.idx + 1].n} (${run.idx + 2} of 4).</p><div class="hs-ob">${sh.btn('rematch', 'Next game')}${sh.btn('menu', 'Menu', 'alt')}</div></div>`;
      }
      run.won = 0; run.cont++;
      return head('Defeated') + `<p class="hs-op">Continue costs 120 points off your final score.</p><div class="hs-ob">${sh.btn('rematch', 'Continue')}${sh.btn('menu', 'Quit', 'alt')}</div></div>`;
    }
    if (won) sh.api.submit(Math.max(1, (m.lvl + 1) * 100 + diff * 8 + (S.n > 2 ? 40 : 0)));
    return head(won ? 'You win!' : 'You lose') + `<div class="hs-ob">${sh.endButtons()}</div></div>`;
  }

  function blMenu(sh) {
    const o = sh.opt, ch = BL_CH[o.char];
    return `<div class="hs-top"><div><h2 class="hs-logo">BASKETBALL <b>LEGENDS</b></h2><p class="hs-tag">Time your release, break ankles, hit the special when the bar fills. 1v1 or 2v2.</p></div></div>
<div class="hs-modes">
<button class="hs-mode" data-a="v1"><b>Quick game 1v1</b><span>One game against a CPU player at your chosen level.</span></button>
<button class="hs-mode" data-a="v2"><b>2v2 with a partner</b><span>You and a CPU partner against two CPU players. Pass with Q.</span></button>
<button class="hs-mode" data-a="ladder"><b>League ladder</b><span>Rookie, Pro, All-Star, Legend: win four games in a row.</span></button>
<button class="hs-mode" data-a="online"><b>Play online</b><span>1v1 or 2v2 with friends. Bots can fill empty seats.</span></button>
</div>
<p class="hs-sec" style="margin-top:8px">Choose your player</p>
<div class="hs-chars">${BL_CH.map((c, i) => `<button type="button" class="hs-char${i === o.char ? ' on' : ''}" data-opt="char" data-val="${i}"><canvas data-c="${i}" width="124" height="124"></canvas>${c.name}<small>${c.spName}</small></button>`).join('')}</div>
<div class="hs-info"><b>${ch.name}</b> · ${ch.spName}: ${ch.spText}<div style="margin-top:6px;display:flex;gap:14px;flex-wrap:wrap;font-size:12px"><span>Speed ${blDots(ch.spd)}</span><span>Shooting ${blDots(ch.sht)}</span><span>Defense ${blDots(ch.def)}</span><span>Dunk ${blDots(ch.dnk)}</span></div></div>
<style>.gm-basketball-legends .hs-info i{font-style:normal;letter-spacing:1px;color:var(--ac)}.gm-basketball-legends .hs-info u{text-decoration:none;opacity:.25;color:#fff}</style>
${sh.orow('CPU level', sh.chips('cpu', BL_LV.map((l, i) => [i, l.n])))}
${sh.orow('Quarter length', sh.chips('qlen', [[30, '30 s'], [45, '45 s'], [60, '60 s']]))}
${sh.orow('Court', sh.chips('court', BL_COURTS.map((s, i) => [i, s.name])))}
<p class="hs-help"><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> move, <kbd>↑</kbd> <kbd>W</kbd> or <kbd>Space</kbd> jump. Hold <kbd>X</kbd> to shoot and release in the green zone of the meter (or <kbd>X</kbd> near the hoop to dunk). With the ball <kbd>Z</kbd> dashes past a defender; without it, steals. <kbd>C</kbd> special when the bar is full, <kbd>Q</kbd> pass in 2v2. Controller: A jump, X shoot, Y dash, B special. On touch screens use the buttons.</p>`;
  }

  const BL_G = {
    id: 'basketball-legends', accent: '#ff8a1f', W: BL.W, H: BL.H, hz: 120, snapMs: 33, delay: 100,
    defaults: { char: 0, cpu: 1, qlen: 45, court: 0 },
    keymap: { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, ArrowUp: 4, KeyW: 4, Space: 4, KeyX: 8, KeyK: 8, KeyJ: 8, KeyZ: 16, KeyL: 16, KeyC: 32, KeyQ: 64, KeyE: 64 },
    pad: BL_PAD, sounds: blSnd, sndGap: { dribble: 70, bounce: 70, rim: 60, board: 60, squeak: 90, jump: 80, land: 90, pass: 80, swipe: 80, catch: 80, shoot: 100 },
    room: () => ({ title: 'Basketball Legends', sizes: [2, 4], defaultSize: 2, min: 2, max: 4, bots: true }),
    hello: sh => ({ c: sh.opt.char }),
    newSim: (cfg) => blNew(cfg), step: blStep, ai: blAI, makeVis: blVis, vis: blVisStep, event: blEvent, render: blRender,
    pack(S) {
      const b = S.ball, R = Math.round;
      const d = [BL_PH.indexOf(S.phase), S.sc[0], S.sc[1], S.q, R(S.clock * 10), R(S.sclock * 10), R(S.pt * 100), S.over, S.win, S.poss, S.atk[0], R(S.freeze[0] * 10), R(S.freeze[1] * 10), R(S.shake * 100), S.scoreTeam, S.n];
      for (let t = 0; t < 2; t++) for (let q = 0; q < 5; q++) d.push(S.qs[t][q]);
      d.push(R(b.vx), R(b.vy), b.h, R(b.ph * 100), b.shot, R(b.glow * 100), b.dunk, R(b.rot * 100), b.pts);
      const a = [b.x, b.y];
      for (const p of S.pl) {
        a.push(p.x, p.y);
        d.push(R(p.vx), R(p.vy), p.face, p.sh, R(p.st * 1000), p.dk < 0 ? -1 : R(p.dk * 1000), R(p.cr * 100), R(p.stm * 100), R(p.stc * 100), R(p.sp * 100), R(p.sb), R(p.fz * 100), p.pts, p.stl, p.blk);
      }
      return { a, d };
    },
    unpack(S, a, d) {
      const b = S.ball; let o = 0;
      S.phase = BL_PH[d[o++]] || 'play'; S.sc = [d[o++], d[o++]]; S.q = d[o++]; S.clock = d[o++] / 10; S.sclock = d[o++] / 10; S.pt = d[o++] / 100; S.over = d[o++]; S.win = d[o++]; S.poss = d[o++];
      const a0 = d[o++]; S.atk = [a0, a0 === BL.HX[0] ? BL.HX[1] : BL.HX[0]];
      S.freeze = [d[o++] / 10, d[o++] / 10]; S.shake = d[o++] / 100; S.scoreTeam = d[o++]; o++;
      for (let t = 0; t < 2; t++) for (let q = 0; q < 5; q++) S.qs[t][q] = d[o++];
      b.vx = d[o++]; b.vy = d[o++]; b.h = d[o++]; b.ph = d[o++] / 100; b.shot = d[o++]; b.glow = d[o++] / 100; b.dunk = d[o++]; b.rot = d[o++] / 100; b.pts = d[o++];
      b.px = b.x = a[0]; b.py = b.y = a[1];
      S.pl.forEach((p, i) => {
        p.px = p.x = a[2 + i * 2]; p.py = p.y = a[3 + i * 2];
        p.vx = d[o++]; p.vy = d[o++]; p.face = d[o++]; p.sh = d[o++]; p.st = d[o++] / 1000; const dk = d[o++]; p.dk = dk < 0 ? -1 : dk / 1000; p.dkd = 1; p.cr = d[o++] / 100; p.stm = d[o++] / 100; p.stc = d[o++] / 100; p.sp = d[o++] / 100; p.sb = d[o++]; p.fz = d[o++] / 100; p.pts = d[o++]; p.stl = d[o++]; p.blk = d[o++];
      });
    },
    result: S => S.over,
    scoreText: S => S.sc[0] + ' : ' + S.sc[1],
    resumeInfo: S => `Saved game: ${S.sc[0]} : ${S.sc[1]}, ${S.q > 4 ? 'overtime' : 'quarter ' + S.q}.`,
    onlinePlan(sh, r) {
      const n = (r.bots ? r.size : r.players.length) > 2 ? 4 : 2;
      const used = [sh.opt.char], chars = [sh.opt.char];
      for (let i = 1; i < n; i++) {
        const p = r.players[i];
        let c = p && sh.picks[p.id] && typeof sh.picks[p.id].c === 'number' ? sh.picks[p.id].c : -1;
        if (c < 0 || c >= BL_CH.length || used.includes(c)) c = blOthers(1, used)[0];
        used.push(c); chars.push(c);
      }
      const seats = [];
      for (let i = 0; i < n; i++) { const p = r.players[i]; seats.push(p ? { kind: 'human', name: p.name, id: p.id } : { kind: 'cpu', name: BL_CH[chars[i]].name + ' (bot)', lvl: sh.opt.cpu }); }
      const tn = t => n === 2 ? seats[t].name : seats[t].name + ' & ' + seats[t + 2].name;
      return { cfg: { n, chars, qlen: sh.opt.qlen, court: sh.opt.court, names: [tn(0), tn(1)], humanTeam: null, lvl: sh.opt.cpu }, seats, meta: { mode: 'online' } };
    },
    rematchPlan(sh, plan, S) {
      const m = plan.meta || {};
      if (m.mode === 'ladder') {
        const run = m.run;
        if (run.won) { if (run.idx >= 3) return blNewLadder(sh); run.idx++; run.won = 0; }
        return blLadderPlan(sh, run);
      }
      if (m.mode === 'v1' || m.mode === 'v2') return blPlan(sh, m.mode, sh.opt.cpu);
      return Object.assign({}, plan, { seats: plan.seats.map(s => Object.assign({}, s)) });
    },
    begin(sh, S, V, resumed) { if (resumed) { S.phase = 'ready'; S.pt = 1.6; } },
    overHtml: blOver,
    menu: blMenu,
    menuDone(sh, el) { el.querySelectorAll('canvas[data-c]').forEach(cv => drawCharIcon(cv, BL_CH[+cv.dataset.c])); },
    act(sh, a) {
      if (a === 'v1') sh.begin(blPlan(sh, 'v1', sh.opt.cpu));
      else if (a === 'v2') sh.begin(blPlan(sh, 'v2', sh.opt.cpu));
      else if (a === 'ladder') sh.begin(blNewLadder(sh));
    },
    reg: {
      title: 'Basketball Legends', tint: '#ff8a1f',
      blurb: 'Big-headed street ballers: timing-meter shots, dunks, blocks, steals and crossover dashes. 1v1, 2v2, specials, four courts and online play.',
      help: '<kbd>←</kbd> <kbd>→</kbd> move · <kbd>↑</kbd>/<kbd>Space</kbd> jump · hold <kbd>X</kbd> shoot, release in the green · <kbd>Z</kbd> dash / steal · <kbd>C</kbd> special · <kbd>Q</kbd> pass · touch buttons · gamepad',
      width: 960, format: v => v + ' pts', better: 'high',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="38" r="14"/><path d="M18 38h28M32 24v28M22 28q10 10 0 20M42 28q-10 10 0 20"/><path d="M14 10h36M20 10v8M44 10v8"/></svg>'
    }
  };
  register(BL_G);
})();
