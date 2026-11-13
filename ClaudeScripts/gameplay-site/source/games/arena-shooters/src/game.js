  const DIFFS = ['Easy', 'Normal', 'Hard', 'Hardest'];
  const LVL_XP = n => 400 + n * 150;
  function checkSave(raw, G) {
    const d = { v: 1, cls: 0, mode: G.modes[0].key, map: 'random', diff: 1, bots: G.defBots || 6, sens: 1, ads: 0.8, fov: G.defFov || 78, inv: false, q: -1, vol: 0.8, help: false, name: '', st: { m: 0, w: 0, k: 0, d: 0, h: 0, sh: 0, hi: 0, best: 0, bs: 0, xp: 0, t: 0 } };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
    const num = (v, a, b, def) => typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : def;
    const o = d;
    o.cls = num(raw.cls, 0, G.classes.length - 1, 0) | 0;
    o.mode = typeof raw.mode === 'string' && G.modes.some(m => m.key === raw.mode) ? raw.mode : d.mode;
    o.map = typeof raw.map === 'string' && (raw.map === 'random' || G.maps.some(m => m.key === raw.map)) ? raw.map : 'random';
    o.diff = num(raw.diff, 0, 3, 1) | 0;
    o.bots = num(raw.bots, 1, G.maxBots || 11, d.bots) | 0;
    o.sens = num(raw.sens, 0.1, 5, 1); o.ads = num(raw.ads, 0.2, 2, 0.8); o.fov = num(raw.fov, 60, 110, d.fov); o.vol = num(raw.vol, 0, 1, 0.8);
    o.q = raw.q === -1 || [0, 1, 2, 3].includes(raw.q) ? raw.q : -1;
    o.inv = raw.inv === true; o.help = raw.help === true;
    o.name = typeof raw.name === 'string' ? raw.name.replace(/[<>&"']/g, '').slice(0, 16) : '';
    if (raw.st && typeof raw.st === 'object' && !Array.isArray(raw.st)) for (const k in d.st) o.st[k] = num(raw.st[k], 0, 1e9, 0);
    return o;
  }

  function arenaGame(G) {
    G.mapCache = {};
    G.headY = G.headY || (h => h - 0.25);
    G.engine = { mkWorld, mkPlayer, spawnPlayer, stepWorld, botClass, compileMap, BOTL, navNear, navPath };
    const ID = G.id, R = '.gm-' + ID;
    return {
      id: ID, title: G.title, category: '3D', tint: G.tint, ownPause: true, _def: G,
      blurb: G.blurb, help: G.help, better: 'high', width: 960,
      format: v => v + ' ' + (v === 1 ? 'kill' : 'kills'),
      icon: G.icon,
      css: CORE_CSS(R) + G.css(R),
      mount(root, api) {
        const wrap = document.createElement('div'); wrap.className = 'fp-wrap'; root.append(wrap);
        let cleanup = null;
        const narrow = root.clientWidth && root.clientWidth < 560 && innerHeight > innerWidth;
        api.gl(narrow ? 600 : 960, narrow ? 900 : 600, { antialias: !COARSE }).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v, G); }).catch(e => {
          console.error(e);
          if (api.alive) api.overlay({ kicker: '3D', title: 'WebGL unavailable', text: 'This game needs WebGL, which your browser could not start.', button: null });
        });
        return { destroy() { if (cleanup) cleanup(); } };
      }
    };
  }

  const CORE_CSS = R => `
${R}{gap:0}
${R} .fp-wrap{position:relative;max-width:100%;overflow:hidden;border-radius:var(--r);container-type:size;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;background:#000}
${R} .fp-wrap canvas{position:absolute;inset:0;width:100%!important;height:100%!important;aspect-ratio:auto!important;display:block;border-radius:0}
${R} .fp-hud,${R} .fp-ui{position:absolute;inset:0;pointer-events:none}
${R} .fp-hud[hidden],${R} .fp-ui [hidden]{display:none!important}
${R} .fp-ui > *{pointer-events:auto}
${R} .fp-ch{position:absolute;left:50%;top:50%;width:0;height:0}
${R} .fp-ch i{position:absolute;background:var(--ch,#fff);box-shadow:0 0 0 1px rgba(0,0,0,.55);border-radius:1px}
${R} .fp-ch .a,${R} .fp-ch .b{width:2px;height:clamp(6px,1.4cqw,11px);left:-1px}
${R} .fp-ch .c,${R} .fp-ch .d{height:2px;width:clamp(6px,1.4cqw,11px);top:-1px}
${R} .fp-ch .o{width:3px;height:3px;left:-1.5px;top:-1.5px;border-radius:50%}
${R} .fp-hm{position:absolute;left:50%;top:50%;width:0;height:0;opacity:0}
${R} .fp-hm i{position:absolute;width:2px;height:clamp(7px,1.5cqw,12px);background:#fff;left:-1px;top:calc(-0.5 * clamp(7px,1.5cqw,12px))}
${R} .fp-hm.k i{background:#ff3b3b}
${R} .fp-dmg{position:absolute;left:50%;top:50%;width:0;height:0}
${R} .fp-dmg i{position:absolute;left:calc(clamp(40px,10cqw,80px) * -1);top:calc(clamp(40px,10cqw,80px) * -1);width:calc(clamp(40px,10cqw,80px) * 2);height:calc(clamp(40px,10cqw,80px) * 2);border-radius:50%;border-top:clamp(4px,.8cqw,7px) solid rgba(255,40,40,.85);opacity:0;filter:drop-shadow(0 0 4px rgba(255,0,0,.6))}
${R} .fp-vig{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(200,0,0,.55) 100%)}
${R} .fp-scope{position:absolute;inset:0;opacity:0}
${R} .fp-feed{position:absolute;right:1.4cqw;top:1.4cqw;display:flex;flex-direction:column;align-items:flex-end;gap:.5cqw}
${R} .fp-feed div{display:flex;align-items:center;gap:.6cqw;padding:.35cqw .8cqw;font-size:clamp(10px,1.45cqw,15px);white-space:nowrap;max-width:46cqw;overflow:hidden}
${R} .fp-feed svg{height:1.2em;width:auto;flex:none}
${R} .fp-feed b{font-weight:800;overflow:hidden;text-overflow:ellipsis;max-width:16cqw}
${R} .fp-pop{position:absolute;left:0;right:0;top:27%;text-align:center;pointer-events:none}
${R} .fp-pop div{display:inline-block;font-size:clamp(16px,3.4cqw,34px);font-weight:900;letter-spacing:.02em}
${R} .fp-sub{position:absolute;left:0;right:0;top:58%;text-align:center;font-size:clamp(11px,1.7cqw,17px);font-weight:800}
${R} .fp-tc{position:absolute;left:50%;top:1.2cqw;transform:translateX(-50%);display:flex;align-items:center;gap:.8cqw}
${R} .fp-tl{position:absolute;left:1.4cqw;top:1.4cqw;display:flex;flex-direction:column;gap:.3cqw;font-size:clamp(10px,1.35cqw,14px)}
${R} .fp-tl div{display:flex;gap:.8cqw;justify-content:space-between;min-width:14cqw;padding:.25cqw .7cqw}
${R} .fp-tl span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:12cqw}
${R} .fp-chat{position:absolute;left:1.4cqw;bottom:16cqh;width:38cqw;display:flex;flex-direction:column;gap:.3cqw;font-size:clamp(10px,1.35cqw,14px)}
${R} .fp-chat div{padding:.2cqw .6cqw;background:rgba(0,0,0,.4);color:#fff;border-radius:4px;overflow-wrap:anywhere;transition:opacity .6s}
${R} .fp-chat input{pointer-events:auto;font:inherit;padding:.5cqw .8cqw;border-radius:6px;border:2px solid rgba(255,255,255,.5);background:rgba(0,0,0,.65);color:#fff;outline:0}
${R} .fp-hint{position:absolute;left:50%;bottom:22cqh;transform:translateX(-50%);font-size:clamp(11px,1.5cqw,15px);font-weight:800;padding:.4cqw 1cqw;border-radius:6px;background:rgba(0,0,0,.5);color:#fff;white-space:nowrap}
${R} .fp-touch{position:absolute;inset:0;pointer-events:none}
${R} .fp-tm .fp-feed{top:calc(12cqmin + 1.4cqw)}
${R} .fp-touch .tb{position:absolute;pointer-events:auto;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.32);border:2px solid rgba(255,255,255,.55);color:#fff;font-weight:800;font-size:clamp(9px,2.6cqmin,13px);touch-action:none;user-select:none;-webkit-user-select:none}
${R} .fp-touch .tb.on{background:rgba(255,255,255,.35)}
${R} .fp-touch .tb svg{width:58%;height:58%}
${R} .fp-stick{position:absolute;width:24cqmin;height:24cqmin;margin:-12cqmin 0 0 -12cqmin;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:rgba(0,0,0,.18);pointer-events:none}
${R} .fp-stick i{position:absolute;left:50%;top:50%;width:10cqmin;height:10cqmin;margin:-5cqmin 0 0 -5cqmin;border-radius:50%;background:rgba(255,255,255,.55)}
${R} .fp-menu{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:2cqmin;overflow:auto}
${R} .fp-card{max-height:100%;overflow:auto;scrollbar-width:thin}
${R} .fp-row{display:flex;flex-wrap:wrap;gap:.6cqw;align-items:center}
${R} .fp-seg{display:inline-flex;flex-wrap:wrap;gap:4px}
${R} .fp-seg button,${R} .fp-btn{font:inherit;cursor:pointer;border:0}
${R} .fp-btn:focus-visible,${R} .fp-seg button:focus-visible,${R} .fp-cls:focus-visible{outline:3px solid #fff;outline-offset:2px}
${R} .fp-sb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none!important}
${R} .fp-sb table{border-collapse:collapse;font-size:clamp(10px,1.4cqw,15px)}
${R} .fp-sb td,${R} .fp-sb th{padding:.45cqw 1.1cqw;text-align:right;white-space:nowrap}
${R} .fp-sb td:nth-child(2),${R} .fp-sb th:nth-child(2){text-align:left;max-width:22cqw;overflow:hidden;text-overflow:ellipsis}
${R} .fp-range{display:flex;align-items:center;gap:1cqw}
${R} .fp-main{display:grid;grid-template-columns:1.25fr 1fr;gap:clamp(10px,2.4cqw,28px);align-items:start}
${R} .fp-col{min-width:0}
${R} .fp-clsl{display:grid;grid-template-columns:1fr 1fr;gap:.4em}
${R} .fp-clsl .fp-cls{flex-direction:row;align-items:center;gap:.5em;padding:.4em .5em}
${R} .fp-clsl .fp-cls .ic{flex:none;width:2.6em;height:1.3em}
${R} .fp-clsl .fp-cls .tx{display:flex;flex-direction:column;min-width:0}
${R} .fp-clsl .fp-cls b,${R} .fp-clsl .fp-cls small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${R} .fp-clsd{margin-top:.6em;font-size:clamp(10px,1.3cqw,13px)}
${R} .fp-clsd p{margin:0 0 .5em;min-height:2.6em}
${R} .fp-clsd .bars{display:flex;flex-direction:column;gap:3px}
${R} .fp-clsd .bars span{display:flex;align-items:center;gap:.5em}
${R} .fp-clsd .bars em{font-style:normal;width:5.5em;flex:none}
${R} .fp-clsd .bars i{flex:1;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--acc2) var(--v),rgba(255,255,255,.12) var(--v))}
${R} .fp-acts.sm{margin-top:.5em}
@container (max-width:620px){${R} .fp-main{grid-template-columns:1fr}}
${R} .fp-range input{flex:1;min-width:0;accent-color:var(--acc,#ffcf33)}
@container (max-width:620px){${R} .fp-feed div{font-size:10px}${R} .fp-tl{display:none}}
`;

  function run(root, wrap, api, V, G) {
    const { THREE, renderer, canvas } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    {
      const cvs = canvas.style;
      for (const k of ['width', 'aspectRatio']) { let val = cvs[k]; Object.defineProperty(cvs, k, { configurable: true, get: () => val, set: x => { val = x; wrap.style[k] = x; } }); }
    }
    wrap.append(canvas);
    const view = mkView(api, V, G, wrap);
    const audio = mkAudio(api, G);
    let SV = checkSave(api.load(), G);
    const persist = () => api.save(SV);
    audio.vol = SV.vol;
    const PR = fitPR(api, V);
    if (SV.q >= 0) PR.force = SV.q;
    const hud = document.createElement('div'); hud.className = 'fp-hud'; hud.setAttribute('translate', 'no'); hud.hidden = true;
    hud.innerHTML = `<div class="fp-scope"></div><div class="fp-vig"></div><div class="fp-dmg"></div><div class="fp-ch"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><i class="o"></i></div><div class="fp-hm"><i style="transform:rotate(45deg) translateY(-160%)"></i><i style="transform:rotate(135deg) translateY(-160%)"></i><i style="transform:rotate(225deg) translateY(-160%)"></i><i style="transform:rotate(315deg) translateY(-160%)"></i></div><div class="fp-tl"></div><div class="fp-tc"></div><div class="fp-feed"></div><div class="fp-pop"></div><div class="fp-sub"></div>${G.hudHTML()}<div class="fp-chat"></div><div class="fp-hint" hidden></div><div class="fp-touch" hidden></div>`;
    wrap.append(hud);
    const ui = document.createElement('div'); ui.className = 'fp-ui'; ui.setAttribute('data-i18n', '');
    wrap.append(ui);
    const $ = s => hud.querySelector(s);
    const H = { ch: $('.fp-ch'), chA: $('.fp-ch .a'), chB: $('.fp-ch .b'), chC: $('.fp-ch .c'), chD: $('.fp-ch .d'), hm: $('.fp-hm'), dmg: $('.fp-dmg'), vig: $('.fp-vig'), scope: $('.fp-scope'), tl: $('.fp-tl'), tc: $('.fp-tc'), feed: $('.fp-feed'), pop: $('.fp-pop'), sub: $('.fp-sub'), chat: $('.fp-chat'), hint: $('.fp-hint'), touch: $('.fp-touch') };
    G.hudBind(hud, H);
    const cache = {};
    const setT = (el, k, v) => { if (cache[k] !== v) { cache[k] = v; el.textContent = v; } };
    const setS = (el, k, prop, v) => { if (cache[k] !== v) { cache[k] = v; el.style[prop] = v; } };
    const setH = (el, k, v) => { if (cache[k] !== v) { cache[k] = v; el.innerHTML = v; } };

    let scr = 'menu', W = null, me = null, paused = false, menuT = 0, over = null, sbOpen = false, chatOpen = false, deathUI = null, lastRaf = performance.now(), simAcc = 0, roundN = 0, matchT0 = 0;
    const look = { yaw: 0, pitch: 0, roll: 0 };
    const keys = new Set();
    const NET = { role: null, slot: 0, players: [], bots: false, size: 0, buf: [], off: 0, offSet: false, lastIn: 0, inSeq: 0, lastSnap: 0, names: [], hooked: false, cfg: null, pend: [], lastSc: 0, guestEv: [], snapK: 0, rtt: 0 };
    const online = () => !!NET.role;
    const FEED = [], POPS = [];

    const locked = () => document.pointerLockElement === canvas;
    let freeMouse = false, unlockIntent = false, lockT = 0, uiT = 0, wantLock = 0, touchMode = COARSE, padOn = false, padT = 0;
    function lockMouse() {
      if (touchMode || locked() || scr !== 'play' || paused) return;
      wantLock = performance.now();
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { freeMouse = true; }); } catch (e) { freeMouse = true; }
    }
    function releaseMouse() { uiT = performance.now(); if (locked()) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) {} } }
    api.on(document, 'pointerlockchange', () => {
      const t = performance.now();
      if (locked()) { freeMouse = false; lockT = t; if (scr !== 'play' || paused || chatOpen) releaseMouse(); return; }
      clearButtons();
      if (unlockIntent) { unlockIntent = false; return; }
      if (t - uiT < 500) return;
      if (scr === 'play' && !paused && !chatOpen && !touchMode) openPause();
    });
    api.on(document, 'pointerlockerror', () => { freeMouse = true; });
    const inp = { fire: false, ads: false, adsT: false, mxT: 0, mzT: 0, jumpT: false, crouchT: false, fireT: false, lookX: 0, lookY: 0 };
    function clearButtons() { inp.fire = false; inp.ads = false; keys.clear(); }

    const lookBy = (dx, dy) => {
      if (scr !== 'play' || paused || !me) return;
      const z = me.alive ? G.fovFor(me) : 1;
      const k = 0.0021 * SV.sens * (me.adsF > 0.5 ? SV.ads / Math.max(1, z * 0.75) : 1);
      look.yaw -= dx * k; look.pitch = clamp(look.pitch - dy * k * (SV.inv ? -1 : 1), -1.55, 1.55);
    };
    api.on(document, 'mousemove', e => {
      if (touchMode && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      if (locked()) { if (Math.abs(e.movementX) < 500 && Math.abs(e.movementY) < 500) lookBy(e.movementX, e.movementY); return; }
      if (freeMouse && scr === 'play' && !paused && (e.buttons & 3) && !touchMode) lookBy(e.movementX || 0, e.movementY || 0);
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('mousedown', e => {
      if (e.target.closest('.fp-ui button,.fp-ui input,.fp-ui select,.fp-ui a,.fp-chat input')) return;
      if (performance.now() - lastTouch < 800) return;
      if (touchMode) { touchMode = false; touchUI(); }
      audio.unlock();
      if (scr !== 'play' || paused) return;
      e.preventDefault();
      if (!locked() && !freeMouse) { lockMouse(); return; }
      if (e.button === 0) inp.fire = true;
      else if (e.button === 2) inp.ads = true;
      else if (e.button === 1) pressN('nadeN');
    });
    api.on(window, 'mouseup', e => { if (e.button === 0) inp.fire = false; if (e.button === 2) inp.ads = false; });
    api.on(window, 'blur', () => { clearButtons(); });
    api.on(document, 'visibilitychange', () => { if (document.hidden) clearButtons(); });
    wrap.addEventListener('wheel', e => { if (scr === 'play' && !paused && !e.target.closest('.fp-card')) { e.preventDefault(); if (Math.abs(e.deltaY) > 2 && performance.now() - (inp.wheelT || 0) > 160) { inp.wheelT = performance.now(); pressN('swapN'); } } }, { passive: false });
    const pressN = k => { if (me && scr === 'play' && !paused) me.in[k]++; };
    const KM = Object.assign({ fwd: ['KeyW', 'ArrowUp'], back: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], jump: ['Space'], crouch: ['ShiftLeft', 'KeyC', 'ControlLeft'], reload: ['KeyR'], swap: ['KeyQ'], melee: ['KeyV', 'KeyF'], nade: ['KeyG'], ads: [], sb: ['Tab'], chat: ['Enter', 'KeyT'] }, G.keys || {});
    const has = (k, c) => KM[k].includes(c);
    api.on(window, 'keydown', e => {
      if (!api.alive) return;
      if (!e.isTrusted && padOn && e.code !== 'Escape') return;
      if (e.target && e.target.closest && e.target.closest('input,textarea,select') && !e.target.closest('.fp-chat')) return;
      if (chatOpen) return;
      const c = e.code;
      if (c === 'Escape') { e.preventDefault(); if (e.repeat) return; if (sbOpen) { sbOpen = false; drawSB(); } if (scr === 'play') { if (paused) closePause(); else openPause(); } else if (scr === 'over' && over && over.back) over.back(); return; }
      if (scr !== 'play' || paused) { if (scr === 'dead' && (c === 'Space' || c === 'Enter') && deathUI && deathUI.go) { e.preventDefault(); deathUI.go(); } return; }
      if (has('sb', c)) { e.preventDefault(); if (!e.repeat) { sbOpen = true; drawSB(); } return; }
      if (has('chat', c) && online() && !e.repeat) { e.preventDefault(); openChat(); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(c) || has('crouch', c) && c === 'ControlLeft') e.preventDefault();
      if (e.repeat) return;
      keys.add(c);
      if (!me) return;
      if (me.alive) {
        if (has('reload', c)) me.in.reloadN++;
        else if (has('swap', c)) me.in.swapN++;
        else if (has('melee', c)) me.in.meleeN++;
        else if (has('nade', c)) me.in.nadeN++;
        else if (/^Digit[1-9]$/.test(c)) { const n = +c.slice(5) - 1; if (me.weps[n]) { me.in.slot = n; me.in.slotN++; } }
        if (has('ads', c)) inp.ads = true;
      } else if (deathUI && /^Digit[1-9]$/.test(c)) { const n = +c.slice(5) - 1; if (G.classes[n]) deathUI.pick(n); }
      else if (deathUI && (c === 'Space' || c === 'Enter') && deathUI.go) deathUI.go();
    });
    api.on(window, 'keyup', e => {
      if (!e.isTrusted && padOn && e.code !== 'Escape') return;
      keys.delete(e.code);
      if (has('sb', e.code) && sbOpen) { sbOpen = false; drawSB(); }
      if (has('ads', e.code)) inp.ads = false;
    });

    let lastTouch = 0;
    const TB = {};
    let stick = null, lookT = null;
    function touchUI() {
      H.touch.hidden = !touchMode || scr !== 'play';
      wrap.classList.toggle('fp-tm', touchMode);
      if (!touchMode) return;
      if (H.touch.childElementCount) return;
      const btn = (k, label, x, y, s) => { const b = document.createElement('div'); b.className = 'tb'; b.dataset.k = k; b.style.cssText = `right:${x}cqw;bottom:${y}cqh;width:${s}cqmin;height:${s}cqmin`; b.innerHTML = label; H.touch.append(b); TB[k] = b; return b; };
      const ic = G.touchIcons;
      btn('fire', ic.fire, 5, 24, 19); btn('ads', ic.ads, 23, 38, 13); btn('jump', ic.jump, 3, 50, 14);
      if (G.phys.H !== G.phys.HC) btn('crouch', ic.crouch, 23, 19, 12);
      btn('reload', ic.reload, 17, 62, 10); btn('swap', ic.swap, 3, 68, 10);
      if (G.nade) { btn('nade', ic.nade, 31, 58, 10); btn('melee', ic.melee, 38, 44, 9); } else btn('melee', ic.melee, 31, 58, 10);
      const pb = document.createElement('div'); pb.className = 'tb'; pb.dataset.k = 'pause'; pb.style.cssText = 'right:1.5cqw;top:1.5cqw;width:9cqmin;height:9cqmin;border-radius:12px'; pb.innerHTML = ic.pause; H.touch.append(pb); TB.pause = pb;
      const sb = document.createElement('div'); sb.className = 'tb'; sb.dataset.k = 'sb'; sb.style.cssText = 'right:12cqmin;top:1.5cqw;width:9cqmin;height:9cqmin;border-radius:12px'; sb.innerHTML = ic.sb; H.touch.append(sb); TB.sb = sb;
      const st = document.createElement('div'); st.className = 'fp-stick'; st.innerHTML = '<i></i>'; st.hidden = true; H.touch.append(st); TB.stick = st;
    }
    const touches = new Map();
    const wr = () => wrap.getBoundingClientRect();
    function tStart(e) {
      lastTouch = performance.now();
      if (!touchMode) { touchMode = true; touchUI(); releaseMouse(); }
      audio.unlock();
      if (scr !== 'play' || paused) return;
      if (e.target.closest('.fp-ui button,.fp-ui input,.fp-card')) return;
      e.preventDefault();
      const r = wr();
      for (const t of e.changedTouches) {
        const b = t.target.closest && t.target.closest('.tb');
        const x = t.clientX - r.left, y = t.clientY - r.top;
        if (b) {
          const k = b.dataset.k; b.classList.add('on');
          touches.set(t.identifier, { k, x: t.clientX, y: t.clientY, b });
          if (k === 'fire') inp.fireT = true;
          else if (k === 'ads') inp.adsT = !inp.adsT;
          else if (k === 'jump') inp.jumpT = true;
          else if (k === 'crouch') inp.crouchT = true;
          else if (k === 'reload') pressN('reloadN');
          else if (k === 'swap') pressN('swapN');
          else if (k === 'nade') pressN('nadeN');
          else if (k === 'melee') pressN('meleeN');
          else if (k === 'pause') openPause();
          else if (k === 'sb') { sbOpen = !sbOpen; drawSB(); }
          continue;
        }
        if (x < r.width * 0.42 && !stick) { stick = { id: t.identifier, x0: x, y0: y, x, y }; TB.stick.hidden = false; TB.stick.style.left = x + 'px'; TB.stick.style.top = y + 'px'; touches.set(t.identifier, { k: 'stick' }); }
        else touches.set(t.identifier, { k: 'look', x: t.clientX, y: t.clientY });
      }
    }
    function tMove(e) {
      if (!touches.size) return;
      e.preventDefault();
      const r = wr(), rad = Math.min(r.width, r.height) * 0.12;
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        if (s.k === 'stick' && stick) {
          let dx = t.clientX - r.left - stick.x0, dy = t.clientY - r.top - stick.y0;
          const l = Math.hypot(dx, dy);
          if (l > rad * 1.6) { stick.x0 += dx * (1 - rad * 1.6 / l); stick.y0 += dy * (1 - rad * 1.6 / l); dx = t.clientX - r.left - stick.x0; dy = t.clientY - r.top - stick.y0; TB.stick.style.left = stick.x0 + 'px'; TB.stick.style.top = stick.y0 + 'px'; }
          const k = Math.min(1, Math.hypot(dx, dy) / rad);
          const a = Math.atan2(dy, dx);
          inp.mxT = Math.cos(a) * k; inp.mzT = -Math.sin(a) * k;
          if (Math.hypot(inp.mxT, inp.mzT) < 0.15) inp.mxT = inp.mzT = 0;
          TB.stick.firstChild.style.transform = `translate(${Math.cos(a) * k * rad * 0.6}px,${Math.sin(a) * k * rad * 0.6}px)`;
        } else if (s.k === 'look' || s.k === 'fire' || s.k === 'ads') {
          const dx = t.clientX - s.x, dy = t.clientY - s.y;
          s.x = t.clientX; s.y = t.clientY;
          const k = 2.4 * 900 / Math.max(300, r.width);
          lookBy(dx * k, dy * k);
        }
      }
    }
    function tEnd(e) {
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        touches.delete(t.identifier);
        if (s.b) s.b.classList.remove('on');
        if (s.k === 'stick') { stick = null; TB.stick.hidden = true; inp.mxT = inp.mzT = 0; }
        else if (s.k === 'fire') inp.fireT = false;
        else if (s.k === 'jump') inp.jumpT = false;
        else if (s.k === 'crouch') inp.crouchT = false;
        if (s.b && s.k === 'ads') s.b.classList.toggle('on', inp.adsT);
      }
    }
    wrap.addEventListener('touchstart', tStart, { passive: false });
    wrap.addEventListener('touchmove', tMove, { passive: false });
    wrap.addEventListener('touchend', tEnd);
    wrap.addEventListener('touchcancel', tEnd);
    function resetTouch() { touches.clear(); stick = null; if (TB.stick) TB.stick.hidden = true; inp.mxT = inp.mzT = 0; inp.fireT = inp.jumpT = inp.crouchT = inp.adsT = false; for (const k in TB) if (TB[k].classList) TB[k].classList.remove('on'); }

    const PAD = { prev: [] };
    function readPad(dt) {
      const gp = navigator.getGamepads ? navigator.getGamepads() : null;
      let pad = null;
      if (gp) for (const g of gp) if (g && g.connected && g.mapping === 'standard') { pad = g; break; }
      if (!pad) { if (padOn && performance.now() - padT > 2000) padOn = false; return null; }
      const ax = pad.axes, bt = pad.buttons, dz = v => Math.abs(v) < 0.16 ? 0 : (v - Math.sign(v) * 0.16) / 0.84;
      const pr = i => bt[i] && (bt[i].pressed || bt[i].value > 0.5);
      let any = Math.abs(ax[0]) > 0.3 || Math.abs(ax[1]) > 0.3 || Math.abs(ax[2]) > 0.3 || Math.abs(ax[3]) > 0.3;
      for (let i = 0; i < bt.length; i++) if (pr(i)) any = true;
      if (any) { padOn = true; padT = performance.now(); }
      if (!padOn) return null;
      const edge = i => pr(i) && !PAD.prev[i];
      const out = { mx: dz(ax[0]), mz: -dz(ax[1]), fire: pr(7), ads: pr(6), jump: pr(0), crouch: pr(1) || pr(10) };
      if (scr === 'play' && !paused && me) {
        const lx = dz(ax[2]), ly = dz(ax[3]), sp = 3.2 * SV.sens * dt / 0.0021;
        lookBy(Math.sign(lx) * lx * lx * sp, Math.sign(ly) * ly * ly * sp * 0.75);
        if (edge(2)) me.in.reloadN++;
        if (edge(3)) me.in.swapN++;
        if (edge(5)) { if (G.nade) me.in.nadeN++; else me.in.meleeN++; }
        if (edge(4)) me.in.meleeN++;
      }
      if (edge(9)) { if (scr === 'play') { if (paused) closePause(); else openPause(); } }
      if (edge(8)) { sbOpen = !sbOpen; drawSB(); }
      if (scr === 'dead' && edge(0) && deathUI && deathUI.go) deathUI.go();
      for (let i = 0; i < bt.length; i++) PAD.prev[i] = pr(i);
      return out;
    }

    function localInput(dt) {
      if (!me) return;
      const I = me.in;
      const pad = readPad(dt);
      const act = scr === 'play' && !paused && !chatOpen;
      let mx = 0, mz = 0;
      if (act) {
        for (const c of keys) { if (has('fwd', c)) mz += 1; if (has('back', c)) mz -= 1; if (has('left', c)) mx -= 1; if (has('right', c)) mx += 1; }
        mx = clamp(mx, -1, 1); mz = clamp(mz, -1, 1);
        if (inp.mxT || inp.mzT) { mx = inp.mxT; mz = inp.mzT; }
        if (pad && (pad.mx || pad.mz)) { mx = pad.mx; mz = pad.mz; }
      }
      I.mx = mx; I.mz = mz;
      let jump = false, crouch = false;
      if (act) { for (const c of keys) { if (has('jump', c)) jump = true; if (has('crouch', c)) crouch = true; } }
      I.jump = act && (jump || inp.jumpT || !!(pad && pad.jump));
      I.crouch = act && (crouch || inp.crouchT || !!(pad && pad.crouch));
      I.fire = act && (inp.fire || inp.fireT || !!(pad && pad.fire)) && performance.now() - lockT > 120;
      I.ads = act && (inp.ads || inp.adsT || !!(pad && pad.ads));
      I.yaw = look.yaw; I.pitch = look.pitch;
    }

    const SBD = document.createElement('div'); SBD.className = 'fp-sb'; SBD.hidden = true; ui.append(SBD);
    function standings() {
      if (!W) return [];
      return W.players.filter(p => p && p.inGame).slice().sort((a, b) => b.score - a.score || b.kills - a.kills || a.deaths - b.deaths);
    }
    function pname(p) { return p.slot === (me && me.slot) ? p.name : p.name; }
    function drawSB() {
      SBD.hidden = !sbOpen || !W;
      if (SBD.hidden) return;
      const L = standings();
      const row = (p, i) => `<tr class="${p === me ? 'me' : ''}${W.teams ? ' t' + p.team : ''}"><td>${i + 1}</td><td><span translate="no">${escH(p.name)}</span>${p.bot ? ' <small>' + escH(T('Bot')) + '</small>' : ''}</td><td>${escH(T(G.classes[p.cls].name))}</td><td>${p.score}</td><td>${p.kills}</td><td>${p.deaths}</td><td>${online() && NET.ping && NET.ping[p.slot] != null ? NET.ping[p.slot] : '—'}</td></tr>`;
      const head = `<tr><th>#</th><th>${escH(T('Player'))}</th><th>${escH(T('Class'))}</th><th>${escH(T('Score'))}</th><th>${escH(T('Kills'))}</th><th>${escH(T('Deaths'))}</th><th>${escH(T('Ping'))}</th></tr>`;
      let body;
      if (W.teams) body = [0, 1].map(t => `<tr class="th t${t}"><td colspan="7">${escH(T(G.teams[t]))} · ${W.teamScore[t]}</td></tr>` + L.filter(p => p.team === t).map(row).join('')).join('');
      else body = L.map(row).join('');
      SBD.innerHTML = `<div class="fp-card fp-sbc"><h3>${escH(T(W.mode.name))} · ${escH(T(W.M.def.name))}</h3><table>${head}${body}</table></div>`;
    }

    function itemsPanel(html, cls) {
      ui.querySelectorAll('.fp-menu').forEach(x => x.remove());
      if (html == null) return null;
      const el = document.createElement('div'); el.className = 'fp-menu ' + (cls || '');
      el.innerHTML = html;
      ui.append(el);
      return el;
    }
    const seg = (k, opts, cur) => `<div class="fp-seg" data-seg="${k}">${opts.map(([v, l]) => `<button type="button" class="${String(v) === String(cur) ? 'on' : ''}" data-v="${v}">${escH(l)}</button>`).join('')}</div>`;
    const lvlOf = xp => { let n = 1, x = xp; while (x >= LVL_XP(n)) { x -= LVL_XP(n); n++; } return { n, x, need: LVL_XP(n) }; };
    function classCards(sel, small) {
      return `<div class="fp-clsg${small ? ' sm' : ''}">${G.classes.map((c, i) => { const w = G.weapons[c.prim]; return `<button type="button" class="fp-cls${i === sel ? ' on' : ''}" data-cls="${i}"><span class="ic">${G.wepIcon(c.prim)}</span><b>${escH(T(c.name))}</b><small>${escH(T(w.name))}</small>${small ? '' : `<span class="bars">${G.statBars(c).map(([l, v]) => `<span><em>${escH(T(l))}</em><i style="--v:${Math.round(v * 100)}%"></i></span>`).join('')}</span>`}<kbd>${i + 1}</kbd></button>`; }).join('')}</div>`;
    }
    function clsDetail(i) {
      const c = G.classes[i];
      return `<p>${escH(T(c.desc))}</p><span class="bars">${G.statBars(c).map(([l, v]) => `<span><em>${escH(T(l))}</em><i style="--v:${Math.round(clamp(v, 0.04, 1) * 100)}%"></i></span>`).join('')}</span>`;
    }
    function classList(sel) {
      return `<div class="fp-clsl">${G.classes.map((c, i) => `<button type="button" class="fp-cls${i === sel ? ' on' : ''}" data-cls="${i}"><span class="ic">${G.wepIcon(c.prim)}</span><span class="tx"><b>${escH(T(c.name))}</b><small>${escH(T(G.weapons[c.prim].name))}</small></span><kbd>${i + 1}</kbd></button>`).join('')}</div><div class="fp-clsd">${clsDetail(sel)}</div>`;
    }
    function menu() {
      scr = 'menu'; paused = false; hud.hidden = true; SBD.hidden = true; releaseMouse(); H.touch.hidden = true; deathUI = null;
      if (!W) previewWorld();
      const st = SV.st, L = lvlOf(st.xp);
      const kd = st.d ? (st.k / st.d).toFixed(2) : st.k ? st.k.toFixed(2) : '0.00';
      const el = itemsPanel(`<div class="fp-card fp-main"><div class="fp-col">
<div class="fp-brand">${G.logo()}</div>
<div class="fp-lv"><span class="lvb">${escH(T('Level'))} <b translate="no">${L.n}</b></span><span class="lvbar"><i style="width:${Math.round(L.x / L.need * 100)}%"></i></span><span class="lvs" translate="no">${st.k} ${escH(T('kills'))} · ${escH(T('K/D'))} ${kd} · ${st.w} ${escH(T('wins'))}</span></div>
<div class="fp-opts">
<label>${escH(T('Mode'))}</label>${seg('mode', G.modes.map(m => [m.key, T(m.name)]), SV.mode)}
<label>${escH(T('Map'))}</label>${seg('map', [['random', T('Random')]].concat(G.maps.map(m => [m.key, T(m.name)])), SV.map)}
<label>${escH(T('Bots'))}</label>${seg('diff', DIFFS.map((d, i) => [i, T(d)]), SV.diff)}
<label>${escH(T('Players'))}</label><div class="fp-row fp-num"><button type="button" class="fp-btn sm" data-n="-1" aria-label="${escH(T('Fewer bots'))}">−</button><b translate="no">${SV.bots + 1}</b><button type="button" class="fp-btn sm" data-n="1" aria-label="${escH(T('More bots'))}">+</button><small>${escH(T('you and {n} bots', { n: SV.bots }))}</small></div>
</div>
<div class="fp-acts"><button type="button" class="fp-btn big" data-a="play">${escH(T('Play'))}</button><button type="button" class="fp-btn" data-a="online">${escH(T('Play online'))}</button></div>
<div class="fp-acts sm"><button type="button" class="fp-btn ghost" data-a="opts">${escH(T('Settings'))}</button><button type="button" class="fp-btn ghost" data-a="how">${escH(T('How to play'))}</button></div>
</div><div class="fp-col"><label class="fp-lab">${escH(T('Class'))}</label>${classList(SV.cls)}</div>
</div>`, 'm-main');
      el.onclick = e => {
        audio.unlock();
        const sb = e.target.closest('[data-seg] button');
        if (sb) { const k = sb.parentNode.dataset.seg; SV[k] = k === 'diff' ? +sb.dataset.v : sb.dataset.v; persist(); api.sfx('tap'); sb.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sb)); if (k === 'map') previewWorld(); return; }
        const n = e.target.closest('[data-n]');
        if (n) { SV.bots = clamp(SV.bots + +n.dataset.n, 1, G.maxBots || 11); persist(); api.sfx('tap'); menu(); return; }
        const c = e.target.closest('[data-cls]');
        if (c) { SV.cls = +c.dataset.cls; persist(); api.sfx('tap'); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', b === c)); const dd = el.querySelector('.fp-clsd'); if (dd) dd.innerHTML = clsDetail(SV.cls); return; }
        const a = e.target.closest('[data-a]');
        if (!a) return;
        api.sfx('tap');
        if (a.dataset.a === 'play') startOffline();
        else if (a.dataset.a === 'online') goOnline();
        else if (a.dataset.a === 'opts') settings(menu);
        else if (a.dataset.a === 'how') howTo(menu);
      };
    }
    function settings(back) {
      const el = itemsPanel(`<div class="fp-card fp-set"><h3>${escH(T('Settings'))}</h3>
<label>${escH(T('Mouse sensitivity'))}</label><div class="fp-range"><input type="range" min="0.1" max="4" step="0.05" value="${SV.sens}" data-r="sens"><b translate="no">${SV.sens.toFixed(2)}</b></div>
<label>${escH(T('Aiming sensitivity'))}</label><div class="fp-range"><input type="range" min="0.2" max="2" step="0.05" value="${SV.ads}" data-r="ads"><b translate="no">${SV.ads.toFixed(2)}</b></div>
<label>${escH(T('Field of view'))}</label><div class="fp-range"><input type="range" min="60" max="110" step="1" value="${SV.fov}" data-r="fov"><b translate="no">${SV.fov}</b></div>
<label>${escH(T('Volume'))}</label><div class="fp-range"><input type="range" min="0" max="1" step="0.05" value="${SV.vol}" data-r="vol"><b translate="no">${Math.round(SV.vol * 100)}</b></div>
<label>${escH(T('Invert mouse'))}</label>${seg('inv', [[0, T('Off')], [1, T('On')]], SV.inv ? 1 : 0)}
<label>${escH(T('Graphics'))}</label>${seg('q', [[-1, T('Auto')], [0, T('High')], [1, T('Medium')], [2, T('Low')], [3, T('Lowest')]], SV.q)}
<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Back'))}</button></div></div>`, 'm-set');
      el.addEventListener('input', e => {
        const r = e.target.closest('[data-r]');
        if (!r) return;
        const k = r.dataset.r, v = +r.value;
        SV[k] = v; r.nextElementSibling.textContent = k === 'vol' ? Math.round(v * 100) : k === 'fov' ? v : v.toFixed(2);
        if (k === 'vol') audio.vol = v;
        persist();
      });
      el.onclick = e => {
        const sb = e.target.closest('[data-seg] button');
        if (sb) { const k = sb.parentNode.dataset.seg, v = +sb.dataset.v; if (k === 'inv') SV.inv = !!v; else { SV.q = v; PR.force = v; } persist(); api.sfx('tap'); sb.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === sb)); return; }
        if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); back(); }
      };
    }
    function howTo(back) {
      const el = itemsPanel(`<div class="fp-card fp-how"><h3>${escH(T('How to play'))}</h3>${G.howHTML(T, escH)}<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Back'))}</button></div></div>`, 'm-how');
      el.onclick = e => { if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); SV.help = true; persist(); back(); } };
    }
    function openPause() {
      if (scr !== 'play' || paused) return;
      paused = !online(); clearButtons(); resetTouch(); releaseMouse(); sbOpen = false; SBD.hidden = true;
      const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(online() ? 'Menu' : 'Paused'))}</h3><div class="fp-acts col"><button type="button" class="fp-btn big" data-a="res">${escH(T('Resume'))}</button><button type="button" class="fp-btn" data-a="cls">${escH(T('Change class'))}</button><button type="button" class="fp-btn ghost" data-a="set">${escH(T('Settings'))}</button><button type="button" class="fp-btn ghost" data-a="how">${escH(T('How to play'))}</button><button type="button" class="fp-btn ghost" data-a="quit">${escH(T(online() ? 'Leave game' : 'Quit match'))}</button></div>${online() ? `<p class="fp-note">${escH(T('The match keeps going while this menu is open.'))}</p>` : ''}</div>`, 'm-pause');
      paused = true;
      el.onclick = e => {
        const a = e.target.closest('[data-a]');
        if (!a) return;
        api.sfx('tap');
        const k = a.dataset.a;
        if (k === 'res') closePause();
        else if (k === 'cls') classPick(() => openPauseAgain());
        else if (k === 'set') settings(() => openPauseAgain());
        else if (k === 'how') howTo(() => openPauseAgain());
        else if (k === 'quit') confirmQuit();
      };
    }
    function openPauseAgain() { paused = false; openPause(); }
    function confirmQuit() {
      const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(online() ? 'Leave this game?' : 'Quit this match?'))}</h3><p class="fp-note">${escH(T('Your progress in this match will be lost.'))}</p><div class="fp-acts"><button type="button" class="fp-btn" data-a="no">${escH(T('Stay'))}</button><button type="button" class="fp-btn ghost" data-a="yes">${escH(T(online() ? 'Leave' : 'Quit'))}</button></div></div>`, 'm-pause');
      el.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; api.sfx('tap'); if (a.dataset.a === 'yes') quitMatch(); else openPauseAgain(); };
    }
    function classPick(back) {
      const el = itemsPanel(`<div class="fp-card fp-cp"><h3>${escH(T('Choose a class'))}</h3><p class="fp-note">${escH(T('You change class the next time you spawn.'))}</p>${classCards(me ? me.nextCls : SV.cls)}<div class="fp-acts"><button type="button" class="fp-btn" data-a="back">${escH(T('Done'))}</button></div></div>`, 'm-cp');
      el.onclick = e => {
        const c = e.target.closest('[data-cls]');
        if (c) { setClass(+c.dataset.cls); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', b === c)); api.sfx('tap'); return; }
        if (e.target.closest('[data-a="back"]')) { api.sfx('tap'); back(); }
      };
    }
    function setClass(i) {
      SV.cls = i; persist();
      if (!me) return;
      me.nextCls = i;
      if (NET.role === 'guest') netSend({ t: 'cl', c: i });
    }
    function closePause() {
      if (!paused && scr !== 'play') return;
      paused = false; itemsPanel(null); uiT = performance.now();
      if (me && !me.alive && W && !W.over) showDeath();
      else lockMouse();
      lastRaf = performance.now(); simAcc = 0;
    }

    function previewWorld() {
      const key = SV.map === 'random' ? G.maps[0].key : SV.map;
      const md = G.maps.find(m => m.key === key) || G.maps[0];
      const M = G.mapCache[md.key] || (G.mapCache[md.key] = compileMap(md));
      view.setMap(M);
      menuT = 0;
      for (let i = 0; i < 16; i++) view.dropChar(i);
      view.clearFx();
      previewM = M;
    }
    let previewM = null;

    function teamOf(i, n) { return i % 2; }
    function botNames(n, rnd) {
      const pool = G.botNames.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const q = pool[i]; pool[i] = pool[j]; pool[j] = q; }
      return pool.slice(0, n);
    }
    function myName() {
      try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (p && (p.username || p.displayName)) return String(p.username || p.displayName).replace(/[<>&"']/g, '').slice(0, 16); } catch (e) {}
      return SV.name || T('You');
    }
    function pickMap(rnd) {
      if (SV.map !== 'random') return G.maps.find(m => m.key === SV.map) || G.maps[0];
      return G.maps[Math.floor(rnd() * G.maps.length)];
    }
    function newWorld(md, modeKey, seed, auth) {
      const w = mkWorld(G, md, { mode: modeKey, seed, auth });
      view.setMap(w.M); view.clearFx(); view.teams = w.teams;
      for (let i = 0; i < 16; i++) view.dropChar(i);
      return w;
    }
    function startOffline() {
      const seed = (Math.random() * 1e9) | 0, rnd = mkRng(seed);
      const md = pickMap(rnd);
      W = newWorld(md, SV.mode, seed, true);
      const n = SV.bots, names = botNames(n, rnd);
      me = mkPlayer(W, 0, { name: myName(), team: 0, cls: SV.cls, local: true });
      W.players.push(me);
      for (let i = 0; i < n; i++) {
        const p = mkPlayer(W, i + 1, { name: names[i] || 'Bot ' + (i + 1), team: W.teams ? teamOf(i + 1) : 0, cls: 0, bot: true, diff: SV.diff });
        p.cls = p.nextCls = botClass(W, p);
        p.respawnT = 0.2 + i * 0.05;
        W.players.push(p);
      }
      spawnPlayer(W, me);
      beginPlay();
    }
    function beginPlay() {
      scr = 'play'; paused = false; over = null; itemsPanel(null); hud.hidden = false; FEED.length = 0; POPS.length = 0; sbOpen = false; drawSB(); deathUI = null;
      H.feed.innerHTML = ''; H.pop.innerHTML = ''; H.sub.textContent = ''; H.chat.innerHTML = '';
      for (const k in cache) delete cache[k];
      look.yaw = me.yaw; look.pitch = 0; simAcc = 0; lastRaf = performance.now(); roundN++; matchT0 = performance.now();
      G.hudReset && G.hudReset(H);
      touchUI(); lockMouse();
      if (!SV.help && !touchMode) { showHint(T(G.firstHint), 6); SV.help = true; persist(); }
      W.ev.length = 0;
      audio.play('start');
    }
    let hintT = 0;
    function showHint(s, sec) { H.hint.textContent = s; H.hint.hidden = false; hintT = sec; }
    function quitMatch() {
      if (online()) { leaveOnline(); return; }
      W = null; me = null; itemsPanel(null); menu();
    }

    function showDeath() {
      if (!me || me.alive || scr !== 'play' || paused || W.over) return;
      const k = W.players[me.killer];
      const kn = k && k !== me ? k.name : '';
      const wk = me.killerW && G.weapons[me.killerW] ? T(G.weapons[me.killerW].name) : me.killerW === 'fall' ? T('the fall') : '';
      releaseMouse();
      const el = itemsPanel(`<div class="fp-card fp-death"><p class="fp-kick">${escH(T(kn ? 'Eliminated by' : 'Eliminated'))}</p>${kn ? `<h3 translate="no">${escH(kn)}</h3>` : ''}${wk ? `<p class="fp-note">${escH(wk)}</p>` : ''}<p class="fp-rs" translate="no"></p>${classCards(me.nextCls, true)}${G.manualSpawn ? `<div class="fp-acts"><button type="button" class="fp-btn big" data-a="go" disabled>${escH(T('Respawn'))}</button></div>` : `<p class="fp-note">${escH(T('Pick a class for your next life.'))}</p>`}</div>`, 'm-death');
      const go = el.querySelector('[data-a="go"]');
      deathUI = {
        el, go: null,
        pick(i) { setClass(i); el.querySelectorAll('.fp-cls').forEach(b => b.classList.toggle('on', +b.dataset.cls === i)); api.sfx('tap'); },
        tick() {
          const left = Math.max(0, me.respawnT);
          const t = el.querySelector('.fp-rs');
          if (left > 0) { setT(t, 'rs', T('Respawn in {n}', { n: Math.ceil(left) })); if (go) go.disabled = true; deathUI.go = null; }
          else { setT(t, 'rs', G.manualSpawn ? T('Ready') : ''); if (go) go.disabled = false; deathUI.go = respawnNow; }
        }
      };
      el.onclick = e => {
        const c = e.target.closest('[data-cls]');
        if (c) { deathUI.pick(+c.dataset.cls); return; }
        if (e.target.closest('[data-a="go"]') && deathUI.go) deathUI.go();
      };
    }
    function respawnNow() {
      if (!me || me.alive) return;
      if (me.respawnT > 0) return;
      api.sfx('tap');
      me.wantSpawn = true;
      if (NET.role === 'guest') netSend({ t: 'rs', c: me.nextCls });
      deathUI = null; itemsPanel(null); uiT = performance.now();
      lockMouse();
    }

    function matchOver() {
      if (scr === 'over') return;
      scr = 'over'; releaseMouse(); hud.hidden = true; sbOpen = false; SBD.hidden = true; resetTouch(); H.touch.hidden = true;
      const L = standings();
      let win = false, title;
      if (W.teams) { const t = W.teamScore[0] === W.teamScore[1] ? -1 : W.teamScore[0] > W.teamScore[1] ? 0 : 1; win = t === me.team; title = t < 0 ? T('Draw') : win ? T('Victory') : T('Defeat'); }
      else { win = L[0] === me; title = win ? T('Victory') : T('{name} wins', { name: L[0] ? L[0].name : '' }); }
      const place = L.indexOf(me) + 1;
      const acc = me.shots ? Math.round(me.hits / me.shots * 100) : 0;
      const xp = Math.round(me.score + (win ? 300 : 100));
      const st = SV.st, before = lvlOf(st.xp).n;
      let nb = false;
      if (!over || !over.saved) {
        st.m++; if (win) st.w++; st.k += me.kills; st.d += me.deaths; st.h += me.heads; st.sh += me.shots; st.hi += me.hits; st.bs = Math.max(st.bs, me.bestStreak); st.best = Math.max(st.best, me.kills); st.xp += xp; st.t += Math.round((performance.now() - matchT0) / 1000);
        persist();
        if (me.kills > 0) nb = api.submit(me.kills);
      }
      const after = lvlOf(st.xp).n;
      audio.play(win ? 'win' : 'lose');
      const rows = L.map((p, i) => `<tr class="${p === me ? 'me' : ''}${W.teams ? ' t' + p.team : ''}"><td>${i + 1}</td><td><span translate="no">${escH(p.name)}</span></td><td>${p.score}</td><td>${p.kills}</td><td>${p.deaths}</td></tr>`).join('');
      const host = NET.role === 'host', guest = NET.role === 'guest';
      const btns = guest ? `<button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button>` : host ? `<button type="button" class="fp-btn big" data-a="again">${escH(T('Next match'))}</button><button type="button" class="fp-btn" data-a="lobby">${escH(T('Party lobby'))}</button><button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button>` : `<button type="button" class="fp-btn big" data-a="again">${escH(T('Next match'))}</button><button type="button" class="fp-btn ghost" data-a="menu">${escH(T('Menu'))}</button>`;
      const el = itemsPanel(`<div class="fp-card fp-over ${win ? 'win' : 'lose'}"><p class="fp-kick">${escH(T(W.mode.name))} · ${escH(T(W.M.def.name))}</p><h3>${escH(title)}</h3>${W.teams ? `<p class="fp-ts" translate="no"><span class="t0">${W.teamScore[0]}</span> : <span class="t1">${W.teamScore[1]}</span></p>` : ''}
<div class="fp-stats"><div><b translate="no">#${place}</b><small>${escH(T('Place'))}</small></div><div><b translate="no">${me.kills}</b><small>${escH(T('Kills'))}</small></div><div><b translate="no">${me.deaths}</b><small>${escH(T('Deaths'))}</small></div><div><b translate="no">${acc}%</b><small>${escH(T('Accuracy'))}</small></div><div><b translate="no">${me.heads}</b><small>${escH(T(G.headWord || 'Headshots'))}</small></div><div><b translate="no">+${xp}</b><small>${escH(T('XP'))}</small></div></div>
${after > before ? `<p class="fp-lvup">${escH(T('Level up! You are now level {n}', { n: after }))}</p>` : nb ? `<p class="fp-lvup">${escH(T('New best: {n} kills', { n: me.kills }))}</p>` : ''}
<div class="fp-tbl"><table><tr><th>#</th><th>${escH(T('Player'))}</th><th>${escH(T('Score'))}</th><th>${escH(T('Kills'))}</th><th>${escH(T('Deaths'))}</th></tr>${rows}</table></div>
${guest ? `<p class="fp-note">${escH(T('Waiting for the host to start the next match…'))}</p>` : ''}<div class="fp-acts">${btns}</div></div>`, 'm-over');
      over = { saved: true, at: performance.now(), back: guest ? null : host ? () => toLobby() : () => { W = null; me = null; menu(); } };
      el.onclick = e => {
        const a = e.target.closest('[data-a]');
        if (!a || performance.now() - over.at < 700) return;
        api.sfx('tap');
        const k = a.dataset.a;
        if (k === 'again') { if (host) hostStart(); else startOffline(); }
        else if (k === 'menu') { W = null; me = null; menu(); }
        else if (k === 'lobby') toLobby();
        else if (k === 'leave') leaveOnline();
      };
    }

    const muzzleW = new THREE.Vector3();
    function shotStart(p, out) {
      if (p === me && !thirdPerson) {
        const cp = Math.cos(look.pitch), sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
        const fx = -sy * cp, fy = Math.sin(look.pitch), fz = -cy * cp, rx = cy, rz = -sy;
        const k = me.adsF;
        out.set(camS.x + fx * 0.6 + rx * 0.14 * (1 - k), camS.y + fy * 0.6 - 0.11 * (1 - k) - 0.04, camS.z + fz * 0.6 + rz * 0.14 * (1 - k));
        return out;
      }
      const c = view.chars[p.slot];
      if (c && c.muzzle) { c.root.updateMatrixWorld(); c.muzzle.getWorldPosition(out); return out; }
      return out.set(p.x, p.y + 1.4, p.z);
    }
    const tv = new THREE.Vector3();
    function onEv(e, fromNet) {
      const k = e[0], P = W.players;
      const p = typeof e[1] === 'number' ? P[e[1]] : null;
      const mine = p && p === me;
      if (fromNet && mine && ['fx', 'tr', 'j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'dry', 'nt'].includes(k)) return;
      switch (k) {
        case 'fx': {
          if (!p) break;
          const w = p.weps[e[2]] || p.weps[0];
          const wk = w ? w.k : G.classes[p.cls].prim;
          const d = G.weapons[wk];
          shotStart(p, tv);
          if (mine) { view.kickView(d.vkick || 0.6, d.vroll); fireT = 0; shakeCam(d.shake || 0); }
          else { const c = view.chars[p.slot]; if (c) c.fireT = 0; view.flashAt(tv.x, tv.y, tv.z); }
          audio.play(d.sound || 'rifle', mine ? null : p.x, p.y + 1.5, p.z, mine ? 1 : 0);
          break;
        }
        case 'tr': {
          if (!p) break;
          shotStart(p, tv);
          const x = e[2], y = e[3], z = e[4], kind = e[5];
          const w = p.weps[p.cur]; const d = w ? w.d : null;
          if (e[6] === 0 || (d && d.pellets && e[6] % 2 === 0)) view.tracer(tv.x, tv.y, tv.z, x, y, z, d && d.tw, d && d.tl);
          if (kind === 0) { view.hole(x, y, z, e[7], e[8], e[9]); G.impactFx(view, x, y, z, e[7], e[8], e[9]); if (e[6] === 0) audio.play('ric', x, y, z); }
          else if (kind === 1) { const v = P[e[8]]; G.hitFx(view, x, y, z, v, e[7]); }
          break;
        }
        case 'h': {
          const a = P[e[1]], v = P[e[2]];
          if (v && v === me) {
            me.hp = e[5]; dmgFlash = Math.min(1, dmgFlash + e[3] / 60);
            if (a && a !== me) addDmgDir(a);
            audio.play('hurt');
            if (e[7] && NET.role === 'guest') {}
          }
          if (a && a === me && v !== me) { hitMark(e[4] ? 2 : 1); audio.play(e[4] ? 'head' : 'hit'); if (e[4]) pop(T(G.headWord1 || 'Headshot'), 'hs', 0.6); }
          if (v && v !== me) v.hp = e[5];
          break;
        }
        case 'k': {
          const a = P[e[1]], v = P[e[2]];
          feed(a, v, e[3], e[4]);
          if (v) {
            if (fromNet || !W.auth) { v.alive = false; v.hp = 0; v.evT = W.t; v.deaths = fromNet ? v.deaths : v.deaths; v.killer = e[1]; v.killerW = e[3]; v.deathT = W.t; v.respawnT = G.respawn; if (v === me) { me.wantSpawn = !G.manualSpawn; } }
            G.deathFx(view, v, e[7], e[8], e[9]);
            audio.play('die', e[7], e[8] + 1, e[9]);
          }
          if (a && a === me && v !== me) {
            hitMark(3); audio.play('kill');
            const s = e[5];
            const nm = G.streakName(s);
            if (nm) pop(T(nm, { n: s }), 'st', 1.6); else pop(T('Eliminated {name}', { name: v ? v.name : '' }), 'el', 1.2);
            subPop('+' + (G.killScore + (e[4] ? G.headScore : 0)));
          }
          if (v === me) { dmgFlash = 1; api.timeout(() => showDeath(), 700); audio.play('dead'); }
          break;
        }
        case 'aw': { if (p === me) { const s = G.streaks.find(x => x.key === e[2]); if (s) { pop(T(s.name), 'aw', 1.8); audio.play('award'); if (fromNet) s.give(W, me); } } break; }
        case 'sp': {
          if (!p) break;
          if (fromNet || !W.auth) {
            if (p === me) { me.nextCls = e[6]; spawnPlayer(W, me, { x: e[2], y: e[3], z: e[4], yaw: e[5] }); W.ev.length = 0; }
            else { p.x = p.px = e[2]; p.y = p.py = e[3]; p.z = p.pz = e[4]; p.yaw = e[5]; p.cls = e[6]; p.alive = true; p.evT = W.t; p.holdT = W.t + 0.25; p.hp = p.maxHp = G.classes[e[6]].hp; const r = rs[p.slot]; if (r) { r.x = e[2]; r.y = e[3]; r.z = e[4]; r.yaw = e[5]; } }
          }
          if (p === me) { look.yaw = e[5]; look.pitch = 0; itemsPanel(null); deathUI = null; dmgFlash = 0; H.dmg.innerHTML = ''; if (scr === 'play' && !paused) lockMouse(); audio.play('spawn'); }
          const c = view.chars[p.slot]; if (c) c.deadT = -1;
          break;
        }
        case 'j': if (p) audio.play('jump', mine ? null : p.x, p.y, p.z); break;
        case 'sl': if (p) audio.play('slide', mine ? null : p.x, p.y, p.z); break;
        case 'ld': if (p) { audio.play('land', mine ? null : p.x, p.y, p.z, e[2]); if (mine) view.landView(e[2]); } break;
        case 'rl': if (p) { audio.play('reload', mine ? null : p.x, p.y + 1, p.z); const c = view.chars[p.slot]; if (c) c.relT = 0; } break;
        case 'sw': if (p) audio.play('swap', mine ? null : p.x, p.y + 1, p.z); break;
        case 'dry': if (mine) audio.play('dry'); break;
        case 'me': if (p) { audio.play('swing', mine ? null : p.x, p.y + 1, p.z); const c = view.chars[p.slot]; if (c) c.melT = 0; } break;
        case 'mh': { const v = P[e[2]]; if (v) { G.hitFx(view, v.x, v.y + 1.1, v.z, v, 1); audio.play('melee', v.x, v.y + 1, v.z); } break; }
        case 'nt': if (p) audio.play('throw', mine ? null : p.x, p.y + 1, p.z); break;
        case 'pj': break;
        case 'bn': { const m = view.projMeshes.get(e[1]); if (m) audio.play('bounce', m.position.x, m.position.y, m.position.z); break; }
        case 'px': view.dropProj(e[1]); break;
        case 'ex': {
          view.dropProj(e[1]);
          view.boom(e[2], e[3], e[4], e[5]);
          audio.play('boom', e[2], e[3], e[4]);
          const dd = Math.hypot(e[2] - camS.x, e[3] - camS.y, e[4] - camS.z);
          if (dd < 14) shakeCam(0.5 * (1 - dd / 14));
          if (G.scorch) view.splat(e[2], e[3] + 0.02, e[4], 0, 1, 0, e[5] * 0.6);
          break;
        }
        case 'kb': if (p === me && fromNet) { me.vx += e[2]; me.vy += e[3]; me.vz += e[4]; me.onGround = false; } break;
        case 'zn': if (W) { W.zone.i = e[1]; pop(T(G.zoneMoved), 'zn', 1.6); audio.play('zone'); } break;
        case 'pu': { const q = W.pickups[e[1]]; if (q) { q.up = !!e[2]; if (!e[2] && P[e[3]] === me) { if (fromNet) G.pickup(W, me, e[4]); audio.play('pickup'); subPop(T(G.pickupName(e[4]))); } } break; }
        case 'ov': if (fromNet && W) { W.over = true; } break;
        case 'ch': chatLine(e[1], e[2]); break;
        case 'pl': { const q = P[e[1]]; if (q) { q.name = e[2]; q.bot = !!e[3]; } break; }
        case 'gone': { const q = P[e[1]]; if (q) { q.inGame = false; q.alive = false; view.dropChar(e[1]); } break; }
      }
    }
    let fireT = 9, dmgFlash = 0, shakeA = 0, thirdPerson = false, camO = null, autoP = null;
    const shakeCam = k => { shakeA = Math.min(1, shakeA + k); };
    function hitMark(kind) {
      H.hm.classList.toggle('k', kind === 3);
      H.hm.getAnimations().forEach(a => a.cancel());
      H.hm.animate([{ opacity: 1, transform: 'scale(1.25)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 0, transform: 'scale(1)' }], { duration: kind === 3 ? 420 : 260 });
    }
    const DMGN = [];
    function addDmgDir(a) {
      let d = DMGN.find(x => x.s === a.slot);
      if (!d) { if (DMGN.length >= 5) { const o = DMGN.shift(); o.el.remove(); } const el = document.createElement('i'); H.dmg.append(el); d = { s: a.slot, el, t: 0 }; DMGN.push(d); }
      d.t = 1.4; d.a = a;
    }
    function feed(a, v, wk, head) {
      const el = document.createElement('div');
      const an = a && a !== v ? `<b class="${a === me ? 'me' : ''}${W.teams ? ' t' + a.team : ''}">${escH(a.name)}</b>` : '';
      el.innerHTML = `${an}${G.wepIcon(wk, true)}${head ? G.headIcon : ''}<b class="${v === me ? 'me' : ''}${W.teams && v ? ' t' + v.team : ''}">${escH(v ? v.name : '')}</b>`;
      if (a === me || v === me) el.classList.add('mine');
      H.feed.prepend(el);
      FEED.unshift({ el, t: 5 });
      while (FEED.length > 5) { const o = FEED.pop(); o.el.remove(); }
    }
    function pop(s, cls, sec) {
      H.pop.innerHTML = '';
      const el = document.createElement('div'); el.className = cls; el.textContent = s;
      H.pop.append(el);
      el.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.15 }, { transform: 'scale(1)', opacity: 1, offset: 0.8 }, { transform: 'scale(1)', opacity: 0 }], { duration: (sec || 1.2) * 1000, fill: 'forwards' });
    }
    function subPop(s) {
      const el = document.createElement('span'); el.textContent = s;
      H.sub.append(el); el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none', offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 1100 }).onfinish = () => el.remove();
    }

    const rs = [];
    const camS = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 75, vfov: 58 };
    function renderState(alpha, dt) {
      const P = W.players;
      for (const p of P) {
        if (!p) continue;
        let r = rs[p.slot];
        if (!r) r = rs[p.slot] = { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch };
        if (p.remote) {
          if (NET.role === 'host') { const k = 1 - Math.exp(-18 * dt); r.x += (p.x - r.x) * k; r.y += (p.y - r.y) * k; r.z += (p.z - r.z) * k; r.yaw += angD(p.yaw, r.yaw) * k; r.pitch += (p.pitch - r.pitch) * k; if (Math.hypot(p.x - r.x, p.z - r.z) > 4) { r.x = p.x; r.y = p.y; r.z = p.z; } }
          else { r.x = p.x; r.y = p.y; r.z = p.z; r.yaw = p.yaw; r.pitch = p.pitch; }
        } else {
          r.x = lerp(p.px, p.x, alpha); r.y = lerp(p.py, p.y, alpha); r.z = lerp(p.pz, p.z, alpha); r.yaw = p.yaw; r.pitch = p.pitch;
        }
      }
    }
    const tagV = new THREE.Vector3();
    let tagT = 0;
    function drawChars(dt) {
      const P = W ? W.players : [];
      tagT -= dt;
      const doTags = tagT <= 0;
      if (doTags) tagT = 0.2;
      for (const p of P) {
        if (!p) continue;
        const show = p.inGame && (p !== me || thirdPerson);
        const c = view.charFor(p.slot, { team: W.teams ? p.team : -1, cls: p.cls, color: G.colorFor(p, W.teams) });
        const r = rs[p.slot];
        if (!show || !r) { c.root.visible = false; c.blob.visible = false; continue; }
        if (!p.alive) { if (c.deadT < 0 || c.deadT == null) c.deadT = 0; c.deadT += dt; }
        else c.deadT = -1;
        c.root.visible = p.alive || c.deadT < (G.corpseT || 1.6);
        c.blob.visible = c.root.visible && p.alive;
        if (!c.root.visible) continue;
        c.root.position.set(r.x, r.y, r.z);
        if (p.onGround || c.gy == null) c.gy = r.y;
        c.blob.position.set(r.x, Math.min(c.gy, r.y) + 0.03, r.z);
        const bs = (G.blobS || 1.1) * clamp(1 - (r.y - c.gy) * 0.15, 0.4, 1); c.blob.scale.set(bs, 1, bs);
        c.root.rotation.y = r.yaw;
        const sp = Math.hypot(p.vx, p.vz);
        c.fireT = (c.fireT == null ? 9 : c.fireT) + dt; c.relT = (c.relT == null ? 9 : c.relT) + dt; c.melT = (c.melT == null ? 9 : c.melT) + dt;
        const w = p.weps[p.cur];
        c.anim({ t: W.t, dt, spd: p.remote ? (c.lsp = damp(c.lsp || 0, Math.hypot(r.x - (c.lx || r.x), r.z - (c.lz || r.z)) / Math.max(1e-3, dt), 8, dt)) : sp, ground: p.onGround, crouch: p.crouch, slide: p.slide > 0, pitch: r.pitch, ads: p.adsF, fire: c.fireT, reload: c.relT, melee: c.melT, alive: p.alive, deadT: c.deadT, wk: w ? w.k : G.classes[p.cls].prim, shield: p.shield > 0, prot: p.spawnProt > 0 });
        c.lx = r.x; c.lz = r.z;
        if (doTags) {
          let vis = false;
          if (p.alive && p !== me && me) {
            const dx = r.x - camS.x, dz = r.z - camS.z, dist = Math.hypot(dx, dz);
            const mate = W.teams && p.team === me.team;
            if (mate) vis = dist < 120;
            else if (dist < 45) { const fx = -Math.sin(camS.yaw), fz = -Math.cos(camS.yaw); if ((dx * fx + dz * fz) / Math.max(0.1, dist) > 0.6) vis = clearLine(W.M, camS.x, camS.y, camS.z, r.x, r.y + 1.6, r.z); }
          }
          const mate = me && W.teams && p.team === me.team;
          c.tag.set(p.name, mate ? (G.mateCol || '#7fd3ff') : (G.foeCol || '#ff6a5a'), mate || !W.teams || true ? p.hp / p.maxHp : -1, vis);
          c.tag.spr.position.set(0, (p.crouch ? G.phys.HC : G.phys.H) + 0.45, 0);
          c.tag.spr.material.depthTest = !mate;
        }
      }
      for (let i = P.length; i < view.chars.length; i++) if (view.chars[i]) view.chars[i].root.visible = false;
    }
    function drawProj(alpha) {
      if (!W) return;
      const seen = drawProj.seen || (drawProj.seen = new Set());
      seen.clear();
      for (const r of W.projs) {
        const m = view.projMesh(r.id, r.kind);
        m.position.set(lerp(r.px, r.x, alpha), lerp(r.py, r.y, alpha), lerp(r.pz, r.z, alpha));
        if (r.kind === 'r') { const sp = Math.hypot(r.vx, r.vy, r.vz) || 1; m.lookAt(m.position.x + r.vx / sp, m.position.y + r.vy / sp, m.position.z + r.vz / sp); if (Math.random() < 0.7) view.burst(m.position.x, m.position.y, m.position.z, 1, '#bbbbbb', 0.4, 0.6, 0.6, -0.5); }
        else { m.rotation.x += 0.2; m.rotation.z += 0.13; }
        seen.add(r.id);
      }
      for (const id of view.projMeshes.keys()) if (!seen.has(id)) view.dropProj(id);
    }
    function drawZone(dt) {
      const zm = view.zoneMesh;
      if (!W || !W.mode.zone || !W.M.zones.length) { zm.visible = false; return; }
      const z = W.M.zones[W.zone.i];
      zm.visible = true; zm.position.set(z.x, z.y, z.z); zm.scale.set(z.r, 1, z.r);
      if (G.zoneColor) G.zoneColor(zm, W.zone.own, me ? me.team : 0, W.t);
    }
    function drawPickups(dt) {
      if (!W) return;
      const L = view.pickMeshes;
      for (let i = 0; i < W.pickups.length; i++) {
        const k = W.pickups[i];
        let m = L[i];
        if (!m) { m = L[i] = G.makePickup(view.kit, k.k); m.position.set(k.x, k.y, k.z); view.scene.add(m); }
        m.visible = k.up;
        if (k.up) { m.rotation.y += dt * 1.6; m.position.y = k.y + 0.15 + Math.sin(W.t * 2.4 + i) * 0.08; }
      }
    }

    function hudFrame(dt) {
      if (!W || !me) return;
      const w = me.weps[me.cur], d = w ? w.d : null;
      G.hudUpdate(H, me, W, setT, setS, setH, T, escH);
      const sp = d && d.kind !== 'melee' ? spreadNow(W, me, d) : 0.02;
      const fovR = camS.fov * Math.PI / 180, px = Math.tan(sp) / Math.tan(fovR / 2) * (wrap.clientHeight / 2);
      const gap = clamp(px, 3, 140), showCh = me.alive && !(d && d.scope && me.adsF > 0.6) && !(d && d.noCh && me.adsF > 0.6);
      setS(H.ch, 'chv', 'visibility', showCh ? 'visible' : 'hidden');
      if (showCh) {
        const g = Math.round(gap) + 'px';
        setS(H.chA, 'cha', 'transform', `translateY(calc(-100% - ${g}))`);
        setS(H.chB, 'chb', 'transform', `translateY(${g})`);
        setS(H.chC, 'chc', 'transform', `translateX(calc(-100% - ${g}))`);
        setS(H.chD, 'chd', 'transform', `translateX(${g})`);
      }
      const scope = !!(d && d.scope && me.adsF > 0.92 && me.alive);
      setS(H.scope, 'scp', 'opacity', scope ? '1' : '0');
      const low = me.alive ? clamp(1 - me.hp / me.maxHp / 0.4, 0, 1) : 0;
      dmgFlash = Math.max(0, dmgFlash - dt * 1.6);
      setS(H.vig, 'vig', 'opacity', Math.min(1, low * 0.75 + dmgFlash * 0.6).toFixed(2));
      for (let i = DMGN.length - 1; i >= 0; i--) {
        const x = DMGN[i];
        x.t -= dt;
        if (x.t <= 0 || !me.alive) { x.el.remove(); DMGN.splice(i, 1); continue; }
        const a = x.a, ang = Math.atan2(-(a.x - me.x), -(a.z - me.z)) - look.yaw;
        x.el.style.transform = `rotate(${(-ang).toFixed(3)}rad)`; x.el.style.opacity = Math.min(1, x.t).toFixed(2);
      }
      for (let i = FEED.length - 1; i >= 0; i--) { const f = FEED[i]; f.t -= dt; if (f.t < 0.6) f.el.style.opacity = Math.max(0, f.t / 0.6).toFixed(2); if (f.t <= 0) { f.el.remove(); FEED.splice(i, 1); } }
      if (hintT > 0) { hintT -= dt; if (hintT <= 0) H.hint.hidden = true; }
      const tl = Math.max(0, Math.ceil(W.time));
      const L = standings();
      if (!W.teams) {
        const top = L.slice(0, 3), mi = L.indexOf(me);
        const html = top.map((p, i) => `<div class="${p === me ? 'me' : ''}"><span>${i + 1}. ${escH(p.name)}</span><b>${p.score}</b></div>`).join('') + (mi > 2 ? `<div class="me"><span>${mi + 1}. ${escH(me.name)}</span><b>${me.score}</b></div>` : '');
        setH(H.tl, 'tl', html);
      } else setH(H.tl, 'tl', '');
      G.hudTop(H, W, me, tl, setH, T, escH);
      if (sbOpen && (W.tick % 30 === 0)) drawSB();
      if (deathUI && deathUI.tick) deathUI.tick();
    }

    let netAcc = 0;
    let lastNow = 0;
    function frame(dt0, now) {
      const dt = lastNow ? clamp((now - lastNow) / 1000, 0, 0.25) : dt0;
      lastNow = now;
      lastRaf = now;
      if (!W) {
        if (previewM) {
          menuT += dt;
          const M = previewM, cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2, R = Math.max(M.x1 - M.x0, M.z1 - M.z0) * 0.42, a = menuT * 0.06;
          camS.x = cx + Math.cos(a) * R; camS.z = cz + Math.sin(a) * R; camS.y = (M.def.camY || 14) + Math.sin(menuT * 0.2) * 1.5;
          camS.yaw = Math.atan2(-(cx - camS.x), -(cz - camS.z)); camS.pitch = -0.32; camS.roll = 0; camS.fov = 70; camS.vfov = 58;
          view.drawView({ show: false }, dt);
          view.frameFx(dt);
          view.render(camS);
        }
        return;
      }
      if (autoP && me) {
        if (!me.ai) { me.ai = mkBrain(W, me); me.diff = autoP.diff; }
        if (!me.alive && me.respawnT <= 0 && deathUI && deathUI.go) deathUI.go();
        look.yaw = me.in.yaw; look.pitch = me.in.pitch;
      } else localInput(dt);
      if (NET.role === 'guest') guestFrame(dt, now);
      else {
        if (!paused || online()) {
          simAcc += dt;
          let n = 0;
          while (simAcc >= STEP && n < 16) { simAcc -= STEP; n++; tick(); }
          if (n === 16) simAcc = 0;
        }
      }
      const alpha = paused && !online() ? 1 : clamp(simAcc / STEP, 0, 1);
      renderState(alpha, dt);
      const r = rs[me.slot] || me;
      const P = G.phys;
      me.crouchF = damp(me.crouchF || 0, me.crouch ? 1 : 0, 14, dt);
      const eye = lerp(P.eye, P.eyeC, me.crouchF);
      shakeA = Math.max(0, shakeA - dt * 2.5);
      const sh = shakeA * shakeA * 0.06;
      if (me.alive || !G.deathCam) {
        camS.x = r.x + (Math.random() - 0.5) * sh; camS.y = r.y + eye + (Math.random() - 0.5) * sh; camS.z = r.z + (Math.random() - 0.5) * sh;
        camS.yaw = look.yaw + me.kickYaw * 0.6; camS.pitch = clamp(look.pitch + me.kick * 0.6, -1.55, 1.55);
        camS.roll = damp(camS.roll, me.slide > 0 ? -0.06 : 0, 8, dt);
      }
      if (!me.alive) {
        const k = W.players[me.killer];
        const dt2 = W.t - me.deathT;
        camS.y = damp(camS.y, r.y + 0.5 + Math.min(2.5, dt2 * 2), 4, dt);
        if (k && k !== me && k.alive) { const kr = rs[k.slot] || k; const ty = Math.atan2(-(kr.x - camS.x), -(kr.z - camS.z)), tp = Math.atan2(kr.y + 1.2 - camS.y, Math.hypot(kr.x - camS.x, kr.z - camS.z)); camS.yaw += angD(ty, camS.yaw) * Math.min(1, dt * 4); camS.pitch += (tp - camS.pitch) * Math.min(1, dt * 4); }
        camS.roll = damp(camS.roll, 0.25, 3, dt);
      }
      const w = me.weps[me.cur], d = w ? w.d : null;
      const zoom = me.alive ? G.fovFor(me) : 1;
      camS.fov = SV.fov / zoom * (h => h > 1.2 ? 1.12 : 1)(wrap.clientHeight / Math.max(1, wrap.clientWidth));
      camS.vfov = 58 - me.adsF * 6;
      if (camO) { Object.assign(camS, camO); }
      fireT += dt;
      const showVm = !camO && me.alive && !(d && d.scope && me.adsF > 0.9) && scr === 'play';
      view.drawView({ show: showVm, wk: w ? w.k : '', ads: me.adsF, spd: Math.hypot(me.vx, me.vz), ground: me.onGround, slide: me.slide > 0, yaw: look.yaw, pitch: look.pitch, reload: me.reloadT > 0 && d ? 1 - me.reloadT / (d.reloadOne && w.mag > 0 ? d.reloadOne : d.reload) : -1, swap: me.swapT > 0 && d ? me.swapT / (d.swap || 0.35) : 0, melee: me.meleeT > 0 ? 1 - me.meleeT / G.weapons[G.melee].rate : -1, fireT, t: W.t, mag: w ? w.mag : 0 }, dt);
      drawChars(dt);
      drawProj(alpha);
      drawZone(dt);
      drawPickups(dt);
      view.frameFx(dt);
      audio.listener(camS.x, camS.y, camS.z, camS.yaw);
      view.render(camS);
      if (scr === 'play') hudFrame(dt);
      if (W.over && scr === 'play' && (!NET.role || NET.role === 'host' || W.over)) { if (!over) { over = { pending: true, t: 0 }; pop(T('Match over'), 'ov', 2); } over.t += dt; if (over.t > 1.6) { over = null; matchOver(); } }
    }

    function tick() {
      if (me && me.alive && !me.remote && NET.role !== 'guest') { }
      stepWorld(W);
      const E = W.ev;
      if (E.length) {
        for (const e of E) onEv(e, false);
        if (NET.role === 'host') NET.pend.push(...E);
        E.length = 0;
      }
      if (NET.role === 'host') hostNet();
    }

    function chatLine(slot, txt) {
      const p = W && W.players[slot];
      const el = document.createElement('div');
      el.innerHTML = `<b translate="no">${escH(p ? p.name : '?')}:</b> <span translate="no">${escH(txt)}</span>`;
      H.chat.append(el);
      while (H.chat.querySelectorAll('div').length > 6) H.chat.querySelector('div').remove();
      api.timeout(() => { el.style.opacity = '0'; api.timeout(() => el.remove(), 700); }, 9000);
      audio.play('chat');
    }
    function openChat() {
      if (chatOpen) return;
      chatOpen = true; clearButtons(); releaseMouse();
      const i = document.createElement('input'); i.maxLength = 120; i.placeholder = T('Say something…'); i.setAttribute('aria-label', T('Chat message'));
      H.chat.append(i);
      api.timeout(() => i.focus(), 30);
      const done = send => {
        if (!chatOpen) return;
        chatOpen = false;
        const v = i.value.replace(/\s+/g, ' ').trim().slice(0, 120);
        i.remove(); uiT = performance.now();
        if (send && v) { if (NET.role === 'host') { const e = ['ch', me.slot, v]; onEv(e, false); NET.pend.push(e); } else netSend({ t: 'ch', m: v }); }
        if (scr === 'play' && !paused) lockMouse();
      };
      i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') done(true); else if (e.key === 'Escape') { e.preventDefault(); done(false); } });
      i.addEventListener('blur', () => done(false));
    }

    function netSend(m, fast) { try { api.net.send(m, fast); } catch (e) {} }
    function hookNet() {
      if (NET.hooked) return;
      NET.hooked = true;
      api.net.on('data', (m, from) => { if (!m || !NET.role) return; if (NET.role === 'host') hostData(m, from); else guestData(m); });
      api.net.on('leave', pl => { if (NET.role !== 'host' || !pl || !W) return; const p = W.players.find(q => q && q.pid === pl.id); if (!p) return; dropPeer(p, pl); });
      api.net.on('rejoin', pl => { if (NET.role !== 'host' || !pl || !W) return; const p = W.players.find(q => q && q.pid === pl.id); if (p) sendCfg(p); });
      api.net.on('lobby', () => { if (NET.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!NET.role) return;
        NET.role = null; W = null; me = null; hud.hidden = true; releaseMouse();
        const el = itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T(why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'))}</h3><p class="fp-note">${escH(T(why === 'host-left' ? 'The host ended the online game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.'))}</p><div class="fp-acts"><button type="button" class="fp-btn" data-a="on">${escH(T('Play online'))}</button><button type="button" class="fp-btn ghost" data-a="menu">${escH(T('Menu'))}</button></div></div>`, 'm-pause');
        scr = 'left';
        previewWorld();
        el.onclick = e => { const a = e.target.closest('[data-a]'); if (!a) return; api.sfx('tap'); if (a.dataset.a === 'on') goOnline(); else menu(); };
      });
    }
    async function goOnline() {
      hookNet();
      const wasRole = NET.role;
      NET.role = null; scr = 'wait'; hud.hidden = true; itemsPanel(null); releaseMouse(); W = null; me = null; previewWorld();
      const r = await api.net.room({ title: G.title, sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 6, min: 2, max: 8, bots: true });
      if (!api.alive) return;
      if (!r) { NET.role = null; menu(); return; }
      NET.role = r.role; NET.players = r.players.slice(0, 8); NET.bots = !!r.bots; NET.size = Math.min(8, +r.size || NET.players.length); NET.myId = r.id;
      if (r.role === 'host') { hostStart(); }
      else { itemsPanel(`<div class="fp-card fp-pause"><h3>${escH(T('Connected'))}</h3><p class="fp-note">${escH(T('Waiting for the host…'))}</p><div class="fp-acts"><button type="button" class="fp-btn ghost" data-a="leave">${escH(T('Leave'))}</button></div></div>`, 'm-pause').onclick = e => { if (e.target.closest('[data-a]')) leaveOnline(); }; netSend({ t: 'hi', c: SV.cls, n: myName() }); }
    }
    function leaveOnline() {
      try { api.net.close(); } catch (e) {}
      NET.role = null; W = null; me = null; menu();
    }
    function toLobby() { if (NET.role === 'host') { W = null; me = null; goOnline(); } }
    function hostStart() {
      const seed = (Math.random() * 1e9) | 0, rnd = mkRng(seed);
      const md = pickMap(rnd);
      const live = NET.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
      W = newWorld(md, SV.mode, seed, true);
      const n = Math.min(8, Math.max(live.length, NET.bots ? NET.size : live.length));
      const names = botNames(n, rnd);
      const pcls = NET.cls || {};
      for (let i = 0; i < n; i++) {
        const hum = i < live.length;
        const pl = hum ? live[i] : null;
        const p = mkPlayer(W, i, { name: hum ? pl.name : names[i], team: W.teams ? teamOf(i) : 0, cls: i === 0 ? SV.cls : hum ? (pcls[pl.id] | 0) : 0, bot: !hum, diff: SV.diff, remote: hum && i > 0, local: i === 0 });
        if (!hum) p.cls = p.nextCls = botClass(W, p);
        p.pid = pl ? pl.id : null;
        p.respawnT = hum ? 0 : 0.3 + i * 0.05;
        p.wantSpawn = true;
        W.players.push(p);
      }
      me = W.players[0];
      spawnPlayer(W, me);
      for (const p of W.players) if (p.remote) { spawnPlayer(W, p); }
      NET.pend.length = 0;
      for (const p of W.players) if (p.remote) sendCfg(p);
      W.ev.length = 0;
      NET.snapK = 0;
      beginPlay();
    }
    function cfgMsg(p) {
      return { t: 'cfg', map: W.M.key, mode: W.mode.key, seed: 1, me: p.slot, time: W.time, ts: W.teamScore.slice(), z: [W.zone.i, W.zone.t], P: W.players.map(q => [q.slot, q.name, q.team, q.cls, q.bot ? 1 : 0, q.alive ? 1 : 0, +q.x.toFixed(2), +q.y.toFixed(2), +q.z.toFixed(2), +q.yaw.toFixed(3), q.kills, q.deaths, q.score, q.inGame ? 1 : 0, Math.ceil(q.hp)]), pk: W.pickups.map(k => k.up ? 1 : 0) };
    }
    function sendCfg(p) { if (p.pid) api.net.sendTo(p.pid, cfgMsg(p)); }
    function dropPeer(p, pl) {
      if (NET.bots) {
        p.remote = false; p.bot = true; p.pid = null; p.ai = mkBrain(W, p); p.diff = SV.diff; p.name = p.name;
        if (!p.alive) p.respawnT = Math.min(p.respawnT, 1); else { p.px = p.x; p.py = p.y; p.pz = p.z; }
        p.weps.length || giveLoadout(W, p);
        const e = ['pl', p.slot, p.name, 1]; NET.pend.push(e);
        api.toast(T('{name} left. A bot takes the seat.', { name: pl.name }));
      } else {
        p.inGame = false; p.alive = false; p.remote = false; p.pid = null;
        const e = ['gone', p.slot]; NET.pend.push(e); onEv(e, false);
        api.toast(T('{name} left the game.', { name: pl.name }));
      }
    }
    const q2 = v => Math.round(v * 100);
    function snapMsg() {
      const P = [];
      for (const p of W.players) { if (!p || !p.inGame) continue; P.push([p.slot, q2(p.x), q2(p.y), q2(p.z), Math.round(p.yaw * 1000), Math.round(p.pitch * 1000), (p.alive ? 1 : 0) | (p.onGround ? 2 : 0) | (p.crouch ? 4 : 0) | (p.slide > 0 ? 8 : 0) | (p.adsF > 0.5 ? 16 : 0) | (p.shield > 0 ? 32 : 0) | (p.spawnProt > 0 ? 64 : 0), p.cur, Math.ceil(p.hp), p.cls, p.kills, p.deaths, p.score, q2(p.vx), q2(p.vz)]); }
      return { t: 's', k: W.tick, tl: Math.round(W.time * 10), ts: W.teamScore, z: [W.zone.i, W.zone.own], P, R: W.projs.map(r => [r.id, r.kind, q2(r.x), q2(r.y), q2(r.z)]) };
    }
    function hostNet() {
      if (NET.pend.length) { netSend({ t: 'e', E: NET.pend.slice(0, 120) }); NET.pend.length = 0; }
      if (W.tick % 3 === 0) netSend(snapMsg(), true);
    }
    function hostData(m, from) {
      if (m.t === 'hi') { NET.cls = NET.cls || {}; NET.cls[from] = clamp(m.c | 0, 0, G.classes.length - 1); return; }
      if (!W) return;
      const p = W.players.find(q => q && q.pid === from);
      if (!p) return;
      if (m.t === 'i') {
        if (typeof m.q === 'number') { if (m.q <= (p.inSeq || 0)) return; p.inSeq = m.q; }
        if (!p.alive || !Array.isArray(m.p) || m.p.length < 3) return;
        const x = m.p[0] / 100, y = m.p[1] / 100, z = m.p[2] / 100;
        if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return;
        p.px = p.x; p.py = p.y; p.pz = p.z;
        p.x = clamp(x, W.M.x0 - 2, W.M.x1 + 2); p.y = clamp(y, W.M.killY - 5, 200); p.z = clamp(z, W.M.z0 - 2, W.M.z1 + 2);
        if (Array.isArray(m.v)) { p.vx = (+m.v[0] || 0) / 100; p.vy = (+m.v[1] || 0) / 100; p.vz = (+m.v[2] || 0) / 100; }
        if (Array.isArray(m.a)) { p.yaw = +m.a[0] / 1000 || 0; p.pitch = clamp(+m.a[1] / 1000 || 0, -1.6, 1.6); }
        const f = m.f | 0;
        p.onGround = !!(f & 2); p.crouch = !!(f & 4); p.slide = f & 8 ? 0.1 : 0; p.adsF = f & 16 ? 1 : 0;
        if (typeof m.w === 'number' && p.weps[m.w]) p.cur = m.w;
        if (p.y < W.M.killY) hurt(W, p, 999, null, 'fall', false, 0, 0);
        if (f & 128) p.spawnProt = 0;
      } else if (m.t === 'f') {
        if (!p.alive) return;
        const wk = String(m.w || '');
        const wi = p.weps.findIndex(x => x.k === wk);
        if (wi < 0 && wk !== G.melee) return;
        const d = G.weapons[wk];
        const now = W.t;
        if (d.kind !== 'melee') { if (now - (p.lastClaim || -9) < d.rate * 0.55 * (d.burst ? 0.3 : 1)) return; p.lastClaim = now; }
        p.spawnProt = 0; p.lastShotT = now; p.shots++;
        if (wi >= 0) p.cur = wi;
        if (d.kind !== 'melee') { const e = ['fx', p.slot, p.cur, d.pellets || 1]; onEv(e, false); NET.pend.push(e); hearShot(W, p); }
        if (Array.isArray(m.T)) for (const t of m.T.slice(0, 16)) { if (!Array.isArray(t)) continue; const e = ['tr', p.slot, +t[0] || 0, +t[1] || 0, +t[2] || 0, t[3] | 0, t[4] | 0, +t[5] || 0, +t[6] || 0, +t[7] || 0]; onEv(e, false); NET.pend.push(e); }
        if (Array.isArray(m.h)) {
          let any = false;
          for (const h of m.h.slice(0, 16)) {
            if (!Array.isArray(h)) continue;
            const v = W.players[h[0] | 0];
            if (!v || v === p || !v.alive || (W.teams && v.team === p.team)) continue;
            const dist = Math.hypot(v.x - p.x, v.z - p.z);
            if (dist > (d.range || 200) + 4) continue;
            if (!clearLine(W.M, p.x, p.y + G.phys.eye, p.z, v.x, v.y + 1.0, v.z) && !clearLine(W.M, p.x, p.y + G.phys.eye, p.z, v.x, v.y + G.phys.H - 0.2, v.z) && dist > 3) continue;
            any = true;
            if (d.kind === 'melee') hurt(W, v, d.dmg, p, wk, false, v.x - p.x, v.z - p.z);
            else applyHit(W, p, v, d, h[1] | 0, +h[2] || dist, v.x - p.x, v.z - p.z, wk);
          }
          if (any) p.hits++;
        }
      } else if (m.t === 'p') {
        if (!p.alive || !Array.isArray(m.o) || !Array.isArray(m.v)) return;
        const kind = m.k === 'g' ? 'g' : 'r';
        const d = kind === 'g' ? G.weapons[G.nade] : p.weps.map(x => x.d).find(x => x.kind === 'rocket');
        if (!d) return;
        if (W.t - (p['lp' + kind] || -9) < (kind === 'g' ? 0.6 : d.rate * 0.6)) return;
        p['lp' + kind] = W.t; p.spawnProt = 0;
        const o = m.o.map(Number), v = m.v.map(Number);
        if (o.some(x => !isFinite(x)) || v.some(x => !isFinite(x))) return;
        const sp = Math.hypot(v[0], v[1], v[2]), mx = d.projSpeed * 1.6 + 6;
        const k = sp > mx ? mx / sp : 1;
        spawnProj(W, p, kind, d, o[0], o[1], o[2], v[0] * k, v[1] * k, v[2] * k);
        if (kind === 'r') { const e = ['fx', p.slot, p.cur, 0]; onEv(e, false); NET.pend.push(e); hearShot(W, p); }
      } else if (m.t === 'a') {
        if (Array.isArray(m.E)) for (const e of m.E.slice(0, 12)) { if (!Array.isArray(e) || !['j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'nt'].includes(e[0])) continue; const x = [e[0], p.slot, +e[2] || 0]; onEv(x, false); NET.pend.push(x); }
      } else if (m.t === 'cl') { p.nextCls = clamp(m.c | 0, 0, G.classes.length - 1); }
      else if (m.t === 'rs') { if (typeof m.c === 'number') p.nextCls = clamp(m.c | 0, 0, G.classes.length - 1); p.wantSpawn = true; }
      else if (m.t === 'ch') { const v = String(m.m || '').replace(/\s+/g, ' ').trim().slice(0, 120); if (!v || now() - (p.chatT || 0) < 700) return; p.chatT = now(); const e = ['ch', p.slot, v]; onEv(e, false); NET.pend.push(e); }
      else if (m.t === 'pg') { api.net.sendTo(from, { t: 'po', c: m.c }); }
    }
    const now = () => performance.now();

    function guestData(m) {
      if (m.t === 'cfg') { guestCfg(m); return; }
      if (!W) return;
      if (m.t === 's') {
        const tnow = performance.now();
        const o = tnow - m.k * STEP * 1000;
        NET.off = NET.offSet ? Math.min(o, NET.off + 2) : o; NET.offSet = true;
        const B = NET.buf;
        let j = B.length;
        while (j > 0 && B[j - 1].k > m.k) j--;
        if (j > 0 && B[j - 1].k === m.k) return;
        B.splice(j, 0, m);
        if (B.length > 40) B.shift();
        W.time = m.tl / 10; W.teamScore[0] = m.ts[0]; W.teamScore[1] = m.ts[1];
        if (m.z) { if (W.zone.i !== m.z[0]) W.zone.i = m.z[0]; W.zone.own = m.z[1]; }
        for (const a of m.P) { const p = W.players[a[0]]; if (!p) continue; p.kills = a[10]; p.deaths = a[11]; p.score = a[12]; if (p === me) { if (me.alive && (a[6] & 1)) me.hp = a[8]; me.shield = a[6] & 32 ? 1 : 0; continue; } p.cls = a[9]; }
        if (m.k > NET.snapK) {
          NET.snapK = m.k;
          const ids = new Set();
          for (const r of m.R) {
            ids.add(r[0]);
            let pr = W.projs.find(x => x.id === r[0]);
            if (!pr) { pr = { id: r[0], kind: r[1], x: r[2] / 100, y: r[3] / 100, z: r[4] / 100, px: r[2] / 100, py: r[3] / 100, pz: r[4] / 100, vx: 0, vy: 0, vz: 0, nx: r[2] / 100, ny: r[3] / 100, nz: r[4] / 100 }; W.projs.push(pr); }
            pr.ox = pr.nx; pr.oy = pr.ny; pr.oz = pr.nz; pr.nx = r[2] / 100; pr.ny = r[3] / 100; pr.nz = r[4] / 100; pr.at = tnow;
            pr.vx = (pr.nx - pr.ox) / 0.05; pr.vy = (pr.ny - pr.oy) / 0.05; pr.vz = (pr.nz - pr.oz) / 0.05;
          }
          W.projs = W.projs.filter(x => ids.has(x.id));
        }
        return;
      }
      if (m.t === 'e') { if (Array.isArray(m.E)) for (const e of m.E) { if (Array.isArray(e)) { try { onEv(e, true); } catch (x) { console.error(x); } } } return; }
      if (m.t === 'po') { NET.rtt = performance.now() - m.c; return; }
    }
    function guestCfg(m) {
      const md = G.maps.find(x => x.key === m.map) || G.maps[0];
      const fresh = !W || W.M.key !== md.key || scr !== 'play' || NET.cfgN !== m.time;
      W = newWorld(md, m.mode, 1, false);
      W.time = m.time; W.teamScore = m.ts || [0, 0];
      if (m.z) { W.zone.i = m.z[0]; W.zone.t = m.z[1]; }
      W.onClaim = (p, wk, hits) => { NET.claimH = hits; };
      W.onProj = (p, kind, x, y, z, vx, vy, vz) => netSend({ t: 'p', k: kind, o: [x, y, z].map(v => +v.toFixed(2)), v: [vx, vy, vz].map(v => +v.toFixed(2)) });
      for (const a of m.P) {
        const isMe = a[0] === m.me;
        const p = mkPlayer(W, a[0], { name: a[1], team: a[2], cls: a[3], bot: !!a[4], remote: !isMe, local: isMe });
        p.alive = !!a[5]; p.x = p.px = a[6]; p.y = p.py = a[7]; p.z = p.pz = a[8]; p.yaw = a[9]; p.kills = a[10]; p.deaths = a[11]; p.score = a[12]; p.inGame = !!a[13];
        p.maxHp = G.classes[p.cls].hp; p.hp = a[14];
        if (isMe) { p.nextCls = SV.cls; }
        W.players[a[0]] = p;
      }
      if (Array.isArray(m.pk)) m.pk.forEach((u, i) => { if (W.pickups[i]) W.pickups[i].up = !!u; });
      me = W.players[m.me];
      if (me.alive) { const hp = me.hp; spawnPlayer(W, me, { x: me.x, y: me.y, z: me.z, yaw: me.yaw }); me.hp = hp; me.spawnProt = 0; }
      W.ev.length = 0;
      NET.buf.length = 0; NET.offSet = false; NET.snapK = 0; NET.cfgN = m.time;
      if (me.nextCls !== me.cls) netSend({ t: 'cl', c: me.nextCls });
      beginPlay();
      if (!me.alive) api.timeout(() => showDeath(), 300);
    }
    function guestFrame(dt, tnow) {
      {
        simAcc += dt;
        let n = 0;
        while (simAcc >= STEP && n < 16) {
          simAcc -= STEP; n++;
          W.t += STEP; W.tick++;
          if (!me.alive) me.respawnT -= STEP;
          if (me.alive && !W.over) {
            if (me.ai) me.ai.think(W, STEP);
            wishMove(W, me, STEP); physStep(W, me, STEP);
            NET.claimH = null;
            const shots = me.shots;
            weaponStep(W, me, STEP);
            if (me.y < W.M.killY) me.vy = 0;
          }
          const E = W.ev, fwd = [];
          let shot = null;
          for (const e of E) {
            onEv(e, false);
            if (e[0] === 'fx' && e[1] === me.slot) { const w = me.weps[e[2]]; if (w && w.d.kind !== 'rocket') shot = shot || { t: 'f', w: w.k, T: [], h: [] }; }
            else if (e[0] === 'tr' && e[1] === me.slot && shot) shot.T.push(e.slice(2));
            else if (e[0] === 'mh' && e[1] === me.slot) { netSend({ t: 'f', w: G.melee, h: NET.claimH || [] }); }
            else if (['j', 'sl', 'ld', 'rl', 'sw', 'me', 'mm', 'nt'].includes(e[0]) && e[1] === me.slot) fwd.push([e[0], 0, e[2] || 0]);
          }
          if (shot) { shot.h = NET.claimH || []; netSend(shot); }
          if (fwd.length) netSend({ t: 'a', E: fwd });
          E.length = 0;
          NET.inAcc = (NET.inAcc || 0) + 1;
          if (NET.inAcc >= 2) {
            NET.inAcc = 0;
            netSend({ t: 'i', q: ++NET.inSeq, p: [q2(me.x), q2(me.y), q2(me.z)], v: [q2(me.vx), q2(me.vy), q2(me.vz)], a: [Math.round(me.yaw * 1000), Math.round(me.pitch * 1000)], f: (me.onGround ? 2 : 0) | (me.crouch ? 4 : 0) | (me.slide > 0 ? 8 : 0) | (me.adsF > 0.5 ? 16 : 0) | (me.spawnProt <= 0 ? 128 : 0), w: me.cur }, true);
          }
          if (W.tick % 60 === 0) netSend({ t: 'pg', c: performance.now() });
        }
        if (n === 16) simAcc = 0;
      }
      const B = NET.buf;
      if (B.length) {
        const rt = (tnow - NET.off) / (STEP * 1000) - 7;
        while (B.length > 2 && B[1].k <= rt) B.shift();
        const A = B[0], C = B.length > 1 && A.k <= rt ? B[1] : A;
        const al = C === A ? 0 : clamp((rt - A.k) / (C.k - A.k), 0, 1.2);
        const cm = new Map(); for (const a of C.P) cm.set(a[0], a);
        for (const a of A.P) {
          const p = W.players[a[0]];
          if (!p || p === me) continue;
          const c = cm.get(a[0]) || a;
          const f = c[6];
          if (W.t - (p.evT || -9) > 1.2) p.alive = !!(f & 1);
          if (W.t >= (p.holdT || 0)) {
            p.x = lerp(a[1], c[1], al) / 100; p.y = lerp(a[2], c[2], al) / 100; p.z = lerp(a[3], c[3], al) / 100;
            p.yaw = a[4] / 1000 + angD(c[4] / 1000, a[4] / 1000) * al; p.pitch = lerp(a[5], c[5], al) / 1000;
          }
          p.onGround = !!(f & 2); p.crouch = !!(f & 4); p.slide = f & 8 ? 0.1 : 0; p.adsF = f & 16 ? 1 : 0; p.shield = f & 32 ? 1 : 0; p.spawnProt = f & 64 ? 1 : 0;
          p.vx = c[13] / 100; p.vz = c[14] / 100;
          if (p.cur !== c[7]) { p.cur = c[7]; }
          if (!p.weps.length || p.weps[0].k !== G.classes[c[9]].prim) { p.cls = c[9]; giveLoadout(W, p); p.cur = c[7]; }
          p.hp = c[8];
        }
      }
      const k = (tnow - (W.projs.length ? 0 : 0));
      for (const r of W.projs) { const t = clamp((tnow - r.at) / 50, 0, 1.5); r.px = r.x; r.py = r.y; r.pz = r.z; r.x = r.ox + (r.nx - r.ox) * t; r.y = r.oy + (r.ny - r.oy) * t; r.z = r.oz + (r.nz - r.oz) * t; }
    }

    let hidT = 0;
    api.interval(() => {
      if (NET.role !== 'host' || !W) return;
      const t = performance.now();
      if (t - lastRaf < 300) { hidT = t; return; }
      const el = Math.min(1, (t - hidT) / 1000);
      hidT = t;
      let n = Math.round(el / STEP);
      while (n-- > 0) tick();
      lastRaf = t - 300;
    }, 100);

    api.loop((dt, t) => frame(dt, t));
    if (api.net.invite) { previewWorld(); goOnline(); } else menu();
    G.debug = { get W() { return W; }, get me() { return me; }, get scr() { return scr; }, get NET() { return NET; }, get paused() { return paused; }, look, view, SV, startOffline, menu, matchOver: () => { if (W) { W.time = 0; } }, PR, keys, inp, run: (n) => { for (let i = 0; i < n; i++) tick(); }, standings, cam: o => { camO = o; thirdPerson = !!o; }, auto: d => { autoP = d == null ? null : { diff: d }; if (me && d == null) me.ai = null; } };
    window.__fps = window.__fps || {}; window.__fps[ID_OF(G)] = G.debug;
    return () => {
      releaseMouse();
      try { if (NET.role) api.net.close(); } catch (e) {}
      audio.close();
      view.dispose();
      if (window.__fps) delete window.__fps[ID_OF(G)];
    };
  }
  const ID_OF = G => G.id;
