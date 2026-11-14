
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const sgn = v => v < 0 ? -1 : v > 0 ? 1 : 0;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = 'Nunito, system-ui, -apple-system, Segoe UI, sans-serif';
  const hex = (c, k) => {
    const n = parseInt(c.slice(1), 16);
    let r = n >> 16, g = n >> 8 & 255, b = n & 255;
    if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    r = r | 0; g = g | 0; b = b | 0;
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };
  const txt = (c, s, x, y, size, col, al = 'center', w = 900, stroke) => {
    c.font = `${w} ${size}px ${FONT}`; c.textAlign = al; c.textBaseline = 'middle';
    if (stroke) { c.lineWidth = Math.max(2, size * .16); c.lineJoin = 'round'; c.strokeStyle = stroke; c.strokeText(s, x, y); }
    c.fillStyle = col; c.fillText(s, x, y);
  };
  const TXQ = new Map();
  let TXU = 0;
  const txtImg = (s, size, col, w, stroke, d) => {
    const k = s + '|' + size + '|' + col + '|' + w + '|' + (stroke || '') + '|' + d;
    let e = TXQ.get(k);
    if (e) { e.u = ++TXU; return e; }
    if (TXQ.size > 260) { const all = [...TXQ.entries()].sort((a, b) => a[1].u - b[1].u); for (let i = 0; i < 120; i++) TXQ.delete(all[i][0]); }
    const c = document.createElement('canvas'), x = c.getContext('2d');
    x.font = `${w} ${size}px ${FONT}`;
    const pad = Math.ceil(size * .3) + 2, cw = Math.ceil(x.measureText(s).width + pad * 2), ch = Math.ceil(size * 1.6 + pad);
    c.width = Math.max(1, Math.ceil(cw * d)); c.height = Math.max(1, Math.ceil(ch * d));
    x.scale(d, d); txt(x, s, pad, ch / 2, size, col, 'left', w, stroke);
    e = { c, w: cw, h: ch, pad, u: ++TXU };
    TXQ.set(k, e);
    return e;
  };
  const txtC = (c, s, x, y, size, col, al = 'center', w = 900, stroke, d = 1, sc = 1) => {
    const e = txtImg(s, size, col, w, stroke, d), dw = e.w * sc, dh = e.h * sc;
    c.drawImage(e.c, al === 'left' ? x - e.pad * sc : al === 'right' ? x - (e.w - e.pad) * sc : x - dw / 2, y - dh / 2, dw, dh);
  };
  const T = (s, o) => window.gpI18n ? window.gpI18n.t(s, o) : o ? s.replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : s;
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const gpRng = seed => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  function gpStar(c, x, y, r, on, glow) {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
    c.fillStyle = on ? '#ffd23a' : 'rgba(255,255,255,.18)'; c.fill();
    c.lineWidth = Math.max(1.5, r * .14); c.strokeStyle = on ? '#b07a00' : 'rgba(0,0,0,.25)'; c.stroke();
    if (on && glow) { c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x - r * .2, y - r * .25, r * .18, 0, TAU); c.fill(); }
  }

  const sxCss = (id, ac) => {
    const q = '.gm-' + id;
    return `
${q}{--ac:${ac};align-items:stretch;gap:12px;font-family:${FONT}}
${q} *{box-sizing:border-box}
${q} .gx-menu{position:relative;width:100%;max-width:980px;margin:0 auto;border-radius:16px;padding:clamp(12px,1.8vw,20px);color:#eaf0ff;background:radial-gradient(1200px 500px at 20% -10%,color-mix(in srgb,var(--ac) 38%,#0e1630),#0b1226 60%);box-shadow:0 16px 40px -22px rgba(5,10,30,.9);user-select:none}
${q} .gx-menu[hidden],${q} .gx-play[hidden],${q} .gx-ov[hidden]{display:none}
${q} .gx-logo{font:900 clamp(30px,5.4vw,52px)/1 ${FONT};letter-spacing:-.03em;margin:0;text-shadow:0 3px 0 rgba(0,0,0,.35)}
${q} .gx-logo b{color:var(--ac);font-weight:900}
${q} .gx-tag{margin:4px 0 10px;font-weight:700;opacity:.78;font-size:clamp(12px,1.6vw,15px)}
${q} .gx-sec{margin:10px 0 5px;font:900 11px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;opacity:.65}
${q} .gx-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${q} .gx-chip{appearance:none;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#eaf0ff;border-radius:999px;padding:8px 14px;font:800 13px/1 ${FONT};cursor:pointer;transition:transform .15s,background .15s,border-color .15s;min-height:36px}
${q} .gx-chip:hover{background:rgba(255,255,255,.16)}
${q} .gx-chip.on{background:var(--ac);border-color:var(--ac);color:#fff;box-shadow:0 6px 16px -8px var(--ac)}
${q} .gx-chip:disabled{opacity:.35;pointer-events:none}
${q} .gx-go{appearance:none;border:0;border-radius:14px;padding:14px 22px;font:900 clamp(14px,2vw,17px)/1 ${FONT};color:#fff;background:var(--ac);cursor:pointer;box-shadow:0 8px 0 color-mix(in srgb,var(--ac) 55%,#000),0 14px 24px -10px rgba(0,0,0,.6);transition:transform .12s,box-shadow .12s;min-height:48px}
${q} .gx-go:hover{transform:translateY(-2px)}
${q} .gx-go:active{transform:translateY(5px);box-shadow:0 3px 0 color-mix(in srgb,var(--ac) 55%,#000)}
${q} .gx-go.alt{background:#2c3a66;box-shadow:0 8px 0 #18213f,0 14px 24px -10px rgba(0,0,0,.6)}
${q} .gx-go.sm{padding:10px 16px;font-size:14px;min-height:40px;box-shadow:0 5px 0 color-mix(in srgb,var(--ac) 55%,#000)}
${q} .gx-go.alt.sm{box-shadow:0 5px 0 #18213f}
${q} .gx-go:disabled{opacity:.4;pointer-events:none}
${q} .gx-modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:8px;margin-top:4px}
${q} .gx-mode{appearance:none;text-align:left;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf0ff;border-radius:12px;padding:10px 12px;cursor:pointer;font-family:${FONT};transition:transform .15s,border-color .15s,background .15s}
${q} .gx-mode:hover{transform:translateY(-2px);background:rgba(255,255,255,.12);border-color:var(--ac)}
${q} .gx-mode b{display:block;font-size:15px;font-weight:900;margin-bottom:3px}
${q} .gx-mode span{display:block;font-size:11px;font-weight:600;opacity:.75;line-height:1.35}
${q} .gx-orow{display:flex;align-items:center;gap:10px;margin:5px 0;flex-wrap:wrap}
${q} .gx-orow .gx-sec{margin:0;min-width:112px}
${q} .gx-orow .gx-row{gap:6px}
${q} .gx-orow .gx-chip{padding:6px 11px;min-height:30px;font-size:12px}
${q} .gx-info{margin-top:8px;padding:8px 12px;border-radius:12px;background:rgba(0,0,0,.28);font-size:13px;font-weight:600;line-height:1.45}
${q} .gx-info b{color:var(--ac)}
${q} .gx-help{margin:14px 0 0;font-size:12px;font-weight:600;opacity:.7;line-height:1.7}
${q} .gx-help kbd{background:rgba(255,255,255,.14);border-radius:5px;padding:1px 6px;font:800 11px ${FONT};color:#eaf0ff}
${q} .gx-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
${q} .gx-play{position:relative;width:100%}
${q} .gx-stage{position:relative;margin:0 auto;container-type:inline-size;border-radius:14px;overflow:hidden;background:#000;line-height:0}
${q} .gx-stage canvas{width:100%!important;border-radius:0;touch-action:none;-webkit-touch-callout:none;display:block}
${q} .gx-ov{position:absolute;inset:0;z-index:3;display:grid;place-items:center;padding:3cqw;background:rgba(6,10,26,.72);backdrop-filter:blur(4px);color:#eaf0ff;line-height:1.3;overflow:auto}
${q} .gx-oc{width:min(100%,560px);text-align:center;padding:2.4cqw 3cqw}
${q} .gx-oh{margin:0 0 1.2cqw;font:900 clamp(20px,5.2cqw,44px)/1.05 ${FONT};letter-spacing:-.02em}
${q} .gx-op{margin:0 0 2cqw;font-weight:700;font-size:clamp(11px,2cqw,16px);opacity:.88}
${q} .gx-ob{display:flex;flex-wrap:wrap;gap:1.4cqw;justify-content:center;margin-top:1.6cqw}
${q} .gx-ob .gx-go{padding:clamp(8px,1.6cqw,14px) clamp(12px,2.4cqw,22px);min-height:0;font-size:clamp(11px,2cqw,16px)}
${q} .gx-stat{display:flex;gap:2cqw;justify-content:center;margin:0 0 2cqw;flex-wrap:wrap}
${q} .gx-stat div{background:rgba(255,255,255,.1);border-radius:10px;padding:.9cqw 2cqw;min-width:11cqw}
${q} .gx-stat span{display:block;font:900 clamp(8px,1.4cqw,11px) ${FONT};letter-spacing:.1em;text-transform:uppercase;opacity:.65}
${q} .gx-stat b{font:900 clamp(14px,3.2cqw,26px) ${FONT}}
${q} .gx-pad{display:none;justify-content:space-between;align-items:flex-end;gap:10px;padding:10px 4px 2px;touch-action:none;user-select:none;-webkit-user-select:none}
${q} .gx-pad.on{display:flex}
${q} .gx-pg{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
${q} .gx-pg.r{justify-content:flex-end}
${q} .gx-pb{width:clamp(54px,17vw,78px);height:clamp(54px,17vw,78px);border-radius:50%;border:3px solid rgba(255,255,255,.55);background:color-mix(in srgb,var(--ac) 55%,#14204a);color:#fff;font:900 clamp(11px,3.3vw,15px)/1.1 ${FONT};display:grid;place-items:center;text-align:center;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:0 5px 0 rgba(0,0,0,.35);user-select:none;-webkit-user-select:none}
${q} .gx-pb.mv{border-radius:22px;width:clamp(62px,19vw,92px);background:#27386b}
${q} .gx-pb.on{filter:brightness(1.5);transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
${q} .gx-pb.big{width:clamp(66px,21vw,96px);height:clamp(66px,21vw,96px)}
${q} .gx-pb.gold{background:#c78a07}
@media (max-width:640px){${q} .gx-menu{padding:12px}${q} .gx-chip{padding:7px 11px;font-size:12px}}
`;
  };

  function makeAudio(api) {
    let ac = null, mg = null, nb = null;
    const A = {};
    A.ctx = () => {
      if (api.muted) return null;
      if (!ac) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { ac = new C(); } catch (e) { return null; }
        mg = ac.createGain(); mg.gain.value = .55; mg.connect(ac.destination);
        nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    A.tone = (type, f0, f1, dur, vol, at = 0) => {
      const a = A.ctx(); if (!a || vol <= 0) return;
      const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(mg); o.start(t); o.stop(t + dur + .03);
    };
    A.noise = (ft, f0, f1, q, dur, vol, at = 0, att = .005) => {
      const a = A.ctx(); if (!a || vol <= 0) return;
      const t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nb; s.loop = true; f.type = ft; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(mg); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    };
    const gate = {};
    A.play = (name, gap = 0) => {
      const f = A.bank && A.bank[name];
      if (!f || api.muted) return;
      const now = performance.now();
      if (now < (gate[name] || 0)) return;
      gate[name] = now + gap;
      try { f(A); } catch (e) {}
    };
    A.destroy = () => { try { if (ac) ac.close(); } catch (e) {} ac = null; };
    return A;
  }

  function makeStage(root, api, id, W, H, padDefs) {
    root.innerHTML = '<div class="gx-menu" data-i18n></div><div class="gx-play" data-i18n hidden><div class="gx-stage"><div class="gx-ov" hidden></div></div><div class="gx-pad"></div></div>';
    const menuEl = root.children[0], playEl = root.children[1], stage = playEl.children[0], ovEl = stage.children[0], padEl = playEl.children[1];
    const cv = api.canvas(W, H, stage);
    stage.prepend(cv.canvas);
    stage.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
    const st = { root, api, W, H, cv, ctx: cv.ctx, canvas: cv.canvas, menuEl, playEl, stage, ovEl, padEl, mask: 0, touch: matchMedia('(pointer: coarse)').matches, onAct: null, onOpt: null };
    st.showMenu = html => { st.hideOv(); menuEl.hidden = false; playEl.hidden = true; if (html != null) menuEl.innerHTML = html; };
    st.showPlay = () => { menuEl.hidden = true; playEl.hidden = false; };
    st.ov = html => { ovEl.innerHTML = html; ovEl.hidden = false; };
    st.hideOv = () => { ovEl.hidden = true; ovEl.innerHTML = ''; };
    st.btn = (a, text, cls = '', data = '') => `<button type="button" class="gx-go ${cls}" data-a="${a}" ${data}>${text}</button>`;
    st.card = (title, text, btns, extra = '') => st.ov(`<div class="gx-oc"><h3 class="gx-oh">${title}</h3>${text ? `<p class="gx-op">${text}</p>` : ''}${extra}<div class="gx-ob">${btns}</div></div>`);
    st.stats = list => `<div class="gx-stat">${list.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
    st.orow = (label, html) => `<div class="gx-orow"><span class="gx-sec">${label}</span>${html}</div>`;
    st.chips = (key, list, cur) => `<div class="gx-row">${list.map(([v, l]) => `<button type="button" class="gx-chip${JSON.stringify(v) === JSON.stringify(cur) ? ' on' : ''}" data-opt="${key}" data-val="${esc(JSON.stringify(v))}">${l}</button>`).join('')}</div>`;
    st.click = () => { const A = st.audio; if (A && A.bank && A.bank.click) A.play('click'); };
    const click = e => {
      const o = e.target.closest('[data-opt]');
      if (o && menuEl.contains(o)) { if (st.onOpt) st.onOpt(o.dataset.opt, JSON.parse(o.dataset.val)); return; }
      const a = e.target.closest('[data-a]');
      if (a && !a.disabled && st.onAct) { st.click(); st.onAct(a.dataset.a, Object.assign({}, a.dataset)); }
    };
    menuEl.addEventListener('click', click);
    ovEl.addEventListener('click', click);
    if (padDefs) {
      const side = s => padDefs.filter(b => b.s === s).map(b => `<button type="button" class="gx-pb ${b.c || ''}" data-b="${b.b}">${b.t}</button>`).join('');
      padEl.innerHTML = `<div class="gx-pg l">${side('l')}</div><div class="gx-pg r">${side('r')}</div>`;
      const ptr = new Map();
      const recompute = () => { let m = 0; for (const b of ptr.values()) m |= b; st.mask = m; padEl.querySelectorAll('[data-b]').forEach(el => el.classList.toggle('on', !!(m & +el.dataset.b))); };
      const sync = () => padEl.classList.toggle('on', st.touch);
      st.syncPad = sync; sync();
      padEl.addEventListener('pointerdown', e => {
        const b = e.target.closest('[data-b]'); if (!b) return;
        e.preventDefault(); st.touch = true; if (st.audio) st.audio.ctx();
        ptr.set(e.pointerId, +b.dataset.b); recompute();
        if (st.onPad) st.onPad(+b.dataset.b, true);
      });
      api.on(window, 'pointermove', e => {
        if (!ptr.has(e.pointerId)) return;
        const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('.gx-pad [data-b]');
        const nb = b ? +b.dataset.b : 0;
        if (nb && ptr.get(e.pointerId) !== nb) { ptr.set(e.pointerId, nb); recompute(); if (st.onPad) st.onPad(nb, true); }
      });
      const up = e => { if (ptr.delete(e.pointerId)) recompute(); };
      api.on(window, 'pointerup', up); api.on(window, 'pointercancel', up);
      api.on(window, 'pointerdown', e => { if (e.pointerType === 'touch' && !st.touch) { st.touch = true; sync(); } }, { capture: true });
      api.on(window, 'blur', () => { ptr.clear(); recompute(); });
    }
    return st;
  }

  {

    const RW = 960, RH = 540, GR = 1050, STEP = 1 / 60, VMIN = 340, VMAX = 1180;
    const TYPES = ['normal', 'fire', 'ice', 'bomb', 'triple', 'lightning'];
    const TNAME = { normal: 'Arrow', fire: 'Fire', ice: 'Ice', bomb: 'Bomb', triple: 'Triple', lightning: 'Storm' };
    const TCOL = { normal: '#efe6cf', fire: '#ff7a1a', ice: '#8fe3ff', bomb: '#5b5b66', triple: '#ffd447', lightning: '#c9a6ff' };
    const TXC = { normal: 0, fire: 7, ice: 7, bomb: 14, triple: 11, lightning: 11 };
    const TDMG = { normal: 22, fire: 17, ice: 13, bomb: 0, triple: 15.5, lightning: 20 };
    const ZM = { head: 2, body: 1, leg: .55, arm: .5 };
    const IH = 0, IN = 1, IP = 2, IEF = 3, IHF = 4, IEB = 5, IHB = 6, IKF = 7, IFF = 8, IKB = 9, IFB = 10;
    const BONES = [[IH, IN, 14], [IN, IP, 30], [IN, IEF, 15], [IEF, IHF, 15], [IN, IEB, 15], [IEB, IHB, 15], [IP, IKF, 20], [IKF, IFF, 20], [IP, IKB, 20], [IKB, IFB, 20], [IN, IKF, 52], [IN, IKB, 52]];
    const CAPS = [[IH, IH, 11.5, 'head'], [IH, IN, 5, 'body'], [IN, IP, 8.5, 'body'], [IP, IKF, 6, 'leg'], [IKF, IFF, 5, 'leg'], [IP, IKB, 6, 'leg'], [IKB, IFB, 5, 'leg'], [IN, IEF, 4.5, 'arm'], [IEF, IHF, 4.5, 'arm'], [IN, IEB, 4.5, 'arm'], [IEB, IHB, 4.5, 'arm']];
    const PK = [.3, .5, .4, .35, .4, .35, .4, .5, .8, .5, .8];

    const ARENAS = [
      { id: 'canyon', name: 'Canyon', theme: 'day', sym: 1, solids: [[0, 372, 260, 168], [700, 372, 260, 168]], pl: [130, 372], en: [[800, 372], [720, 372], [890, 372]], pit: 1 },
      { id: 'cliffs', name: 'Sunset Cliffs', theme: 'sunset', sym: 0, solids: [[0, 330, 200, 210], [730, 410, 230, 130], [455, 290, 52, 250]], pl: [105, 330], en: [[850, 410], [780, 410], [915, 410]], pit: 1 },
      { id: 'dunes', name: 'Dunes', theme: 'desert', sym: 0, solids: [[0, 390, 290, 150], [290, 450, 370, 90], [660, 350, 300, 190]], pl: [135, 390], en: [[840, 350], [770, 350], [905, 350]], pit: 0 },
      { id: 'towers', name: 'Night Towers', theme: 'night', sym: 0, solids: [[30, 290, 160, 250], [740, 250, 200, 290], [580, 410, 110, 130]], pl: [110, 290], en: [[880, 250], [800, 250], [635, 410]], pit: 1 },
      { id: 'frost', name: 'Frozen Pass', theme: 'snow', sym: 1, solids: [[0, 365, 250, 175], [710, 365, 250, 175], [425, 240, 110, 36]], pl: [125, 365], en: [[815, 365], [745, 365], [900, 365]], pit: 1 },
      { id: 'ruins', name: 'Old Ruins', theme: 'ruins', sym: 1, solids: [[0, 405, 235, 135], [725, 405, 235, 135], [345, 320, 42, 220], [573, 320, 42, 220]], pl: [120, 405], en: [[835, 405], [765, 405], [905, 405]], pit: 1 }
    ];
    const THEMES = {
      day: { sky: ['#5db8ff', '#cdeeff'], far: '#8fb7d9', near: '#6fa0c2', top: '#5fbf4a', rock: ['#8a7a68', '#5c5045'], cloud: 1, sun: ['#fff6b8', 740, 90] },
      sunset: { sky: ['#2a1c5c', '#ff9a5c'], far: '#7a3b6e', near: '#522a5e', top: '#c98a3a', rock: ['#7a4a46', '#432630'], cloud: .7, sun: ['#ffd9a0', 480, 330] },
      desert: { sky: ['#f4b45a', '#ffeab8'], far: '#e0a45e', near: '#cc8a48', top: '#f1cf86', rock: ['#d7a55c', '#a87638'], cloud: .5, sun: ['#fffbe0', 200, 100] },
      night: { sky: ['#050a22', '#1f3466'], far: '#1c2750', near: '#131a3a', top: '#4a6a56', rock: ['#4a4f66', '#252840'], cloud: .35, stars: 1, sun: ['#e8efff', 760, 90] },
      snow: { sky: ['#8aa8cc', '#eef6ff'], far: '#b8cde6', near: '#9ab4d4', top: '#f4fbff', rock: ['#8a9bb4', '#586882'], cloud: .9, snow: 1, sun: ['#ffffff', 220, 90] },
      ruins: { sky: ['#3f8c66', '#c2e8b0'], far: '#5a9a74', near: '#3e7a58', top: '#4cb04a', rock: ['#9a9a88', '#62624f'], cloud: .8, sun: ['#fffbd0', 700, 80] }
    };

    const KINDS = {
      player: { hp: 100, sc: 1, col: '#16233f', band: '#3b82f6', hat: 'band', err: 0, cd: .35 },
      grunt: { hp: 46, hw: 7, sc: 1, col: '#2b1e22', band: '#e2453c', hat: 'band', err: 1, cd: 2.5, head: .35, name: 'Grunt' },
      hunter: { hp: 38, hw: 6, sc: 1, col: '#1c2b24', band: '#1fb67a', hat: 'hood', err: .65, cd: 1.9, head: .65, name: 'Hunter' },
      mage: { hp: 40, hw: 6, sc: 1, col: '#2a1f3a', band: '#a36bff', hat: 'wiz', err: .85, cd: 2.2, head: .5, name: 'Mage', sp: ['fire', 'ice', 'lightning'], spc: .6 },
      tank: { hp: 84, hw: 12, sc: 1.08, col: '#27292f', band: '#aab4c4', hat: 'helm', err: 1.05, cd: 2.9, head: .3, name: 'Tank', sp: ['bomb', 'fire'], spc: .32, helm: 1 },
      boss: { hp: 200, hw: 28, sc: 1.28, col: '#2c1a1a', band: '#ffc83d', hat: 'crown', err: .55, cd: 1.6, head: .6, name: 'Warlord', sp: ['triple', 'bomb', 'lightning', 'fire'], spc: .55, helm: 1 },
      duel: { hp: 100, sc: 1, col: '#2b1e22', band: '#e2453c', hat: 'band', err: 1, cd: .35 }
    };
    const DIFF = [{ n: 'Easy', hp: .8, dmg: .72, err: 1.45, cd: 1.3, learn: .45 }, { n: 'Normal', hp: 1, dmg: 1, err: 1, cd: 1, learn: .7 }, { n: 'Hard', hp: 1.25, dmg: 1.2, err: .7, cd: .8, learn: .9 }, { n: 'Hardest', hp: 1.25, dmg: 1.2, err: .34, werr: .58, cd: .8, learn: 1, hx: 1 }];

    const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
    function segDist(px, py, ax, ay, bx, by) {
      const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
      let t = l > 1e-6 ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = ax + dx * t, qy = ay + dy * t;
      return { d: Math.hypot(px - qx, py - qy), t };
    }
    const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };

    function newArcher(S, idx, team, kindKey, spawn, o) {
      const k = KINDS[kindKey] || KINDS.grunt;
      const sc = k.sc * 1.18;
      const a = {
        idx, team, kind: kindKey, name: o.name || k.name || 'Archer', sc, col: k.col, band: o.band || k.band, hat: k.hat, helm: k.helm ? 1 : 0,
        x: new Array(11).fill(0), y: new Array(11).fill(0), ox: new Array(11).fill(0), oy: new Array(11).fill(0),
        hp: o.hp, mhp: o.hp, st: o.st || 100, mst: o.st || 100, regen: o.regen || 30, face: team ? -1 : 1,
        ax: spawn[0], gy: spawn[1], stiff: 1, stag: 0, cd: 0, cdMax: o.cd == null ? k.cd : o.cd, draw: 0, aim: team ? Math.PI - .6 : -.6,
        alive: true, frozen: 0, burn: 0, stun: 0, flash: 0, spend: 0, rec: 0,
        ammo: Object.assign({ normal: 99 }, o.ammo || {}), sel: 'normal',
        dmgMul: o.dmgMul == null ? 1 : o.dmgMul, critMul: o.critMul == null ? 1 : o.critMul, armor: o.armor || 0,
        ctl: o.ctl || 'ai', lvl: o.lvl == null ? 1 : o.lvl, err: k.err * (o.errMul == null ? 1 : o.errMul), head: k.head || .4, sp: k.sp || null, spc: k.spc || 0,
        stk: [], cmd: { ang: team ? Math.PI - .6 : -.6, p: 0, draw: false, shot: null }, ai: { t: 1 + Math.random(), bias: [0, 0], last: null, plan: null, hx: o.hx || 0, learn: o.learn || 0 }, burnT: 0, dieT: 0, hot: 0
      };
      arPoseSnap(a);
      return a;
    }

    function arPose(a, out) {
      const f = a.face, s = a.sc, ax = a.ax, gy = a.gy, x = out.x, y = out.y;
      x[IFF] = ax + f * 11 * s; y[IFF] = gy;
      x[IFB] = ax - f * 11 * s; y[IFB] = gy;
      x[IKF] = ax + f * 12 * s; y[IKF] = gy - 21 * s;
      x[IKB] = ax - f * 9 * s; y[IKB] = gy - 21 * s;
      x[IP] = ax - f * 1.5 * s; y[IP] = gy - 42 * s;
      x[IN] = ax + f * 1.5 * s; y[IN] = gy - 71 * s;
      x[IH] = x[IN] + f * 1.5 * s; y[IH] = y[IN] - 14 * s;
      const sx = x[IN], sy = y[IN] + 3 * s, ca = Math.cos(a.aim), sa = Math.sin(a.aim);
      const px = sa * f, py = -ca * f;
      const dw = a.draw;
      x[IHF] = sx + ca * 26 * s; y[IHF] = sy + sa * 26 * s;
      x[IEF] = sx + ca * 13 * s - px * 3 * s; y[IEF] = sy + sa * 13 * s - py * 3 * s;
      const bk = 24 - dw * 30;
      x[IHB] = sx + ca * bk * s; y[IHB] = sy + sa * bk * s;
      x[IEB] = (sx + x[IHB]) / 2 + px * (4 + 7 * dw) * s; y[IEB] = (sy + y[IHB]) / 2 + py * (4 + 7 * dw) * s;
      return out;
    }
    function arPoseSnap(a) {
      arPose(a, a);
      for (let i = 0; i < 11; i++) { a.ox[i] = a.x[i]; a.oy[i] = a.y[i]; }
    }
    function arSupport(S, a) {
      let best = null;
      const fy = (a.y[IFF] + a.y[IFB]) / 2;
      for (const s of S.solids) {
        if (a.ax >= s[0] + 3 && a.ax <= s[0] + s[2] - 3 && s[1] >= fy - 36 && (best == null || s[1] < best)) best = s[1];
      }
      return best;
    }
    function arCollide(S, a) {
      for (let i = 0; i < 11; i++) {
        const r = i === IH ? 8 * a.sc : 3;
        for (const s of S.solids) {
          const l = s[0] - r, rr = s[0] + s[2] + r, t = s[1] - r, b = s[1] + s[3] + r;
          const px = a.x[i], py = a.y[i];
          if (px > l && px < rr && py > t && py < b) {
            const dl = px - l, dr = rr - px, dt = py - t, db = b - py, m = Math.min(dl, dr, dt, db);
            if (m === dt) { a.y[i] = t; a.ox[i] += (a.x[i] - a.ox[i]) * .38; a.hot = 1; }
            else if (m === dl) a.x[i] = l;
            else if (m === dr) a.x[i] = rr;
            else a.y[i] = b;
            if (m === dt) { if (a.oy[i] > a.y[i]) a.oy[i] = a.y[i]; }
            else if (m === dl || m === dr) a.ox[i] = a.x[i] + (a.ox[i] - a.x[i]) * .3;
          }
        }
      }
    }
    const tpose = { x: new Array(11).fill(0), y: new Array(11).fill(0) };
    function arStep(S, a, dt, emit) {
      if (a.dieT > 0) a.dieT += dt;
      a.flash = Math.max(0, a.flash - dt);
      a.rec = Math.max(0, a.rec - dt * 5);
      const alive = a.alive;
      let sup = arSupport(S, a);
      const frozen = a.frozen > 0, stunned = a.stun > 0;
      if (alive) {
        if (a.stag > 0) { a.stag -= dt; a.stiff = Math.min(a.stiff, .2); }
        else a.stiff = Math.min(1, a.stiff + dt * 1.5);
        if (sup == null) { a.stiff = Math.min(a.stiff, .05); a.stag = Math.max(a.stag, .1); }
        if (stunned) a.stiff = Math.min(a.stiff, .55);
      } else a.stiff = 0;
      if (sup != null) a.gy = sup;
      const cx = (a.x[IFF] + a.x[IFB]) / 2;
      if (alive && a.stiff < .75 && sup != null) a.ax += (cx - a.ax) * .2;
      if (alive && !frozen && Math.abs(Math.cos(a.aim)) > .05) a.face = Math.cos(a.aim) >= 0 ? 1 : -1;
      const g = GR * dt * dt;
      for (let i = 0; i < 11; i++) {
        const vx = (a.x[i] - a.ox[i]) * .992, vy = (a.y[i] - a.oy[i]) * .992;
        a.ox[i] = a.x[i]; a.oy[i] = a.y[i];
        a.x[i] += vx; a.y[i] += vy + g;
      }
      if (alive && a.stiff > .01 && !frozen) {
        arPose(a, tpose);
        const k = a.stiff;
        for (let i = 0; i < 11; i++) {
          const kk = PK[i] * k;
          a.x[i] += (tpose.x[i] - a.x[i]) * kk; a.y[i] += (tpose.y[i] - a.y[i]) * kk;
        }
      } else if (alive && frozen) {
        arPose(a, tpose);
        for (let i = 0; i < 11; i++) { a.x[i] += (tpose.x[i] - a.x[i]) * .5; a.y[i] += (tpose.y[i] - a.y[i]) * .5; a.ox[i] = a.x[i]; a.oy[i] = a.y[i]; }
      }
      if (stunned && alive) for (let i = 0; i < 11; i++) { a.ox[i] -= (Math.random() - .5) * 1.4; a.oy[i] -= (Math.random() - .5) * 1.4; }
      const s = a.sc;
      for (let it = 0; it < 5; it++) {
        for (const b of BONES) {
          const i = b[0], j = b[1], rest = b[2] * s;
          let dx = a.x[j] - a.x[i], dy = a.y[j] - a.y[i];
          const d = Math.hypot(dx, dy) || 1e-4;
          const diff = (d - rest) / d * (b[2] === 52 ? .06 : .5);
          if (b[2] === 52 && d > rest) continue;
          dx *= diff; dy *= diff;
          a.x[i] += dx; a.y[i] += dy; a.x[j] -= dx; a.y[j] -= dy;
        }
        arCollide(S, a);
      }
      if (a.y[IP] > RH + 90 && a.alive) {
        a.alive = false; a.hp = 0; a.stiff = 0;
        emit(['die', a.idx, 'fall', 0, a.x[IP], RH - 10]);
      } else if (!a.alive && a.y[IP] > RH + 200) { a.dead2 = 1; }
    }

    function solidAt(S, x, y) {
      for (const s of S.solids) if (x > s[0] && x < s[0] + s[2] && y > s[1] && y < s[1] + s[3]) return s;
      return null;
    }
    function hitTest(S, team, px, py, skip) {
      let best = null;
      for (const a of S.ar) {
        if (a.team === team || a.dead2 || a === skip) continue;
        const cx = a.x[IN], cy = a.y[IN];
        if (Math.abs(px - cx) > 90 * a.sc || Math.abs(py - cy) > 110 * a.sc) continue;
        for (const c of CAPS) {
          const r = c[2] * a.sc + 1.5;
          const q = segDist(px, py, a.x[c[0]], a.y[c[0]], a.x[c[1]], a.y[c[1]]);
          if (q.d < r) {
            const k = q.d / r - (c[3] === 'head' ? .25 : 0);
            if (!best || k < best.k) best = { a, zone: c[3], i: c[0], j: c[1], t: q.t, k };
          }
        }
      }
      return best;
    }
    function ballistic(S, team, x, y, v, ang, maxT, preview, targets) {
      const pts = [];
      let vx = Math.cos(ang) * v, vy = Math.sin(ang) * v, t = 0, end = null, mind = 1e9, minAt = 0;
      const h = 1 / 90;
      let n = 0;
      while (t < maxT) {
        vy += GR * h; x += vx * h; y += vy * h; t += h; n++;
        if (preview && n % 4 === 0) pts.push(x, y);
        if (targets) for (const q of targets) { const d = Math.hypot(x - q[0], y - q[1]); if (d < mind) { mind = d; minAt = t; } }
        if (x < -60 || x > RW + 60 || y > RH + 80) { end = { x, y, k: 'out' }; break; }
        if (solidAt(S, x, y)) { end = { x, y, k: 'solid' }; break; }
        const hh = hitTest(S, team, x, y);
        if (hh) { end = { x, y, k: 'body', a: hh.a, zone: hh.zone }; break; }
      }
      if (!end) end = { x, y, k: 'time' };
      return { pts, end, mind, minAt };
    }

    function pushA(a, i, ix, iy, w) { a.ox[i] -= ix * w; a.oy[i] -= iy * w; }
    function hurt(S, a, dmg, emit, why) {
      if (!a.alive || S.phase === 'over') return 0;
      dmg *= 1 - a.armor;
      a.hp -= dmg; a.flash = .14;
      if (a.hp <= 0) { a.hp = 0; a.alive = false; a.stiff = 0; a.dieT = .001; a.burn = 0; a.frozen = 0; a.stun = 0; }
      return dmg;
    }
    function gainKill(S, a, killer, zone, emit) {
      S.kills[a.team ? 0 : 1]++;
      if (zone === 'head') S.heads[a.team ? 0 : 1]++;
      if (S.mode === 'waves' && a.team === 1) {
        const c = 10 + S.wave * 2 + (zone === 'head' ? 6 : 0) + (a.kind === 'boss' ? 40 : 0);
        S.meta.coins += c; S.earned += c;
        emit(['coin', a.idx, c, a.x[IN], a.y[IN] - 30]);
        if (Math.random() < .55 || a.kind === 'boss') {
          const t = pick(['fire', 'ice', 'bomb', 'triple', 'lightning']);
          S.meta.ammo[t] = (S.meta.ammo[t] || 0) + 1;
          const p = S.ar[0];
          if (p) p.ammo[t] = (p.ammo[t] || 0) + 1;
          emit(['ammo', t, a.x[IN], a.y[IN] - 52]);
        }
      }
    }
    function damageArcher(S, a, dmg, zone, owner, emit, pos) {
      const was = a.alive;
      const dealt = hurt(S, a, dmg, emit);
      emit(['hit', a.idx, zone, Math.round(dealt), pos[0], pos[1], owner ? owner.idx : -1, a.hp / a.mhp]);
      if (was && !a.alive) {
        emit(['die', a.idx, zone, zone === 'head' ? 1 : 0, pos[0], pos[1], owner ? owner.idx : -1]);
        gainKill(S, a, owner, zone, emit);
      }
      return dealt;
    }
    function stagger(a, mag, long) {
      if (!a.alive) return;
      a.stag = Math.max(a.stag, .16 + Math.min(.5, mag * .05) + (long || 0));
      a.stiff = Math.min(a.stiff, .15);
    }
    function boom(S, x, y, R, dmg, owner, emit) {
      emit(['boom', x, y, R]);
      for (const a of S.ar) {
        if (a.dead2) continue;
        let near = 1e9;
        for (let i = 0; i < 11; i++) {
          const d = Math.hypot(a.x[i] - x, a.y[i] - y);
          if (d < near) near = d;
          if (d < R * 1.4) {
            const k = (1 - d / (R * 1.4)), dx = (a.x[i] - x) / (d || 1), dy = (a.y[i] - y) / (d || 1) - .25;
            pushA(a, i, dx * 17 * k, dy * 17 * k, 1);
          }
        }
        if (near < R) {
          stagger(a, 12, .35);
          if (a.alive) {
            const d = Math.hypot(a.x[IN] - x, a.y[IN] - y), k = clamp(1 - Math.max(0, d - 14) / R, .25, 1);
            const own = owner && owner.team === a.team;
            damageArcher(S, a, dmg * k * (own ? .55 : 1) * (owner ? owner.dmgMul : 1), 'body', owner, emit, [a.x[IN], a.y[IN]]);
          }
        }
      }
      for (const t of S.terr) { if (Math.hypot(t.x - x, t.y - y) < R * .6) t.life = Math.min(t.life, .4); }
    }
    function bodyFrame(a, i, j) {
      if (i === j) return Math.atan2(a.y[IH] - a.y[IN], a.x[IH] - a.x[IN]);
      return Math.atan2(a.y[j] - a.y[i], a.x[j] - a.x[i]);
    }
    function stickOn(S, a, h, A, emit) {
      const ang = Math.atan2(A.vy, A.vx), fr = bodyFrame(a, h.i, h.j);
      const ax = a.x[h.i] + (a.x[h.j] - a.x[h.i]) * h.t, ay = a.y[h.i] + (a.y[h.j] - a.y[h.i]) * h.t;
      const dx = A.x - ax, dy = A.y - ay, c = Math.cos(-fr), s = Math.sin(-fr);
      const st = { i: h.i, j: h.j, t: Math.round(h.t * 100) / 100, ox: Math.round((dx * c - dy * s) * 10) / 10, oy: Math.round((dx * s + dy * c) * 10) / 10, r: Math.round((ang - fr) * 100) / 100, ty: A.type };
      a.stk.push(st); if (a.stk.length > 16) a.stk.shift();
      emit(['stk', a.idx, st]);
    }
    function arrowBody(S, A, h, emit) {
      const a = h.a, owner = S.ar[A.own], zone = h.zone;
      A.hitBody = true;
      const sp = Math.hypot(A.vx, A.vy);
      let dmg = TDMG[A.type] * (.5 + .5 * A.pw) * ZM[zone] * (A.dm || 1) * (owner ? owner.dmgMul : 1);
      if (zone === 'head') dmg *= (owner ? owner.critMul : 1) * (a.helm ? .68 : 1);
      let shatter = false;
      if (a.frozen > 0 && A.type !== 'ice') { dmg *= 1.6; a.frozen = 0; shatter = true; emit(['shatter', a.idx, a.x[IN], a.y[IN]]); }
      const px = A.x, py = A.y;
      if (A.type === 'bomb') {
        stickOn(S, a, h, A, emit);
        boom(S, px, py, 92, 40 * (.55 + .45 * A.pw), owner, emit);
        A.dead = true; return;
      }
      const alive0 = a.alive;
      if (alive0) damageArcher(S, a, dmg, zone, owner, emit, [px, py]);
      else emit(['thud', a.idx, px, py]);
      const kx = A.vx / 60 * .24, ky = A.vy / 60 * .24;
      const w = zone === 'head' ? 1.1 : zone === 'body' ? 1 : .8;
      pushA(a, h.i, kx, ky, w); pushA(a, h.j, kx, ky, w * .6);
      for (let i = 0; i < 11; i++) pushA(a, i, kx, ky, .28);
      if (alive0) stagger(a, dmg, zone === 'head' ? .35 : 0);
      stickOn(S, a, h, A, emit);
      if (alive0 && a.alive) {
        if (A.type === 'fire') { a.burn = 3.4; a.burnBy = A.own; emit(['ignite', a.idx]); }
        else if (A.type === 'ice') { a.frozen = 2.4; a.burn = 0; if (a.cmd) a.cmd.draw = false; a.draw = 0; emit(['freeze', a.idx, a.x[IN], a.y[IN]]); }
        else if (A.type === 'lightning') {
          a.stun = Math.max(a.stun, 1.15); a.draw = 0;
          emit(['bolt', px, py, 1]);
          let cnt = 0;
          for (const b of S.ar) {
            if (b === a || b.team !== a.team || !b.alive || cnt >= 2) continue;
            if (Math.hypot(b.x[IN] - a.x[IN], b.y[IN] - a.y[IN]) < 300) {
              cnt++;
              emit(['arc', a.x[IN], a.y[IN], b.x[IN], b.y[IN]]);
              damageArcher(S, b, dmg * .45, 'body', owner, emit, [b.x[IN], b.y[IN]]);
              b.stun = Math.max(b.stun, .6); b.draw = 0;
            }
          }
        }
      } else if (A.type === 'lightning') emit(['bolt', px, py, 0]);
      A.dead = true;
    }
    function arrowTerrain(S, A, emit) {
      A.dead = true;
      const ang = Math.atan2(A.vy, A.vx);
      if (A.type === 'bomb') { boom(S, A.x, A.y, 92, 40 * (.55 + .45 * A.pw), S.ar[A.own], emit); return; }
      emit(['terr', Math.round(A.x * 10) / 10, Math.round(A.y * 10) / 10, Math.round(ang * 100) / 100, A.type]);
      S.terr.push({ x: A.x, y: A.y, a: ang, ty: A.type, life: A.type === 'fire' ? 4 : 14 });
      if (S.terr.length > 36) S.terr.shift();
      if (A.type === 'lightning') {
        emit(['bolt', A.x, A.y, 0]);
        for (const b of S.ar) {
          if (!b.alive || b.team === S.ar[A.own].team) continue;
          if (Math.hypot(b.x[IFF] - A.x, b.y[IFF] - A.y) < 70) {
            damageArcher(S, b, 12 * (S.ar[A.own].dmgMul), 'leg', S.ar[A.own], emit, [b.x[IP], b.y[IP]]);
            b.stun = Math.max(b.stun, .8); b.draw = 0;
          }
        }
      }
      if (A.type === 'ice') emit(['frost', A.x, A.y]);
    }
    function arrowStep(S, A, dt, emit) {
      const sp = Math.hypot(A.vx, A.vy), n = Math.max(1, Math.ceil(sp * dt / 5)), h = dt / n;
      A.age += dt;
      for (let k = 0; k < n && !A.dead; k++) {
        A.vy += GR * h; A.x += A.vx * h; A.y += A.vy * h;
        if (solidAt(S, A.x, A.y)) { arrowTerrain(S, A, emit); return; }
        const hh = hitTest(S, A.team, A.x, A.y);
        if (hh) { arrowBody(S, A, hh, emit); return; }
      }
      if (A.x < -80 || A.x > RW + 80 || A.y > RH + 120 || A.y < -900) A.dead = true;
    }

    function muzzle(a) {
      const ca = Math.cos(a.aim), sa = Math.sin(a.aim);
      return [a.x[IHF] + ca * 8 * a.sc, a.y[IHF] + sa * 8 * a.sc];
    }
    function shoot(S, a, ang, p, type, emit) {
      if (!a.alive || a.frozen > 0 || a.stun > 0 || S.phase !== 'fight' || a.cd > 0) return false;
      if (type !== 'normal' && !(a.ammo[type] > 0)) type = 'normal';
      p = clamp(p, 0, 1);
      const xc = TXC[type];
      let cost = 8 + 26 * p + xc;
      if (a.st < cost) {
        const pp = (a.st - 8 - xc) / 26;
        if (pp < .14) { emit(['tired', a.idx]); return false; }
        p = pp; cost = 8 + 26 * p + xc;
      }
      a.st = Math.max(0, a.st - cost); a.spend = 0; a.cd = a.cdMax;
      if (type !== 'normal') a.ammo[type]--;
      a.aim = ang; a.draw = 0; a.rec = 1;
      const fa = Math.cos(ang);
      if (Math.abs(fa) > .05) a.face = fa >= 0 ? 1 : -1;
      arPose(a, tpose);
      const mx = tpose.x[IHF] + Math.cos(ang) * 8 * a.sc, my = tpose.y[IHF] + Math.sin(ang) * 8 * a.sc;
      const v = VMIN + (VMAX - VMIN) * p;
      const angs = type === 'triple' ? [-.1, 0, .1] : [0];
      for (const d of angs) {
        const aa = ang + d;
        S.arrows.push({ id: ++S.nid, x: mx, y: my, vx: Math.cos(aa) * v, vy: Math.sin(aa) * v, type, own: a.idx, team: a.team, pw: p, age: 0, dead: false, dm: type === 'triple' ? 1 : 1 });
      }
      const bx = -Math.cos(ang) * .8, by = -Math.sin(ang) * .8;
      for (let i = 0; i < 11; i++) { a.ox[i] -= bx * (i === IHB || i === IEB ? 1.5 : .5); a.oy[i] -= by * .2; }
      emit(['shot', a.idx, type, p, mx, my, ang]);
      return true;
    }

    function newState(cfg, meta) {
      const ar = ARENAS[cfg.arena % ARENAS.length];
      const S = {
        cfg, mode: cfg.mode, arena: cfg.arena % ARENAS.length, solids: ar.solids, pit: ar.pit, phase: 'intro', pt: 0, t: 0, ar: [], arrows: [], terr: [], nid: 0,
        wave: cfg.wave || 1, rnd: cfg.rnd || 1, score: cfg.score ? cfg.score.slice() : [0, 0], kills: [0, 0], heads: [0, 0], earned: 0, meta, over: false, win: -1, roundWin: -1, slow: 0, shots: 0, hits: 0
      };
      const dif = DIFF[cfg.diff == null ? 1 : cfg.diff] || DIFF[1];
      if (cfg.mode === 'waves') {
        const U = meta.upg;
        const p = newArcher(S, 0, 0, 'player', ar.pl, {
          hp: 100 + 16 * U.hp, st: 100 + 12 * U.stam, regen: 30 + 3 * U.stam, dmgMul: 1 + .09 * U.pow, critMul: 1 + .16 * U.crit, armor: Math.min(.5, .05 * U.armor), cd: .35 * Math.pow(.93, U.draw), ctl: 'human', name: cfg.names ? cfg.names[0] : 'You', ammo: Object.assign({}, meta.ammo)
        });
        p.hp = Math.min(p.mhp, meta.hp == null ? p.mhp : meta.hp);
        S.ar.push(p);
        const spec = waveSpec(S.wave, dif);
        spec.forEach((e, i) => {
          const sl = ar.en[i % ar.en.length];
          const K = KINDS[e.kind];
          const w = S.wave;
          const hp = Math.round((K.hp + (K.hw || 0) * w) * dif.hp);
          const en = newArcher(S, S.ar.length, 1, e.kind, sl, {
            hp, dmgMul: (.6 + w * .042) * dif.dmg, critMul: 1.2, cd: Math.max(.9, (K.cd * (1 - Math.min(.35, w * .014))) * dif.cd), errMul: (dif.werr || dif.err) * Math.max(.45, 1 - w * .028), lvl: Math.min(5, 1 + w / 4), st: 100, regen: 28, ctl: 'ai',
            ammo: { fire: 99, ice: 99, bomb: 99, triple: 99, lightning: 99 }
          });
          S.ar.push(en);
        });
      } else {
        const ds = cfg.duel;
        const dl = i => (ds.lv && DIFF[ds.lv[i]]) || dif;
        const mk = (i, team, ctl, name) => newArcher(S, i, team, 'duel', team ? [RW - ar.pl[0], ar.pl[1]] : ar.pl.slice(), {
          hp: 100, st: 100, regen: 28, dmgMul: 1, critMul: 1, armor: 0, cd: .4, ctl, name, band: team ? '#e2453c' : '#3b82f6', ammo: { fire: 2, ice: 2, bomb: 1, triple: 2, lightning: 1 },
          errMul: ctl === 'ai' ? dl(i).err : 1, lvl: cfg.diff, hx: ctl === 'ai' && dl(i).hx ? 1 : 0, learn: dl(i).learn
        });
        S.ar.push(mk(0, 0, ds.ctl[0], cfg.names[0]));
        S.ar.push(mk(1, 1, ds.ctl[1], cfg.names[1]));
        S.ar[0].col = '#16233f'; S.ar[1].col = '#2b1e22';
      }
      return S;
    }
    function waveSpec(w, dif) {
      const out = [];
      const boss = w % 5 === 0;
      if (boss) {
        out.push({ kind: 'boss' });
        if (w >= 10) out.push({ kind: pick(['grunt', 'hunter', 'mage']) });
        if (w >= 20) out.push({ kind: 'tank' });
        return out;
      }
      const n = w < 3 ? 1 : w < 7 ? 2 : 3;
      const pool = ['grunt'];
      if (w >= 2) pool.push('hunter');
      if (w >= 4) pool.push('mage');
      if (w >= 6) pool.push('tank');
      for (let i = 0; i < n; i++) out.push({ kind: i === 0 && w < 3 ? (w === 2 ? 'hunter' : 'grunt') : pick(pool) });
      return out;
    }

    function solveAngles(x0, y0, tx, ty, v) {
      const dx = tx - x0, sx = dx >= 0 ? 1 : -1, X = Math.abs(dx) || 1, Y = y0 - ty;
      const k = GR * X * X / (2 * v * v), disc = X * X - 4 * k * (Y + k);
      if (disc < 0) return [];
      const r = Math.sqrt(disc), out = [];
      for (const sg of [-1, 1]) {
        const u = (X + sg * r) / (2 * k), th = Math.atan(u);
        out.push(Math.atan2(-Math.sin(th), sx * Math.cos(th)));
      }
      return out;
    }
    const gaussR = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.6;
    function aiPlan(S, a, T) {
      const ai = a.ai;
      const hx = ai.hx;
      let hty = 'normal';
      if (hx) {
        if (T.frozen > .55) hty = 'normal';
        else if (a.ammo.ice > 0) hty = 'ice';
        else if (a.ammo.bomb > 0 && T.hp <= 36) hty = 'bomb';
        else if (a.ammo.fire > 0 && !(T.burn > 0)) hty = 'fire';
        else if (a.ammo.lightning > 0) hty = 'lightning';
        else if (a.ammo.bomb > 0) hty = 'bomb';
        else if (a.ammo.triple > 0 && T.stag > 0) hty = 'triple';
      }
      const head = hx ? hty === 'normal' && (T.frozen > .55 || Math.random() < .9) : Math.random() < a.head;
      const tpx = (head ? T.x[IH] : T.x[IN]) + ai.bias[0], tpy = (head ? T.y[IH] : (T.y[IN] + T.y[IP]) / 2) + ai.bias[1];
      let ty = 'normal';
      const avail = [];
      if (a.sp) for (const t of a.sp) if (a.ammo[t] > 0) avail.push(t);
      if (a.ctl === 'ai' && S.mode === 'duel') for (const t of ['fire', 'ice', 'bomb', 'triple', 'lightning']) if (a.ammo[t] > 0) avail.push(t);
      const chance = S.mode === 'duel' ? .28 : a.spc;
      if (avail.length && Math.random() < chance) ty = pick(avail);
      if (T.frozen > .7 && a.ammo.bomb > 0 && S.mode === 'duel') ty = 'bomb';
      if (hx) ty = hty;
      const ox = a.x[IN], oy = a.y[IN];
      let best = null;
      for (const pw of [1, .88, .76, .64, .52]) {
        const v = VMIN + (VMAX - VMIN) * pw;
        for (const ang of solveAngles(ox, oy, tpx, tpy, v)) {
          const sa = a.aim; a.aim = ang; arPose(a, tpose); a.aim = sa;
          const mx = tpose.x[IHF] + Math.cos(ang) * 8 * a.sc, my = tpose.y[IHF] + Math.sin(ang) * 8 * a.sc;
          const ang2 = solveAngles(mx, my, tpx, tpy, v).sort((p, q) => Math.abs(angDiff(p, ang)) - Math.abs(angDiff(q, ang)))[0];
          if (ang2 == null) continue;
          const r = ballistic(S, a.team, mx, my, v, ang2, 3.2, false, [[tpx, tpy]]);
          let sc = r.mind;
          if (r.end.k === 'solid') sc += 14 + 40 * (ai.block || 0);
          if (r.end.k === 'body' && r.end.a.team === a.team) sc += 30;
          sc += (1 - pw) * 6;
          if (!best || sc < best.sc) best = { sc, ang: ang2, pw };
        }
      }
      if (!best) return null;
      const dist = Math.abs(tpx - ox);
      const sig = .03 * a.err * (.6 + dist / 800);
      const ang = best.ang + gaussR() * sig;
      const pw = clamp(best.pw * (1 + gaussR() * .018 * a.err), .2, 1);
      return { ang, pw, ty, t: 0, dur: (.5 + pw * .5) * (hx ? .78 : a.err > 1.1 ? 1.2 : a.err < .7 ? .85 : 1), tx: tpx, tyy: tpy, tgt: T.idx };
    }
    function aiThink(S, a, dt, emit) {
      const ai = a.ai, c = a.cmd;
      if (ai.plan) {
        const p = ai.plan;
        p.t += dt;
        c.ang = p.ang + Math.sin(S.t * 9 + a.idx) * .004; c.p = p.pw * Math.min(1, p.t / p.dur); c.draw = true;
        if (p.t >= p.dur) {
          c.shot = { ang: p.ang, p: p.pw, ty: p.ty }; c.draw = false;
          ai.last = { id: S.nid + 1, tx: p.tx, ty: p.tyy, ty2: p.ty };
          ai.plan = null; ai.t = a.cdMax * (ai.hx ? .6 + Math.random() * .3 : .85 + Math.random() * .5);
        }
        return;
      }
      c.draw = false;
      ai.t -= dt;
      if (ai.t > 0 || a.cd > 0 || a.st < 34 || a.frozen > 0 || a.stun > 0) return;
      const tg = S.ar.filter(q => q.team !== a.team && q.alive);
      if (!tg.length) return;
      tg.sort((p, q) => Math.abs(p.x[IN] - a.x[IN]) - Math.abs(q.x[IN] - a.x[IN]));
      ai.plan = aiPlan(S, a, tg[0]);
      if (!ai.plan) ai.t = .5;
    }
    function aiLearn(S, A) {
      const o = S.ar[A.own];
      if (!o || o.ctl !== 'ai' || !o.ai.last || o.ai.last.id !== A.id) return;
      const l = o.ai.last; o.ai.last = null;
      const g = (o.ai.learn || (DIFF[S.cfg.diff == null ? 1 : S.cfg.diff] || DIFF[1]).learn || .7) * .75;
      if (A.hitBody) { o.ai.bias[0] *= .5; o.ai.bias[1] *= .5; o.ai.block = 0; return; }
      if (Math.hypot(A.x - l.tx, A.y - l.ty) > 170) { o.ai.bias[0] *= .5; o.ai.bias[1] *= .5; o.ai.block = Math.min(3, (o.ai.block || 0) + 1); return; }
      o.ai.bias[0] = clamp(o.ai.bias[0] - (A.x - l.tx) * g, -140, 140);
      o.ai.bias[1] = clamp(o.ai.bias[1] - (A.y - l.ty) * g, -140, 140);
    }

    function endRound(S, kind, emit) {
      if (S.phase === 'end' || S.phase === 'done') return;
      S.phase = 'end'; S.pt = 0; S.endKind = kind;
      if (S.mode === 'duel') {
        if (kind === 'win0') S.score[0]++; else if (kind === 'win1') S.score[1]++;
        const need = S.cfg.need || 2;
        if (S.score[0] >= need || S.score[1] >= need) { S.over = true; S.win = S.score[0] >= need ? 0 : 1; }
      } else if (kind === 'lose') { S.over = true; S.win = 1; }
      emit(['end', kind]);
    }
    function simStep(S, dt, emit) {
      S.t += dt;
      if (S.phase === 'intro') { S.pt += dt; if (S.pt > (S.cfg.intro || 1.7)) { S.phase = 'fight'; S.pt = 0; emit(['go']); } }
      else S.pt += dt;
      const fight = S.phase === 'fight';
      for (const a of S.ar) {
        if (a.alive) {
          a.cd = Math.max(0, a.cd - dt);
          a.spend += dt;
          if (a.spend > .5) a.st = Math.min(a.mst, a.st + a.regen * dt);
          if (a.frozen > 0) { a.frozen -= dt; if (a.frozen <= 0) emit(['thaw', a.idx]); }
          if (a.stun > 0) a.stun -= dt;
          if (a.burn > 0) {
            a.burn -= dt; a.burnT += dt;
            if (a.burnT >= .5) { a.burnT -= .5; const by = S.ar[a.burnBy]; damageArcher(S, a, 3.6 * (by ? by.dmgMul : 1), 'burn', by, emit, [a.x[IN], a.y[IN] - 20]); }
          }
          if (fight) {
            if (a.ctl === 'ai') aiThink(S, a, dt, emit);
            const c = a.cmd;
            if (a.frozen > 0 || a.stun > 0) { c.shot = null; a.draw += (0 - a.draw) * Math.min(1, dt * 12); }
            else {
              a.aim += angDiff(a.aim, c.ang) * Math.min(1, dt * 22);
              a.draw += ((c.draw ? c.p : 0) - a.draw) * Math.min(1, dt * 16);
              if (c.shot) { const s = c.shot; c.shot = null; shoot(S, a, s.ang, s.p, s.ty, emit); }
            }
          } else { a.draw += (0 - a.draw) * Math.min(1, dt * 10); }
        } else a.draw = 0;
        arStep(S, a, dt, emit);
      }
      for (const A of S.arrows) {
        if (!A.dead) arrowStep(S, A, dt, emit);
        if (A.dead) aiLearn(S, A);
      }
      S.arrows = S.arrows.filter(A => !A.dead);
      for (const t of S.terr) t.life -= dt;
      S.terr = S.terr.filter(t => t.life > 0);
      if (fight) {
        const p = S.ar.filter(q => q.team === 0), e = S.ar.filter(q => q.team === 1);
        const pa = p.some(q => q.alive), ea = e.some(q => q.alive);
        if (S.mode === 'waves') {
          if (!pa) endRound(S, 'lose', emit);
          else if (!ea) endRound(S, 'clear', emit);
        } else if (!pa && !ea) endRound(S, 'draw', emit);
        else if (!pa) endRound(S, 'win1', emit);
        else if (!ea) endRound(S, 'win0', emit);
      } else if (S.phase === 'end' && S.pt > (S.slowEnd ? 3.1 : 2.2)) {
        S.phase = 'done';
      }
    }

    const mkVis = (S, sh) => ({ parts: [], pops: [], bolts: [], booms: [], shake: 0, flash: 0, slow: 0, zoom: 0, zx: RW / 2, zy: RH / 2, t: 0, bgA: null, bgB: null, cl: null, snow: [], bannerT: 0, banner: '', sub: '', kcT: 0 });
    const pt = (V, x, y, vx, vy, life, size, col, kind, g) => { if (V.parts.length > 420) V.parts.shift(); V.parts.push({ x, y, vx, vy, life, max: life, size, col, kind: kind || 'dot', g: g == null ? 0 : g, rot: Math.random() * TAU }); };
    const pop = (V, x, y, text, col, size, life) => { V.pops.push({ x, y, text, col, size: size || 15, life: life || 1.1, max: life || 1.1 }); if (V.pops.length > 24) V.pops.shift(); };
    const burst = (V, x, y, n, col, sp, life, size, g) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (.3 + Math.random() * .7); pt(V, x, y, Math.cos(a) * v, Math.sin(a) * v, life * (.6 + Math.random() * .6), size * (.6 + Math.random() * .8), col, 'dot', g == null ? 400 : g); } };

    function onEvent(V, S, ev, sh, guest) {
      const A = sh.audio, k = ev[0];
      if (k === 'shot') {
        const [, idx, ty, p, x, y, ang] = ev;
        A.play('bow');
        if (ty === 'fire') A.play('ign', 80); else if (ty === 'lightning') A.play('zap', 60);
        for (let i = 0; i < 4; i++) pt(V, x, y, Math.cos(ang) * 60 + rnd(-30, 30), Math.sin(ang) * 60 + rnd(-30, 30), .25, 2, '#fff', 'dot', 0);
        if (S.ar[idx]) S.ar[idx].rec = 1;
      } else if (k === 'hit') {
        const [, idx, zone, dmg, x, y, ow, frac] = ev;
        if (zone === 'burn') { pop(V, x + rnd(-8, 8), y, '' + dmg, '#ffa040', 12, .8); return; }
        const head = zone === 'head';
        pop(V, x, y - 12, (head ? T('HEADSHOT') + ' ' : '') + dmg, head ? '#ffdf4d' : idx === 0 && S.mode === 'waves' ? '#ff7a6a' : '#ffffff', head ? 21 : zone === 'body' ? 16 : 13, head ? 1.4 : 1);
        burst(V, x, y, head ? 12 : 6, head ? '#ffe36a' : '#ffffff', head ? 260 : 170, .35, head ? 3.2 : 2.4);
        A.play(head ? 'crit' : 'hit', 30);
        V.shake = Math.max(V.shake, head ? 6 : 2.5);
        if (head) { V.flash = Math.max(V.flash, .18); }
        if (S.ar[idx]) S.ar[idx].flash = .14;
        if (guest && S.ar[idx]) S.ar[idx].hp = Math.max(0, S.ar[idx].hp);
      } else if (k === 'die') {
        const [, idx, zone, head, x, y] = ev;
        A.play(zone === 'fall' ? 'fall' : 'die');
        burst(V, x, y, 22, '#ffffff', 320, .6, 3.4);
        V.shake = Math.max(V.shake, 8);
        const a = S.ar[idx];
        if (a && guest) { a.alive = false; }
        if (!guest && S.mode === 'waves' && S.ar.filter(q => q.team === 1 && q.alive).length === 0 && a && a.team === 1) { S.slowEnd = 1; V.slow = 1.1; V.zx = x; V.zy = y; }
        else if (!guest && head && S.ar.filter(q => q.alive).length <= 1 && sh.local) { S.slowEnd = 1; V.slow = 1.1; V.zx = x; V.zy = y; }
        if (head) pop(V, x, y - 44, T('HEADSHOT!'), '#ff5a4a', 26, 1.6);
      } else if (k === 'stk') {
        if (guest) { const a = S.ar[ev[1]]; if (a) { a.stk.push(ev[2]); if (a.stk.length > 16) a.stk.shift(); } }
      } else if (k === 'terr') {
        const [, x, y, ang, ty] = ev;
        if (guest) { S.terr.push({ x, y, a: ang, ty, life: ty === 'fire' ? 4 : 14 }); if (S.terr.length > 36) S.terr.shift(); }
        A.play('thunk', 20);
        burst(V, x, y, 5, '#cbb894', 110, .4, 2.6, 300);
      } else if (k === 'boom') {
        const [, x, y, R] = ev;
        A.play('boom');
        V.booms.push({ x, y, R, t: 0 });
        burst(V, x, y, 30, '#ffb347', 520, .7, 4, 200);
        burst(V, x, y, 18, '#4a4a4a', 260, 1, 7, -40);
        V.shake = Math.max(V.shake, 14); V.flash = Math.max(V.flash, .25);
      } else if (k === 'bolt') {
        const [, x, y] = ev;
        A.play('bolt');
        V.bolts.push({ x, y, t: 0, seed: Math.random() * 1000, kind: 0 });
        V.flash = Math.max(V.flash, .2); V.shake = Math.max(V.shake, 4);
        burst(V, x, y, 12, '#d9c2ff', 330, .4, 2.6, 0);
      } else if (k === 'arc') {
        V.bolts.push({ x: ev[3], y: ev[4], x0: ev[1], y0: ev[2], t: 0, seed: Math.random() * 1000, kind: 1 });
        A.play('zap', 40);
      } else if (k === 'ignite') { A.play('ign', 60); } else if (k === 'freeze') {
        A.play('ice');
        burst(V, ev[2], ev[3], 16, '#bff1ff', 240, .6, 3, 200);
      } else if (k === 'shatter') { A.play('shatter'); burst(V, ev[2], ev[3], 26, '#d4f6ff', 380, .8, 4, 500); }
      else if (k === 'thaw') { A.play('thaw'); } else if (k === 'frost') { burst(V, ev[1], ev[2], 6, '#bff1ff', 120, .5, 2.4, 100); A.play('thunk', 20); }
      else if (k === 'thud') { A.play('thud', 40); } else if (k === 'tired') { if (S.ar[ev[1]] && S.ar[ev[1]].ctl === 'human' || sh.me === ev[1]) { A.play('tired', 200); pop(V, S.ar[ev[1]].x[IN], S.ar[ev[1]].y[IN] - 70, T('Out of stamina'), '#ffd447', 14, .9); } }
      else if (k === 'coin') { pop(V, ev[3], ev[4], '+' + ev[2], '#ffd447', 17, 1.3); A.play('coin', 50); }
      else if (k === 'ammo') { pop(V, ev[2], ev[3], '+1 ' + T(TNAME[ev[1]]), TCOL[ev[1]], 14, 1.5); }
      else if (k === 'go') { A.play('go'); V.banner = T('FIGHT!'); V.sub = ''; V.bannerT = .55; }
      else if (k === 'end') { }
    }

    function seeded(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
    function makeBg(S, dpr) {
      const ar = ARENAS[S.arena], th = THEMES[ar.theme], R = seeded(S.arena * 977 + 13);
      const mk = () => { const c = document.createElement('canvas'); c.width = Math.round(RW * dpr); c.height = Math.round(RH * dpr); const x = c.getContext('2d'); x.scale(dpr, dpr); return [c, x]; };
      const [ca, a] = mk(), [cb, b] = mk();
      const g = a.createLinearGradient(0, 0, 0, RH);
      g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
      a.fillStyle = g; a.fillRect(0, 0, RW, RH);
      if (th.stars) { for (let i = 0; i < 110; i++) { a.globalAlpha = .3 + R() * .7; a.fillStyle = '#fff'; a.beginPath(); a.arc(R() * RW, R() * 300, .5 + R() * 1.3, 0, TAU); a.fill(); } a.globalAlpha = 1; }
      const [sc, sx, sy] = th.sun;
      const rg = a.createRadialGradient(sx, sy, 6, sx, sy, ar.theme === 'sunset' ? 190 : 120);
      rg.addColorStop(0, sc); rg.addColorStop(.25, sc + 'cc'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      a.fillStyle = rg; a.fillRect(0, 0, RW, RH);
      a.fillStyle = sc; a.beginPath(); a.arc(sx, sy, ar.theme === 'sunset' ? 56 : 34, 0, TAU); a.fill();
      if (ar.theme === 'night') { a.fillStyle = '#1f3466'; a.beginPath(); a.arc(sx + 12, sy - 6, 30, 0, TAU); a.fill(); }
      const ridge = (base, amp, col, step, jag) => {
        a.fillStyle = col; a.beginPath(); a.moveTo(0, RH);
        let x = 0; a.lineTo(0, base);
        while (x <= RW + step) { const y = base - amp * (jag ? Math.abs(Math.sin(x * .011 + R() * 1.5)) * (.5 + R() * .7) : (Math.sin(x * .008 + 1) * .5 + .5) * (.7 + R() * .3)); a.lineTo(x, y); x += step; }
        a.lineTo(RW, RH); a.closePath(); a.fill();
      };
      ridge(330, 150, th.far, 34, 1);
      ridge(390, 80, th.near, 22, 0);
      if (ar.theme === 'snow' || ar.theme === 'ruins' || ar.theme === 'night') {
        for (let i = 0; i < 26; i++) {
          const x = R() * RW, h = 40 + R() * 50, y = 440 + R() * 40;
          a.fillStyle = ar.theme === 'snow' ? '#5c7ea6' : ar.theme === 'night' ? '#0c1330' : '#2d6a49';
          a.beginPath(); a.moveTo(x, y - h); a.lineTo(x + h * .28, y); a.lineTo(x - h * .28, y); a.fill();
          a.beginPath(); a.moveTo(x, y - h * .7); a.lineTo(x + h * .34, y - h * .15); a.lineTo(x - h * .34, y - h * .15); a.fill();
        }
      }
      if (ar.theme === 'desert') {
        for (let i = 0; i < 6; i++) { const x = R() * RW, y = 470; a.strokeStyle = '#6b8f4a'; a.lineWidth = 5; a.lineCap = 'round'; a.beginPath(); a.moveTo(x, y); a.lineTo(x, y - 34); a.moveTo(x, y - 14); a.lineTo(x + 10, y - 14); a.lineTo(x + 10, y - 26); a.stroke(); }
      }
      if (ar.pit) {
        const mg = a.createLinearGradient(0, 380, 0, RH);
        mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, ar.theme === 'night' ? 'rgba(0,0,10,.75)' : 'rgba(40,30,60,.5)');
        a.fillStyle = mg; a.fillRect(0, 380, RW, RH - 380);
      }
      for (const s of S.solids) {
        const [x, y, w, h] = s;
        const rg2 = b.createLinearGradient(0, y, 0, y + h);
        rg2.addColorStop(0, th.rock[0]); rg2.addColorStop(1, th.rock[1]);
        b.fillStyle = rg2; rrect(b, x - 2, y, w + 4, h + 20, 8); b.fill();
        b.save(); rrect(b, x - 2, y, w + 4, h + 20, 8); b.clip();
        for (let i = 0; i < w * h / 520; i++) {
          const px = x + R() * w, py = y + 14 + R() * (h - 8), l = 8 + R() * 26;
          b.strokeStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.12)'; b.lineWidth = 1 + R() * 1.4;
          b.beginPath(); b.moveTo(px, py); b.lineTo(px + l, py + (R() - .5) * 4); b.stroke();
        }
        const sh2 = b.createLinearGradient(0, y + h - 60, 0, y + h + 20);
        sh2.addColorStop(0, 'rgba(0,0,0,0)'); sh2.addColorStop(1, 'rgba(0,0,0,.35)');
        if (s[1] + s[3] < RH - 5 || ar.pit) { b.fillStyle = sh2; b.fillRect(x - 2, y + h - 60, w + 4, 80); }
        b.restore();
        b.fillStyle = th.top;
        b.beginPath(); b.moveTo(x - 3, y + 2);
        for (let px = x - 3; px <= x + w + 3; px += 9) b.quadraticCurveTo(px + 2, y - 4 - R() * 3, px + 9, y + 1);
        b.lineTo(x + w + 3, y + 13); for (let px = x + w + 3; px >= x - 3; px -= 12) b.quadraticCurveTo(px - 3, y + 8 + R() * 10, px - 12, y + 12 + R() * 4);
        b.closePath(); b.fill();
        b.strokeStyle = 'rgba(0,0,0,.28)'; b.lineWidth = 2; rrect(b, x - 2, y, w + 4, h + 20, 8); b.stroke();
        if (ar.theme === 'ruins' && w < 60) {
          b.fillStyle = 'rgba(0,0,0,.16)';
          for (let py = y + 24; py < y + h; py += 26) b.fillRect(x - 2, py, w + 4, 2);
        }
      }
      return [ca, cb];
    }
    function drawBg(ctx, S, V, sh, dt) {
      if (!V.bgA || V.bgFor !== S.arena) { [V.bgA, V.bgB] = makeBg(S, sh.dpr()); V.bgFor = S.arena; V.cl = null; }
      ctx.drawImage(V.bgA, 0, 0, RW, RH);
      const th = THEMES[ARENAS[S.arena].theme];
      if (!V.cl) { const R = seeded(S.arena + 5); V.cl = Array.from({ length: 7 }, () => ({ x: R() * RW, y: 40 + R() * 190, s: .6 + R() * .9, v: 3 + R() * 7 })); }
      ctx.fillStyle = 'rgba(255,255,255,' + (.55 * th.cloud) + ')';
      for (const c of V.cl) {
        c.x += c.v * dt; if (c.x > RW + 120) c.x = -120;
        ctx.beginPath(); ctx.ellipse(c.x, c.y, 48 * c.s, 15 * c.s, 0, 0, TAU); ctx.ellipse(c.x - 26 * c.s, c.y + 4 * c.s, 30 * c.s, 11 * c.s, 0, 0, TAU); ctx.ellipse(c.x + 28 * c.s, c.y + 5 * c.s, 32 * c.s, 11 * c.s, 0, 0, TAU); ctx.ellipse(c.x + 4 * c.s, c.y - 10 * c.s, 28 * c.s, 14 * c.s, 0, 0, TAU); ctx.fill();
      }
      ctx.drawImage(V.bgB, 0, 0, RW, RH);
    }

    function wob(a, i) { return a.x[i] + 0; }
    function limb(ctx, a, i, j, k, w, c) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a.x[i], a.y[i]); ctx.lineTo(a.x[j], a.y[j]); ctx.lineTo(a.x[k], a.y[k]); ctx.stroke();
    }
    function drawArrowShape(ctx, x, y, ang, ty, len, t, own) {
      const c = Math.cos(ang), s = Math.sin(ang);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.strokeStyle = '#e1cfa0'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = own || '#e8e8e8';
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(-len + 9, -4); ctx.lineTo(-len + 11, 0); ctx.lineTo(-len + 9, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#cfd6dd';
      if (ty === 'bomb') {
        ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(4, 0, 7, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(4, 0, 7, 0, TAU); ctx.stroke();
        ctx.fillStyle = Math.sin(t * 30) > 0 ? '#ff5a2a' : '#ffd24a'; ctx.beginPath(); ctx.arc(-2, -6, 2.6, 0, TAU); ctx.fill();
      } else if (ty === 'fire') {
        ctx.fillStyle = '#ff8a1a'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-1, -4); ctx.lineTo(-1, 4); ctx.closePath(); ctx.fill();
        const g = ctx.createRadialGradient(8, 0, 1, 8, 0, 13); g.addColorStop(0, 'rgba(255,220,100,.95)'); g.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(8, 0, 13, 0, TAU); ctx.fill();
      } else if (ty === 'ice') {
        ctx.fillStyle = '#bff1ff'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(2, -4.5); ctx.lineTo(-2, 0); ctx.lineTo(2, 4.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6fc7ee'; ctx.lineWidth = 1; ctx.stroke();
      } else if (ty === 'lightning') {
        ctx.fillStyle = '#e6d4ff'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(0, -4); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(200,160,255,.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-6, -3); ctx.lineTo(-2, 4); ctx.lineTo(3, -4); ctx.lineTo(8, 4); ctx.stroke();
      } else if (ty === 'triple') {
        ctx.fillStyle = '#ffd447'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(0, -4.5); ctx.lineTo(0, 4.5); ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(0, -3.6); ctx.lineTo(0, 3.6); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    function drawHat(ctx, a, hx, hy, f, s, t) {
      const h = a.hat;
      if (h === 'band') {
        ctx.fillStyle = a.band; ctx.save(); ctx.translate(hx, hy - 3 * s); ctx.rotate(f * -.08);
        ctx.fillRect(-10 * s, -2.2 * s, 20 * s, 4.4 * s); ctx.restore();
        ctx.strokeStyle = a.band; ctx.lineWidth = 2.4 * s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx - f * 9 * s, hy - 3 * s);
        ctx.quadraticCurveTo(hx - f * (16 + Math.sin(t * 7) * 2) * s, hy - 1 * s, hx - f * (24 + Math.sin(t * 6) * 3) * s, hy - 5 * s + Math.sin(t * 8) * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx - f * 9 * s, hy - 3 * s);
        ctx.quadraticCurveTo(hx - f * (15 + Math.cos(t * 7) * 2) * s, hy + 3 * s, hy * 0 + hx - f * (21 + Math.cos(t * 5) * 3) * s, hy + 3 * s + Math.cos(t * 8) * 2); ctx.stroke();
      } else if (h === 'hood') {
        ctx.fillStyle = a.band; ctx.beginPath(); ctx.arc(hx, hy - 1 * s, 11.6 * s, Math.PI * 1.02, Math.PI * 2.05); ctx.lineTo(hx + f * 13 * s, hy + 5 * s); ctx.lineTo(hx - f * 12 * s, hy + 8 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#0d1512'; ctx.beginPath(); ctx.ellipse(hx + f * 3 * s, hy + 1 * s, 7 * s, 8 * s, 0, 0, TAU); ctx.fill();
      } else if (h === 'wiz') {
        ctx.fillStyle = a.band; ctx.beginPath(); ctx.ellipse(hx, hy - 6 * s, 15 * s, 4 * s, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(hx - 9 * s, hy - 7 * s); ctx.quadraticCurveTo(hx - f * 2 * s, hy - 22 * s, hx - f * 14 * s, hy - 34 * s); ctx.quadraticCurveTo(hx + f * 4 * s, hy - 24 * s, hx + 9 * s, hy - 7 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe36a'; ctx.beginPath(); ctx.arc(hx, hy - 9 * s, 1.8 * s, 0, TAU); ctx.fill();
      } else if (h === 'helm') {
        ctx.fillStyle = a.band; ctx.beginPath(); ctx.arc(hx, hy - 1 * s, 12.5 * s, Math.PI, TAU); ctx.lineTo(hx + 12.5 * s, hy + 3 * s); ctx.lineTo(hx - 12.5 * s, hy + 3 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7d8798'; ctx.fillRect(hx + f * 3 * s - 1.2 * s, hy - 2 * s, 2.4 * s, 10 * s);
        ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy - 1 * s, 12.5 * s, Math.PI, TAU); ctx.stroke();
      } else if (h === 'crown') {
        ctx.fillStyle = a.band; ctx.beginPath(); ctx.moveTo(hx - 10 * s, hy - 7 * s); ctx.lineTo(hx - 11 * s, hy - 19 * s); ctx.lineTo(hx - 5 * s, hy - 12 * s); ctx.lineTo(hx, hy - 21 * s); ctx.lineTo(hx + 5 * s, hy - 12 * s); ctx.lineTo(hx + 11 * s, hy - 19 * s); ctx.lineTo(hx + 10 * s, hy - 7 * s); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#e63a3a'; ctx.beginPath(); ctx.arc(hx, hy - 10 * s, 1.8 * s, 0, TAU); ctx.fill();
      }
    }
    function drawBow(ctx, a, S, V, t) {
      const s = a.sc, f = a.face, ca = Math.cos(a.aim), sa = Math.sin(a.aim);
      const hx = a.x[IHF], hy = a.y[IHF], nx = -sa, ny = ca, dw = a.draw;
      const tip = 25 * s, bend = dw * 7 * s;
      const x1 = hx + nx * tip - ca * bend, y1 = hy + ny * tip - sa * bend, x2 = hx - nx * tip - ca * bend, y2 = hy - ny * tip - sa * bend;
      const cx = hx + ca * (13 * s - dw * 3 * s) + 0, cy = hy + sa * (13 * s - dw * 3 * s);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3.6 * s;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
      ctx.strokeStyle = '#b98547'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
      const vib = a.rec > 0 ? Math.sin(t * 90) * a.rec * 3 : 0;
      ctx.strokeStyle = 'rgba(245,245,235,.9)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      if (dw > .03 && a.alive) ctx.lineTo(a.x[IHB], a.y[IHB]); else ctx.quadraticCurveTo((x1 + x2) / 2 + nx * vib, (y1 + y2) / 2 + ny * vib, x2, y2);
      if (dw > .03 && a.alive) ctx.lineTo(x2, y2);
      ctx.stroke();
      if (dw > .03 && a.alive && a.frozen <= 0) {
        const ty = a.sel || 'normal';
        drawArrowShape(ctx, a.x[IHB] + ca * 36 * s, a.y[IHB] + sa * 36 * s, a.aim, ty, 36 * s, t, a.band);
      }
    }
    function drawArcher(ctx, a, S, V, t, sh) {
      const s = a.sc, f = a.face, lw = 5.4 * s;
      const dead = !a.alive;
      const base = dead ? hex(a.col, .12) : a.col, dark = hex(a.col, -.28);
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const gy = Math.max(a.y[IFF], a.y[IFB]);
      if (!dead || a.hot) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(a.x[IP], gy + 3, 22 * s, 4.5 * s, 0, 0, TAU); ctx.fill(); }
      limb(ctx, a, IP, IKB, IFB, lw, dark);
      limb(ctx, a, IN, IEB, IHB, lw * .9, dark);
      ctx.strokeStyle = base; ctx.lineWidth = lw * 1.25;
      ctx.beginPath(); ctx.moveTo(a.x[IN], a.y[IN]); ctx.lineTo(a.x[IP], a.y[IP]); ctx.stroke();
      limb(ctx, a, IP, IKF, IFF, lw, base);
      ctx.fillStyle = '#e8d2b0';
      ctx.fillStyle = base;
      ctx.strokeStyle = base; ctx.lineWidth = lw * .9;
      ctx.beginPath(); ctx.moveTo(a.x[IN], a.y[IN]); ctx.lineTo(a.x[IH], a.y[IH]); ctx.stroke();
      ctx.fillStyle = base; ctx.beginPath(); ctx.arc(a.x[IH], a.y[IH], 10 * s, 0, TAU); ctx.fill();
      const hxx = a.x[IH], hyy = a.y[IH];
      const ang = Math.atan2(a.y[IH] - a.y[IN], a.x[IH] - a.x[IN]);
      const ex = hxx + Math.cos(ang + Math.PI / 2) * 0, ey = hyy;
      if (a.hat !== 'hood') {
        if (dead) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; const ox = hxx + f * 4.2 * s, oy = hyy - 1 * s; ctx.beginPath(); ctx.moveTo(ox - 2.4, oy - 2.4); ctx.lineTo(ox + 2.4, oy + 2.4); ctx.moveTo(ox + 2.4, oy - 2.4); ctx.lineTo(ox - 2.4, oy + 2.4); ctx.stroke(); }
        else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hxx + f * 4.2 * s, hyy - 1 * s, 2.7 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(hxx + f * 5 * s, hyy - 1 * s, 1.3 * s, 0, TAU); ctx.fill(); }
      } else {
        ctx.fillStyle = dead ? '#999' : '#fff'; ctx.beginPath(); ctx.arc(hxx + f * 4.8 * s, hyy + 0, 1.8 * s, 0, TAU); ctx.fill();
      }
      drawHat(ctx, a, hxx, hyy, f, s, t);
      if (a.alive) { ctx.strokeStyle = a.band; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(a.x[IN] - 5 * s * f, a.y[IN] + 1); ctx.lineTo(a.x[IN] + 5 * s * f, a.y[IN] + 2); ctx.stroke(); }
      limb(ctx, a, IN, IEF, IHF, lw * .95, base);
      drawBow(ctx, a, S, V, t);
      ctx.fillStyle = a.alive ? '#e8d2b0' : '#c9b79b';
      for (const i of [IHF, IHB]) { ctx.beginPath(); ctx.arc(a.x[i], a.y[i], 2.4 * s, 0, TAU); ctx.fill(); }
      if (a.flash > 0) {
        ctx.globalAlpha = Math.min(.85, a.flash * 7);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = lw * 1.4;
        ctx.beginPath(); ctx.moveTo(a.x[IN], a.y[IN]); ctx.lineTo(a.x[IP], a.y[IP]); ctx.stroke();
        ctx.beginPath(); ctx.arc(a.x[IH], a.y[IH], 10.5 * s, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (const k of a.stk) {
        const px = a.x[k.i] + (a.x[k.j] - a.x[k.i]) * k.t, py = a.y[k.i] + (a.y[k.j] - a.y[k.i]) * k.t;
        const fr = bodyFrame(a, k.i, k.j), c = Math.cos(fr), sn = Math.sin(fr);
        const tx = px + k.ox * c - k.oy * sn, ty2 = py + k.ox * sn + k.oy * c;
        drawArrowShape(ctx, tx + Math.cos(fr + k.r) * 4, ty2 + Math.sin(fr + k.r) * 4, fr + k.r, k.ty === 'bomb' ? 'normal' : k.ty, 30 * s, t, a.band);
      }
      if (a.frozen > 0) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (let i = 0; i < 11; i++) { x0 = Math.min(x0, a.x[i]); x1 = Math.max(x1, a.x[i]); y0 = Math.min(y0, a.y[i]); y1 = Math.max(y1, a.y[i]); }
        x0 -= 18; x1 += 18; y0 -= 20; y1 += 6;
        const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(200,245,255,.62)'); g.addColorStop(1, 'rgba(120,200,240,.45)');
        ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0 + 8, y0); ctx.lineTo(x1 - 6, y0 + 4); ctx.lineTo(x1, y0 + 24); ctx.lineTo(x1 - 4, y1); ctx.lineTo(x0 + 4, y1); ctx.lineTo(x0, y0 + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(x0 + 12, y0 + 10); ctx.lineTo(x0 + 22, y0 + 40); ctx.moveTo(x1 - 14, y0 + 16); ctx.lineTo(x1 - 8, y0 + 36); ctx.stroke();
      }
      if (a.stun > 0) {
        ctx.strokeStyle = '#e6d4ff'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const an = t * 9 + i * 2.1, r = 17 * s;
          ctx.beginPath(); ctx.moveTo(a.x[IH] + Math.cos(an) * r, a.y[IH] - 16 * s + Math.sin(an) * 5);
          ctx.lineTo(a.x[IH] + Math.cos(an + .3) * (r + 5), a.y[IH] - 16 * s + Math.sin(an + .3) * 6 - 3); ctx.stroke();
        }
      }
      ctx.restore();
    }
    function drawHpBar(ctx, a, V, sh) {
      if (!a.alive && a.dieT > 1) return;
      const w = 52 * Math.max(1, a.sc * .9), x = a.x[IH] - w / 2, y = a.y[IH] - 30 * a.sc - (a.hat === 'wiz' || a.hat === 'crown' ? 12 : 0);
      const fr = clamp(a.hp / a.mhp, 0, 1);
      ctx.globalAlpha = a.alive ? 1 : Math.max(0, 1 - a.dieT);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, x - 1.5, y - 1.5, w + 3, 8, 4); ctx.fill();
      ctx.fillStyle = fr > .5 ? '#46d36a' : fr > .25 ? '#f1c232' : '#ef4a3c';
      if (fr > 0) { rrect(ctx, x, y, Math.max(3, w * fr), 5, 2.5); ctx.fill(); }
      if (a.team === 1 && a.name && S0.mode === 'waves') txtC(ctx, T(a.name), a.x[IH], y - 8, 10, '#fff', 'center', 800, 'rgba(0,0,0,.6)', TXD);
      ctx.globalAlpha = 1;
    }
    let S0 = { mode: 'waves' }, TXD = 1;

    function drawFx(ctx, V, S, dt) {
      for (const b of V.booms) {
        b.t += dt; const k = b.t / .5;
        if (k > 1) continue;
        const g = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.R * (.5 + k));
        g.addColorStop(0, 'rgba(255,240,170,' + (.95 * (1 - k)) + ')'); g.addColorStop(.5, 'rgba(255,140,40,' + (.7 * (1 - k)) + ')'); g.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.R * (.5 + k), 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,' + (.8 * (1 - k)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, b.R * k * 1.15, 0, TAU); ctx.stroke();
      }
      V.booms = V.booms.filter(b => b.t < .5);
      for (const b of V.bolts) {
        b.t += dt;
        const k = 1 - b.t / .35;
        if (k <= 0) continue;
        const R = seeded(Math.floor(b.seed + b.t * 40));
        const x0 = b.kind ? b.x0 : b.x + (R() - .5) * 60, y0 = b.kind ? b.y0 : -20;
        ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.6);
        for (const [w, c] of [[9, 'rgba(180,140,255,.35)'], [3.2, '#fff']]) {
          ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(x0, y0);
          const n = 9; for (let i = 1; i < n; i++) { const u = i / n; ctx.lineTo(x0 + (b.x - x0) * u + (R() - .5) * 38, y0 + (b.y - y0) * u + (R() - .5) * 20); }
          ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.restore();
      }
      V.bolts = V.bolts.filter(b => b.t < .35);
      for (const p of V.parts) {
        p.life -= dt;
        if (p.life <= 0) continue;
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
        const k = p.life / p.max;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = p.col;
        if (p.kind === 'flame') { const z = p.size * (.4 + k); ctx.fillRect(p.x - z, p.y - z, z * 2, z * 2); }
        else if (p.kind === 'smoke') { ctx.globalAlpha = k * .35; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (2 - k), 0, TAU); ctx.fill(); }
        else if (p.kind === 'ice') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.life * 3); ctx.fillRect(-p.size, -p.size * .4, p.size * 2, p.size * .8); ctx.restore(); }
        else { const z = Math.max(.5, p.size * k); ctx.fillRect(p.x - z, p.y - z, z * 2, z * 2); }
      }
      ctx.globalAlpha = 1;
      V.parts = V.parts.filter(p => p.life > 0);
    }
    function drawPops(ctx, V, dt) {
      for (const p of V.pops) {
        p.life -= dt;
        if (p.life <= 0) continue;
        const k = p.life / p.max, u = 1 - k;
        p.y -= 26 * dt;
        ctx.globalAlpha = Math.min(1, k * 2.2);
        txtC(ctx, p.text, p.x, p.y, p.size, p.col, 'center', 900, 'rgba(0,0,0,.65)', TXD, 1 + Math.max(0, .5 - u * 4) * .6);
      }
      ctx.globalAlpha = 1;
      V.pops = V.pops.filter(p => p.life > 0);
    }
    function ambient(V, S, a, dt) {
      if (a.burn > 0 && a.alive) {
        for (let n = 0; n < 2; n++) { const i = [IH, IN, IP, IKF, IHF][Math.random() * 5 | 0]; pt(V, a.x[i] + rnd(-4, 4), a.y[i] + rnd(-4, 4), rnd(-14, 14), rnd(-70, -30), .5, 3.4, pick(['#ff8a1a', '#ffd24a', '#ff4a1a']), 'flame', -50); }
        if (Math.random() < .15) pt(V, a.x[IH], a.y[IH] - 10, rnd(-10, 10), -40, .9, 3, '#333', 'smoke', -30);
      }
    }
    function drawPreview(ctx, S, V, sh, me) {
      const a = S.ar[me];
      const inp = sh.inp;
      if (!a || !a.alive || !inp.aiming || sh.opt.prev === 0 || a.frozen > 0 || a.stun > 0) return;
      const eff = effPower(a, inp.p, inp.ty);
      if (eff < .1) return;
      const v = VMIN + (VMAX - VMIN) * eff;
      const ca = Math.cos(inp.ang), sa = Math.sin(inp.ang);
      arPose(Object.assign({}, a, { aim: inp.ang, draw: inp.p, face: ca >= 0 ? 1 : -1 }), tpose);
      const mx = tpose.x[IHF] + ca * 8 * a.sc, my = tpose.y[IHF] + sa * 8 * a.sc;
      const r = ballistic(S, a.team, mx, my, v, inp.ang, sh.opt.prev === 2 ? 1 : 2.4, true);
      const pts = r.pts, n = pts.length / 2, lim = sh.opt.prev === 2 ? Math.min(n, 12) : n;
      for (let i = 0; i < lim; i++) {
        const k = 1 - i / (lim + 4);
        ctx.fillStyle = 'rgba(255,255,255,' + (.2 + .75 * k) + ')';
        ctx.beginPath(); ctx.arc(pts[i * 2], pts[i * 2 + 1], 1.6 + 1.7 * k, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,' + (.25 * k) + ')'; ctx.lineWidth = 1; ctx.stroke();
      }
      if (sh.opt.prev !== 2 && r.end.k !== 'time' && r.end.k !== 'out') {
        ctx.strokeStyle = r.end.k === 'body' ? '#ffdf4d' : '#fff'; ctx.lineWidth = 2.2;
        const ex = r.end.x, ey = r.end.y;
        ctx.beginPath(); ctx.moveTo(ex - 5, ey - 5); ctx.lineTo(ex + 5, ey + 5); ctx.moveTo(ex + 5, ey - 5); ctx.lineTo(ex - 5, ey + 5); ctx.stroke();
      }
    }
    function effPower(a, p, ty) {
      const xc = TXC[ty] || 0;
      const cost = 8 + 26 * p + xc;
      if (a.st >= cost) return p;
      return clamp((a.st - 8 - xc) / 26, 0, p);
    }

    function drawHud(ctx0, S, V, sh) {
      const RW = sh.port ? sh.port.cw : 960, RH0 = sh.port ? sh.port.ch : RH;
      const me = S.ar[sh.me] || S.ar[0];
      const pad = 14, duel0 = S.mode === 'duel';
      let hk = S.mode + '|' + sh.me + '|' + S.wave + '|' + S.rnd + '|' + S.score[0] + '|' + S.score[1] + '|' + (S.meta ? S.meta.coins : 0) + '|' + TXD + '|' + RW;
      for (const q of S.ar) hk += '|' + q.name + ':' + Math.ceil(q.hp) + ':' + q.mhp + ':' + (q.alive ? 1 : 0);
      const d = TXD;
      if (!V.hudC || V.hudK !== hk) {
        if (!V.hudC) V.hudC = document.createElement('canvas');
        const hc = V.hudC, hh = 80;
        if (hc.width !== Math.ceil(RW * d) || hc.height !== Math.ceil(hh * d)) { hc.width = Math.ceil(RW * d); hc.height = Math.ceil(hh * d); }
        const x = hc.getContext('2d');
        x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, RW, hh);
        V.hudK = hk;
        hudStatic(x, S, V, sh, RW, me, pad);
      }
      ctx0.drawImage(V.hudC, 0, 0, RW, 80);
      const ctx = ctx0;
      const meRight0 = duel0 && sh.me === 1, sx0 = meRight0 ? RW - pad - 150 : pad;
      ctx.fillStyle = 'rgba(8,12,28,.62)'; rrect(ctx, sx0 - 3, 43, 156, 14, 7); ctx.fill();
      ctx.fillStyle = '#2b3350'; rrect(ctx, sx0, 46, 150, 8, 4); ctx.fill();
      const sf = clamp(me.st / me.mst, 0, 1);
      if (sf > .001) { ctx.fillStyle = '#f2b72e'; rrect(ctx, sx0, 46, Math.max(8, 150 * sf), 8, 4); ctx.fill(); }
      const inp = sh.inp;
      if (inp.aiming && me.alive) {
        const cost = (8 + 26 * inp.p + (TXC[inp.ty] || 0)) / me.mst;
        ctx.fillStyle = me.st >= cost * me.mst ? 'rgba(255,255,255,.55)' : 'rgba(255,70,60,.8)';
        ctx.fillRect(sx0 + 150 * clamp(me.st / me.mst - 0, 0, 1) - 1, 43, 2, 14);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(sx0 + 150 * clamp(cost, 0, 1) - 1, 43, 2, 14);
      }
      if (V.bannerT > 0) {
        const k = V.bannerT;
        ctx.globalAlpha = Math.min(1, k * 2);
        txtC(ctx, V.banner, RW / 2, 150, 54, '#fff', 'center', 900, 'rgba(0,0,0,.7)', TXD, 1 + (1 - k) * 12 / 54);
        if (V.sub) txtC(ctx, V.sub, RW / 2, 196, 18, '#fff', 'center', 800, 'rgba(0,0,0,.6)', TXD);
        ctx.globalAlpha = 1;
      }
    }
    function hudStatic(ctx, S, V, sh, RW, me, pad) {
      const bar = (x, y, w, h, fr, c1, c2, label) => {
        ctx.fillStyle = 'rgba(8,12,28,.62)'; rrect(ctx, x - 3, y - 3, w + 6, h + 6, h / 2 + 3); ctx.fill();
        ctx.fillStyle = c2; rrect(ctx, x, y, w, h, h / 2); ctx.fill();
        if (fr > 0.001) { const gk = y + '|' + h + '|' + c1[0] + c1[1]; let g = V.grad && V.grad.get(gk); if (!g) { if (!V.grad) V.grad = new Map(); g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1[0]); g.addColorStop(1, c1[1]); V.grad.set(gk, g); } ctx.fillStyle = g; rrect(ctx, x, y, Math.max(h, w * fr), h, h / 2); ctx.fill(); }
        if (label) txtC(ctx, label, x + 10, y + h / 2 + .5, h * .72, '#fff', 'left', 900, 'rgba(0,0,0,.5)', TXD);
      };
      const duel = S.mode === 'duel';
      const L = duel ? S.ar[0] : me;
      const meRight = duel && sh.me === 1;
      const mx = meRight ? RW - pad - 150 : pad;
      txtC(ctx, T(L.name), pad, 14, 13, duel && L === me ? '#ffe28a' : '#fff', 'left', 900, 'rgba(0,0,0,.6)', TXD);
      bar(pad, 24, 190, 14, clamp(L.hp / L.mhp, 0, 1), ['#58e07a', '#2aa84d'], '#2b3350', Math.ceil(L.hp) + '/' + L.mhp);
      const en = duel ? [S.ar[1]] : S.ar.filter(q => q !== me && q.team !== me.team);
      en.slice(0, 3).forEach((q, i) => {
        const x = RW - pad - 190, y = 24 + i * 24;
        if (i === 0) txtC(ctx, S.mode === 'waves' ? T('Enemy') : T(q.name), RW - pad, 14, 13, meRight ? '#ffe28a' : '#fff', 'right', 900, 'rgba(0,0,0,.6)', TXD);
        bar(x, y, 190, i ? 10 : 14, clamp(q.hp / q.mhp, 0, 1), ['#ff7a6a', '#d9392b'], '#2b3350', i ? null : Math.ceil(q.hp) + '/' + q.mhp);
        if (i && q.alive === false) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x, y, 190, 10); }
      });
      if (S.mode === 'waves') {
        txtC(ctx, T('WAVE {n}', { n: S.wave }), RW / 2, 16, 20, '#fff', 'center', 900, 'rgba(0,0,0,.65)', TXD);
        ctx.fillStyle = '#ffd447'; ctx.beginPath(); ctx.arc(RW / 2 - 28, 40, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.stroke();
        txtC(ctx, '' + S.meta.coins, RW / 2 - 16, 41, 15, '#fff', 'left', 900, 'rgba(0,0,0,.6)', TXD);
      } else {
        txtC(ctx, S.score[0] + '  -  ' + S.score[1], RW / 2, 18, 26, '#fff', 'center', 900, 'rgba(0,0,0,.65)', TXD);
        txtC(ctx, T('ROUND {n}', { n: S.rnd }) + (S.cfg.need ? '  ·  ' + T('first to {n}', { n: S.cfg.need }) : ''), RW / 2, 40, 11, 'rgba(255,255,255,.85)', 'center', 800, 'rgba(0,0,0,.5)', TXD);
      }
    }
    function drawAimUi(ctx, S, V, sh, part) {
      const inp = sh.inp, a = S.ar[sh.me];
      if (!a || !inp.aiming || !a.alive) return;
      if (part !== 'w' && inp.sx != null && inp.ptr) {
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(inp.sx, inp.sy); ctx.lineTo(inp.cx, inp.cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(inp.sx, inp.sy, 5, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(inp.cx, inp.cy, 9, 0, TAU); ctx.stroke();
      }
      if (part === 's') return;
      const px = a.x[IN], py = a.y[IN] + 3, r = 42 * a.sc;
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(px, py, r, inp.ang - 1.2, inp.ang + 1.2); ctx.stroke();
      const eff = effPower(a, inp.p, inp.ty);
      const col = inp.p < .5 ? '#7bdc65' : inp.p < .8 ? '#ffd447' : '#ff6a4a';
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(px, py, r, inp.ang - 1.2, inp.ang - 1.2 + 2.4 * inp.p); ctx.stroke();
      if (eff < inp.p - .01) { ctx.strokeStyle = 'rgba(255,70,60,.95)'; ctx.beginPath(); ctx.arc(px, py, r + 7, inp.ang - 1.2 + 2.4 * eff, inp.ang - 1.2 + 2.4 * inp.p); ctx.stroke(); }
      txtC(ctx, Math.round(inp.p * 100) + '%', px + Math.cos(inp.ang) * (r + 20), py + Math.sin(inp.ang) * (r + 20), 12, '#fff', 'center', 900, 'rgba(0,0,0,.65)', TXD);
    }

    function renderAll(ctx, S, V, sh, dt) {
      S0 = S; TXD = sh.dpr();
      const PO = sh.port;
      if (PO) { ctx.save(); ctx.scale(PO.k, PO.k); ctx.translate(-PO.x0, 0); }
      ctx.save();
      const slowK = V.slow > 0 ? Math.min(1, V.slow * 2) : 0;
      let z = 1 + .18 * slowK;
      if (V.shake > .1) { ctx.translate((Math.random() - .5) * V.shake, (Math.random() - .5) * V.shake); }
      if (z > 1.001) { ctx.translate(V.zx, V.zy); ctx.scale(z, z); ctx.translate(-V.zx, -V.zy); }
      drawBg(ctx, S, V, sh, dt);
      for (const t of S.terr) {
        const fade = Math.min(1, t.life / 1.2);
        ctx.globalAlpha = fade;
        drawArrowShape(ctx, t.x + Math.cos(t.a) * 3, t.y + Math.sin(t.a) * 3, t.a, t.ty === 'bomb' ? 'normal' : t.ty, 30, V.t, '#ddd');
        ctx.globalAlpha = 1;
        if (t.ty === 'fire' && t.life > 0 && Math.random() < .3) pt(V, t.x, t.y - 4, rnd(-8, 8), -60, .45, 2.6, pick(['#ff8a1a', '#ffd24a']), 'flame', -40);
      }
      for (const a of S.ar) { ambient(V, S, a, dt); drawArcher(ctx, a, S, V, V.t, sh); }
      for (const A of S.arrows) {
        const ang = Math.atan2(A.vy, A.vx);
        drawArrowShape(ctx, A.x, A.y, ang, A.type, 34, V.t, S.ar[A.own] ? S.ar[A.own].band : '#fff');
        if (A.type === 'fire' && Math.random() < .8) pt(V, A.x - Math.cos(ang) * 14, A.y - Math.sin(ang) * 14, rnd(-20, 20), rnd(-40, 10), .35, 3, pick(['#ff8a1a', '#ffd24a', '#ff5a1a']), 'flame', -30);
        else if (A.type === 'ice' && Math.random() < .6) pt(V, A.x - Math.cos(ang) * 10, A.y - Math.sin(ang) * 10, rnd(-20, 20), rnd(-20, 20), .4, 2.4, '#c8f4ff', 'ice', 0);
        else if (A.type === 'lightning' && Math.random() < .5) pt(V, A.x + rnd(-6, 6), A.y + rnd(-6, 6), rnd(-60, 60), rnd(-60, 60), .22, 2, '#e6d4ff', 'dot', 0);
        else if (A.type === 'bomb' && Math.random() < .5) pt(V, A.x - 6, A.y - 8, rnd(-10, 10), -30, .5, 2.4, '#ffb347', 'dot', 0);
        else if (A.type === 'triple' && Math.random() < .4) pt(V, A.x, A.y, rnd(-10, 10), rnd(-10, 10), .3, 2, '#ffd447', 'dot', 0);
        else if (Math.random() < .3) pt(V, A.x, A.y, 0, 0, .25, 1.4, 'rgba(255,255,255,.8)', 'dot', 0);
      }
      drawFx(ctx, V, S, dt);
      for (const a of S.ar) drawHpBar(ctx, a, V, sh);
      drawPreview(ctx, S, V, sh, sh.me);
      drawPops(ctx, V, dt);
      ctx.restore();
      if (V.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.4, V.flash) + ')'; ctx.fillRect(0, 0, RW, RH); }
      if (S.theme === 'snow') { }
      const th = THEMES[ARENAS[S.arena].theme];
      if (th.snow) {
        if (V.snow.length < 90) for (let i = V.snow.length; i < 90; i++) V.snow.push({ x: Math.random() * RW, y: Math.random() * RH, s: .6 + Math.random() * 1.8, v: 20 + Math.random() * 40, w: Math.random() * 6 });
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath();
        for (const f of V.snow) { f.y += f.v * dt; f.x += Math.sin(V.t * 1.3 + f.w) * 14 * dt; if (f.y > RH) { f.y = -4; f.x = Math.random() * RW; } ctx.moveTo(f.x + f.s, f.y); ctx.arc(f.x, f.y, f.s, 0, TAU); }
        ctx.fill();
      }
      if (V.slow > 0) { const g = ctx.createRadialGradient(RW / 2, RH / 2, 240, RW / 2, RH / 2, 620); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (.5 * slowK) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, RW, RH); }
      if (PO) { drawAimUi(ctx, S, V, sh, 'w'); ctx.restore(); }
      drawHud(ctx, S, V, sh);
      drawAimUi(ctx, S, V, sh, PO ? 's' : null);
      if (PO) {
        for (const q of S.ar) {
          if (q.team === (S.ar[sh.me] || S.ar[0]).team || !q.alive) continue;
          const hx = (q.x[IH] - PO.x0) * PO.k, hy = q.y[IH] * PO.k;
          if (hx >= 0 && hx <= PO.cw) continue;
          const ex = hx < 0 ? 16 : PO.cw - 16, dir = hx < 0 ? -1 : 1, yy = clamp(hy, 70, PO.ch - 30);
          ctx.fillStyle = 'rgba(8,12,28,.62)'; ctx.beginPath(); ctx.arc(ex - dir * 4, yy, 15, 0, TAU); ctx.fill();
          ctx.fillStyle = q.band; ctx.beginPath(); ctx.moveTo(ex + dir * 8, yy); ctx.lineTo(ex - dir * 6, yy - 9); ctx.lineTo(ex - dir * 6, yy + 9); ctx.closePath(); ctx.fill();
        }
      }
    }

    const RA_CSS = `
.gm-quiver-clash .ra-types{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px auto 0;max-width:960px;width:100%}
.gm-quiver-clash .ra-ty{appearance:none;display:flex;align-items:center;gap:7px;border:2px solid rgba(255,255,255,.16);background:rgba(14,22,48,.92);color:#eaf0ff;border-radius:12px;padding:6px 10px;font:800 12px/1 ${FONT};cursor:pointer;min-height:42px;position:relative}
.gm-quiver-clash .ra-ty svg{width:30px;height:16px;flex:none}
.gm-quiver-clash .ra-ty b{font-weight:900;font-size:11px;letter-spacing:.02em;display:block}
.gm-quiver-clash .ra-ty small{display:block;font-weight:700;opacity:.7;font-size:10px;margin-top:2px}
.gm-quiver-clash .ra-ty kbd{font:800 9px ${FONT};background:rgba(255,255,255,.16);color:#eaf0ff;border:0;box-shadow:none;border-radius:4px;padding:1px 4px;margin-left:4px;display:inline-block;min-width:0}
.gm-quiver-clash .ra-ty.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 45%,#101a3c)}
.gm-quiver-clash .ra-ty.off{opacity:.38}
.gm-quiver-clash .ra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:8px}
.gm-quiver-clash .ra-card{display:flex;flex-direction:column;gap:6px;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;font-family:${FONT}}
.gm-quiver-clash .ra-card h4{margin:0;font:900 14px/1.1 ${FONT}}
.gm-quiver-clash .ra-card p{margin:0;font:600 11px/1.35 ${FONT};opacity:.75}
.gm-quiver-clash .ra-pips{display:flex;gap:3px}
.gm-quiver-clash .ra-pips i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.14)}
.gm-quiver-clash .ra-pips i.on{background:var(--ac)}
.gm-quiver-clash .ra-buy{appearance:none;border:0;border-radius:10px;padding:8px 10px;font:900 12px/1 ${FONT};color:#1a1200;background:#ffd447;cursor:pointer;min-height:34px}
.gm-quiver-clash .ra-buy:disabled{opacity:.35;pointer-events:none}
.gm-quiver-clash .ra-buy.alt{background:#2c3a66;color:#eaf0ff}
.gm-quiver-clash .ra-coins{font:900 20px/1 ${FONT};color:#ffd447}
.gm-quiver-clash .ra-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
`;
    const TYSVG = ty => {
      const c = TCOL[ty];
      const tip = { normal: `<path d="M26 8 L19 4.5 L19 11.5Z" fill="#cfd6dd"/>`, fire: `<path d="M27 8 L19 4.5 L19 11.5Z" fill="#ff8a1a"/><circle cx="23" cy="8" r="4.5" fill="#ffd24a" opacity=".6"/>`, ice: `<path d="M28 8 L21 4 L17 8 L21 12Z" fill="#bff1ff" stroke="#6fc7ee"/>`, bomb: `<circle cx="23" cy="8" r="5.5" fill="#2a2a30" stroke="#aaa"/><circle cx="20" cy="3" r="1.6" fill="#ff7a2a"/>`, triple: `<path d="M27 8 L19 4.5 L19 11.5Z" fill="#ffd447"/><path d="M26 3 L20 2 M26 13 L20 14" stroke="#ffd447" stroke-width="1.4"/>`, lightning: `<path d="M27 8 L19 4.5 L19 11.5Z" fill="#e6d4ff"/><path d="M13 5 L16 11 L19 4 L22 11" stroke="#c9a6ff" fill="none" stroke-width="1.3"/>` }[ty];
      return `<svg viewBox="0 0 30 16"><path d="M2 8 L20 8" stroke="#d9c9a0" stroke-width="2.4" stroke-linecap="round"/><path d="M2 8 L7 4 M2 8 L7 12" stroke="${ty === 'normal' ? '#e8e8e8' : c}" stroke-width="2" stroke-linecap="round"/>${tip}</svg>`;
    };
    const UPG = [
      { k: 'pow', n: 'Power', d: '+9% arrow damage', base: 34, max: 10 },
      { k: 'hp', n: 'Vitality', d: '+16 max health', base: 30, max: 10 },
      { k: 'stam', n: 'Stamina', d: '+12 stamina, faster regen', base: 30, max: 8 },
      { k: 'armor', n: 'Armor', d: '-5% damage taken', base: 46, max: 8 },
      { k: 'crit', n: 'Deadeye', d: '+16% headshot damage', base: 40, max: 8 },
      { k: 'draw', n: 'Quick Draw', d: 'Shorter reload between shots', base: 34, max: 8 }
    ];
    const AMMO_COST = { fire: 10, ice: 12, bomb: 20, triple: 16, lightning: 22 };
    const upCost = (k, lvl) => Math.round(UPG.find(u => u.k === k).base * Math.pow(1.42, lvl));
    const freshMeta = () => ({ coins: 0, ammo: { fire: 3, ice: 2, bomb: 1, triple: 2, lightning: 1 }, upg: { pow: 0, hp: 0, stam: 0, armor: 0, crit: 0, draw: 0 }, hp: null });
    const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

    function packState(S) {
      const a = [];
      for (const q of S.ar) {
        for (let i = 0; i < 11; i++) a.push(r1(q.x[i]), r1(q.y[i]));
        a.push(r1(q.hp), r1(q.st), r2(Math.cos(q.aim)), r2(Math.sin(q.aim)), r2(q.draw));
      }
      const d = {
        ph: S.phase, pt: r2(S.pt), sc: S.score, rn: S.rnd, ov: S.over ? 1 : 0, w: S.win, ek: S.endKind || '',
        ar: S.arrows.map(A => [A.id, r1(A.x), r1(A.y), r1(A.vx), r1(A.vy), TYPES.indexOf(A.type), A.own, r2(A.pw)]),
        q: S.ar.map(q => [q.alive ? 1 : 0, r2(q.frozen), r2(q.burn), r2(q.stun), q.face, q.cd > 0 ? 1 : 0, q.ammo.fire | 0, q.ammo.ice | 0, q.ammo.bomb | 0, q.ammo.triple | 0, q.ammo.lightning | 0, q.mhp | 0])
      };
      return { a, d };
    }

    function mountArchers(root, api) {
      const ID = 'quiver-clash';
      const A = makeAudio(api);
      const PORT = matchMedia('(pointer: coarse)').matches && innerHeight > innerWidth * 1.15, CW = PORT ? 540 : RW, CH = PORT ? 860 : RH;
      const st = makeStage(root, api, ID, CW, CH, null);
      st.audio = A;
      const net = api.net;
      const invited = !!net.invite;
      const saved = api.load() || {};
      const opt = Object.assign({ diff: 1, aim: 'pull', prev: 1 }, saved.opt && typeof saved.opt === 'object' ? saved.opt : {});
      if (!DIFF[opt.diff]) opt.diff = 1;
      if (opt.aim !== 'push') opt.aim = 'pull';
      if (opt.prev !== 0 && opt.prev !== 2) opt.prev = 1;
      const life = Object.assign({ kills: 0, heads: 0, bestWave: 0, duels: 0 }, saved.life && typeof saved.life === 'object' ? saved.life : {});
      for (const k of ['kills', 'heads', 'bestWave', 'duels']) life[k] = Math.max(0, Math.floor(+life[k]) || 0);
      const persist = () => api.save({ opt, life });
      const typesEl = document.createElement('div');
      typesEl.className = 'ra-types';
      st.playEl.insertBefore(typesEl, st.padEl);
      const inp = { aiming: false, ang: -.6, p: 0, ty: 'normal', ptr: null, sx: 0, sy: 0, cx: 0, cy: 0, elev: .6, face: 1, charge: 0, keys: new Set(), kfire: false };
      const sh = { audio: A, me: 0, inp, opt, local: true, dpr: () => st.canvas.width / CW, port: PORT ? { k: CH / RH, cw: CW, ch: CH, x0: 0, x: RW / 2 } : null };
      let S = null, V = null, scr = 'menu', role = 'local', meta = null, acc = 0, rk = 0, seq = 0, lastC = '', lastCt = 0, snapT = 0, saveT = 0, lastScore = '', evq = [], off = 0, gK = -1, hooked = false, lobbying = false, typesKey = '', done = false, cfgBase = null, lastSnapMsg = null;
      const snaps = [];
      root.gpState = () => S && { scr, role, mode: S.mode, phase: S.phase, wave: S.wave, rnd: S.rnd, score: S.score.slice(), hp: S.ar.map(q => Math.round(q.hp)), alive: S.ar.map(q => q.alive), over: S.over, win: S.win, coins: meta ? meta.coins : 0 };
      const RK = 'gameplay:ra-' + ID;
      A.bank = {
        click() { A.tone('sine', 660, 900, .05, .12); },
        bow() { A.noise('bandpass', 2400, 600, 1.4, .14, .16, 0, .004); A.tone('triangle', 260, 90, .16, .13); A.tone('sine', 110, 70, .1, .1); },
        hit() { A.tone('triangle', 190, 70, .12, .16); A.noise('lowpass', 900, 200, .8, .1, .14); },
        crit() { A.tone('triangle', 230, 60, .18, .18); A.noise('lowpass', 1400, 200, .8, .14, .18); A.tone('sine', 1320, 1760, .25, .1, .02); A.tone('sine', 1760, 1760, .3, .06, .08); },
        thud() { A.tone('triangle', 130, 60, .1, .1); },
        thunk() { A.tone('square', 240, 120, .05, .07); A.noise('bandpass', 700, 300, 1, .06, .08); },
        die() { A.tone('sawtooth', 320, 70, .5, .1); A.noise('lowpass', 1000, 120, .8, .35, .16); },
        fall() { A.tone('sine', 900, 120, .9, .1); },
        boom() { A.noise('lowpass', 900, 70, .7, .7, .4, 0, .004); A.tone('sine', 110, 28, .6, .3); A.noise('bandpass', 2000, 300, 1, .25, .12); },
        zap() { for (let i = 0; i < 6; i++) A.noise('highpass', 1800 + i * 300, 1800, 3, .04, .1, i * .035, .002); A.tone('sawtooth', 900, 200, .15, .05); },
        bolt() { A.noise('highpass', 800, 3000, 1, .3, .22, 0, .002); A.noise('lowpass', 500, 60, .7, .6, .3, .03); A.tone('sawtooth', 1200, 100, .3, .08); },
        ign() { A.noise('bandpass', 900, 2600, .9, .35, .09, 0, .04); },
        ice() { [1568, 2093, 2637, 3136].forEach((f, i) => A.tone('sine', f, f * 1.01, .35, .05, i * .04)); },
        shatter() { A.noise('highpass', 3000, 6000, .8, .3, .2, 0, .002); for (let i = 0; i < 5; i++) A.tone('sine', rnd(2200, 4200), 2000, .15, .05, i * .03); },
        thaw() { A.tone('sine', 700, 500, .2, .05); },
        tired() { A.tone('sawtooth', 190, 110, .18, .08); },
        coin() { A.tone('sine', 988, 988, .06, .08); A.tone('sine', 1319, 1319, .14, .08, .06); },
        go() { A.tone('square', 660, 660, .1, .05); A.tone('square', 880, 880, .22, .06, .1); },
        win() { [523, 659, 784, 1047].forEach((f, i) => { A.tone('square', f, f, .2, .05, i * .12); A.tone('triangle', f / 2, f / 2, .26, .09, i * .12); }); A.tone('triangle', 1047, 1047, .6, .08, .5); },
        lose() { A.tone('sine', 330, 140, .6, .09); A.tone('triangle', 220, 90, .8, .08, .2); }
      };

      const emit = ev => { onEvent(V, S, ev, sh, false); if (role === 'host') evq.push(ev); trackEv(ev); };
      function trackEv(ev) {
        if (ev[0] === 'die' && S.mode === 'waves' && S.ar[ev[1]] && S.ar[ev[1]].team === 1) { life.kills++; if (ev[3]) life.heads++; }
      }
      const myIdx = () => sh.me;
      const showMenu = () => {
        const best = api.best;
        st.showMenu(`
<div class="gx-top"><h2 class="gx-logo" translate="no">Quiver <b>Clash</b></h2><div class="gx-row"><span class="gx-chip on" style="pointer-events:none"><span>Best wave</span> ${best || 0}</span><span class="gx-chip" style="pointer-events:none">${life.kills} <span>kills</span> · ${life.heads} <span>headshots</span></span></div></div>
<p class="gx-tag">Pull back, aim and let go. Headshots hit twice as hard. Don&#39;t fall off the cliff.</p>
<div class="gx-modes">
  <button type="button" class="gx-mode" data-a="waves"><b>Endless Waves</b><span>Fight wave after wave of AI archers. Earn coins, upgrade your bow, buy special arrows. Boss every 5th wave.</span></button>
  <button type="button" class="gx-mode" data-a="cpu"><b>Duel vs CPU</b><span>One on one, first to 2 rounds. Fire, ice, bomb, triple and storm arrows in every round.</span></button>
  <button type="button" class="gx-mode" data-a="online"><b>Online Duel</b><span>1v1 against a friend with a party code or invite link. The leader can fill the seat with a bot.</span></button>
</div>
${st.orow('Difficulty', st.chips('diff', DIFF.map((d, i) => [i, d.n]), opt.diff))}
${st.orow('Trajectory', st.chips('prev', [[1, 'Full'], [2, 'Short'], [0, 'Off']], opt.prev))}
${st.orow('Aim style', st.chips('aim', [['pull', 'Pull back'], ['push', 'Drag to aim']], opt.aim))}
<p class="gx-help"><kbd>&#128433;</kbd> <span>drag to aim, release to shoot</span> · <kbd>Space</kbd> <span>hold to draw, release to fire</span> · <kbd>&uarr;</kbd><kbd>&darr;</kbd> <span>angle</span> · <kbd>&larr;</kbd><kbd>&rarr;</kbd> <span>turn</span> · <kbd>1</kbd>-<kbd>6</kbd> <kbd>Q</kbd><kbd>E</kbd> <span>arrow type</span> · <kbd>Esc</kbd> <span>pause</span><br><span>Fire burns, ice freezes (hit frozen archers for extra damage), bombs knock archers off ledges, triple fires three, storm arrows stun and chain.</span> <span>Every shot costs stamina: stronger draws cost more.</span></p>`);
        scr = 'menu'; api.score('—');
      };
      st.onOpt = (k, v) => { opt[k] = v; persist(); A.play('click'); showMenu(); };

      const pickArena = (w, sym) => {
        const list = ARENAS.map((a, i) => i).filter(i => !sym || ARENAS[i].sym);
        return list[(w - 1 + (sym ? 0 : 0)) % list.length];
      };
      const typeHtml = () => {
        const me = S && S.ar[myIdx()];
        if (!me) return '';
        return TYPES.map((t, i) => {
          const n = t === 'normal' ? '&infin;' : (me.ammo[t] | 0);
          const off = t !== 'normal' && !(me.ammo[t] > 0);
          return `<button type="button" class="ra-ty${inp.ty === t ? ' on' : ''}${off ? ' off' : ''}" data-ty="${t}">${TYSVG(t)}<span><b>${TNAME[t]}${st.touch ? '' : `<kbd>${i + 1}</kbd>`}</b><small>${n}</small></span></button>`;
        }).join('');
      };
      typesEl.addEventListener('click', e => {
        const b = e.target.closest('[data-ty]');
        if (b) selType(b.dataset.ty);
      });
      function selType(t) {
        const me = S && S.ar[myIdx()];
        if (!me || (t !== 'normal' && !(me.ammo[t] > 0))) { A.play('tired', 150); return; }
        inp.ty = t; me.sel = t; A.play('click');
      }
      function cycleType(d) {
        const me = S && S.ar[myIdx()]; if (!me) return;
        let i = TYPES.indexOf(inp.ty);
        for (let n = 0; n < 6; n++) { i = (i + d + 6) % 6; const t = TYPES[i]; if (t === 'normal' || me.ammo[t] > 0) { selType(t); return; } }
      }

      function beginRound(cfg, resumeS) {
        done = false;
        S = resumeS || newState(cfg, meta || freshMeta());
        S.cfg = cfg;
        V = mkVis(S, sh);
        sh.me = role === 'guest' ? 1 : 0;
        sh.local = role === 'local';
        inp.aiming = false; inp.ptr = null; inp.charge = 0; inp.face = sh.me ? -1 : 1; inp.ty = 'normal'; inp.elev = .6;
        const me = S.ar[sh.me]; me.aim = inp.face > 0 ? -.6 : Math.PI + .6; inp.ang = me.aim;
        acc = 0; evq = []; snapT = 0; lastScore = ''; typesKey = '';
        if (S.mode === 'waves') {
          V.banner = S.wave % 5 === 0 ? T('BOSS WAVE {n}', { n: S.wave }) : T('WAVE {n}', { n: S.wave });
          V.sub = S.ar.filter(q => q.team === 1).map(q => T(q.name)).join(' · ');
        } else { V.banner = T('ROUND {n}', { n: S.rnd }); V.sub = T('{a} vs {b}', { a: T(S.ar[0].name), b: T(S.ar[1].name) }); }
        V.bannerT = 1;
        rk++;
        scr = 'play'; st.showPlay(); st.hideOv();
        if (role === 'host' && cfg.guestId && S.ar[1] && S.ar[1].ctl === 'net') S.ar[1].netId = cfg.guestId;
        renderOnce();
        if (role === 'host') sendCfgAll();
      }
      function portCam(dt) {
        const P = sh.port, vw = P.cw / P.k, me = S.ar[sh.me] || S.ar[0];
        let en = null;
        for (const q of S.ar) if (q.team !== me.team && q.alive && (!en || Math.abs(q.x[IN] - me.x[IN]) < Math.abs(en.x[IN] - me.x[IN]))) en = q;
        const dir = en ? (en.x[IN] > me.x[IN] ? 1 : -1) : me.face;
        let tx = me.x[IN] + dir * vw * .22;
        if (S.phase === 'intro' && S.pt < .9 && en) tx = en.x[IN];
        else if (!inp.aiming && S.arrows.length) { let A0 = null; for (const A of S.arrows) if (!A0 || A.id > A0.id) A0 = A; tx = A0.x; }
        const k = dt > 0 ? 1 - Math.pow(.015, dt) : 1;
        P.x += (tx - P.x) * k;
        P.x = clamp(P.x, vw / 2, RW - vw / 2);
        P.x0 = P.x - vw / 2;
      }
      function renderOnce() { if (sh.port && S) portCam(0); try { renderAll(st.ctx, S, V, sh, 0); } catch (e) { console.error(e); } }

      function startWaves() {
        role = 'local'; meta = freshMeta();
        beginRound({ mode: 'waves', wave: 1, arena: pickArena(1, 0), diff: opt.diff, names: ['You'] });
      }
      function nextWave() {
        const w = S.wave + 1;
        const me = S.ar[0];
        meta.hp = me.alive ? me.hp : me.mhp;
        beginRound({ mode: 'waves', wave: w, arena: pickArena(w, 0), diff: opt.diff, names: ['You'] });
      }
      function duelCfg(rnd, score, names, ctl, symOnly) {
        const pool = ARENAS.map((a, i) => i).filter(i => ARENAS[i].sym);
        return { mode: 'duel', arena: pool[Math.floor(Math.random() * pool.length)], rnd, score, need: 2, diff: opt.diff, names, duel: { ctl } };
      }
      function startCpuDuel() {
        role = 'local'; meta = freshMeta();
        beginRound(duelCfg(1, [0, 0], ['You', DIFF[opt.diff].n + ' CPU'], ['human', 'ai']));
      }

      const modeKeys = new Set();
      function openShop() {
        scr = 'shop';
        st.hideOv(); st.showMenu();
        renderShop();
        api.score('W' + S.wave + ' · ' + meta.coins);
      }
      function renderShop() {
        const me = S.ar[0], U = meta.upg;
        const healCost = 20 + S.wave * 3, hpMax = 100 + 16 * U.hp;
        const cur = meta.hp == null ? hpMax : meta.hp;
        const cards = UPG.map(u => {
          const lv = U[u.k], max = lv >= u.max, c = upCost(u.k, lv);
          return `<div class="ra-card"><h4>${u.n}</h4><p>${u.d}</p><div class="ra-pips">${Array.from({ length: u.max }, (_, i) => `<i${i < lv ? ' class="on"' : ''}></i>`).join('')}</div><button type="button" class="ra-buy" data-a="buy" data-k="${u.k}" ${max || meta.coins < c ? 'disabled' : ''}>${max ? 'Maxed' : '<span>Buy</span> &middot; ' + c}</button></div>`;
        }).join('');
        const ammo = ['fire', 'ice', 'bomb', 'triple', 'lightning'].map(t => {
          const c = AMMO_COST[t];
          const d = { fire: 'Sets archers ablaze', ice: 'Freezes, then shatters', bomb: 'Explodes, knocks back', triple: 'Three arrows at once', lightning: 'Stuns and chains' }[t];
          return `<div class="ra-card"><h4>${TYSVG(t)} <span>${TNAME[t]} arrows</span></h4><p><span>${d}.</span> <span>In quiver:</span> <b>${meta.ammo[t] | 0}</b></p><div class="ra-bar"><button type="button" class="ra-buy" data-a="ammo" data-k="${t}" data-n="1" ${meta.coins < c ? 'disabled' : ''}>+1 &middot; ${c}</button><button type="button" class="ra-buy alt" data-a="ammo" data-k="${t}" data-n="3" ${meta.coins < c * 3 ? 'disabled' : ''}>+3 &middot; ${c * 3}</button></div></div>`;
        }).join('');
        st.menuEl.innerHTML = `
<div class="gx-top"><h2 class="gx-logo"><span>Wave</span> ${S.wave} <b>cleared</b></h2><span class="ra-coins">&#9679; ${meta.coins}</span></div>
<p class="gx-tag"><span>Health</span> ${Math.ceil(cur)}/${hpMax} · <span>Spend your coins, then fight on.</span> <span>Next wave:</span> ${S.wave + 1}${(S.wave + 1) % 5 === 0 ? ' · <span>boss wave</span>' : ''}</p>
<div class="gx-sec">Bow upgrades</div><div class="ra-grid">${cards}</div>
<div class="gx-sec">Special arrows</div><div class="ra-grid">${ammo}</div>
<div class="gx-row" style="margin-top:14px">${cur < hpMax ? `<button type="button" class="ra-buy" data-a="heal" ${meta.coins < healCost ? 'disabled' : ''}><span>Heal to full</span> &middot; ${healCost}</button>` : ''}${st.btn('next', '<span>Next wave</span> &#9654;')}${st.btn('menu', 'Quit run', 'alt sm')}</div>`;
      }
      function buy(k) {
        const lv = meta.upg[k], u = UPG.find(x => x.k === k);
        if (lv >= u.max) return;
        const c = upCost(k, lv);
        if (meta.coins < c) return;
        meta.coins -= c; meta.upg[k]++;
        if (k === 'hp' && meta.hp != null) meta.hp += 16;
        A.play('coin'); renderShop();
      }
      function buyAmmo(t, n) {
        const c = AMMO_COST[t] * n;
        if (meta.coins < c) return;
        meta.coins -= c; meta.ammo[t] = (meta.ammo[t] | 0) + n; A.play('coin'); renderShop();
      }
      function heal() {
        const c = 20 + S.wave * 3;
        if (meta.coins < c) return;
        meta.coins -= c; meta.hp = null; A.play('coin'); renderShop();
      }

      function carryAmmo() {
        const me = S.ar[0];
        for (const t of ['fire', 'ice', 'bomb', 'triple', 'lightning']) meta.ammo[t] = me.ammo[t] | 0;
      }
      function onDone() {
        if (done) return;
        done = true;
        if (S.mode === 'waves') {
          if (S.endKind === 'clear') {
            carryAmmo();
            const me = S.ar[0];
            meta.coins += 20 + S.wave * 3;
            meta.hp = Math.min(me.mhp, me.hp + me.mhp * .3);
            if (S.wave > life.bestWave) { life.bestWave = S.wave; persist(); }
            api.submit(S.wave);
            persist();
            openShop();
          } else {
            persist();
            api.submit(S.wave - 1);
            A.play('lose');
            scr = 'over';
            st.card('Game over', `<span>Taken down on wave</span> ${S.wave}`, st.btn('again', 'Play again') + st.btn('menu', 'Menu', 'alt'), st.stats([['Waves cleared', S.wave - 1], ['Kills', S.kills[0]], ['Headshots', S.heads[0]], ['Coins earned', S.earned + (meta.coins || 0) * 0]]));
          }
          return;
        }
        if (S.over) {
          const w = S.win === sh.me, win = w;
          scr = 'over';
          A.play(win ? 'win' : 'lose');
          const sub = `${S.score[0]} - ${S.score[1]}`;
          const stats = st.stats([['Score', sub], ['Kills', S.kills[sh.me ? 1 : 0]], ['Headshots', S.heads[sh.me ? 1 : 0]]]);
          if (role === 'guest') st.card(win ? 'You win!' : 'You lose', 'Waiting for the host to start a rematch…', st.btn('menu', 'Leave', 'alt'), stats);
          else if (role === 'host') st.card(win ? 'You win!' : 'You lose', S.ar[1].ctl === 'ai' ? '' : '', st.btn('rematch', 'Rematch') + st.btn('lobby', 'Back to lobby', 'alt') + st.btn('menu', 'Leave', 'alt'), stats);
          else st.card(win ? 'You win!' : 'You lose', win ? 'Victory against the CPU.' : 'The CPU takes the match.', st.btn('rematch', 'Play again') + st.btn('menu', 'Menu', 'alt'), stats);
          if (S.win === 0 && S.mode === 'duel') { life.duels++; persist(); }
          if (role !== 'guest') { try { sessionStorage.removeItem(RK); } catch (e) {} }
          if (role === 'host') for (const d of [0, 120, 300, 600]) api.timeout(() => { if (S && S.over) flushSnap(performance.now()); }, d);
          return;
        }
        if (role === 'guest') return;
        const c = Object.assign({}, S.cfg);
        const pool = ARENAS.map((a, i) => i).filter(i => ARENAS[i].sym && i !== S.arena);
        c.arena = pool[Math.floor(Math.random() * pool.length)];
        c.rnd = S.rnd + 1; c.score = S.score.slice();
        beginRound(c);
      }

      function pointerLocal(e) { return st.cv.toLocal(e); }
      function maxDrag() {
        const r = st.canvas.getBoundingClientRect();
        return clamp(r.width * .2, 64, 150) * (CW / r.width);
      }
      function updateAim(L) {
        inp.cx = L.x; inp.cy = L.y;
        let vx = inp.sx - L.x, vy = inp.sy - L.y;
        if (opt.aim === 'push') { vx = -vx; vy = -vy; }
        const len = Math.hypot(vx, vy);
        inp.p = clamp(len / maxDrag(), 0, 1);
        if (len > 4) {
          inp.ang = Math.atan2(vy, vx);
          inp.face = Math.cos(inp.ang) >= 0 ? 1 : -1;
          inp.elev = inp.face > 0 ? -inp.ang : angDiff(Math.PI, inp.ang) * -1;
        }
      }
      function canAct() {
        const me = S && S.ar[sh.me];
        return scr === 'play' && S.phase === 'fight' && me && me.alive;
      }
      function releaseShot() {
        const me = S.ar[sh.me];
        const p = inp.p;
        inp.aiming = false; inp.ptr = null; inp.charge = 0;
        if (!me || !me.alive || p < .12 || S.phase !== 'fight') return;
        const shot = { ang: inp.ang, p, ty: inp.ty };
        if (role === 'guest') { net.send({ t: 'f', a: r2(shot.ang), p: r2(shot.p), ty: shot.ty, s: ++seq }); me.draw = 0; }
        else me.cmd.shot = shot;
        if (me.ammo[inp.ty] <= 1 && inp.ty !== 'normal') { inp.ty = 'normal'; me.sel = 'normal'; }
      }
      st.canvas.addEventListener('pointerdown', e => {
        if (scr !== 'play' || !S) return;
        A.ctx();
        if (e.pointerType === 'mouse' && e.button !== 0) { if (inp.aiming) { inp.aiming = false; inp.ptr = null; } return; }
        if (!canAct()) return;
        const L = pointerLocal(e);
        inp.ptr = e.pointerId; inp.sx = L.x; inp.sy = L.y; inp.cx = L.x; inp.cy = L.y; inp.aiming = true; inp.p = 0;
        try { st.canvas.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      });
      st.canvas.addEventListener('pointermove', e => { if (inp.ptr === e.pointerId) updateAim(pointerLocal(e)); });
      const pup = e => {
        if (inp.ptr !== e.pointerId) return;
        updateAim(pointerLocal(e));
        releaseShot();
      };
      st.canvas.addEventListener('pointerup', pup);
      st.canvas.addEventListener('pointercancel', e => { if (inp.ptr === e.pointerId) { inp.aiming = false; inp.ptr = null; } });
      st.canvas.addEventListener('contextmenu', e => { e.preventDefault(); inp.aiming = false; inp.ptr = null; });
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (scr === 'menu' && e.code === 'Enter') { const b = st.menuEl.querySelector('[data-a="waves"]'); if (b) b.click(); return; }
        if (scr === 'shop' && e.code === 'Enter') { act('next'); return; }
        if (scr === 'over' && e.code === 'Enter' && role !== 'guest') { const b = st.ovEl.querySelector('[data-a="again"],[data-a="rematch"]'); if (b) b.click(); return; }
        if (scr !== 'play') return;
        const c = e.code;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(c)) e.preventDefault();
        if (e.repeat) return;
        A.ctx();
        if (c === 'Escape') { inp.aiming = false; inp.ptr = null; inp.charge = 0; return; }
        inp.keys.add(c);
        if (c === 'Space' && canAct() && !inp.ptr) { inp.aiming = true; inp.kfire = true; inp.charge = .12; inp.p = .12; }
        if (/^Digit[1-6]$/.test(c)) selType(TYPES[+c.slice(5) - 1]);
        else if (c === 'KeyQ') cycleType(-1); else if (c === 'KeyE') cycleType(1);
        else if (c === 'ArrowLeft' || c === 'KeyA') inp.face = -1; else if (c === 'ArrowRight' || c === 'KeyD') inp.face = 1;
      });
      api.on(window, 'keyup', e => {
        inp.keys.delete(e.code);
        if (e.code === 'Space' && inp.kfire) { inp.kfire = false; if (scr === 'play' && S && inp.aiming && !inp.ptr) { releaseShot(); } else inp.aiming = false; }
      });
      api.on(window, 'blur', () => { inp.keys.clear(); inp.kfire = false; inp.aiming = false; inp.ptr = null; });

      function keyAim(dt) {
        if (scr !== 'play' || !S || inp.ptr) return;
        const k = inp.keys;
        const me = S.ar[sh.me];
        if (!me || !me.alive) { inp.aiming = false; return; }
        let moved = false;
        if (k.has('ArrowUp') || k.has('KeyW')) { inp.elev = clamp(inp.elev + dt * 1.2, -.15, 1.45); moved = true; }
        if (k.has('ArrowDown') || k.has('KeyS')) { inp.elev = clamp(inp.elev - dt * 1.2, -.15, 1.45); moved = true; }
        const f = inp.face;
        const ang = f > 0 ? -inp.elev : Math.PI + inp.elev;
        if (inp.kfire) { inp.charge = Math.min(1, inp.charge + dt * 1.1); inp.p = inp.charge; inp.ang = ang; }
        else if (moved || inp.keys.has('ArrowLeft') || inp.keys.has('ArrowRight') || inp.keys.has('KeyA') || inp.keys.has('KeyD')) inp.ang = ang;
        if (!inp.kfire && !inp.ptr) inp.aiming = false;
        if (!inp.aiming) { me.cmd.ang = ang; me.cmd.draw = false; }
      }

      function feedCmd() {
        const me = S.ar[sh.me];
        if (!me || role === 'guest') return;
        const c = me.cmd;
        if (inp.aiming && canAct()) { c.ang = inp.ang; c.p = inp.p; c.draw = inp.p >= .06; }
        else if (!inp.aiming) { c.draw = false; if (inp.keys.size || true) c.ang = inp.ang; }
        me.sel = inp.ty;
      }

      function sendCmd(now) {
        const me = S.ar[sh.me];
        if (!me) return;
        const m = [r2(inp.aiming ? inp.ang : me.aim), inp.aiming ? r2(inp.p) : 0, inp.aiming ? 1 : 0, inp.ty].join(',');
        if (m !== lastC && now - lastCt > 30 || now - lastCt > 400) {
          lastC = m; lastCt = now;
          const p = m.split(',');
          net.send({ t: 'c', a: +p[0], p: +p[1], d: +p[2], ty: p[3], s: ++seq }, true);
        }
      }

      function sendCfgTo(id) {
        net.sendTo(id, { t: 'cfg', k: rk, cfg: S.cfg, rs: S.score });
      }
      function sendCfgAll() { for (const p of net.players) if (p.id !== net.id) sendCfgTo(p.id); }
      function guestSeatId() { const q = S && S.ar[1]; return q && q.netId; }
      function flushSnap(now) {
        snapT = now;
        const p = packState(S);
        net.send({ t: 's', T: Math.round(now), k: rk, a: p.a, d: p.d, f: evq }, !evq.length);
        evq = [];
      }

      function guestFrame(now) {
        if (!snaps.length || !S) return;
        const t = now + off - 90;
        let i = snaps.length - 1; while (i > 0 && snaps[i].T > t) i--;
        const a = snaps[i], b = snaps[i + 1];
        for (const s of snaps) if (!s.done && s.T <= t) { s.done = 1; if (s.k === gK && s.f) for (const ev of s.f) onEvent(V, S, ev, sh, true); }
        const same = b && b.k === a.k && b.T - a.T < 300;
        const u = same ? clamp((t - a.T) / ((b.T - a.T) || 1), 0, 1) : 0;
        const X = a.a, Y = same ? b.a : X;
        let k = 0;
        for (const q of S.ar) {
          for (let j = 0; j < 11; j++) { q.x[j] = X[k] + (Y[k] - X[k]) * u; q.y[j] = X[k + 1] + (Y[k + 1] - X[k + 1]) * u; k += 2; }
          q.hp = X[k] + (Y[k] - X[k]) * u; q.st = X[k + 1] + (Y[k + 1] - X[k + 1]) * u;
          const cx = X[k + 2] + (Y[k + 2] - X[k + 2]) * u, sy = X[k + 3] + (Y[k + 3] - X[k + 3]) * u;
          q.aim = Math.atan2(sy, cx); q.draw = X[k + 4] + (Y[k + 4] - X[k + 4]) * u; k += 5;
          for (let j = 0; j < 11; j++) { q.ox[j] = q.x[j]; q.oy[j] = q.y[j]; }
        }
        const d = a.d;
        S.phase = d.ph; S.pt = d.pt; S.score = d.sc; S.rnd = d.rn; S.over = !!d.ov; S.win = d.w; S.endKind = d.ek;
        d.q.forEach((f, j) => {
          const q = S.ar[j]; if (!q) return;
          q.alive = !!f[0]; q.frozen = f[1]; q.burn = f[2]; q.stun = f[3]; q.face = f[4]; q.cd = f[5]; q.ammo.fire = f[6]; q.ammo.ice = f[7]; q.ammo.bomb = f[8]; q.ammo.triple = f[9]; q.ammo.lightning = f[10]; q.mhp = f[11];
          if (!q.alive && q.dieT === 0) q.dieT = .001;
          if (q.dieT > 0) q.dieT += 1 / 60;
        });
        const bm = new Map(); if (same) for (const r of b.d.ar) bm.set(r[0], r);
        S.arrows = d.ar.map(r => {
          const o = bm.get(r[0]);
          const x = o ? r[1] + (o[1] - r[1]) * u : r[1], y = o ? r[2] + (o[2] - r[2]) * u : r[2];
          return { id: r[0], x, y, vx: r[3], vy: r[4], type: TYPES[r[5]], own: r[6], pw: r[7] };
        });
        const me = S.ar[sh.me];
        if (me && inp.aiming) { me.aim = inp.ang; me.draw = inp.p; }
        while (snaps.length > 3 && snaps[1].T < t - 1500) snaps.shift();
        if (S.phase === 'done' && !done && S.over) onDone();
      }

      function frame(dt, now) {
        if (scr !== 'play' || !S) return;
        V.t += dt;
        V.shake *= Math.pow(.003, dt); if (V.shake < .1) V.shake = 0;
        V.flash = Math.max(0, V.flash - dt * 1.5);
        V.bannerT = Math.max(0, V.bannerT - dt * .6);
        if (V.slow > 0) V.slow = Math.max(0, V.slow - dt);
        keyAim(dt);
        const me = S.ar[sh.me];
        if (me && inp.aiming && !canAct()) { inp.aiming = false; inp.ptr = null; }
        if (role === 'guest') {
          sendCmd(now);
          guestFrame(now);
        } else {
          const ts = V.slow > 0 && role === 'local' ? .3 : 1;
          acc += dt * ts; let n = 0;
          if (S.phase !== 'done') {
            while (acc >= STEP && n < 6) { acc -= STEP; n++; feedCmd(); simStep(S, STEP, emit); if (S.phase === 'done') break; }
            if (n >= 6) acc = 0;
          }
          if (role === 'host') {
            if (now - snapT >= 33) flushSnap(now);
            if (now - saveT > 1000) { saveT = now; saveResume(); }
          }
          if (S.phase === 'done' && !done) onDone();
        }
        const tk = S.ar[sh.me] ? [inp.ty, TYPES.map(t => S.ar[sh.me].ammo[t] | 0).join('.'), scr].join('|') : '';
        if (tk !== typesKey) { typesKey = tk; typesEl.innerHTML = typeHtml(); }
        if (sh.port) portCam(dt);
        renderAll(st.ctx, S, V, sh, dt);
        const sc = S.mode === 'waves' ? 'W' + S.wave + ' · ' + meta.coins : S.score[0] + ' - ' + S.score[1];
        if (sc !== lastScore) { lastScore = sc; api.score(sc); }
        if (S.mode === 'duel' && S.phase === 'end' && !V.endShown) {
          V.endShown = 1;
          const k = S.endKind, mine = sh.me ? 'win1' : 'win0';
          V.banner = T(k === 'draw' ? 'DRAW' : k === mine ? (S.over ? 'MATCH WON' : 'ROUND WON') : (S.over ? 'MATCH LOST' : 'ROUND LOST'));
          V.sub = S.score[0] + ' - ' + S.score[1]; V.bannerT = 1;
        } else if (S.mode === 'waves' && S.phase === 'end' && !V.endShown) {
          V.endShown = 1;
          V.banner = T(S.endKind === 'clear' ? 'WAVE CLEARED' : 'YOU DIED'); V.sub = ''; V.bannerT = 1;
          if (S.endKind === 'clear') A.play('win');
        }
      }
      api.loop((dt, now) => frame(dt, now));

      function saveResume() {
        if (role !== 'host' || !S || S.over || S.phase === 'done') return;
        try { sessionStorage.setItem(RK, JSON.stringify({ code: net.code, at: Date.now(), S, names: S.cfg.names })); } catch (e) { }
      }

      function toMenu() {
        if (role !== 'local' || scr === 'wait' || scr === 'lobby' || scr === 'over') { try { net.close(); } catch (e) { } }
        role = 'local'; S = null; V = null; done = false;
        showMenu();
      }

      function hook() {
        if (hooked) return;
        hooked = true;
        net.on('data', (m, from) => {
          if (!m) return;
          if (role === 'host') {
            const q = S && S.ar[1];
            if (!q || q.netId !== from) return;
            if (m.t === 'c') {
              if (typeof m.s === 'number' && m.s < (q.netSeq || 0) - 50) return;
              q.netSeq = Math.max(q.netSeq || 0, m.s | 0);
              q.cmd.ang = +m.a || 0; q.cmd.p = clamp(+m.p || 0, 0, 1); q.cmd.draw = !!m.d;
              if (TYPES.includes(m.ty)) q.sel = m.ty;
            } else if (m.t === 'f') {
              q.cmd.shot = { ang: +m.a || 0, p: clamp(+m.p || 0, 0, 1), ty: TYPES.includes(m.ty) ? m.ty : 'normal' };
            }
            return;
          }
          if (m.t === 'cfg') {
            role = 'guest'; sh.local = false; sh.me = 1;
            meta = freshMeta();
            beginRoundGuest(m);
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
          if (role !== 'host' || !p || !S) return;
          const q = S.ar[1];
          if (!q || q.netId !== p.id) return;
          q.ctl = 'ai'; q.netId = null; q.name += ' (bot)'; q.cmd.shot = null;
          S.cfg.guestId = null; S.cfg.duel = { ctl: ['human', 'ai'] };
          api.toast(p.name + ' left. A bot takes over.');
        });
        net.on('rejoin', p => { if (role === 'host' && S && S.ar[1] && S.ar[1].netId === p.id) sendCfgTo(p.id); });
        net.on('lobby', () => { if (role === 'guest' || scr === 'wait' || scr === 'over') goOnline(); });
        net.on('close', why => {
          if (role === 'local' && scr !== 'wait') return;
          role = 'local'; S = null;
          st.showPlay(); st.canvas.getContext('2d').clearRect(0, 0, RW, RH);
          st.card(why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost', why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.', st.btn('menu', 'Menu'));
          scr = 'over'; A.play('lose');
        });
      }
      function beginRoundGuest(m) {
        done = false;
        gK = m.k; snaps.length = 0; off = 0; lastC = '';
        S = newState(m.cfg, freshMeta());
        S.cfg = m.cfg; S.score = m.rs ? m.rs.slice() : [0, 0]; S.rnd = m.cfg.rnd;
        V = mkVis(S, sh); V.banner = T('ROUND {n}', { n: S.rnd }); V.sub = T('{a} vs {b}', { a: m.cfg.names[0], b: m.cfg.names[1] }); V.bannerT = 1;
        inp.aiming = false; inp.ptr = null; inp.ty = 'normal'; inp.face = -1; inp.elev = .6; inp.ang = Math.PI + .6;
        typesKey = ''; lastScore = '';
        scr = 'play'; st.showPlay(); st.hideOv();
      }

      function hostReady(r) {
        const guest = r.players.find(p => !p.host && p.id !== net.id) || r.players[1];
        const names = [r.players[0].name, guest ? guest.name : (r.bots ? 'Bot' : 'Opponent')];
        const ctl = ['human', guest ? 'net' : 'ai'];
        const cfg = duelCfg(1, [0, 0], names, ctl);
        cfg.guestId = guest ? guest.id : null;
        let sv = null;
        try { const x = JSON.parse(sessionStorage.getItem(RK) || 'null'); if (x && x.code === net.code && x.S && Date.now() - x.at < 432e5 && !x.S.over) sv = x; } catch (e) { }
        const startNew = () => { role = 'host'; beginRound(cfg); bindGuest(guest); };
        if (!sv) return startNew();
        scr = 'wait'; st.showPlay(); st.canvas.getContext('2d').clearRect(0, 0, RW, RH);
        st.card('Game in progress', `<span>Round</span> ${sv.S.rnd} · ${sv.S.score[0]} - ${sv.S.score[1]}`, st.btn('resume', 'Resume game') + st.btn('newgame', 'New game', 'alt') + st.btn('menu', 'Leave', 'alt'));
        pendingResume = { sv, cfg, guest, startNew };
      }
      let pendingResume = null;
      function bindGuest(guest) {
        if (S && S.ar[1]) { S.ar[1].netId = guest ? guest.id : null; S.ar[1].ctl = guest ? 'net' : 'ai'; }
      }
      async function goOnline() {
        if (lobbying) return;
        hook(); lobbying = true; role = 'local'; S = null; st.hideOv();
        scr = 'lobby';
        st.showMenu('<h2 class="gx-logo">Online <b>Duel</b></h2><p class="gx-tag">Opening the party…</p>');
        const r = await net.room({ title: "Ragdoll Archers", sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true });
        lobbying = false;
        if (!api.alive) return;
        if (!r) { toMenu(); return; }
        if (r.role === 'host') hostReady(r);
        else { role = 'local'; scr = 'wait'; st.showPlay(); st.canvas.getContext('2d').clearRect(0, 0, RW, RH); st.card('Connected', 'Waiting for the host to start…', st.btn('menu', 'Leave', 'alt')); }
      }

      function act(name, ds) {
        if (name === 'online' || name === 'lobby') return goOnline();
        if (name === 'menu') return toMenu();
        if (name === 'waves' || (name === 'again' && S && S.mode === 'waves')) return startWaves();
        if (name === 'cpu') return startCpuDuel();
        if (name === 'next') return nextWave();
        if (name === 'buy') return buy(ds.k);
        if (name === 'ammo') return buyAmmo(ds.k, +ds.n);
        if (name === 'heal') return heal();
        if (name === 'rematch') {
          if (role === 'guest') return;
          const c = S.cfg;
          if (role === 'host') { const nc = duelCfg(1, [0, 0], c.names.slice(), c.duel.ctl); nc.guestId = c.guestId; beginRound(nc); return; }
          return beginRound(duelCfg(1, [0, 0], c.names, c.duel.ctl));
        }
        if (name === 'resume' && pendingResume) {
          const { sv, cfg, guest } = pendingResume; pendingResume = null;
          role = 'host';
          const rs = sv.S;
          const gname = rs.ar[1].name.replace(' (bot)', '');
          const g2 = net.players.find(p => !p.host && p.id !== net.id);
          cfg.names = rs.cfg.names; cfg.rnd = rs.rnd; cfg.score = rs.score; cfg.arena = rs.arena;
          beginRound(Object.assign({}, rs.cfg, { names: [net.players[0].name, g2 ? g2.name : gname] }), rs);
          S.ar[0].ctl = 'human'; S.ar[0].name = net.players[0].name;
          if (g2) { S.ar[1].ctl = 'net'; S.ar[1].netId = g2.id; S.ar[1].name = g2.name; } else { S.ar[1].ctl = 'ai'; S.ar[1].netId = null; }
          sendCfgAll();
          return;
        }
        if (name === 'newgame' && pendingResume) { const p = pendingResume; pendingResume = null; try { sessionStorage.removeItem(RK); } catch (e) { } return p.startNew(); }
      }
      st.onAct = act;
      if (invited) goOnline(); else showMenu();
      return { destroy() { A.destroy(); } };
    }

    Ameplay.register({
      id: 'quiver-clash',
      title: "Ragdoll Archers",
      category: 'Action',
      tint: '#3b82f6',
      blurb: 'Pull back, aim and knock wobbly stickman archers off their cliffs. Headshots, fire, ice, bomb, triple and storm arrows. Endless waves, duels against the computer and online 1v1.',
      help: '<kbd>&#128433;</kbd> <span>drag to aim, release to shoot</span> · <kbd>Space</kbd> <span>hold to draw, release to fire</span> · <kbd>&uarr;</kbd><kbd>&darr;</kbd> <span>angle</span> · <kbd>1</kbd>-<kbd>6</kbd> <span>arrow type</span> · <kbd>Esc</kbd> <span>pause</span>',
      width: 960,
      better: 'high',
      format: v => 'Wave ' + v,
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="16" r="5"/><path d="M20 21v15M20 26l9-3M20 36l-6 12M20 36l7 12"/><path d="M36 10c10 6 10 36 0 42"/><path d="M36 10v42" stroke-width="1.5"/><path d="M26 31h30M50 26l6 5-6 5"/></svg>',
      css: sxCss('quiver-clash', '#3b82f6') + RA_CSS,
      engine: { DIFF, ARENAS, newState, simStep },
      mount: mountArchers
    });

  }

  {

    const SL_STEP = 1 / 120, SL_G = 1500, SL_R = 13, SL_RANGE = 390, SL_FLOOR = 640, SL_VMAX = 1750;
    const SL_WORLDS = [
      { n: 'Sunny Hills', th: 'hills', need: 0 },
      { n: 'Iron Works', th: 'works', need: 0 },
      { n: 'Night Sky', th: 'night', need: 0 }
    ];
    const SL_LEVELS = [];
    const SL_SKINS = [
      { id: 'ink', n: 'Classic', cost: 0, body: '#1d2333', head: '#1d2333', hat: '', trail: '#ffffff' },
      { id: 'red', n: 'Red Rocket', cost: 40, body: '#d9344a', head: '#d9344a', hat: 'band', hc: '#ffd23a', trail: '#ff8a5c' },
      { id: 'leaf', n: 'Leafy', cost: 60, body: '#2f9e57', head: '#2f9e57', hat: 'cap', hc: '#ffcf3a', trail: '#9df07a' },
      { id: 'sky', n: 'Sky Diver', cost: 80, body: '#2f7fe0', head: '#2f7fe0', hat: 'helm', hc: '#e8eef8', trail: '#9fd2ff' },
      { id: 'grape', n: 'Grape', cost: 100, body: '#7b4ad6', head: '#7b4ad6', hat: 'band', hc: '#ff6fb1', trail: '#d3a6ff' },
      { id: 'tiger', n: 'Tiger', cost: 140, body: '#f28a1c', head: '#f28a1c', hat: 'ears', hc: '#1d2333', trail: '#ffc36a' },
      { id: 'ghost', n: 'Ghost', cost: 180, body: '#e9eef7', head: '#e9eef7', hat: '', trail: '#c9d8ff', line: '#7d8aa8' },
      { id: 'king', n: 'King', cost: 0, stars: 60, body: '#2a2f45', head: '#2a2f45', hat: 'crown', hc: '#ffd23a', trail: '#ffe27a' },
      { id: 'gold', n: 'Gold Star', cost: 0, stars: 90, body: '#e0a91a', head: '#e0a91a', hat: 'halo', hc: '#fff3b0', trail: '#fff1a0' }
    ];

    const hk = (x, gap, ys, k) => ys.map((y, i) => [k || 'h', x + gap * i, y]);
    const L = (n, par, ...parts) => {
      const o = [].concat(...parts);
      let mx = 0;
      for (const q of o) if (q[0][0] === 'h' || q[0] === 'p' || q[0] === 'b') mx = Math.max(mx, q[1] + (q[0] === 'hm' ? Math.abs(q[3]) : 0));
      return { n, par, f: mx + 420, o };
    };
    SL_LEVELS.push([
      L('First Swing', 7, hk(330, 320, [170, 170, 170, 170, 170, 170, 170, 170]), [['g', 970, 420], ['g', 1610, 420], ['g', 2250, 420]]),
      L('Ups and Downs', 8, hk(330, 320, [170, 110, 210, 100, 200, 90, 190, 120, 170]), [['g', 970, 380], ['g', 1610, 380], ['g', 2250, 380], ['g', 2730, 380]]),
      L('Long Gaps', 8, [['h', 330, 170], ['h', 700, 160], ['h', 1100, 170], ['h', 1480, 150], ['h', 1880, 170], ['h', 2260, 160], ['h', 2660, 180], ['h', 3040, 170]], [['g', 900, 270], ['g', 1680, 260], ['g', 2460, 270]]),
      L('Boing', 8, hk(330, 320, [170, 160]), [['p', 1000, 600, 200, 0]], hk(1350, 320, [120, 150, 170]), [['p', 2350, 600, 200, 10]], hk(2700, 320, [110, 150, 170]), [['g', 1000, 360], ['g', 1000, 300], ['g', 2350, 330], ['g', 3180, 390]]),
      L('Climb', 10, hk(330, 300, [200, 150, 100, 50, 0, -50, -100]), hk(2450, 320, [-60, 0, 60, 120, 170]), [['g', 1696, 256], ['g', 2303, 195], ['g', 2930, 280], ['g', 3570, 380]]),
      L('Up and Over', 11, hk(330, 320, [170, 140]), [['w', 920, 330, 100, 320]], hk(1030, 320, [40, 110]), [['w', 1560, 300, 100, 350]], hk(1700, 320, [20, 100, 160]), [['w', 2560, 360, 120, 290]], hk(2700, 320, [60, 140, 170]), [['g', 970, 260], ['g', 1610, 230], ['g', 2620, 290], ['g', 1860, 150]]),
      L('Bumpers', 10, [['h', 330, 170], ['b', 650, 470, 55], ['h', 900, 150], ['b', 1180, 450, 55], ['h', 1440, 130], ['h', 1760, 160], ['b', 2060, 470, 55], ['h', 2320, 150], ['b', 2600, 440, 55], ['h', 2860, 140], ['h', 3180, 170]], [['g', 650, 300], ['g', 1180, 290], ['g', 2060, 300], ['g', 2600, 280]]),
      L('Rollercoaster', 10, hk(330, 300, [200, 150, 90, 30, -30]), [['p', 1950, 600, 220, 15]], hk(2350, 310, [60, 120, 180, 120, 60, 120, 170]), [['g', 1665, 314], ['g', 1882, 421], ['g', 2660, 400], ['g', 3280, 400], ['g', 3900, 380]]),
      L('Pad Hopper', 9, [['h', 330, 170], ['p', 720, 600, 170, 14], ['p', 1140, 600, 170, 14], ['p', 1560, 600, 170, 14], ['h', 1920, 140], ['h', 2240, 160], ['p', 2620, 600, 170, 14], ['p', 3040, 600, 170, 14], ['h', 3400, 130], ['h', 3720, 170]], [['g', 936, 325], ['g', 1321, 360], ['g', 2830, 300], ['g', 3560, 400]]),
      L('Hilltop', 10, hk(330, 320, [170, 120]), [['b', 900, 470, 50]], hk(1150, 320, [90]), [['w', 1360, 300, 100, 350]], hk(1500, 330, [0, 100]), [['p', 2120, 600, 180, 8]], hk(2450, 320, [80, 160]), [['w', 3000, 330, 100, 320]], hk(3150, 320, [40, 120, 170]), [['g', 900, 300], ['g', 1410, 220], ['g', 1532, 315], ['g', 3310, 120]])
    ]);
    SL_LEVELS.push([
      L('Sawmill', 7, hk(330, 320, [170, 150, 150, 140, 150, 160, 170]), [['s', 490, 570, 46], ['s', 810, 560, 46], ['s', 1130, 570, 46], ['s', 1450, 560, 46], ['s', 1770, 570, 46], ['s', 2090, 560, 46]], [['g', 970, 400], ['g', 1610, 400], ['g', 2250, 410]]),
      L('Drifting Hooks', 7, [['h', 330, 170], ['hm', 650, 160, 0, 70, 2.2, 0], ['hm', 970, 150, 90, 0, 2.6, 0], ['hm', 1290, 140, 0, 80, 2, 1.5], ['h', 1610, 150], ['hm', 1930, 150, 0, 90, 1.8, 0], ['hm', 2250, 150, 100, 0, 2.4, 2], ['h', 2570, 170]], [['g', 810, 380], ['g', 1450, 380], ['g', 2090, 380], ['g', 2410, 380]]),
      L('Ring Road', 8, hk(330, 320, [170, 160]), [['r', 860, 260, -15]], hk(1330, 320, [140]), [['r', 1560, 250, -20]], hk(2050, 320, [150, 160]), [['r', 2600, 250, -10]], hk(3050, 320, [150, 170]), [['g', 1060, 227], ['g', 1160, 226], ['g', 1790, 195], ['g', 2840, 236]]),
      L('Saw Gate', 7, hk(330, 330, [170, 160]), [['s', 820, 215, 38], ['s', 820, 480, 38]], hk(990, 330, [150]), [['s', 1160, 230, 38], ['s', 1160, 500, 38]], hk(1320, 330, [160]), [['s', 1490, 220, 38], ['s', 1490, 490, 38]], hk(1650, 330, [160, 150, 170]), [['g', 820, 350], ['g', 1160, 365], ['g', 1490, 355], ['g', 2150, 420]]),
      L('Swinging Saws', 7, hk(330, 320, [170, 150, 150, 150, 140, 160, 170]), [['s', 810, 390, 40, 0, 150, 2.4], ['s', 1130, 390, 40, 0, 150, 2.4, 1.2], ['s', 1450, 390, 40, 0, 150, 2], ['s', 1770, 390, 40, 0, 150, 2.2, 2]], [['g', 815, 311], ['g', 1450, 290], ['g', 2250, 400]]),
      L('Spinners', 8, hk(330, 320, [170, 150]), [['sr', 880, 360, 120, 30, 1.6, 2]], hk(1110, 330, [140]), [['sr', 1380, 350, 130, 30, -1.4, 3]], hk(1640, 330, [140, 150]), [['sr', 2140, 380, 120, 30, 1.8, 2]], hk(2380, 320, [150, 170]), [['g', 880, 360], ['g', 1380, 350], ['g', 2140, 380], ['g', 2860, 400]]),
      L('Low Ceiling', 7, hk(330, 320, [170, 150, 150, 150, 150, 150, 150, 170]), [['k', 560, 40, 1700, 30, 1], ['k', 1050, 570, 280, 30, 0], ['k', 1690, 570, 280, 30, 0]], [['g', 800, 360], ['g', 1130, 330], ['g', 1450, 330], ['g', 1770, 330], ['g', 2090, 330]]),
      L('Ring Rush', 8, [['h', 330, 170], ['r', 560, 300, -25], ['r', 1000, 160, 0], ['h', 1350, 150], ['r', 1600, 290, -30], ['r', 2050, 140, 5], ['h', 2400, 140], ['h', 2720, 160], ['r', 2960, 290, -25], ['r', 3400, 150, 0], ['h', 3760, 160], ['h', 4080, 170]], [['g', 780, 200], ['g', 1200, 179], ['g', 1830, 190], ['g', 3180, 200]]),
      L('Shift Work', 7, [['h', 330, 170], ['hm', 660, 150, 0, 90, 2, 0], ['s', 810, 530, 44, 120, 0, 2.2], ['hm', 990, 140, 0, 90, 2, 1], ['s', 1150, 530, 44, 120, 0, 2.2, 1.1], ['hm', 1320, 150, 100, 0, 2.4, 0], ['sr', 1560, 330, 110, 28, 1.8, 2], ['h', 1800, 130], ['h', 2140, 150], ['s', 2310, 520, 44, 0, 0, 1], ['hm', 2470, 150, 0, 80, 2, .5], ['h', 2800, 170]], [['g', 1150, 360], ['g', 1560, 330], ['g', 2310, 360], ['g', 2640, 400]]),
      L('The Works', 8, [['h', 330, 170], ['s', 500, 570, 46], ['hm', 650, 150, 0, 70, 2.2, 0], ['r', 860, 280, -20], ['h', 1300, 120], ['sr', 1540, 340, 120, 30, -1.6, 2], ['h', 1770, 130], ['k', 1860, 570, 420, 30, 0], ['p', 2070, 555, 160, 10], ['h', 2450, 90], ['s', 2620, 240, 40, 0, 120, 2], ['h', 2800, 140], ['hm', 3130, 150, 0, 80, 2, 0], ['k', 3200, 40, 400, 30, 1], ['h', 3460, 160], ['h', 3780, 170]], [['g', 1080, 210], ['g', 1540, 340], ['g', 2070, 320], ['g', 2975, 300], ['g', 3620, 420]])
    ]);
    SL_LEVELS.push([
      L('Crumble', 7, [['h', 330, 170]], hk(650, 320, [160, 150, 150, 150, 160], 'hc'), hk(2250, 320, [150, 170]), [['g', 810, 380], ['g', 1130, 380], ['g', 1450, 380], ['g', 1770, 380]]),
      L('Tailwind', 7, hk(330, 320, [170, 160]), [['wd', 800, -300, 1000, 940, 520, 0]], hk(1100, 380, [160, 150, 150]), hk(2200, 320, [160, 150, 170]), [['g', 1290, 220], ['g', 1670, 220], ['g', 2520, 400], ['g', 3000, 400]]),
      L('Updraft', 8, hk(330, 320, [170, 160]), [['wd', 830, -300, 260, 940, 0, -1900]], hk(1050, 320, [-80, -40]), [['wd', 1530, -300, 240, 940, 0, -1900]], hk(1750, 320, [60, 150]), [['wd', 2240, -300, 240, 940, 0, -1900]], hk(2460, 320, [-40, 60, 170]), [['g', 960, 100], ['g', 1650, 120], ['g', 2360, 120], ['g', 3100, 380]]),
      L('Star Steps', 9, [['h', 330, 170], ['hc', 620, 130], ['h', 910, 90], ['hc', 1200, 50], ['h', 1490, 10], ['b', 1720, 420, 55], ['hc', 1960, 120], ['h', 2280, 150], ['hc', 2580, 120], ['h', 2880, 150], ['h', 3200, 170]], [['g', 1099, 378], ['g', 1622, 319], ['g', 1720, 260], ['g', 2730, 380]]),
      L('Pinball', 9, [['h', 330, 170], ['b', 600, 450, 50], ['b', 790, 330, 40], ['h', 1000, 130], ['s', 1180, 570, 50], ['b', 1300, 420, 50], ['b', 1480, 300, 40], ['h', 1700, 130], ['b', 1980, 450, 50], ['h', 2220, 140], ['b', 2500, 430, 50], ['b', 2690, 310, 40], ['h', 2900, 140], ['h', 3220, 170]], [['g', 790, 210], ['g', 1480, 180], ['g', 1980, 300], ['g', 2690, 190]]),
      L('Breakaway', 8, [['h', 330, 170], ['hc', 650, 150], ['hm', 960, 140, 0, 80, 2.2, 0], ['hc', 1280, 130], ['s', 1440, 530, 44], ['hm', 1600, 140, 100, 0, 2.4, 0], ['hc', 1920, 140], ['h', 2240, 150], ['hc', 2560, 150], ['s', 2720, 530, 44], ['hm', 2880, 150, 0, 80, 2, 1], ['h', 3200, 170]], [['g', 810, 380], ['g', 1440, 360], ['g', 2080, 380], ['g', 2720, 360]]),
      L('Gauntlet', 8, [['h', 330, 170], ['h', 650, 150], ['k', 750, 570, 1500, 30, 0], ['sr', 900, 330, 110, 28, 1.6, 2], ['hc', 1150, 140], ['s', 1320, 260, 40, 0, 120, 2], ['h', 1480, 140], ['wd', 1600, -300, 520, 940, 420, 0], ['hm', 1880, 140, 0, 80, 2, 0], ['h', 2220, 140], ['sr', 2470, 330, 110, 28, -1.7, 2], ['h', 2720, 150], ['h', 3040, 170]], [['g', 900, 330], ['g', 1320, 420], ['g', 2050, 300], ['g', 2470, 330]]),
      L('Storm', 9, [['h', 330, 170], ['wd', 500, -300, 700, 940, -260, 0], ['h', 650, 150], ['h', 960, 150], ['wd', 1200, -300, 240, 940, 0, -1800], ['hc', 1450, -40], ['s', 1600, 300, 44, 0, 160, 2.2], ['h', 1760, 60], ['b', 2000, 470, 55], ['hm', 2260, 120, 90, 0, 2.2, 0], ['h', 2600, 150], ['wd', 2760, -300, 600, 940, 380, 0], ['h', 3050, 150], ['h', 3400, 170]], [['g', 800, 400], ['g', 1320, 120], ['g', 2000, 300], ['g', 2430, 400], ['g', 3220, 400]]),
      L('Long Night', 10, [['h', 330, 170], ['h', 650, 150], ['r', 860, 280, -20], ['hc', 1300, 120], ['s', 1460, 540, 44, 140, 0, 2.4], ['hm', 1620, 130, 0, 90, 2, 0], ['p', 1930, 600, 170, 10], ['h', 2280, 70], ['sr', 2520, 300, 120, 28, -1.7, 3], ['hc', 2760, 120], ['h', 3080, 140], ['wd', 3200, -300, 240, 940, 0, -1800], ['h', 3440, -40], ['hc', 3760, 60], ['h', 4080, 150], ['h', 4400, 170]], [['g', 1080, 210], ['g', 1930, 360], ['g', 2520, 300], ['g', 3320, 100], ['g', 4240, 400]]),
      L('Last Line', 9, [['h', 330, 170], ['s', 490, 570, 46], ['hm', 650, 150, 0, 80, 2, 0], ['hc', 970, 140], ['wd', 1080, -300, 220, 940, 0, -1900], ['h', 1300, -60], ['r', 1560, 60, 10], ['hc', 2000, 110], ['sr', 2240, 330, 120, 28, 1.8, 2], ['hm', 2480, 130, 100, 0, 2.4, 0], ['k', 2550, 570, 700, 30, 0], ['b', 2800, 430, 50], ['hc', 3080, 120], ['s', 3240, 250, 40, 0, 130, 2], ['h', 3400, 140], ['hm', 3720, 140, 0, 90, 2, 0], ['h', 4040, 170]], [['g', 1190, 120], ['g', 1780, 80], ['g', 2266, 272], ['g', 2800, 280], ['g', 3880, 400]])
    ]);


    function slCompile(def) {
      const S = { def, t: 0, run: 0, ph: 'ready', pt: 0, px: 100, py: 380 - SL_R, vx: 0, vy: 0, att: -1, L: 0, Lmin: 0, hold: false, prev: false, spin: 0, rot: 0, ground: true, gems: 0, gemsTot: 0, best: 0, ev: [], hooks: [], walls: [], pads: [], bumps: [], saws: [], spikes: [], gemL: [], rings: [], winds: [], fin: def.f, endless: !!def.endless, gen: 0, rng: null, die: '', tid: -1, attT: 0, lastHit: 0 };
      S.walls.push({ x: -500, y: 380, w: 640, h: 400 });
      if (def.endless) { S.rng = gpRng(def.seed || 1); S.fin = 1e9; S.gen = 0; }
      for (const o of def.o || []) slAdd(S, o);
      if (def.endless) slGen(S, 2400);
      S.gemsTot = S.gemL.length;
      slMove(S);
      return S;
    }
    function slAdd(S, o) {
      const k = o[0];
      if (k === 'h' || k === 'hm' || k === 'hc') S.hooks.push({ x: o[1], y: o[2], x0: o[1], y0: o[2], ax: k === 'hm' ? o[3] : 0, ay: k === 'hm' ? o[4] : 0, per: k === 'hm' ? o[5] : 1, ph: k === 'hm' ? o[6] || 0 : 0, c: k === 'hc', br: 0, bt: 0, vx: 0, vy: 0, pulse: 0 });
      else if (k === 'w') S.walls.push({ x: o[1], y: o[2], w: o[3], h: o[4] });
      else if (k === 'p') { const a = o[4] * Math.PI / 180; S.pads.push({ x: o[1], y: o[2], w: o[3], tx: Math.cos(a), ty: Math.sin(a), nx: Math.sin(a), ny: -Math.cos(a), sq: 0 }); }
      else if (k === 'b') S.bumps.push({ x: o[1], y: o[2], r: o[3], sq: 0 });
      else if (k === 's') S.saws.push({ x0: o[1], y0: o[2], r: o[3], ax: o[4] || 0, ay: o[5] || 0, per: o[6] || 1, ph: o[7] || 0, cx: 0, cy: 0, R: 0, sp: 0, i: 0, n: 0, x: o[1], y: o[2] });
      else if (k === 'sr') { for (let i = 0; i < o[6]; i++) S.saws.push({ x0: 0, y0: 0, r: o[4], ax: 0, ay: 0, per: 1, ph: 0, cx: o[1], cy: o[2], R: o[3], sp: o[5], i, n: o[6], x: o[1], y: o[2] }); }
      else if (k === 'k') S.spikes.push({ x: o[1], y: o[2], w: o[3], h: o[4], d: o[5] });
      else if (k === 'g') S.gemL.push({ x: o[1], y: o[2], got: 0, t: 0 });
      else if (k === 'r') { const a = o[3] * Math.PI / 180; S.rings.push({ x: o[1], y: o[2], dx: Math.cos(a), dy: Math.sin(a), cd: 0, fx: 0 }); }
      else if (k === 'wd') S.winds.push({ x: o[1], y: o[2], w: o[3], h: o[4], fx: o[5], fy: o[6] });
    }
    function slGen(S, upto) {
      const R = S.rng;
      if (!S.gen) { S.hooks.push({ x: 330, y: 170, x0: 330, y0: 170, ax: 0, ay: 0, per: 1, ph: 0, c: false, br: 0, bt: 0, vx: 0, vy: 0, pulse: 0 }); S.gen = 330; S.gy = 170; }
      while (S.gen < upto) {
        const d = Math.min(1, S.gen / 30000);
        const gap = 280 + R() * (70 + 120 * d);
        const x = S.gen + gap;
        const y = clamp(S.gy + (R() - .5) * (120 + 120 * d), 40, 230);
        const roll = R();
        if (d > .08 && roll < .12) { S.pads.push({ x: x, y: 600, w: 180, tx: 1, ty: 0, nx: 0, ny: -1, sq: 0 }); S.gemL.push({ x: x, y: 360, got: 0, t: 0 }); S.gen = x; continue; }
        const mv = d > .15 && R() < .25 + .3 * d, cr = !mv && d > .3 && R() < .2;
        S.hooks.push({ x, y, x0: x, y0: y, ax: mv && R() < .5 ? 60 + 40 * R() : 0, ay: mv ? 50 + 40 * R() : 0, per: 2 + R(), ph: R() * 6, c: cr, br: 0, bt: 0, vx: 0, vy: 0, pulse: 0 });
        if (d > .05 && R() < .35 + .3 * d) S.saws.push({ x0: x - gap / 2, y0: 520 + R() * 40, r: 40 + 10 * R(), ax: d > .4 && R() < .5 ? 90 : 0, ay: 0, per: 2.2, ph: R() * 6, cx: 0, cy: 0, R: 0, sp: 0, i: 0, n: 0, x: 0, y: 0 });
        if (R() < .55) S.gemL.push({ x: x - gap / 2, y: y + 200 + R() * 80, got: 0, t: 0 });
        S.gen = x; S.gy = y;
      }
    }
    function slMove(S) {
      const t = S.t;
      for (const h of S.hooks) {
        if (h.ax || h.ay) {
          const w = TAU / h.per, s = Math.sin(t * w + h.ph), c = Math.cos(t * w + h.ph);
          h.x = h.x0 + h.ax * s; h.y = h.y0 + h.ay * s; h.vx = h.ax * w * c; h.vy = h.ay * w * c;
        }
      }
      for (const s of S.saws) {
        if (s.n) { const a = t * s.sp + TAU * s.i / s.n; s.x = s.cx + Math.cos(a) * s.R; s.y = s.cy + Math.sin(a) * s.R; }
        else if (s.ax || s.ay) { const v = Math.sin(t * TAU / s.per + s.ph); s.x = s.x0 + s.ax * v; s.y = s.y0 + s.ay * v; }
        else { s.x = s.x0; s.y = s.y0; }
      }
    }
    function slTarget(S) {
      let best = -1, bs = 1e9;
      const dir = S.vx < -60 ? -1 : 1;
      for (let i = 0; i < S.hooks.length; i++) {
        const h = S.hooks[i];
        if (h.br) continue;
        const dx = h.x - S.px, dy = h.y - S.py;
        if (dx < -SL_RANGE || dx > SL_RANGE) continue;
        const d = Math.hypot(dx, dy);
        if (d > SL_RANGE) continue;
        let s = d;
        if (dx * dir < -30) s += 150;
        if (dy > 40) s += 120;
        if (s < bs) { bs = s; best = i; }
      }
      return best;
    }
    function slEv(S, k, a, b) { S.ev.push(k, a || 0, b || 0); }
    function slDie(S, why) {
      if (S.ph === 'dead' || S.ph === 'won') return;
      S.ph = 'dead'; S.pt = 0; S.die = why; S.att = -1;
      slEv(S, 6, S.px, S.py);
    }
    function slStep(S, hold) {
      const dt = SL_STEP;
      if (S.ph === 'dead' || S.ph === 'won') {
        S.pt += dt;
        if (S.ph === 'won') { S.vy += SL_G * .25 * dt; S.vx *= .99; S.px += S.vx * dt; S.py += S.vy * dt; S.rot += S.spin * dt; S.t += dt; slMove(S); }
        S.prev = hold;
        return;
      }
      S.t += dt;
      if (S.ph === 'run') S.run += dt;
      slMove(S);
      if (S.endless && S.px + 1600 > S.gen) slGen(S, S.gen + 1200);
      const press = hold && !S.prev;
      S.prev = hold;
      if (hold && S.att < 0) {
        const k = slTarget(S);
        if (k >= 0) {
          const h = S.hooks[k];
          if (S.ph === 'ready') { S.ph = 'run'; if (S.ground) { S.vx = 330; S.vy = -430; S.py -= 2; } }
          S.att = k; S.attT = 0;
          const d = Math.hypot(h.x - S.px, h.y - S.py);
          S.L = Math.max(36, d); S.Lmin = Math.max(36, d * .82);
          h.pulse = 1;
          if (h.c && !h.bt) h.bt = .001;
          slEv(S, 1, k, press ? 1 : 0);
        }
      } else if (!hold && S.att >= 0) {
        const h = S.hooks[S.att];
        const dx = S.px - h.x, dy = S.py - h.y, d = Math.hypot(dx, dy) || 1;
        const vt = ((S.vx - h.vx) * -dy + (S.vy - h.vy) * dx) / d;
        S.spin = clamp(vt / Math.max(60, S.L), -14, 14);
        S.att = -1;
        slEv(S, 2, 0, 0);
      }
      for (const h of S.hooks) {
        if (h.pulse > 0) h.pulse = Math.max(0, h.pulse - dt * 3);
        if (h.bt > 0 && !h.br) { h.bt += dt; if (h.bt > .85) { h.br = 1; slEv(S, 7, h.x, h.y); if (S.att >= 0 && S.hooks[S.att] === h) { S.att = -1; S.spin = 3; } } }
      }
      if (S.ph === 'ready') { S.rot = 0; return; }
      if (S.att >= 0) {
        const h = S.hooks[S.att];
        S.attT += dt;
        const dx = S.px - h.x, dy = S.py - h.y, d = Math.hypot(dx, dy) || 1;
        const tx = -dy / d, ty = dx / d;
        const vt = (S.vx - h.vx) * tx + (S.vy - h.vy) * ty;
        const sp = Math.abs(vt);
        let dir = sgn(vt);
        if (sp < 40) dir = S.px < h.x ? 1 : -1;
        const push = sp < 300 ? 620 * (1 - sp / 300) + 140 : 140;
        S.vx += tx * dir * push * dt; S.vy += ty * dir * push * dt;
        if (S.L > S.Lmin) S.L = Math.max(S.Lmin, S.L - 70 * dt);
        S.rot = Math.atan2(dx, -dy) + Math.PI;
      } else {
        S.rot += S.spin * dt;
        S.spin *= Math.pow(.6, dt);
      }
      S.vy += SL_G * dt;
      for (const w of S.winds) if (S.px > w.x && S.px < w.x + w.w && S.py > w.y && S.py < w.y + w.h) { S.vx += w.fx * dt; S.vy += w.fy * dt; }
      const dr = 1 - .06 * dt;
      S.vx *= dr; S.vy *= dr;
      const v2 = S.vx * S.vx + S.vy * S.vy;
      if (v2 > SL_VMAX * SL_VMAX) { const k = SL_VMAX / Math.sqrt(v2); S.vx *= k; S.vy *= k; }
      S.px += S.vx * dt; S.py += S.vy * dt;
      if (S.att >= 0) {
        const h = S.hooks[S.att];
        const dx = S.px - h.x, dy = S.py - h.y, d = Math.hypot(dx, dy) || 1;
        if (d > S.L) {
          const nx = dx / d, ny = dy / d;
          S.px = h.x + nx * S.L; S.py = h.y + ny * S.L;
          const vr = (S.vx - h.vx) * nx + (S.vy - h.vy) * ny;
          if (vr > 0) { S.vx -= nx * vr; S.vy -= ny * vr; }
        }
      }
      S.ground = false;
      for (const w of S.walls) {
        const cx = S.px < w.x ? w.x : S.px > w.x + w.w ? w.x + w.w : S.px, cy = S.py < w.y ? w.y : S.py > w.y + w.h ? w.y + w.h : S.py;
        let dx = S.px - cx, dy = S.py - cy, d2 = dx * dx + dy * dy;
        if (d2 >= SL_R * SL_R) continue;
        let d = Math.sqrt(d2), nx, ny;
        if (d < 1e-4) {
          const l = S.px - w.x, r = w.x + w.w - S.px, t = S.py - w.y, b = w.y + w.h - S.py, m = Math.min(l, r, t, b);
          nx = m === l ? -1 : m === r ? 1 : 0; ny = m === t ? -1 : m === b ? 1 : 0; if (nx && ny) ny = 0;
          S.px = nx ? (nx < 0 ? w.x - SL_R : w.x + w.w + SL_R) : S.px; S.py = ny ? (ny < 0 ? w.y - SL_R : w.y + w.h + SL_R) : S.py;
        } else { nx = dx / d; ny = dy / d; S.px = cx + nx * SL_R; S.py = cy + ny * SL_R; }
        const vn = S.vx * nx + S.vy * ny;
        if (vn < 0) {
          const e = ny < -.7 && vn > -260 ? 0 : .32;
          S.vx -= (1 + e) * vn * nx; S.vy -= (1 + e) * vn * ny;
          if (-vn > 220 && S.t - S.lastHit > .15) { S.lastHit = S.t; slEv(S, 5, Math.min(1, -vn / 900), 0); }
        }
        if (ny < -.7) { S.ground = true; S.vx *= Math.pow(.02, dt); }
        S.spin *= .9;
      }
      for (const p of S.pads) {
        const hw = p.w / 2, rx = S.px - p.x, ry = S.py - p.y;
        const u = clamp(rx * p.tx + ry * p.ty, -hw, hw), qx = p.x + p.tx * u, qy = p.y + p.ty * u;
        const dx = S.px - qx, dy = S.py - qy, d = Math.hypot(dx, dy);
        if (d < SL_R + 7) {
          let nx = p.nx, ny = p.ny;
          if (dx * nx + dy * ny < 0) { nx = -nx; ny = -ny; }
          const vn = S.vx * nx + S.vy * ny;
          S.px = qx + nx * (SL_R + 7); S.py = qy + ny * (SL_R + 7);
          if (vn < 60) {
            const out = clamp(-vn * 1.08, 1050, 1500);
            S.vx += nx * (out - vn); S.vy += ny * (out - vn);
            S.att = -1; S.spin = clamp(S.vx / 110, -10, 10);
            p.sq = 1; slEv(S, 3, p.x, p.y);
          }
        }
        if (p.sq > 0) p.sq = Math.max(0, p.sq - dt * 3.5);
      }
      for (const b of S.bumps) {
        const dx = S.px - b.x, dy = S.py - b.y, d = Math.hypot(dx, dy);
        if (d < b.r + SL_R && d > 1e-4) {
          const nx = dx / d, ny = dy / d, vn = S.vx * nx + S.vy * ny;
          S.px = b.x + nx * (b.r + SL_R); S.py = b.y + ny * (b.r + SL_R);
          if (vn < 0) { const out = Math.max(820, -vn * 1.05); S.vx += nx * (out - vn); S.vy += ny * (out - vn); b.sq = 1; S.spin = clamp(S.vx / 120, -10, 10); slEv(S, 4, b.x, b.y); }
        }
        if (b.sq > 0) b.sq = Math.max(0, b.sq - dt * 4);
      }
      for (const r of S.rings) {
        if (r.cd > 0) r.cd -= dt;
        if (r.fx > 0) r.fx = Math.max(0, r.fx - dt * 2.5);
        const dx = S.px - r.x, dy = S.py - r.y;
        if (r.cd <= 0 && dx * dx + dy * dy < 44 * 44) {
          const sp = Math.max(1250, Math.hypot(S.vx, S.vy));
          S.vx = r.dx * sp; S.vy = r.dy * sp; S.att = -1; S.spin = 6; r.cd = .5; r.fx = 1; slEv(S, 8, r.x, r.y);
        }
      }
      for (const g of S.gemL) {
        if (g.got) continue;
        const dx = S.px - g.x, dy = S.py - g.y;
        if (dx * dx + dy * dy < 42 * 42) { g.got = 1; S.gems++; slEv(S, 9, g.x, g.y); }
      }
      const hr = SL_R * .72;
      for (const s of S.saws) { const dx = S.px - s.x, dy = S.py - s.y, r = s.r + hr; if (dx * dx + dy * dy < r * r) { slDie(S, 'saw'); return; } }
      for (const k of S.spikes) if (S.px + hr > k.x && S.px - hr < k.x + k.w && S.py + hr > k.y && S.py - hr < k.y + k.h) { slDie(S, 'spike'); return; }
      if (S.py > SL_FLOOR + 10) { slDie(S, 'fall'); return; }
      if (S.endless) S.best = Math.max(S.best, S.px);
      else if (S.px >= S.fin) { S.ph = 'won'; S.pt = 0; S.att = -1; S.spin = 8; slEv(S, 10, S.px, S.py); }
    }

    const SL_TH = {
      hills: { sky: ['#5fb4ff', '#d4f0ff'], far: '#9cd38c', near: '#6dbb5e', floor: ['#3d9be0', '#2066b8'], wall: ['#7a5a3a', '#5a3f26', '#6cc24f'], sun: '#fff7c2', cloud: 1 },
      works: { sky: ['#3b2a6e', '#ff9e63'], far: '#6b3f6e', near: '#47294f', floor: ['#ff7a2a', '#c23a12'], wall: ['#5a5f73', '#3b3f52', '#8a90a8'], sun: '#ffd3a1', cloud: .5 },
      night: { sky: ['#0a1030', '#2e3f86'], far: '#232f66', near: '#161e48', floor: ['#3a3f7a', '#1d2152'], wall: ['#3d4670', '#262c4f', '#7c8bd6'], sun: '#eef2ff', cloud: .3, stars: 1 }
    };

    function slBg(th, w, h, far) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'), R = gpRng(far ? 7 : 13), T0 = SL_TH[th];
      x.fillStyle = far ? T0.far : T0.near;
      if (th === 'hills') {
        x.beginPath(); x.moveTo(0, h);
        for (let i = 0; i <= w; i += 8) x.lineTo(i, h * (far ? .45 : .62) + Math.sin(i / w * TAU * (far ? 2 : 3)) * h * .08 + Math.sin(i / w * TAU * 5 + 1) * h * .03);
        x.lineTo(w, h); x.fill();
        if (!far) { x.fillStyle = hex(T0.near, -.18); for (let i = 0; i < 14; i++) { const tx = R() * w, ty = h * .62 + Math.sin(tx / w * TAU * 3) * h * .08; x.beginPath(); x.arc(tx, ty - 10, 16 + R() * 10, 0, TAU); x.fill(); x.fillRect(tx - 2, ty - 6, 4, 18); } }
      } else if (th === 'works') {
        for (let i = 0; i < w;) {
          const bw = 40 + R() * 80, bh = h * (far ? .25 + R() * .3 : .2 + R() * .25);
          x.fillRect(i, h - bh, bw, bh);
          if (R() < .5) x.fillRect(i + bw * .3, h - bh - 40 - R() * 60, 12, 100);
          i += bw + (far ? 4 : 18 + R() * 30);
        }
        if (!far) { x.fillStyle = 'rgba(255,190,120,.35)'; for (let i = 0; i < 60; i++) x.fillRect(R() * w, h - R() * h * .3, 6, 8); }
      } else {
        for (let i = 0; i < w;) {
          const bw = 30 + R() * 70, bh = h * (far ? .3 + R() * .35 : .2 + R() * .3);
          x.fillRect(i, h - bh, bw, bh);
          if (!far) { x.fillStyle = 'rgba(255,230,140,.55)'; for (let k = 0; k < 6; k++) x.fillRect(i + 6 + R() * (bw - 14), h - bh + 10 + R() * (bh - 20), 5, 7); x.fillStyle = T0.near; }
          i += bw + 6 + R() * 20;
        }
      }
      return c;
    }

    function slDrawMan(c, x, y, rot, sk, hang, t, sz, flail) {
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(sz, sz);
      const col = sk.body, ln = sk.line || hex(col, -.45);
      const sw = Math.sin(t * 9) * flail;
      const pts = hang ? [[-3, -36, -10, -21], [3, -36, 10, -22]] : [[-18, -19 - sw * 5, -10, -12], [18, -17 + sw * 5, 10, -11]];
      const legs = hang ? [[-5 - sw * 3, 31, -5, 20], [6 + sw * 3, 30, 5, 20]] : [[-9 + sw * 6, 30, -7, 20], [10 - sw * 6, 29, 8, 19]];
      const strokeAll = (w, cl) => {
        c.strokeStyle = cl; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 9);
        for (const a of pts) { c.moveTo(0, -8); c.lineTo(a[2], a[3]); c.lineTo(a[0], a[1]); }
        for (const a of legs) { c.moveTo(0, 9); c.lineTo(a[2], a[3]); c.lineTo(a[0], a[1]); }
        c.stroke();
      };
      strokeAll(8.5, ln); strokeAll(5.5, col);
      c.fillStyle = ln; c.beginPath(); c.arc(0, -21, 10.2, 0, TAU); c.fill();
      c.fillStyle = sk.head; c.beginPath(); c.arc(0, -21, 8.4, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.arc(-2.6, -24, 3, 0, TAU); c.fill();
      const hc = sk.hc || '#fff';
      if (sk.hat === 'band') { c.fillStyle = hc; c.fillRect(-8.6, -25, 17.2, 4); c.beginPath(); c.moveTo(-8, -24); c.lineTo(-16, -27 + sw * 3); c.lineTo(-15, -21 + sw * 3); c.closePath(); c.fill(); }
      else if (sk.hat === 'cap') { c.fillStyle = hc; c.beginPath(); c.arc(0, -23, 8.8, Math.PI, 0); c.fill(); c.fillRect(0, -24.5, 13, 3.4); }
      else if (sk.hat === 'helm') { c.fillStyle = hc; c.beginPath(); c.arc(0, -22, 9.6, Math.PI * .95, Math.PI * 2.05); c.fill(); c.fillStyle = '#5aa7ff'; c.fillRect(1, -24, 8, 4); }
      else if (sk.hat === 'ears') { c.fillStyle = sk.body; c.beginPath(); c.moveTo(-8, -26); c.lineTo(-6, -34); c.lineTo(-2, -28); c.moveTo(8, -26); c.lineTo(6, -34); c.lineTo(2, -28); c.fill(); c.strokeStyle = hc; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5, -15); c.lineTo(-2, -18); c.moveTo(5, -15); c.lineTo(2, -18); c.stroke(); }
      else if (sk.hat === 'crown') { c.fillStyle = hc; c.beginPath(); c.moveTo(-7, -27); c.lineTo(-8, -35); c.lineTo(-3.5, -31); c.lineTo(0, -37); c.lineTo(3.5, -31); c.lineTo(8, -35); c.lineTo(7, -27); c.closePath(); c.fill(); }
      else if (sk.hat === 'halo') { c.strokeStyle = hc; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, -34, 8, 2.6, 0, 0, TAU); c.stroke(); }
      c.restore();
    }
    const SL_STAR_SVG = on => `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" fill="${on ? '#ffd23a' : 'rgba(255,255,255,.18)'}" stroke="${on ? '#b07a00' : 'rgba(0,0,0,.3)'}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    const SL_GEM_SVG = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 3h12l4 6-10 12L2 9z" fill="#3fe0d0" stroke="#0e8a80" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 9h20M9 3l3 18 3-18" fill="none" stroke="#0e8a80" stroke-width="1"/></svg>';

    const SL_CSS = `
