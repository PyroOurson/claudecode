(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rr = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rr(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sgn = v => v < 0 ? -1 : v > 0 ? 1 : 0;
  const q1 = v => Math.round(v * 10) / 10;
  const q2 = v => Math.round(v * 100) / 100;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const angLerp = (a, b, t) => { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; };
  const isTouchDev = () => (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;

  function makeAudio(api) {
    let AC = null, master = null, nb = null;
    const last = {};
    const ctx = () => {
      if (api.muted) return null;
      if (!AC) {
        try {
          AC = new (window.AudioContext || window.webkitAudioContext)();
          master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
          nb = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
          const d = nb.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { AC = null; return null; }
      }
      if (AC.state === 'suspended') AC.resume().catch(() => {});
      return AC;
    };
    const tone = (f0, f1, dur, type, vol, delay = 0) => {
      const A = ctx(); if (!A) return;
      const t = A.currentTime + delay, o = A.createOscillator(), g = A.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(master); o.start(t); o.stop(t + dur + .03);
    };
    const noise = (dur, vol, f0, f1, delay = 0, q = 1, ft = 'lowpass') => {
      const A = ctx(); if (!A) return;
      const t = A.currentTime + delay, s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
      s.buffer = nb; s.loop = true; s.playbackRate.value = .8 + Math.random() * .4;
      f.type = ft; f.Q.value = q; f.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f).connect(g).connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    };
    const gate = (k, ms) => { const n = performance.now(); if (n - (last[k] || 0) < ms) return false; last[k] = n; return true; };
    return { tone, noise, gate, close() { try { if (AC) AC.close(); } catch (e) {} AC = null; } };
  }

  function makeKeys(api, map) {
    const down = new Set();
    const act = {};
    Object.keys(map).forEach(a => map[a].forEach(c => { (act[c] = act[c] || []).push(a); }));
    api.on(window, 'keydown', e => { if (act[e.code] && !e.ctrlKey && !e.metaKey && !e.altKey) down.add(e.code); });
    api.on(window, 'keyup', e => { down.delete(e.code); });
    api.on(window, 'blur', () => down.clear());
    const h = a => { for (const c of map[a]) if (down.has(c)) return true; return false; };
    return { h, down, clear: () => down.clear() };
  }

  function touchBar(parent, defs, held) {
    const bar = document.createElement('div');
    bar.className = 'tb';
    const mk = (side, list) => {
      const g = document.createElement('div');
      g.className = 'tb-' + side;
      list.forEach(d => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tb-b ' + (d.c || ''); b.innerHTML = d.l; b.setAttribute('aria-label', d.n || d.k);
        if (d.pos) b.style.cssText = d.pos;
        const on = e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} held[d.k] = 1; b.classList.add('on'); if (d.tap) d.tap(); };
        const off = e => { e.preventDefault(); held[d.k] = 0; b.classList.remove('on'); };
        b.addEventListener('pointerdown', on);
        b.addEventListener('pointerup', off);
        b.addEventListener('pointercancel', off);
        b.addEventListener('lostpointercapture', off);
        b.addEventListener('contextmenu', e => e.preventDefault());
        g.append(b);
      });
      bar.append(g);
    };
    mk('l', defs.l); mk('r', defs.r);
    parent.append(bar);
    return bar;
  }

  function bumpStick(el, set) {
    let id = null, cx = 0, cy = 0;
    const knob = el.querySelector('i');
    const upd = e => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
      const m = Math.hypot(dx, dy);
      if (m > 1) { dx /= m; dy /= m; }
      knob.style.transform = `translate(${dx * 38}%,${dy * 38}%)`;
      set(dx, dy);
    };
    el.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} upd(e); });
    el.addEventListener('pointermove', e => { if (e.pointerId === id) upd(e); });
    const end = e => { if (e.pointerId !== id) return; id = null; knob.style.transform = ''; set(0, 0); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  const TOUCH_CSS = (g) => `
.gm-${g} .tb{display:none;width:100%;box-sizing:border-box;justify-content:space-between;align-items:flex-end;gap:10px;padding:6px 4px 0;touch-action:none;user-select:none;-webkit-user-select:none}
.gm-${g}.touch .tb{display:flex}
.gm-${g} .tb-l,.gm-${g} .tb-r{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
.gm-${g} .tb-r{justify-content:flex-end}
.gm-${g} .tb-b{min-width:58px;height:58px;padding:0 10px;border-radius:50%;border:2px solid rgba(0,0,0,.22);background:rgba(20,20,30,.12);color:#222;font:900 14px var(--sans);display:grid;place-items:center;touch-action:none;cursor:pointer}
.gm-${g} .tb-b.big{min-width:74px;height:74px}
.gm-${g} .tb-b.on{background:rgba(20,20,30,.4);color:#fff;transform:scale(.94)}
.gm-${g} .tb-stick{position:relative;width:118px;height:118px;border-radius:50%;background:rgba(20,20,30,.1);border:2px solid rgba(0,0,0,.2);touch-action:none}
.gm-${g} .tb-stick i{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(20,20,30,.45);transition:transform .05s}
@media (orientation:landscape) and (max-height:520px){.gm-${g}.touch .tb{position:absolute;left:0;right:0;bottom:6px;padding:0 10px;pointer-events:none;z-index:3}.gm-${g}.touch .tb>*{pointer-events:auto}.gm-${g} .tb-b{opacity:.75;min-width:52px;height:52px}.gm-${g} .tb-stick{width:104px;height:104px}}`;

  const SF_W = 960, SF_H = 540, SF_DT = 1 / 120;
  const SF_COL = [
    { n: 'Yellow', c: '#f7c61b', d: '#9a7600' },
    { n: 'Blue', c: '#3c86f4', d: '#1a478f' },
    { n: 'Red', c: '#ee4a47', d: '#98201e' },
    { n: 'Green', c: '#37c25a', d: '#1c7134' }
  ];
  const SF_BONES = [[0, 1, 13], [1, 2, 17], [1, 3, 11], [3, 4, 11], [1, 5, 11], [5, 6, 11], [2, 7, 12], [7, 8, 12], [2, 9, 12], [9, 10, 12], [0, 2, 28]];
  const SF_PR = [8, 4.5, 4.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5];
  const SF_HW = 6, SF_HH = 48;
  const SF_WP = {
    pistol: { n: 'Pistol', ammo: 14, cd: .3, dmg: 13, kb: 230, spd: 980, spr: .02, rec: 80, auto: 0, len: 15, w: 20 },
    uzi: { n: 'Uzi', ammo: 44, cd: .075, dmg: 5, kb: 70, spd: 980, spr: .09, rec: 26, auto: 1, len: 16, w: 12 },
    shotgun: { n: 'Shotgun', ammo: 6, cd: .78, dmg: 9, kb: 125, spd: 860, spr: .2, pel: 7, rec: 330, auto: 0, len: 25, two: 1, w: 14 },
    sniper: { n: 'Sniper', ammo: 5, cd: 1.15, dmg: 60, kb: 640, spd: 2800, spr: 0, rec: 430, auto: 0, len: 36, two: 1, w: 8 },
    minigun: { n: 'Minigun', ammo: 180, cd: .052, dmg: 4.5, kb: 60, spd: 1050, spr: .1, rec: 24, auto: 1, spin: .55, len: 30, two: 1, w: 6 },
    sword: { n: 'Sword', ammo: 0, melee: 1, cd: .46, dmg: 30, kb: 440, len: 40, w: 12 },
    snake: { n: 'Snake Gun', ammo: 7, cd: .7, rec: 100, auto: 0, len: 22, two: 0, w: 8 },
    rocket: { n: 'Rocket Launcher', ammo: 3, cd: 1.5, dmg: 62, kb: 720, rec: 380, auto: 0, len: 32, two: 1, w: 6 }
  };
  const SF_WK = Object.keys(SF_WP);
  const SF_BOT = [
    { n: 'Rookie', rt: .55, err: .4, blk: 0, aggr: .45, haz: .4, jmp: .5, wall: 0, wpn: .35 },
    { n: 'Easy', rt: .38, err: .25, blk: .25, aggr: .6, haz: .65, jmp: .7, wall: 0, wpn: .55 },
    { n: 'Normal', rt: .24, err: .15, blk: .55, aggr: .75, haz: .85, jmp: .85, wall: .35, wpn: .75 },
    { n: 'Hard', rt: .14, err: .07, blk: .8, aggr: .9, haz: .95, jmp: .95, wall: .75, wpn: .9 },
    { n: 'Insane', rt: .07, err: .025, blk: .95, aggr: 1, haz: 1, jmp: 1, wall: 1, wpn: 1 }
  ];
  const SB = (x, y, w, h, o) => Object.assign({ x, y, w, h }, o || {});
  const SF_MAPS = [
    { n: 'Warm-Up', bg: ['#fde68a', '#fbbf24'], dc: '#fff3', s: [SB(0, 480, 960, 60), SB(140, 370, 200, 18), SB(620, 370, 200, 18), SB(380, 270, 200, 18)], sps: [[100, 480], [860, 480], [240, 370], [720, 370]] },
    { n: 'Lava Pit', bg: ['#fecaca', '#fb923c'], dc: '#fff3', s: [SB(0, 470, 330, 70), SB(630, 470, 330, 70), SB(430, 390, 100, 16), SB(40, 350, 170, 16), SB(750, 350, 170, 16)], lava: [{ x: 330, y: 500, w: 300, h: 60 }], sps: [[80, 470], [880, 470], [125, 350], [835, 350]] },
    { n: 'Spike Garden', bg: ['#bbf7d0', '#4ade80'], dc: '#fff4', s: [SB(0, 480, 960, 60), SB(60, 370, 170, 16), SB(730, 370, 170, 16), SB(380, 320, 200, 16), SB(200, 220, 170, 16), SB(590, 220, 170, 16)], sp: [{ x: 200, y: 468, w: 90, h: 12 }, { x: 440, y: 468, w: 80, h: 12 }, { x: 670, y: 468, w: 90, h: 12 }, { x: 380, y: 336, w: 200, h: 12, d: 'd' }], sps: [[100, 480], [860, 480], [145, 370], [815, 370]] },
    { n: 'Sawmill', bg: ['#e9d5ff', '#a78bfa'], dc: '#fff4', s: [SB(0, 480, 960, 60), SB(100, 350, 180, 16), SB(680, 350, 180, 16), SB(390, 260, 180, 16)], saw: [{ r: 24, ax: 130, ay: 456, bx: 470, by: 456, per: 4.4, ph: 0 }, { r: 24, ax: 830, ay: 456, bx: 490, by: 456, per: 4.4, ph: .5 }, { r: 22, ax: 480, ay: 110, bx: 480, by: 230, per: 3.6, ph: 0 }], sps: [[60, 480], [900, 480], [190, 350], [770, 350]] },
    { n: 'Crumble', bg: ['#bae6fd', '#38bdf8'], dc: '#fff4', s: [SB(0, 300, 90, 240), SB(870, 300, 90, 240)].concat([0, 1, 2, 3, 4, 5, 6].map(i => SB(110 + i * 106, 400, 100, 20, { f: 1 })), [0, 1, 2].map(i => SB(210 + i * 220, 310, 130, 18, { f: 1 }))), lava: [{ x: 0, y: 505, w: 960, h: 60 }], sps: [[25, 300], [65, 300], [895, 300], [935, 300]] },
    { n: 'Elevators', bg: ['#fed7aa', '#fb923c'], dc: '#fff4', s: [SB(0, 480, 250, 60), SB(710, 480, 250, 60), SB(290, 460, 110, 16, { m: { ax: 290, ay: 460, bx: 290, by: 190, per: 6, ph: 0 } }), SB(560, 190, 110, 16, { m: { ax: 560, ay: 190, bx: 560, by: 460, per: 6, ph: 0 } }), SB(0, 240, 240, 16), SB(720, 240, 240, 16), SB(400, 110, 160, 16)], sp: [{ x: 250, y: 508, w: 460, h: 32 }], sps: [[60, 480], [900, 480], [100, 240], [860, 240]] },
    { n: 'Crusher Hall', bg: ['#e5e7eb', '#9ca3af'], dc: '#fff4', s: [SB(0, 480, 960, 60), SB(40, 350, 110, 16), SB(810, 350, 110, 16), SB(300, 335, 120, 16), SB(540, 335, 120, 16), SB(190, -60, 90, 100, { k: { y0: -60, y1: 380, per: 4, ph: 0 } }), SB(440, -60, 90, 100, { k: { y0: -60, y1: 380, per: 4, ph: .33 } }), SB(690, -60, 90, 100, { k: { y0: -60, y1: 380, per: 4, ph: .66 } })], sps: [[80, 480], [880, 480], [95, 350], [865, 350]] },
    { n: 'The Tower', bg: ['#c7d2fe', '#818cf8'], dc: '#fff4', s: [SB(0, 0, 250, 540), SB(710, 0, 250, 540), SB(250, 500, 460, 40), SB(250, 410, 140, 14), SB(570, 320, 140, 14), SB(250, 230, 140, 14), SB(570, 140, 140, 14), SB(400, 275, 80, 14)], rise: { y: 548, from: 9, sp: 8 }, dx: [270, 690], sps: [[320, 500], [640, 500], [320, 410], [640, 320]] },
    { n: 'Islands', bg: ['#fbcfe8', '#f472b6'], dc: '#fff4', s: [SB(40, 370, 220, 28), SB(700, 370, 220, 28), SB(340, 300, 280, 28), SB(110, 230, 120, 16), SB(730, 230, 120, 16), SB(420, 170, 120, 16), SB(260, 440, 120, 16, { m: { ax: 260, ay: 440, bx: 580, by: 440, per: 7, ph: 0 } })], lava: [{ x: 0, y: 490, w: 960, h: 60 }], sps: [[100, 370], [820, 370], [400, 300], [560, 300]] },
    { n: 'Rickety Bridge', bg: ['#fef3c7', '#fcd34d'], dc: '#fff5', s: [SB(0, 300, 150, 240), SB(810, 300, 150, 240)].concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => SB(150 + i * 60, 300, 60, 14, { f: 1 }))), sp: [{ x: 150, y: 508, w: 660, h: 32 }], saw: [{ r: 22, ax: 250, ay: 200, bx: 710, by: 200, per: 6.5, ph: 0 }], sps: [[60, 300], [900, 300], [110, 300], [850, 300]] },
    { n: 'Factory', bg: ['#d1d5db', '#6b7280'], dc: '#fff3', s: [SB(0, 480, 960, 60), SB(220, 468, 200, 12, { belt: 150 }), SB(540, 468, 200, 12, { belt: -150 }), SB(60, 360, 160, 16), SB(740, 360, 160, 16), SB(380, 330, 200, 16, { belt: 90 })], saw: [{ r: 22, ax: 150, ay: 240, bx: 810, by: 240, per: 7, ph: .25 }], sps: [[100, 480], [860, 480], [140, 360], [820, 360]] },
    { n: 'The Cage', bg: ['#fecdd3', '#fb7185'], dc: '#fff4', s: [SB(0, 0, 960, 40), SB(0, 480, 960, 60), SB(440, 330, 80, 150), SB(80, 360, 150, 16), SB(730, 360, 150, 16), SB(300, 230, 120, 16), SB(540, 230, 120, 16), SB(200, 466, 60, 14, { sp: 1 }), SB(700, 466, 60, 14, { sp: 1 })], sp: [{ x: 0, y: 40, w: 140, h: 12, d: 'd' }, { x: 820, y: 40, w: 140, h: 12, d: 'd' }], sps: [[120, 480], [840, 480], [155, 360], [805, 360]] },
    { n: 'Windmill', bg: ['#a7f3d0', '#2dd4bf'], dc: '#fff4', s: [SB(0, 360, 100, 180), SB(860, 360, 100, 180), SB(420, 330, 120, 14)].concat([0, 1, 2, 3].map(i => SB(0, 0, 110, 16, { o: { cx: 480, cy: 290, r: 190, per: 10, ph: i / 4 } }))), lava: [{ x: 0, y: 505, w: 960, h: 60 }], sps: [[50, 360], [910, 360], [450, 330], [510, 330]] },
    { n: 'Pillars', bg: ['#ddd6fe', '#8b5cf6'], dc: '#fff4', s: [SB(60, 400, 90, 140), SB(210, 340, 90, 200), SB(360, 270, 90, 270), SB(510, 340, 90, 200), SB(660, 400, 90, 140), SB(810, 300, 90, 240)], sp: [{ x: 360, y: 258, w: 90, h: 12 }], lava: [{ x: 0, y: 500, w: 960, h: 60 }], sps: [[105, 400], [255, 340], [705, 400], [855, 300]] }
  ];

  function sfIk(ax, ay, tx, ty, l1, l2, bend, out, o) {
    let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy);
    const m = l1 + l2 - .02;
    if (d > m) { dx *= m / d; dy *= m / d; d = m; tx = ax + dx; ty = ay + dy; }
    if (d < .5) d = .5;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d, uy = dy / d;
    out[o] = ax + ux * a - uy * hh * bend; out[o + 1] = ay + uy * a + ux * hh * bend;
    out[o + 2] = tx; out[o + 3] = ty;
  }

  function sfPose(f, T) {
    const s = f.face, x = f.x, y = f.y, wc = f.wallc, air = !f.gnd && !wc, k = clamp(Math.abs(f.vx) / 205, 0, 1) * (f.gnd ? 1 : 0);
    const win = f.win > 0;
    const crouch = f.blk > 0 ? 8 : f.land * 6;
    const hipy = y - 22 + crouch;
    let tilt = clamp(f.vx / 260, -1, 1) * .22;
    const pe = f.atkT > 0 && !f.wpn ? (() => { const p = 1 - f.atkT / .26; return p < .4 ? p / .4 : Math.max(0, 1 - (p - .4) / .6); })() : 0;
    tilt += s * pe * .18 + (f.blk > 0 ? s * .22 : 0) - s * f.rc * .0005;
    const hx = x + (f.blk > 0 ? s * 3 : 0), cx = hx + Math.sin(tilt) * 17, cy = hipy - Math.cos(tilt) * 17;
    const ht = tilt * 1.25, hdx = cx + Math.sin(ht) * 13, hdy = cy - Math.cos(ht) * 13;
    T[0] = hdx; T[1] = hdy; T[2] = cx; T[3] = cy; T[4] = hx; T[5] = hipy;
    const sa = Math.sin(f.ph), ca = Math.cos(f.ph);
    let fax, fay, fbx, fby;
    if (wc) {
      fax = x + wc * 4; fay = y - 6; fbx = x + wc * 5; fby = y - 15;
    } else if (air) {
      const r = clamp(f.vy / 500, -1, 1);
      fax = x + s * lerp(7, 8, (r + 1) / 2); fay = y + lerp(-10, -1, (r + 1) / 2);
      fbx = x - s * lerp(4, 7, (r + 1) / 2); fby = y + lerp(-5, -1, (r + 1) / 2);
    } else {
      fax = x + lerp(-5, sa * 13, k); fay = y - lerp(0, Math.max(0, ca) * 7, k);
      fbx = x + lerp(5, -sa * 13, k); fby = y - lerp(0, Math.max(0, -ca) * 7, k);
    }
    sfIk(hx, hipy, fax, fay, 12, 12, -s, T, 14);
    sfIk(hx, hipy, fbx, fby, 12, 12, -s, T, 18);
    let lhx, lhy, rhx, rhy;
    const w = f.wpn, S = w && SF_WP[w.k];
    if (win) {
      const wv = Math.sin(f.t * 12) * 4;
      lhx = cx - 9; lhy = cy - 20 + wv; rhx = cx + 9; rhy = cy - 20 - wv;
    } else if (wc) {
      lhx = x + wc * 8; lhy = cy - 12; rhx = x + wc * 8; rhy = cy - 24;
    } else if (S && !S.melee) {
      const a = f.wa, dx = Math.cos(a), dy = Math.sin(a), sh = S.two ? 8 : 12;
      rhx = cx + dx * sh; rhy = cy + 2 + dy * sh;
      if (S.two) { lhx = cx + dx * (sh + 12); lhy = cy + 2 + dy * (sh + 12); }
      else { lhx = cx + s * 3 - sa * 4 * k; lhy = cy + 17; }
    } else if (S && S.melee) {
      const p = f.swing > 0 ? 1 - f.swing / .36 : 0;
      const ang = f.swing > 0 ? lerp(-2.0, 1.1, Math.min(1, p * 1.25)) : -.9;
      f.wa = s > 0 ? ang : Math.PI - ang;
      rhx = cx + s * 10 * Math.cos(ang) + (f.swing > 0 ? s * 6 : 0); rhy = cy + 4 + 14 * Math.sin(ang);
      lhx = cx + s * 6; lhy = cy + 11;
    } else if (f.blk > 0) {
      rhx = cx + s * 13; rhy = cy - 11; lhx = cx + s * 9; lhy = cy + 1;
    } else if (pe > 0) {
      const ex = s * (6 + 21 * pe);
      if (f.atkHand) { rhx = cx + ex; rhy = cy + 3 - 2 * pe; lhx = cx + s * 8; lhy = cy + 5; }
      else { lhx = cx + ex; lhy = cy + 3 - 2 * pe; rhx = cx + s * 8; rhy = cy + 5; }
    } else {
      lhx = cx + sa * 9 * k + s * 2; lhy = cy + 18 - Math.abs(sa) * 2 * k;
      rhx = cx - sa * 9 * k + s * 2; rhy = cy + 18 - Math.abs(sa) * 2 * k;
      if (air) { lhx = cx - s * 5; lhy = cy + 13; rhx = cx + s * 8; rhy = cy + 11 - clamp(f.vy / 300, -1, 1) * 4; }
    }
    sfIk(cx, cy, lhx, lhy, 11, 11, s, T, 6);
    sfIk(cx, cy, rhx, rhy, 11, 11, s, T, 10);
  }

  const SF_K = [[1800, 70], [2600, 100], [4200, 130], [1500, 50], [1700, 55], [1500, 50], [1900, 60], [1700, 55], [2200, 65], [1700, 55], [2200, 65]];

  function sfNewF(pl, sp) {
    const f = {
      slot: pl.slot, name: pl.name, kind: pl.kind, lvl: pl.lvl || 3, id: pl.id || null, alive: true, hp: 100, x: sp[0], y: sp[1], vx: 0, vy: 0,
      face: sp[0] < 480 ? 1 : -1, gnd: true, gs: null, wall: 0, wallc: 0, coy: 0, jb: 0, jh: 0, ah: 0, xh: 0, mode: 'ctl', ragT: 0, getup: 0, stun: 0, daze: 0,
      atkT: 0, atkCd: 0, atkHand: 0, atkHit: null, swing: 0, blk: 0, bm: 1, bs: 0, wpn: null, aim: 0, wa: 0, ph: 0, land: 0, t: 0, fireCd: 0, spin: 0, pick: 0, win: 0, rc: 0, inv: 1,
      in: { l: 0, r: 0, u: 0, d: 0, j: 0, a: 0, b: 0, x: 0, ang: null }, bot: null, p: new Array(22).fill(0), v: new Array(22).fill(0), kills: 0
    };
    f.wa = f.face > 0 ? 0 : Math.PI;
    const T = new Array(22).fill(0);
    sfPose(f, T);
    for (let i = 0; i < 22; i++) f.p[i] = T[i];
    return f;
  }

  function sfNewWorld(mi, players, opt) {
    const m = SF_MAPS[mi % SF_MAPS.length];
    const solids = m.s.map(s => Object.assign({}, s, { ox: s.x, oy: s.y, fs: 0, ft: 0, fv: 0, dx: 0, dy: 0, sh: 0 }));
    if (!m.open) { solids.push(SB(-300, -800, 300, 1700, { ox: -300, oy: -800, fs: 0, dx: 0, dy: 0, wall: 1 }), SB(960, -800, 300, 1700, { ox: 960, oy: -800, fs: 0, dx: 0, dy: 0, wall: 1 })); }
    const w = {
      mi, map: m, t: 0, solids, lava: (m.lava || []).map(l => Object.assign({}, l)), spikes: m.sp || [], saws: (m.saw || []).map(s => Object.assign({ x: s.ax, y: s.ay, rot: 0 }, s)),
      fighters: [], weapons: [], crates: [], bullets: [], snakes: [], ev: [], evNet: [], dropT: 1.4, freeze: 0, shake: 0, rl: SF_H + 20, noIn: true, drops: opt && opt.drops != null ? opt.drops : 1, nid: 1, kills: []
    };
    const sps = m.sps.slice();
    for (let i = sps.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [sps[i], sps[j]] = [sps[j], sps[i]]; }
    players.forEach((pl, i) => w.fighters.push(sfNewF(pl, sps[i % sps.length])));
    return w;
  }

  const sfEv = (w, e) => { w.ev.push(e); w.evNet.push(e); };

  function sfInSolid(w, x, y) {
    for (const s of w.solids) if (s.fs !== 3 && x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h) return s;
    return null;
  }

  function sfSolids(w, dt) {
    const t = w.t;
    for (const s of w.solids) {
      const px = s.x, py = s.y;
      if (s.m) { const m = s.m, u = (1 - Math.cos(TAU * (t / m.per + (m.ph || 0)))) / 2; s.x = m.ax + (m.bx - m.ax) * u; s.y = m.ay + (m.by - m.ay) * u; }
      else if (s.o) { const a = TAU * (t / s.o.per + s.o.ph); s.x = s.o.cx + Math.cos(a) * s.o.r - s.w / 2; s.y = s.o.cy + Math.sin(a) * s.o.r - s.h / 2; }
      else if (s.k) {
        const k = s.k, u = ((t / k.per + (k.ph || 0)) % 1 + 1) % 1;
        s.y = u < .5 ? k.y0 : u < .56 ? lerp(k.y0, k.y1, (u - .5) / .06) : u < .72 ? k.y1 : lerp(k.y1, k.y0, (u - .72) / .28);
        s.hot = u >= .5 && u < .72 ? 1 : 0;
      } else if (s.f) {
        if (s.fs === 1) { s.ft -= dt; s.sh = Math.sin(t * 80) * 1.6; if (s.ft <= 0) { s.fs = 2; s.fv = 0; s.sh = 0; sfEv(w, ['crumble', s.x + s.w / 2, s.y]); } }
        else if (s.fs === 2) { s.fv = Math.min(900, s.fv + 1500 * dt); s.y += s.fv * dt; if (s.y > SF_H + 120) { s.fs = 3; s.rt = 6; } }
        else if (s.fs === 3) { s.rt -= dt; if (s.rt <= 0 && !w.fighters.some(q => q.alive && q.x > s.ox - 18 && q.x < s.ox + s.w + 18 && q.y > s.oy - 60 && q.y < s.oy + s.h + 30)) { s.fs = 0; s.x = s.ox; s.y = s.oy; s.sh = 0; } }
      }
      s.dx = s.x - px; s.dy = s.y - py;
    }
    for (const a of w.saws) {
      const u = (1 - Math.cos(TAU * (t / a.per + (a.ph || 0)))) / 2;
      a.x = a.ax + (a.bx - a.ax) * u; a.y = a.ay + (a.by - a.ay) * u; a.rot += dt * 14;
    }
    const m = w.map, r = m.rise || { y: SF_H + 8, from: 70, sp: 12 };
    w.rl = t < r.from ? SF_H + 40 : Math.max(-100, (r.y || SF_H + 8) - (t - r.from) * r.sp);
    for (const l of w.lava) if (l.rise) l.y = Math.max(l.rise.min, l.rise.y0 - Math.max(0, t - l.rise.t0) * l.rise.sp);
  }

  const sfBox = (f, s, ex) => f.x + SF_HW > s.x - ex && f.x - SF_HW < s.x + s.w + ex && f.y > s.y - ex && f.y - SF_HH < s.y + s.h + ex;

  function sfCtlMove(w, f, dt) {
    const px0 = f.x;
    f.x += f.vx * dt;
    f.wall = 0;
    for (const s of w.solids) {
      if (s.fs === 3) continue;
      if (f.x + SF_HW > s.x && f.x - SF_HW < s.x + s.w && f.y > s.y + .01 && f.y - SF_HH < s.y + s.h - .01) {
        if (px0 < s.x + s.w / 2) { f.x = s.x - SF_HW; if (f.vx > 0) f.vx = 0; }
        else { f.x = s.x + s.w + SF_HW; if (f.vx < 0) f.vx = 0; }
      }
    }
    const y0 = f.y;
    f.y += f.vy * dt;
    const was = f.gnd;
    f.gnd = false; f.gs = null;
    for (const s of w.solids) {
      if (s.fs === 3) continue;
      if (f.x + SF_HW > s.x && f.x - SF_HW < s.x + s.w && f.y > s.y && f.y - SF_HH < s.y + s.h) {
        if (f.vy >= 0 && y0 <= s.y + 2.5 + Math.max(0, s.dy)) {
          f.y = s.y; f.gnd = true; f.gs = s;
          if (f.vy > 260 && !was) { f.land = clamp(f.vy / 700, .2, 1); sfEv(w, ['land', f.x, f.y, f.vy]); }
          f.vy = 0;
        } else if (f.vy < 0) { f.y = s.y + s.h + SF_HH; f.vy = 0; }
      }
    }
    if (!f.gnd) {
      for (const dir of [-1, 1]) {
        for (const s of w.solids) {
          if (s.fs === 3) continue;
          if (f.x + SF_HW + (dir > 0 ? 1.5 : 0) > s.x && f.x - SF_HW - (dir < 0 ? 1.5 : 0) < s.x + s.w && f.y - 4 > s.y && f.y - SF_HH + 6 < s.y + s.h && ((dir > 0 && f.x < s.x) || (dir < 0 && f.x > s.x + s.w))) { f.wall = dir; break; }
        }
        if (f.wall) break;
      }
    }
  }

  function sfPush(w, f) {
    for (const s of w.solids) {
      if (s.fs === 3) continue;
      if (f.x + SF_HW > s.x + .5 && f.x - SF_HW < s.x + s.w - .5 && f.y > s.y + .5 && f.y - SF_HH < s.y + s.h - .5) {
        const pl = f.x + SF_HW - s.x, pr = s.x + s.w - (f.x - SF_HW), pu = f.y - s.y, pd = s.y + s.h - (f.y - SF_HH);
        const m = Math.min(pl, pr, pu, pd);
        if (m === pu) { f.y = s.y; f.vy = Math.min(f.vy, 0); }
        else if (m === pd) { f.y = s.y + s.h + SF_HH; f.vy = Math.max(f.vy, 0); }
        else if (m === pl) f.x = s.x - SF_HW;
        else f.x = s.x + s.w + SF_HW;
      }
    }
  }

  function sfCrushed(w, f) {
    let n = 0;
    for (const s of w.solids) {
      if (s.fs === 3 || s.wall) continue;
      if (f.x + SF_HW > s.x + 2 && f.x - SF_HW < s.x + s.w - 2 && f.y > s.y + 3 && f.y - SF_HH < s.y + s.h - 3) n++;
    }
    return n;
  }

  function sfKill(w, f, cause, kx, ky, ix, iy) {
    if (!f.alive) return;
    f.alive = false; f.hp = 0; f.mode = 'rag'; f.ragT = 999; f.stun = 0;
    if (f.wpn) { sfThrow(w, f, 0, 0, true); }
    const hx = f.p[4], hy = f.p[5];
    for (let i = 0; i < 11; i++) { f.v[i * 2] += (kx || 0) * (.5 + (i < 3 ? .5 : .2)); f.v[i * 2 + 1] += (ky || 0) * (.5 + (i < 3 ? .5 : .2)); }
    if (cause === 'saw' || cause === 'crush') sfEv(w, ['gore', hx, hy - 10, 26]);
    else if (cause === 'lava') sfEv(w, ['burn', hx, hy]);
    else if (cause === 'spike') sfEv(w, ['gore', hx, hy - 6, 16]);
    else if (cause !== 'void') sfEv(w, ['gore', ix == null ? hx : ix, iy == null ? hy - 10 : iy, 14]);
    sfEv(w, ['die', hx, hy, f.slot, cause]);
    w.shake = Math.max(w.shake, 7);
  }

  function sfToRag(w, f, t, vx, vy) {
    if (f.mode === 'rag') return;
    f.mode = 'rag'; f.ragT = t; f.blk = 0; f.atkT = 0; f.swing = 0; f.wallc = 0; f.spin = 0;
    for (let i = 0; i < 11; i++) { f.v[i * 2] = f.vx + (vx || 0) + rr(-30, 30); f.v[i * 2 + 1] = f.vy + (vy || 0) + rr(-30, 30); }
    sfEv(w, ['rag', f.p[4], f.p[5], f.slot]);
  }

  function sfRecover(w, f) {
    const hx = f.p[4], hy = f.p[5];
    f.mode = 'ctl'; f.getup = .3; f.stun = .1;
    f.vx = (f.v[4] + f.v[0]) * .3; f.vy = Math.min(0, f.v[5]) * .3;
    let best = null, by = 1e9;
    for (const s of w.solids) {
      if (s.fs === 3 || s.wall) continue;
      if (hx > s.x - 4 && hx < s.x + s.w + 4 && s.y >= hy - 30 && s.y - hy < 70 && s.y < by) { by = s.y; best = s; }
    }
    f.x = clamp(hx, 40, SF_W - 40);
    f.y = best ? best.y : hy + 24;
    f.gnd = !!best; f.gs = best;
    f.face = f.face || 1;
    sfPush(w, f);
  }

  function sfSpring(f, T, dt, rag) {
    const p = f.p, v = f.v, kg = f.getup > 0 ? .35 : 1;
    for (let i = 0; i < 11; i++) {
      const K = SF_K[i], k = K[0] * kg, c = K[1] * (f.getup > 0 ? .8 : 1);
      v[i * 2] += (k * (T[i * 2] - p[i * 2]) - c * v[i * 2]) * dt;
      v[i * 2 + 1] += (k * (T[i * 2 + 1] - p[i * 2 + 1]) - c * v[i * 2 + 1]) * dt;
      p[i * 2] += v[i * 2] * dt; p[i * 2 + 1] += v[i * 2 + 1] * dt;
    }
    sfBones(f, 2, .85, .3);
  }

  function sfBones(f, it, stiff, hw) {
    const p = f.p;
    for (let n = 0; n < it; n++) {
      for (let b = 0; b < SF_BONES.length; b++) {
        const bo = SF_BONES[b], i = bo[0] * 2, j = bo[1] * 2;
        let dx = p[j] - p[i], dy = p[j + 1] - p[i + 1];
        const d = Math.hypot(dx, dy) || .001;
        if (b === 10 && d >= bo[2]) continue;
        const k = b === 10 ? .25 : stiff, diff = (d - bo[2]) / d * .5 * k;
        dx *= diff; dy *= diff;
        const wi = bo[0] === 2 ? hw : 1, wj = bo[1] === 2 ? hw : 1, tw = wi + wj;
        p[i] += dx * 2 * wi / tw; p[i + 1] += dy * 2 * wi / tw; p[j] -= dx * 2 * wj / tw; p[j + 1] -= dy * 2 * wj / tw;
      }
    }
  }

  function sfRag(w, f, dt) {
    const p = f.p, v = f.v, ox = new Array(22);
    const damp = Math.pow(.62, dt);
    for (let i = 0; i < 11; i++) {
      v[i * 2 + 1] += 1500 * dt; v[i * 2] *= damp; v[i * 2 + 1] *= damp;
      ox[i * 2] = p[i * 2]; ox[i * 2 + 1] = p[i * 2 + 1];
      p[i * 2] += v[i * 2] * dt; p[i * 2 + 1] += v[i * 2 + 1] * dt;
    }
    for (let it = 0; it < 4; it++) {
      sfBones(f, 2, 1, 1);
      for (let i = 0; i < 11; i++) {
        const r = SF_PR[i];
        let x = p[i * 2], y = p[i * 2 + 1];
        for (const s of w.solids) {
          if (s.fs === 3) continue;
          if (x > s.x - r && x < s.x + s.w + r && y > s.y - r && y < s.y + s.h + r) {
            const pl = x + r - s.x, pr = s.x + s.w + r - x, pu = y + r - s.y, pd = s.y + s.h + r - y;
            const m = Math.min(pl, pr, pu, pd);
            if (m === pu) {
              p[i * 2 + 1] = s.y - r;
              p[i * 2] += (ox[i * 2] - p[i * 2]) * .012 + s.dx + (s.belt ? s.belt * dt * .6 : 0);
              if (s.sp) ox[i * 2 + 1] = p[i * 2 + 1] + 9;
            } else if (m === pd) p[i * 2 + 1] = s.y + s.h + r;
            else if (m === pl) p[i * 2] = s.x - r;
            else p[i * 2] = s.x + s.w + r;
            x = p[i * 2]; y = p[i * 2 + 1];
          }
        }
      }
    }
    if (!w.map.open) for (let i = 0; i < 11; i++) p[i * 2] = clamp(p[i * 2], 2, SF_W - 2);
    for (let i = 0; i < 22; i++) v[i] = clamp((p[i] - ox[i]) / dt, -1800, 1800);
  }

  function sfHurt(w, f, dmg, kx, ky, ix, iy, src, type, bone) {
    if (!f.alive) {
      if (f.mode === 'rag') for (let i = 0; i < 11; i++) { f.v[i * 2] += kx * .5; f.v[i * 2 + 1] += ky * .5; }
      return 0;
    }
    if (f.inv > 0) return 0;
    const melee = type === 'punch' || type === 'sword' || type === 'snake';
    let dirx = kx === 0 ? 0 : sgn(kx);
    if (f.blk > 0 && f.bm > 0 && f.mode === 'ctl' && dirx * f.face < 0) {
      dmg *= type === 'blast' ? .35 : .08; kx *= .3; ky *= .3;
      f.bm -= .22 + dmg / 120;
      sfEv(w, ['block', ix, iy, f.face]);
      if (f.bm <= 0) { f.bm = 0; f.stun = Math.max(f.stun, .7); f.blk = 0; sfEv(w, ['guard', f.p[4], f.p[5]]); }
    }
    if (bone === 0 && !melee && type !== 'blast') dmg *= 1.5;
    f.hp -= dmg;
    const km = Math.hypot(kx, ky);
    f.daze += dmg;
    if (f.hp <= 0) { sfKill(w, f, type, kx * 1.1, ky * 1.1, ix, iy); if (src != null && src !== f.slot) { const o = w.fighters.find(q => q.slot === src); if (o) o.kills++; } sfEv(w, ['hit', ix, iy, 1, type]); return dmg; }
    if (f.mode === 'ctl') {
      f.vx += kx; f.vy += ky; if (ky < 0) f.gnd = false;
      f.stun = Math.max(f.stun, Math.min(.4, .12 + dmg * .01));
      f.atkT = 0; f.swing = 0; f.spin = 0;
      for (let i = 0; i < 11; i++) { f.v[i * 2] += kx * (i === 0 ? .55 : .35); f.v[i * 2 + 1] += ky * (i === 0 ? .55 : .35); }
      if (km > 360 || f.daze > 34 || dmg >= 24) { sfToRag(w, f, clamp(.3 + km / 1100, .45, 1.5), kx * .6, ky * .6); f.daze = 0; }
    } else {
      for (let i = 0; i < 11; i++) { f.v[i * 2] += kx * .5; f.v[i * 2 + 1] += ky * .5; }
      f.ragT = Math.max(f.ragT, .35);
    }
    sfEv(w, ['hit', ix, iy, dmg >= 18 ? 2 : 0, type, kx, ky]);
    return dmg;
  }

  function sfThrow(w, f, vx, vy, drop) {
    if (!f.wpn) return;
    const e = { id: w.nid++, k: f.wpn.k, ammo: f.wpn.ammo, x: f.p[12], y: f.p[13] - 4, vx: f.vx + vx, vy: f.vy + vy, rot: f.wa, vr: rr(-12, 12), age: 0, th: drop ? 0 : f.slot, onG: false };
    if (drop) { e.vx = rr(-40, 40); e.vy = -120; }
    w.weapons.push(e);
    f.wpn = null; f.pick = .6; f.spin = 0;
    if (w.weapons.length > 6) w.weapons.shift();
  }

  function sfBoneHit(f, x, y, r) {
    const p = f.p;
    for (let b = 0; b < 10; b++) {
      const bo = SF_BONES[b], i = bo[0] * 2, j = bo[1] * 2;
      const ax = p[i], ay = p[i + 1], bx = p[j], by = p[j + 1], dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / l2, 0, 1);
      const cx = ax + dx * t, cy = ay + dy * t, rad = (t < .5 ? SF_PR[bo[0]] : SF_PR[bo[1]]) + r;
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < rad * rad) return b === 0 ? (t < .6 ? 0 : 1) : bo[1];
    }
    return -1;
  }

  function sfBullet(w, f, k, x, y, a, spd, dmg, kb, life, extra) {
    w.bullets.push(Object.assign({ id: w.nid++, k, x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, o: f.slot, dmg, kb, life, age: 0 }, extra || {}));
  }

  function sfShoot(w, f) {
    const wp = f.wpn, S = SF_WP[wp.k], a = f.wa;
    const dx = Math.cos(a), dy = Math.sin(a);
    let mx = f.p[12] + dx * S.len, my = f.p[13] + dy * S.len;
    if (sfInSolid(w, mx, my)) { mx = f.p[12]; my = f.p[13]; }
    f.fireCd = S.cd;
    wp.ammo--;
    const sp = S.spr, n = S.pel || 1;
    if (wp.k === 'snake') {
      w.snakes.push({ id: w.nid++, x: mx, y: my, vx: dx * 360 + f.vx * .3, vy: dy * 360 - 40, o: f.slot, air: 1, life: 6.5, dir: f.face, bite: 0, bites: 0, ph: 0 });
    } else if (wp.k === 'rocket') {
      sfBullet(w, f, 'rk', mx, my, a, 330, S.dmg, S.kb, 4, { sp: 330, a });
    } else {
      for (let i = 0; i < n; i++) {
        const aa = a + rr(-sp, sp);
        sfBullet(w, f, wp.k === 'sniper' ? 'sn' : 'b', mx, my, aa, S.spd * (n > 1 ? rr(.9, 1.05) : 1), S.dmg, S.kb, n > 1 ? .42 : 1.2, { px: mx, py: my });
      }
    }
    const rec = S.rec * (f.gnd ? .7 : 1);
    if (f.mode === 'ctl') { f.vx -= dx * rec; f.vy -= dy * rec * .35 + (wp.k === 'rocket' || wp.k === 'sniper' ? 20 : 0); f.rc = rec; }
    sfEv(w, ['shot', mx, my, a, wp.k]);
    if (wp.ammo <= 0) f.wpn.empty = .4;
  }

  function sfPunchHit(w, f, reach, hy0, hy1, dmg, kx, ky, type, tag) {
    const hits = f.atkHit || (f.atkHit = []);
    for (const o of w.fighters) {
      if (o === f || hits.includes(o.slot)) continue;
      if (!o.alive) continue;
      let best = -1, bd = 1e9, bx = 0, by = 0;
      for (const i of [0, 1, 2, 4, 6, 8, 10]) {
        const px = o.p[i * 2], py = o.p[i * 2 + 1], dx = (px - f.x) * f.face;
        if (dx > -4 && dx < reach && py > f.y - hy0 && py < f.y - hy1) { if (Math.abs(dx - reach / 2) < bd) { bd = Math.abs(dx - reach / 2); best = i; bx = px; by = py; } }
      }
      if (best >= 0) {
        hits.push(o.slot);
        sfHurt(w, o, dmg, kx * f.face, ky, bx, by, f.slot, type, best);
        f.vx += f.face * 40;
        w.freeze = Math.max(w.freeze, type === 'sword' ? .07 : .05);
        w.shake = Math.max(w.shake, type === 'sword' ? 5 : 3);
      }
    }
  }

  function sfGround(w, x, y0, maxd) {
    let best = null, by = 1e9;
    for (const s of w.solids) {
      if (s.fs === 3 || s.wall) continue;
      if (x > s.x && x < s.x + s.w && s.y >= y0 - 2 && s.y < by && s.y - y0 < maxd) { by = s.y; best = s; }
    }
    return best;
  }

  function sfHazardAt(w, x, y) {
    for (const l of w.lava) if (x > l.x - 2 && x < l.x + l.w + 2 && y >= l.y - 1) return 'lava';
    if (y >= w.rl) return 'lava';
    for (const s of w.spikes) if (x > s.x - 2 && x < s.x + s.w + 2 && y > s.y - 2 && y < s.y + s.h + 2) return 'spike';
    for (const a of w.saws) if (Math.hypot(x - a.x, y - a.y) < a.r + 6) return 'saw';
    return null;
  }

  function sfHazards(w, f) {
    if (!f.alive) return;
    const p = f.p;
    let cause = null;
    for (const i of [0, 1, 2, 4, 6, 8, 10]) {
      const x = p[i * 2], y = p[i * 2 + 1];
      if (i === 4 || i === 6) { if (y < w.rl - 1 && !w.lava.some(l => y > l.y + 6)) continue; }
      const c = sfHazardAt(w, x, y);
      if (c) { cause = c; break; }
    }
    if (!cause) {
      for (const a of w.saws) {
        for (let b = 0; b < 10; b++) {
          const bo = SF_BONES[b], i = bo[0] * 2, j = bo[1] * 2, ax = p[i], ay = p[i + 1], dx = p[j] - ax, dy = p[j + 1] - ay;
          const t = clamp(((a.x - ax) * dx + (a.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
          if (Math.hypot(ax + dx * t - a.x, ay + dy * t - a.y) < a.r + 3) { cause = 'saw'; break; }
        }
        if (cause) break;
      }
    }
    if (cause) { sfKill(w, f, cause, rr(-80, 80), cause === 'lava' ? -200 : -260, p[4], p[5]); return; }
    if (p[5] > 640 || p[4] < -90 || p[4] > SF_W + 90 || p[5] < -400) sfKill(w, f, 'void', 0, 0);
    else if (f.mode === 'ctl' && sfCrushed(w, f) > 0) sfKill(w, f, 'crush', rr(-60, 60), -120);
  }

  function sfExplode(w, x, y, owner) {
    const R = 100;
    sfEv(w, ['boom', x, y]);
    w.shake = Math.max(w.shake, 14); w.freeze = Math.max(w.freeze, .06);
    for (const f of w.fighters) {
      const hx = f.p[4], hy = f.p[5] - 14;
      const d = Math.hypot(hx - x, hy - y);
      if (d > R + 28) continue;
      const fac = clamp(1 - d / (R + 28), 0, 1);
      let ux = (hx - x) / (d || 1), uy = (hy - y) / (d || 1) - .35;
      const um = Math.hypot(ux, uy) || 1; ux /= um; uy /= um;
      const k = 520 + 820 * fac;
      const dmg = (owner === f.slot ? 40 : 66) * fac + 6;
      if (f.alive) {
        sfHurt(w, f, dmg, ux * k * .3, uy * k * .3, hx, hy, owner, 'blast', 2);
        if (f.alive && f.mode === 'ctl') sfToRag(w, f, .9 + fac * .6, ux * k, uy * k);
        else if (f.mode === 'rag') for (let i = 0; i < 11; i++) { f.v[i * 2] += ux * k; f.v[i * 2 + 1] += uy * k; }
        if (!f.alive) for (let i = 0; i < 11; i++) { f.v[i * 2] += ux * k * .8; f.v[i * 2 + 1] += uy * k * .8; }
      } else for (let i = 0; i < 11; i++) { f.v[i * 2] += ux * k; f.v[i * 2 + 1] += uy * k; }
    }
    for (const e of w.weapons) { const d = Math.hypot(e.x - x, e.y - y); if (d < R + 30) { const fc = 1 - d / (R + 30); e.vx += (e.x - x) / (d || 1) * 600 * fc; e.vy += (e.y - y) / (d || 1) * 600 * fc - 200; e.onG = false; } }
    for (const s of w.solids) {
      if (!s.f || s.fs !== 0) continue;
      if (x > s.x - R * .6 && x < s.x + s.w + R * .6 && y > s.y - R * .6 && y < s.y + s.h + R * .6) { s.fs = 1; s.ft = .05; }
    }
  }

  function sfBullets(w, dt) {
    for (let i = w.bullets.length - 1; i >= 0; i--) {
      const b = w.bullets[i];
      b.life -= dt; b.age += dt;
      if (b.k === 'rk') {
        b.sp = Math.min(780, b.sp + 520 * dt); b.vx = Math.cos(b.a) * b.sp; b.vy = Math.sin(b.a) * b.sp;
        if (b.age > .03) sfEv(w, ['smoke', b.x - Math.cos(b.a) * 8, b.y - Math.sin(b.a) * 8]);
      }
      let rm = b.life <= 0;
      if (rm && b.k === 'rk') sfExplode(w, b.x, b.y, b.o);
      if (!rm) {
        const dist = Math.hypot(b.vx, b.vy) * dt, n = Math.max(1, Math.ceil(dist / 4.5));
        const stx = b.vx * dt / n, sty = b.vy * dt / n;
        for (let s = 0; s < n && !rm; s++) {
          b.x += stx; b.y += sty;
          if (sfInSolid(w, b.x, b.y)) {
            b.x -= stx; b.y -= sty; rm = true;
            sfEv(w, ['spark', b.x, b.y, Math.atan2(-sty, -stx)]);
            if (b.k === 'rk') sfExplode(w, b.x, b.y, b.o);
            break;
          }
          if (b.x < -80 || b.x > SF_W + 80 || b.y > SF_H + 200 || b.y < -500) { rm = true; break; }
          for (const f of w.fighters) {
            if (f.slot === b.o && b.age < .25) continue;
            if (!f.alive && f.mode !== 'rag') continue;
            if (b.hit && b.hit.includes(f.slot)) continue;
            const bone = sfBoneHit(f, b.x, b.y, 1.5);
            if (bone < 0) continue;
            if (b.k === 'rk') { sfExplode(w, b.x, b.y, b.o); rm = true; break; }
            const m = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / m, uy = b.vy / m;
            sfHurt(w, f, b.dmg, ux * b.kb, uy * b.kb - b.kb * .15, b.x, b.y, b.o, 'bullet', bone);
            if (f.alive && b.k !== 'sn') { const j = bone * 2; f.v[j] += ux * b.kb * .8; f.v[j + 1] += uy * b.kb * .8; }
            if (b.k === 'sn') { (b.hit || (b.hit = [])).push(f.slot); w.freeze = Math.max(w.freeze, .05); w.shake = Math.max(w.shake, 6); }
            else { rm = true; break; }
          }
        }
      }
      if (rm) w.bullets.splice(i, 1);
    }
  }

  function sfSnakes(w, dt) {
    for (let i = w.snakes.length - 1; i >= 0; i--) {
      const sn = w.snakes[i];
      sn.life -= dt; sn.bite -= dt; sn.ph += dt * 9;
      if (sn.life <= 0 || sn.y > SF_H + 100) { w.snakes.splice(i, 1); continue; }
      let tgt = null, bd = 1e9;
      for (const f of w.fighters) { if (!f.alive || f.slot === sn.o) continue; const d = Math.hypot(f.p[4] - sn.x, f.p[5] - sn.y); if (d < bd) { bd = d; tgt = f; } }
      if (sn.air) {
        sn.vy += 1100 * dt; sn.x += sn.vx * dt; sn.y += sn.vy * dt;
        if (sfInSolid(w, sn.x, sn.y)) {
          const s = sfInSolid(w, sn.x, sn.y);
          if (sn.vy > 0 && sn.y - s.y < 14) { sn.y = s.y; sn.air = 0; sn.vy = 0; sn.vx = 0; }
          else { sn.x -= sn.vx * dt; sn.vx *= -.3; sn.y -= sn.vy * dt; sn.vy = Math.max(0, sn.vy); }
        }
        if (sn.x < 10 || sn.x > SF_W - 10) sn.vx *= -.5;
      } else {
        const dir = tgt ? sgn(tgt.p[4] - sn.x) : sn.dir;
        sn.dir = dir || sn.dir;
        sn.vy += 1100 * dt;
        sn.x += sn.dir * 105 * dt; sn.y += sn.vy * dt;
        const g = sfGround(w, sn.x, sn.y - 8, 20);
        if (g && sn.vy >= 0) { sn.y = g.y; sn.vy = 0; sn.gs = g; }
        else if (!g && sn.vy === 0) sn.vy = 1;
        const wl = sfInSolid(w, sn.x + sn.dir * 6, sn.y - 6);
        if (wl) { sn.x -= sn.dir * 105 * dt; if (tgt && tgt.p[5] < sn.y - 20) sn.vy = -380; else sn.dir = -sn.dir; }
        if (tgt && Math.abs(tgt.p[5] - sn.y) > 60 && tgt.p[5] < sn.y && Math.abs(tgt.p[4] - sn.x) < 30 && sn.vy === 0) sn.vy = -380;
      }
      if (tgt && sn.bite <= 0) {
        for (const f of w.fighters) {
          if (!f.alive || f.slot === sn.o) continue;
          if (Math.hypot(f.p[2] - sn.x, f.p[3] - sn.y) < 36 || Math.hypot(f.p[8] - sn.x, f.p[9] - sn.y) < 12 || Math.hypot(f.p[16] - sn.x, f.p[17] - sn.y) < 12 || Math.hypot(f.p[20] - sn.x, f.p[21] - sn.y) < 12) {
            sn.bite = .6; sn.bites++;
            sfHurt(w, f, 12, sgn(f.x - sn.x) * 140, -190, sn.x, sn.y - 6, sn.o, 'snake', 8);
            sfEv(w, ['bite', sn.x, sn.y]);
            if (sn.bites >= 3) sn.life = 0;
            break;
          }
        }
      }
    }
  }

  function sfWeaponsStep(w, dt) {
    for (let i = w.weapons.length - 1; i >= 0; i--) {
      const e = w.weapons[i];
      e.age += dt;
      if (!e.onG) {
        e.vy = Math.min(900, e.vy + 1400 * dt);
        e.x += e.vx * dt; const y0 = e.y; e.y += e.vy * dt; e.rot += e.vr * dt;
        for (const s of w.solids) {
          if (s.fs === 3) continue;
          if (e.x > s.x && e.x < s.x + s.w && e.y > s.y && e.y < s.y + s.h) {
            if (e.vy >= 0 && y0 <= s.y + 4 + Math.max(0, s.dy)) { e.y = s.y; e.vy *= -.25; e.vx *= .6; if (Math.abs(e.vy) < 40) { e.vy = 0; e.onG = true; e.th = 0; e.rot = 0; e.vr = 0; e.gs = s; } }
            else { e.x -= e.vx * dt; e.vx *= -.4; }
          }
        }
      } else {
        const s = e.gs;
        if (!s || s.fs === 3 || !(e.x > s.x && e.x < s.x + s.w)) e.onG = false;
        else { e.x += s.dx; e.y = s.y; }
      }
      if (e.y > SF_H + 80 || e.y > w.rl || w.lava.some(l => e.y > l.y && e.x > l.x && e.x < l.x + l.w)) { w.weapons.splice(i, 1); continue; }
      if (e.th && !e.onG) {
        for (const f of w.fighters) {
          if (f.slot === e.th && e.age < .25 || !f.alive || f.slot === e.th) continue;
          if (Math.hypot(f.p[2] - e.x, f.p[3] - e.y) < 16 && Math.hypot(e.vx, e.vy) > 250) {
            sfHurt(w, f, 7, sgn(e.vx) * 200, -120, e.x, e.y, e.th, 'punch', 1);
            e.vx *= -.2; e.th = 0;
          }
        }
      }
    }
    for (let i = w.crates.length - 1; i >= 0; i--) {
      const c = w.crates[i];
      if (c.st === 0) {
        c.vy = Math.min(190, c.vy + 260 * dt); c.y += c.vy * dt; c.sw = Math.sin(w.t * 3 + c.id) * .25;
        let land = null;
        for (const s of w.solids) { if (s.fs === 3) continue; if (c.x > s.x - 8 && c.x < s.x + s.w + 8 && c.y + 12 > s.y && c.y + 12 < s.y + 14 + Math.max(0, s.dy)) { land = s; break; } }
        if (land) { c.y = land.y - 12; c.st = 1; c.t = .35; sfEv(w, ['crate', c.x, land.y]); }
        else for (const f of w.fighters) {
          if (!f.alive || f.mode !== 'ctl') continue;
          if (Math.abs(f.p[2] - c.x) < 14 && c.y + 12 > f.p[1] - 8 && c.y < f.p[5] && c.vy > 60) { sfHurt(w, f, 7, 0, 120, c.x, c.y, -1, 'bullet', 0); c.st = 1; c.t = .1; sfEv(w, ['crate', c.x, c.y]); break; }
        }
        if (c.y > SF_H + 60 || c.y + 12 > w.rl) w.crates.splice(i, 1);
      } else {
        c.t -= dt;
        if (c.t <= 0) {
          w.weapons.push({ id: w.nid++, k: c.k, ammo: SF_WP[c.k].ammo, x: c.x, y: c.y + 4, vx: rr(-30, 30), vy: -260, rot: 0, vr: 0, age: 0, th: 0, onG: false });
          sfEv(w, ['open', c.x, c.y]);
          w.crates.splice(i, 1);
          if (w.weapons.length > 6) w.weapons.shift();
        }
      }
    }
    w.dropT -= dt;
    if (w.dropT <= 0 && w.drops > 0) {
      w.dropT = rr(5, 8) / w.drops;
      if (w.weapons.length + w.crates.length < 5) {
        const m = w.map, x0 = m.dx ? m.dx[0] : 70, x1 = m.dx ? m.dx[1] : 890;
        for (let tr = 0; tr < 8; tr++) {
          const x = rr(x0, x1);
          const g = sfGround(w, x, -100, 1000);
          if (!g || g.y < 120 && g.fs !== 0 && 0) continue;
          if (sfHazardAt(w, x, g.y - 4)) continue;
          let tot = 0; SF_WK.forEach(k => { tot += SF_WP[k].w; });
          let r = Math.random() * tot, kk = SF_WK[0];
          for (const k of SF_WK) { r -= SF_WP[k].w; if (r <= 0) { kk = k; break; } }
          w.crates.push({ id: w.nid++, x, y: -30, vy: 0, k: kk, st: 0, t: 0, sw: 0 });
          break;
        }
      }
    }
  }

  function sfFighter(w, f, dt) {
    f.t += dt;
    for (const k of ['stun', 'atkCd', 'fireCd', 'pick', 'getup', 'inv', 'win']) if (f[k] > 0) f[k] = Math.max(0, f[k] - dt);
    f.daze = Math.max(0, f.daze - 18 * dt);
    f.land = Math.max(0, f.land - dt * 5);
    f.rc *= Math.pow(.01, dt);
    if (f.swing > 0) f.swing = Math.max(0, f.swing - dt);
    if (f.wpn && f.wpn.empty) { f.wpn.empty -= dt; if (f.wpn.empty <= 0) { f.wpn = null; f.pick = .4; } }
    const T = f.tg || (f.tg = new Array(22).fill(0));
    if (!f.alive) { sfRag(w, f, dt); sfHazardsDead(w, f); return; }
    if (f.mode === 'rag') {
      f.ragT -= dt;
      sfRag(w, f, dt);
      const sp = Math.hypot(f.v[4], f.v[5]);
      if (f.ragT <= 0 && sp < 160) sfRecover(w, f);
      sfHazards(w, f);
      f.wa = Math.atan2(f.p[13] - f.p[11], f.p[12] - f.p[10]);
      return;
    }
    const i = w.noIn ? { l: 0, r: 0, u: 0, d: 0, j: 0, a: 0, b: 0, x: 0, ang: null } : f.in;
    const stunned = f.stun > 0;
    const S = f.wpn && SF_WP[f.wpn.k];
    const gun = S && !S.melee;
    const ap = i.a && !f.ah, xp = i.x && !f.xh;
    f.ah = i.a; f.xh = i.x;
    let mx = stunned ? 0 : (i.r - i.l);
    const wantBlock = i.b && !stunned && !(S && !S.melee && f.fireCd > 0 && 0);
    if (wantBlock && f.bm > 0 && f.atkT <= 0 && f.swing <= 0) { f.blk = 1; f.bm = Math.max(0, f.bm - dt / 2.2); if (f.bm <= 0) { f.blk = 0; f.stun = Math.max(f.stun, .5); sfEv(w, ['guard', f.p[4], f.p[5]]); } }
    else { f.blk = 0; f.bm = Math.min(1, f.bm + dt / 3); }
    let a = f.face > 0 ? 0 : Math.PI;
    if (i.ang != null) a = i.ang;
    else if (gun && i.a) { if (i.u) a = f.face > 0 ? -1.15 : -Math.PI + 1.15; else if (i.d) a = f.face > 0 ? .9 : Math.PI - .9; }
    f.aim = a;
    f.wa = angLerp(f.wa, a, 1 - Math.exp(-40 * dt));
    if (!stunned && f.atkT <= 0 && f.swing <= 0) {
      if ((gun || (S && S.melee && i.ang != null)) && f.wpn) f.face = Math.cos(a) >= 0 ? 1 : -1;
      else if (mx !== 0) f.face = mx;
      else if (i.ang != null && !f.wpn) f.face = Math.cos(a) >= 0 ? 1 : -1;
    }
    let spd = 205 * (f.blk > 0 ? .3 : 1) * (f.spin > .3 ? .5 : 1) * (f.atkT > 0 ? .55 : 1);
    const acc = f.gnd ? 2800 : 1500;
    const tv = mx * spd;
    if (mx !== 0 && (Math.sign(f.vx) !== mx || Math.abs(f.vx) < Math.abs(tv))) f.vx += clamp(tv - f.vx, -acc * dt, acc * dt);
    else if (mx === 0 || Math.abs(f.vx) > Math.abs(tv)) f.vx -= clamp(f.vx, -(f.gnd ? 2400 : 260) * dt, (f.gnd ? 2400 : 260) * dt);
    if (f.gnd && f.gs && f.gs.belt) f.vx += f.gs.belt * dt * 6, f.vx = clamp(f.vx, -spd - 120, spd + 120);
    if (f.gnd) { f.coy = .09; if (Math.abs(f.vx) > 10) f.ph += Math.abs(f.vx) * dt * .085 * (f.face * sgn(f.vx) < 0 ? 1 : 1); }
    else f.coy = Math.max(0, f.coy - dt);
    const jp = i.j && !f.jh && !stunned;
    f.jh = i.j;
    if (jp) f.jb = .13; else f.jb = Math.max(0, f.jb - dt);
    f.wallc = 0;
    if (!f.gnd && f.wall && mx === f.wall && f.vy > -50 && !stunned) { f.wallc = f.wall; }
    if (f.jb > 0 && !stunned) {
      if (f.gnd || f.coy > 0) {
        f.vy = -565; f.gnd = false; f.coy = 0; f.jb = 0; f.land = 0;
        if (f.gs && f.gs.f && f.gs.fs === 0) { f.gs.fs = 1; f.gs.ft = .6; }
        if (f.gs && f.gs.sp) f.vy = -980;
        sfEv(w, ['jump', f.x, f.y]);
      } else if (f.wall && !f.gnd) {
        f.vy = -545; f.vx = -f.wall * 290; f.face = -f.wall; f.jb = 0; f.wallc = 0; f.wall = 0;
        sfEv(w, ['wjump', f.x, f.y - 20]);
      }
    }
    if (!i.j && f.vy < -260 && !f.gnd) f.vy *= Math.pow(.0002, dt);
    f.vy = Math.min(920, f.vy + 1500 * dt * (f.wallc ? .2 : 1));
    if (f.wallc && f.vy > 75) f.vy = 75;
    if (f.gnd && f.gs && f.gs.f && f.gs.fs === 0 && !w.noIn) { f.gs.fs = 1; f.gs.ft = 1.3; }
    if (f.gnd && f.gs && f.gs.sp && !f.gs.sprung) { f.vy = -980; f.gs.sprung = 1; f.gnd = false; sfEv(w, ['spring', f.x, f.y]); }
    if (f.gs && f.gs.sp && f.gnd) f.gs.sprung = 0;
    if (f.gnd && f.gs) { f.x += f.gs.dx; f.y += f.gs.dy; }
    if (!stunned && xp && f.wpn) { sfThrow(w, f, Math.cos(a) * 380, Math.sin(a) * 380 - 140, false); }
    if (!stunned && f.blk <= 0) {
      if (!f.wpn) {
        if (i.a && f.atkCd <= 0) { f.atkT = .26; f.atkCd = .3; f.atkHand ^= 1; f.atkHit = []; f.vx += f.face * 90; sfEv(w, ['whoosh', f.x, f.y - 30]); }
      } else if (S.melee) {
        if (i.a && f.atkCd <= 0 && f.swing <= 0) { f.swing = .36; f.atkCd = S.cd; f.atkHit = []; f.vx += f.face * 120; sfEv(w, ['swing', f.x, f.y - 30, f.face]); }
      } else {
        if (S.spin) { if (i.a) f.spin = Math.min(1, f.spin + dt / S.spin); else f.spin = Math.max(0, f.spin - dt * 2); }
        const ready = f.fireCd <= 0 && f.wpn.ammo > 0 && !f.wpn.empty && (!S.spin || f.spin >= 1);
        if (ready && (S.auto ? i.a : ap)) sfShoot(w, f);
        else if (ap && f.wpn.ammo <= 0) sfEv(w, ['click', f.x, f.y]);
      }
    }
    if (f.atkT > 0) {
      f.atkT -= dt;
      if (f.atkT < .17 && f.atkT > .06) sfPunchHit(w, f, 30, 52, 6, 11, 255, -165, 'punch');
    }
    if (f.swing > 0) {
      if (f.swing < .28 && f.swing > .12) sfPunchHit(w, f, 62, 64, -4, 30, 470, -250, 'sword');
    }
    sfCtlMove(w, f, dt);
    sfPush(w, f);
    for (const o of w.fighters) {
      if (o === f || !o.alive || o.mode !== 'ctl') continue;
      const dx = f.x - o.x;
      if (Math.abs(dx) < 11 && Math.abs(f.y - o.y) < 40) { const pu = (11 - Math.abs(dx)) * .5 * (dx >= 0 ? 1 : -1); f.x += pu; o.x -= pu; }
    }
    sfPush(w, f);
    if (!w.map.open) f.x = clamp(f.x, SF_HW + 1, SF_W - SF_HW - 1);
    if (!f.wpn && f.pick <= 0) {
      for (let q = 0; q < w.weapons.length; q++) {
        const e = w.weapons[q];
        if (Math.abs(e.x - f.x) < 20 && e.y > f.y - 52 && e.y < f.y + 12 && !(e.th && e.age < .3)) { f.wpn = { k: e.k, ammo: e.ammo }; w.weapons.splice(q, 1); f.pick = .3; sfEv(w, ['pick', f.x, f.y - 30, e.k]); break; }
      }
    }
    sfPose(f, T);
    sfSpring(f, T, dt);
    sfHazards(w, f);
  }

  function sfHazardsDead(w, f) {
    const p = f.p;
    for (const i of [2, 5]) {
      const c = sfHazardAt(w, p[i * 2], p[i * 2 + 1]);
      if (c === 'lava' && !f.burned) { f.burned = 1; sfEv(w, ['burn', p[4], p[5]]); }
      if (c === 'saw' && !f.sawn) { f.sawn = 1; sfEv(w, ['gore', p[4], p[5], 14]); }
    }
    if (p[5] > 700) { for (let i = 0; i < 22; i++) f.v[i] = 0; }
  }

  function sfStep(w, dt) {
    if (w.freeze > 0) { w.freeze -= dt; return; }
    w.t += dt;
    w.shake = Math.max(0, w.shake - 30 * dt);
    sfSolids(w, dt);
    sfWeaponsStep(w, dt);
    for (const f of w.fighters) sfFighter(w, f, dt);
    sfBullets(w, dt);
    sfSnakes(w, dt);
  }

  function sfLos(w, x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 8);
    for (let i = 1; i < n; i++) if (sfInSolid(w, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)) return false;
    return true;
  }

  function sfColumn(w, x, y) {
    const g = sfGround(w, x, y - 36, 230);
    if (!g) return null;
    if (sfHazardAt(w, x, g.y - 3) || sfHazardAt(w, x, g.y - 20)) return null;
    return g;
  }

  function sfBotJumpable(w, f, dir) {
    for (let d = 30; d <= 150; d += 12) {
      const g = sfGround(w, f.x + dir * d, f.y - 90, 330);
      if (!g || sfHazardAt(w, f.x + dir * d, g.y - 3) || sfInSolid(w, f.x + dir * d, g.y - 30)) continue;
      const dh = f.y - g.y;
      if (dh > 96) continue;
      const reach = 205 * (565 + Math.sqrt(565 * 565 - 3000 * dh)) / 1500 - 22;
      if (d <= reach) return d;
    }
    return 0;
  }

  function sfBotThink(w, f) {
    const b = f.bot, L = SF_BOT[clamp((f.lvl || 3) - 1, 0, 4)];
    b.err = rr(-L.err, L.err);
    b.reflex = Math.random() < 1 - (1 - L.haz) * .3;
    const foes = w.fighters.filter(o => o !== f && o.alive);
    const x = f.x, y = f.y, hy = f.p[5];
    let tgt = null, bd = 1e9;
    for (const o of foes) {
      let d = Math.hypot(o.p[4] - x, o.p[5] - hy);
      if (f.lvl >= 4) d += o.hp * .8;
      if (d < bd) { bd = d; tgt = o; }
    }
    b.tgt = tgt ? tgt.slot : -1;
    b.mx = 0; b.fire = 0; b.blk = 0; b.jmp = 0;
    const S = f.wpn && SF_WP[f.wpn.k];
    let goalX = null, fetch = null;
    if (!f.wpn && w.weapons.length && Math.random() < L.wpn) {
      let wd = 1e9;
      for (const e of w.weapons) { const d = Math.abs(e.x - x) + Math.abs(e.y - y) * 1.6; if (d < wd) { wd = d; fetch = e; } }
      if (fetch && !(tgt && bd < 90 && Math.random() < .6)) goalX = fetch.x; else fetch = null;
    }
    if (!f.wpn && !fetch && w.crates.length && Math.random() < L.wpn * .6) {
      const c = w.crates.reduce((a, q) => !a || Math.abs(q.x - x) < Math.abs(a.x - x) ? q : a, null);
      if (c && Math.abs(c.x - x) < 300) goalX = c.x;
    }
    if (!tgt) { b.goal = goalX; b.mx = goalX != null ? sgn(goalX - x) * (Math.abs(goalX - x) > 8 ? 1 : 0) : 0; return; }
    const tx = tgt.p[4], ty = tgt.p[5], dx = tx - x, dy = ty - hy, dist = Math.hypot(dx, dy);
    let want = 'melee', ideal = 24;
    if (S && !S.melee && f.wpn.ammo > 0) {
      want = 'range';
      ideal = { pistol: 250, uzi: 200, shotgun: 120, sniper: 420, minigun: 250, rocket: 280, snake: 200 }[f.wpn.k] || 220;
    } else if (S && S.melee) ideal = 46;
    if (goalX == null) {
      if (want === 'range') {
        if (dist > ideal + 50) goalX = tx;
        else if (dist < ideal - 70) goalX = x - sgn(dx) * 200;
        else goalX = x;
      } else goalX = tx - sgn(dx) * (ideal - 8);
    }
    if (Math.random() > L.aggr && want === 'melee' && dist > 120) goalX = x;
    let mx = Math.abs(goalX - x) > 7 ? sgn(goalX - x) : 0;
    const gx = mx;
    if (f.gnd && mx !== 0) {
      const lookD = [18, 34, 52, 72];
      let blocked = 0, gap = 0;
      for (const d of lookD) {
        if (sfInSolid(w, x + mx * d, y - 14) && !sfInSolid(w, x + mx * d, y - 70)) blocked = Math.max(blocked, d);
        else if (sfInSolid(w, x + mx * d, y - 14)) blocked = -d;
        if (!sfColumn(w, x + mx * d, y)) { gap = d; break; }
      }
      if (blocked > 0 && Math.random() < L.jmp) b.jmp = 1;
      else if (blocked < 0) { if (f.wall === mx && Math.random() < L.wall) b.jmp = 1; else if (Math.random() < L.wall) b.jmp = 1; else mx = 0; }
      if (gap) {
        const jd = sfBotJumpable(w, f, mx);
        if (jd && gap <= 34 && Math.random() < Math.min(1, L.jmp + .3)) b.jmp = 1;
        else if (jd && gap > 34) b.mx0 = 1;
        else if (Math.random() < 1 - (1 - L.haz) * .3) mx = 0;
      }
      for (const a of w.saws) {
        if (Math.abs(a.x - (x + mx * 40)) < 70 && Math.abs(a.y - (y - 20)) < 56 && L.haz > Math.random()) {
          if (a.y > y - 40 && Math.abs(a.x - x) < 80) b.jmp = 1; else mx = 0;
        }
      }
    }
    if (f.gnd && goalX != null && w.fighters.length) {
      const ty2 = fetch ? fetch.y : ty + 22;
      if (ty2 < y - 56 && Math.abs(goalX - x) < 400) {
        let bestS = null, bs = 1e9;
        for (const s of w.solids) {
          if (s.fs === 3 || s.wall) continue;
          if (s.y > y - 28 || s.y < y - 104) continue;
          const nx = clamp(x, s.x - 10, s.x + s.w + 10), dd = Math.abs(nx - x) + Math.abs(s.x + s.w / 2 - goalX) * .3;
          if (dd < bs && (sfColumn(w, s.x + s.w / 2, s.y - 40))) { bs = dd; bestS = s; }
        }
        if (bestS) {
          const nx = clamp(x, bestS.x + 4, bestS.x + bestS.w - 4);
          mx = Math.abs(nx - x) > 18 ? sgn(nx - x) : 0;
          if (Math.abs(nx - x) < 40 || (Math.abs(x - (bestS.x - 8)) < 30 || Math.abs(x - (bestS.x + bestS.w + 8)) < 30)) { if (f.y - bestS.y > 20) b.jmp = 1; }
          if (mx === 0 && f.y - bestS.y > 20) b.jmp = 1;
          b.up = bestS;
        } else if (dist > 80 && Math.random() < L.wall) { mx = sgn(dx); b.jmp = 1; }
      }
    }
    if (!f.gnd) {
      if (f.vy > 300 && mx !== 0 && !sfColumn(w, x + mx * 20, y) && sfColumn(w, x, y)) mx = 0;
      const fall = !sfColumn(w, x + f.vx * .25, y + 40);
      if (fall && f.vy > 150) { const ln = sfBotJumpable(w, f, sgn(dx) || 1); if (ln) mx = sgn(dx) || 1; else { const l2 = sfBotJumpable(w, f, -(sgn(dx) || 1)); if (l2) mx = -(sgn(dx) || 1); } }
      if (f.wall && L.wall > Math.random() && (hy > ty || fetch)) { mx = f.wall; b.jmp = f.vy > -100 ? 1 : 0; }
    }
    b.mx = mx;
    if (want === 'melee' && S && S.melee || want === 'melee') {
      const reach = S && S.melee ? 62 : 30;
      if (Math.abs(dx) * 1 < reach + 4 && Math.abs(dy) < 44 && foes.length) { b.fire = 1; f.face = sgn(dx) || f.face; }
      if (dist < 70 && tgt.atkT > 0 && Math.random() < L.blk) { b.blk = 1; b.mx = 0; }
      if (dist < 50 && Math.random() < .25 * L.aggr) b.fire = 1;
    } else if (want === 'range') {
      const los = sfLos(w, f.p[4], f.p[3], tx, ty);
      const rangeOk = f.wpn.k === 'shotgun' ? dist < 230 : f.wpn.k === 'rocket' ? dist > 80 : true;
      if (los && rangeOk) b.fire = 1;
      if (f.wpn.k === 'minigun' && los) b.fire = 1;
      if (tgt.atkT > 0 && dist < 70 && Math.random() < L.blk * .6) { b.blk = 1; b.fire = 0; }
    }
    if (tgt.wpn && SF_WP[tgt.wpn.k] && !SF_WP[tgt.wpn.k].melee && L.blk > .5 && dist < 260 && Math.random() < L.blk * .25 && want !== 'range') { b.blk = 1; }
    if (b.fire && Math.random() > (.5 + L.aggr * .5) && want === 'melee') b.fire = 0;
    b.tx = tx; b.ty = ty; b.tvx = tgt.mode === 'ctl' ? tgt.vx : (tgt.v[4] || 0); b.tvy = tgt.mode === 'ctl' ? tgt.vy : (tgt.v[5] || 0);
    b.dist = dist;
  }

  function sfBotRun(w, f, dt) {
    if (!f.bot) f.bot = { t: rr(0, .3), tgt: -1, mx: 0, fire: 0, blk: 0, jmp: 0, jh: 0, aimA: 0, err: 0, lx: f.x, stuck: 0, up: null, goal: null };
    const b = f.bot, i = f.in, L = SF_BOT[clamp((f.lvl || 3) - 1, 0, 4)];
    if (!f.alive || f.mode !== 'ctl') { i.l = i.r = i.j = i.a = i.b = i.u = i.d = 0; i.ang = null; return; }
    b.t -= dt;
    if (b.t <= 0) { b.t = L.rt * rr(.6, 1.3); sfBotThink(w, f); if (b.jmp && b.jh <= 0) { b.jh = .32; b.jgap = 0; } }
    if (b.jh > 0) { b.jh -= dt; }
    if (f.gnd && b.mx && b.reflex && b.jh <= 0) {
      if (!sfColumn(w, f.x + b.mx * 15, f.y)) {
        const jd = sfBotJumpable(w, f, b.mx);
        if (jd && Math.random() < Math.min(1, L.jmp + .3)) b.jh = .34;
        else if (!jd) { b.mx = 0; f.vx *= .5; }
      }
    }
    if (b.reflex) {
      for (const a of w.saws) {
        const ax = a.x - f.x;
        if (Math.abs(ax) < 105 && a.y + a.r > f.y - SF_HH - 6 && a.y - a.r < f.y + 4) {
          const low = a.y > f.y - 44;
          if (!f.gnd) { if (b.jdir) b.mx = b.jdir; }
          else if (low && Math.abs(ax) > 38 && Math.abs(ax) < 100 && b.jh <= 0 && Math.random() < L.jmp * .08 + .02) { b.jh = .34; b.jdir = sgn(ax); b.mx = b.jdir; }
          else if (b.jh <= 0) { b.mx = -sgn(ax) || 1; b.jdir = 0; }
        }
      }
    }
    if (f.gnd && f.gs && f.gs.f && f.gs.fs === 1 && b.jh <= 0 && b.reflex) {
      const pd = sgn((b.tx != null ? b.tx : 480) - f.x) || 1;
      const dd = sfBotJumpable(w, f, pd) ? pd : sfBotJumpable(w, f, -pd) ? -pd : 0;
      if (dd) { b.mx = dd; b.air = dd; b.jh = .34; }
    }
    if (f.gnd) { if (b.jh <= 0) b.air = 0; } else if (b.air) b.mx = b.air;
    b.stuck += Math.abs(f.x - b.lx) < .6 * dt * 60 && b.mx ? dt : -b.stuck;
    b.lx = f.x;
    if (b.stuck > .7) { b.stuck = 0; if (sfColumn(w, f.x + b.mx * 30, f.y) || sfBotJumpable(w, f, b.mx)) b.jh = .3; b.t = 0; }
    i.l = b.mx < 0 ? 1 : 0; i.r = b.mx > 0 ? 1 : 0;
    i.j = b.jh > .08 ? 1 : 0;
    i.b = b.blk ? 1 : 0;
    const S = f.wpn && SF_WP[f.wpn.k];
    if (S && !S.melee) {
      const tx = b.tx, ty = b.ty;
      if (tx != null) {
        const spd = S.spd || 600, t = clamp(b.dist / spd, 0, .8);
        const px = tx + (b.tvx || 0) * t * .6, py = ty - 8 + (b.tvy || 0) * t * .5 + (f.wpn.k === 'rocket' || f.wpn.k === 'snake' ? -b.dist * .05 : 0);
        const want = Math.atan2(py - f.p[3], px - f.p[2]) + b.err;
        b.aimA = angLerp(b.aimA, want, 1 - Math.exp(-dt * (4 + L.haz * 12)));
        i.ang = b.aimA;
        const diff = Math.abs(((want - b.aimA + Math.PI) % TAU + TAU) % TAU - Math.PI);
        i.a = b.fire && diff < .22 + L.err ? 1 : 0;
        if (f.wpn.k === 'minigun' && b.fire) i.a = diff < .5 ? 1 : 0;
      } else { i.ang = null; i.a = 0; }
    } else {
      i.ang = null;
      i.a = b.fire ? 1 : 0;
      if (S && S.melee && b.fire && b.dist < 80) i.a = 1;
    }
    i.x = 0; i.u = 0; i.d = 0;
  }

  const sfBgCache = {};
  function sfBg(mi) {
    if (sfBgCache[mi]) return sfBgCache[mi];
    const m = SF_MAPS[mi], c = document.createElement('canvas');
    c.width = SF_W; c.height = SF_H;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, SF_H);
    gr.addColorStop(0, m.bg[0]); gr.addColorStop(1, m.bg[1]);
    g.fillStyle = gr; g.fillRect(0, 0, SF_W, SF_H);
    let sd = mi * 7919 + 13;
    const rn = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    g.fillStyle = 'rgba(255,255,255,.16)';
    for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(rn() * SF_W, rn() * SF_H * .8, 40 + rn() * 110, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.06)';
    for (let i = 0; i < 5; i++) { const w = 80 + rn() * 220, h = 120 + rn() * 300; g.fillRect(rn() * (SF_W - w), SF_H - h, w, h); }
    g.fillStyle = 'rgba(255,255,255,.08)';
    for (let x = 0; x < SF_W; x += 48) g.fillRect(x, 0, 2, SF_H);
    for (let y = 0; y < SF_H; y += 48) g.fillRect(0, y, SF_W, 2);
    return sfBgCache[mi] = c;
  }

  function sfGun(g, k, t, spin) {
    const D = '#26262e', M = '#4a4a56', L = '#8b8b99';
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    if (k === 'pistol') { r(-3, -3, 12, 5, D); r(9, -2.5, 6, 3.5, M); r(-2, 1, 4, 7, D); }
    else if (k === 'uzi') { r(-4, -3.5, 15, 6, D); r(11, -2, 6, 3, M); r(-1, 2, 4, 9, M); r(5, 2, 3, 3, D); }
    else if (k === 'shotgun') { r(-8, -2, 10, 5, '#6b4423'); r(2, -3, 14, 5, D); r(14, -2.5, 12, 3.5, M); r(8, 1, 7, 3, '#6b4423'); }
    else if (k === 'sniper') { r(-9, -2, 11, 5, '#3c4a3c'); r(2, -3, 18, 4, D); r(20, -2.2, 18, 2.8, M); r(8, -7, 11, 3.5, M); r(6, -5, 2, 3, D); r(18, -5, 2, 3, D); }
    else if (k === 'minigun') { r(-6, -5, 10, 11, D); r(4, -4, 22, 8, M); g.fillStyle = L; for (let i = 0; i < 3; i++) { const yy = -3 + ((i * 3 + (spin || 0) * 9) % 8); g.fillRect(4, yy, 24, 1.6); } r(26, -4, 3, 8, D); r(-3, 5, 7, 7, '#6b4423'); }
    else if (k === 'sword') { r(-6, -1.6, 7, 3.2, '#6b4423'); r(0, -5.5, 3, 11, '#c9a227'); g.fillStyle = '#e5e7eb'; g.beginPath(); g.moveTo(3, -2.4); g.lineTo(38, -1.2); g.lineTo(44, 0); g.lineTo(38, 1.2); g.lineTo(3, 2.4); g.closePath(); g.fill(); r(4, -.4, 34, .9, '#9ca3af'); }
    else if (k === 'snake') { r(-5, -3, 12, 6, '#2f6b2f'); r(7, -3.5, 10, 7, '#3f9b3f'); g.fillStyle = '#7ee07e'; g.beginPath(); g.arc(19, 0, 4.5, 0, TAU); g.fill(); r(20, -2, 2.2, 1.6, '#111'); g.fillStyle = '#e11'; g.fillRect(23, -.4, 4, .9); r(-2, 2, 4, 6, '#26262e'); }
    else if (k === 'rocket') { r(-10, -5, 36, 10, '#5b6b3a'); r(-12, -6, 4, 12, D); r(26, -6, 4, 12, D); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(30, -4); g.lineTo(38, 0); g.lineTo(30, 4); g.fill(); r(4, 4, 5, 7, D); r(8, -8, 8, 3, M); }
  }

  function sfDrawGun(g, k, x, y, a, fl, spin) {
    g.save(); g.translate(x, y); g.rotate(a);
    if (Math.cos(a) < 0) g.scale(1, -1);
    sfGun(g, k, fl, spin);
    g.restore();
  }

  function sfDrawFighter(g, f, S) {
    const p = f.p, col = SF_COL[f.slot % 4];
    if (f.inv > 0 && Math.floor(f.t * 14) % 2 === 0 && f.alive) return;
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    const segs = [[2, 1, 7], [1, 2, 7.5], [1, 3, 5.4], [3, 4, 5], [1, 5, 5.4], [5, 6, 5], [2, 7, 5.8], [7, 8, 5.4], [2, 9, 5.8], [9, 10, 5.4]];
    const order = f.face > 0 ? [2, 3, 4, 6, 7, 8, 0, 1, 5, 9] : [2, 5, 6, 8, 9, 7, 0, 1, 3, 4];
    const draw = (c, extra) => {
      g.strokeStyle = c;
      for (const k of order) {
        const s = segs[k];
        if (k === 1 && 0) continue;
        g.lineWidth = s[2] + extra;
        g.beginPath(); g.moveTo(p[s[0] * 2], p[s[0] * 2 + 1]); g.lineTo(p[s[1] * 2], p[s[1] * 2 + 1]); g.stroke();
      }
      g.lineWidth = extra * 2 + .1;
      g.fillStyle = c;
      g.beginPath(); g.arc(p[0], p[1], 8 + extra, 0, TAU); g.fill();
    };
    const dead = !f.alive;
    draw(dead ? '#2b1010' : col.d, 2.2);
    draw(col.c, 0);
    if (!dead) {
      g.fillStyle = 'rgba(255,255,255,.28)';
      g.beginPath(); g.arc(p[0] - 2.4, p[1] - 2.6, 2.6, 0, TAU); g.fill();
    }
    if (f.wpn) {
      const sp = SF_WP[f.wpn.k];
      if (f.alive || f.mode === 'rag') sfDrawGun(g, f.wpn.k, p[12], p[13], f.wa, f.t, f.spin ? f.t * 9 : 0);
    }
    if (f.blk > 0 && f.alive) {
      g.globalAlpha = .55; g.strokeStyle = '#fff'; g.lineWidth = 3;
      g.beginPath(); const cx = p[2], cy = p[3] + 3;
      g.arc(cx, cy, 24, f.face > 0 ? -1.1 : Math.PI - 1.1 + 0, f.face > 0 ? 1.1 : Math.PI + 1.1, false);
      g.stroke();
      g.globalAlpha = .18; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 24, 0, TAU); g.fill();
    }
    g.restore();
  }

  function sfDrawBelt(g, s, t) {
    g.save(); g.beginPath(); g.rect(s.x, s.y, s.w, s.h); g.clip();
    g.strokeStyle = '#f5c518'; g.lineWidth = 2;
    const off = ((t * s.belt * .5) % 16 + 16) % 16;
    for (let x = s.x - 16 + off; x < s.x + s.w + 16; x += 16) { g.beginPath(); g.moveTo(x, s.y + 1); g.lineTo(x + 5 * sgn(s.belt), s.y + s.h / 2); g.lineTo(x, s.y + s.h - 1); g.stroke(); }
    g.restore();
  }

  function sfDrawWorld(g, S, fx, opt) {
    const t = S.t, m = S.map;
    g.save();
    g.drawImage(sfBg(S.mi), 0, 0);
    if (S.shake > 0.3 && !(opt && opt.noShake)) g.translate(rr(-S.shake, S.shake) * .5, rr(-S.shake, S.shake) * .5);
    if (fx.decal) g.drawImage(fx.decal, 0, 0, SF_W, SF_H);
    const lv = (x, y, w, h) => {
      const gr = g.createLinearGradient(0, y, 0, y + Math.min(h, 80));
      gr.addColorStop(0, '#ffd23f'); gr.addColorStop(.25, '#ff8a1f'); gr.addColorStop(1, '#c2290d');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, y + 8);
      for (let px = 0; px <= w; px += 12) g.lineTo(x + px, y + 3 + Math.sin(t * 2.4 + (x + px) * .06) * 3 + Math.sin(t * 5 + (x + px) * .17) * 1.5);
      g.lineTo(x + w, y + h + 40); g.lineTo(x, y + h + 40); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,240,150,.45)';
      for (let i = 0; i < w / 60; i++) { const bx = x + ((i * 61 + t * 14) % w), by = y + 14 + (i * 13) % 20; g.beginPath(); g.arc(bx, by, 3 + (i % 3), 0, TAU); g.fill(); }
    };
    for (const l of S.lava) lv(l.x, l.y, l.w, l.h);
    if (S.rl < SF_H + 30) lv(0, S.rl, SF_W, SF_H - S.rl + 60);
    for (const s of S.solids) {
      if (s.fs === 3 || s.wall) continue;
      const sx = s.x + (s.sh || 0), sy = s.y;
      if (s.k) {
        g.strokeStyle = '#2d2a38'; g.lineWidth = 10; g.beginPath(); g.moveTo(s.x + s.w / 2, -40); g.lineTo(s.x + s.w / 2, s.y); g.stroke();
      }
      g.fillStyle = s.f ? '#2a2535' : '#15131c';
      g.fillRect(sx, sy, s.w, s.h);
      g.fillStyle = s.sp ? '#e0b01c' : s.f ? '#4a4258' : '#2e2a3a';
      g.fillRect(sx, sy, s.w, Math.min(5, s.h));
      if (s.sp) { g.fillStyle = '#111'; for (let x = sx + 4; x < sx + s.w - 6; x += 10) g.fillRect(x, sy + 1, 5, 3); }
      if (s.k) { g.save(); g.beginPath(); g.rect(sx, sy + s.h - 14, s.w, 14); g.clip(); g.fillStyle = '#f5c518'; g.fillRect(sx, sy + s.h - 14, s.w, 14); g.fillStyle = '#111'; for (let x = sx - 14; x < sx + s.w + 14; x += 18) { g.beginPath(); g.moveTo(x, sy + s.h); g.lineTo(x + 9, sy + s.h); g.lineTo(x + 23, sy + s.h - 14); g.lineTo(x + 14, sy + s.h - 14); g.fill(); } g.restore(); }
      if (s.belt) sfDrawBelt(g, s, t);
      if (s.m || s.o) { g.fillStyle = '#f5c518'; g.fillRect(sx + 4, sy + s.h - 3, 6, 2); g.fillRect(sx + s.w - 10, sy + s.h - 3, 6, 2); }
    }
    for (const sp of S.spikes) {
      g.fillStyle = '#cfd3dc'; g.strokeStyle = '#4b4f5c'; g.lineWidth = 1.2;
      const n = Math.max(1, Math.round(sp.w / 14)), w = sp.w / n;
      for (let i = 0; i < n; i++) {
        g.beginPath();
        if (sp.d === 'd') { g.moveTo(sp.x + i * w, sp.y); g.lineTo(sp.x + (i + 1) * w, sp.y); g.lineTo(sp.x + (i + .5) * w, sp.y + sp.h); }
        else { g.moveTo(sp.x + i * w, sp.y + sp.h); g.lineTo(sp.x + (i + 1) * w, sp.y + sp.h); g.lineTo(sp.x + (i + .5) * w, sp.y); }
        g.closePath(); g.fill(); g.stroke();
      }
    }
    for (const a of S.saws) {
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(a.ax, a.ay); g.lineTo(a.bx, a.by); g.stroke();
      g.save(); g.translate(a.x, a.y); g.rotate(a.rot);
      g.fillStyle = '#dfe3ea'; g.strokeStyle = '#4b4f5c'; g.lineWidth = 1.5;
      g.beginPath();
      const n = 14;
      for (let i = 0; i < n * 2; i++) { const r = i % 2 ? a.r - 6 : a.r + 2, an = i / (n * 2) * TAU; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#9aa0ad'; g.beginPath(); g.arc(0, 0, a.r * .5, 0, TAU); g.fill();
      g.fillStyle = '#3b3f4a'; g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.fill();
      g.restore();
    }
    for (const c of S.crates) {
      g.save(); g.translate(c.x, c.y);
      if (c.st === 0) {
        g.rotate(c.sw || 0);
        g.strokeStyle = '#555'; g.lineWidth = 1;
        g.fillStyle = '#ef4444'; g.beginPath(); g.moveTo(-26, -34); g.quadraticCurveTo(0, -62, 26, -34); g.closePath(); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-9, -34); g.quadraticCurveTo(0, -60, 9, -34); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(-26, -34); g.lineTo(-10, -10); g.moveTo(26, -34); g.lineTo(10, -10); g.moveTo(0, -34); g.lineTo(0, -10); g.stroke();
      }
      const sh = c.st === 1 ? Math.sin(c.t * 90) * 1.5 : 0;
      g.translate(sh, 0);
      g.fillStyle = '#c98b3f'; g.fillRect(-12, -12, 24, 24);
      g.strokeStyle = '#7a4e17'; g.lineWidth = 2; g.strokeRect(-12, -12, 24, 24);
      g.beginPath(); g.moveTo(-12, -12); g.lineTo(12, 12); g.moveTo(12, -12); g.lineTo(-12, 12); g.stroke();
      g.restore();
    }
    for (const e of S.weapons) {
      const bob = Math.sin(t * 4 + e.id) * 2;
      if (e.onG) {
        g.save(); g.globalAlpha = .5 + .3 * Math.sin(t * 5 + e.id);
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.ellipse(e.x, e.y - 2, 26, 7, 0, 0, TAU); g.stroke();
        g.restore();
      }
      g.save(); g.translate(e.x, e.y - (e.onG ? 8 + bob : 0));
      if (e.onG) { g.scale(.95, .95); sfDrawGun(g, e.k, -8, 0, 0, 0, 0); }
      else { g.rotate(e.rot); sfGun(g, e.k, 0, 0); }
      g.restore();
    }
    for (const f of S.fighters) if (!f.alive) sfDrawFighter(g, f, S);
    for (const f of S.fighters) if (f.alive) sfDrawFighter(g, f, S);
    for (const sn of S.snakes) {
      g.save(); g.strokeStyle = '#3aa63a'; g.lineWidth = 4.5; g.lineCap = 'round';
      g.beginPath();
      for (let i = 0; i <= 8; i++) { const px = sn.x - sn.dir * i * 2.8, py = sn.y - 4 + (sn.air ? i * 1 : Math.sin(sn.ph + i * .9) * 2.6 * (i / 8 + .3)); if (i) g.lineTo(px, py); else g.moveTo(px, py); }
      g.stroke();
      g.fillStyle = '#2e8a2e'; g.beginPath(); g.arc(sn.x + sn.dir * 1.5, sn.y - 4, 3.6, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.fillRect(sn.x + sn.dir * 2.5 - 1, sn.y - 6, 1.6, 1.6);
      g.restore();
    }
    for (const b of S.bullets) {
      g.save();
      if (b.k === 'rk') {
        const a = Math.atan2(b.vy, b.vx); g.translate(b.x, b.y); g.rotate(a);
        g.fillStyle = '#c0392b'; g.fillRect(-9, -3, 14, 6); g.fillStyle = '#e5e7eb'; g.beginPath(); g.moveTo(5, -3); g.lineTo(11, 0); g.lineTo(5, 3); g.fill();
        g.fillStyle = '#ffb21f'; g.beginPath(); g.moveTo(-9, -2.5); g.lineTo(-18 - Math.random() * 6, 0); g.lineTo(-9, 2.5); g.fill();
      } else {
        const m2 = Math.hypot(b.vx, b.vy) || 1, len = b.k === 'sn' ? 34 : 9;
        g.strokeStyle = b.k === 'sn' ? '#fff7b0' : '#ffe27a'; g.lineWidth = b.k === 'sn' ? 2.4 : 2.2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(b.x - b.vx / m2 * len, b.y - b.vy / m2 * len); g.lineTo(b.x, b.y); g.stroke();
      }
      g.restore();
    }
    sfDrawFx(g, fx);
    for (const f of S.fighters) {
      if (!f.alive) continue;
      const x = f.p[0], y = f.p[1] - 20;
      if (f.hp < 100 || S.showHp) {
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x - 15, y, 30, 4);
        g.fillStyle = f.hp > 50 ? '#3fd163' : f.hp > 25 ? '#f5c518' : '#ef4444';
        g.fillRect(x - 15, y, 30 * clamp(f.hp / 100, 0, 1), 4);
        if (f.blk > 0 || f.bm < .99) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x - 15, y + 5, 30 * f.bm, 2); }
      }
      if (S.names) {
        g.font = '700 11px system-ui,sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.65)';
        g.fillText(f.name, x, y - 4);
      }
      if (f.wpn && SF_WP[f.wpn.k].ammo && f.wpn.ammo <= 3 && f.wpn.k !== 'minigun') { g.fillStyle = '#111'; g.font = '800 10px system-ui'; g.fillText('x' + f.wpn.ammo, x, y + 16); }
    }
    g.restore();
  }

  function sfFxNew() { return { parts: [], decal: null, dctx: null, flash: [] }; }
  function sfFxReset(fx) {
    fx.parts.length = 0;
    if (!fx.decal) { fx.decal = document.createElement('canvas'); fx.decal.width = SF_W; fx.decal.height = SF_H; fx.dctx = fx.decal.getContext('2d'); }
    fx.dctx.clearRect(0, 0, SF_W, SF_H);
  }
  function sfPart(fx, o) { if (fx.parts.length < 700) fx.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: .5, max: .5, r: 2, c: '#fff', k: 'c', d: 1 }, o)); }

  function sfFxStep(fx, w, dt) {
    const P = fx.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.life -= dt;
      if (p.life <= 0) { P.splice(i, 1); continue; }
      p.vy += p.g * dt; p.vx *= Math.pow(p.d, dt * 60); p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 'blood' && w) {
        for (const s of w.solids) {
          if (s.fs === 3 || s.wall) continue;
          if (p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h) {
            if (fx.dctx) { fx.dctx.fillStyle = p.c; fx.dctx.globalAlpha = .7; fx.dctx.beginPath(); fx.dctx.arc(p.x, p.y, p.r * rr(.8, 1.6), 0, TAU); fx.dctx.fill(); fx.dctx.globalAlpha = 1; }
            p.life = 0; break;
          }
        }
      } else if (p.k === 'shell' && w) {
        for (const s of w.solids) { if (s.fs !== 3 && p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + 6 && p.vy > 0) { p.vy *= -.4; p.vx *= .6; p.y = s.y - 1; } }
      }
    }
  }

  function sfDrawFx(g, fx) {
    for (const p of fx.parts) {
      const a = clamp(p.life / p.max, 0, 1);
      g.save();
      if (p.k === 'spark') { g.globalAlpha = a; g.strokeStyle = p.c; g.lineWidth = 1.6; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * .02, p.y - p.vy * .02); g.stroke(); }
      else if (p.k === 'blood') { g.globalAlpha = Math.min(1, a * 2); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); }
      else if (p.k === 'smoke') { g.globalAlpha = a * .5; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r * (2 - a), 0, TAU); g.fill(); }
      else if (p.k === 'fire') { g.globalAlpha = a; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r * a + 1, 0, TAU); g.fill(); }
      else if (p.k === 'shell') { g.globalAlpha = Math.min(1, a * 3); g.translate(p.x, p.y); g.rotate(p.life * 20); g.fillStyle = '#d4a017'; g.fillRect(-2, -1, 4, 2); }
      else if (p.k === 'flash') { g.globalAlpha = a; g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = '#fff3a0'; g.beginPath(); g.moveTo(0, -4 * p.r); g.lineTo(14 * p.r, 0); g.lineTo(0, 4 * p.r); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 4 * p.r, 0, TAU); g.fill(); }
      else if (p.k === 'ring') { g.globalAlpha = a * .8; g.strokeStyle = p.c; g.lineWidth = 4 * a + 1; g.beginPath(); g.arc(p.x, p.y, p.r * (1 - a) * 1 + 6, 0, TAU); g.stroke(); }
      else if (p.k === 'glow') { g.globalAlpha = a * .7; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1.4 - a * .4)); gr.addColorStop(0, p.c); gr.addColorStop(1, 'rgba(255,160,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 1.4, 0, TAU); g.fill(); }
      else if (p.k === 'text') { g.globalAlpha = Math.min(1, a * 2); g.font = '900 14px system-ui,sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(p.t, p.x, p.y); g.fillStyle = p.c; g.fillText(p.t, p.x, p.y); }
      else if (p.k === 'dust') { g.globalAlpha = a * .5; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r * (1.6 - a * .6), 0, TAU); g.fill(); }
      g.restore();
    }
  }

  const SF_FONT = "system-ui,'Segoe UI',Roboto,sans-serif";
  const SF_PH = ['menu', 'count', 'play', 'end', 'score', 'over'];
  const SF_KM = {
    l: ['KeyA', 'ArrowLeft'], r: ['KeyD', 'ArrowRight'], u: ['KeyW', 'ArrowUp'], d: ['KeyS', 'ArrowDown'],
    j: ['Space', 'KeyW', 'ArrowUp'], a: ['KeyJ', 'KeyZ', 'Enter', 'KeyF'], b: ['KeyK', 'ShiftLeft', 'ShiftRight', 'KeyX', 'KeyQ'], x: ['KeyL', 'KeyC', 'KeyG', 'KeyE']
  };
  const SF_BITS = ['l', 'r', 'u', 'd', 'j', 'a', 'b', 'x'];
  const SF_BOTNAMES = ['Rex', 'Pip', 'Moe', 'Zed', 'Kit', 'Bud'];
  const SF_LVL = SF_BOT.map(b => b.n);
  const SF_VERB = { lava: 'burned up', saw: 'was sliced', spike: 'was impaled', crush: 'was crushed', void: 'fell out', bullet: 'was shot', blast: 'was blown up', punch: 'was punched', sword: 'was slashed', snake: 'was bitten' };

  function sfText(g, s, x, y, size, col, align, stroke, wt) {
    g.font = `${wt || 900} ${size}px ${SF_FONT}`; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    if (stroke) { g.lineWidth = Math.max(3, size * .16); g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
    g.fillStyle = col; g.fillText(s, x, y);
  }
  function sfRound(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  function sfIconFighter(slot, x, y, o) {
    const f = sfNewF({ slot, name: '', kind: 'bot' }, [x, y]);
    f.inv = 0; f.face = o && o.face || 1;
    if (o && o.wpn) { f.wpn = { k: o.wpn, ammo: 5 }; f.wa = o.a || 0; }
    if (o && o.ph != null) f.ph = o.ph;
    if (o && o.vx) f.vx = o.vx;
    const T = new Array(22).fill(0);
    if (o && o.air) { f.gnd = false; f.vy = o.air; }
    if (o && o.blk) f.blk = 1;
    if (o && o.atk) { f.atkT = .13; f.wpn = null; }
    sfPose(f, T);
    for (let i = 0; i < 22; i++) f.p[i] = T[i];
    return f;
  }

  function sfThumb(c, mi) {
    const w = sfNewWorld(mi, [], {}), g = c.getContext('2d'), k = c.width / SF_W;
    g.setTransform(k, 0, 0, k, 0, 0);
    sfDrawWorld(g, w, { parts: [], decal: null }, { noShake: true });
  }

  function sfMount(root, api) {
    const touchDev = isTouchDev();
    if (touchDev) root.classList.add('touch');
    api.on(window, 'pointerdown', e => { if (e.pointerType === 'touch') root.classList.add('touch'); });
    const saved = Object.assign({ bots: 3, lvl: 3, wins: 3, map: -1, drops: 1, sd: 1, mode: 'bots' }, api.load() || {});
    if (saved.mode !== 'online') saved.mode = 'bots';
    const wrap = document.createElement('div');
    wrap.className = 'sf-wrap';
    root.append(wrap);
    const C = api.canvas(SF_W, SF_H, wrap);
    const cv = C.canvas, g = C.ctx;
    cv.style.width = '100%';
    const ui = document.createElement('div');
    ui.className = 'sf-ui';
    wrap.append(ui);
    const mb = document.createElement('button');
    mb.className = 'sf-mb'; mb.type = 'button'; mb.hidden = true; mb.setAttribute('aria-label', 'Menu');
    mb.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
    wrap.append(mb);
    const aud = makeAudio(api);
    const keys = makeKeys(api, SF_KM);
    const th = { l: 0, r: 0, u: 0, d: 0, j: 0, a: 0, b: 0, x: 0 };
    const tAim = { x: 0, y: 0, m: 0 };
    const mouse = { x: 480, y: 270, t: -1e9, l: 0, r: 0 };
    const G = {
      role: null, ph: 'menu', w: null, fx: sfFxNew(), acc: 0, pt: 0, slow: 1, players: [], scores: [], wins: 3, rn: 0, mi: 0, lastMi: -1, winner: -1, me: 0,
      feed: [], rin: {}, pids: [], paused: false, buf: [], off: 0, offSet: false, seq: 0, lastSend: 0, lastIn: -1, lastAng: 0, inSeq: 0, hooked: false, names: [], kinds: [],
      focus: [480, 270], endT: 0, overShown: false, stk: 0, t0: 0, hostId: null, size: 4, bots: false, tstat: '', mode: saved.mode, demoT: 0, submitted: false, ovh: null, pend: null, score0: 0
    };
    sfFxReset(G.fx);
    let tbEl = null;

    const snd = {
      hit: (big, type) => { if (type === 'bullet') { aud.noise(.06, .4, 3000, 600); aud.tone(220, 90, .08, 'triangle', .3); } else if (type === 'sword') { aud.tone(900, 300, .12, 'sawtooth', .2); aud.noise(.12, .4, 2500, 300); } else { aud.noise(.08, .5, 1800, 300); aud.tone(150, 60, .1, 'sine', .5); } if (big) aud.tone(90, 40, .22, 'sine', .6); },
      shot: k => {
        if (k === 'pistol') { aud.noise(.09, .55, 4000, 500); aud.tone(260, 60, .1, 'square', .2); }
        else if (k === 'uzi') { if (aud.gate('uzi', 45)) { aud.noise(.05, .4, 5000, 900); aud.tone(300, 90, .05, 'square', .12); } }
        else if (k === 'shotgun') { aud.noise(.28, .8, 3000, 200); aud.tone(120, 40, .25, 'sawtooth', .4); }
        else if (k === 'sniper') { aud.noise(.5, .8, 5000, 150); aud.tone(160, 30, .4, 'sawtooth', .45); aud.tone(1800, 400, .1, 'square', .2); }
        else if (k === 'minigun') { if (aud.gate('mg', 38)) { aud.noise(.04, .35, 4500, 800); aud.tone(200, 100, .04, 'square', .1); } }
        else if (k === 'rocket') { aud.noise(.4, .5, 1200, 200); aud.tone(90, 50, .3, 'sawtooth', .3); }
        else if (k === 'snake') { aud.tone(700, 300, .2, 'sine', .2); aud.noise(.3, .15, 6000, 3000, 0, 2, 'highpass'); }
      },
      boom: () => { aud.noise(1.1, .9, 1800, 60); aud.tone(95, 30, .7, 'sine', .7); aud.noise(.25, .35, 6000, 900, 0, .8, 'bandpass'); },
      die: () => { aud.tone(300, 60, .35, 'sawtooth', .25); aud.noise(.3, .3, 1200, 200); },
      burn: () => { aud.noise(.8, .25, 3000, 400); aud.tone(500, 200, .3, 'sawtooth', .1); },
      gore: () => { if (aud.gate('gore', 60)) aud.noise(.15, .3, 900, 150); },
      pick: () => { aud.tone(1200, 1200, .04, 'square', .08); aud.tone(1800, 1800, .06, 'square', .06, .05); },
      jump: () => { if (aud.gate('jump', 60)) aud.tone(260, 520, .08, 'sine', .08); },
      land: () => { if (aud.gate('land', 60)) { aud.tone(120, 50, .08, 'sine', .2); aud.noise(.06, .12, 900, 200); } },
      block: () => { aud.tone(1500, 900, .06, 'square', .15); aud.noise(.05, .25, 5000, 2000); },
      guard: () => aud.tone(300, 100, .3, 'sawtooth', .25),
      crumble: () => { if (aud.gate('crumble', 80)) aud.noise(.4, .4, 900, 150); },
      crate: () => { aud.tone(140, 70, .1, 'sine', .3); aud.noise(.1, .2, 1500, 300); },
      open: () => aud.tone(500, 900, .1, 'triangle', .12),
      click: () => { if (aud.gate('click', 120)) aud.tone(900, 900, .02, 'square', .06); },
      spring: () => aud.tone(200, 700, .2, 'sine', .2),
      bite: () => aud.tone(800, 400, .05, 'square', .12),
      rag: () => { if (aud.gate('rag', 90)) aud.noise(.1, .15, 700, 150); },
      whoosh: () => { if (aud.gate('wh', 60)) aud.noise(.1, .14, 600, 1800, 0, 1, 'bandpass'); },
      swing: () => aud.noise(.18, .3, 800, 3000, 0, 1.5, 'bandpass'),
      beep: n => aud.tone(n ? 880 : 520, n ? 880 : 520, n ? .28 : .12, 'square', .1),
      win: () => { [523, 659, 784, 1047].forEach((f, i) => aud.tone(f, f, .22, 'triangle', .2, i * .11)); },
      lose: () => { [392, 330, 262].forEach((f, i) => aud.tone(f, f * .96, .26, 'triangle', .18, i * .16)); },
      tick: () => aud.tone(660, 990, .1, 'triangle', .16)
    };

    function nearest(x, y) {
      const W = G.w; if (!W) return 0;
      let b = 0, bd = 1e12;
      for (const f of W.fighters) { const d = (f.p[4] - x) ** 2 + (f.p[5] - y) ** 2 + (f.p[0] - x) ** 2 * .5; if (d < bd) { bd = d; b = f.slot; } }
      return b;
    }
    function blood(x, y, n, col, spd, up) {
      for (let i = 0; i < n; i++) {
        const a = rr(0, TAU), s = rr(.2, 1) * spd;
        sfPart(G.fx, { k: 'blood', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - up, g: 1400, life: rr(.5, 1.1), max: 1, r: rr(1.3, 3.2), c: col, d: .985 });
      }
    }
    function fxEvent(e) {
      const fx = G.fx, k = e[0], live = G.ph !== 'menu';
      const S = (n) => { if (live) snd[n] && snd[n](e[3], e[4]); };
      switch (k) {
        case 'hit': {
          const x = e[1], y = e[2], big = e[3], type = e[4], col = SF_COL[nearest(x, y)].c;
          if (live) snd.hit(big, type);
          if (type === 'bullet') for (let i = 0; i < 5; i++) { const a = rr(0, TAU); sfPart(fx, { k: 'spark', x, y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: .18, max: .18, c: '#ffd23f' }); }
          blood(x, y, big ? 18 : 9, col, big ? 330 : 210, 60);
          sfPart(fx, { k: 'ring', x, y, life: .22, max: .22, r: big ? 36 : 22, c: '#fff' });
          break;
        }
        case 'shot': {
          const x = e[1], y = e[2], a = e[3], wk = e[4];
          if (live) snd.shot(wk);
          if (wk !== 'snake') {
            sfPart(fx, { k: 'flash', x, y, a, life: .06, max: .06, r: wk === 'shotgun' || wk === 'rocket' || wk === 'sniper' ? 1.8 : 1 });
            sfPart(fx, { k: 'smoke', x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 20, life: .5, max: .5, r: 5, c: '#999', d: .96 });
            if (wk !== 'rocket') sfPart(fx, { k: 'shell', x: x - Math.cos(a) * 14, y: y - Math.sin(a) * 14, vx: -Math.cos(a) * 60 + rr(-40, 40), vy: -rr(120, 220), g: 1500, life: .8, max: .8 });
          }
          break;
        }
        case 'boom': {
          const x = e[1], y = e[2];
          if (live) snd.boom();
          sfPart(fx, { k: 'glow', x, y, life: .5, max: .5, r: 120, c: '#fff1a8' });
          sfPart(fx, { k: 'ring', x, y, life: .45, max: .45, r: 130, c: '#ffb21f' });
          for (let i = 0; i < 34; i++) { const a = rr(0, TAU), s = rr(40, 420); sfPart(fx, { k: 'fire', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rr(.3, .8), max: .8, r: rr(4, 12), c: pick(['#ff7a1a', '#ffb21f', '#ffd23f', '#e8421a']), d: .93 }); }
          for (let i = 0; i < 16; i++) { const a = rr(0, TAU), s = rr(20, 160); sfPart(fx, { k: 'smoke', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: rr(.8, 1.6), max: 1.6, r: rr(10, 20), c: '#777', d: .95 }); }
          break;
        }
        case 'gore': { const x = e[1], y = e[2], col = SF_COL[nearest(x, y)].c; if (live) snd.gore(); blood(x, y, e[3], col, 420, 160); break; }
        case 'burn': {
          const x = e[1], y = e[2];
          if (live) snd.burn();
          for (let i = 0; i < 22; i++) sfPart(fx, { k: 'fire', x: x + rr(-14, 14), y, vx: rr(-60, 60), vy: -rr(80, 320), g: 200, life: rr(.4, .9), max: .9, r: rr(4, 10), c: pick(['#ff7a1a', '#ffb21f', '#ffd23f']), d: .97 });
          for (let i = 0; i < 8; i++) sfPart(fx, { k: 'smoke', x: x + rr(-10, 10), y, vx: rr(-30, 30), vy: -rr(40, 120), life: rr(.8, 1.4), max: 1.4, r: rr(8, 14), c: '#555', d: .97 });
          break;
        }
        case 'die': {
          const slot = e[3], cause = e[4], W = G.w;
          if (live) snd.die();
          const nm = W && W.fighters[slot] ? W.fighters[slot].name : '';
          if (live && nm) { G.feed.push({ t: performance.now(), s: `${nm} ${SF_VERB[cause] || 'died'}`, c: SF_COL[slot].c }); if (G.feed.length > 4) G.feed.shift(); }
          break;
        }
        case 'pick': if (live) snd.pick(); sfPart(fx, { k: 'text', x: e[1], y: e[2] - 16, vy: -50, life: 1, max: 1, c: '#fff', t: SF_WP[e[3]].n.toUpperCase() }); break;
        case 'jump': case 'wjump': if (live) snd.jump(); for (let i = 0; i < 4; i++) sfPart(fx, { k: 'dust', x: e[1] + rr(-6, 6), y: e[2], vx: rr(-50, 50), vy: -rr(5, 40), life: .35, max: .35, r: rr(3, 6), c: '#d9d2c3', d: .95 }); break;
        case 'land': if (live) snd.land(); for (let i = 0; i < 6; i++) sfPart(fx, { k: 'dust', x: e[1] + rr(-8, 8), y: e[2], vx: rr(-90, 90), vy: -rr(5, 40), life: .4, max: .4, r: rr(3, 7), c: '#d9d2c3', d: .94 }); break;
        case 'block': {
          if (live) snd.block();
          for (let i = 0; i < 6; i++) { const a = rr(-1.4, 1.4) + (e[3] > 0 ? 0 : Math.PI); sfPart(fx, { k: 'spark', x: e[1], y: e[2], vx: Math.cos(a) * 280, vy: Math.sin(a) * 280, life: .2, max: .2, c: '#fff' }); }
          break;
        }
        case 'guard': if (live) snd.guard(); sfPart(fx, { k: 'ring', x: e[1], y: e[2], life: .4, max: .4, r: 50, c: '#fff' }); break;
        case 'crumble': if (live) snd.crumble(); for (let i = 0; i < 10; i++) sfPart(fx, { k: 'dust', x: e[1] + rr(-40, 40), y: e[2] + rr(0, 10), vx: rr(-60, 60), vy: rr(0, 60), life: .6, max: .6, r: rr(3, 7), c: '#b9b1a2', d: .96 }); break;
        case 'crate': if (live) snd.crate(); for (let i = 0; i < 6; i++) sfPart(fx, { k: 'dust', x: e[1] + rr(-10, 10), y: e[2], vx: rr(-100, 100), vy: -rr(5, 60), life: .4, max: .4, r: rr(3, 6), c: '#d9d2c3', d: .94 }); break;
        case 'open': if (live) snd.open(); for (let i = 0; i < 12; i++) { const a = rr(0, TAU); sfPart(fx, { k: 'spark', x: e[1], y: e[2], vx: Math.cos(a) * 220, vy: Math.sin(a) * 220 - 80, life: .35, max: .35, c: '#ffe27a' }); } break;
        case 'smoke': sfPart(fx, { k: 'smoke', x: e[1], y: e[2], vx: rr(-15, 15), vy: rr(-15, 15), life: .6, max: .6, r: rr(4, 8), c: '#888', d: .95 }); break;
        case 'spark': for (let i = 0; i < 4; i++) { const a = e[3] + rr(-.9, .9); sfPart(fx, { k: 'spark', x: e[1], y: e[2], vx: Math.cos(a) * rr(100, 320), vy: Math.sin(a) * rr(100, 320), g: 600, life: .22, max: .22, c: '#ffd23f' }); } break;
        case 'bite': if (live) snd.bite(); blood(e[1], e[2], 5, '#3aa63a', 200, 60); break;
        case 'whoosh': if (live) snd.whoosh(); break;
        case 'swing': if (live) snd.swing(); break;
        case 'click': if (live) snd.click(); break;
        case 'spring': if (live) snd.spring(); break;
        case 'rag': if (live) snd.rag(); break;
      }
    }

    function readLocal(f) {
      const i = f.in, h = keys.h;
      i.l = h('l') || th.l ? 1 : 0; i.r = h('r') || th.r ? 1 : 0; i.u = h('u') || th.u ? 1 : 0; i.d = h('d') || th.d ? 1 : 0;
      i.j = h('j') || th.j ? 1 : 0;
      i.a = h('a') || th.a || mouse.l ? 1 : 0; i.b = h('b') || th.b || mouse.r ? 1 : 0; i.x = h('x') || th.x ? 1 : 0;
      i.ang = null;
      const S = f.wpn && SF_WP[f.wpn.k];
      if (tAim.m > .25) { i.ang = Math.atan2(tAim.y, tAim.x); if (tAim.m > .6) i.a = 1; }
      else if (S && performance.now() - mouse.t < 3000 && !root.classList.contains('touch')) i.ang = Math.atan2(mouse.y - f.p[3], mouse.x - f.p[2]);
      if (i.ang != null && S && S.melee && !tAim.m) i.ang = null;
    }
    function localBits(f) {
      readLocal(f);
      let b = 0; SF_BITS.forEach((k, n) => { if (f.in[k]) b |= 1 << n; });
      return b;
    }
    function applyNet(f) {
      const r = G.rin[f.slot];
      if (!r) return;
      const m = r.bits | r.stick; r.stick = 0;
      SF_BITS.forEach((k, n) => { f.in[k] = m >> n & 1; });
      f.in.ang = r.ang;
    }

    function stepOnce() {
      const w = G.w;
      for (const f of w.fighters) {
        const p = G.players[f.slot];
        if (G.ph === 'menu' || !p || p.kind === 'bot') sfBotRun(w, f, SF_DT);
        else if (p.kind === 'me') readLocal(f);
        else applyNet(f);
      }
      sfStep(w, SF_DT);
    }

    function pickMap() {
      if (saved.map >= 0 && saved.map < SF_MAPS.length) return saved.map;
      let mi;
      do mi = ri(0, SF_MAPS.length - 1); while (mi === G.lastMi && SF_MAPS.length > 1);
      return mi;
    }
    function makeWorld(mi, sd) {
      const w = sfNewWorld(mi, G.players.map(p => ({ slot: p.slot, name: p.name, kind: p.kind === 'bot' ? 'bot' : 'human', lvl: p.lvl })), { drops: saved.drops });
      if (!sd && !w.map.rise) w.map = Object.assign({}, w.map, { rise: { y: SF_H + 8, from: 1e9, sp: 0 } });
      w.dropT = 4.2; w.noIn = true; w.names = false;
      return w;
    }
    function startRound() {
      const mi = G.pend != null ? G.pend : pickMap();
      G.pend = null;
      G.lastMi = G.mi = mi;
      G.w = makeWorld(mi, saved.sd); G.dyn = null;
      sfFxReset(G.fx);
      G.ph = 'count'; G.pt = 2.7; G.acc = 0; G.slow = 1; G.winner = -1; G.rn++; G.feed = []; G.endT = 0; G.focus = [480, 270];
      G.t0 = performance.now();
      if (G.role === 'host') { api.net.send({ t: 'map', mi, rn: G.rn, sd: saved.sd }); saveResume(); }
      scoreText();
    }
    function scoreText() {
      if (G.role || G.players.length) api.score(G.scores[G.me || 0] || 0);
    }
    function endRound() {
      const w = G.w, al = w.fighters.filter(f => f.alive);
      G.winner = al.length === 1 ? al[0].slot : -1;
      if (G.winner >= 0) { G.scores[G.winner]++; G.focus = [al[0].p[4], al[0].p[5] - 20]; }
      else { const f = w.fighters.reduce((a, b) => (a.p[5] < b.p[5] ? a : b)); G.focus = [f.p[4], f.p[5]]; }
      G.ph = 'end'; G.pt = 2.6; G.slow = .3; G.endT = 0;
      scoreText();
      if (G.winner >= 0 && G.players[G.winner].kind === 'me') snd.win(); else if (G.players.some(p => p.kind === 'me')) snd.lose();
      if (G.role === 'host') saveResume();
    }
    function matchOver() {
      G.ph = 'over'; G.pt = 0;
      const best = Math.max(...G.scores), win = G.scores.indexOf(best);
      G.winner = win;
      if (!G.role && !G.submitted) {
        G.submitted = true;
        const won = win === 0;
        api.submit(G.scores[0] * 100 + (won ? 100 * saved.lvl + 100 * (G.players.length - 1) : 0));
      }
      if (G.role === 'host') clearResume();
      showOver();
    }
    function phase(dt) {
      const w = G.w;
      if (G.ph === 'count') {
        const pre = Math.ceil(G.pt);
        G.pt -= dt;
        const now = Math.ceil(G.pt);
        if (now !== pre && G.pt > 0) snd.beep(0);
        if (G.pt <= 0) { G.ph = 'play'; w.noIn = false; G.pt = 0; snd.beep(1); G.t0 = performance.now(); }
      } else if (G.ph === 'play') {
        const al = w.fighters.reduce((n, f) => n + (f.alive ? 1 : 0), 0);
        if (al <= 1 || w.t > 200) endRound();
      } else if (G.ph === 'end') {
        G.pt -= dt; G.endT += dt;
        G.slow = G.pt > 1.7 ? .3 : lerp(.3, 1, clamp((1.7 - G.pt) / 1.2, 0, 1));
        if (G.pt <= 0) {
          G.slow = 1;
          const done = Math.max(...G.scores) >= G.wins;
          G.ph = 'score'; G.pt = done ? 2.6 : 3.4; G.endT = 0;
          if (G.winner >= 0) snd.tick();
        }
      } else if (G.ph === 'score') {
        G.pt -= dt; G.endT += dt;
        if (G.pt <= 0) { if (Math.max(...G.scores) >= G.wins) matchOver(); else startRound(); }
      } else if (G.ph === 'menu') {
        const al = w.fighters.reduce((n, f) => n + (f.alive ? 1 : 0), 0);
        if (al <= 1 || w.t > 60) { G.demoT += dt; if (G.demoT > 1.6) startDemo(); }
      }
    }

    function startDemo() {
      G.demoT = 0; G.players = [0, 1, 2, 3].map(i => ({ slot: i, name: 'Bot', kind: 'bot', lvl: 3 }));
      G.lastMi = G.mi = pickMapDemo();
      const w = sfNewWorld(G.mi, G.players.map(p => ({ slot: p.slot, name: p.name, kind: 'bot', lvl: 3 })), { drops: 1 });
      w.noIn = false; w.dropT = 2; G.w = w; G.dyn = null; sfFxReset(G.fx); G.scores = [0, 0, 0, 0];
    }
    function pickMapDemo() {
      const ok = [0, 2, 3, 5, 6, 10, 11, 8];
      let mi;
      do mi = pick(ok); while (mi === G.lastMi);
      return mi;
    }

    function hostFrame(dt) {
      const w = G.w;
      if (!w) return;
      if (G.paused) return;
      let sdt = dt * (G.ph === 'end' ? G.slow : 1);
      if (G.ph === 'score' || G.ph === 'over') sdt = dt;
      G.acc += sdt;
      let n = 0;
      while (G.acc >= SF_DT && n < 8) { G.acc -= SF_DT; n++; stepOnce(); }
      if (n === 8) G.acc = 0;
      phase(dt);
      for (const e of w.ev) fxEvent(e);
      w.ev.length = 0;
      if (G.role !== 'host') w.evNet.length = 0;
      sfFxStep(G.fx, w, dt * (G.ph === 'end' ? G.slow : 1));
    }

    const PHI = { menu: 0, count: 1, play: 2, end: 3, score: 4, over: 5 };
    function snapshot(now) {
      const w = G.w, dyn = G.dyn || (G.dyn = w.solids.map((s, i) => (s.m || s.o || s.k || s.f ? i : -1)).filter(i => i >= 0));
      const F = w.fighters.map(f => {
        const o = f.p.map(q1);
        o.push(f.face, Math.round(f.hp), (f.alive ? 1 : 0) | (f.mode === 'rag' ? 2 : 0) | (f.blk > 0 ? 4 : 0) | (f.spin > .3 ? 8 : 0) | (f.inv > 0 ? 16 : 0), q2(f.bm), f.wpn ? SF_WK.indexOf(f.wpn.k) : -1, f.wpn ? f.wpn.ammo : 0, q2(f.wa), q2(f.spin), q2(f.t));
        return o;
      });
      const m = {
        t: 's', q: ++G.seq, ht: Math.round(now), ph: PHI[G.ph], pt: q2(G.pt), sc: G.scores, wn: G.winner, rn: G.rn, tm: q2(w.t), sk: q1(w.shake), rl: q1(w.rl), fz: w.freeze > 0 ? 1 : 0,
        F, So: dyn.map(i => { const s = w.solids[i]; return [q1(s.x), q1(s.y), q1(s.sh), s.fs, s.hot ? 1 : 0]; }),
        Sw: w.saws.map(a => [q1(a.x), q1(a.y)]),
        Wp: w.weapons.map(e => [e.id, SF_WK.indexOf(e.k), q1(e.x), q1(e.y), q2(e.rot), e.onG ? 1 : 0, e.ammo]),
        Cr: w.crates.map(c => [c.id, q1(c.x), q1(c.y), c.st, q2(c.sw || 0)]),
        Bu: w.bullets.map(b => [b.k, q1(b.x), q1(b.y), Math.round(b.vx), Math.round(b.vy)]),
        Sn: w.snakes.map(s => [q1(s.x), q1(s.y), s.dir, s.air ? 1 : 0, q1(s.ph)]),
        E: w.evNet.map(e => e.map(v => typeof v === 'number' ? q1(v) : v))
      };
      return m;
    }
    function hostSend(now) {
      if (G.role !== 'host' || !G.w || !api.net.connected) return;
      if (now - G.lastSend < 32) return;
      G.lastSend = now;
      const m = snapshot(now), ev = m.E.length > 0;
      G.w.evNet.length = 0;
      api.net.send(m, !ev);
    }

    function lerpArr(a, b, u, n) {
      const o = new Array(n);
      for (let i = 0; i < n; i++) o[i] = a[i] + (b[i] - a[i]) * u;
      return o;
    }
    function guestApply(A, C, u) {
      const W = G.w;
      if (!W) return;
      const dyn = G.dyn || (G.dyn = W.solids.map((s, i) => (s.m || s.o || s.k || s.f ? i : -1)).filter(i => i >= 0));
      W.t = A.tm + (C.tm - A.tm) * u; W.shake = A.sk + (C.sk - A.sk) * u; W.rl = A.rl + (C.rl - A.rl) * u;
      G.scores = A.sc; G.winner = A.wn; G.rn = A.rn; G.ph = SF_PH[A.ph]; G.pt = A.pt;
      W.fighters.forEach((f, i) => {
        const a = A.F[i], c = C.F[i] || a;
        if (!a) return;
        for (let k = 0; k < 22; k++) f.p[k] = a[k] + (c[k] - a[k]) * u;
        const s = u > .5 ? c : a;
        f.face = s[22]; f.hp = s[23]; const fl = s[24];
        f.alive = !!(fl & 1); f.mode = fl & 2 ? 'rag' : 'ctl'; f.blk = fl & 4 ? 1 : 0; f.inv = fl & 16 ? 1 : 0; f.bm = s[25];
        f.wpn = s[26] >= 0 ? { k: SF_WK[s[26]], ammo: s[27] } : null;
        f.wa = angLerp(a[28], c[28], u); f.spin = fl & 8 ? 1 : 0; f.t = a[30] + (c[30] - a[30]) * u;
      });
      dyn.forEach((si, i) => {
        const s = W.solids[si], a = A.So[i], c = C.So[i] || a;
        if (!a) return;
        s.x = a[0] + (c[0] - a[0]) * u; s.y = a[1] + (c[1] - a[1]) * u; s.sh = c[2]; s.fs = c[3]; s.hot = c[4];
      });
      W.saws.forEach((s, i) => { const a = A.Sw[i], c = C.Sw[i] || a; if (a) { s.x = a[0] + (c[0] - a[0]) * u; s.y = a[1] + (c[1] - a[1]) * u; s.rot = W.t * 14; } });
      const dt = Math.max(0, (C.ht - A.ht) * u / 1000);
      const cm = new Map(C.Wp.map(e => [e[0], e]));
      W.weapons = A.Wp.map(e => { const c = cm.get(e[0]) || e; return { id: e[0], k: SF_WK[e[1]], x: e[2] + (c[2] - e[2]) * u, y: e[3] + (c[3] - e[3]) * u, rot: e[4] + (c[4] - e[4]) * u, onG: !!e[5], ammo: e[6] }; });
      const cc = new Map(C.Cr.map(e => [e[0], e]));
      W.crates = A.Cr.map(e => { const c = cc.get(e[0]) || e; return { id: e[0], x: e[1] + (c[1] - e[1]) * u, y: e[2] + (c[2] - e[2]) * u, st: e[3], sw: e[4], t: W.t }; });
      W.bullets = A.Bu.map(b => ({ k: b[0], x: b[1] + b[3] * dt, y: b[2] + b[4] * dt, vx: b[3], vy: b[4] }));
      W.snakes = A.Sn.map(s => ({ x: s[0], y: s[1], dir: s[2], air: s[3], ph: s[4] }));
    }
    function guestFrame(dt, now) {
      const B = G.buf, W = G.w;
      if (!W || !B.length) return;
      const tr = now - G.off - 110;
      while (B.length > 2 && B[1].ht <= tr) B.shift();
      const A = B[0], C = B[1] || B[0];
      const u = C.ht > A.ht ? clamp((tr - A.ht) / (C.ht - A.ht), 0, 1) : 0;
      for (const s of B) if (!s.done && s.ht <= tr) { s.done = 1; for (const e of s.E) fxEvent(e); }
      const prev = G.ph;
      guestApply(A, C, u);
      if (G.ph !== prev) {
        if (G.ph === 'play') snd.beep(1);
        if (G.ph === 'end') { const w = A.F; let wi = A.wn; if (wi >= 0 && G.players[wi]) { G.focus = [W.fighters[wi].p[4], W.fighters[wi].p[5] - 20]; if (wi === G.me) snd.win(); else snd.lose(); } else G.focus = [480, 270]; scoreText(); G.endT = 0; }
        if (G.ph === 'score') { G.endT = 0; snd.tick(); }
        if (G.ph === 'over' && !G.overShown) { G.overShown = true; showOver(); }
      }
      if (G.ph === 'count') { const c = Math.ceil(G.pt); if (c !== G.lastCount && G.pt > 0) snd.beep(0); G.lastCount = c; }
      G.endT += dt;
      sfFxStep(G.fx, W, dt);
    }
    function guestSend(now) {
      const W = G.w;
      if (!W || !api.net.connected || !G.pids) return;
      const f = W.fighters[G.me];
      if (!f) return;
      const bits = localBits(f), ang = f.in.ang == null ? null : q2(f.in.ang);
      const change = bits !== G.lastIn;
      const angCh = ang !== G.lastAng && (ang == null || G.lastAng == null || Math.abs(ang - G.lastAng) > .03);
      if (change) { G.lastIn = bits; G.lastAng = ang; G.lastSend = now; api.net.send({ t: 'i', s: ++G.inSeq, b: bits, a: ang }); }
      else if ((angCh && now - G.lastSend > 30) || now - G.lastSend > 60) { G.lastAng = ang; G.lastSend = now; api.net.send({ t: 'i', s: ++G.inSeq, b: bits, a: ang }, true); }
    }

    function hudChips(W) {
      const n = G.players.length, wins = G.wins;
      for (let i = 0; i < n; i++) {
        const p = G.players[i], col = SF_COL[i], x = 480 + (i - (n - 1) / 2) * 212, y = 21, f = W.fighters[i];
        g.save();
        g.globalAlpha = f && !f.alive && G.ph === 'play' ? .5 : .95;
        sfRound(g, x - 100, y - 15, 200, 30, 15); g.fillStyle = 'rgba(255,255,255,.78)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,.16)'; g.stroke();
        g.fillStyle = col.d; g.beginPath(); g.arc(x - 82, y, 10, 0, TAU); g.fill(); g.fillStyle = col.c; g.beginPath(); g.arc(x - 82, y, 7.6, 0, TAU); g.fill();
        sfText(g, p.name.slice(0, 9), x - 66, y + 1, 13, '#222', 'left');
        if (wins <= 8) {
          const sp = wins > 5 ? 11 : 13;
          for (let k = 0; k < wins; k++) {
            const px = x + 88 - (wins - 1 - k) * sp;
            g.beginPath(); g.arc(px, y, 4.3, 0, TAU);
            if (k < G.scores[i]) { g.fillStyle = col.c; g.fill(); g.lineWidth = 1.6; g.strokeStyle = col.d; g.stroke(); } else { g.fillStyle = 'rgba(0,0,0,.14)'; g.fill(); }
          }
        } else sfText(g, G.scores[i] + '/' + wins, x + 88, y + 1, 13, '#222', 'right');
        g.restore();
        if (f && f.wpn && f.alive) {
          const S = SF_WP[f.wpn.k];
          g.save(); g.globalAlpha = .9;
          sfText(g, S.n + (S.ammo ? ' ' + f.wpn.ammo : ''), x, y + 27, 11, '#fff', 'center', 'rgba(0,0,0,.55)', 800);
          g.restore();
        }
      }
    }
    function hudCenter(W) {
      const mapName = W.map.n;
      if (G.ph === 'count') {
        const c = Math.ceil(G.pt), fr = G.pt - Math.floor(G.pt);
        g.save();
        const sc = 1 + (1 - fr) * .0 + Math.pow(fr, 3) * .5;
        g.translate(480, 220); g.scale(sc, sc);
        g.globalAlpha = clamp(fr * 3, 0, 1) * .3 + .7;
        sfText(g, c > 0 ? String(c) : '', 0, 0, 120, '#fff', 'center', 'rgba(0,0,0,.55)');
        g.restore();
        sfText(g, `ROUND ${G.rn}`, 480, 118, 22, '#fff', 'center', 'rgba(0,0,0,.5)');
        sfText(g, mapName.toUpperCase(), 480, 146, 34, '#fff', 'center', 'rgba(0,0,0,.5)');
        const me = W.fighters[G.me];
        if (me && G.players[G.me] && G.players[G.me].kind === 'me') {
          const bob = Math.sin(performance.now() / 160) * 3;
          g.fillStyle = SF_COL[G.me].c; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2;
          const x = me.p[0], y = me.p[1] - 26 + bob;
          g.beginPath(); g.moveTo(x - 9, y - 12); g.lineTo(x + 9, y - 12); g.lineTo(x, y); g.closePath(); g.fill(); g.stroke();
          sfText(g, 'YOU', x, y - 21, 12, '#fff', 'center', 'rgba(0,0,0,.6)');
        }
      } else if (G.ph === 'play' && G.pt <= 0) {
        const t = (performance.now() - G.t0) / 1000;
        if (t < 1) { g.save(); g.globalAlpha = 1 - t; const sc = 1 + t * .35; g.translate(480, 220); g.scale(sc, sc); sfText(g, 'FIGHT!', 0, 0, 96, '#ffd23f', 'center', 'rgba(0,0,0,.6)'); g.restore(); }
        const rs = W.map.rise || { from: 70 };
        if (W.rl < SF_H - 10) {
          const warn = Math.sin(performance.now() / 150) * .5 + .5;
          sfText(g, 'LAVA RISING', 480, 64, 18, `rgba(255,${Math.round(110 + warn * 100)},40,1)`, 'center', 'rgba(0,0,0,.55)');
        } else if (rs.from < 1e8 && W.t > rs.from - 7 && W.t < rs.from) sfText(g, 'LAVA RISES SOON', 480, 64, 18, '#ffb21f', 'center', 'rgba(0,0,0,.55)');
      } else if (G.ph === 'end') {
        const a = clamp(G.endT / .3, 0, 1);
        g.save(); g.globalAlpha = a;
        const txt = G.winner >= 0 ? `${G.players[G.winner].name.toUpperCase()} WINS THE ROUND` : 'DRAW';
        sfText(g, txt, 480, 96, 40, G.winner >= 0 ? SF_COL[G.winner].c : '#fff', 'center', 'rgba(0,0,0,.65)');
        g.restore();
      } else if (G.ph === 'score') {
        const n = G.players.length, h = 74 + n * 44, y0 = 270 - h / 2, last = Math.max(...G.scores) >= G.wins;
        g.save();
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, SF_W, SF_H);
        const a = clamp(G.endT / .25, 0, 1);
        g.globalAlpha = a; g.translate(0, (1 - a) * 18);
        sfRound(g, 250, y0, 460, h, 22); g.fillStyle = 'rgba(255,255,255,.96)'; g.fill();
        sfText(g, last ? 'MATCH POINT' : `ROUND ${G.rn} COMPLETE`, 480, y0 + 30, 22, '#222');
        for (let i = 0; i < n; i++) {
          const col = SF_COL[i], y = y0 + 74 + i * 44, win = i === G.winner;
          if (win) { sfRound(g, 266, y - 19, 428, 38, 19); g.fillStyle = 'rgba(0,0,0,.07)'; g.fill(); }
          g.fillStyle = col.d; g.beginPath(); g.arc(296, y, 14, 0, TAU); g.fill(); g.fillStyle = col.c; g.beginPath(); g.arc(296, y, 11, 0, TAU); g.fill();
          sfText(g, G.players[i].name, 322, y + 1, 18, '#222', 'left');
          if (G.wins <= 8) {
            for (let k = 0; k < G.wins; k++) {
              const px = 668 - (G.wins - 1 - k) * 28, filled = k < G.scores[i], fresh = win && k === G.scores[i] - 1;
              let r = 9;
              if (fresh) r = 9 + Math.max(0, Math.sin(clamp(G.endT / .6, 0, 1) * Math.PI)) * 6;
              g.beginPath(); g.arc(px, y, r, 0, TAU);
              if (filled) { g.fillStyle = col.c; g.fill(); g.lineWidth = 2.5; g.strokeStyle = col.d; g.stroke(); } else { g.fillStyle = 'rgba(0,0,0,.12)'; g.fill(); }
            }
          } else sfText(g, G.scores[i] + ' / ' + G.wins, 668, y + 1, 20, '#222', 'right');
        }
        g.restore();
      }
    }
    function hudFeed() {
      const now = performance.now();
      G.feed = G.feed.filter(q => now - q.t < 4200);
      let y = SF_H - 16;
      for (let i = G.feed.length - 1; i >= 0; i--) {
        const q = G.feed[i], a = clamp((4200 - (now - q.t)) / 600, 0, 1);
        g.save(); g.globalAlpha = a;
        sfText(g, q.s, 14, y, 14, q.c, 'left', 'rgba(0,0,0,.7)');
        g.restore();
        y -= 20;
      }
    }

    function render(dt) {
      const W = G.w;
      g.clearRect(0, 0, SF_W, SF_H);
      if (!W) { g.fillStyle = '#fde68a'; g.fillRect(0, 0, SF_W, SF_H); return; }
      g.save();
      if (G.ph === 'end' || G.ph === 'score') {
        const z = 1 + .28 * (G.ph === 'end' ? clamp(G.endT / .9, 0, 1) : 1), cx = G.focus[0], cy = G.focus[1];
        if (z > 1.001) {
          const ox = clamp(480 - cx * z, SF_W - SF_W * z, 0), oy = clamp(270 - cy * z, SF_H - SF_H * z, 0);
          g.translate(ox, oy); g.scale(z, z);
        }
      }
      sfDrawWorld(g, W, G.fx, null);
      g.restore();
      if (G.ph !== 'menu') { hudChips(W); hudCenter(W); hudFeed(); }
    }

    function saveResume() {
      if (G.role !== 'host') return;
      try {
        sessionStorage.setItem('gameplay:sf:' + api.net.code, JSON.stringify({ at: Date.now(), code: api.net.code, sc: G.scores, wins: G.wins, rn: G.rn, names: G.players.map(p => p.name), kinds: G.players.map(p => p.kind === 'bot' ? 0 : 1), lastMi: G.lastMi, set: { lvl: saved.lvl, drops: saved.drops, sd: saved.sd, map: saved.map } }));
      } catch (e) {}
    }
    function clearResume() { try { sessionStorage.removeItem('gameplay:sf:' + api.net.code); } catch (e) {} }
    function loadResume() {
      try {
        const x = JSON.parse(sessionStorage.getItem('gameplay:sf:' + api.net.code) || 'null');
        if (x && x.code === api.net.code && Date.now() - x.at < 432e5 && Math.max(...x.sc) < x.wins) return x;
      } catch (e) {}
      return null;
    }

    function setUi(html, cls) { ui.className = 'sf-ui ' + (cls || ''); ui.innerHTML = html; ui.hidden = false; }
    function hideUi() { ui.hidden = true; ui.innerHTML = ''; ui.onclick = null; }

    function figCanvas(c, list) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = +c.dataset.w, h = +c.dataset.h;
      c.width = w * dpr; c.height = h * dpr;
      const q = c.getContext('2d');
      q.setTransform(dpr, 0, 0, dpr, 0, 0);
      const k = (h - 6) / 62;
      q.scale(k, k);
      list.forEach((o, i) => sfDrawFighter(q, sfIconFighter(o.s, (i + .5) * (w / k / list.length), h / k - 4, o), null));
    }

    function menuHtml() {
      const seg = (k, arr) => `<div class="sf-seg" data-k="${k}">${arr.map(a => `<button data-v="${a[0]}">${a[1]}</button>`).join('')}</div>`;
      return `<div class="sf-card"><canvas class="sf-logo-c" data-w="320" data-h="64"></canvas><div class="sf-logo">STICK FIGHT</div><div class="sf-sub">Last stick standing wins the round.</div>
<div class="sf-modes"><button class="sf-mode" data-m="bots"><canvas data-w="132" data-h="62"></canvas><b>vs Bots</b><small>1 to 3 bots</small></button><button class="sf-mode" data-m="online"><canvas data-w="132" data-h="62"></canvas><b>Online</b><small>2 to 4 players</small></button></div>
<div class="sf-opts"><div class="sf-row"><span>Bots</span>${seg('bots', [[1, '1'], [2, '2'], [3, '3']])}<span class="sf-gap">Skill</span>${seg('lvl', SF_LVL.map((n, i) => [i + 1, n]))}</div>
<div class="sf-row"><span>First to</span>${seg('wins', [[3, '3'], [5, '5'], [7, '7'], [10, '10']])}<span class="sf-gap">Weapons</span>${seg('drops', [[0, 'None'], [1, 'Normal'], [2, 'Many']])}<span class="sf-gap">Sudden death</span>${seg('sd', [[1, 'On'], [0, 'Off']])}</div></div>
<div class="sf-maps-h">Arena</div><div class="sf-maps"><button class="sf-map" data-map="-1"><span class="sf-rnd">?</span><em>Random</em></button>${SF_MAPS.map((m, i) => `<button class="sf-map" data-map="${i}"><canvas width="128" height="72"></canvas><em>${esc(m.n)}</em></button>`).join('')}</div>
<div class="sf-help">${touchDev ? 'Left stick moves, right stick aims and attacks' : 'A / D move, W or Space jump, J or click punch and fire, K or right click block, L throw, mouse aims'}</div></div>`;
    }
    let thumbDone = false;
    function showMenu() {
      G.ph = 'menu'; G.role = null; G.paused = false; mb.hidden = true; G.demoT = 0; G.overShown = false; G.buf = []; G.dyn = null;
      api.hideOverlay();
      if (tbEl) tbEl.hidden = true;
      startDemo();
      setUi(menuHtml(), 'menu');
      const figs = ui.querySelectorAll('canvas[data-w]');
      figCanvas(figs[0], [{ s: 0, wpn: 'pistol', a: -.2 }, { s: 1, ph: 1.3, vx: 150 }, { s: 2, atk: 1, face: -1 }, { s: 3, wpn: 'sword', face: -1, a: Math.PI + .3 }]);
      figCanvas(figs[1], [{ s: 0, wpn: 'shotgun' }, { s: 1, face: -1, blk: 1 }]);
      figCanvas(figs[2], [{ s: 2, atk: 1 }, { s: 3, face: -1, ph: 1, vx: 120 }, { s: 1, wpn: 'uzi', face: -1, a: Math.PI }]);
      const cs = ui.querySelectorAll('.sf-map canvas');
      cs.forEach((c, i) => sfThumb(c, i));
      const sync = () => {
        ui.querySelectorAll('.sf-seg').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(saved[s.dataset.k]) === b.dataset.v)));
        ui.querySelectorAll('.sf-map').forEach(b => b.classList.toggle('on', +b.dataset.map === saved.map));
        ui.querySelectorAll('.sf-mode').forEach(b => b.classList.toggle('on', b.dataset.m === saved.mode));
      };
      sync();
      ui.onclick = e => {
        const sb = e.target.closest('.sf-seg button');
        if (sb) { saved[sb.parentNode.dataset.k] = +sb.dataset.v; api.save(saved); sync(); api.sfx('tap'); return; }
        const mp = e.target.closest('.sf-map');
        if (mp) { saved.map = +mp.dataset.map; api.save(saved); sync(); api.sfx('tap'); return; }
        const md = e.target.closest('.sf-mode');
        if (md) { api.sfx('tap'); saved.mode = md.dataset.m; api.save(saved); if (md.dataset.m === 'online') goOnline(); else startSolo(); }
      };
    }
    function showOver() {
      mb.hidden = true;
      const sc = G.scores, best = Math.max(...sc), win = sc.indexOf(best), me = G.me;
      const n = G.players.length;
      const mine = G.players[me] && G.players[me].kind === 'me';
      const stats = G.players.map((p, i) => [`${SF_COL[i].n} · ${esc(p.name)}`, sc[i]]);
      const title = win === me && mine ? 'You win the match!' : `${esc(G.players[win].name)} wins the match`;
      if (G.role === 'guest') {
        api.overlay({ kicker: 'Match over', title, text: 'Waiting for the host to start a rematch.', stats, button: null, secondary: 'Leave', onSecondary: leave });
        return;
      }
      if (G.role === 'host') {
        api.overlay({ kicker: 'Match over', title, stats, button: 'Rematch', onAction: () => hostRematch(), secondary: 'Lobby', onSecondary: () => goOnline() });
        return;
      }
      api.overlay({ kicker: win === 0 ? 'Victory' : 'Match over', title, stats, button: 'Play again', onAction: () => startSolo(), secondary: 'Menu', onSecondary: showMenu });
    }
    function leave() {
      if (G.role) { try { api.net.close(); } catch (e) {} }
      G.role = null; showMenu();
    }

    function beginMatchUi() {
      hideUi(); mb.hidden = false; api.hideOverlay(); G.overShown = false; G.submitted = false;
      if (tbEl) tbEl.hidden = false;
      keys.clear();
    }
    function startSolo() {
      G.role = null;
      const nb = clamp(saved.bots, 1, 3);
      G.players = [{ slot: 0, name: 'You', kind: 'me' }];
      for (let i = 0; i < nb; i++) G.players.push({ slot: i + 1, name: SF_BOTNAMES[(i + ri(0, 2) * 2) % SF_BOTNAMES.length], kind: 'bot', lvl: saved.lvl });
      G.scores = G.players.map(() => 0); G.wins = saved.wins; G.rn = 0; G.me = 0; G.lastMi = -1;
      beginMatchUi();
      startRound();
    }

    async function goOnline() {
      if (!G.hooked) hookNet();
      api.hideOverlay();
      G.ph = 'lobby'; G.role = null; hideUi(); mb.hidden = true; if (tbEl) tbEl.hidden = true; G.buf = []; G.overShown = false;
      const wasNew = api.net.invite === 'NEW';
      const r = await api.net.room({ title: 'Stick Fight', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true });
      if (!api.alive) return;
      if (!r) { showMenu(); return; }
      G.role = r.role;
      if (r.role === 'host') {
        G.hostPlayers = r.players.slice(0, 4); G.size = Math.min(4, +r.size || G.hostPlayers.length); G.bots = !!r.bots;
        const sv = G.firstRoom !== false && wasNew ? loadResume() : null;
        G.firstRoom = false;
        if (sv) offerResume(sv); else hostStart(null);
      } else {
        G.ph = 'wait'; G.me = -1;
        setUi('<div class="sf-card sf-pan"><p class="sf-k">Online</p><h3>Connected</h3><p class="sf-t">Waiting for the host to start the match.</p><div class="sf-btns"><button class="g-btn ghost" data-b="leave">Leave</button></div></div>', 'panel');
        ui.onclick = e => { if (e.target.closest('[data-b="leave"]')) leave(); };
      }
    }
    function offerResume(sv) {
      G.ph = 'wait';
      const sc = sv.sc.join(' - ');
      setUi(`<div class="sf-card sf-pan"><p class="sf-k">Online</p><h3>Game in progress</h3><p class="sf-t">Saved match at round ${sv.rn}, score ${sc}.</p><div class="sf-btns"><button class="g-btn" data-b="go">Resume game</button><button class="g-btn ghost" data-b="new">New game</button><button class="g-btn ghost" data-b="leave">Leave</button></div></div>`, 'panel');
      ui.onclick = e => {
        const b = e.target.closest('[data-b]'); if (!b) return;
        api.sfx('tap');
        if (b.dataset.b === 'go') hostStart(sv); else if (b.dataset.b === 'new') { clearResume(); hostStart(null); } else leave();
      };
    }
    function hostStart(sv) {
      const hp = G.hostPlayers, size = G.size;
      const total = G.bots ? Math.max(size, hp.length) : hp.length;
      const players = [];
      if (sv) {
        const used = new Set();
        sv.names.forEach((nm, i) => {
          if (i === 0) { players.push({ slot: 0, name: hp[0].name, kind: 'me', id: hp[0].id }); return; }
          if (sv.kinds[i]) {
            const gi = hp.findIndex((q, k) => k > 0 && !used.has(k) && q.name === nm);
            if (gi >= 0) { used.add(gi); players.push({ slot: i, name: hp[gi].name, kind: 'net', id: hp[gi].id }); return; }
            players.push({ slot: i, name: nm.slice(0, 10) + ' bot', kind: 'bot', lvl: sv.set.lvl });
          } else players.push({ slot: i, name: nm, kind: 'bot', lvl: sv.set.lvl });
        });
        hp.forEach((q, k) => { if (k > 0 && !used.has(k) && players.length < 4) { const sl = players.findIndex(p => p.kind === 'bot'); if (sl >= 0) players[sl] = { slot: sl, name: q.name, kind: 'net', id: q.id }; } });
        Object.assign(saved, { lvl: sv.set.lvl, drops: sv.set.drops, sd: sv.set.sd, map: sv.set.map });
        G.wins = sv.wins; G.scores = sv.sc.slice(); G.rn = sv.rn - 1; G.lastMi = sv.lastMi;
      } else {
        hp.forEach((q, i) => players.push({ slot: i, name: q.name, kind: i === 0 ? 'me' : 'net', id: q.id }));
        for (let i = hp.length; i < total; i++) players.push({ slot: i, name: SF_BOTNAMES[(i + ri(0, 2) * 2) % SF_BOTNAMES.length], kind: 'bot', lvl: saved.lvl });
        G.wins = saved.wins; G.scores = players.map(() => 0); G.rn = 0; G.lastMi = -1;
      }
      G.players = players; G.me = 0; G.pids = players.map(p => p.id || null); G.rin = {};
      players.forEach(p => { if (p.kind === 'net') G.rin[p.slot] = { bits: 0, stick: 0, ang: null, s: 0 }; });
      beginMatchUi();
      sendCfg(null);
      startRound();
    }
    function cfgMsg(slot) {
      return { t: 'cfg', me: slot, names: G.players.map(p => p.name), kinds: G.players.map(p => p.kind === 'bot' ? 0 : 1), wins: G.wins, sc: G.scores };
    }
    function sendCfg(only) {
      G.players.forEach(p => { if (p.kind === 'net' && (!only || only === p.id)) api.net.sendTo(p.id, cfgMsg(p.slot)); });
    }
    function hostRematch() {
      api.hideOverlay();
      G.scores = G.players.map(() => 0); G.rn = 0; G.lastMi = -1; G.submitted = false;
      beginMatchUi();
      sendCfg(null);
      startRound();
    }

    function hookNet() {
      G.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !G.role) return;
        if (G.role === 'host') {
          if (d.t === 'i') {
            const p = G.players.find(q => q.kind === 'net' && q.id === from);
            if (!p) return;
            const r = G.rin[p.slot] || (G.rin[p.slot] = { bits: 0, stick: 0, ang: null, s: 0 });
            if (!(d.s > r.s)) return;
            r.s = d.s;
            const nb = d.b | 0;
            r.stick |= nb & ~r.bits;
            r.bits = nb; r.ang = typeof d.a === 'number' ? d.a : null;
          }
        } else {
          if (d.t === 'cfg') {
            G.me = d.me | 0; G.wins = d.wins; G.scores = d.sc.slice(); G.names = d.names; G.kinds = d.kinds;
            G.players = d.names.map((nm, i) => ({ slot: i, name: nm, kind: i === G.me ? 'me' : d.kinds[i] ? 'net' : 'bot' }));
            G.overShown = false; G.buf = []; G.offSet = false; G.dyn = null; G.w = null; G.lastIn = -1; G.inSeq = 0;
            api.hideOverlay(); hideUi(); mb.hidden = false; if (tbEl) tbEl.hidden = false; G.ph = 'count'; keys.clear();
          } else if (d.t === 'map') {
            if (!G.players.length) return;
            G.w = makeWorld(d.mi, d.sd); G.dyn = null; G.buf = []; sfFxReset(G.fx); G.feed = []; G.rn = d.rn; G.mi = d.mi; G.t0 = performance.now(); G.focus = [480, 270];
          } else if (d.t === 'names') {
            d.names.forEach((nm, i) => { if (G.players[i]) { G.players[i].name = nm; if (G.w && G.w.fighters[i]) G.w.fighters[i].name = nm; } });
          } else if (d.t === 's') {
            if (!G.w) return;
            const now = performance.now(), o = now - d.ht;
            G.off = G.offSet ? Math.min(o, G.off + 1.5) : o; G.offSet = true;
            const B = G.buf;
            let j = B.length;
            while (j > 0 && B[j - 1].q > d.q) j--;
            if (j > 0 && B[j - 1].q === d.q) return;
            B.splice(j, 0, d);
            if (B.length > 40) B.shift();
          }
        }
      });
      api.net.on('leave', pl => {
        if (G.role !== 'host' || !pl) return;
        const p = G.players.find(q => q.kind === 'net' && q.id === pl.id);
        if (!p) return;
        p.kind = 'bot'; p.lvl = saved.lvl; p.name = p.name.slice(0, 8) + ' bot'; delete G.rin[p.slot];
        const f = G.w && G.w.fighters[p.slot];
        if (f) { f.bot = null; f.lvl = saved.lvl; f.name = p.name; }
        api.net.send({ t: 'names', names: G.players.map(q => q.name) });
        api.toast(pl.name + ' left. A bot takes over.');
        saveResume();
      });
      api.net.on('rejoin', pl => {
        if (G.role !== 'host' || !pl || !G.players.length) return;
        const p = G.players.find(q => q.kind === 'net' && q.id === pl.id);
        if (!p) return;
        api.net.sendTo(pl.id, cfgMsg(p.slot));
        if (G.w) api.net.sendTo(pl.id, { t: 'map', mi: G.mi, rn: G.rn, sd: saved.sd });
        if (G.ph === 'over') api.net.sendTo(pl.id, { t: 'names', names: G.players.map(q => q.name) });
      });
      api.net.on('lobby', () => { if (G.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!G.role) return;
        G.role = null; G.ph = 'left'; mb.hidden = true; if (tbEl) tbEl.hidden = true;
        api.hideOverlay();
        setUi(`<div class="sf-card sf-pan"><p class="sf-k">Online</p><h3>${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</h3><p class="sf-t">${why === 'host-left' ? 'The host ended the online match.' : why === 'kicked' ? 'The host removed you from the match.' : 'The connection to the host was lost.'}</p><div class="sf-btns"><button class="g-btn" data-b="on">Online lobby</button><button class="g-btn ghost" data-b="menu">Menu</button></div></div>`, 'panel');
        ui.onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; api.sfx('tap'); if (b.dataset.b === 'on') goOnline(); else showMenu(); };
        api.sfx('lose');
      });
    }

    function pausePanel() {
      if (G.ph === 'menu' || G.ph === 'lobby' || G.ph === 'wait' || G.ph === 'left') return;
      if (G.role) {
        setUi('<div class="sf-card sf-pan"><p class="sf-k">Online match</p><h3>Menu</h3><div class="sf-btns"><button class="g-btn" data-b="res">Resume</button><button class="g-btn ghost" data-b="leave">Leave match</button></div></div>', 'panel');
      } else {
        G.paused = true;
        setUi('<div class="sf-card sf-pan"><p class="sf-k">Paused</p><h3>Menu</h3><div class="sf-btns"><button class="g-btn" data-b="res">Resume</button><button class="g-btn ghost" data-b="rs">Restart match</button><button class="g-btn ghost" data-b="leave">Quit to menu</button></div></div>', 'panel');
      }
      ui.onclick = e => {
        const b = e.target.closest('[data-b]'); if (!b) return;
        api.sfx('tap');
        if (b.dataset.b === 'res') { hideUi(); G.paused = false; keys.clear(); }
        else if (b.dataset.b === 'rs') { G.paused = false; startSolo(); }
        else { G.paused = false; leave(); }
      };
    }
    api.on(mb, 'click', pausePanel);

    api.on(window, 'keydown', e => {
      if (e.target && e.target.closest && e.target.closest('input,textarea')) return;
      if (G.ph === 'menu' && e.code === 'Enter' && !ui.hidden) { e.preventDefault(); api.sfx('tap'); if (saved.mode === 'online') goOnline(); else startSolo(); return; }
      if (G.ph !== 'menu' && !G.paused && ['count', 'play', 'end', 'score'].includes(G.ph) && ui.hidden && (SF_KM.l.concat(SF_KM.r, SF_KM.u, SF_KM.d, SF_KM.j, SF_KM.a, SF_KM.b, SF_KM.x)).includes(e.code)) e.preventDefault();
    });
    api.on(cv, 'pointermove', e => { if (e.pointerType === 'touch') return; const p = C.toLocal(e); mouse.x = p.x; mouse.y = p.y; mouse.t = performance.now(); });
    api.on(cv, 'pointerdown', e => {
      if (e.pointerType === 'touch') return;
      const p = C.toLocal(e); mouse.x = p.x; mouse.y = p.y; mouse.t = performance.now();
      if (e.button === 0) mouse.l = 1; else if (e.button === 2) mouse.r = 1;
    });
    api.on(window, 'pointerup', e => { if (e.button === 0) mouse.l = 0; else if (e.button === 2) mouse.r = 0; });
    api.on(window, 'blur', () => { mouse.l = mouse.r = 0; });
    api.on(cv, 'contextmenu', e => e.preventDefault());

    (function buildTouch() {
      const bar = touchBar(root, {
        l: [{ k: 'j', l: 'JUMP', n: 'Jump', c: 'big' }],
        r: [{ k: 'b', l: 'BLOCK', n: 'Block' }, { k: 'x', l: 'DROP', n: 'Throw weapon' }]
      }, th);
      const lg = bar.querySelector('.tb-l'), rg = bar.querySelector('.tb-r');
      const mk = () => { const s = document.createElement('div'); s.className = 'tb-stick'; s.innerHTML = '<i></i>'; return s; };
      const ms = mk(), as = mk();
      lg.prepend(ms); rg.append(as);
      bumpStick(ms, (dx, dy) => { th.l = dx < -.3 ? 1 : 0; th.r = dx > .3 ? 1 : 0; th.u = dy < -.55 ? 1 : 0; th.d = dy > .55 ? 1 : 0; });
      bumpStick(as, (dx, dy) => { tAim.x = dx; tAim.y = dy; tAim.m = Math.hypot(dx, dy); });
      bar.hidden = true;
      tbEl = bar;
    })();

    api.loop((dt, now) => {
      if (G.role === 'guest') {
        guestFrame(dt, now);
        if (G.ph === 'count' || G.ph === 'play') guestSend(now);
      } else {
        hostFrame(dt);
        hostSend(now);
      }
      render(dt);
    });

    root.__sf = { G, saved, snapshot, fxEvent };
    if (api.net.invite) { showMenu(); hideUi(); goOnline(); } else showMenu();
    return { destroy() { aud.close(); } };
  }

  Ameplay.register({
    id: 'stick-fight',
    title: 'Stick Fight',
    category: 'Action',
    tint: '#f7c61b',
    blurb: 'Stickmen brawl with guns, swords and rockets. Last one standing wins the round.',
    help: '<kbd>A</kbd><kbd>D</kbd> move · <kbd>W</kbd> or <kbd>Space</kbd> jump (also off walls) · <kbd>J</kbd> or click punch and fire · <kbd>K</kbd> or right click block · <kbd>L</kbd> throw weapon · mouse aims · touch: sticks and buttons · online: 2 to 4 players',
    better: 'high',
    format: v => v + ' pts',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="12" r="6" fill="currentColor"/><path d="M30 18v20M30 38l-9 16M30 38l10 16M30 24l-12 8M30 24l16-4"/><path d="M46 20l12-4" stroke-width="3"/></svg>',
    css: `.gm-stick-fight{gap:0}
.gm-stick-fight .sf-wrap{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px)) * 1.7778));margin:0 auto;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r);overflow:hidden;background:#fde68a;box-shadow:0 0 0 1px var(--line)}
.gm-stick-fight .sf-wrap canvas.g-canvas{display:block;width:100%;touch-action:none;margin:0}
.gm-stick-fight .sf-ui{position:absolute;inset:0;display:flex;padding:10px;overflow:auto;background:rgba(255,255,255,.62);touch-action:pan-y}
.gm-stick-fight .sf-ui.panel{background:rgba(255,255,255,.8)}
.gm-stick-fight .sf-ui[hidden],.gm-stick-fight .sf-mb[hidden],.gm-stick-fight .tb[hidden]{display:none!important}
.gm-stick-fight .sf-card{width:100%;max-width:760px;margin:auto;text-align:center;color:#25232e;font-family:var(--sans)}
.gm-stick-fight .sf-logo-c{width:210px;height:42px;display:block;margin:0 auto}
.gm-stick-fight .sf-logo{font:900 italic clamp(28px,6vw,46px)/1 var(--sans);letter-spacing:.03em;color:#16141c;text-shadow:3px 3px 0 rgba(0,0,0,.12)}
.gm-stick-fight .sf-sub{font-weight:800;color:#6d6b78;margin:3px 0 10px;font-size:13px}
.gm-stick-fight .sf-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-width:440px;margin:0 auto}
.gm-stick-fight .sf-mode{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 6px 7px;border:2px solid #d7d5df;border-radius:14px;background:#fff;cursor:pointer;font-family:var(--sans);color:#25232e;box-shadow:0 3px 0 #d7d5df;transition:transform .12s,border-color .12s}
.gm-stick-fight .sf-mode:hover,.gm-stick-fight .sf-mode.on{border-color:#16141c}
.gm-stick-fight .sf-mode:hover{transform:translateY(-2px)}
.gm-stick-fight .sf-mode canvas{width:100px;height:47px}
.gm-stick-fight .sf-mode b{font-size:15px;font-weight:900}
.gm-stick-fight .sf-mode small{font-size:11px;font-weight:800;color:#8a8896;line-height:1.2}
.gm-stick-fight .sf-opts{display:flex;flex-direction:column;gap:5px;margin-top:10px;align-items:center}
.gm-stick-fight .sf-row{display:flex;flex-wrap:wrap;gap:5px 6px;align-items:center;justify-content:center}
.gm-stick-fight .sf-row>span{font-size:10.5px;font-weight:900;color:#7d7b88;text-transform:uppercase;letter-spacing:.06em}
.gm-stick-fight .sf-row>span.sf-gap{margin-left:8px}
.gm-stick-fight .sf-seg{display:inline-flex;background:rgba(0,0,0,.08);border-radius:999px;padding:2px}
.gm-stick-fight .sf-seg button{border:0;background:none;font:800 12px var(--sans);color:#55535f;padding:5px 10px;border-radius:999px;cursor:pointer;min-height:30px}
.gm-stick-fight .sf-seg button.on{background:#16141c;color:#fff}
.gm-stick-fight .sf-maps-h{font-size:10.5px;font-weight:900;color:#7d7b88;text-transform:uppercase;letter-spacing:.06em;margin:9px 0 3px}
.gm-stick-fight .sf-maps{display:flex;gap:7px;overflow-x:auto;padding:4px 4px 8px;scrollbar-width:thin}
.gm-stick-fight .sf-map{flex:0 0 104px;border:2px solid #d7d5df;border-radius:10px;background:#fff;padding:3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--sans);color:#25232e}
.gm-stick-fight .sf-map.on{border-color:#16141c;box-shadow:0 0 0 2px #f7c61b}
.gm-stick-fight .sf-map canvas{width:100%;aspect-ratio:16/9;border-radius:6px;display:block}
.gm-stick-fight .sf-map em{font:800 10.5px var(--sans);font-style:normal;white-space:nowrap}
.gm-stick-fight .sf-rnd{width:100%;aspect-ratio:16/9;border-radius:6px;display:grid;place-items:center;background:linear-gradient(135deg,#f7c61b,#3c86f4,#ee4a47,#37c25a);font:900 30px var(--sans);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.3)}
.gm-stick-fight .sf-help{font-size:11px;font-weight:700;color:#7d7b88;margin-top:2px}
.gm-stick-fight .sf-pan h3{font:900 28px/1.1 var(--sans);margin:4px 0 8px}
.gm-stick-fight .sf-k{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#7d7b88;margin:0}
.gm-stick-fight .sf-t{font-weight:700;color:#55535f;margin:0 0 12px}
.gm-stick-fight .sf-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm-stick-fight .sf-mb{position:absolute;right:8px;bottom:8px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(0,0,0,.14);color:#16141c;display:grid;place-items:center;cursor:pointer}
.gm-stick-fight .sf-mb:hover{background:rgba(0,0,0,.26)}
@media (max-width:600px){.gm-stick-fight .sf-ui.menu{position:relative;inset:auto}.gm-stick-fight .sf-wrap:has(.sf-ui.menu:not([hidden])) canvas.g-canvas{display:none}.gm-stick-fight .sf-map{flex-basis:76px}.gm-stick-fight .sf-ui{padding:5px;background:rgba(255,255,255,.9)}.gm-stick-fight .sf-logo-c{width:140px;height:28px}.gm-stick-fight .sf-sub{margin:0 0 4px;font-size:11px}.gm-stick-fight .sf-modes{gap:5px}.gm-stick-fight .sf-mode{flex-direction:row;gap:6px;padding:4px 8px;border-radius:10px;justify-content:center}.gm-stick-fight .sf-mode canvas{display:none}.gm-stick-fight .sf-mode b{font-size:13px}.gm-stick-fight .sf-mode small{display:none}.gm-stick-fight .sf-opts{gap:3px;margin-top:5px}.gm-stick-fight .sf-seg button{padding:3px 7px;min-height:24px;font-size:11px}.gm-stick-fight .sf-row>span{font-size:9.5px}.gm-stick-fight .sf-maps-h{margin:4px 0 1px}.gm-stick-fight .sf-help{display:none}.gm-stick-fight .sf-pan h3{font-size:20px;margin:2px 0 4px}.gm-stick-fight .sf-t{margin:0 0 6px;font-size:12px}}
${TOUCH_CSS('stick-fight')}`,
    mount(root, api) { return sfMount(root, api); }
  });

  Ameplay.covers['stick-fight'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sfc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#fbbf24"/></linearGradient></defs><rect width="400" height="300" fill="url(#sfc-bg)"/><g fill="#fff" opacity=".35"><circle cx="70" cy="60" r="36"/><circle cx="330" cy="90" r="46"/></g><rect x="0" y="236" width="400" height="64" fill="#15131c"/><rect x="0" y="236" width="400" height="6" fill="#4a4258"/><rect x="130" y="160" width="140" height="12" fill="#15131c"/><rect x="130" y="160" width="140" height="4" fill="#4a4258"/><g stroke-linecap="round" stroke-linejoin="round" fill="none"><g stroke="#98201e" stroke-width="12"><path d="M90 168v-34M90 150l-18 16M90 150l22-8M90 168l-12 28M90 168l16 28"/><circle cx="90" cy="118" r="14" fill="#98201e"/></g><g stroke="#ee4a47" stroke-width="7.5"><path d="M90 168v-34M90 150l-18 16M90 150l22-8M90 168l-12 28M90 168l16 28"/><circle cx="90" cy="118" r="11" fill="#ee4a47"/></g><g stroke="#1a478f" stroke-width="12"><path d="M310 168v-34M310 150l18 16M310 150l-22 8M310 168l12 28M310 168l-16 28"/><circle cx="310" cy="118" r="14" fill="#1a478f"/></g><g stroke="#3c86f4" stroke-width="7.5"><path d="M310 168v-34M310 150l18 16M310 150l-22 8M310 168l12 28M310 168l-16 28"/><circle cx="310" cy="118" r="11" fill="#3c86f4"/></g><g stroke="#9a7600" stroke-width="12"><path d="M200 130v-34M200 112l-20-12M200 112l20-12M200 130l-14 28M200 130l14 28"/><circle cx="200" cy="80" r="14" fill="#9a7600"/></g><g stroke="#f7c61b" stroke-width="7.5"><path d="M200 130v-34M200 112l-20-12M200 112l20-12M200 130l-14 28M200 130l14 28"/><circle cx="200" cy="80" r="11" fill="#f7c61b"/></g></g><g fill="#26262e"><rect x="108" y="138" width="26" height="8" rx="2"/><rect x="108" y="146" width="7" height="12" rx="2"/><rect x="262" y="140" width="26" height="8" rx="2" transform="rotate(8 262 140)"/></g><g stroke="#ffe27a" stroke-width="3" stroke-linecap="round"><path d="M142 140h50"/><path d="M262 144l-44-4"/></g><circle cx="145" cy="141" r="9" fill="#fff3a0"/><circle cx="145" cy="141" r="4" fill="#fff"/></svg>`;

  const SM_W = 960, SM_H = 540, SM_PX = 3.2, SM_FH = 24, SM_HW = 6;
  const SM_COL = [
    { n: 'Red', c: '#ef4444', d: '#8f1d1d', l: '#fecaca' },
    { n: 'Blue', c: '#3b82f6', d: '#1b3f8f', l: '#bfdbfe' },
    { n: 'Yellow', c: '#f5c518', d: '#8a6a00', l: '#fef08a' },
    { n: 'Green', c: '#22c55e', d: '#146534', l: '#bbf7d0' }
  ];
  const SM_ST = ['idle', 'dash', 'run', 'walk', 'jsq', 'air', 'land', 'crouch', 'shield', 'spot', 'roll', 'adodge', 'atk', 'hit', 'tumble', 'down', 'getup', 'ledge', 'ledgeup', 'grab', 'hold', 'held', 'throw', 'help', 'respawn', 'dead', 'stun', 'turn', 'techr', 'ledgeroll', 'ledgeatk', 'shieldoff', 'rise'];
  const SM_SI = {};
  SM_ST.forEach((s, i) => { SM_SI[s] = i; });

  const SM_STAGES = [
    {
      id: 'flat', n: 'Flat Zone', b: 'A single flat slab over the void. Nothing to hide behind.',
      sk: ['#070b22', '#2b1760', '#9d2fb8'],
      solids: [{ x0: -95, x1: 95, y0: 0, y1: 96 }], soft: [],
      bz: { l: -265, r: 265, t: -205, b: 165 }, cam: { l: -200, r: 200, t: -140, b: 80 },
      sp: [-62, 62, -22, 22], rs: [0, -105]
    },
    {
      id: 'triplet', n: 'Triplet Isle', b: 'A floating isle with three soft platforms in a triangle.',
      sk: ['#2a6fd6', '#7cc4f2', '#d7f1ff'],
      solids: [{ x0: -88, x1: 88, y0: 0, y1: 80 }],
      soft: [{ x0: -68, x1: -26, y: -40 }, { x0: 26, x1: 68, y: -40 }, { x0: -22, x1: 22, y: -78 }],
      bz: { l: -250, r: 250, t: -200, b: 160 }, cam: { l: -190, r: 190, t: -140, b: 80 },
      sp: [-60, 60, -24, 24], rs: [0, -110]
    },
    {
      id: 'windy', n: 'Windy Heights', b: 'Two drifting clouds over a narrow tower. Gusts push everyone around.',
      sk: ['#4b6cb7', '#8fb3ea', '#f3e9d2'],
      solids: [{ x0: -66, x1: 66, y0: 0, y1: 90 }],
      soft: [{ w: 46, y: -46, mv: { ax: -105, bx: 105, per: 520, ph: 0 } }, { w: 46, y: -92, mv: { ax: 105, bx: -105, per: 520, ph: 0 } }],
      wind: true,
      bz: { l: -270, r: 270, t: -215, b: 165 }, cam: { l: -200, r: 200, t: -150, b: 80 },
      sp: [-40, 40, -14, 14], rs: [0, -120]
    },
    {
      id: 'keep', n: 'Ruined Keep', b: 'A broken fortress floor with a raised block in the middle.',
      sk: ['#2b1a2e', '#6b3a43', '#d98b52'],
      solids: [{ x0: -115, x1: 115, y0: 0, y1: 90 }, { x0: -32, x1: 32, y0: -20, y1: 0, nl: 1 }],
      soft: [{ x0: -104, x1: -62, y: -54 }, { x0: 62, x1: 104, y: -54 }],
      bz: { l: -275, r: 275, t: -205, b: 165 }, cam: { l: -210, r: 210, t: -140, b: 80 },
      sp: [-80, 80, -50, 50], rs: [0, -110]
    },
    {
      id: 'bridge', n: 'Skybridge', b: 'Two islands with a drop between them and a lift in the gap.',
      sk: ['#f59e0b', '#fb7185', '#7c3aed'],
      solids: [{ x0: -140, x1: -46, y0: 0, y1: 80 }, { x0: 46, x1: 140, y0: 0, y1: 80 }],
      soft: [{ w: 52, y: -34, mv: { ay: -8, by: -64, per: 420, ph: 0, x: 0 } }],
      bz: { l: -280, r: 280, t: -205, b: 165 }, cam: { l: -215, r: 215, t: -140, b: 80 },
      sp: [-100, 100, -70, 70], rs: [0, -110]
    },
    {
      id: 'neon', n: 'Neon Rooftop', b: 'A long rooftop under the city lights with a high perch.',
      sk: ['#0f0a2e', '#2a1363', '#e11d74'],
      solids: [{ x0: -122, x1: 122, y0: 0, y1: 100 }],
      soft: [{ x0: -106, x1: -62, y: -46 }, { x0: 62, x1: 106, y: -46 }, { x0: -30, x1: 30, y: -88 }],
      bz: { l: -285, r: 285, t: -215, b: 170 }, cam: { l: -215, r: 215, t: -150, b: 80 },
      sp: [-84, 84, -40, 40], rs: [0, -120]
    }
  ];

  const SM_ITEMS = {
    heart: { n: 'Heart', w: 5, r: 6, heal: 28 },
    bomb: { n: 'Bomb', w: 4, r: 6, hold: 1, fuse: 300 },
    bat: { n: 'Slugger', w: 3, r: 7, hold: 1, dur: 10 },
    blaster: { n: 'Blaster', w: 3, r: 7, hold: 1, ammo: 12 },
    orb: { n: 'Guard Orb', w: 2, r: 6, shield: 1 }
  };
  const SM_IK = Object.keys(SM_ITEMS);

  const SM_CPU = ['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4', 'Lv 5', 'Lv 6', 'Lv 7', 'Lv 8', 'Lv 9'];
  const SM_AI = [
    { rt: 28, acc: .18, agg: .25, def: .1, tech: 0, di: 0, rec: .35, ledge: .2, itm: .1, comb: 0 },
    { rt: 24, acc: .3, agg: .35, def: .2, tech: .05, di: 0, rec: .5, ledge: .3, itm: .2, comb: .05 },
    { rt: 20, acc: .42, agg: .45, def: .32, tech: .15, di: .1, rec: .65, ledge: .45, itm: .3, comb: .15 },
    { rt: 16, acc: .55, agg: .55, def: .42, tech: .3, di: .25, rec: .78, ledge: .55, itm: .45, comb: .3 },
    { rt: 13, acc: .66, agg: .62, def: .52, tech: .5, di: .4, rec: .86, ledge: .65, itm: .6, comb: .45 },
    { rt: 10, acc: .76, agg: .68, def: .6, tech: .65, di: .6, rec: .92, ledge: .75, itm: .7, comb: .6 },
    { rt: 8, acc: .85, agg: .74, def: .68, tech: .8, di: .75, rec: .96, ledge: .85, itm: .8, comb: .75 },
    { rt: 6, acc: .92, agg: .8, def: .76, tech: .9, di: .9, rec: .99, ledge: .92, itm: .9, comb: .9 },
    { rt: 4, acc: .98, agg: .86, def: .85, tech: 1, di: 1, rec: 1, ledge: 1, itm: 1, comb: 1 }
  ];
  const SM_NAMES = ['Nova', 'Echo', 'Kai', 'Juno', 'Rio', 'Sage', 'Wren', 'Onyx', 'Tess', 'Axel'];

  const smD2R = Math.PI / 180;
  function smHb(f0, f1, x, y, r, d, ang, kb, b, o) {
    return Object.assign({ f0, f1, x, y, r, d, ang, kb, b, id: 0, e: 'n', sp: 1, hl: 1 }, o);
  }
  function smP(s, a, e, x, y, r, d, ang, kb, b, m) {
    m = m || {};
    const len = s + a + e, hx = x > 0 ? Math.max(x - r * .45, 6) : Math.min(x + r * .45, -6);
    return Object.assign({
      len, hb: [smHb(s, s + a - 1, x, y, r, d, ang, kb, b, m.h)],
      pose: { h: [[0, 6, -15], [Math.max(0, s - 3), 0, -17], [s, hx, y], [s + a, hx, y], [len, 6, -15]], lean: [[0, 0], [s, .14], [s + a, .14], [len, 0]] }
    }, m.m);
  }
  function smK(s, a, e, x, y, r, d, ang, kb, b, m) {
    m = m || {};
    const len = s + a + e, fx = x > 0 ? Math.max(x - r * .4, 6) : Math.min(x + r * .4, -6);
    return Object.assign({
      len, hb: [smHb(s, s + a - 1, x, y, r, d, ang, kb, b, m.h)],
      pose: { f: [[0, 4, 0], [Math.max(0, s - 3), x > 0 ? -3 : 3, -7], [s, fx, y], [s + a, fx, y], [len, 4, 0]], lean: [[0, 0], [s, x > 0 ? -.16 : .16], [s + a, x > 0 ? -.16 : .16], [len, 0]] }
    }, m.m);
  }
  function smSw(s, a, e, L, a0, a1, r, d, ang, kb, b, m) {
    m = m || {};
    const len = s + a + e, gx = m.gx != null ? m.gx : 8, gy = m.gy != null ? m.gy : -16, hb = [];
    for (let i = 0; i < a; i++) {
      const t = a > 1 ? i / (a - 1) : 1, an = (a0 + (a1 - a0) * t) * smD2R, c = Math.cos(an), n = Math.sin(an);
      hb.push(smHb(s + i, s + i, gx + c * L, gy + n * L, r * .95, d + (m.sw || 0), ang, kb, b, Object.assign({ e: 's', sw: 1 }, m.h)));
      hb.push(smHb(s + i, s + i, gx + c * L * .55, gy + n * L * .55, r, d, ang, kb, b, Object.assign({ e: 's' }, m.h)));
    }
    return Object.assign({
      len, hb, L,
      pose: { h: [[0, 6, -15], [s - 1, gx - 3, gy + 1], [len - 2, gx, gy], [len, 6, -15]], wa: [[0, 60], [Math.max(0, s - 3), a0 - 18], [s, a0], [s + a - 1, a1], [s + a + 4, a1 - 8], [len, 70]], lean: [[0, 0], [s, .08], [s + a, .1], [len, 0]] }
    }, m.m);
  }
  function smSpn(s, a, e, R, d, ang, kb, b, m) {
    m = m || {};
    const len = s + a + e, h2 = Math.floor(a / 2), x2 = m.R2 || R * .85;
    return Object.assign({
      len,
      hb: [smHb(s, s + h2 - 1, R, -13, R * .55, d, ang, kb, b, m.h), smHb(s + h2, s + a - 1, -x2, -13, R * .5, d * .8, ang, kb * .9, b, Object.assign({ rev: 1 }, m.h))],
      pose: { f: [[0, 4, 0], [s, R - 3, -12], [s + h2, -R + 3, -12], [s + a, 4, -4], [len, 4, 0]], h: [[0, 6, -15], [s, R - 6, -18], [s + h2, -R + 6, -18], [len, 6, -15]], rot: [[0, 0], [s, 0], [s + a, 360], [len, 360]] }
    }, m.m);
  }
  function smAir(m, land, a0, a1) {
    m.air = 1; m.land = land; m.ac = [a0, a1];
    return m;
  }
  function smGr(s, a, e, x) {
    const len = s + a + e;
    return { len, gr: 1, hb: [smHb(s, s + a - 1, x, -14, 6.5, 0, 0, 0, 0, { gb: 1 })], pose: { h: [[0, 6, -15], [s - 2, 4, -18], [s, x - 3, -15], [s + a, x - 3, -15], [len, 6, -15]], h2: [[0, -2, -15], [s - 2, 2, -17], [s, x - 6, -13], [s + a, x - 6, -13], [len, -2, -15]], lean: [[0, 0], [s, .18], [len, 0]] } };
  }
  function smThr(dir, len, thf, d, ang, kb, b, rev) {
    const pose = { f: [[0, 4, 0], [len, 4, 0]], lean: [[0, 0], [thf - 5, dir === 'b' ? -.1 : .12], [thf + 3, dir === 'b' ? .15 : -.04], [len, 0]] };
    if (dir === 'f') pose.h = [[0, 8, -17], [thf - 4, 4, -18], [thf, 20, -17], [len, 6, -15]];
    else if (dir === 'b') { pose.h = [[0, 8, -17], [thf - 4, 6, -17], [thf, -18, -19], [len, 6, -15]]; pose.rot = [[0, 0], [thf - 4, 0], [thf + 4, -12], [len, 0]]; }
    else if (dir === 'u') pose.h = [[0, 8, -17], [thf - 4, 10, -22], [thf, 8, -40], [len, 6, -15]];
    else pose.h = [[0, 8, -17], [thf - 4, 10, -22], [thf, 14, -2], [len, 6, -15]];
    pose.h2 = pose.h;
    return { len, thr: 1, th: { f: thf, d, ang, kb, b, rev: rev ? 1 : 0, dir }, hb: [], pose };
  }
  const smPum = () => ({ len: 16, pum: 1, hb: [], pose: { h: [[0, 12, -17], [4, 17, -20], [8, 11, -17], [16, 8, -17]], h2: [[0, 12, -17], [4, 17, -20], [8, 11, -17], [16, 8, -17]] } });
  const smGup = (d, ang, kb, b, x) => ({
    len: 34, hb: [smHb(10, 13, x, -8, 8, d, ang, kb, b), smHb(14, 17, -x, -8, 8, d, 361, kb, b, { id: 1, rev: 1 })],
    fl: [{ f0: 0, f1: 12, k: 'inv' }], pose: { f: [[0, 4, 0], [10, x - 6, -6], [18, -x + 6, -6], [34, 4, 0]], rot: [[0, 0], [10, 0], [18, 0]], lean: [[0, 0]] }
  });
  const smLa = (d, ang, kb, b, x) => ({
    len: 42, hb: [smHb(14, 17, x, -10, 8, d, ang, kb, b)],
    fl: [{ f0: 0, f1: 16, k: 'inv' }], mv: [{ f0: 6, f1: 14, vx: 1.7 }], pose: { h: [[0, 6, -15], [12, x - 8, -14], [18, x - 8, -14], [42, 6, -15]], lean: [[0, 0], [14, .2], [42, 0]] }
  });
  const smPj = (o) => Object.assign({ x: 16, y: -16, vx: 2, vy: 0, g: 0, r: 4, d: 4, ang: 361, kb: 20, b: 10, life: 60, sz: 4, col: '#fff', sh: 'ball', bn: 0, pr: 0, e: 'n', sp: 1 }, o);

  function smBuild(spec, sz) {
    const M = Object.assign({ hb: [], pose: {}, mv: [], ev: [], fl: [], end: 'idle', land: 0 }, spec);
    M.hb = M.hb.map(h => Object.assign({}, h, { x: h.x * sz, y: h.y * sz, r: h.r * sz }));
    M.ev = M.ev.map(e => (e.k === 'proj' ? Object.assign({}, e, { p: Object.assign({}, e.p, { x: e.p.x * sz, y: e.p.y * sz }) }) : e));
    let rx = 0, st = 999, en = 0;
    for (const h of M.hb) { if (h.gb) { rx = Math.max(rx, (Math.abs(h.x) + h.r)); st = Math.min(st, h.f0); en = Math.max(en, h.f1); continue; } rx = Math.max(rx, Math.hypot(h.x, h.y + 10 * sz) + h.r); st = Math.min(st, h.f0); en = Math.max(en, h.f1); }
    for (const e of M.ev) if (e.k === 'proj') { rx = Math.max(rx, 160); st = Math.min(st, e.f); en = Math.max(en, e.f); }
    M.rx = rx; M.st = st === 999 ? M.len : st; M.en = en;
    if (M.air && !M.ac) M.ac = [0, 0];
    return M;
  }

  function smAdd(m, hb) {
    m.hb.push(hb);
    m.len = Math.max(m.len, hb.f1 + 6);
    return m;
  }
  const smSweet = (m, hb) => { m.hb.unshift(hb); return m; };
  function smBoth(m, f0, f1, x, y, r, d, ang, kb, b, o) {
    return smAdd(m, smHb(f0, f1, -x, y, r, d, ang, kb, b, Object.assign({ id: 1, rev: 1 }, o)));
  }
  function smMulti(m, f0, n, step, x, y, r, d, ang, kb, b, o, alt) {
    for (let i = 0; i < n; i++) m.hb.push(smHb(f0 + i * step, f0 + i * step + 1, alt && i % 2 ? -x : x, y, r, d, ang, kb, b, Object.assign({ id: 10 + i, rev: alt && i % 2 ? 1 : 0 }, o)));
    return m;
  }
  const smCx = (m, f0, f1, to) => { m.cx = { f0, f1, to }; return m; };
  const smCf = (m, cf) => { m.cf = cf; m.sm = 1; return m; };
  const smPz = (f0, f1, x1, y1, x2, y2, len, track) => [[0, 6, -15], [f0, x1, y1], [f1, x2, y2], [len, 6, -15]];

  function smMkSp(len, o) { return Object.assign({ len, hb: [], pose: {}, ev: [], mv: [], fl: [] }, o); }

  function smEmberKit() {
    const F = { e: 'f' }, FS = { e: 'f', sp: 2 };
    const mv = {
      jab1: smCx(smP(3, 2, 9, 15, -15, 6.5, 2.5, 361, 25, 8), 6, 15, 'jab2'),
      jab2: smCx(smP(3, 2, 10, 16, -14, 6.5, 2.5, 361, 25, 10), 7, 16, 'jab3'),
      jab3: smK(5, 3, 18, 19, -9, 7.5, 4.5, 361, 72, 14),
      ftilt: smK(8, 3, 16, 22, -12, 7, 8, 361, 80, 18),
      utilt: smP(7, 5, 15, 4, -33, 8.5, 6, 100, 95, 18),
      dtilt: smK(6, 3, 12, 23, -3, 6.5, 5.5, 80, 60, 14),
      dash: smK(8, 9, 22, 15, -9, 8, 8, 361, 72, 28, { m: { mv: [{ f0: 0, f1: 0, vx: 1.9 }] } }),
      fsmash: smCf(smP(15, 4, 26, 25, -16, 9, 15, 361, 100, 28, { h: FS }), 12),
      usmash: smCf(smP(11, 5, 28, 5, -37, 10, 14, 90, 105, 30, { h: FS }), 8),
      dsmash: smBoth(smCf(smK(9, 3, 25, 24, -4, 9, 13, 28, 95, 24, { h: FS }), 6), 14, 17, 24, -4, 9, 13, 28, 95, 24, FS),
      nair: smAir(smSpn(4, 13, 9, 15, 7, 361, 55, 12, { h: F }), 7, 3, 19),
      fair: smAir(smP(8, 3, 19, 23, -17, 8.5, 11, 361, 88, 20, { h: FS }), 9, 3, 24),
      bair: smAir(smK(6, 3, 17, -23, -13, 8, 10, 361, 85, 18, { h: { rev: 1, sp: 2 } }), 8, 3, 20),
      uair: smAir(smK(5, 4, 15, 6, -41, 8, 8, 85, 80, 20), 8, 3, 18),
      dair: smAir(smK(10, 4, 23, 3, 3, 8, 11, 285, 55, 25, { h: FS }), 14, 3, 28),
      gup: smGup(7, 361, 60, 30, 16), lat: smLa(8, 361, 70, 30, 20)
    };
    const sp = {
      n: smMkSp(36, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [7, 1, -16], [12, 19, -16], [24, 19, -16], [36, 6, -15]], h2: [[0, -2, -15], [7, 0, -16], [12, 15, -15], [36, -2, -15]] }, ev: [{ f: 12, k: 'proj', p: smPj({ x: 17, y: -15, vx: 2.3, vy: 0, g: .045, r: 4.5, d: 5, ang: 361, kb: 15, b: 14, life: 110, sz: 5, col: '#fb923c', sh: 'fire', bn: 3, e: 'f' }) }] }),
      s: smMkSp(44, { air: 1, ai: 'dash', hb: [smHb(10, 25, 14, -14, 8.5, 9, 45, 85, 30, { e: 'f', sp: 2 })], mv: [{ f0: 0, f1: 9, vx: 0, vy: 0 }, { f0: 10, f1: 25, vx: 2.9, vy: 0 }], fl: [{ f0: 0, f1: 9, k: 'nf' }, { f0: 10, f1: 25, k: 'ng' }], end: 'fall', pose: { h: [[0, 6, -15], [8, -4, -18], [10, 18, -16], [26, 18, -16], [44, 6, -15]], lean: [[0, 0], [10, .3], [26, .3], [44, 0]] } }),
      u: smMkSp(52, { air: 1, ai: 'rise', end: 'help', land: 26, hb: [smHb(4, 5, 8, -26, 8, 2.2, 80, 12, 8, { id: 0, e: 'f' }), smHb(8, 9, 8, -30, 8, 2.2, 80, 12, 8, { id: 1, e: 'f' }), smHb(12, 13, 8, -34, 8, 2.2, 80, 12, 8, { id: 2, e: 'f' }), smHb(16, 19, 6, -40, 9, 11, 84, 100, 30, { id: 3, e: 'f', sp: 2 })], mv: [{ f0: 0, f1: 3, vx: 0, vy: 0 }, { f0: 4, f1: 22, vy: -2.9, vx: .3 }], fl: [{ f0: 3, f1: 12, k: 'inv' }, { f0: 4, f1: 24, k: 'st' }], pose: { h: [[0, 6, -15], [3, 2, -18], [4, 8, -36], [22, 8, -42], [52, 6, -15]], lean: [[0, 0], [4, -.1], [52, 0]] } }),
      d: (() => { const m = smMkSp(50, { air: 1, ai: 'def', pose: { f: [[0, 4, 0], [5, 12, -8], [30, 12, -8], [50, 4, 0]], rot: [[0, 0], [5, 0], [29, 720], [30, 720], [50, 720]], h: [[0, 6, -15], [6, 12, -15], [30, 12, -15], [50, 6, -15]] } }); smMulti(m, 6, 5, 4, 14, -11, 10, 1.6, 361, 12, 6, { e: 'f' }, true); m.hb.push(smHb(28, 31, 16, -10, 11, 5, 70, 80, 30, { id: 30, e: 'f', sp: 2 })); m.fl = [{ f0: 0, f1: 32, k: 'nf' }, { f0: 5, f1: 30, k: 'st' }]; return m; })()
    };
    const th = { f: smThr('f', 34, 12, 7, 45, 70, 38), b: smThr('b', 40, 16, 8, 42, 74, 40, true), u: smThr('u', 36, 13, 6, 92, 72, 36), d: smThr('d', 34, 11, 5, 80, 32, 38) };
    return { mv, sp, th, gr: smGr(7, 3, 23, 19), jabs: 3 };
  }

  function smSableKit() {
    const SS = { sp: 2 };
    const mv = {
      jab1: smCx(smSw(4, 2, 9, 19, -20, 30, 5.5, 2.5, 361, 25, 8), 6, 15, 'jab2'),
      jab2: smCx(smSw(4, 2, 10, 20, 25, -25, 5.5, 3, 361, 25, 10), 7, 16, 'jab3'),
      jab3: smSw(6, 3, 19, 22, -70, 40, 6, 5, 361, 72, 14),
      ftilt: smSw(9, 3, 19, 25, -35, 25, 6, 8, 361, 80, 20, { sw: 2 }),
      utilt: smSw(8, 6, 16, 22, -10, -170, 6, 7, 95, 90, 20),
      dtilt: smSw(7, 3, 14, 24, 15, 5, 5.5, 6, 75, 60, 16),
      dash: smSw(8, 6, 24, 23, -30, 20, 6, 9, 361, 70, 28, { m: { mv: [{ f0: 0, f1: 0, vx: 1.9 }] } }),
      fsmash: smCf(smSw(15, 4, 28, 27, -90, 40, 7, 16, 361, 100, 28, { sw: 3, h: SS }), 12),
      usmash: smCf(smSw(12, 8, 28, 25, 10, -170, 7, 14, 90, 105, 28, { sw: 2, h: SS }), 9),
      dsmash: smBoth(smCf(smSw(9, 3, 26, 26, 20, 5, 6.5, 12, 28, 95, 24, { h: SS }), 6), 15, 18, 26, -8, 7, 12, 28, 95, 24, { e: 's', sp: 2 }),
      nair: smAir(smSw(5, 11, 13, 21, 0, 340, 6, 7, 361, 55, 12), 7, 3, 20),
      fair: smAir(smSw(8, 4, 20, 26, -80, 35, 6.5, 10, 361, 85, 20, { sw: 2 }), 9, 3, 25),
      bair: smAir(smSw(7, 4, 18, 25, 210, 150, 6.5, 10, 361, 85, 18, { sw: 2, h: { rev: 1 } }), 8, 3, 21),
      uair: smAir(smSw(6, 5, 17, 23, 20, -140, 6, 8, 85, 80, 20), 8, 3, 20),
      dair: smAir(smSw(10, 4, 24, 23, 40, 120, 6.5, 11, 285, 55, 25, { sw: 2 }), 14, 3, 28),
      gup: smGup(7, 361, 60, 30, 18), lat: smLa(8, 361, 70, 30, 22)
    };
    const sp = {
      n: smMkSp(38, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [8, 2, -22], [14, 14, -16], [38, 6, -15]], wa: [[0, 60], [8, -60], [14, 0], [24, 0], [38, 70]] }, ev: [{ f: 14, k: 'proj', p: smPj({ x: 26, y: -16, vx: 5.2, r: 3.5, d: 6, ang: 361, kb: 40, b: 22, life: 26, sz: 6, col: '#fde68a', sh: 'beam', e: 's' }) }] }),
      s: smMkSp(46, { air: 1, ai: 'dash', hb: [smHb(12, 23, 24, -14, 8.5, 10, 361, 85, 30, { e: 's', sp: 2 })], mv: [{ f0: 0, f1: 11, vx: 0, vy: 0 }, { f0: 12, f1: 23, vx: 3.2, vy: 0 }], fl: [{ f0: 0, f1: 11, k: 'nf' }, { f0: 12, f1: 23, k: 'ng' }], end: 'fall', pose: { h: [[0, 6, -15], [12, 8, -16], [46, 6, -15]], wa: [[0, 60], [8, -80], [12, -50], [24, 40], [34, 50], [46, 70]], lean: [[0, 0], [12, .3], [24, .3], [46, 0]] } }),
      u: (() => { const m = smMkSp(56, { air: 1, ai: 'rise', end: 'help', land: 24, pose: { h: [[0, 6, -15], [4, 6, -22], [50, 6, -22], [56, 6, -15]], wa: [[0, 60], [5, -90], [56, -90]], rot: [[0, 0], [6, 0], [30, 1080], [56, 1080]] } }); smMulti(m, 5, 4, 5, 18, -14, 8, 2, 361, 15, 8, { e: 's' }, true); m.hb.push(smHb(26, 31, 12, -34, 9, 7, 84, 90, 25, { id: 30, e: 's', sp: 2 })); m.mv = [{ f0: 0, f1: 4, vx: 0, vy: 0 }, { f0: 5, f1: 28, vy: -2.7, vx: .4 }]; m.fl = [{ f0: 5, f1: 30, k: 'st' }]; return m; })(),
      d: smMkSp(50, { air: 1, ai: 'counter', ctr: { d: 1.3, min: 10, ang: 361, kb: 100, b: 30 }, fl: [{ f0: 5, f1: 27, k: 'ctr' }, { f0: 0, f1: 30, k: 'nf' }], mv: [{ f0: 0, f1: 30, vy: 0, gs: 0 }], pose: { h: [[0, 6, -15], [4, 4, -20], [30, 4, -20], [50, 6, -15]], wa: [[0, 60], [4, -110], [27, -110], [34, 20], [50, 70]], lean: [[0, 0], [5, -.12], [27, -.12], [50, 0]] } })
    };
    const th = { f: smThr('f', 36, 13, 7, 42, 72, 38), b: smThr('b', 42, 17, 9, 40, 76, 40, true), u: smThr('u', 38, 14, 6, 92, 74, 36), d: smThr('d', 34, 11, 5, 80, 32, 38) };
    return { mv, sp, th, gr: smGr(8, 3, 24, 20), jabs: 3 };
  }

  function smGraniteKit() {
    const H = { sp: 2 };
    const mv = {
      jab1: smCx(smP(5, 2, 12, 14, -15, 8, 3, 361, 30, 10), 8, 18, 'jab2'),
      jab2: smP(5, 3, 17, 15, -14, 8.5, 5, 361, 62, 16),
      ftilt: smP(12, 4, 20, 21, -15, 10, 11, 361, 95, 22, { h: H }),
      utilt: smP(10, 6, 20, 6, -34, 10, 9, 95, 95, 22),
      dtilt: smK(8, 4, 16, 22, -3, 8, 8, 80, 70, 18),
      dash: smP(10, 10, 28, 16, -14, 10, 12, 361, 80, 35, { m: { mv: [{ f0: 0, f1: 0, vx: 1.7 }] }, h: H }),
      fsmash: smCf(smP(20, 5, 36, 26, -16, 11, 21, 361, 105, 32, { h: H }), 16),
      usmash: smCf(smP(16, 6, 36, 6, -38, 12, 19, 90, 108, 32, { h: H }), 12),
      dsmash: smBoth(smCf(smK(14, 4, 34, 24, -5, 10.5, 17, 28, 100, 28, { h: H }), 10), 20, 23, 24, -5, 10.5, 17, 28, 100, 28, H),
      nair: smAir(smSpn(6, 14, 14, 16, 9, 361, 50, 12, { h: H }), 12, 4, 24),
      fair: smAir(smP(12, 4, 24, 24, -17, 10, 15, 361, 95, 28, { h: H }), 14, 4, 30),
      bair: smAir(smK(10, 4, 22, -24, -14, 9, 14, 361, 90, 24, { h: { rev: 1, sp: 2 } }), 12, 4, 26),
      uair: smAir(smP(9, 5, 20, 6, -40, 10, 12, 88, 90, 22), 12, 4, 24),
      dair: smAir(smP(14, 5, 32, 4, 2, 10, 16, 285, 60, 25, { h: H }), 20, 4, 36),
      gup: smGup(9, 361, 65, 32, 20), lat: smLa(10, 361, 75, 32, 24)
    };
    const sp = {
      n: smMkSp(58, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [8, 4, -36], [20, 12, -34], [30, 18, -26], [58, 6, -15]], h2: [[0, -2, -15], [8, 2, -34], [20, 10, -32], [58, -2, -15]], lean: [[0, 0], [12, -.1], [22, .14], [58, 0]] }, ev: [{ f: 22, k: 'proj', p: smPj({ x: 12, y: -26, vx: 1.6, vy: -1.7, g: .115, r: 8, d: 11, ang: 50, kb: 90, b: 25, life: 150, sz: 9, col: '#9a8f7e', sh: 'rock', bn: 1, sp: 2 }) }] }),
      s: smMkSp(58, { air: 1, ai: 'dash', hb: [smHb(14, 28, 14, -13, 11, 13, 40, 95, 30, { sp: 2 })], mv: [{ f0: 0, f1: 13, vx: 0, vy: 0 }, { f0: 14, f1: 28, vx: 2.4, vy: 0 }], fl: [{ f0: 0, f1: 13, k: 'nf' }, { f0: 6, f1: 30, k: 'arm' }, { f0: 14, f1: 28, k: 'ng' }], end: 'fall', pose: { h: [[0, 6, -15], [12, 2, -18], [14, 14, -17], [58, 6, -15]], h2: [[0, -2, -15], [14, 12, -15], [58, -2, -15]], lean: [[0, 0], [12, -.1], [14, .35], [30, .35], [58, 0]] } }),
      u: (() => { const m = smMkSp(76, { air: 1, ai: 'rise', end: 'help', land: 30, pose: { h: [[0, 6, -15], [6, 16, -20], [60, 16, -20], [76, 6, -15]], h2: [[0, -2, -15], [6, -16, -20], [60, -16, -20], [76, -2, -15]], rot: [[0, 0], [8, 0], [44, 1440], [76, 1440]] } }); smMulti(m, 8, 8, 4, 14, -13, 11, 1.7, 361, 8, 6, {}, true); m.hb.push(smHb(42, 47, 12, -24, 12, 7, 85, 95, 28, { id: 30, sp: 2 })); m.mv = [{ f0: 0, f1: 7, vx: 0, vy: 0 }, { f0: 8, f1: 42, vy: -1.35, vx: 0 }]; m.fl = [{ f0: 8, f1: 44, k: 'st' }, { f0: 8, f1: 44, k: 'ng' }]; return m; })(),
      d: smMkSp(66, { air: 1, ai: 'slam', end: 'idle', dv: { f0: 14, f1: 40, to: 42 }, hb: [smHb(14, 40, 0, 2, 11, 14, 285, 60, 28, { id: 0, sp: 2, air: 1 }), smHb(42, 47, 0, -2, 22, 10, 80, 85, 24, { id: 1, sp: 2 })], mv: [{ f0: 0, f1: 13, vx: 0, vy: 0 }, { f0: 14, f1: 40, vy: 5.2, vx: 0 }], fl: [{ f0: 0, f1: 13, k: 'ng' }, { f0: 0, f1: 13, k: 'nf' }], pose: { h: [[0, 6, -15], [12, 10, -42], [14, 8, -2], [42, 8, -2], [66, 6, -15]], h2: [[0, -2, -15], [12, -4, -42], [14, 6, -2], [42, 6, -2], [66, -2, -15]], f: [[0, 4, 0], [13, 4, -10], [14, 4, 2], [66, 4, 0]], lean: [[0, 0], [14, .35], [42, .1], [66, 0]] } })
    };
    const th = { f: smThr('f', 42, 16, 10, 42, 70, 40), b: smThr('b', 46, 20, 12, 40, 76, 42, true), u: smThr('u', 42, 16, 8, 92, 72, 38), d: smThr('d', 40, 14, 7, 80, 30, 40) };
    return { mv, sp, th, gr: smGr(9, 3, 28, 22), jabs: 2 };
  }

  function smZephyrKit() {
    const mv = {
      jab1: smCx(smP(2, 2, 7, 13, -15, 6, 1.4, 361, 15, 6), 4, 12, 'jab2'),
      jab2: smCx(smK(2, 2, 8, 15, -10, 6, 1.4, 361, 15, 6), 4, 12, 'jab3'),
      jab3: smP(3, 2, 14, 16, -14, 6.5, 3.5, 361, 60, 12),
      ftilt: smK(6, 3, 13, 20, -11, 6.5, 6, 361, 75, 15),
      utilt: smK(5, 4, 14, 6, -32, 7.5, 5, 95, 85, 16),
      dtilt: smK(4, 3, 10, 21, -3, 6, 4.5, 78, 55, 12),
      dash: smK(6, 8, 18, 13, -9, 7, 6, 361, 65, 25, { m: { mv: [{ f0: 0, f1: 0, vx: 2.3 }] } }),
      fsmash: smCf(smK(11, 4, 22, 24, -12, 8, 12, 361, 92, 25, { h: { sp: 2 } }), 8),
      usmash: smCf(smK(9, 5, 24, 4, -38, 9, 12, 90, 100, 25, { h: { sp: 2 } }), 6),
      dsmash: smBoth(smCf(smK(7, 3, 22, 22, -4, 8, 11, 28, 90, 22, { h: { sp: 2 } }), 5), 12, 15, 22, -4, 8, 11, 28, 90, 22, { sp: 2 }),
      nair: (() => { const m = smAir(smSpn(3, 18, 8, 15, 2.2, 361, 30, 8), 6, 3, 21); m.hb = []; smMulti(m, 3, 4, 4, 14, -12, 8, 2.1, 361, 20, 8, {}, true); m.hb.push(smHb(19, 21, 15, -12, 9, 4.5, 361, 70, 14, { id: 40, sp: 2 })); return m; })(),
      fair: smAir(smK(6, 3, 16, 20, -14, 7, 8, 361, 70, 22), 7, 3, 20),
      bair: smAir(smK(5, 3, 14, -22, -12, 7.5, 10, 361, 85, 20, { h: { rev: 1, sp: 2 } }), 7, 3, 18),
      uair: smAir(smK(4, 3, 13, 5, -39, 7.5, 6, 85, 75, 18), 6, 3, 16),
      dair: (() => { const m = smAir(smK(6, 14, 8, 2, 2, 8, 2, 90, 10, 6), 10, 3, 24); m.hb = []; smMulti(m, 6, 4, 3, 2, 1, 8, 1.8, 90, 15, 6, {}, false); m.hb.push(smHb(19, 21, 2, 2, 9, 3.5, 285, 55, 24, { id: 40, sp: 2 })); return m; })(),
      gup: smGup(6, 361, 55, 28, 15), lat: smLa(7, 361, 65, 28, 18)
    };
    const sp = {
      n: smMkSp(40, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [6, 12, -16], [10, 17, -16], [32, 17, -16], [40, 6, -15]], h2: [[0, -2, -15], [8, 8, -15], [40, -2, -15]] }, ev: [10, 16, 22].map(f => ({ f, k: 'proj', p: smPj({ x: 19, y: -16, vx: 6.2, r: 2.6, d: 2.5, ang: 361, kb: 0, b: 8, life: 34, sz: 3, col: '#fde047', sh: 'bolt', e: 'z', sp: 0 }) })) }),
      s: smMkSp(44, { air: 1, ai: 'dash', hb: [smHb(9, 17, 12, -12, 8, 6, 361, 40, 22, { e: 'f' })], mv: [{ f0: 0, f1: 7, vx: 0, vy: 0 }, { f0: 8, f1: 17, vx: 4.4, vy: 0 }], fl: [{ f0: 0, f1: 7, k: 'nf' }, { f0: 8, f1: 17, k: 'ng' }, { f0: 2, f1: 17, k: 'inv' }], end: 'fall', pose: { f: [[0, 4, 0], [8, -6, -4], [9, 16, -8], [44, 4, 0]], h: [[0, 6, -15], [9, -4, -14], [44, 6, -15]], lean: [[0, 0], [8, .1], [9, .4], [18, .4], [44, 0]] } }),
      u: smMkSp(60, { air: 1, ai: 'rise', end: 'help', land: 28, dirv: { f0: 24, f1: 54, sp: 3.5 }, ev: [{ f: 23, k: 'dir' }], hb: [smHb(0, 19, 8, -12, 12, 1.5, 361, 10, 6, { id: 0, e: 'f', rh: 5 }), smHb(24, 54, 10, -14, 11, 11, 361, 100, 28, { id: 1, e: 'f', sp: 2, rh: 99 })], mv: [{ f0: 0, f1: 23, vx: 0, vy: 0 }], fl: [{ f0: 0, f1: 23, k: 'nf' }, { f0: 0, f1: 23, k: 'ng' }, { f0: 24, f1: 54, k: 'ng' }], pose: { h: [[0, 6, -15], [20, 10, -22], [60, 10, -22]], h2: [[0, -2, -15], [20, -8, -22], [60, -8, -22]], lean: [[0, 0], [24, .45], [54, .45], [60, 0]], rot: [[0, 0], [60, 0]] } }),
      d: smMkSp(48, { air: 1, ai: 'def', rfl: 1, hb: [smHb(2, 5, 8, -12, 12, 3, 90, 40, 20, { e: 'z' })], fl: [{ f0: 2, f1: 30, k: 'rfl' }, { f0: 0, f1: 40, k: 'nf' }, { f0: 0, f1: 28, k: 'ng' }], mv: [{ f0: 0, f1: 28, vy: 0, vx: 0 }], pose: { h: [[0, 6, -15], [2, 12, -14], [30, 12, -14], [48, 6, -15]], h2: [[0, -2, -15], [2, 8, -14], [30, 8, -14], [48, -2, -15]], lean: [[0, 0], [30, .1], [48, 0]] } })
    };
    const th = { f: smThr('f', 28, 10, 5, 45, 68, 36), b: smThr('b', 32, 13, 7, 40, 74, 38, true), u: smThr('u', 30, 11, 5, 92, 70, 36), d: smThr('d', 28, 9, 4, 80, 32, 36) };
    return { mv, sp, th, gr: smGr(6, 3, 20, 18), jabs: 3 };
  }

  function smVexKit() {
    const M = { e: 'm' }, MS = { e: 'm', sp: 2 };
    const mv = {
      jab1: smCx(smP(5, 2, 12, 17, -16, 6, 2.5, 361, 20, 10, { h: M }), 8, 17, 'jab2'),
      jab2: smP(5, 2, 14, 18, -16, 6.5, 3.5, 361, 55, 12, { h: M }),
      ftilt: smSw(10, 3, 22, 22, -25, 15, 6, 8, 361, 80, 18, { gx: 6 }),
      utilt: smP(9, 6, 18, 4, -36, 9, 7, 100, 90, 20, { h: M }),
      dtilt: smK(8, 3, 16, 22, -4, 6.5, 6, 75, 60, 14),
      dash: smP(9, 8, 26, 17, -14, 8, 8, 361, 70, 26, { h: M, m: { mv: [{ f0: 0, f1: 0, vx: 1.5 }] } }),
      fsmash: smCf(smSw(18, 5, 32, 27, -60, 30, 8, 15, 361, 100, 26, { gx: 6, h: MS }), 14),
      usmash: smCf(smP(14, 6, 34, 6, -38, 11, 14, 90, 100, 28, { h: MS }), 11),
      dsmash: smBoth(smCf(smP(12, 4, 32, 21, -5, 9, 12, 28, 92, 24, { h: MS }), 8), 18, 21, 21, -5, 9, 12, 28, 92, 24, MS),
      nair: smAir(smSpn(5, 16, 12, 17, 7, 361, 50, 14, { h: M }), 8, 3, 22),
      fair: smAir(smSw(10, 3, 22, 24, -50, 20, 6.5, 10, 361, 85, 20, { gx: 6 }), 10, 3, 24),
      bair: smAir(smP(8, 3, 19, -22, -17, 8, 10, 361, 85, 18, { h: { rev: 1, e: 'm', sp: 2 } }), 9, 3, 22),
      uair: smAir(smP(7, 4, 18, 5, -41, 9, 8, 85, 80, 20, { h: M }), 9, 3, 20),
      dair: smAir(smP(11, 4, 26, 3, 3, 8.5, 11, 285, 55, 22, { h: MS }), 14, 3, 30),
      gup: smGup(6, 361, 55, 28, 16), lat: smLa(7, 361, 65, 28, 20)
    };
    const sp = {
      n: smMkSp(46, { air: 1, ai: 'proj', chg: { f: 14, max: 66, e: 'chg' }, pose: { h: [[0, 6, -15], [8, 8, -22], [14, 16, -20], [26, 18, -18], [46, 6, -15]], h2: [[0, -2, -15], [8, 6, -22], [14, 12, -20], [46, -2, -15]], lean: [[0, 0], [14, -.1], [26, .1], [46, 0]] }, ev: [{ f: 26, k: 'proj', ch: 1, p: smPj({ x: 20, y: -18, vx: 3.2, r: 4, d: 4, ang: 361, kb: 20, b: 12, life: 90, sz: 5, col: '#22d3ee', sh: 'orb', pr: 0, e: 'm', sp: 1 }) }] }),
      s: smMkSp(40, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [6, 4, -22], [14, 18, -18], [40, 6, -15]], h2: [[0, -2, -15], [8, 6, -20], [40, -2, -15]] }, ev: [{ f: 14, k: 'proj', p: smPj({ x: 18, y: -18, vx: 1.9, r: 4.5, d: 7, ang: 361, kb: 55, b: 24, life: 150, sz: 5.5, col: '#e879f9', sh: 'orb', hom: .06, e: 'm', sp: 2 }) }] }),
      u: smMkSp(58, { air: 1, ai: 'tele', end: 'help', land: 20, ev: [{ f: 12, k: 'tp', dist: 62 }], hb: [smHb(2, 11, 0, -12, 14, 1, 361, 0, 0, { id: 0, e: 'm', nohit: 1 }), smHb(14, 17, 0, -12, 13, 4, 80, 60, 20, { id: 1, e: 'm' })], fl: [{ f0: 3, f1: 22, k: 'inv' }, { f0: 0, f1: 22, k: 'ng' }, { f0: 0, f1: 22, k: 'nf' }], mv: [{ f0: 0, f1: 22, vx: 0, vy: 0 }], pose: { h: [[0, 6, -15], [4, 8, -30], [12, 8, -30], [24, 12, -20], [58, 6, -15]], h2: [[0, -2, -15], [4, -6, -30], [12, -6, -30], [58, -2, -15]], sq: [[0, 1], [4, .1], [11, .1], [13, 1.15], [20, 1], [58, 1]] } }),
      d: smMkSp(56, { air: 1, ai: 'def', rfl: 1, hb: [smHb(3, 8, 0, -13, 17, 3, 361, 55, 20, { e: 'm' })], fl: [{ f0: 3, f1: 30, k: 'rfl' }, { f0: 0, f1: 40, k: 'nf' }], pose: { h: [[0, 6, -15], [3, 14, -20], [32, 14, -20], [56, 6, -15]], h2: [[0, -2, -15], [3, -14, -20], [32, -14, -20], [56, -2, -15]] } })
    };
    const th = { f: smThr('f', 34, 12, 6, 45, 66, 38), b: smThr('b', 38, 15, 7, 42, 72, 38, true), u: smThr('u', 36, 13, 5, 92, 70, 36), d: smThr('d', 34, 11, 4, 80, 30, 38) };
    return { mv, sp, th, gr: smGr(8, 3, 24, 19), jabs: 2 };
  }

  function smBrambleKit() {
    const mv = {
      jab1: smCx(smP(6, 2, 12, 24, -16, 5, 2.2, 361, 20, 8), 9, 18, 'jab2'),
      jab2: smP(6, 2, 15, 26, -16, 5.5, 3.5, 361, 55, 12),
      ftilt: smSweet(smP(10, 3, 22, 30, -15, 5, 7, 361, 80, 18), smHb(10, 12, 38, -15, 4, 9, 361, 90, 20, { id: 0 })),
      utilt: smP(9, 6, 20, 6, -42, 7, 7, 95, 90, 20),
      dtilt: smK(8, 3, 16, 28, -3, 5, 5, 75, 60, 14),
      dash: smK(8, 9, 24, 19, -6, 7, 8, 361, 70, 28, { m: { mv: [{ f0: 0, f1: 0, vx: 1.8 }] } }),
      fsmash: smSweet(smCf(smP(18, 4, 34, 36, -16, 6.5, 15, 361, 98, 28, { h: { sp: 2 } }), 14), smHb(18, 21, 45, -16, 5, 17, 361, 105, 30, { id: 0, sp: 2 })),
      usmash: smCf(smP(14, 5, 32, 5, -50, 8, 14, 90, 100, 28, { h: { sp: 2 } }), 11),
      dsmash: smBoth(smCf(smK(10, 3, 32, 30, -3, 6.5, 12, 28, 92, 24, { h: { sp: 2 } }), 7), 16, 19, 30, -3, 6.5, 12, 28, 92, 24, { sp: 2 }),
      nair: smAir(smSpn(5, 14, 14, 20, 7, 361, 50, 12), 8, 3, 21),
      fair: smAir(smP(9, 3, 22, 28, -18, 6, 9, 361, 80, 20), 9, 3, 24),
      bair: smAir(smP(8, 3, 20, -29, -14, 6, 9, 361, 82, 18, { h: { rev: 1 } }), 9, 3, 22),
      uair: smAir(smP(7, 4, 18, 6, -46, 7, 8, 85, 80, 18), 9, 3, 20),
      dair: smAir(smP(11, 3, 26, 3, 7, 6.5, 10, 285, 55, 22), 14, 3, 28),
      gup: smGup(7, 361, 55, 28, 18), lat: smLa(8, 361, 65, 28, 24)
    };
    const sp = {
      n: smMkSp(44, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [8, 4, -22], [14, 16, -18], [44, 6, -15]], h2: [[0, -2, -15], [10, 8, -16], [44, -2, -15]] }, ev: [{ f: 14, k: 'proj', p: smPj({ x: 18, y: -18, vx: 3, vy: -1.2, g: .08, r: 3, d: 3, ang: 361, kb: 10, b: 10, life: 80, sz: 3.5, col: '#a3e635', sh: 'seed', bn: 1, sp: 0 }) }, { f: 18, k: 'proj', p: smPj({ x: 18, y: -18, vx: 3.4, vy: -.6, g: .08, r: 3, d: 3, ang: 361, kb: 10, b: 10, life: 80, sz: 3.5, col: '#a3e635', sh: 'seed', bn: 1, sp: 0 }) }, { f: 22, k: 'proj', p: smPj({ x: 18, y: -18, vx: 3.8, vy: 0, g: .08, r: 3, d: 3, ang: 361, kb: 10, b: 10, life: 80, sz: 3.5, col: '#a3e635', sh: 'seed', bn: 1, sp: 0 }) }] }),
      s: smMkSp(46, { air: 1, ai: 'proj', hb: [smHb(14, 17, 34, -15, 6, 9, 361, 85, 25, { sp: 2 }), smHb(14, 17, 46, -15, 5, 11, 361, 92, 26, { id: 0, sp: 2 })], pose: { h: [[0, 6, -15], [8, -2, -20], [13, 4, -18], [14, 40, -15], [19, 40, -15], [46, 6, -15]], lean: [[0, 0], [10, -.12], [14, .18], [46, 0]] } }),
      u: smMkSp(52, { air: 1, ai: 'tether', end: 'help', land: 24, ev: [{ f: 12, k: 'tether', r: 70 }], hb: [smHb(10, 20, 14, -34, 6, 5, 90, 60, 20, { e: 'n' })], mv: [{ f0: 0, f1: 11, vx: 0, vy: 0 }], fl: [{ f0: 0, f1: 11, k: 'ng' }], pose: { h: [[0, 6, -15], [8, 4, -24], [12, 22, -50], [30, 22, -50], [52, 6, -15]], lean: [[0, 0], [12, .1], [52, 0]] } }),
      d: smMkSp(40, { air: 1, ai: 'trap', ev: [{ f: 14, k: 'plant' }], pose: { h: [[0, 6, -15], [8, 8, -8], [14, 12, 0], [26, 12, 0], [40, 6, -15]], lean: [[0, 0], [14, .2], [30, .2], [40, 0]], hip: [[0, 0], [10, 4], [30, 4], [40, 0]] } })
    };
    const th = { f: smThr('f', 36, 13, 6, 45, 66, 36), b: smThr('b', 40, 16, 7, 42, 72, 38, true), u: smThr('u', 38, 14, 5, 92, 70, 36), d: smThr('d', 34, 12, 4, 80, 30, 38) };
    return { mv, sp, th, gr: smGr(9, 3, 26, 28), jabs: 2 };
  }

  function smTempoKit() {
    const mv = {
      jab1: smCx(smSw(5, 2, 10, 17, -20, 25, 5, 3, 361, 25, 10), 8, 17, 'jab2'),
      jab2: smSw(5, 2, 12, 18, 25, -20, 5, 3.5, 361, 55, 12),
      ftilt: smSw(9, 3, 19, 23, -30, 20, 6, 9, 361, 82, 20),
      utilt: smSw(8, 5, 17, 19, -10, -160, 6, 8, 95, 90, 20),
      dtilt: smSw(7, 3, 15, 22, 20, 10, 5.5, 6, 78, 60, 16),
      dash: smP(9, 8, 24, 16, -14, 8, 9, 361, 75, 28, { m: { mv: [{ f0: 0, f1: 0, vx: 1.6 }] } }),
      fsmash: smCf(smSw(16, 4, 30, 27, -80, 40, 7, 16, 361, 100, 28, { sw: 2, h: { sp: 2 } }), 13),
      usmash: smCf(smSw(13, 7, 30, 23, 20, -160, 7, 14, 90, 105, 28, { sw: 2, h: { sp: 2 } }), 10),
      dsmash: smBoth(smCf(smSw(10, 3, 30, 25, 20, 5, 6.5, 12, 28, 95, 24, { h: { sp: 2 } }), 7), 16, 19, 25, -8, 7, 12, 28, 95, 24, { e: 's', sp: 2 }),
      nair: smAir(smSpn(6, 12, 12, 20, 7, 361, 50, 12, { h: { e: 's' } }), 9, 3, 20),
      fair: smAir(smSw(11, 4, 22, 25, -60, 30, 6, 11, 361, 85, 22, { sw: 2 }), 11, 3, 26),
      bair: smAir(smK(7, 3, 17, -22, -13, 7.5, 9, 361, 82, 18, { h: { rev: 1 } }), 9, 3, 20),
      uair: smAir(smSw(7, 5, 18, 21, 10, -150, 6, 8, 85, 78, 18), 10, 3, 22),
      dair: smAir(smSw(12, 4, 26, 22, 80, 100, 6, 12, 285, 55, 25, { sw: 2 }), 15, 3, 30),
      gup: smGup(7, 361, 58, 30, 17), lat: smLa(8, 361, 68, 30, 22)
    };
    const sp = {
      n: smMkSp(52, { air: 1, ai: 'proj', chg: { f: 12, max: 48, e: 'chg' }, pose: { h: [[0, 6, -15], [6, 18, -17], [12, 20, -17], [30, 20, -17], [52, 6, -15]], h2: [[0, -2, -15], [8, 4, -17], [12, -6, -17], [30, -8, -17], [52, -2, -15]], lean: [[0, 0], [12, -.08], [30, -.08], [52, 0]] }, ev: [{ f: 24, k: 'proj', ch: 1, p: smPj({ x: 22, y: -17, vx: 5.4, r: 2.8, d: 5, ang: 361, kb: 25, b: 16, life: 50, sz: 7, col: '#fde68a', sh: 'arrow', pr: 0, e: 'n', sp: 1 }) }] }),
      s: smMkSp(40, { air: 1, ai: 'proj', pose: { h: [[0, 6, -15], [6, 2, -26], [14, 18, -18], [40, 6, -15]], lean: [[0, 0], [8, -.1], [14, .12], [40, 0]] }, ev: [{ f: 14, k: 'proj', p: smPj({ x: 16, y: -18, vx: 3.6, r: 4.5, d: 6, ang: 361, kb: 55, b: 22, life: 120, sz: 6, col: '#fbbf24', sh: 'boom', rb: 26, e: 's', rot: .5, sp: 1, pr: 1 }) }] }),
      u: (() => { const m = smMkSp(60, { air: 1, ai: 'rise', end: 'help', land: 24, pose: { h: [[0, 6, -15], [4, 6, -22], [54, 6, -22], [60, 6, -15]], wa: [[0, 60], [5, -90], [60, -90]], rot: [[0, 0], [6, 0], [30, 1080], [60, 1080]] } }); smMulti(m, 6, 4, 5, 17, -15, 8, 2, 361, 15, 8, { e: 's' }, true); m.hb.push(smHb(28, 33, 12, -34, 9, 7, 84, 90, 25, { id: 30, e: 's', sp: 2 })); m.mv = [{ f0: 0, f1: 5, vx: 0, vy: 0 }, { f0: 6, f1: 30, vy: -2.55, vx: .3 }]; m.fl = [{ f0: 6, f1: 32, k: 'st' }]; return m; })(),
      d: smMkSp(42, { air: 1, ai: 'trap', ev: [{ f: 14, k: 'item', it: 'bomb' }], pose: { h: [[0, 6, -15], [8, 8, -10], [14, 10, -12], [42, 6, -15]], h2: [[0, -2, -15], [14, 6, -14], [42, -2, -15]], lean: [[0, 0], [14, .15], [42, 0]] } })
    };
    const th = { f: smThr('f', 36, 13, 7, 45, 70, 38), b: smThr('b', 42, 17, 9, 42, 74, 40, true), u: smThr('u', 38, 14, 6, 92, 72, 36), d: smThr('d', 34, 11, 5, 80, 32, 38) };
    return { mv, sp, th, gr: smGr(8, 3, 24, 19), jabs: 2 };
  }

  function smPipKit() {
    const mv = {
      jab1: smCx(smP(3, 2, 8, 11, -9, 5.5, 1.8, 361, 15, 6), 5, 12, 'jab2'),
      jab2: smCx(smP(3, 2, 9, 11, -9, 5.5, 1.8, 361, 15, 6), 5, 12, 'jab3'),
      jab3: smK(4, 3, 14, 12, -6, 6, 3.5, 361, 50, 12),
      ftilt: smK(6, 3, 13, 15, -6, 6.5, 6, 361, 70, 14),
      utilt: smP(6, 4, 14, 3, -26, 7.5, 5, 95, 82, 15),
      dtilt: smK(5, 3, 11, 16, -2, 6, 4.5, 78, 55, 12),
      dash: smP(6, 12, 18, 8, -8, 8, 7, 361, 65, 24, { m: { mv: [{ f0: 0, f1: 0, vx: 1.9 }] } }),
      fsmash: smCf(smK(12, 4, 22, 18, -8, 7.5, 12, 361, 95, 22, { h: { sp: 2 } }), 9),
      usmash: smCf(smP(10, 5, 24, 4, -30, 9, 12, 90, 100, 22, { h: { sp: 2 } }), 7),
      dsmash: smBoth(smCf(smK(8, 4, 22, 17, -3, 7.5, 11, 28, 92, 22, { h: { sp: 2 } }), 5), 14, 17, 17, -3, 7.5, 11, 28, 92, 22, { sp: 2 }),
      nair: (() => { const m = smAir(smSpn(3, 16, 8, 12, 2, 361, 30, 8), 6, 3, 19); m.hb = []; smMulti(m, 3, 4, 4, 12, -9, 7.5, 1.8, 361, 20, 8, {}, true); m.hb.push(smHb(19, 21, 12, -9, 8, 4, 361, 65, 14, { id: 40, sp: 2 })); return m; })(),
      fair: smAir(smK(6, 3, 16, 15, -9, 7, 7, 361, 70, 18), 8, 3, 20),
      bair: smAir(smK(6, 3, 15, -16, -8, 7, 9, 361, 82, 16, { h: { rev: 1, sp: 2 } }), 8, 3, 19),
      uair: smAir(smK(5, 3, 14, 4, -30, 7, 6, 85, 75, 16), 7, 3, 17),
      dair: (() => { const m = smAir(smK(6, 12, 8, 2, 2, 8, 2, 90, 10, 6), 10, 3, 22); m.hb = []; smMulti(m, 6, 4, 3, 2, 3, 7.5, 1.5, 90, 15, 6, {}, false); m.hb.push(smHb(19, 21, 2, 3, 8, 3.5, 285, 55, 24, { id: 40, sp: 2 })); return m; })(),
      gup: smGup(6, 361, 55, 28, 14), lat: smLa(7, 361, 65, 28, 16)
    };
    const sp = {
      n: (() => { const m = smMkSp(44, { air: 1, ai: 'gust', pose: { h: [[0, 6, -15], [8, 12, -12], [38, 12, -12], [44, 6, -15]], h2: [[0, -2, -15], [8, 10, -12], [38, 10, -12], [44, -2, -15]], sq: [[0, 1], [8, 1.2], [36, 1.2], [44, 1]] } }); for (let i = 0; i < 9; i++) m.hb.push(smHb(8 + i * 3, 9 + i * 3, 20 + (i % 3) * 3, -10, 10, .7, 0, 0, 14, { id: 10 + i, e: 'w', sp: 0, hl: .4 })); return m; })(),
      s: smMkSp(48, { air: 1, ai: 'dash', hb: [smHb(8, 30, 6, -8, 9, 7, 361, 65, 24, { e: 'f' })], mv: [{ f0: 0, f1: 7, vx: 0, vy: 0 }, { f0: 8, f1: 30, vx: 3.1, vy: 0 }], fl: [{ f0: 0, f1: 7, k: 'nf' }, { f0: 8, f1: 30, k: 'ng' }], end: 'fall', pose: { rot: [[0, 0], [8, 0], [30, 1440], [48, 1440]], sq: [[0, 1], [4, .85], [8, 1]] } }),
      u: smMkSp(46, { air: 1, ai: 'rise', end: 'fall', land: 14, hb: [smHb(8, 12, 12, -26, 9, 3, 85, 30, 12, { id: 0, e: 's' }), smHb(15, 19, 16, -4, 9, 5, 70, 70, 18, { id: 1, e: 's', sp: 2 })], mv: [{ f0: 0, f1: 5, vx: 0, vy: 0 }, { f0: 6, f1: 14, vy: -2.6, vx: .3 }], fl: [{ f0: 6, f1: 16, k: 'st' }], pose: { h: [[0, 6, -15], [6, 8, -26], [12, 14, -30], [16, 16, -4], [46, 6, -15]], h2: [[0, -2, -15], [8, 8, -26], [46, -2, -15]], lean: [[0, 0], [8, -.2], [16, .3], [46, 0]] } }),
      d: smMkSp(70, { air: 1, ai: 'slam', stone: 1, end: 'idle', hb: [smHb(6, 40, 0, -6, 10, 13, 285, 60, 25, { id: 0, sp: 2, air: 1 })], mv: [{ f0: 0, f1: 5, vx: 0, vy: 0 }, { f0: 6, f1: 40, vy: 5.4, vx: 0 }], fl: [{ f0: 6, f1: 60, k: 'inv' }, { f0: 0, f1: 60, k: 'nf' }, { f0: 6, f1: 60, k: 'arm' }], dv: { f0: 6, f1: 40, to: 41 }, pose: { sq: [[0, 1], [5, .8], [6, 1], [60, 1]], rot: [[0, 0], [70, 0]], stone: [[0, 0], [5, 0], [6, 1], [58, 1], [62, 0]] } })
    };
    const th = { f: smThr('f', 28, 10, 5, 45, 66, 36), b: smThr('b', 32, 13, 6, 42, 72, 38, true), u: smThr('u', 30, 11, 5, 92, 68, 36), d: smThr('d', 28, 9, 4, 80, 30, 36) };
    return { mv, sp, th, gr: smGr(6, 3, 20, 15), jabs: 3 };
  }

  const SM_CHARS = [
    { id: 'ember', n: 'Ember', t: 'Brawler', b: 'Balanced fists and fire. Easy to pick up, hard to put down.', kit: smEmberKit, sz: 1, look: 'ember', pal: { skin: '#f2c9a0', c1: '#e8472f', c2: '#fbbf24', c3: '#5b1f13', ac: '#ff9f1c' }, S: { w: 98, wk: .95, rn: 1.65, ia: 1.6, tr: .1, ar: .04, as: 1.0, fl: 1.55, ff: 2.4, g: .095, jh: 3.0, sh: 1.95, dj: 2.85, nj: 1, js: 4 }, st: [3, 3, 3, 3], pr: 'Up B is a rising uppercut with early invincibility' },
    { id: 'sable', n: 'Sable', t: 'Swordfighter', b: 'Long blade, sharp spacing, and a counter for the greedy.', kit: smSableKit, sz: 1.02, look: 'sable', pal: { skin: '#f0cfae', c1: '#2f4b8a', c2: '#e5e7eb', c3: '#16223d', ac: '#93c5fd' }, S: { w: 92, wk: .95, rn: 1.7, ia: 1.65, tr: .1, ar: .035, as: 1.0, fl: 1.5, ff: 2.3, g: .088, jh: 3.05, sh: 2.0, dj: 2.9, nj: 1, js: 4 }, st: [4, 2, 4, 3], pr: 'Tip hits the hardest' },
    { id: 'granite', n: 'Granite', t: 'Heavyweight', b: 'Slow, huge and terrifying. One clean hit ends a stock.', kit: smGraniteKit, sz: 1.28, look: 'granite', pal: { skin: '#c98a5e', c1: '#7b8089', c2: '#a16207', c3: '#374151', ac: '#fbbf24' }, S: { w: 128, wk: .78, rn: 1.4, ia: 1.4, tr: .08, ar: .03, as: .85, fl: 1.85, ff: 2.6, g: .108, jh: 2.85, sh: 1.8, dj: 2.55, nj: 1, js: 6 }, st: [5, 1, 2, 5], pr: 'Side B has super armor' },
    { id: 'zephyr', n: 'Zephyr', t: 'Speedster', b: 'Fast, light and slippery. Wins by never being where you hit.', kit: smZephyrKit, sz: .9, look: 'zephyr', pal: { skin: '#e9b872', c1: '#14b8a6', c2: '#f8fafc', c3: '#0f766e', ac: '#fde047' }, S: { w: 78, wk: 1.15, rn: 2.15, ia: 2.1, tr: .12, ar: .06, as: 1.3, fl: 2.05, ff: 3.0, g: .11, jh: 3.2, sh: 2.05, dj: 3.1, nj: 1, js: 3 }, st: [2, 5, 3, 2], pr: 'Down B reflects projectiles' },
    { id: 'vex', n: 'Vex', t: 'Mage', b: 'Floaty and patient. Charged orbs, a teleport and a barrier.', kit: smVexKit, sz: .98, look: 'vex', pal: { skin: '#e9d5ff', c1: '#7c3aed', c2: '#f0abfc', c3: '#3b0764', ac: '#22d3ee' }, S: { w: 84, wk: .85, rn: 1.3, ia: 1.3, tr: .07, ar: .05, as: 1.1, fl: 1.2, ff: 2.0, g: .075, jh: 2.9, sh: 1.85, dj: 2.8, nj: 1, js: 5 }, st: [3, 2, 5, 2], pr: 'Hold neutral B to charge the orb' },
    { id: 'bramble', n: 'Bramble', t: 'Trapper', b: 'Whip reach, thorn traps and a vine that grabs the ledge.', kit: smBrambleKit, sz: 1.05, look: 'bramble', pal: { skin: '#9ae6b4', c1: '#3f9b3a', c2: '#d9f99d', c3: '#14532d', ac: '#f472b6' }, S: { w: 102, wk: .9, rn: 1.5, ia: 1.5, tr: .09, ar: .04, as: 1.0, fl: 1.6, ff: 2.5, g: .092, jh: 3.0, sh: 1.95, dj: 2.8, nj: 1, js: 5 }, st: [3, 2, 4, 3], pr: 'Up B tethers to the ledge' },
    { id: 'tempo', n: 'Tempo', t: 'Archer', b: 'Bow, boomerang and bombs. Takes up the whole stage.', kit: smTempoKit, sz: 1.06, look: 'tempo', pal: { skin: '#f1c9a5', c1: '#b45309', c2: '#fde68a', c3: '#451a03', ac: '#ef4444' }, S: { w: 106, wk: .9, rn: 1.45, ia: 1.45, tr: .09, ar: .035, as: .95, fl: 1.7, ff: 2.6, g: .105, jh: 3.1, sh: 2.0, dj: 2.75, nj: 1, js: 5 }, st: [4, 2, 3, 4], pr: 'Down B drops a bomb you can carry' },
    { id: 'pip', n: 'Pip', t: 'Featherweight', b: 'A tiny blob with five jumps. Hard to kill, harder to catch.', kit: smPipKit, sz: .78, look: 'pip', pal: { skin: '#7dd3fc', c1: '#38bdf8', c2: '#e0f2fe', c3: '#0c4a6e', ac: '#f97316' }, S: { w: 68, wk: 1.0, rn: 1.3, ia: 1.3, tr: .08, ar: .07, as: 1.0, fl: .95, ff: 1.9, g: .06, jh: 2.1, sh: 1.5, dj: 1.85, nj: 5, js: 3 }, st: [1, 4, 3, 1], pr: 'Down B turns to stone' }
  ];
  SM_CHARS.forEach(c => {
    const k = c.kit(), sz = c.sz;
    c.mv = {}; c.sp = {}; c.th = {};
    Object.keys(k.mv).forEach(n => { c.mv[n] = smBuild(k.mv[n], sz); c.mv[n].id = n; });
    Object.keys(k.sp).forEach(n => { c.sp[n] = smBuild(k.sp[n], sz); c.sp[n].id = 'sp' + n; });
    Object.keys(k.th).forEach(n => { c.th[n] = smBuild(k.th[n], sz); c.th[n].id = 'th' + n; });
    c.gr = smBuild(k.gr, sz); c.gr.id = 'grab';
    c.pum = smBuild(smPum(), sz); c.pum.id = 'pum';
    c.jabs = k.jabs;
    c.H = SM_FH * sz;
    c.R = SM_HW * sz;
    delete c.kit;
  });

  const SM_KD = .051, SM_DI = 18 * Math.PI / 180;
  const SM_MVL = SM_CHARS.map(c => {
    const l = [];
    Object.keys(c.mv).forEach(k => l.push(c.mv[k]));
    Object.keys(c.sp).forEach(k => l.push(c.sp[k]));
    Object.keys(c.th).forEach(k => l.push(c.th[k]));
    l.push(c.gr, c.pum);
    return l;
  });
  const SM_ITM = {
    bat: smBuild(smSw(7, 5, 20, 26, -90, 40, 8.5, 17, 361, 122, 38, { gx: 8, m: { len: 32 }, sw: 3, h: { sp: 2, e: 'f' } }), 1),
    thr: smBuild({ len: 20, hb: [], ev: [{ f: 9, k: 'itemthrow' }], pose: { h: [[0, 6, -15], [4, -2, -26], [9, 16, -22], [20, 6, -15]], lean: [[0, 0], [5, -.1], [9, .15], [20, 0]] } }, 1),
    blast: smBuild({ len: 16, hb: [], ev: [{ f: 3, k: 'blast' }], pose: { h: [[0, 6, -15], [3, 17, -17], [16, 9, -16]] } }, 1)
  };
  SM_ITM.bat.id = 'bat'; SM_ITM.thr.id = 'thr'; SM_ITM.blast.id = 'blast';
  SM_MVL.forEach(l => { l.push(SM_ITM.bat, SM_ITM.thr, SM_ITM.blast); });
  SM_MVL.forEach((l, i) => l.forEach((m, j) => { m.idx = j; }));

  const smEv = (W, e) => { W.ev.push(e); W.evNet.push(e); };
  const smMk = n => ({ x: 0, y: 0, a: 0, b: 0, j: 0, s: 0, g: 0, m: 0, cx: 0, cy: 0 });
  const smRng = W => { W.rs = (W.rs * 1664525 + 1013904223) >>> 0; return W.rs / 4294967296; };

  function smNewWorld(stId, players, opt) {
    const S = SM_STAGES.find(s => s.id === stId) || SM_STAGES[0];
    opt = opt || {};
    const W = {
      S, t: 0, ev: [], evNet: [], proj: [], items: [], F: [], nid: 1, rs: (opt.seed || 1234567) >>> 0, hold: 0,
      stocks: opt.stocks || 3, mode: opt.mode || 'stock', limit: (opt.time || 0) * 3600, dm: opt.dm || 1, itemRate: opt.items || 0, itemT: 600,
      over: 0, res: null, sudden: 0, wv: 0, wt: 0, tj: !!opt.tj, kos: [], tick: 0
    };
    W.solids = S.solids.map(s => Object.assign({ dx: 0, dy: 0 }, s));
    W.soft = S.soft.map(p => {
      const q = Object.assign({ dx: 0, dy: 0, soft: 1 }, p);
      if (p.mv) {
        q.w = p.w; q.x0 = (p.mv.ax != null ? p.mv.ax : p.mv.x) - p.w / 2; q.x1 = q.x0 + p.w;
        if (p.mv.ay != null) q.y = p.mv.ay;
      }
      return q;
    });
    W.ledges = [];
    for (const s of W.solids) {
      if (s.nl) continue;
      const inSolid = (x, y) => W.solids.some(o => x > o.x0 && x < o.x1 && y > o.y0 && y < o.y1);
      if (!inSolid(s.x0 - 3, s.y0 + 5)) W.ledges.push({ x: s.x0, y: s.y0, side: -1, occ: -1 });
      if (!inSolid(s.x1 + 3, s.y0 + 5)) W.ledges.push({ x: s.x1, y: s.y0, side: 1, occ: -1 });
    }
    players.forEach((p, i) => W.F.push(smNewF(W, p, i)));
    smStageStep(W, 1);
    return W;
  }

  function smNewF(W, p, i) {
    const C = SM_CHARS[p.ch], S = W.S;
    const sx = S.sp[i % S.sp.length];
    const f = {
      slot: i, ch: p.ch, C, S: C.S, name: p.name, kind: p.kind, lvl: p.lvl || 5, ai: null,
      x: sx, y: 0, vx: 0, vy: 0, kx: 0, ky: 0, face: sx < 0 ? 1 : -1, st: 'idle', sf: 0,
      dmg: p.dmg || 0, stocks: p.stocks != null ? p.stocks : W.stocks, ko: 0, falls: 0, dealt: 0,
      air: false, pl: null, jumps: 0, hl: 0, hs: 0, pend: null, shs: 0, sh: 50, inv: 60, lastHit: -1, lhT: 0,
      in: smMk(), pin: smMk(), e: {}, bf: { a: 0, b: 0, j: 0, g: 0 }, sd: 0, mv: null, mf: 0, hitSet: {}, chg: 0, mdir: 0,
      fast: false, dropT: 0, lcd: 0, lu: 0, upUsed: false, adUsed: false, help: false, item: null, hold: -1, held: -1, ht: 0, mash: 0,
      flg: {}, tech: 0, jsH: 0, lt: 0, ph: 0, rot: 0, tm: 0, dt: 0, rp: 0, sdT: 0, guard: 0, boom: 0, led: null, fl: 0, bl: 0, tumble: false, comb: 0, tj: !!p.tj, ret: 0, plant: 0, sq: 1, stone: 0, hit: 0, pose: null,
      techT: 99, fxd: 0, fxt: 0, fyd: 0, fyt: 0, crt: 0, ng: false, fi: 0, fa: 0, fc: 0, fr: 0, fg: 0, lag: 0, orb: 0, itcd: 0, rdir: 0, htm: 0, heldBy: -1, stunT: 0, cb: 'a', chgv: 0, act: -1, conn: 0, chgMul: 1, hlag: 20, dvx: 0, dvy: 0, hitf: 0, tpd: null, tgt: null, spin: 0, shake: 0, dazeT: 0, stk: 0
    };
    f.y = smGroundY(W, sx);
    f.pl = smSupport(W, f.x, f.y);
    return f;
  }

  function smGroundY(W, x) {
    let y = 0;
    for (const s of W.solids) if (x >= s.x0 && x <= s.x1) y = s.y0;
    return y;
  }
  function smSupport(W, x, y) {
    for (const s of W.solids) if (x >= s.x0 - 1 && x <= s.x1 + 1 && Math.abs(y - s.y0) < .6) return s;
    for (const p of W.soft) if (x >= p.x0 && x <= p.x1 && Math.abs(y - p.y) < .6) return p;
    return null;
  }

  function smStageStep(W, init) {
    const t = W.t;
    for (const p of W.soft) {
      const ox = p.x0, oy = p.y;
      if (p.mv) {
        const m = p.mv, u = (1 - Math.cos(TAU * (t / m.per + (m.ph || 0)))) / 2;
        if (m.ax != null) { const cx = m.ax + (m.bx - m.ax) * u; p.x0 = cx - p.w / 2; p.x1 = cx + p.w / 2; }
        else { p.y = m.ay + (m.by - m.ay) * u; p.x0 = m.x - p.w / 2; p.x1 = m.x + p.w / 2; }
      }
      p.dx = init ? 0 : p.x0 - ox; p.dy = init ? 0 : p.y - oy;
    }
    if (W.S.wind) {
      const ph = t % 1500, dir = Math.floor(t / 1500) % 2 ? -1 : 1;
      const g = ph > 700 && ph < 1200 ? Math.sin((ph - 700) / 500 * Math.PI) : 0;
      W.wv = dir * g * .75;
      W.wd = dir; W.wg = g;
    }
  }

  function smRamp(a, b, n) { return a + (b - a) * clamp(n, 0, 1); }

  function smCollide(W, f, dx, dy) {
    const R = f.C.R, H = f.C.H, was = f.air;
    f.hitW = 0; f.hitC = 0;
    if (f.pl && !f.air) { f.x += f.pl.dx || 0; f.y += f.pl.dy || 0; }
    const py = f.y;
    f.x += dx;
    for (const s of W.solids) {
      if (f.x + R > s.x0 && f.x - R < s.x1 && py - 2 > s.y0 && py - H + 2 < s.y1) {
        if (f.x < (s.x0 + s.x1) / 2) { f.x = s.x0 - R; f.hitW = -1; } else { f.x = s.x1 + R; f.hitW = 1; }
      }
    }
    let ny = py + dy, sup = null;
    if (dy >= 0) {
      let by = 1e9;
      for (const s of W.solids) {
        if (f.x > s.x0 - .5 && f.x < s.x1 + .5 && py <= s.y0 + 1.2 && ny >= s.y0 - .001 && s.y0 < by) { by = s.y0; sup = s; }
      }
      if (f.dropT <= 0) {
        for (const p of W.soft) {
          if (f.x >= p.x0 && f.x <= p.x1 && py <= p.y - p.dy + 1.2 && ny >= p.y - .001 && p.y < by) { by = p.y; sup = p; }
        }
      }
      if (sup) ny = by;
    } else {
      for (const s of W.solids) {
        if (f.x + R * .8 > s.x0 && f.x - R * .8 < s.x1 && py - H >= s.y1 - .5 && ny - H < s.y1) { ny = s.y1 + H; f.hitC = 1; }
      }
    }
    f.y = ny;
    if (sup) { f.pl = sup; f.air = false; } else { f.air = true; f.pl = null; }
    return was && !f.air;
  }

  function smBlockedBy(W, x, y, R, H) {
    for (const s of W.solids) if (x + R > s.x0 && x - R < s.x1 && y - 2 > s.y0 && y - H + 2 < s.y1) return true;
    return false;
  }

  function smNearestFoe(W, f, dir) {
    let b = null, bd = 1e9;
    for (const o of W.F) {
      if (o === f || o.st === 'dead' || o.st === 'respawn') continue;
      const d = Math.abs(o.x - f.x) + Math.abs(o.y - f.y) * 1.2;
      if (d < bd) { bd = d; b = o; }
    }
    return b;
  }

  const smSgn = v => v > 0 ? 1 : v < 0 ? -1 : 0;
  const smD = Math.PI / 180;
  const smBtn = (f, k) => f.bf[k] > 0;
  const smEat = (f, k) => { f.bf[k] = 0; };
  const smTow = (v, t, a) => v < t ? Math.min(v + a, t) : Math.max(v - a, t);
  const SM_BK = ['a', 'b', 'j', 'g', 'm', 's'];
  const SM_DUR = { roll: 30, spot: 22, adodge: 28, techr: 22, getup: 24, ledgeup: 30, ledgeroll: 36, shieldoff: 7, turn: 9 };
  const SM_INV = { roll: [4, 22], spot: [3, 18], adodge: [3, 24], techr: [2, 18], getup: [1, 18], ledgeup: [1, 22], ledgeroll: [1, 24] };
  const smSet = (f, st) => { f.st = st; f.sf = 0; };

  function smEdges(f) {
    const i = f.in, p = f.pin, b = f.bf;
    f.edge = 0;
    for (const k of SM_BK) {
      if (i[k] && !p[k]) { b[k] = 6; f.edge++; } else if (b[k] > 0) b[k]--;
    }
    f.techT = i.s && !p.s ? 0 : Math.min(99, f.techT + 1);
    if (Math.abs(i.x) > .7 && Math.abs(p.x) <= .7) { f.fxd = smSgn(i.x); f.fxt = 5; f.edge++; } else if (f.fxt > 0) f.fxt--;
    if (Math.abs(i.y) > .7 && Math.abs(p.y) <= .7) { f.fyd = smSgn(i.y); f.fyt = 5; f.edge++; } else if (f.fyt > 0) f.fyt--;
    p.x = i.x; p.y = i.y; for (const k of SM_BK) p[k] = i[k];
  }

  function smFlags(f) {
    let fi = f.inv > 0, fa = f.orb > 0, fc = 0, fr = 0, fg = 0, fn = 0;
    const t = SM_INV[f.st];
    if (t && f.sf >= t[0] && f.sf <= t[1]) fi = true;
    if (f.st === 'respawn') fi = true;
    if (f.st === 'atk' && f.mv) {
      const mf = f.mf;
      for (const w of f.mv.fl) if (mf >= w.f0 && mf <= w.f1) {
        if (w.k === 'inv') fi = true; else if (w.k === 'arm') fa = true; else if (w.k === 'ctr') fc = 1;
        else if (w.k === 'rfl') fr = 1; else if (w.k === 'ng') fg = 1; else if (w.k === 'nf') fn = 1;
      }
    }
    f.fi = fi ? 1 : 0; f.fa = fa ? 1 : 0; f.fc = fc; f.fr = fr; f.fg = fg; f.fn = fn;
  }

  function smStart(f, m, btn) {
    f.st = 'atk'; f.mv = m; f.mf = 0; f.sf = 0; f.hitSet = {}; f.chg = 0; f.chgv = 0; f.cb = btn || 'a'; f.conn = 0; f.tgt = null; f.act = -1;
    f.chgMul = 1;
  }

  function smDrop(f) { f.dropT = 14; f.air = true; f.pl = null; f.y += 1.6; f.vy = .6; smSet(f, 'air'); }

  function smNearItem(W, f) {
    let b = null, bd = 28;
    for (const it of W.items) {
      if (it.k === 'heart' || it.k === 'orb' || it.hl) continue;
      const d = Math.hypot(it.x - f.x, it.y - (f.y - 10));
      if (d < bd) { bd = d; b = it; }
    }
    return b;
  }

  function smActGround(W, f) {
    const i = f.in, C = f.C, run = f.st === 'run' || f.st === 'dash';
    if (smBtn(f, 'b')) {
      smEat(f, 'b');
      const k = i.y > .5 ? 'u' : i.y < -.5 ? 'd' : Math.abs(i.x) > .5 ? 's' : 'n';
      if (k === 's') f.face = smSgn(i.x);
      smStart(f, C.sp[k], 'b'); return true;
    }
    if (smBtn(f, 'm')) {
      smEat(f, 'm');
      if (f.item && f.item.k !== 'orb') { smUseItem(W, f); return true; }
      const k = i.y > .5 && i.y > Math.abs(i.x) ? 'usmash' : i.y < -.5 && -i.y > Math.abs(i.x) ? 'dsmash' : 'fsmash';
      if (k === 'fsmash' && Math.abs(i.x) > .3) f.face = smSgn(i.x);
      smStart(f, C.mv[k], 'm'); return true;
    }
    if (smBtn(f, 'a')) {
      smEat(f, 'a');
      if (f.item) { smUseItem(W, f); return true; }
      const ax = Math.abs(i.x), ay = Math.abs(i.y);
      let k;
      if (run && ax > .3 && smSgn(i.x) === f.face) k = 'dash';
      else if (ay > .5 && ay >= ax) k = i.y > 0 ? 'utilt' : 'dtilt';
      else if (ax > .5) { f.face = smSgn(i.x); k = 'ftilt'; } else k = 'jab1';
      smStart(f, C.mv[k], 'a'); return true;
    }
    if (smBtn(f, 'g')) {
      smEat(f, 'g');
      if (f.item) { smStart(f, SM_ITM.thr, 'g'); return true; }
      const it = smNearItem(W, f);
      if (it) { smPick(W, f, it); return true; }
      smStart(f, C.gr, 'g'); return true;
    }
    if (smBtn(f, 'j') || (f.tj && i.y > .7 && f.fyt > 0 && f.fyd === 1)) {
      smEat(f, 'j'); f.fyt = 0; smSet(f, 'jsq'); return true;
    }
    if (i.s) { smSet(f, 'shield'); return true; }
    return false;
  }

  function smActAir(W, f) {
    const i = f.in, C = f.C, S = f.S;
    if (smBtn(f, 's') && !f.adUsed && f.st !== 'help') {
      smEat(f, 's'); f.adUsed = true; smSet(f, 'adodge');
      const n = Math.hypot(i.x, i.y);
      f.dvx = n > .3 ? i.x / n : 0; f.dvy = n > .3 ? -i.y / n : 0;
      f.vx = 0; f.vy = 0; f.kx = 0; f.ky = 0; f.fast = false;
      smEv(W, { k: 'adodge', x: f.x, y: f.y - 12, s: f.slot });
      return true;
    }
    if (f.st === 'help') return false;
    if (smBtn(f, 'b')) {
      smEat(f, 'b');
      const k = i.y > .5 ? 'u' : i.y < -.5 ? 'd' : Math.abs(i.x) > .5 ? 's' : 'n';
      if (k === 's') f.face = smSgn(i.x);
      smStart(f, C.sp[k], 'b'); f.fast = false; return true;
    }
    if (smBtn(f, 'a') || smBtn(f, 'm')) {
      const wasA = smBtn(f, 'a');
      smEat(f, 'a'); smEat(f, 'm');
      if (wasA && f.item) { smUseItem(W, f); return true; }
      const y = i.y, x = i.x * f.face;
      let k;
      if (y > .5 && y >= Math.abs(x)) k = 'uair'; else if (y < -.5 && -y >= Math.abs(x)) k = 'dair';
      else if (x > .5) k = 'fair'; else if (x < -.5) k = 'bair'; else k = 'nair';
      smStart(f, C.mv[k], 'a'); return true;
    }
    if (smBtn(f, 'g') && f.item) { smEat(f, 'g'); smStart(f, SM_ITM.thr, 'g'); return true; }
    if (smBtn(f, 'j') || (f.tj && i.y > .7 && f.fyt > 0 && f.fyd === 1)) {
      if (f.jumps < S.nj) {
        smEat(f, 'j'); f.fyt = 0; f.jumps++;
        f.vy = -S.dj; f.ky = Math.min(f.ky, 0) * .5; f.fast = false;
        if (Math.abs(i.x) > .3) { f.face = smSgn(i.x); f.vx = i.x * S.as * .95; } else f.vx *= .5;
        smEv(W, { k: 'djump', x: f.x, y: f.y, s: f.slot });
        return true;
      }
    }
    return false;
  }

  function smDash(W, f) {
    smSet(f, 'dash'); f.vx = f.face * f.S.ia;
    smEv(W, { k: 'dust', x: f.x - f.face * 4, y: f.y, d: -f.face, s: f.slot });
  }

  function smGround(W, f) {
    const i = f.in, S = f.S, st = f.st;
    if (st === 'land') { f.vx = smTow(f.vx, 0, S.tr); if (f.sf >= f.lag) smSet(f, 'idle'); else return; }
    if (smActGround(W, f)) return;
    const ax = Math.abs(i.x), dir = smSgn(i.x);
    if (i.y < -.65 && ax < .6) {
      if (st !== 'crouch') { smSet(f, 'crouch'); f.crt = 0; }
      f.crt++; f.vx = smTow(f.vx, 0, S.tr);
      if (f.crt >= 12 && f.pl && f.pl.soft) smDrop(f);
      return;
    }
    if (st === 'crouch') smSet(f, 'idle');
    if (st === 'turn') {
      f.vx = smTow(f.vx, 0, .12);
      if (f.sf >= SM_DUR.turn) { if (dir && ax > .5) { f.face = dir; smDash(W, f); } else smSet(f, 'idle'); }
      return;
    }
    if (st === 'dash') {
      if (dir && dir !== f.face) {
        if (f.sf < 13) { f.face = dir; smDash(W, f); } else smSet(f, 'turn');
        return;
      }
      if (!dir) {
        f.vx = smTow(f.vx, 0, S.tr * .9);
        if (Math.abs(f.vx) < .15 || f.sf > 20) smSet(f, 'idle');
        return;
      }
      f.vx = dir * lerp(S.ia, S.rn, Math.min(1, f.sf / 16));
      if (f.sf >= 16) smSet(f, 'run');
      return;
    }
    if (st === 'run') {
      if (!dir) { f.vx = smTow(f.vx, 0, S.tr * 1.1); if (Math.abs(f.vx) < .3) smSet(f, 'idle'); return; }
      if (dir !== f.face) { smSet(f, 'turn'); return; }
      f.vx = smTow(f.vx, dir * S.rn, .14);
      if (f.sf % 14 === 7) smEv(W, { k: 'step', x: f.x, y: f.y, s: f.slot });
      return;
    }
    if (ax > .2) {
      if (f.fxt > 0 && ax > .7 && dir === f.fxd) { f.face = dir; smDash(W, f); return; }
      if (dir !== f.face && ax > .35) f.face = dir;
      f.vx = dir * S.wk * Math.min(1, ax / .7);
      if (st !== 'walk') smSet(f, 'walk');
    } else {
      f.vx = smTow(f.vx, 0, S.tr);
      if (st !== 'idle' && Math.abs(f.vx) < .05) smSet(f, 'idle');
    }
  }

  function smAirCtl(W, f) {
    const i = f.in, S = f.S, st = f.st;
    const act = st === 'air' && smActAir(W, f);
    if (act || f.st !== st) return;
    const k = st === 'help' ? .6 : 1, mx = S.as * 1.15 * k;
    if (Math.abs(i.x) > .15) {
      const t = i.x * mx;
      if (Math.abs(f.vx) <= mx || smSgn(f.vx) !== smSgn(i.x)) f.vx = smTow(f.vx, t, S.ar * Math.abs(i.x) * k);
      else f.vx = smTow(f.vx, t, .01);
    } else f.vx = smTow(f.vx, 0, .008);
    if (st === 'air' && f.vy >= 0 && i.y < -.7 && !f.fast && f.sf > 3) { f.fast = true; f.vy = Math.max(f.vy, S.ff); smEv(W, { k: 'ff', x: f.x, y: f.y, s: f.slot }); }
  }

  function smShieldCtl(W, f) {
    const i = f.in, S = f.S;
    f.sh -= .2;
    f.vx = smTow(f.vx, 0, S.tr);
    if (f.sh <= 0) { smShieldBreak(W, f); return; }
    if (!i.s) { smSet(f, 'shieldoff'); return; }
    if (smBtn(f, 'j') || (f.tj && i.y > .7 && f.fyt > 0)) { smEat(f, 'j'); smSet(f, 'jsq'); return; }
    if (smBtn(f, 'g') || smBtn(f, 'a')) { smEat(f, 'g'); smEat(f, 'a'); smStart(f, f.C.gr, 'g'); return; }
    if (f.fyt > 0 && f.fyd === -1) { f.fyt = 0; smSet(f, 'spot'); return; }
    if (f.fxt > 0) { f.rdir = f.fxd; f.fxt = 0; smSet(f, 'roll'); return; }
  }

  function smLedgeHang(W, f, L) {
    L.occ = f.slot; f.led = L; smSet(f, 'ledge');
    f.inv = Math.max(f.inv, 80); f.face = -L.side; f.vx = f.vy = f.kx = f.ky = 0; f.jumps = 0; f.upUsed = false; f.adUsed = false; f.fast = false; f.hs = 0; f.mv = null; f.tgt = null;
    f.air = true; f.pl = null;
    f.x = L.x + L.side * (f.C.R * .9 + 1); f.y = L.y + f.C.H * .88;
    smEv(W, { k: 'ledge', x: L.x, y: L.y, s: f.slot });
  }

  function smLedgeLeave(f) { if (f.led) f.led.occ = -1; f.led = null; f.lcd = 28; }

  function smLedgeCtl(W, f) {
    const L = f.led, i = f.in, S = f.S, C = f.C;
    if (!L || L.occ !== f.slot) { f.led = null; smSet(f, 'air'); return; }
    f.x = L.x + L.side * (C.R * .9 + 1); f.y = L.y + C.H * .88; f.vx = f.vy = 0;
    const st = -L.side, top = () => { f.air = false; f.y = L.y; f.x = L.x + st * (C.R + 4); f.pl = smSupport(W, f.x, f.y); f.face = st; smLedgeLeave(f); f.lcd = 20; };
    if (f.sf < 6) return;
    if (smBtn(f, 'j') || (f.fyt > 0 && f.fyd === 1)) {
      smEat(f, 'j'); smLedgeLeave(f); f.air = true; f.vy = -S.dj * 1.02; f.vx = st * .9; f.jumps = 0; f.face = st; f.y -= 3; f.x += st * 3; smSet(f, 'air'); f.inv = Math.max(f.inv, 10);
      smEv(W, { k: 'djump', x: f.x, y: f.y, s: f.slot }); return;
    }
    if (smBtn(f, 'a') || smBtn(f, 'm')) { smEat(f, 'a'); smEat(f, 'm'); top(); smStart(f, C.mv.lat, 'a'); f.inv = Math.max(f.inv, 4); return; }
    if (smBtn(f, 's') || (f.fxt > 0 && f.fxd === st && i.s)) { smEat(f, 's'); smLedgeLeave(f); f.led = L; L.occ = f.slot; smSet(f, 'ledgeroll'); return; }
    if (smSgn(i.x) === st) { smLedgeLeave(f); f.led = L; L.occ = f.slot; smSet(f, 'ledgeup'); return; }
    if (i.y < -.6 || smSgn(i.x) === L.side && f.fxt > 0 || f.sf > 420) { smLedgeLeave(f); f.air = true; f.vy = .4; f.vx = L.side * .4; smSet(f, 'air'); }
  }

  function smLedgeCheck(W, f) {
    if (f.lcd > 0 || f.fg || f.hs > 0) return false;
    if (f.st === 'air' && f.vy < -1.4) return false;
    if (f.st === 'atk' && (!f.mv.ai || f.mv.air && !f.mv.ai)) return false;
    for (const L of W.ledges) {
      if (L.occ >= 0 && L.occ !== f.slot) continue;
      const ox = (f.x - L.x) * L.side, hy = f.y - f.C.H * .9;
      if (ox < -3 || ox > 21 || hy < L.y - 12 || hy > L.y + 14) continue;
      smLedgeHang(W, f, L); return true;
    }
    return false;
  }

  function smShieldBreak(W, f) {
    smSet(f, 'stun'); f.sh = 0; f.stunT = 260; f.vy = -3.1; f.vx = 0; f.air = true; f.pl = null; f.y -= 1;
    smEv(W, { k: 'sbreak', x: f.x, y: f.y - 14, s: f.slot });
  }

  function smTechOrDown(W, f) {
    if (f.techT <= 20 && f.hs > 0) {
      const d = Math.abs(f.in.x) > .4 ? smSgn(f.in.x) : 0;
      f.rdir = d; smSet(f, 'techr'); f.kx = f.ky = 0; f.vx = 0; f.hs = 0; f.tumble = false;
      smEv(W, { k: 'tech', x: f.x, y: f.y, s: f.slot });
    } else {
      smSet(f, 'down'); f.kx *= .45; f.ky = 0; f.vx = 0; f.hs = 0; f.tumble = false;
      smEv(W, { k: 'knockdown', x: f.x, y: f.y, s: f.slot });
    }
  }

  function smLanded(W, f) {
    f.vy = 0; if (f.ky > 0) f.ky = 0;
    f.jumps = 0; f.upUsed = false; f.adUsed = false; f.fast = false;
    const st = f.st;
    if (st === 'air') { smSet(f, 'land'); f.lag = 4; smEv(W, { k: 'land', x: f.x, y: f.y, s: f.slot }); f.vx *= .8; }
    else if (st === 'help') { smSet(f, 'land'); f.lag = f.hlag; smEv(W, { k: 'land', x: f.x, y: f.y, s: f.slot }); }
    else if (st === 'adodge') { smSet(f, 'land'); f.lag = 8; f.vx *= .5; }
    else if (st === 'tumble' || (st === 'hit' && f.hs > 0 && f.tumble)) smTechOrDown(W, f);
    else if (st === 'atk') {
      const m = f.mv;
      if (m.air && !m.ai) {
        if (f.mf < m.ac[0] || f.mf > m.ac[1]) { f.mv = null; smSet(f, 'land'); f.lag = 2; }
        else { f.mv = null; smSet(f, 'land'); f.lag = m.land; }
        smEv(W, { k: 'land', x: f.x, y: f.y, s: f.slot });
      } else if (m.end === 'help' && m.ai === 'rise') { f.mv = null; smSet(f, 'land'); f.lag = m.land || 20; }
      else if (m.dv && f.mf >= m.dv.f0 && f.mf <= m.dv.f1) { f.mf = m.dv.to; smEv(W, { k: 'slam', x: f.x, y: f.y, s: f.slot }); }
    } else if (st === 'stun') { f.vx = 0; }
  }

  function smEventAtk(W, f, m, e) {
    switch (e.k) {
      case 'proj': smSpawnProj(W, f, e.p, e.ch ? f.chgv : 0); break;
      case 'tp': {
        let dx = f.in.x, dy = -f.in.y;
        if (Math.abs(dx) < .3 && Math.abs(dy) < .3) { dx = 0; dy = -1; }
        const n = Math.hypot(dx, dy), bz = W.S.bz;
        smEv(W, { k: 'tpout', x: f.x, y: f.y - 12, s: f.slot });
        f.x = clamp(f.x + dx / n * e.dist, bz.l + 10, bz.r - 10); f.y = clamp(f.y + dy / n * e.dist, bz.t + 20, bz.b - 10);
        if (dx) f.face = smSgn(dx);
        f.vx = f.vy = 0; f.air = true; f.pl = null;
        smEv(W, { k: 'tpin', x: f.x, y: f.y - 12, s: f.slot });
        break;
      }
      case 'dir': {
        let dx = f.in.x, dy = -f.in.y;
        if (Math.abs(dx) < .3 && Math.abs(dy) < .3) { dx = f.face * .5; dy = -.87; }
        const n = Math.hypot(dx, dy); f.dvx = dx / n; f.dvy = dy / n;
        if (Math.abs(dx) > .2) f.face = smSgn(dx);
        break;
      }
      case 'tether': {
        let b = null, bd = e.r;
        for (const L of W.ledges) {
          if (L.occ >= 0 && L.occ !== f.slot) continue;
          const d = Math.hypot(L.x - f.x, L.y - (f.y - 20));
          if (d < bd && L.y < f.y + 10) { bd = d; b = L; }
        }
        if (b) { f.tgt = b; f.face = smSgn(b.x - f.x) || f.face; smEv(W, { k: 'tether', x: f.x, y: f.y - 20, tx: b.x, ty: b.y, s: f.slot }); }
        break;
      }
      case 'plant': smPlant(W, f); break;
      case 'item': f.item = { k: e.it, fuse: 300, ammo: 0, dur: 0 }; smEv(W, { k: 'pick', x: f.x, y: f.y - 14, s: f.slot }); break;
      case 'itemthrow': smThrowItem(W, f); break;
      case 'blast': smBlaster(W, f); break;
    }
  }

  function smUpdAtk(W, f) {
    const m = f.mv, i = f.in, S = f.S;
    let mf = f.mf, ng = false, hold = false;
    if (m.sm && m.cf != null && mf === m.cf && f.chg < 60 && (f.cb === 'm' ? i.m : i.a)) { f.chg++; hold = true; }
    else if (m.chg && mf === m.chg.f && f.chg < m.chg.max && i.b) { f.chg++; hold = true; }
    f.chgv = m.sm ? f.chg / 60 : m.chg ? f.chg / m.chg.max : 0;
    f.chgMul = m.sm ? 1 + .4 * f.chgv : 1;
    if (m.sm && f.chg === 1 && hold) smEv(W, { k: 'chgstart', x: f.x, y: f.y, s: f.slot });
    if (!hold) {
      if (mf === m.st && m.hb.length && !m.thr) { const h0 = m.hb[0]; smEv(W, { k: 'swing', x: f.x + h0.x * f.face, y: f.y + h0.y, sp: h0.sp, e: h0.e, s: f.slot }); }
      for (const w of m.mv) {
        if (mf >= w.f0 && mf <= w.f1) {
          if (w.vy != null) { f.vy = w.vy; ng = true; }
          if (w.vx != null) f.vx = w.vx * f.face + (m.ai === 'rise' ? i.x * .55 : 0);
          if (w.gs === 0) ng = true;
        }
        if (mf === w.f1 + 1 && w.vy != null && w.vy < 0) f.vy *= .3;
      }
      if (m.dirv) {
        if (mf >= m.dirv.f0 && mf <= m.dirv.f1) { f.vx = f.dvx * m.dirv.sp; f.vy = f.dvy * m.dirv.sp; ng = true; }
        else if (mf === m.dirv.f1 + 1) { f.vx *= .3; f.vy *= .3; }
      }
      for (const e of m.ev) if (e.f === mf) smEventAtk(W, f, m, e);
      if (f.st !== 'atk') return;
      if (f.tgt) {
        const L = f.tgt, hx = L.x + L.side * (f.C.R * .9 + 1), hy = L.y + f.C.H * .88, dx = hx - f.x, dy = hy - f.y, d = Math.hypot(dx, dy);
        if (L.occ >= 0 && L.occ !== f.slot) f.tgt = null;
        else if (d < 5) { smLedgeHang(W, f, L); return; }
        else { f.vx = dx / d * 3.6; f.vy = dy / d * 3.6; ng = true; }
      }
      if (m.thr && mf === m.th.f) smThrow(W, f, m.th);
      if (m.pum && mf === 6) smPummel(W, f);
      if (m.cx && smBtn(f, 'a') && mf >= m.cx.f0 && mf <= m.cx.f1) {
        smEat(f, 'a'); smStart(f, f.C.mv[m.cx.to], 'a'); return;
      }
    }
    f.ng = ng;
    if (f.air) {
      if (!ng) {
        const mx = S.as * 1.15 * .5;
        if (Math.abs(i.x) > .15 && Math.abs(f.vx) < mx) f.vx = smTow(f.vx, i.x * mx, S.ar * .5);
      }
    } else if (!ng) f.vx = smTow(f.vx, 0, S.tr * .85);
    if (!hold) {
      f.act = mf; f.mf++;
      if (f.mf >= m.len) smEndMove(W, f, m);
    } else f.act = -1;
  }

  function smEndMove(W, f, m) {
    f.mv = null; f.act = -1; f.tgt = null;
    if (m.pum) { smSet(f, 'grab'); return; }
    if (m.thr) { f.hold = -1; smSet(f, f.air ? 'air' : 'idle'); return; }
    if (f.air) {
      if (m.end === 'help' || m.end === 'fall') { smSet(f, 'help'); f.hlag = m.land || 20; }
      else smSet(f, 'air');
    } else smSet(f, 'idle');
  }

  function smGrabCtl(W, f) {
    const T = W.F[f.hold], i = f.in;
    if (!T || T.st !== 'held' || T.heldBy !== f.slot) { f.hold = -1; smSet(f, 'idle'); return; }
    f.vx = smTow(f.vx, 0, f.S.tr);
    T.x = f.x + f.face * (f.C.R + T.C.R + 3); T.y = f.y; T.face = -f.face; T.air = false; T.pl = f.pl; T.vx = T.vy = T.kx = T.ky = 0;
    f.htm -= 1 + T.edge * 5;
    if (f.htm <= 0) { smRelease(W, f, T); return; }
    if (smBtn(f, 'a') && !f.item) { smEat(f, 'a'); smStart(f, f.C.pum, 'a'); return; }
    if (f.fxt > 0 || f.fyt > 0) {
      let d;
      if (f.fyt > 0 && (f.fxt <= 0 || f.fyt >= f.fxt)) d = f.fyd > 0 ? 'u' : 'd';
      else d = f.fxd === f.face ? 'f' : 'b';
      smStart(f, f.C.th[d], 'a'); return;
    }
    if (smBtn(f, 'j') || i.s && f.sf > 12) { smEat(f, 'j'); smRelease(W, f, T); }
  }

  function smRelease(W, f, T) {
    if (T) { smSet(T, 'air'); T.heldBy = -1; T.inv = 12; T.vx = -f.face * .8; T.vy = -.6; T.air = true; T.pl = null; T.y -= 1; }
    f.hold = -1; smSet(f, 'land'); f.lag = 14; f.vx = f.face * -.5;
    smEv(W, { k: 'release', x: f.x, y: f.y - 12, s: f.slot });
  }

  function smHeldCtl(W, f) {
    const G = W.F[f.heldBy];
    if (!G || (G.st !== 'grab' && !(G.st === 'atk' && G.mv && (G.mv.thr || G.mv.pum)))) { f.heldBy = -1; smSet(f, 'idle'); f.inv = 10; }
  }

  function smDown(W, f) {
    const i = f.in;
    f.vx = smTow(f.vx, 0, .1); f.kx = smTow(f.kx, 0, .08);
    if (f.sf < 18) return;
    if (smBtn(f, 'a')) { smEat(f, 'a'); smStart(f, f.C.mv.gup, 'a'); f.act = -1; return; }
    if (Math.abs(i.x) > .5) { f.rdir = smSgn(i.x); smSet(f, 'getup'); f.sf = 0; f.rdirMove = 1; return; }
    if (i.y > .5 || smBtn(f, 'j') || smBtn(f, 's') || f.sf > 60) { f.rdir = 0; smSet(f, 'getup'); f.rdirMove = 0; }
  }

  function smTimed(W, f) {
    const S = f.S, st = f.st, d = SM_DUR[st];
    switch (st) {
      case 'jsq':
        f.vx = smTow(f.vx, 0, S.tr * .6);
        if (f.sf >= S.js) {
          const full = f.in.j || (f.tj && f.in.y > .6);
          f.vy = -(full ? S.jh : S.sh); f.air = true; f.pl = null; f.y -= .6; f.vx *= .85;
          smSet(f, 'air'); smEv(W, { k: 'jump', x: f.x, y: f.y, s: f.slot });
        }
        break;
      case 'spot':
        f.vx = smTow(f.vx, 0, S.tr);
        if (f.sf >= d) smSet(f, f.in.s ? 'shield' : 'idle');
        break;
      case 'roll':
        f.vx = f.sf >= 4 && f.sf <= 24 ? f.rdir * 1.55 : 0;
        if (f.sf >= d) smSet(f, 'idle');
        break;
      case 'techr':
        f.vx = f.rdir && f.sf >= 3 && f.sf <= 16 ? f.rdir * 1.9 : 0;
        if (f.sf >= d) smSet(f, 'idle');
        break;
      case 'getup':
        f.vx = f.rdirMove && f.sf >= 4 && f.sf <= 20 ? f.rdir * 1.5 : 0;
        if (f.sf >= d) smSet(f, 'idle');
        break;
      case 'shieldoff':
        f.vx = smTow(f.vx, 0, S.tr);
        if (f.sf >= d) smSet(f, 'idle');
        break;
      case 'adodge': {
        f.ng = true;
        const k = 3.1 * (1 - f.sf / SM_DUR.adodge);
        f.vx = f.dvx * k; f.vy = f.dvy * k;
        if (f.sf >= d) { smSet(f, 'air'); f.vx *= .4; f.vy = Math.min(f.vy, 0) * .4; }
        break;
      }
      case 'ledgeup': {
        const L = f.led;
        if (!L) { smSet(f, 'idle'); break; }
        f.vx = f.vy = 0;
        if (f.sf < 14) { f.x = L.x + L.side * (f.C.R * .9 + 1); f.y = L.y + f.C.H * .88 - f.sf * (f.C.H * .88 + 1) / 14; f.air = true; }
        else if (f.sf === 14) { f.air = false; f.x = L.x - L.side * (f.C.R + 5); f.y = L.y; f.pl = smSupport(W, f.x, f.y); L.occ = -1; f.led = null; f.lcd = 20; f.face = -L.side; }
        if (f.sf >= d) smSet(f, 'idle');
        break;
      }
      case 'ledgeroll': {
        const L = f.led;
        if (!L) { smSet(f, 'idle'); break; }
        f.vx = f.vy = 0;
        if (f.sf < 14) { f.x = L.x + L.side * (f.C.R * .9 + 1); f.y = L.y + f.C.H * .88 - f.sf * (f.C.H * .88 + 1) / 14; f.air = true; }
        else if (f.sf === 14) { f.air = false; f.x = L.x - L.side * (f.C.R + 5); f.y = L.y; f.pl = smSupport(W, f.x, f.y); L.occ = -1; f.led = null; f.lcd = 20; f.face = -L.side; }
        else { f.vx = -L.side * 1.3; }
        if (f.sf >= d) smSet(f, 'idle');
        break;
      }
      case 'stun':
        if (!f.air) { f.vx = 0; f.stunT -= 1 + f.edge * 6; if (f.stunT <= 0) { f.sh = 30; smSet(f, 'idle'); } }
        break;
    }
  }

  function smHitState(W, f) {
    f.hitf++; f.hs--;
    if (f.hs <= 0) {
      f.tumble = false;
      if (f.air) smSet(f, 'air'); else smSet(f, 'idle');
      f.lag = 0;
    } else if (f.air) {
      const i = f.in;
      f.vx += i.x * .006;
    }
  }

  function smPhys(W, f) {
    const S = f.S, st = f.st;
    if (st === 'ledge' || st === 'held' || st === 'respawn') return;
    if (f.air && !f.ng && !f.fn) {
      const mx = f.fast ? S.ff : S.fl;
      f.vy = f.vy < mx ? Math.min(f.vy + S.g, mx) : Math.max(f.vy - .03, mx);
    }
    const km = Math.hypot(f.kx, f.ky);
    if (km > 0) { const n = Math.max(0, km - SM_KD); f.kx *= n / km; f.ky *= n / km; if (!f.air) f.kx = smTow(f.kx, 0, .04); }
    let dx = f.vx + f.kx, dy = f.vy + f.ky;
    if (W.wv) dx += W.wv * (f.air ? 1 : .35) * 98 / S.w;
    const landed = smCollide(W, f, dx, dy);
    if (f.hitW) {
      if ((st === 'hit' || st === 'tumble') && Math.abs(f.kx) > 1.4) { f.kx = -f.kx * .7; smEv(W, { k: 'bounce', x: f.x, y: f.y - 12, s: f.slot }); } else f.kx = 0;
      f.vx = 0;
    }
    if (f.hitC) { if (f.ky < 0) f.ky = -f.ky * .55; if (f.vy < 0) f.vy = 0; }
    if (landed) smLanded(W, f);
    if (f.air) {
      if (st === 'air' || st === 'help' || (st === 'atk' && f.mv && f.mv.ai)) smLedgeCheck(W, f);
    }
    if (!f.air && f.pl && f.st === 'atk' && f.mv && f.mv.end === 'fall' && false) f.st = 'idle';
  }

  function smOut(W, f) {
    const z = W.S.bz;
    return f.x < z.l || f.x > z.r || f.y < z.t || f.y > z.b;
  }

  function smUpdF(W, f) {
    smEdges(f);
    if (f.lcd > 0) f.lcd--; if (f.dropT > 0) f.dropT--; if (f.inv > 0) f.inv--; if (f.orb > 0) f.orb--; if (f.itcd > 0) f.itcd--;
    f.tm++; f.shake = f.hl > 0 ? f.hl : 0;
    if (f.st === 'dead') { if (!f.out && --f.ret <= 0) smRespawn(W, f); return; }
    if (f.hl > 0) { smHitlag(W, f); return; }
    smFlags(f);
    f.ng = false;
    f.sf++;
    if (f.st !== 'shield' && f.sh < 50) f.sh = Math.min(50, f.sh + .1);
    if (f.item && f.item.k === 'bomb') { f.item.fuse--; if (f.item.fuse <= 0) { smExplode(W, f.x, f.y - 12, f.slot); f.item = null; } }
    switch (f.st) {
      case 'idle': case 'walk': case 'run': case 'dash': case 'turn': case 'crouch': case 'land': smGround(W, f); break;
      case 'air': case 'help': smAirCtl(W, f); break;
      case 'shield': smShieldCtl(W, f); break;
      case 'atk': smUpdAtk(W, f); break;
      case 'hit': case 'tumble': smHitState(W, f); break;
      case 'grab': smGrabCtl(W, f); break;
      case 'held': smHeldCtl(W, f); break;
      case 'down': smDown(W, f); break;
      case 'ledge': smLedgeCtl(W, f); break;
      case 'respawn':
        f.vx = f.vy = 0;
        if (f.sf >= 24 && (f.edge > 0 || f.sf >= 220)) { smSet(f, 'air'); f.inv = 80; f.air = true; }
        break;
      default: smTimed(W, f);
    }
    smPhys(W, f);
    if (f.st !== 'dead' && smOut(W, f)) smKO(W, f);
  }

  function smHitlag(W, f) {
    f.hl--;
    if (f.pend) {
      if (f.fxt === 5 || f.fyt === 5) {
        const sx = f.fxt === 5 ? f.fxd * 3 : 0, sy = f.fyt === 5 ? -f.fyd * 3 : 0;
        if (!smBlockedBy(W, f.x + sx, f.y + sy, f.C.R, f.C.H)) { f.x += sx; f.y += sy; if (sy > 0 && !f.air) f.y -= sy; }
      }
      if (f.hl <= 0) smLaunch(W, f);
    }
  }

  function smRespawn(W, f) {
    const S = W.S;
    Object.assign(f, {
      x: S.rs[0], y: S.rs[1], vx: 0, vy: 0, kx: 0, ky: 0, dmg: 0, air: true, pl: null, jumps: 0, upUsed: false, adUsed: false, fast: false, hs: 0, hl: 0, pend: null,
      mv: null, item: null, hold: -1, heldBy: -1, led: null, sh: 50, tumble: false, orb: 0, inv: 0, face: S.rs[0] > 0 ? -1 : 1, lastHit: -1
    });
    f.face = 1;
    smSet(f, 'respawn');
    smEv(W, { k: 'respawn', x: f.x, y: f.y, s: f.slot });
  }

  function smCap(cx, cy, r, f) {
    const R = f.C.R, H = f.st === 'crouch' ? f.C.H * .62 : f.st === 'down' ? f.C.H * .42 : f.C.H;
    const y0 = f.y - H + R, y1 = f.y - R, py = clamp(cy, y0, Math.max(y0, y1)), dx = cx - f.x, dy = cy - py;
    return dx * dx + dy * dy < (r + R) * (r + R);
  }

  function smSpawnProj(W, f, p, chv) {
    if (W.proj.length > 48) return;
    const hd = f.face;
    W.proj.push({
      id: W.nid++, own: f.slot, x: f.x + p.x * hd, y: f.y + p.y, vx: p.vx * hd * (1 + chv * .5), vy: p.vy, g: p.g, r: p.r * (1 + chv * .8), d: p.d * (1 + chv * 1.2),
      ang: p.ang, kb: p.kb, b: p.b + chv * 10, life: Math.round(p.life * (1 + chv * .5)), sz: p.sz * (1 + chv * .6), col: p.col, sh: p.sh, bn: p.bn || 0, pr: p.pr || 0,
      hom: p.hom || 0, rb: p.rb || 0, rot: 0, rs: p.rot || 0, e: p.e, sp: p.sp, t: 0, hit: {}, hd, ch: chv
    });
    smEv(W, { k: 'shoot', x: f.x + p.x * hd, y: f.y + p.y, e: p.e, sh: p.sh, ch: chv, s: f.slot });
  }

  function smPlant(W, f) {
    const mine = W.proj.filter(p => p.trap && p.own === f.slot);
    if (mine.length >= 3) { const o = mine[0]; W.proj.splice(W.proj.indexOf(o), 1); }
    W.proj.push({
      id: W.nid++, own: f.slot, x: f.x + f.face * 14, y: f.y - 4, vx: f.face * (f.air ? .6 : 0), vy: f.air ? -.4 : 0, g: .12, r: 7, d: 9, ang: 80, kb: 80, b: 30, life: 1000, sz: 7,
      col: '#65a30d', sh: 'thorn', bn: 0, pr: 0, hom: 0, rb: 0, rot: 0, rs: 0, e: 'n', sp: 2, t: 0, hit: {}, hd: f.face, trap: 1, land: 0
    });
    smEv(W, { k: 'plant', x: f.x + f.face * 14, y: f.y, s: f.slot });
  }

  function smExplode(W, x, y, own) {
    W.proj.push({
      id: W.nid++, own, x, y, vx: 0, vy: 0, g: 0, r: 27, d: 11, ang: 361, kb: 96, b: 38, life: 7, sz: 27, col: '#fb923c', sh: 'boom', bn: 0, pr: 1, hom: 0, rb: 0, rot: 0, rs: 0,
      e: 'f', sp: 2, t: 0, hit: {}, hd: 1, exp: 1
    });
    smEv(W, { k: 'boom', x, y });
  }

  function smBlaster(W, f) {
    const it = f.item; if (!it) return;
    smSpawnProj(W, f, { x: 20, y: -16, vx: 4.6, vy: 0, g: 0, r: 2.6, d: 3.5, ang: 361, kb: 0, b: 24, life: 62, sz: 4, col: '#f43f5e', sh: 'laser', e: 'z', sp: 1 }, 0);
    it.ammo--; if (it.ammo <= 0) { f.item = null; smEv(W, { k: 'itembreak', x: f.x, y: f.y - 14 }); }
  }

  function smUseItem(W, f) {
    const it = f.item;
    if (it.k === 'bat') smStart(f, SM_ITM.bat, 'a');
    else if (it.k === 'blaster') smStart(f, SM_ITM.blast, 'a');
    else smStart(f, SM_ITM.thr, 'a');
  }

  function smThrowItem(W, f) {
    const it = f.item; if (!it) return;
    const sx = f.face * 2.4 + f.in.x * .8, sy = -1.3 + (f.in.y > .5 ? -1.4 : f.in.y < -.5 ? 1.4 : 0);
    if (it.k === 'bomb') {
      W.proj.push({
        id: W.nid++, own: f.slot, x: f.x + f.face * 10, y: f.y - 18, vx: sx, vy: sy, g: .11, r: 6, d: 4, ang: 361, kb: 20, b: 24, life: Math.max(20, it.fuse), sz: 6, col: '#1f2937', sh: 'bomb',
        bn: 3, pr: 0, hom: 0, rb: 0, rot: 0, rs: .2, e: 'n', sp: 1, t: 0, hit: {}, hd: f.face, bomb: 1
      });
    } else {
      W.proj.push({
        id: W.nid++, own: f.slot, x: f.x + f.face * 10, y: f.y - 18, vx: sx * 1.2, vy: sy, g: .1, r: 6, d: 6, ang: 361, kb: 30, b: 26, life: 60, sz: 7, col: it.k === 'bat' ? '#b45309' : '#64748b',
        sh: it.k, bn: 0, pr: 0, hom: 0, rb: 0, rot: 0, rs: .4, e: 'n', sp: 1, t: 0, hit: {}, hd: f.face
      });
    }
    f.item = null; smEv(W, { k: 'itemthrow', x: f.x, y: f.y - 16 });
  }

  function smPick(W, f, it) {
    const i = W.items.indexOf(it); if (i >= 0) W.items.splice(i, 1);
    f.item = { k: it.k, fuse: SM_ITEMS.bomb.fuse, ammo: SM_ITEMS.blaster.ammo, dur: SM_ITEMS.bat.dur };
    smEv(W, { k: 'pick', x: f.x, y: f.y - 14, s: f.slot });
    smSet(f, 'land'); f.lag = 8;
  }

  function smBreakHold(W, T) {
    const G = W.F[T.heldBy];
    T.heldBy = -1;
    if (G && G.hold === T.slot) { G.hold = -1; G.mv = null; G.act = -1; smSet(G, 'land'); G.lag = 18; }
  }

  function smGrabHit(W, A, T) {
    if (T.air || T.fi || T.st === 'ledge' || T.st === 'held' || T.st === 'dead' || T.st === 'respawn' || T.st === 'grab') return false;
    if (T.mv) { T.mv = null; T.act = -1; }
    A.mv = null; A.act = -1; smSet(A, 'grab'); A.hold = T.slot; A.htm = 100 + T.dmg * 1.25; A.vx = 0;
    smSet(T, 'held'); T.heldBy = A.slot; T.hs = 0; T.pend = null; T.vx = 0; T.kx = 0; T.ky = 0;
    smEv(W, { k: 'grab', x: A.x + A.face * 10, y: A.y - 14, s: A.slot });
    return true;
  }

  function smPummel(W, A) {
    const T = W.F[A.hold]; if (!T || T.st !== 'held') return;
    T.dmg = Math.min(999, T.dmg + 1.6); A.dealt += 1.6; A.hl = 3; T.shake = 3;
    smEv(W, { k: 'hit', x: T.x, y: T.y - 12, e: 'n', sp: 0, kb: 10, d: 1.6, hd: A.face });
  }

  function smThrow(W, A, th) {
    const T = W.F[A.hold]; if (!T || T.st !== 'held') return;
    const hd = th.dir === 'b' ? -A.face : A.face;
    if (th.dir === 'b') A.face = -A.face;
    smSet(T, 'air'); T.heldBy = -1; T.air = false;
    smHit(W, { own: A, d: th.d, ang: th.ang, kb: th.kb, b: th.b, e: 'n', sp: 2, hl: .55, hd, px: T.x, py: T.y - 12, thr: 1 }, T);
    A.hold = -1;
  }

  function smShieldHit(W, H, T) {
    const A = H.own, d = H.d * (A ? A.chgMul : 1), hl = clamp(Math.floor(d * .65 + 6), 3, 20);
    T.sh -= d * 1.1 + (H.sp === 2 ? 3 : 0);
    T.hl = hl; if (A && !H.prj) { A.hl = hl; A.conn = 1; if (!A.air) A.vx = -H.hd * Math.min(1.2, .4 + d * .04); }
    T.vx = H.hd * Math.min(1.7, .55 + d * .07);
    smEv(W, { k: 'shieldhit', x: H.px, y: H.py, s: T.slot, d, e: H.e });
    if (T.sh <= 0) smShieldBreak(W, T);
    return 2;
  }

  function smHit(W, H, T) {
    const A = H.own;
    if (T.fi || T.st === 'dead' || T.st === 'respawn') return 0;
    if (T.st === 'shield') return smShieldHit(W, H, T);
    if (T.fc && T.mv && T.mv.ctr) {
      if (H.prj || !A) return 1;
      const c = T.mv.ctr, dd = Math.max(c.min, H.d * c.d), hl = clamp(Math.floor(dd * .65 + 6), 6, 24);
      T.face = smSgn(A.x - T.x) || T.face; T.hl = hl; A.hl = hl; T.mf = Math.max(T.mf, 28); T.inv = Math.max(T.inv, 14);
      smEv(W, { k: 'counter', x: H.px, y: H.py, s: T.slot });
      const hd = T.face;
      smHit(W, { own: T, d: dd, ang: c.ang, kb: c.kb, b: c.b, e: 's', sp: 2, hl: 1, hd, px: A.x, py: A.y - 12 }, A);
      return 1;
    }
    const mult = A ? A.chgMul : 1;
    let d = H.d * mult; if (T.orb > 0) d *= .5;
    T.dmg = Math.min(999, T.dmg + d);
    if (A) A.dealt += d;
    const p = T.dmg, w = T.S.w;
    const kb = (((p / 10 + p * d / 20) * (200 / (w + 100)) * 1.4) + 18) * (H.kb / 100) + H.b;
    const hlf = clamp(Math.floor((d * .65 + 6) * (H.hl || 1)), 3, 24);
    if (A && !H.prj && A.mv === SM_ITM.bat && A.item) { A.item.dur--; if (A.item.dur <= 0) { A.item = null; smEv(W, { k: 'itembreak', x: A.x, y: A.y - 14 }); } }
    if (A && !H.prj) { A.hl = hlf; A.conn = 1; }
    T.hl = hlf;
    if (A) { T.lastHit = A.slot; T.lhT = W.t; }
    smEv(W, { k: 'hit', x: H.px, y: H.py, e: H.e, sp: H.sp, kb, d, hd: H.hd, s: T.slot });
    if (T.fa && d < 14) { T.hl = Math.min(hlf, 6); return 1; }
    if (T.st === 'held') smBreakHold(W, T);
    if (T.st === 'ledge') { smLedgeLeave(T); T.air = true; }
    if (T.st === 'grab' && T.hold >= 0) { const V = W.F[T.hold]; if (V) { V.heldBy = -1; smSet(V, 'air'); V.inv = 10; } T.hold = -1; }
    T.mv = null; T.tgt = null; T.act = -1; T.fast = false;
    smSet(T, 'hit'); T.hs = 0; T.hitf = 0;
    T.pend = { kb, ang: H.ang, hd: H.hd, own: A ? A.slot : -1 };
    return 1;
  }

  function smLaunch(W, T) {
    const P = T.pend; T.pend = null;
    if (!P) return;
    let ang = P.ang, kb = P.kb;
    if (ang === 361) ang = T.air ? 45 : kb < 32 ? 0 : 44;
    const a0 = ang * smD;
    let ux = P.hd * Math.cos(a0), uy = Math.sin(a0);
    const sx = T.in.x, sy = T.in.y;
    if (Math.hypot(sx, sy) > .25) {
      const pd = clamp(sx * -uy + sy * ux, -1, 1);
      const na = Math.atan2(uy, ux) + pd * SM_DI;
      ux = Math.cos(na); uy = Math.sin(na);
    }
    const sp = kb * .03;
    T.vx = 0; T.vy = 0; T.kx = ux * sp; T.ky = -uy * sp;
    T.hs = Math.max(1, Math.floor(kb * .4));
    T.tumble = kb >= 80;
    if (!T.air) {
      if (T.ky > .15) { T.ky = -T.ky * .8; T.air = true; T.pl = null; T.y -= .8; }
      else if (T.ky < -.05) { T.air = true; T.pl = null; T.y -= .8; }
      else T.ky = 0;
    }
    smSet(T, T.tumble ? 'tumble' : 'hit'); T.hitf = 0;
    if (kb > 140) smEv(W, { k: 'launch', x: T.x, y: T.y - 12, kb, s: T.slot, a: Math.atan2(T.ky, T.kx) });
  }

  function smKO(W, f) {
    const z = W.S.bz;
    const x = clamp(f.x, z.l, z.r), y = clamp(f.y, z.t, z.b);
    smEv(W, { k: 'ko', x, y, s: f.slot, a: Math.atan2(f.y - clamp(f.y, z.t, z.b) || f.ky, f.x - clamp(f.x, z.l, z.r) || f.kx) });
    let by = -1;
    if (f.lastHit >= 0 && f.lastHit !== f.slot && W.t - f.lhT < 420) by = f.lastHit;
    if (by >= 0) W.F[by].ko++; else f.sd++;
    f.falls++;
    if (f.hold >= 0) { const V = W.F[f.hold]; if (V) { V.heldBy = -1; smSet(V, 'air'); V.inv = 12; } f.hold = -1; }
    if (f.heldBy >= 0) smBreakHold(W, f);
    if (f.led) smLedgeLeave(f);
    f.mv = null; f.pend = null; f.item = null; f.hl = 0; f.kx = f.ky = f.vx = f.vy = 0; f.act = -1; f.hs = 0; f.tumble = false;
    smSet(f, 'dead'); f.ret = 70;
    if (W.mode === 'stock' || W.sudden) { f.stocks--; if (f.stocks <= 0) { f.out = 1; f.outT = W.t; } }
    f.x = x; f.y = y;
    if (W.sudden && !W.over) smEnd(W);
  }

  function smRank(W) {
    const rows = W.F.map(f => ({ slot: f.slot, kos: f.ko, sd: f.sd, falls: f.falls, dealt: Math.round(f.dealt), stocks: f.stocks, dmg: Math.round(f.dmg), out: f.outT || 0, score: f.ko - f.sd }));
    rows.sort((a, b) => W.mode === 'time' ? (b.score - a.score || a.falls - b.falls) : ((b.out ? 0 : 1) - (a.out ? 0 : 1) || b.stocks - a.stocks || b.out - a.out || a.dmg - b.dmg));
    return rows;
  }

  function smEnd(W) {
    W.over = 1; W.overT = 0;
    const rows = smRank(W);
    let win = rows[0] ? rows[0].slot : -1;
    if (W.mode === 'time' && rows.length > 1 && rows[0].score === rows[1].score && rows[0].falls === rows[1].falls) win = -1;
    W.res = { win, rows };
    smEv(W, { k: 'end', win });
  }

  function smCheckEnd(W) {
    if (W.over) return;
    const alive = W.F.filter(f => !f.out);
    if (W.mode === 'stock' && alive.length <= 1) { smEnd(W); return; }
    if (W.limit > 0 && W.t >= W.limit && !W.sudden) {
      const rows = smRank(W);
      let tied = rows.filter(r => W.mode === 'time' ? r.score === rows[0].score && r.falls === rows[0].falls : r.stocks === rows[0].stocks && r.dmg === rows[0].dmg);
      if (tied.length <= 1) { smEnd(W); return; }
      W.sudden = 1; W.mode = 'stock';
      W.F.forEach(f => {
        if (tied.some(r => r.slot === f.slot)) { f.dmg = 300; f.stocks = 1; f.out = 0; if (f.st === 'dead') smRespawn(W, f); } else { f.out = 1; f.outT = W.t; f.st = 'dead'; f.stocks = 0; }
      });
      smEv(W, { k: 'sudden' });
    }
  }

  function smResolve(W) {
    for (const A of W.F) {
      if (A.st !== 'atk' || !A.mv || A.act < 0) continue;
      const m = A.mv, fr = A.act, hitNow = {};
      for (const h of m.hb) {
        if (fr < h.f0 || fr > h.f1 || h.nohit) continue;
        if (h.air && !A.air) continue;
        const hx = A.x + h.x * A.face, hy = A.y + h.y;
        if (h.d >= 3 && !h.gb) {
          for (let n = W.proj.length - 1; n >= 0; n--) {
            const p = W.proj[n];
            if (p.exp || p.trap || p.own === A.slot || p.pr) continue;
            const dx = p.x - hx, dy = p.y - hy;
            if (dx * dx + dy * dy < (h.r + p.r) * (h.r + p.r)) {
              if (h.sw || (A.mv === SM_ITM.bat)) { p.own = A.slot; p.vx = A.face * Math.max(2.6, Math.abs(p.vx) * 1.4); p.vy *= .3; p.d *= 1.4; p.hit = {}; p.hd = A.face; smEv(W, { k: 'reflect', x: p.x, y: p.y }); }
              else { smEv(W, { k: 'puff', x: p.x, y: p.y, col: p.col }); W.proj.splice(n, 1); }
            }
          }
        }
        for (const T of W.F) {
          if (T === A || T.st === 'dead' || T.st === 'respawn' || hitNow[T.slot]) continue;
          if (T.st === 'held' && T.heldBy === A.slot) continue;
          const key = T.slot + ':' + h.id, last = A.hitSet[key];
          if (last !== undefined && !(h.rh && W.t - last >= h.rh)) continue;
          if (!smCap(hx, hy, h.r, T)) continue;
          if (h.gb) {
            if (smGrabHit(W, A, T)) { A.hitSet[key] = W.t; hitNow[T.slot] = 1; }
            continue;
          }
          let hd = h.rev ? -A.face : A.face;
          if (h.ang === 361) { const dx = T.x - A.x; if (Math.abs(dx) > 3) hd = dx > 0 ? 1 : -1; }
          const r = smHit(W, { own: A, d: h.d, ang: h.ang, kb: h.kb, b: h.b, e: h.e, sp: h.sp, hl: h.hl, hd, px: hx, py: hy }, T);
          if (r) { A.hitSet[key] = W.t; hitNow[T.slot] = 1; }
          if (A.st !== 'atk') break;
        }
        if (A.st !== 'atk') break;
      }
    }
  }
  function smStepProj(W) {
    for (let n = W.proj.length - 1; n >= 0; n--) {
      const p = W.proj[n]; p.t++;
      let dead = false;
      if (p.exp) {
        if (p.t > p.life) dead = true;
      } else if (p.trap) {
        if (p.land) { if (p.t - p.land > p.life) dead = true; }
        else {
          p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .98;
          for (const s of W.solids) if (p.x > s.x0 && p.x < s.x1 && p.y >= s.y0 && p.y - p.vy <= s.y0 + 1) { p.y = s.y0 - 3; p.land = p.t; p.vx = p.vy = 0; p.g = 0; }
          if (!p.land) for (const s of W.soft) if (p.x > s.x0 && p.x < s.x1 && p.vy > 0 && p.y >= s.y && p.y - p.vy <= s.y + 1) { p.y = s.y - 3; p.land = p.t; p.vx = p.vy = 0; p.g = 0; }
          if (p.y > W.S.bz.b || p.t > 300) dead = true;
        }
      } else {
        const own = W.F[p.own];
        if (p.hom) {
          let b = null, bd = 1e9;
          for (const T of W.F) if (T.slot !== p.own && T.st !== 'dead' && T.st !== 'respawn') { const d = Math.hypot(T.x - p.x, T.y - 12 - p.y); if (d < bd) { bd = d; b = T; } }
          if (b) { const sp = Math.hypot(p.vx, p.vy) || 1, dx = b.x - p.x, dy = b.y - 12 - p.y, dn = Math.hypot(dx, dy) || 1; p.vx += (dx / dn * sp - p.vx) * p.hom; p.vy += (dy / dn * sp - p.vy) * p.hom; const s2 = Math.hypot(p.vx, p.vy) || 1; p.vx *= sp / s2; p.vy *= sp / s2; }
        }
        if (p.rb && p.t > p.rb && own && own.st !== 'dead') {
          const dx = own.x - p.x, dy = own.y - 14 - p.y, dn = Math.hypot(dx, dy) || 1;
          p.vx += dx / dn * .24; p.vy += dy / dn * .24; const sp = Math.hypot(p.vx, p.vy); if (sp > 4.2) { p.vx *= 4.2 / sp; p.vy *= 4.2 / sp; }
          if (dn < 12 && p.t > p.rb + 6) dead = true;
        }
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.rs;
        for (const s of W.solids) {
          if (p.x > s.x0 - p.r * .3 && p.x < s.x1 + p.r * .3 && p.y > s.y0 && p.y < s.y1) {
            if (p.bn > 0 && p.vy > 0 && p.y - p.vy <= s.y0 + 1) { p.y = s.y0 - .2; p.vy = -Math.max(Math.abs(p.vy), 1.2) * .85; p.bn--; if (p.bomb) p.vx *= .8; }
            else if (p.bomb) { p.x -= p.vx; p.y -= p.vy; p.vx *= -.4; p.vy = 0; }
            else { smEv(W, { k: 'puff', x: p.x, y: p.y, col: p.col }); dead = true; }
          }
        }
        if (!dead && p.bn > 0 && p.vy > 0) for (const s of W.soft) if (p.x > s.x0 && p.x < s.x1 && p.y >= s.y && p.y - p.vy <= s.y + 1) { p.y = s.y - .2; p.vy = -Math.max(Math.abs(p.vy), 1.2) * .85; p.bn--; }
        if (p.t > p.life) { if (p.bomb) smExplode(W, p.x, p.y, p.own); dead = true; }
        const z = W.S.bz;
        if (p.x < z.l - 40 || p.x > z.r + 40 || p.y < z.t - 40 || p.y > z.b + 40) dead = true;
      }
      if (!dead && !(p.trap && !p.land) && !(p.trap && p.t - p.land < 22)) {
        for (const T of W.F) {
          if (T.st === 'dead' || T.st === 'respawn') continue;
          if (T.slot === p.own && !p.exp) continue;
          const last = p.hit[T.slot];
          if (last !== undefined && (p.exp || W.t - last < 16)) continue;
          if (T.fr && !p.exp && !p.trap) {
            const cx = T.x + T.face * 6, cy = T.y - T.C.H * .5, rr = T.C.R * 3;
            if ((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy) < (rr + p.r) * (rr + p.r)) {
              p.own = T.slot; p.vx = -p.vx * 1.25; p.vy = -p.vy * 1.25; p.d *= 1.35; p.hit = {}; p.t = Math.min(p.t, p.life - 40); p.hd = -p.hd;
              smEv(W, { k: 'reflect', x: p.x, y: p.y });
              break;
            }
            continue;
          }
          if (!smCap(p.x, p.y, p.r, T)) continue;
          const hd = p.exp ? (T.x >= p.x ? 1 : -1) : (smSgn(p.vx) || p.hd);
          if (p.bomb) { smExplode(W, p.x, p.y, p.own); dead = true; break; }
          if (p.d <= 0) continue;
          const r = smHit(W, { own: W.F[p.own] || null, d: p.d, ang: p.ang, kb: p.kb, b: p.b, e: p.e, sp: p.sp, hl: 1, hd, px: p.x, py: p.y, prj: true }, T);
          if (r) { p.hit[T.slot] = W.t; if (!p.pr) { dead = true; if (p.trap) smEv(W, { k: 'puff', x: p.x, y: p.y, col: p.col }); break; } }
        }
      }
      if (dead) W.proj.splice(n, 1);
    }
  }

  function smItemType(W) {
    let tot = 0;
    for (const k of SM_IK) tot += SM_ITEMS[k].w;
    let r = smRng(W) * tot;
    for (const k of SM_IK) { r -= SM_ITEMS[k].w; if (r <= 0) return k; }
    return 'heart';
  }

  function smStepItems(W) {
    if (W.itemRate > 0 && !W.over) {
      if (--W.itemT <= 0 && W.items.length < 3) {
        const S = W.S, sol = S.solids[0], x = sol.x0 + 20 + smRng(W) * (sol.x1 - sol.x0 - 40);
        W.items.push({ id: W.nid++, k: smItemType(W), x, y: S.bz.t + 20, vx: 0, vy: 0, life: 1800 });
        smEv(W, { k: 'itemspawn', x, y: S.bz.t + 20 });
        W.itemT = Math.round((W.itemRate > 1 ? 560 : 1100) * (.7 + smRng(W) * .6));
      } else if (W.itemT <= 0) W.itemT = 200;
    }
    for (let n = W.items.length - 1; n >= 0; n--) {
      const it = W.items[n];
      it.life--; it.vy = Math.min(it.vy + .09, 2.2);
      const py = it.y; it.y += it.vy;
      if (!it.rest) {
        let hit = null;
        for (const s of W.solids) if (it.x > s.x0 && it.x < s.x1 && py <= s.y0 + 1 && it.y >= s.y0) hit = s.y0;
        if (hit == null) for (const p of W.soft) if (it.x > p.x0 && it.x < p.x1 && py <= p.y - p.dy + 1 && it.y >= p.y) hit = p.y;
        if (hit != null) { it.y = hit; it.vy = 0; it.rest = 1; it.pl = 1; }
      } else {
        let on = null;
        for (const p of W.soft) if (it.x > p.x0 && it.x < p.x1 && Math.abs(it.y - p.y) < 3) on = p;
        if (on) { it.y = on.y; it.x += on.dx; } else if (!W.solids.some(s => it.x > s.x0 && it.x < s.x1 && Math.abs(it.y - s.y0) < 3)) it.rest = 0;
      }
      const sd = SM_ITEMS[it.k];
      for (const f of W.F) {
        if (f.st === 'dead' || f.st === 'respawn' || f.out) continue;
        if (it.k !== 'heart' && it.k !== 'orb') continue;
        if (Math.hypot(f.x - it.x, f.y - 10 - it.y) < f.C.R + sd.r + 6) {
          if (it.k === 'heart') { f.dmg = Math.max(0, f.dmg - sd.heal); smEv(W, { k: 'heal', x: f.x, y: f.y - 14, s: f.slot }); }
          else { f.orb = 600; smEv(W, { k: 'orb', x: f.x, y: f.y - 14, s: f.slot }); }
          W.items.splice(n, 1); break;
        }
      }
      if (W.items[n] === it && (it.life <= 0 || it.y > W.S.bz.b)) W.items.splice(n, 1);
    }
  }

  function smPush(W) {
    const F = W.F;
    for (let a = 0; a < F.length; a++) for (let b = a + 1; b < F.length; b++) {
      const p = F[a], q = F[b];
      if (p.air || q.air || p.st === 'dead' || q.st === 'dead' || p.st === 'ledge' || q.st === 'ledge' || p.st === 'held' || q.st === 'held' || p.st === 'grab' || q.st === 'grab' || p.st === 'respawn' || q.st === 'respawn') continue;
      if (p.fi || q.fi || p.hl > 0 || q.hl > 0) continue;
      const dx = q.x - p.x, m = (p.C.R + q.C.R) * .85;
      if (Math.abs(dx) < m && Math.abs(p.y - q.y) < 6) {
        const s = dx === 0 ? (a % 2 ? 1 : -1) : smSgn(dx), push = (m - Math.abs(dx)) * .12;
        if (!smBlockedBy(W, p.x - s * push, p.y, p.C.R, p.C.H)) p.x -= s * push;
        if (!smBlockedBy(W, q.x + s * push, q.y, q.C.R, q.C.H)) q.x += s * push;
      }
    }
  }

  function smStep(W) {
    W.t++;
    smStageStep(W);
    for (const f of W.F) smUpdF(W, f);
    smPush(W);
    smResolve(W);
    smStepProj(W);
    smStepItems(W);
    if (W.over) W.overT++; else smCheckEnd(W);
  }

  function smAIGeo(W) {
    if (W.aiG) return W.aiG;
    let x0 = 1e9, x1 = -1e9, top = 1e9;
    for (const s of W.solids) { x0 = Math.min(x0, s.x0); x1 = Math.max(x1, s.x1); top = Math.min(top, s.y0); }
    return W.aiG = { x0, x1, top, cx: (x0 + x1) / 2 };
  }

  function smAIOnStage(W, f) {
    for (const s of W.solids) if (f.x > s.x0 - 8 && f.x < s.x1 + 8 && f.y <= s.y0 + 3) return true;
    for (const p of W.soft) if (f.x > p.x0 - 4 && f.x < p.x1 + 4 && f.y <= p.y + 3 && f.y > p.y - 150) return true;
    return false;
  }

  function smAIFoe(W, f) {
    let b = null, bd = 1e9;
    for (const o of W.F) {
      if (o === f || o.out || o.st === 'dead' || o.st === 'respawn') continue;
      const d = Math.abs(o.x - f.x) + Math.abs(o.y - f.y) * 1.3 - (o.dmg > 90 ? 20 : 0) - (f.ai && f.ai.tgt === o.slot ? 25 : 0);
      if (d < bd) { bd = d; b = o; }
    }
    if (b && f.ai) f.ai.tgt = b.slot;
    return b;
  }

  function smAIRecover(W, f, I, ai, L, G) {
    const S = f.S, C = f.C;
    let best = null, bd = 1e9;
    for (const Lg of W.ledges) {
      const d = Math.hypot(Lg.x - f.x, Lg.y - f.y) + (Lg.occ >= 0 && Lg.occ !== f.slot ? 60 : 0);
      if (d < bd) { bd = d; best = Lg; }
    }
    if (!best) { I.x = smSgn(G.cx - f.x); return; }
    const tx = best.x + best.side * 7, ty = best.y + C.H * .5;
    const dx = tx - f.x, dy = ty - f.y, ad = Math.abs(dx);
    I.x = ad > 3 ? smSgn(dx) : 0; I.y = 0;
    const st = f.st, u = C.sp.u;
    if (st === 'atk' && f.mv && (f.mv.ai === 'tele' || f.mv.ai === 'dir')) {
      const n = Math.hypot(dx, dy) || 1; I.x = dx / n; I.y = -dy / n; return;
    }
    if (st === 'atk' && f.mv && f.mv.ai === 'rise') { I.x = smSgn(dx); return; }
    if (st !== 'air' && st !== 'help') return;
    if (st === 'air') {
      if (f.vy > .2 && f.jumps < S.nj && (f.y > ty + 8 || (ad > 70 && f.vy > 1.4)) && Math.random() < .35 + L.rec * .6) { I.j = 1; return; }
      const needUp = f.jumps >= S.nj || f.y > ty + 70;
      const reach = u.ai === 'tele' ? 75 : u.ai === 'dir' ? 120 : u.ai === 'tether' ? 66 : 70 + (S.nj - f.jumps) * 22;
      if (needUp && !f.upUsed && Math.random() < L.rec) {
        if (u.ai === 'tether') { if (Math.hypot(dx, dy) < 62) { I.b = 1; f.upUsed = true; I.y = 1; } }
        else if (u.ai === 'tele') { if (Math.hypot(dx, dy) < reach) { const n = Math.hypot(dx, dy) || 1; I.x = dx / n; I.y = -dy / n; I.b = 1; f.upUsed = true; } }
        else if (u.ai === 'dir') { if (Math.hypot(dx, dy) < reach) { const n = Math.hypot(dx, dy) || 1; I.x = dx / n; I.y = -dy / n; I.b = 1; f.upUsed = true; } }
        else if (u.ai === 'slam') { }
        else if (dy < 20 && dy > -reach && ad < 90) { I.y = 1; I.x = smSgn(dx); I.b = 1; f.upUsed = true; }
      }
      if (!f.upUsed && ad > 95 && f.y < ty + 25 && C.sp.s.ai === 'dash' && ai.sd !== f.air && Math.random() < .08 * L.rec) { I.b = 1; I.x = smSgn(dx); ai.sd = f.air; }
    }
  }

  function smAIDI(W, f, I, ai, L) {
    const P = f.pend;
    if (!P) return;
    if (Math.random() > L.di) { I.x = 0; I.y = 0; return; }
    const kb = P.kb;
    let ang = P.ang; if (ang === 361) ang = f.air ? 45 : kb < 32 ? 0 : 44;
    const a0 = ang * smD, ux = P.hd * Math.cos(a0), uy = Math.sin(a0), G = smAIGeo(W);
    const c1 = [-uy, ux], c2 = [uy, -ux];
    const sc = c => c[1] * .9 + smSgn(G.cx - f.x) * c[0] * .5;
    const c = sc(c1) >= sc(c2) ? c1 : c2;
    I.x = c[0]; I.y = c[1];
  }

  const SM_AIRANGE = (m) => m.rx;

  function smAIPickGround(W, f, foe, L, vuln) {
    const C = f.C, dx = foe.x - f.x, dy = foe.y - f.y, ad = Math.abs(dx), face = smSgn(dx) || f.face;
    const c = [];
    const add = (k, w, i) => { c.push({ k, w, i }); };
    const M = C.mv, ahead = ad < 90;
    const hz = (m, extra) => ad <= m.rx * .92 + (extra || 0) && dy > -34 && dy < 14;
    if (hz(M.jab1)) add('jab1', 2.2 * (1.1 - L.comb * .4), {});
    if (hz(M.ftilt)) add('ftilt', 2, { x: face });
    if (hz(M.dtilt)) add('dtilt', 1.1, { y: -1 });
    if (ad < 26 && dy < -18) { add('utilt', 2.2, { y: 1 }); add('usmash', vuln ? 3 : .5, { y: 1, m: 1 }); }
    if (hz(M.fsmash, 4)) add('fsmash', (vuln ? 4.5 : .8) * (foe.dmg > 70 ? 1.6 : 1) * (.5 + L.comb), { x: face, m: 1 });
    if (ad < 34 && dy > -16) add('dsmash', vuln ? 2 : .5, { y: -1, m: 1 });
    if (ad <= 34 && dy > -26 && dy < 14) add('grab', foe.st === 'shield' ? 6 : 1.2, { g: 1 });
    return c;
  }

  function smAIWeighted(c) {
    let t = 0; for (const o of c) t += o.w;
    if (t <= 0) return null;
    let r = Math.random() * t;
    for (const o of c) { r -= o.w; if (r <= 0) return o; }
    return c[c.length - 1];
  }

  function smAI(W, f) {
    const ai = f.ai || (f.ai = { t: 0, sh: 0, hb: null, tgt: -1, wait: 0, ldly: -1, cool: 0, sd: 0, lastSt: '' });
    const L = SM_AI[clamp((f.lvl || 5) - 1, 0, 8)], I = f.in, C = f.C, S = f.S, G = smAIGeo(W);
    I.a = I.b = I.j = I.g = I.m = 0;
    if (f.out || f.st === 'dead') { I.x = I.y = I.s = 0; return; }
    if (ai.hb && ai.hb.n > 0) { I[ai.hb.k] = 1; ai.hb.n--; }
    ai.t++;
    const dec = ai.t % L.rt === 0, st = f.st;
    if (st !== ai.lastSt) { ai.lastSt = st; ai.ldly = -1; }
    if (st === 'respawn') {
      I.x = 0; I.y = 0; I.s = 0;
      if (f.sf > 50 + ai.wait) { I.j = 1; I.x = smSgn(G.cx - f.x) || 1; ai.wait = ri(0, 60); }
      return;
    }
    if (f.hl > 0 && f.pend) { smAIDI(W, f, I, ai, L); return; }
    if (st === 'hit' || st === 'tumble') {
      I.s = 0; I.x = 0; I.y = 0;
      if (f.air && f.ky + f.vy > .4 && Math.random() < L.tech * .35) {
        let g = 1e9;
        for (const s of W.solids) if (f.x > s.x0 && f.x < s.x1 && s.y0 >= f.y - 2) g = Math.min(g, s.y0 - f.y);
        if (g < 15 && f.techT > 24) { I.s = 1; I.x = Math.random() < .5 ? 0 : smSgn(G.cx - f.x); }
      }
      if (f.air && f.hs < 6 && Math.random() < L.di * .5) I.x = smSgn(G.cx - f.x);
      return;
    }
    if (st === 'stun') { I.x = 0; I.y = 0; I.s = 0; if (ai.t % 3 === 0) { I.a = 1; I.j = 1; } return; }
    if (st === 'held') { I.x = ai.t % 2 ? 1 : -1; I.a = ai.t % 3 === 0 ? 1 : 0; I.s = ai.t % 4 === 0 ? 1 : 0; return; }
    if (st === 'grab') {
      I.s = 0;
      if (ai.ldly < 0) ai.ldly = ri(4, 22);
      if (--ai.ldly <= 0) {
        const T = W.F[f.hold];
        if (Math.random() < .35 && f.htm > 30) { I.a = 1; ai.ldly = ri(8, 18); }
        else if (T) {
          const edge = (f.x - G.cx) * f.face > 0 && Math.abs(f.x - G.cx) > (G.x1 - G.x0) * .3;
          I.x = 0; I.y = 0;
          if (T.dmg > 100 || edge) { if (edge) I.x = f.face; else I.x = -f.face; } else { const r = Math.random(); if (r < .3) I.x = f.face; else if (r < .55) I.x = -f.face; else if (r < .8) I.y = 1; else I.y = -1; }
          ai.ldly = 30;
        }
      }
      return;
    }
    if (st === 'down') {
      I.x = 0; I.y = 0;
      if (f.sf >= 18 && f.sf < 40) {
        const r = Math.random();
        if (r < .3) I.a = 1; else if (r < .6) I.x = Math.random() < .5 ? 1 : -1; else I.y = 1;
      }
      return;
    }
    if (st === 'ledge') {
      I.x = 0; I.y = 0; I.s = 0;
      if (ai.ldly < 0) ai.ldly = Math.round(ri(6, 70) * (1.2 - L.ledge));
      if (--ai.ldly <= 0 && f.sf > 6) {
        const Lg = f.led, toward = Lg ? -Lg.side : 1, r = Math.random();
        if (r < .3) I.x = toward; else if (r < .55) I.a = 1; else if (r < .75) { I.s = 1; } else if (r < .95) I.j = 1; else I.y = -1;
        if (!Lg) I.y = -1;
      }
      return;
    }
    const foe = smAIFoe(W, f);
    const onSt = smAIOnStage(W, f);
    if (f.air && !onSt && st !== 'atk' || (st === 'atk' && f.mv && f.mv.ai && !onSt && f.air)) {
      smAIRecover(W, f, I, ai, L, G);
      return;
    }
    if (!foe) { I.x = 0; I.y = 0; I.s = 0; return; }
    const dx = foe.x - f.x, dy = foe.y - f.y, ad = Math.abs(dx), face = smSgn(dx) || f.face;
    const vuln = foe.st === 'hit' || foe.st === 'tumble' || foe.st === 'down' || foe.st === 'stun' || foe.st === 'held' || foe.st === 'land' && foe.lag > 6 || (foe.st === 'atk' && foe.mv && foe.act > foe.mv.en + 2 && foe.act >= 0 && !foe.air);
    if (st === 'atk' && f.mv) {
      I.s = 0;
      const m = f.mv;
      if (m.cx && f.mf >= m.cx.f0 && f.mf <= m.cx.f1 && ad < m.rx + 6 && Math.random() < L.comb * .8 + .15) I.a = 1;
      if (m.ai === 'tele' || m.ai === 'dir') { const n = Math.hypot(dx, dy) || 1; I.x = dx / n; I.y = -dy / n; }
      if (m.ai === 'slam' || m.ai === 'rise') I.x = smSgn(dx);
      if (f.mf === 0 || m.air) { I.x = f.in.x; }
      return;
    }
    if (f.st === 'shield' || ai.sh > 0) {
      I.x = 0; I.y = 0; I.s = 1; ai.sh--;
      if (foe.st === 'atk' && foe.mv && foe.act > foe.mv.en && ad < 38 && Math.random() < L.comb + .2) { I.s = 0; I.g = 1; ai.sh = 0; }
      else if (ai.sh <= 0 && !(foe.st === 'atk' && ad < 50)) { I.s = 0; ai.sh = 0; }
      else if (foe.st !== 'atk' && foe.st !== 'hit' && ad < 30 && Math.random() < .08 * L.agg && f.st === 'shield') { I.g = 1; I.s = 0; }
      if (f.sh < 8) { I.s = 0; ai.sh = 0; }
      return;
    }
    if (f.item && f.st !== 'air') {
      const k = f.item.k;
      if (k === 'bat' && ad < 40 && Math.abs(dy) < 30 && dec) { I.a = 1; I.x = smSgn(dx); return; }
      if (k === 'blaster' && ad > 25 && ad < 200 && Math.abs(dy) < 24 && dec && Math.random() < .5) { if (Math.sign(dx) !== f.face) I.x = Math.sign(dx); else I.a = 1; return; }
      if (k === 'bomb' && ad > 30 && ad < 120 && dec && Math.random() < .3) { if (Math.sign(dx) !== f.face) I.x = Math.sign(dx); else I.a = 1; return; }
      if ((k === 'bat' || k === 'blaster') && ad >= 40) { I.x = smSgn(dx); return; }
    }
    if (!f.item && !f.air && dec && Math.random() < L.itm * .5) {
      let b = null, bd = 140;
      for (const it of W.items) { const d = Math.abs(it.x - f.x) + Math.abs(it.y - f.y); if (d < bd && it.rest && !it.hl) { bd = d; b = it; } }
      if (b) { ai.itm = b; }
    }
    if (ai.itm && !f.item && !f.air) {
      const it = ai.itm;
      if (W.items.indexOf(it) < 0) ai.itm = null;
      else { const d = it.x - f.x; if (Math.abs(d) < 14 && Math.abs(it.y - f.y) < 28) { if (it.k === 'heart' || it.k === 'orb') { ai.itm = null; } else if (dec) { I.g = 1; ai.itm = null; } I.x = 0; } else I.x = smSgn(d); if (Math.abs(it.y - f.y) > 30 && f.pl && f.pl.soft === undefined && dec && Math.abs(d) < 50) { I.j = 1; } if (it.y < f.y - 28 && Math.abs(d) < 20 && dec) I.j = 1; return; }
    }
    if (f.air) {
      I.s = 0;
      if (!dec && ai.t % 3) { return; }
      if (ad < 18) I.x = 0; else I.x = smSgn(dx);
      if (f.vy > .5 && f.in.y < 0 && dy > 20 && ad < 20) I.y = -1; else I.y = 0;
      const reach = Math.max(C.mv.fair.rx, C.mv.nair.rx) + 6;
      if (f.st === 'air' && ad < reach && dy > -40 && dy < 30 && Math.random() < L.acc * .5) {
        const bx = (foe.x - f.x) * f.face;
        let k;
        if (dy < -26 && ad < 26) k = 'uair'; else if (dy > 22 && ad < 22) k = 'dair'; else if (bx < -8) k = 'bair'; else if (Math.random() < .3) k = 'nair'; else k = 'fair';
        I.a = 1;
        if (k === 'uair') I.y = 1; else if (k === 'dair') I.y = -1; else if (k === 'fair') I.x = f.face; else if (k === 'bair') I.x = -f.face; else { I.x = 0; I.y = 0; }
        return;
      }
      if (f.st === 'air' && f.vy > 1 && f.jumps < S.nj && dy < -34 && ad < 40 && Math.random() < .3) { I.j = 1; return; }
      if (ad < 80 && C.sp.n.ai === 'proj' && Math.random() < .015 * L.agg && Math.abs(dy) < 30) { I.b = 1; I.y = 0; I.x = f.face; }
      return;
    }
    if (!dec && ai.cool > 0) { ai.cool--; return; }
    if (!dec) return;
    ai.cool = 0;
    const up = (k) => { I.y = k.y || 0; I.x = k.x != null ? k.x : I.x; };
    I.s = 0; I.y = 0;
    let incoming = null;
    for (const p of W.proj) {
      if (p.own === f.slot || p.exp || p.trap) continue;
      const d = p.x - f.x;
      if (Math.abs(p.y - (f.y - 12)) < 22 && d * p.vx < 0 && Math.abs(d) < 120 && Math.abs(d) / Math.max(.1, Math.abs(p.vx)) < 40) { incoming = p; break; }
    }
    if (incoming && Math.random() < L.def) {
      const rf = C.sp.d.rfl;
      if (rf) { I.b = 1; I.y = -1; return; }
      if (Math.random() < .5) { I.s = 1; ai.sh = 16; return; }
      I.j = 1; I.x = smSgn(f.x - incoming.x) * -1; return;
    }
    if (foe.st === 'atk' && foe.mv && foe.act >= 0 && foe.act < foe.mv.en + 2 && ad < foe.mv.rx + 24 && Math.random() < L.def * .9) {
      if (C.sp.d.ctr && Math.random() < .45) { I.b = 1; I.y = -1; ai.cool = 8; return; }
      I.s = 1; ai.sh = ri(12, 24); return;
    }
    if (vuln && ad < 45 && dy > -50 && Math.random() < .4 + L.comb * .5) {
      const c = smAIPickGround(W, f, foe, L, true), p = smAIWeighted(c);
      if (p) { smAIDo(f, I, ai, p, face, L); return; }
    }
    const reachF = C.mv.ftilt.rx;
    if (ad > reachF * .85 || Math.abs(dy) > 40) {
      if (Math.random() < L.agg + .15) {
        I.x = face;
        if (dy < -44 && ad < 50 && f.pl) { if (f.pl.soft) { } else if (Math.random() < .5) I.j = 1; }
        if (ad > 90 && C.sp.n.ai === 'proj' && Math.random() < .09 * L.acc + .02) { I.b = 1; I.x = face; ai.hb = { k: 'b', n: ri(0, 40) }; ai.cool = 6; return; }
        if (ad > 100 && C.sp.s.ai === 'dash' && Math.random() < .03 * L.agg) { I.b = 1; I.x = face; }
        if (ad > 60 && C.sp.s.ai === 'proj' && Math.random() < .03) { I.b = 1; I.x = face; }
        if (Math.abs(dy) > 40 && dy > 30 && f.pl && f.pl.soft && Math.random() < .3) I.y = -1;
        if (dy < -36 && f.pl && Math.random() < .08) I.j = 1;
      } else if (Math.random() < .3) I.x = -face; else I.x = 0;
      if (f.hitW && I.x === -f.hitW && f.pl) I.j = 1;
      if (f.x < G.x0 + 6 && I.x < 0 || f.x > G.x1 - 6 && I.x > 0) I.x = 0;
      return;
    }
    if (Math.random() > L.acc + .15) { I.x = Math.random() < .5 ? -face : 0; return; }
    const c = smAIPickGround(W, f, foe, L, vuln);
    if (C.sp.d.ai === 'trap' && ad > 40 && ad < 110 && Math.random() < .06) { I.b = 1; I.y = -1; return; }
    if (C.sp.s.ai === 'proj' && ad > 50 && Math.random() < .05) { I.b = 1; I.x = face; return; }
    const p = smAIWeighted(c);
    if (!p) { I.x = face; return; }
    smAIDo(f, I, ai, p, face, L);
  }

  function smAIDo(f, I, ai, p, face, L) {
    const o = p.i;
    I.x = o.x != null ? o.x : 0; I.y = o.y || 0;
    if (o.g) { I.g = 1; return; }
    if (o.m) { I.m = 1; ai.hb = { k: 'm', n: Math.random() < L.comb ? ri(0, 10) : ri(0, 40) }; return; }
    I.a = 1;
    if (p.k === 'dash') I.x = face;
  }

  const SM_OUT = 'rgba(8,10,20,.88)';
  const smRad = d => d * Math.PI / 180;

  function smTrack(a, t) {
    if (!a) return null;
    const n = a.length;
    if (t <= a[0][0]) return a[0].slice(1);
    if (t >= a[n - 1][0]) return a[n - 1].slice(1);
    for (let i = 0; i < n - 1; i++) {
      if (t < a[i + 1][0]) {
        const u = (t - a[i][0]) / Math.max(1e-6, a[i + 1][0] - a[i][0]), p = a[i], q = a[i + 1], r = [];
        for (let k = 1; k < p.length; k++) r.push(p[k] + (q[k] - p[k]) * u);
        return r;
      }
    }
    return a[n - 1].slice(1);
  }

  function smIK(ox, oy, tx, ty, l1, l2, bend, mxs) {
    let dx = tx - ox, dy = ty - oy, d = Math.hypot(dx, dy) || .001;
    const reach = l1 + l2, mx = reach * mxs;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    const s = d > reach * .999 ? d / (reach * .999) : 1, a = l1 * s, b = l2 * s;
    const c = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), ang = Math.atan2(dy, dx), da = Math.acos(c) * bend;
    return [ox + Math.cos(ang + da) * a, oy + Math.sin(ang + da) * a, ox + dx, oy + dy];
  }

  function smBasePose(f) {
    const st = f.st, tm = f.tm || 0, ph = f.x / 7.2, sp = Math.abs(f.vx);
    const P = { h: [6, -14.5], h2: [-3, -14.5], f: [3.2, 0], f2: [-3.2, 0], lean: 0, wa: 68, rot: 0, sq: 1, hip: 0, stone: 0, tuck: 0 };
    const bob = Math.sin(tm * .08) * .45;
    P.hip = bob * .6;
    P.h = [5 + Math.sin(tm * .08) * .6, -14 + bob * .6]; P.h2 = [-3.5 - Math.sin(tm * .08) * .6, -14 + bob * .6];
    switch (st) {
      case 'walk': {
        const s = Math.sin(ph), c = Math.cos(ph);
        P.f = [3 + s * 5.5, -Math.max(0, c) * 3]; P.f2 = [-3 - s * 5.5, -Math.max(0, -c) * 3];
        P.h = [4 - s * 3.5, -13.5]; P.h2 = [-3 + s * 3.5, -13.5]; P.lean = .06; P.hip = Math.abs(c) * .6;
        break;
      }
      case 'dash': case 'run': {
        const s = Math.sin(ph * 1.15), c = Math.cos(ph * 1.15);
        P.f = [3 + s * 8, -Math.max(0, c) * 6]; P.f2 = [-3 - s * 8, -Math.max(0, -c) * 6];
        P.h = [5 - s * 7, -14 - Math.max(0, -s) * 3]; P.h2 = [-3 + s * 7, -14 - Math.max(0, s) * 3]; P.lean = st === 'dash' ? .36 : .26; P.hip = 1 + Math.abs(c) * .8;
        break;
      }
      case 'turn': P.lean = -.2; P.f = [5, 0]; P.f2 = [-1, 0]; P.hip = 2; P.h = [-2, -12]; P.h2 = [6, -13]; break;
      case 'crouch': case 'jsq': case 'land': {
        const k = st === 'land' ? Math.min(1, (f.lag - f.sf + 2) / Math.max(1, f.lag) + .35) : 1;
        P.hip = 5 * k; P.lean = .22 * k; P.f = [5, 0]; P.f2 = [-4, 0]; P.h = [8, -10]; P.h2 = [-3, -9]; P.sq = 1 - .04 * k;
        break;
      }
      case 'air': case 'help': {
        const up = f.vy < -.3;
        P.f = [4.5, up ? -4.5 : -2.5]; P.f2 = [-3, up ? -6.5 : -4.5];
        P.h = up ? [8, -19] : [9, -16.5]; P.h2 = up ? [-6, -19] : [-8, -16.5]; P.lean = (f.fast ? .0 : .04) + (st === 'help' ? .18 : 0); P.hip = 0;
        if (f.fast) { P.h = [3, -26]; P.h2 = [-3, -26]; P.f = [1.5, -1]; P.f2 = [-1.5, -1]; }
        if (st === 'help') { P.h = [10, -10]; P.h2 = [-9, -10]; P.rot = Math.sin(tm * .5) * 10; }
        break;
      }
      case 'shield': P.hip = 5.5; P.lean = .15; P.f = [4.5, 0]; P.f2 = [-4, 0]; P.h = [7, -13]; P.h2 = [-1, -12]; P.sq = .96; break;
      case 'shieldoff': P.hip = 3; P.lean = .1; break;
      case 'hit': P.lean = -.3; P.h = [-8, -22]; P.h2 = [-11, -14]; P.f = [4, -3]; P.f2 = [-5, -2]; P.hip = 1; break;
      case 'tumble': {
        const d = f.kx >= 0 ? 1 : -1;
        P.rot = (tm * 21 * d * (f.face || 1) * .5) % 360; P.h = [9, -22]; P.h2 = [-9, -22]; P.f = [5, -4]; P.f2 = [-5, -2]; P.lean = 0; P.tuck = 1;
        break;
      }
      case 'down': P.rot = -86; P.hip = 0; P.lean = 0; P.h = [4, -12]; P.h2 = [-4, -12]; P.f = [4, 0]; P.f2 = [-3, 0]; break;
      case 'getup': { const u = Math.min(1, f.sf / 16); P.rot = -86 * (1 - u); P.lean = .1 * (1 - u); P.hip = 4 * (1 - u); break; }
      case 'techr': P.rot = (f.sf * 36 * (f.rdir || 1)) % 360; P.tuck = 1; P.h = [5, -11]; P.h2 = [-4, -11]; P.f = [3, -4]; P.f2 = [-3, -4]; break;
      case 'roll': P.rot = (f.sf * 30 * (f.rdir || 1) * (f.face || 1)) % 360; P.tuck = 1; P.hip = 3; P.h = [5, -11]; P.h2 = [-4, -11]; P.f = [3, -4]; P.f2 = [-3, -4]; break;
      case 'spot': P.sq = .92; P.hip = 3; P.lean = .1; break;
      case 'adodge': P.rot = f.sf * 30 * (f.dvx >= 0 ? 1 : -1); P.tuck = 1; P.h = [5, -11]; P.h2 = [-4, -11]; P.f = [3, -4]; P.f2 = [-3, -4]; break;
      case 'ledge': P.h = [7, -22]; P.h2 = [5, -22]; P.lean = -.12; P.f = [3, 0]; P.f2 = [-2, -.5]; P.hip = -1; break;
      case 'ledgeup': case 'ledgeroll': { const u = Math.min(1, f.sf / 14); P.h = [8, -20 + u * 6]; P.h2 = [6, -20 + u * 6]; P.lean = .2 * u; P.hip = 3 * u; if (st === 'ledgeroll' && f.sf > 14) { P.rot = (f.sf - 14) * 30 * (f.face || 1); P.tuck = 1; } break; }
      case 'grab': P.h = [10, -15]; P.h2 = [9, -13.5]; P.lean = .16; P.f = [5, 0]; P.f2 = [-4, 0]; P.hip = 2; break;
      case 'held': P.h = [-3, -25]; P.h2 = [3, -25]; P.lean = -.2; P.f = [3, -3]; P.f2 = [-3, -4]; P.sq = .94; break;
      case 'stun': P.h = [5, -9]; P.h2 = [-5, -9]; P.lean = .1 + Math.sin(tm * .3) * .1; P.hip = 3; P.sq = .97; break;
      case 'respawn': P.h = [3, -14]; P.h2 = [-3, -14]; break;
      case 'idle': break;
    }
    if (f.item && (st === 'idle' || st === 'walk' || st === 'run' || st === 'dash' || st === 'air')) P.h = [8, -15];
    return P;
  }

  function smPose(f) {
    const P = smBasePose(f), m = f.mv;
    if (f.st === 'atk' && m && m.pose) {
      const t = Math.min(f.mf, m.len), po = m.pose;
      let v;
      if ((v = smTrack(po.h, t))) P.h = v;
      if ((v = smTrack(po.h2, t))) P.h2 = v;
      if ((v = smTrack(po.f, t))) P.f = v;
      if ((v = smTrack(po.lean, t))) P.lean = v[0];
      if ((v = smTrack(po.wa, t))) P.wa = v[0];
      if ((v = smTrack(po.rot, t))) P.rot = v[0];
      if ((v = smTrack(po.sq, t))) P.sq = v[0];
      if ((v = smTrack(po.hip, t))) P.hip = v[0];
      if ((v = smTrack(po.stone, t))) P.stone = v[0];
      if (m.air && !po.f && !po.hip) { P.f = [4.5, -3]; P.f2 = [-3, -5]; }
      if (po.f) P.f2 = [-3, 0];
      if (f.chg > 0 && f.mf === (m.cf != null ? m.cf : m.chg ? m.chg.f : -1)) { P.hip += Math.sin(f.tm * 1.2) * .35; }
    }
    return P;
  }

  function smStroke(ctx, pts, w, col, outline) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    if (outline) { ctx.strokeStyle = SM_OUT; ctx.lineWidth = w + 1.5; ctx.stroke(); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  }

  function smEye(ctx, x, y, r, face, hit) {
    if (hit) {
      ctx.strokeStyle = '#111827'; ctx.lineWidth = .9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r * .6, y); ctx.lineTo(x - r, y + r); ctx.stroke();
      return;
    }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y, r * .9, r * 1.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.ellipse(x + r * .25, y + r * .1, r * .55, r * .85, 0, 0, TAU); ctx.fill();
  }

  function smJoints(f, P, C) {
    const L = C.look, J = {};
    const robe = L === 'vex', blob = L === 'pip';
    const hipY = -10.5 + P.hip * (P.tuck ? .6 : 1) - (robe ? 2.6 + Math.sin((f.tm || 0) * .07) * .8 : 0);
    const T = blob ? 7 : L === 'granite' ? 8.8 : 8.3, hr = L === 'granite' ? 4.5 : L === 'zephyr' ? 4.8 : L === 'bramble' ? 4.8 : 5;
    const lx = Math.sin(P.lean), ly = -Math.cos(P.lean);
    J.hip = [0, hipY]; J.nk = [lx * T, hipY + ly * T]; J.sh = [lx * (T - 1.6), hipY + ly * (T - 1.6)];
    J.hd = [J.nk[0] + lx * (hr * .72) + .6, J.nk[1] + ly * (hr * .72)]; J.hr = hr; J.T = T;
    const al = L === 'granite' ? [7.2, 7.4] : [6.4, 6.8], ll = [5.6, 5.8];
    J.hand = smIK(J.sh[0] + .5, J.sh[1], P.h[0], P.h[1], al[0], al[1], 1, L === 'bramble' ? 3 : 1.55);
    J.hand2 = smIK(J.sh[0] - .5, J.sh[1], P.h2[0], P.h2[1], al[0], al[1], 1, 1.45);
    J.foot = smIK(1.2, hipY, P.f[0], P.f[1], ll[0], ll[1], -1, 1.7);
    J.foot2 = smIK(-1.2, hipY, P.f2[0], P.f2[1], ll[0], ll[1], -1, 1.5);
    J.hr = hr; J.al = al; return J;
  }

  function smBackDeco(ctx, f, P, J, C, col, t) {
    const L = C.look, pal = C.pal;
    if (L === 'sable' || L === 'zephyr') {
      const w = Math.sin(t * .15) * 1.5 + Math.min(4, Math.abs(f.vx) * 2.4), c = L === 'sable' ? pal.c2 : pal.ac, n = L === 'sable' ? 3 : 2;
      ctx.strokeStyle = c; ctx.lineWidth = L === 'sable' ? 2.2 : 1.8; ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        ctx.beginPath(); ctx.moveTo(J.hd[0] - 3, J.hd[1] + (L === 'sable' ? 1.8 : -.6) + i * .6);
        ctx.quadraticCurveTo(J.hd[0] - 9 - w * .8, J.hd[1] + 1 + i * 2.5 + w * .3, J.hd[0] - 14 - w - i * 2, J.hd[1] + 3 + i * 3.5 - w * .5); ctx.stroke();
      }
    }
    if (L === 'tempo') {
      ctx.fillStyle = col.torso; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .7;
      const sw = Math.sin(t * .1) * 1 - Math.min(5, Math.abs(f.vx) * 3);
      ctx.beginPath(); ctx.moveTo(J.sh[0] - 3.5, J.sh[1]); ctx.lineTo(J.sh[0] + 3.5, J.sh[1]);
      ctx.lineTo(J.hip[0] - 5 + sw, J.hip[1] + 8); ctx.lineTo(J.hip[0] - 9 + sw, J.hip[1] + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (L === 'ember') {
      const k = Math.sin(t * .3) * 1.4;
      ctx.fillStyle = pal.ac;
      ctx.beginPath(); ctx.moveTo(J.hd[0] - 2, J.hd[1] - 2); ctx.lineTo(J.hd[0] - 7 - k, J.hd[1] - 5); ctx.lineTo(J.hd[0] - 4, J.hd[1] + 1); ctx.fill();
    }
    if (L === 'bramble') {
      ctx.fillStyle = pal.c2; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(J.hd[0] - 4.5 - i * 1.4, J.hd[1] + 1 + i * 2.6, 3.4, 1.7, .5 + i * .3, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
  }

  function smBodyCol(f, C, dup, pcol) {
    const p = C.pal, L = C.look;
    const torso = dup ? pcol : p.c1;
    return { torso, skin: p.skin, arm: L === 'ember' || L === 'granite' || L === 'zephyr' || L === 'bramble' ? p.skin : (L === 'pip' ? p.c1 : p.c1), leg: L === 'zephyr' || L === 'bramble' ? p.c1 : p.c3, shoe: L === 'zephyr' ? p.c2 : L === 'ember' ? p.c3 : p.c3, glove: p.c2 };
  }

  function smDrawBody(ctx, f, P, J, C, col, t, pcol) {
    const L = C.look, pal = C.pal, hit = f.st === 'hit' || f.st === 'tumble' || f.st === 'stun';
    const stone = P.stone > .5, lw = L === 'granite' ? 4.2 : 3.2;
    const gc = stone ? '#8b8f98' : null;
    smBackDeco(ctx, f, P, J, C, col, t);
    if (L === 'pip') { smDrawPip(ctx, f, P, J, C, col, t, stone); return; }
    smStroke(ctx, [J.sh[0] - .5, J.sh[1], J.hand2[0], J.hand2[1], J.hand2[2], J.hand2[3]], lw * .95, gc || col.arm, true);
    if (L !== 'vex') smStroke(ctx, [-1.2, J.hip[1], J.foot2[0], J.foot2[1], J.foot2[2], J.foot2[3]], lw + .4, gc || col.leg, true);
    if (L !== 'vex') { ctx.fillStyle = gc || col.shoe; ctx.beginPath(); ctx.ellipse(J.foot2[2] + 1.2, J.foot2[3] - .3, 3.1, 1.9, 0, 0, TAU); ctx.fill(); }
    smDrawTorso(ctx, f, P, J, C, col, t, gc);
    if (L !== 'vex') smStroke(ctx, [1.2, J.hip[1], J.foot[0], J.foot[1], J.foot[2], J.foot[3]], lw + .4, gc || col.leg, true);
    if (L !== 'vex') { ctx.fillStyle = gc || col.shoe; ctx.beginPath(); ctx.ellipse(J.foot[2] + 1.2, J.foot[3] - .3, 3.3, 2, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6; ctx.stroke(); }
    smDrawHead(ctx, f, P, J, C, col, t, hit, gc);
    if (L === 'bramble') {
      const hx = J.hand[2], hy = J.hand[3], sx = J.sh[0] + .5, sy = J.sh[1], dx = P.h[0], dy = P.h[1], d = Math.hypot(dx - sx, dy - sy);
      const tx = d > 22 ? P.h[0] : hx, ty = d > 22 ? P.h[1] : hy, mx = (sx + tx) / 2, my = (sy + ty) / 2 + Math.min(5, d * .15) + Math.sin(t * .2) * .6;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, tx, ty);
      ctx.strokeStyle = SM_OUT; ctx.lineWidth = lw + 1.6; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = '#4ade80'; ctx.lineWidth = lw * .78; ctx.stroke();
      ctx.fillStyle = pal.ac; ctx.beginPath(); ctx.arc(tx, ty, 2.6, 0, TAU); ctx.fill(); ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6; ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.arc(tx, ty, 1.1, 0, TAU); ctx.fill();
    } else {
      smStroke(ctx, [J.sh[0] + .5, J.sh[1], J.hand[0], J.hand[1], J.hand[2], J.hand[3]], lw, gc || col.arm, true);
      ctx.fillStyle = gc || (L === 'ember' || L === 'granite' || L === 'zephyr' ? col.glove : col.skin);
      ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(J.hand[2], J.hand[3], L === 'granite' ? 3.2 : 2.4, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(J.hand2[2], J.hand2[3], L === 'granite' ? 3 : 2.2, 0, TAU); ctx.fill(); ctx.stroke();
    }
    smDrawProps(ctx, f, P, J, C, col, t);
  }

  function smDrawTorso(ctx, f, P, J, C, col, t, gc) {
    const L = C.look, pal = C.pal;
    const hx = J.hip[0], hy = J.hip[1], sx = J.sh[0], sy = J.sh[1];
    const hw = L === 'granite' ? 5 : 3.6, sw = L === 'granite' ? 6.2 : 4.2;
    const nx = -(sy - hy), ny = sx - hx, n = Math.hypot(nx, ny) || 1, ux = nx / n, uy = ny / n;
    ctx.fillStyle = gc || col.torso; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8; ctx.lineJoin = 'round';
    if (L === 'vex') {
      ctx.beginPath(); ctx.moveTo(sx - ux * sw, sy - uy * sw); ctx.lineTo(sx + ux * sw, sy + uy * sw);
      const fl = Math.sin(t * .12) * .8 + Math.min(3, Math.abs(f.vx) * 2);
      ctx.lineTo(hx + 8.6 - fl, 1.4); ctx.quadraticCurveTo(hx, 3.4 + Math.sin(t * .15) * .5, hx - 8.6 - fl, 1.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.moveTo(hx + 7.6 - fl, 1.1); ctx.quadraticCurveTo(hx, 3.1, hx - 7.6 - fl, 1.1); ctx.lineTo(hx - 8.6 - fl, 1.4); ctx.quadraticCurveTo(hx, 3.6, hx + 8.6 - fl, 1.4); ctx.fill();
      return;
    }
    ctx.beginPath(); ctx.moveTo(hx - ux * hw, hy - uy * hw); ctx.lineTo(sx - ux * sw, sy - uy * sw); ctx.lineTo(sx + ux * sw, sy + uy * sw); ctx.lineTo(hx + ux * hw, hy + uy * hw); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (gc) return;
    if (L === 'ember') {
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.moveTo(hx - ux * hw, hy - uy * hw); ctx.lineTo(hx + ux * hw, hy + uy * hw); ctx.lineTo(hx + ux * hw * .9, hy + uy * hw * .9 + 1.8); ctx.lineTo(hx - ux * hw * .9, hy - uy * hw * .9 + 1.8); ctx.fill();
      ctx.fillStyle = pal.c3; ctx.beginPath(); ctx.moveTo(sx - ux * 1, sy - uy * 1); ctx.lineTo(sx + ux * 1, sy + uy * 1); ctx.lineTo(hx + ux * 1, hy + uy * 1 + 1); ctx.lineTo(hx - ux * 1, hy - uy * 1 + 1); ctx.fill();
    } else if (L === 'sable') {
      ctx.fillStyle = pal.c2; ctx.fillRect(hx - 3.6 + (sx - hx) * .1, hy - 1.2, 7.2, 1.7);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(hx - .8 + (sx - hx) * .1, hy - 1.4, 1.6, 2.1);
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.moveTo(sx - ux * sw, sy - uy * sw); ctx.lineTo(sx + ux * sw, sy + uy * sw); ctx.lineTo(sx + ux * sw * .5 + 1.2, sy + uy * sw * .5 - 1.8); ctx.lineTo(sx - ux * sw * .5 - 1.2, sy - uy * sw * .5 - 1.8); ctx.fill();
    } else if (L === 'granite') {
      ctx.fillStyle = pal.c1; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(sx - 7.2, sy + 1); ctx.lineTo(sx - 3.4, sy - 3.2); ctx.lineTo(sx + 3.4, sy - 3.2); ctx.lineTo(sx + 7.2, sy + 1); ctx.lineTo(sx + 4, sy + 3.6); ctx.lineTo(sx - 4, sy + 3.6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.fillRect(hx - 4.4, hy - 1.4, 8.8, 2.2);
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(sx - 3, sy - 2); ctx.lineTo(sx - 1, sy + 1.2); ctx.lineTo(sx + 2, sy + 2.5); ctx.stroke();
    } else if (L === 'zephyr') {
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.moveTo(sx - ux * 2.6, sy - uy * 2.6); ctx.lineTo(sx + ux * 2.6, sy + uy * 2.6); ctx.lineTo(hx + ux * 1.4, hy + uy * 1.4); ctx.lineTo(hx - ux * 1.4, hy - uy * 1.4); ctx.fill();
      ctx.strokeStyle = pal.ac; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo((hx + sx) / 2 - 1, (hy + sy) / 2 - 2.5); ctx.lineTo((hx + sx) / 2 + 1, (hy + sy) / 2 - .5); ctx.lineTo((hx + sx) / 2 - .8, (hy + sy) / 2 - .5); ctx.lineTo((hx + sx) / 2 + .8, (hy + sy) / 2 + 2); ctx.stroke();
    } else if (L === 'bramble') {
      ctx.fillStyle = pal.c2; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 3, hy - 1); ctx.lineTo(hx + i * 3.6 - 2.2, hy + 5); ctx.lineTo(hx + i * 3.6 + 2.2, hy + 5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    } else if (L === 'tempo') {
      ctx.fillStyle = pal.c3; ctx.fillRect(hx - 3.6, hy - 1.2, 7.2, 1.8);
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.arc(hx, hy - .3, .9, 0, TAU); ctx.fill();
      ctx.strokeStyle = pal.c3; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(sx - ux * 3, sy - uy * 3); ctx.lineTo(hx + ux * 3, hy + uy * 3 - 1); ctx.stroke();
    }
    if (col.torso !== pal.c1) { ctx.fillStyle = col.torso; ctx.fillRect(hx - 3, hy - 2.4, 6, 1.2); }
  }

  function smDrawHead(ctx, f, P, J, C, col, t, hit, gc) {
    const L = C.look, pal = C.pal, hx = J.hd[0], hy = J.hd[1], hr = J.hr, atk = f.st === 'atk' && f.mv && !f.mv.pum;
    ctx.strokeStyle = SM_OUT; ctx.lineWidth = .9; ctx.lineJoin = 'round';
    if (L === 'tempo' || L === 'vex') {
      ctx.fillStyle = L === 'tempo' ? pal.c1 : pal.c3;
      ctx.beginPath(); ctx.arc(hx - .8, hy - .3, hr + 1.1, 0, TAU); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = gc || col.skin;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
    if (L !== 'tempo' && L !== 'vex') ctx.stroke();
    if (L === 'tempo' || L === 'vex') { ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.restore(); }
    if (!gc) {
      if (L === 'vex') { ctx.fillStyle = '#0b1020'; ctx.beginPath(); ctx.ellipse(hx + hr * .35, hy + hr * .05, hr * .66, hr * .7, 0, 0, TAU); ctx.fill(); }
      const ex = hx + hr * (L === 'vex' ? .5 : .5), ey = hy - hr * .05;
      if (L === 'vex') {
        ctx.fillStyle = pal.ac; ctx.shadowColor = pal.ac; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.ellipse(hx + hr * .25, ey, 1.1, hit ? .35 : 1.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx + hr * .75, ey, 1.1, hit ? .35 : 1.5, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      } else {
        smEye(ctx, hx + hr * .22, ey, hr * .2, 1, hit); smEye(ctx, hx + hr * .68, ey, hr * .2, 1, hit);
        ctx.strokeStyle = '#111827'; ctx.lineWidth = .7; ctx.lineCap = 'round';
        if (atk || hit) { ctx.beginPath(); ctx.moveTo(hx + hr * .05, hy - hr * .38); ctx.lineTo(hx + hr * .45, hy - hr * .22); ctx.moveTo(hx + hr * .98, hy - hr * .36); ctx.lineTo(hx + hr * .55, hy - hr * .22); ctx.stroke(); }
        ctx.beginPath(); if (atk || hit) ctx.ellipse(hx + hr * .5, hy + hr * .55, hr * .2, hr * .16, 0, 0, TAU); else { ctx.moveTo(hx + hr * .3, hy + hr * .5); ctx.quadraticCurveTo(hx + hr * .5, hy + hr * .62, hx + hr * .72, hy + hr * .5); } ctx.stroke();
      }
    }
    if (gc) return;
    ctx.lineWidth = .8; ctx.strokeStyle = SM_OUT;
    if (L === 'ember') {
      const k = Math.sin(t * .35) * 1.3, w = Math.min(3, Math.abs(f.vx) * 2);
      ctx.fillStyle = pal.c1;
      ctx.beginPath(); ctx.moveTo(hx - hr * .9, hy - hr * .2); ctx.lineTo(hx - hr - 2 - w, hy - hr * 1.1 + k); ctx.lineTo(hx - hr * .5, hy - hr * .8);
      ctx.lineTo(hx - hr * .6 - w * .4, hy - hr * 1.9 + k * .6); ctx.lineTo(hx - hr * .05, hy - hr * 1.1); ctx.lineTo(hx + hr * .2, hy - hr * 2.15 + k); ctx.lineTo(hx + hr * .6, hy - hr * 1.05);
      ctx.lineTo(hx + hr * .95, hy - hr * 1.5 + k * .5); ctx.lineTo(hx + hr * .95, hy - hr * .4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.moveTo(hx - hr * .2, hy - hr * 1.05); ctx.lineTo(hx + hr * .2, hy - hr * 1.7 + k * .5); ctx.lineTo(hx + hr * .45, hy - hr * 1.05); ctx.fill();
      ctx.fillStyle = pal.c2; ctx.fillRect(hx - hr, hy - hr * .55, hr * 2, 1.5);
    } else if (L === 'sable') {
      ctx.fillStyle = pal.c3;
      ctx.beginPath(); ctx.arc(hx - hr * .15, hy - hr * .35, hr * 1.02, Math.PI * 1.05, Math.PI * 2.05); ctx.lineTo(hx + hr * .8, hy - hr * .35); ctx.lineTo(hx - hr * .6, hy - hr * .1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(hx - hr * .85, hy - hr * .6, hr * .42, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.beginPath(); ctx.arc(hx - hr * .85, hy - hr * .6, hr * .15, 0, TAU); ctx.fill();
    } else if (L === 'granite') {
      ctx.fillStyle = '#5b4636'; ctx.beginPath(); ctx.arc(hx, hy + hr * .15, hr * 1.02, .15, Math.PI - .15); ctx.lineTo(hx + hr * .5, hy + hr * .5); ctx.lineTo(hx - hr * .6, hy + hr * .55); ctx.fill();
      ctx.fillStyle = pal.c3; ctx.beginPath(); ctx.moveTo(hx - hr, hy - hr * .1); ctx.lineTo(hx - hr * .7, hy - hr * 1.15); ctx.lineTo(hx + hr * .9, hy - hr * .9); ctx.lineTo(hx + hr, hy - hr * .2); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (L === 'zephyr') {
      ctx.fillStyle = pal.c1;
      ctx.beginPath(); ctx.moveTo(hx - hr * 1.0, hy - hr * .1); ctx.quadraticCurveTo(hx - hr * 1.1, hy - hr * 1.3, hx + hr * .3, hy - hr * 1.15); ctx.quadraticCurveTo(hx + hr * 1.1, hy - hr * 1.0, hx + hr * .95, hy - hr * .35); ctx.lineTo(hx + hr * .3, hy - hr * .55); ctx.lineTo(hx - hr * .7, hy - hr * .4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.skin; ctx.beginPath(); ctx.moveTo(hx - hr * .3, hy - hr * .5); ctx.lineTo(hx - hr * .9, hy - hr * 1.2 + Math.sin(t * .4) * .5); ctx.lineTo(hx - hr * .05, hy - hr * .95); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.ac; ctx.fillRect(hx - hr * .95, hy - hr * .62, hr * 1.9, 1.3);
    } else if (L === 'vex') {
      ctx.fillStyle = pal.c1; ctx.beginPath(); ctx.moveTo(hx - hr * 1.5, hy - hr * .45); ctx.lineTo(hx + hr * 1.35, hy - hr * .4); ctx.lineTo(hx + hr * .55, hy - hr * 1.15);
      ctx.lineTo(hx - hr * .55 - Math.sin(t * .1) * .8, hy - hr * 2.5); ctx.lineTo(hx - hr * .3, hy - hr * 1.15); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; ctx.fillRect(hx - hr * 1.3, hy - hr * .7, hr * 2.5, 1.5);
      ctx.fillStyle = pal.ac; ctx.beginPath(); ctx.arc(hx + hr * .05, hy - hr * .65, .9, 0, TAU); ctx.fill();
    } else if (L === 'bramble') {
      ctx.fillStyle = pal.c3; ctx.beginPath(); ctx.arc(hx - hr * .1, hy - hr * .2, hr * 1.05, Math.PI * 1.02, Math.PI * 2.0); ctx.lineTo(hx + hr * .85, hy - hr * .3); ctx.lineTo(hx - hr * .5, hy - hr * .15); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.c2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(hx - hr * .4 + i * hr * .45, hy - hr * 1.15 - (i === 1 ? 1.3 : 0), 1.5, 3, (i - 1) * .55, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = pal.ac; ctx.beginPath(); ctx.arc(hx + hr * .5, hy - hr * 1.0, 1.8, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(hx + hr * .5, hy - hr * 1.0, .7, 0, TAU); ctx.fill();
    } else if (L === 'tempo') {
      ctx.fillStyle = pal.c1; ctx.beginPath(); ctx.arc(hx - hr * .1, hy - hr * .15, hr * 1.14, Math.PI * .98, Math.PI * 2.02); ctx.lineTo(hx + hr * .95, hy + hr * .1); ctx.lineTo(hx + hr * .3, hy - hr * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pal.ac; ctx.beginPath(); ctx.moveTo(hx - hr * .2, hy - hr * 1.2); ctx.quadraticCurveTo(hx - hr * 1.2, hy - hr * 2.1 + Math.sin(t * .2), hx - hr * 1.6, hy - hr * 1.5); ctx.quadraticCurveTo(hx - hr * .8, hy - hr * 1.4, hx - hr * .1, hy - hr * 1.0); ctx.fill(); ctx.stroke();
    }
  }

  function smDrawProps(ctx, f, P, J, C, col, t) {
    const L = C.look, pal = C.pal, m = f.mv;
    if (L === 'sable') {
      const len = (m && m.L ? m.L : 21), a = smRad(P.wa), hx = J.hand[2], hy = J.hand[3];
      const bx = hx + Math.cos(a) * len, by = hy + Math.sin(a) * len;
      ctx.lineCap = 'round';
      ctx.strokeStyle = SM_OUT; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(hx - Math.cos(a) * 3, hy - Math.sin(a) * 3); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.3; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 3, hy + Math.sin(a) * 3); ctx.lineTo(bx - Math.cos(a), by - Math.sin(a)); ctx.stroke();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.6; const px = -Math.sin(a), py = Math.cos(a);
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 2 + px * 2.6, hy + Math.sin(a) * 2 + py * 2.6); ctx.lineTo(hx + Math.cos(a) * 2 - px * 2.6, hy + Math.sin(a) * 2 - py * 2.6); ctx.stroke();
      ctx.fillStyle = col.skin; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(hx, hy, 2.3, 0, TAU); ctx.fill(); ctx.stroke();
    } else if (L === 'tempo') {
      const hx = J.hand2[2], hy = J.hand2[3], drawn = m && m.ai === 'proj' && m.chg && f.mf >= m.chg.f - 4, pull = drawn ? Math.min(1, f.chgv + (f.mf > m.chg.f ? .5 : .2)) : 0;
      const rot = (P.h2[0] > 6 ? 0 : -.15);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(rot);
      ctx.strokeStyle = SM_OUT; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-4, 0, 9, -1.15, 1.15); ctx.stroke();
      ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(-4, 0, 9, -1.15, 1.15); ctx.stroke();
      const tipx = -4 + Math.cos(1.15) * 9, tipy = Math.sin(1.15) * 9;
      ctx.strokeStyle = '#f3f4f6'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(tipx, -tipy); ctx.lineTo(-3 - pull * 7, 0); ctx.lineTo(tipx, tipy); ctx.stroke();
      if (drawn) { ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-3 - pull * 7, 0); ctx.lineTo(13, 0); ctx.stroke(); ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(10.5, -1.3); ctx.lineTo(10.5, 1.3); ctx.fill(); }
      ctx.restore();
    }
    if (f.item) {
      const k = f.item.k, hx = J.hand[2], hy = J.hand[3];
      ctx.save(); ctx.translate(hx, hy);
      if (k === 'bat') {
        const a = f.st === 'atk' && f.mv && f.mv.L ? smRad(P.wa) : smRad(-70);
        ctx.rotate(a); ctx.fillStyle = '#b45309'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(10, -1); ctx.lineTo(24, -3.2); ctx.lineTo(26, -3.2); ctx.lineTo(26, 3.2); ctx.lineTo(24, 3.2); ctx.lineTo(10, 1); ctx.lineTo(-3, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(18, -3.3, 1.6, 6.6);
      } else if (k === 'blaster') {
        ctx.fillStyle = '#475569'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8; ctx.beginPath(); ctx.roundRect(-2, -3, 12, 5.5, 1.5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(9, -2, 4, 3); ctx.fillStyle = '#334155'; ctx.fillRect(-1.5, 2, 3.2, 4);
      } else if (k === 'bomb') {
        const fz = f.item.fuse < 90 && (f.tm % 8 < 4);
        ctx.fillStyle = fz ? '#7f1d1d' : '#111827'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(2, -5, 5.5, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, -10.5); ctx.quadraticCurveTo(5, -13.5, 7, -12); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(7.4, -12.2, 1.4 + Math.sin(f.tm * .8) * .5, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  function smDrawPip(ctx, f, P, J, C, col, t, stone) {
    const pal = C.pal, sq = P.sq, bounce = Math.sin(t * .13) * .35;
    const col1 = stone ? '#9ca3af' : col.torso, col2 = stone ? '#d1d5db' : pal.c2;
    ctx.fillStyle = stone ? '#6b7280' : pal.c3; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.ellipse(J.foot2[2] + 1, J.foot2[3] - .8, 3.2, 2.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(J.foot[2] + 1.4, J.foot[3] - .8, 3.4, 2.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
    const cy = J.hip[1] - 2.5 + bounce, ry = 8.6 * sq * (1 + P.hip * -.012), rx = 8.4 / Math.sqrt(Math.max(.6, sq)) * (1 + P.hip * .012);
    ctx.save(); ctx.translate(J.hip[0] + Math.sin(P.lean) * 3, cy); ctx.rotate(P.lean * .8);
    const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, rx + 3); g.addColorStop(0, col2); g.addColorStop(.35, col1); g.addColorStop(1, stone ? '#6b7280' : pal.c3);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col2; ctx.globalAlpha = .55; ctx.beginPath(); ctx.ellipse(-2.8, -4.4, 2.6, 1.6, -.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    const hit = f.st === 'hit' || f.st === 'tumble' || f.st === 'stun', atk = f.st === 'atk';
    if (!stone) {
      smEye(ctx, 2.6, -1.1, 1.65, 1, hit); smEye(ctx, 6, -1.1, 1.65, 1, hit);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = .8; ctx.lineCap = 'round'; ctx.beginPath();
      if (hit || atk) ctx.ellipse(4.4, 3, 1.3, 1.1, 0, 0, TAU); else { ctx.moveTo(2.8, 2.6); ctx.quadraticCurveTo(4.4, 4, 6, 2.6); }
      ctx.stroke();
      ctx.fillStyle = pal.ac; ctx.beginPath(); ctx.arc(-1, -ry - .6, 1.6, 0, TAU); ctx.fill(); ctx.strokeStyle = SM_OUT; ctx.lineWidth = .6; ctx.stroke();
      ctx.strokeStyle = pal.ac; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-1, -ry); ctx.quadraticCurveTo(-3, -ry - 3.2, -1.4 + Math.sin(t * .2), -ry - 5); ctx.stroke();
    } else {
      ctx.strokeStyle = '#374151'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-2, -ry); ctx.lineTo(0, -2); ctx.lineTo(-3, 2); ctx.moveTo(4, -1); ctx.lineTo(7, 3); ctx.stroke();
      smEye(ctx, 2.6, -1.1, 1.5, 1, true); smEye(ctx, 6, -1.1, 1.5, 1, true);
    }
    ctx.restore();
    const hands = [J.hand, J.hand2], hc = stone ? '#9ca3af' : col1;
    ctx.fillStyle = hc; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8;
    for (let i = 0; i < 2; i++) {
      const hd = hands[i], dx = hd[2] - J.sh[0], dy = hd[3] - J.sh[1], d = Math.hypot(dx, dy) || 1, k = Math.min(d, 12) / d;
      const hx = J.sh[0] + dx * k, hy = J.sh[1] + dy * k - 1;
      if (i === 0 || d > 8) { ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
  }

  function smDrawFighter(ctx, f, D, W, dup) {
    const C = f.C, sz = C.sz, t = f.tm || 0;
    if (f.st === 'dead') return;
    const pcol = SM_COL[f.slot % 4].c, P = smPose(f);
    const col = smBodyCol(f, C, dup, pcol), J = smJoints(f, P, C);
    let ox = 0, oy = 0;
    if (f.shake > 0) { ox = Math.sin(D.t * 2.1 + f.slot) * f.shake * .22; oy = Math.cos(D.t * 3.3 + f.slot) * f.shake * .15; }
    ctx.save();
    ctx.translate(f.x + ox, f.y + oy);
    ctx.scale((f.face || 1) * sz, sz);
    const robe = C.look === 'vex';
    if (robe) ctx.translate(0, -Math.max(0, 0));
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    if (f.pl && !f.air && f.st !== 'ledge') { ctx.beginPath(); ctx.ellipse(0, .6, 7, 1.7, 0, 0, TAU); ctx.fill(); }
    if (P.rot || P.sq !== 1) {
      ctx.translate(0, -8); if (P.rot) ctx.rotate(smRad(P.rot)); ctx.scale(1 / Math.sqrt(P.sq), P.sq); ctx.translate(0, 8);
    }
    if (f.fi && f.inv <= 0 && f.st !== 'respawn') ctx.globalAlpha = .55 + Math.sin(D.t * .8) * .2;
    else if (f.inv > 0 && (f.st === 'air' || f.st === 'idle' || f.st === 'land' || f.st === 'walk' || f.st === 'run') && Math.floor(D.t / 3) % 2) ctx.globalAlpha = .55;
    if (f.fa || f.orb > 0) { ctx.shadowColor = f.orb > 0 ? '#34d399' : '#fbbf24'; ctx.shadowBlur = 8; }
    smDrawBody(ctx, f, P, J, C, col, t, pcol);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    if (f.fc) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, -12, 15 + Math.sin(D.t * .5) * 1.5, 0, TAU); ctx.stroke(); }
    if (f.fr) { ctx.strokeStyle = 'rgba(160,240,255,.85)'; ctx.fillStyle = 'rgba(160,240,255,.18)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(6, -12, 17, -1.4, 1.4); ctx.stroke(); ctx.lineTo(6, -12); ctx.fill(); }
    if (f.st === 'stun') { for (let i = 0; i < 3; i++) { const a = D.t * .15 + i * TAU / 3; ctx.fillStyle = '#fde047'; smStarPath(ctx, Math.cos(a) * 7, -29 + Math.sin(a) * 2.5, 2.2, 1, 5); ctx.fill(); } }
    ctx.restore();
  }

  function smStarPath(ctx, x, y, R, r, n) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath();
  }

  function smDrawShield(ctx, f, D) {
    if (f.st !== 'shield' && !(f.st === 'shieldoff' && f.sf < 4)) return;
    const k = clamp(f.sh / 50, .08, 1), r = (f.C.R * 2.15 + 1.5) * (.38 + k * .62), c = SM_COL[f.slot % 4];
    const cy = f.y - f.C.H * .52;
    const g = ctx.createRadialGradient(f.x, cy, r * .2, f.x, cy, r);
    g.addColorStop(0, c.l + '22'); g.addColorStop(.75, c.c + '55'); g.addColorStop(1, c.l + 'cc');
    ctx.fillStyle = g; ctx.strokeStyle = c.l; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(f.x, cy, r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(f.x, cy, r * .72, D.t * .04, D.t * .04 + 1.6); ctx.stroke();
  }

  function smDrawHitboxFx(ctx, f, D) {
    if (f.st !== 'atk' || !f.mv || f.act < 0) return;
    const m = f.mv, fr = f.act, ec = { n: '255,246,214', f: '255,150,50', s: '215,235,255', m: '210,140,255', z: '255,240,100', w: '225,245,255' };
    for (const h of m.hb) {
      if (h.nohit || h.gb) continue;
      if (fr < h.f0 || fr > h.f1 + 3) continue;
      const age = fr - h.f0, life = h.f1 - h.f0 + 4, a = clamp(1 - (fr - h.f1) / 4, 0, 1) * clamp(.62 - age / life * .25, .15, .7);
      if (h.d < 2 && h.e !== 'w') continue;
      const hx = f.x + h.x * f.face, hy = f.y + h.y, c = ec[h.e] || ec.n, r = h.r * (1 + (h.sp || 0) * .06);
      const g = ctx.createRadialGradient(hx, hy, r * .15, hx, hy, r * 1.25);
      g.addColorStop(0, 'rgba(' + c + ',' + (a * .95) + ')'); g.addColorStop(.6, 'rgba(' + c + ',' + (a * .5) + ')'); g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r * 1.25, 0, TAU); ctx.fill();
    }
  }

  const smRn = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const SM_TH = {
    flat: { top: '#e879f9', hi: '#fae8ff', body: ['#2a1b4d', '#0e0820'], edge: '#f0abfc', kind: 'metal' },
    triplet: { top: '#58d36b', hi: '#b7f7a8', body: ['#9a6a3e', '#4a2f1d'], edge: '#2e8b3a', kind: 'grass' },
    windy: { top: '#f1f5f9', hi: '#ffffff', body: ['#a3acc2', '#566080'], edge: '#ffffff', kind: 'stone' },
    keep: { top: '#b5aea8', hi: '#e7e5e4', body: ['#76655c', '#2c211f'], edge: '#e7e5e4', kind: 'brick' },
    bridge: { top: '#8ff0a8', hi: '#d1fae5', body: ['#c0723f', '#6b3a2a'], edge: '#34d399', kind: 'grass' },
    neon: { top: '#64748b', hi: '#cbd5e1', body: ['#232a4a', '#0a0e20'], edge: '#22d3ee', kind: 'roof' }
  };

  function smPoly(s, seed) {
    const r = smRn(seed + 7), w = s.x1 - s.x0, h = s.y1 - s.y0, pts = [[s.x0, s.y0], [s.x1, s.y0]];
    const inset = Math.min(w * .3, 30), n = 5;
    for (let i = 1; i <= n; i++) { const u = i / n, k = Math.pow(u, 1.5); pts.push([s.x1 - 2 - k * inset + (r() - .5) * 5 * u, s.y0 + h * u + (r() - .5) * 3]); }
    pts[pts.length - 1] = [s.x1 - inset - 4, s.y1 + 4];
    const bot = [];
    for (let i = n; i >= 1; i--) { const u = i / n, k = Math.pow(u, 1.5); bot.push([s.x0 + 2 + k * inset + (r() - .5) * 5 * u, s.y0 + h * u + (r() - .5) * 3]); }
    bot[0] = [s.x0 + inset + 4, s.y1 + 4];
    return pts.concat(bot.map(p => p));
  }

  function smDrawSolid(ctx, s, th, D, ix) {
    const w = s.x1 - s.x0, h = s.y1 - s.y0, k = th.kind;
    if (s.nl) {
      ctx.fillStyle = th.body[0]; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1;
      ctx.fillRect(s.x0, s.y0, w, h); ctx.strokeRect(s.x0, s.y0, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .8;
      for (let y = s.y0 + 5; y < s.y1; y += 5) { ctx.beginPath(); ctx.moveTo(s.x0, y); ctx.lineTo(s.x1, y); ctx.stroke(); for (let x = s.x0 + ((y / 5 | 0) % 2 ? 4 : 0); x < s.x1; x += 8) { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y); ctx.stroke(); } }
      ctx.fillStyle = th.top; ctx.fillRect(s.x0 - 1, s.y0 - 1.5, w + 2, 3); ctx.fillStyle = th.hi; ctx.fillRect(s.x0 - 1, s.y0 - 1.5, w + 2, 1);
      return;
    }
    const key = 'p' + ix;
    const pts = D.cache[key] || (D.cache[key] = smPoly(s, ix * 31 + 5));
    const g = ctx.createLinearGradient(0, s.y0, 0, s.y1);
    g.addColorStop(0, th.body[0]); g.addColorStop(1, th.body[1]);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.save(); ctx.clip();
    if (k === 'grass') {
      const r = smRn(ix * 17 + 3);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      for (let i = 0; i < 18; i++) { const x = s.x0 + r() * w, y = s.y0 + 8 + r() * (h - 14); ctx.beginPath(); ctx.ellipse(x, y, 2 + r() * 4, 1 + r() * 2, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 10; i++) { const x = s.x0 + r() * w, y = s.y0 + 8 + r() * (h - 14); ctx.fillRect(x, y, 3, 1); }
    } else if (k === 'brick' || k === 'stone') {
      ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = .8;
      const bh = k === 'brick' ? 7 : 11, bw = k === 'brick' ? 14 : 22;
      for (let y = s.y0 + bh, n = 0; y < s.y1 + 4; y += bh, n++) { ctx.beginPath(); ctx.moveTo(s.x0, y); ctx.lineTo(s.x1, y); ctx.stroke(); for (let x = s.x0 + (n % 2 ? bw / 2 : 0); x < s.x1; x += bw) { ctx.beginPath(); ctx.moveTo(x, y - bh); ctx.lineTo(x, y); ctx.stroke(); } }
    } else if (k === 'metal') {
      ctx.strokeStyle = 'rgba(240,171,252,.28)'; ctx.lineWidth = .8;
      for (let x = s.x0 + 14; x < s.x1; x += 22) { ctx.beginPath(); ctx.moveTo(x, s.y0 + 4); ctx.lineTo(x, s.y1); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(s.x0, s.y0 + 12); ctx.lineTo(s.x1, s.y0 + 12); ctx.stroke();
      const p = .5 + Math.sin(D.t * .04) * .5;
      ctx.fillStyle = 'rgba(244,114,182,' + (.35 + p * .35) + ')'; for (let x = s.x0 + 22; x < s.x1; x += 44) ctx.fillRect(x - 3, s.y0 + 6, 6, 2);
    } else if (k === 'roof') {
      ctx.strokeStyle = 'rgba(34,211,238,.16)'; ctx.lineWidth = .8;
      for (let y = s.y0 + 8; y < s.y1; y += 8) { ctx.beginPath(); ctx.moveTo(s.x0, y); ctx.lineTo(s.x1, y); ctx.stroke(); }
      const r = smRn(91); ctx.fillStyle = 'rgba(250,204,21,.55)';
      for (let i = 0; i < 26; i++) ctx.fillRect(s.x0 + 8 + r() * (w - 16), s.y0 + 10 + r() * (h - 22), 2, 3);
    }
    ctx.restore();
    ctx.fillStyle = th.top; ctx.fillRect(s.x0 - .5, s.y0 - 1.6, w + 1, 4.2);
    ctx.fillStyle = th.hi; ctx.fillRect(s.x0 - .5, s.y0 - 1.6, w + 1, 1.3);
    if (k === 'grass') {
      ctx.fillStyle = th.top;
      const r = smRn(ix * 5 + 1);
      for (let x = s.x0 + 2; x < s.x1 - 2; x += 5) { const hh = 1 + r() * 2; ctx.beginPath(); ctx.moveTo(x - 1.4, s.y0 + 1); ctx.lineTo(x, s.y0 - 1.6 - hh); ctx.lineTo(x + 1.4, s.y0 + 1); ctx.fill(); }
      ctx.fillStyle = th.edge; ctx.fillRect(s.x0 - .5, s.y0 + 2.4, w + 1, 1.4);
      ctx.strokeStyle = '#3f9b3a'; ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) { const x = s.x0 + 8 + r() * (w - 16), l = 6 + r() * 14; ctx.beginPath(); ctx.moveTo(x, s.y0 + 4); ctx.quadraticCurveTo(x + (r() - .5) * 6, s.y0 + 4 + l * .5, x + (r() - .5) * 4, s.y0 + 4 + l); ctx.stroke(); }
    } else if (k === 'metal' || k === 'roof') {
      ctx.shadowColor = th.edge; ctx.shadowBlur = 8; ctx.fillStyle = th.edge; ctx.fillRect(s.x0, s.y0 - 1.6, w, 1.2); ctx.shadowBlur = 0;
    }
    if (k === 'roof') {
      ctx.fillStyle = '#334155'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = .8;
      const b = [[s.x0 + 14, 9, 7], [s.x1 - 30, 11, 9]];
      b.forEach(q => { ctx.fillRect(q[0], s.y0 - 1.6 - q[1], q[2] + 7, q[1]); ctx.strokeRect(q[0], s.y0 - 1.6 - q[1], q[2] + 7, q[1]); ctx.fillStyle = '#1e293b'; ctx.fillRect(q[0] + 2, s.y0 - 1.6 - q[1] + 2, q[2] + 3, 2); ctx.fillStyle = '#334155'; });
    }
  }

  function smDrawSoft(ctx, p, id, D) {
    const w = p.x1 - p.x0, y = p.y, mv = !!p.mv;
    if (id === 'windy') {
      const r = smRn(Math.round(p.w * 3) + (mv ? 5 : 1));
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(120,150,200,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x0, y + 3);
      const n = 5;
      for (let i = 0; i < n; i++) { const x0 = p.x0 + w * i / n, x1 = p.x0 + w * (i + 1) / n, h = 4 + (i % 2 ? 4 : 7) + r() * 2; ctx.quadraticCurveTo((x0 + x1) / 2, y - h + 4, x1, y + 3); }
      ctx.lineTo(p.x1, y + 4); ctx.quadraticCurveTo(p.x1 - w * .5, y + 9, p.x0, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(180,205,240,.7)'; ctx.fillRect(p.x0 + 4, y + 2.5, w - 8, 1.2);
      return;
    }
    if (id === 'neon') {
      const hue = p.y < -60 ? '#f472b6' : '#22d3ee';
      ctx.shadowColor = hue; ctx.shadowBlur = 9; ctx.fillStyle = hue; ctx.fillRect(p.x0, y - 1, w, 2.2); ctx.shadowBlur = 0;
      ctx.fillStyle = '#0b1022'; ctx.fillRect(p.x0, y + 1.2, w, 2.4); ctx.fillStyle = hue; ctx.globalAlpha = .5; ctx.fillRect(p.x0 + 3, y + 2.2, w - 6, .8); ctx.globalAlpha = 1;
      ctx.fillStyle = '#334155'; ctx.fillRect(p.x0 + 4, y + 3.6, 2, 4); ctx.fillRect(p.x1 - 6, y + 3.6, 2, 4);
      return;
    }
    const wood = id !== 'flat';
    const g = ctx.createLinearGradient(0, y - 1.5, 0, y + 4);
    g.addColorStop(0, wood ? '#e8b87a' : '#c084fc'); g.addColorStop(1, wood ? '#8a5a2e' : '#4c1d95');
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(p.x0, y - 1.6, w, 5.6, 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .7;
    for (let x = p.x0 + 9; x < p.x1 - 2; x += 9) { ctx.beginPath(); ctx.moveTo(x, y - 1.4); ctx.lineTo(x, y + 3.8); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(p.x0 + 2, y - 1.2, w - 4, 1);
    if (mv) {
      const f = .5 + Math.sin(D.t * .3) * .3;
      ctx.fillStyle = 'rgba(125,211,252,' + f + ')'; ctx.beginPath(); ctx.moveTo(p.x0 + w * .3, y + 4); ctx.lineTo(p.x0 + w * .3 - 3, y + 11); ctx.lineTo(p.x0 + w * .3 + 3, y + 11); ctx.fill();
      ctx.beginPath(); ctx.moveTo(p.x0 + w * .7, y + 4); ctx.lineTo(p.x0 + w * .7 - 3, y + 11); ctx.lineTo(p.x0 + w * .7 + 3, y + 11); ctx.fill();
    }
  }

  function smLayer(ctx, cam, par, sc, fn) {
    ctx.save();
    ctx.translate(480 - cam.x * cam.z * par, 270 - cam.y * cam.z * par);
    ctx.scale(cam.z * sc, cam.z * sc);
    fn();
    ctx.restore();
  }

  function smCloud(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, 34 * s, 9 * s, 0, 0, TAU); ctx.ellipse(x - 20 * s, y + 2 * s, 20 * s, 7 * s, 0, 0, TAU); ctx.ellipse(x + 22 * s, y + 3 * s, 22 * s, 7 * s, 0, 0, TAU);
    ctx.ellipse(x - 6 * s, y - 7 * s, 18 * s, 9 * s, 0, 0, TAU); ctx.ellipse(x + 12 * s, y - 5 * s, 14 * s, 8 * s, 0, 0, TAU);
    ctx.fill();
  }

  function smBgInit(D, S) {
    const r = smRn(S.id.length * 977 + S.id.charCodeAt(0) * 31), o = { id: S.id, stars: [], blobs: [], cl: [], mt: [], bld: [], isl: [], rain: [], emb: [] };
    for (let i = 0; i < 170; i++) o.stars.push([-900 + r() * 1800, -700 + r() * 1100, .4 + r() * 1.3, r() * 6.28, .4 + r() * .6]);
    for (let i = 0; i < 12; i++) o.cl.push([-900 + r() * 1800, -260 + r() * 260, .8 + r() * 1.6, .3 + r() * .7, r()]);
    for (let i = 0; i < 4; i++) o.isl.push([-420 + i * 260 + r() * 80, -140 - r() * 120, 22 + r() * 28]);
    let x = -900;
    for (let i = 0; i < 28; i++) { const w = 36 + r() * 50, h = 60 + r() * 150; o.bld.push([x, w, h, r(), r() > .6 ? 1 : 0]); x += w + 4 + r() * 8; }
    x = -900;
    for (let i = 0; i < 30; i++) { const w = 26 + r() * 34, h = 80 + r() * 190; o.mt.push([x, w, h, r()]); x += w * .7; }
    for (let i = 0; i < 60; i++) o.rain.push([r() * 1400, r() * 700, 2.2 + r() * 2.2]);
    for (let i = 0; i < 40; i++) o.emb.push([-500 + r() * 1000, r() * 400, .3 + r() * .6, r() * 6.28]);
    D.bg = o;
  }

  function smDrawBg(ctx, W, D) {
    const S = W.S, id = S.id, sk = S.sk, cam = D.cam, t = D.t;
    if (!D.bg || D.bg.id !== id) smBgInit(D, S);
    const B = D.bg;
    const g = ctx.createLinearGradient(0, 0, 0, 540);
    g.addColorStop(0, sk[0]); g.addColorStop(.58, sk[1]); g.addColorStop(1, sk[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 540);
    if (id === 'flat') {
      smLayer(ctx, cam, .05, 1, () => { for (const s of B.stars) { ctx.globalAlpha = s[4] * (.6 + .4 * Math.sin(t * .03 + s[3])); ctx.fillStyle = '#fff'; ctx.fillRect(s[0], s[1], s[2], s[2]); } ctx.globalAlpha = 1; });
      smLayer(ctx, cam, .1, 1, () => {
        const ng = ctx.createRadialGradient(-160, -150, 10, -160, -150, 260); ng.addColorStop(0, 'rgba(236,72,153,.35)'); ng.addColorStop(1, 'rgba(236,72,153,0)'); ctx.fillStyle = ng; ctx.fillRect(-500, -450, 700, 600);
        const n2 = ctx.createRadialGradient(240, -60, 10, 240, -60, 220); n2.addColorStop(0, 'rgba(56,189,248,.28)'); n2.addColorStop(1, 'rgba(56,189,248,0)'); ctx.fillStyle = n2; ctx.fillRect(0, -300, 520, 480);
        const pg = ctx.createRadialGradient(150, -228, 8, 160, -216, 70); pg.addColorStop(0, '#f5d0fe'); pg.addColorStop(.5, '#a855f7'); pg.addColorStop(1, '#2e1065');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(160, -216, 62, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(240,171,252,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(160, -216, 118, 26, -.35, Math.PI, TAU); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(160, -216, 118, 26, -.35, 0, Math.PI); ctx.stroke();
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(160, -216, 62, .15 * Math.PI, 1.1 * Math.PI); ctx.fill();
      });
      smLayer(ctx, cam, .3, 1, () => {
        ctx.strokeStyle = 'rgba(244,114,182,.28)'; ctx.lineWidth = .8;
        for (let i = 0; i < 12; i++) { const y = 130 + i * i * 2.4; ctx.beginPath(); ctx.moveTo(-900, y); ctx.lineTo(900, y); ctx.stroke(); }
        for (let i = -16; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i * 24, 130); ctx.lineTo(i * 130, 420); ctx.stroke(); }
      });
    } else if (id === 'triplet' || id === 'windy' || id === 'bridge') {
      smLayer(ctx, cam, .03, 1, () => {
        const sx = id === 'bridge' ? 0 : 180, sy = id === 'bridge' ? -50 : -240, R = id === 'bridge' ? 110 : 40;
        const sg = ctx.createRadialGradient(sx, sy, R * .2, sx, sy, R * 4.2);
        sg.addColorStop(0, id === 'bridge' ? 'rgba(255,230,160,.95)' : 'rgba(255,255,230,.9)'); sg.addColorStop(.25, id === 'bridge' ? 'rgba(255,170,90,.5)' : 'rgba(255,245,200,.4)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fillRect(sx - R * 5, sy - R * 5, R * 10, R * 10);
        ctx.fillStyle = id === 'bridge' ? '#ffe9a8' : '#fffbe0'; ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.fill();
        if (id === 'bridge') { ctx.fillStyle = 'rgba(244,114,182,.5)'; for (let i = 0; i < 6; i++) ctx.fillRect(sx - R, sy + 10 + i * 14, R * 2, 3 + i); }
      });
      if (id === 'bridge') {
        [[.08, '#7c3a8a', .5], [.15, '#5b2a7a', .75], [.24, '#3b1d5c', 1]].forEach(l => smLayer(ctx, cam, l[0], 1, () => {
          ctx.fillStyle = l[1]; ctx.beginPath(); ctx.moveTo(-900, 260);
          B.mt.forEach((m, i) => { const h = m[2] * l[2] * .8; ctx.lineTo(-900 + i * 62 + (l[0] * 400 % 30), 130 - h * .2); ctx.lineTo(-900 + i * 62 + 31, 130 - h * .55 - m[3] * 20); });
          ctx.lineTo(900, 260); ctx.closePath(); ctx.fill();
        }));
      }
      const cc = id === 'bridge' ? 'rgba(255,200,210,.55)' : id === 'windy' ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.85)';
      [.12, .24, .4].forEach((p, li) => smLayer(ctx, cam, p, 1, () => {
        const dr = (t * (.05 + li * .05) * (id === 'windy' ? 1.6 : 1)) + (id === 'windy' ? W.t * W.wv * 2 : 0);
        B.cl.forEach((c, i) => { if (i % 3 !== li) return; const x = ((c[0] + dr + 1000) % 2000) - 1000; smCloud(ctx, x, c[1] * (1 + li * .15) + 40 + li * 40, c[2] * (.7 + li * .25), cc); });
      }));
      if (id !== 'windy') smLayer(ctx, cam, .22, 1, () => {
        B.isl.forEach((s, i) => {
          const y = s[1] + 70 + Math.sin(t * .01 + i) * 4;
          ctx.fillStyle = id === 'bridge' ? '#5a2f6e' : '#7c8fb5'; ctx.beginPath(); ctx.moveTo(s[0] - s[2], y); ctx.lineTo(s[0] + s[2], y); ctx.lineTo(s[0] + s[2] * .3, y + s[2] * .9); ctx.lineTo(s[0] - s[2] * .2, y + s[2] * 1.1); ctx.closePath(); ctx.fill();
          ctx.fillStyle = id === 'bridge' ? '#8b4a8f' : '#8fd18a'; ctx.fillRect(s[0] - s[2], y - 2, s[2] * 2, 3);
        });
      });
      if (id === 'windy' && W.wg > .05) smLayer(ctx, cam, .5, 1, () => {
        ctx.strokeStyle = 'rgba(255,255,255,' + W.wg * .5 + ')'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
        for (let i = 0; i < 30; i++) { const r = B.rain[i], sp = 14 + r[2] * 6, x = (((r[0] * 1.3 + t * sp * W.wd * W.wg) % 1400) + 1400) % 1400 - 700, y = -260 + (r[1] % 520); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - W.wd * 26 * W.wg, y + 1); ctx.stroke(); }
      });
    } else if (id === 'keep') {
      smLayer(ctx, cam, .03, 1, () => {
        const mg = ctx.createRadialGradient(-150, -220, 6, -150, -220, 120); mg.addColorStop(0, 'rgba(255,240,200,.9)'); mg.addColorStop(.3, 'rgba(255,210,150,.25)'); mg.addColorStop(1, 'rgba(255,200,150,0)');
        ctx.fillStyle = mg; ctx.fillRect(-300, -400, 300, 360);
        ctx.fillStyle = '#ffe9c4'; ctx.beginPath(); ctx.arc(-150, -220, 26, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.arc(-140, -226, 7, 0, TAU); ctx.arc(-158, -212, 5, 0, TAU); ctx.fill();
      });
      smLayer(ctx, cam, .14, 1, () => {
        ctx.fillStyle = '#26151f';
        ctx.beginPath(); ctx.moveTo(-500, 160); ctx.lineTo(-500, -10);
        const tw = [[-380, 30, 150], [-300, 22, 100], [-210, 36, 200], [-120, 18, 90], [-40, 28, 130], [60, 40, 230], [150, 20, 110], [230, 32, 170], [330, 24, 100], [420, 34, 140]];
        tw.forEach(q => { ctx.lineTo(q[0] - q[1], -10); ctx.lineTo(q[0] - q[1], -q[2]); for (let k = 0; k < 4; k++) { const x = q[0] - q[1] + k * q[1] * .5; ctx.lineTo(x, -q[2] - 6); ctx.lineTo(x + q[1] * .25, -q[2] - 6); ctx.lineTo(x + q[1] * .25, -q[2]); ctx.lineTo(x + q[1] * .5, -q[2]); } ctx.lineTo(q[0] + q[1], -10); });
        ctx.lineTo(560, -10); ctx.lineTo(560, 160); ctx.closePath(); ctx.fill();
        tw.forEach((q, i) => { const lit = Math.sin(t * .02 + i * 2.1) > -.4; ctx.fillStyle = lit ? 'rgba(255,190,90,.9)' : 'rgba(255,190,90,.25)'; ctx.fillRect(q[0] - 3, -q[2] * .6, 6, 11); ctx.fillRect(q[0] - 3, -q[2] * .3, 6, 9); });
        ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.moveTo(60, -236); ctx.lineTo(60, -270); ctx.lineTo(84 + Math.sin(t * .08) * 4, -262); ctx.lineTo(60, -254); ctx.fill(); ctx.fillStyle = '#26151f'; ctx.fillRect(59, -272, 2, 40);
      });
      smLayer(ctx, cam, .5, 1, () => {
        ctx.fillStyle = 'rgba(12,6,12,.95)';
        [[-380, 40], [330, 46]].forEach(q => { ctx.fillRect(q[0], -420, q[1], 760); ctx.fillRect(q[0] - 10, -420, q[1] + 20, 22); ctx.fillRect(q[0] - 8, 300, q[1] + 16, 40); });
        ctx.fillRect(-380, -420, 790, 26);
      });
      smLayer(ctx, cam, .22, 1, () => {
        for (const e of B.emb) { const y = 110 - ((t * e[2] * .6 + e[1]) % 420), x = e[0] + Math.sin(t * .02 + e[3]) * 16; ctx.fillStyle = 'rgba(255,170,70,' + (.3 + e[2] * .5) + ')'; ctx.fillRect(x, y, 1.6, 1.6); }
      });
    } else if (id === 'neon') {
      smLayer(ctx, cam, .03, 1, () => { for (const s of B.stars) { if (s[1] > -100) continue; ctx.globalAlpha = s[4] * .6; ctx.fillStyle = '#fff'; ctx.fillRect(s[0], s[1], s[2] * .8, s[2] * .8); } ctx.globalAlpha = 1; });
      smLayer(ctx, cam, .05, 1, () => {
        const mg = ctx.createRadialGradient(120, -170, 10, 120, -170, 210); mg.addColorStop(0, 'rgba(244,114,182,.7)'); mg.addColorStop(1, 'rgba(244,114,182,0)'); ctx.fillStyle = mg; ctx.fillRect(-100, -400, 440, 460);
        ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(120, -170, 60, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a1363'; for (let i = 0; i < 6; i++) ctx.fillRect(60, -140 + i * 12, 120, 2 + i * .7);
      });
      [[.12, '#1a0f45', 0], [.25, '#0d0724', 1]].forEach(l => smLayer(ctx, cam, l[0], 1, () => {
        B.bld.forEach((b, i) => {
          const x = b[0] + l[2] * 40, h = b[2] * (l[2] ? .8 : 1.2), y0 = 120;
          ctx.fillStyle = l[1]; ctx.fillRect(x, y0 - h, b[1], h + 300);
          if (b[4]) { ctx.fillStyle = l[1]; ctx.fillRect(x + b[1] * .45, y0 - h - 22, 2, 22); ctx.fillStyle = 'rgba(239,68,68,' + (.5 + .5 * Math.sin(t * .08 + i)) + ')'; ctx.fillRect(x + b[1] * .45 - 1, y0 - h - 24, 4, 3); }
          const rr = smRn(i * 13 + (l[2] ? 3 : 1));
          for (let wy = y0 - h + 6; wy < y0 - 4; wy += 9) for (let wx = x + 4; wx < x + b[1] - 4; wx += 7) if (rr() > (l[2] ? .55 : .7)) { ctx.fillStyle = rr() > .75 ? 'rgba(34,211,238,.8)' : rr() > .5 ? 'rgba(244,114,182,.75)' : 'rgba(250,204,21,.7)'; ctx.fillRect(wx, wy, 3, 4); }
          if (!l[2] && b[3] > .6) { ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10; ctx.fillStyle = b[3] > .85 ? '#22d3ee' : '#f472b6'; ctx.fillRect(x + 4, y0 - h + 3, b[1] - 8, 2); ctx.shadowBlur = 0; }
        });
      }));
      smLayer(ctx, cam, .35, 1, () => {
        const a = Math.sin(t * .008) * .5;
        ctx.save(); ctx.translate(-200, 130); ctx.rotate(-1.2 + a); const lg = ctx.createLinearGradient(0, 0, 0, -520); lg.addColorStop(0, 'rgba(165,243,252,.28)'); lg.addColorStop(1, 'rgba(165,243,252,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.lineTo(60, -520); ctx.lineTo(-60, -520); ctx.fill(); ctx.restore();
        ctx.strokeStyle = 'rgba(186,230,253,.35)'; ctx.lineWidth = 1;
        for (let i = 0; i < B.rain.length; i++) { const r = B.rain[i], x = (r[0] - 700) + (t * 3 * r[2]) % 30, y = ((r[1] + t * 9 * r[2]) % 620) - 340; ctx.beginPath(); ctx.moveTo(x - y * .02, y); ctx.lineTo(x - y * .02 - 2, y + 9); ctx.stroke(); }
      });
    }
  }

  function smDrawStage(ctx, W, D) {
    const th = SM_TH[W.S.id] || SM_TH.flat;
    W.solids.forEach((s, i) => smDrawSolid(ctx, s, th, D, i));
    for (const p of W.soft) smDrawSoft(ctx, p, W.S.id, D);
  }

  function smDrawItem(ctx, it, D) {
    const sd = SM_ITEMS[it.k], t = D.t;
    if (it.life < 300 && Math.floor(t / 4) % 2) ctx.globalAlpha = .45;
    const fall = !it.rest, bob = it.rest ? Math.sin(t * .08 + it.id) * 1 : 0, r = sd.r;
    const cx = it.x, cy = it.y - r - 1 - (it.rest ? 1.5 : 0) + bob;
    if (it.rest) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(it.x, it.y, r * .9, 1.6, 0, 0, TAU); ctx.fill(); }
    const gl = ctx.createRadialGradient(cx, cy, 1, cx, cy, r * 2.4);
    const gc = it.k === 'heart' ? '255,90,110' : it.k === 'orb' ? '52,211,153' : it.k === 'bomb' ? '255,170,60' : '250,230,120';
    gl.addColorStop(0, 'rgba(' + gc + ',.5)'); gl.addColorStop(1, 'rgba(' + gc + ',0)'); ctx.fillStyle = gl; ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    ctx.save(); ctx.translate(cx, cy); ctx.lineJoin = 'round';
    if (fall) { ctx.rotate(Math.sin(t * .1 + it.id) * .25); }
    if (it.k === 'heart') {
      ctx.fillStyle = '#ef4444'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, r * .9); ctx.bezierCurveTo(-r * 1.5, -r * .1, -r * .9, -r * 1.2, 0, -r * .45); ctx.bezierCurveTo(r * .9, -r * 1.2, r * 1.5, -r * .1, 0, r * .9); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-r * .5, -r * .3, r * .22, r * .12, -.6, 0, TAU); ctx.fill();
    } else if (it.k === 'bomb') {
      ctx.fillStyle = '#1f2937'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 1, r * .95, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-r * .35, -r * .15, r * .22, r * .14, -.6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -r * .8); ctx.quadraticCurveTo(r * .4, -r * 1.4, r * .8, -r * 1.2); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(r * .85, -r * 1.2, 1.4 + Math.sin(t * .6) * .5, 0, TAU); ctx.fill();
    } else if (it.k === 'bat') {
      ctx.rotate(-.7); ctx.fillStyle = '#b45309'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, -1); ctx.lineTo(3, -1); ctx.lineTo(9, -3); ctx.lineTo(10, -3); ctx.lineTo(10, 3); ctx.lineTo(9, 3); ctx.lineTo(3, 1); ctx.lineTo(-9, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(4, -3, 1.4, 6);
    } else if (it.k === 'blaster') {
      ctx.fillStyle = '#475569'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-8, -3.5, 16, 7, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(5, -2.4, 4, 4.4); ctx.fillStyle = '#334155'; ctx.fillRect(-5, 3, 4, 5); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-6, -2.5, 8, 1.2);
    } else {
      const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, r); g.addColorStop(0, '#d1fae5'); g.addColorStop(.5, '#34d399'); g.addColorStop(1, '#047857');
      ctx.fillStyle = g; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r * .6, t * .08, t * .08 + 2.4); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function smDrawProj(ctx, p, D) {
    const t = D.t, sz = p.sz, a = Math.atan2(p.vy, p.vx);
    ctx.save(); ctx.translate(p.x, p.y); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    switch (p.sh) {
      case 'arrow': {
        ctx.rotate(a);
        ctx.strokeStyle = SM_OUT; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.strokeStyle = '#d6b88a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(6, 0); ctx.stroke();
        ctx.fillStyle = '#e5e7eb'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(5, -2.2); ctx.lineTo(5, 2.2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-12, -2.2); ctx.lineTo(-7, 0); ctx.lineTo(-12, 2.2); ctx.closePath(); ctx.fill();
        break;
      }
      case 'beam': {
        ctx.rotate(a); const l = 14 + sz * 2;
        const g = ctx.createLinearGradient(-l, 0, l, 0); g.addColorStop(0, 'rgba(34,211,238,0)'); g.addColorStop(.7, p.col); g.addColorStop(1, '#fff');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, l, sz * .55, 0, 0, TAU); ctx.fill();
        ctx.shadowColor = p.col; ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(l * .3, 0, l * .6, sz * .25, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        break;
      }
      case 'laser': {
        ctx.rotate(a); ctx.shadowColor = p.col; ctx.shadowBlur = 6; ctx.strokeStyle = p.col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(5, 0); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.stroke(); ctx.shadowBlur = 0;
        break;
      }
      case 'bolt': {
        ctx.rotate(a); ctx.shadowColor = p.col; ctx.shadowBlur = 8; ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, 0);
        for (let i = 1; i <= 5; i++) ctx.lineTo(-10 + i * 4.2, Math.sin(t * .9 + i * 2.3) * 3.2); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = .8; ctx.stroke(); ctx.shadowBlur = 0;
        break;
      }
      case 'boom': {
        if (p.exp) {
          const u = p.t / Math.max(1, p.life), r = p.r * (.55 + u * .75);
          const g = ctx.createRadialGradient(0, 0, r * .1, 0, 0, r); g.addColorStop(0, 'rgba(255,255,230,' + (1 - u * .6) + ')'); g.addColorStop(.45, 'rgba(255,170,60,' + (.9 - u * .5) + ')'); g.addColorStop(1, 'rgba(220,38,38,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,230,160,' + (.9 - u) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, 0, TAU); ctx.stroke();
        } else {
          ctx.rotate(p.rot || t * .4); ctx.fillStyle = p.col; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(-7, -6); ctx.quadraticCurveTo(8, -6, 8, 0); ctx.quadraticCurveTo(0, -1, -7, 6); ctx.quadraticCurveTo(-3, 0, -7, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        break;
      }
      case 'fire': {
        const f = 1 + Math.sin(t * .8 + p.id) * .12;
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, sz * 1.9 * f); g.addColorStop(0, '#fff7c2'); g.addColorStop(.35, '#fbbf24'); g.addColorStop(.75, '#ef4444'); g.addColorStop(1, 'rgba(239,68,68,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, sz * 1.9 * f, 0, TAU); ctx.fill();
        ctx.rotate(a); ctx.fillStyle = 'rgba(251,146,60,.5)'; ctx.beginPath(); ctx.moveTo(-sz * 3, 0); ctx.lineTo(-sz * .5, -sz * .9); ctx.lineTo(-sz * .5, sz * .9); ctx.fill();
        break;
      }
      case 'orb': {
        const r = sz * (1 + Math.sin(t * .4) * .06);
        ctx.shadowColor = p.col; ctx.shadowBlur = 12;
        const g = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r * 1.2); g.addColorStop(0, '#fff'); g.addColorStop(.35, p.col); g.addColorStop(1, 'rgba(76,29,149,.85)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r * 1.4, t * .2, t * .2 + 1.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 1.4, t * .2 + Math.PI, t * .2 + Math.PI + 1.6); ctx.stroke();
        break;
      }
      case 'rock': {
        ctx.rotate(p.rot || t * .3); ctx.fillStyle = '#9ca3af'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < 7; i++) { const aa = i / 7 * TAU, rr = sz * (.85 + ((i * 37) % 5) * .08); ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-sz * .3, -sz * .3, sz * .3, 0, TAU); ctx.fill();
        break;
      }
      case 'seed': {
        ctx.rotate(a); ctx.fillStyle = p.col; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.3, sz * .8, 0, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-sz * .2, -sz * .25, sz * .5, sz * .2, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'thorn': {
        const open = p.land ? Math.min(1, (p.t - p.land) / 8) : .5;
        ctx.fillStyle = '#3f6212'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = .8;
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 2.4 - 2, 3); ctx.lineTo(i * 3.4 * open, -8 * open + Math.abs(i) * 1.5); ctx.lineTo(i * 2.4 + 2, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, -2, 1.8, 0, TAU); ctx.fill();
        if (p.land && Math.floor(t / 20) % 2) { ctx.strokeStyle = 'rgba(190,242,100,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(t * .2) * 1.4, 0, TAU); ctx.stroke(); }
        break;
      }
      case 'bomb': {
        ctx.rotate(p.t * .08); ctx.fillStyle = '#1f2937'; ctx.strokeStyle = SM_OUT; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, sz, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(-sz * .35, -sz * .35, sz * .25, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(1.5, -sz - 3); ctx.stroke();
        if (Math.floor(t / 3) % 2) { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(1.5, -sz - 3.4, 1.6, 0, TAU); ctx.fill(); }
        break;
      }
      default: {
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, sz * 1.5); g.addColorStop(0, '#fff'); g.addColorStop(.5, p.col); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, sz * 1.5, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  function smFxNew() { return []; }
  const SM_EC = { n: [255, 246, 214], f: [255, 150, 50], s: [215, 235, 255], m: [210, 140, 255], z: [255, 240, 100], w: [225, 245, 255] };
  function smFxP(D, o) { if (D.fx.length < 320) D.fx.push(Object.assign({ t: 0, life: 20, vx: 0, vy: 0, g: 0, d: .93, c: '255,255,255', r: 4 }, o)); }
  function smStar4(ctx, x, y, R, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, q = i % 2 ? r : R; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath();
  }
  function smFxEv(D, e, W) {
    const rn = (a, b) => a + Math.random() * (b - a);
    const sc = e.s != null ? SM_COL[e.s % 4] : null;
    switch (e.k) {
      case 'hit': {
        const c = SM_EC[e.e] || SM_EC.n, cs = c.join(','), big = clamp(e.kb / 120, 0, 1.6), st = 7 + big * 11 + (e.sp || 0) * 3;
        smFxP(D, { k: 'star', x: e.x, y: e.y, life: 9 + big * 5, r: st, c: cs, rot: rn(0, 1) });
        smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 12, r: st * 1.9, c: cs });
        const n = 4 + Math.round(big * 8);
        for (let i = 0; i < n; i++) { const a = (e.hd > 0 ? 0 : Math.PI) + rn(-1.1, 1.1) + (i % 2 ? Math.PI * .5 * rn(-1, 1) : 0), sp = rn(1.5, 3.2 + big * 3); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rn(8, 16), c: cs, r: rn(1.5, 3) }); }
        if (e.e === 's') smFxP(D, { k: 'slash', x: e.x, y: e.y, life: 9, r: st * 2.1, c: cs, rot: e.hd > 0 ? -.5 : Math.PI + .5 });
        if (e.e === 'f') for (let i = 0; i < 4; i++) smFxP(D, { k: 'puff', x: e.x, y: e.y, vx: rn(-1, 1), vy: rn(-1.5, -.2), g: -.02, life: 16, r: rn(3, 6), c: '255,140,40' });
        if (e.e === 'z') for (let i = 0; i < 3; i++) smFxP(D, { k: 'bolt', x: e.x, y: e.y, life: 7, r: rn(8, 14), c: cs, rot: rn(0, TAU) });
        D.shake = Math.max(D.shake, Math.min(5, e.kb * .035));
        break;
      }
      case 'shieldhit': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 10, r: 11, c: '170,240,255' }); for (let i = 0; i < 4; i++) { const a = rn(0, TAU); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 10, c: '170,240,255', r: 2 }); } break;
      case 'sbreak': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 24, r: 46, c: '255,255,255' }); for (let i = 0; i < 18; i++) { const a = rn(0, TAU), s = rn(1, 4); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 26, g: .05, c: '170,240,255', r: 2.5 }); } D.shake = Math.max(D.shake, 5); break;
      case 'counter': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 14, r: 30, c: '255,255,255' }); smFxP(D, { k: 'star', x: e.x, y: e.y, life: 12, r: 22, c: '255,255,255', rot: .4 }); break;
      case 'reflect': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 10, r: 14, c: '160,240,255' }); break;
      case 'land': case 'dust': { const d = e.d || 0; for (let i = 0; i < (e.k === 'land' ? 5 : 3); i++) smFxP(D, { k: 'puff', x: e.x + rn(-4, 4), y: e.y - 1, vx: (d ? d * rn(.2, 1) : rn(-1.2, 1.2)), vy: rn(-.4, -.1), life: 16, r: rn(2, 4), c: '225,215,200', d: .94 }); break; }
      case 'step': smFxP(D, { k: 'puff', x: e.x, y: e.y - 1, vx: rn(-.3, .3), vy: -.2, life: 12, r: 2.4, c: '225,215,200' }); break;
      case 'jump': for (let i = 0; i < 3; i++) smFxP(D, { k: 'puff', x: e.x + rn(-5, 5), y: e.y - 1, vx: rn(-1, 1), vy: rn(-.5, 0), life: 14, r: 3, c: '225,215,200' }); break;
      case 'djump': smFxP(D, { k: 'ring', x: e.x, y: e.y - 3, life: 14, r: 13, c: sc ? sc.l.slice(1) && '255,255,255' : '255,255,255', flat: 1 }); break;
      case 'ff': smFxP(D, { k: 'ring', x: e.x, y: e.y - 8, life: 8, r: 8, c: '255,255,255', flat: 1 }); break;
      case 'ledge': smFxP(D, { k: 'star', x: e.x, y: e.y, life: 8, r: 7, c: '255,255,255', rot: .4 }); break;
      case 'grab': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 10, r: 12, c: '255,225,120' }); break;
      case 'tech': smFxP(D, { k: 'ring', x: e.x, y: e.y - 4, life: 12, r: 18, c: '255,255,255' }); for (let i = 0; i < 5; i++) smFxP(D, { k: 'spark', x: e.x, y: e.y - 2, vx: rn(-2, 2), vy: rn(-2, -.5), life: 10, c: '255,255,255', r: 2 }); break;
      case 'knockdown': case 'slam': case 'bounce': for (let i = 0; i < 5; i++) smFxP(D, { k: 'puff', x: e.x + rn(-5, 5), y: (e.y || 0) - 1, vx: rn(-1.5, 1.5), vy: rn(-.8, -.1), life: 18, r: rn(2, 5), c: '225,215,200' }); D.shake = Math.max(D.shake, 2.5); break;
      case 'boom': for (let i = 0; i < 18; i++) { const a = rn(0, TAU), s = rn(.8, 4); smFxP(D, { k: 'puff', x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: -.02, life: rn(18, 34), r: rn(4, 9), c: Math.random() < .5 ? '255,160,60' : '110,100,100', d: .93 }); } smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 16, r: 38, c: '255,220,140' }); smFxP(D, { k: 'star', x: e.x, y: e.y, life: 10, r: 30, c: '255,240,200', rot: .4 }); D.shake = Math.max(D.shake, 7); break;
      case 'puff': smFxP(D, { k: 'spark', x: e.x, y: e.y, life: 8, c: '255,255,255', r: 2, vx: rn(-1, 1), vy: rn(-1, 1) }); break;
      case 'shoot': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 7, r: 6 + (e.ch || 0) * 6, c: '255,255,255' }); break;
      case 'plant': for (let i = 0; i < 5; i++) smFxP(D, { k: 'puff', x: e.x, y: e.y - 3, vx: rn(-1, 1), vy: rn(-1, -.2), life: 14, r: 2.5, c: '132,204,22' }); break;
      case 'tpout': case 'tpin': for (let i = 0; i < 16; i++) { const a = rn(0, TAU), s = rn(.4, 2.4); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * s * (e.k === 'tpin' ? -1 : 1), vy: Math.sin(a) * s * (e.k === 'tpin' ? -1 : 1), life: 16, c: '217,160,255', r: 2.4 }); } smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 14, r: 22, c: '217,160,255' }); break;
      case 'tether': D.tether = { x: e.x, y: e.y, tx: e.tx, ty: e.ty, t: 0 }; break;
      case 'heal': for (let i = 0; i < 7; i++) smFxP(D, { k: 'plus', x: e.x + rn(-8, 8), y: e.y + rn(-4, 6), vy: rn(-.7, -.3), life: 28, r: rn(2, 3.4), c: '255,120,140', d: 1 }); break;
      case 'orb': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 20, r: 30, c: '52,211,153' }); break;
      case 'pick': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 9, r: 11, c: '255,255,255' }); break;
      case 'itembreak': for (let i = 0; i < 8; i++) { const a = rn(0, TAU); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, g: .08, life: 22, c: '230,200,120', r: 2.4 }); } break;
      case 'itemspawn': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 24, r: 28, c: '255,255,200' }); break;
      case 'respawn': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 22, r: 40, c: '255,255,255' }); break;
      case 'adodge': smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 12, r: 20, c: '255,255,255' }); break;
      case 'chgstart': break;
      case 'launch': D.zoomT = Math.max(D.zoomT, 8); break;
      case 'ko': {
        const sl = e.s % 4, cs = SM_COL[sl].c, a = e.a;
        const rgb = parseInt(cs.slice(1, 3), 16) + ',' + parseInt(cs.slice(3, 5), 16) + ',' + parseInt(cs.slice(5, 7), 16);
        smFxP(D, { k: 'ko', x: e.x, y: e.y, life: 46, r: 56, c: rgb, rot: a });
        smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 30, r: 130, c: rgb });
        smFxP(D, { k: 'ring', x: e.x, y: e.y, life: 20, r: 70, c: '255,255,255' });
        for (let i = 0; i < 28; i++) { const aa = a + Math.PI + rn(-.9, .9), s = rn(3, 11); smFxP(D, { k: 'spark', x: e.x, y: e.y, vx: Math.cos(aa) * s, vy: Math.sin(aa) * s, life: rn(20, 40), c: rgb, r: rn(2, 4.5), d: .96 }); }
        D.shake = 12; D.flash = 6; D.slowT = 34; D.koFocus = { x: e.x, y: e.y, t: 70 };
        break;
      }
      case 'sudden': D.banner = { t: 0, s: 'SUDDEN DEATH', c: '#fb7185' }; break;
    }
  }

  function smFxStep(D) {
    for (let i = D.fx.length - 1; i >= 0; i--) {
      const p = D.fx[i];
      if (++p.t >= p.life) { D.fx.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.d; p.vy *= p.d;
    }
    if (D.tether && ++D.tether.t > 22) D.tether = null;
    if (D.shake > 0) D.shake *= .88; if (D.shake < .1) D.shake = 0;
    if (D.flash > 0) D.flash--;
  }

  function smFxDraw(ctx, D) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const p of D.fx) {
      const u = p.t / p.life, a = 1 - u;
      switch (p.k) {
        case 'spark': ctx.strokeStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.lineWidth = p.r * a + .4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4); ctx.stroke(); break;
        case 'ring': ctx.strokeStyle = 'rgba(' + p.c + ',' + a * .9 + ')'; ctx.lineWidth = 1 + 2.4 * a; ctx.beginPath(); if (p.flat) ctx.ellipse(p.x, p.y, p.r * (.3 + u * .7), p.r * (.1 + u * .2), 0, 0, TAU); else ctx.arc(p.x, p.y, p.r * (.25 + u * .75), 0, TAU); ctx.stroke(); break;
        case 'star': ctx.fillStyle = 'rgba(' + p.c + ',' + Math.min(1, a * 1.6) + ')'; smStar4(ctx, p.x, p.y, p.r * (1 - u * .3), p.r * .28, p.rot); ctx.fill(); break;
        case 'puff': ctx.fillStyle = 'rgba(' + p.c + ',' + a * .5 + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + u * 1.2), 0, TAU); ctx.fill(); break;
        case 'slash': ctx.strokeStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.lineWidth = 3 * a + .5; ctx.beginPath(); ctx.arc(p.x - Math.cos(p.rot) * p.r * .8, p.y - Math.sin(p.rot) * p.r * .8, p.r, p.rot - .7, p.rot + .7); ctx.stroke(); break;
        case 'bolt': ctx.strokeStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); for (let i = 1; i < 4; i++) ctx.lineTo(p.x + Math.cos(p.rot) * p.r * i / 3 + (i % 2 ? 2 : -2), p.y + Math.sin(p.rot) * p.r * i / 3 + (i % 2 ? -2 : 2)); ctx.stroke(); break;
        case 'plus': ctx.fillStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.fillRect(p.x - p.r, p.y - p.r * .3, p.r * 2, p.r * .6); ctx.fillRect(p.x - p.r * .3, p.y - p.r, p.r * .6, p.r * 2); break;
        case 'ko': {
          ctx.save(); ctx.translate(p.x, p.y);
          const r = p.r * (.3 + Math.min(1, u * 3) * .9), al = u < .5 ? 1 : (1 - u) * 2;
          ctx.fillStyle = 'rgba(' + p.c + ',' + al + ')'; smStar4(ctx, 0, 0, r * 1.6, r * .3, p.rot + Math.PI / 4); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,' + al + ')'; smStar4(ctx, 0, 0, r, r * .22, p.rot + Math.PI / 4); ctx.fill();
          ctx.rotate(p.rot + Math.PI); const g = ctx.createLinearGradient(0, 0, 150, 0); g.addColorStop(0, 'rgba(' + p.c + ',' + al + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -r * .35); ctx.lineTo(150 * Math.min(1, u * 4), 0); ctx.lineTo(0, r * .35); ctx.fill();
          ctx.restore(); break;
        }
      }
    }
    if (D.tether) {
      const q = D.tether; ctx.strokeStyle = 'rgba(190,242,100,' + (1 - q.t / 22) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(q.x, q.y);
      for (let i = 1; i <= 8; i++) { const u = i / 8; ctx.lineTo(q.x + (q.tx - q.x) * u, q.y + (q.ty - q.y) * u + Math.sin(u * 12 + q.t) * 2.6 * (1 - u)); } ctx.stroke();
    }
  }

  function smCamStep(W, D, dt) {
    const S = W.S, c = D.cam, z0 = c.z;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, n = 0;
    for (const f of W.F) {
      if (f.st === 'dead') continue;
      const hh = f.C.H;
      x0 = Math.min(x0, f.x - 34); x1 = Math.max(x1, f.x + 34); y0 = Math.min(y0, f.y - hh - 22); y1 = Math.max(y1, f.y + 20); n++;
    }
    if (D.koFocus && D.koFocus.t > 0) { const k = D.koFocus; k.t--; x0 = Math.min(x0, k.x - 70); x1 = Math.max(x1, k.x + 70); y0 = Math.min(y0, k.y - 70); y1 = Math.max(y1, k.y + 70); n++; }
    if (!n) { x0 = S.cam.l; x1 = S.cam.r; y0 = S.cam.t; y1 = S.cam.b; }
    x0 = Math.min(x0, S.cam.l + 60); x1 = Math.max(x1, S.cam.r - 60); y0 = Math.min(y0, S.cam.t + 36); y1 = Math.max(y1, S.cam.b - 28);
    let w = Math.max(x1 - x0, (y1 - y0) * 16 / 9);
    const wmax = (S.bz.r - S.bz.l) * 1.1, wmin = Math.min(260, S.cam.r - S.cam.l);
    w = clamp(w, wmin, wmax);
    const tz = 960 / w, tx = (x0 + x1) / 2, ty = (y0 + y1) / 2 - (D.zoomT > 0 ? 0 : 0);
    const k = 1 - Math.pow(.0009, dt);
    if (!D.camInit) { c.x = tx; c.y = ty; c.z = tz; D.camInit = 1; }
    c.z += (tz - c.z) * (tz < c.z ? Math.min(1, k * 1.8) : k * .8);
    c.x += (tx - c.x) * k * 1.2; c.y += (ty - c.y) * k * 1.2;
    const hw = 480 / c.z, hh = 270 / c.z;
    c.x = clamp(c.x, S.bz.l + hw * .35, S.bz.r - hw * .35); c.y = clamp(c.y, S.bz.t + hh * .35, S.bz.b - hh * .35);
    if (D.zoomT > 0) D.zoomT--;
  }

  function smDrawTag(ctx, f, D, name, z) {
    const col = SM_COL[f.slot % 4], hh = f.C.H * (f.C.look === 'vex' ? 1.1 : 1.0) + 8;
    const s = 1 / z * clamp(z / 2.4, .8, 1.4);
    ctx.save(); ctx.translate(f.x, f.y - hh); ctx.scale(s * 1.2, s * 1.2);
    ctx.font = '800 9px ' + SF_FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = Math.max(18, ctx.measureText(name).width + 10);
    ctx.fillStyle = col.c; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(-w / 2, -14, w, 12, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3.5, -2); ctx.lineTo(3.5, -2); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2; ctx.strokeText(name, 0, -7.6); ctx.fillText(name, 0, -7.6);
    ctx.restore();
  }

  function smDrawWorld(ctx, W, D, names, dup) {
    smDrawBg(ctx, W, D);
    const c = D.cam;
    ctx.save();
    const sx = D.shake ? (Math.random() - .5) * D.shake * 2 : 0, sy = D.shake ? (Math.random() - .5) * D.shake * 2 : 0;
    ctx.translate(480 + sx, 270 + sy); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
    smDrawStage(ctx, W, D);
    for (const it of W.items) smDrawItem(ctx, it, D);
    for (const p of W.proj) if (p.trap) smDrawProj(ctx, p, D);
    const order = W.F.slice().sort((a, b) => (a.st === 'held' ? -1 : 0) - (b.st === 'held' ? -1 : 0));
    for (const f of order) {
      if (f.st === 'respawn') {
        const x = W.S.rs[0], y = W.S.rs[1] + 3;
        ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 20, 4, 0, 0, TAU); ctx.fill();
        const col = SM_COL[f.slot % 4]; ctx.fillStyle = col.d; ctx.strokeStyle = col.l; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y); ctx.lineTo(x + 14, y + 5); ctx.lineTo(x - 14, y + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col.c; ctx.fillRect(x - 18, y - 1.2, 36, 1.6);
      }
      smDrawFighter(ctx, f, D, W, dup[f.slot]);
    }
    for (const f of order) smDrawShield(ctx, f, D);
    for (const f of order) { if (f.st === 'dead') continue; smDrawHitboxFx(ctx, f, D); }
    for (const p of W.proj) if (!p.trap) smDrawProj(ctx, p, D);
    smFxDraw(ctx, D);
    for (const f of order) { if (f.st === 'dead') continue; smDrawTag(ctx, f, D, names[f.slot], c.z); }
    ctx.restore();
    const L = 480 / c.z;
    for (const f of W.F) {
      if (f.st === 'dead') continue;
      const dx = f.x - c.x, dy = f.y - 12 - c.y, sxp = 480 + dx * c.z, syp = 270 + dy * c.z;
      if (sxp > 18 && sxp < 942 && syp > 18 && syp < 522) continue;
      const m = 26, px = clamp(sxp, m, 960 - m), py = clamp(syp, m, 540 - m), ang = Math.atan2(syp - py, sxp - px), col = SM_COL[f.slot % 4];
      ctx.save(); ctx.translate(px, py); ctx.fillStyle = col.c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(11, -6); ctx.lineTo(11, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.rotate(-ang);
      ctx.font = '900 11px ' + SF_FONT; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Math.round(f.dmg) + '', 0, 1);
      ctx.restore();
    }
    if (D.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + D.flash / 14 + ')'; ctx.fillRect(0, 0, 960, 540); }
  }

  const SM_KM = {
    l: ['KeyA', 'ArrowLeft'], r: ['KeyD', 'ArrowRight'], u: ['KeyW', 'ArrowUp'], d: ['KeyS', 'ArrowDown'],
    a: ['KeyJ', 'KeyZ'], b: ['KeyK', 'KeyX'], m: ['KeyL', 'KeyC'], j: ['Space', 'KeyU'], g: ['KeyI', 'KeyQ', 'Enter', 'KeyV'], s: ['ShiftLeft', 'ShiftRight', 'KeyO', 'KeyE']
  };
  const SM_BITS = ['a', 'b', 'j', 'g', 'm', 's'];
  const SM_PHN = ['count', 'play', 'over'];
  const SM_STAT = ['Power', 'Speed', 'Recovery', 'Weight'];
  const SM_FL = { fi: 1, fa: 2, fc: 4, fr: 8, fg: 16, air: 32, fast: 64, inv: 128, out: 256, orb: 512, kxn: 1024, rdn: 2048, dvn: 4096 };

  function smFake(ch, slot) {
    const C = SM_CHARS[ch];
    return { slot, ch, C, S: C.S, x: 0, y: 0, vx: 0, vy: 0, kx: 0, ky: 0, face: 1, st: 'idle', sf: 0, tm: 0, mv: null, mf: 0, chg: 0, chgv: 0, item: null, fi: 0, fa: 0, fc: 0, fr: 0, fg: 0, inv: 0, orb: 0, rdir: 1, dvx: 1, lag: 0, air: false, fast: false, hl: 0, shake: 0, sh: 50, act: -1, pl: {}, dmg: 0, hlag: 20, in: {} };
  }

  function smPortrait(c, ch, slot, o) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = +c.dataset.w, h = +c.dataset.h;
    c.width = w * dpr; c.height = h * dpr;
    const q = c.getContext('2d'), k = (h - 8) / 40;
    q.setTransform(dpr, 0, 0, dpr, 0, 0);
    q.translate(w / 2, h - 4); q.scale(k, k);
    const f = smFake(ch, slot || 0);
    if (o && o.st) { f.st = o.st; f.mv = o.mv || null; f.mf = o.mf || 0; f.sf = 8; }
    f.tm = o && o.tm || 12;
    smDrawFighter(q, f, { t: 10 }, null, false);
  }

  function smStageThumb(c, si) {
    const S = SM_STAGES[si], W = smNewWorld(S.id, [], {}), D = { t: 40, fx: [], cache: {}, cam: { x: 0, y: -48, z: 1.65 }, shake: 0, bg: null };
    const q = c.getContext('2d'), k = c.width / 960;
    q.setTransform(k, 0, 0, k, 0, 0);
    smDrawBg(q, W, D);
    q.translate(480, 270); q.scale(D.cam.z, D.cam.z); q.translate(-D.cam.x, -D.cam.y);
    smDrawStage(q, W, D);
  }

  function smDmgCol(d) {
    const st = [[0, [255, 255, 255]], [60, [255, 240, 150]], [110, [255, 170, 60]], [170, [240, 70, 50]], [260, [150, 20, 30]]];
    for (let i = 0; i < st.length - 1; i++) {
      if (d <= st[i + 1][0]) {
        const u = (d - st[i][0]) / (st[i + 1][0] - st[i][0]), a = st[i][1], b = st[i + 1][1];
        return `rgb(${Math.round(lerp(a[0], b[0], u))},${Math.round(lerp(a[1], b[1], u))},${Math.round(lerp(a[2], b[2], u))})`;
      }
    }
    return 'rgb(150,20,30)';
  }

  function smHudDraw(g, G, W, D) {
    const n = G.players.length, pw = n <= 2 ? 232 : 214, gap = 8, tot = n * pw + (n - 1) * gap, x0 = 480 - tot / 2, y0 = 540 - 78;
    for (let i = 0; i < n; i++) {
      const f = W.F[i], p = G.players[i], col = SM_COL[i % 4], x = x0 + i * (pw + gap), out = f.out;
      const hp = G.hudDmg[i] || (G.hudDmg[i] = { v: f.dmg, b: 0 });
      if (Math.round(f.dmg) > Math.round(hp.v)) hp.b = 10;
      hp.v = f.dmg; if (hp.b > 0) hp.b--;
      g.save();
      g.globalAlpha = out ? .45 : 1;
      sfRound(g, x, y0, pw, 70, 14); g.fillStyle = 'rgba(8,10,24,.66)'; g.fill();
      g.lineWidth = 2; g.strokeStyle = col.c; g.stroke();
      g.save(); sfRound(g, x, y0, pw, 70, 14); g.clip();
      g.fillStyle = col.c; g.globalAlpha = (out ? .45 : 1) * .22; g.fillRect(x, y0, 74, 70); g.globalAlpha = out ? .45 : 1;
      g.fillStyle = col.c; g.fillRect(x, y0, pw, 4);
      g.save(); g.translate(x + 37, y0 + 64); g.scale(1.55, 1.55);
      if (!G.hudF[i]) G.hudF[i] = smFake(f.ch, i);
      const pf = G.hudF[i]; pf.tm = D.t; pf.st = f.st === 'hit' || f.st === 'tumble' || f.st === 'stun' ? 'hit' : 'idle'; pf.item = null;
      smDrawFighter(g, pf, D, null, G.dup[i]);
      g.restore(); g.restore();
      const cx = x + 82;
      sfText(g, p.name.slice(0, 12), cx, y0 + 14, 12, '#fff', 'left', 'rgba(0,0,0,.5)', 800);
      if (p.kind === 'cpu') sfText(g, 'CPU ' + p.lvl, x + pw - 8, y0 + 14, 10, 'rgba(255,255,255,.65)', 'right', null, 800);
      else if (p.kind === 'net') sfText(g, 'ONLINE', x + pw - 8, y0 + 14, 10, 'rgba(255,255,255,.65)', 'right', null, 800);
      if (out) sfText(g, 'OUT', cx + 52, y0 + 42, 26, 'rgba(255,255,255,.8)', 'center', 'rgba(0,0,0,.6)');
      else {
        const d = Math.round(f.dmg), bump = hp.b > 0 ? 1 + hp.b * .035 : 1;
        g.save(); g.translate(cx + 56, y0 + 40); g.scale(bump, bump); g.rotate(hp.b > 0 ? Math.sin(hp.b * 2.2) * .06 : 0);
        g.font = `900 italic ${d > 99 ? 32 : 36}px ${SF_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineJoin = 'round';
        const t = d + '';
        g.strokeText(t, 0, 0); g.fillStyle = smDmgCol(f.dmg); g.fillText(t, 0, 0);
        const tw = g.measureText(t).width;
        g.font = `900 italic 15px ${SF_FONT}`; g.textAlign = 'left'; g.strokeText('%', tw / 2 + 2, 8); g.fillText('%', tw / 2 + 2, 8);
        g.restore();
      }
      if (W.mode === 'stock' && !W.sudden || W.sudden) {
        const s = f.stocks;
        if (s <= 5) for (let k = 0; k < s; k++) { g.beginPath(); g.arc(cx + 8 + k * 17, y0 + 61, 6, 0, TAU); g.fillStyle = col.c; g.fill(); g.lineWidth = 1.6; g.strokeStyle = col.l; g.stroke(); }
        else { g.beginPath(); g.arc(cx + 8, y0 + 61, 6, 0, TAU); g.fillStyle = col.c; g.fill(); g.lineWidth = 1.6; g.strokeStyle = col.l; g.stroke(); sfText(g, 'x' + s, cx + 20, y0 + 62, 13, '#fff', 'left', 'rgba(0,0,0,.6)'); }
      } else sfText(g, `KO ${f.ko}   SD ${f.sd}`, cx + 2, y0 + 62, 12, '#fff', 'left', 'rgba(0,0,0,.6)', 800);
      g.restore();
    }
    if (W.limit > 0 && !W.sudden) {
      const left = Math.max(0, Math.ceil((W.limit - W.t) / 60)), m = Math.floor(left / 60), s = left % 60, low = left <= 10;
      g.save(); g.translate(480, 28);
      sfRound(g, -48, -19, 96, 38, 19); g.fillStyle = 'rgba(8,10,24,.66)'; g.fill(); g.lineWidth = 2; g.strokeStyle = low ? '#ef4444' : 'rgba(255,255,255,.35)'; g.stroke();
      if (low) { const k = 1 + (Math.sin(D.t * .3) * .5 + .5) * .08; g.scale(k, k); }
      sfText(g, `${m}:${s < 10 ? '0' : ''}${s}`, 0, 1, 24, low ? '#fca5a5' : '#fff', 'center', 'rgba(0,0,0,.5)');
      g.restore();
    } else if (W.sudden) sfText(g, 'SUDDEN DEATH', 480, 26, 20, '#fb7185', 'center', 'rgba(0,0,0,.6)');
  }

  function smBanner(g, G, W, D) {
    let txt = null, col = '#fff', k = 0, big = 92;
    if (G.ph === 'count') {
      if (G.pt > 50) { txt = 'READY'; k = clamp((120 - G.pt) / 14, 0, 1); big = 76; }
    } else if (G.ph === 'play' && G.goT > 0) { txt = 'GO!'; col = '#fde047'; k = clamp((50 - G.goT) / 7, 0, 1); }
    else if (G.ph === 'over' && G.overT < 160) { txt = W.res && W.res.win < 0 ? 'DRAW' : 'GAME!'; col = '#fde047'; k = clamp(G.overT / 10, 0, 1); }
    else if (D.banner) { D.banner.t++; if (D.banner.t > 120) D.banner = null; else { txt = D.banner.s; col = D.banner.c; k = clamp(D.banner.t / 8, 0, 1); big = 54; } }
    if (!txt) return;
    g.save(); g.translate(480, 200);
    const sc = .6 + .4 * (1 - Math.pow(1 - k, 3)) + (k < 1 ? 0 : 0);
    g.scale(sc * (1 + (1 - k) * .4), sc); g.globalAlpha = Math.min(1, k * 1.6); g.rotate(-.04);
    g.font = `900 italic ${big}px ${SF_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = big * .2; g.strokeStyle = 'rgba(10,8,30,.85)'; g.strokeText(txt, 0, 0);
    const gr = g.createLinearGradient(0, -big / 2, 0, big / 2); gr.addColorStop(0, '#fff'); gr.addColorStop(1, col);
    g.fillStyle = gr; g.fillText(txt, 0, 0);
    g.restore();
  }

  const SM_ISSEG = (k, arr) => `<div class="sm-seg" data-k="${k}">${arr.map(a => `<button data-v="${a[0]}">${a[1]}</button>`).join('')}</div>`;
  const smMvEnc = m => (m ? (m.id === 'bat' ? 1000 : m.id === 'thr' ? 1001 : m.id === 'blast' ? 1002 : m.idx) : -1);
  const smMvDec = (ch, i) => (i < 0 ? null : i >= 1000 ? [SM_ITM.bat, SM_ITM.thr, SM_ITM.blast][i - 1000] : SM_MVL[ch][i]);
  const smD0 = () => ({ t: 0, fx: [], cache: {}, cam: { x: 0, y: -40, z: 2.2 }, shake: 0, flash: 0, slowT: 0, zoomT: 0, koFocus: null, tether: null, banner: null, bg: null, camInit: 0 });
  const SM_SEQ = [['mv', 'jab1'], ['mv', 'ftilt'], ['mv', 'usmash'], ['sp', 's'], ['sp', 'n'], ['mv', 'fsmash'], ['sp', 'd'], ['mv', 'dsmash']];

  function smMount(root, api) {
    const touchDev = isTouchDev();
    if (touchDev) root.classList.add('touch');
    api.on(window, 'pointerdown', e => { if (e.pointerType === 'touch') root.classList.add('touch'); });
    const saved = Object.assign({ ch: 0, cpus: 1, lvl: 5, mode: 'stock', stocks: 3, time: 3, items: 0, stage: -1, play: 'cpu' }, api.load() || {});
    if (saved.play !== 'online') saved.play = 'cpu';
    saved.ch = clamp(saved.ch | 0, 0, SM_CHARS.length - 1);
    const wrap = document.createElement('div');
    wrap.className = 'sm-wrap';
    root.append(wrap);
    const C = api.canvas(SM_W, SM_H, wrap);
    const cv = C.canvas, g = C.ctx;
    cv.style.width = '100%';
    const ui = document.createElement('div');
    ui.className = 'sm-ui';
    wrap.append(ui);
    const mb = document.createElement('button');
    mb.className = 'sm-mb'; mb.type = 'button'; mb.hidden = true; mb.setAttribute('aria-label', 'Menu');
    mb.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
    wrap.append(mb);
    const aud = makeAudio(api);
    const keys = makeKeys(api, SM_KM);
    const th = { a: 0, b: 0, j: 0, g: 0, m: 0, s: 0, sx: 0, sy: 0 };
    const kb = { dir: 0, dash: 0, last: { '-1': -1e9, '1': 1e9 * -1 } };
    let D = smD0(), tbEl = null;
    const G = {
      role: null, ph: 'menu', W: null, acc: 0, pt: 0, goT: 0, overT: 0, players: [], me: 0, names: [], dup: [], hudDmg: [], hudF: [], stIdx: 0, rules: null, paused: false, rin: {}, buf: [], off: 0, offSet: false, seq: 0, lastSend: 0,
      lastIn: '', inSeq: 0, hooked: false, hostPlayers: [], size: 4, bots: false, demoT: 0, submitted: false, sel: null, seed: 1, lastStage: -1, lastCount: -1, firstRoom: true, resT: 0, shown: false
    };

    const snd = {
      hit: (kb2, e) => {
        const b = clamp(kb2 / 150, 0, 1.2);
        aud.noise(.06 + .08 * b, .3 + .35 * b, 2600, 300); aud.tone(170 - 70 * b, 55, .08 + .1 * b, 'sine', .35 + .3 * b);
        if (e === 'f') aud.noise(.25, .2, 3200, 500); else if (e === 's') aud.tone(1500, 700, .12, 'triangle', .16); else if (e === 'z') aud.tone(1000, 180, .16, 'sawtooth', .16); else if (e === 'm') aud.tone(500, 900, .14, 'sine', .14);
        if (b > .7) aud.tone(95, 35, .28, 'sine', .55);
      },
      swing: sp => { if (aud.gate('sw', 45)) aud.noise(.1 + .04 * sp, .13 + .04 * sp, 500 + sp * 200, 2400, 0, 1.2, 'bandpass'); },
      shoot: e => { if (aud.gate('sh', 40)) { if (e === 'z') { aud.tone(1200, 300, .1, 'square', .12); } else { aud.tone(420, 160, .1, 'triangle', .15); aud.noise(.05, .12, 3000, 800); } } },
      land: () => { if (aud.gate('ld', 50)) { aud.tone(120, 55, .07, 'sine', .22); aud.noise(.05, .1, 900, 200); } },
      jump: () => { if (aud.gate('jp', 50)) aud.tone(280, 560, .08, 'sine', .09); },
      djump: () => aud.tone(420, 880, .12, 'triangle', .12),
      step: () => { if (aud.gate('st', 70)) aud.noise(.03, .06, 1400, 500); },
      ff: () => aud.noise(.1, .1, 2400, 600, 0, 1, 'highpass'),
      ledge: () => { aud.tone(700, 1100, .06, 'square', .08); aud.noise(.04, .15, 3000, 1200); },
      grab: () => { aud.tone(300, 500, .06, 'square', .1); },
      shield: () => { aud.tone(900, 500, .1, 'triangle', .13); aud.noise(.06, .12, 5000, 2000); },
      sbreak: () => { aud.noise(.5, .5, 4000, 300); aud.tone(600, 120, .5, 'sawtooth', .22); },
      counter: () => { aud.tone(1100, 1500, .15, 'square', .14); aud.noise(.1, .3, 5000, 1000); },
      reflect: () => { aud.tone(1300, 1700, .1, 'triangle', .14); },
      boom: () => { aud.noise(.9, .8, 1800, 70); aud.tone(95, 32, .6, 'sine', .65); },
      ko: () => { aud.noise(.9, .7, 2400, 90); aud.tone(160, 35, .8, 'sawtooth', .35); aud.tone(900, 120, .5, 'square', .14); },
      respawn: () => { [523, 659, 784].forEach((f, i) => aud.tone(f, f, .12, 'triangle', .12, i * .06)); },
      tech: () => aud.tone(1000, 1400, .07, 'square', .1),
      bounce: () => aud.tone(150, 70, .1, 'sine', .3),
      slam: () => { aud.tone(100, 40, .2, 'sine', .5); aud.noise(.15, .3, 1200, 200); },
      tether: () => { aud.tone(500, 900, .15, 'sawtooth', .1); },
      plant: () => aud.tone(300, 150, .1, 'triangle', .14),
      pick: () => { aud.tone(1000, 1000, .04, 'square', .08); aud.tone(1500, 1500, .06, 'square', .07, .05); },
      itembreak: () => { aud.noise(.2, .3, 3000, 500); },
      itemthrow: () => aud.noise(.1, .15, 700, 1800, 0, 1, 'bandpass'),
      itemspawn: () => { aud.tone(700, 1300, .2, 'sine', .1); },
      heal: () => { [660, 880, 1100].forEach((f, i) => aud.tone(f, f, .12, 'triangle', .12, i * .07)); },
      orb: () => { aud.tone(300, 900, .3, 'sine', .15); },
      tp: () => { aud.tone(800, 200, .15, 'sine', .14); aud.noise(.1, .15, 5000, 800, 0, 1, 'highpass'); },
      adodge: () => aud.noise(.12, .15, 2000, 700, 0, 1, 'bandpass'),
      chg: () => aud.tone(200, 500, .35, 'sawtooth', .07),
      beep: n => aud.tone(n ? 988 : 523, n ? 988 : 523, n ? .3 : .12, 'square', .1),
      win: () => { [523, 659, 784, 1047].forEach((f, i) => aud.tone(f, f, .22, 'triangle', .2, i * .11)); },
      lose: () => { [392, 330, 262].forEach((f, i) => aud.tone(f, f * .96, .26, 'triangle', .18, i * .16)); },
      game: () => { aud.tone(220, 110, .6, 'sawtooth', .2); aud.noise(.5, .3, 2000, 200); },
      sudden: () => { aud.tone(150, 150, .5, 'sawtooth', .16); aud.tone(160, 160, .5, 'sawtooth', .16, .15); }
    };

    function fxEvent(e) {
      smFxEv(D, e, G.W);
      if (G.ph === 'menu') return;
      switch (e.k) {
        case 'hit': snd.hit(e.kb, e.e); break;
        case 'swing': snd.swing(e.sp || 1); break;
        case 'shoot': snd.shoot(e.e); break;
        case 'land': snd.land(); break;
        case 'jump': snd.jump(); break;
        case 'djump': snd.djump(); break;
        case 'step': snd.step(); break;
        case 'ff': snd.ff(); break;
        case 'ledge': snd.ledge(); break;
        case 'grab': case 'release': snd.grab(); break;
        case 'shieldhit': snd.shield(); break;
        case 'sbreak': snd.sbreak(); break;
        case 'counter': snd.counter(); break;
        case 'reflect': snd.reflect(); break;
        case 'boom': snd.boom(); break;
        case 'ko': snd.ko(); scoreLive(); break;
        case 'respawn': snd.respawn(); break;
        case 'tech': snd.tech(); break;
        case 'bounce': snd.bounce(); break;
        case 'slam': case 'knockdown': snd.slam(); break;
        case 'tether': snd.tether(); break;
        case 'plant': snd.plant(); break;
        case 'pick': snd.pick(); break;
        case 'itembreak': snd.itembreak(); break;
        case 'itemthrow': snd.itemthrow(); break;
        case 'itemspawn': snd.itemspawn(); break;
        case 'heal': snd.heal(); break;
        case 'orb': snd.orb(); break;
        case 'tpout': case 'tpin': snd.tp(); break;
        case 'adodge': snd.adodge(); break;
        case 'chgstart': snd.chg(); break;
        case 'sudden': snd.sudden(); break;
        case 'end': snd.game(); break;
      }
    }
    function scoreLive() {
      const W = G.W, f = W && W.F[G.me];
      if (f && G.ph !== 'menu') api.score(Math.max(0, f.ko * 100 - f.sd * 50));
    }

    function readInput(f) {
      const h = keys.h, d = (h('r') ? 1 : 0) - (h('l') ? 1 : 0), u = (h('u') ? 1 : 0) - (h('d') ? 1 : 0);
      if (d !== kb.dir) {
        const now = performance.now();
        if (d) { kb.dash = now - kb.last[d] < 240 ? 1 : 0; kb.last[d] = now; } else kb.dash = 0;
        kb.dir = d;
      }
      const s = h('s') || th.s ? 1 : 0, st = f ? f.st : 'idle';
      const full = kb.dash || s || (f && (f.air || st === 'dash' || st === 'run' || st === 'hit' || st === 'tumble' || st === 'ledge' || st === 'help'));
      let x = d ? d * (full ? 1 : .65) : 0, y = u;
      const ax = Math.abs(th.sx), ay = Math.abs(th.sy);
      if (ax > .2) x = clamp(x + Math.sign(th.sx) * Math.min(1, (ax - .12) * 1.12), -1, 1);
      if (ay > .2) y = clamp(y - Math.sign(th.sy) * Math.min(1, (ay - .12) * 1.12), -1, 1);
      return { x, y, a: h('a') || th.a ? 1 : 0, b: h('b') || th.b ? 1 : 0, j: h('j') || th.j ? 1 : 0, g: h('g') || th.g ? 1 : 0, m: h('m') || th.m ? 1 : 0, s };
    }
    function applyMe(f) { const o = readInput(f), i = f.in; i.x = o.x; i.y = o.y; i.a = o.a; i.b = o.b; i.j = o.j; i.g = o.g; i.m = o.m; i.s = o.s; }
    function applyNet(f, p) {
      const r = G.rin[p.slot], i = f.in;
      if (!r) { i.x = i.y = i.a = i.b = i.j = i.g = i.m = i.s = 0; return; }
      if (r.q.length) r.cur = r.q.length > 4 ? (r.q.shift(), r.q.shift()) : r.q.shift();
      const c = r.cur, b = c.b;
      i.x = c.x; i.y = c.y; i.a = b & 1; i.b = b >> 1 & 1; i.j = b >> 2 & 1; i.g = b >> 3 & 1; i.m = b >> 4 & 1; i.s = b >> 5 & 1;
    }
    function zeroIn(f) { const i = f.in; i.x = i.y = i.a = i.b = i.j = i.g = i.m = i.s = 0; }

    function stepFrame() {
      const W = G.W;
      D.t++;
      if (G.ph === 'count') {
        G.pt--;
        if (G.pt === 119 || G.pt === 80 || G.pt === 60) snd.beep(0);
        if (G.pt <= 50) { G.ph = 'play'; G.goT = 50; snd.beep(1); }
        smFxStep(D);
        return;
      }
      if (G.goT > 0) G.goT--;
      for (const f of W.F) {
        const p = G.players[f.slot];
        if (G.ph === 'over') { zeroIn(f); continue; }
        if (G.ph === 'menu' || !p || p.kind === 'cpu') smAI(W, f);
        else if (p.kind === 'me') applyMe(f);
        else applyNet(f, p);
      }
      smStep(W);
      for (const e of W.ev) fxEvent(e);
      W.ev.length = 0;
      if (G.role !== 'host') W.evNet.length = 0;
      smFxStep(D);
      if (W.over && G.ph !== 'over' && G.ph !== 'menu') { G.ph = 'over'; G.overT = 0; G.shown = false; }
      if (G.ph === 'over') { G.overT++; if (G.overT === 150 && !G.shown) matchOver(); }
    }

    function hostFrame(dt) {
      const W = G.W;
      if (!W || G.paused) return;
      let sc = 1;
      if (D.slowT > 0) sc = .38;
      if (G.ph === 'over' && G.overT < 110) sc = .5;
      G.acc += dt * sc;
      let n = 0;
      while (G.acc >= 1 / 60 && n < 5) { G.acc -= 1 / 60; n++; if (D.slowT > 0) D.slowT--; stepFrame(); }
      if (n === 5) G.acc = 0;
      if (G.ph === 'menu' && W.over && ++G.demoT > 120) startDemo();
      if (G.ph === 'menu' && !W.over) G.demoT = 0;
    }

    function matchOver() {
      G.shown = true;
      const W = G.W, res = W.res;
      if (!res) return;
      const mine = G.players[G.me] && G.players[G.me].kind === 'me', win = res.win;
      if (!G.role && !G.submitted) {
        G.submitted = true;
        const f = W.F[0], won = win === 0;
        api.submit(Math.max(0, f.ko * 100 - f.sd * 50 + (won ? 300 + G.rules.lvl * 100 + (G.players.length - 2) * 100 : 0)));
      }
      if (G.role === 'host') clearResume();
      showOver();
    }

    function snapshot(now) {
      const W = G.W;
      const F = W.F.map(f => {
        const fl = (f.fi ? 1 : 0) | (f.fa ? 2 : 0) | (f.fc ? 4 : 0) | (f.fr ? 8 : 0) | (f.fg ? 16 : 0) | (f.air ? 32 : 0) | (f.fast ? 64 : 0) | (f.inv > 0 ? 128 : 0) | (f.out ? 256 : 0) | (f.orb > 0 ? 512 : 0) | (f.kx < 0 ? 1024 : 0) | (f.rdir < 0 ? 2048 : 0) | (f.dvx < 0 ? 4096 : 0);
        const it = f.item ? SM_IK.indexOf(f.item.k) + 1 : 0;
        return [q1(f.x), q1(f.y), q2(f.vx), q2(f.vy), f.face, SM_SI[f.st], smMvEnc(f.mv), f.mf, q1(f.dmg), f.stocks, fl, q1(f.sh), it, f.item ? (f.item.k === 'bomb' ? f.item.fuse : f.item.k === 'bat' ? f.item.dur : f.item.ammo) : 0, f.sf, f.hl > 0 ? Math.min(f.hl, 20) : 0, q2(f.chgv), f.lag | 0, f.ko, f.sd];
      });
      const m = {
        t: 's', q: ++G.seq, ht: Math.round(now), ph: G.ph === 'count' ? 0 : G.ph === 'play' ? 1 : 2, pt: G.pt, go: G.goT, ot: G.overT, tm: W.t, lim: W.limit, sd: W.sudden ? 1 : 0, wv: q2(W.wv || 0), wg: q2(W.wg || 0), wd: W.wd || 1,
        F, Sp: W.soft.filter(p => p.mv).map(p => [q1(p.x0), q1(p.y)]),
        Pj: W.proj.map(p => [p.sh, q1(p.x), q1(p.y), q2(p.vx), q2(p.vy), q1(p.sz), p.col, q2(p.rot), p.trap ? 1 : 0, p.land || 0, p.t, p.exp ? 1 : 0, q1(p.r), p.life, p.id]),
        It: W.items.map(i => [i.id, SM_IK.indexOf(i.k), q1(i.x), q1(i.y), i.rest ? 1 : 0, i.life]),
        E: W.evNet.map(e => { const o = {}; for (const k in e) o[k] = typeof e[k] === 'number' ? q1(e[k]) : e[k]; return o; })
      };
      if (W.res) m.res = W.res;
      return m;
    }
    function hostSend(now) {
      if (G.role !== 'host' || !G.W || !api.net.connected) return;
      if (now - G.lastSend < 32) return;
      G.lastSend = now;
      const m = snapshot(now), ev = m.E.length > 0;
      G.W.evNet.length = 0;
      api.net.send(m, !ev);
      if (now - G.resT > 2000) { G.resT = now; saveResume(); }
    }

    function guestApply(A, C2, u) {
      const W = G.W;
      if (!W) return;
      W.t = A.tm; W.limit = A.lim; W.sudden = A.sd; W.wv = A.wv; W.wg = A.wg; W.wd = A.wd;
      const prev = G.ph;
      G.ph = SM_PHN[A.ph]; G.pt = A.pt; G.goT = A.go; G.overT = A.ot;
      if (A.res) { W.res = A.res; W.over = 1; } else W.over = 0;
      W.F.forEach((f, i) => {
        const a = A.F[i], c = C2.F[i] || a;
        if (!a) return;
        const far = Math.hypot(c[0] - a[0], c[1] - a[1]) > 36, uu = far ? (u > .5 ? 1 : 0) : u;
        f.x = a[0] + (c[0] - a[0]) * uu; f.y = a[1] + (c[1] - a[1]) * uu; f.vx = a[2] + (c[2] - a[2]) * uu; f.vy = a[3] + (c[3] - a[3]) * uu;
        const s = u > .5 ? c : a, fl = s[10];
        f.face = s[4]; f.st = SM_ST[s[5]]; f.mv = smMvDec(f.ch, s[6]); f.mf = s[7]; f.act = f.mf; f.dmg = s[8]; f.stocks = s[9];
        f.fi = fl & 1; f.fa = fl >> 1 & 1; f.fc = fl >> 2 & 1; f.fr = fl >> 3 & 1; f.fg = fl >> 4 & 1; f.air = !!(fl & 32); f.fast = !!(fl & 64); f.inv = fl & 128 ? 1 : 0; f.out = fl & 256 ? 1 : 0; f.orb = fl & 512 ? 1 : 0;
        f.kx = fl & 1024 ? -1 : 1; f.rdir = fl & 2048 ? -1 : 1; f.dvx = fl & 4096 ? -1 : 1; f.pl = f.air ? null : {};
        f.sh = s[11]; f.item = s[12] ? { k: SM_IK[s[12] - 1], fuse: s[13], ammo: s[13], dur: s[13] } : null;
        f.sf = s[14]; f.hl = s[15]; f.shake = s[15]; f.chgv = s[16]; f.chg = s[16] > 0 ? 1 : 0; f.lag = s[17]; f.ko = s[18]; f.sd = s[19]; f.tm++;
        if (!G.shown && false) f.tm = 0;
      });
      let k = 0;
      W.soft.forEach(p => { if (!p.mv) return; const a = A.Sp[k], c = C2.Sp[k] || a; k++; if (!a) return; p.dx = 0; p.dy = 0; p.x0 = a[0] + (c[0] - a[0]) * u; p.x1 = p.x0 + p.w; p.y = a[1] + (c[1] - a[1]) * u; });
      const dt = Math.max(0, (C2.ht - A.ht) * u / 1000) * 60;
      W.proj = A.Pj.map(p => ({ sh: p[0], x: p[1] + p[3] * dt, y: p[2] + p[4] * dt, vx: p[3], vy: p[4], sz: p[5], col: p[6], rot: p[7], trap: p[8], land: p[9], t: p[10], exp: p[11], r: p[12], life: p[13], id: p[14] }));
      W.items = A.It.map(i => ({ id: i[0], k: SM_IK[i[1]], x: i[2], y: i[3], rest: i[4], life: i[5] }));
      if (G.ph !== prev) {
        if (G.ph === 'play') snd.beep(1);
        if (G.ph === 'over' && !G.shown && A.res) { }
      }
    }
    function guestFrame(dt, now) {
      const B = G.buf, W = G.W;
      if (!W || !B.length) return;
      const tr = now - G.off - 110;
      while (B.length > 2 && B[1].ht <= tr) B.shift();
      const A = B[0], C2 = B[1] || B[0];
      const u = C2.ht > A.ht ? clamp((tr - A.ht) / (C2.ht - A.ht), 0, 1) : 0;
      for (const s of B) if (!s.done && s.ht <= tr) { s.done = 1; for (const e of s.E) fxEvent(e); }
      guestApply(A, C2, u);
      D.t += dt * 60;
      const c = Math.ceil(G.pt / 40);
      if (G.ph === 'count' && c !== G.lastCount) snd.beep(0);
      G.lastCount = c;
      if (A.ph === 2 && G.overT >= 150 && !G.shown && W.res) { G.shown = true; showOver(); }
      smFxStep(D);
    }
    function guestSend(now) {
      const W = G.W;
      if (!W || !api.net.connected) return;
      const f = W.F[G.me];
      if (!f) return;
      const o = readInput(f);
      let b = 0; SM_BITS.forEach((k, n) => { if (o[k]) b |= 1 << n; });
      const xi = Math.round(o.x * 20), yi = Math.round(o.y * 20), key = b + ',' + xi + ',' + yi;
      if (key !== G.lastIn) { G.lastIn = key; G.lastSend = now; api.net.send({ t: 'i', s: ++G.inSeq, b, x: xi, y: yi }); }
      else if (now - G.lastSend > 100) { G.lastSend = now; api.net.send({ t: 'i', s: ++G.inSeq, b, x: xi, y: yi }, true); }
    }

    function render(dt) {
      const W = G.W;
      g.clearRect(0, 0, SM_W, SM_H);
      if (!W) { g.fillStyle = '#0c1022'; g.fillRect(0, 0, SM_W, SM_H); return; }
      if (G.role !== 'guest') D.t += 0;
      smCamStep(W, D, dt);
      smDrawWorld(g, W, D, G.names, G.dup);
      if (G.ph !== 'menu' && G.ph !== 'lobby') { smHudDraw(g, G, W, D); smBanner(g, G, W, D); }
    }

    function saveResume() {
      if (G.role !== 'host' || !G.W) return;
      try {
        sessionStorage.setItem('gameplay:sm:' + api.net.code, JSON.stringify({
          at: Date.now(), code: api.net.code, pl: G.players.map(p => [p.name, p.ch, p.kind === 'cpu' ? 0 : 1, p.lvl || 5]), st: G.stIdx, rules: G.rules, t: G.W.t, over: G.W.over ? 1 : 0,
          state: G.W.F.map(f => [f.stocks, Math.round(f.dmg), f.ko, f.sd, f.out ? 1 : 0])
        }));
      } catch (e) {}
    }
    function clearResume() { try { sessionStorage.removeItem('gameplay:sm:' + api.net.code); } catch (e) {} }
    function loadResume() {
      try {
        const x = JSON.parse(sessionStorage.getItem('gameplay:sm:' + api.net.code) || 'null');
        if (x && x.code === api.net.code && Date.now() - x.at < 432e5 && !x.over) return x;
      } catch (e) {}
      return null;
    }

    function setUi(html, cls) { ui.className = 'sm-ui ' + (cls || ''); ui.innerHTML = html; ui.hidden = false; PV.c = null; }
    function hideUi() { ui.hidden = true; ui.innerHTML = ''; ui.onclick = null; PV.c = null; }

    const PV = { c: null, ch: 0, t: 0, f: null };
    function pvSet(ch) { PV.ch = ch; PV.t = 0; PV.f = smFake(ch, 0); }
    function pvDraw() {
      const c = PV.c;
      if (!c || !c.isConnected || ui.hidden || !PV.f) return;
      if (!c.width || c.dataset.ok !== '1') { const dpr = Math.min(window.devicePixelRatio || 1, 2); c.width = +c.dataset.w * dpr; c.height = +c.dataset.h * dpr; c.dataset.ok = '1'; }
      const q = c.getContext('2d'), dpr = c.width / +c.dataset.w, f = PV.f, C0 = f.C;
      const per = 40, tot = SM_SEQ.length * 1;
      PV.t++;
      let seg = Math.floor(PV.t / 1) , idx = 0, tt = PV.t;
      const lens = SM_SEQ.map(s => { const m = C0[s[0]][s[1]]; return (m ? m.len : 20) + per; });
      const sum = lens.reduce((a, b) => a + b, 0);
      tt = PV.t % sum;
      for (; idx < lens.length; idx++) { if (tt < lens[idx]) break; tt -= lens[idx]; }
      const m = C0[SM_SEQ[idx][0]][SM_SEQ[idx][1]];
      f.tm++;
      if (m && tt < m.len) { f.st = 'atk'; f.mv = m; f.mf = tt; } else { f.st = 'idle'; f.mv = null; }
      q.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = +c.dataset.w, h = +c.dataset.h;
      q.clearRect(0, 0, w, h);
      const gl = q.createRadialGradient(w / 2, h - 10, 4, w / 2, h - 10, w * .6); gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = gl; q.fillRect(0, 0, w, h);
      q.fillStyle = 'rgba(255,255,255,.1)'; q.beginPath(); q.ellipse(w / 2, h - 12, w * .34, 5, 0, 0, TAU); q.fill();
      q.save(); q.translate(w / 2 - 6, h - 14); q.scale(h / 42, h / 42); smDrawFighter(q, f, { t: PV.t }, null, false); q.restore();
    }

    function detailHtml(ch) {
      const C0 = SM_CHARS[ch];
      return `<canvas class="sm-prev" data-w="168" data-h="150"></canvas><div class="sm-dt"><h3>${esc(C0.n)} <em>${esc(C0.t)}</em></h3><p>${esc(C0.b)}</p><div class="sm-bars">${SM_STAT.map((n, i) => `<div><span>${n}</span><i>${[0, 1, 2, 3, 4].map(k => `<u class="${k < C0.st[i] ? 'on' : ''}"></u>`).join('')}</i></div>`).join('')}</div><p class="sm-tip">${esc(C0.pr)}</p></div>`;
    }
    function bindPrev(ch) {
      pvSet(ch);
      PV.c = ui.querySelector('.sm-prev');
    }
    function gridHtml() {
      return SM_CHARS.map((c, i) => `<button class="sm-fc" data-ch="${i}"><canvas data-w="64" data-h="64"></canvas><b>${esc(c.n)}</b></button>`).join('');
    }
    function drawGrid() {
      ui.querySelectorAll('.sm-fc canvas').forEach((c, i) => smPortrait(c, i, 0));
    }
    function syncUi() {
      ui.querySelectorAll('.sm-seg').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(saved[s.dataset.k]) === b.dataset.v)));
      ui.querySelectorAll('.sm-fc').forEach(b => b.classList.toggle('on', +b.dataset.ch === saved.ch));
      ui.querySelectorAll('.sm-st').forEach(b => b.classList.toggle('on', +b.dataset.st === saved.stage));
      ui.querySelectorAll('[data-show]').forEach(e => { const [k, v] = e.dataset.show.split('='); e.hidden = String(saved[k]) !== v; });
      const go = ui.querySelector('.sm-go');
      if (go) go.textContent = saved.play === 'online' ? 'Go online' : 'Fight!';
    }

    function menuHtml() {
      return `<div class="sm-card"><div class="sm-top"><div class="sm-logo"><b>SMASH</b><small>Fighters</small></div>${SM_ISSEG('play', [['cpu', 'vs CPU'], ['online', 'Online']])}</div>
<div class="sm-main"><div class="sm-grid">${gridHtml()}</div><div class="sm-det">${detailHtml(saved.ch)}</div></div>
<div class="sm-opts"><div class="sm-row" data-show="play=cpu"><span>CPUs</span>${SM_ISSEG('cpus', [[1, '1'], [2, '2'], [3, '3']])}<span class="sm-gap">Level</span>${SM_ISSEG('lvl', SM_CPU.map((n, i) => [i + 1, i + 1]))}</div>
<div class="sm-row"><span>Mode</span>${SM_ISSEG('mode', [['stock', 'Stock'], ['time', 'Time']])}<span class="sm-gap" data-show="mode=stock">Stocks</span><span data-show="mode=stock">${SM_ISSEG('stocks', [[1, '1'], [2, '2'], [3, '3'], [5, '5']])}</span><span class="sm-gap" data-show="mode=time">Minutes</span><span data-show="mode=time">${SM_ISSEG('time', [[2, '2'], [3, '3'], [5, '5']])}</span><span class="sm-gap">Items</span>${SM_ISSEG('items', [[0, 'Off'], [1, 'Low'], [2, 'High']])}</div></div>
<div class="sm-stages"><button class="sm-st" data-st="-1"><span class="sm-rnd">?</span><em>Random</em></button>${SM_STAGES.map((s, i) => `<button class="sm-st" data-st="${i}" title="${esc(s.b)}"><canvas width="144" height="81"></canvas><em>${esc(s.n)}</em></button>`).join('')}</div>
<div class="sm-help">${touchDev ? 'Stick moves, buttons attack. Hold SMASH to charge' : 'A D move, W S up and down, Space jump, J attack, K special, L smash (hold to charge), I grab, Shift shield'}</div>
<div class="sm-btns"><button class="g-btn sm-go">Fight!</button></div></div>`;
    }
    function showMenu() {
      G.ph = 'menu'; G.role = null; G.paused = false; mb.hidden = true; G.overT = 0; G.buf = []; G.shown = false; G.sel = null;
      api.hideOverlay();
      if (tbEl) tbEl.hidden = true;
      startDemo();
      setUi(menuHtml(), 'menu');
      drawGrid();
      ui.querySelectorAll('.sm-st canvas').forEach((c, i) => smStageThumb(c, i));
      bindPrev(saved.ch);
      syncUi();
      ui.onclick = e => {
        const sb = e.target.closest('.sm-seg button');
        if (sb) { const v = sb.dataset.v; saved[sb.parentNode.dataset.k] = /^-?\d+$/.test(v) ? +v : v; api.save(saved); syncUi(); api.sfx('tap'); return; }
        const fc = e.target.closest('.sm-fc');
        if (fc) { saved.ch = +fc.dataset.ch; api.save(saved); ui.querySelector('.sm-det').innerHTML = detailHtml(saved.ch); bindPrev(saved.ch); syncUi(); api.sfx('tap'); return; }
        const st = e.target.closest('.sm-st');
        if (st) { saved.stage = +st.dataset.st; api.save(saved); syncUi(); api.sfx('tap'); return; }
        if (e.target.closest('.sm-go')) { api.sfx('tap'); if (saved.play === 'online') goOnline(); else startSolo(); }
      };
    }
    function startDemo() {
      const a = ri(0, SM_CHARS.length - 1);
      let b; do b = ri(0, SM_CHARS.length - 1); while (b === a);
      let si; do si = ri(0, SM_STAGES.length - 1); while (si === G.lastStage);
      G.lastStage = si; G.players = []; G.names = ['A', 'B']; G.dup = [false, false]; G.demoT = 0; G.hudDmg = []; G.hudF = [];
      G.W = smNewWorld(SM_STAGES[si].id, [{ ch: a, name: 'A', kind: 'cpu', lvl: 4 }, { ch: b, name: 'B', kind: 'cpu', lvl: 4 }], { stocks: 1, seed: ri(1, 9999) });
      D = smD0();
    }

    function pickStage() {
      if (saved.stage >= 0 && saved.stage < SM_STAGES.length) return saved.stage;
      let s; do s = ri(0, SM_STAGES.length - 1); while (s === G.lastStage && SM_STAGES.length > 1);
      return s;
    }
    function rulesNow() { return { mode: saved.mode, stocks: saved.stocks, time: saved.time, items: saved.items, lvl: saved.lvl }; }
    function makeWorld(pl, stIdx, rules, seed) {
      return smNewWorld(SM_STAGES[stIdx].id, pl.map(p => ({ ch: p.ch, name: p.name, kind: p.kind === 'cpu' ? 'cpu' : 'human', lvl: p.lvl })), {
        stocks: rules.mode === 'stock' ? rules.stocks : 3, mode: rules.mode, time: rules.mode === 'time' ? rules.time : 0, items: rules.items, seed
      });
    }
    function beginMatchUi() { hideUi(); mb.hidden = false; api.hideOverlay(); G.shown = false; G.submitted = false; if (tbEl) tbEl.hidden = false; keys.clear(); }
    function startMatch(restore) {
      const pl = G.players;
      G.W = makeWorld(pl, G.stIdx, G.rules, G.seed);
      D = smD0();
      G.names = pl.map(p => p.name); G.dup = pl.map((p, i) => pl.some((q, j) => j < i && q.ch === p.ch)); G.hudDmg = []; G.hudF = [];
      G.ph = 'count'; G.pt = 120; G.goT = 0; G.overT = 0; G.acc = 0; G.lastCount = -1; G.shown = false;
      if (restore) {
        G.W.t = restore.t;
        restore.state.forEach((s, i) => { const f = G.W.F[i]; if (f) { f.stocks = s[0]; f.dmg = s[1]; f.ko = s[2]; f.sd = s[3]; if (s[4]) { f.out = 1; f.st = 'dead'; } } });
      }
      G.lastStage = G.stIdx;
      beginMatchUi();
      api.score(0);
      if (G.role === 'host') { sendCfg(null); saveResume(); }
    }
    function startSolo() {
      G.role = null;
      const nc = clamp(saved.cpus, 1, 3);
      G.players = [{ slot: 0, name: 'You', kind: 'me', ch: saved.ch }];
      const used = [saved.ch];
      for (let i = 0; i < nc; i++) {
        let c, n = 0; do c = ri(0, SM_CHARS.length - 1); while (used.includes(c) && ++n < 20);
        used.push(c);
        G.players.push({ slot: i + 1, name: SM_NAMES[(i * 3 + ri(0, 2)) % SM_NAMES.length], kind: 'cpu', ch: c, lvl: saved.lvl });
      }
      G.me = 0; G.stIdx = pickStage(); G.rules = rulesNow(); G.seed = ri(1, 99999);
      startMatch(null);
    }

    function showOver() {
      mb.hidden = true;
      const W = G.W, res = W.res, win = res.win, mine = G.players[G.me] && G.players[G.me].kind === 'me';
      const rows = res.rows;
      const stats = rows.map((r, k) => {
        const p = G.players[r.slot] || { name: 'Fighter' }, c = SM_CHARS[W.F[r.slot].ch];
        return [`${k + 1}. ${esc(p.name)} (${esc(c.n)})`, `${r.kos} KO / ${r.sd} SD / ${r.dealt}%`];
      });
      const title = win < 0 ? 'Draw' : win === G.me && mine ? 'You win!' : `${esc((G.players[win] || { name: 'Fighter' }).name)} wins`;
      if (win === G.me && mine) snd.win(); else if (mine) snd.lose();
      if (G.role === 'guest') { api.overlay({ kicker: 'Game', title, stats, text: 'Waiting for the host.', button: null, secondary: 'Leave', onSecondary: leave }); return; }
      if (G.role === 'host') { api.overlay({ kicker: 'Game', title, stats, button: 'Rematch', onAction: () => hostRematch(), secondary: 'Fighters', onSecondary: () => hostBackToSelect() }); return; }
      api.overlay({ kicker: win === 0 ? 'Victory' : 'Game', title, stats, button: 'Rematch', onAction: () => startSolo(), secondary: 'Menu', onSecondary: showMenu });
    }
    function leave() {
      if (G.role) { try { api.net.close(); } catch (e) {} }
      G.role = null; showMenu();
    }

    function chipsHtml() {
      const s = G.sel;
      return s.picks.map((p, i) => `<div class="sm-chip${p.rdy ? ' rdy' : ''}${i === s.me ? ' me' : ''}" style="--c:${SM_COL[i % 4].c}"><canvas data-w="44" data-h="44" data-ch="${p.ch}"></canvas><span><b>${esc(p.name.slice(0, 11))}</b><small>${esc(SM_CHARS[p.ch].n)}${p.kind === 'c' ? ' · CPU' : ''}</small></span><i>${p.rdy ? 'READY' : p.kind === 'c' ? 'AUTO' : '...'}</i></div>`).join('');
    }
    function renderChips() {
      const el = ui.querySelector('.sm-chips');
      if (!el) return;
      el.innerHTML = chipsHtml();
      el.querySelectorAll('canvas').forEach((c, i) => smPortrait(c, +c.dataset.ch, i));
      const me = G.sel.picks[G.sel.me], rdy = ui.querySelector('.sm-rdy');
      if (rdy) { rdy.textContent = G.role === 'host' ? (G.sel.picks.every(p => p.rdy || p.kind === 'c' || p === me) ? 'Start match' : 'Start now') : me.rdy ? 'Not ready' : 'Ready'; rdy.classList.toggle('ghost', G.role !== 'host' && me.rdy); }
      ui.querySelectorAll('.sm-fc').forEach(b => b.classList.toggle('on', +b.dataset.ch === me.ch));
    }
    function showSelect() {
      G.ph = 'csel'; mb.hidden = true; if (tbEl) tbEl.hidden = true; api.hideOverlay();
      const st = G.stIdx >= 0 ? SM_STAGES[G.stIdx].n : 'Random stage', rl = G.rules, me = G.sel.picks[G.sel.me];
      setUi(`<div class="sm-card"><div class="sm-top"><div class="sm-logo"><b>SMASH</b><small>Pick your fighter</small></div><div class="sm-meta">${esc(rl.mode === 'stock' ? rl.stocks + ' stock' + (rl.stocks > 1 ? 's' : '') : rl.time + ' min')} · items ${['off', 'low', 'high'][rl.items]} · ${esc(st)}</div></div>
<div class="sm-main"><div class="sm-grid">${gridHtml()}</div><div class="sm-det">${detailHtml(me.ch)}</div></div>
<div class="sm-chips"></div><div class="sm-btns"><button class="g-btn sm-rdy">Ready</button><button class="g-btn ghost" data-b="leave">Leave</button></div></div>`, 'menu');
      drawGrid(); bindPrev(me.ch); renderChips();
      ui.onclick = e => {
        const fc = e.target.closest('.sm-fc');
        if (fc) {
          const ch = +fc.dataset.ch, p = G.sel.picks[G.sel.me];
          p.ch = ch; p.rdy = 0; saved.ch = ch; api.save(saved);
          ui.querySelector('.sm-det').innerHTML = detailHtml(ch); bindPrev(ch); api.sfx('tap');
          selChanged(); return;
        }
        if (e.target.closest('[data-b="leave"]')) { api.sfx('tap'); leave(); return; }
        if (e.target.closest('.sm-rdy')) {
          api.sfx('tap');
          if (G.role === 'host') { hostFromSel(); return; }
          const p = G.sel.picks[G.sel.me]; p.rdy = p.rdy ? 0 : 1; selChanged();
        }
      };
    }
    function selChanged() {
      renderChips();
      if (G.role === 'host') sendSel();
      else api.net.send({ t: 'pick', ch: G.sel.picks[G.sel.me].ch, rdy: G.sel.picks[G.sel.me].rdy });
    }
    function selMsg(me) { return { t: 'sel', me, picks: G.sel.picks.map(p => [p.name, p.ch, p.rdy ? 1 : 0, p.kind === 'c' ? 0 : 1]), st: G.stIdx, rules: G.rules }; }
    function sendSel(only) {
      G.sel.picks.forEach((p, i) => { if (p.id && i > 0 && (!only || only === p.id)) api.net.sendTo(p.id, selMsg(i)); });
    }

    async function goOnline() {
      if (!G.hooked) hookNet();
      api.hideOverlay();
      G.ph = 'lobby'; G.role = null; hideUi(); mb.hidden = true; if (tbEl) tbEl.hidden = true; G.buf = []; G.shown = false;
      const wasNew = api.net.invite === 'NEW';
      const r = await api.net.room({ title: 'Super Smash Bros.', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true });
      if (!api.alive) return;
      if (!r) { showMenu(); return; }
      G.role = r.role;
      if (r.role === 'host') {
        G.hostPlayers = r.players.slice(0, 4); G.size = Math.min(4, +r.size || G.hostPlayers.length); G.bots = !!r.bots;
        G.rules = rulesNow(); G.stIdx = saved.stage;
        const sv = G.firstRoom && wasNew ? loadResume() : null;
        G.firstRoom = false;
        if (sv) offerResume(sv); else hostSelect();
      } else {
        G.ph = 'wait'; G.me = -1;
        setUi('<div class="sm-card sm-pan"><p class="sm-k">Online</p><h3>Connected</h3><p class="sm-t">Waiting for the host to pick the rules.</p><div class="sm-btns"><button class="g-btn ghost" data-b="leave">Leave</button></div></div>', 'panel');
        ui.onclick = e => { if (e.target.closest('[data-b="leave"]')) leave(); };
      }
    }
    function offerResume(sv) {
      G.ph = 'wait';
      const alive = sv.state.filter(s => !s[4]).length;
      setUi(`<div class="sm-card sm-pan"><p class="sm-k">Online</p><h3>Game in progress</h3><p class="sm-t">Saved match with ${alive} fighter${alive > 1 ? 's' : ''} left on the ${esc(SM_STAGES[sv.st].n)}.</p><div class="sm-btns"><button class="g-btn" data-b="go">Resume game</button><button class="g-btn ghost" data-b="new">New game</button><button class="g-btn ghost" data-b="leave">Leave</button></div></div>`, 'panel');
      ui.onclick = e => {
        const b = e.target.closest('[data-b]'); if (!b) return;
        api.sfx('tap');
        if (b.dataset.b === 'go') hostResume(sv); else if (b.dataset.b === 'new') { clearResume(); hostSelect(); } else leave();
      };
    }
    function hostResume(sv) {
      const hp = G.hostPlayers, used = new Set(), pl = [];
      sv.pl.forEach((q, i) => {
        if (i === 0) { pl.push({ slot: 0, name: hp[0].name, kind: 'me', ch: q[1], id: hp[0].id }); return; }
        if (q[2]) {
          const gi = hp.findIndex((h, k) => k > 0 && !used.has(k) && h.name === q[0]);
          if (gi >= 0) { used.add(gi); pl.push({ slot: i, name: hp[gi].name, kind: 'net', ch: q[1], id: hp[gi].id }); return; }
          pl.push({ slot: i, name: q[0].slice(0, 9) + ' bot', kind: 'cpu', ch: q[1], lvl: sv.rules.lvl });
        } else pl.push({ slot: i, name: q[0], kind: 'cpu', ch: q[1], lvl: sv.rules.lvl });
      });
      hp.forEach((h, k) => { if (k > 0 && !used.has(k)) { const sl = pl.findIndex(p => p.kind === 'cpu'); if (sl >= 0) pl[sl] = { slot: sl, name: h.name, kind: 'net', ch: pl[sl].ch, id: h.id }; } });
      G.players = pl; G.me = 0; G.stIdx = sv.st; G.rules = sv.rules; G.seed = ri(1, 99999);
      setupNetIn();
      startMatch(sv);
    }
    function setupNetIn() {
      G.rin = {};
      G.players.forEach(p => { if (p.kind === 'net') G.rin[p.slot] = { q: [], cur: { b: 0, x: 0, y: 0 }, last: '', s: 0 }; });
    }
    function hostSelect() {
      const hp = G.hostPlayers, total = G.bots ? Math.max(G.size, hp.length) : hp.length, picks = [];
      hp.forEach((q, i) => picks.push({ id: q.id, name: q.name, ch: i === 0 ? saved.ch : (i * 3 + 1) % SM_CHARS.length, rdy: 0, kind: 'h' }));
      for (let i = hp.length; i < total; i++) picks.push({ id: null, name: SM_NAMES[(i * 3 + ri(0, 2)) % SM_NAMES.length], ch: ri(0, SM_CHARS.length - 1), rdy: 1, kind: 'c' });
      G.sel = { picks, me: 0 };
      if (G.stIdx < 0) G.stIdx = -1;
      showSelect();
      sendSel();
    }
    function hostFromSel() {
      const picks = G.sel.picks, st = G.stIdx;
      G.players = picks.map((p, i) => (i === 0 ? { slot: 0, name: p.name, kind: 'me', ch: p.ch, id: p.id } : p.kind === 'c' ? { slot: i, name: p.name, kind: 'cpu', ch: p.ch, lvl: saved.lvl } : { slot: i, name: p.name, kind: 'net', ch: p.ch, id: p.id }));
      G.me = 0; G.stIdx = st >= 0 ? st : pickStage(); G.rules = rulesNow(); G.seed = ri(1, 99999);
      setupNetIn();
      startMatch(null);
    }
    function hostRematch() { api.hideOverlay(); G.seed = ri(1, 99999); if (saved.stage < 0) G.stIdx = pickStage(); setupNetIn(); startMatch(null); }
    function hostBackToSelect() {
      api.hideOverlay(); clearResume();
      G.sel.picks.forEach(p => { if (p.kind === 'h') p.rdy = 0; });
      G.ph = 'csel'; showSelect(); sendSel();
    }
    function cfgMsg(slot) {
      return { t: 'cfg', me: slot, pl: G.players.map(p => [p.name, p.ch, p.kind === 'cpu' ? 0 : 1, p.lvl || 5]), st: G.stIdx, rules: G.rules, seed: G.seed };
    }
    function sendCfg(only) {
      G.players.forEach(p => { if (p.kind === 'net' && (!only || only === p.id)) api.net.sendTo(p.id, cfgMsg(p.slot)); });
    }

    function hookNet() {
      G.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !G.role) return;
        if (G.role === 'host') {
          if (d.t === 'i') {
            const p = G.players.find(q => q.kind === 'net' && q.id === from);
            if (!p) return;
            const r = G.rin[p.slot] || (G.rin[p.slot] = { q: [], cur: { b: 0, x: 0, y: 0 }, last: '', s: 0 });
            if (!(d.s > r.s)) return;
            r.s = d.s;
            const k = d.b + ',' + d.x + ',' + d.y;
            if (k === r.last) return;
            r.last = k;
            r.q.push({ b: d.b | 0, x: clamp((d.x | 0) / 20, -1, 1), y: clamp((d.y | 0) / 20, -1, 1) });
            if (r.q.length > 14) r.q.shift();
          } else if (d.t === 'pick' && G.sel && G.ph === 'csel') {
            const p = G.sel.picks.find(q => q.id === from);
            if (!p) return;
            p.ch = clamp(d.ch | 0, 0, SM_CHARS.length - 1); p.rdy = d.rdy ? 1 : 0;
            renderChips(); sendSel();
          }
        } else {
          if (d.t === 'sel') {
            G.sel = { me: d.me | 0, picks: d.picks.map((q, i) => ({ name: q[0], ch: q[1], rdy: q[2], kind: q[3] ? 'h' : 'c' })) };
            G.stIdx = d.st; G.rules = d.rules;
            if (G.ph !== 'csel') showSelect(); else renderChips();
          } else if (d.t === 'cfg') {
            G.me = d.me | 0; G.rules = d.rules; G.stIdx = d.st; G.seed = d.seed;
            G.players = d.pl.map((q, i) => ({ slot: i, name: q[0], ch: q[1], kind: i === G.me ? 'me' : q[2] ? 'net' : 'cpu', lvl: q[3] }));
            G.W = makeWorld(G.players, G.stIdx, G.rules, G.seed); D = smD0();
            G.names = G.players.map(p => p.name); G.dup = G.players.map((p, i) => G.players.some((q, j) => j < i && q.ch === p.ch)); G.hudDmg = []; G.hudF = [];
            G.buf = []; G.offSet = false; G.lastIn = ''; G.inSeq = 0; G.shown = false; G.ph = 'count'; G.pt = 120; G.goT = 0; G.overT = 0;
            beginMatchUi();
          } else if (d.t === 's') {
            if (!G.W) return;
            const now = performance.now(), o = now - d.ht;
            G.off = G.offSet ? Math.min(o, G.off + 1.5) : o; G.offSet = true;
            const B = G.buf;
            let j = B.length;
            while (j > 0 && B[j - 1].q > d.q) j--;
            if (j > 0 && B[j - 1].q === d.q) return;
            B.splice(j, 0, d);
            if (B.length > 40) B.shift();
          }
        }
      });
      api.net.on('leave', pl => {
        if (G.role !== 'host' || !pl) return;
        if (G.ph === 'csel' && G.sel) {
          const p = G.sel.picks.find(q => q.id === pl.id);
          if (p) { p.kind = 'c'; p.id = null; p.rdy = 1; p.name = p.name.slice(0, 8) + ' bot'; renderChips(); sendSel(); }
          return;
        }
        const p = G.players.find(q => q.kind === 'net' && q.id === pl.id);
        if (!p) return;
        p.kind = 'cpu'; p.lvl = saved.lvl; p.name = p.name.slice(0, 8) + ' bot'; delete G.rin[p.slot];
        G.names[p.slot] = p.name;
        api.toast(pl.name + ' left. A CPU takes over.');
        saveResume();
      });
      api.net.on('rejoin', pl => {
        if (G.role !== 'host' || !pl) return;
        if (G.ph === 'csel' && G.sel) { sendSel(pl.id); return; }
        const p = G.players.find(q => q.kind === 'net' && q.id === pl.id);
        if (!p) return;
        api.net.sendTo(pl.id, cfgMsg(p.slot));
      });
      api.net.on('lobby', () => { if (G.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!G.role) return;
        G.role = null; G.ph = 'left'; mb.hidden = true; if (tbEl) tbEl.hidden = true;
        api.hideOverlay();
        setUi(`<div class="sm-card sm-pan"><p class="sm-k">Online</p><h3>${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</h3><p class="sm-t">${why === 'host-left' ? 'The host ended the online match.' : why === 'kicked' ? 'The host removed you from the match.' : 'The connection to the host was lost.'}</p><div class="sm-btns"><button class="g-btn" data-b="on">Online lobby</button><button class="g-btn ghost" data-b="menu">Menu</button></div></div>`, 'panel');
        ui.onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; api.sfx('tap'); if (b.dataset.b === 'on') goOnline(); else showMenu(); };
        api.sfx('lose');
      });
    }

    function pausePanel() {
      if (!['count', 'play', 'over'].includes(G.ph)) return;
      if (G.role) {
        setUi('<div class="sm-card sm-pan"><p class="sm-k">Online match</p><h3>Menu</h3><div class="sm-btns"><button class="g-btn" data-b="res">Resume</button><button class="g-btn ghost" data-b="leave">Leave match</button></div></div>', 'panel');
      } else {
        G.paused = true;
        setUi('<div class="sm-card sm-pan"><p class="sm-k">Paused</p><h3>Menu</h3><div class="sm-btns"><button class="g-btn" data-b="res">Resume</button><button class="g-btn ghost" data-b="rs">Restart match</button><button class="g-btn ghost" data-b="leave">Quit to menu</button></div></div>', 'panel');
      }
      ui.onclick = e => {
        const b = e.target.closest('[data-b]'); if (!b) return;
        api.sfx('tap');
        if (b.dataset.b === 'res') { hideUi(); G.paused = false; keys.clear(); }
        else if (b.dataset.b === 'rs') { G.paused = false; startSolo(); }
        else { G.paused = false; leave(); }
      };
    }
    api.on(mb, 'click', pausePanel);

    api.on(window, 'keydown', e => {
      if (e.target && e.target.closest && e.target.closest('input,textarea')) return;
      if (G.ph === 'menu' && e.code === 'Enter' && !ui.hidden) { e.preventDefault(); api.sfx('tap'); if (saved.play === 'online') goOnline(); else startSolo(); return; }
      if (['count', 'play', 'over'].includes(G.ph) && !G.paused && ui.hidden && Object.keys(SM_KM).some(k => SM_KM[k].includes(e.code))) e.preventDefault();
    });
    api.on(cv, 'contextmenu', e => e.preventDefault());

    (function buildTouch() {
      const bar = touchBar(root, {
        l: [],
        r: [{ k: 'a', l: 'A', n: 'Attack' }, { k: 'b', l: 'B', n: 'Special' }, { k: 'j', l: 'JUMP', n: 'Jump', c: 'big' }, { k: 'm', l: 'SMASH', n: 'Smash attack' }, { k: 's', l: 'SHIELD', n: 'Shield' }, { k: 'g', l: 'GRAB', n: 'Grab' }]
      }, th);
      const lg = bar.querySelector('.tb-l');
      const s = document.createElement('div'); s.className = 'tb-stick'; s.innerHTML = '<i></i>';
      lg.prepend(s);
      bumpStick(s, (dx, dy) => { th.sx = dx; th.sy = dy; });
      bar.hidden = true;
      tbEl = bar;
    })();

    api.loop((dt, now) => {
      if (G.role === 'guest') {
        guestFrame(dt, now);
        if (G.ph === 'count' || G.ph === 'play') guestSend(now);
      } else {
        hostFrame(dt);
        hostSend(now);
      }
      render(dt);
      pvDraw();
    });

    root.__sm = { G, saved, snapshot, fxEvent };
    if (api.net.invite) { showMenu(); hideUi(); goOnline(); } else showMenu();
    return { destroy() { aud.close(); } };
  }

  Ameplay.register({
    id: 'smash-fighter',
    title: 'Super Smash Bros.',
    category: 'Action',
    tint: '#ef4444',
    blurb: 'Platform fighter. Rack up damage, launch rivals off the stage, last one with stocks wins.',
    help: '<kbd>A</kbd><kbd>D</kbd> move (tap twice to dash) · <kbd>W</kbd> up · <kbd>S</kbd> crouch · <kbd>Space</kbd> jump · <kbd>J</kbd> attack · <kbd>K</kbd> special · <kbd>L</kbd> smash (hold to charge) · <kbd>I</kbd> grab · <kbd>Shift</kbd> shield (with a direction: roll or dodge) · gamepad: A jump, B special, X attack, Y smash, bumpers shield and grab · touch: stick and buttons · online: 2 to 4 players',
    better: 'high',
    format: v => v + ' pts',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6l5 14 15-2-10 11 9 12-15-3-4 14-4-14-15 3 9-12L12 18l15 2z" fill="currentColor"/></svg>',
    css: `.gm-smash-fighter{gap:0}
.gm-smash-fighter .sm-wrap{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px)) * 1.7778));margin:0 auto;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r);overflow:hidden;background:#0c1022;box-shadow:0 0 0 1px var(--line)}
.gm-smash-fighter .sm-wrap canvas.g-canvas{display:block;width:100%;touch-action:none;margin:0}
.gm-smash-fighter .sm-ui{position:absolute;inset:0;display:flex;padding:10px;overflow:auto;background:rgba(8,10,24,.88);touch-action:pan-y;color:#f1f5f9;font-family:var(--sans)}
.gm-smash-fighter .sm-ui.panel{background:rgba(8,10,24,.84)}
.gm-smash-fighter .sm-ui[hidden],.gm-smash-fighter .sm-mb[hidden],.gm-smash-fighter .tb[hidden]{display:none!important}
.gm-smash-fighter .sm-card{width:100%;max-width:880px;margin:auto;text-align:center}
.gm-smash-fighter .sm-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.gm-smash-fighter .sm-logo{display:flex;align-items:baseline;gap:8px;text-align:left}
.gm-smash-fighter .sm-logo b{font:900 italic clamp(24px,4.6vw,38px)/1 var(--sans);letter-spacing:.04em;color:#fff;text-shadow:3px 3px 0 #ef4444}
.gm-smash-fighter .sm-logo small{font-weight:800;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.gm-smash-fighter .sm-meta{font-weight:800;font-size:12px;color:#94a3b8}
.gm-smash-fighter .sm-main{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:10px;align-items:stretch}
.gm-smash-fighter .sm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;align-content:start}
.gm-smash-fighter .sm-fc{display:flex;flex-direction:column;align-items:center;gap:0;border:2px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(255,255,255,.07);color:#e2e8f0;padding:3px 2px 4px;cursor:pointer;font-family:var(--sans)}
.gm-smash-fighter .sm-fc canvas{width:100%;max-width:64px;aspect-ratio:1;display:block}
.gm-smash-fighter .sm-fc b{font-size:11px;font-weight:900}
.gm-smash-fighter .sm-fc:hover{border-color:rgba(255,255,255,.5)}
.gm-smash-fighter .sm-fc.on{border-color:#fde047;background:rgba(253,224,71,.14)}
.gm-smash-fighter .sm-det{display:flex;gap:8px;align-items:center;text-align:left;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12);border-radius:14px;padding:8px}
.gm-smash-fighter .sm-prev{width:112px;height:100px;flex:0 0 auto;border-radius:10px;background:rgba(255,255,255,.05)}
.gm-smash-fighter .sm-dt{min-width:0}
.gm-smash-fighter .sm-dt h3{margin:0;font:900 20px/1.1 var(--sans);color:#fff}
.gm-smash-fighter .sm-dt h3 em{font:800 11px var(--sans);font-style:normal;color:#fde047;margin-left:4px;text-transform:uppercase;letter-spacing:.06em}
.gm-smash-fighter .sm-dt p{margin:3px 0;font-size:11.5px;font-weight:600;color:#cbd5e1;line-height:1.3}
.gm-smash-fighter .sm-dt p.sm-tip{color:#7dd3fc}
.gm-smash-fighter .sm-bars{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;margin:4px 0}
.gm-smash-fighter .sm-bars div{display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase}
.gm-smash-fighter .sm-bars i{display:inline-flex;gap:2px}
.gm-smash-fighter .sm-bars u{width:9px;height:6px;border-radius:2px;background:rgba(255,255,255,.15)}
.gm-smash-fighter .sm-bars u.on{background:#fde047}
.gm-smash-fighter .sm-opts{display:flex;flex-direction:column;gap:5px;margin-top:8px;align-items:center}
.gm-smash-fighter .sm-row{display:flex;flex-wrap:wrap;gap:5px 6px;align-items:center;justify-content:center}
.gm-smash-fighter .sm-row>span{font-size:10.5px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em}
.gm-smash-fighter .sm-row>span.sm-gap{margin-left:8px}
.gm-smash-fighter .sm-seg{display:inline-flex;background:rgba(255,255,255,.1);border-radius:999px;padding:2px}
.gm-smash-fighter .sm-seg button{border:0;background:none;font:800 12px var(--sans);color:#cbd5e1;padding:5px 10px;border-radius:999px;cursor:pointer;min-height:30px}
.gm-smash-fighter .sm-seg button.on{background:#fff;color:#0f172a}
.gm-smash-fighter .sm-stages{display:flex;gap:6px;overflow-x:auto;padding:8px 2px 6px;scrollbar-width:thin;justify-content:safe center}
.gm-smash-fighter .sm-st{flex:0 0 96px;border:2px solid rgba(255,255,255,.14);border-radius:10px;background:rgba(255,255,255,.06);padding:3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;color:#e2e8f0;font-family:var(--sans)}
.gm-smash-fighter .sm-st.on{border-color:#fde047;box-shadow:0 0 0 2px rgba(253,224,71,.3)}
.gm-smash-fighter .sm-st canvas{width:100%;aspect-ratio:16/9;border-radius:6px;display:block}
.gm-smash-fighter .sm-st em{font:800 10px var(--sans);font-style:normal;white-space:nowrap}
.gm-smash-fighter .sm-rnd{width:100%;aspect-ratio:16/9;border-radius:6px;display:grid;place-items:center;background:linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#f59e0b);font:900 26px var(--sans);color:#fff}
.gm-smash-fighter .sm-help{font-size:11px;font-weight:700;color:#94a3b8;margin:2px 0 6px}
.gm-smash-fighter .sm-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm-smash-fighter .sm-pan h3{font:900 28px/1.1 var(--sans);margin:4px 0 8px;color:#fff}
.gm-smash-fighter .sm-pan{max-width:420px}
.gm-smash-fighter .sm-k{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;margin:0}
.gm-smash-fighter .sm-t{font-weight:700;color:#cbd5e1;margin:0 0 12px}
.gm-smash-fighter .sm-chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:8px 0}
.gm-smash-fighter .sm-chip{display:flex;align-items:center;gap:6px;border:2px solid var(--c);border-radius:12px;background:rgba(255,255,255,.07);padding:3px 8px 3px 4px;text-align:left}
.gm-smash-fighter .sm-chip.me{background:rgba(255,255,255,.16)}
.gm-smash-fighter .sm-chip canvas{width:44px;height:44px;flex:0 0 auto}
.gm-smash-fighter .sm-chip span{display:flex;flex-direction:column;min-width:0;flex:1}
.gm-smash-fighter .sm-chip b{font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-smash-fighter .sm-chip small{font-size:10px;font-weight:700;color:#94a3b8}
.gm-smash-fighter .sm-chip i{font:900 10px var(--sans);font-style:normal;color:#94a3b8}
.gm-smash-fighter .sm-chip.rdy i{color:#4ade80}
.gm-smash-fighter .sm-mb{position:absolute;right:8px;top:8px;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;cursor:pointer}
.gm-smash-fighter .sm-mb:hover{background:rgba(255,255,255,.3)}
.gm-smash-fighter .tb .tb-r{display:grid;grid-template-columns:repeat(3,auto);gap:6px;justify-content:end;align-items:end}
@media (orientation:landscape) and (max-height:520px){.gm-smash-fighter.touch .tb .tb-b{background:rgba(255,255,255,.14);color:#f1f5f9;border-color:rgba(255,255,255,.45);opacity:.85;min-width:50px;height:50px;font-size:12px}.gm-smash-fighter.touch .tb .tb-b.big{min-width:58px;height:58px}.gm-smash-fighter.touch .tb .tb-b.on{background:rgba(255,255,255,.45);color:#0f172a}.gm-smash-fighter.touch .tb .tb-stick{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.4)}.gm-smash-fighter.touch .tb .tb-stick i{background:rgba(255,255,255,.5)}}
@media (max-width:700px){.gm-smash-fighter .sm-ui.menu{position:relative;inset:auto;min-height:0}.gm-smash-fighter .sm-wrap:has(.sm-ui.menu:not([hidden])) canvas.g-canvas{display:none}.gm-smash-fighter .sm-main{grid-template-columns:1fr}.gm-smash-fighter .sm-grid{grid-template-columns:repeat(8,1fr)}.gm-smash-fighter .sm-fc b{display:none}.gm-smash-fighter .sm-ui{padding:5px;background:rgba(8,10,24,.9)}.gm-smash-fighter .sm-logo small,.gm-smash-fighter .sm-help{display:none}.gm-smash-fighter .sm-prev{width:84px;height:76px}.gm-smash-fighter .sm-seg button{padding:3px 7px;min-height:24px;font-size:11px}.gm-smash-fighter .sm-st{flex-basis:70px}.gm-smash-fighter .sm-pan h3{font-size:20px}}
${TOUCH_CSS('smash-fighter')}`,
    mount(root, api) { return smMount(root, api); }
  });

  Ameplay.covers['smash-fighter'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="smc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".6" stop-color="#7c3aed"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><rect width="400" height="300" fill="url(#smc-bg)"/><g fill="#fff" opacity=".25"><circle cx="60" cy="60" r="30"/><circle cx="330" cy="70" r="40"/></g><path d="M200 20l10 36 38-6-26 28 24 30-38-8-8 36-8-36-38 8 24-30-26-28 38 6z" fill="#fde047" opacity=".9"/><path d="M40 232h320l-24 28H64z" fill="#1f2937"/><rect x="40" y="226" width="320" height="10" rx="4" fill="#4ade80"/><g stroke-linecap="round" stroke-linejoin="round"><circle cx="130" cy="170" r="22" fill="#e8472f" stroke="#5b1f13" stroke-width="5"/><path d="M104 226c0-24 12-34 26-34s26 10 26 34z" fill="#e8472f" stroke="#5b1f13" stroke-width="5"/><path d="M152 200l36-14" stroke="#fbbf24" stroke-width="12"/><circle cx="270" cy="172" r="20" fill="#3b82f6" stroke="#16223d" stroke-width="5"/><path d="M246 226c0-24 11-34 24-34s24 10 24 34z" fill="#2f4b8a" stroke="#16223d" stroke-width="5"/><path d="M248 196l-30-6" stroke="#e5e7eb" stroke-width="10"/></g><g fill="#fff"><circle cx="124" cy="166" r="4"/><circle cx="138" cy="166" r="4"/><circle cx="264" cy="168" r="4"/><circle cx="277" cy="168" r="4"/></g><g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M196 176l-12-14M206 184l12-14M200 168v-18"/></g></svg>`;

})();
