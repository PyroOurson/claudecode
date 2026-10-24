(() => {
  'use strict';
  const ID = 'worms';
  const WW = 2048, WH = 960, GRAV = 700, STEP = 1 / 60, PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sgn = v => v < 0 ? -1 : 1;
  const hyp = (a, b) => Math.sqrt(a * a + b * b);
  const r1 = v => Math.round(v * 10) / 10;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const FONT = '"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif';

  function Rng(seed) {
    const r = { s: seed >>> 0 };
    r.next = () => {
      r.s = (r.s + 0x6D2B79F5) >>> 0;
      let t = r.s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (a, b) => a + (b - a) * r.next();
    r.int = (a, b) => Math.floor(a + (b - a + 1) * r.next());
    r.pick = a => a[Math.floor(r.next() * a.length)];
    return r;
  }
  const hash2 = (x, y, s) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const sm = t => t * t * (3 - 2 * t);
  function vn1(x, s) {
    const i = Math.floor(x), f = sm(x - i);
    return hash2(i, 7, s) * (1 - f) + hash2(i + 1, 7, s) * f;
  }
  function vn2(x, y, s) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy);
    const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }
  const fbm1 = (x, s, o = 5) => { let v = 0, a = .5, n = 0; for (let i = 0; i < o; i++) { v += vn1(x, s + i * 31) * a; n += a; a *= .5; x *= 2; } return v / n; };
  const fbm2 = (x, y, s, o = 4) => { let v = 0, a = .5, n = 0; for (let i = 0; i < o; i++) { v += vn2(x, y, s + i * 17) * a; n += a; a *= .5; x *= 2; y *= 2; } return v / n; };

  const TEAMS = [
    { name: 'Red', c: '#e8433a', d: '#a02620', l: '#ff8e84' },
    { name: 'Blue', c: '#3f7cf0', d: '#2349a8', l: '#8ab4ff' },
    { name: 'Green', c: '#34b84a', d: '#1d7a2e', l: '#8fe69c' },
    { name: 'Yellow', c: '#f1b81f', d: '#a97a07', l: '#ffe083' }
  ];
  const WORM_NAMES = ['Boggy B', 'Spadge', 'Clagnut', 'Wiggles', 'Nobby', 'Slimey', 'Squirt', 'Doris', 'Grub', 'Mulch', 'Stumpy', 'Bernard', 'Noodle', 'Gus', 'Pinkie', 'Lumpy', 'Wriggler', 'Tubby', 'Mabel', 'Sir Reginald', 'Dribble', 'Fergus', 'Ziggy', 'Biscuit', 'Moss', 'Wormy', 'Chunk', 'Sprout', 'Hank', 'Pudding', 'Olive', 'Twitch'];
  const TEAM_NAMES = ['The Wrigglers', 'Slime Time', 'Dirt Squad', 'Pink Menace', 'Bait & Switch', 'Soil Boys', 'The Annelids', 'Mud Pie', 'Early Birds', 'Compost Crew', 'Fishing Hooks', 'Spaghetti'];
  const LEVELS = ['Easy', 'Normal', 'Hard', 'Expert'];

  const THEMES = [
    { id: 'meadow', name: 'Meadow', sky: ['#4aa7ee', '#92d3f7', '#e3f5ff'], sun: '#fff4b8', sunX: .8, sunY: .2, far: '#9bc2de', near1: '#79b39c', near2: '#4f9a58', fog: '#e3f5ff', top: ['#80d83f', '#4fae2f'], td: 9, dirt: ['#b0703d', '#6c3f24'], deep: '#442717', rock: '#b9a98a', out: '#2a160e', under: '#38200f', blades: ['#92e64e', '#5cbc36'], water: ['#49b7f1', '#1d6aa6', '#0b3260'], foam: '#f0fcff', deco: 'trees', cloud: '#ffffff', night: 0 },
    { id: 'dunes', name: 'Dunes', sky: ['#f97d4e', '#ffbf7e', '#fff0cf'], sun: '#fff2b0', sunX: .25, sunY: .3, far: '#e8aa7c', near1: '#da8d5b', near2: '#bf6f44', fog: '#ffe2bd', top: ['#f3d78e', '#dcb765'], td: 8, dirt: ['#d98d4b', '#9a5230'], deep: '#6b3520', rock: '#ecd0a6', out: '#3c1c0d', under: '#4a2412', blades: null, water: ['#38cbbd', '#17877f', '#0a4a4a'], foam: '#f3ffff', deco: 'dunes', cloud: '#fff4e4', night: 0 },
    { id: 'frost', name: 'Frostbite', sky: ['#8dbbe4', '#c4def3', '#f1f9ff'], sun: '#ffffff', sunX: .7, sunY: .25, far: '#b4cfe6', near1: '#93b7d4', near2: '#7ba2c6', fog: '#eaf5ff', top: ['#ffffff', '#d4e9fa'], td: 9, dirt: ['#8cb4d2', '#5282aa'], deep: '#38597f', rock: '#d3e6f4', out: '#1a2d46', under: '#223a58', blades: ['#ffffff', '#e0effa'], water: ['#4fa5dc', '#1f609e', '#0a2b58'], foam: '#ffffff', deco: 'ice', cloud: '#ffffff', night: 0 },
    { id: 'inferno', name: 'Inferno', sky: ['#1b0714', '#5d1623', '#d4532a'], sun: '#ffb04a', sunX: .5, sunY: .55, far: '#6b1d27', near1: '#4a1220', near2: '#34101a', fog: '#8c2a22', top: ['#74403a', '#51282f'], td: 6, dirt: ['#8f3e2b', '#4f1b19'], deep: '#2a0e11', rock: '#b05f3e', out: '#12040a', under: '#1b070b', blades: null, water: ['#ffae33', '#e04a14', '#7c1008'], foam: '#ffe98a', deco: 'volcano', cloud: '#6a2a2e', night: 1 },
    { id: 'candy', name: 'Candy Land', sky: ['#ff9fd4', '#ffcbe9', '#fff1fa'], sun: '#fffbd0', sunX: .75, sunY: .2, far: '#f4b3d6', near1: '#eba0c8', near2: '#e183b6', fog: '#ffe6f4', top: ['#fff8f4', '#ffc4de'], td: 9, dirt: ['#c67c49', '#7b422a'], deep: '#4a291c', rock: '#f8e3b8', out: '#4a1e2e', under: '#3a1722', blades: ['#ffffff', '#ffd2e8'], water: ['#ff86bf', '#d8408a', '#8a1c58'], foam: '#fff2fa', deco: 'candy', cloud: '#fff8fc', night: 0 }
  ];
  THEMES.forEach(t => {
    t.sky = t.sky.map(hex); t.top = t.top.map(hex); t.dirt = t.dirt.map(hex);
    t.deepc = hex(t.deep); t.rockc = hex(t.rock); t.outc = hex(t.out); t.underc = hex(t.under);
    t.bl = t.blades ? t.blades.map(hex) : null;
  });

  const WEPS = {
    bazooka: { n: 'Bazooka', g: 0, ammo: -1, kind: 'rocket', aim: 1, charge: 1, r: 52, dmg: 50 },
    grenade: { n: 'Grenade', g: 0, ammo: -1, kind: 'nade', aim: 1, charge: 1, fuse: 1, bounce: 1, r: 52, dmg: 50 },
    cluster: { n: 'Cluster Bomb', g: 0, ammo: 3, kind: 'nade', aim: 1, charge: 1, fuse: 1, bounce: 1, r: 36, dmg: 40 },
    banana: { n: 'Banana Bomb', g: 0, ammo: 1, kind: 'nade', aim: 1, charge: 1, fuse: 1, bounce: 1, r: 50, dmg: 50 },
    holy: { n: 'Holy Hand Grenade', g: 0, ammo: 1, kind: 'nade', aim: 1, charge: 1, r: 100, dmg: 100 },
    shotgun: { n: 'Shotgun', g: 1, ammo: 5, kind: 'shot', aim: 1, shots: 2 },
    uzi: { n: 'Uzi', g: 1, ammo: 3, kind: 'burst', aim: 1 },
    punch: { n: 'Fire Punch', g: 2, ammo: 3, kind: 'melee', aim: 0 },
    bat: { n: 'Baseball Bat', g: 2, ammo: 3, kind: 'melee', aim: 1 },
    dynamite: { n: 'Dynamite', g: 3, ammo: 2, kind: 'drop', aim: 0, r: 78, dmg: 75 },
    sheep: { n: 'Sheep', g: 3, ammo: 2, kind: 'drop', aim: 0, r: 62, dmg: 75 },
    airstrike: { n: 'Air Strike', g: 3, ammo: 2, kind: 'target', aim: 0, target: 1 },
    teleport: { n: 'Teleport', g: 4, ammo: 2, kind: 'util', aim: 0, target: 1 },
    rope: { n: 'Ninja Rope', g: 4, ammo: -1, kind: 'rope', aim: 1 },
    girder: { n: 'Girder', g: 4, ammo: 3, kind: 'util', aim: 0, target: 1 }
  };
  const WORDER = ['bazooka', 'grenade', 'cluster', 'banana', 'holy', 'shotgun', 'uzi', 'punch', 'bat', 'dynamite', 'sheep', 'airstrike', 'teleport', 'rope', 'girder'];
  const CRATE_POOL = ['cluster', 'banana', 'shotgun', 'uzi', 'dynamite', 'sheep', 'airstrike', 'bat', 'punch', 'holy', 'bazooka', 'cluster', 'shotgun', 'uzi'];
  const UTIL_POOL = ['teleport', 'girder', 'rope'];
  const BOUNCE = [.06, .3, .55, .78];
  const BOUNCE_N = ['None', 'Low', 'Medium', 'High'];
  const GIRDER_ANG = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];
  const GIRDER_LEN = [64, 112, 176];

  function makeAudio(api) {
    let ac = null, out = null, nb = null;
    const get = () => {
      if (api.muted) return null;
      try {
        if (!ac) {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          out = ac.createGain(); out.gain.value = .6;
          const cp = ac.createDynamicsCompressor();
          out.connect(cp); cp.connect(ac.destination);
          nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nb.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume();
        return ac;
      } catch (e) { return null; }
    };
    const tone = (type, f0, f1, dur, vol, delay = 0, vib = 0, att = .005) => {
      const c = get(); if (!c) return;
      const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(Math.max(20, f0), t);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6; lg.gain.value = f0 * vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + .05); }
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .03);
    };
    const noise = (dur, vol, f0, f1, type = 'lowpass', delay = 0, q = 1) => {
      const c = get(); if (!c) return;
      const t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = nb; s.loop = true; f.type = type; f.Q.value = q;
      f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
    };
    const VOW = { a: [800, 1250], e: [560, 1850], i: [330, 2300], o: [520, 950], u: [350, 780] };
    const PHR = {
      fire: [['a', .07, 1.25, 'f'], ['i', .13, .9]],
      ohno: [['o', .09, 1.25], ['o', .22, .72, 'n']],
      ouch: [['a', .06, 1.45], ['u', .2, .78]],
      bye: [['a', .09, 1.1, 'b'], ['i', .09, 1.35], ['a', .09, 1.1, 'b'], ['i', .2, .8]],
      yes: [['e', .08, 1.1, 'y'], ['e', .2, 1.45, 's']],
      hello: [['e', .07, 1, 'h'], ['o', .22, 1.3, 'l']],
      inc: [['i', .07, 1], ['i', .07, 1.15], ['a', .16, .95, 'k']],
      oops: [['u', .08, 1], ['o', .12, 1.3], ['e', .16, .85, 'p']],
      rev: [['e', .08, 1, 'r'], ['e', .08, 1.2, 'v'], ['i', .18, 1.5, 'n']],
      cow: [['o', .09, .9, 'k'], ['a', .09, 1.1], ['a', .18, 1.35, 'd']],
      drown: [['o', .08, 1.3], ['u', .14, .9], ['u', .3, .6, 'b']],
      take: [['e', .07, 1.1, 't'], ['i', .1, 1.4, 'k'], ['a', .1, 1.2], ['o', .16, .8, 'w']],
      stupid: [['u', .08, 1, 's'], ['i', .08, 1.3, 't'], ['u', .16, 1.1, 'p']],
      nice: [['i', .08, 1.2], ['a', .22, 1.5, 's']],
      coming: [['a', .08, 1], ['u', .08, 1.2], ['i', .16, 1.4, 'n']]
    };
    function speak(kind, pitch = 1, delay = 0, vol = .5) {
      const c = get(); if (!c) return;
      const ph = PHR[kind]; if (!ph) return;
      let t = c.currentTime + delay + .01;
      for (const [v, d, pm, cons] of ph) {
        const f0 = 150 * pitch * pm, [f1, f2] = VOW[v];
        if (cons) {
          const s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
          s.buffer = nb; hp.type = 'bandpass'; hp.frequency.value = cons === 's' || cons === 'f' ? 5200 : cons === 'k' || cons === 't' || cons === 'p' ? 2600 : 1400; hp.Q.value = 1.2;
          g.gain.setValueAtTime(vol * .45, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
          s.connect(hp); hp.connect(g); g.connect(out); s.start(t, Math.random() * .4); s.stop(t + .06);
        }
        const o = c.createOscillator(), g = c.createGain(), a = c.createBiquadFilter(), b = c.createBiquadFilter(), gb = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f0 * 1.12, t); o.frequency.exponentialRampToValueAtTime(f0 * .94, t + d);
        a.type = 'bandpass'; a.frequency.value = f1 * (.9 + pitch * .1); a.Q.value = 6;
        b.type = 'bandpass'; b.frequency.value = f2 * (.9 + pitch * .1); b.Q.value = 8; gb.gain.value = .6;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * 2.4, t + .02); g.gain.setValueAtTime(vol * 2.4, t + Math.max(.02, d - .03)); g.gain.exponentialRampToValueAtTime(.0001, t + d + .03);
        o.connect(a); o.connect(b); a.connect(g); b.connect(gb); gb.connect(g); g.connect(out);
        o.start(t); o.stop(t + d + .06);
        t += d + .005;
      }
    }
    const A = {
      speak,
      boom(r = 50, vol = 1) {
        const k = clamp(r / 60, .4, 2.2);
        noise(.35 + k * .35, .9 * vol, 2600, 90, 'lowpass', 0, .7);
        tone('sine', 110, 30, .3 + k * .25, .9 * vol);
        noise(.12, .5 * vol, 6000, 1200, 'highpass', 0);
        if (k > 1) noise(.7, .35 * vol, 500, 60, 'lowpass', .08);
      },
      shot(vol = 1) { noise(.11, .8 * vol, 3200, 500, 'bandpass', 0, .8); tone('square', 240, 60, .09, .3 * vol); },
      uzi(vol = 1) { noise(.04, .5 * vol, 3800, 900, 'bandpass', 0, 1); tone('square', 320, 90, .05, .12 * vol); },
      launch() { noise(.35, .5, 1200, 300, 'bandpass', 0, .8); tone('sawtooth', 160, 90, .2, .12); },
      throwIt() { noise(.14, .3, 1800, 500, 'bandpass', 0, .8); tone('triangle', 420, 220, .1, .12); },
      bounce(v = 1) { tone('sine', 360, 140, .07, .25 * v); noise(.04, .12 * v, 2000, 700, 'bandpass'); },
      thud(v = 1) { tone('triangle', 130, 55, .12, .5 * v); noise(.07, .25 * v, 900, 200); },
      splash(v = 1) { noise(.55, .6 * v, 1800, 260, 'bandpass', 0, .6); tone('sine', 500, 160, .18, .12 * v); },
      tick() { tone('square', 1250, 1250, .03, .08); },
      tock() { tone('square', 880, 880, .03, .06); },
      hiss() { noise(.1, .09, 5200, 4000, 'highpass'); },
      warp() { tone('sine', 280, 1700, .22, .28, 0, .02); tone('sine', 1700, 220, .3, .22, .2, .03); },
      clang() { tone('sine', 640, 600, .35, .3); tone('sine', 1330, 1200, .25, .18); noise(.04, .3, 5000, 2000, 'highpass'); },
      pickup() { tone('triangle', 520, 520, .1, .22); tone('triangle', 660, 660, .1, .22, .08); tone('triangle', 880, 880, .22, .25, .16); },
      hook() { noise(.08, .3, 4000, 1500, 'highpass'); tone('square', 900, 450, .06, .12); },
      hookHit() { tone('square', 200, 110, .06, .22); noise(.05, .3, 1500, 500, 'bandpass'); },
      punch() { tone('sawtooth', 110, 400, .35, .25, 0, .02); noise(.3, .4, 800, 3000, 'bandpass'); },
      bat() { noise(.08, .5, 2400, 900, 'bandpass'); tone('triangle', 420, 90, .12, .4); },
      sheep() { for (let i = 0; i < 3; i++) tone('sawtooth', 340 - i * 6, 300, .26, .12, i * .0, .06, .02); noise(.22, .05, 900, 700, 'bandpass'); },
      baa() { const c = get(); if (!c) return; speak('ohno', 2.2, 0, .3); tone('sawtooth', 380, 330, .45, .08, 0, .08, .03); },
      choir() { [261.6, 329.6, 392, 523.3, 659.3].forEach((f, i) => { tone('sine', f, f * 1.003, 2.2, .15, i * .02, .008, .5); tone('triangle', f * 2, f * 2.01, 2, .04, i * .02, .01, .5); }); },
      fan() { [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone('triangle', f, f, .22, .22, i * .12)); tone('triangle', 1046.5, 1046.5, .6, .24, .5); tone('sine', 784, 784, .6, .15, .5); },
      sad() { [392, 349.2, 311, 261.6].forEach((f, i) => tone('triangle', f, f * .98, .3, .2, i * .22)); },
      jingle() { tone('triangle', 660, 660, .08, .15); tone('triangle', 880, 880, .14, .15, .08); },
      sd() { tone('sawtooth', 220, 110, .6, .2, 0, .02); tone('sawtooth', 233, 117, .6, .2, .01, .02); noise(.5, .15, 400, 100, 'lowpass'); },
      crate() { noise(.22, .25, 600, 100, 'lowpass'); tone('triangle', 100, 70, .1, .3); },
      grave() { tone('sine', 90, 50, .25, .4); noise(.1, .2, 500, 150); },
      click() { tone('sine', 700, 500, .05, .12); },
      err() { tone('square', 150, 110, .14, .12); },
      close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
    };
    return A;
  }

  const N1 = new Uint8Array(65536), N2 = new Uint8Array(65536);
  (() => {
    const tile = (arr, P, s, oct) => {
      const cell = 256 / P;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        let v = 0, a = .6, n = 0, pp = P, f = 1;
        for (let o = 0; o < oct; o++) {
          const cx = x / (256 / pp), cy = y / (256 / pp), ix = Math.floor(cx), iy = Math.floor(cy), fx = sm(cx - ix), fy = sm(cy - iy);
          const h = (i, j) => hash2(((i % pp) + pp) % pp, ((j % pp) + pp) % pp, s + o * 13);
          v += ((h(ix, iy) * (1 - fx) + h(ix + 1, iy) * fx) * (1 - fy) + (h(ix, iy + 1) * (1 - fx) + h(ix + 1, iy + 1) * fx) * fy) * a;
          n += a; a *= .55; pp *= 2;
        }
        arr[y * 256 + x] = clamp((v / n) * 255 | 0, 0, 255);
      }
    };
    tile(N1, 32, 11, 2); tile(N2, 8, 29, 3);
  })();

  function genMask(m, seed) {
    const R = Rng(seed ^ 0x2545F491), W = WW, H = WH;
    const style = R.next() < .5 ? 0 : 1;
    const base = R.range(500, 600), amp = R.range(110, 200), s1 = (R.next() * 1e6) | 0, s2 = (R.next() * 1e6) | 0;
    const g = new Float32Array(W);
    const nCh = style ? R.int(2, 3) : R.int(0, 2), ch = [];
    for (let i = 0; i < nCh; i++) {
      for (let tries = 0; tries < 20; tries++) {
        const c = { x: R.range(420, W - 420), w: R.range(110, 210) };
        if (ch.every(o => Math.abs(o.x - c.x) > o.w + c.w + 260)) { ch.push(c); break; }
      }
    }
    const plat = R.range(0, 1000);
    for (let x = 0; x < W; x++) {
      const e = Math.min(x, W - 1 - x), env = sm(clamp((e - 40) / 250, 0, 1));
      let y = base - (fbm1(x / 380 + plat, s1, 5) - .5) * amp * 2.2;
      const step = vn1(x / 260 + 40, s1 + 5);
      y += (step > .62 ? -(step - .62) * 260 : 0);
      for (const c of ch) { const t = Math.abs(x - c.x) / c.w; if (t < 1) y = lerp(y, H - 28, sm(1 - t) > .96 ? 1 : Math.pow(sm(1 - t), .6)); }
      g[x] = lerp(H - 24, y, env);
    }
    for (let x = 0; x < W; x++) {
      const y0 = Math.max(0, Math.floor(g[x]));
      for (let y = y0; y < H; y++) m[y * W + x] = 1;
    }
    for (let x = 0; x < W; x++) {
      const y0 = Math.max(0, Math.floor(g[x]) + 34), env = clamp((Math.min(x, W - 1 - x) - 120) / 160, 0, 1);
      if (env <= 0) continue;
      if (x & 1) continue;
      for (let y = y0; y < H - 130; y += 2) {
        const n = fbm2(x / 92 + 9, y / 46, s2, 3), n2 = fbm2(x / 150, y / 120 + 5, s2 + 99, 2);
        if (n > .675 - (n2 > .6 ? .07 : 0)) { const i = y * W + x; m[i] = 0; m[i + 1] = 0; m[i + W] = 0; m[i + W + 1] = 0; }
      }
    }
    const nI = R.int(2, 4), isl = [];
    for (let k = 0; k < nI; k++) {
      for (let tries = 0; tries < 30; tries++) {
        const cx = R.range(240, W - 240), cy = R.range(170, 380), rx = R.range(70, 140), ry = R.range(16, 32);
        if (g[Math.floor(cx)] - cy < 150 || isl.some(o => Math.abs(o.cx - cx) < o.rx + rx + 90 && Math.abs(o.cy - cy) < 100)) continue;
        isl.push({ cx, cy, rx, ry });
        for (let dx = -rx; dx <= rx; dx++) {
          const t = dx / rx, u = Math.sqrt(Math.max(0, 1 - t * t)), x = Math.floor(cx + dx);
          const top = Math.floor(cy - ry * .3 * u + (vn1(x / 30, s2 + 7) - .5) * 6), bot = Math.floor(cy + ry * u * 1.5 + (vn1(x / 16, s2 + 3) - .5) * 14);
          for (let y = top; y <= bot; y++) if (y >= 0 && y < H) m[y * W + x] = 1;
        }
        break;
      }
    }
    const q = new Int32Array(W * H), vis = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      if (!m[i] || vis[i]) continue;
      let h = 0, t = 0;
      q[t++] = i; vis[i] = 1;
      while (h < t) {
        const p = q[h++], x = p % W, y = (p / W) | 0;
        if (x > 0 && m[p - 1] && !vis[p - 1]) { vis[p - 1] = 1; q[t++] = p - 1; }
        if (x < W - 1 && m[p + 1] && !vis[p + 1]) { vis[p + 1] = 1; q[t++] = p + 1; }
        if (y > 0 && m[p - W] && !vis[p - W]) { vis[p - W] = 1; q[t++] = p - W; }
        if (y < H - 1 && m[p + W] && !vis[p + W]) { vis[p + W] = 1; q[t++] = p + W; }
      }
      if (t < 600) for (let k = 0; k < t; k++) m[q[k]] = 0;
    }
  }

  function Terrain(theme, seed) {
    const W = WW, H = WH, m = new Uint8Array(W * H);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d');
    const img = cx.createImageData(W, H), px = new Uint32Array(img.data.buffer);
    const T = { W, H, m, cv, theme, seed, rects: [], ver: 0 };
    const th = theme;
    const pk = (r, g, b) => (255 << 24) | ((b < 0 ? 0 : b > 255 ? 255 : b | 0) << 16) | ((g < 0 ? 0 : g > 255 ? 255 : g | 0) << 8) | (r < 0 ? 0 : r > 255 ? 255 : r | 0);
    const t0 = th.top[0], t1 = th.top[1], d0 = th.dirt[0], d1 = th.dirt[1], dp = th.deepc, rk = th.rockc, ol = th.outc, un = th.underc;
    T.solid = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? false : m[(y | 0) * W + (x | 0)] !== 0;
    T.paint = (x0, y0, x1, y1) => {
      x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0); x1 = Math.min(W - 1, x1 | 0); y1 = Math.min(H - 1, y1 | 0);
      if (x1 < x0 || y1 < y0) return;
      for (let x = x0; x <= x1; x++) {
        let d = 0, yy = y0 - 1;
        while (yy >= 0 && d < 110 && m[yy * W + x]) { d++; yy--; }
        for (let y = y0; y <= y1; y++) {
          const i = y * W + x, v = m[i];
          if (!v) { px[i] = 0; d = 0; continue; }
          const n1 = N1[(x & 255) | ((y & 255) << 8)], n2 = N2[((x >> 2) & 255) | (((y >> 2) & 255) << 8)];
          let r, g, b;
          if (v === 1) {
            const gd = th.td + ((n2 - 128) >> 6);
            if (d < gd) {
              const t = n1 / 255, k = d < 2 ? 22 : d > gd - 3 ? -16 : 0;
              r = lerp(t0[0], t1[0], t) + k; g = lerp(t0[1], t1[1], t) + k; b = lerp(t0[2], t1[2], t) + k;
            } else {
              const t = Math.min(1, (d - gd) / 120), td = clamp((y - 560) / 340, 0, 1) * .55;
              r = lerp(lerp(d0[0], d1[0], t), dp[0], td); g = lerp(lerp(d0[1], d1[1], t), dp[1], td); b = lerp(lerp(d0[2], d1[2], t), dp[2], td);
              let k = (n1 - 128) * .2 + (n2 - 128) * .26;
              if (((y + (n2 >> 3)) % 29) < 2) k -= 13;
              if (n2 > 206 && n1 > 118) { r = lerp(r, rk[0], .8); g = lerp(g, rk[1], .8); b = lerp(b, rk[2], .8); k += (n1 - 160) * .15; }
              r += k; g += k; b += k;
            }
          } else if (v === 2) { r = 205; g = 96; b = 48; }
          else if (v === 3) { r = 138; g = 54; b = 30; }
          else { r = 240; g = 156; b = 86; }
          const aU = y > 0 ? !m[i - W] : true, aD = y < H - 1 ? !m[i + W] : false, aL = x > 0 ? !m[i - 1] : false, aR = x < W - 1 ? !m[i + 1] : false;
          if (aU || aD || aL || aR) {
            const c = aD && !aU ? un : ol;
            r = r * .34 + c[0] * .66; g = g * .34 + c[1] * .66; b = b * .34 + c[2] * .66;
          } else {
            const u2 = y > 1 ? !m[i - 2 * W] : true, d2 = y < H - 2 ? !m[i + 2 * W] : false, l2 = x > 1 ? !m[i - 2] : false, r2 = x < W - 2 ? !m[i + 2] : false;
            if (u2) { r += 30; g += 30; b += 26; }
            else if (l2) { r += 14; g += 14; b += 12; }
            if (d2 || r2) { r *= .76; g *= .76; b *= .78; }
          }
          px[i] = pk(r, g, b);
          d++;
        }
      }
      if (th.bl) {
        for (let x = x0; x <= x1; x++) {
          const hh = 1 + (((x * 7919) >> 3) & 3);
          for (let y = Math.max(1, y0); y <= Math.min(H - 1, y1 + 6); y++) {
            const i = y * W + x;
            if (m[i] === 1 && !m[i - W]) {
              const c = th.bl[(x >> 1) & 1];
              for (let k = 1; k <= hh; k++) {
                const yy = y - k;
                if (yy < y0 || yy > y1 || yy < 0 || m[yy * W + x]) break;
                const sh = k === hh ? 18 : 0;
                px[yy * W + x] = pk(c[0] + sh, c[1] + sh, c[2] + sh);
              }
            }
          }
        }
      }
      cx.putImageData(img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    };
    T.dirty = (x0, y0, x1, y1) => {
      x0 -= 9; y0 -= 9; x1 += 9; y1 += 9;
      const rs = T.rects;
      for (const r of rs) if (x0 <= r[2] && x1 >= r[0] && y0 <= r[3] && y1 >= r[1]) { r[0] = Math.min(r[0], x0); r[1] = Math.min(r[1], y0); r[2] = Math.max(r[2], x1); r[3] = Math.max(r[3], y1); T.ver++; return; }
      rs.push([x0, y0, x1, y1]); T.ver++;
    };
    T.flush = () => {
      if (!T.rects.length) return false;
      const rs = T.rects; T.rects = [];
      for (const r of rs) T.paint(r[0], r[1], r[2], r[3]);
      return true;
    };
    T.carve = (cxp, cyp, r) => {
      const x0 = Math.max(0, Math.floor(cxp - r)), x1 = Math.min(W - 1, Math.ceil(cxp + r)), y0 = Math.max(0, Math.floor(cyp - r)), y1 = Math.min(H - 1, Math.ceil(cyp + r)), r2 = r * r;
      let n = 0;
      for (let y = y0; y <= y1; y++) {
        const dy = y - cyp;
        for (let x = x0; x <= x1; x++) {
          const dx = x - cxp;
          if (dx * dx + dy * dy <= r2 && m[y * W + x]) { m[y * W + x] = 0; n++; }
        }
      }
      if (n) T.dirty(x0, y0, x1, y1);
      return n;
    };
    T.girder = (gx, gy, angDeg, len, thick = 10) => {
      const a = angDeg * PI / 180, ca = Math.cos(a), sa = Math.sin(a), hl = len / 2, ht = thick / 2;
      const ex = Math.ceil(hl * Math.abs(ca) + ht * Math.abs(sa)) + 2, ey = Math.ceil(hl * Math.abs(sa) + ht * Math.abs(ca)) + 2;
      const x0 = Math.max(0, Math.floor(gx - ex)), x1 = Math.min(W - 1, Math.ceil(gx + ex)), y0 = Math.max(0, Math.floor(gy - ey)), y1 = Math.min(H - 1, Math.ceil(gy + ey));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const dx = x - gx, dy = y - gy, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
        if (Math.abs(u) <= hl && Math.abs(v) <= ht && !m[y * W + x]) {
          const av = Math.abs(v), mu = ((u + v) % 11 + 11) % 11, md = ((u - v) % 11 + 11) % 11;
          m[y * W + x] = av > ht - 2.2 ? 4 : (mu < 2.4 || md < 2.4) ? 3 : 2;
        }
      }
      T.dirty(x0, y0, x1, y1);
    };
    T.apply = c => { if (c[0] === 0) T.carve(c[1], c[2], c[3]); else T.girder(c[1], c[2], c[3], c[4]); };
    T.surface = (x, y0 = 0) => {
      x = clamp(x | 0, 0, W - 1);
      for (let y = Math.max(1, y0 | 0); y < H; y++) if (m[y * W + x] && !m[(y - 1) * W + x]) return y;
      return -1;
    };
    T.ray = (x0, y0, x1, y1) => {
      const dx = x1 - x0, dy = y1 - y0, n = Math.ceil(hyp(dx, dy));
      for (let i = 1; i <= n; i++) { const x = x0 + dx * i / n, y = y0 + dy * i / n; if (T.solid(x, y)) return { x: x0 + dx * (i - 1) / n, y: y0 + dy * (i - 1) / n, hx: x, hy: y }; }
      return null;
    };
    T.normal = (x, y, rad = 4) => {
      let nx = 0, ny = 0;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy > rad * rad) continue;
        if (T.solid(x + dx, y + dy)) { nx -= dx; ny -= dy; }
      }
      const l = hyp(nx, ny);
      return l < .01 ? { x: 0, y: -1 } : { x: nx / l, y: ny / l };
    };
    T.build = () => { genMask(m, seed); T.paint(0, 0, W - 1, H - 1); };
    return T;
  }

  function makeLayers(th, seed) {
    const R = Rng(seed ^ 0x5bd1e995), LW = 1800, LH = 460;
    const mk = () => { const c = document.createElement('canvas'); c.width = LW; c.height = LH; return c; };
    const far = mk(), near = mk(), sA = (R.next() * 1e5) | 0, sB = (R.next() * 1e5) | 0;
    const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const fogc = hex(th.fog), farc = hex(th.far), n1c = hex(th.near1), n2c = hex(th.near2);
    const ridge = (g, fn, c0, c1, y1) => {
      const gr = g.createLinearGradient(0, 40, 0, y1);
      gr.addColorStop(0, rgba(c0)); gr.addColorStop(1, rgba(c1));
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, LH);
      for (let x = 0; x <= LW; x += 6) g.lineTo(x, fn(x));
      g.lineTo(LW, LH); g.closePath(); g.fill();
    };
    const gf = far.getContext('2d'), gn = near.getContext('2d');
    const kind = th.deco;
    const farFn = kind === 'ice' ? x => 230 - Math.abs(fbm1(x / 170, sA, 3) - .5) * 360 - 40 : kind === 'dunes' ? x => 250 - fbm1(x / 420, sA, 3) * 120 : kind === 'candy' ? x => 240 - Math.abs(Math.sin(x / 130 + fbm1(x / 300, sA, 2) * 4)) * 90 : kind === 'volcano' ? x => 240 - fbm1(x / 230, sA, 4) * 150 : x => 240 - fbm1(x / 300, sA, 4) * 190;
    ridge(gf, farFn, farc, fogc, LH);
    gf.globalAlpha = .22;
    for (let i = 0; i < 260; i++) {
      const x = R.range(0, LW), y = farFn(x) + R.range(0, 40);
      gf.fillStyle = i % 3 ? '#fff' : rgba(farc);
      gf.beginPath(); gf.ellipse(x, y, R.range(10, 42), R.range(2, 7), R.range(-.3, .3), 0, TAU); gf.fill();
    }
    gf.globalAlpha = 1;
    if (kind === 'ice') {
      gf.fillStyle = 'rgba(255,255,255,.7)';
      for (let x = 0; x < LW; x += 6) {
        const y = farFn(x);
        if (y < 150) { gf.fillRect(x, y, 6, 12 + (150 - y) * .4); }
      }
    }
    if (kind === 'volcano') {
      for (const vx of [380, 1050, 1560]) {
        const gr = gf.createLinearGradient(0, 70, 0, LH);
        gr.addColorStop(0, '#3a0f18'); gr.addColorStop(1, '#6b1d27');
        gf.fillStyle = gr; gf.beginPath(); gf.moveTo(vx - 260, LH); gf.lineTo(vx - 36, 90); gf.lineTo(vx + 36, 90); gf.lineTo(vx + 260, LH); gf.closePath(); gf.fill();
        const gl = gf.createRadialGradient(vx, 84, 4, vx, 84, 70);
        gl.addColorStop(0, 'rgba(255,200,80,.95)'); gl.addColorStop(1, 'rgba(255,90,20,0)');
        gf.fillStyle = gl; gf.fillRect(vx - 80, 20, 160, 130);
        gf.strokeStyle = 'rgba(255,120,30,.8)'; gf.lineWidth = 3; gf.beginPath(); gf.moveTo(vx - 8, 92); gf.lineTo(vx - 30, 170); gf.lineTo(vx - 24, 230); gf.stroke();
      }
    }
    if (kind === 'dunes') {
      for (const px0 of [300, 980, 1500]) {
        const s = R.range(60, 110), y = farFn(px0) + 10;
        gf.fillStyle = rgba(mixc(farc, [255, 214, 150], .5)); gf.beginPath(); gf.moveTo(px0 - s, y + 20); gf.lineTo(px0, y - s * .9); gf.lineTo(px0 + s, y + 20); gf.closePath(); gf.fill();
        gf.fillStyle = 'rgba(120,60,30,.28)'; gf.beginPath(); gf.moveTo(px0, y - s * .9); gf.lineTo(px0 + s, y + 20); gf.lineTo(px0 + 8, y + 20); gf.closePath(); gf.fill();
      }
    }
    const nearFn = kind === 'ice' ? x => 330 - fbm1(x / 200, sB, 4) * 130 : kind === 'dunes' ? x => 340 - fbm1(x / 280, sB, 3) * 100 : kind === 'volcano' ? x => 330 - Math.abs(fbm1(x / 120, sB, 4) - .5) * 220 : x => 335 - fbm1(x / 230, sB, 4) * 130;
    if (kind === 'trees' || kind === 'ice') {
      for (let x = -20; x < LW + 20; x += R.range(18, 44)) {
        const y = nearFn(x) + R.range(0, 20), h = R.range(34, 92), pine = kind === 'ice' || R.next() < .42;
        const c = pine ? (kind === 'ice' ? [58, 96, 112] : [38, 92, 70]) : mixc(n2c, [40, 100, 50], .5);
        gn.fillStyle = rgba(mixc(c, fogc, .12));
        if (pine) {
          for (let k = 0; k < 4; k++) {
            const yy = y - h * (.2 + k * .22), w = h * (.36 - k * .06);
            gn.beginPath(); gn.moveTo(x - w, yy + h * .26); gn.lineTo(x, yy - h * .12); gn.lineTo(x + w, yy + h * .26); gn.closePath(); gn.fill();
            if (kind === 'ice') { gn.fillStyle = 'rgba(255,255,255,.85)'; gn.beginPath(); gn.moveTo(x - w * .55, yy + h * .06); gn.lineTo(x, yy - h * .12); gn.lineTo(x + w * .55, yy + h * .06); gn.closePath(); gn.fill(); gn.fillStyle = rgba(mixc(c, fogc, .12)); }
          }
        } else {
          gn.fillStyle = 'rgba(70,46,30,.8)'; gn.fillRect(x - 3, y - h * .4, 6, h * .5);
          gn.fillStyle = rgba(mixc(c, fogc, .1));
          for (const [ox, oy, rr] of [[0, -h * .62, h * .3], [-h * .22, -h * .46, h * .22], [h * .22, -h * .46, h * .22]]) { gn.beginPath(); gn.arc(x + ox, y + oy, rr, 0, TAU); gn.fill(); }
          gn.fillStyle = 'rgba(190,255,150,.22)'; gn.beginPath(); gn.arc(x - h * .08, y - h * .7, h * .17, 0, TAU); gn.fill();
        }
      }
    } else if (kind === 'dunes') {
      ridge(gn, nearFn, n1c, n2c, LH);
      for (let x = 60; x < LW; x += R.range(120, 260)) {
        const y = nearFn(x) + 6, h = R.range(34, 70);
        gn.fillStyle = 'rgba(70,110,60,.9)'; gn.fillRect(x - 5, y - h, 10, h); gn.beginPath(); gn.arc(x, y - h, 5, PI, 0); gn.fill();
        gn.fillRect(x - 17, y - h * .6, 6, h * .32); gn.fillRect(x - 17, y - h * .6, 14, 6); gn.fillRect(x + 11, y - h * .5, 6, h * .3); gn.fillRect(x + 3, y - h * .5, 14, 6);
      }
    } else if (kind === 'candy') {
      ridge(gn, x => 340 - Math.abs(Math.sin(x / 90 + sB)) * 60, n1c, n2c, LH);
      const cols = ['#ff5fa8', '#ffd24a', '#5fd0ff', '#9be35a', '#c38bff'];
      for (let x = 40; x < LW; x += R.range(70, 150)) {
        const y = 340 - Math.abs(Math.sin(x / 90 + sB)) * 60 + 8, h = R.range(50, 100);
        gn.strokeStyle = '#fff'; gn.lineWidth = 4; gn.beginPath(); gn.moveTo(x, y); gn.lineTo(x, y - h); gn.stroke();
        const c = cols[(x / 10 | 0) % 5], rr = h * .28;
        gn.fillStyle = c; gn.beginPath(); gn.arc(x, y - h - rr * .6, rr, 0, TAU); gn.fill();
        gn.strokeStyle = 'rgba(255,255,255,.8)'; gn.lineWidth = 3; gn.beginPath(); gn.arc(x, y - h - rr * .6, rr * .6, 0, 4.5); gn.stroke();
      }
    } else if (kind === 'volcano') {
      ridge(gn, nearFn, [58, 20, 28], [92, 30, 30], LH);
      gn.fillStyle = 'rgba(255,140,40,.55)';
      for (let x = 0; x < LW; x += R.range(40, 100)) { const y = nearFn(x) + 4; gn.beginPath(); gn.moveTo(x - 7, y); gn.quadraticCurveTo(x, y - R.range(16, 40), x + 7, y); gn.fill(); }
    }
    const clouds = [];
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = 260; c.height = 110;
      const g = c.getContext('2d'), cc = hex(th.cloud);
      const puffs = [];
      const n = R.int(5, 8);
      for (let i = 0; i < n; i++) puffs.push([40 + (i / (n - 1)) * 170 + R.range(-8, 8), 66 - Math.sin(i / (n - 1) * PI) * R.range(14, 30), R.range(22, 40)]);
      g.fillStyle = rgba(mixc(cc, [90, 110, 150], .22), .9);
      for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y + 6, r, 0, TAU); g.fill(); }
      g.fillStyle = rgba(cc, .96);
      for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.7)';
      for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x - r * .25, y - r * .3, r * .5, 0, TAU); g.fill(); }
      clouds.push(c);
    }
    return { far, near, clouds, LW, LH };
  }

  const BW = { hw: 4, rows: [4, 9, 14], gx: 3 }, BS = { hw: 6, rows: [3, 8], gx: 4 }, BC = { hw: 7, rows: [4, 10], gx: 5 }, BG = { hw: 5, rows: [3, 9, 15], gx: 4 };
  const WIND_ACC = 70, WALK = 58;
  const blockedB = (T, x, y, B) => {
    for (const r of B.rows) if (T.solid(x - B.hw, y - r) || T.solid(x + B.hw, y - r) || T.solid(x, y - r)) return true;
    return false;
  };
  const groundAt = (T, x, y, B) => T.solid(x, y) || T.solid(x - B.gx, y) || T.solid(x + B.gx, y);
  function findFloor(T, x, y, up, down, B) {
    const y0 = Math.floor(y) - up, n = up + down;
    for (let k = 0; k <= n; k++) { const yy = y0 + k; if (T.solid(x, yy) && !T.solid(x, yy - 1)) return yy; }
    let best = -1;
    for (const dx of [-B.gx, B.gx]) for (let k = 0; k <= n; k++) { const yy = y0 + k; if (T.solid(x + dx, yy) && !T.solid(x + dx, yy - 1)) { if (best < 0 || yy < best) best = yy; break; } }
    return best;
  }
  function walkStep(G, e, B, dir, lift, drop) {
    const T = G.T, nx = e.x + dir;
    const f = findFloor(T, nx, e.y, lift, drop, B);
    if (f < 0) {
      if (!blockedB(T, nx, e.y, B)) { e.x = nx; e.on = false; e.vx = dir * 36; e.vy = 0; e.peak = e.y; return true; }
      return false;
    }
    if (blockedB(T, nx, f, B)) return false;
    e.x = nx; e.y = f;
    return true;
  }
  function airStep(G, e, B, dt, o) {
    const T = G.T;
    e.vy += GRAV * dt * (o.g == null ? 1 : o.g);
    const mx = e.vx * dt, nx = Math.max(1, Math.ceil(Math.abs(mx)));
    for (let i = 0; i < nx; i++) {
      const tx = e.x + mx / nx;
      if (!blockedB(T, tx, e.y, B)) e.x = tx;
      else {
        let ok = false;
        for (let l = 1; l <= 3; l++) if (!blockedB(T, tx, e.y - l, B)) { e.x = tx; e.y -= l; ok = true; break; }
        if (!ok) { e.vx = -e.vx * o.e; if (Math.abs(e.vx) < 12) e.vx = 0; if (o.wall) o.wall(); break; }
      }
    }
    const my = e.vy * dt, ny = Math.max(1, Math.ceil(Math.abs(my)));
    for (let i = 0; i < ny; i++) {
      const ty = e.y + my / ny;
      if (my < 0) {
        if (!blockedB(T, e.x, ty, B)) e.y = ty; else { e.vy = -e.vy * .3; break; }
      } else {
        if (groundAt(T, e.x, Math.floor(ty), B)) {
          const f = findFloor(T, e.x, ty, 6, 2, B), imp = e.vy;
          e.y = f >= 0 ? f : Math.floor(ty);
          if (o.bounce && imp > 170) { e.vy = -imp * o.e; e.vx *= .86; return imp; }
          e.vy = 0; e.vx = Math.abs(e.vx) > 30 && o.slide ? e.vx * .5 : 0; e.on = true;
          return imp;
        }
        if (blockedB(T, e.x, ty, B)) { e.vy = 0; break; }
        e.y = ty;
      }
    }
    return 0;
  }

  const aimVec = w => ({ x: w.dir * Math.cos(w.aim), y: -Math.sin(w.aim) });

  function newGame(cfg, isHost) {
    const th = THEMES[cfg.theme % THEMES.length];
    const G = {
      cfg, th, host: isHost !== false, rng: Rng(cfg.seed ^ 0xA5A5A5), T: Terrain(th, cfg.seed),
      teams: [], worms: [], projs: [], crates: [], graves: [], jobs: [], evq: [], carves: [],
      phase: 'intro', tm: 0, wi: 0, tl: cfg.tt, rtl: 0, wind: 0, waterY: WH - 95, wtarget: WH - 95, round: 1, turnNo: 0, nid: 1,
      inp: [], t: 0, quiet: 0, ph: 0, sd: false, winner: -2, hurtActive: false, fired: false, resT: 0, stage: 0, introT: 2
    };
    G.T.build();
    G.emit = o => { G.evq.push(o); };
    G.carve = (x, y, r) => { const c = [0, Math.round(x), Math.round(y), Math.round(r)]; G.carves.push(c); G.T.apply(c); G.emit({ e: 'carve', c }); };
    G.addGirder = (x, y, ang, len) => { const c = [1, Math.round(x), Math.round(y), ang, len]; G.carves.push(c); G.T.apply(c); G.emit({ e: 'carve', c }); };
    Object.defineProperty(G, 'cur', { get: () => G.worms[G.wi] });
    cfg.teams.forEach((t, i) => {
      const ammo = {};
      WORDER.forEach(id => { ammo[id] = WEPS[id].ammo; });
      if (cfg.arsenal === 'plenty') WORDER.forEach(id => { if (ammo[id] > 0) ammo[id] += 2; });
      G.teams.push({ i, name: t.name, col: t.col == null ? i : t.col, human: !!t.human, pid: t.pid || null, lvl: t.lvl || 1, ammo, ptr: -1, st: { dmg: 0, taken: 0, kills: 0, shots: 0, lost: 0, self: 0, crates: 0 }, voice: .8 + (i * .17) % .7 + (t.vo || 0), worms: [], hp: 0, shown: 0 });
      G.inp.push({ l: 0, r: 0, u: 0, d: 0, f: 0, sh: 0, pf: 0 });
    });
    return G;
  }

  function setupWorms(G) {
    const { cfg, T } = G, R = G.rng, n = G.teams.length * cfg.wpt, pos = [];
    for (let tries = 0; tries < 6000 && pos.length < n; tries++) {
      const x = R.range(110, WW - 110), y = T.surface(x, 0);
      if (y < 0 || y > G.waterY - 55) continue;
      const sp = tries > 3000 ? 40 : tries > 1500 ? 60 : 90;
      if (pos.some(p => Math.abs(p[0] - x) < sp && Math.abs(p[1] - y) < 160)) continue;
      const a = T.surface(x - 7, y - 26), b = T.surface(x + 7, y - 26);
      if (a < 0 || b < 0 || Math.abs(a - y) > 7 || Math.abs(b - y) > 7) continue;
      let clear = true;
      for (let k = 1; k <= 18 && clear; k++) if (blockedB(T, x, y - 0, BW) || T.solid(x, y - k)) clear = false;
      if (clear) pos.push([x, y]);
    }
    while (pos.length < n) pos.push([R.range(300, WW - 300), 80 + pos.length * 10]);
    for (let i = pos.length - 1; i > 0; i--) { const j = Math.floor(R.next() * (i + 1)); [pos[i], pos[j]] = [pos[j], pos[i]]; }
    const names = WORM_NAMES.slice().sort(() => R.next() - .5);
    let k = 0;
    G.teams.forEach(t => {
      for (let j = 0; j < cfg.wpt; j++) {
        const [x, y] = pos[k], w = {
          i: G.worms.length, tm: t.i, name: names[k % names.length], x, y, vx: 0, vy: 0, hp: cfg.hp, dir: x < WW / 2 ? 1 : -1, aim: .35, on: true, dead: false, wep: 'bazooka', fz: 3, bn: 1, pow: 0,
          st: 0, peak: y, tumble: false, rope: null, lock: 0, walkAcc: 0, sg: 0, sgCd: 0, pt: 0, tp: 0, kills: 0, dmg: 0, lastBy: -1, tlast: 0
        };
        k++;
        G.worms.push(w); t.worms.push(w.i);
      }
    });
    G.teams.forEach(t => { t.hp = t.worms.reduce((s, i) => s + G.worms[i].hp, 0); t.shown = t.hp; t.max = t.hp; });
  }

  function ammoOf(G, w, id) { return G.teams[w.tm].ammo[id]; }
  function useAmmo(G, w, id) { const a = G.teams[w.tm].ammo; if (a[id] > 0) a[id]--; }
  function activeWorm(G) { return G.worms[G.wi]; }

  function hurt(G, w, n, by, kind) {
    if (w.dead || n <= 0) return 0;
    n = Math.min(n, Math.max(1, w.hp));
    w.hp -= n;
    G.emit({ e: 'dmg', i: w.i, n, x: r1(w.x), y: r1(w.y - 22) });
    const tm = G.teams[w.tm];
    tm.st.taken += n;
    if (by != null && by >= 0) {
      const att = G.worms[by];
      if (att) {
        if (att.tm === w.tm) { tm.st.self += n; } else { G.teams[att.tm].st.dmg += n; att.dmg += n; }
      }
      w.lastBy = by;
    }
    if (G.cur && G.cur.i === w.i && (G.phase === 'turn' || G.phase === 'act')) G.hurtActive = true;
    if (w.hp > 0) {
      w.hurtT = .6;
      G.emit({ e: 'say', i: w.i, k: 'ouch' });
    }
    return n;
  }

  function explode(G, x, y, r, dmg, o = {}) {
    G.emit({ e: 'boom', x: r1(x), y: r1(y), r, k: o.fx || 0 });
    if (!o.noCarve) G.carve(x, y, r * (o.cm || .9));
    const R2 = r + 9;
    for (const w of G.worms) {
      if (w.dead) continue;
      const dx = w.x - x, dy = w.y - 8 - y, d = hyp(dx, dy);
      if (d >= R2) continue;
      const f = 1 - d / R2;
      const amt = dmg > 0 ? Math.max(1, Math.round(dmg * f)) : 0;
      if (amt) hurt(G, w, amt, o.own, w.i === o.own ? 'self' : 'enemy');
      const nx = d < 1 ? 0 : dx / d, ny = d < 1 ? -1 : dy / d, sp = (o.knock || 1) * 610 * f;
      w.vx += nx * sp; w.vy += ny * sp - 90 * f;
      if (sp > 60) { w.on = false; w.tumble = true; w.peak = w.y; w.rope = null; w.flinch = 1; }
    }
    for (const p of G.projs) {
      if (p.k === 'plane' || p.k === 'sheep') continue;
      const dx = p.x - x, dy = p.y - y, d = hyp(dx, dy);
      if (d >= R2 || d < 1) continue;
      const f = 1 - d / R2;
      if (p.k === 'dyn' || p.k === 'nade' || p.k === 'clus' || p.k === 'bana' || p.k === 'holy') { p.vx += dx / d * 380 * f; p.vy += dy / d * 380 * f - 40; }
    }
    for (const p of G.projs) {
      if (p.k !== 'sheep') continue;
      const dx = p.x - x, dy = p.y - y, d = hyp(dx, dy);
      if (d < R2 && d > 1) { p.vx += dx / d * 300 * (1 - d / R2); p.vy += dy / d * 300 * (1 - d / R2) - 120; p.on = false; }
    }
    G.crates = G.crates.filter(c => {
      const d = hyp(c.x - x, c.y - 8 - y);
      if (d < R2 * .8) { G.emit({ e: 'poof', x: r1(c.x), y: r1(c.y - 8) }); return false; }
      return true;
    });
    for (const gv of G.graves) {
      const dx = gv.x - x, dy = gv.y - 8 - y, d = hyp(dx, dy);
      if (d < R2 && d > 1) { gv.vx = dx / d * 260 * (1 - d / R2); gv.vy = dy / d * 260 * (1 - d / R2) - 80; gv.land = false; }
    }
  }

  function killWorm(G, w, drown) {
    if (w.dead) return;
    w.dead = true; w.rope = null; w.hp = Math.min(w.hp, 0);
    const tm = G.teams[w.tm];
    tm.st.lost++;
    if (w.lastBy >= 0) {
      const att = G.worms[w.lastBy];
      if (att && att.tm !== w.tm) { att.kills++; G.teams[att.tm].st.kills++; }
    }
    G.emit({ e: drown ? 'drown' : 'die', i: w.i, x: r1(w.x), y: r1(w.y), tm: w.tm, n: w.name });
    if (!drown) {
      G.graves.push({ id: G.nid++, x: w.x, y: w.y - 6, vx: 0, vy: -90, tm: w.tm, kind: w.i % 5, land: false, on: false });
      explode(G, w.x, w.y - 8, 30, 14, { own: -1, fx: 1, knock: .5 });
    }
  }

  function stepProj(G, p, dt, ghost) {
    const T = G.T;
    p.age += dt;
    if (p.fuse != null) { p.fuse -= dt; if (p.fuse <= 0) return 'fuse'; }
    if (p.life != null && p.age > p.life) return 'fuse';
    const k = p.k;
    p.vy += GRAV * dt * (k === 'air' ? .9 : 1);
    if (p.wind) p.vx += G.wind * WIND_ACC * dt * p.wind;
    const sp = hyp(p.vx, p.vy), n = Math.max(1, Math.ceil(sp * dt / 1.5)), sx = p.vx * dt / n, sy = p.vy * dt / n;
    for (let i = 0; i < n; i++) {
      const nx = p.x + sx, ny = p.y + sy;
      if (nx < -90 || nx > WW + 90 || ny > WH + 60) return 'gone';
      if (ny > G.waterY) { p.x = nx; p.y = ny; return 'water'; }
      if (p.hit) {
        for (const w of G.worms) {
          if (w.dead || (w.i === p.own && p.age < .22)) continue;
          if (Math.abs(nx - w.x) < 7 && ny > w.y - 17 && ny < w.y + 1) { p.x = nx; p.y = ny; return 'hit'; }
        }
      }
      if (T.solid(nx, ny)) {
        if (p.expl) { p.x = nx; p.y = ny; return 'hit'; }
        const nr = T.normal(p.x, p.y, 3), vn = p.vx * nr.x + p.vy * nr.y;
        if (vn < 0) {
          const e = p.bn;
          p.vx -= (1 + e) * vn * nr.x; p.vy -= (1 + e) * vn * nr.y;
          const tx = -nr.y, ty = nr.x, vt = p.vx * tx + p.vy * ty;
          p.vx -= vt * tx * .16; p.vy -= vt * ty * .16;
        }
        if (T.solid(p.x, p.y)) { p.x += nr.x; p.y += nr.y; }
        const s2 = hyp(p.vx, p.vy);
        if (s2 < 26) { p.vx *= .5; p.vy *= .5; if (s2 < 5) { p.vx = 0; p.vy = 0; } }
        p.bounced = (p.bounced || 0) + 1;
        p.lastB = -vn;
        return 'bounce';
      }
      p.x = nx; p.y = ny;
    }
    p.a = Math.atan2(p.vy, p.vx);
    return '';
  }

  function mkProj(G, k, x, y, vx, vy, o = {}) {
    const p = { id: G.nid++, k, x, y, vx, vy, a: Math.atan2(vy, vx), age: 0, own: o.own == null ? -1 : o.own, tm: o.tm == null ? -1 : o.tm, bn: o.bn == null ? .5 : o.bn, fuse: o.fuse == null ? null : o.fuse, wind: o.wind || 0, hit: !!o.hit, expl: !!o.expl, life: o.life, spin: 0 };
    return p;
  }
  const PROJ_RADIUS = { rocket: [52, 50], air: [34, 30], nade: [52, 50], holy: [100, 100], dyn: [78, 75], sheep: [62, 75], cl: [34, 28], bn: [50, 46] };
  function detonate(G, p) {
    const [r, d] = PROJ_RADIUS[p.k] || [40, 30];
    const big = p.k === 'holy' ? 2 : p.k === 'dyn' || p.k === 'sheep' ? 1 : 0;
    explode(G, p.x, p.y, r, d, { own: p.own, fx: big, knock: p.k === 'holy' ? 1.35 : p.k === 'dyn' ? 1.15 : 1 });
    p.dead = true;
  }
  function splitProj(G, p, kind, n) {
    const R = G.rng;
    for (let i = 0; i < n; i++) {
      const a = -PI / 2 + (i - (n - 1) / 2) * .62 + R.range(-.18, .18), s = R.range(150, 250);
      const q = mkProj(G, kind, p.x, p.y - 3, Math.cos(a) * s + p.vx * .3, Math.sin(a) * s + p.vy * .2, { own: p.own, tm: p.tm, bn: kind === 'bn' ? .55 : .3, fuse: kind === 'bn' ? R.range(1.1, 2.4) : null, life: kind === 'cl' ? 4 : null, hit: kind === 'cl', expl: kind === 'cl' });
      G.projs.push(q);
    }
    G.emit({ e: 'snd', n: 'pop', x: r1(p.x), y: r1(p.y) });
    G.emit({ e: 'puff', x: r1(p.x), y: r1(p.y), k: 1 });
    p.dead = true;
  }

  function stepProjectiles(G, dt) {
    const keep = [];
    for (const p of G.projs) {
      if (p.dead) continue;
      if (p.k === 'plane') {
        p.x += p.vx * dt;
        while (p.idx < p.rel.length && (p.vx > 0 ? p.x >= p.rel[p.idx] : p.x <= p.rel[p.idx])) {
          const q = mkProj(G, 'air', p.x, p.y + 8, p.vx * .13, 30, { own: p.own, tm: p.tm, hit: true, expl: true, wind: .6 });
          G.projs.push(q); p.idx++;
          G.emit({ e: 'snd', n: 'hiss', x: r1(p.x), y: r1(p.y) });
        }
        if (p.x < -200 || p.x > WW + 200) p.dead = true;
        if (!p.dead) keep.push(p);
        continue;
      }
      if (p.k === 'sheep') { stepSheep(G, p, dt); if (!p.dead) keep.push(p); continue; }
      const res = stepProj(G, p, dt, false);
      if (res === 'gone') continue;
      if (res === 'water') {
        G.emit({ e: 'splash', x: r1(p.x), y: r1(G.waterY), s: 1 });
        continue;
      }
      if (res === 'hit') detonate(G, p);
      else if (res === 'fuse') {
        if (p.k === 'clus') splitProj(G, p, 'cl', 5);
        else if (p.k === 'bana') splitProj(G, p, 'bn', 5);
        else detonate(G, p);
      } else if (res === 'bounce' && p.lastB > 40) G.emit({ e: 'snd', n: 'bounce', x: r1(p.x), y: r1(p.y), v: clamp(p.lastB / 300, .3, 1) });
      if (p.k === 'holy' && p.age > .01 && !p.said) { p.said = 1; }
      if (!p.dead) keep.push(p);
    }
    G.projs = keep;
  }

  function stepSheep(G, p, dt) {
    const T = G.T;
    p.age += dt; p.fuse -= dt;
    p.baa = (p.baa || 2) - dt;
    if (p.baa <= 0) { p.baa = 1.4 + G.rng.next(); G.emit({ e: 'snd', n: 'baa', x: r1(p.x), y: r1(p.y) }); }
    if (p.y > G.waterY + 3) { G.emit({ e: 'splash', x: r1(p.x), y: r1(G.waterY), s: 1 }); p.dead = true; return; }
    if (p.x < -40 || p.x > WW + 40) { p.dead = true; return; }
    if (p.fuse <= 0 || p.boom) { detonate(G, p); return; }
    if (p.on) {
      p.hop -= dt;
      if (p.hop <= 0) { p.hop = G.rng.range(.8, 1.7); p.vy = -230; p.vx = p.dir * 70; p.on = false; p.peak = p.y; return; }
      p.walk = (p.walk || 0) + 62 * dt;
      while (p.walk >= 1) {
        p.walk -= 1;
        if (!walkStep(G, p, BS, p.dir, 3, 4)) { p.dir = -p.dir; p.walk = 0; break; }
      }
      if (!p.on) return;
      const f = findFloor(T, p.x, p.y, 3, 4, BS);
      if (f < 0) { p.on = false; p.vy = 0; p.vx = p.dir * 30; }
    } else {
      p.a = 0;
      airStep(G, p, BS, dt, { e: .2, wall: () => { p.dir = -p.dir; } });
      if (p.on) p.hop = G.rng.range(.5, 1.2);
    }
  }

  function hitscan(G, w, ox, oy, ax, ay, dmg, range, cr, knock) {
    let x = ox, y = oy, hit = null, end = 'air';
    for (let d = 0; d < range; d += 2) {
      x += ax * 2; y += ay * 2;
      if (x < -20 || x > WW + 20 || y > G.waterY) { end = y > G.waterY ? 'water' : 'out'; break; }
      for (const o of G.worms) {
        if (o.dead || o.i === w.i) continue;
        if (Math.abs(x - o.x) < 6 && y > o.y - 16 && y < o.y + 1) { hit = o; break; }
      }
      if (hit) { end = 'worm'; break; }
      if (G.T.solid(x, y)) { end = 'rock'; break; }
    }
    G.emit({ e: 'tracer', x0: r1(ox), y0: r1(oy), x1: r1(x), y1: r1(y), k: end });
    if (hit) {
      hurt(G, hit, dmg, w.i, 'enemy');
      hit.vx += ax * knock; hit.vy += ay * knock - 60; hit.on = false; hit.tumble = true; hit.peak = hit.y; hit.rope = null;
      G.emit({ e: 'spark', x: r1(x), y: r1(y), k: 1 });
    } else if (end === 'rock') {
      G.carve(x, y, cr);
      G.emit({ e: 'spark', x: r1(x), y: r1(y), k: 0 });
    } else if (end === 'water') G.emit({ e: 'splash', x: r1(x), y: r1(G.waterY), s: 0 });
  }

  function afterFire(G, w) {
    if (G.phase === 'turn') { G.phase = 'act'; G.rtl = G.cfg.rt; G.emit({ e: 'act' }); }
    G.fired = true; w.pow = 0; w.charging = false;
  }

  function doFire(G, w) {
    const id = w.wep, W = WEPS[id], tm = G.teams[w.tm];
    if (ammoOf(G, w, id) === 0) return false;
    const a = aimVec(w), mx = w.x + a.x * 10, my = w.y - 9 + a.y * 10, pw = Math.max(.03, w.pow);
    const own = { own: w.i, tm: w.tm };
    switch (W.kind) {
      case 'rocket': {
        const v = lerp(110, 800, pw);
        G.projs.push(mkProj(G, 'rocket', mx, my, a.x * v, a.y * v, { ...own, hit: true, expl: true, wind: 1 }));
        G.emit({ e: 'snd', n: 'launch', x: r1(mx), y: r1(my) }); G.emit({ e: 'say', i: w.i, k: 'fire' });
        G.emit({ e: 'puff', x: r1(w.x - a.x * 6), y: r1(w.y - 9), k: 2 });
        useAmmo(G, w, id); tm.st.shots++; afterFire(G, w); break;
      }
      case 'nade': {
        const v = lerp(70, 720, pw), kk = id === 'grenade' ? 'nade' : id === 'cluster' ? 'clus' : id === 'banana' ? 'bana' : 'holy';
        G.projs.push(mkProj(G, kk, mx, my, a.x * v, a.y * v, { ...own, bn: id === 'holy' ? .45 : BOUNCE[w.bn], fuse: id === 'holy' ? 3 : w.fz }));
        G.emit({ e: 'snd', n: id === 'holy' ? 'choir' : 'throw', x: r1(mx), y: r1(my) });
        G.emit({ e: 'say', i: w.i, k: id === 'holy' ? 'inc' : 'fire' });
        useAmmo(G, w, id); tm.st.shots++; afterFire(G, w); break;
      }
      case 'shot': {
        if (w.sg === 1 && w.sgCd > 0) return false;
        if (w.sg === 0) { useAmmo(G, w, id); tm.st.shots++; }
        const sp = (G.rng.next() - .5) * .02;
        const ca = Math.cos(sp), sa = Math.sin(sp), ax = a.x * ca - a.y * sa, ay = a.x * sa + a.y * ca;
        hitscan(G, w, mx, my, ax, ay, 25, 560, 9, 210);
        G.emit({ e: 'snd', n: 'shot', x: r1(mx), y: r1(my) });
        G.emit({ e: 'puff', x: r1(mx), y: r1(my), k: 3 });
        w.vx -= a.x * 28; w.recoil = .2;
        w.sg++; w.sgCd = .75;
        if (w.sg >= 2) afterFire(G, w);
        break;
      }
      case 'burst': {
        useAmmo(G, w, id); tm.st.shots++;
        G.jobs.push({ t: 'uzi', w: w.i, left: 18, cd: 0 });
        w.lock = 99; w.pow = 0; G.hold++;
        break;
      }
      case 'melee': {
        useAmmo(G, w, id); tm.st.shots++;
        if (id === 'punch') {
          const hx = w.x + w.dir * 20, hy = w.y - 14;
          G.emit({ e: 'snd', n: 'punch', x: r1(w.x), y: r1(w.y) }); G.emit({ e: 'say', i: w.i, k: 'rev' });
          for (const o of G.worms) {
            if (o.dead || o.i === w.i) continue;
            if (Math.abs(o.x - hx) < 24 && o.y - 8 > hy - 28 && o.y - 8 < hy + 22) {
              hurt(G, o, 30, w.i, 'enemy'); o.vx = w.dir * 230; o.vy = -500; o.on = false; o.tumble = true; o.peak = o.y; o.rope = null;
            }
          }
          G.carve(hx, hy, 16);
          G.emit({ e: 'fire', x: r1(hx), y: r1(hy) });
          w.vy = -330; w.vx = w.dir * 70; w.on = false; w.peak = w.y; w.punchT = .6; w.lock = .5; w.rope = null;
        } else {
          const ax = w.dir * Math.cos(w.aim), ay = -Math.sin(w.aim), hx = w.x + ax * 17, hy = w.y - 9 + ay * 17;
          G.emit({ e: 'snd', n: 'bat', x: r1(w.x), y: r1(w.y) }); G.emit({ e: 'say', i: w.i, k: 'take' });
          for (const o of G.worms) {
            if (o.dead || o.i === w.i) continue;
            if (hyp(o.x - hx, o.y - 8 - hy) < 25) {
              hurt(G, o, 30, w.i, 'enemy'); o.vx = ax * 620; o.vy = ay * 620 - 50; o.on = false; o.tumble = true; o.peak = o.y; o.rope = null;
              G.emit({ e: 'spark', x: r1(o.x), y: r1(o.y - 8), k: 1 });
            }
          }
          w.batT = .45; w.lock = .45;
        }
        afterFire(G, w); break;
      }
      case 'drop': {
        useAmmo(G, w, id); tm.st.shots++;
        if (id === 'dynamite') {
          G.projs.push(mkProj(G, 'dyn', w.x + w.dir * 7, w.y - 4, w.dir * 28, -30, { ...own, bn: .1, fuse: 5 }));
          G.emit({ e: 'snd', n: 'hiss', x: r1(w.x), y: r1(w.y) }); G.emit({ e: 'say', i: w.i, k: 'cow' });
        } else {
          const p = mkProj(G, 'sheep', w.x + w.dir * 8, w.y, 0, 0, { ...own });
          p.dir = w.dir; p.on = true; p.hop = 1; p.fuse = 6; p.baa = .5;
          G.projs.push(p);
          G.emit({ e: 'snd', n: 'baa', x: r1(w.x), y: r1(w.y) });
        }
        afterFire(G, w); break;
      }
      case 'rope': {
        useAmmo(G, w, id);
        const R = { st: 'fly', hx: w.x + a.x * 8, hy: w.y - 9 + a.y * 8, vx: a.x * 1200, vy: a.y * 1200, pts: [], len: 0, trav: 0, cool: 0 };
        w.rope = R; w.lock = Math.max(0, w.lock);
        G.emit({ e: 'snd', n: 'hook', x: r1(w.x), y: r1(w.y) });
        break;
      }
      default: return false;
    }
    return true;
  }

  function doClick(G, w, c) {
    const id = w.wep, W = WEPS[id];
    if (!W.target || G.phase !== 'turn' || w.lock > 0 || ammoOf(G, w, id) === 0) return false;
    const x = +c.x, y = +c.y;
    if (!isFinite(x) || !isFinite(y)) return false;
    const tm = G.teams[w.tm];
    if (id === 'teleport') {
      if (x < 12 || x > WW - 12 || y < 20 || y > G.waterY - 6 || blockedB(G.T, x, y, BW) || G.T.solid(x, y)) { G.emit({ e: 'deny', tm: w.tm }); return false; }
      G.emit({ e: 'tp', x0: r1(w.x), y0: r1(w.y - 8), x1: r1(x), y1: r1(y - 8), i: w.i });
      useAmmo(G, w, id);
      w.x = x; w.y = y; w.vx = 0; w.vy = 0; w.on = false; w.peak = y; w.rope = null; w.tumble = false; w.tpT = .7;
      G.emit({ e: 'say', i: w.i, k: 'hello' });
      afterFire(G, w);
      return true;
    }
    if (id === 'girder') {
      const ai = clamp(c.a | 0, 0, GIRDER_ANG.length - 1), li = clamp(c.l | 0, 0, GIRDER_LEN.length - 1);
      if (x < 0 || x > WW || y < 0 || y > G.waterY) { G.emit({ e: 'deny', tm: w.tm }); return false; }
      useAmmo(G, w, id);
      G.addGirder(x, y, GIRDER_ANG[ai], GIRDER_LEN[li]);
      G.emit({ e: 'snd', n: 'clang', x: r1(x), y: r1(y) });
      for (const o of G.worms) { let n = 0; while (!o.dead && blockedB(G.T, o.x, o.y, BW) && n++ < 40) { o.y -= 1; o.on = false; o.peak = o.y; } }
      afterFire(G, w);
      return true;
    }
    if (id === 'airstrike') {
      useAmmo(G, w, id); tm.st.shots++;
      const dir = w.dir, tf = Math.sqrt(2 * Math.max(60, y - 30) / GRAV), rel = [];
      for (let i = 0; i < 5; i++) rel.push(x + (i - 2) * 46 - dir * (520 * .13 * tf));
      if (dir < 0) rel.reverse();
      const pl = mkProj(G, 'plane', dir > 0 ? -120 : WW + 120, 30, 520 * dir, 0, { own: w.i, tm: w.tm });
      pl.rel = rel; pl.idx = 0; pl.dir = dir;
      G.projs.push(pl);
      G.emit({ e: 'say', i: w.i, k: 'inc' }); G.emit({ e: 'mark', x: r1(x), y: r1(y) });
      afterFire(G, w);
      return true;
    }
    return false;
  }

  function releaseRope(G, w) { if (w.rope) { w.rope = null; w.on = false; w.peak = w.y; } }

  function ropeStep(G, w, dt) {
    const R = w.rope, T = G.T, I = G.inp[w.tm], act = G.cur === w && (G.phase === 'turn' || G.phase === 'act');
    if (R.st === 'fly') {
      const n = Math.ceil(1200 * dt / 2.5);
      for (let i = 0; i < n; i++) {
        R.hx += R.vx * dt / n; R.hy += R.vy * dt / n; R.trav += hyp(R.vx, R.vy) * dt / n;
        if (R.hx < 0 || R.hx > WW || R.hy > G.waterY || R.trav > 480) { w.rope = null; return false; }
        if (T.solid(R.hx, R.hy)) {
          const back = T.ray(w.x, w.y - 8, R.hx, R.hy);
          const px = back ? back.x : R.hx - R.vx * .002, py = back ? back.y : R.hy - R.vy * .002;
          R.pts = [{ x: px, y: py }]; R.st = 'hang'; R.len = clamp(hyp(w.x - px, w.y - 8 - py), 18, 480); R.cool = .1;
          w.on = false; w.peak = w.y; w.tumble = false;
          G.emit({ e: 'snd', n: 'hookHit', x: r1(px), y: r1(py) });
          return true;
        }
      }
      return false;
    }
    const piv = R.pts[R.pts.length - 1];
    let ok = false;
    for (let dx = -3; dx <= 3 && !ok; dx++) for (let dy = -3; dy <= 3; dy++) if (T.solid(R.pts[0].x + dx, R.pts[0].y + dy)) { ok = true; break; }
    if (!ok) { releaseRope(G, w); return false; }
    const sx = act ? (I.r ? 1 : 0) - (I.l ? 1 : 0) : 0, sy = act ? (I.d ? 1 : 0) - (I.u ? 1 : 0) : 0;
    if (sx) { w.vx += sx * 380 * dt; w.dir = sx; }
    R.len = clamp(R.len + sy * 95 * dt, 20, 500);
    R.cool = Math.max(0, R.cool - dt);
    w.vy += GRAV * dt;
    w.vx *= 1 - .08 * dt;
    let nx = w.x + w.vx * dt, ny = w.y + w.vy * dt;
    let dx = nx - piv.x, dy = ny - 8 - piv.y, d = hyp(dx, dy);
    if (d > R.len && d > 1) {
      nx = piv.x + dx / d * R.len; ny = piv.y + dy / d * R.len + 8;
      const ux = dx / d, uy = dy / d, vr = w.vx * ux + w.vy * uy;
      if (vr > 0) { w.vx -= vr * ux; w.vy -= vr * uy; }
    }
    if (!blockedB(T, nx, ny, BW)) { w.x = nx; w.y = ny; }
    else if (!blockedB(T, nx, w.y, BW)) { w.x = nx; w.vy = 0; }
    else if (!blockedB(T, w.x, ny, BW)) { w.y = ny; w.vx *= -.2; }
    else { w.vx *= -.2; w.vy *= -.2; }
    if (w.vy > 0 && groundAt(T, w.x, Math.floor(w.y), BW)) {
      const f = findFloor(T, w.x, w.y, 4, 3, BW);
      if (f >= 0) { w.y = f; w.vy = 0; w.vx *= .88; }
    }
    if (R.cool <= 0) {
      const hit = T.ray(w.x, w.y - 8, piv.x, piv.y);
      if (hit && R.pts.length < 12) {
        const np = { x: hit.x, y: hit.y };
        R.len = Math.max(16, R.len - hyp(np.x - piv.x, np.y - piv.y));
        R.pts.push(np); R.cool = .08;
      } else if (R.pts.length > 1) {
        const prev = R.pts[R.pts.length - 2];
        if (!T.ray(w.x, w.y - 8, prev.x, prev.y)) { R.len += hyp(piv.x - prev.x, piv.y - prev.y); R.pts.pop(); R.cool = .12; }
      }
    }
    return true;
  }

  function landWorm(G, w, imp) {
    const fall = w.y - w.peak;
    if (imp > 90) G.emit({ e: 'snd', n: 'thud', x: r1(w.x), y: r1(w.y), v: clamp(imp / 500, .3, 1) });
    if (fall > 56 && !w.dead) {
      const dmg = clamp(Math.round((fall - 56) * .135), 1, 45);
      hurt(G, w, dmg, -1, 'self');
      G.emit({ e: 'say', i: w.i, k: 'ouch' });
    }
    w.peak = w.y;
    if (w.on) { w.tumble = false; w.flinch = 0; }
  }

  function updateWorms(G, dt) {
    const T = G.T;
    for (const w of G.worms) {
      if (w.dead) continue;
      w.hurtT = Math.max(0, (w.hurtT || 0) - dt); w.recoil = Math.max(0, (w.recoil || 0) - dt);
      w.punchT = Math.max(0, (w.punchT || 0) - dt); w.batT = Math.max(0, (w.batT || 0) - dt); w.tpT = Math.max(0, (w.tpT || 0) - dt);
      w.sgCd = Math.max(0, w.sgCd - dt);
      w.walkT = Math.max(0, (w.walkT || 0) - dt); w.flipT = Math.max(0, (w.flipT || 0) - dt);
      if (w.lock > 0 && w.lock < 90) w.lock = Math.max(0, w.lock - dt);
      if (w.y > G.waterY + 4 || w.x < -30 || w.x > WW + 30 || w.y > WH + 30) {
        G.emit({ e: 'splash', x: r1(w.x), y: r1(Math.min(G.waterY, w.y)), s: 2 });
        w.hp = 0; killWorm(G, w, true);
        if (G.cur && G.cur.i === w.i && (G.phase === 'turn' || G.phase === 'act')) G.hurtActive = true;
        continue;
      }
      if (w.rope) {
        const hang = ropeStep(G, w, dt);
        if (w.rope && w.rope.st === 'hang') { w.on = false; w.st = 3; continue; }
      }
      if (w.on) {
        const f = findFloor(T, w.x, w.y, 3, 5, BW);
        if (f < 0) { w.on = false; w.peak = w.y; w.vy = 0; }
        else w.y = f;
      }
      if (!w.on) {
        if (w.vy < 0) w.peak = Math.min(w.peak, w.y);
        const imp = airStep(G, w, BW, dt, { e: .36, bounce: w.tumble, slide: w.tumble });
        if (imp) landWorm(G, w, imp);
        if (w.vy < 0 && w.y < w.peak) w.peak = w.y;
      } else {
        w.vx = 0;
      }
      w.st = w.on ? (w.walkT > 0 ? 1 : 0) : 2;
    }
  }

  function updateCrates(G, dt) {
    const T = G.T, keep = [];
    for (const c of G.crates) {
      if (c.chute) {
        c.y += 120 * dt; c.x += G.wind * 24 * dt; c.t += dt;
        if (T.solid(c.x, c.y + 1) || groundAt(T, c.x, Math.floor(c.y), BC)) { c.chute = false; c.land = true; G.emit({ e: 'snd', n: 'crate', x: r1(c.x), y: r1(c.y) }); G.emit({ e: 'puff', x: r1(c.x), y: r1(c.y), k: 0 }); c.vy = 0; c.vx = 0; }
      } else if (!c.land) {
        const imp = airStep(G, c, BC, dt, { e: .1 });
        if (imp) { c.land = true; G.emit({ e: 'snd', n: 'crate', x: r1(c.x), y: r1(c.y) }); }
      } else {
        const f = findFloor(T, c.x, c.y, 2, 4, BC);
        if (f < 0) { c.land = false; c.vy = 0; } else c.y = f;
      }
      if (c.y > G.waterY + 4) { G.emit({ e: 'splash', x: r1(c.x), y: r1(G.waterY), s: 1 }); continue; }
      let got = false;
      if (!c.chute || true) {
        for (const w of G.worms) {
          if (w.dead || w.hp <= 0) continue;
          if (Math.abs(w.x - c.x) < 13 && Math.abs((w.y - 6) - (c.y - 6)) < 14) { pickCrate(G, c, w); got = true; break; }
        }
      }
      if (!got) keep.push(c);
    }
    G.crates = keep;
  }

  function pickCrate(G, c, w) {
    const t = G.teams[w.tm]; let msg;
    t.st.crates++;
    if (c.k === 0) { const add = 25; w.hp = Math.min(w.hp + add, 300); msg = '+' + add + ' HP'; }
    else if (c.k === 1) { const n = c.w === 'holy' || c.w === 'banana' || c.w === 'airstrike' ? 1 : c.w === 'dynamite' || c.w === 'sheep' ? 1 : 2; if (t.ammo[c.w] >= 0) t.ammo[c.w] += n; msg = WEPS[c.w].n + (n > 1 ? ' x' + n : ''); }
    else { const n = c.w === 'girder' ? 3 : 1; if (t.ammo[c.w] >= 0) t.ammo[c.w] += n; msg = WEPS[c.w].n + (n > 1 ? ' x' + n : ''); }
    G.emit({ e: 'pick', i: w.i, x: r1(c.x), y: r1(c.y), t: msg, k: c.k });
  }

  function updateGraves(G, dt) {
    const keep = [];
    for (const g of G.graves) {
      if (g.y > G.waterY + 16) { G.emit({ e: 'splash', x: r1(g.x), y: r1(G.waterY), s: 1 }); continue; }
      if (!g.land) {
        const imp = airStep(G, g, BG, dt, { e: .3, bounce: true });
        if (g.on) { g.land = true; G.emit({ e: 'snd', n: 'grave', x: r1(g.x), y: r1(g.y) }); }
      } else {
        const f = findFloor(G.T, g.x, g.y, 2, 5, BG);
        if (f < 0) { g.land = false; g.on = false; g.vy = 0; } else g.y = f;
      }
      keep.push(g);
    }
    G.graves = keep;
  }

  function updateJobs(G, dt) {
    const keep = [];
    for (const j of G.jobs) {
      const w = G.worms[j.w];
      if (j.t === 'uzi') {
        j.cd -= dt;
        if (w.dead || w.hurtT > .3 && G.hurtActive) { G.hold = Math.max(0, G.hold - 1); w.lock = 0; afterFire(G, w); continue; }
        const I = G.inp[w.tm];
        if ((I.u || I.d) && G.cur === w) w.aim = clamp(w.aim + ((I.u ? 1 : 0) - (I.d ? 1 : 0)) * .8 * dt, -1.45, 1.45);
        if (j.cd <= 0) {
          j.cd = .062; j.left--;
          const sp = (G.rng.next() - .5) * .07, a = aimVec(w), ca = Math.cos(sp), sa = Math.sin(sp), ax = a.x * ca - a.y * sa, ay = a.x * sa + a.y * ca;
          hitscan(G, w, w.x + a.x * 10, w.y - 9 + a.y * 10, ax, ay, 4, 520, 5, 70);
          G.emit({ e: 'snd', n: 'uzi', x: r1(w.x), y: r1(w.y) });
          w.recoil = .08;
        }
        if (j.left <= 0) { G.hold = Math.max(0, G.hold - 1); w.lock = 0; afterFire(G, w); continue; }
      }
      keep.push(j);
    }
    G.jobs = keep;
  }

  function control(G, dt) {
    const w = G.cur;
    if (!w || w.dead) return;
    const I = G.inp[w.tm], ph = G.phase;
    const press = (I.f && !I.pf) || I.fq; I.pf = I.f; I.fq = 0;
    if (ph !== 'turn' && ph !== 'act') return;
    const W = WEPS[w.wep], hang = w.rope && w.rope.st === 'hang';
    const mv = (I.r ? 1 : 0) - (I.l ? 1 : 0), ud = (I.u ? 1 : 0) - (I.d ? 1 : 0);
    if (mv && w.lock <= 0) {
      w.dir = mv;
      if (w.on && !hang) {
        w.walkT = .14; w.walkAcc += WALK * dt;
        while (w.walkAcc >= 1) { w.walkAcc -= 1; if (!walkStep(G, w, BW, mv, 4, 5)) break; }
      }
    }
    if (ud && !hang && w.lock < 90) w.aim = clamp(w.aim + ud * (I.sh ? .3 : 1.15) * dt, -1.45, 1.45);
    else if (ud && hang && w.lock < 90 && !W.aim) { }
    if (ph === 'act') {
      if (press) {
        const sh = G.projs.find(p => p.k === 'sheep' && p.own === w.i);
        if (sh) { sh.boom = true; return; }
      }
      if (press && w.wep === 'rope' && w.lock <= 0) doFire(G, w);
      return;
    }
    if (w.lock > 0) return;
    if (W.charge) {
      if (press) w.charging = true;
      if (w.charging) {
        if (I.f) { w.pow = Math.min(1, w.pow + dt / 1.55); if (w.pow >= 1) doFire(G, w); }
        else { if (w.pow > 0) doFire(G, w); w.charging = false; w.pow = 0; }
      }
    } else if (press && !W.target) {
      doFire(G, w);
    }
    if (!W.charge) { w.pow = 0; w.charging = false; }
  }

  function command(G, tm, c) {
    const w = G.cur;
    if (!w || w.tm !== tm || w.dead) return false;
    const ph = G.phase;
    if (ph !== 'turn' && ph !== 'act') return false;
    switch (c.c) {
      case 'jump':
        if (w.rope && w.rope.st === 'hang') { releaseRope(G, w); w.vy -= 150; return true; }
        if (w.rope) { w.rope = null; }
        if (w.on && w.lock <= 0) { w.vy = -300; w.vx = w.dir * 150; w.on = false; w.peak = w.y; w.walkAcc = 0; w.y -= 1; G.emit({ e: 'snd', n: 'bounce', x: r1(w.x), y: r1(w.y), v: .4 }); return true; }
        return false;
      case 'flip':
        if (w.rope && w.rope.st === 'hang') { releaseRope(G, w); w.vy -= 150; return true; }
        if (w.on && w.lock <= 0) { w.vy = -430; w.vx = -w.dir * 60; w.on = false; w.peak = w.y; w.flipT = .8; w.y -= 1; return true; }
        return false;
      case 'wep':
        if (WEPS[c.w] && ph === 'turn' && w.lock <= 0 && !w.charging && w.sg === 0 && ammoOf(G, w, c.w) !== 0) { w.wep = c.w; w.pow = 0; return true; }
        return false;
      case 'fuse': if (ph === 'turn') { w.fz = clamp(c.n | 0, 1, 5); return true; } return false;
      case 'bounce': if (ph === 'turn') { w.bn = c.n == null ? (w.bn + 1) % 4 : clamp(c.n | 0, 0, 3); return true; } return false;
      case 'click': return doClick(G, w, c);
      case 'skip': if (ph === 'turn' && !G.jobs.length) { G.skipped = true; G.phase = 'settle'; G.quiet = 0; G.settleT = 0; return true; } return false;
      case 'rel': releaseRope(G, w); return true;
    }
    return false;
  }

  function isBusy(G) {
    if (G.projs.length || G.jobs.length) return true;
    for (const w of G.worms) {
      if (w.dead) continue;
      if (!w.on || w.tumble || w.rope) return true;
    }
    for (const c of G.crates) if (!c.land) return true;
    for (const g of G.graves) if (!g.land) return true;
    return false;
  }

  function aliveTeams(G) { return G.teams.filter(t => t.worms.some(i => !G.worms[i].dead)); }

  function startTurn(G, ti) {
    const t = G.teams[ti], n = t.worms.length;
    let k = t.ptr + 1, idx = -1;
    for (let c = 0; c < n; c++, k++) { const wi = t.worms[k % n]; if (!G.worms[wi].dead) { idx = wi; t.ptr = k % n; break; } }
    if (idx < 0) return false;
    G.tm = ti; G.wi = idx; G.phase = 'turn'; G.tl = G.cfg.tt; G.rtl = 0; G.hurtActive = false; G.fired = false; G.quiet = 0; G.hold = 0; G.settleT = 0; G.skipped = false; G.turnNo++;
    const w = G.worms[idx];
    w.pow = 0; w.sg = 0; w.sgCd = 0; w.charging = false; w.lock = 0; w.walkAcc = 0;
    if (ammoOf(G, w, w.wep) === 0) w.wep = 'bazooka';
    G.inp.forEach(I => { I.l = I.r = I.u = I.d = I.f = I.sh = 0; I.pf = 0; });
    if (G.cfg.wind) {
      const r = G.rng;
      let nw = G.wind * .4 + (r.next() + r.next() + r.next() - 1.5) * 1.1;
      if (r.next() < .12) nw = 0;
      G.wind = Math.round(clamp(nw, -1, 1) * 20) / 20;
    } else G.wind = 0;
    G.emit({ e: 'turn', tm: ti, i: idx, wind: G.wind, n: G.turnNo, rd: G.round });
    return true;
  }
  function nextTeamIdx(G) {
    const n = G.teams.length;
    for (let k = 1; k <= n; k++) {
      const ti = (G.tm + k) % n;
      if (G.teams[ti].worms.some(i => !G.worms[i].dead)) return ti;
    }
    return -1;
  }

  function spawnCrate(G) {
    const R = G.rng, T = G.T;
    let x = 0;
    for (let t = 0; t < 30; t++) { x = R.range(130, WW - 130); const y = T.surface(x, 0); if (y > 0 && y < G.waterY - 40) break; }
    const r = R.next();
    const k = r < .34 ? 0 : r < .8 ? 1 : 2;
    const wp = k === 1 ? R.pick(CRATE_POOL) : k === 2 ? R.pick(UTIL_POOL) : '';
    G.crates.push({ id: G.nid++, k, w: wp, x, y: -30, vx: 0, vy: 0, chute: true, land: false, on: false, t: 0 });
    G.emit({ e: 'crate' });
  }

  function recount(G) {
    for (const t of G.teams) t.hp = t.worms.reduce((s, i) => s + Math.max(0, G.worms[i].hp), 0);
  }

  function stepGame(G, dt) {
    G.t += dt;
    recount(G);
    if (G.phase !== 'over' && G.phase !== 'intro') control(G, dt);
    updateJobs(G, dt);
    stepProjectiles(G, dt);
    updateWorms(G, dt);
    updateCrates(G, dt);
    updateGraves(G, dt);
    if (G.waterY !== G.wtarget) {
      G.waterY = Math.max(G.wtarget, G.waterY - 36 * dt);
    }
    const busy = isBusy(G);
    G.quiet = busy ? 0 : G.quiet + dt;
    switch (G.phase) {
      case 'intro':
        G.introT -= dt;
        if (G.introT <= 0) startTurn(G, G.first || 0);
        break;
      case 'turn':
        if (!G.hold && !G.jobs.length) G.tl -= dt;
        if (G.hurtActive && !G.jobs.length) { G.phase = 'settle'; G.quiet = 0; G.settleT = 0; break; }
        if (G.tl <= 0) { G.phase = 'settle'; G.quiet = 0; G.settleT = 0; }
        break;
      case 'act':
        if (!G.jobs.length) G.rtl -= dt;
        if (G.hurtActive && !G.jobs.length) { G.rtl = 0; }
        if (G.rtl <= 0 && !G.jobs.length) { G.phase = 'settle'; G.quiet = 0; G.settleT = 0; }
        break;
      case 'settle':
        G.settleT += dt;
        for (const w of G.worms) if (w.rope && !w.dead) releaseRope(G, w);
        G.cur && (G.cur.pow = 0);
        if (G.quiet > .7 || G.settleT > 14) { G.phase = 'resolve'; G.stage = 0; G.deathT = 0; G.settleT = 0; }
        break;
      case 'resolve':
        G.settleT += dt;
        resolve(G, dt);
        break;
    }
  }

  function resolve(G, dt) {
    if (G.deathT > 0) { G.deathT -= dt; return; }
    const forced = G.settleT > 20;
    const dying = G.worms.find(w => !w.dead && w.hp <= 0);
    if (dying) {
      if (G.quiet > .5 || forced) { killWorm(G, dying, false); G.deathT = 1.2; G.quiet = 0; }
      return;
    }
    if (G.quiet < .5 && !forced) return;
    if (G.stage === 0) {
      G.stage = 1;
      const al = aliveTeams(G);
      const humans = al.filter(t => t.human);
      if (al.length <= 1 || (!humans.length && !G.demo)) {
        G.phase = 'over';
        G.winner = al.length === 1 ? al[0].i : al.length === 0 ? -1 : al.slice().sort((a, b) => b.hp - a.hp)[0].i;
        G.lostHumans = !humans.length && al.length > 1;
        G.overT = 0;
        G.emit({ e: 'over', w: G.winner });
        return;
      }
    }
    if (G.stage === 1) {
      G.stage = 2;
      const nt = nextTeamIdx(G);
      if (nt <= G.tm) G.round++;
      G.nextTeam = nt;
      if (G.cfg.sd > 0 && G.round > G.cfg.sd) {
        if (!G.sd) {
          G.sd = true;
          G.emit({ e: 'sd' });
          if (G.cfg.sdMode === 1) for (const w of G.worms) if (!w.dead && w.hp > 1) w.hp = 1;
        }
        G.wtarget = Math.max(260, G.wtarget - 26);
        G.deathT = 1.0;
        G.quiet = 0;
        return;
      }
    }
    if (G.stage === 2) {
      G.stage = 3;
      if (G.waterY > G.wtarget + .5) return;
    }
    if (G.stage === 3) {
      const fq = [0, .3, .6, .85][G.cfg.crates | 0] || 0;
      if (G.turnNo >= 2 && G.crates.length < 2 && G.rng.next() < fq) { spawnCrate(G); G.stage = 4; G.settleT = 10; return; }
      G.stage = 5;
    }
    if (G.stage === 4) {
      if (G.crates.some(c => !c.land)) return;
      G.stage = 5;
    }
    if (G.stage === 5) {
      if (G.waterY > G.wtarget + .5) return;
      G.stage = 6;
      if (!startTurn(G, G.nextTeam)) { G.phase = 'over'; G.winner = -1; G.emit({ e: 'over', w: -1 }); }
    }
  }

  function scoreBlast(G, me, x, y, r, d, selfK) {
    let s = 0;
    const R2 = r + 9;
    for (const w of G.worms) {
      if (w.dead) continue;
      const dd = hyp(w.x - x, w.y - 8 - y);
      if (dd >= R2) continue;
      const f = 1 - dd / R2, amt = Math.min(w.hp, Math.max(1, d * f)), kill = amt >= w.hp;
      if (w.tm === me.tm) s -= amt * (w.i === me.i ? selfK : 1.35) + (kill ? (w.i === me.i ? 40 : 25) : 0);
      else s += amt + (kill ? 22 : 0) + (w.y > G.waterY - 70 ? 14 * f : 0);
    }
    return s;
  }

  function ghostShot(G, w, kind, dir, aim, pw, fz, bn) {
    const ax = dir * Math.cos(aim), ay = -Math.sin(aim);
    const v = kind === 'rocket' ? lerp(110, 800, pw) : lerp(70, 720, pw);
    const p = { k: kind, x: w.x + ax * 10, y: w.y - 9 + ay * 10, vx: ax * v, vy: ay * v, a: 0, age: 0, own: w.i, tm: w.tm, bn: kind === 'holy' ? .45 : bn, fuse: kind === 'rocket' ? null : fz, wind: kind === 'rocket' ? 1 : 0, hit: kind === 'rocket', expl: kind === 'rocket', life: undefined };
    let res = '';
    for (let i = 0; i < 420; i++) {
      res = stepProj(G, p, STEP, true);
      if (res === 'bounce') { res = ''; continue; }
      if (res) break;
    }
    if (res === 'hit' || res === 'fuse') {
      if (kind === 'rocket') return scoreBlast(G, w, p.x, p.y, 52, 50, 1.6);
      if (kind === 'clus') return scoreBlast(G, w, p.x, p.y, 72, 46, 1.6);
      if (kind === 'bana') return scoreBlast(G, w, p.x, p.y, 86, 56, 1.6);
      if (kind === 'holy') return scoreBlast(G, w, p.x, p.y, 100, 100, 1.6);
      return scoreBlast(G, w, p.x, p.y, 52, 50, 1.6);
    }
    return -1;
  }

  function* planGen(G, w, lvl) {
    const T = G.T, cands = [];
    const have = id => ammoOf(G, w, id) !== 0;
    const en = G.worms.filter(o => !o.dead && o.tm !== w.tm).sort((a, b) => hyp(a.x - w.x, a.y - w.y) - hyp(b.x - w.x, b.y - w.y));
    const near = en.slice(0, lvl >= 2 ? 4 : 3);
    let cnt = 0;
    const KIND = { bazooka: 'rocket', grenade: 'nade', cluster: 'clus', banana: 'bana', holy: 'holy' };
    const wl = (lvl === 0 ? ['bazooka', 'grenade'] : lvl === 1 ? ['bazooka', 'grenade', 'cluster'] : lvl === 2 ? ['bazooka', 'grenade', 'cluster', 'banana', 'holy'] : ['bazooka', 'grenade', 'cluster', 'holy', 'banana']).filter(have);
    const astep = lvl >= 3 ? .07 : lvl >= 2 ? .085 : .11, pstep = lvl >= 3 ? .07 : .09;
    const coarse = [];
    for (const e of near) {
      const dir = e.x >= w.x ? 1 : -1;
      for (const id of wl) {
        const kind = KIND[id], fz = id === 'holy' ? 3 : 3;
        let best = null;
        for (let aim = -.6; aim <= 1.45; aim += astep) for (let pw = .22; pw <= 1.001; pw += pstep) {
          const sc = ghostShot(G, w, kind, dir, aim, pw, fz, BOUNCE[1]);
          if (!best || sc > best.score) best = { score: sc, wep: id, kind, dir, aim, pw, fz, bn: 1, e: e.i };
          if (++cnt % 36 === 0) yield;
        }
        if (best) coarse.push(best);
      }
    }
    coarse.sort((a, b) => b.score - a.score);
    const refN = lvl === 0 ? 0 : lvl === 1 ? 2 : lvl === 2 ? 3 : 5;
    for (let ci = 0; ci < Math.min(refN, coarse.length); ci++) {
      const c0 = coarse[ci];
      let best = c0;
      const fzs = c0.kind === 'rocket' ? [0] : c0.kind === 'holy' ? [3] : [2, 3, 4];
      for (const fz of fzs) for (let da = -astep; da <= astep + 1e-6; da += astep / 4) for (let dp = -pstep; dp <= pstep + 1e-6; dp += pstep / 4) {
        const aim = clamp(c0.aim + da, -1.45, 1.45), pw = clamp(c0.pw + dp, .12, 1);
        const sc = ghostShot(G, w, c0.kind, c0.dir, aim, pw, fz, BOUNCE[1]);
        if (sc > best.score) best = { ...c0, score: sc, aim, pw, fz };
        if (++cnt % 36 === 0) yield;
      }
      coarse[ci] = best;
    }
    for (const c of coarse) cands.push(c);
    const mz = { x: w.x, y: w.y - 9 };
    for (const e of near) {
      const dx = e.x - w.x, dyy = (e.y - 8) - mz.y, dist = hyp(dx, dyy);
      if (dist < 12) continue;
      const dir = dx >= 0 ? 1 : -1, aim = clamp(Math.atan2(-dyy, Math.abs(dx)), -1.4, 1.4);
      const ray = T.ray(mz.x + dir * 8, mz.y, e.x, e.y - 8);
      const clear = !ray || hyp(ray.x - e.x, ray.y - (e.y - 8)) < 9;
      if (clear && lvl >= 1) {
        if (have('shotgun') && dist < 520) cands.push({ score: 44 * clamp(1.25 - dist / 520, .35, 1) + (e.hp <= 40 ? 15 : 0), wep: 'shotgun', kind: 'shot', dir, aim, pw: 0, e: e.i });
        if (have('uzi') && dist < 420) cands.push({ score: 38 * clamp(1.2 - dist / 450, .3, 1) + (e.hp <= 30 ? 12 : 0), wep: 'uzi', kind: 'burst', dir, aim, pw: 0, e: e.i });
      }
      if (lvl >= 1 && have('dynamite') && Math.abs(dx) < 60 && Math.abs(dyy) < 34) cands.push({ score: scoreBlast(G, w, w.x + dir * 7, w.y - 4, 78, 75, .25), wep: 'dynamite', kind: 'drop', dir, aim: w.aim, pw: 0, retreat: 1, e: e.i });
      if (lvl >= 2 && have('sheep') && Math.abs(dyy) < 48 && Math.abs(dx) > 70 && Math.abs(dx) < 420 && !T.ray(mz.x, mz.y + 6, e.x, mz.y + 6)) cands.push({ score: 34, wep: 'sheep', kind: 'drop', dir, aim: w.aim, pw: 0, tgt: e.i, e: e.i });
      if (lvl >= 1 && have('punch') && Math.abs(dx) < 24 && Math.abs(dyy) < 18) cands.push({ score: 28 + (e.y > G.waterY - 120 ? 20 : 0), wep: 'punch', kind: 'melee', dir, aim: w.aim, pw: 0, e: e.i });
      if (lvl >= 2 && have('airstrike')) {
        let s = 0;
        for (let i = 0; i < 5; i++) { const bx = e.x + (i - 2) * 46; s += scoreBlast(G, w, bx, e.y - 8, 34, 30, 1.6); }
        cands.push({ score: s, wep: 'airstrike', kind: 'target', dir, aim: w.aim, pw: 0, x: e.x, y: e.y - 8, e: e.i });
      }
      yield;
    }
    cands.sort((a, b) => b.score - a.score);
    return cands;
  }

  function safeAhead(G, w, dir) {
    for (let k = 3; k <= 21; k += 6) {
      const x = w.x + dir * k;
      if (x < 20 || x > WW - 20) return false;
      const f = findFloor(G.T, x, w.y, 10, 38, BW);
      if (f < 0 || f > G.waterY - 12) return false;
    }
    return true;
  }

  function botTick(G, dt) {
    const w = G.cur;
    if (!w || w.dead) return;
    const tm = G.teams[w.tm];
    if (tm.human || (G.phase !== 'turn' && G.phase !== 'act')) return;
    const I = G.inp[w.tm], lvl = tm.lvl;
    let B = G.bot;
    if (!B || B.turn !== G.turnNo) {
      B = G.bot = { turn: G.turnNo, st: 'think', t: [1.7, 1.1, .75, .55][lvl] + Math.random() * [1.0, .8, .5, .3][lvl], gen: null, cands: null, plan: null, walks: 0, wt: 0, wdir: 1, stuck: 0, lastX: w.x, fire: 0, pre: 0, shots: 0, sheepT: 0 };
    }
    I.l = I.r = I.u = I.d = 0; I.f = 0;
    if (G.phase === 'act') {
      if (B.retreat && B.rt > 0 && w.lock <= 0) {
        B.rt -= dt;
        if (safeAhead(G, w, B.retreat)) { if (B.retreat > 0) I.r = 1; else I.l = 1; }
        B.stuck += dt;
        if (B.stuck > .5) { if (Math.abs(w.x - B.lastX) < 5) command(G, w.tm, { c: 'jump' }); B.stuck = 0; B.lastX = w.x; }
      }
      if (B.plan && B.plan.wep === 'sheep') {
        const sh = G.projs.find(p => p.k === 'sheep' && p.own === w.i), tg = G.worms[B.plan.tgt];
        if (sh && tg && !tg.dead && (hyp(sh.x - tg.x, sh.y - tg.y) < 46 || sh.fuse < .4)) { B.sheepT++; if (B.sheepT % 2) I.f = 1; }
      }
      return;
    }
    B.t -= dt;
    if (B.st === 'think') {
      if (!B.gen) B.gen = planGen(G, w, lvl);
      if (!B.cands) {
        const t0 = performance.now();
        while (performance.now() - t0 < 5) { const r = B.gen.next(); if (r.done) { B.cands = r.value; break; } }
      }
      if (B.cands && B.t <= 0) {
        const c = B.cands, thr = [6, 12, 16, 20][lvl];
        let pick = c[0];
        if (c.length) {
          const top = c.slice(0, [4, 2, 1, 1][lvl]);
          pick = top[Math.floor(Math.random() * top.length)];
        }
        if ((!pick || pick.score < thr) && B.walks < 3 && G.tl > 10 && !(pick && pick.kind === 'melee')) {
          const en = G.worms.filter(o => !o.dead && o.tm !== w.tm).sort((a, b) => Math.abs(a.x - w.x) - Math.abs(b.x - w.x))[0];
          B.wdir = en ? (en.x >= w.x ? 1 : -1) : (Math.random() < .5 ? 1 : -1);
          if (B.walks === 1 && Math.random() < .35) B.wdir = -B.wdir;
          B.wt = .7 + Math.random() * 1.2; B.walks++; B.st = 'walk'; B.stuck = 0; B.lastX = w.x;
        } else {
          B.plan = pick || { wep: 'bazooka', kind: 'rocket', dir: 1, aim: .6, pw: .7, fz: 3, bn: 1 };
          const noise = [.1, .045, .018, 0][lvl], pn = [.14, .06, .02, 0][lvl];
          B.plan = { ...B.plan, aim: clamp(B.plan.aim + (Math.random() - .5) * 2 * noise, -1.45, 1.45), pw: clamp(B.plan.pw + (Math.random() - .5) * 2 * pn, .08, 1) };
          B.st = 'pre';
        }
        B.gen = null; B.cands = null;
      }
    } else if (B.st === 'walk') {
      B.wt -= dt;
      if (B.wt <= 0 || !safeAhead(G, w, B.wdir)) { B.st = 'think'; B.t = .25; return; }
      if (B.wdir > 0) I.r = 1; else I.l = 1;
      B.stuck += dt;
      if (B.stuck > .45) { if (Math.abs(w.x - B.lastX) < 4) command(G, w.tm, { c: Math.random() < .3 ? 'flip' : 'jump' }); B.stuck = 0; B.lastX = w.x; }
    } else if (B.st === 'pre') {
      const p = B.plan;
      if (w.on) {
        command(G, w.tm, { c: 'wep', w: p.wep });
        if (p.fz) command(G, w.tm, { c: 'fuse', n: p.fz });
        command(G, w.tm, { c: 'bounce', n: 1 });
        w.dir = p.dir;
        B.st = 'aim';
      }
    } else if (B.st === 'aim') {
      const p = B.plan;
      if (w.wep !== p.wep) { B.st = 'pre'; return; }
      if (w.dir !== p.dir && w.on) w.dir = p.dir;
      const diff = p.aim - w.aim;
      if (!WEPS[p.wep].aim || Math.abs(diff) < .022) B.st = 'fire';
      else if (diff > 0) I.u = 1; else I.d = 1;
    } else if (B.st === 'fire') {
      const p = B.plan, W = WEPS[p.wep];
      if (w.wep !== p.wep) { B.st = 'pre'; return; }
      if (p.kind === 'target') { command(G, w.tm, { c: 'click', x: p.x, y: p.y }); B.retreat = 0; B.st = 'done'; return; }
      if (W.charge) {
        if (w.pow < p.pw) I.f = 1;
        else { I.f = 0; B.st = 'done'; }
        if (w.pow >= 1) B.st = 'done';
      } else if (p.kind === 'shot') {
        B.fire++;
        if (w.sg === 0 && B.fire > 3) { I.f = 1; B.fire = 0; }
        else if (w.sg === 1 && w.sgCd <= 0 && B.fire > 3) { I.f = 1; B.fire = 0; }
      } else {
        I.f = B.fire++ % 2 === 0 ? 1 : 0;
        if (B.fire > 3) B.st = 'done';
        if (p.retreat) { B.retreat = -p.dir; B.rt = 2.8; B.stuck = 0; B.lastX = w.x; }
        if (p.wep === 'dynamite') { B.retreat = -p.dir; B.rt = 2.8; }
      }
    }
  }

  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); };
  const rgb = a => `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;

  const ICON = {
    bazooka(c) {
      c.fillStyle = '#6b4a2b'; rr(c, -4, 2.5, 5, 6.5, 1.6); c.fill();
      c.fillStyle = '#3f5c2b'; rr(c, -15, -3.6, 30, 7.2, 3.6); c.fill(); c.strokeStyle = '#1f3015'; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#e8c53a'; c.fillRect(-3, -3.6, 3, 7.2); c.fillRect(5, -3.6, 1.8, 7.2);
      c.fillStyle = '#2b2b2b'; rr(c, 12, -4.8, 4.4, 9.6, 1.4); c.fill();
      c.fillStyle = '#4a4a4a'; rr(c, -17.5, -4.8, 3.6, 9.6, 1.4); c.fill();
      c.fillStyle = '#222'; c.fillRect(6, -6.4, 2, 3);
      c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-12, -2.6, 24, 1.4);
    },
    grenade(c) {
      const g = c.createRadialGradient(-2, -2.5, 1, 0, 0, 8);
      g.addColorStop(0, '#8cc65a'); g.addColorStop(1, '#3d6a2a');
      c.fillStyle = g; c.strokeStyle = '#223a14'; c.lineWidth = 1.2; circ(c, 0, 1, 7); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(20,40,10,.55)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-6.5, 1); c.lineTo(6.5, 1); c.moveTo(0, -5.5); c.lineTo(0, 7.5); c.moveTo(-4.6, -3.4); c.lineTo(4.6, 5.4); c.moveTo(4.6, -3.4); c.lineTo(-4.6, 5.4); c.stroke();
      c.fillStyle = '#8d8d8d'; rr(c, -2.6, -9, 5.2, 3.6, 1); c.fill(); c.strokeStyle = '#444'; c.stroke();
      c.strokeStyle = '#cfcfcf'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(2, -8); c.quadraticCurveTo(8.5, -9, 7, -4); c.stroke();
      circ(c, -5.5, -8, 2.3); c.stroke();
    },
    cluster(c) {
      const g = c.createRadialGradient(-3, -3, 1, 0, 0, 10);
      g.addColorStop(0, '#9bd36b'); g.addColorStop(1, '#456f2e');
      c.fillStyle = g; c.strokeStyle = '#223a14'; c.lineWidth = 1.3; circ(c, 0, 1, 9); c.fill(); c.stroke();
      c.fillStyle = '#f2cf3a'; c.beginPath(); c.moveTo(-8.4, -1.5); c.quadraticCurveTo(0, 1.5, 8.4, -1.5); c.lineTo(8.8, 2); c.quadraticCurveTo(0, 5, -8.8, 2); c.closePath(); c.fill();
      c.fillStyle = '#d33'; for (const x of [-4.8, 0, 4.8]) { circ(c, x, 1.6, 1.15); c.fill(); }
      c.fillStyle = '#8d8d8d'; rr(c, -3, -11, 6, 4, 1); c.fill(); c.strokeStyle = '#444'; c.lineWidth = 1; c.stroke();
    },
    banana(c) {
      c.lineWidth = 1.4; c.strokeStyle = '#8a6a10';
      c.fillStyle = '#ffdc3c';
      c.beginPath(); c.moveTo(-10, -5); c.quadraticCurveTo(-7, 9, 9, 6); c.quadraticCurveTo(12, 5.5, 12.5, 3); c.quadraticCurveTo(2, 5.5, -5, -6); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-7, -2); c.quadraticCurveTo(-3, 5, 6, 4); c.quadraticCurveTo(-2, 2, -7, -2); c.fill();
      c.fillStyle = '#6b4a1a'; c.beginPath(); c.arc(-9, -6.2, 2.4, 0, TAU); c.fill(); circ(c, 12.2, 3.2, 1.6); c.fill();
    },
    holy(c, o) {
      const t = o && o.t || 0;
      const gl = c.createRadialGradient(0, 0, 3, 0, 0, 20);
      gl.addColorStop(0, `rgba(255,236,150,${.55 + Math.sin(t * 6) * .15})`); gl.addColorStop(1, 'rgba(255,236,150,0)');
      c.fillStyle = gl; circ(c, 0, 0, 20); c.fill();
      const g = c.createLinearGradient(-6, 0, 6, 0);
      g.addColorStop(0, '#c99a1a'); g.addColorStop(.45, '#ffe483'); g.addColorStop(1, '#b8881a');
      c.fillStyle = g; c.strokeStyle = '#7a5a0a'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-6, -2); c.quadraticCurveTo(-8, 7, 0, 8); c.quadraticCurveTo(8, 7, 6, -2); c.quadraticCurveTo(0, -5, -6, -2); c.fill(); c.stroke();
      c.fillStyle = '#a97a10'; c.fillRect(-6.6, 0, 13.2, 1.6);
      c.fillStyle = g; c.fillRect(-1.5, -12, 3, 8); c.fillRect(-4.2, -10, 8.4, 2.8); c.strokeRect(-1.5, -12, 3, 8); c.strokeRect(-4.2, -10, 8.4, 2.8);
      c.fillStyle = '#e53'; circ(c, 0, -8.6, 1.1); c.fill();
    },
    shotgun(c) {
      c.fillStyle = '#7b4b25'; c.beginPath(); c.moveTo(-5, -2.6); c.lineTo(-12, -1); c.lineTo(-17, 4.5); c.lineTo(-11, 4.8); c.lineTo(-4, 2.2); c.closePath(); c.fill(); c.strokeStyle = '#3d2410'; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#4a4f57'; rr(c, -5, -3, 22, 3.2, 1.2); c.fill(); rr(c, -5, 0.4, 22, 3.2, 1.2); c.fill(); c.strokeStyle = '#25282c'; c.stroke();
      c.fillStyle = '#5c3718'; rr(c, 3, 3.6, 8, 3.6, 1.4); c.fill();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-4, -2.5, 19, .9);
    },
    uzi(c) {
      c.fillStyle = '#2a2c30'; rr(c, -3.4, 2, 5.4, 11, 1.2); c.fill();
      c.fillStyle = '#3a3d43'; rr(c, -10, -3.8, 19, 7.6, 1.8); c.fill(); c.strokeStyle = '#17181a'; c.lineWidth = 1.1; c.stroke();
      c.fillStyle = '#222'; c.fillRect(9, -1.8, 7, 3.6); c.fillRect(-10, -5.6, 2.4, 2);
      c.fillStyle = '#4a4d54'; c.beginPath(); c.moveTo(-9, 3); c.lineTo(-5, 3); c.lineTo(-6.5, 9.5); c.lineTo(-10, 9.5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-8, -3, 15, 1);
    },
    punch(c, o) {
      const t = o && o.t || 0;
      for (let i = 0; i < 4; i++) {
        const f = (Math.sin(t * 22 + i * 2) + 1) / 2;
        c.fillStyle = i % 2 ? '#ffd23a' : '#ff6a1a';
        c.beginPath(); c.moveTo(-6 - i * 1.4, -5 + i * 3.2); c.quadraticCurveTo(-13 - f * 5, -4 + i * 3.4, -17 - f * 4 - i, -6 + i * 3.6); c.quadraticCurveTo(-12, -1 + i * 3.4, -5, 1 + i * 3.1); c.closePath(); c.fill();
      }
      c.fillStyle = '#e6a05a'; c.strokeStyle = '#7a4a1e'; c.lineWidth = 1.3;
      rr(c, -6, -7, 15, 14, 5); c.fill(); c.stroke();
      c.strokeStyle = '#a8662a'; c.beginPath(); c.moveTo(9, -3.5); c.lineTo(3, -3.5); c.moveTo(9, 0); c.lineTo(3, 0); c.moveTo(9, 3.5); c.lineTo(3, 3.5); c.stroke();
      c.fillStyle = '#e6a05a'; rr(c, 1, -10, 6, 5, 2.5); c.fill(); c.stroke();
      c.fillStyle = '#d33'; rr(c, -8, -6, 3.4, 12, 1.4); c.fill();
    },
    bat(c) {
      const g = c.createLinearGradient(0, -4, 0, 4);
      g.addColorStop(0, '#e2b36e'); g.addColorStop(1, '#a97a3a');
      c.fillStyle = g; c.strokeStyle = '#5a3c14'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-15, -1.5); c.lineTo(-7, -1.7); c.lineTo(8, -3.9); c.quadraticCurveTo(16, -4, 16, 0); c.quadraticCurveTo(16, 4, 8, 3.9); c.lineTo(-7, 1.7); c.lineTo(-15, 1.5); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#222'; c.fillRect(-15, -1.7, 7, 3.4); c.fillStyle = '#e33'; c.fillRect(-9.4, -1.7, 1.4, 3.4);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-2, -2.6, 14, .9);
      circ(c, -15, 0, 2); c.fillStyle = '#333'; c.fill();
    },
    dynamite(c, o) {
      const t = o && o.t || 0;
      for (const [x, y, col] of [[-5, -4, '#c0281d'], [-5, 0.2, '#d6352a'], [-5, 4.4, '#b5231a']]) {
        c.fillStyle = col; c.strokeStyle = '#5a1008'; c.lineWidth = 1; rr(c, x - 4, y - 1.8, 18, 3.8, 1.6); c.fill(); c.stroke();
      }
      c.fillStyle = '#efe7cf'; c.fillRect(1, -6.4, 2.8, 13.4); c.fillRect(6, -6.4, 2.8, 13.4);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(10, -4); c.quadraticCurveTo(14, -8, 17, -6); c.stroke();
      const f = .6 + Math.sin(t * 40) * .4;
      c.fillStyle = '#ffd23a'; circ(c, 17.5, -6, 2 + f); c.fill(); c.fillStyle = '#ff7a1a'; circ(c, 17.5, -6, 1 + f * .6); c.fill();
    },
    sheep(c, o) {
      const t = o && o.t || 0, k = Math.sin(t * 12) * 1.4;
      c.fillStyle = '#2a2a2e';
      for (const [x, ph] of [[-5, 0], [-1, 2], [3, 1], [7, 3]]) { const l = Math.sin(t * 12 + ph) * 1.5; rr(c, x - 1, 5 + (l > 0 ? l : 0) * .3, 2.2, 5.5, 1); c.fill(); }
      c.fillStyle = '#f7f5ee'; c.strokeStyle = '#a8a39a'; c.lineWidth = 1;
      for (const [x, y, r] of [[-7, 0.5, 5], [-2, -2.5, 6], [4, -2, 5.6], [8, 1.4, 4.6], [-1, 3, 5.8], [4, 3, 5]]) { circ(c, x, y + k * .1, r); c.fill(); c.stroke(); }
      for (const [x, y, r] of [[-7, 0.5, 4.2], [-2, -2.5, 5.2], [4, -2, 4.8], [8, 1.4, 3.8], [-1, 3, 5], [4, 3, 4.2]]) { circ(c, x, y + k * .1, r); c.fill(); }
      c.fillStyle = '#2a2a2e'; circ(c, 12, -.4, 3.9); c.fill();
      c.beginPath(); c.ellipse(9.4, -3.6, 1.6, 2.8, -.6, 0, TAU); c.fill();
      c.fillStyle = '#fff'; circ(c, 13, -1.4, 1.1); c.fill(); c.fillStyle = '#000'; circ(c, 13.3, -1.4, .5); c.fill();
    },
    airstrike(c) {
      c.fillStyle = '#7e8a96'; c.strokeStyle = '#3a444e'; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(-9, -1); c.lineTo(-13, -8); c.lineTo(-10, -8); c.lineTo(-4, -1); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#9aa7b3'; c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(0, -5.5, 15, -.5); c.quadraticCurveTo(0, 5, -14, 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#6f7c88'; c.beginPath(); c.moveTo(-3, 1.5); c.lineTo(-9, 10); c.lineTo(-5, 10); c.lineTo(5, 1.5); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#d33'; c.fillRect(-13, -1, 3, 2); circ(c, 9, -1.4, 2.2); c.fillStyle = '#9fd8ff'; c.fill();
    },
    teleport(c, o) {
      const t = o && o.t || 0;
      const g = c.createRadialGradient(-2, -2, 1, 0, 0, 10);
      g.addColorStop(0, '#e8d2ff'); g.addColorStop(.55, '#8f5cf0'); g.addColorStop(1, '#43208f');
      c.fillStyle = g; circ(c, 0, 0, 9); c.fill(); c.strokeStyle = '#2a1260'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 3 + i * 2.2, t * 3 + i * 2, t * 3 + i * 2 + 2.4); c.stroke(); }
    },
    rope(c) {
      c.strokeStyle = '#b08a4a'; c.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-6, 3, 7 - i, 5 - i * .5, 0, 0, TAU); c.stroke(); }
      c.strokeStyle = '#c4c9cf'; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(2, 0); c.lineTo(12, 0); c.moveTo(12, 0); c.quadraticCurveTo(17, -2, 17, -8); c.moveTo(12, 0); c.quadraticCurveTo(17, 2, 17, 8); c.moveTo(12, -1); c.lineTo(15.5, -1); c.stroke();
      c.lineCap = 'butt';
      c.strokeStyle = '#555'; c.lineWidth = .8; c.beginPath(); c.moveTo(2, 0); c.lineTo(12, 0); c.stroke();
    },
    girder(c) {
      c.fillStyle = '#e07a2a'; c.strokeStyle = '#6a3410'; c.lineWidth = 1.2;
      c.fillRect(-15, -4.6, 30, 9.2); c.strokeRect(-15, -4.6, 30, 9.2);
      c.strokeStyle = '#7d3a10'; c.lineWidth = 1.2; c.beginPath();
      for (let x = -15; x < 15; x += 6) { c.moveTo(x, -4.6); c.lineTo(x + 6, 4.6); c.moveTo(x + 6, -4.6); c.lineTo(x, 4.6); }
      c.stroke();
      c.fillStyle = '#ffb36a'; c.fillRect(-15, -4.6, 30, 1.6); c.fillStyle = '#5a2a0c'; c.fillRect(-15, 3.2, 30, 1.4);
    }
  };

  function drawRocket(c, t) {
    const f = .7 + Math.sin(t * 50) * .3;
    const g = c.createRadialGradient(-12, 0, 1, -12, 0, 12);
    g.addColorStop(0, 'rgba(255,240,150,.95)'); g.addColorStop(.4, 'rgba(255,140,30,.8)'); g.addColorStop(1, 'rgba(255,60,0,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-6, -3); c.lineTo(-18 - 6 * f, 0); c.lineTo(-6, 3); c.closePath(); c.fill();
    c.fillStyle = '#c9ced4'; c.strokeStyle = '#4a5058'; c.lineWidth = 1;
    rr(c, -7, -3.2, 14, 6.4, 3); c.fill(); c.stroke();
    c.fillStyle = '#d6372b'; c.beginPath(); c.moveTo(6, -3.2); c.quadraticCurveTo(12, -2.4, 13, 0); c.quadraticCurveTo(12, 2.4, 6, 3.2); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#d6372b'; c.beginPath(); c.moveTo(-7, -3); c.lineTo(-10, -7); c.lineTo(-3, -3); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-7, 3); c.lineTo(-10, 7); c.lineTo(-3, 3); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-5, -2.4, 9, 1);
  }
  function drawPlane(c, t) {
    c.fillStyle = '#7d8a97'; c.strokeStyle = '#2f3942'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-34, -2); c.lineTo(-44, -18); c.lineTo(-34, -18); c.lineTo(-12, -3); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#a3b0bc'; c.beginPath(); c.moveTo(-42, -4); c.quadraticCurveTo(0, -14, 44, 0); c.quadraticCurveTo(0, 12, -42, 5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#6b7885'; c.beginPath(); c.moveTo(-6, 3); c.lineTo(-22, 22); c.lineTo(-10, 22); c.lineTo(14, 3); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c0392b'; c.fillRect(-40, -1, 8, 4);
    circ(c, 24, -3, 5); c.fillStyle = '#a6dcff'; c.fill(); c.stroke();
    c.fillStyle = '#333'; c.fillRect(-4, 8, 14, 5); c.fillStyle = '#ffd23a'; c.fillRect(-2, 9, 10, 2);
    c.save(); c.translate(46, 0); c.rotate(t * 40); c.fillStyle = 'rgba(40,40,40,.55)'; c.fillRect(-1, -12, 2, 24); c.restore();
  }

  function grad3(c, x0, y0, x1, y1, stops) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    return g;
  }

  function drawGrave(c, g, th, now) {
    const col = TEAMS[g.col == null ? g.tm : g.col] || TEAMS[0];
    c.save(); c.translate(g.x, g.y);
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 0, 10, 2.6, 0, 0, TAU); c.fill();
    c.strokeStyle = '#3b3b44'; c.lineWidth = 1.4;
    const stone = grad3(c, -8, -20, 8, 0, [[0, '#d9dce3'], [1, '#9aa0ab']]);
    const k = g.kind % 5;
    if (k === 0) {
      c.fillStyle = stone; c.fillRect(-2.6, -22, 5.2, 22); c.strokeRect(-2.6, -22, 5.2, 22); c.fillRect(-8, -17, 16, 5); c.strokeRect(-8, -17, 16, 5);
    } else if (k === 1) {
      c.fillStyle = stone; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-8, -15); c.arc(0, -15, 8, PI, 0); c.lineTo(8, 0); c.closePath(); c.fill(); c.stroke();
    } else if (k === 2) {
      c.fillStyle = stone; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-4.5, -24); c.lineTo(0, -28); c.lineTo(4.5, -24); c.lineTo(6, 0); c.closePath(); c.fill(); c.stroke();
    } else if (k === 3) {
      c.fillStyle = stone; rr(c, -8, -19, 16, 19, 3); c.fill(); c.stroke();
      c.fillStyle = col.c; c.beginPath(); c.moveTo(0, -7); c.bezierCurveTo(-8, -12, -3, -18, 0, -13); c.bezierCurveTo(3, -18, 8, -12, 0, -7); c.fill();
    } else {
      c.fillStyle = stone; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-9, -10); c.lineTo(-3, -18); c.lineTo(3, -18); c.lineTo(9, -10); c.lineTo(9, 0); c.closePath(); c.fill(); c.stroke();
    }
    c.fillStyle = col.c; c.fillRect(-7.4, -6.4, 14.8, 3); c.fillStyle = 'rgba(0,0,0,.35)'; c.font = 'bold 5px ' + FONT; c.textAlign = 'center'; c.fillText('RIP', 0, -9);
    c.fillStyle = '#6b4a2e'; c.beginPath(); c.ellipse(0, 0, 9.5, 2.8, 0, 0, PI); c.fill();
    c.restore();
  }

  function drawCrate(c, cr, th, now) {
    c.save(); c.translate(cr.x, cr.y);
    const sw = cr.chute ? Math.sin(now * 2.4 + cr.id) * .12 : 0;
    c.rotate(sw);
    if (cr.chute) {
      c.save();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-26, -42); c.lineTo(-8, -17); c.moveTo(26, -42); c.lineTo(8, -17); c.moveTo(-10, -52); c.lineTo(-4, -17); c.moveTo(10, -52); c.lineTo(4, -17); c.moveTo(0, -54); c.lineTo(0, -17); c.stroke();
      const cols = ['#ff4d4d', '#ffffff'];
      for (let i = 0; i < 4; i++) {
        c.fillStyle = cols[i % 2];
        c.beginPath(); c.moveTo(-28 + i * 14, -41); c.quadraticCurveTo(-28 + i * 14 + 3, -62 + Math.abs(i - 1.5) * 4, -14 + i * 14, -41); c.closePath(); c.fill();
      }
      c.strokeStyle = '#9a2a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-28, -41); c.quadraticCurveTo(0, -75, 28, -41); c.stroke();
      c.restore();
    }
    const k = cr.k;
    const base = k === 0 ? ['#f4f4f4', '#c9c9c9'] : k === 1 ? ['#d9a35c', '#9a6a2e'] : ['#7fa7d8', '#476c9f'];
    c.fillStyle = grad3(c, 0, -18, 0, 0, [[0, base[0]], [1, base[1]]]); c.strokeStyle = k === 1 ? '#5a3a14' : k === 0 ? '#777' : '#26405f'; c.lineWidth = 1.6;
    rr(c, -9, -18, 18, 18, 2); c.fill(); c.stroke();
    c.strokeStyle = k === 1 ? 'rgba(90,58,20,.6)' : 'rgba(0,0,0,.25)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-9, -12); c.lineTo(9, -12); c.moveTo(-9, -6); c.lineTo(9, -6); c.stroke();
    if (k === 0) { c.fillStyle = '#d6252b'; c.fillRect(-2.2, -15.5, 4.4, 13); c.fillRect(-6.5, -11.2, 13, 4.4); }
    else if (k === 1) { c.fillStyle = '#ffe14a'; c.strokeStyle = '#7a5a00'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.6 : 6, a = -PI / 2 + i * PI / 5; c.lineTo(Math.cos(a) * r, -9 + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
    else { c.strokeStyle = '#f3f7ff'; c.lineWidth = 2; c.beginPath(); c.arc(0, -9, 3.6, 0, TAU); c.stroke(); for (let i = 0; i < 6; i++) { const a = i * PI / 3; c.moveTo(Math.cos(a) * 4.6, -9 + Math.sin(a) * 4.6); c.lineTo(Math.cos(a) * 7, -9 + Math.sin(a) * 7); } c.stroke(); }
    c.restore();
  }

  const SKIN = { base: '#f6a3b5', hi: '#ffc9d4', shade: '#e07990', out: '#6a2434', ring: '#d9708a' };
  const SPINE = [[-2.6, -3.8, 3.7], [-1.8, -8.6, 5.5], [-.8, -13.4, 6.4], [.2, -18, 6.8], [1.2, -22.4, 7.2]];
  const PROJ_KINDS = ['rocket', 'nade', 'clus', 'bana', 'holy', 'dyn', 'sheep', 'plane', 'air', 'cl', 'bn'];
  const SAY_MAP = { fire: 'fire', ouch: 'ouch', inc: 'inc', rev: 'rev', cow: 'cow', take: 'take', hello: 'hello', bye: 'bye', drown: 'drown', ohno: 'ohno', nice: 'nice', oops: 'oops', yes: 'yes' };

  function makeView(cv, audio) {
    const ctx = cv.getContext('2d');
    const X = { W: 640, H: 400, dpr: 1, t: 0, cam: { x: WW / 2, y: 460, z: 1 }, zm: 1, shake: 0, free: 0, focus: null, parts: [], pops: [], banners: [], feed: [], amb: [], marks: [], A: [], layers: null, th: null, deco: [], mouse: null, touch: false, showMap: true, flash: 0, tickN: -1, hurtFlash: 0, girder: null, wasTurn: -1, cursorWorld: null, lastTl: 0 };
    const cam = X.cam;
    const anim = i => X.A[i] || (X.A[i] = { blink: 1 + Math.random() * 3, bl: 0, wp: 0, spin: 0, talk: 0, lx: 1, ly: 0, ph: Math.random() * 6, hp: -1, land: 0, lastOn: true, lookT: 0, ex: 0 });
    const pf = o => { if (X.parts.length > 800) X.parts.shift(); X.parts.push(o); return o; };

    function resize() {
      const w = cv.clientWidth || 640, h = cv.clientHeight || 400, d = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(w * d), ph = Math.round(h * d);
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
      X.W = w; X.H = h; X.dpr = d;
    }
    function zoomBase() { return Math.max(X.H / 470, X.W / WW); }
    function curZ() { return clamp(zoomBase() * X.zm, X.W / WW, 3.2); }
    function toWorld(px, py) { const z = cam.z; return { x: (px - X.W / 2) / z + cam.x, y: (py - X.H / 2) / z + cam.y }; }

    function setup(V) {
      X.th = V.th; X.layers = makeLayers(V.th, V.cfg.seed); X.A = []; X.parts.length = 0; X.pops.length = 0; X.banners.length = 0; X.feed.length = 0; X.marks.length = 0; X.focus = null; X.free = 0; X.amb.length = 0; X.tickN = -1; X.wasTurn = -1; X.flash = 0;
      const R = Rng(V.cfg.seed ^ 0x77aa33), T = V.T, deco = [], kind = V.th.deco;
      let lastBig = -999;
      for (let x = 24; x < WW - 24; x += R.range(10, 24)) {
        const y = T.surface(x, 0);
        if (y < 0 || y > WH - 140) continue;
        const nrm = T.normal(x, y - 1, 5), rot = clamp(Math.atan2(nrm.x, -nrm.y), -.6, .6);
        const big = x - lastBig > 170 && R.next() < .3 && Math.abs(rot) < .25;
        if (big) lastBig = x;
        deco.push({ x, y: y + 1, rot, big, s: big ? R.range(.8, 1.3) : R.range(.7, 1.3), v: R.int(0, 5), c: R.int(0, 3), r: R.next() });
      }
      X.deco = deco;
      const n = V.th.id === 'inferno' ? 70 : V.th.id === 'frost' ? 90 : 38;
      for (let i = 0; i < n; i++) X.amb.push({ x: Math.random(), y: Math.random(), z: .3 + Math.random() * .9, p: Math.random() * 6 });
      const w = V.cur;
      if (w) { cam.x = w.x; cam.y = w.y - 40; }
      cam.z = curZ();
    }

    function focusAt(x, y, t) { X.focus = { x, y, t }; }
    function panBy(dx, dy) { cam.x -= dx / cam.z; cam.y -= dy / cam.z; X.free = 4; clampCam(); }
    function clampCam() {
      const hw = X.W / 2 / cam.z, hh = X.H / 2 / cam.z;
      cam.x = hw * 2 >= WW ? WW / 2 : clamp(cam.x, hw, WW - hw);
      cam.y = clamp(cam.y, hh - 240, WH + 30 - hh);
    }
    function zoomBy(f) { X.zm = clamp(X.zm * f, .55, 2.4); }

    function camUpdate(V, dt) {
      const tz = curZ();
      cam.z += (tz - cam.z) * (1 - Math.exp(-dt * 6));
      let tx = cam.x, ty = cam.y, follow = false;
      if (X.free > 0) X.free -= dt;
      else {
        const pr = V.projs;
        let fp = null;
        if (pr.length) {
          let sx = 0, sy = 0, n = 0;
          for (const p of pr) { if (p.k === 'plane') continue; sx += p.x; sy += p.y; n++; }
          if (n) fp = { x: sx / n, y: sy / n };
          else fp = { x: pr[0].x, y: pr[0].y + 100 };
        }
        const cr = V.crates.find(c => !c.land);
        const cw = V.cur;
        if (fp) { tx = fp.x; ty = fp.y - 20; follow = true; }
        else if (X.focus && X.focus.t > 0) { tx = X.focus.x; ty = X.focus.y; X.focus.t -= dt; follow = true; }
        else if (cr && V.phase === 'resolve') { tx = cr.x; ty = cr.y; follow = true; }
        else if (cw && !cw.dead && (V.phase === 'turn' || V.phase === 'act' || V.phase === 'intro')) {
          tx = cw.x + (cw.rope && cw.rope.st === 'hang' ? cw.vx * .15 : 0); ty = cw.y - 34 - (X.touch ? X.H * .08 / cam.z : 0);
          if (cw.rope && cw.rope.st === 'hang') ty = cw.y - 20;
          follow = true;
        }
        if (!follow && V.phase === 'over' && V.winner >= 0) { const wm = V.worms.find(w => !w.dead && w.tm === V.winner); if (wm) { tx = wm.x; ty = wm.y - 34; } }
        const k = fp ? 7 : 4.2;
        cam.x += (tx - cam.x) * (1 - Math.exp(-dt * k)); cam.y += (ty - cam.y) * (1 - Math.exp(-dt * k));
      }
      clampCam();
      X.shake = Math.max(0, X.shake - dt * 2.4);
    }

    function updateParts(V, dt) {
      const P = X.parts;
      let j = 0;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.life -= dt;
        if (p.life <= 0) continue;
        if (p.vx === undefined) { P[j++] = p; continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt;
        if (p.dr) { const f = Math.max(0, 1 - p.dr * dt); p.vx *= f; p.vy *= f; }
        if (p.wd) p.vx += V.wind * 40 * dt * p.wd;
        if (p.vr) p.rot = (p.rot || 0) + p.vr * dt;
        if (p.k === 'drop' && p.y > V.waterY + 2 && p.vy > 0) continue;
        if (p.k === 'deb' && p.land == null && V.T.solid(p.x, p.y)) { p.vy *= -.25; p.vx *= .5; p.y -= 2; if (Math.abs(p.vy) < 20) p.life = Math.min(p.life, .3); }
        P[j++] = p;
      }
      P.length = j;
      const pp = X.pops;
      let k = 0;
      for (const p of pp) { p.t += dt; if (p.t < p.max) { p.y += p.vy * dt; pp[k++] = p; } }
      pp.length = k;
      const ba = X.banners; k = 0;
      for (const b of ba) { b.t += dt; if (b.t < b.max) ba[k++] = b; }
      ba.length = k;
      const fd = X.feed; k = 0;
      for (const b of fd) { b.t += dt; if (b.t < b.max) fd[k++] = b; }
      fd.length = k;
      const mk = X.marks; k = 0;
      for (const m of mk) { m.t -= dt; if (m.t > 0) mk[k++] = m; }
      mk.length = k;
      X.flash = Math.max(0, X.flash - dt * 1.6);
    }

    function banner(txt, sub, col, max = 2.2) { X.banners.length = 0; X.banners.push({ txt, sub, col: col || '#fff', t: 0, max }); }
    function feed(txt, col) { X.feed.push({ txt, col: col || '#fff', t: 0, max: 5 }); if (X.feed.length > 5) X.feed.shift(); }
    function pop(x, y, txt, col, size = 14) { X.pops.push({ x, y, txt, col, t: 0, max: 1.5, vy: -38, size }); }

    function burst(x, y, n, f) { for (let i = 0; i < n; i++) pf(f(i)); }

    function event(e, V) {
      switch (e.e) {
        case 'boom': {
          const r = e.r, big = r > 70;
          pf({ k: 'flash', x: e.x, y: e.y, s: r * 1.7, life: .3, max: .3, add: 1 });
          pf({ k: 'ring', x: e.x, y: e.y, s: r * 1.5, life: .45, max: .45 });
          burst(e.x, e.y, Math.round(r / 3), () => { const a = Math.random() * TAU, sp = 60 + Math.random() * 240 * (r / 60); return { k: 'fire', x: e.x + Math.cos(a) * r * .2, y: e.y + Math.sin(a) * r * .2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: .45 + Math.random() * .5, max: 1, s: r * (.14 + Math.random() * .18), dr: 2.2, add: 1 }; });
          burst(e.x, e.y, Math.round(r / 5), () => { const a = Math.random() * TAU, sp = 20 + Math.random() * 110; return { k: 'smoke', x: e.x + Math.cos(a) * r * .3, y: e.y + Math.sin(a) * r * .3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 1.1 + Math.random() * 1.1, max: 2.2, s: r * (.16 + Math.random() * .16), dr: 1.2, wd: 1 }; });
          const th = V.th, cols = [th.dirt[0], th.dirt[1], th.top[0], th.deepc];
          burst(e.x, e.y, Math.round(r / 2.6), () => { const a = -PI / 2 + (Math.random() - .5) * 2.8, sp = 120 + Math.random() * 360 * (r / 60); return { k: 'deb', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 700, life: 1 + Math.random() * 1.2, max: 2, s: 1.6 + Math.random() * 3.2, col: rgb(cols[(Math.random() * 4) | 0]), rot: Math.random() * 6, vr: (Math.random() - .5) * 14 }; });
          if (r >= 40) X.pops.push({ x: e.x, y: e.y - r * .5, txt: r > 90 ? 'KABOOM!' : r > 60 ? 'BOOM!' : 'POW!', col: '#ffe14a', t: 0, max: .7, vy: -20, size: 16 + r / 8, pow: 1 });
          X.shake = Math.min(1.7, X.shake + r / 55);
          if (e.k === 2) X.flash = 1;
          audio.boom(r, 1);
          if (X.free <= 0) focusAt(e.x, e.y, 1.4);
          break;
        }
        case 'snd': {
          const f = audio[e.n];
          if (e.n === 'bounce' || e.n === 'thud') audio[e.n](e.v == null ? 1 : e.v);
          else if (e.n === 'launch') audio.launch();
          else if (e.n === 'throw') audio.throwIt();
          else if (e.n === 'shot') audio.shot(1);
          else if (e.n === 'pop') audio.jingle();
          else if (e.n === 'punch') audio.punch();
          else if (e.n === 'choir') audio.choir();
          else if (typeof f === 'function') f();
          break;
        }
        case 'say': {
          const w = V.worms[e.i]; if (!w) break;
          const tm = V.teams[w.tm], an = anim(w.i);
          audio.speak(SAY_MAP[e.k] || 'ouch', (tm.voice || 1) * (.96 + (w.i % 3) * .04), 0, .38);
          an.talk = .5;
          break;
        }
        case 'puff': {
          const n = e.k === 3 ? 4 : e.k === 2 ? 7 : 6;
          burst(e.x, e.y, n, () => { const a = Math.random() * TAU, sp = 15 + Math.random() * 50; return { k: 'smoke', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, life: .5 + Math.random() * .5, max: 1, s: e.k === 3 ? 4 : 6 + Math.random() * 3, dr: 1.5, col: e.k === 0 ? 'rgb(214,196,160)' : null }; });
          break;
        }
        case 'spark': burst(e.x, e.y, e.k ? 10 : 7, () => { const a = Math.random() * TAU, sp = 60 + Math.random() * 180; return { k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 400, life: .25 + Math.random() * .3, max: .5, s: 1.5, add: 1 }; }); break;
        case 'tracer': pf({ k: 'line', x: e.x0, y: e.y0, x2: e.x1, y2: e.y1, life: .1, max: .1 }); break;
        case 'splash': {
          const n = e.s === 2 ? 26 : e.s === 1 ? 16 : 8;
          burst(e.x, e.y, n, () => { const a = -PI / 2 + (Math.random() - .5) * 1.4; const sp = 90 + Math.random() * (e.s === 2 ? 330 : 220); return { k: 'drop', x: e.x + (Math.random() - .5) * 10, y: e.y, vx: Math.cos(a) * sp * .5, vy: Math.sin(a) * sp, g: 600, life: 1.2, max: 1.2, s: 1.6 + Math.random() * 1.8 }; });
          pf({ k: 'ripple', x: e.x, y: e.y, s: e.s === 2 ? 60 : 38, life: .9, max: .9 });
          audio.splash(e.s === 2 ? 1 : .6);
          break;
        }
        case 'dmg': pop(e.x, e.y, String(e.n), '#ff5a4a', 15); break;
        case 'die': {
          const w = V.worms[e.i]; if (!w) break;
          const tm = V.teams[e.tm];
          feed(e.n + ' has been killed', TEAMS[tm.col != null ? tm.col : e.tm].l);
          pf({ k: 'ghost', x: e.x, y: e.y - 14, vx: 0, vy: -48, life: 1.8, max: 1.8, s: 1, col: TEAMS[tm.col != null ? tm.col : e.tm].c });
          audio.speak('bye', (tm.voice || 1), 0, .4);
          if (X.free <= 0) focusAt(e.x, e.y, 1.6);
          break;
        }
        case 'drown': {
          const tm = V.teams[e.tm];
          feed(e.n + ' drowned', TEAMS[tm.col != null ? tm.col : e.tm].l);
          audio.speak('drown', (tm.voice || 1), 0, .4);
          if (X.free <= 0) focusAt(e.x, Math.min(e.y, V.waterY - 30), 1.4);
          break;
        }
        case 'turn': {
          const tm = V.teams[e.tm], w = V.worms[e.i];
          X.wasTurn = e.n; X.tickN = -1;
          if (X.free > 0) X.free = 0;
          X.focus = null;
          banner(tm.name, w.name, TEAMS[tm.col != null ? tm.col : e.tm].l, 2.1);
          audio.jingle();
          break;
        }
        case 'over': audio.fan(); break;
        case 'sd': banner('SUDDEN DEATH', 'The water is rising', '#ff7a5a', 3); audio.sd(); X.shake = 1; break;
        case 'crate': banner('Crate drop!', '', '#ffe14a', 1.6); break;
        case 'pick': {
          pop(e.x, e.y - 14, e.t, e.k === 0 ? '#8dff9a' : e.k === 1 ? '#ffe14a' : '#9ad0ff', 14);
          burst(e.x, e.y, 10, () => ({ k: 'spark', x: e.x, y: e.y - 8, vx: (Math.random() - .5) * 160, vy: -Math.random() * 180, g: 300, life: .6, max: .6, s: 2, add: 1, col: '#fff7a0' }));
          audio.pickup();
          break;
        }
        case 'poof': burst(e.x, e.y, 8, () => ({ k: 'smoke', x: e.x, y: e.y, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, life: .6, max: .6, s: 7, dr: 1.5 })); break;
        case 'mark': X.marks.push({ x: e.x, y: e.y, t: 2.6 }); break;
        case 'deny': audio.err(); pop(cam.x, cam.y - 60, 'Not there', '#ffb0a0', 14); break;
        case 'act': break;
        case 'tp': {
          audio.warp();
          for (const [x, y] of [[e.x0, e.y0], [e.x1, e.y1]]) burst(x, y, 16, () => { const a = Math.random() * TAU, sp = 30 + Math.random() * 90; return { k: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: .6, max: .6, s: 2.2, add: 1, col: '#c9a0ff' }; });
          break;
        }
        case 'fire': burst(e.x, e.y, 14, () => ({ k: 'fire', x: e.x, y: e.y, vx: (Math.random() - .5) * 140, vy: -Math.random() * 120, life: .4 + Math.random() * .4, max: .8, s: 6 + Math.random() * 6, dr: 2, add: 1 })); break;
      }
    }

    function drawBackdrop(V) {
      const c = ctx, W = X.W, H = X.H, th = V.th, z = cam.z;
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, rgb(th.sky[0])); sky.addColorStop(.55, rgb(th.sky[1])); sky.addColorStop(1, rgb(th.sky[2]));
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      const sx = W * th.sunX - (cam.x / WW - .5) * 60, sy = H * th.sunY - (cam.y - 460) * .03 * z;
      const sg = c.createRadialGradient(sx, sy, 4, sx, sy, H * .65);
      sg.addColorStop(0, th.sun); sg.addColorStop(.06, th.sun); sg.addColorStop(.07, th.night ? 'rgba(255,160,70,.5)' : 'rgba(255,248,200,.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      const L = X.layers;
      if (!L) return;
      for (let i = 0; i < 8; i++) {
        const cl = L.clouds[i % L.clouds.length], seed = i * 523.7;
        const u = ((seed + X.t * (6 + (i % 3) * 3) + cam.x * .06) % 2600 + 2600) % 2600 - 300;
        const cx = u * z * .62 * 1 - 0;
        const sxx = cx, syy = H * (.08 + (i * .137) % .38) - (cam.y - 460) * .05 * z;
        const sc = (.7 + (i % 4) * .22) * Math.max(.6, z * .9);
        c.globalAlpha = th.night ? .45 : .9;
        c.drawImage(cl, sxx, syy, cl.width * sc, cl.height * sc);
      }
      c.globalAlpha = 1;
      const layer = (img, p, pv, anchor, alpha) => {
        const lw = L.LW * z, lh = L.LH * z, camLx = cam.x * p;
        const yb = H / 2 + (anchor - cam.y * pv - 460 * (1 - pv)) * z;
        const n0 = Math.floor((camLx - W / 2 / z) / L.LW), n1 = Math.floor((camLx + W / 2 / z) / L.LW);
        c.globalAlpha = alpha;
        for (let n = n0; n <= n1; n++) {
          const x0 = W / 2 + (n * L.LW - camLx) * z;
          if (n & 1) { c.save(); c.translate(x0 + lw, yb - lh); c.scale(-1, 1); c.drawImage(img, 0, 0, lw, lh); c.restore(); }
          else c.drawImage(img, x0, yb - lh, lw, lh);
        }
        c.globalAlpha = 1;
        return yb;
      };
      layer(L.far, .16, .24, 640, 1);
      const yn = layer(L.near, .36, .5, 720, 1);
      const fog = hex(th.fog), n2 = hex(th.near2);
      const gr = c.createLinearGradient(0, yn - 2, 0, yn + 260 * z);
      gr.addColorStop(0, rgb(n2)); gr.addColorStop(1, rgb(mixc(n2, th.deepc, .7)));
      c.fillStyle = gr; c.fillRect(0, yn - 1, W, H - yn + 2);
      if (th.night) {
        const g2 = c.createLinearGradient(0, H * .5, 0, H);
        g2.addColorStop(0, 'rgba(255,90,20,0)'); g2.addColorStop(1, 'rgba(255,90,20,.25)');
        c.fillStyle = g2; c.fillRect(0, H * .5, W, H * .5);
      }
    }

    function drawAmbient(V, dt) {
      const c = ctx, W = X.W, H = X.H, th = V.th, id = th.id;
      c.save();
      for (const p of X.amb) {
        const sp = id === 'frost' ? 38 : id === 'inferno' ? -34 : 12;
        p.y += (sp * p.z * dt) / H + (id === 'inferno' ? 0 : 0);
        p.x += (V.wind * 60 * p.z + Math.sin(X.t * .8 + p.p) * 10) * dt / W;
        if (p.y > 1.05) p.y = -.05; if (p.y < -.05) p.y = 1.05;
        if (p.x > 1.05) p.x = -.05; if (p.x < -.05) p.x = 1.05;
        const x = p.x * W, y = p.y * H;
        if (id === 'frost') { c.fillStyle = 'rgba(255,255,255,.85)'; circ(c, x, y, 1.2 + p.z * 1.6); c.fill(); }
        else if (id === 'inferno') { c.fillStyle = `rgba(255,${130 + p.z * 80 | 0},40,${.4 + p.z * .4})`; circ(c, x, y, .9 + p.z * 1.4); c.fill(); }
        else if (id === 'candy') { c.fillStyle = ['#ff5fa8', '#ffd24a', '#5fd0ff', '#9be35a'][(p.p * 3 | 0) % 4]; c.save(); c.translate(x, y); c.rotate(X.t + p.p); c.fillRect(-1.5, -.6, 3, 1.2); c.restore(); }
        else if (id === 'dunes') { c.fillStyle = 'rgba(255,230,190,.35)'; c.fillRect(x, y, 6 + p.z * 10, 1); }
        else { c.fillStyle = 'rgba(255,255,230,.5)'; circ(c, x, y, 1 + p.z); c.fill(); }
      }
      c.restore();
    }

    function drawWater(V, front) {
      const c = ctx, th = V.th, z = cam.z, W = X.W, H = X.H;
      const x0 = cam.x - W / 2 / z - 20, x1 = cam.x + W / 2 / z + 20, wy = V.waterY;
      const yTop = H / 2 + (wy - cam.y) * z;
      if (yTop > H + 30) return;
      const wc = th.water;
      const off = front ? 0 : -14, amp = front ? 3.2 : 4.4, ph = front ? X.t * 1.7 : X.t * 1.1 + 2;
      c.beginPath(); c.moveTo(x0, wy + 3000);
      for (let x = x0; x <= x1 + 16; x += 14) c.lineTo(x, wy + off + Math.sin(x * .025 + ph) * amp + Math.sin(x * .061 - ph * 1.3) * amp * .55);
      c.lineTo(x1 + 16, wy + 3000); c.closePath();
      const g = c.createLinearGradient(0, wy + off - 6, 0, wy + off + 260);
      if (front) { g.addColorStop(0, wc[0] + 'd8'); g.addColorStop(.35, wc[1] + 'e6'); g.addColorStop(1, wc[2] + 'f8'); }
      else { g.addColorStop(0, wc[1]); g.addColorStop(1, wc[2]); }
      c.fillStyle = g; c.fill();
      if (front) {
        c.strokeStyle = th.foam; c.globalAlpha = .75; c.lineWidth = 2.2;
        c.beginPath();
        for (let x = x0; x <= x1 + 16; x += 14) { const y = wy + Math.sin(x * .025 + ph) * amp + Math.sin(x * .061 - ph * 1.3) * amp * .55; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke();
        c.globalAlpha = .25; c.strokeStyle = '#fff'; c.lineWidth = 1.2;
        for (let i = 0; i < 14; i++) {
          const x = x0 + ((i * 197 + X.t * 14 * (1 + (i % 3) * .4)) % (x1 - x0)), y = wy + 10 + (i * 37 % 60);
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18 + (i % 4) * 8, y); c.stroke();
        }
        c.globalAlpha = 1;
      }
    }

    function drawDeco(V) {
      const c = ctx, T = V.T, th = V.th, kind = th.deco, x0 = cam.x - X.W / 2 / cam.z - 40, x1 = cam.x + X.W / 2 / cam.z + 40;
      for (const d of X.deco) {
        if (d.dead || d.x < x0 || d.x > x1) continue;
        if (!T.solid(d.x, d.y + 1) || T.solid(d.x, d.y - 3)) { d.dead = true; if (!d.gone) { d.gone = 1; } continue; }
        c.save(); c.translate(d.x, d.y); c.rotate(d.rot); c.scale(d.s, d.s);
        const sw = Math.sin(X.t * 1.4 + d.x * .05) * (1 + Math.abs(V.wind) * 3) * .04;
        if (kind === 'trees') {
          if (d.big) {
            c.fillStyle = '#5a3b22'; c.beginPath(); c.moveTo(-3.6, 1); c.lineTo(-2.4, -26); c.lineTo(2.4, -26); c.lineTo(3.6, 1); c.closePath(); c.fill();
            c.save(); c.rotate(sw);
            const cols = d.v % 2 ? ['#2f7d3a', '#43a04a', '#6cc460'] : ['#3a8c3f', '#52b04f', '#86d86a'];
            for (const [ox, oy, r, ci] of [[-10, -32, 12, 0], [10, -33, 12, 0], [0, -40, 15, 1], [-6, -46, 11, 1], [7, -45, 10, 2], [0, -52, 9, 2]]) { c.fillStyle = cols[ci]; circ(c, ox, oy, r); c.fill(); }
            c.fillStyle = 'rgba(255,255,255,.14)'; circ(c, -4, -50, 6); c.fill();
            c.restore();
          } else if (d.v < 3) {
            c.save(); c.rotate(sw * 2); c.strokeStyle = d.c % 2 ? '#74d144' : '#5cb83a'; c.lineWidth = 1.6; c.lineCap = 'round';
            c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(k * 1.8, 0); c.quadraticCurveTo(k * 2.6, -4, k * 3.4 + sw * 20, -7 - Math.abs(k) * -1.2); } c.stroke(); c.restore();
          } else if (d.v === 3) {
            c.strokeStyle = '#4a9a30'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(sw * 20, -8); c.stroke();
            c.fillStyle = ['#ffe14a', '#ffffff', '#ff7aa8', '#9ad0ff'][d.c]; circ(c, sw * 20, -9, 2.6); c.fill(); c.fillStyle = '#e8a010'; circ(c, sw * 20, -9, 1); c.fill();
          } else if (d.v === 4) {
            c.fillStyle = '#f2ead6'; c.fillRect(-1.2, -5, 2.4, 5); c.fillStyle = d.c % 2 ? '#e0402e' : '#c9552a'; c.beginPath(); c.ellipse(0, -5, 5, 3.6, 0, PI, 0); c.fill();
            c.fillStyle = '#fff'; circ(c, -1.5, -6.4, .9); c.fill(); circ(c, 1.8, -5.6, .7); c.fill();
          } else { c.fillStyle = '#8b8b92'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-4, -5); c.lineTo(2, -6); c.lineTo(6, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-3, -5, 4, 1.4); }
        } else if (kind === 'dunes') {
          if (d.big) {
            c.fillStyle = '#4f8a3c'; rr(c, -3.4, -34, 6.8, 34, 3.4); c.fill(); rr(c, -11, -26, 4.4, 14, 2.2); c.fill(); rr(c, -11, -16, 9, 4.4, 2.2); c.fill(); rr(c, 6.6, -22, 4.4, 12, 2.2); c.fill(); rr(c, 1, -14, 9, 4.4, 2.2); c.fill();
            c.strokeStyle = 'rgba(0,50,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -32); c.lineTo(0, -2); c.stroke();
          } else if (d.v < 2) { c.strokeStyle = '#b38a45'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-1, -6, -4, -9); c.moveTo(1, 0); c.quadraticCurveTo(2, -8, 5, -10); c.stroke(); }
          else if (d.v === 2) { c.fillStyle = '#d8ccb4'; c.beginPath(); c.arc(0, -3, 3, 0, TAU); c.fill(); c.fillRect(-4, -1, 8, 2); }
          else { c.fillStyle = '#b39a74'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-3, -5); c.lineTo(3, -5); c.lineTo(6, 0); c.closePath(); c.fill(); }
        } else if (kind === 'ice') {
          if (d.big) {
            c.fillStyle = '#5b4631'; c.fillRect(-2, -8, 4, 8);
            for (let k = 0; k < 4; k++) { const w2 = 13 - k * 2.6, y2 = -8 - k * 9; c.fillStyle = '#2f6d63'; c.beginPath(); c.moveTo(-w2, y2); c.lineTo(0, y2 - 14); c.lineTo(w2, y2); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-w2 * .6, y2 - 4); c.lineTo(0, y2 - 14); c.lineTo(w2 * .6, y2 - 4); c.lineTo(w2 * .3, y2 - 6); c.lineTo(0, y2 - 4); c.lineTo(-w2 * .3, y2 - 6); c.closePath(); c.fill(); }
          } else if (d.v < 3) { c.fillStyle = 'rgba(200,235,255,.9)'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-1, -7 - d.c * 2); c.lineTo(1, 0); c.moveTo(1, 0); c.lineTo(3, -5); c.lineTo(5, 0); c.fill(); }
          else { c.fillStyle = '#e8f3fb'; c.beginPath(); c.ellipse(0, 0, 6, 3.4, 0, PI, 0); c.fill(); c.strokeStyle = 'rgba(120,160,200,.6)'; c.lineWidth = 1; c.stroke(); }
        } else if (kind === 'volcano') {
          if (d.big) {
            c.fillStyle = '#2b1216'; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-3, -22); c.lineTo(2, -14); c.lineTo(6, -26); c.lineTo(9, 0); c.closePath(); c.fill();
            c.strokeStyle = '#ff9a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-2, -4); c.lineTo(1, -10); c.lineTo(-1, -16); c.stroke();
          } else if (d.v < 3) { const f = .6 + Math.sin(X.t * 8 + d.x) * .4; c.fillStyle = `rgba(255,${120 + 80 * f | 0},30,.9)`; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(0, -9 - f * 5, 3, 0); c.fill(); }
          else { c.fillStyle = '#4a2224'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-2, -5); c.lineTo(4, -4); c.lineTo(6, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,120,30,.6)'; c.fillRect(-1, -3, 2, 1.2); }
        } else {
          const cols = ['#ff5fa8', '#ffd24a', '#5fd0ff', '#9be35a'];
          if (d.big) {
            c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -28); c.stroke();
            const col = cols[d.c]; c.fillStyle = col; circ(c, 0, -34, 9); c.fill();
            c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -34, 5.5, 0, 4.6); c.stroke();
          } else if (d.v < 3) { c.fillStyle = cols[d.c]; c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-4, -8, 0, -9); c.quadraticCurveTo(4, -8, 4, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; circ(c, -1.4, -5.6, 1.2); c.fill(); }
          else { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -9); c.stroke(); c.strokeStyle = cols[d.c]; c.lineWidth = 2; c.beginPath(); c.moveTo(-1, -9); c.lineTo(1, -4); c.stroke(); circ(c, 0, -10, 3); c.fillStyle = cols[(d.c + 1) % 4]; c.fill(); }
        }
        c.restore();
      }
    }

    function drawWorm(V, w, dt) {
      const c = ctx, A = anim(w.i), tm = V.teams[w.tm], col = TEAMS[tm.col != null ? tm.col : w.tm];
      const act = V.cur === w && (V.phase === 'turn' || V.phase === 'act');
      const rope = w.rope, hang = rope && rope.st === 'hang';
      const walking = w.on && w.st === 1;
      A.blink -= dt; if (A.blink <= 0) { A.bl = .14; A.blink = 2 + Math.random() * 3.5; }
      A.bl = Math.max(0, A.bl - dt); A.talk = Math.max(0, A.talk - dt);
      if (walking) A.wp += dt * 13;
      if (w.on && !A.lastOn) A.land = .25;
      A.lastOn = w.on; A.land = Math.max(0, A.land - dt);
      if (!w.on && w.tumble) A.spin += dt * 9 * (w.vx >= 0 ? 1 : -1); else A.spin += (Math.round(A.spin / TAU) * TAU - A.spin) * Math.min(1, dt * 12);
      const cwk = V.cur;
      let lx, ly;
      if (act) { const a = aimVec(w); lx = a.x * w.dir; ly = a.y; }
      else if (cwk && !cwk.dead && cwk !== w) { const dx = cwk.x - w.x, dy = cwk.y - w.y, d = hyp(dx, dy) || 1; lx = dx / d * w.dir; ly = dy / d; }
      else { lx = 1; ly = 0; }
      A.lx += (lx - A.lx) * Math.min(1, dt * 8); A.ly += (ly - A.ly) * Math.min(1, dt * 8);
      const hurtN = w.hurtT > 0 ? 1 : 0;
      c.save();
      if (w.tpT > 0) c.globalAlpha = .3 + .7 * (1 - w.tpT / .7);
      c.translate(w.x, w.y);
      if (hang) {
        const ax = rope.pts[0] ? rope.pts[rope.pts.length - 1].x : w.x, ay = rope.pts[0] ? rope.pts[rope.pts.length - 1].y : w.y - 40;
        c.translate(0, -8); c.rotate(Math.atan2(ax - w.x, -(ay - (w.y - 8))) * w.dir * 0 + Math.atan2(ax - w.x, -(ay - (w.y - 8)))); c.translate(0, 8);
      } else if (!w.on && (w.tumble || w.flipT > 0)) {
        c.translate(0, -9); c.rotate(w.flipT > 0 ? (1 - w.flipT / .8) * TAU * -w.dir : A.spin); c.translate(0, 9);
      } else if (!w.on) { c.translate(0, -9); c.rotate(clamp(w.vx / 900, -.3, .3)); c.translate(0, 9); }
      const S = .88;
      c.scale(w.dir * S, S);
      const wig = walking ? Math.sin(A.wp) : 0, br = Math.sin(A.ph + X.t * 2.3) * .45;
      const stretch = 1 + (!w.on ? clamp(-w.vy / 500, -.4, .5) * .16 : 0) - A.land * .5 - (hurtN ? .06 : 0);
      const bob = walking ? Math.abs(Math.sin(A.wp)) * 1.3 : 0;
      const pts = SPINE.map((p, k) => { const t = k / 4; return [p[0] + wig * (1 - t * .6) * 1.7 + (hang ? -wig * 0 : 0) + (act && w.recoil > 0 ? -w.recoil * 14 * t : 0), (p[1] * stretch) + (k > 0 ? -bob * t - br * t : 0), p[2] * (k === 4 ? 1 : 1 + A.land * .35 * (1 - t))]; });
      c.fillStyle = SKIN.out;
      for (let k = 0; k < 5; k++) { circ(c, pts[k][0], pts[k][1], pts[k][2] + 1.25); c.fill(); }
      circ(c, pts[0][0] - 2.6, pts[0][1] + 1.2, 2.5); c.fill();
      c.fillStyle = SKIN.base;
      for (let k = 0; k < 5; k++) { circ(c, pts[k][0], pts[k][1], pts[k][2]); c.fill(); }
      circ(c, pts[0][0] - 2.6, pts[0][1] + 1.2, 1.3); c.fill();
      c.fillStyle = SKIN.shade;
      for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(pts[k][0], pts[k][1], pts[k][2] * .96, 1.1, 2.5); c.arc(pts[k][0] - .3, pts[k][1] + 1.6, pts[k][2] * .96, 2.5, 1.1, true); c.fill(); }
      c.strokeStyle = SKIN.ring; c.lineWidth = .9;
      for (let k = 0; k < 4; k++) { const m = [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2]; c.beginPath(); c.arc(m[0], m[1], 5.6, -.3, 1.0); c.stroke(); }
      c.fillStyle = SKIN.hi;
      for (let k = 1; k < 5; k++) { c.globalAlpha *= .6; circ(c, pts[k][0] - pts[k][2] * .28, pts[k][1] - pts[k][2] * .3, pts[k][2] * .42); c.fill(); c.globalAlpha /= .6; }
      const hx = pts[4][0], hy = pts[4][1], hr = pts[4][2];
      c.strokeStyle = col.d; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.arc(hx, hy, hr - .2, -2.6, -.25); c.stroke();
      c.strokeStyle = col.c; c.lineWidth = 2.3;
      c.beginPath(); c.arc(hx, hy, hr - .2, -2.6, -.25); c.stroke();
      const fl = Math.sin(X.t * 9 + w.i) * 1.4;
      c.strokeStyle = col.c; c.lineWidth = 1.7;
      c.beginPath(); c.moveTo(hx - hr + .3, hy - 3.8); c.quadraticCurveTo(hx - hr - 3, hy - 3 + fl, hx - hr - 5.5, hy - 1.2 + fl * 1.4); c.moveTo(hx - hr + .5, hy - 4.2); c.quadraticCurveTo(hx - hr - 2.6, hy - 5.4 - fl, hx - hr - 5, hy - 6.4 - fl); c.stroke();
      c.lineCap = 'butt';
      const ey = hy - 1, closed = A.bl > 0 || hurtN;
      const eyes = [[hx + 1.3, ey], [hx + 5.1, ey + .2]];
      for (const [ex, eyy] of eyes) {
        if (closed && hurtN) {
          c.strokeStyle = '#2a1420'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(ex - 1.6, eyy - 1.6); c.lineTo(ex + 1.6, eyy + 1.6); c.moveTo(ex + 1.6, eyy - 1.6); c.lineTo(ex - 1.6, eyy + 1.6); c.stroke();
        } else {
          c.fillStyle = '#fff'; c.strokeStyle = '#2a1420'; c.lineWidth = .9;
          c.beginPath(); c.ellipse(ex, eyy, 2.2, closed ? .5 : 3, 0, 0, TAU); c.fill(); c.stroke();
          if (!closed) { c.fillStyle = '#17080e'; circ(c, ex + A.lx * 1, eyy + A.ly * 1.5, 1.2); c.fill(); c.fillStyle = '#fff'; circ(c, ex + A.lx * 1 - .35, eyy + A.ly * 1.5 - .45, .38); c.fill(); }
        }
      }
      c.strokeStyle = '#2a1420'; c.lineWidth = 1; c.lineCap = 'round';
      const mood = hurtN ? 2 : act && (w.charging || w.pow > 0) ? 1 : 0;
      for (let k = 0; k < 2; k++) {
        const ex = eyes[k][0];
        c.beginPath();
        if (mood === 1) { c.moveTo(ex - 2.4 + k * .8, ey - 5.2 + (k ? 0 : 1.4)); c.lineTo(ex + 2.4 - (k ? 0 : .8), ey - 5.2 + (k ? 1.4 : 0)); }
        else if (mood === 2) { c.moveTo(ex - 2.2, ey - 4.2 + (k ? 1.4 : 0)); c.lineTo(ex + 2.2, ey - 5.2 + (k ? 0 : 1.4)); }
        else { c.moveTo(ex - 2.2, ey - 4.7); c.quadraticCurveTo(ex, ey - 5.8, ex + 2.2, ey - 4.7); }
        c.stroke();
      }
      const mx = hx + 3.4, my = hy + 4.1;
      if (hurtN || A.talk > 0) {
        const o = hurtN ? 1.9 : 1 + Math.abs(Math.sin(X.t * 22)) * 1.3;
        c.fillStyle = '#6a1424'; c.beginPath(); c.ellipse(mx, my, 2, o, 0, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = '#ff8aa0'; c.beginPath(); c.ellipse(mx, my + o * .5, 1.2, o * .45, 0, 0, TAU); c.fill();
      } else if (mood === 1) { c.beginPath(); c.moveTo(mx - 2.2, my + .6); c.lineTo(mx + 2.2, my + .2); c.stroke(); }
      else { c.beginPath(); c.arc(mx, my - .8, 2.2, .25, PI - .25); c.stroke(); }
      c.lineCap = 'butt';
      if (act && !hang) {
        const id = w.wep, W = WEPS[id];
        c.save();
        c.translate(hx - 1.5 + 3, hy + 9);
        let ang = W.aim ? -w.aim : -.2;
        let off = 0, sc = 1;
        if (id === 'punch' && w.punchT > 0) { off = Math.sin((1 - w.punchT / .6) * PI) * 12; }
        if (id === 'bat') { ang = w.batT > 0 ? -w.aim + (w.batT / .45 - .5) * 3.4 : -w.aim - .6; }
        if (id === 'teleport' || id === 'girder' || id === 'airstrike') { ang = -.5; sc = .75; }
        c.rotate(ang);
        c.translate(5 - w.recoil * 14 + off, 0);
        c.scale(sc, sc);
        const hold = ICON[id];
        if (hold) hold(c, { t: X.t });
        c.restore();
      }
      c.restore();
      if (hang || (rope && rope.st === 'fly')) drawRope(V, w);
    }

    function drawRope(V, w) {
      const c = ctx, R = w.rope;
      const hx = w.x + w.dir * 1, hy = w.y - 11;
      c.save();
      c.lineCap = 'round'; c.lineJoin = 'round';
      const path = [[hx, hy]];
      if (R.st === 'hang') for (let i = R.pts.length - 1; i >= 0; i--) path.push([R.pts[i].x, R.pts[i].y]);
      else path.push([R.hx, R.hy]);
      c.strokeStyle = '#3d2b17'; c.lineWidth = 3.4; c.beginPath(); path.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      c.strokeStyle = '#c9a463'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = '#7a5a2a'; c.lineWidth = 1; c.setLineDash([2, 3]); c.stroke(); c.setLineDash([]);
      const e = path[path.length - 1];
      c.fillStyle = '#c4c9cf'; c.strokeStyle = '#444'; c.lineWidth = 1;
      circ(c, e[0], e[1], 3); c.fill(); c.stroke();
      c.restore();
    }

    function drawProj(V, p) {
      const c = ctx;
      c.save(); c.translate(p.x, p.y);
      switch (p.k) {
        case 'rocket': c.rotate(p.a); c.scale(1.15, 1.15); drawRocket(c, X.t); break;
        case 'air': c.rotate(p.a); c.scale(.9, .9); drawRocket(c, X.t); break;
        case 'plane': c.scale(p.vx >= 0 ? 1 : -1, 1); c.scale(.9, .9); drawPlane(c, X.t); break;
        case 'sheep': c.scale(p.dir || 1, 1); c.scale(1.15, 1.15); c.translate(0, -7); ICON.sheep(c, { t: X.t }); break;
        case 'dyn': c.rotate(p.vx * .002); c.scale(.95, .95); c.translate(0, -3); ICON.dynamite(c, { t: X.t }); break;
        case 'nade': c.rotate(p.spin = (p.spin || 0) + p.vx * .0012); ICON.grenade(c); break;
        case 'clus': c.rotate(p.spin = (p.spin || 0) + p.vx * .0012); ICON.cluster(c); break;
        case 'bana': c.rotate(p.spin = (p.spin || 0) + p.vx * .002 + .06); ICON.banana(c, { t: X.t }); break;
        case 'holy': c.rotate(p.spin = (p.spin || 0) + p.vx * .0008); c.scale(1.25, 1.25); ICON.holy(c, { t: X.t }); break;
        case 'cl': c.rotate((p.spin = (p.spin || 0) + .3)); c.scale(.5, .5); ICON.cluster(c); break;
        case 'bn': c.rotate((p.spin = (p.spin || 0) + .25)); c.scale(.55, .55); ICON.banana(c, { t: X.t }); break;
      }
      c.restore();
      if (p.fuse != null && p.fuse >= 0 && (p.k === 'nade' || p.k === 'clus' || p.k === 'bana' || p.k === 'holy' || p.k === 'dyn')) {
        c.save(); c.font = 'bold 12px ' + FONT; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.65)'; c.fillStyle = '#fff';
        const s = String(Math.max(1, Math.ceil(p.fuse))); c.strokeText(s, p.x, p.y - 15); c.fillText(s, p.x, p.y - 15); c.restore();
      }
    }

    function trailTick(V, dt) {
      for (const p of V.projs) {
        if (p.k === 'rocket' || p.k === 'air') {
          if (Math.random() < .9) pf({ k: 'smoke', x: p.x - Math.cos(p.a) * 8, y: p.y - Math.sin(p.a) * 8, vx: (Math.random() - .5) * 20, vy: (Math.random() - .5) * 20, life: .55, max: .55, s: 3.5 + Math.random() * 2, dr: 1.2, wd: 1 });
          pf({ k: 'fire', x: p.x - Math.cos(p.a) * 10, y: p.y - Math.sin(p.a) * 10, vx: 0, vy: 0, life: .14, max: .14, s: 4, add: 1 });
        } else if (p.k === 'holy' && Math.random() < .5) pf({ k: 'spark', x: p.x + (Math.random() - .5) * 8, y: p.y + (Math.random() - .5) * 8, vx: (Math.random() - .5) * 30, vy: -20 - Math.random() * 30, life: .5, max: .5, s: 1.6, add: 1, col: '#fff3a0' });
        else if (p.k === 'dyn' && Math.random() < .6) pf({ k: 'spark', x: p.x + 7, y: p.y - 8, vx: (Math.random() - .5) * 50, vy: -30 - Math.random() * 40, life: .3, max: .3, s: 1.4, add: 1 });
        else if (p.k === 'plane' && Math.random() < .6) pf({ k: 'smoke', x: p.x - Math.sign(p.vx) * 40, y: p.y, vx: 0, vy: 0, life: .7, max: .7, s: 4, dr: 1 });
      }
    }

    function drawParts(V) {
      const c = ctx, th = V.th;
      for (const p of X.parts) {
        const a = clamp(p.life / p.max, 0, 1);
        switch (p.k) {
          case 'flash': { const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(.5, `rgba(255,190,80,${a * .6})`); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.globalCompositeOperation = 'lighter'; circ(c, p.x, p.y, p.s); c.fill(); c.globalCompositeOperation = 'source-over'; break; }
          case 'ring': { const r = p.s * (1 - a * a); c.strokeStyle = `rgba(255,240,200,${a * .8})`; c.lineWidth = 3 + a * 4; circ(c, p.x, p.y, r); c.stroke(); break; }
          case 'ripple': { const r = p.s * (1 - a); c.strokeStyle = `rgba(255,255,255,${a * .7})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(p.x, p.y, r, r * .22, 0, 0, TAU); c.stroke(); break; }
          case 'fire': { const s = p.s * (.5 + (1 - a) * .7); c.globalCompositeOperation = 'lighter'; c.fillStyle = a > .6 ? `rgba(255,${200 * a | 0},80,${a * .8})` : `rgba(255,${100 + 100 * a | 0},20,${a * .75})`; circ(c, p.x, p.y, s); c.fill(); c.globalCompositeOperation = 'source-over'; break; }
          case 'smoke': { const s = p.s * (1 + (1 - a) * 1.1); c.fillStyle = p.col ? p.col.replace('rgb(', 'rgba(').replace(')', `,${a * .6})`) : `rgba(${th.night ? 70 : 120},${th.night ? 60 : 118},${th.night ? 66 : 124},${a * .5})`; circ(c, p.x, p.y, s); c.fill(); break; }
          case 'deb': c.save(); c.translate(p.x, p.y); c.rotate(p.rot || 0); c.fillStyle = p.col; c.fillRect(-p.s, -p.s * .7, p.s * 2, p.s * 1.4); c.restore(); break;
          case 'spark': c.globalCompositeOperation = p.add ? 'lighter' : 'source-over'; c.fillStyle = p.col || `rgba(255,${200 * a | 0},80,${a})`; circ(c, p.x, p.y, p.s * (.6 + a * .6)); c.fill(); c.globalCompositeOperation = 'source-over'; break;
          case 'drop': c.fillStyle = `rgba(${hex(th.water[0]).join(',')},.85)`; circ(c, p.x, p.y, p.s); c.fill(); break;
          case 'line': c.strokeStyle = `rgba(255,236,150,${a})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x2, p.y2); c.stroke(); break;
          case 'ghost': {
            c.save(); c.globalAlpha = a * .8; c.translate(p.x + Math.sin(X.t * 5) * 3, p.y); c.fillStyle = '#f4f7ff'; c.beginPath(); c.arc(0, 0, 8, PI, 0); c.lineTo(8, 12); for (let i = 0; i < 4; i++) c.quadraticCurveTo(6 - i * 4, 8, 4 - i * 4, 12); c.closePath(); c.fill(); c.fillStyle = '#223'; circ(c, -3, -1, 1.6); c.fill(); circ(c, 3, -1, 1.6); c.fill(); c.beginPath(); c.ellipse(0, 4, 1.6, 2.2, 0, 0, TAU); c.fill(); c.restore(); break;
          }
        }
      }
    }

    function drawPops(V) {
      const c = ctx;
      for (const p of X.pops) {
        const a = clamp(1.8 - p.t / p.max * 1.8, 0, 1), k = p.pow ? 1 + Math.sin(clamp(p.t / .3, 0, 1) * PI) * .35 : 1;
        c.save(); c.translate(p.x, p.y); c.rotate(p.pow ? -.12 : 0); c.scale(k, k);
        c.globalAlpha = a; c.font = `900 ${p.size}px ${FONT}`; c.textAlign = 'center'; c.lineJoin = 'round';
        c.lineWidth = p.pow ? 4.5 : 3.4; c.strokeStyle = p.pow ? '#a8200f' : 'rgba(30,10,10,.8)'; c.strokeText(p.txt, 0, 0); c.fillStyle = p.col; c.fillText(p.txt, 0, 0);
        c.restore();
      }
    }

    function drawAim(V) {
      const w = V.cur;
      if (!w || w.dead || (V.phase !== 'turn' || w.lock > 0) || !V.mine) return;
      const W = WEPS[w.wep], c = ctx;
      if (W.aim && !(w.rope && w.rope.st === 'hang' && w.wep !== 'rope')) {
        const a = aimVec(w), cx = w.x + a.x * 62, cy = w.y - 9 + a.y * 62;
        c.save();
        c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.8;
        circ(c, cx, cy, 6); c.stroke();
        c.beginPath(); c.moveTo(cx - 11, cy); c.lineTo(cx - 3, cy); c.moveTo(cx + 3, cy); c.lineTo(cx + 11, cy); c.moveTo(cx, cy - 11); c.lineTo(cx, cy - 3); c.moveTo(cx, cy + 3); c.lineTo(cx, cy + 11); c.stroke();
        c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = .8; circ(c, cx, cy, 7.3); c.stroke();
        if (W.charge && w.pow > 0) {
          const n = 12;
          for (let i = 0; i < n; i++) {
            const f = i / (n - 1);
            if (f > w.pow + .04) break;
            const d = 18 + f * 76, x = w.x + a.x * d, y = w.y - 9 + a.y * d;
            c.fillStyle = `hsl(${60 - f * 60},95%,${58 - f * 6}%)`; circ(c, x, y, 2 + f * 2.4); c.fill();
            c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .8; c.stroke();
          }
        }
        c.restore();
      }
    }

    function drawTargetPreview(V) {
      const w = V.cur;
      if (!w || w.dead || V.phase !== 'turn' || !V.mine || !X.cursorWorld) return;
      const W = WEPS[w.wep], c = ctx, m = X.cursorWorld;
      if (!W.target) return;
      c.save(); c.translate(m.x, m.y);
      if (w.wep === 'girder' && X.girder) {
        const ang = GIRDER_ANG[X.girder.a] * PI / 180, len = GIRDER_LEN[X.girder.l];
        c.rotate(ang); c.globalAlpha = .62;
        c.fillStyle = '#e07a2a'; c.fillRect(-len / 2, -5, len, 10); c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.strokeRect(-len / 2, -5, len, 10);
      } else if (w.wep === 'teleport') {
        c.strokeStyle = 'rgba(190,150,255,.95)'; c.lineWidth = 2; circ(c, 0, -8, 11); c.stroke(); c.beginPath(); c.moveTo(-14, -8); c.lineTo(14, -8); c.moveTo(0, -22); c.lineTo(0, 6); c.stroke();
      } else {
        c.strokeStyle = 'rgba(255,90,70,.95)'; c.lineWidth = 2; circ(c, 0, 0, 10); c.stroke(); circ(c, 0, 0, 3); c.stroke();
        c.beginPath(); c.moveTo(-17, 0); c.lineTo(-6, 0); c.moveTo(17, 0); c.lineTo(6, 0); c.moveTo(0, -17); c.lineTo(0, -6); c.moveTo(0, 17); c.lineTo(0, 6); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([3, 5]); c.beginPath(); c.moveTo(-92, 0); c.lineTo(92, 0); c.stroke(); c.setLineDash([]);
      }
      c.restore();
    }

    function drawMarks(V) {
      const c = ctx;
      for (const m of X.marks) {
        const a = clamp(m.t, 0, 1), b = Math.sin(X.t * 8) * 5;
        c.save(); c.translate(m.x, m.y - 30 + b); c.globalAlpha = a;
        c.fillStyle = '#ff3b2f'; c.strokeStyle = '#fff'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 24); c.lineTo(-11, 4); c.lineTo(-4, 4); c.lineTo(-4, -16); c.lineTo(4, -16); c.lineTo(4, 4); c.lineTo(11, 4); c.closePath(); c.stroke(); c.fill();
        c.restore();
      }
    }

    function labelPass(V, dt) {
      const c = ctx, z = cam.z, W = X.W, H = X.H;
      c.save();
      c.setTransform(X.dpr, 0, 0, X.dpr, 0, 0);
      c.textAlign = 'center'; c.lineJoin = 'round';
      const small = W < 560;
      for (const w of V.worms) {
        if (w.dead) continue;
        const A = anim(w.i);
        if (A.hp < 0) A.hp = w.hp;
        A.hp += (w.hp - A.hp) * Math.min(1, dt * 4);
        const sx = (w.x - cam.x) * z + W / 2, sy = (w.y - 31 - (w.rope && w.rope.st === 'hang' ? 6 : 0) - cam.y) * z + H / 2;
        if (sx < -80 || sx > W + 80 || sy < -60 || sy > H + 60) continue;
        const tm = V.teams[w.tm], col = TEAMS[tm.col != null ? tm.col : w.tm];
        const act = V.cur === w && (V.phase === 'turn' || V.phase === 'act');
        const fs = small ? 9 : 11, nm = w.name;
        c.font = `800 ${fs}px ${FONT}`;
        const tw = c.measureText(nm).width + 10;
        const ph = fs + 5;
        c.globalAlpha = act ? 1 : .92;
        c.fillStyle = col.d; rr(c, sx - tw / 2, sy - ph - 14, tw, ph, ph / 2); c.fill();
        c.fillStyle = col.c; rr(c, sx - tw / 2 + 1, sy - ph - 13, tw - 2, ph - 2, (ph - 2) / 2); c.fill();
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(sx - tw / 2 + 4, sy - 14 - ph / 2, tw - 8, 0);
        c.lineWidth = 2.5; c.strokeStyle = 'rgba(0,0,0,.45)'; c.strokeText(nm, sx, sy - 14 - 4); c.fillStyle = '#fff'; c.fillText(nm, sx, sy - 14 - 4);
        const hs = String(Math.max(0, Math.ceil(A.hp)));
        c.font = `900 ${fs}px ${FONT}`;
        const hw = c.measureText(hs).width + 10;
        c.fillStyle = 'rgba(15,18,30,.82)'; rr(c, sx - hw / 2, sy - 13, hw, fs + 3, (fs + 3) / 2); c.fill();
        c.fillStyle = A.hp < 25 ? '#ff7a6a' : '#fff'; c.fillText(hs, sx, sy - 13 + fs);
        c.globalAlpha = 1;
        if (act && V.phase === 'turn') {
          const bob = Math.sin(X.t * 6) * 3;
          c.fillStyle = col.c; c.strokeStyle = '#fff'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(sx, sy - ph - 22 + bob + 12); c.lineTo(sx - 8, sy - ph - 22 + bob); c.lineTo(sx + 8, sy - ph - 22 + bob); c.closePath(); c.stroke(); c.fill();
        }
      }
      c.restore();
    }

    function txt(s, x, y, size, fill, align, weight) {
      const c = ctx;
      c.font = `${weight || 900} ${size}px ${FONT}`; c.textAlign = align || 'left'; c.lineJoin = 'round';
      c.lineWidth = Math.max(2.5, size / 5); c.strokeStyle = 'rgba(8,12,24,.72)'; c.strokeText(s, x, y);
      c.fillStyle = fill; c.fillText(s, x, y);
    }

    function drawHud(V, dt) {
      const c = ctx, W = X.W, H = X.H, small = W < 620;
      c.save(); c.setTransform(X.dpr, 0, 0, X.dpr, 0, 0);
      const cur = V.cur, tm = cur ? V.teams[cur.tm] : null, col = tm ? TEAMS[tm.col != null ? tm.col : cur.tm] : TEAMS[0];
      const m = small ? 8 : 14, rad = small ? 21 : 27;
      if (V.phase === 'turn' || V.phase === 'act' || V.phase === 'settle' || V.phase === 'resolve') {
        const act = V.phase === 'act', tl = act ? V.rtl : V.tl, show = V.phase === 'turn' || act;
        const cx = m + rad, cy = m + rad;
        const fr = show ? clamp(tl / (act ? V.cfg.rt : V.cfg.tt), 0, 1) : 0, low = show && tl <= 5 && !act;
        c.fillStyle = 'rgba(10,14,28,.78)'; circ(c, cx, cy, rad + 3); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 5; circ(c, cx, cy, rad - 2); c.stroke();
        c.strokeStyle = act ? '#ffb347' : low ? '#ff5a4a' : col.l; c.lineWidth = 5; c.lineCap = 'round';
        if (fr > 0) { c.beginPath(); c.arc(cx, cy, rad - 2, -PI / 2, -PI / 2 + TAU * fr); c.stroke(); }
        c.lineCap = 'butt';
        const num = show ? String(Math.max(0, Math.ceil(tl))) : '…';
        const pulse = low ? 1 + (1 - (tl % 1)) * .18 : 1;
        c.save(); c.translate(cx, cy + (small ? 6 : 8)); c.scale(pulse, pulse);
        txt(num, 0, 0, small ? 20 : 26, low ? '#ff9a8a' : '#fff', 'center'); c.restore();
        if (act) txt('RETREAT', cx + rad + 8, cy + 5, 12, '#ffcf8a', 'left');
        if (show && !act && V.mine) { const n = Math.ceil(tl); if (low && n !== X.tickN) { X.tickN = n; audio.tick(); } }
      }
      const wy = m + 2, ww = small ? 86 : 124, wx = W - m - ww;
      c.fillStyle = 'rgba(10,14,28,.78)'; rr(c, wx - 6, wy - 2, ww + 12, small ? 22 : 26, 8); c.fill();
      c.fillStyle = 'rgba(255,255,255,.14)'; rr(c, wx, wy + 5, ww, small ? 9 : 11, 4); c.fill();
      const wv = V.wind, half = ww / 2;
      c.fillStyle = wv >= 0 ? '#7fd1ff' : '#ffc36e';
      const bw = Math.abs(wv) * half;
      if (bw > .5) {
        const x0 = wv >= 0 ? wx + half : wx + half - bw;
        c.save(); c.beginPath(); rr(c, wx, wy + 5, ww, small ? 9 : 11, 4); c.clip(); c.fillRect(x0, wy + 4, bw, 14);
        c.fillStyle = 'rgba(255,255,255,.55)';
        const dir = wv >= 0 ? 1 : -1;
        for (let i = 0; i < 10; i++) { const px = wx + half + dir * (((i * 9 + X.t * 40 * Math.abs(wv + .2)) % (half + 2))); if (Math.abs(px - (wx + half)) < bw) { c.beginPath(); c.moveTo(px, wy + 6); c.lineTo(px + dir * 5, wy + 10.5); c.lineTo(px, wy + 15); c.lineTo(px - dir * 1.5, wy + 10.5); c.closePath(); c.fill(); } }
        c.restore();
      }
      c.fillStyle = '#fff'; c.fillRect(wx + half - 1, wy + 3, 2, small ? 13 : 15);
      if (!small) txt('WIND', wx + ww / 2, wy + 36, 10, 'rgba(255,255,255,.85)', 'center', 800);
      const n = V.teams.length, rowH = small ? 15 : 18, bwid = small ? 84 : 150;
      let ty = small ? m + rad * 2 + 10 : H - m - n * rowH;
      for (let i = 0; i < n; i++) {
        const t = V.teams[i], cl = TEAMS[t.col != null ? t.col : i], alive = t.worms.filter(k => !V.worms[k].dead).length;
        t.shown += (t.hp - t.shown) * Math.min(1, dt * 3);
        const isCur = cur && cur.tm === i && V.phase !== 'over';
        const x = m, y = ty + i * rowH;
        c.globalAlpha = alive ? 1 : .5;
        c.fillStyle = 'rgba(10,14,28,.78)'; rr(c, x, y, bwid + (small ? 40 : 96), rowH - 2, 5); c.fill();
        if (isCur) { c.strokeStyle = cl.l; c.lineWidth = 1.6; rr(c, x, y, bwid + (small ? 40 : 96), rowH - 2, 5); c.stroke(); }
        c.fillStyle = cl.c; rr(c, x + 2, y + 2, small ? 6 : 8, rowH - 6, 3); c.fill();
        c.font = `800 ${small ? 9 : 11}px ${FONT}`; c.textAlign = 'left'; c.fillStyle = '#fff';
        const nm = (t.name.length > (small ? 8 : 14) ? t.name.slice(0, small ? 7 : 13) + '…' : t.name);
        if (!small) c.fillText(nm, x + 14, y + rowH - 6);
        const bx = x + (small ? 12 : 100), maxH = Math.max(1, t.max);
        c.fillStyle = 'rgba(255,255,255,.14)'; rr(c, bx, y + 4, bwid - (small ? 0 : 40), rowH - 10, 3); c.fill();
        c.fillStyle = cl.c; rr(c, bx, y + 4, Math.max(2, (bwid - (small ? 0 : 40)) * clamp(t.shown / maxH, 0, 1)), rowH - 10, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(bx + 2, y + 5, Math.max(0, (bwid - (small ? 0 : 40)) * clamp(t.shown / maxH, 0, 1) - 4), 1.2);
        c.font = `900 ${small ? 9 : 11}px ${FONT}`; c.fillStyle = '#fff'; c.textAlign = 'left';
        c.fillText(String(Math.max(0, Math.round(t.shown))), bx + bwid - (small ? 0 : 40) + 5, y + rowH - 6);
        c.globalAlpha = 1;
      }
      if (V.phase === 'turn' || V.phase === 'act') {
        const w = cur;
        if (w && !w.dead) {
          const W2 = WEPS[w.wep], am = V.teams[w.tm].ammo[w.wep], cw = small ? 150 : 210, cxx = W / 2 - cw / 2, cyy = H - (X.touch ? 140 : 52) - (small ? 0 : 0);
          if (!X.touch || !small) {
            c.fillStyle = 'rgba(10,14,28,.78)'; rr(c, cxx, cyy, cw, 38, 10); c.fill();
            c.save(); c.translate(cxx + 24, cyy + 19); c.scale(.8, .8); if (ICON[w.wep]) ICON[w.wep](c, { t: X.t }); c.restore();
            txt(W2.n, cxx + 46, cyy + 17, 13, '#fff', 'left', 800);
            const info = [(am < 0 ? '∞' : '×' + am)];
            if (w.wep === 'grenade' || w.wep === 'cluster' || w.wep === 'banana') info.push('Fuse ' + w.fz + 's', BOUNCE_N[w.bn]);
            c.font = `700 11px ${FONT}`; c.fillStyle = 'rgba(255,255,255,.75)'; c.textAlign = 'left'; c.fillText(info.join(' · '), cxx + 46, cyy + 32);
          }
          if (w.charging && w.pow > 0) {
            const pw = small ? 140 : 190, px = W / 2 - pw / 2, py = cyy - 18;
            c.fillStyle = 'rgba(10,14,28,.8)'; rr(c, px - 4, py - 4, pw + 8, 16, 8); c.fill();
            const g = c.createLinearGradient(px, 0, px + pw, 0); g.addColorStop(0, '#ffe14a'); g.addColorStop(.6, '#ff9a2a'); g.addColorStop(1, '#ff3b2f');
            c.fillStyle = g; rr(c, px, py, Math.max(6, pw * w.pow), 8, 4); c.fill();
          }
          if (V.mine && V.phase === 'turn' && W2.target) txt(w.wep === 'girder' ? 'Click to place · R rotate · T length' : 'Click a target', W / 2, cyy - 24, 13, '#fff', 'center', 800);
        }
      }
      if (!small && X.showMap && V.T) {
        const mw = 170, mh = Math.round(mw * WH / WW), mx = W - m - mw, my = H - m - mh;
        c.fillStyle = 'rgba(10,14,28,.7)'; rr(c, mx - 3, my - 3, mw + 6, mh + 6, 7); c.fill();
        c.save(); rr(c, mx, my, mw, mh, 5); c.clip();
        const sg = c.createLinearGradient(0, my, 0, my + mh); sg.addColorStop(0, rgb(V.th.sky[0])); sg.addColorStop(1, rgb(V.th.sky[2])); c.fillStyle = sg; c.fillRect(mx, my, mw, mh);
        c.drawImage(V.T.cv, 0, 0, WW, WH, mx, my, mw, mh);
        c.fillStyle = V.th.water[1]; c.globalAlpha = .8; c.fillRect(mx, my + V.waterY / WH * mh, mw, mh); c.globalAlpha = 1;
        for (const w of V.worms) { if (w.dead) continue; c.fillStyle = TEAMS[V.teams[w.tm].col != null ? V.teams[w.tm].col : w.tm].c; circ(c, mx + w.x / WW * mw, my + w.y / WH * mh, V.cur === w ? 3.2 : 2.2); c.fill(); }
        for (const cr of V.crates) { c.fillStyle = '#ffe14a'; c.fillRect(mx + cr.x / WW * mw - 1.5, my + cr.y / WH * mh - 1.5, 3, 3); }
        const vw = X.W / cam.z, vh = X.H / cam.z;
        c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1; c.strokeRect(mx + (cam.x - vw / 2) / WW * mw, my + (cam.y - vh / 2) / WH * mh, vw / WW * mw, vh / WH * mh);
        c.restore();
      }
      const fy = small ? m + rad * 2 + 10 + n * rowH + 6 : m + rad * 2 + 12;
      c.globalAlpha = 1;
      X.feed.forEach((f, i) => { const a = clamp(f.max - f.t, 0, 1); c.globalAlpha = a; txt(f.txt, m, fy + i * 15, small ? 10 : 12, f.col, 'left', 800); });
      c.globalAlpha = 1;
      for (const b of X.banners) {
        const k = clamp(b.t / .25, 0, 1), a = clamp((b.max - b.t) / .5, 0, 1), s = (small ? .7 : 1) * (.7 + .3 * Math.sin(k * PI / 2));
        c.save(); c.globalAlpha = a; c.translate(W / 2, H * .23); c.scale(s, s);
        txt(b.txt, 0, 0, 42, b.col, 'center', 900);
        if (b.sub) txt(b.sub, 0, 30, 20, '#fff', 'center', 800);
        c.restore();
      }
      if (X.flash > 0) { c.fillStyle = `rgba(255,255,255,${X.flash * .7})`; c.fillRect(0, 0, W, H); }
      c.restore();
    }

    function draw(V, dt) {
      resize();
      X.t += dt;
      const c = ctx, W = X.W, H = X.H;
      if (V.T) V.T.flush();
      camUpdate(V, dt);
      updateParts(V, dt);
      trailTick(V, dt);
      c.setTransform(X.dpr, 0, 0, X.dpr, 0, 0);
      drawBackdrop(V);
      drawAmbient(V, dt);
      const z = cam.z, sh = X.shake, ox = (Math.random() - .5) * sh * 9, oy = (Math.random() - .5) * sh * 9;
      c.setTransform(X.dpr * z, 0, 0, X.dpr * z, X.dpr * (W / 2 - cam.x * z + ox), X.dpr * (H / 2 - cam.y * z + oy));
      c.imageSmoothingEnabled = true;
      drawWater(V, false);
      const x0 = Math.max(0, cam.x - W / 2 / z - 2), x1 = Math.min(WW, cam.x + W / 2 / z + 2), y0 = Math.max(0, cam.y - H / 2 / z - 2), y1 = Math.min(WH, cam.y + H / 2 / z + 2);
      if (x1 > x0 && y1 > y0) c.drawImage(V.T.cv, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
      drawDeco(V);
      for (const g of V.graves) drawGrave(c, g, V.th, X.t);
      for (const cr of V.crates) drawCrate(c, cr, V.th, X.t);
      drawMarks(V);
      for (const w of V.worms) if (!w.dead && w !== V.cur) drawWorm(V, w, dt);
      if (V.cur && !V.cur.dead) drawWorm(V, V.cur, dt);
      for (const p of V.projs) drawProj(V, p);
      drawAim(V);
      drawParts(V);
      drawWater(V, true);
      drawTargetPreview(V);
      drawPops(V);
      labelPass(V, dt);
      if (!X.noHud) drawHud(V, dt);
    }

    return { X, ctx, resize, draw, event, setup, toWorld, panBy, zoomBy, focusAt, banner, feed, pop, anim, recenter() { X.free = 0; X.focus = null; } };
  }

  const SK = 'gameplay:wormssave';
  const DEF = { opp: 1, wpt: 4, lvl: 1, theme: -1, tt: 45, hp: 100, wind: 1, sd: 8, crates: 2, arsenal: 'std' };
  const OPTS = [
    ['opp', 'Opponents', [1, 2, 3], ['1', '2', '3']],
    ['wpt', 'Worms per team', [2, 3, 4], ['2', '3', '4']],
    ['lvl', 'Bot skill', [0, 1, 2, 3], LEVELS],
    ['theme', 'Terrain', [-1, 0, 1, 2, 3, 4], ['Random'].concat(THEMES.map(t => t.name))],
    ['tt', 'Turn time', [20, 30, 45, 60], ['20s', '30s', '45s', '60s']],
    ['hp', 'Worm health', [50, 100, 150, 200], ['50', '100', '150', '200']],
    ['wind', 'Wind', [0, 1], ['Off', 'On']],
    ['sd', 'Sudden death', [0, 5, 8, 12], ['Off', 'Round 5', 'Round 8', 'Round 12']],
    ['crates', 'Crates', [0, 1, 2, 3], ['None', 'Few', 'Some', 'Many']],
    ['arsenal', 'Arsenal', ['std', 'plenty'], ['Standard', 'Plenty']]
  ];
  const fmtWins = v => v + (v === 1 ? ' win' : ' wins');
  const HELP = `<h2>How to play</h2><ul class="wk-hl">