.gm-swing-line .sl-btns{position:absolute;top:10px;right:10px;z-index:2;display:flex;gap:8px;line-height:1}
.gm-swing-line .sl-btns button{appearance:none;width:40px;height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.35);background:rgba(10,16,40,.55);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.gm-swing-line .sl-btns button:hover{background:rgba(10,16,40,.8)}
.gm-swing-line .sl-btns svg{width:20px;height:20px}
.gm-swing-line .sl-wtabs{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px}
.gm-swing-line .sl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr));gap:8px}
.gm-swing-line .sl-lv{appearance:none;position:relative;text-align:left;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf0ff;border-radius:12px;padding:10px 12px;cursor:pointer;font-family:${FONT};min-height:84px}
.gm-swing-line .sl-lv:hover{border-color:var(--ac);background:rgba(255,255,255,.12)}
.gm-swing-line .sl-lv b{display:block;font:900 20px/1 ${FONT}}
.gm-swing-line .sl-lv span{display:block;font:700 12px/1.3 ${FONT};opacity:.8;margin:4px 0 6px}
.gm-swing-line .sl-lv i{font-style:normal;display:flex;gap:1px}
.gm-swing-line .sl-lv small{position:absolute;right:10px;top:12px;font:800 11px/1 ${FONT};opacity:.7}
.gm-swing-line .sl-lv:disabled{opacity:.38;pointer-events:none}
.gm-swing-line .sl-lv.next{border-color:var(--ac);box-shadow:0 0 0 2px color-mix(in srgb,var(--ac) 40%,transparent)}
.gm-swing-line .sl-skins{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,140px),1fr));gap:8px}
.gm-swing-line .sl-sk{appearance:none;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf0ff;border-radius:12px;padding:8px;cursor:pointer;font-family:${FONT};display:flex;flex-direction:column;align-items:center;gap:4px}
.gm-swing-line .sl-sk.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 30%,rgba(255,255,255,.06))}
.gm-swing-line .sl-sk canvas{width:72px;height:72px}
.gm-swing-line .sl-sk b{font:900 13px/1.1 ${FONT}}
.gm-swing-line .sl-sk span{font:800 12px/1 ${FONT};opacity:.85;display:flex;align-items:center;gap:4px}
.gm-swing-line .sl-sk.lock{opacity:.6}
.gm-swing-line .sl-big{display:flex;gap:4px;justify-content:center;margin:0 0 2cqw}
.gm-swing-line .sl-big svg{width:clamp(30px,8cqw,64px);height:clamp(30px,8cqw,64px)}
.gm-swing-line .sl-pill{display:inline-flex;align-items:center;gap:5px}
.gm-swing-line .gx-mode span span{display:inline;font-size:inherit;opacity:1}
`;

    function mountSwing(root, api) {
      const ID = 'swing-line';
      const portrait = matchMedia('(pointer: coarse)').matches && innerHeight > innerWidth * 1.15;
      const W = portrait ? 540 : 960, H = portrait ? 760 : 540;
      const A = makeAudio(api);
      const st = makeStage(root, api, ID, W, H, null);
      st.audio = A;
      const ctx = st.ctx;
      const keys = api.keys;
      const btns = document.createElement('div');
      btns.className = 'sl-btns';
      btns.innerHTML = '<button type="button" data-b="levels" aria-label="Levels" title="Levels"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg></button><button type="button" data-b="retry" aria-label="Restart level" title="Restart level (R)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg></button>';
      st.stage.append(btns);

      const SAVE_V = 1;
      const fresh = () => ({ v: SAVE_V, lv: {}, gems: 0, own: ['ink'], skin: 'ink', endless: 0, deaths: 0 });
      const P = (() => {
        const s = api.load(), f = fresh();
        if (!s || typeof s !== 'object' || Array.isArray(s)) return f;
        if (s.lv && typeof s.lv === 'object' && !Array.isArray(s.lv)) {
          for (const k of Object.keys(s.lv).slice(0, 200)) {
            const m = /^(\d)-(\d{1,2})$/.exec(k), r = s.lv[k];
            if (!m || !SL_LEVELS[+m[1]] || !SL_LEVELS[+m[1]][+m[2]] || !r || typeof r !== 'object') continue;
            const st0 = Math.floor(+r.s) & 7, t = +r.t, g = Math.floor(+r.g);
            f.lv[k] = { s: st0 | 1, t: isFinite(t) && t > 0 && t < 3600 ? t : 0, g: isFinite(g) && g >= 0 && g < 100 ? g : 0 };
          }
        }
        const gm = Math.floor(+s.gems); if (isFinite(gm) && gm >= 0 && gm < 1e7) f.gems = gm;
        if (Array.isArray(s.own)) f.own = ['ink'].concat(s.own.filter(x => typeof x === 'string' && SL_SKINS.some(k => k.id === x) && x !== 'ink')).slice(0, 40);
        if (typeof s.skin === 'string' && f.own.includes(s.skin)) f.skin = s.skin;
        const e = +s.endless; if (isFinite(e) && e > 0 && e < 1e7) f.endless = Math.floor(e);
        const dd = Math.floor(+s.deaths); if (isFinite(dd) && dd >= 0 && dd < 1e9) f.deaths = dd;
        return f;
      })();
      const persist = () => api.save(P);
      const key = (w, l) => w + '-' + l;
      const starsOf = (w, l) => { const r = P.lv[key(w, l)]; return r ? (r.s & 1) + (r.s >> 1 & 1) + (r.s >> 2 & 1) : 0; };
      const totalStars = () => { let n = 0; for (let w = 0; w < SL_LEVELS.length; w++) for (let l = 0; l < SL_LEVELS[w].length; l++) n += starsOf(w, l); return n; };
      const maxStars = () => SL_LEVELS.reduce((a, w) => a + w.length * 3, 0);
      const unlocked = (w, l) => (w === 0 && l === 0) || !!P.lv[l > 0 ? key(w, l - 1) : key(w - 1, SL_LEVELS[w - 1].length - 1)];
      const nextLevel = () => { for (let w = 0; w < SL_LEVELS.length; w++) for (let l = 0; l < SL_LEVELS[w].length; l++) if (!P.lv[key(w, l)]) return [w, l]; return [SL_LEVELS.length - 1, SL_LEVELS[SL_LEVELS.length - 1].length - 1]; };
      const skin = () => SL_SKINS.find(k => k.id === P.skin) || SL_SKINS[0];
      if (totalStars() > 0) api.submit(totalStars());

      A.bank = {
        click() { A.tone('sine', 660, 900, .05, .1); },
        grab() { A.noise('highpass', 2400, 5200, 1.2, .07, .09, 0, .002); A.tone('triangle', 520, 880, .07, .07); },
        free() { A.noise('bandpass', 900, 300, 1, .16, .05, 0, .02); },
        pad() { A.tone('sine', 180, 560, .26, .18); A.tone('triangle', 360, 1120, .2, .06, .02); },
        bump() { A.tone('square', 700, 380, .08, .06); A.tone('sine', 900, 1400, .12, .09); },
        wall() { A.tone('triangle', 150, 70, .1, .12); A.noise('lowpass', 700, 200, .8, .08, .08); },
        gem() { A.tone('sine', 1319, 1319, .07, .08); A.tone('sine', 1976, 1976, .16, .07, .06); },
        ring() { A.noise('bandpass', 600, 3200, 1.4, .35, .12, 0, .01); A.tone('sawtooth', 300, 900, .3, .04); },
        crack() { A.noise('highpass', 1800, 900, .9, .12, .12, 0, .002); A.tone('square', 200, 90, .1, .05); },
        die() { A.tone('sawtooth', 380, 90, .35, .09); A.noise('lowpass', 1200, 150, .8, .3, .16); },
        win() { [523, 659, 784, 1047].forEach((f, i) => { A.tone('square', f, f, .18, .045, i * .1); A.tone('triangle', f / 2, f / 2, .24, .08, i * .1); }); A.tone('triangle', 1319, 1319, .5, .07, .42); }
      };

      const bgCache = {};
      const getBg = th => bgCache[th] || (bgCache[th] = { far: slBg(th, 1400, Math.round(H * .7), 1), near: slBg(th, 1700, Math.round(H * .6), 0), sky: null, stars: null });
      const PN = 260, PX = new Float32Array(PN), PY = new Float32Array(PN), PVX = new Float32Array(PN), PVY = new Float32Array(PN), PL = new Float32Array(PN), PM = new Float32Array(PN), PS = new Float32Array(PN), PC = new Array(PN).fill('#fff');
      let pi = 0;
      const burst = (x, y, n, col, sp, life, size) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (.3 + Math.random() * .7); PX[pi] = x; PY[pi] = y; PVX[pi] = Math.cos(a) * v; PVY[pi] = Math.sin(a) * v - sp * .2; PL[pi] = PM[pi] = life * (.6 + Math.random() * .4); PS[pi] = size * (.6 + Math.random() * .6); PC[pi] = col; pi = (pi + 1) % PN; } };
      const TN = 22, TRX = new Float32Array(TN), TRY = new Float32Array(TN);
      let tri = 0, trn = 0;

      let scr = 'menu', S = null, lvW = 0, lvL = 0, mode = 'level', acc = 0, hold = false, keyHold = false, ptrs = new Set(), cam = { x: 0, y: 0, z: 1 }, tryN = 1, deadShown = false, resT = 0, world = 0, endSeed = 1, shake = 0, ftime = 0, hudKey = '', hudCache = null, newBest = false;
      const Z = portrait ? 540 / 680 : H / 600;
      const view = () => ({ w: W / cam.z, h: H / cam.z });

      function levelDef(w, l) { return SL_LEVELS[w][l]; }
      function startLevel(w, l, keepTry) {
        mode = 'level'; lvW = w; lvL = l; world = w;
        S = slCompile(levelDef(w, l));
        if (!keepTry) tryN = 1;
        resetRun();
      }
      function startEndless() {
        mode = 'endless'; world = 0; endSeed = (Math.random() * 1e9) >>> 0;
        S = slCompile({ n: 'Endless', f: 1e9, par: 0, o: [], endless: 1, seed: endSeed });
        tryN = 1; resetRun();
      }
      function resetRun() {
        acc = 0; deadShown = false; trn = 0; newBest = false;
        hold = keyHold || ptrs.size > 0; S.prev = hold;
        cam.z = Z; cam.x = S.px + view().w * .2; cam.y = camY(S.py);
        scr = 'play'; st.showPlay(); st.hideOv(); btns.hidden = false;
        api.score(mode === 'endless' ? '0 m' : (lvW + 1) + '-' + (lvL + 1));
      }
      function retry() {
        if (!S) return;
        tryN++;
        if (mode === 'endless') { S = slCompile({ n: 'Endless', f: 1e9, par: 0, o: [], endless: 1, seed: endSeed = (Math.random() * 1e9) >>> 0 }); resetRun(); }
        else startLevel(lvW, lvL, true);
      }
      function camY(py) { const v = view(); return Math.min(py - v.h * .05, SL_FLOOR + 60 - v.h / 2); }

      const levelsHtml = () => {
        const w = world;
        const tabs = SL_WORLDS.map((x, i) => `<button type="button" class="gx-chip${i === w ? ' on' : ''}" data-a="world" data-w="${i}"${unlocked(i, 0) ? '' : ' disabled'}>${i + 1}. <span>${x.n}</span></button>`).join('');
        const nl = nextLevel();
        const cards = SL_LEVELS[w].map((d, l) => {
          const r = P.lv[key(w, l)], s = starsOf(w, l), ok = unlocked(w, l);
          return `<button type="button" class="sl-lv${nl[0] === w && nl[1] === l && !r ? ' next' : ''}" data-a="lv" data-w="${w}" data-l="${l}"${ok ? '' : ' disabled'}><b>${w + 1}-${l + 1}</b><span>${d.n}</span><i>${SL_STAR_SVG(s > 0)}${SL_STAR_SVG(s > 1)}${SL_STAR_SVG(s > 2)}</i>${r && r.t ? `<small>${r.t.toFixed(2)} s</small>` : ''}</button>`;
        }).join('');
        return `<div class="gx-top"><h2 class="gx-logo" translate="no">Swing <b>Line</b></h2><div class="gx-row"><span class="gx-chip on sl-pill" style="pointer-events:none">${SL_STAR_SVG(1)}<span>${totalStars()} / ${maxStars()}</span></span><span class="gx-chip sl-pill" style="pointer-events:none">${SL_GEM_SVG}<span>${P.gems}</span></span></div></div>
