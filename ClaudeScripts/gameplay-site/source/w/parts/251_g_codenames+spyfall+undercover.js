(() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rnd = n => Math.floor(Math.random() * n);
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const pick = a => a[rnd(a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtT = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const BOT_NAMES = ['Ada', 'Bruno', 'Cleo', 'Dario', 'Esme', 'Finn', 'Gus', 'Hana', 'Ivo', 'Juno', 'Kiko', 'Lola', 'Milo', 'Nia', 'Otto', 'Pia', 'Quin', 'Rosa', 'Sven', 'Tala'];
  const HUES = [4, 28, 48, 96, 150, 176, 200, 222, 262, 292, 322, 344];
  const avatar = (name, i, bot) => `<span class="av${bot ? ' bot' : ''}" style="--h:${HUES[i % HUES.length]}">${esc((name || '?').trim().charAt(0).toUpperCase() || '?')}</span>`;
  const myName = () => {
    try {
      const p = JSON.parse(localStorage.getItem('gameplay:profile'));
      const n = p && (p.username || p.displayName);
      if (n) return String(n).replace(/[<>&"']/g, '').slice(0, 16) || 'You';
    } catch (e) {}
    return 'You';
  };
  const botSeats = (humans, total) => {
    const seats = humans.map(h => ({ id: h.id || null, name: h.name, bot: false }));
    const names = shuf(BOT_NAMES.filter(n => !seats.some(s => s.name === n)));
    while (seats.length < total) seats.push({ id: null, name: names.pop() || 'Bot' + seats.length, bot: true });
    return seats;
  };
  const words = s => (s || '').toLowerCase().match(/[a-z']+/g) || [];

  const baseCss = (id, p) => `
.gm-${id}{gap:0;justify-content:flex-start;align-items:stretch;user-select:none;-webkit-user-select:none}
.gm-${id} [hidden]{display:none!important}
.gm-${id} .${p}-app{position:relative;width:100%;max-width:1040px;margin:0 auto;color:var(--ink);font-family:var(--sans);border-radius:20px;background:radial-gradient(120% 90% at 50% 0,var(--bg2),var(--bg1));box-shadow:0 14px 40px rgba(8,10,24,.32);overflow:hidden;min-height:min(640px,calc(100dvh - 170px))}
.gm-${id} .${p}-app button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-${id} .${p}-app input,.gm-${id} .${p}-app select,.gm-${id} .${p}-app textarea{font-family:var(--sans);user-select:text;-webkit-user-select:text}
.gm-${id} .${p}-menu{padding:22px 18px 26px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.gm-${id} .${p}-menu h2{margin:4px 0 0;font:900 clamp(30px,6vw,46px)/1 var(--sans);letter-spacing:-.03em}
.gm-${id} .${p}-menu .sub{margin:0;max-width:34em;font:600 15px/1.5 var(--sans);color:var(--mut)}
.gm-${id} .${p}-card{width:100%;max-width:440px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px;text-align:left;display:flex;flex-direction:column;gap:10px}
.gm-${id} .${p}-card h4{margin:0;font:900 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.gm-${id} .${p}-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font:800 14px var(--sans)}
.gm-${id} .${p}-row>span:first-child{color:var(--mut);font-weight:700}
.gm-${id} .${p}-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 20px;border-radius:14px;border:0;background:var(--acc);color:var(--acc-ink,#fff);font:900 15px/1.1 var(--sans);box-shadow:inset 0 -4px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.28);transition:transform .12s,filter .12s}
.gm-${id} .${p}-btn:hover{filter:brightness(1.08)}
.gm-${id} .${p}-btn:active{transform:translateY(2px)}
.gm-${id} .${p}-btn:disabled{opacity:.4;pointer-events:none}
.gm-${id} .${p}-btn.alt{background:var(--panel2);color:var(--ink);box-shadow:inset 0 0 0 2px var(--line)}
.gm-${id} .${p}-btn.warn{background:#d6453d;color:#fff}
.gm-${id} .${p}-btn.good{background:#2f9e5b;color:#fff}
.gm-${id} .${p}-btn.sm{min-height:36px;padding:0 13px;font-size:13px;border-radius:11px}
.gm-${id} .${p}-btn.wide{width:100%}
.gm-${id} .${p}-in{min-height:44px;padding:0 14px;border-radius:12px;border:2px solid var(--line);background:rgba(0,0,0,.28);color:var(--ink);font:800 16px var(--sans);outline:0;min-width:0}
.gm-${id} .${p}-in:focus{border-color:var(--acc)}
.gm-${id} select.${p}-in{padding:0 8px}
.gm-${id} .${p}-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:var(--panel2);font:800 11px var(--sans);letter-spacing:.04em;color:var(--mut);white-space:nowrap}
.gm-${id} .${p}-chip.on{background:var(--acc);color:var(--acc-ink,#fff)}
.gm-${id} .av{flex:none;width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;font:900 14px var(--sans);color:#fff;background:hsl(var(--h) 55% 46%);box-shadow:inset 0 -3px 0 rgba(0,0,0,.2),0 0 0 2px rgba(255,255,255,.16)}
.gm-${id} .av.bot{background:hsl(var(--h) 18% 40%);border-radius:9px}
.gm-${id} .${p}-pane{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:14px;background:rgba(6,8,20,.74);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);overflow:auto}
.gm-${id} .${p}-box{width:100%;max-width:520px;margin:0 auto;position:sticky;top:14px;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.5);animation:${p}-in .3s cubic-bezier(.2,1.3,.4,1)}
.gm-${id} .${p}-box h3{margin:0;font:900 24px var(--sans);letter-spacing:-.02em}
.gm-${id} .${p}-box p,.gm-${id} .${p}-box li{margin:0;font:600 14px/1.5 var(--sans);color:var(--ink)}
.gm-${id} .${p}-box ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px}
.gm-${id} .${p}-box .k{font:900 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
@keyframes ${p}-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-${id} .${p}-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);background:rgba(0,0,0,.18);flex-wrap:wrap}
.gm-${id} .${p}-top .grow{flex:1}
.gm-${id} .${p}-net{display:flex;align-items:center;gap:6px;font:800 11px var(--sans);color:var(--mut)}
.gm-${id} .${p}-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-${id} .${p}-net.bad i{background:#ff5b4b}
.gm-${id} .${p}-tm{font:900 20px var(--sans);font-variant-numeric:tabular-nums;letter-spacing:.02em}
.gm-${id} .${p}-tm.low{color:#ff7a6b;animation:${p}-pulse .6s infinite alternate}
@keyframes ${p}-pulse{to{opacity:.55}}
.gm-${id} .${p}-toast{position:absolute;left:50%;bottom:14px;transform:translate(-50%,20px);padding:9px 16px;border-radius:99px;background:rgba(10,12,28,.92);border:1px solid var(--line);font:800 13px var(--sans);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:40;max-width:92%;text-align:center}
.gm-${id} .${p}-toast.show{opacity:1;transform:translate(-50%,0)}
.gm-${id} .${p}-log{display:flex;flex-direction:column;gap:5px;overflow:auto;font:600 13px/1.4 var(--sans)}
.gm-${id} kbd{font:800 11px var(--sans);padding:1px 6px;border-radius:5px;background:var(--panel2);border:1px solid var(--line)}
@media (max-width:640px){.gm-${id} .${p}-app{border-radius:14px}}
`;

  function runTable(root, api, G) {
    const P = G.p;
    root.innerHTML = `<div class="${P}-app"><div class="${P}-menu"></div><div class="${P}-game" hidden></div><div class="${P}-pane" hidden></div><div class="${P}-toast"></div></div>`;
    const app = root.firstChild, menuEl = app.children[0], gameEl = app.children[1], paneEl = app.children[2], toastEl = app.children[3];
    const M = { mode: 'menu', eng: null, seat: 0, tok: 0, view: null, dl: 0, hooked: false, lastTick: Date.now(), room: null };
    const opts = Object.assign({}, G.defaults, api.load() || {});
    const saveOpts = () => api.save(opts);
    let ui = null, toastT = 0;

    const ctl = {
      api, opts, P,
      get mode() { return M.mode; },
      get seat() { return M.seat; },
      get online() { return M.mode === 'host' || M.mode === 'guest'; },
      get canLobby() { return M.mode === 'host'; },
      send(a) {
        if (M.mode === 'guest') { api.net.send({ t: 'a', a }); return; }
        if (!M.eng) return;
        M.eng.act(M.seat, a, true);
        push();
      },
      toast(t) {
        toastEl.textContent = t; toastEl.classList.add('show');
        clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2400);
      },
      pane(html) { paneEl.innerHTML = `<div class="${P}-box">${html}</div>`; paneEl.hidden = false; },
      closePane() { paneEl.hidden = true; paneEl.innerHTML = ''; },
      score(v) { api.score(v); },
      submit(v) { api.submit(v); }
    };

    const keep = fn => {
      const a = document.activeElement;
      let k = null, val, s0, s1;
      if (a && gameEl.contains(a) && a.dataset && a.dataset.k) { k = a.dataset.k; val = a.value; try { s0 = a.selectionStart; s1 = a.selectionEnd; } catch (e) {} }
      fn();
      if (k) {
        const n = gameEl.querySelector('[data-k="' + k + '"]');
        if (n) { if (val !== undefined && n.value !== val) n.value = val; n.focus({ preventScroll: true }); try { n.setSelectionRange(s0, s1); } catch (e) {} }
      }
    };
    ctl.keep = keep;

    function toMenu() {
      M.mode = 'menu'; M.eng = null; M.view = null; M.dl = 0; ui = null;
      gameEl.hidden = true; gameEl.innerHTML = ''; ctl.closePane();
      menuEl.hidden = false; menuEl.innerHTML = G.menu(opts);
      api.score(0);
    }
    function showGame() {
      menuEl.hidden = true; gameEl.hidden = false;
      if (!ui) { gameEl.innerHTML = ''; ui = G.ui(gameEl, ctl); }
    }
    function show(v) {
      M.view = v; M.dl = v.tl != null ? performance.now() + v.tl : 0;
      showGame();
      ui.update(v);
      tmTick();
    }
    const SK = 'gameplay:' + P + 'save';
    const wipe = () => { try { sessionStorage.removeItem(SK); } catch (e) {} };
    function saveHost() {
      if (M.mode !== 'host' || !M.eng) return;
      try {
        if (M.eng.s.phase === 'series') wipe();
        else sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), s: M.eng.s, names: M.eng.seats.map(x => x.name), bots: M.eng.seats.map(x => !!x.bot) }));
      } catch (e) {}
    }
    function push() {
      const e = M.eng;
      if (!e) return;
      saveHost();
      e.seats.forEach((s, i) => {
        if (s.bot) return;
        if (i === M.seat) show(e.view(i));
        else if (M.mode === 'host' && s.id) api.net.sendTo(s.id, { t: 'v', v: e.view(i) });
      });
    }
    function tmTick() {
      const left = M.dl ? M.dl - performance.now() : null;
      gameEl.querySelectorAll('[data-tm]').forEach(el => {
        el.textContent = left == null ? '--' : fmtT(left);
        el.classList.toggle('low', left != null && left < 10000);
      });
    }
    function begin(seats, extra) {
      M.eng = G.create(seats, Object.assign({}, opts, extra || {}, { leader: () => (M.mode === 'host' ? api.net.leader : null) }));
      M.seat = 0; M.lastTick = Date.now();
      ui = null; gameEl.innerHTML = '';
      push();
    }
    function practice() {
      M.tok++; M.mode = 'local';
      const n = clamp(+opts.size || G.pdef, G.pmin, G.pmax);
      begin(botSeats([{ id: 'me', name: myName() }], n), { local: true });
    }
    function hostStart(r) {
      let sv = null;
      try {
        const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
        if (x && x.code === api.net.code && x.s && x.names && Date.now() - x.at < 432e5 && x.s.phase !== 'series') sv = x;
      } catch (e) {}
      if (!sv) return freshStart(r);
      const used = {}, map = {};
      for (const g of r.players.slice(1)) {
        const q = sv.names.findIndex((nm, i) => i > 0 && !sv.bots[i] && !used[i] && nm === g.name);
        if (q < 0) return freshStart(r);
        used[q] = 1; map[q] = g;
      }
      const left = sv.names.filter((nm, i) => i > 0 && !sv.bots[i] && !used[i]).length;
      M.mode = 'host'; M.eng = null; M.pend = { r, sv, map }; ui = null;
      menuEl.hidden = true; gameEl.hidden = false;
      gameEl.innerHTML = `<div class="${P}-wait"><h3>Game in progress</h3><p>A saved game was found for this party.${left ? ' ' + left + ' missing player' + (left > 1 ? 's' : '') + ' will be replaced by bots.' : ''}</p><div class="${P}-wrow"><button class="${P}-btn good" data-a="resume">Resume game</button><button class="${P}-btn alt" data-a="fresh">New game</button><button class="${P}-btn alt" data-a="leave">Leave</button></div></div>`;
    }
    function resume() {
      const { r, sv, map } = M.pend || {};
      if (!sv) return;
      M.pend = null;
      const seats = sv.names.map((nm, i) => ({ id: i === 0 ? r.players[0].id : (map[i] ? map[i].id : null), name: nm, bot: i > 0 && !!sv.bots[i] }));
      M.eng = G.create(seats, Object.assign({}, opts, { local: false, bots: !!r.bots, leader: () => (M.mode === 'host' ? api.net.leader : null) }));
      const st = M.eng.s;
      Object.keys(st).forEach(k => { delete st[k]; });
      Object.assign(st, JSON.parse(JSON.stringify(sv.s)));
      M.eng.shift(Date.now() - sv.at);
      sv.names.forEach((nm, i) => { if (i > 0 && !sv.bots[i] && !map[i]) M.eng.botify(i); });
      M.seat = 0; M.lastTick = Date.now(); ui = null; gameEl.innerHTML = '';
      push();
      ctl.toast('Game resumed');
    }
    function fresh() { const p = M.pend; M.pend = null; wipe(); if (p) freshStart(p.r); }
    function freshStart(r) {
      const seats = r.players.map(p => ({ id: p.id, name: p.name, bot: false }));
      const total = r.bots ? Math.max(seats.length, Math.min(G.max, +r.size || seats.length)) : seats.length;
      const names = shuf(BOT_NAMES.filter(n => !seats.some(s => s.name === n)));
      while (seats.length < total) seats.push({ id: null, name: names.pop() || 'Bot' + seats.length, bot: true });
      M.mode = 'host';
      begin(seats, { local: false, bots: !!r.bots });
    }
    async function online() {
      const tok = ++M.tok;
      hook();
      ctl.closePane();
      M.mode = 'lobby'; M.eng = null; ui = null; gameEl.innerHTML = '';
      const r = await api.net.room(G.room(opts));
      if (!api.alive || tok !== M.tok) return;
      if (!r) { toMenu(); return; }
      M.room = r;
      if (r.role === 'host') hostStart(r);
      else {
        M.mode = 'guest'; M.eng = null; M.view = null;
        menuEl.hidden = true; gameEl.hidden = false;
        gameEl.innerHTML = `<div class="${P}-wait"><div class="spin"></div><p>Connected. Waiting for the host to deal...</p><button class="${P}-btn alt sm" data-a="leave">Leave</button></div>`;
        ui = null;
      }
    }
    function leave() {
      M.tok++; wipe();
      try { api.net.close(); } catch (e) {}
      toMenu();
    }
    function hook() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !api.alive) return;
        if (M.mode === 'host' && M.eng) {
          if (d.t !== 'a' || !d.a || typeof d.a !== 'object') return;
          const i = M.eng.seats.findIndex(s => s.id === from && !s.bot);
          if (i < 0) return;
          const priv = from === api.net.leader || i === 0;
          if (M.eng.act(i, d.a, priv)) push();
          else api.net.sendTo(from, { t: 'v', v: M.eng.view(i) });
        } else if (M.mode === 'guest' && d.t === 'v' && d.v) show(d.v);
      });
      api.net.on('leave', p => {
        if (M.mode !== 'host' || !M.eng || !p) return;
        const i = M.eng.seats.findIndex(s => s.id === p.id && !s.bot);
        if (i < 0) return;
        const nm = M.eng.seats[i].name;
        M.eng.botify(i);
        ctl.toast(nm + ' left. A bot takes the seat.');
        push();
      });
      api.net.on('rejoin', p => {
        if (M.mode !== 'host' || !M.eng || !p) return;
        const i = M.eng.seats.findIndex(s => s.id === p.id && !s.bot);
        if (i >= 0) api.net.sendTo(p.id, { t: 'v', v: M.eng.view(i) });
      });
      api.net.on('lobby', () => { if (M.mode === 'guest') online(); });
      api.net.on('close', reason => {
        if (M.mode !== 'guest') return;
        M.tok++; M.mode = 'closed'; M.eng = null;
        api.sfx('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the party.' : reason === 'host-left' ? 'The host ended the party.' : 'The connection to the party was lost.';
        menuEl.hidden = true; gameEl.hidden = false; ui = null;
        gameEl.innerHTML = `<div class="${P}-wait"><h3>${h}</h3><p>${t}</p><div class="${P}-wrow"><button class="${P}-btn" data-a="online">New party</button><button class="${P}-btn alt" data-a="leave">Menu</button></div></div>`;
      });
    }

    const common = {
      practice, online, resume, fresh,
      leave,
      lobby() { if (M.mode === 'host') { wipe(); online(); } },
      how() { ctl.pane(G.how + `<button class="${P}-btn" data-a="closepane">Got it</button>`); },
      closepane() { ctl.closePane(); }
    };
    api.on(app, 'click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      const a = b.dataset.a;
      if (common[a]) { api.sfx('tap'); common[a](b); return; }
      if (G.acts && G.acts[a]) { api.sfx('tap'); G.acts[a]({ opts, save: saveOpts, practice, online, menu: () => { menuEl.innerHTML = G.menu(opts); } }, b); return; }
      if (ui && ui.click) ui.click(a, b, e);
    });
    api.on(app, 'change', e => {
      const o = e.target.dataset && e.target.dataset.o;
      if (o) {
        const t = e.target;
        opts[o] = t.type === 'checkbox' ? t.checked : (t.value !== '' && !isNaN(+t.value) ? +t.value : t.value);
        saveOpts();
        if (M.mode === 'menu') { menuEl.innerHTML = G.menu(opts); }
        return;
      }
      if (ui && ui.change) ui.change(e);
    });
    api.on(app, 'input', e => { if (ui && ui.input) ui.input(e); });
    api.on(app, 'keydown', e => {
      if (e.key === 'Escape' && !paneEl.hidden) { ctl.closePane(); return; }
      if (ui && ui.keydown) ui.keydown(e);
    });
    api.on(window, 'keydown', e => {
      if (M.mode === 'menu' || !ui || !ui.hotkey) return;
      if (e.target && e.target.closest && e.target.closest('input,textarea,select')) return;
      ui.hotkey(e);
    });

    api.interval(() => {
      const t = Date.now(), dt = t - M.lastTick;
      M.lastTick = t;
      if (!M.eng || M.mode === 'guest' || M.mode === 'lobby') return;
      if (M.mode === 'local' && api.paused) { M.eng.shift(dt); return; }
      if (M.eng.tick(t)) push();
    }, 250);
    api.interval(() => {
      tmTick();
      const nets = gameEl.querySelectorAll('.' + P + '-net');
      if (nets.length) {
        const on = M.mode === 'local' || api.net.connected;
        nets.forEach(n => {
          n.classList.toggle('bad', !on);
          n.lastChild.textContent = M.mode === 'local' ? 'Practice' : !on ? 'Reconnecting...' : (M.mode === 'host' ? 'Hosting' : 'Online') + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        });
      }
    }, 500);

    ctl.leave = leave; ctl.lobby = common.lobby; ctl.toMenu = toMenu;
    if (api.net.invite) online(); else toMenu();
    return { destroy() { M.tok++; } };
  }

  const waitCss = (id, p) => `
.gm-${id} .${p}-wait{min-height:min(520px,calc(100dvh - 190px));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:20px}
.gm-${id} .${p}-wait p{margin:0;font:700 15px var(--sans);color:var(--mut)}
.gm-${id} .${p}-wait h3{margin:0;font:900 26px var(--sans)}
.gm-${id} .${p}-wrow{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.gm-${id} .${p}-wait .spin{width:34px;height:34px;border-radius:50%;border:4px solid var(--line);border-top-color:var(--acc);animation:${p}-spin .8s linear infinite}
@keyframes ${p}-spin{to{transform:rotate(360deg)}}
`;
  const CN_RAW = `
ocean: wave whale shark ship island beach anchor pirate sail coral dolphin tide reef
sea: ship harbor sailor fish salt shell crab wave port lighthouse boat
water: river lake rain ice steam drop well bucket flood fountain pool tap
river: bridge bank flow canoe mill dam boat fish mud delta bend
fish: shark whale tuna net hook scale fin bait salmon reel pond
bird: eagle owl crow feather nest wing egg parrot swan beak flight
flight: plane wing pilot airport bird jet cloud runway ticket cockpit parachute
sky: cloud star sun moon bird plane rainbow kite balloon blue horizon
space: moon star rocket planet alien orbit comet satellite astronaut galaxy void
moon: night star orbit tide crater werewolf lunar silver eclipse month
sun: day light hot summer ray eclipse desert beach tan solar noon
star: sky night galaxy hero sheriff pentagram twinkle celebrity wish comet
weather: rain snow storm wind cloud thunder fog sun frost hurricane flood
storm: thunder lightning rain wind cloud tornado hurricane flood wave siege
winter: snow ice cold frost sled coat fireplace december penguin igloo ski
snow: winter ice flake sled ski man cold white mountain avalanche glove
ice: cube cold freeze skate hockey berg frost cream winter glacier pole
fire: flame burn match smoke hot torch dragon ash engine camp spark
hot: fire sun desert pepper summer oven steam spice sauna lava
cold: ice snow winter freezer frost penguin shiver chill north arctic
mountain: peak snow climb cliff valley summit rock cave goat ridge yeti
forest: tree wood leaf wolf bear deer moss path hunter camp owl
tree: leaf root branch bark oak pine apple wood forest fruit trunk
plant: seed leaf flower pot root soil garden sun cactus vine factory
flower: rose petal bee garden spring tulip seed bouquet pollen daisy vase
garden: flower seed hose plant shed fence gnome weed rose vegetable
farm: barn cow pig horse tractor hay corn field sheep rooster fence
animal: zoo cat dog horse cow lion tiger bear wolf fox monkey
cat: kitten whiskers purr tiger lion mouse fur claw tail litter
dog: bone puppy bark leash wolf tail collar fetch kennel bite
horse: saddle gallop pony stable race mane cowboy hoof rider carriage
bear: honey forest cave paw polar grizzly teddy hibernate cub panda
wild: forest jungle lion wolf tiger safari west savage untamed camp
jungle: monkey vine tiger parrot snake rain humid tarzan canopy safari
snake: venom fang cobra python viper scale slither hiss charmer adder
insect: bee ant fly spider beetle wasp mosquito butterfly web hive
bee: honey hive sting wax flower queen buzz wasp pollen swarm
spider: web fly silk legs insect spin tarantula trap thread
farmyard: cow pig sheep hen goat duck barn milk straw horse
food: bread cheese meat fruit pizza soup rice cake salt pie
fruit: apple orange banana grape lemon peach berry cherry melon juice
sweet: sugar candy honey cake chocolate pie jam syrup cherry dessert
sugar: sweet candy cake cube cane honey syrup coffee tooth cookie
bread: toast loaf bakery flour butter sandwich crumb yeast oven roll
cheese: mouse milk cow pizza moon cheddar slice mold cream swiss
meat: steak beef ham sausage bacon grill butcher chicken burger
breakfast: egg toast cereal bacon coffee pancake juice milk waffle morning
drink: water juice milk wine beer tea coffee cup straw thirst
coffee: bean cup espresso mug latte cafe milk sugar morning cream
tea: cup leaf kettle spoon pot sugar herb china lemon tray
wine: grape glass bottle cork vineyard red cellar toast barrel
kitchen: oven stove knife fork spoon pan pot sink fridge cook
cook: chef oven pan recipe kitchen boil bake fry stove menu
knife: blade cut sharp fork kitchen stab dagger sword butter handle
restaurant: menu waiter chef table bill tip dinner kitchen reservation order
party: balloon cake music dance guest gift candle confetti birthday
birthday: cake candle gift party balloon card age wish song
music: note song band guitar piano drum rhythm concert radio album
instrument: guitar piano drum flute violin horn harp bell trumpet organ
band: rock guitar drum concert singer stage tour fan album bass
dance: ballet tango waltz step stage disco partner music move
sing: voice song choir note opera mic karaoke tune lyric
piano: key note grand tune concert pedal black white hammer
drum: beat stick band rhythm snare roll bass skin march
guitar: string rock pick chord amp band neck strum solo
movie: film actor camera cinema popcorn screen director ticket scene sequel
theater: stage actor curtain play drama seat ticket costume audience scene
actor: stage movie role star script film costume camera fame mask
show: stage curtain audience circus magic talent act ticket performance
circus: clown tent lion trapeze acrobat juggler ringmaster elephant tightrope
magic: wand wizard trick spell hat rabbit potion witch card illusion
wizard: wand magic spell hat beard potion tower staff apprentice robe
witch: broom spell cauldron hat potion black cat magic curse
ghost: haunted spirit boo sheet spooky castle grave phantom chain halloween
monster: giant dragon beast zombie vampire werewolf scary troll cave
dragon: fire wing scale knight cave treasure tail castle breath egg
vampire: bat fang blood cape night coffin garlic stake castle bite
knight: sword armor castle horse shield lance king dragon round quest
castle: king queen tower moat knight wall drawbridge dungeon throne prince
king: queen crown throne castle royal palace chess prince kingdom ruler
queen: king crown bee palace royal throne chess jewel princess
crown: king queen jewel gold royal prince tooth head throne
royal: king queen prince crown palace throne duke jewel guard
treasure: gold chest map pirate island coin jewel diamond hunt buried
pirate: ship treasure parrot sword flag skull eyepatch hook island rum plank
gold: coin ring treasure bar rush mine medal king nugget bullion
money: coin bill bank cash dollar rich wallet pay saving purse
bank: money vault teller loan river safe account coin cash robber
shop: store buy sell cart market mall cashier price customer sale
market: shop stall fruit crowd price buy sell stock fish fair
mail: letter stamp envelope post address package box carrier deliver
letter: mail stamp envelope alphabet write post card address word
book: page library read author chapter cover novel shelf story word
library: book shelf quiet card read librarian study desk loan
school: teacher class desk book pencil student bell homework chalk test
teacher: school class chalk board lesson student grade desk ruler
paper: sheet page pen print news book fold note origami tear
write: pen pencil paper ink letter author note desk poem diary
pen: ink write paper cap pencil cage pig sign quill
art: paint brush canvas museum gallery sculpture draw color easel
paint: brush canvas color wall roller art artist red blue wet
draw: pencil sketch line paper art picture chalk comic cartoon
picture: photo frame camera draw paint wall album image portrait
camera: photo flash lens film picture tripod shutter movie snap
color: red blue green yellow paint rainbow orange purple crayon
rainbow: color sky rain arch unicorn pot gold red violet
red: blood rose cherry apple fire ruby stop heart tomato
blue: sky sea ocean jean sad whale berry sapphire
green: grass leaf frog emerald go lime forest pea envy
black: night coal crow ink dark cat spy ace panther
white: snow milk cloud paper swan ghost cotton salt wedding
yellow: sun banana lemon gold canary corn duck taxi cheese
dark: night shadow black shade cave moon gloom blind
night: dark moon star owl bed sleep dream bat midnight
sleep: bed dream pillow night nap yawn blanket snore rest
bed: sleep pillow blanket mattress dream sheet nap room night
house: home roof door window kitchen garage attic chimney garden
home: house family bed kitchen address nest sweet door
door: knob lock key window hinge knock house gate handle
window: glass curtain pane frame house view sill open
key: lock door piano chain unlock card ring board
lock: key door safe chain combination bolt padlock vault latch
glass: window mirror bottle cup lens wine crystal broken shatter
mirror: reflection glass image vain bathroom magic wall compact
clock: time hour tick tower alarm watch hand pendulum minute
time: clock hour minute watch second age late tick history
watch: wrist time clock guard eye alarm hand hunt
light: lamp bulb sun candle flash bright beam torch switch
lamp: light bulb genie desk shade bedside oil lantern
candle: wax flame wick birthday light cake dark romantic
electric: shock wire battery plug socket light current spark power
battery: charge power electric cell phone flashlight acid remote
computer: mouse keyboard screen code virus web laptop file program
phone: call ring text screen app number contact mobile camera
internet: web site email link online network wifi page browser
game: play board card dice chess win score level player
chess: king queen pawn knight bishop rook board check mate
card: ace king queen joker deck suit poker trump bridge hand
dice: roll game casino luck six cube gamble die
casino: poker dice slot chip roulette bet luck gamble cards
luck: clover horseshoe dice rabbit fortune charm lottery fate
sport: ball team game race score coach field referee medal player
ball: soccer tennis basket golf bounce kick throw round net
soccer: ball goal kick referee field net team pitch cup striker
basketball: hoop dunk court ball net team shoot dribble
tennis: racket court net serve ball match love ace
golf: club hole tee green ball caddy course swing par
swimming: pool water dive stroke goggles lane crawl float
race: car run fast track finish marathon speed lap runner
run: race jog marathon sprint fast track escape shoe
medal: gold silver bronze olympic win prize ribbon hero honor
team: group player coach captain win club squad crew
war: army battle soldier gun tank bomb general flag peace
army: soldier tank gun general camp uniform march base
soldier: army gun uniform helmet march war boot rank
weapon: sword gun bow arrow knife spear shield cannon
sword: blade knight duel steel king sheath pirate fencing
gun: bullet trigger pistol rifle shoot cowboy barrel soldier sheriff
arrow: bow target archer point sign quiver cupid direction
shield: knight armor protect guard defense captain crest
ship: sail sea captain deck crew anchor cargo port navy
boat: sail oar paddle lake fish captain row river harbor
submarine: sea periscope navy deep torpedo yellow dive
train: rail station track engine ticket conductor whistle tunnel
car: wheel engine road drive taxi race garage brake traffic
road: street highway car traffic sign path map bridge lane
bridge: river cross arch span toll tunnel card troll
city: tower street traffic building mayor subway crowd skyline
building: tower skyscraper brick floor roof elevator office construction
tower: castle clock eiffel high bell lookout tall radio
bell: ring church tower dinner jingle alarm school cow
church: bell cross priest wedding pray steeple altar choir
wedding: ring bride groom cake dress church marry vow bouquet
marry: wedding ring bride groom vow husband wife
ring: finger gold diamond wedding bell boxing circus phone
jewel: diamond ruby emerald crown gold necklace ring treasure
diamond: ring jewel carat hard sparkle baseball rich suit
clothes: shirt dress jacket hat sock shoe coat jeans scarf
hat: cap crown top cowboy wizard head brim straw hair
shoe: boot sock lace sole sneaker heel foot run
coat: jacket winter paint rain fur wool button
dress: gown wedding skirt party fashion bride princess
glove: hand boxing winter mitten baseball finger leather
body: head arm leg hand foot heart brain bone skin
head: hat brain hair eye ear nose crown boss
hand: finger thumb palm glove clap wave fist
foot: shoe toe heel sock walk kick yard
eye: see glasses blind lash pupil spy lens needle
ear: hear listen drum earring music hearing
heart: love beat valentine red blood cupid organ
brain: mind think smart head genius idea memory
bone: skeleton skull dog rib fossil dinosaur break marrow
skeleton: bone skull ribs ghost halloween closet dance
doctor: nurse hospital medicine patient clinic stethoscope surgeon pill
hospital: doctor nurse bed ambulance patient surgery ward emergency
medicine: pill doctor cure drug syrup bottle vaccine nurse
sick: flu cold fever ill hospital cough doctor tissue
science: lab experiment atom chemistry physics test theory microscope
atom: bomb science nuclear particle electron energy molecule
lab: experiment science test tube coat microscope chemist
robot: machine android metal circuit program laser factory
machine: engine robot factory gear motor press vending washing
engine: car motor train machine steam fuel piston jet
tool: hammer saw drill wrench screw nail shovel pliers
hammer: nail tool thor judge gavel smash mallet
nail: hammer finger polish toe claw screw wood
wood: tree log board forest axe carpenter plank saw
metal: iron steel gold silver copper heavy rock can
iron: metal steel clothes press man gym fist
stone: rock pebble cliff gem castle statue wall sling
rock: stone mountain band roll cliff pebble guitar
cave: bat bear dark mountain stalactite tunnel hole troll
desert: sand camel cactus dune hot oasis dry mirage pyramid
egypt: pyramid pharaoh mummy sphinx nile desert tomb camel
pyramid: egypt pharaoh triangle mummy tomb desert scheme
mummy: egypt tomb bandage pharaoh wrap curse
ancient: old history ruin egypt rome relic fossil temple
history: past war king ancient museum date book
museum: art history statue exhibit guide ticket gallery dinosaur
dinosaur: fossil bone extinct museum egg trex jurassic reptile
fossil: bone dinosaur stone ancient museum shell amber
europe: paris london rome berlin madrid alps euro castle
paris: eiffel france tower baguette art fashion louvre
london: big ben bridge tea rain thames queen bus
america: eagle flag states cowboy liberty dollar new
cowboy: horse hat boot lasso west sheriff ranch saloon cattle
west: cowboy sheriff desert saloon gold east compass sunset
spy: secret agent code mask camera bug mission glasses gadget
secret: spy hidden code lock key whisper password diary mystery
code: secret spy computer password cipher morse program signal
detective: clue mystery holmes magnifier crime case badge
crime: thief police prison robber detective gun law steal
thief: steal robber mask bag crime pocket burglar jewel
police: officer badge siren cop prison arrest law radio
prison: cell guard jail bars key escape inmate lock
law: judge court lawyer police rule justice jury crime
judge: court gavel law jury trial robe sentence
rule: law king ruler order game measure guide
ruler: king measure line queen inch rule straight leader
measure: ruler tape inch scale meter cup weigh
number: digit count zero one math seven dozen total
math: number add plus sum algebra circle angle zero
circle: round ring wheel ball zero disc orbit circus
square: box block four plaza corner tile root
triangle: pyramid three angle point bermuda pizza tip
line: queue rope string row border draw ruler straight
point: dot tip needle arrow pin sharp score
needle: thread pin sharp sew eye haystack syringe
thread: needle sew silk spider yarn cotton button
cotton: soft white plant shirt candy cloth ball
silk: soft spider worm road smooth scarf thread tie
office: desk boss meeting computer paper clerk stapler phone
boss: leader chief office king mafia manager level
mafia: godfather boss crime family gang mob
gang: crime mob group street leader pack
pack: wolf bag group card gang bundle camp
wolf: howl pack moon forest fang sheep dog hunt
lion: king mane roar jungle cat safari pride africa
tiger: stripe cat jungle orange roar claw zoo
elephant: trunk tusk ivory zoo africa memory circus huge
monkey: banana ape tree zoo tail jungle chimp swing
banana: monkey yellow peel split fruit bunch bread
apple: tree red fruit pie newton core cider doctor
orange: fruit juice peel color citrus orange tangerine vitamin
lemon: sour yellow juice tea citrus tart squeeze
sour: lemon vinegar bitter candy cream grape pickle
salt: sea shaker pepper taste crystal tear mine
pepper: salt spice hot grinder bell black chili
spice: pepper hot curry ginger cinnamon herb market
pizza: cheese slice pie italy oven dough tomato delivery
italy: pizza rome pasta venice boot tower opera
pasta: noodle spaghetti italy sauce fork macaroni boil
soup: bowl spoon hot broth chicken tomato noodle
egg: shell yolk chicken omelet easter nest hatch breakfast
chicken: egg hen rooster wing feather nugget coop farm
milk: cow white calf bottle cheese glass cream
cream: ice milk whip coffee dairy sour butter
butter: bread knife churn fly cream toast milk
cake: birthday candle sweet slice icing bake party layer
cookie: biscuit chocolate jar crumb oven monster sweet
chocolate: cocoa sweet bar candy milk brown dark truffle
candy: sweet sugar lollipop gum chocolate halloween jar
holiday: christmas vacation easter beach trip festival break
christmas: santa tree gift snow reindeer december elf stocking
santa: christmas sleigh beard reindeer gift chimney claus
gift: present ribbon box birthday wrap christmas surprise
easter: egg bunny spring chocolate basket
halloween: pumpkin ghost costume witch candy trick bat spooky
pumpkin: halloween pie orange patch lantern carve seed
travel: trip map passport suitcase ticket tour flight hotel
hotel: room bed lobby pool key tourist check bell
map: atlas compass treasure route globe travel guide legend
compass: north map needle direction sailor navigate south
globe: world earth map sphere spin planet
world: earth globe cup planet country map war
earth: planet world soil ground globe dirt quake
planet: earth mars venus orbit space jupiter saturn moon
mars: red planet rover alien space god
alien: ufo space martian green abduct planet invasion
rocket: space launch moon fire astronaut missile firework
firework: rocket spark bang night celebration colorful july
bomb: explode fuse atom blast bang tick dynamite
`;
  const CN_EXTRA = 'anvil saddle harpoon parade quiver rubble scarecrow spatula trumpet umbrella velvet waffle yacht zipper accordion blizzard cannon dumpling elevator fountain gondola hammock igloo jigsaw kayak ladder magnet orchard parachute quartz raft sandwich tent unicorn volcano windmill xylophone zeppelin avalanche bagpipe cobweb drawbridge escalator fireplace glacier harmonica iceberg joystick kangaroo lighthouse mermaid necklace octopus quicksand scooter tornado umpire vase whistle zebra pottery anchor lantern bakery blacksmith carpenter gardener sailor'.split(' ');
  const CN_STOP = new Set('ace address age angle audience author bake bang bark bill bite blind boil break buy check cell cross december direction dream draw escape experiment fast fist flash flood group guide hero image inch kick level love march match measure memory mine minute mystery nap note order play post power press price program read rhythm rich roar round row run score sell sew shoot sick sign sing soft sour spell spin spooky steal straight string swing test tick tip tune vow wish win wrap write zero tear tour trick word crowd escape hot cold dark wild sweet sharp white black red blue green yellow'.split(' '));
  const CN_ASSOC = {}, CN_INV = {}, CN_CNT = {};
  CN_RAW.trim().split('\n').forEach(l => {
    const i = l.indexOf(':');
    const c = l.slice(0, i).trim();
    const ws = l.slice(i + 1).trim().split(/\s+/).filter(w => w && w !== c);
    CN_ASSOC[c] = new Set(ws);
    ws.forEach(w => { CN_CNT[w] = (CN_CNT[w] || 0) + 1; (CN_INV[w] = CN_INV[w] || new Set()).add(c); });
    (CN_INV[c] = CN_INV[c] || new Set()).add(c);
  });
  const CN_WORDS = [...new Set([...Object.keys(CN_ASSOC), ...Object.keys(CN_CNT).filter(w => CN_CNT[w] >= 2), ...CN_EXTRA])].filter(w => !CN_STOP.has(w) && w.length >= 3).sort();
  const CN_CLUES = Object.keys(CN_ASSOC);

  const cnRel = (clue, w) => {
    let s = 0;
    const A = CN_ASSOC[clue];
    if (A && A.has(w)) s = 1;
    if (CN_ASSOC[w] && CN_ASSOC[w].has(clue)) s = Math.max(s, .9);
    const a = CN_INV[clue], b = CN_INV[w];
    if (a && b) { let k = 0; for (const x of a) if (b.has(x)) k++; s = Math.max(s, Math.min(.8, k * .24)); }
    if (clue.length >= 4 && w.length >= 4 && (w.includes(clue) || clue.includes(w))) s = Math.max(s, .75);
    if (clue.length >= 4 && w.length >= 4 && clue.slice(0, 4) === w.slice(0, 4)) s = Math.max(s, .5);
    return s;
  };
  const cnClueOk = (w, board) => {
    w = w.toLowerCase();
    if (!/^[a-z][a-z-]{1,19}$/.test(w)) return 'The clue must be one word (letters only).';
    for (const b of board) {
      if (!b.open) continue;
      const x = b.w;
      if (x === w) return 'That word is on the board.';
      if (w.length >= 4 && x.length >= 4 && (w.includes(x) || x.includes(w))) return 'The clue is too close to a board word.';
    }
    return '';
  };
  function cnPickClue(board, own, bad, soft, used) {
    const kind = new Map();
    own.forEach(i => kind.set(i, 'o')); bad.forEach(i => kind.set(i, 'b')); soft.forEach(i => kind.set(i, 's'));
    const cards = board.map((b, i) => ({ i, w: b.w })).filter(x => board[x.i].open && kind.has(x.i));
    let best = [], bestSc = -1e9;
    for (const c of CN_CLUES) {
      if (used.has(c) || cnClueOk(c, board)) continue;
      const arr = [];
      for (const x of cards) { const r = cnRel(c, x.w); if (r >= .3) arr.push({ k: kind.get(x.i), r }); }
      arr.sort((a, b) => b.r - a.r);
      let run = 0;
      while (run < arr.length && arr[run].k === 'o' && (run === 0 || arr[run].r >= .45)) run++;
      if (!run) continue;
      const nx = arr[run];
      let pen = nx ? (nx.k === 'b' ? 9 : nx.k === 's' ? 2.5 : 0) : 0, ob = 0, os = 0, oo = 0;
      arr.slice(run + 1).forEach(a => { if (a.k === 'b') ob++; else if (a.k === 's') os++; else if (a.r >= .45) oo++; });
      const sc = Math.min(run, 4) * 3 + oo * .4 - pen - ob * 2.5 - os * .6 + Math.random() * .6;
      if (sc > bestSc + .4) { bestSc = sc; best = [{ c, o: run, sc }]; }
      else if (sc > bestSc - .4) best.push({ c, o: run, sc });
    }
    if (!best.length) {
      const i = own[rnd(own.length)];
      const alt = ['thing', 'item', 'object', 'stuff', 'matter'].find(x => !used.has(x) && !cnClueOk(x, board)) || 'thing';
      return { w: alt, n: 1, hint: board[i].w };
    }
    best.sort((a, b) => b.sc - a.sc);
    const pk = best[rnd(Math.min(3, best.length))];
    return { w: pk.c, n: Math.max(1, Math.min(4, pk.o)) };
  }
  function cnDeal() {
    const out = new Set();
    for (const c of shuf(CN_CLUES.slice())) {
      if (out.size >= 20) break;
      shuf([...CN_ASSOC[c]]).filter(w => !out.has(w) && !/[ -]/.test(w)).slice(0, 3 + rnd(2)).forEach(w => out.add(w));
    }
    for (const w of shuf(CN_WORDS.slice())) { if (out.size >= 25) break; out.add(w); }
    return shuf([...out]).slice(0, 25);
  }
  function cnPickGuess(board, cands, clue, made, n) {
    const sc = cands.map(i => ({ i, s: cnRel(clue.toLowerCase(), board[i].w) + Math.random() * .06 })).sort((a, b) => b.s - a.s);
    if (!sc.length) return -1;
    const top = sc[0];
    if (made >= 1 && (top.s < .3 || (n > 0 && made >= n && top.s < .8))) return -1;
    return top.i;
  }

  function cnCreate(seats, opt) {
    const duet = opt.mode === 'duet';
    if (duet) { while (seats.length < 2) seats.push({ id: null, name: 'Ada', bot: true }); seats.length = 2; }
    const lead = i => i === 0 || (opt.leader && opt.leader() && opt.leader() === seats[i].id);
    const s = {
      duet, phase: duet ? 'play' : 'setup', round: 0, series: { r: 0, b: 0, w: 0, l: 0 }, tm: [], spy: [], botSpy: { r: false, b: false },
      board: [], key: [], rev: [], turn: 'r', start: 'r', clue: null, left: 0, made: 0, log: [], winner: null, why: '', marks: [], at: 0,
      fill: !!opt.local || !!opt.bots, used: new Set(), errs: {}, eid: 0, sel: []
    };
    const E = {
      seats, s,
      shift(ms) { if (s.at) s.at += ms; },
      botify(i) { seats[i].bot = true; seats[i].name = seats[i].name + ' (bot)'; s.at = Date.now() + 600; },
      view: null, act: null, tick: null
    };
    const fail = (i, m) => { s.errs[i] = { m, id: ++s.eid }; return true; };
    const sched = ms => { s.at = Date.now() + ms; };
    const other = t => (t === 'r' ? 'b' : 'r');
    const isBot = i => i < 0 || seats[i].bot;

    function assign() {
      const idx = shuf(seats.map((x, i) => i));
      idx.forEach((i, k) => { s.tm[i] = k % 2 ? 'b' : 'r'; s.spy[i] = false; });
      s.botSpy = { r: false, b: false };
    }
    function spyIdx(t) { return seats.findIndex((x, i) => s.tm[i] === t && s.spy[i]); }
    function opsOf(t) { return seats.map((x, i) => i).filter(i => s.tm[i] === t && !s.spy[i]); }
    function setupErr() {
      if (s.fill) {
        for (const t of ['r', 'b']) if (!seats.some((x, i) => s.tm[i] === t)) return 'Each team needs at least one player.';
        return '';
      }
      for (const t of ['r', 'b']) {
        const sp = spyIdx(t);
        if (sp < 0 || seats[sp].bot) return 'Each team needs a spymaster.';
        if (!opsOf(t).some(i => !seats[i].bot)) return 'Each team needs an operative.';
      }
      return '';
    }
    function newBoardClassic() {
      s.round++;
      const ws = cnDeal();
      s.board = ws.map(w => ({ w, open: true }));
      s.start = Math.random() < .5 ? 'r' : 'b';
      const k = [];
      for (let i = 0; i < 9; i++) k.push(s.start);
      for (let i = 0; i < 8; i++) k.push(other(s.start));
      for (let i = 0; i < 7; i++) k.push('n');
      k.push('a');
      s.key = shuf(k);
      s.rev = Array(25).fill(null);
      s.turn = s.start; s.clue = null; s.left = 0; s.made = 0; s.log = []; s.winner = null; s.why = ''; s.marks = []; s.used = new Set();
    }
    function beginClassic() {
      for (const t of ['r', 'b']) {
        let sp = spyIdx(t);
        if (sp < 0) {
          const bots = seats.map((x, i) => i).filter(i => s.tm[i] === t && seats[i].bot);
          if (bots.length) { sp = bots[0]; s.spy[sp] = true; s.botSpy[t] = false; }
          else s.botSpy[t] = true;
        } else s.botSpy[t] = false;
      }
      newBoardClassic();
      s.phase = 'play';
      sched(1200);
    }
    function newBoardDuet() {
      s.round++;
      const ws = cnDeal();
      s.board = ws.map(w => ({ w, open: true }));
      const cells = shuf([...Array(25).keys()]);
      const kA = Array(25).fill('n'), kB = Array(25).fill('n');
      const take = (n, a, b) => { for (let j = 0; j < n; j++) { const c = cells.pop(); kA[c] = a; kB[c] = b; } };
      take(3, 'g', 'g'); take(5, 'g', 'n'); take(1, 'g', 'a'); take(5, 'n', 'g'); take(1, 'a', 'g'); take(1, 'a', 'a'); take(1, 'a', 'n'); take(1, 'n', 'a');
      s.keys = [kA, kB];
      s.found = Array(25).fill(false); s.tn = Array(25).fill(0);
      s.tokens = 9; s.turn = rnd(2); s.dphase = 'clue'; s.clue = null; s.left = 0; s.made = 0; s.log = []; s.winner = null; s.why = ''; s.sel = [-1, -1]; s.used = new Set(); s.sd = -1;
    }
    if (duet) { newBoardDuet(); sched(1200); } else assign();

    const remaining = t => s.key.reduce((n, c, i) => n + (c === t && !s.rev[i] ? 1 : 0), 0);
    const dTotal = () => s.keys[0].reduce((n, c, i) => n + (c === 'g' || s.keys[1][i] === 'g' ? 1 : 0), 0);
    const dFound = () => s.found.filter(Boolean).length;
    const dDead = i => {
      if (s.found[i]) return true;
      const a = s.keys[0][i] === 'g' && !(s.tn[i] & 1), b = s.keys[1][i] === 'g' && !(s.tn[i] & 2);
      return !a && !b && s.tn[i] !== 0;
    };
    const dOpenFor = (i, k) => !s.found[i] && !(s.tn[i] & (1 << k)) && !dDead(i);

    function endGameClassic(w, why) {
      s.phase = 'over'; s.winner = w; s.why = why; s.series[w]++; s.at = 0;
      s.board.forEach(b => { b.open = true; });
    }
    function nextTurn() {
      s.turn = other(s.turn); s.clue = null; s.left = 0; s.made = 0; s.marks = []; sched(1500);
    }
    function revealClassic(i, by) {
      const c = s.key[i];
      s.rev[i] = c; s.board[i].open = false; s.made++;
      s.log.push({ k: 'rev', tm: s.turn, w: s.board[i].w, c, by });
      s.marks = [];
      if (c === 'a') { endGameClassic(other(s.turn), 'assassin'); return; }
      if (remaining('r') === 0) { endGameClassic('r', 'agents'); return; }
      if (remaining('b') === 0) { endGameClassic('b', 'agents'); return; }
      if (c === s.turn) {
        s.left--;
        if (s.left <= 0) { s.log.push({ k: 'end', tm: s.turn }); nextTurn(); } else sched(1100);
      } else { s.log.push({ k: 'end', tm: s.turn }); nextTurn(); }
    }
    function dReveal(i, by) {
      const g = s.turn;
      const c = s.keys[g][i];
      s.made++; s.sel = [-1, -1];
      if (c === 'a') {
        s.log.push({ k: 'drev', w: s.board[i].w, c: 'a', by });
        s.phase = 'over'; s.winner = 'lose'; s.why = 'assassin'; s.at = 0; s.series.l++;
        return;
      }
      if (c === 'g') {
        s.found[i] = true; s.board[i].open = false;
        s.log.push({ k: 'drev', w: s.board[i].w, c: 'g', by });
        if (dFound() >= dTotal()) { s.phase = 'over'; s.winner = 'win'; s.why = 'agents'; s.at = 0; s.series.w++; return; }
        s.left--;
        if (s.left <= 0) dEndTurn(); else sched(1100);
        return;
      }
      s.tn[i] |= 1 << g;
      if (dDead(i)) s.board[i].open = false;
      s.log.push({ k: 'drev', w: s.board[i].w, c: 'n', by });
      dEndTurn();
    }
    function dEndTurn() {
      s.log.push({ k: 'dend' });
      s.tokens--;
      s.turn = 1 - s.turn; s.clue = null; s.left = 0; s.made = 0; s.sel = [-1, -1];
      if (s.tokens <= 0) { s.dphase = 'sudden'; s.sd = s.turn; s.log.push({ k: 'sudden' }); }
      else s.dphase = 'clue';
      sched(1500);
    }
    function dSudden(i, by) {
      const g = 1 - s.sd;
      const c = s.keys[g][i];
      if (c === 'a') {
        s.log.push({ k: 'drev', w: s.board[i].w, c: 'a', by });
        s.phase = 'over'; s.winner = 'lose'; s.why = 'assassin'; s.at = 0; s.series.l++;
        return;
      }
      if (c === 'g') {
        s.found[i] = true; s.board[i].open = false;
        s.log.push({ k: 'drev', w: s.board[i].w, c: 'g', by });
        if (dFound() >= dTotal()) { s.phase = 'over'; s.winner = 'win'; s.why = 'agents'; s.at = 0; s.series.w++; return; }
        sched(1100);
        return;
      }
      s.log.push({ k: 'drev', w: s.board[i].w, c: 'n', by });
      s.phase = 'over'; s.winner = 'lose'; s.why = 'bystander'; s.at = 0; s.series.l++;
    }

    E.act = function (i, a, priv) {
      if (!a || typeof a.k !== 'string') return false;
      if (s.phase === 'setup') {
        if (a.k === 'team' && (a.tm === 'r' || a.tm === 'b')) {
          if (s.tm[i] !== a.tm) { s.tm[i] = a.tm; s.spy[i] = false; }
          return true;
        }
        if (a.k === 'spy') {
          if (s.spy[i]) { s.spy[i] = false; return true; }
          const t = s.tm[i], cur = spyIdx(t);
          if (cur >= 0 && !seats[cur].bot) return fail(i, 'Your team already has a human spymaster.');
          if (cur >= 0) s.spy[cur] = false;
          s.spy[i] = true;
          return true;
        }
        if (a.k === 'shuf' && priv) { assign(); return true; }
        if (a.k === 'start' && priv) {
          const e = setupErr();
          if (e) return fail(i, e);
          beginClassic();
          return true;
        }
        return false;
      }
      if (s.phase === 'over') {
        if (a.k === 'again' && priv) {
          if (duet) { s.phase = 'play'; newBoardDuet(); sched(1200); }
          else { s.phase = 'setup'; s.board = []; s.rev = []; }
          return true;
        }
        return false;
      }
      if (duet) {
        if (s.dphase === 'clue' && a.k === 'clue' && i === s.turn) {
          const w = String(a.w || '').trim().toLowerCase();
          const err = cnClueOk(w, s.board.map((b, k) => ({ w: b.w, open: !s.found[k] })));
          if (err) return fail(i, err);
          if (s.used.has(w)) return fail(i, 'That clue was already used.');
          const n = a.n === 'inf' ? -1 : clamp(parseInt(a.n, 10) || 0, 0, 9);
          s.used.add(w);
          s.clue = { w: w.toUpperCase(), n, by: i };
          s.left = n <= 0 ? 99 : n + 1; s.made = 0; s.dphase = 'guess';
          s.log.push({ k: 'dclue', w: s.clue.w, n, by: i });
          sched(1300);
          return true;
        }
        if (s.dphase === 'guess' && i === 1 - s.turn) {
          if (a.k === 'sel') { s.sel[i] = s.sel[i] === a.i ? -1 : a.i; return true; }
          if (a.k === 'rev' && Number.isInteger(a.i) && a.i >= 0 && a.i < 25 && dOpenFor(a.i, s.turn)) { dReveal(a.i, i); return true; }
          if (a.k === 'end' && s.made >= 1) { dEndTurn(); return true; }
        }
        if (s.dphase === 'sudden' && i === s.sd) {
          if (a.k === 'sel') { s.sel[i] = s.sel[i] === a.i ? -1 : a.i; return true; }
          if (a.k === 'rev' && Number.isInteger(a.i) && a.i >= 0 && a.i < 25 && dOpenFor(a.i, 1 - s.sd)) { dSudden(a.i, i); return true; }
        }
        return false;
      }
      if (s.phase !== 'play') return false;
      const mine = s.tm[i] === s.turn;
      if (a.k === 'clue' && mine && s.spy[i] && !s.clue) {
        const w = String(a.w || '').trim().toLowerCase();
        const err = cnClueOk(w, s.board.map((b, k) => ({ w: b.w, open: !s.rev[k] })));
        if (err) return fail(i, err);
        if (s.used.has(w)) return fail(i, 'That clue was already used.');
        const n = a.n === 'inf' ? -1 : clamp(parseInt(a.n, 10) || 0, 0, 9);
        s.used.add(w);
        s.clue = { w: w.toUpperCase(), n, by: i };
        s.left = n <= 0 ? 99 : n + 1; s.made = 0;
        s.log.push({ k: 'clue', tm: s.turn, w: s.clue.w, n, by: i });
        sched(1300);
        return true;
      }
      if (!s.clue || !mine || s.spy[i]) return false;
      if (a.k === 'sel' && Number.isInteger(a.i) && a.i >= 0 && a.i < 25 && !s.rev[a.i]) {
        s.marks[i] = s.marks[i] === a.i ? -1 : a.i;
        return true;
      }
      if (a.k === 'rev' && Number.isInteger(a.i) && a.i >= 0 && a.i < 25 && !s.rev[a.i]) { revealClassic(a.i, i); return true; }
      if (a.k === 'end' && s.made >= 1) { s.log.push({ k: 'end', tm: s.turn }); nextTurn(); return true; }
      return false;
    };

    E.tick = function (now) {
      if (s.phase !== 'play' || !s.at || now < s.at) return false;
      if (duet) {
        if (s.dphase === 'clue') {
          const g = s.turn;
          if (!seats[g].bot) return false;
          const own = [], bad = [], soft = [];
          s.board.forEach((b, k) => {
            if (s.found[k]) return;
            const c = s.keys[g][k];
            if (c === 'g') own.push(k); else if (c === 'a' && !dDead(k)) bad.push(k); else if (!dDead(k)) soft.push(k);
          });
          let pick;
          if (!own.length) {
            pick = { w: cnPickClue(s.board.map((b, k) => ({ w: b.w, open: !dDead(k) })), [soft[0] === undefined ? 0 : soft[0]], bad, [], s.used).w, n: 0 };
          } else pick = cnPickClue(s.board.map((b, k) => ({ w: b.w, open: !s.found[k] })), own, bad, soft, s.used);
          s.used.add(pick.w);
          s.clue = { w: pick.w.toUpperCase(), n: pick.n, by: g };
          s.left = pick.n + 1; s.made = 0; s.dphase = 'guess';
          s.log.push({ k: 'dclue', w: s.clue.w, n: pick.n, by: g });
          sched(1800);
          return true;
        }
        if (s.dphase === 'guess') {
          const h = 1 - s.turn;
          if (!seats[h].bot) return false;
          const cands = s.board.map((b, k) => k).filter(k => dOpenFor(k, s.turn));
          const k = cnPickGuess(s.board, cands, s.clue.w, s.made, s.clue.n);
          if (k < 0) { dEndTurn(); return true; }
          dReveal(k, h);
          return true;
        }
        if (s.dphase === 'sudden') {
          if (!seats[s.sd].bot) return false;
          const g = 1 - s.sd;
          const cands = s.board.map((b, k) => k).filter(k => dOpenFor(k, g));
          const mine = cands.filter(k => s.keys[s.sd][k] === 'n');
          const safe = mine.length ? mine : cands.filter(k => s.keys[s.sd][k] !== 'a');
          const k = (safe.length ? safe : cands)[rnd((safe.length ? safe : cands).length)];
          if (k === undefined) return false;
          dSudden(k, s.sd);
          return true;
        }
        return false;
      }
      const t = s.turn;
      if (!s.clue) {
        const sp = s.botSpy[t] ? -1 : spyIdx(t);
        if (!(s.botSpy[t] || (sp >= 0 && seats[sp].bot))) return false;
        const own = [], bad = [], soft = [];
        s.board.forEach((b, k) => {
          if (s.rev[k]) return;
          const c = s.key[k];
          if (c === t) own.push(k); else if (c === 'a' || c === other(t)) bad.push(k); else soft.push(k);
        });
        const pick = cnPickClue(s.board.map((b, k) => ({ w: b.w, open: !s.rev[k] })), own, bad, soft, s.used);
        s.used.add(pick.w);
        s.clue = { w: pick.w.toUpperCase(), n: pick.n, by: sp };
        s.left = pick.n + 1; s.made = 0;
        s.log.push({ k: 'clue', tm: t, w: s.clue.w, n: pick.n, by: sp });
        sched(2200);
        return true;
      }
      if (opsOf(t).some(i => !seats[i].bot)) return false;
      const cands = s.board.map((b, k) => k).filter(k => !s.rev[k]);
      const k = cnPickGuess(s.board, cands, s.clue.w, s.made, s.clue.n);
      if (k < 0) { s.log.push({ k: 'end', tm: t }); nextTurn(); return true; }
      revealClassic(k, -1);
      return true;
    };

    E.view = function (i) {
      const v = { g: 'cn', duet, phase: s.phase, me: i, lead: lead(i), round: s.round, series: s.series, err: s.errs[i] || null, fill: s.fill };
      v.seats = seats.map((x, j) => ({ n: x.name, bot: x.bot, tm: s.tm[j] || null, spy: !!s.spy[j], lead: lead(j), you: j === i }));
      if (duet) {
        const g = s.turn, over = s.phase === 'over';
        v.turn = g; v.dphase = s.dphase; v.tokens = s.tokens; v.clue = s.clue; v.left = s.left >= 99 ? -1 : s.left; v.made = s.made;
        v.mykey = s.keys[i];
        v.board = s.board.map((b, k) => ({ w: b.w, f: s.found[k], tn: s.tn[k], dead: dDead(k) && !s.found[k], k: over ? [s.keys[0][k], s.keys[1][k]] : null }));
        v.sel = s.sel[i]; v.sd = s.sd;
        v.found = dFound(); v.total = dTotal();
        v.log = s.log.slice(-40);
        v.winner = s.winner; v.why = s.why;
        v.canAct = s.phase === 'play' && ((s.dphase === 'clue' && i === g) || (s.dphase === 'guess' && i === 1 - g) || (s.dphase === 'sudden' && i === s.sd));
        return v;
      }
      v.turn = s.turn; v.start = s.start;
      v.botSpy = s.botSpy;
      if (s.phase === 'setup') { v.setupErr = setupErr(); return v; }
      const spyView = s.spy[i] || s.phase === 'over';
      const mk = [];
      s.marks.forEach((m, j) => { if (m >= 0 && m !== undefined) (mk[m] = mk[m] || []).push(j); });
      v.board = s.board.map((b, k) => ({ w: b.w, c: s.rev[k], k: spyView ? s.key[k] : null, m: mk[k] || null }));
      v.clue = s.clue; v.left = s.left >= 99 ? -1 : s.left; v.made = s.made;
      v.rem = { r: remaining('r'), b: remaining('b') };
      v.sel = s.marks[i] === undefined ? -1 : s.marks[i];
      v.log = s.log.slice(-40);
      v.winner = s.winner; v.why = s.why;
      v.opsLive = opsOf(s.turn).some(j => !seats[j].bot);
      return v;
    };
    return E;
  }
  const CN_TN = { r: 'Red', b: 'Blue' };
  const cnArt = c => {
    const w = 'fill="rgba(255,255,255,.92)"';
    if (c === 'a') return `<svg viewBox="0 0 48 48"><path ${w} d="M24 5c-10 0-16 6.5-16 15 0 5.500 3 8.500 6.500 10.500V38h19v-7.500C37 28.500 40 25.500 40 20 40 11.500 34 5 24 5z"/><circle cx="17.500" cy="21" r="4.500" fill="#14141a"/><circle cx="30.500" cy="21" r="4.500" fill="#14141a"/><path d="M24 25l-2.500 5h5z" fill="#14141a"/><path d="M19 38v5M24 38v5M29 38v5" stroke="#14141a" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (c === 'n') return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="31" rx="19" ry="5.500" fill="rgba(70,55,30,.7)"/><path fill="rgba(70,55,30,.7)" d="M12 31c0-13 5-19 12-19s12 6 12 19z"/><rect x="12" y="25" width="24" height="3.500" fill="rgba(255,235,190,.7)"/><circle cx="24" cy="40" r="2" fill="rgba(70,55,30,.6)"/></svg>`;
    return `<svg viewBox="0 0 48 48"><circle cx="24" cy="14" r="8.500" ${w}/><path ${w} d="M6 45c0-11 8-18 18-18s18 7 18 18z"/><path d="M19 28l5 9 5-9" fill="rgba(0,0,0,.28)"/><path d="M24 37l-2-4h4z" fill="rgba(0,0,0,.4)"/></svg>`;
  };

  const CN_HOW = `<p class="k">Codenames</p><h3>How to play</h3>
<ul>
<li><b>Two teams, Red and Blue.</b> Each has one spymaster who sees the secret key card; everyone else is an operative.</li>
<li>The spymaster gives <b>one word and a number</b>. The word links several of their team's cards, the number says how many.</li>
<li>Operatives pick a card (tap to select, tap again or press Reveal). Your agent: keep guessing. Up to <b>number + 1</b> guesses (the "+1" rule); 0 or the infinity sign means unlimited.</li>
<li>A bystander or the other team's agent ends your turn. <b>The assassin loses the game on the spot.</b></li>
<li>The first team to reveal all its agents wins. The starting team has 9 agents, the other 8.</li>
<li>The clue cannot be a word on the board, or part of one.</li>
<li><b>Duet:</b> two players, one team. Each has a key; you take turns giving clues and guessing against your partner's key. Find all 15 agents before 9 turns run out. If the turns run out, sudden death follows: no more clues, and any wrong guess, even a bystander, loses.</li>
</ul>`;

  function cnMenu(o) {
    return `<h2>Codenames</h2>
<p class="sub">Two spymasters, one-word clues, 25 secret words. Find your agents and dodge the assassin.</p>
<div class="cn-card"><h4>Classic · 4 to 10 players</h4>
<button class="cn-btn wide" data-a="cn-online">Play online</button>
<button class="cn-btn alt wide" data-a="cn-practice">Practice with bots</button>
<div class="cn-row"><span>Practice players (you + bots)</span><select class="cn-in" data-o="size">${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}"${(+o.size || 4) === n ? ' selected' : ''}>${n}</option>`).join('')}</select></div></div>
<div class="cn-card"><h4>Duet · co-op for 2</h4>
<button class="cn-btn wide" data-a="cn-duet-online">Play Duet online</button>
<button class="cn-btn alt wide" data-a="cn-duet-practice">Duet with a bot partner</button></div>
<button class="cn-btn alt sm" data-a="how">How to play</button>`;
  }
  const cnActs = {
    'cn-online': X => { X.opts.mode = 'classic'; X.save(); X.online(); },
    'cn-practice': X => { X.opts.mode = 'classic'; X.save(); X.practice(); },
    'cn-duet-online': X => { X.opts.mode = 'duet'; X.save(); X.online(); },
    'cn-duet-practice': X => { X.opts.mode = 'duet'; X.save(); X.practice(); }
  };

  function cnUi(el, ctl) {
    const api = ctl.api;
    el.innerHTML = `<div class="cn-top"><span class="cn-chip on">CODENAMES</span><span class="cn-chip cn-ser"></span><span class="grow"></span><span class="cn-net"><i></i><span>Practice</span></span><button class="cn-btn alt sm" data-a="how">Rules</button><button class="cn-btn alt sm" data-a="leave">Menu</button></div>
