(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const q = (r, s) => r.querySelector(s);
  const qa = (r, s) => Array.from(r.querySelectorAll(s));
  const fmtT = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const cleanText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);

  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const B64I = {};
  for (let i = 0; i < 64; i++) B64I[B64[i]] = i;
  const vi = n => {
    n = n < 0 ? ((-n) << 1) - 1 : n << 1;
    let s = '';
    while (n >= 32) { s += B64[32 | (n & 31)]; n >>>= 5; }
    return s + B64[n];
  };
  function encPts(a) {
    let s = '', px = 0, py = 0;
    for (let i = 0; i < a.length; i += 3) {
      s += vi(a[i] - px) + vi(a[i + 1] - py) + B64[a[i + 2]];
      px = a[i]; py = a[i + 1];
    }
    return s;
  }
  function decPts(s) {
    const a = [];
    let i = 0, px = 0, py = 0;
    s = String(s || '');
    const rd = () => {
      let r = 0, sh = 0, v;
      do { v = B64I[s[i++]] | 0; r += (v & 31) * Math.pow(2, sh); sh += 5; } while (v >= 32 && i < s.length && sh < 30);
      return r % 2 ? -((r + 1) / 2) : r / 2;
    };
    while (i < s.length && a.length < 60000) {
      px += rd(); py += rd();
      a.push(px / 2, py / 2, (B64I[s[i++]] | 0) / 63);
    }
    return a;
  }
  const hexOk = h => /^[0-9a-fA-F]{6}$/.test(h) ? h : '000000';

  class Pen {
    constructor(ctx, k, col, size) {
      this.c = ctx; this.k = k; this.col = col; this.sz = clamp(+size || 4, 1, 120);
      this.n = 0; this.sx = 0; this.sy = 0; this.mx = 0; this.my = 0; this.w = 0; this.rx = 0; this.ry = 0; this.rw = 0;
    }
    wd(p) { return Math.max(.6, this.sz * (.35 + .65 * p)); }
    dot(x, y, w) {
      const c = this.c, k = this.k;
      c.beginPath(); c.arc(x * k, y * k, Math.max(.3, w * k / 2), 0, TAU); c.fill();
    }
    seg(x0, y0, cx, cy, x1, y1, w0, w1) {
      const len = Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy);
      const n = Math.max(1, Math.ceil(len / Math.max(.5, Math.min(w0, w1) * .28)));
      for (let i = 1; i <= n; i++) {
        const t = i / n, u = 1 - t;
        this.dot(u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1, w0 + (w1 - w0) * t);
      }
    }
    add(x, y, p) {
      const tw = this.wd(p);
      this.rx = x; this.ry = y;
      if (!this.n++) {
        this.c.fillStyle = this.col;
        this.sx = this.mx = x; this.sy = this.my = y; this.w = tw;
        this.dot(x, y, tw);
        return;
      }
      const nx = this.sx + (x - this.sx) * .55, ny = this.sy + (y - this.sy) * .55, nw = this.w + (tw - this.w) * .45;
      const mx = (this.sx + nx) / 2, my = (this.sy + ny) / 2;
      this.seg(this.mx, this.my, this.sx, this.sy, mx, my, this.w, (this.w + nw) / 2);
      this.sx = nx; this.sy = ny; this.mx = mx; this.my = my; this.w = nw;
    }
    end() {
      if (this.n > 1) this.seg(this.mx, this.my, this.sx, this.sy, this.rx, this.ry, this.w, this.w);
      this.n = 0;
    }
  }

  function drawShape(c, k, op) {
    const t = op[0], col = '#' + hexOk(op[1]), sz = clamp(+op[2] || 4, 1, 120) * k;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = sz; c.strokeStyle = col; c.fillStyle = col;
    if (t === 2) {
      c.beginPath(); c.moveTo(op[3] / 2 * k, op[4] / 2 * k); c.lineTo(op[5] / 2 * k, op[6] / 2 * k); c.stroke();
      return;
    }
    const filled = op[3], x0 = op[4] / 2 * k, y0 = op[5] / 2 * k, x1 = op[6] / 2 * k, y1 = op[7] / 2 * k;
    c.beginPath();
    if (t === 3) c.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    else c.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.max(.1, Math.abs(x1 - x0) / 2), Math.max(.1, Math.abs(y1 - y0) / 2), 0, 0, TAU);
    if (filled) c.fill();
    c.stroke();
  }

  function floodFill(ctx, x, y, hex, tol) {
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    x = clamp(Math.round(x), 0, cw - 1); y = clamp(Math.round(y), 0, ch - 1);
    const img = ctx.getImageData(0, 0, cw, ch), a = img.data;
    const i0 = (y * cw + x) * 4, sr = a[i0], sg = a[i0 + 1], sb = a[i0 + 2];
    const fr = parseInt(hex.slice(0, 2), 16), fg = parseInt(hex.slice(2, 4), 16), fb = parseInt(hex.slice(4, 6), 16);
    if (Math.abs(sr - fr) + Math.abs(sg - fg) + Math.abs(sb - fb) < 10) return;
    const dist = p => Math.abs(a[p] - sr) + Math.abs(a[p + 1] - sg) + Math.abs(a[p + 2] - sb);
    const mask = new Uint8Array(cw * ch), stack = [x, y];
    while (stack.length) {
      const yy = stack.pop(), xx = stack.pop(), row = yy * cw;
      if (mask[row + xx] || dist((row + xx) * 4) > tol) continue;
      let l = xx, r = xx;
      while (l > 0 && !mask[row + l - 1] && dist((row + l - 1) * 4) <= tol) l--;
      while (r < cw - 1 && !mask[row + r + 1] && dist((row + r + 1) * 4) <= tol) r++;
      for (let i = l; i <= r; i++) mask[row + i] = 1;
      for (let d = -1; d <= 1; d += 2) {
        const ny = yy + d;
        if (ny < 0 || ny >= ch) continue;
        let run = false;
        for (let i = l; i <= r; i++) {
          const pp = ny * cw + i, ok = !mask[pp] && dist(pp * 4) <= tol;
          if (ok && !run) { stack.push(i, ny); run = true; } else if (!ok) run = false;
        }
      }
    }
    const grow = [];
    for (let yy = 0; yy < ch; yy++) {
      for (let xx = 0; xx < cw; xx++) {
        const p = yy * cw + xx;
        if (mask[p]) continue;
        if ((xx > 0 && mask[p - 1]) || (xx < cw - 1 && mask[p + 1]) || (yy > 0 && mask[p - cw]) || (yy < ch - 1 && mask[p + cw])) {
          if (dist(p * 4) <= tol * 3.4) grow.push(p);
        }
      }
    }
    grow.forEach(p => { mask[p] = 1; });
    for (let p = 0, n = cw * ch; p < n; p++) {
      if (!mask[p]) continue;
      const i = p * 4;
      a[i] = fr; a[i + 1] = fg; a[i + 2] = fb; a[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  class Board {
    constructor(w, h, sc) {
      this.w = w; this.h = h; this.sc = sc || 1;
      this.cv = document.createElement('canvas');
      this.cv.width = Math.round(w * this.sc); this.cv.height = Math.round(h * this.sc);
      this.ctx = this.cv.getContext('2d');
      this.ops = [];
      this.pen = null; this.pk = -1; this.pn = 0;
      this.blank();
    }
    blank() {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    }
    apply(op) {
      const c = this.ctx, k = this.sc, t = op[0];
      if (t === 0) {
        const pen = new Pen(c, k, '#' + hexOk(op[1]), op[2]), a = decPts(op[3]);
        for (let i = 0; i < a.length; i += 3) pen.add(a[i], a[i + 1], a[i + 2]);
        pen.end();
      } else if (t === 1) floodFill(c, op[2] / 2 * k, op[3] / 2 * k, hexOk(op[1]), 96);
      else if (t === 5) this.blank();
      else if (t >= 2 && t <= 4) drawShape(c, k, op);
    }
    add(op) { this.dropLive(); this.ops.push(op); this.apply(op); }
    rebuild() {
      this.dropLive();
      let s = 0;
      for (let i = this.ops.length - 1; i >= 0; i--) if (this.ops[i][0] === 5) { s = i; break; }
      this.blank();
      for (let i = s; i < this.ops.length; i++) this.apply(this.ops[i]);
    }
    undo() { if (!this.ops.length) return null; this.dropLive(); const o = this.ops.pop(); this.rebuild(); return o; }
    setOps(ops) { this.ops = ops.slice(0, 4000); this.rebuild(); }
    dropLive() { if (this.pen) { this.pen = null; this.pk = -1; } }
    live(m) {
      if (!m || typeof m.k !== 'number') return;
      if (m.k !== this.pk) {
        if (this.pen) this.pen.end();
        if (m.i !== 0) { this.pen = null; this.pk = m.k; this.pn = -1; return; }
        this.pen = new Pen(this.ctx, this.sc, '#' + hexOk(m.c), m.z); this.pk = m.k; this.pn = 0;
      }
      if (!this.pen || m.i !== this.pn) { if (this.pen) { this.pen = null; this.pn = -1; } return; }
      this.pn++;
      const a = decPts(m.p);
      for (let i = 0; i < a.length; i += 3) this.pen.add(a[i], a[i + 1], a[i + 2]);
    }
    commit(op, k) {
      const ok = this.pen && this.pk === k && op[0] === 0;
      if (ok) { this.pen.end(); this.pen = null; this.pk = -1; this.ops.push(op); return; }
      this.pk = -1; this.pen = null;
      this.ops.push(op);
      if (op[0] === 0) this.rebuild(); else this.apply(op);
    }
  }

  const opUnits = op => op[0] === 0 ? Math.max(1, op[3].length / 4) : op[0] === 5 ? 2 : 14;
  class Replay {
    constructor(board, ops, onFrame) {
      this.b = board; this.ops = ops; this.i = 0; this.pen = null; this.a = null; this.pi = 0; this.done = false; this.f = onFrame;
      this.total = ops.reduce((s, o) => s + opUnits(o), 0);
      this.acc = 0;
      board.blank();
    }
    step(units) {
      this.acc += units;
      while (this.acc > 0 && this.i < this.ops.length) {
        const op = this.ops[this.i];
        if (op[0] === 0) {
          if (!this.pen) { this.pen = new Pen(this.b.ctx, this.b.sc, '#' + hexOk(op[1]), op[2]); this.a = decPts(op[3]); this.pi = 0; }
          const n = Math.min(this.a.length / 3 - this.pi, Math.max(1, Math.ceil(this.acc * 3.4)));
          for (let j = 0; j < n; j++, this.pi++) this.pen.add(this.a[this.pi * 3], this.a[this.pi * 3 + 1], this.a[this.pi * 3 + 2]);
          this.acc -= n / 3.4;
          if (this.pi >= this.a.length / 3) { this.pen.end(); this.pen = null; this.i++; }
        } else { this.b.apply(op); this.acc -= opUnits(op); this.i++; }
      }
      if (this.i >= this.ops.length) this.done = true;
      if (this.f) this.f(this);
      return this.done;
    }
    finish() { while (!this.done) this.step(1e9); }
  }

  function playReplay(board, ops, o = {}) {
    const rp = new Replay(board, ops, o.onFrame), total = Math.max(1, rp.total);
    const dur = clamp(total * .014, .8, o.maxSec || 8) / (o.speed || 1);
    let raf = 0, last = performance.now(), stopped = false;
    const tick = t => {
      if (stopped) return;
      const dt = Math.min(.05, (t - last) / 1000); last = t;
      if (rp.step(total / dur * dt)) { if (o.onDone) o.onDone(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return { stop() { stopped = true; cancelAnimationFrame(raf); }, finish() { stopped = true; cancelAnimationFrame(raf); rp.finish(); if (o.onDone) o.onDone(); }, dur };
  }

  const PAL_G = ['000000', '666666', '0050cd', 'ffffff', 'aaaaaa', '26c9ff', '017420', '990000', '964112', '11b03c', 'ff0013', 'ff7829', 'b0701c', '99004e', 'cb5a57', 'ffc126', 'ff008f', 'ffafaf'];
  const PAL_S = ['ffffff', 'c1c1c1', 'ef130b', 'ff7100', 'ffe400', '00cc00', '00ff91', '00b2ff', '231fd3', 'a300ba', 'df69a7', 'ffac8e', 'a0522d', '000000', '4c4c4c', '740b07', 'c23800', 'e8a200', '005510', '00785d', '00569e', '0e0865', '550069', '873554', 'cc774d', '63300d'];

  const IC = {
    pen: '<path d="M4 20l1.2-4.6L16.5 4a2 2 0 012.8 0l.7.7a2 2 0 010 2.8L8.6 18.8z" /><path d="M14.5 6l3.5 3.5"/>',
    eraser: '<path d="M4 15l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L12 19H7z"/><path d="M9 11l5 5M4 19h16"/>',
    rect: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    ell: '<ellipse cx="12" cy="12" rx="8" ry="8"/>',
    rectF: '<rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor"/>',
    ellF: '<ellipse cx="12" cy="12" rx="8" ry="8" fill="currentColor"/>',
    line: '<circle cx="6" cy="18" r="2.2" fill="currentColor"/><path d="M7.5 16.5L17 6"/>',
    fill: '<path d="M5 12l7-7 7 7-6 6a2 2 0 01-2.8 0z"/><path d="M5 12h14"/><path d="M19.5 15.5c1 1.4 1.5 2.3 1.5 3a1.5 1.5 0 01-3 0c0-.7.5-1.6 1.5-3z" fill="currentColor"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 010 12" transform="translate(0 -5)"/>',
    redo: '<path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 000 12" transform="translate(0 -5)"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/>',
    dl: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const icon = (n, w = 24) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

  function createPad(cfg, api) {
    const W = cfg.w, H = cfg.h, sc = cfg.sc || 2, G = cfg.layout === 'g';
    const board = new Board(W, H, sc);
    const pal = G ? PAL_G : PAL_S, sizes = cfg.sizes;
    const st = { tool: 'pen', col: cfg.col || '000000', size: sizes[1], on: true, k: 0, redo: [], hover: null, cur: null };
    const el = mk('div', 'dp ' + (G ? 'dp-g' : 'dp-s'));
    const palEl = mk('div', 'dp-pal'), stage = mk('div', 'dp-stage'), cvw = mk('div', 'dp-cv'), toolsEl = mk('div', 'dp-tools'), sizeEl = mk('div', 'dp-sizes');
    cvw.style.aspectRatio = W + ' / ' + H;
    board.cv.className = 'dp-main';
    const ghost = mk('canvas', 'dp-ghost'), ov = mk('canvas', 'dp-ov');
    ghost.width = Math.round(W * sc); ghost.height = Math.round(H * sc);
    ov.width = Math.round(W * sc); ov.height = Math.round(H * sc);
    cvw.append(board.cv, ghost, ov);
    stage.append(cvw);
    palEl.innerHTML = pal.map(c => `<button class="dp-sw" data-c="${c}" style="--c:#${c}" aria-label="colour ${c}"></button>`).join('') + (G ? '<label class="dp-custom" title="Custom colour"><input type="color" value="#00b140"></label>' : '');
    const TOOLS = cfg.tools.map(t => ({
      pen: ['pen', 'pen', 'Pencil (B)'], eraser: ['eraser', 'eraser', 'Eraser (E)'], rect: ['rect', 'rect', 'Rectangle'], ell: ['ell', 'ell', 'Circle'], rectF: ['rectF', 'rectF', 'Filled rectangle'], ellF: ['ellF', 'ellF', 'Filled circle'], line: ['line', 'line', 'Line (L)'], fill: ['fill', 'fill', 'Fill bucket (F)'], clear: ['trash', 'clear', 'Clear canvas'], undo: ['undo', 'undo', 'Undo (Ctrl+Z)'], redo: ['redo', 'redo', 'Redo (Ctrl+Y)'], clear: ['trash', 'clear', 'Clear']
    }[t]));
    toolsEl.innerHTML = TOOLS.map(([ic, id, tip]) => `<button class="dp-tl" data-t="${id}" title="${tip}" aria-label="${tip}">${icon(ic, G ? 26 : 24)}</button>`).join('');
    sizeEl.innerHTML = sizes.map((s, i) => `<button class="dp-sz" data-s="${s}" aria-label="size ${s}"><i style="--d:${Math.max(3, Math.min(26, s * (G ? .85 : .7)))}px"></i></button>`).join('') + (G ? '<div class="dp-sl"><i class="dp-dot s"></i><input type="range" min="1" max="60" value="' + sizes[1] + '" aria-label="brush size"><i class="dp-dot b"></i></div>' : '');
    if (G) el.append(palEl, stage, toolsEl, sizeEl); else el.append(stage, palEl, toolsEl, sizeEl);
    const range = q(sizeEl, 'input');

    const paint = () => {
      qa(palEl, '.dp-sw').forEach(b => b.classList.toggle('on', b.dataset.c === st.col && st.tool !== 'eraser'));
      qa(toolsEl, '[data-t]').forEach(b => {
        const t = b.dataset.t;
        b.classList.toggle('on', t === st.tool);
        if (t === 'undo') b.disabled = !board.ops.length || !st.on;
        if (t === 'redo') b.disabled = !st.redo.length || !st.on;
        if (t === 'clear') b.disabled = !board.ops.length || !st.on;
      });
      qa(sizeEl, '.dp-sz').forEach(b => b.classList.toggle('on', +b.dataset.s === st.size));
      if (range) range.value = st.size;
      el.classList.toggle('off', !st.on);
      const o = q(palEl, '.dp-custom');
      if (o) { const hex = PAL_G.includes(st.col) ? null : st.col; o.style.setProperty('--c', '#' + (hex || q(o, 'input').value.slice(1))); o.classList.toggle('on', !!hex); }
    };
    const emit = (name, ...a) => { if (cfg[name]) cfg[name](...a); };
    const pt = e => {
      const r = ov.getBoundingClientRect();
      return [clamp((e.clientX - r.left) * W / (r.width || 1), -10, W + 10), clamp((e.clientY - r.top) * H / (r.height || 1), -10, H + 10)];
    };
    const qz = v => Math.round(v * 2);
    const octx = ov.getContext('2d');
    const clearOv = () => octx.clearRect(0, 0, ov.width, ov.height);
    const cursor = (x, y) => {
      clearOv();
      if (!st.on || st.tool === 'fill' || x == null) return;
      const r = Math.max(1.5, (st.tool === 'pen' || st.tool === 'eraser' ? st.size * .5 : 2)) * sc;
      octx.lineWidth = 1.4 * sc; octx.strokeStyle = 'rgba(0,0,0,.55)'; octx.beginPath(); octx.arc(x * sc, y * sc, r, 0, TAU); octx.stroke();
      octx.lineWidth = .8 * sc; octx.strokeStyle = 'rgba(255,255,255,.9)'; octx.beginPath(); octx.arc(x * sc, y * sc, r + .9 * sc, 0, TAU); octx.stroke();
    };
    let flushT = 0;
    const flush = () => {
      const c = st.cur;
      if (!c || c.sent >= c.ints.length) return;
      const chunk = c.ints.slice(c.sent);
      c.sent = c.ints.length;
      emit('onSeg', { k: c.k, i: c.n++, c: c.col, z: c.size, p: encPts(chunk) });
    };
    const colNow = () => st.tool === 'eraser' ? 'ffffff' : st.col;
    const addPt = (c, x, y, p) => {
      const ix = qz(x), iy = qz(y), ip = Math.round(clamp(p, 0, 1) * 63);
      const n = c.ints.length;
      if (n && c.ints[n - 3] === ix && c.ints[n - 2] === iy) return;
      c.ints.push(ix, iy, ip);
      c.pen.add(ix / 2, iy / 2, ip / 63);
    };
    ov.addEventListener('pointerdown', e => {
      if (!st.on || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      try { ov.setPointerCapture(e.pointerId); } catch (x) {}
      const [x, y] = pt(e);
      st.redo = [];
      if (st.tool === 'fill') {
        board.add([1, st.col, qz(x), qz(y)]);
        emit('onOp', board.ops[board.ops.length - 1], ++st.k);
        paint(); return;
      }
      if (st.tool === 'pen' || st.tool === 'eraser') {
        const pen = new Pen(board.ctx, sc, '#' + colNow(), st.size);
        st.cur = { type: 'p', pen, ints: [], sent: 0, n: 0, k: ++st.k, col: colNow(), size: st.size, p: e.pointerType === 'pen' ? Math.max(.1, e.pressure || .5) : .85, t: e.timeStamp, x, y, id: e.pointerId };
        addPt(st.cur, x, y, st.cur.p);
        flushT = setTimeout(function f() { flush(); if (st.cur) flushT = setTimeout(f, 45); }, 45);
      } else st.cur = { type: 's', x0: x, y0: y, x, y, id: e.pointerId };
      cursor(null);
    });
    ov.addEventListener('pointermove', e => {
      const c = st.cur;
      if (!c) { const [x, y] = pt(e); cursor(x, y); return; }
      if (e.pointerId !== c.id) return;
      const list = c.type === 'p' && e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      const evs = list && list.length ? list : [e];
      for (const ev of evs) {
        const [x, y] = pt(ev);
        if (c.type === 'p') {
          const d = Math.hypot(x - c.x, y - c.y);
          if (d < .7) continue;
          let tp;
          if (ev.pointerType === 'pen') tp = Math.max(.08, ev.pressure || .5);
          else { const v = d / Math.max(1, ev.timeStamp - c.t); tp = clamp(1.05 - v * .26, .62, 1); }
          c.p = c.p * .65 + tp * .35;
          c.x = x; c.y = y; c.t = ev.timeStamp;
          addPt(c, x, y, c.p);
        } else { c.x = x; c.y = y; }
      }
      if (c.type === 's') {
        clearOv();
        const op = shapeOp(c);
        if (op) drawShape(octx, sc, op);
      }
    });
    const shapeOp = c => {
      const t = st.tool, a = [qz(c.x0), qz(c.y0), qz(c.x), qz(c.y)];
      if (t === 'line') return [2, st.col, st.size, ...a];
      if (t === 'rect' || t === 'rectF') return [3, st.col, st.size, t === 'rectF' ? 1 : 0, ...a];
      if (t === 'ell' || t === 'ellF') return [4, st.col, st.size, t === 'ellF' ? 1 : 0, ...a];
      return null;
    };
    const finish = e => {
      const c = st.cur;
      if (!c || (e && e.pointerId !== c.id)) return;
      st.cur = null; clearTimeout(flushT);
      if (c.type === 'p') {
        flush();
        c.pen.end();
        const op = [0, c.col, c.size, encPts(c.ints)];
        board.ops.push(op);
        emit('onOp', op, c.k);
      } else {
        clearOv();
        const op = shapeOp(c);
        if (op && (Math.abs(op[op.length - 2] - op[op.length - 4]) + Math.abs(op[op.length - 1] - op[op.length - 3])) > 2) { board.add(op); emit('onOp', op, ++st.k); }
      }
      paint();
    };
    ov.addEventListener('pointerup', finish);
    ov.addEventListener('pointercancel', finish);
    ov.addEventListener('pointerleave', e => { if (!st.cur) cursor(null); });
    ov.addEventListener('contextmenu', e => e.preventDefault());

    const doUndo = () => {
      if (!st.on || st.cur) return;
      const o = board.undo();
      if (o) { st.redo.push(o); emit('onUndo'); }
      paint();
    };
    const doRedo = () => {
      if (!st.on || st.cur || !st.redo.length) return;
      const o = st.redo.pop();
      board.add(o); emit('onOp', o, ++st.k); paint();
    };
    const doClear = () => {
      if (!st.on || st.cur || !board.ops.length) return;
      board.add([5]); st.redo = []; emit('onOp', [5], ++st.k); paint();
    };
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !st.on) return;
      if (b.dataset.c) { st.col = b.dataset.c; if (st.tool === 'eraser') st.tool = 'pen'; }
      else if (b.dataset.s) st.size = +b.dataset.s;
      else if (b.dataset.t) {
        const t = b.dataset.t;
        if (t === 'undo') return doUndo();
        if (t === 'redo') return doRedo();
        if (t === 'clear') return doClear();
        st.tool = t;
      } else return;
      api.sfx('tick'); paint();
    });
    if (range) range.addEventListener('input', () => { st.size = +range.value; paint(); });
    const cp = q(palEl, 'input[type=color]');
    if (cp) cp.addEventListener('input', () => { st.col = cp.value.slice(1); if (st.tool === 'eraser') st.tool = 'pen'; paint(); });
    api.on(window, 'keydown', e => {
      if (!st.on || !el.isConnected || e.target.closest && e.target.closest('input,textarea') && e.target.type !== 'range' && e.target.type !== 'color') return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
      else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); doRedo(); }
      else if (e.ctrlKey || e.metaKey || e.altKey) return;
      else if (k === 'b') { st.tool = 'pen'; paint(); }
      else if (k === 'e') { st.tool = 'eraser'; paint(); }
      else if (k === 'f' && cfg.tools.includes('fill')) { st.tool = 'fill'; paint(); }
      else if (k === 'l' && cfg.tools.includes('line')) { st.tool = 'line'; paint(); }
      else if (k === '[') { st.size = Math.max(1, st.size - 2); paint(); }
      else if (k === ']') { st.size = Math.min(60, st.size + 2); paint(); }
      else if (/^[1-9]$/.test(k) && sizes[+k - 1] != null && +k <= sizes.length) { st.size = sizes[+k - 1]; paint(); }
    });
    paint();
    const pad = {
      el, board, stage, cvw, palEl, toolsEl, sizeEl, st,
      get ops() { return board.ops; },
      enable(v) { st.on = !!v; if (!v) { st.cur = null; clearTimeout(flushT); clearOv(); } paint(); },
      ghost(ops) {
        const b = new Board(W, H, sc);
        b.setOps(ops || []);
        const g = ghost.getContext('2d');
        g.clearRect(0, 0, ghost.width, ghost.height); g.drawImage(b.cv, 0, 0);
        ghost.style.display = ops ? 'block' : 'none';
      },
      setOps(ops) { board.setOps(ops); st.redo = []; paint(); },
      reset() { board.ops = []; board.rebuild(); st.redo = []; paint(); },
      refresh: paint,
      png(bg) { return board.cv.toDataURL('image/png'); }
    };
    ghost.style.display = 'none';
    return pad;
  }

  function viewer(w, h, sc, cls) {
    const board = new Board(w, h, sc);
    const wrap = mk('div', 'dp-cv dp-view' + (cls ? ' ' + cls : ''));
    wrap.style.aspectRatio = w + ' / ' + h;
    board.cv.className = 'dp-main';
    wrap.append(board.cv);
    return { board, el: wrap };
  }

  const OUT = '#2b1248';
  const GA_BG = ['#59e0b5', '#ffb54a', '#6fa2ff', '#ff86b0', '#b98bff', '#ffe36a'];
  const GA_COL = [['#b45fd8', '#ffd447'], ['#ff8c42', '#fff1d6'], ['#5ec2ff', '#ffffff'], ['#7be17b', '#fff6a8']];
  const eye = (x, y, r, v) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + (v === 1 ? -1.5 : v === 2 ? 1.5 : 0)}" cy="${y + 1}" r="${r * .5}" fill="${OUT}" stroke="none"/>`;
  const mouth = (x, y, v, w = 8) => v === 0 ? `<path d="M${x - w} ${y}q${w} ${w} ${w * 2} 0" fill="none"/>` : v === 1 ? `<path d="M${x - w} ${y}q${w} ${w * 1.6} ${w * 2} 0z" fill="#7a1f3d"/>` : `<path d="M${x - w} ${y}h${w * 2}" fill="none"/><rect x="${x - 2.5}" y="${y}" width="5" height="5" fill="#fff"/>`;
  const SPECIES = [
    (b, a, v) => `<path d="M30 44l-6-18 14 8zM70 44l6-18-14 8z" fill="${a}"/><rect x="24" y="34" width="52" height="50" rx="22" fill="${b}"/>${eye(50, 54, 10, v)}<path d="M42 72h16" fill="none"/>${mouth(50, 70, v, 9)}`,
    (b, a, v) => `<path d="M26 46l2-22 18 12zM74 46l-2-22-18 12z" fill="${b}"/><circle cx="50" cy="56" r="27" fill="${b}"/><path d="M46 62l4 3 4-3z" fill="${a}"/>${eye(40, 52, 5.5, v)}${eye(60, 52, 5.5, v)}${mouth(50, 68, v, 5)}<path d="M20 60h12M20 66l11-3M80 60H68M80 66l-11-3" fill="none" stroke-width="2"/>`,
    (b, a, v) => `<circle cx="29" cy="32" r="10" fill="${b}"/><circle cx="71" cy="32" r="10" fill="${b}"/><circle cx="50" cy="55" r="28" fill="${b}"/><ellipse cx="50" cy="64" rx="13" ry="10" fill="${a}"/><ellipse cx="50" cy="60" rx="4.5" ry="3" fill="${OUT}"/>${eye(38, 48, 5, v)}${eye(62, 48, 5, v)}${mouth(50, 70, v, 5)}`,
    (b, a, v) => `<ellipse cx="38" cy="26" rx="8" ry="20" fill="${b}"/><ellipse cx="62" cy="26" rx="8" ry="20" fill="${b}"/><ellipse cx="38" cy="28" rx="3.5" ry="13" fill="${a}" stroke="none"/><ellipse cx="62" cy="28" rx="3.5" ry="13" fill="${a}" stroke="none"/><circle cx="50" cy="60" r="26" fill="${b}"/>${eye(40, 56, 5.5, v)}${eye(60, 56, 5.5, v)}<path d="M46 64l4 3 4-3z" fill="${a}"/>${mouth(50, 70, v, 5)}`,
    (b, a, v) => `<ellipse cx="50" cy="62" rx="32" ry="26" fill="${b}"/><circle cx="34" cy="38" r="13" fill="${b}"/><circle cx="66" cy="38" r="13" fill="${b}"/>${eye(34, 38, 8, v)}${eye(66, 38, 8, v)}<path d="M28 68q22 20 44 0" fill="none"/><circle cx="26" cy="68" r="4" fill="${a}" stroke="none"/><circle cx="74" cy="68" r="4" fill="${a}" stroke="none"/>`,
    (b, a, v) => `<path d="M50 18v14" fill="none"/><circle cx="50" cy="16" r="5" fill="${a}"/><rect x="24" y="32" width="52" height="46" rx="10" fill="${b}"/><rect x="32" y="44" width="36" height="14" rx="7" fill="#fff"/><circle cx="42" cy="51" r="4" fill="${OUT}"/><circle cx="58" cy="51" r="4" fill="${OUT}"/><path d="M38 68h24" fill="none"/><path d="M42 68v4M50 68v4M58 68v4" fill="none" stroke-width="2"/>`,
    (b, a, v) => `<ellipse cx="50" cy="52" rx="28" ry="34" fill="${b}"/><ellipse cx="38" cy="50" rx="8" ry="12" fill="${OUT}" transform="rotate(-18 38 50)"/><ellipse cx="62" cy="50" rx="8" ry="12" fill="${OUT}" transform="rotate(18 62 50)"/><circle cx="36" cy="46" r="2" fill="#fff" stroke="none"/><circle cx="60" cy="46" r="2" fill="#fff" stroke="none"/>${mouth(50, 74, v === 1 ? 0 : v, 4)}`,
    (b, a, v) => `<path d="M50 6l-6 22h12z" fill="${a}"/><path d="M26 34q-8 24 2 44q6-18 6-30zM74 34q8 24-2 44q-6-18-6-30z" fill="${a}"/><circle cx="50" cy="56" r="27" fill="${b}"/>${eye(40, 54, 5.5, v)}${eye(60, 54, 5.5, v)}<ellipse cx="50" cy="68" rx="9" ry="6" fill="#ffc2da"/>${mouth(50, 70, 0, 4)}`,
    (b, a, v) => `<ellipse cx="50" cy="58" rx="30" ry="34" fill="#34285a"/><ellipse cx="50" cy="64" rx="19" ry="25" fill="#fff"/>${eye(41, 44, 6, v)}${eye(59, 44, 6, v)}<path d="M43 52l7 8 7-8z" fill="${a === '#ffffff' ? '#ffa733' : '#ffa733'}"/>`,
    (b, a, v) => `<path d="M24 82V46q0-26 26-26t26 26v36l-8-6-9 6-9-6-9 6-9-6z" fill="#fff"/>${eye(41, 48, 6, v)}${eye(59, 48, 6, v)}${mouth(50, 64, v === 2 ? 1 : v, 6)}<circle cx="32" cy="58" r="4" fill="${b}" opacity=".5" stroke="none"/><circle cx="68" cy="58" r="4" fill="${b}" opacity=".5" stroke="none"/>`,
    (b, a, v) => `<path d="M26 40l-2-14 16 8zM74 40l2-14-16 8z" fill="${b}"/><circle cx="50" cy="55" r="28" fill="${b}"/><ellipse cx="50" cy="62" rx="14" ry="11" fill="${a}"/><circle cx="45" cy="62" r="2.4" fill="${OUT}" stroke="none"/><circle cx="55" cy="62" r="2.4" fill="${OUT}" stroke="none"/>${eye(37, 46, 5, v)}${eye(63, 46, 5, v)}`,
    (b, a, v) => `<path d="M26 38l-4-14 16 6zM74 38l4-14-16 6z" fill="${b}"/><ellipse cx="50" cy="58" rx="30" ry="28" fill="${b}"/><circle cx="37" cy="52" r="13" fill="#fff"/><circle cx="63" cy="52" r="13" fill="#fff"/><circle cx="37" cy="53" r="6" fill="${OUT}" stroke="none"/><circle cx="63" cy="53" r="6" fill="${OUT}" stroke="none"/><path d="M50 62l-5 8h10z" fill="${a}"/>`
  ];
  const AV_N = SPECIES.length * GA_COL.length;
  function avG(i, px) {
    i = ((i | 0) % AV_N + AV_N) % AV_N;
    const sp = i % SPECIES.length, cw = Math.floor(i / SPECIES.length) % GA_COL.length, v = (i * 7) % 3;
    const [b, a] = GA_COL[cw];
    return `<svg class="av" viewBox="0 0 100 100" width="${px}" height="${px}"><defs><clipPath id="avc"><circle cx="50" cy="50" r="45"/></clipPath></defs><circle cx="50" cy="50" r="49" fill="#fff"/><circle cx="50" cy="50" r="45" fill="${GA_BG[(i * 5 + 1) % GA_BG.length]}"/><g clip-path="url(#avc)" stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${SPECIES[sp](b, a, v)}</g><circle cx="50" cy="50" r="45" fill="none" stroke="${OUT}" stroke-width="3"/></svg>`;
  }
  const SK_COL = ['#ffd23f', '#ff8c42', '#ef4b4b', '#ff7eb6', '#c77dff', '#7a6bff', '#4da3ff', '#3fd0d4', '#43d17a', '#a4e04f', '#c9a27a', '#b0b8c4', '#f5f1e6', '#7a8a99', '#2f3b52', '#ffb0a0'];
  const SK_EYE = [
    (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/><circle cx="${x}" cy="${y + 1}" r="2.6" fill="#111"/>`,
    (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="#111"/>`,
    (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="6.5" fill="#fff"/><circle cx="${x}" cy="${y + 1}" r="3" fill="#111"/>`,
    (x, y, s) => `<path d="M${x - 5} ${y + 1}q5 -7 10 0" fill="none" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>`,
    (x, y, s) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/><circle cx="${x}" cy="${y + 1}" r="2.6" fill="#111"/><path d="M${x - 7} ${y - 8}l${s * 12} 4" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>`,
    (x, y) => `<path d="M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>`,
    (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff"/><circle cx="${x + 1.5}" cy="${y}" r="4" fill="#111"/><circle cx="${x + 3}" cy="${y - 1.4}" r="1.3" fill="#fff"/>`,
    (x, y) => `<path d="M${x - 5} ${y}h10" stroke="#111" stroke-width="3" stroke-linecap="round"/>`
  ];
  const SK_MOUTH = [
    '<path d="M36 61q14 14 28 0" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M35 59q15 22 30 0z" fill="#7a1f2b" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>',
    '<path d="M38 64h24" stroke="#111" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M36 60q14 14 28 0z" fill="#fff" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/><path d="M42 62v4M50 63v5M58 62v4" stroke="#111" stroke-width="2"/>',
    '<ellipse cx="50" cy="64" rx="6" ry="7" fill="#7a1f2b" stroke="#111" stroke-width="2.6"/>',
    '<path d="M37 68q13 -12 26 0" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M35 59q15 20 30 0z" fill="#7a1f2b" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/><path d="M44 66q6 6 12 0q-2 -5 -6 -5t-6 5z" fill="#ff6f8f"/>',
    '<path d="M36 61q14 10 28 0" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/><path d="M60 62l3 7 3-8z" fill="#fff" stroke="#111" stroke-width="1.8"/>'
  ];
  const SK_N = [SK_COL.length, SK_EYE.length, SK_MOUTH.length];
  const avS = (a, px, crown) => {
    a = Array.isArray(a) ? a : [0, 0, 0];
    const c = SK_COL[((a[0] | 0) % SK_N[0] + SK_N[0]) % SK_N[0]], e = SK_EYE[((a[1] | 0) % SK_N[1] + SK_N[1]) % SK_N[1]], m = SK_MOUTH[((a[2] | 0) % SK_N[2] + SK_N[2]) % SK_N[2]];
    return `<svg class="av" viewBox="0 0 100 100" width="${px}" height="${px}"><circle cx="50" cy="52" r="42" fill="${c}" stroke="#111" stroke-width="3.5"/><ellipse cx="38" cy="38" rx="12" ry="7" fill="#fff" opacity=".28" transform="rotate(-28 38 38)"/>${e(36, 46, 1)}${e(64, 46, -1)}${m}${crown ? '<path d="M28 18l8 10 14-16 14 16 8-10-3 20H31z" fill="#ffd23f" stroke="#111" stroke-width="3" stroke-linejoin="round"/>' : ''}</svg>`;
  };

  const savePng = (cv, name) => {
    cv.toBlob(b => {
      if (!b) return;
      const u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = name; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    }, 'image/png');
  };

  const padCss = S => `
${S} .dp{display:grid;gap:10px;min-width:0;user-select:none;-webkit-user-select:none}
${S} .dp-cv{position:relative;width:100%;background:#fff;line-height:0;overflow:hidden}
${S} .dp-cv canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
${S} .dp-ov{cursor:none}
${S} .dp.off .dp-ov{cursor:default}
${S} .dp-ghost{pointer-events:none;mix-blend-mode:multiply;opacity:.32}
${S} .dp-ov,${S} .dp-ghost{background:none}
${S} .dp-view canvas{position:static;height:auto}
${S} .dp-pal,${S} .dp-tools,${S} .dp-sizes{min-width:0}
${S} .dp button{font:inherit;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent}
${S} .dp button:disabled{opacity:.35;cursor:default}
${S} .dp-sw{width:100%;aspect-ratio:1;border:2px solid rgba(0,0,0,.3);background:var(--c);border-radius:6px;padding:0;transition:transform .12s}
${S} .dp-sw:hover{transform:scale(1.1)}
${S} .dp-sw.on{outline:3px solid #fff;outline-offset:-1px;z-index:1;transform:scale(1.08)}
${S} .dp-tl,${S} .dp-sz{display:grid;place-items:center;border-radius:10px;padding:0}
${S} .dp-tl.on,${S} .dp-sz.on{box-shadow:0 0 0 2px #fff inset}
${S} .dp-sz i{display:block;width:var(--d);height:var(--d);border-radius:50%;background:currentColor}
${S} .dp-g{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"pal stage tools" ". sizes act";align-items:start}
${S} .dp-g .dp-pal{grid-area:pal;display:grid;grid-template-columns:repeat(3,30px);gap:7px;padding:10px;border-radius:14px;background:rgba(40,8,60,.42)}
${S} .dp-g .dp-custom{grid-column:1/-1;height:34px;border-radius:7px;border:2px solid rgba(0,0,0,.3);background:var(--c,#00b140);position:relative;overflow:hidden;cursor:pointer}
${S} .dp-g .dp-custom.on{outline:3px solid #fff;outline-offset:-1px}
${S} .dp-custom input{position:absolute;inset:-10px;opacity:0;cursor:pointer;width:200%;height:200%}
${S} .dp-g .dp-stage{grid-area:stage;min-width:0}
${S} .dp-g .dp-tools{grid-area:tools;display:grid;grid-template-columns:repeat(2,40px);gap:6px;padding:10px;border-radius:14px;background:rgba(40,8,60,.42)}
${S} .dp-g .dp-tl{height:40px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff}
${S} .dp-g .dp-tl.on{background:rgba(255,255,255,.55);color:#4a1650}
${S} .dp-g .dp-sizes{grid-area:sizes;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;background:rgba(40,8,60,.42);min-width:0}
${S} .dp-g .dp-sz{width:38px;height:38px;border:2px solid rgba(255,255,255,.3);background:none;color:rgba(255,255,255,.85);border-radius:50%;flex:none}
${S} .dp-g .dp-sz.on{background:rgba(255,255,255,.4)}
${S} .dp-sl{display:flex;align-items:center;gap:8px;flex:1;min-width:90px;padding:0 6px}
${S} .dp-sl input{flex:1;min-width:0;accent-color:#ff7bb8}
${S} .dp-dot{display:block;border-radius:50%;background:#fff;flex:none}
${S} .dp-dot.s{width:9px;height:9px}
${S} .dp-dot.b{width:20px;height:20px}
${S} .dp-g .dp-act{grid-area:act}
${S} .dp-s{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"stage stage" "pal pal" "tools sizes";gap:8px}
${S} .dp-s .dp-stage{grid-area:stage;border-radius:6px;overflow:hidden;box-shadow:0 0 0 3px #fff}
${S} .dp-s .dp-pal{grid-area:pal;display:grid;grid-template-columns:repeat(13,1fr);gap:2px;padding:4px;border-radius:8px;background:rgba(255,255,255,.95)}
${S} .dp-s .dp-sw{border-radius:3px;border-width:1px}
${S} .dp-s .dp-tools{grid-area:tools;display:flex;gap:6px}
${S} .dp-s .dp-sizes{grid-area:sizes;display:flex;gap:6px}
${S} .dp-s .dp-tl,${S} .dp-s .dp-sz{width:42px;height:38px;border:2px solid rgba(255,255,255,.9);background:rgba(255,255,255,.95);color:#1c2a4c;border-radius:8px}
${S} .dp-s .dp-tl.on,${S} .dp-s .dp-sz.on{background:#53e237;box-shadow:none}
@media (max-width:700px){
${S} .dp-g{grid-template-columns:minmax(0,1fr);grid-template-areas:"stage" "pal" "tools" "sizes" "act"}
${S} .dp-g .dp-pal{grid-template-columns:repeat(9,1fr);padding:6px;gap:5px}
${S} .dp-g .dp-custom{grid-column:span 3;height:auto}
${S} .dp-g .dp-tools{grid-template-columns:repeat(10,1fr);padding:6px}
${S} .dp-g .dp-tl{height:36px}
${S} .dp-s{grid-template-areas:"stage stage" "pal pal" "tools sizes"}
${S} .dp-s .dp-tl,${S} .dp-s .dp-sz{width:36px}
}`;

  const copyLinkFor = api => {
    let l = '';
    try { l = api.net.link(); } catch (e) {}
    if (!l) return;
    const done = () => api.toast('Invite link copied');
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) navigator.share({ url: l }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(l).then(done, () => api.toast(l));
    else api.toast(l);
  };

  const myName = () => {
    try { const p = JSON.parse(localStorage.getItem('gameplay:profile')); if (p && (p.username || p.displayName)) return String(p.username || p.displayName).slice(0, 16); } catch (e) {}
    return 'Player';
  };
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function makeParty(api, cfg) {
    const P = { me: null, hub: false, r: null, hooked: false };
    P.hook = () => {
      if (P.hooked) return;
      P.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || typeof d.t !== 'string' || !api.alive) return;
        if (api.net.role === 'host') cfg.onHost(d, from); else cfg.onClient(d);
      });
      api.net.on('leave', p => { if (api.net.role === 'host' && p) cfg.onLeave(p); });
      api.net.on('rejoin', p => { if (api.net.role === 'host' && p) cfg.onRejoin(p); });
      api.net.on('lobby', () => { if (api.net.role !== 'host') cfg.onLobby(); });
      api.net.on('close', why => cfg.onClose(why));
    };
    P.open = async () => {
      P.hook();
      const r = await api.net.room(cfg.room);
      if (!api.alive || !r) return null;
      P.r = r; P.me = r.id; P.hub = r.role === 'host';
      return r;
    };
    P.local = msg => queueMicrotask(() => { if (api.alive) cfg.onClient(msg); });
    P.bcast = (msg, fast) => { api.net.send(msg, fast); if (P.hub) P.local(msg); };
    P.to = (id, msg, fast) => { if (id === P.me) P.local(msg); else api.net.sendTo(id, msg, fast); };
    P.up = (msg, fast) => { if (P.hub) queueMicrotask(() => { if (api.alive) cfg.onHost(msg, P.me); }); else api.net.send(msg, fast); };
    P.leader = () => api.net.leader;
    P.isLeader = () => api.net.leader === P.me;
    P.players = () => api.net.players || [];
    return P;
  }

  const AD = ['bald', 'sleepy', 'angry', 'tiny', 'giant', 'dizzy', 'fancy', 'grumpy', 'sparkly', 'soggy', 'hairy', 'nervous', 'shy', 'fluffy', 'cursed', 'royal', 'zombie', 'ninja', 'cheesy', 'radioactive', 'invisible', 'jolly', 'sneaky', 'clumsy', 'sweaty', 'golden', 'enormous', 'confused', 'elegant', 'spooky', 'hungry', 'dramatic'];
  const SB = ['tiger', 'penguin', 'grandma', 'robot', 'pirate', 'wizard', 'potato', 'dragon', 'cat', 'octopus', 'banana', 'snowman', 'alien', 'dinosaur', 'unicorn', 'plumber', 'chef', 'ghost', 'cowboy', 'squirrel', 'taco', 'astronaut', 'llama', 'vampire', 'hamster', 'knight', 'mermaid', 'broccoli', 'duck', 'detective', 'giraffe', 'pigeon'];
  const VB = ['drinking tea', 'riding a bike', 'eating spaghetti', 'playing guitar', 'washing dishes', 'flying a kite', 'juggling pizzas', 'taking a selfie', 'dancing the tango', 'fishing', 'skateboarding', 'doing yoga', 'reading a book', 'baking a cake', 'painting a wall', 'singing karaoke', 'walking a dog', 'playing chess', 'building a sandcastle', 'brushing teeth', 'running late', 'winning a trophy'];
  const PL = ['on the moon', 'in a bathtub', 'at the beach', 'in a haunted house', 'under the sea', 'on a rollercoaster', 'in the jungle', 'at a birthday party', 'in traffic', 'on a mountain', 'in space', '', '', ''];
  const randPrompt = () => { const p = pick(PL), s = pick(AD) + ' ' + pick(SB) + ' ' + pick(VB) + (p ? ' ' + p : ''); return s[0].toUpperCase() + s.slice(1); };

  const GMODES = {
    normal: { n: 'Normal', d: 'Write a sentence, then take turns drawing it and describing the drawing, passing every chain around the table until the album reveal.' },
    knock: { n: 'Knock-Off', d: 'Everybody draws a prompt. Then copy the drawing you are given, again and again, while the clock gets faster and faster.' },
    anim: { n: 'Animation', d: 'Build short animations together: every player draws the next frame, with the previous one fading in as a guide.' },
    story: { n: 'Story', d: 'No drawing at all. Continue the story using only the previous sentence and watch it go off the rails.' },
    sandwich: { n: 'Sandwich', d: 'Write first, draw in the middle, describe at the end. Quick three step chains.' },
    master: { n: 'Masterpiece', d: 'One turn, no time limit. Everyone draws a random prompt and takes all the time they want.' }
  };
  const GM_IC = {
    normal: '<rect x="14" y="10" width="26" height="34" rx="3" fill="#7fe3bd"/><path d="M19 20h16M19 26h16M19 32h10" stroke="#2b1248" stroke-width="2.4" stroke-linecap="round"/><path d="M36 44l14-20 5 4-14 20-7 2z" fill="#ffd447" stroke="#2b1248" stroke-width="2.4" stroke-linejoin="round"/>',
    knock: '<rect x="8" y="14" width="26" height="26" rx="3" fill="#fff" stroke="#2b1248" stroke-width="2.4" transform="rotate(-10 21 27)"/><rect x="20" y="14" width="26" height="26" rx="3" fill="#fff" stroke="#2b1248" stroke-width="2.4"/><path d="M27 33l6-10 6 10z" fill="#ff5d73"/><path d="M42 42l12-14 4 4-12 14z" fill="#ffd447" stroke="#2b1248" stroke-width="2.4" stroke-linejoin="round"/>',
    anim: '<circle cx="14" cy="38" r="5" fill="none" stroke="#2b1248" stroke-width="2.4" stroke-dasharray="3 3"/><circle cx="30" cy="26" r="6" fill="#ff7bb8" stroke="#2b1248" stroke-width="2.4"/><circle cx="48" cy="14" r="7" fill="#ff5d73" stroke="#2b1248" stroke-width="2.4"/><path d="M18 35l8-6M36 22l6-5" stroke="#2b1248" stroke-width="2.4" stroke-linecap="round"/>',
    story: '<path d="M14 12h30a4 4 0 014 4v28H18a4 4 0 01-4-4z" fill="#f4e7c0" stroke="#2b1248" stroke-width="2.4"/><path d="M20 22h22M20 29h22M20 36h14" stroke="#2b1248" stroke-width="2.2" stroke-linecap="round"/><path d="M40 46l12-18 4 3-12 18-6 1z" fill="#ff7bb8" stroke="#2b1248" stroke-width="2.4" stroke-linejoin="round"/>',
    sandwich: '<path d="M8 22q0-10 24-10t24 10z" fill="#f1b45b" stroke="#2b1248" stroke-width="2.4"/><path d="M8 26h48l-4 4H12z" fill="#62d26f" stroke="#2b1248" stroke-width="2.4" stroke-linejoin="round"/><rect x="10" y="32" width="44" height="6" rx="2" fill="#ff5d73" stroke="#2b1248" stroke-width="2.4"/><path d="M8 42h48q0 8-24 8T8 42z" fill="#f1b45b" stroke="#2b1248" stroke-width="2.4"/>',
    master: '<rect x="12" y="8" width="40" height="48" rx="3" fill="#ffc861" stroke="#2b1248" stroke-width="2.6"/><rect x="18" y="14" width="28" height="36" fill="#6fc3e8" stroke="#2b1248" stroke-width="2"/><circle cx="32" cy="28" r="6" fill="#c9885a"/><path d="M20 50q12-18 24 0z" fill="#3f6f4b"/><path d="M52 8l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#fff" stroke="#2b1248" stroke-width="1.6"/>'
  };
  const SPD = { fast: [30, 60], normal: [50, 110], slow: [90, 200], regress: [60, 150], progress: [60, 150], inf: [0, 0] };
  const SPD_N = { fast: 'Fast', normal: 'Normal', slow: 'Slow', regress: 'Regressive', progress: 'Progressive', inf: 'Infinite' };
  const OPT_DEF = { speed: 'normal', turns: 'all', album: 'manual' };

  function gPlan(mode, N, opt) {
    const turns = opt.turns === 'all' ? N : Math.min(N, Math.max(2, +opt.turns || N));
    let R, kinds;
    if (mode === 'sandwich') { R = Math.min(3, N); kinds = ['w', 'd', 'w']; }
    else if (mode === 'master') { R = 1; kinds = ['d']; }
    else if (mode === 'story') { R = turns; kinds = Array(R).fill('w'); }
    else if (mode === 'knock') { R = Math.min(turns, 8); kinds = Array.from({ length: R }, (_, i) => i ? 'c' : 'd'); }
    else if (mode === 'anim') { R = Math.min(turns, 6); kinds = Array(R).fill('f'); }
    else { R = turns; kinds = Array.from({ length: R }, (_, i) => i % 2 ? 'd' : 'w'); }
    const [bw, bd] = SPD[opt.speed] || SPD.normal;
    return kinds.map((k, r) => {
      let base = k === 'w' ? bw : bd;
      if (mode === 'master' || opt.speed === 'inf') return { k, time: 0 };
      if (mode === 'knock') base = Math.max(10, Math.round(bd * Math.pow(.8, r)));
      if (mode === 'anim') base = Math.round(bd * .6);
      if (opt.speed === 'regress') base *= 1.6 - 1.05 * (r / Math.max(1, R - 1));
      if (opt.speed === 'progress') base *= .55 + 1.05 * (r / Math.max(1, R - 1));
      return { k, time: Math.max(8, Math.round(base)) };
    });
  }

  function cleanOp(o) {
    if (!Array.isArray(o)) return null;
    const t = o[0] | 0, col = hexOk(String(o[1]));
    if (t === 5) return [5];
    if (t === 0) return [0, col, clamp(o[2] | 0, 1, 60), typeof o[3] === 'string' ? o[3].slice(0, 40000) : ''];
    if (t === 1) return [1, col, o[2] | 0, o[3] | 0];
    if (t === 2) return [2, col, clamp(o[2] | 0, 1, 60), o[3] | 0, o[4] | 0, o[5] | 0, o[6] | 0];
    if (t === 3 || t === 4) return [t, col, clamp(o[2] | 0, 1, 60), o[3] ? 1 : 0, o[4] | 0, o[5] | 0, o[6] | 0, o[7] | 0];
    return null;
  }
  const cleanOps = a => {
    if (!Array.isArray(a)) return [];
    const r = [];
    for (let i = 0; i < a.length && r.length < 3000; i++) { const o = cleanOp(a[i]); if (o) r.push(o); }
    return r;
  };

  const GP_LOGO = `<svg class="gp-logo" viewBox="0 0 300 120" aria-label="Gartic Phone"><path d="M22 42Q22 14 54 14h192q32 0 32 28v36q0 8-8 10l-4 18H34l-4-18q-8-2-8-10z" fill="#2b1248" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><rect x="92" y="2" width="116" height="30" rx="15" fill="#2b1248" stroke="#fff" stroke-width="5"/><text x="150" y="25" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="25" fill="#2b1248" stroke="#fff" stroke-width="6" paint-order="stroke" stroke-linejoin="round">Gartic</text><text x="146" y="84" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="58" fill="#fff" stroke="#2b1248" stroke-width="3" letter-spacing="-1">PHONE</text><circle cx="64" cy="66" r="3" fill="#2b1248"/><rect x="82" y="96" width="136" height="16" rx="8" fill="#2b1248" stroke="#fff" stroke-width="4"/></svg>`;
  const HOW = [
    ['1. WRITE A SENTENCE', 'Everybody starts by writing a bizarre sentence for someone else to draw.', '<rect x="20" y="14" width="46" height="58" rx="4" fill="#fff"/><path d="M28 28h30M28 38h30M28 48h18" stroke="#6a38d8" stroke-width="4" stroke-linecap="round"/><path d="M58 76l22-34 8 5-22 34-11 3z" fill="#ffd447" stroke="#2b1248" stroke-width="3" stroke-linejoin="round"/>'],
    ['2. PASS IT ON', 'Your sentence goes to the next player. Yours arrives from the player before you.', '<rect x="10" y="26" width="38" height="46" rx="4" fill="#fff"/><rect x="52" y="20" width="38" height="46" rx="4" fill="#7fe3bd" stroke="#2b1248" stroke-width="3"/><path d="M60 40h22M60 50h14" stroke="#2b1248" stroke-width="4" stroke-linecap="round"/>'],
    ['3. TIME TO DRAW', 'You get a sentence from another player. Draw it before the timer runs out!', '<rect x="16" y="14" width="54" height="50" rx="4" fill="#fff"/><path d="M26 52q10-30 24-4t14-20" stroke="#ff3d6e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 78l18-26 8 5-18 26-10 2z" fill="#ffd447" stroke="#2b1248" stroke-width="3" stroke-linejoin="round"/>'],
    ['4. DESCRIBE IT', 'Now someone else sees only the drawing and must write what they think it is.', '<rect x="14" y="16" width="44" height="38" rx="4" fill="#fff"/><path d="M22 44q8-22 20-2" stroke="#4b6fe0" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="42" y="46" width="48" height="26" rx="8" fill="#7fe3bd" stroke="#2b1248" stroke-width="3"/><path d="M52 56h28M52 63h18" stroke="#2b1248" stroke-width="3.4" stroke-linecap="round"/>'],
    ['5. KEEP PASSING', 'Drawings and descriptions alternate until every chain has visited every player.', '<circle cx="50" cy="44" r="26" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="26 10"/><path d="M72 28l8 2-2 9" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
    ['6. THE ALBUM', 'Watch every chain being replayed stroke by stroke and see how it all went wrong.', '<rect x="14" y="12" width="40" height="22" rx="6" fill="#fff"/><rect x="36" y="40" width="50" height="30" rx="6" fill="#fff"/><path d="M22 36q10-16 20 0" stroke="#ff3d6e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M45 56h32" stroke="#6a38d8" stroke-width="5" stroke-linecap="round"/>']
  ];

  const GP_CSS = `
.gm-gartic-phone{display:block;position:relative;min-height:600px;padding:0;gap:0;border-radius:20px;overflow:hidden;color:#fff;font-family:${FONT};text-align:left;background:#5b2bb8;transition:background .5s}
.gm-gartic-phone .gp{position:relative;min-height:600px;padding:16px 18px;display:flex;flex-direction:column;background-image:radial-gradient(rgba(255,255,255,.07) 1.6px,transparent 1.8px),var(--bg);background-size:14px 14px,100% 100%;transition:background .5s}
.gm-gartic-phone .gp{--bg:linear-gradient(165deg,#8b43e2 0%,#6a2cc6 50%,#4a1f9f 100%)}
.gm-gartic-phone[data-ph=write] .gp{--bg:linear-gradient(165deg,#7a45e0,#4f27ad)}
.gm-gartic-phone[data-ph=draw] .gp{--bg:linear-gradient(165deg,#e85a63,#b5174c 70%,#8d1250)}
.gm-gartic-phone[data-ph=wait] .gp{--bg:linear-gradient(165deg,#5a45d8,#3a2aa0)}
.gm-gartic-phone[data-ph=album] .gp{--bg:linear-gradient(165deg,#5c76e6 0%,#6a3bd0 55%,#2f9cd8 100%)}
.gm-gartic-phone *{box-sizing:border-box}
.gm-gartic-phone h1,.gm-gartic-phone h2,.gm-gartic-phone h3,.gm-gartic-phone p{margin:0}
.gm-gartic-phone .gp-tb{position:absolute;left:0;right:0;top:0;height:7px;z-index:6;background:rgba(0,0,0,.25)}
.gm-gartic-phone .gp-tb i{display:block;height:100%;width:100%;transform-origin:0 0;background:linear-gradient(90deg,#61ffc9,#ffe36a);border-radius:0 6px 6px 0}
.gm-gartic-phone .gp-tb.low i{background:linear-gradient(90deg,#ff5d73,#ff9a5d)}
.gm-gartic-phone .gp-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 26px;border:0;border-radius:11px;background:#fff;color:#321466;font:900 18px/1 ${FONT};letter-spacing:.03em;text-transform:uppercase;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.28);transition:transform .12s,box-shadow .12s,filter .15s}
.gm-gartic-phone .gp-btn:hover{transform:translateY(-2px);box-shadow:0 7px 0 rgba(0,0,0,.28)}
.gm-gartic-phone .gp-btn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.28)}
.gm-gartic-phone .gp-btn:disabled{opacity:.45;cursor:default;transform:none;box-shadow:0 5px 0 rgba(0,0,0,.28)}
.gm-gartic-phone .gp-btn.ghost{background:rgba(255,255,255,.1);color:#fff;border:2px solid rgba(255,255,255,.35);box-shadow:none;height:42px;font-size:14px;padding:0 16px}
.gm-gartic-phone .gp-btn.ghost:hover{background:rgba(255,255,255,.2);transform:none;box-shadow:none}
.gm-gartic-phone .gp-btn.sm{height:42px;font-size:15px;padding:0 18px}
.gm-gartic-phone .gp-btn.go{background:#5df0b5;color:#0b3d2c}
.gm-gartic-phone .gp-h{font:900 22px/1 ${FONT};letter-spacing:.02em;text-transform:uppercase;color:#61ffc9;-webkit-text-stroke:5px #1f0b4e;paint-order:stroke fill;text-align:center}
.gm-gartic-phone .gp-panel{background:rgba(38,10,92,.5);border:2px solid rgba(255,255,255,.13);border-radius:16px;padding:14px;min-width:0}
.gm-gartic-phone .gp-logo{display:block;width:min(260px,56%);height:auto;margin:0 auto;filter:drop-shadow(0 6px 0 rgba(0,0,0,.2))}
.gm-gartic-phone .gp-title{display:flex;flex-direction:column;gap:18px;flex:1;justify-content:center}
.gm-gartic-phone .gp-tcols{display:grid;grid-template-columns:1.1fr 1fr;gap:16px}
.gm-gartic-phone .gp-prof{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.gm-gartic-phone .gp-avbtn{position:relative;border:0;background:none;padding:0;cursor:pointer;line-height:0;transition:transform .2s}
.gm-gartic-phone .gp-avbtn:hover{transform:scale(1.05) rotate(-2deg)}
.gm-gartic-phone .gp-avbtn .gp-rr{position:absolute;right:-4px;bottom:-4px;width:38px;height:38px;border-radius:50%;background:#fff;color:#2b1248;display:grid;place-items:center;border:3px solid #2b1248}
.gm-gartic-phone .gp-nm{font:900 24px/1.1 ${FONT};text-transform:uppercase;letter-spacing:.02em}
.gm-gartic-phone .gp-sub{font-weight:700;opacity:.8;font-size:14px;line-height:1.4;max-width:32ch}
.gm-gartic-phone .gp-prof .gp-btn{width:min(280px,100%)}
.gm-gartic-phone .gp-how{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.gm-gartic-phone .gp-slide{display:flex;flex-direction:column;align-items:center;gap:8px;min-height:190px;animation:gpIn .45s}
.gm-gartic-phone .gp-slide svg{width:130px;height:104px}
.gm-gartic-phone .gp-slide b{font:900 17px/1.1 ${FONT};letter-spacing:.02em}
.gm-gartic-phone .gp-slide span{font-weight:700;font-size:14px;line-height:1.4;opacity:.9;max-width:30ch}
.gm-gartic-phone .gp-dots{display:flex;gap:12px}
.gm-gartic-phone .gp-dots i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.35);cursor:pointer}
.gm-gartic-phone .gp-dots i.on{background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.3)}
@keyframes gpIn{from{opacity:0;transform:translateY(8px)}}
.gm-gartic-phone .gp-top{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:56px;position:relative}
.gm-gartic-phone .gp-top .gp-logo{position:absolute;left:50%;top:0;transform:translateX(-50%);width:120px}
.gm-gartic-phone .gp-lcols{display:grid;grid-template-columns:minmax(210px,.8fr) 1.7fr;gap:14px;margin:14px 0;flex:1;min-height:0}
.gm-gartic-phone .gp-plist{display:flex;flex-direction:column;gap:8px;margin-top:12px;max-height:370px;overflow:auto;padding-right:2px}
.gm-gartic-phone .gp-pr{display:flex;align-items:center;gap:10px;padding:6px 10px 6px 6px;border-radius:30px;background:rgba(210,200,240,.92);color:#2b1248;font:900 15px/1 ${FONT};text-transform:uppercase;min-width:0}
.gm-gartic-phone .gp-pr span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-gartic-phone .gp-pr.me{background:#9cf5d2}
.gm-gartic-phone .gp-pr.gone{opacity:.45}
.gm-gartic-phone .gp-pr .crown{width:26px;height:26px;border-radius:50%;background:#6e4bc5;color:#fff;display:grid;place-items:center;flex:none}
.gm-gartic-phone .gp-pr.empty{background:rgba(255,255,255,.08);color:rgba(255,255,255,.5);border:2px dashed rgba(255,255,255,.18)}
.gm-gartic-phone .av{display:block;flex:none;border-radius:50%}
.gm-gartic-phone .gp-tabs{display:flex;gap:4px;margin:-14px -14px 12px;border-radius:14px 14px 0 0;overflow:hidden}
.gm-gartic-phone .gp-tabs b{flex:1;text-align:center;padding:14px 8px;font:900 18px/1 ${FONT};letter-spacing:.03em;background:rgba(20,5,60,.35);color:rgba(255,255,255,.75);cursor:pointer}
.gm-gartic-phone .gp-tabs b.on{background:transparent;color:#61ffc9}
.gm-gartic-phone .gp-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gm-gartic-phone .gp-pre{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border:3px solid transparent;border-radius:10px;background:rgba(212,204,238,.92);color:#2b1248;font:900 14px/1.1 ${FONT};text-transform:uppercase;cursor:pointer;transition:transform .15s}
.gm-gartic-phone .gp-pre svg{width:56px;height:56px}
.gm-gartic-phone .gp-pre:hover:not(:disabled){transform:translateY(-2px)}
.gm-gartic-phone .gp-pre.on{background:#f0eefc;border-color:#3de6a2}
.gm-gartic-phone .gp-pre:disabled{cursor:default}
.gm-gartic-phone .gp-mdesc{margin-top:10px;font-weight:700;font-size:13.5px;line-height:1.45;opacity:.9}
.gm-gartic-phone .gp-set{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
.gm-gartic-phone .gp-set label{display:flex;flex-direction:column;gap:6px;font:900 13px/1 ${FONT};letter-spacing:.05em;text-transform:uppercase;color:#9df6d6}
.gm-gartic-phone .gp-set select{height:44px;border-radius:10px;border:2px solid rgba(255,255,255,.3);background:rgba(20,5,60,.5);color:#fff;font:800 15px ${FONT};padding:0 10px}
.gm-gartic-phone .gp-set select:disabled{opacity:.6}
.gm-gartic-phone .gp-foot{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
.gm-gartic-phone .gp-foot .gp-btn{min-width:200px}
.gm-gartic-phone .gp-hint{align-self:center;font-weight:800;font-size:14px;opacity:.85}
.gm-gartic-phone .gp-task{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center}
.gm-gartic-phone .gp-step{position:absolute;left:0;top:-4px;font:900 34px/1 ${FONT};text-shadow:0 3px 0 rgba(0,0,0,.25);z-index:2}
.gm-gartic-phone .gp-clock{position:absolute;right:0;top:-6px;width:58px;height:58px;z-index:2}
.gm-gartic-phone .gp-clock svg{width:100%;height:100%}
.gm-gartic-phone .gp-clock b{position:absolute;inset:0;display:grid;place-items:center;font:900 15px ${FONT};color:#3a0f4a}
.gm-gartic-phone .gp-leave{position:absolute;left:0;bottom:-4px;z-index:3;opacity:.8}
.gm-gartic-phone .np{background:#3c1b78;border-radius:10px;box-shadow:0 8px 0 rgba(0,0,0,.25);padding-bottom:6px;min-width:0}
.gm-gartic-phone .np-head{position:relative;background:#4b1d90;border-radius:10px 10px 0 0;padding:14px 12px 12px;text-align:center;border-bottom:4px solid #2b1052}
.gm-gartic-phone .np-head .ring{position:absolute;top:-14px;width:14px;height:36px;border-radius:9px;background:linear-gradient(90deg,#fff,#cfd3ff);border:2px solid #2b1052}
.gm-gartic-phone .np-head .ring.l{left:22%}.gm-gartic-phone .np-head .ring.r{right:22%}
.gm-gartic-phone .np-head small{display:block;font:900 13px/1 ${FONT};letter-spacing:.05em;color:#61ffc9;text-transform:uppercase}
.gm-gartic-phone .np-head h2{font:900 clamp(15px,2.4vw,22px)/1.15 ${FONT};text-transform:uppercase;letter-spacing:.02em;margin-top:4px;word-break:break-word}
.gm-gartic-phone .np-body{display:flex;gap:8px;padding:6px 6px 0;align-items:flex-start}
.gm-gartic-phone .np-body .dp-cv{flex:1;border-radius:2px;box-shadow:0 4px 0 #ddd,0 7px 0 #bbb}
.gm-gartic-phone .np-ref{flex:0 0 34%;min-width:0}
.gm-gartic-phone .np-ref small{display:block;font:900 11px ${FONT};letter-spacing:.06em;margin-bottom:3px;color:#61ffc9;text-transform:uppercase}
.gm-gartic-phone .np-ref .dp-cv{width:100%;box-shadow:none;border-radius:2px}
.gm-gartic-phone .np-write{padding:14px 12px 10px;display:flex;flex-direction:column;gap:12px;align-items:stretch}
.gm-gartic-phone .np-write .dp-cv{max-width:560px;margin:0 auto}
.gm-gartic-phone .gp-wrow{display:flex;gap:10px;align-items:stretch}
.gm-gartic-phone .gp-in{flex:1;min-width:0;height:60px;border-radius:10px;border:3px solid #7c5bd6;background:#fff;color:#2b1248;font:800 20px ${FONT};padding:0 16px;outline:0}
.gm-gartic-phone .gp-in::placeholder{color:#9a86c8}
.gm-gartic-phone .gp-in:focus{border-color:#3de6a2}
.gm-gartic-phone .gp-in.shake{animation:gpShake .35s}
@keyframes gpShake{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.gm-gartic-phone .gp-dice{width:60px;border-radius:10px;border:3px solid #7c5bd6;background:#ece6ff;color:#4b1d90;cursor:pointer;display:grid;place-items:center}
.gm-gartic-phone .gp-dice:hover{background:#fff}
.gm-gartic-phone .gp-prompt{background:#f5f0ff;color:#2b1248;border-radius:12px;padding:16px 18px;font:900 clamp(18px,2.8vw,26px)/1.25 ${FONT};text-align:center;text-transform:none}
.gm-gartic-phone .gp-donebar{display:flex;justify-content:flex-end}
.gm-gartic-phone .dp-act.gp-btn{width:100%;justify-content:flex-start;gap:14px;background:#f4d9ea;height:54px;color:#321466}
.gm-gartic-phone .dp-act.gp-btn svg{width:34px;height:34px;padding:5px;border-radius:50%;background:#2b1248;color:#61ffc9;flex:none}
.gm-gartic-phone .dp-act.gp-btn span{flex:1;text-align:center}
.gm-gartic-phone .gp-wait{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center}
.gm-gartic-phone .gp-wait .gp-h{font-size:30px}
.gm-gartic-phone .gp-wgrid{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;max-width:640px}
.gm-gartic-phone .gp-wp{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;width:84px;font:900 12px/1.1 ${FONT};text-transform:uppercase;text-align:center}
.gm-gartic-phone .gp-wp .av{opacity:.45;transition:opacity .3s,transform .3s}
.gm-gartic-phone .gp-wp.ok .av{opacity:1;transform:scale(1.06)}
.gm-gartic-phone .gp-wp em{position:absolute;right:10px;top:34px;width:26px;height:26px;border-radius:50%;background:#3de6a2;color:#0b3d2c;display:none;place-items:center;border:3px solid #2b1248}
.gm-gartic-phone .gp-wp.ok em{display:grid}
.gm-gartic-phone .gp-wp span{max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-gartic-phone .gp-ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:rgba(40,10,90,.92);animation:gpFade .3s}
@keyframes gpFade{from{opacity:0}}
.gm-gartic-phone .gp-burst{position:absolute;inset:-60%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.13) 0 9deg,transparent 9deg 18deg);animation:gpSpin 12s linear infinite}
@keyframes gpSpin{to{transform:rotate(360deg)}}
.gm-gartic-phone .gp-card{position:relative;display:flex;align-items:center;gap:26px;animation:gpPop .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes gpPop{from{transform:scale(.6) rotate(-4deg);opacity:0}}
.gm-gartic-phone .gp-card .tag{display:inline-block;background:#fff;color:#2b1248;font:900 22px ${FONT};padding:8px 20px;border-radius:6px 14px 14px 6px;box-shadow:6px 6px 0 #ffd447;letter-spacing:.04em}
.gm-gartic-phone .gp-card h2{font:900 clamp(26px,5vw,44px)/1.05 ${FONT};text-transform:uppercase;margin-top:14px;text-shadow:0 4px 0 #1f0b4e}
.gm-gartic-phone .gp-card h2 em{font-style:normal;color:#61ffc9}
.gm-gartic-phone .gp-cd{position:relative;width:130px;height:130px;display:grid;place-items:center;font:900 72px ${FONT};transform:rotate(45deg);background:#fff;color:#2b1248;border-radius:22px;box-shadow:8px 8px 0 #ff5d73;animation:gpPop .4s}
.gm-gartic-phone .gp-cd b{transform:rotate(-45deg)}
.gm-gartic-phone .al-cols{display:grid;grid-template-columns:minmax(190px,.7fr) 2fr;gap:14px;flex:1;min-height:0;margin-top:8px}
.gm-gartic-phone .al-list{display:flex;flex-direction:column;gap:8px;overflow:auto;max-height:470px}
.gm-gartic-phone .al-pl{display:flex;align-items:center;gap:10px;padding:6px 10px 6px 6px;border-radius:30px;border:0;background:rgba(255,255,255,.16);color:#fff;font:900 14px/1 ${FONT};text-transform:uppercase;cursor:pointer;text-align:left;min-width:0}
.gm-gartic-phone .al-pl span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-gartic-phone .al-pl.on{background:#9cf5d2;color:#2b1248}
.gm-gartic-phone .al-pl.seen::after{content:'';width:9px;height:9px;border-radius:50%;background:#61ffc9;flex:none}
.gm-gartic-phone .al-pl.on.seen::after{background:#2b8c68}
.gm-gartic-phone .al-main{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0}
.gm-gartic-phone .al-box{flex:1;overflow:auto;max-height:430px;padding:14px;border-radius:14px;background:rgba(36,20,110,.55);scroll-behavior:smooth}
.gm-gartic-phone .al-row{display:flex;gap:10px;margin-bottom:18px;animation:gpIn .4s}
.gm-gartic-phone .al-bd{flex:1;min-width:0}
.gm-gartic-phone .al-bd>b{display:block;font:900 12.5px/1 ${FONT};text-transform:uppercase;letter-spacing:.03em;color:#e2d6ff;margin:2px 0 5px}
.gm-gartic-phone .al-bub{position:relative;background:#fff;color:#2b1248;border-radius:3px 10px 10px 10px;padding:10px 14px;font:800 clamp(15px,2.2vw,19px)/1.3 ${FONT};max-width:min(100%,560px);word-wrap:break-word;box-shadow:0 3px 0 rgba(0,0,0,.2)}
.gm-gartic-phone .al-bub.art{padding:0;overflow:hidden;line-height:0;width:min(100%,560px)}
.gm-gartic-phone .al-sep{display:flex;align-items:center;gap:12px;margin:6px 0 16px;font:900 12px ${FONT};letter-spacing:.08em;color:rgba(255,255,255,.7)}
.gm-gartic-phone .al-sep::before,.gm-gartic-phone .al-sep::after{content:'';flex:1;height:2px;background:rgba(255,255,255,.3)}
.gm-gartic-phone .al-ctl{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center}
.gm-gartic-phone .al-fps{display:flex;gap:6px;margin-top:8px}
.gm-gartic-phone .al-fps button{border:0;border-radius:8px;padding:6px 10px;font:900 12px ${FONT};background:rgba(255,255,255,.2);color:#fff;cursor:pointer}
.gm-gartic-phone .al-fps button.on{background:#fff;color:#2b1248}
.gm-gartic-phone .gp-msg{flex:1;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;text-align:center}
.gm-gartic-phone .gp-msg p{font-weight:800;font-size:16px;max-width:36ch;opacity:.9}
@media (max-width:700px){
.gm-gartic-phone .gp{padding:12px 10px}
.gm-gartic-phone .gp-tcols,.gm-gartic-phone .gp-lcols,.gm-gartic-phone .al-cols{grid-template-columns:minmax(0,1fr)}
.gm-gartic-phone .gp-presets{grid-template-columns:repeat(2,1fr)}
.gm-gartic-phone .gp-step{font-size:26px}
.gm-gartic-phone .gp-clock{width:46px;height:46px}
.gm-gartic-phone .al-list{flex-direction:row;max-height:none}
.gm-gartic-phone .al-pl{flex:none}
.gm-gartic-phone .gp-set{grid-template-columns:1fr}
.gm-gartic-phone .gp-card{flex-direction:column;text-align:center}
.gm-gartic-phone .np-ref{flex-basis:30%}
}
${padCss('.gm-gartic-phone')}`;

  const sysAv = px => `<svg class="av" viewBox="0 0 100 100" width="${px}" height="${px}"><circle cx="50" cy="50" r="49" fill="#fff"/><circle cx="50" cy="50" r="45" fill="#ffb54a"/><g stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M24 70V44q0-12 14-12h24q14 0 14 12v26z" fill="#9a5be0"/><rect x="32" y="40" width="36" height="22" rx="6" fill="#7fe3bd"/><circle cx="50" cy="51" r="6" fill="#fff"/><path d="M20 74h60v6H20z" fill="#5b2bb8"/></g><circle cx="50" cy="50" r="45" fill="none" stroke="${OUT}" stroke-width="3"/></svg>`;
  const hashAv = id => { let h = 7; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) % AV_N; };
  const CROWN = '<i class="crown"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg></i>';
  const CHECK = '<em><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></em>';
  const DICE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.4" fill="currentColor"/><circle cx="15" cy="15" r="1.4" fill="currentColor"/><circle cx="15" cy="9" r="1.4" fill="currentColor"/><circle cx="9" cy="15" r="1.4" fill="currentColor"/></svg>';
  const pie = f => {
    if (f >= .999) return 'M18 3a15 15 0 1 0 .01 0z';
    if (f <= .001) return '';
    const a = f * TAU - Math.PI / 2;
    return `M18 18L18 3A15 15 0 ${f > .5 ? 1 : 0} 1 ${(18 + 15 * Math.cos(a)).toFixed(2)} ${(18 + 15 * Math.sin(a)).toFixed(2)}Z`;
  };
  const CLOCK = '<div class="gp-clock"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#fff"/><circle cx="18" cy="18" r="15" fill="#e7d4f2"/><path class="pie" d="M18 3a15 15 0 1 0 .01 0z" fill="#d44f9a"/></svg><b></b></div>';

  function mountGartic(root, api) {
    const M = {
      scene: 'title', tok: 0, seat: -1, pl: [], N: 0, mode: 'normal', opt: { ...OPT_DEF }, lob: null, rd: null, sent: false, pad: null, online: false,
      done: [], albums: [], alN: 0, alMode: 'normal', al: { cur: -1, host: 0, follow: true, seen: {}, rv: 0, skip: false, done: false, rp: null, timer: 0 },
      av: lsGet('gartic:av', Math.floor(Math.random() * AV_N)), dl: 0, dur: 0, low: false, tick: -1, tab: 'pre', how: 0, drawn: (api.load() || {}).drawn | 0, pr: null
    };
    const H = { phase: 'lobby', mode: 'normal', opt: { ...OPT_DEF }, av: {}, players: [], chains: [], plan: [], R: 0, r: -1, sub: new Set(), dl: 0, adv: false, seeded: false, show: 0, N: 0 };
    let P;
    const scr = (ph, html) => {
      M.tok++; M.scene = ph; stopAl();
      if (M.pad) M.pad = null;
      root.dataset.ph = ph === 'lobby' || ph === 'title' || ph === 'msg' ? 'title' : ph;
      if (M.gp) M.gp.remove();
      M.gp = mk('div', 'gp', `<div class="gp-tb"><i></i></div>${html}`);
      root.prepend(M.gp);
      M.dl = 0;
      const tb = q(root, '.gp-tb'); if (tb) tb.style.visibility = 'hidden';
    };
    const stopAl = () => { M.al.rv++; if (M.al.rp) { M.al.rp.stop(); M.al.rp = null; } clearInterval(M.al.timer); clearTimeout(M.al.auto); };
    const sleep = ms => new Promise(r => api.timeout(r, ms));

    function title() {
      M.online = false;
      scr('title', `<div class="gp-title">${GP_LOGO}<div class="gp-tcols">
<div class="gp-panel gp-prof"><button class="gp-avbtn" data-a="av" aria-label="Change character">${avG(M.av, 150)}<span class="gp-rr"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.6-5.9M20 4v5h-5"/></svg></span></button>
<div class="gp-nm">${esc(myName())}</div><p class="gp-sub">Tap your character to pick another one. Gather 3 to 16 friends and play the telephone game.</p>
<button class="gp-btn" data-a="online">Play online</button><button class="gp-btn ghost" data-a="practice" style="width:min(280px,100%)">Practice drawing</button></div>
<div class="gp-panel gp-how"><h3 class="gp-h">HOW TO PLAY</h3><div class="gp-slide"></div><div class="gp-dots">${HOW.map((x, i) => `<i data-a="how" data-i="${i}"></i>`).join('')}</div></div></div></div>`);
      const paintHow = () => {
        const s = HOW[M.how % HOW.length], sl = q(root, '.gp-slide');
        if (!sl) return;
        sl.innerHTML = `<svg viewBox="0 0 100 90">${s[2]}</svg><b>${s[0]}</b><span>${s[1]}</span>`;
        qa(root, '.gp-dots i').forEach((d, i) => d.classList.toggle('on', i === M.how % HOW.length));
      };
      M.paintHow = paintHow; paintHow();
    }

    async function startOnline() {
      M.online = true;
      scr('msg', '<div class="gp-msg"><h2 class="gp-h">Opening the party…</h2></div>');
      const tok = M.tok;
      const r = await P.open();
      if (!api.alive || tok !== M.tok) return;
      if (!r) { title(); return; }
      H.phase = 'lobby'; H.av[P.me] = M.av;
      scr('msg', '<div class="gp-msg"><h2 class="gp-h">Joining the game…</h2></div>');
      P.up({ t: 'hello', av: M.av });
      if (P.hub) pushLob();
    }
    const lobPlayers = () => P.players().filter(p => p.inGame !== false).map(p => ({ id: p.id, n: p.name, av: H.av[p.id] != null ? H.av[p.id] : hashAv(p.id), lead: p.id === P.leader() }));
    function pushLob() {
      if (!P.hub || H.phase !== 'lobby') return;
      P.bcast({ t: 'lob', pl: lobPlayers(), mode: H.mode, opt: H.opt, size: P.r ? P.r.size : 16, lead: P.leader() });
    }

    function lobby() {
      const L = M.lob;
      if (!L) return;
      const lead = L.lead === P.me, mode = L.mode, o = L.opt;
      const empties = Math.min(Math.max(0, L.size - L.pl.length), 4);
      const sel = (k, opts) => `<select data-set="${k}" ${lead ? '' : 'disabled'}>${opts.map(([v, n]) => `<option value="${v}" ${String(o[k]) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
      const can = lead && L.pl.length >= 3;
      scr('lobby', `<div class="gp-top"><button class="gp-btn ghost" data-a="back">‹ ${P.hub ? 'Party' : 'Leave'}</button>${GP_LOGO}<span></span></div>
<div class="gp-lcols"><div class="gp-panel"><h3 class="gp-h">PLAYERS ${L.pl.length}/${L.size}</h3><div class="gp-plist">${L.pl.map(p => `<div class="gp-pr ${p.id === P.me ? 'me' : ''}">${avG(p.av, 40)}<span>${esc(p.n)}</span>${p.lead ? CROWN : ''}</div>`).join('')}${Array.from({ length: empties }, () => '<div class="gp-pr empty"><span>EMPTY</span></div>').join('')}</div></div>
<div class="gp-panel"><div class="gp-tabs"><b data-a="tab" data-v="pre" class="${M.tab === 'pre' ? 'on' : ''}">PRESETS</b><b data-a="tab" data-v="cus" class="${M.tab === 'cus' ? 'on' : ''}">CUSTOM SETTINGS</b></div>
${M.tab === 'pre' ? `<div class="gp-presets">${Object.keys(GMODES).map(k => `<button class="gp-pre ${k === mode ? 'on' : ''}" data-a="mode" data-v="${k}" ${lead ? '' : 'disabled'}><svg viewBox="0 0 64 64">${GM_IC[k]}</svg>${GMODES[k].n}</button>`).join('')}</div>`
        : `<div class="gp-set"><label>Time${sel('speed', Object.keys(SPD_N).map(k => [k, SPD_N[k]]))}</label><label>Turns${sel('turns', [['all', 'All'], ...[3, 4, 5, 6, 8, 10].map(n => [n, n + ' turns'])])}</label><label>Album${sel('album', [['manual', 'Leader picks next'], ['auto', 'Automatic']])}</label><label>Mode${sel('mode', Object.keys(GMODES).map(k => [k, GMODES[k].n]))}</label></div>`}
<p class="gp-mdesc"><b>${GMODES[mode].n}.</b> ${GMODES[mode].d}</p></div></div>
<div class="gp-foot"><button class="gp-btn" data-a="invite">Invite</button>${lead ? `<button class="gp-btn go" data-a="start" ${can ? '' : 'disabled'}>Start</button>` : '<span class="gp-hint">Waiting for the leader to start…</span>'}</div>`);
    }

    function begin() {
      const pl = lobPlayers();
      if (pl.length < 3 || H.phase !== 'lobby') return;
      H.phase = 'play'; H.mode = H.mode in GMODES ? H.mode : 'normal';
      H.players = pl.map(p => ({ id: p.id, n: p.n, av: p.av, gone: false }));
      H.N = pl.length; H.plan = gPlan(H.mode, H.N, H.opt); H.R = H.plan.length; H.r = -1;
      H.seeded = H.mode === 'knock' || H.mode === 'anim' || H.mode === 'master';
      H.chains = Array.from({ length: H.N }, () => H.seeded ? [{ by: -1, k: 't', v: randPrompt() }] : []);
      H.players.forEach((p, i) => P.to(p.id, { t: 'go', seat: i, pl: H.players.map(x => ({ n: x.n, av: x.av })), mode: H.mode, opt: H.opt, N: H.N, R: H.R }));
      api.timeout(() => { if (H.phase === 'play' && H.r < 0) startRound(); }, 3900);
    }
    const seatOf = id => H.players.findIndex(p => p.id === id);
    const chainOf = (s, r) => ((s - r) % H.N + H.N) % H.N;
    const off = () => H.seeded ? 1 : 0;
    function roundMsg(s) {
      const r = H.r, rd = H.plan[r], ch = H.chains[chainOf(s, r)], prev = ch[r - 1 + off()];
      const m = { t: 'rd', r, R: H.R, k: rd.k, time: rd.time, mode: H.mode };
      if (rd.k === 'w') { if (prev) m[prev.k === 't' ? 'text' : 'ops'] = prev.v; }
      else if (rd.k === 'd') { if (prev) m.text = prev.v; }
      else if (rd.k === 'c') { m.ops = prev ? prev.v : []; }
      else if (rd.k === 'f') { m.text = ch[0] ? ch[0].v : ''; if (prev && prev.k === 'd') m.ops = prev.v; }
      return m;
    }
    function autoFill(s) {
      const r = H.r, rd = H.plan[r], c = chainOf(s, r), ch = H.chains[c];
      if (ch[r + off()]) return;
      ch[r + off()] = { by: s, k: rd.k === 'w' ? 't' : 'd', v: rd.k === 'w' ? (r === 0 ? randPrompt() : '…') : [] };
      H.sub.add(s);
    }
    function startRound() {
      H.r++;
      if (H.r >= H.R) return finish();
      const rd = H.plan[H.r];
      H.sub = new Set(); H.adv = false;
      H.dl = rd.time ? Date.now() + 1900 + rd.time * 1000 : 0;
      H.players.forEach((p, s) => { if (p.gone) autoFill(s); else P.to(p.id, roundMsg(s)); });
      P.bcast({ t: 'dn', d: [...H.sub] });
      checkAll();
    }
    function checkAll() {
      if (H.phase !== 'play' || H.adv) return;
      if (H.players.every((p, s) => p.gone || H.sub.has(s))) { H.adv = true; api.timeout(() => { if (H.phase === 'play') startRound(); }, 700); }
    }
    function onSub(d, from) {
      const s = seatOf(from);
      if (H.phase !== 'play' || s < 0 || d.r !== H.r || H.sub.has(s)) return;
      const rd = H.plan[H.r], c = chainOf(s, H.r);
      const v = rd.k === 'w' ? cleanText(d.v, 100) || (H.r === 0 ? randPrompt() : '…') : cleanOps(d.v);
      H.chains[c][H.r + off()] = { by: s, k: rd.k === 'w' ? 't' : 'd', v };
      H.sub.add(s);
      P.bcast({ t: 'dn', d: [...H.sub] });
      checkAll();
    }
    function hostTick() {
      if (H.phase !== 'play' || H.adv || !H.dl || Date.now() < H.dl + 3800) return;
      H.players.forEach((p, s) => autoFill(s));
      checkAll();
    }
    function finish() {
      H.phase = 'album'; H.show = 0;
      const pl = H.players.map(p => ({ n: p.n, av: p.av, gone: p.gone }));
      P.bcast({ t: 'alb0', pl, mode: H.mode, opt: H.opt, n: H.N });
      H.chains.forEach((ch, i) => P.bcast({ t: 'alb', i, e: ch.map(e => [e.by, e.k, e.v]) }));
      P.bcast({ t: 'show', c: 0 });
    }
    function snapFor(id) {
      const s = seatOf(id);
      if (H.phase === 'lobby') return pushLob();
      if (s < 0) return;
      P.to(id, { t: 'go', seat: s, pl: H.players.map(x => ({ n: x.n, av: x.av })), mode: H.mode, opt: H.opt, N: H.N, R: H.R, re: 1 });
      if (H.phase === 'play' && H.r >= 0) {
        const m = roundMsg(s);
        m.re = 1; m.time = H.dl ? Math.max(5, Math.round((H.dl - Date.now()) / 1000)) : 0; m.sub = H.sub.has(s);
        P.to(id, m);
        P.to(id, { t: 'dn', d: [...H.sub] });
      } else if (H.phase === 'album') {
        P.to(id, { t: 'alb0', pl: H.players.map(p => ({ n: p.n, av: p.av, gone: p.gone })), mode: H.mode, opt: H.opt, n: H.N });
        H.chains.forEach((ch, i) => P.to(id, { t: 'alb', i, e: ch.map(e => [e.by, e.k, e.v]) }));
        P.to(id, { t: 'show', c: H.show });
      }
    }
    function onHost(d, from) {
      const lead = from === P.leader();
      if (d.t === 'hello') { H.av[from] = ((d.av | 0) % AV_N + AV_N) % AV_N; pushLob(); if (H.phase !== 'lobby') snapFor(from); }
      else if (d.t === 'set' && lead && H.phase === 'lobby') {
        if (GMODES[d.mode]) H.mode = d.mode;
        const o = d.opt || {};
        if (SPD[o.speed]) H.opt.speed = o.speed;
        if (o.turns === 'all' || (+o.turns >= 2 && +o.turns <= 16)) H.opt.turns = o.turns === 'all' ? 'all' : +o.turns;
        if (o.album === 'auto' || o.album === 'manual') H.opt.album = o.album;
        pushLob();
      }
      else if (d.t === 'start' && lead) begin();
      else if (d.t === 'sub') onSub(d, from);
      else if (d.t === 'show' && lead && H.phase === 'album' && d.c >= 0 && d.c < H.N) { H.show = d.c | 0; P.bcast({ t: 'show', c: H.show }); }
      else if (d.t === 'again' && lead && H.phase === 'album') { H.phase = 'lobby'; pushLob(); }
    }
    function onLeave(p) {
      if (H.phase === 'lobby') { delete H.av[p.id]; return pushLob(); }
      const s = seatOf(p.id);
      if (s < 0 || H.players[s].gone) return;
      H.players[s].gone = true;
      P.bcast({ t: 'gone', s });
      if (H.phase === 'play') {
        if (H.players.filter(x => !x.gone).length < 2) { H.players.forEach((x, i) => autoFill(i)); H.adv = true; api.timeout(() => { H.r = H.R; finish(); }, 300); return; }
        autoFill(s); P.bcast({ t: 'dn', d: [...H.sub] }); checkAll();
      }
    }

    function clockTick() {
      if (!M.dl) return;
      const rem = Math.max(0, (M.dl - performance.now()) / 1000), f = M.dur ? rem / M.dur : 1;
      const tb = q(root, '.gp-tb'), pe = q(root, '.pie'), b = q(root, '.gp-clock b');
      if (tb) { tb.style.visibility = 'visible'; tb.firstChild.style.transform = `scaleX(${f.toFixed(4)})`; tb.classList.toggle('low', rem < 10); }
      if (pe) pe.setAttribute('d', pie(f));
      if (b) b.textContent = Math.ceil(rem);
      const ts = Math.ceil(rem);
      if (rem < 6 && ts !== M.tick && rem > 0) { M.tick = ts; api.sfx('tick'); }
      if (rem <= 0 && M.rd && !M.sent && M.scene !== 'wait') submit(true);
      if (rem <= 0) M.dl = 0;
    }
    api.loop(() => clockTick());

    function cardText(d) {
      if (d.k === 'w') return d.r === 0 ? [d.mode === 'story' ? 'STORY TIME' : 'STEP 1', d.mode === 'story' ? 'START A <em>STORY</em>' : 'EVERYONE <em>WRITES</em> A SENTENCE'] : d.mode === 'story' ? ['KEEP GOING', 'CONTINUE THE <em>STORY</em>'] : ['DESCRIBE!', 'WRITE WHAT YOU <em>SEE</em>'];
      if (d.k === 'c') return ['KNOCK-OFF', '<em>COPY</em> THE DRAWING'];
      if (d.k === 'f') return ['ANIMATE!', 'DRAW THE NEXT <em>FRAME</em>'];
      return ['STEP ' + (d.r + 1), 'TIME TO <em>DRAW!</em>'];
    }
    async function cardScene(d) {
      const [tag, h] = cardText(d);
      scr('card', `<div class="gp-ov" style="background:transparent"><div class="gp-burst"></div><div class="gp-card"><div>${avG(M.av, 150)}</div><div><span class="tag">${tag}</span><h2>${h}</h2></div></div></div>`);
      root.dataset.ph = d.k === 'w' ? 'write' : 'draw';
      api.sfx('pop');
    }
    function startTimer(d) {
      M.dur = d.time || 0; M.dl = d.time ? performance.now() + d.time * 1000 : 0; M.tick = -1;
      const b = q(root, '.gp-clock b'); if (b && !d.time) b.textContent = '∞';
    }
    const head = (small, big) => `<div class="np-head"><i class="ring l"></i><i class="ring r"></i><small>${small}</small><h2>${big}</h2></div>`;
    const stepHtml = d => d.practice ? '' : `<div class="gp-step">${d.r + 1}/${d.R}</div>${CLOCK}`;
    const leaveBtn = () => M.online ? '<button class="gp-btn ghost gp-leave sm" data-a="leave">Leave</button>' : '';

    function writeScene(d) {
      const prevTxt = d.text != null, prevArt = !!d.ops;
      const hs = d.r === 0 ? 'STEP 1' : 'STEP ' + (d.r + 1), ttl = d.r === 0 ? (d.mode === 'story' ? 'START A STORY' : 'WRITE A WEIRD SENTENCE') : prevArt ? 'DESCRIBE THIS DRAWING' : 'CONTINUE THE STORY';
      scr('write', `<div class="gp-task">${stepHtml(d)}<div class="np">${head(hs, ttl)}<div class="np-write">${prevArt ? '<div class="wv"></div>' : prevTxt ? `<div class="gp-prompt">${esc(d.text)}</div>` : '<div class="gp-prompt" style="font-size:16px;font-weight:800">Write something funny for the next player to draw.<br>Be creative: weird, specific and silly sentences work best!</div>'}
<div class="gp-wrow"><input class="gp-in" maxlength="100" autocomplete="off" spellcheck="true" placeholder="${prevArt ? 'Type your description for this scene here...' : d.mode === 'story' ? 'Write what happens next...' : 'Type your sentence here...'}"><button class="gp-dice" data-a="dice" title="Random sentence" aria-label="Random sentence">${DICE}</button></div>
<div class="gp-donebar"><button class="gp-btn" data-a="done">Done!</button></div></div></div>${leaveBtn()}</div>`);
      if (prevArt) { const v = viewer(800, 450, 1); v.board.setOps(cleanOps(d.ops)); q(root, '.wv').replaceWith(v.el); v.el.classList.add('dp-view'); }
      const inp = q(root, '.gp-in');
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(false); } e.stopPropagation(); });
      inp.addEventListener('keyup', e => e.stopPropagation());
      setTimeout(() => { if (api.alive) inp.focus({ preventScroll: true }); }, 60);
      startTimer(d);
    }
    function drawScene(d) {
      const k = d.k, copy = k === 'c', frame = k === 'f';
      const pad = createPad({ w: 800, h: 450, sc: 2, layout: 'g', sizes: [2, 5, 9, 16, 28], tools: ['pen', 'eraser', 'rect', 'ell', 'rectF', 'ellF', 'line', 'fill', 'undo', 'redo'] }, api);
      const ttl = frame ? 'FRAME ' + (d.r + 1) + ' OF ' + d.R : copy ? 'COPY THE DRAWING' : d.practice ? 'FREE DRAWING' : 'HEY, IT\'S TIME TO DRAW!';
      const big = copy ? 'MAKE IT LOOK THE SAME' : esc(d.text || '');
      scr('draw', `<div class="gp-task">${stepHtml(d)}<div class="gp-padhost"></div>${leaveBtn()}</div>`);
      const np = mk('div', 'np', head(ttl, big)), body = mk('div', 'np-body');
      if (copy) {
        const rf = mk('div', 'np-ref', '<small>Copy this</small>'), v = viewer(800, 450, 1);
        v.board.setOps(cleanOps(d.ops)); rf.append(v.el); body.append(rf);
      }
      body.append(pad.cvw); np.append(body); pad.stage.append(np);
      if (frame && d.ops) pad.ghost(cleanOps(d.ops));
      const done = mk('button', 'gp-btn dp-act', icon('check') + '<span>Done!</span>');
      done.dataset.a = 'done'; pad.el.append(done);
      q(root, '.gp-padhost').append(pad.el);
      M.pad = pad; pad.refresh();
      startTimer(d);
    }
    function waitScene() {
      scr('wait', `<div class="gp-wait"><h2 class="gp-h">WAITING FOR THE OTHERS…</h2><div class="gp-wgrid">${M.pl.map((p, i) => `<div class="gp-wp ${M.done.includes(i) ? 'ok' : ''}">${avG(p.av, 62)}${CHECK}<span>${esc(p.n)}</span></div>`).join('')}</div><p class="gp-sub">${M.rd && M.rd.time ? 'The round ends when everybody is done or time is up.' : 'Take your time. The round ends when everybody is done.'}</p></div><div class="gp-top" style="position:absolute;right:18px;top:12px">${CLOCK}</div>${leaveBtn()}`);
    }
    function taskScene(d) {
      M.rd = d; M.sent = !!d.sub;
      if (d.sub) { waitScene(); return; }
      if (d.k === 'w') writeScene(d); else drawScene(d);
    }
    function submit(auto) {
      const d = M.rd;
      if (!d || M.sent) return;
      let v;
      if (d.practice) return practiceDone();
      if (d.k === 'w') {
        const inp = q(root, '.gp-in');
        v = cleanText(inp ? inp.value : '', 100);
        if (!v && !auto) { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); api.sfx('bad'); return; }
      } else { v = M.pad ? M.pad.ops.slice() : []; M.drawn++; api.score(M.drawn); api.save({ drawn: M.drawn }); api.submit(M.drawn); }
      M.sent = true;
      api.sfx('good');
      P.up({ t: 'sub', r: d.r, v });
      const dl = M.dl, dur = M.dur;
      waitScene();
      M.dl = dl; M.dur = dur;
    }

    function practice(prompt) {
      const d = { practice: true, k: 'd', text: prompt || randPrompt(), r: 0, R: 1, time: 0 };
      M.rd = d; M.sent = false;
      drawScene(d);
      const bar = mk('div', 'gp-wrow'); bar.style.cssText = 'justify-content:center;margin-top:10px';
      bar.innerHTML = '<button class="gp-btn ghost" data-a="newp">New prompt</button><button class="gp-btn ghost" data-a="menu">Menu</button>';
      q(root, '.gp-padhost').append(bar);
    }
    function practiceDone() {
      const ops = M.pad ? M.pad.ops.slice() : [], text = M.rd.text;
      scr('wait', `<div class="gp-wait"><h2 class="gp-h">${esc(text)}</h2><div class="al-bub art" style="width:min(100%,620px)"></div><div class="gp-wrow"><button class="gp-btn" data-a="psave">Save image</button><button class="gp-btn ghost" data-a="prep">Replay</button><button class="gp-btn ghost" data-a="newp">New prompt</button><button class="gp-btn ghost" data-a="menu">Menu</button></div></div>`);
      const v = viewer(800, 450, 2); q(root, '.al-bub').append(v.el);
      M.pr = { v, ops };
      M.pr.rp = playReplay(v.board, ops, { maxSec: 6 });
      api.sfx('win');
    }

    const isLead = () => !!P && api.net.leader === P.me;
    const plOf = by => by < 0 ? { n: 'GARTIC', svg: sysAv(44) } : { n: (M.pl[by] || {}).n || '?', svg: avG((M.pl[by] || {}).av | 0, 44) };

    function startAlbum() {
      Object.assign(M.al, { cur: -1, seen: {}, skip: false, done: false, follow: true, fps: M.al.fps || 2 });
      scr('album', `<div class="gp-top"><button class="gp-btn ghost" data-a="leave">‹ Home</button>${GP_LOGO}<span></span></div>
<div class="al-cols"><div><h3 class="gp-h">PLAYERS</h3><div class="al-list" style="margin-top:10px">${M.pl.map((p, i) => `<button class="al-pl" data-a="alc" data-i="${i}">${avG(p.av, 38)}<span>${esc(p.n)}</span></button>`).join('')}</div></div>
<div class="al-main"><h3 class="gp-h al-title"></h3><div class="al-box"></div><div class="al-ctl"></div></div></div>`);
      openChain(M.al.host);
    }
    function paintCtl() {
      const ctl = q(root, '.al-ctl');
      if (!ctl) return;
      const c = M.al.cur, lead = isLead(), last = c >= M.N - 1;
      let h = '';
      if (!M.al.done) h += '<button class="gp-btn ghost" data-a="skip">Skip</button>';
      else {
        h += '<button class="gp-btn ghost" data-a="save">Save image</button><button class="gp-btn ghost" data-a="rep">Replay</button>';
        if (!lead && !M.al.follow) h += '<button class="gp-btn sm" data-a="follow">Follow the host</button>';
        if (lead) h += last ? '<button class="gp-btn go" data-a="again">Play again</button>' : '<button class="gp-btn go" data-a="next">Next album ▶</button>';
        else if (last && M.al.follow) h += '<span class="gp-hint">Waiting for the leader…</span>';
      }
      ctl.innerHTML = h;
    }
    async function openChain(c) {
      if (c < 0 || c >= M.N || !M.albums[c]) return;
      stopAl();
      const tok = ++M.al.rv;
      Object.assign(M.al, { cur: c, skip: false, done: false, wake: null });
      M.al.seen[c] = true;
      qa(root, '.al-pl').forEach((b, i) => { b.classList.toggle('on', i === c); b.classList.toggle('seen', !!M.al.seen[i]); });
      const title = q(root, '.al-title'), box = q(root, '.al-box');
      if (!box) return;
      title.textContent = ((M.pl[c] || {}).n || '') + '\'S ALBUM';
      box.innerHTML = ''; paintCtl();
      const nap = ms => new Promise(res => {
        if (M.al.skip) return res();
        const t = setTimeout(res, ms);
        M.al.wake = () => { clearTimeout(t); res(); };
      });
      const ent = M.albums[c];
      for (let i = 0; i < ent.length; i++) {
        const [by, k, v] = ent[i], who = plOf(by), row = mk('div', 'al-row'), bd = mk('div', 'al-bd', `<b>${esc(who.n)}</b>`), bub = mk('div', 'al-bub');
        row.innerHTML = who.svg; bd.append(bub); row.append(bd);
        let vw = null;
        if (k === 't') bub.textContent = String(v == null ? '' : v).slice(0, 120);
        else { bub.classList.add('art'); vw = viewer(800, 450, 1); bub.append(vw.el); }
        box.append(row); box.scrollTop = box.scrollHeight;
        api.sfx('pop');
        if (k === 't') await nap(900 + String(v).length * 22);
        else {
          const ops = cleanOps(v);
          await new Promise(res => { M.al.rp = playReplay(vw.board, ops, { maxSec: M.al.skip ? .01 : 6, onDone: res, onFrame: () => { box.scrollTop = box.scrollHeight; } }); });
          if (tok !== M.al.rv) return;
          await nap(650);
        }
        if (tok !== M.al.rv) return;
      }
      if (M.alMode === 'anim') {
        const frames = ent.filter(e => e[1] === 'd').map(e => { const b = new Board(800, 450, 1); b.setOps(cleanOps(e[2])); return b; });
        if (frames.length) {
          const sep = mk('div', 'al-sep', 'ANIMATION'), cv = mk('canvas', 'dp-main'), wrap = mk('div', 'dp-cv dp-view');
          cv.width = 800; cv.height = 450; wrap.style.aspectRatio = '800 / 450'; wrap.append(cv);
          const ctx = cv.getContext('2d'), bub = mk('div', 'al-bub art'), fps = mk('div', 'al-fps');
          bub.append(wrap);
          let n = 0;
          const run = () => { clearInterval(M.al.timer); M.al.timer = setInterval(() => { ctx.drawImage(frames[n++ % frames.length].cv, 0, 0); }, 1000 / M.al.fps); fps.innerHTML = [1, 2, 4, 8].map(f => `<button data-a="fps" data-f="${f}" class="${f === M.al.fps ? 'on' : ''}">${f} fps</button>`).join(''); };
          M.al.run = run; run();
          const host = mk('div', 'al-row'); const bd = mk('div', 'al-bd'); bd.append(bub, fps); host.append(bd);
          box.append(sep, host); box.scrollTop = box.scrollHeight;
        }
      }
      M.al.done = true; paintCtl(); api.sfx('good');
      if (c === M.N - 1) api.sfx('win');
      if (isLead() && M.opt.album === 'auto' && c < M.N - 1) M.al.auto = setTimeout(() => { if (M.al.cur === c && api.alive) P.up({ t: 'show', c: c + 1 }); }, 4500);
    }

    async function saveAlbum(c) {
      const ent = M.albums[c] || [], W = 880, pad = 24, aw = 52, bw = 560;
      const rows = ent.map(e => ({ e, h: e[1] === 't' ? 74 : Math.round(bw * 450 / 800) + 36 }));
      const H2 = 110 + rows.reduce((s, r) => s + r.h + 14, 0) + pad;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H2;
      const g = cv.getContext('2d');
      const gr = g.createLinearGradient(0, 0, W, H2); gr.addColorStop(0, '#5c76e6'); gr.addColorStop(.55, '#6a3bd0'); gr.addColorStop(1, '#2f9cd8');
      g.fillStyle = gr; g.fillRect(0, 0, W, H2);
      g.fillStyle = '#fff'; g.font = `900 30px ${FONT}`; g.textBaseline = 'top';
      g.fillText(((M.pl[c] || {}).n || '').toUpperCase() + '\'S ALBUM  ·  Gartic Phone', pad, 30);
      const img = svg => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); });
      let y = 100;
      for (const { e, h } of rows) {
        const who = plOf(e[0]), im = await img(e[0] < 0 ? sysAv(aw) : avG((M.pl[e[0]] || {}).av | 0, aw));
        if (im) g.drawImage(im, pad, y, aw, aw);
        g.fillStyle = '#e2d6ff'; g.font = `900 14px ${FONT}`; g.fillText(who.n.toUpperCase(), pad + aw + 12, y);
        const bx = pad + aw + 12, by = y + 20;
        g.fillStyle = '#fff';
        if (e[1] === 't') {
          g.beginPath(); g.roundRect(bx, by, bw, 46, 10); g.fill();
          g.fillStyle = '#2b1248'; g.font = `800 20px ${FONT}`; g.fillText(String(e[2]).slice(0, 52), bx + 14, by + 12);
        } else {
          const b = new Board(800, 450, 1); b.setOps(cleanOps(e[2]));
          g.fillRect(bx, by, bw, h - 36); g.drawImage(b.cv, bx, by, bw, h - 36);
        }
        y += h + 14;
      }
      savePng(cv, 'gartic-phone-album-' + (c + 1) + '.png');
    }

    const copyLink = () => copyLinkFor(api);

    const ACT = {
      av() { M.av = (M.av + 1 + Math.floor(Math.random() * 7)) % AV_N; lsSet('gartic:av', M.av); title(); },
      how(b) { M.how = +b.dataset.i; M.paintHow(); },
      online() { startOnline(); },
      practice() { practice(); },
      newp() { practice(); },
      menu() { title(); },
      psave() { if (M.pr) savePng(M.pr.v.board.cv, 'gartic-practice.png'); },
      prep() { if (!M.pr) return; if (M.pr.rp) M.pr.rp.stop(); M.pr.rp = playReplay(M.pr.v.board, M.pr.ops, { maxSec: 6 }); },
      tab(b) { M.tab = b.dataset.v; lobby(); },
      mode(b) { P.up({ t: 'set', mode: b.dataset.v }); },
      start() { P.up({ t: 'start' }); },
      back() { if (P.hub) startOnline(); else { api.net.close(); title(); } },
      leave() { api.net.close(); title(); },
      invite: copyLink,
      dice() { const i = q(root, '.gp-in'); if (i) { i.value = randPrompt(); i.focus(); } },
      done() { submit(false); },
      alc(b) { const i = +b.dataset.i; if (isLead()) P.up({ t: 'show', c: i }); else { M.al.follow = false; openChain(i); } },
      skip() { M.al.skip = true; if (M.al.wake) M.al.wake(); if (M.al.rp) M.al.rp.finish(); },
      rep() { openChain(M.al.cur); },
      save() { saveAlbum(M.al.cur); },
      next() { P.up({ t: 'show', c: M.al.cur + 1 }); },
      again() { P.up({ t: 'again' }); },
      follow() { M.al.follow = true; openChain(M.al.host); },
      fps(b) { M.al.fps = +b.dataset.f; if (M.al.run) M.al.run(); }
    };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || !M.gp || !M.gp.contains(b) || !ACT[b.dataset.a]) return;
      if (b.dataset.a !== 'done') api.sfx('tap');
      ACT[b.dataset.a](b);
    });
    root.addEventListener('change', e => {
      const s = e.target.closest('[data-set]');
      if (!s) return;
      const k = s.dataset.set;
      if (k === 'mode') P.up({ t: 'set', mode: s.value });
      else P.up({ t: 'set', opt: { [k]: k === 'turns' && s.value !== 'all' ? +s.value : s.value } });
    });

    async function countdown() {
      for (let n = 3; n >= 1; n--) {
        scr('card', `<div class="gp-ov" style="background:transparent"><div class="gp-burst"></div><div class="gp-cd"><b>${n}</b></div></div>`);
        root.dataset.ph = 'title';
        api.sfx('tick');
        const tok = M.tok;
        await sleep(900);
        if (tok !== M.tok) return;
      }
    }
    async function roundIn(d) {
      if (d.re) { taskScene(d); return; }
      cardScene(d);
      const tok = M.tok;
      await sleep(1700);
      if (tok !== M.tok) return;
      taskScene(d);
    }
    function onClient(d) {
      switch (d.t) {
        case 'lob':
          M.lob = d; M.mode = d.mode; M.opt = d.opt;
          if (M.scene === 'play' || M.scene === 'draw' || M.scene === 'write') break;
          lobby(); break;
        case 'go':
          M.seat = d.seat; M.pl = d.pl.map(x => ({ n: x.n, av: x.av, gone: false })); M.N = d.N; M.mode = d.mode; M.opt = d.opt; M.R = d.R; M.done = []; M.albums = []; M.rd = null;
          if (!d.re) countdown();
          break;
        case 'rd': roundIn(d); break;
        case 'dn':
          M.done = Array.isArray(d.d) ? d.d : [];
          if (M.scene === 'wait') qa(root, '.gp-wp').forEach((e, i) => e.classList.toggle('ok', M.done.includes(i)));
          break;
        case 'gone': if (M.pl[d.s]) M.pl[d.s].gone = true; break;
        case 'alb0':
          M.pl = d.pl; M.N = d.n; M.alN = d.n; M.alMode = d.mode; M.opt = d.opt; M.albums = []; M.rd = null; M.dl = 0;
          scr('msg', '<div class="gp-msg"><h2 class="gp-h">Gathering the albums…</h2></div>');
          break;
        case 'alb':
          if (!Array.isArray(d.e) || !(d.i >= 0 && d.i < M.alN)) break;
          M.albums[d.i] = d.e;
          if (M.albums.filter(Boolean).length === M.alN && M.scene !== 'album') startAlbum();
          break;
        case 'show':
          M.al.host = d.c | 0;
          if (M.scene === 'album' && (M.al.follow || isLead())) openChain(M.al.host);
          break;
      }
    }

    P = makeParty(api, {
      room: { title: 'Gartic Phone', sizes: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 3, max: 16, bots: false },
      onHost, onClient, onLeave,
      onRejoin: p => snapFor(p.id),
      onLobby: () => { if (M.online) startOnline(); },
      onClose: why => {
        if (!M.online) return;
        M.dl = 0;
        const t = why === 'kicked' ? ['You were removed', 'The host removed you from this party.'] : why === 'host-left' ? ['The host left', 'The party has ended.'] : ['Connection lost', 'The connection to the party was lost.'];
        scr('msg', `<div class="gp-msg"><h2 class="gp-h">${t[0]}</h2><p>${t[1]}</p><button class="gp-btn" data-a="online">New party</button><button class="gp-btn ghost" data-a="menu">Menu</button></div>`);
      }
    });
    api.interval(hostTick, 400);
    api.interval(() => { if (M.scene === 'title' && M.paintHow && !document.hidden) { M.how++; M.paintHow(); } }, 4200);
    root._gp = { M, H, P, ACT, startOnline };
    if (api.net.invite) startOnline(); else title();
    return { destroy() {} };
  }

  Ameplay.register({
    id: 'gartic-phone',
    title: 'Gartic Phone',
    category: 'Board',
    tint: '#7a3fd8',
    blurb: 'The telephone game with drawings: write a sentence, pass it on, draw what you get, describe what you see, then watch every chain unravel in the album. Six modes, 3 to 16 players online.',
    help: 'Type and press <kbd>Enter</kbd> or tap Done · draw with mouse, touch or pen · <kbd>B</kbd> pencil <kbd>E</kbd> eraser <kbd>F</kbd> fill <kbd>L</kbd> line · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>[</kbd> <kbd>]</kbd> brush size',
    better: 'high',
    format: v => v + ' drawings',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22q0-9 10-9h24q10 0 10 9v10q0 3-3 3l-2 10H15l-2-10q-3 0-3-3z"/><circle cx="32" cy="30" r="5"/><path d="M22 48h20"/></svg>',
    css: GP_CSS,
    mount: mountGartic
  });

  Ameplay.covers['gartic-phone'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gpc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b43e2"/><stop offset=".55" stop-color="#6a2cc6"/><stop offset="1" stop-color="#3e1a96"/></linearGradient></defs><rect width="400" height="300" fill="url(#gpc-g)"/><g fill="#fff" opacity=".07"><circle cx="40" cy="40" r="3"/><circle cx="90" cy="70" r="3"/><circle cx="330" cy="50" r="3"/><circle cx="360" cy="240" r="3"/><circle cx="60" cy="250" r="3"/></g><g stroke="#2b1248" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><rect x="62" y="62" width="130" height="92" rx="14" fill="#fff" transform="rotate(-6 127 108)"/><path d="M84 124q16-48 36-6t44-22" fill="none" stroke="#ff3d6e" stroke-width="8" transform="rotate(-6 127 108)"/><rect x="170" y="120" width="170" height="64" rx="16" fill="#7fe3bd"/><path d="M190 142h120M190 162h80" stroke="#2b1248" stroke-width="7"/></g><g transform="translate(150 190)"><path d="M10 40Q10 14 40 14h120q30 0 30 26v22q0 8-8 8l-4 18H22l-4-18q-8 0-8-8z" fill="#2b1248" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><text x="100" y="68" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="42" fill="#fff">PHONE</text></g></svg>`;

  const SK_DOODLE = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M30 40l6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1z" transform="translate(10 0)"/>'
    + '<path d="M120 28q16-26 34 0t34 0"/><circle cx="240" cy="50" r="18"/><path d="M233 44q7-8 14 0M233 58q7 6 14 0"/>'
    + '<path d="M40 130l34-34 12 12-34 34-18 6z"/><path d="M70 100l12 12"/>'
    + '<path d="M130 110c-10-16-34-6-26 12 6 12 26 22 26 22s20-10 26-22c8-18-16-28-26-12z"/>'
    + '<path d="M215 110c0-18 30-18 30 0s-20 14-20 28 16 8 16-4M226 156v4"/>'
    + '<path d="M30 220q18-30 36 0t36 0"/><path d="M120 190h44v44h-44z" transform="rotate(12 142 212)"/><path d="M200 200l30 40h-60z"/>'
    + '<circle cx="60" cy="275" r="9"/><path d="M130 265q10-16 20 0t20 0"/><path d="M230 262l8 8 18-20"/></svg>';
  const SK_BG = 'url("data:image/svg+xml,' + encodeURIComponent(SK_DOODLE) + '")';
  const SK_COLS = ['#ff4b4b', '#ff9b2f', '#ffd23f', '#53e237', '#2fd0e8', '#a35bff', '#ff6fb5'];
  const SK_DEF = { rounds: 3, time: 80, wc: 3, hints: 2, words: '', only: false };
  const SK_TIMES = [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 210, 240];
  const skRand = () => [Math.floor(Math.random() * SK_N[0]), Math.floor(Math.random() * SK_N[1]), Math.floor(Math.random() * SK_N[2])];
  const skAv = a => Array.isArray(a) && a.length === 3 ? a.map((v, i) => ((v | 0) % SK_N[i] + SK_N[i]) % SK_N[i]) : skRand();
  const skNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
  function skLev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    let p = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const c = [i];
      for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = c;
    }
    return p[b.length];
  }
  const skClose = (g, w) => {
    if (!g || !w || g === w) return false;
    if (w.length <= 3) return false;
    if (skLev(g, w) <= (w.length >= 8 ? 2 : 1)) return true;
    for (let i = 0; i + 1 < w.length; i++) if (g === w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)) return true;
    return false;
  };
  const skCustom = s => {
    const out = [], seen = new Set();
    String(s || '').split(/[\n,;]+/).forEach(x => {
      x = x.replace(/[^A-Za-z\u00c0-\u024f \-']/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
      const k = x.toLowerCase();
      if (x.length >= 2 && !seen.has(k)) { seen.add(k); out.push(x); }
    });
    return out.slice(0, 500);
  };
  const skMask = w => w.replace(/[^ \-]/g, '_');

  const SK_CSS = `
.gm-skribbl{display:block;width:100%;position:relative;container-type:inline-size;min-height:600px;padding:0;gap:0;border-radius:14px;overflow:hidden;color:#1f2a44;font-family:${FONT};text-align:left;background:#2d49b8}
.gm-skribbl *{box-sizing:border-box}
.gm-skribbl h1,.gm-skribbl h2,.gm-skribbl h3,.gm-skribbl p{margin:0}
.gm-skribbl .sb{position:relative;min-height:600px;padding:12px 14px;display:flex;flex-direction:column;background:${SK_BG} 0 0/300px 300px,linear-gradient(160deg,#3357d1 0%,#2845b4 55%,#1f3796 100%)}
.gm-skribbl button{font-family:inherit}
.gm-skribbl .sb-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:50px;padding:0 24px;border:0;border-radius:6px;background:#53e237;color:#fff;font:900 20px/1 ${FONT};text-shadow:0 2px 0 rgba(0,0,0,.28);cursor:pointer;box-shadow:0 4px 0 #2d9a17,0 6px 10px rgba(0,0,0,.25);transition:transform .1s,filter .15s}
.gm-skribbl .sb-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
.gm-skribbl .sb-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #2d9a17}
.gm-skribbl .sb-btn.blue{background:#2f95ff;box-shadow:0 4px 0 #1c64b8,0 6px 10px rgba(0,0,0,.25)}
.gm-skribbl .sb-btn.gray{background:#7d8699;box-shadow:0 4px 0 #555c6b,0 6px 10px rgba(0,0,0,.25)}
.gm-skribbl .sb-btn.red{background:#ee4b4b;box-shadow:0 4px 0 #a52a2a,0 6px 10px rgba(0,0,0,.25)}
.gm-skribbl .sb-btn.sm{height:38px;font-size:15px;padding:0 16px}
.gm-skribbl .sb-btn:disabled{filter:grayscale(.7) brightness(.9);cursor:default;transform:none}
.gm-skribbl .sb-card{background:rgba(255,255,255,.97);border-radius:8px;padding:16px;box-shadow:0 6px 0 rgba(0,0,0,.18),0 10px 24px rgba(0,0,0,.2)}
.gm-skribbl .sb-logo{display:flex;justify-content:center;gap:1px;margin:6px 0 14px;font:900 60px/1 ${FONT};letter-spacing:-.02em;user-select:none}
.gm-skribbl .sb-logo span{display:inline-block;text-shadow:0 4px 0 rgba(0,0,0,.3),-2px -2px 0 rgba(0,0,0,.35),2px -2px 0 rgba(0,0,0,.35),-2px 2px 0 rgba(0,0,0,.35),2px 2px 0 rgba(0,0,0,.35);animation:skBob 2.4s ease-in-out infinite}
@keyframes skBob{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-5px) rotate(calc(var(--r) * -1))}}
.gm-skribbl .sb-tcols{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:stretch;width:min(940px,100%);margin:0 auto}
.gm-skribbl .sb-prof{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.gm-skribbl .sb-avm{display:grid;grid-template-columns:auto auto auto;align-items:center;gap:10px}
.gm-skribbl .sb-avm .arrs{display:flex;flex-direction:column;gap:10px;height:128px;justify-content:space-between;padding:6px 0}
.gm-skribbl .sb-arr{width:34px;height:34px;border:0;border-radius:50%;background:#eef1fb;color:#2845b4;font:900 20px/1 ${FONT};cursor:pointer;display:grid;place-items:center;padding:0;box-shadow:0 2px 0 rgba(0,0,0,.18)}
.gm-skribbl .sb-arr:hover{background:#dbe3ff}
.gm-skribbl .sb-avbig{position:relative;filter:drop-shadow(0 4px 0 rgba(0,0,0,.2))}
.gm-skribbl .sb-avbig .av{display:block}
.gm-skribbl .sb-nm{font:900 22px/1.1 ${FONT};color:#1f2a44;min-height:26px}
.gm-skribbl .sb-sub{font:700 14px/1.4 ${FONT};color:#5c6788}
.gm-skribbl .sb-how h3{font:900 20px/1 ${FONT};text-align:center;color:#2845b4;margin-bottom:10px}
.gm-skribbl .sb-slide{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;min-height:190px;justify-content:center}
.gm-skribbl .sb-slide svg{width:110px;height:92px}
.gm-skribbl .sb-slide b{font:900 18px/1.2 ${FONT};color:#1f2a44}
.gm-skribbl .sb-slide span{font:700 14px/1.4 ${FONT};color:#5c6788;max-width:34ch}
.gm-skribbl .sb-dots{display:flex;gap:8px;justify-content:center;margin-top:10px}
.gm-skribbl .sb-dots i{width:10px;height:10px;border-radius:50%;background:#cfd6ee;cursor:pointer}
.gm-skribbl .sb-dots i.on{background:#2f95ff}
.gm-skribbl .sb-msg{margin:auto;text-align:center;display:grid;gap:14px;justify-items:center;color:#fff}
.gm-skribbl .sb-msg h2{font:900 30px/1.1 ${FONT};text-shadow:0 3px 0 rgba(0,0,0,.3)}
.gm-skribbl .sb-msg p{font:700 16px/1.4 ${FONT};opacity:.9}
.gm-skribbl .sb-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.gm-skribbl .sb-lob{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:16px;width:min(940px,100%);margin:0 auto;align-items:start}
.gm-skribbl .sb-lob h3{font:900 20px/1 ${FONT};color:#2845b4;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.gm-skribbl .sb-lob h3 small{font:800 14px ${FONT};color:#7d8699}
.gm-skribbl .sb-lpl{display:grid;gap:6px;max-height:420px;overflow:auto}
.gm-skribbl .sb-lp{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:8px;background:#eef1fb;font:800 16px/1 ${FONT}}
.gm-skribbl .sb-lp.me{background:#d8f6cf}
.gm-skribbl .sb-lp .av{flex:none}
.gm-skribbl .sb-lp b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-skribbl .sb-lp i{font:800 11px ${FONT};color:#fff;background:#2f95ff;border-radius:10px;padding:3px 8px;font-style:normal}
.gm-skribbl .sb-lp.em{background:transparent;border:2px dashed #cfd6ee;color:#9aa3c0;height:48px}
.gm-skribbl .sb-set{display:grid;gap:10px}
.gm-skribbl .sb-set label{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:center;gap:10px;font:800 15px/1.2 ${FONT};color:#33406a}
.gm-skribbl .sb-set select,.gm-skribbl .sb-set textarea{width:100%;border:2px solid #cfd6ee;border-radius:6px;padding:8px 10px;font:700 15px ${FONT};color:#1f2a44;background:#fff;outline:0}
.gm-skribbl .sb-set select:focus,.gm-skribbl .sb-set textarea:focus{border-color:#2f95ff}
.gm-skribbl .sb-set textarea{resize:vertical;min-height:84px}
.gm-skribbl .sb-set .wide{grid-template-columns:1fr}
.gm-skribbl .sb-set .chk{grid-template-columns:auto 1fr;justify-content:start}
.gm-skribbl .sb-set input[type=checkbox]{width:20px;height:20px;accent-color:#2f95ff}
.gm-skribbl .sb-set :disabled{opacity:.65;background:#f2f4fa}
.gm-skribbl .sb-lfoot{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:16px;flex-wrap:wrap}
.gm-skribbl .sb-hint{font:800 15px ${FONT};color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.3)}
.gm-skribbl .sb-game{display:grid;grid-template-columns:minmax(150px,185px) minmax(0,1fr) minmax(190px,235px);grid-template-rows:auto minmax(0,1fr);gap:10px;flex:1;min-height:0;height:575px}
.gm-skribbl .sb-bar{grid-column:1/-1;display:flex;align-items:center;gap:14px;background:#fff;border-radius:6px;height:56px;padding:0 14px;box-shadow:0 4px 0 rgba(0,0,0,.18)}
.gm-skribbl .sb-clock{position:relative;width:46px;height:46px;flex:none;display:grid;place-items:center;font:900 20px/1 ${FONT};color:#1f2a44}
.gm-skribbl .sb-clock svg{position:absolute;inset:0;width:100%;height:100%}
.gm-skribbl .sb-clock b{position:relative;font-weight:900}
.gm-skribbl .sb-clock.low{color:#e22}
.gm-skribbl .sb-rnd{font:900 16px/1.1 ${FONT};color:#1f2a44;white-space:nowrap}
.gm-skribbl .sb-word{flex:1;min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.gm-skribbl .sb-word small{font:900 11px ${FONT};letter-spacing:.08em;color:#6b7690;text-transform:uppercase;margin-bottom:3px}
.gm-skribbl .sb-wd{display:flex;gap:6px;align-items:flex-end;justify-content:center;flex-wrap:nowrap;font:900 28px/1 ${FONT};color:#1f2a44}
.gm-skribbl .sb-wd span{display:inline-block;min-width:.55em;text-align:center;border-bottom:3px solid #1f2a44;padding:0 1px;line-height:1.05}
.gm-skribbl .sb-wd span.sp{border:0;min-width:.7em}
.gm-skribbl .sb-wd span.hy{border:0}
.gm-skribbl .sb-wd span.hid{color:transparent;user-select:none}
.gm-skribbl .sb-wd sup{font:900 13px ${FONT};color:#6b7690;align-self:flex-start;margin-left:2px}
.gm-skribbl .sb-wd.full{color:#2b9a17}
.gm-skribbl .sb-wd.full span{border-color:#2b9a17}
.gm-skribbl .sb-ic{width:38px;height:38px;border:0;border-radius:6px;background:#eef1fb;color:#2845b4;display:grid;place-items:center;cursor:pointer;padding:0}
.gm-skribbl .sb-ic:hover{background:#dbe3ff}
.gm-skribbl .sb-pl{background:#fff;border-radius:6px;overflow:auto;box-shadow:0 4px 0 rgba(0,0,0,.18);min-height:0}
.gm-skribbl .sb-row{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:6px 8px;background:#fff;min-height:58px}
.gm-skribbl .sb-row:nth-child(even){background:#ececf1}
.gm-skribbl .sb-row.got{background:#b9f5a6}
.gm-skribbl .sb-row.gone{opacity:.45}
.gm-skribbl .sb-row .rk{font:900 14px ${FONT};color:#3a4468;min-width:26px;text-align:center}
.gm-skribbl .sb-row .nm{min-width:0}
.gm-skribbl .sb-row .nm b{display:block;font:900 15px/1.15 ${FONT};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1f2a44}
.gm-skribbl .sb-row .nm b.me{color:#2f6bff}
.gm-skribbl .sb-row .nm em{display:block;font:700 13px/1.2 ${FONT};color:#4e5876;font-style:normal}
.gm-skribbl .sb-row .av{display:block}
.gm-skribbl .sb-row .pen{position:absolute;right:4px;bottom:2px;width:20px;height:20px;background:#fff;border-radius:50%;display:grid;place-items:center;color:#2845b4;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.gm-skribbl .sb-row .kk{position:absolute;left:3px;top:2px;border:0;background:rgba(0,0,0,.08);border-radius:50%;width:18px;height:18px;padding:0;color:#7a2b2b;cursor:pointer;opacity:0;display:grid;place-items:center;font:900 11px ${FONT}}
.gm-skribbl .sb-row:hover .kk,.gm-skribbl .sb-row .kk.on{opacity:1}
.gm-skribbl .sb-row .kk.on{background:#ee4b4b;color:#fff}
.gm-skribbl .sb-main{position:relative;min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:flex-start}
.gm-skribbl .sb-board{position:relative;min-width:0}
.gm-skribbl .sb-board .dp-s{width:100%}
.gm-skribbl .sb-vst{position:relative;border-radius:6px;overflow:hidden;box-shadow:0 0 0 3px #fff,0 6px 0 3px rgba(0,0,0,.18)}
.gm-skribbl .sb-vst .dp-cv{display:block}
.gm-skribbl .dp-s .dp-stage{position:relative}
.gm-skribbl .dp-s .dp-sw{aspect-ratio:auto;height:28px}
.gm-skribbl .dp-s .dp-sizes{justify-content:flex-end}
.gm-skribbl .dp-s .dp-tools{flex-wrap:nowrap}
.gm-skribbl .dp-s .dp-sz{width:42px}
.gm-skribbl .sb-ov{position:absolute;inset:0;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;background:rgba(10,18,60,.84);color:#fff;text-align:center;animation:skFade .25s}
@keyframes skFade{from{opacity:0}to{opacity:1}}
.gm-skribbl .sb-ov h2{font:900 26px/1.15 ${FONT};text-shadow:0 3px 0 rgba(0,0,0,.35)}
.gm-skribbl .sb-ov p{font:800 17px/1.3 ${FONT}}
.gm-skribbl .sb-ov .w{font:900 34px/1 ${FONT};color:#ffe36a;text-shadow:0 3px 0 rgba(0,0,0,.35);letter-spacing:.02em}
.gm-skribbl .sb-ch{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.gm-skribbl .sb-ov .sb-ch button{min-width:120px;height:56px;padding:0 20px;border:0;border-radius:6px;background:#fff;color:#1f2a44;font:900 22px/1 ${FONT};cursor:pointer;box-shadow:0 4px 0 #9aa6d6;transition:transform .1s,background .15s}
.gm-skribbl .sb-ov .sb-ch button:hover{background:#ffe36a;transform:translateY(-3px)}
.gm-skribbl .sb-tl{display:grid;gap:4px;width:min(320px,100%);max-height:240px;overflow:auto;text-align:left}
.gm-skribbl .sb-tl div{display:flex;align-items:center;gap:8px;font:800 15px ${FONT};padding:3px 6px;border-radius:5px;background:rgba(255,255,255,.1)}
.gm-skribbl .sb-tl b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-skribbl .sb-tl i{font-style:normal;color:#8cff6a}
.gm-skribbl .sb-tl i.z{color:#ff8e8e}
.gm-skribbl .sb-pdw{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(255,255,255,.25)}
.gm-skribbl .sb-pdw i{display:block;height:100%;background:#53e237;transform-origin:0 0}
.gm-skribbl .sb-chat{display:flex;flex-direction:column;background:#fff;border-radius:6px;box-shadow:0 4px 0 rgba(0,0,0,.18);min-height:0;overflow:hidden}
.gm-skribbl .sb-msgs{flex:1;min-height:0;overflow:auto;overflow-wrap:anywhere;padding:0}
.gm-skribbl .sb-ln{padding:4px 9px;font:700 14px/1.3 ${FONT};color:#1f2a44}
.gm-skribbl .sb-ln:nth-child(even){background:#ececf1}
.gm-skribbl .sb-ln b{font-weight:900}
.gm-skribbl .sb-ln.ok{color:#2b9a17;font-weight:900}
.gm-skribbl .sb-ln.bad{color:#d62d2d;font-weight:900}
.gm-skribbl .sb-ln.warn{color:#c58a00;font-weight:900}
.gm-skribbl .sb-ln.info{color:#2f6bff;font-weight:900}
.gm-skribbl .sb-ln.g{background:#fff3b0}
.gm-skribbl .sb-ln.g b::after{content:' (group)';font-weight:700;color:#8a7a22;font-size:11px}
.gm-skribbl .sb-in{display:flex;border-top:2px solid #e3e6f2}
.gm-skribbl .sb-in input{flex:1;min-width:0;border:0;padding:12px 10px;font:800 15px ${FONT};color:#1f2a44;outline:0;background:#fff}
.gm-skribbl .sb-in input:disabled{background:#f1f2f6}
.gm-skribbl .sb-in button{border:0;background:#53e237;color:#fff;width:50px;cursor:pointer;display:grid;place-items:center;padding:0}
.gm-skribbl .sb-in button:disabled{background:#b8c0d6;cursor:default}
.gm-skribbl .sb-pod{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:end;width:min(640px,100%);margin:6px auto 0;min-height:290px}
.gm-skribbl .sb-pod .pp{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;animation:skRise .6s both}
.gm-skribbl .sb-pod .pp:nth-child(1){animation-delay:.2s}
.gm-skribbl .sb-pod .pp:nth-child(2){animation-delay:.55s}
.gm-skribbl .sb-pod .pp:nth-child(3){animation-delay:.05s}
@keyframes skRise{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.gm-skribbl .sb-pod b{font:900 18px/1.1 ${FONT};color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-skribbl .sb-pod small{font:800 14px ${FONT};color:#dfe6ff}
.gm-skribbl .sb-pod .st{width:100%;border-radius:8px 8px 0 0;display:grid;place-items:start center;padding-top:8px;font:900 40px/1 ${FONT};color:rgba(0,0,0,.35);box-shadow:inset 0 5px 0 rgba(255,255,255,.35)}
.gm-skribbl .sb-pod .p1 .st{height:130px;background:linear-gradient(#ffd23f,#e8a900)}
.gm-skribbl .sb-pod .p2 .st{height:92px;background:linear-gradient(#d9dfe8,#9aa4b4)}
.gm-skribbl .sb-pod .p3 .st{height:64px;background:linear-gradient(#e6a56a,#b06b30)}
.gm-skribbl .sb-rest{width:min(520px,100%);margin:14px auto 0;display:grid;gap:4px}
.gm-skribbl .sb-rest div{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.93);border-radius:6px;padding:5px 10px;font:800 15px ${FONT};color:#1f2a44}
.gm-skribbl .sb-rest b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-skribbl .sb-conf{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}
.gm-skribbl .sb-conf i{position:absolute;top:-14px;width:9px;height:14px;border-radius:2px;animation:skFall linear infinite}
@keyframes skFall{to{transform:translateY(720px) rotate(540deg)}}
.gm-skribbl .sb-prac{display:grid;gap:10px;width:min(580px,100%);margin:0 auto}
.gm-skribbl .sb-prac .hd{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.gm-skribbl .sb-prac .hd b{font:900 26px ${FONT};color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.3)}
.gm-skribbl .sb-prac .hd div{display:flex;gap:8px}
.gm-skribbl .sb-float{position:absolute;z-index:9;font:900 20px ${FONT};color:#53e237;text-shadow:0 2px 0 rgba(0,0,0,.4);pointer-events:none;animation:skFloat 1.4s forwards}
@keyframes skFloat{to{transform:translateY(-46px);opacity:0}}
@container (max-width:860px){
.gm-skribbl .sb-game{grid-template-columns:minmax(0,1fr) minmax(170px,210px);grid-template-rows:auto auto minmax(0,1fr);height:auto}
.gm-skribbl .sb-pl{grid-column:1/-1;grid-row:2;display:flex;overflow-x:auto;overflow-y:hidden}
.gm-skribbl .sb-row{grid-template-columns:auto auto;min-width:148px;min-height:50px}
.gm-skribbl .sb-row .rk,.gm-skribbl .sb-row .kk{display:none}
.gm-skribbl .sb-row:nth-child(even){background:#fff}
.gm-skribbl .sb-row.got{background:#b9f5a6}
.gm-skribbl .sb-chat{height:auto;min-height:260px}
}
@container (max-width:640px){
.gm-skribbl .sb{padding:10px}
.gm-skribbl .sb-logo{font-size:40px}
.gm-skribbl .sb-tcols,.gm-skribbl .sb-lob{grid-template-columns:minmax(0,1fr)}
.gm-skribbl .sb-game{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto auto}
.gm-skribbl .sb-chat{grid-column:1;height:240px;min-height:0}
.gm-skribbl .sb-bar{height:auto;min-height:50px;padding:6px 10px;gap:8px;flex-wrap:wrap}
.gm-skribbl .sb-clock{width:38px;height:38px;font-size:17px}
.gm-skribbl .sb-word{order:3;flex-basis:100%}
.gm-skribbl .sb-wd{font-size:22px;gap:4px}
.gm-skribbl .sb-ov h2{font-size:20px}
.gm-skribbl .sb-ov .w{font-size:26px}
.gm-skribbl .sb-ov .sb-ch button{min-width:96px;height:48px;font-size:18px}
.gm-skribbl .sb-ov{gap:8px;padding:8px}
.gm-skribbl .sb-tl{max-height:150px}
.gm-skribbl .sb-pod .p1 .st{height:90px}
.gm-skribbl .sb-pod .p2 .st{height:64px}
.gm-skribbl .sb-pod .p3 .st{height:44px}
.gm-skribbl .dp-s .dp-tl,.gm-skribbl .dp-s .dp-sz{width:34px;height:34px}
}
${padCss('.gm-skribbl')}`;

  const SK_HOW = [
    ['Draw it', 'On your turn pick one of the words and draw it. No letters or numbers in the picture.', '<path d="M18 70l8-24L62 10a6 6 0 018.5 0l3 3a6 6 0 010 8.5L38 58z" fill="#ffd23f" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M18 70l4-12 8 8z" fill="#f5c9a0" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M60 80q10-10 20 0t14 -4" fill="none" stroke="#2f95ff" stroke-width="4" stroke-linecap="round"/>'],
    ['Guess it', 'Everyone else types guesses in the chat. The faster you get it right, the more points you earn.', '<rect x="12" y="14" width="76" height="50" rx="8" fill="#fff" stroke="#1f2a44" stroke-width="3"/><path d="M30 64v14l16-14" fill="#fff" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M24 32h40M24 46h26" stroke="#53e237" stroke-width="5" stroke-linecap="round"/>'],
    ['Hints', 'Letters appear as the time runs down. A yellow message tells you when a guess is close.', '<path d="M20 66h12M38 66h12M56 66h12M74 66h8" stroke="#1f2a44" stroke-width="5" stroke-linecap="round"/><text x="38" y="58" font-size="30" font-weight="900" fill="#2f95ff" font-family="sans-serif">A</text><path d="M44 14a18 18 0 00-8 32v8h16v-8a18 18 0 00-8-32z" fill="#ffe36a" stroke="#1f2a44" stroke-width="3" transform="translate(6 -6) scale(.85)"/>'],
    ['Win', 'Everybody draws in every round. The player with the most points after the last round takes the podium.', '<path d="M24 12h52v22a26 26 0 01-52 0z" fill="#ffd23f" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/><path d="M24 20H10q0 22 18 24M76 20h14q0 22-18 24" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/><path d="M50 60v14M34 80h32" stroke="#1f2a44" stroke-width="5" stroke-linecap="round"/>']
  ];
  const SK_LOGO = (sz) => `<div class="sb-logo" style="${sz ? 'font-size:' + sz + 'px;margin:0' : ''}" aria-label="skribbl.io">${'skribbl.io'.split('').map((c, i) => `<span style="color:${SK_COLS[i % SK_COLS.length]};--r:${i % 2 ? 4 : -4}deg;animation-delay:${(i * .13).toFixed(2)}s">${c}</span>`).join('')}</div>`;
  const SK_ICO = {
    send: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M3 20l18-8L3 4v6l11 2-11 2z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 21l1.5-5.5L16 4a2.2 2.2 0 013 0l1 1a2.2 2.2 0 010 3L8.5 19.5z"/></svg>',
    exit: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/></svg>',
    boot: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function mountSkribbl(root, api) {
    const M = {
      scene: 'title', tok: 0, av: skAv(lsGet('skribbl:av', null)), pl: [], opt: { ...SK_DEF }, lob: null, online: false, how: 0, ph: '', drawer: null, round: 0, rounds: 0,
      mask: '', word: '', dl: 0, dur: 0, tick: -1, pad: null, view: null, stage: null, won: false, kv: {}, pr: null, sk: null, lead: false, last: 0, myScore: 0
    };
    const H = { phase: 'lobby', opt: { ...SK_DEF }, av: {}, pl: [], queue: [], used: new Set(), cur: null, dl: 0, m: null, log: [], kv: {}, rate: {}, seq: 0 };
    let P;
    const scr = html => {
      M.tok++;
      if (M.sk) M.sk.remove();
      M.sk = mk('div', 'sb', html);
      root.prepend(M.sk);
      M.pad = null; M.view = null; M.stage = null; M.dl = 0;
    };
    const sleep = ms => new Promise(r => api.timeout(r, ms));
    const nameOf = id => { const p = M.pl.find(x => x.id === id); return p ? p.n : 'Someone'; };

    function title() {
      M.online = false; M.scene = 'title';
      scr(`${SK_LOGO()}<div class="sb-tcols">
<div class="sb-card sb-prof"><div class="sb-avm"><div class="arrs">${[0, 1, 2].map(i => `<button class="sb-arr" data-a="av" data-f="${i}" data-d="-1" aria-label="Previous">&#8249;</button>`).join('')}</div><div class="sb-avbig">${avS(M.av, 128)}</div><div class="arrs">${[0, 1, 2].map(i => `<button class="sb-arr" data-a="av" data-f="${i}" data-d="1" aria-label="Next">&#8250;</button>`).join('')}</div></div>
<button class="sb-btn sm gray" data-a="avr">Random</button><div class="sb-nm">${esc(myName())}</div><p class="sb-sub">Pick a look, then gather 2 to 16 friends.</p>
<button class="sb-btn" data-a="online" style="width:min(300px,100%)">Play online</button><button class="sb-btn blue" data-a="practice" style="width:min(300px,100%)">Practice drawing</button></div>
<div class="sb-card sb-how"><h3>HOW TO PLAY</h3><div class="sb-slide"></div><div class="sb-dots">${SK_HOW.map((x, i) => `<i data-a="how" data-i="${i}"></i>`).join('')}</div></div></div>`);
      M.paintHow = () => {
        const s = SK_HOW[M.how % SK_HOW.length], sl = q(root, '.sb-slide');
        if (!sl) return;
        sl.innerHTML = `<svg viewBox="0 0 100 90">${s[2]}</svg><b>${s[0]}</b><span>${s[1]}</span>`;
        qa(root, '.sb-dots i').forEach((d, i) => d.classList.toggle('on', i === M.how % SK_HOW.length));
      };
      M.paintHow();
    }

    function practice() {
      M.scene = 'practice';
      scr(`<div class="sb-prac"><div class="hd"><b class="pw"></b><div><button class="sb-btn sm blue" data-a="pnew">New word</button><button class="sb-btn sm gray" data-a="psave">Save</button><button class="sb-btn sm red" data-a="menu">Back</button></div></div><div class="sb-card sb-pb" style="padding:12px"></div></div>`);
      const pad = createPad({ w: 800, h: 600, sc: 2, layout: 's', sizes: [4, 10, 20, 40], tools: ['pen', 'fill', 'eraser', 'undo', 'clear'] }, api);
      M.pad = pad; q(root, '.sb-pb').append(pad.el);
      M.pr = pick(SK_WORDS);
      q(root, '.pw').textContent = 'Draw: ' + M.pr;
    }

    async function startOnline() {
      M.online = true;
      scr('<div class="sb-msg"><h2>Opening the party...</h2></div>');
      const tok = M.tok;
      const r = await P.open();
      if (!api.alive || tok !== M.tok) return;
      if (!r) { title(); return; }
      H.phase = 'lobby'; H.av[P.me] = M.av; M.me = P.me;
      scr('<div class="sb-msg"><h2>Joining the game...</h2></div>');
      P.up({ t: 'hello', av: M.av });
      if (P.hub) pushLob();
    }

    function lobby() {
      const L = M.lob;
      if (!L) return;
      if (M.scene !== 'lobby') {
        M.scene = 'lobby';
        const opts = (a, f) => a.map(v => `<option value="${v}">${f ? f(v) : v}</option>`).join('');
        scr(`<div class="sb-top"><button class="sb-btn sm gray" data-a="back">&#8249; ${P.hub ? 'Party' : 'Leave'}</button>${SK_LOGO(38)}<span style="width:90px"></span></div>
<div class="sb-lob"><div class="sb-card"><h3>Players <small class="lc"></small></h3><div class="sb-lpl"></div></div>
<div class="sb-card"><h3>Game settings</h3><div class="sb-set">
<label>Rounds<select data-set="rounds">${opts([2, 3, 4, 5, 6, 7, 8, 9, 10])}</select></label>
<label>Draw time<select data-set="time">${opts(SK_TIMES, v => v + ' seconds')}</select></label>
<label>Word choices<select data-set="wc">${opts([1, 2, 3, 4, 5])}</select></label>
<label>Hints<select data-set="hints">${opts([0, 1, 2, 3, 4, 5])}</select></label>
<label class="wide">Custom words (separate with commas or new lines)<textarea data-set="words" maxlength="6000" placeholder="pineapple, space whale, grandma's cat"></textarea></label>
<label class="chk"><input type="checkbox" data-set="only"> Use only custom words</label></div></div></div>
<div class="sb-lfoot"></div>`);
        const ta = q(root, 'textarea');
        ta.addEventListener('keydown', e => e.stopPropagation());
        ta.addEventListener('keyup', e => e.stopPropagation());
      }
      paintLobby();
    }
    function paintLobby() {
      const L = M.lob;
      if (!L || M.scene !== 'lobby') return;
      const lead = L.lead === P.me, o = L.opt;
      const empties = Math.min(Math.max(0, L.size - L.pl.length), 3);
      q(root, '.lc').textContent = L.pl.length + ' / ' + L.size;
      q(root, '.sb-lpl').innerHTML = L.pl.map(p => `<div class="sb-lp ${p.id === P.me ? 'me' : ''}">${avS(p.av, 36, p.lead)}<b>${esc(p.n)}</b>${p.lead ? '<i>HOST</i>' : ''}</div>`).join('') + Array.from({ length: empties }, () => '<div class="sb-lp em">Waiting for a player...</div>').join('');
      qa(root, '[data-set]').forEach(e => {
        const k = e.dataset.set;
        e.disabled = !lead;
        if (e === document.activeElement) return;
        if (e.type === 'checkbox') e.checked = !!o[k]; else e.value = String(o[k]);
      });
      const nc = skCustom(o.words).length, can = lead && L.pl.length >= 2 && !(o.only && nc < 1);
      q(root, '.sb-lfoot').innerHTML = `<button class="sb-btn blue" data-a="invite">Invite</button>` + (lead ? `<button class="sb-btn" data-a="start" ${can ? '' : 'disabled'}>Start game</button>` : '<span class="sb-hint">Waiting for the host to start...</span>')
        + (lead && L.pl.length < 2 ? '<span class="sb-hint">You need at least 2 players</span>' : lead && o.only && nc < 1 ? '<span class="sb-hint">Add some custom words first</span>' : '');
    }

    function gameScreen() {
      M.scene = 'game';
      scr(`<div class="sb-game"><div class="sb-bar"><div class="sb-clock"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16.5" fill="#fff" stroke="#1f2a44" stroke-width="2.4"/><path class="pie" d="M18 18L18 3A15 15 0 1 1 17.99 3Z" fill="#9fd8ff"/></svg><b>0</b></div><div class="sb-rnd"></div><div class="sb-word"><small></small><div class="sb-wd"></div></div><button class="sb-ic" data-a="leave" title="Leave game" aria-label="Leave game">${SK_ICO.exit}</button></div>
<div class="sb-pl"></div><div class="sb-main"><div class="sb-board"></div></div>
<div class="sb-chat"><div class="sb-msgs"></div><form class="sb-in"><input maxlength="100" autocomplete="off" spellcheck="false" placeholder="Type your guess here..."><button type="submit" aria-label="Send">${SK_ICO.send}</button></form></div></div>`);
      const f = q(root, '.sb-in'), inp = q(f, 'input');
      inp.addEventListener('keydown', e => e.stopPropagation());
      inp.addEventListener('keyup', e => e.stopPropagation());
      f.addEventListener('submit', e => {
        e.preventDefault();
        const m = inp.value.replace(/\s+/g, ' ').trim();
        inp.value = '';
        if (m) P.up({ t: 'chat', m });
      });
      M.chatEl = q(root, '.sb-msgs');
      paintPlayers(); paintBar();
    }

    function setBoard() {
      const bd = q(root, '.sb-board');
      if (!bd) return;
      M.pad = null; M.view = null; bd.textContent = '';
      if (M.drawer === P.me) {
        const pad = createPad({
          w: 800, h: 600, sc: 2, layout: 's', sizes: [4, 10, 20, 40], tools: ['pen', 'fill', 'eraser', 'undo', 'clear'],
          onSeg: m => P.up({ t: 'seg', ...m }, true), onOp: (op, k) => P.up({ t: 'op', op, k }), onUndo: () => P.up({ t: 'undo' })
        }, api);
        pad.enable(false); bd.append(pad.el); M.pad = pad; M.stage = pad.stage;
      } else {
        const v = viewer(800, 600, 1), st = mk('div', 'sb-vst');
        st.append(v.el); bd.append(st); M.view = v; M.stage = st;
      }
    }
    const showOv = html => {
      if (!M.stage) return;
      hideOv();
      M.stage.append(mk('div', 'sb-ov', html));
    };
    const hideOv = () => { if (M.stage) qa(M.stage, '.sb-ov').forEach(e => e.remove()); };

    const rankOf = () => {
      const s = M.pl.slice().sort((a, b) => b.score - a.score);
      const r = new Map();
      s.forEach((p, i) => r.set(p.id, i > 0 && s[i - 1].score === p.score ? r.get(s[i - 1].id) : i + 1));
      return { s, r };
    };
    function paintPlayers() {
      const el = q(root, '.sb-pl');
      if (!el) return;
      const { s, r } = rankOf();
      const hub = (api.net.players || []).find(p => p.host);
      const alive = M.pl.filter(p => !p.gone).length;
      el.innerHTML = s.map(p => {
        const me = p.id === P.me, canKick = !me && !p.gone && alive >= 3 && (!hub || hub.id !== p.id);
        return `<div class="sb-row ${p.got ? 'got' : ''} ${p.gone ? 'gone' : ''}" data-id="${esc(p.id)}"><span class="rk">#${r.get(p.id)}</span><div class="nm"><b class="${me ? 'me' : ''}">${esc(p.n)}${me ? ' (You)' : ''}</b><em>${p.score} points</em></div>${avS(p.av, 44)}${M.drawer === p.id && M.ph !== 'end' ? `<span class="pen">${SK_ICO.pen}</span>` : ''}${canKick ? `<button class="kk ${M.kv[p.id] ? 'on' : ''}" data-a="kick" data-id="${esc(p.id)}" title="Vote to kick">${SK_ICO.boot}</button>` : ''}</div>`;
      }).join('');
    }
    function wordHtml(w) {
      const h = w.split('').map(c => c === ' ' ? '<span class="sp"></span>' : c === '-' ? '<span class="hy">-</span>' : c === '_' ? '<span class="hid">M</span>' : `<span>${esc(c.toUpperCase())}</span>`).join('');
      return h + `<sup>${w.replace(/[ \-]/g, '').length}</sup>`;
    }
    function paintBar() {
      const rn = q(root, '.sb-rnd'), sm = q(root, '.sb-word small'), wd = q(root, '.sb-wd');
      if (!rn) return;
      rn.textContent = M.round ? `Round ${M.round} of ${M.rounds}` : '';
      const mine = M.drawer === P.me;
      wd.classList.remove('full');
      if (M.ph === 'draw') {
        if (mine) { sm.textContent = 'Draw this'; wd.innerHTML = wordHtml(M.word); wd.classList.add('full'); }
        else if (M.won && M.word) { sm.textContent = 'You got it'; wd.innerHTML = wordHtml(M.word); wd.classList.add('full'); }
        else { sm.textContent = 'Guess this'; wd.innerHTML = wordHtml(M.mask); }
      } else if (M.ph === 'tend') { sm.textContent = 'The word was'; wd.innerHTML = wordHtml(M.word); wd.classList.add('full'); }
      else { sm.textContent = M.ph === 'choose' ? 'Choosing a word' : 'Waiting'; wd.innerHTML = ''; }
      const inp = q(root, '.sb-in input');
      if (inp) inp.placeholder = mine ? 'Chat with the guessers...' : M.won ? 'Chat with the others who guessed...' : 'Type your guess here...';
    }
    function addLine(k, f, m, c) {
      const el = M.chatEl;
      if (!el) return;
      const near = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      const d = mk('div', 'sb-ln');
      if (k === 'c' || k === 'g') { d.innerHTML = `<b>${esc(nameOf(f))}:</b> ${esc(m)}`; if (k === 'g') d.classList.add('g'); }
      else if (k === 'cl') { d.innerHTML = `&ldquo;${esc(m)}&rdquo; is close!`; d.classList.add('warn'); }
      else { d.textContent = m; d.classList.add(c || 'info'); }
      el.append(d);
      while (el.childElementCount > 200) el.firstChild.remove();
      if (near || f === P.me) el.scrollTop = el.scrollHeight;
    }
    function startTimer(left, dur) {
      M.dur = dur; M.dl = left > 0 ? performance.now() + left * 1000 : 0; M.tick = -1;
      clockTick();
    }
    function clockTick() {
      const b = q(root, '.sb-clock b');
      if (!b) return;
      const rem = M.dl ? Math.max(0, (M.dl - performance.now()) / 1000) : 0, f = M.dur && M.dl ? rem / M.dur : 0;
      const pe = q(root, '.sb-clock .pie'), ck = q(root, '.sb-clock');
      b.textContent = M.dl ? Math.ceil(rem) : '';
      if (pe) pe.setAttribute('d', pie(f));
      ck.classList.toggle('low', M.dl > 0 && rem < 10 && M.ph === 'draw');
      const ts = Math.ceil(rem);
      if (M.ph === 'draw' && rem < 10 && rem > 0 && ts !== M.tick) { M.tick = ts; api.sfx('tick'); }
      if (rem <= 0) M.dl = 0;
    }
    api.loop(() => { if (M.scene === 'game') clockTick(); });

    const SK_CHOOSE = 15, SK_TEND = 7;
    const plMsg = () => H.pl.map(p => ({ id: p.id, n: p.n, av: p.av, score: p.score, gone: p.gone }));
    const lobPlayers = () => P.players().filter(p => p.inGame !== false).map(p => ({ id: p.id, n: p.name, av: H.av[p.id] || (H.av[p.id] = skRand()), lead: p.id === P.leader() }));
    function pushLob() {
      if (!P.hub || H.phase !== 'lobby') return;
      P.bcast({ t: 'lob', pl: lobPlayers(), opt: H.opt, size: P.r ? P.r.size : 16, lead: P.leader() });
    }
    function sys(m, c) {
      const l = { t: 'chat', k: 'sys', c, m };
      H.log.push(l); if (H.log.length > 60) H.log.shift();
      P.bcast(l);
    }
    function setOpt(o) {
      const t = H.opt;
      o = o || {};
      if (o.rounds != null) t.rounds = clamp(o.rounds | 0, 2, 10);
      if (o.time != null && SK_TIMES.includes(+o.time)) t.time = +o.time;
      if (o.wc != null) t.wc = clamp(o.wc | 0, 1, 5);
      if (o.hints != null) t.hints = clamp(o.hints | 0, 0, 5);
      if (typeof o.words === 'string') t.words = o.words.slice(0, 6000);
      if (o.only != null) t.only = !!o.only;
      pushLob();
    }

    function begin() {
      const pl = lobPlayers(), o = H.opt;
      if (pl.length < 2 || H.phase !== 'lobby' || (o.only && skCustom(o.words).length < 1)) return;
      H.pl = pl.map(p => ({ id: p.id, n: p.n, av: p.av, score: 0, gain: 0, gone: false }));
      H.queue = [];
      for (let r = 1; r <= o.rounds; r++) H.pl.forEach(p => H.queue.push({ r, id: p.id }));
      H.used = new Set(); H.log = []; H.kv = {}; H.cur = null; H.m = null; H.snapAt = {};
      H.phase = 'pre'; H.dl = Date.now() + 2200;
      H.pl.forEach(p => P.to(p.id, { t: 'go', pl: plMsg(), opt: o, R: o.rounds }));
    }
    function pickWords(n) {
      const cw = skCustom(H.opt.words), only = H.opt.only && cw.length;
      const pool = only ? cw : SK_WORDS, fresh = pool.filter(w => !H.used.has(w));
      if (fresh.length < n) H.used.clear();
      const out = [], tries = n * 30;
      for (let i = 0; i < tries && out.length < Math.min(n, pool.length); i++) {
        const w = !only && cw.length && Math.random() < .4 ? pick(cw) : pick(pool);
        if (!out.includes(w) && !H.used.has(w)) out.push(w);
      }
      return out.length ? out : [pick(pool)];
    }
    function nextTurn() {
      while (H.queue.length && H.pl.find(p => p.id === H.queue[0].id).gone) H.queue.shift();
      if (!H.queue.length || H.pl.filter(p => !p.gone).length < 2) return endGame();
      const t = H.queue.shift();
      H.pl.forEach(p => { p.gain = 0; });
      H.cur = { r: t.r, id: t.id, choices: pickWords(H.opt.wc), word: '', mask: '', ops: [], guessed: [], hints: [], hi: 0, start: 0 };
      H.phase = 'choose'; H.dl = Date.now() + SK_CHOOSE * 1000;
      H.m = { t: 'turn', r: t.r, R: H.opt.rounds, d: t.id, left: SK_CHOOSE };
      H.pl.forEach(p => { if (!p.gone) P.to(p.id, p.id === t.id ? { ...H.m, ch: H.cur.choices } : H.m); });
    }
    function startDraw(word) {
      const c = H.cur, T = H.opt.time;
      c.word = word; H.used.add(word); c.mask = skMask(word); c.start = Date.now();
      const L = word.replace(/[ \-]/g, '').length, nh = Math.min(H.opt.hints, Math.max(0, Math.floor((L - 1) / 2)));
      c.hints = Array.from({ length: nh }, (_, i) => c.start + T * 1000 * (i + 1) / (nh + 1));
      H.phase = 'draw'; H.dl = c.start + T * 1000;
      H.m = { t: 'draw', r: c.r, R: H.opt.rounds, d: c.id, m: c.mask, left: T, dur: T };
      H.pl.forEach(p => { if (!p.gone) P.to(p.id, p.id === c.id ? { ...H.m, w: word } : H.m); });
    }
    function reveal() {
      const c = H.cur, m = c.mask.split(''), idx = [];
      m.forEach((ch, i) => { if (ch === '_') idx.push(i); });
      c.hi++;
      if (idx.length < 2) return;
      const i = pick(idx);
      m[i] = c.word[i]; c.mask = m.join(''); H.m.m = c.mask;
      P.bcast({ t: 'hint', m: c.mask });
    }
    function checkAll() {
      const c = H.cur;
      if (H.phase !== 'draw' || !c) return;
      if (c.guessed.length >= H.pl.filter(p => !p.gone && p.id !== c.id).length) endTurn('all');
    }
    function correct(from) {
      const c = H.cur, p = H.pl.find(x => x.id === from), dr = H.pl.find(x => x.id === c.id);
      const f = Math.max(0, (H.dl - Date.now()) / 1000) / H.opt.time;
      const pts = Math.max(60, Math.round(100 + 400 * f) - 25 * c.guessed.length);
      const share = Math.round(pts / Math.max(1, H.pl.filter(x => !x.gone).length - 1));
      c.guessed.push(from);
      p.score += pts; p.gain += pts; dr.score += share; dr.gain += share;
      sys(p.n + ' guessed the word!', 'ok');
      P.bcast({ t: 'ok', f: from, pts, sc: { [from]: p.score, [dr.id]: dr.score } });
      P.to(from, { t: 'word', w: c.word });
      checkAll();
    }
    function endTurn(why) {
      const c = H.cur;
      if (!c || H.phase !== 'draw') return;
      H.phase = 'tend'; H.dl = Date.now() + SK_TEND * 1000;
      const gain = {}, sc = {};
      H.pl.forEach(p => { gain[p.id] = p.gain; sc[p.id] = p.score; });
      H.m = { t: 'te', w: c.word, why, gain, sc, left: SK_TEND };
      P.bcast(H.m);
    }
    function endGame() {
      if (H.phase === 'end' || H.phase === 'lobby') return;
      H.phase = 'end'; H.cur = null;
      H.m = { t: 'end', r: H.pl.slice().sort((a, b) => b.score - a.score).map(p => ({ id: p.id, n: p.n, av: p.av, score: p.score, gone: p.gone })) };
      P.bcast(H.m);
    }
    function hostTick() {
      if (!P.hub) return;
      const now = Date.now(), c = H.cur;
      if (H.phase === 'pre' && now >= H.dl) nextTurn();
      else if (H.phase === 'choose' && now >= H.dl) startDraw(c.choices[Math.floor(Math.random() * c.choices.length)]);
      else if (H.phase === 'draw') {
        if (now >= H.dl) endTurn('time');
        else if (c.hi < c.hints.length && now >= c.hints[c.hi]) reveal();
      } else if (H.phase === 'tend' && now >= H.dl) nextTurn();
    }

    function onChat(from, raw) {
      const p = H.pl.find(x => x.id === from);
      if (!p || p.gone) return;
      const m = cleanText(raw, 100), now = Date.now();
      if (!m) return;
      const rt = (H.rate[from] || []).filter(t => now - t < 3000);
      if (rt.length >= 4) return;
      rt.push(now); H.rate[from] = rt;
      const c = H.cur, line = { t: 'chat', k: 'c', f: from, m };
      if (H.phase === 'draw' && c) {
        const got = c.guessed.includes(from);
        if (from === c.id || got) {
          line.k = 'g'; line.grp = 1;
          H.log.push(line); if (H.log.length > 60) H.log.shift();
          [c.id, ...c.guessed].forEach(id => P.to(id, line));
          return;
        }
        const g = skNorm(m), w = skNorm(c.word);
        if (g && g === w) return correct(from);
        if (skClose(g, w)) P.to(from, { t: 'chat', k: 'cl', m });
      }
      H.log.push(line); if (H.log.length > 60) H.log.shift();
      P.bcast(line);
    }
    function onDraw(d, from) {
      const c = H.cur;
      if (H.phase !== 'draw' || !c || from !== c.id) return;
      let m;
      if (d.t === 'seg') {
        if (typeof d.p !== 'string' || d.p.length > 6000) return;
        m = { t: 'seg', k: d.k | 0, i: d.i | 0, c: hexOk(String(d.c)), z: clamp(d.z | 0, 1, 60), p: d.p };
      } else if (d.t === 'op') {
        const op = cleanOp(d.op);
        if (!op) return;
        if (c.ops.length < 3000) c.ops.push(op);
        m = { t: 'op', op, k: d.k | 0 };
      } else { c.ops.pop(); m = { t: 'undo' }; }
      api.net.send(m, m.t === 'seg');
      if (P.me !== c.id) P.local(m);
    }
    function onVote(from, id) {
      const t = H.pl.find(p => p.id === id), v = H.pl.find(p => p.id === from), alive = H.pl.filter(p => !p.gone).length;
      if (!t || !v || t.gone || v.gone || from === id || id === P.me || alive < 3 || H.phase === 'lobby' || H.phase === 'end') return;
      const s = H.kv[id] || (H.kv[id] = new Set()), need = Math.floor(alive / 2) + 1;
      if (s.has(from)) return;
      s.add(from);
      sys(`${v.n} voted to kick ${t.n} (${s.size}/${need})`, 'bad');
      if (s.size >= need) { sys(t.n + ' was kicked', 'bad'); api.net.kick(id); }
    }
    function snapFor(id) {
      if (H.phase === 'lobby') return pushLob();
      const p = H.pl.find(x => x.id === id), now = Date.now();
      if (!p || (H.snapAt[id] && now - H.snapAt[id] < 1500)) return;
      H.snapAt[id] = now;
      P.to(id, { t: 'go', pl: plMsg(), opt: H.opt, R: H.opt.rounds, re: 1 });
      const c = H.cur, m = H.m;
      if (m) {
        const mm = { ...m, left: Math.max(1, Math.ceil((H.dl - now) / 1000)) };
        if (c && id === c.id) { if (m.t === 'turn') mm.ch = c.choices; if (m.t === 'draw') mm.w = c.word; }
        P.to(id, mm);
        if (m.t === 'draw' && c) {
          P.to(id, { t: 'ops', ops: c.ops });
          P.to(id, { t: 'gd', ids: c.guessed });
          if (c.guessed.includes(id)) P.to(id, { t: 'word', w: c.word });
        }
      }
      P.to(id, { t: 'log', l: H.log.filter(l => !l.grp || (c && (id === c.id || c.guessed.includes(id)))).slice(-40) });
    }
    function onHost(d, from) {
      const lead = from === P.leader();
      switch (d.t) {
        case 'hello': H.av[from] = skAv(d.av); pushLob(); if (H.phase !== 'lobby') snapFor(from); break;
        case 'set': if (lead && H.phase === 'lobby') setOpt(d.opt); break;
        case 'start': if (lead) begin(); break;
        case 'again': if (lead && H.phase === 'end') { H.phase = 'lobby'; pushLob(); } break;
        case 'pick': if (H.phase === 'choose' && from === H.cur.id) startDraw(H.cur.choices[d.i | 0] || H.cur.choices[0]); break;
        case 'chat': onChat(from, d.m); break;
        case 'seg': case 'op': case 'undo': onDraw(d, from); break;
        case 'vote': onVote(from, d.id); break;
      }
    }
    function onLeave(p) {
      if (H.phase === 'lobby') { delete H.av[p.id]; return pushLob(); }
      const pl = H.pl.find(x => x.id === p.id);
      if (!pl || pl.gone) return;
      pl.gone = true;
      P.bcast({ t: 'gone', id: pl.id });
      if (H.phase === 'end') return;
      sys(pl.n + ' left the game', 'bad');
      if (H.pl.filter(x => !x.gone).length < 2) return endGame();
      const c = H.cur;
      if (c && c.id === pl.id) { if (H.phase === 'draw') endTurn('left'); else if (H.phase === 'choose') nextTurn(); }
      else checkAll();
    }

    function floatPts(n) {
      if (!M.stage) return;
      const e = mk('div', 'sb-float', '+' + n);
      e.style.cssText = 'left:50%;top:40%;margin-left:-24px';
      M.stage.append(e);
      setTimeout(() => e.remove(), 1500);
    }
    function podium(r) {
      M.scene = 'podium'; M.ph = 'end'; M.dl = 0;
      const col = (p, i) => p ? `<div class="pp p${i + 1}">${avS(p.av, i === 0 ? 96 : 76, i === 0)}<b>${esc(p.n)}</b><small>${p.score} points</small><div class="st">${i + 1}</div></div>` : '<div></div>';
      const rest = r.slice(3), lead = P.isLeader();
      scr(`<div class="sb-conf">${Array.from({ length: 40 }, () => `<i style="left:${(Math.random() * 100).toFixed(1)}%;background:${pick(SK_COLS)};animation-duration:${(3 + Math.random() * 3).toFixed(1)}s;animation-delay:${(-Math.random() * 5).toFixed(1)}s"></i>`).join('')}</div>
<div class="sb-msg" style="margin:8px auto 0"><h2>${esc(r[0].n)} wins!</h2></div><div class="sb-pod">${[1, 0, 2].map(i => col(r[i], i)).join('')}</div>
${rest.length ? `<div class="sb-rest">${rest.map((p, i) => `<div><span>#${i + 4}</span>${avS(p.av, 30)}<b>${esc(p.n)}</b><span>${p.score}</span></div>`).join('')}</div>` : ''}
<div class="sb-lfoot">${lead ? '<button class="sb-btn" data-a="again">Play again</button>' : '<span class="sb-hint">Waiting for the host...</span>'}<button class="sb-btn gray" data-a="leave">Leave</button></div>`);
      const i = r.findIndex(p => p.id === P.me);
      if (i >= 0) { api.score(r[i].score); api.submit(r[i].score); }
      api.sfx(i >= 0 && i < 3 ? 'win' : 'lose');
    }
    const setScores = m => { for (const id in m) { const p = M.pl.find(x => x.id === id); if (p) p.score = m[id]; } const me = M.pl.find(x => x.id === P.me); if (me) api.score(me.score); };

    function onClient(d) {
      switch (d.t) {
        case 'lob':
          M.lob = d; M.opt = d.opt;
          if (M.scene !== 'game') lobby();
          break;
        case 'go':
          M.pl = d.pl.map(p => ({ ...p, got: false })); M.opt = d.opt; M.rounds = d.R; M.round = 0; M.ph = ''; M.drawer = null; M.won = false; M.kv = {};
          gameScreen(); setBoard(); api.score(0);
          if (!d.re) addLine('sys', 0, 'The game has started. Good luck!', 'ok');
          break;
        case 'turn': {
          M.ph = 'choose'; M.drawer = d.d; M.round = d.r; M.rounds = d.R; M.mask = ''; M.word = ''; M.won = false;
          M.pl.forEach(p => { p.got = false; });
          if (M.scene !== 'game') gameScreen();
          setBoard(); paintPlayers(); paintBar(); startTimer(d.left, SK_CHOOSE);
          const dp = M.pl.find(p => p.id === d.d);
          showOv(d.ch ? `<p>Round ${d.r} of ${d.R}</p><h2>Choose a word to draw</h2><div class="sb-ch">${d.ch.map((w, i) => `<button data-a="pick" data-i="${i}">${esc(w)}</button>`).join('')}</div><div class="sb-pdw"><i></i></div>`
            : `<p>Round ${d.r} of ${d.R}</p>${dp ? avS(dp.av, 84) : ''}<h2>${esc(nameOf(d.d))} is choosing a word</h2><div class="sb-pdw"><i></i></div>`);
          const bar = M.stage && q(M.stage, '.sb-pdw i');
          if (bar) { bar.getBoundingClientRect(); bar.style.transition = `transform ${d.left}s linear`; bar.style.transform = 'scaleX(0)'; }
          if (d.ch) api.sfx('pop');
          break;
        }
        case 'draw':
          if (M.scene !== 'game') gameScreen();
          M.ph = 'draw'; M.mask = d.m; M.word = d.w || ''; M.round = d.r; M.rounds = d.R;
          if (M.drawer !== d.d || (!M.pad && !M.view)) { M.drawer = d.d; setBoard(); }
          hideOv();
          if (M.pad) M.pad.enable(true);
          startTimer(d.left, d.dur); paintPlayers(); paintBar();
          break;
        case 'hint': M.mask = d.m; paintBar(); api.sfx('tick'); break;
        case 'seg': if (M.view) M.view.board.live(d); break;
        case 'op': { const op = cleanOp(d.op); if (M.view && op) M.view.board.commit(op, d.k | 0); break; }
        case 'undo': if (M.view) M.view.board.undo(); break;
        case 'ops':
          if (M.view) M.view.board.setOps(cleanOps(d.ops)); else if (M.pad) M.pad.setOps(cleanOps(d.ops));
          break;
        case 'gd': (d.ids || []).forEach(id => { const p = M.pl.find(x => x.id === id); if (p) p.got = true; if (id === P.me) M.won = true; }); paintPlayers(); paintBar(); break;
        case 'word': M.word = d.w; M.won = true; paintBar(); break;
        case 'ok': {
          const p = M.pl.find(x => x.id === d.f);
          if (p) p.got = true;
          setScores(d.sc);
          if (d.f === P.me) { M.won = true; api.sfx('good'); floatPts(d.pts); paintBar(); } else api.sfx('pop');
          paintPlayers();
          break;
        }
        case 'te': {
          M.ph = 'tend'; M.word = d.w; M.dl = 0; setScores(d.sc);
          if (M.pad) M.pad.enable(false);
          const why = { all: 'Everyone guessed the word!', time: 'Time is up!', left: 'The drawer left the game.' }[d.why] || '';
          const rows = M.pl.filter(p => !p.gone || d.gain[p.id]).sort((a, b) => (d.gain[b.id] || 0) - (d.gain[a.id] || 0));
          showOv(`<p>${why}</p><p>The word was</p><div class="w">${esc(d.w)}</div><div class="sb-tl">${rows.map(p => `<div>${avS(p.av, 26)}<b>${esc(p.n)}</b><i class="${d.gain[p.id] ? '' : 'z'}">${d.gain[p.id] ? '+' + d.gain[p.id] : '0'}</i></div>`).join('')}</div>`);
          paintBar(); paintPlayers(); clockTick();
          break;
        }
        case 'end': podium(d.r); break;
        case 'gone': { const p = M.pl.find(x => x.id === d.id); if (p) p.gone = true; paintPlayers(); break; }
        case 'chat': addLine(d.k, d.f, d.m, d.c); break;
        case 'log': (d.l || []).forEach(l => addLine(l.k, l.f, l.m, l.c)); break;
      }
    }

    const ACT = {
      av(b) { const f = +b.dataset.f; M.av[f] = ((M.av[f] + +b.dataset.d) % SK_N[f] + SK_N[f]) % SK_N[f]; lsSet('skribbl:av', M.av); q(root, '.sb-avbig').innerHTML = avS(M.av, 128); },
      avr() { M.av = skRand(); lsSet('skribbl:av', M.av); q(root, '.sb-avbig').innerHTML = avS(M.av, 128); },
      how(b) { M.how = +b.dataset.i; M.paintHow(); },
      online() { startOnline(); },
      practice() { practice(); },
      pnew() { if (M.pad) { M.pad.reset(); M.pr = pick(SK_WORDS); q(root, '.pw').textContent = 'Draw: ' + M.pr; } },
      psave() { if (M.pad) savePng(M.pad.board.cv, 'skribbl-' + M.pr.replace(/\W+/g, '-') + '.png'); },
      menu() { title(); },
      back() { if (P.hub) startOnline(); else { api.net.close(); title(); } },
      leave() { api.net.close(); title(); },
      invite() { copyLinkFor(api); },
      start() { P.up({ t: 'start' }); },
      again() { P.up({ t: 'again' }); },
      pick(b) { P.up({ t: 'pick', i: +b.dataset.i }); showOv('<h2>Get ready...</h2>'); },
      kick(b) { const id = b.dataset.id; if (M.kv[id]) return; M.kv[id] = 1; P.up({ t: 'vote', id }); paintPlayers(); }
    };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || !M.sk || !M.sk.contains(b) || !ACT[b.dataset.a]) return;
      api.sfx('tap');
      ACT[b.dataset.a](b);
    });
    root.addEventListener('change', e => {
      const s = e.target.closest('[data-set]');
      if (!s) return;
      const k = s.dataset.set;
      P.up({ t: 'set', opt: { [k]: s.type === 'checkbox' ? s.checked : k === 'words' ? s.value : +s.value } });
    });

    P = makeParty(api, {
      room: { title: 'Skribbl.io', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 2, max: 16, bots: false },
      onHost, onClient, onLeave,
      onRejoin: p => snapFor(p.id),
      onLobby: () => { if (M.online) startOnline(); },
      onClose: why => {
        if (!M.online) return;
        const t = why === 'kicked' ? ['You were kicked', 'The players voted to remove you from this game.'] : why === 'host-left' ? ['The host left', 'The party has ended.'] : ['Connection lost', 'The connection to the party was lost.'];
        M.scene = 'msg';
        scr(`<div class="sb-msg"><h2>${t[0]}</h2><p>${t[1]}</p><button class="sb-btn" data-a="online">New party</button><button class="sb-btn gray" data-a="menu">Menu</button></div>`);
      }
    });
    api.interval(hostTick, 250);
    api.interval(() => { if (M.scene === 'title' && M.paintHow && !document.hidden) { M.how++; M.paintHow(); } }, 4500);
    root._sk = { M, H, P, ACT, startOnline };
    if (api.net.invite) startOnline(); else title();
    return { destroy() {} };
  }

  Ameplay.register({
    id: 'skribbl',
    title: 'Skribbl.io',
    category: 'Board',
    tint: '#2d6df0',
    blurb: 'Draw and guess with friends: pick one of three words, sketch it before the clock runs out, and race to type the answer in the chat. Letter hints, close-guess alerts, kick votes and a podium. 2 to 16 players online.',
    help: 'Type guesses in the chat and press <kbd>Enter</kbd> · draw with mouse, touch or pen · <kbd>B</kbd> pencil <kbd>E</kbd> eraser <kbd>F</kbd> fill · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>[</kbd> <kbd>]</kbd> brush size',
    better: 'high',
    format: v => v + ' pts',
    width: 1000,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 50l4-14L42 8a5 5 0 017 0l3 3a5 5 0 010 7L24 46z"/><path d="M36 14l14 14M10 50l10-3"/><path d="M14 56h36"/></svg>',
    css: SK_CSS,
    mount: mountSkribbl
  });

  Ameplay.covers['skribbl'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="skc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a62d8"/><stop offset="1" stop-color="#1f3796"/></linearGradient></defs><rect width="400" height="300" fill="url(#skc-g)"/><g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 60l6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1z"/><path d="M300 40q16-24 34 0t34 0"/><circle cx="350" cy="250" r="20"/><path d="M30 250q18-28 36 0t36 0"/><path d="M180 270l30 -24 30 24"/></g>
<g font-family="Nunito,Arial Rounded MT Bold,Trebuchet MS,sans-serif" font-weight="900" font-size="58" stroke="#1b2a6b" stroke-width="9" paint-order="stroke" stroke-linejoin="round" text-anchor="middle"><text x="64" y="104" fill="#ff4b4b" transform="rotate(-6 64 104)">s</text><text x="104" y="98" fill="#ff9b2f" transform="rotate(4 104 98)">k</text><text x="134" y="104" fill="#ffd23f" transform="rotate(-4 134 104)">r</text><text x="160" y="98" fill="#53e237" transform="rotate(5 160 98)">i</text><text x="196" y="104" fill="#2fd0e8" transform="rotate(-5 196 104)">b</text><text x="236" y="98" fill="#a35bff" transform="rotate(4 236 98)">b</text><text x="268" y="104" fill="#ff6fb5" transform="rotate(-4 268 104)">l</text><text x="292" y="98" fill="#ff4b4b" transform="rotate(4 292 98)">.</text><text x="316" y="104" fill="#ffd23f" transform="rotate(-5 316 104)">i</text><text x="346" y="98" fill="#53e237" transform="rotate(4 346 98)">o</text></g>
<rect x="46" y="136" width="210" height="136" rx="8" fill="#fff" stroke="#1b2a6b" stroke-width="5"/><path d="M70 230q26-62 52-14t46-24 44 12" fill="none" stroke="#ef4b4b" stroke-width="9" stroke-linecap="round"/><circle cx="104" cy="170" r="14" fill="#ffd23f" stroke="#1b2a6b" stroke-width="4"/><path d="M200 170l24 34h-48z" fill="#53e237" stroke="#1b2a6b" stroke-width="4" stroke-linejoin="round"/>
<g><rect x="278" y="150" width="96" height="30" rx="6" fill="#fff"/><rect x="278" y="186" width="96" height="30" rx="6" fill="#ececf1"/><rect x="278" y="222" width="96" height="30" rx="6" fill="#b9f5a6"/><path d="M288 165h40M288 201h52M288 237h60" stroke="#1f2a44" stroke-width="5" stroke-linecap="round"/></g>
<path d="M300 262l50-50 14 14-50 50-20 6z" fill="#ffd23f" stroke="#1b2a6b" stroke-width="5" stroke-linejoin="round"/></svg>`;

  const SK_WORDS = ('aardvark,acorn,airplane,alarm clock,alien,alligator,alphabet,ambulance,anchor,angel,ant,antenna,apple,apron,aquarium,arch,arm,armchair,arrow,astronaut,avocado,axe,baby,backpack,bacon,badge,bag,bagel,baker,balcony,ball,balloon,bamboo,banana,bandage,bank,barbecue,barn,barrel,baseball,basket,basketball,bat,bathtub,battery,beach,beaver,bed,bee,beehive,beetle,bell,belt,bench,bicycle,bikini,binoculars,bird,birdcage,birthday,biscuit,black hole,blanket,blender,blizzard,blueberry,boat,bomb,bone,bonfire,book,bookshelf,boomerang,boot,bottle,bow tie,bowl,bowling,box,boxer,bracelet,brain,bread,bridge,broccoli,broom,bubble,bucket,buffalo,bulldozer,bunk bed,burger,bus,bush,butter,butterfly,button,cabbage,cactus,cage,cake,calculator,calendar,camel,camera,campfire,can,candle,candy,cannon,canoe,cap,captain,car,caramel,card,carpet,carrot,castle,cat,caterpillar,cave,ceiling,celery,cello,chain,chair,chalk,cheese,cheetah,chef,cherry,chess,chicken,chimney,chin,chocolate,church,circus,clam,clarinet,claw,clock,cloud,clown,coach,coat,cobweb,cockroach,coconut,coffee,coin,comb,comet,compass,computer,cookie,cork,corn,cottage,couch,cow,cowboy,crab,crayon,crocodile,crown,crutch,cucumber,cup,cupcake,curtain,cycle,dandelion,deer,dentist,desert,desk,detective,diamond,dice,dinosaur,disco,diver,doctor,dog,doll,dolphin,domino,donkey,donut,door,dragon,drawer,dress,drill,drum,duck,dumbbell,dynamite,eagle,ear,earring,earth,earthquake,easel,egg,eggplant,elbow,electricity,elephant,elevator,elf,engine,envelope,eraser,explosion,eye,eyebrow,face,factory,fairy,fan,farm,farmer,feather,fence,ferris wheel,fire,fire truck,firefighter,fireplace,fireworks,fish,fishing rod,flag,flamingo,flashlight,flower,flute,fly,fog,football,forest,fork,fountain,fox,frame,french fries,fridge,frog,frying pan,garage,garden,garlic,gate,genie,ghost,giant,giraffe,glass,glasses,globe,glove,glue,goat,goggles,gold,golf,gorilla,grapes,grass,guitar,gum,hair,hairbrush,hairdryer,hamburger,hammer,hammock,hamster,hand,handbag,hanger,harp,hat,hay,headphones,heart,helicopter,helmet,hen,hippo,hockey,hole,honey,hood,hook,horn,horse,hospital,hot dog,hot air balloon,hotel,hourglass,house,hurricane,ice cream,iceberg,igloo,insect,iron,island,jacket,jail,jam,jar,jaw,jeans,jellyfish,jet,jewel,jigsaw,juice,jungle,kangaroo,kennel,ketchup,key,keyboard,kidney,king,kiss,kitchen,kite,kitten,kiwi,knee,knife,knight,knot,koala,ladder,ladybug,lake,lamp,lantern,laptop,laser,laundry,lava,leaf,leg,lemon,leopard,letter,lettuce,library,lifeguard,light bulb,lighthouse,lightning,lily,lion,lip,lipstick,lizard,lobster,lock,log,lollipop,magic,magnet,mailbox,mammoth,man,map,maple,marble,mask,match,mattress,maze,meat,medal,melon,menu,mermaid,meteor,microphone,microscope,milk,mill,mine,mirror,mitten,mole,money,monkey,monster,moon,moose,mosquito,motorcycle,mountain,mouse,mouth,muffin,mug,mummy,mushroom,music,nail,napkin,neck,necklace,needle,nest,net,newspaper,night,noodle,nose,notebook,nurse,nut,oar,ocean,octopus,office,oil,olive,onion,orange,orchestra,ostrich,otter,oven,owl,oyster,paddle,page,paint,painter,pajamas,palace,palm tree,pan,pancake,panda,pants,paper,parachute,parrot,party,passport,pasta,peach,peacock,peanut,pear,peas,pedal,pen,pencil,penguin,piano,picnic,pie,pig,pigeon,pillow,pilot,pineapple,pipe,pirate,pizza,planet,plant,plate,platypus,pliers,plug,plum,pocket,polar bear,police,pond,pony,popcorn,postcard,pot,potato,present,pretzel,prince,princess,printer,pumpkin,puppet,puppy,purse,puzzle,pyramid,queen,rabbit,raccoon,radio,radish,raft,rain,rainbow,raincoat,raisin,rake,rat,razor,recipe,refrigerator,reindeer,rhino,ribbon,rice,ring,river,road,robot,rocket,roller coaster,roof,rooster,root,rope,rose,rug,ruler,sack,saddle,sailboat,salad,salt,sand,sandal,sandwich,satellite,sausage,saw,saxophone,scale,scarecrow,scarf,school,scissors,scooter,scorpion,screw,screwdriver,seahorse,seal,seaweed,seed,seesaw,shadow,shark,sheep,shelf,shell,shield,ship,shirt,shoe,shop,shorts,shoulder,shovel,shower,skateboard,skeleton,ski,skirt,skull,skunk,sky,skyscraper,sled,sleep,slide,slippers,slug,smile,smoke,snail,snake,snowball,snowboard,snowflake,snowman,soap,soccer,sock,sofa,soldier,soup,spaceship,spaghetti,spear,speaker,spider,spinach,sponge,spoon,sprinkler,squid,squirrel,stadium,stairs,stamp,star,starfish,statue,steak,steam,stethoscope,stick,stomach,stone,stool,stop sign,stove,strawberry,street,submarine,sugar,suit,suitcase,sun,sunflower,sunglasses,sunrise,sunset,surfboard,swamp,sweater,swing,sword,table,tablet,tail,tambourine,tank,tape,taxi,tea,teapot,teddy bear,teeth,telephone,telescope,television,tennis,tent,thermometer,thumb,thunder,ticket,tie,tiger,tire,toast,toaster,toe,toilet,tomato,tongue,tooth,toothbrush,toothpaste,tornado,towel,tower,toy,tractor,traffic light,train,trampoline,trash can,tree,triangle,tricycle,trophy,truck,trumpet,trunk,tulip,tunnel,turkey,turtle,tuxedo,twins,umbrella,unicorn,uniform,vacuum,valley,vampire,vase,vegetable,vest,video game,village,vine,violin,volcano,volleyball,vulture,waffle,wagon,waiter,wall,wallet,walrus,wand,wardrobe,washing machine,wasp,watch,water,waterfall,watermelon,wave,wax,web,wedding,whale,wheel,wheelbarrow,whip,whistle,wig,wind,windmill,window,wing,witch,wizard,wolf,woman,wood,woodpecker,worm,wrench,x-ray,xylophone,yacht,yarn,yoga,yo-yo,zebra,zipper,zombie,zoo,' +
  'bad breath,barber shop,baseball bat,bath bomb,beach ball,bear trap,bird nest,black belt,blue whale,bubble gum,bunny ears,cable car,campfire song,candy cane,cash register,cheese burger,chicken wing,christmas tree,coffee cup,cotton candy,crash test,cruise ship,dark chocolate,diving board,dog house,dragon fly,eiffel tower,fire alarm,fish bowl,flip flops,flying saucer,fortune cookie,garden gnome,gingerbread man,golden gate,grand piano,green beans,hair salon,haunted house,high heels,hockey stick,honey bee,ice cube,jack o lantern,jelly bean,jump rope,king kong,lawn mower,lemon juice,light switch,loch ness monster,magic carpet,magic wand,maple syrup,mini golf,monkey bars,mount everest,movie star,mud pie,music box,nail polish,night light,north pole,ocean wave,paper plane,peanut butter,pencil case,picture frame,piggy bank,pillow fight,pizza box,playing cards,police car,pop star,potato chip,power outlet,rain boots,red carpet,rocking chair,roller skates,rubber duck,sand castle,santa claus,school bus,sea turtle,shopping cart,sleeping bag,snow angel,snow globe,soap bubble,space station,spider web,statue of liberty,street lamp,swimming pool,table tennis,tea party,tennis racket,tiger shark,time machine,toy store,traffic jam,tree house,tug of war,vending machine,water gun,water slide,wedding cake,wind chime,wishing well,wooden spoon,yellow submarine').split(',');

})();
