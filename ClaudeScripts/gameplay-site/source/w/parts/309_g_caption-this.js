(() => {
'use strict';
const ID = 'caption-this';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const ri = n => Math.floor(Math.random() * n);
const pick = a => a[ri(a.length)];
const rr = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const L = (s, o) => {
  let v = s;
  try { if (window.gpI18n && typeof gpI18n.t === 'function') v = gpI18n.t(s, o); } catch (e) {}
  if (typeof v !== 'string') v = s;
  return o ? v.replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : v;
};
const PCOL = ['#e8364d', '#2f7fe0', '#e6a100', '#2a9d3a', '#8a4fd0', '#ff7a1a', '#0fa3a3', '#d6336c', '#4c6ef5', '#74b816'];
const BOTN = ['Ada', 'Bolt', 'Cleo', 'Dash', 'Echo', 'Fizz', 'Gus', 'Hana', 'Ivy', 'Jett', 'Kiki', 'Luna', 'Milo', 'Nova', 'Otto', 'Pip', 'Quill', 'Rex', 'Suki', 'Tux', 'Wren', 'Yuki', 'Zed', 'Blip', 'Chip', 'Dot', 'Nix', 'Taco', 'Beep', 'Sparky'];
const botNames = (n, taken) => {
  const t = new Set((taken || []).map(x => String(x).toLowerCase()));
  const out = [];
  for (const b of shuf(BOTN)) { if (out.length >= n) break; if (!t.has(b.toLowerCase())) out.push(b); }
  while (out.length < n) out.push('Bot ' + (out.length + 1));
  return out;
};
const myName = () => {
  try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || '{}'); return String(p.username || p.displayName || localStorage.getItem('gameplay:netname') || 'You').slice(0, 16); } catch (e) { return 'You'; }
};
const initial = n => (String(n || '?').trim()[0] || '?').toUpperCase();
const BOT_SVG = '<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/></svg>';
const avatar = (n, c, bot, sz) => `<span class="ct-av" translate="no" style="background:${PCOL[c % PCOL.length]};${sz ? `width:${sz}px;height:${sz}px;font-size:${Math.round(sz * .5)}px` : ''}">${bot ? BOT_SVG : esc(initial(n))}</span>`;

const RUDE = /(^|[^a-z])(f+u+c*k+|sh+i+t+|b+i+t+c+h+|c+u+n+t+|n+i+gg+(?:e+r+|a+)|f+a+g+(?:g*o+t+)?|r+e+t+a+r+d+(?:e+d+|s+)?|wh+o+r+e+|s+l+u+t+|d+i+c+k+(?:h+e+a+d+)?|p+u+s+s+y+|c+o+c+k+|a+s+s+h+o+l+e+|b+a+s+t+a+r+d+|w+a+n+k+|t+w+a+t+|p+o+r+n+o*|r+a+p+e+|k+y+s+|p+e+d+o+|n+a+z+i+|h+i+t+l+e+r+|s+e+x+y*|b+o+o+b+s*|t+i+t+s+|d+a+m+n+|c+r+a+p+|put(?:e|ain)|salop(?:e|ard)?|conn(?:ard|asse)|encul[eé]|merde|niqu(?:e|er)|couille|chier|pendejo|cabr[oó]n|mierda|puta|joder|co[nñ]o|schei(?:ss|ß)e|arschloch|fotze|wichser|cazzo|stronzo|vaffanculo|porra|caralho|merda|foder)(?:s|e[drs]?|ing|y|o|a)?(?![a-z])/g;
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };
const tame = s => {
  s = String(s == null ? '' : s);
  const n = s.replace(/[A-Z013457@$!]/g, c => LEET[c] || c.toLowerCase()).replace(/[\u00c0-\u00d6\u00d8-\u00de]/g, c => c.toLowerCase());
  let o = '', at = 0, m;
  RUDE.lastIndex = 0;
  while ((m = RUDE.exec(n))) { const i = m.index + m[1].length, j = m.index + m[0].length; o += s.slice(at, i) + s[i] + '*'.repeat(j - i - 1); at = j; }
  return o + s.slice(at);
};
const LINKY = [
  /\b(?:https?:\/\/|www\.)\S+/gi,
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
  /\b[\w-]{2,}\.(?:com|net|org|io|gg|fr|co|uk|de|es|it|pt|be|ch|ca|us|me|tv|ly|xyz|app|dev|link|site|online|info|biz|ru|cn)\b(?:\/\S*)?/gi,
  /(?:^|\s)@[\w.]{2,}/g,
  /(?:\+|\b)\d[\d\s().-]{6,}\d\b/g,
  /\b(?:discord|snap(?:chat)?|insta(?:gram)?|tiktok|whatsapp|telegram)\s*[:@]?\s*[\w.#-]{3,}/gi
];
const ctClean = s => {
  let t = String(s == null ? '' : s).normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, ' ');
  for (const r of LINKY) t = t.replace(r, m => (/^\s/.test(m) ? ' ' : '') + '***');
  t = t.replace(/(.)\1{5,}/g, '$1$1$1$1$1').replace(/\s+/g, ' ').trim().slice(0, 70);
  return tame(t);
};

function makeSnd(api) {
  let ac = null, mg = null, mt = null, mus = null;
  const ctx = () => {
    if (api.muted) return null;
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); mg = ac.createGain(); mg.gain.value = 1; mg.connect(ac.destination); }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    } catch (e) { return null; }
  };
  const tone = (f, d, type = 'sine', v = .08, t0 = 0, f2 = 0) => {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(mg); o.start(t); o.stop(t + d + .04);
  };
  const noise = (d, v = .15, f = 800, t0 = 0, q = .7, type = 'lowpass') => {
    const c = ctx(); if (!c) return;
    const n = Math.max(1, Math.floor(c.sampleRate * d)), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    s.buffer = b; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl).connect(g).connect(mg); s.start(t); s.stop(t + d + .02);
  };
  const S = {
    tap: () => tone(560, .05, 'sine', .05),
    tick: (f = 1200) => tone(f, .03, 'square', .02),
    pop: () => tone(880, .07, 'sine', .06, 0, 440),
    key: () => tone(1500 + ri(300), .015, 'square', .008),
    whoosh: () => noise(.3, .09, 1400, 0, .5, 'bandpass'),
    rate: r => { const f = [196, 247, 330, 440, 587][clamp(r, 1, 5) - 1]; tone(f, .12, 'triangle', .08); if (r >= 4) tone(f * 1.5, .16, 'triangle', .06, .07); if (r === 5) tone(f * 2, .2, 'triangle', .05, .14); },
    reveal: () => { tone(330, .12, 'triangle', .07); tone(494, .12, 'triangle', .07, .1); tone(659, .3, 'triangle', .08, .2); },
    fanfare: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, .22, 'triangle', .085, i * .1)),
    drum: () => { tone(120, .18, 'sine', .2, 0, 40); noise(.05, .07, 5000, 0, 1, 'highpass'); },
    cheer: () => { for (let i = 0; i < 9; i++) noise(.5, .045, 1800 + ri(1500), i * .05, .8, 'bandpass'); },
    jingle: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, .2, 'square', .035, i * .09)),
    bad: () => { tone(220, .14, 'sawtooth', .04, 0, 160); },
    stop() { clearInterval(mt); mt = null; mus = null; },
    music() {
      if (mt) return;
      const c = ctx(); if (!c) return;
      mus = { step: 0, next: c.currentTime + .05 };
      const BASS = [130.8, 0, 0, 130.8, 0, 0, 164.8, 0, 174.6, 0, 0, 174.6, 0, 0, 146.8, 0, 130.8, 0, 0, 130.8, 0, 0, 196, 0, 174.6, 0, 164.8, 0, 146.8, 0, 0, 0];
      const LEAD = [523.3, 0, 659.3, 0, 784, 0, 659.3, 0, 698.5, 0, 880, 0, 784, 0, 587.3, 0, 523.3, 0, 659.3, 0, 784, 0, 1046.5, 0, 880, 0, 784, 0, 659.3, 0, 587.3, 0];
      mt = setInterval(() => {
        const c2 = ctx(); if (!c2 || !mus) return;
        while (mus.next < c2.currentTime + .25) {
          const s = mus.step % 32, t = mus.next - c2.currentTime, sp = 60 / 104 / 4;
          if (BASS[s]) tone(BASS[s], sp * 2.4, 'triangle', .05, t);
          if (LEAD[s] && mus.step % 64 >= 32) tone(LEAD[s], sp * 1.4, 'sine', .022, t);
          if (s % 4 === 2) noise(.025, .025, 7000, t, 1, 'highpass');
          if (s % 8 === 0) tone(80, .12, 'sine', .09, t, 40);
          mus.step++; mus.next += sp;
        }
      }, 90);
    },
    close() { S.stop(); try { if (ac) ac.close(); } catch (e) {} ac = null; }
  };
  return S;
}

const PW = 640, PH = 480, TAU = Math.PI * 2, OL = '#2a2238';
const ink = (c, w, col) => { c.lineWidth = w; c.strokeStyle = col || OL; c.lineJoin = 'round'; c.lineCap = 'round'; };
const pp = d => typeof d === 'string' ? new Path2D(d) : d;
function F(c, d, f, w = 5) { const p = pp(d); if (f) { c.fillStyle = f; c.fill(p); } if (w) { ink(c, w); c.stroke(p); } }
function SK(c, d, col, w = 5) { const p = pp(d); ink(c, w, col); c.stroke(p); }
function E(c, x, y, rx, ry, f, w = 5, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); F(c, p, f, w); }
function Ci(c, x, y, r, f, w = 5) { E(c, x, y, r, r, f, w); }
function rrp(p, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
function B(c, x, y, w, h, r, f, lw = 5) { F(c, rrp(new Path2D(), x, y, w, h, r), f, lw); }
function LG(c, x0, y0, x1, y1, st) { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach((s, i) => g.addColorStop(i / Math.max(1, st.length - 1), s)); return g; }
function RG(c, x, y, r, st) { const g = c.createRadialGradient(x, y, 0, x, y, r); st.forEach((s, i) => g.addColorStop(i / Math.max(1, st.length - 1), s)); return g; }
function alpha(c, a, fn) { c.save(); c.globalAlpha = a; fn(); c.restore(); }
function shadow(c, x, y, rx, ry, a = .22) { alpha(c, a, () => E(c, x, y, rx, ry, '#1a1030', 0)); }
function shine(c, x, y, rx, ry, rot = -.5, a = .38) { alpha(c, a, () => E(c, x, y, rx, ry, '#fff', 0, rot)); }
function fill(c, f) { c.fillStyle = f; c.fillRect(0, 0, PW, PH); }
function eye(c, x, y, r, k, dx = 0, dy = 0) {
  if (k === 'shut') { SK(c, `M${x - r} ${y} Q${x} ${y + r * .9} ${x + r} ${y}`, OL, Math.max(3, r * .35)); return; }
  if (k === 'happy') { SK(c, `M${x - r} ${y + r * .3} Q${x} ${y - r * .9} ${x + r} ${y + r * .3}`, OL, Math.max(3, r * .35)); return; }
  if (k === 'dot') { Ci(c, x + dx, y + dy, r * .5, OL, 0); Ci(c, x + dx - r * .15, y + dy - r * .18, r * .16, '#fff', 0); return; }
  Ci(c, x, y, r, '#fff', Math.max(2.5, r * .2));
  const pr = k === 'w' ? r * .3 : r * .55;
  Ci(c, x + dx * r * .42, y + dy * r * .42, pr, OL, 0);
  Ci(c, x + dx * r * .42 - pr * .3, y + dy * r * .42 - pr * .35, pr * .32, '#fff', 0);
  if (k === 'side') { c.save(); c.beginPath(); c.arc(x, y, r + 1, 0, TAU); c.clip(); c.fillStyle = c._lid || '#e08a3c'; c.fillRect(x - r - 2, y - r - 2, r * 2 + 4, r * .95 + 2); c.restore(); SK(c, `M${x - r} ${y - r * .05} L${x + r} ${y - r * .05}`, OL, Math.max(2.5, r * .22)); Ci(c, x, y, r, null, Math.max(2.5, r * .2)); }
}
function mouth(c, x, y, w, k) {
  const lw = Math.max(3, w * .14);
  if (k === 'smile') SK(c, `M${x - w / 2} ${y} Q${x} ${y + w * .5} ${x + w / 2} ${y}`, OL, lw);
  else if (k === 'frown') SK(c, `M${x - w / 2} ${y + w * .2} Q${x} ${y - w * .25} ${x + w / 2} ${y + w * .2}`, OL, lw);
  else if (k === 'flat') SK(c, `M${x - w / 2} ${y} L${x + w / 2} ${y}`, OL, lw);
  else if (k === 'wavy') SK(c, `M${x - w / 2} ${y} q${w / 8} ${-w / 8} ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`, OL, lw);
  else if (k === 'o') { E(c, x, y + w * .1, w * .28, w * .36, '#7a2638', lw * .8); E(c, x, y + w * .26, w * .16, w * .12, '#e8667a', 0); }
  else if (k === 'grin') { F(c, `M${x - w / 2} ${y} Q${x} ${y + w * .75} ${x + w / 2} ${y} Z`, '#7a2638', lw * .8); F(c, `M${x - w * .38} ${y + w * .04} L${x + w * .38} ${y + w * .04} L${x + w * .3} ${y + w * .16} L${x - w * .3} ${y + w * .16} Z`, '#fff', 0); }
}
function blush(c, x, y, r = 14) { alpha(c, .35, () => E(c, x, y, r, r * .6, '#ff5a7a', 0)); }
function sweat(c, x, y, s = 1) { F(c, `M${x} ${y} q${-9 * s} ${14 * s} 0 ${20 * s} q${9 * s} ${-6 * s} 0 ${-20 * s} Z`, '#8fd4ff', 3); shine(c, x - 2 * s, y + 13 * s, 2 * s, 3 * s, 0, .7); }
function stars(c, n, seed, y1) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < n; i++) { const x = r() * PW, y = r() * (y1 || PH), z = r() * 2 + .6; alpha(c, .5 + r() * .5, () => Ci(c, x, y, z, '#fff', 0)); } }
function rain(c, n, seed, col) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; ink(c, 2.4, col); c.beginPath(); for (let i = 0; i < n; i++) { const x = r() * (PW + 80) - 40, y = r() * PH; c.moveTo(x, y); c.lineTo(x - 7, y + 22); } c.stroke(); }
function motion(c, list, col = '#ffffff', w = 4) { list.forEach(([x, y, l, a]) => SK(c, `M${x} ${y} l${Math.cos(a || 0) * l} ${Math.sin(a || 0) * l}`, col, w)); }

const TB = [{ k: 'Top text', x: .03, y: .025, w: .94, h: .24, st: 'meme', a: 't' }, { k: 'Bottom text', x: .03, y: .735, w: .94, h: .24, st: 'meme', a: 'b' }];

