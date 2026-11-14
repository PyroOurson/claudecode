    const fontW = [], fontC = cv(128, 54), fg = fontC.getContext('2d');
    fg.fillStyle = '#fff';
    for (let i = 0; i < 95; i++) { let w = 0; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let c = 0; c < 5; c++) if (v & (16 >> c)) { fg.fillRect((i & 15) * 8 + c, (i >> 4) * 9 + r, 1, 1); w = Math.max(w, c + 1); } } fontW.push(i ? w : 3); }
    let GW = 480, GH = 300, GK = 2, cssW = 0, cssH = 0;
    let fsOn = false;
    function resize() {
      const fs = !!wrap.closest('.fs');
      if (fs || fs !== fsOn) { fsOn = fs; wrap.style.aspectRatio = fs ? (innerWidth / innerHeight).toFixed(4) : ''; wrap.style.height = fs ? 'auto' : ''; wrap.style.borderRadius = fs ? '0' : ''; }
      const w = wrap.clientWidth || 960, h = wrap.clientHeight || 600, r = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.max(64, Math.round((r.width || w) * dpr)), ph = Math.max(64, Math.round((r.height || h) * dpr));
      if (w !== cssW || h !== cssH) { cssW = w; cssH = h; renderer.setSize(w, h, false); cam.aspect = hCam.aspect = w / h; fovDirty = true; hCam.fov = w < h ? 90 : 70; cam.updateProjectionMatrix(); hCam.updateProjectionMatrix(); }
      if (hud.width !== pw || hud.height !== ph) { hud.width = pw; hud.height = ph; }
      const auto = touch ? Math.max(1, Math.min(pw / 220, ph / 220, dpr * 2.6)) : Math.max(1, Math.min(Math.floor(pw / 320), Math.floor(ph / 240)));
      GK = SET.gui ? Math.min(SET.gui * (touch ? .9 : 1) * (dpr > 1.5 ? 1.5 : 1), auto * 1.5) : auto;
      GK = Math.max(1, Math.round(GK)); if (pw / GK < 214 && GK > 1) GK--;
      GW = Math.floor(pw / GK); GH = Math.floor(ph / GK);
    }
    const toGui = e => { const r = hud.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1) * GW, (e.clientY - r.top) / (r.height || 1) * GH]; };
    const tints = new Map();
    const fontTint = col => { let c = tints.get(col); if (c) return c; c = cv(128, 54); const x = c.getContext('2d'); x.drawImage(fontC, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 128, 54); tints.set(col, c); return c; };
    const tw = s => { let w = 0; for (const ch of String(s)) { const i = ch.charCodeAt(0) - 32; w += (i >= 0 && i < 95 ? fontW[i] : 3) + 1; } return Math.max(0, w - 1); };
    const shade = col => { const n = parseInt(col.slice(1), 16); return '#' + (((n >> 2) & 0x3f3f3f) | 0x1000000).toString(16).slice(1); };
    function drawStr(s, x, y, col, sc) { const f = fontTint(col); for (const ch of s) { const i = ch.charCodeAt(0) - 32; if (i < 0 || i >= 95) { x += 4 * sc; continue; } g.drawImage(f, (i & 15) * 8, (i >> 4) * 9, 8, 8, x, y, 8 * sc, 8 * sc); x += (fontW[i] + 1) * sc; } }
    function text(s, x, y, col = '#ffffff', sh = true, sc = 1) { s = String(s); x = Math.round(x); y = Math.round(y); if (sh) drawStr(s, x + sc, y + sc, shade(col), sc); drawStr(s, x, y, col, sc); }
    const textC = (s, cx, y, col, sh, sc = 1) => text(s, cx - tw(s) * sc / 2, y, col, sh, sc);
    const textR = (s, rx, y, col, sh) => text(s, rx - tw(s), y, col, sh);
    function wrapText(s, w) { const out = []; let line = ''; for (const word of String(s).split(' ')) { const t = line ? line + ' ' + word : word; if (tw(t) > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; }
    const tplC = (rows, f) => { const c = cv(rows[0].length, rows.length), x = c.getContext('2d'); rows.forEach((r, j) => [...r].forEach((ch, i) => { const col = f(ch, i, j); if (col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); } })); return c; };
    const HEART = ['.kk...kk.', 'kwrk.krrk', 'kwrrkrrrk', 'krrrrrrRk', '.krrrrRk.', '..krrRk..', '...kRk...', '....k....'];
    const SHANK = ['.....kk..', '....kwwk.', '....kwk..', '...kbk...', '.kkbbk...', 'kbbbbbk..', 'kbBbbbk..', 'kbbbbk...', '.kkkk....'];
    const BUBBLE = ['.........', '..kkkk...', '.kwwbbk..', '.kwbbbk..', '.kbbbbk..', '.kbbbbk..', '..kkkk...'];
    const ARMI = ['.kkk.kkk.', 'kwwwkwwwk', 'kwssssswk', 'kwssssswk', '.kwssswk.', '.kwssswk.', '.kwssswk.', '..kkkkk..'];
    const hpP = { k: '#000', w: '#ffc8c8', r: '#e01818', R: '#a00808' }, poP = { k: '#000', w: '#e0e8a0', r: '#94a020', R: '#6a7410' }, abP = { k: '#000', w: '#fff8c0', r: '#f0c020', R: '#b08010' }, fpP = { k: '#2a1608', w: '#f0e6d0', b: '#b8702c', B: '#7c4414' }, fhP = { k: '#1a2008', w: '#e0e8c0', b: '#7a9a2c', B: '#4a6a14' };
    const I = {
      hC: tplC(HEART, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), hW: tplC(HEART, ch => ch === 'k' ? '#fff' : ch !== '.' ? '#2c2c2c' : null),
      hF: tplC(HEART, ch => hpP[ch]), hH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? hpP[ch] : '#2c2c2c') : null),
      pF: tplC(HEART, ch => poP[ch]), pH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? poP[ch] : '#2c2c2c') : null),
      aF: tplC(HEART, ch => abP[ch]), aH: tplC(HEART, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? abP[ch] : null) : null),
      hcF: tplC(HEART, ch => ch === 'k' ? '#000' : ch === 'w' ? '#fff' : ch === 'r' ? '#d01818' : ch === 'R' ? '#701010' : null),
      fC: tplC(SHANK, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), fF: tplC(SHANK, ch => fpP[ch]), fH: tplC(SHANK, (ch, i) => ch === 'k' ? '#2a1608' : ch !== '.' ? (i < 5 ? fpP[ch] : '#2c2c2c') : null),
      fgF: tplC(SHANK, ch => fhP[ch]), fgH: tplC(SHANK, (ch, i) => ch === 'k' ? '#1a2008' : ch !== '.' ? (i < 5 ? fhP[ch] : '#2c2c2c') : null),
      bub: tplC(BUBBLE, ch => ({ k: '#1e3c8c', w: '#fff', b: '#64a0ff' })[ch]), aC: tplC(ARMI, ch => ch === 'k' ? '#000' : ch !== '.' ? '#2c2c2c' : null), aFl: tplC(ARMI, ch => ({ k: '#000', w: '#fff', s: '#c8c8c8' })[ch]), aHf: tplC(ARMI, (ch, i) => ch === 'k' ? '#000' : ch !== '.' ? (i < 5 ? ({ w: '#fff', s: '#c8c8c8' })[ch] : '#2c2c2c') : null)
    };
    const flame = lit => { const c = cv(14, 14), x = c.getContext('2d'); for (let y = 0; y < 14; y++) for (let i = 0; i < 14; i++) { const hw = 6.5 * Math.sqrt((y + 1) / 14) * (y > 10 ? (14 - y) / 4 : 1) + Math.sin(y * 1.7) * .6, d = Math.abs(i - 6.5); if (d < hw) { x.fillStyle = lit ? (d < hw * .4 && y > 6 ? '#fff6b0' : d < hw * .72 ? '#ffbe20' : '#e05a10') : (d < hw * .7 ? '#7a7a7a' : '#646464'); x.fillRect(i, y, 1, 1); } } return c; };
    const arrowI = col => { const c = cv(24, 17), x = c.getContext('2d'); x.fillStyle = col; for (let y = 0; y < 17; y++) for (let i = 0; i < 24; i++) if ((i < 15 && y >= 6 && y <= 10) || (i >= 14 && Math.abs(y - 8) <= 22 - i)) x.fillRect(i, y, 1, 1); return c; };
    I.flL = flame(1); I.flU = flame(0); I.arB = arrowI('#8b8b8b'); I.arF = arrowI('#ffffff');
    const BT = [[111, 111, 111, 170, 170, 170, 86, 86, 86, 0, 0, 0], [111, 111, 111, 170, 170, 170, 86, 86, 86, 255, 255, 255], [44, 44, 44, 44, 44, 44, 44, 44, 44, 0, 0, 0]].map(p => {
      const c = cv(200, 20), x = c.getContext('2d'), im = x.createImageData(200, 20), R = rng(5);
      for (let y = 0; y < 20; y++) for (let i = 0; i < 200; i++) { const o = (y * 200 + i) * 4, edge = y === 0 || y === 19 || i === 0 || i === 199, hi = y === 1 || i === 1, lo = y >= 17 || i === 198, n = .93 + R() * .14; const c3 = edge ? p.slice(9, 12) : hi ? p.slice(3, 6) : lo ? p.slice(6, 9) : p.slice(0, 3).map(v => v * n); im.data[o] = c3[0]; im.data[o + 1] = c3[1]; im.data[o + 2] = c3[2]; im.data[o + 3] = 255; }
      x.putImageData(im, 0, 0); return c;
    });
    const HOTBAR = (() => {
      const c = cv(182, 22), x = c.getContext('2d'), im = x.createImageData(182, 22), d = im.data, R = rng(9);
      for (let j = 0; j < 22; j++) for (let i = 0; i < 182; i++) {
        const o = (j * 182 + i) * 4, k = (i - 3) % 20, inX = i >= 3 && i <= 178 && k < 16, inY = j >= 3 && j <= 18, n = R() * 14 - 7 | 0;
        let v = 93, a = 255, r0, g0, b0;
        if (i === 0 || j === 0 || i === 181 || j === 21) v = 0;
        else if (inX && inY) { a = 186; if (j === 3 || k === 0) r0 = g0 = b0 = 4; else { r0 = 39 + n; g0 = 37 + n; b0 = 5; } }
        else if (j === 1 || i === 1) v = (i < 8 && j < 3 ? 190 : 147) + n;
        else if (i === 180) v = 71;
        else if (j === 19 || (inY || j === 20 ? (k === 16 || k === 18) : false) || i === 179) v = j === 20 ? 93 + n : 126 + n;
        else v = 93 + n;
        if (r0 === undefined) r0 = g0 = b0 = v;
        d[o] = r0; d[o + 1] = g0; d[o + 2] = b0; d[o + 3] = a;
      }
      x.putImageData(im, 0, 0); return c;
    })();
    const HSEL = (() => {
      const c = cv(24, 24), x = c.getContext('2d'), T = ['#d5d5d5', '#a1a1a1', '#5f5f5f'], B = ['#5f5f5f', '#a1a1a1', '#d5d5d5'];
      x.fillStyle = '#000'; x.fillRect(0, 0, 24, 1); x.fillRect(0, 23, 24, 1); x.fillRect(0, 0, 1, 24); x.fillRect(23, 0, 1, 24);
      for (let k = 0; k < 3; k++) { const o = k + 1, w = 22 - k * 2; x.fillStyle = B[k]; x.fillRect(o, o + w - 1, w, 1); x.fillRect(o + w - 1, o, 1, w); x.fillStyle = T[k]; x.fillRect(o, o, w - 1, 1); x.fillRect(o, o, 1, w - 1); }
      x.fillStyle = '#fff'; x.fillRect(1, 1, 2, 1); x.fillRect(1, 1, 1, 2); return c;
    })();
    const dirtBg = (() => { const c = cv(16, 16), x = c.getContext('2d'), d = get('dirt'), im = x.createImageData(16, 16); for (let i = 0; i < 1024; i += 4) { im.data[i] = d[i] * .25; im.data[i + 1] = d[i + 1] * .25; im.data[i + 2] = d[i + 2] * .25; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; })();
    const LOGO = (() => {
      const U = 2, L = [['B', 13, [[0, 0, 4, 16], [0, 0, 10, 4], [0, 6, 10, 4], [0, 12, 10, 4], [9, 1, 4, 5], [9, 10, 4, 5]]], ['L', 12, [[0, 0, 4, 16], [0, 12, 12, 4]]], ['O', 13, [[0, 0, 4, 16], [9, 0, 4, 16], [0, 0, 13, 4], [0, 12, 13, 4]]], ['C', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 12, 12, 4]]], ['K', 13, [[0, 0, 4, 16], [[4, 5.5], [9, 0], [13, 0], [13, 1.5], [7.5, 8], [13, 14.5], [13, 16], [9, 16], [4, 10.5]]]], ['C', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 12, 12, 4]]], ['R', 13, [[0, 0, 4, 16], [0, 0, 13, 4], [9, 0, 4, 10], [0, 6, 13, 4], [[8, 11.5], [11, 11.5], [13, 13], [13, 16], [9, 16], [8, 14.5]]]], ['A', 15, [[0, 0, 4, 16], [11, 0, 4, 16], [0, 0, 15, 4], [0, 7, 15, 4]]], ['F', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 6, 10, 4]]], ['T', 12, [[0, 0, 12, 4], [4, 0, 4, 16]]]];
      const GAP = 1, tot = L.reduce((a, l) => a + l[1], 0) + GAP * (L.length - 1), P0 = 2, EX = 4, w = Math.ceil(tot * U) + P0 * 2, h = 16 * U + P0 * 2 + EX;
      const m = cv(w, h), q = m.getContext('2d'); q.fillStyle = '#fff'; let ox = 0, ax = 0;
      for (const [ch, lw, parts] of L) {
        for (const pt of parts) { q.beginPath(); if (typeof pt[0] === 'number') q.rect(P0 + (ox + pt[0]) * U, P0 + pt[1] * U, pt[2] * U, pt[3] * U); else pt.forEach(([x, y], i) => q[i ? 'lineTo' : 'moveTo'](P0 + (ox + x) * U, P0 + y * U)); q.fill(); }
        if (ch === 'A') ax = P0 + ox * U;
        ox += lw + GAP;
      }
      const md = q.getImageData(0, 0, w, h).data, M = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) M[i] = md[i * 4 + 3] > 127 ? 1 : 0;
      const c = cv(w, h), x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data, R = rng(77), at = (i, j) => i >= 0 && j >= 0 && i < w && j < h && M[j * w + i];
      const crack = new Uint8Array(w * h);
      for (let k = 0; k < 70; k++) { let i = R() * w | 0, j = R() * h | 0; const hz = R() < .6, n = 3 + R() * 9 | 0; for (let t = 0; t < n; t++) { crack[j * w + i] = 1; if (hz) i++; else j++; if (R() < .15) { if (hz) j += R() < .5 ? 1 : -1; else i++; } if (i >= w || j >= h || j < 0) break; } }
      const put = (o, r, g2, b) => { d[o] = r; d[o + 1] = g2; d[o + 2] = b; d[o + 3] = 255; };
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const o = (j * w + i) * 4;
        if (at(i, j)) {
          const fy = (j - P0) / (16 * U), n = (R() - .5) * 6, top = !at(i, j - 1), lft = !at(i - 1, j), bot = !at(i, j + 1), rgt = !at(i + 1, j);
          let v = 214 - fy * 34 + n;
          if (top || lft) v = 236; else if (bot || rgt) v = 150 - fy * 10; else if (crack[j * w + i] && at(i, j - 2) && at(i, j + 2)) v -= 46; else if (j > 0 && crack[(j - 1) * w + i] && at(i, j - 3)) v += 14;
          put(o, v + 6, v - 1, v - 5);
        } else {
          let e = 0; for (let k = 1; k <= EX; k++) if (at(i, j - k)) { e = k; break; }
          if (e) { const v = 92 - e * 14; put(o, v, v, v + 2); }
          else { let n2 = false; for (let dj = -1; dj <= 1 && !n2; dj++) for (let di = -1; di <= 1; di++) { if (at(i + di, j + dj)) { n2 = true; break; } let ee = false; for (let k = 1; k <= EX; k++) if (at(i + di, j + dj - k)) { ee = true; break; } if (ee) { n2 = true; break; } } if (n2) put(o, 0, 0, 0); }
        }
      }
      x.putImageData(im, 0, 0); return c;
    })();
    const EDITION = (() => {
      const s = 'BROWSER EDITION', S2 = 2, W0 = tw(s) * S2 + s.length * 2 + 8, H0 = 8 * S2 + 7, m = new Uint8Array(W0 * H0); let x0 = 3;
      for (const ch of s) { const i = ch.charCodeAt(0) - 32; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let k = 0; k < 5; k++) if (v & (16 >> k)) for (let a = 0; a <= S2 + 1; a++) for (let b = 0; b < S2; b++) m[(2 + r * S2 + b) * W0 + x0 + k * S2 + a] = 1; } x0 += (fontW[i] + 1) * S2 + 2; }
      const c = cv(W0, H0), q = c.getContext('2d'), im = q.createImageData(W0, H0), d = im.data, at = (i, j) => i >= 0 && j >= 0 && i < W0 && j < H0 && m[j * W0 + i];
      for (let j = 0; j < H0; j++) for (let i = 0; i < W0; i++) {
        const o = (j * W0 + i) * 4; let v = -1;
        if (at(i, j)) v = !at(i, j - 1) ? 250 : 222 - (j - 2) * 2.2;
        else if (at(i, j - 1) || at(i, j - 2)) v = at(i, j - 1) ? 70 : 52;
        else if (at(i - 1, j) || at(i + 1, j) || at(i, j + 1) || at(i - 1, j - 1) || at(i + 1, j - 1) || at(i - 1, j + 1) || at(i + 1, j + 1) || at(i, j - 3) || at(i - 1, j - 2) || at(i + 1, j - 2)) v = 0;
        if (v >= 0) { d[o] = v; d[o + 1] = v - (v > 100 ? 4 : 0); d[o + 2] = v - (v > 100 ? 8 : 0); d[o + 3] = 255; }
      }
      q.putImageData(im, 0, 0); return c;
    })();
    const SPLASHES = ['Now with poplar trees!', 'Runs in a browser tab!', 'Bring a friend, bring a shovel!', 'Poplars sway here!', 'Every hill is new!', 'Homework first?', 'Build it taller!', 'Party code ready!', 'Mind the gap!', 'Torches save lives!', 'Rivers find a way!', 'Sand has opinions!', 'Chromebook approved!', 'Dig sideways too!', 'Sleep is optional!', 'Sheep remember!', 'Hardest is hard!', 'Leave only footprints!', 'Maps are for later!', 'One more block!'];
    const SPLASH = SPLASHES[ri(SPLASHES.length)];
    let btns = [], slots = [], hovSlot = null, mx = -1, my = -1, pRect = [0, 0, 0, 0], fields = [], focusKey = null;
    const inR = (x, y, r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
    function button(x, y, w, h, label, fn, en = true) {
      x |= 0; y |= 0;
      if (touch && h === 20) { y -= 2; h = 24; }
      const hov = en && !touch && mx >= x && my >= y && mx < x + w && my < y + h, t = BT[en ? (hov ? 1 : 0) : 2], hw = w >> 1;
      g.drawImage(t, 0, 0, hw, 20, x, y, hw, h); g.drawImage(t, 200 - (w - hw), 0, w - hw, 20, x + hw, y, w - hw, h);
      const lb = Array.isArray(label) ? (tw(label[0]) > w - 8 ? label[1] : label[0]) : label;
      let lbs = lb; while (lbs.length > 3 && tw(lbs) > w - 6) lbs = lbs.slice(0, -1);
      textC(lbs, x + w / 2, y + (h - 8) / 2, en ? '#ffffff' : '#a0a0a0');
      btns.push({ x, y, w, h, fn, en, l: lb });
    }
    function rows(list, y, tot) { tot = Math.min(tot || 308, GW - 8); const n = list.length, bw = (tot - (n - 1) * 4) / n | 0, x0 = (GW - (bw * n + (n - 1) * 4)) / 2 | 0; list.forEach(([l, fn, en], i) => button(x0 + i * (bw + 4), y, bw, 20, l, fn, en !== false)); }
    function sep(y, foot) { g.fillStyle = foot ? 'rgba(0,0,0,.65)' : 'rgba(255,255,255,.22)'; g.fillRect(0, y, GW, 1); g.fillStyle = foot ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.65)'; g.fillRect(0, y + 1, GW, 1); }
    function ring(x, y, w, h, t, c) { g.fillStyle = c; g.fillRect(x, y, w, t); g.fillRect(x, y + h - t, w, t); g.fillRect(x, y, t, h); g.fillRect(x + w - t, y, t, h); }
    function drawDirt(dark) { if (W && W.pano && panoReady) { g.fillStyle = 'rgba(0,0,0,' + (.32 + (dark || 0)) + ')'; g.fillRect(0, 0, GW, GH); return; } for (let y = 0; y < GH; y += 32) for (let x = 0; x < GW; x += 32) g.drawImage(dirtBg, x, y, 32, 32); if (dark) { g.fillStyle = 'rgba(0,0,0,' + dark + ')'; g.fillRect(0, 0, GW, GH); } }
    function shadeAll(a, b) { const gr = g.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, GW, GH); }
    function panel(x, y, w, h) {
      g.fillStyle = '#000'; g.fillRect(x + 2, y, w - 4, h); g.fillRect(x, y + 2, w, h - 4); g.fillRect(x + 1, y + 1, w - 2, h - 2);
      g.fillStyle = '#fff'; g.fillRect(x + 1, y + 1, w - 4, h - 4); g.fillRect(x + 2, y + 1, w - 4, 2);
      g.fillStyle = '#555'; g.fillRect(x + 3, y + 3, w - 4, h - 4);
      g.fillStyle = '#c6c6c6'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
    }
    function frame(x, y, s) { g.fillStyle = '#373737'; g.fillRect(x - 1, y - 1, s, s); g.fillStyle = '#fff'; g.fillRect(x, y, s - 1, s - 1); g.fillStyle = '#8b8b8b'; g.fillRect(x, y, s - 2, s - 2); }
    function field(key, x, y, w, h, val, ph, onEnter, maxLen) {
      const focus = focusKey === key && document.activeElement === inp;
      if (key !== 'chat') { g.fillStyle = focus ? '#ffffff' : '#a0a0a0'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#000'; g.fillRect(x, y, w, h); }
      let st = val; while (st && tw(st) > w - 10) st = st.slice(1);
      if (!val && ph && !focus) text(ph, x + 4, y + (h - 8) / 2, '#707070', false);
      text(st + (focus && (performance.now() / 300 | 0) % 2 ? '_' : ''), x + 4, y + (h - 8) / 2, '#e0e0e0');
      fields.push({ key, x, y, w, h, onEnter, maxLen: maxLen || 32 });
    }
    function focusField(key, val, max) {
      focusKey = key; inp.hidden = false; inp.maxLength = max || 32; inp.value = val || '';
      const f = fields.find(q => q.key === key);
      if (f) { const k = cssW / hud.width * GK; Object.assign(inp.style, { left: f.x * k + 'px', top: f.y * k + 'px', width: f.w * k + 'px', height: f.h * k + 'px' }); }
      try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    }
    function blurField() { focusKey = null; inp.blur(); inp.hidden = true; }
    const FIELDV = {};
    function drawItem(s, x, y, noCount) {
      if (!s) return;
      const id = s.id;
      g.drawImage(ICON, (id % ICN) * ICS, (id / ICN | 0) * ICS, ICS, ICS, x, y, 16, 16);
      const it = IT[id];
      if (it.glint) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(120,60,200,${.18 + Math.sin(performance.now() / 400) * .06})`; g.fillRect(x + 1, y + 1, 14, 14); g.globalCompositeOperation = 'source-over'; }
      if (it.dur && s.d > 0) { const f = 1 - s.d / it.dur; g.fillStyle = '#000'; g.fillRect(x + 2, y + 13, 13, 2); g.fillStyle = `hsl(${f * 120 | 0},100%,50%)`; g.fillRect(x + 2, y + 13, Math.max(1, Math.round(13 * f)), 1); }
      if (s.n > 1 && !noCount) { const str = String(s.n); text(str, x + 17 - tw(str), y + 9); }
    }
    function itemName(s) { const it = IT[s.id]; return it.name; }
    function tooltip(lines, x, y) {
      if (!Array.isArray(lines)) lines = [lines];
      const w = Math.max(...lines.map(l => tw(l[0] || l))) + 6, h = lines.length * 10 + 2; x = Math.min(x, GW - w - 2) | 0; y = clamp(y, 2, GH - h - 2) | 0;
      g.fillStyle = 'rgba(16,0,16,.94)'; g.fillRect(x - 1, y, w + 2, h); g.fillRect(x, y - 1, w, h + 2);
      g.fillStyle = '#5000ff'; g.fillRect(x, y, w, 1); g.fillStyle = '#28007f'; g.fillRect(x, y + h - 1, w, 1); g.fillStyle = '#3c00c0'; g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
      lines.forEach((l, i) => text(Array.isArray(l) ? l[0] : l, x + 3, y + 2 + i * 10, Array.isArray(l) ? l[1] : '#ffffff'));
    }
    function itemTip(s) {
      const it = IT[s.id], L = [[it.name, it.glint ? '#ffff55' : it.id.includes('netherite') || it.id === 'nether_star' || it.id === 'dragon_egg' ? '#ff55ff' : '#ffffff']];
      if (it.desc) L.push([it.desc, '#aaaaaa']);
      if (it.dmg && (it.tool || it.spear || it.trident || it.mace)) { L.push(['', '#fff'], ['When in Main Hand:', '#aaaaaa'], [' ' + (+it.dmg.toFixed(1)) + ' Attack Damage', '#00aa00'], [' ' + (+(it.aspd || 4).toFixed(1)) + ' Attack Speed', '#00aa00']); }
      if (it.armor && it.armor.def) { L.push(['', '#fff'], ['When on ' + ['Head', 'Body', 'Legs', 'Feet'][it.armor.slot] + ':', '#aaaaaa'], ['+' + it.armor.def + ' Armor', '#5555ff']); if (it.armor.tough) L.push(['+' + it.armor.tough + ' Armor Toughness', '#5555ff']); }
      if (it.food) { }
      if (it.dur && s.d > 0) L.push(['Durability: ' + (it.dur - s.d) + ' / ' + it.dur, '#ffffff']);
      if (s.x && s.x.items) { const n = s.x.items.filter(Boolean).length; if (n) L.push([n + ' item stacks', '#aaaaaa']); }
      if (SHOWADV) L.push([(it.block ? 'minecraft:' : 'minecraft:') + it.id, '#555555']);
      return L;
    }
    let SHOWADV = false;
    function drawPlayerModel(x, y, sc) {
      const sk = playerSkinTex(P.name), img = (sk.t || sk).image, al = !!sk.alex, aw = al ? 3 : 4, fx = Math.atan((mx - x) / 40), fy = Math.atan((my - (y - 4 * sc)) / 40);
      const by = fx * 20 * Math.PI / 180, hy = fx * 40 * Math.PI / 180, hp = -fy * 20 * Math.PI / 180, cy = y + 24 * sc;
      const BX = [[-4, 0, -2, 4, 12, 4, 0, 16, 0], [0, 0, -2, 4, 12, 4, 16, 48, 0], [-4, 12, -2, 8, 12, 4, 16, 16, 0], [-4 - aw, 12, -2, aw, 12, 4, 40, 16, 0], [4, 12, -2, aw, 12, 4, 32, 48, 0], [-4, 24, -4, 8, 8, 8, 0, 0, 1], [-4, 0, -2, 4, 12, 4, 0, 32, 0, .25], [0, 0, -2, 4, 12, 4, 0, 48, 0, .25], [-4, 12, -2, 8, 12, 4, 16, 32, 0, .25], [-4 - aw, 12, -2, aw, 12, 4, 40, 32, 0, .25], [4, 12, -2, aw, 12, 4, 48, 48, 0, .25], [-4, 24, -4, 8, 8, 8, 32, 0, 1, .5]];
      const AC = [armor[0] && [[-4, 24, -4, 8, 8, 8, 1.1], matCol(armor[0])], armor[1] && [[-4, 12, -2, 8, 12, 4, 1], matCol(armor[1])], armor[1] && [[-4 - aw, 18, -2, aw, 6, 4, 1], matCol(armor[1])], armor[1] && [[4, 18, -2, aw, 6, 4, 1], matCol(armor[1])], armor[2] && [[-4, 3, -2, 8, 10, 4, .6], matCol(armor[2])], armor[3] && [[-4, 0, -2, 8, 4, 4, .9], matCol(armor[3])]].filter(Boolean);
      const tf = (px, py, pz, head) => { let X = px, Y = py, Z = pz; if (head) { const yy = Y - 24, c1 = Math.cos(hp), s1 = Math.sin(hp); Y = 24 + yy * c1 + Z * s1; Z = -yy * s1 + Z * c1; } const a = head ? hy : by, c = Math.cos(a), s2 = Math.sin(a); return [X * c + Z * s2, Y, -X * s2 + Z * c]; };
      const F = [];
      const addBox = (x0, y0, z0, w, h, d, head, inf, tex2) => {
        x0 -= inf; y0 -= inf; z0 -= inf; const x1 = x0 + w + inf * 2, y1 = y0 + h + inf * 2, z1 = z0 + d + inf * 2;
        const fs = [['f', [x0, y1, z1], [x1 - x0, 0, 0], [0, y0 - y1, 0], [0, 0, 1], 1], ['b', [x1, y1, z0], [x0 - x1, 0, 0], [0, y0 - y1, 0], [0, 0, -1], .7], ['r', [x0, y1, z0], [0, 0, z1 - z0], [0, y0 - y1, 0], [-1, 0, 0], .8], ['l', [x1, y1, z1], [0, 0, z0 - z1], [0, y0 - y1, 0], [1, 0, 0], .8], ['t', [x0, y1, z0], [x1 - x0, 0, 0], [0, 0, z1 - z0], [0, 1, 0], 1.05]];
        for (const [k, o, e1, e2, n, br] of fs) {
          const nn = tf(n[0], n[1] + (head ? 24 : 0), n[2], head), n0 = tf(0, head ? 24 : 0, 0, head);
          if (nn[2] - n0[2] <= .02) continue;
          const P0 = tf(o[0], o[1], o[2], head), P1 = tf(o[0] + e1[0], o[1] + e1[1], o[2] + e1[2], head), P2 = tf(o[0] + e2[0], o[1] + e2[1], o[2] + e2[2], head);
          F.push({ k, P0, P1, P2, br, z: (P1[2] + P2[2]) / 2 + (inf ? .01 : 0), tex2 });
        }
      };
      for (const [x0, y0, z0, w, h, d, u, v, head, inf] of BX) addBox(x0, y0, z0, w, h, d, head, inf || 0, { u, v, w, h, d, ov: !!inf });
      for (const [[x0, y0, z0, w, h, d, inf], col] of AC) addBox(x0, y0, z0, w, h, d, y0 >= 24, inf, { col });
      F.sort((a, b) => a.z - b.z);
      for (const f of F) {
        const { P0, P1, P2, k, br, tex2: T } = f, sx = q => x + q[0] * sc, sy = q => cy - q[1] * sc;
        let tu, tv, tw2, th2;
        if (T.col) { tw2 = th2 = 1; } else { const { u, v, w, h, d } = T; [tu, tv, tw2, th2] = k === 'f' ? [u + d, v + d, w, h] : k === 'b' ? [u + 2 * d + w, v + d, w, h] : k === 'r' ? [u, v + d, d, h] : k === 'l' ? [u + d + w, v + d, d, h] : [u + d, v, w, d]; }
        g.save(); g.transform((sx(P1) - sx(P0)) / tw2, (sy(P1) - sy(P0)) / tw2, (sx(P2) - sx(P0)) / th2, (sy(P2) - sy(P0)) / th2, sx(P0), sy(P0));
        if (T.col) { g.fillStyle = T.col; g.fillRect(0, 0, 1, 1); if (br < 1) { g.fillStyle = 'rgba(0,0,0,' + (1 - br) + ')'; g.fillRect(0, 0, 1, 1); } }
        else { g.drawImage(img, tu, tv, tw2, th2, 0, 0, tw2, th2); if (br < 1 && !T.ov) { g.fillStyle = 'rgba(0,0,0,' + (1 - br) + ')'; g.fillRect(0, 0, tw2, th2); } }
        g.restore();
      }
    }
    const matCol = s => { const m = IT[s.id].armor && IT[s.id].armor.mat; return m === 'leather' ? '#a0623a' : m === 'golden' ? '#f0d030' : m === 'diamond' ? '#33d8d0' : m === 'netherite' ? '#4f474f' : m === 'copper' ? '#c96a44' : m === 'turtle' ? '#3a8a3a' : '#c8c8c8'; };
    let showF3 = false, F3G = null, fT = 0, fps = 60, chatOpen = false, chatLog = [], chatHist = [], chatHi = -1, titleMsg = null;
    function chatSys(m, col) { chatLog.push({ m: String(m), c: col || '#ffffff', t: performance.now() }); if (chatLog.length > 100) chatLog.shift(); }
    function drawChat(now) {
      const max = chatOpen ? 20 : 10, base = GH - (touch ? 70 : 48), w = Math.min(320, GW - 8);
      let y = base, n = 0;
      for (let i = chatLog.length - 1; i >= 0 && n < max; i--) {
        const c = chatLog[i], age = (now - c.t) / 1000;
        if (!chatOpen && age > 10) break;
        const a = chatOpen ? 1 : clamp((10 - age) * 2, 0, 1);
        const L = wrapText(c.m, w - 6);
        for (let k = L.length - 1; k >= 0 && n < max; k--, n++) { y -= 9; g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(2, y - 1, w, 9); text(L[k], 4, y, c.c); g.globalAlpha = 1; }
      }
      if (chatOpen) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(2, GH - 14, GW - 4, 12); field('chat', 2, GH - 14, GW - 4, 12, FIELDV.chat || '', '', sendChat, 256); }
    }
    function drawHUD(now) {
      const md = mode();
      if (md !== 'spectator' && !P.dead) { const hb = getS(Math.floor(P.x), Math.floor(P.y + P.eye), Math.floor(P.z)); if (OPQ[hb] && SOL[hb] === 1) { g.fillStyle = 'rgba(10,10,10,.93)'; g.fillRect(0, 0, GW, GH); } }
      if (P.eyeW) { g.fillStyle = 'rgba(20,40,150,.18)'; g.fillRect(0, 0, GW, GH); }
      if (P.eyeL) { g.fillStyle = 'rgba(220,80,10,.75)'; g.fillRect(0, 0, GW, GH); }
      if (P.fire > 0 && md !== 'creative' && md !== 'spectator') { const t = now / 80; for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,${120 + (i * 20)},20,${.25})`; const fx = (i * 73 % GW), fh = 30 + Math.sin(t + i) * 10; g.fillRect(i < 3 ? 0 : GW - 60, GH - fh - i * 6, 60, fh); } }
      if (P.hurtT > 10) { g.fillStyle = `rgba(255,0,0,${(P.hurtT - 10) / 40})`; g.fillRect(0, 0, GW, GH); }
      if (P.sleeping) { g.fillStyle = `rgba(10,10,20,${Math.min(.9, P.sleeping / 100)})`; g.fillRect(0, 0, GW, GH); textC('Sleeping...', GW / 2, GH / 2 - 20, '#ffffff'); button(GW / 2 - 100, GH - 40, 200, 20, 'Leave Bed', wake); return; }
      if (md === 'spectator') { textC('Spectator Mode', GW / 2, GH - 20, '#aaaaaa'); return; }
      if (!touch && !gui) {
        const cx = GW >> 1, cy = GH >> 1; g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.fillRect(cx - 4, cy, 9, 1); g.fillRect(cx, cy - 4, 1, 4); g.fillRect(cx, cy + 1, 1, 4); g.globalCompositeOperation = 'source-over';
        const cdk = clamp((tickN - P.atkT) / atkCooldown(), 0, 1);
        if (cdk < 1) { g.fillStyle = '#444'; g.fillRect(cx - 8, cy + 9, 16, 2); g.fillStyle = '#ddd'; g.fillRect(cx - 8, cy + 9, Math.round(16 * cdk), 2); }
      }
      const hx = (GW - 182) >> 1, hy = GH - 22;
      g.drawImage(HOTBAR, hx, hy);
      g.drawImage(HSEL, hx - 1 + sel * 20, hy - 1);
      for (let i = 0; i < 9; i++) drawItem(inv[i], hx + 3 + i * 20, hy + 3);
      if (offhand) { g.drawImage(HOTBAR, 0, 0, 20, 22, hx - 29, hy, 20, 22); g.drawImage(HOTBAR, 180, 0, 2, 22, hx - 9, hy, 2, 22); drawItem(offhand, hx - 26, hy + 3); }
      if (md === 'survival' || md === 'adventure') {
        const y0 = GH - 39, hc = W.hardcore, pois = P.effects.poison > 0, hung = P.effects.hunger > 0;
        const hpMax = 20, rowsH = 1;
        void rowsH;
        for (let i = 0; i < 10; i++) {
          const x = hx + i * 8, y = y0 + (P.hp <= 4 && ((tickN * 31 + i * 7) % 3 === 0) ? 1 : 0) + (P.effects.regen && (tickN % 25) === i ? -2 : 0);
          g.drawImage(P.hurtT > 10 && (P.hurtT >> 1) % 2 ? I.hW : I.hC, x, y);
          const F = pois ? I.pF : hc ? I.hcF : I.hF, Hh = pois ? I.pH : I.hH;
          if (P.hp >= i * 2 + 2) g.drawImage(F, x, y); else if (P.hp > i * 2) g.drawImage(Hh, x, y);
          void hpMax;
          const fx = hx + 182 - 9 - i * 8, fy = y0 + (P.sat <= 0 && (tickN + i * 3) % (P.food * 3 + 1) === 0 ? ((i * 7 + tickN) % 3) - 1 : 0);
          g.drawImage(I.fC, fx, fy);
          if (P.food >= i * 2 + 2) g.drawImage(hung ? I.fgF : I.fF, fx, fy); else if (P.food === i * 2 + 1) g.drawImage(hung ? I.fgH : I.fH, fx, fy);
        }
        let ay = y0 - 10;
        if (P.absorb > 0) { for (let i = 0; i < Math.ceil(P.absorb / 2); i++) { g.drawImage(I.hC, hx + i * 8, ay); g.drawImage(P.absorb >= i * 2 + 2 ? I.aF : I.aH, hx + i * 8, ay); } ay -= 10; }
        const [def] = armorPts();
        if (def > 0) for (let i = 0; i < 10; i++) { const x = hx + i * 8; g.drawImage(I.aC, x, ay); if (def >= i * 2 + 2) g.drawImage(I.aFl, x, ay); else if (def === i * 2 + 1) g.drawImage(I.aHf, x, ay); }
        if (P.air < CFG.AIR_MAX) { const n = Math.ceil(Math.max(0, P.air - 2) * 10 / 300); for (let i = 0; i < n; i++) g.drawImage(I.bub, hx + 182 - 9 - i * 8, y0 - 10); }
      }
      if (md !== 'creative' && md !== 'spectator') {
        const need = xpNeed(P.lvl), xw = Math.round(181 * P.xp / need);
        g.fillStyle = '#000'; g.fillRect(hx, GH - 29, 182, 5); g.fillStyle = '#242424'; g.fillRect(hx + 1, GH - 28, 180, 3);
        if (xw > 0) { g.fillStyle = '#80ff20'; g.fillRect(hx + 1, GH - 28, Math.min(180, xw), 2); g.fillStyle = '#4ea80e'; g.fillRect(hx + 1, GH - 26, Math.min(180, xw), 1); }
        if (P.lvl > 0) { const s = String(P.lvl), x = (GW - tw(s)) >> 1, y = GH - 36; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) text(s, x + a, y + b, '#000000', false); text(s, x, y, '#80ff20', false); }
      }
      if (nameT > 0 && held()) { const s = IT[held().id].name, a = Math.min(1, nameT / 10); g.globalAlpha = a; textC(s, GW / 2, GH - (md === 'creative' ? 38 : 59), '#ffffff'); g.globalAlpha = 1; }
      if (titleMsg && now < titleMsg.until) { const a = clamp((titleMsg.until - now) / 500, 0, 1); g.globalAlpha = a; textC(titleMsg.t, GW / 2, GH / 2 - 40, '#ffffff', true, 2); if (titleMsg.s) textC(titleMsg.s, GW / 2, GH / 2 - 16, '#e0e0e0'); g.globalAlpha = 1; }
      if (showF3) {
        const lx = -Math.sin(P.yaw), lz = -Math.cos(P.yaw), L = getL(Math.floor(P.x), Math.floor(P.y), Math.floor(P.z));
        const face = Math.abs(lx) > Math.abs(lz) ? (lx > 0 ? 'east (Towards positive X)' : 'west (Towards negative X)') : (lz > 0 ? 'south (Towards positive Z)' : 'north (Towards negative Z)');
        const B2 = W.gen.BIO[bio(Math.floor(P.x), Math.floor(P.z))] || {};
        const bx = Math.floor(P.x), by = Math.floor(P.y), bz = Math.floor(P.z), yd = ((180 - P.yaw * 180 / Math.PI) % 360 + 540) % 360 - 180, md2 = performance.memory;
        if (!F3G) { F3G = ['WebGL', 'WebGL']; try { const gl2 = renderer.getContext(), ex = gl2.getExtension('WEBGL_debug_renderer_info'); F3G = [ex ? gl2.getParameter(ex.UNMASKED_VENDOR_WEBGL) : gl2.getParameter(gl2.VENDOR), ex ? gl2.getParameter(ex.UNMASKED_RENDERER_WEBGL) : gl2.getParameter(gl2.RENDERER), gl2.getParameter(gl2.VERSION)]; const m = /ANGLE \(([^,]+),\s*(.+?)(?:\s*\(0x[0-9a-f]+\))?\s*(?:Direct3D|OpenGL|Vulkan|Metal|,)/i.exec(F3G[1]); if (m) { F3G[0] = m[1]; F3G[1] = m[2]; } F3G = F3G.map(v => String(v).slice(0, 48)); } catch (e) { } }
        const lines = ['Blockcraft 26.3 (26.3/' + (NET.role ? 'multiplayer' : 'vanilla') + ')', fps + ' fps T: ' + (SET.fps || 'inf') + ' vsync ' + (SET.fancy ? 'fancy' : 'fast') + (SET.clouds ? '-clouds' : '') + ' B: 2', (NET.role === 'guest' ? 'Remote server @ ' + (api.net.rtt || 0) + ' ms ping' : 'Integrated server @ ' + fT.toFixed(1) + '/50.0 ms') + ', ' + (NET.role ? playersList().length + ' players' : '20 tps'), 'C: ' + VIS.n + '/' + VIS.tot + ' (' + W.cols.size + ' cols) D: ' + RD + (SET.rd ? '' : ' auto') + ', draws: ' + renderer.info.render.calls, 'E: ' + ENTS.length + '/' + ENTS.length + ', P: ' + (ENTS.filter(e => e.kind === 'mob').length), 'minecraft:overworld FC: 0', '', 'XYZ: ' + P.x.toFixed(3) + ' / ' + (P.y - CFG.YOFF).toFixed(5) + ' / ' + P.z.toFixed(3), 'Block: ' + bx + ' ' + (by - CFG.YOFF) + ' ' + bz + ' [' + (bx & 15) + ' ' + (by & 15) + ' ' + (bz & 15) + ']', 'Chunk: ' + (bx >> 4) + ' ' + ((by - CFG.YOFF) >> 4) + ' ' + (bz >> 4) + ' [' + ((bx >> 4) & 31) + ' ' + ((bz >> 4) & 31) + ' in r.' + (bx >> 9) + '.' + (bz >> 9) + '.mca]', 'Facing: ' + face + ' (' + yd.toFixed(1) + ' / ' + (-P.pitch * 180 / Math.PI).toFixed(1) + ')', 'Client Light: ' + Math.max(L >> 4, L & 15) + ' (' + (L >> 4) + ' sky, ' + (L & 15) + ' block)', 'Biome: minecraft:' + (B2.n || '').toLowerCase().replace(/ /g, '_'), 'Local Difficulty: ' + (W.diff * .75 + .75).toFixed(2) + ' // 0.00 (Day ' + Math.floor(W.time / CFG.DAY) + ')', '', 'For help: press F3 + Q'];
        const right = ['Java: 21.0.8 64bit', md2 ? 'Mem: ' + Math.round(md2.usedJSHeapSize / md2.jsHeapSizeLimit * 100) + '% ' + Math.round(md2.usedJSHeapSize / 1048576) + '/' + Math.round(md2.jsHeapSizeLimit / 1048576) + 'MB' : 'Mem: n/a', md2 ? 'Allocated: ' + Math.round(md2.totalJSHeapSize / md2.jsHeapSizeLimit * 100) + '% ' + Math.round(md2.totalJSHeapSize / 1048576) + 'MB' : '', '', 'CPU: ' + (navigator.hardwareConcurrency || 1) + 'x', '', 'Display: ' + hud.width + 'x' + hud.height + ' (' + F3G[0] + ')', F3G[1], F3G[2] || ''];
        if (HIT.b) { const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]]; right.push('', 'Targeted Block: ' + HIT.x + ', ' + (HIT.y - CFG.YOFF) + ', ' + HIT.z, 'minecraft:' + t.id); for (const [k, vals] of t.props) right.push(k + ': ' + vals[sv(s, k)]); for (const tg of t.tags) right.push('#minecraft:' + tg); }
        const bg = 'rgba(80,80,80,.565)';
        lines.forEach((l, i) => { if (!l) return; g.fillStyle = bg; g.fillRect(1, 1 + i * 9, tw(l) + 2, 9); text(l, 2, 2 + i * 9, '#e0e0e0', false); });
        right.forEach((l, i) => { if (!l) return; const w = tw(l); g.fillStyle = bg; g.fillRect(GW - w - 3, 1 + i * 9, w + 2, 9); text(l, GW - w - 2, 2 + i * 9, '#e0e0e0', false); });
      }
      if (keys.has('Tab') && NET.role && !gui) { const pl = api.net.players || []; const w = 160, x = (GW - w) / 2; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, 10, w, 12 + pl.length * 10); pl.forEach((p, i) => { text(p.name + (p.host ? ' (host)' : ''), x + 4, 14 + i * 10, '#ffffff', false); if (p.ping) textR(p.ping + 'ms', x + w - 4, 14 + i * 10, '#80ff80', false); }); }
    }
    const TABS = [['build', 'Building Blocks', 'bricks'], ['color', 'Colored Blocks', 'cyan_wool'], ['nature', 'Natural Blocks', 'grass_block'], ['func', 'Functional Blocks', 'crafting_table'], ['red', 'Redstone Blocks', 'redstone'], ['search', 'Search Items', 'compass'], ['tools', 'Tools & Utilities', 'diamond_pickaxe'], ['combat', 'Combat', 'netherite_sword'], ['food', 'Food & Drinks', 'golden_apple'], ['ingr', 'Ingredients', 'iron_ingot'], ['eggs', 'Spawn Eggs', 'pig_spawn_egg'], ['inv', 'Survival Inventory', 'chest']];
    let cTab = 'build', cScroll = 0, TABL = null, scIn = [null], scSel = -1, guiBE = null, guiPos = null, drag = null, lastClick = { t: 0, sl: null }, signLines = null, signLine = 0, craftCache = { k: '', r: null };
    function tabList(t) {
      if (!TABL) {
        TABL = {}; for (const [k] of TABS) TABL[k] = [];
        for (const it of IT) { if (!it.tab || it.hidden || it.id === 'air') continue; const set = new Set([it.tab].concat(Array.isArray(it.tabs) ? it.tabs : [])); for (const k of set) if (TABL[k]) TABL[k].push(it.idx); }
      }
      if (t === 'search') { const q = (FIELDV.csearch || '').toLowerCase().trim(); return IT.filter(it => it.tab && it.id !== 'air' && (!q || it.name.toLowerCase().includes(q) || it.id.includes(q.replace(/ /g, '_')))).map(it => it.idx); }
      return TABL[t] || [];
    }
    const INVG = new Set(['inv', 'table', 'furnace', 'chest', 'ender', 'dispenser', 'hopper', 'stonecutter', 'creative']);
    const stackMax = (sl, st) => Math.min(sl.max || 99, IT[st.id].stack);
    function addSlot(arr, i, x, y, o) { const sl = Object.assign({ arr, i, x, y, get: () => arr[i], set: v => { arr[i] = v; } }, o || {}); slots.push(sl); return sl; }
    const armorOk = k => st => { const it = IT[st.id]; return it.armor ? it.armor.slot === k : k === 0 && (it.id === 'carved_pumpkin' || /_head$|_skull$/.test(it.id)); };
    function remainder(id) { const n = IT[id].id; if (n === 'milk_bucket' || n === 'water_bucket' || n === 'lava_bucket' || n === 'powder_snow_bucket') return IN.bucket.idx; if (n === 'honey_bottle' || n === 'dragon_breath') return IN.glass_bottle.idx; return -1; }
    function craftResult(grid, w) {
      const k = grid.map(s => s ? s.id + ':' + (s.d || 0) : '').join(',') + '/' + w;
      if (craftCache.k !== k) { craftCache.k = k; craftCache.r = craftMatch(grid, w); }
      const r = craftCache.r;
      if (!r) return null;
      return { id: r.out, n: r.n, d: r.dmg || 0 };
    }
    function takeCraft(grid) {
      for (let i = 0; i < grid.length; i++) {
        const s = grid[i]; if (!s) continue;
        const rem = remainder(s.id);
        if (--s.n <= 0) grid[i] = rem >= 0 ? { id: rem, n: 1, d: 0 } : null;
        else if (rem >= 0) giveOrDrop({ id: rem, n: 1 });
      }
      craftCache.k = '';
    }
    function playerSlots(ox, oy) {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) addSlot(inv, 9 + r * 9 + c, ox + 8 + c * 18, oy + r * 18, { g: 'main' });
      for (let c = 0; c < 9; c++) addSlot(inv, c, ox + 8 + c * 18, oy + 58, { g: 'hot' });
    }
    function contArr() { return gui === 'ender' ? ender : guiBE && guiBE.items; }
    function layout() {
      slots = [];
      const G2 = gui;
      let pw = 176, ph = 166;
      if (G2 === 'chest' || G2 === 'ender') ph = 168;
      if (G2 === 'hopper') ph = 133;
      if (G2 === 'creative') { pw = 195; ph = 136; }
      const ox = (GW - pw) >> 1, oy = Math.max(cTabH(), (GH - ph) >> 1);
      pRect = [ox, oy, pw, ph];
      if (G2 === 'inv') {
        for (let k = 0; k < 4; k++) addSlot(armor, k, ox + 8, oy + 8 + k * 18, { g: 'armor', acc: armorOk(k), max: 1 });
        addSlot(null, 0, ox + 77, oy + 62, { g: 'off', get: () => offhand, set: v => { offhand = v; } });
        for (let k = 0; k < 4; k++) addSlot(craft2, k, ox + 98 + (k & 1) * 18, oy + 18 + (k >> 1) * 18, { g: 'craft' });
        addSlot(null, 0, ox + 154, oy + 28, { g: 'out', grid: craft2, w: 2, get: () => craftResult(craft2, 2) });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'table') {
        for (let k = 0; k < 9; k++) addSlot(craft3, k, ox + 30 + (k % 3) * 18, oy + 17 + (k / 3 | 0) * 18, { g: 'craft' });
        addSlot(null, 0, ox + 124, oy + 35, { g: 'out', grid: craft3, w: 3, get: () => craftResult(craft3, 3) });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'furnace' && guiBE) {
        const F = guiBE;
        addSlot(F, 'i', ox + 56, oy + 17, { g: 'fin' });
        addSlot(F, 'f', ox + 56, oy + 53, { g: 'ffuel', acc: st => fuelOf(st.id) > 0 });
        addSlot(F, 'o', ox + 116, oy + 35, { g: 'fout', acc: () => false });
        playerSlots(ox, oy + 84);
      } else if ((G2 === 'chest' || G2 === 'ender') && contArr()) {
        const a = contArr();
        for (let k = 0; k < 27; k++) addSlot(a, k, ox + 8 + (k % 9) * 18, oy + 18 + (k / 9 | 0) * 18, { g: 'cont', acc: st => !(guiBE && guiBE.shulker && IT[st.id].block && TN[IT[st.id].block] && TN[IT[st.id].block].shulker) });
        playerSlots(ox, oy + 86);
      } else if (G2 === 'dispenser' && contArr()) {
        for (let k = 0; k < 9; k++) addSlot(contArr(), k, ox + 62 + (k % 3) * 18, oy + 17 + (k / 3 | 0) * 18, { g: 'cont' });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'hopper' && contArr()) {
        for (let k = 0; k < 5; k++) addSlot(contArr(), k, ox + 44 + k * 18, oy + 20, { g: 'cont' });
        playerSlots(ox, oy + 51);
      } else if (G2 === 'stonecutter') {
        addSlot(scIn, 0, ox + 20, oy + 33, { g: 'scin' });
        addSlot(null, 0, ox + 143, oy + 33, { g: 'scout', get: () => { const s = scIn[0], l = s && CUT[s.id]; return l && l[scSel] ? { id: l[scSel][0], n: l[scSel][1], d: 0 } : null; } });
        playerSlots(ox, oy + 84);
      } else if (G2 === 'creative') {
        if (cTab === 'inv') {
          for (let k = 0; k < 4; k++) addSlot(armor, k, ox + 54 + (k >> 1) * 54, oy + 6 + (k & 1) * 27, { g: 'armor', acc: armorOk(k), max: 1 });
          addSlot(null, 0, ox + 35, oy + 20, { g: 'off', get: () => offhand, set: v => { offhand = v; } });
          for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) addSlot(inv, 9 + r * 9 + c, ox + 9 + c * 18, oy + 54 + r * 18, { g: 'main' });
          addSlot(null, 0, ox + 173, oy + 112, { g: 'trash', get: () => null, set: () => { } });
        } else {
          const L = tabList(cTab), rowsN = Math.ceil(L.length / 9);
          cScroll = clamp(cScroll, 0, Math.max(0, rowsN - 5));
          for (let k = 0; k < 45; k++) { const id = L[cScroll * 9 + k]; if (id === undefined) break; addSlot(null, 0, ox + 9 + (k % 9) * 18, oy + 18 + (k / 9 | 0) * 18, { g: 'cre', get: () => ({ id, n: 1, d: 0 }), set: () => { } }); }
        }
        for (let c = 0; c < 9; c++) addSlot(inv, c, ox + 9 + c * 18, oy + 112, { g: 'hot' });
      }
      return [ox, oy, pw, ph];
    }
    const cTabH = () => gui === 'creative' ? 30 : 4;
    function slotAt(x, y) { for (const sl of slots) if (x >= sl.x - 1 && y >= sl.y - 1 && x < sl.x + 17 && y < sl.y + 17) return sl; return null; }
    function moveInto(st, list, rev) {
      if (!st) return null;
      const ms = IT[st.id].stack, L = rev ? list.slice().reverse() : list;
      for (const sl of L) { if (st.n <= 0) break; const t = sl.get(); if (t && sameSt(t, st) && t.n < stackMax(sl, st)) { const m = Math.min(stackMax(sl, st) - t.n, st.n); t.n += m; st.n -= m; } }
      for (const sl of L) { if (st.n <= 0) break; if (!sl.get() && (!sl.acc || sl.acc(st))) { const m = Math.min(stackMax(sl, st), st.n, ms); sl.set({ id: st.id, n: m, d: st.d || 0, x: st.x }); st.n -= m; } }
      return st.n > 0 ? st : null;
    }
    function quickMove(sl) {
      const st = sl.get(); if (!st) return;
      const G2 = sl.g, by = g2 => slots.filter(s => s.g === g2), pl = by('main').concat(by('hot'));
      let rest = { ...st };
      if (G2 === 'cre') { giveItem({ id: st.id, n: IT[st.id].stack }); return; }
      if (G2 === 'cont' || G2 === 'fin' || G2 === 'ffuel' || G2 === 'fout' || G2 === 'craft' || G2 === 'armor' || G2 === 'off' || G2 === 'scin') {
        rest = moveInto(rest, G2 === 'craft' || G2 === 'armor' || G2 === 'off' || gui === 'inv' ? by('main').concat(by('hot')) : pl, gui !== 'inv' && G2 !== 'craft' && G2 !== 'armor' && G2 !== 'off');
        if (G2 === 'fout' && guiBE && guiBE.xp >= 1) { addXp(Math.floor(guiBE.xp)); guiBE.xp -= Math.floor(guiBE.xp); }
      } else if (G2 === 'main' || G2 === 'hot') {
        const it = IT[st.id];
        const cont = by('cont');
        if (cont.length) rest = moveInto(rest, cont);
        else if (gui === 'furnace') { if (SMELT[st.id]) rest = moveInto(rest, by('fin')); else if (fuelOf(st.id)) rest = moveInto(rest, by('ffuel')); else rest = moveInto(rest, by(G2 === 'main' ? 'hot' : 'main')); }
        else if (gui === 'stonecutter' && CUT[st.id]) rest = moveInto(rest, by('scin'));
        else if ((gui === 'inv' || gui === 'creative') && it.armor && !armor[it.armor.slot]) rest = moveInto(rest, by('armor'));
        else if (gui === 'inv' && it.shield && !offhand) rest = moveInto(rest, by('off'));
        else rest = moveInto(rest, by(G2 === 'main' ? 'hot' : 'main'));
      } else if (G2 === 'trash') return;
      sl.set(rest);
    }
    function takeOutput(sl, shift) {
      for (let guard = 0; guard < 64; guard++) {
        const res = sl.get(); if (!res) return;
        if (shift) { const left = moveInto({ ...res }, slots.filter(s => s.g === 'main' || s.g === 'hot'), true); if (left && left.n === res.n) return; if (left) giveOrDrop(left); }
        else { if (cursor && (!sameSt(cursor, res) || cursor.n + res.n > IT[res.id].stack)) return; if (cursor) cursor.n += res.n; else cursor = { ...res }; }
        if (sl.g === 'out') takeCraft(sl.grid);
        else if (sl.g === 'scout') { if (--scIn[0].n <= 0) { scIn[0] = null; scSel = -1; } }
        snd(sl.g === 'scout' ? 'stonecutter' : 'pop');
        if (!shift) return;
      }
    }
    function slotClick(sl, btn, shift) {
      if (sl.g === 'out' || sl.g === 'scout') { takeOutput(sl, shift); return; }
      if (sl.g === 'trash') { if (cursor) cursor = null; else if (shift) { inv.fill(null); armor.fill(null); offhand = null; } return; }
      if (sl.g === 'cre') {
        const st = sl.get();
        if (cursor) { if (sameSt(cursor, st) && btn === 0) cursor.n = Math.min(IT[st.id].stack, cursor.n + 1); else cursor = null; return; }
        if (shift) { quickMove(sl); return; }
        cursor = { id: st.id, n: btn === 1 ? IT[st.id].stack : 1, d: 0 }; return;
      }
      if (shift) { quickMove(sl); afterClick(); return; }
      const st = sl.get();
      if (btn === 1 && creative() && st && !cursor) { cursor = { ...st, n: IT[st.id].stack }; return; }
      if (sl.g === 'fout') {
        if (!st) return;
        if (!cursor) { cursor = st; sl.set(null); } else if (sameSt(cursor, st) && cursor.n + st.n <= IT[st.id].stack) { cursor.n += st.n; sl.set(null); } else return;
        if (guiBE && guiBE.xp >= 1) { addXp(Math.floor(guiBE.xp)); guiBE.xp -= Math.floor(guiBE.xp); }
        afterClick(); return;
      }
      const ok = c => !sl.acc || sl.acc(c);
      if (btn === 0) {
        if (!cursor && st) { cursor = st; sl.set(null); }
        else if (cursor && !st) { if (ok(cursor)) { const m = Math.min(cursor.n, stackMax(sl, cursor)); sl.set({ ...cursor, n: m }); cursor.n -= m; if (cursor.n <= 0) cursor = null; } }
        else if (cursor && st) {
          if (sameSt(cursor, st)) { const m = Math.min(cursor.n, stackMax(sl, st) - st.n); if (m > 0) { st.n += m; cursor.n -= m; if (cursor.n <= 0) cursor = null; } }
          else if (ok(cursor) && cursor.n <= stackMax(sl, cursor)) { sl.set(cursor); cursor = st; }
        }
      } else {
        if (!cursor && st) { const h = Math.ceil(st.n / 2); cursor = { ...st, n: h }; st.n -= h; if (st.n <= 0) sl.set(null); }
        else if (cursor && !st) { if (ok(cursor)) { sl.set({ ...cursor, n: 1 }); if (--cursor.n <= 0) cursor = null; } }
        else if (cursor && st) {
          if (sameSt(cursor, st)) { if (st.n < stackMax(sl, st)) { st.n++; if (--cursor.n <= 0) cursor = null; } }
          else if (ok(cursor) && cursor.n <= stackMax(sl, cursor)) { sl.set(cursor); cursor = st; }
        }
      }
      if (sl.g === 'scin') scSel = -1;
      afterClick();
    }
    function collectAll() {
      if (!cursor) return;
      const ms = IT[cursor.id].stack;
      for (const pass of [0, 1]) for (const sl of slots) {
        if (cursor.n >= ms) return;
        if (sl.g === 'out' || sl.g === 'cre' || sl.g === 'trash' || sl.g === 'scout') continue;
        const st = sl.get(); if (!st || !sameSt(st, cursor)) continue;
        if (pass === 0 && st.n >= ms) continue;
        const m = Math.min(ms - cursor.n, st.n); cursor.n += m; st.n -= m; if (st.n <= 0) sl.set(null);
      }
      afterClick();
    }
    function afterClick() { if (guiBE && guiPos) beChanged(guiPos[0], guiPos[1], guiPos[2]); }
    function invDown(btn, shift) {
      if (!INVG.has(gui)) return false;
      const [ox, oy, pw, ph] = pRect;
      if (gui === 'creative') {
        const t = creativeTabAt(mx, my); if (t) { cTab = t; cScroll = 0; if (t === 'search') { FIELDV.csearch = FIELDV.csearch || ''; focusField('csearch', FIELDV.csearch, 50); } else blurField(); return true; }
        if (cTab !== 'inv' && mx >= ox + 174 && mx < ox + 188 && my >= oy + 17 && my < oy + 129) { const rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = Math.round(clamp((my - oy - 18) / 110, 0, 1) * Math.max(0, rowsN - 5)); drag = { scroll: 1 }; return true; }
      }
      if (gui === 'stonecutter' && scIn[0] && CUT[scIn[0].id]) {
        const L = CUT[scIn[0].id];
        for (let k = 0; k < Math.min(12, L.length); k++) { const bx2 = ox + 52 + (k % 4) * 16, by2 = oy + 15 + (k / 4 | 0) * 18; if (mx >= bx2 && my >= by2 && mx < bx2 + 16 && my < by2 + 18) { scSel = k; snd('click'); return true; } }
      }
      const sl = slotAt(mx, my);
      if (!sl) {
        const out = mx < ox || my < oy - (gui === 'creative' ? 28 : 0) || mx >= ox + pw || my >= oy + ph + (gui === 'creative' ? 28 : 0);
        if (out && cursor) { if (btn === 0) { throwStack(cursor, true); cursor = null; } else { throwStack({ ...cursor, n: 1 }, true); if (--cursor.n <= 0) cursor = null; } }
        return true;
      }
      const now = performance.now();
      if (btn === 0 && !shift && lastClick.sl && lastClick.sl.arr === sl.arr && lastClick.sl.i === sl.i && now - lastClick.t < 300 && cursor && sl.g !== 'cre') { collectAll(); lastClick.t = 0; return true; }
      lastClick = { t: now, sl };
      if (cursor && !shift && btn !== 1 && (sl.g === 'main' || sl.g === 'hot' || sl.g === 'cont' || sl.g === 'craft' || sl.g === 'fin' || sl.g === 'ffuel')) { drag = { btn, list: [sl] }; return true; }
      slotClick(sl, btn, shift);
      return true;
    }
    function sameSlot(a, b) { return !!a && !!b && a.arr === b.arr && a.i === b.i; }
    function invMove() {
      if (!drag) return;
      if (drag.scroll) { const [, oy] = pRect, rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = Math.round(clamp((my - oy - 18) / 110, 0, 1) * Math.max(0, rowsN - 5)); return; }
      const sl = slotAt(mx, my);
      if (!sl || drag.list.some(q => sameSlot(q, sl)) || !cursor) return;
      if (!(sl.g === 'main' || sl.g === 'hot' || sl.g === 'cont' || sl.g === 'craft' || sl.g === 'fin' || sl.g === 'ffuel')) return;
      const st = sl.get();
      if (st && !sameSt(st, cursor)) return;
      if (sl.acc && !sl.acc(cursor)) return;
      if (drag.list.length >= cursor.n && drag.btn === 0) return;
      drag.list.push(sl);
    }
    function invUp() {
      const d = drag; drag = null;
      if (!d || d.scroll) return;
      if (d.list.length <= 1) { slotClick(d.list[0], d.btn, false); return; }
      if (!cursor) return;
      const per = d.btn === 0 ? Math.floor(cursor.n / d.list.length) : 1;
      for (const sl of d.list) {
        if (!cursor || cursor.n <= 0) break;
        const st = sl.get(), room = stackMax(sl, cursor) - (st ? st.n : 0), m = Math.min(per, room, cursor.n);
        if (m <= 0) continue;
        if (st) st.n += m; else sl.set({ ...cursor, n: m });
        cursor.n -= m;
      }
      if (cursor && cursor.n <= 0) cursor = null;
      afterClick();
    }
    function invKey(code) {
      if (!INVG.has(gui)) return false;
      const sl = hovSlot;
      const m = /^Digit([1-9])$/.exec(code);
      if (m && sl && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash') {
        const k = +m[1] - 1;
        if (sl.g === 'cre') { inv[k] = { id: sl.get().id, n: IT[sl.get().id].stack, d: 0 }; return true; }
        if (sl.arr === inv && sl.i === k) return true;
        const a = sl.get(), b = inv[k];
        if (b && sl.acc && !sl.acc(b)) return true;
        sl.set(b); inv[k] = a; afterClick(); return true;
      }
      if (code === KB.drop && sl && sl.get() && sl.g !== 'cre' && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash') {
        const st = sl.get(), all = keys.has('ControlLeft') || keys.has('MetaLeft');
        if (all) { throwStack(st, true); sl.set(null); } else { throwStack({ ...st, n: 1 }, true); if (--st.n <= 0) sl.set(null); }
        afterClick(); return true;
      }
      if (code === KB.swap && sl && sl.g !== 'cre' && sl.g !== 'out' && sl.g !== 'scout' && sl.g !== 'trash' && sl.g !== 'off') { const a = sl.get(); sl.set(offhand); offhand = a; afterClick(); return true; }
      return false;
    }
    function invWheel(dy) { if (gui === 'creative' && cTab !== 'inv') { const rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = clamp(cScroll + (dy > 0 ? 1 : -1), 0, Math.max(0, rowsN - 5)); return true; } return false; }
    function creativeTabAt(x, y) {
      const [ox, oy, pw, ph] = pRect;
      for (let k = 0; k < TABS.length; k++) { const top = k < 6, i = top ? k : k - 6, tx = ox + i * 29 + (i === 5 ? pw - 6 * 29 - 1 : 0), ty = top ? oy - 28 : oy + ph; if (x >= tx && x < tx + 28 && y >= ty && y < ty + 28) return TABS[k][0]; }
      return null;
    }
    function drawCreativeTabs(sel2) {
      const [ox, oy, pw, ph] = pRect;
      for (let k = 0; k < TABS.length; k++) {
        const [id, , icon] = TABS[k], top = k < 6, i = top ? k : k - 6, tx = ox + i * 29 + (i === 5 ? pw - 6 * 29 - 1 : 0), ty = top ? oy - 28 : oy + ph, on = id === cTab;
        if (on !== sel2) continue;
        g.fillStyle = '#000'; g.fillRect(tx, ty + (top ? 0 : -2), 28, 30);
        g.fillStyle = on ? '#c6c6c6' : '#8b8b8b'; g.fillRect(tx + 1, ty + (top ? 1 : -2), 26, 29);
        g.fillStyle = on ? '#fff' : '#a8a8a8'; g.fillRect(tx + 1, ty + (top ? 1 : 0), 2, 26);
        g.fillStyle = on ? '#555' : '#555'; g.fillRect(tx + 25, ty + (top ? 1 : 0), 2, 26);
        if (IN[icon]) drawItem({ id: IN[icon].idx, n: 1 }, tx + 6, ty + (top ? 8 : 4), true);
        if (inR(mx, my, { x: tx, y: ty, w: 28, h: 28 })) TIPQ = [[TABS[k][1], '#ffffff']];
      }
    }
    let TIPQ = null;
    const EMPTYI = [['................', '................', '....########....', '...#........#...', '...#........#...', '...#........#...', '...#..####..#...', '...#.#....#.#...', '...###....###...'], ['..###......###..', '.#...######...#.', '.#............#.', '.##.#......#.##.', '..#.#......#.#..', '....#......#....', '....#......#....', '....#......#....', '....#......#....', '....#......#....', '....########....'], ['....########....', '....#......#....', '....#......#....', '....#..##..#....', '....#.#..#.#....', '....#.#..#.#....', '....#.#..#.#....', '....#.#..#.#....', '....#.#..#.#....', '....###..###....'], ['................', '................', '................', '................', '...###....###...', '...#.#....#.#...', '...#.#....#.#...', '..##.#....#.##..', '..#..#....#..#..', '..####....####..'], ['...##########...', '...#........#...', '...#........#...', '...#........#...', '...#........#...', '...#........#...', '....#......#....', '.....#....#.....', '......#..#......', '.......##.......']].map(r => { while (r.length < 14) r = r.length % 2 ? r.concat(['................']) : ['................'].concat(r); return tplC(r.concat(['................', '................']).slice(0, 16), ch => ch === '#' ? '#5c5c5c' : null); });
    function drawSlotBg(sl) { frame(sl.x, sl.y, 18); }
    function drawInv(now) {
      const [ox, oy, pw, ph] = layout();
      TIPQ = null;
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      if (gui === 'creative') drawCreativeTabs(false);
      panel(ox, oy, pw, ph);
      const T = (s, x, y) => text(s, ox + x, oy + y, '#404040', false);
      if (gui === 'inv') {
        T('Crafting', 97, 8);
        g.fillStyle = '#373737'; g.fillRect(ox + 25, oy + 7, 51, 1); g.fillRect(ox + 25, oy + 7, 1, 72); g.fillStyle = '#fff'; g.fillRect(ox + 26, oy + 78, 51, 1); g.fillRect(ox + 76, oy + 8, 1, 71); g.fillStyle = '#000'; g.fillRect(ox + 26, oy + 8, 50, 70);
        g.save(); g.beginPath(); g.rect(ox + 26, oy + 8, 50, 70); g.clip(); drawPlayerModel(ox + 51, oy + 27, 1.75); g.restore();
        arrowGlyph(ox + 135, oy + 29, 0);
      } else if (gui === 'table') { T('Crafting', 28, 6); arrowGlyph(ox + 90, oy + 35, 0); }
      else if (gui === 'furnace' && guiBE) {
        T(guiBE.kind === 'blast_furnace' ? 'Blast Furnace' : guiBE.kind === 'smoker' ? 'Smoker' : 'Furnace', 60, 6);
        const F = guiBE, fl = F.b > 0 && F.bm ? F.b / F.bm : 0;
        g.drawImage(I.flU, ox + 57, oy + 37);
        if (fl > 0) { const hh = Math.ceil(14 * fl); g.drawImage(I.flL, 0, 14 - hh, 14, hh, ox + 57, oy + 37 + 14 - hh, 14, hh); }
        arrowGlyph(ox + 79, oy + 34, F.ct ? F.c / F.ct : 0);
      } else if (gui === 'chest' || gui === 'ender') T(gui === 'ender' ? 'Ender Chest' : guiBE && guiBE.title || 'Chest', 8, 6);
      else if (gui === 'dispenser') T(guiBE && guiBE.title || 'Dispenser', 62, 6);
      else if (gui === 'hopper') T('Hopper', 8, 6);
      else if (gui === 'stonecutter') {
        T('Stonecutter', 8, 4);
        g.fillStyle = '#8b8b8b'; g.fillRect(ox + 52, oy + 14, 64, 56);
        const L = scIn[0] && CUT[scIn[0].id];
        if (L) for (let k = 0; k < Math.min(12, L.length); k++) {
          const bx2 = ox + 52 + (k % 4) * 16, by2 = oy + 15 + (k / 4 | 0) * 18, hv = mx >= bx2 && my >= by2 && mx < bx2 + 16 && my < by2 + 18;
          g.fillStyle = k === scSel ? '#5a8a5a' : hv ? '#d0d0d0' : '#a8a8a8'; g.fillRect(bx2, by2, 16, 18); ring(bx2, by2, 16, 18, 1, '#555');
          drawItem({ id: L[k][0], n: L[k][1] }, bx2, by2 + 1);
          if (hv) TIPQ = itemTip({ id: L[k][0], n: 1 });
        }
      } else if (gui === 'creative') {
        const tab = TABS.find(t => t[0] === cTab);
        T(tab ? tab[1] : '', 8, 6);
        if (cTab === 'search') { const v = FIELDV.csearch || ''; field('csearch', ox + 82, oy + 4, 89, 11, v, 'Search...', null, 50); if (focusKey === 'csearch') FIELDV.csearch = inp.value; }
        if (cTab !== 'inv') {
          const rowsN = Math.ceil(tabList(cTab).length / 9), mxs = Math.max(0, rowsN - 5);
          g.fillStyle = '#000'; g.fillRect(ox + 174, oy + 17, 14, 112); g.fillStyle = '#8b8b8b'; g.fillRect(ox + 175, oy + 18, 12, 110);
          const ty = oy + 18 + (mxs ? cScroll / mxs : 0) * 95;
          g.fillStyle = mxs ? '#c6c6c6' : '#9a9a9a'; g.fillRect(ox + 175, ty, 12, 15); g.fillStyle = '#fff'; g.fillRect(ox + 175, ty, 11, 1); g.fillRect(ox + 175, ty, 1, 14); g.fillStyle = '#555'; g.fillRect(ox + 176, ty + 14, 11, 1); g.fillRect(ox + 186, ty + 1, 1, 14);
        } else {
          g.fillStyle = '#000'; g.fillRect(ox + 73, oy + 6, 32, 43);
          g.save(); g.beginPath(); g.rect(ox + 73, oy + 6, 32, 43); g.clip(); drawPlayerModel(ox + 89, oy + 18, 1); g.restore();
        }
      }
      for (const sl of slots) {
        if (sl.g === 'trash') { frame(sl.x, sl.y, 18); g.strokeStyle = '#a03030'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sl.x + 3, sl.y + 3); g.lineTo(sl.x + 13, sl.y + 13); g.moveTo(sl.x + 13, sl.y + 3); g.lineTo(sl.x + 3, sl.y + 13); g.stroke(); continue; }
        if (sl.g === 'out' && gui === 'inv') drawSlotBg(sl);
        else if (sl.g === 'out' || sl.g === 'scout' || sl.g === 'fout') { g.fillStyle = '#373737'; g.fillRect(sl.x - 5, sl.y - 5, 26, 26); g.fillStyle = '#fff'; g.fillRect(sl.x - 4, sl.y - 4, 25, 25); g.fillStyle = '#8b8b8b'; g.fillRect(sl.x - 4, sl.y - 4, 24, 24); }
        else drawSlotBg(sl);
        if (!sl.get() && (sl.g === 'armor' || sl.g === 'off')) g.drawImage(EMPTYI[sl.g === 'off' ? 4 : sl.i & 3], sl.x, sl.y);
      }
      for (const sl of slots) {
        if (sl.g === 'trash') continue;
        drawItem(sl.get(), sl.x, sl.y);
        if (drag && drag.list && drag.list.some(q => sameSlot(q, sl))) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(sl.x, sl.y, 16, 16); }
      }
      if (gui === 'creative') drawCreativeTabs(true);
      hovSlot = slotAt(mx, my);
      if (hovSlot && !touch) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(hovSlot.x, hovSlot.y, 16, 16); drawItem(hovSlot.get(), hovSlot.x, hovSlot.y); }
      if (cursor) drawItem(cursor, mx - 8, my - 8);
      else if (hovSlot && hovSlot.get()) TIPQ = itemTip(hovSlot.get());
      if (TIPQ && !cursor) tooltip(TIPQ, mx + 10, my - 12);
      void now;
    }
    function arrowGlyph(x, y, f) { g.drawImage(I.arB, x, y); if (f > 0) { const w = Math.ceil(24 * f); g.drawImage(I.arF, 0, 0, w, 17, x, y, w, 17); } }
    function openGui(name) {
      if (name === 'inv' && creative()) name = 'creative';
      gui = name; guiBE = null; guiPos = null; cursor = cursor || null; drag = null; craftCache.k = '';
      if (name === 'stonecutter') { scIn[0] = null; scSel = -1; }
      releaseMouse();
    }
    function openContainer(x, y, z, kind) {
      const s = getS(x, y, z), t = TT[STT[s]];
      let be = beAt(x, y, z, false);
      if (!be) { initBlockEntity(x, y, z, t, null); be = beAt(x, y, z, true); }
      if (kind === 'furnace' && be.kind === undefined) Object.assign(be, { i: null, f: null, o: null, b: 0, bm: 0, c: 0, xp: 0, kind: t.fkind || 'furnace' });
      if (kind !== 'furnace' && !be.items) be.items = new Array(t.cont || 27).fill(null);
      if (t.shulker) be.shulker = 1;
      be.title = t.cont === 27 && !t.id.includes('chest') && !t.shulker ? t.name : t.shulker ? 'Shulker Box' : t.id === 'dropper' ? 'Dropper' : t.id === 'dispenser' ? 'Dispenser' : t.id.includes('chest') ? (t.id === 'trapped_chest' ? 'Chest' : t.name) : t.name;
      gui = kind; guiBE = be; guiPos = [x, y, z]; drag = null;
      if (NET.role === 'guest') netSend({ t: 'beget', k: bk(x, y, z) });
      viewing(bk(x, y, z), true);
      releaseMouse();
    }
    function openSign(x, y, z) {
      let be = beAt(x, y, z, true);
      if (!be.text) be.text = ['', '', '', ''];
      gui = 'sign'; guiBE = be; guiPos = [x, y, z]; signLines = be.text.slice(); signLine = 0;
      releaseMouse();
      focusField('sign', signLines[0], 15);
    }
    function closeGui(keepMouse) {
      if (!gui) return;
      uiT = performance.now();
      if (gui === 'sign' && guiBE) { if (focusKey === 'sign') signLines[signLine] = inp.value.slice(0, 15); guiBE.text = signLines.slice(); afterClick(); signDirty = true; }
      if (INVG.has(gui)) {
        for (const a of [craft2, craft3, scIn]) for (let i = 0; i < a.length; i++) if (a[i]) { giveOrDrop(a[i]); a[i] = null; }
        if (cursor) { giveOrDrop(cursor); cursor = null; }
      }
      if (guiPos) { const [x, y, z] = guiPos, s = getS(x, y, z); if (isT(s, 'barrel') && sv(s, 'open')) setBlock(x, y, z, sw(s, 'open', 0)); if (gui === 'chest' || gui === 'ender') snd('chest_close', { x, y, z }); afterClick(); viewing(bk(x, y, z), false); }
      if (gui === 'ender') snd('chest_close');
      gui = null; guiBE = null; guiPos = null; drag = null; hovSlot = null;
      blurField();
      if (!keepMouse && scr === 'game') lockMouse();
    }
    let signDirty = true;
    let signTC = null;
    function drawSign() {
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      textC('Edit Sign Message', GW / 2, 20, '#ffffff');
      const w = 96, x = (GW - w) >> 1, y = 44;
      const s = guiPos ? getS(guiPos[0], guiPos[1], guiPos[2]) : 0, t = TT[STT[s]], id = t ? t.id : 'oak_sign', wn = id.replace(/_(wall_)?(hanging_)?sign$/, '').replace(/_wall$/, ''), pl = TN[wn + '_planks'] ? wn + '_planks' : 'oak_planks';
      if (!signTC || signTC.n !== pl) { const d = get(pl), c = cv(16, 16), q = c.getContext('2d'), im = q.createImageData(16, 16); im.data.set(d); q.putImageData(im, 0, 0); signTC = { n: pl, c }; }
      if (!/hanging/.test(id) && !/wall/.test(id)) { g.drawImage(signTC.c, 7, 0, 2, 7, x + w / 2 - 6, y + 48, 12, 42); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + w / 2 - 6, y + 48, 12, 42); }
      g.drawImage(signTC.c, 0, 0, 16, 8, x, y, w, 48); ring(x, y, w, 48, 1, 'rgba(0,0,0,.35)');
      if (focusKey === 'sign') signLines[signLine] = inp.value.slice(0, 15);
      for (let i = 0; i < 4; i++) {
        const v = signLines[i] + (i === signLine && (performance.now() / 300 | 0) % 2 ? '_' : '');
        textC(v, GW / 2, y + 5 + i * 10, '#000000', false);
        if (inR(mx, my, { x, y: y + 4 + i * 12, w, h: 12 })) { }
      }
      fields.push({ key: 'sign', x, y: y + 4 + signLine * 10, w, h: 10, maxLen: 15, onEnter: () => { signLine = (signLine + 1) % 4; focusField('sign', signLines[signLine], 15); } });
      button(GW / 2 - 100, GH - 40, 200, 20, 'Done', () => closeGui());
      for (let i = 0; i < 4; i++) btns.push({ x, y: y + 4 + i * 10, w, h: 10, en: true, fn: () => { signLines[signLine] = inp.value.slice(0, 15); signLine = i; focusField('sign', signLines[i], 15); } });
    }
    let worldsMeta = [], worldsLoaded = false, selWorld = -1, wScroll = 0, mpMode = null, loadMsg = '', loadP = 0, discMsg = '', confirmDel = null, optBack = 'title', ctrlWait = null, ctrlScroll = 0;
    let sliders = [], activeSlider = null;
    const GMODES = ['survival', 'hardcore', 'creative', 'adventure'], GMN = { survival: 'Survival', hardcore: 'Hardcore', creative: 'Creative', adventure: 'Adventure', spectator: 'Spectator' };
    const DIFFN = ['Peaceful', 'Easy', 'Normal', 'Hard', 'Hardest'], WTYPES = ['default', 'flat', 'large', 'amplified'], WTN = { default: 'Default', flat: 'Superflat', large: 'Large Biomes', amplified: 'Amplified' };
    const RULES = [['keepInventory', 'Keep inventory after death', false], ['doDaylightCycle', 'Advance time of day', true], ['doWeatherCycle', 'Update weather', true], ['doMobSpawning', 'Spawn mobs', true], ['mobGriefing', 'Allow destructive mob actions', true], ['doFireTick', 'Spread and extinguish fire', true], ['naturalRegeneration', 'Regenerate health', true], ['doTileDrops', 'Drop blocks', true], ['doMobLoot', 'Drop mob loot', true], ['fallDamage', 'Fall damage', true], ['doImmediateRespawn', 'Respawn immediately', false], ['showCoordinates', 'Show coordinates', false]];
    const defRules = () => { const r = {}; for (const [k, , v] of RULES) r[k] = v; r.randomTickSpeed = 3; return r; };
    let CW = null;
    function newCW(base) {
      CW = { tab: 0, name: 'New World', mode: 'survival', diff: 2, cheats: false, type: 'default', seed: '', bonus: false, structures: true, rules: defRules() };
      if (base) Object.assign(CW, { name: base.name, mode: base.hardcore ? 'hardcore' : base.mode, diff: base.diff, cheats: base.cheats, type: base.type, seed: String(base.seed), rules: Object.assign(defRules(), base.rules || {}) });
      FIELDV.wname = CW.name; FIELDV.wseed = CW.seed;
    }
    const javaHash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(h, 31) + s.charCodeAt(i) | 0; return h; };
    const parseSeed = s => { s = String(s || '').trim(); if (!s) return (Math.random() * 4294967296 | 0); if (/^-?\d+$/.test(s) && Math.abs(+s) < 2147483648) return +s | 0; return javaHash(s); };
    function loadProfile() { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); return p && typeof p === 'object' ? p : {}; } catch (e) { return {}; } }
    function saveProfile(name) { try { const p = loadProfile(); p.username = name; if (!p.displayName) p.displayName = name; localStorage.setItem('gameplay:profile', JSON.stringify(p)); } catch (e) { } }
    const validName = n => /^[A-Za-z0-9_]{3,16}$/.test(n || '');
    function myName() { const p = loadProfile(); return validName(p.username) ? p.username : (p.username ? String(p.username).replace(/[^A-Za-z0-9_]/g, '').slice(0, 16) : '') || 'Player'; }
    function slider(x, y, w, label, f, set) {
      x |= 0; y |= 0; const h = touch ? 24 : 20;
      g.drawImage(BT[2], 0, 0, w >> 1, 20, x, y, w >> 1, h); g.drawImage(BT[2], 200 - (w - (w >> 1)), 0, w - (w >> 1), 20, x + (w >> 1), y, w - (w >> 1), h);
      const kx = x + Math.round(f * (w - 8)), hov = !touch && mx >= x && my >= y && mx < x + w && my < y + h, t = BT[hov || activeSlider && activeSlider.x === x && activeSlider.y === y ? 1 : 0];
      g.drawImage(t, 0, 0, 4, 20, kx, y, 4, h); g.drawImage(t, 196, 0, 4, 20, kx + 4, y, 4, h);
      textC(label, x + w / 2, y + (h - 8) / 2, '#ffffff');
      sliders.push({ x, y, w, h, set });
    }
    function drawTitleBg() {
      if (!panoReady) drawDirt(0);
      else { const gr = g.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(0, 0, GW, GH); }
    }
    function drawLogo(y) {
      const k = Math.min(1, (GW - 16) / LOGO.width), lw = LOGO.width * k, lh = LOGO.height * k, lx = (GW - lw) / 2 | 0;
      g.drawImage(LOGO, lx, y, lw, lh);
      const ew = EDITION.width * k, eh = EDITION.height * k;
      g.drawImage(EDITION, (GW - ew) / 2 | 0, y + lh - 4 * k | 0, ew, eh);
      return y + lh + eh - 4 * k;
    }
    function drawTitle(now) {
      drawTitleBg();
      const ly = GH < 250 ? Math.max(6, GH / 4 - 40 | 0) : 30, by = Math.max(drawLogo(ly) + 10, GH / 4 + 48 | 0), step = touch ? 28 : 24;
      g.save(); g.translate(GW / 2 + Math.min(112, GW / 2 - 30), ly + 36); g.rotate(-20 * Math.PI / 180);
      const sc = (1.8 - Math.abs(Math.sin((now % 1000) / 1000 * Math.PI * 2)) * .1) * 100 / (tw(SPLASH) + 32);
      g.scale(sc, sc); textC(SPLASH, 0, -8, '#ffff00'); g.restore();
      button(GW / 2 - 100, by, 200, 20, 'Singleplayer', () => { mpMode = null; goWorlds(); });
      button(GW / 2 - 100, by + step, 200, 20, 'Multiplayer', () => { scr = 'mp'; FIELDV.uname = FIELDV.uname || (validName(loadProfile().username) ? loadProfile().username : ''); });
      button(GW / 2 - 100, by + step * 2 + 12, 98, 20, 'Options...', () => { optBack = 'title'; scr = 'options'; });
      button(GW / 2 + 2, by + step * 2 + 12, 98, 20, 'Quit Game', () => { location.hash = '#/'; });
      text('Blockcraft 26.3', 2, GH - 10, '#ffffff');
    }
    function goWorlds() { scr = 'worlds'; selWorld = -1; wScroll = 0; worldsLoaded = false; listWorlds().then(l => { worldsMeta = l; worldsLoaded = true; if (l.length) selWorld = 0; }); }
    function drawWorlds() {
      drawDirt(0);
      textC(mpMode === 'host' ? 'Select World to Host' : 'Select World', GW / 2, 8, '#ffffff');
      const top = 24, bot = GH - (touch ? 64 : 56), rowH = 36, lw = Math.min(270, GW - 20), lx = (GW - lw) >> 1;
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, top, GW, bot - top);
      sep(top - 2, false); sep(bot, true);
      const maxS = Math.max(0, worldsMeta.length * rowH - (bot - top - 8));
      wScroll = clamp(wScroll, 0, maxS);
      g.save(); g.beginPath(); g.rect(0, top, GW, bot - top); g.clip();
      if (!worldsLoaded) textC('Loading...', GW / 2, top + 20, '#a0a0a0');
      else if (!worldsMeta.length) textC('No worlds yet. Create a new world to start playing!', GW / 2, top + 20, '#a0a0a0');
      worldsMeta.forEach((w, i) => {
        const y = top + 4 + i * rowH - wScroll;
        if (y + rowH < top || y > bot) return;
        if (i === selWorld) { g.fillStyle = '#808080'; g.fillRect(lx - 2, y - 2, lw + 4, rowH); g.fillStyle = '#000'; g.fillRect(lx - 1, y - 1, lw + 2, rowH - 2); }
        const ic = cv(1, 1); void ic;
        g.fillStyle = w.mode === 'creative' ? '#3a7a3a' : w.hardcore ? '#7a1a1a' : '#5d4a2a'; g.fillRect(lx + 1, y + 1, 30, 30);
        drawItem({ id: (IN[w.mode === 'creative' ? 'grass_block' : w.hardcore ? 'wither_skeleton_skull' : 'oak_log'] || IN.grass_block).idx, n: 1 }, lx + 8, y + 8, true);
        text(w.name, lx + 35, y + 2, '#ffffff');
        const d = new Date(w.last || w.created || 0), p2 = n => (n < 10 ? '0' : '') + n;
        text((w.folder || w.name) + ' (' + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ')', lx + 35, y + 12, '#808080');
        text((w.hardcore ? 'Hardcore Mode!' : GMN[w.mode] + ' Mode') + (w.cheats ? ', Cheats' : '') + ', Version: 26.3', lx + 35, y + 22, w.hardcore ? '#ff5555' : '#808080');
        btns.push({ x: lx - 2, y: Math.max(y - 2, top), w: lw + 4, h: Math.min(rowH, bot - Math.max(y - 2, top)), en: true, fn: () => { if (selWorld === i && performance.now() - (w._clk || 0) < 400) playSel(); selWorld = i; w._clk = performance.now(); } });
      });
      g.restore();
      const has = selWorld >= 0 && selWorld < worldsMeta.length, step = touch ? 28 : 24, y0 = GH - (touch ? 58 : 52);
      const bw = Math.min(150, (GW - 12) / 2 | 0);
      button(GW / 2 - bw - 2, y0, bw, 20, mpMode === 'host' ? 'Host Selected World' : 'Play Selected World', playSel, has);
      button(GW / 2 + 2, y0, bw, 20, 'Create New World', () => { newCW(); scr = 'create'; });
      const qw = Math.min(72, (GW - 16) / 4 | 0);
      button(GW / 2 - qw * 2 - 6, y0 + step, qw, 20, 'Edit', () => { FIELDV.ename = worldsMeta[selWorld].name; scr = 'edit'; }, has);
      button(GW / 2 - qw - 2, y0 + step, qw, 20, 'Delete', () => { confirmDel = worldsMeta[selWorld]; scr = 'delete'; }, has);
      button(GW / 2 + 2, y0 + step, qw, 20, 'Re-Create', () => { newCW(worldsMeta[selWorld]); scr = 'create'; }, has);
      button(GW / 2 + qw + 6, y0 + step, qw, 20, 'Back', () => { scr = mpMode ? 'mp' : 'title'; });
    }
    function playSel() { const w = worldsMeta[selWorld]; if (!w) return; grab(); openWorld(w.id, mpMode === 'host'); }
    function drawDelete() {
      drawDirt(0);
      textC('Are you sure you want to delete this world?', GW / 2, GH / 2 - 40, '#ffffff');
      textC("'" + (confirmDel ? confirmDel.name : '') + "' will be lost forever! (A long time!)", GW / 2, GH / 2 - 26, '#a0a0a0');
      const dw = Math.min(150, (GW - 12) / 2 | 0);
      button(GW / 2 - dw - 4, GH / 2 + 10, dw, 20, 'Delete', () => { const w = confirmDel; confirmDel = null; deleteWorld(w.id).then(goWorlds); });
      button(GW / 2 + 4, GH / 2 + 10, dw, 20, 'Cancel', () => { scr = 'worlds'; });
    }
    function drawEdit() {
      drawDirt(0);
      textC('Edit World', GW / 2, 20, '#ffffff');
      text('World Name', GW / 2 - 100, 50, '#a0a0a0');
      field('ename', GW / 2 - 100, 62, 200, 20, FIELDV.ename || '', '', null, 32);
      const w = worldsMeta[selWorld];
      if (w) text('Seed: ' + w.seed, GW / 2 - 100, 90, '#a0a0a0');
      button(GW / 2 - 100, GH - 52, 98, 20, 'Save', () => { const n = (FIELDV.ename || '').trim() || 'New World'; renameWorld(w.id, n).then(goWorlds); }, !!w);
      button(GW / 2 + 2, GH - 52, 98, 20, 'Cancel', () => { scr = 'worlds'; });
    }
    function cycleBtn(x, y, w, label, val, fn, en) { button(x, y, w, 20, label + ': ' + val, fn, en !== false); }
    function drawCreate() {
      drawDirt(0);
      const tabsN = ['Game', 'World', 'More'], tw2 = Math.min(70, (GW - 20) / 3 | 0);
      tabsN.forEach((n, i) => { const x = GW / 2 - tw2 * 1.5 + i * tw2 | 0; button(x, 4, tw2 - 2, 20, n, () => { CW.tab = i; blurField(); }, true); if (CW.tab === i) { g.fillStyle = '#ffffff'; g.fillRect(x + 4, 22, tw2 - 10, 1); } });
      const x0 = GW / 2 - 105 | 0, W2 = 210, step = touch ? 28 : 24;
      let y = 36;
      if (CW.tab === 0) {
        text('World Name', x0, y, '#a0a0a0'); field('wname', x0, y + 11, W2, 20, FIELDV.wname || '', '', null, 32); y += 40;
        cycleBtn(x0, y, W2, 'Game Mode', GMN[CW.mode], () => { const was = CW.mode; CW.mode = GMODES[(GMODES.indexOf(CW.mode) + 1) % GMODES.length]; if (CW.mode === 'hardcore') { CW.pdiff = CW.diff; CW.diff = 4; } else if (was === 'hardcore' && CW.pdiff != null) { CW.diff = CW.pdiff; CW.pdiff = null; } CW.cheats = CW.mode === 'creative'; });
        const desc = { survival: 'Search for resources, craft, gain levels, health and hunger', hardcore: 'Same as Survival Mode, locked at hardest difficulty, and one life only', creative: 'Unlimited resources, free flying and destroy blocks instantly', adventure: 'Play maps made by others: blocks cannot be broken or placed freely' }[CW.mode];
        wrapText(desc, W2).forEach((l, i) => text(l, x0, y + 22 + i * 9, '#a0a0a0')); y += 44;
        cycleBtn(x0, y, W2, 'Difficulty', DIFFN[CW.diff], () => { CW.diff = (CW.diff + 1) % 5; }, CW.mode !== 'hardcore'); y += step;
        cycleBtn(x0, y, W2, 'Allow Commands', CW.cheats ? 'ON' : 'OFF', () => { CW.cheats = !CW.cheats; }, CW.mode !== 'hardcore'); y += step;
      } else if (CW.tab === 1) {
        cycleBtn(x0, y, W2, 'World Type', WTN[CW.type], () => { CW.type = WTYPES[(WTYPES.indexOf(CW.type) + 1) % WTYPES.length]; }); y += step + 6;
        text('Seed for the World Generator', x0, y, '#a0a0a0'); field('wseed', x0, y + 11, W2, 20, FIELDV.wseed || '', 'Leave blank for a random seed', null, 32); y += 40;
        cycleBtn(x0, y, W2, 'Generate Structures', CW.structures ? 'ON' : 'OFF', () => { CW.structures = !CW.structures; }); y += step;
        cycleBtn(x0, y, W2, 'Bonus Chest', CW.bonus ? 'ON' : 'OFF', () => { CW.bonus = !CW.bonus; }); y += step;
      } else {
        text('Game Rules', x0, y, '#ffffff'); y += 12;
        const half = Math.ceil(RULES.length / 2), cw2 = GW >= 440 ? 210 : W2, two = GW >= 440;
        RULES.forEach(([k, l], i) => { const col = two && i >= half ? 1 : 0, r = two ? i % half : i, bx2 = two ? GW / 2 - 214 + col * 218 : x0, by2 = y + r * (touch ? 26 : 22); if (by2 > GH - 60) return; button(bx2, by2, cw2, 20, l + ': ' + (CW.rules[k] ? 'ON' : 'OFF'), () => { CW.rules[k] = !CW.rules[k]; }); });
      }
      const yb = GH - (touch ? 30 : 26);
      const cw3 = Math.min(150, (GW - 12) / 2 | 0);
      button(GW / 2 - cw3 - 4, yb, cw3, 20, ['Create New World', 'Create'], () => { CW.name = (FIELDV.wname || '').trim() || 'New World'; CW.seed = FIELDV.wseed || ''; grab(); createWorld(CW, mpMode === 'host'); });
      button(GW / 2 + 4, yb, cw3, 20, 'Cancel', () => { blurField(); goWorlds(); });
    }
    function drawMP() {
      drawDirt(0);
      textC('Play Multiplayer', GW / 2, 16, '#ffffff');
      const x0 = GW / 2 - 110 | 0, W2 = 220;
      const lines = wrapText('Play together with friends on the same Wi-Fi / LAN or online. One player hosts a world, the others join with the party code.', W2);
      lines.forEach((l, i) => textC(l, GW / 2, 32 + i * 10, '#a0a0a0'));
      let y = 40 + lines.length * 10;
      text('Username (required)', x0, y, '#ffffff');
      field('uname', x0, y + 11, W2, 20, FIELDV.uname || '', '3-16 letters, numbers or _', null, 16);
      const ok = validName(FIELDV.uname);
      if (!ok) text((FIELDV.uname || '').length ? 'Use 3-16 letters, numbers or _ only' : 'You must choose a username to play online', x0, y + 35, '#ff5555');
      else text('Other players will see you as ' + FIELDV.uname, x0, y + 35, '#55ff55');
      y += 52;
      const step = touch ? 28 : 24;
      button(x0, y, W2, 20, 'Host a World', () => { saveProfile(FIELDV.uname); blurField(); mpMode = 'host'; goWorlds(); }, ok);
      button(x0, y + step, W2, 20, 'Join a Friend', () => { saveProfile(FIELDV.uname); blurField(); joinParty(); }, ok);
      button(x0, y + step * 2 + 8, W2, 20, 'Back', () => { blurField(); scr = 'title'; });
    }
    function drawOptions(inGame) {
      if (inGame) { g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH); } else drawDirt(0);
      textC('Options', GW / 2, 12, '#ffffff');
      const two = GW >= 330, cw2 = two ? 150 : Math.min(200, GW - 20), x1 = two ? GW / 2 - 155 : GW / 2 - cw2 / 2, x2 = two ? GW / 2 + 5 : x1, step = touch ? 27 : 23;
      let y = 30, col = 0;
      const put = fn => { const x = col ? x2 : x1; fn(x, y); if (two) { col ^= 1; if (!col) y += step; } else y += step; };
      put((x, yy) => slider(x, yy, cw2, 'FOV: ' + (SET.fov === 70 ? 'Normal' : SET.fov === 110 ? 'Quake Pro' : SET.fov), (SET.fov - 30) / 80, f => { SET.fov = Math.round(30 + f * 80); fovDirty = true; }));
      put((x, yy) => slider(x, yy, cw2, 'Render Distance: ' + (SET.rd ? SET.rd + ' chunks' : 'Auto (' + RD + ')'), SET.rd ? (SET.rd - 1) / 11 : 0, f => { const v = Math.round(1 + f * 11); SET.rd = v < 2 ? 0 : v; if (SET.rd) RD = SET.rd; else if (v < 2) RD = clamp(SET.rda || RD, AR.min, AR.max); AR.lo = AR.hi = 0; }));
      put((x, yy) => slider(x, yy, cw2, 'Brightness: ' + (SET.gam === 0 ? 'Moody' : SET.gam === 1 ? 'Bright' : Math.round(SET.gam * 100) + '%'), SET.gam, f => { SET.gam = Math.round(f * 20) / 20; U.gam.value = SET.gam; }));
      put((x, yy) => slider(x, yy, cw2, 'Sensitivity: ' + Math.round(SET.sens * 100) + '%', (SET.sens - .1) / 2.9, f => { SET.sens = Math.round((.1 + f * 2.9) * 20) / 20; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Graphics: ' + (SET.fancy ? 'Fancy' : 'Fast'), () => { SET.fancy = !SET.fancy; FANCY = SET.fancy; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'GUI Scale: ' + (SET.gui ? SET.gui : 'Auto'), () => { SET.gui = (SET.gui + 1) % 5; resize(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Clouds: ' + (SET.clouds ? 'Fancy' : 'OFF'), () => { SET.clouds = !SET.clouds; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Particles: ' + ['Minimal', 'Decreased', 'All'][SET.particles], () => { SET.particles = (SET.particles + 1) % 3; }));
      put((x, yy) => button(x, yy, cw2, 20, 'View Bobbing: ' + (SET.bob ? 'ON' : 'OFF'), () => { SET.bob = !SET.bob; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Smooth Lighting: ' + (SET.smooth ? 'ON' : 'OFF'), () => { SET.smooth = !SET.smooth; SMOOTH = SET.smooth; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Music: ' + (SET.music ? 'ON' : 'OFF'), () => { SET.music = !SET.music; if (!SET.music) stopMusic(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Sounds: ' + (SET.sound ? 'ON' : 'OFF'), () => { SET.sound = !SET.sound; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Controls...', () => { if (inGame) gui = 'controls'; else scr = 'controls'; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Difficulty: ' + (W && inGame ? DIFFN[W.diff] : '-'), () => { if (W && !W.hardcore && NET.role !== 'guest') { W.diff = (W.diff + 1) % 5; if (W.diff === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); } }, !!(inGame && W && !W.hardcore && NET.role !== 'guest')));
      if (col) y += step;
      button(GW / 2 - 100, Math.min(GH - 26, y + 6), 200, 20, 'Done', () => { persistSet(); if (inGame) gui = 'pause'; else scr = optBack; });
    }
    const KBN = { fwd: 'Walk Forwards', left: 'Strafe Left', back: 'Walk Backwards', right: 'Strafe Right', jump: 'Jump', sneak: 'Sneak', sprint: 'Sprint', inv: 'Open/Close Inventory', drop: 'Drop Selected Item', swap: 'Swap Item With Offhand', chat: 'Open Chat', cmd: 'Open Command', list: 'List Players', pick: 'Pick Block', persp: 'Toggle Perspective', f3: 'Debug Screen', hide: 'Hide HUD' };
    const keyName = c => !c ? 'NONE' : c.startsWith('Key') ? c.slice(3) : c.startsWith('Digit') ? c.slice(5) : c === 'ShiftLeft' ? 'Left Shift' : c === 'ControlLeft' ? 'Left Control' : c === 'AltLeft' ? 'Left Alt' : c === 'Space' ? 'Space' : c === 'Mouse2' ? 'Middle Button' : c;
    function drawControls(inGame) {
      if (inGame) { g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH); } else drawDirt(0);
      textC('Key Binds', GW / 2, 10, '#ffffff');
      const ks = Object.keys(KBN), top = 26, bot = GH - 32, rowH = touch ? 24 : 21;
      ctrlScroll = clamp(ctrlScroll, 0, Math.max(0, ks.length * rowH - (bot - top)));
      g.save(); g.beginPath(); g.rect(0, top, GW, bot - top); g.clip();
      ks.forEach((k, i) => {
        const y = top + i * rowH - ctrlScroll;
        if (y < top - rowH || y > bot) return;
        text(KBN[k], GW / 2 - 150, y + 6, '#ffffff');
        const dup = ks.some(o => o !== k && KB[o] === KB[k]);
        button(GW / 2 + 10, y, 90, 20, ctrlWait === k ? '> ' + keyName(KB[k]) + ' <' : keyName(KB[k]), () => { ctrlWait = k; });
        if (dup && ctrlWait !== k) text('!', GW / 2 + 4, y + 6, '#ff5555');
        button(GW / 2 + 104, y, 50, 20, 'Reset', () => { KB[k] = KBD[k]; saveKB(); }, KB[k] !== KBD[k]);
      });
      g.restore();
      button(GW / 2 - 100, GH - 26, 200, 20, 'Done', () => { ctrlWait = null; if (inGame) gui = 'options'; else scr = 'options'; });
    }
    function drawLoading() {
      drawDirt(0);
      textC(loadMsg || 'Loading terrain...', GW / 2, GH / 2 - 20, '#ffffff');
      const w = 100, x = (GW - w) / 2, y = GH / 2;
      g.fillStyle = '#808080'; g.fillRect(x, y, w, 2); g.fillStyle = '#80ff80'; g.fillRect(x, y, w * clamp(loadP, 0, 1), 2);
      if (scr === 'waiting') button(GW / 2 - 100, GH - 40, 200, 20, 'Cancel', () => { leaveMP('Cancelled'); });
    }
    function drawDisc() {
      drawDirt(0);
      textC('Connection Lost', GW / 2, GH / 2 - 40, '#a0a0a0');
      wrapText(discMsg || 'Disconnected', GW - 40).forEach((l, i) => textC(l, GW / 2, GH / 2 - 20 + i * 10, '#ffffff'));
      button(GW / 2 - 100, GH / 2 + 20, 200, 20, 'Back to Title Screen', () => { scr = 'title'; });
    }
    function drawPause() {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, GW, GH);
      const step = touch ? 28 : 24, host = NET.role === 'host', guest = NET.role === 'guest', n = NET.role ? 6 : 5, y = Math.max(22, Math.min(GH / 4 + 8 | 0, GH - n * step - 4));
      textC('Game Menu', GW / 2, Math.max(8, Math.min(40, y - 26)), '#ffffff');
      let r = y;
      button(GW / 2 - 102, r, 204, 20, 'Back to Game', () => closeGui()); r += step;
      button(GW / 2 - 102, r, 98, 20, 'Advancements', () => { gui = 'adv'; });
      button(GW / 2 + 4, r, 98, 20, 'Statistics', () => { gui = 'stats'; statScroll = 0; }); r += step;
      button(GW / 2 - 102, r, 98, 20, 'How to Play', () => { openHelp('pause'); });
      button(GW / 2 + 4, r, 98, 20, 'Goals: ' + (SV.goalsOff ? 'OFF' : 'ON'), () => { SV.goalsOff = !SV.goalsOff; api.save(SV); }); r += step;
      if (NET.role) { button(GW / 2 - 102, r, 204, 20, 'Player List (' + playersList().length + ')', () => { gui = 'plist'; }); r += step; }
      button(GW / 2 - 102, r, 98, 20, 'Options...', () => { gui = 'options'; });
      button(GW / 2 + 4, r, 98, 20, host ? ['Invite Players', 'Invite'] : 'Open to LAN', () => { openToLan(); }, !guest); r += step;
      button(GW / 2 - 102, r, 204, 20, guest ? 'Disconnect' : 'Save and Quit to Title', () => { quitToTitle(); });
      if (NET.role) text('Party code: ' + (api.net.code || '-'), 4, GH - 12, '#a0a0a0');
    }
    function drawPList() {
      g.fillStyle = 'rgba(16,16,16,.75)'; g.fillRect(0, 0, GW, GH);
      textC('Players', GW / 2, 16, '#ffffff');
      const L = [{ name: P.name + ' (you)', host: NET.role === 'host' }].concat(ENTS.filter(e => e.kind === 'player').map(e => ({ name: e.name, host: e.isHost, pid: e.pid })));
      L.forEach((p, i) => { text(p.name + (p.host ? ' [Host]' : ''), GW / 2 - 100, 40 + i * 22, '#ffffff'); if (NET.role === 'host' && p.pid) button(GW / 2 + 50, 34 + i * 22, 50, 20, 'Kick', () => { api.net.kick(p.pid); }); });
      button(GW / 2 - 100, GH - 30, 200, 20, 'Done', () => { gui = 'pause'; });
    }
    function drawDead() {
      shadeAll('rgba(80,0,0,.376)', 'rgba(128,48,48,.627)');
      const ty = Math.max(8, Math.min(60, GH / 4 - 10 | 0)), sc = String(P.scoreAtDeath || 0);
      textC(W.hardcore ? 'Game Over!' : 'You Died!', GW / 2, ty, '#ffffff', true, 2);
      if (P.deathMsg) textC(P.deathMsg, GW / 2, ty + 25, '#ffffff');
      text('Score: ', GW / 2 - tw('Score: ' + sc) / 2, ty + 40, '#ffffff'); text(sc, GW / 2 - tw('Score: ' + sc) / 2 + tw('Score: '), ty + 40, '#ffff55');
      const life = 'Survived ' + fmtTime(P.lifeAtDeath || 0) + (goalsOn() ? '   Goals ' + Math.min(P.goal || 0, GOALS.length) + '/' + GOALS.length : '') + '   Mined ' + ((P.st && P.st.mined) || 0);
      textC(life, GW / 2, ty + 52, '#d8b0b0');
      const en = deadT > 20, y = Math.max(ty + 68, Math.min(GH / 4 + 72 | 0, GH - 50));
      if (W.hardcore) button(GW / 2 - 100, y, 200, 20, 'Spectate World', () => { respawn(); }, en);
      else button(GW / 2 - 100, y, 200, 20, 'Respawn', () => { respawn(); }, en);
      if (en && !W.hardcore && !touch) textC('Space to respawn', GW / 2, y + 50, '#b08080', false);
      button(GW / 2 - 100, y + 24, 200, 20, NET.role === 'guest' ? 'Disconnect' : 'Title Screen', () => { quitToTitle(); }, en);
    }
    function drawScreen(now) {
      btns = []; fields = []; sliders = [];
      if (scr === 'title') drawTitle(now);
      else if (scr === 'worlds') drawWorlds();
      else if (scr === 'create') drawCreate();
      else if (scr === 'edit') drawEdit();
      else if (scr === 'delete') drawDelete();
      else if (scr === 'mp') drawMP();
      else if (scr === 'options') drawOptions(false);
      else if (scr === 'controls') drawControls(false);
      else if (scr === 'loading' || scr === 'waiting') drawLoading();
      else if (scr === 'disc') drawDisc();
    }
    function drawGameGui(now) {
      if (!gui) return;
      if (gui === 'pause') drawPause();
      else if (gui === 'options') drawOptions(true);
      else if (gui === 'controls') drawControls(true);
      else if (gui === 'plist') drawPList();
      else if (gui === 'stats') drawStats();
      else if (gui === 'adv') drawAdv();
      else if (gui === 'help') drawHelp();
      else if (gui === 'dead') drawDead();
      else if (gui === 'sign') drawSign();
      else if (INVG.has(gui)) drawInv(now);
    }
    const ADV = [
      ['root', 'Blockcraft', 'The heart and story of the game', 'grass_block', 0, 1, null, () => has('crafting_table')],
      ['stone', 'Stone Age', 'Mine Stone with your new Pickaxe', 'wooden_pickaxe', 1, 1, 'root', () => has('cobblestone') || has('cobbled_deepslate')],
      ['upgrade', 'Getting an Upgrade', 'Construct a better Pickaxe', 'stone_pickaxe', 2, 1, 'stone', () => has('stone_pickaxe')],
      ['iron', 'Acquire Hardware', 'Smelt an Iron Ingot', 'iron_ingot', 3, 1, 'upgrade', () => has('iron_ingot')],
      ['suit', 'Suit Up', 'Protect yourself with a piece of iron armor', 'iron_chestplate', 4, 0, 'iron', () => armor.some(s => s && /^iron_/.test(IT[s.id].id))],
      ['lava', 'Hot Stuff', 'Fill a Bucket with lava', 'lava_bucket', 4, 1, 'iron', () => has('lava_bucket')],
      ['ironpick', 'Isn\'t It Iron Pick', 'Upgrade your Pickaxe', 'iron_pickaxe', 4, 2, 'iron', () => has('iron_pickaxe')],
      ['obsidian', 'Ice Bucket Challenge', 'Obtain a block of Obsidian', 'obsidian', 5, 1, 'lava', () => has('obsidian')],
      ['diamond', 'Diamonds!', 'Acquire diamonds', 'diamond', 5, 2, 'ironpick', () => has('diamond')],
      ['diaarmor', 'Cover Me with Diamonds', 'Diamond armor saves lives', 'diamond_chestplate', 6, 2, 'diamond', () => armor.some(s => s && /^diamond_/.test(IT[s.id].id))]
    ].filter(a => IN[a[3]]);
    const has = n => { const t = IN[n]; if (!t) return false; const k = t.idx; return inv.some(s => s && s.id === k) || armor.some(s => s && s.id === k) || offhand && offhand.id === k || cursor && cursor.id === k; };
    const stat = (k, n) => { if (!P.st) P.st = {}; P.st[k] = (P.st[k] || 0) + (n == null ? 1 : n); };
    let toasts = [], statTab = 0, statScroll = 0, advHov = null;
    function advTick() {
      if (tickN % 20 || P.dead || mode() === 'spectator' || !W || W.pano) return;
      if (!P.adv) P.adv = {};
      for (const a of ADV) if (!P.adv[a[0]] && a[7]()) {
        P.adv[a[0]] = 1; toasts.push({ a, t: performance.now() });
        const m = P.name + ' has made the advancement [' + a[1] + ']';
        chatSys(m); netSend({ t: 'chat', s: 1, m });
      }
    }
    function drawToasts(now) {
      if (!toasts.length) return;
      let y = 0;
      toasts = toasts.filter(o => now - o.t < 5600);
      for (const o of toasts.slice(0, 5)) {
        const age = now - o.t, k = age < 600 ? 1 - age / 600 : age > 5000 ? (age - 5000) / 600 : 0, x = GW - 160 + Math.round(160 * k * k);
        g.fillStyle = '#000'; g.fillRect(x + 1, y, 158, 32); g.fillRect(x, y + 1, 160, 30);
        g.fillStyle = '#555555'; g.fillRect(x + 1, y + 1, 158, 30);
        g.fillStyle = '#212121'; g.fillRect(x + 3, y + 3, 154, 26);
        drawItem({ id: IN[o.a[3]].idx, n: 1 }, x + 8, y + 8, true);
        text(o.h || 'Advancement Made!', x + 30, y + 7, o.h ? '#7dff6e' : '#ffff00', false);
        text(o.a[1], x + 30, y + 18, '#ffffff', false);
        y += 32;
      }
    }
    const fmtDist = cm => cm >= 100000 ? (cm / 100000).toFixed(2) + ' km' : cm >= 100 ? (cm / 100).toFixed(2) + ' m' : (cm | 0) + ' cm';
    const fmtTime = t => { const s = t / 20; return s >= 86400 ? (s / 86400).toFixed(2) + ' d' : s >= 3600 ? (s / 3600).toFixed(2) + ' h' : s >= 60 ? (s / 60).toFixed(2) + ' m' : s.toFixed(2) + ' s'; };
    function drawStats() {
      const S2 = P.st || {}, top = 32, bot = GH - 56, rowH = 10, lw = Math.min(280, GW - 20), lx = (GW - lw) >> 1;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, GW, GH);
      textC('Statistics', GW / 2, 12, '#ffffff');
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, top, GW, bot - top); sep(top - 2, false); sep(bot, true);
      let L;
      if (statTab === 0) L = [['Damage Dealt', ((S2.dmgD || 0) / 1).toFixed(2)], ['Damage Taken', ((S2.dmgT || 0) / 1).toFixed(2)], ['Distance by Elytra', fmtDist(0)], ['Distance Fallen', fmtDist(S2.fallCm || 0)], ['Distance Flown', fmtDist(S2.flyCm || 0)], ['Distance Sprinted', fmtDist(S2.sprintCm || 0)], ['Distance Swum', fmtDist(S2.swimCm || 0)], ['Distance Walked', fmtDist(S2.walkCm || 0)], ['Items Dropped', S2.drop || 0], ['Jumps', S2.jump || 0], ['Blocks Mined', S2.mined || 0], ['Mob Kills', S2.kills || 0], ['Number of Deaths', S2.deaths || 0], ['Time Since Last Death', fmtTime(S2.sinceDeath || 0)], ['Time Played', fmtTime(S2.play || 0)]];
      else { L = Object.keys(S2).filter(k => k.slice(0, 2) === 'k_').sort().map(k => ['You killed ' + S2[k] + ' ' + title(k.slice(2)) + (S2[k] === 1 ? '' : 's'), '']); if (!L.length) L = [['Nothing to show here', '']]; }
      const maxS = Math.max(0, L.length * rowH - (bot - top - 8)); statScroll = clamp(statScroll, 0, maxS);
      g.save(); g.beginPath(); g.rect(0, top, GW, bot - top); g.clip();
      L.forEach(([k, v], i) => { const y = top + 4 + i * rowH - statScroll, c = i % 2 ? '#a0a0a0' : '#ffffff'; text(k, lx, y, c); if (v !== '') textR(String(v), lx + lw, y, c); });
      g.restore();
      if (maxS > 0) { const sh = Math.max(16, (bot - top) * (bot - top) / (L.length * rowH + 8)), sy = top + (bot - top - sh) * statScroll / maxS; g.fillStyle = '#000'; g.fillRect(lx + lw + 6, top, 6, bot - top); g.fillStyle = '#808080'; g.fillRect(lx + lw + 6, sy, 6, sh); g.fillStyle = '#c0c0c0'; g.fillRect(lx + lw + 6, sy, 5, sh - 1); }
      const bw = Math.min(120, (GW - 24) / 2 | 0);
      button(GW / 2 - bw - 2, GH - 50, bw, 20, 'General', () => { statTab = 0; statScroll = 0; }, statTab !== 0);
      button(GW / 2 + 2, GH - 50, bw, 20, 'Mobs', () => { statTab = 1; statScroll = 0; }, statTab !== 1);
      button(GW / 2 - 100, GH - 26, 200, 20, 'Done', () => { gui = 'pause'; });
    }
    let ADVBG = null;
    function advFrame(x, y, got) {
      g.fillStyle = '#000'; g.fillRect(x + 1, y, 24, 26); g.fillRect(x, y + 1, 26, 24);
      g.fillStyle = got ? '#dba213' : '#ffffff'; g.fillRect(x + 1, y + 1, 24, 24);
      g.fillStyle = got ? '#aa7e0f' : '#c6c6c6'; g.fillRect(x + 2, y + 2, 23, 23);
      g.fillStyle = got ? '#6e520a' : '#8b8b8b'; g.fillRect(x + 2, y + 24, 23, 1); g.fillRect(x + 24, y + 2, 1, 23);
    }
    function drawAdv() {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, GW, GH);
      const ww = Math.min(252, GW - 8), wh = Math.min(140, GH - 54), wx = (GW - ww) >> 1, wy = Math.max(30, (GH - wh) / 2 + 10 | 0), got = P.adv || {};
      textC('Advancements', GW / 2, wy - 30, '#ffffff');
      const tx = wx + 4, ty = wy - 26;
      g.fillStyle = '#000'; g.fillRect(tx + 1, ty, 26, 30); g.fillRect(tx, ty + 1, 28, 29); g.fillStyle = '#fff'; g.fillRect(tx + 1, ty + 1, 25, 29); g.fillStyle = '#c6c6c6'; g.fillRect(tx + 3, ty + 3, 23, 29);
      panel(wx, wy, ww, wh);
      g.fillStyle = '#c6c6c6'; g.fillRect(tx + 3, wy, 23, 4);
      drawItem({ id: IN.grass_block.idx, n: 1 }, tx + 6, ty + 7, true);
      text('Blockcraft', wx + 8, wy + 6, '#404040', false);
      const ix = wx + 9, iy = wy + 18, iw = ww - 18, ih = wh - 27;
      if (!ADVBG) { const st = get('stone'), c = cv(16, 16), q = c.getContext('2d'), im = q.createImageData(16, 16); for (let i = 0; i < 1024; i += 4) { im.data[i] = st[i] * .55; im.data[i + 1] = st[i + 1] * .55; im.data[i + 2] = st[i + 2] * .55; im.data[i + 3] = 255; } q.putImageData(im, 0, 0); ADVBG = g.createPattern(c, 'repeat'); }
      g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
      g.fillStyle = ADVBG; g.fillRect(ix, iy, iw, ih);
      const pos = a => [ix + 6 + a[4] * 32, iy + 6 + a[5] * 30];
      for (const a of ADV) if (a[6]) { const b = ADV.find(q => q[0] === a[6]); if (!b) continue; const [x1, y1] = pos(b), [x2, y2] = pos(a), mx2 = x2 - 3; for (const [c, w2] of [['#000', 3], ['#fff', 1]]) { g.fillStyle = c; const o = (w2 - 1) / 2; g.fillRect(x1 + 26, y1 + 13 - o, mx2 - x1 - 26 + o + 1, w2); g.fillRect(mx2 - o, Math.min(y1, y2) + 13 - o, w2, Math.abs(y2 - y1) + w2); g.fillRect(mx2 - o, y2 + 13 - o, x2 - mx2 + o, w2); } }
      advHov = null;
      for (const a of ADV) { const [x, y] = pos(a); advFrame(x, y, got[a[0]]); drawItem({ id: IN[a[3]].idx, n: 1 }, x + 5, y + 5, true); if (mx >= x && my >= y && mx < x + 26 && my < y + 26 && mx >= ix && my >= iy && mx < ix + iw && my < iy + ih) advHov = [a, x, y]; }
      g.restore();
      if (advHov) {
        const [a, x, y] = advHov, gt = got[a[0]], w = Math.max(tw(a[1]) + 40, tw(a[2]) + 12), bx = Math.min(x, GW - w - 2);
        g.fillStyle = '#000'; g.fillRect(bx, y + 1, w, 24); g.fillStyle = gt ? '#dba213' : '#0489c1'; g.fillRect(bx + 1, y + 2, w - 2, 22); g.fillStyle = gt ? '#aa7e0f' : '#036a96'; g.fillRect(bx + 2, y + 3, w - 4, 20);
        g.fillStyle = '#000'; g.fillRect(bx, y + 24, w, 16); g.fillStyle = '#212121'; g.fillRect(bx + 1, y + 24, w - 2, 15);
        text(a[1], bx + 32, y + 9, '#ffffff'); text(a[2], bx + 6, y + 28, '#55ff55');
        advFrame(x, y, gt); drawItem({ id: IN[a[3]].idx, n: 1 }, x + 5, y + 5, true);
      }
      button(GW / 2 - 100, Math.min(GH - 22, wy + wh + 6), 200, 20, 'Done', () => { gui = 'pause'; });
    }
    const signG = new THREE.Group(); scene.add(signG);
    let signSig = '', signW = null;
    function updSigns() {
      if (!W || W.pano) { if (signG.children.length) clearSigns(); return; }
      let sig = '';
      const L = [];
      for (const [k, b] of W.be) if (b && Array.isArray(b.text) && b.text.some(Boolean)) { const p = k.split(',').map(Number); if (Math.abs(p[0] - P.x) > 64 || Math.abs(p[2] - P.z) > 64) continue; const s = getS(p[0], p[1], p[2]), t = TT[STT[s]]; if (!t.sign) continue; sig += k + s + b.text.join('\u0001') + ';'; L.push([p, s, t, b.text]); }
      if (sig === signSig && signW === W) return;
      signSig = sig; signW = W; clearSigns();
      for (const [[x, y, z], s, t, txt] of L) {
        const K = 4, c = cv(96 * K, 48 * K), q = c.getContext('2d'); q.imageSmoothingEnabled = false;
        const f = fontTint('#000000');
        txt.slice(0, 4).forEach((ln, i) => { ln = String(ln || ''); let px = (96 - tw(ln)) / 2 | 0; for (const ch of ln) { const j = ch.charCodeAt(0) - 32; if (j < 0 || j >= 95) { px += 4; continue; } q.drawImage(f, (j & 15) * 8, (j >> 4) * 9, 8, 8, px * K, (4 + i * 10) * K, 8 * K, 8 * K); px += fontW[j] + 1; } });
        const tx = new THREE.CanvasTexture(c); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;
        const hang = /hanging/.test(t.id), wall = /wall/.test(t.id) && !hang, pw = hang ? .875 : 1, ph = pw / 2;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tx, transparent: true, alphaTest: .3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }));
        let nx, nz; if (hang || wall) { const f = F4D[sv(s, 'facing')]; nx = f[0]; nz = f[1]; } else { const a = -(Math.round(sv(s, 'rotation') / 4) & 3) * Math.PI / 2; nx = Math.sin(a); nz = Math.cos(a); }
        const B = t.model ? t.model(s)[0] : null, A = B && B.a ? B.a : [0, 7, 7], Z = B && B.b ? B.b : [16, 15, 9], ry = Math.atan2(nx, nz), e = .02 / 16;
        m.position.set(x + (nx > .5 ? Z[0] / 16 + e : nx < -.5 ? A[0] / 16 - e : (A[0] + Z[0]) / 32), y + (A[1] + Z[1]) / 32, z + (nz > .5 ? Z[2] / 16 + e : nz < -.5 ? A[2] / 16 - e : (A[2] + Z[2]) / 32));
        m.rotation.y = ry; m.renderOrder = 3; signG.add(m);
      }
    }
    function clearSigns() { for (const m of signG.children.slice()) { signG.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); } }
    const invCount = re => { let n = 0; const f = s => { if (s && re.test(IT[s.id].id)) n += s.n; }; inv.forEach(f); armor.forEach(f); f(offhand); f(cursor); return n; };
    const hasRe = re => invCount(re) > 0;
    const nearRe = re => {
      const bx = Math.floor(P.x), by = Math.floor(P.y), bz = Math.floor(P.z);
      for (let y = by - 3; y <= by + 4; y++) for (let x = bx - 5; x <= bx + 5; x++) for (let z = bz - 5; z <= bz + 5; z++) { const t = TT[STT[getS(x, y, z)]]; if (t && re.test(t.id)) return true; }
      return false;
    };
    const RE = { log: /_(log|stem)$/, plank: /_planks$/, table: /^crafting_table$/, wpick: /^(wooden|stone|iron|golden|diamond|netherite)_pickaxe$/, spick: /^(stone|iron|diamond|netherite)_pickaxe$/, cobble: /^(cobblestone|cobbled_deepslate|blackstone)$/, furnace: /^furnace$/, torch: /^(wall_)?torch$/, bed: /_bed$/, iron: /^iron_(ingot|pickaxe|sword|axe|shovel|helmet|chestplate|leggings|boots)$/ };
    const GOALS = [
      ['wood', 'Get Wood', 'Collect 4 logs from a tree.', 'oak_log', 4, () => Math.min(4, invCount(RE.log) + (invCount(RE.plank) >> 2) + (hasRe(RE.table) || hasRe(RE.wpick) ? 4 : 0)), 'Hold Left Click on a tree trunk.', 'Hold your finger on a tree trunk.'],
      ['planks', 'Make Planks', 'Turn logs into planks.', 'oak_planks', 4, () => hasRe(RE.table) || hasRe(RE.wpick) ? 4 : Math.min(4, invCount(RE.plank)), 'Press E and put a log in the 2x2 grid.', 'Tap ... and put a log in the 2x2 grid.'],
      ['table', 'Crafting Table', 'Fill the 2x2 grid with planks.', 'crafting_table', 1, () => hasRe(RE.table) || hasRe(RE.wpick) || nearRe(RE.table) ? 1 : 0, 'Take the table, then place it.', 'Take the table, then place it.'],
      ['pick', 'Wooden Pickaxe', 'Make sticks, then a pickaxe at the table.', 'wooden_pickaxe', 1, () => hasRe(RE.wpick) ? 1 : 0, 'Right Click the table: 3 planks on top, 2 sticks down the middle.', 'Tap the table: 3 planks on top, 2 sticks down the middle.'],
      ['stone', 'Stone Age', 'Dig down and mine 3 cobblestone.', 'cobblestone', 3, () => hasRe(RE.spick) || hasRe(RE.furnace) ? 3 : Math.min(3, invCount(RE.cobble)), 'Grey stone needs the pickaxe in your hand.', 'Grey stone needs the pickaxe in your hand.'],
      ['spick', 'Better Tools', 'Craft a stone pickaxe.', 'stone_pickaxe', 1, () => hasRe(RE.spick) ? 1 : 0, 'Same shape as before, with cobblestone.', 'Same shape as before, with cobblestone.'],
      ['furnace', 'Furnace', 'Craft a furnace from 8 cobblestone.', 'furnace', 1, () => hasRe(RE.furnace) || nearRe(RE.furnace) ? 1 : 0, 'Put cobblestone in every slot but the middle.', 'Put cobblestone in every slot but the middle.'],
      ['torch', 'Light the Night', 'Craft torches: coal on top of a stick.', 'torch', 1, () => hasRe(RE.torch) || nearRe(RE.torch) ? 1 : 0, 'No coal? Burn a log in the furnace for charcoal.', 'No coal? Burn a log in the furnace for charcoal.'],
      ['food', 'Something to Eat', 'Find or cook some food.', 'bread', 1, () => inv.some(s => s && IT[s.id].food) || offhand && IT[offhand.id].food ? 1 : 0, 'Animals drop meat. Cook it in the furnace.', 'Animals drop meat. Cook it in the furnace.'],
      ['bed', 'Sleep Tight', 'Craft a bed: 3 wool over 3 planks.', 'white_bed', 1, () => hasRe(RE.bed) || nearRe(RE.bed) ? 1 : 0, 'Sheep give wool. Sleep to skip the night.', 'Sheep give wool. Sleep to skip the night.'],
      ['iron', 'Iron Age', 'Smelt raw iron into an ingot.', 'iron_ingot', 1, () => hasRe(RE.iron) ? 1 : 0, 'Iron ore has tan spots. Mine it with stone.', 'Iron ore has tan spots. Mine it with stone.']
    ];
    const GS = { w: null, prog: 0, shown: 0, doneT: 0, t0: 0, bar: 0, fin: 0 };
    const goalIcon = n => IN[n] ? IN[n].idx : IN.grass_block.idx;
    const goalsOn = () => !SV.goalsOff && W && !W.pano && mode() === 'survival';
    function goalTick() {
      if (tickN % 10 || !W || W.pano || scr !== 'game' || P.dead) return;
      if (!SV.helpSeen && !gui && tickN > 30 && !NET.role) { SV.helpSeen = 1; api.save(SV); helpBack = null; gui = 'help'; releaseMouse(); return; }
      if (!goalsOn()) return;
      if (P.goal == null) P.goal = 0;
      if (GS.w !== W) { GS.w = W; GS.doneT = 0; GS.t0 = performance.now(); GS.fin = 0; while (P.goal < GOALS.length && GOALS[P.goal][5]() >= GOALS[P.goal][4]) P.goal++; GS.bar = 0; }
      if (GS.doneT || P.goal >= GOALS.length) return;
      const q = GOALS[P.goal]; GS.prog = q[5]();
      if (GS.prog >= q[4]) {
        GS.doneT = performance.now(); snd('goal');
        toasts.push({ a: [q[0], q[1], '', q[3]], t: GS.doneT, h: 'Goal Complete!' });
        stat('goals');
      }
    }
    function drawGoals(now) {
      if (!goalsOn() || P.goal == null || showF3) return;
      if (GS.doneT && now - GS.doneT > 1300) {
        GS.doneT = 0; P.goal++; GS.t0 = now; GS.bar = 0; GS.prog = 0;
        if (P.goal >= GOALS.length && !GS.fin) { GS.fin = now; snd('levelup'); toasts.push({ a: ['all', 'All goals done!', '', 'diamond'], t: now, h: 'Journey Complete!' }); chatSys('You finished every starter goal. The world is yours.'); }
      }
      if (P.goal >= GOALS.length) return;
      const q = GOALS[P.goal], done = !!GS.doneT, w = touch ? clamp(GW - 140, 96, 150) : Math.min(152, GW / 2 - 8 | 0), pad = 4, tx = 24;
      const desc = wrapText(q[2], w - pad * 2), hint = wrapText(touch ? q[7] : q[6], w - pad * 2);
      const h = 25 + desc.length * 9 + (q[4] > 1 ? 8 : 0) + 3 + hint.length * 9 + 2;
      const kin = clamp((now - GS.t0) / 380, 0, 1), kout = done ? clamp((now - GS.doneT - 900) / 380, 0, 1) : 0, ein = 1 - Math.pow(1 - kin, 3);
      const x = Math.round(2 - (w + 6) * (1 - ein) - (w + 6) * kout * kout), y = W.rules.showCoordinates ? 12 : 2;
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
      g.fillStyle = done ? '#55c14a' : '#e8b731'; g.fillRect(x, y + 1, 2, h - 2);
      if (done) { const f = 1 - clamp((now - GS.doneT) / 500, 0, 1); g.fillStyle = 'rgba(120,255,120,' + (.35 * f) + ')'; g.fillRect(x, y, w, h); }
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 4, y + 4, 18, 18);
      g.drawImage(ICON, (goalIcon(q[3]) % ICN) * ICS, (goalIcon(q[3]) / ICN | 0) * ICS, ICS, ICS, x + 5, y + 5, 16, 16);
      text(done ? 'DONE!' : 'GOAL ' + (P.goal + 1) + '/' + GOALS.length, x + tx + 1, y + 3, done ? '#7dff6e' : '#ffcf40', false);
      text(q[1], x + tx + 1, y + 13, '#ffffff');
      let yy = y + 25;
      desc.forEach(l => { text(l, x + pad, yy, '#d8d8d8', false); yy += 9; });
      if (q[4] > 1) {
        const p = done ? q[4] : GS.prog; GS.bar += (p / q[4] - GS.bar) * .18;
        const bw = w - pad * 2 - 24, fw = Math.round(bw * clamp(GS.bar, 0, 1)); g.fillStyle = '#202020'; g.fillRect(x + pad, yy + 1, bw, 4); g.fillStyle = done ? '#6be05e' : '#e8b731'; g.fillRect(x + pad, yy + 1, fw, 4); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + pad, yy + 1, fw, 1);
        textR(p + '/' + q[4], x + w - pad, yy - 1, '#ffffff', false); yy += 8;
      }
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + pad, yy + 1, w - pad * 2, 1); yy += 3;
      hint.forEach(l => { text(l, x + pad, yy + 1, '#8fd3ff', false); yy += 9; });
    }
    let helpBack = null;
    function openHelp(from) { helpBack = from || null; gui = 'help'; releaseMouse(); }
    function drawHelp() {
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, GW, GH);
      const T = touch, steps = [
        ['Move and Look', T ? 'Left stick to walk, drag the screen to look. JUMP and SNEAK on the right.' : 'WASD to walk, the mouse to look, Space to jump, Ctrl to sprint.', 'leather_boots'],
        ['Mine and Build', T ? 'Hold a finger on a block to mine it. Tap to place the block in your hand.' : 'Hold Left Click to mine. Right Click to place or use. 1-9 picks a slot.', 'wooden_pickaxe'],
        ['Craft', T ? 'Tap ... for your inventory. Logs make planks, planks make a table and tools.' : 'E opens your inventory. Logs make planks, planks make a table and tools.', 'crafting_table'],
        ['Survive the Night', 'Monsters come out in the dark. Build a shelter, light torches, sleep in a bed.', 'torch']
      ];
      const two = GW >= 300, cw = two ? Math.min(150, (GW - 18) / 2 | 0) : Math.min(220, GW - 12), lines = steps.map(s => wrapText(s[1], cw - 34)), ch = 16 + Math.max(...lines.map(l => l.length)) * 9 + 6;
      const rows = two ? 2 : 4, gap = 4, tot = 18 + rows * (ch + gap) + 28, y0 = Math.max(4, (GH - tot) / 2 | 0), x0 = two ? (GW - cw * 2 - gap) >> 1 : (GW - cw) >> 1;
      textC('How to Play', GW / 2, y0, '#ffffff');
      steps.forEach((s, i) => {
        const cx = x0 + (two ? (i % 2) * (cw + gap) : 0), cy = y0 + 14 + (two ? (i >> 1) : i) * (ch + gap);
        panel(cx, cy, cw, ch);
        g.fillStyle = '#8b8b8b'; g.fillRect(cx + 5, cy + 5, 22, 22); g.fillStyle = '#373737'; g.fillRect(cx + 5, cy + 5, 22, 1); g.fillRect(cx + 5, cy + 5, 1, 22); g.fillStyle = '#fff'; g.fillRect(cx + 6, cy + 26, 21, 1); g.fillRect(cx + 26, cy + 6, 1, 21);
        const id = goalIcon(s[2]); g.drawImage(ICON, (id % ICN) * ICS, (id / ICN | 0) * ICS, ICS, ICS, cx + 8, cy + 8, 16, 16);
        text((i + 1) + '. ' + s[0], cx + 31, cy + 6, '#404040', false);
        lines[i].forEach((l, j) => text(l, cx + 31, cy + 17 + j * 9, '#555555', false));
      });
      const by = y0 + 14 + rows * (ch + gap) + 4;
      if (!helpBack && goalsOn()) textC('Follow the goals at the top left.', GW / 2, by - 1, '#ffcf40');
      button(GW / 2 - 100, Math.min(GH - 24, by + 10), 200, 20, helpBack ? 'Done' : 'Let\'s Go!', () => { if (helpBack) gui = helpBack; else closeGui(); });
    }
    const KBD = { fwd: 'KeyW', left: 'KeyA', back: 'KeyS', right: 'KeyD', jump: 'Space', sneak: 'ShiftLeft', sprint: 'ControlLeft', inv: 'KeyE', drop: 'KeyQ', swap: 'KeyF', chat: 'KeyT', cmd: 'Slash', list: 'Tab', pick: 'Mouse2', persp: 'F5', f3: 'F3', hide: 'F1' };
    const KB = Object.assign({}, KBD, SV.kb && typeof SV.kb === 'object' ? SV.kb : {});
    const saveKB = () => { SV.kb = KB; api.save(SV); };
    let freeMouse = false, unlockIntent = false, persp = 0, hideHud = false, fovDirty = true, lastW = 0, lastSpace = 0, lastJumpTap = 0, sneakToggle = false, aimT = null, tl = { id: null }, lastTouch = 0, mDrag = null;
    const tbs = new Map();
    const locked = () => document.pointerLockElement === canvas;
    let gestT = 0, lockT = 0, uiT = 0, wantLock = -1e9;
    function grab() { if (touch || locked()) return; wantLock = performance.now(); try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (e) { } }
    function lockMouse(gest) {
      if (touch || locked() || scr !== 'game' || freeMouse && !gest) return;
      if (gest) gestT = performance.now();
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { if (performance.now() - gestT < 1500) freeMouse = true; }); } catch (e) { if (gest) freeMouse = true; }
      if (gest) api.timeout(() => { if (!locked() && scr === 'game' && !gui && !touch && !chatOpen) freeMouse = true; }, 1200);
    }
    function releaseMouse() { uiT = performance.now(); attackHeld = useHeld = false; mine = null; tJump = false; if (locked()) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) { } } }
    api.on(document, 'pointerlockchange', () => {
      const t = performance.now();
      if (locked()) { freeMouse = false; lockT = t; if (gui || chatOpen || scr !== 'game' && t - wantLock > 4000 || P.dead) releaseMouse(); return; }
      attackHeld = useHeld = false;
      if (unlockIntent) { unlockIntent = false; return; }
      if (t - lockT < 600 || t - uiT < 900) return;
      if (scr === 'game' && !gui && !chatOpen && !P.dead) { gui = 'pause'; saveSoon(); }
    });
    api.on(document, 'pointerlockerror', () => { if (performance.now() - gestT < 1500) freeMouse = true; });
    const lookBy = (dx, dy) => { if (P.sleeping) return; P.yaw -= dx; P.pitch = clamp(P.pitch - dy, -1.5707, 1.5707); };
    function openChat(pre) { chatOpen = true; FIELDV.chat = pre || ''; chatHi = -1; releaseMouse(); focusField('chat', pre || '', 256); }
    function closeChat() { uiT = performance.now(); chatOpen = false; FIELDV.chat = ''; blurField(); lockMouse(); }
    function sendChat() {
      const m = (inp.value || '').trim();
      closeChat();
      if (!m) return;
      chatHist.push(m); if (chatHist.length > 50) chatHist.shift();
      if (m[0] === '/') { runCommand(m.slice(1)); return; }
      const line = '<' + P.name + '> ' + m;
      chatSys(line); netSend({ t: 'chat', m: line });
    }
    function guiDown(gx, gy, btn, shift) {
      for (const f of fields) if (inR(gx, gy, f)) { if (focusKey !== f.key) focusField(f.key, FIELDV[f.key] || '', f.maxLen); return; }
      if (focusKey && focusKey !== 'chat' && focusKey !== 'sign') blurField();
      for (const s of sliders) if (inR(gx, gy, s)) { activeSlider = s; s.set(clamp((gx - s.x - 4) / (s.w - 8), 0, 1)); return; }
      for (let i = btns.length - 1; i >= 0; i--) { const b = btns[i]; if (b.en && inR(gx, gy, b)) { if (b.l !== undefined) snd('click'); try { b.fn(); } catch (e) { if (window.console) console.error(e); } return; } }
      if (scr === 'game' && gui) invDown(btn, shift);
    }
    function pickBlock() {
      if (!HIT.b || !creative()) return;
      const s = getS(HIT.x, HIT.y, HIT.z), id = blockItemOf(s);
      for (let i = 0; i < 9; i++) if (inv[i] && inv[i].id === id) { sel = i; return; }
      let k = inv.findIndex((s2, i) => i < 9 && !s2); if (k < 0) k = sel; sel = k; inv[k] = { id, n: IT[id].stack, d: 0 };
    }
    function dropHeld(all) { const s = held(); if (!s || P.dead || gui) return; const n = all ? s.n : 1; stat('drop', n); throwStack({ id: s.id, n, d: s.d, x: s.x }, true); s.n -= n; if (s.n <= 0) inv[sel] = null; swing(); }
    function swapHands() { const a = inv[sel]; inv[sel] = offhand; offhand = a; }
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('mousedown', e => {
      if (e.target === inp) return;
      if (touch) { if (performance.now() - lastTouch < 900) return; touch = false; resize(); }
      e.preventDefault(); ac();
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      const btn = e.button === 2 ? 2 : e.button === 1 ? 1 : 0;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { guiDown(gx, gy, btn === 2 ? 2 : btn, e.shiftKey); return; }
      if (!locked() && !freeMouse) { lockMouse(true); return; }
      if (freeMouse && !locked()) try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (er) { }
      if (btn === 0) { attackHeld = true; attackPress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false }; }
      else if (btn === 2) { useHeld = true; usePress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false, use: 1 }; }
      else pickBlock();
    });
    api.on(window, 'mouseup', e => {
      if (e.button === 0) attackHeld = false;
      if (e.button === 2) useHeld = false;
      mDrag = null; activeSlider = null;
      if (!touch && scr === 'game' && gui) invUp();
    });
    api.on(document, 'mousemove', e => {
      if (locked()) { if (scr === 'game' && !gui && !chatOpen && Math.abs(e.movementX) < 400 && Math.abs(e.movementY) < 400) lookBy(e.movementX * CFG.SENS * SET.sens, e.movementY * CFG.SENS * SET.sens); return; }
      if (touch) return;
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1));
      if (scr === 'game' && gui) invMove();
      if (mDrag && scr === 'game' && !gui) {
        const dx = e.clientX - mDrag.x, dy = e.clientY - mDrag.y;
        if (!mDrag.moved && Math.hypot(dx, dy) > 4) { mDrag.moved = true; attackHeld = false; useHeld = false; mine = null; }
        if (mDrag.moved) { const k = 3.2 / (wrap.getBoundingClientRect().width || 960) * SET.sens; lookBy(dx * k, dy * k); mDrag.x = e.clientX; mDrag.y = e.clientY; }
      }
    });
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const d = e.deltaY || e.deltaX;
      if (!d) return;
      if (scr === 'game' && !gui && !chatOpen) { sel = (sel + (d > 0 ? 1 : 8)) % 9; return; }
      if (scr === 'game' && gui) { if (gui === 'controls') ctrlScroll += d > 0 ? 20 : -20; else if (gui === 'stats') statScroll += d > 0 ? 20 : -20; else invWheel(d); return; }
      if (scr === 'worlds') wScroll += d > 0 ? 24 : -24;
      if (scr === 'controls') ctrlScroll += d > 0 ? 20 : -20;
    }, { passive: false });
    function touchLayout() {
      const r = Math.min(34, GH * .11), jx = 12 + r * 1.2, jy = GH - 52 - r, bs = Math.min(30, GH * .1);
      const jump = { x: GW - bs * 1.8 - 10, y: GH - bs * 1.8 - 48, w: bs * 1.8, h: bs * 1.8 };
      return {
        r, jx, jy, bs, jump,
        sneak: { x: jump.x + bs * .2, y: jump.y - bs * 1.2 - 6, w: bs * 1.4, h: bs * 1.2 },
        pause: { x: GW - 29, y: 3, w: 26, h: 22 }, inv: { x: GW - 58, y: 3, w: 26, h: 22 }, chat: { x: GW - 87, y: 3, w: 26, h: 22 }, drop: { x: GW - 116, y: 3, w: 26, h: 22 }, persp: { x: GW - 145, y: 3, w: 26, h: 22 }
      };
    }
    function drawTouch() {
      const L = touchLayout();
      g.globalAlpha = .55;
      g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.fillStyle = 'rgba(0,0,0,.35)';
      const cx = stick.id != null ? stick.cx : L.jx, cy = stick.id != null ? stick.cy : L.jy;
      g.beginPath(); g.arc(cx, cy, L.r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx + stick.x * L.r * .6, cy + stick.y * L.r * .6, L.r * .38, 0, 7); g.fill();
      const box = (b, lbl, on) => { g.fillStyle = on ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'; g.fillRect(b.x, b.y, b.w, b.h); ring(b.x, b.y, b.w, b.h, 1, '#fff'); textC(lbl, b.x + b.w / 2, b.y + b.h / 2 - 4, '#ffffff'); };
      box(L.jump, P.fly ? 'UP' : 'JUMP', tJump); box(L.sneak, P.fly ? 'DOWN' : 'SNEAK', tSneak);
      box(L.pause, '||'); box(L.inv, '...'); box(L.chat, 'T'); box(L.drop, 'Q'); box(L.persp, 'F5');
      g.globalAlpha = 1;
    }
    const setAim = e => { const r = wrap.getBoundingClientRect(); aimT = { nx: (e.clientX - r.left) / (r.width || 1) * 2 - 1, ny: -((e.clientY - r.top) / (r.height || 1) * 2 - 1) }; };
    const setStick = (gx, gy) => { const r = touchLayout().r; let dx = (gx - stick.cx) / r, dy = (gy - stick.cy) / r; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.x = dx; stick.y = dy; };
    wrap.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || e.target === inp) return;
      e.preventDefault(); lastTouch = performance.now(); ac();
      if (!touch) { touch = true; releaseMouse(); resize(); }
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { tbs.set(e.pointerId, 'gui'); guiDown(gx, gy, 0, false); return; }
      if (P.dead) return;
      const L = touchLayout(), now = performance.now();
      if (inR(gx, gy, L.inv)) { openGui('inv'); return; }
      if (inR(gx, gy, L.pause)) { gui = 'pause'; saveSoon(); return; }
      if (inR(gx, gy, L.chat)) { openChat(''); return; }
      if (inR(gx, gy, L.drop)) { dropHeld(false); return; }
      if (inR(gx, gy, L.persp)) { persp = (persp + 1) % 3; return; }
      if (inR(gx, gy, L.jump)) { tbs.set(e.pointerId, 'jump'); tJump = true; if ((creative() || mode() === 'spectator') && now - lastJumpTap < 350) { P.fly = !P.fly; P.vy = 0; lastJumpTap = 0; } else lastJumpTap = now; return; }
      if (inR(gx, gy, L.sneak)) { tbs.set(e.pointerId, 'sneak'); if (P.fly) tSneak = true; else { sneakToggle = !sneakToggle; tSneak = sneakToggle; } return; }
      const hx = (GW - 182) >> 1;
      if (gy >= GH - 24 && gx >= hx && gx < hx + 182) { sel = clamp((gx - hx) / 20 | 0, 0, 8); return; }
      if (stick.id == null && gx < GW * .42 && gy > GH * .4) { stick.id = e.pointerId; const near = Math.hypot(gx - L.jx, gy - L.jy) < L.r * 1.8; stick.cx = near ? L.jx : gx; stick.cy = near ? L.jy : gy; setStick(gx, gy); return; }
      if (tl.id == null) { tl = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: now, moved: false, mining: false }; setAim(e); }
    });
    api.on(window, 'pointermove', e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { const [gx, gy] = toGui(e); setStick(gx, gy); return; }
      if (e.pointerId === tl.id) {
        if (!tl.moved && Math.hypot(e.clientX - tl.sx, e.clientY - tl.sy) > 10) { tl.moved = true; if (!tl.mining) { attackHeld = false; useHeld = false; } }
        if (tl.moved && !tl.mining) { const k = 3.2 / (wrap.getBoundingClientRect().width || 400) * SET.sens; lookBy((e.clientX - tl.x) * k, (e.clientY - tl.y) * k); }
        tl.x = e.clientX; tl.y = e.clientY; setAim(e); return;
      }
      if (scr !== 'game' || gui) { const [gx, gy] = toGui(e); mx = gx; my = gy; if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1)); if (scr === 'game' && gui) invMove(); }
    });
    const touchUp = e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; }
      const b = tbs.get(e.pointerId);
      if (b) { tbs.delete(e.pointerId); if (b === 'jump') tJump = false; else if (b === 'sneak' && P.fly) tSneak = false; else if (b === 'gui') { activeSlider = null; if (scr === 'game' && gui) invUp(); } }
      if (e.pointerId === tl.id) {
        if (!tl.moved && !tl.mining && performance.now() - tl.t < 300 && scr === 'game' && !gui && e.type === 'pointerup') { setAim(e); updTarget(); if (HIT.ent) attackPress(); else usePress(); }
        attackHeld = false; useHeld = false; tl = { id: null }; aimT = null;
      }
    };
    api.on(window, 'pointerup', touchUp); api.on(window, 'pointercancel', touchUp);
    function touchTick() {
      if (tl.id != null && !tl.moved && !tl.mining && performance.now() - tl.t > 280 && scr === 'game' && !gui) { tl.mining = true; attackHeld = true; const h = held(); if (h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink || IT[h.id].shield || IT[h.id].crossbow || IT[h.id].trident)) { attackHeld = false; useHeld = true; usePress(); } else attackPress(); }
    }
    inp.addEventListener('input', () => { if (focusKey && focusKey !== 'sign') FIELDV[focusKey] = inp.value; });
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); const f = fields.find(q => q.key === focusKey); if (focusKey === 'chat') sendChat(); else if (focusKey === 'sign') { signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + 1) % 4; inp.value = signLines[signLine]; } else if (f && f.onEnter) f.onEnter(); else blurField(); return; }
      if (e.key === 'Escape') { e.preventDefault(); if (focusKey === 'chat') closeChat(); else if (focusKey === 'sign') closeGui(); else blurField(); return; }
      if (focusKey === 'sign' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + (e.key === 'ArrowUp' ? 3 : 1)) % 4; inp.value = signLines[signLine]; return; }
      if (focusKey === 'chat' && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && chatHist.length) { e.preventDefault(); chatHi = clamp((chatHi < 0 ? chatHist.length : chatHi) + (e.key === 'ArrowUp' ? -1 : 1), 0, chatHist.length); inp.value = FIELDV.chat = chatHist[chatHi] || ''; return; }
      if (focusKey === 'chat' && e.key === 'Tab') { e.preventDefault(); const v = inp.value; if (v[0] === '/') { const c = tabComplete(v); if (c) inp.value = FIELDV.chat = c; } }
    });
    api.on(window, 'keydown', e => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const c = e.code;
      if (touch && !e.repeat && c && c !== 'Unidentified') { touch = false; resize(); }
      ac();
      if (ctrlWait) { e.preventDefault(); if (c !== 'Escape') KB[ctrlWait] = c; ctrlWait = null; saveKB(); return; }
      if (c === 'F1' || c === 'F3' || c === 'F5' || c === 'Tab' || c === 'Space' || c === 'Slash' || /^Arrow/.test(c)) e.preventDefault();
      if (scr !== 'game') {
        if (c === 'Escape') { if (scr === 'worlds' || scr === 'mp' || scr === 'options') scr = 'title'; else if (scr === 'create' || scr === 'edit' || scr === 'delete') goWorlds(); else if (scr === 'controls') scr = 'options'; }
        if (c === 'Enter' && scr === 'worlds' && selWorld >= 0) playSel();
        return;
      }
      if (gui === 'dead') { if ((c === 'Space' || c === 'Enter') && deadT > 20 && !W.hardcore) { respawn(); lockMouse(true); } return; }
      if (c === 'Escape' && gui === 'help') { if (helpBack) gui = helpBack; else closeGui(); return; }
      if (c === 'Escape') { if (gui === 'options' || gui === 'controls' || gui === 'plist' || gui === 'stats' || gui === 'adv') { persistSet(); gui = 'pause'; } else if (gui) closeGui(); else { gui = 'pause'; releaseMouse(); saveSoon(); } return; }
      if (gui === 'pause' || gui === 'options' || gui === 'controls' || gui === 'plist' || gui === 'stats' || gui === 'adv' || gui === 'help' || gui === 'sign') return;
      if (c === KB.inv && !e.repeat) { if (gui) closeGui(); else if (!chatOpen && !P.dead) openGui('inv'); return; }
      if (gui) { invKey(c); return; }
      if (chatOpen) return;
      const d = /^Digit([1-9])$/.exec(c);
      if (d) { sel = +d[1] - 1; return; }
      if (c === KB.f3) { showF3 = !showF3; return; }
      if (c === KB.hide) { hideHud = !hideHud; return; }
      if (e.repeat) return;
      if (c === KB.persp) { persp = (persp + 1) % 3; return; }
      if (c === KB.chat) { e.preventDefault(); openChat(''); return; }
      if (c === KB.cmd) { e.preventDefault(); openChat('/'); return; }
      if (c === KB.drop) { dropHeld(e.ctrlKey || e.metaKey); return; }
      if (c === KB.swap) { swapHands(); return; }
      if (c === KB.sprint) sprintKey = true;
      const now = performance.now();
      if (c === KB.fwd) { if (now - lastW < CFG.DOUBLE_TAP * 50) sprintTap = 1; lastW = now; }
      if (c === KB.jump && (creative() || mode() === 'spectator')) { if (now - lastSpace < CFG.DOUBLE_TAP * 50 && mode() !== 'spectator') { P.fly = !P.fly; P.vy = 0; lastSpace = 0; } else lastSpace = now; }
    });
    api.on(window, 'keyup', e => { if (e.code === KB.sprint) sprintKey = false; });
    api.on(window, 'blur', () => { attackHeld = useHeld = false; sprintKey = false; });
    const CMDS = ['gamemode', 'time', 'weather', 'give', 'tp', 'teleport', 'kill', 'seed', 'difficulty', 'gamerule', 'summon', 'xp', 'experience', 'clear', 'effect', 'spawnpoint', 'setworldspawn', 'help', 'list', 'say', 'me', 'msg', 'setblock', 'fill', 'heal', 'locate'];
    const WORLD_CMDS = new Set(['time', 'weather', 'difficulty', 'gamerule', 'summon', 'setworldspawn', 'setblock', 'fill', 'say']);
    function tabComplete(v) {
      const parts = v.slice(1).split(' ');
      if (parts.length === 1) { const m = CMDS.filter(c => c.startsWith(parts[0])); return m.length ? '/' + m[0] + ' ' : null; }
      const last = parts[parts.length - 1], cmd = parts[0];
      let pool = [];
      if (cmd === 'give' && parts.length === 3 || cmd === 'clear') pool = IT.map(i => i.id);
      else if (cmd === 'give' && parts.length === 2) pool = ['@s', '@p', '@a', P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name));
      else if (cmd === 'gamemode') pool = ['survival', 'creative', 'adventure', 'spectator'];
      else if (cmd === 'time') pool = parts.length === 2 ? ['set', 'add', 'query'] : ['day', 'noon', 'night', 'midnight'];
      else if (cmd === 'weather') pool = ['clear', 'rain', 'thunder'];
      else if (cmd === 'difficulty') pool = ['peaceful', 'easy', 'normal', 'hard', 'hardest'];
      else if (cmd === 'gamerule') pool = parts.length === 2 ? RULES.map(r => r[0]).concat(['randomTickSpeed']) : ['true', 'false'];
      else if (cmd === 'summon') pool = Object.keys(MT).concat(['item', 'tnt', 'falling_block']);
      else if (cmd === 'effect') pool = parts.length === 2 ? ['give', 'clear'] : ['regeneration', 'poison', 'hunger', 'fire_resistance', 'water_breathing'];
      const m = pool.filter(p => p.startsWith(last.replace(/^minecraft:/, '')));
      if (!m.length) return null;
      parts[parts.length - 1] = m[0];
      return '/' + parts.join(' ');
    }
    const coord = (s, base) => s === undefined ? base : s[0] === '~' ? base + (+s.slice(1) || 0) : +s;
    function runCommand(str, from) {
      const a = str.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase().replace(/^minecraft:/, '');
      const say = (m, c) => { if (from) netSendTo(from.pid, { t: 'chat', m, c }); else chatSys(m, c); };
      const err = m => say(m, '#ff5555');
      const cheats = from ? W.cheats : W.cheats || NET.role === 'guest' && W.cheats;
      if (!CMDS.includes(cmd)) { err('Unknown or incomplete command, see below for error'); err('/' + str + '<--[HERE]'); return; }
      if (cmd === 'help') { say('Commands: /' + CMDS.join(', /')); return; }
      if (cmd === 'seed') { say('Seed: [' + W.seed + ']', '#55ff55'); return; }
      if (cmd === 'list') { const L = [P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name)); say('There are ' + L.length + ' of a max of 8 players online: ' + L.join(', ')); return; }
      if (cmd === 'me' || cmd === 'msg') { const m = '* ' + P.name + ' ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (!cheats) { err('You do not have permission to use this command (cheats are off)'); return; }
      if (NET.role === 'guest' && WORLD_CMDS.has(cmd)) { netSend({ t: 'cmd', s: str }); return; }
      if (from && !WORLD_CMDS.has(cmd)) { err('Run that command on your own client'); return; }
      if (cmd === 'say') { const m = '[' + (from ? from.name : P.name) + '] ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (cmd === 'gamemode') {
        const m = { survival: 'survival', s: 'survival', '0': 'survival', creative: 'creative', c: 'creative', '1': 'creative', adventure: 'adventure', a: 'adventure', '2': 'adventure', spectator: 'spectator', sp: 'spectator', '3': 'spectator' }[(a[1] || '').toLowerCase()];
        if (!m) { err('Unknown game mode: ' + (a[1] || '')); return; }
        setMode(m); say('Set own game mode to ' + GMN[m] + ' Mode'); return;
      }
      if (cmd === 'time') {
        const DAYV = { day: 1000, noon: 6000, night: 13000, midnight: 18000, sunrise: 23000, sunset: 12000 };
        if (a[1] === 'query') { say('The time is ' + Math.floor(a[2] === 'day' ? W.time / 24000 : W.time % 24000)); return; }
        const v = DAYV[a[2]] ?? parseInt(a[2]);
        if (!isFinite(v)) { err('Invalid time'); return; }
        if (a[1] === 'set') W.time = Math.floor(W.time / 24000) * 24000 + v; else if (a[1] === 'add') W.time += v; else { err('Usage: /time <set|add|query> <value>'); return; }
        say('Set the time to ' + Math.floor(W.time % 24000)); return;
      }
      if (cmd === 'weather') {
        const k = a[1];
        if (k === 'clear') { W.raining = false; W.thunder = false; } else if (k === 'rain') { W.raining = true; W.thunder = false; } else if (k === 'thunder') { W.raining = true; W.thunder = true; } else { err('Usage: /weather <clear|rain|thunder>'); return; }
        W.weatherT = (+a[2] || 300 + ri(600)) * 20;
        say('Set the weather to ' + (k === 'clear' ? 'clear' : k === 'rain' ? 'rain' : 'rain & thunder')); return;
      }
      if (cmd === 'difficulty') { const i = ['peaceful', 'easy', 'normal', 'hard', 'hardest'].indexOf((a[1] || '').toLowerCase()); if (i < 0) { say('The difficulty is ' + DIFFN[W.diff]); return; } if (W.hardcore) { err('Cannot change difficulty in Hardcore'); return; } W.diff = i; if (i === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); say('The difficulty has been set to ' + DIFFN[i]); return; }
      if (cmd === 'gamerule') {
        const k = a[1]; if (!k) { err('Usage: /gamerule <rule> [value]'); return; }
        if (a[2] === undefined) { say('Gamerule ' + k + ' is currently set to: ' + W.rules[k]); return; }
        W.rules[k] = a[2] === 'true' ? true : a[2] === 'false' ? false : isFinite(+a[2]) ? +a[2] : a[2];
        say('Gamerule ' + k + ' is now set to: ' + W.rules[k]); return;
      }
      if (cmd === 'give') {
        let tgt = a[1], nm = a[2], n = parseInt(a[3]) || 1;
        if (!nm || IN[(tgt || '').replace(/^minecraft:/, '')] && !IN[nm.replace(/^minecraft:/, '')]) { n = parseInt(nm) || 1; nm = tgt; tgt = '@s'; }
        const it = IN[(nm || '').replace(/^minecraft:/, '')];
        if (!it || !it.tab) { err('Unknown item: ' + nm); return; }
        n = clamp(n, 1, 6400);
        const self = tgt === '@s' || tgt === '@p' || tgt === P.name || tgt === '@a';
        if (self) { let left = n; while (left > 0) { const k = Math.min(left, it.stack); giveOrDrop({ id: it.idx, n: k, d: 0 }); left -= k; } snd('pop'); }
        const others = ENTS.filter(e => e.kind === 'player' && (tgt === '@a' || e.name === tgt));
        for (const o of others) netSendTo(o.pid, { t: 'give', s: { id: it.idx, n, d: 0 } });
        if (!self && !others.length) { err('No player was found'); return; }
        say('Gave ' + n + ' [' + it.name + '] to ' + (tgt === '@a' ? 'all players' : self ? P.name : tgt)); return;
      }
      if (cmd === 'tp' || cmd === 'teleport') {
        if (a.length > 2 && (a[1] === '@s' || a[1] === '@p' || a[1] === P.name)) a.splice(1, 1);
        if (a.length >= 4) { const x = coord(a[1], P.x), y = coord(a[2], P.y - CFG.YOFF) + CFG.YOFF, z = coord(a[3], P.z); if (![x, y, z].every(isFinite)) { err('Invalid position'); return; } P.x = x; P.y = y; P.z = z; P.vx = P.vy = P.vz = 0; P.fall = 0; P.px = x; P.py = y; P.pz = z; if (a[4] !== undefined && isFinite(+a[4])) P.yaw = Math.PI - (+a[4]) * Math.PI / 180; if (a[5] !== undefined && isFinite(+a[5])) P.pitch = clamp(-(+a[5]) * Math.PI / 180, -1.5707, 1.5707); say('Teleported ' + P.name + ' to ' + x.toFixed(1) + ', ' + (y - CFG.YOFF).toFixed(1) + ', ' + z.toFixed(1)); return; }
        const o = ENTS.find(e => e.kind === 'player' && e.name === a[1]);
        if (o) { P.x = o.x; P.y = o.y; P.z = o.z; say('Teleported ' + P.name + ' to ' + o.name); return; }
        err('Usage: /tp <x> <y> <z> or /tp <player>'); return;
      }
      if (cmd === 'kill') { if (!a[1] || a[1] === '@s' || a[1] === P.name) { hurtPlayer(1000, null, null, 'void'); say('Killed ' + P.name); return; } if (a[1] === '@e') { let n = 0; for (const e of ENTS.slice()) if (e.kind === 'mob') { killMob(e); n++; } say('Killed ' + n + ' entities'); return; } err('No entity was found'); return; }
      if (cmd === 'heal') { P.hp = 20; P.food = 20; P.sat = 5; say('Healed'); return; }
      if (cmd === 'clear') { let n = 0; const id = a[1] && IN[a[1].replace(/^minecraft:/, '')]; for (let i = 0; i < 36; i++) if (inv[i] && (!id || inv[i].id === id.idx)) { n += inv[i].n; inv[i] = null; } if (!id) { for (let i = 0; i < 4; i++) if (armor[i]) { n++; armor[i] = null; } if (offhand) { n++; offhand = null; } } say('Removed ' + n + ' item(s) from player ' + P.name); return; }
      if (cmd === 'xp' || cmd === 'experience') { const sub = a[1] === 'add' || a[1] === 'set' ? a[1] : 'add', v = parseInt(sub === a[1] ? a[2] : a[1]) || 0, lv = /levels?$/.test(a[a.length - 1]); if (sub === 'set') { if (lv) { P.lvl = Math.max(0, v); P.xp = 0; } else { P.xp = 0; addXp(v); } } else if (lv) P.lvl = Math.max(0, P.lvl + v); else addXp(v); say((lv ? 'Gave ' + v + ' experience levels' : 'Gave ' + v + ' experience points') + ' to ' + P.name); return; }
      if (cmd === 'effect') {
        if (a[1] === 'clear') { P.effects = {}; say('Removed every effect from ' + P.name); return; }
        const nm = (a[3] || a[2] || '').replace(/^minecraft:/, ''), map = { regeneration: 'regen', poison: 'poison', hunger: 'hunger', fire_resistance: 'fireRes', water_breathing: 'waterBreathing' }, k = map[nm];
        if (!k) { err('Unknown effect: ' + nm); return; }
        P.effects[k] = (parseInt(a[4] || a[3]) || 30) * 20; say('Applied effect ' + title(nm) + ' to ' + P.name); return;
      }
      if (cmd === 'spawnpoint') { P.spawn = [P.x, P.y, P.z]; say('Set spawn point to ' + Math.floor(P.x) + ', ' + Math.floor(P.y - CFG.YOFF) + ', ' + Math.floor(P.z)); return; }
      const src = from || P;
      if (cmd === 'setworldspawn') { W.spawn = [Math.floor(src.x) + .5, Math.floor(src.y), Math.floor(src.z) + .5]; say('Set the world spawn point to ' + Math.floor(src.x) + ', ' + Math.floor(src.y - CFG.YOFF) + ', ' + Math.floor(src.z)); return; }
      if (cmd === 'summon') {
        const ty = (a[1] || '').replace(/^minecraft:/, ''), x = coord(a[2], src.x), y = a[3] !== undefined ? coord(a[3], src.y - CFG.YOFF) + CFG.YOFF : src.y, z = coord(a[4], src.z);
        if (ty === 'tnt') { spawnTNT(Math.floor(x), Math.floor(y), Math.floor(z), 80); say('Summoned new Primed TNT'); return; }
        if (!MT[ty]) { err('Unknown entity: ' + ty); return; }
        spawnMob(ty, x, y, z, { persist: true }); say('Summoned new ' + title(ty)); return;
      }
      if (cmd === 'setblock' || cmd === 'fill') {
        const n = cmd === 'fill' ? 7 : 4, nm = (a[n] || '').replace(/^minecraft:/, ''), t = TN[nm];
        if (!t) { err('Unknown block type: ' + nm); return; }
        const p1 = [coord(a[1], src.x), coord(a[2], src.y - CFG.YOFF) + CFG.YOFF, coord(a[3], src.z)].map(Math.floor);
        const p2 = cmd === 'fill' ? [coord(a[4], src.x), coord(a[5], src.y - CFG.YOFF) + CFG.YOFF, coord(a[6], src.z)].map(Math.floor) : p1;
        let c = 0;
        const vol = (Math.abs(p2[0] - p1[0]) + 1) * (Math.abs(p2[1] - p1[1]) + 1) * (Math.abs(p2[2] - p1[2]) + 1);
        if (vol > 32768) { err('Too many blocks in the specified area (maximum 32768, specified ' + vol + ')'); return; }
        for (let x = Math.min(p1[0], p2[0]); x <= Math.max(p1[0], p2[0]); x++) for (let y = Math.min(p1[1], p2[1]); y <= Math.max(p1[1], p2[1]); y++) for (let z = Math.min(p1[2], p2[2]); z <= Math.max(p1[2], p2[2]); z++) if (setBlock(x, y, z, t.base)) c++;
        say(cmd === 'fill' ? 'Successfully filled ' + c + ' block(s)' : 'Changed the block at ' + p1[0] + ', ' + (p1[1] - CFG.YOFF) + ', ' + p1[2]); return;
      }
      if (cmd === 'locate') { say('Structures are not generated in this version', '#aaaaaa'); return; }
    }
    function setMode(m) {
      W.mode = m;
      if (m === 'creative' || m === 'spectator') { P.fire = 0; } else P.fly = false;
      if (m === 'spectator') P.fly = true;
      if (gui === 'inv' || gui === 'creative') { closeGui(true); openGui('inv'); }
    }
