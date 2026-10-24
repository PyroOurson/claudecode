
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
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

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
    root.innerHTML = '<div class="gx-menu"></div><div class="gx-play" hidden><div class="gx-stage"><div class="gx-ov" hidden></div></div><div class="gx-pad"></div></div>';
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
    const DIFF = [{ n: 'Easy', hp: .8, dmg: .72, err: 1.45, cd: 1.3, learn: .45 }, { n: 'Normal', hp: 1, dmg: 1, err: 1, cd: 1, learn: .7 }, { n: 'Hard', hp: 1.25, dmg: 1.2, err: .7, cd: .8, learn: .9 }];

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
        stk: [], cmd: { ang: team ? Math.PI - .6 : -.6, p: 0, draw: false, shot: null }, ai: { t: 1 + Math.random(), bias: [0, 0], last: null, plan: null }, burnT: 0, dieT: 0, hot: 0
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
      const dif = DIFF[cfg.diff == null ? 1 : cfg.diff];
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
            hp, dmgMul: (.6 + w * .042) * dif.dmg, critMul: 1.2, cd: Math.max(.9, (K.cd * (1 - Math.min(.35, w * .014))) * dif.cd), errMul: dif.err * Math.max(.45, 1 - w * .028), lvl: Math.min(5, 1 + w / 4), st: 100, regen: 28, ctl: 'ai',
            ammo: { fire: 99, ice: 99, bomb: 99, triple: 99, lightning: 99 }
          });
          S.ar.push(en);
        });
      } else {
        const ds = cfg.duel;
        const mk = (i, team, ctl, name) => newArcher(S, i, team, 'duel', team ? [RW - ar.pl[0], ar.pl[1]] : ar.pl.slice(), {
          hp: 100, st: 100, regen: 28, dmgMul: 1, critMul: 1, armor: 0, cd: .4, ctl, name, band: team ? '#e2453c' : '#3b82f6', ammo: { fire: 2, ice: 2, bomb: 1, triple: 2, lightning: 1 },
          errMul: ctl === 'ai' ? dif.err : 1, lvl: cfg.diff
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
      const head = Math.random() < a.head;
      const tpx = (head ? T.x[IH] : T.x[IN]) + ai.bias[0], tpy = (head ? T.y[IH] : (T.y[IN] + T.y[IP]) / 2) + ai.bias[1];
      let ty = 'normal';
      const avail = [];
      if (a.sp) for (const t of a.sp) if (a.ammo[t] > 0) avail.push(t);
      if (a.ctl === 'ai' && S.mode === 'duel') for (const t of ['fire', 'ice', 'bomb', 'triple', 'lightning']) if (a.ammo[t] > 0) avail.push(t);
      const chance = S.mode === 'duel' ? .28 : a.spc;
      if (avail.length && Math.random() < chance) ty = pick(avail);
      if (T.frozen > .7 && a.ammo.bomb > 0 && S.mode === 'duel') ty = 'bomb';
      const ox = a.x[IN], oy = a.y[IN];
      let best = null;
      for (const pw of [1, .88, .76, .64, .52]) {
        const v = VMIN + (VMAX - VMIN) * pw;
        for (const ang of solveAngles(ox, oy, tpx, tpy, v)) {
          const mx = ox + Math.cos(ang) * 28 * a.sc, my = oy + 3 + Math.sin(ang) * 28 * a.sc;
          const ang2 = solveAngles(mx, my, tpx, tpy, v).sort((p, q) => Math.abs(angDiff(p, ang)) - Math.abs(angDiff(q, ang)))[0];
          if (ang2 == null) continue;
          const r = ballistic(S, a.team, mx, my, v, ang2, 3.2, false, [[tpx, tpy]]);
          let sc = r.mind;
          if (r.end.k === 'solid') sc += 14;
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
      return { ang, pw, ty, t: 0, dur: (.5 + pw * .5) * (a.err > 1.1 ? 1.2 : a.err < .7 ? .85 : 1), tx: tpx, tyy: tpy, tgt: T.idx };
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
          ai.plan = null; ai.t = a.cdMax * (.85 + Math.random() * .5);
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
      const g = (DIFF[S.cfg.diff == null ? 1 : S.cfg.diff].learn || .7) * .75;
      if (A.hitBody) { o.ai.bias[0] *= .5; o.ai.bias[1] *= .5; return; }
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
        pop(V, x, y - 12, (head ? 'HEADSHOT ' : '') + dmg, head ? '#ffdf4d' : idx === 0 && S.mode === 'waves' ? '#ff7a6a' : '#ffffff', head ? 21 : zone === 'body' ? 16 : 13, head ? 1.4 : 1);
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
        if (head) pop(V, x, y - 44, 'HEADSHOT!', '#ff5a4a', 26, 1.6);
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
      else if (k === 'thud') { A.play('thud', 40); } else if (k === 'tired') { if (S.ar[ev[1]] && S.ar[ev[1]].ctl === 'human' || sh.me === ev[1]) { A.play('tired', 200); pop(V, S.ar[ev[1]].x[IN], S.ar[ev[1]].y[IN] - 70, 'Out of stamina', '#ffd447', 14, .9); } }
      else if (k === 'coin') { pop(V, ev[3], ev[4], '+' + ev[2], '#ffd447', 17, 1.3); A.play('coin', 50); }
      else if (k === 'ammo') { pop(V, ev[2], ev[3], '+1 ' + TNAME[ev[1]], TCOL[ev[1]], 14, 1.5); }
      else if (k === 'go') { A.play('go'); V.banner = 'FIGHT!'; V.sub = ''; V.bannerT = .55; }
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
      if (a.team === 1 && a.name && S0.mode === 'waves') txt(ctx, a.name, a.x[IH], y - 8, 10, '#fff', 'center', 800, 'rgba(0,0,0,.6)');
      ctx.globalAlpha = 1;
    }
    let S0 = { mode: 'waves' };

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
        if (p.kind === 'flame') { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.4 + k), 0, TAU); ctx.fill(); }
        else if (p.kind === 'smoke') { ctx.globalAlpha = k * .35; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (2 - k), 0, TAU); ctx.fill(); }
        else if (p.kind === 'ice') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.life * 3); ctx.fillRect(-p.size, -p.size * .4, p.size * 2, p.size * .8); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.5, p.size * k), 0, TAU); ctx.fill(); }
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
        txt(ctx, p.text, p.x, p.y, p.size * (1 + Math.max(0, .5 - u * 4) * .6), p.col, 'center', 900, 'rgba(0,0,0,.65)');
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

    function drawHud(ctx, S, V, sh) {
      const me = S.ar[sh.me] || S.ar[0];
      const pad = 14;
      const bar = (x, y, w, h, fr, c1, c2, label) => {
        ctx.fillStyle = 'rgba(8,12,28,.62)'; rrect(ctx, x - 3, y - 3, w + 6, h + 6, h / 2 + 3); ctx.fill();
        ctx.fillStyle = c2; rrect(ctx, x, y, w, h, h / 2); ctx.fill();
        if (fr > 0.001) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1[0]); g.addColorStop(1, c1[1]); ctx.fillStyle = g; rrect(ctx, x, y, Math.max(h, w * fr), h, h / 2); ctx.fill(); }
        if (label) txt(ctx, label, x + 10, y + h / 2 + .5, h * .72, '#fff', 'left', 900, 'rgba(0,0,0,.5)');
      };
      const duel = S.mode === 'duel';
      const L = duel ? S.ar[0] : me;
      const meRight = duel && sh.me === 1;
      const mx = meRight ? RW - pad - 150 : pad;
      txt(ctx, L.name, pad, 14, 13, duel && L === me ? '#ffe28a' : '#fff', 'left', 900, 'rgba(0,0,0,.6)');
      bar(pad, 24, 190, 14, clamp(L.hp / L.mhp, 0, 1), ['#58e07a', '#2aa84d'], '#2b3350', Math.ceil(L.hp) + '/' + L.mhp);
      if (!meRight) bar(pad, 46, 150, 8, me.st / me.mst, ['#ffd447', '#e8a21a'], '#2b3350');
      const inp = sh.inp;
      if (inp.aiming && me.alive) {
        const cost = (8 + 26 * inp.p + (TXC[inp.ty] || 0)) / me.mst;
        ctx.fillStyle = me.st >= cost * me.mst ? 'rgba(255,255,255,.55)' : 'rgba(255,70,60,.8)';
        ctx.fillRect(mx + 150 * clamp(me.st / me.mst - 0, 0, 1) - 1, 43, 2, 14);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(mx + 150 * clamp(cost, 0, 1) - 1, 43, 2, 14);
      }
      const en = duel ? [S.ar[1]] : S.ar.filter(q => q !== me && q.team !== me.team);
      en.slice(0, 3).forEach((q, i) => {
        const x = RW - pad - 190, y = 24 + i * 24;
        if (i === 0) txt(ctx, S.mode === 'waves' ? 'Enemy' : q.name, RW - pad, 14, 13, meRight ? '#ffe28a' : '#fff', 'right', 900, 'rgba(0,0,0,.6)');
        bar(x, y, 190, i ? 10 : 14, clamp(q.hp / q.mhp, 0, 1), ['#ff7a6a', '#d9392b'], '#2b3350', i ? null : Math.ceil(q.hp) + '/' + q.mhp);
        if (i && q.alive === false) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x, y, 190, 10); }
      });
      if (meRight) bar(RW - pad - 150, 46, 150, 8, me.st / me.mst, ['#ffd447', '#e8a21a'], '#2b3350');
      if (S.mode === 'waves') {
        txt(ctx, 'WAVE ' + S.wave, RW / 2, 16, 20, '#fff', 'center', 900, 'rgba(0,0,0,.65)');
        ctx.fillStyle = '#ffd447'; ctx.beginPath(); ctx.arc(RW / 2 - 28, 40, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.stroke();
        txt(ctx, '' + S.meta.coins, RW / 2 - 16, 41, 15, '#fff', 'left', 900, 'rgba(0,0,0,.6)');
      } else {
        txt(ctx, S.score[0] + '  -  ' + S.score[1], RW / 2, 18, 26, '#fff', 'center', 900, 'rgba(0,0,0,.65)');
        txt(ctx, 'ROUND ' + S.rnd + (S.cfg.need ? '  ·  first to ' + S.cfg.need : ''), RW / 2, 40, 11, 'rgba(255,255,255,.85)', 'center', 800, 'rgba(0,0,0,.5)');
      }
      if (V.bannerT > 0) {
        const k = V.bannerT;
        ctx.globalAlpha = Math.min(1, k * 2);
        txt(ctx, V.banner, RW / 2, 150, 54 + (1 - k) * 12, '#fff', 'center', 900, 'rgba(0,0,0,.7)');
        if (V.sub) txt(ctx, V.sub, RW / 2, 196, 18, '#fff', 'center', 800, 'rgba(0,0,0,.6)');
        ctx.globalAlpha = 1;
      }
    }
    function drawAimUi(ctx, S, V, sh) {
      const inp = sh.inp, a = S.ar[sh.me];
      if (!a || !inp.aiming || !a.alive) return;
      if (inp.sx != null && inp.ptr) {
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(inp.sx, inp.sy); ctx.lineTo(inp.cx, inp.cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(inp.sx, inp.sy, 5, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(inp.cx, inp.cy, 9, 0, TAU); ctx.stroke();
      }
      const px = a.x[IN], py = a.y[IN] + 3, r = 42 * a.sc;
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(px, py, r, inp.ang - 1.2, inp.ang + 1.2); ctx.stroke();
      const eff = effPower(a, inp.p, inp.ty);
      const col = inp.p < .5 ? '#7bdc65' : inp.p < .8 ? '#ffd447' : '#ff6a4a';
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(px, py, r, inp.ang - 1.2, inp.ang - 1.2 + 2.4 * inp.p); ctx.stroke();
      if (eff < inp.p - .01) { ctx.strokeStyle = 'rgba(255,70,60,.95)'; ctx.beginPath(); ctx.arc(px, py, r + 7, inp.ang - 1.2 + 2.4 * eff, inp.ang - 1.2 + 2.4 * inp.p); ctx.stroke(); }
      txt(ctx, Math.round(inp.p * 100) + '%', px + Math.cos(inp.ang) * (r + 20), py + Math.sin(inp.ang) * (r + 20), 12, '#fff', 'center', 900, 'rgba(0,0,0,.65)');
    }

    function renderAll(ctx, S, V, sh, dt) {
      S0 = S;
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
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (const f of V.snow) { f.y += f.v * dt; f.x += Math.sin(V.t * 1.3 + f.w) * 14 * dt; if (f.y > RH) { f.y = -4; f.x = Math.random() * RW; } ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, TAU); ctx.fill(); }
      }
      if (V.slow > 0) { const g = ctx.createRadialGradient(RW / 2, RH / 2, 240, RW / 2, RH / 2, 620); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (.5 * slowK) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, RW, RH); }
      drawHud(ctx, S, V, sh);
      drawAimUi(ctx, S, V, sh);
    }

    const RA_CSS = `
.gm-ragdoll-archers .ra-types{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px auto 0;max-width:960px;width:100%}
.gm-ragdoll-archers .ra-ty{appearance:none;display:flex;align-items:center;gap:7px;border:2px solid rgba(255,255,255,.16);background:rgba(14,22,48,.92);color:#eaf0ff;border-radius:12px;padding:6px 10px;font:800 12px/1 ${FONT};cursor:pointer;min-height:42px;position:relative}
.gm-ragdoll-archers .ra-ty svg{width:30px;height:16px;flex:none}
.gm-ragdoll-archers .ra-ty b{font-weight:900;font-size:11px;letter-spacing:.02em;display:block}
.gm-ragdoll-archers .ra-ty small{display:block;font-weight:700;opacity:.7;font-size:10px;margin-top:2px}
.gm-ragdoll-archers .ra-ty kbd{font:800 9px ${FONT};background:rgba(255,255,255,.16);color:#eaf0ff;border:0;box-shadow:none;border-radius:4px;padding:1px 4px;margin-left:4px;display:inline-block;min-width:0}
.gm-ragdoll-archers .ra-ty.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 45%,#101a3c)}
.gm-ragdoll-archers .ra-ty.off{opacity:.38}
.gm-ragdoll-archers .ra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:8px}
.gm-ragdoll-archers .ra-card{display:flex;flex-direction:column;gap:6px;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;font-family:${FONT}}
.gm-ragdoll-archers .ra-card h4{margin:0;font:900 14px/1.1 ${FONT}}
.gm-ragdoll-archers .ra-card p{margin:0;font:600 11px/1.35 ${FONT};opacity:.75}
.gm-ragdoll-archers .ra-pips{display:flex;gap:3px}
.gm-ragdoll-archers .ra-pips i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.14)}
.gm-ragdoll-archers .ra-pips i.on{background:var(--ac)}
.gm-ragdoll-archers .ra-buy{appearance:none;border:0;border-radius:10px;padding:8px 10px;font:900 12px/1 ${FONT};color:#1a1200;background:#ffd447;cursor:pointer;min-height:34px}
.gm-ragdoll-archers .ra-buy:disabled{opacity:.35;pointer-events:none}
.gm-ragdoll-archers .ra-buy.alt{background:#2c3a66;color:#eaf0ff}
.gm-ragdoll-archers .ra-coins{font:900 20px/1 ${FONT};color:#ffd447}
.gm-ragdoll-archers .ra-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
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
      const ID = 'ragdoll-archers';
      const A = makeAudio(api);
      const st = makeStage(root, api, ID, RW, RH, null);
      st.audio = A;
      const net = api.net;
      const invited = !!net.invite;
      const saved = api.load() || {};
      const opt = Object.assign({ diff: 1, aim: 'pull', prev: 1 }, saved.opt || {});
      const life = Object.assign({ kills: 0, heads: 0, bestWave: 0, duels: 0 }, saved.life || {});
      const persist = () => api.save({ opt, life });
      const typesEl = document.createElement('div');
      typesEl.className = 'ra-types';
      st.playEl.insertBefore(typesEl, st.padEl);
      const inp = { aiming: false, ang: -.6, p: 0, ty: 'normal', ptr: null, sx: 0, sy: 0, cx: 0, cy: 0, elev: .6, face: 1, charge: 0, keys: new Set(), kfire: false };
      const sh = { audio: A, me: 0, inp, opt, local: true, dpr: () => st.canvas.width / RW };
      let S = null, V = null, scr = 'menu', role = 'local', meta = null, acc = 0, rk = 0, seq = 0, lastC = '', lastCt = 0, snapT = 0, saveT = 0, lastScore = '', evq = [], off = 0, gK = -1, hooked = false, lobbying = false, typesKey = '', done = false, cfgBase = null, lastSnapMsg = null;
      const snaps = [];
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
<div class="gx-top"><h2 class="gx-logo">Ragdoll <b>Archers</b></h2><div class="gx-row"><span class="gx-chip on" style="pointer-events:none">Best wave ${best || 0}</span><span class="gx-chip" style="pointer-events:none">${life.kills} kills · ${life.heads} headshots</span></div></div>
<p class="gx-tag">Pull back, aim and let go. Headshots hit twice as hard. Don&#39;t fall off the cliff.</p>
<div class="gx-modes">
  <button type="button" class="gx-mode" data-a="waves"><b>Endless Waves</b><span>Fight wave after wave of AI archers. Earn coins, upgrade your bow, buy special arrows. Boss every 5th wave.</span></button>
  <button type="button" class="gx-mode" data-a="cpu"><b>Duel vs CPU</b><span>One on one, first to 2 rounds. Fire, ice, bomb, triple and storm arrows in every round.</span></button>
  <button type="button" class="gx-mode" data-a="online"><b>Online Duel</b><span>1v1 against a friend with a party code or invite link. The leader can fill the seat with a bot.</span></button>
</div>
${st.orow('Difficulty', st.chips('diff', DIFF.map((d, i) => [i, d.n]), opt.diff))}
${st.orow('Trajectory', st.chips('prev', [[1, 'Full'], [2, 'Short'], [0, 'Off']], opt.prev))}
${st.orow('Aim style', st.chips('aim', [['pull', 'Pull back'], ['push', 'Drag to aim']], opt.aim))}
<p class="gx-help"><kbd>Mouse / touch</kbd> drag to aim, release to shoot (drag back = weaker) · <kbd>Space</kbd> hold to draw, release to fire · <kbd>&uarr;</kbd><kbd>&darr;</kbd> angle · <kbd>&larr;</kbd><kbd>&rarr;</kbd> turn · <kbd>1</kbd>-<kbd>6</kbd> or <kbd>Q</kbd><kbd>E</kbd> arrow type · <kbd>Esc</kbd> pause.<br>Fire burns, ice freezes (hit frozen archers for extra damage), bombs knock archers off ledges, triple fires three, storm arrows stun and chain. Every shot costs stamina: stronger draws cost more.</p>`);
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
          V.banner = S.wave % 5 === 0 ? 'BOSS WAVE ' + S.wave : 'WAVE ' + S.wave;
          V.sub = S.ar.filter(q => q.team === 1).map(q => q.name).join(' · ');
        } else { V.banner = 'ROUND ' + S.rnd; V.sub = S.ar[0].name + ' vs ' + S.ar[1].name; }
        V.bannerT = 1;
        rk++;
        scr = 'play'; st.showPlay(); st.hideOv();
        if (role === 'host' && cfg.guestId && S.ar[1] && S.ar[1].ctl === 'net') S.ar[1].netId = cfg.guestId;
        renderOnce();
        if (role === 'host') sendCfgAll();
      }
      function renderOnce() { try { renderAll(st.ctx, S, V, sh, 0); } catch (e) { console.error(e); } }

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
          return `<div class="ra-card"><h4>${u.n}</h4><p>${u.d}</p><div class="ra-pips">${Array.from({ length: u.max }, (_, i) => `<i${i < lv ? ' class="on"' : ''}></i>`).join('')}</div><button type="button" class="ra-buy" data-a="buy" data-k="${u.k}" ${max || meta.coins < c ? 'disabled' : ''}>${max ? 'Maxed' : 'Buy &middot; ' + c}</button></div>`;
        }).join('');
        const ammo = ['fire', 'ice', 'bomb', 'triple', 'lightning'].map(t => {
          const c = AMMO_COST[t];
          const d = { fire: 'Sets archers ablaze', ice: 'Freezes, then shatters', bomb: 'Explodes, knocks back', triple: 'Three arrows at once', lightning: 'Stuns and chains' }[t];
          return `<div class="ra-card"><h4>${TYSVG(t)} ${TNAME[t]} arrows</h4><p>${d}. In quiver: <b>${meta.ammo[t] | 0}</b></p><div class="ra-bar"><button type="button" class="ra-buy" data-a="ammo" data-k="${t}" data-n="1" ${meta.coins < c ? 'disabled' : ''}>+1 &middot; ${c}</button><button type="button" class="ra-buy alt" data-a="ammo" data-k="${t}" data-n="3" ${meta.coins < c * 3 ? 'disabled' : ''}>+3 &middot; ${c * 3}</button></div></div>`;
        }).join('');
        st.menuEl.innerHTML = `
<div class="gx-top"><h2 class="gx-logo">Wave ${S.wave} <b>cleared</b></h2><span class="ra-coins">&#9679; ${meta.coins}</span></div>
<p class="gx-tag">Health ${Math.ceil(cur)}/${hpMax}. Spend your coins, then fight on. Wave ${S.wave + 1}${(S.wave + 1) % 5 === 0 ? ' is a boss wave' : ''} is next.</p>
<div class="gx-sec">Bow upgrades</div><div class="ra-grid">${cards}</div>
<div class="gx-sec">Special arrows</div><div class="ra-grid">${ammo}</div>
<div class="gx-row" style="margin-top:14px">${cur < hpMax ? `<button type="button" class="ra-buy" data-a="heal" ${meta.coins < healCost ? 'disabled' : ''}>Heal to full &middot; ${healCost}</button>` : ''}${st.btn('next', 'Next wave &#9654;')}${st.btn('menu', 'Quit run', 'alt sm')}</div>`;
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
            st.card('Game over', `You were taken down on wave ${S.wave}.`, st.btn('again', 'Play again') + st.btn('menu', 'Menu', 'alt'), st.stats([['Waves cleared', S.wave - 1], ['Kills', S.kills[0]], ['Headshots', S.heads[0]], ['Coins earned', S.earned + (meta.coins || 0) * 0]]));
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
        return clamp(r.width * .2, 64, 150) * (RW / r.width);
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
        renderAll(st.ctx, S, V, sh, dt);
        const sc = S.mode === 'waves' ? 'W' + S.wave + ' · ' + meta.coins : S.score[0] + ' - ' + S.score[1];
        if (sc !== lastScore) { lastScore = sc; api.score(sc); }
        if (S.mode === 'duel' && S.phase === 'end' && !V.endShown) {
          V.endShown = 1;
          const k = S.endKind, mine = sh.me ? 'win1' : 'win0';
          V.banner = k === 'draw' ? 'DRAW' : k === mine ? (S.over ? 'MATCH WON' : 'ROUND WON') : (S.over ? 'MATCH LOST' : 'ROUND LOST');
          V.sub = S.score[0] + ' - ' + S.score[1]; V.bannerT = 1;
        } else if (S.mode === 'waves' && S.phase === 'end' && !V.endShown) {
          V.endShown = 1;
          V.banner = S.endKind === 'clear' ? 'WAVE CLEARED' : 'YOU DIED'; V.sub = ''; V.bannerT = 1;
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
        V = mkVis(S, sh); V.banner = 'ROUND ' + S.rnd; V.sub = m.cfg.names[0] + ' vs ' + m.cfg.names[1]; V.bannerT = 1;
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
        st.card('Game in progress', `Round ${sv.S.rnd}, score ${sv.S.score[0]} - ${sv.S.score[1]}.`, st.btn('resume', 'Resume game') + st.btn('newgame', 'New game', 'alt') + st.btn('menu', 'Leave', 'alt'));
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
        const r = await net.room({ title: 'Ragdoll Archers', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true });
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
      id: 'ragdoll-archers',
      title: 'Ragdoll Archers',
      category: 'Action',
      tint: '#3b82f6',
      blurb: 'Pull back, aim and shoot ragdoll archers off their cliffs. Headshots, fire, ice, bomb, triple and storm arrows. Endless waves, CPU duels and online 1v1.',
      help: 'Drag to aim (pull back), release to shoot · <kbd>Space</kbd> hold and release · <kbd>&uarr;</kbd><kbd>&darr;</kbd> angle · <kbd>1</kbd>-<kbd>6</kbd> arrow type · <kbd>Esc</kbd> pause',
      width: 960,
      better: 'high',
      format: v => 'Wave ' + v,
      icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="16" r="5"/><path d="M20 21v15M20 26l9-3M20 36l-6 12M20 36l7 12"/><path d="M36 10c10 6 10 36 0 42"/><path d="M36 10v42" stroke-width="1.5"/><path d="M26 31h30M50 26l6 5-6 5"/></svg>',
      css: sxCss('ragdoll-archers', '#3b82f6') + RA_CSS,
      mount: mountArchers
    });

  }
})();