const SCENES = [
  {
    id: 'side-eye', name: 'Side-eye cat', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, 330, ['#ffe7a8', '#f5c46e']));
      for (let x = 20; x < PW; x += 64) alpha(c, .18, () => B(c, x, 0, 26, 330, 0, '#fff', 0));
      B(c, 446, 46, 150, 120, 10, '#bfe8ff', 6); SK(c, 'M521 46 V166 M446 106 H596', OL, 6); alpha(c, .5, () => F(c, 'M456 156 L520 56 L540 56 L476 156 Z', '#fff', 0));
      F(c, 'M0 318 H640 V480 H0 Z', LG(c, 0, 318, 0, 480, ['#b56b3a', '#8a4a24']), 0); F(c, 'M0 318 H640', null, 6); alpha(c, .25, () => B(c, 0, 330, 640, 10, 0, '#fff', 0));
      F(c, 'M120 330 C120 230 140 190 220 190 C300 190 320 230 320 330 Z', '#f08a36', 6);
      SK(c, 'M150 250 q20 10 34 0 M262 250 q14 10 34 0 M170 290 q20 8 30 0', '#c4611c', 6);
      F(c, 'M128 120 L140 40 L196 92 Z', '#f08a36', 6); F(c, 'M312 120 L300 40 L244 92 Z', '#f08a36', 6);
      F(c, 'M142 104 L148 62 L178 92 Z', '#ffb4b4', 0); F(c, 'M298 104 L292 62 L262 92 Z', '#ffb4b4', 0);
      E(c, 220, 150, 104, 84, '#f08a36', 6);
      SK(c, 'M196 76 l6 22 M220 70 v24 M244 76 l-6 22', '#c4611c', 6);
      E(c, 220, 182, 50, 34, '#fff3e0', 0);
      c._lid = '#f08a36'; eye(c, 176, 140, 24, 'side', 1, .15); eye(c, 266, 140, 24, 'side', 1, .15);
      SK(c, 'M150 108 L200 120 M244 116 L292 100', OL, 7);
      F(c, 'M212 170 L228 170 L220 180 Z', '#ff7a8a', 4); mouth(c, 220, 194, 30, 'frown');
      SK(c, 'M160 182 L104 172 M160 192 L106 198 M280 182 L338 172 M280 192 L336 198', OL, 3.5);
      E(c, 160, 328, 36, 18, '#f08a36', 6); E(c, 284, 328, 36, 18, '#f08a36', 6);
      shadow(c, 452, 366, 140, 26); E(c, 450, 356, 136, 34, '#fff', 6); E(c, 450, 350, 100, 22, '#e9eef5', 0);
      const tree = (x, y, s) => { F(c, `M${x - 6 * s} ${y} L${x - 9 * s} ${y + 34 * s} L${x + 9 * s} ${y + 34 * s} L${x + 6 * s} ${y} Z`, '#8fd16a', 4); [[-18, -6, 16], [0, -18, 20], [18, -6, 16], [-8, 4, 14], [10, 4, 14]].forEach(([dx, dy, r]) => Ci(c, x + dx * s, y + dy * s, r * s, '#3fa34d', 4)); alpha(c, .3, () => Ci(c, x - 4 * s, y - 22 * s, 7 * s, '#fff', 0)); };
      tree(410, 300, 1.05); tree(476, 306, .95); tree(520, 316, .8);
    },
    bot: [['ME LOOKING AT', 'MY VEGETABLES'], ['WHEN SOMEONE SAYS', 'BROCCOLI IS A TINY TREE'], ['THE FACE YOU MAKE', 'WHEN DINNER IS HEALTHY'], ['I DID NOT ORDER', 'THE SALAD'], ['ME WHEN THE TEACHER SAYS', '"THIS WILL BE FUN"'], ['ABSOLUTELY', 'NOT']]
  },
  {
    id: 'tabs', name: 'Hamster at 3 a.m.', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#151a33', '#2a3361']));
      stars(c, 0, 1);
      B(c, 470, 40, 120, 120, 60, '#f4f1e8', 6); Ci(c, 530, 100, 6, OL, 0); SK(c, 'M530 100 L530 62 M530 100 L556 100', OL, 6);
      alpha(c, .5, () => B(c, 40, 50, 130, 160, 8, '#3a4680', 0));
      F(c, 'M0 360 H640 V480 H0 Z', LG(c, 0, 360, 0, 480, ['#7a4a2a', '#5a3218']), 0); SK(c, 'M0 360 H640', OL, 6);
      c.fillStyle = RG(c, 320, 230, 300, ['rgba(120,230,255,.55)', 'rgba(120,230,255,0)']); c.fillRect(0, 0, PW, PH);
      E(c, 320, 250, 140, 120, '#e8a25e', 6);
      E(c, 320, 280, 90, 70, '#fff1dc', 0);
      Ci(c, 210, 160, 30, '#e8a25e', 6); Ci(c, 430, 160, 30, '#e8a25e', 6); Ci(c, 210, 160, 16, '#ffb4b4', 0); Ci(c, 430, 160, 16, '#ffb4b4', 0);
      alpha(c, .35, () => { E(c, 270, 230, 34, 28, '#7a4a8a', 0); E(c, 370, 230, 34, 28, '#7a4a8a', 0); });
      eye(c, 270, 214, 30, 'w', 0, 0); eye(c, 370, 214, 30, 'w', 0, 0);
      SK(c, 'M236 252 q-4 10 4 16 M404 252 q4 10 -4 16', '#d86a9a', 4);
      F(c, 'M310 252 L330 252 L320 262 Z', '#ff7a8a', 4); mouth(c, 320, 274, 34, 'wavy');
      F(c, 'M150 380 L180 250 L460 250 L490 380 Z', LG(c, 0, 250, 0, 380, ['#c9ced8', '#9ea4b3']), 6);
      alpha(c, .6, () => F(c, 'M300 300 l10 -20 l10 20 l22 3 l-16 15 l4 22 l-20 -11 l-20 11 l4 -22 l-16 -15 Z', '#fff', 0));
      B(c, 120, 372, 400, 20, 8, '#7d8394', 6);
      E(c, 214, 378, 22, 14, '#e8a25e', 5); E(c, 426, 378, 22, 14, '#e8a25e', 5);
      B(c, 520, 300, 40, 74, 8, '#3fd16a', 6); SK(c, 'M522 322 H558 M522 350 H558', '#1d7a3a', 5); F(c, 'M534 334 l8 -12 l-2 10 l8 0 l-8 12 l2 -10 Z', '#ffe14d', 0);
      [[60, 340, -.2], [84, 318, .15], [70, 296, -.05]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); B(c, -40, -16, 80, 30, 3, '#fff', 4); SK(c, 'M-28 -6 H26 M-28 4 H14', '#9fb0e8', 3); c.restore(); });
    },
    bot: [['ME AT 3 A.M.', 'WITH 47 TABS OPEN'], ['WHEN THE PROJECT', 'IS DUE IN 5 HOURS'], ['"I WILL SLEEP EARLY TONIGHT"', 'ALSO ME:'], ['ONE MORE VIDEO', 'THEN I SLEEP'], ['RESEARCHING HOMEWORK', 'ENDED UP LEARNING ABOUT SHARKS'], ['MY BRAIN', 'AT BEDTIME']]
  },
  {
    id: 'buttons', name: 'Two buttons', bx: [{ k: 'Top text', x: .03, y: .025, w: .94, h: .2, st: 'meme', a: 't' }, { k: 'Red button', x: .17, y: .83, w: .3, h: .12, st: 'plate' }, { k: 'Blue button', x: .53, y: .83, w: .3, h: .12, st: 'plate' }],
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#d6e4f0', '#a9c0d6']));
      for (let y = 30; y < 300; y += 50) alpha(c, .25, () => B(c, 0, y, PW, 4, 0, '#fff', 0));
      F(c, 'M200 300 C200 210 240 190 320 190 C400 190 440 210 440 300 Z', '#4c6ef5', 6);
      F(c, 'M300 190 L320 236 L340 190 Z', '#fff', 0);
      F(c, 'M232 250 C190 260 176 300 200 330 L226 326 C214 300 226 280 252 276 Z', '#4c6ef5', 6);
      F(c, 'M408 250 C450 260 470 300 446 330 L420 326 C432 300 420 280 392 276 Z', '#4c6ef5', 6);
      E(c, 210, 334, 22, 18, '#f2c49a', 5); E(c, 432, 334, 22, 18, '#f2c49a', 5);
      Ci(c, 320, 130, 78, '#f2c49a', 6);
      F(c, 'M244 116 C246 56 300 40 330 48 C370 54 400 80 398 118 C380 92 350 84 318 90 C290 94 262 102 244 116 Z', '#5a3a22', 6);
      eye(c, 290, 136, 17, 'o', -.6, .2); eye(c, 352, 136, 17, 'o', .6, .2);
      SK(c, 'M268 110 L302 116 M338 116 L372 110', OL, 6);
      mouth(c, 320, 176, 34, 'wavy'); sweat(c, 396, 100, 1.2); sweat(c, 250, 92, 1); sweat(c, 410, 150, .8);
      F(c, 'M40 330 L600 330 L640 480 L0 480 Z', LG(c, 0, 330, 0, 480, ['#8a94a8', '#5d667a']), 6);
      alpha(c, .25, () => F(c, 'M40 336 L600 336 L604 346 L36 346 Z', '#fff', 0));
      const btn = (x, col, dk) => { E(c, x, 376, 66, 24, '#3a4152', 6); F(c, `M${x - 52} 370 C${x - 52} 326 ${x + 52} 326 ${x + 52} 370 C${x + 52} 384 ${x - 52} 384 ${x - 52} 370 Z`, col, 6); alpha(c, .45, () => E(c, x - 16, 346, 18, 8, '#fff', 0, -.2)); E(c, x, 372, 52, 12, dk, 0); };
      btn(204, '#ff4b5c', '#b81c30'); btn(436, '#3a8bff', '#1a4fc4');
      B(c, 104, 396, 200, 62, 8, '#f4f1e8', 5); B(c, 336, 396, 200, 62, 8, '#f4f1e8', 5);
      [[112, 404], [296, 404], [112, 450], [296, 450], [344, 404], [528, 404], [344, 450], [528, 450]].forEach(([x, y]) => Ci(c, x, y, 3, '#9aa2b4', 0));
    },
    bot: [['ME CHOOSING', ''], ['DECISIONS', ''], ['MY BRAIN AT LUNCH', ''], ['EVERY MORNING', ''], ['THE HARDEST CHOICE', '']],
    botPairs: [['SLEEP 5 MORE MINUTES', 'BE ON TIME'], ['FINISH HOMEWORK', 'ONE MORE LEVEL'], ['PIZZA', 'ALSO PIZZA'], ['TELL THE TRUTH', 'BLAME THE DOG'], ['STUDY', 'REORGANISE MY DESK'], ['SAVE MONEY', 'BUY SNACKS']]
  },
  {
    id: 'slip', name: 'Penguin slip', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#7cc8ff', '#d8f1ff']));
      F(c, 'M0 250 L90 170 L170 230 L260 150 L360 240 L450 160 L560 230 L640 190 V320 H0 Z', '#eaf6ff', 6);
      alpha(c, .5, () => F(c, 'M260 150 L300 190 L270 186 L250 210 Z M450 160 L490 196 L462 194 Z', '#c4e4ff', 0));
      F(c, 'M0 320 H640 V480 H0 Z', LG(c, 0, 320, 0, 480, ['#bfe6ff', '#8ed0f7']), 0); SK(c, 'M0 320 H640', OL, 6);
      alpha(c, .6, () => { F(c, 'M60 360 L200 350 L190 358 L70 368 Z', '#fff', 0); F(c, 'M420 430 L600 420 L590 428 L430 438 Z', '#fff', 0); });
      shadow(c, 320, 420, 120, 18, .25);
      c.save(); c.translate(320, 300); c.rotate(-.9);
      E(c, 0, 0, 70, 96, '#2b2d42', 6); E(c, 6, 16, 46, 72, '#fff', 0);
      F(c, 'M-60 -10 C-120 -40 -130 -70 -110 -80 C-90 -60 -70 -40 -50 -36 Z', '#2b2d42', 6);
      F(c, 'M60 -10 C120 -50 130 -80 108 -90 C92 -66 72 -46 52 -36 Z', '#2b2d42', 6);
      F(c, 'M-30 90 L-50 130 L-10 120 Z', '#ff9a2e', 5); F(c, 'M24 90 L20 134 L52 112 Z', '#ff9a2e', 5);
      eye(c, -16, -50, 14, 'w', 0, 0); eye(c, 22, -50, 14, 'w', 0, 0);
      F(c, 'M-6 -28 L26 -26 L10 -2 Z', '#ff9a2e', 5); mouth(c, 10, -18, 12, 'o');
      c.restore();
      motion(c, [[170, 380, 60, 3.1], [180, 400, 80, 3.1], [176, 360, 40, 3.1]], '#ffffff', 6);
      c.save(); c.translate(470, 140); c.rotate(.6);
      F(c, 'M-40 0 C-20 -24 20 -24 30 0 C20 24 -20 24 -40 0 Z', '#7aa4c8', 5); F(c, 'M30 0 L56 -20 L52 0 L56 20 Z', '#7aa4c8', 5); Ci(c, -24, -4, 4, OL, 0);
      c.restore();
      [[404, 210], [424, 236], [250, 200]].forEach(([x, y]) => F(c, `M${x} ${y - 12} L${x + 4} ${y - 4} L${x + 12} ${y} L${x + 4} ${y + 4} L${x} ${y + 12} L${x - 4} ${y + 4} L${x - 12} ${y} L${x - 4} ${y - 4} Z`, '#ffe14d', 3));
    },
    bot: [['ME WALKING INTO SCHOOL', 'ON THE FIRST DAY'], ['WHEN YOU SAY', '"WATCH THIS"'], ['MONDAY', 'IN ONE PICTURE'], ['ME TRYING TO BE COOL', 'IN FRONT OF MY CRUSH'], ['THE FISH', 'WAS NEVER MINE'], ['FLOOR: WET', 'ME: OK']]
  },
  {
    id: 'tower', name: 'Proud builder', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, 340, ['#cfe9d8', '#a8d7b8']));
      alpha(c, .3, () => { for (let x = 0; x < PW; x += 40) B(c, x, 0, 18, 340, 0, '#fff', 0); });
      F(c, 'M0 340 H640 V480 H0 Z', LG(c, 0, 340, 0, 480, ['#d9a066', '#b97a3e']), 0); SK(c, 'M0 340 H640', OL, 6);
      for (let x = -40; x < PW; x += 110) SK(c, `M${x} 340 L${x - 40} 480`, '#a06428', 3);
      shadow(c, 470, 420, 110, 16);
      const blocks = [['#ff4b5c', 0], ['#3a8bff', 14], ['#ffd23a', -10], ['#3fc46a', 20], ['#a35cff', 4], ['#ff9a2e', 28], ['#3ad0d0', 10], ['#ff6ab0', 36]];
      blocks.forEach(([col, dx], i) => { const y = 380 - i * 44, x = 430 + dx + Math.sin(i) * 4; c.save(); c.translate(x + 40, y + 20); c.rotate((i % 2 ? .05 : -.04) * (i / 3)); B(c, -40, -20, 80, 42, 6, col, 5); alpha(c, .35, () => B(c, -32, -14, 40, 8, 4, '#fff', 0)); c.restore(); });
      motion(c, [[560, 80, 24, 0], [566, 100, 30, 0], [396, 90, -24, 0]], OL, 4);
      shadow(c, 200, 430, 120, 16);
      E(c, 200, 350, 92, 82, '#c98a4a', 6); E(c, 200, 372, 56, 54, '#fff4e4', 0);
      E(c, 140, 420, 30, 20, '#c98a4a', 6); E(c, 260, 420, 30, 20, '#c98a4a', 6);
      F(c, 'M116 180 C80 200 86 280 120 286 C134 260 136 214 116 180 Z', '#7a4a22', 6); F(c, 'M284 180 C320 200 314 280 280 286 C266 260 264 214 284 180 Z', '#7a4a22', 6);
      E(c, 200, 230, 90, 78, '#c98a4a', 6); E(c, 200, 266, 54, 38, '#fff4e4', 0);
      eye(c, 166, 228, 14, 'happy'); eye(c, 234, 228, 14, 'happy');
      E(c, 200, 258, 18, 12, OL, 0); mouth(c, 200, 280, 36, 'smile'); blush(c, 150, 262); blush(c, 250, 262);
      F(c, 'M106 176 C112 106 288 106 294 176 Z', '#ffcf2e', 6); B(c, 92, 168, 216, 22, 10, '#ffcf2e', 6); B(c, 188, 112, 24, 60, 8, '#ffe27a', 0);
      alpha(c, .4, () => E(c, 150, 140, 26, 10, '#fff', 0, -.4));
    },
    bot: [['ME AFTER FINISHING', 'ONE PAGE OF HOMEWORK'], ['"IT WILL HOLD"', 'IT WILL NOT HOLD'], ['ENGINEERING CLASS', 'FINAL PROJECT'], ['MY GRADES', 'HOLDING ON SOMEHOW'], ['WHEN YOU BUILD', 'WITHOUT THE INSTRUCTIONS'], ['PERFECTLY', 'STABLE']]
  },
  {
    id: 'board', name: 'Owl teacher', bx: [{ k: 'Chalkboard', x: .15, y: .14, w: .7, h: .44, st: 'chalk' }, { k: 'Bottom text', x: .03, y: .76, w: .94, h: .22, st: 'meme', a: 'b' }],
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#f3dcb8', '#e6c494']));
      F(c, 'M0 400 H640 V480 H0 Z', '#a8743e', 0); SK(c, 'M0 400 H640', OL, 6);
      B(c, 70, 40, 500, 260, 10, '#8a5a2e', 6); B(c, 86, 56, 468, 228, 6, LG(c, 0, 56, 0, 284, ['#2f6a4a', '#24553a']), 4);
      alpha(c, .12, () => { SK(c, 'M110 90 q60 30 140 0 M300 250 q80 -20 200 10', '#fff', 10); });
      B(c, 90, 300, 460, 16, 4, '#a8743e', 5); B(c, 160, 296, 26, 8, 3, '#fff', 0); B(c, 210, 296, 18, 8, 3, '#ffd23a', 0);
      shadow(c, 520, 466, 90, 12);
      E(c, 520, 400, 80, 76, '#9a6a3e', 6); E(c, 520, 420, 50, 52, '#e8cfa2', 0);
      SK(c, 'M500 410 q10 8 20 0 q10 8 20 0 M500 432 q10 8 20 0 q10 8 20 0', '#b88e5c', 3);
      F(c, 'M446 330 L464 280 L488 316 Z', '#9a6a3e', 6); F(c, 'M594 330 L576 280 L552 316 Z', '#9a6a3e', 6);
      E(c, 520, 340, 80, 66, '#9a6a3e', 6);
      Ci(c, 490, 336, 28, '#fff2d6', 5); Ci(c, 550, 336, 28, '#fff2d6', 5);
      eye(c, 490, 338, 15, 'o', -.6, 0); eye(c, 550, 338, 15, 'o', -.6, 0);
      Ci(c, 490, 336, 30, null, 4); Ci(c, 550, 336, 30, null, 4); SK(c, 'M520 330 L520 330', OL, 4); SK(c, 'M516 334 Q520 326 524 334', OL, 4);
      F(c, 'M510 362 L530 362 L520 384 Z', '#ffb02e', 4);
      F(c, 'M446 380 C410 350 380 330 360 300 L372 292 C400 320 430 340 456 360 Z', '#9a6a3e', 5);
      SK(c, 'M366 296 L300 240', '#6a3a18', 7);
    },
    bot: [['THE TEST IS TOMORROW', 'NOBODY TOLD ME'], ['2 + 2 = FISH', 'TRUST ME'], ['RULE 1: NO PHONES', 'ME, CHECKING MY PHONE'], ['TODAY WE LEARN FRACTIONS', 'HALF OF US ARE ASLEEP'], ['HOMEWORK: EVERYTHING', 'DUE: YESTERDAY'], ['PLEASE STOP', 'ASKING WHEN LUNCH IS']]
  },
  {
    id: 'rain', name: 'Frog in the rain', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#7a8fa8', '#b8c8d8']));
      E(c, 120, 60, 120, 44, '#9aa8ba', 0); E(c, 220, 70, 100, 40, '#a8b5c6', 0); E(c, 520, 50, 140, 50, '#9aa8ba', 0);
      F(c, 'M0 300 H640 V480 H0 Z', LG(c, 0, 300, 0, 480, ['#4a8aa8', '#2e6a88']), 0); SK(c, 'M0 300 H640', OL, 5);
      [[120, 360, 40], [520, 420, 54], [420, 340, 28]].forEach(([x, y, r]) => { alpha(c, .5, () => E(c, x, y, r, r * .3, null, 3)); SK(c, new Path2D(`M${x - r} ${y} a${r} ${r * .3} 0 1 0 ${r * 2} 0 a${r} ${r * .3} 0 1 0 ${-r * 2} 0`), '#a8d4ea', 3); });
      F(c, 'M180 400 C180 340 460 340 460 400 C460 440 180 440 180 400 Z M320 400 L360 360 L330 360 Z', '#4aa84a', 6);
      E(c, 320, 352, 96, 62, '#6ac84a', 6); E(c, 320, 368, 60, 40, '#d8f0a8', 0);
      E(c, 252, 396, 34, 16, '#6ac84a', 5); E(c, 388, 396, 34, 16, '#6ac84a', 5);
      Ci(c, 280, 290, 28, '#6ac84a', 6); Ci(c, 360, 290, 28, '#6ac84a', 6);
      eye(c, 280, 290, 15, 'happy'); eye(c, 360, 290, 15, 'happy');
      mouth(c, 320, 332, 80, 'smile'); blush(c, 262, 326); blush(c, 378, 326);
      SK(c, 'M384 340 C400 300 404 200 400 150', '#4a7a2a', 7);
      F(c, 'M250 170 C280 90 520 90 550 170 C520 150 500 150 480 168 C460 148 440 148 420 168 C400 148 380 148 360 168 C340 150 300 150 250 170 Z', '#3fa34d', 6);
      SK(c, 'M400 104 L400 160 M330 120 L362 162 M470 120 L440 162', '#2a7a3a', 4);
      rain(c, 90, 7, 'rgba(230,240,255,.75)');
    },
    bot: [['WHEN IT RAINS', 'AND YOU DON\'T HAVE PE'], ['ME WHEN', 'THE WEEKEND FINALLY COMES'], ['IT\'S NOT MUCH', 'BUT IT\'S MY UMBRELLA'], ['FORECAST: RAIN', 'ME: PERFECT'], ['STAYING POSITIVE', 'IN A SOGGY WORLD'], ['RAIN ON MY FACE?', 'SKIN CARE']]
  },
  {
    id: 'fry', name: 'Pigeon with a fry', bx: TB,
    draw(c) {
      fill(c, '#c86a4a');
      for (let y = 0; y < 300; y += 30) for (let x = (y / 30) % 2 ? -30 : 0; x < PW; x += 60) B(c, x + 2, y + 2, 56, 26, 2, (x + y) % 120 ? '#d27a58' : '#bf5e40', 0);
      F(c, 'M0 300 H640 V480 H0 Z', LG(c, 0, 300, 0, 480, ['#b4b8c0', '#8e939c']), 0); SK(c, 'M0 300 H640', OL, 6);
      for (let x = 0; x < PW; x += 160) SK(c, `M${x} 300 L${x - 60} 480`, '#7a7f88', 3);
      const bird = (x, y, s, f, look, big) => {
        c.save(); c.translate(x, y); c.scale(f * s, s);
        shadow(c, 0, 92, 70, 12);
        SK(c, 'M-14 70 L-18 92 M14 70 L18 92', '#ff8a6a', 6);
        E(c, 0, 30, 64, 52, '#8a94a8', 6); F(c, 'M-60 30 C-40 50 0 60 30 50 C10 40 -20 30 -60 30 Z', '#6a7488', 4);
        E(c, 30, -24, 34, 32, '#7a849a', 6); alpha(c, .6, () => E(c, 22, 4, 24, 10, '#5ad0a0', 0));
        F(c, 'M60 -26 L80 -20 L60 -14 Z', '#f2b84a', 4);
        eye(c, 40, -32, big ? 13 : 10, big ? 'w' : 'o', look, 0);
        c.restore();
      };
      bird(110, 310, .9, 1, 1, true); bird(530, 300, .95, -1, 1, true); bird(210, 380, .8, 1, 1, true);
      bird(380, 330, 1.25, -1, -1);
      c.save(); c.translate(286, 290); c.rotate(-.25); B(c, -86, -9, 120, 18, 4, '#ffd23a', 5); alpha(c, .4, () => B(c, -80, -6, 100, 5, 2, '#fff', 0)); c.restore();
    },
    bot: [['WHEN YOU OPEN', 'A BAG OF CHIPS IN CLASS'], ['ME WITH THE LAST FRY', 'MY FAMILY:'], ['NOBODY:', 'THE ENTIRE GROUP CHAT:'], ['I FOUND IT', 'SO IT\'S MINE'], ['SHARING IS CARING', 'BUT NOT TODAY'], ['ME ENTERING THE CAFETERIA', 'WITH SNACKS']]
  },
  {
    id: 'king', name: 'Trash king', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#231a4a', '#4a2f6a']));
      stars(c, 40, 3, 200); Ci(c, 520, 80, 44, '#fff5c8', 0); alpha(c, .2, () => Ci(c, 520, 80, 70, '#fff5c8', 0));
      for (let y = 160; y < 380; y += 28) for (let x = (y / 28) % 2 ? -28 : 0; x < PW; x += 56) alpha(c, .5, () => B(c, x + 2, y + 2, 52, 24, 2, '#5a3a6a', 0));
      F(c, 'M0 380 H640 V480 H0 Z', '#2e2440', 0); SK(c, 'M0 380 H640', OL, 6);
      c.fillStyle = RG(c, 320, 250, 260, ['rgba(255,230,140,.35)', 'rgba(255,230,140,0)']); c.fillRect(0, 0, PW, PH);
      shadow(c, 320, 452, 140, 18, .35);
      F(c, 'M200 300 L440 300 L420 450 L220 450 Z', LG(c, 200, 0, 440, 0, ['#8c97aa', '#c8d0dc', '#7a8496']), 6);
      SK(c, 'M260 310 L252 440 M320 310 V440 M380 310 L388 440', '#6a7488', 5);
      E(c, 320, 300, 128, 22, '#a8b2c2', 6);
      c.save(); c.translate(430, 230); c.rotate(.6); E(c, 0, 0, 120, 20, '#b8c2d2', 6); B(c, -20, -32, 40, 14, 6, '#8c97aa', 5); c.restore();
      E(c, 320, 250, 82, 74, '#8a8a96', 6);
      F(c, 'M250 200 L262 150 L296 186 Z M390 200 L378 150 L344 186 Z', '#8a8a96', 6);
      F(c, 'M250 232 C270 208 300 214 320 236 C340 214 370 208 390 232 C380 262 350 268 320 252 C290 268 260 262 250 232 Z', '#2e2a36', 0);
      eye(c, 290, 236, 13, 'o', .3, 0); eye(c, 350, 236, 13, 'o', .3, 0);
      E(c, 320, 280, 34, 24, '#f2f2f6', 0); E(c, 320, 266, 10, 7, OL, 0); mouth(c, 320, 284, 26, 'smile');
      F(c, 'M262 186 L272 140 L296 166 L320 126 L344 166 L368 140 L378 186 Z', '#ffcf2e', 6);
      Ci(c, 320, 156, 7, '#ff4b5c', 3); Ci(c, 286, 170, 5, '#3a8bff', 3); Ci(c, 354, 170, 5, '#3fc46a', 3);
      E(c, 238, 310, 22, 16, '#8a8a96', 5); E(c, 402, 310, 22, 16, '#8a8a96', 5);
      F(c, 'M410 306 C440 270 470 280 480 250 C470 300 450 310 420 318 Z', '#ffe14d', 4); F(c, 'M410 306 C420 340 450 350 470 340 C450 330 436 320 420 318 Z', '#ffe14d', 4);
      [[200, 200], [450, 180], [180, 300]].forEach(([x, y]) => F(c, `M${x} ${y - 10} L${x + 3} ${y - 3} L${x + 10} ${y} L${x + 3} ${y + 3} L${x} ${y + 10} L${x - 3} ${y + 3} L${x - 10} ${y} L${x - 3} ${y - 3} Z`, '#ffe14d', 0));
    },
    bot: [['ME AFTER CLEANING', 'MY ROOM FOR 5 MINUTES'], ['RULER OF', 'THE LEFTOVERS'], ['WHEN THE CAFETERIA', 'HAS PIZZA DAY'], ['ONE PERSON\'S TRASH', 'IS MY KINGDOM'], ['I DECLARE THIS BIN', 'MY CASTLE'], ['BOW BEFORE', 'YOUR SNACK KING']]
  },
  {
    id: 'toast', name: 'Robot and the toast', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#e6f2f2', '#bcdcdc']));
      for (let y = 20; y < 300; y += 40) for (let x = 0; x < PW; x += 40) alpha(c, .35, () => B(c, x + 2, y + 2, 36, 36, 3, '#fff', 0));
      F(c, 'M0 330 H640 V480 H0 Z', LG(c, 0, 330, 0, 480, ['#e8e0d0', '#c8bca8']), 0); SK(c, 'M0 330 H640', OL, 6);
      B(c, 440, 250, 150, 100, 26, '#d8dce4', 6); B(c, 470, 238, 34, 18, 6, '#8a94a8', 5); B(c, 526, 238, 34, 18, 6, '#8a94a8', 5); B(c, 594, 280, 14, 40, 5, '#8a94a8', 5);
      alpha(c, .5, () => B(c, 456, 262, 40, 60, 14, '#fff', 0));
      alpha(c, .55, () => { F(c, 'M330 200 C300 160 350 140 320 100 C300 70 340 50 330 20 C370 60 340 90 360 120 C380 150 350 170 360 200 Z', '#7a7a86', 0); F(c, 'M380 190 C360 160 400 140 384 110 C420 140 396 170 400 190 Z', '#9a9aa6', 0); });
      shadow(c, 220, 440, 110, 16);
      B(c, 146, 290, 150, 140, 20, '#7aa4d8', 6); B(c, 170, 314, 100, 60, 10, '#5a84b8', 4); Ci(c, 196, 400, 9, '#ff4b5c', 4); Ci(c, 226, 400, 9, '#ffd23a', 4); Ci(c, 256, 400, 9, '#3fc46a', 4);
      SK(c, 'M220 160 L220 112', OL, 6); Ci(c, 220, 106, 12, '#ff4b5c', 5);
      B(c, 130, 156, 180, 124, 30, '#9ac4f0', 6); B(c, 152, 178, 136, 80, 18, '#1d2a44', 4);
      SK(c, 'M176 204 L202 214 M264 204 L238 214', '#7ae8ff', 7); SK(c, 'M190 238 Q220 226 250 238', '#7ae8ff', 6);
      alpha(c, .6, () => E(c, 270, 196, 8, 4, '#7ae8ff', 0));
      SK(c, 'M290 320 C330 300 340 250 330 232', OL, 14); SK(c, 'M290 320 C330 300 340 250 330 232', '#7aa4d8', 8);
      c.save(); c.translate(336, 214); c.rotate(.2); F(c, 'M-36 30 L-36 -14 C-46 -30 -30 -46 -8 -40 C4 -50 30 -50 36 -30 C46 -20 40 -10 36 -6 L36 30 Z', '#2a1a12', 6); alpha(c, .25, () => F(c, 'M-28 22 L-28 -10 L28 -10 L28 22 Z', '#5a3a2a', 0)); c.restore();
      SK(c, 'M150 320 C110 340 100 380 114 400', OL, 14); SK(c, 'M150 320 C110 340 100 380 114 400', '#7aa4d8', 8);
    },
    bot: [['ME TRYING TO COOK', 'FOR THE FIRST TIME'], ['TOAST SETTING: 10', 'WHAT WAS I THINKING'], ['WHEN THE RECIPE SAYS', '"EASY"'], ['ERROR 404', 'BREAKFAST NOT FOUND'], ['I CALL IT', 'EXTRA CRISPY'], ['FUTURE TECHNOLOGY', 'STILL BURNS TOAST']]
  },
  {
    id: 'sock', name: 'Moon sock', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#06081a', '#1a1d40']));
      stars(c, 120, 11, 340);
      Ci(c, 520, 110, 70, '#3a8bff', 6); F(c, 'M480 70 C500 90 520 70 540 90 C560 120 520 140 500 130 C480 120 470 100 480 70 Z M540 140 C560 130 580 150 570 170 C550 172 540 160 540 140 Z', '#3fc46a', 0); alpha(c, .35, () => E(c, 494, 84, 26, 14, '#fff', 0, -.6));
      F(c, 'M0 330 C120 300 220 320 320 310 C440 300 540 320 640 300 V480 H0 Z', LG(c, 0, 300, 0, 480, ['#c4c8d4', '#8e94a6']), 6);
      [[110, 400, 40], [470, 430, 30], [560, 360, 22], [260, 450, 18]].forEach(([x, y, r]) => { E(c, x, y, r, r * .35, '#9aa0b2', 4); alpha(c, .4, () => E(c, x, y + r * .08, r * .7, r * .2, '#6a7086', 0)); });
      shadow(c, 300, 440, 90, 14, .35);
      B(c, 250, 380, 40, 50, 14, '#e8ecf4', 6); B(c, 310, 380, 40, 50, 14, '#e8ecf4', 6);
      B(c, 228, 250, 144, 150, 50, '#f2f4fa', 6); B(c, 262, 280, 76, 50, 10, '#c8d0e0', 4); Ci(c, 282, 304, 7, '#ff4b5c', 0); Ci(c, 318, 304, 7, '#3fc46a', 0);
      SK(c, 'M236 290 C190 280 170 240 180 210', OL, 34); SK(c, 'M236 290 C190 280 170 240 180 210', '#f2f4fa', 24);
      Ci(c, 180, 200, 20, '#f2f4fa', 6);
      SK(c, 'M366 290 C410 310 420 340 410 360', OL, 34); SK(c, 'M366 290 C410 310 420 340 410 360', '#f2f4fa', 24);
      Ci(c, 300, 196, 76, '#f2f4fa', 6); E(c, 300, 200, 56, 46, LG(c, 0, 160, 0, 240, ['#ffd86a', '#e89a2a']), 5); alpha(c, .5, () => E(c, 280, 184, 22, 10, '#fff', 0, -.4));
      c.save(); c.translate(176, 150); c.rotate(-.15);
      F(c, 'M-18 -60 L18 -60 L18 10 C18 30 40 34 46 46 C52 62 30 70 10 60 C-6 52 -18 40 -18 20 Z', '#fff', 5);
      F(c, 'M-18 -44 L18 -44 L18 -32 L-18 -32 Z M-18 -20 L18 -20 L18 -8 L-18 -8 Z', '#ff4b5c', 0); F(c, 'M10 60 C30 70 52 62 46 46 C36 46 20 52 10 60 Z', '#3a8bff', 0);
      c.restore();
      [[150, 80], [140, 100], [200, 70]].forEach(([x, y]) => alpha(c, .8, () => Ci(c, x, y, 3, '#ffe14d', 0)));
    },
    bot: [['FOUND IT', 'SO THAT\'S WHERE MY SOCKS GO'], ['MISSION:', 'LAUNDRY'], ['ONE SMALL STEP FOR MAN', 'ONE LOST SOCK FOR ME'], ['THE WASHING MACHINE', 'IS A PORTAL'], ['MOM SAID', 'LOOK EVERYWHERE'], ['HOUSTON', 'I FOUND THE OTHER ONE']]
  },
  {
    id: 'pool', name: 'Shark in a kiddie pool', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, 260, ['#6ac0ff', '#c8ecff']));
      Ci(c, 560, 70, 40, '#ffe14d', 5); E(c, 120, 80, 80, 26, '#fff', 0); E(c, 170, 66, 50, 24, '#fff', 0);
      for (let x = 0; x < PW; x += 34) B(c, x, 170, 26, 110, 4, '#f4e2c4', 4);
      B(c, 0, 200, PW, 12, 0, '#e0c8a0', 3);
      F(c, 'M0 270 H640 V480 H0 Z', LG(c, 0, 270, 0, 480, ['#6ad05a', '#3fa040']), 0); SK(c, 'M0 270 H640', OL, 6);
      shadow(c, 320, 440, 230, 30, .25);
      E(c, 320, 390, 220, 64, '#ff7ab0', 6); E(c, 320, 380, 190, 46, '#5ac8f0', 5);
      alpha(c, .4, () => SK(c, 'M180 384 q20 -8 40 0 t40 0 M400 372 q20 -8 40 0 t40 0', '#fff', 4));
      F(c, 'M180 380 C180 250 270 200 340 200 C420 200 470 260 470 380 Z', '#7a8ca8', 6);
      F(c, 'M300 210 L340 120 L370 210 Z', '#7a8ca8', 6);
      F(c, 'M210 380 C220 320 280 300 330 300 C390 300 440 320 450 380 Z', '#e8eef6', 0);
      eye(c, 270, 260, 14, 'o', .2, 0); eye(c, 390, 260, 14, 'o', -.2, 0);
      F(c, 'M250 320 C290 350 370 350 410 320 C390 336 270 336 250 320 Z', '#fff', 4);
      F(c, 'M260 322 L270 334 L280 324 L290 338 L300 326 L310 340 L320 327 L330 340 L340 326 L350 338 L360 324 L370 334 L380 322', null, 3);
      SK(c, 'M220 270 l-10 -6 M228 290 l-12 -2 M440 270 l10 -6', OL, 4);
      c.save(); c.translate(470, 370); B(c, -26, -18, 48, 34, 16, '#ffd23a', 5); Ci(c, 12, -26, 16, '#ffd23a', 5); F(c, 'M26 -26 L40 -22 L26 -18 Z', '#ff9a2e', 3); Ci(c, 14, -30, 3, OL, 0); c.restore();
    },
    bot: [['ME IN MY COMFORT ZONE', ''], ['WHEN YOU SIGN UP FOR', 'THE BEGINNER CLASS'], ['THE CLASSROOM', 'WHEN I WALK IN'], ['"THERE\'S NO PRESSURE"', 'THE PRESSURE:'], ['SUMMER HOLIDAYS', 'ON A BUDGET'], ['I FIT', 'IN HERE PERFECTLY']]
  },
  {
    id: 'race', name: 'Snail wins', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, 200, ['#8ad0ff', '#d8f2ff']));
      for (let x = 0; x < PW; x += 16) alpha(c, .9, () => Ci(c, x + 8, 150 + Math.sin(x) * 4, 9, ['#ff6a6a', '#ffd23a', '#6aa8ff', '#fff', '#6ac86a'][(x / 16) % 5], 0));
      B(c, 0, 160, PW, 40, 0, '#3a4a6a', 0);
      F(c, 'M0 200 H640 V480 H0 Z', '#d8644a', 0); SK(c, 'M0 200 H640', OL, 6);
      [270, 340, 410].forEach(y => SK(c, `M0 ${y} H640`, '#fff', 5));
      for (let i = 0; i < 12; i++) B(c, 100, 200 + i * 23.3, 18, 11.6, 0, i % 2 ? '#fff' : OL, 0);
      SK(c, 'M60 190 C90 260 110 300 150 330', '#ffffff', 6);
      shadow(c, 220, 330, 110, 14);
      F(c, 'M110 330 C110 300 130 290 170 290 L310 290 C330 290 340 310 330 330 Z', '#c8e06a', 6);
      Ci(c, 220, 246, 66, '#ff9a4a', 6); SK(c, 'M220 246 m0 -40 a40 40 0 1 1 -38 30 a26 26 0 1 1 22 -20 a12 12 0 1 1 10 6', '#c8641e', 6);
      SK(c, 'M136 300 L128 240 M150 296 L156 236', OL, 5); Ci(c, 126, 232, 12, '#fff', 4); Ci(c, 158, 228, 12, '#fff', 4); Ci(c, 130, 232, 5, OL, 0); Ci(c, 162, 228, 5, OL, 0);
      mouth(c, 132, 284, 24, 'smile');
      B(c, 190, 220, 60, 46, 6, '#fff', 4); F(c, 'M212 230 L222 226 L222 258 M214 258 L230 258', null, 4);
      motion(c, [[350, 300, 40, 0], [360, 316, 30, 0]], OL, 4);
      shadow(c, 520, 400, 80, 12);
      E(c, 520, 370, 76, 48, '#4aa84a', 6); SK(c, 'M480 350 L560 350 M470 380 L570 380 M520 326 V414', '#2a7a3a', 4);
      E(c, 604, 384, 30, 24, '#8ad06a', 6); eye(c, 610, 380, 9, 'shut');
      F(c, 'M560 300 l20 0 l-20 18 l20 0', null, 4); F(c, 'M590 270 l14 0 l-14 12 l14 0', null, 3);
    },
    bot: [['SLOW AND STEADY', 'WINS THE RACE'], ['ME FINISHING HOMEWORK', 'ONE MINUTE BEFORE CLASS'], ['WHEN YOU\'RE LATE', 'BUT EVERYONE ELSE IS LATER'], ['MY WIFI SPEED', 'STILL WON'], ['CONFIDENCE:', '100%'], ['NEVER GIVE UP', 'EVEN AT 1 KM PER WEEK']]
  },
  {
    id: 'fridge', name: 'Empty fridge', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#1a1830', '#2e2a4a']));
      F(c, 'M0 380 H640 V480 H0 Z', '#26223a', 0); SK(c, 'M0 380 H640', OL, 6);
      c.fillStyle = RG(c, 360, 250, 340, ['rgba(220,240,255,.55)', 'rgba(220,240,255,0)']); c.fillRect(0, 0, PW, PH);
      B(c, 300, 60, 220, 340, 14, '#e8f2ff', 6); B(c, 316, 76, 188, 306, 8, '#fdfefe', 4);
      [170, 260].forEach(y => B(c, 316, y, 188, 8, 3, '#b8d0e8', 3));
      B(c, 450, 220, 28, 38, 6, '#7ad06a', 4); B(c, 448, 212, 32, 12, 4, '#ff9a2e', 3);
      F(c, 'M520 60 L600 90 L600 410 L520 400 Z', '#c8d8ec', 6); B(c, 576, 180, 10, 90, 4, '#8a9ab0', 3);
      shadow(c, 220, 440, 140, 18, .35);
      E(c, 210, 340, 120, 110, '#7a4a2a', 6);
      Ci(c, 236, 190, 86, '#8a5a32', 6);
      Ci(c, 166, 122, 26, '#8a5a32', 6); Ci(c, 300, 116, 26, '#8a5a32', 6); Ci(c, 166, 122, 13, '#c88a5a', 0); Ci(c, 300, 116, 13, '#c88a5a', 0);
      E(c, 270, 222, 44, 34, '#c88a5a', 0); E(c, 296, 206, 16, 11, OL, 0);
      alpha(c, .16, () => E(c, 290, 186, 60, 66, '#dff0ff', 0));
      eye(c, 236, 174, 15, 'o', 1, -.2); eye(c, 296, 166, 15, 'o', 1, -.2);
      SK(c, 'M218 148 L248 156 M284 150 L312 142', OL, 6);
      F(c, 'M300 166 q8 14 0 22 q-8 -8 0 -22 Z', '#8fd4ff', 3);
      mouth(c, 276, 238, 30, 'frown');
      E(c, 314, 280, 30, 22, '#8a5a32', 6);
    },
    bot: [['ME CHECKING THE FRIDGE', 'FOR THE 10TH TIME'], ['MAYBE THIS TIME', 'FOOD WILL APPEAR'], ['WHEN SOMEONE ATE', 'MY LEFTOVERS'], ['ONE PICKLE', 'IS A MEAL, RIGHT?'], ['HUNGRY', 'BUT TOO LAZY TO COOK'], ['THE FRIDGE LIGHT', 'IS MY SUNRISE']]
  },
  {
    id: 'balloon', name: 'Cactus hug', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#ff9a5a', '#ffd08a', '#ffe8b0']));
      Ci(c, 120, 120, 50, '#fff4c8', 0); alpha(c, .25, () => Ci(c, 120, 120, 80, '#fff4c8', 0));
      F(c, 'M0 330 C120 290 240 310 340 300 C460 290 540 320 640 300 V480 H0 Z', '#f2c46a', 6);
      F(c, 'M0 390 C160 360 300 380 400 370 C500 360 580 380 640 370 V480 H0 Z', '#e8a84a', 0);
      shadow(c, 320, 430, 90, 14);
      B(c, 270, 170, 100, 260, 50, '#5ab84a', 6);
      SK(c, 'M300 190 V420 M340 190 V420', '#3a9a3a', 4);
      F(c, 'M272 300 C220 300 200 270 204 220 C206 200 236 200 236 220 C234 250 244 266 272 268 Z', '#5ab84a', 6);
      F(c, 'M368 280 C420 280 440 250 436 200 C434 180 404 180 404 200 C406 230 396 246 368 248 Z', '#5ab84a', 6);
      [[290, 200], [350, 230], [300, 320], [346, 360], [220, 240], [420, 210], [330, 280]].forEach(([x, y]) => SK(c, `M${x - 6} ${y} l-8 -4 M${x + 6} ${y} l8 -4 M${x} ${y - 6} l0 -8`, '#2a6a2a', 2.5));
      Ci(c, 320, 166, 18, '#ff6ab0', 4); Ci(c, 306, 160, 9, '#ffd23a', 0);
      eye(c, 300, 228, 13, 'w', .4, 0); eye(c, 340, 228, 13, 'w', .4, 0);
      mouth(c, 320, 262, 26, 'wavy'); sweat(c, 364, 196, .9);
      E(c, 340, 300, 80, 88, LG(c, 300, 220, 400, 380, ['#ff6a6a', '#e8233a']), 6, -.2);
      alpha(c, .55, () => E(c, 312, 262, 20, 30, '#fff', 0, -.4));
      SK(c, 'M380 386 C380 410 370 430 380 450', OL, 3);
      motion(c, [[436, 300, 26, -.3], [440, 330, 30, 0], [432, 360, 24, .3]], OL, 4);
    },
    bot: [['ME HUGGING MY FRIEND', 'AFTER THE TEST'], ['WHEN YOU LOVE SOMETHING', 'TOO MUCH'], ['ME HOLDING ON TO', 'MY LAST BRAIN CELL'], ['FRIENDSHIP', 'IS RISKY'], ['THIS IS FINE', 'TOTALLY FINE'], ['DON\'T POP', 'DON\'T POP, DON\'T POP']]
  },
  {
    id: 'interview', name: 'Job interview', bx: [{ k: 'Speech bubble', x: .52, y: .04, w: .44, h: .26, st: 'bubble' }, { k: 'Bottom text', x: .03, y: .76, w: .94, h: .22, st: 'meme', a: 'b' }],
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#dfe6ee', '#c4cfdc']));
      B(c, 40, 40, 200, 160, 6, '#a8d8ff', 6); for (let y = 54; y < 196; y += 16) B(c, 44, y, 192, 8, 2, '#f0f4f8', 0);
      Ci(c, 420, 210, 74, '#5a5a66', 6); F(c, 'M354 168 L364 112 L400 150 Z M486 168 L476 112 L440 150 Z', '#5a5a66', 6);
      F(c, 'M360 300 C360 260 380 250 420 250 C460 250 480 260 480 300 Z', '#2a3a5a', 6); F(c, 'M404 250 L420 290 L436 250 Z', '#fff', 0); F(c, 'M414 260 L426 260 L424 290 L416 290 Z', '#e8233a', 0);
      eye(c, 394, 206, 14, 'o', -.6, .2); eye(c, 446, 206, 14, 'o', -.6, .2);
      SK(c, 'M376 184 L404 192 M436 192 L464 184', OL, 5); F(c, 'M412 228 L428 228 L420 238 Z', '#ff8a9a', 3); mouth(c, 420, 248, 22, 'flat');
      SK(c, 'M380 226 L336 220 M380 236 L338 240 M460 226 L504 220 M460 236 L502 240', OL, 3);
      F(c, 'M220 300 L640 300 L640 480 L180 480 Z', LG(c, 0, 300, 0, 480, ['#a8743e', '#8a5a2e']), 6);
      c.save(); c.translate(470, 300); c.rotate(-.1); B(c, -40, -26, 80, 52, 3, '#fff', 4); SK(c, 'M-30 -12 H30 M-30 0 H20 M-30 12 H24', '#9fb0e8', 3); c.restore();
      F(c, 'M40 480 L60 380 L220 380 L240 480 Z', '#c84a4a', 6);
      shadow(c, 140, 384, 100, 10);
      E(c, 140, 300, 100, 90, 'rgba(200,236,255,.55)', 6); alpha(c, .7, () => F(c, 'M44 300 C60 360 220 360 236 300 C220 330 60 330 44 300 Z', '#5ac8f0', 0));
      F(c, 'M100 300 C110 270 160 260 180 290 L210 270 L206 316 L180 300 C160 330 110 330 100 300 Z', '#ff9a2e', 5);
      eye(c, 130, 292, 9, 'w', .5, 0); F(c, 'M150 314 L144 336 L156 336 Z', '#3a8bff', 3); F(c, 'M140 306 L160 306 L150 316 Z', '#3a8bff', 3);
      alpha(c, .5, () => E(c, 100, 250, 16, 30, '#fff', 0, .5));
    },
    bot: [['WHERE DO YOU SEE YOURSELF IN 5 YEARS?', 'IN A BIGGER BOWL'], ['ANY EXPERIENCE?', 'I SWIM IN CIRCLES PROFESSIONALLY'], ['WHY SHOULD WE HIRE YOU?', 'I NEVER TAKE LUNCH BREAKS'], ['TELL ME ABOUT YOUR SKILLS', 'BLUB'], ['YOU START MONDAY', 'MY BOSS IS A CAT'], ['WHAT IS YOUR WEAKNESS?', 'DRY LAND']]
  },
  {
    id: 'alarm', name: 'Alarm clock', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#ffd8a8', '#ffb88a']));
      B(c, 470, 40, 140, 140, 6, '#8ad0ff', 6); SK(c, 'M540 40 V180 M470 110 H610', OL, 5); Ci(c, 580, 80, 22, '#ffe14d', 0);
      F(c, 'M0 340 H640 V480 H0 Z', '#8a6aa8', 0); SK(c, 'M0 340 H640', OL, 6);
      F(c, 'M300 470 L300 330 C300 300 640 300 640 330 L640 470 Z', '#6a4a8a', 6);
      F(c, 'M300 380 C320 330 440 320 640 340 L640 480 L300 480 Z', LG(c, 0, 330, 0, 480, ['#ff8ab0', '#e85a8a']), 6);
      [[360, 400], [440, 420], [520, 395], [600, 425]].forEach(([x, y]) => Ci(c, x, y, 10, '#ffd0e0', 0));
      F(c, 'M340 380 C340 340 400 330 430 350 L430 380 Z', '#fff', 5);
      E(c, 390, 366, 40, 22, '#f2c49a', 5); F(c, 'M350 360 C356 330 420 326 430 356 Z', '#5a3a22', 5);
      eye(c, 378, 370, 8, 'w', -.8, 0); eye(c, 404, 370, 8, 'w', -.8, 0);
      shadow(c, 180, 440, 120, 16);
      c.save(); c.translate(180, 250); c.rotate(-.12);
      motion(c, [[-140, -80, 30, 3.6], [-150, -40, 30, 3.2], [140, -80, 30, -.5], [150, -40, 30, -.1]], OL, 5);
      F(c, 'M-110 -110 C-150 -150 -90 -190 -60 -150 Z', '#ffcf2e', 6); F(c, 'M110 -110 C150 -150 90 -190 60 -150 Z', '#ffcf2e', 6);
      SK(c, 'M-60 120 L-80 170 M60 120 L80 170', OL, 10);
      Ci(c, 0, 0, 140, '#ff4b5c', 6); Ci(c, 0, 0, 112, '#fff8ee', 5);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; SK(c, `M${Math.cos(a) * 96} ${Math.sin(a) * 96} L${Math.cos(a) * 106} ${Math.sin(a) * 106}`, OL, 5); }
      SK(c, 'M-70 -40 L-24 -20 M70 -40 L24 -20', OL, 9);
      eye(c, -44, -6, 16, 'o', .3, .3); eye(c, 44, -6, 16, 'o', -.3, .3);
      F(c, 'M-60 40 C-30 80 30 80 60 40 Z', '#7a2638', 5);
      F(c, 'M-50 44 L-40 58 L-30 46 L-18 62 L-6 48 L6 62 L18 48 L30 60 L40 46 L50 44 Z', '#fff', 0);
      SK(c, 'M0 0 L0 -60 M0 0 L40 -10', OL, 0);
      c.restore();
    },
    bot: [['ME: 5 MORE MINUTES', 'MY ALARM:'], ['MONDAY MORNING', 'HAS ARRIVED'], ['WHEN YOU HEAR', 'THE SCHOOL BELL'], ['SNOOZE BUTTON', 'IS MY BEST FRIEND'], ['IT\'S 7 A.M.', 'CHOOSE VIOLENCE'], ['I SET 9 ALARMS', 'I WOKE UP FOR NONE']]
  },
  {
    id: 'meteor', name: 'Dino coffee', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, PH, ['#ff7a3a', '#ffb86a', '#ffe0a0']));
      F(c, 'M380 300 L460 150 L500 160 L580 300 Z', '#8a5a4a', 6); F(c, 'M460 150 L480 120 L500 160 Z', '#ff5a2e', 4);
      alpha(c, .5, () => { E(c, 470, 100, 40, 24, '#a8a0a0', 0); E(c, 500, 70, 30, 20, '#a8a0a0', 0); });
      c.save(); c.translate(150, 90); c.rotate(.5);
      F(c, 'M0 -20 L180 -10 L180 10 L0 20 Z', LG(c, 0, 0, 180, 0, ['#ffe14d', 'rgba(255,90,46,0)']), 0);
      Ci(c, 0, 0, 28, '#7a5a4a', 6); Ci(c, -8, -6, 7, '#5a3a2a', 0); Ci(c, 8, 10, 5, '#5a3a2a', 0);
      c.restore();
      F(c, 'M0 340 H640 V480 H0 Z', LG(c, 0, 340, 0, 480, ['#8ab04a', '#6a9038']), 0); SK(c, 'M0 340 H640', OL, 6);
      SK(c, 'M80 340 C70 280 90 220 110 190', '#8a5a2a', 12); [[-1.2], [-.4], [.4], [1.2], [2.6]].forEach(([a]) => F(c, `M110 190 q${Math.cos(a - 1.57) * 60} ${Math.sin(a - 1.57) * 30 - 10} ${Math.cos(a - 1.57) * 90} ${Math.sin(a - 1.57) * 50 + 20} q${-Math.cos(a - 1.57) * 40} -10 ${-Math.cos(a - 1.57) * 90} ${-Math.sin(a - 1.57) * 50 - 20} Z`, '#3fa34d', 4));
      shadow(c, 310, 440, 150, 18);
      F(c, 'M200 420 C180 380 190 300 240 270 C200 250 190 200 220 170 C250 130 330 130 360 160 C390 190 380 240 340 260 C390 290 420 340 420 420 Z', '#4aa86a', 6);
      F(c, 'M400 400 C460 400 520 410 560 440 C500 440 450 430 410 430 Z', '#4aa86a', 6);
      E(c, 300, 350, 60, 70, '#c8e8a8', 0);
      B(c, 230, 420, 50, 26, 10, '#4aa86a', 5); B(c, 330, 420, 50, 26, 10, '#4aa86a', 5);
      eye(c, 260, 186, 12, 'shut'); eye(c, 320, 182, 12, 'shut');
      mouth(c, 296, 222, 44, 'smile');
      SK(c, 'M250 290 L280 300', OL, 6); SK(c, 'M346 286 L330 296', OL, 6);
      B(c, 276, 290, 44, 50, 8, '#fff', 5); SK(c, 'M320 300 C340 300 340 326 320 326', OL, 5); E(c, 298, 294, 18, 4, '#7a4a2a', 0);
      alpha(c, .6, () => SK(c, 'M290 282 q-6 -10 0 -18 q6 -8 0 -16 M304 282 q-6 -10 0 -18', '#fff', 3));
      [[250, 230], [216, 260]].forEach(([x, y]) => Ci(c, x, y, 4, '#2a7a4a', 0));
    },
    bot: [['ME DURING THE GROUP PROJECT', 'WHEN NOBODY ELSE HELPS'], ['WHEN YOU STUDIED', 'AND THE TEST IS TODAY'], ['"WE NEED TO TALK"', 'ME:'], ['STAYING CALM', 'BECAUSE IT\'S FRIDAY'], ['THE DEADLINE', 'ME AND MY COFFEE'], ['TODAY\'S FORECAST', 'COFFEE FIRST']]
  },
  {
    id: 'ducks', name: 'Duck parade', bx: TB,
    draw(c) {
      fill(c, LG(c, 0, 0, 0, 200, ['#9ad8ff', '#d8f2ff']));
      F(c, 'M0 180 C120 150 220 170 320 160 C440 150 540 170 640 150 V240 H0 Z', '#6ac86a', 0);
      F(c, 'M0 240 H640 V480 H0 Z', '#5a6070', 0); SK(c, 'M0 240 H640', OL, 6);
      for (let x = 30; x < PW; x += 90) B(c, x, 330, 54, 120, 4, '#f4f4f0', 0);
      alpha(c, .25, () => B(c, 0, 250, PW, 10, 0, '#fff', 0));
      const duck = (x, y, s, kid, glasses) => {
        c.save(); c.translate(x, y); c.scale(s, s);
        shadow(c, 0, 66, 56, 10);
        F(c, 'M-24 56 L-30 70 L-10 70 Z M10 56 L4 70 L24 70 Z', '#ff9a2e', 4);
        E(c, 0, 26, 58, 40, kid ? '#ffe14d' : '#fff', 6);
        F(c, 'M-58 20 L-84 8 L-60 38 Z', kid ? '#ffe14d' : '#fff', 5);
        Ci(c, 34, -26, 30, kid ? '#ffe14d' : '#fff', 6);
        F(c, 'M58 -26 C80 -30 90 -20 84 -14 C74 -10 64 -12 56 -14 Z', '#ff9a2e', 4);
        if (glasses) { B(c, 22, -42, 24, 16, 6, OL, 0); B(c, 50, -42, 22, 16, 6, OL, 0); SK(c, 'M14 -36 L74 -36', OL, 4); alpha(c, .5, () => B(c, 26, -40, 8, 5, 2, '#fff', 0)); }
        else eye(c, 42, -32, kid ? 7 : 6, 'dot');
        F(c, 'M-26 16 C-10 0 20 4 26 20 C10 30 -16 30 -26 16 Z', kid ? '#f2c82e' : '#e8eef6', 3);
        c.restore();
      };
      duck(500, 300, 1.15, false); duck(380, 340, .6, true); duck(300, 330, .6, true); duck(220, 350, .6, true);
      c.save(); c.translate(100, 330); c.rotate(-.08); duck(0, 0, .62, true, true); c.restore();
      B(c, 52, 388, 100, 12, 6, '#ff4b5c', 4); Ci(c, 70, 404, 8, OL, 0); Ci(c, 132, 404, 8, OL, 0);
    },
    bot: [['THE CLASS ON A FIELD TRIP', 'AND ME AT THE BACK'], ['FOLLOW THE LEADER', 'BUT MAKE IT COOL'], ['MY FAMILY', 'AND ME ON HOLIDAY'], ['MOM: STAY IN LINE', 'ME:'], ['EVERY GROUP HAS', 'THAT ONE FRIEND'], ['TOO COOL', 'FOR THE PARADE']]
  }
];
const SC_BY = new Map(SCENES.map(s => [s.id, s]));
const GENERIC = [['ME', 'ON A MONDAY'], ['WHEN THE WIFI', 'GOES DOWN'], ['NOBODY:', 'ABSOLUTELY NOBODY:'], ['ME TRYING TO LOOK BUSY', 'WHEN THE TEACHER WALKS BY'], ['HOW IT STARTED', 'HOW IT\'S GOING'], ['WHEN YOU REMEMBER', 'THE HOMEWORK IS DUE TODAY'], ['MY FACE WHEN', 'THE BELL RINGS'], ['THIS IS', 'MY FINAL FORM'], ['WHEN YOU FINALLY', 'FIND THE REMOTE'], ['ME EXPLAINING', 'WHY I\'M LATE'], ['THE GROUP CHAT', 'AT MIDNIGHT'], ['WHEN SOMEONE SAYS', '"ONE MORE GAME"'], ['ME AFTER', 'ONE PUSH-UP'], ['WHEN THE TEACHER', 'PICKS ME TO ANSWER'], ['ME PRETENDING', 'TO UNDERSTAND'], ['WEEKEND ME', 'VS SCHOOL ME']];
const scCache = new Map();
function scenePic(id) {
  let cv = scCache.get(id);
  if (cv) return cv;
  const s = SC_BY.get(id) || SCENES[0];
  cv = document.createElement('canvas'); cv.width = PW; cv.height = PH;
  const c = cv.getContext('2d');
  try { s.draw(c); } catch (e) { console.error(e); c.fillStyle = '#334'; c.fillRect(0, 0, PW, PH); }
  scCache.set(id, cv);
  return cv;
}