<div class="sl-wtabs">${tabs}</div><div class="sl-grid">${cards}</div>
<div class="gx-row" style="margin-top:12px">${st.btn('menu', 'Back', 'alt sm')}</div>`;
      };
      const skinCanvases = () => {
        st.menuEl.querySelectorAll('canvas[data-sk]').forEach(cv => {
          const sk = SL_SKINS.find(k => k.id === cv.dataset.sk); if (!sk) return;
          const d = Math.min(2, window.devicePixelRatio || 1); cv.width = 72 * d; cv.height = 72 * d;
          const c = cv.getContext('2d'); c.scale(d, d); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, 0, 72, 72);
          slDrawMan(c, 36, 40, .25, sk, false, .3, 1.15, .6);
        });
      };
      const skinsHtml = () => {
        const ts = totalStars();
        return `<div class="gx-top"><h2 class="gx-logo" translate="no">Swing <b>Line</b></h2><div class="gx-row"><span class="gx-chip on sl-pill" style="pointer-events:none">${SL_GEM_SVG}<span>${P.gems}</span></span></div></div>
<p class="gx-tag">Collect gems in levels and in Endless to buy outfits. Two outfits are earned with stars.</p>
<div class="sl-skins">${SL_SKINS.map(k => {
          const own = P.own.includes(k.id), on = P.skin === k.id;
          const lock = !own && (k.stars ? ts < k.stars : P.gems < k.cost);
          const price = own ? (on ? 'Selected' : 'Owned') : k.stars ? `${SL_STAR_SVG(1)}<span>${k.stars}</span>` : `${SL_GEM_SVG}<span>${k.cost}</span>`;
          return `<button type="button" class="sl-sk${on ? ' on' : ''}${lock ? ' lock' : ''}" data-a="skin" data-k="${k.id}"><canvas data-sk="${k.id}" width="72" height="72"></canvas><b>${k.n}</b><span>${own ? `<span>${price}</span>` : price}</span></button>`;
        }).join('')}</div>
