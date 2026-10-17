
(() => {
  'use strict';
  const C = Ameplay.colors;
  const TAU = Math.PI * 2;
  const F = (px, w = 900) => `${w} ${px}px Nunito, system-ui, sans-serif`;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const easeIO = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const onControl = e => !!(e.target && e.target.closest && e.target.closest('button, a, input, textarea, select'));
  const evT = e => { const n = performance.now(), t = e && e.timeStamp; return t > 0 && t <= n + 1 && n - t < 400 ? t : n; };
  const fold = (u, lo, hi) => { const L = hi - lo, x = ((u % (2 * L)) + 2 * L) % (2 * L); return x <= L ? lo + x : hi - (x - L); };
  const DESC = 'display:block;margin-top:10px;font-size:13.5px;font-weight:700;color:var(--muted)';

  function sweeper() {
    let t0 = 0, u0 = 0, v = 0;
    const u = t => u0 + v * Math.max(0, t - t0) / 1000;
    return { u, run(t, vel) { u0 = u(t); t0 = t; v = vel; }, freeze(t) { u0 = u(t); t0 = t; v = 0; }, reset(t, vel) { t0 = t; u0 = 0; v = vel; } };
  }

  const chips = (key, names, cur) => `<span class="g-row" style="margin-top:14px;gap:6px">${names.map((n, i) => `<button class="g-btn sm${i === cur ? '' : ' ghost'}" data-opt="${key}${i}">${n}</button>`).join('')}</span>`;
  function bindOpts(root, api, fn) {
    const f = root.parentNode;
    const mark = (key, v) => { if (f) f.querySelectorAll(`[data-opt^="${key}"]`).forEach(x => x.classList.toggle('ghost', x.dataset.opt !== key + v)); };
    if (f) api.on(f, 'click', e => {
      const b = e.target.closest && e.target.closest('[data-opt]');
      if (!b) return;
      const key = b.dataset.opt[0], v = +b.dataset.opt.slice(1);
      mark(key, v); api.sfx('tap'); fn(key, v);
    });
    return mark;
  }
  const setDesc = (root, html) => { const d = root.parentNode && root.parentNode.querySelector('[data-desc]'); if (d) d.innerHTML = html; };

  function makeFx() {
    const ps = [], rings = [], txt = [];
    return {
      burst(x, y, n, cols, sp = 220, life = .7, size = 6, grav = 600) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU, v = sp * (.35 + Math.random() * .65);
          ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .3, l: life * (.6 + Math.random() * .4), m: life, s: size * (.6 + Math.random() * .8), c: cols[i % cols.length], r: Math.random() * TAU, vr: rnd(-9, 9), g: grav, sq: i % 3 === 0 });
        }
      },
      ring(x, y, r0, r1, c, life = .5, w = 5) { rings.push({ x, y, r0, r1, c, l: life, m: life, w }); },
      text(x, y, s, c, size = 28, life = .9) { txt.push({ x, y, s, c, size, l: life, m: life }); },
      clear() { ps.length = 0; rings.length = 0; txt.length = 0; },
      update(dt) {
        for (let i = ps.length; i--;) {
          const p = ps[i];
          if ((p.l -= dt) <= 0) { ps.splice(i, 1); continue; }
          p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985; p.r += p.vr * dt;
        }
        for (let i = rings.length; i--;) if ((rings[i].l -= dt) <= 0) rings.splice(i, 1);
        for (let i = txt.length; i--;) { const t = txt[i]; if ((t.l -= dt) <= 0) txt.splice(i, 1); else t.y -= 40 * dt; }
      },
      draw(ctx) {
        for (const r of rings) {
          const k = 1 - r.l / r.m;
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.c; ctx.lineWidth = r.w * (1 - k) + .5;
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * easeOut(k), 0, TAU); ctx.stroke();
        }
        for (const p of ps) {
          ctx.globalAlpha = Math.min(1, p.l / p.m * 2); ctx.fillStyle = p.c;
          if (p.sq) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s / 2, 0, TAU); ctx.fill(); }
        }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        for (const t of txt) {
          const k = 1 - t.l / t.m, sc = k < .15 ? .6 + k / .15 * .5 : 1.1 - Math.min(.1, (k - .15) * .5);
          ctx.globalAlpha = Math.min(1, t.l / t.m * 3);
          ctx.font = F(Math.round(t.size * sc));
          ctx.fillStyle = 'rgba(31,29,43,.3)'; ctx.fillText(t.s, t.x, t.y + 3);
          ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y);
        }
        ctx.globalAlpha = 1;
      }
    };
  }

  const PS_MODES = [
    { name: 'Classic', desc: 'One miss ends the run. Every stop shrinks the zone and speeds up the marker.', v0: .55, vmax: 1.6, g: 1.055, w0: .2, shrink: .92, wmin: .045, pts: 1, bg: ['#c9a2f0', '#8448c2'] },
    { name: 'Zen', desc: '60 calm seconds with no game over. A miss only resets your streak.', v0: .42, vmax: .85, g: 1.025, w0: .22, shrink: .965, wmin: .1, pts: 1, time: 60, bg: ['#8ee8d6', '#22958d'] },
    { name: 'Hardcore', desc: 'Fast marker, tiny zone, double points. One miss ends it.', v0: .82, vmax: 2.1, g: 1.06, w0: .14, shrink: .9, wmin: .035, pts: 2, bg: ['#ffa0ad', '#c42e5c'] }
  ];
  const CONF = ['#ffd166', '#4fd38e', '#ffffff', '#ff8fab', '#9bf6ff'];
  const SPARK = [[64, 58, 13, '#ffd166', 0], [586, 74, 10, '#fff', 1.7], [570, 286, 12, '#ffd166', 3.1], [82, 282, 9, '#fff', 4.4], [210, 40, 7, '#fff', 2.3]];

  Ameplay.register({
    id: 'perfect-stop',
    title: 'Perfect Stop',
    category: 'Timing',
    blurb: 'Stop the sweeping marker inside the zone. It only gets tighter.',
    help: '<kbd>Space</kbd>, click or tap to stop the marker · land on the green centre for a Perfect',
    better: 'high',
    width: 700,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="23" width="52" height="18" rx="6"/><rect x="29" y="27" width="16" height="10" rx="2.5" fill="currentColor" opacity=".3" stroke="none"/><path d="M38 17v30"/><circle cx="38" cy="14" r="3" fill="currentColor"/></svg>',
    css: `.gm-perfect-stop{touch-action:none;cursor:pointer}.gm-perfect-stop.g-root{min-height:440px}.gm-perfect-stop .g-hud{gap:8px 44px}`,
    mount(root, api) {
      const W = 640, H = 320, TX = 40, TW = W - 80, TY = 186, TH = 68, GX = TX + 22, GW = TW - 44, GY = TY + 16, GH = TH - 32, MM = .06, HOLD = 550;
      root.innerHTML = `<div class="g-hud">
          <div class="g-stat"><span class="k">Score</span><span class="v" data-k="s">0</span></div>
          <div class="g-stat"><span class="k">Perfects</span><span class="v" data-k="p">0</span></div>
          <div class="g-stat"><span class="k" data-k="k3">Speed</span><span class="v" data-k="v3">1.0x</span></div>
        </div>`;
      const q = s => root.querySelector(s);
      const scoreEl = q('[data-k="s"]'), perfEl = q('[data-k="p"]'), k3 = q('[data-k="k3"]'), v3 = q('[data-k="v3"]');
      const { ctx } = api.canvas(W, H);
      const fx = makeFx(), SW = sweeper();
      const sv = Object.assign({ mode: 0, best: [] }, api.load() || {});
      if (!PS_MODES[sv.mode]) sv.mode = 0;
      if (!Array.isArray(sv.best)) sv.best = [];
      let M = PS_MODES[sv.mode];
      let st = 'menu', zc = .66, zw = M.w0, tw = null, holdUntil = 0, endAt = 0, run = 0, lastSec = -1;
      let score = 0, streak = 0, topStreak = 0, hits = 0, perfects = 0, v = M.v0;
      let shake = 0, bump = 0, flash = 0, flashC = '#fff', glow = 0, deadT = 0;

      const soft = s => {
        if (s > 1 - MM) { const d = s - (1 - MM); return 1 - MM + d - d * d / (4 * MM); }
        if (s < MM) { const d = MM - s; return MM - d + d * d / (4 * MM); }
        return s;
      };
      const at = t => soft(fold(SW.u(t), -MM, 1 + MM));
      SW.run(performance.now(), .3);

      function pickZone(w, avoid) {
        let c = .5;
        for (let i = 0; i < 40; i++) {
          c = w / 2 + .03 + Math.random() * (1 - w - .06);
          if (Math.abs(c - zc) > .18 && Math.abs(c - avoid) > w / 2 + .12) break;
        }
        return c;
      }
      const slideTo = (c, w, delay) => { tw = { c0: zc, w0: zw, c1: c, w1: w, t: -delay, d: .38 }; };
      function hud() {
        scoreEl.textContent = score; perfEl.textContent = perfects;
        k3.textContent = M.time ? 'Time' : 'Speed';
        v3.textContent = M.time ? (st === 'menu' ? M.time : Math.max(0, Math.ceil((endAt - performance.now()) / 1000))) + 's' : (v / .55).toFixed(1) + 'x';
      }

      function stop(e) {
        if (st !== 'play') return;
        const t = evT(e), x = at(t);
        SW.freeze(t);
        const d = Math.abs(x - zc);
        if (d <= zw / 2) hit(x, d <= zw * .1); else miss(d - zw / 2, x);
      }
      function hit(x, perfect) {
        hits++; streak++; topStreak = Math.max(topStreak, streak);
        score += (perfect ? 3 : 1) * M.pts;
        if (perfect) perfects++;
        v = Math.min(M.vmax, M.v0 * Math.pow(M.g, hits));
        hud(); api.score(score);
        const mx = GX + x * GW, my = GY + GH / 2;
        fx.burst(mx, my, perfect ? 30 : 12, perfect ? CONF : ['#fff', '#ffd166', '#ffe9a8'], perfect ? 320 : 210, .85, 8, 700);
        if (perfect) { fx.ring(mx, my, 12, 120, '#fff', .55, 6); flash = .5; flashC = '#fff'; }
        fx.text(clamp(mx, 90, W - 90), TY - 52, perfect ? 'PERFECT!' : 'GOOD', perfect ? '#ffd166' : '#fff', perfect ? 32 : 26);
        if (streak % 10 === 0) fx.text(W / 2, 30, streak + ' STREAK!', '#fff', 22, 1.2);
        bump = 1; glow = 1;
        api.sfx(perfect ? 'good' : 'tap');
        const nw = Math.max(M.wmin, zw * M.shrink);
        slideTo(pickZone(nw, x), nw, .1);
        st = 'hold'; holdUntil = performance.now() + HOLD;
      }
      function miss(dist, x) {
        const mx = GX + x * GW;
        shake = 1; flash = .6; flashC = '#ff3b5c'; deadT = .6;
        fx.text(clamp(mx, 90, W - 90), TY - 52, 'MISS', '#ffd6dd', 28);
        fx.burst(mx, GY + GH / 2, 10, ['#ff5d6c', '#fff'], 180, .6, 6, 600);
        if (M.time) {
          streak = 0; api.sfx('bad');
          slideTo(pickZone(zw, x), zw, .25);
          st = 'hold'; holdUntil = performance.now() + 800;
          return;
        }
        st = 'over'; deadT = 99; api.sfx('lose');
        const id = run;
        api.timeout(() => { if (id === run && st === 'over') finish(dist < .012 ? 'So close!' : 'Missed!'); }, 900);
      }
      function finish(title) {
        const isNew = api.submit(score);
        if (score > (sv.best[sv.mode] || 0)) { sv.best[sv.mode] = score; api.save(sv); }
        api.overlay({
          kicker: isNew ? 'New best!' : M.name, title,
          stats: [['Score', score], ['Streak', topStreak], ['Perfects', perfects], ['Best', sv.best[sv.mode] || '—']],
          button: 'Play again', onAction: startRun, secondary: 'Modes', onSecondary: menu
        });
      }
      function startRun() {
        run++;
        const now = performance.now();
        score = streak = topStreak = hits = perfects = 0; v = M.v0; deadT = 0; shake = 0; fx.clear();
        SW.freeze(now);
        slideTo(pickZone(M.w0, at(now)), M.w0, 0);
        st = 'hold'; holdUntil = now + HOLD; endAt = M.time ? now + HOLD + M.time * 1000 : 0; lastSec = -1;
        hud(); api.score(0);
      }
      function menu() {
        run++; st = 'menu'; deadT = 0;
        SW.run(performance.now(), .3);
        hud();
        api.overlay({
          kicker: 'Timing', title: 'Perfect Stop',
          text: `Stop the sweeping marker inside the yellow zone. Land on the green centre for a Perfect worth triple.${chips('m', PS_MODES.map(m => m.name), sv.mode)}<span data-desc style="${DESC}">${M.desc}</span>`,
          button: 'Play', onAction: startRun
        });
      }
      function setMode(i) {
        if (st !== 'menu' || !PS_MODES[i]) return;
        sv.mode = i; M = PS_MODES[i]; api.save(sv);
        zw = M.w0; v = M.v0;
        setDesc(root, M.desc); hud();
      }
      const mark = bindOpts(root, api, (k, i) => { if (k === 'm') setMode(i); });

      const pillP = (x, y, w, h) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); };
      const circ = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
      function star4(x, y, r) {
        ctx.beginPath(); ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
        ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
      }
      function draw(now) {
        const bg = ctx.createRadialGradient(W * .55, H * .35, 10, W * .55, H * .4, W * .75);
        bg.addColorStop(0, M.bg[0]); bg.addColorStop(1, M.bg[1]);
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        const t = now / 1000, dead = deadT > 0;
        ctx.save();
        if (shake > 0) ctx.translate(Math.sin(now * .09) * 10 * shake, Math.cos(now * .11) * 4 * shake);
        ctx.fillStyle = 'rgba(255,255,255,.08)';
        circ(W * .55, 150, 150 + bump * 18); circ(W * .55, 150, 96 + bump * 10);
        for (const [x, y, r, c, ph] of SPARK) { ctx.fillStyle = c; ctx.globalAlpha = .85; star4(x, y, r * (.7 + .3 * Math.sin(t * 2.2 + ph))); }
        ctx.globalAlpha = 1;
        const sc = 1 + bump * .2;
        ctx.save(); ctx.translate(W / 2, 84); ctx.scale(sc, sc);
        ctx.font = F(80); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(40,10,70,.25)'; ctx.fillText(streak, 0, 6);
        ctx.fillStyle = '#fff'; ctx.fillText(streak, 0, 0);
        ctx.restore();
        ctx.font = F(13); ctx.letterSpacing = '3px'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center';
        ctx.fillText('STREAK', W / 2, 136); ctx.letterSpacing = '0px';

        ctx.fillStyle = 'rgba(40,10,70,.28)'; pillP(TX + 8, TY + 16, TW, TH); ctx.fill();
        ctx.fillStyle = '#251a38'; pillP(TX, TY + 9, TW, TH); ctx.fill();
        ctx.fillStyle = '#3a2a58'; pillP(TX, TY, TW, TH); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.09)'; pillP(TX + 14, TY + 4, TW - 28, 9); ctx.fill();
        ctx.fillStyle = '#1b1229'; pillP(GX, GY, GW, GH); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.2)';
        for (let i = 1; i < 10; i++) circ(GX + GW * i / 10, GY + GH + 8, i === 5 ? 2.6 : 1.7);

        const zx = GX + (zc - zw / 2) * GW, zp = zw * GW;
        ctx.save(); pillP(GX, GY, GW, GH); ctx.clip();
        if (!dead && glow > 0) { ctx.fillStyle = `rgba(255,209,102,${(glow * .35).toFixed(3)})`; ctx.fillRect(zx - 14 * glow, GY, zp + 28 * glow, GH); }
        ctx.fillStyle = dead ? '#6b5f80' : '#ffd166'; ctx.fillRect(zx, GY, zp, GH);
        ctx.fillStyle = dead ? '#857a99' : '#4fd38e'; ctx.fillRect(zx + zp * .4, GY, zp * .2, GH);
        ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.fillRect(zx, GY, zp, 7);
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(zx, GY + GH - 6, zp, 6);
        ctx.fillStyle = '#fff'; ctx.fillRect(zx + zp / 2 - 1, GY + 6, 2, GH - 12);
        if (glow > 0) { ctx.fillStyle = `rgba(255,255,255,${(glow * .55).toFixed(3)})`; ctx.fillRect(zx, GY, zp, GH); }
        ctx.restore();

        const mx = GX + at(now) * GW;
        if (st === 'play') {
          ctx.fillStyle = 'rgba(255,255,255,.14)';
          for (let i = 1; i <= 3; i++) { const gx = GX + at(now - i * 14) * GW; ctx.beginPath(); ctx.roundRect(gx - 9, TY - 22, 18, TH + 44, 9); ctx.fill(); }
        }
        ctx.fillStyle = 'rgba(30,10,50,.32)'; ctx.beginPath(); ctx.roundRect(mx - 5, TY - 16, 18, TH + 46, 9); ctx.fill();
        const mc = dead ? '#ff5d6c' : '#fff';
        ctx.fillStyle = mc; ctx.beginPath(); ctx.roundRect(mx - 9, TY - 22, 18, TH + 44, 9); ctx.fill();
        ctx.fillStyle = dead ? '#d63a4c' : '#e4dcf3'; ctx.fillRect(mx + 2, TY - 14, 4, TH + 28);
        ctx.fillStyle = mc; ctx.beginPath(); ctx.moveTo(mx - 12, TY - 40); ctx.lineTo(mx + 12, TY - 40); ctx.lineTo(mx, TY - 27); ctx.closePath(); ctx.fill();
        ctx.restore();

        if (M.time) {
          const k = st === 'menu' ? 1 : clamp((endAt - now) / (M.time * 1000), 0, 1);
          ctx.fillStyle = 'rgba(255,255,255,.25)'; pillP(TX, H - 26, TW, 10); ctx.fill();
          ctx.fillStyle = k < .15 ? '#ffd6dd' : '#fff'; pillP(TX, H - 26, Math.max(10, TW * k), 10); ctx.fill();
        } else {
          ctx.font = F(12); ctx.letterSpacing = '2px'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(`${M.name.toUpperCase()} · BEST ${sv.best[sv.mode] || 0}`, W / 2, H - 22); ctx.letterSpacing = '0px';
        }
        fx.draw(ctx);
        if (flash > 0) { ctx.globalAlpha = flash * .35; ctx.fillStyle = flashC; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      }

      api.loop((dt, now) => {
        if (tw) {
          tw.t += dt;
          if (tw.t > 0) {
            const k = easeIO(Math.min(1, tw.t / tw.d));
            zc = tw.c0 + (tw.c1 - tw.c0) * k; zw = tw.w0 + (tw.w1 - tw.w0) * k;
            if (tw.t >= tw.d) tw = null;
          }
        }
        if (st === 'hold' && now >= holdUntil) { SW.run(holdUntil, v); st = 'play'; }
        if (M.time && (st === 'play' || st === 'hold')) {
          const sec = Math.max(0, Math.ceil((endAt - now) / 1000));
          if (sec !== lastSec) { lastSec = sec; v3.textContent = sec + 's'; if (sec > 0 && sec <= 5) api.sfx('tick'); }
          if (now >= endAt) { st = 'over'; SW.freeze(now); api.sfx('win'); finish('Time!'); }
        }
        shake = Math.max(0, shake - dt * 2.2); bump = Math.max(0, bump - dt * 4); flash = Math.max(0, flash - dt * 3);
        glow = Math.max(0, glow - dt * 3.5); deadT = Math.max(0, deadT - dt);
        fx.update(dt);
        draw(now);
      });
      api.on(window, 'keydown', e => {
        if (st === 'menu' && /^Digit[1-3]$/.test(e.code)) { const i = +e.code[5] - 1; setMode(i); mark('m', i); api.sfx('tap'); return; }
        if ((e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') || e.repeat || onControl(e)) return;
        e.preventDefault(); stop(e);
      });
      api.on(root, 'pointerdown', e => { if (e.button === 0 && !onControl(e)) stop(e); });
      menu();
    }
  });

  const ST_MODES = [
    { name: 'Classic', desc: 'Slabs speed up slowly as the tower climbs.', v0: 190, dv: 7, vmax: 430 },
    { name: 'Speed', desc: 'Fast slabs from the very first drop, and they keep getting faster.', v0: 310, dv: 10, vmax: 600 }
  ];
  Ameplay.register({
    id: 'stack',
    title: 'Stack',
    category: 'Timing',
    blurb: 'Drop each slab dead on top. Any overhang gets sliced away.',
    help: '<kbd>Space</kbd>, click or tap to drop the block · line it up exactly for a Perfect',
    better: 'high',
    width: 620,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="44" width="34" height="10" rx="2"/><rect x="16" y="34" width="30" height="10" rx="2"/><rect x="16" y="24" width="24" height="10" rx="2"/><rect x="44" y="10" width="10" height="9" rx="2" transform="rotate(24 49 14.5)" fill="currentColor" opacity=".3" stroke="none"/><path d="M40 26l6 6M46 18v6" opacity=".3"/></svg>',
    css: `.gm-stack{touch-action:none;cursor:pointer}`,
    mount(root, api) {
      const W = 520, H = 680, S0 = 150, BH = 26, K = .866, TOL = 5, ANCHOR = 370;
      const { ctx } = api.canvas(W, H);
      const fx = makeFx(), SW = sweeper();
      const sv = Object.assign({ mode: 0, best: [] }, api.load() || {});
      if (!ST_MODES[sv.mode]) sv.mode = 0;
      if (!Array.isArray(sv.best)) sv.best = [];
      let M = ST_MODES[sv.mode];
      let st = 'menu', blocks = [], cur = null, pieces = [], rings = [], msg = null, run = 0;
      let score = 0, perfects = 0, pstreak = 0, camY = 0, camS = 1, hue0 = rnd(0, 360), bgH = hue0, shake = 0;
      const bubbles = Array.from({ length: 14 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(6, 26), p: rnd(.15, .45) }));
      const col = h => ({ t: `hsl(${h},82%,69%)`, l: `hsl(${h},70%,55%)`, r: `hsl(${(h + 8) % 360},64%,43%)` });
      const hueAt = lv => (hue0 + lv * 9) % 360;
      const top = () => blocks[blocks.length - 1];
      const speed = () => Math.min(M.vmax, M.v0 + M.dv * score);

      function reset() {
        hue0 = rnd(0, 360); bgH = hue0;
        blocks = [{ x: -S0 / 2, z: -S0 / 2, w: S0, d: S0, level: 0, c: col(hueAt(0)) }];
        pieces = []; rings = []; msg = null; fx.clear();
        score = perfects = pstreak = 0;
        spawn(performance.now());
      }
      function spawn(t) {
        const b = top(), level = b.level + 1, ax = level % 2 ? 'x' : 'z', R = S0 * 1.3, c = ax === 'x' ? b.x : b.z;
        cur = { x: b.x, z: b.z, w: b.w, d: b.d, level, ax, lo: c - R, hi: c + R, c: col(hueAt(level)) };
        SW.reset(t, st === 'play' ? speed() : 120);
      }
      function place(t) {
        const p = fold(SW.u(t), cur.lo, cur.hi);
        if (cur.ax === 'x') cur.x = p; else cur.z = p;
        return p;
      }
      function drop(e) {
        if (st !== 'play' || !cur) return;
        const t = evT(e), p = place(t), b = top(), X = cur.ax === 'x';
        SW.freeze(t);
        const bp = X ? b.x : b.z, bs = X ? b.w : b.d, cs = X ? cur.w : cur.d;
        const perfect = Math.abs(p - bp) <= TOL, q = perfect ? bp : p;
        const L = Math.max(q, bp), R = Math.min(q + cs, bp + bs);
        const y0 = (cur.level - 1) * BH;
        const piece = (a, s, side) => pieces.push(Object.assign(X ? { x: a, z: cur.z, w: s, d: cur.d } : { x: cur.x, z: a, w: cur.w, d: s }, { y0, vy: 0, ax: cur.ax, side, c: cur.c, age: 0 }));
        if (R - L < 1) {
          if (X) cur.x = q; else cur.z = q;
          piece(q, cs, q < bp ? -1 : 1);
          cur = null; st = 'over'; pstreak = 0; shake = 1;
          api.sfx('lose');
          const id = run;
          api.timeout(() => { if (id === run) finish(); }, 1300);
          return;
        }
        if (q < L) piece(q, L - q, -1);
        if (q + cs > R) piece(R, q + cs - R, 1);
        const nb = X ? { x: L, z: cur.z, w: R - L, d: cur.d } : { x: cur.x, z: L, w: cur.w, d: R - L };
        nb.level = cur.level; nb.c = cur.c;
        blocks.push(nb);
        score++;
        const [sx, sy] = proj(nb.x + nb.w / 2, nb.level * BH, nb.z + nb.d / 2);
        if (perfect) {
          perfects++; pstreak++;
          rings.push({ b: nb, l: 1 });
          if (pstreak >= 3) {
            const g = Math.min(12, S0 - (X ? nb.w : nb.d));
            if (g > 0) { if (X) { nb.x -= g / 2; nb.w += g; } else { nb.z -= g / 2; nb.d += g; } }
          }
          msg = { text: pstreak > 1 ? 'PERFECT ×' + pstreak : 'PERFECT', life: 1 };
          fx.burst(sx, sy, 16 + Math.min(20, pstreak * 3), ['#fff', '#ffd166', nb.c.t], 260, .8, 7, 500);
          api.sfx('good');
        } else {
          pstreak = 0;
          fx.burst(sx, sy, 6, ['#fff', nb.c.t], 140, .5, 5, 500);
          api.sfx('pop');
        }
        if (score % 10 === 0) fx.text(sx, sy - 70, score + '!', '#fff', 30, 1);
        api.score(score);
        spawn(t);
      }
      function finish() {
        const isNew = api.submit(score);
        if (score > (sv.best[sv.mode] || 0)) { sv.best[sv.mode] = score; api.save(sv); }
        api.overlay({
          kicker: isNew ? 'New best!' : M.name, title: score + (score === 1 ? ' block' : ' blocks'),
          stats: [['Score', score], ['Perfects', perfects], ['Best', sv.best[sv.mode] || '—']],
          button: 'Play again', onAction: startRun, secondary: 'Modes', onSecondary: menu
        });
      }
      function startRun() {
        run++; st = 'play';
        reset();
        api.score(0);
      }
      function menu() {
        run++; st = 'menu';
        reset();
        api.overlay({
          kicker: 'Timing', title: 'Stack',
          text: `Drop each sliding slab onto the tower. Whatever hangs over is sliced off. Land it exactly for a Perfect, and three in a row grows the slab back.${chips('m', ST_MODES.map(m => m.name), sv.mode)}<span data-desc style="${DESC}">${M.desc}</span>`,
          button: 'Play', onAction: startRun
        });
      }
      const mark = bindOpts(root, api, (k, i) => { if (k === 'm') setMode(i); });
      function setMode(i) {
        if (st !== 'menu' || !ST_MODES[i]) return;
        sv.mode = i; M = ST_MODES[i]; api.save(sv); setDesc(root, M.desc);
      }

      function step(dt) {
        for (const p of pieces) {
          p.vy -= 1500 * dt; p.y0 += p.vy * dt; p.age += dt;
          if (p.ax === 'x') p.x += p.side * 40 * dt; else p.z += p.side * 40 * dt;
        }
        pieces = pieces.filter(p => p.age < 1.6);
        for (const r of rings) r.l -= dt / .55;
        rings = rings.filter(r => r.l > 0);
        if (msg && (msg.life -= dt / 1.1) <= 0) msg = null;
        const n = top().level;
        let tS = 1, tY = n * BH;
        if (st === 'over') {
          tS = Math.min(1, (H - 300) / (n * BH + 200));
          tY = (H / 2 + 60 - ANCHOR) / tS + n * BH / 2;
        }
        const k = 1 - Math.exp(-dt * 5);
        camS += (tS - camS) * k; camY += (tY - camY) * k;
        bgH += (hue0 + n * 9 - bgH) * (1 - Math.exp(-dt * 2));
        shake = Math.max(0, shake - dt * 2.5);
        for (const b of bubbles) if ((b.y -= 14 * b.p * dt + 0) < -30) { b.y = H + 30; b.x = rnd(0, W); }
        fx.update(dt);
      }

      const proj = (x, y, z) => [(x - z) * K, (x + z) * .5 - y];
      function box(x, z, w, d, y0, hgt, c) {
        const y1 = y0 + hgt;
        const ax = (x - z) * K, ay = (x + z) * .5, bx = (x + w - z) * K, by = (x + w + z) * .5;
        const cx = (x + w - z - d) * K, cy = (x + w + z + d) * .5, dx = (x - z - d) * K, dy = (x + z + d) * .5;
        ctx.fillStyle = c.l; ctx.beginPath(); ctx.moveTo(dx, dy - y1); ctx.lineTo(cx, cy - y1); ctx.lineTo(cx, cy - y0); ctx.lineTo(dx, dy - y0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.r; ctx.beginPath(); ctx.moveTo(cx, cy - y1); ctx.lineTo(bx, by - y1); ctx.lineTo(bx, by - y0); ctx.lineTo(cx, cy - y0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.t; ctx.beginPath(); ctx.moveTo(ax, ay - y1); ctx.lineTo(bx, by - y1); ctx.lineTo(cx, cy - y1); ctx.lineTo(dx, dy - y1); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(dx, dy - y1); ctx.lineTo(cx, cy - y1); ctx.lineTo(bx, by - y1); ctx.stroke();
      }
      function diamond(x, z, w, d, y) {
        ctx.beginPath();
        ctx.moveTo((x - z) * K, (x + z) * .5 - y); ctx.lineTo((x + w - z) * K, (x + w + z) * .5 - y);
        ctx.lineTo((x + w - z - d) * K, (x + w + z + d) * .5 - y); ctx.lineTo((x - z - d) * K, (x + z + d) * .5 - y); ctx.closePath();
      }
      function draw(now) {
        const h = ((bgH % 360) + 360) % 360;
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, `hsl(${(h + 40) % 360},75%,86%)`); bg.addColorStop(1, `hsl(${(h + 80) % 360},62%,64%)`);
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); }
        ctx.save();
        ctx.translate(W / 2 + (shake ? Math.sin(now * .08) * 8 * shake : 0), ANCHOR);
        ctx.scale(camS, camS); ctx.translate(0, camY);
        ctx.lineWidth = 1.5 / camS; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineJoin = 'round';
        const b0 = top(), depth = b0.x + b0.w / 2 + b0.z + b0.d / 2;
        for (const p of pieces) if (p.x + p.w / 2 + p.z + p.d / 2 < depth) drawPiece(p);
        const lo = st === 'over' ? 0 : Math.max(0, blocks.length - 40);
        if (lo > 0) { const b = blocks[0]; box(b.x, b.z, b.w, b.d, -900, 900, b.c); }
        for (let i = lo; i < blocks.length; i++) {
          const b = blocks[i];
          if (i === 0) box(b.x, b.z, b.w, b.d, -900, 900, b.c); else box(b.x, b.z, b.w, b.d, (b.level - 1) * BH, BH, b.c);
        }
        if (cur) {
          place(now);
          const X0 = Math.max(cur.x, b0.x), X1 = Math.min(cur.x + cur.w, b0.x + b0.w), Z0 = Math.max(cur.z, b0.z), Z1 = Math.min(cur.z + cur.d, b0.z + b0.d);
          if (X1 > X0 && Z1 > Z0) { ctx.fillStyle = 'rgba(30,20,60,.16)'; diamond(X0, Z0, X1 - X0, Z1 - Z0, b0.level * BH); ctx.fill(); }
          box(cur.x, cur.z, cur.w, cur.d, (cur.level - 1) * BH, BH, cur.c);
        }
        for (const p of pieces) if (p.x + p.w / 2 + p.z + p.d / 2 >= depth) drawPiece(p);
        for (const r of rings) {
          const b = r.b, e = (1 - r.l) * 22;
          ctx.globalAlpha = r.l; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 / camS;
          diamond(b.x - e, b.z - e, b.w + 2 * e, b.d + 2 * e, b.level * BH); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        fx.draw(ctx);
        ctx.restore();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = F(84); ctx.fillStyle = 'rgba(31,29,43,.16)'; ctx.fillText(String(score), W / 2, 104);
        ctx.fillStyle = '#fff'; ctx.fillText(String(score), W / 2, 98);
        if (msg) {
          ctx.globalAlpha = Math.min(1, msg.life * 2.5);
          ctx.font = F(20); ctx.letterSpacing = '2px';
          ctx.fillStyle = 'rgba(31,29,43,.2)'; ctx.fillText(msg.text, W / 2, 160 - (1 - msg.life) * 8);
          ctx.fillStyle = '#fff'; ctx.fillText(msg.text, W / 2, 157 - (1 - msg.life) * 8);
          ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
        }
        ctx.font = F(12); ctx.letterSpacing = '2px'; ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.fillText(`${M.name.toUpperCase()} · BEST ${sv.best[sv.mode] || 0}`, W / 2, 40); ctx.letterSpacing = '0px';
      }
      function drawPiece(p) {
        ctx.globalAlpha = p.age < .6 ? 1 : Math.max(0, 1 - (p.age - .6));
        box(p.x, p.z, p.w, p.d, p.y0, BH, p.c);
        ctx.globalAlpha = 1;
      }

      api.loop((dt, now) => { step(dt); draw(now); });
      api.on(window, 'keydown', e => {
        if (st === 'menu' && /^Digit[1-2]$/.test(e.code)) { const i = +e.code[5] - 1; setMode(i); mark('m', i); api.sfx('tap'); return; }
        if ((e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter' && e.code !== 'ArrowDown') || e.repeat || onControl(e)) return;
        e.preventDefault(); drop(e);
      });
      api.on(root, 'pointerdown', e => { if (e.button === 0) drop(e); });
      menu();
    }
  });

  const PAIRS = [[0, 3], [1, 2], [0, 2], [1, 3], [0, 1], [2, 3]];
  const SONGS = [
    { name: 'Easy', title: 'Sunny Steps', bpm0: 90, bpm1: 104, len: 50, spd: 380,
      pools: [['half'], ['half', 'quarters'], ['quarters', 'half', 'chords1'], ['quarters', 'syncop', 'chords1', 'altHalf']] },
    { name: 'Normal', title: 'Neon Drive', bpm0: 100, bpm1: 140, len: 60, spd: 470,
      pools: [['half', 'quarters', 'quarters'], ['quarters', 'quarters', 'altHalf', 'chords', 'syncop'], ['altHalf', 'alt', 'chords', 'stream', 'quarters', 'syncop'], ['alt', 'stream', 'streamFull', 'chords', 'chords4', 'altHalf']] },
    { name: 'Hard', title: 'Overclock', bpm0: 124, bpm1: 152, len: 64, spd: 560, holds: true,
      pools: [['quarters', 'altHalf', 'hold'], ['alt', 'chords', 'hold', 'syncop', 'holdRun'], ['stream', 'streamFull', 'chords4', 'hold', 'holdRun', 'alt'], ['streamFull', 'chords4', 'holdRun', 'stream', 'hold2']] }
  ];
  function makeSong(cfg) {
    const LEN = cfg.len, beats = [];
    const bpmAt = t => cfg.bpm0 + (cfg.bpm1 - cfg.bpm0) * clamp(t / (LEN - 6), 0, 1);
    for (let t = 0, k = 0; t < LEN + 4; k++) { beats.push({ t, k, down: k % 4 === 0 }); t += 60 / bpmAt(t); }
    for (let i = 0; i < beats.length - 1; i++) beats[i].half = (beats[i + 1].t - beats[i].t) / 2;
    beats[beats.length - 1].half = beats[beats.length - 2].half;
    const at = b => { const i = Math.floor(b); return beats[i].t + (b - i) * 2 * beats[i].half; };
    const notes = [];
    let last = -1, base = 0;
    const one = (...avoid) => {
      let ok = [0, 1, 2, 3].filter(l => l !== last && !avoid.includes(l));
      if (!ok.length) ok = [0, 1, 2, 3].filter(l => !avoid.includes(l));
      return ok[Math.floor(Math.random() * ok.length)];
    };
    const pair = () => { let q; do q = PAIRS[Math.floor(Math.random() * PAIRS.length)]; while (q.includes(last)); return q; };
    const put = (off, lanes) => {
      const t = at(base + off);
      for (const lane of lanes) notes.push({ t, lane, st: 0 });
      last = lanes.length === 1 ? lanes[0] : -1;
    };
    const hold = (off, len, lane) => { notes.push({ t: at(base + off), end: at(base + off + len), lane, st: 0, hs: 0 }); last = lane; };
    const PAT = {
      half() { put(0, [one()]); put(2, [one()]); },
      quarters() { for (let i = 0; i < 4; i++) put(i, [one()]); },
      chords1() { put(0, pair()); put(1, [one()]); put(2, [one()]); put(3, [one()]); },
      syncop() { put(0, [one()]); put(1, [one()]); put(1.5, [one()]); put(2.5, [one()]); put(3, [one()]); },
      altHalf() { put(0, [one()]); put(1, [one()]); const a = one(), b = one(a); for (let i = 0; i < 4; i++) put(2 + i / 2, [i % 2 ? b : a]); },
      alt() { const a = one(), b = one(a); for (let i = 0; i < 8; i++) put(i / 2, [i % 2 ? b : a]); },
      chords() { put(0, pair()); put(1, [one()]); put(2, pair()); put(3, [one()]); },
      chords4() { let p = null; for (let i = 0; i < 4; i++) { let q; do q = pair(); while (q === p); put(i, q); p = q; } },
      stream() { const seq = last === 0 ? [3, 2, 1, 0, 1, 2] : last === 3 || Math.random() < 0.5 ? [0, 1, 2, 3, 2, 1] : [3, 2, 1, 0, 1, 2]; seq.forEach((l, i) => put(i / 2, [l])); put(3, pair()); },
      streamFull() {
        const opts = [[0, 1, 2, 3, 2, 1, 0, 1], [3, 2, 1, 0, 1, 2, 3, 2], [0, 2, 1, 3, 0, 2, 1, 3], [3, 1, 2, 0, 3, 1, 2, 0]];
        const ok = opts.filter(o => o[0] !== last); ok[Math.floor(Math.random() * ok.length)].forEach((l, i) => put(i / 2, [l]));
      },
      hold() { const a = one(); hold(0, 2, a); const b = one(a); put(1, [b]); put(1.5, [one(a, b)]); put(2.5, [one(a)]); put(3, [one()]); },
      holdRun() { const a = one(), c = one(a), d = one(a, c); hold(0, 3, a); for (let i = 1; i <= 5; i++) put(i / 2, [i % 2 ? c : d]); },
      hold2() { const [a, b] = pair(); hold(0, 2, a); hold(0, 2, b); last = -1; const c = one(a, b); put(1, [c]); put(2.5, [one(a, b)]); put(3, [one()]); }
    };
    let prev = '', m = 1;
    for (; (m + 1) * 4 + 1 < beats.length && beats[m * 4].t < LEN - 3; m++) {
      base = m * 4;
      const p = beats[base].t / LEN;
      const pool = m % 8 === 0 ? ['half'] : cfg.pools[p < .12 ? 0 : p < .35 ? 1 : p < .65 ? 2 : 3];
      let name;
      do name = pool[Math.floor(Math.random() * pool.length)]; while (name === prev && pool.length > 1 && name !== 'quarters');
      prev = name;
      PAT[name]();
    }
    base = m * 4; put(0, pair());
    notes.sort((a, b) => a.t - b.t || a.lane - b.lane);
    let lastT = 0;
    for (const n of notes) lastT = Math.max(lastT, n.end || n.t);
    const kept = beats.filter(b => b.t <= lastT + 0.01);
    kept.forEach(b => { b.hat = b.k >= 4 && b.t / LEN > 0.45 && b.t < lastT - 0.01; });
    return { notes, beats: kept, lastT, end: lastT + 1.2, countEnd: beats[4].t };
  }

  Ameplay.register({
    id: 'rhythm',
    title: 'Pulse',
    category: 'Timing',
    blurb: 'Four lanes, one steady beat. Hit every note right on the line.',
    help: '<kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> or tap the lanes · hit each note as it crosses the line, keep holding long notes',
    better: 'high',
    width: 680,
    format: v => Number(v).toLocaleString('en-US'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48" rx="10"/><path d="M20 8v48M32 8v48M44 8v48" opacity=".3"/><path d="M8 45h48"/><rect x="22" y="14" width="8" height="6" rx="3" fill="currentColor" stroke="none"/><rect x="46" y="23" width="8" height="6" rx="3" fill="currentColor" stroke="none"/><rect x="10" y="31" width="8" height="6" rx="3" fill="currentColor" stroke="none"/><rect x="34" y="42" width="8" height="6" rx="3" fill="currentColor" stroke="none"/></svg>',
    css: `
.gm-rhythm{gap:0}
.gm-rhythm .pu-col{width:min(100%,600px,max(260px,calc((100dvh - 344px) * .9375)));display:flex;flex-direction:column;gap:12px}
.gm-rhythm .pu-hud{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gm-rhythm .pu-hud .g-stat{min-width:0}
.gm-rhythm .pu-hud .v.hot{color:var(--accent)}
.gm-rhythm .pu-prog{height:6px;border-radius:6px;background:var(--sunk2);overflow:hidden}
.gm-rhythm .pu-prog i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#ff70a6,#a24ee8,#4cc9f0,#72efdd);transform-origin:0 50%;transform:scaleX(0)}
.gm-rhythm .g-canvas{cursor:pointer}
@media (max-width:480px){.gm-rhythm ~ .g-overlay .g-ov-stats div{padding:10px 4px}.gm-rhythm ~ .g-overlay .g-ov-stats b{font-size:16px}.gm-rhythm ~ .g-overlay .g-ov-stats span{font-size:9px;letter-spacing:.08em}.gm-rhythm .pu-hud .v{font-size:18px}}
`,
    mount(root, api) {
      const W = 600, H = 640, LX = 48, LW = 126, LA = LW * 4, HIT = 540, PERF = 0.045, GOOD = 0.1, TAIL = 0.12;
      const KEYS = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 }, LABELS = ['D', 'F', 'J', 'K'];
      const LC = ['#ff70a6', '#4cc9f0', '#ffd166', '#72efdd'], LD = ['#c93f78', '#2585b8', '#d9952f', '#25a896'];
      root.innerHTML = `<div class="pu-col"><div class="pu-hud">
          <div class="g-stat"><span class="k">Score</span><span class="v" data-k="s">0</span></div>
          <div class="g-stat"><span class="k">Multiplier</span><span class="v" data-k="m">1x</span></div>
          <div class="g-stat"><span class="k">Accuracy</span><span class="v" data-k="a">—</span></div>
        </div><div class="pu-prog"><i></i></div></div>`;
      const col = root.querySelector('.pu-col');
      const sEl = root.querySelector('[data-k="s"]'), mEl = root.querySelector('[data-k="m"]'), aEl = root.querySelector('[data-k="a"]');
      const bar = root.querySelector('.pu-prog i');
      const { canvas, ctx, toLocal } = api.canvas(W, H, col);
      canvas.style.width = '100%';
      const fx = makeFx();
      const sv = Object.assign({ song: 1, best: [] }, api.load() || {});
      if (!SONGS[sv.song]) sv.song = 1;
      if (!Array.isArray(sv.best)) sv.best = [];
      let cfg = SONGS[sv.song], SPD = cfg.spd;

      const bgG = ctx.createRadialGradient(W / 2, H * .95, 20, W / 2, H * .8, H * .95);
      bgG.addColorStop(0, '#a24ee8'); bgG.addColorStop(.5, '#7209b7'); bgG.addColorStop(1, '#3d0569');
      const laneG = ctx.createLinearGradient(0, 0, 0, H);
      laneG.addColorStop(0, 'rgba(29,2,55,0)'); laneG.addColorStop(.55, 'rgba(29,2,55,.5)'); laneG.addColorStop(1, 'rgba(29,2,55,.72)');
      const sepG = ctx.createLinearGradient(0, 0, 0, H);
      sepG.addColorStop(0, 'rgba(224,170,255,0)'); sepG.addColorStop(.8, 'rgba(224,170,255,.55)'); sepG.addColorStop(1, 'rgba(224,170,255,.3)');
      const glowG = ctx.createRadialGradient(W / 2, HIT, 0, W / 2, HIT, 380);
      glowG.addColorStop(0, 'rgba(255,112,166,.55)'); glowG.addColorStop(.5, 'rgba(162,78,232,.25)'); glowG.addColorStop(1, 'rgba(162,78,232,0)');
      const flashG = LC.map((c, l) => { const g = ctx.createLinearGradient(0, HIT, 0, HIT - 320); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); return g; });

      let st = 'menu', song = null, t0 = 0, pausedAt = 0, bi = 0, pb = 0, pulse = 0;
      let score = 0, combo = 0, maxCombo = 0, nP = 0, nG = 0, nM = 0;
      const held = [0, 0, 0, 0], flash = [0, 0, 0, 0], beam = [0, 0, 0, 0], kdown = [0, 0, 0, 0], holding = [null, null, null, null], ptr = new Map();
      let judge = null;

      let ac = null, master = null;
      function ensureAudio() {
        try {
          if (!ac) {
            ac = new (window.AudioContext || window.webkitAudioContext)();
            master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
          }
          if (ac.state === 'suspended') { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); }
        } catch (e) { ac = null; }
      }
      const muted = () => { const b = document.querySelector('[data-sound]'); return !!b && b.getAttribute('aria-pressed') === 'false'; };
      function voice(type, f0, f1, dur, vol, at) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, at);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.7);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(vol, at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g).connect(master);
        o.start(at); o.stop(at + dur + 0.02);
      }
      function schedule(s) {
        const live = !!ac && ac.state === 'running' && !muted();
        const lat = ac ? (ac.outputLatency || ac.baseLatency || 0) : 0;
        while (bi < song.beats.length && song.beats[bi].t < s + 0.12 + lat) {
          const b = song.beats[bi++];
          if (!live || b.t < s - 0.03) continue;
          const at = Math.max(ac.currentTime, ac.currentTime + (b.t - s) - lat);
          if (b.k < 4) { voice('sine', b.down ? 1760 : 1320, b.down ? 1760 : 1320, 0.06, b.down ? 0.16 : 0.1, at); continue; }
          voice('sine', b.down ? 150 : 128, 46, 0.2, b.down ? 0.7 : 0.5, at);
          voice('triangle', 1900, 1900, 0.025, b.down ? 0.05 : 0.03, at);
          if (b.hat) voice('triangle', 3200, 3200, 0.03, 0.022, at + b.half);
        }
      }

      const songTime = (t = performance.now()) => ((st === 'paused' ? pausedAt : t) - t0) / 1000;
      const mult = () => (combo >= 50 ? 4 : combo >= 25 ? 3 : combo >= 10 ? 2 : 1);
      function hud() {
        sEl.textContent = score.toLocaleString('en-US');
        const m = mult();
        mEl.textContent = m + 'x'; mEl.classList.toggle('hot', m > 1);
        const tot = nP + nG + nM;
        aEl.textContent = tot ? ((nP + nG * 0.5) / tot * 100).toFixed(1) + '%' : '—';
      }
      const lx = l => LX + l * LW + LW / 2;

      function startRun() {
        song = makeSong(cfg);
        t0 = performance.now() + 600; bi = 0; pb = 0;
        score = combo = maxCombo = nP = nG = nM = 0;
        holding.fill(null); fx.clear(); judge = null;
        st = 'play';
        ensureAudio(); hud(); api.score(0);
      }
      function good(l, perfect, pts) {
        if (perfect) nP++; else nG++;
        combo++; maxCombo = Math.max(maxCombo, combo);
        score += pts * mult();
        beam[l] = 1;
        fx.burst(lx(l), HIT, perfect ? 16 : 8, [LC[l], '#fff', LC[l]], perfect ? 300 : 200, .55, 7, 300);
        fx.ring(lx(l), HIT, 14, perfect ? 74 : 54, perfect ? '#fff' : LC[l], .4, 5);
        judge = { text: perfect ? 'Perfect' : 'Good', color: perfect ? '#fff' : LC[l], glow: LC[l], life: 1 };
        if (combo > 0 && combo % 25 === 0) fx.text(W / 2, 200, combo + ' combo!', '#ffd166', 30, 1);
        hud(); api.score(score);
      }
      function press(l, t) {
        if (st !== 'play') return;
        flash[l] = 1;
        const s = songTime(t);
        for (const n of song.notes) {
          const d = n.t - s;
          if (d > GOOD) break;
          if (n.st || n.lane !== l || d < -GOOD) continue;
          n.st = 1;
          if (n.end) { n.hs = 1; holding[l] = n; }
          good(l, Math.abs(d) <= PERF, Math.abs(d) <= PERF ? 300 : 100);
          return;
        }
      }
      function tail(n, ok) {
        if (ok) { n.hs = 2; good(n.lane, true, 200); return; }
        n.hs = 3; nM++; combo = 0;
        judge = { text: 'Miss', color: '#ffb3c7', glow: '#ff4d6d', life: 1 };
        hud();
      }
      function letGo(l, t) {
        const n = holding[l];
        if (!n || held[l]) return;
        holding[l] = null;
        tail(n, songTime(t) >= n.end - TAIL);
      }
      function finish() {
        st = 'done';
        const tot = nP + nG + nM, acc = tot ? (nP + nG * 0.5) / tot : 0;
        const isNew = api.submit(score);
        if (score > (sv.best[sv.song] || 0)) { sv.best[sv.song] = score; api.save(sv); }
        const fmt = v => Number(v).toLocaleString('en-US');
        api.overlay({
          kicker: isNew ? 'New best!' : cfg.title,
          title: acc >= 0.98 ? 'Immaculate' : acc >= 0.92 ? 'Superb' : acc >= 0.8 ? 'Great run' : acc >= 0.6 ? 'Good effort' : 'Keep at it',
          text: `${nP} perfect · ${nG} good · ${nM} miss`,
          stats: [['Score', fmt(score)], ['Accuracy', (acc * 100).toFixed(1) + '%'], ['Max combo', maxCombo], ['Best', sv.best[sv.song] ? fmt(sv.best[sv.song]) : '—']],
          button: 'Play again', onAction: startRun, secondary: 'Songs', onSecondary: menu
        });
      }
      const songDesc = c => `<b>${c.title}</b> · ${c.bpm0}–${c.bpm1} BPM${c.holds ? ' · hold notes' : ''} · best ${sv.best[SONGS.indexOf(c)] ? Number(sv.best[SONGS.indexOf(c)]).toLocaleString('en-US') : '—'}`;
      function menu() {
        st = 'menu'; song = null; holding.fill(null);
        bar.style.transform = 'scaleX(0)';
        api.overlay({
          kicker: 'Timing', title: 'Pulse',
          text: `Notes fall down four lanes. Hit <kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> or tap a lane as each one crosses the line. Long combos multiply your score up to 4x.${chips('s', SONGS.map(s => s.name), sv.song)}<span data-desc style="${DESC}">${songDesc(cfg)}</span>`,
          button: 'Play', onAction: startRun
        });
      }
      function setSong(i) {
        if (st !== 'menu' || !SONGS[i]) return;
        sv.song = i; cfg = SONGS[i]; SPD = cfg.spd; api.save(sv);
        setDesc(root, songDesc(cfg));
      }
      const mark = bindOpts(root, api, (k, i) => { if (k === 's') setSong(i); });
      function pause() {
        st = 'paused'; pausedAt = performance.now();
        api.overlay({ kicker: 'Paused', title: 'Pulse', text: 'The song picks up one second before where you left it.', button: 'Resume', onAction: resume });
      }
      function resume() {
        if (st !== 'paused') return;
        t0 += performance.now() - pausedAt + 1000;
        st = 'play'; ensureAudio();
      }
      const release = (l, t) => { held[l] = Math.max(0, held[l] - 1); letGo(l, t); };

      function update(dt) {
        for (let l = 0; l < 4; l++) { flash[l] = Math.max(0, flash[l] - dt * 4); beam[l] = Math.max(0, beam[l] - dt * 3.5); }
        pulse = Math.max(0, pulse - dt * 3);
        fx.update(dt);
        if (judge && (judge.life -= dt / 0.7) <= 0) judge = null;
        if (st !== 'play') return;
        const s = songTime();
        for (const n of song.notes) {
          if (n.t - s > -GOOD) break;
          if (n.st) continue;
          n.st = 2; nM++; combo = 0;
          if (n.end) { n.hs = 3; nM++; }
          judge = { text: 'Miss', color: '#ffb3c7', glow: '#ff4d6d', life: 1 };
          hud();
        }
        for (let l = 0; l < 4; l++) {
          const n = holding[l];
          if (!n) continue;
          if (s >= n.end) { holding[l] = null; tail(n, true); } else if (!held[l]) letGo(l, performance.now());
        }
        while (pb < song.beats.length && song.beats[pb].t <= s) { const b = song.beats[pb++]; pulse = b.down ? 1 : .55; }
        schedule(s);
        bar.style.transform = `scaleX(${clamp(s / song.lastT, 0, 1).toFixed(4)})`;
        if (s > song.end && !holding.some(Boolean)) finish();
      }

      function pill(x, y, w, h) { ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); }
      function gem(l, y, a) {
        const x = LX + l * LW + 17, w = LW - 34;
        ctx.globalAlpha = a;
        ctx.fillStyle = LD[l]; pill(x, y - 9, w, 22); ctx.fill();
        ctx.fillStyle = LC[l]; pill(x, y - 13, w, 22); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; pill(x + 10, y - 10, w * .42, 6); ctx.fill();
        ctx.globalAlpha = 1;
      }
      function draw() {
        const s = song ? songTime() : 0;
        ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
        if (pulse > 0) { ctx.globalAlpha = pulse * .7; ctx.fillStyle = glowG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
        ctx.strokeStyle = '#e0aaff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const r = 30 + i * 18 + pulse * 8;
          ctx.globalAlpha = (.5 - i * .14) * (.4 + pulse * .6);
          ctx.beginPath(); ctx.arc(LX - 46, 300, r, -.6, .6); ctx.stroke();
          ctx.beginPath(); ctx.arc(LX + LA + 46, 300, r, Math.PI - .6, Math.PI + .6); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = laneG; ctx.fillRect(LX, 0, LA, H);
        for (let l = 0; l < 4; l++) {
          const a = Math.max(flash[l] * .35, held[l] ? .18 : 0, beam[l] * .55);
          if (a > .01) { ctx.globalAlpha = a; ctx.fillStyle = flashG[l]; ctx.fillRect(LX + l * LW + 2, HIT - 320, LW - 4, 320); }
        }
        ctx.globalAlpha = 1;
        if (song && st !== 'menu') {
          for (const b of song.beats) {
            const y = HIT - (b.t - s) * SPD;
            if (y < -2) break;
            if (y > HIT - 12) continue;
            ctx.fillStyle = b.down ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.07)';
            ctx.fillRect(LX, Math.round(y), LA, b.down ? 2 : 1);
          }
        }
        ctx.fillStyle = sepG;
        for (let i = 0; i <= 4; i++) ctx.fillRect(LX + i * LW - (i % 4 ? 1 : 2), 0, i % 4 ? 2 : 4, H);

        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        if (song && (st === 'play' || st === 'paused')) {
          if (s < song.countEnd) {
            if (s >= 0) {
              const k = song.beats.findIndex(b => b.t > s) - 1, b = song.beats[Math.max(0, k)];
              const ph = clamp((s - b.t) / (b.half * 2), 0, 1);
              ctx.globalAlpha = 1 - ph * 0.6;
              ctx.fillStyle = '#fff'; ctx.font = F(Math.round(110 + 20 * (1 - easeOut(ph))));
              ctx.fillText(String(Math.max(0, k) + 1), W / 2, 280);
              ctx.globalAlpha = 1;
            } else {
              ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = F(16); ctx.letterSpacing = '4px';
              ctx.fillText('READY', W / 2, 250); ctx.letterSpacing = '0px';
            }
          } else if (combo >= 4) {
            ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.font = F(120);
            ctx.fillText(String(combo), W / 2, 280);
            ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = F(13); ctx.letterSpacing = '4px';
            ctx.fillText('COMBO', W / 2, 312); ctx.letterSpacing = '0px';
          }
        }

        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(LX, HIT - 1.5, LA, 3);
        for (let l = 0; l < 4; l++) {
          const x = LX + l * LW + 15;
          if (held[l]) { ctx.fillStyle = LC[l]; ctx.globalAlpha = .45; pill(x - 4, HIT - 17, LW - 22, 34); ctx.fill(); ctx.globalAlpha = 1; }
          pill(x, HIT - 13, LW - 30, 26);
          ctx.fillStyle = held[l] ? LC[l] : 'rgba(29,2,55,.55)'; ctx.fill();
          ctx.lineWidth = 3.5; ctx.strokeStyle = LC[l]; ctx.stroke();
        }
        if (song && st !== 'menu') {
          for (const n of song.notes) {
            const y = HIT - (n.t - s) * SPD;
            if (y < -30) break;
            if (n.end) {
              if (n.hs === 2) continue;
              const yt = HIT - (n.end - s) * SPD, yh = n.hs === 1 ? HIT : y;
              if (yt > H + 30) continue;
              const x = LX + n.lane * LW + 34, w = LW - 68, live = n.hs !== 3 && n.st !== 2;
              ctx.globalAlpha = live ? (n.hs === 1 ? .85 : .55) : .12;
              ctx.fillStyle = live ? LC[n.lane] : '#fff';
              ctx.beginPath(); ctx.roundRect(x, yt - 8, w, Math.max(16, yh - yt + 8), 10); ctx.fill();
              ctx.globalAlpha = live ? .9 : .3; ctx.fillStyle = '#fff';
              ctx.fillRect(x + w / 2 - 3, yt, 6, Math.max(0, yh - yt));
              ctx.globalAlpha = 1;
              if (n.hs === 1) gem(n.lane, HIT, 1);
              else if (y < H + 30) gem(n.lane, y, live ? 1 : .3);
              continue;
            }
            if (n.st === 1 || y > H + 30) continue;
            if (n.st === 2) {
              const a = 1 - (s - n.t - GOOD) * 2.5;
              if (a > 0) gem(n.lane, y, a * .3);
            } else gem(n.lane, y, 1);
          }
        }
        for (let l = 0; l < 4; l++) {
          if (beam[l] <= 0) continue;
          ctx.globalAlpha = beam[l] * .8; ctx.fillStyle = '#fff';
          ctx.fillRect(lx(l) - 3 * beam[l], HIT - 260 * beam[l], 6 * beam[l], 260 * beam[l]);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        fx.draw(ctx);
        ctx.globalCompositeOperation = 'source-over';
        if (judge) {
          ctx.globalAlpha = Math.min(1, judge.life * 1.6);
          ctx.font = F(26); ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.shadowColor = judge.glow; ctx.shadowBlur = 18;
          ctx.fillStyle = judge.color; ctx.fillText(judge.text.toUpperCase(), W / 2, HIT - 70 - (1 - judge.life) * 16);
          ctx.shadowBlur = 0; ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
        }
        ctx.font = F(17); ctx.textBaseline = 'middle';
        for (let l = 0; l < 4; l++) {
          const cx = lx(l), y = HIT + 58;
          ctx.beginPath(); ctx.roundRect(cx - 22, y - 18, 44, 40, 11);
          ctx.fillStyle = held[l] ? LD[l] : 'rgba(29,2,55,.7)'; ctx.fill();
          ctx.beginPath(); ctx.roundRect(cx - 22, y - 22 + (held[l] ? 3 : 0), 44, 38, 11);
          ctx.fillStyle = held[l] ? LC[l] : 'rgba(255,255,255,.12)'; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = LC[l]; ctx.stroke();
          ctx.fillStyle = held[l] ? '#2a0a45' : '#fff'; ctx.fillText(LABELS[l], cx, y - 2 + (held[l] ? 3 : 0));
        }
        ctx.textBaseline = 'alphabetic';
      }

      api.loop(dt => { update(dt); draw(); });
      api.on(window, 'keydown', e => {
        if (st === 'menu' && /^Digit[1-3]$/.test(e.code)) { const i = +e.code[5] - 1; setSong(i); mark('s', i); api.sfx('tap'); return; }
        const l = KEYS[e.code];
        if (l === undefined || e.ctrlKey || e.metaKey || e.altKey || onControl(e)) return;
        e.preventDefault();
        if (e.repeat) return;
        if (!kdown[l]) { kdown[l] = 1; held[l]++; }
        press(l, evT(e));
      });
      api.on(window, 'keyup', e => {
        const l = KEYS[e.code];
        if (l === undefined || !kdown[l]) return;
        kdown[l] = 0; release(l, evT(e));
      });
      api.on(canvas, 'pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const l = clamp(Math.floor((toLocal(e).x - LX) / LW), 0, 3), t = evT(e);
        if (ptr.has(e.pointerId)) release(ptr.get(e.pointerId), t);
        ptr.set(e.pointerId, l); held[l]++;
        press(l, t);
      });
      const up = e => { if (!ptr.has(e.pointerId)) return; const l = ptr.get(e.pointerId); ptr.delete(e.pointerId); release(l, evT(e)); };
      api.on(window, 'pointerup', up);
      api.on(window, 'pointercancel', up);
      api.on(window, 'blur', () => { held.fill(0); kdown.fill(0); ptr.clear(); });
      api.on(document, 'visibilitychange', () => { if (document.hidden && st === 'play') pause(); });

      menu();
      return {
        destroy() {
          if (!ac) return;
          try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
          ac = null;
        }
      };
    }
  });
})();