const OPT0 = { rounds: 5, wt: 60, vt: 8, bots: 3, pics: 'mix' };
const RATES = [['Nope', '#8a94a8'], ['Meh', '#3d8be0'], ['Okay', '#2fae55'], ['Funny', '#f09a10'], ['Legendary', '#e8364d']];
const PTS_PER_STAR = 20, TOP_BONUS = 100;
const boxesOf = pic => pic && pic.k === 't' && SC_BY.has(pic.id) ? SC_BY.get(pic.id).bx : TB;
const hasText = t => Array.isArray(t) && t.some(x => typeof x === 'string' && x.trim());

function planPics(nr, mode, ups) {
  const sc = shuf(SCENES.map(s => s.id));
  const u = shuf((ups || []).filter(x => x && typeof x.id === 'string'));
  const nu = mode === 'builtin' || !u.length ? 0 : mode === 'mine' ? Math.min(u.length, nr) : Math.min(u.length, Math.ceil(nr / 2));
  const list = u.slice(0, nu).map(x => ({ k: 'u', id: x.id, w: x.w | 0, h: x.h | 0 }));
  let i = 0;
  while (list.length < nr) list.push({ k: 't', id: sc[i++ % sc.length] });
  if (mode === 'mine') return list;
  return shuf(list);
}

