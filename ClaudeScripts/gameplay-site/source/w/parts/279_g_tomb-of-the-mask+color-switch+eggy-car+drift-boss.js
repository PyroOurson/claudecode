(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rndi = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const mulberry = s => () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => {
    const p = hexRgb(a), q = hexRgb(b);
    return '#' + [0, 1, 2].map(i => Math.round(lerp(p[i], q[i], t)).toString(16).padStart(2, '0')).join('');
  };
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const fmtN = n => n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : String(Math.floor(n));

  function makeAudio(api) {
    let ac = null, master = null, nb = null;
    const get = () => {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
        nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = nb.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const tone = (f0, f1, dur, type = 'square', vol = .1, delay = 0) => {
      if (!get()) return;
      const t = ac.currentTime + delay + .004, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .008);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
    };
    const noise = (dur, vol = .12, f0 = 3000, f1 = 600, type = 'bandpass', delay = 0) => {
      if (!get()) return;
      const t = ac.currentTime + delay + .004, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; f.type = type; f.Q.value = 1.1;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .4); s.stop(t + dur + .03);
    };
    return { tone, noise, get, ctx: () => ac, out: () => master };
  }

  function pointers(api, view, h) {
    const c = view.canvas, act = new Map();
    c.style.touchAction = 'none';
    api.on(c, 'pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button > 0) return;
      try { c.setPointerCapture(e.pointerId); } catch (x) {}
      const p = view.toLocal(e); p.id = e.pointerId; p.sx = p.x; p.sy = p.y; p.t = performance.now(); p.type = e.pointerType;
      act.set(e.pointerId, p);
      if (h.down) h.down(p, e);
      e.preventDefault();
    });
    api.on(c, 'pointermove', e => {
      const q = view.toLocal(e), a = act.get(e.pointerId);
      if (a) { a.x = q.x; a.y = q.y; }
      if (h.move) h.move(a || q, e);
    });
    const up = e => {
      const a = act.get(e.pointerId);
      if (!a) return;
      act.delete(e.pointerId);
      const q = view.toLocal(e); a.x = q.x; a.y = q.y;
      if (h.up) h.up(a, e);
    };
    api.on(c, 'pointerup', up);
    api.on(c, 'pointercancel', up);
    api.on(c, 'contextmenu', e => e.preventDefault());
    return act;
  }

  function hits() {
    let cur = [], nxt = [];
    return {
      begin() { cur = nxt; nxt = []; },
      add(x, y, w, h, fn) { nxt.push({ x, y, w, h, fn }); },
      hit(px, py) {
        for (let i = cur.length - 1; i >= 0; i--) {
          const b = cur[i];
          if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) { b.fn(); return true; }
        }
        return false;
      },
      over(px, py) {
        for (let i = cur.length - 1; i >= 0; i--) { const b = cur[i]; if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b; }
        return null;
      }
    };
  }

  function store(api, def) {
    const d = Object.assign({}, def);
    const s = api.load();
    if (s && typeof s === 'object') Object.assign(d, s);
    return { d, save() { api.save(d); } };
  }

  function sprite(rows, pal) {
    const h = rows.length, w = rows[0].length, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = rows[j][i], col = pal[k];
      if (col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); }
    }
    return c;
  }

  function pauseKey() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
  }

  function uiKit(x, ui, hover, click) {
    const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
    const text = (t, px, py, size, col, al = 'left', w = 800) => {
      x.font = `${w} ${size}px ${FONT}`; x.textAlign = al; x.textBaseline = 'middle';
      x.fillStyle = 'rgba(0,0,0,.22)'; x.fillText(t, px + 2, py + 3);
      x.fillStyle = col; x.fillText(t, px, py);
    };
    const btn = (bx, by, bw, bh, label, fn, o = {}) => {
      const ov = hover.x >= bx && hover.x <= bx + bw && hover.y >= by && hover.y <= by + bh;
      x.fillStyle = o.dk || '#c9742a'; x.beginPath(); x.roundRect(bx, by + 5, bw, bh, bh / 2.4); x.fill();
      x.fillStyle = o.col || (ov ? '#ffb347' : '#ff9a2e'); x.beginPath(); x.roundRect(bx, by + (ov ? 2 : 0), bw, bh, bh / 2.4); x.fill();
      x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.roundRect(bx + 6, by + 5 + (ov ? 2 : 0), bw - 12, bh * .3, bh * .15); x.fill();
      text(label, bx + bw / 2, by + bh / 2 + (ov ? 2 : 0), o.fs || bh * .46, '#fff', 'center');
      ui.add(bx, by, bw, bh + 5, () => { click(); fn(); });
    };
    const coin = (px, py, r) => {
      x.fillStyle = '#e0a800'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
      x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(px, py, r * .75, 0, TAU); x.fill();
      x.fillStyle = '#e0a800'; x.fillRect(px - r * .1, py - r * .4, r * .2, r * .8);
    };
    return { FONT, text, btn, coin };
  }

  const GLY = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
    F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
    K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
    P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
    Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
    4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111',
    9: '111101111001111', '-': '000000111000000', '.': '000000000000010', ':': '000010000010000', '!': '010010010000010',
    '/': '001001010100100', '+': '000010111010000', x: '000101010101000', '?': '111001010000010', '<': '001010100010001',
    '>': '100010001010100'
  };
  const tmW = (s, n) => String(s).length * 4 * n - n;
  function ptext(x, str, px, py, n, col, al, sh) {
    str = String(str).toUpperCase();
    const w = tmW(str, n);
    const x0 = al === 'c' ? px - w / 2 : al === 'r' ? px - w : px;
    for (let pass = sh ? 0 : 1; pass < 2; pass++) {
      let cx = x0 + (pass === 0 ? Math.max(1, n >> 1) : 0);
      const oy = py + (pass === 0 ? Math.max(1, n >> 1) : 0);
      x.fillStyle = pass === 0 ? sh : col;
      for (const ch of str) {
        const g = GLY[ch];
        if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') x.fillRect(Math.round(cx + (i % 3) * n), Math.round(oy + ((i / 3) | 0) * n), n, n);
        cx += 4 * n;
      }
    }
  }
  let x = null;

  const TM_PALS = [
    { e1: '#ffe600', e2: '#a89700', e3: '#4d4400', wall: '#100c03', w2: '#1a1506', fl: '#020106', dot: '#ffd23f', acc: '#ffe600', glow: '255,230,0' },
    { e1: '#3ff0ff', e2: '#238e99', e3: '#0f4048', wall: '#030e14', w2: '#07171f', fl: '#020106', dot: '#a3f7ff', acc: '#3ff0ff', glow: '63,240,255' },
    { e1: '#ff4ccf', e2: '#9e2f80', e3: '#4a173d', wall: '#12050f', w2: '#1c0a17', fl: '#020106', dot: '#ffa6ec', acc: '#ff4ccf', glow: '255,76,207' },
    { e1: '#ff8a1f', e2: '#a85512', e3: '#4f2808', wall: '#130a03', w2: '#1d1005', fl: '#020106', dot: '#ffc27a', acc: '#ff8a1f', glow: '255,138,31' }
  ];
  const TM_SKINS = [
    { n: 'CLASSIC', y: '#ffd21f', d: '#d98a14', r: '#ff4b2b', p: 0 },
    { n: 'CRIMSON', y: '#ff5a4d', d: '#b3262f', r: '#ffd21f', p: 120 },
    { n: 'AZURE', y: '#4cc3ff', d: '#2a73c9', r: '#ffffff', p: 240 },
    { n: 'JADE', y: '#4be08a', d: '#208550', r: '#ffd21f', p: 360 },
    { n: 'ROYAL', y: '#b36bff', d: '#6633c4', r: '#ffd21f', p: 500 },
    { n: 'GHOST', y: '#f2f2ff', d: '#9fa0c2', r: '#ff4bd6', p: 700 }
  ];
  const MASK_ROWS = [
    '...oooooo...',
    '..oyyyyyyo..',
    '.oyyyyyyyyo.',
    'oyrrrrrrrryo',
    'oyyyyyyyyyyo',
    'oywwyyyywwyo',
    'oywkyyyykwyo',
    'oyyyyyyyyyyo',
    'oyykkkkkkyyo',
    '.oyyyyyyyyo.',
    '.odyyyyyydo.',
    '..oooooooo..'
  ];
  const tmMask = {};
  const maskSpr = i => tmMask[i] || (tmMask[i] = sprite(MASK_ROWS, { o: '#2a1600', y: TM_SKINS[i].y, d: TM_SKINS[i].d, r: TM_SKINS[i].r, w: '#ffffff', k: '#1a0e00' }));
  const TM_SP = {
    coin: sprite(['..oooo..', '.oyyyyo.', 'oyyhhyyo', 'oyhyyyyo', 'oyhyyyyo', 'oyyyyyyo', '.oyyyyo.', '..oooo..'], { o: '#a86a00', y: '#ffcc1a', h: '#fff3a0' }),
    star: sprite(['.....o.....', '....oyo....', '....oyo....', '...oyyyo...', 'ooooyyyoooo', 'oyyyyhyyyyo', '.oyyyhyyyo.', '..oyyyyyo..', '..oyyyyyo..', '.oyyyoyyyo.', '.oyyo.oyyo.', '..oo...oo..'], { o: '#b87800', y: '#ffe84a', h: '#ffffff' }),
    sh: sprite(['.ooooooooo.', 'obbbbwbbbbo', 'obbbwbbbbbo', 'obbbwbbbbbo', 'obbbbbbbbbo', '.obbbbbbbo.', '..obbbbbo..', '...obbbo...', '....obo....', '.....o.....'], { o: '#0b3d91', b: '#3b8cff', w: '#cfe6ff' }),
    mg: sprite(['sss.....sss', 'sss.....sss', 'rrr.....rrr', 'rrr.....rrr', 'rrr.....rrr', 'rrrr...rrrr', '.rrrr.rrrr.', '..rrrrrrr..', '...rrrrr...'], { r: '#ff3b3b', s: '#e8e8ff' }),
    fz: sprite(['.....c.....', '..c..c..c..', '...c.c.c...', '....ccc....', 'ccccccccccc', '....ccc....', '...c.c.c...', '..c..c..c..', '.....c.....'], { c: '#7ff3ff' }),
    spike: sprite(['..s...s..', '..s...s..', '.sss.sss.', '.sss.sss.', 'sssssssss', 'ddddddddd'], { s: '#eef0ff', d: '#6b6e9a' }),
    batA: sprite(['p.........p', 'pp..p.p..pp', 'ppppppppppp', '.ppppppppp.', '..peppepp..', '...p...p...'], { p: '#8a35d6', e: '#ff4040' }),
    batB: sprite(['...p...p...', '..ppppppp..', '.ppeppppepp', 'ppppppppppp', 'pp..ppp..pp', 'p....p....p'], { p: '#8a35d6', e: '#ff4040' })
  };
  const TM_LV = 40;

  function tmSolve(g, w, h, sx, bad) {
    const DXs = [0, 1, 0, -1], DYs = [-1, 0, 1, 0];
    const seen = new Uint8Array(w * h), pass = new Uint8Array(w * h), st = [(h - 1) * w + sx];
    seen[st[0]] = 1; pass[st[0]] = 1;
    let ok = false;
    while (st.length) {
      const p = st.pop(), px = p % w, py = (p / w) | 0;
      for (let d = 0; d < 4; d++) {
        let cx = px, cy = py, dead = false, moved = 0;
        const trail = [];
        for (;;) {
          const nx = cx + DXs[d], ny = cy + DYs[d];
          if (ny < 0) { if (cy === 0 && g[cx]) ok = true; break; }
          if (nx < 0 || nx >= w || ny >= h || !g[ny * w + nx]) break;
          cx = nx; cy = ny; moved++;
          if (bad && bad[cy * w + cx]) { dead = true; break; }
          trail.push(cy * w + cx);
        }
        if (dead || !moved) continue;
        for (const t of trail) pass[t] = 1;
        const e = cy * w + cx;
        if (cy > 0 && !seen[e]) { seen[e] = 1; st.push(e); }
      }
    }
    return { ok, seen, pass };
  }

  function tmPath(rng, w, h, sx) {
    const g = new Uint8Array(w * h);
    let cx = sx, cy = h - 1, horiz = true, first = true, guard = 0, ex = -1;
    g[cy * w + cx] = 1;
    let bad = false;
    const carve = (dx, dy, len) => {
      for (let i = 0; i < len; i++) {
        const px = cx, py = cy;
        cx += dx; cy += dy;
        if (cx < 1 || cx > w - 2 || cy < 0) { bad = true; return; }
        if (!g[cy * w + cx] && cy > 0) {
          for (let q = 0; q < 4; q++) {
            const ax = cx + [0, 1, 0, -1][q], ay = cy + [-1, 0, 1, 0][q];
            if (ax === px && ay === py) continue;
            if (ay >= 0 && ay < h && g[ay * w + ax]) bad = true;
          }
        }
        g[cy * w + cx] = 1;
      }
    };
    while (guard++ < 70) {
      if (horiz) {
        let nx = cx, tries = 0;
        while ((Math.abs(nx - cx) < 2 || (first && nx === sx)) && tries++ < 30) nx = 1 + Math.floor(rng() * (w - 2));
        if (nx === cx) return null;
        carve(Math.sign(nx - cx), 0, Math.abs(nx - cx));
        first = false;
      } else {
        if (cy <= 4) { carve(0, -1, cy); ex = cx; break; }
        if (rng() < .2 && cy + 2 <= h - 3) {
          const d = 1 + Math.floor(rng() * Math.min(3, h - 3 - cy));
          carve(0, 1, d);
        } else {
          let up = 2 + Math.floor(rng() * 4);
          up = Math.min(up, cy - 2);
          if (up < 1) { carve(0, -1, cy); ex = cx; break; }
          carve(0, -1, up);
        }
      }
      horiz = !horiz;
    }
    if (ex < 0 || bad) return null;
    return { g, ex };
  }

  function tmZig(w, h, sx) {
    const g = new Uint8Array(w * h);
    let side = sx <= (w >> 1) ? w - 2 : 1, y = h - 1;
    for (let i = 1; i < w - 1; i++) g[y * w + i] = 1;
    while (y > 1) {
      g[(y - 1) * w + side] = 1; g[(y - 2) * w + side] = 1;
      y -= 2;
      for (let i = 1; i < w - 1; i++) g[y * w + i] = 1;
      side = side === 1 ? w - 2 : 1;
    }
    g[side] = 1;
    return { g, ex: side };
  }

  function tmBranches(rng, g, w, h, sx, count) {
    const DXs = [0, 1, 0, -1], DYs = [-1, 0, 1, 0];
    for (let k = 0; k < count; k++) {
      for (let tries = 0; tries < 24; tries++) {
        const open = [];
        for (let i = w; i < w * h; i++) if (g[i]) open.push(i);
        const o = open[Math.floor(rng() * open.length)], ox = o % w, oy = (o / w) | 0, d = Math.floor(rng() * 4);
        const len = 2 + Math.floor(rng() * 4), cells = [];
        for (let i = 1; i <= len; i++) {
          const nx = ox + DXs[d] * i, ny = oy + DYs[d] * i;
          if (nx < 1 || nx > w - 2 || ny < 1 || ny > h - 1 || g[ny * w + nx]) break;
          if (ny === h - 2 && nx === sx) break;
          let busy = 0;
          for (let q = 0; q < 4; q++) {
            const ax = nx + DXs[q], ay = ny + DYs[q];
            if (ax < 0 || ay < 0 || ax >= w || ay >= h) continue;
            if (g[ay * w + ax] && !(ax === ox + DXs[d] * (i - 1) && ay === oy + DYs[d] * (i - 1))) busy++;
          }
          if (busy > 0) break;
          cells.push(ny * w + nx);
        }
        if (cells.length < 2) continue;
        const g2 = g.slice();
        for (const c of cells) g2[c] = 1;
        if (!tmSolve(g2, w, h, sx, null).ok) continue;
        for (const c of cells) g[c] = 1;
        break;
      }
    }
  }

  function tmBake(ch, pal) {
    const C = 11, w = C * 8, mt = ch.mt, h = (ch.h + ch.mt + ch.mb) * 8, cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c = cv.getContext('2d'), id = c.createImageData(w, h), d = id.data, op = new Uint8Array(w * h);
    for (let ty = 0; ty < ch.h; ty++) for (let tx = 0; tx < C; tx++) if (ch.g[ty * C + tx]) {
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) op[((ty + mt) * 8 + j) * w + tx * 8 + i] = 1;
    }
    const e1 = hexRgb(pal.e1), e2 = hexRgb(pal.e2), e3 = hexRgb(pal.e3), wl = hexRgb(pal.wall), w2 = hexRgb(pal.w2), fl = hexRgb(pal.fl), fe = hexRgb(mix(pal.fl, pal.e3, .35)), br = hexRgb(mix(pal.wall, '#000000', .45));
    const rng = mulberry(ch.seed);
    const isOp = (px, py) => px >= 0 && px < w && op[clamp(py, 0, h - 1) * w + px] === 1;
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      let col;
      if (op[py * w + px]) {
        const edge = !isOp(px - 1, py) || !isOp(px + 1, py) || !isOp(px, py - 1) || !isOp(px, py + 1);
        col = edge ? fe : fl;
        if (!edge && rng() < .02) col = fe;
      } else {
        let dm = 9;
        for (let r = 1; r <= 3 && dm === 9; r++) {
          for (let j = -r; j <= r && dm === 9; j++) for (let k = -r; k <= r; k++) {
            if (Math.max(Math.abs(j), Math.abs(k)) !== r) continue;
            if (isOp(px + k, py + j)) { dm = r; break; }
          }
        }
        if (dm === 1) col = e1; else if (dm === 2) col = e2; else if (dm === 3) col = e3;
        else {
          col = ((px + (py >> 2 & 1) * 4) % 8 === 0 || py % 4 === 0) ? br : wl;
          if (rng() < .06) col = w2;
        }
      }
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
    c.putImageData(id, 0, 0);
    const glyphs = [['.#.', '###', '.#.'], ['###', '#.#', '###'], ['#.#', '.#.', '#.#'], ['##.', '.#.', '.##']];
    c.fillStyle = pal.e3;
    for (let ty = 1; ty < ch.h - 1; ty++) for (let tx = 1; tx < C - 1; tx++) {
      let all = true;
      for (let j = -1; j <= 1 && all; j++) for (let k = -1; k <= 1; k++) if (ch.g[(ty + j) * C + tx + k]) { all = false; break; }
      if (!all || rng() > .22) continue;
      const gl = glyphs[Math.floor(rng() * 4)];
      for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) if (gl[j][k] === '#') c.fillRect(tx * 8 + 2 + k, (ty + mt) * 8 + 2 + j, 1, 1);
    }
    return cv;
  }

  function tmParams(lv, k, end) {
    const dd = end ? Math.min(40, 2 + k * 2.6) : lv;
    return {
      h: 16, dd,
      branches: 5 + Math.floor(dd / 8),
      spikes: dd < 2 ? 0 : Math.min(8, 1 + Math.floor(dd / 5)),
      bats: dd < 5 ? 0 : Math.min(3, 1 + Math.floor((dd - 5) / 9)),
      fish: dd < 12 ? 0 : Math.min(2, 1 + Math.floor((dd - 12) / 12)),
      coins: 3 + (end ? 2 : 0),
      pu: end ? .55 : (dd >= 3 ? .5 : 0)
    };
  }
  const tmPalFor = (lv, k, end) => TM_PALS[end ? Math.floor(k / 5) % 4 : Math.min(3, Math.floor((lv - 1) / 10))];
  const tmChunksFor = lv => Math.min(8, 2 + Math.floor((lv - 1) / 5));

  function tmChunk(wd, k) {
    const C = 11, rng = wd.rng, o = tmParams(wd.lv, k, wd.end), h = o.h;
    const sx = k === 0 ? 5 : wd.chunks[k - 1].ex, start = (h - 1) * C + sx;
    let res = null;
    for (let a = 0; a < 80 && !res; a++) {
      const r = tmPath(rng, C, h, sx);
      if (r && tmSolve(r.g, C, h, sx, null).ok) res = r;
    }
    if (!res) res = tmZig(C, h, sx);
    const g = res.g;
    tmBranches(rng, g, C, h, sx, o.branches);
    const bad = new Uint8Array(C * h), openL = [];
    for (let i = C; i < C * h; i++) if (g[i] && i !== start) openL.push(i);
    for (let n = 0; n < o.spikes; n++) {
      for (let t = 0; t < 14; t++) {
        const i = openL[Math.floor(rng() * openL.length)], ix = i % C, iy = (i / C) | 0;
        if (bad[i] || iy >= h - 2 && Math.abs(ix - sx) <= 1 || iy < 2) continue;
        bad[i] = 1;
        if (!tmSolve(g, C, h, sx, bad).ok) bad[i] = 0; else break;
      }
    }
    const sol = tmSolve(g, C, h, sx, bad), items = new Map(), cand = [];
    const nb = i => { let n = 0; const x0 = i % C, y0 = (i / C) | 0; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([a, b]) => { if (y0 + b >= 0 && g[(y0 + b) * C + x0 + a]) n++; }); return n; };
    const dead = [], other = [];
    for (let i = C; i < C * h; i++) if (g[i] && i !== start && sol.pass[i] && !bad[i]) (nb(i) === 1 ? dead : other).push(i);
    const take = (n, pool2) => {
      const out = [];
      for (let a = 0; a < n; a++) {
        const L = dead.length && (rng() < .75 || !other.length) ? dead : other;
        if (!L.length) break;
        const idx = Math.floor(rng() * L.length);
        out.push(L.splice(idx, 1)[0]);
      }
      return out;
    };
    const dots = [];
    for (let i = C; i < C * h; i++) if (g[i] && i !== start) {
      if (bad[i]) {
        const ix = i % C, iy = (i / C) | 0, dirs = [2, 0, 3, 1].sort(() => rng() - .5);
        let ow = 2;
        for (const dr of dirs) { const nx = ix + [0, 1, 0, -1][dr], ny = iy + [-1, 0, 1, 0][dr]; if (ny >= 0 && !g[ny * C + nx]) { ow = dr; break; } }
        items.set(i, { t: 'sp', o: ow });
      } else if (sol.pass[i]) { items.set(i, { t: 'd' }); dots.push(i); }
    }
    let starN = 0;
    if (!wd.end) {
      const nCh = wd.nCh;
      for (let s = 0; s < 3; s++) if (Math.min(nCh - 1, Math.floor((s + .5) * nCh / 3)) === k) starN++;
      if (nCh === 2) starN = k === 0 ? 1 : 2;
    }
    take(starN).forEach(i => items.set(i, { t: 's' }));
    take(o.coins).forEach(i => items.set(i, { t: 'c' }));
    if (rng() < o.pu) take(1).forEach(i => items.set(i, { t: pick(['sh', 'mg', 'fz']) }));
    const bats = [], fish = [], cells = [...sol.seen].map((v, i) => v ? i : -1).filter(i => i >= 0 && i !== start);
    for (let n = 0; n < o.bats; n++) {
      for (let t = 0; t < 20; t++) {
        const i = cells[Math.floor(rng() * cells.length)], ix = i % C, iy = (i / C) | 0;
        if (iy < 2 || (k === 0 && iy >= h - 2)) continue;
        const ver = rng() < .3, dx = ver ? 0 : 1, dy = ver ? 1 : 0;
        let a = 0, b = 0;
        while (g[(iy - dy * (a + 1)) * C + ix - dx * (a + 1)] && !bad[(iy - dy * (a + 1)) * C + ix - dx * (a + 1)] && iy - dy * (a + 1) >= 1) a++;
        while (g[(iy + dy * (b + 1)) * C + ix + dx * (b + 1)] && !bad[(iy + dy * (b + 1)) * C + ix + dx * (b + 1)] && iy + dy * (b + 1) < h) b++;
        if (a + b < 3) continue;
        bats.push({ ver, r: iy - k * h, c: ix, a: ver ? iy - a - k * h : ix - a, b: ver ? iy + b - k * h : ix + b, pos: (ver ? iy - k * h : ix) + .0, v: 2.6 + Math.min(1.6, o.dd * .04), s: rng() < .5 ? 1 : -1, ph: rng() * 6 });
        break;
      }
    }
    for (let n = 0; n < o.fish; n++) {
      for (let t = 0; t < 20; t++) {
        const i = cells[Math.floor(rng() * cells.length)], ix = i % C, iy = (i / C) | 0;
        if (iy < 2 || bad[i] || items.has(i) && items.get(i).t !== 'd' || (k === 0 && iy >= h - 2)) continue;
        items.delete(i);
        fish.push({ c: ix, r: iy - k * h, ph: rng() * 3.2 });
        break;
      }
    }
    if (!wd.end && k === wd.nCh - 1) items.set(res.ex, { t: 'x' });
    const ch = { k, h, mt: !wd.end && k === wd.nCh - 1 ? 1 : 0, mb: k === 0 ? 1 : 0, g, ex: res.ex, sx, items, bats, fish, dots: dots.length, seed: Math.floor(rng() * 1e9), pal: tmPalFor(wd.lv, k, wd.end), water: o.fish > 0 };
    ch.art = tmBake(ch, ch.pal);
    wd.chunks[k] = ch;
    bats.forEach(b => wd.bats.push(b));
    fish.forEach(f => wd.fish.push(f));
    wd.total += dots.length;
    return ch;
  }

  function tmWorld(lv, end) {
    const wd = { lv, end, chunks: [], nCh: end ? 99 : tmChunksFor(lv), rng: mulberry(end ? Math.floor(Math.random() * 1e9) : lv * 7919 + 13), bats: [], fish: [], total: 0 };
    tmChunk(wd, 0); tmChunk(wd, 1);
    if (!end) for (let k = 2; k < wd.nCh; k++) tmChunk(wd, k);
    return wd;
  }

  function mountTomb(root, api) {
    const W = 440, H = 720, T = 40, C = 11, CH = 16;
    const view = api.canvas(W, H), cv = view.canvas;
    x = view.ctx;
    const au = makeAudio(api), ui = hits();
    const sv = store(api, { coins: 0, stars: {}, mask: 0, owned: [0], endless: 0, plays: 0 });
    const d = sv.d;
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    let mode = 'menu', page = 0, tm = 0, shake = 0, flash = 0, hover = { x: -1, y: -1 }, cardT = 0;
    let wd = null, P = null, cam = 0, parts = [], fly = [], trail = [], lv = 1, endless = false, msg = '', lava = 0, climbed = 0;
    let st = null, backdrop = null;

    const done = () => { let n = 0; while (d.stars[n + 1] != null) n++; return n; };
    const unlocked = l => l <= done() + 1;
    const totalStars = () => Object.values(d.stars).reduce((a, b) => a + b, 0);

    const snd = {
      dash: () => { au.noise(.1, .06, 2400, 500); },
      stop: () => { au.tone(110, 60, .08, 'triangle', .16); au.noise(.05, .05, 900, 300, 'lowpass'); },
      dot: () => { au.tone(880 + Math.min(10, st.combo) * 40, 1100 + Math.min(10, st.combo) * 40, .05, 'square', .035); },
      coin: () => { au.tone(988, 988, .07, 'square', .06); au.tone(1318, 1318, .18, 'square', .06, .07); },
      star: () => { [523, 659, 784, 1046].forEach((f, i) => au.tone(f, f, .12, 'square', .06, i * .07)); },
      pu: () => { au.tone(400, 1200, .22, 'sawtooth', .06); },
      hit: () => { au.noise(.3, .22, 1800, 120); au.tone(260, 40, .35, 'sawtooth', .12); },
      shield: () => { au.tone(700, 200, .2, 'triangle', .1); },
      win: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => au.tone(f, f, .16, 'square', .06, i * .09)); },
      ui: () => au.tone(660, 880, .06, 'square', .05)
    };

    const burst = (px, py, n, cols, sp, life) => {
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU), v = rnd(.3, 1) * sp;
        parts.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: rnd(.5, 1) * life, m: life, c: pick(cols), s: rndi(2, 4) });
      }
    };

    const chunkAt = r => { const k = Math.floor((CH - 1 - r) / CH); return k >= 0 && wd.chunks[k] ? wd.chunks[k] : null; };
    const isOpen = (c, r) => {
      if (c < 0 || c >= C || r > CH - 1) return false;
      const k = Math.floor((CH - 1 - r) / CH);
      if (k < 0) return false;
      if (!wd.end && k >= wd.nCh) return false;
      if (!wd.chunks[k]) { if (!wd.end || k !== wd.chunks.length) return false; tmChunk(wd, k); }
      return wd.chunks[k].g[(r + k * CH) * C + c] === 1;
    };
    const itemAt = (c, r) => {
      const ch = chunkAt(r);
      if (!ch) return null;
      const i = (r + ch.k * CH) * C + c;
      return { ch, i, it: ch.items.get(i) };
    };

    function begin(l, end) {
      lv = l; endless = end;
      wd = tmWorld(l, end);
      P = { c: 5, r: CH - 1, dir: -1, t: 0, sq: 0, buf: -1, bt: 0, face: 0, inv: 0, fx: 5.5, fy: CH - .5 };
      if (api.label) api.label(end ? 'SCORE' : 'STARS');
      st = { dots: 0, coins: 0, stars: 0, score: 0, combo: 0, comboT: 0, shield: 0, magnet: 0, freeze: 0, moved: false, dead: false, won: false, t0: 0, time: 0, deadT: 0 };
      lava = CH - 1 + 9; climbed = 0; parts = []; fly = []; trail = [];
      cam = Math.min(P.r * T - H * .58, (CH + 1) * T - H + 90);
      mode = 'play'; msg = ''; cardT = 0;
      sv.d.plays++; sv.save();
    }

    function die(why) {
      if (st.dead || st.won) return;
      st.dead = true; st.deadT = 0; snd.hit(); shake = .5; flash = 1;
      const px = P.fx * T, py = P.fy * T;
      burst(px, py, 36, [TM_SKINS[d.mask].y, TM_SKINS[d.mask].d, '#ffffff', TM_SKINS[d.mask].r], 260, 1.1);
      msg = why;
      if (endless) { d.endless = Math.max(d.endless, st.score); api.submit(st.score); }
      d.coins += st.coins; sv.save();
      if (endless && st.score > 0) api.score(st.score);
    }

    function hurt(why) {
      if (st.dead || st.won || P.inv > 0) return;
      if (st.shield > 0) { st.shield = 0; P.inv = 1.4; snd.shield(); burst((P.c + .5) * T, (P.r + .5) * T, 16, ['#3b8cff', '#cfe6ff'], 200, .6); return; }
      die(why);
    }

    function win() {
      if (st.won || st.dead) return;
      st.won = true; st.deadT = 0; snd.win();
      const prev = d.stars[lv] || 0;
      d.stars[lv] = Math.max(prev, st.stars);
      d.coins += st.coins + 10; sv.save();
      burst((P.c + .5) * T, (P.r + .5) * T, 40, ['#ffe600', '#ffffff', '#ff9a1f', '#52ffa0'], 280, 1.2);
      api.score(totalStars());
      api.submit(totalStars() * 10 + Object.keys(d.stars).length);
    }

    function pick1(c, r, mag) {
      const q = itemAt(c, r);
      if (!q || !q.it) return;
      const it = q.it, px = (c + .5) * T, py = (r + .5) * T;
      if (it.t === 'sp') { if (!mag) hurt('SPIKES'); return; }
      if (it.t === 'x') { if (!mag) win(); return; }
      if (mag && (it.t === 'sh' || it.t === 'mg' || it.t === 'fz')) return;
      q.ch.items.delete(q.i);
      if (it.t === 'd') { st.dots++; st.score++; st.combo++; st.comboT = .5; snd.dot(); if (mag) fly.push({ x: px, y: py, t: 0, c: '#ffd23f' }); }
      else if (it.t === 'c') { st.coins++; snd.coin(); burst(px, py, 8, ['#ffcc1a', '#fff3a0'], 120, .5); }
      else if (it.t === 's') { st.stars++; st.score += 25; snd.star(); burst(px, py, 18, ['#ffe84a', '#ffffff'], 200, .7); }
      else if (it.t === 'sh') { st.shield = 1; snd.pu(); burst(px, py, 14, ['#3b8cff', '#cfe6ff'], 160, .6); }
      else if (it.t === 'mg') { st.magnet = 9; snd.pu(); burst(px, py, 14, ['#ff3b3b', '#e8e8ff'], 160, .6); }
      else if (it.t === 'fz') { st.freeze = 6; snd.pu(); burst(px, py, 14, ['#7ff3ff', '#ffffff'], 160, .6); }
    }

    function dash(dir) {
      if (!P || st.dead || st.won || mode !== 'play') return;
      if (P.dir >= 0) { P.buf = dir; P.bt = .35; return; }
      if (!isOpen(P.c + DX[dir], P.r + DY[dir])) { P.sq = -.5; return; }
      P.dir = dir; P.t = 0; P.sq = 0; st.moved = true; P.face = dir;
      if (!st.t0) st.t0 = 1;
      snd.dash();
    }

    function stopMove() {
      P.dir = -1; P.t = 0; P.sq = 1; snd.stop();
      burst((P.c + .5) * T, (P.r + .5) * T, 6, ['#6b5a1a', '#a89700'], 90, .4);
      shake = Math.max(shake, .08);
      if (P.buf >= 0 && P.bt > 0) { const b = P.buf; P.buf = -1; dash(b); }
    }

    function update(dt) {
      tm += dt;
      if (shake > 0) shake = Math.max(0, shake - dt);
      if (flash > 0) flash = Math.max(0, flash - dt * 2.4);
      if (mode !== 'play' || !P) {
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; });
        parts = parts.filter(p => p.l > 0);
        return;
      }
      if (st.moved && !st.dead && !st.won) st.time += dt;
      if (st.comboT > 0) { st.comboT -= dt; if (st.comboT <= 0) st.combo = 0; }
      if (P.inv > 0) P.inv -= dt;
      if (P.bt > 0) P.bt -= dt;
      if (P.sq !== 0) P.sq += (0 - P.sq) * Math.min(1, dt * 14);
      ['magnet', 'freeze'].forEach(k => { if (st[k] > 0) st[k] = Math.max(0, st[k] - dt); });
      const live = !st.dead && !st.won;
      if (live) {
        let m = 17 * dt;
        while (m > 0 && P.dir >= 0) {
          const rem = 1 - P.t;
          if (m < rem) { P.t += m; m = 0; break; }
          m -= rem; P.t = 0; P.c += DX[P.dir]; P.r += DY[P.dir];
          pick1(P.c, P.r, false);
          climbed = Math.max(climbed, CH - 1 - P.r);
          if (st.dead || st.won) break;
          if (!isOpen(P.c + DX[P.dir], P.r + DY[P.dir])) { stopMove(); break; }
        }
        const fx = P.c + .5 + (P.dir >= 0 ? DX[P.dir] * P.t : 0), fy = P.r + .5 + (P.dir >= 0 ? DY[P.dir] * P.t : 0);
        P.fx = fx; P.fy = fy;
        if (st.magnet > 0) {
          const rr = 3;
          for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) if (i * i + j * j <= rr * rr + 1) pick1(P.c + i, P.r + j, true);
        }
        const fr = st.freeze > 0 ? 0 : 1;
        for (const b of wd.bats) {
          if (fr) {
            b.pos += b.s * b.v * dt;
            if (b.pos < b.a) { b.pos = b.a; b.s = 1; } else if (b.pos > b.b) { b.pos = b.b; b.s = -1; }
          }
          const bx = b.ver ? b.c + .5 : b.pos + .5, by = b.ver ? b.pos + .5 : b.r + .5;
          if (Math.abs(by - fy) < 2 && Math.hypot(bx - fx, by - fy) < .62) hurt('BAT');
        }
        for (const f of wd.fish) {
          if (fr) f.ph = (f.ph + dt) % 3.2;
          if (f.ph > 2.5 && Math.hypot(f.c + .5 - fx, f.r + .5 - fy) < 1.18) hurt('PUFFER FISH');
        }
        if (endless) {
          const up = Math.max(0, climbed - 4);
          lava -= (.62 + Math.min(1.5, up * .006)) * dt * (st.freeze > 0 ? 0 : 1);
          lava = Math.min(lava, P.r + 11);
          if (fy + .35 > lava) die('LAVA');
          const cc = Math.floor((CH - 1 - P.r) / CH);
          if (wd.chunks.length < cc + 3) tmChunk(wd, wd.chunks.length);
          st.score = Math.max(st.score, climbed + st.dots);
          api.score(st.score);
        } else api.score(st.stars);
      } else st.deadT += dt;
      const ty = (P.fy != null ? P.fy : P.r + .5) * T - H * .56;
      cam += (ty - cam) * Math.min(1, dt * 7);
      cam = Math.min(cam, (CH + 1) * T - H + 90);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; });
      parts = parts.filter(p => p.l > 0);
      fly.forEach(f => { f.t += dt * 4; });
      fly = fly.filter(f => f.t < 1);
      if (live && P.dir >= 0 && Math.random() < .5) parts.push({ x: P.fx * T + rnd(-6, 6), y: P.fy * T + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-20, 20), l: .3, m: .3, c: TM_SKINS[d.mask].y, s: 3 });
      if (st.dead && st.deadT > .9 && cardT <= 0) { mode = 'over'; cardT = .001; }
      if (st.won && st.deadT > .8 && cardT <= 0) { mode = 'win'; cardT = .001; }
    }

    const wallC = () => (wd ? wd.chunks[0].pal.wall : '#100c03');

    function pbtn(bx, by, bw, bh, label, fn, o = {}) {
      const over = hover.x >= bx && hover.x <= bx + bw && hover.y >= by && hover.y <= bh + by;
      const col = o.col || '#ffe600', dk = o.dk || '#8a6a00', txt = o.txt || '#1a1200', s = o.s || Math.max(3, Math.min(5, Math.floor(bh / 11)));
      const off = over ? 1 : 3;
      x.fillStyle = dk; x.fillRect(bx, by + 4, bw, bh);
      x.fillStyle = over ? mix(col, '#ffffff', .25) : col;
      x.fillRect(bx, by + 4 - off, bw, bh);
      x.fillStyle = '#000000'; x.globalAlpha = .18;
      x.fillRect(bx, by + 4 - off + bh - 4, bw, 4);
      x.globalAlpha = 1;
      ptext(x, label, bx + bw / 2, by + 4 - off + (bh - 5 * s) / 2, s, txt, 'c');
      ui.add(bx, by, bw, bh + 4, () => { snd.ui(); fn(); });
    }

    function drawMaskAt(px, py, sc = 3, sqv = 0, skin = d.mask, alpha = 1) {
      const s = maskSpr(skin), w = 12 * sc, h = 12 * sc;
      const sx2 = 1 + sqv * .22, sy2 = 1 - sqv * .26;
      x.save(); x.globalAlpha = alpha; x.imageSmoothingEnabled = false;
      x.translate(px, py + h / 2); x.scale(sx2, sy2);
      x.drawImage(s, -w / 2, -h, w, h);
      x.restore();
    }

    function drawWorld() {
      x.fillStyle = wallC(); x.fillRect(0, 0, W, H);
      let ox = 0, oy = 0;
      if (shake > 0) { ox = rnd(-1, 1) * shake * 14; oy = rnd(-1, 1) * shake * 14; }
      x.save(); x.translate(ox, oy);
      x.imageSmoothingEnabled = false;
      const r0 = Math.floor(cam / T) - 1, r1 = Math.ceil((cam + H) / T) + 1;
      for (const ch of wd.chunks) {
        if (!ch) continue;
        const top = -ch.k * CH * T - cam;
        if (top > H || top + CH * T < 0) continue;
        x.drawImage(ch.art, 0, Math.round(top - ch.mt * T), C * T, (CH + ch.mt + ch.mb) * T);
        if (ch.water) { x.fillStyle = 'rgba(40,110,255,.08)'; x.fillRect(0, top, C * T, CH * T); }
      }
      const pal = wd.chunks[0].pal;
      for (const ch of wd.chunks) {
        if (!ch) continue;
        const top = -ch.k * CH * T - cam;
        if (top > H || top + CH * T < 0) continue;
        for (const [i, it] of ch.items) {
          const cx2 = i % C, cy2 = (i / C) | 0, r = cy2 - ch.k * CH;
          if (r < r0 || r > r1) continue;
          const px = (cx2 + .5) * T, py = (r + .5) * T - cam;
          if (it.t === 'd') { x.fillStyle = ch.pal.dot; x.fillRect(Math.round(px - 2), Math.round(py - 2), 4, 4); }
          else if (it.t === 'c') {
            const sc = Math.abs(Math.cos(tm * 4 + cx2));
            x.drawImage(TM_SP.coin, px - 14 * sc, py - 14 + Math.sin(tm * 3 + cx2) * 2, 28 * sc, 28);
          } else if (it.t === 's') {
            const pl = 1 + Math.sin(tm * 5) * .1;
            x.fillStyle = 'rgba(255,232,74,.22)'; x.beginPath(); x.arc(px, py, 22 * pl, 0, TAU); x.fill();
            x.drawImage(TM_SP.star, px - 17 * pl, py - 18 * pl, 34 * pl, 36 * pl);
          } else if (it.t === 'sh' || it.t === 'mg' || it.t === 'fz') {
            const col = it.t === 'sh' ? '59,140,255' : it.t === 'mg' ? '255,59,59' : '127,243,255';
            const by = py + Math.sin(tm * 3 + cx2) * 3;
            x.fillStyle = `rgba(${col},.25)`; x.beginPath(); x.arc(px, by, 20, 0, TAU); x.fill();
            x.strokeStyle = `rgba(${col},.9)`; x.lineWidth = 2; x.beginPath(); x.arc(px, by, 20, 0, TAU); x.stroke();
            const sp = TM_SP[it.t];
            x.drawImage(sp, px - sp.width * 1.5, by - sp.height * 1.5, sp.width * 3, sp.height * 3);
          } else if (it.t === 'sp') {
            x.save(); x.translate(px, py); x.rotate((it.o - 2) * Math.PI / 2);
            x.drawImage(TM_SP.spike, -18, 20 - 24, 36, 24);
            x.restore();
          } else if (it.t === 'x') {
            const pl = .5 + .5 * Math.sin(tm * 4);
            const gr = x.createRadialGradient(px, py, 2, px, py, 34);
            gr.addColorStop(0, `rgba(${pal.glow},${.55 + pl * .3})`); gr.addColorStop(1, `rgba(${pal.glow},0)`);
            x.fillStyle = gr; x.fillRect(px - 36, py - 36, 72, 72);
            x.strokeStyle = pal.e1; x.lineWidth = 4;
            x.beginPath(); x.arc(px, py, 12 + pl * 4, 0, TAU); x.stroke();
            x.beginPath(); x.arc(px, py, 5, 0, TAU); x.fillStyle = '#ffffff'; x.fill();
          }
        }
      }
      const frz = st && st.freeze > 0;
      for (const b of wd.bats) {
        const bx = (b.ver ? b.c + .5 : b.pos + .5) * T, by = (b.ver ? b.pos + .5 : b.r + .5) * T - cam;
        if (by < -30 || by > H + 30) continue;
        const sp = Math.floor(tm * 10 + b.ph) % 2 ? TM_SP.batA : TM_SP.batB;
        x.drawImage(sp, bx - 22, by - 12, 44, 24);
        if (frz) { x.fillStyle = 'rgba(127,243,255,.45)'; x.fillRect(bx - 22, by - 12, 44, 24); }
      }
      for (const f of wd.fish) {
        const fx = (f.c + .5) * T, fy = (f.r + .5) * T - cam;
        if (fy < -60 || fy > H + 60) continue;
        const ph = f.ph, big = ph < 2.2 ? 0 : ph < 2.5 ? (ph - 2.2) / .3 : 1;
        const rad = 9 + big * 13, sp = 7 + big * 9, nsp = 12;
        x.fillStyle = '#f0a020';
        for (let i = 0; i < nsp; i++) {
          const a = i / nsp * TAU + tm * .3;
          x.save(); x.translate(fx, fy); x.rotate(a);
          x.beginPath(); x.moveTo(rad - 2, -3); x.lineTo(rad + sp * (.4 + big * .9), 0); x.lineTo(rad - 2, 3); x.closePath();
          x.fillStyle = big > .6 ? '#ff5a3c' : '#c78018'; x.fill();
          x.restore();
        }
        x.beginPath(); x.arc(fx, fy, rad, 0, TAU);
        x.fillStyle = big > .6 ? '#ffb347' : '#f0a020'; x.fill();
        x.lineWidth = 2; x.strokeStyle = '#7a4a05'; x.stroke();
        x.fillStyle = '#fff'; x.beginPath(); x.arc(fx + rad * .3, fy - rad * .2, 3.4, 0, TAU); x.fill();
        x.fillStyle = '#111'; x.beginPath(); x.arc(fx + rad * .35, fy - rad * .2, 1.6, 0, TAU); x.fill();
        if (frz) { x.fillStyle = 'rgba(127,243,255,.45)'; x.beginPath(); x.arc(fx, fy, rad + sp * .4, 0, TAU); x.fill(); }
      }
      for (const f of fly) {
        const e = f.t, px = lerp(f.x, P.fx * T, e), py = lerp(f.y, P.fy * T, e) - cam;
        x.fillStyle = f.c; x.fillRect(px - 2, py - 2, 4, 4);
      }
      if (P && P.dir >= 0 && !st.dead) {
        for (let i = 1; i <= 4; i++) {
          const tx = (P.fx - DX[P.dir] * i * .42) * T, ty = (P.fy - DY[P.dir] * i * .42) * T - cam;
          drawMaskAt(tx, ty, 3, 0, d.mask, .3 - i * .06);
        }
      }
      for (const p of parts) {
        x.globalAlpha = clamp(p.l / (p.m || 1), 0, 1);
        x.fillStyle = p.c; x.fillRect(Math.round(p.x - p.s / 2), Math.round(p.y - cam - p.s / 2), p.s, p.s);
      }
      x.globalAlpha = 1;
      if (P && !st.dead) {
        const px = P.fx * T, py = P.fy * T - cam;
        if (P.inv > 0 && Math.floor(tm * 20) % 2) x.globalAlpha = .4;
        if (st.shield > 0) {
          x.strokeStyle = 'rgba(80,160,255,.9)'; x.lineWidth = 3; x.fillStyle = 'rgba(80,160,255,.18)';
          x.beginPath(); x.arc(px, py, 26 + Math.sin(tm * 6) * 1.5, 0, TAU); x.fill(); x.stroke();
        }
        if (st.magnet > 0) {
          x.strokeStyle = `rgba(255,70,70,${.25 + .2 * Math.sin(tm * 8)})`; x.lineWidth = 2;
          x.beginPath(); x.arc(px, py, 3 * T, 0, TAU); x.stroke();
        }
        drawMaskAt(px, py + Math.sin(tm * 6) * (P.dir < 0 ? 1 : 0), 3, P.sq);
        x.globalAlpha = 1;
      }
      if (endless && st) {
        const ly = lava * T - cam;
        if (ly < H + 40) {
          const g = x.createLinearGradient(0, ly - 30, 0, ly + 60);
          g.addColorStop(0, 'rgba(255,140,30,0)'); g.addColorStop(.28, 'rgba(255,120,20,.55)'); g.addColorStop(.4, '#ff9a1f'); g.addColorStop(1, '#e02200');
          x.fillStyle = g;
          x.beginPath(); x.moveTo(0, H + 10); x.lineTo(0, ly);
          for (let i = 0; i <= 44; i++) x.lineTo(i * 10, ly + Math.sin(i * .9 + tm * 3) * 4 + Math.sin(i * .35 - tm * 2) * 3);
          x.lineTo(W, H + 10); x.closePath(); x.fill();
          for (let i = 0; i < 14; i++) {
            const bx = (i * 83 + 20) % W, by = ly + 14 + ((tm * 22 + i * 37) % 60);
            if (by > H) continue;
            x.fillStyle = 'rgba(255,220,100,.6)'; x.fillRect(Math.round(bx), Math.round(by), 5, 5);
          }
        }
      }
      x.restore();
      if (frz) { x.fillStyle = 'rgba(127,243,255,.1)'; x.fillRect(0, 0, W, H); }
      if (flash > 0) { x.fillStyle = `rgba(255,255,255,${flash * .5})`; x.fillRect(0, 0, W, H); }
    }

    function drawHud() {
      x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, 44);
      x.imageSmoothingEnabled = false;
      x.drawImage(TM_SP.coin, 10, 9, 24, 24);
      ptext(x, fmtN(d.coins + st.coins), 40, 14, 3, '#ffcc1a', 'l');
      if (endless) {
        ptext(x, st.score, W / 2, 10, 5, '#ffffff', 'c', '#000');
        ptext(x, 'BEST ' + Math.max(d.endless, st.score), W / 2, 34, 1, '#a89700', 'c');
      } else {
        ptext(x, 'LEVEL ' + lv, W / 2, 10, 3, '#ffffff', 'c');
        ptext(x, st.dots + '/' + wd.total, W / 2, 30, 1, '#a89700', 'c');
        for (let i = 0; i < 3; i++) {
          x.globalAlpha = i < st.stars ? 1 : .3;
          x.drawImage(TM_SP.star, W - 150 + i * 30, 6, 26, 28);
        }
        x.globalAlpha = 1;
      }
      pbtn(W - 40, 4, 34, 28, 'II', pauseKey, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
      let yy = 52;
      [['sh', st.shield > 0 ? 1 : 0, 1, '59,140,255'], ['mg', st.magnet / 9, st.magnet > 0, '255,59,59'], ['fz', st.freeze / 6, st.freeze > 0, '127,243,255']].forEach(([k, fr, on, col]) => {
        if (!on) return;
        const sp = TM_SP[k];
        x.drawImage(sp, 10, yy, sp.width * 2, sp.height * 2);
        x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(40, yy + 8, 70, 6);
        x.fillStyle = `rgb(${col})`; x.fillRect(40, yy + 8, 70 * (k === 'sh' ? 1 : fr), 6);
        yy += 28;
      });
      if (!st.moved && !st.dead) {
        const a = .6 + .4 * Math.sin(tm * 4);
        x.globalAlpha = a;
        ptext(x, endless ? 'CLIMB! LAVA IS RISING' : 'SWIPE OR ARROWS TO DASH', W / 2, H - 70, 3, '#ffffff', 'c', '#000');
        ptext(x, 'COLLECT DOTS AND STARS', W / 2, H - 46, 2, '#ffe600', 'c', '#000');
        x.globalAlpha = 1;
      }
      if (st.combo > 6) ptext(x, 'x' + st.combo, W - 12, 62, 3, '#ffe600', 'r');
    }

    function card(h, title, lines, btns) {
      const cx = W / 2, cw = 340, y0 = (H - h) / 2 - 20;
      const e = ease(clamp(cardT * 4, 0, 1));
      x.fillStyle = `rgba(0,0,0,${.7 * e})`; x.fillRect(0, 0, W, H);
      x.save(); x.translate(0, (1 - e) * 40); x.globalAlpha = e;
      x.fillStyle = '#0a0802'; x.fillRect(cx - cw / 2, y0, cw, h);
      x.strokeStyle = '#ffe600'; x.lineWidth = 4; x.strokeRect(cx - cw / 2 + 2, y0 + 2, cw - 4, h - 4);
      ptext(x, title, cx, y0 + 24, 5, '#ffe600', 'c', '#8a6a00');
      lines(cx, y0 + 80);
      btns(cx, y0 + h - 70);
      x.restore();
    }

    function drawOver() {
      cardT += 1 / 60;
      const h = endless ? 400 : 380;
      card(h, 'GAME OVER', (cx, y) => {
        ptext(x, msg, cx, y, 3, '#ff6a4a', 'c');
        if (endless) {
          ptext(x, 'SCORE', cx, y + 34, 2, '#a89700', 'c');
          ptext(x, st.score, cx, y + 54, 7, '#ffffff', 'c', '#000');
          ptext(x, 'BEST ' + d.endless, cx, y + 106, 3, '#ffe600', 'c');
          x.drawImage(TM_SP.coin, cx - 40, y + 140, 24, 24);
          ptext(x, '+' + st.coins, cx - 8, y + 144, 3, '#ffcc1a', 'l');
        } else {
          ptext(x, 'DOTS ' + st.dots + '/' + wd.total, cx, y + 36, 3, '#ffffff', 'c');
          for (let i = 0; i < 3; i++) { x.globalAlpha = i < st.stars ? 1 : .25; x.drawImage(TM_SP.star, cx - 66 + i * 46, y + 68, 40, 44); }
          x.globalAlpha = 1;
          x.drawImage(TM_SP.coin, cx - 40, y + 130, 24, 24);
          ptext(x, '+' + st.coins, cx - 8, y + 134, 3, '#ffcc1a', 'l');
        }
      }, (cx, by) => {
        pbtn(cx - 140, by - 10, 130, 52, 'RETRY', () => begin(lv, endless));
        pbtn(cx + 10, by - 10, 130, 52, 'MENU', () => { mode = 'menu'; }, { col: '#3a3300', dk: '#171400', txt: '#ffe600' });
      });
    }

    function drawWin() {
      cardT += 1 / 60;
      const nx = lv < TM_LV;
      card(470, 'LEVEL ' + lv, (cx, y) => {
        ptext(x, 'COMPLETE', cx, y - 6, 4, '#ffffff', 'c');
        for (let i = 0; i < 3; i++) {
          const on = i < st.stars, k = clamp((cardT * 2 - i * .35), 0, 1), sc = on ? ease(k) : 1;
          x.globalAlpha = on ? k : .25;
          x.drawImage(TM_SP.star, cx - 66 + i * 46 + 20 - 20 * sc, y + 36 + 22 - 22 * sc, 40 * sc, 44 * sc);
        }
        x.globalAlpha = 1;
        ptext(x, 'DOTS ' + st.dots + '/' + wd.total, cx, y + 100, 3, '#ffffff', 'c');
        x.drawImage(TM_SP.coin, cx - 56, y + 134, 24, 24);
        ptext(x, '+' + (st.coins + 10), cx - 24, y + 138, 3, '#ffcc1a', 'l');
        ptext(x, 'TIME ' + st.time.toFixed(1) + 'S', cx, y + 176, 2, '#a89700', 'c');
      }, (cx, by) => {
        if (nx) pbtn(cx - 140, by - 34, 280, 52, 'NEXT LEVEL', () => begin(lv + 1, false));
        pbtn(cx - 140, by + 24, 130, 40, 'RETRY', () => begin(lv, false), { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
        pbtn(cx + 10, by + 24, 130, 40, 'LEVELS', () => { mode = 'levels'; page = Math.floor((lv - 1) / 20); }, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
      });
    }

    function backdropDraw() {
      if (!backdrop) {
        const wdx = { lv: 1, end: false, chunks: [], nCh: 3, rng: mulberry(4242), bats: [], fish: [], total: 0 };
        tmChunk(wdx, 0); tmChunk(wdx, 1);
        backdrop = wdx.chunks[1].art;
      }
      x.fillStyle = '#100c03'; x.fillRect(0, 0, W, H);
      x.imageSmoothingEnabled = false;
      x.globalAlpha = .5;
      const off = (tm * 24) % (CH * T);
      x.drawImage(backdrop, 0, Math.round(off - CH * T), C * T, CH * T);
      x.drawImage(backdrop, 0, Math.round(off), C * T, CH * T);
      x.drawImage(backdrop, 0, Math.round(off + CH * T), C * T, CH * T);
      x.globalAlpha = 1;
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(.5, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,.75)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }

    function drawMenu() {
      backdropDraw();
      const bob = Math.sin(tm * 2.4) * 6;
      ptext(x, 'TOMB OF', W / 2, 74, 9, '#ffe600', 'c', '#a64a00');
      ptext(x, 'THE MASK', W / 2, 150, 9, '#ffe600', 'c', '#a64a00');
      drawMaskAt(W / 2, 290 + bob, 9, Math.sin(tm * 2.4) * .12);
      x.drawImage(TM_SP.coin, 14, 12, 24, 24);
      ptext(x, fmtN(d.coins), 44, 17, 3, '#ffcc1a', 'l');
      x.drawImage(TM_SP.star, W - 90, 10, 24, 26);
      ptext(x, totalStars(), W - 60, 17, 3, '#ffe600', 'l');
      const nxt = Math.min(TM_LV, done() + 1);
      pbtn(W / 2 - 150, 440, 300, 62, done() ? 'PLAY ' + nxt : 'PLAY', () => begin(nxt, false), { s: 6 });
      pbtn(W / 2 - 150, 518, 144, 50, 'LEVELS', () => { mode = 'levels'; page = Math.floor((nxt - 1) / 20); }, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
      pbtn(W / 2 + 6, 518, 144, 50, 'MASKS', () => { mode = 'shop'; }, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
      pbtn(W / 2 - 150, 584, 300, 50, 'ENDLESS ' + (d.endless || ''), () => begin(1, true), { col: '#ff6a1a', dk: '#7a2a00', txt: '#1a0800', s: 3 });
      ptext(x, 'SWIPE OR ARROWS TO DASH', W / 2, 666, 2, '#a89700', 'c');
    }

    function drawLevels() {
      backdropDraw();
      ptext(x, 'LEVELS', W / 2, 24, 6, '#ffe600', 'c', '#a64a00');
      x.drawImage(TM_SP.star, W - 100, 30, 20, 22);
      ptext(x, totalStars() + '/' + TM_LV * 3, W - 74, 34, 2, '#ffe600', 'l');
      const per = 20, pages = Math.ceil(TM_LV / per), cw = 74, gap = 10, x0 = (W - (4 * cw + 3 * gap)) / 2, y0 = 90;
      for (let i = 0; i < per; i++) {
        const l = page * per + i + 1;
        if (l > TM_LV) break;
        const col = i % 4, row = Math.floor(i / 4), bx = x0 + col * (cw + gap), by = y0 + row * (cw + gap + 22);
        const ok = unlocked(l), sc = d.stars[l];
        const over = hover.x >= bx && hover.x <= bx + cw && hover.y >= by && hover.y <= by + cw + 20;
        x.fillStyle = ok ? (sc != null ? '#ffe600' : '#a89700') : '#2a2410';
        x.fillRect(bx, by + 4, cw, cw); x.fillStyle = ok ? (over ? '#fff39a' : sc != null ? '#ffd21f' : '#6b5d00') : '#171408';
        x.fillRect(bx, by, cw, cw);
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(bx, by + cw - 5, cw, 5);
        if (ok) ptext(x, l, bx + cw / 2, by + 20, l > 9 ? 5 : 6, sc != null ? '#1a1200' : '#ffe600', 'c');
        else { x.fillStyle = '#4a4220'; x.fillRect(bx + cw / 2 - 12, by + cw / 2 - 4, 24, 20); x.strokeStyle = '#4a4220'; x.lineWidth = 4; x.beginPath(); x.arc(bx + cw / 2, by + cw / 2 - 4, 8, Math.PI, TAU); x.stroke(); }
        for (let s = 0; s < 3; s++) { x.globalAlpha = sc != null && s < sc ? 1 : .22; x.drawImage(TM_SP.star, bx + cw / 2 - 30 + s * 21, by + cw + 3, 18, 20); }
        x.globalAlpha = 1;
        if (ok) ui.add(bx, by, cw, cw + 22, () => { snd.ui(); begin(l, false); });
      }
      pbtn(20, H - 70, 110, 46, 'BACK', () => { mode = 'menu'; }, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
      if (pages > 1) {
        pbtn(W - 130, H - 70, 110, 46, page + 1 < pages ? 'NEXT >' : '< PREV', () => { page = (page + 1) % pages; }, { s: 3 });
        ptext(x, (page + 1) + '/' + pages, W / 2, H - 56, 3, '#a89700', 'c');
      }
    }

    function drawShop() {
      backdropDraw();
      ptext(x, 'MASKS', W / 2, 24, 6, '#ffe600', 'c', '#a64a00');
      x.drawImage(TM_SP.coin, W / 2 - 50, 76, 24, 24);
      ptext(x, fmtN(d.coins), W / 2 - 20, 81, 3, '#ffcc1a', 'l');
      const cw = 126, ch = 170, gap = 14, x0 = (W - (3 * cw + 2 * gap)) / 2;
      TM_SKINS.forEach((sk, i) => {
        const bx = x0 + (i % 3) * (cw + gap), by = 124 + Math.floor(i / 3) * (ch + gap), own = d.owned.includes(i), eq = d.mask === i;
        x.fillStyle = eq ? '#ffe600' : '#2a2410'; x.fillRect(bx - 3, by - 3, cw + 6, ch + 6);
        x.fillStyle = '#0a0802'; x.fillRect(bx, by, cw, ch);
        drawMaskAt(bx + cw / 2, by + 48 + Math.sin(tm * 3 + i) * 3, 5, 0, i);
        ptext(x, sk.n, bx + cw / 2, by + 100, 2, '#ffffff', 'c');
        const lab = eq ? 'EQUIPPED' : own ? 'EQUIP' : String(sk.p), can = own || d.coins >= sk.p;
        pbtn(bx + 10, by + 120, cw - 20, 38, lab, () => {
          if (own) d.mask = i;
          else if (d.coins >= sk.p) { d.coins -= sk.p; d.owned.push(i); d.mask = i; }
          sv.save();
        }, { col: eq ? '#52ffa0' : can ? '#ffe600' : '#4a4220', dk: eq ? '#1a7a48' : can ? '#8a6a00' : '#2a2410', txt: '#1a1200', s: 2 });
      });
      pbtn(20, H - 70, 110, 46, 'BACK', () => { mode = 'menu'; }, { col: '#3a3300', dk: '#171400', txt: '#ffe600', s: 3 });
    }

    function draw() {
      ui.begin();
      if (mode === 'menu') drawMenu();
      else if (mode === 'levels') drawLevels();
      else if (mode === 'shop') drawShop();
      else {
        drawWorld(); drawHud();
        if (mode === 'over') drawOver();
        if (mode === 'win') drawWin();
      }
    }

    const KEYD = { ArrowUp: 0, KeyW: 0, ArrowRight: 1, KeyD: 1, ArrowDown: 2, KeyS: 2, ArrowLeft: 3, KeyA: 3 };
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = e.code;
      if (k in KEYD) { if (mode === 'play') { dash(KEYD[k]); e.preventDefault(); } return; }
      if (k === 'Space' || k === 'Enter') {
        if (e.repeat) return;
        if (mode === 'menu') { begin(Math.min(TM_LV, done() + 1), false); e.preventDefault(); }
        else if (mode === 'over') { begin(lv, endless); e.preventDefault(); }
        else if (mode === 'win') { begin(Math.min(TM_LV, lv + 1), false); e.preventDefault(); }
      } else if (k === 'KeyR' && mode === 'play') begin(lv, endless);
      else if (k === 'KeyM' && mode !== 'menu' && mode !== 'play') mode = 'menu';
    });
    pointers(api, view, {
      down(p) { hover.x = p.x; hover.y = p.y; if (mode !== 'play' || p.y < 40 && p.x > W - 50) { ui.hit(p.x, p.y); p.ui = true; } },
      move(p) {
        hover.x = p.x; hover.y = p.y;
        if (mode !== 'play' || !p.id || p.ui || p.fired) return;
        const dx = p.x - p.sx, dy = p.y - p.sy;
        if (Math.hypot(dx, dy) > 22) { p.fired = true; dash(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); }
      },
    });
    api.on(cv, 'pointerleave', () => { hover.x = -1; hover.y = -1; });
    api.loop(dt => { update(dt); draw(); });
    api.score(0);
  }

  Ameplay.register({
    id: 'tomb-of-the-mask',
    title: 'Tomb of the Mask',
    category: 'Arcade',
    tint: '#ffd21f',
    blurb: 'Dash through neon pixel tombs. Swipe to slide until you hit a wall, grab the dots and stars, and outrun the rising lava.',
    help: '<kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> / <kbd>WASD</kbd> or swipe to dash',
    better: 'high',
    width: 520,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="42" rx="6"/><path d="M14 22h36"/><rect x="21" y="29" width="8" height="6"/><rect x="35" y="29" width="8" height="6"/><path d="M24 43h16"/></svg>',
    css: `.gm-tomb-of-the-mask .g-canvas{background:#100c03;image-rendering:pixelated;border-radius:6px;cursor:pointer}`,
    mount: mountTomb
  });

  const CS_COL = ['#32DBF0', '#FAE100', '#900DFF', '#FF0181'];
  const CS_BG = '#282828';
  const CS_W = 360, CS_H = 640;
  const csShuffle = () => { const a = [0, 1, 2, 3]; for (let i = 3; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const csNrm = a => { a %= TAU; return a < 0 ? a + TAU : a; };
  const csSeg = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    const t = l2 ? clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1) : 0;
    return Math.hypot(px - x1 - dx * t, py - y1 - dy * t);
  };

  const CS_TYPES = {
    ring: { min: 0, w: 3, mk(o) { const R = rnd(66, 80); o.R = R; o.h = 2 * R + 14; o.perm = csShuffle(); o.sp = rnd(1.3, 1.9) * o.dir; } },
    bars: { min: 1, w: 2, mk(o) { o.h = 30; o.perm = csShuffle(); o.sp = rnd(80, 120) * o.dir; o.so = -62; o.bw = 18; } },
    square: { min: 3, w: 3, mk(o) { o.s = rnd(52, 62); o.h = o.s * 2.84 + 14; o.perm = csShuffle(); o.sp = rnd(1.1, 1.6) * o.dir; } },
    twin: { min: 5, w: 2, mk(o) { o.R = 46; o.h = 104; o.perm = csShuffle(); o.perm2 = csShuffle(); o.sp = rnd(1.4, 2) * o.dir; o.sx = Math.random() < .5 ? -1 : 1; } },
    cross: { min: 6, w: 2, mk(o) { o.L = rnd(74, 84); o.h = o.L * 2 + 14; o.perm = csShuffle(); o.sp = rnd(1.3, 1.9) * o.dir; } },
    ring2: { min: 9, w: 3, mk(o) { o.R = 84; o.h = 2 * o.R + 14; o.perm = csShuffle(); o.perm2 = csShuffle(); o.sp = rnd(1.3, 1.8) * o.dir; } },
    orbit: { min: 12, w: 2, mk(o) { o.R = 68; o.h = 2 * o.R + 20; o.perm = csShuffle(); o.sp = rnd(1.5, 2.1) * o.dir; } },
    bars2: { min: 14, w: 2, mk(o) { o.h = 100; o.perm = csShuffle(); o.perm2 = csShuffle(); o.sp = rnd(90, 130) * o.dir; o.so = 0; o.bw = 18; } },
    square2: { min: 18, w: 2, mk(o) { o.s = 70; o.h = o.s * 2.84 + 14; o.perm = csShuffle(); o.perm2 = csShuffle(); o.sp = rnd(1.1, 1.5) * o.dir; } },
    ring3: { min: 24, w: 2, mk(o) { o.R = 90; o.h = 2 * o.R + 14; o.perm = csShuffle(); o.perm2 = csShuffle(); o.perm3 = csShuffle(); o.sp = rnd(1.3, 1.7) * o.dir; } },
    cross2: { min: 30, w: 2, mk(o) { o.L = 56; o.h = o.L * 2 + 14; o.perm = csShuffle(); o.perm2 = csShuffle(); o.sp = rnd(1.3, 1.8) * o.dir; o.sx = Math.random() < .5 ? -1 : 1; } }
  };

  function csRingHit(o, cx, cy, R, w, rot, perm, b) {
    const dd = Math.hypot(b.x - cx, b.y - cy);
    if (Math.abs(dd - R) > w / 2 + b.r * .86) return false;
    const a = Math.atan2(b.y - cy, b.x - cx) - rot, sp = Math.min(.6, b.r * .8 / R);
    for (const k of [-sp, 0, sp]) if (perm[Math.floor(csNrm(a + k) / (TAU / 4)) & 3] !== b.c) return true;
    return false;
  }
  function csRingDraw(x, cx, cy, R, w, rot, perm) {
    x.lineWidth = w; x.lineCap = 'butt';
    for (let s = 0; s < 4; s++) {
      x.strokeStyle = CS_COL[perm[s]];
      x.beginPath(); x.arc(cx, cy, R, rot + s * TAU / 4, rot + (s + 1) * TAU / 4 + .004); x.stroke();
    }
  }
  function csSquareSides(cx, cy, s, rot) {
    const out = [], c = Math.cos(rot), n = Math.sin(rot);
    const P = [[-s, -s], [s, -s], [s, s], [-s, s]].map(([a, b]) => [cx + a * c - b * n, cy + a * n + b * c]);
    for (let i = 0; i < 4; i++) out.push([P[i], P[(i + 1) % 4]]);
    return out;
  }
  function csSquareHit(o, cx, cy, s, w, rot, perm, b) {
    const sides = csSquareSides(cx, cy, s, rot);
    for (let i = 0; i < 4; i++) {
      const [p, q] = sides[i];
      if (perm[i] !== b.c && csSeg(b.x, b.y, p[0], p[1], q[0], q[1]) < w / 2 + b.r * .86) return true;
    }
    return false;
  }
  function csSquareDraw(x, cx, cy, s, w, rot, perm) {
    const h = w / 2, c = Math.cos(rot), n = Math.sin(rot), tr = (a, b) => [cx + a * c - b * n, cy + a * n + b * c];
    const sides = [
      [[-s - h, -s - h], [s + h, -s - h], [s - h, -s + h], [-s + h, -s + h]],
      [[s + h, -s - h], [s + h, s + h], [s - h, s - h], [s - h, -s + h]],
      [[s + h, s + h], [-s - h, s + h], [-s + h, s - h], [s - h, s - h]],
      [[-s - h, s + h], [-s - h, -s - h], [-s + h, -s + h], [-s + h, s - h]]
    ];
    for (let i = 0; i < 4; i++) {
      x.fillStyle = CS_COL[perm[i]];
      x.beginPath();
      sides[i].forEach(([a, b], k) => { const p = tr(a, b); k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); });
      x.closePath(); x.fill();
    }
  }
  function csCrossHit(cx, cy, L, w, rot, perm, b) {
    for (let i = 0; i < 4; i++) {
      const a = rot + i * TAU / 4, c = Math.cos(a), n = Math.sin(a);
      if (perm[i] !== b.c && csSeg(b.x, b.y, cx + c * 24, cy + n * 24, cx + c * L, cy + n * L) < w / 2 + b.r * .86) return true;
    }
    return false;
  }
  function csCrossDraw(x, cx, cy, L, w, rot, perm) {
    x.lineWidth = w; x.lineCap = 'butt';
    for (let i = 0; i < 4; i++) {
      const a = rot + i * TAU / 4, c = Math.cos(a), n = Math.sin(a);
      x.strokeStyle = CS_COL[perm[i]];
      x.beginPath(); x.moveTo(cx + c * 24, cy + n * 24); x.lineTo(cx + c * L, cy + n * L); x.stroke();
    }
  }
  function csBarCol(px, off, perm, seg) { return perm[((Math.floor((px - off) / seg) % 4) + 4) % 4]; }
  function csBarHit(o, cy, bw, off, perm, b) {
    if (Math.abs(b.y - cy) > bw / 2 + b.r * .86) return false;
    for (const k of [-b.r * .8, 0, b.r * .8]) if (csBarCol(b.x + k, off, perm, 90) !== b.c) return true;
    return false;
  }
  function csBarDraw(x, cy, bw, off, perm) {
    const seg = 90, i0 = Math.floor((-off) / seg) - 1;
    for (let i = i0; i < i0 + 7; i++) {
      const px = off + i * seg;
      x.fillStyle = CS_COL[perm[((i % 4) + 4) % 4]];
      x.fillRect(px, cy - bw / 2, seg + .5, bw);
    }
  }

  function csObstacle(type, y, speed) {
    const o = { type, y, a: Math.random() * TAU, off: 0, dir: Math.random() < .5 ? -1 : 1, so: 0 };
    CS_TYPES[type].mk(o);
    o.sp *= speed;
    const cx = CS_W / 2;
    o.step = dt => { o.a += o.sp * dt; o.off += o.sp * dt; };
    o.hit = b => {
      const y0 = o.y;
      switch (type) {
        case 'ring': return csRingHit(o, cx, y0, o.R, 14, o.a, o.perm, b);
        case 'ring2': return csRingHit(o, cx, y0, o.R, 13, o.a, o.perm, b) || csRingHit(o, cx, y0, o.R - 24, 13, -o.a * 1.15, o.perm2, b);
        case 'ring3': return csRingHit(o, cx, y0, o.R, 13, o.a, o.perm, b) || csRingHit(o, cx, y0, o.R - 20, 13, -o.a * 1.2, o.perm2, b) || csRingHit(o, cx, y0, o.R - 40, 13, o.a * 1.4, o.perm3, b);
        case 'twin': return csRingHit(o, cx - 60, y0, o.R, 12, o.a, o.perm, b) || csRingHit(o, cx + 60, y0, o.R, 12, -o.a, o.perm2, b);
        case 'square': return csSquareHit(o, cx, y0, o.s, 14, o.a, o.perm, b);
        case 'square2': return csSquareHit(o, cx, y0, o.s, 12, o.a, o.perm, b) || csSquareHit(o, cx, y0, o.s - 26, 12, -o.a * 1.2, o.perm2, b);
        case 'cross': return csCrossHit(cx, y0, o.L, 14, o.a, o.perm, b);
        case 'cross2': return csCrossHit(cx - 60, y0, o.L, 14, o.a, o.perm, b) || csCrossHit(cx + 60, y0, o.L, 14, -o.a, o.perm2, b);
        case 'bars': return csBarHit(o, y0, o.bw, o.off, o.perm, b);
        case 'bars2': return csBarHit(o, y0 - 44, o.bw, o.off, o.perm, b) || csBarHit(o, y0 + 44, o.bw, -o.off, o.perm2, b);
        case 'orbit': {
          for (let i = 0; i < 8; i++) {
            const a = o.a + i * TAU / 8, px = cx + Math.cos(a) * o.R, py = y0 + Math.sin(a) * o.R;
            if (o.perm[i & 3] !== b.c && Math.hypot(px - b.x, py - b.y) < 9 + b.r * .86) return true;
          }
          return false;
        }
      }
      return false;
    };
    o.draw = x => {
      const y0 = o.y;
      switch (type) {
        case 'ring': csRingDraw(x, cx, y0, o.R, 14, o.a, o.perm); break;
        case 'ring2': csRingDraw(x, cx, y0, o.R, 13, o.a, o.perm); csRingDraw(x, cx, y0, o.R - 24, 13, -o.a * 1.15, o.perm2); break;
        case 'ring3': csRingDraw(x, cx, y0, o.R, 13, o.a, o.perm); csRingDraw(x, cx, y0, o.R - 20, 13, -o.a * 1.2, o.perm2); csRingDraw(x, cx, y0, o.R - 40, 13, o.a * 1.4, o.perm3); break;
        case 'twin': csRingDraw(x, cx - 60, y0, o.R, 12, o.a, o.perm); csRingDraw(x, cx + 60, y0, o.R, 12, -o.a, o.perm2); break;
        case 'square': csSquareDraw(x, cx, y0, o.s, 14, o.a, o.perm); break;
        case 'square2': csSquareDraw(x, cx, y0, o.s, 12, o.a, o.perm); csSquareDraw(x, cx, y0, o.s - 26, 12, -o.a * 1.2, o.perm2); break;
        case 'cross': csCrossDraw(x, cx, y0, o.L, 14, o.a, o.perm); break;
        case 'cross2': csCrossDraw(x, cx - 60, y0, o.L, 14, o.a, o.perm); csCrossDraw(x, cx + 60, y0, o.L, 14, -o.a, o.perm2); break;
        case 'bars': csBarDraw(x, y0, o.bw, o.off, o.perm); break;
        case 'bars2': csBarDraw(x, y0 - 44, o.bw, o.off, o.perm); csBarDraw(x, y0 + 44, o.bw, -o.off, o.perm2); break;
        case 'orbit':
          x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, y0, o.R, 0, TAU); x.stroke();
          for (let i = 0; i < 8; i++) {
            const a = o.a + i * TAU / 8;
            x.fillStyle = CS_COL[o.perm[i & 3]]; x.beginPath(); x.arc(cx + Math.cos(a) * o.R, y0 + Math.sin(a) * o.R, 9, 0, TAU); x.fill();
          }
          break;
      }
    };
    o.top = () => o.y - o.h / 2 + (o.so < 0 ? o.so : 0);
    o.bot = () => o.y + o.h / 2;
    o.starAt = () => {
      if (type === 'twin' || type === 'cross2') return { x: cx + o.sx * 60, y: o.y };
      return { x: cx, y: o.y + o.so };
    };
    return o;
  }

  const CS_CHAL = [
    { id: 'ring', name: 'RING MASTER', desc: 'Reach 15 stars on rings only', goal: 15, pool: ['ring', 'ring2', 'ring3', 'twin', 'orbit'], speed: 1.1, kind: 'time' },
    { id: 'square', name: 'SQUARE DANCE', desc: 'Reach 15 stars on squares and crosses', goal: 15, pool: ['square', 'square2', 'cross', 'cross2'], speed: 1.1, kind: 'time' },
    { id: 'bars', name: 'BAR RUSH', desc: 'Reach 25 stars on fast bars', goal: 25, pool: ['bars', 'bars2'], speed: 1.5, kind: 'time' },
    { id: 'blitz', name: 'TIME ATTACK', desc: 'Collect as many stars as you can in 60 seconds', goal: 0, pool: null, speed: 1.15, kind: 'blitz' },
    { id: 'hell', name: 'NO MERCY', desc: 'Reach 10 stars on the hardest obstacles', goal: 10, pool: ['ring3', 'cross2', 'twin', 'square2', 'bars2'], speed: 1.3, kind: 'time' }
  ];
  const CS_SKINS = [
    { n: 'CLASSIC', p: 0 }, { n: 'EYES', p: 15 }, { n: 'STRIPES', p: 40 }, { n: 'STAR', p: 80 }, { n: 'HALO', p: 150 }, { n: 'PIXEL', p: 300 }
  ];

  function csBall(x, px, py, r, col, skin, t) {
    x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    x.save(); x.beginPath(); x.arc(px, py, r, 0, TAU); x.clip();
    x.fillStyle = 'rgba(255,255,255,.92)'; x.strokeStyle = 'rgba(255,255,255,.92)';
    if (skin === 1) {
      x.beginPath(); x.arc(px - r * .36, py - r * .15, r * .26, 0, TAU); x.arc(px + r * .36, py - r * .15, r * .26, 0, TAU); x.fill();
      x.fillStyle = '#222'; x.beginPath(); x.arc(px - r * .3, py - r * .1, r * .11, 0, TAU); x.arc(px + r * .42, py - r * .1, r * .11, 0, TAU); x.fill();
      x.strokeStyle = '#222'; x.lineWidth = r * .12; x.beginPath(); x.arc(px, py + r * .15, r * .45, .2, Math.PI - .2); x.stroke();
    } else if (skin === 2) {
      x.fillRect(px - r, py - r * .6, r * 2, r * .28); x.fillRect(px - r, py + r * .1, r * 2, r * .28);
    } else if (skin === 3) {
      x.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .3 : r * .72; x.lineTo(px + Math.cos(a) * q, py + Math.sin(a) * q); }
      x.closePath(); x.fill();
    } else if (skin === 4) {
      x.lineWidth = r * .22; x.beginPath(); x.arc(px, py, r * .55, 0, TAU); x.stroke();
    } else if (skin === 5) {
      const q = r * .5;
      for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) if ((i + j) & 1) x.fillRect(px + i * q, py + j * q, q, q);
    }
    x.restore();
  }

  function mountColor(root, api) {
    const W = CS_W, H = CS_H;
    const view = api.canvas(W, H), cv = view.canvas, x = view.ctx;
    const au = makeAudio(api), ui = hits();
    const sv = store(api, { best: 0, stars: 0, skin: 0, own: [0], chal: {}, plays: 0 });
    const d = sv.d;
    let mode = 'home', tm = 0, hover = { x: -1, y: -1 }, page = 0;
    let ball, obs, items, cam, camT, score, parts, run, chal = null, nextY, lastType, over;
    const G = 1500, V = 430;

    const snd = {
      tap: () => { au.tone(420, 700, .09, 'sine', .09); },
      star: () => { au.tone(1320, 1320, .06, 'sine', .08); au.tone(1760, 1760, .2, 'sine', .08, .06); },
      sw: () => { au.tone(300, 1500, .25, 'triangle', .08); au.tone(450, 2000, .25, 'sine', .04, .04); },
      die: () => { au.noise(.5, .25, 2400, 120, 'lowpass'); au.tone(220, 40, .45, 'sawtooth', .1); },
      ui: () => au.tone(660, 880, .06, 'sine', .07),
      win: () => { [523, 659, 784, 1046].forEach((f, i) => au.tone(f, f, .18, 'triangle', .08, i * .1)); }
    };

    const allowed = () => {
      if (chal && chal.pool) return chal.pool;
      const out = [];
      for (const k in CS_TYPES) if (CS_TYPES[k].min <= score + 1) for (let i = 0; i < CS_TYPES[k].w; i++) out.push(k);
      return out;
    };
    const speedMul = () => (chal ? chal.speed : 1) * (1 + Math.min(.9, score * .014));

    function spawn() {
      const pool = allowed();
      let type = pick(pool), tries = 0;
      while (type === lastType && pool.length > 1 && tries++ < 8) type = pick(pool);
      lastType = type;
      const o = csObstacle(type, 0, speedMul());
      const first = !obs.length, gap = rnd(135, 165) - Math.min(25, score * .5);
      o.y = first ? 290 : nextY - gap - o.h / 2;
      obs.push(o);
      const s = o.starAt();
      items.push({ k: 's', x: s.x, y: s.y, on: true, o });
      if (!first) items.push({ k: 'w', x: W / 2, y: nextY - gap / 2, on: true });
      nextY = Math.min(o.y - o.h / 2, s.y - 16);
    }

    function begin(ch) {
      chal = ch || null;
      obs = []; items = []; parts = []; score = 0; lastType = '';
      ball = { x: W / 2, y: 520, vy: 0, c: rndi(0, 3), r: 10, dead: false };
      cam = 0; camT = 0;
      nextY = 330;
      run = { started: false, t: 0, time: 0, deadT: 0, overT: 0, done: false };
      over = null;
      if (chal && chal.pool) { score = 0; }
      for (let i = 0; i < 4; i++) spawn();
      mode = 'play';
      if (api.label) api.label(chal ? 'CHALLENGE' : 'SCORE');
      api.score(0);
      d.plays++; sv.save();
    }

    function die() {
      if (ball.dead) return;
      ball.dead = true; run.deadT = 0; snd.die();
      for (let i = 0; i < 30; i++) {
        const a = rnd(0, TAU), v = rnd(80, 340);
        parts.push({ x: ball.x, y: ball.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, l: rnd(.6, 1.2), m: 1.2, c: CS_COL[i % 4], s: rnd(3, 6) });
      }
      if (!chal) { d.best = Math.max(d.best, score); api.submit(score); }
      sv.save();
    }

    function finish(ok) {
      run.done = true;
      over = { ok, score, time: run.time, rec: false };
      if (chal) {
        const cur = d.chal[chal.id];
        if (chal.kind === 'time' && ok) { if (cur == null || run.time < cur) { d.chal[chal.id] = run.time; over.rec = true; } }
        if (chal.kind === 'blitz') { if (cur == null || score > cur) { d.chal[chal.id] = score; over.rec = true; } }
      } else if (score >= d.best && score > 0) over.rec = true;
      sv.save();
      mode = 'over';
    }

    function tap() {
      if (mode !== 'play' || ball.dead || run.done) return;
      if (!run.started) run.started = true;
      ball.vy = -V; snd.tap();
    }

    function update(dt) {
      tm += dt;
      if (mode === 'play' || mode === 'over') {
        if (!ball.dead && !run.done) {
          const n = Math.ceil(dt / .008);
          for (let s = 0; s < n; s++) {
            const h = dt / n;
            if (run.started) {
              ball.vy = Math.min(760, ball.vy + G * h); ball.y += ball.vy * h;
              run.time += h;
            } else ball.y = 520 + Math.sin(tm * 4) * 5;
            for (const o of obs) o.step(h);
            if (o_hit()) { die(); break; }
          }
          camT = Math.min(camT, ball.y - H * .42);
          cam += (camT - cam) * Math.min(1, dt * 10);
          if (ball.y > cam + H + 14) die();
          if (chal && chal.kind === 'blitz' && run.started) {
            run.left = Math.max(0, 60 - run.time);
            if (run.left <= 0 && !ball.dead) { snd.win(); finish(true); }
          }
          for (const it of items) {
            if (!it.on) continue;
            const r = it.k === 's' ? 20 : 20;
            if (Math.hypot(it.x - ball.x, it.y - ball.y) < r) {
              it.on = false;
              if (it.k === 's') {
                score++; d.stars++; snd.star(); api.score(score);
                for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; parts.push({ x: it.x, y: it.y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, l: .4, m: .4, c: '#fff', s: 3 }); }
                if (chal && chal.goal && score >= chal.goal) { snd.win(); finish(true); }
              } else {
                let nc = ball.c; while (nc === ball.c) nc = rndi(0, 3);
                ball.c = nc; snd.sw();
                for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; parts.push({ x: it.x, y: it.y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, l: .5, m: .5, c: CS_COL[i & 3], s: 4 }); }
              }
            }
          }
          while (nextY > cam - H * 1.6) spawn();
          obs = obs.filter(o => o.bot() < cam + H + 300);
          items = items.filter(i => i.y < cam + H + 300);
        } else if (ball.dead) {
          run.deadT += dt;
          if (run.deadT > 1 && !run.done) finish(false);
        }
        if (run.done) run.overT += dt;
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.l -= dt; });
        parts = parts.filter(p => p.l > 0);
      }
    }
    const o_hit = () => { for (const o of obs) { if (Math.abs(o.y - ball.y) < o.h / 2 + 90 && o.hit(ball)) return true; } return false; };

    function star(px, py, r, rot) {
      x.beginPath();
      for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; x.lineTo(px + Math.cos(a) * q, py + Math.sin(a) * q); }
      x.closePath(); x.fill();
    }

    function drawField() {
      x.fillStyle = CS_BG; x.fillRect(0, 0, W, H);
      x.save(); x.translate(0, -cam);
      for (const o of obs) if (o.y + o.h / 2 > cam - 40 && o.y - o.h / 2 < cam + H + 40) o.draw(x);
      for (const it of items) {
        if (!it.on || it.y < cam - 30 || it.y > cam + H + 30) continue;
        if (it.k === 's') {
          const pl = 1 + Math.sin(tm * 5) * .06;
          x.fillStyle = '#fff'; star(it.x, it.y, 13 * pl, tm * .6);
        } else {
          const r = 13;
          for (let i = 0; i < 4; i++) {
            x.fillStyle = CS_COL[i]; x.beginPath(); x.moveTo(it.x, it.y);
            x.arc(it.x, it.y, r, tm * 2 + i * TAU / 4, tm * 2 + (i + 1) * TAU / 4); x.closePath(); x.fill();
          }
        }
      }
      for (const p of parts) {
        x.globalAlpha = clamp(p.l / p.m, 0, 1); x.fillStyle = p.c;
        x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      x.globalAlpha = 1;
      if (!ball.dead) csBall(x, ball.x, ball.y, ball.r, CS_COL[ball.c], d.skin, tm);
      x.restore();
    }

    function drawHud() {
      x.textBaseline = 'top';
      x.font = '800 46px "Segoe UI", system-ui, sans-serif'; x.textAlign = 'left';
      x.fillStyle = 'rgba(255,255,255,.95)';
      x.fillText(String(score), 18, 12);
      if (chal && chal.goal) { x.font = '700 15px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillText('GOAL ' + chal.goal + '   ' + run.time.toFixed(1) + 's', 20, 62); }
      if (chal && chal.kind === 'blitz') { x.font = '700 15px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillText('TIME ' + Math.ceil(run.left == null ? 60 : run.left) + 's', 20, 62); }
      btnPause();
      if (!run.started && !ball.dead) {
        x.textAlign = 'center'; x.font = '700 18px "Segoe UI", system-ui, sans-serif';
        x.fillStyle = `rgba(255,255,255,${.5 + .4 * Math.sin(tm * 4)})`;
        x.fillText('TAP TO JUMP', W / 2, 560);
        x.font = '600 13px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.4)';
        x.fillText('Pass through your own colour only', W / 2, 586);
      }
    }
    function btnPause() {
      const bx = W - 44, by = 14;
      x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(bx + 15, by + 15, 17, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(bx + 9, by + 8, 4, 14); x.fillRect(bx + 17, by + 8, 4, 14);
      ui.add(bx - 4, by - 4, 38, 38, pauseKey);
    }

    function pill(bx, by, bw, bh, label, fn, o = {}) {
      const over = hover.x >= bx && hover.x <= bx + bw && hover.y >= by && hover.y <= by + bh;
      x.fillStyle = o.fill || (over ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)');
      x.beginPath(); x.roundRect(bx, by, bw, bh, bh / 2); x.fill();
      if (o.stroke) { x.strokeStyle = o.stroke; x.lineWidth = 2; x.stroke(); }
      x.fillStyle = o.txt || '#fff'; x.font = `800 ${o.fs || 16}px "Segoe UI", system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(label, bx + bw / 2, by + bh / 2 + 1);
      ui.add(bx, by, bw, bh, () => { snd.ui(); fn(); });
    }

    function logo(cx, cy, s) {
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `900 ${54 * s}px "Segoe UI", system-ui, sans-serif`;
      const word = (t, y) => {
        const ws = [...t].map(ch => x.measureText(ch).width + 2), tot = ws.reduce((m, v) => m + v, 0);
        let px = cx - tot / 2;
        for (let i = 0; i < t.length; i++) { x.fillStyle = CS_COL[(i + Math.floor(tm * 1.5)) % 4]; x.fillText(t[i], px + ws[i] / 2, y + Math.sin(tm * 3 + i) * 3); px += ws[i]; }
      };
      word('COLOR', cy); word('SWITCH', cy + 58 * s);
    }

    function drawHome() {
      x.fillStyle = CS_BG; x.fillRect(0, 0, W, H);
      logo(W / 2, 120, 1);
      const cy = 330;
      csRingDraw(x, W / 2, cy, 56, 12, tm * 1.6, [0, 1, 2, 3]);
      csBall(x, W / 2, cy + Math.sin(tm * 3) * 14, 12, CS_COL[Math.floor(tm * .7) % 4], d.skin, tm);
      const pl = 1 + Math.sin(tm * 4) * .04;
      x.fillStyle = '#fff'; x.beginPath(); x.arc(W / 2, 480, 46 * pl, 0, TAU); x.fill();
      x.fillStyle = CS_BG; x.beginPath(); x.moveTo(W / 2 - 13, 480 - 22); x.lineTo(W / 2 + 24, 480); x.lineTo(W / 2 - 13, 480 + 22); x.closePath(); x.fill();
      ui.add(W / 2 - 50, 430, 100, 100, () => { snd.ui(); begin(null); });
      pill(30, 556, 150, 40, 'CHALLENGES', () => { mode = 'chal'; });
      pill(190, 556, 140, 40, 'BALLS', () => { mode = 'skins'; });
      x.textAlign = 'left'; x.textBaseline = 'top'; x.font = '700 14px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.55)';
      x.fillText('BEST', 18, 16);
      x.font = '800 30px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff'; x.fillText(String(d.best), 18, 32);
      x.textAlign = 'right'; x.font = '800 22px "Segoe UI", system-ui, sans-serif'; x.fillText(String(d.stars), W - 40, 22);
      x.fillStyle = '#fff'; star(W - 24, 36, 12, 0);
      x.textAlign = 'center'; x.font = '600 12px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.4)';
      x.fillText('Tap, click or press Space to jump', W / 2, 612);
    }

    function drawChal() {
      x.fillStyle = CS_BG; x.fillRect(0, 0, W, H);
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 28px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff';
      x.fillText('CHALLENGES', W / 2, 44);
      CS_CHAL.forEach((c, i) => {
        const by = 84 + i * 96, bx = 20, bw = W - 40, bh = 84, col = CS_COL[i % 4];
        const over = hover.x >= bx && hover.x <= bx + bw && hover.y >= by && hover.y <= by + bh;
        x.fillStyle = over ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)';
        x.beginPath(); x.roundRect(bx, by, bw, bh, 14); x.fill();
        x.fillStyle = col; x.beginPath(); x.roundRect(bx, by, 8, bh, [14, 0, 0, 14]); x.fill();
        x.textAlign = 'left'; x.textBaseline = 'top'; x.font = '800 18px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff'; x.fillText(c.name, bx + 24, by + 12);
        x.font = '500 12.5px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText(c.desc, bx + 24, by + 38);
        const b = d.chal[c.id];
        x.font = '700 13px "Segoe UI", system-ui, sans-serif'; x.fillStyle = b != null ? col : 'rgba(255,255,255,.35)';
        x.fillText(b == null ? 'NOT COMPLETED' : c.kind === 'blitz' ? 'BEST ' + b + ' STARS' : 'BEST TIME ' + b.toFixed(1) + 's', bx + 24, by + 60);
        if (b != null && c.kind === 'time') { x.fillStyle = col; x.beginPath(); x.arc(bx + bw - 28, by + 42, 14, 0, TAU); x.fill(); x.strokeStyle = CS_BG; x.lineWidth = 3; x.beginPath(); x.moveTo(bx + bw - 35, by + 42); x.lineTo(bx + bw - 29, by + 48); x.lineTo(bx + bw - 21, by + 36); x.stroke(); }
        ui.add(bx, by, bw, bh, () => { snd.ui(); begin(c); });
      });
      pill(W / 2 - 60, 578, 120, 40, 'BACK', () => { mode = 'home'; });
    }

    function drawSkins() {
      x.fillStyle = CS_BG; x.fillRect(0, 0, W, H);
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 28px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff';
      x.fillText('BALLS', W / 2, 44);
      x.font = '800 18px "Segoe UI", system-ui, sans-serif'; x.fillText(d.stars, W / 2 - 4, 84);
      x.fillStyle = '#fff'; star(W / 2 + 18 + String(d.stars).length * 5, 84, 9, 0);
      CS_SKINS.forEach((s, i) => {
        const bx = 24 + (i % 2) * 160, by = 118 + Math.floor(i / 2) * 140, bw = 152, bh = 128, own = d.own.includes(i), eq = d.skin === i;
        x.fillStyle = eq ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)'; x.beginPath(); x.roundRect(bx, by, bw, bh, 14); x.fill();
        if (eq) { x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); }
        csBall(x, bx + bw / 2, by + 40, 24, CS_COL[Math.floor(tm * .8 + i) % 4], i, tm);
        x.font = '700 13px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(s.n, bx + bw / 2, by + 82);
        const can = own || d.stars >= s.p;
        x.fillStyle = eq ? '#3ddc84' : can ? '#fff' : 'rgba(255,255,255,.18)';
        x.beginPath(); x.roundRect(bx + 24, by + 94, bw - 48, 26, 13); x.fill();
        x.fillStyle = can ? '#222' : 'rgba(255,255,255,.6)'; x.font = '800 13px "Segoe UI", system-ui, sans-serif';
        x.fillText(eq ? 'SELECTED' : own ? 'USE' : s.p + ' STARS', bx + bw / 2, by + 108);
        ui.add(bx, by, bw, bh, () => {
          snd.ui();
          if (own) d.skin = i;
          else if (d.stars >= s.p) { d.stars -= s.p; d.own.push(i); d.skin = i; snd.star(); }
          sv.save();
        });
      });
      pill(W / 2 - 60, 578, 120, 40, 'BACK', () => { mode = 'home'; });
    }

    function drawOver() {
      const e = ease(clamp(run.overT * 3, 0, 1));
      x.fillStyle = `rgba(20,20,20,${.78 * e})`; x.fillRect(0, 0, W, H);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.globalAlpha = e;
      const cy = 190;
      if (chal) {
        x.font = '900 24px "Segoe UI", system-ui, sans-serif'; x.fillStyle = over.ok ? '#3ddc84' : '#ff5a5a';
        x.fillText(chal.kind === 'blitz' ? 'TIME UP' : over.ok ? 'CHALLENGE COMPLETE' : 'CHALLENGE FAILED', W / 2, 90);
        x.font = '700 15px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText(chal.name, W / 2, 118);
      } else {
        x.font = '800 15px "Segoe UI", system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillText('SCORE', W / 2, 98);
      }
      x.font = '900 96px "Segoe UI", system-ui, sans-serif'; x.fillStyle = '#fff'; x.fillText(String(over.score), W / 2, cy + 30);
      x.font = '700 16px "Segoe UI", system-ui, sans-serif';
      if (chal && chal.kind === 'time') { x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('TIME ' + over.time.toFixed(1) + 's' + (d.chal[chal.id] != null ? '   BEST ' + d.chal[chal.id].toFixed(1) + 's' : ''), W / 2, cy + 98); }
      else if (chal) { x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('BEST ' + (d.chal[chal.id] || 0), W / 2, cy + 98); }
      else { x.fillStyle = over.rec ? '#FAE100' : 'rgba(255,255,255,.7)'; x.fillText(over.rec ? 'NEW BEST!' : 'BEST ' + d.best, W / 2, cy + 98); }
      x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '700 14px "Segoe UI", system-ui, sans-serif';
      x.fillText('TOTAL STARS ' + d.stars, W / 2, cy + 128);
      x.beginPath(); x.fillStyle = '#fff'; x.arc(W / 2, 430, 40, 0, TAU); x.fill();
      x.strokeStyle = CS_BG; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.arc(W / 2, 430, 15, -.5, TAU - 1.1); x.stroke();
      x.fillStyle = CS_BG; x.beginPath(); x.moveTo(W / 2 + 6, 430 - 22); x.lineTo(W / 2 + 22, 430 - 10); x.lineTo(W / 2 + 4, 430 - 4); x.closePath(); x.fill();
      ui.add(W / 2 - 44, 386, 88, 88, () => { snd.ui(); begin(chal); });
      pill(W / 2 - 130, 520, 120, 40, chal ? 'LIST' : 'HOME', () => { mode = chal ? 'chal' : 'home'; });
      pill(W / 2 + 10, 520, 120, 40, 'BALLS', () => { mode = 'skins'; });
      x.globalAlpha = 1;
    }

    function draw() {
      ui.begin();
      if (mode === 'home') drawHome();
      else if (mode === 'chal') drawChal();
      else if (mode === 'skins') drawSkins();
      else {
        drawField();
        if (mode === 'play') drawHud(); else drawOver();
      }
    }

    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        if (e.repeat) { e.preventDefault(); return; }
        e.preventDefault();
        if (mode === 'play') tap();
        else if (mode === 'home') begin(null);
        else if (mode === 'over' && run.overT > .5) begin(chal);
      } else if (e.code === 'KeyR' && (mode === 'play' || mode === 'over')) begin(chal);
    });
    pointers(api, view, {
      down(p) {
        hover.x = p.x; hover.y = p.y;
        if (mode === 'play') { if (p.x > W - 52 && p.y < 48) { ui.hit(p.x, p.y); } else tap(); }
        else ui.hit(p.x, p.y);
      },
      move(p) { hover.x = p.x; hover.y = p.y; }
    });
    api.on(cv, 'pointerleave', () => { hover.x = -1; hover.y = -1; });
    begin(null); mode = 'home';
    api.loop(dt => { update(dt); draw(); });
  }

  Ameplay.register({
    id: 'color-switch',
    title: 'Color Switch',
    category: 'Arcade',
    tint: '#900DFF',
    blurb: 'Tap to bounce the ball through spinning obstacles. You can only pass through your own colour, so watch the colour switchers.',
    help: '<kbd>Space</kbd> / click / tap to jump',
    better: 'high',
    width: 460,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M32 12a20 20 0 0 1 20 20"/><path d="M52 32a20 20 0 0 1-20 20" opacity=".7"/><path d="M32 52a20 20 0 0 1-20-20" opacity=".5"/><path d="M12 32a20 20 0 0 1 20-20" opacity=".85"/><circle cx="32" cy="32" r="5" fill="currentColor"/></svg>',
    css: `.gm-color-switch .g-canvas{background:#282828;border-radius:10px;cursor:pointer}`,
    mount: mountColor
  });

  const EC_CARS = [
    { n: 'Red Bug', col: '#ff5a4d', col2: '#c93a34', price: 0, power: 470, vmax: 600, R: 18, k: 62, kind: 'bug', depth: 12, desc: 'Reliable and gentle on the egg' },
    { n: 'Sunny Cab', col: '#ffd23f', col2: '#d9a300', price: 250, power: 520, vmax: 650, R: 19, k: 66, kind: 'cab', depth: 13, desc: 'A touch more punch' },
    { n: 'Mint Jeep', col: '#5fd6a3', col2: '#27a174', price: 600, power: 560, vmax: 640, R: 23, k: 72, kind: 'jeep', depth: 13, desc: 'Big wheels soak up bumps' },
    { n: 'Sky Pickup', col: '#58b8ff', col2: '#2b82d6', price: 1200, power: 600, vmax: 700, R: 22, k: 70, kind: 'pickup', depth: 15, desc: 'Deep nest keeps the egg safe' },
    { n: 'Candy Racer', col: '#ff7ac8', col2: '#d6449c', price: 2200, power: 720, vmax: 860, R: 18, k: 66, kind: 'racer', depth: 14, desc: 'Fast, but hold on tight' },
    { n: 'Monster', col: '#8d5cff', col2: '#5a30c9', price: 4000, power: 700, vmax: 760, R: 31, k: 84, kind: 'monster', depth: 15, desc: 'Crushes every hill' }
  ];
  const EC_BIOMES = [
    { sky1: '#aee0ff', sky2: '#fff3d6', far: '#c4ecd0', mid: '#98dba8', grass: '#7bd45a', grass2: '#58b244', dirt: '#c98f5a', dirt2: '#a86f3e', cloud: '#ffffff' },
    { sky1: '#ffcf9c', sky2: '#fff0d0', far: '#f8d8a4', mid: '#efbb74', grass: '#f4d176', grass2: '#dfae48', dirt: '#d9a05b', dirt2: '#b57a3a', cloud: '#fff8ea' },
    { sky1: '#bcdcff', sky2: '#f4fbff', far: '#e4f0ff', mid: '#c9ddf3', grass: '#ffffff', grass2: '#cfe0f2', dirt: '#9bb4d4', dirt2: '#7a96c0', cloud: '#ffffff' },
    { sky1: '#ffb0cc', sky2: '#ffe8f1', far: '#ffc0d6', mid: '#ff9fc1', grass: '#ff8fb8', grass2: '#e2679a', dirt: '#b86a8f', dirt2: '#94506f', cloud: '#fff0f6' }
  ];
  const ecBiome = m => {
    const seg = 450, i = Math.floor(m / seg), f = m / seg - i, t = clamp((f - .85) / .15, 0, 1), a = EC_BIOMES[i % 4], b = EC_BIOMES[(i + 1) % 4], o = {};
    for (const k in a) o[k] = t > 0 ? mix(a[k], b[k], t * t * (3 - 2 * t)) : a[k];
    o.i = i % 4;
    return o;
  };

  function ecTerrain(seed) {
    const rng = mulberry(seed), N = [{ x: -1400, y: 0 }, { x: -400, y: 0 }, { x: 500, y: 0 }, { x: 900, y: 0 }];
    let y = 0, x = 900, prev = 1;
    const T = {
      N, g: 0, s: 0, i: 1,
      gen(toX) {
        while (x < toX) {
          const p = clamp(x / 50000, 0, 1), r = rng();
          if (r < .1 + .22 * p && x > 1800) {
            const n = 2 + Math.floor(rng() * 3);
            for (let k = 0; k < n; k++) { x += 55 + rng() * 40; y += (k % 2 ? -1 : 1) * (9 + 20 * p * rng()); N.push({ x, y }); }
            x += 70; N.push({ x, y: y = y - (n % 2 ? 0 : 0) });
          } else {
            const L = 190 + rng() * 240 - 60 * p;
            let dy = L * (.1 + .34 * p) * (.35 + .65 * rng());
            const dir = rng() < .68 ? -prev : prev;
            dy *= dir;
            if (y > 240) dy = -Math.abs(dy);
            if (y < -240) dy = Math.abs(dy);
            if (x < 1500) dy *= .5;
            prev = Math.sign(dy) || 1;
            x += L; y += dy; N.push({ x, y });
          }
        }
      },
      at(px) {
        const n = N;
        if (px < n[0].x) px = n[0].x;
        let i = T.i;
        while (i > 0 && n[i].x > px) i--;
        while (i < n.length - 2 && n[i + 1].x < px) i++;
        T.i = i;
        const a = n[i], b = n[i + 1], L = b.x - a.x, t = (px - a.x) / L;
        T.g = a.y + (b.y - a.y) * (1 - Math.cos(Math.PI * t)) / 2;
        T.s = (b.y - a.y) * Math.PI / 2 * Math.sin(Math.PI * t) / L;
        return T.g;
      }
    };
    T.gen(5000);
    return T;
  }

  function ecRoof(depth) {
    const d = depth;
    return [[-58, -4], [-38, -7], [-31, -26], [-29, -26 - d], [-22, -26 - d * .45], [-11, -26 - d * .08], [0, -26], [11, -26 - d * .08], [22, -26 - d * .45], [29, -26 - d], [31, -26], [36, -7], [58, -4]];
  }

  function ecDrawCar(x, car, wheelPos, wr, comp, spin) {
    const c = car;
    x.save();
    const body = c.col, dk = c.col2;
    const kind = c.kind;
    const lift = kind === 'monster' ? 0 : 0;
    x.lineJoin = 'round';
    if (kind === 'pickup') {
      x.fillStyle = dk; x.beginPath(); x.roundRect(-60, -10, 56, 28, 5); x.fill();
      x.fillStyle = '#00000022'; x.fillRect(-56, -6, 48, 5);
    }
    x.fillStyle = body;
    x.beginPath(); x.roundRect(-58, -8 + lift, 116, 28, 9); x.fill();
    x.fillStyle = dk; x.beginPath(); x.roundRect(-58, 10 + lift, 116, 10, [0, 0, 9, 9]); x.fill();
    const top = kind === 'racer' ? -20 : -26;
    x.fillStyle = body;
    x.beginPath();
    if (kind === 'pickup') { x.moveTo(-6, -8); x.lineTo(-2, top); x.lineTo(24, top); x.lineTo(38, -8); }
    else if (kind === 'racer') { x.moveTo(-30, -8); x.lineTo(-18, top); x.lineTo(14, top); x.lineTo(34, -8); }
    else if (kind === 'jeep' || kind === 'monster') { x.moveTo(-40, -8); x.lineTo(-38, top); x.lineTo(24, top); x.lineTo(34, -8); }
    else { x.moveTo(-38, -8); x.lineTo(-30, top); x.lineTo(20, top); x.lineTo(36, -8); }
    x.closePath(); x.fill();
    x.fillStyle = '#d6f1ff';
    x.beginPath();
    if (kind === 'pickup') { x.moveTo(0, -10); x.lineTo(3, top + 4); x.lineTo(21, top + 4); x.lineTo(31, -10); }
    else if (kind === 'racer') { x.moveTo(-22, -10); x.lineTo(-14, top + 3); x.lineTo(10, top + 3); x.lineTo(26, -10); }
    else { x.moveTo(-31, -10); x.lineTo(-26, top + 4); x.lineTo(16, top + 4); x.lineTo(29, -10); }
    x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(-18, -10); x.lineTo(-12, top + 4); x.lineTo(-4, top + 4); x.lineTo(-10, -10); x.fill();
    if (kind === 'cab') { x.fillStyle = '#222'; x.fillRect(-8, top - 4, 20, 6); x.fillStyle = '#ffd23f'; x.fillRect(-6, top - 3, 16, 4); }
    if (kind === 'racer') { x.fillStyle = dk; x.fillRect(-58, -14, 6, 10); x.fillRect(-62, -16, 18, 4); }
    x.fillStyle = '#fff6b0'; x.beginPath(); x.roundRect(50, -3, 10, 8, 3); x.fill();
    x.fillStyle = '#ff4040'; x.beginPath(); x.roundRect(-60, -3, 6, 8, 2); x.fill();
    x.fillStyle = '#3a3a48'; x.fillRect(-60, 14 + lift, 120, 5);
    const roof = ecRoof(c.depth);
    x.beginPath();
    x.moveTo(roof[2][0] - 3, roof[2][1] + 4);
    for (let i = 2; i < roof.length - 2; i++) x.lineTo(roof[i][0], roof[i][1]);
    for (let i = roof.length - 3; i >= 2; i--) x.lineTo(roof[i][0], roof[i][1] + 5);
    x.closePath();
    x.fillStyle = dk; x.fill();
    x.strokeStyle = body; x.lineWidth = 2; x.beginPath();
    for (let i = 2; i < roof.length - 2; i++) i === 2 ? x.moveTo(roof[i][0], roof[i][1]) : x.lineTo(roof[i][0], roof[i][1]);
    x.stroke();
    for (let i = 0; i < 2; i++) {
      const wp = wheelPos[i];
      x.save(); x.translate(wp[0], wp[1]);
      if (kind === 'monster') { x.strokeStyle = dk; x.lineWidth = 7; x.beginPath(); x.moveTo(0, -wr); x.lineTo(0, -24); x.stroke(); }
      x.fillStyle = '#2b2b33'; x.beginPath(); x.arc(0, 0, wr, 0, TAU); x.fill();
      x.rotate(spin[i]);
      x.fillStyle = '#d7d7e4'; x.beginPath(); x.arc(0, 0, wr * .58, 0, TAU); x.fill();
      x.strokeStyle = '#8a8aa0'; x.lineWidth = 2;
      for (let k = 0; k < 5; k++) { const a = k * TAU / 5; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * wr * .56, Math.sin(a) * wr * .56); x.stroke(); }
      x.fillStyle = '#6b6b80'; x.beginPath(); x.arc(0, 0, wr * .16, 0, TAU); x.fill();
      x.restore();
    }
    x.restore();
  }

  function ecDrawEgg(x, px, py, ang, sc, cracked) {
    x.save(); x.translate(px, py); x.rotate(ang); x.scale(sc, sc);
    const g = x.createRadialGradient(-4, -6, 2, 0, 0, 18);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#fff3da'); g.addColorStop(1, '#f0d9aa');
    x.fillStyle = g; x.strokeStyle = '#d9bf8a'; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(0, -17);
    x.bezierCurveTo(10, -17, 14, -2, 13, 4); x.bezierCurveTo(12, 12, 6, 16, 0, 16);
    x.bezierCurveTo(-6, 16, -12, 12, -13, 4); x.bezierCurveTo(-14, -2, -10, -17, 0, -17);
    x.closePath(); x.fill(); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(-5, -7, 2.6, 4.6, .4, 0, TAU); x.fill();
    x.fillStyle = '#3a2a1a'; x.beginPath(); x.arc(-4.5, 1, 1.6, 0, TAU); x.arc(4.5, 1, 1.6, 0, TAU); x.fill();
    x.strokeStyle = '#3a2a1a'; x.lineWidth = 1.3; x.beginPath(); x.arc(0, 5.5, 3, .2, Math.PI - .2); x.stroke();
    if (cracked) { x.strokeStyle = '#8a6a3a'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-8, -12); x.lineTo(-2, -6); x.lineTo(-6, 0); x.lineTo(2, 6); x.stroke(); }
    x.restore();
  }

  function mountEggy(root, api) {
    const W = 960, H = 540, SC = 1.15;
    const view = api.canvas(W, H), cv = view.canvas, x = view.ctx;
    const au = makeAudio(api), ui = hits();
    const sv = store(api, { coins: 0, own: [0], car: 0, best: 0, plays: 0, dist: 0 });
    const d = sv.d;
    const G = 1000, M = 1, I = 1650, DT = 1 / 240;
    let mode = 'menu', tm = 0, hover = { x: -1, y: -1 }, garage = 0;
    let terr, car, egg, wheels, cam, st, parts, coins, P, roof, keys = { gas: false, brake: false }, shake = 0;
    let eng = null, lastM = -1;

    const snd = {
      coin: () => { au.tone(1046, 1046, .06, 'square', .04); au.tone(1568, 1568, .16, 'square', .04, .06); },
      crack: () => { au.noise(.25, .3, 3500, 400, 'bandpass'); au.tone(300, 80, .2, 'triangle', .14); },
      tock: v => au.tone(220 + v, 120, .05, 'triangle', clamp(v / 900, .02, .08)),
      ui: () => au.tone(660, 880, .06, 'square', .05),
      land: v => au.noise(.12, clamp(v / 1500, .03, .12), 600, 150, 'lowpass')
    };

    function engine(on, spd, th) {
      if (api.muted) { if (eng && eng.g) eng.g.gain.value = 0; return; }
      const ctx = au.get && au.get();
      if (!ctx) return;
      if (!eng) {
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = 0;
        o.connect(f); o2.connect(f); f.connect(g); g.connect(au.out());
        o.start(); o2.start();
        eng = { o, o2, f, g };
      }
      const t = ctx.currentTime;
      eng.o.frequency.setTargetAtTime(48 + spd * .07 + th * 26, t, .05);
      eng.o2.frequency.setTargetAtTime(24 + spd * .035 + th * 13, t, .05);
      eng.f.frequency.setTargetAtTime(260 + th * 400 + spd * .2, t, .08);
      eng.g.gain.setTargetAtTime(on ? .045 + th * .03 : 0, t, .08);
    }

    function reset(newTerrain) {
      P = EC_CARS[d.car];
      terr = ecTerrain(Math.floor(Math.random() * 1e9));
      roof = ecRoof(P.depth);
      terr.at(0);
      const hh = P.R + 44 - 8;
      car = { x: 0, y: terr.g - hh - 6, a: 0, vx: 0, vy: 0, w: 0 };
      egg = { x: 0, y: car.y - 26 - 14, vx: 0, vy: 0, w: 0, a: 0, r: 13.5, me: .1, Ie: .5 * .1 * 13.5 * 13.5 };
      wheels = [{ rot: 0, comp: 8, on: false }, { rot: 0, comp: 8, on: false }];
      cam = { x: 0, y: car.y - 40 };
      st = { th: 0, br: 0, dist: 0, coins: 0, over: false, overT: 0, crack: false, air: 0, flip: 0, started: false, maxX: 0, rec: false, reason: '' };
      parts = [];
      coins = [];
      genCoins(0, 5000);
      coinX = 5000;
      lastM = -1;
    }
    let coinX = 0, crng = mulberry(77);
    function genCoins(a, b) {
      let px = Math.max(a, 700);
      while (px < b) {
        px += 260 + crng() * 500;
        const n = 3 + Math.floor(crng() * 4), arc = crng() < .5;
        for (let i = 0; i < n; i++) {
          const cx = px + i * 44;
          terr.gen(cx + 200);
          const gy = terr.at(cx);
          coins.push({ x: cx, y: gy - 62 - (arc ? Math.sin(i / (n - 1) * Math.PI) * 50 : 0), on: true });
        }
        px += n * 44;
      }
    }

    function stepPhysics(h) {
      const ca = Math.cos(car.a), sa = Math.sin(car.a);
      let Fx = 0, Fy = M * G, tq = 0, grounded = 0;
      const P_ = P, L = 24, trav = 16;
      st.th += ((keys.gas ? 1 : 0) - st.th) * Math.min(1, h * 7);
      st.br += ((keys.brake ? 1 : 0) - st.br) * Math.min(1, h * 12);
      for (let i = 0; i < 2; i++) {
        const lx = i ? 44 : -44, ly = 10;
        const hubx = car.x + lx * ca - ly * sa, huby = car.y + lx * sa + ly * ca;
        const wx = hubx - sa * L, wy = huby + ca * L;
        terr.at(wx);
        const inv = 1 / Math.sqrt(1 + terr.s * terr.s), dist = (terr.g - wy) * inv, pen = P_.R - dist;
        const wh = wheels[i];
        if (pen > 0) {
          grounded++;
          const nx = terr.s * inv, ny = -inv, tx = inv, ty = terr.s * inv;
          const rx = hubx - car.x, ry = huby - car.y;
          const vhx = car.vx - car.w * ry, vhy = car.vy + car.w * rx;
          const vn = vhx * nx + vhy * ny, vt = vhx * tx + vhy * ty;
          const comp = Math.min(pen, trav);
          let Fn = P_.k * comp - 6.5 * vn;
          if (pen > trav) Fn += 900 * (pen - trav);
          if (Fn < 0) Fn = 0;
          let Ft = -vt * .09;
          const per = P_.power * .5;
          if (st.th > .01) Ft += st.th * per * clamp(1 - vt / P_.vmax, 0, 1.2);
          if (st.br > .01) {
            if (vt > 25) Ft -= Math.min(st.br * 1.4 * per, vt * .5 / h * .5);
            else Ft -= st.br * per * .75 * clamp(1 + vt / 260, 0, 1);
          }
          const lim = 1.25 * Fn;
          Ft = clamp(Ft, -lim, lim);
          const fx = Fn * nx + Ft * tx, fy = Fn * ny + Ft * ty;
          Fx += fx; Fy += fy; tq += rx * fy - ry * fx;
          wh.comp += (comp - wh.comp) * Math.min(1, h * 40);
          wh.rot += (vt / P_.R) * h;
          wh.on = true;
        } else {
          wh.on = false;
          wh.comp += (0 - wh.comp) * Math.min(1, h * 10);
          wh.rot += (st.th * 12 - st.br * 0) * h;
        }
      }
      const pts = [[-56, 16], [56, 16], [-30, -28], [30, -28], [0, -30], [-58, -4], [58, -4]];
      for (let k = 0; k < pts.length; k++) {
        const lx = pts[k][0], ly = pts[k][1];
        const px = car.x + lx * ca - ly * sa, py = car.y + lx * sa + ly * ca;
        terr.at(px);
        const inv = 1 / Math.sqrt(1 + terr.s * terr.s), dist = (terr.g - py) * inv;
        if (dist < 2) {
          const pen = 2 - dist, nx = terr.s * inv, ny = -inv;
          const rx = px - car.x, ry = py - car.y;
          const vx = car.vx - car.w * ry, vy = car.vy + car.w * rx;
          const vn = vx * nx + vy * ny, vt = vx * inv + vy * terr.s * inv;
          let Fn = 2400 * pen - 30 * vn;
          if (Fn < 0) Fn = 0;
          const Ft = clamp(-vt * 8, -Fn * .9, Fn * .9);
          const fx = Fn * nx + Ft * inv, fy = Fn * ny + Ft * terr.s * inv;
          Fx += fx; Fy += fy; tq += rx * fy - ry * fx;
          if (k < 5 && Math.abs(vn) > 250) snd.land(Math.abs(vn));
        }
      }
      if (!grounded) {
        tq += ((st.br ? 1 : 0) * 0 + (keys.brake ? 1 : 0) - (keys.gas ? 1 : 0)) * 6200;
        car.w *= 1 - .6 * h;
        st.air += h;
      } else {
        if (st.air > .5) shake = Math.max(shake, .06);
        st.air = 0;
        car.w *= 1 - .25 * h;
      }
      car.vx += Fx / M * h; car.vy += Fy / M * h; car.w += tq / I * h;
      car.x += car.vx * h; car.y += car.vy * h; car.a += car.w * h;
      if (car.x < -300) { car.x = -300; car.vx = Math.max(0, car.vx); }
      if (car.a > Math.PI) car.a -= TAU; else if (car.a < -Math.PI) car.a += TAU;

      if (st.crack) return;
      egg.vy += G * h;
      egg.x += egg.vx * h; egg.y += egg.vy * h; egg.a += egg.w * h;
      egg.w *= 1 - .8 * h;
      const ca2 = Math.cos(car.a), sa2 = Math.sin(car.a);
      const wp = roof.map(q => [car.x + q[0] * ca2 - q[1] * sa2, car.y + q[0] * sa2 + q[1] * ca2]);
      for (let it = 0; it < 3; it++) {
        for (let i = 0; i < wp.length - 1; i++) {
          const A = wp[i], B = wp[i + 1], abx = B[0] - A[0], aby = B[1] - A[1];
          const t = clamp(((egg.x - A[0]) * abx + (egg.y - A[1]) * aby) / (abx * abx + aby * aby), 0, 1);
          const px = A[0] + abx * t, py = A[1] + aby * t, dx = egg.x - px, dy = egg.y - py, dd = Math.hypot(dx, dy);
          if (dd >= egg.r || dd < 1e-6) continue;
          const nx = dx / dd, ny = dy / dd, pen = egg.r - dd;
          const rpx = px - car.x, rpy = py - car.y, rex = -nx * egg.r, rey = -ny * egg.r;
          const vex = egg.vx - egg.w * rey, vey = egg.vy + egg.w * rex, vcx = car.vx - car.w * rpy, vcy = car.vy + car.w * rpx;
          const rvx = vex - vcx, rvy = vey - vcy, vn = rvx * nx + rvy * ny;
          if (vn < 0) {
            const cn = rpx * ny - rpy * nx, kn = 1 / egg.me + 1 / M + cn * cn / I;
            const jn = -(1 + (vn < -120 ? .25 : 0)) * vn / kn;
            let jx = jn * nx, jy = jn * ny;
            egg.vx += jx / egg.me; egg.vy += jy / egg.me;
            car.vx -= jx / M; car.vy -= jy / M; car.w -= (rpx * jy - rpy * jx) / I;
            if (it === 0 && vn < -140) snd.tock(-vn * .3);
            const tx = -ny, ty = nx;
            const vex2 = egg.vx - egg.w * rey, vey2 = egg.vy + egg.w * rex, vcx2 = car.vx - car.w * rpy, vcy2 = car.vy + car.w * rpx;
            const vt = (vex2 - vcx2) * tx + (vey2 - vcy2) * ty;
            const ct = rpx * ty - rpy * tx, cet = rex * ty - rey * tx, kt = 1 / egg.me + 1 / M + ct * ct / I + cet * cet / egg.Ie;
            const jt = clamp(-vt / kt, -.55 * jn, .55 * jn);
            jx = jt * tx; jy = jt * ty;
            egg.vx += jx / egg.me; egg.vy += jy / egg.me; egg.w += (rex * jy - rey * jx) / egg.Ie;
            car.vx -= jx / M; car.vy -= jy / M; car.w -= (rpx * jy - rpy * jx) / I;
          }
          egg.x += nx * pen * .6; egg.y += ny * pen * .6;
        }
      }
      terr.at(egg.x);
      const inv = 1 / Math.sqrt(1 + terr.s * terr.s);
      if ((terr.g - egg.y) * inv < egg.r * .9) crackEgg('EGG CRACKED');
      if (Math.hypot(egg.x - car.x, egg.y - car.y) > 260) crackEgg('EGG LOST');
    }

    function crackEgg(reason) {
      if (st.crack) return;
      st.crack = true; st.reason = reason; st.overT = 0; snd.crack(); shake = .35;
      for (let i = 0; i < 18; i++) parts.push({ x: egg.x, y: egg.y, vx: rnd(-180, 180) + car.vx * .3, vy: rnd(-300, -60), l: rnd(.8, 1.6), m: 1.6, c: pick(['#fff3da', '#ffffff', '#f0d9aa', '#ffc21a']), s: rnd(3, 7), g: 900 });
      terr.at(egg.x);
      egg.vx = egg.vy = 0;
      d.coins += st.coins;
      const m = Math.floor(st.dist);
      if (m > d.best) { d.best = m; st.rec = true; }
      api.submit(m);
      d.dist += m;
      sv.save();
    }

    function update(dt) {
      tm += dt;
      if (shake > 0) shake = Math.max(0, shake - dt);
      const run = mode === 'play' || mode === 'over' || mode === 'menu';
      if (run) {
        const n = Math.min(10, Math.ceil(dt / DT));
        for (let i = 0; i < n; i++) stepPhysics(dt / n);
      }
      if (mode === 'play' || mode === 'over') {
        st.dist = Math.max(st.dist, car.x / 50);
        const m = Math.floor(st.dist);
        if (m !== lastM) { lastM = m; api.score(m); }
        if (!st.crack && Math.abs(car.a) > 2.2) { st.flip += dt; if (st.flip > 1.4) crackEgg('FLIPPED'); } else st.flip = 0;
        if (st.crack) st.overT += dt;
        if (st.crack && st.overT > 1.1 && mode === 'play') { mode = 'over'; }
        for (const c of coins) if (c.on && Math.abs(c.x - car.x) < 60 && Math.hypot(c.x - car.x, c.y - car.y) < 46) {
          c.on = false; st.coins++; snd.coin();
          for (let i = 0; i < 6; i++) parts.push({ x: c.x, y: c.y, vx: rnd(-90, 90), vy: rnd(-120, 20), l: .4, m: .4, c: '#ffd23f', s: 3, g: 300 });
        }
        if (car.x + 3000 > coinX) { terr.gen(car.x + 6000); genCoins(coinX, car.x + 5000); coinX = car.x + 5000; coins = coins.filter(c => c.x > car.x - 1500); }
        if (terr.N.length > 200) { const k = terr.N.findIndex(n => n.x > car.x - 3000); if (k > 4) { terr.N.splice(0, k - 2); terr.i = 1; } }
        if (!st.crack && mode === 'play') {
          for (let i = 0; i < 2; i++) if (wheels[i].on && st.th > .3 && Math.random() < .5 && car.vx > 20) {
            const lx = i ? 44 : -44, ca = Math.cos(car.a), sa = Math.sin(car.a);
            parts.push({ x: car.x + lx * ca - 36 * sa - 12, y: car.y + lx * sa + 36 * ca + P.R - 6, vx: -car.vx * .15 + rnd(-30, 10), vy: rnd(-70, -10), l: .5, m: .5, c: ecBiome(st.dist).dirt, s: rnd(3, 6), g: 120 });
          }
        }
        engine(!st.crack && mode === 'play', Math.abs(car.vx), st.th);
      } else engine(false, 0, 0);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 600) * dt; p.l -= dt; });
      parts = parts.filter(p => p.l > 0);
      const tx = mode === 'menu' ? car.x + 250 : car.x + clamp(car.vx * .35, -50, 300) + 90, ty = car.y - 30;
      cam.x += (tx - cam.x) * Math.min(1, dt * 5);
      cam.y += (ty - cam.y) * Math.min(1, dt * 3.5);
    }

    function drawWorld() {
      const m = mode === 'menu' ? 0 : st.dist, B = ecBiome(m);
      const gs = x.createLinearGradient(0, 0, 0, H);
      gs.addColorStop(0, B.sky1); gs.addColorStop(1, B.sky2);
      x.fillStyle = gs; x.fillRect(0, 0, W, H);
      const cxw = cam.x, cyw = cam.y;
      x.fillStyle = B.cloud;
      for (let i = 0; i < 7; i++) {
        const px = ((i * 313 - cxw * .05 - tm * 8) % (W + 300) + W + 300) % (W + 300) - 150, py = 50 + (i * 71) % 150;
        x.globalAlpha = .85;
        x.beginPath(); x.arc(px, py, 26, 0, TAU); x.arc(px + 28, py + 6, 20, 0, TAU); x.arc(px - 28, py + 8, 18, 0, TAU); x.arc(px + 4, py + 10, 24, 0, TAU); x.fill();
      }
      x.globalAlpha = 1;
      const hill = (col, par, amp, base, fr, ph) => {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, H);
        for (let sx = 0; sx <= W; sx += 16) {
          const wx = sx + cxw * par;
          x.lineTo(sx, base - cyw * par * .3 + Math.sin(wx * fr + ph) * amp + Math.sin(wx * fr * 2.3 + ph * 2) * amp * .4);
        }
        x.lineTo(W, H); x.closePath(); x.fill();
      };
      hill(B.far, .12, 40, 330, .004, 1);
      hill(B.mid, .28, 32, 380, .006, 3);
      x.save();
      let ox = 0, oy = 0;
      if (shake > 0) { ox = rnd(-1, 1) * shake * 16; oy = rnd(-1, 1) * shake * 16; }
      x.translate(W / 2 + ox, H * .62 + oy); x.scale(SC, SC); x.translate(-cxw, -cyw);
      const x0 = cxw - W / 2 / SC - 40, x1 = cxw + W / 2 / SC + 40;
      terr.gen(x1 + 800);
      x.beginPath();
      const step = 12, bot = cyw + H;
      x.moveTo(x0, bot);
      for (let px = Math.floor(x0 / step) * step; px <= x1; px += step) x.lineTo(px, terr.at(px));
      x.lineTo(x1, bot); x.closePath();
      const dg = x.createLinearGradient(0, cyw - 100, 0, cyw + H);
      dg.addColorStop(0, B.dirt); dg.addColorStop(1, B.dirt2);
      x.fillStyle = dg; x.fill();
      x.strokeStyle = B.dirt2; x.globalAlpha = .35; x.lineWidth = 1;
      for (let px = Math.floor(x0 / 90) * 90; px <= x1; px += 90) {
        const gy = terr.at(px), hsh = Math.sin(px * 12.9898) * 43758.5453 % 1;
        x.fillStyle = B.dirt2; x.beginPath(); x.arc(px + 20, gy + 40 + Math.abs(hsh) * 80, 6 + Math.abs(hsh) * 8, 0, TAU); x.fill();
      }
      x.globalAlpha = 1;
      x.lineJoin = 'round'; x.lineCap = 'round';
      x.beginPath();
      for (let px = Math.floor(x0 / step) * step; px <= x1; px += step) { const gy = terr.at(px); px <= x0 + step ? x.moveTo(px, gy) : x.lineTo(px, gy); }
      x.strokeStyle = B.grass2; x.lineWidth = 22; x.stroke();
      x.strokeStyle = B.grass; x.lineWidth = 14; x.save(); x.translate(0, -3); x.stroke(); x.restore();
      for (let px = Math.floor(x0 / 120) * 120; px <= x1; px += 120) {
        const hv = Math.abs(Math.sin(px * 78.233) * 43758.5453 % 1), gy = terr.at(px), s = terr.s;
        if (px < 1000 && px > -200 && hv < .5) continue;
        x.save(); x.translate(px + hv * 60, gy - 4); x.rotate(Math.atan(s));
        if (B.i === 0) {
          x.fillStyle = '#8a5a34'; x.fillRect(-3, -26, 6, 28);
          x.fillStyle = hv > .6 ? '#4caf50' : '#66c25a'; x.beginPath(); x.arc(0, -34, 16 + hv * 6, 0, TAU); x.arc(-10, -26, 11, 0, TAU); x.arc(10, -26, 11, 0, TAU); x.fill();
        } else if (B.i === 1) {
          x.fillStyle = '#5da05a'; x.fillRect(-4, -34, 8, 36); x.fillRect(-14, -24, 6, 4); x.fillRect(-14, -30, 4, 10); x.fillRect(8, -28, 6, 4); x.fillRect(10, -34, 4, 10);
        } else if (B.i === 2) {
          x.fillStyle = '#7a5a3a'; x.fillRect(-2, -8, 4, 10);
          x.fillStyle = '#3f8f6a'; x.beginPath(); x.moveTo(-14, -6); x.lineTo(0, -34); x.lineTo(14, -6); x.fill(); x.beginPath(); x.moveTo(-11, -22); x.lineTo(0, -46); x.lineTo(11, -22); x.fill();
          x.fillStyle = '#fff'; x.beginPath(); x.moveTo(-6, -33); x.lineTo(0, -46); x.lineTo(6, -33); x.fill();
        } else {
          x.fillStyle = '#fff'; x.fillRect(-2, -30, 4, 32);
          x.fillStyle = ['#ff5a9d', '#ffd23f', '#5ad1ff'][Math.floor(hv * 3)]; x.beginPath(); x.arc(0, -36, 12, 0, TAU); x.fill();
          x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(0, -36, 6, 0, TAU); x.stroke();
        }
        x.restore();
      }
      for (const c of coins) {
        if (!c.on || c.x < x0 || c.x > x1) continue;
        const sc = Math.abs(Math.cos(tm * 4 + c.x * .02));
        x.fillStyle = '#e0a800'; x.beginPath(); x.ellipse(c.x, c.y, 12 * sc + 1, 13, 0, 0, TAU); x.fill();
        x.fillStyle = '#ffd23f'; x.beginPath(); x.ellipse(c.x, c.y, 9 * sc + .5, 10, 0, 0, TAU); x.fill();
      }
      for (const p of parts) {
        x.globalAlpha = clamp(p.l / p.m, 0, 1); x.fillStyle = p.c; x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      x.globalAlpha = 1;
      const ca = Math.cos(car.a), sa = Math.sin(car.a);
      const wp = [0, 1].map(i => { const lx = i ? 44 : -44, ly = 10 + 24 - wheels[i].comp; return [lx - sa * 0, ly]; });
      x.save(); x.translate(car.x, car.y); x.rotate(car.a);
      ecDrawCar(x, P, [[-44, 10 + 24 - wheels[0].comp], [44, 10 + 24 - wheels[1].comp]], P.R, 0, [wheels[0].rot, wheels[1].rot]);
      x.restore();
      if (!st.crack) ecDrawEgg(x, egg.x, egg.y, egg.a, 1, false);
      else {
        const gy = terr.at(egg.x);
        x.fillStyle = '#ffc21a'; x.beginPath(); x.ellipse(egg.x, gy - 3, 22, 6, Math.atan(terr.s), 0, TAU); x.fill();
        x.fillStyle = '#ffffffcc'; x.beginPath(); x.ellipse(egg.x + 8, gy - 4, 26, 5, Math.atan(terr.s), 0, TAU); x.fill();
        x.fillStyle = '#fff3da'; x.beginPath(); x.moveTo(egg.x - 18, gy - 4); x.lineTo(egg.x - 10, gy - 18); x.lineTo(egg.x - 4, gy - 6); x.fill();
      }
      x.restore();
    }

    function bar(bx, by, bw, v, col) {
      x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.roundRect(bx, by, bw, 10, 5); x.fill();
      x.fillStyle = col; x.beginPath(); x.roundRect(bx, by, Math.max(10, bw * v), 10, 5); x.fill();
    }
    const { FONT, text: shadowText, btn, coin: coinIcon } = uiKit(x, ui, hover, () => snd.ui());

    function drawHud() {
      shadowText(Math.floor(st.dist) + ' m', 24, 38, 44, '#fff');
      shadowText('BEST ' + Math.max(d.best, Math.floor(st.dist)) + ' m', 26, 76, 18, 'rgba(255,255,255,.9)', 'left', 700);
      coinIcon(W - 150, 36, 14); shadowText(String(d.coins + st.coins), W - 128, 37, 30, '#fff');
      x.fillStyle = 'rgba(0,0,0,.2)'; x.beginPath(); x.roundRect(W - 62, 14, 40, 40, 12); x.fill();
      x.fillStyle = '#fff'; x.fillRect(W - 51, 26, 6, 16); x.fillRect(W - 39, 26, 6, 16);
      ui.add(W - 62, 14, 40, 40, pauseKey);
      const pg = (bx, label, on, col) => {
        x.fillStyle = on ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.25)'; x.beginPath(); x.roundRect(bx, H - 96, 120, 76, 20); x.fill();
        x.fillStyle = col; x.beginPath();
        if (label === 'BRAKE') { x.moveTo(bx + 76, H - 78); x.lineTo(bx + 44, H - 58); x.lineTo(bx + 76, H - 38); }
        else { x.moveTo(bx + 44, H - 78); x.lineTo(bx + 76, H - 58); x.lineTo(bx + 44, H - 38); }
        x.closePath(); x.fill();
      };
      pg(20, 'BRAKE', keys.brake, '#c0392b'); pg(W - 140, 'GAS', keys.gas, '#2e9e4f');
      if (!st.started) {
        shadowText('Hold GAS to drive. Keep the egg on the roof!', W / 2, 150, 26, '#fff', 'center', 800);
        shadowText('Right / D / Up = gas      Left / A / Down = brake', W / 2, 186, 17, 'rgba(255,255,255,.9)', 'center', 700);
      }
    }

    function drawOver() {
      const e = ease(clamp((st.overT - 1.1) * 3 + .01, 0, 1));
      x.fillStyle = `rgba(30,20,10,${.45 * e})`; x.fillRect(0, 0, W, H);
      x.save(); x.globalAlpha = e; x.translate(0, (1 - e) * 30);
      x.fillStyle = '#fff8e6'; x.beginPath(); x.roundRect(W / 2 - 220, 100, 440, 330, 26); x.fill();
      x.strokeStyle = '#f0d9aa'; x.lineWidth = 4; x.stroke();
      shadowText(st.reason, W / 2, 148, 34, '#e0661f', 'center');
      x.fillStyle = '#7a5a3a'; x.font = `700 16px ${FONT}`; x.textAlign = 'center'; x.fillText('DISTANCE', W / 2, 196);
      x.font = `900 62px ${FONT}`; x.fillStyle = '#3a2a1a'; x.fillText(Math.floor(st.dist) + ' m', W / 2, 242);
      x.font = `700 18px ${FONT}`; x.fillStyle = st.rec ? '#e0661f' : '#7a5a3a'; x.fillText(st.rec ? 'NEW BEST!' : 'BEST ' + d.best + ' m', W / 2, 286);
      coinIcon(W / 2 - 38, 322, 13); x.textAlign = 'left'; x.fillStyle = '#3a2a1a'; x.font = `800 26px ${FONT}`; x.fillText('+' + st.coins, W / 2 - 18, 323);
      btn(W / 2 - 200, 352, 190, 56, 'RETRY', () => { reset(); mode = 'play'; });
      btn(W / 2 + 10, 352, 190, 56, 'GARAGE', () => { garage = d.car; mode = 'garage'; reset(); }, { col: '#5aa9ff', dk: '#2f7ad0' });
      x.restore();
    }

    function drawMenu() {
      shadowText('EGGY CAR', W / 2, 96, 78, '#fff', 'center', 900);
      shadowText('Drive far. Don’t crack the egg.', W / 2, 150, 22, 'rgba(255,255,255,.95)', 'center', 700);
      btn(W / 2 - 110, 360, 220, 70, 'PLAY', () => { reset(); mode = 'play'; }, { fs: 34 });
      btn(W / 2 - 110, 450, 220, 52, 'GARAGE', () => { garage = d.car; mode = 'garage'; }, { col: '#5aa9ff', dk: '#2f7ad0' });
      coinIcon(W - 150, 36, 14); shadowText(String(d.coins), W - 128, 37, 30, '#fff');
      shadowText('BEST ' + d.best + ' m', 24, 38, 26, '#fff');
    }

    function drawGarage() {
      const B = EC_BIOMES[0];
      const gs = x.createLinearGradient(0, 0, 0, H); gs.addColorStop(0, B.sky1); gs.addColorStop(1, B.sky2);
      x.fillStyle = gs; x.fillRect(0, 0, W, H);
      x.fillStyle = B.grass; x.fillRect(0, 400, W, H - 400); x.fillStyle = B.grass2; x.fillRect(0, 400, W, 14);
      const c = EC_CARS[garage], own = d.own.includes(garage);
      shadowText('GARAGE', W / 2, 52, 44, '#fff', 'center', 900);
      coinIcon(W - 150, 36, 14); shadowText(String(d.coins), W - 128, 37, 30, '#fff');
      x.save(); x.translate(W / 2, 290); x.scale(2.1, 2.1);
      const bob = Math.sin(tm * 2) * 1.2;
      x.translate(0, bob);
      x.save(); x.translate(0, 0);
      ecDrawCar(x, c, [[-44, 26], [44, 26]], c.R, 0, [tm * 2, tm * 2]);
      x.restore();
      ecDrawEgg(x, 0, -26 - 14 - 1, Math.sin(tm * 1.3) * .08, 1, false);
      x.restore();
      shadowText(c.n.toUpperCase(), W / 2, 436, 34, '#fff', 'center', 900);
      x.font = `600 16px ${FONT}`; x.fillStyle = 'rgba(0,0,0,.55)'; x.textAlign = 'center'; x.fillText(c.desc, W / 2, 468);
      const stats = [['POWER', c.power / 760, '#ff6b4a'], ['SPEED', c.vmax / 900, '#4aa8ff'], ['GRIP', (c.R + c.k / 4) / 50, '#6bd36b'], ['EGG NEST', c.depth / 16, '#ffc21a']];
      stats.forEach((s, i) => {
        const bx = 40, by = 150 + i * 36;
        x.font = `800 14px ${FONT}`; x.fillStyle = 'rgba(0,0,0,.55)'; x.textAlign = 'left'; x.fillText(s[0], bx, by + 5);
        bar(bx + 84, by, 140, clamp(s[1], .1, 1), s[2]);
      });
      const bw = 200, bx = W / 2 - bw / 2;
      if (own) {
        const eq = d.car === garage;
        btn(bx, 484, bw, 40, eq ? 'SELECTED' : 'SELECT', () => { d.car = garage; sv.save(); reset(); }, { col: eq ? '#3ddc84' : '#ff9a2e', dk: eq ? '#1e9c5a' : '#c9742a', fs: 20 });
      } else {
        const can = d.coins >= c.price;
        btn(bx, 484, bw, 40, c.price + ' COINS', () => { if (can) { d.coins -= c.price; d.own.push(garage); d.car = garage; sv.save(); snd.coin(); reset(); } }, { col: can ? '#ff9a2e' : '#a9a9a9', dk: can ? '#c9742a' : '#7a7a7a', fs: 20 });
      }
      btn(30, 440, 70, 70, '<', () => { garage = (garage + EC_CARS.length - 1) % EC_CARS.length; }, { col: '#5aa9ff', dk: '#2f7ad0', fs: 40 });
      btn(W - 100, 440, 70, 70, '>', () => { garage = (garage + 1) % EC_CARS.length; }, { col: '#5aa9ff', dk: '#2f7ad0', fs: 40 });
      btn(20, 16, 120, 44, 'BACK', () => { mode = 'menu'; reset(); }, { col: '#8a7a6a', dk: '#5e5246', fs: 20 });
      if (!own) { x.fillStyle = 'rgba(0,0,0,.12)'; }
    }

    function draw() {
      ui.begin();
      if (mode === 'garage') { drawGarage(); return; }
      drawWorld();
      if (mode === 'menu') drawMenu();
      else { drawHud(); if (mode === 'over') drawOver(); }
    }

    const K = { ArrowRight: 'gas', KeyD: 'gas', ArrowUp: 'gas', ArrowLeft: 'brake', KeyA: 'brake', ArrowDown: 'brake' };
    const held = { gas: new Set(), brake: new Set() };
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = K[e.code];
      if (k) { held[k].add(e.code); keys[k] = true; if (mode === 'play') st.started = true; e.preventDefault(); return; }
      if (e.code === 'Space' || e.code === 'Enter') {
        if (e.repeat) return;
        if (mode === 'menu') { reset(); mode = 'play'; e.preventDefault(); }
        else if (mode === 'over') { reset(); mode = 'play'; e.preventDefault(); }
      } else if (e.code === 'KeyR' && mode === 'play') reset();
    });
    api.on(window, 'keyup', e => {
      const k = K[e.code];
      if (k) { held[k].delete(e.code); keys[k] = held[k].size > 0 || touchKeys[k]; }
    });
    api.on(window, 'blur', () => { held.gas.clear(); held.brake.clear(); keys.gas = keys.brake = false; });
    const touchKeys = { gas: false, brake: false };
    const act = pointers(api, view, {
      down(p) {
        hover.x = p.x; hover.y = p.y;
        if (mode === 'play') {
          if (p.x > W - 70 && p.y < 60) { ui.hit(p.x, p.y); p.ui = true; return; }
          st.started = true; sync();
        } else ui.hit(p.x, p.y);
      },
      move(p) { hover.x = p.x; hover.y = p.y; if (mode === 'play') sync(); },
      up() { sync(); }
    });
    function sync() {
      let g = false, b = false;
      act.forEach(p => { if (p.ui) return; if (p.x > W / 2) g = true; else b = true; });
      touchKeys.gas = g; touchKeys.brake = b;
      keys.gas = held.gas.size > 0 || g; keys.brake = held.brake.size > 0 || b;
    }
    api.on(cv, 'pointerleave', () => { hover.x = -1; hover.y = -1; });
    reset();
    api.loop(dt => { update(dt); draw(); });
    api.score(0);
    if (api.label) api.label('DISTANCE');
    return { destroy() { if (eng) { try { eng.o.stop(); eng.o2.stop(); eng.g.disconnect(); } catch (e) {} eng = null; } } };
  }

  Ameplay.register({
    id: 'eggy-car',
    title: 'Eggy Car',
    category: 'Racing',
    tint: '#ff9a2e',
    blurb: 'Drive over rolling hills with a fragile egg on the roof. Ease off the gas on the climbs, collect coins and unlock new cars.',
    help: '<kbd>→</kbd> / <kbd>D</kbd> gas · <kbd>←</kbd> / <kbd>A</kbd> brake and tilt · touch: right half gas, left half brake',
    better: 'high',
    width: 900,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 46h48v-9l-8-3-6-9H25l-6 9-11 3z"/><circle cx="20" cy="48" r="6" fill="currentColor"/><circle cx="46" cy="48" r="6" fill="currentColor"/><ellipse cx="34" cy="14" rx="6" ry="7"/></svg>',
    css: `.gm-eggy-car .g-canvas{background:#aee0ff;border-radius:12px}`,
    mount: mountEggy
  });

  const DB_SKINS = [
    { n: 'Cream Soda', col: '#ffd9a8', cab: '#fff3e0', acc: '#ff8fb1', price: 0, kind: 'sedan', hl: .6, hw: .34, bh: .22, ch: .22, chl: .28, cof: -.06 },
    { n: 'Taxi', col: '#ffd54a', cab: '#fff0a8', acc: '#3a3a3a', price: 100, kind: 'taxi', hl: .6, hw: .34, bh: .22, ch: .22, chl: .28, cof: -.06 },
    { n: 'Mint Hatch', col: '#8fe3c2', cab: '#e0fff3', acc: '#4cc9a0', price: 220, kind: 'hatch', hl: .5, hw: .34, bh: .24, ch: .26, chl: .3, cof: -.1 },
    { n: 'Police', col: '#ffffff', cab: '#9ec1ff', acc: '#ff5d6c', price: 380, kind: 'police', hl: .62, hw: .35, bh: .22, ch: .22, chl: .28, cof: -.06 },
    { n: 'Candy Coupe', col: '#ff9ec8', cab: '#ffe3f0', acc: '#ff5fa2', price: 560, kind: 'coupe', hl: .62, hw: .36, bh: .2, ch: .2, chl: .24, cof: -.12 },
    { n: 'Sky Truck', col: '#9bd0ff', cab: '#e6f4ff', acc: '#5aa7f0', price: 800, kind: 'truck', hl: .74, hw: .38, bh: .22, ch: .26, chl: .2, cof: .34 },
    { n: 'Grape Racer', col: '#b79bff', cab: '#efe6ff', acc: '#7f5be8', price: 1200, kind: 'racer', hl: .68, hw: .36, bh: .16, ch: .16, chl: .18, cof: -.04 },
    { n: 'Golden Bus', col: '#ffc83d', cab: '#fff1bd', acc: '#e89a00', price: 2000, kind: 'bus', hl: .86, hw: .4, bh: .34, ch: .12, chl: .78, cof: 0 }
  ];
  const DB_THEMES = [
    { bg1: '#ff9ec4', bg2: '#ffe0c2', top: '#ffffff', top2: '#ffe9f2', l: '#d9719a', r: '#b24e78', acc: '#ffcf4a' },
    { bg1: '#7fc4ff', bg2: '#d8f2ff', top: '#ffffff', top2: '#e2f2ff', l: '#4f9be0', r: '#3678bd', acc: '#ff8fb1' },
    { bg1: '#7fe0b0', bg2: '#eaffd8', top: '#ffffff', top2: '#e6faea', l: '#42b57c', r: '#2f9362', acc: '#ffb347' },
    { bg1: '#b99cff', bg2: '#ffe0f6', top: '#ffffff', top2: '#efe6ff', l: '#8660e0', r: '#6b45c2', acc: '#5fe0b4' },
    { bg1: '#ffc84a', bg2: '#fff2c4', top: '#ffffff', top2: '#fff0cf', l: '#e09a1c', r: '#bd7a0a', acc: '#6bb8ff' },
    { bg1: '#ff8f7a', bg2: '#ffe3d8', top: '#ffffff', top2: '#ffe6df', l: '#d9604c', r: '#b24533', acc: '#7be0c0' }
  ];
  const DB_R = 1.15, DB_W = 3, DB_T = .7;
  const DB_KEY = (i, j) => i * 100003 + j;

  function mountDrift(root, api) {
    const W = 480, H = 640, S = 40, kx = S * .866, ky = S * .5, kz = S * .85, AY = H * .72;
    const view = api.canvas(W, H), cv = view.canvas, x = view.ctx;
    const au = makeAudio(api), ui = hits();
    const sv = store(api, { coins: 0, own: [0], skin: 0, best: 0, plays: 0, boost: { shield: 0, x2: 0, revive: 0 } });
    const d = sv.d;
    if (!d.boost) d.boost = { shield: 0, x2: 0, revive: 0 };
    const hover = { x: -1, y: -1 };
    const snd = {
      coin: () => { au.tone(1175, 1175, .05, 'triangle', .07); au.tone(1760, 1760, .14, 'triangle', .07, .05); },
      ui: () => au.tone(620, 840, .06, 'square', .04),
      fall: () => { au.tone(700, 90, .6, 'sine', .12); },
      power: () => { au.tone(520, 520, .08, 'square', .05); au.tone(780, 780, .08, 'square', .05, .08); au.tone(1040, 1040, .16, 'square', .05, .16); },
      pop: () => au.noise(.2, .12, 3000, 500, 'bandpass'),
      jump: () => au.tone(300, 620, .2, 'triangle', .08),
      land: () => au.noise(.1, .08, 500, 150, 'lowpass'),
      corner: () => au.tone(880, 1320, .08, 'sine', .04)
    };
    const { FONT, text: shadowText, btn, coin: coinIcon } = uiKit(x, ui, hover, () => snd.ui());

    let mode = 'menu', tm = 0, garage = d.skin, theme = 0, thT = 1, thFrom = DB_THEMES[0], cur = DB_THEMES[0], shake = 0, eng = null;
    let cells, runs, corners, car, cam, coinsA, picks, parts, marks, gen, st, hist, histT, hold = false, keyHold = new Set(), ptrHold = new Set(), ignore = false, lastTurn = 0, scrT = 0, reviveT = 0;

    function addRect(i0, j0, w, h, val, run) {
      for (let i = i0; i < i0 + w; i++) for (let j = j0; j < j0 + h; j++) { cells.set(DB_KEY(i, j), val || 1); run.keys.push(DB_KEY(i, j)); }
    }

    function initRoad() {
      cells = new Map(); runs = []; corners = []; coinsA = []; picks = []; marks = []; parts = [];
      const r0 = { keys: [], n: 0 };
      addRect(-5, 0, 17, DB_W, 1, r0); addRect(12, 0, 3, 3, 1, r0);
      runs.push(r0);
      gen = { ci: 12, cj: 0, next: 1, n: 0 };
      ensure(20);
    }

    function addRun() {
      const sc = Math.max(st ? st.score : 0, gen.n * .5);
      const run = { keys: [] };
      const Lmin = sc < 12 ? 4 : sc < 40 ? 3 : 2, Lmax = Math.min(11, 7 + sc * .04);
      let L = Math.round(rnd(Lmin, Lmax));
      const canGap = gen.n >= 6 && Math.random() < Math.min(.42, .12 + gen.n * .006);
      if (canGap) L = Math.max(L, 9 + Math.round(rnd(0, 2)));
      const { ci, cj } = gen;
      run.n = gen.n + 1;
      if (gen.next === 1) {
        corners.push({ u: ci + 1.5, v: cj + 1.5, t: 'AB' });
        addRect(ci, cj + 3, 3, L, 1, run);
        gen.cj = cj + 3 + L;
        gen.next = 0;
        decorate(run, ci + 1.5, cj + 3, L, 1, canGap);
        addRect(ci, gen.cj, 3, 3, 1, run);
      } else {
        corners.push({ u: ci + 1.5, v: cj + 1.5, t: 'BA' });
        addRect(ci + 3, cj, L, 3, 1, run);
        gen.ci = ci + 3 + L;
        gen.next = 1;
        decorate(run, ci + 3, cj + 1.5, L, 0, canGap);
        addRect(gen.ci, cj, 3, 3, 1, run);
      }
      gen.n++;
      runs.push(run);
    }

    function decorate(run, a, b, L, dirV, canGap) {
      const P = (s, side) => dirV ? [a + (side || 0), b + s] : [a + s, b + (side || 0)];
      if (canGap) {
        const g = 2, p = 4 + Math.floor(Math.random() * Math.max(1, L - g - 7));
        for (const s of [p - 1]) for (let w = 0; w < DB_W; w++) {
          const i = dirV ? Math.floor(a) - 1 + w : Math.floor(b - 1.5) + w, ci = dirV ? i : Math.floor(a + s), cj = dirV ? Math.floor(b + s) : i;
          cells.set(DB_KEY(ci, cj), 2);
        }
        for (let t = 0; t < g; t++) for (let w = 0; w < DB_W; w++) {
          const ci = dirV ? Math.floor(a) - 1 + w : Math.floor(a + p + t), cj = dirV ? Math.floor(b + p + t) : Math.floor(b - 1.5) + w;
          cells.delete(DB_KEY(ci, cj));
        }
        const s0 = 1;
        for (let k = 0; k < 3; k++) { const q = P(s0 + k * .9); coinsA.push({ u: q[0], v: q[1], z: .5, on: true }); }
        const q2 = P(p + g * .5 + .2); coinsA.push({ u: q2[0], v: q2[1], z: 1.4, on: true }, { u: q2[0] + (dirV ? 0 : .8), v: q2[1] + (dirV ? .8 : 0), z: 1.4, on: true });
        return;
      }
      if (Math.random() < .62) {
        const n = 3 + Math.floor(Math.random() * 4), s0 = 1 + Math.random() * Math.max(0, L - n - 1), off = (Math.random() - .5) * 1.2;
        for (let k = 0; k < n; k++) { const q = P(s0 + k * .85, off * Math.sin(k / Math.max(1, n - 1) * Math.PI)); coinsA.push({ u: q[0], v: q[1], z: .5, on: true }); }
      }
      if (gen.n > 3 && Math.random() < .13) {
        const kinds = ['shield', 'x2', 'revive'], k = kinds[Math.floor(Math.random() * 3)], q = P(L * .5, 0);
        picks.push({ u: q[0], v: q[1], k, on: true });
      }
    }

    function ensure(n) { while (corners.length < n) addRun(); }

    function reset(boost) {
      if (boost !== false) d.plays++;
      st = { score: 0, coins: 0, started: false, over: false, shield: 0, x2: 0, revives: 0, rec: false, t: 0, auto: 0, nextC: 0, fallT: 0 };
      initRoad();
      car = { u: 1, v: 1.5, z: 0, vz: 0, th: 0, yaw: 0, spd: 0, fall: false, spin: 0 };
      cam = { u: car.u, v: car.v };
      hist = []; histT = 0; hold = false; ignore = false; keyHold.clear(); ptrHold.clear();
      if (boost !== false && mode === 'play') {
        if (d.boost.shield > 0) { d.boost.shield--; st.shield = 1; }
        if (d.boost.x2 > 0) { d.boost.x2--; st.x2 = 25; }
        if (d.boost.revive > 0) { d.boost.revive--; st.revives = 1; }
        sv.save();
      }
      api.score(0);
      theme = 0; thT = 1; cur = DB_THEMES[0];
    }

    function curTheme() {
      const k = Math.floor(st.score / 18) % DB_THEMES.length;
      if (k !== theme) { theme = k; thFrom = cur; thT = 0; }
      return DB_THEMES[theme];
    }

    function applyTheme(dt) {
      const tg = DB_THEMES[theme];
      if (thT < 1) {
        thT = Math.min(1, thT + dt / 1.6);
        const o = {};
        for (const k in tg) o[k] = mix(thFrom[k], tg[k], ease(thT));
        cur = o;
      } else cur = tg;
    }

    function isRoad(u, v) {
      const c = cells.get(DB_KEY(Math.floor(u), Math.floor(v)));
      return c || 0;
    }

    const passed = c => c.t === 'AB' ? car.u >= c.u - .25 || car.v >= c.v + 1.5 : car.v >= c.v - .25 || car.u >= c.u + 1.5;

    function autoHold() {
      let k = Math.max(0, st.nextC - 2), c = corners[k];
      while (c && passed(c)) c = corners[++k];
      if (!c) return false;
      return c.t === 'AB' ? car.u >= c.u - DB_R : car.v < c.v - DB_R;
    }

    function wantHold() {
      return mode === 'menu' || st.auto > 0 ? autoHold() : hold;
    }

    function die(why) {
      if (st.over) return;
      snd.fall();
      st.over = true;
      st.why = why || 'FELL OFF';
      if (st.revives > 0 || d.boost.revive > 0) { mode = 'revive'; reviveT = 4.5; return; }
      endRun();
    }

    function endRun() {
      mode = 'over'; st.overT = 0;
      d.coins += st.coins;
      if (st.score > d.best) { d.best = st.score; st.rec = true; }
      api.submit(st.score);
      sv.save();
    }

    function restore(secs) {
      let s = hist[0];
      for (let i = hist.length - 1; i >= 0; i--) if (histT - hist[i].t >= secs) { s = hist[i]; break; }
      if (!s) s = { u: 1, v: 1.5, th: 0 };
      car.u = s.u; car.v = s.v; car.th = s.th; car.yaw = s.th; car.z = 0; car.vz = 0; car.fall = false; car.spin = 0;
      st.auto = 1.1; st.over = false; st.fallT = 0;
      hold = false; ignore = true;
      for (let i = 0; i < 14; i++) parts.push({ u: car.u, v: car.v, z: .4, vu: rnd(-1.5, 1.5), vv: rnd(-1.5, 1.5), vz: rnd(1, 3), l: .7, m: .7, c: '#fff', s: 4 });
    }

    function revive() {
      if (st.revives > 0) st.revives--; else if (d.boost.revive > 0) { d.boost.revive--; sv.save(); }
      restore(.9); mode = 'play'; snd.power();
    }

    function update(dt) {
      tm += dt;
      if (shake > 0) shake = Math.max(0, shake - dt);
      if (mode === 'revive') { reviveT -= dt; if (reviveT <= 0) endRun(); }
      const live = mode === 'play' || mode === 'menu' || mode === 'over' || mode === 'revive';
      if (!live) { scrT += dt; return; }
      const playing = mode === 'play' || mode === 'menu';
      const h = wantHold();
      const tgt = h ? Math.PI / 2 : 0;
      const run = playing && (mode === 'menu' || st.started) && !car.fall;
      if (run) {
        const base = 4.7 + Math.min(3.7, st.score * .045);
        car.spd += (base - car.spd) * Math.min(1, dt * 2.5);
        const w = car.spd / DB_R;
        if (car.th < tgt) car.th = Math.min(tgt, car.th + w * dt); else if (car.th > tgt) car.th = Math.max(tgt, car.th - w * dt);
        car.u += Math.cos(car.th) * car.spd * dt; car.v += Math.sin(car.th) * car.spd * dt;
        const turning = Math.abs(tgt - car.th) > .02 && car.th > .05 && car.th < Math.PI / 2 - .05;
        if (turning) {
          lastTurn += dt;
          if (lastTurn > .045) { lastTurn = 0; marks.push({ u: car.u - Math.cos(car.yaw) * .35, v: car.v - Math.sin(car.yaw) * .35, l: 4 }); if (marks.length > 90) marks.shift(); if (Math.random() < .5) parts.push({ u: car.u, v: car.v, z: .1, vu: -Math.cos(car.th) * .6 + rnd(-.3, .3), vv: -Math.sin(car.th) * .6 + rnd(-.3, .3), vz: rnd(.4, 1), l: .6, m: .6, c: '#ffffff', s: rnd(4, 8) }); }
        }
        car.yaw += (car.th + (tgt - car.th) * .55 - car.yaw) * Math.min(1, dt * 14);
      } else if (!car.fall) car.yaw += (car.th - car.yaw) * Math.min(1, dt * 10);
      if (playing || mode === 'revive' || mode === 'over') {
        if (!car.fall) {
          const c = isRoad(car.u, car.v);
          if (car.z <= 0 && car.vz <= 0) {
            if (c === 2 && run) { car.vz = 6.2; car.z = .01; snd.jump(); }
            else if (c === 0 && run) {
              if (mode === 'menu') { car.fall = true; }
              else if (st.shield > 0) { st.shield = 0; snd.pop(); restore(.8); }
              else { car.fall = true; st.fallT = 0; die(); }
            } else { car.z = 0; car.vz = 0; }
          }
        }
        if (car.z > 0 || car.vz > 0 || car.fall) {
          const pz = car.z;
          car.vz -= 16 * dt; car.z += car.vz * dt;
          if (car.fall) { car.spin += dt * 2.2; car.u += Math.cos(car.th) * car.spd * dt * .6; car.v += Math.sin(car.th) * car.spd * dt * .6; car.yaw += dt * 2; st.fallT += dt; }
          else if (car.z <= 0) {
            const c = isRoad(car.u, car.v);
            if (c) { car.z = 0; car.vz = 0; snd.land(); shake = .08; for (let i = 0; i < 8; i++) parts.push({ u: car.u, v: car.v, z: .05, vu: rnd(-1.5, 1.5), vv: rnd(-1.5, 1.5), vz: rnd(.5, 1.5), l: .5, m: .5, c: '#ffffff', s: 5 }); }
            else if (mode === 'menu') car.fall = true;
            else if (st.shield > 0) { st.shield = 0; snd.pop(); restore(.8); }
            else { car.fall = true; st.fallT = 0; die(); }
          }
        }
        if (car.fall && car.z < -9 && mode === 'menu') { reset(false); }
      }
      if (mode === 'play' || mode === 'menu') {
        const c0 = corners[st.nextC];
        if (c0 && passed(c0) && !car.fall) {
          st.nextC++;
          if (mode === 'play') { st.score++; api.score(st.score); snd.corner(); ensure(st.score + 14); }
          else ensure(st.nextC + 14);
          while (runs[0].n < st.nextC - 3) { for (const k of runs.shift().keys) cells.delete(k); }
          if (coinsA.length > 120) coinsA.splice(0, coinsA.length - 120);
          if (picks.length > 20) picks.splice(0, picks.length - 20);
        }
        if (mode === 'play' && !car.fall) {
          st.t += dt;
          if (st.x2 > 0) st.x2 -= dt;
          if (st.auto > 0) st.auto -= dt;
          for (const q of coinsA) if (q.on && Math.abs(q.u - car.u) < 1 && Math.abs(q.v - car.v) < 1 && Math.hypot(q.u - car.u, q.v - car.v, (q.z - car.z - .3) * .8) < .85) {
            q.on = false; const g = st.x2 > 0 ? 2 : 1; st.coins += g; snd.coin();
            for (let i = 0; i < 5; i++) parts.push({ u: q.u, v: q.v, z: q.z, vu: rnd(-1, 1), vv: rnd(-1, 1), vz: rnd(.5, 2), l: .4, m: .4, c: '#ffd23f', s: 4 });
          }
          for (const q of picks) if (q.on && Math.hypot(q.u - car.u, q.v - car.v) < .95) {
            q.on = false; snd.power();
            if (q.k === 'shield') st.shield = 1; else if (q.k === 'x2') st.x2 = 20; else st.revives++;
          }
          histT += dt;
          if (histT - (hist.length ? hist[hist.length - 1].t : -1) >= .08 && !car.fall && car.z <= 0 && isRoad(car.u, car.v)) { hist.push({ t: histT, u: car.u, v: car.v, th: car.th }); if (hist.length > 40) hist.shift(); }
        }
      }
      const tl = Math.min(1, dt * 6);
      cam.u += (car.u - cam.u) * tl; cam.v += (car.v - cam.v) * tl;
      parts.forEach(p => { p.u += p.vu * dt; p.v += p.vv * dt; p.z += p.vz * dt; p.vz -= 3 * dt; p.l -= dt; });
      parts = parts.filter(p => p.l > 0);
      marks.forEach(m => { m.l -= dt; });
      while (marks.length && marks[0].l <= 0) marks.shift();
      curTheme(); applyTheme(dt);
      if (st.over && mode === 'over') st.overT += dt;
      engine((mode === 'play' && st.started && !car.fall), car.spd, Math.abs(car.th - (car.yaw)) );
    }

    function engine(on, spd, sl) {
      if (api.muted) { if (eng) eng.g.gain.value = 0; return; }
      const ctx = au.get();
      if (!ctx) return;
      if (!eng) {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
        o.connect(f); f.connect(g); g.connect(au.out()); o.start();
        eng = { o, f, g };
      }
      const t = ctx.currentTime;
      eng.o.frequency.setTargetAtTime(60 + spd * 9, t, .08);
      eng.f.frequency.setTargetAtTime(300 + spd * 60, t, .1);
      eng.g.gain.setTargetAtTime(on ? .03 : 0, t, .1);
    }

    const P = (u, v, z) => [W / 2 + ((u - cam.u) - (v - cam.v)) * kx, AY - ((u - cam.u) + (v - cam.v)) * ky - z * kz];
    const poly = (pts, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); x.fill(); };
    const shade = (col, t) => mix(col, '#000000', t);

    function prism(cu, cvv, z0, h, hl, hw, yaw, col) {
      const cs = Math.cos(yaw), sn = Math.sin(yaw);
      const loc = [[hl, hw], [hl, -hw], [-hl, -hw], [-hl, hw]];
      const w = loc.map(q => [cu + q[0] * cs - q[1] * sn, cvv + q[0] * sn + q[1] * cs]);
      for (let k = 0; k < 4; k++) {
        const a = w[k], b = w[(k + 1) % 4], nu = (a[0] + b[0]) / 2 - cu, nv = (a[1] + b[1]) / 2 - cvv, nl = Math.hypot(nu, nv) || 1, uu = nu / nl, vv = nv / nl;
        if (uu + vv >= -.02) continue;
        poly([P(a[0], a[1], z0 + h), P(b[0], b[1], z0 + h), P(b[0], b[1], z0), P(a[0], a[1], z0)], shade(col, .2 - .09 * (vv - uu)));
      }
      poly(w.map(q => P(q[0], q[1], z0 + h)), col);
    }

    function drawCell(i, j, val) {
      const T = cur;
      const p00 = P(i, j, 0), p10 = P(i + 1, j, 0), p11 = P(i + 1, j + 1, 0), p01 = P(i, j + 1, 0);
      if (!cells.has(DB_KEY(i - 1, j))) poly([p00, p01, [p01[0], p01[1] + DB_T * kz], [p00[0], p00[1] + DB_T * kz]], T.l);
      if (!cells.has(DB_KEY(i, j - 1))) poly([p00, p10, [p10[0], p10[1] + DB_T * kz], [p00[0], p00[1] + DB_T * kz]], T.r);
      poly([p00, p10, p11, p01], val === 2 ? T.acc : ((i + j) & 1 ? T.top : T.top2));
      if (val === 2) {
        const au_ = cells.get(DB_KEY(i, j + 1)) === 2 || cells.get(DB_KEY(i, j - 1)) === 2, du = au_ ? 1 : 0, dv = au_ ? 0 : 1;
        const m = (a, b, w) => P(i + .5 + du * a + dv * b * w, j + .5 + dv * a + du * b * w, 0);
        x.strokeStyle = '#ffffffdd'; x.lineWidth = 5; x.lineJoin = 'round'; x.lineCap = 'round';
        for (const o of [-.22, .2]) {
          const t = m(o + .22, 0, 1), l = m(o - .08, .34, 1), r = m(o - .08, -.34, 1);
          x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(t[0], t[1]); x.lineTo(r[0], r[1]); x.stroke();
        }
      }
    }

    function drawCar() {
      const k0 = DB_SKINS[mode === 'garage' ? garage : d.skin], yaw = car.yaw, Z = 1.28;
      const k = Object.assign({}, k0, { hl: k0.hl * Z, hw: k0.hw * Z, bh: k0.bh * Z, ch: k0.ch * Z, chl: k0.chl * Z, cof: k0.cof * Z });
      const cs = Math.cos(yaw), sn = Math.sin(yaw);
      const u = car.u, v = car.v, z = Math.max(car.z, car.fall ? car.z : 0);
      const at = (off, lat) => [u + cs * off - sn * lat, v + sn * off + cs * lat];
      if (!car.fall && car.z > .01) {
        const g = P(u, v, 0), sc = clamp(1 - car.z * .3, .4, 1);
        x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(g[0], g[1], 20 * sc, 9 * sc, 0, 0, TAU); x.fill();
      } else if (!car.fall) {
        const g = P(u, v, 0);
        x.fillStyle = 'rgba(0,0,0,.14)'; x.beginPath(); x.ellipse(g[0], g[1] + 1, 21, 9, 0, 0, TAU); x.fill();
      }
      for (const sx of [-.58, .58]) for (const sy of [-1, 1]) { const q = at(k.hl * sx, k.hw * sy); prism(q[0], q[1], z, .26, .16, .09, yaw, '#4a4560'); }
      prism(u, v, z + .08, k.bh, k.hl, k.hw, yaw, k.col);
      const cq = at(k.cof, 0);
      if (k.kind === 'truck') {
        const bq = at(-.3, 0);
        prism(bq[0], bq[1], z + .08 + k.bh, .2, .4, k.hw - .02, yaw, shade(k.col, .06));
      }
      prism(cq[0], cq[1], z + .08 + k.bh, k.ch, k.chl, k.hw - .06, yaw, k.cab);
      if (k.kind === 'taxi') { const q = at(k.cof, 0); prism(q[0], q[1], z + .08 + k.bh + k.ch, .1, .1, .12, yaw, k.acc); }
      if (k.kind === 'police') { const q = at(k.cof, 0); prism(q[0], q[1], z + .08 + k.bh + k.ch, .08, .08, .2, yaw, '#ff5d6c'); const q2 = at(k.cof, .1); prism(q2[0], q2[1], z + .08 + k.bh + k.ch, .08, .08, .1, yaw, '#5d8bff'); }
      if (k.kind === 'racer') { const q = at(-k.hl + .06, 0); prism(q[0], q[1], z + .08 + k.bh, .12, .06, k.hw, yaw, k.acc); }
      if (k.kind === 'bus') { const q = at(0, 0); prism(q[0], q[1], z + .08 + k.bh + k.ch, .05, k.chl - .1, k.hw - .12, yaw, k.acc); }
      const hl = at(k.hl, k.hw * .6), hr = at(k.hl, -k.hw * .6);
      for (const q of [hl, hr]) prism(q[0], q[1], z + .12, .08, .03, .06, yaw, '#fff7b0');
      if (st && st.shield > 0 && mode !== 'garage') {
        const c = P(u, v, z + .3);
        x.strokeStyle = 'rgba(120,200,255,.9)'; x.lineWidth = 3; x.fillStyle = 'rgba(160,220,255,.22)';
        x.beginPath(); x.ellipse(c[0], c[1], 34 + Math.sin(tm * 6) * 1.5, 30, 0, 0, TAU); x.fill(); x.stroke();
      }
    }

    function bgDraw() {
      const T = cur;
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, T.bg1); g.addColorStop(1, T.bg2);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 6; i++) {
        const px = ((i * 197 - (cam.u - cam.v) * 6 + 4000) % (W + 200)) - 100, py = ((i * 131 + (cam.u + cam.v) * 8) % (H + 160)) - 80;
        x.beginPath(); x.arc(px, py, 38 + (i % 3) * 22, 0, TAU); x.fill();
      }
    }

    function drawWorld() {
      bgDraw();
      x.save();
      if (shake > 0) x.translate(rnd(-1, 1) * shake * 30, rnd(-1, 1) * shake * 30);
      const Dmax = (AY + 70) / ky, Dmin = (AY - H - 70) / ky, Dx = (W / 2 + 90) / kx;
      const base = cam.u + cam.v, dif = cam.u - cam.v;
      const hi = Math.ceil(base + Dmax), lo = Math.floor(base + Dmin);
      const carSum = car.u + car.v, carLate = car.z < -.1 || car.fall;
      let carDone = false;
      for (let dd = hi; dd >= lo; dd--) {
        if (carLate && !carDone && dd <= Math.floor(carSum)) { drawCar(); carDone = true; }
        const i0 = Math.ceil((dd + dif - Dx) / 2), i1 = Math.floor((dd + dif + Dx) / 2);
        for (let i = i0; i <= i1; i++) {
          const j = dd - i, c = cells.get(DB_KEY(i, j));
          if (c) drawCell(i, j, c);
        }
      }
      drawMarks(); drawItems();
      if (!carDone) drawCar();
      for (const p of parts) {
        const q = P(p.u, p.v, p.z);
        x.globalAlpha = clamp(p.l / p.m, 0, 1); x.fillStyle = p.c; x.beginPath(); x.arc(q[0], q[1], p.s * (.6 + .4 * p.l / p.m), 0, TAU); x.fill();
      }
      x.globalAlpha = 1;
      x.restore();
      const fg = x.createLinearGradient(0, 0, 0, H * .3); fg.addColorStop(0, cur.bg1); fg.addColorStop(1, 'rgba(255,255,255,0)');
      x.globalAlpha = .9; x.fillStyle = fg; x.fillRect(0, 0, W, H * .3); x.globalAlpha = 1;
    }

    function drawMarks() {
      x.fillStyle = 'rgba(70,50,90,.28)';
      for (const m of marks) {
        const q = P(m.u, m.v, .005);
        x.globalAlpha = clamp(m.l / 2, 0, 1) * .8;
        x.beginPath(); x.ellipse(q[0], q[1], 4, 2, 0, 0, TAU); x.fill();
      }
      x.globalAlpha = 1;
    }

    function drawItems() {
      for (const q of coinsA) {
        if (!q.on) continue;
        const p = P(q.u, q.v, q.z + Math.sin(tm * 3 + q.u) * .06);
        if (p[1] < -30 || p[1] > H + 30 || p[0] < -30 || p[0] > W + 30) continue;
        const sc = Math.abs(Math.cos(tm * 3 + q.u * .7));
        x.fillStyle = 'rgba(0,0,0,.12)'; const g = P(q.u, q.v, 0); x.beginPath(); x.ellipse(g[0], g[1], 8, 4, 0, 0, TAU); x.fill();
        x.fillStyle = '#e0a800'; x.beginPath(); x.ellipse(p[0], p[1], 9 * sc + 1.5, 10, 0, 0, TAU); x.fill();
        x.fillStyle = '#ffd23f'; x.beginPath(); x.ellipse(p[0], p[1], 6.5 * sc + 1, 7.5, 0, 0, TAU); x.fill();
      }
      for (const q of picks) {
        if (!q.on) continue;
        const p = P(q.u, q.v, .6 + Math.sin(tm * 3) * .08);
        const col = q.k === 'shield' ? '#5ab8ff' : q.k === 'x2' ? '#ffb020' : '#ff5d8a';
        x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(p[0], p[1], 17, 0, TAU); x.fill();
        x.fillStyle = col; x.beginPath(); x.arc(p[0], p[1], 14, 0, TAU); x.fill();
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
        if (q.k === 'x2') { x.font = `900 14px ${FONT}`; x.fillText('x2', p[0], p[1] + 1); }
        else if (q.k === 'shield') { x.beginPath(); x.moveTo(p[0], p[1] - 8); x.lineTo(p[0] + 7, p[1] - 5); x.lineTo(p[0] + 6, p[1] + 3); x.lineTo(p[0], p[1] + 8); x.lineTo(p[0] - 6, p[1] + 3); x.lineTo(p[0] - 7, p[1] - 5); x.closePath(); x.fill(); }
        else { heart(p[0], p[1] + 1, 8); }
      }
    }

    function heart(px, py, r) {
      x.fillStyle = '#fff'; x.beginPath(); x.moveTo(px, py + r * .9);
      x.bezierCurveTo(px - r * 1.4, py - r * .1, px - r * .8, py - r * 1.1, px, py - r * .4);
      x.bezierCurveTo(px + r * .8, py - r * 1.1, px + r * 1.4, py - r * .1, px, py + r * .9); x.fill();
    }

    function drawHud() {
      shadowText(String(st.score), W / 2, 64, 74, '#ffffff', 'center', 900);
      coinIcon(30, 36, 13); shadowText(String(d.coins + st.coins), 50, 37, 26, '#fff');
      x.fillStyle = 'rgba(0,0,0,.15)'; x.beginPath(); x.roundRect(W - 62, 16, 42, 42, 13); x.fill();
      x.fillStyle = '#fff'; x.fillRect(W - 51, 28, 7, 18); x.fillRect(W - 38, 28, 7, 18);
      ui.add(W - 62, 16, 42, 42, pauseKey);
      let by = 108;
      const chip = (label, col, frac) => {
        x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.roundRect(20, by, 92, 26, 13); x.fill();
        x.fillStyle = col; x.beginPath(); x.roundRect(23, by + 3, Math.max(20, 86 * frac), 20, 10); x.fill();
        shadowText(label, 66, by + 14, 14, '#fff', 'center', 900); by += 32;
      };
      if (st.shield > 0) chip('SHIELD', '#5ab8ff', 1);
      if (st.x2 > 0) chip('x2 ' + Math.ceil(st.x2) + 's', '#ffb020', clamp(st.x2 / 25, 0, 1));
      if (st.revives > 0 || d.boost.revive > 0) chip('REVIVE ' + (st.revives + d.boost.revive), '#ff5d8a', 1);
      if (!st.started) {
        shadowText('TAP / HOLD to start', W / 2, 150, 28, '#fff', 'center', 900);
        shadowText('Hold to drift around corners. Release to go straight.', W / 2, 186, 15, 'rgba(70,40,90,.75)', 'center', 700);
        shadowText('Space / Up / Mouse / Touch', W / 2, 208, 14, 'rgba(70,40,90,.6)', 'center', 700);
      }
    }

    function drawMenu() {
      shadowText('DRIFT', W / 2, 108, 84, '#ffffff', 'center', 900);
      shadowText('BOSS', W / 2, 184, 84, cur.acc, 'center', 900);
      btn(W / 2 - 110, 400, 220, 70, 'PLAY', () => { mode = 'play'; reset(); }, { fs: 34, col: '#ff7aa8', dk: '#c9507a' });
      btn(W / 2 - 110, 490, 220, 52, 'GARAGE', () => { garage = d.skin; mode = 'garage'; }, { col: '#7ab8ff', dk: '#4a85d0' });
      coinIcon(30, 36, 13); shadowText(String(d.coins), 50, 37, 26, '#fff');
      shadowText('BEST ' + d.best, W - 24, 38, 24, '#fff', 'right');
      shadowText('Space / click to start', W / 2, 600, 14, 'rgba(70,40,90,.55)', 'center', 700);
    }

    function drawOver() {
      const e = ease(clamp(st.overT * 2.5, 0, 1));
      x.fillStyle = `rgba(60,30,90,${.35 * e})`; x.fillRect(0, 0, W, H);
      x.save(); x.globalAlpha = e; x.translate(0, (1 - e) * 30);
      x.fillStyle = '#fffaf5'; x.beginPath(); x.roundRect(W / 2 - 190, 130, 380, 380, 28); x.fill();
      x.strokeStyle = cur.l; x.lineWidth = 4; x.stroke();
      shadowText(st.why, W / 2, 178, 30, '#e0507a', 'center', 900);
      x.font = `700 15px ${FONT}`; x.fillStyle = '#7a6a8a'; x.textAlign = 'center'; x.fillText('SCORE', W / 2, 224);
      x.font = `900 84px ${FONT}`; x.fillStyle = '#4a3a6a'; x.fillText(String(st.score), W / 2, 280);
      x.font = `800 18px ${FONT}`; x.fillStyle = st.rec ? '#e0507a' : '#7a6a8a'; x.fillText(st.rec ? 'NEW BEST!' : 'BEST ' + d.best, W / 2, 334);
      coinIcon(W / 2 - 40, 376, 14); x.textAlign = 'left'; x.fillStyle = '#4a3a6a'; x.font = `800 28px ${FONT}`; x.fillText('+' + st.coins, W / 2 - 18, 377);
      btn(W / 2 - 170, 420, 160, 58, 'RETRY', () => { mode = 'play'; reset(); }, { col: '#ff7aa8', dk: '#c9507a' });
      btn(W / 2 + 10, 420, 160, 58, 'GARAGE', () => { garage = d.skin; mode = 'garage'; reset(false); }, { col: '#7ab8ff', dk: '#4a85d0' });
      x.restore();
    }

    function drawRevive() {
      x.fillStyle = 'rgba(60,30,90,.35)'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#fffaf5'; x.beginPath(); x.roundRect(W / 2 - 170, 190, 340, 260, 28); x.fill();
      shadowText('REVIVE?', W / 2, 238, 40, '#e0507a', 'center', 900);
      x.strokeStyle = '#ff7aa8'; x.lineWidth = 8; x.lineCap = 'round';
      x.beginPath(); x.arc(W / 2, 318, 34, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(reviveT / 4.5, 0, 1)); x.stroke();
      x.fillStyle = '#4a3a6a'; x.font = `900 30px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(Math.ceil(reviveT)), W / 2, 319);
      btn(W / 2 - 150, 372, 150, 52, 'REVIVE', revive, { col: '#ff7aa8', dk: '#c9507a', fs: 22 });
      btn(W / 2 + 10, 372, 130, 52, 'SKIP', endRun, { col: '#a99bc0', dk: '#7a6a90', fs: 22 });
    }

    function drawGarage() {
      bgDraw();
      const k = DB_SKINS[garage], own = d.own.includes(garage);
      shadowText('GARAGE', W / 2, 52, 44, '#fff', 'center', 900);
      coinIcon(30, 100, 13); shadowText(String(d.coins), 50, 101, 26, '#fff');
      const sv0 = { u: car.u, v: car.v, z: car.z, yaw: car.yaw, fall: car.fall }, sc = cam.u, sd = cam.v;
      cam.u = 0; cam.v = 0; car.u = 0; car.v = 0; car.z = 0; car.fall = false; car.yaw = Math.PI / 4 + Math.sin(tm * .7) * .6;
      x.save(); x.translate(W / 2, 250); x.scale(1.9, 1.9); x.translate(-W / 2, -AY + 8);
      x.fillStyle = cur.l; x.beginPath(); x.ellipse(W / 2, AY + 8, 44, 21, 0, 0, TAU); x.fill();
      x.fillStyle = cur.top; x.beginPath(); x.ellipse(W / 2, AY + 2, 44, 21, 0, 0, TAU); x.fill();
      drawCar();
      x.restore();
      car.u = sv0.u; car.v = sv0.v; car.z = sv0.z; car.yaw = sv0.yaw; car.fall = sv0.fall; cam.u = sc; cam.v = sd;
      shadowText(k.n.toUpperCase(), W / 2, 372, 30, '#fff', 'center', 900);
      const bw = 200;
      if (own) { const eq = d.skin === garage; btn(W / 2 - bw / 2, 396, bw, 44, eq ? 'SELECTED' : 'SELECT', () => { d.skin = garage; sv.save(); }, { col: eq ? '#3ddc84' : '#ff7aa8', dk: eq ? '#1e9c5a' : '#c9507a', fs: 20 }); }
      else { const can = d.coins >= k.price; btn(W / 2 - bw / 2, 396, bw, 44, k.price + ' COINS', () => { if (can) { d.coins -= k.price; d.own.push(garage); d.skin = garage; sv.save(); snd.coin(); } }, { col: can ? '#ff7aa8' : '#b0a8bc', dk: can ? '#c9507a' : '#8a8298', fs: 20 }); }
      btn(28, 380, 64, 64, '<', () => { garage = (garage + DB_SKINS.length - 1) % DB_SKINS.length; }, { col: '#7ab8ff', dk: '#4a85d0', fs: 38 });
      btn(W - 92, 380, 64, 64, '>', () => { garage = (garage + 1) % DB_SKINS.length; }, { col: '#7ab8ff', dk: '#4a85d0', fs: 38 });
      const items = [['shield', 'SHIELD', 60, '#5ab8ff'], ['x2', 'x2 COINS', 90, '#ffb020'], ['revive', 'REVIVE', 120, '#ff5d8a']];
      shadowText('BOOSTERS (next run)', W / 2, 478, 17, '#fff', 'center', 800);
      items.forEach((it, i) => {
        const bx = 24 + i * 146, by = 496, can = d.coins >= it[2];
        x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.roundRect(bx, by, 136, 100, 16); x.fill();
        x.fillStyle = it[3]; x.beginPath(); x.arc(bx + 24, by + 24, 14, 0, TAU); x.fill();
        x.fillStyle = '#4a3a6a'; x.font = `800 14px ${FONT}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(it[1], bx + 44, by + 20);
        x.font = `700 13px ${FONT}`; x.fillStyle = '#7a6a8a'; x.fillText('owned ' + d.boost[it[0]], bx + 44, by + 38);
        btn(bx + 8, by + 54, 120, 34, it[2] + ' COINS', () => { if (can) { d.coins -= it[2]; d.boost[it[0]]++; sv.save(); snd.coin(); } }, { col: can ? '#ff7aa8' : '#b0a8bc', dk: can ? '#c9507a' : '#8a8298', fs: 14 });
      });
      btn(16, 14, 110, 40, 'BACK', () => { mode = 'menu'; reset(false); }, { col: '#a99bc0', dk: '#7a6a90', fs: 18 });
    }

    function draw() {
      ui.begin();
      if (mode === 'garage') { drawGarage(); return; }
      drawWorld();
      if (mode === 'menu') drawMenu();
      else { drawHud(); if (mode === 'revive') drawRevive(); if (mode === 'over') drawOver(); }
    }

    const KS = new Set(['Space', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'KeyW', 'KeyD', 'KeyZ', 'KeyX']);
    function press() {
      if (mode === 'menu') { mode = 'play'; reset(); st.started = true; ignore = true; return; }
      if (mode === 'play') { if (!st.started) { st.started = true; ignore = true; } }
      sync();
    }
    function sync() { hold = (keyHold.size > 0 || ptrHold.size > 0) && !ignore; if (keyHold.size === 0 && ptrHold.size === 0) ignore = false; }
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (KS.has(e.code)) {
        e.preventDefault();
        if (e.repeat) return;
        if (mode === 'over') { mode = 'play'; reset(); return; }
        if (mode === 'revive' && e.code === 'Space') { revive(); return; }
        keyHold.add(e.code); press();
      } else if (e.code === 'Enter' && mode === 'over') { mode = 'play'; reset(); }
      else if (e.code === 'KeyR' && mode === 'play') { reset(); }
    });
    api.on(window, 'keyup', e => { keyHold.delete(e.code); sync(); });
    api.on(window, 'blur', () => { keyHold.clear(); ptrHold.clear(); sync(); });
    pointers(api, view, {
      down(p) {
        hover.x = p.x; hover.y = p.y;
        if (ui.hit(p.x, p.y)) { p.ui = true; return; }
        if (mode === 'menu') { press(); ptrHold.add(p.id); return; }
        if (mode === 'play') { ptrHold.add(p.id); press(); }
      },
      move(p) { hover.x = p.x; hover.y = p.y; },
      up(p) { ptrHold.delete(p.id); sync(); }
    });
    api.on(cv, 'pointerleave', () => { hover.x = -1; hover.y = -1; });
    mode = 'menu';
    reset(false);
    api.loop(dt => { update(Math.min(dt, .05)); draw(); });
    api.score(0);
    if (api.label) api.label('SCORE');
    return { destroy() { if (eng) { try { eng.o.stop(); eng.g.disconnect(); } catch (e) {} eng = null; } } };
  }

  Ameplay.register({
    id: 'drift-boss',
    title: 'Drift Boss',
    category: 'Racing',
    tint: '#ff7aa8',
    blurb: 'Hold to drift around the corners of a floating zig-zag road, release to go straight. One mistake and you fall. Collect coins, shields and revives, and unlock new cars.',
    help: 'Hold <kbd>Space</kbd> / <kbd>↑</kbd> / mouse / touch to turn, release to go straight',
    better: 'high',
    width: 520,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 48l14-8h16l-10-6 10-6h18"/><path d="M8 48l14 8h16l14-8"/><path d="M40 28l12-6-12-6-12 6z" fill="currentColor"/></svg>',
    css: `.gm-drift-boss .g-canvas{background:#ffd6e8;border-radius:12px}`,
    mount: mountDrift
  });
})();
