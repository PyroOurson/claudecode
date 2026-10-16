
(() => {
  'use strict';

  const CFG = {
    LW: 600, HDR: 72,
    DIFF: { easy: [10, 8, 10], medium: [18, 14, 40], hard: [24, 20, 99] },
    LONG_PRESS: 0.38, MOVE_CANCEL: 10,
    POP_FIRST: 0.5, POP_START: 0.26, POP_DECAY: 0.9, POP_MIN: 0.035, POP_CAP: 4.2, PANEL_DELAY: 0.9, WIN_DELAY: 1.3,
    MAX_TIME: 999, PARTICLE_CELLS: 140,
    COL: {
      hdr: '#4A752C', grassL: '#AAD751', grassD: '#A2D149', hoverL: '#BFE17D', hoverD: '#B9DD77',
      dirtL: '#E5C29F', dirtD: '#D7B899', dirtHL: '#ECD1B5', dirtHD: '#E1C7AC', edge: '#87AF3A', flag: '#F23607', pole: '#3B3B3B',
      card: '#4DC1F9', btn: '#1155CC'
    },
    NUM: ['', '#1976D2', '#388E3C', '#D32F2F', '#7B1FA2', '#FF8F00', '#0097A7', '#424242', '#9E9E9E'],
    MINES: ['#DB3236', '#F4840D', '#F4C20D', '#008744', '#48E6F1', '#4885ED', '#B648F2', '#ED44B5'],
    WIN_NUM: ['', '#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080']
  };
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, Roboto, Arial, sans-serif';
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const shade = (h, k) => `rgb(${hex(h).map(v => Math.round(v * k)).join(',')})`;

  function disc(c, x, y, r, col) { if (r > 0) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); } }
  function rr(c, x, y, w, h, r, col) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = col; c.fill(); }
  function text(c, s, x, y, size, col, align = 'center', font = FONT, weight = 900) {
    c.font = `${weight} ${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y);
  }
  function flagIcon(c, x, y, s, col = CFG.COL.flag) {
    c.fillStyle = CFG.COL.pole; c.fillRect(x - s * 0.2, y - s * 0.42, s * 0.09, s * 0.78);
    c.beginPath(); c.ellipse(x - s * 0.15, y + s * 0.38, s * 0.28, s * 0.08, 0, 0, TAU); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x - s * 0.13, y - s * 0.44);
    c.quadraticCurveTo(x + s * 0.12, y - s * 0.34, x + s * 0.4, y - s * 0.24); c.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x - s * 0.13, y - s * 0.02); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x - s * 0.13, y - s * 0.44); c.quadraticCurveTo(x + s * 0.1, y - s * 0.36, x + s * 0.3, y - s * 0.28); c.lineTo(x - s * 0.13, y - s * 0.3); c.closePath(); c.fill();
  }
  function clockIcon(c, x, y, s) {
    disc(c, x, y, s * 0.46, '#FFC107'); disc(c, x, y, s * 0.34, '#FFF3C4');
    c.strokeStyle = '#5D4300'; c.lineWidth = s * 0.08; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - s * 0.22); c.moveTo(x, y); c.lineTo(x + s * 0.16, y + s * 0.06); c.stroke();
  }
  function trophy(c, x, y, s) {
    c.fillStyle = '#FFC107';
    c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.5); c.lineTo(x + s * 0.5, y - s * 0.5); c.quadraticCurveTo(x + s * 0.48, y + s * 0.12, x, y + s * 0.18); c.quadraticCurveTo(x - s * 0.48, y + s * 0.12, x - s * 0.5, y - s * 0.5); c.fill();
    c.strokeStyle = '#FFC107'; c.lineWidth = s * 0.12;
    c.beginPath(); c.arc(x - s * 0.5, y - s * 0.2, s * 0.2, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.arc(x + s * 0.5, y - s * 0.2, s * 0.2, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
    c.fillRect(x - s * 0.08, y + s * 0.14, s * 0.16, s * 0.2);
    rr(c, x - s * 0.3, y + s * 0.32, s * 0.6, s * 0.16, s * 0.04, '#FFC107');
  }
  function speaker(c, x, y, s, on, col = '#fff') {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.18); c.lineTo(x - s * 0.22, y - s * 0.18); c.lineTo(x + s * 0.1, y - s * 0.45); c.lineTo(x + s * 0.1, y + s * 0.45); c.lineTo(x - s * 0.22, y + s * 0.18); c.lineTo(x - s * 0.5, y + s * 0.18); c.fill();
    c.strokeStyle = col; c.lineWidth = s * 0.1; c.lineCap = 'round';
    if (on) {
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.25, -0.8, 0.8); c.stroke();
      c.beginPath(); c.arc(x + s * 0.1, y, s * 0.45, -0.8, 0.8); c.stroke();
    } else {
      c.beginPath(); c.moveTo(x + s * 0.24, y - s * 0.18); c.lineTo(x + s * 0.56, y + s * 0.18); c.moveTo(x + s * 0.56, y - s * 0.18); c.lineTo(x + s * 0.24, y + s * 0.18); c.stroke();
    }
  }
  function shovel(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.rotate(-Math.PI / 4);
    c.fillStyle = col; c.fillRect(-s * 0.05, -s * 0.5, s * 0.1, s * 0.5);
    c.fillRect(-s * 0.16, -s * 0.56, s * 0.32, s * 0.08);
    c.beginPath(); c.moveTo(-s * 0.2, 0); c.lineTo(s * 0.2, 0); c.lineTo(s * 0.2, s * 0.24); c.quadraticCurveTo(0, s * 0.52, -s * 0.2, s * 0.24); c.closePath(); c.fill();
    c.restore();
  }
  function bevel(c, x, y, w, h, b, up) {
    c.fillStyle = '#C0C0C0'; c.fillRect(x, y, w, h);
    c.fillStyle = up ? '#fff' : '#808080';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - b, y + b); c.lineTo(x + b, y + b); c.lineTo(x + b, y + h - b); c.lineTo(x, y + h); c.closePath(); c.fill();
    c.fillStyle = up ? '#808080' : '#fff';
    c.beginPath(); c.moveTo(x + w, y + h); c.lineTo(x, y + h); c.lineTo(x + b, y + h - b); c.lineTo(x + w - b, y + h - b); c.lineTo(x + w - b, y + b); c.lineTo(x + w, y); c.closePath(); c.fill();
  }
  const SEG = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
  function led(c, x, y, w, h, v) {
    c.fillStyle = '#000'; c.fillRect(x, y, w, h);
    const s = Math.max(-99, Math.min(999, v | 0)), str = s < 0 ? '-' + String(-s).padStart(2, '0') : String(s).padStart(3, '0');
    const dw = (w - 8) / 3, dh = h - 8, t = Math.max(2, dw * 0.16);
    for (let k = 0; k < 3; k++) {
      const ch = str[k], m = ch === '-' ? 0x40 : SEG[+ch], dx = x + 4 + k * dw + dw * 0.12, dy = y + 4, ww = dw * 0.76, hh = dh;
      const segs = [[dx + t, dy, ww - 2 * t, t], [dx + ww - t, dy + t, t, hh / 2 - 1.5 * t], [dx + ww - t, dy + hh / 2 + t / 2, t, hh / 2 - 1.5 * t], [dx + t, dy + hh - t, ww - 2 * t, t], [dx, dy + hh / 2 + t / 2, t, hh / 2 - 1.5 * t], [dx, dy + t, t, hh / 2 - 1.5 * t], [dx + t, dy + hh / 2 - t / 2, ww - 2 * t, t]];
      segs.forEach((sg, i) => { c.fillStyle = m & (1 << i) ? '#FF1A1A' : '#3A0000'; c.fillRect(sg[0], sg[1], sg[2], sg[3]); });
    }
  }
  function classicMine(c, x, y, s) {
    c.strokeStyle = '#000'; c.lineWidth = s * 0.08; c.lineCap = 'butt';
    c.beginPath();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; c.moveTo(x - Math.cos(a) * s * 0.4, y - Math.sin(a) * s * 0.4); c.lineTo(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4); }
    c.stroke();
    disc(c, x, y, s * 0.27, '#000');
    c.fillStyle = '#fff'; c.fillRect(x - s * 0.14, y - s * 0.14, s * 0.1, s * 0.1);
  }
  function classicFlag(c, x, y, s) {
    c.fillStyle = '#000'; c.fillRect(x - s * 0.3, y + s * 0.22, s * 0.6, s * 0.1); c.fillRect(x - s * 0.16, y + s * 0.14, s * 0.32, s * 0.1);
    c.fillRect(x - s * 0.02, y - s * 0.12, s * 0.07, s * 0.3);
    c.fillStyle = '#F00'; c.beginPath(); c.moveTo(x + s * 0.05, y - s * 0.36); c.lineTo(x + s * 0.05, y - s * 0.04); c.lineTo(x - s * 0.3, y - s * 0.2); c.closePath(); c.fill();
  }
  function smiley(c, x, y, s, face) {
    disc(c, x, y, s * 0.42, '#000'); disc(c, x, y, s * 0.38, '#FFFF00');
    c.strokeStyle = '#000'; c.fillStyle = '#000'; c.lineWidth = s * 0.05; c.lineCap = 'round';
    if (face === 'dead') {
      for (const ex of [-0.14, 0.14]) { const cx = x + ex * s, cy = y - s * 0.1, q = s * 0.06; c.beginPath(); c.moveTo(cx - q, cy - q); c.lineTo(cx + q, cy + q); c.moveTo(cx + q, cy - q); c.lineTo(cx - q, cy + q); c.stroke(); }
      c.beginPath(); c.arc(x, y + s * 0.22, s * 0.14, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    } else if (face === 'cool') {
      c.fillRect(x - s * 0.26, y - s * 0.14, s * 0.52, s * 0.05);
      c.beginPath(); c.ellipse(x - s * 0.13, y - s * 0.08, s * 0.1, s * 0.07, 0, 0, TAU); c.ellipse(x + s * 0.13, y - s * 0.08, s * 0.1, s * 0.07, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(x, y + s * 0.04, s * 0.2, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
    } else {
      disc(c, x - s * 0.13, y - s * 0.1, s * 0.05, '#000'); disc(c, x + s * 0.13, y - s * 0.1, s * 0.05, '#000');
      if (face === 'oh') disc(c, x, y + s * 0.15, s * 0.08, '#000');
      else { c.beginPath(); c.arc(x, y + s * 0.02, s * 0.2, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); }
    }
  }

  Ameplay.register({
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Puzzle',
    tint: '#4A752C',
    blurb: 'Dig the grass, read the numbers and flag every hidden mine.',
    help: 'Click to dig · right-click to flag · click a satisfied number to clear around it · touch: tap digs, hold flags (or use the shovel/flag toggle) · <kbd>Arrows</kbd> <kbd>Space</kbd> <kbd>F</kbd>',
    better: 'low',
    format: v => v + ' s',
    width: 640,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 54V12"/><path d="M22 13l22 8-22 9z" fill="currentColor"/><path d="M12 54h22"/></svg>',
    css: '.gm-minesweeper{gap:0}.gm-minesweeper .g-canvas{background:#4A752C;cursor:pointer;border-radius:10px}',
    mount(root, api) {
      const { LW, HDR, COL } = CFG;
      const saved = api.load() || {};
      const st = {
        diff: CFG.DIFF[saved.diff] ? saved.diff : 'easy',
        best: saved.best && typeof saved.best === 'object' ? saved.best : {},
        snd: saved.snd !== false,
        classic: !!saved.classic
      };
      const store = () => api.save({ diff: st.diff, best: st.best, snd: st.snd, classic: st.classic });
      const portrait = (root.clientWidth || 600) < 560;
      let touchUI = matchMedia('(pointer: coarse)').matches;

      let ac = null, master = null, noise = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate >> 2, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t, dur, type, f0, f1, vol) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
      }
      function hiss(t, dur, type, f, vol) {
        const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; fl.type = type; fl.frequency.value = f; fl.Q.value = 0.9;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
      }
      function sfx(name, k = 0) {
        if (api.muted || !st.snd || !audio()) return;
        const t = ac.currentTime + 0.003;
        if (name === 'dig') { hiss(t, 0.09, 'lowpass', 1400 + Math.min(k, 30) * 40, 0.55); tone(t, 0.07, 'sine', 240, 140, 0.18); }
        else if (name === 'flag') { tone(t, 0.09, 'sine', 620, 1240, 0.2); tone(t + 0.05, 0.06, 'triangle', 1500, 1500, 0.06); }
        else if (name === 'unflag') tone(t, 0.1, 'sine', 900, 420, 0.18);
        else if (name === 'boom') { hiss(t, 0.5, 'lowpass', 900, 0.9); tone(t, 0.4, 'sine', 140, 40, 0.5); }
        else if (name === 'pop') { const f = 300 + (k % 8) * 70; hiss(t, 0.12, 'bandpass', f * 3, 0.5); tone(t, 0.1, 'triangle', f * 1.6, f * 0.6, 0.2); }
        else if (name === 'win') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + i * 0.1, 0.25, 'triangle', f, f, 0.18));
        else if (name === 'click') tone(t, 0.04, 'sine', 700, 600, 0.08);
        else if (name === 'nope') tone(t, 0.06, 'square', 180, 160, 0.05);
      }

      let cols, rows, M, T, N, H, view = null, canvas = null, ctx = null;
      let mine, open, flag, adj, mineCol, popAt, flagT;
      let status, boom = -1, t0, time, flagsLeft, opened, panelAt, overAt, endAt, submitted, newBest;
      let hover = -1, cursor = -1, showCursor = false, pressFace = false, menuOpen = false, flagMode = false, clock = 0;
      const parts = [], flyers = [];
      let lp = null;

      function makeView() {
        [cols, rows, M] = CFG.DIFF[st.diff];
        if (portrait) [cols, rows] = [rows, cols];
        N = cols * rows; T = LW / cols; H = Math.round(HDR + rows * T);
        if (canvas) canvas.remove();
        view = api.canvas(LW, H); canvas = view.canvas; ctx = view.ctx;
        bind(canvas);
      }
      function reset() {
        makeView();
        mine = new Uint8Array(N); open = new Uint8Array(N); flag = new Uint8Array(N); adj = new Uint8Array(N);
        mineCol = new Array(N).fill(null); popAt = new Float32Array(N).fill(-1); flagT = new Float32Array(N).fill(-9);
        status = 'fresh'; t0 = 0; time = 0; flagsLeft = M; opened = 0; panelAt = -1; overAt = 0; endAt = 0; submitted = false; newBest = false;
        hover = -1; cursor = -1; menuOpen = false; parts.length = 0; flyers.length = 0; lp = null;
        api.score(0);
      }
      const cx = i => (i % cols) * T, cy = i => HDR + ((i / cols) | 0) * T;
      function around(i, fn) {
        const x = i % cols, y = (i / cols) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) fn(ny * cols + nx);
        }
      }
      function plant(safe) {
        const sx = safe % cols, sy = (safe / cols) | 0, pool = [];
        for (let i = 0; i < N; i++) if (Math.abs((i % cols) - sx) > 1 || Math.abs(((i / cols) | 0) - sy) > 1) pool.push(i);
        for (let k = 0; k < M; k++) { const j = k + ((Math.random() * (pool.length - k)) | 0); [pool[k], pool[j]] = [pool[j], pool[k]]; mine[pool[k]] = 1; }
        for (let i = 0; i < N; i++) { let n = 0; around(i, j => { n += mine[j]; }); adj[i] = n; }
        status = 'play'; t0 = performance.now(); time = 0;
      }
      function reveal(i) {
        if (status === 'fresh') plant(i);
        if (status !== 'play' || open[i] || flag[i]) return;
        if (mine[i]) return lose(i);
        const list = [i], seen = new Uint8Array(N); seen[i] = 1;
        for (let k = 0; k < list.length; k++) {
          const j = list[k];
          open[j] = 1; opened++;
          if (!adj[j]) around(j, n => { if (!seen[n] && !open[n] && !flag[n] && !mine[n]) { seen[n] = 1; list.push(n); } });
        }
        dirt(list);
        sfx('dig', list.length);
        if (opened === N - M) win();
      }
      function chord(i) {
        if (status !== 'play' || !open[i] || !adj[i]) return false;
        let f = 0, hidden = 0;
        around(i, j => { f += flag[j]; if (!open[j] && !flag[j]) hidden++; });
        if (f !== adj[i] || !hidden) { if (hidden) sfx('nope'); return false; }
        let boom = -1;
        around(i, j => { if (!open[j] && !flag[j]) { if (mine[j]) { if (boom < 0) boom = j; } } });
        if (boom >= 0) { lose(boom); return true; }
        around(i, j => { if (!open[j] && !flag[j]) reveal(j); });
        return true;
      }
      function toggleFlag(i) {
        if (status === 'fresh' || status !== 'play' || open[i]) return;
        if (flag[i]) {
          flag[i] = 0; flagsLeft++; sfx('unflag');
          if (!st.classic) flyers.push({ x: cx(i) + T / 2, y: cy(i) + T / 2, vx: (Math.random() - 0.5) * T * 4, vy: -T * 7, r: 0, vr: (Math.random() - 0.5) * 9, t: 0 });
        } else { flag[i] = 1; flagsLeft--; flagT[i] = clock; sfx('flag'); }
      }
      function primary(i) {
        if (status === 'fresh' || status === 'play') {
          if (open[i]) chord(i);
          else if (flagMode && status === 'play') toggleFlag(i);
          else reveal(i);
        }
      }
      function secondary(i) {
        if (status !== 'play') return;
        if (open[i]) { chord(i); return; }
        if (flagMode) reveal(i); else toggleFlag(i);
      }
      function dirt(list) {
        if (st.classic) return;
        const n = Math.min(list.length, CFG.PARTICLE_CELLS);
        for (let k = 0; k < n; k++) {
          const i = list[k], x = i % cols, y = (i / cols) | 0, col = (x + y) & 1 ? COL.grassD : COL.grassL;
          for (let q = 0; q < 2; q++) {
            parts.push({ x: cx(i) + T * (0.25 + Math.random() * 0.5), y: cy(i) + T * (0.25 + Math.random() * 0.5), vx: (Math.random() - 0.5) * T * 5, vy: -T * (4 + Math.random() * 5), r: 0, vr: (Math.random() - 0.5) * 12, s: T * (0.18 + Math.random() * 0.14), c: col, t: 0, life: 0.9 + Math.random() * 0.5, delay: Math.min(0.25, k * 0.004) });
          }
        }
      }
      function stopTimer() { time = Math.min(CFG.MAX_TIME, Math.floor((performance.now() - t0) / 1000)); }
      function lose(i) {
        stopTimer(); status = 'lost'; overAt = clock; boom = i;
        mineCol[i] = CFG.MINES[(Math.random() * 8) | 0]; popAt[i] = clock; open[i] = 0;
        sfx('boom');
        const rest = [];
        for (let j = 0; j < N; j++) if (mine[j] && j !== i && !flag[j]) rest.push(j);
        for (let k = rest.length - 1; k > 0; k--) { const r = (Math.random() * (k + 1)) | 0; [rest[k], rest[r]] = [rest[r], rest[k]]; }
        let t = clock + CFG.POP_FIRST, gap = CFG.POP_START;
        if (st.classic) t = clock;
        for (const j of rest) {
          mineCol[j] = CFG.MINES[(Math.random() * 8) | 0];
          popAt[j] = Math.min(t, clock + CFG.POP_CAP);
          if (!st.classic) { t += gap; gap = Math.max(CFG.POP_MIN, gap * CFG.POP_DECAY); }
        }
        endAt = (rest.length ? Math.min(t, clock + CFG.POP_CAP) : clock) + (st.classic ? 0.6 : CFG.PANEL_DELAY);
        if (!st.classic) burst(i);
      }
      function win() {
        stopTimer(); status = 'won'; overAt = clock;
        let k = 0;
        for (let j = 0; j < N; j++) if (mine[j] && !flag[j]) { flag[j] = 1; flagT[j] = clock + (k++) * 0.03; }
        flagsLeft = 0;
        const s = Math.max(1, time);
        api.score(s);
        const pb = st.best[st.diff];
        newBest = !pb || s < pb;
        if (newBest) { st.best[st.diff] = s; store(); }
        if (!submitted) { submitted = true; api.submit(s); }
        sfx('win');
        endAt = clock + CFG.WIN_DELAY;
      }
      function burst(i) {
        const col = mineCol[i];
        for (let q = 0; q < 10; q++) {
          const a = Math.random() * TAU, v = T * (2 + Math.random() * 4);
          parts.push({ x: cx(i) + T / 2, y: cy(i) + T / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - T * 3, r: 0, vr: 6, s: T * (0.12 + Math.random() * 0.1), c: col, t: 0, life: 0.7, delay: 0 });
        }
      }
      function skipToPanel() {
        for (let j = 0; j < N; j++) if (popAt[j] > clock) popAt[j] = clock;
        endAt = clock;
      }

      const HB = {
        diff: { x: 10, y: 0, w: 150, h: HDR },
        skin: { x: LW - 176, y: 0, w: 58, h: HDR },
        mode: { x: LW - 118, y: 0, w: 58, h: HDR },
        sound: { x: LW - 60, y: 0, w: 58, h: HDR },
        face: { x: LW / 2 - 6 - 28, y: 0, w: 56, h: HDR }
      };
      const menuItems = () => ['easy', 'medium', 'hard'].map((d, k) => ({ d, x: 14, y: HDR - 8 + k * 56, w: 180, h: 56 }));
      const hit = (b, p) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
      const panelBtn = () => ({ x: LW / 2 - 130, y: HDR + (H - HDR) / 2 + 70, w: 260, h: 64 });
      const cellAt = p => {
        if (p.y < HDR) return -1;
        const x = Math.floor(p.x / T), y = Math.floor((p.y - HDR) / T);
        return x >= 0 && y >= 0 && x < cols && y < rows ? y * cols + x : -1;
      };
      function setDiff(d) { if (d !== st.diff) { st.diff = d; store(); } reset(); sfx('click'); }

      function header(p) {
        if (menuOpen) {
          for (const it of menuItems()) if (hit(it, p)) { menuOpen = false; setDiff(it.d); return true; }
          menuOpen = false; return true;
        }
        if (p.y >= HDR) return false;
        if (hit(HB.diff, p)) { menuOpen = true; sfx('click'); return true; }
        if (hit(HB.sound, p)) { st.snd = !st.snd; store(); sfx('click'); return true; }
        if (hit(HB.skin, p)) { st.classic = !st.classic; store(); sfx('click'); return true; }
        if (touchUI && hit(HB.mode, p)) { flagMode = !flagMode; sfx('click'); return true; }
        if (st.classic && hit(HB.face, p)) { reset(); sfx('click'); return true; }
        return true;
      }

      function bind(cv) {
        cv.addEventListener('contextmenu', e => e.preventDefault());
        cv.addEventListener('pointerdown', e => {
          e.preventDefault();
          audio();
          if (e.pointerType === 'touch' && !touchUI) touchUI = true;
          const p = view.toLocal(e);
          if (header(p)) return;
          if (status === 'won' || status === 'lost') {
            if (clock < endAt) { skipToPanel(); return; }
            if (clock - endAt > 0.35) reset();
            return;
          }
          const i = cellAt(p);
          if (i < 0) return;
          showCursor = false;
          if (e.pointerType === 'mouse') {
            if (e.button === 2) secondary(i);
            else if (e.button === 1) chord(i);
            else if (e.button === 0) { pressFace = true; primary(i); }
            return;
          }
          try { cv.setPointerCapture(e.pointerId); } catch (err) {}
          lp = { i, id: e.pointerId, t: clock, x: e.clientX, y: e.clientY, done: false };
          pressFace = true;
        });
        cv.addEventListener('pointermove', e => {
          if (lp && e.pointerId === lp.id) {
            if (Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > CFG.MOVE_CANCEL) { lp = null; pressFace = false; }
            return;
          }
          if (e.pointerType === 'mouse') hover = cellAt(view.toLocal(e));
        });
        const up = e => {
          pressFace = false;
          if (!lp || e.pointerId !== lp.id) return;
          if (!lp.done && e.type === 'pointerup') primary(lp.i);
          lp = null;
        };
        cv.addEventListener('pointerup', up);
        cv.addEventListener('pointercancel', up);
        cv.addEventListener('pointerleave', () => { hover = -1; });
      }
      api.on(window, 'keydown', e => {
        if (status === 'won' || status === 'lost') {
          if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) { e.preventDefault(); if (clock < endAt) skipToPanel(); else if (clock - endAt > 0.35) reset(); }
          return;
        }
        const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
        if (mv) {
          e.preventDefault();
          if (cursor < 0) cursor = (rows >> 1) * cols + (cols >> 1);
          else {
            const x = Math.max(0, Math.min(cols - 1, cursor % cols + mv[0])), y = Math.max(0, Math.min(rows - 1, ((cursor / cols) | 0) + mv[1]));
            cursor = y * cols + x;
          }
          showCursor = true; return;
        }
        if (cursor < 0 || e.repeat) return;
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); audio(); open[cursor] ? chord(cursor) : reveal(cursor); }
        else if (e.code === 'KeyF') toggleFlag(cursor);
      });

      reset();
      let lastPop = 0;
      api.loop(dt => {
        clock += dt;
        if (status === 'play') {
          const s = Math.min(CFG.MAX_TIME, Math.floor((performance.now() - t0) / 1000));
          if (s !== time) { time = s; api.score(time); }
        }
        if (lp && !lp.done && clock - lp.t >= CFG.LONG_PRESS) {
          lp.done = true; pressFace = false;
          if (status === 'play') { secondary(lp.i); try { navigator.vibrate && navigator.vibrate(18); } catch (e) {} }
        }
        if (status === 'lost') {
          let k = 0;
          for (let j = 0; j < N; j++) if (popAt[j] >= 0 && popAt[j] <= clock && popAt[j] > clock - dt) {
            k++; if (!st.classic) burst(j);
          }
          if (k && !st.classic && clock - lastPop > 0.03) { sfx('pop', (Math.random() * 8) | 0); lastPop = clock; }
          if (panelAt < 0 && clock >= endAt) panelAt = clock;
        } else if (status === 'won' && panelAt < 0 && clock >= endAt) panelAt = clock;
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          if (q.delay > 0) { q.delay -= dt; continue; }
          q.t += dt; q.vy += T * 26 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
          if (q.t > q.life || q.y > H + 20) parts.splice(i, 1);
        }
        for (let i = flyers.length - 1; i >= 0; i--) {
          const f = flyers[i]; f.t += dt; f.vy += T * 22 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += f.vr * dt;
          if (f.t > 1.2) flyers.splice(i, 1);
        }
        render();
      });

      function cellRect(i) {
        const x = i % cols, y = (i / cols) | 0;
        const x0 = Math.round(x * T), x1 = Math.round((x + 1) * T), y0 = Math.round(HDR + y * T), y1 = Math.round(HDR + (y + 1) * T);
        return [x0, y0, x1 - x0, y1 - y0];
      }
      function drawFlag(i, classic) {
        const [x, y, w] = cellRect(i);
        const age = clock - flagT[i];
        if (age < 0) return;
        const k = age < 0.25 ? Math.sin((age / 0.25) * Math.PI * 0.6) / Math.sin(Math.PI * 0.6) * (1 + 0.15 * Math.sin((age / 0.25) * Math.PI)) : 1;
        ctx.save(); ctx.translate(x + w / 2, y + w / 2 + w * 0.06); ctx.scale(k, k);
        classic ? classicFlag(ctx, 0, 0, w * 0.9) : flagIcon(ctx, 0, 0, w * 0.8);
        ctx.restore();
      }
      function boardGoogle() {
        const e = Math.max(2, T * 0.1);
        for (let i = 0; i < N; i++) {
          const [x, y, w, h] = cellRect(i), d = ((i % cols) + ((i / cols) | 0)) & 1;
          const hv = (i === hover || (showCursor && i === cursor)) && (status === 'play' || status === 'fresh');
          if (open[i]) ctx.fillStyle = hv && adj[i] ? (d ? COL.dirtHD : COL.dirtHL) : d ? COL.dirtD : COL.dirtL;
          else ctx.fillStyle = hv ? (d ? COL.hoverD : COL.hoverL) : d ? COL.grassD : COL.grassL;
          ctx.fillRect(x, y, w, h);
        }
        ctx.fillStyle = COL.edge;
        for (let i = 0; i < N; i++) {
          if (!open[i]) continue;
          const [x, y, w, h] = cellRect(i), cx0 = i % cols, cy0 = (i / cols) | 0;
          const shut = (dx, dy) => { const nx = cx0 + dx, ny = cy0 + dy; return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !open[ny * cols + nx]; };
          if (shut(-1, 0)) ctx.fillRect(x, y, e, h);
          if (shut(1, 0)) ctx.fillRect(x + w - e, y, e, h);
          if (shut(0, -1)) ctx.fillRect(x, y, w, e);
          if (shut(0, 1)) ctx.fillRect(x, y + h - e, w, e);
          if (shut(-1, -1)) ctx.fillRect(x, y, e, e);
          if (shut(1, -1)) ctx.fillRect(x + w - e, y, e, e);
          if (shut(-1, 1)) ctx.fillRect(x, y + h - e, e, e);
          if (shut(1, 1)) ctx.fillRect(x + w - e, y + h - e, e, e);
        }
        ctx.font = `900 ${Math.round(T * 0.62)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < N; i++) {
          if (!open[i] || !adj[i]) continue;
          const [x, y, w, h] = cellRect(i);
          ctx.fillStyle = CFG.NUM[adj[i]]; ctx.fillText(String(adj[i]), x + w / 2, y + h / 2 + T * 0.04);
        }
        for (let i = 0; i < N; i++) {
          if (popAt[i] >= 0 && popAt[i] <= clock) {
            const [x, y, w, h] = cellRect(i), age = clock - popAt[i], k = Math.min(1, age / 0.12);
            ctx.fillStyle = mineCol[i]; ctx.fillRect(x, y, w, h);
            disc(ctx, x + w / 2, y + h / 2, w * 0.24 * (0.6 + 0.4 * k), shade(mineCol[i], 0.62));
            if (flag[i]) drawFlag(i, false);
          } else if (flag[i]) {
            drawFlag(i, false);
            if (status === 'lost' && !mine[i] && clock >= endAt - 0.3) {
              const [x, y, w] = cellRect(i);
              ctx.strokeStyle = '#D32F2F'; ctx.lineWidth = Math.max(2, w * 0.1); ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + w * 0.2); ctx.lineTo(x + w * 0.8, y + w * 0.8); ctx.moveTo(x + w * 0.8, y + w * 0.2); ctx.lineTo(x + w * 0.2, y + w * 0.8); ctx.stroke();
            }
          }
        }
        if (showCursor && cursor >= 0 && (status === 'play' || status === 'fresh')) {
          const [x, y, w, h] = cellRect(cursor);
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        }
      }
      function boardClassic() {
        const b = Math.max(2, Math.round(T * 0.12));
        ctx.font = `900 ${Math.round(T * 0.66)}px Tahoma, Verdana, Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < N; i++) {
          const [x, y, w, h] = cellRect(i);
          const shown = open[i] || (status === 'lost' && mine[i] && !flag[i]);
          if (!shown) {
            const pressed = lp && lp.i === i && !lp.done && !flag[i];
            if (pressed) { ctx.fillStyle = '#C0C0C0'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#808080'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h); }
            else bevel(ctx, x, y, w, h, b, true);
            if (flag[i]) {
              if (status === 'lost' && !mine[i]) { classicMine(ctx, x + w / 2, y + h / 2, w); ctx.strokeStyle = '#F00'; ctx.lineWidth = Math.max(2, w * 0.08); ctx.beginPath(); ctx.moveTo(x + w * 0.15, y + h * 0.15); ctx.lineTo(x + w * 0.85, y + h * 0.85); ctx.moveTo(x + w * 0.85, y + h * 0.15); ctx.lineTo(x + w * 0.15, y + h * 0.85); ctx.stroke(); }
              else drawFlag(i, true);
            }
          } else {
            ctx.fillStyle = status === 'lost' && i === boom ? '#FF0000' : '#C0C0C0';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#808080'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h);
            if (mine[i]) classicMine(ctx, x + w / 2, y + h / 2, w);
            else if (adj[i]) { ctx.fillStyle = CFG.WIN_NUM[adj[i]]; ctx.fillText(String(adj[i]), x + w / 2, y + h / 2 + T * 0.03); }
          }
          if (showCursor && i === cursor && (status === 'play' || status === 'fresh')) { ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.strokeRect(x + 3, y + 3, w - 6, h - 6); ctx.setLineDash([]); }
        }
      }
      function headerGoogle() {
        ctx.fillStyle = COL.hdr; ctx.fillRect(0, 0, LW, HDR);
        const d = HB.diff;
        rr(ctx, d.x + 4, 16, d.w - 8, 40, 6, '#fff');
        text(ctx, st.diff[0].toUpperCase() + st.diff.slice(1), d.x + 18, 37, 20, '#222', 'left', FONT, 800);
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.moveTo(d.x + d.w - 34, 32); ctx.lineTo(d.x + d.w - 22, 32); ctx.lineTo(d.x + d.w - 28, 40); ctx.fill();
        const fx = portrait || touchUI ? 196 : 226;
        flagIcon(ctx, fx, 38, 36);
        text(ctx, String(flagsLeft), fx + 22, 37, 24, '#fff', 'left');
        clockIcon(ctx, fx + 96, 36, 32);
        text(ctx, String(time).padStart(3, '0'), fx + 118, 37, 24, '#fff', 'left');
        skinBtn(false);
        if (touchUI) modeBtn(false);
        speaker(ctx, HB.sound.x + 29, 36, 26, st.snd && !api.muted);
      }
      function skinBtn(classic) {
        const b = HB.skin, x = b.x + 9, y = 16, s = 40;
        if (classic) bevel(ctx, x, y, s, s, 3, true); else rr(ctx, x, y, s, s, 8, 'rgba(255,255,255,.2)');
        const q = 12;
        for (let k = 0; k < 4; k++) bevel(ctx, x + 7 + (k & 1) * (q + 2), y + 7 + (k >> 1) * (q + 2), q, q, 2, k !== 3);
      }
      function modeBtn(classic) {
        const b = HB.mode, x = b.x + 9, y = 16, s = 40;
        if (classic) bevel(ctx, x, y, s, s, 3, !flagMode); else rr(ctx, x, y, s, s, 8, flagMode ? '#fff' : 'rgba(255,255,255,.2)');
        if (flagMode) flagIcon(ctx, x + s / 2, y + s / 2 + 1, 30);
        else shovel(ctx, x + s / 2, y + s / 2, 30, classic ? '#000' : '#fff');
      }
      function headerClassic() {
        bevel(ctx, 0, 0, LW, HDR, 3, true);
        const d = HB.diff;
        bevel(ctx, d.x + 4, 16, d.w - 8, 40, 3, true);
        text(ctx, st.diff[0].toUpperCase() + st.diff.slice(1), d.x + 16, 37, 18, '#000', 'left', 'Tahoma, Verdana, Arial, sans-serif', 700);
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(d.x + d.w - 34, 32); ctx.lineTo(d.x + d.w - 22, 32); ctx.lineTo(d.x + d.w - 28, 40); ctx.fill();
        const f = HB.face;
        led(ctx, f.x - 92, 14, 78, 44, flagsLeft);
        led(ctx, f.x + f.w + 14, 14, 78, 44, time);
        bevel(ctx, f.x + 2, 10, 52, 52, 3, true);
        smiley(ctx, f.x + 28, 36, 46, status === 'lost' ? 'dead' : status === 'won' ? 'cool' : pressFace ? 'oh' : 'smile');
        skinBtn(true);
        if (touchUI) modeBtn(true);
        speaker(ctx, HB.sound.x + 29, 36, 24, st.snd && !api.muted, '#000');
      }
      function menu() {
        const items = menuItems(), classic = st.classic;
        const x = items[0].x, y = items[0].y, w = items[0].w, h = items.length * 56;
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.roundRect(x + 2, y + 4, w, h, classic ? 0 : 8); ctx.fill();
        if (classic) bevel(ctx, x, y, w, h, 3, true); else rr(ctx, x, y, w, h, 8, '#fff');
        for (const it of items) {
          const on = it.d === st.diff;
          if (on && !classic) rr(ctx, it.x + 4, it.y + 4, it.w - 8, it.h - 8, 6, '#E8F0E0');
          if (on) { ctx.strokeStyle = classic ? '#000' : COL.hdr; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(it.x + 18, it.y + 28); ctx.lineTo(it.x + 25, it.y + 35); ctx.lineTo(it.x + 38, it.y + 20); ctx.stroke(); }
          const [c, r, m] = CFG.DIFF[it.d];
          text(ctx, it.d[0].toUpperCase() + it.d.slice(1), it.x + 50, it.y + 22, 19, '#222', 'left', classic ? 'Tahoma, Verdana, Arial, sans-serif' : FONT, 800);
          text(ctx, `${c}×${r} · ${m} mines`, it.x + 50, it.y + 41, 13, '#666', 'left', classic ? 'Tahoma, Verdana, Arial, sans-serif' : FONT, 700);
        }
      }
      function panel() {
        const a = Math.min(1, (clock - panelAt) / 0.25);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,30,10,.35)'; ctx.fillRect(0, HDR, LW, H - HDR);
        const midY = HDR + (H - HDR) / 2, w = 300, h = 190, x = LW / 2 - w / 2, y = midY - h / 2 - 30 + (1 - a) * 20;
        const classic = st.classic;
        if (classic) bevel(ctx, x, y, w, h, 4, true);
        else { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.roundRect(x, y + 6, w, h, 14); ctx.fill(); rr(ctx, x, y, w, h, 14, COL.card); }
        const ink = classic ? '#000' : '#fff', font = classic ? 'Tahoma, Verdana, Arial, sans-serif' : FONT;
        text(ctx, status === 'won' ? (newBest ? 'New best!' : 'You win!') : 'Game over', LW / 2, y + 36, 26, ink, 'center', font);
        clockIcon(ctx, LW / 2 - 70, y + 92, 46);
        text(ctx, status === 'won' ? String(Math.max(1, time)).padStart(3, '0') : '–––', LW / 2 - 70, y + 150, 28, ink, 'center', font);
        trophy(ctx, LW / 2 + 70, y + 92, 42);
        const b = st.best[st.diff];
        text(ctx, b ? String(b).padStart(3, '0') : '–––', LW / 2 + 70, y + 150, 28, ink, 'center', font);
        const pb = panelBtn(); pb.y = y + h + 16;
        if (classic) { bevel(ctx, pb.x, pb.y, pb.w, pb.h, 4, true); }
        else { rr(ctx, pb.x, pb.y + 4, pb.w, pb.h, 10, '#0B3D91'); rr(ctx, pb.x, pb.y, pb.w, pb.h, 10, COL.btn); }
        ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(pb.x + 52, pb.y + pb.h / 2, 12, -Math.PI * 0.4, Math.PI * 1.4); ctx.stroke();
        ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(pb.x + 56, pb.y + pb.h / 2 - 20); ctx.lineTo(pb.x + 66, pb.y + pb.h / 2 - 11); ctx.lineTo(pb.x + 54, pb.y + pb.h / 2 - 6); ctx.fill();
        text(ctx, status === 'won' ? 'Play again' : 'Try again', pb.x + 150, pb.y + pb.h / 2 + 1, 26, ink, 'center', font);
        ctx.globalAlpha = 1;
      }
      function render() {
        ctx.clearRect(0, 0, LW, H);
        if (st.classic) boardClassic(); else boardGoogle();
        for (const q of parts) {
          if (q.delay > 0) continue;
          ctx.globalAlpha = Math.max(0, Math.min(1, (q.life - q.t) * 3));
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r); ctx.fillStyle = q.c; ctx.fillRect(-q.s / 2, -q.s / 2, q.s, q.s); ctx.restore();
        }
        ctx.globalAlpha = 1;
        for (const f of flyers) {
          ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
          ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r); flagIcon(ctx, 0, 0, T * 0.8); ctx.restore();
        }
        ctx.globalAlpha = 1;
        if (st.classic) headerClassic(); else headerGoogle();
        if (status === 'fresh' && !st.classic) {
          const a = 0.55 + 0.3 * Math.sin(clock * 3);
          ctx.globalAlpha = a;
          const msg = touchUI ? 'Tap to dig · hold to flag' : 'Click to dig · right-click to flag';
          ctx.font = `800 18px ${FONT}`;
          const w = ctx.measureText(msg).width + 40, y = H - 44;
          rr(ctx, LW / 2 - w / 2, y, w, 34, 17, 'rgba(0,0,0,.4)');
          text(ctx, msg, LW / 2, y + 17, 18, '#fff', 'center', FONT, 800);
          ctx.globalAlpha = 1;
        }
        if (menuOpen) menu();
        if (panelAt >= 0) panel();
      }

      root.__ms = {
        snap: () => ({ status, cols, rows, M, opened, flagsLeft, time, panel: panelAt >= 0, classic: st.classic, diff: st.diff, flagMode, H }),
        mines: () => Array.from(mine), open: () => Array.from(open), adj: () => Array.from(adj),
        set: o => { Object.assign(st, o); store(); reset(); }
      };
      return {
        destroy() {
          delete root.__ms;
          if (ac) { try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers['minesweeper'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
<g font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800">
<rect x="0" y="50" width="50" height="50" fill="#AAD751"/>
<rect x="50" y="50" width="50" height="50" fill="#A2D149"/>
<rect x="100" y="50" width="50" height="50" fill="#AAD751"/>
<rect x="150" y="50" width="50" height="50" fill="#A2D149"/>
<rect x="200" y="50" width="50" height="50" fill="#AAD751"/>
<rect x="250" y="50" width="50" height="50" fill="#A2D149"/>
<rect x="300" y="50" width="50" height="50" fill="#AAD751"/>
<rect x="350" y="50" width="50" height="50" fill="#A2D149"/>
<rect x="0" y="100" width="50" height="50" fill="#A2D149"/>
<rect x="50" y="100" width="50" height="50" fill="#AAD751"/>
<rect x="100" y="100" width="50" height="50" fill="#D7B899"/>
<rect x="150" y="100" width="50" height="50" fill="#E5C29F"/>
<rect x="200" y="100" width="50" height="50" fill="#D7B899"/>
<rect x="250" y="100" width="50" height="50" fill="#AAD751"/>
<rect x="300" y="100" width="50" height="50" fill="#A2D149"/>
<rect x="350" y="100" width="50" height="50" fill="#AAD751"/>
<rect x="0" y="150" width="50" height="50" fill="#AAD751"/>
<rect x="50" y="150" width="50" height="50" fill="#D7B899"/>
<rect x="100" y="150" width="50" height="50" fill="#E5C29F"/>
<rect x="150" y="150" width="50" height="50" fill="#D7B899"/>
<rect x="200" y="150" width="50" height="50" fill="#E5C29F"/>
<rect x="250" y="150" width="50" height="50" fill="#A2D149"/>
<rect x="300" y="150" width="50" height="50" fill="#AAD751"/>
<rect x="350" y="150" width="50" height="50" fill="#A2D149"/>
<rect x="0" y="200" width="50" height="50" fill="#A2D149"/>
<rect x="50" y="200" width="50" height="50" fill="#E5C29F"/>
<rect x="100" y="200" width="50" height="50" fill="#D7B899"/>
<rect x="150" y="200" width="50" height="50" fill="#E5C29F"/>
<rect x="200" y="200" width="50" height="50" fill="#D7B899"/>
<rect x="250" y="200" width="50" height="50" fill="#E5C29F"/>
<rect x="300" y="200" width="50" height="50" fill="#A2D149"/>
<rect x="350" y="200" width="50" height="50" fill="#AAD751"/>
<rect x="0" y="250" width="50" height="50" fill="#AAD751"/>
<rect x="50" y="250" width="50" height="50" fill="#D7B899"/>
<rect x="100" y="250" width="50" height="50" fill="#E5C29F"/>
<rect x="150" y="250" width="50" height="50" fill="#D7B899"/>
<rect x="200" y="250" width="50" height="50" fill="#E5C29F"/>
<rect x="250" y="250" width="50" height="50" fill="#D7B899"/>
<rect x="300" y="250" width="50" height="50" fill="#AAD751"/>
<rect x="350" y="250" width="50" height="50" fill="#A2D149"/>
<rect x="100" y="100" width="5" height="50" fill="#87AF3A"/>
<rect x="100" y="100" width="50" height="5" fill="#87AF3A"/>
<rect x="150" y="100" width="50" height="5" fill="#87AF3A"/>
<rect x="245" y="100" width="5" height="50" fill="#87AF3A"/>
<rect x="200" y="100" width="50" height="5" fill="#87AF3A"/>
<rect x="50" y="150" width="5" height="50" fill="#87AF3A"/>
<rect x="50" y="150" width="50" height="5" fill="#87AF3A"/>
<rect x="245" y="150" width="5" height="50" fill="#87AF3A"/>
<rect x="50" y="200" width="5" height="50" fill="#87AF3A"/>
<rect x="295" y="200" width="5" height="50" fill="#87AF3A"/>
<rect x="250" y="200" width="50" height="5" fill="#87AF3A"/>
<rect x="50" y="250" width="5" height="50" fill="#87AF3A"/>
<rect x="295" y="250" width="5" height="50" fill="#87AF3A"/>
<text x="125" y="137" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="175" y="137" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="225" y="137" font-size="34" text-anchor="middle" fill="#388E3C">2</text>
<text x="75" y="187" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="225" y="187" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="75" y="237" font-size="34" text-anchor="middle" fill="#388E3C">2</text>
<text x="225" y="237" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="275" y="237" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="75" y="287" font-size="34" text-anchor="middle" fill="#D32F2F">3</text>
<text x="125" y="287" font-size="34" text-anchor="middle" fill="#1976D2">1</text>
<text x="275" y="287" font-size="34" text-anchor="middle" fill="#388E3C">2</text>
<g transform="translate(25 125) scale(1)"><rect x="-9" y="-18" width="4.5" height="36" fill="#3B3B3B"/><ellipse cx="-7" cy="18" rx="13" ry="4" fill="#3B3B3B"/><path d="M-5-19q12 5 24 9q-12 5-24 10z" fill="#F23607"/></g>
<g transform="translate(125 225) scale(1)"><rect x="-9" y="-18" width="4.5" height="36" fill="#3B3B3B"/><ellipse cx="-7" cy="18" rx="13" ry="4" fill="#3B3B3B"/><path d="M-5-19q12 5 24 9q-12 5-24 10z" fill="#F23607"/></g>
<rect x="300" y="200" width="50" height="50" fill="#B648F2"/><circle cx="325" cy="225" r="12" fill="#713096"/>
<rect x="350" y="250" width="50" height="50" fill="#F4C20D"/><circle cx="375" cy="275" r="12" fill="#977808"/>
<rect x="183" y="161" width="14" height="14" fill="#8CC43A" transform="rotate(20 190 168)"/><rect x="215" y="143" width="14" height="14" fill="#8CC43A" transform="rotate(-15 222 150)"/><rect x="153" y="133" width="14" height="14" fill="#8CC43A" transform="rotate(35 160 140)"/><rect x="239" y="175" width="14" height="14" fill="#8CC43A" transform="rotate(10 246 182)"/><rect x="133" y="169" width="14" height="14" fill="#8CC43A" transform="rotate(-25 140 176)"/><rect x="198" y="113" width="14" height="14" fill="#8CC43A" transform="rotate(40 205 120)"/>
</g>
<rect width="400" height="50" fill="#4A752C"/>
<rect x="12" y="10" width="92" height="30" rx="6" fill="#fff"/><path d="M80 21h12l-6 8z" fill="#333"/><rect x="22" y="21" width="44" height="8" rx="4" fill="#9a9a9a"/>
<g transform="translate(150 26) scale(0.75)"><rect x="-9" y="-18" width="4.5" height="36" fill="#3B3B3B"/><ellipse cx="-7" cy="18" rx="13" ry="4" fill="#3B3B3B"/><path d="M-5-19q12 5 24 9q-12 5-24 10z" fill="#F23607"/></g>
<rect x="170" y="20" width="22" height="12" rx="3" fill="#fff"/>
<circle cx="236" cy="25" r="12" fill="#FFC107"/><circle cx="236" cy="25" r="8.5" fill="#FFF3C4"/><path d="M236 25v-6M236 25l4 2" stroke="#5D4300" stroke-width="2.5" stroke-linecap="round"/>
<rect x="256" y="20" width="34" height="12" rx="3" fill="#fff"/>
<g transform="translate(322 136) rotate(-8)"><rect x="-6" y="-60" width="10" height="92" rx="3" fill="#2E2E2E"/><path d="M4-62q34 12 62 22q-30 12-62 26z" fill="#F23607"/><path d="M4-62q30 11 50 19l-50 4z" fill="#fff" opacity=".25"/><ellipse cx="0" cy="32" rx="26" ry="8" fill="#2E2E2E"/></g>
</svg>`;
})();