function botCaption(pic, used) {
  const bx = boxesOf(pic), s = pic && pic.k === 't' ? SC_BY.get(pic.id) : null;
  let out;
  if (s && s.botPairs) {
    const p = s.botPairs.filter(x => !used.has(x.join('|')));
    const q = p.length ? pick(p) : pick(s.botPairs);
    used.add(q.join('|'));
    out = [Math.random() < .45 ? pick(s.bot)[0] : '', q[0], q[1]];
  } else {
    const pool = (s ? s.bot : []).concat(s && Math.random() < .7 ? [] : GENERIC).filter(x => !used.has(x.join('|')));
    const q = pool.length ? pick(pool) : pick(GENERIC);
    used.add(q.join('|'));
    out = q.slice();
  }
  while (out.length < bx.length) out.push('');
  return out.slice(0, bx.length);
}

function ctEngine(seats, opt, loaded, ups) {
  const o = Object.assign({}, OPT0, opt || {});
  const n = seats.length;
  let st = loaded, ver = 1;
  const bump = () => { ver++; };
  if (!st) {
    const nr = clamp(o.rounds | 0, 1, 10);
    st = {
      g: 'ct', T: 0, o: { rounds: nr, wt: clamp(+o.wt || 60, 20, 180), vt: clamp(+o.vt || 8, 4, 20) },
      ph: 'intro', rd: 1, dl: 3200, tot: 3200, pics: planPics(nr, o.pics, ups),
      P: seats.map((s, i) => ({ n: String(s.name || 'Player').slice(0, 16), bot: !!s.bot, c: i, pts: 0, gain: 0, pr: i, r: i, top: 0, best: 0 })),
      cap: Array(n).fill(null), dr: Array(n).fill(null), done: Array(n).fill(false), bt: Array(n).fill(0), memes: [], vi: 0, hall: [], used: []
    };
  }
  const P = st.P;
  const pic = () => st.pics[st.rd - 1] || { k: 't', id: SCENES[0].id };
  const nbox = () => boxesOf(pic()).length;
  const rank = () => {
    const ord = P.map((p, i) => i).sort((a, b) => P[b].pts - P[a].pts || a - b);
    ord.forEach((s, r) => { P[s].r = r; });
    return ord;
  };
  const go = (ph, ms) => { st.ph = ph; st.dl = st.tot = ms; bump(); };

  function startWrite() {
    st.cap = Array(n).fill(null); st.dr = Array(n).fill(null); st.done = Array(n).fill(false);
    st.bt = P.map(p => p.bot ? rr(.25, .85) * st.o.wt * 1000 : 0);
    go('write', st.o.wt * 1000);
  }
  function botCap(s) {
    const used = new Set(st.used || []);
    const c = botCaption(pic(), used);
    st.used = [...used].slice(-80);
    st.cap[s] = c; st.done[s] = true;
  }
  function startMeme() {
    while (st.vi < st.memes.length && st.memes[st.vi].hid) st.vi++;
    if (st.vi >= st.memes.length) return finishRound();
    const m = st.memes[st.vi];
    m.rt = P.map((p, i) => p.bot && i !== m.s ? rr(1100, 4300) : 0);
    go('vote', st.o.vt * 1000);
  }
  function endWrite() {
    const list = [];
    for (let s = 0; s < n; s++) {
      if (!hasText(st.cap[s]) && st.dr && hasText(st.dr[s])) st.cap[s] = st.dr[s];
      if (!hasText(st.cap[s]) && P[s].bot) botCap(s);
    }
    for (let s = 0; s < n; s++) if (hasText(st.cap[s])) list.push({ s, t: st.cap[s].slice(), r: Array(n).fill(0), hid: false, g: 0, top: false, rt: [] });
    st.memes = shuf(list); st.vi = 0;
    if (st.memes.length >= 2) startMeme();
    else finishRound();
  }
  function applyRound() {
    st.memes.forEach(m => { if (m.g) { P[m.s].pts -= m.g; } m.g = 0; m.top = false; });
    let best = 0;
    st.memes.forEach(m => {
      let sum = 0, cnt = 0;
      m.r.forEach((r, i) => { if (r > 0 && i !== m.s) { sum += r; cnt++; } });
      m.sum = sum; m.cnt = cnt; m.avg = cnt ? Math.round(sum / cnt * 10) / 10 : 0;
      m.base = m.hid ? 0 : sum * PTS_PER_STAR;
      if (m.base > best) best = m.base;
    });
    P.forEach(p => { p.gain = 0; });
    st.memes.forEach(m => {
      m.top = !m.hid && best > 0 && m.base === best && st.memes.length >= 2;
      m.g = m.base + (m.top ? TOP_BONUS : 0);
      P[m.s].pts += m.g; P[m.s].gain += m.g;
    });
    const tops = st.memes.filter(m => m.top);
    st.hall = st.hall.filter(h => h.rd !== st.rd);
    if (tops.length) { const m = tops.slice().sort((a, b) => b.avg - a.avg)[0]; st.hall.push({ rd: st.rd, pic: pic(), t: m.t.slice(), s: m.s, avg: m.avg }); }
    P.forEach(p => { p.top = 0; });
    st.hall.forEach(h => { if (P[h.s]) P[h.s].top++; });
    rank();
  }
  function finishRound() {
    P.forEach(p => { p.pr = p.r; });
    applyRound();
    st.memes.forEach(m => { const p = P[m.s]; if (!m.hid && m.avg > p.best) p.best = m.avg; });
    go('res', Math.min(12000, 7000 + 700 * st.memes.length));
  }
  function advance() {
    if (st.ph === 'intro') startWrite();
    else if (st.ph === 'write') endWrite();
    else if (st.ph === 'vote') { st.vi++; startMeme(); }
    else if (st.ph === 'res') { if (st.rd >= st.o.rounds) { rank(); go('over', 0); } else go('board', 5500); }
    else if (st.ph === 'board') { st.rd++; st.memes = []; st.vi = 0; go('intro', 3200); }
  }

  const E = {
    st, get ver() { return ver; }, get over() { return st.ph === 'over'; },
    step(dt) {
      if (st.ph === 'over') return;
      st.T += dt;
      if (st.ph === 'write') {
        for (let s = 0; s < n; s++) if (P[s].bot && !st.done[s]) { st.bt[s] -= dt; if (st.bt[s] <= 0) { botCap(s); bump(); } }
        if (st.done.every(Boolean) && st.dl > 900) { st.dl = 900; bump(); }
      } else if (st.ph === 'vote') {
        const m = st.memes[st.vi];
        if (m) {
          for (let s = 0; s < n; s++) if (P[s].bot && s !== m.s && !m.r[s]) {
            m.rt[s] = (m.rt[s] || 0) - dt;
            if (m.rt[s] <= 0) {
              const len = m.t.join(' ').trim().length;
              m.r[s] = clamp(Math.round(3.2 + gauss() * 1.05 + (len > 10 && len < 60 ? .35 : -.4)), 1, 5); bump();
            }
          }
          if (m.r.every((r, i) => i === m.s || r > 0) && st.dl > 650) { st.dl = 650; bump(); }
        }
      }
      st.dl -= dt;
      if (st.dl <= 0) advance();
    },
    act(s, a, boss) {
      if (!a || typeof a !== 'object' || s < 0 || s >= n) return false;
      if (a.k === 'cap') {
        if (st.ph !== 'write' || !Array.isArray(a.t)) return false;
        const t = [];
        for (let i = 0; i < nbox(); i++) t.push(ctClean(typeof a.t[i] === 'string' ? a.t[i] : ''));
        if (!hasText(t)) return false;
        st.cap[s] = t; st.done[s] = true; bump(); return true;
      }
      if (a.k === 'draft') {
        if (st.ph !== 'write' || st.done[s] || !Array.isArray(a.t)) return false;
        if (!st.dr) st.dr = Array(n).fill(null);
        const t = [];
        for (let i = 0; i < nbox(); i++) t.push(ctClean(typeof a.t[i] === 'string' ? a.t[i] : ''));
        st.dr[s] = hasText(t) ? t : null; return true;
      }
      if (a.k === 'edit') { if (st.ph !== 'write' || !st.done[s]) return false; st.done[s] = false; bump(); return true; }
      if (a.k === 'rate') {
        const m = st.memes[st.vi], r = a.r | 0;
        if (st.ph !== 'vote' || !m || m.s === s || m.r[s] || r < 1 || r > 5 || a.i !== st.vi) return false;
        m.r[s] = r; bump(); return true;
      }
      if (a.k === 'skip') { if (!boss || st.ph === 'over') return false; advance(); return true; }
      if (a.k === 'hide') {
        const m = st.memes[a.i | 0];
        if (!boss || !m || m.hid || !['vote', 'res', 'board', 'over'].includes(st.ph)) return false;
        m.hid = true;
        if (st.ph === 'vote' && (a.i | 0) === st.vi) { st.vi++; startMeme(); }
        else if (st.ph !== 'vote') applyRound();
        bump(); return true;
      }
      return false;
    },
    setBot(s) {
      if (!P[s] || P[s].bot) return;
      P[s].bot = true;
      if (st.ph === 'write' && !st.done[s]) st.bt[s] = rr(1500, 6000);
      if (st.ph === 'vote') { const m = st.memes[st.vi]; if (m && m.rt) m.rt[s] = rr(800, 2500); }
      bump();
    },
    view(s) {
      const v = { ph: st.ph, rd: st.rd, nr: st.o.rounds, left: Math.max(0, st.dl), tot: st.tot, me: s, np: n, pic: pic(), o: st.o, names: P.map(p => ({ n: p.n, c: p.c, bot: p.bot, pts: p.pts, gain: p.gain })), my: { pts: P[s] ? P[s].pts : 0 } };
      if (st.ph === 'write' || st.ph === 'intro') { v.done = st.done.slice(); v.mine = st.cap[s] ? st.cap[s].slice() : null; v.sent = !!st.done[s]; }
      if (st.ph === 'vote') {
        const m = st.memes[st.vi];
        v.vm = { i: st.vi, n: st.memes.filter(x => !x.hid).length, k: st.memes.slice(0, st.vi).filter(x => !x.hid).length + 1, t: m.t.slice(), mine: m.s === s, my: m.r[s] || 0, cnt: m.r.filter((r, i) => r > 0 && i !== m.s).length, nv: n - 1 };
      }
      if (st.ph === 'res' || st.ph === 'board' || st.ph === 'over') {
        v.res = st.memes.map((m, i) => ({ i, t: m.hid ? null : m.t.slice(), s: m.s, n: P[m.s].n, c: m.s, bot: P[m.s].bot, avg: m.avg || 0, cnt: m.cnt || 0, g: m.g || 0, top: !!m.top, hid: m.hid }))
          .sort((a, b) => (b.top - a.top) || (b.g - a.g) || (b.avg - a.avg) || a.i - b.i);
        const ord = P.map((p, i) => i).sort((a, b) => P[b].pts - P[a].pts || a - b);
        v.board = ord.map((q, r) => ({ s: q, n: P[q].n, c: q, bot: P[q].bot, pts: P[q].pts, gain: P[q].gain, r, pr: P[q].pr, top: P[q].top }));
      }
      if (st.ph === 'over') {
        v.hall = st.hall.map(h => ({ rd: h.rd, pic: h.pic, t: h.t.slice(), n: P[h.s] ? P[h.s].n : '', c: h.s, avg: h.avg }));
        v.pod = v.board.map(b => ({ i: b.s, n: b.n, c: b.c, bot: b.bot, pts: b.pts, r: b.r, top: b.top, best: P[b.s].best }));
      }
      return v;
    }
  };
  rank();
  return E;
}

