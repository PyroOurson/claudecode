
(() => {
  'use strict';

  const DIRS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
  const STEP = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  const el = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const mods = e => e.ctrlKey || e.metaKey || e.altKey;
  const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pos = (i, n) => `calc(${i % n} * (100% + var(--g))) calc(${Math.floor(i / n)} * (100% + var(--g)))`;
  const ICON = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const seg = (k, opts, cur) => `<div class="seg" data-k="${k}" role="radiogroup">${opts.map(([v, t]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  const segCss = p => `
${p} .seg{display:inline-flex;padding:4px;gap:2px;border-radius:999px;background:var(--sunk);box-shadow:inset 0 1px 2px rgba(31,29,43,.08)}
${p} .seg button{border:0;background:none;padding:8px 13px;border-radius:999px;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button[aria-checked="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
@media (pointer:coarse){${p} .seg button{min-height:40px}${p} .g-btn.sm{height:42px}}`;
  function bindSeg(wrap, fn) {
    wrap.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.seg button');
      if (!b || b.getAttribute('aria-checked') === 'true') return;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      fn(b.parentNode.dataset.k, b.dataset.v);
    });
  }

  function swipe(target, fn) {
    let sx = 0, sy = 0, id = null;
    target.style.touchAction = 'none';
    target.addEventListener('pointerdown', e => { id = e.pointerId; sx = e.clientX; sy = e.clientY; });
    target.addEventListener('pointermove', e => {
      if (id !== e.pointerId) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
      id = null;
      fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });
    const end = e => { if (id === e.pointerId) id = null; };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }

  const SIZES = [3, 4, 5, 6], TARGET = { 3: 512, 4: 2048, 5: 4096, 6: 8192 };
  const LINES = {};
  function lines(n) {
    if (LINES[n]) return LINES[n];
    const L = { left: [], right: [], up: [], down: [] };
    for (let a = 0; a < n; a++) {
      const row = [], col = [];
      for (let b = 0; b < n; b++) { row.push(a * n + b); col.push(b * n + a); }
      L.left.push(row); L.right.push([...row].reverse()); L.up.push(col); L.down.push([...col].reverse());
    }
    return (LINES[n] = L);
  }
  function slide(vals, dir) {
    const n = Math.round(Math.sqrt(vals.length)), out = Array(vals.length).fill(0), ops = [], merged = [];
    let gained = 0;
    for (const line of lines(n)[dir]) {
      let k = -1, canMerge = false;
      for (const i of line) {
        const v = vals[i];
        if (!v) continue;
        if (canMerge && out[line[k]] === v) {
          out[line[k]] = v * 2; gained += v * 2; merged.push(line[k]); canMerge = false;
        } else {
          out[line[++k]] = v; canMerge = true;
        }
        ops.push([i, line[k]]);
      }
    }
    return { vals: out, gained, ops, merged, moved: ops.some(([a, b]) => a !== b) };
  }
  const canMove = v => {
    const n = Math.round(Math.sqrt(v.length));
    return v.some((x, i) => !x || (i % n < n - 1 && x === v[i + 1]) || (i < v.length - n && x === v[i + n]));
  };
  let left2048 = -1e9;
  const validGrid = v => Array.isArray(v) && SIZES.includes(Math.sqrt(v.length)) && v.every(x => x === 0 || (Number.isInteger(x) && x >= 2 && (x & (x - 1)) === 0));
  const TILE = { 2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'], 8: ['#f2b179', '#fff'], 16: ['#f59563', '#fff'], 32: ['#f67c5f', '#fff'], 64: ['#f65e3b', '#fff'], 128: ['#edcf72', '#fff'], 256: ['#edcc61', '#fff'], 512: ['#edc850', '#fff'], 1024: ['#edc53f', '#fff'], 2048: ['#edc22e', '#fff'], 4096: ['#b46ef0', '#fff'], 8192: ['#7c5cf0', '#fff'] };

  Ameplay.register({
    id: '2048',
    title: '2048',
    category: 'Puzzle',
    better: 'high',
    width: 640,
    blurb: 'Slide, merge, and build your way to the 2048 tile.',
    help: '<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> or swipe to slide · <kbd>Z</kbd> undo · pick a board size up top',
    icon: ICON('<rect x="8" y="8" width="21" height="21" rx="5"/><rect x="35" y="8" width="21" height="21" rx="5"/><rect x="8" y="35" width="21" height="21" rx="5" fill="currentColor" opacity=".3"/><rect x="35" y="35" width="21" height="21" rx="5" fill="currentColor"/>'),
    css: segCss('.gm-2048') + `
.gm-2048{gap:14px}
.gm-2048 .top{width:min(460px,100%);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.gm-2048 .boxes,.gm-2048 .btns{display:flex;gap:8px}
.gm-2048 .box{position:relative;min-width:74px;padding:7px 12px 6px;border-radius:12px;background:#bbada0;color:#fff;text-align:center;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12),inset 0 2px 0 rgba(255,255,255,.2)}
.gm-2048 .box .k{display:block;font:900 10.5px/1.2 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#f6eee4}
.gm-2048 .box .v{display:block;font:900 21px/1.15 var(--sans);font-variant-numeric:tabular-nums}
.gm-2048 .plus{position:absolute;left:50%;top:6px;margin-left:-.6em;font:900 18px/1 var(--sans);color:#8f7a66;pointer-events:none;animation:gm2048-plus .7s var(--ease) both}
@keyframes gm2048-plus{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-36px)}}
.gm-2048 .board{position:relative;width:min(460px,100%);aspect-ratio:1;background:linear-gradient(#c2b3a5,#ad9e8f);border-radius:18px;box-shadow:inset 0 2px 0 rgba(255,255,255,.25),inset 0 -4px 0 rgba(0,0,0,.1),0 16px 30px -16px rgba(120,90,60,.6);container-type:inline-size;--g:calc(10.5cqw / var(--n))}
.gm-2048 .cells{position:absolute;inset:0;display:grid;grid-template:repeat(var(--n),minmax(0,1fr))/repeat(var(--n),minmax(0,1fr));gap:var(--g);padding:var(--g)}
.gm-2048 .cells i{border-radius:calc(9cqw / var(--n));background:rgba(238,228,218,.4);box-shadow:inset 0 2px 5px rgba(90,70,50,.14)}
.gm-2048 .t{position:absolute;left:var(--g);top:var(--g);z-index:1;width:calc((100% - (var(--n) + 1) * var(--g)) / var(--n));aspect-ratio:1;border-radius:calc(9cqw / var(--n));display:grid;place-items:center;background:linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,0) 55%) var(--bg);color:var(--fg);font:900 calc(var(--k) * 38cqw / var(--n))/1 var(--sans);letter-spacing:-.03em;font-variant-numeric:tabular-nums;text-shadow:0 2px 0 rgba(0,0,0,.1);box-shadow:inset 0 calc(-3.4cqw / var(--n)) 0 rgba(0,0,0,.14),inset 0 calc(2cqw / var(--n)) 0 rgba(255,255,255,.45),0 calc(2.4cqw / var(--n)) calc(5cqw / var(--n)) rgba(110,80,50,.3),var(--gl,0 0 0 transparent);transition:translate .1s ease-out}
.gm-2048 .t.gone{z-index:0}
.gm-2048 .t.new{animation:gm2048-in .16s var(--ease) .08s both}
.gm-2048 .t.pop{z-index:2;animation:gm2048-pop .2s var(--ease) .07s both}
.gm-2048 .t.fade{animation:gm2048-fade .22s var(--ease) both}
.gm-2048 .board.snap .t{transition:none!important;animation:none!important}
@keyframes gm2048-in{0%{opacity:0;scale:.2}100%{opacity:1;scale:1}}
@keyframes gm2048-pop{0%{opacity:0;scale:1}1%{opacity:1}50%{scale:1.17}100%{opacity:1;scale:1}}
@keyframes gm2048-fade{0%{opacity:0}}
.gm-2048 .board.nope{animation:gm2048-nope .22s var(--ease)}
@keyframes gm2048-nope{35%{translate:var(--nx) var(--ny)}}
@media (max-width:520px){.gm-2048 .box{min-width:62px;padding:6px 9px 5px}.gm-2048 .box .v{font-size:18px}.gm-2048 .seg button{padding:8px 10px}}
`,
    mount(root, api) {
      const saved = api.load() || {};
      const st = {
        size: SIZES.includes(+saved.size) ? +saved.size : 4,
        best: saved.best && typeof saved.best === 'object' ? saved.best : {},
        g: saved.g && typeof saved.g === 'object' ? saved.g : {}
      };
      if (validGrid(saved.vals) && saved.vals.length === 16 && !st.g[4]) st.g[4] = { vals: saved.vals, score: saved.score, prev: saved.prev, won: saved.won };
      const sizes = el('div', 'sizes', seg('size', SIZES.map(n => [n, n + '×' + n]), st.size));
      const top = el('div', 'top', '<div class="boxes"><div class="box sc"><span class="k">Score</span><span class="v">0</span></div><div class="box bt"><span class="k">Best</span><span class="v">0</span></div></div><div class="btns"><button type="button" class="g-btn ghost sm" data-u>Undo</button><button type="button" class="g-btn ghost sm" data-n>New game</button></div>');
      const board = el('div', 'board', '<div class="cells"></div>');
      root.append(sizes, top, board);
      const scBox = top.querySelector('.sc'), scEl = scBox.querySelector('.v'), btEl = top.querySelector('.bt .v');
      const undoBtn = top.querySelector('[data-u]'), newBtn = top.querySelector('[data-n]'), cellsEl = board.firstChild;
      let n = st.size, vals, score, prev, won, over, busy, tiles = [], animEnd = 0;

      function make(v, i, anim) {
        const t = el('div', 't' + (anim ? ' ' + anim : ''), v);
        const [bg, fg] = TILE[v] || ['#3c3a32', '#fff'], d = String(v).length;
        t.style.cssText = `--bg:${bg};--fg:${fg};--k:${d < 3 ? 1 : d === 3 ? .8 : d === 4 ? .64 : .52};translate:${pos(i, n)}` + (v >= 128 ? `;--gl:0 0 calc(${v >= 1024 ? 14 : 9}cqw / var(--n)) rgba(243,205,90,${v >= 1024 ? .75 : .5})` : '');
        board.append(t);
        return t;
      }
      function hud() {
        scEl.textContent = score; api.score(score); undoBtn.disabled = !prev;
        btEl.textContent = Math.max(+st.best[n] || 0, score);
      }
      function render(anim) {
        board.querySelectorAll('.t').forEach(t => t.remove());
        tiles = vals.map((v, i) => v ? make(v, i, anim) : null);
        hud();
      }
      const persist = () => { st.g[n] = over ? null : { vals, score, prev, won }; st.size = n; api.save(st); };
      function spawn() {
        const empty = [];
        vals.forEach((v, i) => { if (!v) empty.push(i); });
        const i = empty[Math.floor(Math.random() * empty.length)];
        vals[i] = Math.random() < 0.9 ? 2 : 4;
        tiles[i] = make(vals[i], i, 'new');
      }

      function settle() {
        if (performance.now() >= animEnd) return;
        board.classList.add('snap');
        board.querySelectorAll('.t.gone').forEach(t => t.remove());
        board.querySelectorAll('.t.new,.t.pop,.t.fade').forEach(t => t.classList.remove('new', 'pop', 'fade'));
        void board.offsetWidth;
        board.classList.remove('snap');
        animEnd = 0;
      }
      function newGame() {
        vals = Array(n * n).fill(0); score = 0; prev = null; won = false; over = false; busy = false;
        render(); spawn(); spawn(); persist();
      }
      function setSize(m, fresh) {
        n = m;
        board.style.setProperty('--n', n);
        cellsEl.innerHTML = '<i></i>'.repeat(n * n);
        const s = st.g[n];
        if (fresh && s && +s.score > 0) api.submit(+s.score);
        if (!fresh && s && validGrid(s.vals) && s.vals.length === n * n && s.vals.some(Boolean) && canMove(s.vals)) {
          vals = s.vals.slice(); score = +s.score || 0; won = !!s.won; over = false; busy = false;
          prev = s.prev && validGrid(s.prev.vals) && s.prev.vals.length === n * n ? { vals: s.prev.vals, score: +s.prev.score || 0 } : null;
          render('fade'); persist();
        } else newGame();
      }
      function abandon() {
        if (score > 0) api.submit(score);
        newGame();
      }
      function nudge(dir) {
        const [x, y] = STEP[dir];
        board.style.setProperty('--nx', x * 4 + 'px'); board.style.setProperty('--ny', y * 4 + 'px');
        board.classList.remove('nope'); void board.offsetWidth; board.classList.add('nope');
      }
      function plus(v) {
        const p = el('span', 'plus', '+' + v);
        scBox.append(p);
        api.timeout(() => p.remove(), 720);
      }
      function move(dir) {
        if (busy || over) return;
        const r = slide(vals, dir);
        if (!r.moved) return nudge(dir);
        settle();
        prev = { vals: vals.slice(), score };
        const old = tiles, merged = new Set(r.merged);
        tiles = Array(n * n).fill(null);
        for (const [a, b] of r.ops) {
          const t = old[a];
          t.style.translate = pos(b, n);
          if (merged.has(b)) { t.classList.add('gone'); api.timeout(() => t.remove(), 110); }
          else tiles[b] = t;
        }
        vals = r.vals;
        for (const i of r.merged) tiles[i] = make(vals[i], i, 'pop');
        if (r.gained) { score += r.gained; plus(r.gained); api.sfx('pop'); }
        animEnd = performance.now() + 300;
        spawn();
        if (score > (+st.best[n] || 0)) st.best[n] = score;
        hud();
        const hit = !won && r.merged.some(i => vals[i] >= TARGET[n]);
        if (hit) won = true;
        over = !canMove(vals);
        persist();
        if (over) { const nb = api.submit(score); api.timeout(() => end(nb), 650); }
        else if (hit) { busy = true; api.timeout(win, 420); }
      }
      function undo() {
        if (!prev || busy || over) return;
        settle();
        ({ vals, score } = prev);
        prev = null;
        render('fade'); persist(); api.sfx('tap');
      }
      function win() {
        api.sfx('win');
        api.overlay({
          kicker: 'Milestone', title: 'You made ' + TARGET[n],
          text: 'The board is still open. Keep merging to push your score higher.',
          stats: [['Score', score], ['Board', n + '×' + n], ['Best', Math.max(+st.best[n] || 0, score)]],
          button: 'Keep going', onAction: () => { busy = false; },
          secondary: 'New game', onSecondary: abandon
        });
      }
      function end(nb) {
        const top = Math.max(...vals);
        api.sfx('lose');
        api.overlay({
          kicker: nb ? 'New best!' : top >= TARGET[n] ? 'You made ' + TARGET[n] : 'Game over', title: 'No moves left',
          stats: [['Score', score], ['Highest tile', top], [n + '×' + n + ' best', Math.max(+st.best[n] || 0, score)]],
          button: 'Play again', onAction: newGame
        });
      }

      bindSeg(sizes, (k, v) => { settle(); persist(); setSize(+v); api.sfx('tap'); });
      top.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
      undoBtn.addEventListener('click', undo);
      newBtn.addEventListener('click', () => { if (busy || over) return; abandon(); api.sfx('tap'); });
      api.on(window, 'keydown', e => {
        if (mods(e)) return;
        if (DIRS[e.code]) move(DIRS[e.code]);
        else if (e.code === 'KeyZ') undo();
      });
      swipe(board, move);

      setSize(n, performance.now() - left2048 < 80);
      return { destroy() { left2048 = performance.now(); } };
    }
  });

  const MS = { Easy: [9, 9, 10], Medium: [16, 16, 40], Hard: [16, 30, 99] };
  const nbCache = {};
  function nbOf(R, K) {
    const key = R + 'x' + K;
    if (nbCache[key]) return nbCache[key];
    return (nbCache[key] = Array.from({ length: R * K }, (_, i) => {
      const r = Math.floor(i / K), c = i % K, out = [];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if ((dr || dc) && rr >= 0 && rr < R && cc >= 0 && cc < K) out.push(rr * K + cc);
      }
      return out;
    }));
  }
  const NB = nbOf(12, 12);
  function layMines(safe, rnd = Math.random, nb = NB, count = 22) {
    const ban = new Set([safe, ...nb[safe]]), pool = [], m = new Uint8Array(nb.length);
    for (let i = 0; i < nb.length; i++) if (!ban.has(i)) pool.push(i);
    for (let k = 0; k < count; k++) {
      const j = k + Math.floor(rnd() * (pool.length - k));
      [pool[k], pool[j]] = [pool[j], pool[k]];
      m[pool[k]] = 1;
    }
    return m;
  }
  const FLAG = '<svg viewBox="0 0 20 20"><path d="M6.5 3.2v12.6" stroke="#3b3f4f" stroke-width="1.9" stroke-linecap="round"/><path d="M7.3 3.4 15.6 7 7.3 10.6z" fill="#ef4444" stroke="#c81e1e" stroke-width=".8" stroke-linejoin="round"/><path d="M8.2 4.8 11 6" stroke="#ff9d9d" stroke-width="1.1" stroke-linecap="round"/><rect x="3.6" y="15.2" width="7.8" height="2.4" rx="1.2" fill="#3b3f4f"/></svg>';
  const MINE = '<svg viewBox="0 0 20 20"><g stroke="#1f2230" stroke-width="2" stroke-linecap="round"><path d="M10 2.4v15.2M2.4 10h15.2M4.6 4.6l10.8 10.8M15.4 4.6 4.6 15.4"/></g><circle cx="10" cy="10" r="5.4" fill="#1f2230"/><circle cx="8.2" cy="8.2" r="1.7" fill="#fff" opacity=".85"/></svg>';
  const FACE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#ffd23f" stroke="#e8a500" stroke-width="2"/><ellipse cx="15" cy="11" rx="7" ry="3.5" fill="#fff" opacity=".45"/><g class="f-ok"><circle cx="14.5" cy="17" r="2.3" fill="#3a2a10"/><circle cx="25.5" cy="17" r="2.3" fill="#3a2a10"/><path d="M13 24q7 6.5 14 0" stroke="#3a2a10" stroke-width="2.4" fill="none" stroke-linecap="round"/></g><g class="f-win"><path d="M9 16.5h22" stroke="#3a2a10" stroke-width="1.8"/><rect x="10" y="15" width="8.6" height="5.6" rx="2.6" fill="#3a2a10"/><rect x="21.4" y="15" width="8.6" height="5.6" rx="2.6" fill="#3a2a10"/><path d="M13 25q7 5.5 14 0" stroke="#3a2a10" stroke-width="2.4" fill="none" stroke-linecap="round"/></g><g class="f-lose" stroke="#3a2a10" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M12 14.5l5 5M17 14.5l-5 5M23 14.5l5 5M28 14.5l-5 5"/><path d="M14 28q6-5 12 0"/></g></svg>';
  const NUM = [null, '#2f6fed', '#1f9d55', '#e5383b', '#7b3fe4', '#d9480f', '#0f9aa8', '#2e2b40', '#7a8091'];
  const secs = v => v + ' s';
  const pad3 = v => String(Math.max(-99, Math.min(999, v))).padStart(3, '0');

  const isSolved = b => b.every((v, i) => v === (i + 1) % b.length);
  const adj = (g, n) => [g - n, g + n, g % n ? g - 1 : -1, g % n < n - 1 ? g + 1 : -1].filter(j => j >= 0 && j < n * n);
  function shuffle15(rnd = Math.random, n = 4) {
    const b = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
    let g = n * n - 1, last = -1;
    for (let k = 0; k < n * n * 14 || isSolved(b); k++) {
      const opts = adj(g, n).filter(j => j !== last), j = opts[Math.floor(rnd() * opts.length)];
      b[g] = b[j]; b[j] = 0; last = g; g = j;
    }
    return b;
  }
  function slideAt(b, i, n = Math.round(Math.sqrt(b.length))) {
    const g = b.indexOf(0);
    const step = i === g ? 0 : Math.floor(i / n) === Math.floor(g / n) ? Math.sign(i - g) : i % n === g % n ? n * Math.sign(i - g) : 0;
    if (!step) return 0;
    let k = 0;
    for (let p = g; p !== i; p += step) { b[p] = b[p + step]; b[p + step] = 0; k++; }
    return k;
  }
  const movesFmt = v => v + ' moves';
  const rr = (a, b) => a + Math.random() * (b - a);
  const cloud = (x, y, s) => `<g fill="#fff" opacity=".92" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="44" ry="17"/><ellipse cx="-14" cy="-12" rx="20" ry="16"/><ellipse cx="12" cy="-16" rx="24" ry="20"/></g>`;
  const grad = (id, a, b, x2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const SCENES = [
    () => {
      const sx = rr(240, 330), hx = rr(60, 150);
      let fl = '';
      for (let i = 0; i < 26; i++) fl += `<circle cx="${rr(0, 400) | 0}" cy="${rr(352, 396) | 0}" r="${rr(4, 7) | 0}" fill="${['#ff6b9a', '#ffd43b', '#fff', '#b197fc', '#ff922b'][i % 5]}"/>`;
      return `<defs>${grad('s', '#3fa9ff', '#ffe1f0', 1)}</defs><rect width="400" height="400" fill="url(#s)"/><g fill="none" stroke-width="13" opacity=".75">${['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].map((c, i) => `<path d="M${-10 + i * 13} 300a${150 - i * 13} ${150 - i * 13} 0 0 1 ${300 - i * 26} 0" stroke="${c}"/>`).join('')}</g><path d="M200 60q9-9 18 0q9-9 18 0M150 110q7-7 14 0q7-7 14 0" stroke="#3b3f4f" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="${sx}" cy="92" r="72" fill="#fff6c2" opacity=".55"/><circle cx="${sx}" cy="92" r="46" fill="#ffd43b"/>${cloud(rr(60, 120), 80, 1)}${cloud(rr(170, 220), 150, .7)}<path d="M0 238Q90 168 190 222T400 196V400H0Z" fill="#a3e15d"/><path d="M0 288Q130 222 250 276T400 266V400H0Z" fill="#5cc15a"/><path d="M0 344Q150 298 280 338T400 328V400H0Z" fill="#2f9e44"/><rect x="${hx}" y="246" width="62" height="46" rx="3" fill="#fff4e0"/><path d="M${hx - 8} 250 ${hx + 31} 214 ${hx + 70} 250Z" fill="#e5383b"/><rect x="${hx + 24}" y="266" width="15" height="26" fill="#8d5524"/><rect x="${hx + 6}" y="258" width="12" height="12" fill="#74c0fc"/><rect x="${hx + 200}" y="258" width="9" height="34" fill="#7a4a1f"/><circle cx="${hx + 204}" cy="246" r="24" fill="#2b8a3e"/><circle cx="${hx + 194}" cy="240" r="10" fill="#40c057" opacity=".8"/>${fl}`;
    },
    () => {
      const bx = rr(70, 170);
      return `<defs>${grad('s', '#ff4f9a', '#ffd08a', 1)}${grad('w', '#3aa6ee', '#0b4f8a')}</defs><rect width="400" height="400" fill="url(#s)"/>${(() => { const sx = rr(170, 240); let r = ""; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, b = a + .16; r += `<path d="M${sx} 232L${sx + Math.cos(a) * 420} ${232 + Math.sin(a) * 420}L${sx + Math.cos(b) * 420} ${232 + Math.sin(b) * 420}Z" fill="#fff" opacity=".16"/>`; } return r + `<circle cx="${sx}" cy="232" r="92" fill="#fff3b8" opacity=".45"/><circle cx="${sx}" cy="232" r="74" fill="#fff0a0"/>`; })()}${cloud(60, 70, .7)}${cloud(330, 170, .6)}<circle cx="310" cy="70" r="3" fill="#fff"/><path d="M250 100q10-10 20 0q10-10 20 0M300 140q8-8 16 0q8-8 16 0" stroke="#7a2e5a" stroke-width="4" fill="none" stroke-linecap="round"/><rect y="228" width="400" height="172" fill="url(#w)"/><g fill="#ffe8a3" opacity=".7"><rect x="150" y="246" width="110" height="6" rx="3"/><rect x="170" y="266" width="70" height="6" rx="3"/><rect x="186" y="286" width="40" height="5" rx="2.5"/></g><g stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"><path d="M30 320q15-10 30 0t30 0M260 350q15-10 30 0t30 0M120 375q15-10 30 0t30 0"/></g><path d="M${bx} 300h120l-20 30h-82Z" fill="#d9480f"/><rect x="${bx}" y="296" width="120" height="7" rx="3" fill="#a33a0b"/><path d="M${bx + 62} 194v104" stroke="#5a3214" stroke-width="5"/><path d="M${bx + 67} 200 ${bx + 67} 290 ${bx + 128} 290Z" fill="#fff"/><path d="M${bx + 57} 212 ${bx + 57} 290 ${bx + 10} 290Z" fill="#ffd43b"/><ellipse cx="335" cy="250" rx="58" ry="14" fill="#f2c27b"/><path d="M335 248q-6-48 10-78" stroke="#7a4a1f" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#2f9e44"><path d="M345 170q-34-14-52 6q26-6 52-6Z"/><path d="M345 170q30-20 52 0q-28-6-52 0Z"/><path d="M345 170q-10-30 6-44q0 22-6 44Z"/></g>`;
    },
    () => {
      const cols = ['#ff6b6b', '#ffd43b', '#4dabf7', '#b197fc', '#38d9a9', '#ff922b'];
      let bl = '';
      [[90, 120, 46], [250, 90, 40], [330, 220, 34], [160, 250, 38], [60, 300, 26]].forEach(([x, y, r], i) => {
        const c = cols[(i + (Math.random() * 6 | 0)) % 6];
        x += rr(-18, 18); y += rr(-14, 14);
        bl += `<path d="M${x - r * .5} ${y + r * .95}L${x - r * .22} ${y + r * 1.55}M${x + r * .5} ${y + r * .95}L${x + r * .22} ${y + r * 1.55}" stroke="#6b4a2a" stroke-width="2.5"/><rect x="${x - r * .26}" y="${y + r * 1.5}" width="${r * .52}" height="${r * .38}" rx="3" fill="#a0522d"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${r * .42}" ry="${r * 1.12}" fill="#fff" opacity=".35"/><ellipse cx="${x - r * .45}" cy="${y - r * .45}" rx="${r * .18}" ry="${r * .3}" fill="#fff" opacity=".6"/>`;
      });
      return `<defs>${grad('s', '#74d3ff', '#fde8ff')}</defs><rect width="400" height="400" fill="url(#s)"/>${cloud(300, 300, 1.1)}${cloud(80, 200, .8)}${cloud(200, 40, .9)}<path d="M0 360Q100 330 200 352T400 342V400H0Z" fill="#69db7c"/>${bl}`;
    },
    () => {
      let stars = '';
      for (let i = 0; i < 46; i++) stars += `<circle cx="${rr(0, 400) | 0}" cy="${rr(0, 400) | 0}" r="${rr(1, 3).toFixed(1)}" fill="#fff" opacity="${rr(.4, 1).toFixed(2)}"/>`;
      const px = rr(90, 150);
      return `<defs>${grad('s', '#1a1446', '#4b2a86')}</defs><rect width="400" height="400" fill="url(#s)"/>${stars}<circle cx="305" cy="92" r="46" fill="#fff3c4"/><circle cx="290" cy="80" r="9" fill="#f1dc9a"/><circle cx="318" cy="108" r="12" fill="#f1dc9a"/><circle cx="${px}" cy="262" r="66" fill="#ff8fab"/><path d="M${px - 66} 262a66 66 0 0 0 132 0" fill="#e0607e" opacity=".55"/><rect x="${px - 64}" y="240" width="128" height="10" fill="#ffd6e0" opacity=".6"/><ellipse cx="${px}" cy="262" rx="112" ry="22" fill="none" stroke="#ffd166" stroke-width="9" transform="rotate(-14 ${px} 262)"/><g transform="translate(${rr(250, 300)} 250) rotate(28)"><path d="M0-56q22 24 22 62h-44q0-38 22-62Z" fill="#f1f3f5"/><circle cy="-8" r="9" fill="#4dabf7" stroke="#495057" stroke-width="3"/><path d="M-22 6l-14 22h14zM22 6l14 22h-14z" fill="#e5383b"/><path d="M-12 10q12 44 24 0Z" fill="#ffa94d"/></g>`;
    }
  ];
  const picture = () => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${SCENES[Math.random() * SCENES.length | 0]()}</svg>`) + '")';

  Ameplay.register({
    id: 'slide',
    title: 'Slide 15',
    category: 'Puzzle',
    better: 'low',
    format: movesFmt,
    width: 600,
    blurb: 'Slide the tiles back into order in the fewest moves.',
    help: 'Tap a tile in line with the gap · <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> slide a tile into the gap · numbers or picture mode',
    icon: ICON('<rect x="7" y="7" width="14" height="14" rx="3.5"/><rect x="25" y="7" width="14" height="14" rx="3.5"/><rect x="43" y="7" width="14" height="14" rx="3.5"/><rect x="7" y="25" width="14" height="14" rx="3.5"/><rect x="25" y="25" width="14" height="14" rx="3.5"/><rect x="43" y="25" width="14" height="14" rx="3.5"/><rect x="7" y="43" width="14" height="14" rx="3.5"/><rect x="25" y="43" width="14" height="14" rx="3.5" fill="currentColor" opacity=".3"/><path d="M45 50h8M50 47l3 3-3 3"/>'),
    css: segCss('.gm-slide') + `
.gm-slide{gap:14px}
.gm-slide .opts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.gm-slide .g-hud{gap:6px 30px}
.gm-slide .board{position:relative;width:min(440px,100%);aspect-ratio:1;border-radius:22px;background:linear-gradient(150deg,#73304d,#4a1d33);box-shadow:inset 0 3px 0 rgba(255,255,255,.14),inset 0 -5px 0 rgba(0,0,0,.28),inset 0 0 0 calc(var(--g) * .5) rgba(0,0,0,.12),0 18px 34px -16px rgba(74,29,51,.75);container-type:inline-size;touch-action:none;--g:calc(8cqw / var(--n))}
.gm-slide .t{position:absolute;left:var(--g);top:var(--g);width:calc((100% - (var(--n) + 1) * var(--g)) / var(--n));aspect-ratio:1;display:grid;place-items:center;border-radius:calc(9cqw / var(--n));background:radial-gradient(130% 80% at 28% 10%,rgba(255,255,255,.6),rgba(255,255,255,0) 50%),repeating-linear-gradient(100deg,rgba(150,85,30,0) 0 7px,rgba(150,85,30,.13) 7px 8px,rgba(150,85,30,0) 8px 17px),linear-gradient(160deg,#ffe3b3,#f2b56b 58%,#d9914a);box-shadow:inset 0 2px 0 rgba(255,255,255,.75),inset 0 calc(-3.6cqw / var(--n)) 0 rgba(120,55,15,.38),0 calc(2.4cqw / var(--n)) calc(4cqw / var(--n)) rgba(30,5,15,.55);color:#6b3415;cursor:pointer;transition:translate .11s ease-out}
.gm-slide .t .n{font:900 calc(34cqw / var(--n))/1 var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-.03em;text-shadow:0 1px 0 rgba(255,255,255,.6),0 -1px 0 rgba(90,40,10,.25)}
.gm-slide .t::after{content:"";position:absolute;bottom:10%;left:50%;width:16%;height:5%;margin-left:-8%;border-radius:9px;background:#22b07d;box-shadow:0 0 6px rgba(34,176,125,.7);opacity:0;transition:opacity .2s}
.gm-slide .t.ok::after{opacity:1}
.gm-slide .board.pic .t{background:radial-gradient(130% 80% at 28% 10%,rgba(255,255,255,.35),rgba(255,255,255,0) 45%),var(--pic);background-size:100% 100%,calc(var(--n) * 100%) calc(var(--n) * 100%);background-position:0 0,var(--bp);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.22),0 calc(2.4cqw / var(--n)) calc(4cqw / var(--n)) rgba(30,5,15,.55)}
.gm-slide .board.pic .t .n{position:absolute;left:7%;top:7%;min-width:1.7em;padding:.22em .35em;border-radius:999px;background:rgba(31,29,43,.55);color:#fff;font-size:calc(13cqw / var(--n));text-align:center;text-shadow:none}
.gm-slide .board.pic .t::after{display:none}
.gm-slide .t.last{animation:gmsl-in .5s var(--ease) both}
.gm-slide .board.won.pic .t .n{opacity:0;transition:opacity .4s}
@media (hover:hover){.gm-slide .t.can:hover{filter:brightness(1.07)}}
.gm-slide .board.mix .t{transition:translate .5s var(--ease)}
.gm-slide .board.won .t{animation:gmsl-wave .55s var(--ease) var(--w) both}
@keyframes gmsl-wave{40%{scale:1.08}}
@keyframes gmsl-in{0%{opacity:0;scale:.6}100%{opacity:1;scale:1}}
`,
    mount(root, api) {
      const saved = api.load() || {};
      const st = { n: [3, 4, 5].includes(+saved.n) ? +saved.n : 4, pic: !!saved.pic, best: saved.best && typeof saved.best === 'object' ? saved.best : {} };
      const opts = el('div', 'opts', seg('n', [[3, '3×3'], [4, '4×4'], [5, '5×5']], st.n) + seg('pic', [['0', 'Numbers'], ['1', 'Picture']], st.pic ? '1' : '0'));
      const bar = el('div', 'g-hud', '<div class="g-stat"><span class="k">Moves</span><span class="v">0</span></div><div class="g-stat"><span class="k">Time</span><span class="v">0:00</span></div><div class="g-stat"><span class="k">Best</span><span class="v">—</span></div>');
      const board = el('div', 'board');
      root.append(opts, bar, board);
      const [movesEl, timeEl, bestEl] = bar.querySelectorAll('.v');
      let n, els, b, moves = 0, t0 = 0, timer = 0, locked = true, gen = 0;

      function place() {
        const g = b.indexOf(0);
        b.forEach((v, i) => {
          if (!v) return;
          const t = els[v];
          t.style.translate = pos(i, n);
          t.classList.toggle('ok', v === i + 1);
          t.classList.toggle('can', Math.floor(i / n) === Math.floor(g / n) || i % n === g % n);
        });
      }
      function tile(v) {
        const t = el('div', 't', `<span class="n">${v}</span>`), h = v - 1;
        t.dataset.v = v;
        t.style.setProperty('--w', ((h % n) + Math.floor(h / n)) * 45 + 'ms');
        t.style.setProperty('--bp', `${(h % n) / (n - 1) * 100}% ${Math.floor(h / n) / (n - 1) * 100}%`);
        return t;
      }
      function reset() {
        clearInterval(timer);
        const g = ++gen;
        n = st.n; moves = t0 = timer = 0; locked = true;
        board.style.setProperty('--n', n);
        board.classList.toggle('pic', st.pic);
        board.classList.remove('won');
        if (st.pic) board.style.setProperty('--pic', picture());
        board.textContent = '';
        els = [null];
        for (let v = 1; v < n * n; v++) els.push(tile(v));
        board.append(...els.slice(1));
        b = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
        place();
        movesEl.textContent = 0; timeEl.textContent = '0:00'; bestEl.textContent = st.best[n] ? st.best[n] : '—'; api.score(null);
        api.timeout(() => {
          if (g !== gen) return;
          b = shuffle15(Math.random, n); board.classList.add('mix'); place();
          api.timeout(() => { if (g === gen) { board.classList.remove('mix'); locked = false; } }, 520);
        }, 380);
      }
      function finish() {
        locked = true; clearInterval(timer);
        const s = (performance.now() - t0) / 1000;
        timeEl.textContent = clock(s);
        const own = !st.best[n] || moves < st.best[n];
        if (own) { st.best[n] = moves; api.save(st); bestEl.textContent = moves; }
        const nb = api.submit(moves);
        const last = tile(n * n);
        last.classList.add('last'); last.style.translate = pos(n * n - 1, n);
        board.append(last);
        const g = gen;
        api.timeout(() => { if (g === gen) { board.classList.add('won'); api.sfx('win'); } }, 260);
        api.timeout(() => g === gen && api.overlay({
          kicker: own || nb ? 'New best!' : 'Puzzle complete', title: 'Solved',
          stats: [['Moves', moves], ['Time', clock(s)], [n + '×' + n + ' best', movesFmt(st.best[n])]],
          button: 'Play again', onAction: reset
        }), 1500);
      }
      function tryMove(i) {
        if (locked || i < 0) return;
        const k = slideAt(b, i, n);
        if (!k) return;
        if (!t0) {
          t0 = performance.now();
          timer = api.interval(() => { timeEl.textContent = clock((performance.now() - t0) / 1000); }, 250);
        }
        moves += k; movesEl.textContent = moves; api.score(moves); api.sfx('tick');
        place();
        if (isSolved(b)) finish();
      }

      board.addEventListener('pointerdown', e => {
        if (e.button) return;
        const t = e.target.closest('.t');
        if (t && !t.classList.contains('last')) tryMove(b.indexOf(+t.dataset.v));
      });
      bindSeg(opts, (k, v) => {
        if (k === 'n') st.n = +v; else st.pic = v === '1';
        api.save(st); api.hideOverlay(); api.sfx('tap'); reset();
      });
      api.on(window, 'keydown', e => {
        const d = DIRS[e.code];
        if (!d || mods(e)) return;
        const g = b.indexOf(0), [dx, dy] = STEP[d], r = Math.floor(g / n) - dy, c = g % n - dx;
        if (r >= 0 && r < n && c >= 0 && c < n) tryMove(r * n + c);
      });

      reset();
    }
  });
})();