<div class="cn-stage"><div class="cn-setup" hidden></div><div class="cn-play" hidden><div class="cn-hud"></div><div class="cn-board noanim"></div><div class="cn-act"></div></div><aside class="cn-side" hidden></aside></div>`;
    const setupEl = el.querySelector('.cn-setup'), playEl = el.querySelector('.cn-play'), hudEl = el.querySelector('.cn-hud'), boardEl = el.querySelector('.cn-board'), actEl = el.querySelector('.cn-act'), sideEl = el.querySelector('.cn-side'), serEl = el.querySelector('.cn-ser');
    let cards = [], sig = '', V = null, prev = null, lastErr = 0, wins = 0, counted = '', draft = { clue: '', num: '1' };

    const me = v => v.seats[v.me];
    const nm = (v, i) => (i >= 0 && v.seats[i] ? v.seats[i].n : 'Bot');
    const colName = (c) => c === 'r' ? 'Red' : 'Blue';

    function buildBoard(v) {
      const s = v.board.map(b => b.w).join(',');
      if (s === sig) return;
      sig = s;
      boardEl.classList.add('noanim');
      boardEl.innerHTML = v.board.map((b, i) => `<div class="cn-c" data-a="card" data-i="${i}"><div class="in"><div class="f"><span class="w${b.w.length > 9 ? ' l' : ''}">${esc(b.w.toUpperCase())}</span></div><div class="b"></div></div><div class="mk"></div></div>`).join('');
      cards = [...boardEl.children];
      api.timeout(() => boardEl.classList.remove('noanim'), 120);
    }
    function paintBoard(v) {
      v.board.forEach((b, i) => {
        const c = cards[i];
        if (!c) return;
        let cov, key = null;
        if (v.duet) { cov = b.f ? 'g' : b.dead ? 'n' : null; key = v.phase === 'over' ? null : v.mykey[i]; }
        else { cov = b.c; key = b.k; }
        const was = c.dataset.cov || '';
        if ((cov || '') !== was) {
          c.dataset.cov = cov || '';
          c.querySelector('.b').innerHTML = cov ? cnArt(cov === 'g' ? 'r' : cov === 'r' || cov === 'b' ? 'r' : cov) : '';
          c.classList.remove('r', 'b', 'n', 'a', 'g', 'cov');
          if (cov) { c.classList.add(cov, 'cov'); if (cov === 'a' && !boardEl.classList.contains('noanim')) boardEl.classList.add('shake'); }
        }
        c.classList.remove('kr', 'kb', 'kn', 'ka', 'kg', 'half', 'sel');
        if (key && !cov) c.classList.add('k' + key);
        if (v.duet && v.phase === 'over' && !cov && b.k) c.classList.add('k' + (b.k[0] === 'g' || b.k[1] === 'g' ? 'g' : b.k[0] === 'a' || b.k[1] === 'a' ? 'a' : 'n'));
        if (v.duet && !cov && b.tn) c.classList.add('half');
        if (v.sel === i && !cov) c.classList.add('sel');
        const mk = c.querySelector('.mk');
        mk.innerHTML = !cov && b.m ? b.m.map(j => `<i>${esc(nm(v, j).charAt(0).toUpperCase())}</i>`).join('') : '';
      });
      if (boardEl.classList.contains('shake')) api.timeout(() => boardEl.classList.remove('shake'), 700);
    }

    function renderSetup(v) {
      const col = t => {
        const list = v.seats.map((s, i) => ({ s, i })).filter(x => x.s.tm === t);
        const bs = v.fill && !list.some(x => x.s.spy) ? '<div class="cn-seat dim"><span class="av bot" style="--h:200">B</span><span class="nm">Bot spymaster</span></div>' : '';
        return `<div class="cn-team ${t}"><div class="th"><b>${CN_TN[t]} team</b><button class="cn-btn sm ${me(v).tm === t ? 'alt' : ''}" data-a="team" data-t="${t}" ${me(v).tm === t ? 'disabled' : ''}>Join</button></div>
