(() => {
  'use strict';

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mulberry = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const shuffle = (a, R) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BOT_NAMES = ['Ada', 'Bruno', 'Chloe', 'Dmitri', 'Esme', 'Felix', 'Gwen', 'Hugo', 'Iris', 'Jonas', 'Kira', 'Leo', 'Maya', 'Nils', 'Olga', 'Pablo'];
  const AV_COL = ['#e2b43a', '#4aa3e8', '#e8624a', '#58c27d', '#b574e8', '#e88ab4', '#5fd0cf', '#c8c85a'];
  const initials = n => esc(String(n || '?').trim().charAt(0).toUpperCase() || '?');
  const SEG = (k, opts, cur) => `<div class="gx-seg" data-k="${k}">${opts.map(([v, t]) => `<button type="button" data-v="${esc(v)}" class="${String(v) === String(cur) ? 'on' : ''}">${t}</button>`).join('')}</div>`;

  function Sound(api) {
    let ac = null, master = null, noise = null;
    const audio = () => {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const nz = (t, dur, f, q, vol, f2, type) => {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; bp.type = type || 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
    };
    const tn = (t, dur, type, f0, f1, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    };
    const chord = (t, fs, dur, type, vol, gap) => fs.forEach((f, i) => tn(t + i * (gap || .07), dur, type, f, f * 1.003, vol));
    const sounds = {
      deal: t => nz(t, .06, 3400, 1.2, .26),
      flip: t => { nz(t, .07, 2800, .9, .3); nz(t + .03, .05, 1200, 1, .15); },
      slide: t => nz(t, .16, 1400, .8, .32, 4200),
      draw: t => { nz(t, .15, 1500, .9, .34, 3800); nz(t + .1, .05, 2600, 1, .2); },
      discard: t => { nz(t, .07, 2600, .8, .42); nz(t, .06, 600, 1, .3); },
      shuffle: t => { for (let i = 0; i < 14; i++) nz(t + i * .034, .05, 2200 + Math.random() * 1800, 1.1, .22); },
      tile: t => { nz(t, .035, 3200, 2.2, .55); tn(t, .05, 'sine', 900, 500, .06); },
      place: t => { nz(t, .04, 2400, 2, .5); tn(t, .07, 'triangle', 420, 260, .09); },
      pick: t => nz(t, .05, 2000, 1.4, .3),
      select: t => tn(t, .04, 'sine', 700, 700, .05),
      click: t => tn(t, .05, 'sine', 600, 600, .045),
      snap: t => { tn(t, .13, 'sawtooth', 220, 110, .06); tn(t + .1, .18, 'square', 150, 80, .045); },
      error: t => tn(t, .12, 'square', 170, 120, .04),
      knock: t => { tn(t, .08, 'triangle', 190, 90, .22); nz(t, .06, 500, 1, .4); tn(t + .13, .1, 'triangle', 170, 80, .22); nz(t + .13, .06, 450, 1, .4); },
      gin: t => chord(t, [523, 659, 784, 1047, 1319], .35, 'triangle', .08, .08),
      win: t => { chord(t, [523, 659, 784, 1047, 1319], .32, 'triangle', .08, .09); tn(t + .5, .8, 'sine', 1047, 1047, .05); },
      lose: t => chord(t, [392, 349, 311, 262], .32, 'triangle', .07, .14),
      round: t => chord(t, [440, 554, 659], .26, 'triangle', .06, .08),
      turn: t => { tn(t, .08, 'sine', 880, 880, .045); tn(t + .08, .12, 'sine', 1320, 1320, .04); },
      tick: t => tn(t, .03, 'square', 1500, 1500, .02),
      warn: t => { tn(t, .09, 'square', 880, 880, .05); tn(t + .12, .09, 'square', 880, 880, .05); },
      skip: t => { tn(t, .1, 'square', 440, 300, .05); tn(t + .1, .16, 'square', 300, 160, .05); },
      wild: t => chord(t, [392, 523, 659, 880, 1175], .28, 'triangle', .06, .05),
      lay: t => { nz(t, .25, 800, .7, .25, 3000); chord(t + .05, [392, 494, 587], .25, 'triangle', .06, .05); },
      hit: t => { nz(t, .06, 2600, .8, .38); tn(t + .03, .12, 'triangle', 660, 880, .06); },
      layoff: t => { nz(t, .06, 2600, .8, .36); tn(t + .02, .1, 'triangle', 520, 700, .06); },
      undercut: t => { chord(t, [330, 262, 196], .3, 'sawtooth', .05, .12); },
      bad: t => tn(t, .14, 'square', 170, 120, .04)
    };
    return { play(k) { if (!audio()) return; try { const f = sounds[k]; if (f) f(ac.currentTime + .005); } catch (e) {} }, unlock: audio, close() { try { if (ac) ac.close(); } catch (e) {} } };
  }

  const baseCss = (id) => {
    const p = '.gm-' + id;
    return `
${p}{gap:0;font-family:var(--sans);--gold:#f2c34b}
${p} [hidden]{display:none!important}
${p} .gx-wrap{position:relative;width:min(100%,980px,calc((100dvh - var(--goff,250px))*1.6));aspect-ratio:16/10;border-radius:18px;overflow:hidden;box-shadow:0 12px 34px rgba(8,30,20,.34);background:radial-gradient(ellipse at 50% 42%,var(--f1) 0%,var(--f2) 100%);container-type:size;color:#fff;touch-action:manipulation;margin:0 auto}
${p}.port .gx-wrap{width:min(100%,520px,calc((100dvh - var(--goff,250px))*.64));aspect-ratio:100/156}
${p} .gx-wrap::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 0 0 3px rgba(0,0,0,.18),inset 0 0 80px rgba(0,0,0,.28);z-index:3}
${p} .gx-stage{position:absolute;inset:0;overflow:hidden;z-index:1}
${p} .gx-wrap button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
${p} .gx-hud{position:absolute;left:8px;top:8px;display:flex;gap:6px;align-items:center;z-index:6}
${p} .gx-ib{width:38px;height:38px;border-radius:12px;border:2px solid rgba(255,255,255,.22);background:rgba(0,0,0,.32);color:#fff;display:grid;place-items:center;padding:0}
${p} .gx-ib:hover{background:rgba(0,0,0,.5)}
${p} .gx-ib svg{width:20px;height:20px}
${p} .gx-net{position:absolute;right:10px;top:10px;z-index:6;display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:12px;background:rgba(0,0,0,.34);font:800 11px var(--sans)}
${p} .gx-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
${p} .gx-net.bad i{background:#ff5b4b}
${p} .gx-toast{position:absolute;left:50%;top:14%;transform:translate(-50%,-8px);z-index:9;padding:9px 18px;border-radius:999px;background:rgba(10,14,22,.86);border:2px solid rgba(255,255,255,.2);font:800 14px var(--sans);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis}
${p} .gx-toast.show{opacity:1;transform:translate(-50%,0)}
${p} .gx-pane{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(3,14,10,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
${p} .gx-pane.solid{background:radial-gradient(ellipse at 50% 38%,var(--f1),var(--f2));-webkit-backdrop-filter:none;backdrop-filter:none}
${p} .gx-box{width:100%;max-width:420px;margin:auto;background:linear-gradient(#26345a,#141c33);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:gx-in .35s cubic-bezier(.2,1.4,.4,1)}
${p} .gx-box.wide{max-width:600px}
${p} .gx-box.clear{background:none;border:0;box-shadow:none;padding:6px}
@keyframes gx-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
${p} .gx-box h3{margin:2px 0 8px;font:900 22px var(--sans)}
${p} .gx-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
${p} .gx-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:var(--gold)!important;margin:0 0 2px!important}
${p} .gx-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px;transition:transform .12s,filter .12s}
${p} .gx-big:hover{filter:brightness(1.08)}
${p} .gx-big:active{transform:translateY(2px)}
${p} .gx-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
${p} .gx-big.g{background:linear-gradient(#45c463,#1f8a3a)}
${p} .gx-big.b{background:linear-gradient(#3d8cf0,#1659b5)}
${p} .gx-big.r{background:linear-gradient(#ff5d4d,#cf2117)}
${p} .gx-big.y{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
${p} .gx-big.n{background:linear-gradient(#5a6485,#394260)}
${p} .gx-sm{min-height:42px;padding:0 14px;border-radius:14px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
${p} .gx-sm:hover{background:rgba(255,255,255,.18)}
${p} .gx-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
${p} .gx-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
${p} .gx-opt>span{flex:0 0 36%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
${p} .gx-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
${p} .gx-seg{flex:1;display:flex;gap:5px}
${p} .gx-seg button{flex:1;min-height:40px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 4px}
${p} .gx-seg button.on{background:var(--gold);border-color:#fff;color:#1b1b1f}
${p} .gx-sec{margin:12px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:var(--gold)!important}
${p} .gx-rules{text-align:left}
${p} .gx-rules p,${p} .gx-rules li{font:700 13px/1.45 var(--sans)!important}
${p} .gx-rules ul{margin:4px 0;padding-left:18px}
${p} .gx-rules h4{margin:10px 0 2px;font:900 13px var(--sans);color:var(--gold);letter-spacing:.5px}
${p} .gx-rules kbd{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:5px;padding:0 5px;font:800 11px var(--sans)}
${p} .gx-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
${p} .gx-tbl td,${p} .gx-tbl th{padding:6px 5px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
${p} .gx-tbl th{font:900 10px var(--sans);letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.55)}
${p} .gx-tbl td:first-child,${p} .gx-tbl th:first-child{text-align:left}
${p} .gx-tbl tr.win td{color:var(--gold)}
${p} .gx-tbl tr.me td:first-child{text-decoration:underline dotted}
${p} .gx-av{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;border:2px solid #fff;font:900 14px var(--sans);color:#1b1b1f;flex:none;box-shadow:0 2px 6px rgba(0,0,0,.35)}
${p} .gx-title{margin:6px 0 10px}
${p} .gx-tag{font:800 13px var(--sans);color:rgba(255,255,255,.85);margin:4px 0 8px;text-shadow:0 1px 2px rgba(0,0,0,.5)}
@media (pointer:coarse){${p} .gx-sm{min-height:46px}${p} .gx-seg button{min-height:44px}}
`;
  };

  function Core(api, root, S) {
    const opt = Object.assign({}, S.defaults, api.load() || {});
    const save = () => api.save(opt);
    const snd = Sound(api);
    const M = { mode: 'title', role: 'local', seat: 0, n: 0, seats: [], s: null, tok: 0, players: [], size: 0, bots: false, hooked: false, bt: 0, meta: null, pausedAt: 0, view: null, ui: null, over: false };
    const wrap = el('div', 'gx-wrap'), stage = el('div', 'gx-stage'), hud = el('div', 'gx-hud'), netEl = el('div', 'gx-net'), toastEl = el('div', 'gx-toast'), pane = el('div', 'gx-pane');
    const ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    const ICON_HELP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.8M12 17h.01"/></svg>';
    hud.innerHTML = `<button class="gx-ib" data-u="menu" aria-label="Menu">${ICON_MENU}</button><button class="gx-ib" data-u="rules" aria-label="Rules">${ICON_HELP}</button>`;
    netEl.innerHTML = '<i></i><span>Online</span>'; netEl.hidden = true;
    pane.hidden = true;
    wrap.append(stage, hud, netEl, toastEl, pane); root.append(wrap);
    const C = { api, root, wrap, stage, opt, M, snd, pane, save, ui: null };
    root.classList.add('gx-root'); root._gx = C;
    let paneFn = null, paneKey = '', toastT = 0;
    const T = { rnd: Math.random };

    C.toast = (msg, ms) => { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms || 1800); };
    C.showPane = (key, html, fn, cls) => {
      paneKey = key; paneFn = fn || null;
      pane.className = 'gx-pane' + (cls ? ' ' + cls : ''); pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0;
    };
    C.hidePane = () => { pane.hidden = true; paneKey = ''; paneFn = null; pane.innerHTML = ''; };
    C.paneKey = () => paneKey;
    C.paneOpen = () => !pane.hidden;

    const nameOf = i => (M.meta && M.meta.names[i]) || 'Player';
    C.name = nameOf;
    C.isBot = i => !!(M.meta && M.meta.bot[i]);
    C.avatar = (i, sz) => `<span class="gx-av" style="background:${AV_COL[i % AV_COL.length]};${sz ? `width:${sz}px;height:${sz}px;font-size:${Math.round(sz * .48)}px` : ''}">${initials(nameOf(i))}</span>`;

    const optionRows = (online) => (S.options || []).filter(o => (!o.solo || !online) && (!o.show || o.show(opt, online))).map(o => `<div class="gx-opt"><span>${o.label}${o.sub ? `<small>${o.sub}</small>` : ''}</span>${SEG(o.k, o.opts, opt[o.k])}</div>`).join('');
    function showTitle() {
      M.mode = 'title';
      const drawn = () => {
        C.showPane('title', `<div class="gx-box wide" style="max-width:460px"><div class="gx-title">${S.logo}</div><p class="gx-tag">${S.tagline}</p>
<button class="gx-big g" data-a="solo">Play vs CPU<small>${S.soloSub || ''}</small></button>
<button class="gx-big b" data-a="online">Play online<small>${S.onlineSub || 'Friends with a party code'}</small></button>
<p class="gx-sec">Settings</p>${optionRows(false)}
<div class="gx-row"><button class="gx-sm" data-a="rules">How to play</button></div></div>`, a => {
          if (a === 'solo') startSolo();
          else if (a === 'online') startOnline();
          else if (a === 'rules') showRules('title');
        }, 'solid');
      };
      stageClear(); drawn(); C.redrawTitle = drawn;
      if (C.ui && C.ui.title) C.ui.title();
    }
    function stageClear() { stage.innerHTML = ''; netEl.hidden = true; }
    function showRules(back) {
      C.showPane('rules', `<div class="gx-box wide"><p class="gx-kick">How to play</p><h3>${S.title}</h3><div class="gx-rules">${S.rules}</div><div class="gx-row"><button class="gx-big g" data-a="back" style="max-width:240px">${back === 'title' ? 'Back' : 'Resume'}</button></div></div>`, a => {
        if (a === 'back') { if (back === 'title') showTitle(); else C.hidePane(); }
      }, back === 'title' ? 'solid' : '');
    }
    C.showRules = showRules;
    function gameMenu() {
      if (M.mode === 'title') return;
      const online = M.mode === 'online';
      C.showPane('menu', `<div class="gx-box"><p class="gx-kick">${online ? 'Online' : 'Menu'}</p><h3>${S.title}</h3>
<button class="gx-big g" data-a="resume">Resume</button>
${!online ? '<button class="gx-big y" data-a="again">New game</button>' : ''}
<div class="gx-row"><button class="gx-sm" data-a="rules">How to play</button><button class="gx-sm" data-a="leave">${online ? 'Leave party' : 'Main menu'}</button></div></div>`, a => {
        if (a === 'resume') C.hidePane();
        else if (a === 'again') { C.hidePane(); startSolo(); }
        else if (a === 'rules') showRules('game');
        else if (a === 'leave') { if (online) leaveOnline(); else showTitle(); }
      });
    }
    C.gameMenu = gameMenu;
    api.on(hud, 'click', e => {
      const b = e.target.closest('[data-u]'); if (!b) return;
      snd.unlock(); snd.play('click');
      if (b.dataset.u === 'menu') { if (M.mode === 'title') return; if (paneKey === 'menu') C.hidePane(); else gameMenu(); }
      else if (b.dataset.u === 'rules') { if (paneKey === 'rules') { if (M.mode === 'title') showTitle(); else C.hidePane(); } else showRules(M.mode === 'title' ? 'title' : 'game'); }
    });
    api.on(pane, 'click', e => {
      snd.unlock();
      const sg = e.target.closest('.gx-seg button');
      if (sg && paneKey === 'title') {
        const k = sg.parentNode.dataset.k, o = S.options.find(x => x.k === k), v = o.opts.find(x => String(x[0]) === sg.dataset.v)[0];
        opt[k] = v; save(); snd.play('click'); C.redrawTitle(); return;
      }
      const b = e.target.closest('[data-a]'); if (!b) return;
      snd.play('click');
      const a = b.dataset.a;
      if (a === 'again') { if (M.mode === 'online') { if (M.role === 'host') rematch(); } else { startSolo(); } return; }
      if (a === 'menu') { if (M.mode === 'online') leaveOnline(); else showTitle(); return; }
      if (a === 'lobby') { startOnline(); return; }
      if (a === 'leave') { leaveOnline(); return; }
      if (paneFn) paneFn(a, b);
    });

    C.endButtons = () => {
      if (M.mode === 'online') return M.role === 'host' ? '<button class="gx-big g" data-a="again">Rematch</button><div class="gx-row"><button class="gx-sm" data-a="lobby">Back to lobby</button><button class="gx-sm" data-a="leave">Leave</button></div>' : '<p>Waiting for the host to start a rematch…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div>';
      return '<button class="gx-big g" data-a="again">Play again</button><div class="gx-row"><button class="gx-sm" data-a="menu">Main menu</button></div>';
    };

    function metaNow() { return { n: M.seats.length, names: M.seats.map(s => s.name), bot: M.seats.map(s => s.kind === 'bot'), mode: M.mode, cfg: M.cfg }; }
    function beginUi(seat, meta) {
      M.meta = meta; M.seat = seat; M.view = null; M.over = false;
      C.hidePane(); stageClear(); netEl.hidden = M.mode !== 'online';
      if (C.ui && C.ui.destroy) C.ui.destroy();
      stage.innerHTML = '';
      C.ui = S.ui(C);
      C.ui.begin(meta, seat);
      fit();
    }
    function pushAll(evs, only) {
      if (!M.s) return;
      M.meta = metaNow();
      M.seats.forEach((st, i) => {
        if (only != null && only !== i) return;
        if (st.kind === 'bot') return;
        const v = S.view(M.s, i), fe = S.fev ? S.fev(evs || [], i, M.s) : (evs || []);
        v.names = M.meta.names; v.bot = M.meta.bot;
        if (i === M.seat) { M.view = v; C.ui.update(v, fe, {}); }
        else if (st.kind === 'net' && st.id) api.net.sendTo(st.id, { t: 'v', v, ev: fe, meta: { names: M.meta.names, bot: M.meta.bot } });
      });
      const w = S.score ? S.score(M.s, M.seat) : null;
      if (w != null) api.score(w);
    }
    C.push = pushAll;

    function doAct(seat, a) {
      if (!M.s || M.role === 'guest') return false;
      let r;
      try { r = S.act(M.s, seat, a); } catch (e) { console.error(e); r = null; }
      if (!r) { if (seat !== M.seat) pushAll([], seat); return false; }
      pushAll(r.ev || []);
      if (S.after) S.after(M.s, C);
      driveBots();
      return true;
    }
    C.act = a => {
      if (M.mode === 'title') return false;
      if (M.role === 'guest') { api.net.send({ t: 'a', a }); return true; }
      return doAct(M.seat, a);
    };
    function driveBots() {
      clearTimeout(M.bt);
      if (!M.s || M.role === 'guest') return;
      const w = S.who(M.s);
      const b = w.find(i => M.seats[i] && M.seats[i].kind === 'bot');
      if (b == null) return;
      const tok = M.tok, d = S.delay ? S.delay(M.s, b, M.seats[b]) : 800;
      const go = () => {
        if (tok !== M.tok || !M.s) return;
        if (api.paused || (C.ui && C.ui.busy && C.ui.busy())) { M.bt = setTimeout(go, 250); return; }
        const w2 = S.who(M.s);
        if (!w2.includes(b)) return driveBots();
        const a = S.bot(M.s, b, M.seats[b].lvl, M.seats[b]);
        if (!a || !doAct(b, a)) {
          const fb = S.fallback && S.fallback(M.s, b);
          if (!fb || !doAct(b, fb)) { M.bt = setTimeout(driveBots, 1000); }
        }
      };
      M.bt = setTimeout(go, d);
    }
    C.driveBots = driveBots; C.doAct = doAct; C.S = S;

    function makeSeats(mode) {
      const lvl = opt.diff || 'Normal';
      const pool = shuffle(BOT_NAMES.slice(), Math.random);
      let me = 'You';
      try { const pr = JSON.parse(localStorage.getItem('gameplay:profile')); if (pr && (pr.username || pr.displayName)) me = String(pr.username || pr.displayName).slice(0, 16); } catch (e) {}
      const seats = [{ name: me, kind: 'me' }];
      const k = mode === 'solo' ? S.opponents(opt) : 0;
      for (let i = 0; i < k; i++) seats.push({ name: pool.pop(), kind: 'bot', lvl });
      return seats;
    }
    function newMatch() {
      M.tok++; clearTimeout(M.bt); M.over = false;
      M.cfg = S.cfg(opt, M);
      const seed = M.cfg.seed != null ? M.cfg.seed : null;
      T.rnd = seed != null ? mulberry(seed) : Math.random;
      M.s = S.create(M.cfg, M.seats.length, T.rnd);
      M.meta = metaNow();
      beginUi(0, M.meta);
      if (M.mode === 'online') M.seats.forEach((st, i) => { if (st.kind === 'net' && st.id) api.net.sendTo(st.id, { t: 'setup', seat: i, meta: { n: M.seats.length, names: M.meta.names, bot: M.meta.bot, mode: 'online', cfg: M.cfg } }); });
      pushAll(M.s.ev0 || []);
      driveBots();
    }
    function startSolo() {
      leaveNet();
      M.mode = 'solo'; M.role = 'local'; M.seats = makeSeats('solo');
      newMatch();
    }
    function leaveNet() { if (M.mode === 'online' || api.online) { try { api.net.close(); } catch (e) {} } M.players = []; }
    function leaveOnline() { M.tok++; clearTimeout(M.bt); M.s = null; M.role = 'local'; leaveNet(); showTitle(); }
    function rematch() { if (M.role !== 'host') return; newMatch(); }
    C.rematch = rematch;
    C.over = () => { M.over = true; };

    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.s = null; clearTimeout(M.bt);
        snd.play('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the party.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        C.showPane('left', `<div class="gx-box"><p class="gx-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="gx-big g" data-a="lobby">Online lobby</button><button class="gx-big n" data-a="menu">Main menu</button></div>`, null, 'solid');
        M.mode = 'online';
      });
      api.interval(() => {
        if (M.mode !== 'online' || netEl.hidden) return;
        const on = api.net.connected || M.role === 'host';
        netEl.classList.toggle('bad', !on && M.role === 'guest');
        const hn = M.seats.filter(s => s.kind === 'net').length;
        netEl.lastChild.textContent = M.role === 'guest' && !api.net.connected ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    function sendSync(id) {
      if (M.role !== 'host' || !M.s) return;
      const i = M.seats.findIndex(s => s.id === id);
      if (i < 0) return;
      M.meta = metaNow();
      api.net.sendTo(id, { t: 'setup', seat: i, meta: { n: M.seats.length, names: M.meta.names, bot: M.meta.bot, mode: 'online', cfg: M.cfg } });
      const v = S.view(M.s, i); v.names = M.meta.names; v.bot = M.meta.bot;
      api.net.sendTo(id, { t: 'v', v, ev: [], meta: { names: M.meta.names, bot: M.meta.bot }, sync: 1 });
    }
    function seatToBot(id) {
      const i = M.seats.findIndex(s => s.id === id);
      if (i < 0) return;
      const st = M.seats[i];
      st.kind = 'bot'; st.lvl = opt.diff || 'Normal'; st.id = null; st.name = st.name + ' (CPU)';
      C.toast(st.name.replace(' (CPU)', '') + ' left. A CPU takes the seat.');
      pushAll([]); driveBots();
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.s) return;
        const i = M.seats.findIndex(s => s.id === from);
        if (i < 0 || i === M.seat || M.seats[i].kind !== 'net') return;
        if (d.t === 'a' && d.a && typeof d.a === 'object') doAct(i, d.a);
      } else {
        if (d.t === 'setup') {
          M.tok++; M.mode = 'online'; M.role = 'guest'; M.cfg = d.meta.cfg;
          beginUi(d.seat, d.meta);
        } else if (d.t === 'v' && M.role === 'guest' && C.ui) {
          M.meta = Object.assign({}, M.meta, d.meta); d.v.names = d.meta.names; d.v.bot = d.meta.bot;
          M.view = d.v; C.ui.update(d.v, d.ev || [], { sync: !!d.sync });
        }
      }
    }
    async function startOnline() {
      M.tok++; const tok = M.tok;
      clearTimeout(M.bt); M.s = null;
      hookNet();
      C.hidePane(); stageClear(); M.mode = 'online'; M.role = null; M.meta = null;
      if (C.ui && C.ui.destroy) { C.ui.destroy(); C.ui = null; }
      C.showPane('conn', '<div class="gx-box"><p class="gx-kick">Online</p><h3>Opening the party…</h3></div>', null, 'solid');
      const o = Object.assign({ title: S.title }, S.online);
      const r = await api.net.room(o);
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.mode = 'title'; M.role = 'local'; return showTitle(); }
      M.role = r.role; M.players = r.players.slice(0, 8); M.bots = !!r.bots; M.size = +r.size || r.players.length;
      if (r.role === 'host') {
        const lvl = opt.diff || 'Normal', pool = shuffle(BOT_NAMES.slice(), Math.random);
        const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
        M.seats = live.map((p, i) => ({ name: p.name, kind: i === 0 ? 'me' : 'net', id: i === 0 ? null : p.id }));
        const want = r.bots ? Math.max(M.seats.length, M.size) : M.seats.length;
        while (M.seats.length < Math.min(want, S.online.max)) M.seats.push({ name: pool.pop(), kind: 'bot', lvl });
        newMatch();
      } else {
        C.showPane('wait', '<div class="gx-box"><p class="gx-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal…</p><div class="gx-row"><button class="gx-sm" data-a="leave">Leave</button></div></div>', null, 'solid');
        netEl.hidden = false;
      }
    }
    C.startOnline = startOnline;

    let lastPort = null;
    function fit() {
      const w = root.clientWidth || wrap.clientWidth, port = w < 600;
      if (port !== lastPort) { lastPort = port; root.classList.toggle('port', port); }
      const r = wrap.getBoundingClientRect();
      if (C.ui && C.ui.resize && r.width) C.ui.resize(r.width, r.height, port);
    }
    C.fit = fit;
    if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => fit()); ro.observe(wrap); ro.observe(root); api.timeout(() => {}, 0); }
    api.on(window, 'resize', fit);
    C.port = () => !!lastPort;

    C.start = () => {
      fit();
      api.interval(() => {
        if (!M.s || M.role === 'guest' || !S.tick) return;
        if (api.paused) { if (!M.pausedAt) M.pausedAt = Date.now(); return; }
        if (M.pausedAt) { if (S.shift) S.shift(M.s, Date.now() - M.pausedAt); M.pausedAt = 0; }
        let r = null;
        try { r = S.tick(M.s, Date.now()); } catch (e) { console.error(e); }
        if (r) { pushAll(r.ev || []); driveBots(); }
      }, 300);
      if (api.net.invite) startOnline(); else showTitle();
    };
    C.destroy = () => { M.tok++; clearTimeout(M.bt); snd.close(); if (C.ui && C.ui.destroy) C.ui.destroy(); };
    return C;
  }

  const Flip = (stage) => {
    let prev = new Map();
    return {
      snap() { prev = new Map(); stage.querySelectorAll('[data-k]').forEach(e => { const r = e.getBoundingClientRect(); prev.set(e.dataset.k, r); }); },
      rect(k) { return prev.get(k); },
      play(hints, dur, delays) {
        if (reduced()) return;
        stage.querySelectorAll('[data-k]').forEach(e => {
          const k = e.dataset.k, r = (hints && hints[k]) || prev.get(k);
          if (!r || !e.animate) return;
          const n = e.getBoundingClientRect();
          if (!n.width) return;
          const dx = r.left - n.left, dy = r.top - n.top, sx = r.width / n.width || 1, sy = r.height / n.height || 1;
          if (Math.abs(dx) + Math.abs(dy) < 1.5 && Math.abs(sx - 1) < .02) return;
          e.style.zIndex = 40;
          const a = e.animate([{ transformOrigin: '0 0', transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: dur || 380, easing: 'cubic-bezier(.2,.8,.25,1)', delay: (delays && delays[k]) || 0, fill: 'backwards' });
          const done = () => { e.style.zIndex = ''; };
          a.onfinish = done; a.oncancel = done;
        });
      }
    };
  };

  function syncKeyed(parent, items) {
    const have = new Map();
    Array.from(parent.children).forEach(c => { if (c.dataset && c.dataset.k != null) have.set(c.dataset.k, c); });
    items.forEach((it, i) => {
      let e = have.get(it.k);
      if (e) have.delete(it.k);
      else { e = el('div', it.cls || ''); e.dataset.k = it.k; if (it.html != null) e.innerHTML = it.html; if (it.init) it.init(e); e._fresh = true; }
      if (it.cls != null && e.className !== it.cls) e.className = it.cls;
      if (parent.children[i] !== e) parent.insertBefore(e, parent.children[i] || null);
      if (it.upd) it.upd(e);
    });
    have.forEach(e => e.remove());
  }

  const GIN_RN = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const GIN_SU = ['S', 'H', 'D', 'C'];
  const gRk = id => id % 13, gSu = id => (id / 13) | 0;
  const gPts = id => Math.min(10, (id % 13) + 1);
  const gSum = a => { let t = 0; for (const x of a) t += gPts(x); return t; };

  function ginCands(ids) {
    const res = [], byR = new Map(), bySR = new Map();
    ids.forEach((id, i) => {
      const r = gRk(id);
      if (!byR.has(r)) byR.set(r, []);
      byR.get(r).push(i);
      bySR.set(gSu(id) * 13 + r, i);
    });
    const add = list => { let m = 0, v = 0; for (const i of list) { m |= 1 << i; v += gPts(ids[i]); } res.push({ m, v, n: list.length, ids: list.map(i => ids[i]) }); };
    byR.forEach(l => {
      if (l.length === 3) add(l);
      else if (l.length === 4) { add(l); for (let k = 0; k < 4; k++) add(l.filter((x, j) => j !== k)); }
    });
    for (let s = 0; s < 4; s++) {
      for (let a = 0; a < 11; a++) {
        const run = [];
        for (let r = a; r < 13; r++) {
          const i = bySR.get(s * 13 + r);
          if (i === undefined) break;
          run.push(i);
          if (run.length >= 3) add(run.slice());
        }
      }
    }
    return res;
  }
  const ginMemo = new Map();
  function ginBest(ids) {
    const key = ids.slice().sort((a, b) => a - b).join(',');
    let o = ginMemo.get(key);
    if (o) return o;
    const c = ginCands(ids);
    let bv = -1, bn = -1, bsel = [];
    const sel = [];
    const rec = (i, used, val, cnt) => {
      if (val > bv || (val === bv && cnt > bn)) { bv = val; bn = cnt; bsel = sel.slice(); }
      for (let j = i; j < c.length; j++) if (!(c[j].m & used)) { sel.push(j); rec(j + 1, used | c[j].m, val + c[j].v, cnt + c[j].n); sel.pop(); }
    };
    rec(0, 0, 0, 0);
    const melds = bsel.map(j => c[j].ids), inM = new Set(); melds.forEach(m => m.forEach(x => inM.add(x)));
    const dead = ids.filter(x => !inM.has(x));
    o = { melds, dead, dw: gSum(dead) };
    if (ginMemo.size > 6000) ginMemo.clear();
    ginMemo.set(key, o);
    return o;
  }
  const ginIsSet = m => gRk(m[0]) === gRk(m[1]);
  function ginCanLay(melds, id) {
    const out = [], r = gRk(id), s = gSu(id);
    melds.forEach((m, i) => {
      if (ginIsSet(m)) { if (gRk(m[0]) === r && m.length < 4 && !m.some(x => gSu(x) === s)) out.push(i); }
      else if (gSu(m[0]) === s) {
        let lo = 99, hi = -1; for (const x of m) { lo = Math.min(lo, gRk(x)); hi = Math.max(hi, gRk(x)); }
        if (r === lo - 1 || r === hi + 1) out.push(i);
      }
    });
    return out;
  }
  function ginLayAdd(m, id) { m.push(id); if (!ginIsSet(m)) m.sort((a, b) => gRk(a) - gRk(b)); }
  function ginBestLay(melds, cards) {
    let best = { v: 0, seq: [] };
    const rec = (ms, left, v, seq) => {
      if (v > best.v) best = { v, seq: seq.slice() };
      for (let i = 0; i < left.length; i++) {
        const id = left[i];
        for (const mi of ginCanLay(ms, id)) {
          const ms2 = ms.map(x => x.slice()); ginLayAdd(ms2[mi], id);
          seq.push([id, mi]); rec(ms2, left.filter((x, j) => j !== i), v + gPts(id), seq); seq.pop();
        }
      }
    };
    rec(melds.map(x => x.slice()), cards, 0, []);
    return best;
  }

  const GIN_DEF = { target: 100, gin: 25, under: 25, big: 31, knockMax: 10, bigOn: true };

  function ginDeal(s) {
    const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), s.R);
    s.hands = [[], []];
    const nd = 1 - s.dealer;
    for (let i = 0; i < 10; i++) { s.hands[nd].push(deck.pop()); s.hands[s.dealer].push(deck.pop()); }
    s.disc = [deck.pop()]; s.stock = deck; s.kdisc = null;
    s.phase = 'up1'; s.turn = nd; s.drew = null; s.kn = null; s.res = null; s.stockOnly = false; s.handNo++;
    s.picks = [[], []]; s.turns = [0, 0]; s.ready = [true, true];
    return [{ k: 'deal' }];
  }
  function ginCreate(cfg, n, R) {
    const s = { cfg: Object.assign({}, GIN_DEF, cfg), R, scores: [0, 0], boxes: [0, 0], dealer: R() < .5 ? 0 : 1, handNo: 0, phase: 'up1', final: null, seatBot: [false, false] };
    s.ev0 = ginDeal(s);
    return s;
  }
  function ginEndHand(s, res, ev) {
    s.res = res; s.phase = 'between'; s.ready = [false, false];
    s.hands.forEach((h, i) => { res.hands = res.hands || []; res.hands[i] = h.slice(); });
    if (res.w >= 0) { s.scores[res.w] += res.pts; s.boxes[res.w]++; }
    res.scores = s.scores.slice();
    ev.push({ k: 'result', kind: res.kind, w: res.w });
    let champ = -1;
    if (res.w >= 0 && s.scores[res.w] >= s.cfg.target) champ = res.w;
    if (champ >= 0) {
      const lo = 1 - champ, tot = s.scores.slice();
      tot[champ] += 100 + 25 * s.boxes[champ]; tot[lo] += 25 * s.boxes[lo];
      const shut = s.boxes[lo] === 0;
      if (shut) tot[champ] *= 2;
      s.final = { w: champ, game: 100, box: [25 * s.boxes[0], 25 * s.boxes[1]], shut, tot, hands: s.boxes.slice() };
      res.over = true; s.phase = 'over';
    }
    s.dealer = res.kind === 'draw' ? s.dealer : 1 - s.dealer;
  }
  function ginShow(s, ev, kind, k, d, knDisc) {
    const o = 1 - k;
    let pts = 0, w = k;
    if (kind === 'gin') pts = s.cfg.gin + ginBest(s.hands[o]).dw;
    else if (kind === 'big') pts = s.cfg.big + ginBest(s.hands[o]).dw;
    else {
      const dwK = s.kn.dw, dwO = ginBest(s.hands[o]).dw;
      if (dwK < dwO) pts = dwO - dwK; else { w = o; kind = 'undercut'; pts = dwK - dwO + s.cfg.under; }
    }
    const res = { kind, w, pts, k, dwK: s.kn ? s.kn.dw : 0, dwO: ginBest(s.hands[o]).dw, melds: [[], []] };
    const bk = s.kn ? null : ginBest(s.hands[k]), bo = ginBest(s.hands[o]);
    res.dead = [[], []];
    if (s.kn) { res.melds[k] = s.kn.melds.map(m => m.slice()); res.dead[k] = s.kn.dead.slice(); res.lay = s.kn.lay.slice(); }
    else { res.melds[k] = bk.melds; res.dead[k] = bk.dead; res.lay = []; }
    res.melds[o] = bo.melds; res.dead[o] = bo.dead;
    if (knDisc != null) res.kdisc = knDisc;
    ginEndHand(s, res, ev);
  }
  function ginAct(s, p, a) {
    const ev = [];
    if (!a || typeof a.t !== 'string') return null;
    const ph = s.phase, h = s.hands[p];
    if (ph === 'between') {
      if (a.t !== 'ready' || s.ready[p]) return null;
      s.ready[p] = true;
      if (s.ready[0] && s.ready[1]) {
        if (s.final) { s.phase = 'over'; ev.push({ k: 'over' }); }
        else ev.push(...ginDeal(s));
      }
      return { ev };
    }
    if (ph === 'over') return null;
    if (s.turn !== p) return null;
    if (ph === 'up1' || ph === 'up2') {
      if (a.t === 'take') {
        const id = s.disc.pop(); h.push(id); s.drew = { id, from: 'disc' }; s.picks[p].push(id); s.stockOnly = false;
        ev.push({ k: 'draw', p, from: 'disc', id }); s.phase = 'discard'; return { ev };
      }
      if (a.t === 'pass') {
        ev.push({ k: 'pass', p });
        if (ph === 'up1') { s.phase = 'up2'; s.turn = 1 - p; }
        else { s.phase = 'draw'; s.turn = 1 - p; s.stockOnly = true; }
        return { ev };
      }
      return null;
    }
    if (ph === 'draw') {
      if (a.t === 'stock') {
        const id = s.stock.pop(); h.push(id); s.drew = { id, from: 'stock' }; s.stockOnly = false; s.phase = 'discard';
        ev.push({ k: 'draw', p, from: 'stock', id }); return { ev };
      }
      if (a.t === 'take' && !s.stockOnly) {
        const id = s.disc.pop(); h.push(id); s.drew = { id, from: 'disc' }; s.picks[p].push(id); s.phase = 'discard';
        ev.push({ k: 'draw', p, from: 'disc', id }); return { ev };
      }
      return null;
    }
    if (ph === 'discard') {
      if (a.t === 'big') {
        if (!s.cfg.bigOn || h.length !== 11 || ginBest(h).dw !== 0) return null;
        ev.push({ k: 'knock', p, kind: 'big' });
        ginShow(s, ev, 'big', p, 0, null); return { ev };
      }
      if ((a.t === 'disc' || a.t === 'knock') && h.includes(a.c)) {
        if (s.drew && s.drew.from === 'disc' && s.drew.id === a.c) return null;
        const rest = h.filter(x => x !== a.c), b = ginBest(rest);
        if (a.t === 'disc') {
          h.splice(h.indexOf(a.c), 1); s.disc.push(a.c); s.turns[p]++; s.drew = null;
          ev.push({ k: 'disc', p, id: a.c });
          if (s.stock.length <= 2) { ginEndHand(s, { kind: 'draw', w: -1, pts: 0, melds: [[], []] }, ev); return { ev }; }
          s.phase = 'draw'; s.turn = 1 - p; return { ev };
        }
        if (b.dw > s.cfg.knockMax) return null;
        s.hands[p] = rest; s.kdisc = a.c; s.drew = null;
        const gin = b.dw === 0;
        s.kn = { p, melds: b.melds.map(m => m.slice()), dead: b.dead.slice(), dw: b.dw, gin, lay: [] };
        ev.push({ k: 'knock', p, kind: gin ? 'gin' : 'knock', id: a.c });
        if (gin) { ginShow(s, ev, 'gin', p, 0, a.c); return { ev }; }
        s.phase = 'layoff'; s.turn = 1 - p; return { ev };
      }
      return null;
    }
    if (ph === 'layoff') {
      if (a.t === 'lay') {
        if (!h.includes(a.c)) return null;
        const opts = ginCanLay(s.kn.melds, a.c);
        const m = opts.includes(a.m) ? a.m : opts[0];
        if (m == null) return null;
        ginLayAdd(s.kn.melds[m], a.c); h.splice(h.indexOf(a.c), 1); s.kn.lay.push([a.c, m]);
        ev.push({ k: 'lay', p, id: a.c, m }); return { ev };
      }
      if (a.t === 'done') { ginShow(s, ev, 'knock', s.kn.p, 0, s.kdisc); return { ev }; }
      return null;
    }
    return null;
  }
  function ginView(s, p) {
    const o = 1 - p, rev = s.phase === 'between' || s.phase === 'over';
    const v = {
      seat: p, phase: s.phase, turn: s.turn, dealer: s.dealer, handNo: s.handNo, target: s.cfg.target, scores: s.scores.slice(), boxes: s.boxes.slice(),
      hand: s.hands[p].slice(), oppN: s.hands[o].length, stockN: s.stock.length, disc: s.disc.slice(), drew: s.turn === p && s.drew ? s.drew : null,
      stockOnly: !!s.stockOnly, ready: s.ready.slice(), final: s.final, cfg: { gin: s.cfg.gin, under: s.cfg.under, big: s.cfg.big, bigOn: s.cfg.bigOn, knockMax: s.cfg.knockMax }
    };
    if (s.kn) v.kn = { p: s.kn.p, melds: s.kn.melds.map(m => m.slice()), dw: s.kn.dw, gin: s.kn.gin, lay: s.kn.lay.slice() };
    if (rev && s.res) { v.res = s.res; v.oppHand = s.hands[o].slice(); }
    return v;
  }
  function ginFev(evs, p) { return evs.map(e => (e.k === 'draw' && e.from === 'stock' && e.p !== p) || (e.k === 'knock' && e.p !== p) ? Object.assign({}, e, { id: -1 }) : e); }

  const ginUnseen = (s, p) => {
    const seen = new Set(s.hands[p]); s.disc.forEach(x => seen.add(x));
    if (s.kn) { s.kn.melds.forEach(m => m.forEach(x => seen.add(x))); }
    return seen;
  };
  function ginPotential(s, p, rest, b) {
    const seen = ginUnseen(s, p), dead = b.dead;
    const live = id => (seen.has(id) ? 0 : 1);
    let pot = 0;
    for (let i = 0; i < dead.length; i++) for (let j = i + 1; j < dead.length; j++) {
      const a = dead[i], c = dead[j];
      if (gRk(a) === gRk(c)) {
        for (let su = 0; su < 4; su++) { const id = su * 13 + gRk(a); if (id !== a && id !== c) pot += live(id) * 1.2; }
      } else if (gSu(a) === gSu(c)) {
        const lo = Math.min(gRk(a), gRk(c)), hi = Math.max(gRk(a), gRk(c)), su = gSu(a);
        if (hi - lo === 1) { if (lo > 0) pot += live(su * 13 + lo - 1); if (hi < 12) pot += live(su * 13 + hi + 1); }
        else if (hi - lo === 2) pot += live(su * 13 + lo + 1) * .9;
      }
    }
    return pot;
  }
  function ginDanger(s, p, id) {
    const o = 1 - p, pk = s.picks[o];
    let d = 0;
    for (const x of pk) {
      if (gRk(x) === gRk(id)) d += 3;
      if (gSu(x) === gSu(id) && Math.abs(gRk(x) - gRk(id)) <= 2) d += 3 - Math.abs(gRk(x) - gRk(id)) * .8;
    }
    return d;
  }
  function ginBestDiscard(s, p, lvl) {
    const h = s.hands[p], forbid = s.drew && s.drew.from === 'disc' ? s.drew.id : -1;
    let best = null;
    for (const d of h) {
      if (d === forbid) continue;
      const rest = h.filter(x => x !== d), b = ginBest(rest);
      let sc = -b.dw * 10 + gPts(d) * (lvl === 'Easy' ? 0 : .2);
      if (lvl !== 'Easy') sc += ginPotential(s, p, rest, b) * (lvl === 'Hard' ? 1.7 : 1.2);
      if (lvl === 'Hard') sc -= ginDanger(s, p, d) * 1.3;
      if (lvl === 'Normal' || lvl === 'Hard') {
        const sib = b.melds.some(m => m.includes(d));
        if (sib) sc -= 40;
      }
      if (!best || sc > best.sc) best = { d, sc, dw: b.dw, b };
    }
    return best;
  }
  function ginWantsDisc(s, p, lvl) {
    const h = s.hands[p], c = s.disc[s.disc.length - 1], cur = ginBest(h).dw;
    const h11 = h.concat([c]);
    let bestAfter = 999, joins = false;
    for (const d of h11) {
      if (d === c) continue;
      const rest = h11.filter(x => x !== d), b = ginBest(rest);
      if (b.dw < bestAfter) bestAfter = b.dw;
      if (b.dw <= cur && b.melds.some(m => m.includes(c))) joins = true;
    }
    if (lvl === 'Easy') return joins && Math.random() < .6;
    if (bestAfter === 0) return true;
    if (joins) return true;
    if (lvl === 'Hard' && bestAfter <= cur - gPts(c) && cur <= 18) return true;
    return false;
  }
  function ginBotKnock(s, p, lvl, bd) {
    const h = s.hands[p];
    let kb = null;
    for (const d of h) {
      if (s.drew && s.drew.from === 'disc' && s.drew.id === d) continue;
      const b = ginBest(h.filter(x => x !== d));
      if (b.dw <= s.cfg.knockMax && (!kb || b.dw < kb.dw || (b.dw === kb.dw && gPts(d) > gPts(kb.d)))) kb = { d, dw: b.dw };
    }
    if (!kb) return null;
    if (kb.dw === 0) return { t: 'knock', c: kb.d };
    if (lvl === 'Easy') return Math.random() < .75 ? { t: 'knock', c: kb.d } : null;
    const stockN = s.stock.length, picks = s.picks[1 - p].length, tur = s.turns[1 - p];
    if (lvl === 'Normal') return kb.dw <= 6 || (kb.dw <= 10 && stockN <= 18) ? { t: 'knock', c: kb.d } : null;
    const est = Math.max(4, 48 - 3.3 * tur - 4 * picks);
    if (kb.dw <= 2 || (kb.dw + 2 < est && kb.dw <= 10) || stockN <= 6) return { t: 'knock', c: kb.d };
    if (kb.dw <= 5 && bd && bd.dw <= 2) return null;
    return null;
  }
  function ginBot(s, p, lvl) {
    const h = s.hands[p], ph = s.phase;
    if (ph === 'between') return { t: 'ready' };
    if (ph === 'up1' || ph === 'up2') return ginWantsDisc(s, p, lvl) ? { t: 'take' } : { t: 'pass' };
    if (ph === 'draw') return !s.stockOnly && ginWantsDisc(s, p, lvl) ? { t: 'take' } : { t: 'stock' };
    if (ph === 'discard') {
      if (s.cfg.bigOn && h.length === 11 && ginBest(h).dw === 0) return { t: 'big' };
      const bd = ginBestDiscard(s, p, lvl);
      const k = ginBotKnock(s, p, lvl, bd);
      if (k) return k;
      if (lvl === 'Easy' && Math.random() < .25) {
        const forbid = s.drew && s.drew.from === 'disc' ? s.drew.id : -1;
        const c = h.filter(x => x !== forbid); return { t: 'disc', c: c[Math.floor(Math.random() * c.length)] };
      }
      return { t: 'disc', c: bd.d };
    }
    if (ph === 'layoff') {
      const dead = ginBest(h).dead;
      let pick = null;
      for (const id of dead.slice().sort((a, b) => gPts(b) - gPts(a))) {
        const o = ginCanLay(s.kn.melds, id);
        if (o.length) { pick = { t: 'lay', c: id, m: o[0] }; break; }
      }
      return pick || { t: 'done' };
    }
    return null;
  }
  const ginWho = s => s.phase === 'between' ? [0, 1].filter(i => !s.ready[i]) : s.phase === 'over' ? [] : [s.turn];
  const GIN_ENGINE = { create: ginCreate, act: ginAct, view: ginView, fev: ginFev, who: ginWho, bot: ginBot };

  const SUIT_PATH = [
    'M12 1.5C12 1.5 3 8.6 3 14.4a4.6 4.6 0 0 0 8 3.1c-.1 1.9-.9 3.3-2.5 4.5h7c-1.6-1.2-2.4-2.6-2.5-4.5a4.6 4.6 0 0 0 8-3.1C21 8.6 12 1.5 12 1.5z',
    'M12 22C12 22 2.4 15.4 2.4 8.8A5.1 5.1 0 0 1 12 6.3a5.1 5.1 0 0 1 9.6 2.5C21.6 15.4 12 22 12 22z',
    'M12 1.2 20.6 12 12 22.8 3.4 12z',
    'M12 1.6a4.7 4.7 0 0 0-4.3 6.6A4.9 4.9 0 1 0 10.6 16.6c-.1 2-.9 3.3-2.4 4.4h7.6c-1.5-1.1-2.3-2.4-2.4-4.4A4.9 4.9 0 1 0 16.3 8.2 4.7 4.7 0 0 0 12 1.6z'
  ];
  const cardUri = svg => "url('data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, '%27') + "')";
  const pipAt = (s, x, y, sz, col, rot) => `<path d="${SUIT_PATH[s]}" fill="${col}" transform="translate(${x - sz / 2} ${y - sz / 2}) scale(${sz / 24})${rot ? ` rotate(180 12 12)` : ''}"/>`;
  const PIPS = {
    1: [[50, 70]], 2: [[50, 30], [50, 110]], 3: [[50, 30], [50, 70], [50, 110]],
    4: [[30, 30], [70, 30], [30, 110], [70, 110]], 5: [[30, 30], [70, 30], [50, 70], [30, 110], [70, 110]],
    6: [[30, 30], [70, 30], [30, 70], [70, 70], [30, 110], [70, 110]], 7: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70], [30, 110], [70, 110]],
    8: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70], [50, 90], [30, 110], [70, 110]],
    9: [[30, 30], [70, 30], [30, 57], [70, 57], [50, 70], [30, 83], [70, 83], [30, 110], [70, 110]],
    10: [[30, 30], [70, 30], [50, 44], [30, 57], [70, 57], [30, 83], [70, 83], [50, 96], [30, 110], [70, 110]]
  };
  function courtArt(r, s, col) {
    const robe = col === '#d1202c' ? '#c9262f' : '#26324f', trim = '#e2b43a', sk = '#f4d6ae', hair = r === 11 ? '#7a4a1e' : '#3a2a1a';
    let half = `<path d="M24 70 Q27 50 50 48 Q73 50 76 70 Z" fill="${robe}" stroke="#222" stroke-width="1"/><path d="M36 52 L50 66 L64 52" fill="none" stroke="${trim}" stroke-width="2"/><circle cx="50" cy="40" r="9" fill="${sk}" stroke="#222" stroke-width="1"/>`;
    if (r === 12) half += `<path d="M39 38 Q38 28 50 27 Q62 28 61 38 Q58 31 50 32 Q42 31 39 38Z" fill="${hair}"/><path d="M39 38 Q36 50 40 56 L43 46Z M61 38 Q64 50 60 56 L57 46Z" fill="${hair}"/><path d="M41 28 L43 21 L47 26 L50 19 L53 26 L57 21 L59 28Z" fill="${trim}" stroke="#222" stroke-width=".8"/>`;
    else if (r === 13 - 1 + 0 && false) half += '';
    else if (r === 11) half += `<path d="M39 36 Q40 26 50 26 Q61 26 61 36Z" fill="${robe}" stroke="#222" stroke-width=".8"/><path d="M40 34 Q50 30 62 34 L64 30 Q50 27 38 31Z" fill="${trim}"/><path d="M58 28 Q70 16 74 24 Q66 22 60 31Z" fill="#fff" stroke="#999" stroke-width=".6"/>`;
    else half += `<path d="M41 44 Q50 62 59 44 Q58 52 50 55 Q42 52 41 44Z" fill="#cfcfcf" stroke="#777" stroke-width=".6"/><path d="M40 33 L42 22 L46 28 L50 20 L54 28 L58 22 L60 33Z" fill="${trim}" stroke="#222" stroke-width=".8"/><circle cx="50" cy="26" r="1.6" fill="#d1202c"/>`;
    half += `<circle cx="46.5" cy="40" r="1" fill="#222"/><circle cx="53.5" cy="40" r="1" fill="#222"/>`;
    const sc = `<g transform="rotate(180 50 70)">${half}</g>`;
    return `<rect x="22" y="22" width="56" height="96" rx="3" fill="#fbf3dc" stroke="${col}" stroke-width="1.4"/><path d="M22 70 L78 70" stroke="${col}" stroke-width=".8" opacity=".5"/><g>${half}</g>${sc}${pipAt(s, 30, 30 + 3, 11, col)}${pipAt(s, 70, 110 - 3, 11, col, 1)}`;
  }
  const faceCache = new Map();
  function cardFace(id) {
    let u = faceCache.get(id);
    if (u) return u;
    const r = id % 13, s = (id / 13) | 0, col = s === 1 || s === 2 ? '#d1202c' : '#17171c', rn = GIN_RN[r];
    let g = '';
    if (r >= 10) g = courtArt(r, s, col);
    else PIPS[r + 1].forEach(([x, y]) => { g += pipAt(s, x, y, r === 0 ? 40 : 17, col, y > 70); });
    const idx = `<text x="14" y="${rn === '10' ? 22 : 23}" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-weight="700" font-size="${rn === '10' ? 19 : 22}" fill="${col}" ${rn === '10' ? 'letter-spacing="-1.5"' : ''}>${rn}</text>${pipAt(s, 14, 36, 13, col)}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><rect x=".6" y=".6" width="98.8" height="138.8" rx="8" fill="#fff" stroke="#b9b9c2" stroke-width="1.2"/>${g}${idx}<g transform="rotate(180 50 70)">${idx}</g></svg>`;
    u = cardUri(svg); faceCache.set(id, u); return u;
  }
  let backUri = null;
  function cardBack() {
    if (backUri) return backUri;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><defs><pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#1c3f93"/><path d="M0 5h10M5 0v10" stroke="#3f68c4" stroke-width="1.2"/><circle cx="5" cy="5" r="1.6" fill="#8fb0ee"/></pattern></defs><rect x=".6" y=".6" width="98.8" height="138.8" rx="8" fill="#fff" stroke="#b9b9c2" stroke-width="1.2"/><rect x="6" y="6" width="88" height="128" rx="4" fill="url(#p)" stroke="#102a69" stroke-width="1.5"/><rect x="14" y="14" width="72" height="112" rx="3" fill="none" stroke="#e9eefc" stroke-width="1.6"/><ellipse cx="50" cy="70" rx="19" ry="26" fill="#12327a" stroke="#e9eefc" stroke-width="1.6"/><path d="M50 52 58 70 50 88 42 70Z" fill="#e9eefc"/></svg>`;
    backUri = cardUri(svg); return backUri;
  }

  const gnCss = (id) => {
    const p = '.gm-' + id;
    return `
${p}{--f1:#2d8a55;--f2:#0d3d24}
${p} .gn-tbl{position:absolute;inset:0;pointer-events:none}
${p} .gn-tbl::before{content:"";position:absolute;left:8%;right:8%;top:10%;bottom:6%;border-radius:50%;border:2px solid rgba(255,255,255,.08);box-shadow:inset 0 0 60px rgba(0,0,0,.18)}
${p} .gn-tbl b{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font:900 calc(var(--cw)*.62) var(--sans);letter-spacing:.12em;color:rgba(255,255,255,.045);text-transform:uppercase;white-space:nowrap}
${p} .gn-cards{position:absolute;inset:0}
${p} .gcw{position:absolute;pointer-events:auto;transition:filter .2s}
${p} .gc{position:absolute;inset:0;border-radius:calc(var(--cw)*.09);background-size:100% 100%;background-repeat:no-repeat;box-shadow:0 1px 2px rgba(0,0,0,.45),0 3px 9px rgba(0,0,0,.28);transition:transform .2s cubic-bezier(.2,.8,.3,1),box-shadow .2s,filter .2s}
${p} .gcw.hit{cursor:pointer}
${p} .gcw.hit:hover .gc{transform:translateY(calc(var(--cw)*-.1)) rotate(var(--r,0deg))}
${p} .gcw.sel .gc{transform:translateY(calc(var(--cw)*-.26)) rotate(var(--r,0deg));box-shadow:0 0 0 3px var(--gold),0 8px 18px rgba(0,0,0,.4)}
${p} .gcw.dim .gc{filter:brightness(.62) saturate(.8)}
${p} .gcw.lay .gc{box-shadow:0 0 0 3px #5be2ff,0 3px 9px rgba(0,0,0,.28)}
${p} .gcw.new .gc{animation:gn-pop .45s cubic-bezier(.2,1.3,.4,1)}
@keyframes gn-pop{from{transform:scale(.7) rotateY(90deg);opacity:0}to{transform:none;opacity:1}}
${p} .gcw.drag{z-index:60!important}
${p} .gcw.drag .gc{transition:none;box-shadow:0 14px 26px rgba(0,0,0,.5)}
${p} .gn-score{position:absolute;left:50%;top:8px;transform:translateX(-50%);display:flex;align-items:center;gap:calc(var(--cw)*.12);padding:5px 12px;border-radius:999px;background:rgba(0,0,0,.34);border:2px solid rgba(255,255,255,.14);font:900 calc(var(--cw)*.17) var(--sans);white-space:nowrap;z-index:5}
${p} .gn-score .s{display:flex;align-items:center;gap:6px;padding:2px 8px 2px 2px;border-radius:999px;border:2px solid transparent;transition:border-color .2s,background .2s}
${p} .gn-score .s.on{border-color:var(--gold);background:rgba(242,195,75,.14)}
${p} .gn-score .s .gx-av{width:calc(var(--cw)*.36);height:calc(var(--cw)*.36);font-size:calc(var(--cw)*.17);position:relative}
${p} .gn-score .s .dl{position:absolute;right:-5px;bottom:-5px;width:calc(var(--cw)*.2);height:calc(var(--cw)*.2);border-radius:50%;background:#fff;color:#111;font:900 calc(var(--cw)*.12) var(--sans);display:grid;place-items:center;border:1px solid #111}
${p} .gn-score .m{font:800 calc(var(--cw)*.12) var(--sans);color:rgba(255,255,255,.7);text-align:center;line-height:1.15}
${p} .gn-score .m b{display:block;color:#fff;font-size:calc(var(--cw)*.14)}
${p} .gn-status{position:absolute;left:8%;right:8%;text-align:center;font:900 calc(var(--cw)*.2) var(--sans);text-shadow:0 2px 4px rgba(0,0,0,.55);pointer-events:none;z-index:4;min-height:1.3em}
${p} .gn-status small{display:block;font:700 calc(var(--cw)*.14) var(--sans);opacity:.8}
${p} .gn-lbl{position:absolute;text-align:center;font:900 calc(var(--cw)*.13) var(--sans);letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.62);pointer-events:none;z-index:2;white-space:nowrap}
${p} .gn-act{position:absolute;left:0;right:0;display:flex;justify-content:center;gap:calc(var(--cw)*.12);z-index:7;pointer-events:none}
${p} .gn-act button{pointer-events:auto;min-height:calc(var(--cw)*.6);padding:0 calc(var(--cw)*.3);border-radius:calc(var(--cw)*.3);border:3px solid #fff;font:900 calc(var(--cw)*.2) var(--sans);color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.35),0 8px 14px rgba(0,0,0,.3);text-shadow:0 2px 0 rgba(0,0,0,.25)}
${p} .gn-act button:active{transform:translateY(2px)}
${p} .gn-act .k{background:linear-gradient(#ff5d4d,#c71b10)}
${p} .gn-act .g{background:linear-gradient(#45c463,#1f8a3a)}
${p} .gn-act .n{background:linear-gradient(#5a6485,#394260)}
${p} .gn-act .y{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
${p} .gn-act .pulse{animation:gn-pulse .7s infinite alternate}
@keyframes gn-pulse{from{transform:scale(1)}to{transform:scale(1.07)}}
${p} .gn-dw{position:absolute;left:10px;z-index:5;padding:4px 10px;border-radius:12px;background:rgba(0,0,0,.4);font:800 calc(var(--cw)*.14) var(--sans);pointer-events:none}
${p} .gn-dw b{color:var(--gold)}
${p} .gn-tools{position:absolute;right:10px;z-index:5;display:flex;gap:6px}
${p} .gn-tools button{padding:0 10px;min-height:calc(var(--cw)*.4);border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.36);color:#fff;font:800 calc(var(--cw)*.13) var(--sans)}
${p} .gn-tools button.on{background:var(--gold);color:#1b1b1f;border-color:#fff}
${p} .gn-pile{position:absolute;border-radius:calc(var(--cw)*.1);z-index:1}
${p} .gn-pile.glow{box-shadow:0 0 0 4px rgba(242,195,75,.9),0 0 26px 6px rgba(242,195,75,.5);animation:gn-glow 1s infinite alternate}
@keyframes gn-glow{from{box-shadow:0 0 0 3px rgba(242,195,75,.6),0 0 12px 2px rgba(242,195,75,.3)}to{box-shadow:0 0 0 4px rgba(242,195,75,1),0 0 28px 8px rgba(242,195,75,.6)}}
${p} .gn-pile.hit{cursor:pointer}
${p} .gn-res{position:absolute;left:4%;right:4%;text-align:center;z-index:6;pointer-events:none}
${p} .gn-res h4{margin:0;font:900 calc(var(--cw)*.34) var(--sans);text-shadow:0 3px 0 rgba(0,0,0,.4);color:var(--gold)}
${p} .gn-res p{margin:2px 0 0;font:800 calc(var(--cw)*.16) var(--sans);color:#fff;text-shadow:0 2px 3px rgba(0,0,0,.6)}
${p} .gn-side{position:absolute;left:10px;z-index:5;font:900 calc(var(--cw)*.14) var(--sans);color:#fff;text-shadow:0 2px 3px rgba(0,0,0,.6);pointer-events:none}
${p} .gn-side small{opacity:.75;font-weight:800;margin-left:6px}
${p} .gn-meld{position:absolute;border-radius:calc(var(--cw)*.08);z-index:1;pointer-events:none;background:rgba(255,255,255,.07);border:2px dashed rgba(255,255,255,.22)}
${p} .gn-meld.tgt{pointer-events:auto;cursor:pointer;border-color:var(--gold);background:rgba(242,195,75,.22);animation:gn-glow 1s infinite alternate}
${p} .gn-drop{position:absolute;border-radius:calc(var(--cw)*.12);border:3px dashed rgba(255,255,255,.55);background:rgba(255,255,255,.1);z-index:1;pointer-events:none;opacity:0;transition:opacity .15s}
${p} .gn-drop.on{opacity:1}
`;
  };

  function ginUi(C) {
    const { api, stage, snd, M } = C;
    const flip = Flip(stage);
    stage.innerHTML = `<div class="gn-tbl"><b>Gin Rummy</b></div><div class="gn-cards"></div>`;
    const layer = stage.querySelector('.gn-cards'), tbl = stage.querySelector('.gn-tbl');
    const parts = {};
    const mk = (cls, name, html) => { const e = el('div', cls, html); stage.append(e); parts[name] = e; return e; };
    mk('', 'melds'); stage.insertBefore(parts.melds, layer);
    mk('gn-score', 'score'); mk('gn-status', 'status'); mk('gn-act', 'act'); mk('gn-lbl', 'lblS'); mk('gn-lbl', 'lblD'); mk('gn-dw', 'dw'); mk('gn-tools', 'tools');
    mk('gn-pile', 'pS'); mk('gn-pile', 'pD'); mk('gn-res', 'res'); mk('gn-side', 'sideO'); mk('gn-side', 'sideM'); mk('gn-drop', 'drop');
    parts.tools.innerHTML = '<button data-s="auto">Auto</button><button data-s="suit">Suit</button><button data-s="rank">Rank</button>';
    let L = { W: 880, H: 550, port: false, cw: 80, ch: 112 };
    let V = null, sel = -1, layPick = -1, order = [], sortMode = 'auto', drag = null, lastHand = -1, busyUntil = 0, finalT = 0, hintTgt = -1, selMeld = false;
    const now = () => performance.now();

    function resize(W, H, port) {
      const cw = port ? clamp(Math.min(W * .165, H * .115), 38, 80) : clamp(Math.min(W * .092, H * .15), 40, 100);
      L = { W, H, port, cw, ch: cw * 1.4 };
      stage.style.setProperty('--cw', cw + 'px');
      if (V) render(V, [], true);
    }
    function sortedHand(v) {
      const h = v.hand.slice();
      if (sortMode === 'suit') return { ids: h.sort((a, b) => gSu(a) - gSu(b) || gRk(a) - gRk(b)), groups: null };
      if (sortMode === 'rank') return { ids: h.sort((a, b) => gRk(a) - gRk(b) || gSu(a) - gSu(b)), groups: null };
      if (sortMode === 'manual') {
        order = order.filter(x => h.includes(x)); h.forEach(x => { if (!order.includes(x)) order.push(x); });
        return { ids: order.slice(), groups: null };
      }
      const b = ginBest(h);
      const gs = b.melds.map(m => m.slice().sort((a, c) => gSu(a) - gSu(c) || gRk(a) - gRk(c)));
      gs.sort((a, c) => gRk(a[0]) - gRk(c[0]) || gSu(a[0]) - gSu(c[0]));
      const dead = b.dead.slice().sort((a, c) => gRk(a) - gRk(c) || gSu(a) - gSu(c));
      if (dead.length) gs.push(dead);
      const ids = gs.flat();
      return { ids, groups: gs.map(g => g.length), dead: dead.length ? gs.length - 1 : -1 };
    }
    function handPos(n, groups) {
      const { W, H, port, cw, ch } = L, avail = W * (port ? .97 : .9);
      const gap = groups ? groups.length - 1 : 0, gw = cw * .2;
      let step = Math.min(cw * .74, (avail - cw - gap * gw) / Math.max(1, n - 1));
      step = Math.max(step, cw * .3);
      const total = (n - 1) * step + cw + gap * gw, x0 = (W - total) / 2, y = H - ch - (port ? 12 : H * .035);
      const out = []; let gi = 0, left = groups ? groups[0] : 1e9, x = x0;
      for (let i = 0; i < n; i++) {
        if (groups && left === 0) { gi++; left = groups[gi]; x += gw; }
        out.push({ x, y, grp: gi }); x += step; left--;
      }
      return out;
    }

    function status(v) {
      const me = v.seat, mine = v.turn === me, ph = v.phase, on = v.names[1 - me];
      if (ph === 'up1' || ph === 'up2') return mine ? ['Take the upcard or pass', ph === 'up2' ? 'The other player passed' : ''] : [`${on} is considering the upcard`, ''];
      if (ph === 'draw') return mine ? [v.stockOnly ? 'Draw from the stock' : 'Draw from the stock or take the discard', v.stockOnly ? 'Both players passed the upcard' : ''] : [`${on} is drawing…`, ''];
      if (ph === 'discard') return mine ? ['Discard a card', canKnockAny(v) ? 'You can knock - or keep going for gin' : 'Tap a card, then Discard (or drag it up)'] : [`${on} is thinking…`, ''];
      if (ph === 'layoff') return mine ? ['Lay off your cards', `${on} knocked - add cards to their melds, then press Done`] : [`${on} is laying off cards…`, ''];
      return ['', ''];
    }
    function knockOptions(v) {
      const h = v.hand; if (h.length !== 11) return null;
      let best = null;
      for (const d of h) {
        if (v.drew && v.drew.from === 'disc' && v.drew.id === d) continue;
        const b = ginBest(h.filter(x => x !== d));
        if (b.dw <= v.cfg.knockMax) {
          const o = { d, dw: b.dw };
          if (!best || o.dw < best.dw || (o.dw === best.dw && gPts(d) > gPts(best.d))) best = o;
        }
      }
      return best;
    }
    const canKnockAny = v => v.turn === v.seat && v.phase === 'discard' && !!knockOptions(v);
    function knockFor(v, id) {
      if (v.drew && v.drew.from === 'disc' && v.drew.id === id) return null;
      const b = ginBest(v.hand.filter(x => x !== id));
      return b.dw <= v.cfg.knockMax ? b.dw : null;
    }

    function boardGeom(groups) {
      const { W, port, cw } = L;
      let bw = cw * (port ? .62 : .74);
      const need = (w, rt) => groups.reduce((a, g) => a + (g.length - 1) * w * rt + w, 0) + (groups.length - 1) * w * .4;
      const lim = W * .95;
      if (need(bw, .3) > lim) bw *= lim / need(bw, .3);
      let rt = .56; while (need(bw, rt) > lim && rt > .3) rt -= .02;
      return { bw, bh: bw * 1.4, rt, gw: bw * .4 };
    }
    function boardCards(v, pos) {
      const res = v.res, kn = v.kn;
      return (melds, dead, y) => {
        const groups = melds.concat(dead.length ? [dead] : []);
        const g = boardGeom(groups), step = g.bw * g.rt;
        const widths = groups.map(x => (x.length - 1) * step + g.bw);
        const total = widths.reduce((a, b) => a + b, 0) + (groups.length - 1) * g.gw;
        let x = (L.W - total) / 2;
        const rows = [];
        groups.forEach((grp, gi) => {
          const isDead = gi >= melds.length;
          grp.forEach((id, i) => pos.push({ k: 'c' + id, id, x: x + i * step, y, w: g.bw, h: g.bh, z: 10 + i, lay: !isDead && (res ? (res.lay || []).some(l => l[0] === id) : (kn && kn.lay.some(l => l[0] === id))), face: 1, dim: isDead ? 1 : 0 }));
          if (!isDead) rows.push({ x: x - 5, y: y - 5, w: widths[gi] + 10, h: g.bh + 10, mi: gi });
          x += widths[gi] + g.gw;
        });
        return { rows, bh: g.bh, endX: x - g.gw, startX: (L.W - total) / 2, bw: g.bw, step };
      };
    }

    function layoutAll(v) {
      const { W, H, port, cw, ch } = L, pos = [], me = v.seat, op = 1 - me;
      const showdown = (v.phase === 'between' || v.phase === 'over') && v.res;
      const lay = v.phase === 'layoff';
      const pw = cw, ph = ch;
      const cy = port ? H * .335 : H * .36;
      const sx = W / 2 - cw * .62 - (port ? 0 : cw * .18), dxp = W / 2 + cw * .62 + (port ? 0 : cw * .18);
      const R = { pS: { x: sx - cw / 2, y: cy - ch / 2, w: cw, h: ch }, pD: { x: dxp - cw / 2, y: cy - ch / 2, w: cw, h: ch } };
      v.__R = R;
      const info = { tgt: [], meldRects: [], handIds: [], handPos: [], R };
      if (!showdown && !lay) {
        for (let i = 0; i < 3; i++) if (v.stockN > i * 8 || (i === 0 && v.stockN > 0)) pos.push({ k: 'stk' + i, x: R.pS.x - i * 1.5, y: R.pS.y - i * 1.5, w: cw, h: ch, z: 1 + i, back: 1 });
        const top = v.disc.slice(-3);
        top.forEach((id, i) => {
          const rot = (((id * 37) % 11) - 5) * (i === top.length - 1 ? .3 : .8);
          pos.push({ k: 'c' + id, id, x: R.pD.x + (i - (top.length - 1)) * 1.5, y: R.pD.y + (i - (top.length - 1)) * 1.5, w: cw, h: ch, z: 1 + i, face: 1, rot, disc: i === top.length - 1 });
        });
      }
      const oppKn = lay && v.kn && v.kn.p === op;
      if (!showdown && !oppKn) {
        const on = v.oppN, ow = cw * (port ? .52 : .6), oh = ow * 1.4, avail = W * (port ? .62 : .5);
        const step = Math.min(ow * .55, (avail - ow) / Math.max(1, on - 1)), tot = (on - 1) * step + ow, x0 = (W - tot) / 2, oy = port ? 78 : H * .12;
        for (let i = 0; i < on; i++) pos.push({ k: 'o' + i, x: x0 + i * step, y: oy, w: ow, h: oh, z: 1 + i, back: 1, rot: (i - (on - 1) / 2) * 1.6 });
        info.oppY = oy; info.oppH = oh;
      }
      if (lay || showdown) {
        const place = boardCards(v, pos);
        if (lay && v.kn) {
          const knocker = v.kn.p, y1 = port ? H * .2 : H * .22;
          const mine = knocker === me;
          const meldsFull = v.kn.melds;
          const o = place(meldsFull, mine ? v.hand.filter(x => !meldsFull.flat().includes(x)) : [], y1);
          info.meldRects = o.rows; info.bh = o.bh; info.layY = y1; info.allRows = o.rows;
          if (!mine) {
            const dn = v.oppN - (meldsFull.reduce((a, m) => a + m.length, 0) - v.kn.lay.length);
            for (let i = 0; i < dn; i++) pos.push({ k: 'o' + i, x: o.endX + o.bw * .4 + i * o.step, y: y1, w: o.bw, h: o.bh, z: 10 + i, back: 1 });
          }
        } else if (showdown) {
          const r = v.res, y0 = port ? H * .3 : H * .235, y1 = port ? H * .56 : H * .56;
          const o = place(r.melds[op], r.dead ? r.dead[op] : [], y0);
          const o2 = place(r.melds[me], r.dead ? r.dead[me] : [], y1);
          info.rowY = [y0, y1]; info.bh = o.bh; info.allRows = o.rows.concat(o2.rows);
        }
      }
      if (!showdown && !(lay && v.kn && v.kn.p === me)) {
        const { ids, groups, dead } = sortedHand(v);
        const hp = handPos(ids.length, groups);
        ids.forEach((id, i) => pos.push({ k: 'c' + id, id, x: hp[i].x, y: hp[i].y, w: cw, h: ch, z: 20 + i, face: 1, hand: 1, i, dw: groups && hp[i].grp === dead }));
        info.handIds = ids; info.handPos = hp;
      }
      return { pos, info };
    }

    function canDiscard(v) { return v.turn === v.seat && v.phase === 'discard'; }

    function render(v, evs, resizeOnly) {
      V = v;
      const { W, H, port, cw, ch } = L, me = v.seat, op = 1 - me;
      const mine = v.turn === me;
      if (!resizeOnly) flip.snap();
      const { pos, info } = layoutAll(v);
      const R = info.R;
      const showdown = (v.phase === 'between' || v.phase === 'over') && v.res;
      const lay = v.phase === 'layoff';
      const items = pos.map(p => ({
        k: p.k,
        cls: 'gcw' + (p.hand && sel === p.id ? ' sel' : '') + (p.lay ? ' lay' : '') + (p.dim && showdown ? ' dim' : '') + (p.hand || p.disc || (lay && mine && v.kn.p !== me && p.id != null && v.hand.includes(p.id)) ? ' hit' : ''),
        html: '<div class="gc"></div>',
        upd(e) {
          const s = e.style;
          s.left = p.x + 'px'; s.top = p.y + 'px'; s.width = p.w + 'px'; s.height = p.h + 'px'; s.zIndex = p.z || 1;
          const g = e.firstChild;
          if (p.back) { if (g.dataset.f !== 'b') { g.dataset.f = 'b'; g.style.backgroundImage = cardBack(); } }
          else { const f = 'f' + p.id; if (g.dataset.f !== f) { g.dataset.f = f; g.style.backgroundImage = cardFace(p.id); } }
          g.style.setProperty('--r', (p.rot || 0) + 'deg'); if (!(p.hand && sel === p.id)) g.style.transform = p.rot ? `rotate(${p.rot}deg)` : '';
          else g.style.transform = '';
          if (e._fresh && !p.back && !resizeOnly && (showdown || lay) && !p.hand) e.classList.add('new');
          e._fresh = false;
        }
      }));
      syncKeyed(layer, items);
      const t = ((V.phase === 'between' || V.phase === 'over') ? 0 : 0);
      for (const e of layer.querySelectorAll('.gcw.new')) { const x = e; setTimeout(() => x.classList.remove('new'), 520); }
      Object.assign(parts.pS.style, { left: R.pS.x + 'px', top: R.pS.y + 'px', width: cw + 'px', height: ch + 'px', display: showdown || lay ? 'none' : '' });
      Object.assign(parts.pD.style, { left: R.pD.x + 'px', top: R.pD.y + 'px', width: cw + 'px', height: ch + 'px', display: showdown || lay ? 'none' : '' });
      const canStock = mine && v.phase === 'draw', canDisc = mine && ((v.phase === 'draw' && !v.stockOnly) || v.phase === 'up1' || v.phase === 'up2') && v.disc.length > 0;
      const canStk = mine && v.phase === 'draw';
      parts.pS.className = 'gn-pile' + (canStk ? ' glow hit' : '');
      parts.pD.className = 'gn-pile' + (canDisc ? ' glow hit' : '');
      parts.lblS.style.cssText = `left:${R.pS.x}px;top:${R.pS.y + ch + 6}px;width:${cw}px;display:${showdown || lay ? 'none' : ''}`;
      parts.lblD.style.cssText = `left:${R.pD.x}px;top:${R.pD.y + ch + 6}px;width:${cw}px;display:${showdown || lay ? 'none' : ''}`;
      parts.lblS.textContent = `Stock ${v.stockN}`; parts.lblD.textContent = v.disc.length ? 'Discard' : '';
      const st = status(v);
      parts.status.innerHTML = st[0] + (st[1] ? `<small>${st[1]}</small>` : '');
      parts.status.style.top = (showdown ? -999 : (lay ? (info.layY + info.bh + 16) : R.pS.y + ch + 6 + cw * .3)) + 'px';
      parts.status.style.display = showdown ? 'none' : '';
      scoreBar(v);
      actions(v, info);
      const hp = info.handPos;
      const handTop = hp.length ? hp[0].y : H - ch;
      parts.dw.style.display = 'none'; parts.tools.style.display = 'none';
      if (!showdown && info.handIds.length) {
        const h = v.hand, dw = v.phase === 'discard' && h.length === 11 ? (knockBest(v)) : ginBest(h).dw;
        parts.dw.style.display = ''; parts.dw.style.top = (handTop - cw * .42) + 'px';
        parts.dw.innerHTML = `Deadwood <b>${dw}</b>`;
        parts.tools.style.display = ''; parts.tools.style.top = (handTop - cw * .46) + 'px';
        parts.tools.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.s === sortMode));
      }
      renderRes(v, info);
      const tg = lay && layPick >= 0 ? ginCanLay(v.kn.melds, layPick) : [];
      parts.melds.innerHTML = (info.allRows || []).map(r => `<div class="gn-meld${lay && tg.includes(r.mi) ? ' tgt' : ''}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></div>`).join('');
      if (!resizeOnly) {
        const hints = {}, delays = {};
        const rect = e => { const r = layer.getBoundingClientRect(); return e; };
        const pr = k => flip.rect(k);
        const stockRect = parts.pS.getBoundingClientRect(), discRect = parts.pD.getBoundingClientRect();
        (evs || []).forEach(ev => {
          if (ev.k === 'draw') {
            if (ev.p === me) hints['c' + ev.id] = ev.from === 'stock' ? stockRect : (flip.rect('c' + ev.id) || discRect);
            else { const k = 'o' + (v.oppN - 1); hints[k] = ev.from === 'stock' ? stockRect : (flip.rect('c' + ev.id) || discRect); }
          } else if (ev.k === 'disc' && ev.p !== me) {
            const r = flip.rect('o' + v.oppN) || flip.rect('o' + (v.oppN - 1));
            if (r) hints['c' + ev.id] = r;
          }
        });
        if (evs && evs.some(e => e.k === 'deal')) {
          let i = 0;
          layer.querySelectorAll('.gcw').forEach(e => { if (/^(c|o)/.test(e.dataset.k) && !hints[e.dataset.k]) { hints[e.dataset.k] = stockRect; delays[e.dataset.k] = i * 55; i++; } });
          busyUntil = now() + 20 * 55 + 500;
          for (let j = 0; j < 12; j++) api.timeout(() => snd.play('deal'), j * 90);
        }
        flip.play(hints, 420, delays);
        sounds(v, evs);
      }
    }
    flip.rect = flip.rect || null;
    function knockBest(v) {
      let best = 999;
      for (const d of v.hand) { if (v.drew && v.drew.from === 'disc' && v.drew.id === d) continue; best = Math.min(best, ginBest(v.hand.filter(x => x !== d)).dw); }
      return best;
    }
    function scoreBar(v) {
      const me = v.seat, op = 1 - me;
      const side = (s, name) => `<div class="s ${v.turn === s && v.phase !== 'between' && v.phase !== 'over' ? 'on' : ''}">${C.avatar(s, Math.round(L.cw * .36)).replace('</span>', v.dealer === s ? '<i class="dl">D</i></span>' : '</span>')}<span>${esc(name)} <b>${v.scores[s]}</b></span></div>`;
      parts.score.innerHTML = `${side(op, v.names[op])}<div class="m">Hand ${v.handNo}<b>to ${v.target}</b></div>${side(me, v.names[me])}`;
      parts.score.style.top = (L.port ? 48 : 8) + 'px';
    }
    function actions(v, info) {
      const { H, W, cw, ch, port } = L, me = v.seat, mine = v.turn === me;
      const btns = [];
      if (mine && (v.phase === 'up1' || v.phase === 'up2')) { btns.push(['n', 'Pass', 'pass']); }
      if (mine && v.phase === 'discard') {
        const ko = knockOptions(v);
        if (v.cfg.bigOn && v.hand.length === 11 && ginBest(v.hand).dw === 0) btns.push(['y pulse', 'Big Gin! +' + v.cfg.big, 'big']);
        if (sel >= 0 && v.hand.includes(sel) && !(v.drew && v.drew.from === 'disc' && v.drew.id === sel)) {
          btns.push(['n', 'Discard', 'disc']);
          const kd = knockFor(v, sel);
          if (kd != null) btns.push([kd === 0 ? 'y pulse' : 'k pulse', kd === 0 ? 'Gin!' : `Knock (${kd})`, 'knock']);
        } else if (ko) btns.push([ko.dw === 0 ? 'y pulse' : 'k pulse', ko.dw === 0 ? 'Gin!' : `Knock (${ko.dw})`, 'knockAuto']);
      }
      if (mine && v.phase === 'layoff') {
        btns.push(['g', 'Lay off all', 'layall']); btns.push(['k', 'Done', 'done']);
      }
      const showdown = (v.phase === 'between' || v.phase === 'over') && v.res;
      if (v.phase === 'between' && !v.ready[me]) btns.push(['g', 'Next hand', 'ready']);
      parts.act.innerHTML = btns.map(b => `<button class="${b[0]}" data-b="${b[2]}">${b[1]}</button>`).join('');
      const hp = info.handPos;
      let y = hp.length ? hp[0].y - cw * (port ? 1.18 : .8) : H - ch - cw;
      if (showdown) y = H - cw * .9;
      if (v.phase === 'layoff' && v.kn.p === me) y = H * .72;
      parts.act.style.top = y + 'px';
    }
    function resText(v) {
      const r = v.res, me = v.seat, w = r.w;
      const who = w === me ? 'You' : v.names[w], K = r.k;
      if (r.kind === 'draw') return ['Draw', 'The stock ran down to two cards - no score. Same dealer deals again.'];
      if (r.kind === 'gin') return [w === me ? 'GIN!' : v.names[w] + ' went Gin', `${who} scored ${r.pts} (25 bonus + ${r.dwO} deadwood)`];
      if (r.kind === 'big') return [w === me ? 'BIG GIN!' : v.names[w] + ' went Big Gin', `${who} scored ${r.pts} (${v.cfg.big} bonus + ${r.dwO} deadwood)`];
      if (r.kind === 'undercut') return [w === me ? 'UNDERCUT!' : 'Undercut!', `${who} scored ${r.pts} (${r.dwK - r.dwO} difference + ${v.cfg.under} undercut bonus) - deadwood ${r.dwO} vs ${r.dwK}`];
      return [w === me ? 'You win the hand' : v.names[w] + ' wins the hand', `${who} knocked with ${r.dwK} against ${r.dwO} and scored ${r.pts}`];
    }
    function renderRes(v, info) {
      const showdown = (v.phase === 'between' || v.phase === 'over') && v.res;
      const { W, H, port, cw, ch } = L, me = v.seat, op = 1 - me;
      const e = parts.res, so = parts.sideO, sm = parts.sideM, drop = parts.drop;
      so.style.display = sm.style.display = 'none'; drop.classList.remove('on');
      if (!showdown) { e.style.display = 'none'; return; }
      const r = v.res, t = resText(v);
      e.style.display = ''; e.style.top = (port ? 94 : 56) + 'px';
      e.innerHTML = `<h4>${t[0]}</h4><p>${esc(t[1])}</p>`;
      const bh = info.bh;
      so.style.display = sm.style.display = '';
      const dl = (s, k) => `${esc(v.names[s])}<small>deadwood ${k === 'k' ? (r.k === s ? r.dwK : r.dwO) : 0}</small>`;
      so.style.top = (info.rowY[0] - cw * .22) + 'px'; so.innerHTML = `${esc(v.names[op])}<small>deadwood ${r.k === op ? r.dwK : r.dwO}</small>`;
      sm.style.top = (info.rowY[1] - cw * .22) + 'px'; sm.innerHTML = `${esc(v.names[me])}<small>deadwood ${r.k === me ? r.dwK : r.dwO}</small>`;
      if (v.phase === 'over') parts.act.innerHTML = '<button class="g" data-b="final">Final result</button>';
    }
    function sounds(v, evs) {
      (evs || []).forEach(ev => {
        if (ev.k === 'draw') snd.play(ev.from === 'stock' ? 'draw' : 'slide');
        else if (ev.k === 'disc') snd.play('discard');
        else if (ev.k === 'pass') snd.play('click');
        else if (ev.k === 'knock') snd.play(ev.kind === 'knock' ? 'knock' : 'gin');
        else if (ev.k === 'lay') snd.play('layoff');
        else if (ev.k === 'result') {
          if (ev.kind === 'undercut') snd.play('undercut');
          else if (ev.kind === 'draw') snd.play('round');
          else if (ev.w === v.seat) snd.play(ev.kind === 'gin' || ev.kind === 'big' ? 'gin' : 'round');
          else snd.play('error');
        }
      });
    }

    function actBtn(b) {
      const v = V; if (!v) return;
      if (b === 'pass') C.act({ t: 'pass' });
      else if (b === 'disc') { if (sel >= 0) { const c = sel; sel = -1; C.act({ t: 'disc', c }); } }
      else if (b === 'knock') { if (sel >= 0) { const c = sel; sel = -1; C.act({ t: 'knock', c }); } }
      else if (b === 'knockAuto') { const ko = knockOptions(v); if (ko) { sel = -1; C.act({ t: 'knock', c: ko.d }); } }
      else if (b === 'big') C.act({ t: 'big' });
      else if (b === 'done') C.act({ t: 'done' });
      else if (b === 'layall') layAll(v);
      else if (b === 'ready') C.act({ t: 'ready' });
      else if (b === 'final') showFinal(v);
    }
    function layAll(v) {
      const dead = ginBest(v.hand).dead.slice().sort((a, b) => gPts(b) - gPts(a));
      let melds = v.kn.melds.map(m => m.slice()), n = 0;
      let changed = true;
      while (changed) {
        changed = false;
        for (const id of dead) {
          if (!v.hand.includes(id) || melds.flat().includes(id)) continue;
          const o = ginCanLay(melds, id);
          if (o.length) { ginLayAdd(melds[o[0]], id); C.act({ t: 'lay', c: id, m: o[0] }); changed = true; n++; }
        }
      }
      if (!n) C.toast('No cards can be laid off');
    }

    function handClick(id) {
      const v = V; if (!v) return;
      snd.unlock();
      if (v.phase === 'layoff' && v.turn === v.seat && v.hand.includes(id)) {
        const o = ginCanLay(v.kn.melds, id);
        if (!o.length) { C.toast('That card does not fit any meld'); snd.play('error'); return; }
        if (o.length > 1) { layPick = layPick === id ? -1 : id; snd.play('select'); if (layPick >= 0) C.toast('Tap the meld to add it to'); render(v, [], true); return; }
        layPick = -1; C.act({ t: 'lay', c: id, m: o[0] }); return;
      }
      if (v.phase !== 'discard' || v.turn !== v.seat) { sel = sel === id ? -1 : id; snd.play('select'); render(v, [], true); return; }
      if (sel === id) {
        if (v.drew && v.drew.from === 'disc' && v.drew.id === id) { C.toast('You cannot discard the card you just took'); snd.play('error'); return; }
        sel = -1; C.act({ t: 'disc', c: id }); return;
      }
      sel = id; snd.play('select'); render(v, [], true);
    }
    api.on(layer, 'pointerdown', e => {
      snd.unlock();
      const w = e.target.closest('.gcw'); if (!w || !V) return;
      const k = w.dataset.k;
      if (k[0] !== 'c') return;
      const id = +k.slice(1);
      if (!V.hand.includes(id)) { if (V.disc[V.disc.length - 1] === id) pileDisc(); return; }
      const r = layer.getBoundingClientRect();
      drag = { id, w, x0: e.clientX, y0: e.clientY, ox: e.clientX - w.getBoundingClientRect().left, oy: e.clientY - w.getBoundingClientRect().top, moved: false, pid: e.pointerId, lx: parseFloat(w.style.left), ly: parseFloat(w.style.top) };
      try { layer.setPointerCapture(e.pointerId); } catch (x) {}
    });
    api.on(layer, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) > 8) { drag.moved = true; drag.w.classList.add('drag'); }
      if (drag.moved) {
        drag.w.style.left = drag.lx + dx + 'px'; drag.w.style.top = drag.ly + dy + 'px';
        const v = V, over = overDiscard(e);
        parts.drop.classList.toggle('on', over && canDiscard(v));
        if (over && canDiscard(v)) Object.assign(parts.drop.style, { left: v.__R.pD.x - 4 + 'px', top: v.__R.pD.y - 4 + 'px', width: L.cw + 8 + 'px', height: L.ch + 8 + 'px' });
      }
    });
    function overDiscard(e) {
      const lr = layer.getBoundingClientRect(), R = V.__R.pD, x = e.clientX - lr.left, y = e.clientY - lr.top;
      return x > R.x - L.cw * .3 && x < R.x + R.w + L.cw * .3 && y > R.y - L.ch * .3 && y < R.y + R.h + L.ch * .5;
    }
    const endDrag = (e, cancel) => {
      if (!drag || (e && e.pointerId !== drag.pid)) return;
      const d = drag; drag = null;
      parts.drop.classList.remove('on');
      d.w.classList.remove('drag');
      try { layer.releasePointerCapture(d.pid); } catch (x) {}
      const v = V;
      if (!d.moved) { if (!cancel) handClick(d.id); return; }
      const lr = layer.getBoundingClientRect(), cx = e.clientX - lr.left;
      if (canDiscard(v) && overDiscard(e) && !(v.drew && v.drew.from === 'disc' && v.drew.id === d.id)) { sel = -1; C.act({ t: 'disc', c: d.id }); return; }
      const ids = sortedHand(v).ids.filter(x => x !== d.id), hp = handPos(ids.length + 1, null);
      let idx = 0;
      const ctr = cx - L.cw / 2;
      const all = sortedHand(v).ids.filter(x => x !== d.id);
      const poss = handPos(all.length + 1, null);
      idx = 0; for (let i = 0; i < poss.length; i++) if (ctr > poss[i].x - 2) idx = i;
      all.splice(Math.min(idx, all.length), 0, d.id);
      order = all; sortMode = 'manual'; snd.play('slide');
      render(v, [], true);
    };
    api.on(layer, 'pointerup', e => endDrag(e));
    api.on(layer, 'pointercancel', e => endDrag(e, true));
    function pileDisc() {
      const v = V; if (!v || v.turn !== v.seat) return;
      if (v.phase === 'up1' || v.phase === 'up2' || (v.phase === 'draw' && !v.stockOnly)) C.act({ t: 'take' });
      else if (v.phase === 'draw' && v.stockOnly) { C.toast('Draw from the stock first'); snd.play('error'); }
    }
    api.on(stage, 'click', e => {
      snd.unlock();
      const b = e.target.closest('[data-b]');
      if (b) { actBtn(b.dataset.b); return; }
      const s = e.target.closest('[data-s]');
      if (s) { sortMode = s.dataset.s; sel = -1; snd.play('click'); render(V, [], true); return; }
      if (!V) return;
      const rect = layer.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top, R = V.__R;
      const inR = r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      if (layPick >= 0 && V.phase === 'layoff' && V.turn === V.seat && V.kn) {
        const rr = (layoutAll(V).info.allRows || []).find(inR);
        if (rr && ginCanLay(V.kn.melds, layPick).includes(rr.mi)) { const c = layPick; layPick = -1; C.act({ t: 'lay', c, m: rr.mi }); return; }
      }
      if (inR(R.pS) && V.turn === V.seat && V.phase === 'draw') { sel = -1; C.act({ t: 'stock' }); }
      else if (inR(R.pD) && !e.target.closest('.gcw.sel')) pileDisc();
    });
    api.on(window, 'keydown', e => {
      if (C.M.mode === 'title' || C.paneOpen() || !V) return;
      const v = V, k = e.key.toLowerCase();
      if (k === 'd' && v.phase === 'draw' && v.turn === v.seat) C.act({ t: 'stock' });
      else if (k === 't' && v.turn === v.seat) pileDisc();
      else if (k === 'p' && (v.phase === 'up1' || v.phase === 'up2') && v.turn === v.seat) C.act({ t: 'pass' });
      else if (k === 'k' && canKnockAny(v)) actBtn(sel >= 0 && knockFor(v, sel) != null ? 'knock' : 'knockAuto');
      else if ((k === 'enter' || k === ' ') && v.phase === 'discard' && sel >= 0 && v.turn === v.seat) { e.preventDefault(); actBtn('disc'); }
      else if (k === 'enter' && v.phase === 'between' && !v.ready[v.seat]) C.act({ t: 'ready' });
      else if (k === 'arrowleft' || k === 'arrowright') {
        const ids = sortedHand(v).ids; if (!ids.length) return;
        let i = ids.indexOf(sel); i = i < 0 ? (k === 'arrowleft' ? ids.length - 1 : 0) : clamp(i + (k === 'arrowleft' ? -1 : 1), 0, ids.length - 1);
        sel = ids[i]; snd.play('select'); render(v, [], true);
      }
    });

    function showFinal(v) {
      const f = v.final; if (!f) return;
      const me = v.seat, w = f.w, win = w === me;
      const rows = [0, 1].map(s => `<tr class="${s === w ? 'win' : ''} ${s === me ? 'me' : ''}"><td>${esc(v.names[s])}</td><td>${v.scores[s]}</td><td>${f.hands[s]}</td><td>${s === w ? '+100' : '-'}</td><td>+${f.box[s]}</td><td><b>${f.tot[s]}</b></td></tr>`).join('');
      C.showPane('final', `<div class="gx-box wide"><p class="gx-kick">${win ? 'Victory' : 'Defeat'}</p><h3>${win ? 'You win the game!' : esc(v.names[w]) + ' wins the game'}</h3>
<table class="gx-tbl"><tr><th>Player</th><th>Points</th><th>Hands won</th><th>Game</th><th>Boxes</th><th>Total</th></tr>${rows}</table>
${f.shut ? '<p>Shutout! The winner\'s total is doubled.</p>' : ''}${C.endButtons()}</div>`, null, '');
    }
    let finalShown = false;
    function update(v, evs, info) {
      if (!C.M.over && v.phase === 'over') { C.over(); }
      const had = V;
      if (v.hand.length && !had) lastHand = v.handNo;
      if (had && had.handNo !== v.handNo) { sel = -1; if (sortMode === 'manual') order = []; }
      if (sel >= 0 && !v.hand.includes(sel)) sel = -1;
      if (v.phase !== 'discard' && v.phase !== 'layoff') sel = -1;
      layPick = -1;
      if (info && info.sync) { V = null; }
      render(v, info && info.sync ? [] : evs, false);
      api.score(v.scores[v.seat]);
      if (v.phase === 'discard' && v.turn === v.seat && !(had && had.phase === 'discard' && had.turn === had.seat)) snd.play('turn');
      if (v.phase === 'over') {
        if (!finalShown) {
          finalShown = true;
          const win = v.final.w === v.seat;
          api.timeout(() => { snd.play(win ? 'win' : 'lose'); }, 700);
          if (win) { api.submit(v.final.tot[v.seat]); }
          finalT = setTimeout(() => { if (api.alive && V && V.phase === 'over') showFinal(V); }, 3200);
        }
      } else { finalShown = false; clearTimeout(finalT); }
    }
    return {
      begin(meta, seat) { V = null; sel = -1; order = []; sortMode = 'auto'; finalShown = false; clearTimeout(finalT); layer.innerHTML = ''; api.label('Points'); api.score(0); resize(L.W, L.H, L.port); },
      update, resize,
      busy: () => now() < busyUntil,
      destroy() { clearTimeout(finalT); }
    };
  }

  const ginLogo = () => `<div class="gn-fan">${[[11 * 1 + 13 * 0, -16], [12 + 13, -5], [0, 6], [9 + 26, 17]].map(([id, r], i) => `<i style="background-image:${cardFace(id)};transform:rotate(${r}deg) translateY(${Math.abs(r) * .5}px)"></i>`).join('')}</div><h2 class="gn-logo"><span>Gin</span> Rummy</h2>`;
  const ginRules = `<h4>The goal</h4><p>Two players. Form your 10 cards into melds and keep the unmatched cards (deadwood) low. Win hands until you reach the target score (100).</p>
<h4>Melds</h4><ul><li><b>Set</b>: 3 or 4 cards of the same rank.</li><li><b>Run</b>: 3 or more cards in sequence of the same suit. Ace is always low (A-2-3 is a run, Q-K-A is not).</li></ul>
<h4>Card values</h4><p>Ace 1, number cards face value, J Q K 10. Deadwood is the total of the cards left outside melds.</p>
<h4>The deal</h4><p>10 cards each and the top card of the stock turned up. The player who did not deal may take the upcard or pass; then the dealer may take it. If both pass, the non-dealer must draw from the stock.</p>
<h4>A turn</h4><p>Draw the top of the stock or take the top of the discard pile, then discard one card. You may not discard the card you just took from the discard pile.</p>
<h4>Knocking</h4><p>When your deadwood is 10 or less after discarding you may knock. The other player then <b>lays off</b>: adds unmatched cards to your melds (extending runs or the 4th card of a set).</p>
<ul><li>If your deadwood is lower than theirs you score the difference.</li><li><b>Undercut</b>: if theirs is equal or lower they score the difference plus 25.</li><li><b>Gin</b>: knock with no deadwood at all. No laying off; you score 25 plus their deadwood.</li><li><b>Big Gin</b>: all 11 cards melded without discarding scores 31 plus their deadwood.</li></ul>
<h4>Draws</h4><p>If the stock is down to 2 cards and the player who drew discards without knocking, the hand is a draw: no score, the same dealer deals again.</p>
<h4>Game bonus</h4><p>First to 100 wins the game: +100 and +25 for every hand won (the loser also gets 25 per hand won). If the loser won no hand at all (a shutout) the winner's total is doubled.</p>
<h4>Controls</h4><p>Tap the stock or the discard pile to draw. Tap a card to pick it up, tap it again (or press <kbd>Discard</kbd>) to discard, or drag it onto the discard pile. Drag cards sideways to reorder. <kbd>D</kbd> draw, <kbd>T</kbd> take discard, <kbd>P</kbd> pass, <kbd>K</kbd> knock, <kbd>&larr;</kbd><kbd>&rarr;</kbd> select, <kbd>Enter</kbd> discard.</p>`;

  Ameplay.register({
    id: 'gin-rummy',
    title: 'Gin Rummy',
    category: 'Board',
    tint: '#2d8a55',
    blurb: 'Meld your cards, knock with 10 or less, go Gin or undercut your rival. Vs the computer or online.',
    help: 'Tap the stock or discard to draw · tap a card then Discard (or drag it to the pile) · Knock when deadwood is 10 or less · <kbd>D</kbd> draw <kbd>K</kbd> knock',
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="14" width="26" height="38" rx="4" transform="rotate(-10 23 33)"/><rect x="28" y="12" width="26" height="38" rx="4" transform="rotate(9 41 31)"/><path d="M41 24c-2.5-3.5-7-1.5-5.8 2.2.7 2.2 4 4.4 5.8 6 1.8-1.6 5.1-3.8 5.8-6C48 22.5 43.5 20.5 41 24z"/></svg>',
    css: baseCss('gin-rummy') + gnCss('gin-rummy') + `
.gm-gin-rummy .gn-fan{position:relative;height:96px;width:210px;margin:0 auto 4px}
.gm-gin-rummy .gn-fan i{position:absolute;top:0;width:62px;height:87px;border-radius:7px;background-size:100% 100%;box-shadow:0 3px 8px rgba(0,0,0,.4);left:calc(50% - 31px + var(--o,0px))}
.gm-gin-rummy .gn-fan i:nth-child(1){--o:-72px}.gm-gin-rummy .gn-fan i:nth-child(2){--o:-24px}.gm-gin-rummy .gn-fan i:nth-child(3){--o:24px}.gm-gin-rummy .gn-fan i:nth-child(4){--o:72px}
.gm-gin-rummy .gn-logo{margin:2px 0 4px;font:900 44px/1 Georgia,'Times New Roman',serif;font-style:italic;color:#fff;letter-spacing:-.5px;text-shadow:0 3px 0 rgba(0,0,0,.35)}
.gm-gin-rummy .gn-logo span{color:var(--gold)}
`,
    mount(root, api) {
      const S = {
        id: 'gin-rummy', title: 'Gin Rummy',
        logo: ginLogo(), tagline: 'Two players · 10 cards · race to 100', soloSub: 'One opponent',
        rules: ginRules,
        defaults: { diff: 'Normal', target: 100, bigOn: true },
        options: [
          { k: 'diff', label: 'Opponent', opts: [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']] },
          { k: 'target', label: 'Play to', opts: [[50, '50'], [100, '100'], [150, '150']] },
          { k: 'bigOn', label: 'Big Gin', sub: '11 melded cards, 31 bonus', opts: [[true, 'On'], [false, 'Off']] }
        ],
        online: { sizes: [2], defaultSize: 2, min: 2, max: 2, bots: false },
        opponents: () => 1,
        cfg: opt => ({ target: +opt.target || 100, bigOn: opt.bigOn !== false }),
        create: ginCreate, act: ginAct, view: ginView, fev: ginFev, who: ginWho, bot: ginBot,
        delay: (s, p) => s.phase === 'between' ? 200 : s.phase === 'layoff' ? 650 : 750 + Math.random() * 700,
        ui: ginUi
      };
      const C = Core(api, root, S);
      C.start();
      return { destroy() { C.destroy(); } };
    }
  });

  Ameplay.covers['gin-rummy'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gnc" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3da468"/><stop offset=".65" stop-color="#1c6e43"/><stop offset="1" stop-color="#0b3a22"/></radialGradient></defs><rect width="400" height="300" fill="url(#gnc)"/><ellipse cx="200" cy="150" rx="170" ry="115" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/><g transform="translate(112 160) rotate(-18)"><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#000" opacity=".25" transform="translate(4 7)"/><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#fff"/><text x="-30" y="-44" font-family="Georgia,serif" font-weight="700" font-size="26" fill="#17171c" text-anchor="middle">A</text><path d="M0-30C0-30-26-8-26 12a12 12 0 0 0 22 7c0 8-3 14-9 19h26c-6-5-9-11-9-19a12 12 0 0 0 22-7C26-8 0-30 0-30z" fill="#17171c" transform="translate(0 4) scale(.92)"/></g><g transform="translate(288 160) rotate(17)"><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#000" opacity=".25" transform="translate(4 7)"/><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#fff"/><text x="-30" y="-44" font-family="Georgia,serif" font-weight="700" font-size="26" fill="#d1202c" text-anchor="middle">K</text><rect x="-28" y="-40" width="56" height="84" rx="4" fill="#fbf3dc" stroke="#d1202c" stroke-width="2"/><path d="M-14-6l4-22 10 12 10-12 4 22z" fill="#e2b43a" stroke="#222"/><circle cx="0" cy="8" r="11" fill="#f4d6ae" stroke="#222"/><path d="M-26 40q0-22 26-22t26 22z" fill="#c9262f" stroke="#222"/></g><g transform="translate(200 150) rotate(-2)"><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#000" opacity=".25" transform="translate(4 7)"/><rect x="-48" y="-70" width="96" height="140" rx="9" fill="#fff"/><text x="-30" y="-44" font-family="Georgia,serif" font-weight="700" font-size="24" fill="#d1202c" text-anchor="middle">10</text><g fill="#d1202c"><path id="gh" d="M0-4C0-4-9-10-9-16a5 5 0 0 1 9-2 5 5 0 0 1 9 2C9-10 0-4 0-4z" transform="translate(-16 -24) scale(1.1)"/><use href="#gh" x="32"/><use href="#gh" y="30"/><use href="#gh" x="32" y="30"/><use href="#gh" x="16" y="-12"/><use href="#gh" y="62"/><use href="#gh" x="32" y="62"/><use href="#gh" x="16" y="82"/></g></g><g fill="#f2c34b" font-family="Georgia,serif" font-style="italic" font-weight="900" font-size="46" text-anchor="middle" stroke="#0b3a22" stroke-width="5" paint-order="stroke"><text x="200" y="278">GIN!</text></g></svg>`;

  const rkJ = id => id >= 104;
  const rkC = id => ((id % 52) / 13) | 0;
  const rkN = id => (id % 13) + 1;
  const rkVal = id => rkJ(id) ? 30 : rkN(id);
  const RK_INIT = 30;

  function rkRunOf(ids) {
    const L = ids.length;
    if (L < 3 || L > 13) return null;
    const nj = ids.filter(x => !rkJ(x));
    if (!nj.length) return null;
    const c = rkC(nj[0]);
    if (nj.some(x => rkC(x) !== c)) return null;
    let st = null, ok = true;
    for (let i = 0; i < L; i++) if (!rkJ(ids[i])) {
      const s = rkN(ids[i]) - i;
      if (st === null) st = s; else if (st !== s) { ok = false; break; }
    }
    if (ok && st >= 1 && st + L - 1 <= 13) return { order: ids.slice(), start: st };
    const by = {};
    for (const x of nj) { const n = rkN(x); if (by[n] !== undefined) return null; by[n] = x; }
    const ns = nj.map(rkN).sort((a, b) => a - b), lo = ns[0], hi = ns[ns.length - 1];
    const js = L - ns.length, gaps = hi - lo + 1 - ns.length;
    if (js < gaps) return null;
    const spare = js - gaps, up = Math.min(spare, 13 - hi), down = spare - up;
    if (down > lo - 1) return null;
    const start = lo - down, jk = ids.filter(rkJ), order = [];
    for (let n = start; n < start + L; n++) order.push(by[n] != null ? by[n] : jk.pop());
    return { order, start };
  }
  function rkGrpOf(ids) {
    const L = ids.length;
    if (L < 3 || L > 4) return null;
    const nj = ids.filter(x => !rkJ(x));
    if (!nj.length) return null;
    const n = rkN(nj[0]);
    if (nj.some(x => rkN(x) !== n)) return null;
    if (new Set(nj.map(rkC)).size !== nj.length) return null;
    return { order: ids.slice(), n };
  }
  function rkSet(ids) {
    const r = rkRunOf(ids), g = rkGrpOf(ids);
    let a = null;
    if (r) { let pts = 0; for (let i = 0; i < ids.length; i++) pts += r.start + i; a = { kind: 'run', order: r.order, pts, start: r.start }; }
    if (g) { const pts = g.n * ids.length; if (!a || pts > a.pts) a = { kind: 'group', order: g.order, pts }; }
    return a;
  }
  const rkTotal = rack => rack.reduce((a, x) => a + rkVal(x), 0);

  function rkCheck(s, p, sets) {
    if (!Array.isArray(sets) || sets.length > 60) return { err: 'Invalid move' };
    const seen = new Set();
    for (const st of sets) {
      if (!Array.isArray(st) || st.length > 13) return { err: 'Invalid move' };
      for (const id of st) {
        if (!Number.isInteger(id) || id < 0 || id > 105 || seen.has(id)) return { err: 'Invalid move' };
        seen.add(id);
      }
    }
    const old = new Set();
    s.table.forEach(st => st.forEach(id => old.add(id)));
    for (const id of old) if (!seen.has(id)) return { err: 'Tiles from the table cannot go back to your rack' };
    const rack = new Set(s.racks[p]), played = [];
    for (const id of seen) if (!old.has(id)) { if (!rack.has(id)) return { err: 'Invalid move' }; played.push(id); }
    if (!played.length) return { err: 'Play at least one tile from your rack' };
    const out = [], bad = [];
    sets.forEach((st, i) => {
      const r = rkSet(st);
      if (r) out.push(r); else { out.push(null); bad.push(i); }
    });
    if (bad.length) return { err: 'Some sets are not valid', bad };
    let meldPts = 0;
    if (!s.melded[p]) {
      const left = out.map((r, i) => ({ k: sets[i].slice().sort((a, b) => a - b).join(','), r }));
      for (const os of s.table) {
        const k = os.slice().sort((a, b) => a - b).join(',');
        const j = left.findIndex(x => x.k === k);
        if (j < 0) return { err: 'Before your first meld you cannot touch the table' };
        left.splice(j, 1);
      }
      meldPts = left.reduce((a, x) => a + x.r.pts, 0);
      if (meldPts < RK_INIT) return { err: 'Your first meld must total at least ' + RK_INIT + ' points (you have ' + meldPts + ')', meld: meldPts };
    }
    return { ok: true, sets: out.map(r => r.order), played, meldPts };
  }

  function rkSolve(avail, rackC, jAvail, jRack, need30, cap, ms, hard) {
    const rem = Int8Array.from(avail), NEG = -1e9, memo = new Map(), t0 = performance.now(), JP = hard ? 40 : 0;
    let jr = jAvail, nodes = 0, bust = false;
    const keyOf = (t, s) => { let k = t + ',' + jr + ',' + s + ','; for (let i = t; i < 52; i++) k += rem[i]; return k; };
    function go(t, sum) {
      if (bust) return NEG;
      while (t < 52 && rem[t] === 0) t++;
      if (t === 52) return Math.max(0, jr - jRack) === 0 && (!need30 || sum >= RK_INIT) ? 0 : NEG;
      const k = keyOf(t, need30 ? Math.min(sum, RK_INIT) : 0), m = memo.get(k);
      if (m) return m.v;
      if (++nodes > cap || ((nodes & 127) === 0 && performance.now() - t0 > ms)) { bust = true; return NEG; }
      const c = (t / 13) | 0, n = t % 13 + 1;
      let best = NEG, bm = null;
      const take = (shape, gain, val) => {
        const v = gain + go(t, sum + val);
        if (v > best) { best = v; bm = { s: shape.slice(), val }; }
      };
      const oth = [];
      for (let c2 = c + 1; c2 < 4; c2++) if (rem[c2 * 13 + n - 1] > 0) oth.push(c2 * 13 + n - 1);
      rem[t]--;
      const subs = (i, pick) => {
        if (i === oth.length) {
          const sz = 1 + pick.length;
          for (let j = 0; j <= 2 && j <= jr; j++) {
            const L = sz + j;
            if (L < 3 || L > 4) continue;
            for (const y of pick) rem[y]--;
            jr -= j;
            const shape = [t, ...pick];
            for (let q = 0; q < j; q++) shape.push(-1);
            take(shape, L * 100 - j * JP, n * L);
            jr += j;
            for (const y of pick) rem[y]++;
          }
          return;
        }
        pick.push(oth[i]); subs(i + 1, pick); pick.pop(); subs(i + 1, pick);
      };
      subs(0, []);
      rem[t]++;
      for (let lead = 0; lead <= 2 && lead <= jr && n - lead >= 1; lead++) {
        rem[t]--; jr -= lead;
        const shape = [];
        for (let q = 0; q < lead; q++) shape.push(-1);
        shape.push(t);
        const ext = (x, ju) => {
          if (bust) return;
          const len = shape.length;
          if (len >= 3) {
            let val = 0; const st = n - lead;
            for (let q = 0; q < len; q++) val += st + q;
            take(shape, len * 100 - ju * JP, val);
          }
          if (x > 13) return;
          const y = c * 13 + x - 1;
          if (rem[y] > 0) { rem[y]--; shape.push(y); ext(x + 1, ju); shape.pop(); rem[y]++; }
          if (jr > 0) { jr--; shape.push(-1); ext(x + 1, ju + 1); shape.pop(); jr++; }
        };
        ext(n + 1, lead);
        jr += lead; rem[t]++;
      }
      if (rem[t] <= rackC[t]) {
        const keep = rem[t]; rem[t] = 0;
        const v = go(t + 1, sum);
        rem[t] = keep;
        if (v > best) { best = v; bm = null; }
      }
      if (!bust) memo.set(k, { v: best, m: bm });
      return best;
    }
    const v = go(0, 0);
    if (bust || v <= NEG / 2) return null;
    rem.set(avail); jr = jAvail;
    const out = [];
    let t = 0, sum = 0;
    for (let guard = 0; guard < 200; guard++) {
      while (t < 52 && rem[t] === 0) t++;
      if (t === 52) break;
      const m = memo.get(keyOf(t, need30 ? Math.min(sum, RK_INIT) : 0));
      if (!m || m.v <= NEG / 2) return null;
      if (!m.m) { rem[t] = 0; continue; }
      out.push(m.m.s); sum += m.m.val;
      for (const y of m.m.s) { if (y < 0) jr--; else rem[y]--; }
    }
    return out;
  }

  function rkPlan(s, p, lvl) {
    const rack = s.racks[p], table = s.table, melded = s.melded[p];
    const hard = lvl === 'Hard', cap = hard ? 90000 : 12000, ms = hard ? 110 : 40;
    const queues = tbl => {
      const q = Array.from({ length: 52 }, () => []), jq = [], avail = new Int8Array(52), rc = new Int8Array(52);
      let jA = 0, jR = 0;
      for (const st of tbl) for (const id of st) { if (rkJ(id)) { jq.push(id); jA++; } else { q[id % 52].push(id); avail[id % 52]++; } }
      for (const id of rack) { if (rkJ(id)) { jq.push(id); jA++; jR++; } else { q[id % 52].push(id); avail[id % 52]++; rc[id % 52]++; } }
      return { q, jq, avail, rc, jA, jR };
    };
    const pickSets = budget => {
      const sc = table.map((st, i) => {
        const r0 = rkSet(st), nj = st.filter(x => !rkJ(x));
        let v = 0;
        for (const r of rack) {
          if (rkJ(r)) { v += .6; continue; }
          const rc = rkC(r), rn = rkN(r);
          if (r0 && r0.kind === 'run') {
            const a = r0.start, e = a + st.length - 1;
            if (rc === rkC(nj[0])) v += rn >= a - 1 && rn <= e + 1 ? 3 : rn >= a - 3 && rn <= e + 3 ? 1 : 0;
            if (st.some(x => !rkJ(x) && rkN(x) === rn)) v += 1.5;
          } else if (nj.length && rkN(nj[0]) === rn) v += 3;
        }
        return { i, v, n: st.length };
      }).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
      const sel = []; let tn = 0;
      for (const x of sc) { if (tn + x.n > budget) continue; sel.push(x.i); tn += x.n; }
      return sel;
    };
    const build = (shapes, Q) => shapes.map(sh => sh.map(y => y < 0 ? Q.jq.shift() : Q.q[y].shift()));
    const easy = () => {
      const rk = rack.slice(), tb = table.map(x => x.slice());
      let moved = 0;
      if (melded) {
        let again = true;
        while (again) {
          again = false;
          for (let k = 0; k < rk.length && !again; k++) {
            const id = rk[k];
            if (rkJ(id) && Math.random() < .85) continue;
            for (let i = 0; i < tb.length && !again; i++) {
              for (const cand of [tb[i].concat(id), [id].concat(tb[i])]) {
                const r = rkSet(cand);
                if (r) { tb[i] = r.order; rk.splice(k, 1); moved++; again = true; break; }
              }
            }
          }
        }
      }
      const avail = new Int8Array(52), rc = new Int8Array(52), q = Array.from({ length: 52 }, () => []), jq = [];
      for (const id of rk) { if (rkJ(id)) jq.push(id); else { q[id % 52].push(id); avail[id % 52]++; rc[id % 52]++; } }
      const sh = rkSolve(avail, rc, jq.length, jq.length, !melded, 8000, 30, false);
      let add = [];
      if (sh && sh.length) add = sh.map(x => x.map(y => y < 0 ? jq.shift() : q[y].shift()));
      if (!moved && !add.length) return null;
      return tb.concat(add);
    };
    if (lvl === 'Easy') return easy();
    if (!melded) {
      const Q = queues([]);
      const sh = rkSolve(Q.avail, Q.rc, Q.jA, Q.jR, true, cap, ms, hard);
      if (!sh || !sh.length) return easy();
      return table.map(x => x.slice()).concat(build(sh, Q));
    }
    let budget = hard ? 46 : 28;
    for (let tr = 0; tr < 2; tr++) {
      const all = table.map((_, i) => i), tiles = table.reduce((a, x) => a + x.length, 0);
      const sel = tiles > budget ? pickSets(budget) : all;
      const chosen = sel.map(i => table[i]), frozen = table.filter((_, i) => !sel.includes(i));
      const Q = queues(chosen);
      const sh = rkSolve(Q.avail, Q.rc, Q.jA, Q.jR, false, cap, ms, hard);
      if (sh) {
        const sets = build(sh, Q), tot = sets.reduce((a, x) => a + x.length, 0), tt = chosen.reduce((a, x) => a + x.length, 0);
        if (tot <= tt) return null;
        return frozen.concat(sets);
      }
      budget = Math.floor(budget / 2);
    }
    return easy();
  }

  function rkDeal(s, ev) {
    const R = s.R;
    const pool = shuffle(Array.from({ length: 106 }, (_, i) => i), R);
    s.racks = Array.from({ length: s.n }, () => pool.splice(0, 14));
    s.pool = pool; s.table = []; s.melded = Array(s.n).fill(false); s.passes = 0; s.tn = 0; s.res = null; s.phase = 'play'; s.ready = Array(s.n).fill(false);
    s.round++;
    let first;
    if (s.round === 1) {
      const dr = Array.from({ length: s.n }, () => pool[Math.floor(R() * pool.length)]);
      const sc = dr.map(x => rkJ(x) ? 14 : rkN(x)), mx = Math.max(...sc), top = sc.map((v, i) => v === mx ? i : -1).filter(i => i >= 0);
      first = top[Math.floor(R() * top.length)];
      ev.push({ k: 'first', tiles: dr, w: first });
    } else first = (s.starter + 1) % s.n;
    s.starter = first; s.turn = first;
    s.deadline = s.cfg.timer ? Date.now() + s.cfg.timer * 1000 : 0;
    ev.push({ k: 'deal', round: s.round });
  }
  function rkCreate(cfg, n, R) {
    const s = { cfg: { rounds: cfg.rounds || 1, timer: cfg.timer || 0, penalty: !!cfg.penalty }, n, R, round: 0, scores: Array(n).fill(0), wins: Array(n).fill(0), final: null, starter: 0, ready: [] };
    const ev = [];
    rkDeal(s, ev);
    s.ev0 = ev;
    return s;
  }
  function rkEnd(s, ev, w, blocked) {
    const tot = s.racks.map(rkTotal), pts = Array(s.n).fill(0);
    for (let i = 0; i < s.n; i++) if (i !== w) { pts[i] = -tot[i]; pts[w] += tot[i]; }
    for (let i = 0; i < s.n; i++) s.scores[i] += pts[i];
    s.wins[w]++;
    s.res = { w, blocked, tot, pts, racks: s.racks.map(r => r.slice()), scores: s.scores.slice(), round: s.round };
    s.phase = 'between'; s.ready = Array(s.n).fill(false); s.deadline = 0;
    ev.push({ k: 'result', w, blocked });
    if (s.round >= s.cfg.rounds) {
      const mx = Math.max(...s.scores), ws = s.scores.map((v, i) => v === mx ? i : -1).filter(i => i >= 0);
      s.final = { w: ws, scores: s.scores.slice(), wins: s.wins.slice() };
      s.res.over = true; s.phase = 'over';
    }
  }
  function rkNext(s, ev) {
    s.turn = (s.turn + 1) % s.n; s.tn++;
    s.deadline = s.cfg.timer ? Date.now() + s.cfg.timer * 1000 : 0;
    ev.push({ k: 'turn', p: s.turn });
  }
  function rkDraw(s, p, ev, n, pen) {
    const ids = [];
    for (let i = 0; i < n && s.pool.length; i++) { const id = s.pool.pop(); s.racks[p].push(id); ids.push(id); }
    ev.push({ k: pen ? 'pen' : 'draw', p, ids });
    if (!ids.length) { s.passes++; ev.push({ k: 'pass', p }); } else s.passes = 0;
    if (!s.pool.length && s.passes >= s.n) {
      const tot = s.racks.map(rkTotal), mn = Math.min(...tot);
      let w = -1;
      for (let i = 0; i < s.n; i++) if (tot[i] === mn && (w < 0 || s.racks[i].length < s.racks[w].length)) w = i;
      rkEnd(s, ev, w, true);
      return;
    }
    rkNext(s, ev);
  }
  function rkAct(s, p, a) {
    const ev = [];
    if (!a || typeof a.t !== 'string') return null;
    if (s.phase === 'between') {
      if (a.t !== 'ready' || s.ready[p]) return null;
      s.ready[p] = true;
      if (s.ready.every(Boolean)) rkDeal(s, ev);
      return { ev };
    }
    if (s.phase !== 'play' || s.turn !== p) return null;
    if (a.t === 'draw') { rkDraw(s, p, ev, 1, false); return { ev }; }
    if (a.t === 'pen') { if (!s.cfg.penalty) return null; rkDraw(s, p, ev, 3, true); return { ev }; }
    if (a.t === 'play') {
      const r = rkCheck(s, p, a.sets);
      if (!r.ok) { ev.push({ k: 'bad', p, err: r.err, bad: r.bad || [] }); return { ev, bad: true }; }
      const rk = s.racks[p], pl = new Set(r.played);
      s.racks[p] = rk.filter(x => !pl.has(x));
      s.table = r.sets; s.melded[p] = true; s.passes = 0;
      ev.push({ k: 'play', p, ids: r.played });
      if (!s.racks[p].length) { rkEnd(s, ev, p, false); return { ev }; }
      rkNext(s, ev);
      return { ev };
    }
    return null;
  }
  function rkTick(s, now) {
    if (s.phase !== 'play' || !s.deadline || now < s.deadline + 1200) return null;
    const ev = [{ k: 'timeout', p: s.turn }];
    rkDraw(s, s.turn, ev, 1, false);
    return { ev };
  }
  function rkView(s, p) {
    const rev = s.phase === 'between' || s.phase === 'over';
    const v = {
      seat: p, phase: s.phase, turn: s.turn, tn: s.tn, n: s.n, pool: s.pool.length, table: s.table.map(x => x.slice()), rack: s.racks[p].slice(),
      counts: s.racks.map(r => r.length), melded: s.melded.slice(), scores: s.scores.slice(), wins: s.wins.slice(), round: s.round, rounds: s.cfg.rounds,
      timer: s.cfg.timer, tl: s.deadline ? Math.max(0, s.deadline - Date.now()) : 0, penalty: s.cfg.penalty, ready: s.ready.slice(), final: s.final, starter: s.starter
    };
    if (rev && s.res) v.res = s.res;
    return v;
  }
  function rkFev(evs, p) {
    return evs.map(e => (e.k === 'draw' || e.k === 'pen') && e.p !== p ? Object.assign({}, e, { ids: e.ids.map(() => -1) }) : e);
  }
  function rkBot(s, p, lvl) {
    if (s.phase === 'between') return { t: 'ready' };
    if (s.phase !== 'play') return null;
    let sets = null;
    try { sets = rkPlan(s, p, lvl); } catch (e) { console.error(e); }
    if (sets && lvl === 'Easy' && Math.random() < .12) sets = null;
    if (sets) return { t: 'play', sets };
    return { t: 'draw' };
  }
  const rkWho = s => s.phase === 'between' ? s.ready.map((r, i) => r ? -1 : i).filter(i => i >= 0) : s.phase === 'over' ? [] : [s.turn];
  const rkShift = (s, dt) => { if (s.deadline) s.deadline += dt; };
  const RK_ENGINE = { create: rkCreate, act: rkAct, view: rkView, fev: rkFev, who: rkWho, bot: rkBot, tick: rkTick, shift: rkShift };

  const RK_COL = ['#23252c', '#1c5fd4', '#d8291f', '#ec8a00'];
  const RK_JOKER = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80"><circle cx="30" cy="38" r="21" fill="none" stroke="#d8291f" stroke-width="5"/><circle cx="22" cy="31" r="3.6" fill="#1d1e24"/><circle cx="38" cy="31" r="3.6" fill="#1d1e24"/><path d="M17.5 43c3 11 22 11 25 0" fill="none" stroke="#1d1e24" stroke-width="4.4" stroke-linecap="round"/><path d="M30 6l3 6 6-3-1 7M30 6l-3 6-6-3 1 7" fill="none" stroke="#ec8a00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')}")`;

  const rkCss = id => {
    const p = '.gm-' + id;
    return `
${p}{--f1:#2b5473;--f2:#10263a}
${p} .rk-tbl{position:absolute;border-radius:16px;background:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.28));box-shadow:inset 0 0 0 2px rgba(255,255,255,.08),inset 0 8px 24px rgba(0,0,0,.3);overflow:hidden}
${p} .rk-tbl::after{content:"RUMMIKUB";position:absolute;inset:0;display:grid;place-items:center;font:900 calc(var(--tw,40px)*1.5)/1 Georgia,serif;font-style:italic;letter-spacing:.06em;color:rgba(255,255,255,.035);pointer-events:none}
${p} .rk-tbl.empty::before{content:attr(data-hint);position:absolute;left:0;right:0;top:42%;text-align:center;font:800 14px var(--sans);color:rgba(255,255,255,.4);padding:0 18px}
${p} .rk-rack{position:absolute;border-radius:16px;background:linear-gradient(#efe7d0,#d6ccae 60%,#c4b88f);box-shadow:inset 0 3px 5px rgba(255,255,255,.65),inset 0 -7px 10px rgba(90,70,30,.35),0 10px 22px rgba(0,0,0,.42),0 0 0 2px rgba(80,60,20,.35)}
${p} .rk-slot{position:absolute;border-radius:calc(var(--tw)*.14);background:rgba(110,86,40,.16);box-shadow:inset 0 2px 3px rgba(70,50,10,.4),inset 0 -1px 0 rgba(255,255,255,.4)}
${p} .rk-lay{position:absolute;left:0;top:0;width:0;height:0;touch-action:none}
${p} .rk-t{position:absolute;left:0;top:0;width:var(--tw);height:var(--th);border-radius:calc(var(--tw)*.15);background:linear-gradient(160deg,#fffdf3 0%,#f6eed4 50%,#e9dcb6 100%);box-shadow:0 calc(var(--tw)*.07) 0 #b4a06c,0 calc(var(--tw)*.11) calc(var(--tw)*.16) rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.65),inset 0 -3px 4px rgba(150,120,60,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Arial Rounded MT Bold','Trebuchet MS',var(--sans);font-weight:900;font-size:calc(var(--tw)*.66);line-height:1;user-select:none;-webkit-user-select:none;cursor:grab;transform-origin:0 0;transition:transform .24s cubic-bezier(.2,.8,.25,1),opacity .2s,box-shadow .15s;will-change:transform;touch-action:none;z-index:3}
${p} .rk-t b{font-weight:900;letter-spacing:-.05em;margin-top:-.06em}
${p} .rk-t i{display:block;width:.24em;height:.24em;border:calc(var(--tw)*.055) solid currentColor;border-radius:50%;margin-top:.06em;box-sizing:border-box}
${p} .rk-t.c0{color:${RK_COL[0]}}${p} .rk-t.c1{color:${RK_COL[1]}}${p} .rk-t.c2{color:${RK_COL[2]}}${p} .rk-t.c3{color:${RK_COL[3]}}
${p} .rk-t.jk{background:linear-gradient(160deg,#fffdf3 0%,#f6eed4 50%,#e9dcb6 100%)}
${p} .rk-t.jk::before{content:"";position:absolute;inset:8% 6% 6%;background:${RK_JOKER} center/contain no-repeat}
${p} .rk-t.jk b,${p} .rk-t.jk i{display:none}
${p} .rk-t.in{z-index:2}
${p} .rk-t.drag{transition:none;z-index:60;cursor:grabbing;box-shadow:0 calc(var(--tw)*.07) 0 #b4a06c,0 calc(var(--tw)*.28) calc(var(--tw)*.4) rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.65)}
${p} .rk-t.sel{box-shadow:0 calc(var(--tw)*.07) 0 #b4a06c,0 0 0 3px #f2c34b,0 0 18px 4px rgba(242,195,75,.6)}
${p} .rk-t.nw::after{content:"";position:absolute;left:20%;right:20%;bottom:calc(var(--tw)*.07);height:max(3px,calc(var(--tw)*.07));border-radius:3px;background:#f2a900}
${p} .rk-t.lp{animation:rk-lp 1.8s ease-out 1}
@keyframes rk-lp{0%,40%{filter:drop-shadow(0 0 8px #ffe27a) brightness(1.1)}100%{filter:none}}
${p} .rk-t.shk{animation:rk-shk .4s}
@keyframes rk-shk{20%{margin-left:-5px}40%{margin-left:5px}60%{margin-left:-3px}80%{margin-left:3px}}
${p} .rk-trays{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}
${p} .rk-set{position:absolute;border-radius:calc(var(--tw)*.2);background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.14);transition:left .22s cubic-bezier(.2,.8,.25,1),top .22s cubic-bezier(.2,.8,.25,1),width .22s cubic-bezier(.2,.8,.25,1),height .22s,background .2s,box-shadow .2s;pointer-events:none}
${p} .rk-set.ok{background:rgba(120,230,150,.1);box-shadow:inset 0 0 0 1.5px rgba(130,235,160,.3)}
${p} .rk-set.part{background:rgba(255,200,90,.1);box-shadow:inset 0 0 0 1.5px rgba(255,205,110,.38)}
${p} .rk-set.bad{background:rgba(255,80,60,.16);box-shadow:inset 0 0 0 2px rgba(255,105,85,.7)}
${p} .rk-set.gap{background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 2px rgba(255,255,255,.55);border-radius:calc(var(--tw)*.2)}
${p} .rk-set.lock{background:rgba(255,255,255,.035)}
${p} .rk-set .gr{position:absolute;left:3px;top:50%;width:6px;height:36%;transform:translateY(-50%);border-radius:3px;background:repeating-linear-gradient(rgba(255,255,255,.35) 0 2px,transparent 2px 5px);opacity:.8}
${p} .rk-grip{position:absolute;z-index:4;cursor:grab;touch-action:none;display:none}
${p} .rk-top{position:absolute;display:flex;gap:6px;justify-content:center;align-items:stretch;z-index:5;pointer-events:none}
${p} .rk-pl{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border-radius:14px;background:rgba(0,0,0,.34);border:2px solid rgba(255,255,255,.14);min-width:0;transition:border-color .2s,background .2s,box-shadow .2s;position:relative;overflow:hidden}
${p} .rk-pl.turn{border-color:var(--gold);background:rgba(40,34,10,.5);box-shadow:0 0 14px rgba(242,195,75,.35)}
${p} .rk-pl .gx-av{width:30px;height:30px;font-size:14px}
${p} .rk-pn{display:flex;flex-direction:column;min-width:0;line-height:1.15}
${p} .rk-pn b{font:800 12px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92px}
${p} .rk-pn small{font:800 11px var(--sans);color:rgba(255,255,255,.66);white-space:nowrap}
${p} .rk-pn small u{text-decoration:none;color:var(--gold)}
${p} .rk-pl.me .rk-pn b::after{content:" (you)";color:rgba(255,255,255,.5);font-weight:700}
${p} .rk-tm{position:absolute;left:0;bottom:0;height:3px;background:var(--gold);width:0;transition:width .25s linear}
${p} .rk-tm.lo{background:#ff6a4a}
${p} .rk-pool{position:absolute;z-index:5;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;background:rgba(0,0,0,.34);font:800 12px var(--sans);pointer-events:none;color:rgba(255,255,255,.9)}
${p} .rk-pool i{display:block;width:16px;height:21px;border-radius:3px;background:linear-gradient(160deg,#fffdf3,#e9dcb6);box-shadow:2px 2px 0 #b4a06c,4px 4px 0 #8f7f52}
${p} .rk-info{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:absolute;z-index:5;pointer-events:none;text-align:center;font:800 13px var(--sans);color:rgba(255,255,255,.86);text-shadow:0 1px 3px rgba(0,0,0,.7)}
${p} .rk-info.warn{color:#ffd04a}
${p} .rk-bar{position:absolute;z-index:6;display:flex;align-items:center;gap:6px}
${p} .rk-bar .sp{flex:1}
${p} .rk-b{min-height:36px;padding:0 12px;border-radius:12px;border:2px solid rgba(255,255,255,.26);background:rgba(0,0,0,.34);color:#fff;font:800 13px var(--sans);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
${p} .rk-b:hover:not(:disabled){background:rgba(255,255,255,.16)}
${p} .rk-b:disabled{opacity:.38;cursor:default}
${p} .rk-b svg{width:16px;height:16px}
${p} .rk-b.go{background:linear-gradient(#45c463,#1f8a3a);border-color:rgba(255,255,255,.7);box-shadow:inset 0 -3px 0 rgba(0,0,0,.2);font-size:14px;padding:0 16px}
${p} .rk-b.dr{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;border-color:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);font-size:14px;padding:0 16px}
${p} .rk-b.go:disabled{background:linear-gradient(#59705f,#3d5143);box-shadow:none}
${p} .rk-b.on{background:var(--gold);color:#1b1b1f}
${p} .rk-meld{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:10px;background:rgba(0,0,0,.34);font:800 12px var(--sans)}
${p} .rk-meld u{text-decoration:none;color:#ff9f8a}
${p} .rk-meld.ok u{color:#7be08e}
${p} .rk-fx{position:absolute;left:0;top:0;pointer-events:none;z-index:50}
${p} .rk-fl{position:absolute;left:0;top:0;border-radius:4px;background:linear-gradient(160deg,#fffdf3,#e9dcb6);box-shadow:0 3px 0 #b4a06c,0 6px 10px rgba(0,0,0,.4);transition:transform .55s cubic-bezier(.3,.7,.3,1),opacity .55s}
${p} .rk-mt{display:inline-grid;place-items:center;min-width:20px;height:25px;margin:1px;padding:0 1px;border-radius:4px;background:linear-gradient(160deg,#fffdf3,#e9dcb6);box-shadow:0 2px 0 #b4a06c;font:900 13px var(--sans)}
${p} .rk-mt.c0{color:${RK_COL[0]}}${p} .rk-mt.c1{color:${RK_COL[1]}}${p} .rk-mt.c2{color:${RK_COL[2]}}${p} .rk-mt.c3{color:${RK_COL[3]}}
${p} .rk-mt.jk{background:#fff3c9 ${RK_JOKER} center/70% no-repeat;color:transparent}
${p} .rk-res td:nth-child(2){text-align:left;max-width:190px;line-height:1.2}
${p}.port .rk-b{padding:0 9px;min-height:34px;font-size:12px}
${p}.port .rk-bar{gap:4px}${p}.port .rk-meld{padding:4px 6px}${p}.port .rk-b[data-b=run],${p}.port .rk-b[data-b=grp]{padding:0 7px}
${p}.port .rk-pl{padding:3px 7px 3px 4px;gap:5px}
${p}.port .rk-pl .gx-av{width:26px;height:26px;font-size:12px}
${p}.port .rk-pn b{max-width:56px;font-size:11px}
${p}.port .rk-pn small{font-size:10px}
@media (prefers-reduced-motion:reduce){${p} .rk-t,${p} .rk-set{transition:none!important}}
`;
  };

  function rkUi(C) {
    const { api, stage, snd } = C;
    stage.innerHTML = '<div class="rk-tbl"></div><div class="rk-rack"></div><div class="rk-trays"></div><div class="rk-lay"></div><div class="rk-top"></div><div class="rk-pool"><i></i><span></span></div><div class="rk-info"></div><div class="rk-bar"></div><div class="rk-fx"></div>';
    const $ = s => stage.querySelector(s);
    const eTbl = $('.rk-tbl'), eRack = $('.rk-rack'), eTrays = $('.rk-trays'), eLay = $('.rk-lay'), eTop = $('.rk-top'), ePool = $('.rk-pool'), eInfo = $('.rk-info'), eBar = $('.rk-bar'), eFx = $('.rk-fx');
    const now = () => performance.now();
    let L = { W: 880, H: 550, port: false, tw: 0 };
    let V = null, D = { sets: [], locked: false }, snap = null, hist = [], slots = [], els = new Map(), drag = null, selId = -1, sortMode = '';
    let hints = new Map(), lastPlayed = new Set(), busyUntil = 0, deadAt = 0, lastTick = 0, lastSec = -1, resT = 0, finalShown = false, lockT = 0, scrollY = 0, tapT = 0, tapId = -1, lastSig = '';
    const mine = () => !!V && V.phase === 'play' && V.turn === V.seat && !D.locked;
    const clone = a => a.map(x => x.slice());
    const cls = id => (rkJ(id) ? 'jk' : 'c' + rkC(id));
    const tileHtml = id => (rkJ(id) ? '' : `<b>${rkN(id)}</b><i></i>`);

    function geom() {
      const { W, H, port } = L;
      const m = Math.max(8, Math.round(W * .016)), pad = 8, n = V ? V.rack.length : 14;
      const avail = W - 2 * m - 2 * pad;
      let tw, gap, cols;
      if (port) { cols = clamp(Math.round(avail / 33), 9, 12); gap = 2; tw = Math.floor((avail + gap) / cols) - gap; }
      else { tw = clamp(Math.floor(Math.min(W * .052, H * .11)), 26, 68); gap = Math.max(2, Math.round(tw * .07)); cols = Math.floor((avail + gap) / (tw + gap)); }
      const th = Math.round(tw * 1.34);
      const rows = Math.max(port ? 3 : 2, Math.ceil((n + 2) / cols));
      const rh = rows * (th + gap) - gap + 2 * pad, rack = { x: m, y: H - m - rh, w: W - 2 * m, h: rh };
      const inner = cols * (tw + gap) - gap, sx = rack.x + (rack.w - inner) / 2;
      const barH = port ? 40 : 44, barY = rack.y - barH - 5, topH = port ? 100 : 80;
      L = Object.assign(L, { m, pad, tw, th, gap, cols, rows, rack, sx, barH, barY, tbl: { x: m, y: topH, w: W - 2 * m, h: Math.max(60, barY - 6 - topH) } });
      const need = rows * cols;
      if (slots.length < need) while (slots.length < need) slots.push(null);
      else if (slots.length > need) { const extra = slots.slice(need).filter(x => x != null); slots.length = need; extra.forEach(id => { const i = slots.indexOf(null); if (i >= 0) slots[i] = id; }); }
    }
    const slotPos = i => ({ x: L.sx + (i % L.cols) * (L.tw + L.gap), y: L.rack.y + L.pad + Math.floor(i / L.cols) * (L.th + L.gap) });

    function flow(sets, gap, k) {
      const T = L.tbl, tw = L.tw * k, th = L.th * k, st = tw + Math.max(1, tw * .04), hw = 9, tp = Math.max(3, tw * .12), sg = Math.max(8, tw * .38);
      const items = [];
      sets.forEach((s, i) => { if (s.length || (gap && gap.set === i)) items.push({ i, ids: s.slice() }); });
      if (gap) {
        if (gap.k === 'set') { const it = items.find(x => x.i === gap.set); if (it) it.ids.splice(gap.at, 0, null); else items.push({ i: gap.set, ids: [null] }); }
        else { const pos = items.findIndex(x => x.i >= gap.at); items.splice(pos < 0 ? items.length : pos, 0, { i: -1, ids: [null], g: 1 }); }
      }
      const x0 = T.x + 8, trays = [];
      let x = x0, y = T.y + 8 - scrollY, row = 0, bottom = y;
      const hh = th + 2 * tp, rowH = hh + 9;
      for (const it of items) {
        const w = hw + tp + it.ids.length * st - (st - tw) + tp;
        if (x + w > T.x + T.w - 8 && x > x0 + 1) { x = x0; y += rowH; row++; }
        const tr = { i: it.i, g: it.g, x, y, w, h: hh, row, tiles: [] };
        it.ids.forEach((id, j) => { if (id != null) tr.tiles.push({ id, x: x + hw + tp + j * st, y: y + tp }); });
        trays.push(tr);
        x += w + sg; bottom = Math.max(bottom, y + hh);
      }
      return { k, tw, th, st, sg, trays, rowH, content: bottom + scrollY - T.y + 8 };
    }
    function tableLayout(sets, gap) {
      const T = L.tbl;
      let r = null;
      for (let k = 1.12; k >= .52; k -= .04) { r = flow(sets, gap, k); if (r.content <= T.h) return r; }
      return r;
    }
    const canTouchSet = i => !!V && (V.melded[V.seat] || (D.sets[i] || []).every(id => !snapIds().has(id)));
    let snapSet = null;
    const snapIds = () => { if (!snapSet) { snapSet = new Set(); (snap ? snap.sets : []).forEach(s => s.forEach(x => snapSet.add(x))); } return snapSet; };
    const placedIds = () => { const o = []; D.sets.forEach(s => s.forEach(id => { if (!snapIds().has(id)) o.push(id); })); return o; };
    const canRack = id => !snapIds().has(id);

    function tileEl(id) {
      let e = els.get(id);
      if (!e) {
        e = el('div', 'rk-t ' + cls(id), tileHtml(id)); e.dataset.id = id; e._fresh = true;
        eLay.append(e); els.set(id, e);
      }
      return e;
    }
    const chipRect = s => {
      const c = eTop.querySelector(`[data-s="${s}"]`) || ePool, r = c.getBoundingClientRect(), b = stage.getBoundingClientRect();
      return { x: r.left - b.left + r.width / 2 - L.tw / 2, y: r.top - b.top + r.height / 2 - L.th / 2 };
    };
    const poolRect = () => { const r = ePool.getBoundingClientRect(), b = stage.getBoundingClientRect(); return { x: r.left - b.left + 8 - L.tw / 2, y: r.top - b.top + r.height / 2 - L.th / 2 }; };

    function setInfo(s) {
      if (s.length < 3) return s.length ? 'part' : '';
      return rkSet(s) ? 'ok' : 'bad';
    }

    function render() {
      if (!V || !L.tw) return;
      const dr = drag && drag.started ? drag : null;
      const tl = tableLayout(D.sets, dr ? dr.gap : null);
      L.tl = tl;
      const myTurn = mine();
      const pos = new Map();
      slots.forEach((id, i) => { if (id != null && !(dr && dr.ids.includes(id))) { const q = slotPos(i); pos.set(id, { x: q.x, y: q.y, s: 1, z: 2 }); } });
      tl.trays.forEach(t => t.tiles.forEach(tt => pos.set(tt.id, { x: tt.x, y: tt.y, s: tl.k, z: 3 })));
      if (dr) dr.ids.forEach((id, j) => pos.set(id, { x: dr.gx - dr.ox + dr.offs[j].x, y: dr.gy - dr.oy - dr.lift + dr.offs[j].y, s: dr.sc, z: 60, drag: 1 }));
      const placed = new Set(placedIds());
      const sig = L.tw + ',' + L.W;
      pos.forEach((q, id) => {
        const e = tileEl(id), tr = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px) scale(${q.s.toFixed(3)})`;
        if (e._fresh) {
          e._fresh = false;
          const h = hints.get(id);
          if (h && !reduced()) {
            e.style.transition = 'none'; e.style.opacity = '0';
            e.style.transform = `translate(${h.x.toFixed(1)}px,${h.y.toFixed(1)}px) scale(${(h.s || .5)})`;
            void e.offsetWidth;
            e.style.transition = ''; e.style.transitionDelay = (h.d || 0) + 'ms'; e.style.opacity = '';
            const d = h.d || 0; setTimeout(() => { e.style.transitionDelay = ''; }, d + 500);
          } else { e.style.transition = 'none'; e.style.transform = tr; void e.offsetWidth; e.style.transition = ''; }
        }
        if (e._tr !== tr) { e.style.transform = tr; e._tr = tr; }
        if (e._z !== q.z) { e.style.zIndex = q.z; e._z = q.z; }
        const on = (c, v) => { if (e['_' + c] !== v) { e.classList.toggle(c, v); e['_' + c] = v; } };
        on('drag', !!q.drag); on('sel', selId === id); on('nw', placed.has(id)); on('lp', lastPlayed.has(id));
      });
      els.forEach((e, id) => { if (!pos.has(id)) { e.remove(); els.delete(id); } });
      hints = new Map();
      const trayItems = tl.trays.map((t, n) => {
        const info = t.g ? 'gap' : setInfo(D.sets[t.i] || []);
        const lock = !t.g && !!V && !V.melded[V.seat] && myTurn && !canTouchSet(t.i);
        return { k: t.g ? 'g' : 's' + t.i, cls: 'rk-set ' + info + (lock ? ' lock' : ''), t, html: t.g ? '' : '<span class="gr"></span>' };
      });
      syncKeyed(eTrays, trayItems.map(x => ({ k: x.k, cls: x.cls, html: x.html, upd(e) { const t = x.t; e.style.left = t.x + 'px'; e.style.top = t.y + 'px'; e.style.width = t.w + 'px'; e.style.height = t.h + 'px'; if (e._fresh) { e._fresh = false; e.style.transition = 'none'; void e.offsetWidth; e.style.transition = ''; } } })));
      drawGrips(tl);
      if (L.tbl) {
        const has = D.sets.some(s => s.length);
        eTbl.classList.toggle('empty', !has && !(dr && dr.gap));
        eTbl.dataset.hint = myTurn ? (V.melded[V.seat] ? 'Drag tiles here to make a new set' : 'Make a first meld of at least 30 points') : '';
      }
      updateBar();
    }

    function drawGrips(tl) {
      let g = eLay.parentNode.querySelectorAll('.rk-grip');
      const want = mine() && !(drag && drag.started) ? tl.trays.filter(t => !t.g && canTouchSet(t.i)) : [];
      g.forEach((e, i) => { if (i >= want.length) e.remove(); });
      g = eLay.parentNode.querySelectorAll('.rk-grip');
      want.forEach((t, i) => {
        let e = g[i];
        if (!e) { e = el('div', 'rk-grip'); eLay.parentNode.insertBefore(e, eLay.nextSibling); }
        e.style.display = 'block'; e.style.left = t.x + 'px'; e.style.top = t.y + 'px'; e.style.width = '14px'; e.style.height = t.h + 'px'; e.dataset.set = t.i;
      });
    }

    function meldPts() {
      let pts = 0;
      D.sets.forEach(s => {
        if (!s.length || s.some(id => snapIds().has(id))) return;
        const r = rkSet(s); if (r) pts += r.pts;
      });
      return pts;
    }

    function updateBar() {
      const my = mine(), v = V;
      const placed = placedIds().length, dirty = hist.length > 0 || placed > 0;
      const bad = D.sets.some(s => s.length && !rkSet(s));
      const I = { undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>', reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>' };
      const meld = my && !v.melded[v.seat] ? meldPts() : -1;
      const html = `<button class="rk-b ${sortMode === 'run' ? 'on' : ''}" data-b="run" title="Sort 1-2-3 (runs)">1-2-3</button><button class="rk-b ${sortMode === 'grp' ? 'on' : ''}" data-b="grp" title="Sort 7-7-7 (groups)">7-7-7</button>`
        + (meld >= 0 && placed ? `<span class="rk-meld ${meld >= RK_INIT ? 'ok' : ''}"><span class="lb">First meld </span><u>${meld}</u>/${RK_INIT}</span>` : '')
        + '<span class="sp"></span>'
        + (my ? `<button class="rk-b" data-b="undo" ${hist.length ? '' : 'disabled'} title="Undo (Z)">${I.undo}<span class="lb">Undo</span></button><button class="rk-b" data-b="reset" ${dirty ? '' : 'disabled'} title="Put everything back (R)">${I.reset}<span class="lb">Reset</span></button>` : '')
        + (my ? (placed ? `<button class="rk-b go" data-b="end" title="End turn (Enter)">End turn</button>` : `<button class="rk-b dr" data-b="draw" title="Draw (D)">${v.pool ? 'Draw tile' : 'Pass'}${v.pool ? ' <small>(' + v.pool + ')</small>' : ''}</button>`) : '');
      if (html !== lastSig) { eBar.innerHTML = html; lastSig = html; }
      eBar.querySelectorAll('.lb').forEach(x => { x.style.display = L.port ? 'none' : ''; });
      const turnName = C.name(v.turn);
      let info = '';
      if (v.phase === 'play') info = my ? (bad && placed ? (L.port ? 'Fix red sets' : 'Fix the highlighted sets, then end your turn') : v.melded[v.seat] ? 'Your turn' : (L.port ? 'Meld 30+ points' : 'Your turn: first meld needs 30+ points')) : (v.turn === v.seat ? '' : turnName + (C.isBot(v.turn) ? ' is thinking...' : ' is playing...'));
      eInfo.textContent = info; eInfo.classList.toggle('warn', my);
    }

    function layoutDom() {
      const { W, H, port, tbl, rack, barY, barH, m } = L;
      stage.style.setProperty('--tw', L.tw + 'px'); stage.style.setProperty('--th', L.th + 'px');
      const pos = (e, x, y, w, h) => { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w != null) { e.style.width = w + 'px'; e.style.height = h + 'px'; } };
      pos(eTbl, tbl.x, tbl.y, tbl.w, tbl.h); pos(eRack, rack.x, rack.y, rack.w, rack.h);
      pos(eBar, m, barY, W - 2 * m, barH);
      if (port) { pos(eTop, 8, 50, W - 16, 42); eTop.style.height = '42px'; pos(ePool, W - 96, 8, null); ePool.style.top = '10px'; ePool.style.left = 'auto'; ePool.style.right = '10px'; pos(eInfo, 100, 14, W - 214, 30); eInfo.style.left = '100px'; eInfo.style.width = (W - 212) + 'px'; }
      else { pos(eTop, 104, 8, W - 104 - 200, 44); eTop.style.height = '44px'; ePool.style.left = 'auto'; ePool.style.right = '10px'; ePool.style.top = '48px'; pos(eInfo, tbl.x, tbl.y + 8, tbl.w, 20); eInfo.style.top = '58px'; eInfo.style.width = tbl.w + 'px'; }
      eRack.innerHTML = '';
      for (let i = 0; i < L.rows * L.cols; i++) { const q = slotPos(i), s = el('div', 'rk-slot'); s.style.cssText = `left:${q.x - rack.x}px;top:${q.y - rack.y}px;width:${L.tw}px;height:${L.th}px`; eRack.append(s); }
    }
    function resize(W, H, port) {
      L.W = W; L.H = H; L.port = port;
      geom(); layoutDom(); drawTop();
      if (V) render();
    }

    function drawTop() {
      if (!V) { eTop.innerHTML = ''; return; }
      const v = V;
      eTop.innerHTML = Array.from({ length: v.n }, (_, i) => {
        const cnt = v.counts[i];
        return `<div class="rk-pl ${i === v.turn && v.phase === 'play' ? 'turn' : ''} ${i === v.seat ? 'me' : ''}" data-s="${i}">${C.avatar(i)}<span class="rk-pn"><b>${esc(C.name(i))}</b><small>${cnt} tile${cnt === 1 ? '' : 's'}${v.rounds > 1 || v.scores[i] ? ' · <u>' + v.scores[i] + '</u>' : ''}${v.melded[i] ? ' · ✓' : ''}</small></span><span class="rk-tm"></span></div>`;
      }).join('');
      ePool.lastChild.textContent = 'Pool ' + v.pool;
    }

    function fitSlots() {
      const have = new Set(V.rack);
      slots = slots.map(id => (id != null && have.has(id) ? id : null));
      const inSlots = new Set(slots.filter(x => x != null));
      const onTable = new Set(); D.sets.forEach(s => s.forEach(x => onTable.add(x)));
      for (const id of V.rack) if (!inSlots.has(id) && !onTable.has(id)) { const i = slots.indexOf(null); if (i >= 0) slots[i] = id; else slots.push(id); }
    }
    function sortRack(mode) {
      const ids = slots.filter(x => x != null);
      const key = id => rkJ(id) ? 1e6 : mode === 'run' ? rkC(id) * 20 + rkN(id) : rkN(id) * 10 + rkC(id);
      ids.sort((a, b) => key(a) - key(b) || a - b);
      const out = Array(slots.length).fill(null);
      const spare = out.length - ids.length;
      let groups = 0, last = null;
      ids.forEach(id => { const g = rkJ(id) ? 'j' : mode === 'run' ? rkC(id) : rkN(id); if (last !== null && g !== last) groups++; last = g; });
      const gaps = groups <= spare - 0 && L.cols * L.rows >= ids.length + groups;
      let i = 0; last = null;
      ids.forEach(id => {
        const g = rkJ(id) ? 'j' : mode === 'run' ? rkC(id) : rkN(id);
        if (gaps && last !== null && g !== last && i % L.cols !== 0) i++;
        out[i++] = id; last = g;
      });
      slots = out;
    }
    function snapshot() { return JSON.stringify({ s: D.sets, k: slots }); }
    function restore(str) { const o = JSON.parse(str); D.sets = o.s; slots = o.k; }
    function pushHist() { hist.push(snapshot()); if (hist.length > 80) hist.shift(); }
    function normalize() {
      D.sets = D.sets.filter(s => s.length).map(s => { const r = rkSet(s); return r ? r.order : s; });
    }
    function initDraft(v, spawn) {
      D = { sets: clone(v.table), locked: false };
      snap = { sets: clone(v.table), slots: null }; snapSet = null; hist = []; selId = -1;
      fitSlots();
      if (sortMode && v.turn !== v.seat) sortRack(sortMode);
      snap.slots = slots.slice();
    }
    function revertDraft(sound) {
      if (!snap) return;
      D.sets = clone(snap.sets); slots = snap.slots.slice(); hist = []; selId = -1;
      fitSlots();
      if (sound) snd.play('snap');
    }

    function placeSlot(id, at) {
      if (slots[at] == null) { slots[at] = id; return; }
      let j = -1, bd = 1e9;
      for (let k = 0; k < slots.length; k++) if (slots[k] == null) { const d = Math.abs(k - at) + (Math.floor(k / L.cols) !== Math.floor(at / L.cols) ? 6 : 0); if (d < bd) { bd = d; j = k; } }
      if (j < 0) { slots.push(null); j = slots.length - 1; }
      if (j > at) for (let k = j; k > at; k--) slots[k] = slots[k - 1];
      else for (let k = j; k < at; k++) slots[k] = slots[k + 1];
      slots[at] = id;
    }
    function removeFrom(src, ids) {
      if (src.k === 'rack') ids.forEach(id => { const i = slots.indexOf(id); if (i >= 0) slots[i] = null; });
      else { const s = D.sets[src.si]; ids.forEach(id => { const i = s.indexOf(id); if (i >= 0) s.splice(i, 1); }); }
    }
    function putBack(src, ids) {
      if (src.k === 'rack') { ids.forEach((id, j) => { if (slots[src.slot + j] == null && !slots.includes(id)) slots[src.slot + j] = id; else placeSlot(id, src.slot); }); }
      else { const s = D.sets[src.si]; s.splice(clamp(src.ti, 0, s.length), 0, ...ids); }
    }

    function dropAt(gx, gy, bs) {
      const R = L.rack, T = L.tbl;
      if (gx >= R.x - 6 && gx <= R.x + R.w + 6 && gy >= R.y - 12 && gy <= R.y + R.h + 8) {
        let best = 0, bd = 1e9;
        for (let i = 0; i < slots.length; i++) { const q = slotPos(i), d = Math.hypot(gx - (q.x + L.tw / 2), gy - (q.y + L.th / 2)); if (d < bd) { bd = d; best = i; } }
        return { k: 'rack', slot: best };
      }
      if (gx >= T.x && gx <= T.x + T.w && gy >= T.y - 14 && gy <= T.y + T.h) {
        const base = bs || (drag && drag.base) || L.tl;
        let hit = null, hd = 1e9;
        const mg = Math.max(base.sg / 2, base.tw * .5);
        for (const tr of base.trays) {
          if (tr.g || !canTouchSet(tr.i)) continue;
          const dx = Math.max(tr.x - gx, 0, gx - (tr.x + tr.w));
          if (dx <= mg && gy >= tr.y - 6 && gy <= tr.y + tr.h + 6 && dx < hd) { hd = dx; hit = tr; }
        }
        if (hit) {
          let at = 0;
          hit.tiles.forEach(t => { if (gx > t.x + base.tw / 2) at++; });
          return { k: 'set', set: hit.i, at };
        }
        let at = D.sets.length;
        for (const tr of base.trays) {
          if (tr.g) continue;
          if (gy < tr.y - 6 || (gy <= tr.y + tr.h + 6 && gx < tr.x + tr.w / 2)) { at = tr.i; break; }
        }
        return { k: 'new', at };
      }
      return null;
    }
    const sameT = (a, b) => (!a && !b) || (a && b && a.k === b.k && a.set === b.set && a.at === b.at && a.slot === b.slot);
    function apply(ids, tgt, src) {
      if (tgt.k === 'rack') {
        if (ids.some(id => !canRack(id))) { C.toast('Tiles from the table cannot go back to your rack'); snd.play('error'); return false; }
        let at = tgt.slot;
        ids.forEach(id => { placeSlot(id, at); at = Math.min(slots.length - 1, slots.indexOf(id) + 1); });
      } else if (tgt.k === 'set') D.sets[tgt.set].splice(tgt.at, 0, ...ids);
      else D.sets.splice(tgt.at, 0, ids.slice());
      return true;
    }
    function dropDrag(dg) {
      const tgt = dropAt(dg.gx, dg.gy - dg.lift, dg.base);
      let ok = false;
      if (tgt && (tgt.k === 'rack' || mine()) && apply(dg.ids, tgt, dg.src)) {
        ok = true; hist.push(dg.before); if (hist.length > 80) hist.shift();
        if (tgt.k === 'rack' || dg.src.k === 'rack') { if (sortMode) { sortMode = ''; lastSig = ''; } }
        snd.play(tgt.k === 'rack' ? 'pick' : 'place');
      }
      if (!ok) { putBack(dg.src, dg.ids); snd.play('pick'); }
      normalize();
    }

    function splitAt(si, ti) {
      const s = D.sets[si];
      if (!s || ti <= 0 || ti >= s.length) return;
      pushHist();
      D.sets.splice(si, 1, s.slice(0, ti), s.slice(ti));
      normalize(); snd.play('snap'); render();
    }

    function pt(e) { const b = stage.getBoundingClientRect(), sx = b.width / stage.offsetWidth || 1; return { x: (e.clientX - b.left) / sx, y: (e.clientY - b.top) / sx }; }
    function findTile(id) {
      const i = slots.indexOf(id);
      if (i >= 0) return { k: 'rack', slot: i };
      for (let si = 0; si < D.sets.length; si++) { const ti = D.sets[si].indexOf(id); if (ti >= 0) return { k: 'set', si, ti }; }
      return null;
    }
    api.on(stage, 'pointerdown', e => {
      if (!V || D.locked || C.paneOpen() || (e.pointerType === 'mouse' && e.button !== 0)) return;
      snd.unlock();
      const p = pt(e);
      const gripEl = e.target.closest('.rk-grip');
      if (gripEl && mine()) {
        const si = +gripEl.dataset.set, ids = D.sets[si].slice(), tl = L.tl, tr = tl.trays.find(t => t.i === si);
        if (!tr) return;
        drag = { id: ids[0], ids, src: { k: 'setall', si, ti: 0 }, sx: p.x, sy: p.y, gx: p.x, gy: p.y, pid: e.pointerId, started: false, whole: true, offs: tr.tiles.map(t => ({ x: t.x - tr.tiles[0].x, y: t.y - tr.tiles[0].y })), ox: p.x - tr.tiles[0].x, oy: p.y - tr.tiles[0].y, sc: tl.k, lift: 0 };
        e.preventDefault(); return;
      }
      const te = e.target.closest('.rk-t');
      if (!te) {
        if (selId >= 0 && mine()) tapDrop(p);
        else if (L.tl && L.tl.content > L.tbl.h && p.y > L.tbl.y && p.y < L.tbl.y + L.tbl.h) drag = { scroll: true, sy: p.y, s0: scrollY, pid: e.pointerId, started: true };
        return;
      }
      const id = +te.dataset.id, src = findTile(id);
      if (!src) return;
      const onTable = src.k === 'set';
      if (onTable && !mine()) return;
      if (onTable && !(V.melded[V.seat] || !snapIds().has(id) || false)) { C.toast('Make your first meld of 30 points before touching the table'); snd.play('error'); te.classList.remove('shk'); void te.offsetWidth; te.classList.add('shk'); return; }
      const q = onTable ? (() => { const tr = L.tl.trays.find(t => t.i === src.si); const t = tr && tr.tiles.find(x => x.id === id); return t || { x: p.x, y: p.y }; })() : slotPos(src.slot);
      const sc = onTable ? L.tl.k : 1;
      const gsc = Math.max(sc, 1) * 1.08;
      drag = { id, ids: [id], src, sx: p.x, sy: p.y, gx: p.x, gy: p.y, pid: e.pointerId, started: false, offs: [{ x: 0, y: 0 }], ox: (p.x - q.x) * (gsc / sc), oy: (p.y - q.y) * (gsc / sc), sc: gsc, lift: e.pointerType === 'touch' ? L.th * .9 : 0 };
      e.preventDefault();
    });
    function startDrag() {
      const dg = drag;
      dg.started = true; dg.before = snapshot();
      if (dg.whole) { removeFrom({ k: 'set', si: dg.src.si }, dg.ids); dg.src = { k: 'set', si: dg.src.si, ti: 0 }; }
      else removeFrom(dg.src, dg.ids);
      dg.base = tableLayout(D.sets, null);
      dg.gap = null; selId = -1;
      snd.play('pick');
    }
    api.on(stage, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.pid) return;
      const p = pt(e);
      if (drag.scroll) { scrollY = clamp(drag.s0 + (drag.sy - p.y), 0, Math.max(0, L.tl.content - L.tbl.h)); render(); return; }
      drag.gx = p.x; drag.gy = p.y;
      if (!drag.started) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) < (e.pointerType === 'touch' ? 9 : 5)) return;
        startDrag();
        try { stage.setPointerCapture(e.pointerId); } catch (x) {}
      }
      const dg = drag;
      const tgt = dropAt(dg.gx, dg.gy - dg.lift, dg.base);
      let gap = null;
      if (tgt && tgt.k !== 'rack') gap = tgt;
      if (!sameT(gap, dg.gap)) { dg.gap = gap; }
      render();
      e.preventDefault();
    });
    function endDrag(e, cancel) {
      if (!drag || (e && e.pointerId !== drag.pid)) return;
      const dg = drag; drag = null;
      try { stage.releasePointerCapture(dg.pid); } catch (x) {}
      if (dg.scroll) return;
      if (!dg.started) { if (!cancel) tapTile(dg, e); return; }
      if (cancel) { putBack(dg.src, dg.ids); normalize(); render(); return; }
      dropDrag(dg);
      render();
    }
    api.on(stage, 'pointerup', e => endDrag(e));
    api.on(stage, 'pointercancel', e => endDrag(e, true));
    api.on(stage, 'wheel', e => {
      if (!L.tl || L.tl.content <= L.tbl.h) return;
      const p = pt(e);
      if (p.y < L.tbl.y || p.y > L.tbl.y + L.tbl.h) return;
      e.preventDefault(); scrollY = clamp(scrollY + e.deltaY, 0, L.tl.content - L.tbl.h); render();
    }, { passive: false });
    api.on(stage, 'contextmenu', e => {
      const te = e.target.closest('.rk-t');
      if (te && mine()) { e.preventDefault(); const f = findTile(+te.dataset.id); if (f && f.k === 'set' && (V.melded[V.seat] || !snapIds().has(+te.dataset.id))) splitAt(f.si, f.ti); }
    });

    function tapDrop(p) {
      if (selId < 0) return;
      const src = findTile(selId); if (!src) { selId = -1; return; }
      const tgt = dropAt(p.x, p.y);
      if (!tgt || (tgt.k !== 'rack' && !mine())) { selId = -1; render(); return; }
      const before = snapshot();
      removeFrom(src, [selId]);
      if (apply([selId], tgt, src)) { hist.push(before); snd.play(tgt.k === 'rack' ? 'pick' : 'place'); } else putBack(src, [selId]);
      selId = -1; normalize(); render();
    }
    function tapTile(dg, e) {
      const id = dg.id, t = now();
      if (selId >= 0 && selId !== id) { tapDrop(pt(e)); return; }
      const f = findTile(id);
      if (f && f.k === 'set' && mine() && tapId === id && t - tapT < 380) {
        tapId = -1; selId = -1;
        if (V.melded[V.seat] || !snapIds().has(id)) splitAt(f.si, f.ti);
        return;
      }
      tapId = id; tapT = t;
      if (selId === id) selId = -1; else { selId = id; snd.play('select'); }
      render();
    }

    function doDraw() {
      if (!mine()) return;
      revertDraft(false);
      D.locked = true; clearTimeout(lockT); lockT = setTimeout(() => { D.locked = false; render(); }, 2500);
      C.act({ t: 'draw' }); render();
    }
    function endTurn() {
      if (!mine()) return;
      if (!placedIds().length) { doDraw(); return; }
      normalize();
      const fake = { table: V.table, racks: { [V.seat]: V.rack }, melded: V.melded };
      const r = rkCheck(fake, V.seat, D.sets);
      if (!r.ok) {
        snd.play('bad'); C.toast(r.err, 2600);
        const bad = new Set(); D.sets.forEach(s => { if (s.length && !rkSet(s)) s.forEach(id => bad.add(id)); });
        bad.forEach(id => { const e = els.get(id); if (e) { e.classList.remove('shk'); void e.offsetWidth; e.classList.add('shk'); } });
        render(); return;
      }
      D.locked = true; clearTimeout(lockT); lockT = setTimeout(() => { D.locked = false; render(); }, 2500);
      snd.play('lay');
      C.act({ t: 'play', sets: r.sets });
      render();
    }
    function undo() { if (!mine() || !hist.length) return; restore(hist.pop()); fitSlots(); snd.play('pick'); render(); }
    function reset() { if (!mine()) return; revertDraft(true); render(); }

    api.on(eBar, 'click', e => {
      const b = e.target.closest('[data-b]'); if (!b || b.disabled) return;
      snd.unlock();
      const k = b.dataset.b;
      if (k === 'run' || k === 'grp') { sortMode = sortMode === k ? '' : k; if (sortMode) { sortRack(sortMode); } snd.play('shuffle'); }
      else if (k === 'undo') return undo();
      else if (k === 'reset') return reset();
      else if (k === 'end') return endTurn();
      else if (k === 'draw') return doDraw();
      lastSig = ''; render();
    });
    api.on(window, 'keydown', e => {
      if (C.M.mode === 'title' || C.paneOpen() || !V || e.target.closest && e.target.closest('input,textarea')) return;
      const k = e.key.toLowerCase();
      if (k === 'enter') { e.preventDefault(); if (mine()) endTurn(); }
      else if (k === 'd' && mine() && !placedIds().length) doDraw();
      else if ((k === 'z' || k === 'backspace') && mine()) { e.preventDefault(); undo(); }
      else if (k === 'r' && mine()) reset();
      else if (k === 's') { sortMode = sortMode === 'run' ? 'grp' : sortMode === 'grp' ? '' : 'run'; if (sortMode) sortRack(sortMode); snd.play('shuffle'); lastSig = ''; render(); }
    });

    function showResult(v) {
      const res = v.res; if (!res) return;
      const over = v.phase === 'over', win = res.w === v.seat;
      const me = v.seat;
      const rows = Array.from({ length: v.n }, (_, i) => ({ i, p: res.pts[i], tot: res.scores[i], rack: res.racks[i], left: res.tot[i] })).sort((a, b) => (over ? b.tot - a.tot : a.i - b.i));
      const mt = id => rkJ(id) ? '<i class="rk-mt jk"></i>' : `<i class="rk-mt c${rkC(id)}">${rkN(id)}</i>`;
      const body = rows.map(r => `<tr class="${r.i === res.w ? 'win' : ''} ${r.i === me ? 'me' : ''}"><td>${esc(C.name(r.i))}${C.isBot(r.i) ? '' : ''}</td><td>${r.rack.length ? r.rack.slice().sort((a, b) => a - b).map(mt).join('') : '<span style="color:var(--gold)">out!</span>'}</td><td>${r.p > 0 ? '+' : ''}${r.p}</td><td>${r.tot}</td></tr>`).join('');
      let title, sub;
      if (over) {
        const w = v.final.w, iWin = w.includes(me);
        title = iWin ? (w.length > 1 ? 'You share the win!' : 'You win the game!') : C.name(w[0]) + ' wins the game';
        sub = v.rounds > 1 ? 'Final standings after ' + v.rounds + ' rounds' : 'Final scores';
        if (!finalShown) { finalShown = true; snd.play(iWin ? 'win' : 'lose'); if (iWin) api.submit(Math.max(1, v.scores[me])); }
      } else {
        title = win ? 'You went out!' : C.name(res.w) + (res.blocked ? ' wins the blocked round' : ' went out');
        sub = res.blocked ? 'The pool is empty and nobody can play: the lowest rack wins' : v.rounds > 1 ? 'Round ' + v.round + ' of ' + v.rounds : 'Tiles left count against you';
        snd.play(win ? 'win' : 'round');
      }
      const ready = v.ready[me];
      const foot = over ? C.endButtons() : (ready ? '<p>Waiting for the other players...</p>' : '<button class="gx-big g" data-a="ready">Next round</button>');
      C.showPane('res', `<div class="gx-box wide rk-res"><p class="gx-kick">${over ? 'Game over' : 'Round ' + v.round + ' result'}</p><h3>${esc(title)}</h3><p>${esc(sub)}</p><div style="overflow-x:auto"><table class="gx-tbl"><tr><th>Player</th><th>Tiles left</th><th>Round</th><th>Total</th></tr>${body}</table></div>${foot}</div>`, a => { if (a === 'ready') { C.act({ t: 'ready' }); showResult(V); } }, '');
    }

    function update(v, evs, info) {
      const prev = V; V = v;
      if (v.phase === 'over' && !C.M.over) C.over();
      const sync = info && info.sync;
      if (sync) { els.forEach(e => e.remove()); els.clear(); slots = []; D = { sets: [], locked: false }; snap = null; }
      const newRound = !prev || prev.round !== v.round || sync;
      const newTurn = newRound || prev.tn !== v.tn || prev.phase !== v.phase;
      const gk = L.rows * 100 + L.cols; geom();
      const relay = !eRack.children.length || L.rows * 100 + L.cols !== gk || eRack.children.length !== L.rows * L.cols;
      hints = new Map(); lastPlayed = new Set();
      const pr = poolRect();
      if (newRound) {
        if (!sync) { snd.play('shuffle'); finalShown = false; C.hidePane(); }
        v.rack.forEach((id, i) => hints.set(id, { x: pr.x, y: pr.y, s: .5, d: 60 + i * 55 }));
      }
      let dly = 0;
      (evs || []).forEach(ev => {
        if (sync) return;
        if (ev.k === 'play') {
          if (ev.p !== v.seat) {
            const cr = chipRect(ev.p);
            ev.ids.forEach((id, i) => { hints.set(id, { x: cr.x, y: cr.y, s: .4, d: i * 70 }); lastPlayed.add(id); });
            ev.ids.forEach((id, i) => api.timeout(() => snd.play('place'), 120 + i * 70));
            busyUntil = now() + 500 + ev.ids.length * 70;
          } else ev.ids.forEach(id => lastPlayed.add(id));
        } else if (ev.k === 'draw' || ev.k === 'pen') {
          if (ev.p === v.seat) ev.ids.forEach((id, i) => { if (id >= 0) hints.set(id, { x: pr.x, y: pr.y, s: .5, d: i * 120 }); });
          else flyTile(ev.p, ev.ids.length);
          snd.play('draw'); busyUntil = now() + 450;
        } else if (ev.k === 'timeout') { snd.play('warn'); if (ev.p === v.seat) C.toast('Time is up! A tile is drawn for you.', 2400); else C.toast(C.name(ev.p) + ' ran out of time', 1600); }
        else if (ev.k === 'first') C.toast(C.name(ev.w) + ' draws the highest tile and starts', 2200);
        else if (ev.k === 'bad' && ev.p === v.seat) { C.toast(ev.err || 'Invalid move', 2400); snd.play('bad'); }
        else if (ev.k === 'pass' && ev.p !== v.seat) C.toast(C.name(ev.p) + ' passes (pool is empty)', 1600);
      });
      if (newTurn || !D.sets.length && v.table.length) {
        if (v.turn === v.seat && prev && prev.turn !== v.seat && v.phase === 'play') snd.play('turn');
        initDraft(v);
      } else if (v.turn !== v.seat) { D.sets = clone(v.table); }
      scrollY = 0;
      deadAt = v.tl ? Date.now() + v.tl : 0; lastSec = -1;
      drawTop(); if (relay) layoutDom(); render();
      api.score(v.scores[v.seat]);
      clearTimeout(resT);
      if (v.phase !== 'play') resT = setTimeout(() => { if (api.alive && V && V.phase !== 'play') showResult(V); }, v.phase === 'over' || (info && info.sync) ? 1500 : 1400);
      if (v.phase === 'play' && C.paneKey() === 'res') C.hidePane();
    }
    function flyTile(seat, n) {
      if (reduced()) return;
      const a = poolRect(), b = chipRect(seat);
      for (let i = 0; i < Math.min(n, 3); i++) {
        const f = el('div', 'rk-fl'); f.style.width = L.tw * .6 + 'px'; f.style.height = L.th * .6 + 'px';
        f.style.transform = `translate(${a.x}px,${a.y}px)`; eFx.append(f);
        api.timeout(() => { f.style.transform = `translate(${b.x}px,${b.y}px) scale(.5)`; f.style.opacity = '0'; }, 20 + i * 140);
        api.timeout(() => f.remove(), 800 + i * 140);
      }
    }

    api.interval(() => {
      if (!V || V.phase !== 'play' || !deadAt) { stage.querySelectorAll('.rk-tm').forEach(t => { t.style.width = '0'; }); return; }
      const t = Date.now();
      if (api.paused) { deadAt += t - (lastTick || t); }
      lastTick = t;
      const left = deadAt - t, tot = V.timer * 1000, ch = eTop.querySelector(`[data-s="${V.turn}"] .rk-tm`);
      if (ch) { ch.style.width = Math.max(0, Math.min(100, left / tot * 100)) + '%'; ch.classList.toggle('lo', left < 10000); }
      const sec = Math.ceil(left / 1000);
      if (V.turn === V.seat && sec !== lastSec && sec <= 10 && sec > 0) { lastSec = sec; snd.play(sec <= 3 ? 'warn' : 'tick'); }
      if (V.turn === V.seat && left <= 0 && !D.locked) { D.locked = true; revertDraft(true); render(); }
    }, 250);

    return {
      begin() {
        V = null; D = { sets: [], locked: false }; snap = null; snapSet = null; hist = []; slots = []; selId = -1; drag = null; sortMode = '';
        els.forEach(e => e.remove()); els.clear(); eLay.innerHTML = ''; finalShown = false; scrollY = 0; lastSig = '';
        api.label('Points'); api.score(0);
        geom(); layoutDom();
      },
      update, resize,
      busy: () => now() < busyUntil || !!(drag && drag.started),
      destroy() { clearTimeout(resT); clearTimeout(lockT); }
    };
  }

  const rkLogo = () => `<div class="rk-lg">${[[1, 1], [2, 2], [0, 3], [3, 4]].map(([c, n], i) => `<i class="c${c}" style="transform:rotate(${(i - 1.5) * 7}deg) translateY(${Math.abs(i - 1.5) * 3}px)">${n}</i>`).join('')}<i class="jk" style="transform:rotate(14deg) translateY(5px)"></i></div><h2 class="rk-name">Rummi<span>kub</span></h2>`;
  const rkRules = `<h4>The goal</h4><p>Be the first to play every tile from your rack onto the table. When someone goes out, the others lose points for the tiles they still hold.</p>
<h4>The tiles</h4><p>106 tiles: the numbers 1 to 13 in four colours, twice, plus two jokers. Everyone starts with 14 tiles. The highest tile drawn at the start decides who plays first.</p>
<h4>Sets</h4><ul><li><b>Run</b>: 3 or more consecutive numbers of the same colour (4-5-6). 13 does not wrap to 1.</li><li><b>Group</b>: 3 or 4 tiles of the same number in different colours (7-7-7).</li><li>A <b>joker</b> stands for any tile. Take one from the table by replacing it with the tile it stands for, and use that joker in a set in the same turn.</li></ul>
<h4>Your turn</h4><ul><li>Play at least one tile from your rack, or draw one tile from the pool.</li><li>Your <b>first meld</b> must add up to 30 points or more using only tiles from your rack. You cannot touch the table before that.</li><li>After that you can rearrange the table freely: add to sets, split them, combine tiles from several sets, take jokers, as long as every set is valid when you end your turn and no table tile goes back to your rack.</li><li>If the table is not valid when you end your turn, the move is refused and you can fix it or undo. When the turn timer runs out everything snaps back and you draw a tile.</li></ul>
<h4>Scoring</h4><p>The winner scores the total of all the tiles left in the other racks, and each other player loses the total of their own rack. Number tiles are worth their number, a joker 30. When the pool is empty and nobody can play, the lowest rack wins. The highest total after the last round wins.</p>
<h4>Controls</h4><p>Drag tiles with the mouse or your finger: from the rack to the table, between sets, or back to the rack (only tiles you placed this turn). Drop a tile between two tiles of a set to insert it, or on an empty spot to start a new set. Drag the grip on the left of a set to move the whole set. <b>Double-tap</b> (or right-click) a tile to split its set there. You can also tap a tile, then tap where it goes. <kbd>Enter</kbd> end turn, <kbd>D</kbd> draw, <kbd>Z</kbd> undo, <kbd>R</kbd> reset, <kbd>S</kbd> sort.</p>`;

  const rkCoverTile = (x, y, w, h, fs, n, c) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="6" fill="#8f7f52" transform="translate(0 3)"/><rect width="${w}" height="${h}" rx="6" fill="url(#rkt)"/><text x="${w / 2}" y="${h * .68}" font-size="${fs}" fill="${c}">${n}</text></g>`;
  const rkCoverRow = (list, y, w, h, fs) => list.map(([x, n, c]) => rkCoverTile(x, y, w, h, n.length > 1 ? fs * .8 : fs, n, c)).join('');

  Ameplay.register({
    id: 'rummikub',
    title: 'Rummikub',
    category: 'Board',
    tint: '#e0852a',
    blurb: 'The tile-rummy classic: runs, groups, jokers and a 30-point first meld. Rearrange the whole table. Vs the computer or online.',
    help: 'Drag tiles to the table or between sets · double-tap a tile to split a set · <kbd>Enter</kbd> end turn <kbd>D</kbd> draw <kbd>Z</kbd> undo',
    width: 1000,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="14" width="22" height="30" rx="4"/><rect x="21" y="22" width="22" height="30" rx="4"/><rect x="36" y="12" width="22" height="30" rx="4"/><path d="M17 24v10M13 30h8M47 22v10"/></svg>',
    css: baseCss('rummikub') + rkCss('rummikub') + `
.gm-rummikub .rk-lg{display:flex;justify-content:center;gap:5px;margin:8px 0 6px;height:74px}
.gm-rummikub .rk-lg i{display:grid;place-items:center;width:48px;height:64px;border-radius:8px;background:linear-gradient(160deg,#fffdf3,#e9dcb6);box-shadow:0 3px 0 #b4a06c,0 6px 10px rgba(0,0,0,.4);font:900 36px/1 'Trebuchet MS',var(--sans);font-style:normal}
.gm-rummikub .rk-lg i.c0{color:${RK_COL[0]}}.gm-rummikub .rk-lg i.c1{color:${RK_COL[1]}}.gm-rummikub .rk-lg i.c2{color:${RK_COL[2]}}.gm-rummikub .rk-lg i.c3{color:${RK_COL[3]}}
.gm-rummikub .rk-lg i.jk{background:${RK_JOKER} center/75% auto no-repeat,linear-gradient(160deg,#fffdf3,#e9dcb6)}
.gm-rummikub .rk-name{margin:4px 0 4px;font:900 42px/1 Georgia,serif;font-style:italic;color:#fff;letter-spacing:-.5px;text-shadow:0 3px 0 rgba(0,0,0,.35)}
.gm-rummikub .rk-name span{color:var(--gold)}
`,
    mount(root, api) {
      const S = {
        id: 'rummikub', title: 'Rummikub',
        logo: rkLogo(), tagline: '2 to 4 players · 106 tiles · first meld 30', soloSub: 'Choose your opponents',
        rules: rkRules,
        defaults: { diff: 'Normal', opp: 1, rounds: 1, timer: 0 },
        options: [
          { k: 'opp', label: 'Opponents', solo: true, opts: [[1, '1'], [2, '2'], [3, '3']] },
          { k: 'diff', label: 'Computer', opts: [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']] },
          { k: 'rounds', label: 'Rounds', opts: [[1, '1'], [3, '3'], [5, '5']] },
          { k: 'timer', label: 'Turn timer', sub: 'Snaps back and draws', opts: [[0, 'Off'], [30, '30s'], [60, '60s'], [90, '90s'], [120, '2m']] }
        ],
        online: { sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true },
        opponents: o => clamp(+o.opp || 1, 1, 3),
        cfg: o => ({ rounds: +o.rounds || 1, timer: +o.timer || 0 }),
        create: rkCreate, act: rkAct, view: rkView, fev: rkFev, who: rkWho, bot: rkBot, tick: rkTick, shift: rkShift,
        score: (s, seat) => s.final ? Math.max(0, s.scores[seat]) : null,
        delay: (s, p) => s.phase === 'between' ? 250 : 900 + Math.random() * 900,
        ui: rkUi
      };
      const C = Core(api, root, S);
      C.start();
      return { destroy() { C.destroy(); } };
    }
  });

  Ameplay.covers['rummikub'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rkc" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#3a6d92"/><stop offset="1" stop-color="#0e2336"/></radialGradient><linearGradient id="rkt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf3"/><stop offset="1" stop-color="#e5d7ac"/></linearGradient><linearGradient id="rkr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe7d0"/><stop offset="1" stop-color="#b9ad86"/></linearGradient></defs><rect width="400" height="300" fill="url(#rkc)"/><g font-family="Trebuchet MS,Arial,sans-serif" font-weight="900" text-anchor="middle">${rkCoverRow([[20, '1', '#1c5fd4'], [68, '2', '#1c5fd4'], [116, '3', '#1c5fd4'], [164, '4', '#1c5fd4'], [240, '9', '#d8291f'], [288, '9', '#23252c'], [336, '9', '#ec8a00']], 30, 40, 54, 32)}${rkCoverRow([[44, '11', '#d8291f'], [92, '12', '#d8291f'], [140, '13', '#d8291f'], [240, '5', '#ec8a00'], [288, '5', '#1c5fd4']], 100, 40, 54, 32)}<g transform="translate(336 100)"><rect width="40" height="54" rx="6" fill="#8f7f52" transform="translate(0 3)"/><rect width="40" height="54" rx="6" fill="url(#rkt)"/><circle cx="20" cy="29" r="13" fill="none" stroke="#d8291f" stroke-width="3.5"/><circle cx="15" cy="25" r="2.4" fill="#1d1e24"/><circle cx="25" cy="25" r="2.4" fill="#1d1e24"/><path d="M11 32c2 8 16 8 18 0" fill="none" stroke="#1d1e24" stroke-width="3" stroke-linecap="round"/></g><rect x="30" y="190" width="340" height="86" rx="14" fill="url(#rkr)" stroke="#7a6a3a" stroke-width="2"/>${rkCoverRow([[44, '2', '#23252c'], [84, '6', '#1c5fd4'], [124, '6', '#ec8a00'], [164, '10', '#d8291f'], [204, '3', '#1c5fd4'], [244, '8', '#23252c'], [284, '12', '#ec8a00'], [324, '1', '#d8291f']], 206, 34, 46, 27)}</g></svg>`;

  const P10_COL = ['#d93a32', '#2f6fdb', '#2f9f58', '#f2b81a'];
  const P10_ERR = { Easy: .34, Normal: .1, Hard: 0 };
  const P10_CN = ['Red', 'Blue', 'Green', 'Yellow'];
  const P10_PH = [
    [['s', 3], ['s', 3]], [['s', 3], ['r', 4]], [['s', 4], ['r', 4]], [['r', 7]], [['r', 8]],
    [['r', 9]], [['s', 4], ['s', 4]], [['c', 7]], [['s', 5], ['s', 2]], [['s', 5], ['s', 3]]
  ];
  const P10_KN = { s: ['set', 'sets'], r: ['run', 'runs'], c: ['colour group', 'colour groups'] };
  const p10Desc = i => P10_PH[i - 1].map(([k, n]) => k === 'c' ? n + ' cards of one colour' : (k === 's' ? 'set' : 'run') + ' of ' + n).join(' + ');
  const p10Short = i => { const g = P10_PH[i - 1]; return g.length === 1 ? (g[0][0] === 'c' ? '7 of one colour' : 'Run of ' + g[0][1]) : g[0][0] === 's' && g[1][0] === 's' && g[0][1] === g[1][1] ? '2 sets of ' + g[0][1] : g.map(([k, n]) => (k === 's' ? 'Set ' : 'Run ') + n).join(' + '); };
  const p10Num = id => id < 96;
  const p10W = id => id >= 96 && id < 104;
  const p10S = id => id >= 104;
  const p10N = id => id < 96 ? ((id % 24) >> 1) + 1 : 0;
  const p10C = id => id < 96 ? (id / 24) | 0 : -1;
  const p10Pts = id => id < 96 ? (p10N(id) >= 10 ? 10 : 5) : id < 104 ? 25 : 15;
  const p10Sum = h => h.reduce((a, c) => a + p10Pts(c), 0);

  function p10Grp(kind, ids) {
    const nat = ids.filter(p10Num), w = ids.length - nat.length;
    if (ids.some(p10S) || !nat.length) return null;
    if (kind === 's') { const n = p10N(nat[0]); return nat.every(x => p10N(x) === n) ? { k: 's', ids: ids.slice(), n } : null; }
    if (kind === 'c') { const c = p10C(nat[0]); return nat.every(x => p10C(x) === c) ? { k: 'c', ids: ids.slice(), c } : null; }
    const ns = nat.map(p10N).sort((a, b) => a - b);
    if (new Set(ns).size !== ns.length) return null;
    const lo = ns[0], hi = ns[ns.length - 1], gaps = hi - lo + 1 - ns.length;
    if (gaps > w) return null;
    let left = w - gaps;
    const up = Math.min(left, 12 - hi);
    left -= up;
    if (left > lo - 1) return null;
    const start = lo - left, byN = new Map(nat.map(x => [p10N(x), x])), wl = ids.filter(p10W), out = [], vals = [];
    for (let v = start, wi = 0; v <= hi + up; v++) { out.push(byN.has(v) ? byN.get(v) : wl[wi++]); vals.push(v); }
    return { k: 'r', ids: out, vals };
  }
  function p10Sides(g, id) {
    if (p10S(id)) return [];
    if (g.k === 's') return p10W(id) || p10N(id) === g.n ? ['x'] : [];
    if (g.k === 'c') return p10W(id) || p10C(id) === g.c ? ['x'] : [];
    const lo = g.vals[0], hi = g.vals[g.vals.length - 1], out = [];
    if (g.ids.length >= 12) return out;
    if (p10W(id)) { if (hi < 12) out.push('hi'); if (lo > 1) out.push('lo'); return out; }
    const n = p10N(id);
    if (n === hi + 1) out.push('hi');
    if (n === lo - 1) out.push('lo');
    return out;
  }
  function p10Put(g, id, side) {
    if (g.k !== 'r') { g.ids.push(id); return; }
    if (side === 'lo') { g.ids.unshift(id); g.vals.unshift(g.vals[0] - 1); } else { g.ids.push(id); g.vals.push(g.vals[g.vals.length - 1] + 1); }
  }

  function p10Opts(kind, k, inv, used) {
    const out = [];
    if (kind === 's') {
      for (let n = 1; n <= 12; n++) {
        const av = inv.byN[n].filter(x => !used.has(x));
        if (av.length) { const u = Math.min(k, av.length); out.push({ pick: av.slice(0, u), wn: k - u }); }
      }
    } else if (kind === 'r') {
      for (let st = 13 - k; st >= 1; st--) {
        const pick = []; let wn = 0;
        for (let v = st; v < st + k; v++) { const a = inv.byN[v].find(x => !used.has(x)); if (a !== undefined) pick.push(a); else wn++; }
        if (pick.length) out.push({ pick, wn });
      }
    } else {
      for (let c = 0; c < 4; c++) {
        const av = inv.byC[c].filter(x => !used.has(x));
        if (av.length) { const u = Math.min(k, av.length); out.push({ pick: av.slice(0, u), wn: k - u }); }
      }
    }
    return out;
  }
  function p10Inv(ids) {
    const inv = { byN: Array.from({ length: 14 }, () => []), byC: [[], [], [], []], W: ids.filter(p10W) };
    ids.filter(p10Num).forEach(x => { inv.byN[p10N(x)].push(x); inv.byC[p10C(x)].push(x); });
    inv.byC.forEach(a => a.sort((x, y) => p10Pts(y) - p10Pts(x)));
    return inv;
  }
  function p10Solve(ids, ph, exact) {
    const R = P10_PH[ph - 1], inv = p10Inv(ids);
    let best = null;
    const go = (gi, used, wn, picks) => {
      if (gi === R.length) {
        const nat = used.size;
        if (exact && nat + wn !== ids.length) return;
        const pts = [...used].reduce((a, x) => a + p10Pts(x), 0), cost = wn * 1000 - pts;
        if (!best || cost < best.cost) best = { cost, picks: picks.map(p => p.slice()), wn: picks.map(p => p.wn) };
        return;
      }
      for (const o of p10Opts(R[gi][0], R[gi][1], inv, used)) {
        if (wn + o.wn > inv.W.length) continue;
        const u2 = new Set(used); o.pick.forEach(x => u2.add(x));
        const pk = o.pick.slice(); pk.wn = o.wn;
        picks.push(pk); go(gi + 1, u2, wn + o.wn, picks); picks.pop();
      }
    };
    go(0, new Set(), 0, []);
    if (!best) return null;
    let wi = 0;
    const groups = best.picks.map((pk, i) => {
      const g = pk.concat(inv.W.slice(wi, wi + best.wn[i])); wi += best.wn[i];
      return p10Grp(R[i][0], g) ? g : null;
    });
    return groups.some(g => !g) ? null : groups;
  }
  function p10Need(ids, ph) {
    const R = P10_PH[ph - 1], inv = p10Inv(ids), W = inv.W.length;
    let best = [99, 0];
    const go = (gi, used, wn) => {
      if (gi === R.length) {
        const nd = Math.max(0, wn - W), cov = used.size;
        if (nd < best[0] || (nd === best[0] && cov > best[1])) best = [nd, cov];
        return;
      }
      for (const o of p10Opts(R[gi][0], R[gi][1], inv, used)) {
        const u2 = new Set(used); o.pick.forEach(x => u2.add(x));
        go(gi + 1, u2, wn + o.wn);
      }
    };
    go(0, new Set(), 0);
    return best;
  }

  function p10Deal(s, ev) {
    const deck = shuffle(Array.from({ length: 108 }, (_, i) => i), s.R);
    s.hands = Array.from({ length: s.n }, () => deck.splice(0, 10));
    const top = deck.pop();
    s.disc = [top]; s.stock = deck;
    s.lay = Array(s.n).fill(null); s.skipped = Array(s.n).fill(0); s.ready = Array(s.n).fill(false);
    s.round++; s.res = null; s.phase = 'play'; s.stage = 'draw'; s.drew = null;
    const first = (s.dealer + 1) % s.n;
    s.turn = first;
    ev.push({ k: 'deal', round: s.round, dealer: s.dealer, top });
    if (p10S(top)) { s.skipped[first]++; ev.push({ k: 'skip', p: -1, to: first }); }
    p10Skips(s, ev);
    s.deadline = s.cfg.timer ? Date.now() + s.cfg.timer * 1000 : 0;
  }
  function p10Skips(s, ev) {
    while (s.skipped[s.turn] > 0) { s.skipped[s.turn]--; ev.push({ k: 'skipped', p: s.turn }); s.turn = (s.turn + 1) % s.n; }
  }
  function p10Create(cfg, n, R) {
    const s = { cfg: { last: cfg.last === 5 ? 5 : 10, timer: cfg.timer || 0 }, n, R, round: 0, scores: Array(n).fill(0), ph: Array(n).fill(1), dealer: Math.floor(R() * n), final: null };
    const ev = [];
    p10Deal(s, ev);
    s.ev0 = ev;
    return s;
  }
  function p10Next(s, ev) {
    s.turn = (s.turn + 1) % s.n; s.stage = 'draw'; s.drew = null;
    p10Skips(s, ev);
    ev.push({ k: 'turn', p: s.turn });
    s.deadline = s.cfg.timer ? Date.now() + s.cfg.timer * 1000 : 0;
  }
  function p10End(s, out, ev) {
    const pts = s.hands.map(h => p10Sum(h));
    const done = s.lay.map(l => !!l), was = s.ph.slice();
    s.scores = s.scores.map((x, i) => x + pts[i]);
    done.forEach((d, i) => { if (d) s.ph[i]++; });
    const fin = done.map((d, i) => d && was[i] >= s.cfg.last ? i : -1).filter(i => i >= 0);
    s.res = { w: out, hands: s.hands.map(h => h.slice()), pts, scores: s.scores.slice(), done, was, ph: s.ph.slice(), round: s.round };
    s.dealer = (s.dealer + 1) % s.n;
    if (fin.length) {
      const mn = Math.min(...fin.map(i => s.scores[i]));
      s.final = { w: fin.filter(i => s.scores[i] === mn), scores: s.scores.slice(), fin };
      s.phase = 'over';
    } else s.phase = 'between';
    s.deadline = 0;
    ev.push({ k: 'out', p: out });
    ev.push({ k: 'result' });
  }
  function p10Draw(s, p, ev, from) {
    let id;
    if (from === 'disc') {
      id = s.disc[s.disc.length - 1];
      if (id === undefined || p10S(id)) return false;
      s.disc.pop();
    } else {
      if (!s.stock.length) {
        if (s.disc.length < 2) return false;
        const top = s.disc.pop();
        s.stock = shuffle(s.disc, s.R); s.disc = [top];
        ev.push({ k: 'reshuffle' });
      }
      id = s.stock.pop();
    }
    s.hands[p].push(id); s.drew = { from, id }; s.stage = 'act';
    ev.push({ k: 'draw', p, from, id });
    return true;
  }
  function p10Discard(s, p, id, to, ev) {
    const h = s.hands[p], i = h.indexOf(id);
    if (i < 0) return null;
    if (p10S(id)) {
      if (!(to >= 0 && to < s.n) || (to === p && s.n > 1)) return false;
    }
    h.splice(i, 1); s.disc.push(id);
    ev.push({ k: 'disc', p, id });
    if (p10S(id)) { s.skipped[to]++; ev.push({ k: 'skip', p, to }); }
    if (!h.length) p10End(s, p, ev); else p10Next(s, ev);
    return true;
  }
  function p10Lay(s, p, a, ev) {
    if (s.lay[p]) return 'You already laid down this hand';
    const h = s.hands[p], R = P10_PH[s.ph[p] - 1];
    let groups = a.groups;
    if (!groups) {
      const sel = Array.isArray(a.sel) && a.sel.length ? a.sel : null;
      if (sel && (new Set(sel).size !== sel.length || sel.some(x => !h.includes(x)))) return 'Invalid selection';
      groups = p10Solve(sel || h, s.ph[p], !!sel);
      if (!groups) return sel ? 'Those cards do not make Phase ' + s.ph[p] + ': ' + p10Desc(s.ph[p]) : 'You cannot lay down Phase ' + s.ph[p] + ' yet';
    }
    if (!Array.isArray(groups) || groups.length !== R.length) return 'Invalid phase';
    const all = groups.flat();
    if (new Set(all).size !== all.length || all.some(x => !h.includes(x))) return 'Invalid cards';
    const built = groups.map((g, i) => (Array.isArray(g) && g.length === R[i][1] ? p10Grp(R[i][0], g) : null));
    if (built.some(b => !b)) return 'Those cards do not make Phase ' + s.ph[p] + ': ' + p10Desc(s.ph[p]);
    s.hands[p] = h.filter(x => !all.includes(x));
    s.lay[p] = { ph: s.ph[p], groups: built };
    ev.push({ k: 'lay', p, groups: built.map(g => JSON.parse(JSON.stringify(g))) });
    if (!s.hands[p].length) p10End(s, p, ev);
    return null;
  }
  function p10Hit(s, p, a, ev) {
    if (!s.lay[p]) return 'Lay down your phase first';
    const t = s.lay[a.p], g = t && t.groups[a.g], h = s.hands[p];
    if (!g || !h.includes(a.id)) return 'Invalid hit';
    const sides = p10Sides(g, a.id);
    if (!sides.length) return 'That card does not fit there';
    const side = sides.length > 1 && sides.includes(a.side) ? a.side : sides[0] === 'x' ? 'x' : sides.includes('hi') ? 'hi' : 'lo';
    s.hands[p] = h.filter(x => x !== a.id);
    p10Put(g, a.id, side);
    ev.push({ k: 'hit', p, id: a.id, to: a.p, g: a.g, side });
    if (!s.hands[p].length) p10End(s, p, ev);
    return null;
  }
  function p10Act(s, p, a) {
    const ev = [];
    if (!a || typeof a.t !== 'string') return null;
    if (s.phase === 'between') {
      if (a.t !== 'ready' || s.ready[p]) return null;
      s.ready[p] = true;
      if (s.ready.every(Boolean)) p10Deal(s, ev);
      return { ev };
    }
    if (s.phase !== 'play' || s.turn !== p) return null;
    s.pace = { draw: 650, lay: 950, hit: 420 }[a.t] || 750;
    if (a.t === 'draw') {
      if (s.stage !== 'draw') return null;
      if (!p10Draw(s, p, ev, a.from === 'disc' ? 'disc' : 'stock')) { ev.push({ k: 'bad', p, err: a.from === 'disc' ? 'A Skip cannot be taken from the discard pile' : 'No cards left to draw' }); return { ev, bad: true }; }
      return { ev };
    }
    if (s.stage !== 'act') return null;
    if (a.t === 'lay') {
      const err = p10Lay(s, p, a, ev);
      if (err) { ev.push({ k: 'bad', p, err }); return { ev, bad: true }; }
      return { ev };
    }
    if (a.t === 'hit') {
      const err = p10Hit(s, p, a, ev);
      if (err) { ev.push({ k: 'bad', p, err }); return { ev, bad: true }; }
      return { ev };
    }
    if (a.t === 'disc') {
      const r = p10Discard(s, p, a.id, a.to, ev);
      if (r === null) return null;
      if (!r) { ev.push({ k: 'bad', p, err: 'Choose who to skip' }); return { ev, bad: true }; }
      return { ev };
    }
    return null;
  }

  function p10Targets(s, p, id) {
    const out = [];
    if (!s.lay[p]) return out;
    for (let i = 0; i < s.n; i++) {
      const t = (p + i) % s.n;
      if (!s.lay[t]) continue;
      s.lay[t].groups.forEach((g, gi) => { const sd = p10Sides(g, id); if (sd.length) out.push({ p: t, g: gi, sides: sd }); });
    }
    return out;
  }
  function p10SkipTo(s, p, lvl) {
    const c = [];
    for (let i = 1; i < s.n; i++) c.push((p + i) % s.n);
    if (lvl === 'Easy' || (lvl === 'Normal' && s.R() < .5)) return c[Math.floor(s.R() * c.length)];
    const sc = i => (s.lay[i] ? 100 : 0) + s.ph[i] * 5 - s.hands[i].length - (s.skipped[i] || 0) * 50 - (c.indexOf(i) === 0 ? -3 : 0);
    return c.slice().sort((a, b) => sc(b) - sc(a))[0];
  }
  function p10Outs(s, p, rest, nd) {
    const ph = s.ph[p], seen = new Map(), bump = id => seen.set(id, 1);
    const cnt = { W: 0, N: Array(13).fill(0), C: Array(4).fill(0) };
    const add = id => { if (p10W(id)) cnt.W++; else if (p10Num(id)) { cnt.N[p10N(id)]++; cnt.C[p10C(id)]++; } };
    s.hands[p].forEach(add);
    s.lay.forEach(l => { if (l) l.groups.forEach(g => g.ids.forEach(add)); });
    const top = s.disc[s.disc.length - 1]; if (top !== undefined) add(top);
    let outs = 0;
    const col = P10_PH[ph - 1][0][0] === 'c';
    if (!col) {
      for (let n = 1; n <= 12; n++) { const left = 8 - cnt.N[n]; if (left <= 0) continue; if (p10Need(rest.concat(n * 2 - 2), ph)[0] < nd) outs += left; }
    } else {
      for (let c = 0; c < 4; c++) { const left = 24 - cnt.C[c]; if (left > 0 && p10Need(rest.concat(c * 24), ph)[0] < nd) outs += left; }
    }
    if (8 - cnt.W > 0 && p10Need(rest.concat(96), ph)[0] < nd) outs += 8 - cnt.W;
    return outs;
  }
  function p10Pick(s, p, lvl) {
    const H = s.hands[p], ph = s.ph[p], laid = !!s.lay[p];
    let pool = H.filter(x => !p10W(x));
    if (!pool.length) pool = H.slice();
    const sc = pool.map(id => {
      const rest = H.filter(x => x !== id);
      const [nd, cov] = laid ? [0, 0] : p10Need(rest, ph);
      return { id, nd, cov, pt: p10Pts(id), outs: 0 };
    });
    sc.sort((a, b) => a.nd - b.nd || b.cov - a.cov || b.pt - a.pt || a.id - b.id);
    if (lvl === 'Hard' && !laid && sc.length > 1) {
      const top = sc.filter(x => x.nd === sc[0].nd).slice(0, 4);
      if (top.length > 1 && sc[0].nd > 0) {
        top.forEach(x => { x.outs = p10Outs(s, p, H.filter(y => y !== x.id), x.nd); });
        top.sort((a, b) => b.outs - a.outs || b.cov - a.cov || b.pt - a.pt);
        return top[0].id;
      }
    }
    if (s.R() < P10_ERR[lvl]) return sc[Math.floor(s.R() * Math.min(3, sc.length))].id;
    return sc[0].id;
  }
  function p10Bot(s, p, lvl) {
    if (s.phase === 'between') return { t: 'ready' };
    if (s.phase !== 'play' || s.turn !== p) return null;
    const H = s.hands[p], ph = s.ph[p];
    if (s.stage === 'draw') {
      const top = s.disc[s.disc.length - 1];
      let take = false;
      if (top !== undefined && !p10S(top)) {
        if (s.lay[p]) take = p10Targets(s, p, top).length > 0;
        else if (p10Solve(H, ph, false)) take = false;
        else { const n0 = p10Need(H, ph), n1 = p10Need(H.concat(top), ph); take = n1[0] < n0[0] || (n1[0] === n0[0] && n1[1] > n0[1]) || p10W(top); }
        if (take && s.R() < P10_ERR[lvl] * 1.5) take = false;
      }
      return { t: 'draw', from: take ? 'disc' : 'stock' };
    }
    if (!s.lay[p]) {
      const g = p10Solve(H, ph, false);
      if (g) return { t: 'lay', groups: g };
    } else if (!(s.hands[p].length > 2 && s.R() < P10_ERR[lvl] * .6)) {
      const order = H.slice().sort((a, b) => p10Pts(b) - p10Pts(a));
      for (const id of order) {
        const t = p10Targets(s, p, id);
        if (t.length) { const tg = t[0], side = tg.sides.length > 1 ? (tg.sides.includes('hi') ? 'hi' : 'lo') : tg.sides[0]; return { t: 'hit', id, p: tg.p, g: tg.g, side }; }
      }
    }
    const id = p10Pick(s, p, lvl);
    return { t: 'disc', id, to: p10S(id) ? p10SkipTo(s, p, lvl) : undefined };
  }
  function p10Fallback(s, p) {
    if (s.phase !== 'play' || s.turn !== p) return null;
    if (s.stage === 'draw') return { t: 'draw', from: 'stock' };
    const id = p10Pick(s, p, 'Easy');
    return { t: 'disc', id, to: p10S(id) ? (p + 1) % s.n : undefined };
  }
  function p10Tick(s, now) {
    if (s.phase !== 'play' || !s.deadline || now < s.deadline + 1200) return null;
    const ev = [{ k: 'timeout', p: s.turn }], p = s.turn;
    if (s.stage === 'draw' && !p10Draw(s, p, ev, 'stock')) { s.deadline = now + 5000; return { ev }; }
    const id = p10Pick(s, p, 'Easy');
    p10Discard(s, p, id, p10S(id) ? (p + 1) % s.n : undefined, ev);
    return { ev };
  }
  const p10Shift = (s, dt) => { if (s.deadline) s.deadline += dt; };
  const p10Who = s => s.phase === 'between' ? s.ready.map((r, i) => r ? -1 : i).filter(i => i >= 0) : s.phase === 'over' ? [] : [s.turn];
  function p10View(s, p) {
    const top = s.disc[s.disc.length - 1];
    return {
      seat: p, phase: s.phase, turn: s.turn, stage: s.stage, n: s.n, hand: s.hands[p].slice(), counts: s.hands.map(h => h.length),
      stock: s.stock.length, disc: top === undefined ? -1 : top, dn: s.disc.length, ph: s.ph.slice(), last: s.cfg.last,
      lay: s.lay.map(l => (l ? { ph: l.ph, groups: l.groups.map(g => JSON.parse(JSON.stringify(g))) } : null)), skipped: s.skipped.slice(),
      scores: s.scores.slice(), round: s.round, dealer: s.dealer, drew: s.turn === p && s.drew ? s.drew : null, timer: s.cfg.timer,
      tl: s.deadline ? Math.max(0, s.deadline - Date.now()) : 0, ready: s.ready.slice(), res: s.res, final: s.final
    };
  }
  function p10Fev(evs, p) {
    return evs.map(e => e.k === 'draw' && e.from === 'stock' && e.p !== p ? Object.assign({}, e, { id: -1 }) : e);
  }

  const p1Css = id => {
    const p = '.gm-' + id;
    return `
${p}{--f1:#2b5d86;--f2:#0c2236}
${p} .p1-felt{position:absolute;inset:0;pointer-events:none}
${p} .p1-felt::before{content:"";position:absolute;inset:6% 4% 30%;border-radius:40px;border:2px solid rgba(255,255,255,.07)}
${p} .p1-felt b{position:absolute;left:0;right:0;top:44%;text-align:center;font:900 calc(var(--cw)*1.1) Georgia,serif;font-style:italic;color:rgba(255,255,255,.035);white-space:nowrap}
${p} .p1-grps,${p} .p1-cards{position:absolute;inset:0;pointer-events:none}
${p} .p1-g{pointer-events:auto;position:absolute;border-radius:10px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 2px var(--oc,rgba(255,255,255,.2));transition:background .15s,box-shadow .15s}
${p} .p1-g i{position:absolute;left:-5px;top:-7px;width:16px;height:16px;border-radius:50%;background:var(--oc);color:#14161c;font:900 10px/16px var(--sans);text-align:center;font-style:normal}
${p} .p1-g.ok{background:rgba(242,195,75,.2);box-shadow:inset 0 0 0 2px var(--gold),0 0 14px rgba(242,195,75,.45);animation:p1-ok 1s ease-in-out infinite}
${p} .p1-g.hv{background:rgba(242,195,75,.42)}
@keyframes p1-ok{50%{background:rgba(242,195,75,.3)}}
${p} .p1c{position:absolute;border-radius:calc(var(--cw)*.1);box-shadow:0 1px 2px rgba(0,0,0,.5),0 3px 8px rgba(0,0,0,.3);color:#fff;user-select:none;-webkit-user-select:none;touch-action:none;overflow:hidden;font-family:var(--sans);transition:filter .15s}
${p} .p1c::before{content:"";position:absolute;inset:calc(var(--cw)*.05);border-radius:calc(var(--cw)*.07);border:calc(var(--cw)*.022) solid rgba(255,255,255,.7);pointer-events:none}
${p} .p1c b{position:absolute;left:50%;top:52%;width:calc(var(--cw)*.7);height:calc(var(--cw)*.7);transform:translate(-50%,-50%);border-radius:50%;background:#fff;display:grid;place-items:center;font:900 calc(var(--cw)*.46)/1 'Trebuchet MS',var(--sans);letter-spacing:-.04em;box-shadow:0 calc(var(--cw)*.025) calc(var(--cw)*.05) rgba(0,0,0,.35)}
${p} .p1c i{position:absolute;font:900 calc(var(--cw)*.2)/1 var(--sans);font-style:normal;text-shadow:0 1px 1px rgba(0,0,0,.3)}
${p} .p1c i.t{left:calc(var(--cw)*.1);top:calc(var(--cw)*.08)}
${p} .p1c i.u{right:calc(var(--cw)*.1);bottom:calc(var(--cw)*.08);transform:rotate(180deg)}
${p} .p1c.c0{background:linear-gradient(150deg,#ef5a4f,#b3221b)}${p} .p1c.c0 b{color:#c42a22}
${p} .p1c.c1{background:linear-gradient(150deg,#4a8df0,#1d4fae)}${p} .p1c.c1 b{color:#1d55bd}
${p} .p1c.c2{background:linear-gradient(150deg,#46bd75,#1b7a3f)}${p} .p1c.c2 b{color:#1b8444}
${p} .p1c.c3{background:linear-gradient(150deg,#f8cd45,#d79a08)}${p} .p1c.c3 b{color:#b97d00}
${p} .p1c.w{background:conic-gradient(from 30deg,#ef5a4f,#f8cd45,#46bd75,#4a8df0,#b574e8,#ef5a4f)}
${p} .p1c.w b{background:#16171d;color:#fff;font-size:calc(var(--cw)*.4)}
${p} .p1c.w i{display:none}
${p} .p1c.w::after{content:"WILD";position:absolute;left:0;right:0;bottom:calc(var(--cw)*.1);text-align:center;font:900 calc(var(--cw)*.15)/1 var(--sans);letter-spacing:.08em;color:#fff;text-shadow:0 1px 2px #000}
${p} .p1c.sk{background:linear-gradient(150deg,#2b2c36,#101116)}
${p} .p1c.sk b{background:transparent;border:calc(var(--cw)*.06) solid #e8392f;color:#fff;font-size:calc(var(--cw)*.2);width:calc(var(--cw)*.62);height:calc(var(--cw)*.62);letter-spacing:.04em;position:absolute}
${p} .p1c.sk b::after{content:"";position:absolute;left:-6%;right:-6%;top:46%;height:calc(var(--cw)*.07);background:#e8392f;transform:rotate(-45deg)}
${p} .p1c.sk i{display:none}
${p} .p1c.bk{background:repeating-linear-gradient(45deg,#1c2c63 0 7px,#22367a 7px 14px)}
${p} .p1c.bk::after{content:"10";position:absolute;inset:0;display:grid;place-items:center;font:900 calc(var(--cw)*.42)/1 Georgia,serif;font-style:italic;color:#f5c542;text-shadow:0 2px 0 rgba(0,0,0,.4)}
${p} .p1c.bk b,${p} .p1c.bk i{display:none}
${p} .p1c em{position:absolute;left:50%;bottom:calc(var(--cw)*.2);transform:translateX(-50%);font:900 calc(var(--cw)*.24)/1 var(--sans);font-style:normal;background:rgba(0,0,0,.72);color:#fff;border-radius:4px;padding:1px 3px;z-index:2}
${p} .p1c.w em{bottom:auto;top:calc(var(--cw)*.05)}
${p} .p1c.h{cursor:pointer;pointer-events:auto}
${p} .p1c.sel{box-shadow:0 0 0 3px var(--gold),0 8px 18px rgba(0,0,0,.45)}
${p} .p1c.cur::after{outline:2px dashed rgba(255,255,255,.8);outline-offset:-4px}
${p} .p1c.drag{transition:none;z-index:90!important;box-shadow:0 0 0 3px var(--gold),0 14px 26px rgba(0,0,0,.55);pointer-events:none}
${p} .p1c.dim{filter:brightness(.62)}
${p} .p1-pile{position:absolute;border-radius:calc(var(--cw)*.12);cursor:default}
${p} .p1-pile.s{background:repeating-linear-gradient(45deg,#1c2c63 0 7px,#22367a 7px 14px);box-shadow:2px 2px 0 #121c44,4px 4px 0 #0c1330,0 6px 12px rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.65)}
${p} .p1-pile.s::after{content:"10";position:absolute;inset:0;display:grid;place-items:center;font:900 calc(var(--cw)*.42)/1 Georgia,serif;font-style:italic;color:#f5c542;text-shadow:0 2px 0 rgba(0,0,0,.4)}
${p} .p1-pile.d{border:2px dashed rgba(255,255,255,.28)}
${p} .p1-pile.go{cursor:pointer;box-shadow:0 0 0 3px var(--gold),0 0 18px rgba(242,195,75,.6)}
${p} .p1-pile.hv{box-shadow:0 0 0 3px #7be08e,0 0 18px rgba(123,224,142,.6)}
${p} .p1-pl{position:absolute;display:flex;flex-direction:column;justify-content:center;gap:2px;pointer-events:none;color:#fff;font:800 12px var(--sans);text-shadow:0 1px 3px rgba(0,0,0,.6);z-index:4}
${p} .p1-pl h4{margin:0;font:900 calc(var(--cw)*.3)/1.1 var(--sans);color:var(--gold);letter-spacing:.02em}
${p} .p1-pl span{font:800 calc(var(--cw)*.2)/1.2 var(--sans);color:rgba(255,255,255,.9)}
${p} .p1-pl em{font:800 calc(var(--cw)*.19)/1.25 var(--sans);font-style:normal;color:rgba(255,255,255,.62);margin-top:3px}
${p} .p1-pl em.me{color:#ffd04a}
${p} .p1-top{position:absolute;display:flex;gap:6px;justify-content:center;align-items:stretch;z-index:5;pointer-events:none}
${p} .p1-c{flex:0 1 auto;display:flex;align-items:center;gap:6px;padding:3px 9px 3px 4px;border-radius:14px;background:rgba(0,0,0,.34);border:2px solid rgba(255,255,255,.14);min-width:0;position:relative;overflow:hidden;transition:border-color .2s,background .2s,box-shadow .2s}
${p} .p1-c.turn{border-color:var(--gold);background:rgba(40,34,10,.5);box-shadow:0 0 14px rgba(242,195,75,.35)}
${p} .p1-c.sk{opacity:.8}
${p} .p1-c .gx-av{width:28px;height:28px;font-size:13px}
${p} .p1-n{display:flex;flex-direction:column;min-width:0;line-height:1.15}
${p} .p1-n b{font:800 12px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:84px;display:block}
${p} .p1-n small{font:800 10.5px var(--sans);color:rgba(255,255,255,.7);white-space:nowrap}
${p} .p1-n small u{text-decoration:none;color:var(--gold)}
${p} .p1-c.me .p1-n b::after{content:" (you)";color:rgba(255,255,255,.5);font-weight:700}
${p} .p1-tm{position:absolute;left:0;bottom:0;height:3px;background:var(--gold);width:0;transition:width .25s linear}
${p} .p1-tm.lo{background:#ff6a4a}
${p} .p1-bar{position:absolute;z-index:6;display:flex;align-items:center;gap:6px}
${p} .p1-bar .sp{flex:1}
${p} .p1-b{min-height:34px;padding:0 13px;border-radius:12px;border:2px solid rgba(255,255,255,.26);background:rgba(0,0,0,.34);color:#fff;font:800 13px var(--sans);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
${p} .p1-b:disabled{opacity:.42}
${p} .p1-b.go{background:linear-gradient(#3ec76d,#23974c);border-color:#7be08e;box-shadow:0 3px 0 #146a33}
${p} .p1-b.dc{background:linear-gradient(#e86c58,#b3402f);border-color:#ff9b8a;box-shadow:0 3px 0 #7d2417}
${p}.port .p1-c{padding:2px 6px 2px 3px;gap:4px;flex:1 1 0}
${p}.port .p1-n{overflow:hidden}
${p}.port .p1-c .gx-av{width:24px;height:24px;font-size:11px}
${p}.port .p1-n b{max-width:100%;font-size:11px}
${p}.port .p1-n small{font-size:10px}
${p}.port .p1-b{padding:0 10px;min-height:32px;font-size:12px}
${p} .p1-pick{position:absolute;z-index:30;display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:14px;background:rgba(14,18,34,.96);border:2px solid var(--gold);box-shadow:0 10px 30px rgba(0,0,0,.6)}
${p} .p1-pick p{margin:0 0 2px;font:800 12px var(--sans);color:#fff;text-align:center}
${p} .p1-pick button{min-height:36px;padding:0 14px;border-radius:10px;border:2px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font:800 13px var(--sans);display:flex;align-items:center;gap:8px}
${p} .p1-fx{position:absolute;inset:0;pointer-events:none;z-index:50;overflow:hidden}
${p} .p1-mt{display:inline-grid;place-items:center;min-width:18px;height:22px;margin:1px;border-radius:4px;font:900 12px var(--sans);color:#fff;padding:0 2px}
${p} .p1-mt.c0{background:#c42a22}${p} .p1-mt.c1{background:#1d55bd}${p} .p1-mt.c2{background:#1b8444}${p} .p1-mt.c3{background:#d79a08}${p} .p1-mt.w{background:#16171d}${p} .p1-mt.s{background:#e8392f}
@media (prefers-reduced-motion:reduce){${p} .p1-g{animation:none}}
`;
  };

  function p1Ui(C) {
    const { api, stage, snd } = C;
    const flip = Flip(stage);
    stage.innerHTML = '<div class="p1-felt"><b>PHASE 10</b></div><div class="p1-grps"></div><div class="p1-pile s"></div><div class="p1-pile d"></div><div class="p1-cards"></div><div class="p1-top"></div><div class="p1-pl"></div><div class="p1-bar"></div><div class="p1-fx"></div>';
    const $ = s => stage.querySelector(s);
    const eG = $('.p1-grps'), eC = $('.p1-cards'), eTop = $('.p1-top'), eS = $('.p1-pile.s'), eD = $('.p1-pile.d'), eP = $('.p1-pl'), eBar = $('.p1-bar'), eFx = $('.p1-fx');
    const now = () => performance.now();
    let L = { W: 880, H: 550, port: false }, G = null;
    let V = null, sel = new Set(), mode = 'num', order = [], drag = null, busyUntil = 0, hints = {}, discSeq = [-1, -1], cur = -1, lastTap = { id: -1, t: 0 };
    let resT = 0, finalShown = false, deadAt = 0, lastTick = 0, lastSec = -1, pick = null, lastSig = '';
    const mine = () => !!V && V.phase === 'play' && V.turn === V.seat;
    const cardCls = id => (p10W(id) ? 'w' : p10S(id) ? 'sk' : 'c' + p10C(id));
    const cardHtml = id => (p10W(id) ? '<b>W</b>' : p10S(id) ? '<b>SKIP</b>' : `<i class="t">${p10N(id)}</i><b>${p10N(id)}</b><i class="u">${p10N(id)}</i>`);
    const sortHand = h => {
      const key = id => p10S(id) ? 1e4 + id : p10W(id) ? 9e3 + id : mode === 'col' ? p10C(id) * 100 + p10N(id) * 2 + id % 2 : p10N(id) * 10 + p10C(id) + (id % 2) * .5;
      if (mode === 'manual') {
        order = order.filter(x => h.includes(x)); h.forEach(x => { if (!order.includes(x)) order.push(x); });
        return order.slice();
      }
      return h.slice().sort((a, b) => key(a) - key(b));
    };

    function geo() {
      const { W, H, port } = L;
      const m = port ? 8 : Math.round(W * .014);
      const cw = port ? clamp(Math.min(W * .17, H * .11), 40, 74) : clamp(Math.min(W * .085, H * .15), 44, 96), ch = cw * 1.42;
      const chipH = port ? 40 : 46, topY = port ? 50 : m, y1 = topY + chipH + 8, raise = cw * .3, handTop = H - m - ch - raise, barH = port ? 34 : 38, barY = handTop - barH - 6;
      const cwP = cw * .92, chP = cwP * 1.42;
      const g = { m, cw, ch, chipH, topY, y1, raise, handTop, barH, barY, cwP, chP };
      if (port) {
        g.sx = m + 4; g.sy = y1; g.dx = g.sx + cwP + 12; g.dy = y1;
        g.bx = m; g.by = y1 + chP + 12; g.bw = W - 2 * m; g.bh = barY - 6 - g.by;
        g.px = g.dx + cwP + 14; g.py = y1; g.pw = W - m - g.px; g.ph = chP;
      } else {
        const avail = barY - 6 - y1;
        g.sx = m + 8; g.sy = y1 + 8; g.dx = g.sx + cwP + 14; g.dy = g.sy;
        g.bx = g.dx + cwP + 40; g.by = y1; g.bw = W - m - g.bx; g.bh = avail;
        g.px = m + 4; g.py = g.sy + chP + 16; g.pw = 2 * cwP + 30; g.ph = Math.max(60, avail - chP - 30);
      }
      G = g;
      stage.style.setProperty('--cw', cw + 'px');
    }
    function place(gs, cs) {
      const step = cs * .52, pad = 4, hh = cs * 1.42 + 2 * pad, out = [];
      let x = G.bx + 6, y = G.by + 10;
      for (const o of gs) {
        const n = o.g.ids.length, gw = 2 * pad + cs + (n - 1) * step;
        if (x + gw > G.bx + G.bw && x > G.bx + 8) { x = G.bx + 6; y += hh + 10; }
        out.push({ o, x, y, w: gw, h: hh, cs, step, pad });
        x += gw + 12;
      }
      return { out, h: y + hh - G.by };
    }
    function packGroups(v) {
      const gs = [];
      for (let k = 0; k < v.n; k++) { const i = (v.seat + k) % v.n; if (v.lay[i]) v.lay[i].groups.forEach((g, gi) => gs.push({ p: i, gi, g })); }
      let cs = G.cw * .85, r = place(gs, cs);
      while (r.h > G.bh && cs > G.cw * .3) { cs -= 2; r = place(gs, cs); }
      return r.out;
    }
    function fits(id) {
      const out = new Set();
      if (!V || !mine() || V.stage !== 'act' || !V.lay[V.seat]) return out;
      V.lay.forEach((l, p) => { if (l) l.groups.forEach((g, gi) => { if (p10Sides(g, id).length) out.add(p + ':' + gi); }); });
      return out;
    }

    function render(resizeOnly) {
      if (!V) return;
      if (!resizeOnly) flip.snap();
      geo();
      const v = V, items = [], boxes = [], hand = sortHand(v.hand), n = hand.length;
      const dk = drag && drag.started ? drag.id : -1;
      const step = n > 1 ? Math.min(G.cw * .8, (L.W - 2 * G.m - G.cw) / (n - 1)) : 0, tot = step * (n - 1) + G.cw, x0 = (L.W - tot) / 2;
      const myTurn = mine(), act = myTurn && v.stage === 'act', one = sel.size === 1 ? [...sel][0] : -1, ok = one >= 0 ? fits(one) : new Set();
      hand.forEach((id, i) => {
        const mid = (n - 1) / 2, dxm = (i - mid) / Math.max(1, mid), x = x0 + i * step, y = G.handTop + dxm * dxm * G.cw * .08 + (sel.has(id) ? 0 : G.raise);
        items.push({ k: 'c' + id, id, x, y, w: G.cw, z: 10 + i + (sel.has(id) ? 100 : 0), cls: 'p1c h ' + cardCls(id) + (sel.has(id) ? ' sel' : '') + (cur === i ? ' cur' : ''), hand: 1 });
      });
      const used = new Set(hand);
      packGroups(v).forEach(b => {
        const key = b.o.p + ':' + b.o.gi, oc = AV_COL[b.o.p % AV_COL.length];
        boxes.push({ k: 'g' + key, x: b.x, y: b.y, w: b.w, h: b.h, cls: 'p1-g' + (ok.has(key) ? ' ok' : '') + (drag && drag.hv === key ? ' hv' : ''), oc, p: b.o.p, gi: b.o.gi, init: initials(C.name(b.o.p)) });
        b.o.g.ids.forEach((id, i) => {
          used.add(id);
          items.push({ k: 'c' + id, id, x: b.x + b.pad + i * b.step, y: b.y + b.pad, w: b.cs, z: 5 + i, cls: 'p1c ' + cardCls(id), val: p10W(id) ? (b.o.g.vals ? b.o.g.vals[i] : b.o.g.k === 's' ? b.o.g.n : '') : '' });
        });
      });
      const dd = G.cwP, top = v.disc, under = discSeq[0];
      if (top >= 0 && !used.has(top)) { items.push({ k: 'c' + top, id: top, x: G.dx, y: G.dy, w: dd, z: 7, cls: 'p1c ' + cardCls(top) + (myTurn && v.stage === 'draw' && p10S(top) ? ' dim' : '') }); used.add(top); }
      if (under >= 0 && under !== top && !used.has(under)) items.push({ k: 'c' + under, id: under, x: G.dx + dd * .08, y: G.dy - dd * .04, w: dd, z: 6, cls: 'p1c ' + cardCls(under) + ' dim' });
      syncKeyed(eC, items.map(it => ({
        k: it.k, cls: it.cls, html: cardHtml(it.id) + (it.val !== undefined && it.val !== '' ? `<em>${it.val}</em>` : ''),
        upd(e) {
          if (it.hand) e.dataset.h = it.id; else delete e.dataset.h;
          e.style.setProperty('--cw', it.w + 'px');
          e.style.width = it.w + 'px'; e.style.height = it.w * 1.42 + 'px';
          if (it.id === dk) { e.classList.add('drag'); return; }
          e.style.left = it.x + 'px'; e.style.top = it.y + 'px'; e.style.zIndex = it.z;
        }
      })));
      syncKeyed(eG, boxes.map(b => ({
        k: b.k, cls: b.cls, html: `<i>${b.init}</i>`,
        upd(e) { e.style.left = b.x + 'px'; e.style.top = b.y + 'px'; e.style.width = b.w + 'px'; e.style.height = b.h + 'px'; e.style.setProperty('--oc', b.oc); e.dataset.p = b.p; e.dataset.gi = b.gi; e.firstChild.textContent = b.init; }
      })));
      const px = (e, x, y, w, h) => { e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.width = w + 'px'; e.style.height = h + 'px'; };
      px(eS, G.sx, G.sy, G.cwP, G.chP); px(eD, G.dx, G.dy, G.cwP, G.chP);
      eS.style.setProperty('--cw', G.cwP + 'px');
      eS.classList.toggle('go', myTurn && v.stage === 'draw'); eD.classList.toggle('go', myTurn && v.stage === 'draw' && top >= 0 && !p10S(top));
      eD.classList.toggle('hv', !!(drag && drag.hv === 'd'));
      eP.style.left = G.px + 'px'; eP.style.top = G.py + 'px'; eP.style.width = G.pw + 'px'; eP.style.height = G.ph + 'px';
      eP.style.justifyContent = L.port ? 'center' : 'flex-start';
      const pp = v.ph[v.seat], laid = !!v.lay[v.seat];
      let info = '';
      if (v.phase === 'play') {
        if (myTurn) info = v.stage === 'draw' ? 'Your turn: draw a card' : laid ? 'Hit a laid group or discard' : 'Lay down your phase or discard';
        else info = C.name(v.turn) + (C.isBot(v.turn) ? ' is thinking...' : ' is playing...');
      }
      const done = pp > v.last;
      eP.innerHTML = `<h4>${done ? 'Done' : 'Phase ' + pp}</h4><span>${done ? 'All phases complete' : p10Desc(pp)}${laid ? ' · laid' : ''}</span><em class="${myTurn ? 'me' : ''}">${esc(info)}</em>`;
      drawBar();
      if (!resizeOnly) flip.play(hints, 400);
      hints = {};
    }
    function drawBar() {
      const v = V, my = mine(), act = my && v.stage === 'act', laid = !!v.lay[v.seat], bx = G.m, bw = L.W - 2 * G.m;
      eBar.style.left = bx + 'px'; eBar.style.top = G.barY + 'px'; eBar.style.width = bw + 'px'; eBar.style.height = G.barH + 'px';
      const canLay = act && !laid && (sel.size ? !!p10Solve([...sel], v.ph[v.seat], true) : !!p10Solve(v.hand, v.ph[v.seat], false));
      const one = sel.size === 1 ? [...sel][0] : -1;
      const html = `<button class="p1-b" data-b="sort">Sort: ${mode === 'col' ? 'Colour' : mode === 'manual' ? 'Custom' : 'Number'}</button><span class="sp"></span>`
        + (my && v.stage === 'act' && !laid ? `<button class="p1-b ${canLay ? 'go' : ''}" data-b="lay" ${canLay ? '' : 'disabled'}>Lay down${sel.size ? ' (' + sel.size + ')' : ''}</button>` : '')
        + (my && v.stage === 'act' ? `<button class="p1-b dc" data-b="disc" ${one >= 0 ? '' : 'disabled'}>Discard</button>` : '')
        + (my && v.stage === 'draw' ? '<button class="p1-b go" data-b="draw">Draw</button>' : '');
      if (html !== lastSig) { eBar.innerHTML = html; lastSig = html; }
    }
    function drawTop() {
      if (!V) { eTop.innerHTML = ''; return; }
      const v = V, port = L.port;
      G || geo();
      const tl = port ? 8 : 104; eTop.style.left = tl + 'px'; eTop.style.top = G.topY + 'px'; eTop.style.width = L.W - tl - (port ? 8 : 12) + 'px'; eTop.style.height = G.chipH + 'px';
      eTop.innerHTML = Array.from({ length: v.n }, (_, i) => {
        const sk = v.skipped[i] > 0;
        return `<div class="p1-c ${i === v.turn && v.phase === 'play' ? 'turn' : ''} ${i === v.seat ? 'me' : ''} ${sk ? 'sk' : ''}" data-s="${i}">${C.avatar(i, port ? 24 : 28)}<span class="p1-n"><b>${esc(C.name(i))}</b><small>P${Math.min(v.ph[i], v.last)} · ${v.counts[i]}${port ? '' : ' cards'}${v.scores[i] ? ' · <u>' + v.scores[i] + '</u>' : ''}${v.lay[i] ? ' · ✓' : ''}${sk ? ' · skip' : ''}</small></span><span class="p1-tm"></span></div>`;
      }).join('');
    }
    const rectOf = e => { const b = e.getBoundingClientRect(); return { left: b.left, top: b.top, width: b.width, height: b.height }; };
    const chipRect = i => { const e = eTop.querySelector(`[data-s="${i}"]`); return e ? rectOf(e) : rectOf(eTop); };
    function fly(id, from, to) {
      if (reduced() || !G) return;
      const sb = stage.getBoundingClientRect(), f = el('div', 'p1c ' + (id >= 0 ? cardCls(id) : 'bk'), id >= 0 ? cardHtml(id) : '');
      const w = G.cwP * .7;
      f.style.setProperty('--cw', w + 'px'); f.style.width = w + 'px'; f.style.height = w * 1.42 + 'px'; f.style.transition = 'transform .5s cubic-bezier(.2,.8,.3,1),opacity .5s';
      const at = r => `translate(${r.left - sb.left + r.width / 2 - w / 2}px,${r.top - sb.top + r.height / 2 - w * .71}px)`;
      f.style.left = '0'; f.style.top = '0'; f.style.transform = at(from); eFx.append(f);
      requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transform = at(to) + ' scale(.6)'; f.style.opacity = '.2'; }));
      api.timeout(() => f.remove(), 700);
    }

    function update(v, evs, info) {
      const prev = V; V = v;
      if (v.phase === 'over' && !C.M.over) C.over();
      const sync = info && info.sync, newHand = !prev || prev.round !== v.round || sync;
      if (!G) geo();
      hints = {};
      if (newHand) {
        sel.clear(); order = []; discSeq = [-1, v.disc]; cur = -1; pick = null; closePick();
        if (!sync) { snd.play('deal'); busyUntil = now() + 900; const sr = rectOf(eS); v.hand.forEach(id => { hints['c' + id] = sr; }); }
      } else if (v.disc !== discSeq[1]) discSeq = [discSeq[1], v.disc];
      (evs || []).forEach(ev => {
        if (sync) return;
        if (ev.k === 'draw') {
          snd.play('draw'); busyUntil = now() + 450;
          if (ev.p === v.seat) { if (ev.from === 'stock') hints['c' + ev.id] = rectOf(eS); }
          else fly(ev.from === 'disc' ? ev.id : -1, ev.from === 'disc' ? rectOf(eD) : rectOf(eS), chipRect(ev.p));
        } else if (ev.k === 'disc') {
          snd.play('discard'); busyUntil = now() + 450;
          if (ev.p !== v.seat) hints['c' + ev.id] = chipRect(ev.p);
        } else if (ev.k === 'lay') {
          snd.play('lay'); busyUntil = now() + 700;
          if (ev.p !== v.seat) ev.groups.forEach(g => g.ids.forEach(id => { hints['c' + id] = chipRect(ev.p); }));
        } else if (ev.k === 'hit') {
          snd.play('hit'); busyUntil = now() + 450;
          if (ev.p !== v.seat) hints['c' + ev.id] = chipRect(ev.p);
        } else if (ev.k === 'skip') { snd.play('skip'); C.toast(ev.p >= 0 ? C.name(ev.p) + ' skips ' + (ev.to === v.seat ? 'you!' : C.name(ev.to)) : 'The first card is a Skip: ' + C.name(ev.to) + ' is skipped', 2000); busyUntil = now() + 600; }
        else if (ev.k === 'skipped') { C.toast((ev.p === v.seat ? 'You are' : C.name(ev.p) + ' is') + ' skipped', 1600); busyUntil = now() + 500; }
        else if (ev.k === 'reshuffle') { snd.play('shuffle'); C.toast('Discard pile shuffled into the stock', 1800); }
        else if (ev.k === 'timeout') { snd.play('warn'); C.toast(ev.p === v.seat ? 'Time is up! A card was discarded for you.' : C.name(ev.p) + ' ran out of time', 2200); }
        else if (ev.k === 'bad' && ev.p === v.seat) { C.toast(ev.err || 'Not allowed', 2200); snd.play('bad'); }
        else if (ev.k === 'turn' && ev.p === v.seat) snd.play('turn');
      });
      const have = new Set(v.hand);
      sel.forEach(id => { if (!have.has(id)) sel.delete(id); });
      if (!mine()) sel.clear();
      deadAt = v.tl ? Date.now() + v.tl : 0; lastSec = -1;
      drawTop(); render();
      api.score(v.scores[v.seat]);
      clearTimeout(resT);
      if (v.phase !== 'play') resT = setTimeout(() => { if (api.alive && V && V.phase !== 'play') showResult(V); }, v.phase === 'over' || (info && info.sync) ? 1200 : 1300);
      if (v.phase === 'play' && C.paneKey() === 'res') C.hidePane();
    }

    function closePick() { const e = stage.querySelector('.p1-pick'); if (e) e.remove(); pick = null; }
    function askSkip(id) {
      const v = V, others = Array.from({ length: v.n }, (_, i) => i).filter(i => i !== v.seat);
      if (others.length === 1) { send({ t: 'disc', id, to: others[0] }); return; }
      closePick(); pick = id;
      const e = el('div', 'p1-pick', '<p>Skip which player?</p>' + others.map(i => `<button data-to="${i}">${C.avatar(i, 24)}<span>${esc(C.name(i))}</span></button>`).join(''));
      e.style.left = Math.max(8, Math.min(L.W - 170, G.dx - 40)) + 'px'; e.style.top = (G.dy + G.chP + 8) + 'px';
      stage.append(e);
    }
    function send(a) { sel.clear(); closePick(); C.act(a); }
    function doDraw(from) {
      if (!mine() || V.stage !== 'draw') return;
      if (from === 'disc' && (V.disc < 0 || p10S(V.disc))) { C.toast('A Skip cannot be taken', 1400); snd.play('error'); return; }
      send({ t: 'draw', from });
    }
    function doLay() {
      if (!mine() || V.stage !== 'act' || V.lay[V.seat]) return;
      send(sel.size ? { t: 'lay', sel: [...sel] } : { t: 'lay' });
    }
    function doDiscard(id) {
      if (!mine() || V.stage !== 'act') return;
      if (p10S(id)) { askSkip(id); return; }
      send({ t: 'disc', id });
    }
    function doHit(id, p, gi, side) { if (mine() && V.stage === 'act') { sel.delete(id); C.act({ t: 'hit', id, p, g: gi, side }); } }
    function sideAt(box, id, x) {
      const g = V.lay[+box.dataset.p].groups[+box.dataset.gi];
      if (g.k !== 'r' || !p10W(id)) return undefined;
      const r = box.getBoundingClientRect();
      return x < r.left + r.width / 2 ? 'lo' : 'hi';
    }

    function pt(e) { const b = stage.getBoundingClientRect(), sx = b.width / stage.offsetWidth || 1; return { x: (e.clientX - b.left) / sx, y: (e.clientY - b.top) / sx }; }
    function targetAt(e) {
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      const g = els.find(x => x.classList && x.classList.contains('p1-g'));
      if (g) return { k: 'g', box: g, key: g.dataset.p + ':' + g.dataset.gi };
      if (els.includes(eD) || els.some(x => x.dataset && x.dataset.k === 'c' + V.disc)) return { k: 'd' };
      const p = pt(e);
      if (p.y > G.handTop - G.ch * .25) return { k: 'hand', x: p.x };
      return null;
    }
    api.on(stage, 'pointerdown', e => {
      if (!V || C.paneOpen() || (e.pointerType === 'mouse' && e.button !== 0)) return;
      snd.unlock();
      const pk = e.target.closest('.p1-pick button');
      if (pk) { const id = pick; if (id != null) send({ t: 'disc', id, to: +pk.dataset.to }); return; }
      if (pick != null) closePick();
      const ce = e.target.closest('.p1c.h');
      if (ce) {
        const id = +ce.dataset.h, p = pt(e), r = ce.getBoundingClientRect(), sc = stage.getBoundingClientRect().width / stage.offsetWidth || 1;
        drag = { id, sx: p.x, sy: p.y, pid: e.pointerId, started: false, ox: (e.clientX - r.left) / sc, oy: (e.clientY - r.top) / sc, hv: null, el: ce };
        e.preventDefault(); return;
      }
      if (e.target.closest('.p1-pile.s')) { doDraw('stock'); return; }
      if (e.target.closest('.p1-pile.d') || (V.disc >= 0 && e.target.closest(`[data-k="c${V.disc}"]`))) { doDraw('disc'); return; }
      const gb = e.target.closest('.p1-g');
      if (gb && sel.size && mine() && V.stage === 'act') {
        const ids = [...sel];
        let any = false;
        ids.forEach(id => {
          const g = V.lay[+gb.dataset.p].groups[+gb.dataset.gi];
          if (p10Sides(g, id).length) { any = true; doHit(id, +gb.dataset.p, +gb.dataset.gi, sideAt(gb, id, e.clientX)); }
        });
        if (!any) { C.toast('That does not fit there', 1400); snd.play('error'); }
      }
    });
    api.on(stage, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.pid) return;
      const p = pt(e);
      if (!drag.started) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) < (e.pointerType === 'touch' ? 9 : 5)) return;
        drag.started = true; drag.el.classList.add('drag'); snd.play('pick');
        try { stage.setPointerCapture(e.pointerId); } catch (x) {}
      }
      drag.el.style.left = (p.x - drag.ox) + 'px'; drag.el.style.top = (p.y - drag.oy - (e.pointerType === 'touch' ? G.ch * .5 : 0)) + 'px';
      const t = targetAt(Object.assign({}, { clientX: e.clientX, clientY: e.clientY - (e.pointerType === 'touch' ? G.ch * .5 : 0) }));
      const hv = t && t.k === 'g' ? (fits(drag.id).has(t.key) ? t.key : null) : t && t.k === 'd' && mine() && V.stage === 'act' ? 'd' : null;
      if (hv !== drag.hv) { drag.hv = hv; stage.querySelectorAll('.p1-g').forEach(b => b.classList.toggle('hv', b.dataset.p + ':' + b.dataset.gi === hv)); eD.classList.toggle('hv', hv === 'd'); }
      e.preventDefault();
    });
    function endDrag(e, cancel) {
      if (!drag || e.pointerId !== drag.pid) return;
      const d = drag; drag = null;
      try { stage.releasePointerCapture(d.pid); } catch (x) {}
      stage.querySelectorAll('.p1-g.hv').forEach(b => b.classList.remove('hv')); eD.classList.remove('hv');
      if (!d.started) {
        if (cancel) return;
        const t = now();
        if (lastTap.id === d.id && t - lastTap.t < 340 && mine() && V.stage === 'act') { lastTap = { id: -1, t: 0 }; doDiscard(d.id); return; }
        lastTap = { id: d.id, t };
        if (sel.has(d.id)) sel.delete(d.id); else sel.add(d.id);
        snd.play('select'); render(); return;
      }
      d.el.classList.remove('drag');
      if (!cancel) {
        const lift = e.pointerType === 'touch' ? G.ch * .5 : 0;
        const t = targetAt({ clientX: e.clientX, clientY: e.clientY - lift });
        if (t && t.k === 'g' && mine() && V.stage === 'act') {
          const g = V.lay[+t.box.dataset.p].groups[+t.box.dataset.gi];
          if (p10Sides(g, d.id).length) doHit(d.id, +t.box.dataset.p, +t.box.dataset.gi, sideAt(t.box, d.id, e.clientX));
          else { C.toast('That does not fit there', 1400); snd.play('error'); }
        } else if (t && t.k === 'd') {
          if (mine() && V.stage === 'act') doDiscard(d.id); else { C.toast(mine() ? 'Draw a card first' : 'Wait for your turn', 1400); snd.play('error'); }
        } else if (t && t.k === 'hand') {
          const hand = sortHand(V.hand).filter(x => x !== d.id), p = pt(e);
          const n = hand.length + 1, step = n > 1 ? Math.min(G.cw * .8, (L.W - 2 * G.m - G.cw) / (n - 1)) : 0, x0 = (L.W - (step * (n - 1) + G.cw)) / 2;
          const at = clamp(Math.round((p.x - G.cw / 2 - x0) / Math.max(1, step)), 0, hand.length);
          hand.splice(at, 0, d.id); order = hand; mode = 'manual'; snd.play('slide');
        }
      }
      render();
    }
    api.on(stage, 'pointerup', e => endDrag(e));
    api.on(stage, 'pointercancel', e => endDrag(e, true));
    api.on(stage, 'click', e => {
      const b = e.target.closest('.p1-b');
      if (!b || b.disabled || !V) return;
      const k = b.dataset.b;
      if (k === 'sort') { mode = mode === 'num' ? 'col' : 'num'; snd.play('shuffle'); render(); }
      else if (k === 'lay') doLay();
      else if (k === 'disc') { if (sel.size === 1) doDiscard([...sel][0]); }
      else if (k === 'draw') doDraw('stock');
    });
    api.on(window, 'keydown', e => {
      if (C.M.mode === 'title' || C.paneOpen() || !V || (e.target.closest && e.target.closest('input,textarea'))) return;
      const k = e.key.toLowerCase(), hand = sortHand(V.hand);
      if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); cur = clamp((cur < 0 ? (k === 'arrowleft' ? hand.length : -1) : cur) + (k === 'arrowleft' ? -1 : 1), 0, hand.length - 1); render(); }
      else if (k === ' ' && cur >= 0 && cur < hand.length) { e.preventDefault(); const id = hand[cur]; if (sel.has(id)) sel.delete(id); else sel.add(id); snd.play('select'); render(); }
      else if (k === 'd') doDraw('stock');
      else if (k === 't') doDraw('disc');
      else if (k === 'l') doLay();
      else if (k === 's') { mode = mode === 'num' ? 'col' : 'num'; render(); }
      else if (k === 'enter') {
        e.preventDefault();
        if (!mine()) return;
        if (V.stage === 'draw') doDraw('stock');
        else if (sel.size === 1) doDiscard([...sel][0]);
        else if (!V.lay[V.seat]) doLay();
      } else if (k === 'backspace' || k === 'delete') { sel.clear(); render(); }
    });

    function showResult(v) {
      const res = v.res; if (!res) return;
      const over = v.phase === 'over', me = v.seat;
      const mt = id => `<i class="p1-mt ${p10W(id) ? 'w' : p10S(id) ? 's' : 'c' + p10C(id)}">${p10W(id) ? 'W' : p10S(id) ? 'S' : p10N(id)}</i>`;
      const rows = Array.from({ length: v.n }, (_, i) => i).sort((a, b) => (over ? res.scores[a] - res.scores[b] : a - b));
      const body = rows.map(i => `<tr class="${i === res.w ? 'win' : ''} ${i === me ? 'me' : ''}"><td>${esc(C.name(i))}</td><td>${res.done[i] ? '<span style="color:#7be08e">Phase ' + res.was[i] + ' done</span>' : 'Phase ' + res.was[i]}</td><td>${res.hands[i].length ? res.hands[i].slice().sort((a, b) => a - b).map(mt).join('') : '<span style="color:var(--gold)">out!</span>'}</td><td>${res.pts[i] ? '+' + res.pts[i] : '0'}</td><td>${res.scores[i]}</td></tr>`).join('');
      let title, sub;
      if (over) {
        const w = v.final.w, iWin = w.includes(me);
        title = iWin ? (w.length > 1 ? 'You share the win!' : 'You win the game!') : w.length > 1 ? 'A shared win' : C.name(w[0]) + ' wins the game';
        sub = 'Lowest score among those who finished Phase ' + v.last;
        if (!finalShown) { finalShown = true; snd.play(iWin ? 'win' : 'lose'); if (iWin) api.submit(Math.max(1, v.scores[me])); }
      } else {
        title = res.w === me ? 'You went out!' : C.name(res.w) + ' went out';
        sub = 'Hand ' + v.round + ' · ' + (res.done[me] ? 'you completed Phase ' + res.was[me] : 'you stay on Phase ' + res.was[me]);
        snd.play(res.w === me ? 'win' : 'round');
      }
      const foot = over ? C.endButtons() : v.ready[me] ? '<p>Waiting for the other players...</p>' : '<button class="gx-big g" data-a="ready">Next hand</button>';
      C.showPane('res', `<div class="gx-box wide"><p class="gx-kick">${over ? 'Game over' : 'Hand ' + v.round + ' result'}</p><h3>${esc(title)}</h3><p>${esc(sub)}</p><div style="overflow-x:auto"><table class="gx-tbl"><tr><th>Player</th><th>Phase</th><th>Cards left</th><th>Points</th><th>Total</th></tr>${body}</table></div>${foot}</div>`, a => { if (a === 'ready') { C.act({ t: 'ready' }); showResult(V); } }, '');
    }

    api.interval(() => {
      if (!V || V.phase !== 'play' || !deadAt) { stage.querySelectorAll('.p1-tm').forEach(t => { t.style.width = '0'; }); return; }
      const t = Date.now();
      if (api.paused) deadAt += t - (lastTick || t);
      lastTick = t;
      const left = deadAt - t, ch = eTop.querySelector(`[data-s="${V.turn}"] .p1-tm`);
      if (ch) { ch.style.width = Math.max(0, Math.min(100, left / (V.timer * 1000) * 100)) + '%'; ch.classList.toggle('lo', left < 10000); }
      const sec = Math.ceil(left / 1000);
      if (mine() && sec !== lastSec && sec <= 10 && sec > 0) { lastSec = sec; snd.play(sec <= 3 ? 'warn' : 'tick'); }
    }, 250);

    return {
      begin() {
        V = null; sel.clear(); order = []; drag = null; discSeq = [-1, -1]; cur = -1; finalShown = false; lastSig = ''; closePick();
        eC.innerHTML = ''; eG.innerHTML = ''; eTop.innerHTML = '';
        api.label('Score (low wins)'); api.score(0);
        geo();
      },
      update,
      resize(W, H, port) { L = { W, H, port }; geo(); if (V) { drawTop(); render(true); } },
      busy: () => now() < busyUntil || !!(drag && drag.started),
      destroy() { clearTimeout(resT); }
    };
  }

  const p1Logo = () => `<div class="p1-lg">${[[0, 3], [1, 7], [2, 10], [3, 5]].map(([c, n], i) => `<i class="c${c}" style="transform:rotate(${(i - 1.5) * 9}deg) translateY(${Math.abs(i - 1.5) * 3}px)">${n}</i>`).join('')}<i class="w" style="transform:rotate(15deg) translateY(5px)">W</i></div><h2 class="p1-name">Phase <span>10</span></h2>`;
  const p1Rules = `<h4>The goal</h4><p>Complete all 10 phases before anyone else. Each hand you try to lay down your current phase and go out; the player who finishes Phase 10 with the lowest score wins.</p>
<h4>The cards</h4><p>108 cards: 1 to 12 in four colours (two of each), 8 Wilds and 4 Skips. Everyone gets 10 cards.</p>
<h4>The 10 phases</h4><ol><li>2 sets of 3</li><li>1 set of 3 + 1 run of 4</li><li>1 set of 4 + 1 run of 4</li><li>1 run of 7</li><li>1 run of 8</li><li>1 run of 9</li><li>2 sets of 4</li><li>7 cards of one colour</li><li>1 set of 5 + 1 set of 2</li><li>1 set of 5 + 1 set of 3</li></ol>
<p>A <b>set</b> is cards of the same number, a <b>run</b> is consecutive numbers (colour does not matter), a colour group is cards of one colour. Runs do not wrap from 12 to 1.</p>
<h4>Your turn</h4><ul><li><b>Draw</b> the top card of the stock or the discard pile (a Skip cannot be taken from the discard pile).</li><li><b>Lay down</b> your phase when you have it, once per hand, all at once.</li><li>After laying down you can <b>hit</b>: add cards to any laid group, yours or others'.</li><li><b>Discard</b> one card to end your turn. Going out means playing your last card by hitting or discarding.</li></ul>
<h4>Wild and Skip</h4><p>A Wild stands for any number (or colour in a colour group), but a group needs at least one natural card. A Skip discarded makes you choose a player who loses their next turn. A Skip turned up at the start skips the first player.</p>
<h4>Scoring</h4><p>When someone goes out the others score the cards left in their hand: 1 to 9 = 5 points, 10 to 12 = 10, Skip = 15, Wild = 25. Only players who laid down their phase move on to the next phase; the others repeat it. The lowest total wins. Ties share the win.</p>
<h4>Controls</h4><p>Click or tap the stock or the discard pile to draw. Tap cards to select them, then <b>Lay down</b> (with nothing selected the game finds your phase for you). Drag a card to the discard pile to discard, onto a laid group to hit, or inside your hand to reorder. Double-tap a card to discard it. <kbd>D</kbd> stock <kbd>T</kbd> discard pile <kbd>L</kbd> lay down <kbd>S</kbd> sort <kbd>←</kbd><kbd>→</kbd> <kbd>Space</kbd> select <kbd>Enter</kbd> discard.</p>`;

  const p1CoverCard = (x, y, r, c, n, w) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-34" y="-48" width="68" height="96" rx="8" fill="${c}" stroke="#fff" stroke-width="3"/><circle cy="2" r="24" fill="#fff"/><text y="17" font-size="${n.length > 1 ? 36 : 44}" fill="${w || c}">${n}</text></g>`;

  Ameplay.register({
    id: 'phase-10',
    title: 'Phase 10',
    category: 'Board',
    tint: '#2f6fdb',
    better: 'low',
    blurb: 'The rummy race through 10 phases: sets, runs and colour groups, Wilds, Skips and hitting on laid phases. 2 to 6 players, vs the computer or online.',
    help: 'Click the stock or discard pile to draw · select cards, <kbd>L</kbd> lay down · drag to discard or hit · <kbd>Enter</kbd> discard',
    width: 1000,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="26" height="36" rx="4" transform="rotate(-10 21 32)"/><rect x="26" y="12" width="26" height="36" rx="4" transform="rotate(8 39 30)"/><path d="M33 22v16M29 26h6M42 22v14"/></svg>',
    css: baseCss('phase-10') + p1Css('phase-10') + `
.gm-phase-10 .p1-lg{display:flex;justify-content:center;gap:5px;margin:8px 0 6px;height:74px}
.gm-phase-10 .p1-lg i{display:grid;place-items:center;width:48px;height:64px;border-radius:8px;border:3px solid #fff;font:900 30px/1 'Trebuchet MS',var(--sans);font-style:normal;color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.35),0 6px 10px rgba(0,0,0,.4)}
.gm-phase-10 .p1-lg i.c0{background:${P10_COL[0]}}.gm-phase-10 .p1-lg i.c1{background:${P10_COL[1]}}.gm-phase-10 .p1-lg i.c2{background:${P10_COL[2]}}.gm-phase-10 .p1-lg i.c3{background:${P10_COL[3]}}
.gm-phase-10 .p1-lg i.w{background:conic-gradient(from 30deg,#ef5a4f,#f8cd45,#46bd75,#4a8df0,#b574e8,#ef5a4f);font-size:22px;text-shadow:0 1px 2px #000}
.gm-phase-10 .p1-name{margin:4px 0 4px;font:900 42px/1 Georgia,serif;font-style:italic;color:#fff;letter-spacing:-.5px;text-shadow:0 3px 0 rgba(0,0,0,.35)}
.gm-phase-10 .p1-name span{color:var(--gold)}
`,
    mount(root, api) {
      const S = {
        id: 'phase-10', title: 'Phase 10',
        logo: p1Logo(), tagline: '2 to 6 players · 10 phases · lowest score wins', soloSub: 'Choose your opponents',
        rules: p1Rules,
        defaults: { diff: 'Normal', opp: 2, last: 10, timer: 0 },
        options: [
          { k: 'opp', label: 'Opponents', solo: true, opts: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']] },
          { k: 'diff', label: 'Computer', opts: [['Easy', 'Easy'], ['Normal', 'Normal'], ['Hard', 'Hard']] },
          { k: 'last', label: 'Game length', sub: 'Phases to complete', opts: [[10, '10 phases'], [5, 'Short: 5']] },
          { k: 'timer', label: 'Turn timer', sub: 'Auto-discards when out of time', opts: [[0, 'Off'], [30, '30s'], [60, '60s'], [90, '90s']] }
        ],
        online: { sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true },
        opponents: o => clamp(+o.opp || 2, 1, 5),
        cfg: o => ({ last: +o.last === 5 ? 5 : 10, timer: +o.timer || 0 }),
        create: p10Create, act: p10Act, view: p10View, fev: p10Fev, who: p10Who, bot: p10Bot, fallback: p10Fallback, tick: p10Tick, shift: p10Shift,
        score: (s, seat) => s.final ? Math.max(1, s.scores[seat]) : null,
        delay: s => s.phase === 'between' ? 250 : (s.pace || 700) + Math.random() * 500,
        ui: p1Ui
      };
      const C = Core(api, root, S);
      C.start();
      return { destroy() { C.destroy(); } };
    }
  });

  Ameplay.covers['phase-10'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="p1c" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#2b5d86"/><stop offset="1" stop-color="#0c2236"/></radialGradient><linearGradient id="p1w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef5a4f"/><stop offset=".35" stop-color="#f8cd45"/><stop offset=".65" stop-color="#46bd75"/><stop offset="1" stop-color="#4a8df0"/></linearGradient></defs><rect width="400" height="300" fill="url(#p1c)"/><text x="200" y="168" font-family="Georgia,serif" font-style="italic" font-weight="900" font-size="120" text-anchor="middle" fill="rgba(255,255,255,.06)">10</text><g font-family="Trebuchet MS,Arial,sans-serif" font-weight="900" text-anchor="middle">${p1CoverCard(76, 96, -9, '#d93a32', '7')}${p1CoverCard(120, 92, -3, '#2f6fdb', '7')}${p1CoverCard(164, 94, 4, '#2f9f58', '7')}${p1CoverCard(256, 96, -4, '#f2b81a', '4')}${p1CoverCard(300, 92, 2, '#d93a32', '5')}${p1CoverCard(344, 96, 8, '#2f6fdb', '6')}${p1CoverCard(60, 224, -8, '#2f6fdb', '12')}${p1CoverCard(112, 222, -2, '#f2b81a', '3')}${p1CoverCard(164, 224, 5, 'url(#p1w)', 'W', '#16171d')}<g transform="translate(236 224) rotate(-6)"><rect x="-34" y="-48" width="68" height="96" rx="8" fill="#16171d" stroke="#fff" stroke-width="3"/><circle cy="0" r="22" fill="none" stroke="#e8392f" stroke-width="7"/><path d="M-16 16L16 -16" stroke="#e8392f" stroke-width="7"/></g><g transform="translate(310 224) rotate(5)"><rect x="-34" y="-48" width="68" height="96" rx="8" fill="#1c2c63" stroke="#fff" stroke-width="3"/><text y="14" font-family="Georgia,serif" font-style="italic" font-size="42" fill="#f5c542">10</text></g></g></svg>`;

})();