const MEME_FONT = 'Impact, Anton, Haettenschweiler, "Arial Narrow", "Franklin Gothic Heavy", "Arial Black", sans-serif';
const SANS_FONT = '"Arial Black", "Segoe UI", Roboto, Arial, sans-serif';
const CHALK_FONT = '"Segoe Print", "Chalkboard SE", "Comic Sans MS", "Bradley Hand", cursive';
function wrapText(c, s, maxW) {
  const words = s.split(' ').filter(Boolean), lines = [];
  let cur = '';
  for (let w of words) {
    while (c.measureText(w).width > maxW && w.length > 1) {
      let k = w.length - 1;
      while (k > 1 && c.measureText(w.slice(0, k)).width > maxW) k--;
      if (cur) { lines.push(cur); cur = ''; }
      lines.push(w.slice(0, k)); w = w.slice(k);
    }
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function fitText(c, s, w, h, font, maxPx, minPx) {
  let size = maxPx, lines = [];
  for (; size >= minPx; size -= 2) {
    c.font = font.replace('$', size);
    lines = wrapText(c, s, w);
    if (lines.length * size * 1.08 <= h) break;
  }
  if (size < minPx) { size = minPx; c.font = font.replace('$', size); lines = wrapText(c, s, w); }
  return { size, lines };
}
function drawBox(c, b, s, W, H, ghost) {
  const x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H, k = W / PW;
  s = String(s || '').trim();
  if (b.st === 'bubble') {
    if (!s && !ghost) return;
    c.save();
    const p = rrp(new Path2D(), x, y, w, h, 18 * k);
    p.moveTo(x + w * .3, y + h - 2); p.lineTo(x + w * .2, y + h + 34 * k); p.lineTo(x + w * .45, y + h - 2);
    c.fillStyle = s ? '#fff' : 'rgba(255,255,255,.55)'; c.fill(p); c.lineWidth = 4 * k; c.strokeStyle = OL; if (!s) c.setLineDash([8 * k, 6 * k]); c.stroke(p);
    c.restore();
    if (!s) return;
  }
  if (!s) {
    if (ghost) { c.save(); c.setLineDash([8 * k, 6 * k]); c.lineWidth = 2 * k; c.strokeStyle = b.st === 'plate' ? 'rgba(40,30,60,.35)' : 'rgba(255,255,255,.55)'; c.strokeRect(x + 2, y + 2, w - 4, h - 4); c.restore(); }
    return;
  }
  const pad = (b.st === 'meme' ? 4 : 10) * k, iw = w - pad * 2, ih = h - pad * 2;
  const up = b.st === 'meme' || b.st === 'plate';
  const txt = up ? s.toUpperCase() : s;
  const font = b.st === 'meme' ? '900 $px ' + MEME_FONT : b.st === 'chalk' ? '700 $px ' + CHALK_FONT : '900 $px ' + SANS_FONT;
  const maxPx = Math.round((b.st === 'meme' ? 58 : b.st === 'chalk' ? 40 : b.st === 'plate' ? 26 : 26) * k), minPx = Math.max(8, Math.round(11 * k));
  const f = fitText(c, txt, iw, ih, font, maxPx, minPx);
  c.font = font.replace('$', f.size); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const lh = f.size * 1.08, tot = f.lines.length * lh;
  let y0 = b.a === 't' ? y + pad + lh / 2 : b.a === 'b' ? y + h - pad - tot + lh / 2 : y + h / 2 - tot / 2 + lh / 2;
  f.lines.forEach((ln, i) => {
    const ty = y0 + i * lh, tx = x + w / 2;
    if (b.st === 'meme') { c.lineWidth = Math.max(2, f.size * .17); c.strokeStyle = '#000'; c.strokeText(ln, tx, ty); c.fillStyle = '#fff'; c.fillText(ln, tx, ty); }
    else if (b.st === 'chalk') { c.fillStyle = 'rgba(248,248,240,.94)'; c.fillText(ln, tx, ty); }
    else { c.fillStyle = '#1f1a2e'; c.fillText(ln, tx, ty); }
  });
}
function drawMeme(cv, pic, texts, K, opt) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  opt = opt || {};
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0718'; c.fillRect(0, 0, W, H);
  if (!pic || pic.k === 't') c.drawImage(scenePic(pic ? pic.id : SCENES[0].id), 0, 0, W, H);
  else {
    const img = K && K.pics.get(pic.id);
    if (img) {
      const s = Math.min(W / img.width, H / img.height), dw = img.width * s, dh = img.height * s;
      if (K.blur.has(pic.id)) { c.save(); c.filter = 'blur(' + Math.round(W / 22) + 'px)'; c.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh); c.restore(); c.fillStyle = 'rgba(10,6,24,.55)'; c.fillRect(0, 0, W, H); }
      else c.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      c.fillStyle = '#1b1238'; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '800 ' + Math.round(W / 26) + 'px Nunito, "Segoe UI", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(L('Loading the picture…'), W / 2, H / 2);
    }
  }
  if (!(pic && pic.k === 'u' && K && K.blur.has(pic.id))) boxesOf(pic).forEach((b, i) => drawBox(c, b, texts ? texts[i] : '', W, H, opt.ghost));
  c.restore();
}

function ctCss() {
  const g = '.gm-' + ID;
  return `
${g}{gap:0;font-family:Nunito,"Segoe UI",system-ui,-apple-system,Roboto,sans-serif}
${g} [hidden]{display:none!important}
${g} *{box-sizing:border-box}
${g} .ct{position:relative;overflow:hidden;border-radius:18px;color:#fff;box-shadow:0 10px 30px rgba(10,10,40,.3);max-width:100%;touch-action:manipulation;margin:0 auto;background:#2a1650}
${g} .ct-in{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;background:radial-gradient(circle at 12% 8%,rgba(150,70,220,.75) 0,transparent 48%),radial-gradient(circle at 95% 100%,rgba(230,60,120,.6) 0,transparent 45%),linear-gradient(160deg,#28195c,#3a1464)}
${g} .ct-game{position:absolute;inset:0}
${g} .ct-av{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;color:#fff;font-weight:900;font-size:17px;flex:none;border:2px solid rgba(255,255,255,.6);text-shadow:0 1px 2px rgba(0,0,0,.35)}
${g} .ct-pane{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,6,28,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
${g} .ct-pane.solid{background:radial-gradient(circle at 12% 8%,rgba(150,70,220,.75) 0,transparent 48%),radial-gradient(circle at 95% 100%,rgba(230,60,120,.6) 0,transparent 45%),linear-gradient(160deg,#28195c,#3a1464)}
${g} .ct-box{width:100%;max-width:540px;max-height:100%;overflow:auto;background:linear-gradient(#33235f,#21163f);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:18px 20px 16px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.5)}
${g} .ct-box h3{margin:2px 0 6px;font-size:26px;font-weight:900}
${g} .ct-box p{margin:4px 0 8px;font-size:14.5px;line-height:1.4;color:#e6defa}
${g} .ct-kick{font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#ffd23a}
${g} .ct-logo{font-family:${MEME_FONT.replace(/"/g, "'")};font-weight:900;font-size:58px;line-height:1;letter-spacing:.02em;color:#fff;text-transform:uppercase;-webkit-text-stroke:3px #000;paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.35);margin:6px 0 4px;transform:rotate(-2deg)}
${g} .ct-logo span{color:#ffd23a}
${g} .ct-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;margin:8px 0 0;min-height:48px;padding:8px 16px;border-radius:14px;border:0;font-weight:900;font-size:17px;line-height:1.1;font-family:inherit;color:#fff;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.28);background:#4b3f86}
${g} .ct-btn:hover{filter:brightness(1.1)}
${g} .ct-btn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.28)}
${g} .ct-btn small{display:block;font-size:12px;font-weight:700;opacity:.85}
${g} .ct-btn.green{background:#26930f}${g} .ct-btn.blue{background:#2a6fd6}${g} .ct-btn.gold{background:#d89e00}${g} .ct-btn.red{background:#c62a3f}${g} .ct-btn.pink{background:#d6336c}
${g} .ct-btn.sm{min-height:38px;font-size:14px;width:auto;padding:6px 14px;display:inline-flex;flex-direction:row}
${g} .ct-btn:disabled{opacity:.4;pointer-events:none}
${g} .ct-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
${g} .ct-row .ct-btn{flex:1;min-width:120px}
${g} .ct-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:7px 0;text-align:left}
${g} .ct-opt>span{font-size:14px;font-weight:800;color:#efe8ff}
${g} .ct-seg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
${g} .ct-seg button{min-width:38px;height:34px;padding:0 10px;border-radius:10px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;font-weight:800;font-size:14px;font-family:inherit;cursor:pointer}
${g} .ct-seg button.on{background:#ffd23a;border-color:#ffd23a;color:#2a1a4a}
${g} .ct-stat{font-size:13px!important;color:#cfc4f0!important}
${g} .ct-menu{position:absolute;left:8px;top:8px;z-index:12;width:38px;height:38px;border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.34);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0}
${g} .ct-menu svg{width:20px;height:20px}
${g} .ct-net{position:absolute;right:8px;top:12px;z-index:12;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.34);font-weight:800;font-size:11px;color:#fff;pointer-events:none}
${g} .ct-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
${g} .ct-net.bad i{background:#ff5b4b}
${g} .ct-bar{position:absolute;left:0;top:0;height:7px;width:100%;transform-origin:0 50%;background:#ffd23a;z-index:5}
${g} .ct-head{position:absolute;left:56px;right:150px;top:12px;height:38px;display:flex;align-items:center;gap:8px;z-index:4}
${g} .ct-chip{background:rgba(0,0,0,.3);border-radius:999px;padding:7px 14px;font-weight:900;font-size:15px;white-space:nowrap}
${g} .ct-chip.y{background:#ffd23a;color:#2a1a4a}
${g} .ct-skip{margin-left:auto;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.3);color:#fff;border-radius:999px;padding:5px 14px;font:inherit;font-weight:900;font-size:13px;cursor:pointer;white-space:nowrap}
${g} .ct-body{position:absolute;left:0;right:0;top:58px;bottom:0;display:flex;align-items:center;justify-content:center;gap:22px;padding:0 22px 18px}
${g} .ct-col{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
${g} canvas.ct-m{display:block;border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.45);background:#0b0718;flex:none}
${g} .ct-side{width:330px;display:flex;flex-direction:column;gap:10px;align-self:center}
${g} .ct-lab{font-size:13px;font-weight:900;color:#ffd23a;text-transform:uppercase;letter-spacing:.06em;text-align:left;display:flex;justify-content:space-between}
${g} .ct-lab b{color:#cfc4f0;font-weight:800;letter-spacing:0}
${g} .ct-inp{width:100%;height:48px;border-radius:12px;border:3px solid rgba(255,255,255,.2);background:#fff;color:#1f1a2e;font:inherit;font-weight:800;font-size:18px;padding:0 12px;outline:none}
${g} .ct-inp:focus{border-color:#ffd23a;box-shadow:0 0 0 3px rgba(255,210,58,.35)}
${g} .ct-sub{font-size:15px;font-weight:800;color:#e6defa;text-align:center}
${g} .ct-big{font-size:42px;font-weight:900;text-align:center;text-shadow:0 4px 0 rgba(0,0,0,.3)}
${g} .ct-done{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
${g} .ct-done span{opacity:.32;transition:opacity .3s,transform .3s}
${g} .ct-done span.ok{opacity:1;transform:scale(1.08)}
${g} .ct-rates{display:flex;gap:10px;justify-content:center}
${g} .ct-rate{width:104px;height:96px;border-radius:16px;border:0;cursor:pointer;color:#fff;font:inherit;font-weight:900;font-size:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 5px 0 rgba(0,0,0,.3);position:relative}
${g} .ct-rate svg{width:46px;height:46px}
${g} .ct-rate .k{position:absolute;left:7px;top:5px;font-size:11px;opacity:.7}
${g} .ct-rate.pick{outline:4px solid #fff;transform:translateY(-4px) scale(1.06)}
${g} .ct-rate.dim{opacity:.35}
${g} .ct-rate:disabled{cursor:default}
${g} .ct-mine{background:rgba(0,0,0,.3);border-radius:14px;padding:12px 18px;font-weight:900;font-size:18px;text-align:center}
${g} .ct-flag{position:absolute;right:10px;top:10px;z-index:3;background:rgba(0,0,0,.55);color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:10px;padding:4px 10px;font:inherit;font-weight:800;font-size:12px;cursor:pointer}
${g} .ct-wrap{position:relative;flex:none}
${g} .ct-wrap.up{margin-bottom:30px}
${g} .ct-eye{position:absolute;left:0;top:calc(100% + 5px);z-index:3;background:rgba(0,0,0,.55);color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:10px;padding:4px 10px;font:inherit;font-weight:800;font-size:12px;cursor:pointer}
${g} .ct-crown{position:absolute;left:-22px;top:-26px;transform:rotate(-22deg);width:62px;height:46px;z-index:3;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}
${g} .ct-by{display:flex;align-items:center;gap:8px;justify-content:center;font-weight:900;font-size:18px}
${g} .ct-by .nm{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${g} .ct-stars{color:#ffd23a;font-weight:900;letter-spacing:.02em}
${g} .ct-list{display:flex;flex-direction:column;gap:8px;max-height:470px;overflow:auto;width:330px;padding:2px}
${g} .ct-li{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border-radius:12px;padding:6px 8px;animation:ct-slide .45s both}
${g} .ct-li canvas{border-radius:6px;flex:none}
${g} .ct-li .tx{flex:1;min-width:0;text-align:left;font-size:13px;line-height:1.25}
${g} .ct-li .tx b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${g} .ct-li .pt{font-weight:900;font-size:16px;color:#ffd23a;white-space:nowrap}
${g} .ct-li.hid{opacity:.55}
${g} .ct-lrow{display:flex;align-items:center;gap:12px;background:#fff;color:#222;border-radius:12px;padding:8px 14px;font-weight:900;font-size:20px;box-shadow:0 4px 0 rgba(0,0,0,.25);position:relative;overflow:hidden;animation:ct-slide .5s both;width:100%}
${g} .ct-lrow.me{outline:4px solid #ffd23a}
${g} .ct-lrow .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(120,60,200,.08),rgba(120,60,200,.2));width:0;transition:width 1s}
${g} .ct-lrow>*{position:relative}
${g} .ct-lrow .rk{width:26px;font-size:22px;color:#6a2fb8}
${g} .ct-lrow .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${g} .ct-lrow .gn{font-size:14px;color:#26930f}
${g} .ct-lrow .gn.z{color:#999}
${g} .ct-lrow .ar{font-size:14px;width:22px;text-align:center}
${g} .ct-lrow .pt{min-width:84px;text-align:right}
${g} .ct-bd{width:600px;display:flex;flex-direction:column;gap:8px;align-items:center}
${g} .ct-bd h2{margin:0 0 6px;font-size:30px;font-weight:900}
${g} .ct-pod{display:flex;align-items:flex-end;justify-content:center;gap:8px;height:300px}
${g} .ct-pc{display:flex;flex-direction:column;align-items:center;width:150px;min-width:0}
${g} .ct-pc .nm{font-weight:900;font-size:19px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.3)}
${g} .ct-pc .pt{font-weight:900;font-size:15px;opacity:.9;margin-bottom:6px}
${g} .ct-pc .blk{width:100%;border-radius:10px 10px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:8px;font-weight:900;font-size:40px;height:0;transition:height 1.1s cubic-bezier(.2,1.1,.4,1);text-shadow:0 3px 0 rgba(0,0,0,.25)}
${g} .ct-pc.p1 .blk{background:linear-gradient(#ffd23a,#d89e00)}${g} .ct-pc.p2 .blk{background:linear-gradient(#e6ecf5,#a0acbf)}${g} .ct-pc.p3 .blk{background:linear-gradient(#e0a070,#a8672f)}
${g} .ct-pc .ct-av{width:46px;height:46px;font-size:23px;margin-bottom:4px}
${g} .ct-hall{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:340px}
${g} .ct-hall button{padding:0;border:3px solid rgba(255,255,255,.25);border-radius:10px;background:none;cursor:pointer;overflow:hidden;line-height:0}
${g} .ct-hall button:hover{border-color:#ffd23a}
${g} .ct-pics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
${g} .ct-pic{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#140c2a;border:2px solid rgba(255,255,255,.18)}
${g} .ct-pic img{width:100%;height:100%;object-fit:cover;display:block}
${g} .ct-pic button{position:absolute;right:4px;top:4px;width:26px;height:26px;border-radius:50%;border:0;background:rgba(0,0,0,.65);color:#fff;font-weight:900;cursor:pointer;line-height:26px;padding:0}
${g} .ct-err{color:#ffb4b4!important;font-weight:800}
${g} .ct-conf{position:absolute;top:-12px;width:10px;height:14px;animation:ct-fall linear forwards;z-index:2;pointer-events:none}
${g} .ct-how{text-align:left}
${g} .ct-how li{margin:4px 0;font-size:14px;line-height:1.4;color:#e6defa}
${g} .port .ct-body{flex-direction:column;gap:10px;padding:0 10px 10px;justify-content:flex-start}
${g} .port .ct-head{right:96px}
${g} .port .ct-side{width:100%}
${g} .port .ct-rates{gap:6px;flex-wrap:wrap}
${g} .port .ct-rates [data-c]{width:100%}
${g} .ct-pc .pt{white-space:nowrap}
${g} .port .ct-rate{width:70px;height:78px;font-size:11px}
${g} .port .ct-rate svg{width:34px;height:34px}
${g} .port .ct-list{width:100%;max-height:300px}
${g} .port .ct-bd{width:100%}
${g} .port .ct-lrow{font-size:16px;padding:7px 10px}
${g} .port .ct-pc{width:30%}
${g} .port .ct-pc .nm{font-size:15px}
${g} .port .ct-pod{height:250px}
${g} .port .ct-big{font-size:32px}
${g} .port .ct-logo{font-size:46px}
${g} .port .ct-pics{grid-template-columns:repeat(3,1fr)}
${g} .port .ct-hall{max-width:100%}
@keyframes ct-slide{from{transform:translateX(-50px);opacity:0}to{transform:none;opacity:1}}
@keyframes ct-fall{to{transform:translateY(760px) rotate(540deg)}}
@keyframes ct-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}
${g} .ct-popin{animation:ct-pop .45s both}
`;
}