${list.map(x => `<div class="cn-seat${x.s.you ? ' you' : ''}">${avatar(x.s.n, x.i, x.s.bot)}<span class="nm">${esc(x.s.n)}${x.s.you ? ' (you)' : ''}</span>${x.s.spy ? '<span class="cn-chip on">SPYMASTER</span>' : '<span class="cn-chip">operative</span>'}${x.s.bot ? '<span class="cn-chip">bot</span>' : ''}</div>`).join('')}${bs}</div>`;
      };
      const m = me(v);
      setupEl.innerHTML = `<h3>Pick your team</h3><p class="cn-hint">Choose a side. Each team has one spymaster who sees the key card${v.fill ? '. Bots fill any empty role.' : ' and at least one operative.'}</p>
<div class="cn-teams">${col('r')}${col('b')}</div>
<div class="cn-setrow"><button class="cn-btn alt" data-a="spy">${m.spy ? 'Step down as spymaster' : 'Become spymaster'}</button>
${v.lead ? `<button class="cn-btn alt" data-a="shuf">Shuffle teams</button><button class="cn-btn good" data-a="start" ${v.setupErr ? 'disabled' : ''}>Start game</button>` : '<span class="cn-hint">Waiting for the host to start...</span>'}</div>
${v.lead && v.setupErr ? `<p class="cn-hint warn">${esc(v.setupErr)}</p>` : ''}`;
    }

    function turnText(v) {
      if (v.phase === 'over') return '';
      const m = me(v);
      if (v.duet) {
        const g = v.turn;
        if (v.dphase === 'clue') return g === v.me ? 'Your turn: give your partner a clue.' : nm(v, g) + ' is thinking of a clue...';
        if (v.dphase === 'guess') return g === v.me ? 'Your partner is guessing from your key.' : 'Your turn: guess your partner\'s agents.';
        return v.sd === v.me ? 'Sudden death: pick a card.' : nm(v, v.sd) + ' is picking in sudden death.';
      }
      const T = CN_TN[v.turn];
      if (!v.clue) return m.tm === v.turn && m.spy ? 'Your turn: give a clue.' : `${T} spymaster is thinking...`;
      if (m.tm === v.turn && !m.spy) return 'Your turn: find your agents.';
      return m.tm === v.turn ? 'Your operatives are guessing.' : `${T} operatives are guessing.`;
    }

    function renderHud(v) {
      if (v.duet) {
        const clue = v.clue ? `<div class="cn-clue duet"><small>CLUE</small><b>${esc(v.clue.w)}</b><em>${v.clue.n < 0 ? '∞' : v.clue.n}</em></div>` : `<div class="cn-clue empty">${v.dphase === 'sudden' ? 'SUDDEN DEATH' : 'Waiting for a clue'}</div>`;
        hudEl.innerHTML = `<div class="cn-tile g"><b>${v.found}/${v.total}</b><small>agents found</small></div><div class="cn-mid">${clue}<div class="cn-turn">${esc(turnText(v))}</div></div><div class="cn-tile t"><b>${Math.max(0, v.tokens)}</b><small>turns left</small></div>`;
        return;
      }
      const cl = v.clue ? `<div class="cn-clue ${v.turn}"><small>${CN_TN[v.turn].toUpperCase()} CLUE</small><b>${esc(v.clue.w)}</b><em>${v.clue.n < 0 ? '∞' : v.clue.n}</em>${v.left > 0 ? `<span class="cn-chip">${v.left} guess${v.left === 1 ? '' : 'es'} left</span>` : ''}</div>` : `<div class="cn-clue empty ${v.turn}">${CN_TN[v.turn]} spymaster...</div>`;
      hudEl.innerHTML = `<div class="cn-tile r${v.turn === 'r' && v.phase !== 'over' ? ' on' : ''}"><b>${v.rem.r}</b><small>red left${v.start === 'r' ? ' · first' : ''}</small></div><div class="cn-mid">${cl}<div class="cn-turn">${esc(turnText(v))}</div></div><div class="cn-tile b${v.turn === 'b' && v.phase !== 'over' ? ' on' : ''}"><b>${v.rem.b}</b><small>blue left${v.start === 'b' ? ' · first' : ''}</small></div>`;
    }

    function renderAct(v) {
      if (v.phase === 'over') { actEl.innerHTML = ''; return; }
      const m = me(v);
      let html = '';
      const clueForm = `<div class="cn-form"><input class="cn-in" data-k="clue" maxlength="20" placeholder="One word clue" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(draft.clue)}"><select class="cn-in" data-k="num">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<option value="${n}"${draft.num === String(n) ? ' selected' : ''}>${n}</option>`).join('')}<option value="inf"${draft.num === 'inf' ? ' selected' : ''}>∞</option></select><button class="cn-btn good" data-a="clue">Give clue</button></div>`;
      const guessBar = () => {
        const c = v.sel >= 0 && v.board[v.sel] ? v.board[v.sel].w.toUpperCase() : '';
        return `<div class="cn-form"><span class="cn-sel">${c ? 'Selected: <b>' + esc(c) + '</b>' : 'Tap a card to select it'}</span><button class="cn-btn good" data-a="reveal" ${c ? '' : 'disabled'}>Reveal</button><button class="cn-btn alt" data-a="end" ${v.made >= 1 ? '' : 'disabled'}>End turn</button></div>`;
      };
      if (v.duet) {
        if (v.dphase === 'clue' && v.turn === v.me) html = clueForm;
        else if (v.dphase === 'guess' && v.turn !== v.me) html = guessBar();
        else if (v.dphase === 'sudden' && v.sd === v.me) html = `<div class="cn-form"><span class="cn-sel">${v.sel >= 0 && v.board[v.sel] ? 'Selected: <b>' + esc(v.board[v.sel].w.toUpperCase()) + '</b>' : 'Tap a card to select it'}</span><button class="cn-btn good" data-a="reveal" ${v.sel >= 0 ? '' : 'disabled'}>Reveal</button></div>`;
      } else if (m.tm === v.turn) {
        if (!v.clue && m.spy) html = clueForm;
        else if (v.clue && !m.spy) html = guessBar();
      }
      actEl.innerHTML = html;
    }

    function logHtml(v) {
      const rows = v.log.slice().reverse().slice(0, 14).map(e => {
        if (e.k === 'clue') return `<div class="lg ${e.tm}"><b>${CN_TN[e.tm]}</b> clue <b>${esc(e.w)} ${e.n < 0 ? '∞' : e.n}</b></div>`;
        if (e.k === 'dclue') return `<div class="lg"><b>${esc(nm(v, e.by))}</b> clue <b>${esc(e.w)} ${e.n < 0 ? '∞' : e.n}</b></div>`;
        if (e.k === 'rev') return `<div class="lg ${e.c}">${esc(e.by >= 0 ? nm(v, e.by) : 'Bots')}: <b>${esc(e.w.toUpperCase())}</b> ${e.c === 'a' ? 'was the assassin!' : e.c === 'n' ? 'bystander' : e.c === e.tm ? 'agent' : 'enemy agent'}</div>`;
        if (e.k === 'drev') return `<div class="lg ${e.c}">${esc(nm(v, e.by))}: <b>${esc(e.w.toUpperCase())}</b> ${e.c === 'a' ? 'was an assassin!' : e.c === 'n' ? 'bystander' : 'agent found'}</div>`;
        if (e.k === 'end' || e.k === 'dend') return '<div class="lg dim">turn ended</div>';
        return '<div class="lg dim">Sudden death: no more clues</div>';
      });
      return rows.join('') || '<div class="lg dim">No moves yet</div>';
    }
    function keyCard(v) {
      if (v.duet || !(me(v).spy || v.phase === 'over') || !v.board) return '';
      return `<div class="cn-key ${v.start}"><div class="kg">${v.board.map(b => `<i class="${b.k}"></i>`).join('')}</div><small>${me(v).spy ? 'Key card' : 'Key'}</small></div>`;
    }
    function renderSide(v) {
      let h = '';
      if (v.phase === 'over') {
        const win = v.duet ? v.winner === 'win' : v.winner === me(v).tm;
        const title = v.duet ? (v.winner === 'win' ? 'You found every agent!' : v.why === 'bystander' ? 'Sudden death lost' : 'The assassin got you') : CN_TN[v.winner] + ' team wins!';
        const why = v.duet ? (v.winner === 'win' ? 'Mission complete.' : v.why === 'bystander' ? 'A bystander in sudden death ends the mission.' : 'Mission failed.') : (v.why === 'assassin' ? CN_TN[v.winner === 'r' ? 'b' : 'r'] + ' picked the assassin.' : 'All ' + CN_TN[v.winner].toLowerCase() + ' agents were found.');
        h += `<div class="cn-over ${v.duet ? (win ? 'r' : 'b') : v.winner}"><b>${esc(title)}</b><span>${esc(why)}</span>${v.duet ? '' : `<span class="sc">Red ${v.series.r} - ${v.series.b} Blue</span>`}
<div class="cn-orow">${v.lead ? '<button class="cn-btn good sm" data-a="again">Play again</button>' : '<span class="cn-hint">Waiting for the host...</span>'}${ctl.canLobby ? '<button class="cn-btn alt sm" data-a="lobby">Back to lobby</button>' : ''}</div></div>`;
      }
      if (!v.duet) {
        h += `<div class="cn-roster">${['r', 'b'].map(t => `<div class="rt ${t}"><b>${CN_TN[t]}</b>${v.seats.map((s, i) => ({ s, i })).filter(x => x.s.tm === t).map(x => `<div class="rs${x.s.you ? ' you' : ''}">${x.s.spy ? '<em>SPY</em>' : ''}${esc(x.s.n)}</div>`).join('')}${v.botSpy[t] ? '<div class="rs"><em>SPY</em>Bot</div>' : ''}</div>`).join('')}</div>`;
        h += keyCard(v);
      } else {
        h += `<div class="cn-roster"><div class="rt r"><b>Partners</b>${v.seats.map(s => `<div class="rs${s.you ? ' you' : ''}">${esc(s.n)}</div>`).join('')}</div></div>`;
        h += `<div class="cn-tokens">${Array.from({ length: 9 }, (_, i) => `<i class="${i < v.tokens ? 'on' : ''}"></i>`).join('')}</div>`;
      }
      h += `<div class="cn-logt">Log</div><div class="cn-log">${logHtml(v)}</div>`;
      sideEl.innerHTML = h;
    }

    function sounds(v) {
      if (prev && prev.board && v.board && prev.phase === 'play') {
        let ch = null;
        v.board.forEach((b, i) => {
          const o = prev.board[i];
          const a = v.duet ? (b.f ? 'g' : b.dead ? 'n' : null) : b.c, bf = v.duet ? (o.f ? 'g' : o.dead ? 'n' : null) : o.c;
          if (a && !bf) ch = a;
        });
        if (ch) api.sfx(ch === 'a' ? 'lose' : v.duet ? (ch === 'g' ? 'good' : 'bad') : ch === me(v).tm ? 'good' : 'bad');
        else if (v.clue && !prev.clue) api.sfx('pop');
      }
      if (v.phase === 'over' && (!prev || prev.phase !== 'over')) {
        const win = v.duet ? v.winner === 'win' : v.winner === me(v).tm;
        api.sfx(win ? 'win' : 'lose');
        const key = v.round + ':' + v.winner;
        if (counted !== key) { counted = key; if (win) { wins++; ctl.score(wins); ctl.submit(wins); } }
      }
    }

    return {
      update(v) {
        V = v;
        if (v.err && v.err.id !== lastErr) { lastErr = v.err.id; ctl.toast(v.err.m); api.sfx('bad'); }
        ctl.keep(() => {
          serEl.textContent = v.duet ? `Duet · ${v.series.w} won` : `Red ${v.series.r} - ${v.series.b} Blue`;
          const setup = v.phase === 'setup';
          setupEl.hidden = !setup; playEl.hidden = setup; sideEl.hidden = setup;
          if (setup) { renderSetup(v); if (prev && prev.phase !== 'setup') { sig = ''; boardEl.innerHTML = ''; } }
          else {
            buildBoard(v); paintBoard(v); renderHud(v); renderAct(v); renderSide(v);
            boardEl.classList.toggle('over', v.phase === 'over');
          }
        });
        sounds(v);
        prev = v;
      },
      input(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (k === 'clue') draft.clue = e.target.value.replace(/[^A-Za-z-]/g, '');
      },
      change(e) { if (e.target.dataset && e.target.dataset.k === 'num') draft.num = e.target.value; },
      keydown(e) {
        if (e.key === 'Enter' && e.target.dataset && e.target.dataset.k === 'clue') { e.preventDefault(); this.click('clue'); }
      },
      hotkey(e) {
        if (!V) return;
        if (e.key === 'Enter' && V.sel >= 0) { e.preventDefault(); this.click('reveal'); }
        else if (e.key === 'Escape' && V.sel >= 0) ctl.send({ k: 'sel', i: V.sel });
      },
      click(a, b) {
        if (!V) return;
        if (a === 'card') {
          const i = +b.dataset.i, bd = V.board[i];
          if (!bd || (V.duet ? (bd.f || bd.dead) : bd.c)) return;
          api.sfx('tap');
          if (V.sel === i) ctl.send({ k: 'rev', i }); else ctl.send({ k: 'sel', i });
        } else if (a === 'reveal') { if (V.sel >= 0) ctl.send({ k: 'rev', i: V.sel }); }
        else if (a === 'clue') {
          if (!draft.clue) { ctl.toast('Type a one word clue.'); return; }
          ctl.send({ k: 'clue', w: draft.clue, n: draft.num });
          draft.clue = '';
        }
        else if (a === 'team') ctl.send({ k: 'team', tm: b.dataset.t });
        else if (a === 'spy' || a === 'shuf' || a === 'start' || a === 'end') ctl.send({ k: a });
        else if (a === 'again') ctl.send({ k: 'again' });
        else if (a === 'lobby') ctl.lobby();
      }
    };
  }

  const cnCss = `
.gm-codenames{--bg1:#0b1522;--bg2:#1c3453;--panel:rgba(255,255,255,.07);--panel2:rgba(255,255,255,.12);--ink:#f4efe2;--mut:#aab4c6;--line:rgba(255,255,255,.14);--acc:#e9a93b;--acc-ink:#2a1a00;--r:#d6483b;--b:#3a78d8}
.gm-codenames .cn-menu h2{background:linear-gradient(90deg,#ff7a6b,#f4efe2,#6ea8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.gm-codenames .cn-stage{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;padding:12px}
.gm-codenames .cn-setup{grid-column:1/-1;display:flex;flex-direction:column;gap:12px;padding:6px 4px}
.gm-codenames .cn-setup h3{margin:0;font:900 26px var(--sans)}
.gm-codenames .cn-hint{margin:0;font:700 13px/1.4 var(--sans);color:var(--mut)}
.gm-codenames .cn-hint.warn{color:#ffb04a}
.gm-codenames .cn-teams{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.gm-codenames .cn-team{border-radius:16px;padding:10px;display:flex;flex-direction:column;gap:7px;min-height:150px;border:2px solid var(--line)}
.gm-codenames .cn-team.r{background:linear-gradient(rgba(214,72,59,.3),rgba(214,72,59,.1));border-color:rgba(214,72,59,.6)}
.gm-codenames .cn-team.b{background:linear-gradient(rgba(58,120,216,.3),rgba(58,120,216,.1));border-color:rgba(58,120,216,.6)}
.gm-codenames .cn-team .th{display:flex;justify-content:space-between;align-items:center;font:900 16px var(--sans)}
.gm-codenames .cn-seat{display:flex;align-items:center;gap:8px;padding:5px 7px;border-radius:11px;background:rgba(0,0,0,.22);font:800 14px var(--sans)}
.gm-codenames .cn-seat.you{box-shadow:inset 0 0 0 2px var(--acc)}
.gm-codenames .cn-seat.dim{opacity:.6}
.gm-codenames .cn-seat .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-codenames .cn-setrow{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.gm-codenames .cn-play{display:flex;flex-direction:column;gap:10px;min-width:0}
.gm-codenames .cn-hud{display:grid;grid-template-columns:78px 1fr 78px;gap:10px;align-items:stretch}
.gm-codenames .cn-tile{border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;background:var(--panel);border:2px solid transparent;text-align:center}
.gm-codenames .cn-tile b{font:900 34px/1 var(--sans)}
.gm-codenames .cn-tile small{font:800 10px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.8)}
.gm-codenames .cn-tile.r{background:linear-gradient(#e0574a,#a82c22)}
.gm-codenames .cn-tile.b{background:linear-gradient(#4f8fe6,#2556a8)}
.gm-codenames .cn-tile.g{background:linear-gradient(#3fb36a,#1f7a44)}
.gm-codenames .cn-tile.t{background:linear-gradient(#e9a93b,#b4761a);color:#2a1a00}
.gm-codenames .cn-tile.t small{color:rgba(40,20,0,.8)}
.gm-codenames .cn-tile.on{border-color:#fff;box-shadow:0 0 18px rgba(255,255,255,.35)}
.gm-codenames .cn-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:0;text-align:center}
.gm-codenames .cn-clue{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;justify-content:center;padding:6px 14px;border-radius:14px;background:var(--panel2);animation:cn-in .35s cubic-bezier(.2,1.4,.4,1)}
.gm-codenames .cn-clue small{font:900 10px var(--sans);letter-spacing:.12em;color:var(--mut)}
.gm-codenames .cn-clue b{font:900 clamp(22px,4vw,34px)/1 var(--sans);letter-spacing:.04em}
.gm-codenames .cn-clue em{font:900 clamp(20px,3.4vw,28px) var(--sans);font-style:normal;color:var(--acc)}
.gm-codenames .cn-clue.r{box-shadow:inset 0 0 0 2px var(--r)}
.gm-codenames .cn-clue.b{box-shadow:inset 0 0 0 2px var(--b)}
.gm-codenames .cn-clue.empty{font:800 15px var(--sans);color:var(--mut);animation:none}
.gm-codenames .cn-turn{font:800 13px var(--sans);color:var(--mut)}
@keyframes cn-in{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
.gm-codenames .cn-board{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(4px,.9vw,9px)}
.gm-codenames .cn-board.shake{animation:cn-shake .6s}
@keyframes cn-shake{10%,90%{transform:translateX(-3px)}20%,80%{transform:translateX(5px)}30%,50%,70%{transform:translateX(-7px)}40%,60%{transform:translateX(7px)}}
.gm-codenames .cn-c{position:relative;perspective:900px;aspect-ratio:1.52;cursor:pointer}
.gm-codenames .cn-c .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,1.35,.5,1)}
.gm-codenames .cn-board.noanim .in{transition:none}
.gm-codenames .cn-c.cov .in{transform:rotateY(180deg)}
.gm-codenames .cn-c .f,.gm-codenames .cn-c .b{position:absolute;inset:0;border-radius:9px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center;overflow:hidden}
.gm-codenames .cn-c .f{background:linear-gradient(#f6edd6,#e0d1ab);color:#2a2418;box-shadow:0 3px 0 #9d8f6c,0 7px 10px rgba(0,0,0,.4)}
.gm-codenames .cn-c .f::after{content:"";position:absolute;left:8%;right:8%;bottom:14%;height:2px;background:rgba(60,45,20,.22)}
.gm-codenames .cn-c .w{font:900 clamp(8.5px,1.85vw,17px)/1 var(--sans);letter-spacing:.04em;text-align:center;padding:0 3px;transform:translateY(-2px)}
.gm-codenames .cn-c .w.l{font-size:clamp(7px,1.45vw,13.5px)}
.gm-codenames .cn-c .b{transform:rotateY(180deg);box-shadow:0 3px 0 rgba(0,0,0,.35),0 7px 10px rgba(0,0,0,.4)}
.gm-codenames .cn-c .b svg{width:56%;height:78%;filter:drop-shadow(0 2px 0 rgba(0,0,0,.25))}
.gm-codenames .cn-c.r .b{background:linear-gradient(#e0574a,#a82c22)}
.gm-codenames .cn-c.b .b{background:linear-gradient(#4f8fe6,#2556a8)}
.gm-codenames .cn-c.g .b{background:linear-gradient(#45bb74,#1f7a44)}
.gm-codenames .cn-c.n .b{background:linear-gradient(#d9c9a2,#b8a67b)}
.gm-codenames .cn-c.a .b{background:linear-gradient(#2c2c35,#0d0d12)}
.gm-codenames .cn-c.a.cov .b{animation:cn-glow 1.2s infinite alternate}
@keyframes cn-glow{to{box-shadow:0 0 22px 4px rgba(255,60,50,.65)}}
.gm-codenames .cn-c.kr .f{box-shadow:inset 0 0 0 4px var(--r),0 3px 0 #9d8f6c,0 7px 10px rgba(0,0,0,.4);background:linear-gradient(#f9dcd4,#e9b8ac)}
.gm-codenames .cn-c.kb .f{box-shadow:inset 0 0 0 4px var(--b),0 3px 0 #9d8f6c,0 7px 10px rgba(0,0,0,.4);background:linear-gradient(#d9e6fa,#adc6ee)}
.gm-codenames .cn-c.kg .f{box-shadow:inset 0 0 0 4px #2f9e5b,0 3px 0 #9d8f6c,0 7px 10px rgba(0,0,0,.4);background:linear-gradient(#d6f3df,#a5dbb8)}
.gm-codenames .cn-c.ka .f{box-shadow:inset 0 0 0 4px #14141a,0 3px 0 #9d8f6c,0 7px 10px rgba(0,0,0,.4);background:linear-gradient(#b8b4aa,#8d887c)}
.gm-codenames .cn-c.ka .f::before{content:"";position:absolute;top:6px;right:7px;width:10px;height:10px;border-radius:50%;background:#14141a}
.gm-codenames .cn-c.kn .f{background:linear-gradient(#efe4c8,#d9c9a0)}
.gm-codenames .cn-c.half .f::before{content:"";position:absolute;top:0;left:0;right:0;height:7px;background:repeating-linear-gradient(45deg,#c9b68a 0 6px,#a8946a 6px 12px)}
.gm-codenames .cn-c.sel .f{outline:3px solid var(--acc);outline-offset:-3px}
.gm-codenames .cn-c:not(.cov):hover .f{filter:brightness(1.05)}
.gm-codenames .cn-c .mk{position:absolute;left:4px;bottom:4px;display:flex;gap:2px;z-index:2}
.gm-codenames .cn-c .mk i{width:16px;height:16px;border-radius:50%;background:var(--acc);color:#2a1a00;font:900 10px/16px var(--sans);text-align:center;font-style:normal;box-shadow:0 1px 3px rgba(0,0,0,.4)}
.gm-codenames .cn-board.over .cn-c:not(.cov){opacity:.85}
.gm-codenames .cn-act{min-height:48px}
.gm-codenames .cn-form{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center}
.gm-codenames .cn-form .cn-in{flex:1;min-width:130px;text-transform:uppercase}
.gm-codenames .cn-form select.cn-in{flex:0 0 76px;min-width:76px}
.gm-codenames .cn-sel{font:800 14px var(--sans);color:var(--mut);padding:0 8px}
.gm-codenames .cn-sel b{color:var(--ink)}
.gm-codenames .cn-side{display:flex;flex-direction:column;gap:9px;min-width:0}
.gm-codenames .cn-roster{display:grid;gap:6px}
.gm-codenames .rt{border-radius:12px;padding:6px 9px;background:var(--panel);font:700 12.5px var(--sans);display:flex;flex-direction:column;gap:2px}
.gm-codenames .rt b{font:900 12px var(--sans);letter-spacing:.06em;text-transform:uppercase}
.gm-codenames .rt.r b{color:#ff8e82}
.gm-codenames .rt.b b{color:#8db9ff}
.gm-codenames .rs.you{color:var(--acc);font-weight:900}
.gm-codenames .rs em{font:900 9px var(--sans);font-style:normal;padding:1px 5px;margin-right:5px;border-radius:5px;background:var(--acc);color:#2a1a00}
.gm-codenames .cn-key{align-self:center;padding:8px;border-radius:10px;background:#d9ceb2;display:flex;flex-direction:column;align-items:center;gap:4px;color:#2a2418;border:4px solid transparent}
.gm-codenames .cn-key.r{border-color:var(--r)}
.gm-codenames .cn-key.b{border-color:var(--b)}
.gm-codenames .cn-key small{font:900 9px var(--sans);letter-spacing:.1em;text-transform:uppercase}
.gm-codenames .cn-key .kg{display:grid;grid-template-columns:repeat(5,13px);gap:2px}
.gm-codenames .cn-key i{width:13px;height:13px;border-radius:3px;background:#efe4c8}
.gm-codenames .cn-key i.r{background:var(--r)}
.gm-codenames .cn-key i.b{background:var(--b)}
.gm-codenames .cn-key i.a{background:#14141a}
.gm-codenames .cn-tokens{display:flex;gap:4px;justify-content:center}
.gm-codenames .cn-tokens i{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.12)}
.gm-codenames .cn-tokens i.on{background:var(--acc)}
.gm-codenames .cn-logt{font:900 11px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
.gm-codenames .cn-log{display:flex;flex-direction:column;gap:3px;font:600 12.5px/1.35 var(--sans);max-height:230px;overflow:auto}
.gm-codenames .lg{padding:3px 7px;border-radius:7px;background:var(--panel)}
.gm-codenames .lg.r{border-left:3px solid var(--r)}
.gm-codenames .lg.b{border-left:3px solid var(--b)}
.gm-codenames .lg.a{border-left:3px solid #fff;background:rgba(0,0,0,.5)}
.gm-codenames .lg.g{border-left:3px solid #3fb36a}
.gm-codenames .lg.dim{opacity:.55}
.gm-codenames .cn-over{display:flex;flex-direction:column;gap:5px;padding:10px;border-radius:14px;text-align:center;animation:cn-in .5s cubic-bezier(.2,1.4,.4,1)}
.gm-codenames .cn-over.r{background:linear-gradient(#e0574a,#a82c22)}
.gm-codenames .cn-over.b{background:linear-gradient(#4f8fe6,#2556a8)}
.gm-codenames .cn-over b{font:900 20px/1.1 var(--sans)}
.gm-codenames .cn-over span{font:700 13px var(--sans)}
.gm-codenames .cn-over .sc{font-weight:900}
.gm-codenames .cn-orow{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
@media (max-width:760px){
.gm-codenames .cn-stage{grid-template-columns:minmax(0,1fr);padding:8px}
.gm-codenames .cn-hud{grid-template-columns:58px 1fr 58px}
.gm-codenames .cn-tile b{font-size:26px}
.gm-codenames .cn-teams{grid-template-columns:1fr}
.gm-codenames .cn-side{flex-direction:row;flex-wrap:wrap}
.gm-codenames .cn-log{max-height:140px;width:100%}
.gm-codenames .cn-roster{grid-template-columns:1fr 1fr;width:100%}
.gm-codenames .cn-c{aspect-ratio:1.2}
}
`;

  Ameplay.register({
    id: 'codenames',
    title: 'Codenames',
    category: 'Board',
    tint: '#1f4a7a',
    blurb: 'Spymasters give one-word clues, operatives find their agents. Avoid the assassin. Classic teams or 2-player Duet.',
    help: 'Tap a card to select, tap again or <kbd>Enter</kbd> to reveal · spymasters type a clue and a number · online 4 to 10, Duet for 2 · bots fill empty seats',
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    width: 1040,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="48" height="40" rx="5"/><path d="M8 24h48M8 38h48M24 12v40M40 12v40" opacity=".5"/><circle cx="32" cy="31" r="7" fill="currentColor"/><path d="M26 42c1-4 11-4 12 0"/></svg>',
    css: baseCss('codenames', 'cn') + waitCss('codenames', 'cn') + cnCss,
    mount(root, api) {
      return runTable(root, api, {
        p: 'cn', defaults: { mode: 'classic', size: 4 }, pmin: 2, pmax: 10, pdef: 4, max: 16,
        how: CN_HOW, menu: cnMenu, acts: cnActs, ui: cnUi, create: cnCreate,
        room: o => o.mode === 'duet' ? { title: 'Codenames Duet', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: true } : { title: 'Codenames', sizes: [4, 5, 6, 7, 8, 9, 10], defaultSize: 6, min: 4, max: 10, bots: true }
      });
    }
  });
  const SF_RAW = `
Airplane|air|Pilot,Co-pilot,Flight attendant,Air marshal,Economy passenger,First class passenger,Mechanic,Nervous flyer|seat,wing,landing,turbulence,cabin,altitude,takeoff,pilot,boarding
Airport|air|Check-in agent,Security officer,Customs officer,Baggage handler,Air traffic controller,Pilot,Duty-free clerk,Stranded traveler|gate,terminal,luggage,passport,runway,flight,security,delay,boarding
Amusement Park|fun|Ride operator,Mascot,Ticket seller,Thrill seeker,Parent,Face painter,Food vendor,Lost kid|ride,roller,coaster,ticket,queue,cotton,candy,ferris,wheel,mascot
Bakery|food|Head baker,Cashier,Apprentice,Delivery driver,Pastry chef,Regular customer,Food critic,Early shopper|bread,flour,oven,dough,croissant,cake,pastry,sugar,fresh
Bank|money|Teller,Manager,Security guard,Customer,Robber,Loan officer,Armored car driver,Auditor|vault,money,teller,loan,account,cash,safe,deposit,counter
Beach|nature|Lifeguard,Surfer,Sunbather,Ice cream seller,Photographer,Child with bucket,Beach volleyball player,Tourist|sand,wave,sun,towel,sea,surf,shell,sunscreen,umbrella
Casino|fun|Dealer,Gambler,Bouncer,Pit boss,Waitress,High roller,Card counter,Security officer|chips,dice,poker,slot,roulette,bet,jackpot,cards,table
Cathedral|build|Priest,Organist,Choir singer,Tourist,Pilgrim,Bell ringer,Candle seller,Groom|organ,bell,pray,altar,candle,mass,window,choir,stone,wedding
Circus Tent|fun|Ringmaster,Clown,Acrobat,Lion tamer,Juggler,Strongman,Popcorn seller,Magician|clown,trapeze,tent,lion,juggle,tightrope,popcorn,ring,act,acrobat
Construction Site|land|Foreman,Crane operator,Bricklayer,Electrician,Architect,Safety inspector,Welder,Delivery driver|crane,helmet,cement,brick,scaffold,hammer,drill,bulldozer,building
Cruise Ship|sea|Captain,Bartender,Cabin steward,Passenger,Entertainer,Chef,Lifeguard,Photographer|deck,cabin,buffet,pool,port,ocean,sail,anchor,voyage
Day Spa|nature|Masseuse,Receptionist,Manicurist,Client,Yoga teacher,Facial specialist,Sauna attendant,Owner|massage,towel,robe,sauna,relax,oil,facial,steam,candle,pool
Embassy|build|Ambassador,Diplomat,Security guard,Visa officer,Tourist,Translator,Secretary,Refugee|visa,passport,flag,ambassador,diplomat,treaty,country,passport,immunity
Farm|nature|Farmer,Shepherd,Veterinarian,Tractor driver,Milkmaid,Visiting child,Beekeeper,Fruit picker|barn,tractor,cow,hay,field,chicken,milk,corn,pig,harvest
Fire Station|mil|Fire chief,Firefighter,Dispatcher,Paramedic,Rookie,Dalmatian owner,Cook,Mechanic|siren,hose,ladder,truck,alarm,helmet,pole,flame,rescue,hydrant
Hospital|med|Surgeon,Nurse,Patient,Anesthetist,Visitor,Receptionist,Paramedic,Pharmacist|surgery,ward,bed,doctor,nurse,emergency,bandage,ambulance,scalpel,medicine
Hotel|build|Receptionist,Bellhop,Maid,Manager,Guest,Concierge,Chef,Night guard|room,lobby,key,reception,suite,luggage,bed,elevator,checkout,minibar
Library|school|Librarian,Student,Author,Researcher,Reading child,Night janitor,Book thief,Volunteer|book,shelf,quiet,reading,card,study,novel,borrow,silence,page
Lighthouse|sea|Keeper,Painter,Tourist,Coast guard,Ship captain,Radio operator,Fisherman,Historian|light,tower,coast,rocks,beam,storm,ships,stairs,wave,harbor
Military Base|mil|Colonel,Private,Sergeant,Medic,Pilot,Cook,Spy,Radio operator|soldier,tank,uniform,barracks,rank,salute,gate,drill,march,gun
Movie Studio|fun|Director,Actor,Stuntman,Camera operator,Costume designer,Makeup artist,Producer,Extra|camera,scene,script,action,costume,set,film,lights,cut,actor
Museum|school|Curator,Guard,Tour guide,Tourist,Art student,Restorer,Thief,Child on a school trip|painting,statue,exhibit,ancient,guide,gallery,dinosaur,ticket,glass,history
Ocean Liner|sea|Captain,Radio officer,Stoker,Waiter,First class passenger,Third class passenger,Musician,Stowaway|hull,funnel,lifeboat,iceberg,deck,ocean,steam,voyage,cargo,anchor
Passenger Train|land|Conductor,Driver,Ticket inspector,Commuter,Tourist,Dining car cook,Pickpocket,Student|rail,station,ticket,platform,carriage,tunnel,whistle,track,commuter,wagon
Pirate Ship|sea|Captain,Cook,Cabin boy,Navigator,Gunner,Prisoner,Parrot keeper,Lookout|treasure,plank,cannon,flag,rum,sword,map,sail,island,parrot
Police Station|mil|Detective,Chief,Desk officer,Suspect,Lawyer,Witness,Cadet,Forensic analyst|badge,cell,arrest,crime,handcuffs,report,interrogation,siren,evidence,detective
Polar Station|nature|Climatologist,Doctor,Radio operator,Cook,Mechanic,Geologist,Visiting journalist,Dog handler|ice,snow,cold,research,penguin,sled,glacier,blizzard,heater,expedition
Restaurant|food|Chef,Waiter,Host,Dishwasher,Food critic,Customer,Sommelier,Manager|menu,table,order,tip,kitchen,bill,dinner,plate,reservation,dessert
School|school|Teacher,Principal,Student,Janitor,Cafeteria cook,Gym coach,Substitute,Parent|class,homework,bell,desk,blackboard,exam,recess,lesson,grade,playground
Service Station|land|Attendant,Mechanic,Trucker,Cashier,Family on a trip,Tourist,Biker,Police officer|fuel,pump,tire,oil,petrol,truck,snacks,highway,wash,garage
Ski Resort|nature|Instructor,Snowboarder,Lift operator,Ski patrol,Beginner,Cafe owner,Photographer,Tourist|snow,lift,slope,ski,helmet,boots,chalet,mountain,avalanche,cold
Space Station|space|Commander,Engineer,Scientist,Astronaut,Doctor,Cosmonaut,Tourist,Mission controller|orbit,gravity,rocket,module,earth,float,airlock,dock,spacesuit,experiment
Submarine|sea|Captain,Sonar operator,Cook,Engineer,Torpedo officer,Navigator,Medic,Radio operator|dive,periscope,depth,torpedo,sonar,hatch,ocean,pressure,crew,silent
Supermarket|shop|Cashier,Stocker,Manager,Butcher,Customer,Security guard,Bagger,Delivery driver|aisle,cart,shelf,checkout,fruit,discount,freezer,receipt,basket,groceries
Theater|fun|Actor,Director,Prompter,Stagehand,Costume designer,Critic,Usher,Spectator|stage,curtain,audience,rehearsal,seat,script,applause,play,drama,lights
University|school|Professor,Student,Dean,Librarian,Researcher,Janitor,Teaching assistant,Visiting speaker|lecture,campus,degree,exam,thesis,dorm,professor,research,diploma,classroom
Zoo|nature|Keeper,Veterinarian,Tourist,Tour guide,Child,Photographer,Souvenir seller,Escaped monkey enthusiast|cage,lion,monkey,feed,elephant,animals,ticket,tiger,giraffe,enclosure
`;
  const SF_ICONS = {
    air: '<path d="M4 30l22-4L40 8l4 2-8 18 14 2 8-6 3 2-6 10 6 10-3 2-8-6-14 2 8 18-4 2-14-18-22-4z" transform="scale(.8) translate(2 4)"/>',
    sea: '<path d="M6 36h52l-8 14H14z"/><path d="M30 8v26M30 10l16 22H30z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M4 54q7-6 14 0t14 0 14 0 14 0" fill="none" stroke="currentColor" stroke-width="3"/>',
    land: '<rect x="6" y="22" width="40" height="22" rx="4"/><rect x="46" y="30" width="12" height="14" rx="3"/><circle cx="16" cy="46" r="6"/><circle cx="46" cy="46" r="6"/>',
    build: '<path d="M6 54V26l12-8v36zM20 54V12l14-6 12 6v42zM48 54V28l10 6v20z"/><path d="M26 22h4M36 22h4M26 32h4M36 32h4M26 42h4M36 42h4" stroke="#fff" stroke-width="3" opacity=".6"/>',
    nature: '<path d="M32 6c14 8 18 20 10 30-3 4-6 5-10 6-4-1-7-2-10-6C14 26 18 14 32 6z"/><path d="M32 40v18" stroke="currentColor" stroke-width="4"/>',
    fun: '<path d="M6 30L32 8l26 22z"/><path d="M12 30h40v24H12z" opacity=".8"/><path d="M28 54V40h8v14" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>',
    food: '<path d="M10 28h44c0 14-9 22-22 22S10 42 10 28z"/><path d="M22 20c0-5 4-4 4-9M32 20c0-5 4-4 4-9M42 20c0-5 4-4 4-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    med: '<rect x="8" y="8" width="48" height="48" rx="10"/><path d="M32 18v28M18 32h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/>',
    mil: '<path d="M32 4l22 8v18c0 14-9 24-22 30C19 54 10 44 10 30V12z"/><path d="M32 18l4 9 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#fff" opacity=".75"/>',
    school: '<path d="M32 8L4 22l28 14 28-14z"/><path d="M14 30v14c0 6 8 10 18 10s18-4 18-10V30l-18 9z" opacity=".8"/>',
    space: '<path d="M32 4c10 6 14 18 12 30l-6 6H26l-6-6C18 22 22 10 32 4z"/><circle cx="32" cy="24" r="5" fill="#fff" opacity=".8"/><path d="M20 38l-8 10 10-2zM44 38l8 10-10-2zM28 44h8l-4 12z" opacity=".85"/>',
    shop: '<path d="M8 20h48l-4 30H12z"/><path d="M22 20c0-8 4-12 10-12s10 4 10 12" fill="none" stroke="currentColor" stroke-width="4"/>',
    money: '<circle cx="32" cy="32" r="24"/><path d="M32 16v32M24 24h12a5 5 0 010 10H28a5 5 0 000 10h12" fill="none" stroke="#fff" stroke-width="4" opacity=".8" stroke-linecap="round"/>'
  };
  const SF_LOCS = SF_RAW.trim().split('\n').map(l => {
    const p = l.split('|');
    return { n: p[0], ic: p[1], r: p[2].split(','), kw: [...new Set(p[3].split(','))] };
  });
  const SF_HUE = { air: 205, sea: 195, land: 28, build: 265, nature: 140, fun: 330, food: 18, med: 350, mil: 215, school: 45, space: 250, shop: 160, money: 52 };
  const SF_QS = ['What do you usually do here in the morning?', 'Would you bring a child to this place?', 'What is the most annoying thing about it?', 'Do you need to dress up for it?', 'Is it better at night or during the day?', 'What kind of noise do you hear most?', 'How much does a visit cost?', 'Would you come here on your own?', 'What do you smell first when you arrive?', 'Who do you meet most often here?', 'What is the weather like for you right now?', 'What would you do if the lights went out?', 'Is it more of a job or a hobby for you?', 'What do you carry with you here?', 'Is it crowded where you are?', 'What happens if you are late?'];
  const SF_ANS_OK = ['Honestly, it is exactly what you would expect. Lots of {k} around.', 'I mostly think about the {k}, to be fair.', 'It depends on the day, but the {k} never goes away.', 'As a {r}, I would say the {k} matters most.', 'Everyone knows about the {k} here.', 'Pretty typical for a {r}. The {k} again.', 'Yes, as you would expect around here.', 'Not really, only when it gets busy.', 'It depends who you ask, but mostly yes.', 'Pretty often, honestly.'];
  const SF_ANS_SPY = ['Hard to say, it depends.', 'Same as for most people, I suppose.', 'Hmm, it varies a lot.', 'I would rather not say much about that.', 'Normal, nothing special.', 'It is a bit like you described.', 'Sometimes yes, sometimes no.', 'Pretty usual, really.'];

  function sfCreate(seats, opt) {
    const lead = i => i === 0 || (opt.leader && opt.leader() && opt.leader() === seats[i].id);
    const n = seats.length;
    const s = {
      phase: 'play', round: 0, rounds: clamp(+opt.rounds || 5, 1, 20), mins: clamp(+opt.mins || 8, 3, 15), scores: Array(n).fill(0), log: [], bag: [], loc: 0, spy: 0, roles: [], turn: null,
      rt: 0, dl: 0, tdl: 0, vote: null, result: null, acc: [], at: 0, sus: [], tally: SF_LOCS.map(() => 0), errs: {}, eid: 0, acted: 0, spyHist: [], final: null, fillQ: 0
    };
    const E = {
      seats, s,
      shift(ms) { if (s.dl) s.dl += ms; if (s.tdl) s.tdl += ms; if (s.at) s.at += ms; if (s.vote) s.vote.dl += ms; if (s.final) s.final.dl += ms; },
      botify(i) {
        seats[i].bot = true; seats[i].name = seats[i].name + ' (bot)'; s.at = Date.now() + 800;
        if (s.vote && s.vote.to !== i && s.vote.ballots[i] === undefined) s.vote.ballots[i] = null;
      }
    };
    const fail = (i, m) => { s.errs[i] = { m, id: ++s.eid }; return true; };
    const now = () => Date.now();
    const sched = (a, b) => { s.at = now() + a + rnd(b || 1); };

    function newRound() {
      s.round++;
      if (!s.bag.length) s.bag = shuf([...Array(n).keys()]);
      s.spy = s.bag.pop();
      s.loc = rnd(SF_LOCS.length);
      const roles = shuf(SF_LOCS[s.loc].r.slice());
      s.roles = seats.map((x, i) => (i === s.spy ? null : roles.pop()));
      s.log = []; s.vote = null; s.final = null; s.result = null; s.acc = Array(n).fill(0); s.sus = Array(n).fill(0); s.tally = SF_LOCS.map(() => 0);
      const first = rnd(n);
      s.turn = { by: first, to: -1, prev: -1, stage: 'ask', q: '' };
      s.rt = s.mins * 60000; s.dl = now() + s.rt; s.tdl = now() + 75000;
      s.phase = 'play';
      sched(3500, 3000);
    }
    newRound();

    function kwHits(text) {
      const w = words(text);
      return SF_LOCS.map(l => l.kw.reduce((c, k) => c + (w.includes(k) ? 1 : 0), 0));
    }
    function addText(by, text, isAnswer) {
      const h = kwHits(text);
      h.forEach((c, i) => { s.tally[i] += c; });
      if (isAnswer && by !== s.spy) {
        if (text.charAt(0) === '(') return;
        if (h[s.loc] === 0) s.sus[by] += 1; else s.sus[by] = Math.max(0, s.sus[by] - .5);
      } else if (isAnswer && by === s.spy) {
        if (text.charAt(0) !== '(' && h[s.loc] === 0) s.sus[by] += 1;
      }
    }
    function endRound(winner, how, extra) {
      const pts = Array(n).fill(0);
      let bonus = -1;
      if (winner === 'spy') pts[s.spy] = how === 'time' ? 2 : 4;
      else {
        for (let i = 0; i < n; i++) if (i !== s.spy) pts[i] = 1;
        if (extra && extra.accuser >= 0 && extra.accuser !== s.spy) { pts[extra.accuser] += 1; bonus = extra.accuser; }
      }
      pts.forEach((p, i) => { s.scores[i] += p; });
      s.result = Object.assign({ winner, how, pts, bonus }, extra || {});
      s.phase = 'over'; s.vote = null; s.final = null; s.at = 0;
    }
    function resolveVote() {
      const v = s.vote;
      const voters = seats.map((x, i) => i).filter(i => i !== v.to);
      const yes = voters.every(i => v.ballots[i] === true);
      s.log.push({ k: 'vres', by: v.by, to: v.to, ok: yes, ballots: Object.assign({}, v.ballots) });
      const pausedLeft = v.pausedLeft;
      s.vote = null;
      if (yes) {
        if (v.to === s.spy) endRound('town', 'accuse', { accuser: v.by, accused: v.to });
        else endRound('spy', 'accuse', { accuser: v.by, accused: v.to });
        return;
      }
      s.phase = 'play'; s.dl = now() + pausedLeft; s.tdl = now() + 45000; sched(2500, 2500);
    }
    function maybeFinishVote() {
      const v = s.vote;
      const voters = seats.map((x, i) => i).filter(i => i !== v.to);
      if (voters.every(i => v.ballots[i] !== undefined)) resolveVote();
    }
    function resolveFinal() {
      const f = s.final, c = Array(n).fill(0);
      Object.keys(f.ballots).forEach(k => { const t = f.ballots[k]; if (t >= 0) c[t]++; });
      const mx = Math.max(...c), top = c.map((x, i) => ({ x, i })).filter(o => o.x === mx && mx > 0);
      s.log.push({ k: 'fres', counts: c });
      if (top.length === 1 && top[0].i === s.spy) endRound('town', 'time', { accused: s.spy, accuser: -1, counts: c });
      else endRound('spy', 'time', { accused: top.length === 1 ? top[0].i : -1, counts: c });
    }
    function startFinal() {
      s.phase = 'final'; s.final = { ballots: {}, dl: now() + 50000 }; s.at = now() + 2500;
      s.log.push({ k: 'time' });
    }
    function advanceTurn(to, byWho) {
      s.turn = { by: to, to: -1, prev: byWho, stage: 'ask', q: '' };
      s.tdl = now() + 75000; sched(2500, 3500);
    }

    E.act = function (i, a, priv) {
      if (!a || typeof a.k !== 'string') return false;
      if (s.phase === 'over') {
        if (a.k === 'next' && priv) {
          if (s.round >= s.rounds) { s.phase = 'series'; return true; }
          newRound(); return true;
        }
        return false;
      }
      if (s.phase === 'series') {
        if (a.k === 'restart' && priv) { s.scores = Array(n).fill(0); s.round = 0; s.bag = []; newRound(); return true; }
        return false;
      }
      if (s.phase === 'play') {
        const T = s.turn;
        if (a.k === 'ask' && T.stage === 'ask' && T.by === i) {
          const to = a.to;
          if (!Number.isInteger(to) || to < 0 || to >= n || to === i) return fail(i, 'Pick another player to question.');
          if (to === T.prev && n > 2) return fail(i, 'No return questions: pick someone else.');
          const q = String(a.q || '').trim().slice(0, 160) || '(asked aloud)';
          T.to = to; T.q = q; T.stage = 'answer'; s.tdl = now() + 75000;
          addText(i, q, false);
          s.log.push({ k: 'q', by: i, to, q });
          sched(2000, 3000);
          return true;
        }
        if (a.k === 'answer' && T.stage === 'answer' && T.to === i) {
          const t = String(a.a || '').trim().slice(0, 160) || '(answered aloud)';
          addText(i, t, true);
          s.log.push({ k: 'a', by: i, text: t });
          advanceTurn(i, T.by);
          return true;
        }
        if (a.k === 'accuse') {
          const to = a.to;
          if (!Number.isInteger(to) || to < 0 || to >= n || to === i) return false;
          if (s.acc[i]) return fail(i, 'You already accused someone this round.');
          s.acc[i] = 1;
          const pausedLeft = Math.max(1000, s.dl - now());
          s.vote = { by: i, to, ballots: { [i]: true }, dl: now() + 40000, pausedLeft };
          s.phase = 'vote';
          s.log.push({ k: 'acc', by: i, to });
          s.at = now() + 1800;
          maybeFinishVote();
          return true;
        }
        if (a.k === 'guess' && i === s.spy) {
          const l = a.loc;
          if (!Number.isInteger(l) || l < 0 || l >= SF_LOCS.length) return false;
          s.log.push({ k: 'sg', by: i, loc: l });
          if (l === s.loc) endRound('spy', 'guess', { guess: l });
          else endRound('town', 'badguess', { guess: l, accuser: -1 });
          return true;
        }
        return false;
      }
      if (s.phase === 'vote') {
        const v = s.vote;
        if (a.k === 'vote' && i !== v.to && v.ballots[i] === undefined) {
          v.ballots[i] = !!a.yes;
          if (!a.yes) { resolveVote(); return true; }
          maybeFinishVote();
          return true;
        }
        return false;
      }
      if (s.phase === 'final') {
        if (a.k === 'fvote' && Number.isInteger(a.to) && a.to >= 0 && a.to < n && a.to !== i && s.final.ballots[i] === undefined) {
          s.final.ballots[i] = a.to;
          if (Object.keys(s.final.ballots).length >= n) resolveFinal();
          return true;
        }
        return false;
      }
      return false;
    };

    function botAnswer(b) {
      const l = SF_LOCS[s.loc];
      if (b === s.spy) {
        const heard = [];
        s.log.forEach(e => { if (e.k === 'a' || e.k === 'q') heard.push(...words(e.text || e.q)); });
        const cands = SF_LOCS.map((x, i) => ({ i, c: s.tally[i] })).sort((p, q) => q.c - p.c);
        const kws = cands[0] && cands[0].c > 0 ? SF_LOCS[cands[0].i].kw.filter(k => heard.includes(k)) : [];
        if (kws.length && Math.random() < .55) return `Well, ${pick(kws)} is part of it, I would say.`;
        return pick(SF_ANS_SPY);
      }
      return pick(SF_ANS_OK).replace('{k}', pick(l.kw)).replace('{r}', s.roles[b].toLowerCase());
    }
    function botGuess() {
      const c = SF_LOCS.map((x, i) => ({ i, c: s.tally[i] })).sort((p, q) => q.c - p.c);
      return c[0].c > 0 ? { i: c[0].i, c: c[0].c, m: c[0].c - c[1].c } : null;
    }
    function botSuspect(b) {
      const cands = seats.map((x, i) => ({ i, v: s.sus[i] + Math.random() * .6 })).filter(o => o.i !== b).sort((p, q) => q.v - p.v);
      return cands[0];
    }

    E.tick = function (t) {
      if (s.phase === 'over' || s.phase === 'series') return false;
      if (s.phase === 'play') {
        if (t >= s.dl) { startFinal(); return true; }
        const T = s.turn;
        if (t >= s.tdl && !seats[T.stage === 'ask' ? T.by : T.to].bot) {
          if (T.stage === 'ask') {
            const who = T.by;
            s.log.push({ k: 'skip', by: who });
            const opts = seats.map((x, i) => i).filter(i => i !== who && i !== T.prev);
            advanceTurn((opts.length ? pick(opts) : (who + 1) % n), who);
          } else {
            s.log.push({ k: 'a', by: T.to, text: '(no answer)' });
            advanceTurn(T.to, T.by);
          }
          return true;
        }
        if (t < s.at) return false;
        if (s.spy >= 0 && seats[s.spy].bot) {
          const g = botGuess();
          const left = s.dl - t;
          if (g && ((g.c >= 4 && g.m >= 2 && s.log.filter(e => e.k === 'a').length >= n + 2 && Math.random() < .05) || (left < 40000 && g.c >= 1))) {
            s.log.push({ k: 'sg', by: s.spy, loc: g.i });
            if (g.i === s.loc) endRound('spy', 'guess', { guess: g.i }); else endRound('town', 'badguess', { guess: g.i, accuser: -1 });
            return true;
          }
        }
        const bots = seats.map((x, i) => i).filter(i => seats[i].bot && i !== s.spy);
        if (bots.length && s.log.filter(e => e.k === 'a').length >= 6 && Math.random() < .045) {
          const b = pick(bots);
          if (!s.acc[b]) {
            const sus = botSuspect(b);
            if (sus && sus.i !== b && s.sus[sus.i] >= 2) {
              s.acc[b] = 1;
              const pausedLeft = Math.max(1000, s.dl - t);
              s.vote = { by: b, to: sus.i, ballots: { [b]: true }, dl: t + 40000, pausedLeft };
              s.phase = 'vote'; s.log.push({ k: 'acc', by: b, to: sus.i }); s.at = t + 1800;
              return true;
            }
          }
        }
        if (T.stage === 'ask' && seats[T.by].bot) {
          const opts = seats.map((x, i) => i).filter(i => i !== T.by && (i !== T.prev || n <= 2));
          const to = pick(opts);
          const q = pick(SF_QS);
          T.to = to; T.q = q; T.stage = 'answer'; s.tdl = t + 75000;
          addText(T.by, q, false);
          s.log.push({ k: 'q', by: T.by, to, q });
          sched(2200, 3000);
          return true;
        }
        if (T.stage === 'answer' && seats[T.to].bot) {
          const text = botAnswer(T.to);
          addText(T.to, text, true);
          s.log.push({ k: 'a', by: T.to, text });
          advanceTurn(T.to, T.by);
          return true;
        }
        return false;
      }
      if (s.phase === 'vote') {
        const v = s.vote;
        if (t >= v.dl) {
          seats.forEach((x, i) => { if (i !== v.to && v.ballots[i] === undefined) v.ballots[i] = false; });
          resolveVote();
          return true;
        }
        if (t < s.at) return false;
        const pend = seats.map((x, i) => i).filter(i => i !== v.to && v.ballots[i] === undefined && seats[i].bot);
        if (!pend.length) return false;
        const b = pend[0];
        let yes;
        if (b === s.spy) yes = v.to !== s.spy ? Math.random() < .5 : false;
        else {
          const mx = Math.max(...s.sus.filter((x, i) => i !== b));
          yes = s.sus[v.to] >= Math.max(1, mx - .01) && s.sus[v.to] >= 1 ? true : Math.random() < .12;
        }
        v.ballots[b] = yes;
        if (!yes) { resolveVote(); return true; }
        maybeFinishVote();
        s.at = t + 1200 + rnd(1500);
        return true;
      }
      if (s.phase === 'final') {
        const f = s.final;
        if (t >= f.dl) { resolveFinal(); return true; }
        if (t < s.at) return false;
        const pend = seats.map((x, i) => i).filter(i => seats[i].bot && f.ballots[i] === undefined);
        if (pend.length) {
          const b = pend[0];
          let to;
          if (b === s.spy) to = pick(seats.map((x, i) => i).filter(i => i !== b));
          else to = botSuspect(b).i;
          f.ballots[b] = to;
          s.at = t + 900 + rnd(1200);
          if (Object.keys(f.ballots).length >= n) resolveFinal();
          return true;
        }
        return false;
      }
      return false;
    };

    E.view = function (i) {
      const v = { g: 'sf', phase: s.phase, me: i, lead: lead(i), round: s.round, rounds: s.rounds, scores: s.scores, err: s.errs[i] || null, n };
      v.players = seats.map((x, j) => ({ n: x.name, bot: x.bot, you: j === i, acc: !!s.acc[j], lead: lead(j) }));
      v.isSpy = i === s.spy;
      if (!v.isSpy) { v.loc = s.loc; v.role = s.roles[i]; }
      v.turn = s.turn; v.log = s.log.slice(-60);
      v.locs = SF_LOCS.map(l => l.n);
      v.rt = Math.max(0, s.phase === 'play' ? s.dl - now() : s.vote ? s.vote.pausedLeft : s.phase === 'final' ? 0 : 0);
      if (s.phase === 'play') v.tl = Math.max(0, s.dl - now());
      if (s.phase === 'vote') { v.tl = Math.max(0, s.vote.dl - now()); v.vote = { by: s.vote.by, to: s.vote.to, ballots: s.vote.ballots, mine: s.vote.ballots[i] }; }
      if (s.phase === 'final') { v.tl = Math.max(0, s.final.dl - now()); v.fv = s.final.ballots[i] === undefined ? -1 : s.final.ballots[i]; v.fvoted = Object.keys(s.final.ballots).map(Number); }
      if (s.phase === 'over' || s.phase === 'series') {
        v.result = s.result; v.spy = s.spy; v.loc = s.loc; v.roles = s.roles; v.locName = SF_LOCS[s.loc].n;
        v.guessName = s.result && s.result.guess !== undefined ? SF_LOCS[s.result.guess].n : null;
      }
      return v;
    };
    return E;
  }
  const SF_HOW = `<p class="k">Spyfall</p><h3>How to play</h3>
<ul>
<li><b>Everyone except one player knows the secret location</b> and gets a role there. One player is the <b>spy</b> and knows nothing.</li>
<li>On your turn, <b>question another player</b> about the place. They answer, then it is their turn to question someone. No return questions: you cannot question the player who just questioned you.</li>
<li>Type your question and answer, or ask aloud and just press the button. Answers must be vague enough that the spy cannot work out the place, but clear enough that the others trust you.</li>
<li><b>Accuse</b> a player at any time (once per round). Everyone else must agree, so the vote is unanimous. If the accused is the spy, the group wins. If not, the spy wins.</li>
<li>The spy can <b>guess the location</b> at any time. Right: the spy wins. Wrong: the group wins.</li>
<li>If the timer runs out, everybody votes for the suspected spy. The spy wins unless the vote clearly lands on them.</li>
<li><b>Points:</b> spy wins 4 (2 if time ran out); group wins give each non-spy 1, plus 1 more to the player whose accusation was right.</li>
</ul>`;

  function sfMenu(o) {
    return `<h2>Spyfall</h2>
<p class="sub">One of you is the spy and does not know where you are. Ask clever questions, spot the liar, or bluff your way out.</p>
<div class="sf-card"><h4>3 to 8 players</h4>
<button class="sf-btn wide" data-a="online">Play online</button>
<button class="sf-btn alt wide" data-a="practice">Practice with bots</button>
<div class="sf-row"><span>Practice players (you + bots)</span><select class="sf-in" data-o="size">${[3, 4, 5, 6, 7, 8].map(n => `<option value="${n}"${(+o.size || 5) === n ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
<div class="sf-row"><span>Round length</span><select class="sf-in" data-o="mins">${[4, 6, 8, 10].map(n => `<option value="${n}"${(+o.mins || 8) === n ? ' selected' : ''}>${n} min</option>`).join('')}</select></div>
<div class="sf-row"><span>Rounds</span><select class="sf-in" data-o="rounds">${[1, 3, 5, 8].map(n => `<option value="${n}"${(+o.rounds || 5) === n ? ' selected' : ''}>${n}</option>`).join('')}</select></div></div>
<button class="sf-btn alt sm" data-a="how">How to play</button>`;
  }

  function sfUi(el, ctl) {
    const api = ctl.api;
    el.innerHTML = `<div class="sf-top"><span class="sf-chip on">SPYFALL</span><span class="sf-chip sf-rd"></span><span class="grow"></span><span class="sf-tm" data-tm>--</span><span class="grow"></span><span class="sf-net"><i></i><span>Practice</span></span><button class="sf-btn alt sm" data-a="how">Rules</button><button class="sf-btn alt sm" data-a="leave">Menu</button></div>
<div class="sf-stage"><div class="sf-left"></div><div class="sf-right"></div></div><div class="sf-over" hidden></div>`;
    const leftEl = el.querySelector('.sf-left'), rightEl = el.querySelector('.sf-right'), rdEl = el.querySelector('.sf-rd'), overEl = el.querySelector('.sf-over'), stageEl = el.querySelector('.sf-stage');
    let V = null, prev = null, lastErr = 0, struck = new Set(), draft = { to: -1, q: '', a: '', hide: false, guessing: false }, total = 0, counted = '';

    const nm = (v, i) => (i >= 0 && v.players[i] ? v.players[i].n : '?');
    const locIcon = (name, i) => {
      const L = SF_LOCS[i];
      return `<svg viewBox="0 0 64 64" fill="currentColor">${SF_ICONS[L.ic]}</svg>`;
    };
    function locGrid(v) {
      return `<div class="sf-locs${draft.guessing ? ' guess' : ''}">${SF_LOCS.map((L, i) => `<button class="sf-loc${struck.has(i) ? ' x' : ''}${v.phase === 'over' && v.loc === i ? ' hit' : ''}" style="--h:${SF_HUE[L.ic]}" data-a="loc" data-i="${i}">${locIcon(L.n, i)}<span>${esc(L.n)}</span></button>`).join('')}</div>`;
    }
    function myCard(v) {
      if (v.isSpy) return `<div class="sf-me spy"><small>YOUR CARD</small><b>You are the SPY</b><span>You do not know the location. Listen, bluff, and guess before the others catch you.</span></div>`;
      if (draft.hide) return `<div class="sf-me"><small>YOUR CARD</small><b>Hidden</b><button class="sf-btn alt sm" data-a="peek">Show card</button></div>`;
      const L = SF_LOCS[v.loc];
      return `<div class="sf-me" style="--h:${SF_HUE[L.ic]}"><small>YOUR CARD</small><div class="sf-ml"><span class="ic">${locIcon(L.n, v.loc)}</span><b>${esc(L.n)}</b></div><span>Your role: <b>${esc(v.role)}</b></span><button class="sf-btn alt sm" data-a="peek">Hide card</button></div>`;
    }
    function logHtml(v) {
      const rows = [];
      v.log.slice().reverse().forEach(e => {
        if (e.k === 'q') rows.push(`<div class="lg q"><b>${esc(nm(v, e.by))}</b> asks <b>${esc(nm(v, e.to))}</b>: ${esc(e.q)}</div>`);
        else if (e.k === 'a') rows.push(`<div class="lg a"><b>${esc(nm(v, e.by))}</b>: ${esc(e.text)}</div>`);
        else if (e.k === 'acc') rows.push(`<div class="lg w"><b>${esc(nm(v, e.by))}</b> accuses <b>${esc(nm(v, e.to))}</b>!</div>`);
        else if (e.k === 'vres') rows.push(`<div class="lg w">Vote on ${esc(nm(v, e.to))}: ${e.ok ? 'unanimous' : 'not unanimous'}.</div>`);
        else if (e.k === 'skip') rows.push(`<div class="lg dim">${esc(nm(v, e.by))} ran out of time. Turn skipped.</div>`);
        else if (e.k === 'sg') rows.push(`<div class="lg w"><b>${esc(nm(v, e.by))}</b> reveals: <b>I am the spy</b>. Guess: ${esc(v.locs[e.loc])}</div>`);
        else if (e.k === 'time') rows.push('<div class="lg w">Time is up!</div>');
      });
      return rows.join('') || '<div class="lg dim">The first question is coming...</div>';
    }
    function turnPanel(v) {
      const T = v.turn, myTurnAsk = T.stage === 'ask' && T.by === v.me, myAns = T.stage === 'answer' && T.to === v.me;
      let h = '';
      if (v.phase === 'play') {
        if (myTurnAsk) {
          const opts = v.players.map((p, i) => ({ p, i })).filter(x => x.i !== v.me && x.i !== T.prev);
          h = `<div class="sf-turn mine"><b>Your turn: question someone</b><div class="sf-form"><select class="sf-in" data-k="to">${opts.map(x => `<option value="${x.i}"${draft.to === x.i ? ' selected' : ''}>${esc(x.p.n)}</option>`).join('')}</select><input class="sf-in" data-k="q" maxlength="160" placeholder="Your question (or ask aloud)" autocomplete="off" value="${esc(draft.q)}"><button class="sf-btn alt sm" data-a="rq" title="Random question">Idea</button><button class="sf-btn good" data-a="ask">Ask</button></div></div>`;
        } else if (myAns) {
          h = `<div class="sf-turn mine"><b>${esc(nm(v, T.by))} asks you</b><p class="sf-q">${esc(T.q)}</p><div class="sf-form"><input class="sf-in" data-k="a" maxlength="160" placeholder="Your answer (or answer aloud)" autocomplete="off" value="${esc(draft.a)}"><button class="sf-btn good" data-a="answer">Answer</button></div></div>`;
        } else if (T.stage === 'ask') h = `<div class="sf-turn"><b>${esc(nm(v, T.by))}</b> is choosing who to question...</div>`;
        else h = `<div class="sf-turn"><b>${esc(nm(v, T.by))}</b> asks <b>${esc(nm(v, T.to))}</b><p class="sf-q">${esc(T.q)}</p></div>`;
      } else if (v.phase === 'vote') {
        const vt = v.vote, elig = v.me !== vt.to && vt.mine === undefined;
        const bl = v.players.map((p, i) => i !== vt.to ? `<span class="sf-b ${vt.ballots[i] === undefined ? '' : vt.ballots[i] ? 'y' : 'n'}">${esc(p.n)} ${vt.ballots[i] === undefined ? '...' : vt.ballots[i] ? 'yes' : 'no'}</span>` : '').join('');
        h = `<div class="sf-turn vote"><b>${esc(nm(v, vt.by))} accuses ${esc(nm(v, vt.to))}!</b><p class="sf-q">Everyone except ${esc(nm(v, vt.to))} must agree. Is ${esc(nm(v, vt.to))} the spy?</p><div class="sf-ballots">${bl}</div>${elig ? '<div class="sf-form"><button class="sf-btn good" data-a="vote" data-y="1">Yes, the spy</button><button class="sf-btn warn" data-a="vote" data-y="0">No</button></div>' : v.me === vt.to ? '<p class="sf-q">The others are voting on you...</p>' : '<p class="sf-q">Your vote is in.</p>'}</div>`;
      } else if (v.phase === 'final') {
        h = `<div class="sf-turn vote"><b>Time is up! Vote for the spy</b><p class="sf-q">Whoever gets the most votes is accused. If it is not the spy, the spy wins.</p>${v.fv < 0 ? `<div class="sf-form wrap">${v.players.map((p, i) => i !== v.me ? `<button class="sf-btn alt" data-a="fvote" data-i="${i}">${esc(p.n)}</button>` : '').join('')}</div>` : `<p class="sf-q">You voted for <b>${esc(nm(v, v.fv))}</b>. Waiting for the others (${v.fvoted.length}/${v.n})...</p>`}</div>`;
      }
      return h;
    }
    function playersHtml(v) {
      const T = v.turn;
      return `<div class="sf-pl">${v.players.map((p, i) => {
        const tags = v.phase === 'play' ? (T.stage === 'ask' && T.by === i ? '<em>asking</em>' : T.stage === 'answer' && T.to === i ? '<em class="b">answering</em>' : '') : '';
        const can = v.phase === 'play' && i !== v.me && !v.players[v.me].acc;
        return `<div class="sf-p${p.you ? ' you' : ''}">${avatar(p.n, i, p.bot)}<span class="nmw"><span class="nm">${esc(p.n)}${p.you ? ' (you)' : ''}</span>${tags}</span><span class="sc">${v.scores[i]}</span>${can ? `<button class="sf-btn sm warn" data-a="accuse" data-i="${i}">Accuse</button>` : ''}</div>`;
      }).join('')}</div>`;
    }
    function renderOver(v) {
      const R = v.result, spyName = nm(v, v.spy);
      const win = v.phase === 'series' ? false : (R.winner === 'spy') === v.isSpy;
      let head, why;
      if (R.how === 'guess') { head = 'The spy found the location'; why = `${spyName} guessed ${v.guessName} correctly.`; }
      else if (R.how === 'badguess') { head = 'The spy guessed wrong'; why = `${spyName} guessed ${v.guessName}. It was ${v.locName}.`; }
      else if (R.how === 'accuse') { head = R.winner === 'town' ? 'The spy was caught!' : 'Wrong accusation'; why = R.winner === 'town' ? `${nm(v, R.accused)} was the spy.` : `${nm(v, R.accused)} was innocent. The spy was ${spyName}.`; }
      else { head = R.winner === 'town' ? 'The vote found the spy!' : 'The spy got away'; why = R.winner === 'town' ? `${spyName} was the spy.` : `The spy was ${spyName}.`; }
      const rows = v.players.map((p, i) => ({ p, i })).sort((a, b) => v.scores[b.i] - v.scores[a.i]);
      if (v.phase === 'series') {
        const top = Math.max(...v.scores);
        overEl.innerHTML = `<div class="sf-box"><p class="k">Final standings</p><h3>${rows.filter(r => v.scores[r.i] === top).map(r => esc(r.p.n)).join(' & ')} win${rows.filter(r => v.scores[r.i] === top).length > 1 ? '' : 's'}!</h3><div class="sf-score">${rows.map(r => `<div class="${v.scores[r.i] === top ? 'top' : ''}">${avatar(r.p.n, r.i, r.p.bot)}<span class="nm">${esc(r.p.n)}</span><b>${v.scores[r.i]}</b></div>`).join('')}</div><div class="sf-orow">${v.lead ? '<button class="sf-btn good" data-a="restart">Play again</button>' : '<span class="sf-hint">Waiting for the host...</span>'}${ctl.canLobby ? '<button class="sf-btn alt" data-a="lobby">Back to lobby</button>' : ''}</div></div>`;
        return;
      }
      overEl.innerHTML = `<div class="sf-box"><p class="k">Round ${v.round} of ${v.rounds} · ${esc(v.locName)}</p><h3 class="${win ? 'w' : 'l'}">${esc(head)}</h3><p>${esc(why)}</p>
<div class="sf-roles">${v.players.map((p, i) => `<div class="${i === v.spy ? 'spy' : ''}">${avatar(p.n, i, p.bot)}<span class="nm">${esc(p.n)}</span><em>${i === v.spy ? 'SPY' : esc(v.roles[i])}</em><b>${R.pts[i] ? '+' + R.pts[i] : ''}</b></div>`).join('')}</div>
<div class="sf-orow">${v.lead ? `<button class="sf-btn good" data-a="next">${v.round >= v.rounds ? 'Final results' : 'Next round'}</button>` : '<span class="sf-hint">Waiting for the host...</span>'}</div></div>`;
    }

    return {
      update(v) {
        V = v;
        if (v.err && v.err.id !== lastErr) { lastErr = v.err.id; ctl.toast(v.err.m); api.sfx('bad'); }
        if (prev && prev.round !== v.round) { struck = new Set(); draft.guessing = false; draft.q = ''; draft.a = ''; }
        ctl.keep(() => {
          rdEl.textContent = `Round ${v.round}/${v.rounds}`;
          const over = v.phase === 'over' || v.phase === 'series';
          overEl.hidden = !over;
          if (over) renderOver(v);
          el.querySelector('.sf-top').classList.toggle('paused', v.phase !== 'play');
          leftEl.innerHTML = myCard(v) + `<div class="sf-turnbox">${turnPanel(v)}</div>` + `<div class="sf-lgt">Questions and answers</div><div class="sf-log">${logHtml(v)}</div>`;
          rightEl.innerHTML = `<div class="sf-lgt">Players${v.phase === 'play' ? '' : ''}</div>${playersHtml(v)}<div class="sf-lgt">Locations <span class="sf-hint">${v.isSpy ? (draft.guessing ? 'Tap the location to guess' : 'Tap to strike out') : 'Tap to strike out'}</span></div>${v.isSpy && v.phase === 'play' ? `<button class="sf-btn ${draft.guessing ? 'warn' : 'alt'} sm" data-a="gmode">${draft.guessing ? 'Cancel guess' : 'I know the location!'}</button>` : ''}${locGrid(v)}`;
          stageEl.classList.toggle('dim', over);
        });
        if ((v.phase === 'over' || v.phase === 'series') && (!prev || prev.phase !== v.phase)) { try { overEl.firstChild.scrollIntoView({ block: 'center' }); } catch (e) {} }
        if (v.phase === 'play' && prev && v.log.length > prev.log.length) api.sfx('pop');
        if (v.phase === 'vote' && (!prev || prev.phase !== 'vote')) api.sfx('bad');
        if ((v.phase === 'over' || v.phase === 'series') && (!prev || (prev.phase !== v.phase))) {
          if (v.phase === 'over') {
            const win = (v.result.winner === 'spy') === v.isSpy;
            api.sfx(win ? 'win' : 'lose');
            const key = v.round + ':' + v.result.how;
            if (counted !== key) { counted = key; total += v.result.pts[v.me] || 0; ctl.score(total); ctl.submit(total); }
          }
        }
        prev = v;
      },
      input(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (k === 'q') draft.q = e.target.value;
        else if (k === 'a') draft.a = e.target.value;
      },
      change(e) { if (e.target.dataset && e.target.dataset.k === 'to') draft.to = +e.target.value; },
      keydown(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (e.key === 'Enter' && (k === 'q' || k === 'a')) { e.preventDefault(); this.click(k === 'q' ? 'ask' : 'answer'); }
      },
      click(a, b) {
        if (!V) return;
        const v = V;
        if (a === 'ask') {
          const sel = leftEl.querySelector('[data-k="to"]');
          const to = sel ? +sel.value : draft.to;
          ctl.send({ k: 'ask', to, q: draft.q });
          draft.q = ''; draft.to = -1;
        } else if (a === 'answer') { ctl.send({ k: 'answer', a: draft.a }); draft.a = ''; }
        else if (a === 'rq') { draft.q = pick(SF_QS); const i = leftEl.querySelector('[data-k="q"]'); if (i) { i.value = draft.q; i.focus(); } }
        else if (a === 'peek') { draft.hide = !draft.hide; this.update(v); }
        else if (a === 'accuse') {
          const i = +b.dataset.i;
          ctl.pane(`<p class="k">Accusation</p><h3>Accuse ${esc(nm(v, i))}?</h3><p>Everybody else must vote. If all agree and ${esc(nm(v, i))} is not the spy, the spy wins. You can accuse only once per round.</p><div class="sf-orow"><button class="sf-btn warn" data-a="doacc" data-i="${i}">Accuse</button><button class="sf-btn alt" data-a="closepane">Cancel</button></div>`);
        } else if (a === 'doacc') { ctl.closePane(); ctl.send({ k: 'accuse', to: +b.dataset.i }); }
        else if (a === 'vote') ctl.send({ k: 'vote', yes: b.dataset.y === '1' });
        else if (a === 'fvote') ctl.send({ k: 'fvote', to: +b.dataset.i });
        else if (a === 'gmode') { draft.guessing = !draft.guessing; this.update(v); }
        else if (a === 'loc') {
          const i = +b.dataset.i;
          if (v.isSpy && draft.guessing && v.phase === 'play') {
            ctl.pane(`<p class="k">Final answer</p><h3>Is it the ${esc(v.locs[i])}?</h3><p>If you are right, you win the round. If you are wrong, the group wins.</p><div class="sf-orow"><button class="sf-btn good" data-a="doguess" data-i="${i}">Yes, ${esc(v.locs[i])}</button><button class="sf-btn alt" data-a="closepane">Cancel</button></div>`);
          } else { if (struck.has(i)) struck.delete(i); else struck.add(i); b.classList.toggle('x', struck.has(i)); }
        } else if (a === 'doguess') { ctl.closePane(); draft.guessing = false; ctl.send({ k: 'guess', loc: +b.dataset.i }); }
        else if (a === 'next') ctl.send({ k: 'next' });
        else if (a === 'restart') ctl.send({ k: 'restart' });
        else if (a === 'lobby') ctl.lobby();
      }
    };
  }

  const sfCss = `
.gm-spyfall{--bg1:#0d0c14;--bg2:#272340;--panel:rgba(255,255,255,.06);--panel2:rgba(255,255,255,.11);--ink:#f1eee6;--mut:#a7a4b8;--line:rgba(255,255,255,.13);--acc:#f2a900;--acc-ink:#241800}
.gm-spyfall .sf-menu h2{letter-spacing:.02em;color:var(--acc);text-shadow:0 3px 0 rgba(0,0,0,.4)}
.gm-spyfall .sf-top .sf-tm{font-size:26px}
.gm-spyfall .sf-top.paused .sf-tm{opacity:.55}
.gm-spyfall .sf-stage{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:12px;padding:12px}
.gm-spyfall .sf-stage.dim{opacity:.35;pointer-events:none}
.gm-spyfall .sf-left,.gm-spyfall .sf-right{display:flex;flex-direction:column;gap:9px;min-width:0}
.gm-spyfall .sf-me{border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;background:linear-gradient(135deg,hsl(var(--h,40) 45% 30%),hsl(var(--h,40) 40% 18%));border:2px solid hsl(var(--h,40) 55% 50%/.55)}
.gm-spyfall .sf-me small{font:900 10px var(--sans);letter-spacing:.14em;color:rgba(255,255,255,.7)}
.gm-spyfall .sf-me b{font:900 24px/1.1 var(--sans)}
.gm-spyfall .sf-me span{font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.9)}
.gm-spyfall .sf-me .sf-btn{align-self:flex-start}
.gm-spyfall .sf-me .sf-ml{display:flex;align-items:center;gap:10px}
.gm-spyfall .sf-me .ic{width:38px;height:38px;color:hsl(var(--h,40) 80% 75%);display:grid}
.gm-spyfall .sf-me.spy{background:linear-gradient(135deg,#5a1530,#220a15);border-color:#ff5a7a}
.gm-spyfall .sf-me.spy b{color:#ff8aa0}
.gm-spyfall .sf-turnbox{min-height:20px}
.gm-spyfall .sf-turn{border-radius:14px;padding:11px 13px;background:var(--panel2);display:block;font:700 14px/1.4 var(--sans)}
.gm-spyfall .sf-turn>*+*{margin-top:7px}
.gm-spyfall .sf-turn.mine{background:linear-gradient(#3a3050,#2a2340);box-shadow:inset 0 0 0 2px var(--acc)}
.gm-spyfall .sf-turn.vote{box-shadow:inset 0 0 0 2px #ff6b5a;background:linear-gradient(#3b2030,#2a1523)}
.gm-spyfall .sf-q{margin:0;font:700 15px/1.4 var(--sans);color:var(--ink);font-style:italic}
.gm-spyfall .sf-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.gm-spyfall .sf-form.wrap{justify-content:center}
.gm-spyfall .sf-form .sf-in{flex:1 1 150px}
.gm-spyfall .sf-form select.sf-in{flex:0 0 130px}
.gm-spyfall .sf-ballots{display:flex;gap:6px;flex-wrap:wrap}
.gm-spyfall .sf-b{padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.1);font:800 12px var(--sans)}
.gm-spyfall .sf-b.y{background:#2f9e5b}
.gm-spyfall .sf-b.n{background:#d6453d}
.gm-spyfall .sf-lgt{font:900 11px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--mut);display:flex;gap:8px;align-items:center}
.gm-spyfall .sf-hint{font:700 11px var(--sans);letter-spacing:0;text-transform:none;color:var(--mut)}
.gm-spyfall .sf-log{display:flex;flex-direction:column;gap:4px;max-height:260px;overflow:auto;font:600 13px/1.4 var(--sans)}
.gm-spyfall .lg{padding:5px 9px;border-radius:9px;background:var(--panel)}
.gm-spyfall .lg.q{border-left:3px solid #6aa7ff}
.gm-spyfall .lg.a{border-left:3px solid var(--acc);margin-left:14px}
.gm-spyfall .lg.w{border-left:3px solid #ff6b5a;background:rgba(255,107,90,.12)}
.gm-spyfall .lg.dim{opacity:.55}
.gm-spyfall .sf-pl{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}
.gm-spyfall .sf-p{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:11px;background:var(--panel);font:800 13.5px var(--sans);min-width:0}
.gm-spyfall .sf-p.you{box-shadow:inset 0 0 0 2px var(--acc)}
.gm-spyfall .sf-p .nmw{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.gm-spyfall .sf-p .nm{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-spyfall .sf-p .sf-btn.sm{min-height:30px;padding:0 10px;font-size:12px}
.gm-spyfall .sf-p em{font:900 9px var(--sans);font-style:normal;padding:2px 6px;border-radius:6px;background:var(--acc);color:#241800;text-transform:uppercase;letter-spacing:.05em}
.gm-spyfall .sf-p em.b{background:#6aa7ff}
.gm-spyfall .sf-p .sc{font:900 15px var(--sans);color:var(--acc);min-width:16px;text-align:right}
.gm-spyfall .sf-locs{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:5px}
.gm-spyfall .sf-loc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px 5px;border-radius:10px;border:1px solid var(--line);background:linear-gradient(hsl(var(--h) 30% 24%),hsl(var(--h) 28% 16%));color:hsl(var(--h) 70% 80%);cursor:pointer;min-height:62px}
.gm-spyfall .sf-loc svg{width:22px;height:22px}
.gm-spyfall .sf-loc span{font:800 10.5px/1.15 var(--sans);color:var(--ink);text-align:center}
.gm-spyfall .sf-loc.x{opacity:.3;text-decoration:line-through}
.gm-spyfall .sf-loc.hit{box-shadow:0 0 0 2px var(--acc);opacity:1}
.gm-spyfall .sf-locs.guess .sf-loc{animation:sf-wob .9s infinite alternate;border-color:#ff6b5a}
@keyframes sf-wob{to{transform:rotate(-1.5deg) scale(1.03)}}
.gm-spyfall .sf-over{position:absolute;inset:0;z-index:25;display:flex;align-items:flex-start;justify-content:center;padding:14px;background:rgba(6,6,16,.78);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);overflow:auto}
.gm-spyfall .sf-box{width:100%;max-width:560px;margin:0 auto;position:sticky;top:14px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.5);animation:sf-in .35s cubic-bezier(.2,1.3,.4,1)}
@keyframes sf-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-spyfall .sf-box h3{margin:0;font:900 26px var(--sans)}
.gm-spyfall .sf-box h3.w{color:#6be39a}
.gm-spyfall .sf-box h3.l{color:#ff8a7a}
.gm-spyfall .sf-box p{margin:0;font:600 14px/1.5 var(--sans)}
.gm-spyfall .sf-box .k{font:900 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.gm-spyfall .sf-roles,.gm-spyfall .sf-score{display:flex;flex-direction:column;gap:5px}
.gm-spyfall .sf-roles>div,.gm-spyfall .sf-score>div{display:flex;align-items:center;gap:8px;padding:5px 9px;border-radius:11px;background:var(--panel);font:800 13.5px var(--sans)}
.gm-spyfall .sf-roles .spy{background:rgba(255,90,122,.2);box-shadow:inset 0 0 0 2px #ff5a7a}
.gm-spyfall .sf-score .top{box-shadow:inset 0 0 0 2px var(--acc)}
.gm-spyfall .sf-roles .nm,.gm-spyfall .sf-score .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-spyfall .sf-roles em{font:700 12px var(--sans);font-style:normal;color:var(--mut)}
.gm-spyfall .sf-roles b,.gm-spyfall .sf-score b{font:900 15px var(--sans);color:var(--acc);min-width:24px;text-align:right}
.gm-spyfall .sf-orow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
@media (max-width:760px){
.gm-spyfall .sf-stage{grid-template-columns:minmax(0,1fr);padding:8px}
.gm-spyfall .sf-log{max-height:180px}
.gm-spyfall .sf-locs{grid-template-columns:repeat(auto-fill,minmax(80px,1fr))}
}
`;

  Ameplay.register({
    id: 'spyfall',
    title: 'Spyfall',
    category: 'Board',
    tint: '#3b2f6b',
    blurb: 'One of you is a spy who does not know the location. Question each other, catch the liar or bluff your way out.',
    help: 'Ask and answer questions in turn · accuse a player (everyone must agree) · the spy can guess the place at any time · 3 to 8 players online, bots fill seats',
    better: 'high',
    format: v => v + ' pts',
    width: 1040,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 28h48M14 28c0-8 6-14 18-14s18 6 18 14"/><path d="M18 28v8a14 14 0 0028 0v-8"/><circle cx="26" cy="38" r="4"/><circle cx="38" cy="38" r="4"/><path d="M30 38h4"/></svg>',
    css: baseCss('spyfall', 'sf') + waitCss('spyfall', 'sf') + sfCss,
    mount(root, api) {
      return runTable(root, api, {
        p: 'sf', defaults: { size: 5, mins: 8, rounds: 5 }, pmin: 3, pmax: 8, pdef: 5, max: 8,
        how: SF_HOW, menu: sfMenu, ui: sfUi, create: sfCreate,
        room: () => ({ title: 'Spyfall', sizes: [3, 4, 5, 6, 7, 8], defaultSize: 6, min: 3, max: 8, bots: true })
      });
    }
  });
  const UC_RAW = `
knife|fork|kitchen,metal,cutlery,dinner|sharp,cut,blade,steak|prongs,pasta,spike,stab
coffee|tea|hot,drink,cup,morning|bean,espresso,caffeine,latte|leaf,kettle,herbal,biscuit
cat|dog|pet,fur,animal,home|purr,whiskers,mouse,independent|bark,leash,walk,loyal
sun|moon|sky,bright,round,space|day,hot,summer,tan|night,craters,tide,silver
rain|snow|weather,cold,wet,sky|umbrella,drops,puddle,storm|flakes,sled,white,ski
bike|motorbike|wheels,ride,road,helmet|pedal,chain,exercise,effort|engine,fuel,loud,speed
pizza|burger|fast food,cheese,meal,round|slice,italy,oven,tomato|bun,beef,fries,patty
guitar|violin|music,strings,instrument,wood|pick,strum,rock,frets|bow,orchestra,classical,chin
beach|desert|sand,sun,hot,holiday|sea,waves,towel,shells|camel,dunes,cactus,dry
pen|pencil|write,paper,desk,school|ink,cap,signature,blue|eraser,lead,sharpen,wood
bread|toast|breakfast,bakery,slice,butter|loaf,flour,sandwich,crust|toaster,crispy,jam,brown
shoes|boots|feet,wear,laces,pair|sneakers,sports,run,comfortable|leather,winter,mud,tall
castle|palace|king,royal,big,stone|knights,moat,tower,drawbridge|garden,luxury,gold,guards
wolf|fox|animal,forest,tail,wild|howl,pack,moon,gray|cunning,red,sly,den
football|rugby|ball,team,pitch,sport|goal,kick,round,world cup|tackle,oval,scrum,try
apple|pear|fruit,tree,sweet,juicy|red,core,pie,cider|green,soft,yellow,shape
chocolate|candy|sweet,sugar,treat,kids|cocoa,bar,melt,dark|lollipop,colorful,gum,sticky
lion|tiger|cat,jungle,roar,wild|mane,king,savanna,pride|stripes,orange,asia,solitary
ship|boat|water,sea,sail,captain|big,cargo,deck,crew|small,oars,lake,fishing
plane|helicopter|fly,pilot,sky,travel|wings,runway,airport,jet|blades,hover,rotor,rescue
doctor|nurse|hospital,health,patient,uniform|prescription,surgery,diagnosis,coat|bed,injection,care,shift
teacher|professor|school,class,lesson,students|board,homework,chalk,grades|university,lecture,research,thesis
river|lake|water,fish,nature,fresh|flow,bridge,current,banks|still,swim,calm,boat
mountain|hill|high,climb,nature,view|snow,peak,alpine,ski|grass,small,walk,green
ring|bracelet|jewelry,wear,gold,shiny|finger,wedding,diamond,engagement|wrist,charm,chain,clasp
piano|organ|keys,music,instrument,notes|grand,pedals,hammer,concert|church,pipes,huge,wedding
pyramid|temple|ancient,stone,religion,tourists|egypt,pharaoh,triangle,mummy|pray,monks,altar,asia
spider|ant|insect,legs,tiny,crawl|web,silk,venom,eight|colony,queen,hill,march
jacket|coat|clothes,warm,zip,winter|sleeves,leather,pockets,denim|long,wool,heavy,rain
cake|pie|dessert,sweet,oven,slice|birthday,candles,icing,layers|crust,apple,filling,crumble
sword|dagger|blade,weapon,sharp,metal|knight,long,duel,king|short,hidden,stab,assassin
book|magazine|read,pages,paper,words|novel,library,chapter,author|glossy,monthly,ads,celebrity
phone|tablet|screen,apps,touch,battery|call,pocket,sms,number|big,reading,drawing,wifi
wine|beer|drink,alcohol,glass,party|grape,cork,red,vineyard|foam,hops,pub,bottle
pirate|viking|ship,sea,sword,beard|treasure,parrot,patch,rum|horns,helmet,norse,raid
robot|alien|science,metal,future,movie|circuit,program,machine,battery|ufo,planet,green,invasion
supermarket|market|buy,food,shopping,fruit|trolley,aisle,checkout,fridge|stalls,fresh,haggle,outdoor
carpet|rug|floor,home,soft,pattern|wall,vacuum,wide,fitted|small,mat,door,weave
bus|tram|transport,city,passengers,ticket|road,driver,stop,wheels|rails,wires,line,electric
cinema|theater|screen,seats,tickets,show|popcorn,movie,film,dark|stage,actors,curtain,play
jam|honey|sweet,breakfast,spread,jar|fruit,strawberry,toast,sticky|bees,golden,hive,bear
salt|pepper|kitchen,table,seasoning,shaker|white,sea,crystals,tears|black,spicy,grind,sneeze
shark|dolphin|ocean,fish,swim,animal|teeth,fin,danger,jaws|smart,jump,friendly,show
spoon|fork|cutlery,kitchen,metal,eat|soup,dessert,stir,round|prongs,pasta,tines,stab
mirror|window|glass,wall,room,frame|reflection,face,bathroom,vanity|view,curtain,open,outside
tent|cabin|camping,sleep,nature,forest|canvas,pegs,sleeping bag,zip|wood,fireplace,roof,rent
farmer|gardener|plants,outdoors,soil,work|tractor,cows,crops,barn|flowers,hose,lawn,roses
detective|spy|secret,mystery,hat,case|clues,crime,magnifier,police|agent,mission,gadgets,code
Santa|snowman|winter,christmas,white,cold|gifts,reindeer,beard,chimney|carrot,melting,scarf,snow
bank|casino|money,cash,building,security|vault,loan,account,teller|chips,gamble,roulette,slot
snake|worm|long,crawl,no legs,ground|venom,scales,hiss,charmer|soil,slimy,fishing,wriggle
bridge|tunnel|cross,road,travel,engineering|river,cables,arch,toll|mountain,dark,underground,train
lamp|candle|light,room,glow,night|bulb,shade,switch,desk|wax,flame,wick,birthday
dress|skirt|clothes,woman,fashion,fabric|wedding,long,gown,party|waist,short,pleats,school
bottle|can|drink,container,recycle,shop|glass,cap,cork,label|metal,open,soda,tin
brain|heart|organ,body,important,beat|thinking,memory,skull,neurons|love,blood,pump,valentine
gold|silver|metal,shiny,medal,precious|first,ring,treasure,bar|second,coin,moon,spoon
fire|smoke|danger,burn,gray,hot|flames,wood,camp,matches|chimney,cloud,alarm,smell
hammer|screwdriver|tool,metal,handle,toolbox|nail,smash,wood,thor|screw,turn,tip,flat
camel|horse|animal,ride,desert,farm|hump,sand,thirst,oasis|saddle,gallop,mane,race
snowboard|ski|snow,winter,mountain,slope|board,one,tricks,boots|poles,two,downhill,lift
pasta|rice|food,boil,dinner,carbohydrates|italy,spaghetti,sauce,fork|asia,grains,paddy,sushi
tooth|nail|body,hard,white,clean|dentist,brush,smile,fairy|finger,polish,cut,manicure
sock|glove|clothes,pair,wear,warm|foot,sneakers,hole,laundry|hand,finger,winter,boxing
stadium|arena|crowd,sport,seats,big|football,pitch,fans,chant|concert,circle,gladiator,stage
hotel|hostel|sleep,travel,room,reception|luxury,stars,pool,breakfast|cheap,backpack,dorm,young
clock|watch|time,hands,numbers,tick|wall,tower,alarm,pendulum|wrist,strap,smart,pocket
candy|ice cream|sweet,dessert,kids,sugar|wrapper,lollipop,gum,colorful|cone,cold,scoop,summer
envelope|parcel|post,mail,paper,address|letter,stamp,seal,flat|box,tape,delivery,heavy
jungle|forest|trees,animals,green,nature|monkeys,hot,humid,vines|pine,autumn,deer,picnic
horse|donkey|animal,farm,ride,hooves|gallop,race,mane,saddle|stubborn,ears,bray,carry
ocean|sea|water,blue,waves,salt|deep,whales,vast,atlantic|shore,gentle,mediterranean,boats
juice|soda|drink,glass,cold,sweet|orange,fresh,vitamin,fruit|bubbles,can,fizzy,cola
beard|mustache|face,hair,man,shave|long,wizard,santa,full|lip,thin,curly,dali
sandwich|burger|food,bread,lunch,fillings|ham,slices,picnic,toasted|beef,patty,fries,fast
thunder|lightning|storm,sky,weather,loud|boom,rumble,drums,clap|flash,bolt,bright,strike
swimming pool|bathtub|water,wet,swim,tiles|laps,lifeguard,dive,chlorine|soap,bubbles,bathroom,rubber duck
whale|elephant|big,animal,heavy,mammal|ocean,spout,blue,song|trunk,tusks,africa,memory
spaghetti|noodles|pasta,long,boil,sauce|italy,meatballs,tomato,fork|asia,chopsticks,soup,ramen
ghost|zombie|scary,halloween,dead,movie|spirit,white,boo,haunt|brains,walk,undead,apocalypse
vampire|werewolf|monster,night,scary,legend|blood,fangs,cape,coffin|moon,howl,fur,silver
teacher|principal|school,adult,authority,students|class,lesson,grade,desk|office,boss,rules,detention
tree|bush|plant,green,garden,leaves|trunk,tall,wood,shade|small,hedge,berries,trim
printer|scanner|office,paper,machine,computer|ink,print,cartridge,toner|copy,glass,document,digital
lemon|lime|fruit,sour,citrus,juice|yellow,tea,sharp,pie|green,cocktail,mojito,mexican
banana|plantain|fruit,tropical,yellow,peel|monkey,smoothie,sweet,split|fry,savory,cooked,starch
`;
  const UC_PAIRS = UC_RAW.trim().split('\n').map(l => {
    const p = l.split('|');
    return { a: p[0].toLowerCase(), b: p[1].toLowerCase(), sh: p[2].split(','), ha: p[3].split(','), hb: p[4].split(',') };
  });
  const UC_STOCK = ['thing', 'common', 'useful', 'popular', 'normal', 'everyday', 'familiar', 'simple', 'nice', 'classic'];
  const UC_PTS = { civ: 2, uc: 10, mw: 6 };

  function ucCreate(seats, opt) {
    const lead = i => i === 0 || (opt.leader && opt.leader() && opt.leader() === seats[i].id);
    const n = seats.length;
    const s = {
      phase: 'deal', round: 0, games: 0, gamesTotal: clamp(+opt.rounds || 3, 1, 10), scores: Array(n).fill(0), roles: [], words: [], alive: [], pair: null, swap: false, mwOn: !!opt.mw, ucCount: 0,
      descs: [], order: [], cur: 0, dl: 0, at: 0, ballots: {}, cand: null, tied: false, elim: -1, result: null, ready: {}, pairBag: [], errs: {}, eid: 0, timer: clamp(+opt.timer === 0 ? 0 : (+opt.timer || 60), 0, 180), mwGuess: null, votesLast: null, lastVotes: null, elims: []
    };
    const E = {
      seats, s,
      shift(ms) { if (s.dl) s.dl += ms; if (s.at) s.at += ms; },
      botify(i) { seats[i].bot = true; seats[i].name = seats[i].name + ' (bot)'; s.at = Date.now() + 800; s.ready[i] = true; }
    };
    const fail = (i, m) => { s.errs[i] = { m, id: ++s.eid }; return true; };
    const now = () => Date.now();
    const sched = (a, b) => { s.at = now() + a + rnd(b || 1); };
    const aliveIdx = () => seats.map((x, i) => i).filter(i => s.alive[i]);
    const isImp = i => s.roles[i] !== 'civ';
    const roleName = r => (r === 'civ' ? 'Civilian' : r === 'uc' ? 'Undercover' : 'Mr. White');
    const myWord = i => s.words[i];

    function counts() {
      const mw = s.mwOn && n >= 5 ? 1 : 0;
      let uc = clamp(+opt.uc || 0, 0, 10);
      if (!uc) uc = Math.max(1, Math.round(n / 4));
      uc = clamp(uc, 1, Math.max(1, Math.floor((n - 1) / 2) - mw));
      return { uc, mw };
    }
    function deal() {
      s.games++; s.round = 0;
      if (!s.pairBag.length) s.pairBag = shuf(UC_PAIRS.map((p, i) => i));
      s.pair = UC_PAIRS[s.pairBag.pop()];
      s.swap = Math.random() < .5;
      const civW = s.swap ? s.pair.b : s.pair.a, ucW = s.swap ? s.pair.a : s.pair.b;
      const { uc, mw } = counts();
      s.ucCount = uc;
      const roles = shuf([...Array(uc).fill('uc'), ...Array(mw).fill('mw'), ...Array(n - uc - mw).fill('civ')]);
      s.roles = roles;
      s.words = roles.map(r => (r === 'civ' ? civW : r === 'uc' ? ucW : null));
      s.civW = civW; s.ucW = ucW;
      s.alive = Array(n).fill(true); s.descs = []; s.result = null; s.elim = -1; s.ready = {}; s.mwGuess = null; s.lastVotes = null; s.elims = [];
      seats.forEach((x, i) => { if (x.bot) s.ready[i] = true; });
      s.phase = 'deal'; s.dl = now() + 30000; sched(1500, 1500);
    }
    function startDesc() {
      s.round++;
      const live = aliveIdx();
      let start = s.round === 1 ? live.filter(i => s.roles[i] !== 'mw') : live;
      const first = pick(start.length ? start : live);
      const k = live.indexOf(first);
      s.order = live.slice(k).concat(live.slice(0, k));
      s.cur = 0; s.descs.push([]); s.phase = 'desc';
      s.dl = s.timer ? now() + s.timer * 1000 : 0; sched(2200, 2500);
    }
    function startVote(runoff) {
      s.phase = 'vote'; s.ballots = {}; s.cand = runoff || null;
      s.dl = now() + 70000; sched(2500, 3000);
    }
    function endGame(win, extra) {
      const pts = Array(n).fill(0);
      if (win === 'civ') seats.forEach((x, i) => { if (s.roles[i] === 'civ') pts[i] = UC_PTS.civ; });
      else if (win === 'imp') seats.forEach((x, i) => { if (s.alive[i] && s.roles[i] === 'uc') pts[i] = UC_PTS.uc; else if (s.alive[i] && s.roles[i] === 'mw') pts[i] = UC_PTS.mw; });
      else if (win === 'mw') seats.forEach((x, i) => { if (s.roles[i] === 'mw') pts[i] = UC_PTS.mw; });
      pts.forEach((p, i) => { s.scores[i] += p; });
      s.result = Object.assign({ win, pts }, extra || {});
      s.phase = 'over'; s.dl = 0; s.at = 0;
    }
    function checkEnd() {
      const live = aliveIdx();
      const imp = live.filter(isImp).length, civ = live.length - imp;
      if (imp === 0) { endGame('civ'); return true; }
      if (imp >= civ) { endGame('imp'); return true; }
      return false;
    }
    function afterElim() {
      if (checkEnd()) return;
      startDesc();
    }
    function tally() {
      const c = {};
      Object.keys(s.ballots).forEach(k => { const t = s.ballots[k]; if (t >= 0) c[t] = (c[t] || 0) + 1; });
      s.lastVotes = Object.assign({}, s.ballots);
      const keys = Object.keys(c).map(Number);
      let target;
      if (!keys.length) target = pick(s.cand || aliveIdx());
      else {
        const mx = Math.max(...keys.map(k => c[k]));
        const top = keys.filter(k => c[k] === mx);
        if (top.length > 1 && !s.cand) { s.tied = top; startVote(top); s.log2 = 'tie'; return; }
        target = top.length > 1 ? pick(top) : top[0];
      }
      eliminate(target);
    }
    function eliminate(t) {
      s.elim = t; s.alive[t] = false; s.cand = null; s.elims.push({ i: t, role: s.roles[t], round: s.round });
      if (s.roles[t] === 'mw') {
        s.phase = 'mw'; s.dl = now() + 40000; s.at = now() + 1800;
        return;
      }
      s.phase = 'reveal'; s.ready = {}; seats.forEach((x, i) => { if (x.bot || !s.alive[i]) s.ready[i] = true; }); s.dl = now() + 9000; s.at = now() + 1000;
    }
    function ucHints(w) {
      const P = UC_PAIRS.find(p => p.a === w || p.b === w);
      if (!P) return [];
      return P.sh.concat(w === P.a ? P.ha : P.hb);
    }
    function descScore(text, w, hints) {
      const t = words(text).join(' ');
      if (!t) return 0;
      if (hints.some(h => h === t || words(h).join(' ') === t)) return 1;
      if (hints.some(h => t.includes(h) || h.includes(t))) return .6;
      return 0;
    }
    function allDescs() { const out = []; s.descs.forEach(r => r.forEach(d => out.push(d))); return out; }
    function botDescribe(b) {
      const used = new Set(allDescs().map(d => d.t.toLowerCase()));
      const w = s.words[b];
      if (w) {
        const P = UC_PAIRS.find(p => p.a === w || p.b === w);
        const own = w === P.a ? P.ha : P.hb;
        const pool = (s.round === 1 ? P.sh.concat(P.sh, own) : own.concat(P.sh)).filter(h => !used.has(h) && !h.includes(w));
        return pick(pool.length ? pool : UC_STOCK.filter(h => !used.has(h)).concat(['thing']));
      }
      const said = allDescs().map(d => d.t.toLowerCase());
      let best = null, bs = 0;
      UC_PAIRS.forEach(p => {
        const pool = p.sh.concat(p.ha, p.hb);
        const sc = said.filter(t => pool.includes(t)).length;
        if (sc > bs) { bs = sc; best = p; }
      });
      if (best) {
        const pool = best.sh.filter(h => !used.has(h) && !said.includes(h));
        if (pool.length) return pick(pool);
      }
      return pick(UC_STOCK.filter(h => !used.has(h)).concat(['thing']));
    }
    function suspicion(b) {
      const w = s.words[b], hints = w ? ucHints(w) : [];
      const P = w ? UC_PAIRS.find(p => p.a === w || p.b === w) : null;
      const other = P ? (w === P.a ? P.hb : P.ha) : [];
      const sc = {};
      aliveIdx().forEach(i => { if (i !== b) sc[i] = 0; });
      s.descs.forEach(r => r.forEach(d => {
        if (d.s === b || sc[d.s] === undefined) return;
        if (w) {
          if (descScore(d.t, w, hints) >= .6) sc[d.s] -= 1;
          else if (descScore(d.t, w, other) >= .6) sc[d.s] += 1.2;
          else sc[d.s] += .3;
        } else sc[d.s] += Math.random() - .5;
      }));
      return sc;
    }
    function botVote(b) {
      const sc = suspicion(b);
      const cand = (s.cand || aliveIdx()).filter(i => i !== b);
      if (!cand.length) return -1;
      const arr = cand.map(i => ({ i, v: (sc[i] || 0) + Math.random() * 1.1 })).sort((p, q) => q.v - p.v);
      return arr[0].i;
    }
    function botMwGuess() {
      const said = allDescs().map(d => d.t.toLowerCase());
      let best = null, bs = -1;
      UC_PAIRS.forEach(p => {
        const poolA = p.sh.concat(p.ha), poolB = p.sh.concat(p.hb);
        const a = said.filter(t => poolA.includes(t)).length, b = said.filter(t => poolB.includes(t)).length;
        if (a > bs) { bs = a; best = p.a; }
        if (b > bs) { bs = b; best = p.b; }
      });
      return best || pick(UC_PAIRS).a;
    }

    E.act = function (i, a, priv) {
      if (!a || typeof a.k !== 'string') return false;
      if (s.phase === 'over') {
        if (a.k === 'next' && priv) {
          if (s.games >= s.gamesTotal) { s.phase = 'series'; return true; }
          deal(); return true;
        }
        return false;
      }
      if (s.phase === 'series') {
        if (a.k === 'restart' && priv) { s.scores = Array(n).fill(0); s.games = 0; s.pairBag = []; deal(); return true; }
        return false;
      }
      if (s.phase === 'deal') {
        if (a.k === 'ready') { s.ready[i] = true; if (seats.every((x, j) => s.ready[j])) startDesc(); return true; }
        return false;
      }
      if (s.phase === 'desc') {
        if (a.k !== 'say' || s.order[s.cur] !== i || !s.alive[i]) return false;
        const t = String(a.t || '').trim().replace(/\s+/g, ' ').slice(0, 28);
        if (!t) return fail(i, 'Type a hint first.');
        if (words(t).length > 3) return fail(i, 'Use one word, or at most three.');
        const w = s.words[i];
        const lw = t.toLowerCase();
        if (w && (lw.includes(w.toLowerCase()) || (lw.length >= 4 && w.toLowerCase().includes(lw)))) return fail(i, 'You cannot say your own word.');
        if (allDescs().some(d => d.t.toLowerCase() === lw)) return fail(i, 'That hint was already used.');
        s.descs[s.descs.length - 1].push({ s: i, t });
        s.cur++;
        if (s.cur >= s.order.length) startVote(); else { s.dl = s.timer ? now() + s.timer * 1000 : 0; sched(1800, 2500); }
        return true;
      }
      if (s.phase === 'vote') {
        if (a.k !== 'vote' || !s.alive[i] || s.ballots[i] !== undefined) return false;
        const t = a.to;
        if (!Number.isInteger(t) || t === i || !s.alive[t] || (s.cand && !s.cand.includes(t))) return fail(i, 'Pick another player.');
        s.ballots[i] = t;
        if (aliveIdx().every(j => s.ballots[j] !== undefined)) tally();
        return true;
      }
      if (s.phase === 'mw') {
        if (a.k !== 'guess' || i !== s.elim) return false;
        const g = String(a.w || '').trim().toLowerCase();
        if (!g) return fail(i, 'Type your guess.');
        const ok = g === s.civW.toLowerCase();
        s.mwGuess = { w: g, ok };
        if (ok) endGame('mw', { mwOk: true }); else { s.phase = 'reveal'; s.ready = {}; seats.forEach((x, j) => { if (x.bot || !s.alive[j]) s.ready[j] = true; }); s.dl = now() + 9000; s.at = now() + 1000; }
        return true;
      }
      if (s.phase === 'reveal') {
        if (a.k === 'ready') { s.ready[i] = true; if (seats.every((x, j) => s.ready[j])) afterElim(); return true; }
        return false;
      }
      return false;
    };

    E.tick = function (t) {
      const ph = s.phase;
      if (ph === 'over' || ph === 'series') return false;
      if (ph === 'deal') {
        if (t >= s.dl) { startDesc(); return true; }
        return false;
      }
      if (ph === 'desc') {
        const who = s.order[s.cur];
        if (seats[who].bot) {
          if (t < s.at) return false;
          const d = botDescribe(who);
          s.descs[s.descs.length - 1].push({ s: who, t: d });
          s.cur++;
          if (s.cur >= s.order.length) startVote(); else { s.dl = s.timer ? t + s.timer * 1000 : 0; sched(1500, 2200); }
          return true;
        }
        if (s.dl && t >= s.dl) {
          s.descs[s.descs.length - 1].push({ s: who, t: '(passed)' });
          s.cur++;
          if (s.cur >= s.order.length) startVote(); else { s.dl = s.timer ? t + s.timer * 1000 : 0; sched(800, 800); }
          return true;
        }
        return false;
      }
      if (ph === 'vote') {
        if (t >= s.dl) { aliveIdx().forEach(i => { if (s.ballots[i] === undefined) s.ballots[i] = -1; }); tally(); return true; }
        if (t < s.at) return false;
        const pend = aliveIdx().filter(i => seats[i].bot && s.ballots[i] === undefined);
        if (!pend.length) return false;
        const b = pend[0];
        s.ballots[b] = botVote(b);
        sched(900, 1500);
        if (aliveIdx().every(j => s.ballots[j] !== undefined)) tally();
        return true;
      }
      if (ph === 'mw') {
        if (seats[s.elim].bot) {
          if (t < s.at) return false;
          const g = botMwGuess();
          const ok = g === s.civW.toLowerCase();
          s.mwGuess = { w: g, ok };
          if (ok) endGame('mw', { mwOk: true }); else { s.phase = 'reveal'; s.ready = {}; seats.forEach((x, j) => { if (x.bot || !s.alive[j]) s.ready[j] = true; }); s.dl = t + 9000; s.at = t + 1000; }
          return true;
        }
        if (t >= s.dl) {
          s.mwGuess = { w: '(no guess)', ok: false };
          s.phase = 'reveal'; s.ready = {}; seats.forEach((x, j) => { if (x.bot || !s.alive[j]) s.ready[j] = true; }); s.dl = t + 9000; s.at = t + 1000;
          return true;
        }
        return false;
      }
      if (ph === 'reveal') {
        if (t >= s.dl || seats.every((x, j) => s.ready[j])) { afterElim(); return true; }
        return false;
      }
      return false;
    };

    E.view = function (i) {
      const v = { g: 'uc', phase: s.phase, me: i, lead: lead(i), game: s.games, games: s.gamesTotal, round: s.round, scores: s.scores, err: s.errs[i] || null, n };
      v.players = seats.map((x, j) => ({ n: x.name, bot: x.bot, you: j === i, alive: s.alive[j], rdy: !!s.ready[j] }));
      v.word = s.words[i]; v.mw = s.roles[i] === 'mw';
      v.descs = s.descs; v.order = s.order; v.cur = s.cur;
      v.timer = s.timer;
      if (s.dl) v.tl = Math.max(0, s.dl - now());
      v.elims = s.elims; v.counts = { civ: n - s.ucCount - (s.roles.includes('mw') ? 1 : 0), uc: s.ucCount, mw: s.roles.includes('mw') ? 1 : 0 };
      if (s.phase === 'vote') { v.voted = Object.keys(s.ballots).map(Number); v.cand = s.cand; v.mine = s.ballots[i] === undefined ? null : s.ballots[i]; v.tie = !!s.cand; }
      if (s.phase === 'mw') { v.elim = s.elim; }
      if (s.phase === 'reveal' || s.phase === 'mw' || s.phase === 'over') {
        v.lastVotes = s.lastVotes;
        if (s.elim >= 0 && s.phase !== 'mw') { v.elim = s.elim; v.elimRole = s.roles[s.elim]; }
        v.mwGuess = s.mwGuess;
      }
      if (s.phase === 'over' || s.phase === 'series') {
        v.result = s.result; v.roles = s.roles; v.words = s.words; v.civW = s.civW; v.ucW = s.ucW;
      }
      return v;
    };
    deal();
    return E;
  }

  const UC_HOW = `<p class="k">Undercover</p><h3>How to play</h3>
<ul>
<li>Everyone gets a secret word. <b>Civilians</b> share one word; the <b>undercover</b> players get a similar but different word. Nobody is told their role, so you must work out if you are in the minority.</li>
<li>With 5 or more players there can also be <b>Mr. White</b>: no word at all, bluffing from the others' hints.</li>
<li>Each round, everyone in turn types <b>one hint</b> (one word, up to three). You cannot say your own word and cannot repeat a hint.</li>
<li>After the hints, everyone <b>votes</b> to eliminate a suspect. A tie leads to a runoff between the tied players. The eliminated player's role is revealed.</li>
<li>If <b>Mr. White</b> is voted out, they get one guess at the civilians' word. A correct guess wins the game for Mr. White.</li>
<li>Civilians win when every undercover and Mr. White are out. The imposters win when they equal the civilians in number.</li>
<li><b>Points:</b> civilians +2 each, undercover +10, Mr. White +6 (+6 for a correct final guess).</li>
</ul>`;

  function ucMenu(o) {
    const sel = (k, arr, def, f) => `<select class="uc-in" data-o="${k}">${arr.map(x => `<option value="${x}"${(o[k] === undefined || o[k] === '' ? def : +o[k]) === x ? ' selected' : ''}>${f ? f(x) : x}</option>`).join('')}</select>`;
    return `<h2>Undercover</h2>
<p class="sub">Everyone has a secret word, but one of you has a different one. Give hints, find the odd one out, and do not give your word away.</p>
<div class="uc-card"><h4>3 to 12 players</h4>
<button class="uc-btn wide" data-a="online">Play online</button>
<button class="uc-btn alt wide" data-a="practice">Practice with bots</button>
<div class="uc-row"><span>Practice players (you + bots)</span>${sel('size', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 6)}</div>
<div class="uc-row"><span>Undercover players</span>${sel('uc', [0, 1, 2, 3], 0, x => (x ? x : 'Auto'))}</div>
<div class="uc-row"><span>Mr. White (5+ players)</span><input type="checkbox" class="uc-chk" data-o="mw"${o.mw ? ' checked' : ''}></div>
<div class="uc-row"><span>Hint time</span>${sel('timer', [0, 30, 60, 90], 60, x => (x ? x + ' s' : 'No limit'))}</div>
<div class="uc-row"><span>Games</span>${sel('rounds', [1, 3, 5], 3)}</div></div>
<button class="uc-btn alt sm" data-a="how">How to play</button>`;
  }

  const UC_ROLE = { civ: 'Civilian', uc: 'Undercover', mw: 'Mr. White' };

  function ucUi(el, ctl) {
    const api = ctl.api;
    el.innerHTML = `<div class="uc-top"><span class="uc-chip on">UNDERCOVER</span><span class="uc-chip uc-rd"></span><span class="grow"></span><span class="uc-tm" data-tm>--</span><span class="grow"></span><span class="uc-net"><i></i><span>Practice</span></span><button class="uc-btn alt sm" data-a="how">Rules</button><button class="uc-btn alt sm" data-a="leave">Menu</button></div>
<div class="uc-stage"><div class="uc-left"></div><div class="uc-right"></div></div><div class="uc-over" hidden></div>`;
    const leftEl = el.querySelector('.uc-left'), rightEl = el.querySelector('.uc-right'), rdEl = el.querySelector('.uc-rd'), overEl = el.querySelector('.uc-over'), stageEl = el.querySelector('.uc-stage');
    let V = null, prev = null, lastErr = 0, draft = { t: '', g: '', hide: false }, counted = '';
    const nm = (v, i) => (i >= 0 && v.players[i] ? v.players[i].n : '?');

    function myCard(v) {
      const c = v.counts, mix = `${c.civ} civilians · ${c.uc} undercover${c.mw ? ' · 1 Mr. White' : ''}`;
      if (v.mw) return `<div class="uc-me mw"><small>YOUR WORD</small><b>No word</b><span>You are <b>Mr. White</b>. Listen to the hints, blend in. If you are voted out, guess the civilians' word to win.</span><span class="mix">${mix}</span></div>`;
      if (draft.hide) return `<div class="uc-me"><small>YOUR WORD</small><b>Hidden</b><button class="uc-btn alt sm" data-a="peek">Show word</button><span class="mix">${mix}</span></div>`;
      return `<div class="uc-me"><small>YOUR WORD</small><b class="w">${esc(v.word)}</b><span>You might be a civilian or an undercover. Compare the hints to find out.</span><button class="uc-btn alt sm" data-a="peek">Hide word</button><span class="mix">${mix}</span></div>`;
    }
    function panel(v) {
      const me = v.players[v.me], ph = v.phase;
      if (ph === 'deal') {
        const k = v.players.filter(p => p.rdy).length;
        return `<div class="uc-turn mine"><b>New game: memorise your word</b><p class="uc-q">Nobody knows who the undercover is, not even the undercover. Press ready when you have it.</p>${me.rdy ? `<p class="uc-q">Waiting for the others (${k}/${v.n})...</p>` : '<div class="uc-form"><button class="uc-btn good" data-a="ready">I am ready</button></div>'}</div>`;
      }
      if (ph === 'desc') {
        const sp = v.order[v.cur];
        if (sp === v.me) return `<div class="uc-turn mine"><b>Your turn: give a hint</b><p class="uc-q">One word (up to three) that fits your word without giving it away.</p><div class="uc-form"><input class="uc-in" data-k="t" maxlength="28" placeholder="Your hint" autocomplete="off" value="${esc(draft.t)}"><button class="uc-btn good" data-a="say">Say it</button></div></div>`;
        return `<div class="uc-turn"><b>${esc(nm(v, sp))}</b> is thinking of a hint...${v.cur > 0 ? `<p class="uc-q">${v.cur} of ${v.order.length} done this round.</p>` : ''}</div>`;
      }
      if (ph === 'vote') {
        const can = me.alive && v.mine === null;
        const who = v.tie ? `Tie! Runoff between ${v.cand.map(i => esc(nm(v, i))).join(' and ')}.` : 'Who is the odd one out?';
        return `<div class="uc-turn vote"><b>Vote to eliminate</b><p class="uc-q">${who}</p><p class="uc-q">${!me.alive ? 'You are out. Watch the vote.' : can ? 'Press Vote next to a player.' : v.mine === -1 ? 'You did not vote.' : `You voted for <b>${esc(nm(v, v.mine))}</b>. Waiting (${v.voted.length}/${v.players.filter(p => p.alive).length})...`}</p></div>`;
      }
      if (ph === 'mw') {
        if (v.elim === v.me) return `<div class="uc-turn mine"><b>You were voted out, Mr. White!</b><p class="uc-q">Guess the civilians' word. If you are right you win.</p><div class="uc-form"><input class="uc-in" data-k="g" maxlength="30" placeholder="The civilians' word" autocomplete="off" value="${esc(draft.g)}"><button class="uc-btn good" data-a="guess">Guess</button></div></div>`;
        return `<div class="uc-turn vote"><b>${esc(nm(v, v.elim))} was Mr. White!</b><p class="uc-q">One last chance: they are guessing the civilians' word...</p></div>`;
      }
      if (ph === 'reveal') {
        const e = v.elim, tally = {};
        Object.keys(v.lastVotes || {}).forEach(k => { const t = v.lastVotes[k]; if (t >= 0) (tally[t] = tally[t] || []).push(nm(v, +k)); });
        const rows = Object.keys(tally).map(t => `<div class="uc-vt"><b>${esc(nm(v, +t))}</b> <span>${tally[t].map(esc).join(', ')}</span></div>`).join('');
        const g = v.mwGuess ? `<p class="uc-q">Mr. White guessed <b>${esc(v.mwGuess.w)}</b>: wrong.</p>` : '';
        return `<div class="uc-turn vote"><b>${esc(nm(v, e))} is out: ${UC_ROLE[v.elimRole]}</b>${g}<div class="uc-votes">${rows}</div>${me.rdy ? '<p class="uc-q">Waiting for the others...</p>' : '<div class="uc-form"><button class="uc-btn good" data-a="ready">Continue</button></div>'}</div>`;
      }
      return '';
    }
    function playersHtml(v) {
      const out = {};
      (v.elims || []).forEach(e => { out[e.i] = e.role; });
      const cur = v.phase === 'desc' ? v.order[v.cur] : -1;
      return `<div class="uc-pl">${v.players.map((p, i) => {
        const hints = [];
        v.descs.forEach(r => r.forEach(d => { if (d.s === i) hints.push(`<i${d.t === '(passed)' ? ' class="ps"' : ''}>${esc(d.t)}</i>`); }));
        let tag = '';
        if (!p.alive) tag = `<em class="o">${out[i] ? UC_ROLE[out[i]] : 'Out'}</em>`;
        else if (i === cur) tag = '<em>hinting</em>';
        else if (v.phase === 'vote') tag = (v.voted || []).includes(i) ? '<em class="b">voted</em>' : '';
        const canVote = v.phase === 'vote' && v.players[v.me].alive && v.mine === null && p.alive && i !== v.me && (!v.cand || v.cand.includes(i));
        return `<div class="uc-p${p.you ? ' you' : ''}${p.alive ? '' : ' dead'}${i === cur ? ' cur' : ''}"><div class="h">${avatar(p.n, i, p.bot)}<span class="nm">${esc(p.n)}${p.you ? ' (you)' : ''}</span>${tag}<span class="sc">${v.scores[i]}</span>${canVote ? `<button class="uc-btn sm warn" data-a="vote" data-i="${i}">Vote</button>` : ''}</div>${hints.length ? `<div class="hs">${hints.join('')}</div>` : ''}</div>`;
      }).join('')}</div>`;
    }
    function renderOver(v) {
      const R = v.result, rows = v.players.map((p, i) => ({ p, i })).sort((a, b) => v.scores[b.i] - v.scores[a.i]);
      if (v.phase === 'series') {
        const top = Math.max(...v.scores), tops = rows.filter(r => v.scores[r.i] === top);
        overEl.innerHTML = `<div class="uc-box"><p class="k">Final standings</p><h3>${tops.map(r => esc(r.p.n)).join(' & ')} win${tops.length > 1 ? '' : 's'}!</h3><div class="uc-score">${rows.map(r => `<div class="${v.scores[r.i] === top ? 'top' : ''}">${avatar(r.p.n, r.i, r.p.bot)}<span class="nm">${esc(r.p.n)}</span><b>${v.scores[r.i]}</b></div>`).join('')}</div><div class="uc-orow">${v.lead ? '<button class="uc-btn good" data-a="restart">Play again</button>' : '<span class="uc-hint">Waiting for the host...</span>'}${ctl.canLobby ? '<button class="uc-btn alt" data-a="lobby">Back to lobby</button>' : ''}</div></div>`;
        return;
      }
      const head = R.win === 'civ' ? 'The civilians win!' : R.win === 'mw' ? 'Mr. White guessed the word!' : 'The imposters win!';
      const won = (R.pts[v.me] || 0) > 0;
      overEl.innerHTML = `<div class="uc-box"><p class="k">Game ${v.game} of ${v.games}</p><h3 class="${won ? 'w' : 'l'}">${head}</h3><p>Civilians had <b>${esc(v.civW)}</b>. Undercover had <b>${esc(v.ucW)}</b>.${R.mwOk ? ' Mr. White got it right.' : ''}</p>
<div class="uc-roles">${v.players.map((p, i) => `<div class="${v.roles[i]}">${avatar(p.n, i, p.bot)}<span class="nm">${esc(p.n)}</span><em>${UC_ROLE[v.roles[i]]}${v.words[i] ? ': ' + esc(v.words[i]) : ''}</em><b>${R.pts[i] ? '+' + R.pts[i] : ''}</b></div>`).join('')}</div>
<div class="uc-orow">${v.lead ? `<button class="uc-btn good" data-a="next">${v.game >= v.games ? 'Final results' : 'Next game'}</button>` : '<span class="uc-hint">Waiting for the host...</span>'}</div></div>`;
    }
    function say() {
      const i = leftEl.querySelector('[data-k="t"]'), t = i ? i.value : draft.t;
      ctl.send({ k: 'say', t }); draft.t = '';
    }

    return {
      update(v) {
        V = v;
        if (v.err && v.err.id !== lastErr) { lastErr = v.err.id; ctl.toast(v.err.m); api.sfx('bad'); }
        if (prev && prev.game !== v.game) { draft.t = ''; draft.g = ''; }
        ctl.keep(() => {
          rdEl.textContent = `Game ${v.game}/${v.games}` + (v.round ? ` · Round ${v.round}` : '');
          const over = v.phase === 'over' || v.phase === 'series';
          overEl.hidden = !over;
          if (over) renderOver(v);
          leftEl.innerHTML = myCard(v) + `<div class="uc-turnbox">${panel(v)}</div>`;
          rightEl.innerHTML = `<div class="uc-lgt">Players and hints</div>${playersHtml(v)}`;
          stageEl.classList.toggle('dim', over);
        });
        if ((v.phase === 'over' || v.phase === 'series') && (!prev || prev.phase !== v.phase)) { try { overEl.firstChild.scrollIntoView({ block: 'center' }); } catch (e) {} }
        if (prev && v.phase === 'desc' && prev.phase === 'desc' && (v.cur !== prev.cur || v.round !== prev.round)) api.sfx('pop');
        if (v.phase === 'vote' && (!prev || prev.phase !== 'vote')) api.sfx('tick');
        if ((v.phase === 'reveal' || v.phase === 'mw') && (!prev || prev.phase !== v.phase)) api.sfx(v.phase === 'mw' ? 'hit' : (v.elimRole === 'civ' ? 'bad' : 'good'));
        if ((v.phase === 'over' || v.phase === 'series') && (!prev || prev.phase !== v.phase) && v.phase === 'over') {
          api.sfx((v.result.pts[v.me] || 0) > 0 ? 'win' : 'lose');
          const key = v.game + ':' + v.result.win;
          if (counted !== key) { counted = key; ctl.score(v.scores[v.me]); ctl.submit(v.scores[v.me]); }
        }
        prev = v;
      },
      input(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (k === 't') draft.t = e.target.value;
        else if (k === 'g') draft.g = e.target.value;
      },
      keydown(e) {
        const k = e.target.dataset && e.target.dataset.k;
        if (e.key === 'Enter' && (k === 't' || k === 'g')) { e.preventDefault(); this.click(k === 't' ? 'say' : 'guess'); }
      },
      click(a, b) {
        if (!V) return;
        if (a === 'say') say();
        else if (a === 'guess') {
          const i = leftEl.querySelector('[data-k="g"]');
          ctl.send({ k: 'guess', w: i ? i.value : draft.g }); draft.g = '';
        } else if (a === 'ready') ctl.send({ k: 'ready' });
        else if (a === 'vote') ctl.send({ k: 'vote', to: +b.dataset.i });
        else if (a === 'peek') { draft.hide = !draft.hide; this.update(V); }
        else if (a === 'next') ctl.send({ k: 'next' });
        else if (a === 'restart') ctl.send({ k: 'restart' });
        else if (a === 'lobby') ctl.lobby();
      }
    };
  }

  const ucCss = `
.gm-undercover{--bg1:#08141a;--bg2:#183841;--panel:rgba(255,255,255,.06);--panel2:rgba(255,255,255,.11);--ink:#eaf6f3;--mut:#9fb8b6;--line:rgba(255,255,255,.13);--acc:#5ee0c0;--acc-ink:#04241c}
.gm-undercover .uc-menu h2{color:var(--acc);text-shadow:0 3px 0 rgba(0,0,0,.4)}
.gm-undercover .uc-chk{width:24px;height:24px;accent-color:var(--acc)}
.gm-undercover .uc-top .uc-tm{font-size:26px}
.gm-undercover .uc-stage{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:12px;padding:12px}
.gm-undercover .uc-stage.dim{opacity:.35;pointer-events:none}
.gm-undercover .uc-left,.gm-undercover .uc-right{display:flex;flex-direction:column;gap:9px;min-width:0}
.gm-undercover .uc-me{border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;background:linear-gradient(135deg,#1f5c58,#0f2f33);border:2px solid rgba(94,224,192,.5)}
.gm-undercover .uc-me small{font:900 10px var(--sans);letter-spacing:.14em;color:rgba(255,255,255,.7)}
.gm-undercover .uc-me b{font:900 24px/1.1 var(--sans)}
.gm-undercover .uc-me b.w{font-size:34px;letter-spacing:.01em;text-transform:capitalize;color:#fff}
.gm-undercover .uc-me span{font:700 13.5px/1.4 var(--sans);color:rgba(255,255,255,.88)}
.gm-undercover .uc-me .mix{font-size:11.5px;color:var(--mut)}
.gm-undercover .uc-me .uc-btn{align-self:flex-start}
.gm-undercover .uc-me.mw{background:linear-gradient(135deg,#e9ecef,#98a3ab);border-color:#fff;color:#14202a}
.gm-undercover .uc-me.mw small,.gm-undercover .uc-me.mw span,.gm-undercover .uc-me.mw b{color:#14202a}
.gm-undercover .uc-turnbox{min-height:20px}
.gm-undercover .uc-turn{border-radius:14px;padding:11px 13px;background:var(--panel2);display:block;font:700 14px/1.4 var(--sans)}
.gm-undercover .uc-turn>*+*{margin-top:7px}
.gm-undercover .uc-turn.mine{background:linear-gradient(#1b4a4c,#143036);box-shadow:inset 0 0 0 2px var(--acc)}
.gm-undercover .uc-turn.vote{box-shadow:inset 0 0 0 2px #ff6b5a;background:linear-gradient(#3b2030,#2a1523)}
.gm-undercover .uc-q{margin:0;font:600 13.5px/1.4 var(--sans);color:var(--ink)}
.gm-undercover .uc-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.gm-undercover .uc-form .uc-in{flex:1 1 150px}
.gm-undercover .uc-votes{display:flex;flex-direction:column;gap:3px}
.gm-undercover .uc-vt{font:700 13px var(--sans)}
.gm-undercover .uc-vt span{color:var(--mut);font-weight:600}
.gm-undercover .uc-lgt{font:900 11px var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
.gm-undercover .uc-hint{font:700 11px var(--sans);color:var(--mut)}
.gm-undercover .uc-pl{display:flex;flex-direction:column;gap:6px}
.gm-undercover .uc-p{padding:6px 9px;border-radius:12px;background:var(--panel);display:flex;flex-direction:column;gap:5px;min-width:0}
.gm-undercover .uc-p.you{box-shadow:inset 0 0 0 2px var(--acc)}
.gm-undercover .uc-p.cur{background:var(--panel2);box-shadow:inset 0 0 0 2px #ffd36a}
.gm-undercover .uc-p.dead{opacity:.5}
.gm-undercover .uc-p .h{display:flex;align-items:center;gap:7px;font:800 13.5px var(--sans);min-width:0}
.gm-undercover .uc-p .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-undercover .uc-p.dead .nm{text-decoration:line-through}
.gm-undercover .uc-p em{font:900 9px var(--sans);font-style:normal;padding:2px 6px;border-radius:6px;background:#ffd36a;color:#241800;text-transform:uppercase;letter-spacing:.05em}
.gm-undercover .uc-p em.b{background:#6aa7ff}
.gm-undercover .uc-p em.o{background:#ff6b5a;color:#fff}
.gm-undercover .uc-p .sc{font:900 15px var(--sans);color:var(--acc);min-width:16px;text-align:right}
.gm-undercover .uc-p .hs{display:flex;gap:5px;flex-wrap:wrap}
.gm-undercover .uc-p .hs i{font:800 12.5px var(--sans);font-style:normal;padding:2px 9px;border-radius:99px;background:rgba(94,224,192,.18);border:1px solid rgba(94,224,192,.4)}
.gm-undercover .uc-p .hs i.ps{opacity:.5}
.gm-undercover .uc-over{position:absolute;inset:0;z-index:25;display:flex;align-items:flex-start;justify-content:center;padding:14px;background:rgba(4,10,14,.8);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);overflow:auto}
.gm-undercover .uc-box{width:100%;max-width:560px;margin:0 auto;position:sticky;top:14px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.5);animation:uc-in .35s cubic-bezier(.2,1.3,.4,1)}
.gm-undercover .uc-box h3{margin:0;font:900 26px var(--sans)}
.gm-undercover .uc-box h3.w{color:#6be39a}
.gm-undercover .uc-box h3.l{color:#ff8a7a}
.gm-undercover .uc-box p{margin:0;font:600 14px/1.5 var(--sans)}
.gm-undercover .uc-box .k{font:900 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
.gm-undercover .uc-roles,.gm-undercover .uc-score{display:flex;flex-direction:column;gap:5px}
.gm-undercover .uc-roles>div,.gm-undercover .uc-score>div{display:flex;align-items:center;gap:8px;padding:5px 9px;border-radius:11px;background:var(--panel);font:800 13.5px var(--sans)}
.gm-undercover .uc-roles .uc{background:rgba(255,211,106,.16);box-shadow:inset 0 0 0 2px #ffd36a}
.gm-undercover .uc-roles .mw{background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 2px #fff}
.gm-undercover .uc-score .top{box-shadow:inset 0 0 0 2px var(--acc)}
.gm-undercover .uc-roles .nm,.gm-undercover .uc-score .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-undercover .uc-roles em{font:700 12px var(--sans);font-style:normal;color:var(--mut)}
.gm-undercover .uc-roles b,.gm-undercover .uc-score b{font:900 15px var(--sans);color:var(--acc);min-width:24px;text-align:right}
.gm-undercover .uc-orow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
@keyframes uc-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
@media (max-width:760px){.gm-undercover .uc-stage{grid-template-columns:minmax(0,1fr);padding:8px}}
`;

  Ameplay.register({
    id: 'undercover',
    title: 'Undercover',
    category: 'Board',
    tint: '#1d5a58',
    blurb: 'Everyone has a secret word, but one player has a slightly different one. Give hints, find the odd one out, beware Mr. White.',
    help: 'Type one-word hints in turn · vote out the suspect · Mr. White (no word) gets a last guess · 3 to 12 players online, bots fill seats',
    better: 'high',
    format: v => v + ' pts',
    width: 1040,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 26c0-8 10-12 22-12s22 4 22 12c0 12-8 24-22 24S10 38 10 26z"/><path d="M16 28c4-4 10-4 12 0-2 4-8 4-12 0zM48 28c-4-4-10-4-12 0 2 4 8 4 12 0z"/><path d="M26 42c4 2 8 2 12 0"/></svg>',
    css: baseCss('undercover', 'uc') + waitCss('undercover', 'uc') + ucCss,
    mount(root, api) {
      return runTable(root, api, {
        p: 'uc', defaults: { size: 6, uc: 0, mw: false, timer: 60, rounds: 3 }, pmin: 3, pmax: 12, pdef: 6, max: 12,
        how: UC_HOW, menu: ucMenu, ui: ucUi, create: ucCreate,
        room: () => ({ title: 'Undercover', sizes: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], defaultSize: 6, min: 3, max: 12, bots: true })
      });
    }
  });
})();
