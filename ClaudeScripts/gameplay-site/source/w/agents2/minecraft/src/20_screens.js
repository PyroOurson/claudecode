    let worldsMeta = [], worldsLoaded = false, selWorld = -1, wScroll = 0, mpMode = null, loadMsg = '', loadP = 0, discMsg = '', confirmDel = null, optBack = 'title', ctrlWait = null, ctrlScroll = 0;
    let sliders = [], activeSlider = null;
    const GMODES = ['survival', 'hardcore', 'creative', 'adventure'], GMN = { survival: 'Survival', hardcore: 'Hardcore', creative: 'Creative', adventure: 'Adventure', spectator: 'Spectator' };
    const DIFFN = ['Peaceful', 'Easy', 'Normal', 'Hard'], WTYPES = ['default', 'flat', 'large', 'amplified'], WTN = { default: 'Default', flat: 'Superflat', large: 'Large Biomes', amplified: 'Amplified' };
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
      textC(label, x + w / 2, y + (h - 8) / 2, '#e0e0e0');
      sliders.push({ x, y, w, h, set });
    }
    function drawTitleBg() {
      if (!panoReady) drawDirt(0);
      else { const gr = g.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(0, 0, GW, GH); }
    }
    function drawLogo(y) {
      const lw = Math.min(GW - 20, 274), k = lw / LOGO.width, lh = LOGO.height * k, lx = (GW - lw) / 2;
      g.drawImage(LOGO, lx, y, lw, lh);
      const ew = Math.min(lw * .45, 100), eh = ew * EDITION.height / EDITION.width;
      g.drawImage(EDITION, (GW - ew) / 2, y + lh - 4, ew, eh);
      textC('JAVA EDITION', GW / 2, y + lh - 4 + (eh - 8) / 2, '#f0d8a8', true);
      return y + lh + eh;
    }
    function drawTitle(now) {
      drawTitleBg();
      const by = Math.max(drawLogo(Math.max(8, GH / 4 - 50 | 0)) + 12, GH / 4 + 36 | 0);
      g.save(); g.translate(GW / 2 + Math.min(130, GW / 2 - 40), Math.max(50, GH / 4 - 4)); g.rotate(-20 * Math.PI / 180);
      const sc = 1.8 - Math.abs(Math.sin((now % 1000) / 1000 * Math.PI * 2)) * .1, sw2 = tw(SPLASH);
      const k = Math.min(sc, (GW / 2 - 10) / Math.max(1, sw2)); g.scale(k, k); textC(SPLASH, 0, -4, '#ffff00'); g.restore();
      const step = touch ? 28 : 24;
      button(GW / 2 - 100, by, 200, 20, 'Singleplayer', () => { mpMode = null; goWorlds(); });
      button(GW / 2 - 100, by + step, 200, 20, ['Multiplayer (LAN / Online)', 'Multiplayer'], () => { scr = 'mp'; FIELDV.uname = FIELDV.uname || (validName(loadProfile().username) ? loadProfile().username : ''); });
      button(GW / 2 - 100, by + step * 2 + 12, 98, 20, 'Options...', () => { optBack = 'title'; scr = 'options'; });
      button(GW / 2 + 2, by + step * 2 + 12, 98, 20, 'Controls...', () => { optBack = 'title'; scr = 'controls'; });
      const l1 = 'Minecraft Java Edition 26.3', l2 = 'Fan remake. Not an official Minecraft product.';
      if (tw(l1) + tw(l2) + 12 < GW) { text(l1, 2, GH - 10, '#ffffff'); textR(l2, GW - 2, GH - 10, '#ffffff'); }
      else { text(l1, 2, GH - 20, '#ffffff'); textR(tw(l2) < GW - 4 ? l2 : 'Not an official Minecraft product.', GW - 2, GH - 10, '#ffffff'); }
    }
    function goWorlds() { scr = 'worlds'; selWorld = -1; wScroll = 0; worldsLoaded = false; listWorlds().then(l => { worldsMeta = l; worldsLoaded = true; if (l.length) selWorld = 0; }); }
    function drawWorlds() {
      drawDirt(0);
      textC(mpMode === 'host' ? 'Select World to Host' : 'Select World', GW / 2, 8, '#ffffff');
      const top = 24, bot = GH - (touch ? 64 : 56), rowH = 36, lw = Math.min(270, GW - 20), lx = (GW - lw) >> 1;
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, top, GW, bot - top);
      g.fillStyle = '#000'; g.fillRect(0, top, GW, 1); g.fillRect(0, bot - 1, GW, 1);
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
    function playSel() { const w = worldsMeta[selWorld]; if (!w) return; openWorld(w.id, mpMode === 'host'); }
    function drawDelete() {
      drawDirt(0);
      textC('Are you sure you want to delete this world?', GW / 2, GH / 2 - 40, '#ffffff');
      textC("'" + (confirmDel ? confirmDel.name : '') + "' will be lost forever! (A long time!)", GW / 2, GH / 2 - 26, '#a0a0a0');
      button(GW / 2 - 154, GH / 2 + 10, 150, 20, 'Delete', () => { const w = confirmDel; confirmDel = null; deleteWorld(w.id).then(goWorlds); });
      button(GW / 2 + 4, GH / 2 + 10, 150, 20, 'Cancel', () => { scr = 'worlds'; });
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
        cycleBtn(x0, y, W2, 'Game Mode', GMN[CW.mode], () => { CW.mode = GMODES[(GMODES.indexOf(CW.mode) + 1) % GMODES.length]; if (CW.mode === 'hardcore') CW.diff = 3; CW.cheats = CW.mode === 'creative'; });
        const desc = { survival: 'Search for resources, craft, gain levels, health and hunger', hardcore: 'Same as Survival Mode, locked at hardest difficulty, and one life only', creative: 'Unlimited resources, free flying and destroy blocks instantly', adventure: 'Play maps made by others: blocks cannot be broken or placed freely' }[CW.mode];
        wrapText(desc, W2).forEach((l, i) => text(l, x0, y + 22 + i * 9, '#a0a0a0')); y += 44;
        cycleBtn(x0, y, W2, 'Difficulty', DIFFN[CW.diff], () => { CW.diff = (CW.diff + 1) % 4; }, CW.mode !== 'hardcore'); y += step;
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
      button(GW / 2 - 154, yb, 150, 20, 'Create New World', () => { CW.name = (FIELDV.wname || '').trim() || 'New World'; CW.seed = FIELDV.wseed || ''; createWorld(CW, mpMode === 'host'); });
      button(GW / 2 + 4, yb, 150, 20, 'Cancel', () => { blurField(); goWorlds(); });
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
      put((x, yy) => slider(x, yy, cw2, 'Render Distance: ' + SET.rd + ' chunks', (SET.rd - 2) / 10, f => { SET.rd = Math.round(2 + f * 10); }));
      put((x, yy) => slider(x, yy, cw2, 'Brightness: ' + (SET.gam === 0 ? 'Moody' : SET.gam === 1 ? 'Bright' : Math.round(SET.gam * 100) + '%'), SET.gam, f => { SET.gam = Math.round(f * 20) / 20; U.gam.value = SET.gam; }));
      put((x, yy) => slider(x, yy, cw2, 'Sensitivity: ' + Math.round(SET.sens * 100) + '%', (SET.sens - .1) / 2.9, f => { SET.sens = Math.round((.1 + f * 2.9) * 20) / 20; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Graphics: ' + (SET.fancy ? 'Fancy' : 'Fast'), () => { SET.fancy = !SET.fancy; FANCY = SET.fancy; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'GUI Scale: ' + (SET.gui ? SET.gui : 'Auto'), () => { SET.gui = (SET.gui + 1) % 5; resize(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Clouds: ' + (SET.clouds ? 'Fancy' : 'OFF'), () => { SET.clouds = !SET.clouds; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Particles: ' + ['Minimal', 'Decreased', 'All'][SET.particles], () => { SET.particles = (SET.particles + 1) % 3; }));
      put((x, yy) => button(x, yy, cw2, 20, 'View Bobbing: ' + (SET.bob ? 'ON' : 'OFF'), () => { SET.bob = !SET.bob; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Smooth Lighting: ' + (SET.smooth ? 'ON' : 'OFF'), () => { SET.smooth = !SET.smooth; remeshAll(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Music: ' + (SET.music ? 'ON' : 'OFF'), () => { SET.music = !SET.music; if (!SET.music) stopMusic(); }));
      put((x, yy) => button(x, yy, cw2, 20, 'Sounds: ' + (SET.sound ? 'ON' : 'OFF'), () => { SET.sound = !SET.sound; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Controls...', () => { if (inGame) gui = 'controls'; else scr = 'controls'; }));
      put((x, yy) => button(x, yy, cw2, 20, 'Difficulty: ' + (W && inGame ? DIFFN[W.diff] : '-'), () => { if (W && !W.hardcore && NET.role !== 'guest') { W.diff = (W.diff + 1) % 4; if (W.diff === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); } }, !!(inGame && W && !W.hardcore && NET.role !== 'guest')));
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
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      textC('Game Menu', GW / 2, Math.max(10, GH / 4 - 32), '#ffffff');
      const y = Math.max(26, GH / 4 - 16 | 0), step = touch ? 28 : 24;
      button(GW / 2 - 102, y, 204, 20, 'Back to Game', () => closeGui());
      button(GW / 2 - 102, y + step, 100, 20, 'Options...', () => { gui = 'options'; });
      const host = NET.role === 'host', guest = NET.role === 'guest';
      button(GW / 2 + 2, y + step, 100, 20, host ? ['Invite Players', 'Invite'] : 'Open to LAN', () => { openToLan(); }, !guest);
      button(GW / 2 - 102, y + step * 2, 204, 20, 'Player List' + (NET.role ? ' (' + playersList().length + ')' : ''), () => { gui = 'plist'; }, !!NET.role);
      button(GW / 2 - 102, y + step * 3 + 8, 204, 20, guest ? 'Disconnect' : 'Save and Quit to Title', () => { quitToTitle(); });
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
      g.fillStyle = 'rgba(120,0,0,.45)'; g.fillRect(0, 0, GW, GH);
      textC(W.hardcore ? 'Game Over!' : 'You Died!', GW / 2, GH / 4 - 10, '#ffffff', true, 2);
      if (P.deathMsg) textC(P.deathMsg, GW / 2, GH / 4 + 16, '#ffffff');
      textC('Score: ', GW / 2 - tw(String(P.scoreAtDeath || 0)) / 2, GH / 4 + 30, '#ffffff'); text(String(P.scoreAtDeath || 0), GW / 2 + tw('Score: ') / 2 - tw(String(P.scoreAtDeath || 0)) / 2, GH / 4 + 30, '#ffff55');
      const en = deadT > 20, y = GH / 4 + 56;
      if (W.hardcore) button(GW / 2 - 100, y, 200, 20, 'Spectate World', () => { respawn(); }, en);
      else button(GW / 2 - 100, y, 200, 20, 'Respawn', () => { respawn(); }, en);
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
      else if (gui === 'dead') drawDead();
      else if (gui === 'sign') drawSign();
      else if (INVG.has(gui)) drawInv(now);
    }
