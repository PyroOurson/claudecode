    const ADV = [
      ['root', 'Minecraft', 'The heart and story of the game', 'grass_block', 0, 1, null, () => has('crafting_table')],
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
        text('Advancement Made!', x + 30, y + 7, '#ffff00', false);
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
      text('Minecraft', wx + 8, wy + 6, '#404040', false);
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