const FACES = [
  '<circle cx="24" cy="24" r="20" fill="#fff" fill-opacity=".22"/><circle cx="17" cy="20" r="3" fill="#fff"/><circle cx="31" cy="20" r="3" fill="#fff"/><path d="M15 34 Q24 26 33 34" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M12 13 l8 3 M36 13 l-8 3" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  '<circle cx="24" cy="24" r="20" fill="#fff" fill-opacity=".22"/><circle cx="17" cy="21" r="3" fill="#fff"/><circle cx="31" cy="21" r="3" fill="#fff"/><path d="M16 32 H32" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>',
  '<circle cx="24" cy="24" r="20" fill="#fff" fill-opacity=".22"/><circle cx="17" cy="20" r="3" fill="#fff"/><circle cx="31" cy="20" r="3" fill="#fff"/><path d="M15 29 Q24 36 33 29" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
  '<circle cx="24" cy="24" r="20" fill="#fff" fill-opacity=".22"/><path d="M13 20 Q17 15 21 20 M27 20 Q31 15 35 20" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M13 27 Q24 42 35 27 Z" fill="#fff"/>',
  '<circle cx="24" cy="24" r="20" fill="#fff" fill-opacity=".22"/><path d="M17 13 l2 5 5 .5 -4 3 1.3 5 -4.3 -2.8 -4.3 2.8 1.3 -5 -4 -3 5 -.5Z M31 13 l2 5 5 .5 -4 3 1.3 5 -4.3 -2.8 -4.3 2.8 1.3 -5 -4 -3 5 -.5Z" fill="#fff"/><path d="M12 29 Q24 44 36 29 Z" fill="#fff"/>'
];
const faceSvg = i => `<svg viewBox="0 0 48 48">${FACES[i]}</svg>`;
const CROWN = '<svg class="ct-crown" viewBox="0 0 62 46"><path d="M4 40 L8 10 L20 24 L31 4 L42 24 L54 10 L58 40 Z" fill="#ffd23a" stroke="#2a2238" stroke-width="3.5" stroke-linejoin="round"/><circle cx="31" cy="30" r="4" fill="#e8364d"/><circle cx="16" cy="32" r="3" fill="#2f7fe0"/><circle cx="46" cy="32" r="3" fill="#2a9d3a"/></svg>';
const starStr = a => { const f = Math.round(a * 2) / 2; let s = ''; for (let i = 1; i <= 5; i++) s += f >= i ? '★' : f >= i - .5 ? '⯪' : '☆'; return s; };
const fmt = n => (n | 0).toLocaleString('en');

const SIZES = [3, 4, 5, 6, 7, 8, 9, 10];
const OPT_OK = { rounds: [3, 5, 8], wt: [45, 60, 90], vt: [6, 8, 12], bots: [2, 3, 5, 7], pics: ['builtin', 'mix', 'mine'] };
const MAX_UP = 12, UP_MAX_FILE = 25e6, UP_MAX_URL = 240000, CHUNK = 14000;

