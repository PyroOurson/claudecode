    const fontW = [], fontC = cv(128, 54), fg = fontC.getContext('2d');
    fg.fillStyle = '#fff';
    for (let i = 0; i < 95; i++) { let w = 0; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let c = 0; c < 5; c++) if (v & (16 >> c)) { fg.fillRect((i & 15) * 8 + c, (i >> 4) * 9 + r, 1, 1); w = Math.max(w, c + 1); } } fontW.push(i ? w : 3); }
    let GW = 480, GH = 300, GK = 2, cssW = 0, cssH = 0;
    function resize() {
      const w = wrap.clientWidth || 960, h = wrap.clientHeight || 600, r = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 3);
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
      const U = 2, L = [['M', 16, [[0, 0, 4, 16], [12, 0, 4, 16], [[4, 0], [8, 5], [12, 0], [12, 6.5], [8, 11.5], [4, 6.5]]]], ['I', 4, [[0, 0, 4, 16]]], ['N', 14, [[0, 0, 4, 16], [10, 0, 4, 16], [[4, 0], [10, 9], [10, 16], [4, 7]]]], ['E', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 6, 10, 4], [0, 12, 12, 4]]], ['C', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 12, 12, 4]]], ['R', 13, [[0, 0, 4, 16], [0, 0, 13, 4], [9, 0, 4, 10], [0, 6, 13, 4], [[8, 11.5], [11, 11.5], [13, 13], [13, 16], [9, 16], [8, 14.5]]]], ['A', 15, [[0, 0, 4, 16], [11, 0, 4, 16], [0, 0, 15, 11.5]]], ['F', 12, [[0, 0, 4, 16], [0, 0, 12, 4], [0, 6, 10, 4]]], ['T', 12, [[0, 0, 12, 4], [4, 0, 4, 16]]]];
      const GAP = 1, tot = L.reduce((a, l) => a + l[1], 0) + GAP * (L.length - 1), P0 = 2, EX = 4, w = Math.ceil(tot * U) + P0 * 2, h = 16 * U + P0 * 2 + EX;
      const m = cv(w, h), q = m.getContext('2d'); q.fillStyle = '#fff'; let ox = 0, ax = 0;
      for (const [ch, lw, parts] of L) {
        for (const pt of parts) { q.beginPath(); if (typeof pt[0] === 'number') q.rect(P0 + (ox + pt[0]) * U, P0 + pt[1] * U, pt[2] * U, pt[3] * U); else pt.forEach(([x, y], i) => q[i ? 'lineTo' : 'moveTo'](P0 + (ox + x) * U, P0 + y * U)); q.fill(); }
        if (ch === 'A') ax = P0 + ox * U;
        ox += lw + GAP;
      }
      const md = q.getImageData(0, 0, w, h).data, M = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) M[i] = md[i * 4 + 3] > 127 ? 1 : 0;
      const FACE = ['.##..##.', '.##..##.', '...##...', '..####..', '..####..', '..#..#..'];
      for (let j = 0; j < 9; j++) for (let i = 0; i < 12; i++) if (FACE[j / 1.5 | 0][i / 1.5 | 0] === '#') M[(P0 + 10 + j) * w + ax + 9 + i] = 0;
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
      const s = 'JAVA EDITION', S2 = 2, W0 = tw(s) * S2 + s.length * 2 + 8, H0 = 8 * S2 + 7, m = new Uint8Array(W0 * H0); let x0 = 3;
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
    const SPLASHES = ['Also try Terraria!', 'Now with poplar trees!', 'Wilderness Bound!', '100% blocks!', 'Punch a tree!', 'Mind the creepers!', 'Diamonds below!', 'Pixel perfect!', 'Bring a pickaxe!', 'Infinite worlds!', 'Pigs included!', 'Sulfur caves?!', 'Cushions!', 'Cinnabar!', 'LAN party!', 'Made in a browser!', 'Water flows!', 'Sand falls!', 'Redstone!', 'Craft away!', 'Golden dandelion!', 'Over 1500 items!'];
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
      if (P.sleeping) { g.fillStyle = `rgba(10,10,20,${Math.min(.9, P.sleeping / 100)})`; g.fillRect(0, 0, GW, GH); textC('Sleeping...', GW / 2, GH / 2 - 20, '#ffffff'); button(GW / 2 - 50, GH - 40, 100, 20, 'Leave Bed', wake); }
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
        const lines = ['Minecraft 26.3 (26.3/' + (NET.role ? 'multiplayer' : 'vanilla') + ')', fps + ' fps T: ' + (SET.fps || 'inf') + ' vsync ' + (SET.fancy ? 'fancy' : 'fast') + (SET.clouds ? '-clouds' : '') + ' B: 2', (NET.role === 'guest' ? 'Remote server @ ' + (api.net.rtt || 0) + ' ms ping' : 'Integrated server @ ' + fT.toFixed(1) + '/50.0 ms') + ', ' + (NET.role ? playersList().length + ' players' : '20 tps'), 'C: ' + W.cols.size + ' D: ' + SET.rd + ', pC: 000, pU: 00', 'E: ' + ENTS.length + '/' + ENTS.length + ', P: ' + (ENTS.filter(e => e.kind === 'mob').length), 'minecraft:overworld FC: 0', '', 'XYZ: ' + P.x.toFixed(3) + ' / ' + (P.y - CFG.YOFF).toFixed(5) + ' / ' + P.z.toFixed(3), 'Block: ' + bx + ' ' + (by - CFG.YOFF) + ' ' + bz + ' [' + (bx & 15) + ' ' + (by & 15) + ' ' + (bz & 15) + ']', 'Chunk: ' + (bx >> 4) + ' ' + ((by - CFG.YOFF) >> 4) + ' ' + (bz >> 4) + ' [' + ((bx >> 4) & 31) + ' ' + ((bz >> 4) & 31) + ' in r.' + (bx >> 9) + '.' + (bz >> 9) + '.mca]', 'Facing: ' + face + ' (' + yd.toFixed(1) + ' / ' + (-P.pitch * 180 / Math.PI).toFixed(1) + ')', 'Client Light: ' + Math.max(L >> 4, L & 15) + ' (' + (L >> 4) + ' sky, ' + (L & 15) + ' block)', 'Biome: minecraft:' + (B2.n || '').toLowerCase().replace(/ /g, '_'), 'Local Difficulty: ' + (W.diff * .75 + .75).toFixed(2) + ' // 0.00 (Day ' + Math.floor(W.time / CFG.DAY) + ')', '', 'For help: press F3 + Q'];
        const right = ['Java: 21.0.8 64bit', md2 ? 'Mem: ' + Math.round(md2.usedJSHeapSize / md2.jsHeapSizeLimit * 100) + '% ' + Math.round(md2.usedJSHeapSize / 1048576) + '/' + Math.round(md2.jsHeapSizeLimit / 1048576) + 'MB' : 'Mem: n/a', md2 ? 'Allocated: ' + Math.round(md2.totalJSHeapSize / md2.jsHeapSizeLimit * 100) + '% ' + Math.round(md2.totalJSHeapSize / 1048576) + 'MB' : '', '', 'CPU: ' + (navigator.hardwareConcurrency || 1) + 'x', '', 'Display: ' + hud.width + 'x' + hud.height + ' (' + F3G[0] + ')', F3G[1], F3G[2] || ''];
        if (HIT.b) { const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]]; right.push('', 'Targeted Block: ' + HIT.x + ', ' + (HIT.y - CFG.YOFF) + ', ' + HIT.z, 'minecraft:' + t.id); for (const [k, vals] of t.props) right.push(k + ': ' + vals[sv(s, k)]); for (const tg of t.tags) right.push('#minecraft:' + tg); }
        const bg = 'rgba(80,80,80,.565)';
        lines.forEach((l, i) => { if (!l) return; g.fillStyle = bg; g.fillRect(1, 1 + i * 9, tw(l) + 2, 9); text(l, 2, 2 + i * 9, '#e0e0e0', false); });
        right.forEach((l, i) => { if (!l) return; const w = tw(l); g.fillStyle = bg; g.fillRect(GW - w - 3, 1 + i * 9, w + 2, 9); text(l, GW - w - 2, 2 + i * 9, '#e0e0e0', false); });
      }
      if (keys.has('Tab') && NET.role && !gui) { const pl = api.net.players || []; const w = 160, x = (GW - w) / 2; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, 10, w, 12 + pl.length * 10); pl.forEach((p, i) => { text(p.name + (p.host ? ' (host)' : ''), x + 4, 14 + i * 10, '#ffffff', false); if (p.ping) textR(p.ping + 'ms', x + w - 4, 14 + i * 10, '#80ff80', false); }); }
    }
