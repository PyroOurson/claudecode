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
      if (!touch) GK = Math.max(1, Math.round(GK)); else GK = Math.max(1, GK);
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
    const BT = [[111, 111, 111, 168, 168, 168, 84, 84, 84], [118, 128, 186, 188, 198, 255, 82, 92, 150], [46, 46, 46, 62, 62, 62, 32, 32, 32]].map(p => {
      const c = cv(200, 20), x = c.getContext('2d'), im = x.createImageData(200, 20), R = rng(5);
      for (let y = 0; y < 20; y++) for (let i = 0; i < 200; i++) { const o = (y * 200 + i) * 4, edge = y === 0 || y === 19 || i === 0 || i === 199, hi = y === 1 || i === 1, lo = y >= 17 || i === 198, n = .93 + R() * .14; const c3 = edge ? [0, 0, 0] : hi ? p.slice(3, 6) : lo ? p.slice(6, 9) : p.slice(0, 3).map(v => v * n); im.data[o] = c3[0]; im.data[o + 1] = c3[1]; im.data[o + 2] = c3[2]; im.data[o + 3] = 255; }
      x.putImageData(im, 0, 0); return c;
    });
    const dirtBg = (() => { const c = cv(16, 16), x = c.getContext('2d'), d = get('dirt'), im = x.createImageData(16, 16); for (let i = 0; i < 1024; i += 4) { im.data[i] = d[i] * .25; im.data[i + 1] = d[i + 1] * .25; im.data[i + 2] = d[i + 2] * .25; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); return c; })();
    const LOGO = (() => {
      const word = 'MINECRAFT', S2 = 6, pts = new Set(); let x0 = 0;
      for (const ch of word) { const i = ch.charCodeAt(0) - 32; for (let r = 0; r < 8; r++) { const v = parseInt(FONT[i * 8 + r], 32); for (let k = 0; k < 5; k++) if (v & (16 >> k)) pts.add((x0 + k) + ',' + r); } x0 += fontW[i] + 2; }
      const c = cv(x0 * S2 + 10, 7 * S2 + 12), q = c.getContext('2d'), sd = get('stone'), dd = get('cobblestone');
      const list = [...pts].map(p => p.split(',').map(Number));
      for (const [px, py] of list) { q.fillStyle = '#121212'; q.fillRect(px * S2 + 5, py * S2 + 7, S2, S2); q.fillStyle = '#2e2e2e'; q.fillRect(px * S2 + 3, py * S2 + 5, S2, S2); q.fillStyle = '#4a4a4a'; q.fillRect(px * S2 + 1.5, py * S2 + 3, S2, S2); }
      for (const [px, py] of list) for (let j = 0; j < S2; j++) for (let i = 0; i < S2; i++) {
        const X = px * S2 + i, Y = py * S2 + j, src = (j + py) % 3 === 0 ? dd : sd, o = ((Y % 16) * 16 + (X % 16)) * 4;
        let f = 1.15; if (j === 0 && !pts.has(px + ',' + (py - 1))) f = 1.65; else if (i === 0 && !pts.has((px - 1) + ',' + py)) f = 1.4; else if (j === S2 - 1 && !pts.has(px + ',' + (py + 1))) f = .75; else if (i === S2 - 1 && !pts.has((px + 1) + ',' + py)) f = .9;
        q.fillStyle = `rgb(${Math.min(255, src[o] * f) | 0},${Math.min(255, src[o + 1] * f) | 0},${Math.min(255, src[o + 2] * f) | 0})`; q.fillRect(X, Y, 1, 1);
      }
      return c;
    })();
    const EDITION = (() => { const s = 'JAVA EDITION', c = cv(tw(s) * 2 + 8, 22), q = c.getContext('2d'); q.fillStyle = '#5a3a1a'; q.fillRect(0, 2, c.width, 18); q.fillStyle = '#8a5a2a'; q.fillRect(1, 3, c.width - 2, 16); return c; })();
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
      textC(lbs, x + w / 2, y + (h - 8) / 2, en ? (hov ? '#ffffa0' : '#e0e0e0') : '#a0a0a0');
      btns.push({ x, y, w, h, fn, en, l: lb });
    }
    function rows(list, y, tot) { tot = Math.min(tot || 308, GW - 8); const n = list.length, bw = (tot - (n - 1) * 4) / n | 0, x0 = (GW - (bw * n + (n - 1) * 4)) / 2 | 0; list.forEach(([l, fn, en], i) => button(x0 + i * (bw + 4), y, bw, 20, l, fn, en !== false)); }
    function ring(x, y, w, h, t, c) { g.fillStyle = c; g.fillRect(x, y, w, t); g.fillRect(x, y + h - t, w, t); g.fillRect(x, y, t, h); g.fillRect(x + w - t, y, t, h); }
    function drawDirt(dark) { for (let y = 0; y < GH; y += 32) for (let x = 0; x < GW; x += 32) g.drawImage(dirtBg, x, y, 32, 32); if (dark) { g.fillStyle = 'rgba(0,0,0,' + dark + ')'; g.fillRect(0, 0, GW, GH); } }
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
      g.fillStyle = focus ? '#ffffff' : '#a0a0a0'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#000'; g.fillRect(x, y, w, h);
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
      const r = (c, a, b, w, h) => { g.fillStyle = c; g.fillRect(x + a * sc, y + b * sc, w * sc, h * sc); };
      const sk = '#c8946c', sh = '#00afaf', pa = '#3c3aa0', hr = '#462e18';
      r(pa, -4, 12, 8, 12); r('#2a2870', -.5, 12, 1, 12); r('#464650', -4, 22, 8, 2);
      r(sh, -4, 0, 8, 12); r(sk, -8, 0, 4, 12); r(sk, 4, 0, 4, 12); r(sh, -8, 0, 4, 4); r(sh, 4, 0, 4, 4);
      r(sk, -4, -8, 8, 8); r(hr, -4, -8, 8, 2); r(hr, -4, -6, 1, 1); r(hr, 3, -6, 1, 1); r('#fff', -3, -4, 1, 1); r('#fff', 2, -4, 1, 1); r('#503ca0', -2, -4, 1, 1); r('#503ca0', 1, -4, 1, 1); r('#8a5a40', -1, -2, 2, 1);
      if (armor[0]) r(matCol(armor[0]), -4.5, -8.5, 9, 3); if (armor[1]) { r(matCol(armor[1]), -4.5, -.5, 9, 10); r(matCol(armor[1]), -8.5, -.5, 4, 5); r(matCol(armor[1]), 4.5, -.5, 4, 5); } if (armor[2]) r(matCol(armor[2]), -4.5, 9, 9, 10); if (armor[3]) r(matCol(armor[3]), -4.5, 20, 9, 4);
    }
    const matCol = s => { const m = IT[s.id].armor && IT[s.id].armor.mat; return m === 'leather' ? '#a0623a' : m === 'golden' ? '#f0d030' : m === 'diamond' ? '#33d8d0' : m === 'netherite' ? '#4f474f' : m === 'copper' ? '#c96a44' : m === 'turtle' ? '#3a8a3a' : '#c8c8c8'; };
    let showF3 = false, fps = 60, chatOpen = false, chatLog = [], chatHist = [], chatHi = -1, titleMsg = null;
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
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(hx, hy, 182, 22);
      g.fillStyle = 'rgba(130,130,130,.95)'; g.fillRect(hx, hy, 182, 1); g.fillRect(hx, hy + 21, 182, 1); g.fillRect(hx, hy, 1, 22); g.fillRect(hx + 181, hy, 1, 22);
      for (let i = 1; i < 9; i++) g.fillRect(hx + i * 20 + 1, hy + 1, 1, 20);
      const sx = hx - 1 + sel * 20;
      ring(sx, hy - 1, 24, 24, 1, '#000'); ring(sx + 1, hy, 22, 22, 2, '#e8e8e8'); ring(sx + 3, hy + 2, 18, 18, 1, '#000');
      for (let i = 0; i < 9; i++) drawItem(inv[i], hx + 3 + i * 20, hy + 3);
      if (offhand) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(hx - 29, hy, 22, 22); ring(hx - 29, hy, 22, 22, 1, '#828282'); drawItem(offhand, hx - 26, hy + 3); }
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
        const lines = ['Minecraft 26.3 (' + fps + ' fps, ' + W.cols.size + ' chunks)', 'XYZ: ' + P.x.toFixed(3) + ' / ' + (P.y - CFG.YOFF).toFixed(5) + ' / ' + P.z.toFixed(3), 'Block: ' + Math.floor(P.x) + ' ' + (Math.floor(P.y) - CFG.YOFF) + ' ' + Math.floor(P.z), 'Chunk: ' + (Math.floor(P.x) & 15) + ' ' + (Math.floor(P.y) & 15) + ' ' + (Math.floor(P.z) & 15) + ' in ' + (Math.floor(P.x) >> 4) + ' ' + (Math.floor(P.y) >> 4) + ' ' + (Math.floor(P.z) >> 4), 'Facing: ' + face, 'Light: ' + (L >> 4) + ' sky, ' + (L & 15) + ' block', 'Biome: minecraft:' + (B2.n || '').toLowerCase().replace(/ /g, '_'), 'Day ' + Math.floor(W.time / CFG.DAY) + ', time ' + Math.floor(W.time % CFG.DAY), 'Entities: ' + ENTS.length, 'Seed: ' + W.seed, NET.role ? 'Multiplayer: ' + NET.role + ' (' + (playersList().length) + ' players' + (NET.role === 'guest' ? ', ping ' + (api.net.rtt || 0) + ' ms' : '') + ')' : ''];
        if (HIT.b) { const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]]; lines.push('', 'Targeted Block: ' + HIT.x + ', ' + (HIT.y - CFG.YOFF) + ', ' + HIT.z, 'minecraft:' + t.id); for (const [k, vals] of t.props) lines.push(k + ': ' + vals[sv(s, k)]); }
        lines.forEach((l, i) => { if (!l) return; g.fillStyle = 'rgba(80,80,80,.5)'; g.fillRect(1, 1 + i * 9, tw(l) + 2, 9); text(l, 2, 2 + i * 9, '#e0e0e0', false); });
      }
      if (keys.has('Tab') && NET.role && !gui) { const pl = api.net.players || []; const w = 160, x = (GW - w) / 2; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, 10, w, 12 + pl.length * 10); pl.forEach((p, i) => { text(p.name + (p.host ? ' (host)' : ''), x + 4, 14 + i * 10, '#ffffff', false); if (p.ping) textR(p.ping + 'ms', x + w - 4, 14 + i * 10, '#80ff80', false); }); }
    }
