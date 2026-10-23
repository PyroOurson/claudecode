
(() => {
  'use strict';
  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">';
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const timers = api => {
    let ids = [];
    return { later: (fn, ms) => { ids.push(api.timeout(fn, ms)); }, clear: () => { ids.forEach(clearTimeout); ids = []; } };
  };

  const tap = (el, fn) => {
    el.addEventListener('pointerdown', e => { if (e.button) return; el._pd = true; fn(e); });
    el.addEventListener('click', e => { if (el._pd) { el._pd = false; return; } fn(e); });
  };

  const pick = (id, groups, cfg) => `<span class="gm-${id}-o">${groups.map(([k, label, opts]) => `<span class="gm-${id}-r"><span class="gm-${id}-l">${label}</span><span class="gm-${id}-s" data-k="${k}">${opts.map(([v, t]) => `<button type="button" data-v="${v}" aria-pressed="${String(cfg[k]) === String(v)}">${t}</button>`).join('')}</span></span>`).join('')}</span>`;
  const pickCss = id => `
.gm-${id}-o{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:16px}
.gm-${id}-r{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center}
.gm-${id}-l{font-size:10.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);min-width:44px;text-align:right}
.gm-${id}-s{display:inline-flex;padding:4px;gap:2px;border-radius:999px;background:var(--sunk);box-shadow:inset 0 1px 2px rgba(31,29,43,.08)}
.gm-${id}-s button{border:0;background:none;padding:8px 13px;border-radius:999px;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
.gm-${id}-s button:hover{color:var(--ink)}
.gm-${id}-s button[aria-pressed="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
@media (pointer:coarse){.gm-${id}-s button{min-height:40px}}
.gm-${id} .chip{padding:5px 12px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font:900 11.5px/1.2 var(--sans);letter-spacing:.06em;text-transform:uppercase}`;
  const bindPick = (api, root, id, cfg, onChange) => {
    const frame = root.parentElement || root;
    api.on(frame, 'mousedown', e => { if (e.target.closest(`.gm-${id}-s button`)) e.preventDefault(); });
    api.on(frame, 'click', e => {
      const b = e.target.closest(`.gm-${id}-s button`);
      if (!b) return;
      const k = b.parentNode.dataset.k;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (String(cfg[k]) === b.dataset.v) return;
      cfg[k] = b.dataset.v; api.save(cfg); api.sfx('tick');
      if (onChange) onChange(k);
    });
  };
  const onPause = (api, pause, resume) => {
    let was = false;
    api.interval(() => { if (api.paused === was) return; was = api.paused; (was ? pause : resume)(); }, 80);
  };
  const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  const SHAPES = [
    ['Circle', '<circle cx="20" cy="20" r="13" fill="#ef4444"/>'],
    ['Triangle', '<path d="M20 7 33 31H7z" fill="#ff9f1c" stroke="#ff9f1c" stroke-width="3" stroke-linejoin="round"/>'],
    ['Square', '<rect x="8" y="8" width="24" height="24" rx="5" fill="#22c55e"/>'],
    ['Star', '<path d="M20 5.5l4.3 9.2 10 1.1-7.5 6.8 2.1 9.9L20 27.4l-8.9 5.1 2.1-9.9-7.5-6.8 10-1.1z" fill="#facc15" stroke="#eab308" stroke-width="1.5" stroke-linejoin="round"/>'],
    ['Hexagon', '<path d="M20 5l13 7.5v15L20 35 7 27.5v-15z" fill="#3b82f6"/>'],
    ['Heart', '<path d="M20 34S6 25.5 6 15.5A7.5 7.5 0 0 1 20 11a7.5 7.5 0 0 1 14 4.5C34 25.5 20 34 20 34z" fill="#ff4d8d"/>'],
    ['Diamond', '<path d="M20 4 34 20 20 36 6 20z" fill="#a855f7"/>'],
    ['Moon', '<path d="M27 6.5A14 14 0 1 0 33.5 27 11 11 0 0 1 27 6.5z" fill="#6366f1"/>'],
    ['Plus', '<path d="M15 6h10v9h9v10h-9v9H15v-9H6V15h9z" fill="#14b8a6" stroke="#14b8a6" stroke-width="2" stroke-linejoin="round"/>'],
    ['Drop', '<path d="M20 4C20 4 9 17 9 24a11 11 0 0 0 22 0C31 17 20 4 20 4z" fill="#38bdf8"/>'],
    ['Bolt', '<path d="M23 3 8 23h10l-3 14 17-21H21z" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>'],
    ['Flower', '<g fill="#e879f9"><circle cx="20" cy="10.5" r="6.5"/><circle cx="29.5" cy="17.5" r="6.5"/><circle cx="26" cy="28.5" r="6.5"/><circle cx="14" cy="28.5" r="6.5"/><circle cx="10.5" cy="17.5" r="6.5"/></g><circle cx="20" cy="20.5" r="5" fill="#fde047"/>'],
    ['Ring', '<circle cx="20" cy="20" r="11" fill="none" stroke="#84cc16" stroke-width="7"/>'],
    ['Pentagon', '<path d="M20 5 35 16l-5.7 18H10.7L5 16z" fill="#fb7185" stroke="#fb7185" stroke-width="2" stroke-linejoin="round"/>'],
    ['Arrow', '<path d="M20 4 35 19H26v16H14V19H5z" fill="#1d4ed8" stroke="#1d4ed8" stroke-width="2" stroke-linejoin="round"/>'],
    ['Cloud', '<path d="M12 31a7 7 0 0 1-1-13.9A9 9 0 0 1 28.5 14 7.5 7.5 0 0 1 29 31z" fill="#94a3b8"/>'],
    ['Leaf', '<path d="M7 33C7 15 17 7 33 7c0 16-8 26-26 26z" fill="#15803d"/><path d="M9 31 24 16" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round"/>'],
    ['Spade', '<path d="M20 5S6 15 6 22.5a7 7 0 0 0 12 5L16 35h8l-2-7.5a7 7 0 0 0 12-5C34 15 20 5 20 5z" fill="#334155"/>']
  ];
  const SHINE = '<ellipse cx="14" cy="15" rx="2.2" ry="3.6" fill="#fff" opacity=".45" transform="rotate(25 14 15)"/>';
  const FRUIT = [
    ['Apple', '<path d="M20 13c-3-2.5-11-2-11 7 0 8 5 14 8 14 1.5 0 2-1 3-1s1.5 1 3 1c3 0 8-6 8-14 0-9-8-9.5-11-7z" fill="#ef4444"/><path d="M20 13c0-3 1-5 3-7" stroke="#7c4a1e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 9c2-3 6-3 7-2-1 3-5 3-7 2z" fill="#22c55e"/>' + SHINE],
    ['Cherries', '<path d="M14 26C16 16 20 10 26 6M27 25C25 16 25 11 26 6" stroke="#4d7c0f" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="13" cy="28" r="7" fill="#dc2626"/><circle cx="27.5" cy="27" r="7" fill="#e11d48"/><circle cx="11" cy="26" r="1.8" fill="#fff" opacity=".6"/><circle cx="25.5" cy="25" r="1.8" fill="#fff" opacity=".6"/><path d="M26 6c3-1 6 0 7 2-3 1-5 0-7-2z" fill="#22c55e"/>'],
    ['Banana', '<path d="M9 9c1 14 9 21 25 19-2 3-6 5-11 5C12 33 5 23 6 10z" fill="#facc15" stroke="#eab308" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 10 6 6.5l3.5 2z" fill="#78350f"/>'],
    ['Grapes', '<path d="M20 9c0-2 1-4 3-5" stroke="#65a30d" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M21 8c3-2 7-1 8 1-3 2-6 1-8-1z" fill="#22c55e"/><g fill="#8b5cf6"><circle cx="14" cy="14" r="5"/><circle cx="25" cy="14" r="5"/><circle cx="19.5" cy="21" r="5"/><circle cx="29.5" cy="21" r="4.5"/><circle cx="9.5" cy="21" r="4.5"/><circle cx="14.5" cy="28" r="5"/><circle cx="24.5" cy="28" r="5"/><circle cx="19.5" cy="34" r="4.5"/></g><g fill="#c4b5fd"><circle cx="12.5" cy="12.5" r="1.4"/><circle cx="18" cy="19.5" r="1.4"/><circle cx="13" cy="26.5" r="1.4"/></g>'],
    ['Lemon', '<ellipse cx="20" cy="20" rx="14" ry="10.5" fill="#fde047" stroke="#eab308" stroke-width="1.5" transform="rotate(-25 20 20)"/><path d="M6.5 27 5 29.5M33.5 13 35 10.5" stroke="#eab308" stroke-width="3" stroke-linecap="round"/><ellipse cx="15" cy="17" rx="4" ry="2" fill="#fff" opacity=".55" transform="rotate(-25 15 17)"/>'],
    ['Orange', '<circle cx="20" cy="22" r="13" fill="#fb923c"/><path d="M20 9c3-3 7-3 9-1-3 3-6 3-9 1z" fill="#16a34a"/><g fill="#ea580c"><circle cx="16" cy="21" r="1"/><circle cx="25" cy="25" r="1"/><circle cx="20" cy="29" r="1"/><circle cx="27" cy="18" r="1"/></g>' + SHINE],
    ['Pear', '<path d="M20 9c-3 0-4 3-4 6 0 3-6 6-6 12a10 10 0 0 0 20 0c0-6-6-9-6-12 0-3-1-6-4-6z" fill="#a3e635"/><path d="M20 9V4.5" stroke="#78350f" stroke-width="2" stroke-linecap="round"/><path d="M21 7c2-2 5-2 6 0-2 2-4 1-6 0z" fill="#16a34a"/><ellipse cx="15" cy="26" rx="2" ry="3.5" fill="#fff" opacity=".45"/>'],
    ['Strawberry', '<path d="M8 15c0-3 5-4 12-4s12 1 12 4c0 9-7 19-12 20-5-1-12-11-12-20z" fill="#ef4444"/><path d="M11 12l4-5 2 4 3-5 3 5 2-4 4 5c-5 2-13 2-18 0z" fill="#22c55e"/><g fill="#fde68a"><circle cx="14" cy="19" r="1.1"/><circle cx="20" cy="18" r="1.1"/><circle cx="26" cy="19" r="1.1"/><circle cx="17" cy="25" r="1.1"/><circle cx="23" cy="25" r="1.1"/><circle cx="20" cy="31" r="1.1"/></g>'],
    ['Watermelon', '<path d="M4 12a16 16 0 0 0 32 0z" fill="#22c55e"/><path d="M7.5 12a12.5 12.5 0 0 0 25 0z" fill="#f43f5e"/><g fill="#1f2937"><ellipse cx="14" cy="17" rx="1" ry="1.7"/><ellipse cx="20" cy="20" rx="1" ry="1.7"/><ellipse cx="26" cy="17" rx="1" ry="1.7"/><ellipse cx="17" cy="23" rx="1" ry="1.7"/><ellipse cx="23" cy="23" rx="1" ry="1.7"/></g>'],
    ['Pineapple', '<path d="M20 15l-6-9 5 3 1-6 1 6 5-3z" fill="#16a34a"/><ellipse cx="20" cy="26" rx="9" ry="11" fill="#f59e0b"/><path d="M13 20l13 12M27 20 14 32M12 26l7 8M28 26l-7 8M13 18l3 1M27 18l-3 1" stroke="#b45309" stroke-width="1.3" opacity=".75"/>'],
    ['Carrot', '<path d="M26 12c3 3 3 5 1 7L10 34c-1.5 1-3-.5-2-2L22 13c2-2 4-2 4-1z" fill="#fb923c"/><path d="M25 13l5-7M27 15l7-3M24 12l1-8" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round"/><path d="M14 27l3 1M18 22l3 1" stroke="#c2410c" stroke-width="1.4" stroke-linecap="round"/>'],
    ['Mushroom', '<path d="M5 21a15 13 0 0 1 30 0z" fill="#ef4444"/><rect x="15" y="21" width="10" height="13" rx="4" fill="#fef3c7" stroke="#e7d7b1"/><g fill="#fff"><circle cx="13" cy="16" r="2.5"/><circle cx="22" cy="12" r="2"/><circle cx="28" cy="17" r="2.2"/></g>'],
    ['Ice cream', '<path d="M12 21h16l-8 16z" fill="#f59e0b"/><path d="M14 24h12M16 28h8M18 32h4" stroke="#b45309" stroke-width="1"/><circle cx="20" cy="15" r="8.5" fill="#f9a8d4"/><circle cx="13.5" cy="19" r="4" fill="#f9a8d4"/><circle cx="26.5" cy="19" r="4" fill="#f9a8d4"/><circle cx="20" cy="6" r="2.6" fill="#dc2626"/>'],
    ['Donut', '<circle cx="20" cy="20" r="14" fill="#d97706"/><path d="M8 18a12 12 0 0 1 24 0c0 3-2 2-3 4s-3 1-4 3-4 0-5 1-3 0-4-1-3 0-4-2-4-2-4-5z" fill="#f472b6"/><circle cx="20" cy="20" r="4.6" fill="#fff" stroke="#b45309" stroke-width="1.2"/><g stroke-width="1.8" stroke-linecap="round"><path d="M13 13l2 1" stroke="#fde047"/><path d="M25 11.5l1 2" stroke="#60a5fa"/><path d="M27.5 19l2-1" stroke="#fff"/><path d="M11.5 20.5l1-2" stroke="#4ade80"/></g>'],
    ['Pizza', '<path d="M20 36 6 9c9-4 19-4 28 0z" fill="#fcd34d"/><path d="M6 9c9-4 19-4 28 0l-1.5 3c-8-3.5-17-3.5-25 0z" fill="#d97706"/><g fill="#dc2626"><circle cx="16" cy="16" r="2.6"/><circle cx="24" cy="17" r="2.4"/><circle cx="20" cy="25" r="2.3"/></g>'],
    ['Candy', '<path d="M12 20 4 13.5v13zM28 20l8-6.5v13z" fill="#a855f7"/><circle cx="20" cy="20" r="9" fill="#f472b6"/><path d="M14.5 14.5c3 2 3 9 0 11M20 11c3 3 3 15 0 18M25.5 14.5c-3 2-3 9 0 11" stroke="#fff" stroke-width="1.8" fill="none" opacity=".8"/>'],
    ['Cookie', '<circle cx="20" cy="20" r="14" fill="#d4a373"/><circle cx="20" cy="20" r="14" fill="none" stroke="#b07d4f" stroke-width="1.5"/><g fill="#5b3a1e"><circle cx="14" cy="15" r="2"/><circle cx="24" cy="13" r="1.7"/><circle cx="26" cy="23" r="2.2"/><circle cx="16" cy="25" r="1.8"/><circle cx="20.5" cy="19" r="1.4"/></g>'],
    ['Avocado', '<path d="M20 4c-6 0-8 8-10 14-3 8 2 18 10 18s13-10 10-18C28 12 26 4 20 4z" fill="#3f6212"/><path d="M20 7c-4 0-6 6-7.5 12-2.5 7 1.5 14 7.5 14s10-7 7.5-14C26 13 24 7 20 7z" fill="#bef264"/><circle cx="20" cy="24" r="5.5" fill="#92400e"/><circle cx="18.5" cy="22.5" r="1.5" fill="#fff" opacity=".4"/>']
  ];
  const LCOL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];
  const LETTERS = 'ABCDEFGHJKMNPRSTWZ'.split('').map((c, i) => [c, `<circle cx="20" cy="20" r="16" fill="${LCOL[i % LCOL.length]}"/><path d="M8 15a13 13 0 0 1 20-9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".45"/><text x="20" y="27.5" text-anchor="middle" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="21" fill="#fff">${c}</text>`]);
  const THEMES = { shapes: [SHAPES, '#8b7bff', '#5b44e0', '#4532b8'], fruit: [FRUIT, '#ff8a7a', '#ef4a6a', '#c3304f'], letters: [LETTERS, '#38d6c4', '#13a596', '#0d7e73'] };
  const PSIZE = { '4x4': [4, 4], '5x4': [5, 4], '6x6': [6, 6] };

  Ameplay.register({
    id: 'pairs',
    title: 'Pairs',
    category: 'Memory',
    blurb: 'Flip two cards at a time and match every pair.',
    help: 'Tap two cards to flip them · <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> and <kbd>Enter</kbd> to play by keyboard · grid size and theme on the start screen',
    better: 'low',
    format: v => v + ' moves',
    width: 640,
    icon: ICON + '<rect x="8" y="13" width="22" height="31" rx="4" transform="rotate(-7 19 28.5)"/><rect x="34" y="20" width="22" height="31" rx="4" transform="rotate(7 45 35.5)"/><circle cx="19" cy="28.5" r="5"/><circle cx="45" cy="35.5" r="5"/></svg>',
    css: pickCss('pairs') + `
.gm-pairs{gap:14px}
.gm-pairs .board{touch-action:none;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:clamp(6px,1.6vw,12px);width:min(var(--mw),100%,calc((100dvh - 360px) * var(--cols) / var(--rows) * .8))}
.gm-pairs .pcard{position:relative;display:block;width:100%;aspect-ratio:4/5;padding:0;border:0;border-radius:14%/11%;background:none;cursor:pointer;perspective:700px;transition:transform .3s var(--ease);animation:gm-pairs-in .5s var(--ease) var(--d,0ms) backwards}
.gm-pairs .board.lock .pcard{cursor:default}
.gm-pairs .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .3s cubic-bezier(.3,.7,.3,1)}
.gm-pairs .up .in{transform:rotateY(180deg)}
.gm-pairs .back,.gm-pairs .face{position:absolute;inset:0;display:grid;place-items:center;border-radius:14%/11%;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.gm-pairs .back{background:radial-gradient(circle at 28% 16%,rgba(255,255,255,.32),rgba(255,255,255,0) 42%),repeating-linear-gradient(45deg,rgba(255,255,255,.1) 0 4px,rgba(255,255,255,0) 4px 9px),linear-gradient(150deg,var(--b1),var(--b2));box-shadow:inset 0 0 0 3px rgba(255,255,255,.92),inset 0 0 0 6px var(--b2),0 4px 0 var(--b3),0 9px 14px -8px rgba(31,29,43,.45)}
.gm-pairs .back::after{content:"";width:30%;aspect-ratio:1;rotate:45deg;border-radius:22%;background:linear-gradient(135deg,#fff,rgba(255,255,255,.55));box-shadow:0 0 0 4px rgba(255,255,255,.22),0 3px 0 rgba(0,0,0,.15)}
.gm-pairs .face{transform:rotateY(180deg);background:linear-gradient(#fff,#f5f3fb);box-shadow:inset 0 0 0 2px #ebe7f5,0 4px 0 #dcd5ec,0 9px 14px -8px rgba(31,29,43,.35)}
.gm-pairs .face svg{width:68%;height:68%;filter:drop-shadow(0 2px 0 rgba(31,29,43,.14))}
.gm-pairs .pcard.done{transform:scale(.94);cursor:default}
.gm-pairs .done .face{box-shadow:inset 0 0 0 3px #22b07d,0 4px 0 #1b8e64,0 0 20px rgba(34,176,125,.45)}
.gm-pairs .pcard.done .face svg{animation:gm-pairs-yay .5s var(--spring)}
@media (hover:hover){.gm-pairs .pcard:not(.up):not(.done):hover{transform:translateY(-3px)}}
.gm-pairs .pcard:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
@keyframes gm-pairs-in{from{opacity:0;transform:translateY(10px) scale(.94)}}
@keyframes gm-pairs-yay{40%{transform:scale(1.25) rotate(-8deg)}}`,
    mount(root, api) {
      const saved = api.load() || {};
      const cfg = { size: PSIZE[saved.size] ? saved.size : '4x4', theme: THEMES[saved.theme] ? saved.theme : 'shapes', best: saved.best && typeof saved.best === 'object' ? saved.best : {} };
      root.innerHTML = '<div class="g-hud"><div class="g-stat"><span class="k">Moves</span><span class="v">0</span></div><div class="g-stat"><span class="k">Time</span><span class="v">0:00</span></div><div class="g-stat"><span class="k">Pairs</span><span class="v">0/8</span></div></div><div class="board"></div><span class="chip"></span>';
      const [mEl, tEl, pEl] = root.querySelectorAll('.v'), board = root.querySelector('.board'), chip = root.querySelector('.chip'), T = timers(api);
      let cards = [], first = null, pending = null, moves = 0, found = 0, total = 8, cols = 4, locked = true, running = false, t0 = 0, secs = 0, peeking = false, pAt = 0;
      const hud = () => { mEl.textContent = moves; pEl.textContent = found + '/' + total; };
      const wave = i => (Math.floor(i / cols) + i % cols) * 60;
      const flip = (c, up) => { c.up = up; c.el.classList.toggle('up', up); c.el.setAttribute('aria-label', up ? c.name : 'Hidden card'); };
      const opts = () => pick('pairs', [['size', 'Grid', [['4x4', '4×4'], ['5x4', '5×4'], ['6x6', '6×6']]], ['theme', 'Theme', [['shapes', 'Shapes'], ['fruit', 'Fruit'], ['letters', 'Letters']]]], cfg);
      api.interval(() => { if (running) { secs = (performance.now() - t0) / 1000; tEl.textContent = clock(secs); } }, 200);

      function deal(peek) {
        T.clear();
        if (pending) clearTimeout(pending.id);
        const [c, r] = PSIZE[cfg.size], [set, b1, b2, b3] = THEMES[cfg.theme];
        cols = c; total = c * r / 2;
        first = pending = null; moves = found = secs = 0; running = false; locked = true; peeking = !!peek;
        tEl.textContent = '0:00'; hud(); api.score('—');
        board.style.cssText = `--cols:${c};--rows:${r};--mw:${c === 6 ? 560 : c === 5 ? 540 : 470}px;--b1:${b1};--b2:${b2};--b3:${b3}`;
        const best = cfg.best[cfg.size];
        chip.textContent = `${cfg.size.replace('x', '×')} · ${cfg.theme}${best ? ' · best ' + best : ''}`;
        board.textContent = '';
        const syms = shuffle(set.slice()).slice(0, total);
        cards = shuffle([...syms, ...syms]).map((s, i) => {
          const el = document.createElement('button');
          el.type = 'button'; el.className = 'pcard'; el.style.setProperty('--d', wave(i) * .6 + 'ms');
          el.innerHTML = `<span class="in"><span class="back"></span><span class="face"><svg viewBox="0 0 40 40" aria-hidden="true">${s[1]}</svg></span></span>`;
          const card = { el, s, name: s[0], i, up: false, done: false };
          el.setAttribute('aria-label', 'Hidden card');
          tap(el, () => pickCard(card));
          board.append(el);
          return card;
        });
        board.classList.add('lock');
        if (!peek) return;
        const last = wave(cards.length - 1), hide = 600 + last + 450 + 1200 + Math.max(0, total - 8) * 70;
        T.later(() => cards.forEach(c => T.later(() => flip(c, true), wave(c.i))), 600);
        T.later(() => cards.forEach(c => T.later(() => flip(c, false), wave(c.i))), hide);
        T.later(() => { locked = false; peeking = false; board.classList.remove('lock'); }, hide + last);
      }

      function resolve() {
        if (!pending) return;
        clearTimeout(pending.id); flip(pending.a, false); flip(pending.b, false); pending = null;
      }

      function pickCard(c) {
        if (locked || c.done) return;
        if (pending) { const own = c === pending.a || c === pending.b; resolve(); if (own) return; }
        if (c.up) return;
        if (!running) { running = true; t0 = performance.now(); }
        flip(c, true); api.sfx('tap');
        if (!first) { first = c; return; }
        const a = first;
        first = null; moves++; api.score(moves);
        if (a.s === c.s) {
          a.done = c.done = true; found++;
          T.later(() => { a.el.classList.add('done'); c.el.classList.add('done'); api.sfx('good'); }, 260);
          if (found === total) {
            running = false; locked = true; secs = (performance.now() - t0) / 1000; tEl.textContent = clock(secs);
            T.later(win, 1100);
          }
        } else pending = { a, b: c, id: api.timeout(resolve, 750) };
        hud();
      }

      function win() {
        const pb = cfg.best[cfg.size], own = !pb || moves < pb;
        if (own) { cfg.best[cfg.size] = moves; api.save(cfg); }
        const best = api.submit(moves);
        api.sfx('win');
        api.overlay({ kicker: own || best ? 'New best!' : 'Cleared', title: 'All pairs found', text: opts(), stats: [['Moves', moves], ['Time', clock(secs)], [cfg.size.replace('x', '×') + ' best', cfg.best[cfg.size]]], button: 'Play again', onAction: () => deal(true) });
      }

      bindPick(api, root, 'pairs', cfg, () => { if (locked && !running) deal(false); });
      api.on(window, 'keydown', e => {
        const i = cards.findIndex(c => c.el === document.activeElement);
        const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
        if (d) {
          e.preventDefault();
          const n = i < 0 ? 0 : i + d;
          if (n >= 0 && n < cards.length) cards[n].el.focus();
        } else if ((e.key === 'Enter' || e.key === ' ') && i >= 0) {
          e.preventDefault();
          cards[i].el._pd = true;
          if (!e.repeat) pickCard(cards[i]);
        }
      });

      onPause(api, () => { pAt = performance.now(); }, () => { if (running) t0 += performance.now() - pAt; if (peeking) deal(true); });
      deal(false);
      api.overlay({ kicker: 'Memory', title: 'Pairs', text: 'Every card is revealed for a moment. Then flip two at a time and find all the pairs in as few moves as you can.' + opts(), button: 'Play', onAction: () => deal(true) });
    }
  });

  const FREQ = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];
  const PADC = ['#ff5d73', '#ff9f43', '#ffd23f', '#3ddc84', '#2ec4b6', '#4dabf7', '#7c6cff', '#c56cf0', '#ff7ac6'];
  const SIMON = [['#22c55e', 392], ['#ef4444', 329.63], ['#facc15', 261.63], ['#3b82f6', 196]];
  const SMODES = [['classic', 'Classic'], ['simon', 'Simon'], ['reverse', 'Reverse']];

  Ameplay.register({
    id: 'sequence',
    title: 'Sequence',
    category: 'Memory',
    blurb: 'Watch the pads light up, then repeat the growing pattern.',
    help: 'Tap the pads · keys <kbd>1</kbd>–<kbd>9</kbd> follow the numpad (<kbd>1</kbd>–<kbd>4</kbd> in Simon) · Reverse mode: play it backwards',
    better: 'high',
    format: v => 'Level ' + v,
    width: 560,
    icon: ICON + [...Array(9)].map((_, i) => `<rect x="${9 + i % 3 * 17}" y="${9 + (i / 3 | 0) * 17}" width="12" height="12" rx="3"${i === 1 || i === 6 ? ' fill="currentColor"' : i === 5 ? ' fill="currentColor" opacity=".3"' : ''}/>`).join('') + '</svg>',
    css: pickCss('sequence') + `
.gm-sequence{gap:14px}
.gm-sequence .status{display:flex;flex-direction:column;align-items:center;gap:8px}
.gm-sequence .lvl{font:900 clamp(34px,5vw,44px)/1 var(--sans);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.gm-sequence .lvl.pop{animation:gm-sequence-rise .45s var(--spring)}
.gm-sequence .msg{font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-variant-numeric:tabular-nums}
.gm-sequence .msg.good{color:var(--good)}
.gm-sequence .msg.bad{color:var(--bad)}
.gm-sequence .board{touch-action:none;position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(9px,2.4vw,14px);width:min(380px,100%,max(240px,100dvh - 420px));padding:clamp(10px,2.6vw,16px);border-radius:28px;background:radial-gradient(circle at 50% 30%,#34315a,#1d1b33 75%);box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 18px 34px -16px rgba(29,27,51,.75)}
.gm-sequence .board.shake{animation:gm-sequence-shake .42s var(--ease)}
.gm-sequence .tile{position:relative;display:block;width:100%;aspect-ratio:1;padding:0;border:0;border-radius:22%;background:radial-gradient(circle at 34% 24%,rgba(255,255,255,.4),rgba(255,255,255,0) 52%),var(--c);filter:saturate(.85) brightness(.8);box-shadow:inset 0 -6px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.3);cursor:pointer;transition:filter .3s ease-out,transform .3s ease-out,box-shadow .3s ease-out}
.gm-sequence .busy .tile{cursor:default}
@media (hover:hover){.gm-sequence .board:not(.busy) .tile:hover{filter:saturate(.95) brightness(.9)}}
.gm-sequence .tile .key{position:absolute;top:10%;left:13%;font:900 12px/1 var(--sans);color:rgba(255,255,255,.75)}
.gm-sequence .tile.lit{filter:brightness(1.12);transform:scale(1.05);box-shadow:inset 0 -6px 0 rgba(0,0,0,.12),inset 0 3px 0 rgba(255,255,255,.55),0 0 24px 4px var(--c),0 0 56px 8px var(--c);transition:none;z-index:1}
.gm-sequence .tile.hint{filter:none;box-shadow:0 0 0 4px #fff,0 0 28px 6px var(--c);animation:gm-sequence-pulse .8s var(--ease) 2;z-index:1}
.gm-sequence .tile.wrong{filter:grayscale(1) brightness(.5);box-shadow:0 0 0 4px var(--bad);animation:gm-sequence-flash .45s var(--ease)}
.gm-sequence .board.simon{grid-template-columns:repeat(2,minmax(0,1fr));gap:4.5%;padding:5%;border-radius:50%;background:radial-gradient(circle,#2b2945,#16152a 70%)}
.gm-sequence .simon .tile:nth-child(1){border-radius:100% 14% 14% 14%}
.gm-sequence .simon .tile:nth-child(2){border-radius:14% 100% 14% 14%}
.gm-sequence .simon .tile:nth-child(3){border-radius:14% 14% 14% 100%}
.gm-sequence .simon .tile:nth-child(4){border-radius:14% 14% 100% 14%}
.gm-sequence .simon .tile .key{top:auto;left:auto;bottom:22%;right:22%}
.gm-sequence .simon .tile:nth-child(2) .key{left:22%;right:auto}
.gm-sequence .simon .tile:nth-child(3) .key{top:22%;bottom:auto}
.gm-sequence .simon .tile:nth-child(4) .key{top:22%;bottom:auto;left:22%;right:auto}
.gm-sequence .simon::after{content:"";position:absolute;left:33%;top:33%;width:34%;height:34%;border-radius:50%;background:radial-gradient(circle at 40% 30%,#4a4770,#1d1b33 70%);box-shadow:0 0 0 7px #16152a,inset 0 2px 0 rgba(255,255,255,.12);pointer-events:none}
@media (hover:none){.gm-sequence .tile .key{display:none}}
@keyframes gm-sequence-rise{from{opacity:0;transform:translateY(8px) scale(.9)}}
@keyframes gm-sequence-shake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(1px)}}
@keyframes gm-sequence-pulse{45%{transform:scale(1.07)}}
@keyframes gm-sequence-flash{30%{transform:scale(.92)}}`,
    mount(root, api) {
      const saved = api.load() || {};
      const cfg = { mode: SMODES.some(m => m[0] === saved.mode) ? saved.mode : 'classic', best: saved.best && typeof saved.best === 'object' ? saved.best : {} };
      root.innerHTML = '<div class="status"><div class="lvl">Level 1</div><div class="msg">Ready</div></div><div class="board busy"></div><span class="chip"></span>';
      const lvl = root.querySelector('.lvl'), msg = root.querySelector('.msg'), board = root.querySelector('.board'), chip = root.querySelector('.chip'), T = timers(api);
      let tiles = [], byKey = {}, seq = [], idx = 0, level = 0, phase = 'idle', ac = null, built = '';
      const modeName = () => SMODES.find(m => m[0] === cfg.mode)[1];
      const opts = () => pick('sequence', [['mode', 'Mode', SMODES]], cfg);

      function build() {
        if (built === cfg.mode) return;
        built = cfg.mode;
        board.textContent = ''; tiles = []; byKey = {};
        const simon = cfg.mode === 'simon';
        board.classList.toggle('simon', simon);
        for (let p = 0; p < (simon ? 4 : 9); p++) {
          const d = simon ? p + 1 : (2 - (p / 3 | 0)) * 3 + p % 3 + 1, el = document.createElement('button');
          el.type = 'button'; el.className = 'tile'; el.tabIndex = -1; el.setAttribute('aria-label', 'Pad ' + d);
          el.style.setProperty('--c', simon ? SIMON[p][0] : PADC[d - 1]);
          el.innerHTML = `<span class="key">${d}</span>`;
          el.addEventListener('pointerdown', e => { if (e.button === 0) press(p); });
          board.append(el); tiles.push({ el, f: simon ? SIMON[p][1] : FREQ[d - 1], off: 0 }); byKey[d] = p;
        }
        const b = cfg.best[cfg.mode];
        chip.textContent = modeName() + (b ? ' · best ' + b : '');
      }

      function tone(f, dur) {
        const snd = document.querySelector('[data-sound]');
        if (snd && snd.getAttribute('aria-pressed') === 'false') return;
        try {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          if (ac.state === 'suspended') ac.resume().catch(() => {});
          const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(.0001, t);
          g.gain.exponentialRampToValueAtTime(.09, t + .012);
          g.gain.exponentialRampToValueAtTime(.0001, t + dur);
          o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05);
        } catch (e) {}
      }

      function light(p, ms) {
        const t = tiles[p];
        clearTimeout(t.off); t.el.classList.add('lit'); tone(t.f, Math.max(.2, ms / 1000 + .1));
        t.off = api.timeout(() => t.el.classList.remove('lit'), ms);
      }
      const say = (text, cls) => { msg.textContent = text; msg.className = 'msg' + (cls ? ' ' + cls : ''); };
      const want = () => cfg.mode === 'reverse' ? seq[seq.length - 1 - idx] : seq[idx];

      function round() {
        seq.push(Math.random() * tiles.length | 0);
        lvl.textContent = 'Level ' + seq.length; lvl.classList.remove('pop'); void lvl.offsetWidth; lvl.classList.add('pop');
        show();
      }
      function show() {
        idx = 0; phase = 'watch';
        say('Watch…'); board.classList.add('busy');
        const gap = Math.max(250, 640 - level * 30), on = Math.round(gap * .62), lead = 650;
        seq.forEach((p, i) => T.later(() => light(p, on), lead + i * gap));
        T.later(() => { phase = 'play'; board.classList.remove('busy'); say(cfg.mode === 'reverse' ? 'Your turn · backwards' : 'Your turn'); }, lead + (seq.length - 1) * gap + on);
      }

      function press(p) {
        if (phase !== 'play') return;
        if (p !== want()) return fail(p);
        light(p, 220); idx++;
        if (idx < seq.length) return say(idx + ' of ' + seq.length);
        level++; phase = 'wait'; api.score(level); say('Correct', 'good');
        T.later(round, 650);
      }

      function fail(p) {
        phase = 'over'; board.classList.add('busy');
        tiles[want()].el.classList.add('hint'); tiles[p].el.classList.add('wrong');
        board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
        api.sfx('lose'); say('Not quite', 'bad');
        T.later(() => {
          const pb = +cfg.best[cfg.mode] || 0, own = level > pb;
          if (own) { cfg.best[cfg.mode] = level; api.save(cfg); }
          const best = level > 0 && api.submit(level);
          api.overlay({
            kicker: best || own ? 'New best!' : 'Game over',
            title: level ? level + (level === 1 ? ' level' : ' levels') : 'Not quite',
            text: (level ? `You repeated a sequence of ${level} ${level === 1 ? 'step' : 'steps'}.` : 'The very first step slipped away. Watch closely and go again.') + opts(),
            stats: [['Levels', level], ['Mode', modeName()], ['Best', cfg.best[cfg.mode] || '—']],
            button: 'Play again', onAction: start
          });
        }, 1300);
      }

      function start() {
        T.clear(); seq = []; level = 0; api.score('—');
        build();
        board.classList.remove('shake');
        tiles.forEach(t => t.el.classList.remove('lit', 'hint', 'wrong'));
        lvl.textContent = 'Level 1';
        round();
      }

      onPause(api, () => {
        if (phase === 'watch') { T.clear(); tiles.forEach(t => { clearTimeout(t.off); t.el.classList.remove('lit'); }); phase = 'held'; }
        else if (phase === 'wait') { T.clear(); phase = 'heldwait'; }
      }, () => {
        if (phase === 'held') show();
        else if (phase === 'heldwait') { phase = 'wait'; T.later(round, 500); }
      });
      bindPick(api, root, 'sequence', cfg, () => { build(); tiles.forEach(t => t.el.classList.remove('hint', 'wrong')); });
      api.on(window, 'keydown', e => {
        const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code), d = m ? m[1] : /^[1-9]$/.test(e.key) && e.key;
        if (!d) return;
        e.preventDefault();
        if (!e.repeat && byKey[d] != null) press(byKey[d]);
      });

      build();
      api.overlay({ kicker: 'Memory', title: 'Sequence', text: 'Watch the pads light up, then repeat the pattern. Every level adds one more step and the playback gets faster.' + opts(), button: 'Play', onAction: start });
      return { destroy() { try { if (ac) ac.close().catch(() => {}); } catch (e) {} } };
    }
  });

  const SVG24 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  const CHECK = SVG24 + '<path d="m5 12.5 4.5 4.5L19 7.5"/></svg>', CROSS = SVG24 + '<path d="m7 7 10 10M17 7 7 17"/></svg>';
  const DEL = `${SVG24}<path d="M9 5h11v14H9l-6-7z"/><path d="m12.5 9.5 5 5m0-5-5 5"/></svg>`;
  const NCOL = ['#ff4d6d', '#ff9f1c', '#f4c20d', '#2bc48a', '#1fb5c9', '#3d8bfd', '#7c5cff', '#d45cf0'];
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  Ameplay.register({
    id: 'number-memory',
    title: 'Number Memory',
    category: 'Memory',
    blurb: 'Memorise a number, then type it back. One more digit each time.',
    help: 'Type with the keyboard or the on-screen pad · <kbd>Enter</kbd> to submit · <kbd>Backspace</kbd> to delete · Letters mode on the start screen',
    better: 'high',
    format: v => v + ' digits',
    width: 640,
    icon: ICON + '<rect x="7" y="13" width="50" height="28" rx="7"/><circle cx="21" cy="27" r="2.6" fill="currentColor"/><circle cx="32" cy="27" r="2.6" fill="currentColor"/><circle cx="43" cy="27" r="2.6" fill="currentColor"/><path d="M7 51h50" opacity=".3"/><path d="M7 51h30"/></svg>',
    css: pickCss('number-memory') + `
.gm-number-memory{gap:14px}
.gm-number-memory .stage{display:grid;width:100%;container-type:inline-size}
.gm-number-memory .view{grid-area:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-width:0;opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .25s var(--ease),transform .4s var(--ease),visibility 0s linear .4s}
.gm-number-memory .view.on{opacity:1;visibility:visible;transform:none;transition:opacity .3s var(--ease) .08s,transform .45s var(--spring) .08s,visibility 0s}
.gm-number-memory .num{max-width:100%;text-align:center;overflow-wrap:anywhere;letter-spacing:.02em;font-weight:900}
.gm-number-memory .num span{display:inline-block;text-shadow:0 .06em 0 rgba(31,29,43,.13);animation:gm-number-memory-pop .4s var(--spring) both}
.gm-number-memory .bar{width:min(300px,72%);height:10px;border-radius:9px;background:var(--sunk-2);overflow:hidden;box-shadow:inset 0 1px 2px rgba(31,29,43,.12)}
.gm-number-memory .bar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#ff4d6d,#ff9f1c,#7c5cff);transform-origin:left center}
.gm-number-memory .q{margin:0;font:900 clamp(24px,4vw,30px)/1.1 var(--sans);letter-spacing:-.02em;text-align:center}
.gm-number-memory .g-input{width:min(320px,100%);height:56px;text-align:center;font-size:26px;font-weight:900;letter-spacing:.1em;font-variant-numeric:tabular-nums;color:var(--accent)}
.gm-number-memory .g-input.nudge{animation:gm-number-memory-nudge .4s var(--ease)}
.gm-number-memory .pad{touch-action:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;width:min(320px,100%)}
.gm-number-memory .pad.abc{grid-template-columns:repeat(20,minmax(0,1fr));gap:6px;width:min(520px,100%)}
.gm-number-memory .pad.abc button{grid-column:span 2;height:46px;font-size:17px}
.gm-number-memory .pad.abc .sp{grid-column:span 1;visibility:hidden}
.gm-number-memory .pad.abc .del,.gm-number-memory .pad.abc .ok{grid-column:span 3}
@media (pointer:coarse){.gm-number-memory .pad.abc{column-gap:3px}}
.gm-number-memory .pad button{height:52px;display:grid;place-items:center;padding:0;border:0;border-radius:14px;background:linear-gradient(#fff,#f4f2fa);box-shadow:inset 0 0 0 1.5px #e7e3f2,inset 0 -4px 0 #e2ddef,0 3px 6px -3px rgba(31,29,43,.25);color:var(--c,var(--ink));font:900 21px/1 var(--sans);font-variant-numeric:tabular-nums;cursor:pointer}
.gm-number-memory .pad button:active,.gm-number-memory .pad button.dn{transform:translateY(2px);box-shadow:inset 0 0 0 1.5px #e7e3f2,inset 0 -1px 0 #e2ddef}
.gm-number-memory .pad .del{background:linear-gradient(#ffe1e6,#ffd0d8);box-shadow:inset 0 -4px 0 #f8b4c0,0 3px 6px -3px rgba(31,29,43,.25);color:#e5384f}
.gm-number-memory .pad .ok{background:linear-gradient(#3ddc97,#20b47a);box-shadow:inset 0 -4px 0 #178a5d,0 3px 8px -3px rgba(23,138,93,.6);color:#fff}
.gm-number-memory .pad svg{width:22px;height:22px}
.gm-number-memory .verdict{display:flex;align-items:center;gap:8px;margin:0;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.gm-number-memory .verdict svg{width:18px;height:18px}
.gm-number-memory .verdict.ok{color:#fff;background:var(--good)}
.gm-number-memory .verdict.no{color:#fff;background:var(--bad)}
.gm-number-memory .cmp{display:grid;grid-template-columns:auto auto;align-items:center;gap:10px 18px;font-weight:900;line-height:1.1}
.gm-number-memory .cmp .k{justify-self:end;font:900 10.5px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.gm-number-memory .cmp .d{display:flex}
.gm-number-memory .cmp .d span{width:.66em;margin:0 .03em;padding-bottom:.04em;border-bottom:3px solid transparent;text-align:center;font-variant-numeric:tabular-nums}
.gm-number-memory .cmp .x{color:var(--bad);border-color:var(--bad)}
.gm-number-memory .cmp.ok .you{color:var(--good)}
@keyframes gm-number-memory-pop{from{opacity:0;transform:translateY(.3em) scale(.6)}}
@keyframes gm-number-memory-nudge{25%{transform:translateX(-4px)}50%{transform:translateX(4px)}75%{transform:translateX(-2px)}}`,
    mount(root, api) {
      const saved = api.load() || {};
      const cfg = { mode: saved.mode === 'letters' ? 'letters' : 'digits', best: saved.best && typeof saved.best === 'object' ? saved.best : {} };
      const digitKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" tabindex="-1" data-k="${d}" style="--c:${NCOL[(d - 1) % 8]}">${d}</button>`).join('') +
        `<button type="button" tabindex="-1" class="del" data-k="del" aria-label="Delete">${DEL}</button><button type="button" tabindex="-1" data-k="0" style="--c:${NCOL[7]}">0</button><button type="button" tabindex="-1" class="ok" data-k="ok" aria-label="Submit">${CHECK}</button>`;
      const row = (s, i0) => s.split('').map((c, i) => `<button type="button" tabindex="-1" data-k="${c}" style="--c:${NCOL[(i0 + i) % 8]}">${c}</button>`).join('');
      const abcKeys = row('QWERTYUIOP', 0) + '<i class="sp"></i>' + row('ASDFGHJKL', 2) + '<i class="sp"></i>' + `<button type="button" tabindex="-1" class="del" data-k="del" aria-label="Delete">${DEL}</button>` + row('ZXCVBNM', 4) + `<button type="button" tabindex="-1" class="ok" data-k="ok" aria-label="Submit">${CHECK}</button>`;
      root.innerHTML = `<div class="g-hud"><div class="g-stat"><span class="k">Length</span><span class="v">3</span></div><div class="g-stat"><span class="k">Recalled</span><span class="v">0</span></div></div>
<div class="stage">
  <div class="view" data-v="show"><div class="g-display num"></div><div class="bar"><i></i></div></div>
  <div class="view" data-v="ask"><p class="q">What was the number?</p><input class="g-input" type="text" inputmode="numeric" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="40" enterkeyhint="done" aria-label="Your answer" disabled><div class="pad"></div></div>
  <div class="view" data-v="res"><p class="verdict"></p><div class="cmp"></div></div>
</div><span class="chip"></span>`;
      const [nEl, sEl] = root.querySelectorAll('.g-stat .v'), views = root.querySelectorAll('.view'), num = root.querySelector('.num'), fill = root.querySelector('.bar i');
      const input = root.querySelector('input'), pad = root.querySelector('.pad'), verdict = root.querySelector('.verdict'), cmp = root.querySelector('.cmp'), q = root.querySelector('.q'), chip = root.querySelector('.chip'), T = timers(api);
      const coarse = matchMedia('(pointer: coarse)').matches;
      let n = 3, score = 0, target = '', phase = 'idle', stopBar = null, letters = false;
      const view = name => views.forEach(v => v.classList.toggle('on', v.dataset.v === name));
      const unit = () => letters ? 'letters' : 'digits';
      const opts = () => pick('number-memory', [['mode', 'Mode', [['digits', 'Digits'], ['letters', 'Letters']]]], cfg);
      const clean = v => letters ? v.toUpperCase().replace(/[^A-Z]/g, '') : v.replace(/\D/g, '');

      function setMode() {
        letters = cfg.mode === 'letters';
        pad.className = 'pad' + (letters ? ' abc' : '');
        pad.innerHTML = letters ? abcKeys : digitKeys;
        input.inputMode = letters ? 'text' : 'numeric';
        q.textContent = letters ? 'What were the letters?' : 'What was the number?';
        const b = cfg.best[cfg.mode];
        chip.textContent = (letters ? 'Letters' : 'Digits') + (b ? ' · best ' + b : '');
      }

      function round(keep) {
        phase = 'show'; nEl.textContent = n;
        if (keep !== true) {
          target = letters ? '' : String(1 + Math.random() * 9 | 0);
          while (target.length < n) target += letters ? ALPHA[Math.random() * ALPHA.length | 0] : Math.random() * 10 | 0;
        }
        num.innerHTML = [...target].map((c, i) => `<span style="color:${NCOL[(i * 3 + n) % 8]};animation-delay:${i * 35}ms">${c}</span>`).join('');
        num.style.fontSize = `min(104px, ${(150 / n).toFixed(2)}cqw)`;
        input.value = ''; view('show');
        const ms = (1.2 + .6 * n) * 1000, t0 = performance.now();
        fill.style.transform = '';
        if (stopBar) stopBar();
        stopBar = api.loop(() => {
          const k = Math.min(1, (performance.now() - t0) / ms);
          fill.style.transform = `scaleX(${1 - k})`;
          if (k >= 1) stopBar();
        });
        T.later(ask, ms);
      }

      function ask() {
        if (stopBar) stopBar();
        phase = 'ask'; input.value = ''; input.disabled = false; view('ask');
        if (!coarse) input.focus({ preventScroll: true });
      }

      const type = d => { if (phase === 'ask' && input.value.length < 40) input.value += d; };
      const del = () => { if (phase === 'ask') input.value = input.value.slice(0, -1); };

      function check() {
        if (phase !== 'ask') return;
        const v = clean(input.value);
        if (!v) { input.classList.remove('nudge'); void input.offsetWidth; input.classList.add('nudge'); return; }
        phase = 'res'; input.blur(); input.disabled = true;
        const ok = v === target, len = Math.max(v.length, target.length);
        const line = (s, mark) => [...Array(len)].map((_, i) => `<span${mark && s[i] !== target[i] ? ' class="x"' : ''}>${s[i] ?? ''}</span>`).join('');
        cmp.className = 'cmp' + (ok ? ' ok' : '');
        cmp.style.fontSize = `min(48px, ${(75 / len).toFixed(2)}cqw)`;
        cmp.innerHTML = `<span class="k">${letters ? 'Letters' : 'Number'}</span><span class="d">${line(target, false)}</span><span class="k">You</span><span class="d you">${line(v, true)}</span>`;
        verdict.className = 'verdict ' + (ok ? 'ok' : 'no');
        verdict.innerHTML = ok ? CHECK + 'Correct' : CROSS + 'Not quite';
        view('res');
        if (ok) { score = n++; sEl.textContent = score; api.score(letters ? score + ' letters' : score); api.sfx('good'); T.later(round, 1300); phase = 'resok'; }
        else { api.sfx('lose'); T.later(over, 2200); }
      }

      function over() {
        phase = 'over';
        const pb = +cfg.best[cfg.mode] || 0, own = score > pb;
        if (own) { cfg.best[cfg.mode] = score; api.save(cfg); }
        const best = !letters && score > 0 && api.submit(score);
        if (own && letters) api.toast('New best · ' + score + ' letters');
        api.overlay({
          kicker: best || own ? 'New best!' : 'Game over',
          title: score ? score + ' ' + unit() : 'Not this time',
          text: `The ${letters ? 'letters were' : 'number was'} <b>${target}</b>.` + opts(),
          stats: [[letters ? 'Letters' : 'Digits', score], ['Best', cfg.best[cfg.mode] || '—']],
          button: 'Play again', onAction: start
        });
      }

      function start() { T.clear(); setMode(); n = 3; score = 0; sEl.textContent = 0; api.score('—'); round(); }

      input.addEventListener('input', () => { const v = clean(input.value); if (v !== input.value) input.value = v; });
      pad.addEventListener('mousedown', e => e.preventDefault());
      tap(pad, e => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        b.classList.add('dn'); api.timeout(() => b.classList.remove('dn'), 90);
        const k = b.dataset.k;
        if (k === 'ok') check(); else if (k === 'del') del(); else type(k);
      });
      onPause(api, () => {
        if (phase === 'show') { T.clear(); if (stopBar) stopBar(); phase = 'held'; }
        else if (phase === 'resok') { T.clear(); phase = 'heldok'; }
      }, () => {
        if (phase === 'held') round(true);
        else if (phase === 'heldok') { phase = 'resok'; T.later(round, 600); }
      });
      bindPick(api, root, 'number-memory', cfg, () => setMode());
      api.on(window, 'keydown', e => {
        if (phase !== 'ask') return;
        if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) check(); return; }
        if (e.target === input) return;
        if (letters ? /^[a-z]$/i.test(e.key) : /^[0-9]$/.test(e.key)) { e.preventDefault(); type(e.key.toUpperCase()); }
        else if (e.key === 'Backspace') { e.preventDefault(); del(); }
      });

      setMode();
      api.overlay({ kicker: 'Memory', title: 'Number Memory', text: 'A number flashes up for a few seconds. Type it back from memory. Every correct answer adds one more character.' + opts(), button: 'Play', onAction: start });
    }
  });
})();

