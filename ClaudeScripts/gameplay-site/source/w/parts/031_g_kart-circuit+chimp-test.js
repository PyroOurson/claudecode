
(() => {
  'use strict';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;







  Ameplay.register({
    id: 'chimp-test',
    title: 'Chimp Test',
    category: 'Memory',
    blurb: 'Click the hidden numbers in order. Are you smarter than a chimp?',
    help: 'Click or tap the squares in order, starting with 1 · the rest hide after your first tap',
    better: 'high',
    format: v => v + ' numbers',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="22" height="22" rx="5"/><rect x="35" y="7" width="22" height="22" rx="5" fill="currentColor" opacity=".3"/><rect x="7" y="35" width="22" height="22" rx="5" fill="currentColor" opacity=".3"/><rect x="35" y="35" width="22" height="22" rx="5"/><path d="M15 14l4-2.5V24"/><path d="M41.5 42.5a4.5 4.5 0 0 1 9 .5c0 3-9 6.5-9 9.5h9.5"/></svg>',
    css: `
.gm-chimp-test .ct-pips{display:flex;gap:6px;align-items:center;height:28px}
.gm-chimp-test .ct-pip{position:relative;width:20px;height:20px;border-radius:50%;background:var(--sunk);box-shadow:inset 0 0 0 2px var(--line-2);transition:background .25s,box-shadow .25s}
.gm-chimp-test .ct-pip.on{background:var(--bad);box-shadow:0 4px 10px -3px rgba(239,79,79,.8);animation:gmChimpPop .5s var(--spring)}
.gm-chimp-test .ct-pip.on::before,.gm-chimp-test .ct-pip.on::after{content:"";position:absolute;left:5.5px;top:8.75px;width:9px;height:2.5px;border-radius:2px;background:#fff;transform:rotate(45deg)}
.gm-chimp-test .ct-pip.on::after{transform:rotate(-45deg)}
.gm-chimp-test .ct-board{position:relative;width:min(100%,800px);aspect-ratio:8/5;border-radius:24px;background:radial-gradient(130% 100% at 25% 0%,#5b8cff 0%,#3d5fe6 45%,#2b3bb4 100%);box-shadow:0 22px 44px -24px rgba(43,59,180,.85),inset 0 2px 0 rgba(255,255,255,.2);touch-action:manipulation;overflow:hidden;transition:box-shadow .35s var(--ease)}
.gm-chimp-test .ct-board::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 1.2px,transparent 1.6px);background-size:24px 24px;pointer-events:none}
.gm-chimp-test .ct-board.win{box-shadow:0 0 0 6px rgba(34,176,125,.55),0 22px 44px -24px rgba(34,176,125,.9)}
.gm-chimp-test .ct-board.lose{animation:gmChimpShake .4s}
.gm-chimp-test .ct-tile{position:absolute;width:calc(12.5% - 12px);height:calc(20% - 12px);margin:6px;box-sizing:border-box;display:grid;place-items:center;border-radius:clamp(8px,1.5vw,15px);border:3px solid rgba(255,255,255,.92);background:rgba(255,255,255,.1);color:#fff;font:900 clamp(17px,3.4vw,36px)/1 var(--sans);cursor:pointer;animation:gmChimpIn .42s var(--spring) both;box-shadow:0 8px 16px -10px rgba(0,0,0,.5);text-shadow:0 2px 0 rgba(0,0,0,.15)}
.gm-chimp-test .ct-tile:hover{background:rgba(255,255,255,.2)}
.gm-chimp-test .ct-tile.hid{background:linear-gradient(#fff,#e6ebff);border-color:#fff;color:transparent;text-shadow:none}
.gm-chimp-test .ct-tile.hid:hover{background:linear-gradient(#fff,#f2f4ff)}
.gm-chimp-test .ct-tile.done{animation:gmChimpOut .22s ease-out forwards;pointer-events:none}
.gm-chimp-test .ct-tile.hid.show{color:#3d5fe6}
.gm-chimp-test .ct-tile.next{box-shadow:0 0 0 4px #ffd23f,0 8px 16px -10px rgba(0,0,0,.5)}
.gm-chimp-test .ct-tile.bad{background:var(--bad);border-color:#fff;color:#fff;animation:gmChimpShake .4s}
.gm-chimp-test .ct-hint.on{color:var(--ink);font-weight:900}
.gm-chimp-test .ct-hint{margin:0;min-height:2.8em;font-weight:700;font-size:14px;text-align:center}
.gm-chimp-test .ct-board.tall{aspect-ratio:5/8;width:min(100%,calc((100dvh - 380px) * .625))}
.gm-chimp-test .ct-board.tall .ct-tile{width:calc(20% - 8px);height:calc(12.5% - 8px);margin:4px;font-size:22px}
@keyframes gmChimpIn{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:none}}
@keyframes gmChimpOut{to{opacity:0;transform:scale(.6)}}
@keyframes gmChimpPop{40%{transform:scale(1.35)}}
@keyframes gmChimpShake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
`,
    mount(root, api) {
      root.innerHTML = `<div class="g-hud"><div class="g-stat"><span class="k">Numbers</span><span class="v" data-n>4</span></div><div class="g-stat"><span class="k">Strikes</span><span class="v ct-pips"><i class="ct-pip"></i><i class="ct-pip"></i><i class="ct-pip"></i></span></div><div class="g-stat"><span class="k">Score</span><span class="v" data-s>0</span></div></div><div class="ct-board"></div><p class="g-muted ct-hint">Memorise the positions, then tap 1. The other numbers hide.</p>`;
      const board = root.querySelector('.ct-board'), msg = root.querySelector('.ct-hint'), HINT = msg.textContent;
      const nEl = root.querySelector('[data-n]'), sEl = root.querySelector('[data-s]'), pips = [...root.querySelectorAll('.ct-pip')];
      const COLS = 8, ROWS = 5, MAX = COLS * ROWS;
      board.classList.toggle('tall', root.clientWidth < 560);
      let n = 4, strikes = 0, score = 0, next = 1, lock = true, tiles = [], live = false;
      const say = t => { msg.textContent = t; msg.classList.add('on'); };
      function round() {
        board.classList.remove('win', 'lose');
        msg.classList.remove('on'); msg.textContent = HINT;
        tiles.forEach(t => t.el.remove());
        const tall = root.clientWidth < 560;
        board.classList.toggle('tall', tall);
        const cells = [...Array(MAX).keys()];
        for (let i = cells.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [cells[i], cells[j]] = [cells[j], cells[i]]; }
        tiles = cells.slice(0, n).map((c, i) => {
          const el = document.createElement('div');
          el.className = 'ct-tile'; el.textContent = i + 1; el.dataset.v = i + 1;
          el.style.left = (tall ? Math.floor(c / COLS) * 20 : (c % COLS) * 12.5) + '%'; el.style.top = (tall ? (c % COLS) * 12.5 : Math.floor(c / COLS) * 20) + '%';
          el.style.animationDelay = i * 22 + 'ms';
          board.append(el);
          return { el, v: i + 1 };
        });
        nEl.textContent = n; next = 1; lock = false;
      }
      function start() {
        n = 4; strikes = 0; score = 0; live = true;
        pips.forEach(p => p.classList.remove('on'));
        sEl.textContent = 0; api.score(0);
        round();
      }
      function over() {
        live = false; lock = true;
        const nb = api.submit(score);
        api.sfx(nb ? 'win' : 'lose');
        api.overlay({
          kicker: nb ? 'New best!' : 'Game over',
          title: score >= 9 ? 'Better than a chimp?' : score >= 6 ? 'Sharp memory' : 'Out of strikes',
          text: score ? `You remembered ${score} numbers at once. Chimpanzees in the original study handled about 9.` : 'Watch the positions before you click 1, then trust your memory.',
          stats: [['Numbers', score], ['Strikes', '3 / 3'], ['Best', api.best != null ? api.best : '—']],
          button: 'Play again',
          onAction: start
        });
      }
      api.on(board, 'pointerdown', e => {
        const el = e.target.closest('.ct-tile');
        if (!el || lock || !live || el.classList.contains('done')) return;
        e.preventDefault();
        const v = +el.dataset.v;
        if (v === next) {
          el.classList.add('done');
          if (next === 1) tiles.forEach(t => t.v !== 1 && t.el.classList.add('hid'));
          api.sfx('tap');
          if (++next > n) {
            lock = true; score = n; sEl.textContent = score; api.score(score);
            board.classList.add('win'); api.sfx('good');
            if (n >= MAX) { say('Perfect board!'); api.timeout(over, 900); return; }
            n++;
            say('Nice! ' + n + ' numbers next');
            api.timeout(round, 750);
          }
          return;
        }
        lock = true; strikes++;
        pips[strikes - 1].classList.add('on');
        el.classList.add('bad'); board.classList.add('lose');
        api.sfx('bad');
        tiles.forEach(t => { if (!t.el.classList.contains('done')) { t.el.classList.add('show'); if (t.v === next) t.el.classList.add('next'); } });
        if (strikes >= 3) { say('Strike 3 of 3'); api.timeout(over, 1400); }
        else { say(`Strike ${strikes} of 3 · try ${n} again`); api.timeout(round, 1600); }
      });
      api.overlay({
        kicker: 'Memory',
        title: 'Chimp Test',
        text: 'Numbers appear on the grid. Click 1 and the rest turn into blank squares. Click them in order from memory. Each clear adds a number; three strikes and you are out.',
        button: 'Play',
        onAction: start
      });
    }
  });
})();

