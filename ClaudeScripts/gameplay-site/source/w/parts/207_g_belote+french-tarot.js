(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const SERIF = "Georgia,'Times New Roman',serif";
  let LANG = (() => { try { return /^fr/i.test(navigator.language || '') ? 'fr' : 'en'; } catch (e) { return 'en'; } })();
  const T = (en, fr) => (LANG === 'fr' && fr != null ? fr : en);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rint = (n, R) => Math.floor((R || Math.random)() * n);
  const shuffle = (a, R) => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1, R), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SND = { ctx: null, muted: () => false };
  function actx() {
    try {
      if (!SND.ctx) SND.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (SND.ctx.state === 'suspended') SND.ctx.resume().catch(() => {});
    } catch (e) { return null; }
    return SND.ctx;
  }
  function noiseBuf(c, dur) {
    const n = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function burst(c, t, dur, type, f0, f1, vol, q) {
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf(c, dur + .05); f.type = type; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (q) f.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + dur + .05);
  }
  function tone(c, t, f0, f1, dur, vol, type) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .03);
  }
  function snd(name, delay) {
    if (SND.muted()) return;
    const c = actx(); if (!c) return;
    const t = c.currentTime + (delay || 0) / 1000;
    try {
      switch (name) {
        case 'deal': burst(c, t, .05, 'highpass', 2400, 5200, .07); break;
        case 'flip': burst(c, t, .06, 'bandpass', 3000, 1800, .06, 2); break;
        case 'play': burst(c, t, .08, 'lowpass', 2600, 700, .22); tone(c, t, 150, 70, .09, .12, 'triangle'); break;
        case 'sweep': burst(c, t, .26, 'bandpass', 700, 3200, .09, 1.2); break;
        case 'shuffle': for (let i = 0; i < 9; i++) burst(c, t + i * .05, .04, 'highpass', 2000 + (i % 3) * 600, 4800, .05); break;
        case 'tick': tone(c, t, 1100, 900, .04, .04, 'square'); break;
        case 'turn': tone(c, t, 660, 880, .12, .05); break;
        case 'bid': tone(c, t, 520, 620, .09, .07); break;
        case 'pass': tone(c, t, 330, 260, .08, .045); break;
        case 'announce': tone(c, t, 523, 523, .12, .08); tone(c, t + .1, 784, 784, .22, .08); break;
        case 'coinche': burst(c, t, .1, 'lowpass', 900, 200, .35); tone(c, t, 110, 55, .18, .2, 'triangle'); tone(c, t + .12, 100, 50, .2, .18, 'triangle'); break;
        case 'good': tone(c, t, 523, 523, .1, .07); tone(c, t + .09, 659, 659, .1, .07); tone(c, t + .18, 784, 784, .2, .07); break;
        case 'bad': tone(c, t, 330, 330, .14, .07, 'triangle'); tone(c, t + .13, 247, 247, .26, .07, 'triangle'); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(c, t + i * .11, f, f, .3, .07)); break;
        case 'lose': [392, 330, 262].forEach((f, i) => tone(c, t + i * .16, f, f * .98, .34, .07, 'triangle')); break;
        case 'err': tone(c, t, 200, 160, .12, .06, 'square'); break;
        case 'poignee': [440, 554, 659, 880].forEach((f, i) => tone(c, t + i * .07, f, f, .25, .06)); break;
      }
    } catch (e) {}
  }

  const INK = '#1b1b22', RED = '#c9232d', GOLD = '#d9a62a', SKIN = '#f3cfa5', LINE = '#2a1f14';
  const SUIT_COL = [INK, RED, INK, RED];
  const SUIT_SYM = ['♠', '♥', '♣', '♦'];
  const SUIT_NAME = () => LANG === 'fr' ? ['Pique', 'Cœur', 'Trèfle', 'Carreau'] : ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
  const SUIT_P = [
    '<path d="M50 3C58 24 92 42 92 64C92 80 80 88 68 86C60 85 55 81 52 76C53 86 57 92 66 97L34 97C43 92 47 86 48 76C45 81 40 85 32 86C20 88 8 80 8 64C8 42 42 24 50 3Z"/>',
    '<path d="M50 94C14 66 4 46 4 30C4 14 16 4 29 4C39 4 47 10 50 19C53 10 61 4 71 4C84 4 96 14 96 30C96 46 86 66 50 94Z"/>',
    '<circle cx="50" cy="28" r="23"/><circle cx="24" cy="60" r="23"/><circle cx="76" cy="60" r="23"/><circle cx="50" cy="56" r="13"/><path d="M47 56C47 76 44 88 35 97L65 97C56 88 53 76 53 56Z"/>',
    '<path d="M50 2C60 22 76 38 94 50C76 62 60 78 50 98C40 78 24 62 6 50C24 38 40 22 50 2Z"/>'
  ];
  const suitG = (s, cx, cy, sz, rot, col) => `<g transform="translate(${cx} ${cy})${rot ? ' rotate(180)' : ''} scale(${sz / 100}) translate(-50 -50)" fill="${col || SUIT_COL[s]}">${SUIT_P[s]}</g>`;
  const PIPS = {
    1: [[.5, .5]], 2: [[.5, 0], [.5, 1]], 3: [[.5, 0], [.5, .5], [.5, 1]],
    4: [[0, 0], [1, 0], [0, 1], [1, 1]], 5: [[0, 0], [1, 0], [.5, .5], [0, 1], [1, 1]],
    6: [[0, 0], [1, 0], [0, .5], [1, .5], [0, 1], [1, 1]],
    7: [[0, 0], [1, 0], [.5, .25], [0, .5], [1, .5], [0, 1], [1, 1]],
    8: [[0, 0], [1, 0], [.5, .25], [0, .5], [1, .5], [.5, .75], [0, 1], [1, 1]],
    9: [[0, 0], [1, 0], [0, 1 / 3], [1, 1 / 3], [.5, .5], [0, 2 / 3], [1, 2 / 3], [0, 1], [1, 1]],
    10: [[0, 0], [1, 0], [.5, 1 / 6], [0, 1 / 3], [1, 1 / 3], [0, 2 / 3], [1, 2 / 3], [.5, 5 / 6], [0, 1], [1, 1]]
  };
  const svgWrap = (H, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${H}">${body}</svg>`;
  const cardBase = H => `<rect x="1" y="1" width="98" height="${H - 2}" rx="7" fill="#fffdf6" stroke="#bdb6a4" stroke-width="1.3"/><rect x="3.5" y="3.5" width="93" height="${H - 7}" rx="5" fill="none" stroke="#e8e2d2" stroke-width=".8"/>`;
  function corner(H, label, s, col, fs) {
    const one = `<text x="13" y="${fs > 20 ? 25 : 24}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${fs}" fill="${col}">${label}</text>${suitG(s, 13, 39, 14, 0)}`;
    return one + `<g transform="rotate(180 50 ${H / 2})">${one}</g>`;
  }
  function figHalf(kind, s) {
    const P = [['#24407f', '#e0b232'], ['#c7222c', '#2d4a8c'], ['#2d6a3d', '#e0b232'], ['#e3b021', '#c7222c']][s], pr = P[0], se = P[1];
    const skin = SKIN, dk = '#2a1f14', hair = ['#2a1f14', '#7a4a1d', '#2a1f14', '#a8741f'][s];
    const eyes = '<circle cx="22.5" cy="21" r="1.1" fill="#2a1f14"/><circle cx="29.5" cy="21" r="1.1" fill="#2a1f14"/>';
    let g = '';
    if (kind === 'K') {
      g += `<path d="M2 53L2 40Q2 32 12 30L40 30Q50 32 50 40L50 53Z" fill="${pr}" stroke="${dk}" stroke-width=".8"/><path d="M13 30L26 42L39 30Z" fill="#fff" stroke="${dk}" stroke-width=".6"/><rect x="2" y="46" width="48" height="3.4" fill="${se}"/>`;
      g += `<path d="M17 20Q17 37 26 38Q35 37 35 20Q31 29 26 29Q21 29 17 20Z" fill="${s === 0 ? '#e8e2d0' : '#7a4a1d'}" stroke="${dk}" stroke-width=".5"/><ellipse cx="26" cy="20" rx="8.6" ry="9.6" fill="${skin}" stroke="${dk}" stroke-width=".7"/>` + eyes;
      g += `<path d="M20 25Q26 22 32 25Q26 27 20 25Z" fill="${s === 0 ? '#e8e2d0' : '#7a4a1d'}"/><path d="M16 13L15 3L21 8L26 1L31 8L37 3L36 13Z" fill="${GOLD}" stroke="${dk}" stroke-width=".8"/><rect x="16" y="11" width="20" height="3.4" fill="${se}" stroke="${dk}" stroke-width=".5"/><circle cx="26" cy="6" r="1.6" fill="${RED}"/>`;
      g += `<rect x="44.5" y="8" width="3.4" height="36" fill="#cfd3da" stroke="${dk}" stroke-width=".6"/><rect x="40" y="33" width="12" height="3.4" fill="${GOLD}" stroke="${dk}" stroke-width=".6"/>`;
    } else if (kind === 'Q') {
      g += `<path d="M3 53L5 41Q6 33 15 31L37 31Q46 33 47 41L49 53Z" fill="${pr}" stroke="${dk}" stroke-width=".8"/><path d="M16 31Q26 39 36 31" fill="none" stroke="${se}" stroke-width="3"/><circle cx="26" cy="38" r="2" fill="${GOLD}" stroke="${dk}" stroke-width=".4"/><rect x="3" y="46" width="46" height="3.2" fill="${se}"/>`;
      g += `<path d="M16 17Q10 36 16 42L21 26Z" fill="${hair}"/><path d="M36 17Q42 36 36 42L31 26Z" fill="${hair}"/><ellipse cx="26" cy="20" rx="8.6" ry="9.6" fill="${skin}" stroke="${dk}" stroke-width=".7"/>` + eyes;
      g += `<path d="M22.5 26Q26 28 29.5 26" fill="none" stroke="${RED}" stroke-width="1"/><path d="M17 13Q17 4 21 6Q26 0 31 6Q35 4 35 13Z" fill="${GOLD}" stroke="${dk}" stroke-width=".8"/><rect x="17" y="11" width="18" height="3" fill="${se}" stroke="${dk}" stroke-width=".4"/><circle cx="26" cy="4.6" r="1.5" fill="${RED}"/>`;
      g += `<path d="M44 44L44 24" stroke="#2d6a3d" stroke-width="1.6"/>` + [0, 1, 2, 3, 4].map(i => `<circle cx="${44 + 3.4 * Math.cos(i * TAU / 5)}" cy="${21 + 3.4 * Math.sin(i * TAU / 5)}" r="2.4" fill="${i % 2 ? '#fff' : RED}" stroke="${dk}" stroke-width=".3"/>`).join('') + `<circle cx="44" cy="21" r="1.6" fill="${GOLD}"/>`;
    } else if (kind === 'J') {
      g += `<path d="M3 53L3 42Q3 33 13 31L39 31Q49 33 49 42L49 53Z" fill="${pr}" stroke="${dk}" stroke-width=".8"/><path d="M26 31L40 42L26 53L12 42Z" fill="${se}" stroke="${dk}" stroke-width=".5"/><rect x="3" y="48" width="46" height="3" fill="${GOLD}"/>`;
      g += `<path d="M17 18Q15 30 19 34L21 22Z" fill="${hair}"/><path d="M35 18Q37 30 33 34L31 22Z" fill="${hair}"/><ellipse cx="26" cy="21" rx="8.4" ry="9.4" fill="${skin}" stroke="${dk}" stroke-width=".7"/>` + eyes;
      g += `<path d="M22.5 26.5Q26 28 29.5 26.5" fill="none" stroke="${RED}" stroke-width="1"/><path d="M15 15Q26 -2 37 15Q26 11 15 15Z" fill="${pr === '#e3b021' ? RED : se}" stroke="${dk}" stroke-width=".8"/><ellipse cx="26" cy="14.4" rx="12" ry="2.6" fill="${pr}" stroke="${dk}" stroke-width=".6"/><path d="M34 8Q44 -2 50 6Q44 2 38 11Z" fill="${RED}" stroke="${dk}" stroke-width=".5"/>`;
      g += `<rect x="45" y="9" width="2.6" height="42" fill="#7a4a1d"/><path d="M47 10L52 16L47 24Z" fill="#cfd3da" stroke="${dk}" stroke-width=".6"/><path d="M45 9L40 3L45 3Z" fill="#cfd3da" stroke="${dk}" stroke-width=".5"/>`;
    } else {
      g += `<path d="M2 53L2 40Q8 38 14 40L20 53Z" fill="#8a5a2b" stroke="${dk}" stroke-width=".8"/>`;
      g += `<path d="M1 53L2 34Q3 20 14 14L18 3L23 11Q30 14 32 24L26 27L22 35Q20 44 24 53Z" fill="${s === 3 ? '#d8d2c4' : '#8a5a2b'}" stroke="${dk}" stroke-width=".8"/><path d="M18 3Q12 14 8 24Q6 34 7 44" fill="none" stroke="${dk}" stroke-width="2.4"/><circle cx="23" cy="17" r="1.3" fill="${dk}"/><path d="M26 27L30 30" stroke="${dk}" stroke-width=".8"/>`;
      g += `<path d="M26 53L28 44Q30 36 38 34L48 34Q52 38 51 53Z" fill="${pr}" stroke="${dk}" stroke-width=".8"/><ellipse cx="40" cy="25" rx="6.6" ry="7.4" fill="${skin}" stroke="${dk}" stroke-width=".7"/><path d="M33 22Q33 11 40 11Q48 11 47 22L44 18L36 18Z" fill="#cfd3da" stroke="${dk}" stroke-width=".7"/><path d="M40 11L40 2Q46 0 48 6" fill="none" stroke="${RED}" stroke-width="2.2"/><circle cx="43" cy="25" r="1" fill="${dk}"/>`;
      g += `<rect x="46" y="12" width="2.4" height="34" fill="#7a4a1d"/><path d="M47 12L51 15L47 20Z" fill="${RED}"/>`;
    }
    return g;
  }
  function courtFace(H, kind, s, label) {
    const mid = H / 2, sc = (mid - 17) / 53, col = SUIT_COL[s];
    const half = `<g transform="translate(24 17) scale(${sc * 1})">${figHalf(kind, s)}</g>`;
    const body = `<rect x="23" y="16" width="54" height="${H - 32}" fill="#fbf1d6" stroke="${col}" stroke-width="1.4"/><rect x="25" y="18" width="50" height="${H - 36}" fill="none" stroke="#d9c9a0" stroke-width=".7"/>` +
      `<g transform="translate(0 0)">${half}</g><g transform="rotate(180 50 ${mid})">${half}</g><line x1="24" y1="${mid}" x2="76" y2="${mid}" stroke="${col}" stroke-width=".9"/>` +
      suitG(s, 33, mid - 8, 11, 0) + suitG(s, 67, mid + 8, 11, 1);
    return svgWrap(H, cardBase(H) + body + corner(H, label, s, col, 22));
  }
  function pipFace(H, v, s, label) {
    const col = SUIT_COL[s], pts = PIPS[v], top = H === 140 ? 31 : 36, bot = H === 140 ? 109 : 136;
    let g = '';
    const size = v === 1 ? 46 : v <= 3 ? 24 : 22;
    for (const [px, py] of pts) {
      const x = 50 + (px - .5) * 40, y = top + py * (bot - top);
      g += suitG(s, x, v === 1 ? H / 2 : y, size, py > .5 && v > 1);
    }
    if (v === 1) g = suitG(s, 50, H / 2, s === 0 ? 54 : 46, 0) + (s === 0 ? `<g fill="none" stroke="${col}" stroke-width=".8" opacity=".5"><circle cx="50" cy="${H / 2}" r="33"/></g>` : '');
    return svgWrap(H, cardBase(H) + g + corner(H, label, s, col, label.length > 1 ? 18 : 22));
  }
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const TNAME = ['', 'Le Bateleur', 'La Papesse', 'L’Impératrice', 'L’Empereur', 'Le Pape', 'L’Amoureux', 'Le Chariot', 'La Justice', 'L’Ermite', 'La Roue', 'La Force', 'Le Pendu', 'La Mort', 'Tempérance', 'Le Diable', 'La Maison Dieu', 'L’Étoile', 'La Lune', 'Le Soleil', 'Le Jugement', 'Le Monde'];
  const ST = `stroke="${LINE}" stroke-linejoin="round" stroke-linecap="round"`;
  const star = (cx, cy, ro, ri, n, fill) => { let p = ''; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n; p += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); } return `<path d="${p}Z" fill="${fill}" ${ST}/>`; };
  const EM = {
    1: () => `<ellipse cx="50" cy="62" rx="36" ry="8" fill="${GOLD}" ${ST}/><path d="M33 62Q33 28 50 28Q67 28 67 62Z" fill="${RED}" ${ST}/><rect x="33" y="52" width="34" height="6" fill="${LINE}"/><path d="M12 88L88 76" ${ST} stroke-width="3"/><circle cx="12" cy="88" r="4.5" fill="${GOLD}" ${ST}/><circle cx="88" cy="76" r="4.5" fill="${GOLD}" ${ST}/>`,
    2: () => `<path d="M36 34L50 8L64 34Z" fill="${GOLD}" ${ST}/><circle cx="50" cy="8" r="3" fill="${RED}" ${ST}/><path d="M12 44Q32 36 50 46L50 86Q32 78 12 86Z" fill="#f8f0d8" ${ST}/><path d="M88 44Q68 36 50 46L50 86Q68 78 88 86Z" fill="#f8f0d8" ${ST}/><path d="M18 56Q32 52 44 58M18 66Q32 62 44 68M18 76Q32 72 44 78M82 56Q68 52 56 58M82 66Q68 62 56 68M82 76Q68 72 56 78" stroke="${LINE}" fill="none" stroke-width="1.5"/>`,
    3: () => `<path d="M16 76L16 38L33 56L50 26L67 56L84 38L84 76Z" fill="${GOLD}" ${ST}/><rect x="16" y="76" width="68" height="10" fill="${RED}" ${ST}/><circle cx="50" cy="26" r="5.5" fill="#2b6fb5" ${ST}/><circle cx="16" cy="38" r="4.5" fill="#2b6fb5" ${ST}/><circle cx="84" cy="38" r="4.5" fill="#2b6fb5" ${ST}/><circle cx="50" cy="62" r="6" fill="${RED}" ${ST}/>`,
    4: () => `<path d="M22 18H78V54Q78 80 50 94Q22 80 22 54Z" fill="#2b6fb5" ${ST}/><path d="M50 32L32 22L37 44L28 52L50 48L72 52L63 44L68 22Z" fill="${GOLD}" ${ST}/><circle cx="50" cy="38" r="5.5" fill="${GOLD}" ${ST}/><path d="M50 52V82" ${ST}/><path d="M38 70H62" ${ST}/>`,
    5: () => `<path d="M50 8V92" ${ST} stroke-width="5"/><path d="M38 22H62M31 40H69M24 58H76" ${ST} stroke-width="5"/><circle cx="50" cy="8" r="5" fill="${GOLD}" ${ST}/><circle cx="38" cy="22" r="3.5" fill="${GOLD}"/><circle cx="62" cy="22" r="3.5" fill="${GOLD}"/><circle cx="31" cy="40" r="3.5" fill="${GOLD}"/><circle cx="69" cy="40" r="3.5" fill="${GOLD}"/><circle cx="24" cy="58" r="3.5" fill="${GOLD}"/><circle cx="76" cy="58" r="3.5" fill="${GOLD}"/>`,
    6: () => `<path d="M50 82C16 58 10 40 10 30C10 18 20 10 31 10C40 10 47 15 50 23C53 15 60 10 69 10C80 10 90 18 90 30C90 40 84 58 50 82Z" fill="${RED}" ${ST}/><path d="M14 90L86 22" ${ST} stroke-width="3"/><path d="M86 22L72 24L84 36Z" fill="${LINE}"/><path d="M14 90L12 78L24 86Z" fill="${GOLD}" ${ST}/>`,
    7: () => `<path d="M20 40L50 14L80 40Z" fill="${RED}" ${ST}/><rect x="24" y="40" width="52" height="30" fill="#2b6fb5" ${ST}/><circle cx="32" cy="78" r="13" fill="${GOLD}" ${ST}/><circle cx="68" cy="78" r="13" fill="${GOLD}" ${ST}/><path d="M32 65V91M19 78H45M68 65V91M55 78H81" ${ST} stroke-width="1.6"/><path d="M50 14V4" ${ST}/>${star(50, 55, 9, 4, 5, GOLD)}`,
    8: () => `<path d="M50 10V84M30 86H70" ${ST} stroke-width="4"/><path d="M16 28H84" ${ST} stroke-width="3"/><path d="M16 28L6 58H26ZM84 28L74 58H94Z" fill="${GOLD}" ${ST}/><path d="M6 58Q16 70 26 58M74 58Q84 70 94 58" fill="${GOLD}" ${ST}/><circle cx="50" cy="10" r="5" fill="${RED}" ${ST}/>`,
    9: () => `<path d="M28 92V12" ${ST} stroke-width="4"/><path d="M28 22Q48 8 62 24" fill="none" ${ST} stroke-width="3"/><rect x="56" y="28" width="20" height="28" rx="3" fill="#f2c94c" ${ST}/><path d="M66 22V28" ${ST}/><path d="M66 12L66 18M80 28L86 26M48 30L42 28M80 56L86 60M52 58L46 62" ${ST} stroke-width="2"/><path d="M52 92L66 62L82 92Z" fill="#8a5a2b" ${ST}/>`,
    10: () => `<circle cx="50" cy="50" r="36" fill="#f2c94c" ${ST}/><circle cx="50" cy="50" r="10" fill="${RED}" ${ST}/><path d="M50 14V86M14 50H86M25 25L75 75M75 25L25 75" ${ST} stroke-width="3"/><circle cx="50" cy="50" r="24" fill="none" ${ST} stroke-width="1.6"/>`,
    11: () => star(50, 50, 42, 32, 12, '#e0933a') + `<circle cx="50" cy="52" r="24" fill="#f2c94c" ${ST}/><path d="M36 38Q42 34 46 40M64 38Q58 34 54 40" fill="none" ${ST}/><circle cx="41" cy="46" r="2.6" fill="${LINE}"/><circle cx="59" cy="46" r="2.6" fill="${LINE}"/><path d="M44 56L56 56L50 64Z" fill="${RED}" ${ST}/><path d="M50 64Q44 72 38 68M50 64Q56 72 62 68" fill="none" ${ST}/>`,
    12: () => `<path d="M8 12H92" ${ST} stroke-width="5"/><path d="M38 40L35 12M62 40L65 12" ${ST} stroke-width="6"/><path d="M34 40H66L61 68H39Z" fill="#2b6fb5" ${ST}/><circle cx="50" cy="80" r="11" fill="${SKIN}" ${ST}/><path d="M39 48L28 62M61 48L72 62" ${ST} stroke-width="4"/>`,
    13: () => `<path d="M50 12C28 12 20 28 22 44C23 52 28 54 30 60V74H70V60C72 54 77 52 78 44C80 28 72 12 50 12Z" fill="#f4efe2" ${ST}/><circle cx="38" cy="42" r="8.5" fill="${LINE}"/><circle cx="62" cy="42" r="8.5" fill="${LINE}"/><path d="M50 50L44 61H56Z" fill="${LINE}"/><path d="M38 74V63M46 74V63M54 74V63M62 74V63" ${ST} stroke-width="1.6"/><path d="M84 6Q98 30 82 54" fill="none" ${ST} stroke-width="3"/><path d="M84 6L96 12" ${ST} stroke-width="3"/><path d="M82 54L50 92" ${ST} stroke-width="3"/>`,
    14: () => `<path d="M10 22H40L37 52H13Z" fill="${RED}" ${ST}/><path d="M60 60H90L87 90H63Z" fill="#2b6fb5" ${ST}/><path d="M30 52Q46 58 58 70" fill="none" stroke="#4aa3df" stroke-width="5" stroke-linecap="round"/><path d="M26 52Q40 62 56 72" fill="none" ${ST} stroke-width=".8"/><circle cx="25" cy="16" r="5" fill="${GOLD}" ${ST}/><circle cx="75" cy="54" r="5" fill="${GOLD}" ${ST}/>`,
    15: () => `<path d="M50 36L6 12L14 50L4 74L34 66Z" fill="${LINE}"/><path d="M50 36L94 12L86 50L96 74L66 66Z" fill="${LINE}"/><circle cx="50" cy="58" r="23" fill="${RED}" ${ST}/><path d="M32 42L24 14L44 32ZM68 42L76 14L56 32Z" fill="${LINE}"/><circle cx="41" cy="52" r="4" fill="#f2c94c" ${ST}/><circle cx="59" cy="52" r="4" fill="#f2c94c" ${ST}/><path d="M38 68Q50 80 62 68" fill="#2a0f0f" ${ST}/>`,
    16: () => `<path d="M30 90V42H70V90Z" fill="#c8c0b0" ${ST}/><path d="M26 42V30H36V36H44V30H56V36H64V30H74V42Z" fill="#c8c0b0" ${ST}/><rect x="44" y="64" width="12" height="26" fill="${LINE}"/><path d="M62 2L40 36H54L42 62L74 26H58Z" fill="#f2c94c" ${ST}/><path d="M20 90Q24 72 30 80Q32 66 40 88M70 88Q76 70 80 80Q84 70 88 90" fill="${RED}" ${ST}/>`,
    17: () => star(50, 48, 38, 15, 8, '#f2c94c') + `${star(16, 82, 9, 4, 5, '#f2c94c')}${star(84, 82, 9, 4, 5, '#f2c94c')}${star(14, 16, 7, 3, 5, '#f2c94c')}${star(86, 16, 7, 3, 5, '#f2c94c')}`,
    18: () => `<path d="M62 8A38 38 0 1 0 62 92A29 29 0 1 1 62 8Z" fill="#f2c94c" ${ST}/><circle cx="80" cy="24" r="5" fill="#f2c94c" ${ST}/><circle cx="88" cy="50" r="4" fill="#f2c94c" ${ST}/><circle cx="80" cy="76" r="5" fill="#f2c94c" ${ST}/><path d="M46 46Q38 50 40 60" fill="none" ${ST}/>`,
    19: () => `${[...Array(12)].map((_, i) => { const a = i * TAU / 12; return `<path d="M${50 + 30 * Math.cos(a - .12)} ${50 + 30 * Math.sin(a - .12)}L${50 + 46 * Math.cos(a)} ${50 + 46 * Math.sin(a)}L${50 + 30 * Math.cos(a + .12)} ${50 + 30 * Math.sin(a + .12)}Z" fill="${i % 2 ? RED : '#f2c94c'}" ${ST} stroke-width="1.4"/>`; }).join('')}<circle cx="50" cy="50" r="27" fill="#f2c94c" ${ST}/><circle cx="41" cy="46" r="2.8" fill="${LINE}"/><circle cx="59" cy="46" r="2.8" fill="${LINE}"/><path d="M40 58Q50 68 60 58" fill="none" ${ST}/>`,
    20: () => `<path d="M8 70L62 46Q78 44 86 24L94 32Q82 58 62 66L12 80Z" fill="${GOLD}" ${ST}/><ellipse cx="22" cy="86" rx="16" ry="7" fill="#fff" ${ST}/><ellipse cx="60" cy="90" rx="20" ry="7" fill="#fff" ${ST}/><path d="M30 14L34 26M50 8L52 22M70 12L66 24" ${ST} stroke-width="2.4"/>`,
    21: () => `<ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="#3f8a4b" stroke-width="9"/>${[...Array(14)].map((_, i) => { const a = i * TAU / 14; return `<ellipse cx="${50 + 30 * Math.cos(a)}" cy="${50 + 40 * Math.sin(a)}" rx="7" ry="3.4" transform="rotate(${a * 180 / Math.PI + 90} ${50 + 30 * Math.cos(a)} ${50 + 40 * Math.sin(a)})" fill="#5db46a" ${ST} stroke-width="1"/>`; }).join('')}<circle cx="50" cy="34" r="7" fill="${SKIN}" ${ST}/><path d="M50 41L50 62M50 48L38 56M50 48L64 42M50 62L40 76M50 62L60 74" ${ST} stroke-width="3"/><path d="M22 84Q50 70 78 84" fill="none" stroke="${RED}" stroke-width="3"/>`
  };
  const EXC = () => `<path d="M30 40L20 14Q28 8 36 20Q40 4 50 10Q60 4 64 20Q72 8 80 14L70 40Z" fill="${RED}" ${ST}/><circle cx="20" cy="12" r="5" fill="${GOLD}" ${ST}/><circle cx="50" cy="8" r="5" fill="${GOLD}" ${ST}/><circle cx="80" cy="12" r="5" fill="${GOLD}" ${ST}/><ellipse cx="50" cy="52" rx="16" ry="17" fill="${SKIN}" ${ST}/><circle cx="43" cy="49" r="2" fill="${LINE}"/><circle cx="57" cy="49" r="2" fill="${LINE}"/><path d="M42 59Q50 66 58 59" fill="none" ${ST}/><path d="M30 40H70" stroke-linecap="round" stroke-width="5" stroke="#2b6fb5"/><path d="M26 70L50 66L74 70L80 92L20 92Z" fill="#2b6fb5" ${ST}/><path d="M50 66L38 92M50 66L62 92" ${ST} stroke-width="1.6"/><path d="M26 70L50 80L74 70" fill="${GOLD}" opacity=".9"/>`;
  function trumpFace(n) {
    const col = n <= 7 ? '#9c3d2c' : n <= 14 ? '#2b6489' : '#6a3f86', H = 172;
    return svgWrap(H, `<defs><radialGradient id="mg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fffbe9"/><stop offset="1" stop-color="#ecdcae"/></radialGradient></defs><rect x="1" y="1" width="98" height="170" rx="7" fill="#f7efd3" stroke="#b6a77a" stroke-width="1.3"/><rect x="4.5" y="4.5" width="91" height="163" rx="4" fill="none" stroke="${col}" stroke-width="1.4"/>` +
      `<rect x="8" y="8" width="84" height="22" rx="3" fill="${col}"/><text x="21" y="24.5" text-anchor="middle" font-family="${SERIF}" font-weight="800" font-size="17" fill="#fff">${n}</text><text x="62" y="24" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${ROMAN[n].length > 4 ? 12 : 15}" fill="#fff" letter-spacing="1">${ROMAN[n]}</text>` +
      `<circle cx="50" cy="86" r="43" fill="url(#mg)" stroke="${col}" stroke-width="1.6"/><circle cx="50" cy="86" r="39" fill="none" stroke="${col}" stroke-width=".7" stroke-dasharray="2 2.4"/><g transform="translate(15 51) scale(.7)" stroke-width="2">${EM[n]()}</g>` +
      `<rect x="8" y="142" width="84" height="22" rx="3" fill="${col}"/><text x="50" y="157" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${TNAME[n].length > 13 ? 8.2 : 9.4}" fill="#fff" letter-spacing=".4">${TNAME[n].toUpperCase()}</text>`);
  }
  function excuseFace() {
    const H = 172;
    return svgWrap(H, `<defs><radialGradient id="mg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fffbe9"/><stop offset="1" stop-color="#ecdcae"/></radialGradient></defs><rect x="1" y="1" width="98" height="170" rx="7" fill="#f7efd3" stroke="#b6a77a" stroke-width="1.3"/><rect x="4.5" y="4.5" width="91" height="163" rx="4" fill="none" stroke="#c9232d" stroke-width="1.4"/>` +
      `<rect x="8" y="8" width="84" height="22" rx="3" fill="#c9232d"/><path d="M21 12L23.6 19.6L31.6 19.8L25.2 24.6L27.6 32L21 27.6L14.4 32L16.8 24.6L10.4 19.8L18.4 19.6Z" fill="#fff" transform="translate(0 -3)"/><text x="62" y="24" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="12" fill="#fff" letter-spacing="1.4">EXCUSE</text>` +
      `<circle cx="50" cy="86" r="43" fill="url(#mg)" stroke="#c9232d" stroke-width="1.6"/><circle cx="50" cy="86" r="39" fill="none" stroke="#c9232d" stroke-width=".7" stroke-dasharray="2 2.4"/><g transform="translate(15 51) scale(.7)" stroke-width="2">${EXC()}</g>` +
      `<rect x="8" y="142" width="84" height="22" rx="3" fill="#c9232d"/><text x="50" y="157" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="9.4" fill="#fff" letter-spacing=".4">LE FOU</text>`);
  }
  const B_LABEL = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const T_LABEL = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'C', 'D', 'R'];
  function faceSvg(kind, id) {
    if (kind === 'b') {
      const s = id >> 3, r = id & 7, H = 140;
      if (r < 4) return pipFace(H, r + 7, s, B_LABEL[r]);
      if (r === 7) return pipFace(H, 1, s, 'A');
      return courtFace(H, ['J', 'Q', 'K'][r - 4], s, B_LABEL[r]);
    }
    if (id === 77) return excuseFace();
    if (id >= 56) return trumpFace(id - 55);
    const s = Math.floor(id / 14), r = id % 14, H = 172;
    if (r < 10) return pipFace(H, r + 1, s, T_LABEL[r]);
    return courtFace(H, ['J', 'C', 'Q', 'K'][r - 10], s, T_LABEL[r]);
  }
  function backSvg(kind) {
    const H = kind === 'b' ? 140 : 172;
    if (kind === 'b') {
      let l = '';
      for (let i = -6; i < 12; i++) l += `<path d="M${i * 10} 0L${i * 10 + 140} 140M${i * 10 + 140} 0L${i * 10} 140" stroke="#fff" stroke-width=".9" opacity=".5"/>`;
      return svgWrap(H, `<rect x="1" y="1" width="98" height="138" rx="7" fill="#fffdf6" stroke="#bdb6a4" stroke-width="1.3"/><clipPath id="bc"><rect x="7" y="7" width="86" height="126" rx="3"/></clipPath><rect x="7" y="7" width="86" height="126" rx="3" fill="#b3202c"/><g clip-path="url(#bc)">${l}</g><rect x="7" y="7" width="86" height="126" rx="3" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/><g transform="translate(50 70)"><circle r="21" fill="#8f1620" stroke="#fff" stroke-width="1.4"/>${[...Array(8)].map((_, i) => `<ellipse cx="0" cy="-12" rx="4" ry="9" transform="rotate(${i * 45})" fill="#fff" opacity=".9"/>`).join('')}<circle r="5" fill="#d9a62a"/></g>`);
    }
    let l = '';
    for (let i = -8; i < 14; i++) l += `<path d="M${i * 12} 0L${i * 12 + 172} 172M${i * 12 + 172} 0L${i * 12} 172" stroke="#d9a62a" stroke-width=".8" opacity=".55"/>`;
    return svgWrap(H, `<rect x="1" y="1" width="98" height="170" rx="7" fill="#fffdf6" stroke="#bdb6a4" stroke-width="1.3"/><clipPath id="bc"><rect x="7" y="7" width="86" height="158" rx="3"/></clipPath><rect x="7" y="7" width="86" height="158" rx="3" fill="#1d3a73"/><g clip-path="url(#bc)">${l}</g><rect x="7" y="7" width="86" height="158" rx="3" fill="none" stroke="#d9a62a" stroke-width="1.4"/><rect x="11" y="11" width="78" height="150" rx="2" fill="none" stroke="#d9a62a" stroke-width=".6"/><g transform="translate(50 86)"><circle r="23" fill="#14295a" stroke="#d9a62a" stroke-width="1.4"/>${star(0, 0, 18, 7, 8, '#d9a62a').replace(/stroke="[^"]*"/, 'stroke="#14295a"')}<circle r="4" fill="#c9232d"/></g>`);
  }
  const URLS = {};
  const dataUrl = svg => "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg).replace(/'/g, '%27') + "')";
  const faceUrl = (kind, id) => URLS[kind + id] || (URLS[kind + id] = dataUrl(faceSvg(kind, id)));
  const backUrl = kind => URLS[kind + 'bk'] || (URLS[kind + 'bk'] = dataUrl(backSvg(kind)));
  const B_TPW = [0, 1, 6, 4, 7, 2, 3, 5], B_TPT = [0, 0, 14, 10, 20, 3, 4, 11];
  const B_PPW = [0, 1, 2, 6, 3, 4, 5, 7], B_PPT = [0, 0, 0, 10, 2, 3, 4, 11];
  const bSuit = id => id >> 3;
  const bPow = (id, tr) => (id >> 3) === tr ? 10 + B_TPW[id & 7] : B_PPW[id & 7];
  const bPts = (id, tr) => (id >> 3) === tr ? B_TPT[id & 7] : B_PPT[id & 7];
  const B_LEVELS = [80, 90, 100, 110, 120, 130, 140, 150, 160, 250];
  const bLevelName = p => p === 250 ? T('Capot', 'Capot') : String(p);

  function bWin(tr, trick) {
    const led = trick[0].id >> 3;
    let bi = 0, bv = -1;
    for (let i = 0; i < trick.length; i++) {
      const id = trick[i].id, su = id >> 3;
      const v = su === tr ? 100 + B_TPW[id & 7] : su === led ? B_PPW[id & 7] : -1;
      if (v > bv) { bv = v; bi = i; }
    }
    return bi;
  }
  function bLegal(h, trick, tr, cls, seat) {
    if (!trick.length) return h.slice();
    const led = trick[0].id >> 3;
    const same = h.filter(i => (i >> 3) === led), trumps = h.filter(i => (i >> 3) === tr);
    let topT = -1;
    for (const c of trick) if ((c.id >> 3) === tr) topT = Math.max(topT, B_TPW[c.id & 7]);
    const higher = () => trumps.filter(i => B_TPW[i & 7] > topT);
    if (led === tr) {
      if (!trumps.length) return h.slice();
      const hi = higher();
      return hi.length ? hi : trumps;
    }
    if (same.length) return same;
    if (!trumps.length) return h.slice();
    const w = trick[bWin(tr, trick)].s;
    if (((w - seat) & 1) === 0) return h.slice();
    if (topT >= 0) {
      const hi = higher();
      if (hi.length) return hi;
      return cls ? trumps : h.slice();
    }
    return trumps;
  }
  function bWhy(h, trick, tr, cls, seat) {
    if (!trick.length) return '';
    const led = trick[0].id >> 3;
    const same = h.some(i => (i >> 3) === led), trumps = h.filter(i => (i >> 3) === tr);
    let topT = -1;
    for (const c of trick) if ((c.id >> 3) === tr) topT = Math.max(topT, B_TPW[c.id & 7]);
    const hi = trumps.some(i => B_TPW[i & 7] > topT);
    if (led === tr) return hi ? T('You must play a higher trump (monter à l’atout).', 'Vous devez monter à l’atout.') : T('You must play a trump (atout).', 'Vous devez jouer atout.');
    if (same) return T('You must follow suit (fournir).', 'Vous devez fournir à la couleur demandée.');
    if (!trumps.length) return '';
    if (topT >= 0 && hi) return T('You must over-trump (surcouper).', 'Vous devez surcouper.');
    if (topT >= 0 && cls) return T('You must play a trump, even a lower one (sous-couper).', 'Vous devez jouer atout, même plus faible (sous-coupe).');
    return T('You must trump (couper): your partner is not master.', 'Vous devez couper : votre partenaire n’est pas maître.');
  }
  const bRound10 = x => Math.round(x / 10) * 10;
  function bScoreHand(cls, ctr, tp, won, belSeat) {
    const c = ctr.s & 1, d = 1 - c;
    const bel = [0, 0];
    if (belSeat >= 0) bel[belSeat & 1] = 20;
    const out = { pts: [0, 0], score: [0, 0], made: false, litige: false, capot: won[0] === 8 ? 0 : won[1] === 8 ? 1 : -1, bel: bel.slice(), carry: 0 };
    const T0 = [tp[0] + bel[0], tp[1] + bel[1]];
    if (cls) {
      if (out.capot >= 0) { const t = out.capot; T0[t] = 252 + bel[t]; T0[1 - t] = bel[1 - t]; }
      out.pts = T0;
      if (T0[c] > T0[d]) { out.made = true; out.score = T0.slice(); }
      else if (T0[c] === T0[d]) { out.litige = true; out.score[d] = T0[d]; out.carry = T0[c]; }
      else { out.score[c] = bel[c]; out.score[d] = (out.capot === d ? 252 : 162) + bel[d]; }
      return out;
    }
    const cap = ctr.pts === 250, m = ctr.mult;
    out.pts = T0;
    if (cap) {
      const made = won[c] === 8;
      out.made = made;
      if (made) { out.score[c] = 500 * m + bel[c]; out.score[d] = bel[d]; }
      else { out.score[d] = 500 * m + bel[d]; out.score[c] = 0; }
      return out;
    }
    const made = T0[c] >= ctr.pts;
    out.made = made;
    const cc = out.capot === c, dc = out.capot === d;
    if (made) {
      if (m === 1) { out.score[c] = (cc ? 250 : bRound10(T0[c])) + ctr.pts; out.score[d] = cc ? bel[d] : bRound10(T0[d]); }
      else { out.score[c] = ((cc ? 250 : 160) + ctr.pts) * m + bel[c]; out.score[d] = bel[d]; }
    } else {
      out.score[d] = ((dc ? 250 : 160) + ctr.pts) * m + bel[d];
      out.score[c] = bel[c];
    }
    return out;
  }

  function bApply(RS, s, id) {
    const h = RS.h[s];
    h.splice(h.indexOf(id), 1);
    RS.P[id] = 1; RS.trick.push({ s, id });
    if (RS.trick.length === 4) {
      const w = RS.trick[bWin(RS.tr, RS.trick)].s;
      let p = 0;
      for (const c of RS.trick) p += bPts(c.id, RS.tr);
      RS.nt++;
      if (RS.nt === 8) p += 10;
      RS.tp[w & 1] += p; RS.won[w & 1]++; RS.trick = []; RS.turn = w;
      if (RS.nt === 8) RS.done = true;
    } else RS.turn = (s + 1) & 3;
  }
  function bPolicy(RS, s, noise) {
    const h = RS.h[s], tr = RS.tr, L = bLegal(h, RS.trick, tr, RS.cls, s);
    if (L.length === 1) return L[0];
    if (noise && Math.random() < noise) return L[(Math.random() * L.length) | 0];
    const P = RS.P;
    const master = id => {
      const su = id >> 3, pw = bPow(id, tr);
      for (let r = 0; r < 8; r++) { const o = su * 8 + r; if (o !== id && !P[o] && h.indexOf(o) < 0 && bPow(o, tr) > pw) return false; }
      return true;
    };
    const cheap = (a, b) => bPts(a, tr) - bPts(b, tr) || bPow(a, tr) - bPow(b, tr);
    const atk = RS.atk === (s & 1);
    if (!RS.trick.length) {
      const trs = L.filter(i => (i >> 3) === tr), pl = L.filter(i => (i >> 3) !== tr);
      let oppT = 0;
      for (let r = 0; r < 8; r++) { const o = tr * 8 + r; if (!P[o] && h.indexOf(o) < 0) oppT++; }
      if (trs.length && oppT > 0) {
        const top = trs.reduce((a, b) => bPow(a, tr) > bPow(b, tr) ? a : b);
        if (atk && (master(top) || trs.length >= 3)) return top;
        if (!atk && master(top) && trs.length >= 2) return top;
      }
      const ms = pl.filter(master);
      if (ms.length) return ms.reduce((a, b) => bPts(a, tr) >= bPts(b, tr) ? a : b);
      if (pl.length) {
        const safe = pl.filter(i => !RS.v || !RS.v[(s + 1) & 3] || !RS.v[(s + 1) & 3][i >> 3] || !RS.v[(s + 3) & 3] || !RS.v[(s + 3) & 3][i >> 3]);
        const pool = safe.length ? safe : pl;
        return pool.slice().sort(cheap)[0];
      }
      return trs.slice().sort(cheap)[0];
    }
    const wi = bWin(tr, RS.trick), w = RS.trick[wi], wp = (w.s & 1) === (s & 1), last = RS.trick.length === 3;
    if (wp) {
      const safe = last || (master(w.id) && (w.id >> 3) === (RS.trick[0].id >> 3) && RS.trick.length >= 1 && ((w.id >> 3) === tr || RS.trick.length === 3 || true));
      if (safe) {
        const nonT = L.filter(i => (i >> 3) !== tr);
        const pool = nonT.length ? nonT : L;
        return pool.slice().sort((a, b) => bPts(b, tr) - bPts(a, tr) || bPow(a, tr) - bPow(b, tr))[0];
      }
      return L.slice().sort(cheap)[0];
    }
    const wins = L.filter(id => bWin(tr, RS.trick.concat({ s, id })) === RS.trick.length);
    if (wins.length) return wins.slice().sort((a, b) => bPow(a, tr) - bPow(b, tr))[0];
    return L.slice().sort(cheap)[0];
  }
  function bSample(need, unk, voids, known, plaus) {
    const seats = [0, 1, 2, 3].filter(q => need[q] > 0);
    for (let att = 0; att < 60; att++) {
      const useV = att < 45, useP = att < 30;
      const pool = shuffle(unk.slice());
      const out = [[], [], [], []];
      const order = seats.slice().sort((a, b) => (voids ? voids[b].reduce((x, y) => x + y, 0) - voids[a].reduce((x, y) => x + y, 0) : 0));
      let ok = true;
      for (const q of order) {
        for (const k of known[q] || []) { out[q].push(k); const ix = pool.indexOf(k); if (ix >= 0) pool.splice(ix, 1); }
      }
      for (const q of order) {
        for (let i = 0; i < pool.length && out[q].length < need[q]; i++) {
          if (useV && voids && voids[q][pool[i] >> 3]) continue;
          out[q].push(pool[i]); pool.splice(i, 1); i--;
        }
        if (out[q].length < need[q]) { ok = false; break; }
        if (useP && plaus && !plaus(q, out[q])) { ok = false; break; }
      }
      if (ok) { out.rest = pool; return out; }
    }
    const pool = shuffle(unk.slice()), out = [[], [], [], []];
    for (const q of seats) { for (const k of known[q] || []) { out[q].push(k); const ix = pool.indexOf(k); if (ix >= 0) pool.splice(ix, 1); } while (out[q].length < need[q] && pool.length) out[q].push(pool.pop()); }
    out.rest = pool;
    return out;
  }
  const bNewRS = (h, tr, cls, atk, turn) => ({ h: h.map(x => x.slice()), trick: [], turn, tr, cls, atk, won: [0, 0], tp: [0, 0], nt: 0, P: new Uint8Array(32), done: false, v: null });
  const bCloneRS = RS => ({ h: RS.h.map(x => x.slice()), trick: RS.trick.slice(), turn: RS.turn, tr: RS.tr, cls: RS.cls, atk: RS.atk, won: RS.won.slice(), tp: RS.tp.slice(), nt: RS.nt, P: RS.P.slice(), done: RS.done, v: RS.v });
  function bBelOf(h, tr) {
    if (tr < 0) return -1;
    for (let q = 0; q < 4; q++) if (h[q].indexOf(tr * 8 + 6) >= 0 && h[q].indexOf(tr * 8 + 5) >= 0) return q;
    return -1;
  }
  function bRoll(RS, noise) {
    let guard = 0;
    while (!RS.done && guard++ < 40) { const s = RS.turn; bApply(RS, s, bPolicy(RS, s, noise)); }
  }

  function BeloteGame(opt) {
    const cls = opt.variant !== 'coinche';
    const S = {
      cls, variant: cls ? 'classic' : 'coinche', target: opt.target || 1000, humans: (opt.humans || [false, false, false, false]).slice(),
      scores: [0, 0], carry: 0, dealer: opt.dealer != null ? opt.dealer : rint(4), handNo: 0, phase: 'idle', turn: 0, leader: 0,
      hands: [[], [], [], []], rest: [], turned: -1, trump: -1, contract: null, hi: null, passes: 0, coinche: 0, round: 1,
      bids: [null, null, null, null], trick: [], trickWin: -1, last: null, nt: 0, won: [0, 0], tp: [0, 0], belSeat: -1, belN: 0,
      played: new Uint8Array(32), voids: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], hist: [], result: null, winner: -1,
      ready: [false, false, false, false], seq: 0, ev: [], ex: {}, hints: [null, null, null, null], surQ: [], over: false
    };
    if (opt.state) { Object.assign(S, opt.state); S.played = Uint8Array.from(opt.state.played); S.humans = (opt.humans || S.humans).slice(); }
    const E = (k, o) => { S.seq++; S.ev.push(Object.assign({ k, n: S.seq }, o || {})); if (S.ev.length > 16) S.ev.shift(); };
    const nx = s => (s + 1) & 3;
    function deal() {
      S.handNo++;
      const d = shuffle([...Array(32).keys()]);
      S.hands = [[], [], [], []]; S.trump = -1; S.contract = null; S.hi = null; S.passes = 0; S.coinche = 0; S.round = 1;
      S.bids = [null, null, null, null]; S.trick = []; S.trickWin = -1; S.last = null; S.nt = 0; S.won = [0, 0]; S.tp = [0, 0];
      S.belSeat = -1; S.belN = 0; S.played = new Uint8Array(32); S.voids = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      S.result = null; S.ex = {}; S.hints = [null, null, null, null]; S.surQ = []; S.ready = [false, false, false, false]; S.turned = -1; S.rest = [];
      const first = nx(S.dealer);
      if (cls) {
        let p = 0;
        for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) { const n = r === 0 ? 3 : 2, s = (first + q) & 3; for (let i = 0; i < n; i++) S.hands[s].push(d[p++]); }
        S.turned = d[p++]; S.rest = d.slice(p);
        S.phase = 'bid1';
      } else {
        let p = 0;
        for (const n of [3, 2, 3]) for (let q = 0; q < 4; q++) { const s = (first + q) & 3; for (let i = 0; i < n; i++) S.hands[s].push(d[p++]); }
        S.phase = 'bidC';
      }
      S.turn = first;
      E('deal', { dealer: S.dealer });
    }
    function startPlay() {
      S.belSeat = bBelOf(S.hands, S.trump);
      S.phase = 'play'; S.leader = S.turn = nx(S.dealer); S.trick = [];
      E('play-start', { trump: S.trump });
    }
    function redeal() { S.phase = 'redeal'; E('redeal'); }
    function take(seat, suit) {
      S.trump = suit; S.contract = { s: seat, suit, pts: 0, mult: 1 };
      const first = nx(S.dealer);
      S.ex = {};
      S.hands[seat].push(S.turned);
      S.ex[S.turned] = seat;
      for (let i = 0; i < 2; i++) S.hands[seat].push(S.rest.pop());
      for (let q = 0; q < 4; q++) { const s = (first + q) & 3; if (s === seat) continue; for (let i = 0; i < 3; i++) S.hands[s].push(S.rest.pop()); }
      S.rest = [];
      E('take', { s: seat, suit });
      startPlay();
    }
    function startCoinchePlay() {
      S.trump = S.hi.suit; S.contract = { s: S.hi.s, suit: S.hi.suit, pts: S.hi.pts, mult: S.coinche === 0 ? 1 : S.coinche === 1 ? 2 : 4 };
      startPlay();
    }
    function bidAct(seat, a) {
      if (S.phase === 'bid1' || S.phase === 'bid2') {
        if (a.k === 'pass') {
          S.bids[seat] = { k: 'pass' }; E('pass', { s: seat });
          S.turn = nx(seat);
          if (S.turn === nx(S.dealer)) {
            if (S.phase === 'bid1') { S.phase = 'bid2'; S.round = 2; S.bids = [null, null, null, null]; E('round2'); }
            else redeal();
          }
          return true;
        }
        if (a.k === 'take') {
          const su = S.phase === 'bid1' ? S.turned >> 3 : a.suit;
          if (!(su >= 0 && su < 4)) return false;
          if (S.phase === 'bid2' && su === S.turned >> 3) return false;
          S.bids[seat] = { k: 'take', suit: su };
          take(seat, su);
          return true;
        }
        return false;
      }
      if (S.phase === 'bidC') {
        if (a.k === 'pass') {
          S.bids[seat] = { k: 'pass' }; S.passes++; E('pass', { s: seat });
          if (!S.hi && S.passes >= 4) { redeal(); return true; }
          if (S.hi && S.passes >= 3) { startCoinchePlay(); return true; }
          S.turn = nx(seat); return true;
        }
        if (a.k === 'bid') {
          const pts = a.pts, su = a.suit;
          if (!B_LEVELS.includes(pts) || !(su >= 0 && su < 4)) return false;
          if (S.hi && pts <= S.hi.pts) return false;
          S.hi = { s: seat, pts, suit: su }; S.passes = 0; S.hints[seat] = { suit: su, pts };
          S.bids[seat] = { k: 'bid', pts, suit: su }; E('bid', { s: seat, pts, suit: su });
          S.turn = nx(seat); return true;
        }
        if (a.k === 'coinche') {
          if (!S.hi || ((S.hi.s - seat) & 1) === 0 || S.coinche) return false;
          S.coinche = 1; S.bids[seat] = { k: 'coinche' }; E('coinche', { s: seat });
          S.phase = 'sur'; S.surQ = [S.hi.s, (S.hi.s + 2) & 3]; S.turn = S.surQ[0];
          return true;
        }
        return false;
      }
      if (S.phase === 'sur') {
        if (a.k === 'sur') { S.coinche = 2; S.bids[seat] = { k: 'sur' }; E('sur', { s: seat }); startCoinchePlay(); return true; }
        if (a.k === 'pass') {
          S.surQ.shift();
          if (!S.surQ.length) { startCoinchePlay(); return true; }
          S.turn = S.surQ[0]; return true;
        }
      }
      return false;
    }
    function playAct(seat, id) {
      const h = S.hands[seat];
      if (h.indexOf(id) < 0) return false;
      const L = bLegal(h, S.trick, S.trump, cls, seat);
      if (L.indexOf(id) < 0) return false;
      h.splice(h.indexOf(id), 1);
      S.played[id] = 1;
      if (S.trick.length) {
        const led = S.trick[0].id >> 3, su = id >> 3;
        if (su !== led) { S.voids[seat][led] = 1; if (led === S.trump) S.voids[seat][S.trump] = 1; }
      }
      S.trick.push({ s: seat, id });
      E('card', { s: seat, id });
      if (seat === S.belSeat && (id === S.trump * 8 + 6 || id === S.trump * 8 + 5)) {
        S.belN++;
        E('belote', { s: seat, n: S.belN });
      }
      if (S.trick.length === 4) {
        S.trickWin = S.trick[bWin(S.trump, S.trick)].s;
        S.phase = 'trick'; E('trick-end', { w: S.trickWin });
      } else S.turn = nx(seat);
      return true;
    }
    function collect() {
      const w = S.trickWin;
      let p = 0;
      for (const c of S.trick) p += bPts(c.id, S.trump);
      S.nt++;
      S.ex = {};
      for (const c of S.trick) S.ex[c.id] = w;
      if (S.nt === 8) { p += 10; E('der', { s: w }); }
      S.tp[w & 1] += p; S.won[w & 1]++;
      S.last = { cards: S.trick.slice(), w, p };
      S.trick = []; S.trickWin = -1;
      if (S.nt === 8) return endHand();
      S.leader = S.turn = w; S.phase = 'play';
    }
    function endHand() {
      const res = bScoreHand(cls, S.contract, S.tp, S.won, S.belSeat);
      const c = S.contract.s & 1;
      let add = [res.score[0], res.score[1]];
      if (cls) {
        if (S.carry && !res.litige) { const win = res.made ? c : 1 - c; add[win] += S.carry; res.carryPaid = S.carry; res.carryTo = win; S.carry = 0; }
        if (res.litige) S.carry += res.carry;
      }
      S.scores[0] += add[0]; S.scores[1] += add[1];
      res.total = add; res.contract = Object.assign({}, S.contract); res.n = S.handNo; res.der = S.last ? S.last.w & 1 : -1;
      res.tp = S.tp.slice(); res.won = S.won.slice(); res.belSeat = S.belSeat; res.carryNow = S.carry;
      S.result = res; S.hist.push({ n: S.handNo, c: S.contract.s, suit: S.contract.suit, pts: S.contract.pts, mult: S.contract.mult, made: res.made, litige: res.litige, add, pts2: res.pts });
      const t = S.target, a = S.scores[0], b = S.scores[1];
      if ((a >= t || b >= t) && a !== b) { S.over = true; S.winner = a > b ? 0 : 1; S.phase = 'over'; E('over', { w: S.winner }); }
      else S.phase = 'hand';
      if (S.phase === 'hand') E('hand-end');
      S.ready = [!S.humans[0], !S.humans[1], !S.humans[2], !S.humans[3]];
    }
    const api = {
      S,
      start() { deal(); },
      act(seat, a) {
        if (!a || typeof a.k !== 'string') return false;
        S.ex = S.phase === 'trick' ? S.ex : S.ex;
        const ph = S.phase;
        if (ph === 'hand' || ph === 'over') {
          if (a.k !== 'ready') return false;
          S.ready[seat] = true;
          if (ph === 'hand' && S.ready.every(Boolean)) { S.dealer = nx(S.dealer); deal(); }
          return true;
        }
        if (seat !== S.turn) return false;
        if (ph === 'play') { if (a.k !== 'play') return false; return playAct(seat, a.id | 0); }
        if (ph === 'bid1' || ph === 'bid2' || ph === 'bidC' || ph === 'sur') return bidAct(seat, a);
        return false;
      },
      waiting() {
        const ph = S.phase;
        if (ph === 'trick') return { kind: 'auto', ms: 950 };
        if (ph === 'redeal') return { kind: 'auto', ms: 1700 };
        if (ph === 'hand') return S.ready.every(Boolean) ? { kind: 'auto', ms: 300 } : { kind: 'ready' };
        if (ph === 'over') return { kind: 'ready' };
        if (ph === 'idle') return null;
        return { kind: 'seat', seat: S.turn };
      },
      advance() {
        const ph = S.phase;
        if (ph === 'trick') { collect(); return true; }
        if (ph === 'redeal') { S.dealer = nx(S.dealer); deal(); return true; }
        if (ph === 'hand') { S.dealer = nx(S.dealer); deal(); return true; }
        return false;
      },
      legal(seat) { return S.phase === 'play' && S.turn === seat ? bLegal(S.hands[seat], S.trick, S.trump, cls, seat) : []; },
      why(seat, id) { return bWhy(S.hands[seat], S.trick, S.trump, cls, seat); },
      view(seat) {
        const sortH = h => h.slice().sort((a, b) => {
          const sa = a >> 3, sb = b >> 3;
          if (sa !== sb) { if (sa === S.trump) return -1; if (sb === S.trump) return 1; return sa - sb; }
          return bPow(b, S.trump) - bPow(a, S.trump);
        });
        const V = {
          g: 'belote', cls, n: 4, me: seat, phase: S.phase, turn: S.turn, dealer: S.dealer, handNo: S.handNo, trump: S.trump,
          hand: sortH(S.hands[seat]), counts: S.hands.map(x => x.length), trick: S.trick.slice(), trickWin: S.trickWin,
          turned: S.phase === 'bid1' || S.phase === 'bid2' ? S.turned : -1, contract: S.contract, hi: S.hi, bids: S.bids.map(x => x && Object.assign({}, x)), coinche: S.coinche,
          scores: S.scores.slice(), target: S.target, carry: S.carry, won: S.won.slice(), nt: S.nt, last: S.last, hist: S.hist, result: S.result,
          winner: S.winner, ready: S.ready.slice(), ev: S.ev.slice(), ex: Object.assign({}, S.ex), seq: S.seq, round: S.round, belSeat: S.belN ? S.belSeat : -1, belN: S.belN,
          legal: api.legal(seat), leader: S.leader, surQ: S.surQ.slice()
        };
        if (S.phase === 'hand' || S.phase === 'over') { V.reveal = null; }
        if (S.phase === 'bid1' || S.phase === 'bid2') V.turnedSuit = S.turned >> 3;
        return V;
      }
    };
    return api;
  }

  function bUnknown(S, seat) {
    const unk = [];
    for (let i = 0; i < 32; i++) if (!S.played[i] && S.hands[seat].indexOf(i) < 0) unk.push(i);
    return unk;
  }
  function bKnown(S, seat) {
    const known = [[], [], [], []];
    if (S.contract && S.cls && S.turned >= 0) { const t = S.contract.s; if (t !== seat && !S.played[S.turned]) known[t].push(S.turned); }
    return known;
  }
  function bPlaus(S) {
    return (q, hand) => {
      const hint = S.hints[q];
      if (!hint) return true;
      const su = hint.suit, tc = hand.filter(i => (i >> 3) === su);
      if (tc.length < (hint.pts >= 100 ? 3 : 2)) return false;
      return tc.some(i => (i & 7) === 4 || (i & 7) === 2 || (i & 7) === 7) || tc.length >= 4;
    };
  }
  function bAtk(S) { return S.contract ? (S.contract.s & 1) : -1; }
  function bHardMove(g, seat, L, N) {
    const S = g.S, tr = S.trump, unk = bUnknown(S, seat), need = [0, 0, 0, 0];
    for (let q = 0; q < 4; q++) if (q !== seat) need[q] = S.hands[q].length;
    const known = bKnown(S, seat), plaus = bPlaus(S);
    const sums = new Float64Array(L.length), me = seat & 1;
    for (let n = 0; n < N; n++) {
      const hs = bSample(need, unk, S.voids, known, plaus);
      hs[seat] = S.hands[seat].slice();
      const base = bNewRS(hs, tr, S.cls, bAtk(S), S.turn);
      base.tp = S.tp.slice(); base.won = S.won.slice(); base.nt = S.nt; base.P = S.played.slice(); base.v = S.voids;
      base.trick = S.trick.slice();
      const bel = S.belSeat >= 0 ? S.belSeat : -1;
      for (let i = 0; i < L.length; i++) {
        const RS = bCloneRS(base);
        bApply(RS, seat, L[i]);
        bRoll(RS, 0);
        const r = bScoreHand(S.cls, S.contract, RS.tp, RS.won, bel);
        sums[i] += r.score[me] - r.score[1 - me];
      }
    }
    let bi = 0;
    for (let i = 1; i < L.length; i++) if (sums[i] > sums[bi]) bi = i;
    return L[bi];
  }
  function bBidEval(S, seat, suit, N, opts) {
    const unk = [];
    const mine = S.hands[seat];
    for (let i = 0; i < 32; i++) if (mine.indexOf(i) < 0 && i !== S.turned) unk.push(i);
    const cls = S.cls, tr = suit, res = { n: 0, pts: [], succ: 0, avg: 0, cap: 0 };
    const need = [0, 0, 0, 0], plaus = cls ? null : bPlaus(S);
    for (let q = 0; q < 4; q++) if (q !== seat) need[q] = cls ? 8 : 8;
    const me = seat & 1;
    for (let n = 0; n < N; n++) {
      let pool = unk;
      if (cls) pool = unk.filter(i => i !== S.turned);
      const known = [[], [], [], []];
      const hs = bSample(need, pool, null, known, plaus);
      const mh = mine.slice();
      if (cls) { mh.push(S.turned); for (const x of hs.rest.slice(0, 2)) mh.push(x); }
      hs[seat] = mh;
      const base = bNewRS(hs, tr, cls, me, nx4(S.dealer));
      bRoll(base, 0);
      const bel = bBelOf(hs, tr);
      const r = bScoreHand(cls, { s: seat, pts: cls ? 0 : 80, mult: 1 }, base.tp, base.won, bel);
      const T0 = [base.tp[0] + (bel >= 0 && (bel & 1) === 0 ? 20 : 0), base.tp[1] + (bel >= 0 && (bel & 1) === 1 ? 20 : 0)];
      const mt = T0[me], ot = T0[1 - me];
      res.pts.push(base.won[me] === 8 ? 300 : mt);
      if (cls) { if (mt > ot) res.succ++; else if (mt === ot) res.succ += .5; if (base.won[me] === 8) res.cap++; }
      else if (base.won[me] === 8) res.cap++;
      res.avg += r.score[me] - r.score[1 - me];
      res.n++;
    }
    res.avg /= Math.max(1, res.n);
    return res;
  }
  const nx4 = s => (s + 1) & 3;
  function bProbAtLeast(pts, lvl) { let c = 0; for (const p of pts) if (lvl === 250 ? p >= 300 : p >= lvl) c++; return c / Math.max(1, pts.length); }
  function bPlayCard(g, seat, lvl) {
    const S = g.S, L = bLegal(S.hands[seat], S.trick, S.trump, S.cls, seat);
    if (L.length === 1) return L[0];
    if (lvl === 'Hard' && S.nt < 8) return bHardMove(g, seat, L, S.nt >= 5 ? 90 : 60);
    const RS = bNewRS(S.hands, S.trump, S.cls, bAtk(S), S.turn);
    RS.P = S.played; RS.trick = S.trick.slice(); RS.v = S.voids;
    return bPolicy(RS, seat, lvl === 'Easy' ? .35 : 0);
  }
  function bBot(g, seat, lvl) {
    const S = g.S;
    if (S.phase === 'play') return { k: 'play', id: bPlayCard(g, seat, lvl) };
    const N = lvl === 'Hard' ? 160 : lvl === 'Normal' ? 80 : 40;
    const noisy = lvl === 'Easy' ? .15 : 0;
    if (S.phase === 'bid1' || S.phase === 'bid2') {
      const sus = S.phase === 'bid1' ? [S.turned >> 3] : [0, 1, 2, 3].filter(x => x !== S.turned >> 3);
      let best = -1, bp = 0;
      for (const su of sus) {
        const r = bBidEval(S, seat, su, N);
        if (r.succ / r.n > bp) { bp = r.succ / r.n; best = su; }
      }
      const thr = (S.phase === 'bid1' ? .56 : .5) + (lvl === 'Easy' ? (Math.random() - .5) * .3 : 0);
      if (best >= 0 && bp >= thr + noisy * 0) return { k: 'take', suit: best };
      return { k: 'pass' };
    }
    if (S.phase === 'bidC') {
      const cur = S.hi ? S.hi.pts : 0;
      const partnerHi = S.hi && ((S.hi.s - seat) & 1) === 0;
      if (S.hi && !partnerHi && lvl !== 'Easy') {
        const unk = bUnknown(S, seat), need = [0, 0, 0, 0];
        for (let q = 0; q < 4; q++) if (q !== seat) need[q] = 8;
        const plaus = bPlaus(S);
        let fail = 0, n = 0;
        for (let i = 0; i < Math.floor(N * .8); i++) {
          const hs = bSample(need, unk, null, [[], [], [], []], plaus);
          hs[seat] = S.hands[seat].slice();
          const base = bNewRS(hs, S.hi.suit, false, S.hi.s & 1, nx4(S.dealer));
          bRoll(base, 0);
          const bel = bBelOf(hs, S.hi.suit), c = S.hi.s & 1;
          const tc = base.tp[c] + (bel >= 0 && (bel & 1) === c ? 20 : 0);
          const ok = S.hi.pts === 250 ? base.won[c] === 8 : tc >= S.hi.pts;
          if (!ok) fail++;
          n++;
        }
        if (fail / n >= (lvl === 'Hard' ? .72 : .8) && S.hi.pts >= 90) return { k: 'coinche' };
      }
      let bestSu = -1, bestLvl = 0, bestP = 0;
      for (let su = 0; su < 4; su++) {
        const r = bBidEval(S, seat, su, N);
        for (const lv of B_LEVELS) {
          if (lv <= cur) continue;
          const p = bProbAtLeast(r.pts, lv);
          const need = lv === 250 ? .55 : lv >= 140 ? .6 : .62;
          if (p >= need + (lvl === 'Easy' ? (Math.random() - .5) * .25 : 0) && lv >= bestLvl) { if (lv > bestLvl || p > bestP) { bestLvl = lv; bestSu = su; bestP = p; } }
        }
      }
      if (bestSu >= 0) {
        if (partnerHi) {
          const r = bBidEval(S, seat, S.hi.suit === bestSu ? bestSu : bestSu, N);
          if (bProbAtLeast(r.pts, Math.min(160, cur + 20)) < .7 || bestLvl < cur + 20) return { k: 'pass' };
        }
        const lv = Math.max(bestLvl > 160 ? 250 : Math.min(bestLvl, bestLvl), 0);
        return { k: 'bid', pts: lv, suit: bestSu };
      }
      return { k: 'pass' };
    }
    if (S.phase === 'sur') {
      const unk = bUnknown(S, seat), need = [0, 0, 0, 0];
      for (let q = 0; q < 4; q++) if (q !== seat) need[q] = 8;
      let ok = 0, n = 0;
      const c = S.hi.s & 1, N2 = Math.floor(N * .8);
      for (let i = 0; i < N2; i++) {
        const hs = bSample(need, unk, null, [[], [], [], []], null);
        hs[seat] = S.hands[seat].slice();
        const base = bNewRS(hs, S.hi.suit, false, c, nx4(S.dealer));
        bRoll(base, 0);
        const bel = bBelOf(hs, S.hi.suit);
        const tc = base.tp[c] + (bel >= 0 && (bel & 1) === c ? 20 : 0);
        if (S.hi.pts === 250 ? base.won[c] === 8 : tc >= S.hi.pts) ok++;
        n++;
      }
      return ok / n >= .88 && lvl !== 'Easy' ? { k: 'sur' } : { k: 'pass' };
    }
    return { k: 'pass' };
  }
  const TV = new Uint8Array(78), TP = new Int16Array(78), TS = new Uint8Array(78);
  for (let i = 0; i < 78; i++) {
    TS[i] = i >= 56 ? 4 : (i / 14) | 0;
    TP[i] = i >= 56 ? 100 + (i - 55) : i % 14;
    TV[i] = i === 77 || i === 56 || i === 76 ? 9 : i >= 56 ? 1 : ({ 13: 9, 12: 7, 11: 5, 10: 3 })[i % 14] || 1;
  }
  const tIsT = id => id >= 56 && id < 77;
  const tOud = id => id === 56 || id === 76 || id === 77;
  const T_NEED = [112, 102, 82, 72];
  const T_CFG = {
    3: { cs: 6, hs: 24, nd: 6, pg: [13, 15, 18] },
    4: { cs: 6, hs: 18, nd: 6, pg: [10, 13, 15] },
    5: { cs: 3, hs: 15, nd: 3, pg: [8, 10, 13] }
  };
  const T_BONUS = [20, 30, 40];
  const T_BIDS = [1, 2, 4, 6];
  const T_BIDNAME = v => v === 0 ? T('Pass', 'Passe') : v === 1 ? T('Petite', 'Prise') : v === 2 ? T('Garde', 'Garde') : v === 4 ? T('Garde sans', 'Garde sans') : T('Garde contre', 'Garde contre');
  const T_BIDFULL = v => v === 1 ? 'Prise' : T_BIDNAME(v);

  function tLed(trick) {
    for (const c of trick) if (c.id !== 77) return TS[c.id];
    return -1;
  }
  function tWinIdx(trick) {
    let bi = -1, bv = -1, led = -1;
    for (let i = 0; i < trick.length; i++) {
      const id = trick[i].id;
      if (id === 77) continue;
      if (led < 0) led = TS[id];
      const su = TS[id], v = su === 4 ? TP[id] : su === led ? TP[id] : -1;
      if (v > bv) { bv = v; bi = i; }
    }
    return bi < 0 ? 0 : bi;
  }
  function tLegal(h, trick, fr) {
    const led = tLed(trick);
    if (led < 0) {
      if (fr) { const L = h.filter(i => TS[i] !== fr.suit || i === fr.id); if (L.length) return L; }
      return h.slice();
    }
    const ex = h.indexOf(77) >= 0 ? [77] : [];
    const trumps = h.filter(i => i >= 56 && i < 77);
    let top = 0;
    for (const c of trick) if (c.id >= 56 && c.id < 77) top = Math.max(top, c.id - 55);
    if (led < 4) {
      const same = h.filter(i => i < 56 && TS[i] === led);
      if (same.length) return same.concat(ex);
    }
    if (!trumps.length) return h.slice();
    const hi = trumps.filter(i => i - 55 > top);
    return (hi.length ? hi : trumps).concat(ex);
  }
  function tWhy(h, trick, seat) {
    const led = tLed(trick);
    if (led < 0) return '';
    const trumps = h.filter(i => tIsT(i));
    let top = 0;
    for (const c of trick) if (tIsT(c.id)) top = Math.max(top, c.id - 55);
    if (led < 4 && h.some(i => i < 56 && TS[i] === led)) return T('You must follow suit.', 'Vous devez fournir à la couleur demandée.');
    if (!trumps.length) return '';
    const hi = trumps.some(i => i - 55 > top);
    if (led === 4) return hi ? T('You must play a higher trump (monter).', 'Vous devez monter à l’atout.') : T('You must play a trump (pisser).', 'Vous devez jouer atout (pisser).');
    if (top > 0) return hi ? T('You must over-trump (surcouper).', 'Vous devez surcouper.') : T('You must play a trump (sous-couper).', 'Vous devez sous-couper.');
    return T('You must trump (couper).', 'Vous devez couper.');
  }
  function tCount(tricks, camp, xT, xD, nT) {
    const P = [xT.slice(), xD.slice()];
    let pend = null;
    const pay = (o, w) => {
      const pile = P[o];
      let k = -1, bp = 99;
      for (let i = 0; i < pile.length; i++) { const id = pile[i]; if (id === 77 || TV[id] !== 1) continue; const p = id >= 56 ? 1 : 0; if (p < bp) { bp = p; k = i; if (!p) break; } }
      if (k < 0) return false;
      P[w].push(pile.splice(k, 1)[0]);
      return true;
    };
    let chelemEx = false;
    const wc = [];
    for (let k = 0; k < tricks.length; k++) {
      const tr = tricks[k], W0 = camp(tr.w), last = k === nT - 1;
      const ix = tr.cards.findIndex(c => c.id === 77);
      let W = W0;
      if (ix >= 0) {
        const O = camp(tr.cards[ix].s);
        const allPrev = k > 0 && wc.every(x => x === O);
        if (last && allPrev) { W = O; chelemEx = true; for (const c of tr.cards) P[O].push(c.id); }
        else if (last) { for (const c of tr.cards) P[W].push(c.id); }
        else {
          P[O].push(77);
          for (const c of tr.cards) if (c.id !== 77) P[W].push(c.id);
          if (W !== O && !pay(O, W)) pend = { o: O, w: W };
        }
      } else {
        for (const c of tr.cards) P[W].push(c.id);
        if (pend && pend.o === W && pay(W, pend.w)) pend = null;
      }
      wc.push(W);
    }
    let pts = 0, ou = 0;
    for (const id of P[0]) { pts += TV[id]; if (tOud(id)) ou++; }
    let pab = 0;
    const pk = chelemEx ? nT - 2 : nT - 1;
    if (pk >= 0 && tricks[pk] && tricks[pk].cards.some(c => c.id === 56)) pab = wc[pk] === 0 ? 1 : -1;
    const chelem = wc.length === nT && wc.every(x => x === 0) ? 1 : wc.length === nT && wc.every(x => x === 1) ? -1 : 0;
    return { pts, ou, pab, chelem, pile: [P[0].length, P[1].length], wc };
  }
  function tScore(n, taker, partner, bid, cnt, pgs, chAnn) {
    const need = T_NEED[Math.min(3, cnt.ou)], d = cnt.pts - need;
    const made = d >= 0, margin = Math.ceil(Math.abs(d) / 2), sg = made ? 1 : -1;
    const base = sg * (25 + margin) * bid;
    let pgB = 0;
    for (const p of pgs) pgB += sg * T_BONUS[p.lvl - 1];
    const pab = cnt.pab * 10 * bid;
    let ch = 0;
    if (cnt.chelem === 1) ch = chAnn ? 400 : 200;
    else if (cnt.chelem === -1) ch = -200;
    else if (chAnn) ch = -200;
    const T0 = base + pgB + pab + ch;
    const sc = new Array(n).fill(0);
    for (let s = 0; s < n; s++) {
      if (s === taker) sc[s] = n === 4 ? 3 * T0 : n === 3 ? 2 * T0 : partner >= 0 ? 2 * T0 : 4 * T0;
      else if (s === partner) sc[s] = T0;
      else sc[s] = -T0;
    }
    return { need: need / 2, pts: cnt.pts / 2, ou: cnt.ou, made, margin, base, pgB, pab, ch, T: T0, score: sc, diff: d / 2 };
  }

  function tSortHand(h) {
    return h.slice().sort((a, b) => {
      const ta = a >= 56, tb = b >= 56;
      if (ta !== tb) return ta ? -1 : 1;
      if (ta) return b - a;
      const sa = TS[a], sb = TS[b];
      return sa !== sb ? sa - sb : TP[b] - TP[a];
    });
  }
  function tPgLevels(h, cfg) {
    const tc = h.filter(tIsT).sort((a, b) => a - b), ex = h.indexOf(77) >= 0, out = [];
    for (let l = 0; l < 3; l++) {
      const t = cfg.pg[l];
      if (tc.length >= t) out.push({ lvl: l + 1, bonus: T_BONUS[l], ids: tc.slice(0, t) });
      else if (ex && tc.length === t - 1) out.push({ lvl: l + 1, bonus: T_BONUS[l], ids: tc.concat(77) });
    }
    return out;
  }
  function tEcartInfo(h, nd) {
    const cand = h.filter(i => !tOud(i) && !(i < 56 && i % 14 === 13));
    const nt = cand.filter(i => i < 56), tr = cand.filter(i => i >= 56);
    const needT = Math.max(0, nd - nt.length);
    return { ok: needT > 0 ? nt.concat(tr) : nt, needT, nt };
  }
  function tBotEcart(h, nd) {
    const info = tEcartInfo(h, nd);
    const len = [0, 0, 0, 0], hasK = [0, 0, 0, 0];
    for (const i of h) if (i < 56) { len[TS[i]]++; if (i % 14 === 13) hasK[TS[i]] = 1; }
    const nt = info.nt.slice().sort((a, b) => {
      const la = len[TS[a]] - (hasK[TS[a]] ? 6 : 0), lb = len[TS[b]] - (hasK[TS[b]] ? 6 : 0);
      if (la !== lb) return la - lb;
      if (TS[a] !== TS[b]) return TS[a] - TS[b];
      return TP[a] - TP[b];
    });
    const out = nt.slice(0, nd);
    if (out.length < nd) {
      const tr = info.ok.filter(i => i >= 56).sort((a, b) => a - b);
      for (const i of tr) { if (out.length >= nd) break; out.push(i); }
    }
    return out;
  }
  function tCallOptions(h) {
    for (const r of [13, 12, 11, 10]) {
      let c = 0;
      for (let s = 0; s < 4; s++) if (h.indexOf(s * 14 + r) >= 0) c++;
      if (c < 4) return [0, 1, 2, 3].map(s => s * 14 + r);
    }
    return [];
  }
  function tBotCall(h) {
    const opt = tCallOptions(h);
    const len = [0, 0, 0, 0];
    for (const i of h) if (i < 56) len[TS[i]]++;
    let best = opt[0], bs = -99;
    for (const id of opt) {
      const s = TS[id], own = h.indexOf(id) >= 0;
      const sc = (own ? -50 : 0) + len[s] * 1.0 + (Math.random() * .1);
      if (sc > bs) { bs = sc; best = id; }
    }
    return best;
  }

  function tNewR(n, hands, trick, turn, nt, nT, taker, camp, played, voids, tp, to) {
    return { n, h: hands, trick, turn, nt, nT, taker, camp, played, voids, tp, to, fr: null, wins: [0, 0], done: nt >= nT };
  }
  function tApplyR(R, s, id) {
    const h = R.h[s], ix = h.indexOf(id);
    if (ix >= 0) h.splice(ix, 1);
    R.played[id] = 1;
    const led = tLed(R.trick);
    if (id !== 77 && led >= 0) {
      const su = TS[id];
      if (su !== led) { R.voids[s][led] = 1; if (led < 4 && su !== 4) R.voids[s][4] = 1; }
    }
    R.trick.push({ s, id });
    if (R.trick.length < R.n) { R.turn = (s + 1) % R.n; return; }
    const tk = R.trick, last = R.nt === R.nT - 1, ei = tk.findIndex(c => c.id === 77);
    let w = tk[tWinIdx(tk)].s;
    const cmp = q => R.camp[q] === 0 ? 0 : 1;
    if (ei >= 0 && last && R.wins[cmp(tk[ei].s)] === R.nt) w = tk[ei].s;
    const WC = cmp(w);
    let tv = 0, ou = 0;
    for (const c of tk) { if (c.id === 77) continue; tv += TV[c.id]; if (tOud(c.id)) ou++; }
    if (ei >= 0) {
      const O = cmp(tk[ei].s);
      if (last || WC === O) { if (WC === 0) { tv += 9; ou++; } }
      else if (O === 0) { R.tp += 8; R.to++; }
      else tv += 1;
    }
    if (WC === 0) { R.tp += tv; R.to += ou; }
    R.wins[WC]++;
    R.nt++; R.trick = []; R.turn = w;
    if (R.nt >= R.nT) R.done = true;
  }

  function tMaster(R, h, id) {
    if (id === 77) return false;
    if (id >= 56) { for (let m = id + 1; m < 77; m++) if (!R.played[m] && h.indexOf(m) < 0) return false; return true; }
    const su = TS[id], base = su * 14;
    for (let r = (id % 14) + 1; r < 14; r++) { const o = base + r; if (!R.played[o] && h.indexOf(o) < 0) return false; }
    return true;
  }
  function tPolicy(R, s, noise) {
    const h = R.h[s];
    const L = tLegal(h, R.trick, R.fr && R.nt === 0 && s === R.taker ? R.fr : null);
    if (L.length === 1) return L[0];
    if (noise && Math.random() < noise) return L[(Math.random() * L.length) | 0];
    const n = R.n, camp = R.camp, me = camp[s];
    const ally = q => q === s || (camp[q] >= 0 && camp[q] === me);
    const foe = q => q !== s && !ally(q);
    const last = R.nt === R.nT - 1;
    const hasEx = L.indexOf(77) >= 0;
    const NE = L.filter(i => i !== 77);
    const led = tLed(R.trick);
    const lowest = (arr, avoidOud) => {
      let pool = arr;
      if (avoidOud) { const f = arr.filter(i => !tOud(i)); if (f.length) pool = f; }
      return pool.slice().sort((a, b) => TV[a] - TV[b] || TP[a] - TP[b])[0];
    };
    const voidFoe = su => { for (let q = 0; q < n; q++) if (foe(q) && R.voids[q][su]) return true; return false; };
    if (led < 0) {
      if (hasEx && R.nt >= R.nT - 3) return 77;
      const tr = NE.filter(tIsT), pl = NE.filter(i => i < 56);
      const atk = me === 0;
      let outT = 21;
      for (let m = 56; m < 77; m++) if (R.played[m] || h.indexOf(m) >= 0) outT--;
      if (tr.length && outT > 0) {
        const nz = tr.filter(i => i !== 56).sort((a, b) => b - a);
        const top = nz[0];
        if (atk && top !== undefined) {
          if (tMaster(R, h, top) && top !== 76) return top;
          if (tr.length >= 5) { const c = nz.find(i => i !== 76); if (c !== undefined) return c; }
        } else if (!atk && top !== undefined && tMaster(R, h, top) && top !== 76 && tr.length >= 3) return top;
      }
      const ms = pl.filter(i => tMaster(R, h, i) && !voidFoe(TS[i]));
      if (ms.length) return ms.sort((a, b) => TV[b] - TV[a])[0];
      if (hasEx && R.nt <= 3) return 77;
      if (pl.length) {
        const len = [0, 0, 0, 0];
        for (const i of pl) len[TS[i]]++;
        let bs = -1, bl = atk ? -1 : 99;
        for (let su = 0; su < 4; su++) {
          if (!len[su]) continue;
          if (atk ? len[su] > bl : len[su] < bl) { bl = len[su]; bs = su; }
        }
        const cs = pl.filter(i => TS[i] === bs).sort((a, b) => TP[a] - TP[b]);
        return cs[0];
      }
      if (hasEx) return 77;
      return lowest(tr, true);
    }
    const tk = R.trick, wi = tWinIdx(tk), wc = tk[wi], ws = wc.s;
    const lastTo = tk.length === n - 1;
    const wins = NE.filter(id => tWinIdx(tk.concat({ s, id })) === tk.length);
    let tv = 0;
    for (const c of tk) tv += TV[c.id];
    if (ally(ws)) {
      if (lastTo || tMaster(R, h, wc.id) || (wc.id >= 56 && wc.id - 55 >= 18)) {
        const pool = NE.filter(i => !tOud(i)), pp = pool.length ? pool : NE;
        const lead = led < 4 ? pp.filter(i => i < 56) : pp;
        const q = lead.length ? lead : pp;
        const c = q.slice().sort((a, b) => TV[b] - TV[a] || TP[a] - TP[b])[0];
        if (lastTo && NE.some(tOud) && !pool.length) return lowest(NE);
        return c;
      }
      return lowest(NE, true);
    }
    if (wins.length) {
      const cheap = wins.slice().sort((a, b) => TP[a] - TP[b]);
      let c = cheap.find(i => i !== 56) !== undefined ? cheap.find(i => i !== 56) : cheap[0];
      if (c >= 56 && led < 4 && !lastTo && tv <= 3 && !hasEx) {
        const alt = NE.filter(i => !wins.includes(i));
        if (alt.length) return lowest(alt, true);
      }
      return c;
    }
    if (hasEx && R.nt < R.nT - 1) return 77;
    return lowest(NE, true);
  }
  function tRoll(R, noise) {
    let guard = 0;
    while (!R.done && guard++ < 400) { const s = R.turn; tApplyR(R, s, tPolicy(R, s, noise)); }
  }
  function tCloneR(R) {
    return { n: R.n, h: R.h.map(x => x.slice()), trick: R.trick.slice(), turn: R.turn, nt: R.nt, nT: R.nT, taker: R.taker, camp: R.camp, played: R.played.slice(), voids: R.voids.map(x => x.slice()), tp: R.tp, to: R.to, fr: R.fr, wins: R.wins.slice(), done: R.done };
  }
  function tSample(need, unk, voids, known, plaus) {
    const seats = need.map((c, i) => i).filter(q => need[q] > 0);
    const n = need.length;
    for (let att = 0; att < 40; att++) {
      const useV = att < 30;
      const pool = shuffle(unk.slice());
      const out = new Array(n).fill(0).map(() => []);
      for (const q of seats) for (const k of known[q] || []) { out[q].push(k); const ix = pool.indexOf(k); if (ix >= 0) pool.splice(ix, 1); }
      const order = seats.slice().sort((a, b) => (voids ? voids[b].reduce((x, y) => x + y, 0) - voids[a].reduce((x, y) => x + y, 0) : 0));
      let ok = true;
      for (const q of order) {
        for (let i = 0; i < pool.length && out[q].length < need[q]; i++) {
          const id = pool[i];
          if (useV && voids && id !== 77 && voids[q][TS[id]]) continue;
          out[q].push(id); pool.splice(i, 1); i--;
        }
        if (out[q].length < need[q]) { ok = false; break; }
      }
      if (ok) { out.rest = pool; return out; }
    }
    const pool = shuffle(unk.slice()), out = new Array(n).fill(0).map(() => []);
    for (const q of seats) { for (const k of known[q] || []) { out[q].push(k); const ix = pool.indexOf(k); if (ix >= 0) pool.splice(ix, 1); } while (out[q].length < need[q] && pool.length) out[q].push(pool.pop()); }
    out.rest = pool;
    return out;
  }
  function tMakeCamp(n, taker, partner, seat, shown) {
    const c = new Array(n).fill(-1);
    c[taker] = 0;
    if (n < 5) { for (let q = 0; q < n; q++) c[q] = q === taker ? 0 : 1; return c; }
    if (seat === taker) { for (let q = 0; q < n; q++) c[q] = q === taker || q === partner ? 0 : 1; return c; }
    if (seat === partner) { for (let q = 0; q < n; q++) c[q] = q === taker || q === partner ? 0 : 1; return c; }
    c[seat] = 1;
    if (shown) { for (let q = 0; q < n; q++) c[q] = q === taker || q === partner ? 0 : 1; }
    return c;
  }
  const tCoef = c => c;
  function tFinalScore(R, bid) {
    const need = T_NEED[Math.min(3, R.to)], d = R.tp - need;
    return (d >= 0 ? 1 : -1) * (25 + Math.ceil(Math.abs(d) / 2)) * bid;
  }
  function tEvalContract(cfg, n, seat, hand, dealer, c, N, callId) {
    const unk = [];
    for (let i = 0; i < 78; i++) if (hand.indexOf(i) < 0) unk.push(i);
    const need = new Array(n).fill(cfg.hs);
    need[seat] = 0;
    let sum = 0, made = 0, chel = 0, cnt = 0;
    const known = new Array(n).fill(0).map(() => []);
    for (let k = 0; k < N; k++) {
      const hs = tSample(need, unk, null, known, null);
      const chien = hs.rest.slice(0, cfg.cs);
      let H = hand.slice(), xT = [];
      if (c <= 2) { H = H.concat(chien); const ec = tBotEcart(H, cfg.nd); H = H.filter(i => ec.indexOf(i) < 0); xT = ec; }
      else if (c === 4) xT = chien;
      hs[seat] = H;
      let partner = -1;
      if (n === 5) { const id = callId != null ? callId : tBotCall(hand); for (let q = 0; q < n; q++) if (q !== seat && hs[q].indexOf(id) >= 0) partner = q; }
      const camp = tMakeCamp(n, seat, partner, seat, true);
      const played = new Uint8Array(78);
      const R = tNewR(n, hs, [], (dealer + 1) % n, 0, cfg.hs, seat, camp, played, new Array(n).fill(0).map(() => [0, 0, 0, 0, 0]), 0, 0);
      let ptsX = 0, ouX = 0;
      for (const id of xT) { ptsX += TV[id]; if (tOud(id)) ouX++; }
      R.tp = ptsX; R.to = ouX;
      tRoll(R, 0);
      const sc = tFinalScore(R, c);
      sum += sc; cnt++;
      if (sc > 0) made++;
      if (R.wins[0] === R.nT) chel++;
    }
    return { ev: sum / cnt, p: made / cnt, chel: chel / cnt };
  }
  function tBidOk(hand, v) {
    let oud = 0, nt = 0, kg = 0, hi = 0;
    for (const id of hand) {
      if (tOud(id)) oud++;
      if (id >= 56 && id <= 76) { nt++; if (id >= 70) hi++; } else if (id < 56 && id % 14 === 13) kg++;
    }
    const hs = hand.length;
    if (v >= 6) return oud === 3 && nt >= Math.ceil(hs * .45) && kg >= 2 && hi >= 3;
    if (v >= 4) return oud >= 2 && nt >= Math.round(hs * .4) && kg >= 2 && hi >= 2;
    return oud >= 2 || (oud >= 1 && nt >= hs * .3) || nt >= hs * .45;
  }
  function tBotBid(S, seat, lvl) {
    const cfg = T_CFG[S.n], hand = S.hands[seat];
    const N = lvl === 'Hard' ? 36 : lvl === 'Normal' ? 20 : 8;
    let best = 0, bev = 0;
    const opts = T_BIDS.filter(v => v > S.hi);
    if (!opts.length) return 0;
    const cap = lvl === 'Easy' ? 2 : 6;
    const thr = lvl === 'Easy' ? 10 + Math.random() * 15 : (lvl === 'Normal' ? 8 : 6) * (S.n === 5 ? 1 : .25);
    for (const v of opts) {
      if (v > cap) continue;
      if (lvl !== 'Easy' && !tBidOk(hand, v)) continue;
      const r = tEvalContract(cfg, S.n, seat, hand, S.dealer, v, N, null);
      const ev = r.ev - (v >= 4 ? 8 : 0);
      if (ev > bev && (ev > thr || (v <= 2 && r.p >= .5))) { bev = ev; best = v; }
    }
    return best;
  }
  function tRSfromS(S, seat) {
    const n = S.n, cfg = T_CFG[n];
    const voids = S.voids.map(x => x.slice());
    const camp = tMakeCamp(n, S.taker, S.partner, seat, S.partnerShown);
    const hands = new Array(n).fill(0).map(() => []);
    hands[seat] = S.hands[seat].slice();
    const R = tNewR(n, hands, S.trick.slice(), S.turn, S.nt, S.nT, S.taker, camp, S.played.slice(), voids, 0, 0);
    R.fr = S.called >= 0 && S.nt === 0 ? { suit: TS[S.called], id: S.called } : null;
    return R;
  }
  function tSyncPoints(S, R) {
    const cnt = tCount(S.tricks, q => (q === S.taker || q === S.partner) ? 0 : 1, S.pileT, S.pileD, S.nT);
    R.tp = cnt.pts; R.to = cnt.ou;
    R.wins = [0, 0];
    for (const w of cnt.wc) R.wins[w]++;
    return R;
  }
  function tHardMove(g, seat, L, N) {
    const S = g.S, n = S.n;
    const unk = [];
    for (let i = 0; i < 78; i++) if (!S.played[i] && S.hands[seat].indexOf(i) < 0) unk.push(i);
    const need = new Array(n).fill(0);
    for (let q = 0; q < n; q++) if (q !== seat) need[q] = S.hands[q].length;
    const known = new Array(n).fill(0).map(() => []);
    if (seat !== S.taker && S.chienSeen) for (const id of S.chienSeen) if (!S.played[id]) known[S.taker].push(id);
    const atk = seat === S.taker || seat === S.partner;
    const sums = new Float64Array(L.length);
    for (let k = 0; k < N; k++) {
      const hs = tSample(need, unk, S.voids, known, null);
      hs[seat] = S.hands[seat].slice();
      const base = tSyncPoints(S, tRSfromS(S, seat));
      base.h = hs;
      let partner = S.partner;
      const camp = base.camp.slice();
      if (n === 5 && !S.partnerShown && seat !== S.taker && seat !== S.partner && S.called >= 0) {
        partner = -1;
        for (let q = 0; q < n; q++) if (q !== S.taker && q !== seat && hs[q].indexOf(S.called) >= 0) partner = q;
        for (let q = 0; q < n; q++) camp[q] = q === S.taker || q === partner ? 0 : 1;
      }
      base.camp = camp;
      for (let i = 0; i < L.length; i++) {
        const R = tCloneR(base);
        R.h[seat] = S.hands[seat].slice();
        tApplyR(R, seat, L[i]);
        tRoll(R, 0);
        const need2 = T_NEED[Math.min(3, R.to)], d = R.tp - need2;
        sums[i] += atk ? d : -d;
      }
    }
    let bi = 0;
    for (let i = 1; i < L.length; i++) if (sums[i] > sums[bi]) bi = i;
    return L[bi];
  }
  function tPlayCard(g, seat, lvl) {
    const S = g.S;
    const fr = S.called >= 0 && S.nt === 0 && seat === S.taker ? { suit: TS[S.called], id: S.called } : null;
    const L = tLegal(S.hands[seat], S.trick, fr);
    if (L.length === 1) return L[0];
    if (lvl === 'Hard' && S.nt < S.nT - 1) return tHardMove(g, seat, L, S.nt >= 8 ? 14 : 22);
    const R = tSyncPoints(S, tRSfromS(S, seat));
    return tPolicy(R, seat, lvl === 'Easy' ? .3 : 0);
  }
  function tBot(g, seat, lvl) {
    const S = g.S;
    switch (S.phase) {
      case 'bid': return { k: 'bid', v: tBotBid(S, seat, lvl) };
      case 'call': return { k: 'call', id: tBotCall(S.hands[seat]) };
      case 'ecart': return { k: 'ecart', ids: tBotEcart(S.hands[seat], T_CFG[S.n].nd) };
      case 'chelem': {
        if (lvl === 'Easy') return { k: 'chelem', v: false };
        const r = tEvalContract(T_CFG[S.n], S.n, seat, S.hands[seat], S.dealer, S.bid <= 2 ? 3 : S.bid, lvl === 'Hard' ? 40 : 24, S.called >= 0 ? S.called : null);
        return { k: 'chelem', v: r.chel >= (lvl === 'Hard' ? .8 : .88) };
      }
      case 'play': {
        const h = S.hands[seat];
        if (!S.pgDone[seat]) {
          const pn = g.pgOptions(seat);
          if (pn.length) return { k: 'poignee', lvl: pn[pn.length - 1].lvl };
        }
        return { k: 'play', id: tPlayCard(g, seat, lvl) };
      }
    }
    return { k: 'pass' };
  }

  function TarotGame(opt) {
    const n = opt.n || 4, cfg = T_CFG[n];
    const S = {
      n, humans: (opt.humans || []).slice(), target: opt.target == null ? 5 : opt.target, dealer: opt.dealer != null ? opt.dealer : rint(n),
      dealNo: 0, scores: new Array(n).fill(0), hist: [], phase: 'idle', turn: 0, hands: [], chien: [], taker: -1, bid: 0, hi: 0, hiSeat: -1,
      bids: new Array(n).fill(null), bidCount: 0, called: -1, partner: -1, partnerShown: false, chienSeen: null, pileT: [], pileD: [], ecartTr: [],
      chelem: false, tricks: [], trick: [], nt: 0, nT: cfg.hs, leader: 0, played: new Uint8Array(78), voids: [], pg: [], pgDone: new Array(n).fill(false),
      ready: new Array(n).fill(false), seq: 0, ev: [], ex: {}, over: false, winner: -1, result: null, reason: '', ps: -1, last: null, trickWin: -1, handNo: 0
    };
    if (opt.state) { Object.assign(S, opt.state); S.played = Uint8Array.from(opt.state.played); S.humans = (opt.humans || S.humans).slice(); }
    const E = (k, o) => { S.seq++; S.ev.push(Object.assign({ k, n: S.seq }, o || {})); if (S.ev.length > 20) S.ev.shift(); };
    const nx = s => (s + 1) % n;
    const campOf = q => (q === S.taker || q === S.partner) ? 0 : 1;
    function deal() {
      S.handNo++;
      const d = shuffle([...Array(78).keys()]);
      S.hands = new Array(n).fill(0).map((x, i) => d.slice(i * cfg.hs, (i + 1) * cfg.hs));
      S.chien = d.slice(n * cfg.hs);
      S.taker = -1; S.bid = 0; S.hi = 0; S.hiSeat = -1; S.bids = new Array(n).fill(null); S.bidCount = 0; S.called = -1; S.partner = -1;
      S.partnerShown = false; S.chienSeen = null; S.pileT = []; S.pileD = []; S.ecartTr = []; S.chelem = false; S.tricks = []; S.trick = []; S.nt = 0;
      S.nT = cfg.hs; S.played = new Uint8Array(78); S.voids = new Array(n).fill(0).map(() => [0, 0, 0, 0, 0]); S.pg = []; S.pgDone = new Array(n).fill(false);
      S.ready = new Array(n).fill(false); S.ex = {}; S.result = null; S.reason = ''; S.ps = -1; S.last = null; S.trickWin = -1;
      E('deal', { dealer: S.dealer });
      for (let s = 0; s < n; s++) {
        const tc = S.hands[s].filter(tIsT);
        if (tc.length === 1 && tc[0] === 56 && S.hands[s].indexOf(77) < 0) {
          S.ps = s; S.phase = 'redeal'; S.reason = 'petit-sec'; E('petit-sec', { s }); return;
        }
      }
      S.phase = 'bid'; S.turn = nx(S.dealer);
    }
    function afterBid() {
      if (!S.hi) { S.phase = 'redeal'; S.reason = 'allpass'; E('allpass'); return; }
      S.taker = S.hiSeat; S.bid = S.hi; S.turn = S.taker;
      E('taker', { s: S.taker, v: S.bid });
      if (n === 5) { S.phase = 'call'; return; }
      afterCall();
    }
    function afterCall() {
      if (S.bid <= 2) { S.phase = 'chien'; S.chienSeen = S.chien.slice(); E('chien-show', { ids: S.chien.slice() }); return; }
      if (S.bid === 4) S.pileT = S.pileT.concat(S.chien); else S.pileD = S.pileD.concat(S.chien);
      S.chien = [];
      S.phase = 'chelem'; S.turn = S.taker;
    }
    function startPlay() {
      S.phase = 'play'; S.leader = S.turn = S.chelem ? S.taker : nx(S.dealer); S.nT = S.hands[S.taker].length;
      E('play-start', { chelem: S.chelem });
    }
    function frOf(seat) { return S.called >= 0 && S.nt === 0 && seat === S.taker ? { suit: TS[S.called], id: S.called } : null; }
    function pgOptions(seat) {
      if (S.phase !== 'play' || S.pgDone[seat] || S.hands[seat].length !== S.nT) return [];
      return tPgLevels(S.hands[seat], cfg);
    }
    function playAct(seat, id) {
      const h = S.hands[seat];
      if (h.indexOf(id) < 0) return false;
      const L = tLegal(h, S.trick, frOf(seat));
      if (L.indexOf(id) < 0) return false;
      h.splice(h.indexOf(id), 1);
      S.pgDone[seat] = true;
      S.played[id] = 1;
      const led = tLed(S.trick);
      if (id !== 77 && led >= 0) {
        const su = TS[id];
        if (su !== led) { S.voids[seat][led] = 1; if (led < 4 && su !== 4) S.voids[seat][4] = 1; }
      }
      S.trick.push({ s: seat, id });
      E('card', { s: seat, id });
      if (id === S.called && !S.partnerShown) {
        S.partnerShown = true;
        if (S.partner >= 0) E('partner', { s: S.partner });
        else E('alone', { s: S.taker });
      }
      if (S.trick.length === n) {
        S.trickWin = S.trick[tWinIdx(S.trick)].s;
        S.phase = 'trick'; E('trick-end', { w: S.trickWin });
      } else S.turn = nx(seat);
      return true;
    }
    function collect() {
      let w = S.trickWin;
      const tk = S.trick, last = S.nt === S.nT - 1, ei = tk.findIndex(c => c.id === 77);
      S.ex = {};
      if (ei >= 0 && last) {
        const o = tk[ei].s, oc = campOf(o);
        if (S.tricks.length === S.nt && S.tricks.every(t0 => campOf(t0.w) === oc)) w = o;
      }
      S.tricks.push({ cards: tk.slice(), w });
      for (const c of tk) S.ex[c.id] = w;
      if (ei >= 0 && !last) { const o = tk[ei].s; if (campOf(o) === campOf(w)) S.ex[77] = w; else S.ex[77] = o; }
      S.last = { cards: tk.slice(), w };
      S.nt++; S.trick = []; S.trickWin = -1;
      if (S.nt === S.nT) return endHand();
      S.leader = S.turn = w; S.phase = 'play';
    }
    function endHand() {
      const cnt = tCount(S.tricks, campOf, S.pileT, S.pileD, S.nT);
      const sc = tScore(n, S.taker, S.partner, S.bid, cnt, S.pg, S.chelem);
      for (let s = 0; s < n; s++) S.scores[s] += sc.score[s];
      S.dealNo++;
      const won = new Array(n).fill(0);
      for (const t0 of S.tricks) won[t0.w]++;
      const res = Object.assign({}, sc, { n: S.dealNo, taker: S.taker, partner: S.partner, bid: S.bid, called: S.called, chelemAnn: S.chelem, chelemRes: cnt.chelem, pg: S.pg.slice(), won, pile: cnt.pile, dealer: S.dealer, pabRaw: cnt.pab });
      S.result = res;
      S.hist.push({ n: S.dealNo, taker: S.taker, partner: S.partner, bid: S.bid, made: sc.made, diff: sc.diff, T: sc.T, score: sc.score.slice(), ou: sc.ou, pts: sc.pts });
      if (S.target > 0 && S.dealNo >= S.target) {
        const m = Math.max.apply(null, S.scores);
        S.winner = S.scores.indexOf(m); S.over = true; S.phase = 'over'; E('over', { w: S.winner });
      } else { S.phase = 'hand'; E('hand-end'); }
      S.ready = S.humans.length ? new Array(n).fill(0).map((x, i) => !S.humans[i]) : new Array(n).fill(true);
    }
    const api = {
      S, cfg, pgOptions,
      start() { deal(); },
      act(seat, a) {
        if (!a || typeof a.k !== 'string') return false;
        const ph = S.phase;
        if (ph === 'hand' || ph === 'over') {
          if (a.k !== 'ready') return false;
          S.ready[seat] = true;
          if (ph === 'hand' && S.ready.every(Boolean)) { S.dealer = nx(S.dealer); deal(); }
          return true;
        }
        if (seat !== S.turn) return false;
        if (ph === 'bid') {
          if (a.k !== 'bid') return false;
          const v = a.v | 0;
          if (v !== 0 && (T_BIDS.indexOf(v) < 0 || v <= S.hi)) return false;
          S.bids[seat] = { v }; S.bidCount++;
          if (v) { S.hi = v; S.hiSeat = seat; }
          E('bid', { s: seat, v });
          if (S.bidCount === n) afterBid(); else S.turn = nx(seat);
          return true;
        }
        if (ph === 'call') {
          if (a.k !== 'call') return false;
          const id = a.id | 0;
          if (tCallOptions(S.hands[seat]).indexOf(id) < 0) return false;
          S.called = id; S.partner = -1;
          for (let q = 0; q < n; q++) if (q !== seat && S.hands[q].indexOf(id) >= 0) S.partner = q;
          E('call', { s: seat, id });
          afterCall();
          return true;
        }
        if (ph === 'ecart') {
          if (a.k !== 'ecart' || !Array.isArray(a.ids)) return false;
          const ids = Array.from(new Set(a.ids.map(x => x | 0)));
          const h = S.hands[seat], info = tEcartInfo(h, cfg.nd);
          if (ids.length !== cfg.nd) return false;
          if (!ids.every(i => info.ok.indexOf(i) >= 0)) return false;
          if (ids.filter(i => i >= 56).length !== info.needT) return false;
          S.hands[seat] = h.filter(i => ids.indexOf(i) < 0);
          S.pileT = S.pileT.concat(ids);
          S.ecartTr = ids.filter(i => i >= 56);
          E('ecart', { s: seat, tr: S.ecartTr.slice() });
          S.phase = 'chelem'; S.turn = S.taker;
          return true;
        }
        if (ph === 'chelem') {
          if (a.k !== 'chelem') return false;
          S.chelem = !!a.v;
          if (S.chelem) E('chelem', { s: seat });
          startPlay();
          return true;
        }
        if (ph === 'play') {
          if (a.k === 'poignee') {
            const o = pgOptions(seat).find(x => x.lvl === (a.lvl | 0));
            if (!o) return false;
            S.pgDone[seat] = true;
            S.pg.push({ s: seat, lvl: o.lvl, ids: o.ids.slice(), bonus: o.bonus });
            E('poignee', { s: seat, lvl: o.lvl, ids: o.ids.slice() });
            return true;
          }
          if (a.k === 'skip-pg') { S.pgDone[seat] = true; return true; }
          if (a.k !== 'play') return false;
          return playAct(seat, a.id | 0);
        }
        return false;
      },
      waiting() {
        const ph = S.phase;
        if (ph === 'idle') return null;
        if (ph === 'trick') return { kind: 'auto', ms: 1000 };
        if (ph === 'redeal') return { kind: 'auto', ms: S.reason === 'petit-sec' ? 3600 : 2000 };
        if (ph === 'chien') return { kind: 'auto', ms: 3200 };
        if (ph === 'hand') return S.ready.every(Boolean) ? { kind: 'auto', ms: 300 } : { kind: 'ready' };
        if (ph === 'over') return { kind: 'ready' };
        return { kind: 'seat', seat: S.turn };
      },
      advance() {
        const ph = S.phase;
        if (ph === 'trick') { collect(); return true; }
        if (ph === 'redeal') { S.dealer = nx(S.dealer); deal(); return true; }
        if (ph === 'chien') {
          S.hands[S.taker] = S.hands[S.taker].concat(S.chien); S.chien = [];
          S.phase = 'ecart'; S.turn = S.taker; E('chien-take');
          return true;
        }
        if (ph === 'hand') { S.dealer = nx(S.dealer); deal(); return true; }
        return false;
      },
      legal(seat) { return S.phase === 'play' && S.turn === seat ? tLegal(S.hands[seat], S.trick, frOf(seat)) : []; },
      why(seat) { return tWhy(S.hands[seat], S.trick, seat); },
      view(seat) {
        const shownP = S.partnerShown || seat === S.taker || seat === S.partner;
        const V = {
          g: 'tarot', n, me: seat, cfg, phase: S.phase, turn: S.turn, dealer: S.dealer, dealNo: S.dealNo, handNo: S.handNo,
          hand: tSortHand(S.hands[seat]), counts: S.hands.map(x => x.length), trick: S.trick.slice(), trickWin: S.trickWin, legal: api.legal(seat),
          taker: S.taker, bid: S.bid, hi: S.hi, hiSeat: S.hiSeat, bids: S.bids.map(x => x && Object.assign({}, x)), called: S.called,
          partner: shownP ? S.partner : -2, partnerShown: S.partnerShown, chien: S.phase === 'chien' ? S.chien.slice() : null, chienN: S.chien.length,
          ecartTr: S.ecartTr.slice(), chelem: S.chelem, pg: S.pg.map(p => ({ s: p.s, lvl: p.lvl, ids: p.ids.slice(), bonus: p.bonus })), nt: S.nt, nT: S.nT,
          last: S.last, scores: S.scores.slice(), target: S.target, hist: S.hist, result: S.result, winner: S.winner, ready: S.ready.slice(),
          ev: S.ev.slice(), ex: Object.assign({}, S.ex), seq: S.seq, reason: S.reason, ps: S.ps, leader: S.leader,
          won: (() => { const w = new Array(n).fill(0); for (const t0 of S.tricks) w[t0.w]++; return w; })()
        };
        if (S.phase === 'redeal' && S.reason === 'petit-sec') V.psHand = tSortHand(S.hands[S.ps]);
        if (S.phase === 'ecart' && seat === S.taker) { const info = tEcartInfo(S.hands[seat], cfg.nd); V.ecart = { nd: cfg.nd, ok: info.ok, needT: info.needT }; }
        if (S.phase === 'call' && seat === S.taker) V.callOpts = tCallOptions(S.hands[seat]);
        if (S.phase === 'play' && S.turn === seat) V.pgOpts = pgOptions(seat);
        return V;
      }
    };
    return api;
  }

  const TB_CSS = `
@@{display:block}
@@ [hidden]{display:none!important}
@@ .tb{--ar:1.6;position:relative;isolation:isolate;margin:0 auto;width:min(100%,1040px,calc((100dvh - var(--goff,250px))*var(--ar)));aspect-ratio:var(--ar);border-radius:1.1em;overflow:hidden;font-family:var(--sans);color:#fff;background:var(--f2);box-shadow:0 .6em 2em rgba(0,0,0,.32);user-select:none;-webkit-user-select:none;touch-action:manipulation;font-size:15px;line-height:1.2}
@@ .tb.belote{--f1:#2f8f55;--f2:#103f27;--f3:#0a2a1a;--acc:#ffd84a}
@@ .tb.tarot{--f1:#2a7d8f;--f2:#0e3b47;--f3:#08262f;--acc:#ffcf5a}
@@ .tb-felt{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,var(--f1) 0,var(--f2) 62%,var(--f3) 100%)}
@@ .tb-felt::before{content:'';position:absolute;inset:0;opacity:.16;background:repeating-linear-gradient(45deg,rgba(255,255,255,.55) 0 1px,transparent 1px 3px),repeating-linear-gradient(-45deg,rgba(0,0,0,.6) 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
@@ .tb-felt::after{content:'';position:absolute;inset:.5em;border-radius:.8em;border:.12em solid rgba(255,255,255,.09);box-shadow:inset 0 0 3em rgba(0,0,0,.28)}
@@ .tb-ring{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}
@@ .tb-ring svg{position:absolute;opacity:.1;transform:translate(-50%,-50%)}
@@ .tb-lay{position:absolute;inset:0;perspective:1400px}
@@ .nt .cd{transition:none!important}
@@ .cd{position:absolute;left:0;top:0;width:var(--cw);height:var(--ch);margin:calc(var(--ch)/-2) 0 0 calc(var(--cw)/-2);transition:transform .5s cubic-bezier(.22,.8,.25,1),opacity .4s;will-change:transform;perspective:700px;-webkit-tap-highlight-color:transparent;pointer-events:none}
@@ .cd .in{position:absolute;inset:0;transform-style:preserve-3d;transform:translateY(var(--lift,0)) rotateY(var(--fl,0deg));transition:transform .45s cubic-bezier(.3,.7,.3,1)}
@@ .cd .fr,@@ .cd .bk{position:absolute;inset:0;border-radius:6.5%/4.6%;background-size:100% 100%;background-repeat:no-repeat;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 .12em .4em rgba(0,0,0,.45)}
@@ .cd .fr{background-color:#fffdf6}
@@ .cd .bk{transform:rotateY(180deg)}
@@ .cd.me{pointer-events:auto;cursor:pointer}
@@ .cd.dim .fr{filter:brightness(.58) saturate(.8)}
@@ .cd.ok .fr{box-shadow:0 0 0 .14em rgba(255,222,89,.95),0 .12em .7em rgba(255,222,89,.55)}
@@ .cd.sel{--lift:-.9em}
@@ .cd.sel .fr{box-shadow:0 0 0 .18em #fff,0 .2em 1em rgba(255,255,255,.55)}
@@ .cd.win .fr{box-shadow:0 0 0 .2em var(--acc),0 0 1.4em var(--acc)}
@@ .cd.kb .fr{outline:.16em dashed #fff;outline-offset:.1em}
@media (hover:hover){@@ .cd.me.ok:hover{--lift:-.55em}@@ .cd.me.ok:hover{z-index:300!important}}
@@ .pl{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:.5em;padding:.28em .8em .28em .28em;border-radius:2em;background:rgba(6,18,12,.5);border:.14em solid rgba(255,255,255,.16);font:800 .95em var(--sans);white-space:nowrap;max-width:46%;transition:border-color .25s,box-shadow .25s,background .25s;z-index:400}
@@ .pl .av{flex:none;width:2.1em;height:2.1em;border-radius:50%;display:grid;place-items:center;font:900 1em var(--sans);color:#fff;border:.12em solid rgba(255,255,255,.7);text-shadow:0 .08em .1em rgba(0,0,0,.4)}
@@ .pl .nm{overflow:hidden;text-overflow:ellipsis;max-width:7.5em}
@@ .pl .sub{display:block;font:700 .72em var(--sans);opacity:.8;margin-top:.05em}
@@ .pl .tg{display:inline-block;margin-left:.35em;padding:.08em .5em;border-radius:1em;background:rgba(255,255,255,.18);font:900 .72em var(--sans)}
@@ .pl .tg.k{background:var(--acc);color:#2a1d00}
@@ .pl .tg.r{background:#e7433a}
@@ .pl.turn{border-color:var(--acc);background:rgba(10,30,20,.78);box-shadow:0 0 1.3em rgba(255,216,74,.45);animation:tbp 1.1s ease-in-out infinite alternate}
@@ .pl.ally{border-color:rgba(130,220,255,.55)}
@@ .pl .dl{display:inline-grid;place-items:center;width:1.4em;height:1.4em;margin-left:.35em;border-radius:50%;background:#fff;color:#222;font:900 .75em var(--sans)}
@keyframes tbp{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.045)}}
@@ .bb{position:absolute;transform:translate(-50%,-100%) scale(.7);opacity:0;padding:.35em .8em;border-radius:1em;background:#fff;color:#1a1a22;font:900 1em var(--sans);white-space:nowrap;box-shadow:0 .2em .6em rgba(0,0,0,.35);transition:opacity .2s,transform .25s cubic-bezier(.3,1.5,.5,1);z-index:520;pointer-events:none}
@@ .bb.on{opacity:1;transform:translate(-50%,-100%) scale(1)}
@@ .bb::after{content:'';position:absolute;left:50%;bottom:-.35em;width:.7em;height:.7em;background:inherit;transform:translateX(-50%) rotate(45deg)}
@@ .bb.hot{background:var(--acc);color:#2a1d00}
@@ .bb.red{background:#e7433a;color:#fff}
@@ .hud{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:.5em;padding:.5em .7em;z-index:600;pointer-events:none}
@@ .hud>*{pointer-events:auto}
@@ .hud .sp{flex:1;pointer-events:none}
@@ .chip{display:inline-flex;align-items:center;gap:.4em;min-height:2.2em;padding:0 .8em;border-radius:1.2em;background:rgba(6,18,12,.5);border:.12em solid rgba(255,255,255,.14);font:800 .9em var(--sans);white-space:nowrap}
@@ .chip b{font-weight:900;color:var(--acc)}
@@ .chip.big{font-size:1.1em}
@@ .ib{display:inline-grid;place-items:center;min-width:2.4em;height:2.4em;padding:0 .5em;border-radius:1.2em;border:.12em solid rgba(255,255,255,.2);background:rgba(6,18,12,.5);color:#fff;font:900 .9em var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent}
@@ .ib:hover{background:rgba(255,255,255,.14)}
@@ .ib:focus-visible,@@ .bt:focus-visible{outline:.18em solid #fff;outline-offset:.1em}
@@ .ib svg{width:1.3em;height:1.3em}
@@ .stl{position:absolute;left:50%;top:3.6em;transform:translateX(-50%);padding:.3em 1em;border-radius:1em;background:rgba(6,18,12,.55);font:800 .9em var(--sans);white-space:nowrap;z-index:590;max-width:92%;overflow:hidden;text-overflow:ellipsis;pointer-events:none;transition:opacity .25s}
@@ .ap{position:absolute;left:50%;transform:translateX(-50%);bottom:var(--ab,10em);display:flex;flex-wrap:wrap;gap:.5em;justify-content:center;align-items:center;padding:.7em .9em;border-radius:1.1em;background:rgba(6,22,14,.8);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);border:.12em solid rgba(255,255,255,.18);max-width:94%;z-index:560;box-shadow:0 .5em 1.6em rgba(0,0,0,.4);animation:tbin .28s cubic-bezier(.2,1.3,.4,1)}
@@ .ap .ln{flex:1 0 100%;display:flex;flex-wrap:wrap;gap:.4em;justify-content:center;align-items:center}
@@ .ap .tx{flex:1 0 100%;text-align:center;font:800 .95em var(--sans);opacity:.92}
@@ .ap .tx small{display:block;font:700 .8em var(--sans);opacity:.75;margin-top:.15em}
@keyframes tbin{from{opacity:0;transform:translateX(-50%) translateY(.6em)}to{opacity:1;transform:translateX(-50%)}}
@@ .bt{min-height:2.7em;padding:.2em 1.1em;border-radius:.9em;border:.14em solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:900 1em var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .15s,opacity .15s;display:inline-flex;align-items:center;justify-content:center;gap:.4em}
@@ .bt:hover:not(:disabled){background:rgba(255,255,255,.2)}
@@ .bt:active:not(:disabled){transform:translateY(.08em) scale(.98)}
@@ .bt:disabled{opacity:.38;cursor:default}
@@ .bt.on{background:var(--acc);border-color:#fff;color:#241a00}
@@ .bt.go{background:linear-gradient(#4ccb6d,#1f8c3d);border-color:#c8ffd6}
@@ .bt.no{background:linear-gradient(#ff6a58,#cf2a1c);border-color:#ffd0c8}
@@ .bt.gold{background:linear-gradient(#ffdc5a,#e2a40b);border-color:#fff3c0;color:#2a1d00}
@@ .bt.blue{background:linear-gradient(#4a9af5,#1b5fba);border-color:#cfe4ff}
@@ .bt small{font:700 .72em var(--sans);opacity:.8}
@@ .bt .rs{color:#e7433a;font-size:1.15em}
@@ .bt.on .rs,@@ .bt.gold .rs{color:#c4231b}
@@ .bn{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.5);opacity:0;font:900 3.4em/1 var(--sans);letter-spacing:.02em;text-shadow:0 .06em 0 rgba(0,0,0,.4),0 0 .6em rgba(0,0,0,.45);white-space:nowrap;pointer-events:none;z-index:700;color:#fff}
@@ .bn small{display:block;margin-top:.2em;font:800 .32em var(--sans);letter-spacing:.06em;text-transform:uppercase;opacity:.9}
@@ .bn.go{animation:tbbn 1.5s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes tbbn{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}22%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
@@ .hint{position:absolute;left:50%;bottom:var(--hb,9em);transform:translateX(-50%);padding:.45em 1em;border-radius:1em;background:#e7433a;color:#fff;font:800 .95em var(--sans);z-index:650;opacity:0;pointer-events:none;transition:opacity .2s;max-width:92%;text-align:center}
@@ .hint.on{opacity:1}
@@ .pane{position:absolute;inset:0;z-index:800;display:flex;align-items:center;justify-content:center;padding:.8em;background:rgba(3,14,9,.62);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
@@ .pane.clr{background:rgba(3,14,9,.18);-webkit-backdrop-filter:none;backdrop-filter:none}
@@ .box{width:100%;max-width:27em;margin:auto;background:linear-gradient(#22402f,#10241a);border:.18em solid rgba(255,255,255,.17);border-radius:1.3em;padding:1.1em 1.2em;text-align:center;box-shadow:0 1.2em 3em rgba(0,0,0,.5);animation:tbpop .32s cubic-bezier(.2,1.4,.4,1)}
@@ .tarot .box{background:linear-gradient(#1c4553,#0c242d)}
@@ .box.wide{max-width:38em}
@@ .box h3{margin:.1em 0 .45em;font:900 1.6em var(--sans)}
@@ .box p{margin:.4em 0;font:700 .98em/1.4 var(--sans);color:rgba(255,255,255,.86)}
@@ .box .kk{font:900 .74em var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin:0}
@keyframes tbpop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
@@ .box .big{display:block;width:100%;min-height:3.3em;margin:.55em 0;font-size:1.15em}
@@ .opt{display:flex;align-items:center;gap:.7em;margin:.55em 0;text-align:left}
@@ .opt>span{flex:0 0 32%;font:800 .9em/1.2 var(--sans);color:rgba(255,255,255,.85)}
@@ .seg{flex:1;display:flex;gap:.35em}
@@ .seg button{flex:1;min-height:2.6em;border-radius:.8em;border:.14em solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 .9em var(--sans);padding:0 .2em;cursor:pointer}
@@ .seg button.on{background:var(--acc);border-color:#fff;color:#241a00}
@@ .row{display:flex;justify-content:center;flex-wrap:wrap;gap:.4em;margin-top:.3em}
@@ .logo{font:900 2.8em/1 var(--sans);letter-spacing:-.01em;margin:.1em 0 .1em;color:var(--acc);text-shadow:0 .06em 0 rgba(0,0,0,.45)}
@@ .logo small{display:block;font:800 .3em var(--sans);letter-spacing:.2em;color:#fff;opacity:.85;margin-top:.5em;text-transform:uppercase}
@@ .cards{display:flex;justify-content:center;margin:.3em 0 .6em;height:6.3em}
@@ .cards i{display:block;width:4.3em;height:6.2em;margin:0 -.9em;border-radius:.4em;background-size:100% 100%;box-shadow:0 .2em .6em rgba(0,0,0,.5);transform:rotate(var(--r,0deg)) translateY(var(--y,0))}
@@ .tb-tbl{width:100%;border-collapse:collapse;margin:.5em 0;font:800 .92em var(--sans)}
@@ .tb-tbl td,@@ .tb-tbl th{padding:.38em .35em;border-bottom:.08em solid rgba(255,255,255,.12);text-align:right}
@@ .tb-tbl th{font:900 .78em var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--acc);text-align:right}
@@ .tb-tbl td:first-child,@@ .tb-tbl th:first-child{text-align:left}
@@ .tb-tbl tr.sum td{border-top:.12em solid rgba(255,255,255,.4);font-weight:900;font-size:1.05em}
@@ .tb-tbl tr.me td{color:var(--acc)}
@@ .tb-tbl .pos{color:#7be58f}
@@ .tb-tbl .neg{color:#ff8b7d}
@@ .sheet{overflow:auto;max-height:55vh;-webkit-overflow-scrolling:touch}
@@ .sheet .tb-tbl th,@@ .sheet .tb-tbl td{white-space:nowrap}
@@ .rules{text-align:left;max-height:62vh;overflow:auto;padding-right:.4em}
@@ .rules h4{margin:.9em 0 .25em;font:900 1em var(--sans);color:var(--acc)}
@@ .rules p,@@ .rules li{font:700 .88em/1.45 var(--sans)}
@@ .rules ul{margin:.2em 0;padding-left:1.2em}
@@ .rules kbd{background:rgba(255,255,255,.15);border-radius:.3em;padding:0 .35em;font:800 .9em var(--sans)}
@@ .vic{font:900 2.2em/1.1 var(--sans);color:var(--acc);margin:.1em 0}
@@ .win-n{font:800 1em var(--sans);margin:.2em 0 .6em}
@@ .lt{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:750;background:rgba(3,14,9,.85);border:.14em solid rgba(255,255,255,.2);border-radius:1.1em;padding:.8em 1em;text-align:center;box-shadow:0 1em 2.5em rgba(0,0,0,.5);max-width:94%}
@@ .lt .cs{display:flex;justify-content:center;gap:.4em;flex-wrap:wrap}
@@ .lt .cs div{font:800 .72em var(--sans);opacity:.9}
@@ .lt .cs i{display:block;width:4em;height:5.8em;border-radius:.35em;background-size:100% 100%;margin:0 auto .2em;box-shadow:0 .15em .4em rgba(0,0,0,.5)}
@@ .lt .cs i.w{outline:.18em solid var(--acc);outline-offset:.05em}
@@ .pgs{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:740;padding:.6em .9em;border-radius:1em;background:rgba(3,14,9,.85);border:.14em solid var(--acc);text-align:center;animation:tbpop .3s ease;max-width:94%}
@@ .pgs .cs{display:flex;justify-content:center;flex-wrap:wrap}
@@ .pgs i{display:block;width:3.2em;height:5.5em;margin:0 -.35em;border-radius:.3em;background-size:100% 100%;box-shadow:0 .12em .3em rgba(0,0,0,.5)}
@@ .pgs b{display:block;margin-bottom:.4em;font:900 1em var(--sans);color:var(--acc)}
@@ .net{display:inline-flex;align-items:center;gap:.4em}
@@ .net i{width:.6em;height:.6em;border-radius:50%;background:#5be27a}
@@ .net.bad i{background:#ff5b4b}
@@ .tb.port .stl{top:3.4em;font-size:.82em}
@@ .tb.port .ap{padding:.5em .6em}
@@ .tb.port .bn{font-size:2.6em}
@@ .tb.port .chip{font-size:.82em}
@@ .tb.port .box{padding:.9em .9em}
@@ .tb.port .opt>span{flex-basis:30%}
@@ .bs{color:#fff}
@@ .bs.r{color:#ff6a5c}
@@ .bt.gold .bs,@@ .bt.on .bs,@@ .seg button.on .bs{color:#222}
@@ .bt.gold .bs.r,@@ .bt.on .bs.r,@@ .seg button.on .bs.r{color:#c4231b}
@@ .tb.port .hud{flex-wrap:wrap;row-gap:.35em}
@@ .tb.port .br{flex-basis:100%;height:0;order:8}
@@ .tb.port .r2{order:9}
@@ .tb.port .pl .nm{max-width:5.2em}
@@ .br{display:none}
@@ .tb.port .br{display:block}
@@ .hud .r2{margin-left:0}
@@ .chip small{opacity:.65;font-weight:700}
@@ .tb.port .stl{font-size:.8em}
@media (prefers-reduced-motion:reduce){@@ .cd{transition-duration:.01s!important}@@ .pl.turn{animation:none}}
`;

  const CPU_NAMES = ['Camille', 'Louis', 'Léa', 'Hugo', 'Manon', 'Jules', 'Chloé', 'Arthur', 'Inès', 'Gabin'];
  const AV_COL = ['#d2503f', '#3f7fd2', '#8a4fd2', '#d29a2e', '#2fa37a', '#d24f9a', '#5b6ad9', '#7a8f2a'];
  const SVGI = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICON = {
    last: SVGI('<rect x="3" y="6" width="9" height="13" rx="1.5" transform="rotate(-8 7 12)"/><rect x="11" y="5" width="9" height="13" rx="1.5" transform="rotate(8 15 11)"/>'),
    sheet: SVGI('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    exit: SVGI('<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>')
  };
  const cardLabel = (kind, id) => {
    if (kind === 'b') return ['7', '8', '9', '10', T('Jack', 'Valet'), T('Queen', 'Dame'), T('King', 'Roi'), T('Ace', 'As')][id & 7] + ' ' + SUIT_SYM[id >> 3];
    if (id === 77) return T('Excuse', 'Excuse');
    if (id >= 56) return T('Trump ', 'Atout ') + (id - 55);
    const r = id % 14, nm = r < 10 ? (r === 0 ? T('Ace', 'As') : String(r + 1)) : [T('Jack', 'Valet'), T('Knight', 'Cavalier'), T('Queen', 'Dame'), T('King', 'Roi')][r - 10];
    return nm + ' ' + SUIT_SYM[(id / 14) | 0];
  };

  function paneHtml(inner, cls) { return `<div class="box ${cls || ''}">${inner}</div>`; }

  function Table(root, api, A) {
    const kind = A.kind, CR = kind === 'b' ? 100 / 140 : 100 / 172;
    const opt = Object.assign(A.defaults(), api.load() || {});
    if (opt.lang === 'fr' || opt.lang === 'en') LANG = opt.lang;
    const save = () => { try { api.save(opt); } catch (e) {} };
    SND.muted = () => !!api.muted;
    const sfx = (n, d) => snd(n, d);
    const M = { mode: 'solo', role: 'local', eng: null, V: null, seat: 0, n: A.n || 4, names: [], human: [], pids: [], tok: 0, lastSeq: 0, handNo: -1, sel: -1, ecSel: [], kb: -1, kbOn: false, port: false, sched: null, ui: {}, paneName: '', paneBack: '', started: false, lvl: 'Normal', bubbles: [], conn: true, endT: 0, lastHtml: '', mounted: true };
    const G = { W: 0, H: 0, cw: 0, ch: 0, cx: 0, cy: 0 };
    const tbl = h('div', 'tb ' + A.cls);
    tbl.innerHTML = '<div class="tb-felt"></div><div class="tb-lay"></div><div class="tb-pls"></div><div class="hud"></div><div class="stl"></div><div class="hint"></div><div class="bn"></div>';
    root.append(tbl);
    const [feltEl, lay, pls, hud, stl, hint, bn] = Array.from(tbl.children);
    let ap = null, pane = null, lt = null, pgEl = null;
    const SP = new Map();
    const GEO = { hands: [], plates: [] };

    function fit() {
      const w = root.clientWidth;
      if (!w) return false;
      const port = w < 640;
      M.port = port;
      tbl.classList.toggle('port', port);
      tbl.style.setProperty('--ar', port ? '.62' : '1.6');
      const W = tbl.clientWidth, H = tbl.clientHeight;
      if (!W || !H) return false;
      G.W = W; G.H = H;
      tbl.style.fontSize = (W / (port ? 27 : 60)).toFixed(2) + 'px';
      G.ch = H * (port ? .168 : kind === 'b' ? .25 : .235); G.cw = G.ch * CR;
      tbl.style.setProperty('--cw', G.cw.toFixed(1) + 'px'); tbl.style.setProperty('--ch', G.ch.toFixed(1) + 'px');
      G.cx = W / 2; G.cy = H * (port ? .5 : .45);
      G.os = port ? .46 : .5; G.ts = port ? .76 : .82;
      geo();
      return true;
    }
    function geo() {
      const { W, H } = G, n = M.n, p = M.port;
      let hands, plates;
      if (!p) {
        if (n === 3) { hands = [null, [.76, .2], [.24, .2]]; plates = [[.1, .955], [.76, .075], [.24, .075]]; }
        else if (n === 5) { hands = [null, [.935, .55], [.72, .2], [.28, .2], [.065, .55]]; plates = [[.1, .955], [.9, .3], [.72, .075], [.28, .075], [.1, .3]]; }
        else { hands = [null, [.935, .55], [.5, .2], [.065, .55]]; plates = [[.1, .955], [.9, .25], [.5, .075], [.1, .25]]; }
      } else {
        if (n === 3) { hands = [null, [.74, .25], [.26, .25]]; plates = [[.2, .7], [.76, .17], [.24, .17]]; }
        else if (n === 5) { hands = [null, [.925, .58], [.74, .25], [.26, .25], [.075, .58]]; plates = [[.2, .7], [.78, .41], [.74, .17], [.26, .17], [.22, .41]]; }
        else { hands = [null, [.925, .55], [.5, .25], [.075, .55]]; plates = [[.2, .7], [.78, .37], [.5, .17], [.22, .37]]; }
      }
      GEO.hands = hands.map(a => a && { x: a[0] * W, y: a[1] * H });
      GEO.plates = plates.map(a => ({ x: a[0] * W, y: a[1] * H }));
    }
    const rel = s => (s - M.seat + M.n) % M.n;
    const dirOf = r => { const a = GEO.hands[r] || { x: G.cx, y: G.H }; const vx = a.x - G.cx, vy = a.y - G.cy, l = Math.hypot(vx, vy) || 1; return { x: vx / l, y: vy / l }; };
    function trickPlace(r, id) {
      const d = r === 0 ? { x: 0, y: 1 } : dirOf(r), s = G.ts;
      const rx = G.cw * s * (M.n === 5 ? .9 : .86), ry = G.ch * s * (M.n === 5 ? .44 : .4);
      return { x: G.cx + d.x * rx, y: G.cy + d.y * ry, r: ((id * 37) % 11 - 5) * 1.5, sc: s };
    }
    function handPlaces(count) {
      const { W, H } = G, port = M.port;
      const availW = W * (port ? .95 : kind === 't' ? .74 : .72);
      const minSp = G.cw * (kind === 't' ? .33 : .45);
      const per = Math.max(1, Math.floor((availW - G.cw) / minSp) + 1);
      const rows = Math.max(1, Math.ceil(count / per)), base = Math.ceil(count / rows);
      const out = [];
      const hy = H - G.ch / 2 - H * .012;
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / base), k = i - row * base, nr = Math.min(base, count - row * base);
        const sp = nr > 1 ? Math.min(G.cw * (kind === 't' ? .8 : .78), (availW - G.cw) / (nr - 1)) : 0;
        const mid = (nr - 1) / 2, off = nr > 1 ? (k - mid) / mid : 0;
        const x = W / 2 + (k - mid) * sp;
        const y = hy - (rows - 1 - row) * G.ch * .46 + (rows === 1 ? off * off * G.ch * .035 : 0);
        out.push({ x, y, r: rows === 1 ? off * 2.6 : 0, sc: 1 });
      }
      const top = hy - (rows - 1) * G.ch * .46 - G.ch / 2;
      G.handTop = top; G.rows = rows;
      return out;
    }
    function oppPlaces(r, count) {
      const a = GEO.hands[r], out = [];
      const side = a.x < G.W * .2 || a.x > G.W * .8, sc = G.os;
      const bw = G.cw * sc;
      if (side) {
        const span = G.H * (M.port ? .3 : .34), sp = count > 1 ? Math.min(bw * .5, span / (count - 1)) : 0;
        for (let k = 0; k < count; k++) out.push({ x: a.x, y: a.y + (k - (count - 1) / 2) * sp, r: a.x < G.W * .5 ? 90 : -90, sc });
      } else {
        const span = G.W * (M.n === 3 ? .26 : M.n === 5 ? .22 : .36), sp = count > 1 ? Math.min(bw * .5, span / (count - 1)) : 0;
        for (let k = 0; k < count; k++) { const o = count > 1 ? (k - (count - 1) / 2) / ((count - 1) / 2) : 0; out.push({ x: a.x + (k - (count - 1) / 2) * sp, y: a.y + o * o * G.ch * .02, r: o * 2, sc }); }
      }
      return out;
    }
    const deckPlace = () => ({ x: G.cx, y: G.cy, r: 0, sc: .8, fl: 180 });
    G.helpers = { deckPlace, trickPlace, rel, dirOf };

    function sprite(key, id) {
      let s = SP.get(key);
      if (!s) {
        const el = h('div', 'cd');
        el.innerHTML = '<div class="in"><div class="fr"></div><div class="bk"></div></div>';
        el.dataset.k = key;
        el.lastChild.lastChild.style.backgroundImage = backUrl(kind);
        lay.append(el);
        s = { key, el, inn: el.firstChild, fr: el.firstChild.firstChild, id: -1, fresh: true, cls: '' };
        SP.set(key, s);
      }
      if (id >= 0 && id !== s.id) { s.id = id; s.fr.style.backgroundImage = faceUrl(kind, id); s.el.dataset.id = id; s.el.setAttribute('aria-label', cardLabel(kind, id)); }
      return s;
    }
    function put(s, o) {
      const st = s.el.style, d = (o.dly || 0) + 'ms';
      st.transitionDelay = d; s.inn.style.transitionDelay = d;
      st.transform = `translate(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px) rotate(${(o.r || 0).toFixed(1)}deg) scale(${(o.sc == null ? 1 : o.sc).toFixed(3)})`;
      st.zIndex = o.z | 0; st.opacity = o.op == null ? 1 : o.op;
      s.inn.style.setProperty('--fl', (o.fl || 0) + 'deg');
    }
    function setCls(s, cls) {
      if (s.cls === cls) return;
      s.cls = cls; s.el.className = 'cd ' + cls;
    }
    function drop(s, dest) {
      SP.delete(s.key);
      if (dest) put(s, { x: dest.x, y: dest.y, r: 0, sc: .3, op: 0, z: 900, fl: s.fl });
      else s.el.style.opacity = 0;
      s.el.classList.remove('me');
      setTimeout(() => s.el.remove(), dest ? 700 : 450);
    }
    function clearSprites() { for (const s of SP.values()) s.el.remove(); SP.clear(); }
    function applyItems(items, V, dropDest) {
      const seen = new Set();
      for (const it of items) {
        seen.add(it.key);
        const s = sprite(it.key, it.id);
                if (s.fresh) {
          s.fresh = false;
          const f = it.instant ? it : (it.from || deckPlace());
          s.el.style.transition = 'none'; s.inn.style.transition = 'none';
          put(s, { x: f.x, y: f.y, r: f.r || 0, sc: f.sc == null ? .8 : f.sc, z: it.z, op: f.op == null ? 1 : f.op, fl: f.fl == null ? 180 : f.fl });
          void s.el.offsetWidth;
          s.el.style.transition = ''; s.inn.style.transition = '';
        }
        setCls(s, it.cls || '');
        s.fl = it.fl || 0;
        put(s, it);
      }
      for (const [k, s] of Array.from(SP)) if (!seen.has(k)) drop(s, dropDest ? dropDest(k, s) : null);
    }

    function platePos(r) {
      if (r === 0 && M.port) return { x: GEO.plates[0].x, y: Math.max(G.H * .6, (G.handTop || G.H * .8) - 1.7 * parseFloat(tbl.style.fontSize)) };
      return GEO.plates[r];
    }
    function buildPlates() {
      pls.innerHTML = '';
      for (let r = 0; r < M.n; r++) {
        const e = h('div', 'pl');
        e.innerHTML = '<div class="av"></div><div class="tx"><span class="nm"></span><span class="sub"></span></div>';
        pls.append(e);
      }
    }
    function placePlates() {
      Array.from(pls.children).forEach((e, r) => { const p = platePos(r); if (p) { e.style.left = p.x + 'px'; e.style.top = p.y + 'px'; } });
    }
    function updatePlates(V) {
      const kids = pls.children;
      if (kids.length !== M.n) buildPlates();
      for (let r = 0; r < M.n; r++) {
        const s = (M.seat + r) % M.n, e = pls.children[r], info = A.plate(V, s, M) || {};
        const name = M.names[s] || ('P' + (s + 1));
        const av = e.firstChild;
        av.style.background = AV_COL[s % AV_COL.length];
        av.textContent = M.human[s] ? name.charAt(0).toUpperCase() : '♟';
        const tx = e.lastChild;
        const nm = tx.firstChild;
        const html = esc(name) + (info.tags || '');
        if (nm.dataset.h !== html) { nm.dataset.h = html; nm.innerHTML = html; }
        tx.lastChild.textContent = info.sub || '';
        const turn = (V.phase === 'play' || V.phase === 'bid' || V.phase === 'bid1' || V.phase === 'bid2' || V.phase === 'bidC' || V.phase === 'sur' || V.phase === 'call' || V.phase === 'ecart' || V.phase === 'chelem') && V.turn === s;
        e.classList.toggle('turn', turn);
        e.classList.toggle('ally', !!info.ally);
      }
      placePlates();
    }

    function newHandReset(V) {
      clearSprites();
      M.handNo = V.handNo; M.sel = -1; M.ecSel = []; M.kb = -1; M.ui = {};
      M.dealt = true;
    }

    function render(V, instant) {
      if (!G.W && !fit()) return;
      const prev = M.V;
      M.V = V;
      const me = M.seat, n = M.n;
      if (V.handNo !== M.handNo) { newHandReset(V); }
      const dealing = M.dealt && !instant;
      const items = [];
      const hp = handPlaces(V.hand.length);
      const myPlay = V.phase === 'play' && V.turn === me;
      const legal = new Set(V.legal || []);
      V.hand.forEach((id, i) => {
        let cls = 'me';
        if (myPlay) cls += legal.has(id) ? ' ok' : ' dim';
        else { const st = A.cardState ? A.cardState(V, id, M) : ''; if (st) cls += ' ' + st; }
        if (M.sel === id || M.ecSel.indexOf(id) >= 0) cls += ' sel';
        if (M.kbOn && M.kb === i) cls += ' kb';
        const p = hp[i];
        items.push({ key: 'c' + id, id, x: p.x, y: p.y, r: p.r, sc: 1, z: 10 + i, fl: 0, cls, instant, dly: dealing ? (i * n) * 42 : 0, from: dealing ? deckPlace() : undefined });
      });
      for (let r = 1; r < n; r++) {
        const s = (me + r) % n, cnt = V.counts[s], pl = oppPlaces(r, cnt);
        for (let k = 0; k < cnt; k++) items.push({ key: 'b' + s + '_' + k, id: -1, x: pl[k].x, y: pl[k].y, r: pl[k].r, sc: pl[k].sc, z: 5 + k, fl: 180, instant, dly: dealing ? (k * n + r) * 42 : 0 });
      }
      V.trick.forEach((c, i) => {
        const r = rel(c.s), p = trickPlace(r, c.id);
        let from;
        if (r !== 0) { const hh = GEO.hands[r]; from = { x: hh.x, y: hh.y, r: 0, sc: G.os, fl: 180 }; }
        items.push({ key: 'c' + c.id, id: c.id, x: p.x, y: p.y, r: p.r, sc: p.sc, z: 100 + i, fl: 0, cls: V.phase === 'trick' && V.trickWin === c.s ? 'win' : '', instant, from });
      });
      if (A.center) for (const it of A.center(V, M, G, instant)) items.push(it);
      const dest = (k, s) => {
        const id = s.id;
        const ds = A.dropSeat ? A.dropSeat(V, prev, s) : null;
        if (ds != null && ds >= 0) return platePos(rel(ds));
        if (id >= 0 && V.ex && V.ex[id] != null && prev && prev.nt !== V.nt) return platePos(rel(V.ex[id]));
        if (id >= 0 && V.ex && V.ex[id] != null && prev && V.phase !== prev.phase && (prev.phase === 'trick')) return platePos(rel(V.ex[id]));
        if (prev && prev.phase === 'chien' && V.phase === 'ecart' && V.taker >= 0) return platePos(rel(V.taker));
        if (prev && prev.phase === 'ecart' && V.taker >= 0 && V.phase !== 'ecart') return platePos(rel(V.taker));
        return null;
      };
      applyItems(items, V, dest);
      M.dealt = false;
      if (dealing) { for (let i = 0; i < Math.min(10, V.hand.length); i++) sfx('deal', i * .09); }
      updatePlates(V);
      updateHud(V);
      updatePanel(V);
      updateStatus(V);
      updatePane(V);
      if (V.scores && M.mounted) api.score(A.scoreOf(V, me));
    }

    function updateHud(V) {
      const left = V.phase === 'idle' ? '' : (A.hud(V, M) || '');
      const on = M.mode === 'online' && V.phase !== 'idle';
      const L = T('Last trick', 'Dernier pli'), S2 = T('Scores', 'Marque');
      const btn = (a, ic, lab) => `<button class="ib" data-a="${a}" aria-label="${lab}" title="${lab}">${ic}</button>`;
      const icons = M.port ? btn('last', ICON.last, L) + btn('sheet', ICON.sheet, S2) + btn('more', '☰', T('Menu', 'Menu')) : btn('last', ICON.last, L) + btn('sheet', ICON.sheet, S2) + btn('rules', '?', T('Rules', 'Règles')) + btn('lang', LANG === 'fr' ? 'EN' : 'FR', 'Language') + btn('quit', ICON.exit, T('Leave', 'Quitter'));
      const html = `${left}<span class="sp"></span>${on ? `<span class="chip net ${M.conn ? '' : 'bad'}"><i></i><span>${M.role === 'host' ? T('Host', 'Hôte') : T('Online', 'En ligne')}</span></span>` : ''}${V.phase === 'idle' ? '' : icons}`;
      if (hud.dataset.h !== html) { hud.dataset.h = html; hud.innerHTML = html; }
    }
    function showMore() {
      M.paneBack = M.pane;
      showPane('more', paneHtml(`<h3>${esc(A.title)}</h3><button class="bt big" data-a="rules">${T('Rules', 'Règles')}</button><button class="bt big" data-a="lang">${LANG === 'fr' ? 'English' : 'Français'}</button><button class="bt big no" data-a="quit">${T('Leave', 'Quitter')}</button><div class="row"><button class="bt gold" data-a="close">${T('Close', 'Fermer')}</button></div>`));
    }
    function updateStatus(V) {
      const t = ap ? '' : A.status ? A.status(V, M) : '';
      stl.textContent = t || '';
      stl.style.opacity = t ? 1 : 0;
      const top = (G.handTop || G.H * .72) - 2.4 * parseFloat(tbl.style.fontSize);
      stl.style.top = 'auto'; stl.style.bottom = (G.H - top) + 'px';
      tbl.style.setProperty('--ab', (G.H - (G.handTop || G.H * .72) + .6 * parseFloat(tbl.style.fontSize)) + 'px');
      tbl.style.setProperty('--hb', (G.H - (G.handTop || G.H * .72) + .6 * parseFloat(tbl.style.fontSize)) + 'px');
    }
    function updatePanel(V) {
      const html = M.pane ? null : A.panel(V, M, M.ui);
      if (!html) { if (ap) { ap.remove(); ap = null; M.lastHtml = ''; } return; }
      if (html === M.lastHtml && ap) return;
      M.lastHtml = html;
      if (!ap) { ap = h('div', 'ap'); tbl.append(ap); }
      ap.innerHTML = html;
    }

    function showPane(name, html, cls) {
      hidePane(true);
      pane = h('div', 'pane' + (cls ? ' ' + cls : ''));
      pane.innerHTML = html;
      M.pane = name;
      tbl.append(pane);
      if (ap) { ap.remove(); ap = null; M.lastHtml = ''; }
    }
    function hidePane(silent) {
      if (pane) { pane.remove(); pane = null; }
      M.pane = '';
      if (!silent && M.V) updatePanel(M.V);
    }

    function bannerShow(html, sub, col) {
      bn.innerHTML = html + (sub ? `<small>${sub}</small>` : '');
      bn.style.color = col || '#fff';
      bn.classList.remove('go'); void bn.offsetWidth; bn.classList.add('go');
    }
    function bubble(seat, text, cls, ms) {
      const r = rel(seat), p = platePos(r);
      if (!p) return;
      const e = h('div', 'bb ' + (cls || ''), esc(text));
      e.style.left = p.x + 'px'; e.style.top = (p.y - parseFloat(tbl.style.fontSize) * 1.5) + 'px';
      tbl.append(e);
      requestAnimationFrame(() => e.classList.add('on'));
      setTimeout(() => { e.classList.remove('on'); setTimeout(() => e.remove(), 300); }, ms || 1700);
    }
    function showHint(text) {
      hint.textContent = text; hint.classList.add('on');
      clearTimeout(M.hintT); M.hintT = setTimeout(() => hint.classList.remove('on'), 2000);
    }
    const CTX = { banner: bannerShow, bubble, snd: sfx, hint: showHint, rel, M, G, platePos, opt };

    function processEvents(V, silent) {
      if (!V.ev) return;
      for (const e of V.ev) {
        if (e.n <= M.lastSeq) continue;
        M.lastSeq = e.n;
        if (silent) continue;
        if (e.k === 'deal') sfx('shuffle');
        else if (e.k === 'card') { sfx('play'); }
        else if (e.k === 'trick-end') sfx('sweep', .8);
        if (A.event) A.event(e, V, CTX);
      }
      M.lastSeq = Math.max(M.lastSeq, V.seq || 0);
    }

    function applyView(V, sync) {
      if (!V) return;
      if (V.phase === 'idle') return;
      if (!M.started) M.started = true;
      if (sync) { M.lastSeq = V.seq || 0; M.handNo = -1; }
      processEvents(V, !!sync);
      render(V, !!sync);
    }

    function act(a) {
      if (M.role === 'guest') { api.net.send({ t: 'act', a }); return true; }
      if (!M.eng) return false;
      if (M.eng.act(M.seat, a)) { publish(); return true; }
      return false;
    }
    function publish() {
      const e = M.eng;
      if (!e || !M.mounted) return;
      for (let q = 0; q < M.n; q++) {
        if (!M.human[q]) continue;
        if (q === M.seat) applyView(e.view(q));
        else if (M.pids[q]) api.net.sendTo(M.pids[q], { t: 'v', v: e.view(q) });
      }
      drive();
      saveHost();
    }
    const SK = 'gameplay:tbsave:' + kind;
    function saveHost() {
      if (M.mode !== 'online' || M.role !== 'host' || !M.eng) return;
      try {
        if (M.eng.S.phase === 'over') sessionStorage.removeItem(SK);
        else sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), n: M.n, seat: M.seat, names: M.names, human: M.human, opt: A.shareOpt(opt), s: M.eng.S }, (k, v) => ArrayBuffer.isView(v) ? Array.from(v) : v));
      } catch (e) {}
    }
    function drive() {
      M.sched = null;
      if (M.role === 'guest' || !M.eng || !M.mounted) return;
      const e = M.eng, w = e.waiting(), tok = M.tok;
      if (!w) return;
      const online = M.mode === 'online';
      const lastEv = e.S.ev[e.S.ev.length - 1];
      const extra = lastEv && (lastEv.k === 'deal') ? 1900 : 0;
      if (w.kind === 'auto') M.sched = { t: (w.ms + (w.ms > 1500 ? 0 : 0)) / 1000, tok, fn: () => { e.advance(); publish(); } };
      else if (w.kind === 'seat') {
        const q = w.seat;
        if (M.human[q]) {
          if (!online) return;
          M.sched = { t: 75, tok, fn: () => { api.toast(T('Auto-play for an idle player', 'Jeu automatique pour un joueur inactif')); botMove(q); } };
        } else M.sched = { t: (A.botDelay(e.S.phase) + extra) / 1000, tok, fn: () => botMove(q) };
      } else if (w.kind === 'ready') {
        if (online) M.sched = { t: 40, tok, fn: () => { for (let q = 0; q < M.n; q++) if (M.human[q] && q !== M.seat) e.act(q, { k: 'ready' }); publish(); } };
      }
    }
    function botMove(q) {
      const e = M.eng;
      if (!e) return;
      let a = null;
      try { a = A.bot(e, q, M.lvl); } catch (err) { a = null; }
      if (!a || !e.act(q, a)) { const fb = A.fallback(e, q); if (fb) e.act(q, fb); }
      publish();
    }
    api.loop(dt => {
      const s = M.sched;
      if (!s || s.tok !== M.tok) return;
      s.t -= dt;
      if (s.t <= 0) { M.sched = null; s.fn(); }
    });

    function seatNames(k, humans, players) {
      const pool = shuffle(CPU_NAMES.slice());
      const names = [];
      for (let q = 0; q < M.n; q++) {
        const hi = humans.indexOf(q);
        names[q] = hi >= 0 ? ((players && players[hi] && players[hi].name) || (hi === 0 ? T('You', 'Vous') : 'Player')) : pool.pop();
      }
      return names;
    }
    function newEngine() {
      M.lvl = opt.diff || 'Normal';
      M.eng = A.newEngine(opt, M.n, M.human.slice());
      M.eng.start();
      M.lastSeq = 0; M.handNo = -1;
    }
    function startSolo() {
      M.tok++; M.mode = 'solo'; M.role = 'local';
      M.n = A.soloN(opt); M.seat = 0; geo(); buildPlates();
      M.human = Array.from({ length: M.n }, (x, i) => i === 0);
      M.names = seatNames(M.n, [0], null); M.names[0] = T('You', 'Vous');
      M.pids = [];
      hidePane(); clearSprites(); M.V = null;
      newEngine(); publish();
    }
    function sendSetup(q) {
      const id = M.pids[q];
      if (id) api.net.sendTo(id, { t: 'setup', n: M.n, seat: q, names: M.names, human: M.human, opt: A.shareOpt(opt) });
    }
    function hostStart(r) {
      let sv = null;
      try {
        const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
        if (x && x.code && x.code === api.net.code && x.s && x.s.phase !== 'idle' && x.s.phase !== 'over' && Date.now() - x.at < 432e5) sv = x;
      } catch (e) {}
      if (!sv) { freshStart(r); return; }
      M.tok++; M.mode = 'online'; M.role = 'host'; M.rsv = { r, sv };
      const left = sv.human.filter((h, i) => h && i !== sv.seat && r.players.every(p => p.name !== sv.names[i])).length;
      showPane('resume', paneHtml(`<p class="kk">${T('Online', 'En ligne')}</p><h3>${T('Game in progress', 'Partie en cours')}</h3><p>${T('Saved game found, deal', 'Partie sauvegardée, donne')} ${sv.s.handNo || sv.s.dealNo || 1}.${left ? ' ' + T(left + ' missing player(s) will be replaced by a CPU.', left + ' joueur(s) absent(s) seront remplacés par un CPU.') : ''}</p><button class="bt go big" data-a="rsm">${T('Resume game', 'Reprendre la partie')}</button><button class="bt big" data-a="rnew">${T('New game', 'Nouvelle partie')}</button>`));
    }
    function resumeHost() {
      const { r, sv } = M.rsv; M.rsv = null;
      M.tok++; M.mode = 'online'; M.role = 'host';
      const n = sv.n, host = r.players[0];
      M.n = n; M.seat = sv.seat; M.names = sv.names.slice(); M.pids = new Array(n).fill(null); M.human = sv.human.slice();
      M.pids[M.seat] = host.id;
      const used = {}, rest = [];
      for (const g of r.players.slice(1)) {
        const q = M.names.findIndex((nm, i) => i !== M.seat && sv.human[i] && !used[i] && nm === g.name);
        if (q < 0) rest.push(g); else { used[q] = 1; M.pids[q] = g.id; }
      }
      for (let q = 0; q < n; q++) {
        if (q === M.seat || !sv.human[q] || used[q]) continue;
        const g = rest.shift();
        if (g) { M.pids[q] = g.id; M.names[q] = g.name; } else { M.human[q] = false; M.names[q] = M.names[q].replace(/ \(CPU\)$/, '') + ' (CPU)'; }
      }
      A.applyShared(opt, sv.opt); M.lvl = opt.diff || 'Normal';
      M.eng = A.newEngine(opt, n, M.human.slice(), sv.s);
      const ph = M.eng.S.phase;
      if (ph === 'hand') for (let q = 0; q < n; q++) if (!M.human[q]) M.eng.act(q, { k: 'ready' });
      geo(); buildPlates(); hidePane(); clearSprites(); M.V = null; M.lastSeq = 0; M.handNo = -1; M.started = false;
      for (let q = 0; q < n; q++) if (M.human[q] && q !== M.seat) { sendSetup(q); api.net.sendTo(M.pids[q], { t: 'v', v: M.eng.view(q), sync: 1 }); }
      applyView(M.eng.view(M.seat), true);
      api.toast(T('The host is back. Game resumed.', 'L’hôte est de retour. Partie reprise.'));
      drive(); saveHost();
    }
    function freshStart(r) {
      try { sessionStorage.removeItem(SK); } catch (e) {}
      M.tok++; M.mode = 'online'; M.role = 'host'; M.seat = 0;
      const live = r.players.filter((x, i) => !i || !(api.net.players.find(q => q.id === x.id) || {}).away);
      M.n = A.onlineN(r, live.length);
      const order = A.seatOrder(M.n, Math.min(live.length, M.n));
      M.human = new Array(M.n).fill(false); M.pids = new Array(M.n).fill(null);
      live.slice(0, order.length).forEach((p, i) => { M.human[order[i]] = true; M.pids[order[i]] = p.id; });
      M.seat = order[0];
      M.names = seatNames(M.n, order, live);
      geo(); buildPlates(); hidePane(); clearSprites(); M.V = null;
      newEngine();
      for (let q = 0; q < M.n; q++) if (M.human[q] && q !== M.seat) sendSetup(q);
      publish();
    }
    function rematch() {
      if (M.role === 'guest') return;
      if (M.mode === 'online') {
        M.tok++;
        for (let q = 0; q < M.n; q++) if (M.human[q] && q !== M.seat) sendSetup(q);
      } else M.tok++;
      hidePane(); clearSprites(); M.V = null;
      newEngine(); publish();
    }
    function seatToBot(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const who = M.names[q];
      M.pids[q] = null; M.human[q] = false; M.eng.S.humans[q] = false; M.names[q] = who + ' (CPU)';
      api.toast(T(`${who} left. A CPU takes the seat.`, `${who} est parti. Un CPU prend la place.`));
      for (let k = 0; k < M.n; k++) if (M.human[k] && k !== M.seat && M.pids[k]) api.net.sendTo(M.pids[k], { t: 'seats', names: M.names, human: M.human });
      const ph = M.eng.S.phase;
      if (ph === 'hand' || ph === 'over') M.eng.act(q, { k: 'ready' });
      publish();
    }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !M.human[q]) return;
      sendSetup(q);
      api.net.sendTo(id, { t: 'v', v: M.eng.view(q), sync: 1 });
    }
    let hooked = false;
    function hookNet() {
      if (hooked) return;
      hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; M.sched = null;
        sfx('lose');
        const hd = reason === 'kicked' ? T('You were removed', 'Vous avez été retiré') : reason === 'host-left' ? T('The host left', 'L’hôte est parti') : T('Connection lost', 'Connexion perdue');
        const tx = reason === 'kicked' ? T('The host removed you from the game.', 'L’hôte vous a retiré de la partie.') : reason === 'host-left' ? T('The host ended the game.', 'L’hôte a mis fin à la partie.') : T('The connection to the host was lost.', 'La connexion avec l’hôte a été perdue.');
        showPane('left', paneHtml(`<p class="kk">${T('Online', 'En ligne')}</p><h3>${hd}</h3><p>${tx}</p><button class="bt go big" data-a="lobby">${T('Online lobby', 'Salon en ligne')}</button><button class="bt big" data-a="solo">${T('Play vs CPU', 'Jouer contre le CPU')}</button>`));
      });
      api.interval(() => {
        if (M.mode !== 'online') return;
        const on = api.net.connected !== false;
        if (on !== M.conn) { M.conn = on; if (M.V) updateHud(M.V); }
      }, 1000);
    }
    async function startOnline() {
      hookNet();
      const tok = ++M.tok;
      hidePane(); clearSprites(); M.V = null; M.eng = null; M.sched = null;
      M.mode = 'online'; M.role = null;
      showPane('wait', paneHtml(`<p class="kk">${T('Online', 'En ligne')}</p><h3>${T('Opening lobby…', 'Ouverture du salon…')}</h3>`), 'clr');
      let r = null;
      try { r = await api.net.room(A.room(opt)); } catch (e) { r = null; }
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.mode = 'solo'; M.role = 'local'; showTitle(); return; }
      M.role = r.role;
      if (r.role === 'host') hostStart(r);
      else showPane('wait', paneHtml(`<p class="kk">${T('Online', 'En ligne')}</p><h3>${T('Connected!', 'Connecté !')}</h3><p>${T('Waiting for the host to deal…', 'En attente de la donne de l’hôte…')}</p><div class="row"><button class="bt" data-a="leave">${T('Leave', 'Quitter')}</button></div>`));
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === M.seat || !M.human[q]) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          if (M.eng.act(q, d.a)) publish();
          else api.net.sendTo(from, { t: 'v', v: M.eng.view(q), sync: 1 });
        }
      } else {
        if (d.t === 'setup') {
          M.tok++; M.role = 'guest'; M.seat = d.seat; M.n = d.n; M.names = d.names; M.human = d.human;
          if (d.opt) A.applyShared(opt, d.opt);
          M.lvl = opt.diff || 'Normal';
          geo(); buildPlates(); hidePane(); clearSprites(); M.V = null; M.lastSeq = 0; M.handNo = -1; M.started = false;
        } else if (M.role !== 'guest') return;
        else if (d.t === 'v') { if (M.pane === 'wait') hidePane(true); applyView(d.v, !!d.sync); }
        else if (d.t === 'seats') { M.names = d.names; M.human = d.human; if (M.V) updatePlates(M.V); }
      }
    }

    function updatePane(V) {
      if (M.pane && M.pane !== 'end' && M.pane !== 'over' && M.pane !== 'wait') return;
      clearTimeout(M.endT);
      if (V.phase === 'hand') {
        M.endT = setTimeout(() => {
          if (!M.V || M.V.phase !== 'hand') return;
          const html = A.endPane(M.V, M);
          if (M.pane === 'end' && pane && pane.dataset.h === html) return;
          showPane('end', html, 'clr'); pane.dataset.h = html;
        }, M.pane === 'end' ? 0 : 1100);
      } else if (V.phase === 'over') {
        M.endT = setTimeout(() => {
          if (!M.V || M.V.phase !== 'over') return;
          const html = A.overPane(M.V, M);
          if (M.pane === 'over' && pane && pane.dataset.h === html) return;
          showPane('over', html); pane.dataset.h = html;
          sfx(A.won(M.V, M.seat) ? 'win' : 'lose');
        }, M.pane === 'over' ? 0 : 1300);
      } else if (M.pane === 'end' || M.pane === 'over') hidePane();
    }

    function showTitle() {
      M.tok++; M.sched = null; M.eng = null; M.mode = 'solo'; M.role = 'local';
      if (M.pane === 'title') return;
      clearSprites(); M.V = null; M.handNo = -1;
      if (ap) { ap.remove(); ap = null; }
      updateHud({ ev: [], hist: [], scores: [], phase: 'idle' });
      showPane('title', A.menu(opt, M));
      pane.dataset.title = 1;
      stl.style.opacity = 0;
      pls.innerHTML = '';
    }
    function refreshMenu() { if (M.pane === 'title') { const sc = pane.scrollTop; pane.innerHTML = A.menu(opt, M); pane.scrollTop = sc; } }

    function showRules() {
      M.paneBack = M.pane;
      showPane('rules', paneHtml(`<p class="kk">${esc(A.title)}</p><h3>${T('Rules', 'Règles')}</h3><div class="rules">${A.rules()}</div><div class="row"><button class="bt gold" data-a="close">${T('Close', 'Fermer')}</button></div>`, 'wide'));
    }
    function showSheet() {
      if (!M.V) return;
      M.paneBack = M.pane;
      showPane('sheet', paneHtml(`<p class="kk">${esc(A.title)}</p><h3>${T('Score sheet', 'Feuille de marque')}</h3><div class="sheet">${A.sheet(M.V, M)}</div><div class="row"><button class="bt gold" data-a="close">${T('Close', 'Fermer')}</button></div>`, 'wide'));
    }
    function closeManual() {
      const back = M.paneBack; M.paneBack = '';
      hidePane(true);
      if (back === 'title') showPane('title', A.menu(opt, M));
      else if (M.V) { updatePanel(M.V); updatePane(M.V); }
    }
    function toggleLast() {
      if (lt) { lt.remove(); lt = null; return; }
      const V = M.V;
      if (!V || !V.last) { showHint(T('No trick played yet.', 'Aucun pli joué pour l’instant.')); return; }
      lt = h('div', 'lt');
      lt.innerHTML = `<p class="kk" style="margin:0 0 .4em;font:900 .74em var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--acc)">${T('Last trick', 'Dernier pli')}</p><div class="cs">${V.last.cards.map(c => `<div><i class="${c.s === V.last.w ? 'w' : ''}" style="background-image:${faceUrl(kind, c.id)}"></i>${esc(M.names[c.s] || '')}</div>`).join('')}</div>`;
      lt.addEventListener('click', () => { lt.remove(); lt = null; });
      tbl.append(lt);
    }
    function showPg(e) {
      if (pgEl) pgEl.remove();
      pgEl = h('div', 'pgs');
      pgEl.innerHTML = `<b>${esc(M.names[e.s] || '')} · ${T('Poignée', 'Poignée')} ${e.lvl === 1 ? T('(simple)', '(simple)') : e.lvl === 2 ? T('(double)', '(double)') : T('(triple)', '(triple)')}</b><div class="cs">${e.ids.slice().sort((a, b) => b - a).map(id => `<i style="background-image:${faceUrl('t', id)}"></i>`).join('')}</div>`;
      tbl.append(pgEl);
      const my = pgEl;
      setTimeout(() => { my.style.transition = 'opacity .5s'; my.style.opacity = 0; setTimeout(() => { my.remove(); if (pgEl === my) pgEl = null; }, 500); }, 3200);
    }
    CTX.showPg = showPg;
    function quitAsk() {
      const online = M.mode === 'online';
      M.paneBack = M.pane;
      showPane('quit', paneHtml(`<h3>${online ? T('Leave the table?', 'Quitter la table ?') : T('Quit this game?', 'Quitter cette partie ?')}</h3><p>${online ? T('A CPU will take your seat.', 'Un CPU prendra votre place.') : T('Your current game will be lost.', 'La partie en cours sera perdue.')}</p><div class="row"><button class="bt no" data-a="quit-yes">${T('Quit', 'Quitter')}</button><button class="bt gold" data-a="close">${T('Resume', 'Reprendre')}</button></div>`));
    }
    function leaveAll() {
      M.tok++; M.sched = null;
      if (M.mode === 'online') { try { api.net.close(); } catch (e) {} }
      M.eng = null; M.mode = 'solo'; M.role = 'local'; M.pane = '';
      hidePane(true); showTitle();
    }

    tbl.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (b) { e.stopPropagation(); onClick(b); return; }
      const c = e.target.closest('.cd.me');
      if (c) cardClick(+c.dataset.id, e);
    });
    function onClick(b) {
      const a = b.dataset.a;
      sfx('tick');
      switch (a) {
        case 'opt': {
          const k = b.dataset.k, v = b.dataset.v;
          opt[k] = isNaN(+v) || v === '' ? v : +v; save(); refreshMenu(); return;
        }
        case 'lang': LANG = LANG === 'fr' ? 'en' : 'fr'; opt.lang = LANG; save(); relang(); return;
        case 'solo': startSolo(); return;
        case 'online': startOnline(); return;
        case 'lobby': startOnline(); return;
        case 'rsm': if (M.rsv) resumeHost(); return;
        case 'rnew': if (M.rsv) { const r = M.rsv.r; M.rsv = null; freshStart(r); } return;
        case 'rules': showRules(); return;
        case 'sheet': showSheet(); return;
        case 'last': toggleLast(); return;
        case 'close': closeManual(); return;
        case 'quit': quitAsk(); return;
        case 'more': showMore(); return;
        case 'quit-yes': leaveAll(); return;
        case 'leave': leaveAll(); return;
        case 'menu': leaveAll(); return;
        case 'next': act({ k: 'ready' }); if (M.role !== 'host' || M.mode !== 'solo') { const bt = pane && pane.querySelector('[data-a="next"]'); if (bt) { bt.disabled = true; bt.textContent = T('Waiting for the others…', 'En attente des autres…'); } } return;
        case 'rematch': rematch(); return;
        case 'lobby-host': startOnline(); return;
        default: if (A.click) A.click(a, b, { act, M, opt, save, render: () => { M.lastHtml = ''; if (M.V) { updatePanel(M.V); } }, hint: showHint, ui: M.ui }); return;
      }
    }
    function relang() {
      const nm = M.pane;
      if (nm === 'title') refreshMenu();
      else if (nm === 'rules') showRules();
      else if (nm === 'sheet') showSheet();
      else if (nm === 'more') showMore();
      else if (nm === 'end' || nm === 'over') { if (pane) pane.dataset.h = ''; if (M.V) updatePane(M.V); }
      if (M.V) { M.lastHtml = ''; render(M.V, true); } else updateHud({ ev: [], hist: [], scores: [], phase: 'idle' });
    }
    function cardClick(id, ev) {
      const V = M.V;
      if (!V) return;
      if (V.phase === 'ecart' && V.turn === M.seat && V.ecart) {
        const ok = V.ecart.ok.indexOf(id) >= 0;
        if (!ok) { showHint(A.ecartWhy(V, id)); sfx('err'); return; }
        const ix = M.ecSel.indexOf(id);
        if (ix >= 0) M.ecSel.splice(ix, 1);
        else if (M.ecSel.length < V.ecart.nd) M.ecSel.push(id);
        else { showHint(T(`Only ${V.ecart.nd} cards go to the discard.`, `Seulement ${V.ecart.nd} cartes à l’écart.`)); return; }
        sfx('tick'); render(V, true); return;
      }
      if (V.phase !== 'play' || V.turn !== M.seat) { M.sel = M.sel === id ? -1 : id; render(V, true); return; }
      if (V.legal.indexOf(id) < 0) {
        showHint(A.why(V, id, M)); sfx('err'); return;
      }
      if (M.touch && M.sel !== id) { M.sel = id; sfx('tick'); render(V, true); return; }
      playCard(id);
    }
    function playCard(id) {
      M.sel = -1;
      const V = M.V;
      if (A.beforePlay) A.beforePlay(V, id);
      act({ k: 'play', id });
    }
    tbl.addEventListener('pointerdown', e => { M.touch = e.pointerType === 'touch' || e.pointerType === 'pen'; M.kbOn = false; });
    api.on(document, 'keydown', e => {
      if (!api.alive || e.ctrlKey || e.metaKey || e.altKey) return;
      const V = M.V;
      if (!V || M.pane) {
        if (M.pane === 'title' && (e.key === 'Enter')) { startSolo(); e.preventDefault(); }
        else if (M.pane === 'end' && (e.key === 'Enter' || e.key === ' ')) { const b = pane.querySelector('[data-a="next"]:not(:disabled)'); if (b) { b.click(); e.preventDefault(); } }
        else if ((M.pane === 'rules' || M.pane === 'sheet') && e.key === 'Enter') { closeManual(); e.preventDefault(); }
        return;
      }
      const k = e.key;
      const n = V.hand.length;
      if (!n) return;
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        M.kbOn = true;
        if (M.kb < 0 || M.kb >= n) M.kb = Math.floor(n / 2);
        else M.kb = (M.kb + (k === 'ArrowRight' ? 1 : -1) + n) % n;
        render(V, true); e.preventDefault();
      } else if ((k === 'Enter' || k === ' ' || k === 'ArrowUp') && M.kbOn && M.kb >= 0) {
        const id = V.hand[M.kb];
        M.touch = false;
        cardClick(id, { pointerType: 'mouse' }); e.preventDefault();
      } else if (A.key && A.key(k, V, { act, M, hint: showHint, render: () => render(V, true) })) e.preventDefault();
    });

    function onResize() { if (fit() && M.V) { M.lastHtml = ''; tbl.classList.add('nt'); render(M.V, true); requestAnimationFrame(() => requestAnimationFrame(() => tbl.classList.remove('nt'))); } else if (G.W) { placePlates(); } }
    api.on(window, 'resize', onResize);
    if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => { if (tbl.clientWidth !== G.W || tbl.clientHeight !== G.H || (root.clientWidth < 640) !== M.port) onResize(); }); ro.observe(root); api.on(window, 'pagehide', () => ro.disconnect()); }

    let tries = 0;
    function boot() {
      if (!fit() && tries++ < 30) { requestAnimationFrame(boot); return; }
      if (api.net.invite) startOnline(); else showTitle();
    }
    boot();
    return {
      destroy() { M.mounted = false; M.tok++; clearTimeout(M.endT); clearTimeout(M.hintT); },
      M, G, SP, opt, act, render, startSolo, startOnline, showTitle, A, tbl,
      state() { return { phase: M.V && M.V.phase, seat: M.seat, n: M.n, pane: M.pane, handNo: M.handNo }; }
    };
  }

  const sy = su => `<span class="bs${su & 1 ? ' r' : ''}">${SUIT_SYM[su]}</span>`;
  const ptsTxt = p => p === 250 ? T('Capot', 'Capot') : String(p);

  const BELOTE_A = {
    id: 'belote', cls: 'belote', kind: 'b', title: 'Belote', n: 4,
    defaults: () => ({ variant: 'classic', target: 1000, diff: 'Normal', lang: null }),
    soloN: () => 4,
    onlineN: () => 4,
    seatOrder: (n, k) => [0, 2, 1, 3].slice(0, k),
    room: () => ({ title: 'Belote', sizes: [4], defaultSize: 4, min: 4, max: 4, bots: true }),
    shareOpt: o => ({ variant: o.variant, target: o.target, diff: o.diff }),
    applyShared: (o, d) => { o.variant = d.variant; o.target = d.target; o.diff = d.diff; },
    newEngine: (o, n, humans, state) => BeloteGame({ variant: o.variant, target: o.target, humans, state }),
    bot: (g, seat, lvl) => bBot(g, seat, lvl),
    botDelay: ph => ph === 'play' ? 620 + Math.random() * 520 : 820 + Math.random() * 600,
    fallback: (g, seat) => g.S.phase === 'play' ? { k: 'play', id: g.legal(seat)[0] } : { k: 'pass' },
    scoreOf: (V, me) => V.scores[me & 1],
    won: (V, me) => V.winner === (me & 1),
    why: (V, id) => bWhy(V.hand, V.trick, V.trump, V.cls, V.me),
    dropSeat: (V, prev, s) => prev && prev.turned >= 0 && s.id === prev.turned && V.turned < 0 && V.contract ? V.contract.s : null,
    cardState: () => '',
    center(V, M, G, instant) {
      const out = [];
      if (V.phase === 'bid1' || V.phase === 'bid2') {
        const dim = V.phase === 'bid2' ? 'dim' : '';
        for (let i = 0; i < 3; i++) out.push({ key: 'dk' + i, id: -1, x: G.cx - G.cw * .22 + i * 1.6, y: G.cy - i * 1.6, r: -3 + i * 2, sc: .85, z: 40 + i, fl: 180, instant, from: { x: G.cx, y: G.cy - G.H * .2, sc: .6, fl: 180, op: 0 } });
        if (V.turned >= 0) out.push({ key: 'c' + V.turned, id: V.turned, x: G.cx + G.cw * .36, y: G.cy, r: 7, sc: .85, z: 60, fl: 0, cls: dim, instant, from: { x: G.cx - G.cw * .22, y: G.cy, sc: .85, fl: 180 } });
      }
      return out;
    },
    hud(V, M) {
      const m = M.seat & 1;
      let s = `<span class="chip"><b>${T('Us', 'Nous')} ${V.scores[m]}</b> – ${V.scores[1 - m]} ${T('Them', 'Eux')}<small>/ ${V.target}</small></span>`;
      let c = '';
      if (V.contract && (V.phase === 'play' || V.phase === 'trick' || V.phase === 'hand' || V.phase === 'over')) {
        const nm = esc(M.names[V.contract.s] || '');
        c = V.cls ? `${sy(V.contract.suit)} ${T('Trump', 'Atout')} · ${nm}` : `${V.contract.pts === 250 ? 'Capot' : V.contract.pts} ${sy(V.contract.suit)}${V.contract.mult > 1 ? ' <b>×' + V.contract.mult + '</b>' : ''} · ${nm}`;
      } else if (V.phase === 'bidC' || V.phase === 'sur') {
        c = V.hi ? `${ptsTxt(V.hi.pts)} ${sy(V.hi.suit)}${V.coinche ? ' <b>' + (V.coinche > 1 ? '×4' : '×2') + '</b>' : ''} · ${esc(M.names[V.hi.s] || '')}` : T('No bid yet', 'Aucune annonce');
      }
      if (c) s += `<i class="br"></i><span class="chip r2">${c}</span>`;
      if (V.carry) s += `<span class="chip r2" title="Litige">${T('Litige', 'Litige')} <b>+${V.carry}</b></span>`;
      return s;
    },
    plate(V, s, M) {
      const out = { ally: ((s - M.seat) & 1) === 0 && s !== M.seat };
      let tags = '';
      if (V.dealer === s) tags += '<span class="dl">D</span>';
      if (V.contract && V.contract.s === s && V.phase !== 'bid1' && V.phase !== 'bid2' && V.phase !== 'bidC' && V.phase !== 'sur') tags += `<span class="tg k">${sy(V.contract.suit)}${V.cls ? '' : ' ' + ptsTxt(V.contract.pts)}</span>`;
      if (V.belSeat === s && V.belN) tags += `<span class="tg">${V.belN > 1 ? 'Rebelote' : 'Belote'}</span>`;
      out.tags = tags;
      out.sub = s === M.seat ? T('You', 'Vous') : ((s - M.seat) & 1) === 0 ? T('Partner', 'Partenaire') : T('Opponent', 'Adversaire');
      return out;
    },
    status(V, M) {
      const me = M.seat, nm = esc(M.names[V.turn] || '');
      const mine = V.turn === me;
      switch (V.phase) {
        case 'bid1': case 'bid2': case 'bidC': case 'sur': return mine ? T('Your turn to bid', 'À vous d’annoncer') : `${nm}…`;
        case 'play': return mine ? T('Your turn', 'À vous de jouer') : `${nm}…`;
        case 'redeal': return T('Everyone passes: new deal', 'Tout le monde passe : nouvelle donne');
        default: return '';
      }
    },
    panel(V, M, ui) {
      const me = M.seat;
      if (V.turn !== me) return null;
      if (V.phase === 'bid1') {
        const su = V.turnedSuit;
        return `<div class="tx">${T('Take the turned card?', 'Prendre la carte retournée ?')}<small>${T('The trump suit would be', 'L’atout serait')} ${SUIT_NAME()[su]} ${sy(su)}</small></div><div class="ln"><button class="bt gold" data-a="take" data-s="${su}">${T('Take', 'Je prends')} ${sy(su)}</button><button class="bt" data-a="pass">${T('Pass', 'Je passe')}</button></div>`;
      }
      if (V.phase === 'bid2') {
        const t = V.turnedSuit;
        return `<div class="tx">${T('Choose the trump suit', 'Choisissez l’atout')}<small>${T('or pass', 'ou passez')}</small></div><div class="ln">${[0, 1, 2, 3].filter(x => x !== t).map(x => `<button class="bt gold" data-a="take" data-s="${x}">${sy(x)} ${SUIT_NAME()[x]}</button>`).join('')}<button class="bt" data-a="pass">${T('Pass', 'Je passe')}</button></div>`;
      }
      if (V.phase === 'bidC') {
        const hi = V.hi ? V.hi.pts : 0;
        const pts = [80, 90, 100, 110, 120, 130, 140, 150, 160, 250];
        const okp = ui.pts && ui.pts > hi ? ui.pts : 0;
        const can = okp && ui.suit >= 0 && ui.suit != null;
        const opp = V.hi && ((V.hi.s - me) & 1) === 1 && !V.coinche;
        return `<div class="tx">${V.hi ? `${T('Current bid', 'Annonce actuelle')} <b style="color:var(--acc)">${ptsTxt(V.hi.pts)}</b> ${sy(V.hi.suit)}` : T('Make a bid or pass', 'Annoncez ou passez')}</div>` +
          `<div class="ln">${[0, 1, 2, 3].map(x => `<button class="bt${ui.suit === x ? ' on' : ''}" data-a="bsuit" data-s="${x}" aria-label="${SUIT_NAME()[x]}">${sy(x)}</button>`).join('')}</div>` +
          `<div class="ln">${pts.map(p => `<button class="bt${okp === p ? ' on' : ''}" data-a="bpts" data-p="${p}" ${p <= hi ? 'disabled' : ''}>${ptsTxt(p)}</button>`).join('')}</div>` +
          `<div class="ln"><button class="bt go" data-a="bid" ${can ? '' : 'disabled'}>${can ? `${T('Bid', 'Annoncer')} ${ptsTxt(ui.pts)} ${sy(ui.suit)}` : T('Bid', 'Annoncer')}</button><button class="bt" data-a="pass">${T('Pass', 'Passer')}</button>${opp ? `<button class="bt no" data-a="coinche">${T('Coinche', 'Coinche')} ×2</button>` : ''}</div>`;
      }
      if (V.phase === 'sur') {
        return `<div class="tx">${T('Coinché! Surcoinche?', 'Coinché ! Surcoincher ?')}<small>${T('Doubles the stakes again (×4)', 'Double encore la mise (×4)')}</small></div><div class="ln"><button class="bt no" data-a="sur">${T('Surcoinche', 'Surcoinche')} ×4</button><button class="bt" data-a="pass">${T('Pass', 'Passer')}</button></div>`;
      }
      return null;
    },
    click(a, b, X) {
      const ui = X.M.ui, V = X.M.V;
      if (a === 'take') X.act({ k: 'take', suit: +b.dataset.s });
      else if (a === 'pass') X.act({ k: 'pass' });
      else if (a === 'bsuit') { ui.suit = +b.dataset.s; X.render(); }
      else if (a === 'bpts') { ui.pts = +b.dataset.p; X.render(); }
      else if (a === 'bid') { if (ui.pts && ui.suit != null) { X.act({ k: 'bid', pts: ui.pts, suit: ui.suit }); ui.pts = 0; } }
      else if (a === 'coinche') X.act({ k: 'coinche' });
      else if (a === 'sur') X.act({ k: 'sur' });
    },
    key(k, V, X) {
      if (V.turn !== X.M.seat) return false;
      if ((k === 'p' || k === 'P') && (V.phase === 'bid1' || V.phase === 'bid2' || V.phase === 'bidC' || V.phase === 'sur')) { X.act({ k: 'pass' }); return true; }
      if ((k === 't' || k === 'T') && V.phase === 'bid1') { X.act({ k: 'take', suit: V.turnedSuit }); return true; }
      return false;
    },
    event(e, V, C) {
      const nm = s => V && C.M.names[s];
      switch (e.k) {
        case 'pass': C.bubble(e.s, T('Pass', 'Je passe')); C.snd('pass'); break;
        case 'take': C.bubble(e.s, `${T('I take', 'Je prends')} ${SUIT_SYM[e.suit]}`, 'hot'); C.snd('bid'); break;
        case 'round2': C.banner(T('Second round', 'Deuxième tour'), T('Choose any other suit', 'Une autre couleur au choix')); break;
        case 'bid': C.bubble(e.s, `${ptsTxt(e.pts)} ${SUIT_SYM[e.suit]}`, 'hot'); C.snd('bid'); break;
        case 'coinche': C.banner('COINCHE !', nm(e.s) || '', '#ff8b7d'); C.snd('coinche'); break;
        case 'sur': C.banner('SURCOINCHE !', nm(e.s) || '', '#ff5c4d'); C.snd('coinche'); break;
        case 'play-start': C.banner(`${SUIT_SYM[e.trump]} ${T('Trump', 'Atout')}`, V.cls ? '' : `${ptsTxt(V.contract.pts)} · ${nm(V.contract.s) || ''}`, e.trump & 1 ? '#ff7a6b' : '#ffffff'); C.snd('turn'); break;
        case 'belote': C.bubble(e.s, e.n === 1 ? 'Belote !' : 'Rebelote !', 'hot'); C.snd('announce'); break;
        case 'der': C.bubble(e.s, T('Dix de der +10', 'Dix de der +10'), 'hot'); C.snd('good'); break;
        case 'redeal': C.banner(T('New deal', 'Nouvelle donne')); break;
        case 'hand-end': {
          const r = V.result;
          if (r && !r.litige) C.snd(r.made === ((V.contract.s & 1) === (C.M.seat & 1)) ? 'good' : 'bad');
          break;
        }
      }
    },
    endPane(V, M) {
      const r = V.result, m = M.seat & 1, o = 1 - m, c = r.contract;
      const nm = esc(M.names[c.s] || ''), ourTaker = (c.s & 1) === m;
      let head;
      if (r.litige) head = T('Litige: tied hands', 'Litige : égalité');
      else head = r.made ? T('Contract made', 'Contrat rempli') : T('Contract failed', 'Contrat chuté');
      const col = r.litige ? 'var(--acc)' : (r.made === ourTaker) ? '#7be58f' : '#ff8b7d';
      const sub = V.cls ? `${nm} · ${sy(c.suit)} ${T('trump', 'atout')}` : `${nm} · ${ptsTxt(c.pts)} ${sy(c.suit)}${c.mult > 1 ? ' ×' + c.mult : ''}`;
      const row = (l, a, b, cls) => `<tr class="${cls || ''}"><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
      let t = `<table class="tb-tbl"><tr><th></th><th>${T('Us', 'Nous')}</th><th>${T('Them', 'Eux')}</th></tr>`;
      t += row(T('Trick points (incl. dix de der)', 'Points des plis (dix de der inclus)'), r.tp[m], r.tp[o]);
      if (r.bel[0] || r.bel[1]) t += row('Belote – Rebelote', r.bel[m] || '–', r.bel[o] || '–');
      if (r.capot >= 0) t += row('Capot', r.capot === m ? '✔' : '–', r.capot === o ? '✔' : '–');
      t += row(T('Points', 'Points'), r.pts[m], r.pts[o], '');
      t += row(T('Hand score', 'Marque de la donne'), r.score[m], r.score[o], 'sum');
      if (r.carryPaid) t += row(T('Litige points collected', 'Points du litige récupérés'), r.carryTo === m ? '+' + r.carryPaid : '–', r.carryTo === o ? '+' + r.carryPaid : '–');
      if (r.litige) t += row(T('Held for next hand', 'En suspens'), ourTaker ? r.carry : '', ourTaker ? '' : r.carry);
      t += row(T('Total', 'Total'), V.scores[m], V.scores[o], 'sum');
      t += '</table>';
      const wait = V.ready[M.seat];
      return paneHtml(`<p class="kk">${T('Hand', 'Donne')} ${r.n}</p><h3 style="color:${col}">${head}</h3><p>${sub}</p>${t}<div class="row"><button class="bt go big" data-a="next" ${wait ? 'disabled' : ''}>${wait ? T('Waiting for the others…', 'En attente des autres…') : T('Next hand', 'Donne suivante')}</button></div>`);
    },
    overPane(V, M) {
      const m = M.seat & 1, win = V.winner === m;
      const host = M.role !== 'guest';
      const on = M.mode === 'online';
      let btn;
      if (!host) btn = `<p>${T('Waiting for the host to start a rematch…', 'En attente de la revanche de l’hôte…')}</p><div class="row"><button class="bt" data-a="leave">${T('Leave', 'Quitter')}</button></div>`;
      else btn = `<button class="bt go big" data-a="rematch">${T('Rematch', 'Revanche')}</button>${on ? `<button class="bt big" data-a="lobby-host">${T('Back to the lobby', 'Retour au salon')}</button>` : ''}<button class="bt" data-a="sheet">${T('Score sheet', 'Feuille de marque')}</button><button class="bt big" data-a="leave">${T('Menu', 'Menu')}</button>`;
      return paneHtml(`<p class="kk">${T('Match over', 'Fin de la partie')}</p><div class="vic">${win ? T('Victory!', 'Victoire !') : T('Defeat', 'Défaite')}</div><div class="win-n">${T('Us', 'Nous')} <b>${V.scores[m]}</b> – <b>${V.scores[1 - m]}</b> ${T('Them', 'Eux')}</div>${btn}`);
    },
    sheet(V, M) {
      const m = M.seat & 1, o = 1 - m;
      let t = `<table class="tb-tbl"><tr><th>#</th><th>${T('Contract', 'Contrat')}</th><th>${T('Us', 'Nous')}</th><th>${T('Them', 'Eux')}</th></tr>`;
      for (const h of V.hist) {
        const cn = `${esc(M.names[h.c] || '')} ${sy(h.suit)}${V.cls ? '' : ' ' + ptsTxt(h.pts) + (h.mult > 1 ? ' ×' + h.mult : '')} ${h.litige ? '(L)' : h.made ? '✔' : '✘'}`;
        t += `<tr><td>${h.n}</td><td style="text-align:left">${cn}</td><td>${h.add[m]}</td><td>${h.add[o]}</td></tr>`;
      }
      t += `<tr class="sum"><td></td><td style="text-align:left">${T('Total', 'Total')}</td><td>${V.scores[m]}</td><td>${V.scores[o]}</td></tr></table>`;
      if (!V.hist.length) t = `<p>${T('No hand played yet.', 'Aucune donne jouée.')}</p>`;
      return t;
    },
    menu(opt, M) {
      const seg = (k, vals, labels) => `<div class="seg">${vals.map((v, i) => `<button class="${opt[k] === v ? 'on' : ''}" data-a="opt" data-k="${k}" data-v="${v}">${labels ? labels[i] : v}</button>`).join('')}</div>`;
      return paneHtml(`<div class="cards">${[11, 22, 7, 20, 29].map((id, i) => `<i style="background-image:${faceUrl('b', id)};--r:${(i - 2) * 9}deg;--y:${Math.abs(i - 2) * .3}em"></i>`).join('')}</div><div class="logo">Belote<small>${T('The French trick-taking classic', 'Le classique français')}</small></div>` +
        `<div class="opt"><span>${T('Game', 'Jeu')}</span>${seg('variant', ['classic', 'coinche'], [T('Classic', 'Classique'), T('Contrée (Coinche)', 'Contrée (Coinche)')])}</div>` +
        `<div class="opt"><span>${T('Match to', 'Partie en')}</span>${seg('target', [1000, 1500, 2000])}</div>` +
        `<div class="opt"><span>${T('CPU level', 'Niveau CPU')}</span>${seg('diff', ['Easy', 'Normal', 'Hard'], [T('Easy', 'Facile'), T('Normal', 'Normal'), T('Hard', 'Difficile')])}</div>` +
        `<div class="opt"><span>${T('Language', 'Langue')}</span><div class="seg"><button class="${LANG === 'en' ? 'on' : ''}" ${LANG === 'en' ? '' : 'data-a="lang"'}>English</button><button class="${LANG === 'fr' ? 'on' : ''}" ${LANG === 'fr' ? '' : 'data-a="lang"'}>Français</button></div></div>` +
        `<button class="bt go big" data-a="solo">${T('Play with a CPU partner', 'Jouer (partenaire CPU)')}</button><button class="bt blue big" data-a="online">${T('Play online', 'Jouer en ligne')}</button><div class="row"><button class="bt" data-a="rules">${T('Rules', 'Règles')}</button></div>`);
    },
    rules() {
      return T(`<h4>Goal</h4><p>Two teams of two: you and the player opposite you. Play with 32 cards (7 to Ace). The first team to reach the target score wins the match.</p>
<h4>Card values</h4><ul><li>Trump suit: Jack 20, Nine 14, Ace 11, Ten 10, King 4, Queen 3, Eight and Seven 0 (strongest to weakest: J, 9, A, 10, K, Q, 8, 7).</li><li>Other suits: Ace 11, Ten 10, King 4, Queen 3, Jack 2, Nine, Eight and Seven 0 (order A, 10, K, Q, J, 9, 8, 7).</li><li>The last trick (dix de der) is worth 10. A hand holds 162 points.</li></ul>
<h4>Classic bidding</h4><p>Each player gets 5 cards and one card is turned up. In turn, starting to the dealer's right, you may take the turned card's suit as trump. If everybody passes, a second round lets you name any other suit. If all pass again, the cards are redealt. The taker gets the turned card, and the others complete their hand to 8.</p>
<h4>Contrée (Coinche) bidding</h4><p>All 8 cards are dealt. Bid a contract from 80 to 160 points (or Capot, all tricks) with a trump suit; each bid must beat the last. An opponent can Coinche (×2) and the bidding side can answer Surcoinche (×4). Bidding ends after three passes.</p>
<h4>Playing</h4><p>Play goes counterclockwise; the player on the dealer's right leads. You must: follow suit; if the lead is trump, play a higher trump if you can; if you cannot follow, cut with a trump unless your partner currently wins the trick, and over-trump an opponent's trump if you can. In the classic game, if you cannot over-trump you must still play a lower trump (contrée lets you discard instead).</p>
<h4>Belote and Rebelote</h4><p>Holding both King and Queen of trump gives 20 points. Say "Belote" when you play the first and "Rebelote" with the second. It is always scored, even on a failed contract.</p>
<h4>Scoring, classic</h4><p>The taking team needs strictly more points than the opponents, belote included. Otherwise it fails (chute): the opponents score 162 and the takers only their belote. At an exact tie (81-81) the opponents score their points and the takers' points are held for the next hand's winner (litige). Capot (all 8 tricks) scores 252.</p>
<h4>Scoring, contrée</h4><p>The contract is made when the team's points (belote counts) reach the bid. Made: each team scores its points rounded to 10, plus the contract for the bidders. Failed: the defenders score 160 plus the contract, the bidders nothing. Coinche doubles and surcoinche quadruples that total for the winners. Capot not announced: 250 + contract; announced and made: 500. Belote is always added.</p>
<h4>Controls</h4><p>Click a card to play it (on a touch screen tap once to select and again to play). <kbd>←</kbd> <kbd>→</kbd> choose a card, <kbd>Enter</kbd> plays, <kbd>P</kbd> passes.</p>`,
        `<h4>But du jeu</h4><p>Deux équipes de deux : vous et le joueur en face. Jeu de 32 cartes (du 7 à l’As). La première équipe à atteindre le score cible gagne la partie.</p>
<h4>Valeur des cartes</h4><ul><li>Atout : Valet 20, 9 14, As 11, 10 10, Roi 4, Dame 3, 8 et 7 0 (du plus fort au plus faible : V, 9, A, 10, R, D, 8, 7).</li><li>Autres couleurs : As 11, 10 10, Roi 4, Dame 3, Valet 2, 9, 8 et 7 0 (ordre A, 10, R, D, V, 9, 8, 7).</li><li>Le dernier pli (dix de der) vaut 10. Une donne contient 162 points.</li></ul>
<h4>Enchères classiques</h4><p>Chacun reçoit 5 cartes et on retourne une carte. À tour de rôle, en commençant à droite du donneur, on peut prendre la couleur retournée comme atout. Si tout le monde passe, un second tour permet de choisir une autre couleur. Si tous passent encore, on redistribue. Le preneur reçoit la carte retournée, les autres complètent leur main à 8 cartes.</p>
<h4>Enchères à la contrée (coinche)</h4><p>Les 8 cartes sont distribuées d’un coup. On annonce un contrat de 80 à 160 points (ou Capot, tous les plis) avec une couleur d’atout ; chaque annonce doit dépasser la précédente. Un adversaire peut coincher (×2) et l’équipe qui a annoncé peut surcoincher (×4). Les enchères s’arrêtent après trois « passe ».</p>
<h4>Le jeu de la carte</h4><p>On joue dans le sens inverse des aiguilles d’une montre ; le joueur à droite du donneur entame. Il faut : fournir à la couleur ; si l’entame est à l’atout, monter si on le peut ; à défaut de la couleur, couper sauf si son partenaire est maître, et surcouper l’atout d’un adversaire si on le peut. À la belote classique, si on ne peut pas surcouper il faut quand même jouer un atout plus faible (la contrée autorise à se défausser).</p>
<h4>Belote et Rebelote</h4><p>Détenir le Roi et la Dame d’atout rapporte 20 points. On dit « Belote » en jouant la première carte et « Rebelote » avec la seconde. Ces points sont toujours marqués, même si le contrat chute.</p>
<h4>Marque, belote classique</h4><p>L’équipe preneuse doit faire strictement plus de points que ses adversaires, belote comprise. Sinon elle chute : les adversaires marquent 162 et les preneurs seulement leur belote. En cas d’égalité exacte (81-81), les adversaires marquent leurs points et ceux des preneurs sont mis en suspens pour le vainqueur de la donne suivante (litige). Le capot (8 plis) vaut 252.</p>
<h4>Marque, contrée</h4><p>Le contrat est rempli quand les points de l’équipe (belote comprise) atteignent l’annonce. Réussi : chaque équipe marque ses points arrondis à la dizaine, plus le contrat pour les annonceurs. Chuté : les défenseurs marquent 160 plus le contrat, les annonceurs rien. La coinche double et la surcoinche quadruple ce total pour les gagnants. Capot non annoncé : 250 + contrat ; annoncé et réussi : 500. La belote s’ajoute toujours.</p>
<h4>Commandes</h4><p>Cliquez sur une carte pour la jouer (sur écran tactile, touchez une fois pour la choisir, une seconde fois pour la jouer). <kbd>←</kbd> <kbd>→</kbd> pour choisir, <kbd>Entrée</kbd> pour jouer, <kbd>P</kbd> pour passer.</p>`);
    }
  };

  const coverSvg = (kind, ids, bg, extra) => {
    const hh = kind === 'b' ? 140 : 172, sc = kind === 'b' ? 1.18 : 1;
    const im = ids.map((id, i) => {
      const a = (i - (ids.length - 1) / 2) * 13, x = 200 + (i - (ids.length - 1) / 2) * 52;
      return `<g transform="translate(${x} 175) rotate(${a}) translate(${-50 * sc} ${-hh * sc * .62}) scale(${sc})"><rect x="3" y="4" width="98" height="${hh - 2}" rx="8" fill="#000" opacity=".28"/><image width="100" height="${hh}" href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(faceSvg(kind, id))}"/></g>`;
    }).join('');
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cvg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></radialGradient></defs><rect width="400" height="300" fill="url(#cvg)"/>${extra || ''}${im}</svg>`;
  };

  Ameplay.covers['belote'] = coverSvg('b', [8 * 0 + 4 + 8 * 1, 8 * 1 + 7, 8 * 2 + 6, 8 * 3 + 3], ['#1f7a4e', '#0b3a26'], `<text x="200" y="64" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="40" fill="#f5e6b0" letter-spacing="3">BELOTE</text>`);

  Ameplay.register({
    id: 'belote',
    title: 'Belote',
    category: 'Board',
    tint: '#1f7a4e',
    blurb: 'France’s favourite trick-taking game. Partners, trump, belote-rebelote, and the Contrée coinche option.',
    help: 'Tap a card to play it (touch: tap twice) · bid with the buttons · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · <kbd>P</kbd> pass · <kbd>T</kbd> take',
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="13" width="26" height="38" rx="4" transform="rotate(-12 22 32)"/><rect x="28" y="11" width="26" height="38" rx="4" transform="rotate(10 41 30)"/><path d="M41 22l5 8-5 8-5-8z" fill="currentColor"/></svg>',
    css: TB_CSS.replace(/@@/g, '.gm-belote'),
    _t: { BeloteGame, bLegal, bScoreHand, bBot, bWin },
    mount(root, api) {
      const t = Table(root, api, BELOTE_A);
      return { destroy: t.destroy, _t: t };
    }
  });

  const TRK = () => LANG === 'fr' ? ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'C', 'D', 'R'] : ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Kn', 'Q', 'K'];
  const tl = id => id === 77 ? T('Excuse', 'Excuse') : id >= 56 ? String(id - 55) : TRK()[id % 14] + sy((id / 14) | 0);
  const signed = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
  const campT = (V, s) => {
    if (V.taker < 0) return -1;
    if (V.n < 5) return s === V.taker ? 0 : 1;
    if (s === V.taker || s === V.partner) return 0;
    if (V.partner === -2) return -1;
    return 1;
  };
  const bidTxt = v => `${T_BIDNAME(v)}`;
  const PG_NAME = () => [T('Simple', 'Simple'), T('Double', 'Double'), T('Triple', 'Triple')];

  const TAROT_A = {
    id: 'french-tarot', cls: 'tarot', kind: 't', title: 'French Tarot', n: 4,
    defaults: () => ({ n: 4, target: 5, diff: 'Normal', lang: null }),
    soloN: o => o.n,
    onlineN: (r, k) => r.bots ? r.size : Math.max(3, Math.min(5, k)),
    seatOrder: (n, k) => Array.from({ length: k }, (x, i) => Math.floor(i * n / k)),
    room: o => ({ title: 'French Tarot', sizes: [3, 4, 5], defaultSize: o.n || 4, min: 3, max: 5, bots: true }),
    shareOpt: o => ({ target: o.target, diff: o.diff }),
    applyShared: (o, d) => { o.target = d.target; o.diff = d.diff; },
    newEngine: (o, n, humans, state) => TarotGame({ n, target: o.target, humans, state }),
    bot: (g, seat, lvl) => tBot(g, seat, lvl),
    botDelay: ph => ph === 'play' ? 600 + Math.random() * 500 : ph === 'bid' ? 800 + Math.random() * 700 : 1100 + Math.random() * 700,
    fallback(g, seat) {
      const S = g.S;
      switch (S.phase) {
        case 'bid': return { k: 'bid', v: 0 };
        case 'call': return { k: 'call', id: tCallOptions(S.hands[seat])[0] };
        case 'ecart': return { k: 'ecart', ids: tBotEcart(S.hands[seat], T_CFG[S.n].nd) };
        case 'chelem': return { k: 'chelem', v: false };
        default: return { k: 'play', id: g.legal(seat)[0] };
      }
    },
    scoreOf: (V, me) => V.scores[me],
    won: (V, me) => V.winner === me,
    why: (V, id) => tWhy(V.hand, V.trick, V.me),
    ecartWhy(V, id) {
      if (tOud(id)) return T('Oudlers cannot go to the discard.', 'Un bout ne peut pas aller à l’écart.');
      if (id < 56 && id % 14 === 13) return T('Kings cannot go to the discard.', 'Un roi ne peut pas aller à l’écart.');
      return T('Trumps only if you cannot fill the discard otherwise.', 'Un atout seulement si l’écart ne peut pas être complété autrement.');
    },
    cardState: (V, id, M) => V.phase === 'ecart' && V.turn === M.seat && V.ecart ? (V.ecart.ok.indexOf(id) >= 0 ? 'ok' : 'dim') : '',
    dropSeat: (V, prev, s) => s.key.slice(0, 3) === 'chb' && V.taker >= 0 && V.bid === 4 ? V.taker : null,
    center(V, M, G, instant) {
      const out = [];
      const k = V.chienN;
      if ((V.phase === 'bid' || V.phase === 'call' || V.phase === 'chelem' && V.bid > 2) && k) {
        for (let i = 0; i < k; i++) out.push({ key: 'chb' + i, id: -1, x: G.cx + (i - (k - 1) / 2) * G.cw * .3, y: G.cy - G.H * .12, r: (i - (k - 1) / 2) * 2.5, sc: .72, z: 30 + i, fl: 180, instant });
      }
      if (V.phase === 'chien' && V.chien) {
        const c = V.chien, sp = Math.min(G.cw * .98, G.W * .5 / c.length);
        c.forEach((id, i) => out.push({ key: 'c' + id, id, x: G.cx + (i - (c.length - 1) / 2) * sp, y: G.cy, r: 0, sc: .92, z: 60 + i, fl: 0, instant, dly: i * 90, from: { x: G.cx + (i - (c.length - 1) / 2) * G.cw * .3, y: G.cy, sc: .72, fl: 180 } }));
      }
      if (V.phase === 'redeal' && V.reason === 'petit-sec') out.push({ key: 'psx', id: 56, x: G.cx, y: G.cy, r: 0, sc: 1.05, z: 80, fl: 0, instant, from: { x: G.cx, y: G.cy - G.ch * .3, sc: .6, fl: 180 } });
      return out;
    },
    hud(V, M) {
      const n = V.n;
      let s = `<span class="chip">${T('Deal', 'Donne')} <b>${Math.min(V.dealNo + (V.phase === 'hand' || V.phase === 'over' ? 0 : 1), V.target || 999)}</b>${V.target ? ' / ' + V.target : ''}</span>`;
      let c = '';
      if (V.taker >= 0 && V.phase !== 'bid' && V.phase !== 'hand' && V.phase !== 'over' && V.phase !== 'redeal') {
        c = `${esc(M.names[V.taker] || '')} · <b>${bidTxt(V.bid)}</b> ×${V.bid}${V.chelem ? ' · <b>Chelem</b>' : ''}`;
      } else if (V.phase === 'bid' && V.hiSeat >= 0) c = `${T('High bid', 'Meilleure annonce')}: <b>${bidTxt(V.hi)}</b> · ${esc(M.names[V.hiSeat] || '')}`;
      if (c) s += `<i class="br"></i><span class="chip r2">${c}</span>`;
      if (n === 5 && V.called >= 0 && V.phase !== 'bid' && V.phase !== 'call') {
        const pt = V.partnerShown ? (V.partner >= 0 ? ` → ${esc(M.names[V.partner] || '')}` : ` → ${T('alone', 'seul')}`) : '';
        s += `<span class="chip r2">${T('Called', 'Appelé')} <b>${tl(V.called)}</b>${pt}</span>`;
      }
      return s;
    },
    plate(V, s, M) {
      const out = {};
      const me = M.seat, cm = campT(V, s), mc = campT(V, me);
      out.ally = s !== me && cm >= 0 && cm === mc;
      let tags = '';
      if (V.dealer === s) tags += '<span class="dl">D</span>';
      if (V.taker === s && V.phase !== 'bid' && V.phase !== 'redeal') tags += `<span class="tg k">${bidTxt(V.bid)}</span>`;
      if (V.n === 5 && V.partner === s && (V.partnerShown || me === V.taker || me === s)) tags += `<span class="tg">${T('Partner', 'Partenaire')}</span>`;
      out.tags = tags;
      const sc = V.scores[s] || 0;
      out.sub = `${sc > 0 ? '+' : ''}${sc}`;
      return out;
    },
    status(V, M) {
      const me = M.seat, nm = esc(M.names[V.turn] || ''), tk = esc(M.names[V.taker] || '');
      switch (V.phase) {
        case 'bid': return V.turn === me ? T('Your turn to bid', 'À vous d’annoncer') : `${nm}…`;
        case 'call': return V.turn === me ? T('Call a partner', 'Appelez un partenaire') : `${tk} ${T('is calling a king…', 'appelle un roi…')}`;
        case 'chien': return `${tk}: ${T('the chien is shown', 'le chien est montré')}`;
        case 'ecart': return V.turn === me ? T('Choose your discard', 'Faites votre écart') : `${tk} ${T('is making the discard…', 'fait son écart…')}`;
        case 'chelem': return V.turn === me ? T('Announce a chelem?', 'Annoncer un chelem ?') : `${tk}…`;
        case 'play': return V.turn === me ? T('Your turn', 'À vous de jouer') : `${nm}…`;
        case 'redeal': return V.reason === 'petit-sec' ? T('Petit sec: the deal is void', 'Petit sec : la donne est annulée') : T('Everybody passes: new deal', 'Tout le monde passe : nouvelle donne');
        default: return '';
      }
    },
    panel(V, M, ui) {
      const me = M.seat;
      if (V.turn !== me) return null;
      if (V.phase === 'bid') {
        const bs = T_BIDS.map(v => `<button class="bt${v > V.hi ? ' gold' : ''}" data-a="bid" data-v="${v}" ${v > V.hi ? '' : 'disabled'}>${bidTxt(v)} <small>×${v}</small></button>`).join('');
        return `<div class="tx">${T('Your bid', 'Votre annonce')}<small>${V.hiSeat >= 0 ? `${T('Current', 'Actuelle')}: ${bidTxt(V.hi)} (${esc(M.names[V.hiSeat] || '')})` : T('Nobody has bid yet', 'Personne n’a annoncé')}</small></div><div class="ln">${bs}<button class="bt" data-a="bid" data-v="0">${T('Pass', 'Passe')}</button></div>`;
      }
      if (V.phase === 'call' && V.callOpts) {
        return `<div class="tx">${T('Call a partner', 'Appelez un partenaire')}<small>${T('The holder of this card is your partner. If it is in the chien or in your hand, you play alone.', 'Le détenteur de cette carte est votre partenaire. Dans le chien ou dans votre main, vous jouez seul.')}</small></div><div class="ln">${V.callOpts.map(id => `<button class="bt gold" data-a="call" data-id="${id}">${tl(id)}</button>`).join('')}</div>`;
      }
      if (V.phase === 'ecart' && V.ecart) {
        const sel = M.ecSel, nt = sel.filter(i => i >= 56).length;
        const ok = sel.length === V.ecart.nd && nt === V.ecart.needT;
        const hint = V.ecart.needT > 0 ? T(`Include exactly ${V.ecart.needT} trump(s).`, `Incluez exactement ${V.ecart.needT} atout(s).`) : T('No Kings, oudlers or trumps.', 'Ni roi, ni bout, ni atout.');
        return `<div class="tx">${T('Discard', 'Écart')} <b style="color:var(--acc)">${sel.length} / ${V.ecart.nd}</b><small>${hint}</small></div><div class="ln"><button class="bt go" data-a="ecart-ok" ${ok ? '' : 'disabled'}>${T('Confirm', 'Valider')}</button>${sel.length ? `<button class="bt" data-a="ecart-clear">${T('Clear', 'Effacer')}</button>` : ''}</div>`;
      }
      if (V.phase === 'chelem') {
        return `<div class="tx">${T('Announce a Grand Chelem?', 'Annoncer un grand chelem ?')}<small>${T('Win all tricks and lead first: +400 if made, −200 if failed.', 'Faire tous les plis et entamer : +400 si réussi, −200 sinon.')}</small></div><div class="ln"><button class="bt go" data-a="chelem" data-v="0">${T('No', 'Non')}</button><button class="bt no" data-a="chelem" data-v="1">${T('Announce', 'Annoncer')}</button></div>`;
      }
      if (V.phase === 'play' && V.pgOpts && V.pgOpts.length) {
        return `<div class="tx">${T('Poignée?', 'Poignée ?')}<small>${T('Show your trumps for a bonus, or just play a card.', 'Montrez vos atouts pour un bonus, ou jouez simplement une carte.')}</small></div><div class="ln">${V.pgOpts.map(o => `<button class="bt gold" data-a="pg" data-l="${o.lvl}">${PG_NAME()[o.lvl - 1]} · ${o.ids.length} · +${o.bonus}</button>`).join('')}</div>`;
      }
      return null;
    },
    click(a, b, X) {
      const V = X.M.V;
      if (a === 'bid') X.act({ k: 'bid', v: +b.dataset.v });
      else if (a === 'call') X.act({ k: 'call', id: +b.dataset.id });
      else if (a === 'ecart-ok') { if (X.act({ k: 'ecart', ids: X.M.ecSel.slice() })) X.M.ecSel = []; }
      else if (a === 'ecart-clear') { X.M.ecSel = []; X.M.lastHtml = ''; if (V) X.render(); }
      else if (a === 'chelem') X.act({ k: 'chelem', v: +b.dataset.v === 1 });
      else if (a === 'pg') X.act({ k: 'poignee', lvl: +b.dataset.l });
    },
    key(k, V, X) {
      if (V.turn !== X.M.seat) return false;
      if (V.phase === 'bid') {
        if (k === 'p' || k === 'P') { X.act({ k: 'bid', v: 0 }); return true; }
        const v = { 1: 1, 2: 2, 3: 4, 4: 6 }[k];
        if (v && v > V.hi) { X.act({ k: 'bid', v }); return true; }
      }
      if (V.phase === 'ecart' && k === 'Enter' && V.ecart && X.M.ecSel.length === V.ecart.nd) { X.act({ k: 'ecart', ids: X.M.ecSel.slice() }); X.M.ecSel = []; return true; }
      return false;
    },
    event(e, V, C) {
      const nm = s => C.M.names[s] || '';
      switch (e.k) {
        case 'bid': C.bubble(e.s, e.v ? `${bidTxt(e.v)} ×${e.v}` : T('Pass', 'Passe'), e.v ? 'hot' : ''); C.snd(e.v ? 'bid' : 'pass'); break;
        case 'taker': C.banner(bidTxt(e.v) + ' ×' + e.v, nm(e.s), '#ffd84a'); C.snd('announce'); break;
        case 'call': C.bubble(e.s, `${T('Called', 'Appel')}: ${cardLabel('t', e.id)}`, 'hot'); break;
        case 'partner': C.banner(T('Partner revealed', 'Partenaire révélé'), nm(e.s), '#7be58f'); C.snd('good'); break;
        case 'alone': C.banner(T('Playing alone', 'Joue seul'), nm(e.s), '#ff8b7d'); break;
        case 'chien-show': C.snd('flip'); break;
        case 'ecart': if (e.tr && e.tr.length) C.banner(T('Trumps in the discard', 'Atouts à l’écart'), e.tr.map(i => i - 55).sort((a, b) => a - b).join(' · '), '#ffd84a'); break;
        case 'chelem': C.banner('CHELEM !', nm(e.s), '#ff5c4d'); C.snd('coinche'); break;
        case 'poignee': C.showPg(e); C.snd('poignee'); break;
        case 'petit-sec': C.banner(T('Petit sec', 'Petit sec'), nm(e.s) + ' · ' + T('deal void', 'donne annulée'), '#ffd84a'); C.snd('err'); break;
        case 'allpass': C.banner(T('Everybody passes', 'Tout le monde passe')); break;
        case 'card': if (e.id === 77) { C.bubble(e.s, T('Excuse', 'Excuse')); C.snd('flip'); } break;
        case 'hand-end': {
          const r = V.result;
          if (r) { const mc = C.M.seat === r.taker || C.M.seat === r.partner ? 0 : 1; C.snd(r.made === (mc === 0) ? 'good' : 'bad'); }
          break;
        }
      }
    },
    endPane(V, M) {
      const r = V.result, me = M.seat, n = V.n, tk = esc(M.names[r.taker] || '');
      const mc = me === r.taker || me === r.partner ? 0 : 1;
      const good = r.made === (mc === 0);
      const head = r.made ? T('Contract made', 'Contrat rempli') : T('Contract failed', 'Contrat chuté');
      let sub = `${tk} · ${bidTxt(r.bid)} ×${r.bid}`;
      if (n === 5) sub += r.partner >= 0 ? ` · ${T('with', 'avec')} ${esc(M.names[r.partner] || '')} (${tl(r.called)})` : ` · ${T('alone', 'seul')} (${tl(r.called)})`;
      const row = (l, v, cls) => `<tr class="${cls || ''}"><td style="text-align:left" colspan="2">${l}</td><td>${v}</td></tr>`;
      let t = `<table class="tb-tbl">`;
      t += row(`${T('Points taken', 'Points faits')} (${r.ou} ${T('oudler(s)', 'bout(s)')})`, `${r.pts} / ${r.need}`);
      t += row(r.made ? T('Margin', 'Marge') : T('Short by', 'Chute de'), `${r.made ? '+' : '−'}${Math.abs(r.diff)}`);
      t += row(`(25 + ${r.margin}) × ${r.bid}`, signed(r.base));
      if (r.pgB) t += row(T('Poignée', 'Poignée'), signed(r.pgB));
      if (r.pab) t += row(T('Petit au bout', 'Petit au bout'), signed(r.pab));
      if (r.ch) t += row(r.chelemAnn ? T('Chelem (announced)', 'Chelem annoncé') : T('Chelem', 'Chelem'), signed(r.ch));
      t += row(T('Result of the deal', 'Résultat de la donne'), signed(r.T), 'sum');
      t += `</table><table class="tb-tbl"><tr><th style="text-align:left">${T('Player', 'Joueur')}</th><th>${T('Deal', 'Donne')}</th><th>${T('Total', 'Total')}</th></tr>`;
      for (let s = 0; s < n; s++) {
        const role = s === r.taker ? T('Taker', 'Preneur') : s === r.partner ? T('Partner', 'Partenaire') : T('Defence', 'Défense');
        t += `<tr class="${s === me ? 'sum' : ''}"><td style="text-align:left">${esc(M.names[s] || '')} <small style="opacity:.65">${role}</small></td><td>${signed(r.score[s])}</td><td>${V.scores[s]}</td></tr>`;
      }
      t += '</table>';
      const wait = V.ready[me];
      return paneHtml(`<p class="kk">${T('Deal', 'Donne')} ${r.n}</p><h3 style="color:${good ? '#7be58f' : '#ff8b7d'}">${head}</h3><p>${sub}</p>${t}<div class="row"><button class="bt go big" data-a="next" ${wait ? 'disabled' : ''}>${wait ? T('Waiting for the others…', 'En attente des autres…') : T('Next deal', 'Donne suivante')}</button></div>`);
    },
    overPane(V, M) {
      const n = V.n, me = M.seat, win = V.winner === me;
      const order = Array.from({ length: n }, (x, i) => i).sort((a, b) => V.scores[b] - V.scores[a]);
      const host = M.role !== 'guest', on = M.mode === 'online';
      let btn;
      if (!host) btn = `<p>${T('Waiting for the host to start a rematch…', 'En attente de la revanche de l’hôte…')}</p><div class="row"><button class="bt" data-a="leave">${T('Leave', 'Quitter')}</button></div>`;
      else btn = `<button class="bt go big" data-a="rematch">${T('Rematch', 'Revanche')}</button>${on ? `<button class="bt big" data-a="lobby-host">${T('Back to the lobby', 'Retour au salon')}</button>` : ''}<button class="bt" data-a="sheet">${T('Score sheet', 'Feuille de marque')}</button><button class="bt big" data-a="leave">${T('Menu', 'Menu')}</button>`;
      const tb = `<table class="tb-tbl">${order.map((s, i) => `<tr class="${s === me ? 'sum' : ''}"><td>${i + 1}</td><td style="text-align:left">${esc(M.names[s] || '')}</td><td>${signed(V.scores[s])}</td></tr>`).join('')}</table>`;
      return paneHtml(`<p class="kk">${T('Game over', 'Fin de la partie')}</p><div class="vic">${win ? T('Victory!', 'Victoire !') : `${esc(M.names[V.winner] || '')} ${T('wins', 'gagne')}`}</div>${tb}${btn}`);
    },
    sheet(V, M) {
      const n = V.n;
      if (!V.hist.length) return `<p>${T('No deal played yet.', 'Aucune donne jouée.')}</p>`;
      let t = `<table class="tb-tbl"><tr><th>#</th><th style="text-align:left">${T('Contract', 'Contrat')}</th>${Array.from({ length: n }, (x, s) => `<th>${esc((M.names[s] || '').slice(0, 7))}</th>`).join('')}</tr>`;
      for (const h of V.hist) t += `<tr><td>${h.n}</td><td style="text-align:left">${esc((M.names[h.taker] || '').slice(0, 8))} ${bidTxt(h.bid)} ${h.made ? '✔' : '✘'}</td>${h.score.map(v => `<td>${signed(v)}</td>`).join('')}</tr>`;
      t += `<tr class="sum"><td></td><td style="text-align:left">${T('Total', 'Total')}</td>${V.scores.map(v => `<td>${signed(v)}</td>`).join('')}</tr></table>`;
      return t;
    },
    menu(opt, M) {
      const seg = (k, vals, labels) => `<div class="seg">${vals.map((v, i) => `<button class="${opt[k] === v ? 'on' : ''}" data-a="opt" data-k="${k}" data-v="${v}">${labels ? labels[i] : v}</button>`).join('')}</div>`;
      return paneHtml(`<div class="cards">${[76, 13, 77, 26, 56].map((id, i) => `<i style="background-image:${faceUrl('t', id)};--r:${(i - 2) * 9}deg;--y:${Math.abs(i - 2) * .3}em"></i>`).join('')}</div><div class="logo">French Tarot<small>${T('Le Tarot, played with 78 cards', 'Le Tarot français, 78 cartes')}</small></div>` +
        `<div class="opt"><span>${T('Players', 'Joueurs')}</span>${seg('n', [3, 4, 5], ['3', '4', '5'])}</div>` +
        `<div class="opt"><span>${T('Match length', 'Durée')}</span>${seg('target', [5, 10, 15, 20, 0], ['5', '10', '15', '20', T('Free', 'Libre')])}</div>` +
        `<div class="opt"><span>${T('CPU level', 'Niveau CPU')}</span>${seg('diff', ['Easy', 'Normal', 'Hard'], [T('Easy', 'Facile'), T('Normal', 'Normal'), T('Hard', 'Difficile')])}</div>` +
        `<div class="opt"><span>${T('Language', 'Langue')}</span><div class="seg"><button class="${LANG === 'en' ? 'on' : ''}" ${LANG === 'en' ? '' : 'data-a="lang"'}>English</button><button class="${LANG === 'fr' ? 'on' : ''}" ${LANG === 'fr' ? '' : 'data-a="lang"'}>Français</button></div></div>` +
        `<button class="bt go big" data-a="solo">${T('Play against CPUs', 'Jouer contre le CPU')}</button><button class="bt blue big" data-a="online">${T('Play online', 'Jouer en ligne')}</button><div class="row"><button class="bt" data-a="rules">${T('Rules', 'Règles')}</button></div>`);
    },
    rules() {
      return T(`<h4>The deck</h4><p>78 cards: four suits of 14 (Ace to 10, Jack, Knight, Queen, King), 21 trumps and the Excuse. The Petit (trump 1), the 21 and the Excuse are the <b>oudlers</b>. Values: oudlers and Kings 4½, Queens 3½, Knights 2½, Jacks 1½, all other cards ½. The deck holds 91 points.</p>
<h4>Dealing</h4><p>3 players: 24 cards each, 6 in the chien. 4 players: 18 each, 6 in the chien. 5 players: 15 each, 3 in the chien. A player holding the Petit as their only trump and no Excuse ("petit sec") voids the deal.</p>
<h4>Bidding</h4><p>Each player bids once, in turn, starting to the dealer's right, and a bid must beat the previous one: <b>Prise</b> or Petite (×1), <b>Garde</b> (×2), <b>Garde sans le chien</b> (×4), <b>Garde contre le chien</b> (×6). The highest bidder is the taker. If everyone passes, the next dealer deals again.</p>
<h4>The chien</h4><p>Prise and Garde: the chien is shown, the taker adds it to the hand, then sets aside the same number of cards (the écart): no Kings, no oudlers, and trumps only if there is no alternative (they are then shown). Garde sans: the chien counts for the taker without being used. Garde contre: the chien counts for the defence.</p>
<h4>Five players: the call</h4><p>The taker calls a King (a Queen if holding all four Kings, and so on). The holder of that card is the secret partner, revealed when the card is played. If it is in the chien or in the taker's hand, the taker plays alone. The taker may not lead the called suit on the first trick, except with the called card itself.</p>
<h4>Play</h4><p>The player on the dealer's right leads, and play goes counterclockwise. You must follow suit. If you cannot, you must trump, and over-trump if you can (otherwise play a lower trump). With no trump, discard anything. When trumps are led, play higher if you can, even over your partner.</p>
<h4>The Excuse</h4><p>It can be played any time and never wins the trick. Its owner keeps it for their camp and gives the winners a card worth ½ point (pending until they have a trick). In the last trick it changes camp. If led, the next card sets the suit.</p>
<h4>Poignée</h4><p>Before playing their first card, a player with enough trumps may show them: 3 players 13/15/18 (simple/double/triple), 4 players 10/13/15, 5 players 8/10/13, for a bonus of 20/30/40 awarded to the winning camp. The Excuse can stand in for a missing trump only if it is the player's last trump.</p>
<h4>Petit au bout</h4><p>The camp that wins the last trick with the Petit in it scores 10 × the contract multiplier (or loses it).</p>
<h4>Chelem</h4><p>The taker may announce winning all the tricks and then leads: +400 if made, −200 if failed. A chelem that was not announced scores +200 when made; one inflicted by the defence costs the taker −200.</p>
<h4>Scoring</h4><p>Points needed: 56 with 0 oudlers, 51 with 1, 41 with 2, 36 with 3. Result = (25 + margin) × multiplier, plus bonuses, positive if made and negative if failed. The taker scores 3× (4 players), 2× (3 players), or 2× with a partner / 4× alone (5 players); partner 1×; each defender −1×. Scores always sum to zero.</p>
<h4>Controls</h4><p>Click a card to play it (on touch, tap once to select and again to play). In the discard step tap cards to set them aside, then confirm. <kbd>←</kbd> <kbd>→</kbd> choose, <kbd>Enter</kbd> play, <kbd>P</kbd> pass, <kbd>1</kbd>-<kbd>4</kbd> bid.</p>`,
        `<h4>Le jeu</h4><p>78 cartes : quatre couleurs de 14 (As à 10, Valet, Cavalier, Dame, Roi), 21 atouts et l’Excuse. Le Petit (atout 1), le 21 et l’Excuse sont les <b>bouts</b>. Valeurs : bouts et Rois 4,5 ; Dames 3,5 ; Cavaliers 2,5 ; Valets 1,5 ; les autres cartes 0,5. Le jeu totalise 91 points.</p>
<h4>La donne</h4><p>À 3 joueurs : 24 cartes chacun, 6 au chien. À 4 : 18 chacun, 6 au chien. À 5 : 15 chacun, 3 au chien. Un joueur dont le Petit est le seul atout, sans l’Excuse (« petit sec »), fait annuler la donne.</p>
<h4>Les enchères</h4><p>Chaque joueur annonce une fois, à tour de rôle en commençant à droite du donneur, et doit surenchérir : <b>Prise</b> (×1), <b>Garde</b> (×2), <b>Garde sans le chien</b> (×4), <b>Garde contre le chien</b> (×6). Le plus haut enchérisseur est le preneur. Si tout le monde passe, le joueur suivant redistribue.</p>
<h4>Le chien</h4><p>Prise et Garde : le chien est montré, le preneur l’ajoute à sa main puis écarte autant de cartes : ni rois, ni bouts, et des atouts seulement faute d’alternative (ils sont alors montrés). Garde sans : le chien compte pour le preneur sans être utilisé. Garde contre : le chien compte pour la défense.</p>
<h4>À cinq : l’appel</h4><p>Le preneur appelle un Roi (une Dame s’il les a tous, etc.). Le détenteur est son partenaire secret, révélé quand la carte tombe. Si la carte est au chien ou dans la main du preneur, celui-ci joue seul. Au premier pli, le preneur ne peut pas entamer la couleur appelée, sauf avec la carte appelée.</p>
<h4>Le jeu de la carte</h4><p>Le joueur à droite du donneur entame, on joue dans le sens inverse des aiguilles d’une montre. Il faut fournir à la couleur ; sinon couper, et surcouper si possible (sinon sous-couper). Sans atout, on se défausse. À l’atout, on monte si on le peut, même sur son partenaire.</p>
<h4>L’Excuse</h4><p>Elle se joue à tout moment et ne gagne jamais le pli. Son propriétaire la garde pour son camp et donne au camp gagnant une carte de ½ point (en attente tant qu’il n’a pas de pli). Au dernier pli, elle change de camp. Si elle est entamée, la carte suivante fixe la couleur.</p>
<h4>La poignée</h4><p>Avant de jouer sa première carte, un joueur ayant assez d’atouts peut les montrer : à 3 joueurs 13/15/18 (simple/double/triple), à 4 joueurs 10/13/15, à 5 joueurs 8/10/13, pour un bonus de 20/30/40 au camp gagnant. L’Excuse remplace un atout manquant seulement si c’est le dernier atout du joueur.</p>
<h4>Le petit au bout</h4><p>Le camp qui remporte le dernier pli contenant le Petit marque 10 × la mise (ou la perd).</p>
<h4>Le chelem</h4><p>Le preneur peut annoncer qu’il fera tous les plis et entame : +400 si réussi, −200 sinon. Un chelem non annoncé rapporte +200 ; un chelem fait par la défense coûte −200 au preneur.</p>
<h4>La marque</h4><p>Points à faire : 56 avec 0 bout, 51 avec 1, 41 avec 2, 36 avec 3. Résultat = (25 + écart) × mise, plus les primes, positif si le contrat est rempli et négatif sinon. Le preneur marque 3× (à 4), 2× (à 3), ou 2× avec partenaire / 4× seul (à 5) ; le partenaire 1× ; chaque défenseur −1×. La somme des scores est toujours nulle.</p>
<h4>Commandes</h4><p>Cliquez sur une carte pour la jouer (au tactile, touchez une fois pour choisir, une seconde fois pour jouer). Pour l’écart, touchez les cartes à écarter puis validez. <kbd>←</kbd> <kbd>→</kbd> pour choisir, <kbd>Entrée</kbd> pour jouer, <kbd>P</kbd> pour passer, <kbd>1</kbd>-<kbd>4</kbd> pour annoncer.</p>`);
    }
  };

  Ameplay.covers['french-tarot'] = coverSvg('t', [76, 13, 77, 26, 56], ['#2a7d8f', '#0a2d38'], `<text x="200" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="38" fill="#ffe6a3" letter-spacing="3">TAROT</text>`);

  Ameplay.register({
    id: 'french-tarot',
    title: 'French Tarot',
    category: 'Board',
    tint: '#2a7d8f',
    blurb: 'The classic 78-card French game for 3 to 5 players: bid, take the chien, call a partner and chase the oudlers.',
    help: 'Tap a card to play it (touch: tap twice) · bid with the buttons or <kbd>1</kbd>-<kbd>4</kbd> · <kbd>P</kbd> pass · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · discard: tap cards then confirm',
    width: 960,
    format: v => (v > 0 ? '+' : '') + v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="9" width="24" height="42" rx="4" transform="rotate(-11 22 30)"/><rect x="30" y="9" width="24" height="42" rx="4" transform="rotate(9 42 30)"/><circle cx="42" cy="30" r="6"/><path d="M42 24v12M36 30h12"/></svg>',
    css: TB_CSS.replace(/@@/g, '.gm-french-tarot'),
    _t: { TarotGame, tLegal, tCount, tScore, tBot, tWinIdx },
    mount(root, api) {
      const t = Table(root, api, TAROT_A);
      return { destroy: t.destroy, _t: t };
    }
  });
})();
