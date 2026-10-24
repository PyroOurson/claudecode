
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, system-ui, sans-serif';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const cubicOut = x => 1 - Math.pow(1 - x, 3);
  const backOut = x => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
  const pct = (a, b) => (b ? Math.round((100 * a) / b) + '%' : '—');
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const ms = v => Math.round(v) + ' ms';
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const uiScale = (canvas, w) => 1 / clamp((canvas.clientWidth || w) / w, 0.5, 1);

  const segCss = id => `
.gm-${id} .seg-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm-${id} .seg{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:var(--sunk)}
.gm-${id} .seg[hidden]{display:none}
.gm-${id} .seg button{height:32px;padding:0 14px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap}
.gm-${id} .seg button:hover{color:var(--ink)}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(108,92,231,.55)}
@media (max-width:520px){.gm-${id} .seg button{height:30px;padding:0 10px;font-size:12px}}
@media (pointer:coarse){.gm-${id} .seg button{height:40px}}`;
  function segBar(parent, groups, sel, onPick) {
    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    bar.innerHTML = groups.map(([k, items]) => `<div class="seg" data-g="${k}">${items.map(([v, t]) => `<button type="button" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    const sync = () => bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(sel[b.dataset.k] === b.dataset.v)));
    bar.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      b.blur();
      if (sel[b.dataset.k] === b.dataset.v) return;
      sel[b.dataset.k] = b.dataset.v;
      sync(); onPick(b.dataset.k);
    });
    sync(); parent.append(bar);
    return bar;
  }
  function layer(w, h, draw) {
    const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr); draw(g, w, h);
    return c;
  }
  function txt(ctx, s, x, y, size, color, align = 'center', outline) {
    ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = outline; ctx.strokeText(s, x, y); }
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }


  const RX = {
    classic: { name: 'Classic', n: 5, rule: 'Five tries, one honest average.' },
    endurance: { name: 'Endurance', n: 20, rule: 'Twenty tries in a row. Stay sharp to the last one.' },
    choice: { name: 'Choice', n: 6, rule: 'Green means go, red means hold. Tapping red adds 50 ms.' }
  };
  const PENALTY = 50;
  const verdict = v =>
    v < 200 ? ['Lightning reflexes', 'Faster than nearly everyone who tries.'] :
    v < 250 ? ['Sharp', 'Comfortably quicker than most people.'] :
    v < 300 ? ['Solid', 'Right around a typical human reaction.'] :
    v < 380 ? ['Warming up', 'Relax your hand, watch the centre and go again.'] :
    ['Keep practising', 'Rest a finger on the key and stay loose.'];
  const quip = v => (v < 200 ? 'Blazing!' : v < 250 ? 'Sharp!' : v < 300 ? 'Nice.' : 'Keep going.');

  Ameplay.register({
    id: 'reaction',
    title: 'Reaction',
    category: 'Reflex',
    blurb: 'Wait for green, then tap. Three modes, one honest average.',
    help: 'Click, tap or press <kbd>Space</kbd> the instant the light turns green · Classic, Endurance or Choice (never tap red)',
    better: 'low',
    format: v => Math.round(v) + ' ms',
    width: 760,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 16a20 20 0 0 1 20 20H32z" fill="currentColor" opacity=".3" stroke="none"/><circle cx="32" cy="36" r="20"/><path d="M27 8h10M32 8v8M47 20l3.5-3.5M32 36V25"/><circle cx="32" cy="36" r="2.5" fill="currentColor"/></svg>',
    css: segCss('reaction') + `
.gm-reaction{gap:14px}
.gm-reaction .rx-pad{position:relative;width:100%;height:clamp(250px,50vh,400px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;border-radius:var(--r-lg);color:#fff;cursor:pointer;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:#7a6af0 linear-gradient(160deg,#9586f8,#5a4ad8);box-shadow:inset 0 -6px 0 rgba(0,0,0,.12)}
.gm-reaction .rx-pad::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 88% 8%,rgba(255,255,255,.2) 0 13%,transparent 13.3%),radial-gradient(circle at 6% 104%,rgba(255,255,255,.14) 0 24%,transparent 24.3%),radial-gradient(circle at 50% 50%,rgba(255,255,255,.07) 0 40%,transparent 40.3%)}
.gm-reaction .rx-pad.wait{background:#ffa94d linear-gradient(160deg,#ffc145,#ff8a3d)}
.gm-reaction .rx-pad.go{background:#22c76f linear-gradient(160deg,#3ee08f,#11a55d)}
.gm-reaction .rx-pad.red,.gm-reaction .rx-pad.wrong{background:#ef4f4f linear-gradient(160deg,#ff6b6b,#d9334a)}
.gm-reaction .rx-pad.early{background:#e84393 linear-gradient(160deg,#ff7eb3,#d63384)}
.gm-reaction .rx-pad.res{background:#3d8bfd linear-gradient(160deg,#5cb8ff,#3d6bfd)}
.gm-reaction .rx-lamps{position:relative;display:flex;gap:10px;margin:0 0 18px;padding:8px 12px;border-radius:999px;background:rgba(20,16,40,.3)}
.gm-reaction .rx-lamps i{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.2)}
.gm-reaction .red .rx-lamps i:nth-child(1),.gm-reaction .wrong .rx-lamps i:nth-child(1),.gm-reaction .early .rx-lamps i:nth-child(1){background:#ff5252;box-shadow:0 0 14px 3px rgba(255,120,120,.9)}
.gm-reaction .wait .rx-lamps i:nth-child(2){background:#ffe066;box-shadow:0 0 14px 3px rgba(255,230,120,.95)}
.gm-reaction .go .rx-lamps i:nth-child(3){background:#c4ffd9;box-shadow:0 0 16px 4px rgba(200,255,220,.95)}
.gm-reaction .rx-k{position:relative;margin:0 0 6px;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.gm-reaction .rx-big{position:relative;margin:0;font-weight:900;font-size:clamp(38px,7vw,64px);line-height:1.05;letter-spacing:-.03em;font-variant-numeric:tabular-nums;text-shadow:0 3px 0 rgba(0,0,0,.13)}
.gm-reaction .go .rx-big{font-size:clamp(64px,13vw,120px)}
.gm-reaction .res .rx-big{font-size:clamp(70px,15vw,128px);line-height:.95}
.gm-reaction .res .rx-big::after{content:"ms";margin-left:8px;font-size:.28em;letter-spacing:.02em;opacity:.8}
.gm-reaction .rx-sub{position:relative;margin:14px auto 0;max-width:30em;min-height:1.4em;font-size:15px;font-weight:700;opacity:.92}
.gm-reaction .rx-slots{width:100%;display:grid;grid-template-columns:repeat(var(--c,5),minmax(0,1fr));gap:8px}
.gm-reaction .rx-slot{display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 4px 9px;border-radius:12px;border:2px solid transparent;background:var(--sunk)}
.gm-reaction .rx-slot span{font-size:10.5px;font-weight:900;color:var(--soft)}
.gm-reaction .rx-slot b{font-size:18px;font-weight:900;line-height:1.15;font-variant-numeric:tabular-nums;color:var(--line-2)}
.gm-reaction .rx-slot.cur{border-color:var(--accent);background:#fff}
.gm-reaction .rx-slot.fast b{color:#11a55d}
.gm-reaction .rx-slot.ok b{color:#3d6bfd}
.gm-reaction .rx-slot.slow b{color:#f17a2c}
.gm-reaction .rx-slot.best{border-color:#ffc145;background:#fff7dc}
.gm-reaction .rx-slots.many{gap:5px}
.gm-reaction .many .rx-slot{padding:4px 1px 5px;border-radius:9px}
.gm-reaction .many .rx-slot span{font-size:9px}
.gm-reaction .many .rx-slot b{font-size:13px}
@media (max-width:520px){.gm-reaction .rx-slots{gap:5px}.gm-reaction .rx-slot b{font-size:15px}.gm-reaction .many .rx-slot b{font-size:11px}.gm-reaction .rx-sub{font-size:13.5px}}
`,
    mount(root, api) {
      const saved = api.load() || {}, bests = saved.bests || {};
      const sel = { mode: RX[saved.mode] ? saved.mode : 'classic' };
      const store = () => api.save({ mode: sel.mode, bests });
      segBar(root, [['mode', Object.keys(RX).map(k => [k, RX[k].name])]], sel, () => { store(); setup(); });
      const pad = document.createElement('div'), slotsEl = document.createElement('div');
      pad.className = 'rx-pad';
      pad.innerHTML = '<div class="rx-lamps"><i></i><i></i><i></i></div><p class="rx-k"></p><p class="rx-big"></p><p class="rx-sub"></p>';
      slotsEl.className = 'rx-slots';
      root.append(pad, slotsEl);
      const [, kEl, bigEl, subEl] = pad.children;
      let M = RX[sel.mode], slots = [], times = [], state = 'idle', goAt = 0, goTime = 0, redEnd = 0, lock = 0;
      let decoy = false, reds = 0, mistakes = 0;


      const show = (cls, k, big, sub) => { pad.className = 'rx-pad ' + cls; kEl.textContent = k; bigEl.textContent = big; subEl.textContent = sub; };
      const label = () => `Attempt ${Math.min(times.length + 1, M.n)} of ${M.n}`;
      const mark = () => slots.forEach((s, i) => s.classList.toggle('cur', i === times.length));
      const result = () => mean(times) + PENALTY * mistakes;

      function setup() {
        M = RX[sel.mode]; times = []; mistakes = 0; reds = 0; state = 'idle'; lock = 0;
        slotsEl.style.setProperty('--c', Math.min(M.n, 10));
        slotsEl.classList.toggle('many', M.n > 10);
        slotsEl.innerHTML = Array.from({ length: M.n }, (_, i) => `<div class="rx-slot"><span>${i + 1}</span><b>–</b></div>`).join('');
        slots = [...slotsEl.children];
        mark(); api.score('—');
        show('idle', `${M.name} · ${M.n} tries`, 'Tap to start', M.rule);
      }
      function trial(msg) {
        state = 'wait';
        decoy = sel.mode === 'choice' && (times.length > 0 || mistakes > 0) && reds < 2 && Math.random() < 0.4;
        goTime = performance.now() + (sel.mode === 'choice' ? rand(900, 3000) : rand(1300, 4200));
        mark();
        show('wait', label(), 'Wait for green…', msg || (sel.mode === 'choice' ? 'Green means go. Red means hold.' : 'Tap the instant it turns green.'));
      }

      function present() {
        if (decoy) {
          state = 'red'; redEnd = performance.now() + rand(750, 1100);
          show('red', label(), 'Hold!', 'Red is a trap. Don’t tap.');
          return;
        }
        state = 'go';
        show('go', label(), 'Tap!', '');
        goAt = performance.now();
      }
      function hit(t) {
        const v = t - goAt;
        if (v < 100) return early('Under 100 ms is a guess, not a reaction.');
        const s = slots[times.length];
        times.push(v); reds = 0;
        const last = times.length === M.n;
        state = last ? 'done' : 'res'; lock = t + 250;
        show('res', `Attempt ${times.length} of ${M.n}`, String(Math.round(v)), last ? 'All done! Tallying up…' : quip(v) + ' Tap for the next one.');
        s.classList.remove('cur'); s.classList.add(v < 250 ? 'fast' : v < 330 ? 'ok' : 'slow');
        s.lastChild.textContent = Math.round(v);
        api.score(result());
        api.sfx('tap');
        if (last) api.timeout(finish, 900);
      }
      function early(msg) {
        state = 'early'; lock = performance.now() + 350;
        show('early', label(), 'Too soon!', msg || 'Wait for green. Tap to try again.');
        api.sfx('bad');
      }
      function wrong() {
        mistakes++; reds = 0; state = 'early'; lock = performance.now() + 350;
        show('wrong', label(), 'That was red!', `+${PENALTY} ms penalty. Tap to carry on.`);
        if (times.length) api.score(result());
        api.sfx('bad');
      }
      function finish() {
        if (state !== 'done') return;
        const avg = mean(times), final = Math.round(result()), fast = Math.min(...times), slow = Math.max(...times);
        slots[times.indexOf(fast)].classList.add('best');
        const nb = api.submit(final);
        if (bests[sel.mode] == null || final < bests[sel.mode]) { bests[sel.mode] = final; store(); }
        const [title, line] = verdict(final), sd = Math.round(Math.sqrt(mean(times.map(v => (v - avg) ** 2))));
        api.sfx(nb ? 'win' : 'good');
        api.overlay({
          kicker: nb ? 'New best!' : M.name + ' result',
          title: ms(final),
          text: `${title}. ${line}` + (mistakes ? ` Includes ${plural(mistakes, 'red tap')} (+${PENALTY * mistakes} ms).` : ''),
          stats: [['Average', ms(avg)], ['Fastest', ms(fast)], sel.mode === 'endurance' ? ['Spread', '±' + sd + ' ms'] : sel.mode === 'choice' ? ['Red taps', mistakes] : ['Slowest', ms(slow)], [M.name + ' best', ms(bests[sel.mode])]],
          button: 'Play again', onAction: () => { setup(); trial(); },
          secondary: 'Change mode', onSecondary: setup
        });
      }
      function press(t) {
        if (t < lock || state === 'done') return;
        if (state === 'go') hit(t);
        else if (state === 'wait') early();
        else if (state === 'red') wrong();
        else trial();
      }
      const stamp = e => { const now = performance.now(), t = e.timeStamp; return t > now - 1000 && t <= now + 1 ? t : now; };

      pad.addEventListener('pointerdown', e => {
        if (e.button) return;
        e.preventDefault();
        press(stamp(e));
      });
      api.on(window, 'keydown', e => {
        if (e.repeat) return;
        if (!(e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter')) return;
        if (e.target.matches && e.target.matches('button, a, input, textarea, select')) return;
        e.preventDefault(); press(stamp(e));
      });
      api.on(document, 'visibilitychange', () => {
        if (!document.hidden || !(state === 'wait' || state === 'go' || state === 'red')) return;
        state = 'paused';
        show('idle', label(), 'Paused', 'Tap or press Space to carry on.');
      });
      let tick = performance.now();
      api.loop(() => {
        const now = performance.now(), gap = now - tick;
        tick = now;
        if (gap > 400 && (state === 'wait' || state === 'go' || state === 'red')) {
          state = 'paused'; lock = now + 300;
          show('idle', label(), 'Paused', 'Tap or press Space to carry on.');
          return;
        }
        if (state === 'wait') { if (performance.now() >= goTime) present(); }
        else if (state === 'red' && performance.now() >= redEnd) { reds++; api.sfx('good'); trial('Nice hold! Now wait for green…'); }
      });

      const intro = () => {
        api.overlay({
          kicker: 'Reflex', title: 'Reaction',
          text: 'Wait for the light to turn green, then click, tap or press Space as fast as you can. Switch between Classic, Endurance and Choice above the pad.',
          button: 'Play', onAction: () => { setup(); trial(); }
        });
      };
      setup();
      intro();
    }
  });


  const AIM = { classic: 'Classic', precision: 'Precision', tracking: 'Tracking' };
  const AIM_D = {
    easy: { name: 'Easy', size: 1.22, life: 1.3, speed: 0.7 },
    normal: { name: 'Normal', size: 1, life: 1, speed: 1 },
    hard: { name: 'Hard', size: 0.8, life: 0.76, speed: 1.35 }
  };
  const AIM_TXT = {
    classic: 'Targets pop up, then shrink away. Gold centre 3, white ring 2, red edge 1.',
    precision: 'Small targets, bigger rewards: gold 5, white 3, red 1. Every missed click costs a point.',
    tracking: 'Targets glide around the range. Hit them on the move: gold 3, white 2, red 1.'
  };
  Ameplay.register({
    id: 'aim',
    title: 'Aim Trainer',
    category: 'Skill',
    blurb: 'Thirty seconds of targets. Hit the gold, waste no clicks.',
    help: 'Click or tap targets · gold centre scores most · modes: Classic, Precision, Tracking · Easy / Normal / Hard',
    better: 'high',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="19"/><circle cx="32" cy="32" r="10" opacity=".3"/><circle cx="32" cy="32" r="3.5" fill="currentColor"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8"/></svg>',
    css: segCss('aim') + `
.gm-aim{gap:12px}
.gm-aim .am-hud{gap:8px 36px}
.gm-aim .g-canvas{cursor:crosshair;box-shadow:0 10px 30px -18px rgba(108,92,231,.6)}
@media (max-width:520px){.gm-aim .am-hud{gap:6px 20px}}
`,
    mount(root, api) {
      const saved = api.load() || {}, bests = saved.bests || {};
      const sel = { mode: AIM[saved.mode] ? saved.mode : 'classic', diff: AIM_D[saved.diff] ? saved.diff : 'normal' };
      const store = () => api.save({ mode: sel.mode, diff: sel.diff, bests });
      segBar(root, [['mode', Object.entries(AIM)], ['diff', Object.entries(AIM_D).map(([k, d]) => [k, d.name])]], sel, () => { store(); ready(); });
      const narrow = root.clientWidth < 560;
      const W = narrow ? 480 : 800, H = narrow ? 600 : 500, ROUND = 30, IN = 0.2, TOP = 34;
      const hudEl = document.createElement('div');
      hudEl.className = 'g-hud am-hud';
      hudEl.innerHTML = ['Time', 'Hits', 'Accuracy', 'Streak'].map(k => `<div class="g-stat"><span class="k">${k}</span><span class="v"></span></div>`).join('');
      root.append(hudEl);
      const [tEl, hEl, aEl, sEl] = hudEl.querySelectorAll('.v');
      const cv = api.canvas(W, H), { canvas, ctx } = cv;
      const bg = layer(W, H, g => {
        const gr = g.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, '#e6f1ff'); gr.addColorStop(0.55, '#efe9ff'); gr.addColorStop(1, '#ffe9f1');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.55)';
        for (const [x, y, r] of [[W * 0.12, H * 0.82, 120], [W * 0.9, H * 0.18, 90], [W * 0.62, H * 0.95, 70]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
        g.fillStyle = 'rgba(108,92,231,.13)';
        for (let x = 16; x < W; x += 24) for (let y = TOP + 8; y < H; y += 24) g.fillRect(x - 1, y - 1, 2, 2);
      });
      const targets = [], fx = [];
      let mode = 'ready', D = AIM_D[sel.diff], time = 0, score = 0, hits = 0, stray = 0, escaped = 0, reactSum = 0, spawnT = 0, streak = 0, topStreak = 0, shown = '', clock = 0;

      const baseR = () => ({ classic: narrow ? 38 : 32, precision: narrow ? 19 : 15, tracking: narrow ? 31 : 26 })[sel.mode] * D.size;
      const sizeOf = t => {
        if (t.age < IN) return t.R * backOut(t.age / IN);
        if (sel.mode === 'classic') return t.R * Math.max(0, 1 - Math.pow((t.age - IN) / (t.life - IN), 2.2));
        return t.R * clamp((t.life - t.age) / 0.25, 0, 1);
      };
      function hud() {
        const s = `${Math.max(0, ROUND - time).toFixed(1)}|${hits}|${pct(hits, hits + stray + escaped)}|${streak}`;
        if (s === shown) return;
        shown = s;
        [tEl.textContent, hEl.textContent, aEl.textContent, sEl.textContent] = s.split('|');
      }
      function spawn(p) {
        const R = baseR() * (sel.mode === 'classic' ? lerp(1, 0.8, p) : 1);
        for (let k = 0; k < 40; k++) {
          const x = rand(R + 16, W - R - 16), y = rand(R + TOP + 10, H - R - 16);
          if (targets.every(t => Math.hypot(t.x - x, t.y - y) > t.R + R + 24)) {
            const life = (sel.mode === 'classic' ? lerp(2.5, 1.5, p) : sel.mode === 'precision' ? lerp(2.8, 1.9, p) : lerp(3.4, 2.4, p)) * D.life * rand(0.9, 1.1);
            targets.push({ x, y, R, age: 0, life, sp: sel.mode === 'tracking' ? lerp(130, 290, p) * D.speed : 0, a: rand(0, TAU), turn: rand(-1.6, 1.6) });
            return;
          }
        }
      }
      function burst(x, y, r, pts, zone) {
        const col = zone === 0 ? '#ffb627' : zone === 1 ? '#6c5ce7' : '#f2476f';
        fx.push({ k: 'ring', x, y, r, a: 0, life: 0.5, col });
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * TAU + rand(-0.2, 0.2), sp = rand(160, 300);
          fx.push({ k: 'dot', x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, a: 0, life: rand(0.4, 0.65), col: C.hues[i % 6], s: rand(2, 3.6) });
        }
        fx.push({ k: 'txt', x, y: y - r - 8, a: 0, life: 0.8, col, s: '+' + pts });
      }
      function ready() {
        mode = 'ready'; D = AIM_D[sel.diff];
        time = score = hits = stray = escaped = streak = topStreak = reactSum = 0; shown = '';
        targets.length = 0; fx.length = 0;
        api.score('—'); hud();
      }
      function begin() {
        ready();
        mode = 'play'; spawnT = 0;
        api.score(0);
      }
      function end() {
        mode = 'end';
        targets.forEach(t => fx.push({ k: 'fade', x: t.x, y: t.y, r: sizeOf(t), a: 0, life: 0.35 }));
        targets.length = 0;
        const nb = api.submit(score), key = sel.mode + '-' + sel.diff;
        if (score > (bests[key] || 0)) { bests[key] = score; store(); }
        api.sfx(nb ? 'win' : 'good');
        api.timeout(() => api.overlay({
          kicker: nb ? 'New best!' : `${AIM[sel.mode]} · ${D.name}`,
          title: plural(score, 'point'),
          text: `${plural(escaped, 'target')} got away, ${plural(stray, 'stray click')}. Longest streak ${topStreak}.`,
          stats: [['Hits', hits], ['Accuracy', pct(hits, hits + stray + escaped)], ['Reaction', hits ? Math.round((reactSum / hits) * 1000) + ' ms' : '—'], ['Mode best', bests[key] || '—']],
          button: 'Play again', onAction: begin,
          secondary: 'Change mode', onSecondary: ready
        }), 550);
      }

      canvas.addEventListener('pointerdown', e => {
        if (e.button) return;
        e.preventDefault();
        if (mode === 'ready') { begin(); return; }
        if (mode !== 'play') return;
        const { x, y } = cv.toLocal(e), slop = e.pointerType === 'touch' ? 12 : 3;
        for (let i = targets.length - 1; i >= 0; i--) {
          const t = targets[i], r = sizeOf(t), d = Math.hypot(x - t.x, y - t.y);
          if (d > r + slop) continue;
          const zone = d <= r * 0.3 + 1.5 ? 0 : d <= r * 0.64 ? 1 : 2;
          let pts = (sel.mode === 'precision' ? [5, 3, 1] : [3, 2, 1])[zone];
          targets.splice(i, 1);
          hits++; streak++; topStreak = Math.max(topStreak, streak); reactSum += t.age;
          if (streak % 10 === 0) { pts += 5; fx.push({ k: 'txt', x: W / 2, y: H / 2, a: 0, life: 1, col: '#ff8a3d', s: `Streak ${streak}! +5`, big: 1 }); }
          score += pts;
          burst(t.x, t.y, r, pts, zone);
          api.sfx(zone === 0 ? 'good' : 'pop'); api.score(score); hud();
          return;
        }
        stray++; streak = 0;
        if (sel.mode === 'precision' && score > 0) { score--; api.score(score); }
        fx.push({ k: 'x', x, y, a: 0, life: 0.6 });
        hud();
      });
      api.on(window, 'keydown', e => { if (mode === 'ready' && !e.repeat && (e.code === 'Space' || e.code === 'Enter')) begin(); });

      const disc = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
      const ring = (x, y, r, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); };
      const seg = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
      function target(x, y, r, a = 1) {
        if (r < 0.5) return;
        ctx.globalAlpha = a * 0.16; disc(x + r * 0.08 + 2, y + r * 0.14 + 3, r, '#3b1b4a');
        ctx.globalAlpha = a;
        disc(x, y, r, '#d9305a'); disc(x, y, r * 0.9, '#f5527a');
        disc(x, y, r * 0.64, '#ffffff'); ring(x, y, r * 0.47, 'rgba(245,82,122,.35)', Math.max(1, r * 0.04));
        disc(x, y, r * 0.3, '#f59e0b'); disc(x, y, r * 0.24, '#ffd04a');
        ctx.globalAlpha = a * 0.4; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.44, r * 0.3, r * 0.14, -0.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }

      function draw() {
        const ui = uiScale(canvas, W);
        ctx.drawImage(bg, 0, 0, W, H);
        const rem = mode === 'ready' ? 1 : 1 - time / ROUND;
        ctx.lineCap = 'round'; ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(108,92,231,.15)'; seg(20, 17, W - 20, 17);
        if (rem > 0.002) { ctx.strokeStyle = rem > 0.5 ? '#7c6cf0' : rem > 0.2 ? '#ffa94d' : '#ef4f4f'; seg(20, 17, 20 + (W - 40) * rem, 17); }

        if (mode === 'ready') {
          target(W / 2, H / 2 + 6, (narrow ? 50 : 44) * (1 + Math.sin(clock * 3) * 0.04));
          txt(ctx, `${AIM[sel.mode]} · ${AIM_D[sel.diff].name}`, W / 2, H / 2 - 82 * Math.min(ui, 1.3), 26 * Math.min(ui, 1.3), C.ink);
          txt(ctx, 'Click or tap the target to start', W / 2, H / 2 + 86 * Math.min(ui, 1.3), 17 * Math.min(ui, 1.3), C.muted);
        }
        for (const t of targets) {
          const r = sizeOf(t);
          if (t.sp) { ctx.globalAlpha = 0.18; disc(t.x - Math.cos(t.a) * r * 0.7, t.y - Math.sin(t.a) * r * 0.7, r * 0.85, '#f5527a'); ctx.globalAlpha = 1; }
          target(t.x, t.y, r);
        }
        for (const f of fx) {
          const k = f.a / f.life, e = cubicOut(k);
          ctx.globalAlpha = 1 - k;
          if (f.k === 'ring') ring(f.x, f.y, f.r + 34 * e, f.col, 3 * (1 - k) + 0.5);
          else if (f.k === 'dot') disc(f.x, f.y, f.s * (1 - k * 0.5), f.col);
          else if (f.k === 'gone') ring(f.x, f.y, 4 + 16 * e, '#f5527a', 2);
          else if (f.k === 'fade') target(f.x, f.y, f.r * (1 - e), 1 - k);
          else if (f.k === 'txt') {
            ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
            const sz = (f.big ? 34 : 26) * Math.min(ui, 1.4);
            txt(ctx, f.s, f.x, f.y - 24 * e, sz, f.col, 'center', '#fff');
          } else if (f.k === 'x') {
            const s = 5 + 3 * e;
            ctx.globalAlpha = k < 0.3 ? 1 : 1 - (k - 0.3) / 0.7;
            ctx.strokeStyle = C.bad; ctx.lineWidth = 3;
            seg(f.x - s, f.y - s, f.x + s, f.y + s); seg(f.x + s, f.y - s, f.x - s, f.y + s);
          }
        }
        ctx.globalAlpha = 1;
      }

      api.loop(dt => {
        clock += dt;
        if (mode === 'play') {
          time = Math.min(ROUND, time + dt);
          const p = time / ROUND;
          for (let i = targets.length - 1; i >= 0; i--) {
            const t = targets[i];
            t.age += dt;
            if (t.sp) {
              t.a += t.turn * dt;
              if (Math.random() < dt * 0.8) t.turn = rand(-1.8, 1.8);
              t.x += Math.cos(t.a) * t.sp * dt; t.y += Math.sin(t.a) * t.sp * dt;
              if (t.x < t.R + 8 || t.x > W - t.R - 8) { t.x = clamp(t.x, t.R + 8, W - t.R - 8); t.a = Math.PI - t.a; }
              if (t.y < t.R + TOP || t.y > H - t.R - 8) { t.y = clamp(t.y, t.R + TOP, H - t.R - 8); t.a = -t.a; }
            }
            if (t.age >= t.life) { targets.splice(i, 1); escaped++; streak = 0; fx.push({ k: 'gone', x: t.x, y: t.y, a: 0, life: 0.45 }); }
          }
          const max = sel.mode === 'classic' ? 3 : 2, gap = sel.mode === 'classic' ? lerp(0.85, 0.4, p) : sel.mode === 'precision' ? lerp(1, 0.6, p) : lerp(1.1, 0.7, p);
          spawnT -= dt;
          if (!targets.length || (spawnT <= 0 && targets.length < max)) { spawn(p); spawnT = gap; }
          hud();
          if (time >= ROUND) end();
        }
        for (let i = fx.length - 1; i >= 0; i--) {
          const f = fx[i];
          f.a += dt;
          if (f.a >= f.life) { fx.splice(i, 1); continue; }
          if (f.k === 'dot') { const d = Math.exp(-5 * dt); f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= d; f.vy *= d; }
        }
        draw();
      });

      ready();
      api.overlay({
        kicker: 'Skill', title: 'Aim Trainer',
        text: `30 seconds per round. ${AIM_TXT[sel.mode]} Pick a mode and difficulty above the range.`,
        button: 'Play', onAction: begin
      });
    }
  });


  const WM_NUM = [7, 8, 9, 4, 5, 6, 1, 2, 3], WM_LET = ['KeyQ', 'KeyW', 'KeyE', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX', 'KeyC'];
  const WM_KEYS = {};
  WM_NUM.forEach((n, i) => { WM_KEYS['Digit' + n] = i; WM_KEYS['Numpad' + n] = i; WM_KEYS[WM_LET[i]] = i; });
  Ameplay.register({
    id: 'whack',
    title: 'Whack-a-Mole',
    category: 'Reflex',
    blurb: 'Bop the moles, grab the golden one and never touch a bomb.',
    help: 'Click or tap the moles · keys <kbd>1</kbd>–<kbd>9</kbd> (numpad layout) or <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> / <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / <kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> · golden mole +5 · bombs −5',
    better: 'high',
    width: 640,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="50" rx="23" ry="6"/><path d="M19 50V36a13 13 0 0 1 26 0v14"/><circle cx="27" cy="35" r="2" fill="currentColor" stroke="none"/><circle cx="37" cy="35" r="2" fill="currentColor" stroke="none"/><path d="M21 12l3 5M32 8v6M43 12l-3 5" opacity=".3"/></svg>',
    css: segCss('whack') + `
.gm-whack{gap:12px}
.gm-whack .wm-hud{gap:8px 34px}
.gm-whack .g-canvas{cursor:pointer;box-shadow:0 12px 30px -18px rgba(60,110,30,.8)}
@media (max-width:520px){.gm-whack .wm-hud{gap:6px 20px}}
`,
    mount(root, api) {
      const W = 600, H = 560, TOP = 46, CW = W / 3, CH = (H - TOP) / 3, LEVEL_T = 25, HRX = 58, HRY = 17;
      const hudEl = document.createElement('div');
      hudEl.className = 'g-hud wm-hud';
      hudEl.innerHTML = ['Level', 'Time', 'Goal', 'Combo'].map(k => `<div class="g-stat"><span class="k">${k}</span><span class="v"></span></div>`).join('');
      root.append(hudEl);
      const vEls = [...hudEl.querySelectorAll('.v')];
      const cv = api.canvas(W, H), { canvas, ctx } = cv;
      const mkHoles = (cols, cw) => Array.from({ length: cols * 3 }, (_, i) => ({ x: cw * (i % cols + 0.5), y: TOP + CH * Math.floor(i / cols) + CH * 0.68, st: 0, t: 0, dur: 0, kind: 'mole', rise: 0, r0: 0, blink: rand(1, 4), own: (i % cols) * 2 < cols ? 0 : 1, who: 0 }));
      const holes = mkHoles(3, CW);
      const fx = [], mallets = [];
      let mode = 'ready', level = 1, time = 0, score = 0, lvlPts = 0, hits = 0, swings = 0, bombs = 0, combo = 0, maxCombo = 0, spawnT = 0, bannerT = 0, shake = 0, clock = 0, shown = '';

      const quota = (L = level) => 8 + 4 * L;
      const tier = () => ({
        dur: Math.max(0.48, 1.2 * Math.pow(0.88, level - 1)),
        gap: Math.max(0.26, 0.78 * Math.pow(0.88, level - 1)),
        max: Math.min(4, 1 + Math.ceil(level / 2)),
        bomb: Math.min(0.3, 0.1 + 0.03 * level)
      });


      const buildBg = (holes, HRX, HRY) => layer(W, H, g => {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#b4e46a'); gr.addColorStop(1, '#6cb43c');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.08)';
        for (let i = 0; i < 9; i += 2) g.fillRect(0, TOP + i * (H - TOP) / 9, W, (H - TOP) / 9);
        g.fillStyle = 'rgba(40,80,20,.18)'; g.fillRect(0, 0, W, TOP);
        let seed = 7;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        g.strokeStyle = '#5c9c33'; g.lineWidth = 2.2; g.lineCap = 'round';
        for (let i = 0; i < 70; i++) {
          const x = rnd() * W, y = TOP + 10 + rnd() * (H - TOP - 10);
          g.beginPath(); g.moveTo(x - 4, y - 7); g.lineTo(x, y); g.lineTo(x + 1, y - 10); g.moveTo(x, y); g.lineTo(x + 5, y - 6); g.stroke();
        }
        for (let i = 0; i < 16; i++) {
          const x = rnd() * W, y = TOP + 10 + rnd() * (H - TOP - 10), col = ['#fff', '#ffd166', '#ff8fab'][i % 3];
          g.fillStyle = col;
          for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.256) * 3.2, y + Math.sin(k * 1.256) * 3.2, 2.4, 0, TAU); g.fill(); }
          g.fillStyle = '#f59e0b'; g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill();
        }
        for (const h of holes) {
          g.fillStyle = 'rgba(40,70,20,.25)'; g.beginPath(); g.ellipse(h.x + 3, h.y + 9, HRX + 18, HRY + 12, 0, 0, TAU); g.fill();
          const mg = g.createLinearGradient(0, h.y - 26, 0, h.y + 26);
          mg.addColorStop(0, '#b37a45'); mg.addColorStop(1, '#7d4d28');
          g.fillStyle = mg; g.beginPath(); g.ellipse(h.x, h.y + 3, HRX + 16, HRY + 10, 0, 0, TAU); g.fill();
          const hg = g.createLinearGradient(0, h.y - HRY, 0, h.y + HRY);
          hg.addColorStop(0, '#1f120a'); hg.addColorStop(1, '#4a2e1a');
          g.fillStyle = hg; g.beginPath(); g.ellipse(h.x, h.y, HRX, HRY, 0, 0, TAU); g.fill();
        }
      });

      const buildFront = (holes, HRX, HRY) => layer(W, H, g => {
        for (const h of holes) {
          g.fillStyle = '#8f5b31';
          g.beginPath(); g.ellipse(h.x, h.y + 3, HRX + 16, HRY + 10, 0, 0, Math.PI); g.ellipse(h.x, h.y, HRX, HRY, 0, Math.PI, 0, true); g.fill();
          g.fillStyle = 'rgba(255,255,255,.12)';
          g.beginPath(); g.ellipse(h.x, h.y + 3, HRX + 16, HRY + 10, 0, 0.15, Math.PI - 0.15); g.ellipse(h.x, h.y + 6, HRX + 8, HRY + 4, 0, Math.PI - 0.15, 0.15, true); g.fill();
          g.fillStyle = '#6f4321';
          for (let k = -2; k <= 2; k++) { g.beginPath(); g.arc(h.x + k * 22, h.y + HRY + 7 + (k & 1) * 2, 3, 0, TAU); g.fill(); }
        }
      });

      const bg = buildBg(holes, HRX, HRY), front = buildFront(holes, HRX, HRY);

      function hud() {
        const next = `${level}|${Math.max(0, Math.ceil(LEVEL_T - time))}|${lvlPts}/${quota()}|${combo > 1 ? '×' + combo : '—'}`;
        if (next === shown) return;
        shown = next;
        next.split('|').forEach((s, i) => { vEls[i].textContent = s; });
      }
      const pop = (x, y, s, col, big) => fx.push({ k: 'txt', x, y, s, col, t: 0, life: 0.8, big });
      function stars(x, y, n, cols) {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + rand(-0.3, 0.3), sp = rand(140, 280);
          fx.push({ k: 'star', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, t: 0, life: rand(0.45, 0.7), col: cols[i % cols.length], s: rand(4, 7), r: rand(0, TAU) });
        }
      }
      function spawnIn(h, p) {
        const T = tier(), r = Math.random(), bombOk = time > 2;
        h.kind = bombOk && r < T.bomb ? 'bomb' : r > 0.94 ? 'gold' : 'mole';
        h.st = 1; h.t = 0;
        h.dur = T.dur * lerp(1, 0.85, p) * rand(0.85, 1.15) * (h.kind === 'bomb' ? 1.3 : h.kind === 'gold' ? 0.72 : 1);
      }
      function whack(i, px, py) {
        const h = holes[i];
        mallets.push({ x: px == null ? h.x + 30 : px, y: py == null ? h.y - 70 : py, t: 0 });
        if (mode !== 'play') return;
        swings++;
        if (h.st !== 1) { combo = 0; hud(); api.sfx('tick'); return; }
        const age = h.t;
        h.st = 2; h.t = 0;
        if (h.kind === 'bomb') {
          bombs++; combo = 0; score = Math.max(0, score - 5); lvlPts = Math.max(0, lvlPts - 5);
          shake = 9; h.st = 0; h.rise = 0;
          stars(h.x, h.y - 50, 16, ['#ff8a3d', '#ffd166', '#ef4f4f', '#3a3a48']);
          pop(h.x, h.y - 110, '−5', C.bad, true);
          api.sfx('bad');
        } else {
          const pts = h.kind === 'gold' ? 5 : age < 0.4 ? 2 : 1;
          score += pts; lvlPts += pts; hits++; combo++; maxCombo = Math.max(maxCombo, combo);
          stars(h.x, h.y - 60, h.kind === 'gold' ? 14 : 8, h.kind === 'gold' ? ['#ffd166', '#fff3b0', '#ffb627'] : ['#fff', '#ffd166', '#ff8fab']);
          pop(h.x, h.y - 112, '+' + pts, h.kind === 'gold' ? '#f59e0b' : pts === 2 ? C.accent : '#fff', h.kind === 'gold');
          api.sfx(h.kind === 'gold' ? 'good' : 'hit');
          if (lvlPts >= quota() && lvlPts - pts < quota()) { pop(W / 2, TOP + 24, 'Goal reached!', '#22b07d', true); api.sfx('good'); }
        }
        api.score(score); hud();
      }
      function startLevel(L) {
        level = L; time = 0; lvlPts = 0; spawnT = 0.6; mode = 'play';
        hud();
      }
      function begin() {
        score = hits = swings = bombs = combo = maxCombo = 0;
        holes.forEach(h => { h.st = 0; h.t = 0; h.rise = 0; });
        fx.length = 0; mallets.length = 0;
        api.score(0); startLevel(1);
      }
      function levelEnd() {
        holes.forEach(h => { if (h.st === 1) { h.st = 3; h.t = 0; h.r0 = h.rise; } });
        if (lvlPts >= quota()) { mode = 'between'; bannerT = 2; api.sfx('win'); return; }
        mode = 'end';
        const nb = api.submit(score);
        api.sfx(nb ? 'win' : 'lose');
        api.timeout(() => api.overlay({
          kicker: nb ? 'New best!' : 'Time’s up',
          title: plural(score, 'point'),
          text: `Level ${level} needed ${quota()} and you got ${lvlPts}. Longest combo ${maxCombo}${bombs ? `, ${plural(bombs, 'bomb')} hit` : ''}.`,
          stats: [['Level', level], ['Hits', hits], ['Accuracy', pct(hits, swings)], ['Best', api.best ?? '—']],
          button: 'Play again', onAction: begin
        }), 650);
      }

      canvas.addEventListener('pointerdown', e => {
        if (e.button) return;
        e.preventDefault();
        const { x, y } = cv.toLocal(e);
        const c = clamp(Math.floor(x / CW), 0, 2), r = clamp(Math.floor((y - TOP) / CH), 0, 2);
        whack(r * 3 + c, x, y);
      });
      api.on(window, 'keydown', e => {
        const i = WM_KEYS[e.code];
        if (i == null || e.repeat) return;
        whack(i);
      });

      function layout() {
        mode = 'ready'; time = 0; level = 1; shake = 0;
        holes.forEach(h => { h.st = 0; h.t = 0; h.rise = 0; });
        fx.length = 0; mallets.length = 0;
        api.score('—'); hud();
        holes[4].st = 1; holes[4].kind = 'mole'; holes[4].dur = Infinity;
      }

      function mole(h) {
        const gold = h.kind === 'gold', hit = h.st === 2, sq = hit ? 1 - 0.22 * Math.min(1, h.t / 0.06) : 1;
        ctx.save();
        ctx.translate(h.x, h.y + 10 + (1 - h.rise) * 112);
        ctx.scale(hit ? 1.1 : 1, sq);
        if (h.kind === 'bomb') {
          const bg2 = ctx.createRadialGradient(-12, -62, 4, 0, -46, 42);
          bg2.addColorStop(0, '#6a6a80'); bg2.addColorStop(1, '#15151f');
          ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(0, -46, 38, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ef4f4f'; ctx.fillRect(-38, -50, 76, 9);
          ctx.fillStyle = '#4a4a5c'; ctx.beginPath(); ctx.roundRect(-10, -92, 20, 12, 3); ctx.fill();
          ctx.strokeStyle = '#c99a5b'; ctx.lineWidth = 4; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(0, -92); ctx.quadraticCurveTo(10, -108, 22, -104); ctx.stroke();
          const fl = 7 + Math.sin(clock * 40) * 2.5;
          ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(23, -105, fl, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.arc(23, -105, fl * 0.55, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-15, -66, 11, 6, -0.6, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.moveTo(-20, -34); ctx.lineTo(-6, -30); ctx.lineTo(-20, -26); ctx.fill();
          ctx.beginPath(); ctx.moveTo(20, -34); ctx.lineTo(6, -30); ctx.lineTo(20, -26); ctx.fill();
          ctx.restore();
          return;
        }
        const bodyG = ctx.createLinearGradient(-42, 0, 42, 0);
        bodyG.addColorStop(0, gold ? '#ffe27a' : '#a8714a'); bodyG.addColorStop(1, gold ? '#e3a008' : '#76462a');
        ctx.fillStyle = gold ? '#d48f00' : '#6b3f24';
        ctx.beginPath(); ctx.arc(-31, -80, 10, 0, TAU); ctx.arc(31, -80, 10, 0, TAU); ctx.fill();
        ctx.fillStyle = bodyG;
        ctx.beginPath(); ctx.moveTo(-42, 30); ctx.lineTo(-42, -52); ctx.bezierCurveTo(-42, -108, 42, -108, 42, -52); ctx.lineTo(42, 30); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-20, -80, 11, 7, -0.6, 0, TAU); ctx.fill();
        ctx.fillStyle = gold ? '#fff3c4' : '#f2c9a0';
        ctx.beginPath(); ctx.ellipse(0, -30, 24, 18, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(239,71,111,.35)';
        ctx.beginPath(); ctx.arc(-28, -36, 7, 0, TAU); ctx.arc(28, -36, 7, 0, TAU); ctx.fill();
        if (hit) {
          ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
          for (const s of [-1, 1]) {
            const ex = 15 * s, ey = -60;
            ctx.beginPath(); ctx.moveTo(ex - 5, ey - 5); ctx.lineTo(ex + 5, ey + 5); ctx.moveTo(ex + 5, ey - 5); ctx.lineTo(ex - 5, ey + 5); ctx.stroke();
          }
        } else if (h.blink < 0.12) {
          ctx.strokeStyle = '#1d1b26'; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-20, -60); ctx.lineTo(-10, -60); ctx.moveTo(10, -60); ctx.lineTo(20, -60); ctx.stroke();
        } else {
          ctx.fillStyle = '#1d1b26';
          ctx.beginPath(); ctx.ellipse(-15, -60, 5.5, 7, 0, 0, TAU); ctx.ellipse(15, -60, 5.5, 7, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(-13.5, -62.5, 2, 0, TAU); ctx.arc(16.5, -62.5, 2, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = '#ef476f'; ctx.beginPath(); ctx.ellipse(0, -42, 10, 7, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-3, -44, 3.5, 2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(-7, -32, 14, 10, 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, -22); ctx.stroke();
        if (gold) {
          ctx.fillStyle = '#ffd166'; ctx.strokeStyle = '#d48f00'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-18, -92); ctx.lineTo(-20, -112); ctx.lineTo(-9, -102); ctx.lineTo(0, -116); ctx.lineTo(9, -102); ctx.lineTo(20, -112); ctx.lineTo(18, -92); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#ef476f'; ctx.beginPath(); ctx.arc(0, -100, 3, 0, TAU); ctx.fill();
        }
        if (hit) {
          for (let k = 0; k < 3; k++) {
            const a = clock * 6 + (k * TAU) / 3;
            star(Math.cos(a) * 30, -100 + Math.sin(a) * 8, 6, '#ffd166', a);
          }
        }
        ctx.restore();
      }
      function star(x, y, s, col, rot) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.fillStyle = col; ctx.beginPath();
        for (let k = 0; k < 10; k++) { const r = k & 1 ? s * 0.45 : s, a = (k * Math.PI) / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.fill(); ctx.restore();
      }
      function mallet(m) {
        const k = m.t / 0.22, sw = k < 0.45 ? lerp(-1.1, 0.25, cubicOut(k / 0.45)) : 0.25;
        ctx.save();
        ctx.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
        ctx.translate(m.x + 46, m.y + 10); ctx.rotate(sw);
        ctx.fillStyle = '#e9b872'; ctx.beginPath(); ctx.roundRect(-6, -4, 70, 9, 4); ctx.fill();
        ctx.translate(-14, 0);
        ctx.fillStyle = m.c || '#ef476f'; ctx.beginPath(); ctx.roundRect(-18, -26, 36, 52, 9); ctx.fill();
        ctx.fillStyle = m.c2 || '#c9305a'; ctx.beginPath(); ctx.roundRect(4, -26, 14, 52, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-18, -17, 36, 6); ctx.fillRect(-18, 11, 36, 6);
        ctx.restore();
      }

      function draw(dt) {
        ctx.save();
        if (shake > 0) { ctx.translate(rand(-shake, shake), rand(-shake, shake)); shake = Math.max(0, shake - dt * 40); }
        ctx.drawImage(bg, 0, 0, W, H);

        const q = quota(), f = clamp(lvlPts / q, 0, 1), bx = 16, bw = W - 32;
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.roundRect(bx, 13, bw, 20, 10); ctx.fill();
        if (f > 0) { ctx.fillStyle = f >= 1 ? '#22c76f' : '#ffd166'; ctx.beginPath(); ctx.roundRect(bx, 13, Math.max(20, bw * f), 20, 10); ctx.fill(); }
        txt(ctx, mode === 'ready' ? 'Hit the goal before time runs out' : f >= 1 ? `Goal reached · ${lvlPts}/${q}` : `Level ${level} goal · ${lvlPts}/${q}`, W / 2, 24, 13, '#1d3b12');
        for (const h of holes) {
          if (h.rise <= 0.001) continue;
          ctx.save();
          ctx.beginPath(); ctx.rect(h.x - CW / 2, h.y - 150, CW, 150); ctx.moveTo(h.x + HRX, h.y); ctx.ellipse(h.x, h.y, HRX, HRY, 0, 0, Math.PI); ctx.clip();
          mole(h);
          ctx.restore();
        }
        ctx.drawImage(front, 0, 0, W, H);
        for (const p of fx) {
          const k = p.t / p.life;
          ctx.globalAlpha = 1 - k;
          if (p.k === 'star') star(p.x, p.y, p.s, p.col, p.r);
          else {
            ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
            txt(ctx, p.s, p.x, p.y - 30 * cubicOut(k), p.big ? 34 : 28, p.col, 'center', 'rgba(30,40,20,.55)');
          }
        }
        ctx.globalAlpha = 1;
        for (const m of mallets) mallet(m);
        if (mode === 'between') {
          const a = Math.min(1, (2 - bannerT) / 0.25, bannerT / 0.3);
          ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#1d3b12'; ctx.fillRect(0, H / 2 - 70, W, 140);
          ctx.globalAlpha = a;
          txt(ctx, `Level ${level + 1}`, W / 2, H / 2 - 18, 52, '#fff', 'center', 'rgba(0,0,0,.25)');
          txt(ctx, `Goal ${quota(level + 1)} · the moles get quicker!`, W / 2, H / 2 + 32, 18, '#ffd166');
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      api.loop(dt => {
        clock += dt;
        if (mode === 'play') {
          time = Math.min(LEVEL_T, time + dt);
          const p = time / LEVEL_T, T = tier();
          spawnT -= dt;
          let active = 0;
          for (const h of holes) if (h.st === 1 || h.st === 2) active++;
          if (spawnT <= 0 && active < T.max) {
            const free = holes.filter(h => h.st === 0);
            if (free.length) { spawnIn(free[(Math.random() * free.length) | 0], p); spawnT = T.gap * lerp(1, 0.8, p) * rand(0.7, 1.3); }
          }
          if (time >= LEVEL_T) levelEnd();
          hud();
        } else if (mode === 'between' && (bannerT -= dt) <= 0) startLevel(level + 1);
        for (const h of holes) {
          h.blink -= dt;
          if (h.blink < 0) h.blink = rand(1.5, 4);
          if (!h.st) continue;
          h.t += dt;
          if (h.st === 1) {
            h.rise = backOut(Math.min(1, h.t / 0.14));
            if (h.t >= h.dur) {
              if (h.kind !== 'bomb' && mode === 'play') { combo = 0; hud(); }
              h.st = 3; h.t = 0; h.r0 = h.rise;
            }
          } else if (h.st === 2) { if (h.t >= 0.3) { h.st = 3; h.t = 0; h.r0 = h.rise; } }
          else if (h.st === 3) {
            h.rise = h.r0 * (1 - Math.min(1, h.t / 0.14));
            if (h.t >= 0.14) { h.st = 0; h.rise = 0; }
          }
        }
        for (let i = fx.length - 1; i >= 0; i--) {
          const p = fx[i];
          if ((p.t += dt) >= p.life) { fx.splice(i, 1); continue; }
          if (p.k === 'star') { p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6; }
        }
        for (let i = mallets.length - 1; i >= 0; i--) if ((mallets[i].t += dt) >= 0.22) mallets.splice(i, 1);
        draw(dt);
      });

      const intro = () => {
        api.overlay({
          kicker: 'Reflex', title: 'Whack-a-Mole',
          text: 'Bop moles as they pop up (a quick bop scores double). Golden moles are worth 5, bombs cost 5. Reach each level’s goal before the 25 seconds run out to move on.',
          button: 'Play', onAction: () => { layout(); begin(); }
        });
      };
      layout();
      intro();
    }
  });
})();