function game(root, api) {
  const SK = 'gameplay:ct:host';
  const wrap = document.createElement('div'), S = document.createElement('div'), G = document.createElement('div');
  wrap.className = 'ct'; S.className = 'ct-in'; G.className = 'ct-game';
  wrap.append(S); S.append(G); root.append(wrap);
  const paneEl = document.createElement('div'); paneEl.className = 'ct-pane'; paneEl.hidden = true; S.append(paneEl);
  const netEl = document.createElement('div'); netEl.className = 'ct-net'; netEl.hidden = true; netEl.innerHTML = '<i></i><span></span>'; S.append(netEl);
  const menuBtn = document.createElement('button'); menuBtn.className = 'ct-menu'; menuBtn.hidden = true; menuBtn.setAttribute('aria-label', L('Menu'));
  menuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'; S.append(menuBtn);
  const fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.multiple = true; fileIn.hidden = true; S.append(fileIn);
  const snd = makeSnd(api);
  const K = { mode: 'menu', role: 'local', eng: null, seat: 0, pids: [], human: [], seats: [], view: null, vAt: 0, ver: -1, tok: 0, port: false, built: false, ups: [], pics: new Map(), blur: new Set(), inb: new Map(), out: new Map(), acked: new Map(), scene: '', draft: null, tickSec: -1, end: false, overDone: false, mus: false, confirmHide: -1 };
  let paneH = null, paneKey = '', lastT = performance.now(), saveAt = 0, hooked = false, ro = null, destroyed = false, sendAt = 0;
  const W = () => K.port ? 400 : 960, H = () => K.port ? 720 : 600;

  function fit(force) {
    const port = (root.clientWidth || 800) < 640;
    if (force || port !== K.port) {
      K.port = port;
      wrap.style.width = `min(100%, ${W()}px, calc((100dvh - var(--goff, 250px)) * ${(W() / H()).toFixed(4)}))`;
      wrap.style.aspectRatio = `${W()} / ${H()}`;
      S.style.width = W() + 'px'; S.style.height = H() + 'px';
      S.classList.toggle('port', port);
      if (K.built && K.view) draw(true);
    }
    const w = wrap.clientWidth;
    if (w) S.style.transform = `scale(${w / W()})`;
  }
  const left = () => K.view ? Math.max(0, (K.view.left || 0) - (performance.now() - K.vAt)) : 0;
  const isBoss = () => K.role !== 'guest' || (api.net.leader && api.net.leader === api.net.id);

  function hidePane() { paneEl.hidden = true; paneEl.innerHTML = ''; paneH = null; paneKey = ''; }
  function pane(key, html, handler, solid) {
    paneKey = key; paneH = handler; paneEl.className = 'ct-pane' + (solid ? ' solid' : '');
    paneEl.innerHTML = html; paneEl.hidden = false;
  }
  paneEl.addEventListener('click', e => {
    const el = e.target.closest('[data-p]'); if (!el || !paneH) return;
    snd.tap();
    const p = el.dataset.p;
    if (p.startsWith('set:')) {
      const [, k, v] = p.split(':');
      if (k in OPT0) { setOpt(k, typeof OPT0[k] === 'number' ? +v : v); if (paneKey === 'menu') return showMenu(); }
    }
    paneH(p, el, e);
  });
  const btn = (p, cls, label, sub) => `<button class="ct-btn ${cls}" data-p="${p}">${label}${sub ? `<small>${sub}</small>` : ''}</button>`;
  const seg = (key, list, cur) => `<div class="ct-seg">${list.map(([v, l]) => `<button data-p="set:${key}:${v}" class="${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const optRow = (label, key, list, cur) => `<div class="ct-opt"><span>${label}</span>${seg(key, list, cur)}</div>`;

  function loadAll() { const s = api.load(); return s && typeof s === 'object' && !Array.isArray(s) ? s : {}; }
  function loadOpt() {
    const s = loadAll(), o = Object.assign({}, OPT0), x = s.opt && typeof s.opt === 'object' ? s.opt : {};
    for (const k in OPT_OK) if (OPT_OK[k].includes(x[k])) o[k] = x[k];
    return o;
  }
  K.opt = loadOpt();
  function setOpt(k, v) { if (!OPT_OK[k] || !OPT_OK[k].includes(v)) return; K.opt[k] = v; const s = loadAll(); s.opt = Object.assign({}, K.opt); api.save(s); }
  function stat() { const s = loadAll().stat; const o = {}; if (s && typeof s === 'object') for (const k of ['games', 'wins', 'top', 'best']) { const v = +s[k]; if (isFinite(v) && v >= 0 && v < 1e9) o[k] = Math.floor(v); } return o; }
  function addStat(k, n) { const s = loadAll(), t = stat(); t[k] = (t[k] || 0) + n; s.stat = t; s.opt = Object.assign({}, K.opt); api.save(s); }
  function bestStat(k, v) { const s = loadAll(), t = stat(); if (!(t[k] >= v)) { t[k] = v; s.stat = t; s.opt = Object.assign({}, K.opt); api.save(s); } }

  function showMenu() {
    stopGame();
    K.mode = 'menu'; K.role = 'local';
    const o = K.opt, s = stat(), nu = K.ups.length;
    pane('menu', `<div class="ct-box"><p class="ct-kick">${L('Party game · 3 to 10 players')}</p><div class="ct-logo">Caption <span>This</span></div><p>${L('Everyone gets the same picture. Write the funniest caption, then rate everyone else’s memes.')}</p>
${optRow(L('Bots (solo)'), 'bots', [[2, '2'], [3, '3'], [5, '5'], [7, '7']], o.bots)}
${optRow(L('Rounds'), 'rounds', [[3, '3'], [5, '5'], [8, '8']], o.rounds)}
${optRow(L('Writing time'), 'wt', [[45, '45 s'], [60, '60 s'], [90, '90 s']], o.wt)}
${optRow(L('Time per meme'), 'vt', [[6, '6 s'], [8, '8 s'], [12, '12 s']], o.vt)}
${nu ? optRow(L('Pictures'), 'pics', [['builtin', L('Ours')], ['mix', L('Mixed')], ['mine', L('Only yours')]], o.pics) : ''}
${btn('solo', 'green', L('Play with bots'), L('You and {n} bots', { n: o.bots }))}${btn('online', 'blue', L('Play online'), L('3 to 10 players, bots can fill empty seats'))}
<div class="ct-row">${btn('pics', 'pink sm', nu ? L('Your pictures ({n})', { n: nu }) : L('Add your pictures'))}${btn('how', 'sm', L('How to play'))}</div>
${s.games ? `<p class="ct-stat">${L('Games: {g} · Wins: {w} · Memes of the round: {t} · Best: {b} pts', { g: fmt(s.games), w: fmt(s.wins || 0), t: fmt(s.top || 0), b: fmt(s.best || 0) })}</p>` : ''}</div>`, a => {
      if (a === 'solo') startSolo(); else if (a === 'online') startOnline(); else if (a === 'how') showHow(showMenu); else if (a === 'pics') showPics();
    }, true);
  }

  function showHow(back) {
    pane('how', `<div class="ct-box"><h3>${L('How to play')}</h3><ol class="ct-how">
<li>${L('Each round, everyone gets the same picture.')}</li>
<li>${L('Write a caption in the boxes. Your text appears on the picture as you type. Press Enter or Done to send it; you can edit it until the time runs out.')}</li>
<li>${L('Then every meme is shown, without names. Rate each one from Nope to Legendary with a click or the keys 1 to 5. You cannot rate your own.')}</li>
<li>${L('Each star is worth {p} points. The best meme of the round earns {b} more.', { p: PTS_PER_STAR, b: TOP_BONUS })}</li>
<li>${L('Rude words, links and phone numbers are blocked. The party leader can hide any caption.')}</li>
</ol>${btn('back', 'green', L('OK'))}</div>`, () => (back ? back() : showMenu()), true);
  }

  function showPics(msg) {
    const list = K.ups.map((u, i) => `<div class="ct-pic"><img alt="" src="${u.url}"><button data-p="rm:${i}" aria-label="${esc(L('Remove'))}">×</button></div>`).join('');
    pane('pics', `<div class="ct-box"><p class="ct-kick">${L('Your pictures')}</p><h3>${L('Add your own pictures')}</h3><p>${L('Up to {n} pictures. They are shrunk on this device, sent only to the players in your party, and never uploaded to a server or saved.', { n: MAX_UP })}</p>
${list ? `<div class="ct-pics">${list}</div>` : ''}${msg ? `<p class="${msg[1] ? 'ct-err' : ''}">${esc(msg[0])}</p>` : ''}
<div class="ct-row">${K.ups.length < MAX_UP ? btn('add', 'pink', L('Add pictures')) : ''}${btn('done', 'green', L('Done'))}</div>${K.ups.length ? `<div class="ct-row">${btn('clear', 'red sm', L('Remove all'))}</div>` : ''}</div>`, a => {
      if (a === 'add') { fileIn.value = ''; fileIn.click(); }
      else if (a === 'done') showMenu();
      else if (a === 'clear') { K.ups = []; if (K.opt.pics !== 'builtin') K.opt.pics = 'mix'; showPics(); }
      else if (a.startsWith('rm:')) { K.ups.splice(+a.slice(3), 1); showPics(); }
    }, true);
  }

  async function shrink(file) {
    if (!file || !/^image\//.test(file.type || '')) throw L('That file is not a picture.');
    if (file.size > UP_MAX_FILE) throw L('That picture is too big. Pick one under 25 MB.');
    let src = null, url = null;
    try { src = await createImageBitmap(file); }
    catch (e) {
      url = URL.createObjectURL(file);
      src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(); im.src = url; }).catch(() => null);
    }
    if (!src || !src.width || !src.height) { if (url) URL.revokeObjectURL(url); throw L('This picture could not be opened.'); }
    let max = 720, out = null, w = 0, h = 0;
    for (let tries = 0; tries < 6 && !out; tries++) {
      const k = Math.min(1, max / Math.max(src.width, src.height));
      w = Math.max(1, Math.round(src.width * k)); h = Math.max(1, Math.round(src.height * k));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(src, 0, 0, w, h);
      for (const q of [.82, .7, .58]) {
        let d = cv.toDataURL('image/webp', q);
        if (!/^data:image\/webp/.test(d)) d = cv.toDataURL('image/jpeg', q);
        if (d.length <= UP_MAX_URL) { out = d; break; }
      }
      max = Math.round(max * .78);
    }
    if (src.close) src.close();
    if (url) URL.revokeObjectURL(url);
    if (!out) throw L('This picture could not be made small enough.');
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = out; });
    return { id: 'u' + Date.now().toString(36) + ri(1e6).toString(36), url: out, w, h, img };
  }
  fileIn.addEventListener('change', async () => {
    const files = [...(fileIn.files || [])].slice(0, MAX_UP - K.ups.length);
    if (!files.length) return;
    pane('pics', `<div class="ct-box"><h3>${L('Preparing your pictures…')}</h3></div>`, null, true);
    let err = null;
    for (const f of files) {
      try { const u = await shrink(f); if (K.ups.length < MAX_UP) { K.ups.push(u); K.pics.set(u.id, u.img); } }
      catch (e) { err = typeof e === 'string' ? e : L('This picture could not be opened.'); }
    }
    if (!destroyed && paneKey === 'pics') showPics(err ? [err, 1] : [L('{n} pictures ready.', { n: K.ups.length }), 0]);
  });

  function stopGame() {
    K.tok++; K.eng = null; K.view = null; K.built = false; K.scene = ''; G.innerHTML = '';
    snd.stop(); K.mus = false; netEl.hidden = true; menuBtn.hidden = true; K.end = false; K.draft = null;
    K.out.clear(); K.acked.clear(); K.inb.clear();
    for (const id of [...K.pics.keys()]) if (!K.ups.some(u => u.id === id)) K.pics.delete(id);
    K.blur.clear();
  }

  function seatsFromPlayers(players, size, bots) {
    const seats = players.slice(0, 10).map(p => ({ name: p.name, bot: false, pid: p.id }));
    if (bots) { const nb = Math.max(0, Math.min(size, 10) - seats.length), nm = botNames(nb, seats.map(s => s.name)); for (let i = 0; i < nb; i++) seats.push({ name: nm[i], bot: true, pid: null }); }
    return seats;
  }
  function adopt(seats, eng) {
    K.seats = seats; K.eng = eng; K.pids = seats.map(s => s.pid || null); K.human = seats.map(s => !s.bot);
    K.seat = K.mode === 'online' ? 0 : 0; K.ver = -1;
  }
  function begin() {
    hidePane(); K.built = true; G.innerHTML = ''; K.scene = '';
    menuBtn.hidden = false; netEl.hidden = K.mode !== 'online';
    fit(true); refresh(true);
  }
  function refresh(force) {
    const e = K.eng; if (!e) return;
    if (!force && e.ver === K.ver) return;
    K.ver = e.ver;
    K.view = e.view(K.seat); K.vAt = performance.now();
    draw(false);
    if (K.mode === 'online' && K.role === 'host') { sendViews(); pushPics(); saveHost(); }
    if (e.over && !K.overDone) {
      K.overDone = true; onOver(K.view); try { sessionStorage.removeItem(SK); } catch (x) {}
      const nw = K.mode === 'online' && K.role === 'host' ? (api.net.players || []).filter(p => !p.host && p.inGame === false).length : 0;
      if (nw) api.toast(L('{n} waiting. Go back to the lobby to let them in.', { n: nw }));
    }
  }
  function sendViews() { sendAt = performance.now(); K.pids.forEach((id, q) => { if (id && q !== K.seat && K.human[q]) api.net.sendTo(id, { t: 'v', s: q, v: K.eng.view(q) }); }); }
  function saveHost(force) {
    if (K.mode !== 'online' || K.role !== 'host' || !K.eng) return;
    const now = performance.now();
    if (!force && now - saveAt < 700) return;
    saveAt = now;
    try {
      if (K.eng.over) sessionStorage.removeItem(SK);
      else sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), st: K.eng.st, seats: K.seats.map((s, i) => ({ name: s.name, bot: !K.human[i] })) }));
    } catch (e) {}
  }

  function upById(id) { return K.ups.find(u => u.id === id); }
  function pushPic(gid, id) {
    const u = upById(id); if (!u) return;
    let a = K.acked.get(gid); if (!a) K.acked.set(gid, a = new Set());
    const k = gid + '|' + id;
    if (a.has(id) || K.out.has(k)) return;
    const n = Math.ceil(u.url.length / CHUNK), tok = K.tok;
    K.out.set(k, performance.now());
    let i = 0;
    const pump = () => {
      if (tok !== K.tok || !K.out.has(k)) return;
      for (let j = 0; j < 3 && i < n; j++, i++) api.net.sendTo(gid, { t: 'pic', id, i, n, d: u.url.slice(i * CHUNK, i * CHUNK + CHUNK), w: u.w, h: u.h });
      if (i < n) api.timeout(pump, 45);
    };
    pump();
  }
  function pushPics() {
    if (!K.eng || !K.ups.length) return;
    const st = K.eng.st, want = [st.pics[st.rd - 1], st.pics[st.rd]].filter(p => p && p.k === 'u').map(p => p.id);
    if (!want.length) return;
    K.pids.forEach((id, q) => { if (id && q !== K.seat && K.human[q]) want.forEach(w => pushPic(id, w)); });
  }
  function resetPics(gid) { for (const k of [...K.out.keys()]) if (k.startsWith(gid + '|')) K.out.delete(k); K.acked.delete(gid); }
  function gotChunk(d) {
    if (typeof d.id !== 'string' || !/^u[a-z0-9]{2,20}$/.test(d.id) || K.pics.has(d.id)) return;
    const n = d.n | 0, i = d.i | 0;
    if (n < 1 || n > Math.ceil(UP_MAX_URL / CHUNK) + 1 || i < 0 || i >= n || typeof d.d !== 'string' || d.d.length > CHUNK) return;
    let b = K.inb.get(d.id);
    if (!b || b.n !== n) { b = { n, parts: new Array(n), got: 0, at: performance.now() }; K.inb.set(d.id, b); }
    if (b.parts[i] == null) { b.parts[i] = d.d; b.got++; }
    if (b.got < n) return;
    K.inb.delete(d.id);
    const url = b.parts.join('');
    if (url.length > UP_MAX_URL || !/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(url)) return;
    const im = new Image();
    im.onload = () => { if (destroyed) return; K.pics.set(d.id, im); api.net.send({ t: 'pica', id: d.id }); if (K.view) draw(true); };
    im.src = url;
  }

  function act(a) {
    if (K.role === 'guest') { api.net.send({ t: 'a', a }); return true; }
    if (!K.eng) return false;
    const ok = K.eng.act(K.seat, a, true);
    refresh();
    return ok;
  }

  function tick() {
    const now = performance.now(), host = K.mode === 'online' && K.role === 'host';
    let dt = Math.min(now - lastT, host ? 120000 : 1000); lastT = now;
    if (destroyed || !K.eng || K.role === 'guest') return;
    if (!host && paneKey === 'ingame') return;
    while (dt > 0 && K.eng) { const d = Math.min(dt, 250); K.eng.step(d); dt -= d; }
    refresh();
    if (host && now - sendAt > 4000) sendViews();
  }

  function startSolo() {
    stopGame();
    K.mode = 'solo'; K.role = 'local';
    const nb = clamp(+K.opt.bots || 3, 2, 7), nm = botNames(nb, [myName()]);
    const seats = [{ name: myName(), bot: false, pid: null }].concat(nm.map(x => ({ name: x, bot: true, pid: null })));
    adopt(seats, ctEngine(seats, K.opt, null, K.ups));
    K.overDone = false;
    begin();
  }

  function rematch() {
    if (K.role === 'guest' || !K.eng) return;
    const seats = K.seats.map((s, i) => ({ name: s.name, bot: !K.human[i], pid: K.human[i] ? s.pid : null }));
    K.tok++;
    adopt(seats, ctEngine(seats, Object.assign({}, K.opt, K.eng.st.o), null, K.ups));
    K.overDone = false;
    begin();
    if (K.mode === 'online') K.pids.forEach((id, q) => { if (id && q !== K.seat && K.human[q]) api.net.sendTo(id, { t: 'start', s: q }); });
    refresh(true);
  }

  async function startOnline() {
    stopGame();
    const tok = ++K.tok;
    hook();
    K.mode = 'online'; K.role = null;
    const r = await api.net.room({ title: 'Caption This', sizes: SIZES, defaultSize: 6, min: 3, max: 10, bots: true });
    if (!api.alive || tok !== K.tok) return;
    if (!r) { K.mode = 'menu'; K.role = 'local'; return showMenu(); }
    K.role = r.role; K.players = r.players; K.size = +r.size || r.players.length; K.botsOn = !!r.bots;
    if (r.role === 'host') hostStart();
    else {
      if (!K.built) pane('wait', `<div class="ct-box"><p class="ct-kick">${L('Online')}</p><h3>${L('Connected')}</h3><p>${L('Waiting for the host to start the game…')}</p><div class="ct-row">${btn('leave', 'sm', L('Leave'))}</div></div>`, a => { if (a === 'leave') leaveToMenu(); }, true);
      const ask = n => api.timeout(() => {
        if (tok !== K.tok || K.role !== 'guest' || K.built) return;
        api.net.send({ t: 'sync' });
        if (n < 20) ask(n + 1);
      }, n ? 3000 : 1200);
      ask(0);
    }
  }

  function hostStart() {
    let sv = null;
    try {
      const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
      if (x && x.code === api.net.code && x.st && x.st.g === 'ct' && Array.isArray(x.st.P) && Array.isArray(x.seats) && x.seats.length === x.st.P.length && Date.now() - x.at < 432e5 && x.st.ph !== 'over') sv = x;
    } catch (e) {}
    if (!sv) return newOnline();
    const used = {}, map = {};
    for (const p of K.players.slice(1)) {
      const q = sv.seats.findIndex((s, i) => i > 0 && !s.bot && !used[i] && s.name === p.name);
      if (q < 0) return newOnline();
      used[q] = 1; map[q] = p;
    }
    const gone = sv.seats.filter((s, i) => i > 0 && !s.bot && !used[i]).length;
    pane('resume', `<div class="ct-box"><p class="ct-kick">${L('Online')}</p><h3>${L('Game in progress')}</h3><p>${L('Saved game: round {r} of {n}.', { r: sv.st.rd, n: sv.st.o.rounds })}${gone ? ' ' + L('{n} missing players will be replaced by bots.', { n: gone }) : ''}</p>${btn('go', 'green', L('Resume game'))}${btn('new', 'gold', L('New game'))}${btn('leave', 'sm', L('Leave'))}</div>`, a => {
      if (a === 'go') resumeOnline(sv, map); else if (a === 'new') newOnline(); else leaveToMenu();
    }, true);
  }
  function newOnline() {
    const seats = seatsFromPlayers(K.players, K.size, K.botsOn);
    if (seats.length < 3) {
      pane('few', `<div class="ct-box"><h3>${L('Not enough players')}</h3><p>${L('Caption This needs at least 3 players. Turn on bots in the lobby or invite friends.')}</p>${btn('lobby', 'blue', L('Back to lobby'))}${btn('leave', 'sm', L('Leave'))}</div>`, a => { if (a === 'lobby') startOnline(); else leaveToMenu(); }, true);
      return;
    }
    K.role = 'host'; K.mode = 'online';
    adopt(seats, ctEngine(seats, K.opt, null, K.ups));
    K.overDone = false;
    begin();
    K.pids.forEach((id, q) => { if (id && q !== K.seat && K.human[q]) api.net.sendTo(id, { t: 'start', s: q }); });
    refresh(true);
  }
  function resumeOnline(sv, map) {
    const seats = sv.seats.map((s, i) => i === 0 ? { name: s.name, bot: false, pid: api.net.id } : map[i] ? { name: s.name, bot: false, pid: map[i].id } : { name: s.name, bot: true, pid: null });
    const st = JSON.parse(JSON.stringify(sv.st));
    const pool = shuf(SCENES.map(x => x.id));
    st.pics = st.pics.map((p, i) => p && p.k === 'u' && !upById(p.id) ? { k: 't', id: pool[i % pool.length] } : p && (p.k === 'u' || SC_BY.has(p.id)) ? p : { k: 't', id: pool[i % pool.length] });
    K.role = 'host'; K.mode = 'online';
    adopt(seats, ctEngine(seats, st.o, st, K.ups));
    seats.forEach((s, i) => { if (s.bot && !sv.seats[i].bot) K.eng.setBot(i); });
    K.overDone = false;
    begin();
    K.pids.forEach((id, q) => { if (id && q !== K.seat && K.human[q]) api.net.sendTo(id, { t: 'start', s: q }); });
    refresh(true);
    api.toast(L('Game resumed'));
  }
  function leaveToMenu() {
    try { sessionStorage.removeItem(SK); } catch (e) {}
    if (K.mode === 'online') { try { api.net.close(); } catch (e) {} }
    K.mode = 'menu'; K.role = 'local';
    showMenu();
  }
  function openInGame() {
    const host = K.mode !== 'online' || K.role === 'host';
    pane('ingame', `<div class="ct-box"><p class="ct-kick">Caption This</p><h3>${L('Menu')}</h3>${btn('resume', 'green', L('Resume'))}<div class="ct-row">${btn('how', 'sm', L('How to play'))}${host ? btn('restart', 'gold sm', L('Restart')) : ''}</div>${btn('quit', 'red', K.mode === 'online' ? L('Leave the party') : L('Quit to menu'))}</div>`, a => {
      if (a === 'resume') hidePane();
      else if (a === 'how') showHow(openInGame);
      else if (a === 'restart') { hidePane(); rematch(); }
      else if (a === 'quit') leaveToMenu();
    });
  }

  const flood = {};
  const rateOk = id => { const now = performance.now(), b = flood[id] || (flood[id] = { t: now, n: 0 }); if (now - b.t > 1000) { b.t = now; b.n = 0; } return ++b.n <= 15; };
  function onData(d, from) {
    if (!d || typeof d !== 'object' || !api.alive) return;
    if (K.role === 'host') {
      if (!K.eng) return;
      const q = K.pids.indexOf(from);
      if (q < 0 || !K.human[q] || !rateOk(from)) return;
      tick();
      if (d.t === 'sync') { api.net.sendTo(from, { t: 'start', s: q }); api.net.sendTo(from, { t: 'v', s: q, v: K.eng.view(q) }); resetPics(from); pushPics(); return; }
      if (d.t === 'pica') { if (typeof d.id === 'string') { let a = K.acked.get(from); if (!a) K.acked.set(from, a = new Set()); a.add(d.id); K.out.delete(from + '|' + d.id); } return; }
      if (d.t === 'picq') { if (typeof d.id === 'string') { K.out.delete(from + '|' + d.id); const a = K.acked.get(from); if (a) a.delete(d.id); pushPic(from, d.id); } return; }
      if (d.t !== 'a') return;
      const a = d.a || {};
      if (a.k === '_again' || a.k === '_lobby') { if (api.net.leader !== from) return; if (a.k === '_again') rematch(); else startOnline(); return; }
      let ok = false;
      try { ok = K.eng.act(q, a, api.net.leader === from); } catch (e) { console.error(e); }
      if (!ok) api.net.sendTo(from, { t: 'v', s: q, v: K.eng.view(q) });
      refresh();
    } else if (K.role === 'guest' || (K.role === null && K.mode === 'online')) {
      if (d.t === 'pic') { gotChunk(d); return; }
      if (d.t === 'start') {
        K.seat = d.s | 0; K.mode = 'online'; K.overDone = false; K.end = false; K.draft = null;
        hidePane(); K.view = null; K.built = true; K.scene = ''; G.innerHTML = ''; menuBtn.hidden = false; netEl.hidden = false; fit(true);
      } else if (d.t === 'v' && d.v && typeof d.v === 'object') {
        K.seat = d.s | 0;
        if (!K.built) { hidePane(); G.innerHTML = ''; K.built = true; K.scene = ''; menuBtn.hidden = false; netEl.hidden = false; fit(true); }
        K.view = d.v; K.vAt = performance.now();
        draw(false);
        if (K.view.over && !K.overDone) { K.overDone = true; onOver(K.view); }
        else if (K.view.ph !== 'over') K.overDone = false;
      }
    }
  }
  function hook() {
    if (hooked) return;
    hooked = true;
    api.net.on('data', onData);
    api.net.on('leave', p => {
      if (K.mode !== 'online' || K.role !== 'host' || !p || !K.eng) return;
      const q = K.pids.indexOf(p.id);
      if (q < 0 || !K.human[q]) return;
      K.human[q] = false; K.pids[q] = null; resetPics(p.id);
      K.eng.setBot(q); refresh();
      api.toast(L('{name} left. A bot takes over.', { name: p.name }));
    });
    api.net.on('rejoin', p => {
      if (K.mode !== 'online' || K.role !== 'host' || !K.eng || !p) return;
      const q = K.pids.indexOf(p.id);
      if (q >= 0 && K.human[q]) { api.net.sendTo(p.id, { t: 'start', s: q }); api.net.sendTo(p.id, { t: 'v', s: q, v: K.eng.view(q) }); resetPics(p.id); pushPics(); }
    });
    api.net.on('lobby', () => { if (K.mode === 'online' && K.role === 'guest') startOnline(); });
    api.net.on('close', reason => {
      if (K.mode !== 'online' || K.role === 'local') return;
      K.tok++; K.role = 'local'; K.eng = null; snd.stop(); K.mus = false;
      const hd = reason === 'kicked' ? L('You were removed') : reason === 'host-left' ? L('The host left') : L('Connection lost');
      const tx = reason === 'kicked' ? L('The host removed you from the party.') : reason === 'host-left' ? L('The host ended the game.') : L('The connection to the host was lost.');
      pane('left', `<div class="ct-box"><p class="ct-kick">${L('Online')}</p><h3>${hd}</h3><p>${tx}</p>${btn('room', 'green', L('Online lobby'))}${btn('menu', 'sm', L('Menu'))}</div>`, a => {
        if (a === 'room') startOnline(); else { try { api.net.close(); } catch (e) {} K.mode = 'menu'; showMenu(); }
      }, true);
    });
  }

  const BOXL = { 'Top text': 'Top text', 'Bottom text': 'Bottom text', 'Red button': 'Red button', 'Blue button': 'Blue button', Chalkboard: 'Chalkboard', 'Speech bubble': 'Speech bubble' };
  const dims = (big) => K.port ? (big ? [380, 285] : [380, 285]) : (big ? [600, 450] : [560, 420]);
  const cvs = (m, w, h, iw, ih, cls) => `<canvas class="ct-m ${cls || ''}" data-m="${m}" width="${iw || Math.round(w * 1.6)}" height="${ih || Math.round(h * 1.6)}" style="width:${w}px;height:${h}px"></canvas>`;
  const sceneKey = v => v.ph + ':' + v.rd + (v.ph === 'write' ? ':' + (v.sent ? 's' : 'w') : '') + (v.ph === 'vote' ? ':' + v.vm.i : '') + (K.port ? 'p' : 'l');
  function head(v) {
    const lb = { intro: 'Start', write: 'End writing', vote: 'Next meme', res: 'Next', board: 'Next' }[v.ph];
    const chip = v.ph === 'vote' ? L('Meme {k} of {n}', { k: v.vm.k, n: v.vm.n }) : v.ph === 'over' ? L('Final results') : L('Round {r} of {n}', { r: v.rd, n: v.nr });
    return `<div class="ct-bar" data-bar></div><div class="ct-head"><span class="ct-chip">${chip}</span><span class="ct-chip y">${L('{n} pts', { n: fmt(v.my.pts) })}</span>${lb && isBoss() ? `<button class="ct-skip" data-a="skip">${L(lb)}</button>` : ''}</div>`;
  }
  const doneRow = v => `<div class="ct-done">${v.names.map((x, s) => `<span class="${v.done && v.done[s] ? 'ok' : ''}" title="${esc(x.n)}">${avatar(x.n, x.c, x.bot, 32)}</span>`).join('')}</div>`;
  const upCls = pic => pic && pic.k === 'u' ? ' up' : '';
  const upTools = (pic) => pic && pic.k === 'u' ? `<button class="ct-eye" data-a="eye" data-id="${esc(pic.id)}">${K.blur.has(pic.id) ? L('Show picture') : L('Hide picture')}</button>` : '';
  function sceneHtml(v) {
    const H0 = head(v), ph = v.ph;
    if (ph === 'intro') {
      const [w, h] = K.port ? [380, 285] : [480, 360];
      return `${H0}<div class="ct-body"><div class="ct-col"><div class="ct-big">${L('Round {r} of {n}', { r: v.rd, n: v.nr })}</div><div class="ct-wrap ct-popin${upCls(v.pic)}">${cvs('main', w, h)}${upTools(v.pic)}</div><div class="ct-sub">${L('Get ready to write a caption')}</div></div></div>`;
    }
    if (ph === 'write') {
      const [w, h] = dims(false), bx = boxesOf(v.pic);
      if (v.sent) return `${H0}<div class="ct-body"><div class="ct-wrap${upCls(v.pic)}">${cvs('main', w, h)}${upTools(v.pic)}</div><div class="ct-side"><div class="ct-big" style="font-size:34px">${L('Caption sent!')}</div><div class="ct-sub" data-w></div>${doneRow(v)}<button class="ct-btn gold" data-a="edit">${L('Edit my caption')}</button></div></div>`;
      const ins = bx.map((b, i) => `<div><div class="ct-lab"><span>${L(BOXL[b.k] || b.k)}</span><b data-n="${i}">0 / 70</b></div><input class="ct-inp" data-i="${i}" maxlength="70" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="${i === bx.length - 1 ? 'send' : 'next'}" aria-label="${esc(L(BOXL[b.k] || b.k))}"></div>`).join('');
      return `${H0}<div class="ct-body"><div class="ct-wrap${upCls(v.pic)}">${cvs('main', w, h)}${upTools(v.pic)}</div><div class="ct-side"><div class="ct-sub" style="text-align:left">${L('Write your caption')}</div>${ins}<button class="ct-btn green" data-a="send">${L('Done')}</button><div class="ct-sub" data-w style="font-size:13px"></div>${doneRow(v)}</div></div>`;
    }
    if (ph === 'vote') {
      const vm = v.vm, [w, h] = dims(true);
      const flag = isBoss() && K.mode === 'online' && !vm.mine ? `<button class="ct-flag" data-a="hide" data-i="${vm.i}">${L('Hide caption')}</button>` : '';
      const rates = vm.mine ? `<div class="ct-mine">${L('This is your meme!')}<div class="ct-sub" data-c style="margin-top:6px"></div></div>` : `<div class="ct-rates"${K.port ? '' : ' style="flex-direction:column"'}>${RATES.map((r, i) => `<button class="ct-rate" data-a="rate" data-r="${i + 1}" style="background:${r[1]}${K.port ? '' : ';width:150px;height:76px;flex-direction:row;gap:10px'}"><span class="k">${i + 1}</span>${faceSvg(i)}<span>${L(r[0])}</span></button>`).join('')}<div class="ct-sub" data-c style="font-size:13px"></div></div>`;
      return `${H0}<div class="ct-body"><div class="ct-wrap ct-popin${upCls(v.pic)}">${cvs('main', w, h)}${flag}${upTools(v.pic)}</div>${rates}</div>`;
    }
    if (ph === 'res') {
      const top = v.res.find(x => x.top), rest = v.res.filter(x => x !== top);
      const [w, h] = K.port ? [340, 255] : [480, 360];
      const tw = K.port ? 88 : 96, th = Math.round(tw * .75);
      const by = x => `<div class="ct-by">${avatar(x.n, x.c, x.bot, 30)}<span class="nm" translate="no">${esc(x.n)}</span><span class="ct-stars">★ ${x.avg.toFixed(1)}</span><span>+${fmt(x.g)}</span></div>`;
      const flag = x => isBoss() && K.mode === 'online' && !x.hid ? ` <a href="#" data-a="hide" data-i="${x.i}" style="color:#ffb4b4;font-size:12px">${L('Hide')}</a>` : '';
      const li = (x, k) => `<div class="ct-li${x.hid ? ' hid' : ''}" style="animation-delay:${.2 + k * .1}s">${cvs('r' + x.i, tw, th, tw * 2, th * 2)}<div class="tx"><b translate="no">${esc(x.n)}</b>${x.hid ? L('Hidden by the host') : x.cnt ? `<span class="ct-stars">★ ${x.avg.toFixed(1)}</span> · ${x.cnt === 1 ? L('1 rating') : L('{n} ratings', { n: x.cnt })}` : L('No ratings')}${flag(x)}</div><span class="pt">+${fmt(x.g)}</span></div>`;
      const main = top ? `<div class="ct-col"><div class="ct-kick" style="font-size:15px">${L('Meme of the round')}</div><div class="ct-wrap ct-popin">${CROWN}${cvs('top', w, h)}</div>${by(top)}${flag(top) ? `<div>${flag(top)}</div>` : ''}</div>` : `<div class="ct-col"><div class="ct-big" style="font-size:30px">${v.res.length ? L('Not enough memes to vote this round') : L('Nobody wrote a caption this round')}</div></div>`;
      return `${H0}<div class="ct-body">${main}${rest.length ? `<div class="ct-list">${rest.map(li).join('')}</div>` : ''}</div>`;
    }
    if (ph === 'board') {
      const mx = Math.max(1, ...v.board.map(b => b.pts));
      const rows = v.board.map((b, i) => {
        const mv = b.pr > b.r ? '<span class="ar" style="color:#26930f">▲</span>' : b.pr < b.r ? '<span class="ar" style="color:#c62a3f">▼</span>' : '<span class="ar"></span>';
        return `<div class="ct-lrow${b.s === v.me ? ' me' : ''}" style="animation-delay:${i * .08}s"><span class="fill" data-w="${Math.max(6, Math.round(b.pts / mx * 100))}"></span><span class="rk">${b.r + 1}</span>${avatar(b.n, b.c, b.bot, 30)}<span class="nm" translate="no">${esc(b.n)}</span><span class="gn${b.gain ? '' : ' z'}">+${fmt(b.gain)}</span>${mv}<span class="pt">${fmt(b.pts)}</span></div>`;
      }).join('');
      return `${H0}<div class="ct-body"><div class="ct-bd"><h2>${L('Scores after round {r}', { r: v.rd })}</h2>${rows}</div></div>`;
    }
    if (ph === 'over') {
      const pod = v.pod, ord = [pod[1], pod[0], pod[2]], cls = ['p2', 'p1', 'p3'], hh = K.port ? [110, 160, 80] : [140, 200, 100], lb = ['2', '1', '3'];
      const podium = `<div class="ct-pod">${ord.map((x, i) => x ? `<div class="ct-pc ${cls[i]}">${avatar(x.n, x.c, x.bot)}<div class="nm" translate="no">${esc(x.n)}</div><div class="pt">${L('{n} pts', { n: fmt(x.pts) })}</div><div class="blk" data-h="${hh[i]}">${lb[i]}</div></div>` : '').join('')}</div>`;
      const me = pod.find(x => x.i === v.me) || pod[0], boss = isBoss();
      const tw = K.port ? 110 : 150, th = Math.round(tw * .75);
      const hall = v.hall.length ? `<div class="ct-col" style="gap:8px"><div class="ct-kick" style="font-size:14px">${L('Best memes')}</div><div class="ct-hall">${v.hall.map((x, i) => `<button data-a="big" data-h="${i}" title="${esc(x.n)}">${cvs('h' + i, tw, th, tw * 2, th * 2)}</button>`).join('')}</div></div>` : '';
      const btns = `<div class="ct-row" style="width:100%;max-width:460px">${boss ? `<button class="ct-btn green" data-a="again">${L('Play again')}</button>` : ''}${K.mode === 'online' && boss ? `<button class="ct-btn blue" data-a="lobby">${L('Back to lobby')}</button>` : ''}<button class="ct-btn" data-a="menu">${K.mode === 'online' ? L('Leave') : L('Menu')}</button></div>`;
      const line = `<div class="ct-sub" style="font-size:18px">${me.r === 0 ? L('You won!') : L('You finished #{n}', { n: me.r + 1 })} · ${L('{n} pts', { n: fmt(me.pts) })} · ${L('Memes of the round: {n}', { n: me.top })}</div>`;
      return `${H0}<div class="ct-body" style="${K.port ? 'overflow:auto' : ''}"><div class="ct-col" style="flex:1">${podium}${line}${btns}</div>${hall}</div>`;
    }
    return H0;
  }
  function paintAll(v) {
    G.querySelectorAll('canvas[data-m]').forEach(cv => {
      const m = cv.dataset.m;
      if (m === 'main') {
        if (v.ph === 'intro') drawMeme(cv, v.pic, null, K);
        else if (v.ph === 'write') drawMeme(cv, v.pic, v.sent ? (v.mine || []) : curVals(), K, { ghost: !v.sent });
        else if (v.ph === 'vote') drawMeme(cv, v.pic, v.vm.t, K);
      } else if (m === 'top' || m[0] === 'r') {
        const x = m === 'top' ? v.res.find(r => r.top) : v.res.find(r => r.i === +m.slice(1));
        if (x) drawMeme(cv, v.pic, x.hid ? null : x.t, K);
      } else if (m[0] === 'h') { const x = v.hall[+m.slice(1)]; if (x) drawMeme(cv, x.pic, x.t, K); }
    });
  }
  const curVals = () => [...G.querySelectorAll('.ct-inp')].map(i => i.value);
  function draw(force) {
    const v = K.view; if (!v || !K.built) return;
    const sk = sceneKey(v);
    if (sk !== K.scene || force) {
      const fresh = sk !== K.scene, old = curVals(), ae = document.activeElement, fi = [...G.querySelectorAll('.ct-inp')].indexOf(ae);
      K.scene = sk;
      G.innerHTML = sceneHtml(v);
      const ins = [...G.querySelectorAll('.ct-inp')];
      if (ins.length) {
        const src = !fresh && old.length === ins.length ? old : K.draft && K.draft.rd === v.rd ? K.draft.t : v.mine || [];
        ins.forEach((inp, i) => { inp.value = src[i] || ''; });
        counters();
        const f = ins[fi >= 0 ? fi : 0];
        if (f && (!K.port || fi >= 0)) setTimeout(() => { if (f.isConnected) f.focus({ preventScroll: true }); }, 30);
      }
      paintAll(v);
      if (fresh) onScene(v);
    }
    update(v);
  }
  function counters() { G.querySelectorAll('.ct-inp').forEach((inp, i) => { const n = G.querySelector(`[data-n="${i}"]`); if (n) n.textContent = inp.value.length + ' / 70'; }); }
  function onScene(v) {
    K.tickSec = -1;
    if (v.ph === 'intro') { snd.whoosh(); snd.jingle(); }
    if (v.ph === 'write' && !K.mus) { K.mus = true; snd.music(); }
    if (v.ph !== 'write' && K.mus) { K.mus = false; snd.stop(); }
    if (v.ph === 'vote') snd.whoosh();
    if (v.ph === 'res') { snd.reveal(); if (v.res.some(x => x.top)) setTimeout(() => { if (K.view && K.view.ph === 'res') snd.fanfare(); }, 600); }
    if (v.ph === 'board') { snd.drum(); requestAnimationFrame(() => G.querySelectorAll('.fill').forEach(f => { f.style.width = f.dataset.w + '%'; })); }
    if (v.ph === 'over') podiumFx();
    const p = v.pic;
    if (K.role === 'guest' && p && p.k === 'u' && !K.pics.has(p.id) && (v.ph === 'write' || v.ph === 'intro' || v.ph === 'vote')) {
      const id = p.id;
      api.timeout(() => { if (K.view && K.view.pic && K.view.pic.id === id && !K.pics.has(id)) api.net.send({ t: 'picq', id }); }, 9000);
    }
  }
  function podiumFx() {
    snd.stop(); snd.fanfare(); setTimeout(() => snd.cheer(), 700);
    requestAnimationFrame(() => G.querySelectorAll('.blk').forEach((b, i) => setTimeout(() => { if (b.isConnected) { b.style.height = b.dataset.h + 'px'; snd.drum(); } }, 400 + i * 420)));
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i'); c.className = 'ct-conf';
      c.style.left = Math.random() * 100 + '%'; c.style.background = pick(['#ffd23a', '#e8364d', '#2f7fe0', '#2a9d3a', '#fff', '#ff7a1a']);
      c.style.animationDuration = rr(2.4, 4.6) + 's'; c.style.animationDelay = rr(0, 2) + 's';
      G.append(c);
    }
  }
  function update(v) {
    if (v.my) api.score(v.my.pts);
    const w = G.querySelector('[data-w]');
    if (w && v.ph === 'write') w.textContent = L('{n} of {m} players finished', { n: v.done.filter(Boolean).length, m: v.np });
    if (v.ph === 'write') G.querySelectorAll('.ct-done span').forEach((s, i) => s.classList.toggle('ok', !!v.done[i]));
    if (v.ph === 'vote') {
      const vm = v.vm, c = G.querySelector('[data-c]');
      if (c) c.textContent = vm.mine ? L('{n} of {m} rated', { n: vm.cnt, m: vm.nv }) : vm.my ? L('Rating sent · {n} of {m} rated', { n: vm.cnt, m: vm.nv }) : L('{n} of {m} rated', { n: vm.cnt, m: vm.nv });
      G.querySelectorAll('.ct-rate').forEach(b => { const r = +b.dataset.r; b.classList.toggle('pick', vm.my === r); b.classList.toggle('dim', !!vm.my && vm.my !== r); b.disabled = !!vm.my; });
    }
    if (v.ph === 'over') { if (!K.end) { K.end = true; } } else K.end = false;
  }
  function frame() {
    const v = K.view; if (!K.built || !v || !v.tot) return;
    const lf = left(), f = clamp(lf / v.tot, 0, 1), bar = G.querySelector('[data-bar]');
    if (bar) { bar.style.transform = `scaleX(${f})`; bar.style.background = f < .2 ? '#ff5b4b' : '#ffd23a'; }
    if (v.ph === 'write' && !v.sent && lf < 1500) sendDraft(true);
    const s = Math.ceil(lf / 1000);
    if (K.tickSec !== s) { K.tickSec = s; if (s <= 5 && s > 0 && (v.ph === 'write' || (v.ph === 'vote' && s <= 3))) snd.tick(900 + (5 - s) * 120); }
  }
  function sendCap() {
    const v = K.view; if (!v || v.ph !== 'write' || v.sent) return;
    const raw = curVals(), t = raw.map(ctClean);
    if (!hasText(t)) { snd.bad(); const i = G.querySelector('.ct-inp'); if (i) { i.focus(); i.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 240 }); } return; }
    K.draft = { rd: v.rd, t: raw };
    act({ k: 'cap', t }); snd.pop();
    if (K.role === 'guest') { v.sent = true; v.mine = t; v.done[v.me] = true; draw(); }
  }
  function sendDraft(now) {
    const v = K.view; if (!v || v.ph !== 'write' || v.sent || !K.draft || K.draft.rd !== v.rd) return;
    const t = K.draft.t.map(x => String(x || '').slice(0, 70)), key = v.rd + ':' + t.join('|');
    if (key === K.drSent) return;
    const tnow = performance.now();
    if (!now && tnow - (K.drAt || 0) < 700) { if (!K.drT) K.drT = api.timeout(() => { K.drT = 0; sendDraft(true); }, 750); return; }
    K.drAt = tnow; K.drSent = key;
    act({ k: 'draft', t });
  }
  function confirmHide(i) {
    pane('hide', `<div class="ct-box"><h3>${L('Hide this caption?')}</h3><p>${L('Everyone will see “Hidden by the host” instead, and it will score no points.')}</p><div class="ct-row">${btn('yes', 'red', L('Hide it'))}${btn('no', '', L('Cancel'))}</div></div>`, a => { hidePane(); if (a === 'yes') act({ k: 'hide', i }); });
  }
  function enlarge(i) {
    const v = K.view, x = v && v.hall && v.hall[i]; if (!x) return;
    pane('big', `<div class="ct-box" style="max-width:${K.port ? 380 : 520}px"><canvas data-big width="640" height="480" style="width:100%;border-radius:12px;display:block"></canvas><p translate="no">${esc(x.n)} · ★ ${x.avg.toFixed(1)}</p><div class="ct-row">${btn('save', 'green', L('Save picture'))}${btn('close', '', L('Close'))}</div></div>`, a => {
      if (a === 'save') {
        const cv = paneEl.querySelector('[data-big]');
        try { cv.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b), el = document.createElement('a'); el.href = u; el.download = 'caption-this-round-' + x.rd + '.png'; document.body.append(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }, 'image/png'); } catch (e) { api.toast(L('This picture cannot be saved.')); }
      } else hidePane();
    });
    const cv = paneEl.querySelector('[data-big]'); if (cv) drawMeme(cv, x.pic, x.t, K);
  }
  S.addEventListener('click', e => {
    if (e.target.closest('.ct-pane')) return;
    const el = e.target.closest('[data-a]'); if (!el) return;
    if (el.tagName === 'A') e.preventDefault();
    const a = el.dataset.a, v = K.view; if (!v) return;
    if (a === 'send') sendCap();
    else if (a === 'edit') { if (v.ph !== 'write' || !v.sent) return; snd.tap(); act({ k: 'edit' }); if (K.role === 'guest') { v.sent = false; v.done[v.me] = false; draw(); } }
    else if (a === 'rate') {
      const r = +el.dataset.r;
      if (v.ph !== 'vote' || v.vm.mine || v.vm.my || !(r >= 1 && r <= 5)) return;
      act({ k: 'rate', r, i: v.vm.i }); snd.rate(r);
      if (K.role === 'guest') { v.vm.my = r; v.vm.cnt++; update(v); }
    }
    else if (a === 'skip') { snd.tap(); act({ k: 'skip' }); }
    else if (a === 'hide') { snd.tap(); confirmHide(+el.dataset.i); }
    else if (a === 'eye') { snd.tap(); const id = el.dataset.id; if (K.blur.has(id)) K.blur.delete(id); else K.blur.add(id); draw(true); }
    else if (a === 'big') { snd.tap(); enlarge(+el.dataset.h); }
    else if (a === 'again') { snd.tap(); if (K.role === 'guest') api.net.send({ t: 'a', a: { k: '_again' } }); else rematch(); }
    else if (a === 'lobby') { snd.tap(); if (K.role === 'guest') api.net.send({ t: 'a', a: { k: '_lobby' } }); else startOnline(); }
    else if (a === 'menu') { snd.tap(); leaveToMenu(); }
  });
  menuBtn.addEventListener('click', () => { snd.tap(); openInGame(); });
  G.addEventListener('input', e => {
    if (!e.target.classList || !e.target.classList.contains('ct-inp')) return;
    counters();
    const v = K.view; if (!v || v.ph !== 'write') return;
    K.draft = { rd: v.rd, t: curVals() };
    sendDraft(false);
    const cv = G.querySelector('canvas[data-m="main"]'); if (cv) drawMeme(cv, v.pic, curVals(), K, { ghost: true });
  });
  G.addEventListener('keydown', e => {
    if (!e.target.classList || !e.target.classList.contains('ct-inp')) return;
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      const ins = [...G.querySelectorAll('.ct-inp')], i = ins.indexOf(e.target);
      if (i < ins.length - 1 && !ins[i + 1].value) ins[i + 1].focus(); else sendCap();
    } else if (e.key === 'Escape') e.target.blur();
    else if (e.key.length === 1 && !e.repeat) snd.key();
  });
  G.addEventListener('keyup', e => { if (e.target.classList && e.target.classList.contains('ct-inp')) e.stopPropagation(); });
  api.on(window, 'keydown', e => {
    if (!K.built || !paneEl.hidden || !K.view || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const v = K.view;
    if (v.ph === 'vote' && /^[1-5]$/.test(e.key) && !e.repeat) { const b = G.querySelector(`.ct-rate[data-r="${e.key}"]`); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
    else if (v.ph === 'write' && !v.sent && /^[\p{L}\p{N}]$/u.test(e.key)) { const t = G.querySelector('.ct-inp'); if (t) t.focus(); }
  });

  function onOver(v) {
    const me = v.pod.find(x => x.i === v.me); if (!me) return;
    addStat('games', 1); if (me.r === 0) addStat('wins', 1); if (me.top) addStat('top', me.top); bestStat('best', me.pts);
    api.score(me.pts); api.submit(me.pts);
  }

  api.interval(() => {
    tick();
    if (K.mode === 'online' && K.built) {
      const on = api.net.connected, n = K.role === 'host' ? K.human.filter(Boolean).length : (api.net.players || []).length;
      netEl.classList.toggle('bad', !on);
      netEl.lastChild.textContent = !on ? L('Reconnecting…') : K.role === 'host' ? L('Online · {n} players', { n }) : L('Online') + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
    }
  }, 50);
  api.loop(() => { if (K.built) frame(); });
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => fit()); ro.observe(root); ro.observe(wrap); }
  api.on(window, 'resize', () => fit());
  fit(true);
  if (api.net.invite) startOnline(); else showMenu();
  root._ct = K;
  return { destroy() { destroyed = true; K.tok++; snd.close(); if (ro) ro.disconnect(); } };
}

const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="48" height="40" rx="6"/><path d="M14 22h36M18 44h28"/><circle cx="24" cy="32" r="3"/><circle cx="40" cy="32" r="3"/></svg>';
Ameplay.register({
  id: ID, title: 'Caption This', category: 'Brain', tint: '#8a3fd0',
  blurb: 'The meme party game: everyone gets the same picture, writes the funniest caption, then rates everyone else’s memes. Play with friends online or with bots.',
  help: 'Type your caption and press <kbd>Enter</kbd> · rate memes with a click or <kbd>1</kbd> to <kbd>5</kbd> · online 3 to 10 players, bots can fill empty seats · the host can add their own pictures',
  width: 960, format: v => fmt(v) + ' pts', icon: ICON, css: ctCss(),
  _t: { ctEngine, ctClean, tame, SCENES, planPics, botCaption, drawMeme, scenePic },
  mount: (root, api) => game(root, api)
});
})();