<li><b>Move</b> Arrows or A / D. <b>Aim</b> Up / Down (hold Shift for fine aim)</li>
<li><b>Fire</b> hold Space to charge, release to shoot. Click-weapons: click the map, or press Space on the marker</li>
<li><b>Jump</b> Enter. <b>Backflip</b> Backspace</li>
<li><b>Weapons</b> Tab, Q or right panel button. <b>Fuse</b> 1 to 5. <b>Bounce</b> B</li>
<li><b>Ninja Rope</b> fire to shoot a hook, left / right to swing, up / down to climb, Enter to let go</li>
<li><b>Sheep</b> press Space again to blow it up. <b>Girder</b> R rotates, T changes length</li>
<li><b>Camera</b> drag or right-drag to pan, wheel or +/- to zoom, C to follow your worm</li>
<li>After you fire you get a few seconds to retreat. Drown the other teams, use the wind, grab the crates</li>
<li>Phone: left pad moves, middle pad aims, right buttons jump / flip / fire. Tap the map to place a target, then press Fire</li></ul>`;

  const CSS = (id) => `
.gm-${id}{display:flex;justify-content:center;align-items:center;background:#0b1224;color:#fff;font-family:${FONT};-webkit-user-select:none;user-select:none;touch-action:none}
.gm-${id} .wk-wrap{position:relative;width:min(100%,1000px,calc((100dvh - var(--goff,250px))*1.6));aspect-ratio:16/10;overflow:hidden;background:#000;margin:0 auto;min-height:260px}
@media (max-aspect-ratio:1/1) and (max-width:700px){.gm-${id} .wk-wrap{width:min(100%,calc((100dvh - var(--goff,250px))*.8));aspect-ratio:4/5;min-height:300px}}
.gm-${id} .wk-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.gm-${id} button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gm-${id} .wk-tb{position:absolute;right:8px;top:46px;display:flex;flex-direction:column;gap:5px;z-index:3}
.gm-${id} .wk-tb button{min-width:34px;height:30px;padding:0 8px;border-radius:9px;border:1.5px solid rgba(255,255,255,.35);background:rgba(10,14,28,.78);color:#fff;font-weight:800;font-size:12px}
.gm-${id} .wk-tb button:hover{background:rgba(60,80,140,.9)}
.gm-${id} .wk-tc{position:absolute;left:0;right:0;bottom:0;padding:0 10px 10px;display:flex;justify-content:space-between;align-items:flex-end;pointer-events:none;z-index:3}
.gm-${id} .wk-tg{display:flex;gap:8px;align-items:flex-end}
.gm-${id} .wk-tc button{pointer-events:auto;width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(10,14,28,.62);color:#fff;font-size:20px;font-weight:900;touch-action:none}
.gm-${id} .wk-tc button:active,.gm-${id} .wk-tc button.dn{background:rgba(255,160,60,.85)}
.gm-${id} .wk-tc .sm{width:50px;height:50px;font-size:12px}
.gm-${id} .wk-tc .fire{width:76px;height:76px;background:rgba(220,60,40,.78);font-size:15px}
.gm-${id} .wk-tgm{flex-direction:column;gap:6px}
@media(max-width:480px){.gm-${id} .wk-wp{width:calc(100% - 16px)}.gm-${id} .wk-wg{grid-template-columns:repeat(4,minmax(0,1fr))}.gm-${id} .wk-wg .wk-w{width:auto;height:54px}.gm-${id} .wk-wg .wk-w img{width:44px}.gm-${id} .wk-tc{padding:0 6px 8px}.gm-${id} .wk-tg{gap:5px}.gm-${id} .wk-tc button{width:46px;height:46px}.gm-${id} .wk-tc .sm{width:40px;height:40px;font-size:11px}.gm-${id} .wk-tc .fire{width:62px;height:62px}}
.gm-${id} .wk-pn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,10,24,.5);padding:10px;overflow:auto;z-index:5}
.gm-${id} .wk-card{background:linear-gradient(#2a3a68,#182244);border:2px solid #5a70b0;border-radius:16px;padding:14px 18px;width:min(100%,600px);max-height:100%;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.5);text-align:center}
.gm-${id} .wk-card h1{margin:0;font-size:clamp(34px,8vw,58px);letter-spacing:3px;color:#ffd0dc;text-shadow:0 3px 0 #b8486a,0 6px 0 #6a2434,0 10px 18px rgba(0,0,0,.5);-webkit-text-stroke:2px #6a2434;paint-order:stroke fill}
.gm-${id} .wk-card h2{margin:2px 0 8px}
.gm-${id} .wk-sub{margin:2px 0 10px;color:#bcd0ff;font-size:13px}
.gm-${id} .wk-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0}
.gm-${id} .wk-b{padding:9px 18px;border-radius:12px;border:2px solid #fff;background:linear-gradient(#5b8cff,#3558c9);color:#fff;font-weight:900;font-size:15px;box-shadow:0 3px 0 #1f3380}
.gm-${id} .wk-b.go{background:linear-gradient(#5ee06c,#2fa646);box-shadow:0 3px 0 #1b6a2b}
.gm-${id} .wk-b.alt{background:linear-gradient(#6a7699,#454f70);box-shadow:0 3px 0 #2b3350}
.gm-${id} .wk-b.red{background:linear-gradient(#ff7a6a,#d03a2a);box-shadow:0 3px 0 #7f1f15}
.gm-${id} .wk-b:active{transform:translateY(2px);box-shadow:0 1px 0 #1f3380}
.gm-${id} .wk-set{text-align:left;margin-top:6px;border-top:1px solid rgba(255,255,255,.15);padding-top:6px}
.gm-${id} .wk-row{display:flex;align-items:center;gap:8px;margin:4px 0;flex-wrap:wrap}
.gm-${id} .wk-row>b{width:112px;font-size:12px;color:#cfdcff}
.gm-${id} .wk-seg{display:flex;gap:3px;flex-wrap:wrap}
.gm-${id} .wk-s{padding:4px 9px;border-radius:8px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:#fff;font-size:12px;font-weight:700}
.gm-${id} .wk-s.on{background:#ffb02e;color:#2a1800;border-color:#fff}
.gm-${id} .wk-hl{text-align:left;padding-left:18px;font-size:13px;line-height:1.5;margin:4px 0 10px}
.gm-${id} .wk-hl b{color:#ffd37a}
.gm-${id} .wk-note{font-size:12px;color:#bcd0ff;margin:6px 0}
.gm-${id} .wk-wp{max-height:calc(100% - 120px);overflow:auto;position:absolute;left:50%;transform:translateX(-50%);bottom:54px;background:rgba(14,20,42,.94);border:2px solid #5a70b0;border-radius:14px;padding:8px;z-index:4;max-width:calc(100% - 16px)}
.gm-${id} .wk-wg{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.gm-${id} .wk-w{position:relative;width:64px;height:56px;border-radius:9px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;padding:0;overflow:hidden}
.gm-${id} .wk-w img{width:52px;height:34px;display:block;margin:2px auto 0;pointer-events:none}
.gm-${id} .wk-w span{position:absolute;left:0;right:0;bottom:2px;font-size:8.5px;font-weight:800;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 1px}
.gm-${id} .wk-w i{position:absolute;right:3px;top:2px;font-style:normal;font-size:11px;font-weight:900;color:#ffe14a;text-shadow:0 0 3px #000,0 0 3px #000}
.gm-${id} .wk-w.on{background:#ffb02e55;border-color:#ffb02e}
.gm-${id} .wk-w:disabled{opacity:.3;cursor:default}
.gm-${id} .wk-w:not(:disabled):hover{background:rgba(255,255,255,.2)}
.gm-${id} .wk-wo{display:flex;gap:4px;align-items:center;justify-content:center;margin-top:6px;font-size:11px;font-weight:800;flex-wrap:wrap}
.gm-${id} .wk-wo button{padding:3px 8px;border-radius:7px;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:11px;font-weight:800}
.gm-${id} .wk-wo button.on{background:#ffb02e;color:#2a1800}
.gm-${id} [hidden]{display:none!important}
`;

  const ICON_WORMS = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 52c4-12 12-6 18-16s4-14 12-16"/><circle cx="44" cy="17" r="9"/><circle cx="41" cy="15" r="1.7" fill="currentColor"/><circle cx="47" cy="15" r="1.7" fill="currentColor"/><path d="M40 21q4 3 8 0M36 11q8-6 16 0"/><path d="M4 58h56"/></svg>';

  function makeApp(root, api) {
    const sv0 = api.load() || {};
    const opt = Object.assign({}, DEF, sv0.opt || {});
    let wins = sv0.wins | 0;
    const persist = () => api.save({ opt, wins });
    let quiet = true;
    const aud = makeAudio({ get muted() { return api.muted || quiet; } });
    root.innerHTML = `<div class="wk-wrap"><canvas class="wk-cv"></canvas>
<div class="wk-tb" hidden><button data-a="wp" title="Weapons (Tab)">Arms</button><button data-a="zi" title="Zoom in">+</button><button data-a="zo" title="Zoom out">-</button><button data-a="cc" title="Follow worm (C)">Cam</button><button data-a="menu" title="Menu">Menu</button></div>
<div class="wk-wp" hidden></div>
<div class="wk-tc" hidden><div class="wk-tg"><button data-k="l">&#9664;</button><button data-k="r">&#9654;</button></div>
<div class="wk-tg wk-tgm"><button class="sm" data-k="u">&#9650;</button><button class="sm" data-k="d">&#9660;</button></div>
<div class="wk-tg"><button class="sm" data-c="flip">Flip</button><button class="sm" data-c="jump">Jump</button><button class="fire" data-k="f">FIRE</button></div></div>
<div class="wk-pn" hidden></div></div>`;
    const $ = s => root.querySelector(s);
    const cv = $('.wk-cv'), pn = $('.wk-pn'), tb = $('.wk-tb'), tc = $('.wk-tc'), wpEl = $('.wk-wp');
    const view = makeView(cv, aud), X = view.X;
    X.girder = { a: 0, l: 1 };
    X.touch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;

    let scene = 'title', mode = 'solo', role = 'local', G = null, demoG = null, demoT = 0, seat = 0, pids = [], players = [], acc = 0;
    let tok = 0, paused = false, panelOpen = false, panelAct = null, overT = -1, ovOpen = false, hooked = false, size = 4, wantBots = false;
    let snapT = 0, amT = 0, amSig = '', outEv = [], lastBits = 0, lastSend = 0, wpSig = '', wpT = 0, lastPhaseTurn = -1, hudT = 0;
    const K = { l: 0, r: 0, u: 0, d: 0, f: 0, sh: 0, fq: 0 };
    const net = () => api.net;
    const rnd = n => Math.floor(Math.random() * n);

    const icons = {};
    const icon = id => {
      if (icons[id]) return icons[id];
      const c = document.createElement('canvas'); c.width = 104; c.height = 68;
      const g = c.getContext('2d'); g.translate(52, 34); g.scale(1.9, 1.9);
      try { ICON[id](g, { t: 0 }); } catch (e) {}
      return icons[id] = c.toDataURL();
    };

    function showPanel(html, act) { pn.innerHTML = html; pn.hidden = false; panelOpen = true; panelAct = act || null; }
    function hidePanel() { pn.hidden = true; pn.innerHTML = ''; panelOpen = false; panelAct = null; }
    function setUi(on) { tb.hidden = !on; tc.hidden = !(on && X.touch); if (!on) closeWp(); }

    const setHtml = () => OPTS.map(([k, lab, vals, names]) => `<div class="wk-row"><b>${lab}</b><div class="wk-seg" data-k="${k}">${vals.map((v, i) => `<button class="wk-s${opt[k] === v ? ' on' : ''}" data-i="${i}">${names[i]}</button>`).join('')}</div></div>`).join('');
    function titleHtml() {
      return `<div class="wk-card"><h1>WORMS</h1><p class="wk-sub">Turn-based artillery on destructible islands${wins ? ' &middot; ' + fmtWins(wins) : ''}</p>
<div class="wk-btns"><button class="wk-b go" data-a="solo">Play vs bots</button><button class="wk-b" data-a="online">Play online</button><button class="wk-b alt" data-a="help">How to play</button></div>
<div class="wk-set">${setHtml()}</div><p class="wk-note">Online: 2 to 4 teams, one per player. Empty seats can be filled with bots.</p></div>`;
    }

    function newDemo() {
      const cfg = { seed: (Math.random() * 4e9) >>> 0, theme: rnd(THEMES.length), teams: [{ name: 'Red', human: false, lvl: 2, col: 0, vo: 0 }, { name: 'Blue', human: false, lvl: 2, col: 1, vo: .05 }], wpt: 3, hp: 100, tt: 30, rt: 3, wind: 1, sd: 0, sdMode: 0, crates: 0, arsenal: 'std' };
      demoG = newGame(cfg, true); demoG.demo = 1; setupWorms(demoG); demoG.mine = false;
      view.setup(demoG); X.noHud = true; demoT = 0;
    }
    function showTitle() {
      tok++; scene = 'title'; G = null; paused = false; quiet = true; ovOpen = false; overT = -1; api.hideOverlay();
      if (mode === 'online' && api.net.role) { try { api.net.close(); } catch (e) {} }
      mode = 'solo'; role = 'local';
      setUi(false); newDemo();
      showPanel(titleHtml(), titleAct);
    }
    function titleAct(a, b) {
      if (b && b.classList.contains('wk-s')) {
        const seg = b.parentNode, o = OPTS.find(x => x[0] === seg.dataset.k);
        opt[o[0]] = o[2][+b.dataset.i]; persist();
        seg.querySelectorAll('.wk-s').forEach(x => x.classList.toggle('on', x === b));
        aud.click(); return;
      }
      if (a === 'solo') startSolo();
      else if (a === 'online') startOnline();
      else if (a === 'help') showHelp(titleHtml, titleAct);
    }
    function showHelp(back, act) {
      showPanel(`<div class="wk-card">${HELP}<div class="wk-btns"><button class="wk-b" data-a="back">Back</button></div></div>`, a => { if (a === 'back') { if (scene === 'title') showPanel(titleHtml(), titleAct); else hidePanel(); paused = false; } });
      aud.click();
    }
    function showMenu() {
      if (scene !== 'play') return;
      if (mode === 'solo') paused = true;
      showPanel(`<div class="wk-card"><h2>Menu</h2><div class="wk-btns"><button class="wk-b go" data-a="resume">Resume</button><button class="wk-b alt" data-a="help">How to play</button><button class="wk-b red" data-a="quit">${mode === 'online' ? 'Leave game' : 'Quit to menu'}</button></div></div>`, a => {
        if (a === 'resume') { hidePanel(); paused = false; }
        else if (a === 'help') showHelp();
        else if (a === 'quit') { paused = false; hidePanel(); try { sessionStorage.removeItem(SK); } catch (e) {} showTitle(); }
      });
    }
    api.on(pn, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      b.blur();
      if (panelAct) panelAct(b.dataset.a, b);
    });

    function cfgOf(teams) {
      return {
        seed: (Math.random() * 4e9) >>> 0, theme: opt.theme < 0 ? rnd(THEMES.length) : opt.theme,
        teams: teams.map((t, i) => Object.assign({ col: i, vo: Math.random() * .12 }, t)),
        wpt: opt.wpt, hp: opt.hp, tt: opt.tt, rt: 3, wind: opt.wind, sd: opt.sd, sdMode: 0, crates: opt.crates, arsenal: opt.arsenal
      };
    }
    function botNames(n, skip) {
      const nm = TEAM_NAMES.filter(x => !skip.includes(x)).sort(() => Math.random() - .5);
      return nm.slice(0, n);
    }
    function begin(cfg, isHost, seatIdx, mod) {
      G = newGame(cfg, isHost); setupWorms(G); seat = seatIdx;
      if (mod) mod(G);
      G.mine = false;
      view.setup(G); X.noHud = false; X.cursorWorld = null; X.girder = { a: 0, l: 1 };
      scene = 'play'; acc = 0; overT = -1; ovOpen = false; paused = false; quiet = false; outEv = []; amSig = ''; snapT = 0; lastBits = -1; lastPhaseTurn = -1;
      Object.assign(K, { l: 0, r: 0, u: 0, d: 0, f: 0, sh: 0, fq: 0 });
      api.hideOverlay(); hidePanel(); setUi(true);
      api.score(mode === 'solo' ? fmtWins(wins) : 'Online');
    }
    function startSolo() {
      tok++; mode = 'solo'; role = 'local'; pids = [];
      const nm = botNames(1 + opt.opp, []);
      const teams = [{ name: nm[0], human: true }];
      for (let i = 1; i <= opt.opp; i++) teams.push({ name: nm[i], human: false, lvl: opt.lvl });
      begin(cfgOf(teams), true, 0);
    }

    const mine = () => !!(G && !paused && !panelOpen && G.cur && !G.cur.dead && G.cur.tm === seat && (G.phase === 'turn' || G.phase === 'act'));
    function exec(c) {
      if (!G || !mine()) return;
      if (G.host) command(G, seat, c); else if (net().connected !== false) net().send({ t: 'cmd', c });
    }
    function doTarget() {
      const w = G.cur, W = WEPS[w.wep];
      if (!W.target || G.phase !== 'turn') return;
      const m = X.cursorWorld;
      if (!m) { api.toast(X.touch ? 'Tap the map first, then press Fire' : 'Click the map to aim'); return; }
      exec({ c: 'click', x: m.x, y: m.y, a: X.girder.a, l: X.girder.l });
    }
    function fireDown() {
      if (!mine()) return;
      const W = WEPS[G.cur.wep];
      if (W.target) { doTarget(); return; }
      if (!K.f) { K.f = 1; K.fq = 1; if (!G.host) net().send({ t: 'cmd', c: { c: 'fp' } }); }
    }

    function closeWp() { wpEl.hidden = true; wpSig = ''; }
    function toggleWp() { if (!wpEl.hidden) closeWp(); else if (mine() && G.phase === 'turn') { wpEl.hidden = false; renderWp(true); aud.click(); } }
    function renderWp(force) {
      const w = G && G.cur;
      if (!w || !mine() || G.phase !== 'turn') { closeWp(); return; }
      const am = G.teams[seat].ammo, sig = [w.wep, w.fz, w.bn, WORDER.map(id => am[id]).join()].join('|');
      if (!force && sig === wpSig) return;
      wpSig = sig;
      let h = '<div class="wk-wg">' + WORDER.map(id => { const a = am[id]; return `<button class="wk-w${id === w.wep ? ' on' : ''}" data-w="${id}"${a === 0 ? ' disabled' : ''}><img src="${icon(id)}" alt=""><i>${a < 0 ? '&infin;' : a}</i><span>${WEPS[id].n}</span></button>`; }).join('') + '</div>';
      if (WEPS[w.wep].fuse) {
        h += '<div class="wk-wo">Fuse ' + [1, 2, 3, 4, 5].map(n => `<button data-f="${n}" class="${w.fz === n ? 'on' : ''}">${n}s</button>`).join('') + ' &nbsp;Bounce ' + BOUNCE_N.map((s, n) => `<button data-b="${n}" class="${w.bn === n ? 'on' : ''}">${s}</button>`).join('') + '</div>';
      }
      wpEl.innerHTML = h;
    }
    api.on(wpEl, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      b.blur();
      if (b.dataset.w) { exec({ c: 'wep', w: b.dataset.w }); closeWp(); aud.click(); }
      else if (b.dataset.f) { exec({ c: 'fuse', n: +b.dataset.f }); aud.click(); wpSig = ''; if (!G.host) wpT = .25; }
      else if (b.dataset.b) { exec({ c: 'bounce', n: +b.dataset.b }); aud.click(); wpSig = ''; }
    });
    api.on(tb, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      b.blur(); const a = b.dataset.a;
      if (a === 'wp') toggleWp(); else if (a === 'zi') view.zoomBy(1.2); else if (a === 'zo') view.zoomBy(1 / 1.2); else if (a === 'cc') view.recenter(); else if (a === 'menu') showMenu();
    });
    const hold = (b, on) => {
      const k = b.dataset.k;
      if (k === 'f') { if (on) fireDown(); else K.f = 0; }
      else K[k] = on ? 1 : 0;
      b.classList.toggle('dn', !!on);
    };
    api.on(tc, 'pointerdown', e => {
      const b = e.target.closest('button'); if (!b) return;
      e.preventDefault();
      if (b.dataset.k) { try { b.setPointerCapture(e.pointerId); } catch (er) {} hold(b, 1); }
      else if (b.dataset.c) exec({ c: b.dataset.c });
    });
    const rel = e => { const b = e.target.closest && e.target.closest('button[data-k]'); if (b) hold(b, 0); };
    api.on(tc, 'pointerup', rel); api.on(tc, 'pointercancel', rel); api.on(tc, 'lostpointercapture', rel);

    const KM = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'u', w: 'u', ArrowDown: 'd', s: 'd' };
    api.on(window, 'keydown', e => {
      if (scene !== 'play' || panelOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      let used = true;
      if (KM[k]) K[KM[k]] = 1;
      else if (k === 'Shift') K.sh = 1;
      else if (k === ' ') { if (!e.repeat) fireDown(); }
      else if (k === 'Enter') { if (!e.repeat) exec({ c: 'jump' }); }
      else if (k === 'Backspace') { if (!e.repeat) exec({ c: 'flip' }); }
      else if (k >= '1' && k <= '5') exec({ c: 'fuse', n: +k });
      else if (k === 'b') exec({ c: 'bounce' });
      else if (k === 'Tab' || k === 'q') toggleWp();
      else if (k === 'r' || k === 't') girderAdj(k === 'r' ? 0 : 1, e.shiftKey ? -1 : 1);
      else if (k === 'c') view.recenter();
      else if (k === 'h') { showMenu(); showHelp(); }
      else if (k === '+' || k === '=') view.zoomBy(1.2);
      else if (k === '-') view.zoomBy(1 / 1.2);
      else used = false;
      if (used) e.preventDefault();
    });
    api.on(window, 'keyup', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (KM[k]) K[KM[k]] = 0; else if (k === 'Shift') K.sh = 0; else if (k === ' ') K.f = 0;
    });
    api.on(window, 'blur', () => { K.l = K.r = K.u = K.d = K.f = K.sh = 0; });
    function girderAdj(which, d) {
      if (!G || !G.cur || G.cur.wep !== 'girder') return;
      if (which === 0) X.girder.a = (X.girder.a + d + 8) % 8; else X.girder.l = (X.girder.l + d + 3) % 3;
      aud.tick();
    }

    let drag = null;
    const cpos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    api.on(cv, 'contextmenu', e => { e.preventDefault(); if (scene === 'play') toggleWp(); });
    api.on(cv, 'pointerdown', e => {
      if (scene !== 'play' || e.button === 2) return;
      const [px, py] = cpos(e);
      drag = { id: e.pointerId, x: px, y: py, sx: px, sy: py, moved: 0, touch: e.pointerType === 'touch', btn: e.button };
      if (drag.touch) X.touch = true;
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    });
    api.on(cv, 'pointermove', e => {
      if (scene !== 'play') return;
      const [px, py] = cpos(e);
      if (!drag && e.pointerType !== 'touch' && G && G.cur && WEPS[G.cur.wep].target && mine()) X.cursorWorld = view.toWorld(px, py);
      if (drag && drag.id === e.pointerId) {
        if (hyp(px - drag.sx, py - drag.sy) > 6) drag.moved = 1;
        if (drag.moved) view.panBy(px - drag.x, py - drag.y);
        drag.x = px; drag.y = py;
      }
    });
    const up = e => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null;
      if (d.moved || e.type === 'pointercancel') return;
      if (!mine() || !WEPS[G.cur.wep].target) return;
      X.cursorWorld = view.toWorld(d.x, d.y);
      if (!d.touch) doTarget();
    };
    api.on(cv, 'pointerup', up); api.on(cv, 'pointercancel', up);
    api.on(cv, 'wheel', e => {
      if (scene !== 'play') return;
      e.preventDefault();
      if (G && G.cur && G.cur.wep === 'girder' && mine()) girderAdj(0, e.deltaY > 0 ? 1 : -1);
      else view.zoomBy(e.deltaY < 0 ? 1.12 : .89);
    }, { passive: false });

    function onEvent(e) {
      if (e.e === 'carve') { if (!G.host) { G.T.apply(e.c); G.carves.push(e.c); } return; }
      if (e.e === 'feed') { view.feed(e.txt, e.col); return; }
      view.event(e, G);
      if (e.e === 'turn') { X.cursorWorld = null; if (G.host && mode === 'online') saveHost(); }
    }

    function saveHost() {
      if (mode !== 'online' || role !== 'host' || !G || G.phase === 'over') return;
      try {
        sessionStorage.setItem(SK, JSON.stringify({
          code: api.net.code, at: Date.now(), cfg: G.cfg, carves: G.carves,
          worms: G.worms.map(w => Object.assign({}, w, { rope: null })),
          teams: G.teams.map(t => ({ ammo: t.ammo, ptr: t.ptr, st: t.st, voice: t.voice, max: t.max, human: t.human, name: t.name, lvl: t.lvl })),
          round: G.round, turnNo: G.turnNo, tm: G.tm, wind: G.wind, waterY: G.waterY, wtarget: G.wtarget, sd: G.sd, crates: G.crates, graves: G.graves, rng: G.rng.s, nid: G.nid
        }));
      } catch (er) {}
    }

    const FL = { on: 1, tumble: 2, dead: 4, charging: 8, hurt: 16, punch: 32, bat: 64, tp: 128, flip: 256, walk: 512, lock: 1024, recoil: 2048 };
    function snapOf() {
      const g = G;
      const s = {
        t: 's', ph: g.phase, tm: g.tm, wi: g.wi, tl: r1(g.tl), rtl: r1(g.rtl), w: g.wind, wy: r1(g.waterY), rd: g.round, tn: g.turnNo, win: g.winner, sd: g.sd ? 1 : 0,
        W: g.worms.map(w => [r1(w.x), r1(w.y), Math.round(w.vx), Math.round(w.vy), Math.max(0, Math.round(w.hp)), w.dir, Math.round(w.aim * 1000) / 1000, Math.round(w.pow * 100) / 100,
          (w.on ? 1 : 0) | (w.tumble ? 2 : 0) | (w.dead ? 4 : 0) | (w.charging ? 8 : 0) | (w.hurtT > 0 ? 16 : 0) | (w.punchT > 0 ? 32 : 0) | (w.batT > 0 ? 64 : 0) | (w.tpT > 0 ? 128 : 0) | (w.flipT > 0 ? 256 : 0) | (w.st === 1 ? 512 : 0) | (w.lock > 0 ? 1024 : 0) | (w.recoil > 0 ? 2048 : 0),
          WORDER.indexOf(w.wep), w.fz, w.bn]),
        P: g.projs.map(p => [p.id, PROJ_KINDS.indexOf(p.k), r1(p.x), r1(p.y), Math.round(p.vx), Math.round(p.vy), Math.round(p.a * 100) / 100, p.fuse == null ? -1 : Math.round(p.fuse * 10) / 10, p.dir || 0, p.own]),
        C: g.crates.map(c => [c.id, c.k, c.w, r1(c.x), r1(c.y), c.chute ? 1 : 0, c.land ? 1 : 0]),
        Gr: g.graves.map(q => [q.id, r1(q.x), r1(q.y), q.tm, q.kind, q.land ? 1 : 0]),
        R: []
      };
      g.worms.forEach(w => { if (w.rope) { const R = w.rope, a = [w.i, R.st === 'hang' ? 1 : 0, r1(R.hx || 0), r1(R.hy || 0)]; if (R.pts) R.pts.forEach(p => a.push(r1(p.x), r1(p.y))); s.R.push(a); } });
      if (g.phase === 'over') s.ST = g.teams.map(t => [t.st.dmg, t.st.kills, t.st.taken, t.st.lost]);
      return s;
    }
    const ammoOf2 = () => G.teams.map(t => WORDER.map(id => t.ammo[id]));
    function applySnap(s) {
      const g = G;
      g.phase = s.ph; g.tm = s.tm; g.wi = s.wi; g.tl = s.tl; g.rtl = s.rtl; g.wind = s.w; g.waterY = s.wy; g.round = s.rd; g.turnNo = s.tn; g.winner = s.win; g.sd = !!s.sd;
      const ropes = {};
      for (const a of s.R) ropes[a[0]] = a;
      s.W.forEach((a, i) => {
        const w = g.worms[i]; if (!w) return;
        const f = a[8];
        const first = w.tx == null;
        w.tx = a[0]; w.ty = a[1]; w.vx = a[2]; w.vy = a[3];
        if (first || hyp(w.tx - w.x, w.ty - w.y) > 90) { w.x = w.tx; w.y = w.ty; }
        w.hp = a[4]; w.dir = a[5]; w.aim = a[6]; w.pow = a[7];
        w.on = !!(f & 1); w.tumble = !!(f & 2); w.dead = !!(f & 4); w.charging = !!(f & 8);
        w.lock = f & 1024 ? 1 : 0; w.st = f & 512 ? 1 : w.on ? 0 : 2;
        const setT = (key, bit, full) => { if (f & bit) { if (!w['_' + key]) { w[key] = full; w['_' + key] = 1; } } else { w[key] = 0; w['_' + key] = 0; } };
        setT('hurtT', 16, .6); setT('punchT', 32, .6); setT('batT', 64, .45); setT('tpT', 128, .7); setT('flipT', 256, .8); setT('recoil', 2048, .08);
        w.wep = WORDER[a[9]] || 'bazooka'; w.fz = a[10]; w.bn = a[11];
        const ra = ropes[i];
        if (ra) {
          const R = w.rope && w.rope.guest ? w.rope : (w.rope = { guest: 1, pts: [] });
          R.st = ra[1] ? 'hang' : 'fly'; R.hx = ra[2]; R.hy = ra[3]; R.pts = [];
          for (let k = 4; k + 1 < ra.length; k += 2) R.pts.push({ x: ra[k], y: ra[k + 1] });
          if (R.st === 'hang') w.st = 3;
        } else w.rope = null;
      });
      recount(g);
      const pm = new Map(g.projs.map(p => [p.id, p]));
      g.projs = s.P.map(a => {
        const p = pm.get(a[0]) || { id: a[0], spin: 0, x: null };
        p.k = PROJ_KINDS[a[1]] || 'rocket'; p.tx = a[2]; p.ty = a[3];
        if (p.x == null || hyp(p.tx - p.x, p.ty - p.y) > 120) { p.x = p.tx; p.y = p.ty; }
        p.vx = a[4]; p.vy = a[5]; p.a = a[6]; p.fuse = a[7] < 0 ? null : a[7]; p.dir = a[8]; p.own = a[9];
        return p;
      });
      const cm = new Map(g.crates.map(c => [c.id, c]));
      g.crates = s.C.map(a => {
        const c = cm.get(a[0]) || { id: a[0], t: 0, x: null };
        c.k = a[1]; c.w = a[2]; c.tx = a[3]; c.ty = a[4]; c.chute = !!a[5]; c.land = !!a[6];
        if (c.x == null || hyp(c.tx - c.x, c.ty - c.y) > 80) { c.x = c.tx; c.y = c.ty; }
        return c;
      });
      const gm = new Map(g.graves.map(c => [c.id, c]));
      g.graves = s.Gr.map(a => {
        const q = gm.get(a[0]) || { id: a[0], x: null };
        q.tx = a[1]; q.ty = a[2]; q.tm = a[3]; q.kind = a[4]; q.land = !!a[5];
        if (q.x == null || hyp(q.tx - q.x, q.ty - q.y) > 80) { q.x = q.tx; q.y = q.ty; }
        return q;
      });
      if (s.ST) s.ST.forEach((a, i) => { const t = g.teams[i]; if (t) { t.st.dmg = a[0]; t.st.kills = a[1]; t.st.taken = a[2]; t.st.lost = a[3]; } });
    }
    function guestSmooth(dt) {
      const g = G, k = Math.min(1, dt * 14);
      for (const w of g.worms) {
        if (w.dead || w.tx == null) continue;
        if (!w.on && !w.rope) { w.tx += w.vx * dt; w.vy += GRAV * dt; w.ty += w.vy * dt; }
        w.x += (w.tx - w.x) * k; w.y += (w.ty - w.y) * k;
        for (const key of ['hurtT', 'punchT', 'batT', 'tpT', 'flipT', 'recoil']) if (w[key] > 0) w[key] = Math.max(.001, w[key] - dt);
      }
      for (const p of g.projs) {
        if (p.k !== 'rocket' && p.k !== 'air' && p.k !== 'plane' && p.k !== 'sheep') p.vy += GRAV * dt;
        p.tx += p.vx * dt; p.ty += p.vy * dt;
        p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
        if (p.fuse != null) p.fuse -= dt;
      }
      for (const c of g.crates) { c.t += dt; if (c.chute) { c.ty += 120 * dt; c.tx += g.wind * 24 * dt; } c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; }
      for (const q of g.graves) { q.x += (q.tx - q.x) * k; q.y += (q.ty - q.y) * k; }
      if (g.phase === 'turn') g.tl = Math.max(0, g.tl - dt); else if (g.phase === 'act') g.rtl = Math.max(0, g.rtl - dt);
    }

    function playFrame(dt) {
      if (paused) return;
      const g = G;
      if (g.host) {
        const I = g.inp[seat];
        if (I) { I.l = K.l; I.r = K.r; I.u = K.u; I.d = K.d; I.f = K.f; I.sh = K.sh; if (K.fq) { I.fq = 1; K.fq = 0; } }
        acc = Math.min(acc + dt, .1);
        while (acc >= STEP) { botTick(g, STEP); stepGame(g, STEP); acc -= STEP; }
        const es = g.evq; g.evq = [];
        for (const e of es) onEvent(e);
        if (mode === 'online') {
          for (const e of es) outEv.push(e);
          snapT -= dt; amT -= dt;
          if (snapT <= 0) {
            snapT = .05;
            if (outEv.length) { net().send({ t: 'e', es: outEv }); outEv = []; }
            net().send(snapOf(), true);
          }
          if (amT <= 0) { amT = .25; const sg = JSON.stringify(ammoOf2()); if (sg !== amSig) { amSig = sg; net().send({ t: 'am', a: JSON.parse(sg) }); } }
        }
      } else {
        guestSmooth(dt);
        if (K.fq) K.fq = 0;
        const bits = K.l | (K.r << 1) | (K.u << 2) | (K.d << 3) | (K.f << 4) | (K.sh << 5), now = performance.now();
        if (bits !== lastBits || now - lastSend > 120) { lastBits = bits; lastSend = now; net().send({ t: 'i', b: mine() ? bits : 0 }, true); }
      }
      g.mine = mine();
      if (g.phase === 'over' && overT < 0) {
        overT = 0;
        const wt = g.winner >= 0 ? g.teams[g.winner] : null;
        view.banner(wt ? wt.name + ' wins!' : 'Draw!', wt ? 'Victory' : '', wt ? TEAMS[wt.col != null ? wt.col : g.winner].l : '#fff', 4);
        if (mode === 'solo' && g.winner === 0) { wins++; persist(); api.submit(wins); api.score(fmtWins(wins)); }
        if (mode === 'online' && role === 'host') { try { sessionStorage.removeItem(SK); } catch (e) {} }
      }
      if (overT >= 0) { overT += dt; if (overT > 3.2 && !ovOpen) showEnd(); }
      if (g.phase !== 'turn' || !g.mine) { if (!wpEl.hidden && (g.phase !== 'turn' || !g.mine)) closeWp(); }
      wpT -= dt;
      if (!wpEl.hidden && wpT <= 0) { wpT = .12; renderWp(false); }
    }
    function demoFrame(dt) {
      const g = demoG;
      acc = Math.min(acc + dt, .1);
      while (acc >= STEP) { botTick(g, STEP); stepGame(g, STEP); acc -= STEP; }
      const es = g.evq; g.evq = [];
      for (const e of es) { if (e.e === 'carve') continue; view.event(e, g); }
      demoT += dt;
      if (g.phase === 'over' && (g.overT = (g.overT || 0) + dt) > 4) newDemo();
      if (demoT > 240) newDemo();
    }

    function showEnd() {
      ovOpen = true;
      const g = G, wt = g.winner >= 0 ? g.teams[g.winner] : null;
      const stats = g.teams.map(t => [esc(t.name), `${t.st.dmg} dmg &middot; ${t.st.kills} kills`]);
      const onl = mode === 'online', host = role === 'host';
      api.overlay({
        kicker: 'Match over', title: wt ? esc(wt.name) + ' wins!' : 'Nobody wins', text: wt && mode === 'solo' && g.winner === 0 ? 'Nicely done. Wins: ' + wins : 'Round ' + g.round,
        button: onl ? (host ? 'Rematch' : 'Leave') : 'Play again', secondary: onl ? (host ? 'Leave' : '') : 'Menu', stats,
        onAction: () => { ovOpen = false; if (!onl) startSolo(); else if (host) startOnline(); else showTitle(); },
        onSecondary: () => { ovOpen = false; showTitle(); }
      });
    }

    function hookNet() {
      if (hooked) return;
      hooked = true;
      net().on('data', onData);
      net().on('leave', p => {
        if (mode !== 'online' || role !== 'host' || !G || !p) return;
        const q = pids.indexOf(p.id);
        if (q < 0) return;
        pids[q] = null; G.teams[q].human = false; G.teams[q].lvl = 1;
        const e = { e: 'feed', txt: G.teams[q].name + ' left. A bot takes over', col: '#ffd37a' };
        view.feed(e.txt, e.col); outEv.push(e);
      });
      net().on('rejoin', p => {
        if (mode !== 'online' || role !== 'host' || !G || !p) return;
        const q = pids.indexOf(p.id);
        if (q >= 0) { sendInit(p.id, q); net().sendTo(p.id, { t: 'am', a: ammoOf2() }); net().sendTo(p.id, snapOf()); }
      });
      net().on('lobby', () => { if (mode === 'online' && role === 'guest') { api.hideOverlay(); startOnline(); } });
      net().on('close', reason => {
        if (mode !== 'online' || !api.alive) return;
        tok++; scene = 'title'; G = null; setUi(false); api.hideOverlay(); ovOpen = false; newDemo();
        aud.err();
        const tx = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host left, so the game ended.' : 'The connection was lost.';
        showPanel(`<div class="wk-card"><h2>Disconnected</h2><p class="wk-note">${tx}</p><div class="wk-btns"><button class="wk-b go" data-a="room">Online lobby</button><button class="wk-b alt" data-a="menu">Menu</button></div></div>`, a => { if (a === 'room') startOnline(); else { mode = 'solo'; role = 'local'; try { api.net.close(); } catch (e) {} showPanel(titleHtml(), titleAct); } });
      });
      api.interval(() => {
        if (scene !== 'play' || mode !== 'online' || !G) return;
        if (api.net.connected === false) api.score('Reconnecting...');
        else api.score(role === 'host' ? 'Online (host)' : 'Online' + (api.net.rtt ? ' ' + api.net.rtt + ' ms' : ''));
      }, 1000);
    }

    async function startOnline() {
      const my = ++tok;
      hookNet();
      hidePanel(); api.hideOverlay(); ovOpen = false; setUi(false);
      if (scene === 'play') { scene = 'title'; G = null; newDemo(); }
      mode = 'online'; role = null; quiet = true;
      let r = null;
      try { r = await api.net.room({ title: 'Worms', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4, bots: true }); } catch (e) { r = null; }
      if (!api.alive || my !== tok) return;
      if (!r) { mode = 'solo'; role = 'local'; return showTitle(); }
      role = r.role; players = r.players.slice(0, 4); size = +r.size || players.length; wantBots = !!r.bots;
      if (role === 'host') hostStart();
      else if (scene !== 'play') showPanel('<div class="wk-card"><h2>Connected</h2><p class="wk-note">Waiting for the host to start the match...</p><div class="wk-btns"><button class="wk-b alt" data-a="leave">Leave</button></div></div>', a => { if (a === 'leave') showTitle(); });
    }
    function sendInit(id, ti) { net().sendTo(id, { t: 'init', cfg: G.cfg, seat: ti, carves: G.carves }); }
    function newOnline() {
      const teams = players.map(p => ({ name: p.name, human: true, pid: p.id }));
      if (wantBots) { const nb = Math.max(0, size - players.length), nm = botNames(nb, []); for (let i = 0; i < nb; i++) teams.push({ name: nm[i], human: false, lvl: opt.lvl }); }
      pids = teams.map(t => t.pid || null);
      begin(cfgOf(teams), true, 0);
      players.forEach((p, i) => { if (i) sendInit(p.id, i); });
    }
    function hostStart() {
      let sv = null;
      try {
        const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
        if (x && x.code === api.net.code && x.cfg && x.worms && Date.now() - x.at < 432e5) sv = x;
      } catch (e) {}
      if (!sv) return newOnline();
      const map = [], used = {};
      for (let k = 0; k < players.length; k++) {
        const ti = sv.teams.findIndex((t, i) => t.human && !used[i] && t.name === players[k].name);
        if (ti >= 0) { used[ti] = 1; map[k] = ti; }
      }
      for (let k = 0; k < players.length; k++) {
        if (map[k] != null) continue;
        const ti = sv.teams.findIndex((t, i) => t.human && !used[i]);
        if (ti < 0) return newOnline();
        used[ti] = 1; map[k] = ti;
      }
      const left = sv.teams.filter((t, i) => t.human && !used[i]).length;
      showPanel(`<div class="wk-card"><h2>Game in progress</h2><p class="wk-note">Saved match: round ${sv.round}.${left ? ' ' + left + ' missing player' + (left > 1 ? 's' : '') + ' will be replaced by bots.' : ''}</p><div class="wk-btns"><button class="wk-b go" data-a="go">Resume game</button><button class="wk-b alt" data-a="new">New game</button><button class="wk-b red" data-a="leave">Leave</button></div></div>`, a => {
        if (a === 'go') resumeOnline(sv, map);
        else if (a === 'new') { try { sessionStorage.removeItem(SK); } catch (e) {} newOnline(); }
        else showTitle();
      });
    }
    function resumeOnline(sv, map) {
      const cfg = JSON.parse(JSON.stringify(sv.cfg));
      pids = cfg.teams.map(() => null);
      cfg.teams.forEach(t => { t.human = false; t.pid = null; t.lvl = t.lvl || 1; });
      players.forEach((p, k) => { cfg.teams[map[k]].human = true; cfg.teams[map[k]].pid = p.id; pids[map[k]] = p.id; });
      begin(cfg, true, map[0], g => {
        g.worms = JSON.parse(JSON.stringify(sv.worms));
        sv.teams.forEach((t, i) => { const T = g.teams[i]; T.ammo = t.ammo; T.ptr = t.ptr; T.st = t.st; T.voice = t.voice; T.max = t.max; });
        g.carves = [];
        sv.carves.forEach(c => { g.T.apply(c); g.carves.push(c); });
        g.crates = sv.crates; g.graves = sv.graves; g.round = sv.round; g.turnNo = sv.turnNo - 1; g.wind = sv.wind; g.waterY = sv.waterY; g.wtarget = sv.wtarget; g.sd = sv.sd; g.rng.s = sv.rng; g.nid = sv.nid; g.tm = sv.tm; g.winner = -2;
        recount(g); g.teams.forEach(t => { t.shown = t.hp; });
        const t = g.teams[sv.tm]; t.ptr = (t.ptr - 1 + t.worms.length) % t.worms.length;
        g.phase = 'intro'; g.introT = 1.4; g.first = sv.tm;
      });
      players.forEach((p, k) => { if (k) sendInit(p.id, map[k]); });
      view.feed('The host is back. Game resumed', '#ffd37a');
    }

    const CMDS = ['jump', 'flip', 'wep', 'fuse', 'bounce', 'click', 'skip', 'rel'];
    function onData(d, from) {
      if (!d || !d.t || !api.alive || mode !== 'online') return;
      if (role === 'host') {
        const q = pids.indexOf(from);
        if (q < 0 || !G || !G.host) return;
        if (d.t === 'i') {
          const I = G.inp[q], b = d.b | 0;
          I.l = b & 1 ? 1 : 0; I.r = b & 2 ? 1 : 0; I.u = b & 4 ? 1 : 0; I.d = b & 8 ? 1 : 0; I.f = b & 16 ? 1 : 0; I.sh = b & 32 ? 1 : 0;
        } else if (d.t === 'cmd' && d.c && typeof d.c.c === 'string') {
          if (d.c.c === 'fp') { G.inp[q].fq = 1; return; }
          if (!CMDS.includes(d.c.c)) return;
          const c = d.c;
          command(G, q, { c: c.c, w: String(c.w || ''), n: c.n == null ? null : +c.n, x: +c.x, y: +c.y, a: +c.a | 0, l: +c.l | 0 });
        }
        return;
      }
      if (d.t === 'init' && d.cfg && Array.isArray(d.cfg.teams)) {
        role = 'guest'; mode = 'online';
        begin(d.cfg, false, d.seat | 0, g => { (d.carves || []).forEach(c => { g.T.apply(c); g.carves.push(c); }); });
      } else if (!G || G.host) return;
      else if (d.t === 's') applySnap(d);
      else if (d.t === 'e' && Array.isArray(d.es)) for (const e of d.es) if (e && e.e) onEvent(e);
      else if (d.t === 'am' && Array.isArray(d.a)) d.a.forEach((a, i) => { const t = G.teams[i]; if (t) WORDER.forEach((id, k) => { t.ammo[id] = a[k]; }); });
    }

    api.loop(dt => {
      if (scene === 'play' && G) playFrame(dt); else if (demoG) demoFrame(dt);
      const V = scene === 'play' && G ? G : demoG;
      if (V) view.draw(V, dt);
    });
    api.on(window, 'resize', () => view.resize());
    newDemo();
    root._wk = { sim(sec) { for (let i = 0; i < sec * 60; i++) { botTick(G, STEP); stepGame(G, STEP); const es = G.evq; G.evq = []; for (const e of es) onEvent(e); } }, get G() { return G; }, get demo() { return demoG; }, view, K, opt, exec, startSolo, get scene() { return scene; }, mine, showTitle };
    if (api.net.invite) startOnline(); else showTitle();
    return { destroy() { tok++; aud.close(); } };
  }

  const coverWorms = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wkc-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f95e8"/><stop offset="1" stop-color="#bfe6fb"/></linearGradient><linearGradient id="wkc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86dc45"/><stop offset=".12" stop-color="#4fae2f"/><stop offset=".16" stop-color="#7a5232"/><stop offset="1" stop-color="#3a2416"/></linearGradient><radialGradient id="wkc-e" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c0"/><stop offset=".5" stop-color="#ffb03a"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#wkc-s)"/><circle cx="330" cy="50" r="26" fill="#fff6b8"/><ellipse cx="90" cy="60" rx="46" ry="14" fill="#fff" opacity=".85"/><ellipse cx="130" cy="52" rx="30" ry="12" fill="#fff" opacity=".85"/><path d="M0 300V190Q40 170 90 180T190 178Q230 150 270 182T360 175Q385 170 400 180V300Z" fill="url(#wkc-g)"/><circle cx="250" cy="200" r="30" fill="#3f95e8"/><circle cx="250" cy="200" r="30" fill="url(#wkc-s)"/><circle cx="250" cy="196" r="44" fill="url(#wkc-e)"/><g transform="translate(95 178)"><path d="M-14 8q-6-14 6-18" stroke="#6a2434" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M-14 8q-6-14 6-18" stroke="#f6a3b5" stroke-width="18" stroke-linecap="round" fill="none"/><circle cx="4" cy="-22" r="15" fill="#6a2434"/><circle cx="4" cy="-22" r="13.6" fill="#f6a3b5"/><path d="M-9-27q13-14 26-2" stroke="#e8433a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="2" cy="-21" rx="3.4" ry="5" fill="#fff" stroke="#2a1420"/><ellipse cx="10" cy="-21" rx="3.4" ry="5" fill="#fff" stroke="#2a1420"/><circle cx="3.4" cy="-20" r="1.8" fill="#17080e"/><circle cx="11.4" cy="-20" r="1.8" fill="#17080e"/><path d="M4-13q5 4 10 0" stroke="#2a1420" stroke-width="1.6" fill="none"/><rect x="12" y="-10" width="34" height="9" rx="4" fill="#6b7a40" stroke="#2a3418" stroke-width="2" transform="rotate(-22 12 -10)"/></g><g transform="translate(300 168)"><path d="M-12 8q-5-12 5-16" stroke="#6a2434" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M-12 8q-5-12 5-16" stroke="#f6a3b5" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="3" cy="-20" r="13" fill="#6a2434"/><circle cx="3" cy="-20" r="11.8" fill="#f6a3b5"/><path d="M-8-24q11-12 22-2" stroke="#3f7cf0" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-19" rx="3" ry="4.4" fill="#fff" stroke="#2a1420"/><ellipse cx="7" cy="-19" rx="3" ry="4.4" fill="#fff" stroke="#2a1420"/><circle cx="1" cy="-18" r="1.6" fill="#17080e"/><circle cx="8" cy="-18" r="1.6" fill="#17080e"/><ellipse cx="3.5" cy="-11" rx="2.4" ry="3" fill="#6a1424"/></g><path d="M150 140Q200 60 250 196" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 6" fill="none" opacity=".7"/><g transform="translate(215 98) rotate(35)"><rect x="-14" y="-4" width="26" height="8" rx="4" fill="#d44" stroke="#611" stroke-width="1.5"/><path d="M12-4l8 4-8 4z" fill="#eee" stroke="#611" stroke-width="1.5"/><path d="M-14-4l-6-5v18l6-5z" fill="#ffb02e"/></g><text x="200" y="272" text-anchor="middle" font-family="Trebuchet MS,Segoe UI,sans-serif" font-weight="900" font-size="46" fill="#ffd0dc" stroke="#6a2434" stroke-width="7" paint-order="stroke" letter-spacing="3">WORMS</text></svg>`;

  Ameplay.register({
    id: ID, title: 'Worms', category: 'Action', tint: '#e8556f',
    blurb: 'Turn-based artillery on destructible islands. Blast rival worm teams with bazookas, sheep, holy grenades and a ninja rope. Vs bots or online with up to 4 teams.',
    help: '<kbd>Arrows</kbd> move and aim · hold <kbd>Space</kbd> to charge and fire · <kbd>Enter</kbd> jump · <kbd>Backspace</kbd> backflip · <kbd>Tab</kbd> weapons · <kbd>1</kbd>-<kbd>5</kbd> fuse',
    better: 'high', format: fmtWins, width: 1000, icon: ICON_WORMS,
    css: CSS(ID),
    mount: (root, api) => makeApp(root, api)
  });
  Ameplay.covers[ID] = coverWorms;

})();