<div class="gx-row" style="margin-top:12px">${st.btn('menu', 'Back', 'alt sm')}</div>`;
      };
      function showMenu() {
        scr = 'menu'; S = null; api.score('—');
        const nl = nextLevel(), done = !!P.lv[key(nl[0], nl[1])];
        st.showMenu(`
<div class="gx-top"><h2 class="gx-logo" translate="no">Swing <b>Line</b></h2><div class="gx-row"><span class="gx-chip on sl-pill" style="pointer-events:none">${SL_STAR_SVG(1)}<span>${totalStars()} / ${maxStars()}</span></span><span class="gx-chip sl-pill" style="pointer-events:none">${SL_GEM_SVG}<span>${P.gems}</span></span></div></div>
<p class="gx-tag">Hold to grab the nearest hook, let go to fly. Keep your speed, dodge the saws, reach the finish.</p>
<div class="gx-modes">
  <button type="button" class="gx-mode" data-a="play"><b>${done ? 'Play' : totalStars() ? 'Continue' : 'Play'}</b><span>${done ? 'Every level is open. Go back for missing stars.' : `<span>Level</span> ${nl[0] + 1}-${nl[1] + 1} · ${levelDef(nl[0], nl[1]).n}`}</span></button>
  <button type="button" class="gx-mode" data-a="levels"><b>Levels</b><span>Three worlds of ten levels. Three stars each: finish, every gem, beat the target time.</span></button>
  <button type="button" class="gx-mode" data-a="endless"><b>Endless</b><span>Hooks forever. How far can you swing? <span>Best</span> ${P.endless} m</span></button>
  <button type="button" class="gx-mode" data-a="skins"><b>Outfits</b><span>Spend gems on new looks for your stickman.</span></button>
