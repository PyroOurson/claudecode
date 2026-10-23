
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const FONT = (w, s) => `${w} ${s}px Nunito, system-ui, sans-serif`;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const eOut = t => 1 - (1 - t) ** 3;
  const eBack = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

  function sprite(w, h, draw) {
    const d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas');
    c.width = Math.ceil(w * d); c.height = Math.ceil(h * d);
    const x = c.getContext('2d');
    x.scale(d, d); draw(x, w, h);
    return c;
  }
  function rr(x, X, Y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    x.beginPath(); x.moveTo(X + r, Y);
    x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }
  function ell(x, X, Y, rx, ry, rot = 0) { x.beginPath(); x.ellipse(X, Y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); }
  function circ(x, X, Y, r) { x.beginPath(); x.arc(X, Y, r, 0, TAU); }
  function txt(x, s, X, Y, size, align = 'left', col = '#fff') {
    x.font = FONT(900, size); x.textAlign = align; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(25,12,50,.32)'; x.fillText(s, X, Y + size * .08 + 1.5);
    x.fillStyle = col; x.fillText(s, X, Y);
  }

  function particles(n) {
    const a = [];
    for (let i = 0; i < n; i++) a.push({ t: 0, l: 1, x: 0, y: 0, vx: 0, vy: 0, s: 2, c: '#fff', g: 0, d: 0 });
    let k = 0;
    return {
      add(x, y, vx, vy, l, s, c, g = 0, d = 0) {
        const p = a[k]; k = (k + 1) % n;
        p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = p.l = l; p.s = s; p.c = c; p.g = g; p.d = d;
      },
      burst(x, y, cnt, sp, l, s, cols, g = 0, d = 0) {
        for (let i = 0; i < cnt; i++) {
          const an = Math.random() * TAU, v = sp * (.3 + Math.random() * .7);
          this.add(x, y, Math.cos(an) * v, Math.sin(an) * v, l * rnd(.6, 1), s * rnd(.6, 1.25), cols[i % cols.length], g, d);
        }
      },
      step(dt) {
        for (const p of a) if (p.t > 0) {
          p.t -= dt;
          const f = Math.max(0, 1 - p.d * dt);
          p.vx *= f; p.vy = p.vy * f + p.g * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
        }
      },
      draw(x, ox = 0, oy = 0, sy = 1) {
        for (const p of a) if (p.t > 0) {
          const q = p.t / p.l;
          x.globalAlpha = q; x.fillStyle = p.c;
          circ(x, p.x + ox, oy + sy * p.y, p.s * (.35 + .65 * q)); x.fill();
        }
        x.globalAlpha = 1;
      },
      clear() { for (const p of a) p.t = 0; }
    };
  }
  function popups() {
    const a = [];
    return {
      add(x, y, s, col, size = 22, vy = -42) { a.push({ x, y, s, col, size, vy, t: 0 }); },
      step(dt) { for (let i = a.length - 1; i >= 0; i--) { const p = a[i]; p.t += dt; p.y += p.vy * dt; if (p.t > 1.1) a.splice(i, 1); } },
      draw(x, ox = 0, oy = 0, sy = 1) {
        for (const p of a) {
          const k = p.t < .18 ? Math.max(.01, eBack(p.t / .18)) : 1;
          x.globalAlpha = 1 - clamp((p.t - .75) / .35, 0, 1);
          x.save(); x.translate(p.x + ox, oy + sy * p.y); x.scale(k, k);
          txt(x, p.s, 0, 0, p.size, 'center', p.col);
          x.restore();
        }
        x.globalAlpha = 1;
      },
      clear() { a.length = 0; }
    };
  }


  const PAT = [
    (t, s) => s,
    (t, s) => s * (.35 + .65 * (.5 + .5 * Math.sin(t * 1.6))) * 1.4,
    (t, s) => s * 1.3 * Math.tanh(3 * Math.sin(t * .85)),
    (t, s) => s * 2.2 * Math.max(0, Math.sin(t * 2.1)) ** 2,
    (t, s) => s * (Math.sin(t * 1.2) + .7 * Math.sin(t * 2.7 + 1.3))
  ];
  const BOSS = (t, s) => s * (1.5 * Math.tanh(6 * Math.sin(t * 1.15)) + .5 * Math.sin(t * 4.3));
  const CHIPS = ['#f6d7a0', '#e2ad6a', '#c98a4a', '#8a5a2b'];
  const norm = a => (a % TAU + TAU) % TAU;
  const adiff = (a, b) => norm(a - b + Math.PI) - Math.PI;

  Ameplay.register({
    id: 'knife-throw',
    title: 'Knife Throw',
    category: 'Timing',
    blurb: 'Stick every knife in the spinning log without hitting another.',
    help: '<kbd>Space</kbd>, click or tap to throw a knife',
    better: 'high',
    width: 600,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="22" r="15"/><circle cx="32" cy="22" r="7" opacity=".5"/><path d="M32 33l3.5 7v8h-7v-8z"/><path d="M26 48h12M32 48v10"/><path d="M12 10l5 4M52 10l-5 4M8 26h5M56 26h-5" opacity=".6"/></svg>',
    mount(root, api) {
      const W = 440, H = 680, CX = W / 2, CY = 236, READY = H - 150, KL = 104, SEP = .15, SPEED = 2700;
      const { canvas, ctx } = api.canvas(W, H);
      const P = particles(260), POP = popups();
      const knifeSpr = sprite(24, 108, x => {
        const g = x.createLinearGradient(6, 0, 18, 0);
        g.addColorStop(0, '#aeb7c6'); g.addColorStop(.45, '#f8fafd'); g.addColorStop(1, '#8c96a8');
        x.fillStyle = g; x.beginPath(); x.moveTo(12, 1); x.quadraticCurveTo(18.5, 14, 18, 58); x.lineTo(6, 58); x.lineTo(6, 18); x.quadraticCurveTo(7, 8, 12, 1); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(70,80,100,.4)'; x.lineWidth = 1; x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(8.2, 20); x.lineTo(8.2, 56); x.stroke();
        let h = x.createLinearGradient(0, 57, 0, 64);
        h.addColorStop(0, '#ffd56b'); h.addColorStop(1, '#c98a1a');
        x.fillStyle = h; rr(x, 2.5, 57, 19, 6.5, 3); x.fill();
        h = x.createLinearGradient(6, 0, 18, 0);
        h.addColorStop(0, '#7c3aed'); h.addColorStop(.45, '#a78bfa'); h.addColorStop(1, '#5b21b6');
        x.fillStyle = h; rr(x, 6.5, 63, 11, 36, 4); x.fill();
        x.fillStyle = 'rgba(30,10,60,.3)'; for (let i = 0; i < 4; i++) x.fillRect(6.5, 69 + i * 7.5, 11, 2);
        x.fillStyle = '#e0a526'; circ(x, 12, 101, 4.5); x.fill();
        x.fillStyle = 'rgba(255,255,255,.6)'; circ(x, 10.8, 99.8, 1.5); x.fill();
      });
      const appleSpr = sprite(36, 40, x => {
        const g = x.createRadialGradient(13, 18, 2, 18, 23, 17);
        g.addColorStop(0, '#ff9e9e'); g.addColorStop(.45, '#ef3b3b'); g.addColorStop(1, '#a3121f');
        x.fillStyle = g; x.beginPath(); x.moveTo(18, 13);
        x.bezierCurveTo(26, 6, 34, 14, 32, 24); x.bezierCurveTo(31, 33, 24, 38, 18, 35.5);
        x.bezierCurveTo(12, 38, 5, 33, 4, 24); x.bezierCurveTo(2, 14, 10, 6, 18, 13); x.fill();
        x.fillStyle = 'rgba(255,255,255,.55)'; ell(x, 11.5, 19, 2.8, 5, -.4); x.fill();
        x.strokeStyle = '#6b3f1d'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(18, 13); x.quadraticCurveTo(18, 7, 21, 3); x.stroke();
        x.fillStyle = '#4caf50'; ell(x, 25.5, 7, 6, 3, -.5); x.fill();
      });
      const shadowSpr = sprite(200, 200, x => {
        const g = x.createRadialGradient(100, 100, 0, 100, 100, 100);
        g.addColorStop(0, 'rgba(10,0,25,.55)'); g.addColorStop(.62, 'rgba(10,0,25,.38)'); g.addColorStop(1, 'rgba(10,0,25,0)');
        x.fillStyle = g; x.fillRect(0, 0, 200, 200);
      });
      const mkBg = boss => sprite(W, H, x => {
        const g = x.createLinearGradient(0, 0, 0, H);
        if (boss) { g.addColorStop(0, '#62193e'); g.addColorStop(.5, '#3a0f2e'); g.addColorStop(1, '#1c0a1f'); }
        else { g.addColorStop(0, '#4a3aa6'); g.addColorStop(.5, '#2f2475'); g.addColorStop(1, '#1b1545'); }
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        const r = x.createRadialGradient(CX, CY, 20, CX, CY, 310);
        r.addColorStop(0, boss ? 'rgba(255,90,90,.45)' : 'rgba(255,190,120,.4)'); r.addColorStop(1, 'rgba(255,150,120,0)');
        x.fillStyle = r; x.fillRect(0, 0, W, H);
        const f = x.createRadialGradient(CX, H - 40, 5, CX, H - 40, 180);
        f.addColorStop(0, 'rgba(170,150,255,.28)'); f.addColorStop(1, 'rgba(170,150,255,0)');
        x.fillStyle = f; x.fillRect(0, 0, W, H);
        for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(255,255,255,${rnd(.025, .06)})`; circ(x, rnd(0, W), rnd(0, H), rnd(10, 46)); x.fill(); }
      });
      const bgN = mkBg(false), bgB = mkBg(true);
      const sheen = {};
      for (const r of [94, 104]) {
        const g = ctx.createLinearGradient(-r, -r, r * .5, r * .5);
        g.addColorStop(0, 'rgba(255,255,255,.24)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        sheen[r] = g;
      }
      function makeLog(R, boss) {
        const S = 2 * R + 8;
        return sprite(S, S, x => {
          x.translate(S / 2, S / 2);
          let g = x.createRadialGradient(0, 0, R * .75, 0, 0, R);
          g.addColorStop(0, boss ? '#454c5a' : '#7a4520'); g.addColorStop(1, boss ? '#1f242e' : '#40210c');
          x.fillStyle = g; circ(x, 0, 0, R); x.fill();
          for (let i = 0; i < 46; i++) {
            const a = rnd(0, TAU);
            x.strokeStyle = `rgba(20,8,0,${rnd(.2, .45)})`; x.lineWidth = rnd(1, 2.6);
            x.beginPath(); x.arc(0, 0, R - rnd(2, 8), a, a + rnd(.05, .28)); x.stroke();
          }
          const r2 = R - (boss ? 14 : 11);
          g = x.createRadialGradient(-r2 * .3, -r2 * .35, 4, 0, 0, r2);
          g.addColorStop(0, boss ? '#eabf92' : '#f8dcaa'); g.addColorStop(.65, boss ? '#c98a55' : '#e5b06e'); g.addColorStop(1, boss ? '#9c6236' : '#c98a4a');
          x.fillStyle = g; circ(x, 0, 0, r2); x.fill();
          const s1 = rnd(0, 9), s2 = rnd(0, 9);
          for (let r = 7 + rnd(0, 4); r < r2 - 4; r += rnd(6.5, 10.5)) {
            x.beginPath();
            for (let j = 0; j <= 60; j++) {
              const a = j / 60 * TAU, q = r * (1 + .035 * Math.sin(a * 3 + s1) + .02 * Math.sin(a * 5 + s2));
              if (j) x.lineTo(Math.cos(a) * q, Math.sin(a) * q); else x.moveTo(Math.cos(a) * q, Math.sin(a) * q);
            }
            x.closePath(); x.strokeStyle = `rgba(140,82,36,${rnd(.22, .45)})`; x.lineWidth = rnd(1, 2.2); x.stroke();
          }
          x.strokeStyle = 'rgba(110,60,25,.45)'; x.lineWidth = 1.4;
          for (let i = 0; i < 3; i++) {
            const a = rnd(0, TAU), l = rnd(.35, .7);
            x.beginPath(); x.moveTo(Math.cos(a) * r2 * .12, Math.sin(a) * r2 * .12); x.lineTo(Math.cos(a + .06) * r2 * l, Math.sin(a + .06) * r2 * l); x.stroke();
          }
          x.fillStyle = '#a8692f'; circ(x, 0, 0, 3.2); x.fill();
          x.strokeStyle = 'rgba(70,35,10,.55)'; x.lineWidth = 3; circ(x, 0, 0, r2); x.stroke();
          if (boss) {
            g = x.createLinearGradient(-R, -R, R, R);
            g.addColorStop(0, '#e2e7ee'); g.addColorStop(.5, '#7b8494'); g.addColorStop(1, '#4b5260');
            x.strokeStyle = g; x.lineWidth = 8; circ(x, 0, 0, R - 5); x.stroke();
            for (let i = 0; i < 12; i++) {
              const a = i / 12 * TAU, rx = Math.cos(a) * (R - 5), ry = Math.sin(a) * (R - 5);
              x.fillStyle = '#2c313b'; circ(x, rx + .6, ry + .8, 2.6); x.fill();
              x.fillStyle = '#eef1f5'; circ(x, rx, ry, 2.1); x.fill();
            }
            g = x.createRadialGradient(-5, -5, 1, 0, 0, 18);
            g.addColorStop(0, '#f0f3f7'); g.addColorStop(1, '#5d6574');
            x.fillStyle = g; circ(x, 0, 0, 16); x.fill();
            x.strokeStyle = '#d6203f'; x.lineWidth = 3.2; x.lineCap = 'round';
            x.beginPath(); x.moveTo(-6, -6); x.lineTo(6, 6); x.moveTo(6, -6); x.lineTo(-6, 6); x.stroke();
          }
        });
      }
      const motes = [];
      for (let i = 0; i < 26; i++) motes.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(1, 2.6), v: rnd(8, 26), ph: rnd(0, TAU), a: rnd(.12, .35) });

      let state = 'ready', stage = 1, boss = false, R = 94, logSpr = null, need = 0, left = 0, knives = [], apples = [], pat = PAT[0], spd = 1.6;
      let tS = 0, rot = 0, intro = 0, banner = 0, readyT = 1, queued = false, debris = [], score = 0, landed = 0, appleCnt = 0;
      let shake = 0, kick = 0, flash = 0, red = 0, failT = 0, clearT = 0, dc = 0;
      const fly = { on: false, y: 0 };

      function freeAngle(sep) {
        for (let t = 0; t < 40; t++) {
          const a = rnd(0, TAU);
          if (knives.every(k => Math.abs(adiff(a, k)) > sep) && apples.every(q => Math.abs(adiff(a, q.a)) > sep)) return a;
        }
        return null;
      }
      function setupStage() {
        boss = stage % 5 === 0; R = boss ? 104 : 94; logSpr = makeLog(R, boss);
        need = boss ? Math.min(14, 8 + Math.floor(stage / 8)) : Math.min(12, 5 + Math.floor(stage * .4));
        left = need; knives = []; apples = []; fly.on = false; queued = false;
        const pre = boss ? Math.min(6, 2 + Math.floor(stage / 12)) : stage < 3 ? 0 : Math.floor(rnd(0, Math.min(5.99, 1 + stage / 4)));
        for (let i = 0; i < pre; i++) { const a = freeAngle(.55); if (a != null) knives.push(a); }
        const na = Math.random() < .7 ? (Math.random() < .3 ? 2 : 1) : 0;
        for (let i = 0; i < na; i++) { const a = freeAngle(.45); if (a != null) apples.push({ a, hit: false }); }
        pat = boss ? BOSS : PAT[stage <= PAT.length ? stage - 1 : Math.random() * PAT.length | 0];
        spd = (Math.random() < .5 ? -1 : 1) * (1.55 + .085 * Math.min(stage, 40));
        tS = 0; intro = 0; banner = 1.5; readyT = 0;
      }
      function start() {
        stage = 1; score = landed = appleCnt = 0; debris = []; P.clear(); POP.clear();
        shake = kick = flash = red = 0;
        setupStage(); state = 'play'; api.score(0);
      }
      function gameOver() {
        if (state === 'over') return;
        state = 'over';
        const nb = api.submit(score);
        api.overlay({ kicker: nb ? 'New best!' : 'Game over', title: boss ? 'The boss held on' : 'Knife clash', stats: [['Score', score], ['Stage', stage], ['Apples', appleCnt], ['Best', api.best ?? '—']], button: 'Play again', onAction: start });
      }
      function throwKnife() {
        if (state !== 'play' || left <= 0) return;
        if (fly.on) { queued = true; return; }
        left--; fly.on = true; fly.y = READY; readyT = 0;
        api.sfx('tick');
      }
      function failHit() {
        state = 'fail'; failT = 0; queued = false;
        debris.push({ kind: 'knife', x: CX, y: CY + R + KL / 2, vx: rnd(-240, 240), vy: 420, r: 0, vr: (Math.random() < .5 ? -1 : 1) * rnd(10, 15) });
        shake = 14; red = 1; api.sfx('bad');
        P.burst(CX, CY + R, 16, 300, .4, 2.5, ['#ffffff', '#ffe066', '#ffd0a0'], 0, 3);
      }
      function sliceApple(ap) {
        ap.hit = true; appleCnt++; score += 2;
        const wa = ap.a + rot, ax = CX + Math.cos(wa) * (R + 12), ay = CY + Math.sin(wa) * (R + 12);
        for (let s = -1; s <= 1; s += 2) debris.push({ kind: 'apple', half: s, x: ax, y: ay, vx: Math.cos(wa) * 120 + s * 140, vy: Math.sin(wa) * 120 - 240, r: wa + Math.PI / 2, vr: s * 7 });
        P.burst(ax, ay, 16, 240, .55, 3, ['#ff5a5a', '#ffd0d0', '#ffe39a'], 900, 1);
        POP.add(ax, ay - 24, '+2', '#ff8a8a', 24);
        api.sfx('pop');
      }
      function stageClear() {
        state = 'clear'; clearT = 0; shake = 10; api.sfx('win');
        const n = boss ? 7 : 6, off = rnd(0, TAU);
        for (let i = 0; i < n; i++) {
          const a0 = off + i * TAU / n, a1 = a0 + TAU / n, am = (a0 + a1) / 2, wa = am + rot, sp = rnd(200, 380);
          debris.push({ kind: 'piece', a0, a1, am, spr: logSpr, R, x: CX + Math.cos(wa) * R * .45, y: CY + Math.sin(wa) * R * .45, vx: Math.cos(wa) * sp, vy: Math.sin(wa) * sp - 260, r: rot, vr: rnd(-3, 3) });
        }
        for (const k of knives) {
          const wa = k + rot, d = R - 22 + KL / 2, sp = rnd(260, 460);
          debris.push({ kind: 'knife', x: CX + Math.cos(wa) * d, y: CY + Math.sin(wa) * d, vx: Math.cos(wa) * sp, vy: Math.sin(wa) * sp - 200, r: wa - Math.PI / 2, vr: rnd(-7, 7) });
        }
        for (const ap of apples) if (!ap.hit) {
          const wa = ap.a + rot;
          debris.push({ kind: 'apple', half: 0, x: CX + Math.cos(wa) * (R + 12), y: CY + Math.sin(wa) * (R + 12), vx: Math.cos(wa) * 200, vy: Math.sin(wa) * 200 - 200, r: wa + Math.PI / 2, vr: rnd(-5, 5) });
        }
        knives = []; apples = [];
        P.burst(CX, CY, 36, 440, .8, 3.5, CHIPS, 900, .6);
        POP.add(CX, CY, boss ? 'BOSS DOWN!' : 'STAGE CLEAR', '#ffe066', 30, -20);
      }
      function contact() {
        const a = norm(Math.PI / 2 - rot);
        fly.on = false;
        for (let i = 0; i < knives.length; i++) if (Math.abs(adiff(a, knives[i])) < SEP) { failHit(); return; }
        knives.push(a); landed++; score++;
        kick = 1; flash = 1; shake = Math.max(shake, 3);
        api.sfx('hit');
        for (let i = 0; i < 9; i++) P.add(CX + rnd(-6, 6), CY + R, rnd(-170, 170), rnd(30, 240), rnd(.35, .7), rnd(1.6, 3.4), pick(CHIPS), 1100, .5);
        for (const ap of apples) if (!ap.hit && Math.abs(adiff(a, ap.a)) < .21) sliceApple(ap);
        api.score(score);
        if (left === 0) stageClear();
        else if (queued) { queued = false; throwKnife(); }
      }
      function update(dt) {
        P.step(dt); POP.step(dt);
        shake = Math.max(0, shake - dt * 45); kick = Math.max(0, kick - dt * 7); flash = Math.max(0, flash - dt * 5); red = Math.max(0, red - dt * 2.2);
        banner = Math.max(0, banner - dt); intro = Math.min(1, intro + dt / .38); readyT = Math.min(1, readyT + dt / .12);
        for (const m of motes) { m.y -= m.v * dt; if (m.y < -10) { m.y = H + 10; m.x = rnd(0, W); } }
        if (state !== 'clear') { tS += dt; rot += pat(tS, spd) * dt; }
        for (const d of debris) { d.vy += 1900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.r += d.vr * dt; }
        if (debris.length && ++dc % 30 === 0) debris = debris.filter(d => d.y < H + 220);
        if (fly.on) { fly.y -= SPEED * dt; if (fly.y <= CY + R) contact(); }
        if (state === 'fail' && (failT += dt) > 1) gameOver();
        if (state === 'clear' && (clearT += dt) > 1.15) { stage++; setupStage(); state = 'play'; }
      }
      function drawDebris() {
        for (const d of debris) {
          ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.r);
          if (d.kind === 'knife') ctx.drawImage(knifeSpr, -12, -KL / 2 - 1, 24, 108);
          else if (d.kind === 'apple') {
            if (d.half) { ctx.beginPath(); ctx.rect(d.half < 0 ? -18 : 0, -23, 18, 40); ctx.clip(); }
            ctx.drawImage(appleSpr, -18, -23, 36, 40);
            if (d.half) { ctx.fillStyle = '#fff1c9'; ctx.fillRect(d.half < 0 ? -2.5 : 0, -9, 2.5, 21); }
          } else {
            const S = 2 * d.R + 8;
            ctx.translate(-Math.cos(d.am) * d.R * .45, -Math.sin(d.am) * d.R * .45);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, d.R + 5, d.a0, d.a1); ctx.closePath(); ctx.clip();
            ctx.drawImage(d.spr, -S / 2, -S / 2, S, S);
          }
          ctx.restore();
        }
      }
      function render(T) {
        ctx.save();
        if (shake > 0) ctx.translate(rnd(-1, 1) * shake * .6, rnd(-1, 1) * shake * .6);
        ctx.drawImage(boss ? bgB : bgN, -12, -12, W + 24, H + 24);
        ctx.fillStyle = '#fff';
        for (const m of motes) { ctx.globalAlpha = m.a * (.6 + .4 * Math.sin(T * 1.5 + m.ph)); circ(ctx, m.x + Math.sin(T + m.ph) * 6, m.y, m.r); ctx.fill(); }
        ctx.globalAlpha = 1;
        if (state !== 'clear') {
          const sc = Math.max(.01, eBack(intro));
          ctx.save();
          ctx.translate(CX + (boss ? Math.sin(tS * 2.3) * 3 : 0), CY - kick * 7); ctx.scale(sc, sc);
          const ss = R * 2.7;
          ctx.drawImage(shadowSpr, -ss / 2 + 6, -ss / 2 + 14, ss, ss);
          ctx.save(); ctx.rotate(rot);
          for (const k of knives) { ctx.save(); ctx.rotate(k); ctx.translate(R - 22, 0); ctx.rotate(-Math.PI / 2); ctx.drawImage(knifeSpr, -12, -1, 24, 108); ctx.restore(); }
          const S = 2 * R + 8;
          ctx.drawImage(logSpr, -S / 2, -S / 2, S, S);
          ctx.restore();
          ctx.fillStyle = sheen[R]; circ(ctx, 0, 0, R); ctx.fill();
          if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * .28})`; circ(ctx, 0, 0, R); ctx.fill(); }
          ctx.rotate(rot);
          for (const ap of apples) if (!ap.hit) { ctx.save(); ctx.rotate(ap.a); ctx.translate(R - 1, 0); ctx.rotate(Math.PI / 2); ctx.drawImage(appleSpr, -18, -36, 36, 40); ctx.restore(); }
          ctx.restore();
        }
        if (fly.on) {
          for (let i = 3; i >= 1; i--) { ctx.globalAlpha = .12 * (4 - i); ctx.drawImage(knifeSpr, CX - 12, fly.y + i * 20 - 1, 24, 108); }
          ctx.globalAlpha = 1;
          ctx.drawImage(knifeSpr, CX - 12, fly.y - 1, 24, 108);
        }
        if ((state === 'play' || state === 'ready') && left > 0) {
          const k = eOut(readyT);
          ctx.globalAlpha = k;
          ctx.drawImage(knifeSpr, CX - 12, READY + (1 - k) * 60 - 1, 24, 108);
          ctx.globalAlpha = 1;
        }
        drawDebris();
        P.draw(ctx);
        POP.draw(ctx);
        if (banner > 0 && state === 'play') {
          const k = Math.max(.01, eBack(Math.min(1, (1.5 - banner) / .25)));
          ctx.globalAlpha = Math.min(1, banner / .4);
          ctx.save(); ctx.translate(CX, CY + R + 130); ctx.scale(k, k);
          txt(ctx, boss ? 'BOSS FIGHT!' : 'STAGE ' + stage, 0, 0, boss ? 34 : 28, 'center', boss ? '#ff9a9a' : '#ffffff');
          ctx.restore(); ctx.globalAlpha = 1;
        }
        ctx.restore();
        if (red > 0) { ctx.fillStyle = `rgba(255,50,80,${red * .25})`; ctx.fillRect(0, 0, W, H); }
        txt(ctx, String(score), 24, 40, 34);
        ctx.globalAlpha = .7; txt(ctx, 'SCORE', 26, 68, 12); ctx.globalAlpha = 1;
        ctx.drawImage(appleSpr, W - 84, 20, 27, 30);
        txt(ctx, String(appleCnt), W - 52, 38, 24);
        txt(ctx, boss ? 'BOSS STAGE' : 'STAGE ' + stage, CX, 30, 18, 'center', boss ? '#ffb3b3' : '#ffffff');
        const b0 = Math.floor((stage - 1) / 5) * 5;
        for (let i = 0; i < 5; i++) {
          const s = b0 + i + 1, x = CX - 44 + i * 22, y = 54;
          if (i === 4) {
            ctx.fillStyle = s < stage ? '#ffe066' : s === stage ? '#ff5a6e' : 'rgba(255,110,130,.35)';
            ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 8); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill();
          } else {
            ctx.fillStyle = s < stage ? '#ffe066' : s === stage ? '#ffffff' : 'rgba(255,255,255,.25)';
            circ(ctx, x, y, s === stage ? 6 : 5); ctx.fill();
          }
        }
        for (let i = 0; i < need; i++) {
          ctx.globalAlpha = i < left ? 1 : .22;
          ctx.drawImage(knifeSpr, 20, H - 66 - i * 30, 10, 45);
        }
        ctx.globalAlpha = 1;
      }

      api.on(canvas, 'pointerdown', e => { if (!e.button) throwKnife(); });
      api.on(window, 'keydown', e => { if (!e.repeat && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) throwKnife(); });

      setupStage();
      api.overlay({ kicker: 'Timing', title: 'Knife Hit', text: 'Throw every knife into the spinning log. Hit a knife that is already stuck and the run is over. Slice apples for bonus points and break a tough boss log every fifth stage.', button: 'Play', onAction: start });
      api.loop((dt, t) => { update(dt); render(t / 1000); });
    }
  });
})();

