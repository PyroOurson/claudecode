(() => {
  'use strict';
  const TAU = Math.PI * 2, PI = Math.PI;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const adiff = (a, b) => { const d = b - a; return d - TAU * Math.round(d / TAU); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const mkRng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pick = (a, r = Math.random) => a[(r() * a.length) | 0];
  const gauss = r => (r() + r() + r() - 1.5) / 1.5;
  const BOTNAMES = ['Slayer', 'NoScope', 'Lucky7', 'Bandit', 'Ghost', 'Rex', 'Maverick', 'Pixel', 'Viper', 'Nova', 'Echo', 'Tango', 'Zed', 'Kilo', 'Falcon', 'Wolfie', 'Hawk', 'Blaze', 'Cobra', 'Frost', 'Gizmo', 'Havoc', 'Ivy', 'Jinx', 'Kira', 'Lynx', 'Mochi', 'Nitro', 'Onyx', 'Panda', 'Quill', 'Raven', 'Sable', 'Taco', 'Umbra', 'Vex', 'Wraith', 'Xeno', 'Yuki', 'Zephyr', 'Bacon', 'Pickle', 'Waffle', 'Turbo', 'Comet', 'Domino', 'Ember', 'Fuzzy', 'Goose', 'Hazel', 'Iron', 'Juno', 'Koala', 'Luna', 'Mango', 'Ninja', 'Otter', 'Pogo', 'Rusty', 'Scout', 'Toast', 'Yeti', 'Zorro', 'Albert', 'Bruno', 'Cleo', 'Dante', 'Eli', 'Finn', 'Gus', 'Hugo', 'Iris', 'Jade', 'Kai', 'Leo', 'Mia', 'Noah', 'Owen', 'Pia', 'Quinn', 'Ruby', 'Sam', 'Theo', 'Uma', 'Vic', 'Will', 'Xan', 'Yara', 'Zoe'];
  const botName = (used, r = Math.random) => { for (let i = 0; i < 40; i++) { const n = pick(BOTNAMES, r) + (r() < .3 ? ((r() * 90) | 0) + 1 : ''); if (!used.has(n)) { used.add(n); return n; } } return 'Bot' + ((r() * 999) | 0); };

  function makeAudio(api) {
    let ac = null, out = null, nb = null;
    const get = () => {
      if (api.muted) return null;
      if (!ac) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          out = ac.createGain(); out.gain.value = .55; out.connect(ac.destination);
          nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nb.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; return null; }
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const noise = (vol, dur, f0, f1, q = 1, type = 'bandpass', delay = 0) => {
      const a = get(); if (!a || vol < .004) return;
      const t = a.currentTime + delay, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nb; s.loop = true; s.playbackRate.value = .8 + Math.random() * .4;
      f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
    };
    const tone = (f0, f1, dur, vol, type = 'sine', delay = 0) => {
      const a = get(); if (!a || vol < .004) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .02);
    };
    return { noise, tone, close() { try { if (ac) ac.close(); } catch (e) {} ac = null; } };
  }

  const baseCss = (id, accent, ink) => `.gm-${id}{gap:0}
.gm-${id} .io-wrap{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;background:#101418;touch-action:none;-webkit-user-select:none;user-select:none;box-shadow:0 10px 30px -14px rgba(10,14,30,.6)}
.gm-${id} .io-wrap .g-canvas{width:100%;border-radius:0;display:block;background:#101418;cursor:crosshair}
.gm-${id} .io-ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:14px;text-align:center;color:#fff;font-family:Arial,Helvetica,sans-serif;transition:opacity .3s;overflow:auto}
.gm-${id} .io-ui[hidden]{display:none}
.gm-${id} .io-ui.io-menu{background:radial-gradient(ellipse at 50% 40%,rgba(8,14,20,.62),rgba(5,8,12,.9))}
.gm-${id} .io-ui.io-panel{background:rgba(6,9,14,.72)}
.gm-${id} .io-logo{font:900 clamp(40px,9vw,76px)/1 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:${accent};text-shadow:0 4px 0 ${ink},0 0 24px rgba(255,255,255,.12)}
.gm-${id} .io-sub{font-size:14px;line-height:1.45;color:#c7d0da;max-width:34em}
.gm-${id} .io-sub b{color:#fff}
.gm-${id} .io-nick{width:min(260px,80%);height:42px;padding:0 16px;border:0;border-radius:8px;background:#fff;color:#16202a;text-align:center;font:700 16px Arial,Helvetica,sans-serif;outline:0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14)}
.gm-${id} .io-nick:focus{box-shadow:inset 0 -3px 0 ${accent}}
.gm-${id} .io-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center}
.gm-${id} .io-btn{min-width:150px;height:44px;padding:0 20px;border:0;border-radius:8px;background:${accent};color:#fff;font:800 16px Arial,Helvetica,sans-serif;letter-spacing:.02em;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25),0 8px 18px -10px rgba(0,0,0,.8);text-shadow:0 1px 0 rgba(0,0,0,.3)}
.gm-${id} .io-btn:hover{filter:brightness(1.1)}
.gm-${id} .io-btn:active{transform:translateY(1px)}
.gm-${id} .io-btn.alt{background:#3a4d63}
.gm-${id} .io-btn.big{height:52px;min-width:210px;font-size:20px}
.gm-${id} .io-btn.sm{height:34px;min-width:0;padding:0 14px;font-size:13px}
.gm-${id} .io-seg{display:inline-flex;border-radius:8px;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14)}
.gm-${id} .io-seg button{border:0;background:rgba(255,255,255,.07);color:#cfd8e2;font:700 13px Arial,Helvetica,sans-serif;padding:8px 12px;cursor:pointer}
.gm-${id} .io-seg button.on{background:${accent};color:#fff}
.gm-${id} .io-lab{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93a1b0;margin-right:4px}
.gm-${id} .io-hint{max-width:36em;font-size:12px;line-height:1.5;color:#8d9aa8}
.gm-${id} .io-hint kbd{font:700 11px Arial,Helvetica,sans-serif;background:rgba(255,255,255,.14);border-radius:4px;padding:1px 5px}
.gm-${id} .io-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(86px,1fr));gap:8px;width:min(440px,100%)}
.gm-${id} .io-stats div{background:rgba(255,255,255,.09);border-radius:8px;padding:8px 6px}
.gm-${id} .io-stats span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9fb0c0}
.gm-${id} .io-stats b{font-size:22px}
.gm-${id} .io-title{font:900 clamp(26px,5vw,44px)/1.05 Arial,Helvetica,sans-serif}
.gm-${id} .io-kick{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${accent};font-weight:800}
.gm-${id} .io-top{position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:2}
.gm-${id} .io-top button{width:34px;height:34px;border:0;border-radius:8px;background:rgba(0,0,0,.4);color:#fff;font:800 15px Arial,Helvetica,sans-serif;cursor:pointer}
.gm-${id} .io-top button:hover{background:rgba(0,0,0,.6)}
.gm-${id} .io-top[hidden]{display:none}`;

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmtTime = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const ptrXY = (c, e, W, H) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  const segHtml = (name, opts, cur) => `<span class="io-seg" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</span>`;
  const bindSeg = (root, onPick) => root.querySelectorAll('.io-seg').forEach(s => s.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); onPick(s.dataset.seg, b.dataset.v); }));
  const strHash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  const AM = { '9mm': ['9mm', '#ffc400'], '762': ['7.62mm', '#2f74ff'], '556': ['5.56mm', '#1fae55'], '12g': ['12 gauge', '#ff3b30'], '50ae': ['.50 AE', '#ff8c1a'], '308': ['.308', '#555b66'], '45': ['.45 ACP', '#a050ff'] };
  const AMK = Object.keys(AM);
  const AMSTACK = { '9mm': 30, '762': 30, '556': 30, '12g': 6, '50ae': 14, '308': 6, '45': 30 };
  const GUNS = [];
  const GI = {};
  const gun = (id, name, cls, am, d, r, rl, mg, sp, rg, sd, o = {}) => {
    const g = Object.assign({ id, name, cls, am, d, r, rl, mg, sp, rg, sd, au: 0, pe: 1, t: 1, col: '#2b2f36', wood: 0, len: 1.9, mv: 1, sh: 0, bolt: 0 }, o);
    GI[id] = GUNS.length; GUNS.push(g);
  };
  gun('m9', 'M9', 'pistol', '9mm', 12, .12, 1.9, 15, 90, 62, 3.5, { len: 1.05, t: 1 });
  gun('m1911', 'M1911', 'pistol', '45', 15, .13, 2.1, 7, 92, 64, 3, { len: 1.1, t: 1, col: '#4a4f58' });
  gun('m93r', 'M93R', 'pistol', '9mm', 11, .3, 2.2, 20, 90, 62, 2.5, { len: 1.15, t: 2, burst: [3, .055] });
  gun('deagle', 'DEagle 50', 'pistol', '50ae', 30, .22, 2.5, 7, 118, 90, 2, { len: 1.3, t: 4, col: '#8b8f98' });
  gun('mac10', 'MAC-10', 'smg', '9mm', 9, .056, 2, 32, 88, 52, 6.5, { au: 1, len: 1.35, t: 1 });
  gun('mp5', 'MP5', 'smg', '9mm', 11, .082, 2.4, 30, 96, 64, 4.5, { au: 1, len: 1.55, t: 2 });
  gun('ump9', 'UMP9', 'smg', '45', 14, .1, 2.6, 30, 100, 70, 3.8, { au: 1, len: 1.6, t: 2 });
  gun('vector', 'Vector', 'smg', '45', 12, .058, 2.7, 35, 98, 62, 5.5, { au: 1, len: 1.45, t: 3 });
  gun('ak47', 'AK-47', 'ar', '762', 18, .1, 2.5, 30, 108, 100, 4.2, { au: 1, len: 2.2, t: 2, wood: 1 });
  gun('m416', 'M416', 'ar', '556', 14, .085, 2.35, 30, 112, 105, 3.2, { au: 1, len: 2.15, t: 3 });
  gun('famas', 'FAMAS', 'ar', '556', 14, .4, 2.4, 25, 112, 104, 2.5, { len: 2, t: 3, burst: [3, .055] });
  gun('scarh', 'SCAR-H', 'ar', '762', 21, .1, 2.6, 20, 112, 110, 2.8, { au: 1, len: 2.25, t: 3, col: '#6b5a3a' });
  gun('bar', 'BAR M1918', 'ar', '762', 25, .12, 3, 20, 116, 118, 3, { au: 1, len: 2.4, t: 3, wood: 1 });
  gun('m39', 'M39 EMR', 'ar', '762', 34, .22, 2.5, 20, 142, 150, 1.2, { len: 2.5, t: 3, wood: 1, mv: .96 });
  gun('dp28', 'DP-28', 'lmg', '762', 16, .1, 5, 47, 106, 100, 5, { au: 1, len: 2.3, t: 3, wood: 1, mv: .94 });
  gun('m249', 'M249', 'lmg', '556', 13, .075, 5.5, 100, 110, 100, 5, { au: 1, len: 2.4, t: 4, mv: .92 });
  gun('mosin', 'Mosin-Nagant', 'sniper', '762', 85, 1.15, 2.8, 5, 190, 230, .4, { len: 2.9, t: 2, wood: 1, bolt: 1, mv: .95 });
  gun('sv98', 'SV-98', 'sniper', '308', 90, 1.25, 3.2, 5, 205, 240, .3, { len: 2.9, t: 3, bolt: 1, mv: .95 });
  gun('awms', 'AWM-S', 'sniper', '308', 132, 1.5, 3.4, 5, 230, 270, .2, { len: 3, t: 4, bolt: 1, mv: .93, col: '#1f3a2a' });
  gun('m870', 'M870', 'shotgun', '12g', 8, .9, .62, 5, 82, 38, 6.5, { pe: 9, sh: 1, len: 2, t: 1, wood: 1 });
  gun('mp220', 'MP220', 'shotgun', '12g', 9, .35, 2.2, 2, 80, 36, 8, { pe: 9, sh: 0, len: 1.7, t: 1, wood: 1 });
  gun('spas12', 'SPAS-12', 'shotgun', '12g', 8, .42, .5, 9, 84, 40, 6, { pe: 9, sh: 1, len: 2.1, t: 3 });
  gun('saiga', 'Saiga-12', 'shotgun', '12g', 7, .25, 2.7, 5, 84, 40, 6.5, { pe: 9, au: 1, len: 2, t: 2 });
  gun('usas', 'USAS-12', 'shotgun', '12g', 6.5, .2, 3.4, 12, 86, 42, 7, { pe: 9, au: 1, len: 2.1, t: 4, mv: .95 });
  const GT = [[], [], [], [], []];
  GUNS.forEach((g, i) => GT[g.t].push(i));
  const CLSCOL = { pistol: '#c0c4cc', smg: '#ffd24a', ar: '#4f8cff', lmg: '#ff8c42', sniper: '#3ec9a7', shotgun: '#ff5a4f' };
  const MELEE = {
    fists: { n: 'Fists', d: 4, r: .3, rg: 2.1, arc: .9, t0: 0 },
    knife: { n: 'Knife', d: 26, r: .26, rg: 2.2, arc: .9, t0: 1 },
    hook: { n: 'Hook', d: 36, r: .45, rg: 2.5, arc: 1, t0: 2 },
    katana: { n: 'Katana', d: 50, r: .5, rg: 2.9, arc: 1.2, t0: 3 }
  };
  const MELEEK = Object.keys(MELEE);
  const HEAL = {
    bandage: { n: 'Bandage', t: 3, hp: 15, max: 75, col: '#f2f2f2' },
    medkit: { n: 'Med Kit', t: 6, hp: 100, max: 100, col: '#4cd964' },
    soda: { n: 'Soda', t: 3, boost: 25, col: '#37a4ff' },
    pills: { n: 'Pills', t: 5, boost: 50, col: '#ff9f1a' }
  };
  const HEALK = Object.keys(HEAL);
  const THROW = { frag: { n: 'Frag Grenade', col: '#4f6b2f' }, smoke: { n: 'Smoke Grenade', col: '#b8c4cc' } };
  const THROWK = Object.keys(THROW);
  const SCOPES = [1, 2, 4, 8, 15];
  const ZW = [36, 44, 58, 80, 118];
  const VEST = [0, .25, .38, .45], HELM = [0, .15, .3, .4];
  const GEARCOL = [null, '#b9bec8', '#79808c', '#3b414c'];
  const PACKCOL = [null, '#7b6a45', '#5b7a45', '#3f5f9a'];
  const CAPS = {
    '9mm': [120, 240, 330, 420], '762': [90, 180, 240, 300], '556': [90, 180, 240, 300], '12g': [15, 30, 60, 90], '50ae': [50, 100, 125, 150], '308': [10, 20, 30, 40], '45': [90, 180, 240, 300],
    bandage: [5, 10, 15, 30], medkit: [1, 2, 3, 4], soda: [2, 5, 10, 15], pills: [1, 2, 3, 4], frag: [2, 3, 4, 5], smoke: [1, 2, 3, 4]
  };
  const ZONE_PH = [
    { r: .34, w: 100, s: 60, d: 1.6 },
    { r: .22, w: 75, s: 50, d: 2.6 },
    { r: .13, w: 60, s: 38, d: 4.2 },
    { r: .07, w: 48, s: 30, d: 6.5 },
    { r: .03, w: 40, s: 24, d: 9.5 },
    { r: 0, w: 25, s: 18, d: 14 }
  ];
  const LT = {
    floor: [[22, 'ammo'], [16, 'heal'], [5, 'gun:1'], [3, 'gun:2'], [3, 'scope:2'], [3, 'vest:1'], [3, 'helm:1'], [2, 'pack:1'], [4, 'throw'], [2, 'melee']],
    house: [[14, 'ammo'], [12, 'heal'], [10, 'gun:1'], [7, 'gun:2'], [2, 'gun:3'], [4, 'scope:2'], [2, 'scope:4'], [5, 'vest:1'], [4, 'helm:1'], [2, 'vest:2'], [3, 'pack:1'], [4, 'throw'], [2, 'melee']],
    crate: [[12, 'ammo'], [10, 'heal'], [8, 'gun:1'], [8, 'gun:2'], [4, 'gun:3'], [4, 'scope:2'], [3, 'scope:4'], [4, 'vest:1'], [3, 'vest:2'], [3, 'helm:1'], [2, 'helm:2'], [2, 'pack:1'], [2, 'pack:2'], [4, 'throw']],
    big: [[8, 'ammo'], [8, 'heal'], [6, 'gun:2'], [10, 'gun:3'], [2, 'gun:4'], [4, 'scope:4'], [3, 'scope:8'], [4, 'vest:2'], [4, 'helm:2'], [2, 'vest:3'], [2, 'helm:3'], [3, 'pack:2'], [1, 'pack:3'], [4, 'throw'], [2, 'melee']],
    drop: [[10, 'gun:4'], [10, 'gun:3'], [6, 'vest:3'], [6, 'helm:3'], [5, 'pack:3'], [5, 'scope:8'], [3, 'scope:15'], [6, 'heal'], [6, 'throw'], [4, 'ammo']]
  };
  const BT = {
    shack: { w: 9, h: 8, roof: '#6e7580', roof2: '#5d646e', floor: '#b79266', doors: 1, lt: 'floor', n: 4, crates: 1 },
    house: { w: 15, h: 12, roof: '#a8483a', roof2: '#923c30', floor: '#b88a5a', doors: 2, lt: 'house', n: 8, crates: 2, part: 1 },
    barn: { w: 22, h: 15, roof: '#8b2f2f', roof2: '#772626', floor: '#a47a4c', doors: 2, lt: 'house', n: 10, crates: 4, part: 0 },
    warehouse: { w: 26, h: 17, roof: '#4e6a8a', roof2: '#42597a', floor: '#8d8f93', doors: 3, lt: 'crate', n: 12, crates: 7, part: 1 },
    mansion: { w: 30, h: 22, roof: '#3d4f3a', roof2: '#33432f', floor: '#c1a06f', doors: 3, lt: 'big', n: 18, crates: 3, part: 2 }
  };
  const SVM = 560;
  const lootPick = (tab, r) => {
    let tot = 0;
    for (const e of tab) tot += e[0];
    let x = r() * tot;
    for (const e of tab) { x -= e[0]; if (x <= 0) return e[1]; }
    return tab[0][1];
  };
  const lootMake = (spec, r) => {
    const [kind, arg] = spec.split(':');
    if (kind === 'gun') { const t = +arg, arr = GT[t].length ? GT[t] : GT[1], gi = arr[(r() * arr.length) | 0]; return [{ k: 'gun', n: GUNS[gi].id, c: 0 }, { k: 'ammo', n: GUNS[gi].am, c: AMSTACK[GUNS[gi].am] }]; }
    if (kind === 'ammo') { const a = AMK[(r() * AMK.length) | 0], w = { '9mm': 3, '762': 3, '556': 3, '12g': 2, '50ae': 1, '308': 1, '45': 2 }; let k = a; if (r() < .6) { const bag = []; AMK.forEach(q => { for (let i = 0; i < w[q]; i++) bag.push(q); }); k = bag[(r() * bag.length) | 0]; } return [{ k: 'ammo', n: k, c: AMSTACK[k] }]; }
    if (kind === 'heal') { const x = r(); const n = x < .45 ? 'bandage' : x < .62 ? 'soda' : x < .85 ? 'pills' : 'medkit'; return [{ k: 'heal', n, c: n === 'bandage' ? 5 : 1 }]; }
    if (kind === 'vest') return [{ k: 'gear', n: 'vest', c: +arg }];
    if (kind === 'helm') return [{ k: 'gear', n: 'helm', c: +arg }];
    if (kind === 'pack') return [{ k: 'gear', n: 'pack', c: +arg }];
    if (kind === 'scope') return [{ k: 'scope', n: 'scope', c: +arg }];
    if (kind === 'throw') return [{ k: 'throw', n: r() < .7 ? 'frag' : 'smoke', c: 2 }];
    if (kind === 'melee') return [{ k: 'melee', n: MELEEK[1 + ((r() * 3) | 0)], c: 0 }];
    return [];
  };

  function svGen(seed) {
    const r = mkRng(seed), rr = (a, b) => a + (b - a) * r();
    const M = SVM, CS = 28, GN = Math.ceil(M / CS) + 1;
    const W = { M, seed, obs: [], bl: [], lakes: [], lootPts: [], CS, GN, cells: Array.from({ length: GN * GN }, () => []), stamp: 1, dyn: new Map(), nextDyn: 100000, blobs: [], bushes: [] };
    const cl = v => clamp((v / CS) | 0, 0, GN - 1);
    const reg = ob => {
      const x0 = ob.k === 'c' ? ob.x - ob.r : ob.x0, x1 = ob.k === 'c' ? ob.x + ob.r : ob.x1, y0 = ob.k === 'c' ? ob.y - ob.r : ob.y0, y1 = ob.k === 'c' ? ob.y + ob.r : ob.y1;
      for (let cy = cl(y0); cy <= cl(y1); cy++) for (let cx = cl(x0); cx <= cl(x1); cx++) W.cells[cy * GN + cx].push(ob);
    };
    W.add = ob => { if (ob.id == null) ob.id = ob.i = W.obs.length; if (ob.dyn) W.dyn.set(ob.id, ob); else W.obs.push(ob); reg(ob); return ob; };
    W.byId = id => id >= 100000 ? W.dyn.get(id) : W.obs[id];
    const base = { solid: true, bl: true, hp: 1e9, dead: false, q: 0 };
    const addC = (t, x, y, rad, o) => W.add(Object.assign({ t, k: 'c', x, y, r: rad }, base, o));
    const addR = (t, x0, y0, x1, y1, o) => W.add(Object.assign({ t, k: 'r', x0, y0, x1, y1 }, base, o));
    W.addC = addC; W.addR = addR;
    W.query = (x0, y0, x1, y1, out) => {
      out.length = 0;
      const st = ++W.stamp;
      for (let cy = cl(y0); cy <= cl(y1); cy++) for (let cx = cl(x0); cx <= cl(x1); cx++) {
        const c = W.cells[cy * GN + cx];
        for (let i = 0; i < c.length; i++) { const o = c[i]; if (o.q !== st && !o.dead) { o.q = st; out.push(o); } }
      }
      return out;
    };
    const tmp = [];
    const nl = 2 + (r() < .55 ? 1 : 0);
    for (let i = 0; i < nl; i++) {
      const cx = rr(110, M - 110), cy = rr(110, M - 110), n = 3 + ((r() * 3) | 0);
      for (let k = 0; k < n; k++) W.lakes.push({ x: cx + rr(-30, 30), y: cy + rr(-24, 24), r: rr(14, 27) });
    }
    W.lakeD = (x, y) => { let m = 1e9; for (const l of W.lakes) { const d = Math.hypot(x - l.x, y - l.y) - l.r; if (d < m) m = d; } return m; };
    W.water = (x, y) => {
      const e = Math.min(x, y, M - x, M - y);
      if (e < 3) return 2;
      if (e < 9) return 1;
      const d = W.lakeD(x, y);
      return d < -3 ? 2 : d < 0 ? 1 : 0;
    };
    W.sandD = (x, y) => Math.min(Math.min(x, y, M - x, M - y) - 22, W.lakeD(x, y) - 5);
    W.free = (x, y, rad) => {
      W.query(x - rad - 3, y - rad - 3, x + rad + 3, y + rad + 3, tmp);
      for (const o of tmp) {
        if (!o.solid) continue;
        if (o.k === 'c') { if (Math.hypot(o.x - x, o.y - y) < o.r + rad) return false; }
        else { const cx = clamp(x, o.x0, o.x1), cy = clamp(y, o.y0, o.y1); if (Math.hypot(cx - x, cy - y) < rad) return false; }
      }
      return true;
    };
    const bldNear = (x, y, m) => { for (const b of W.bl) if (x > b.x0 - m && x < b.x1 + m && y > b.y0 - m && y < b.y1 + m) return b; return null; };
    W.bldAt = (x, y) => { for (const b of W.bl) if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return b; return null; };
    const T = 1.1;
    const hWall = (b, y, xa, xb, gaps) => {
      let x = xa;
      const gs = gaps.slice().sort((p, q) => p[0] - q[0]);
      for (const g of gs) { if (g[0] > x) addR('wall', x, y - T / 2, g[0], y + T / 2, { b: b.n }); x = g[1]; }
      if (xb > x) addR('wall', x, y - T / 2, xb, y + T / 2, { b: b.n });
    };
    const vWall = (b, x, ya, yb, gaps) => {
      let y = ya;
      const gs = gaps.slice().sort((p, q) => p[0] - q[0]);
      for (const g of gs) { if (g[0] > y) addR('wall', x - T / 2, y, x + T / 2, g[0], { b: b.n }); y = g[1]; }
      if (yb > y) addR('wall', x - T / 2, y, x + T / 2, yb, { b: b.n });
    };
    const mkBuilding = (type, cx, cy) => {
      const d = BT[type], w = d.w, h = d.h;
      const b = { n: W.bl.length, type, cx, cy, w, h, x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2, roof: d.roof, roof2: d.roof2, floor: d.floor };
      W.bl.push(b);
      const sides = [0, 1, 2, 3];
      for (let i = sides.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [sides[i], sides[j]] = [sides[j], sides[i]]; }
      const gp = [[], [], [], []];
      const dw = type === 'barn' || type === 'warehouse' ? 5 : 3.4;
      for (let i = 0; i < d.doors; i++) {
        const s = sides[i], len = s < 2 ? w : h, c0 = rr(4 + dw / 2, len - 4 - dw / 2);
        gp[s].push([c0 - dw / 2, c0 + dw / 2]);
      }
      b.doors = [];
      for (let s = 0; s < 4; s++) gp[s].forEach(g => b.doors.push(s < 2 ? { x: b.x0 + (g[0] + g[1]) / 2, y: s === 0 ? b.y0 : b.y1 } : { x: s === 2 ? b.x0 : b.x1, y: b.y0 + (g[0] + g[1]) / 2 }));
      hWall(b, b.y0, b.x0 - T / 2, b.x1 + T / 2, gp[0].map(g => [b.x0 + g[0], b.x0 + g[1]]));
      hWall(b, b.y1, b.x0 - T / 2, b.x1 + T / 2, gp[1].map(g => [b.x0 + g[0], b.x0 + g[1]]));
      vWall(b, b.x0, b.y0 + T / 2, b.y1 - T / 2, gp[2].map(g => [b.y0 + g[0], b.y0 + g[1]]));
      vWall(b, b.x1, b.y0 + T / 2, b.y1 - T / 2, gp[3].map(g => [b.y0 + g[0], b.y0 + g[1]]));
      if (d.part) {
        const px = cx + rr(-w * .12, w * .12), g0 = rr(b.y0 + 3, b.y1 - 6);
        vWall(b, px, b.y0 + T / 2, b.y1 - T / 2, [[g0, g0 + 3.2]]);
        b.px = px; b.pg = g0 + 1.6;
        if (d.part > 1) {
          const hy = cy + rr(-3, 3), gx = rr(b.x0 + 3, px - 6);
          hWall(b, hy, b.x0 + T / 2, px - T / 2, [[gx, gx + 3.2]]);
          const hy2 = cy + rr(-3, 3), gx2 = rr(px + 3, b.x1 - 6);
          hWall(b, hy2, px + T / 2, b.x1 - T / 2, [[gx2, gx2 + 3.2]]);
        }
      }
      let placed = 0;
      for (let t = 0; t < 60 && placed < d.n; t++) {
        const x = rr(b.x0 + 2.2, b.x1 - 2.2), y = rr(b.y0 + 2.2, b.y1 - 2.2);
        if (!W.free(x, y, 1.1)) continue;
        W.lootPts.push({ x, y, tab: d.lt });
        placed++;
      }
      placed = 0;
      for (let t = 0; t < 80 && placed < d.crates; t++) {
        const x = rr(b.x0 + 2.4, b.x1 - 2.4), y = rr(b.y0 + 2.4, b.y1 - 2.4);
        if (!W.free(x, y, 2.3)) continue;
        addR('crate', x - 1.15, y - 1.15, x + 1.15, y + 1.15, { hp: 70, mhp: 70, lt: d.lt === 'floor' ? 'crate' : d.lt === 'big' ? 'big' : 'crate', b: b.n });
        placed++;
      }
      return b;
    };
    const plan = ['mansion', 'mansion', 'warehouse', 'warehouse', 'warehouse', 'barn', 'barn', 'barn', 'house', 'house', 'house', 'house', 'house', 'house', 'house', 'house', 'house', 'shack', 'shack', 'shack', 'shack', 'shack', 'shack', 'shack', 'shack'];
    for (const type of plan) {
      const d = BT[type];
      for (let t = 0; t < 400; t++) {
        const x = rr(40, M - 40), y = rr(40, M - 40);
        if (bldNear(x, y, Math.max(d.w, d.h) / 2 + 22)) continue;
        if (W.lakeD(x, y) < Math.max(d.w, d.h) * .8 + 6) continue;
        mkBuilding(type, x, y);
        break;
      }
    }
    const away = (x, y, m) => !bldNear(x, y, m) && W.lakeD(x, y) > 2 && Math.min(x, y, M - x, M - y) > 14;
    const forests = [];
    for (let i = 0; i < 12; i++) forests.push({ x: rr(30, M - 30), y: rr(30, M - 30), s: rr(18, 44) });
    for (let i = 0, n = 0; i < 2600 && n < 230; i++) {
      const f = pick(forests, r), x = r() < .75 ? f.x + gauss(r) * f.s : rr(15, M - 15), y = r() < .75 ? f.y + gauss(r) * f.s : rr(15, M - 15);
      if (x < 12 || y < 12 || x > M - 12 || y > M - 12 || !away(x, y, 4) || !W.free(x, y, 2.6)) continue;
      addC('tree', x, y, 1.15, { s: rr(.85, 1.2), rot: r() * TAU, v: (r() * 3) | 0 }); n++;
    }
    for (let i = 0, n = 0; i < 1600 && n < 70; i++) {
      const x = rr(15, M - 15), y = rr(15, M - 15), rad = rr(1.6, 4.2);
      if (!away(x, y, rad + 3) || !W.free(x, y, rad + 1.2)) continue;
      const pts = [], k = 8 + ((r() * 3) | 0);
      for (let j = 0; j < k; j++) pts.push(rr(.82, 1.12));
      addC('rock', x, y, rad, { pts, rot: r() * TAU }); n++;
    }
    for (let i = 0, n = 0; i < 1600 && n < 120; i++) {
      const f = pick(forests, r), x = r() < .6 ? f.x + gauss(r) * f.s * 1.2 : rr(15, M - 15), y = r() < .6 ? f.y + gauss(r) * f.s * 1.2 : rr(15, M - 15);
      if (!away(x, y, 3) || !W.free(x, y, 1.6)) continue;
      W.bushes.push(addC('bush', x, y, 2.5, { solid: false, bl: false, rot: r() * TAU })); n++;
    }
    for (let i = 0, n = 0; i < 900 && n < 55; i++) {
      const x = rr(15, M - 15), y = rr(15, M - 15);
      if (!away(x, y, 4) || !W.free(x, y, 2)) continue;
      addR('crate', x - 1.15, y - 1.15, x + 1.15, y + 1.15, { hp: 70, mhp: 70, lt: 'crate' }); n++;
    }
    for (let i = 0, n = 0; i < 900 && n < 50; i++) {
      const x = rr(15, M - 15), y = rr(15, M - 15);
      if (!away(x, y, 3) || !W.free(x, y, 1.8)) continue;
      addC('barrel', x, y, 1.15, { hp: 60, mhp: 60, ex: n % 4 === 0 }); n++;
    }
    for (let i = 0, n = 0; i < 2500 && n < 200; i++) {
      const x = rr(16, M - 16), y = rr(16, M - 16);
      if (W.lakeD(x, y) < 1 || bldNear(x, y, 1) || !W.free(x, y, .8)) continue;
      W.lootPts.push({ x, y, tab: 'floor' }); n++;
    }
    for (let i = 0; i < 40; i++) W.blobs.push({ x: r() * M, y: r() * M, r: rr(24, 70), a: rr(.03, .07), c: r() < .5 ? 0 : 1 });
    W.hitT = 1; W.hitO = null;
    W.ray = (x0, y0, x1, y1, ignoreFn) => {
      const dx = x1 - x0, dy = y1 - y0;
      W.query(Math.min(x0, x1) - 3, Math.min(y0, y1) - 3, Math.max(x0, x1) + 3, Math.max(y0, y1) + 3, tmp);
      let bt = 2, bo = null;
      for (const o of tmp) {
        if (!o.bl || (ignoreFn && ignoreFn(o))) continue;
        let t = 2;
        if (o.k === 'c') {
          const fx = x0 - o.x, fy = y0 - o.y, a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - o.r * o.r;
          if (c <= 0) t = 0;
          else if (a > 1e-9) { const disc = b * b - 4 * a * c; if (disc >= 0) { const tt = (-b - Math.sqrt(disc)) / (2 * a); if (tt >= 0 && tt <= 1) t = tt; } }
        } else {
          let tn = 0, tf = 1, ok = true;
          if (Math.abs(dx) < 1e-9) { if (x0 < o.x0 || x0 > o.x1) ok = false; }
          else { let a = (o.x0 - x0) / dx, b = (o.x1 - x0) / dx; if (a > b) { const q = a; a = b; b = q; } tn = Math.max(tn, a); tf = Math.min(tf, b); }
          if (ok) {
            if (Math.abs(dy) < 1e-9) { if (y0 < o.y0 || y0 > o.y1) ok = false; }
            else { let a = (o.y0 - y0) / dy, b = (o.y1 - y0) / dy; if (a > b) { const q = a; a = b; b = q; } tn = Math.max(tn, a); tf = Math.min(tf, b); }
          }
          if (ok && tn <= tf) t = tn;
        }
        if (t < bt) { bt = t; bo = o; }
      }
      W.hitT = bt; W.hitO = bo;
      return bo !== null;
    };
    W.push = (p, rad) => {
      for (let it = 0; it < 3; it++) {
        W.query(p.x - rad - .2, p.y - rad - .2, p.x + rad + .2, p.y + rad + .2, tmp);
        let moved = false;
        for (const o of tmp) {
          if (!o.solid) continue;
          if (o.k === 'c') {
            const dx = p.x - o.x, dy = p.y - o.y, rs = o.r + rad, d2 = dx * dx + dy * dy;
            if (d2 < rs * rs) { const d = Math.sqrt(d2) || .001; p.x += dx / d * (rs - d); p.y += dy / d * (rs - d); moved = true; }
          } else {
            const cx = clamp(p.x, o.x0, o.x1), cy = clamp(p.y, o.y0, o.y1), dx = p.x - cx, dy = p.y - cy, d2 = dx * dx + dy * dy;
            if (d2 < rad * rad) {
              if (d2 < 1e-8) {
                const l = p.x - o.x0, rt = o.x1 - p.x, tp = p.y - o.y0, bt = o.y1 - p.y, m = Math.min(l, rt, tp, bt);
                if (m === l) p.x = o.x0 - rad; else if (m === rt) p.x = o.x1 + rad; else if (m === tp) p.y = o.y0 - rad; else p.y = o.y1 + rad;
              } else { const d = Math.sqrt(d2); p.x += dx / d * (rad - d); p.y += dy / d * (rad - d); }
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
      p.x = clamp(p.x, .8, M - .8); p.y = clamp(p.y, .8, M - .8);
    };
    W.blocked = (x, y, rad) => {
      W.query(x - rad, y - rad, x + rad, y + rad, tmp);
      for (const o of tmp) {
        if (!o.solid) continue;
        if (o.k === 'c') { if (Math.hypot(o.x - x, o.y - y) < o.r + rad) return true; }
        else if (Math.hypot(clamp(x, o.x0, o.x1) - x, clamp(y, o.y0, o.y1) - y) < rad) return true;
      }
      return false;
    };
    W.bushAt = (x, y) => {
      W.query(x - 2.6, y - 2.6, x + 2.6, y + 2.6, tmp);
      for (const o of tmp) if (o.t === 'bush' && Math.hypot(o.x - x, o.y - y) < o.r - .3) return o;
      return null;
    };
    W.crates = (x, y, rad, out) => { W.query(x - rad, y - rad, x + rad, y + rad, tmp); out.length = 0; for (const o of tmp) if (o.hp < 1e8) out.push(o); return out; };
    return W;
  }
  const svMove = (W, p, vx, vy, dt, ok) => {
    p.x += vx * dt; p.y += vy * dt;
    W.push(p, ok === undefined ? .95 : ok);
  };

  const DT = 1 / 30;
  function SvSim(seed, cfg) {
    const r = mkRng(seed ^ 0x9e3779b9);
    const W = cfg.W || svGen(seed);
    const S = { W, seed, t: 0, P: [], bul: [], loot: [], gren: [], smk: [], drops: [], ev: [], lid: 1, bid: 1, phase: 'plane', alive: 0, winner: -1, n: cfg.n, skill: cfg.skill == null ? 1 : cfg.skill, zt: 0, dropQ: [], aid: 1, shots: [] };
    const M = W.M;
    const pa = r() * TAU, off = (r() - .5) * 160;
    const px = Math.cos(pa), py = Math.sin(pa);
    S.plane = { x0: M / 2 - px * M * .62 - py * off, y0: M / 2 - py * M * .62 + px * off, x1: M / 2 + px * M * .62 - py * off, y1: M / 2 + py * M * .62 + px * off, dur: 17, a: Math.atan2(py, px) };
    const zr0 = M * .74;
    S.z = { cx: M / 2, cy: M / 2, r: zr0, nx: 0, ny: 0, nr: 0, ph: 0, st: 'wait', t: ZONE_PH[0].w, ox: M / 2, oy: M / 2, or: zr0, dmg: ZONE_PH[0].d };
    const nextCircle = () => {
      const z = S.z, ph = ZONE_PH[z.ph], nr = ph.r * M, mr = Math.max(0, z.r - nr);
      const a = r() * TAU, d = Math.sqrt(r()) * mr * .8;
      z.nx = clamp(z.cx + Math.cos(a) * d, nr, M - nr); z.ny = clamp(z.cy + Math.sin(a) * d, nr, M - nr); z.nr = nr;
      z.dmg = ph.d;
    };
    nextCircle();
    const ev = e => S.ev.push(e);
    S.emit = ev;
    const newPlayer = (id, name, bot, pid) => ({
      id, name, bot, pid: pid || null, sk: .4 + r() * .6, x: M / 2, y: M / 2, px: M / 2, py: M / 2, vx: 0, vy: 0, a: 0, hp: 100, boost: 0, vest: 0, helm: 0, pack: 0,
      am: { '9mm': 0, '762': 0, '556': 0, '12g': 0, '50ae': 0, '308': 0, '45': 0 }, hl: { bandage: 0, medkit: 0, soda: 0, pills: 0 }, th: { frag: 0, smoke: 0 },
      scs: [1], sc: 0, sl: [null, null, 'fists', null], cur: 2, last: 2, fT: 0, rld: null, act: null, fHeld: 0, burst: 0, bT: 0, swT: 0, swHit: 0,
      alive: true, para: 1, pt: 0, pdx: 0, pdy: 0, kills: 0, dmg: 0, place: 0, diedAt: 0, by: -1, w: '', hit: -9, hm: -9, fl: 0, spec: -1, jump: 0, inB: 0,
      in: { mx: 0, my: 0, f: 0, a: 0, ad: 20 }, br: null, pendF: 0
    });
    S.newPlayer = newPlayer;
    const used = new Set();
    cfg.humans.forEach((h, i) => { const p = newPlayer(i, h.name, false, h.pid); S.P.push(p); used.add(h.name); });
    while (S.P.length < cfg.n) { const p = newPlayer(S.P.length, botName(used, r), true); p.sk = clamp((S.skill === 0 ? .25 : S.skill === 1 ? .5 : .8) + (r() - .5) * .35, .1, 1); S.P.push(p); }
    S.alive = S.P.length;
    S.P.forEach(p => { p.pt = 0; if (p.bot) p.br = botBrain(p, r); p.jump = p.bot ? .1 + r() * .82 : 1.01; });
    const setLoot = (k, n, c, x, y) => { const l = { id: S.lid++, k, n, c, x, y }; S.loot.push(l); return l; };
    S.setLoot = setLoot;
    const scatter = (items, x, y, spread) => {
      for (const it of items) {
        const a = r() * TAU, d = spread * Math.sqrt(r());
        let lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d;
        if (W.blocked(lx, ly, .3)) { lx = x; ly = y; }
        setLoot(it.k, it.n, it.c, clamp(lx, 1, M - 1), clamp(ly, 1, M - 1));
      }
    };
    S.scatter = scatter;
    const rollTab = (tab, rr) => lootMake(lootPick(LT[tab], rr), rr);
    if (!cfg.skipLoot) for (const lp of W.lootPts) scatter(rollTab(lp.tab, r), lp.x, lp.y, 1.2);

    const gcur = p => { const s = p.sl[p.cur]; return p.cur < 2 && s ? GUNS[s.g] : null; };
    S.gcur = gcur;
    const capOf = (p, key) => CAPS[key][p.pack];
    const gunScore = g => g.t * 10 + ({ ar: 5, smg: 3, shotgun: 4, sniper: 3, lmg: 4, pistol: 0 })[g.cls] + g.d * (1 / g.r) / 14;
    S.gunScore = gunScore;
    const dropItem = (p, k, n, c) => { if (c <= 0 && k !== 'gun' && k !== 'melee') return; const a = r() * TAU, d = 1.4 + r() * .8; setLoot(k, n, c, clamp(p.x + Math.cos(a) * d, 1, M - 1), clamp(p.y + Math.sin(a) * d, 1, M - 1)); };
    const switchTo = (p, i) => {
      if (i < 0 || i > 3 || p.cur === i) return false;
      if (i < 2 && !p.sl[i]) return false;
      if (i === 3 && !(p.sl[3] && p.th[p.sl[3]] > 0)) { const k = THROWK.find(q => p.th[q] > 0); if (!k) return false; p.sl[3] = k; }
      p.last = p.cur; p.cur = i; p.rld = null; p.burst = 0; p.fT = Math.max(p.fT, S.t + .25);
      return true;
    };
    S.switchTo = switchTo;
    const startReload = p => {
      const g = gcur(p); if (!g) return false;
      const s = p.sl[p.cur];
      if (s.mag >= g.mg || p.am[g.am] <= 0 || p.rld || p.act) return false;
      p.rld = { t: g.sh ? g.rl : g.rl, tot: g.rl, sh: g.sh };
      return true;
    };
    S.startReload = startReload;
    const useItem = (p, k) => {
      const h = HEAL[k];
      if (!h || p.hl[k] <= 0 || p.act) return false;
      if (k === 'bandage' && p.hp >= h.max) return false;
      if (k === 'medkit' && p.hp >= 100) return false;
      if ((k === 'soda' || k === 'pills') && p.boost >= 100) return false;
      p.rld = null; p.burst = 0;
      p.act = { k, t: h.t, tot: h.t };
      return true;
    };
    S.useItem = useItem;
    const tryPickup = (p, l, manual) => {
      if (l.k === 'ammo') {
        const cap = capOf(p, l.n), room = cap - p.am[l.n];
        if (room <= 0) return false;
        const t = Math.min(room, l.c); p.am[l.n] += t; l.c -= t; return l.c <= 0 ? true : 'part';
      }
      if (l.k === 'heal') {
        const room = capOf(p, l.n) - p.hl[l.n];
        if (room <= 0) return false;
        const t = Math.min(room, l.c); p.hl[l.n] += t; l.c -= t; return l.c <= 0 ? true : 'part';
      }
      if (l.k === 'throw') {
        const room = capOf(p, l.n) - p.th[l.n];
        if (room <= 0) return false;
        const t = Math.min(room, l.c); p.th[l.n] += t; l.c -= t;
        if (!p.sl[3] || p.th[p.sl[3]] <= 0) p.sl[3] = l.n;
        return l.c <= 0 ? true : 'part';
      }
      if (l.k === 'scope') {
        const idx = SCOPES.indexOf(l.c);
        if (p.scs.includes(l.c)) return false;
        p.scs.push(l.c); p.scs.sort((a, b) => a - b);
        p.sc = Math.max(p.sc, idx);
        return true;
      }
      if (l.k === 'gear') {
        const key = l.n;
        if (p[key] >= l.c) return false;
        if (p[key] > 0) dropItem(p, 'gear', key, p[key]);
        p[key] = l.c;
        return true;
      }
      if (l.k === 'gun') {
        const gi = GI[l.n];
        let slot = p.sl[0] ? p.sl[1] ? -1 : 1 : 0;
        if (slot < 0) {
          if (!manual) return false;
          slot = p.cur < 2 ? p.cur : 0;
          const old = p.sl[slot];
          if (old) { dropItem(p, 'gun', GUNS[old.g].id, 0); if (old.mag) { p.am[GUNS[old.g].am] = Math.min(capOf(p, GUNS[old.g].am), p.am[GUNS[old.g].am] + old.mag); } }
        }
        p.sl[slot] = { g: gi, mag: 0 };
        const g = GUNS[gi];
        const take = Math.min(g.mg, p.am[g.am]);
        p.sl[slot].mag = take; p.am[g.am] -= take;
        if (p.cur >= 2 || !p.sl[p.cur] || slot === p.cur || gunScore(GUNS[p.sl[p.cur].g]) < gunScore(g)) { p.cur = slot; p.rld = null; p.fT = Math.max(p.fT, S.t + .3); }
        return true;
      }
      if (l.k === 'melee') {
        if (p.sl[2] === l.n) return false;
        if (!manual && MELEE[p.sl[2]].t0 >= MELEE[l.n].t0) return false;
        if (p.sl[2] !== 'fists') dropItem(p, 'melee', p.sl[2], 0);
        p.sl[2] = l.n;
        return true;
      }
      return false;
    };
    S.tryPickup = tryPickup;
    S.pickAuto = p => {
      for (let i = S.loot.length - 1; i >= 0; i--) {
        const l = S.loot[i];
        if (Math.abs(l.x - p.x) > 1.7 || Math.abs(l.y - p.y) > 1.7 || Math.hypot(l.x - p.x, l.y - p.y) > 1.7) continue;
        const res = tryPickup(p, l, false);
        if (res === true) { S.loot.splice(i, 1); p.pk = S.t; } else if (res === 'part') p.pk = S.t;
      }
    };
    S.pickManual = p => {
      let best = -1, bd = 3.1 * 3.1, bp = -1;
      for (let i = 0; i < S.loot.length; i++) {
        const l = S.loot[i], d = (l.x - p.x) ** 2 + (l.y - p.y) ** 2;
        if (d > bd) continue;
        const pr = l.k === 'gun' || l.k === 'melee' ? 2 : 1;
        if (pr > bp || (pr === bp && d < bd)) { best = i; bd = d; bp = pr; }
      }
      if (best < 0) return false;
      const l = S.loot[best], res = tryPickup(p, l, true);
      if (res === true) { S.loot.splice(best, 1); p.pk = S.t; return true; }
      if (res === 'part') { p.pk = S.t; return true; }
      return false;
    };
    const hurt = (p, dmg, by, w, ign) => {
      if (!p.alive || p.para || S.phase === 'over') return 0;
      if (!ign) dmg *= (1 - VEST[p.vest]) * (1 - HELM[p.helm]);
      p.hp -= dmg; p.hit = S.t;
      if (by >= 0 && by !== p.id) { const k = S.P[by]; k.dmg += dmg; k.hm = S.t; p.lastBy = by; p.lastW = w; }
      if (p.hp <= 0) die(p, ign && by < 0 ? -1 : by, w);
      return dmg;
    };
    S.hurt = hurt;
    const die = (p, by, w) => {
      if (!p.alive) return;
      p.alive = false; p.hp = 0; p.diedAt = S.t; S.alive--; p.place = S.alive + 1; p.act = null; p.rld = null;
      if (by < 0 && p.lastBy != null && p.lastBy >= 0 && S.t - p.hit < 6) { by = p.lastBy; }
      p.by = by; p.w = w || '';
      if (by >= 0 && by !== p.id) S.P[by].kills++;
      for (let i = 0; i < 2; i++) { const s = p.sl[i]; if (s) { dropItem(p, 'gun', GUNS[s.g].id, 0); p.am[GUNS[s.g].am] += s.mag; } }
      if (p.sl[2] !== 'fists') dropItem(p, 'melee', p.sl[2], 0);
      for (const k of AMK) if (p.am[k] > 0) { let n = p.am[k]; while (n > 0) { const c = Math.min(n, AMSTACK[k] * 2); dropItem(p, 'ammo', k, c); n -= c; } }
      for (const k of HEALK) if (p.hl[k] > 0) dropItem(p, 'heal', k, p.hl[k]);
      for (const k of THROWK) if (p.th[k] > 0) dropItem(p, 'throw', k, p.th[k]);
      if (p.vest) dropItem(p, 'gear', 'vest', p.vest);
      if (p.helm) dropItem(p, 'gear', 'helm', p.helm);
      if (p.pack) dropItem(p, 'gear', 'pack', p.pack);
      for (const sc of p.scs) if (sc > 1) dropItem(p, 'scope', 'scope', sc);
      ev({ k: 'kill', v: p.id, b: by, w: w || '', x: p.x, y: p.y, pl: S.alive });
      const sp = S.P.filter(q => q.alive);
      if (S.alive <= 1 && S.phase !== 'over') {
        S.phase = 'over'; S.winner = sp.length ? sp[0].id : by;
        const wp = S.P[S.winner]; if (wp && wp.alive) wp.place = 1;
        ev({ k: 'win', id: S.winner });
      }
    };
    const damageObs = (o, d, by) => {
      if (o.hp > 1e8 || o.dead) return;
      o.hp -= d;
      if (o.hp > 0) { ev({ k: 'ohit', i: o.id, x: o.cx != null ? o.cx : (o.k === 'c' ? o.x : (o.x0 + o.x1) / 2), y: o.k === 'c' ? o.y : (o.y0 + o.y1) / 2 }); return; }
      o.dead = true;
      const cx = o.k === 'c' ? o.x : (o.x0 + o.x1) / 2, cy = o.k === 'c' ? o.y : (o.y0 + o.y1) / 2;
      ev({ k: 'brk', i: o.id, x: cx, y: cy });
      if (o.t === 'crate') { const n = 2 + (r() < .5 ? 1 : 0); for (let i = 0; i < n; i++) scatter(rollTab(o.lt || 'crate', r), cx, cy, 1.8); }
      else if (o.t === 'drop') { for (let i = 0; i < 5; i++) scatter(rollTab('drop', r), cx, cy, 2.6); }
      else if (o.t === 'barrel' && o.ex) explode(cx, cy, 9, 85, by, 'Barrel');
    };
    const explode = (x, y, R, dmg, by, w) => {
      ev({ k: 'ex', x, y, R });
      for (const q of S.P) {
        if (!q.alive || q.para) continue;
        const d = Math.hypot(q.x - x, q.y - y);
        if (d > R + .9) continue;
        W.ray(x, y, q.x, q.y, o => o.t !== 'wall');
        if (W.hitO && d > 1.5) continue;
        hurt(q, dmg * (1 - clamp(d / R, 0, 1) * .75), by, w);
      }
      const list = [];
      W.crates(x, y, R + 2, list);
      for (const o of list) {
        const cx = o.k === 'c' ? o.x : (o.x0 + o.x1) / 2, cy = o.k === 'c' ? o.y : (o.y0 + o.y1) / 2;
        if (Math.hypot(cx - x, cy - y) < R) damageObs(o, dmg * 1.5, by);
      }
      for (let i = S.loot.length - 1; i >= 0; i--) { const l = S.loot[i]; if (Math.hypot(l.x - x, l.y - y) < R * .5 && l.k !== 'gun' && r() < .3) S.loot.splice(i, 1); }
    };
    S.explode = explode;
    const fireBullets = (p, g) => {
      const ang = p.a, len = g.len + .6;
      const ox = p.x + Math.cos(ang) * len * .55, oy = p.y + Math.sin(ang) * len * .55;
      W.ray(p.x, p.y, ox, oy);
      const bx = W.hitO ? p.x + Math.cos(ang) * 1.1 : ox, by = W.hitO ? p.y + Math.sin(ang) * 1.1 : oy;
      const sd = g.sd * (p.boost > 0 ? .9 : 1) * (1 + Math.min(.6, p.heat || 0)) * Math.PI / 180;
      for (let i = 0; i < g.pe; i++) {
        const a = ang + gauss(r) * sd * (g.pe > 1 ? 1.4 : 1) + (g.pe > 1 ? (i / (g.pe - 1) - .5) * .12 : 0);
        const sp = g.sp * (g.pe > 1 ? .85 + r() * .25 : 1);
        S.bul.push({ id: S.bid++, x: bx, y: by, px: bx, py: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, d: g.d, o: p.id, g: GI[g.id], life: g.rg, f: i === 0 ? 1 : 0, w: g.name });
      }
      ev({ k: 'sh', x: p.x, y: p.y, g: GI[g.id], id: p.id });
      S.shots.push({ x: p.x, y: p.y, id: p.id, t: S.t });
      p.fl = .07;
      p.heat = Math.min(.9, (p.heat || 0) + .05);
    };
    const gunFire = p => {
      const g = gcur(p), s = p.sl[p.cur];
      if (!g || !s || p.act) return false;
      if (S.t < p.fT) return false;
      if (s.mag <= 0) { if (!p.rld) startReload(p); return false; }
      if (p.rld) { if (g.sh && s.mag > 0) p.rld = null; else return false; }
      s.mag--;
      fireBullets(p, g);
      p.fT = S.t + g.r;
      if (g.burst && !p.burst) { p.burst = g.burst[0] - 1; p.bT = S.t + g.burst[1]; p.fT = S.t + g.burst[1] * g.burst[0] + g.r; }
      if (s.mag <= 0 && p.am[g.am] > 0) startReload(p);
      return true;
    };
    const meleeSwing = p => {
      const m = MELEE[p.sl[2]];
      if (S.t < p.fT || p.act) return;
      p.fT = S.t + m.r; p.swT = .22; p.swHit = S.t + .08; p.swM = m;
    };
    const meleeHit = p => {
      const m = p.swM || MELEE.fists;
      let hit = false;
      for (const q of S.P) {
        if (q === p || !q.alive || q.para) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        if (d > m.rg + .9) continue;
        if (Math.abs(adiff(p.a, Math.atan2(dy, dx))) > m.arc) continue;
        W.ray(p.x, p.y, q.x, q.y);
        if (W.hitO) continue;
        hurt(q, m.d, p.id, m.n); hit = true;
      }
      const list = [];
      W.crates(p.x + Math.cos(p.a) * m.rg * .7, p.y + Math.sin(p.a) * m.rg * .7, m.rg, list);
      for (const o of list) damageObs(o, m.d * .6, p.id);
      ev({ k: 'sw', x: p.x, y: p.y, h: hit ? 1 : 0 });
    };
    const throwGren = (p, k, tx, ty) => {
      if (p.th[k] <= 0) return false;
      p.th[k]--;
      if (p.th[k] <= 0) { const nk = THROWK.find(q => p.th[q] > 0); p.sl[3] = nk || null; if (!nk && p.cur === 3) { p.cur = p.last === 3 ? 2 : p.last; } }
      const dx = tx - p.x, dy = ty - p.y, d = Math.min(Math.hypot(dx, dy), 36), a = Math.atan2(dy, dx), sp = 26;
      S.gren.push({ id: S.aid++, k, x: p.x + Math.cos(a), y: p.y + Math.sin(a), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, run: d / sp, fuse: k === 'frag' ? 3.4 : 1.1, o: p.id, z: 0 });
      p.fT = S.t + .5;
      ev({ k: 'th', x: p.x, y: p.y });
      return true;
    };
    S.throwGren = throwGren;
    const doJump = p => {
      if (p.para !== 1) return;
      const pl = S.plane, f = clamp(S.t / pl.dur, 0, 1);
      p.x = lerp(pl.x0, pl.x1, f); p.y = lerp(pl.y0, pl.y1, f);
      p.x = clamp(p.x, 6, M - 6); p.y = clamp(p.y, 6, M - 6);
      p.para = 2; p.pt = 3.4; p.px = p.x; p.py = p.y;
      if (p.bot) pickDest(p);
    };
    S.doJump = doJump;
    const pickDest = p => {
      const B = p.br, r2 = r;
      let best = null, bd = 1e9;
      for (const b of W.bl) {
        if (r2() < .4) continue;
        const d = Math.hypot(b.cx - p.x, b.cy - p.y) + r2() * 40 + (b.cl || 0) * 45;
        if (d < bd && d < 110) { bd = d; best = b; }
      }
      if (best && r2() < .85) { best.cl = (best.cl || 0) + 1; B.dx = best.cx + (r2() - .5) * 6; B.dy = best.cy + (r2() - .5) * 6; }
      else { const a = r2() * TAU, d = 20 + r2() * 50; B.dx = clamp(p.x + Math.cos(a) * d, 8, M - 8); B.dy = clamp(p.y + Math.sin(a) * d, 8, M - 8); }
    };
    const updatePlayer = (p, dt) => {
      p.px = p.x; p.py = p.y;
      if (!p.alive) return;
      const I = p.in;
      if (p.para === 1) {
        const pl = S.plane, f = S.t / pl.dur;
        p.x = lerp(pl.x0, pl.x1, clamp(f, 0, 1)); p.y = lerp(pl.y0, pl.y1, clamp(f, 0, 1));
        if (p.bot ? (f >= p.jump) : (f >= 1 || I.jump)) doJump(p);
        return;
      }
      if (p.para === 2) {
        let dx = I.mx, dy = I.my, sp = 18;
        if (p.bot) { const B = p.br, ddx = B.dx - p.x, ddy = B.dy - p.y, d = Math.hypot(ddx, ddy) || 1; dx = ddx / d; dy = ddy / d; sp = d > 2 ? 26 : 0; }
        p.x = clamp(p.x + dx * sp * dt, 2, M - 2); p.y = clamp(p.y + dy * sp * dt, 2, M - 2);
        p.pt -= dt;
        if (p.pt <= 0) { p.para = 0; W.push(p, .95); p.vx = p.vy = 0; ev({ k: 'land', x: p.x, y: p.y, id: p.id }); }
        return;
      }
      const g = gcur(p);
      const mag = Math.hypot(I.mx, I.my) || 0;
      let sf = g ? g.mv : 1;
      if (p.act) sf *= .7;
      if (p.boost > 0) sf *= 1.08;
      const wt = W.water(p.x, p.y);
      if (wt === 2) sf *= .55; else if (wt === 1) sf *= .82;
      if (p.cur === 2) sf *= 1.04;
      p.sf = sf;
      const tvx = mag > 0 ? I.mx / Math.max(1, mag) * 12 * sf : 0, tvy = mag > 0 ? I.my / Math.max(1, mag) * 12 * sf : 0;
      const k = Math.min(1, dt * 16);
      p.vx += (tvx - p.vx) * k; p.vy += (tvy - p.vy) * k;
      svMove(W, p, p.vx, p.vy, dt);
      p.a = I.a;
      if (p.heat) p.heat = Math.max(0, p.heat - dt * .9);
      if (p.fl > 0) p.fl -= dt;
      if (p.swT > 0) p.swT -= dt;
      if (p.swHit && S.t >= p.swHit) { p.swHit = 0; meleeHit(p); }
      if (p.act) {
        if (I.f && p.cur !== 3 || I.cancel) p.act = null;
        else {
          p.act.t -= dt;
          if (p.act.t <= 0) {
            const h = HEAL[p.act.k]; p.hl[p.act.k]--;
            if (h.hp) p.hp = Math.min(h.max, Math.max(p.hp, p.hp + h.hp));
            if (h.boost) p.boost = Math.min(100, p.boost + h.boost);
            p.act = null; ev({ k: 'heal', x: p.x, y: p.y, id: p.id });
          }
        }
      }
      if (p.rld) {
        const gg = gcur(p), s = p.sl[p.cur];
        if (!gg) p.rld = null;
        else {
          p.rld.t -= dt;
          if (p.rld.t <= 0) {
            if (gg.sh) {
              if (p.am[gg.am] > 0 && s.mag < gg.mg) { s.mag++; p.am[gg.am]--; }
              if (s.mag < gg.mg && p.am[gg.am] > 0) p.rld.t = gg.rl; else p.rld = null;
            } else {
              const take = Math.min(gg.mg - s.mag, p.am[gg.am]);
              s.mag += take; p.am[gg.am] -= take; p.rld = null;
            }
            ev({ k: 'rl', x: p.x, y: p.y, id: p.id });
          }
        }
      }
      if (p.boost > 0) {
        p.boost = Math.max(0, p.boost - dt * 1.1);
        if (p.hp < 100) p.hp = Math.min(100, p.hp + (.9 + 2.3 * p.boost / 100) * dt);
      }
      if (p.burst > 0 && S.t >= p.bT) {
        const gg = gcur(p), s = p.sl[p.cur];
        if (gg && s && s.mag > 0 && !p.rld) { s.mag--; fireBullets(p, gg); p.burst--; p.bT = S.t + gg.burst[1]; } else p.burst = 0;
      }
      if (I.f) {
        if (p.cur < 2) {
          const gg = gcur(p);
          if (gg && (gg.au || !p.fHeld)) gunFire(p);
        } else if (p.cur === 2) { meleeSwing(p); }
        else if (p.cur === 3 && !p.fHeld && p.sl[3] && S.t >= p.fT) {
          const ad = clamp(I.ad, 3, 36);
          throwGren(p, p.sl[3], p.x + Math.cos(p.a) * ad, p.y + Math.sin(p.a) * ad);
        }
        if (p.act && p.cur !== 3) p.act = null;
      }
      p.fHeld = I.f ? 1 : 0;
      p.inB = W.bushAt(p.x, p.y) ? 1 : 0;
    };
    S.act = (p, a) => {
      if (!p.alive || p.para) { if (a.k === 'jump' && p.para === 1) p.in.jump = 1; return; }
      if (a.k === 'rl') startReload(p);
      else if (a.k === 'sw') { if (switchTo(p, a.i)) p.act = null; }
      else if (a.k === 'last') { if (switchTo(p, p.last)) p.act = null; }
      else if (a.k === 'cyc') {
        const order = [0, 1, 2, 3];
        let i = p.cur;
        for (let n = 0; n < 4; n++) { i = (i + (a.d || 1) + 4) % 4; if (i === p.cur) break; if (switchTo(p, i)) { p.act = null; break; } }
      }
      else if (a.k === 'use') useItem(p, a.n);
      else if (a.k === 'pick') S.pickManual(p);
      else if (a.k === 'scope') { if (a.i >= 0 && a.i < SCOPES.length && p.scs.includes(SCOPES[a.i])) p.sc = a.i; }
      else if (a.k === 'scyc') { const i = p.scs.indexOf(SCOPES[p.sc]); p.sc = SCOPES.indexOf(p.scs[(i + (a.d || 1) + p.scs.length) % p.scs.length]); }
      else if (a.k === 'drop') {
        if (a.t === 'gun' && p.sl[a.i]) { const s = p.sl[a.i]; dropItem(p, 'gun', GUNS[s.g].id, 0); p.am[GUNS[s.g].am] += s.mag; p.sl[a.i] = null; if (p.cur === a.i) p.cur = 2; }
      }
      else if (a.k === 'cancel') p.act = null;
    };
    const updateBullets = dt => {
      const B = S.bul;
      for (let i = B.length - 1; i >= 0; i--) {
        const b = B[i];
        b.px = b.x; b.py = b.y;
        const dx = b.vx * dt, dy = b.vy * dt, nx = b.x + dx, ny = b.y + dy;
        let bt = 2, hp = null;
        for (const q of S.P) {
          if (!q.alive || q.para || q.id === b.o) continue;
          if (Math.abs(q.x - b.x) > 6 + Math.abs(dx) && Math.abs(q.x - nx) > 6) continue;
          const ex = q.x - b.x, ey = q.y - b.y, L2 = dx * dx + dy * dy;
          let t = (ex * dx + ey * dy) / L2; t = clamp(t, 0, 1);
          const cx = b.x + dx * t - q.x, cy = b.y + dy * t - q.y;
          if (cx * cx + cy * cy < 1.02 && t < bt) { bt = t; hp = q; }
        }
        let t = 2;
        if (W.ray(b.x, b.y, nx, ny)) t = W.hitT;
        if (hp && bt <= t) {
          const dmg = hurt(hp, b.d, b.o, b.w);
          ev({ k: 'hit', v: hp.id, b: b.o, x: b.x + dx * bt, y: b.y + dy * bt, d: Math.round(dmg) });
          B.splice(i, 1); continue;
        }
        if (t <= 1) {
          const o = W.hitO;
          if (o.hp < 1e8) damageObs(o, b.d, b.o);
          ev({ k: 'imp', x: b.x + dx * t, y: b.y + dy * t, t: o.t });
          B.splice(i, 1); continue;
        }
        b.x = nx; b.y = ny; b.life -= Math.hypot(dx, dy);
        if (b.life <= 0 || nx < -5 || ny < -5 || nx > M + 5 || ny > M + 5) B.splice(i, 1);
      }
    };
    const updateGren = dt => {
      for (let i = S.gren.length - 1; i >= 0; i--) {
        const g = S.gren[i];
        g.fuse -= dt;
        if (g.run > 0) {
          g.run -= dt;
          const nx = g.x + g.vx * dt, ny = g.y + g.vy * dt;
          if (W.ray(g.x, g.y, nx, ny, o => o.t === 'bush')) { const d = Math.hypot(g.vx, g.vy); g.x += g.vx * dt * (W.hitT - .08); g.y += g.vy * dt * (W.hitT - .08); g.run = 0; g.vx = g.vy = 0; }
          else { g.x = nx; g.y = ny; }
          g.vx *= .985; g.vy *= .985;
        } else { g.vx = g.vy = 0; }
        g.x = clamp(g.x, 1, M - 1); g.y = clamp(g.y, 1, M - 1);
        if (g.fuse <= 0) {
          if (g.k === 'frag') explode(g.x, g.y, 9.5, 110, g.o, 'Frag Grenade');
          else { S.smk.push({ id: S.aid++, x: g.x, y: g.y, t: 20, r: 7.5 }); ev({ k: 'smk', x: g.x, y: g.y }); }
          S.gren.splice(i, 1);
        }
      }
      for (let i = S.smk.length - 1; i >= 0; i--) { S.smk[i].t -= dt; if (S.smk[i].t <= 0) S.smk.splice(i, 1); }
    };
    const updateZone = dt => {
      const z = S.z;
      if (z.st === 'wait') {
        z.t -= dt;
        if (z.t <= 0) { z.st = 'shrink'; z.t = ZONE_PH[z.ph].s; z.ox = z.cx; z.oy = z.cy; z.or = z.r; ev({ k: 'zone', m: 'The zone is closing!', ph: z.ph }); }
      } else {
        z.t -= dt;
        const f = clamp(1 - z.t / ZONE_PH[z.ph].s, 0, 1);
        z.cx = lerp(z.ox, z.nx, f); z.cy = lerp(z.oy, z.ny, f); z.r = lerp(z.or, z.nr, f);
        if (z.t <= 0) {
          z.cx = z.nx; z.cy = z.ny; z.r = z.nr;
          if (z.ph < ZONE_PH.length - 1) { z.ph++; z.st = 'wait'; z.t = ZONE_PH[z.ph].w; nextCircle(); ev({ k: 'zone', m: 'New safe zone marked on the map.', ph: z.ph }); S.dropQ.push(S.t + 6); }
          else { z.st = 'done'; z.t = 1e9; }
        }
      }
      S.zt += dt;
      if (S.zt >= 1) {
        S.zt -= 1;
        const zd = ZONE_PH[z.ph].d;
        for (const p of S.P) {
          if (!p.alive || p.para) continue;
          if (Math.hypot(p.x - z.cx, p.y - z.cy) > z.r && zd > 0) { hurt(p, zd, -1, 'The Red Zone', true); ev({ k: 'zhit', v: p.id }); }
        }
      }
      while (S.dropQ.length && S.t >= S.dropQ[0]) {
        S.dropQ.shift();
        const a = r() * TAU, d = Math.sqrt(r()) * Math.max(8, z.nr * .8);
        const x = clamp(z.nx + Math.cos(a) * d, 12, M - 12), y = clamp(z.ny + Math.sin(a) * d, 12, M - 12);
        const dir = r() * TAU;
        S.drops.push({ id: S.aid++, x, y, t0: S.t, fall: 9, px0: x - Math.cos(dir) * 260, py0: y - Math.sin(dir) * 260, px1: x + Math.cos(dir) * 260, py1: y + Math.sin(dir) * 260, landed: false });
        ev({ k: 'dropann', x, y });
      }
      for (let i = S.drops.length - 1; i >= 0; i--) {
        const d = S.drops[i];
        if (!d.landed && S.t - d.t0 >= d.fall + 4) {
          d.landed = true;
          const id = W.nextDyn++;
          const ob = W.add({ id, i: id, dyn: true, t: 'drop', k: 'c', x: d.x, y: d.y, r: 1.7, solid: true, bl: true, hp: 260, mhp: 260, dead: false, q: 0, lt: 'drop' });
          d.ob = id;
          ev({ k: 'drop', id, x: d.x, y: d.y });
        }
        if (d.landed && W.byId(d.ob) && W.byId(d.ob).dead) S.drops.splice(i, 1);
      }
    };
    S.step = dt => {
      S.t += dt;
      if (S.phase === 'plane' && S.t > S.plane.dur + 3.6) S.phase = 'play';
      for (const p of S.P) if (p.bot && p.alive) botTick(S, p, dt, r);
      for (const p of S.P) updatePlayer(p, dt);
      if (S.phase !== 'over' || S.t - (S.overT || (S.overT = S.t)) < 2) { updateBullets(dt); updateGren(dt); updateZone(dt); }
      S.tk = (S.tk || 0) + 1;
      while (S.shots.length && S.t - S.shots[0].t > 1.5) S.shots.shift();
      for (const p of S.P) if (p.alive && !p.para && (!p.bot || S.tk % 3 === p.id % 3)) S.pickAuto(p);
    };
    S.dump = () => ({
      t: S.t, phase: S.phase, z: S.z, plane: S.plane, lid: S.lid, aid: S.aid, bid: S.bid, zt: S.zt, dropQ: S.dropQ, drops: S.drops, loot: S.loot, smk: S.smk, winner: S.winner,
      brk: W.obs.filter(o => o.dead).map(o => o.id), dyn: Array.from(W.dyn.values()).map(o => ({ id: o.id, x: o.x, y: o.y, hp: o.hp, dead: o.dead })),
      hps: W.obs.filter(o => o.hp < 1e8 && !o.dead && o.hp < o.mhp).map(o => [o.id, o.hp]),
      P: S.P.map(p => ({ id: p.id, name: p.name, bot: p.bot, sk: p.sk, x: p.x, y: p.y, a: p.a, hp: p.hp, boost: p.boost, vest: p.vest, helm: p.helm, pack: p.pack, am: p.am, hl: p.hl, th: p.th, scs: p.scs, sc: p.sc, sl: p.sl, cur: p.cur, alive: p.alive, para: p.para, kills: p.kills, dmg: p.dmg, place: p.place, by: p.by, w: p.w, diedAt: p.diedAt, jump: p.jump })),
      alive: S.alive
    });
    S.restore = d => {
      S.t = d.t; S.phase = d.phase === 'over' ? 'play' : d.phase; S.z = d.z; S.plane = d.plane; S.lid = d.lid; S.aid = d.aid; S.bid = d.bid; S.zt = d.zt; S.dropQ = d.dropQ; S.drops = d.drops; S.loot = d.loot; S.smk = d.smk; S.alive = d.alive;
      for (const id of d.brk) { const o = W.obs[id]; if (o) o.dead = true; }
      for (const [id, hp] of d.hps) if (W.obs[id]) W.obs[id].hp = hp;
      for (const o of d.dyn) { const ob = W.add({ id: o.id, i: o.id, dyn: true, t: 'drop', k: 'c', x: o.x, y: o.y, r: 1.7, solid: true, bl: true, hp: o.hp, mhp: 260, dead: o.dead, q: 0, lt: 'drop' }); W.nextDyn = Math.max(W.nextDyn, o.id + 1); }
      for (const q of d.P) {
        const p = S.P[q.id]; if (!p) continue;
        Object.assign(p, q); p.px = p.x; p.py = p.y; p.vx = p.vy = 0; p.rld = null; p.act = null; p.fT = S.t;
        if (p.bot && !p.br) p.br = botBrain(p, r);
        if (p.para === 1 && S.phase !== 'plane') p.para = 0;
      }
    };
    return S;
  }

  const botBrain = (p, r) => ({ mode: 'loot', tt: r() * .3, tx: p.x, ty: p.y, foe: -1, seenAt: -9, fx: 0, fy: 0, strafe: 1, strT: 0, stuck: 0, lx: p.x, ly: p.y, avoid: 0, avT: 0, visited: new Set(), lootId: -1, lootT: 0, bad: new Set(), heard: null, hearT: 0, err: 0, errT: 0, swapT: 0, burstT: 0, fireOn: 1, dx: p.x, dy: p.y, crate: null, zpt: null, zph: -1, throwT: 4, sa: 0, saT: 0, idle: 0, huntT: 0, agg: r() * r(), t0: 0 });
  const IDEAL = { pistol: 13, smg: 12, ar: 25, lmg: 28, sniper: 58, shotgun: 6 };
  const canSee = (S, p, q, V) => {
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d > V) return false;
    if (q.inB && d > 9) return false;
    for (const s of S.smk) {
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      if (Math.hypot(s.x - q.x, s.y - q.y) < s.r || Math.hypot(s.x - mx, s.y - my) < s.r || Math.hypot(s.x - p.x, s.y - p.y) < s.r) return false;
    }
    S.W.ray(p.x, p.y, q.x, q.y);
    return !S.W.hitO;
  };
  const wantScore = (S, p, l) => {
    if (l.k === 'gun') {
      const g = GUNS[GI[l.n]];
      if (!p.sl[0] || !p.sl[1]) return 60 + S.gunScore(g);
      const worst = Math.min(S.gunScore(GUNS[p.sl[0].g]), S.gunScore(GUNS[p.sl[1].g]));
      return S.gunScore(g) > worst + 6 ? 30 + S.gunScore(g) - worst : 0;
    }
    if (l.k === 'ammo') {
      const room = CAPS[l.n][p.pack] - p.am[l.n];
      if (room <= 0) return 0;
      const mine = p.sl.slice(0, 2).some(s => s && GUNS[s.g].am === l.n);
      return mine ? 22 + Math.min(room, l.c) / 3 : room > CAPS[l.n][p.pack] * .6 ? 3 : 0;
    }
    if (l.k === 'heal') { const room = CAPS[l.n][p.pack] - p.hl[l.n]; return room > 0 ? ({ bandage: 12, medkit: 18, soda: 9, pills: 14 })[l.n] * (p.hl[l.n] < 2 ? 1.3 : .7) : 0; }
    if (l.k === 'throw') return p.th[l.n] < CAPS[l.n][p.pack] ? 7 : 0;
    if (l.k === 'gear') return l.c > p[l.n] ? 20 + l.c * 7 : 0;
    if (l.k === 'scope') return p.scs.includes(l.c) ? 0 : 6 + l.c / 2;
    if (l.k === 'melee') return p.sl[2] === 'fists' ? 4 : 0;
    return 0;
  };
  const doorWp = (S, p, tx, ty) => {
    const W = S.W, tb = W.bldAt(tx, ty), pb = W.bldAt(p.x, p.y);
    if (tb && tb !== pb) {
      let best = null, bd = 1e9;
      for (const d of tb.doors) { const q = Math.hypot(d.x - p.x, d.y - p.y); if (q < bd) { bd = q; best = d; } }
      if (best && bd > 3.2) { const ox = best.x - tb.cx, oy = best.y - tb.cy, ol = Math.hypot(ox, oy) || 1; return [best.x + ox / ol * 2.6, best.y + oy / ol * 2.6]; }
      if (best && bd > 1.2) return [best.x, best.y];
    } else if (pb && pb !== tb) {
      let best = null, bd = 1e9;
      for (const d of pb.doors) { const q = Math.hypot(d.x - p.x, d.y - p.y) + Math.hypot(d.x - tx, d.y - ty) * .3; if (q < bd) { bd = q; best = d; } }
      if (best && Math.hypot(best.x - p.x, best.y - p.y) > 1.4) return [best.x, best.y];
      if (best) { const ox = best.x - pb.cx, oy = best.y - pb.cy, ol = Math.hypot(ox, oy) || 1; return [best.x + ox / ol * 3.2, best.y + oy / ol * 3.2]; }
    } else if (pb && pb === tb && pb.px != null && (p.x - pb.px) * (tx - pb.px) < 0) {
      const d = Math.hypot(pb.px - p.x, pb.pg - p.y);
      if (d > 1.5 && Math.abs(p.x - pb.px) > 1.2) return [pb.px, pb.pg];
      if (d > 1.2) return [pb.px, pb.pg];
      return [pb.px + Math.sign(tx - pb.px) * 2.5, pb.pg];
    }
    return [tx, ty];
  };
  const steer = (S, p, B, tx, ty, dt, nav) => {
    const I = p.in, W = S.W;
    let wx = tx, wy = ty;
    if (nav) [wx, wy] = doorWp(S, p, tx, ty);
    const dx = wx - p.x, dy = wy - p.y, d = Math.hypot(dx, dy);
    if (d < .6) { I.mx = I.my = 0; return Math.hypot(tx - p.x, ty - p.y); }
    let a = Math.atan2(dy, dx);
    if (B.avT > 0) { a += B.avoid; B.avT -= dt; }
    B.saT -= dt;
    if (B.saT <= 0) {
      B.saT = .1;
      let best = 0;
      const cs = [0, .5, -.5, 1, -1, 1.5, -1.5, 2.3];
      for (const o of cs) {
        const aa = a + o;
        if (!W.blocked(p.x + Math.cos(aa) * 2.6, p.y + Math.sin(aa) * 2.6, .85) && !W.blocked(p.x + Math.cos(aa) * 1.3, p.y + Math.sin(aa) * 1.3, .85)) { best = o; break; }
      }
      B.sa = best;
    }
    a += B.sa;
    I.mx = Math.cos(a); I.my = Math.sin(a);
    return Math.hypot(tx - p.x, ty - p.y);
  };
  const zonePoint = (S, p, B) => {
    const z = S.z, W = S.W;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * Math.max(3, z.nr * .55);
      const x = clamp(z.nx + Math.cos(a) * d, 4, W.M - 4), y = clamp(z.ny + Math.sin(a) * d, 4, W.M - 4);
      if (!W.blocked(x, y, 1.2) && W.water(x, y) < 2) return [x, y];
    }
    return [z.nx, z.ny];
  };
  const bestSlot = (S, p, dist) => {
    let best = -1, bs = -1e9;
    for (let i = 0; i < 3; i++) {
      let sc;
      if (i < 2) {
        const s = p.sl[i]; if (!s) continue;
        const g = GUNS[s.g];
        if (s.mag <= 0 && p.am[g.am] <= 0) continue;
        sc = S.gunScore(g) - Math.abs(dist - IDEAL[g.cls]) * .55 + (s.mag > 0 ? 6 : -8);
      } else sc = dist < 2.6 ? 8 : -30;
      if (sc > bs) { bs = sc; best = i; }
    }
    return best;
  };
  const botThink = (S, p, B, rnd) => {
    const W = S.W, z = S.z, I = p.in;
    const V = 44 + SCOPES[p.sc] * 1.5;
    let foe = null, fd = 1e9;
    for (const q of S.P) {
      if (q === p || !q.alive || q.para) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < fd && canSee(S, p, q, V)) { fd = d; foe = q; }
    }
    if (foe) { B.foe = foe.id; B.seenAt = S.t; B.fx = foe.x; B.fy = foe.y; B.fvx = foe.vx; B.fvy = foe.vy; B.fd = fd; }
    else if (S.t - B.seenAt > 4) B.foe = -1;
    const outZ = Math.hypot(p.x - z.cx, p.y - z.cy) > z.r - 3;
    const outN = Math.hypot(p.x - z.nx, p.y - z.ny) > z.nr - 5;
    const hurryN = outN && (z.st === 'shrink' || z.t < 30 + Math.hypot(p.x - z.nx, p.y - z.ny) / 9);
    if (B.zph !== z.ph) { B.zph = z.ph; B.zpt = null; }
    const urgent = (outZ && z.st === 'shrink') || (outZ && z.ph > 0) || hurryN;
    const lowHp = p.hp < 38;
    const haveHeal = (p.hl.medkit + p.hl.bandage > 0) || (p.hl.pills + p.hl.soda > 0 && p.boost < 50);
    const gunOk = s => s && (s.mag > 0 || p.am[GUNS[s.g].am] > 0);
    const armed = gunOk(p.sl[0]) || gunOk(p.sl[1]);
    if (!B.t0) { B.t0 = S.t; B.cal = 30 + rnd() * 150; }
    const calm = S.t - B.t0 < B.cal && S.t - p.hit > 5;
    const engage = foe && !calm && (armed ? fd < 8 + 15 * B.agg || (B.mode === 'fight' && fd < 40) : fd < 6 || (!foe.sl[0] && !foe.sl[1] && fd < 12));
    if (engage && (fd < 26 || !urgent || (outZ && fd < 14))) {
      if (lowHp && haveHeal && fd > 14 && rnd() < .6) B.mode = 'flee'; else B.mode = 'fight';
    } else if (urgent) {
      B.mode = 'zone';
      if (!B.zpt) B.zpt = zonePoint(S, p, B);
      B.tx = B.zpt[0]; B.ty = B.zpt[1];
      if (B.foe >= 0 && S.t - B.seenAt < 1.5 && fd < 40 && !calm) B.mode = 'fight';
    } else if (armed && B.foe >= 0 && S.t - B.seenAt < 4 && p.hp > 45) {
      B.mode = 'hunt'; B.tx = B.fx; B.ty = B.fy;
    } else {
      if (B.mode === 'fight' || B.mode === 'flee' || B.mode === 'hunt' || B.mode === 'zone') B.mode = 'loot';
      if (p.hp < 72 && S.t - B.seenAt > 2 && (p.hl.medkit + p.hl.bandage > 0)) B.mode = 'heal';
      else if (p.boost < 35 && p.hp < 95 && S.t - B.seenAt > 2 && (p.hl.pills + p.hl.soda > 0)) B.mode = 'heal';
      else if (B.mode === 'heal') B.mode = 'loot';
      if (B.mode !== 'heal') {
        let heard = null, hd = 1e9;
        for (const sh of S.shots) {
          if (sh.id === p.id) continue;
          const d = Math.hypot(sh.x - p.x, sh.y - p.y);
          if (d < 75 && d > 8 && d < hd) { hd = d; heard = sh; }
        }
        if (heard && B.mode !== 'hunt' && S.t > B.hearT && p.sk > .45 && p.hp > 55 && B.agg > .45 && rnd() < .012) { B.mode = 'hunt'; B.tx = heard.x; B.ty = heard.y; B.huntT = S.t + 7; }
        else if (B.mode === 'hunt' && !(S.t < B.huntT && Math.hypot(B.tx - p.x, B.ty - p.y) > 6)) { B.mode = 'loot'; B.hearT = S.t + 8; }
      }
    }
    if (B.mode === 'loot') {
      let best = null, bv = 0;
      const lim = z.st === 'shrink' || z.t < 40 ? z.nr * 1.0 : 1e9;
      for (const l of S.loot) {
        const d = Math.hypot(l.x - p.x, l.y - p.y);
        if (d > 70 || B.bad.has(l.id)) continue;
        if (lim < 1e8 && Math.hypot(l.x - z.nx, l.y - z.ny) > lim) continue;
        const w = wantScore(S, p, l);
        if (w <= 0) continue;
        const v = w / (d + 8);
        if (v > bv) { bv = v; best = l; }
      }
      if (best) {
        if (B.lootId !== best.id) { B.lootId = best.id; B.lootT = 0; }
        B.tx = best.x; B.ty = best.y; B.crate = null;
      } else {
        B.lootId = -1;
        if (!B.crate || B.crate.dead) {
          B.crate = null;
          const list = [];
          W.crates(p.x, p.y, 16, list);
          let cb = null, cd = 1e9;
          for (const o of list) { const cx = o.k === 'c' ? o.x : (o.x0 + o.x1) / 2, cy = o.k === 'c' ? o.y : (o.y0 + o.y1) / 2, d = Math.hypot(cx - p.x, cy - p.y); if (d < cd && (o.t === 'crate' || o.t === 'drop')) { cd = d; cb = o; } }
          if (cb && !B.bad.has('c' + cb.id)) B.crate = cb;
        }
        if (B.crate) {
          const o = B.crate, cx = o.k === 'c' ? o.x : (o.x0 + o.x1) / 2, cy = o.k === 'c' ? o.y : (o.y0 + o.y1) / 2;
          B.tx = cx; B.ty = cy; B.mode = 'crate';
        } else {
          let bb = null, bdist = 1e9;
          for (const b of W.bl) {
            if (B.visited.has(b.n)) continue;
            if (lim < 1e8 && Math.hypot(b.cx - z.nx, b.cy - z.ny) > lim) continue;
            const d = Math.hypot(b.cx - p.x, b.cy - p.y) - (b.type === 'mansion' ? 30 : 0) + rnd() * 25;
            if (d < bdist) { bdist = d; bb = b; }
          }
          if (bb) { B.tx = bb.cx; B.ty = bb.cy; B.bld = bb; }
          else if (Math.hypot(B.tx - p.x, B.ty - p.y) < 3 || S.t % 11 < .2) { const a = rnd() * TAU, d = 25 + rnd() * 40; B.tx = clamp(z.nx + Math.cos(a) * Math.min(d, z.nr), 6, W.M - 6); B.ty = clamp(z.ny + Math.sin(a) * Math.min(d, z.nr), 6, W.M - 6); }
        }
      }
    }
    if (B.mode === 'heal' && !p.act) {
      if (p.hp < 45 && p.hl.medkit > 0) S.useItem(p, 'medkit');
      else if (p.hp < 72 && p.hl.bandage > 0) S.useItem(p, 'bandage');
      else if (p.boost < 35 && p.hl.pills > 0) S.useItem(p, 'pills');
      else if (p.boost < 50 && p.hl.soda > 0) S.useItem(p, 'soda');
      else if (p.hl.medkit > 0 && p.hp < 70) S.useItem(p, 'medkit');
      else B.mode = 'loot';
    }
    if (B.mode === 'flee' && !p.act && S.t - B.seenAt > .8) {
      if (p.hp < 45 && p.hl.medkit > 0) S.useItem(p, 'medkit');
      else if (p.hl.bandage > 0) S.useItem(p, 'bandage');
      else if (p.hl.pills > 0) S.useItem(p, 'pills');
    }
    if (B.mode === 'fight' && foe) {
      B.throwT -= .22;
      if (p.th.frag > 0 && B.throwT <= 0 && fd > 11 && fd < 30 && rnd() < .5 && S.t > 25) {
        S.throwGren(p, 'frag', foe.x + foe.vx * .6, foe.y + foe.vy * .6); B.throwT = 8 + rnd() * 6;
      } else if (p.th.smoke > 0 && B.throwT <= 0 && p.hp < 50 && fd > 8 && rnd() < .3) { S.throwGren(p, 'smoke', p.x + (foe.x - p.x) * .3, p.y + (foe.y - p.y) * .3); B.throwT = 10; }
    }
  };
  function botTick(S, p, dt, rnd) {
    const B = p.br, I = p.in, W = S.W;
    if (p.para) return;
    if (S.phase === 'plane' && S.t < S.plane.dur) { I.mx = I.my = 0; I.f = 0; return; }
    B.tt -= dt;
    if (B.tt <= 0) { B.tt = .16 + rnd() * .1; botThink(S, p, B, rnd); }
    I.f = 0;
    const mv0 = Math.hypot(p.x - B.lx, p.y - B.ly);
    B.lx = p.x; B.ly = p.y;
    const foe = B.foe >= 0 ? S.P[B.foe] : null;
    const seen = foe && foe.alive && S.t - B.seenAt < .45;
    const wantMove = B.mode !== 'heal' && !(B.mode === 'fight' && seen && B.fd < 40 && rnd() < 0);
    let mode = B.mode;
    if (mode === 'fight' && foe && foe.alive) {
      const q = foe;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      const bs = bestSlot(S, p, d);
      if (bs >= 0 && bs !== p.cur && S.t > B.swapT) { S.switchTo(p, bs); B.swapT = S.t + 1.2; }
      const g = S.gcur(p);
      const ideal = g ? IDEAL[g.cls] : 1.6;
      const sp = g ? g.sp : 40;
      const tl = d / sp * (.5 + p.sk * .6);
      let ax = q.x + (q.vx || 0) * tl, ay = q.y + (q.vy || 0) * tl;
      B.errT -= dt;
      if (B.errT <= 0) { B.errT = .25 + rnd() * .3; B.err = (rnd() - .5) * (1.15 - p.sk) * (.06 + d * .0035); }
      const want = Math.atan2(ay - p.y, ax - p.x) + B.err;
      const turn = (5 + 9 * p.sk) * dt;
      I.a = I.a + clamp(adiff(I.a, want), -turn, turn);
      B.strT -= dt;
      if (B.strT <= 0) { B.strT = .5 + rnd() * 1.4; B.strafe = rnd() < .5 ? 1 : -1; }
      const toX = (q.x - p.x) / (d || 1), toY = (q.y - p.y) / (d || 1);
      let mx = 0, my = 0;
      const melee = p.cur === 2;
      if (!seen && S.t - B.seenAt > .45) { steer(S, p, B, B.fx, B.fy, dt, true); mx = I.mx; my = I.my; }
      else {
        const k = melee ? 1 : d > ideal * 1.3 ? 1 : d < ideal * .55 && g && g.cls !== 'shotgun' ? -1 : 0;
        const sx = -toY * B.strafe, sy = toX * B.strafe;
        mx = toX * k + sx * (melee ? .2 : .75); my = toY * k + sy * (melee ? .2 : .75);
        const L = Math.hypot(mx, my) || 1; mx /= L; my /= L;
        const sa = Math.atan2(my, mx);
        let ok = true;
        if (W.blocked(p.x + mx * 2.4, p.y + my * 2.4, .85)) { B.strafe = -B.strafe; ok = false; }
        if (!ok) { steer(S, p, B, p.x + toX * 6, p.y + toY * 6, dt, false); mx = I.mx; my = I.my; }
      }
      I.mx = mx; I.my = my;
      const diff = Math.abs(adiff(I.a, Math.atan2(q.y - p.y, q.x - p.x)));
      B.burstT -= dt;
      if (B.burstT <= 0) { B.fireOn = !B.fireOn; B.burstT = B.fireOn ? .5 + rnd() * 1.1 : (.1 + rnd() * .4) * (1.2 - p.sk); }
      if (seen && diff < .09 + (melee ? .5 : 0) && (B.fireOn || (g && !g.au))) {
        if (melee) { if (d < MELEE[p.sl[2]].rg + .6) I.f = 1; }
        else if (d < (g ? g.rg : 0) * .95) I.f = g.au ? 1 : (S.tk % 2 ? 1 : 0);
      }
      if (g && !p.rld && p.sl[p.cur] && p.sl[p.cur].mag === 0 && p.am[g.am] > 0) S.startReload(p);
      if (g && (!seen) && p.sl[p.cur] && p.sl[p.cur].mag < g.mg * .5 && p.am[g.am] > 0 && !p.rld) S.startReload(p);
    } else if (mode === 'flee' && foe) {
      const d = Math.hypot(foe.x - p.x, foe.y - p.y) || 1;
      const awayX = p.x - (foe.x - p.x) / d * 20, awayY = p.y - (foe.y - p.y) / d * 20;
      steer(S, p, B, clamp(awayX, 4, W.M - 4), clamp(awayY, 4, W.M - 4), dt, false);
      if (seen) { const want = Math.atan2(foe.y - p.y, foe.x - p.x); I.a = I.a + clamp(adiff(I.a, want), -9 * dt, 9 * dt); const g = S.gcur(p); if (g && d < g.rg * .8 && Math.abs(adiff(I.a, want)) < .15) I.f = g.au ? 1 : (S.tk % 2 ? 1 : 0); }
    } else if (mode === 'heal') {
      I.mx = I.my = 0;
      if (!p.act) { B.mode = 'loot'; B.tt = 0; }
    } else if (mode === 'crate' && B.crate && !B.crate.dead) {
      const o = B.crate, cx = o.k === 'c' ? o.x : (o.x0 + o.x1) / 2, cy = o.k === 'c' ? o.y : (o.y0 + o.y1) / 2;
      const d = Math.hypot(cx - p.x, cy - p.y);
      const want = Math.atan2(cy - p.y, cx - p.x);
      I.a = I.a + clamp(adiff(I.a, want), -10 * dt, 10 * dt);
      if (d > 4.5) steer(S, p, B, cx, cy, dt, true);
      else {
        I.mx = I.my = 0;
        if (p.cur !== 2 && S.t > B.swapT) { S.switchTo(p, 2); B.swapT = S.t + 1; }
        if (d < 3.2 && p.cur === 2 && Math.abs(adiff(I.a, want)) < .3) I.f = 1;
        else if (d < 3.2 && p.cur === 2) I.f = 0;
        B.lootT += dt;
        if (B.lootT > 14) { B.bad.add('c' + o.id); B.crate = null; B.lootT = 0; }
      }
    } else {
      if (mode === 'crate') { B.crate = null; B.mode = 'loot'; B.tt = 0; }
      const d = steer(S, p, B, B.tx, B.ty, dt, true);
      if (mode === 'loot' || mode === 'hunt' || mode === 'zone') {
        const aw = Math.atan2(I.my, I.mx);
        if (I.mx || I.my) I.a = I.a + clamp(adiff(I.a, aw), -7 * dt, 7 * dt);
      }
      if (mode === 'loot') {
        if (B.lootId >= 0) {
          B.lootT += dt;
          if (d < 2.4) {
            const l = S.loot.find(q => q.id === B.lootId);
            if (l) { if (l.k === 'gun' || l.k === 'melee') { S.pickManual(p); } if (!S.loot.includes(l)) B.lootId = -1; else if (d < .9) { B.bad.add(l.id); B.lootId = -1; } }
            else B.lootId = -1;
          }
          if (B.lootT > 10) { B.bad.add(B.lootId); B.lootId = -1; B.lootT = 0; }
        } else if (B.bld) {
          if (Math.hypot(B.bld.cx - p.x, B.bld.cy - p.y) < 5) { B.visited.add(B.bld.n); B.bld = null; B.tt = 0; }
        }
      }
      if (mode === 'zone' && d < 4) { B.zpt = null; B.mode = 'loot'; B.tt = 0; }
      if (mode === 'hunt' && d < 5 && S.t - B.seenAt > 1) { B.mode = 'loot'; B.hearT = S.t + 6; B.tt = 0; }
      if (!p.act && !p.rld && p.cur < 2 && p.sl[p.cur] && p.sl[p.cur].mag < GUNS[p.sl[p.cur].g].mg && p.am[GUNS[p.sl[p.cur].g].am] > 0 && S.t - B.seenAt > 2) S.startReload(p);
      if (p.cur === 3 || (p.cur === 2 && (p.sl[0] || p.sl[1]) && mode !== 'crate')) {
        const i = p.sl[0] ? 0 : 1;
        if (p.sl[i] && S.t > B.swapT) { S.switchTo(p, i); B.swapT = S.t + 1; }
      }
    }
    if ((I.mx || I.my) && mode !== 'heal') {
      const sp = Math.hypot(p.vx, p.vy);
      if (mv0 < dt * 2.2 && !(mode === 'crate' && Math.hypot(B.tx - p.x, B.ty - p.y) < 5)) { B.stuck += dt; if (B.stuck > .4) { B.avoid = (rnd() < .5 ? 1 : -1) * (.9 + rnd() * .9); B.avT = .8; B.stuck = 0; } }
      else B.stuck = Math.max(0, B.stuck - dt);
    }
    I.ad = 20;
  }

  function svIcon(c, k, n, v, r) {
    c.save();
    c.lineJoin = 'round'; c.lineCap = 'round';
    const lw = r * .12;
    c.lineWidth = lw;
    if (k === 'gun') {
      const g = GUNS[GI[n]];
      c.fillStyle = '#e9edf2'; c.strokeStyle = '#0006';
      const L = r * (.8 + g.len * .2);
      c.beginPath(); c.rect(-L * .6, -r * .16, L, r * .3); c.fill();
      c.beginPath(); c.rect(-L * .25, r * .1, r * .22, r * .36); c.fill();
      if (g.cls === 'sniper') { c.fillRect(-L * .1, -r * .32, r * .5, r * .12); }
      if (g.cls === 'smg' || g.cls === 'lmg' || g.cls === 'ar') c.fillRect(-L * .02, r * .1, r * .16, r * .42);
    } else if (k === 'ammo') {
      c.fillStyle = AM[n][1];
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.roundRect(i * r * .38 - r * .13, -r * .45, r * .26, r * .9, r * .1); c.fill(); }
      c.fillStyle = '#ffffff55'; for (let i = -1; i <= 1; i++) c.fillRect(i * r * .38 - r * .13, -r * .45, r * .26, r * .22);
    } else if (k === 'heal') {
      if (n === 'bandage') { c.fillStyle = '#f4f4f4'; c.beginPath(); c.roundRect(-r * .55, -r * .35, r * 1.1, r * .7, r * .1); c.fill(); c.fillStyle = '#e04646'; c.fillRect(-r * .1, -r * .3, r * .2, r * .6); c.fillRect(-r * .3, -r * .1, r * .6, r * .2); }
      else if (n === 'medkit') { c.fillStyle = '#f4f4f4'; c.beginPath(); c.roundRect(-r * .6, -r * .45, r * 1.2, r * .9, r * .12); c.fill(); c.fillStyle = '#3bb85a'; c.fillRect(-r * .12, -r * .32, r * .24, r * .64); c.fillRect(-r * .32, -r * .12, r * .64, r * .24); }
      else if (n === 'soda') { c.fillStyle = '#37a4ff'; c.beginPath(); c.roundRect(-r * .28, -r * .5, r * .56, r, r * .1); c.fill(); c.fillStyle = '#e7f3ff'; c.fillRect(-r * .28, -r * .12, r * .56, r * .24); }
      else { c.rotate(-.7); c.fillStyle = '#ff9f1a'; c.beginPath(); c.roundRect(-r * .55, -r * .24, r * .55, r * .48, r * .24); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(0, -r * .24, r * .55, r * .48, r * .24); c.fill(); }
    } else if (k === 'gear') {
      c.fillStyle = (n === 'pack' ? PACKCOL : GEARCOL)[v] || '#aaa'; c.strokeStyle = '#0008';
      if (n === 'vest') { c.beginPath(); c.moveTo(-r * .5, -r * .5); c.lineTo(-r * .2, -r * .5); c.lineTo(0, -r * .3); c.lineTo(r * .2, -r * .5); c.lineTo(r * .5, -r * .5); c.lineTo(r * .42, r * .5); c.lineTo(-r * .42, r * .5); c.closePath(); c.fill(); c.stroke(); }
      else if (n === 'helm') { c.beginPath(); c.arc(0, r * .1, r * .5, PI, 0); c.lineTo(r * .62, r * .25); c.lineTo(-r * .62, r * .25); c.closePath(); c.fill(); c.stroke(); }
      else { c.beginPath(); c.roundRect(-r * .45, -r * .5, r * .9, r, r * .2); c.fill(); c.stroke(); c.fillStyle = '#0003'; c.fillRect(-r * .3, r * .08, r * .6, r * .28); }
      c.fillStyle = '#fff'; for (let i = 0; i < v; i++) { c.beginPath(); c.arc((i - (v - 1) / 2) * r * .28, r * .72, r * .09, 0, TAU); c.fill(); }
    } else if (k === 'scope') {
      c.strokeStyle = '#e9edf2'; c.lineWidth = r * .14;
      c.beginPath(); c.arc(0, 0, r * .52, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-r * .72, 0); c.lineTo(r * .72, 0); c.moveTo(0, -r * .72); c.lineTo(0, r * .72); c.stroke();
      c.fillStyle = '#fff'; c.font = `800 ${r * .7}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(v + 'x', 0, r * .02);
    } else if (k === 'throw') {
      c.fillStyle = THROW[n].col; c.beginPath(); c.arc(0, r * .1, r * .42, 0, TAU); c.fill();
      c.strokeStyle = '#ddd'; c.lineWidth = r * .12; c.beginPath(); c.moveTo(-r * .1, -r * .32); c.lineTo(r * .3, -r * .52); c.stroke();
      if (n === 'smoke') { c.fillStyle = '#fff8'; c.beginPath(); c.arc(-r * .1, r * .02, r * .15, 0, TAU); c.fill(); }
    } else if (k === 'melee') {
      c.strokeStyle = '#e9edf2'; c.lineWidth = r * .16; c.beginPath(); c.moveTo(-r * .5, r * .5); c.lineTo(r * .5, -r * .5); c.stroke();
      c.strokeStyle = '#8a5a2b'; c.lineWidth = r * .2; c.beginPath(); c.moveTo(-r * .5, r * .5); c.lineTo(-r * .2, r * .2); c.stroke();
    }
    c.restore();
  }
  const lootRing = l => l.k === 'gun' ? AM[GUNS[GI[l.n]].am][1] : l.k === 'ammo' ? AM[l.n][1] : l.k === 'heal' ? HEAL[l.n].col : l.k === 'gear' ? '#d8dde6' : l.k === 'scope' ? '#f2c94c' : l.k === 'throw' ? '#9fb98a' : '#c9ced6';
  const lootName = l => l.k === 'gun' ? GUNS[GI[l.n]].name : l.k === 'ammo' ? AM[l.n][0] + ' ×' + l.c : l.k === 'heal' ? HEAL[l.n].n + (l.c > 1 ? ' ×' + l.c : '') : l.k === 'gear' ? ({ vest: 'Kevlar', helm: 'Helmet', pack: 'Backpack' })[l.n] + ' Lv.' + l.c : l.k === 'scope' ? l.c + 'x Scope' : l.k === 'throw' ? THROW[l.n].n + ' ×' + l.c : MELEE[l.n].n;

  function svRenderer(ctx, W0, H0, Wm, opt) {
    const M = Wm.M;
    const R = { fx: [], roofA: new Map(), zoom: ZW[0], feed: [], dmgFlash: 0, shake: 0, camx: M / 2, camy: M / 2, msgs: [], big: false, t: 0 };
    let W = W0, H = H0, ui = W0 < 600 ? 1 : clamp(W0 / 960, .9, 1.25);
    const tmpQ = [];
    const mkMap = size => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const x = c.getContext('2d'), s = size / M;
      x.fillStyle = '#3f87c5'; x.fillRect(0, 0, size, size);
      x.fillStyle = '#66b0de'; x.beginPath(); x.roundRect(3 * s, 3 * s, size - 6 * s, size - 6 * s, 40 * s); x.fill();
      x.fillStyle = '#c9b074'; x.beginPath(); x.roundRect(9 * s, 9 * s, size - 18 * s, size - 18 * s, 38 * s); x.fill();
      x.fillStyle = '#80af49'; x.beginPath(); x.roundRect(22 * s, 22 * s, size - 44 * s, size - 44 * s, 30 * s); x.fill();
      for (const l of Wm.lakes) { x.fillStyle = '#c9b074'; x.beginPath(); x.arc(l.x * s, l.y * s, (l.r + 5) * s, 0, TAU); x.fill(); }
      for (const l of Wm.lakes) { x.fillStyle = '#66b0de'; x.beginPath(); x.arc(l.x * s, l.y * s, l.r * s, 0, TAU); x.fill(); }
      for (const l of Wm.lakes) { x.fillStyle = '#4b94cf'; x.beginPath(); x.arc(l.x * s, l.y * s, (l.r - 3) * s, 0, TAU); x.fill(); }
      for (const b of Wm.bl) { x.fillStyle = b.roof; x.fillRect(b.x0 * s, b.y0 * s, b.w * s, b.h * s); x.strokeStyle = '#00000066'; x.lineWidth = Math.max(1, s); x.strokeRect(b.x0 * s, b.y0 * s, b.w * s, b.h * s); }
      x.fillStyle = '#2f6b25'; for (const o of Wm.obs) if (o.t === 'tree') { x.beginPath(); x.arc(o.x * s, o.y * s, Math.max(1, 2.4 * s), 0, TAU); x.fill(); }
      return c;
    };
    const maps = {};
    const getMap = size => maps[size] || (maps[size] = mkMap(size));
    R.resize = (w, h) => { W = w; H = h; ui = w < 600 ? 1 : clamp(w / 960, .9, 1.25); };
    R.addFx = e => {
      if (e.k === 'imp') { const col = e.t === 'rock' ? '#cfd2d6' : e.t === 'wall' ? '#d9c7a8' : e.t === 'tree' ? '#7cc06a' : '#d8b98a'; for (let i = 0; i < 4; i++) R.fx.push({ k: 'dot', x: e.x, y: e.y, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, l: .35, m: .35, c: col, r: .16 }); }
      else if (e.k === 'hit') { for (let i = 0; i < 6; i++) R.fx.push({ k: 'dot', x: e.x, y: e.y, vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10, l: .5, m: .5, c: '#d62a2a', r: .24 }); R.fx.push({ k: 'dmg', x: e.x, y: e.y - 1.2, l: .8, m: .8, t: e.d, vy: -3 }); }
      else if (e.k === 'brk') { for (let i = 0; i < 9; i++) R.fx.push({ k: 'dot', x: e.x, y: e.y, vx: (Math.random() - .5) * 12, vy: (Math.random() - .5) * 12, l: .7, m: .7, c: '#a36d3b', r: .28 }); }
      else if (e.k === 'ex') { R.fx.push({ k: 'ex', x: e.x, y: e.y, l: .6, m: .6, R: e.R }); R.shake = Math.max(R.shake, 1); for (let i = 0; i < 14; i++) R.fx.push({ k: 'dot', x: e.x, y: e.y, vx: (Math.random() - .5) * 26, vy: (Math.random() - .5) * 26, l: .9, m: .9, c: '#ff9a2e', r: .35 }); }
      else if (e.k === 'land') R.fx.push({ k: 'ring', x: e.x, y: e.y, l: .5, m: .5, R: 3 });
    };
    R.feedAdd = (html, mine) => { R.feed.push({ t: html, a: 7, mine }); if (R.feed.length > 6) R.feed.shift(); };
    R.msg = (t, d = 4) => { R.msgs.push({ t, a: d, d }); if (R.msgs.length > 3) R.msgs.shift(); };
    R.update = dt => {
      R.t += dt;
      for (let i = R.fx.length - 1; i >= 0; i--) {
        const f = R.fx[i]; f.l -= dt;
        if (f.l <= 0) { R.fx.splice(i, 1); continue; }
        if (f.vx != null) { f.x += f.vx * dt; f.y += (f.vy || 0) * dt; f.vx *= .93; if (f.k === 'dot') f.vy *= .93; }
      }
      for (const f of R.feed) f.a -= dt;
      while (R.feed.length && R.feed[0].a <= 0) R.feed.shift();
      for (const m of R.msgs) m.a -= dt;
      while (R.msgs.length && R.msgs[0].a <= 0) R.msgs.shift();
      R.dmgFlash = Math.max(0, R.dmgFlash - dt * 1.6);
      R.shake = Math.max(0, R.shake - dt * 3);
    };
    const drawPlayer = (c, p, sc, mine) => {
      const w = p.w;
      c.save();
      c.translate(p.sx, p.sy); c.rotate(p.a); c.scale(sc, sc);
      c.lineJoin = 'round'; c.lineCap = 'round';
      if (p.para === 2) { c.save(); c.rotate(-p.a); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(0, 0, 3.4, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .15; c.stroke(); c.restore(); }
      const skin = p.col || '#f8c574', dark = 'rgba(40,24,6,.75)';
      if (p.pack > 0) { c.fillStyle = PACKCOL[p.pack]; c.strokeStyle = dark; c.lineWidth = .14; c.beginPath(); c.arc(-.88, 0, .62, 0, TAU); c.fill(); c.stroke(); }
      let hands = null, extra = null;
      if (w >= 0 && w < 100) {
        const g = GUNS[w], L = g.len;
        c.strokeStyle = '#111'; c.lineWidth = .1;
        c.fillStyle = g.col;
        c.beginPath(); c.rect(.6, -.16, L * .9, .32); c.fill(); c.stroke();
        if (g.wood) { c.fillStyle = '#8a5a2b'; c.beginPath(); c.rect(.6 + L * .3, -.19, L * .32, .38); c.fill(); c.stroke(); }
        if (g.cls === 'sniper') { c.fillStyle = '#333'; c.fillRect(.6 + L * .3, -.3, .9, .14); }
        const isP = g.cls === 'pistol';
        hands = isP ? [[.6 + L * .75, .22], [.6 + L * .75, -.22]] : [[.55 + L * .22, .3], [.6 + L * .72, -.14]];
        if (p.recoil) { c.translate(-p.recoil * .15, 0); }
      } else if (w >= 100 && w < 200) {
        const m = MELEEK[w - 100], sw = p.sw > 0 ? Math.sin((1 - p.sw / .22) * PI) : 0;
        hands = [[.95 + sw * .7, .62 - sw * 1.2], [.8, -.62]];
        extra = [m, sw];
      } else if (w === 200 || w === 201) {
        hands = [[.9, .5], [.95, -.2]];
        extra = ['g' + (w - 200)];
      } else if (p.act) {
        hands = [[.8, .35], [.8, -.35]];
        extra = ['h' + p.act];
      } else hands = [[.98, .62], [.98, -.62]];
      c.fillStyle = skin; c.strokeStyle = dark; c.lineWidth = .16;
      c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.stroke();
      if (p.vest > 0) { c.strokeStyle = GEARCOL[p.vest]; c.lineWidth = .24; c.beginPath(); c.arc(0, 0, .78, 0, TAU); c.stroke(); }
      if (p.helm > 0) { c.fillStyle = GEARCOL[p.helm]; c.strokeStyle = dark; c.lineWidth = .12; c.beginPath(); c.arc(-.05, 0, .5, 0, TAU); c.fill(); c.stroke(); }
      if (extra) {
        if (MELEE[extra[0]]) {
          const sw = extra[1], mm = extra[0];
          c.save(); c.translate(hands[0][0], hands[0][1]); c.rotate(-.4 + sw * 1.6);
          c.lineWidth = .14; c.strokeStyle = '#111';
          if (mm === 'knife') { c.fillStyle = '#d7dce2'; c.beginPath(); c.moveTo(0, -.1); c.lineTo(1.2, 0); c.lineTo(0, .1); c.closePath(); c.fill(); c.stroke(); }
          else if (mm === 'katana') { c.fillStyle = '#e6eaef'; c.beginPath(); c.rect(0, -.08, 2.2, .16); c.fill(); c.stroke(); c.fillStyle = '#c33'; c.fillRect(-.25, -.1, .3, .2); }
          else if (mm === 'hook') { c.strokeStyle = '#9aa2ad'; c.lineWidth = .18; c.beginPath(); c.moveTo(0, 0); c.lineTo(1.4, 0); c.arc(1.4, .45, .45, -PI / 2, PI / 2); c.stroke(); }
          c.restore();
        } else if (extra[0][0] === 'g') {
          c.fillStyle = extra[0] === 'g0' ? '#4f6b2f' : '#b8c4cc'; c.strokeStyle = '#111'; c.lineWidth = .1; c.beginPath(); c.arc(1.15, .1, .38, 0, TAU); c.fill(); c.stroke();
        } else if (extra[0][0] === 'h') {
          c.save(); c.translate(1.1, 0); svIcon(c, 'heal', HEALK[+extra[0].slice(1) - 1], 0, .55); c.restore();
        }
      }
      c.fillStyle = skin; c.strokeStyle = dark; c.lineWidth = .14;
      for (const h of hands) { c.beginPath(); c.arc(h[0], h[1], .36, 0, TAU); c.fill(); c.stroke(); }
      if (p.fl > 0 && w >= 0 && w < 100) {
        const g = GUNS[w], tx = .6 + g.len * .92;
        c.fillStyle = '#ffe9a0'; c.beginPath();
        const rr = g.cls === 'shotgun' ? 1.5 : g.cls === 'sniper' ? 1.6 : 1.0;
        c.moveTo(tx, 0); c.lineTo(tx + rr * .5, -rr * .5); c.lineTo(tx + rr * 1.3, 0); c.lineTo(tx + rr * .5, rr * .5); c.closePath(); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(tx + .2, 0, .25, 0, TAU); c.fill();
      }
      c.restore();
    };
    const drawObs = (c, o, vx, vy, sc, kind) => {
      if (o.k === 'r') {
        const x = vx(o.x0), y = vy(o.y0), w = (o.x1 - o.x0) * sc, h = (o.y1 - o.y0) * sc;
        if (o.t === 'wall') { c.fillStyle = '#4c3a2b'; c.fillRect(x, y, w, h); c.strokeStyle = '#2a1e14'; c.lineWidth = Math.max(1, sc * .12); c.strokeRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + sc * .12, y + sc * .12, Math.max(0, w - sc * .24), Math.max(0, h - sc * .24)); }
        else {
          c.fillStyle = '#a3703d'; c.fillRect(x, y, w, h);
          c.fillStyle = '#b98650'; c.fillRect(x + sc * .22, y + sc * .22, w - sc * .44, h - sc * .44);
          c.strokeStyle = '#6a4523'; c.lineWidth = Math.max(1, sc * .16); c.strokeRect(x, y, w, h);
          c.lineWidth = Math.max(1, sc * .12); c.beginPath(); c.moveTo(x + sc * .22, y + sc * .22); c.lineTo(x + w - sc * .22, y + h - sc * .22); c.moveTo(x + w - sc * .22, y + sc * .22); c.lineTo(x + sc * .22, y + h - sc * .22); c.stroke();
          if (o.hp < o.mhp) { c.fillStyle = 'rgba(0,0,0,' + (.35 * (1 - o.hp / o.mhp)).toFixed(2) + ')'; c.fillRect(x, y, w, h); }
        }
        return;
      }
      const x = vx(o.x), y = vy(o.y), r = o.r * sc;
      if (o.t === 'rock') {
        c.save(); c.translate(x, y); c.rotate(o.rot);
        const n = o.pts.length;
        c.beginPath();
        for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * o.pts[i]; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        c.closePath(); c.fillStyle = '#8c9094'; c.fill(); c.strokeStyle = '#4f5256'; c.lineWidth = Math.max(1.2, sc * .2); c.stroke();
        c.beginPath();
        for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * o.pts[i] * .62; c.lineTo(Math.cos(a) * rr - r * .1, Math.sin(a) * rr - r * .1); }
        c.closePath(); c.fillStyle = '#a7abaf'; c.fill();
        c.restore();
      } else if (o.t === 'barrel') {
        c.fillStyle = o.ex ? '#a82a24' : '#6d7783'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
        c.strokeStyle = o.ex ? '#5c1511' : '#3b424b'; c.lineWidth = Math.max(1, sc * .16); c.stroke();
        c.fillStyle = o.ex ? '#d9453b' : '#8a95a3'; c.beginPath(); c.arc(x, y, r * .62, 0, TAU); c.fill(); c.stroke();
        if (o.ex) { c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x, y, r * .22, 0, TAU); c.fill(); }
      } else if (o.t === 'drop') {
        const s = o.r * sc;
        c.fillStyle = '#c9322b'; c.fillRect(x - s, y - s, s * 2, s * 2);
        c.fillStyle = '#f2f2f2'; c.fillRect(x - s, y - s * .3, s * 2, s * .6); c.fillRect(x - s * .3, y - s, s * .6, s * 2);
        c.strokeStyle = '#611512'; c.lineWidth = Math.max(1.5, sc * .2); c.strokeRect(x - s, y - s, s * 2, s * 2);
      }
    };
    R.draw = (c, V, UI) => {
      const me = V.me;
      const sh = R.shake;
      const tz = ZW[me.zoom || 0];
      R.zoom += (tz - R.zoom) * Math.min(1, .08 + .0);
      const sc = Math.sqrt(W * H) / (2 * R.zoom * .8);
      R.sc = sc;
      let camx = V.cx, camy = V.cy;
      if (R.camx == null || V.snapCam) { R.camx = camx; R.camy = camy; } else { R.camx = camx; R.camy = camy; }
      const jx = sh ? (Math.random() - .5) * sh * 6 : 0, jy = sh ? (Math.random() - .5) * sh * 6 : 0;
      const cx = R.camx, cy = R.camy;
      const vx = x => (x - cx) * sc + W / 2 + jx, vy = y => (y - cy) * sc + H / 2 + jy;
      R.vx = vx; R.vy = vy;
      const hw = W / 2 / sc + 6, hh = H / 2 / sc + 6;
      const x0 = cx - hw, x1 = cx + hw, y0 = cy - hh, y1 = cy + hh;
      c.fillStyle = '#3f87c5'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#66b0de'; c.beginPath(); c.roundRect(vx(3), vy(3), (M - 6) * sc, (M - 6) * sc, 40 * sc); c.fill();
      c.fillStyle = '#c9b074'; c.beginPath(); c.roundRect(vx(9), vy(9), (M - 18) * sc, (M - 18) * sc, 38 * sc); c.fill();
      c.fillStyle = '#80af49'; c.beginPath(); c.roundRect(vx(22), vy(22), (M - 44) * sc, (M - 44) * sc, 30 * sc); c.fill();
      for (const b of Wm.blobs) {
        if (b.x + b.r < x0 || b.x - b.r > x1 || b.y + b.r < y0 || b.y - b.r > y1) continue;
        c.fillStyle = b.c ? `rgba(150,200,90,${b.a})` : `rgba(80,120,40,${b.a})`;
        c.beginPath(); c.arc(vx(b.x), vy(b.y), b.r * sc, 0, TAU); c.fill();
      }
      for (const l of Wm.lakes) { if (l.x + l.r + 6 < x0 || l.x - l.r - 6 > x1 || l.y + l.r + 6 < y0 || l.y - l.r - 6 > y1) continue; c.fillStyle = '#c9b074'; c.beginPath(); c.arc(vx(l.x), vy(l.y), (l.r + 5) * sc, 0, TAU); c.fill(); }
      for (const l of Wm.lakes) { if (l.x + l.r < x0 || l.x - l.r > x1 || l.y + l.r < y0 || l.y - l.r > y1) continue; c.fillStyle = '#66b0de'; c.beginPath(); c.arc(vx(l.x), vy(l.y), l.r * sc, 0, TAU); c.fill(); }
      for (const l of Wm.lakes) { if (l.x + l.r < x0 || l.x - l.r > x1 || l.y + l.r < y0 || l.y - l.r > y1) continue; c.fillStyle = '#4b94cf'; c.beginPath(); c.arc(vx(l.x), vy(l.y), (l.r - 3) * sc, 0, TAU); c.fill(); }
      const inB = Wm.bldAt(V.cx, V.cy);
      for (const b of Wm.bl) {
        if (b.x1 < x0 || b.x0 > x1 || b.y1 < y0 || b.y0 > y1) continue;
        c.fillStyle = b.floor; c.fillRect(vx(b.x0), vy(b.y0), b.w * sc, b.h * sc);
        c.strokeStyle = 'rgba(60,35,10,.16)'; c.lineWidth = Math.max(1, sc * .08);
        c.beginPath();
        if (b.type === 'warehouse') { for (let u = b.x0 + 3; u < b.x1; u += 3) { c.moveTo(vx(u), vy(b.y0)); c.lineTo(vx(u), vy(b.y1)); } for (let u = b.y0 + 3; u < b.y1; u += 3) { c.moveTo(vx(b.x0), vy(u)); c.lineTo(vx(b.x1), vy(u)); } }
        else for (let u = b.y0 + 1.6; u < b.y1; u += 1.6) { c.moveTo(vx(b.x0), vy(u)); c.lineTo(vx(b.x1), vy(u)); }
        c.stroke();
      }
      const lootNear = V.nearLoot;
      for (const l of V.L) {
        if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) continue;
        const x = vx(l.x), y = vy(l.y), r = 1.05 * sc, hot = l === lootNear;
        c.fillStyle = 'rgba(14,18,24,.82)'; c.beginPath(); c.arc(x, y, r * (hot ? 1.2 : 1), 0, TAU); c.fill();
        c.strokeStyle = lootRing(l); c.lineWidth = Math.max(1.5, sc * (hot ? .3 : .2)); c.stroke();
        c.save(); c.translate(x, y); svIcon(c, l.k, l.n, l.c, r * .78); c.restore();
      }
      const list = Wm.query(x0 - 5, y0 - 5, x1 + 5, y1 + 5, tmpQ);
      const trees = [], bushes = [];
      for (const o of list) {
        if (o.t === 'tree') trees.push(o);
        else if (o.t === 'bush') bushes.push(o);
        else if (o.t !== 'wall') drawObs(c, o, vx, vy, sc);
      }
      for (const o of list) if (o.t === 'wall') drawObs(c, o, vx, vy, sc);
      if (V.drops) for (const d of V.drops) {
        if (d.landed) continue;
        const f = clamp(d.f, 0, 1), h = (1 - f) * 70;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(vx(d.x), vy(d.y), 1.6 * sc, 1.2 * sc, 0, 0, TAU); c.fill();
        const px = vx(d.x), py = vy(d.y - h * .6);
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(1, sc * .08);
        c.beginPath(); c.moveTo(px, py); c.lineTo(vx(d.x), vy(d.y)); c.moveTo(px - 4 * sc, py - 1 * sc); c.lineTo(vx(d.x) - 1.2 * sc, vy(d.y)); c.moveTo(px + 4 * sc, py - 1 * sc); c.lineTo(vx(d.x) + 1.2 * sc, vy(d.y)); c.stroke();
        c.fillStyle = '#e9f0f6'; c.beginPath(); c.arc(px, py - 1 * sc, 4.4 * sc, PI, 0); c.closePath(); c.fill(); c.strokeStyle = '#c9322b'; c.lineWidth = sc * .3; c.stroke();
        c.fillStyle = '#c9322b'; c.fillRect(vx(d.x) - 1.4 * sc, vy(d.y) - 1.4 * sc, 2.8 * sc, 2.8 * sc);
      }
      for (const g of V.G) {
        const x = vx(g.x), y = vy(g.y);
        c.fillStyle = g.k === 'frag' ? '#4f6b2f' : '#b8c4cc'; c.strokeStyle = '#111'; c.lineWidth = Math.max(1, sc * .1);
        c.beginPath(); c.arc(x, y, .5 * sc, 0, TAU); c.fill(); c.stroke();
      }
      for (const b of V.B) {
        if (b.x < x0 || b.x > x1 || b.y < y0 || b.y > y1) continue;
        const g = GUNS[b.g], L = clamp(g.sp * .06, 3, 11), ca = Math.cos(b.a), sa = Math.sin(b.a);
        const col = AM[g.am][1];
        const gr = c.createLinearGradient(vx(b.x - ca * L), vy(b.y - sa * L), vx(b.x), vy(b.y));
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, col);
        c.strokeStyle = gr; c.lineWidth = Math.max(1.2, sc * (g.pe > 1 ? .14 : .22)); c.lineCap = 'round';
        c.beginPath(); c.moveTo(vx(b.x - ca * L), vy(b.y - sa * L)); c.lineTo(vx(b.x), vy(b.y)); c.stroke();
      }
      const ps = V.P.slice().sort((a, b) => (a.id === me.id) - (b.id === me.id));
      for (const p of ps) {
        if (p.x < x0 - 3 || p.x > x1 + 3 || p.y < y0 - 3 || p.y > y1 + 3) continue;
        p.sx = vx(p.x); p.sy = vy(p.y);
        if (p.para === 1) continue;
        drawPlayer(c, p, sc, p.id === me.id);
        if (p.name && (p.id !== me.id) && V.names) {
          c.font = `700 ${Math.max(9, 10.5 * ui)}px Arial`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.6)';
          c.strokeText(p.name, p.sx, p.sy - 1.9 * sc); c.fillStyle = '#fff'; c.fillText(p.name, p.sx, p.sy - 1.9 * sc);
        }
      }
      for (const s of V.S) {
        if (s.x + s.r < x0 || s.x - s.r > x1 || s.y + s.r < y0 || s.y - s.r > y1) continue;
        const f = clamp(s.t / 3, 0, 1) * .62;
        for (let i = 0; i < 7; i++) {
          const a = i / 7 * TAU + R.t * .25, d = s.r * (i ? .5 : 0);
          const g = c.createRadialGradient(vx(s.x + Math.cos(a) * d), vy(s.y + Math.sin(a) * d), 0, vx(s.x + Math.cos(a) * d), vy(s.y + Math.sin(a) * d), s.r * .62 * sc);
          g.addColorStop(0, `rgba(226,230,234,${f})`); g.addColorStop(1, 'rgba(226,230,234,0)');
          c.fillStyle = g; c.beginPath(); c.arc(vx(s.x + Math.cos(a) * d), vy(s.y + Math.sin(a) * d), s.r * .62 * sc, 0, TAU); c.fill();
        }
      }
      for (const o of bushes) {
        const x = vx(o.x), y = vy(o.y), r = o.r * sc;
        c.globalAlpha = .94;
        c.fillStyle = '#3e7a29'; c.strokeStyle = '#2a5a1b'; c.lineWidth = Math.max(1, sc * .14);
        for (let i = 0; i < 6; i++) { const a = o.rot + i / 6 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5, r * .58, 0, TAU); c.fill(); c.stroke(); }
        c.fillStyle = '#4f8f36'; c.beginPath(); c.arc(x, y, r * .62, 0, TAU); c.fill();
        c.fillStyle = '#c7342d'; for (let i = 0; i < 3; i++) { const a = o.rot * 3 + i * 2.1; c.beginPath(); c.arc(x + Math.cos(a) * r * .38, y + Math.sin(a) * r * .38, sc * .15, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
      }
      for (const b of Wm.bl) {
        if (b.x1 < x0 || b.x0 > x1 || b.y1 < y0 || b.y0 > y1) continue;
        let a = R.roofA.get(b.n); if (a == null) a = 1;
        a += ((b === inB ? 0 : 1) - a) * .18; R.roofA.set(b.n, a);
        if (a < .03) continue;
        c.globalAlpha = a;
        const x = vx(b.x0 - .5), y = vy(b.y0 - .5), w = (b.w + 1) * sc, h = (b.h + 1) * sc;
        c.fillStyle = b.roof; c.fillRect(x, y, w, h);
        c.strokeStyle = b.roof2; c.lineWidth = Math.max(1, sc * .22);
        c.beginPath(); for (let u = b.y0 + 1; u < b.y1; u += 1.7) { c.moveTo(x, vy(u)); c.lineTo(x + w, vy(u)); } c.stroke();
        c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = Math.max(1.5, sc * .3); c.strokeRect(x, y, w, h);
        c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = Math.max(1, sc * .2); c.beginPath(); c.moveTo(x, vy(b.cy)); c.lineTo(x + w, vy(b.cy)); c.stroke();
        c.globalAlpha = 1;
      }
      for (const f of R.fx) {
        const k = f.l / f.m;
        if (f.k === 'dot') { c.globalAlpha = clamp(k * 1.4, 0, 1); c.fillStyle = f.c; c.beginPath(); c.arc(vx(f.x), vy(f.y), f.r * sc, 0, TAU); c.fill(); c.globalAlpha = 1; }
        else if (f.k === 'ex') {
          const q = 1 - k;
          const g = c.createRadialGradient(vx(f.x), vy(f.y), 0, vx(f.x), vy(f.y), f.R * sc * (.3 + q * .8));
          g.addColorStop(0, `rgba(255,240,170,${k})`); g.addColorStop(.5, `rgba(255,140,40,${k * .85})`); g.addColorStop(1, 'rgba(120,40,10,0)');
          c.fillStyle = g; c.beginPath(); c.arc(vx(f.x), vy(f.y), f.R * sc * (.3 + q * .8), 0, TAU); c.fill();
        } else if (f.k === 'ring') { c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = sc * .2; c.beginPath(); c.arc(vx(f.x), vy(f.y), f.R * sc * (1 - k + .2), 0, TAU); c.stroke(); }
        else if (f.k === 'dmg') { c.globalAlpha = clamp(k * 2, 0, 1); c.font = `800 ${Math.max(10, 13 * ui)}px Arial`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.7)'; c.strokeText(f.t, vx(f.x), vy(f.y)); c.fillStyle = '#ffe14d'; c.fillText(f.t, vx(f.x), vy(f.y)); c.globalAlpha = 1; f.y += f.vy * .016; }
      }
      for (const o of trees) {
        const x = vx(o.x), y = vy(o.y), r = 4.3 * o.s * sc;
        const under = Math.hypot(me.x - o.x, me.y - o.y) < 4.3 * o.s;
        c.globalAlpha = under ? .5 : .93;
        const pal = [['#2c6a2a', '#3d8a37', '#2a5b24'], ['#33702d', '#468f3a', '#2d5f27'], ['#2a6334', '#3a8546', '#264f2b']][o.v];
        c.fillStyle = pal[0]; c.strokeStyle = pal[2]; c.lineWidth = Math.max(1.2, sc * .22);
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = pal[1];
        for (let i = 0; i < 5; i++) { const a = o.rot + i / 5 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * r * .42, y + Math.sin(a) * r * .42, r * .42, 0, TAU); c.fill(); }
        c.fillStyle = pal[0]; c.beginPath(); c.arc(x, y, r * .3, 0, TAU); c.fill();
        c.globalAlpha = 1;
      }
      const z = V.Z;
      if (z) {
        c.save();
        c.beginPath(); c.rect(-20, -20, W + 40, H + 40);
        c.moveTo(vx(z.cx) + z.r * sc, vy(z.cy)); c.arc(vx(z.cx), vy(z.cy), Math.max(0.01, z.r * sc), 0, TAU, true);
        c.fillStyle = 'rgba(214,40,40,.3)'; c.fill('evenodd');
        c.restore();
        c.strokeStyle = 'rgba(255,90,90,.9)'; c.lineWidth = Math.max(2, sc * .35); c.beginPath(); c.arc(vx(z.cx), vy(z.cy), Math.max(0.01, z.r * sc), 0, TAU); c.stroke();
        if (z.nr > 0 && (z.st === 'wait' || z.st === 'shrink')) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1.5, sc * .22); c.setLineDash([sc * 2, sc * 1.5]); c.beginPath(); c.arc(vx(z.nx), vy(z.ny), z.nr * sc, 0, TAU); c.stroke(); c.setLineDash([]); }
      }
      if (V.plane) {
        const pl = V.plane, px = vx(pl.x), py = vy(pl.y), s = sc * 1.3;
        c.save(); c.translate(px, py); c.rotate(pl.a); c.scale(s, s);
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(1.5, 2, 5.5, 1.2, 0, 0, TAU); c.fill();
        c.fillStyle = '#dfe5ec'; c.strokeStyle = '#6b7684'; c.lineWidth = .18;
        c.beginPath(); c.moveTo(6, 0); c.lineTo(3, -1); c.lineTo(-5, -.8); c.lineTo(-6, 0); c.lineTo(-5, .8); c.lineTo(3, 1); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(1, -.5); c.lineTo(-1.5, -6); c.lineTo(-3, -6); c.lineTo(-2.5, -.5); c.moveTo(1, .5); c.lineTo(-1.5, 6); c.lineTo(-3, 6); c.lineTo(-2.5, .5); c.fill(); c.stroke();
        c.restore();
      }
      if (V.plane2) {
        const pl = V.plane2, px = vx(pl.x), py = vy(pl.y), s = sc * 1.1;
        c.save(); c.translate(px, py); c.rotate(pl.a); c.scale(s, s);
        c.fillStyle = '#cfd6de'; c.strokeStyle = '#c9322b'; c.lineWidth = .25;
        c.beginPath(); c.moveTo(5, 0); c.lineTo(2, -.9); c.lineTo(-4, -.7); c.lineTo(-5, 0); c.lineTo(-4, .7); c.lineTo(2, .9); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      if (R.dmgFlash > 0) {
        const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, Math.max(W, H) * .62);
        g.addColorStop(0, 'rgba(200,0,0,0)'); g.addColorStop(1, `rgba(200,0,0,${R.dmgFlash * .5})`);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
    };
    R.hud = (c, V, UI) => {
      const me = V.me, u = ui, Z = V.Z;
      c.textBaseline = 'alphabetic';
      const panel = (x, y, w, h, a = .5, rad = 6) => { c.fillStyle = `rgba(10,14,20,${a})`; c.beginPath(); c.roundRect(x, y, w, h, rad * u); c.fill(); };
      const txt = (s, x, y, size, col = '#fff', al = 'left', wt = 700) => { c.font = `${wt} ${size * u}px Arial, Helvetica, sans-serif`; c.textAlign = al; c.fillStyle = col; c.fillText(s, x, y); };
      const ar = 'right';
      const tw = 120 * u;
      panel(W - tw - 8, 8, tw, 26 * u);
      txt('ALIVE', W - tw, 26 * u, 11, '#9fb0c0', 'left', 800); txt(String(V.alive), W - 18, 27 * u, 17, '#fff', ar, 800);
      panel(W - tw - 8, 8 + 30 * u, tw, 26 * u);
      txt('KILLS', W - tw, 26 * u + 30 * u, 11, '#9fb0c0', 'left', 800); txt(String(me.kills || 0), W - 18, 27 * u + 30 * u, 17, '#ffd24a', ar, 800);
      if (Z) {
        const label = me.para === 1 ? 'Jump from the plane' : Z.st === 'wait' ? `Zone closes in ${fmtTime(Z.t)}` : Z.st === 'shrink' ? `Zone shrinking ${fmtTime(Z.t)}` : 'Final zone';
        const w = 170 * u;
        panel(W / 2 - w / 2, 8, w, 22 * u);
        txt(label, W / 2, 24 * u, 13, Z.st === 'shrink' ? '#ff8d86' : '#fff', 'center', 700);
      }
      let fy = 14 * u + 38;
      for (const f of R.feed) {
        const a = clamp(f.a, 0, 1);
        c.globalAlpha = a;
        c.font = `700 ${12.5 * u}px Arial`;
        const w = c.measureText(f.t).width + 14 * u;
        panel(8, fy - 11 * u, w, 18 * u, f.mine ? .72 : .5, 4);
        txt(f.t, 15 * u, fy + 2 * u, 12.5, f.mine ? '#ffe14d' : '#fff');
        c.globalAlpha = 1; fy += 21 * u;
      }
      let my = H * .28;
      for (const m of R.msgs) {
        c.globalAlpha = clamp(m.a, 0, 1);
        c.font = `800 ${20 * u}px Arial`; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.6)'; c.strokeText(m.t, W / 2, my); c.fillStyle = '#fff'; c.fillText(m.t, W / 2, my);
        c.globalAlpha = 1; my += 26 * u;
      }
      const T = R.touch;
      const ms = T ? 96 : 140 * Math.min(1, u * 1.1);
      const mx0 = W - ms - 8, my0 = T ? 70 : H - ms - 8;
      R.mmRect = { x: mx0, y: my0, s: ms };
      const mmap = getMap(Math.round(ms * 2));
      c.save();
      c.beginPath(); c.roundRect(mx0, my0, ms, ms, 6 * u); c.clip();
      c.drawImage(mmap, mx0, my0, ms, ms);
      const k = ms / M;
      if (Z) {
        c.fillStyle = 'rgba(214,40,40,.3)'; c.beginPath(); c.rect(mx0, my0, ms, ms); c.moveTo(mx0 + (Z.cx + Z.r) * k, my0 + Z.cy * k); c.arc(mx0 + Z.cx * k, my0 + Z.cy * k, Math.max(.01, Z.r * k), 0, TAU, true); c.fill('evenodd');
        if (Z.nr > 0 && Z.st !== 'done') { c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.beginPath(); c.arc(mx0 + Z.nx * k, my0 + Z.ny * k, Z.nr * k, 0, TAU); c.stroke(); }
      }
      if (V.drops) for (const d of V.drops) { c.fillStyle = '#ff4136'; c.fillRect(mx0 + d.x * k - 2.5, my0 + d.y * k - 2.5, 5, 5); }
      if (V.plane) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(mx0 + V.plane.x0 * k, my0 + V.plane.y0 * k); c.lineTo(mx0 + V.plane.x1 * k, my0 + V.plane.y1 * k); c.stroke(); c.setLineDash([]); c.fillStyle = '#fff'; c.beginPath(); c.arc(mx0 + V.plane.x * k, my0 + V.plane.y * k, 3, 0, TAU); c.fill(); }
      c.translate(mx0 + me.x * k, my0 + me.y * k); c.rotate(me.a);
      c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, 0); c.lineTo(-3.5, 3.6); c.lineTo(-3.5, -3.6); c.closePath(); c.fill(); c.stroke();
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(mx0, my0, ms, ms, 6 * u); c.stroke();
      if (V.dead) return;
      const bw = T ? Math.min(250, W - 150) : 250 * u, bx = T ? W - 40 - bw : W / 2 - bw / 2, by = T ? H - 166 : H - 34 * u;
      panel(bx - 4, by - 26 * u, bw + 8, 52 * u, .4, 8);
      c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(bx, by, bw, 14 * u);
      const hpf = clamp(me.hp / 100, 0, 1);
      c.fillStyle = me.hp < 25 && (R.t * 4 | 0) % 2 ? '#ff5a4f' : '#7bd35f'; c.fillRect(bx, by, bw * hpf, 14 * u);
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; c.strokeRect(bx, by, bw, 14 * u);
      txt(String(Math.ceil(me.hp)), bx + bw / 2, by + 11.5 * u, 12, '#fff', 'center', 800);
      const sw = bw / 4 - 3 * u;
      for (let i = 0; i < 4; i++) {
        const f = clamp((me.boost - i * 25) / 25, 0, 1);
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(bx + i * (sw + 4 * u), by - 12 * u, sw, 7 * u);
        c.fillStyle = '#ffa733'; c.fillRect(bx + i * (sw + 4 * u), by - 12 * u, sw * f, 7 * u);
      }
      let gx = bx + bw + 14 * u;
      const gear = [['vest', me.vest], ['helm', me.helm], ['pack', me.pack]];
      for (let i = 0; i < 3; i++) {
        const [n, v] = gear[i], x = bx - (T ? 16 : 22 * u) - i * (T ? 25 : 28 * u), y = by + 6 * u;
        c.fillStyle = 'rgba(10,14,20,.6)'; c.beginPath(); c.arc(x, y, 12 * u, 0, TAU); c.fill();
        c.strokeStyle = v ? '#fff' : 'rgba(255,255,255,.2)'; c.lineWidth = 1.5; c.stroke();
        c.save(); c.translate(x, y); c.globalAlpha = v ? 1 : .3; svIcon(c, 'gear', n, v || 1, 8.5 * u); c.restore();
      }
      if (me.act || me.rl) {
        const f = me.act ? me.act.p : me.rl, label = me.act ? me.act.n : 'Reloading';
        const w = 150 * u;
        panel(W / 2 - w / 2, by - 58 * u, w, 22 * u, .55);
        c.fillStyle = me.act ? '#7bd35f' : '#fff'; c.fillRect(W / 2 - w / 2 + 4, by - 58 * u + 15 * u, (w - 8) * f, 4 * u);
        txt(label, W / 2, by - 58 * u + 12 * u, 12, '#fff', 'center');
      }
      const sx = W - 148 * u - 8, rows = 4, rh = 34 * u;
      const sy0 = T ? H - 232 - rows * (rh + 3 * u) : my0 - 8 - rows * (rh + 3 * u);
      for (let i = 0; i < rows; i++) {
        const y = sy0 + i * (rh + 3 * u), cur = me.cur === i;
        panel(sx, y, 148 * u, rh, cur ? .75 : .45);
        if (cur) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.roundRect(sx, y, 148 * u, rh, 6 * u); c.stroke(); }
        const s = me.sl[i];
        let name = '', sub = '', col = '#556';
        if (i < 2 && s) { const g = GUNS[s.g]; name = g.name; sub = `${s.mag} / ${me.am[g.am]}`; col = AM[g.am][1]; }
        else if (i === 2) { name = MELEE[s].n; col = '#c9ced6'; }
        else if (i === 3 && s) { name = THROW[s].n; sub = '×' + me.th[s]; col = THROW[s].col; }
        c.fillStyle = col; c.fillRect(sx + 3, y + 4, 4 * u, rh - 8);
        txt(String(i + 1), sx + 12 * u, y + 13 * u, 10, '#8d9aa8', 'left', 800);
        txt(name || (i < 2 ? 'Empty' : ''), sx + 24 * u, y + 14 * u, 13, name ? '#fff' : '#667', 'left', 700);
        if (sub) txt(sub, sx + 24 * u, y + 28 * u, 12, cur ? '#ffe14d' : '#c5ced8', 'left', 700);
        if (i < 2 && s && me.cur === i && s.mag === 0 && !me.rl) txt('RELOAD', sx + 146 * u - 6, y + 28 * u, 11, '#ff7b6b', 'right', 800);
      }
      R.slotRects = [];
      for (let i = 0; i < rows; i++) R.slotRects.push({ x: sx, y: sy0 + i * (rh + 3 * u), w: 148 * u, h: rh });
      let ix = 8, iy = H - 8;
      R.itemRects = [];
      const chip = (x, y, w, label, col, icon, key, selected) => {
        panel(x, y, w, 28 * u, .55, 5);
        if (selected) { c.strokeStyle = '#ffe14d'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, 28 * u, 5 * u); c.stroke(); }
        c.fillStyle = col; c.fillRect(x + 3, y + 5, 3 * u, 28 * u - 10);
        c.save(); c.translate(x + 19 * u, y + 14 * u); icon(); c.restore();
        txt(label, x + w - 5, y + 19 * u, 13, '#fff', 'right', 800);
        if (key) txt(key, x + 9 * u, y + 24 * u, 8.5, '#aab', 'left', 800);
      };
      let row1 = [];
      HEALK.forEach((h, i) => { if (me.hl[h] > 0) row1.push({ k: 'heal', n: h, c: me.hl[h], key: '7890'[i] }); });
      THROWK.forEach(t => { if (me.th[t] > 0) row1.push({ k: 'throw', n: t, c: me.th[t], key: t === 'frag' ? 'G' : '' }); });
      let x = 8;
      const yRow = T ? H - 200 : H - 8 - 28 * u;
      for (const it of row1) {
        chip(x, yRow, 56 * u, String(it.c), it.k === 'heal' ? HEAL[it.n].col : THROW[it.n].col, () => svIcon(c, it.k, it.n, 0, 10 * u), it.key, false);
        R.itemRects.push({ x, y: yRow, w: 56 * u, h: 28 * u, k: it.k, n: it.n });
        x += 60 * u;
      }
      let row2 = AMK.filter(a => me.am[a] > 0);
      x = 8;
      const yRow2 = yRow - 32 * u;
      for (const a of row2) {
        chip(x, yRow2, 62 * u, String(me.am[a]), AM[a][1], () => svIcon(c, 'ammo', a, 0, 9 * u), '', false);
        x += 66 * u;
      }
      x = 8;
      const yRow3 = yRow2 - 32 * u;
      R.scopeRects = [];
      me.scs.forEach((s, i) => {
        const sel = SCOPES[me.zoom] === s;
        chip(x, yRow3, 50 * u, '', '#f2c94c', () => svIcon(c, 'scope', 'scope', s, 10 * u), '', sel);
        R.scopeRects.push({ x, y: yRow3, w: 50 * u, h: 28 * u, i: SCOPES.indexOf(s) });
        x += 54 * u;
      });
      if (V.prompt) {
        const w = Math.max(190 * u, c.measureText(V.prompt).width + 30 * u);
        const py = T ? 40 : by - 92 * u;
        panel(W / 2 - w / 2, py, w, 26 * u, .65);
        txt(V.prompt, W / 2, py + 18 * u, 14, '#fff', 'center', 700);
      }
    };
    R.bigMap = (c, V) => {
      const s = Math.min(W, H) * .9, x0 = (W - s) / 2, y0 = (H - s) / 2, k = s / M;
      c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, 0, W, H);
      c.drawImage(getMap(Math.round(s)), x0, y0, s, s);
      const Z = V.Z;
      if (Z) {
        c.save(); c.beginPath(); c.rect(x0, y0, s, s); c.clip();
        c.fillStyle = 'rgba(214,40,40,.3)'; c.beginPath(); c.rect(x0, y0, s, s); c.moveTo(x0 + (Z.cx + Z.r) * k, y0 + Z.cy * k); c.arc(x0 + Z.cx * k, y0 + Z.cy * k, Math.max(.01, Z.r * k), 0, TAU, true); c.fill('evenodd');
        if (Z.nr > 0) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(x0 + Z.nx * k, y0 + Z.ny * k, Z.nr * k, 0, TAU); c.stroke(); }
        c.restore();
      }
      if (V.drops) for (const d of V.drops) { c.fillStyle = '#ff4136'; c.fillRect(x0 + d.x * k - 4, y0 + d.y * k - 4, 8, 8); }
      c.save(); c.translate(x0 + V.me.x * k, y0 + V.me.y * k); c.rotate(V.me.a);
      c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(8, 0); c.lineTo(-6, 6); c.lineTo(-6, -6); c.closePath(); c.fill(); c.stroke(); c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x0, y0, s, s);
    };
    return R;
  }

  function ioShell(root, api, o) {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const tall = coarse && innerHeight > innerWidth;
    const W0 = tall ? o.tw : o.dw, H0 = tall ? o.th : o.dh;
    const sh = { coarse, tall, W0, H0, W: W0, H: H0, DPR: 1, handler: null, fs: false };
    const wrap = el('div', 'io-wrap');
    const css = (w, h) => `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
    wrap.style.width = css(W0, H0);
    root.append(wrap);
    const cv = api.canvas(W0, H0, wrap);
    const canvas = cv.canvas;
    canvas.style.width = '100%';
    const DPR0 = canvas.width / W0;
    sh.DPR = DPR0; sh.canvas = canvas; sh.ctx = cv.ctx; sh.wrap = wrap;
    sh.fit = () => {
      const fs = !!wrap.closest('.fs');
      let w = W0, h = H0;
      if (fs) { const A = innerWidth / innerHeight; if (A > W0 / H0) w = Math.round(H0 * A); else h = Math.round(W0 / A); }
      const d = fs ? Math.min(3, Math.max(1, canvas.getBoundingClientRect().width * (devicePixelRatio || 1) / w)) : DPR0;
      if (w === sh.W && h === sh.H && Math.abs(d - sh.DPR) < 0.1 && fs === sh.fs) return false;
      sh.fs = fs; sh.W = w; sh.H = h; sh.DPR = d;
      canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
      canvas.style.aspectRatio = `${w} / ${h}`;
      wrap.style.width = css(W0, H0);
      return true;
    };
    const ui = el('div', 'io-ui io-menu');
    ui.hidden = true;
    wrap.append(ui);
    sh.ui = ui;
    const top = el('div', 'io-top');
    top.hidden = true;
    top.innerHTML = '<button type="button" title="Menu">&#9776;</button>';
    wrap.append(top);
    sh.top = top;
    api.on(ui, 'click', e => { const b = e.target.closest('[data-a]'); if (b && sh.handler) { api.sfx('tap'); sh.handler(b.dataset.a, b); } });
    api.on(top, 'click', e => { if (e.target.closest('button') && sh.onTop) sh.onTop(); });
    sh.show = (html, handler, cls) => {
      ui.className = 'io-ui ' + (cls || 'io-menu');
      ui.innerHTML = html;
      ui.hidden = false;
      sh.handler = handler || null;
      ui.scrollTop = 0;
    };
    sh.hide = () => { ui.hidden = true; ui.innerHTML = ''; sh.handler = null; };
    sh.shown = () => !ui.hidden;
    return sh;
  }
  const ioBtn = (a, label, cls = '') => `<button type="button" class="io-btn ${cls}" data-a="${a}">${label}</button>`;
  const ioStats = rows => `<div class="io-stats">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
  const ioSaveKey = id => 'gameplay:iosave:' + id;
  const ioSaveGet = (id, code) => { try { const x = JSON.parse(sessionStorage.getItem(ioSaveKey(id)) || 'null'); if (x && x.code === code && Date.now() - x.at < 432e5) return x; } catch (e) {} return null; };
  const ioSaveSet = (id, v) => { try { if (v) sessionStorage.setItem(ioSaveKey(id), JSON.stringify(v)); else sessionStorage.removeItem(ioSaveKey(id)); } catch (e) {} };
  const q10 = v => Math.round(v * 10), q20 = v => Math.round(v * 20), q100 = v => Math.round(v * 100);
  const r2 = v => Math.round(v * 100) / 100;

  const SV_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="34" r="14"/><circle cx="46" cy="30" r="5"/><circle cx="43" cy="42" r="5"/><path d="M44 36h14"/><path d="M8 12l8 8M16 12l-8 8"/><circle cx="52" cy="12" r="4"/></svg>';
  const SV_COVER = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#80af49"/><g fill="#6f9a3b" opacity=".5"><circle cx="70" cy="60" r="55"/><circle cx="330" cy="240" r="70"/><circle cx="300" cy="70" r="40"/></g><rect x="40" y="170" width="120" height="90" fill="#a8483a" stroke="#00000066" stroke-width="4"/><g stroke="#923c30" stroke-width="5"><path d="M40 190h120M40 210h120M40 230h120M40 250h120"/></g><g fill="#2c6a2a" stroke="#2a5b24" stroke-width="4"><circle cx="300" cy="190" r="44"/><circle cx="352" cy="70" r="34"/></g><g fill="#3d8a37"><circle cx="288" cy="180" r="20"/><circle cx="314" cy="198" r="18"/><circle cx="346" cy="62" r="14"/></g><rect x="215" y="55" width="32" height="32" fill="#b98650" stroke="#6a4523" stroke-width="4"/><path d="M215 55l32 32M247 55l-32 32" stroke="#6a4523" stroke-width="3"/><g transform="translate(200 150) rotate(-25)"><rect x="18" y="-6" width="52" height="12" fill="#2b2f36" stroke="#111" stroke-width="3"/><circle r="26" fill="#f8c574" stroke="#281806" stroke-width="4"/><circle cx="30" cy="14" r="9" fill="#f8c574" stroke="#281806" stroke-width="3"/><circle cx="62" cy="-9" r="9" fill="#f8c574" stroke="#281806" stroke-width="3"/><circle cx="-4" cy="0" r="13" fill="#79808c" stroke="#281806" stroke-width="3"/></g><circle cx="200" cy="150" r="330" fill="none" stroke="#e03a3a" stroke-width="60" opacity=".35"/></svg>';
  const SV_CSS = baseCss('surviv', '#d9643a', '#6e2a14') + `
.gm-surviv .io-logo{letter-spacing:.01em;color:#ffcf6a;text-shadow:0 4px 0 #8a4a14,0 0 22px rgba(255,200,100,.25)}
.gm-surviv .io-btn.big{background:#e0793e}
.gm-surviv .io-top{right:auto;left:8px}
.gm-surviv .io-btn.go{background:#46a85a}
.gm-surviv .io-list{width:min(420px,100%);display:grid;gap:4px;text-align:left}
.gm-surviv .io-list div{display:flex;justify-content:space-between;background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:13px}
.gm-surviv .io-list div.me{background:rgba(255,207,106,.22)}`;

  const SVENG = {};
  function svMount(root, api) {
    const sh = ioShell(root, api, { dw: 880, dh: 560, tw: 400, th: 640 });
    const { canvas, ctx, coarse } = sh;
    const AU = makeAudio(api);
    const saved = Object.assign({ nick: '', n: 40, skill: 1 }, api.load() || {});
    let S = null, Wm = null, R = null, role = null, st = 'menu', me = 0, spec = -1, acc = 0, menuOpen = false, overShown = false, deathT = 0, bigMap = false, gameOverSent = false, submitted = false, tNow = 0;
    const G = { hooked: false, players: [], bots: false, size: 0, byPid: new Map(), evBuf: [], eid: 0, sendT: 0, saveT: 0, hum: [] };
    let GS = null;
    const keys = new Set();
    const inp = { mx: 0, my: 0, a: 0, f: 0, ad: 20 };
    const ptr = { x: sh.W / 2 + 100, y: sh.H / 2, down: false };
    const touches = new Map();
    const tctl = { move: null, aim: null };
    const tbtn = [];
    let lastSent = '', seq = 0, sendAcc = 0, sendFrames = 0;
    const hist = [];
    const L = (a) => (a && a.length) || 0;

    const lpos = () => (R && R.camx != null) ? [R.camx, R.camy] : [Wm ? Wm.M / 2 : 0, Wm ? Wm.M / 2 : 0];
    const snd = (k, x, y, v = 1) => {
      if (api.muted || st === 'menu') return;
      let vol = v;
      if (x != null) { const [lx, ly] = lpos(), d = Math.hypot(x - lx, y - ly); vol = v * clamp(1 - d / 110, 0, 1) ** 1.4; }
      if (vol < .02) return;
      try { SND[k](vol); } catch (e) {}
    };
    const SND = {
      pistol: v => { AU.noise(.5 * v, .11, 3000, 500, 1.2); AU.tone(190, 60, .09, .25 * v, 'square'); },
      smg: v => { AU.noise(.42 * v, .08, 3400, 700, 1.1); AU.tone(220, 80, .06, .18 * v, 'square'); },
      ar: v => { AU.noise(.6 * v, .13, 2400, 360, .9); AU.tone(150, 50, .11, .3 * v, 'sawtooth'); },
      lmg: v => { AU.noise(.65 * v, .14, 2000, 300, .8); AU.tone(120, 45, .12, .34 * v, 'sawtooth'); },
      sniper: v => { AU.noise(.95 * v, .36, 1700, 130, .7); AU.tone(90, 32, .32, .5 * v, 'sawtooth'); },
      shotgun: v => { AU.noise(.95 * v, .26, 1500, 180, .6); AU.tone(110, 38, .22, .5 * v, 'square'); },
      hit: v => { AU.tone(240, 90, .08, .22 * v, 'triangle'); },
      imp: v => { AU.noise(.28 * v, .06, 2500, 900, 2); },
      brk: v => { AU.noise(.5 * v, .22, 1800, 200, .8); },
      ex: v => { AU.noise(1.1 * v, .8, 700, 60, .6, 'lowpass'); AU.tone(80, 25, .6, .6 * v, 'sawtooth'); },
      rl: v => { AU.noise(.3 * v, .05, 2500, 1500, 3); AU.noise(.3 * v, .05, 1800, 1000, 3, 'bandpass', .22); },
      pick: v => { AU.tone(560, 900, .07, .18 * v, 'triangle'); },
      heal: v => { AU.tone(420, 840, .18, .22 * v, 'sine'); },
      sw: v => { AU.noise(.3 * v, .09, 1200, 400, 1.5, 'highpass'); },
      th: v => { AU.noise(.2 * v, .07, 1000, 500, 1.5); },
      zone: v => { AU.tone(320, 200, .7, .25 * v, 'square'); AU.tone(320, 200, .7, .2 * v, 'square', .3); },
      drop: v => { AU.tone(500, 700, .15, .25 * v, 'triangle'); AU.tone(500, 700, .15, .25 * v, 'triangle', .22); },
      kill: v => { AU.tone(300, 600, .12, .22 * v, 'square'); },
      win: v => { [523, 659, 784, 1047].forEach((f, i) => AU.tone(f, f, .2, .25, 'triangle', i * .14)); },
      lose: v => { AU.tone(300, 120, .5, .3, 'sawtooth'); },
      tap: v => { AU.tone(700, 500, .04, .12, 'square'); }
    };
    api.on(window, 'pointerdown', () => { try { AU.noise(0, .01, 100, 100); } catch (e) {} }, { once: true });

    const nameOf = id => (S ? S.P[id] && S.P[id].name : GS && GS.names[id]) || '?';
    const meId = () => role === 'guest' ? GS.me : me;

    function onEv(e, own) {
      if (!R) return;
      const pid = meId();
      switch (e.k) {
        case 'sh': { const g = GUNS[e.g]; snd(g.cls, e.x, e.y, e.id === pid ? .8 : 1); if (e.id === pid) R.shake = Math.max(R.shake, g.cls === 'sniper' ? .5 : g.cls === 'shotgun' ? .35 : .08); break; }
        case 'hit': R.addFx(e); snd('hit', e.x, e.y, .8); if (e.v === pid) { R.dmgFlash = 1; R.shake = Math.max(R.shake, .3); } break;
        case 'imp': R.addFx(e); snd('imp', e.x, e.y, .6); break;
        case 'brk': { R.addFx(e); snd('brk', e.x, e.y, .7); if (role === 'guest' && GS.W) { const o = GS.W.byId(e.i); if (o) o.dead = true; } break; }
        case 'ohit': { if (role === 'guest' && GS.W) { const o = GS.W.byId(e.i); if (o && o.hp < 1e8) o.hp = Math.max(1, o.hp - 8); } snd('imp', e.x, e.y, .5); break; }
        case 'ex': R.addFx(e); snd('ex', e.x, e.y, 1); break;
        case 'land': R.addFx(e); break;
        case 'rl': snd('rl', e.x, e.y, .5); break;
        case 'heal': snd('heal', e.x, e.y, .6); break;
        case 'sw': snd('sw', e.x, e.y, .6); break;
        case 'th': snd('th', e.x, e.y, .6); break;
        case 'smk': snd('th', e.x, e.y, .9); break;
        case 'zone': R.msg(e.m, 5); snd('zone', null, null, .6); break;
        case 'dropann': R.msg('Airdrop incoming!', 4); snd('drop', null, null, .6); break;
        case 'drop': { if (role === 'guest' && GS.W && !GS.W.byId(e.id)) GS.W.add({ id: e.id, i: e.id, dyn: true, t: 'drop', k: 'c', x: e.x, y: e.y, r: 1.7, solid: true, bl: true, hp: 260, mhp: 260, dead: false, q: 0, lt: 'drop' }); break; }
        case 'zhit': if (e.v === pid) { R.dmgFlash = Math.max(R.dmgFlash, .5); } break;
        case 'kill': {
          const kn = e.b >= 0 ? nameOf(e.b) : '', vn = nameOf(e.v);
          const txt = e.b >= 0 && e.b !== e.v ? `${kn}  [${e.w || 'Fists'}]  ${vn}` : e.w === 'The Red Zone' ? `${vn} died in the red zone` : `${vn} died`;
          R.feedAdd(txt, e.b === pid || e.v === pid);
          if (e.v === pid && role === 'guest' && GS.mine) GS.mine.place = e.pl + 1;
          if (e.b === pid && e.v !== pid) { R.msg(`You killed ${vn}`, 3); snd('kill', null, null, .8); }
          break;
        }
        case 'win': break;
      }
    }

    function wcode(p) {
      if (p.act) return -1;
      if (p.cur < 2) { const s = p.sl[p.cur]; return s ? s.g : -1; }
      if (p.cur === 2) return 100 + MELEEK.indexOf(p.sl[2]);
      return 200 + (p.sl[3] === 'smoke' ? 1 : 0);
    }
    const mePack = p => ({
      id: p.id, x: p.x, y: p.y, a: p.a, vx: p.vx, vy: p.vy, sf: p.sf || 1, hp: Math.round(p.hp * 10) / 10, boost: Math.round(p.boost), vest: p.vest, helm: p.helm, pack: p.pack,
      am: p.am, hl: p.hl, th: p.th, scs: p.scs, zoom: p.sc, sl: p.sl, cur: p.cur, kills: p.kills, dmg: Math.round(p.dmg), alive: p.alive, para: p.para, pk: p.pk || 0, place: p.place,
      rl: p.rld ? Math.max(.02, 1 - p.rld.t / p.rld.tot) : 0, act: p.act ? { p: clamp(1 - p.act.t / p.act.tot, 0, 1), n: HEAL[p.act.k].n } : null
    });

    function pickSpec(p, dir) {
      const al = S.P.filter(q => q.alive);
      if (!al.length) return -1;
      if (!dir) { const k = p.by >= 0 ? S.P[p.by] : null; if (k && k.alive) return k.id; return al[0].id; }
      const ids = al.map(q => q.id);
      let i = ids.indexOf(spec);
      i = i < 0 ? 0 : (i + dir + ids.length) % ids.length;
      return ids[i];
    }

    function newSim(seed, humans, n, skill, W, skipLoot) {
      Wm = W || svGen(seed);
      S = SvSim(seed, { n, humans, skill, W: Wm, skipLoot });
      R = svRenderer(ctx, sh.W, sh.H, Wm, {});
      R.touch = coarse; R.resize(sh.W, sh.H);
      R.big = false; bigMap = false;
      acc = 0; spec = -1; overShown = false; deathT = 0; gameOverSent = false; submitted = false;
      S.seed0 = seed;
    }

    function startSolo() {
      role = 'solo'; G.byPid.clear();
      const seed = (Math.random() * 4294967295) >>> 0;
      newSim(seed, [{ name: (saved.nick || 'You').slice(0, 16), pid: null }], +saved.n || 40, +saved.skill);
      me = 0; beginPlay();
    }
    function beginPlay() {
      st = 'play'; sh.hide(); sh.top.hidden = false; menuOpen = false;
      sh.canvas.focus && sh.canvas.focus();
      keys.clear(); touches.clear(); tctl.move = tctl.aim = null;
      if (R) { R.camx = null; R.feed.length = 0; R.msgs.length = 0; R.fx.length = 0; }
      api.score(0); api.label && api.label('Kills');
      R.msg(role === 'guest' ? 'Online game' : 'Battle royale: ' + S.n + ' players', 4);
    }

    function menuHtml() {
      const hint = coarse ? 'Left stick moves, right stick aims and fires. Tap slots to switch weapons, tap items to heal.' : '<kbd>WASD</kbd> move · mouse aim and fire · <kbd>F</kbd> pick up / jump · <kbd>R</kbd> reload · <kbd>1-4</kbd> weapons · <kbd>7-0</kbd> heal · <kbd>G</kbd> grenade · <kbd>Z</kbd> scope · <kbd>M</kbd> map';
      return `<div class="io-logo">SURVIV</div><div class="io-sub">Drop from the plane, loot buildings, fight to be the <b>last one standing</b> as the red zone closes in.</div>
<input class="io-nick" maxlength="16" placeholder="Nickname" value="${esc(saved.nick || '')}" data-nick>
<div class="io-row"><span class="io-lab">Players</span>${segHtml('n', [[30, '30'], [40, '40'], [50, '50']], saved.n)}</div>
<div class="io-row"><span class="io-lab">Bots</span>${segHtml('skill', [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], saved.skill)}</div>
<div class="io-row">${ioBtn('play', 'Play vs bots', 'big go')}${ioBtn('online', 'Play online', 'big')}</div><div class="io-hint">${hint}</div>`;
    }
    function showMenu() {
      st = 'menu'; role = null; S = null; GS = null; R = null; sh.top.hidden = true; menuOpen = false;
      G.byPid.clear();
      sh.show(menuHtml(), a => {
        const nk = sh.ui.querySelector('[data-nick]');
        if (nk) { saved.nick = nk.value.trim().slice(0, 16); api.save(saved); }
        if (a === 'play') startSolo(); else if (a === 'online') goOnline();
      });
      bindSeg(sh.ui, (k, v) => { saved[k] = +v; api.save(saved); });
    }

    function resultsTable(upTo = 8) {
      const arr = S.P.slice().sort((a, b) => (a.place || 99) - (b.place || 99)).slice(0, upTo);
      return arr.map(p => [p.place || 1, p.name, p.kills, Math.round(p.dmg), p.id]);
    }
    function overPanel(win, rows, mine) {
      const rank = mine && mine.place || (win ? 1 : 0);
      const title = win ? 'Winner Winner Chicken Dinner!' : 'You died';
      const sub = win ? 'You are the last one standing.' : `You placed <b>#${rank}</b> of ${GS ? GS.n : S.n}.`;
      const list = `<div class="io-list">${rows.map(r => `<div class="${r[4] === meId() ? 'me' : ''}"><span>#${r[0]} ${esc(r[1])}</span><span>${r[2]} kills · ${r[3]} dmg</span></div>`).join('')}</div>`;
      return `<div class="io-kick">${win ? 'Victory' : 'Eliminated'}</div><div class="io-title">${title}</div><div class="io-sub">${sub}</div>${ioStats([['Kills', mine ? mine.kills : 0], ['Damage', mine ? mine.dmg : 0], ['Place', '#' + rank]])}${rows && rows.length ? list : ''}`;
    }
    function endButtons(spectatable) {
      const b = [];
      if (spectatable) b.push(ioBtn('spec', 'Spectate', 'alt'));
      if (role === 'solo') { b.push(ioBtn('again', 'Play again', 'go')); b.push(ioBtn('menu', 'Menu', 'alt')); }
      else if (role === 'host') { b.push(ioBtn('lobby', 'Back to lobby', 'go')); b.push(ioBtn('leave', 'Leave', 'alt')); }
      else b.push(ioBtn('leave', 'Leave', 'alt'));
      return `<div class="io-row">${b.join('')}</div>`;
    }
    function endHandler(a) {
      if (a === 'spec') { st = 'spec'; sh.hide(); return; }
      if (a === 'again') { startSolo(); return; }
      if (a === 'menu') { showMenu(); return; }
      if (a === 'lobby') { goOnline(); return; }
      if (a === 'leave') { leaveOnline(); }
    }
    function showDeath() {
      if (st !== 'play') return;
      st = 'dead';
      const p = role === 'guest' ? GS.mine || GS.meb : S.P[me];
      const rows = role === 'guest' ? [] : resultsTable(5);
      sh.show(overPanel(false, rows, p), endHandler, 'io-ui io-panel');
      sh.ui.insertAdjacentHTML('beforeend', endButtons(true));
      snd('lose', null, null, 1);
      if (role === 'solo' && !submitted) { submitted = true; api.submit(p.kills); }
    }
    function showOver(winId, rows) {
      if (overShown) return;
      overShown = true;
      const win = winId === meId();
      const p = role === 'guest' ? GS.mine || GS.meb : S.P[me];
      st = 'over';
      const head = win ? overPanel(true, rows, p) : `<div class="io-kick">Game over</div><div class="io-title">${esc(nameOf(winId))} wins</div><div class="io-sub">Final standings</div>${ioStats([['Your kills', p ? p.kills : 0], ['Your place', '#' + ((p && p.place) || '-')]])}<div class="io-list">${rows.map(r => `<div class="${r[4] === meId() ? 'me' : ''}"><span>#${r[0]} ${esc(r[1])}</span><span>${r[2]} kills · ${r[3]} dmg</span></div>`).join('')}</div>`;
      sh.show(head + endButtons(false), endHandler, 'io-ui io-panel');
      snd(win ? 'win' : 'lose', null, null, 1);
      if (role === 'solo' && !submitted && p) { submitted = true; api.submit(p.kills); }
      if (role === 'host') ioSaveSet('surviv', null);
    }

    function inGameMenu() {
      if (st !== 'play' && st !== 'dead' && st !== 'spec') return;
      menuOpen = true;
      sh.show(`<div class="io-kick">Paused</div><div class="io-title">Menu</div><div class="io-row">${ioBtn('resume', 'Resume', 'go')}${ioBtn('quit', role === 'solo' ? 'Quit to menu' : 'Leave game', 'alt')}</div>`, a => {
        menuOpen = false; sh.hide();
        if (a === 'quit') { if (role === 'solo') showMenu(); else leaveOnline(); }
      }, 'io-ui io-panel');
    }
    sh.onTop = () => { if (menuOpen) { menuOpen = false; sh.hide(); } else inGameMenu(); };

    const doAct = a => {
      if (st !== 'play' && st !== 'spec') return;
      if (role === 'guest') { if (st === 'play') api.net.send({ t: 'act', a }); return; }
      if (S && S.P[me]) S.act(S.P[me], a);
    };

    function nearestLoot(list, x, y) {
      let best = null, bd = 9.6, bp = -1;
      for (const l of list) {
        const d = (l.x - x) ** 2 + (l.y - y) ** 2;
        if (d > bd) continue;
        const pr = l.k === 'gun' || l.k === 'melee' ? 2 : 1;
        if (pr > bp || (pr === bp && d < bd)) { best = l; bd = d; bp = pr; }
      }
      return best;
    }

    function readInput() {
      let mx = 0, my = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
      const m = Math.hypot(mx, my) || 1;
      mx /= m; my /= m;
      let f = ptr.down ? 1 : 0;
      const p = role === 'guest' ? GS.pr : S && S.P[me];
      let ox = sh.W / 2, oy = sh.H / 2;
      if (p && R && R.vx) { ox = R.vx(p.x); oy = R.vy(p.y); }
      const sc = R && R.sc || 8;
      let a = Math.atan2(ptr.y - oy, ptr.x - ox), ad = Math.hypot(ptr.x - ox, ptr.y - oy) / sc;
      if (tctl.move) { const t = tctl.move, dx = t.x - t.ox, dy = t.y - t.oy, d = Math.hypot(dx, dy), k = Math.min(1, d / 46); if (d > 6) { mx = dx / d * k; my = dy / d * k; } else mx = my = 0; }
      if (tctl.aim) { const t = tctl.aim, dx = t.x - t.ox, dy = t.y - t.oy, d = Math.hypot(dx, dy); if (d > 10) { a = Math.atan2(dy, dx); ad = 5 + Math.min(1, d / 56) * 26; t.lastA = a; } else if (t.lastA != null) a = t.lastA; f = d > 36 ? 1 : 0; }
      inp.mx = mx; inp.my = my; inp.a = a; inp.f = f; inp.ad = ad;
    }

    function pointerHud(x, y) {
      if (!R) return false;
      const hit = r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      if (R.mmRect && x >= R.mmRect.x && x <= R.mmRect.x + R.mmRect.s && y >= R.mmRect.y && y <= R.mmRect.y + R.mmRect.s) { bigMap = !bigMap; return true; }
      if (bigMap) { bigMap = false; return true; }
      for (const b of tbtn) if (Math.hypot(x - b.x, y - b.y) <= b.r) { b.fn(); return true; }
      if (R.slotRects) for (let i = 0; i < R.slotRects.length; i++) if (hit(R.slotRects[i])) { doAct({ k: 'sw', i }); return true; }
      if (R.itemRects) for (const r of R.itemRects) if (hit(r)) { if (r.k === 'heal') doAct({ k: 'use', n: r.n }); else { doAct({ k: 'sw', i: 3 }); } return true; }
      if (R.scopeRects) for (const r of R.scopeRects) if (hit(r)) { doAct({ k: 'scope', i: r.i }); return true; }
      if (R.specRects) for (const r of R.specRects) if (hit(r)) { r.fn(); return true; }
      return false;
    }
    const cvXY = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * sh.W / r.width, y: (e.clientY - r.top) * sh.H / r.height }; };
    api.on(canvas, 'contextmenu', e => e.preventDefault());
    api.on(canvas, 'pointerdown', e => {
      if (st !== 'play' && st !== 'spec' && st !== 'dead') return;
      if (sh.shown()) return;
      const p = cvXY(e);
      ptr.x = p.x; ptr.y = p.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      if (pointerHud(p.x, p.y)) { e.preventDefault(); return; }
      if (e.pointerType === 'touch') {
        const t = { id: e.pointerId, x: p.x, y: p.y, ox: p.x, oy: p.y };
        if (p.x < sh.W / 2) { if (!tctl.move) tctl.move = t; } else if (!tctl.aim) tctl.aim = t;
        touches.set(e.pointerId, t);
      } else if (e.button === 0) ptr.down = true;
      e.preventDefault();
    });
    api.on(canvas, 'pointermove', e => {
      const p = cvXY(e);
      if (e.pointerType !== 'touch') { ptr.x = p.x; ptr.y = p.y; return; }
      const t = touches.get(e.pointerId);
      if (t) { t.x = p.x; t.y = p.y; }
    });
    const pup = e => {
      ptr.down = false;
      const t = touches.get(e.pointerId);
      if (t) { touches.delete(e.pointerId); if (tctl.move === t) tctl.move = null; if (tctl.aim === t) tctl.aim = null; }
    };
    api.on(canvas, 'pointerup', pup);
    api.on(canvas, 'pointercancel', pup);
    api.on(canvas, 'wheel', e => { if (st === 'play') { e.preventDefault(); doAct({ k: 'cyc', d: e.deltaY > 0 ? 1 : -1 }); } }, { passive: false });
    api.on(window, 'blur', () => { keys.clear(); ptr.down = false; });
    api.on(window, 'keyup', e => keys.delete(e.code));
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (st !== 'play' && st !== 'spec') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const c = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) { keys.add(c); e.preventDefault(); if (st === 'spec' && (c === 'KeyA' || c === 'ArrowLeft') && !e.repeat) specStep(-1); if (st === 'spec' && (c === 'KeyD' || c === 'ArrowRight') && !e.repeat) specStep(1); return; }
      if (e.repeat) return;
      if (c === 'Space' || c === 'KeyF') { e.preventDefault(); if (c === 'KeyF' && !(R && R.curPlane)) doAct({ k: 'pick' }); doAct({ k: 'jump' }); return; }
      if (c === 'KeyR') doAct({ k: 'rl' });
      else if (c >= 'Digit1' && c <= 'Digit4') doAct({ k: 'sw', i: +c.slice(5) - 1 });
      else if (c === 'Digit7') doAct({ k: 'use', n: 'bandage' });
      else if (c === 'Digit8') doAct({ k: 'use', n: 'medkit' });
      else if (c === 'Digit9') doAct({ k: 'use', n: 'soda' });
      else if (c === 'Digit0') doAct({ k: 'use', n: 'pills' });
      else if (c === 'KeyQ') doAct({ k: 'last' });
      else if (c === 'KeyG') doAct({ k: 'sw', i: 3 });
      else if (c === 'KeyZ') doAct({ k: 'scyc', d: 1 });
      else if (c === 'KeyX') doAct({ k: 'cancel' });
      else if (c === 'KeyM' || c === 'Tab') { bigMap = !bigMap; e.preventDefault(); }
    });

    function specStep(d) {
      if (role === 'guest') api.net.send({ t: 'spec', d });
      else if (S) spec = pickSpec(S.P[me], d);
    }

    function fillPlayerRec(r, p, x, y, a) {
      r.id = p.id; r.x = x; r.y = y; r.a = a; r.name = nameOf(p.id);
      return r;
    }

    function buildViewLocal(alpha) {
      const mp = S.P[me];
      let fp = mp;
      if (!mp.alive) {
        if (spec < 0 || !S.P[spec].alive) spec = pickSpec(mp, 0);
        fp = S.P[spec] || mp;
      }
      const P = [];
      const z = S.z;
      const pr = [];
      for (const p of S.P) {
        if (!p.alive) continue;
        const x = lerp(p.px, p.x, alpha), y = lerp(p.py, p.y, alpha);
        const r = { id: p.id, x, y, a: p.a, w: wcode(p), para: p.para, pack: p.pack, vest: p.vest, helm: p.helm, name: p.id === fp.id ? '' : p.name, fl: p.fl, sw: p.swT > 0 ? p.swT : 0, act: p.act ? HEALK.indexOf(p.act.k) + 1 : 0, bot: p.bot };
        P.push(r);
        if (p === fp) pr.push(r);
      }
      const fr = pr[0] || { x: fp.x, y: fp.y, a: fp.a };
      const m = mePack(fp);
      m.x = fr.x; m.y = fr.y;
      const nl = nearestLoot(S.loot, fp.x, fp.y);
      const pl = S.plane, pf = S.t / pl.dur;
      const V = {
        me: m, cx: fr.x, cy: fr.y, P, L: S.loot, G: S.gren, S: S.smk, B: S.bul.map(b => ({ x: b.x - b.vx * (1 - alpha) * DT * .0, y: b.y, a: Math.atan2(b.vy, b.vx), g: b.g })), Z: zoneView(z), alive: S.alive, phase: S.phase === 'plane' ? 'plane' : 'play',
        drops: S.drops.map(d => ({ x: d.x, y: d.y, f: (S.t - d.t0) / d.fall, landed: d.landed })), plane: pf < 1.2 ? { x: lerp(pl.x0, pl.x1, pf), y: lerp(pl.y0, pl.y1, pf), a: pl.a, x0: pl.x0, y0: pl.y0, x1: pl.x1, y1: pl.y1 } : null,
        nearLoot: nl, names: true, dead: !mp.alive, fp, snapCam: false
      };
      V.prompt = promptFor(nl, m, V.plane);
      return V;
    }
    const zoneView = z => ({ cx: z.cx, cy: z.cy, r: z.r, nx: z.nx, ny: z.ny, nr: z.nr, st: z.st, t: z.t, ph: z.ph });
    function promptFor(nl, m, plane) {
      if (m.para === 1) return coarse ? '' : 'Press F or Space to jump';
      if (!m.alive) return '';
      if (nl) {
        const slotFree = !m.sl[0] || !m.sl[1];
        const verb = nl.k === 'gun' && !slotFree ? 'Swap for' : 'Pick up';
        return `${coarse ? '' : 'F  '}${verb} ${lootName(nl)}`;
      }
      return '';
    }

    function hostFrame(dt, now) {
      if (menuOpen && role === 'solo') return;
      readInput();
      const mp = S.P[me];
      if (mp.alive) { const I = mp.in; I.mx = inp.mx; I.my = inp.my; I.a = inp.a; I.f = inp.f; I.ad = inp.ad; }
      acc += dt;
      let n = 0;
      while (acc >= DT && n < 4) {
        acc -= DT; n++;
        S.step(DT);
        if (S.ev.length) for (const e of S.ev) { hostEv(e); }
        S.ev.length = 0;
        if (role === 'host') hostNet();
      }
      if (role === 'host') for (const g of G.byPid.values()) { const q = S.P[g.i]; if (q && now - (g.inAt || now) > 1200) { q.in.mx = q.in.my = 0; q.in.f = 0; } }
      if (n === 4) acc = 0;
      R.update(dt);
      const mp2 = S.P[me];
      if (st === 'play' && !mp2.alive && !deathT) { deathT = now; }
      if (st === 'play' && !mp2.alive && now - deathT > 1500 && S.phase !== 'over') showDeath();
      if (S.phase === 'over' && !overShown && S.t - (S.overT || S.t) > 1.4) {
        const rows = resultsTable(8);
        if (role === 'host') api.net.send({ t: 'over', w: S.winner, rows, res: S.P.map(p => [p.place, p.kills, Math.round(p.dmg)]) }, false);
        showOver(S.winner, rows);
      }
      if (role !== 'guest' && mp2.kills !== lastKills) { lastKills = mp2.kills; api.score(lastKills); }
    }
    let lastKills = 0;
    function hostEv(e) {
      onEv(e);
      if (role === 'host') { e.i2 = ++G.eid; G.evBuf.push(e); }
      if (e.k === 'win') snd('win', null, null, 0);
    }

    function wireInit(pid) {
      const d = S.dump();
      return { t: 'init', seed: S.seed0, n: S.n, me: G.byPid.get(pid).i, names: S.P.map(p => p.name), bots: S.P.map(p => p.bot ? 1 : 0), st: { t: S.t, brk: d.brk, dyn: d.dyn, hps: d.hps, plane: S.plane, phase: S.phase, z: S.z } };
    }
    const EV_GLOBAL = { kill: 1, win: 1, zone: 1, dropann: 1, drop: 1, brk: 1 };
    const slimEv = e => { const o = {}; for (const k in e) { if (k === 'i2') continue; const v = e[k]; o[k] = typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v; } return o; };
    function snapFor(g) {
      const p = S.P[g.i];
      let fp = p;
      if (!p.alive) {
        if (g.spec < 0 || !S.P[g.spec].alive) g.spec = pickSpec(p, 0);
        fp = S.P[g.spec] || p;
      }
      const cx = fp.x, cy = fp.y, ri = ZW[fp.sc] * 1.3 + 6, ri2 = ri + 12;
      const d = { t: 's', k: Math.round(S.t * 1000) / 1000, q: g.ack || 0, al: S.alive, ph: S.phase === 'plane' ? 0 : S.phase === 'play' ? 1 : 2, sp: fp.id, c: [q10(cx), q10(cy)] };
      const Pn = [];
      for (const q of S.P) {
        if (!q.alive || q === p) continue;
        if (Math.abs(q.x - cx) > ri || Math.abs(q.y - cy) > ri) continue;
        Pn.push([q.id, q20(q.x), q20(q.y), q100(q.a), wcode(q), (q.para & 3) | (q.fl > 0 ? 4 : 0) | (q.swT > 0 ? 8 : 0) | (q.act ? 16 : 0) | (q.inB ? 32 : 0), q.vest | (q.helm << 2) | (q.pack << 4)]);
      }
      d.P = Pn;
      const Bn = [];
      for (const b of S.bul) { if (Math.abs(b.x - cx) > ri || Math.abs(b.y - cy) > ri) continue; Bn.push([b.id, q10(b.x), q10(b.y), q100(Math.atan2(b.vy, b.vx)), b.g]); }
      d.B = Bn;
      const Gn = [];
      for (const q of S.gren) { if (Math.abs(q.x - cx) > ri || Math.abs(q.y - cy) > ri) continue; Gn.push([q.id, q.k === 'frag' ? 0 : 1, q10(q.x), q10(q.y)]); }
      d.G = Gn;
      const Sn = [];
      for (const q of S.smk) { if (Math.abs(q.x - cx) > ri + 8 || Math.abs(q.y - cy) > ri + 8) continue; Sn.push([q.id, q10(q.x), q10(q.y), Math.round(q.t * 10) / 10, q.r]); }
      d.S = Sn;
      const kn = g.known, stp = ++g.ls, la = [], lr = [];
      for (const l of S.loot) {
        const dx = Math.abs(l.x - cx), dy = Math.abs(l.y - cy);
        if (dx > ri2 || dy > ri2) continue;
        const v = kn.get(l.id);
        if (v) { if (dx <= ri2 && dy <= ri2) v.s = stp; if (v.c !== l.c) { v.c = l.c; la.push([l.id, l.k, l.n, l.c, q10(l.x), q10(l.y)]); } }
        else if (dx <= ri && dy <= ri) { kn.set(l.id, { c: l.c, s: stp }); la.push([l.id, l.k, l.n, l.c, q10(l.x), q10(l.y)]); }
      }
      for (const [id, v] of kn) if (v.s !== stp) { lr.push(id); kn.delete(id); }
      d.la = la; d.lr = lr;
      const z = S.z;
      d.Z = [r2(z.cx), r2(z.cy), r2(z.r), r2(z.nx), r2(z.ny), r2(z.nr), z.ph, z.st === 'wait' ? 0 : z.st === 'shrink' ? 1 : 2, Math.round(z.t * 10) / 10];
      d.D = S.drops.map(q => [q.id, q10(q.x), q10(q.y), q10(q.t0), q.landed ? 1 : 0]);
      d.me = mePack(fp);
      const ev = [];
      for (const e of G.evBuf) {
        if (e.i2 <= g.lastEv) continue;
        if (!EV_GLOBAL[e.k] && e.x != null && (Math.abs(e.x - cx) > ri + 30 || Math.abs(e.y - cy) > ri + 30)) continue;
        ev.push(slimEv(e));
      }
      g.lastEv = G.eid;
      d.E = ev;
      return d;
    }
    function hostNet() {
      if (++G.sendT % 2) return;
      while (G.evBuf.length && G.evBuf[0].i2 < G.eid - 400) G.evBuf.shift();
      for (const g of G.byPid.values()) {
        if (!g.ready || !api.net.connected) continue;
        const d = snapFor(g);
        api.net.sendTo(g.pid, d, !d.E.length);
      }
      if (S.t - G.saveT > 2.5) { G.saveT = S.t; hostSave(); }
    }
    function hostSave() {
      if (role !== 'host' || !S || S.phase === 'over') return;
      ioSaveSet('surviv', { code: api.net.code, at: Date.now(), seed: S.seed0, n: S.n, skill: S.skill, hum: G.hum, dump: S.dump() });
    }

    function hookNet() {
      if (G.hooked) return;
      G.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !role) return;
        if (role === 'host') hostData(d, from); else if (role === 'guest') guestData(d);
      });
      api.net.on('leave', pl => { if (role === 'host' && pl) seatToBot(pl.id); });
      api.net.on('rejoin', pl => {
        if (role !== 'host' || !pl || !S) return;
        const g = G.byPid.get(pl.id);
        if (!g) return;
        g.known.clear(); g.lastEv = G.eid; g.ready = false;
        api.net.sendTo(pl.id, wireInit(pl.id));
      });
      api.net.on('lobby', () => { if (role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (role !== 'guest') return;
        role = null; GS = null; st = 'left'; sh.top.hidden = true;
        sh.show(`<div class="io-kick">Online</div><div class="io-title">${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</div><div class="io-sub">${why === 'host-left' ? 'The host ended the game.' : why === 'kicked' ? 'The host removed you from the party.' : 'The connection to the host was lost.'}</div><div class="io-row">${ioBtn('online', 'Online lobby', 'go')}${ioBtn('menu', 'Menu', 'alt')}</div>`, a => { if (a === 'online') goOnline(); else showMenu(); }, 'io-ui io-panel');
        snd('lose', null, null, 1);
      });
    }
    function hostData(d, from) {
      const g = G.byPid.get(from);
      if (d.t === 'hi') {
        if (!g || !S) return;
        g.known.clear(); g.lastEv = G.eid; g.ready = false;
        api.net.sendTo(from, wireInit(from));
        return;
      }
      if (!g || !S) return;
      const p = S.P[g.i];
      if (d.t === 'rdy') { g.ready = true; return; }
      if (d.t === 'in') {
        if (!p || !p.alive) { g.ack = d.q | 0; return; }
        if ((d.q | 0) < (g.ack | 0)) return;
        g.ack = d.q | 0; g.inAt = tNow;
        const I = p.in;
        I.mx = clamp(+d.mx || 0, -1, 1); I.my = clamp(+d.my || 0, -1, 1);
        if (Number.isFinite(d.a)) I.a = d.a;
        I.f = d.f ? 1 : 0; I.ad = clamp(+d.ad || 20, 3, 36);
      } else if (d.t === 'act') {
        const a = d.a;
        if (!a || typeof a.k !== 'string') return;
        const ok = { rl: 1, sw: 1, last: 1, cyc: 1, use: 1, pick: 1, scope: 1, scyc: 1, cancel: 1, jump: 1 };
        if (!ok[a.k]) return;
        const c = { k: a.k };
        if (a.i != null) c.i = a.i | 0;
        if (a.d != null) c.d = a.d < 0 ? -1 : 1;
        if (a.n != null) { if (!HEAL[a.n]) return; c.n = a.n; }
        S.act(p, c);
      } else if (d.t === 'spec') {
        if (p && !p.alive) g.spec = pickSpecFor(g, p, d.d < 0 ? -1 : 1);
      }
    }
    function pickSpecFor(g, p, dir) {
      const al = S.P.filter(q => q.alive);
      if (!al.length) return -1;
      if (!dir) { const k = p.by >= 0 ? S.P[p.by] : null; return k && k.alive ? k.id : al[0].id; }
      const ids = al.map(q => q.id);
      let i = ids.indexOf(g.spec);
      i = i < 0 ? 0 : (i + dir + ids.length) % ids.length;
      return ids[i];
    }
    function seatToBot(pid) {
      const g = G.byPid.get(pid);
      if (!g || !S) return;
      const p = S.P[g.i];
      G.byPid.delete(pid);
      if (!p) return;
      p.pid = null; p.bot = true; p.br = botBrain(p, Math.random); p.in.f = 0; p.in.mx = p.in.my = 0;
      api.toast && api.toast(p.name + ' left. A bot takes over.');
    }

    async function goOnline() {
      hookNet();
      st = 'wait'; role = null; S = null; GS = null; R = null; sh.top.hidden = true;
      sh.hide();
      const r = await api.net.room({ title: 'Surviv.io', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 2, max: 16, bots: true });
      if (!api.alive) return;
      if (!r) { showMenu(); return; }
      if (r.role === 'host') {
        role = 'host';
        G.players = r.players.slice(0, 16); G.bots = !!r.bots; G.size = +r.size || G.players.length;
        const sv = ioSaveGet('surviv', api.net.code);
        if (sv && sv.dump && sv.dump.phase !== 'over') {
          const names = G.players.slice(1).map(x => x.name), hum = sv.hum || [];
          const rest = hum.slice(1);
          const matched = names.every(nm => rest.includes(nm));
          if (matched) {
            const lost = rest.filter(nm => !names.includes(nm)).length;
            sh.show(`<div class="io-kick">Online</div><div class="io-title">Game in progress</div><div class="io-sub">Saved game: ${sv.dump.alive} players left.${lost ? ' ' + lost + ' missing player' + (lost > 1 ? 's' : '') + ' will be replaced by bots.' : ''}</div><div class="io-row">${ioBtn('go', 'Resume game', 'go')}${ioBtn('new', 'New game', 'alt')}${ioBtn('leave', 'Leave', 'alt')}</div>`, a => {
              if (a === 'go') hostStart(sv); else if (a === 'new') hostStart(null); else leaveOnline();
            }, 'io-ui io-panel');
            return;
          }
        }
        hostStart(null);
      } else {
        role = 'guest';
        sh.show('<div class="io-kick">Online</div><div class="io-title">Connected</div><div class="io-sub">Waiting for the host to start the game…</div>' + ioBtn('leave', 'Leave', 'alt'), a => { if (a === 'leave') leaveOnline(); }, 'io-ui io-panel');
        api.net.send({ t: 'hi' });
      }
    }
    function leaveOnline() {
      ioSaveSet('surviv', null);
      try { api.net.close(); } catch (e) {}
      showMenu();
    }
    function hostStart(sv) {
      G.byPid.clear(); G.evBuf.length = 0; G.eid = 0; G.sendT = 0;
      const pls = G.players.filter((x, k) => !k || api.net.players.some(q => q.id === x.id && !q.away));
      let n;
      let humans;
      if (sv) {
        humans = sv.hum.map(nm => ({ name: nm, pid: null }));
        n = sv.n;
        const W = svGen(sv.seed);
        newSim(sv.seed, humans, n, sv.skill, W, true);
        S.restore(sv.dump);
        const taken = new Set();
        S.P.forEach((p, i) => {
          if (i >= humans.length) return;
          if (i === 0) { p.name = pls[0].name; p.bot = false; p.pid = null; return; }
          const pl = pls.find(x => x.name === p.name && !taken.has(x.id));
          if (pl && !p.bot) { taken.add(pl.id); p.pid = pl.id; G.byPid.set(pl.id, { i, pid: pl.id, known: new Map(), ls: 0, lastEv: 0, ack: 0, spec: -1, ready: false }); }
          else if (!p.bot) { p.bot = true; p.br = botBrain(p, Math.random); }
        });
        S.P[0].bot = false;
        me = 0;
        ioSaveSet('surviv', null);
      } else {
        humans = pls.map(x => ({ name: x.name, pid: x.id }));
        n = G.bots ? Math.max(40, humans.length) : Math.max(humans.length, 2);
        const seed = (Math.random() * 4294967295) >>> 0;
        newSim(seed, humans, n, +saved.skill);
        me = 0;
        humans.forEach((h, i) => { if (i) G.byPid.set(h.pid, { i, pid: h.pid, known: new Map(), ls: 0, lastEv: 0, ack: 0, spec: -1, ready: false }); });
      }
      G.hum = humans.map(h => h.name);
      G.players = pls;
      lastKills = S.P[0].kills;
      beginPlay();
      for (const g of G.byPid.values()) api.net.sendTo(g.pid, wireInit(g.pid));
      hostSave();
    }

    function guestData(d) {
      if (d.t === 'init') {
        const W = svGen(d.seed);
        const sx = d.st;
        for (const id of sx.brk) { const o = W.obs[id]; if (o) o.dead = true; }
        for (const [id, hp] of sx.hps) if (W.obs[id]) W.obs[id].hp = hp;
        for (const o of sx.dyn) if (!W.byId(o.id)) W.add({ id: o.id, i: o.id, dyn: true, t: 'drop', k: 'c', x: o.x, y: o.y, r: 1.7, solid: true, bl: true, hp: o.hp, mhp: 260, dead: o.dead, q: 0, lt: 'drop' });
        Wm = W; S = null; ioSaveSet('surviv', null);
        R = svRenderer(ctx, sh.W, sh.H, Wm, {}); R.touch = coarse; R.resize(sh.W, sh.H);
        GS = { W, me: d.me, n: d.n, names: d.names, off: 0, has: false, buf: [], loot: new Map(), lootArr: [], dirty: false, pr: { x: 0, y: 0, vx: 0, vy: 0, a: 0 }, meb: null, Z: null, D: [], al: d.n, plane: sx.plane, ph: d.st.phase === 'plane' ? 0 : 1, tSim: sx.t, sw: new Map(), corr: { x: 0, y: 0 }, lastPk: 0, inited: false, spId: -1, c: null, over: null };
        hist.length = 0; seq = 0; overShown = false; deathT = 0; submitted = false; bigMap = false;
        role = 'guest';
        beginPlay();
        api.net.send({ t: 'rdy' });
        return;
      }
      if (!GS) return;
      if (d.t === 's') gSnap(d);
      else if (d.t === 'over') { GS.over = d; }
    }
    function gSnap(d) {
      const now = performance.now();
      const o = now - d.k * 1000;
      GS.off = GS.has ? Math.min(o, GS.off + 1) : o; GS.has = true;
      const P = new Map();
      for (const a of d.P) P.set(a[0], { id: a[0], x: a[1] / 20, y: a[2] / 20, a: a[3] / 100, w: a[4], fl: a[5], gear: a[6] });
      const snap = { k: d.k, P, B: d.B, G: d.G, E: d.E, evDone: !d.E.length, at: now };
      GS.buf.push(snap);
      if (GS.buf.length > 14) GS.buf.shift();
      for (const a of d.la) { GS.loot.set(a[0], { id: a[0], k: a[1], n: a[2], c: a[3], x: a[4] / 10, y: a[5] / 10 }); GS.dirty = true; }
      for (const id of d.lr) { GS.loot.delete(id); GS.dirty = true; }
      GS.S = d.S.map(a => ({ id: a[0], x: a[1] / 10, y: a[2] / 10, t: a[3], r: a[4] }));
      const z = d.Z;
      GS.Z = { cx: z[0], cy: z[1], r: z[2], nx: z[3], ny: z[4], nr: z[5], ph: z[6], st: ['wait', 'shrink', 'done'][z[7]], t: z[8] };
      GS.D = d.D; GS.al = d.al; GS.ph = d.ph; GS.tSim = d.k; GS.c = [d.c[0] / 10, d.c[1] / 10]; GS.spId = d.sp;
      const m = d.me;
      GS.meb = m;
      if (m.id === GS.me) GS.mine = m;
      if (m.alive && m.id === GS.me) {
        const pr = GS.pr;
        if (m.para === 1 || !GS.inited) { pr.x = m.x; pr.y = m.y; pr.vx = m.vx; pr.vy = m.vy; GS.inited = true; }
        else {
          const ox = pr.x, oy = pr.y;
          let x = m.x, y = m.y, vx = m.vx, vy = m.vy;
          while (hist.length && hist[0].q <= d.q) hist.shift();
          for (const h of hist) { const r = stepPred(x, y, vx, vy, h.mx, h.my, h.dt, m.sf, m.para); x = r[0]; y = r[1]; vx = r[2]; vy = r[3]; }
          const ex = x - ox, ey = y - oy;
          if (Math.hypot(ex, ey) > 6) { GS.corr.x = 0; GS.corr.y = 0; } else { GS.corr.x -= ex; GS.corr.y -= ey; }
          pr.x = x; pr.y = y; pr.vx = vx; pr.vy = vy;
        }
      } else if (m.id !== GS.me) { GS.pr.x = m.x; GS.pr.y = m.y; }
      if (m.pk !== GS.lastPk) { GS.lastPk = m.pk; snd('pick', null, null, .7); }
      api.score(m.id === GS.me ? m.kills : (GS.lastKills || 0));
      if (m.id === GS.me) GS.lastKills = m.kills;
    }
    function stepPred(x, y, vx, vy, mx, my, dt, sf, para) {
      const mag = Math.hypot(mx, my);
      if (para === 2) { return [clamp(x + mx * 18 * dt, 2, Wm.M - 2), clamp(y + my * 18 * dt, 2, Wm.M - 2), 0, 0]; }
      const tvx = mag > 0 ? mx / Math.max(1, mag) * 12 * sf : 0, tvy = mag > 0 ? my / Math.max(1, mag) * 12 * sf : 0;
      const k = Math.min(1, dt * 16);
      vx += (tvx - vx) * k; vy += (tvy - vy) * k;
      const p = { x: x + vx * dt, y: y + vy * dt };
      Wm.push(p, .95);
      return [p.x, p.y, vx, vy];
    }
    function guestFrame(dt, now) {
      readInput();
      const m = GS.meb;
      if (!m) return null;
      const alive = m.alive && m.id === GS.me;
      if (alive && m.para !== 1) {
        const r = stepPred(GS.pr.x, GS.pr.y, GS.pr.vx, GS.pr.vy, inp.mx, inp.my, dt, m.sf, m.para);
        GS.pr.x = r[0]; GS.pr.y = r[1]; GS.pr.vx = r[2]; GS.pr.vy = r[3];
      }
      sendAcc += dt;
      hist.push({ q: seq + 1, mx: inp.mx, my: inp.my, dt });
      if (hist.length > 90) hist.shift();
      const sig = inp.mx.toFixed(2) + inp.my.toFixed(2) + inp.f + inp.a.toFixed(2);
      if (sendAcc >= .033 || (sig !== lastSent && sendAcc >= .012)) {
        sendAcc = 0; lastSent = sig; seq++;
        if (alive) api.net.send({ t: 'in', q: seq, mx: +inp.mx.toFixed(3), my: +inp.my.toFixed(3), a: +inp.a.toFixed(3), f: inp.f, ad: +inp.ad.toFixed(1) }, true);
      }
      const rt = now - GS.off - 110;
      const B = GS.buf;
      for (const s of B) { if (s.k * 1000 + GS.off > now - 110) break; if (!s.evDone) { s.evDone = true; for (const e of s.E) onEv(e); } }
      while (B.length > 2 && B[1].k * 1000 + GS.off <= rt) B.shift();
      GS.corr.x *= Math.exp(-dt * 9); GS.corr.y *= Math.exp(-dt * 9);
      return rt;
    }
    function buildViewGuest(now, rt) {
      const m = GS.meb;
      const B = GS.buf;
      const A = B[0], C = B[1] || A;
      const kA = A.k * 1000 + GS.off, kC = C.k * 1000 + GS.off;
      const al = C === A ? 0 : clamp((rt - kA) / (kC - kA), 0, 1);
      const P = [];
      const mine = m.alive && m.id === GS.me;
      const pr = GS.pr;
      let cx, cy;
      const meRec = { id: GS.me, x: pr.x + GS.corr.x, y: pr.y + GS.corr.y, a: inp.a, w: wcode(m), para: m.para, pack: m.pack, vest: m.vest, helm: m.helm, name: '', fl: GS.ownFl > 0 ? 1 : 0, sw: 0, act: m.act ? HEALK.indexOf(HEALK.find(k => HEAL[k].n === m.act.n)) + 1 : 0 };
      if (m.id === GS.me && m.alive) { P.push(meRec); cx = meRec.x; cy = meRec.y; }
      for (const [id, c] of C.P) {
        const a = A.P.get(id) || c;
        const sw = c.fl & 8 ? GS.sw.get(id) : null;
        let swv = 0;
        if (c.fl & 8) { if (!sw) GS.sw.set(id, now); swv = clamp(.22 - (now - (GS.sw.get(id) || now)) / 1000, 0, .22); } else if (sw) GS.sw.delete(id);
        const act = c.fl & 16 ? 1 : 0;
        const r = { id, x: lerp(a.x, c.x, al), y: lerp(a.y, c.y, al), a: a.a + adiff(a.a, c.a) * al, w: act ? -1 : c.w, para: c.fl & 3, pack: (c.gear >> 4) & 3, vest: c.gear & 3, helm: (c.gear >> 2) & 3, name: GS.names[id], fl: c.fl & 4 ? 1 : 0, sw: swv, act: act };
        if (id === GS.spId && !mine) { cx = r.x; cy = r.y; }
        P.push(r);
      }
      if (cx == null) { cx = GS.c[0]; cy = GS.c[1]; }
      const Cs = B.find(s => s.k * 1000 + GS.off >= rt) || B[B.length - 1];
      const dtb = (Cs.k * 1000 + GS.off - rt) / 1000;
      const bl = Cs.B.map(b => { const a = b[3] / 100, sp = GUNS[b[4]].sp; return { x: b[1] / 10 - Math.cos(a) * sp * dtb, y: b[2] / 10 - Math.sin(a) * sp * dtb, a, g: b[4] }; });
      const gr = Cs.G.map(g => ({ x: g[2] / 10, y: g[3] / 10, k: g[1] ? 'smoke' : 'frag' }));
      if (GS.dirty) { GS.lootArr = Array.from(GS.loot.values()); GS.dirty = false; }
      const tS = GS.tSim + (now - (B[B.length - 1].at)) / 1000;
      const pl = GS.plane, pf = tS / pl.dur;
      const nl = nearestLoot(GS.lootArr, cx, cy);
      const mm = Object.assign({}, m, { x: cx, y: cy, a: inp.a });
      const V = {
        me: mm, cx, cy, P, L: GS.lootArr, G: gr, S: GS.S, B: bl, Z: GS.Z, alive: GS.al, phase: GS.ph === 0 ? 'plane' : 'play',
        drops: GS.D.map(d => ({ x: d[1] / 10, y: d[2] / 10, f: (tS - d[3] / 10) / 9, landed: !!d[4] })), plane: pf < 1.2 ? { x: lerp(pl.x0, pl.x1, pf), y: lerp(pl.y0, pl.y1, pf), a: pl.a, x0: pl.x0, y0: pl.y0, x1: pl.x1, y1: pl.y1 } : null,
        nearLoot: nl, names: true, dead: !mine, fp: { id: GS.spId }, snapCam: false
      };
      V.prompt = promptFor(nl, mm, V.plane);
      return V;
    }

    let V = null;
    const backdrop = (() => {
      const r = mkRng(7), t = [];
      for (let i = 0; i < 26; i++) t.push([r(), r(), 40 + r() * 70, r() < .25]);
      return t;
    })();
    function drawBackdrop(c) {
      const W = sh.W, H = sh.H;
      c.fillStyle = '#80af49'; c.fillRect(0, 0, W, H);
      for (const [x, y, rad, rock] of backdrop) {
        c.fillStyle = rock ? '#8c9094' : 'rgba(46,110,40,.55)';
        c.beginPath(); c.arc(x * W, y * H, rad * (W / 880), 0, TAU); c.fill();
      }
      c.fillStyle = 'rgba(8,12,16,.35)'; c.fillRect(0, 0, W, H);
    }
    function drawTouch(c) {
      if (!coarse || st === 'menu') return;
      const W = sh.W, H = sh.H;
      tbtn.length = 0;
      const stick = (t, dx, dy, col) => {
        const bx = t ? t.ox : dx, by = t ? t.oy : dy;
        c.globalAlpha = t ? .55 : .25;
        c.fillStyle = 'rgba(255,255,255,.12)'; c.strokeStyle = col; c.lineWidth = 3;
        c.beginPath(); c.arc(bx, by, 50, 0, TAU); c.fill(); c.stroke();
        let kx = bx, ky = by;
        if (t) { const ddx = t.x - t.ox, ddy = t.y - t.oy, d = Math.hypot(ddx, ddy) || 1, k = Math.min(d, 50) / d; kx = bx + ddx * k; ky = by + ddy * k; }
        c.fillStyle = col; c.beginPath(); c.arc(kx, ky, 22, 0, TAU); c.fill();
        c.globalAlpha = 1;
      };
      stick(tctl.move, 74, H - 84, '#ffffff');
      stick(tctl.aim, W - 74, H - 84, '#ff8a5c');
      if (tctl.aim) { c.globalAlpha = .4; c.strokeStyle = '#ff5a4f'; c.lineWidth = 2; c.beginPath(); c.arc(tctl.aim.ox, tctl.aim.oy, 36, 0, TAU); c.stroke(); c.globalAlpha = 1; }
      if (st !== 'play' || !V) return;
      const btn = (x, y, r, label, fn, col = '#2a3340') => {
        c.fillStyle = col; c.globalAlpha = .82; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1;
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#fff'; c.font = `800 ${r > 30 ? 15 : 12}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x, y + 1); c.textBaseline = 'alphabetic';
        tbtn.push({ x, y, r, fn });
      };
      if (V.me.para === 1) btn(W / 2, H - 150, 40, 'JUMP', () => doAct({ k: 'jump' }), '#c9322b');
      else {
        if (V.nearLoot) btn(W - 52, H - 196, 27, 'PICK', () => doAct({ k: 'pick' }), '#2f7a44');
        btn(W - 24, H - 122, 18, 'R', () => doAct({ k: 'rl' }));
        if (V.me.act) btn(132, H - 156, 20, 'X', () => doAct({ k: 'cancel' }), '#7a2f2f');
      }
    }
    function drawSpec(c) {
      if (st !== 'spec' && !(V && V.dead && st === 'play')) return;
      const W = sh.W, name = V && V.fp ? nameOf(V.fp.id) : '';
      R.specRects = [];
      const y = 44;
      c.fillStyle = 'rgba(10,14,20,.6)'; c.beginPath(); c.roundRect(W / 2 - 130, y - 18, 260, 36, 8); c.fill();
      c.fillStyle = '#fff'; c.font = '700 15px Arial'; c.textAlign = 'center'; c.fillText('Spectating ' + name, W / 2, y + 5);
      for (const [dx, d, lab] of [[-150, -1, '<'], [150, 1, '>']]) {
        c.fillStyle = 'rgba(10,14,20,.7)'; c.beginPath(); c.roundRect(W / 2 + dx - 20, y - 18, 40, 36, 8); c.fill();
        c.fillStyle = '#fff'; c.font = '800 18px Arial'; c.fillText(lab, W / 2 + dx, y + 6);
        R.specRects.push({ x: W / 2 + dx - 20, y: y - 18, w: 40, h: 36, fn: () => specStep(d) });
      }
    }

    function render(dt) {
      const c = ctx;
      c.setTransform(sh.DPR, 0, 0, sh.DPR, 0, 0);
      if (!R || !V || st === 'menu' || st === 'wait' || st === 'left') { drawBackdrop(c); return; }
      R.draw(c, V);
      R.hud(c, V);
      if (bigMap) R.bigMap(c, V);
      drawSpec(c);
      drawTouch(c);
    }
    let lastFit = 0;
    api.loop((dt, now) => {
      tNow = now;
      if (++lastFit % 20 === 0 && sh.fit() && R) R.resize(sh.W, sh.H);
      if (role === 'guest' && GS && GS.meb && GS.buf.length) {
        const rt = guestFrame(dt, now);
        R.update(dt);
        if (GS.ownFl > 0) GS.ownFl -= dt;
        V = buildViewGuest(now, rt);
        const m = GS.meb;
        if (st === 'play' && !(m.alive && m.id === GS.me) && !deathT) deathT = now;
        if (st === 'play' && deathT && now - deathT > 1500 && !GS.over) showDeath();
        if (GS.over && !overShown) {
          const meRes = GS.over.res[GS.me];
          if (meRes) { const mm = GS.mine || GS.meb; mm.place = meRes[0]; mm.kills = meRes[1]; mm.dmg = meRes[2]; }
          showOver(GS.over.w, GS.over.rows);
        }
      } else if (S && (role === 'solo' || role === 'host')) {
        hostFrame(dt, now);
        V = buildViewLocal(acc / DT);
      } else V = null;
      render(dt);
    });
    SVENG.live = () => ({ S, GS, R, V, role, st, inp, G, Wm, sh, doAct, hist });
    if (api.net.invite) goOnline(); else showMenu();
    return { destroy() { SVENG.live = null; AU.close(); if (role) { try { api.net.close(); } catch (e) {} } } };
  }

  Ameplay.register({
    id: 'surviv',
    title: 'Surviv.io',
    category: 'Action',
    tint: '#d9643a',
    blurb: 'Drop onto the island, loot guns and gear, and be the last one alive as the red zone closes.',
    help: '<kbd>WASD</kbd> move · mouse aim + click fire · <kbd>F</kbd> pick up / jump · <kbd>R</kbd> reload · <kbd>1-4</kbd> weapons · <kbd>7-0</kbd> heal · <kbd>G</kbd> grenade · <kbd>Z</kbd> scope · <kbd>M</kbd> map · touch: two sticks',
    better: 'high',
    width: 880,
    engine: SVENG,
    icon: SV_ICON,
    css: SV_CSS,
    mount: svMount
  });
  Ameplay.covers['surviv'] = SV_COVER;

  const DPW = 12000, DPDT = 1 / 30, DPMAXLV = 45, DPMAXPT = 7;
  const DPLV = [0, 0, 4, 13, 28, 50, 78, 113, 157, 211, 275, 350, 437, 538, 655, 787, 938, 1109, 1301, 1516, 1757, 2026, 2325, 2658, 3026, 3433, 3883, 4379, 4925, 5525, 6184, 6907, 7698, 8537, 9400, 10300, 11200, 12100, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 23536];
  const DPSTAT = ['Health Regen', 'Max Health', 'Body Damage', 'Bullet Speed', 'Bullet Penetration', 'Bullet Damage', 'Reload', 'Movement Speed'];
  const DPSCOL = ['#e8b18d', '#f677d9', '#9a6ee8', '#6e8bff', '#f4d94b', '#f2605f', '#78e55e', '#5ee0ea'];
  const DPCOL = { me: ['#00b2e1', '#0083a8'], foe: ['#f14e54', '#b2373b'], t0: ['#00b2e1', '#0083a8'], t1: ['#f14e54', '#b2373b'], gun: ['#999999', '#727272'], bg: '#cdcdcd', out: '#b9b9b9', grid: 'rgba(0,0,0,.11)' };
  const DPSHAPE = [
    { n: 'Square', sides: 4, r: 38, hp: 10, dm: 8, xp: 10, fill: '#ffe869', line: '#bfae4e' },
    { n: 'Triangle', sides: 3, r: 44, hp: 30, dm: 8, xp: 25, fill: '#fc7677', line: '#bd5a5a' },
    { n: 'Pentagon', sides: 5, r: 62, hp: 100, dm: 12, xp: 130, fill: '#768dfc', line: '#5a6abd' },
    { n: 'Alpha Pentagon', sides: 5, r: 150, hp: 3000, dm: 20, xp: 3000, fill: '#768dfc', line: '#5a6abd' }
  ];
  const dpRad = lv => 50 * Math.pow(1.01, lv - 1);
  const dpFovLv = lv => Math.pow(1.01, (lv - 1) / 2);
  const DPCLS = [];
  const DPCI = {};
  const dpBar = o => Object.assign({ a: 0, l: 2, w: .84, w2: 0, x: 0, y: 0, d: 0, rl: 1, dm: 1, sp: 1, pn: 1, bs: 1, sd: 0, kick: 1, k: 'b', lf: 1 }, o);
  const dpAuto = o => Object.assign({ x: 0, y: 0, l: 1.15, w: .62, rl: 1.5, dm: .65, sp: 1, pn: 1, bs: 1 }, o);
  const dpCls = (id, name, tier, o = {}) => {
    const c = Object.assign({ id, name, tier, b: [], au: [], fov: 1, spd: 1, bd: 1, hp: 1, dmax: 0, body: 0, from: [], i: DPCLS.length }, o);
    c.b = c.b.map(dpBar); c.au = c.au.map(dpAuto);
    DPCI[id] = DPCLS.length; DPCLS.push(c);
    return c;
  };
  const dpRing = (n, f, off = 0) => Array.from({ length: n }, (_, i) => f(off + i * TAU / n, i));
  dpCls('tank', 'Tank', 0, { b: [{}] });
  dpCls('twin', 'Twin', 1, { b: [{ w: .58, x: -.46, dm: .8 }, { w: .58, x: .46, d: .5, dm: .8 }] });
  dpCls('sniper', 'Sniper', 1, { b: [{ l: 2.45, w: .78, sp: 1.5, rl: 1.5, dm: 1.15, pn: 1.4 }], fov: 1.25 });
  dpCls('machine', 'Machine Gun', 1, { b: [{ l: 1.55, w: .98, w2: 1.5, rl: .45, dm: .7, sd: .2, sp: .95, bs: .8, kick: .5 }] });
  dpCls('flank', 'Flank Guard', 1, { b: [{ w: .8 }, { a: PI, w: .8 }] });
  dpCls('smasher', 'Smasher', 1, { b: [], body: 1, bd: 1.45, hp: 1.12, spd: 1.04 });
  dpCls('triple', 'Triple Shot', 2, { b: [{ a: -.58, l: 1.65, w: .6, rl: 1.2, dm: .8 }, { a: .58, l: 1.65, w: .6, rl: 1.2, dm: .8 }, { l: 2, w: .62, rl: 1.2, dm: .8 }] });
  dpCls('quad', 'Quad Tank', 2, { b: dpRing(4, a => ({ a, w: .78, rl: 1.3, dm: .85 })) });
  dpCls('twinflank', 'Twin Flank', 2, { b: [{ w: .5, x: -.42, rl: 1.1, dm: .8 }, { w: .5, x: .42, d: .5, rl: 1.1, dm: .8 }, { a: PI, w: .5, x: -.42, rl: 1.1, dm: .8 }, { a: PI, w: .5, x: .42, d: .5, rl: 1.1, dm: .8 }] });
  dpCls('assassin', 'Assassin', 2, { b: [{ l: 3, w: .8, sp: 1.75, rl: 1.85, dm: 1.4, pn: 1.7 }], fov: 1.45 });
  dpCls('overseer', 'Overseer', 2, { b: [{ a: PI / 2, l: 1.5, w: .9, w2: 1.3, k: 'd', rl: 1.8, dm: .9, pn: 1.3 }, { a: -PI / 2, l: 1.5, w: .9, w2: 1.3, k: 'd', rl: 1.8, dm: .9, pn: 1.3 }], dmax: 8 });
  dpCls('hunter', 'Hunter', 2, { b: [{ l: 2.45, w: .7, sp: 1.5, rl: 1.45, dm: .85, pn: 1.2 }, { l: 2.05, w: 1, sp: 1.4, rl: 1.45, dm: 1.15, pn: 1.5, d: .2 }], fov: 1.3 });
  dpCls('trapper', 'Trapper', 2, { b: [{ l: 1.4, w: .8, w2: 1.05, k: 't', rl: 2.2, dm: 1.1, pn: 1.3, kick: .6 }], fov: 1.08 });
  dpCls('destroyer', 'Destroyer', 2, { b: [{ l: 1.65, w: 1.4, sp: .75, rl: 3.2, dm: 3.2, pn: 3, kick: 5 }] });
  dpCls('gunner', 'Gunner', 2, { b: [{ l: 1.75, w: .38, x: -.78, rl: 1.1, dm: .5, sd: .05, d: 0 }, { l: 1.45, w: .38, x: -.26, rl: 1.1, dm: .5, sd: .05, d: .5 }, { l: 1.45, w: .38, x: .26, rl: 1.1, dm: .5, sd: .05, d: .25 }, { l: 1.75, w: .38, x: .78, rl: 1.1, dm: .5, sd: .05, d: .75 }] });
  dpCls('triangle', 'Tri-Angle', 2, { b: [{ w: .84, dm: .9 }, { a: 2.62, l: 1.55, w: .66, dm: .6, kick: 2.6 }, { a: -2.62, l: 1.55, w: .66, dm: .6, kick: 2.6 }], spd: 1.08 });
  dpCls('auto3', 'Auto 3', 2, { au: dpRing(3, (a) => ({ x: Math.cos(a) * .55, y: Math.sin(a) * .55 })), fov: 1.15 });
  dpCls('spike', 'Spike', 2, { b: [], body: 2, bd: 1.9, hp: 1.05, spd: 1.04 });
  dpCls('autosmasher', 'Auto Smasher', 2, { b: [], body: 1, bd: 1.45, hp: 1.12, au: [{ x: 0, y: 0, l: 1.2, w: .7, rl: 1.2, dm: .8 }] });
  dpCls('triplet', 'Triplet', 3, { b: [{ l: 2.1, w: .62, rl: 1.1, dm: .75 }, { l: 1.8, w: .62, x: -.55, d: .33, rl: 1.1, dm: .75 }, { l: 1.8, w: .62, x: .55, d: .66, rl: 1.1, dm: .75 }] });
  dpCls('penta', 'Penta Shot', 3, { b: [{ a: -.9, l: 1.5, w: .58, rl: 1.4, dm: .75 }, { a: .9, l: 1.5, w: .58, rl: 1.4, dm: .75 }, { a: -.45, l: 1.75, w: .58, rl: 1.4, dm: .75 }, { a: .45, l: 1.75, w: .58, rl: 1.4, dm: .75 }, { l: 2.05, w: .6, rl: 1.4, dm: .75 }] });
  dpCls('spread', 'Spread Shot', 3, { b: [{ a: -.72, l: 1.35, w: .42, rl: 1.5, dm: .5, d: .2, sd: .03 }, { a: .72, l: 1.35, w: .42, rl: 1.5, dm: .5, d: .2, sd: .03 }, { a: -.36, l: 1.55, w: .46, rl: 1.5, dm: .55, d: .1, sd: .03 }, { a: .36, l: 1.55, w: .46, rl: 1.5, dm: .55, d: .1, sd: .03 }, { l: 2, w: .85, rl: 1.5, dm: 1 }] });
  dpCls('octo', 'Octo Tank', 3, { b: dpRing(8, (a, i) => ({ a, w: .66, l: 1.65, rl: 1.5, dm: .8, d: i % 2 ? .5 : 0 })) });
  dpCls('tritwin', 'Triple Twin', 3, { b: [].concat(...dpRing(3, a => [{ a, w: .5, x: -.42, rl: 1.15, dm: .75 }, { a, w: .5, x: .42, d: .5, rl: 1.15, dm: .75 }])) });
  dpCls('ranger', 'Ranger', 3, { b: [{ l: 3.2, w: .8, sp: 1.95, rl: 2, dm: 1.6, pn: 2 }], fov: 1.7 });
  dpCls('overlord', 'Overlord', 3, { b: dpRing(4, a => ({ a, l: 1.45, w: .85, w2: 1.25, k: 'd', rl: 1.9, dm: .9, pn: 1.3 })), dmax: 8 });
  dpCls('predator', 'Predator', 3, { b: [{ l: 2.3, w: .65, sp: 1.55, rl: 1.6, dm: .8, pn: 1.2 }, { l: 2.05, w: .9, sp: 1.5, rl: 1.6, dm: .95, pn: 1.4, d: .25 }, { l: 1.8, w: 1.15, sp: 1.45, rl: 1.6, dm: 1.15, pn: 1.6, d: .5 }], fov: 1.4 });
  dpCls('stream', 'Streamliner', 3, { b: [{ l: 2.3, w: .42, rl: .55, dm: .4, sp: 1.4, d: 0 }, { l: 2.1, w: .42, x: -.3, rl: .55, dm: .4, sp: 1.4, d: .2 }, { l: 2.1, w: .42, x: .3, rl: .55, dm: .4, sp: 1.4, d: .4 }, { l: 1.9, w: .42, x: -.6, rl: .55, dm: .4, sp: 1.4, d: .6 }, { l: 1.9, w: .42, x: .6, rl: .55, dm: .4, sp: 1.4, d: .8 }], fov: 1.25 });
  dpCls('megatrap', 'Mega Trapper', 3, { b: [{ l: 1.4, w: 1.2, w2: 1.55, k: 't', rl: 2.5, dm: 1.6, pn: 1.8, bs: 1.45, kick: 1 }], fov: 1.1 });
  dpCls('tritrap', 'Tri-Trapper', 3, { b: dpRing(3, a => ({ a, l: 1.3, w: .8, w2: 1.05, k: 't', rl: 2.2, dm: 1.1, pn: 1.3, kick: .6 })), fov: 1.08 });
  dpCls('overtrap', 'Overtrapper', 3, { b: [{ l: 1.4, w: .8, w2: 1.05, k: 't', rl: 2.2, dm: 1.1, pn: 1.3, kick: .6 }, { a: 2.35, l: 1.4, w: .8, w2: 1.15, k: 'd', rl: 2, dm: .85, pn: 1.2 }, { a: -2.35, l: 1.4, w: .8, w2: 1.15, k: 'd', rl: 2, dm: .85, pn: 1.2 }], dmax: 6 });
  dpCls('annihilator', 'Annihilator', 3, { b: [{ l: 1.7, w: 1.9, sp: .72, rl: 4.4, dm: 4.6, pn: 4.5, kick: 8 }] });
  dpCls('hybrid', 'Hybrid', 3, { b: [{ l: 1.65, w: 1.4, sp: .75, rl: 3.4, dm: 3.1, pn: 3, kick: 5 }, { a: PI, l: 1.3, w: .95, w2: 1.3, k: 'd', rl: 2.4, dm: .9, pn: 1.3 }], dmax: 3 });
  dpCls('autogun', 'Auto Gunner', 3, { b: [{ l: 1.75, w: .38, x: -.78, rl: 1.2, dm: .5, d: 0 }, { l: 1.45, w: .38, x: -.26, rl: 1.2, dm: .5, d: .5 }, { l: 1.45, w: .38, x: .26, rl: 1.2, dm: .5, d: .25 }, { l: 1.75, w: .38, x: .78, rl: 1.2, dm: .5, d: .75 }], au: [{ x: 0, y: 0, l: 1.1, w: .6, rl: 1.4, dm: .6 }] });
  dpCls('booster', 'Booster', 3, { b: [{ w: .84, dm: .9 }, { a: 2.62, l: 1.55, w: .62, dm: .55, kick: 3.4 }, { a: -2.62, l: 1.55, w: .62, dm: .55, kick: 3.4 }, { a: 2.95, l: 1.75, w: .62, dm: .55, kick: 3.4 }, { a: -2.95, l: 1.75, w: .62, dm: .55, kick: 3.4 }], spd: 1.18 });
  dpCls('fighter', 'Fighter', 3, { b: [{ w: .84, dm: .9 }, { a: PI / 2, l: 1.5, w: .66, dm: .65, kick: 1 }, { a: -PI / 2, l: 1.5, w: .66, dm: .65, kick: 1 }, { a: 2.62, l: 1.55, w: .62, dm: .55, kick: 2.2 }, { a: -2.62, l: 1.55, w: .62, dm: .55, kick: 2.2 }], spd: 1.1 });
  dpCls('auto5', 'Auto 5', 3, { au: dpRing(5, a => ({ x: Math.cos(a) * .6, y: Math.sin(a) * .6, rl: 1.35 })), fov: 1.2 });
  const DPTREE = { tank: ['twin', 'sniper', 'machine', 'flank', 'smasher'], twin: ['triple', 'quad', 'twinflank'], sniper: ['assassin', 'overseer', 'hunter', 'trapper'], machine: ['destroyer', 'gunner'], flank: ['triangle', 'quad', 'twinflank', 'auto3'], smasher: ['spike', 'autosmasher'], triple: ['triplet', 'penta', 'spread'], quad: ['octo'], twinflank: ['tritwin'], assassin: ['ranger'], overseer: ['overlord', 'overtrap'], hunter: ['predator', 'stream'], trapper: ['megatrap', 'tritrap', 'overtrap'], destroyer: ['hybrid', 'annihilator'], gunner: ['autogun', 'stream'], triangle: ['booster', 'fighter'], auto3: ['auto5', 'autogun'] };
  const dpUpOpts = (cid, lv) => {
    const c = DPCLS[DPCI[cid]];
    const need = [15, 30, 45][c.tier];
    if (need == null || lv < need) return [];
    const t = DPTREE[cid];
    return t ? t.slice() : [];
  };
  const dpMaxHp = p => Math.round((50 + 2 * (p.lv - 1) + 20 * p.st[1]) * DPCLS[p.ci].hp);
  const dpBodyDmg = p => (20 + 6 * p.st[2]) * DPCLS[p.ci].bd;
  const dpMaxSpd = p => 540 * Math.pow(1.055, p.st[7]) * DPCLS[p.ci].spd * Math.pow(.9925, p.lv - 1);
  const dpBulSpd = p => 1100 * (1 + .1 * p.st[3]);
  const dpBulDmg = p => 7 + 3 * p.st[5];
  const dpBulHp = p => 5 + 8 * p.st[4];
  const dpReload = p => .6 * Math.pow(.9, p.st[6]);
  const dpFov = p => dpFovLv(p.lv) * DPCLS[p.ci].fov;
  const DPBUILDS = [[5, 6, 4, 3, 1, 7, 2, 0], [6, 5, 4, 7, 3, 1, 2, 0], [7, 1, 2, 0, 3, 4, 5, 6], [5, 6, 1, 7, 4, 3, 0, 2]];

  const DPSHTARGET = [300, 90, 22, 2];
  const DPRAM = 3;
  function DpSim(cfg) {
    const rnd = Math.random;
    const S = { W: DPW, t: 0, tk: 0, mode: cfg.mode || 'ffa', P: [], sh: [], bul: [], ev: [], nid: 1000, over: false, tl: cfg.tl || 0, skill: cfg.skill == null ? 1 : cfg.skill, lb: [], lbT: 0, res: null, cnt: [0, 0, 0, 0], spT: [0, 0, 0, 0], tsc: [0, 0], n: 0 };
    const grid = new Map();
    const GC = 400;
    const gk = (cx, cy) => cx * 64 + cy;
    const blank = (id, name, bot, team) => ({ id, name, bot, pid: null, team, x: 0, y: 0, vx: 0, vy: 0, a: 0, ad: 400, r: 50, ci: 0, cid: 'tank', lv: 1, score: 0, pts: 0, st: [0, 0, 0, 0, 0, 0, 0, 0], hp: 50, mhp: 50, regenT: 0, alive: false, cd: [0], acd: [], aa: [], atT: [], atg: [], wasF: false, shield: 0, kills: 0, born: 0, deadAt: 0, by: -1, byN: '', rsT: 0, in: { mx: 0, my: 0, a: 0, ad: 400, f: 0, f2: 0 }, kk: 0, nd: 0, br: null, best: 0, tAlive: 0, fl: 0 });
    S.mk = (name, bot, team) => { const p = blank(S.P.length, name, bot, S.mode === 'team' ? team : S.P.length); S.P.push(p); return p; };
    const ev = e => { S.ev.push(e); };
    const refreshMax = p => { const nm = dpMaxHp(p); if (nm > p.mhp) p.hp += nm - p.mhp; p.mhp = nm; if (p.hp > nm) p.hp = nm; };
    function applyCls(p, cid) {
      p.cid = cid; p.ci = DPCI[cid];
      const C = DPCLS[p.ci];
      p.cd = C.b.map(() => 0); p.acd = C.au.map(() => 0); p.aa = C.au.map(() => p.a); p.atT = C.au.map(() => 0); p.atg = C.au.map(() => null);
      if (!C.dmax) { for (const b of S.bul) if (b.k === 1 && b.o === p.id) b.hp = 0; p.nd = 0; }
      refreshMax(p);
    }
    function spawn(p) {
      let bx = DPW / 2, by = DPW / 2, bd = -1;
      for (let i = 0; i < 14; i++) {
        let x, y;
        if (S.mode === 'team') { x = p.team === 0 ? 300 + rnd() * 1100 : DPW - 1400 + rnd() * 1100; y = 700 + rnd() * (DPW - 1400); }
        else { x = 700 + rnd() * (DPW - 1400); y = 700 + rnd() * (DPW - 1400); }
        let md = 1e9;
        for (const q of S.P) if (q.alive && q !== p) md = Math.min(md, Math.hypot(q.x - x, q.y - y));
        if (md > bd) { bd = md; bx = x; by = y; }
      }
      p.x = bx; p.y = by; p.vx = p.vy = 0; p.lv = 1; p.score = 0; p.pts = 0; p.st = [0, 0, 0, 0, 0, 0, 0, 0];
      p.r = dpRad(1); p.alive = true; p.regenT = 0; p.shield = 3; p.kills = 0; p.born = S.t; p.by = -1; p.byN = ''; p.kk = 0; p.nd = 0; p.wasF = false; p.tAlive = 0; p.best = 0; p.fl = 0;
      p.a = rnd() * TAU; p.mhp = 50; p.hp = 50;
      applyCls(p, 'tank');
      p.mhp = dpMaxHp(p); p.hp = p.mhp;
      if (p.bot) dpBotInit(S, p, rnd);
    }
    S.spawn = spawn;
    S.setStat = (p, i) => {
      if (!p.alive || p.pts <= 0 || i < 0 || i > 7 || p.st[i] >= DPMAXPT) return false;
      p.st[i]++; p.pts--; refreshMax(p);
      return true;
    };
    S.chooseCls = (p, cid) => {
      if (!p.alive || !dpUpOpts(p.cid, p.lv).includes(cid)) return false;
      applyCls(p, cid);
      return true;
    };
    function gain(p, n) {
      if (!p.alive || n <= 0) return;
      p.score += n;
      if (p.score > p.best) p.best = p.score;
      let up = 0;
      while (p.lv < DPMAXLV && p.score >= DPLV[p.lv + 1]) {
        p.lv++; up++;
        if (p.lv <= 28 || p.lv % 3 === 0) p.pts++;
      }
      if (up) { p.r = dpRad(p.lv); refreshMax(p); ev({ k: 'lv', id: p.id, lv: p.lv }); }
    }
    function die(p, killer, name) {
      if (!p.alive) return;
      p.alive = false; p.hp = 0; p.deadAt = S.t; p.by = killer ? killer.id : -1; p.byN = killer ? killer.name : name || '';
      p.rsT = 3.5 + rnd() * 3;
      for (const b of S.bul) if (b.k === 1 && b.o === p.id) b.hp = 0;
      p.nd = 0;
      if (killer && killer !== p) { killer.kills++; gain(killer, Math.max(Math.round(p.score * 1), 0)); }
      ev({ k: 'kill', v: p.id, b: killer ? killer.id : -1, bn: killer ? '' : name || '', x: Math.round(p.x), y: Math.round(p.y), sc: Math.round(p.score), lv: p.lv, cs: p.ci });
    }
    function hurtTank(p, dmg, killer, name) {
      if (!p.alive || p.shield > 0 || dmg <= 0) return;
      p.hp -= dmg; p.regenT = 0; p.fl = .12;
      if (p.hp <= 0) die(p, killer, name);
    }
    function killShape(s, killer) {
      s.hp = 0;
      if (killer && killer.alive) gain(killer, DPSHAPE[s.k].xp * (killer.bot ? .45 + .15 * S.skill : 1));
      ev({ k: 'sd', x: Math.round(s.x), y: Math.round(s.y), sk: s.k, a: Math.round(s.a * 100) });
    }
    function mkShape(k, x, y) {
      const D = DPSHAPE[k], ang = rnd() * TAU, sp = 8 + rnd() * 20;
      const s = { id: S.nid++, k, x, y, a: rnd() * TAU, va: (rnd() < .5 ? -1 : 1) * (.15 + rnd() * .35), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, dx: 0, dy: 0, hp: D.hp, mhp: D.hp, r: D.r, fl: 0 };
      s.dx = s.vx; s.dy = s.vy;
      S.sh.push(s); S.cnt[k]++;
      return s;
    }
    function shapePos(k) {
      const c = DPW / 2;
      if (k === 3) return [c + (rnd() - .5) * 500, c + (rnd() - .5) * 500];
      if (k === 2) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * 1500; return [c + Math.cos(a) * d, c + Math.sin(a) * d]; }
      if (k === 1 && rnd() < .6) { const a = rnd() * TAU, d = 1400 + rnd() * 3200; return [c + Math.cos(a) * d, c + Math.sin(a) * d]; }
      if (k === 0 && rnd() < .12) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * 1500; return [c + Math.cos(a) * d, c + Math.sin(a) * d]; }
      return [300 + rnd() * (DPW - 600), 300 + rnd() * (DPW - 600)];
    }
    function seedShapes() {
      for (let k = 3; k >= 0; k--) for (let i = 0; i < DPSHTARGET[k]; i++) { const [x, y] = shapePos(k); mkShape(k, x, y); }
    }
    const DPSHCD = [.06, .25, 1.6, 60];
    function topUpShapes(dt) {
      for (let k = 0; k < 4; k++) {
        S.spT[k] -= dt;
        if (S.cnt[k] >= DPSHTARGET[k] || S.spT[k] > 0) continue;
        S.spT[k] = DPSHCD[k];
        for (let tr = 0; tr < 6; tr++) {
          const [x, y] = shapePos(k);
          let ok = true;
          for (const q of S.P) if (q.alive && Math.abs(q.x - x) < 1500 && Math.abs(q.y - y) < 1500) { ok = false; break; }
          if (ok || tr === 5) { mkShape(k, Math.max(100, Math.min(DPW - 100, x)), Math.max(100, Math.min(DPW - 100, y))); break; }
        }
      }
    }
    function gridBuild() {
      grid.clear();
      for (const s of S.sh) {
        const cx = Math.floor(s.x / GC), cy = Math.floor(s.y / GC), key = gk(cx, cy);
        let a = grid.get(key); if (!a) { a = []; grid.set(key, a); }
        a.push(s);
      }
    }
    const nearShapes = (x, y, rad, cb) => {
      const x0 = Math.floor((x - rad) / GC), x1 = Math.floor((x + rad) / GC), y0 = Math.floor((y - rad) / GC), y1 = Math.floor((y + rad) / GC);
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const a = grid.get(gk(cx, cy)); if (a) for (const s of a) cb(s); }
    };
    S.nearShapes = nearShapes;
    const allied = (a, b) => a.team === b.team;
    function findTarget(p, x, y, rad) {
      let best = null, bd = rad * rad;
      for (const q of S.P) {
        if (!q.alive || allied(q, p) || q.shield > 0) continue;
        const d = (q.x - x) ** 2 + (q.y - y) ** 2;
        if (d < bd) { bd = d; best = q; }
      }
      if (best) return best;
      nearShapes(x, y, rad, s => { if (s.hp <= 0) return; const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; best = s; } });
      return best;
    }
    function shoot(p, B, px, py, ang, recoil) {
      const R = p.r;
      const ang2 = ang + (B.sd ? (rnd() * 2 - 1) * B.sd : 0);
      const dx = Math.cos(ang2), dy = Math.sin(ang2);
      let bsp = dpBulSpd(p) * B.sp * (B.sd > .1 ? .92 + rnd() * .16 : 1);
      const kind = B.k === 'd' ? 1 : B.k === 't' ? 2 : 0;
      const wd = kind === 2 ? (B.w2 || B.w) : B.w;
      const rad = Math.max(7, wd * R * .5 * B.bs);
      if (kind === 1) bsp *= .55;
      const b = { id: S.nid++, o: p.id, tm: p.team, k: kind, x: px + dx * B.l * R, y: py + dy * B.l * R, vx: dx * bsp, vy: dy * bsp, r: rad, hp: dpBulHp(p) * B.pn * (kind === 1 ? 2.5 : kind === 2 ? 3 : 1), dmg: dpBulDmg(p) * B.dm, life: kind === 1 ? 1e9 : kind === 2 ? 14 : 1.6 * (B.lf || 1), h: [], rh: kind ? .35 : 1e9, sp: bsp, ph: rnd() * TAU };
      if (kind === 2) { b.vx *= .8; b.vy *= .8; }
      S.bul.push(b);
      if (kind === 1) p.nd++;
      if (recoil) { const kick = dpBulSpd(p) * .06 * recoil * (kind === 1 ? .2 : 1); p.vx -= dx * kick; p.vy -= dy * kick; p.kk = 1; }
    }
    function tankStep(p, dt) {
      const C = DPCLS[p.ci], I = p.in;
      if (p.bot) dpBotTick(S, p, dt, rnd);
      p.tAlive += dt;
      if (p.shield > 0) p.shield -= dt;
      if (p.fl > 0) p.fl -= dt;
      if (p.kk > 0) p.kk = Math.max(0, p.kk - dt * 7);
      p.a = I.a; p.ad = I.ad;
      const max = dpMaxSpd(p);
      const mm = Math.hypot(I.mx, I.my);
      const tvx = mm > 0 ? I.mx / Math.max(1, mm) * max : 0, tvy = mm > 0 ? I.my / Math.max(1, mm) * max : 0;
      const k = Math.min(1, dt * 3);
      p.vx += (tvx - p.vx) * k; p.vy += (tvy - p.vy) * k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < p.r) { p.x = p.r; if (p.vx < 0) p.vx = 0; } else if (p.x > DPW - p.r) { p.x = DPW - p.r; if (p.vx > 0) p.vx = 0; }
      if (p.y < p.r) { p.y = p.r; if (p.vy < 0) p.vy = 0; } else if (p.y > DPW - p.r) { p.y = DPW - p.r; if (p.vy > 0) p.vy = 0; }
      p.regenT += dt;
      if (p.hp < p.mhp) {
        const s = p.st[0], rate = p.regenT > 20 ? .03 + .012 * s : .003 + .0016 * s;
        p.hp = Math.min(p.mhp, p.hp + p.mhp * rate * dt);
      }
      const fire = I.f;
      if (fire && p.shield > 0) p.shield = 0;
      const rl = dpReload(p);
      if (fire && !p.wasF) for (let i = 0; i < C.b.length; i++) if (C.b[i].d > 0 && p.cd[i] <= 0) p.cd[i] = C.b[i].d * rl * C.b[i].rl;
      p.wasF = !!fire;
      const cs = Math.cos(p.a), sn = Math.sin(p.a);
      for (let i = 0; i < C.b.length; i++) {
        const B = C.b[i];
        p.cd[i] -= dt;
        if (p.cd[i] < -dt) p.cd[i] = -dt;
        if (fire && p.cd[i] <= 0) {
          if (B.k === 'd' && p.nd >= C.dmax) continue;
          const bx = p.x + (-sn) * B.x * p.r + cs * B.y * p.r, by = p.y + cs * B.x * p.r + sn * B.y * p.r;
          shoot(p, B, bx, by, p.a + B.a, B.kick);
          p.cd[i] += rl * B.rl;
        }
      }
      for (let i = 0; i < C.au.length; i++) {
        const A = C.au[i];
        const ax = p.x + (A.x * cs - A.y * sn) * p.r, ay = p.y + (A.x * sn + A.y * cs) * p.r;
        p.acd[i] -= dt; if (p.acd[i] < -dt) p.acd[i] = -dt;
        p.atT[i] -= dt;
        if (p.atT[i] <= 0) { p.atT[i] = .18 + rnd() * .12; p.atg[i] = findTarget(p, ax, ay, 1250); }
        const tg = p.atg[i];
        const ok = tg && (tg.alive === undefined ? tg.hp > 0 : tg.alive);
        let want = p.a;
        if (ok) {
          const d = Math.hypot(tg.x - ax, tg.y - ay), tl = d / (dpBulSpd(p) * A.sp);
          want = Math.atan2(tg.y + (tg.vy || 0) * tl - ay, tg.x + (tg.vx || 0) * tl - ax);
        }
        p.aa[i] += clamp(adiff(p.aa[i], want), -10 * dt, 10 * dt);
        if (ok && p.acd[i] <= 0 && Math.abs(adiff(p.aa[i], want)) < .12) {
          shoot(p, A, ax, ay, p.aa[i], 0);
          p.acd[i] += rl * A.rl;
        }
      }
    }
    function shapeStep(s, dt) {
      s.a += s.va * dt;
      s.vx += (s.dx - s.vx) * dt * .8; s.vy += (s.dy - s.vy) * dt * .8;
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < s.r) { s.x = s.r; s.dx = Math.abs(s.dx); s.vx = Math.abs(s.vx); } else if (s.x > DPW - s.r) { s.x = DPW - s.r; s.dx = -Math.abs(s.dx); s.vx = -Math.abs(s.vx); }
      if (s.y < s.r) { s.y = s.r; s.dy = Math.abs(s.dy); s.vy = Math.abs(s.vy); } else if (s.y > DPW - s.r) { s.y = DPW - s.r; s.dy = -Math.abs(s.dy); s.vy = -Math.abs(s.vy); }
      if (s.fl > 0) s.fl -= dt;
      if (s.hp < s.mhp && s.hp > 0) s.hp = Math.min(s.mhp, s.hp + s.mhp * .004 * dt);
    }
    const shMass = s => s.r * s.r * (s.k === 3 ? 4 : .5);
    function tankVsTank() {
      const P = S.P;
      for (let i = 0; i < P.length; i++) {
        const a = P[i]; if (!a.alive) continue;
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j]; if (!b.alive) continue;
          const dx = b.x - a.x, dy = b.y - a.y, m = a.r + b.r;
          if (Math.abs(dx) > m || Math.abs(dy) > m) continue;
          const d = Math.hypot(dx, dy);
          if (d >= m) continue;
          const nx = d > 0 ? dx / d : 1, ny = d > 0 ? dy / d : 0, ov = m - d;
          const ma = a.r * a.r, mb = b.r * b.r, tm = ma + mb;
          a.x -= nx * ov * mb / tm; a.y -= ny * ov * mb / tm; b.x += nx * ov * ma / tm; b.y += ny * ov * ma / tm;
          const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vn < 0) { const j2 = -(1 + .7) * vn / (1 / ma + 1 / mb); a.vx -= j2 * nx / ma; a.vy -= j2 * ny / ma; b.vx += j2 * nx / mb; b.vy += j2 * ny / mb; }
          if (!allied(a, b) && a.shield <= 0 && b.shield <= 0) {
            const da = dpBodyDmg(b) * DPRAM * DPDT, db = dpBodyDmg(a) * DPRAM * DPDT;
            hurtTank(a, da, b); hurtTank(b, db, a);
          }
        }
      }
    }
    function tankVsShape(p) {
      nearShapes(p.x, p.y, p.r + 200, s => {
        if (s.hp <= 0) return;
        const dx = s.x - p.x, dy = s.y - p.y, m = p.r + s.r * .9;
        if (Math.abs(dx) > m || Math.abs(dy) > m) return;
        const d = Math.hypot(dx, dy);
        if (d >= m) return;
        const nx = d > 0 ? dx / d : 1, ny = d > 0 ? dy / d : 0, ov = m - d;
        const ma = p.r * p.r, mb = shMass(s), tm = ma + mb;
        p.x -= nx * ov * mb / tm; p.y -= ny * ov * mb / tm; s.x += nx * ov * ma / tm; s.y += ny * ov * ma / tm;
        const vn = (s.vx - p.vx) * nx + (s.vy - p.vy) * ny;
        if (vn < 0) { const j2 = -(1 + .6) * vn / (1 / ma + 1 / mb); p.vx -= j2 * nx / ma; p.vy -= j2 * ny / ma; s.vx += j2 * nx / mb; s.vy += j2 * ny / mb; }
        if (p.shield <= 0) {
          s.hp -= dpBodyDmg(p) * DPRAM * DPDT; s.fl = .1;
          hurtTank(p, DPSHAPE[s.k].dm * (s.k === 3 ? 4 : 1.2) * DPDT, null, DPSHAPE[s.k].n);
          if (s.hp <= 0) killShape(s, p);
        }
      });
    }
    function canHit(b, key) {
      for (const e of b.h) if (e[0] === key) { if (S.t - e[1] < b.rh) return false; e[1] = S.t; return true; }
      b.h.push([key, S.t]);
      if (b.h.length > 8) b.h.shift();
      return true;
    }
    function bulletStep(b, dt) {
      b.life -= dt;
      if (b.k === 1) {
        const o = S.P[b.o];
        if (!o || !o.alive) { b.hp = 0; return; }
        const I = o.in;
        let tx, ty, sp = b.sp;
        if (I.f || I.f2) {
          const ax = o.x + Math.cos(I.a) * I.ad, ay = o.y + Math.sin(I.a) * I.ad;
          if (I.f2 && !I.f) { tx = o.x - (ax - o.x) * .5; ty = o.y - (ay - o.y) * .5; } else { tx = ax; ty = ay; }
        } else {
          const an = b.ph + S.t * .9;
          tx = o.x + Math.cos(an) * o.r * 3.2; ty = o.y + Math.sin(an) * o.r * 3.2;
        }
        const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1;
        const want = d < 90 ? d * 5 : sp;
        const k = Math.min(1, dt * 3.2);
        b.vx += (dx / d * Math.min(want, sp * 1.2) - b.vx) * k; b.vy += (dy / d * Math.min(want, sp * 1.2) - b.vy) * k;
        for (const q of S.bul) {
          if (q === b || q.k !== 1 || q.o !== b.o) continue;
          const qx = b.x - q.x, qy = b.y - q.y;
          if (Math.abs(qx) < b.r * 2 && Math.abs(qy) < b.r * 2) { const qd = Math.hypot(qx, qy) || 1; if (qd < b.r * 2) { b.x += qx / qd * (b.r * 2 - qd) * .25; b.y += qy / qd * (b.r * 2 - qd) * .25; } }
        }
      } else if (b.k === 2) {
        const dk = Math.exp(-dt * 2.6);
        b.vx *= dk; b.vy *= dk;
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.life <= 0 || b.x < -200 || b.y < -200 || b.x > DPW + 200 || b.y > DPW + 200) b.hp = 0;
    }
    function bulletHits(b) {
      if (b.hp <= 0) return;
      const owner = S.P[b.o];
      nearShapes(b.x, b.y, b.r + 170, s => {
        if (b.hp <= 0 || s.hp <= 0) return;
        const dx = s.x - b.x, dy = s.y - b.y, m = b.r + s.r * .86;
        if (dx * dx + dy * dy >= m * m) return;
        if (!canHit(b, s.id)) return;
        s.hp -= b.dmg; s.fl = .1;
        const mass = shMass(s);
        s.vx += b.vx * b.r * b.r * .02 / mass * (b.k === 1 ? .3 : 1); s.vy += b.vy * b.r * b.r * .02 / mass * (b.k === 1 ? .3 : 1);
        b.hp -= DPSHAPE[s.k].dm;
        if (s.hp <= 0) killShape(s, owner);
      });
      if (b.hp <= 0) return;
      for (const p of S.P) {
        if (!p.alive || p.team === b.tm) continue;
        const dx = p.x - b.x, dy = p.y - b.y, m = b.r + p.r;
        if (Math.abs(dx) > m || Math.abs(dy) > m || dx * dx + dy * dy >= m * m) continue;
        if (p.shield > 0) { if (b.k !== 2) b.hp = 0; continue; }
        if (b.k === 2) {
          const d = Math.hypot(dx, dy) || 1;
          p.x += dx / d * Math.min(m - d, 14) * .6; p.y += dy / d * Math.min(m - d, 14) * .6;
          p.vx *= .92; p.vy *= .92;
        }
        if (!canHit(b, p.id)) continue;
        hurtTank(p, b.dmg, owner);
        p.vx += b.vx * b.r * b.r * .0009 / (p.r * p.r / 2500); p.vy += b.vy * b.r * b.r * .0009 / (p.r * p.r / 2500);
        b.hp -= dpBodyDmg(p) * .7;
        if (b.hp <= 0) return;
      }
    }
    function bulletVsBullet() {
      const B = S.bul;
      for (let i = 0; i < B.length; i++) {
        const a = B[i]; if (a.hp <= 0) continue;
        for (let j = i + 1; j < B.length; j++) {
          const b = B[j];
          if (b.hp <= 0 || a.tm === b.tm) continue;
          const dx = a.x - b.x;
          const m = a.r + b.r;
          if (dx > m || dx < -m) continue;
          const dy = a.y - b.y;
          if (dy > m || dy < -m || dx * dx + dy * dy >= m * m) continue;
          const da = a.dmg, db = b.dmg;
          a.hp -= db; b.hp -= da;
          if (a.hp <= 0) break;
        }
      }
    }
    function respawnBots(dt) {
      for (const p of S.P) {
        if (p.alive || !p.bot) continue;
        p.rsT -= dt;
        if (p.rsT <= 0) spawn(p);
      }
    }
    function leaderboard() {
      const a = S.P.filter(p => p.alive).sort((x, y) => y.score - x.score).slice(0, 10);
      S.lb = a.map(p => [p.id, Math.round(p.score)]);
      S.tsc = [0, 0];
      if (S.mode === 'team') for (const p of S.P) if (p.alive) S.tsc[p.team] += p.score;
    }
    function finish() {
      S.over = true;
      const rows = S.P.map(p => [p.id, p.name, Math.round(Math.max(p.best, p.score)), p.kills, p.team]);
      rows.sort((a, b) => b[2] - a[2]);
      S.res = { rows: rows.slice(0, 8), all: rows, tsc: S.mode === 'team' ? [0, 1].map(t => rows.filter(r => r[4] === t).reduce((a, r) => a + r[2], 0)) : null };
      ev({ k: 'over' });
    }
    S.step = dt => {
      if (S.over) return;
      S.t += dt; S.tk++;
      gridBuild();
      for (const p of S.P) if (p.alive) tankStep(p, dt);
      for (const s of S.sh) shapeStep(s, dt);
      for (const b of S.bul) bulletStep(b, dt);
      gridBuild();
      tankVsTank();
      for (const p of S.P) if (p.alive) tankVsShape(p);
      for (const b of S.bul) bulletHits(b);
      bulletVsBullet();
      let w = 0;
      for (const b of S.bul) { if (b.hp > 0) S.bul[w++] = b; else if (b.k === 1) { const o = S.P[b.o]; if (o && o.nd > 0) o.nd--; } }
      S.bul.length = w;
      w = 0;
      for (const s of S.sh) { if (s.hp > 0) S.sh[w++] = s; else S.cnt[s.k]--; }
      S.sh.length = w;
      for (const p of S.P) if (p.alive) { p.x = clamp(p.x, p.r, DPW - p.r); p.y = clamp(p.y, p.r, DPW - p.r); }
      topUpShapes(dt);
      respawnBots(dt);
      S.lbT -= dt;
      if (S.lbT <= 0) { S.lbT = .5; leaderboard(); }
      if (S.tl > 0 && S.t >= S.tl) finish();
    };
    S.dump = () => ({
      t: S.t, tl: S.tl, mode: S.mode, nid: S.nid, skill: S.skill,
      P: S.P.map(p => ({ id: p.id, name: p.name, bot: p.bot, team: p.team, x: p.x, y: p.y, vx: p.vx, vy: p.vy, a: p.a, lv: p.lv, cid: p.cid, score: p.score, pts: p.pts, st: p.st, hp: p.hp, alive: p.alive, kills: p.kills, best: p.best, rsT: p.rsT, shield: p.shield, born: p.born })),
      sh: S.sh.map(s => [s.id, s.k, Math.round(s.x), Math.round(s.y), Math.round(s.a * 100) / 100, s.va, Math.round(s.vx * 10) / 10, Math.round(s.vy * 10) / 10, Math.round(s.hp), s.dx, s.dy])
    });
    S.restore = d => {
      S.t = d.t; S.nid = d.nid; S.tl = d.tl;
      d.P.forEach((o, i) => {
        const p = S.P[i]; if (!p) return;
        Object.assign(p, { name: o.name, bot: o.bot, team: o.team, x: o.x, y: o.y, vx: o.vx, vy: o.vy, a: o.a, lv: o.lv, score: o.score, pts: o.pts, st: o.st, alive: o.alive, kills: o.kills, best: o.best, rsT: o.rsT, shield: o.shield, born: o.born });
        p.r = dpRad(p.lv);
        applyCls(p, o.cid);
        p.mhp = dpMaxHp(p); p.hp = Math.min(o.hp, p.mhp);
        if (p.bot && p.alive) dpBotInit(S, p, rnd);
      });
      S.sh.length = 0; S.cnt = [0, 0, 0, 0];
      for (const a of d.sh) {
        const D = DPSHAPE[a[1]];
        S.sh.push({ id: a[0], k: a[1], x: a[2], y: a[3], a: a[4], va: a[5], vx: a[6], vy: a[7], dx: a[9], dy: a[10], hp: a[8], mhp: D.hp, r: D.r, fl: 0 });
        S.cnt[a[1]]++;
      }
      S.bul.length = 0;
      leaderboard();
    };
    S.respawnHuman = p => { if (!p.alive && !p.bot) spawn(p); };
    S.init = () => {
      const hs = cfg.humans || [];
      const nh = hs.length;
      hs.forEach((h, i) => { const p = S.mk(h.name, false, i % 2); p.pid = h.pid || null; });
      const used = new Set(hs.map(h => h.name));
      const n = Math.max(cfg.n || 20, nh);
      for (let i = nh; i < n; i++) {
        const c0 = S.P.filter(q => q.team === 0).length, c1 = S.P.filter(q => q.team === 1).length;
        S.mk(botName(used, rnd), true, c0 <= c1 ? 0 : 1);
      }
      S.n = n;
      seedShapes();
      for (const p of S.P) spawn(p);
      gridBuild();
      leaderboard();
    };
    return S;
  }

  function dpBotInit(S, p, rnd) {
    p.br = { tt: rnd() * .2, mode: 'farm', tg: null, tk: 0, sx: rnd() < .5 ? 1 : -1, sT: 0, build: DPBUILDS[(rnd() * DPBUILDS.length) | 0], agg: .35 + rnd() * .65, wx: DPW / 2, wy: DPW / 2, wT: 0, aimE: 0, aimT: 0, pref: rnd(), fleeT: 0 };
  }
  function dpBotTick(S, p, dt, rnd) {
    const B = p.br;
    if (!B) { dpBotInit(S, p, rnd); return; }
    const I = p.in, sk = S.skill, C = DPCLS[p.ci];
    B.tt -= dt;
    if (B.tt <= 0) { B.tt = .14 + rnd() * .1 - sk * .03; dpBotThink(S, p, B, rnd, C); }
    const tg = B.tg;
    const ok = tg && (tg.alive === undefined ? tg.hp > 0 : tg.alive);
    const bsp = dpBulSpd(p), rng = bsp * 1.5 * (C.b.length && C.b[0].sp ? Math.max(C.b[0].sp, .8) : 1);
    let mx = 0, my = 0, f = 0;
    if (ok) {
      const dx = tg.x - p.x, dy = tg.y - p.y, d = Math.hypot(dx, dy) || 1;
      const tl = Math.min(1.3, d / (bsp * (C.dmax ? .55 : 1))) * (.55 + .2 * sk);
      let ax = tg.x + (tg.vx || 0) * tl, ay = tg.y + (tg.vy || 0) * tl;
      B.aimT -= dt;
      if (B.aimT <= 0) { B.aimT = .3 + rnd() * .4; B.aimE = (rnd() - .5) * (.14 - sk * .04) * (1 + d / 1500); }
      const want = Math.atan2(ay - p.y, ax - p.x) + B.aimE;
      const turn = (7 + 5 * sk) * dt;
      I.a += clamp(adiff(I.a, want), -turn, turn);
      I.ad = d;
      const err = Math.abs(adiff(I.a, want));
      const within = d < (C.dmax ? 1500 : rng * .92);
      if (err < .1 + (tg.r || 50) / d * .7 && within) f = 1;
      if (C.au.length && !C.b.length) f = 0;
      const melee = C.body > 0;
      let dd = melee ? 0 : Math.min(rng * .45, 750);
      if (C.dmax) dd = 650;
      if (B.mode === 'flee') {
        mx = -dx / d; my = -dy / d;
      } else if (melee) {
        mx = dx / d; my = dy / d;
      } else {
        B.sT -= dt; if (B.sT <= 0) { B.sT = 1 + rnd() * 1.6; B.sx = -B.sx; }
        const ap = d > dd * 1.2 ? 1 : d < dd * .65 ? -1 : 0;
        mx = dx / d * ap + (-dy / d) * B.sx * .8; my = dy / d * ap + (dx / d) * B.sx * .8;
      }
    } else {
      const dx = B.wx - p.x, dy = B.wy - p.y, d = Math.hypot(dx, dy) || 1;
      mx = dx / d; my = dy / d;
      I.a += clamp(adiff(I.a, Math.atan2(my, mx)), -4 * dt, 4 * dt);
      I.ad = 500;
    }
    const m = 500;
    if (p.x < m) mx += (m - p.x) / m * 1.2; else if (p.x > DPW - m) mx -= (p.x - (DPW - m)) / m * 1.2;
    if (p.y < m) my += (m - p.y) / m * 1.2; else if (p.y > DPW - m) my -= (p.y - (DPW - m)) / m * 1.2;
    const L = Math.hypot(mx, my);
    if (L > 1) { mx /= L; my /= L; }
    I.mx = mx; I.my = my; I.f = f; I.f2 = 0;
  }
  function dpBotThink(S, p, B, rnd, C) {
    const sk = S.skill;
    while (p.pts > 0) {
      let done = false;
      for (const i of B.build) if (p.st[i] < DPMAXPT) { S.setStat(p, i); done = true; break; }
      if (!done) break;
    }
    const opts = dpUpOpts(p.cid, p.lv);
    if (opts.length) {
      let id;
      if (p.cid === 'tank') id = B.pref < .12 ? 'smasher' : ['twin', 'sniper', 'machine', 'flank'][(B.pref * 40) % 4 | 0];
      else id = opts[(B.pref * 97 * (p.lv + 1)) % opts.length | 0];
      S.chooseCls(p, id);
      if (DPCLS[p.ci].body) B.build = [1, 2, 0, 7, 3, 4, 5, 6];
    }
    const fov = dpFov(p), sight = 1900 * fov;
    let foe = null, fd = 1e9;
    for (const q of S.P) {
      if (!q.alive || q.team === p.team || q.shield > 0) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < sight && d < fd) { fd = d; foe = q; }
    }
    const lowHp = p.hp < p.mhp * .4;
    const strong = foe && foe.lv > p.lv + 9 && fd < 1500;
    if (foe && (lowHp || strong) && fd < 1500) { B.mode = 'flee'; B.tg = foe; B.fleeT = 2; return; }
    if (B.fleeT > 0) B.fleeT -= .16;
    if (lowHp && !foe) { B.mode = 'farm'; B.tg = null; B.wx = p.x; B.wy = p.y; return; }
    const fight = foe && (fd < 500 + 650 * B.agg || (B.mode === 'fight' && fd < 1300)) && foe.lv < p.lv * 1.2 + 3 && p.hp > p.mhp * .5;
    if (fight) { B.mode = 'fight'; B.tg = foe; return; }
    let best = null, bs = -1;
    S.nearShapes(p.x, p.y, 1500 * fov, s => {
      if (s.hp <= 0) return;
      const d = Math.hypot(s.x - p.x, s.y - p.y) + 60;
      const val = DPSHAPE[s.k].xp / DPSHAPE[s.k].hp;
      const sc = (val * 600 + DPSHAPE[s.k].xp * .02) / d * (s.k === 3 && p.lv < 25 ? .1 : 1);
      if (sc > bs) { bs = sc; best = s; }
    });
    if (best) { B.mode = 'farm'; B.tg = best; return; }
    B.mode = 'wander'; B.tg = null;
    B.wT -= .16;
    if (B.wT <= 0 || Math.hypot(B.wx - p.x, B.wy - p.y) < 300) {
      B.wT = 6 + rnd() * 6;
      const a = rnd() * TAU, d = 1500 + rnd() * 2500;
      B.wx = clamp(DPW / 2 + Math.cos(a) * d * (p.lv < 15 ? 1.1 : .8), 400, DPW - 400); B.wy = clamp(DPW / 2 + Math.sin(a) * d * (p.lv < 15 ? 1.1 : .8), 400, DPW - 400);
    }
  }

  const dpFmt = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'm' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : Math.round(n) + '';
  const DPTILE = ['#7fd6f2', '#f6a98b', '#b9a0f5', '#a4e87c', '#f5df78'];
  function dpTxt(c, s, x, y, sz, col, al, mw) {
    c.font = `800 ${sz}px Arial,Helvetica,sans-serif`; c.textAlign = al || 'left'; c.lineJoin = 'round';
    c.lineWidth = Math.max(2, sz * .22); c.strokeStyle = 'rgba(0,0,0,.72)';
    if (mw) { c.strokeText(s, x, y, mw); c.fillStyle = col || '#fff'; c.fillText(s, x, y, mw); } else { c.strokeText(s, x, y); c.fillStyle = col || '#fff'; c.fillText(s, x, y); }
  }
  const dpPoly = (c, x, y, r, n, a) => {
    c.beginPath();
    for (let i = 0; i < n; i++) { const t = a + i * TAU / n; if (i) c.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r); else c.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r); }
    c.closePath();
  };
  function dpBarrel(c, B, r, kick) {
    const L = B.l * r, w = B.w * r, e = B.w2 ? B.w2 * r : w;
    c.save(); c.translate(B.y * r - kick, B.x * r); c.rotate(B.a);
    c.beginPath();
    if (B.k === 't') { const m = L * .62; c.moveTo(0, -w / 2); c.lineTo(m, -w / 2); c.lineTo(m, -e / 2); c.lineTo(L, -e / 2); c.lineTo(L, e / 2); c.lineTo(m, e / 2); c.lineTo(m, w / 2); c.lineTo(0, w / 2); }
    else { c.moveTo(0, -w / 2); c.lineTo(L, -e / 2); c.lineTo(L, e / 2); c.lineTo(0, w / 2); }
    c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  function dpTank(c, t, col, lw, tm) {
    const C = DPCLS[t.ci], r = t.r;
    c.save(); c.translate(t.x, t.y);
    if (t.sh) c.globalAlpha = .55 + .2 * Math.sin(tm * 18);
    c.lineWidth = lw; c.lineJoin = 'round';
    if (C.body) {
      c.save(); c.rotate(tm * 1.3);
      c.fillStyle = DPCOL.gun[0]; c.strokeStyle = DPCOL.gun[1];
      if (C.body === 2) {
        c.beginPath();
        for (let i = 0; i < 16; i++) { const a = i * PI / 8, rr = i % 2 ? r * 1.02 : r * 1.55; if (i) c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        c.closePath();
      } else dpPoly(c, 0, 0, r * 1.3, 6, 0);
      c.fill(); c.stroke(); c.restore();
    }
    c.rotate(t.a);
    c.fillStyle = DPCOL.gun[0]; c.strokeStyle = DPCOL.gun[1];
    const kick = (t.kk || 0) * r * .22;
    for (const B of C.b) dpBarrel(c, B, r, kick);
    c.fillStyle = col[0]; c.strokeStyle = col[1];
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke();
    if (t.fl > 0) { c.fillStyle = 'rgba(255,70,70,.42)'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); }
    for (let i = 0; i < C.au.length; i++) {
      const A = C.au[i];
      c.save(); c.translate(A.x * r, A.y * r); c.rotate((t.aa && t.aa[i] != null ? t.aa[i] : t.a) - t.a);
      c.fillStyle = DPCOL.gun[0]; c.strokeStyle = DPCOL.gun[1];
      c.beginPath(); c.rect(0, -A.w * r * .5, A.l * r, A.w * r); c.fill(); c.stroke();
      c.beginPath(); c.arc(0, 0, r * .4, 0, TAU); c.fill(); c.stroke();
      c.restore();
    }
    if (C.au.length && !C.b.length && !C.body) { c.fillStyle = DPCOL.gun[0]; c.strokeStyle = DPCOL.gun[1]; }
    c.restore();
  }
  function dpShapeDraw(c, s, lw) {
    const D = DPSHAPE[s.k];
    c.save(); c.translate(s.x, s.y); c.rotate(s.a);
    dpPoly(c, 0, 0, D.r * 1.04, D.sides, -PI / 2);
    c.fillStyle = D.fill; c.strokeStyle = D.line; c.lineWidth = lw; c.lineJoin = 'round';
    c.fill(); c.stroke();
    if (s.k === 3) { dpPoly(c, 0, 0, D.r * .55, 5, -PI / 2); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); }
    if (s.fl > 0) { dpPoly(c, 0, 0, D.r * 1.04, D.sides, -PI / 2); c.fillStyle = 'rgba(255,70,70,.4)'; c.fill(); }
    c.restore();
  }
  function dpHpBar(c, x, y, w, f, lw) {
    const h = Math.max(5, w * .09);
    c.fillStyle = 'rgba(30,30,30,.7)'; c.beginPath(); c.roundRect(x - w / 2 - lw, y - lw, w + lw * 2, h + lw * 2, h); c.fill();
    c.fillStyle = '#85e37d'; c.beginPath(); c.roundRect(x - w / 2, y, Math.max(h, w * f), h, h / 2); c.fill();
  }
  function dpIcon(c, cid, x, y, size, col, ang) {
    const ci = DPCI[cid], C = DPCLS[ci];
    let ml = 1.4;
    for (const B of C.b) ml = Math.max(ml, B.l + B.y);
    const r = Math.min(size * .26, size * .42 / ml);
    c.save(); c.translate(x, y);
    dpTank(c, { x: 0, y: 0, a: ang == null ? -PI / 2 : ang, r, ci, aa: null, kk: 0, fl: 0, sh: 0 }, col, Math.max(1.5, r * .12), 0);
    c.restore();
  }

  function dpRenderer(ctx, W0, H0, o) {
    const R = { W: W0, H: H0, sc: .5, zoom: 1, camx: null, camy: null, fx: [], msgs: [], touch: false, statRects: [], clsRects: [], mmRect: null, tm: 0 };
    R.resize = (w, h) => { R.W = w; R.H = h; };
    R.msg = (t, d = 3, col) => { R.msgs.push({ t, d, age: 0, col }); if (R.msgs.length > 3) R.msgs.shift(); };
    R.addFx = e => { R.fx.push(Object.assign({ age: 0, life: e.k === 'kill' ? .5 : .32 }, e)); if (R.fx.length > 60) R.fx.shift(); };
    R.update = dt => {
      R.tm += dt;
      for (const f of R.fx) f.age += dt;
      R.fx = R.fx.filter(f => f.age < f.life);
      for (const m of R.msgs) m.age += dt;
      R.msgs = R.msgs.filter(m => m.age < m.d);
    };
    const colOf = (team, V) => team === V.myTeam ? DPCOL.t0 : DPCOL.t1;
    R.draw = (c, V) => {
      const W = R.W, H = R.H, T = R.touch;
      const base = Math.sqrt(W * H) / (T ? 1450 : 1500);
      R.zoom = R.zoom + (V.fov - R.zoom) * (R.camx == null ? 1 : .06);
      const sc = R.sc = base / R.zoom;
      R.camx = V.cx; R.camy = V.cy;
      const cx = V.cx, cy = V.cy, hw = W / 2 / sc, hh = H / 2 / sc;
      c.fillStyle = DPCOL.out; c.fillRect(0, 0, W, H);
      c.save(); c.translate(W / 2, H / 2); c.scale(sc, sc); c.translate(-cx, -cy);
      const lw = Math.max(4, 1.7 / sc);
      c.fillStyle = DPCOL.bg; c.fillRect(0, 0, DPW, DPW);
      c.fillStyle = 'rgba(110,100,150,.1)'; c.beginPath(); c.arc(DPW / 2, DPW / 2, 1500, 0, TAU); c.fill();
      if (V.mode === 'team') {
        const mine = V.myTeam === 0;
        c.fillStyle = 'rgba(0,178,225,.16)'; c.fillRect(mine ? 0 : DPW - 1500, 0, 1500, DPW);
        c.fillStyle = 'rgba(241,78,84,.16)'; c.fillRect(mine ? DPW - 1500 : 0, 0, 1500, DPW);
      }
      c.strokeStyle = DPCOL.grid; c.lineWidth = Math.max(1, .95 / sc);
      c.beginPath();
      const gs = 50, x0 = Math.max(0, Math.floor((cx - hw) / gs) * gs), x1 = Math.min(DPW, cx + hw), y0 = Math.max(0, Math.floor((cy - hh) / gs) * gs), y1 = Math.min(DPW, cy + hh);
      for (let x = x0; x <= x1; x += gs) { c.moveTo(x, Math.max(0, cy - hh)); c.lineTo(x, y1); }
      for (let y = y0; y <= y1; y += gs) { c.moveTo(Math.max(0, cx - hw), y); c.lineTo(x1, y); }
      c.stroke();
      const vis = (x, y, r) => Math.abs(x - cx) < hw + r && Math.abs(y - cy) < hh + r;
      for (const s of V.Sh) {
        const r = DPSHAPE[s.k].r;
        if (!vis(s.x, s.y, r * 1.2)) continue;
        dpShapeDraw(c, s, lw);
      }
      for (const s of V.Sh) {
        if (s.hp >= .999 || !vis(s.x, s.y, 200)) continue;
        const r = DPSHAPE[s.k].r;
        dpHpBar(c, s.x, s.y + r * 1.25 + 10, r * 1.5, s.hp, lw * .6);
      }
      for (const b of V.B) {
        if (!vis(b.x, b.y, b.r * 2)) continue;
        const col = colOf(b.tm, V);
        c.fillStyle = col[0]; c.strokeStyle = col[1]; c.lineWidth = lw; c.lineJoin = 'round';
        if (b.k === 0) { c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.stroke(); }
        else if (b.k === 1) { dpPoly(c, b.x, b.y, b.r * 1.45, 3, Math.atan2(b.vy, b.vx)); c.fill(); c.stroke(); }
        else { dpPoly(c, b.x, b.y, b.r * 1.35, 3, b.id * 1.7 + R.tm * .6); c.fill(); c.stroke(); dpPoly(c, b.x, b.y, b.r * .6, 3, b.id * 1.7 + R.tm * .6 + PI); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); }
      }
      for (const t of V.P) {
        if (t.mine || !vis(t.x, t.y, t.r * 3)) continue;
        dpTank(c, t, colOf(t.team, V), lw, R.tm);
      }
      for (const t of V.P) if (t.mine) dpTank(c, t, colOf(t.team, V), lw, R.tm);
      for (const t of V.P) {
        if (!vis(t.x, t.y, t.r * 3) || t.hp >= .999) continue;
        dpHpBar(c, t.x, t.y + t.r + 16 + t.r * .12, t.r * 2.1, t.hp, lw * .6);
      }
      for (const f of R.fx) {
        const k = f.age / f.life;
        c.globalAlpha = (1 - k) * .85;
        if (f.k === 'sd') {
          const D = DPSHAPE[f.sk];
          dpPoly(c, f.x, f.y, D.r * (1.04 + k * .55), D.sides, f.a - PI / 2 + k * .5);
          c.fillStyle = D.fill; c.strokeStyle = D.line; c.lineWidth = lw; c.fill(); c.stroke();
        } else {
          const col = f.own ? DPCOL.t0 : DPCOL.t1;
          c.fillStyle = col[0]; c.strokeStyle = col[1]; c.lineWidth = lw;
          c.beginPath(); c.arc(f.x, f.y, f.r * (1 + k * .9), 0, TAU); c.fill(); c.stroke();
        }
        c.globalAlpha = 1;
      }
      c.restore();
      const sx = x => (x - cx) * sc + W / 2, sy = y => (y - cy) * sc + H / 2;
      for (const t of V.P) {
        if (!t.name || !vis(t.x, t.y, t.r * 3)) continue;
        const sz = clamp(t.r * sc * .62, 11, 22);
        dpTxt(c, t.name, sx(t.x), sy(t.y) - t.r * sc - 8, sz, '#fff', 'center');
      }
    };
    const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
    function bar(c, x, y, w, h, f, col, label, sz) {
      c.fillStyle = 'rgba(25,25,25,.78)'; rr(c, x - 3, y - 3, w + 6, h + 6, h / 2 + 3); c.fill();
      c.fillStyle = 'rgba(95,95,95,.9)'; rr(c, x, y, w, h, h / 2); c.fill();
      if (f > 0) { c.fillStyle = col; rr(c, x, y, Math.max(h, w * Math.min(1, f)), h, h / 2); c.fill(); }
      if (label) dpTxt(c, label, x + w / 2, y + h / 2 + sz * .36, sz, '#fff', 'center', w - 10);
    }
    R.hud = (c, V) => {
      const W = R.W, H = R.H, T = R.touch, m = V.me;
      R.statRects = []; R.clsRects = []; R.mmRect = null;
      const lb = V.lb || [];
      const lw = T ? 134 : 196, lx = W - lw - (T ? 6 : 12), ly = T ? 6 : 12, rows = T ? 5 : 10, rh = T ? 17 : 21;
      c.fillStyle = 'rgba(20,20,20,.18)'; rr(c, lx - 6, ly - 4, lw + 12, 30 + Math.min(rows, Math.max(1, lb.length)) * (rh + 3), 8); c.fill();
      dpTxt(c, 'Scoreboard', lx + lw / 2, ly + 17, T ? 13 : 17, '#fff', 'center');
      const top = lb.length ? Math.max(1, lb[0][1]) : 1;
      let shown = false;
      for (let i = 0; i < rows; i++) {
        const e = lb[i]; if (!e) break;
        const y = ly + 26 + i * (rh + 3), mine = e[0] === V.me.id;
        if (mine) shown = true;
        const tc = V.mode === 'team' ? (V.teamOf(e[0]) === V.myTeam ? DPCOL.t0[0] : DPCOL.t1[0]) : '#85e37d';
        c.fillStyle = 'rgba(25,25,25,.7)'; rr(c, lx - 2, y - 2, lw + 4, rh + 4, 5); c.fill();
        c.fillStyle = 'rgba(90,90,90,.9)'; rr(c, lx, y, lw, rh, 4); c.fill();
        c.fillStyle = tc; rr(c, lx, y, Math.max(8, lw * e[1] / top), rh, 4); c.fill();
        if (mine) { c.strokeStyle = '#fff'; c.lineWidth = 2; rr(c, lx - 1, y - 1, lw + 2, rh + 2, 5); c.stroke(); }
        dpTxt(c, V.nameOf(e[0]) + ' - ' + dpFmt(e[1]), lx + lw / 2, y + rh / 2 + (T ? 4 : 5), T ? 10 : 12, '#fff', 'center', lw - 8);
      }
      if (V.mode === 'team' || V.left != null) {
        const parts = [];
        if (V.mode === 'team') parts.push([DPCOL.t0[0], dpFmt(V.tsc[V.myTeam])], [DPCOL.t1[0], dpFmt(V.tsc[1 - V.myTeam])]);
        const tx = W / 2, ty = T ? 46 : 52;
        if (parts.length) {
          const bw = T ? 150 : 220, bx = tx - bw / 2, a = V.tsc[V.myTeam], b = V.tsc[1 - V.myTeam], f = a + b > 0 ? a / (a + b) : .5;
          c.fillStyle = 'rgba(25,25,25,.78)'; rr(c, bx - 3, ty - 3, bw + 6, 20, 10); c.fill();
          c.fillStyle = DPCOL.t1[0]; rr(c, bx, ty, bw, 14, 7); c.fill();
          c.fillStyle = DPCOL.t0[0]; rr(c, bx, ty, Math.max(14, bw * f), 14, 7); c.fill();
          dpTxt(c, dpFmt(a), bx + 8, ty + 12, 11, '#fff', 'left'); dpTxt(c, dpFmt(b), bx + bw - 8, ty + 12, 11, '#fff', 'right');
        }
        if (V.left != null) dpTxt(c, fmtTime(V.left), tx, ty + (parts.length ? 36 : 14), T ? 13 : 16, '#fff', 'center');
      }
      const ms = T ? 78 : 118, mx = T ? 6 : W - ms - 12, my = T ? 6 : H - ms - 12;
      c.fillStyle = 'rgba(25,25,25,.75)'; rr(c, mx - 3, my - 3, ms + 6, ms + 6, 5); c.fill();
      c.fillStyle = '#c2c2c2'; c.fillRect(mx, my, ms, ms);
      if (V.mode === 'team') {
        const mine = V.myTeam === 0, bw = ms * 1500 / DPW;
        c.fillStyle = 'rgba(0,178,225,.35)'; c.fillRect(mine ? mx : mx + ms - bw, my, bw, ms);
        c.fillStyle = 'rgba(241,78,84,.35)'; c.fillRect(mine ? mx + ms - bw : mx, my, bw, ms);
      }
      c.fillStyle = 'rgba(110,100,150,.18)'; c.beginPath(); c.arc(mx + ms / 2, my + ms / 2, ms * 1500 / DPW, 0, TAU); c.fill();
      for (const t of V.P) {
        if (t.mine || t.team !== V.myTeam || V.mode !== 'team') continue;
        c.fillStyle = DPCOL.t0[0]; c.beginPath(); c.arc(mx + t.x / DPW * ms, my + t.y / DPW * ms, 2.5, 0, TAU); c.fill();
      }
      if (!V.dead) {
        const px = mx + clamp(V.cx / DPW, 0, 1) * ms, py = my + clamp(V.cy / DPW, 0, 1) * ms;
        c.fillStyle = '#00b2e1'; c.strokeStyle = '#003e55'; c.lineWidth = 2;
        c.save(); c.translate(px, py); c.rotate(m.a);
        c.beginPath(); c.moveTo(6, 0); c.lineTo(-4, 4); c.lineTo(-4, -4); c.closePath(); c.fill(); c.stroke(); c.restore();
      }
      if (V.dead) return;
      const lv = m.lv, sc = m.score;
      const lo = DPLV[lv], hi = DPLV[Math.min(DPMAXLV, lv + 1)];
      const lf = lv >= DPMAXLV ? 1 : (sc - lo) / Math.max(1, hi - lo);
      const cn = DPCLS[DPCI[m.cid]].name;
      if (T) {
        dpTxt(c, V.myName, W / 2, H - 52, 15, '#fff', 'center', 150);
        bar(c, 14, H - 44, W - 28, 12, V.topScore ? sc / V.topScore : 1, '#f2d44a', 'Score ' + dpFmt(sc), 10);
        bar(c, 14, H - 26, W - 28, 14, lf, '#85e37d', 'Lvl ' + lv + ' ' + cn, 11);
      } else {
        dpTxt(c, V.myName, W / 2, H - 80, 26, '#fff', 'center', 300);
        bar(c, W / 2 - 120, H - 70, 240, 20, V.topScore ? sc / V.topScore : 1, '#f2d44a', 'Score: ' + dpFmt(sc), 14);
        bar(c, W / 2 - 160, H - 40, 320, 24, lf, '#85e37d', 'Lvl ' + lv + ' ' + cn, 16);
      }
      const pts = m.pts;
      const sw = T ? (pts > 0 ? 128 : 56) : 208, sh = T ? 20 : 21, gap = T ? 3 : 5;
      const sx0 = T ? 6 : 12, sy0 = T ? Math.round(H * .27) : H - 24 - 8 * (sh + gap) - 6;
      if (pts > 0 || !T) dpTxt(c, pts > 0 ? 'x' + pts : 'Upgrades', sx0 + 2, sy0 - 6, T ? 13 : 14, pts > 0 ? '#ffe869' : '#fff', 'left');
      for (let i = 0; i < 8; i++) {
        const y = sy0 + i * (sh + gap), v = m.st[i], act = pts > 0 && v < DPMAXPT;
        c.fillStyle = 'rgba(25,25,25,.78)'; rr(c, sx0 - 3, y - 3, sw + 6, sh + 6, 6); c.fill();
        c.fillStyle = 'rgba(95,95,95,.9)'; rr(c, sx0, y, sw, sh, 4); c.fill();
        const seg = sw / DPMAXPT;
        for (let k = 0; k < DPMAXPT; k++) {
          c.fillStyle = k < v ? DPSCOL[i] : 'rgba(0,0,0,.18)';
          c.fillRect(sx0 + k * seg + 1.5, y + 2, seg - 3, sh - 4);
        }
        if (!T || pts > 0) dpTxt(c, DPSTAT[i], sx0 + 8, y + sh / 2 + 4, T ? 10 : 12, '#fff', 'left', sw - 40);
        if (!T) dpTxt(c, '[' + (i + 1) + ']', sx0 + sw - 6, y + sh / 2 + 4, 11, 'rgba(255,255,255,.8)', 'right');
        if (act) {
          c.strokeStyle = DPSCOL[i]; c.lineWidth = 2.5; rr(c, sx0 - 1, y - 1, sw + 2, sh + 2, 5); c.stroke();
          c.fillStyle = DPSCOL[i]; c.beginPath(); c.arc(sx0 + sw + (T ? 12 : 17), y + sh / 2, T ? 9 : 10, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(0,0,0,.7)'; c.lineWidth = 2; c.stroke();
          dpTxt(c, '+', sx0 + sw + (T ? 12 : 17), y + sh / 2 + 5, 16, '#fff', 'center');
          R.statRects.push({ x: sx0 - 4, y: y - 3, w: sw + (T ? 28 : 38), h: sh + 6, i });
        }
      }
      const opts = dpUpOpts(m.cid, lv);
      if (opts.length) {
        const ts = T ? 56 : 76, g = T ? 6 : 8;
        opts.forEach((cid, i) => {
          let x, y;
          if (T) { x = W - ts - 6; y = 142 + i * (ts + g); } else { x = 12 + (i % 2) * (ts + g); y = 12 + Math.floor(i / 2) * (ts + g); }
          c.fillStyle = 'rgba(25,25,25,.78)'; rr(c, x - 3, y - 3, ts + 6, ts + 6, 8); c.fill();
          c.fillStyle = DPTILE[i % DPTILE.length]; rr(c, x, y, ts, ts, 6); c.fill();
          dpIcon(c, cid, x + ts / 2, y + ts / 2 - (T ? 3 : 4), ts, DPCOL.t0);
          dpTxt(c, DPCLS[DPCI[cid]].name, x + ts / 2, y + ts - 5, T ? 9 : 11, '#fff', 'center', ts - 4);
          R.clsRects.push({ x, y, w: ts, h: ts, cid });
        });
        if (!T) dpTxt(c, 'Choose a class', 12, 12 + Math.ceil(opts.length / 2) * (ts + g) + 14, 13, '#ffe869', 'left');
      }
      R.msgs.forEach((mm, i) => {
        c.globalAlpha = clamp(Math.min(mm.age / .2, (mm.d - mm.age) / .5), 0, 1);
        dpTxt(c, mm.t, W / 2, (T ? 112 : 122) + i * (T ? 18 : 24), T ? 12 : 17, mm.col || '#fff', 'center', T ? 190 : 500);
        c.globalAlpha = 1;
      });
    };
    return R;
  }

  const DP_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="32" y="26" width="26" height="12" rx="1"/><circle cx="26" cy="32" r="14"/><path d="M8 10l8 5-3 8-8-2z"/><circle cx="54" cy="52" r="5"/></svg>';
  const DP_COVER = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#cdcdcd"/><g stroke="#00000020" stroke-width="2"><path d="M0 25h400M0 75h400M0 125h400M0 175h400M0 225h400M0 275h400M25 0v300M75 0v300M125 0v300M175 0v300M225 0v300M275 0v300M325 0v300M375 0v300"/></g><g stroke-width="5" stroke-linejoin="round"><rect x="95" y="168" width="14" height="14" fill="#ffe869" stroke="#bfae4e" transform="rotate(20 102 175)"/><polygon points="330,60 352,98 308,98" fill="#fc7677" stroke="#bd5a5a"/><polygon points="62,76 82,62 102,76 94,98 70,98" fill="#768dfc" stroke="#5a6abd"/><polygon points="340,230 348,244 332,244" fill="#fc7677" stroke="#bd5a5a"/></g><g transform="translate(160 150) rotate(-15)" stroke-width="5" stroke-linejoin="round"><rect x="0" y="-15" width="86" height="30" fill="#999" stroke="#727272"/><rect x="62" y="-15" width="24" height="30" fill="#999" stroke="#727272"/><circle r="40" fill="#00b2e1" stroke="#0083a8"/></g><g transform="translate(300 215) rotate(200)" stroke-width="5" stroke-linejoin="round"><rect x="0" y="-9" width="50" height="18" fill="#999" stroke="#727272"/><circle r="26" fill="#f14e54" stroke="#b2373b"/></g><g fill="#00b2e1" stroke="#0083a8" stroke-width="3"><circle cx="262" cy="130" r="5"/><circle cx="244" cy="136" r="5"/><circle cx="226" cy="141" r="5"/></g></svg>';
  const DP_CSS = baseCss('diep', '#00b2e1', '#00506a') + `
.gm-diep .io-wrap{background:#cdcdcd}
.gm-diep .io-wrap .g-canvas{background:#cdcdcd}
.gm-diep .io-ui.io-menu{background:radial-gradient(ellipse at 50% 40%,rgba(10,18,28,.55),rgba(5,9,14,.88))}
.gm-diep .io-logo{text-transform:lowercase;letter-spacing:.01em;color:#fff;text-shadow:0 4px 0 #00506a,0 0 22px rgba(0,178,225,.45)}
.gm-diep .io-logo i{font-style:normal;color:#00b2e1}
.gm-diep .io-hint kbd{color:#fff}
.gm-diep .io-btn.go{background:#2eb872}
.gm-diep .io-btn.big{background:#00a0cc}
.gm-diep .io-btn.alt{background:#4a5360}
.gm-diep .io-top{right:auto;left:50%;transform:translateX(-50%)}
.gm-diep .io-list{width:min(440px,100%);display:grid;gap:4px;text-align:left}
.gm-diep .io-list div{display:flex;justify-content:space-between;gap:8px;background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:13px}
.gm-diep .io-list div.me{background:rgba(0,178,225,.3)}
.gm-diep .io-list div.t1{box-shadow:inset 3px 0 #f14e54}
.gm-diep .io-list div.t0{box-shadow:inset 3px 0 #00b2e1}`;

  const DPENG = {};
  function dpMount(root, api) {
    const sh = ioShell(root, api, { dw: 880, dh: 560, tw: 400, th: 640 });
    const { canvas, ctx, coarse } = sh;
    const AU = makeAudio(api);
    const saved = Object.assign({ nick: '', mode: 'ffa', n: 20, skill: 1, tl: 0, otl: 600 }, api.load() || {});
    let S = null, R = null, role = null, st = 'menu', me = 0, acc = 0, menuOpen = false, overShown = false, deathT = 0, tNow = 0, submitted = false, autoF = false, lastOpt = 0, runBest = 0;
    const G = { hooked: false, players: [], bots: false, size: 0, byPid: new Map(), evBuf: [], eid: 0, sendT: 0, saveT: 0, hum: [], mode: 'ffa', tl: 0 };
    let GS = null;
    const keys = new Set();
    const inp = { mx: 0, my: 0, a: 0, f: 0, f2: 0, ad: 400 };
    const ptr = { x: sh.W / 2 + 100, y: sh.H / 2, down: false, rdown: false };
    const touches = new Map();
    const tctl = { move: null, aim: null };
    let lastSent = '', seq = 0, sendAcc = 0, shootT = 0, hurtT = 0, lastHp = 0;
    const hist = [];

    const SND = {
      shoot: v => { AU.noise(.3 * v, .06, 2600, 700, 1.2); AU.tone(260, 110, .05, .1 * v, 'square'); },
      pop: v => { AU.noise(.4 * v, .14, 1800, 300, 1.5); },
      hit: v => { AU.tone(200, 90, .08, .22 * v, 'triangle'); },
      lvl: v => { [523, 659, 784].forEach((f, i) => AU.tone(f, f * 1.02, .12, .2, 'triangle', i * .07)); },
      kill: v => { AU.tone(380, 760, .12, .22 * v, 'square'); },
      die: v => { AU.tone(300, 70, .5, .3, 'sawtooth'); AU.noise(.6, .4, 900, 120, .8); },
      win: v => { [523, 659, 784, 1047].forEach((f, i) => AU.tone(f, f, .2, .25, 'triangle', i * .14)); },
      up: v => { AU.tone(500, 800, .07, .16, 'triangle'); },
      tap: v => { AU.tone(700, 500, .04, .12, 'square'); }
    };
    const snd = (k, x, y, v = 1) => {
      if (api.muted || st === 'menu') return;
      let vol = v;
      if (x != null && R && R.camx != null) vol = v * clamp(1 - Math.hypot(x - R.camx, y - R.camy) / 1700, 0, 1) ** 1.3;
      if (vol < .03) return;
      try { SND[k](vol); } catch (e) {}
    };
    api.on(window, 'pointerdown', () => { try { AU.noise(0, .01, 100, 100); } catch (e) {} }, { once: true });

    const meId = () => role === 'guest' ? GS.me : me;
    const nameOf = id => (S ? S.P[id] && S.P[id].name : GS && GS.names[id]) || '?';
    const teamOf = id => (S ? S.P[id] && S.P[id].team : GS && GS.teams[id]);
    const myTeam = () => S ? S.P[me].team : GS.teams[GS.me];
    const modeNow = () => S ? S.mode : GS ? GS.mode : 'ffa';

    function onEv(e) {
      if (!R) return;
      const pid = meId();
      switch (e.k) {
        case 'sd': R.addFx({ k: 'sd', x: e.x, y: e.y, sk: e.sk, a: (e.a || 0) / 100 }); snd('pop', e.x, e.y, .7); break;
        case 'kill': {
          const t = teamOf(e.v);
          R.addFx({ k: 'kill', x: e.x, y: e.y, r: dpRad(e.lv || 1), own: t === myTeam() });
          snd('pop', e.x, e.y, 1);
          if (e.b === pid && e.v !== pid) { R.msg(`You killed ${nameOf(e.v)}`, 3.5, '#9cf59a'); snd('kill', null, null, .9); }
          else if (e.v === pid) { R.msg(e.b >= 0 ? `Killed by ${nameOf(e.b)}` : 'You died', 3, '#ff9b9b'); snd('die', null, null, 1); }
          break;
        }
        case 'lv': if (e.id === pid) { snd('lvl', null, null, .7); } break;
        case 'over': break;
      }
    }

    function newSim(humans, o, restore) {
      S = DpSim({ mode: o.mode, n: o.n, humans, tl: o.tl, skill: o.skill });
      S.init();
      R = dpRenderer(ctx, sh.W, sh.H, {});
      R.touch = coarse; R.resize(sh.W, sh.H);
      acc = 0; overShown = false; deathT = 0; submitted = false; runBest = 0;
    }
    function startSolo() {
      role = 'solo'; G.byPid.clear();
      newSim([{ name: (saved.nick || 'You').slice(0, 16), pid: null }], { mode: saved.mode, n: +saved.n, tl: +saved.tl, skill: +saved.skill });
      me = 0; beginPlay();
    }
    function beginPlay() {
      st = 'play'; sh.hide(); sh.top.hidden = false; menuOpen = false;
      sh.canvas.focus && sh.canvas.focus();
      keys.clear(); touches.clear(); tctl.move = tctl.aim = null; autoF = false; lastOpt = 0; lastHp = 0;
      if (R) { R.camx = null; R.fx.length = 0; R.msgs.length = 0; }
      api.score(0); api.label && api.label('Score');
      const mode = modeNow();
      if (R) R.msg(mode === 'team' ? 'Team deathmatch: red vs blue' : role === 'guest' ? 'Free for all' : 'Free for all: ' + S.P.length + ' tanks', 4);
    }
    const submitRun = () => { if (!submitted && runBest > 0) { submitted = true; try { api.submit(Math.round(runBest)); } catch (e) {} } };

    function menuHtml() {
      const hint = coarse ? 'Left stick moves, right stick aims and fires. Tap the green + to upgrade and tap a class tile at levels 15, 30 and 45.' : '<kbd>WASD</kbd> move · mouse aim · click or <kbd>Space</kbd> fire · <kbd>1-8</kbd> upgrade · <kbd>E</kbd> auto fire · right click repel drones · click a class tile at lv 15 / 30 / 45';
      return `<div class="io-logo">diep<i>.io</i></div><div class="io-sub">Shoot shapes, level up to <b>45</b>, evolve your tank and become the biggest on the scoreboard.</div>
<input class="io-nick" maxlength="16" placeholder="Nickname" value="${esc(saved.nick || '')}" data-nick>
<div class="io-row"><span class="io-lab">Mode</span>${segHtml('mode', [['ffa', 'Free for all'], ['team', '2 Teams']], saved.mode)}</div>
<div class="io-row"><span class="io-lab">Tanks</span>${segHtml('n', [[10, '10'], [20, '20'], [30, '30']], saved.n)}<span class="io-lab">Bots</span>${segHtml('skill', [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], saved.skill)}</div>
<div class="io-row"><span class="io-lab">Match</span>${segHtml('tl', [[0, 'Endless'], [300, '5 min'], [600, '10 min']], saved.tl)}</div>
<div class="io-row">${ioBtn('play', 'Play vs bots', 'big go')}${ioBtn('online', 'Play online', 'big')}</div><div class="io-hint">${hint}</div>`;
    }
    function showMenu() {
      submitRun();
      st = 'menu'; role = null; S = null; GS = null; R = null; sh.top.hidden = true; menuOpen = false;
      G.byPid.clear();
      sh.show(menuHtml(), a => {
        const nk = sh.ui.querySelector('[data-nick]');
        if (nk) { saved.nick = nk.value.trim().slice(0, 16); api.save(saved); }
        if (a === 'play') startSolo(); else if (a === 'online') goOnline();
      });
      bindSeg(sh.ui, (k, v) => { saved[k] = k === 'mode' ? v : +v; api.save(saved); });
    }

    const mineRec = () => role === 'guest' ? GS.meb : S && S.P[me];
    function fmtAlive(s) { return fmtTime(s); }
    function showDeath() {
      if (st !== 'play') return;
      st = 'dead';
      const p = mineRec();
      const by = role === 'guest' ? p.byN : S.P[me].byN;
      const b = [ioBtn('respawn', role === 'solo' ? 'Play again' : 'Respawn', 'go')];
      if (role === 'solo') b.push(ioBtn('menu', 'Menu', 'alt')); else b.push(ioBtn('leave', 'Leave', 'alt'));
      runBest = Math.max(runBest, p.best || p.score || 0);
      sh.show(`<div class="io-kick">Eliminated</div><div class="io-title">${by ? 'Killed by ' + esc(by) : 'You died'}</div>${ioStats([['Score', dpFmt(p.best || p.score)], ['Level', p.lv], ['Kills', p.kills], ['Alive', fmtAlive(role === 'guest' ? p.ta : S.P[me].tAlive)]])}<div class="io-row">${b.join('')}</div>`, endHandler, 'io-ui io-panel');
      snd('die', null, null, .5);
      submitRun();
    }
    function respawn() {
      if (role === 'guest') { api.net.send({ t: 'rs' }); GS.rsWait = tNow + 3000; if (GS.meb) GS.meb.alive = false; }
      else S.respawnHuman(S.P[me]);
      st = 'play'; deathT = 0; submitted = false; runBest = 0; sh.hide(); R.camx = null;
    }
    function showOver(res) {
      if (overShown) return;
      overShown = true; st = 'over';
      const rows = res.rows, mid = meId();
      const mr = res.all.find(r => r[0] === mid);
      let head;
      const tm = modeNow() === 'team';
      let win = false;
      if (tm && res.tsc) { const t = res.tsc[0] === res.tsc[1] ? -1 : res.tsc[0] > res.tsc[1] ? 0 : 1; win = t === myTeam(); head = t < 0 ? 'Draw' : (win ? 'Your team wins' : (t === 0 ? 'Blue' : 'Red') + ' team wins'); }
      else { win = rows[0] && rows[0][0] === mid; head = win ? 'You win!' : esc(rows[0] ? rows[0][1] : '') + ' wins'; }
      const list = `<div class="io-list">${rows.map((r, i) => `<div class="${r[0] === mid ? 'me ' : ''}${tm ? 't' + (r[4] === myTeam() ? 0 : 1) : ''}"><span>#${i + 1} ${esc(r[1])}</span><span>${dpFmt(r[2])} · ${r[3]} kills</span></div>`).join('')}</div>`;
      const b = [];
      if (role === 'solo') { b.push(ioBtn('again', 'Play again', 'go')); b.push(ioBtn('menu', 'Menu', 'alt')); }
      else if (role === 'host') { b.push(ioBtn('rematch', 'Rematch', 'go')); b.push(ioBtn('lobby', 'Back to lobby', 'alt')); b.push(ioBtn('leave', 'Leave', 'alt')); }
      else { b.push(ioBtn('leave', 'Leave', 'alt')); }
      const note = role === 'guest' ? '<div class="io-hint">Waiting for the host to start a rematch.</div>' : '';
      sh.show(`<div class="io-kick">Match over</div><div class="io-title">${head}</div>${ioStats([['Your score', dpFmt(mr ? mr[2] : 0)], ['Kills', mr ? mr[3] : 0], ['Rank', '#' + (res.all.findIndex(r => r[0] === mid) + 1)]])}${list}<div class="io-row">${b.join('')}</div>${note}`, endHandler, 'io-ui io-panel');
      snd(win ? 'win' : 'die', null, null, 1);
      if (mr) runBest = Math.max(runBest, mr[2]);
      submitRun();
      if (role === 'host') ioSaveSet('diep', null);
    }
    function endHandler(a) {
      if (a === 'respawn') { respawn(); return; }
      if (a === 'again') { startSolo(); return; }
      if (a === 'menu') { showMenu(); return; }
      if (a === 'lobby') { goOnline(); return; }
      if (a === 'rematch') { hostStart(null); return; }
      if (a === 'leave') leaveOnline();
    }
    function inGameMenu() {
      if (st !== 'play' && st !== 'dead') return;
      menuOpen = true;
      sh.show(`<div class="io-kick">Paused</div><div class="io-title">Menu</div><div class="io-row">${ioBtn('resume', 'Resume', 'go')}${ioBtn('quit', role === 'solo' ? 'Quit to menu' : 'Leave game', 'alt')}</div>`, a => {
        menuOpen = false; sh.hide();
        if (a === 'quit') { if (role === 'solo') showMenu(); else leaveOnline(); }
        else if (st === 'dead') showDeathAgain();
      }, 'io-ui io-panel');
    }
    function showDeathAgain() { st = 'play'; showDeath(); }
    sh.onTop = () => { if (menuOpen) { menuOpen = false; sh.hide(); if (st === 'dead') showDeathAgain(); } else inGameMenu(); };

    function doStat(i) {
      if (st !== 'play') return;
      if (role === 'guest') {
        const m = GS.meb;
        if (!m || !m.alive || m.pts <= 0 || m.st[i] >= DPMAXPT) return;
        m.st = m.st.slice(); m.st[i]++; m.pts--;
        api.net.send({ t: 'st', i }); snd('up', null, null, 1);
      } else if (S.setStat(S.P[me], i)) snd('up', null, null, 1);
    }
    function doCls(cid) {
      if (st !== 'play') return;
      if (role === 'guest') { api.net.send({ t: 'cl', c: cid }); snd('lvl', null, null, .6); const m = GS.meb; if (m) m.cid = cid; }
      else if (S.chooseCls(S.P[me], cid)) snd('lvl', null, null, .6);
    }

    function readInput() {
      let mx = 0, my = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
      const m = Math.hypot(mx, my) || 1;
      mx /= m; my /= m;
      let f = ptr.down || keys.has('Space') || autoF ? 1 : 0, f2 = ptr.rdown || keys.has('ShiftLeft') ? 1 : 0;
      const sc = R && R.sc || .5;
      let a = Math.atan2(ptr.y - sh.H / 2, ptr.x - sh.W / 2), ad = Math.hypot(ptr.x - sh.W / 2, ptr.y - sh.H / 2) / sc;
      if (tctl.move) { const t = tctl.move, dx = t.x - t.ox, dy = t.y - t.oy, d = Math.hypot(dx, dy), k = Math.min(1, d / 46); if (d > 6) { mx = dx / d * k; my = dy / d * k; } else mx = my = 0; }
      if (tctl.aim) { const t = tctl.aim, dx = t.x - t.ox, dy = t.y - t.oy, d = Math.hypot(dx, dy); if (d > 10) { a = Math.atan2(dy, dx); ad = 150 + Math.min(1, d / 56) * 1100; t.lastA = a; } else if (t.lastA != null) a = t.lastA; f = d > 36 || autoF ? 1 : 0; }
      inp.mx = mx; inp.my = my; inp.a = a; inp.f = f; inp.f2 = f2; inp.ad = clamp(ad, 40, 3000);
    }

    function pointerHud(x, y) {
      if (!R || st !== 'play') return false;
      const hit = r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
      for (const r of R.clsRects) if (hit(r)) { doCls(r.cid); return true; }
      for (const r of R.statRects) if (hit(r)) { doStat(r.i); return true; }
      return false;
    }
    const cvXY = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * sh.W / r.width, y: (e.clientY - r.top) * sh.H / r.height }; };
    api.on(canvas, 'contextmenu', e => e.preventDefault());
    api.on(canvas, 'pointerdown', e => {
      if (st !== 'play' && st !== 'dead') return;
      if (sh.shown()) return;
      const p = cvXY(e);
      ptr.x = p.x; ptr.y = p.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      if (e.pointerType !== 'touch' && e.button === 2) { ptr.rdown = true; e.preventDefault(); return; }
      if (pointerHud(p.x, p.y)) { e.preventDefault(); return; }
      if (e.pointerType === 'touch') {
        const t = { id: e.pointerId, x: p.x, y: p.y, ox: p.x, oy: p.y };
        if (p.x < sh.W / 2) { if (!tctl.move) tctl.move = t; } else if (!tctl.aim) tctl.aim = t;
        touches.set(e.pointerId, t);
      } else if (e.button === 0) ptr.down = true;
      e.preventDefault();
    });
    api.on(canvas, 'pointermove', e => {
      const p = cvXY(e);
      if (e.pointerType !== 'touch') { ptr.x = p.x; ptr.y = p.y; return; }
      const t = touches.get(e.pointerId);
      if (t) { t.x = p.x; t.y = p.y; }
    });
    const pup = e => {
      if (e.pointerType !== 'touch') { if (e.button === 2) ptr.rdown = false; else ptr.down = false; }
      const t = touches.get(e.pointerId);
      if (t) { touches.delete(e.pointerId); if (tctl.move === t) tctl.move = null; if (tctl.aim === t) tctl.aim = null; }
    };
    api.on(canvas, 'pointerup', pup);
    api.on(canvas, 'pointercancel', pup);
    api.on(window, 'blur', () => { keys.clear(); ptr.down = false; ptr.rdown = false; });
    api.on(window, 'keyup', e => keys.delete(e.code));
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (st !== 'play') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const c = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft'].includes(c)) { keys.add(c); e.preventDefault(); return; }
      if (e.repeat) return;
      if (c >= 'Digit1' && c <= 'Digit8') doStat(+c.slice(5) - 1);
      else if (c === 'KeyE') { autoF = !autoF; R.msg(autoF ? 'Auto fire on' : 'Auto fire off', 1.5); }
    });

    function viewFocus() {
      const mp = S.P[me];
      if (mp.alive) return mp;
      const k = mp.by >= 0 ? S.P[mp.by] : null;
      if (k && k.alive) return k;
      for (const e of S.lb) { const q = S.P[e[0]]; if (q && q.alive) return q; }
      return mp;
    }
    function buildViewLocal(a) {
      const mp = S.P[me], fp = viewFocus(), alive = mp.alive;
      const P = [];
      for (const p of S.P) {
        if (!p.alive) continue;
        const own = p === mp;
        const x = clamp(p.x + p.vx * a, p.r, DPW - p.r), y = clamp(p.y + p.vy * a, p.r, DPW - p.r);
        P.push({ id: p.id, x, y, a: own ? inp.a : p.a, r: p.r, ci: p.ci, team: p.team, name: p.name, hp: p.hp / p.mhp, sh: p.shield > 0 ? 1 : 0, fl: p.fl, kk: p.kk, aa: p.aa, mine: own });
      }
      const fr = P.find(r => r.id === fp.id);
      const cx = fr ? fr.x : fp.x, cy = fr ? fr.y : fp.y;
      const fov = dpFov(fp), ri = 2300 * fov;
      const B = [];
      for (const b of S.bul) { if (Math.abs(b.x - cx) > ri || Math.abs(b.y - cy) > ri) continue; B.push({ id: b.id, x: b.x + b.vx * a, y: b.y + b.vy * a, r: b.r, k: b.k, tm: b.tm, vx: b.vx, vy: b.vy }); }
      const Sh = [];
      for (const s of S.sh) { if (Math.abs(s.x - cx) > ri || Math.abs(s.y - cy) > ri) continue; Sh.push({ id: s.id, k: s.k, x: s.x + s.vx * a, y: s.y + s.vy * a, a: s.a + s.va * a, hp: s.hp / s.mhp, fl: s.fl }); }
      return {
        t: S.t, me: { id: mp.id, x: mp.x, y: mp.y, a: inp.a, lv: mp.lv, score: mp.score, pts: mp.pts, st: mp.st, cid: mp.cid, hp: mp.hp, mhp: mp.mhp, alive }, cx, cy, fov, P, B, Sh, lb: S.lb, mode: S.mode, myTeam: mp.team, tsc: S.tsc, left: S.tl > 0 ? Math.max(0, S.tl - S.t) : null,
        dead: !alive, nameOf, teamOf, myName: mp.name, topScore: S.lb.length ? S.lb[0][1] : 1
      };
    }

    function trackMe(m, now) {
      if (m.alive) {
        if (lastHp && m.hp < lastHp - .01 && now - hurtT > 140) { hurtT = now; snd('hit', null, null, .6); }
        lastHp = m.hp;
        if (inp.f && now - shootT > clamp(dpReload(m) * 1000 * .9, 90, 520)) { shootT = now; snd('shoot', null, null, .4); }
        if (m.score !== runBest) { runBest = Math.max(runBest, m.score); api.score(Math.round(m.score)); }
        const no = dpUpOpts(m.cid, m.lv).length;
        if (no && !lastOpt) R.msg('Choose a class upgrade!', 4, '#ffe869');
        lastOpt = no;
      } else lastHp = 0;
    }

    function hostFrame(dt, now) {
      if (menuOpen && role === 'solo') return;
      readInput();
      const mp = S.P[me];
      if (mp.alive && st === 'play') { const I = mp.in; I.mx = inp.mx; I.my = inp.my; I.a = inp.a; I.f = inp.f; I.f2 = inp.f2; I.ad = inp.ad; }
      else if (mp.alive) { mp.in.mx = mp.in.my = 0; mp.in.f = 0; }
      acc += dt;
      let n = 0;
      while (acc >= DPDT && n < 4) {
        acc -= DPDT; n++;
        S.step(DPDT);
        if (S.ev.length) { for (const e of S.ev) hostEv(e); S.ev.length = 0; }
        if (role === 'host') hostNet();
      }
      if (role === 'host') for (const g of G.byPid.values()) { const q = S.P[g.i]; if (q && now - (g.inAt || now) > 1200) { q.in.mx = q.in.my = 0; q.in.f = 0; q.in.f2 = 0; } }
      if (n === 4) acc = 0;
      R.update(dt);
      trackMe(mp, now);
      if (st === 'play' && !mp.alive && !deathT) deathT = now;
      if (st === 'play' && !mp.alive && now - deathT > 1500 && !S.over) showDeath();
      if (S.over && !overShown) {
        if (role === 'host') api.net.send({ t: 'over', res: S.res }, false);
        showOver(S.res);
      }
    }
    function hostEv(e) {
      onEv(e);
      if (role === 'host') { e.i2 = ++G.eid; G.evBuf.push(e); }
    }

    const wireInit = pid => ({ t: 'init', n: S.P.length, mode: S.mode, tl: S.tl, me: G.byPid.get(pid).i, names: S.P.map(p => p.name), bots: S.P.map(p => p.bot ? 1 : 0), teams: S.P.map(p => p.team), left: S.tl > 0 ? S.tl - S.t : 0 });
    const EV_GLOBAL = { kill: 1, over: 1 };
    const slimEv = e => { const o = {}; for (const k in e) { if (k === 'i2') continue; o[k] = e[k]; } return o; };
    const mePack = p => ({ id: p.id, x: q10(p.x) / 10, y: q10(p.y) / 10, vx: Math.round(p.vx), vy: Math.round(p.vy), lv: p.lv, score: Math.round(p.score), pts: p.pts, st: p.st, cid: p.cid, hp: Math.round(p.hp * 10) / 10, mhp: p.mhp, alive: p.alive, kills: p.kills, sh: p.shield > 0 ? 1 : 0, spd: Math.round(dpMaxSpd(p)), by: p.by, byN: p.byN, ta: Math.round(p.tAlive), best: Math.round(p.best) });
    function snapFor(g) {
      const p = S.P[g.i];
      let fp = p;
      if (!p.alive) {
        const k = p.by >= 0 ? S.P[p.by] : null;
        fp = k && k.alive ? k : null;
        if (!fp) for (const e of S.lb) { const q = S.P[e[0]]; if (q && q.alive) { fp = q; break; } }
        if (!fp) fp = p;
      }
      const fov = dpFov(fp), ri = 1700 * fov, cx = fp.x, cy = fp.y;
      const d = { t: 's', k: Math.round(S.t * 1000) / 1000, q: g.ack || 0, sp: fp.id, c: [Math.round(cx), Math.round(cy)], lb: S.lb, ts: [Math.round(S.tsc[0]), Math.round(S.tsc[1])], lf: S.tl > 0 ? Math.max(0, Math.round(S.tl - S.t)) : -1, fv: Math.round(fov * 1000) / 1000 };
      const Pn = [];
      for (const q of S.P) {
        if (!q.alive || q === p) continue;
        if (Math.abs(q.x - cx) > ri || Math.abs(q.y - cy) > ri) continue;
        const r = [q.id, q10(q.x), q10(q.y), q100(q.a), q.lv, q.ci, Math.round(q.hp / q.mhp * 100), (q.fl > 0 ? 1 : 0) | (q.shield > 0 ? 2 : 0)];
        if (q.aa.length) for (const a of q.aa) r.push(q100(a));
        Pn.push(r);
      }
      d.P = Pn;
      const Bn = [];
      for (const b of S.bul) { if (Math.abs(b.x - cx) > ri || Math.abs(b.y - cy) > ri) continue; Bn.push([b.id, Math.round(b.x), Math.round(b.y), Math.round(b.vx), Math.round(b.vy), Math.round(b.r), b.tm * 4 + b.k]); }
      d.B = Bn;
      const kn = g.known, stp = ++g.ls, sa = [], sr = [];
      for (const s of S.sh) {
        if (Math.abs(s.x - cx) > ri + 80 || Math.abs(s.y - cy) > ri + 80) continue;
        const pc = Math.round(s.hp / s.mhp * 100), v = kn.get(s.id);
        if (!v || v.hp !== pc || S.t - v.t > .9) {
          sa.push([s.id, s.k, Math.round(s.x), Math.round(s.y), q100(s.a), pc, Math.round(s.vx), Math.round(s.vy), q100(s.va)]);
          kn.set(s.id, { hp: pc, t: S.t, s: stp });
        } else v.s = stp;
      }
      for (const [id, v] of kn) if (v.s !== stp) { sr.push(id); kn.delete(id); }
      d.sa = sa; d.sr = sr;
      d.me = mePack(p);
      const ev = [];
      for (const e of G.evBuf) {
        if (e.i2 <= g.lastEv) continue;
        if (e.k === 'lv') { if (e.id === g.i) ev.push(slimEv(e)); continue; }
        if (!EV_GLOBAL[e.k] && e.x != null && (Math.abs(e.x - cx) > ri + 200 || Math.abs(e.y - cy) > ri + 200)) continue;
        ev.push(slimEv(e));
      }
      g.lastEv = G.eid;
      d.E = ev;
      return d;
    }
    function hostNet() {
      if (++G.sendT % 2) return;
      while (G.evBuf.length && G.evBuf[0].i2 < G.eid - 400) G.evBuf.shift();
      for (const g of G.byPid.values()) {
        if (!g.ready || !api.net.connected) continue;
        const d = snapFor(g);
        api.net.sendTo(g.pid, d, !d.E.length);
      }
      if (S.t - G.saveT > 2.5) { G.saveT = S.t; hostSave(); }
    }
    function hostSave() {
      if (role !== 'host' || !S || S.over) return;
      ioSaveSet('diep', { code: api.net.code, at: Date.now(), n: S.P.length, mode: S.mode, tl: S.tl, skill: S.skill, hum: G.hum, dump: S.dump() });
    }

    function hookNet() {
      if (G.hooked) return;
      G.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !role) return;
        if (role === 'host') hostData(d, from); else if (role === 'guest') guestData(d);
      });
      api.net.on('leave', pl => { if (role === 'host' && pl) seatToBot(pl.id); });
      api.net.on('rejoin', pl => {
        if (role !== 'host' || !pl || !S) return;
        const g = G.byPid.get(pl.id);
        if (!g) return;
        g.known.clear(); g.lastEv = G.eid; g.ready = false;
        api.net.sendTo(pl.id, wireInit(pl.id));
      });
      api.net.on('lobby', () => { if (role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (role !== 'guest') return;
        role = null; GS = null; st = 'left'; sh.top.hidden = true;
        sh.show(`<div class="io-kick">Online</div><div class="io-title">${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</div><div class="io-sub">${why === 'host-left' ? 'The host ended the game.' : why === 'kicked' ? 'The host removed you from the party.' : 'The connection to the host was lost.'}</div><div class="io-row">${ioBtn('online', 'Online lobby', 'go')}${ioBtn('menu', 'Menu', 'alt')}</div>`, a => { if (a === 'online') goOnline(); else showMenu(); }, 'io-ui io-panel');
        snd('die', null, null, 1);
      });
    }
    function hostData(d, from) {
      const g = G.byPid.get(from);
      if (d.t === 'hi') {
        if (!g || !S) return;
        g.known.clear(); g.lastEv = G.eid; g.ready = false;
        api.net.sendTo(from, wireInit(from));
        return;
      }
      if (!g || !S) return;
      const p = S.P[g.i];
      if (d.t === 'rdy') { g.ready = true; return; }
      if (d.t === 'in') {
        if (!p || !p.alive) { g.ack = d.q | 0; return; }
        if ((d.q | 0) < (g.ack | 0)) return;
        g.ack = d.q | 0; g.inAt = tNow;
        const I = p.in;
        I.mx = clamp(+d.mx || 0, -1, 1); I.my = clamp(+d.my || 0, -1, 1);
        if (Number.isFinite(d.a)) I.a = d.a;
        I.f = d.f ? 1 : 0; I.f2 = d.f2 ? 1 : 0; I.ad = clamp(+d.ad || 400, 40, 3000);
      } else if (d.t === 'st') S.setStat(p, d.i | 0);
      else if (d.t === 'cl') { if (typeof d.c === 'string') S.chooseCls(p, d.c); }
      else if (d.t === 'rs') S.respawnHuman(p);
    }
    function seatToBot(pid) {
      const g = G.byPid.get(pid);
      if (!g || !S) return;
      const p = S.P[g.i];
      G.byPid.delete(pid);
      if (!p) return;
      p.pid = null; p.bot = true; dpBotInit(S, p, Math.random); p.in.f = 0; p.in.mx = p.in.my = 0;
      api.toast && api.toast(p.name + ' left. A bot takes over.');
    }

    function startPanel() {
      sh.show(`<div class="io-kick">Online</div><div class="io-title">Start the match</div><div class="io-sub">${G.players.length} player${G.players.length > 1 ? 's' : ''} in the party. Bots fill the rest.</div>
<div class="io-row"><span class="io-lab">Mode</span>${segHtml('mode', [['ffa', 'Free for all'], ['team', '2 Teams']], saved.mode)}</div>
<div class="io-row"><span class="io-lab">Tanks</span>${segHtml('n', [[10, '10'], [20, '20'], [30, '30']], saved.n)}<span class="io-lab">Bots</span>${segHtml('skill', [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], saved.skill)}</div>
<div class="io-row"><span class="io-lab">Match</span>${segHtml('otl', [[0, 'Endless'], [300, '5 min'], [600, '10 min'], [900, '15 min']], saved.otl)}</div>
<div class="io-row">${ioBtn('go', 'Start', 'big go')}${ioBtn('leave', 'Leave', 'alt')}</div>`, a => { if (a === 'go') hostStart(null); else if (a === 'leave') leaveOnline(); }, 'io-ui io-panel');
      bindSeg(sh.ui, (k, v) => { saved[k] = k === 'mode' ? v : +v; api.save(saved); });
    }
    async function goOnline() {
      hookNet();
      st = 'wait'; role = null; S = null; GS = null; R = null; sh.top.hidden = true;
      sh.hide();
      const r = await api.net.room({ title: 'Diep.io', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 2, max: 16, bots: true });
      if (!api.alive) return;
      if (!r) { showMenu(); return; }
      if (r.role === 'host') {
        role = 'host';
        G.players = r.players.slice(0, 16); G.bots = !!r.bots; G.size = +r.size || G.players.length;
        const sv = ioSaveGet('diep', api.net.code);
        if (sv && sv.dump) {
          const names = G.players.slice(1).map(x => x.name), hum = sv.hum || [];
          const rest = hum.slice(1);
          if (names.every(nm => rest.includes(nm))) {
            const lost = rest.filter(nm => !names.includes(nm)).length;
            sh.show(`<div class="io-kick">Online</div><div class="io-title">Game in progress</div><div class="io-sub">Saved ${sv.mode === 'team' ? 'team' : 'free for all'} game, ${fmtTime(sv.dump.t)} played.${lost ? ' ' + lost + ' missing player' + (lost > 1 ? 's' : '') + ' will be replaced by bots.' : ''}</div><div class="io-row">${ioBtn('go', 'Resume game', 'go')}${ioBtn('new', 'New game', 'alt')}${ioBtn('leave', 'Leave', 'alt')}</div>`, a => {
              if (a === 'go') hostStart(sv); else if (a === 'new') startPanel(); else leaveOnline();
            }, 'io-ui io-panel');
            return;
          }
        }
        startPanel();
      } else {
        role = 'guest';
        sh.show('<div class="io-kick">Online</div><div class="io-title">Connected</div><div class="io-sub">Waiting for the host to start the game...</div>' + ioBtn('leave', 'Leave', 'alt'), a => { if (a === 'leave') leaveOnline(); }, 'io-ui io-panel');
        api.net.send({ t: 'hi' });
      }
    }
    function leaveOnline() {
      ioSaveSet('diep', null);
      try { api.net.close(); } catch (e) {}
      showMenu();
    }
    function hostStart(sv) {
      G.byPid.clear(); G.evBuf.length = 0; G.eid = 0; G.sendT = 0; G.saveT = 0;
      const pls = G.players.filter((x, k) => !k || api.net.players.some(q => q.id === x.id && !q.away));
      let humans;
      if (sv) {
        humans = sv.hum.map(nm => ({ name: nm, pid: null }));
        newSim(humans, { mode: sv.mode, n: sv.n, tl: sv.tl, skill: sv.skill });
        S.restore(sv.dump);
        const taken = new Set();
        S.P.forEach((p, i) => {
          if (i >= humans.length) return;
          if (i === 0) { p.name = pls[0].name; p.bot = false; p.pid = null; return; }
          const pl = pls.find(x => x.name === p.name && !taken.has(x.id));
          if (pl && !p.bot) { taken.add(pl.id); p.pid = pl.id; G.byPid.set(pl.id, { i, pid: pl.id, known: new Map(), ls: 0, lastEv: 0, ack: 0, ready: false }); }
          else if (!p.bot) { p.bot = true; dpBotInit(S, p, Math.random); }
        });
        S.P[0].bot = false;
        ioSaveSet('diep', null);
      } else {
        humans = pls.map(x => ({ name: x.name, pid: x.id }));
        const n = G.bots ? Math.max(+saved.n, humans.length) : Math.max(humans.length, 2);
        newSim(humans, { mode: saved.mode, n, tl: +saved.otl, skill: +saved.skill });
        humans.forEach((h, i) => { if (i) G.byPid.set(h.pid, { i, pid: h.pid, known: new Map(), ls: 0, lastEv: 0, ack: 0, ready: false }); });
      }
      me = 0;
      G.hum = humans.map(h => h.name);
      G.players = pls;
      beginPlay();
      for (const g of G.byPid.values()) api.net.sendTo(g.pid, wireInit(g.pid));
      hostSave();
    }

    function guestData(d) {
      if (d.t === 'init') {
        S = null; ioSaveSet('diep', null);
        R = dpRenderer(ctx, sh.W, sh.H, {}); R.touch = coarse; R.resize(sh.W, sh.H);
        GS = { me: d.me, n: d.n, mode: d.mode, tl: d.tl, names: d.names, teams: d.teams, off: 0, has: false, buf: [], shapes: new Map(), pr: { x: 0, y: 0, vx: 0, vy: 0 }, meb: null, corr: { x: 0, y: 0 }, inited: false, c: [DPW / 2, DPW / 2], over: null, lb: [], ts: [0, 0], lf: -1, fv: 1, sp: d.me, rsWait: 0 };
        hist.length = 0; seq = 0; overShown = false; deathT = 0; submitted = false; runBest = 0;
        role = 'guest';
        beginPlay();
        api.net.send({ t: 'rdy' });
        return;
      }
      if (!GS) return;
      if (d.t === 's') gSnap(d);
      else if (d.t === 'over') GS.over = d;
    }
    function gSnap(d) {
      const now = performance.now();
      const o = now - d.k * 1000;
      GS.off = GS.has ? Math.min(o, GS.off + 1) : o; GS.has = true;
      const P = new Map();
      for (const a of d.P) P.set(a[0], { id: a[0], x: a[1] / 10, y: a[2] / 10, a: a[3] / 100, lv: a[4], ci: a[5], hp: a[6] / 100, fl: a[7], aa: a.length > 8 ? a.slice(8).map(v => v / 100) : null });
      const snap = { k: d.k, P, B: d.B, E: d.E, evDone: !d.E.length, at: now };
      GS.buf.push(snap);
      if (GS.buf.length > 14) GS.buf.shift();
      for (const a of d.sa) GS.shapes.set(a[0], { id: a[0], k: a[1], x: a[2], y: a[3], a: a[4] / 100, hp: a[5] / 100, vx: a[6], vy: a[7], va: a[8] / 100, at: now });
      for (const id of d.sr) GS.shapes.delete(id);
      GS.lb = d.lb; GS.ts = d.ts; GS.lf = d.lf; GS.fv = d.fv; GS.c = d.c; GS.sp = d.sp;
      const m = d.me;
      GS.meb = Object.assign(m, { st: m.st });
      if (m.alive) {
        const pr = GS.pr;
        if (!GS.inited) { pr.x = m.x; pr.y = m.y; pr.vx = m.vx; pr.vy = m.vy; GS.inited = true; }
        else {
          const ox = pr.x, oy = pr.y;
          let x = m.x, y = m.y, vx = m.vx, vy = m.vy;
          while (hist.length && hist[0].q <= d.q) hist.shift();
          const r = dpRad(m.lv);
          for (const h of hist) { const q = stepPred(x, y, vx, vy, h.mx, h.my, h.dt, m.spd, r); x = q[0]; y = q[1]; vx = q[2]; vy = q[3]; }
          const ex = x - ox, ey = y - oy;
          if (Math.hypot(ex, ey) > 220) { GS.corr.x = 0; GS.corr.y = 0; } else { GS.corr.x -= ex; GS.corr.y -= ey; }
          pr.x = x; pr.y = y; pr.vx = vx; pr.vy = vy;
        }
      } else { GS.pr.x = m.x; GS.pr.y = m.y; GS.pr.vx = 0; GS.pr.vy = 0; GS.inited = false; }
    }
    function stepPred(x, y, vx, vy, mx, my, dt, spd, r) {
      const mag = Math.hypot(mx, my);
      const tvx = mag > 0 ? mx / Math.max(1, mag) * spd : 0, tvy = mag > 0 ? my / Math.max(1, mag) * spd : 0;
      const k = Math.min(1, dt * 3);
      vx += (tvx - vx) * k; vy += (tvy - vy) * k;
      x += vx * dt; y += vy * dt;
      if (x < r) { x = r; if (vx < 0) vx = 0; } else if (x > DPW - r) { x = DPW - r; if (vx > 0) vx = 0; }
      if (y < r) { y = r; if (vy < 0) vy = 0; } else if (y > DPW - r) { y = DPW - r; if (vy > 0) vy = 0; }
      return [x, y, vx, vy];
    }
    function guestFrame(dt, now) {
      readInput();
      const m = GS.meb;
      if (!m) return null;
      const alive = m.alive && st === 'play';
      if (m.alive) {
        const r = stepPred(GS.pr.x, GS.pr.y, GS.pr.vx, GS.pr.vy, st === 'play' ? inp.mx : 0, st === 'play' ? inp.my : 0, dt, m.spd, dpRad(m.lv));
        GS.pr.x = r[0]; GS.pr.y = r[1]; GS.pr.vx = r[2]; GS.pr.vy = r[3];
      }
      sendAcc += dt;
      const imx = st === 'play' ? inp.mx : 0, imy = st === 'play' ? inp.my : 0, ifr = st === 'play' ? inp.f : 0;
      hist.push({ q: seq + 1, mx: imx, my: imy, dt });
      if (hist.length > 90) hist.shift();
      const sig = imx.toFixed(2) + imy.toFixed(2) + ifr + inp.f2 + inp.a.toFixed(2);
      if (sendAcc >= .033 || (sig !== lastSent && sendAcc >= .012)) {
        sendAcc = 0; lastSent = sig; seq++;
        if (m.alive) api.net.send({ t: 'in', q: seq, mx: +imx.toFixed(3), my: +imy.toFixed(3), a: +inp.a.toFixed(3), f: ifr, f2: inp.f2, ad: Math.round(inp.ad) }, true);
      }
      const rt = now - GS.off - 110;
      const B = GS.buf;
      for (const s of B) { if (s.k * 1000 + GS.off > now - 110) break; if (!s.evDone) { s.evDone = true; for (const e of s.E) onEv(e); } }
      while (B.length > 2 && B[1].k * 1000 + GS.off <= rt) B.shift();
      GS.corr.x *= Math.exp(-dt * 8); GS.corr.y *= Math.exp(-dt * 8);
      return rt;
    }
    function buildViewGuest(now, rt) {
      const m = GS.meb, B = GS.buf;
      const A = B[0], C = B[1] || A;
      const kA = A.k * 1000 + GS.off, kC = C.k * 1000 + GS.off;
      const al = C === A ? 0 : clamp((rt - kA) / (kC - kA), 0, 1);
      const alive = m.alive;
      const pr = GS.pr;
      const P = [];
      let cx, cy;
      const mx = pr.x + GS.corr.x, my = pr.y + GS.corr.y;
      const mt = GS.teams[GS.me];
      if (alive) { P.push({ id: GS.me, x: mx, y: my, a: inp.a, r: dpRad(m.lv), ci: DPCI[m.cid], team: mt, name: GS.names[GS.me], hp: m.hp / m.mhp, sh: m.sh, fl: 0, kk: 0, aa: null, mine: true }); cx = mx; cy = my; }
      for (const [id, c] of C.P) {
        const a = A.P.get(id) || c;
        const r = { id, x: lerp(a.x, c.x, al), y: lerp(a.y, c.y, al), a: a.a + adiff(a.a, c.a) * al, r: dpRad(c.lv), ci: c.ci, team: GS.teams[id], name: GS.names[id], hp: c.hp, sh: c.fl & 2 ? 1 : 0, fl: c.fl & 1 ? .1 : 0, kk: 0, aa: c.aa, mine: false };
        if (id === GS.sp && !alive) { cx = r.x; cy = r.y; }
        P.push(r);
      }
      if (cx == null) { cx = GS.c[0]; cy = GS.c[1]; }
      const Cs = B.find(s => s.k * 1000 + GS.off >= rt) || B[B.length - 1];
      const dtb = (Cs.k * 1000 + GS.off - rt) / 1000;
      const Bl = Cs.B.map(b => ({ id: b[0], x: b[1] - b[3] * dtb, y: b[2] - b[4] * dtb, vx: b[3], vy: b[4], r: b[5], k: b[6] & 3, tm: b[6] >> 2 }));
      const fov = alive ? dpFovLv(m.lv) * DPCLS[DPCI[m.cid]].fov : GS.fv, ri = 2300 * fov;
      const Sh = [];
      for (const s of GS.shapes.values()) {
        const e = (now - s.at) / 1000, x = s.x + s.vx * e, y = s.y + s.vy * e;
        if (Math.abs(x - cx) > ri || Math.abs(y - cy) > ri) continue;
        Sh.push({ id: s.id, k: s.k, x, y, a: s.a + s.va * e, hp: s.hp, fl: 0 });
      }
      const mm = Object.assign({}, m, { x: cx, y: cy, a: inp.a });
      return {
        t: Cs.k, me: mm, cx, cy, fov, P, B: Bl, Sh, lb: GS.lb, mode: GS.mode, myTeam: mt, tsc: GS.ts, left: GS.lf >= 0 ? GS.lf : null,
        dead: !alive, nameOf, teamOf, myName: GS.names[GS.me], topScore: GS.lb.length ? GS.lb[0][1] : 1
      };
    }

    let V = null;
    const backdrop = (() => {
      const r = mkRng(11), t = [];
      for (let i = 0; i < 28; i++) t.push([r(), r(), (r() * 3.2) | 0, r() * TAU, (r() < .5 ? -1 : 1) * (.1 + r() * .3)]);
      return t;
    })();
    function drawBackdrop(c) {
      const W = sh.W, H = sh.H;
      c.fillStyle = DPCOL.bg; c.fillRect(0, 0, W, H);
      c.strokeStyle = DPCOL.grid; c.lineWidth = 1; c.beginPath();
      const off = (tNow / 90) % 24;
      for (let x = off - 24; x < W; x += 24) { c.moveTo(x, 0); c.lineTo(x, H); }
      for (let y = off - 24; y < H; y += 24) { c.moveTo(0, y); c.lineTo(W, y); }
      c.stroke();
      for (const [x, y, k, a, va] of backdrop) {
        c.save(); c.translate(x * W, y * H); c.scale(.7, .7);
        dpShapeDraw(c, { x: 0, y: 0, a: a + va * tNow / 1000, k, fl: 0 }, 3);
        c.restore();
      }
    }
    function drawTouch(c) {
      if (!coarse || st === 'menu' || st === 'wait' || st === 'left' || st === 'over') return;
      const W = sh.W, H = sh.H;
      const stick = (t, dx, dy, col) => {
        const bx = t ? t.ox : dx, by = t ? t.oy : dy;
        c.globalAlpha = t ? .55 : .28;
        c.fillStyle = 'rgba(255,255,255,.14)'; c.strokeStyle = col; c.lineWidth = 3;
        c.beginPath(); c.arc(bx, by, 50, 0, TAU); c.fill(); c.stroke();
        let kx = bx, ky = by;
        if (t) { const ddx = t.x - t.ox, ddy = t.y - t.oy, d = Math.hypot(ddx, ddy) || 1, k = Math.min(d, 50) / d; kx = bx + ddx * k; ky = by + ddy * k; }
        c.fillStyle = col; c.beginPath(); c.arc(kx, ky, 22, 0, TAU); c.fill();
        c.globalAlpha = 1;
      };
      stick(tctl.move, 78, H - 104, '#2a2a2a');
      stick(tctl.aim, W - 78, H - 104, '#f14e54');
    }

    function render() {
      const c = ctx;
      c.setTransform(sh.DPR, 0, 0, sh.DPR, 0, 0);
      if (!R || !V || st === 'menu' || st === 'wait' || st === 'left') { drawBackdrop(c); return; }
      R.draw(c, V);
      R.hud(c, V);
      drawTouch(c);
    }
    let lastFit = 0;
    api.loop((dt, now) => {
      tNow = now;
      if (++lastFit % 20 === 0 && sh.fit() && R) R.resize(sh.W, sh.H);
      if (role === 'guest' && GS && GS.meb && GS.buf.length) {
        const rt = guestFrame(dt, now);
        R.update(dt);
        V = buildViewGuest(now, rt);
        const m = GS.meb;
        trackMe(m, now);
        if (st === 'play' && !m.alive && now > GS.rsWait && !deathT) deathT = now;
        if (st === 'play' && deathT && now - deathT > 1500 && !GS.over && !m.alive) showDeath();
        if (m.alive) deathT = 0;
        if (GS.over && !overShown) showOver(GS.over.res);
      } else if (S && (role === 'solo' || role === 'host')) {
        hostFrame(dt, now);
        V = buildViewLocal(acc);
      } else V = null;
      render();
    });
    DPENG.live = () => ({ S, GS, R, V, role, st, inp, G, sh, doStat, doCls, hist, saved, ico: dpIcon, cls: DPCLS, ci: DPCI });
    if (api.net.invite) goOnline(); else showMenu();
    return { destroy() { DPENG.live = null; AU.close(); if (role) { try { api.net.close(); } catch (e) {} } } };
  }

  Ameplay.register({
    id: 'diep',
    title: 'Diep.io',
    category: 'Action',
    tint: '#00b2e1',
    blurb: 'Shoot shapes, level up your tank to 45 and evolve it into a monster class in free for all or team battles.',
    help: '<kbd>WASD</kbd> move · mouse aim · click or <kbd>Space</kbd> fire · <kbd>1-8</kbd> upgrade stats · <kbd>E</kbd> auto fire · right click repels drones · click a class tile at levels 15, 30, 45 · touch: two sticks',
    better: 'high',
    width: 880,
    engine: DPENG,
    icon: DP_ICON,
    css: DP_CSS,
    mount: dpMount
  });
  Ameplay.covers['diep'] = DP_COVER;
})();