</div>
<p class="gx-help"><kbd>&#128433;</kbd> <kbd>&#9757;</kbd> <kbd>Space</kbd> <span>hold to grab, release to let go</span> · <kbd>R</kbd> <span>restart level</span> · <kbd>Esc</kbd> <span>pause</span><br><span>Let go on the way up to fly far.</span> <span>Bounce pads launch you, rings boost you, cracked hooks break a moment after you grab them.</span></p>`);
      }
      function showLevels() { scr = 'levels'; S = null; st.showMenu(levelsHtml()); }
      function showSkins() { scr = 'skins'; st.showMenu(skinsHtml()); skinCanvases(); }

      function finishLevel() {
        const d = levelDef(lvW, lvL), k = key(lvW, lvL), old = P.lv[k] || { s: 0, t: 0, g: 0 };
        const all = S.gems >= S.gemsTot, fast = S.run <= d.par;
        const mask = 1 | (all ? 2 : 0) | (fast ? 4 : 0);
        const gain = S.gems;
        const nb = !old.t || S.run < old.t;
        P.lv[k] = { s: old.s | mask, t: nb ? Math.round(S.run * 100) / 100 : old.t, g: Math.max(old.g, S.gems) };
        P.gems += gain;
        persist();
        api.submit(totalStars());
        const s = starsOf(lvW, lvL), last = lvW === SL_LEVELS.length - 1 && lvL === SL_LEVELS[lvW].length - 1;
        scr = 'result';
        st.card('Level complete!', `${lvW + 1}-${lvL + 1} · ${d.n}`, (last ? '' : st.btn('next', 'Next level')) + st.btn('retry', 'Retry', 'alt') + st.btn('levels', 'Levels', 'alt'),
          `<div class="sl-big">${[1, 2, 4].map(b => SL_STAR_SVG(mask & b).replace('width="18" height="18"', '')).join('')}</div>` +
          st.stats([['Time', S.run.toFixed(2) + ' s'], ['Target', d.par + ' s'], ['Gems', S.gems + ' / ' + S.gemsTot], ['Best', P.lv[k].t.toFixed(2) + ' s']]) +
          `<p class="gx-op">${[fast ? '' : 'Beat the target time for a star.', all ? '' : 'Collect every gem in one run for a star.', s === 3 ? 'All three stars!' : '', nb && old.t ? 'New best time!' : ''].filter(Boolean).map(x => `<span>${x}</span>`).join(' ')}</p>`);
      }
      function endEndless() {
        const m = Math.floor(S.best / 40);
        const nb = m > P.endless;
        if (nb) P.endless = m;
        P.gems += S.gems; persist();
        scr = 'result';
        st.card(nb ? 'New best!' : 'Run over', '', st.btn('endless', 'Swing again') + st.btn('menu', 'Menu', 'alt'), st.stats([['Distance', m + ' m'], ['Best', P.endless + ' m'], ['Gems', '+' + S.gems]]));
      }

      st.onAct = (a, ds) => {
        A.ctx();
        if (a === 'play') { const nl = nextLevel(); startLevel(nl[0], nl[1]); }
        else if (a === 'levels') { world = scr === 'result' || scr === 'play' ? lvW : nextLevel()[0]; showLevels(); }
        else if (a === 'world') { world = +ds.w; showLevels(); }
        else if (a === 'lv') { if (unlocked(+ds.w, +ds.l)) startLevel(+ds.w, +ds.l); }
        else if (a === 'endless') startEndless();
        else if (a === 'skins') showSkins();
        else if (a === 'menu') showMenu();
        else if (a === 'retry') { if (mode === 'endless') startEndless(); else startLevel(lvW, lvL); }
        else if (a === 'next') { let w = lvW, l = lvL + 1; if (l >= SL_LEVELS[w].length) { w++; l = 0; } if (SL_LEVELS[w]) startLevel(w, l); else showLevels(); }
        else if (a === 'skin') {
          const k = SL_SKINS.find(x => x.id === ds.k); if (!k) return;
          if (P.own.includes(k.id)) P.skin = k.id;
          else if (k.stars ? totalStars() >= k.stars : P.gems >= k.cost) { if (!k.stars) P.gems -= k.cost; P.own.push(k.id); P.skin = k.id; A.play('gem'); }
          else { A.play('wall'); return; }
          persist(); showSkins();
        }
      };
      btns.addEventListener('click', e => {
        const b = e.target.closest('[data-b]'); if (!b || scr !== 'play') return;
        A.play('click');
        if (b.dataset.b === 'retry') retry(); else { world = lvW; mode === 'endless' ? showMenu() : showLevels(); }
      });

      const setHold = () => { hold = keyHold || ptrs.size > 0; };
      root.gpState = () => S && { scr, mode, w: lvW, l: lvL, ph: S.ph, run: S.run, gems: S.gems, gemsTot: S.gemsTot, tries: tryN, px: S.px, py: S.py, best: Math.floor(S.best / 40), stars: totalStars() };
      st.canvas.addEventListener('pointerdown', e => {
        if (scr !== 'play') return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault(); A.ctx();
        ptrs.add(e.pointerId); setHold();
        try { st.canvas.setPointerCapture(e.pointerId); } catch (x) {}
      });
      const up = e => { if (ptrs.delete(e.pointerId)) setHold(); };
      api.on(window, 'pointerup', up); api.on(window, 'pointercancel', up);
      st.canvas.addEventListener('lostpointercapture', up);
      st.canvas.addEventListener('contextmenu', e => e.preventDefault());
      const HK = ['Space', 'ArrowUp', 'KeyW', 'KeyZ', 'KeyX', 'ShiftLeft', 'ShiftRight'];
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (scr === 'result' && (e.code === 'Enter' || e.code === 'Space') && !e.repeat) { e.preventDefault(); const b = st.ovEl.querySelector('[data-a="next"],[data-a="endless"],[data-a="retry"]'); if (b) b.click(); return; }
        if (scr === 'menu' && e.code === 'Enter' && !e.repeat) { st.onAct('play', {}); return; }
        if (scr !== 'play') return;
        if (HK.includes(e.code)) { e.preventDefault(); A.ctx(); keyHold = true; setHold(); }
        else if (e.code === 'KeyR' && !e.repeat) retry();
      });
      api.on(window, 'keyup', e => { if (HK.includes(e.code)) { keyHold = HK.some(k => k !== e.code && keys.has(k)); setHold(); } });
      api.on(window, 'blur', () => { keyHold = false; ptrs.clear(); setHold(); });

      function handleEvents() {
        const ev = S.ev;
        for (let i = 0; i < ev.length; i += 3) {
          const k = ev[i], a = ev[i + 1], b = ev[i + 2];
          if (k === 1) A.play('grab', 40);
          else if (k === 2) A.play('free', 60);
          else if (k === 3) { A.play('pad', 80); burst(a, b - 8, 10, '#ffffff', 260, .5, 4); }
          else if (k === 4) { A.play('bump', 60); burst(S.px, S.py, 8, '#ffe27a', 240, .4, 3.5); }
          else if (k === 5) { A.play('wall', 90); shake = Math.max(shake, 4 * a); }
          else if (k === 6) { A.play('die'); shake = 10; const sk = skin(); if (S.die === 'fall') { const th = SL_TH[SL_WORLDS[world].th]; burst(a, SL_FLOOR, 22, th.floor[0], 460, .9, 6); burst(a, SL_FLOOR, 16, '#ffffff', 380, .7, 4); } else { burst(a, b, 26, sk.body, 420, .9, 6); burst(a, b, 14, '#ffffff', 300, .6, 3); } P.deaths++; }
          else if (k === 7) { A.play('crack'); burst(a, b, 12, '#c9b48a', 220, .6, 4); }
          else if (k === 8) { A.play('ring', 100); burst(a, b, 16, '#7af0ff', 320, .5, 4); }
          else if (k === 9) { A.play('gem', 30); burst(a, b, 10, '#5ff0e0', 200, .5, 3.5); }
          else if (k === 10) { A.play('win'); for (let j = 0; j < 4; j++) burst(a + 60, b - 60, 18, ['#ff5a7a', '#ffd23a', '#5ad1ff', '#7aff8a'][j], 520, 1.4, 5); }
        }
        ev.length = 0;
      }

      function frame(dt) {
        if (scr !== 'play' && scr !== 'result') return;
        if (!S) return;
        ftime += dt;
        acc += dt;
        let n = 0;
        const drv = root.gpDrive;
        while (acc >= SL_STEP && n < 12) { acc -= SL_STEP; n++; slStep(S, (drv ? !!drv(S) : hold) && scr === 'play'); }
        if (n >= 12) acc = 0;
        handleEvents();
        if (scr === 'play') {
          if (S.ph === 'dead' && S.pt > .7 && !deadShown) {
            deadShown = true;
            if (mode === 'endless') endEndless(); else { persist(); retry(); return; }
          }
          if (S.ph === 'won' && S.pt > .9) finishLevel();
          if (mode === 'endless') { const m = Math.floor(S.best / 40) + ' m'; if (m !== hudKey) { hudKey = m; api.score(m); } }
        }
        const v = view();
        const look = clamp(S.vx * .22, -v.w * .12, v.w * .28);
        const tx = S.px + look, ty = camY(S.py);
        const k = 1 - Math.pow(.004, dt), ky = 1 - Math.pow(.02, dt);
        cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * ky;
        if (cam.x - v.w / 2 < -300) cam.x = -300 + v.w / 2;
        shake *= Math.pow(.002, dt);
        if (S.ph !== 'dead') { TRX[tri] = S.px; TRY[tri] = S.py; tri = (tri + 1) % TN; trn = Math.min(TN, trn + 1); }
        draw(dt);
      }
      api.loop(frame);

      function draw(dt) {
        const c = ctx, th = SL_TH[SL_WORLDS[world].th], bg = getBg(SL_WORLDS[world].th), v = view();
        if (!bg.sky) { bg.sky = c.createLinearGradient(0, 0, 0, H); bg.sky.addColorStop(0, th.sky[0]); bg.sky.addColorStop(1, th.sky[1]); }
        c.fillStyle = bg.sky; c.fillRect(0, 0, W, H);
        if (th.stars) { c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 70; i++) { const sx = ((i * 137.5 - cam.x * .03) % W + W) % W, sy = (i * 61.3) % (H * .6); c.fillRect(sx, sy, i % 3 ? 1.5 : 2.5, i % 3 ? 1.5 : 2.5); } }
        c.fillStyle = th.sun; c.globalAlpha = .9; c.beginPath(); c.arc(W * .78, H * .2, H * .09, 0, TAU); c.fill(); c.globalAlpha = .1; c.beginPath(); c.arc(W * .78, H * .2, H * .13, 0, TAU); c.fill(); c.globalAlpha = 1;
        if (th.cloud) { c.fillStyle = bg.cloud || (bg.cloud = `rgba(255,255,255,${.55 * th.cloud})`); for (let i = 0; i < 6; i++) { const sx = ((i * 380 - cam.x * .08 - ftime * 8) % (W + 400) + W + 400) % (W + 400) - 200, sy = H * (.12 + (i % 3) * .1); c.beginPath(); c.moveTo(sx + 70, sy); c.ellipse(sx, sy, 70, 16, 0, 0, TAU); c.moveTo(sx + 66, sy - 8); c.arc(sx + 30, sy - 8, 36, 0, TAU); c.moveTo(sx - 6, sy - 4); c.arc(sx - 28, sy - 4, 22, 0, TAU); c.fill(); } }
        const yo = (cam.y - 300) * cam.z;
        const par = (img, f, base) => { const iw = img.width, ox = ((-cam.x * f * cam.z) % iw + iw) % iw - iw, y = base - yo * f; for (let x = ox; x < W; x += iw) c.drawImage(img, x, y); };
        par(bg.far, .12, H - bg.far.height + 30);
        par(bg.near, .3, H - bg.near.height + 60);
        const sx = x => (x - cam.x) * cam.z + W / 2 + (shake ? (Math.random() - .5) * shake : 0), sy = y => (y - cam.y) * cam.z + H / 2;
        const ox = sx(0), oy = sy(0);
        c.save();
        c.translate(ox, oy); c.scale(cam.z, cam.z);
        const L0 = cam.x - v.w / 2 - 80, R0 = cam.x + v.w / 2 + 80, T0 = cam.y - v.h / 2 - 80, B0 = cam.y + v.h / 2 + 80;
        for (const w of S.winds) {
          if (w.x > R0 || w.x + w.w < L0) continue;
          c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(w.x, Math.max(T0, w.y), w.w, Math.min(B0, w.y + w.h) - Math.max(T0, w.y));
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2.5; c.lineCap = 'round';
          const ang = Math.atan2(w.fy, w.fx), ca = Math.cos(ang), sa = Math.sin(ang), sp = Math.hypot(w.fx, w.fy) * .12;
          c.beginPath();
          for (let i = 0; i < 18; i++) {
            const u = ((i * 0.618) % 1), q = ((i * 0.377 + ftime * sp / 200) % 1);
            const px = w.fx ? w.x + q * w.w : w.x + u * w.w, py = w.fx ? w.y + u * w.h : w.y + w.h - q * w.h;
            if (py < T0 || py > B0) continue;
            c.moveTo(px, py); c.lineTo(px + ca * 34, py + sa * 34);
          }
          c.stroke();
        }
        for (const w of S.walls) {
          if (w.x > R0 || w.x + w.w < L0 || w.y > B0 || w.y + w.h < T0) continue;
          const wy = Math.max(w.y, T0 - 20), wh = Math.min(w.y + w.h, B0 + 20) - wy;
          c.fillStyle = th.wall[1]; rrect(c, w.x, wy, w.w, wh, 8); c.fill();
          c.fillStyle = th.wall[0]; rrect(c, w.x + 4, wy + 4, w.w - 8, wh - 8, 6); c.fill();
          if (w.y >= T0 - 20) { c.fillStyle = th.wall[2]; rrect(c, w.x - 2, w.y - 2, w.w + 4, 14, 6); c.fill(); }
        }
        const fy = SL_FLOOR, wav = Math.sin(ftime * 2) * 4;
        c.fillStyle = th.floor[1]; c.fillRect(L0, fy + 18, R0 - L0, Math.max(0, B0 - fy));
        c.fillStyle = th.floor[0];
        c.beginPath(); c.moveTo(L0, B0 + 40);
        for (let x = Math.floor(L0 / 40) * 40; x <= R0 + 40; x += 40) c.lineTo(x, fy + Math.sin(x * .03 + ftime * 2.4) * 5 + wav);
        c.lineTo(R0 + 40, B0 + 40); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = Math.floor(L0 / 120) * 120; x <= R0; x += 120) c.fillRect(x + (ftime * 30 % 120), fy + 26 + (x / 120 % 3) * 14, 40, 3);
        for (const k of S.spikes) {
          if (k.x > R0 || k.x + k.w < L0) continue;
          c.fillStyle = '#d7dbe6'; c.strokeStyle = '#5a6074'; c.lineWidth = 2;
          c.beginPath();
          const n = Math.max(1, Math.round(k.w / 22)), sw = k.w / n;
          for (let i = 0; i < n; i++) { const x0 = k.x + i * sw; if (k.d) { c.moveTo(x0, k.y); c.lineTo(x0 + sw / 2, k.y + k.h); c.lineTo(x0 + sw, k.y); } else { c.moveTo(x0, k.y + k.h); c.lineTo(x0 + sw / 2, k.y); c.lineTo(x0 + sw, k.y + k.h); } }
          c.fill(); c.stroke();
          c.fillStyle = '#5a6074'; c.fillRect(k.x, k.d ? k.y - 6 : k.y + k.h, k.w, 6);
        }
        for (const p of S.pads) {
          if (p.x - p.w > R0 || p.x + p.w < L0) continue;
          c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.ty, p.tx));
          const sq = Math.sin(p.sq * Math.PI) * 10;
          c.fillStyle = '#3a3f52'; c.fillRect(-p.w / 2 + 10, 0, 10, 40); c.fillRect(p.w / 2 - 20, 0, 10, 40);
          c.strokeStyle = '#c8ccd8'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(-p.w / 2 + 15 - 6, 4 + i * 7 - sq * .4); c.lineTo(-p.w / 2 + 15 + 6, 7 + i * 7 - sq * .4); c.moveTo(p.w / 2 - 15 - 6, 4 + i * 7 - sq * .4); c.lineTo(p.w / 2 - 15 + 6, 7 + i * 7 - sq * .4); } c.stroke();
          c.fillStyle = '#1aa0ff'; rrect(c, -p.w / 2, -10 - sq, p.w, 16, 8); c.fill();
          c.fillStyle = '#7fd0ff'; rrect(c, -p.w / 2 + 6, -8 - sq, p.w - 12, 5, 3); c.fill();
          c.restore();
        }
        for (const b of S.bumps) {
          if (b.x - b.r > R0 || b.x + b.r < L0) continue;
          const r = b.r * (1 + Math.sin(b.sq * Math.PI) * .12);
          c.fillStyle = '#b8236a'; c.beginPath(); c.arc(b.x, b.y, r, 0, TAU); c.fill();
          c.fillStyle = '#ff4f9a'; c.beginPath(); c.arc(b.x, b.y, r * .84, 0, TAU); c.fill();
          c.fillStyle = '#ffd0e4'; c.beginPath(); c.arc(b.x, b.y, r * .4, 0, TAU); c.fill();
          c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(b.x - r * .35, b.y - r * .4, r * .18, 0, TAU); c.fill();
        }
        for (const r of S.rings) {
          if (r.x - 60 > R0 || r.x + 60 < L0) continue;
          c.save(); c.translate(r.x, r.y); c.rotate(Math.atan2(r.dy, r.dx));
          const pul = 1 + Math.sin(ftime * 6) * .05 + r.fx * .25;
          c.lineWidth = 9; c.strokeStyle = '#0e7a8a'; c.beginPath(); c.ellipse(0, 0, 14 * pul, 46 * pul, 0, 0, TAU); c.stroke();
          c.lineWidth = 5; c.strokeStyle = r.fx > 0 ? '#ffffff' : '#5ff0ff'; c.beginPath(); c.ellipse(0, 0, 14 * pul, 46 * pul, 0, 0, TAU); c.stroke();
          c.fillStyle = 'rgba(95,240,255,.8)'; for (let i = 0; i < 3; i++) { const ax = 26 + i * 16 + (ftime * 60 % 16); c.beginPath(); c.moveTo(ax, -8); c.lineTo(ax + 10, 0); c.lineTo(ax, 8); c.closePath(); c.fill(); }
          c.restore();
        }
        for (const g of S.gemL) {
          if (g.got || g.x > R0 || g.x < L0 || g.y < T0 || g.y > B0) continue;
          const by = g.y + Math.sin(ftime * 3 + g.x) * 4;
          c.fillStyle = '#0e8a80'; c.beginPath(); c.moveTo(g.x - 13, by - 4); c.lineTo(g.x - 7, by - 12); c.lineTo(g.x + 7, by - 12); c.lineTo(g.x + 13, by - 4); c.lineTo(g.x, by + 13); c.closePath(); c.fill();
          c.fillStyle = '#3fe0d0'; c.beginPath(); c.moveTo(g.x - 10, by - 4); c.lineTo(g.x - 5.5, by - 9.5); c.lineTo(g.x + 5.5, by - 9.5); c.lineTo(g.x + 10, by - 4); c.lineTo(g.x, by + 9); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(g.x - 5, by - 7); c.lineTo(g.x - 1, by - 7); c.lineTo(g.x - 4, by - 2); c.closePath(); c.fill();
        }
        if (!S.endless && S.fin < R0 + 200) {
          const fx = S.fin;
          for (let y = Math.floor(T0 / 30) * 30; y < Math.min(B0, SL_FLOOR); y += 30) for (let i = 0; i < 2; i++) { c.fillStyle = ((y / 30 + i) & 1) ? '#1d2333' : '#ffffff'; c.globalAlpha = .55; c.fillRect(fx + i * 15, y, 15, 30); }
          c.globalAlpha = 1;
          c.fillStyle = '#ffd23a'; c.fillRect(fx - 4, T0, 4, SL_FLOOR - T0); c.fillRect(fx + 30, T0, 4, SL_FLOOR - T0);
        }
        for (const s of S.saws) {
          if (s.x - s.r > R0 || s.x + s.r < L0) continue;
          if (s.n && s.i === 0) { c.strokeStyle = '#3a3f52'; c.lineWidth = 8; c.beginPath(); for (let i = 0; i < s.n; i++) { const a = S.t * s.sp + TAU * i / s.n; c.moveTo(s.cx, s.cy); c.lineTo(s.cx + Math.cos(a) * s.R, s.cy + Math.sin(a) * s.R); } c.stroke(); c.fillStyle = '#5a6074'; c.beginPath(); c.arc(s.cx, s.cy, 14, 0, TAU); c.fill(); }
          if (!s.n && (s.ax || s.ay)) { c.strokeStyle = 'rgba(30,34,50,.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(s.x0 - s.ax, s.y0 - s.ay); c.lineTo(s.x0 + s.ax, s.y0 + s.ay); c.stroke(); }
          c.save(); c.translate(s.x, s.y); c.rotate(S.t * 12);
          c.fillStyle = '#c8ccd8'; c.beginPath();
          const n = 14;
          for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr = i % 2 ? s.r * .82 : s.r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          c.closePath(); c.fill();
          c.fillStyle = '#e8ecf4'; c.beginPath(); c.arc(0, 0, s.r * .7, 0, TAU); c.fill();
          c.fillStyle = '#e2453c'; c.beginPath(); c.arc(0, 0, s.r * .28, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, s.r * .5, 0, 1.6); c.stroke();
          c.restore();
        }
        const tg = S.att < 0 && (S.ph === 'run' || S.ph === 'ready') ? slTarget(S) : -1;
        S.tg = tg;
        for (let i = 0; i < S.hooks.length; i++) {
          const h = S.hooks[i];
          if (h.x > R0 || h.x < L0 || h.y > B0 || h.y < T0) continue;
          if (h.ax || h.ay) { c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 3; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(h.x0 - h.ax, h.y0 - h.ay); c.lineTo(h.x0 + h.ax, h.y0 + h.ay); c.stroke(); c.setLineDash([]); }
          if (h.br) { c.globalAlpha = .35; c.fillStyle = '#8a7a5a'; c.beginPath(); c.arc(h.x - 6, h.y + 8, 5, 0, TAU); c.arc(h.x + 7, h.y + 12, 4, 0, TAU); c.fill(); c.globalAlpha = 1; continue; }
          const on = i === tg, att = i === S.att;
          const wob = h.c && h.bt > 0 ? Math.sin(h.bt * 60) * 2 : 0;
          if (on) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.beginPath(); c.arc(h.x, h.y, 22 + Math.sin(ftime * 8) * 3, 0, TAU); c.stroke(); }
          c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.arc(h.x + 2, h.y + 3, 14, 0, TAU); c.fill();
          c.fillStyle = h.c ? '#a8855a' : '#ff5a8a'; c.beginPath(); c.arc(h.x + wob, h.y, 14 + h.pulse * 4, 0, TAU); c.fill();
          c.fillStyle = h.c ? '#d9b98a' : (att || on ? '#ffd0df' : '#ff9cbc'); c.beginPath(); c.arc(h.x + wob, h.y, 8, 0, TAU); c.fill();
          if (h.c) { c.strokeStyle = '#5a4020'; c.lineWidth = 2; c.beginPath(); c.moveTo(h.x - 8 + wob, h.y - 6); c.lineTo(h.x - 1 + wob, h.y + 1); c.lineTo(h.x - 4 + wob, h.y + 8); c.moveTo(h.x + 9 + wob, h.y - 4); c.lineTo(h.x + 3 + wob, h.y + 2); c.stroke(); }
        }
        const sk = skin();
        if (trn > 2 && S.ph !== 'dead') {
          const sp = Math.hypot(S.vx, S.vy);
          if (sp > 500) {
            c.strokeStyle = sk.trail; c.lineCap = 'round';
            for (let i = 1; i < trn; i++) {
              const a = (tri - i + TN) % TN, b = (tri - i - 1 + TN) % TN;
              c.globalAlpha = (1 - i / trn) * .45 * Math.min(1, (sp - 500) / 500); c.lineWidth = 10 * (1 - i / trn) + 1;
              c.beginPath(); c.moveTo(TRX[a], TRY[a]); c.lineTo(TRX[b], TRY[b]); c.stroke();
            }
            c.globalAlpha = 1;
          }
        }
        if (S.att >= 0 && S.ph !== 'dead') {
          const h = S.hooks[S.att], ca = Math.cos(S.rot - Math.PI / 2), sa = Math.sin(S.rot - Math.PI / 2);
          const hx = S.px + ca * 46, hy = S.py + sa * 46, k = Math.min(1, S.attT / .06);
          c.strokeStyle = '#2a2f45'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + (h.x - hx) * k, hy + (h.y - hy) * k); c.stroke();
          c.strokeStyle = '#f4f1e6'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + (h.x - hx) * k, hy + (h.y - hy) * k); c.stroke();
        } else if (tg >= 0 && S.ph === 'run') {
          const h = S.hooks[tg];
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.setLineDash([4, 9]); c.beginPath(); c.moveTo(S.px, S.py); c.lineTo(h.x, h.y); c.stroke(); c.setLineDash([]);
        }
        if (S.ph !== 'dead') { const gr = S.ph === 'ready' || (S.ground && S.att < 0); slDrawMan(c, S.px, gr ? S.py - 26 : S.py, gr ? 0 : S.rot, sk, S.att >= 0, ftime, 1.3, S.att >= 0 ? .2 : gr ? 0 : 1); }
        for (let i = 0; i < PN; i++) {
          if (PL[i] <= 0) continue;
          PL[i] -= dt; PVY[i] += 900 * dt; PX[i] += PVX[i] * dt; PY[i] += PVY[i] * dt;
          c.globalAlpha = Math.max(0, PL[i] / PM[i]); c.fillStyle = PC[i];
          c.fillRect(PX[i] - PS[i] / 2, PY[i] - PS[i] / 2, PS[i], PS[i]);
        }
        c.globalAlpha = 1;
        c.restore();
        hud(c);
      }
      function hud(c) {
        const d = S.def;
        const k = [mode, lvW, lvL, S.gems, S.gemsTot, tryN, S.ph === 'ready'].join('|');
        if (k !== hudKey || !hudCache) {
          hudKey = k;
          hudCache = {
            title: mode === 'endless' ? T('Endless') : (lvW + 1) + '-' + (lvL + 1) + '  ' + T(d.n),
            tries: T('Try {n}', { n: tryN }),
            hint: T('Hold to grab the hook'),
            hint2: T('Let go on the way up to fly')
          };
        }
        txt(c, hudCache.title, 16, 26, 18, '#fff', 'left', 900, 'rgba(0,0,0,.45)');
        if (mode === 'level') {
          txt(c, hudCache.tries, 16, 50, 13, 'rgba(255,255,255,.85)', 'left', 800, 'rgba(0,0,0,.4)');
          const bw = Math.min(W * .34, 320), bx = W / 2 - bw / 2, p = clamp((S.px - 100) / (S.fin - 100), 0, 1);
          c.fillStyle = 'rgba(0,0,0,.3)'; rrect(c, bx, 16, bw, 12, 6); c.fill();
          c.fillStyle = '#ffd23a'; rrect(c, bx, 16, Math.max(12, bw * p), 12, 6); c.fill();
          txt(c, S.run.toFixed(2) + ' s', W / 2, 46, 16, S.run <= d.par ? '#fff' : '#ffb3b3', 'center', 900, 'rgba(0,0,0,.45)');
          const gx = W / 2 + bw / 2 + 22;
          c.save(); c.translate(gx, 22); c.fillStyle = '#3fe0d0'; c.beginPath(); c.moveTo(-8, -3); c.lineTo(-4, -8); c.lineTo(4, -8); c.lineTo(8, -3); c.lineTo(0, 8); c.closePath(); c.fill(); c.restore();
          txt(c, S.gems + '/' + S.gemsTot, gx + 14, 23, 15, '#fff', 'left', 900, 'rgba(0,0,0,.45)');
        } else {
          txt(c, Math.floor(S.best / 40) + ' m', W / 2, 28, 24, '#fff', 'center', 900, 'rgba(0,0,0,.45)');
          txt(c, T('Best') + ' ' + P.endless + ' m', W / 2, 52, 13, 'rgba(255,255,255,.85)', 'center', 800, 'rgba(0,0,0,.4)');
        }
        if (S.ph === 'ready') {
          const a = .6 + Math.sin(ftime * 5) * .4;
          c.globalAlpha = a;
          txt(c, hudCache.hint, W / 2, H * .62, portrait ? 24 : 28, '#fff', 'center', 900, 'rgba(0,0,0,.5)');
          c.globalAlpha = 1;
          txt(c, hudCache.hint2, W / 2, H * .62 + 34, 16, 'rgba(255,255,255,.9)', 'center', 800, 'rgba(0,0,0,.45)');
        }
      }

      showMenu();
      return { destroy() { A.destroy(); } };
    }

    Ameplay.register({
      id: 'swing-line',
      title: "Stickman Hook",
      category: 'Skill',
      tint: '#ff4f8a',
      blurb: 'Hold to grab the nearest hook, let go to fly. Keep your momentum through 30 handmade levels of bounce pads, saws, boost rings and crumbling hooks, then see how far you get in Endless.',
      help: '<kbd>&#128433;</kbd> <kbd>Space</kbd> <span>hold to grab the nearest hook, release to let go</span> · <kbd>R</kbd> <span>restart level</span> · <kbd>Esc</kbd> <span>pause</span>',
      width: 960,
      better: 'high',
      format: v => v + ' ★',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="44" cy="10" r="5"/><path d="M42 14L26 34"/><circle cx="22" cy="36" r="4"/><path d="M24 40l-6 12M20 46l-8 2M22 44l8 6"/></svg>',
      css: sxCss('swing-line', '#ff4f8a') + SL_CSS,
      engine: { SL_LEVELS, slCompile, slStep, slTarget, SL_STEP },
      mount: mountSwing
    });

  }

  {

    const SR_T = 32, SR_STEP = 1 / 120, SR_G = 2300, SR_RUN = 290, SR_JV = 720, SR_WJV = 700, SR_WJX = 310, SR_FALL = 980, SR_PW = 18, SR_PH = 42, SR_PC = 22;
    const SR_ACTS = [];
    const SR_TH = [
      { n: 'Rooftops', sky: ['#14203f', '#4a6aa2'], far: '#1c2b52', near: '#152142', blk: ['#565e7e', '#6c76a0', '#a4b0e0'], acc: '#ffb23a' },
      { n: 'Foundry', sky: ['#3a1f1a', '#c2603a'], far: '#5a2f24', near: '#3e1f18', blk: ['#5e5450', '#756a64', '#a8968a'], acc: '#ff6a2a' },
      { n: 'Deep Caves', sky: ['#0a2226', '#245e5c'], far: '#113a3d', near: '#0c2c2f', blk: ['#4a6a66', '#5c837e', '#8ac2b8'], acc: '#4ff0c8' },
      { n: 'The Lab', sky: ['#1a1238', '#5b3fa8'], far: '#2a1d58', near: '#1d1442', blk: ['#4c4670', '#5f588a', '#9a90d8'], acc: '#ff4fd8' },
      { n: 'Summit', sky: ['#4a1830', '#ff9a6a'], far: '#6a2a44', near: '#451b30', blk: ['#5a4a5c', '#705e74', '#b098b8'], acc: '#ffd23a' }
    ];

    const srAct = (gold, silver, ...secs) => {
      const H = 22, rows = [];
      for (let y = 0; y < H; y++) rows.push('');
      for (const s of secs) {
        const w = Math.max(...s.map(r => r.length));
        for (let y = 0; y < H; y++) { const r = s[y - (H - s.length)]; rows[y] += (r || '').padEnd(w, ' '); }
      }
      return { map: rows, gold, silver };
    };
    SR_ACTS.push(srAct(45, 75, [
      '                                       ',
      '                         *             ',
      '                       =====           ',
      '                                       ',
      '   S                 ######            ',
      '################    #######    ########',
      '################    #######    ########',
      '################    #######    ########'
    ], [
      '                                          ',
      '                                          ',
      '                                  ##      ',
      '   C        ^^         ^^^        ##      ',
      '###########################   ####### ####',
      '###########################   ####### ####',
      '###########################   ####### ####'
    ], [
      '                    *                         ',
      '                  ====                        ',
      '                                              ',
      '             ====        ====                 ',
      '                                              ',
      '        ====                  ====            ',
      '                                              ',
      '  C                                           ',
      '######^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^#########',
      '###############################################',
      '###############################################'
    ], [
      '                                               ',
      '                                               ',
      '              ##############                   ',
      '              ##############                   ',
      '              ##############       ######      ',
      '  C                                ######      ',
      '###############################^^^^##########  ',
      '###############################################',
      '###############################################'
    ], [
      '                                        ',
      '              #                         ',
      '              #           *             ',
      '              #        ======           ',
      '              #                         ',
      '              #    ######               ',
      '              #    #                    ',
      '              #    #                    ',
      '              #    #                    ',
      '              #    #                    ',
      '                   #                    ',
      '  C                #                    ',
      '#############################   ########',
      '#############################   ########'
    ], [
      '                                    ',
      '                                    ',
      '                                    ',
      '   C          o             E       ',
      '####################################',
      '####################################',
      '####################################'
    ]));
    SR_ACTS.push(srAct(50, 80, [
      '                                     ',
      '                                     ',
      '  S                                  ',
      '#########    #####  o  #####    #####',
      '#########    ####       ####    #####',
      '#########    ####       ####    #####'
    ], [
      '                                              ',
      '                         *                    ',
      '                       #####                  ',
      '                 h                            ',
      '                                              ',
      '  C                                h          ',
      '##############################################',
      '##############################################',
      '##############################################'
    ], [
      '                                                ',
      '                                                ',
      '      ##########################                ',
      '      ##########################                ',
      '      ##########################    ####        ',
      '  C                                 ####        ',
      '##################################^^####   #####',
      '#######################################   #####',
      '#######################################   #####'
    ], [
      '                 #                             ',
      '                 #                             ',
      '                 #  *                          ',
      '                 #                             ',
      '                 #    ######                   ',
      '                 #    #                        ',
      '                 #    #            j           ',
      '                 #    #                        ',
      '                 #    #                        ',
      '                 #    #                        ',
      '  C                   #                        ',
      '#############################     #########    ',
      '#############################^^^^^#########    ',
      '###############################################'
    ], [
      '                                                ',
      '                                                ',
      '                     xxx   xxx   xxx            ',
      '               xxx                              ',
      '          xxx                              *    ',
      '  C                                      xxxx   ',
      '#########^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^####',
      '################################################',
      '################################################'
    ], [
      '                                         ',
      '                                         ',
      '                                         ',
      '   C       r            o        E       ',
      '#########################################',
      '#########################################',
      '#########################################'
    ]));
    SR_ACTS.push(srAct(45, 72, [
      '                                ',
      '                                ',
      '  S                             ',
      '########     T      ####    ####',
      '########     #      ####    ####',
      '########^^^^^#^^^^^^####^^^^####',
      '################################'
    ], [
      '                       *                ',
      '                                        ',
      '                    #######             ',
      '                    #######             ',
      '                                        ',
      '                                        ',
      '  C           T                  T      ',
      '###########^^^#^^^^^^^^^^^^^^^^^^#######',
      '########################################',
      '########################################'
    ], [
      '                                             ',
      '     z                                       ',
      '                                             ',
      '                                             ',
      '                                             ',
      '                                 Z           ',
      '                               ####          ',
      '                               ####          ',
      '                               ####          ',
      '  C  T                         ####          ',
      '######                         ############  ',
      '######^^^^^^^^^^^^^^^^^^^^^^^^^############  ',
      '#############################################'
    ], [
      '                                                ',
      '                                                ',
      '                                 *              ',
      '                                                ',
      '                                                ',
      '              m          m         m            ',
      '  C                                        #####',
      '########                                   #####',
      '########^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^#####',
      '################################################'
    ], [
      '                                      ',
      '                                      ',
      '                                      ',
      '              #   =====               ',
      '              #                       ',
      '              #         ====          ',
      '              #   k             *     ',
      '          ==  #      ====    ######   ',
      '              #                       ',
      '  C       T   #                       ',
      '###########^^^#^^^^^^^^^^^^^^^^^^^^^^^',
      '######################################'
    ], [
      '                                       ',
      '                                       ',
      '                                       ',
      '   C       o       o       E           ',
      '#######################################',
      '#######################################',
      '#######################################'
    ]));
    SR_ACTS.push(srAct(42, 68, [
      '                                          ',
      '                                          ',
      '                                          ',
      '         l     l     l                    ',
      '  S                                       ',
      '##########################################',
      '##########################################',
      '##########################################'
    ], [
      '      ########################################        ',
      '      ########################################        ',
      '      #                                      #        ',
      '      #   l    l    l    l    l    l   *     #        ',
      '      #                                      #        ',
      '  C                                                   ',
      '######################################################',
      '######################################################'
    ], [
      '                     #                           ',
      '                     #                           ',
      '                     #                           ',
      '                     #>                          ',
      '                     #    ######                 ',
      '                     #    #                      ',
      '                     #   <#                      ',
      '                     #    #                      ',
      '                     #>   #           *          ',
      '                     #    #        ######        ',
      '                          #                      ',
      '  C          h            #                      ',
      '###########################     ##  r    ########',
      '###########################^^^^^##^^^^^^^########',
      '#################################################'
    ], [
      '                                              ',
      '                                              ',
      '                                    *         ',
      '                                              ',
      '        xx   xx    xx    xx    xx   xx        ',
      '  C        o          o          o        ### ',
      '######^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^#####',
      '##############################################'
    ], [
      '                                         ',
      '                                         ',
      '                                         ',
      '   C    l    h      l      o      E      ',
      '#########################################',
      '#########################################',
      '#########################################'
    ]));
    SR_ACTS.push(srAct(45, 72, [
      '                                          ',
      '                                          ',
      '                                          ',
      '                         o                ',
      '  S          o                            ',
      '#######    #####     #########    ####    ',
      '#######^^^^#####^^^^^#########^^^^####    ',
      '##########################################'
    ], [
      '                   #                                ',
      '                   #                                ',
      '                   #>                               ',
      '                   #                                ',
      '                   #    ######                      ',
      '                   #   <#                           ',
      '                   #    #                           ',
      '                   #>   #          *                ',
      '                   #    #        =====              ',
      '                   #    #                           ',
      '                        #                           ',
      '  C                     #      T         T          ',
      '#########################      #^^^^^^^^^####       ',
      '#########################^^^^^^#####################'
    ], [
      '                                           ',
      '     z                                     ',
      '                                           ',
      '               o                           ',
      '                                           ',
      '                                 Z         ',
      '                               ####        ',
      '             *                 ####        ',
      '                               ####        ',
      '  C  T                         #########   ',
      '######        m                #########   ',
      '######^^^^^^^^^^^^^^^^^^^^^^^^^#########   ',
      '###########################################'
    ], [
      '                                                  ',
      '            l           l           l             ',
      '                                                  ',
      '                                                  ',
      '        ===   xx    ===   xx    ===   xx   *      ',
      '  C                                        ###    ',
      '####                                       ####   ',
      '####^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^####   ',
      '##################################################'
    ], [
      '                                                ',
      '                                                ',
      '                                                ',
      '                      r             r           ',
      '              j                                 ',
      '  C                                       E     ',
      '################################################',
      '################################################',
      '################################################'
    ]));

    function srCompile(act) {
      const rows = act.map, H = rows.length, W = Math.max(...rows.map(r => r.length));
      const g = new Uint8Array(W * H), cr = new Float32Array(W * H);
      const S = { W, H, g, cr, ents: [], saws: [], plats: [], lasers: [], zips: [], stars: [], cps: [], sx: 64, sy: 64, ex: 0, ey: 0, t: 0, run: 0, x: 0, y: 0, vx: 0, vy: 0, onG: false, coy: 0, buf: 0, jh: false, wall: 0, wallT: 0, wdir: 0, wj: 0, crouch: false, slide: 0, face: 1, dead: 0, cp: -1, cpx: 0, cpy: 0, deaths: 0, got: 0, won: 0, zip: -1, zipCd: 0, plat: -1, ph: 0, ev: [], spring: 0, prevJ: false, act };
      const code = { '#': 1, '^': 2, 'v': 3, '<': 4, '>': 5, '=': 6, 'x': 7, 'T': 8 };
      const zs = [], Zs = [], crx = [];
      for (let y = 0; y < H; y++) {
        const r = rows[y];
        for (let x = 0; x < W; x++) {
          const ch = r[x] || ' ', i = y * W + x, cx = x * SR_T + SR_T / 2, cy = y * SR_T + SR_T / 2;
          if (code[ch]) { g[i] = code[ch]; if (ch === 'x') crx.push(i); }
          else if (ch === 'S') { S.sx = cx; S.sy = (y + 1) * SR_T; }
          else if (ch === 'E') { S.ex = cx; S.ey = (y + 1) * SR_T; }
          else if (ch === 'C') S.cps.push({ x: cx, y: (y + 1) * SR_T, on: 0, f: 0 });
          else if (ch === '*') S.stars.push({ x: cx, y: cy, got: 0 });
          else if (ch === 'o') S.saws.push({ k: 0, x: cx, y: cy, x0: cx, y0: cy, r: 19, a: 0, b: 0, p: 1, ph: 0 });
          else if (ch === 'O') S.saws.push({ k: 0, x: cx, y: cy, x0: cx, y0: cy, r: 38, a: 0, b: 0, p: 1, ph: 0 });
          else if (ch === 'h') S.saws.push({ k: 1, x: cx, y: cy, x0: cx, y0: cy, r: 19, a: 3 * SR_T, b: 0, p: 2.6, ph: x * .7 });
          else if (ch === 'j') S.saws.push({ k: 1, x: cx, y: cy, x0: cx, y0: cy, r: 19, a: 0, b: 2.5 * SR_T, p: 2.2, ph: x * .9 });
          else if (ch === 'r') S.saws.push({ k: 2, x: cx, y: cy, x0: cx, y0: cy, r: 19, a: 3 * SR_T, b: 0, p: 1.7 * (x % 2 ? 1 : -1), ph: x * .5 });
          else if (ch === 'm') S.plats.push({ x0: x * SR_T, y0: y * SR_T, x: x * SR_T, y: y * SR_T, w: 3 * SR_T, a: 4 * SR_T, b: 0, p: 4, ph: 0, dx: 0, dy: 0 });
          else if (ch === 'k') S.plats.push({ x0: x * SR_T, y0: y * SR_T, x: x * SR_T, y: y * SR_T, w: 3 * SR_T, a: 0, b: 3 * SR_T, p: 3.6, ph: 0, dx: 0, dy: 0 });
          else if (ch === 'l') S.lasers.push({ x: cx, y0: y * SR_T, y1: y * SR_T, on: 0, ph: (x * .37) % 2.8, warn: 0 });
          else if (ch === 'z') zs.push([cx, y * SR_T + 6]);
          else if (ch === 'Z') Zs.push([cx, y * SR_T + 6]);
        }
      }
      for (const L of S.lasers) { let ty = Math.floor(L.y0 / SR_T) + 1; while (ty < H && !g[ty * W + Math.floor(L.x / SR_T)]) ty++; L.y1 = ty * SR_T; }
      for (const z of zs) { let bi = -1, bd = 1e9; Zs.forEach((Z, i) => { const d = Z[0] - z[0]; if (d > 0 && d < bd) { bd = d; bi = i; } }); if (bi >= 0) S.zips.push({ x1: z[0], y1: z[1], x2: Zs[bi][0], y2: Zs[bi][1] }); }
      S.crx = Int32Array.from(crx);
      S.cps.sort((a, b) => a.x - b.x);
      srSpawn(S, S.sx, S.sy);
      return S;
    }
    function srSpawn(S, x, y) {
      S.x = x; S.y = y - .01; S.vx = 0; S.vy = 0; S.onG = false; S.coy = 0; S.buf = 0; S.wall = 0; S.wallT = 0; S.wj = 0; S.crouch = false; S.slide = 0; S.zip = -1; S.zipCd = 0; S.plat = -1; S.dead = 0; S.face = 1; S.spring = 0;
    }
    const srTile = (S, tx, ty) => tx < 0 || tx >= S.W ? 1 : ty < 0 || ty >= S.H ? 0 : S.g[ty * S.W + tx];
    const srSolid = (S, tx, ty) => { const v = srTile(S, tx, ty); return v === 1 || v === 8 || (v === 7 && S.cr[ty * S.W + tx] >= 0); };
    function srEv(S, k, a, b) { S.ev.push(k, a || 0, b || 0); }
    function srKill(S, why) { if (S.dead || S.won) return; S.dead = .001; S.deaths++; srEv(S, 1, S.x, S.y - 20); S.zip = -1; }
    function srMove(S, dt) {
      const t = S.t;
      for (const s of S.saws) {
        if (s.k === 1) { const v = Math.sin(t * TAU / s.p + s.ph); s.x = s.x0 + s.a * v; s.y = s.y0 + s.b * v; }
        else if (s.k === 2) { const a = t * s.p + s.ph; s.x = s.x0 + Math.cos(a) * s.a; s.y = s.y0 + Math.sin(a) * s.a; }
      }
      for (const p of S.plats) {
        const v = Math.sin(t * TAU / p.p + p.ph), nx = p.x0 + p.a * v, ny = p.y0 + p.b * v;
        p.dx = nx - p.x; p.dy = ny - p.y; p.x = nx; p.y = ny;
      }
      for (const L of S.lasers) { const c = (t + L.ph) % 2.8; L.on = c < 1.3 ? 1 : 0; L.warn = !L.on && c > 2.4 ? 1 : 0; }
      for (let q = 0; q < S.crx.length; q++) {
        const i = S.crx[q], c = S.cr[i];
        if (c > 0) { S.cr[i] = c + dt; if (S.cr[i] > .5) { S.cr[i] = -3; srEv(S, 6, (i % S.W) * SR_T + 16, Math.floor(i / S.W) * SR_T + 16); } }
        else if (c < 0) { S.cr[i] = Math.min(0, c + dt); if (S.cr[i] === 0) { const tx = i % S.W, ty = Math.floor(i / S.W), x0 = tx * SR_T, y0 = ty * SR_T; if (S.x + SR_PW / 2 > x0 && S.x - SR_PW / 2 < x0 + SR_T && S.y > y0 && S.y - SR_PH < y0 + SR_T) S.cr[i] = -.2; } }
      }
    }
    function srHit(S, x0, y0, x1, y1) {
      const tx0 = Math.floor(x0 / SR_T), tx1 = Math.floor((x1 - .001) / SR_T), ty0 = Math.floor(y0 / SR_T), ty1 = Math.floor((y1 - .001) / SR_T);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (srSolid(S, tx, ty)) return true;
      return false;
    }
    function srStep(S, inp) {
      const dt = SR_STEP;
      if (S.won) { S.won += dt; S.t += dt; srMove(S, dt); return; }
      if (S.dead) {
        S.dead += dt; S.t += dt; srMove(S, dt);
        if (S.dead > .5) { const c = S.cp >= 0 ? S.cps[S.cp] : null; srSpawn(S, c ? c.x : S.sx, c ? c.y : S.sy); srEv(S, 7, S.x, S.y); }
        return;
      }
      S.t += dt; S.run += dt;
      srMove(S, dt);
      const jEdge = inp.j && !S.prevJ; S.prevJ = inp.j;
      if (jEdge) S.buf = .13;
      else if (S.buf > 0) S.buf -= dt;
      if (S.zipCd > 0) S.zipCd -= dt;
      const ph = S.crouch ? SR_PC : SR_PH;
      if (S.zip >= 0) {
        const z = S.zips[S.zip], dx = z.x2 - z.x1, dy = z.y2 - z.y1, len = Math.hypot(dx, dy);
        S.vx = dx / len * 420; S.vy = dy / len * 420;
        S.x += S.vx * dt; S.y += S.vy * dt; S.face = dx > 0 ? 1 : -1;
        if (S.buf > 0 || S.x >= z.x2 - 4) { S.zip = -1; S.zipCd = .35; S.buf = 0; S.vy = S.x >= z.x2 - 4 ? -260 : -560; S.vx = S.face * 300; srEv(S, 2, 0, 0); }
        else if (srHit(S, S.x - SR_PW / 2, S.y - SR_PH, S.x + SR_PW / 2, S.y)) { S.zip = -1; S.zipCd = .35; }
      } else {
        let dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
        if (S.wj > 0) { S.wj -= dt; if (dir === S.wdir) dir = 0; }
        const wantC = inp.d && S.onG;
        if (wantC && !S.crouch) { S.crouch = true; if (Math.abs(S.vx) > 180) { S.slide = .55; S.vx = Math.sign(S.vx) * Math.max(Math.abs(S.vx), 340); srEv(S, 8, 0, 0); } }
        if (S.crouch && !inp.d && !srHit(S, S.x - SR_PW / 2 + 1, S.y - SR_PH, S.x + SR_PW / 2 - 1, S.y - SR_PC)) { S.crouch = false; S.slide = 0; }
        if (S.crouch && !S.onG && !srHit(S, S.x - SR_PW / 2 + 1, S.y - SR_PH, S.x + SR_PW / 2 - 1, S.y - SR_PC)) { S.crouch = false; S.slide = 0; }
        if (S.slide > 0) { S.slide -= dt; S.vx -= Math.sign(S.vx) * Math.min(Math.abs(S.vx), 260 * dt); if (Math.abs(S.vx) < 90) S.slide = 0; }
        else {
          const max = S.crouch ? SR_RUN * .38 : SR_RUN, acc = S.onG ? (dir ? 2600 : 3000) : (dir ? 1700 : 500);
          const tgt = dir * max;
          if (S.vx < tgt) S.vx = Math.min(tgt, S.vx + acc * dt); else if (S.vx > tgt) S.vx = Math.max(tgt, S.vx - acc * dt);
          if (dir) S.face = dir;
        }
        S.vy += SR_G * dt;
        if (!inp.j && S.vy < 0 && !S.spring) S.vy += SR_G * 1.25 * dt;
        if (S.vy > 0) S.spring = 0;
        const sliding = !S.onG && S.wall && dir === S.wall && S.vy > 0;
        if (sliding) S.vy = Math.min(S.vy, 150);
        if (S.vy > SR_FALL) S.vy = SR_FALL;
        if (S.onG) S.coy = .09; else if (S.coy > 0) S.coy -= dt;
        if (S.wall) S.wallT = .1, S.wdir = S.wall; else if (S.wallT > 0) S.wallT -= dt;
        if (S.buf > 0 && !(S.crouch && srHit(S, S.x - SR_PW / 2 + 1, S.y - SR_PH, S.x + SR_PW / 2 - 1, S.y - SR_PC))) {
          if (S.onG || S.coy > 0) { S.vy = -SR_JV; S.onG = false; S.coy = 0; S.buf = 0; S.crouch = false; S.slide = 0; S.plat = -1; srEv(S, 2, 0, 0); }
          else if (S.wallT > 0) { S.vy = -SR_WJV; S.vx = -S.wdir * SR_WJX; S.wj = .17; S.wallT = 0; S.buf = 0; S.face = -S.wdir; srEv(S, 3, S.x + S.wdir * 10, S.y - 20); }
        }
        if (S.plat >= 0) { const p = S.plats[S.plat]; S.x += p.dx; S.y = p.y; }
        const h2 = S.crouch ? SR_PC : SR_PH;
        S.x += S.vx * dt;
        if (srHit(S, S.x - SR_PW / 2, S.y - h2, S.x + SR_PW / 2, S.y - .5)) {
          if (S.vx > 0) S.x = Math.floor((S.x + SR_PW / 2) / SR_T) * SR_T - SR_PW / 2 - .01;
          else if (S.vx < 0) S.x = Math.ceil((S.x - SR_PW / 2) / SR_T) * SR_T + SR_PW / 2 + .01;
          else { const l = srHit(S, S.x - SR_PW / 2, S.y - h2, S.x, S.y - .5); S.x += l ? 1 : -1; }
          S.vx = 0; S.slide = 0;
        }
        const oy = S.y;
        S.y += S.vy * dt;
        const wasG = S.onG;
        S.onG = false;
        if (S.vy >= 0) {
          if (srHit(S, S.x - SR_PW / 2, S.y - 1, S.x + SR_PW / 2, S.y)) {
            S.y = Math.floor(S.y / SR_T) * SR_T; S.onG = true;
            const ty = Math.floor(S.y / SR_T), t0 = Math.floor((S.x - SR_PW / 2) / SR_T), t1 = Math.floor((S.x + SR_PW / 2 - .01) / SR_T);
            let spring = false;
            for (let tx = t0; tx <= t1; tx++) { const v = srTile(S, tx, ty); if (v === 8) spring = true; if (v === 7 && S.cr[ty * S.W + tx] === 0) S.cr[ty * S.W + tx] = .001; }
            if (spring) { S.vy = -1080; S.onG = false; S.spring = 1; S.crouch = false; S.slide = 0; srEv(S, 4, S.x, S.y); }
            else { if (!wasG && S.vy > 500) srEv(S, 5, S.vy, 0); S.vy = 0; }
          } else {
            const ty = Math.floor(S.y / SR_T);
            if (Math.floor(oy / SR_T) < ty || oy === ty * SR_T) {
              const t0 = Math.floor((S.x - SR_PW / 2) / SR_T), t1 = Math.floor((S.x + SR_PW / 2 - .01) / SR_T);
              for (let tx = t0; tx <= t1; tx++) if (srTile(S, tx, ty) === 6 && !inp.d && oy <= ty * SR_T + .5) { S.y = ty * SR_T; S.vy = 0; S.onG = true; break; }
            }
            let landed = -1;
            for (let i = 0; i < S.plats.length; i++) {
              const p = S.plats[i];
              if (S.x + SR_PW / 2 > p.x && S.x - SR_PW / 2 < p.x + p.w && oy <= p.y - p.dy + 1 && S.y >= p.y - .5) { landed = i; break; }
            }
            if (landed >= 0 && !inp.d) { S.y = S.plats[landed].y; S.vy = 0; S.onG = true; }
            S.plat = S.onG ? landed : -1;
          }
        } else {
          S.plat = -1;
          if (srHit(S, S.x - SR_PW / 2, S.y - h2, S.x + SR_PW / 2, S.y - h2 + 1)) { S.y = Math.ceil((S.y - h2) / SR_T) * SR_T + h2; S.vy = 0; S.spring = 0; }
        }
        if (S.plat >= 0 && !S.onG) S.plat = -1;
        const hh = S.crouch ? SR_PC : SR_PH;
        S.wall = 0;
        if (!S.onG) {
          if (srHit(S, S.x + SR_PW / 2, S.y - hh + 4, S.x + SR_PW / 2 + 2, S.y - 8)) S.wall = 1;
          else if (srHit(S, S.x - SR_PW / 2 - 2, S.y - hh + 4, S.x - SR_PW / 2, S.y - 8)) S.wall = -1;
        }
        if (S.zipCd <= 0 && !S.onG) {
          const hx = S.x, hy = S.y - SR_PH - 4;
          for (let i = 0; i < S.zips.length; i++) {
            const z = S.zips[i];
            if (hx < z.x1 - 4 || hx > z.x2) continue;
            const u = (hx - z.x1) / (z.x2 - z.x1), ly = z.y1 + (z.y2 - z.y1) * u;
            if (Math.abs(hy - ly) < 14) { S.zip = i; S.y = ly + SR_PH + 4; S.crouch = false; S.slide = 0; srEv(S, 9, hx, ly); break; }
          }
        }
      }
      const h3 = S.crouch ? SR_PC : SR_PH, x0 = S.x - SR_PW / 2 + 3, x1 = S.x + SR_PW / 2 - 3, y0 = S.y - h3 + 3, y1 = S.y - 2;
      const tx0 = Math.floor(x0 / SR_T), tx1 = Math.floor(x1 / SR_T), ty0 = Math.floor(y0 / SR_T), ty1 = Math.floor(y1 / SR_T);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = srTile(S, tx, ty);
        if (v < 2 || v > 5) continue;
        const bx = tx * SR_T, by = ty * SR_T;
        let a0 = bx + 3, a1 = bx + 29, b0 = by + 3, b1 = by + 29;
        if (v === 2) b0 = by + 14; else if (v === 3) b1 = by + 18; else if (v === 4) a0 = bx + 14; else a1 = bx + 18;
        if (x1 > a0 && x0 < a1 && y1 > b0 && y0 < b1) { srKill(S, 'spike'); return; }
      }
      for (const s of S.saws) {
        const cx = clamp(s.x, x0, x1), cy = clamp(s.y, y0, y1), dx = s.x - cx, dy = s.y - cy;
        if (dx * dx + dy * dy < (s.r - 2) * (s.r - 2)) { srKill(S, 'saw'); return; }
      }
      for (const L of S.lasers) if (L.on && L.x > x0 - 3 && L.x < x1 + 3 && y1 > L.y0 && y0 < L.y1) { srKill(S, 'laser'); return; }
      if (S.y - h3 > S.H * SR_T + 40) { srKill(S, 'fall'); return; }
      for (let i = 0; i < S.cps.length; i++) {
        const c = S.cps[i];
        if (i > S.cp && Math.abs(S.x - c.x) < 22 && S.y > c.y - 80 && S.y - h3 < c.y + 4) { S.cp = i; for (let k = 0; k <= i; k++) S.cps[k].on = 1; c.f = 1; srEv(S, 10, c.x, c.y); }
      }
      for (const s of S.stars) if (!s.got && Math.abs(S.x - s.x) < 24 && s.y > S.y - h3 - 14 && s.y < S.y + 14) { s.got = 1; S.got++; srEv(S, 11, s.x, s.y); }
      if (S.ex && Math.abs(S.x - S.ex) < 22 && S.y > S.ey - 70 && S.y - h3 < S.ey) { S.won = .001; srEv(S, 12, S.ex, S.ey); }
    }

    function srChunk(S, th, ci, CW, d) {
      const cv = document.createElement('canvas'), Hh = S.H * SR_T + 12;
      cv.width = Math.ceil((CW + 2) * d); cv.height = Math.ceil(Hh * d);
      const c = cv.getContext('2d');
      c.scale(d, d); c.translate(1 - ci * CW, 12);
      const tx0 = Math.max(0, ci * CW / SR_T - 1), tx1 = Math.min(S.W - 1, (ci + 1) * CW / SR_T), ty0 = 0, ty1 = S.H - 1;
      c.fillStyle = th.blk[0]; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const v = S.g[ty * S.W + tx]; if (v === 1 || v === 8) c.rect(tx * SR_T, ty * SR_T, SR_T, SR_T); }
      c.fill();
      c.fillStyle = th.blk[1]; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const v = S.g[ty * S.W + tx]; if ((v === 1 || v === 8) && !srSolid(S, tx, ty - 1)) c.rect(tx * SR_T, ty * SR_T, SR_T, 5); }
      c.fill();
      c.fillStyle = th.blk[2]; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const v = S.g[ty * S.W + tx]; if ((v === 1 || v === 8) && !srSolid(S, tx, ty - 1)) c.rect(tx * SR_T, ty * SR_T, SR_T, 2); }
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const v = S.g[ty * S.W + tx]; if (v === 1 && ((tx * 7 + ty * 3) % 5 === 0)) { c.moveTo(tx * SR_T + 6, ty * SR_T + 14); c.lineTo(tx * SR_T + 18, ty * SR_T + 14); c.moveTo(tx * SR_T + 12, ty * SR_T + 22); c.lineTo(tx * SR_T + 26, ty * SR_T + 22); } }
      c.stroke();
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const v = S.g[ty * S.W + tx]; if (v !== 1 && v !== 8) continue; if (!srSolid(S, tx - 1, ty) && tx > 0) c.rect(tx * SR_T, ty * SR_T, 3, SR_T); if (!srSolid(S, tx + 1, ty) && tx < S.W - 1) c.rect(tx * SR_T + SR_T - 3, ty * SR_T, 3, SR_T); if (ty < S.H - 1 && !srSolid(S, tx, ty + 1)) c.rect(tx * SR_T, ty * SR_T + SR_T - 4, SR_T, 4); }
      c.fill();
      c.fillStyle = '#e6e9f2'; c.strokeStyle = '#7a8098'; c.lineWidth = 1.5; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = S.g[ty * S.W + tx], bx = tx * SR_T, by = ty * SR_T;
        if (v < 2 || v > 5) continue;
        for (let k = 0; k < 3; k++) {
          const a = k * 10 + 1;
          if (v === 2) { c.moveTo(bx + a, by + 32); c.lineTo(bx + a + 5, by + 12); c.lineTo(bx + a + 10, by + 32); }
          else if (v === 3) { c.moveTo(bx + a, by); c.lineTo(bx + a + 5, by + 20); c.lineTo(bx + a + 10, by); }
          else if (v === 4) { c.moveTo(bx + 32, by + a); c.lineTo(bx + 12, by + a + 5); c.lineTo(bx + 32, by + a + 10); }
          else { c.moveTo(bx, by + a); c.lineTo(bx + 20, by + a + 5); c.lineTo(bx, by + a + 10); }
        }
      }
      c.fill(); c.stroke();
      c.fillStyle = '#c23a48'; c.beginPath();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = S.g[ty * S.W + tx], bx = tx * SR_T, by = ty * SR_T;
        if (v < 2 || v > 5) continue;
        for (let k = 0; k < 3; k++) { const a = k * 10 + 1; if (v === 2) c.rect(bx + a + 4, by + 12, 2, 4); else if (v === 3) c.rect(bx + a + 4, by + 16, 2, 4); else if (v === 4) c.rect(bx + 12, by + a + 4, 4, 2); else c.rect(bx + 16, by + a + 4, 4, 2); }
      }
      c.fill();
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const v = S.g[ty * S.W + tx], bx = tx * SR_T, by = ty * SR_T;
        if (v === 6) { c.fillStyle = th.blk[2]; c.fillRect(bx, by, SR_T, 7); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(bx, by + 7, SR_T, 2); c.fillStyle = th.blk[1]; c.fillRect(bx + 4, by + 9, 3, 8); c.fillRect(bx + 25, by + 9, 3, 8); }
        else if (v === 8) { c.fillStyle = '#c8ccd8'; c.fillRect(bx + 8, by - 6, 3, 8); c.fillRect(bx + 21, by - 6, 3, 8); c.fillStyle = '#2fd0ff'; rrect(c, bx + 2, by - 10, SR_T - 4, 7, 3); c.fill(); }
      }
      return cv;
    }

    function srDrawMan(c, S, ftime, sc) {
      const x = S.x, y = S.y, f = S.face;
      const sp = Math.abs(S.vx);
      let pose = 'idle';
      if (S.zip >= 0) pose = 'zip';
      else if (S.slide > 0) pose = 'slide';
      else if (S.crouch) pose = 'crouch';
      else if (!S.onG && S.wall && S.vy > 0) pose = 'wall';
      else if (!S.onG) pose = S.vy < 0 ? 'jump' : 'fall';
      else if (sp > 20) pose = 'run';
      const ph = S.t * (sp / 22 + 2);
      let hip = [0, -18], neck = [0, -34], head = [0, -42], hd = 7.5, A = [], Lg = [];
      if (pose === 'idle') { const b = Math.sin(ftime * 2.5) * .8; neck = [0, -34 + b]; head = [0, -42 + b]; A = [[-4, -24, -6, -15], [4, -24, 6, -15]]; Lg = [[-4, -9, -5, 0], [4, -9, 5, 0]]; }
      else if (pose === 'run') { const s = Math.sin(ph), c2 = Math.cos(ph); hip = [0, -18 + Math.abs(c2) * -1.5]; neck = [3, -33]; head = [5, -41]; A = [[3 + s * -8, -24, 3 + s * -12, -17 + Math.abs(s) * -3], [3 + s * 8, -24, 3 + s * 12, -17 - Math.abs(s) * 3]]; Lg = [[s * 9, -9 + Math.max(0, -c2) * -4, s * 14, Math.max(0, c2) * -8], [-s * 9, -9 + Math.max(0, c2) * -4, -s * 14, Math.max(0, -c2) * -8]]; }
      else if (pose === 'jump') { hip = [0, -20]; neck = [1, -35]; head = [2, -43]; A = [[-7, -32, -10, -40], [7, -30, 11, -37]]; Lg = [[5, -12, 1, -4], [-4, -10, -8, -2]]; }
      else if (pose === 'fall') { A = [[-9, -28, -15, -33], [9, -28, 15, -33]]; Lg = [[6, -9, 9, 0], [-6, -9, -9, -1]]; }
      else if (pose === 'wall') { neck = [-2, -34]; head = [-4, -42]; A = [[5, -30, 9, -36], [4, -24, 9, -22]]; Lg = [[4, -10, 8, -4], [-3, -8, -2, 0]]; }
      else if (pose === 'slide') { hip = [-2, -8]; neck = [-12, -16]; head = [-19, -20]; A = [[-12, -10, -16, -3], [-6, -14, -2, -6]]; Lg = [[6, -6, 16, -2], [4, -4, 13, 0]]; }
      else if (pose === 'crouch') { hip = [-1, -10]; neck = [2, -21]; head = [3, -29]; A = [[4, -15, 8, -10], [-2, -15, 2, -9]]; Lg = [[6, -7, 5, 0], [-5, -6, -6, 0]]; }
      else if (pose === 'zip') { hip = [0, -18]; neck = [0, -34]; head = [-3, -40]; A = [[-3, -40, 0, -48], [4, -40, 3, -48]]; Lg = [[4, -8, 6, 0], [-3, -8, -6, -1]]; }
      c.save(); c.translate(x, y); c.scale(f * sc, sc);
      c.lineCap = 'round'; c.lineJoin = 'round';
      const stroke = (w, col) => {
        c.strokeStyle = col; c.lineWidth = w; c.beginPath();
        c.moveTo(hip[0], hip[1]); c.lineTo(neck[0], neck[1]);
        for (const a of A) { c.moveTo(neck[0], neck[1] + 3); c.lineTo(a[0], a[1]); c.lineTo(a[2], a[3]); }
        for (const l of Lg) { c.moveTo(hip[0], hip[1]); c.lineTo(l[0], l[1]); c.lineTo(l[2], l[3]); }
        c.stroke();
      };
      stroke(6.5, 'rgba(255,255,255,.85)'); stroke(4, '#0b0e18');
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(head[0], head[1], hd + 1.6, 0, TAU); c.fill();
      c.fillStyle = '#0b0e18'; c.beginPath(); c.arc(head[0], head[1], hd, 0, TAU); c.fill();
      c.restore();
    }

    const SR_CSS = `
.gm-spike-run .sr-acts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,170px),1fr));gap:8px}
.gm-spike-run .sr-act{appearance:none;text-align:left;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#eaf0ff;border-radius:12px;padding:10px 12px;cursor:pointer;font-family:${FONT};min-height:96px;position:relative}
.gm-spike-run .sr-act:hover{border-color:var(--ac);background:rgba(255,255,255,.12)}
.gm-spike-run .sr-act:disabled{opacity:.38;pointer-events:none}
.gm-spike-run .sr-act b{display:block;font:900 17px/1.1 ${FONT}}
.gm-spike-run .sr-act em{display:block;font:800 11px/1 ${FONT};font-style:normal;letter-spacing:.12em;text-transform:uppercase;opacity:.6;margin-bottom:4px}
.gm-spike-run .sr-act span{display:block;font:700 12px/1.4 ${FONT};opacity:.85;margin-top:5px}
.gm-spike-run .sr-act i{position:absolute;right:10px;top:10px;width:22px;height:22px;border-radius:50%;font-style:normal}
.gm-spike-run .sr-act i.g{background:radial-gradient(circle at 35% 35%,#fff4b0,#e0a91a 60%,#9a6a00)}
.gm-spike-run .sr-act i.s{background:radial-gradient(circle at 35% 35%,#ffffff,#b8c0d0 60%,#6a7488)}
.gm-spike-run .sr-act i.b{background:radial-gradient(circle at 35% 35%,#ffd9b0,#c07a3a 60%,#7a4418)}
.gm-spike-run .sr-act.next{border-color:var(--ac)}
.gm-spike-run .sl-btns{position:absolute;top:10px;right:10px;z-index:2;display:flex;gap:8px;line-height:1}
.gm-spike-run .sl-btns button{appearance:none;width:40px;height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.35);background:rgba(10,16,40,.55);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
.gm-spike-run .sl-btns button:hover{background:rgba(10,16,40,.8)}
.gm-spike-run .sl-btns svg{width:20px;height:20px}
.gm-spike-run .sr-act span span,.gm-spike-run .sr-act em span{display:inline;font:inherit;opacity:1;margin:0}
`;

    function mountSpike(root, api) {
      const ID = 'spike-run', PORT = matchMedia('(pointer: coarse)').matches && innerHeight > innerWidth * 1.15, W = PORT ? 540 : 960, H = PORT ? 704 : 540;
      const A = makeAudio(api);
      const pad = [{ s: 'l', b: 1, t: '&#9664;', c: 'mv' }, { s: 'l', b: 2, t: '&#9654;', c: 'mv' }, { s: 'r', b: 4, t: '&#9660;' }, { s: 'r', b: 8, t: 'JUMP', c: 'big' }];
      const st = makeStage(root, api, ID, W, H, pad);
      st.audio = A;
      const ctx = st.ctx;
      const btns = document.createElement('div');
      btns.className = 'sl-btns';
      btns.innerHTML = '<button type="button" data-b="acts" aria-label="Acts" title="Acts"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg></button><button type="button" data-b="flag" aria-label="Back to the last flag" title="Back to the last flag (R)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg></button>';
      st.stage.append(btns);
      btns.addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (!b || scr !== 'play') return; A.play('click'); if (b.dataset.b === 'flag') { if (S && !S.dead && !S.won) srKill(S, 'reset'); } else showMenu(); });
      const fresh = () => ({ v: 1, acts: {}, deaths: 0 });
      const P = (() => {
        const s = api.load(), f = fresh();
        if (!s || typeof s !== 'object' || Array.isArray(s)) return f;
        if (s.acts && typeof s.acts === 'object' && !Array.isArray(s.acts)) {
          for (const k of Object.keys(s.acts).slice(0, 50)) {
            const i = +k, r = s.acts[k];
            if (!(i >= 0 && i < SR_ACTS.length) || String(i) !== k || !r || typeof r !== 'object') continue;
            const t = +r.t, d = Math.floor(+r.d), st0 = Math.floor(+r.s);
            if (!(isFinite(t) && t > 0 && t < 36000)) continue;
            f.acts[k] = { t, d: isFinite(d) && d >= 0 && d < 1e6 ? d : 0, s: isFinite(st0) && st0 >= 0 && st0 <= 3 ? st0 : 0 };
          }
        }
        const dd = Math.floor(+s.deaths); if (isFinite(dd) && dd >= 0 && dd < 1e9) f.deaths = dd;
        return f;
      })();
      const persist = () => api.save(P);
      const doneN = () => Object.keys(P.acts).length;
      const medal = (i, t) => { const a = SR_ACTS[i]; return t <= a.gold ? 'g' : t <= a.silver ? 's' : 'b'; };
      const starTot = () => Object.values(P.acts).reduce((a, r) => a + r.s, 0);
      A.bank = {
        click() { A.tone('sine', 660, 900, .05, .1); },
        jump() { A.tone('square', 300, 520, .08, .045); },
        wall() { A.tone('square', 380, 640, .07, .05); A.noise('highpass', 2000, 2000, 1, .04, .05); },
        spring() { A.tone('sine', 200, 900, .25, .14); },
        land() { A.noise('lowpass', 500, 120, .8, .07, .08); },
        die() { A.noise('bandpass', 1800, 300, 1.2, .25, .2, 0, .002); A.tone('sawtooth', 420, 80, .3, .08); },
        crack() { A.noise('highpass', 1500, 700, 1, .1, .1, 0, .002); },
        slide() { A.noise('bandpass', 1200, 500, 1, .25, .05, 0, .02); },
        zip() { A.noise('bandpass', 3000, 2000, 2, .35, .05, 0, .01); },
        flag() { [784, 988, 1319].forEach((f, i) => A.tone('triangle', f, f, .14, .07, i * .07)); },
        star() { [1319, 1760, 2093].forEach((f, i) => A.tone('sine', f, f, .12, .08, i * .05)); },
        win() { [523, 659, 784, 1047, 1319].forEach((f, i) => { A.tone('square', f, f, .16, .045, i * .09); A.tone('triangle', f / 2, f / 2, .22, .08, i * .09); }); },
        spawn() { A.tone('sine', 300, 700, .14, .06); }
      };

      let scr = 'menu', S = null, actI = 0, acc = 0, ftime = 0, shake = 0, msg = '', msgT = 0, cam = { x: 0, y: 0 };
      const keys = new Set();
      const KM = { ArrowLeft: 'l', KeyA: 'l', KeyQ: 'l', ArrowRight: 'r', KeyD: 'r', ArrowDown: 'd', KeyS: 'd', ArrowUp: 'j', KeyW: 'j', KeyZ: 'j', Space: 'j' };
      const inp = { l: false, r: false, d: false, j: false }, NOIN = { l: false, r: false, d: false, j: false };
      root.gpState = () => S && { scr, act: actI, run: S.run, deaths: S.deaths, got: S.got, stars: S.stars.length, cp: S.cp, won: S.won > 0, x: S.x, y: S.y };
      const readInp = () => {
        const m = st.mask;
        inp.l = (m & 1) > 0; inp.r = (m & 2) > 0; inp.d = (m & 4) > 0; inp.j = (m & 8) > 0;
        for (const k of keys) { const v = KM[k]; if (v) inp[v] = true; }
      };
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (scr === 'result' && (e.code === 'Enter' || e.code === 'Space') && !e.repeat) { e.preventDefault(); const b = st.ovEl.querySelector('[data-a="next"],[data-a="again"]'); if (b) b.click(); return; }
        if (scr !== 'play') return;
        if (KM[e.code] || e.code === 'KeyR') e.preventDefault();
        if (e.code === 'KeyR' && !e.repeat) { if (S && !S.dead && !S.won) srKill(S, 'reset'); return; }
        if (KM[e.code]) { keys.add(e.code); A.ctx(); }
      });
      api.on(window, 'keyup', e => keys.delete(e.code));
      api.on(window, 'blur', () => keys.clear());
      st.onPad = () => A.ctx();

      const fmtT = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
      function showMenu() {
        scr = 'menu'; S = null; api.score('—');
        const n = doneN();
        st.showMenu(`
<div class="gx-top"><h2 class="gx-logo" translate="no">Spike <b>Run</b></h2><div class="gx-row"><span class="gx-chip on" style="pointer-events:none"><span>Acts</span> ${n} / ${SR_ACTS.length}</span><span class="gx-chip" style="pointer-events:none"><span>Stars</span> ${starTot()} / ${SR_ACTS.length * 3}</span><span class="gx-chip" style="pointer-events:none"><span>Deaths</span> ${P.deaths}</span></div></div>
<p class="gx-tag">Run, jump, slide and wall-jump through five acts of spikes, saws and lasers. Flags save your progress.</p>
<div class="sr-acts">${SR_ACTS.map((a, i) => {
          const r = P.acts[i], ok = i === 0 || !!P.acts[i - 1];
          return `<button type="button" class="sr-act${!r && ok ? ' next' : ''}" data-a="act" data-i="${i}"${ok ? '' : ' disabled'}><em><span>Act</span> ${i + 1}</em><b>${SR_TH[i].n}</b>${r ? `<span>${fmtT(r.t)} · ${r.d} <span>deaths</span> · ${r.s}/3 ★</span><i class="${medal(i, r.t)}"></i>` : `<span>${ok ? 'Not finished yet' : 'Finish the act before'}</span>`}</button>`;
        }).join('')}</div>
<p class="gx-help"><kbd>&larr;</kbd><kbd>&rarr;</kbd> <kbd>A</kbd><kbd>D</kbd> <span>run</span> · <kbd>&uarr;</kbd> <kbd>W</kbd> <kbd>Space</kbd> <span>jump (hold for higher)</span> · <kbd>&darr;</kbd> <kbd>S</kbd> <span>crouch, slide while running</span> · <kbd>R</kbd> <span>back to the last flag</span> · <kbd>Esc</kbd> <span>pause</span><br><span>Jump while sliding down a wall to kick off it.</span> <span>Grab zip lines by jumping into them.</span> <span>Medals for fast times, three hidden stars per act.</span></p>`);
      }
      function startAct(i) {
        actI = i; S = srCompile(SR_ACTS[i]); acc = 0; msg = T(SR_TH[i].n); msgT = 2.2;
        cam.x = S.x; cam.y = S.y - 120;
        scr = 'play'; st.showPlay(); st.hideOv(); st.syncPad && st.syncPad();
        api.score('0:00.00');
      }
      function finishAct() {
        const i = actI, k = String(i), old = P.acts[k], t = Math.round(S.run * 100) / 100;
        const nb = !old || t < old.t;
        P.acts[k] = { t: nb ? t : old.t, d: nb ? S.deaths : old.d, s: Math.max(old ? old.s : 0, S.got) };
        P.deaths += S.deaths; persist();
        if (starTot() > 0) api.submit(starTot());
        scr = 'result';
        const a = SR_ACTS[i], m = medal(i, t);
        st.card('Act complete!', `<span>Act</span> ${i + 1} · ${SR_TH[i].n}`, (i < SR_ACTS.length - 1 ? st.btn('next', 'Next act') : '') + st.btn('again', 'Play again', 'alt') + st.btn('menu', 'Acts', 'alt'),
          st.stats([['Time', fmtT(t)], ['Deaths', S.deaths], ['Stars', S.got + ' / ' + S.stars.length], ['Medal', m === 'g' ? 'Gold' : m === 's' ? 'Silver' : 'Bronze']]) +
          `<p class="gx-op"><span>Gold</span> ${fmtT(a.gold)} · <span>Silver</span> ${fmtT(a.silver)}${nb && old ? ' · <span>New best time!</span>' : ''}</p>`);
      }
      st.onAct = (a, ds) => {
        A.ctx();
        if (a === 'act') startAct(+ds.i);
        else if (a === 'next') startAct(Math.min(SR_ACTS.length - 1, actI + 1));
        else if (a === 'again') startAct(actI);
        else if (a === 'menu') showMenu();
      };
      st.ovEl.addEventListener('pointerdown', e => e.stopPropagation());

      const PN = 200, PX = new Float32Array(PN), PY = new Float32Array(PN), PVX = new Float32Array(PN), PVY = new Float32Array(PN), PL = new Float32Array(PN), PM = new Float32Array(PN), PS = new Float32Array(PN), PR = new Float32Array(PN), PC = new Array(PN).fill('#fff');
      let pi = 0;
      const burst = (x, y, n, col, sp, life, size, sticks) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (.3 + Math.random() * .7); PX[pi] = x; PY[pi] = y; PVX[pi] = Math.cos(a) * v; PVY[pi] = Math.sin(a) * v - sp * .3; PL[pi] = PM[pi] = life * (.6 + Math.random() * .4); PS[pi] = size * (.6 + Math.random() * .6); PR[pi] = sticks ? Math.random() * TAU : -1; PC[pi] = col; pi = (pi + 1) % PN; } };
      function events() {
        const ev = S.ev;
        for (let i = 0; i < ev.length; i += 3) {
          const k = ev[i], a = ev[i + 1], b = ev[i + 2];
          if (k === 1) { A.play('die'); shake = 9; burst(a, b, 8, '#0b0e18', 380, .9, 12, 1); burst(a, b, 18, SR_TH[actI].acc, 320, .6, 4); }
          else if (k === 2) A.play('jump', 40);
          else if (k === 3) { A.play('wall', 40); burst(a, b, 5, '#ffffff', 120, .25, 3); }
          else if (k === 4) { A.play('spring', 60); burst(a, b, 8, '#7af0ff', 200, .4, 3); }
          else if (k === 5) { A.play('land', 80); burst(S.x, S.y, 4, 'rgba(255,255,255,.7)', 90, .25, 3); }
          else if (k === 6) { A.play('crack', 50); burst(a, b, 8, SR_TH[actI].blk[2], 160, .5, 5); }
          else if (k === 7) A.play('spawn');
          else if (k === 8) A.play('slide', 100);
          else if (k === 9) A.play('zip', 100);
          else if (k === 10) { A.play('flag'); msg = T('Checkpoint'); msgT = 1.3; burst(a, b - 50, 12, '#5aff8a', 200, .6, 4); }
          else if (k === 11) { A.play('star'); burst(a, b, 14, '#ffd23a', 220, .6, 4); }
          else if (k === 12) { A.play('win'); for (let j = 0; j < 3; j++) burst(a, b - 30, 16, ['#ffd23a', '#5ad1ff', '#ff5a9a'][j], 380, 1.2, 5); }
        }
        ev.length = 0;
      }
      let lastSc = '';
      function frame(dt) {
        if (!S || (scr !== 'play' && scr !== 'result')) return;
        ftime += dt; acc += dt;
        readInp();
        let n = 0;
        const drv = root.gpDrive;
        while (acc >= SR_STEP && n < 12) { acc -= SR_STEP; n++; srStep(S, scr === 'play' ? (drv ? drv(S) || NOIN : inp) : NOIN); }
        if (n >= 12) acc = 0;
        events();
        if (scr === 'play' && S.won > .8) finishAct();
        if (scr === 'play') { const sc = fmtT(S.run); if (sc.slice(0, -1) !== lastSc) { lastSc = sc.slice(0, -1); api.score(sc); } }
        const tx = S.x + S.face * 60 + S.vx * .25, ty = S.y - 90;
        cam.x += (tx - cam.x) * (1 - Math.pow(.01, dt)); cam.y += (ty - cam.y) * (1 - Math.pow(.02, dt));
        cam.x = clamp(cam.x, W / 2, Math.max(W / 2, S.W * SR_T - W / 2)); cam.y = clamp(cam.y, H / 2 - 64, Math.max(H / 2, S.H * SR_T - H / 2));
        shake *= Math.pow(.002, dt);
        if (msgT > 0) msgT -= dt;
        draw(dt);
      }
      api.loop(frame);
      const bgc = {};
      function bgFor(i) {
        if (bgc[i]) return bgc[i];
        const th = SR_TH[i], mk = (w, h, far) => {
          const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), R = gpRng(i * 31 + (far ? 3 : 9));
          x.fillStyle = far ? th.far : th.near;
          for (let px = 0; px < w;) {
            const bw = 40 + R() * (far ? 90 : 60), bh = h * (far ? .35 + R() * .45 : .25 + R() * .35);
            if (i === 2) { x.beginPath(); x.ellipse(px + bw / 2, h, bw * .7, bh, 0, Math.PI, 0); x.fill(); x.beginPath(); x.ellipse(px + bw / 2, 0, bw * .35, bh * .35, 0, 0, Math.PI); x.fill(); }
            else if (i === 4) { x.beginPath(); x.moveTo(px - bw * .3, h); x.lineTo(px + bw / 2, h - bh * 1.1); x.lineTo(px + bw * 1.3, h); x.fill(); }
            else { x.fillRect(px, h - bh, bw, bh); if (!far) { x.fillStyle = hex(th.acc, -.35); for (let k = 0; k < 5; k++) x.fillRect(px + 6 + R() * (bw - 14), h - bh + 10 + R() * (bh - 20), 4, 6); x.fillStyle = th.near; } }
            px += bw + (far ? 2 : 10 + R() * 24);
          }
          return c;
        };
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
        return (bgc[i] = { sky: g, far: mk(1200, 380, 1), near: mk(1500, 300, 0) });
      }
      function draw(dt) {
        const c = ctx, th = SR_TH[actI], bg = bgFor(actI);
        c.fillStyle = bg.sky; c.fillRect(0, 0, W, H);
        const par = (img, f, yb) => { const iw = img.width, ox = ((-cam.x * f) % iw + iw) % iw - iw, y = yb - (cam.y - S.H * SR_T / 2) * f * .5; for (let x = ox; x < W; x += iw) c.drawImage(img, x, y); };
        par(bg.far, .15, H - bg.far.height + 40); par(bg.near, .35, H - bg.near.height + 70);
        const ox = Math.round(W / 2 - cam.x + (shake ? (Math.random() - .5) * shake : 0)), oy = Math.round(H / 2 - cam.y + (shake ? (Math.random() - .5) * shake : 0));
        c.save(); c.translate(ox, oy);
        const dd = st.canvas.width / W, CW = 512, ch0 = Math.max(0, Math.floor((cam.x - W / 2) / CW)), ch1 = Math.min(Math.floor((S.W * SR_T - 1) / CW), Math.floor((cam.x + W / 2) / CW));
        if (!S.chunks || S.chunkD !== dd) { S.chunks = new Map(); S.chunkD = dd; }
        for (let ci = ch0; ci <= ch1; ci++) {
          let cv = S.chunks.get(ci);
          if (cv) { S.chunks.delete(ci); S.chunks.set(ci, cv); }
          else { cv = srChunk(S, th, ci, CW, dd); S.chunks.set(ci, cv); if (S.chunks.size > 5) S.chunks.delete(S.chunks.keys().next().value); }
          c.drawImage(cv, ci * CW - 1, -12, CW + 2, S.H * SR_T + 12);
        }
        for (let q = 0; q < S.crx.length; q++) {
          const i = S.crx[q], tx = i % S.W, ty = (i / S.W) | 0, bx = tx * SR_T, by = ty * SR_T;
          if (bx < cam.x - W / 2 - SR_T || bx > cam.x + W / 2) continue;
          const cr = S.cr[i];
          if (cr < 0) { c.strokeStyle = 'rgba(255,255,255,.18)'; c.setLineDash([4, 4]); c.strokeRect(bx + 2, by + 2, SR_T - 4, SR_T - 4); c.setLineDash([]); continue; }
          const j = cr > 0 ? (Math.random() - .5) * 3 : 0;
          c.fillStyle = '#8a6a48'; c.fillRect(bx + j, by, SR_T, SR_T); c.fillStyle = '#a8865e'; c.fillRect(bx + j, by, SR_T, 5);
          c.strokeStyle = '#4a3420'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + 6 + j, by + 8); c.lineTo(bx + 14 + j, by + 18); c.lineTo(bx + 10 + j, by + 28); c.moveTo(bx + 24 + j, by + 6); c.lineTo(bx + 18 + j, by + 16); c.stroke();
        }
        const L0 = cam.x - W / 2 - 60, R0 = cam.x + W / 2 + 60;
        for (const L of S.lasers) {
          if (L.x < L0 || L.x > R0) continue;
          c.fillStyle = '#4a4f66'; c.fillRect(L.x - 8, L.y0, 16, 8); c.fillRect(L.x - 8, L.y1 - 6, 16, 6);
          if (L.on) { c.fillStyle = 'rgba(255,60,90,.35)'; c.fillRect(L.x - 6, L.y0 + 8, 12, L.y1 - L.y0 - 14); c.fillStyle = '#ffd0dc'; c.fillRect(L.x - 2, L.y0 + 8, 4, L.y1 - L.y0 - 14); }
          else if (L.warn) { c.fillStyle = (ftime * 20 | 0) % 2 ? 'rgba(255,60,90,.5)' : 'rgba(255,60,90,.15)'; c.fillRect(L.x - 1, L.y0 + 8, 2, L.y1 - L.y0 - 14); }
          c.fillStyle = L.on ? '#ff3c5a' : L.warn ? '#ffa03c' : '#3a3f52'; c.fillRect(L.x - 4, L.y0 + 2, 8, 4);
        }
        for (const z of S.zips) {
          if (z.x2 < L0 || z.x1 > R0) continue;
          c.strokeStyle = '#1a1e2c'; c.lineWidth = 4; c.beginPath(); c.moveTo(z.x1, z.y1); c.lineTo(z.x2, z.y2); c.stroke();
          c.strokeStyle = '#c8ccd8'; c.lineWidth = 2; c.beginPath(); c.moveTo(z.x1, z.y1); c.lineTo(z.x2, z.y2); c.stroke();
          c.fillStyle = '#4a4f66'; c.fillRect(z.x1 - 5, z.y1 - 8, 10, 14); c.fillRect(z.x2 - 5, z.y2 - 8, 10, 14);
        }
        for (const p of S.plats) {
          if (p.x > R0 || p.x + p.w < L0) continue;
          c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(p.x0 - p.a + p.w / 2 - 1, p.y0 - p.b + 6, p.a * 2 + 2, p.b * 2 + 2);
          c.fillStyle = th.blk[2]; rrect(c, p.x, p.y, p.w, 12, 4); c.fill();
          c.fillStyle = th.acc; c.fillRect(p.x + 6, p.y + 4, p.w - 12, 3);
        }
        for (const s of S.saws) {
          if (s.x + s.r < L0 || s.x - s.r > R0) continue;
          if (s.k === 2) { c.strokeStyle = '#3a3f52'; c.lineWidth = 6; c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x, s.y); c.stroke(); c.fillStyle = '#5a6074'; c.beginPath(); c.arc(s.x0, s.y0, 8, 0, TAU); c.fill(); }
          else if (s.k === 1) { c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 4; c.beginPath(); c.moveTo(s.x0 - s.a, s.y0 - s.b); c.lineTo(s.x0 + s.a, s.y0 + s.b); c.stroke(); }
          c.save(); c.translate(s.x, s.y); c.rotate(S.t * 14);
          c.fillStyle = '#d7dbe6'; c.beginPath();
          const n = s.r > 30 ? 18 : 12;
          for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr = i % 2 ? s.r * .78 : s.r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          c.closePath(); c.fill();
          c.fillStyle = '#9aa0b4'; c.beginPath(); c.arc(0, 0, s.r * .62, 0, TAU); c.fill();
          c.fillStyle = '#e2453c'; c.beginPath(); c.arc(0, 0, s.r * .24, 0, TAU); c.fill();
          c.restore();
        }
        for (const cp of S.cps) {
          if (cp.x < L0 || cp.x > R0) continue;
          c.fillStyle = '#c8ccd8'; c.fillRect(cp.x - 2, cp.y - 64, 4, 64);
          const wv = Math.sin(ftime * 6 + cp.x) * 3;
          c.fillStyle = cp.on ? '#3ad36a' : '#e2453c'; c.beginPath(); c.moveTo(cp.x + 2, cp.y - 64); c.quadraticCurveTo(cp.x + 16, cp.y - 60 + wv, cp.x + 30, cp.y - 56); c.lineTo(cp.x + 2, cp.y - 44); c.closePath(); c.fill();
        }
        for (const s of S.stars) {
          if (s.got || s.x < L0 || s.x > R0) continue;
          gpStar(c, s.x, s.y + Math.sin(ftime * 3 + s.x) * 3, 12, true, true);
        }
        if (S.ex) {
          const ex = S.ex, ey = S.ey - 36;
          c.save(); c.translate(ex, ey);
          for (let i = 0; i < 4; i++) { c.strokeStyle = `rgba(120,255,170,${.7 - i * .15})`; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 16 + i * 4 + Math.sin(ftime * 4 + i) * 2, 34 + i * 4, 0, 0, TAU); c.stroke(); }
          c.fillStyle = 'rgba(120,255,170,.25)'; c.beginPath(); c.ellipse(0, 0, 16, 34, 0, 0, TAU); c.fill();
          c.restore();
        }
        if (!S.dead && !(S.won > .3)) srDrawMan(c, S, ftime, 1);
        for (let i = 0; i < PN; i++) {
          if (PL[i] <= 0) continue;
          PL[i] -= dt; PVY[i] += 1300 * dt; PX[i] += PVX[i] * dt; PY[i] += PVY[i] * dt;
          c.globalAlpha = Math.max(0, PL[i] / PM[i]);
          if (PR[i] >= 0) { PR[i] += dt * 9; c.strokeStyle = PC[i]; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(PX[i] - Math.cos(PR[i]) * PS[i] / 2, PY[i] - Math.sin(PR[i]) * PS[i] / 2); c.lineTo(PX[i] + Math.cos(PR[i]) * PS[i] / 2, PY[i] + Math.sin(PR[i]) * PS[i] / 2); c.stroke(); }
          else { c.fillStyle = PC[i]; c.fillRect(PX[i] - PS[i] / 2, PY[i] - PS[i] / 2, PS[i], PS[i]); }
        }
        c.globalAlpha = 1;
        c.restore();
        c.fillStyle = 'rgba(0,0,0,.35)'; rrect(c, 10, 10, 236, 38, 10); c.fill();
        txt(c, fmtT(S.run), 22, 30, 18, '#fff', 'left', 900);
        txtC(c, '✖ ' + S.deaths, 130, 30, 16, '#ff9aa8', 'left', 900, null, dd);
        gpStar(c, 196, 29, 9, true, false); txtC(c, S.got + '/' + S.stars.length, 210, 30, 15, '#fff', 'left', 900, null, dd);
        if (msgT > 0) { c.globalAlpha = Math.min(1, msgT * 2); txtC(c, msg, W / 2, 70, 30, '#fff', 'center', 900, 'rgba(0,0,0,.5)', dd); c.globalAlpha = 1; }
      }
      showMenu();
      return { destroy() { A.destroy(); } };
    }

    Ameplay.register({
      id: 'spike-run',
      title: "Vex",
      category: 'Skill',
      tint: '#ffb23a',
      blurb: 'A stickman parkour run through five handmade acts. Run, jump, slide under saws, kick off walls, ride zip lines and dodge lasers. Flags save your progress, medals reward fast runs.',
      help: '<kbd>&larr;</kbd><kbd>&rarr;</kbd> <span>run</span> · <kbd>&uarr;</kbd> <kbd>Space</kbd> <span>jump</span> · <kbd>&darr;</kbd> <span>crouch and slide</span> · <kbd>R</kbd> <span>back to the last flag</span> · <kbd>Esc</kbd> <span>pause</span>',
      width: 960,
      better: 'high',
      format: v => v + ' ★',
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="34" cy="12" r="5"/><path d="M32 18l-4 16M30 24l10 4M30 24l-10 2M28 34l8 10M28 34l-8 8"/><path d="M8 58l6-10 6 10 6-10 6 10"/></svg>',
      css: sxCss('spike-run', '#ffb23a') + SR_CSS,
      engine: { SR_ACTS, srCompile, srStep, SR_STEP },
      mount: mountSpike
    });

  }
})();
