    let panoReady = false, panoA = 0, acc = 0, fpsN = 0, fpsT = 0, loadT0 = 0, selfE = null, handG = null, handArm = null, handItem = null, handId = -2, lightF = 0, rainP = null, flash = 0;
    const V3 = new THREE.Vector3(), V3b = new THREE.Vector3();
    const stopMusic = () => { };
    function burstAt(x, y, z, rgb, n) { for (let i = 0; i < n * 3; i++) particle(x, y + .2, z, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, rgb, .6, .08, 6); }
    P.name = myName();
    function remeshAll() { if (!W) return; FANCY = SET.fancy; W.cols.forEach(c => { if (c.meshed) for (let s = 0; s < NSEC; s++) if (c.s[s] || c.m[s]) { c.md[s] = 1; W.dirty.add(c); } }); }
    function resetPlayer() {
      Object.assign(P, { x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, fall: 0, fly: false, xp: 0, lvl: 0, score: 0, dead: false, sleeping: 0, effects: {}, fire: 0, absorb: 0, spawn: null, hurtT: 0, place: true, yaw: 0, pitch: 0 });
      inv = new Array(36).fill(null); armor = [null, null, null, null]; offhand = null; craft2.fill(null); craft3.fill(null); cursor = null; sel = 0; ender = new Array(27).fill(null);
      gui = null; mine = null; eating = null; drawing = null; attackHeld = useHeld = false; chatOpen = false;
    }
    function closeWorld() {
      if (!W) return;
      for (const e of ENTS.slice()) delEnt(e);
      RP.clear();
      for (const [k, c] of [...W.cols]) unloadCol(c, k);
      for (const w of W.workers) { try { w.w.terminate(); } catch (e) { } }
      W.workers = []; SCHED.clear(); SCHK.clear(); changes.length = 0; stopDisc();
      W = null; panoReady = false;
    }
    function openWorldObj(o) {
      closeWorld();
      W = makeWorld({ seed: o.seed, type: o.type });
      Object.assign(W, { id: o.id || null, name: o.name || 'World', folder: o.folder || o.name, mode: o.mode || 'survival', defMode: o.defMode || o.mode || 'survival', diff: o.diff ?? 2, hardcore: !!o.hardcore, cheats: !!o.cheats, rules: Object.assign(defRules(), o.rules || {}), time: o.time ?? 0, raining: !!o.raining, thunder: !!o.thunder, weatherT: o.weatherT || 12000 + ri(100000), dim: 'overworld', players: {}, remote: !!o.remote, pano: !!o.pano, created: o.created || Date.now(), visited: new Set(), bonus: !!o.bonus });
      W.spawn = Array.isArray(o.spawn) ? o.spawn : W.gen.spawn();
      hooks.onSet = onSetHook;
      hooks.colLoaded = colLoaded;
      resetPlayer();
      P.x = P.px = W.spawn[0]; P.y = P.py = W.spawn[1]; P.z = P.pz = W.spawn[2];
      P.name = NET.role ? P.name : myName();
      startWorkers();
      tickN = 0; simT = 0; acc = 0; loadT0 = performance.now(); NET.ready = !o.remote; FANCY = SET.fancy;
      if (!o.pano) { scr = 'loading'; loadMsg = 'Loading terrain...'; loadP = 0; }
      return W;
    }
    function startPano() {
      if (W) return;
      openWorldObj({ seed: 20260316, type: 'default', mode: 'spectator', pano: true, time: 6000 });
      scr = 'title';
    }
    function openWorld(id, host) {
      scr = 'loading'; loadMsg = 'Loading world...'; loadP = 0;
      Promise.all([kv('meta', 'get', id), kv('data', 'get', id)]).then(([m, d]) => {
        if (!m) { goWorlds(); return; }
        openWorldObj(Object.assign({}, m, { time: d ? d.time : 0, spawn: d && d.spawn }));
        restoreData(d);
        W.created = m.created;
        afterOpen(host);
      });
    }
    function createWorld(cfg, host) {
      const id = 'w' + Date.now().toString(36) + ri(1e6).toString(36), hc = cfg.mode === 'hardcore';
      openWorldObj({ id, name: cfg.name, seed: parseSeed(cfg.seed), type: cfg.type, mode: hc ? 'survival' : cfg.mode, defMode: hc ? 'survival' : cfg.mode, diff: hc ? 3 : cfg.diff, hardcore: hc, cheats: !hc && cfg.cheats, rules: cfg.rules, time: 0, bonus: cfg.bonus });
      loadMsg = 'Generating world...';
      saveNow();
      afterOpen(host);
    }
    function afterOpen(host) {
      if (host && NET.role !== 'host') startRoom({ host: () => { hostAfterOpen(); }, cancel: () => { } });
      else if (NET.role === 'host') NET.pendOpen = true;
    }
    function quitToTitle() {
      gui = null;
      const fin2 = () => { if (NET.role) leaveMP(); closeWorld(); scr = 'title'; startPano(); };
      if (W && !W.remote) { scr = 'loading'; loadMsg = 'Saving world'; saveNow().then(fin2, fin2); } else fin2();
    }
    function colLoaded(c) {
      if (!W || W.pano || W.remote) return;
      const k = ck(c.cx, c.cz);
      if (W.visited.has(k)) return;
      W.visited.add(k);
      if (W.edits.has(k) || RNG() > .1 || W.rules.doMobSpawning === false) return;
      const x = c.cx * 16 + 2 + ri(12), z = c.cz * 16 + 2 + ri(12);
      let y = -1;
      for (let s = c.top; s >= 0 && y < 0; s--) { const sec = c.s[s]; if (!sec) continue; for (let yy = 15; yy >= 0; yy--) { const b = sec[(x & 15) | (z & 15) << 4 | yy << 8]; if (b) { y = s * 16 + yy; break; } } }
      if (y < 0 || !isT(c.s[y >> 4][(x & 15) | (z & 15) << 4 | (y & 15) << 8], 'grass_block')) return;
      const B = W.gen.BIO[c.bio[(x & 15) | (z & 15) << 4]] || {};
      const types = B.td < .2 ? ['sheep', 'pig', 'chicken'] : ['sheep', 'pig', 'cow', 'chicken', 'sheep', 'cow'];
      const ty = types[ri(types.length)], n = 2 + ri(3);
      W.pendSpawn = W.pendSpawn || [];
      for (let i = 0; i < n; i++) W.pendSpawn.push([ty, x + .5 + (RNG() - .5) * 3, y + 1, z + .5 + (RNG() - .5) * 3]);
    }
    function flushPendSpawn() {
      if (!W.pendSpawn || !W.pendSpawn.length) return;
      const L = W.pendSpawn; W.pendSpawn = [];
      for (const [ty, x, y, z] of L) { const b = getS(Math.floor(x), Math.floor(y) - 1, Math.floor(z)); if (SOL[b] === 1 && getS(Math.floor(x), Math.floor(y), Math.floor(z)) === 0 || REP[getS(Math.floor(x), Math.floor(y), Math.floor(z))]) spawnMob(ty, x, y, z, { persist: true }); }
    }
    function streamChunks(budget) {
      const t0 = performance.now(), cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4, rd = W.pano ? Math.min(SET.rd, 5) : SET.rd, R = rd + 1;
      let req = 0;
      for (let r = 0; r <= R && req < 6 && W.wbusy < 8; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        if (dx * dx + dz * dz > (R + .5) * (R + .5)) continue;
        if (!W.cols.has(ck(cx0 + dx, cz0 + dz))) { requestGen(cx0 + dx, cz0 + dz); req++; if (req >= 6 || W.wbusy >= 8) break; }
      }
      if (W.genQ.size) genSync(Math.min(budget, 12));
      const cand = [];
      W.cols.forEach((c, k) => {
        const dx = c.cx - cx0, dz = c.cz - cz0, d = dx * dx + dz * dz;
        if (d > (rd + 3.5) * (rd + 3.5)) { unloadCol(c, k); return; }
        if (c.st === 1 || (c.st === 2 && !c.meshed && d <= (rd + .5) * (rd + .5))) cand.push([d, c]);
      });
      cand.sort((a, b) => a[0] - b[0]);
      for (const [, c] of cand) {
        if (performance.now() - t0 > budget) break;
        if (c.st === 1) { lightColumn(c); continue; }
        let ok = true;
        for (let dz = -1; dz <= 1 && ok; dz++) for (let dx = -1; dx <= 1 && ok; dx++) { const n = colAt(c.cx + dx, c.cz + dz); if (!n || n.st < 2) ok = false; }
        if (!ok) continue;
        for (let s = 0; s < NSEC; s++) { if (c.s[s]) { meshSection(c, s); setSecMesh(c, s); } }
        c.meshed = true; c.md.fill(0);
      }
      if (W.dirty.size) {
        const L = [...W.dirty].map(c => [(c.cx - cx0) ** 2 + (c.cz - cz0) ** 2, c]).sort((a, b) => a[0] - b[0]);
        for (const [, c] of L) {
          if (performance.now() - t0 > budget + 4) break;
          if (!W.cols.has(ck(c.cx, c.cz))) { W.dirty.delete(c); continue; }
          for (let s = 0; s < NSEC; s++) if (c.md[s]) { c.md[s] = 0; meshSection(c, s); setSecMesh(c, s); }
          W.dirty.delete(c);
        }
      }
    }
    function nearMeshed(r) {
      const cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4; let n = 0, t = 0;
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { t++; const c = colAt(cx0 + dx, cz0 + dz); if (c && c.meshed) n++; }
      return n / t;
    }
    function placeBonusChest() {
      if (!W.bonus || W.bonusDone) return;
      W.bonusDone = true;
      const x = Math.floor(P.x) + 2, z = Math.floor(P.z) + 1; let y = H - 2;
      while (y > 1 && !SOL[getS(x, y, z)]) y--;
      y++;
      setBlock(x, y, z, S('chest', { facing: 'south' }));
      initBlockEntity(x, y, z, TN.chest, null);
      const be = beAt(x, y, z, true); be.items = be.items || new Array(27).fill(null);
      const put = (n, c) => { if (IN[n]) { const i = ri(27); if (!be.items[i]) be.items[i] = { id: IN[n].idx, n: c, d: 0 }; else be.items[be.items.indexOf(null)] = { id: IN[n].idx, n: c, d: 0 }; } };
      put('stick', 12); put('oak_planks', 12); put('oak_log', 3); put('wooden_axe', 1); put('wooden_pickaxe', 1); put('apple', 5); put('bread', 3); put('salmon', 3);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!getS(x + dx, y, z + dz) && SOL[getS(x + dx, y - 1, z + dz)]) setBlock(x + dx, y, z + dz, S('torch'));
    }
    function trySpawnHostile(pl) {
      const a = RNG() * Math.PI * 2, d = 24 + RNG() * 40, x = Math.floor(pl.x + Math.cos(a) * d), z = Math.floor(pl.z + Math.sin(a) * d);
      const c = colAt(x >> 4, z >> 4); if (!c || !c.meshed) return;
      const y0 = Math.floor(pl.y);
      for (let k = 0; k < 6; k++) {
        const y = y0 - 24 + ri(48);
        if (y < 1 || y >= H - 3) continue;
        const fl = getS(x, y - 1, z);
        if (SOL[fl] !== 1 || getS(x, y, z) !== 0 || getS(x, y + 1, z) !== 0 || FLU[fl] || isT(fl, 'bedrock') && false) continue;
        const L = getL(x, y, z), bl = L & 15, sk = L >> 4, dark = Math.round((1 - sunB) * 11) + (W.thunder ? 5 : W.raining ? 3 : 0);
        if (bl > 0 || Math.max(0, sk - dark) > ri(8)) continue;
        const B = W.gen.BIO[bio(x, z)] || {};
        if (B.n === 'Mushroom Fields' || B.n === 'Deep Dark') return;
        const r = RNG(), ty = r < .24 ? 'zombie' : r < .48 ? 'skeleton' : r < .7 ? 'creeper' : r < .92 ? 'spider' : r < .97 ? 'enderman' : (y < CFG.YOFF + 40 && hash3(x >> 4, 7, z >> 4) < .1 || /Swamp/.test(B.n || '')) ? 'slime' : 'zombie';
        if (ty === 'spider' && (getS(x + 1, y, z) || getS(x - 1, y, z) || getS(x, y, z + 1))) return;
        if (ty === 'enderman' && getS(x, y + 2, z)) return;
        let dmin = 1e9; for (const p of playersList()) dmin = Math.min(dmin, (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2);
        if (dmin < 24 * 24) return;
        const n = ty === 'zombie' ? 1 + ri(3) : ty === 'enderman' ? 1 : 1 + ri(2);
        for (let i = 0; i < n; i++) { const xx = x + .5 + (i ? ri(3) - 1 : 0), zz = z + .5 + (i ? ri(3) - 1 : 0); if (SOL[getS(Math.floor(xx), y - 1, Math.floor(zz))] === 1 && !getS(Math.floor(xx), y, Math.floor(zz)) && !getS(Math.floor(xx), y + 1, Math.floor(zz))) spawnMob(ty, xx, y, zz, { size: ty === 'slime' ? [1, 2, 4][ri(3)] : undefined }); }
        return;
      }
    }
    function spawnTick() {
      if (W.rules.doMobSpawning === false || W.pano) return;
      const pls = playersList().filter(p => !p.dead && (p === P ? mode() !== 'spectator' : p.mode !== 'spectator'));
      if (!pls.length) return;
      if (W.diff > 0 && tickN % 4 === 0) {
        let n = 0; for (const e of ENTS) if (e.kind === 'mob' && MT[e.type].hostile) n++;
        if (n < CFG.HOSTILE_CAP * Math.min(3, pls.length)) trySpawnHostile(pls[ri(pls.length)]);
      }
      if (tickN % 400 === 0) {
        let n = 0; for (const e of ENTS) if (e.kind === 'mob' && !MT[e.type].hostile) n++;
        if (n < CFG.PASSIVE_CAP) {
          const pl = pls[ri(pls.length)], a = RNG() * 6.283, d = 24 + RNG() * 30, x = Math.floor(pl.x + Math.cos(a) * d), z = Math.floor(pl.z + Math.sin(a) * d), y = topY(x, z);
          if (y > 0 && isT(getS(x, y, z), 'grass_block') && (getL(x, y + 1, z) >> 4) >= 9 && !getS(x, y + 1, z)) { const ty = ['pig', 'cow', 'sheep', 'chicken'][ri(4)]; for (let i = 0; i < 2 + ri(2); i++) spawnMob(ty, x + .5 + ri(3) - 1, y + 1, z + .5 + ri(3) - 1, { persist: true }); }
        }
      }
    }
    function tickEnts() {
      for (const e of ENTS.slice()) {
        if (e.mirror || e.dead === 2) continue;
        const k = e.kind;
        if (k === 'mob') tickMob(e); else if (k === 'item') tickItem(e); else if (k === 'xp') tickXp(e); else if (k === 'fall') tickFall(e); else if (k === 'arrow') tickArrow(e); else if (k === 'thrown') tickThrown(e); else if (k === 'tnt') tickTNT(e);
      }
    }
    function weatherTick() {
      if (W.rules.doWeatherCycle === false) return;
      if (--W.weatherT > 0) return;
      if (W.raining) { W.raining = false; W.thunder = false; W.weatherT = 12000 + ri(168000); }
      else { W.raining = true; W.thunder = RNG() < .2; W.weatherT = 12000 + ri(12000); }
    }
    function tick() {
      tickN++;
      const host = NET.role !== 'guest';
      if (W.rules.doDaylightCycle !== false || !host) W.time++;
      if (host) weatherTick();
      if (P.dead) { deadT++; if (W.rules.doImmediateRespawn && deadT > 2 && !W.hardcore) respawn(); }
      tickPlayer();
      tickInteract();
      if (host) { tickEnts(); tickSched(); randomTicks(); tickFurnaces(); if (tickN % 2 === 0) checkPlates(); spawnTick(); if (W.pendSpawn) flushPendSpawn(); if (W.pendEnts && nearMeshed(1) >= 1) spawnSaved(); }
      tickMirrors();
      if (swingT >= 0 && ++swingT >= CFG.SWING_TICKS) swingT = -1;
      if (sel !== lastSel) { lastSel = sel; nameT = 50; equipT = 0; }
      if (equipT < 1) equipT = Math.min(1, equipT + .25);
      if (nameT > 0) nameT--;
      if (P.hurtT === 19 && !P.dead) { }
      netTick();
      musicTick();
      if (W.thunder && host && RNG() < 1 / 2000) { flash = 6; snd('thunder', P); }
      if (flash > 0) flash--;
      if (tickN % 900 === 0) saveNow();
      if (W.bonus && !W.bonusDone && tickN > 5) placeBonusChest();
    }
    function updTarget() {
      EX = lerp(P.px, P.x, lightF); EY = lerp(P.py, P.y, lightF) + P.eye; EZ = lerp(P.pz, P.z, lightF);
      let d;
      if (touch && aimT) { V3.set(aimT.nx, aimT.ny, .5).unproject(cam).sub(cam.position).normalize(); d = [V3.x, V3.y, V3.z]; EX = cam.position.x; EY = cam.position.y; EZ = cam.position.z; if (persp) { const ld = lookDir(); EX = lerp(P.px, P.x, lightF); EY = lerp(P.py, P.y, lightF) + P.eye; EZ = lerp(P.pz, P.z, lightF); d = ld; } }
      else d = lookDir();
      if (scr !== 'game' || P.dead) { HIT.b = false; HIT.ent = null; return; }
      raycast(EX, EY, EZ, d[0], d[1], d[2], reach(), false, mode() === 'spectator' ? null : ENTS, P);
    }
    function skyState() {
      const t = W.time % 24000, f0 = (t / 24000 - .25 + 1) % 1, ang = f0 + ((1 - (Math.cos(f0 * Math.PI) + 1) / 2) - f0) / 3;
      let b = clamp(Math.cos(ang * Math.PI * 2) * 2 + .5, 0, 1);
      const rain = W.raining ? 1 : 0;
      b *= 1 - rain * .3; if (W.thunder) b *= .7;
      return { ang, b };
    }
    const C1 = new THREE.Color(), C2 = new THREE.Color();
    function render(now, alpha) {
      const st = skyState(); sunB = st.b;
      lightF = alpha;
      U.sky.value = .27 + .73 * st.b; if (flash > 0) U.sky.value = 1;
      U.frame.value = Math.floor(now / 100) % 16;
      U.gam.value = SET.gam;
      const B = W.gen.BIO[bio(Math.floor(P.x), Math.floor(P.z))] || {};
      const tmp = clamp((B.t ?? .8) / 3, -1, 1), skyHue = .6222 - tmp * .05, skySat = .5 + tmp * .1;
      C1.setHSL(skyHue, skySat, .5 + .2 * 0).multiplyScalar(1);
      const top = new THREE.Color().setRGB(.47, .65, 1).lerp(C1.setHSL(skyHue, skySat, .62), .5).multiplyScalar(st.b);
      const fogc = new THREE.Color(.75, .85, 1).multiplyScalar(st.b * .94 + .06);
      if (W.raining) { const gy = top.r * .3 + top.g * .59 + top.b * .11; top.lerp(new THREE.Color(gy, gy, gy), .6); const fy = fogc.r * .3 + fogc.g * .59 + fogc.b * .11; fogc.lerp(new THREE.Color(fy, fy, fy), .5); }
      const cs = Math.cos(st.ang * Math.PI * 2), glow = cs > -.4 && cs < .4 ? (1 - Math.abs(cs) / .4) : 0;
      const sx = -Math.sin(st.ang * Math.PI * 2);
      skyU.sun.value.set(sx, Math.cos(st.ang * Math.PI * 2), 0); skyU.glowA.value = glow * .9; skyU.rain.value = W.raining ? 1 : 0;
      fogc.lerp(new THREE.Color(1, .55, .25), glow * .25 * (1 - (W.raining ? 1 : 0)));
      let fogN = SET.rd * 16 * .7, fogF = SET.rd * 16;
      const ex = lerp(P.px, P.x, alpha), ey = lerp(P.py, P.y, alpha) + lerp(P.eyeP, P.eye, alpha), ez = lerp(P.pz, P.z, alpha);
      const eb = getS(Math.floor(ex), Math.floor(ey), Math.floor(ez));
      P.eyeW = FLU[eb] === 1 && !W.pano; P.eyeL = FLU[eb] === 2 && !W.pano;
      if (P.eyeW) { const br = brAt(ex, ey, ez); fogc.setRGB(.05 * br, .16 * br, .5 * br); top.copy(fogc); fogN = 0; fogF = P.effects.waterBreathing ? 64 : 28; }
      else if (P.eyeL) { fogc.setRGB(.6, .1, 0); top.copy(fogc); fogN = 0; fogF = P.effects.fireRes ? 6 : 1.5; }
      else if (P.effects.blind) { fogc.setRGB(0, 0, 0); fogN = 0; fogF = 5; }
      skyU.top.value.copy(top); skyU.fog.value.copy(fogc); skyU.day.value = st.b;
      U.fogC.value.copy(fogc); U.fogN.value = fogN; U.fogF.value = fogF;
      starMat.opacity = clamp((1 - st.b * 1.4), 0, 1) * (W.raining ? 0 : 1) * .9;
      celest.rotation.set(0, 0, st.ang * Math.PI * 2); celest.position.set(ex, 0, ez);
      sunM.material.opacity = moonM.material.opacity = W.raining ? 0 : 1;
      sky.position.set(ex, ey, ez);
      cloudG.visible = SET.clouds && !P.eyeW;
      cloudG.position.set(Math.round(ex), CFG.CLOUD_Y, Math.round(ez));
      cloudU.off.value.set((W.time + alpha) * .03 - Math.round(ex) * 0 + 0, 0); cloudU.col.value.setScalar(.25 + st.b * .75); cloudU.far.value = Math.max(120, SET.rd * 24);
      clouds.position.set(0, 0, 0);
      let yaw = P.yaw, pitch = P.pitch;
      if (W.pano) { panoA += .0006; yaw = panoA; pitch = -.12; }
      let cx = ex, cy = ey, cz = ez;
      if (SET.bob && !P.fly && !W.pano && persp === 0) { const wb = lerp(P.walkP, P.walk, alpha), bb = lerp(P.bobP, P.bob, alpha); cx += Math.cos(yaw) * Math.sin(wb * Math.PI) * bb * .5; cy -= Math.abs(Math.cos(wb * Math.PI) * bb) * .6; cz -= Math.sin(yaw) * Math.sin(wb * Math.PI) * bb * .5; }
      if (P.sleeping && P.bedPos) { cy = P.bedPos[1] + .7; }
      if (persp && !W.pano) {
        const f = persp === 1 ? 1 : -1, cp = Math.cos(pitch), dx = Math.sin(yaw) * cp * f, dy = -Math.sin(pitch) * f, dz = Math.cos(yaw) * cp * f;
        let dist = 4;
        for (let t = .2; t <= 4; t += .1) { const px = cx + dx * t, py = cy + dy * t, pz = cz + dz * t; if (solidAt(Math.floor(px), Math.floor(py), Math.floor(pz)) && getB(Math.floor(px), Math.floor(py), Math.floor(pz)) >= 0) { dist = Math.max(.3, t - .3); break; } }
        cx += dx * dist; cy += dy * dist; cz += dz * dist;
        cam.position.set(cx, cy, cz); cam.rotation.set(persp === 1 ? pitch : -pitch, persp === 1 ? yaw : yaw + Math.PI, 0);
      } else { cam.position.set(cx, cy, cz); cam.rotation.set(pitch, yaw, 0); }
      if (P.shake > 0 && !W.pano) cam.rotation.z = Math.sin(P.shake * 1.3) * P.shake / 10 * .08;
      const fovT = SET.fov * (P.sprint && !P.eyeW ? 1.15 : 1) * (P.fly && P.sprint ? 1.05 : 1) * (drawing && held() && IT[held().id].bow ? 1 - Math.min(1, drawing.t / 20) * .15 : 1) * (P.eyeW ? .86 : 1) * (P.scope ? .1 : 1);
      if (Math.abs(cam.fov - fovT) > .05 || fovDirty) { cam.fov += (fovT - cam.fov) * .25; if (fovDirty) cam.fov = fovT; fovDirty = false; cam.updateProjectionMatrix(); }
      for (const e of ENTS) animEnt(e, e.mirror || e.kind === 'player' ? 1 : alpha);
      updSelf(alpha);
      updRain(now, ex, ey, ez);
      if (scr === 'game' && !P.dead && (HIT.b || HIT.ent) && !gui && !hideHud) {
        if (HIT.b) {
          const s = getS(HIT.x, HIT.y, HIT.z), L = selBoxes(s, HIT.x, HIT.y, HIT.z);
          let a = [1, 1, 1, 0, 0, 0]; for (const b of L) for (let i = 0; i < 3; i++) { a[i] = Math.min(a[i], b[i]); a[i + 3] = Math.max(a[i + 3], b[i + 3]); }
          outline.visible = true; outline.scale.set(a[3] - a[0] + .004, a[4] - a[1] + .004, a[5] - a[2] + .004); outline.position.set(HIT.x + (a[0] + a[3]) / 2, HIT.y + (a[1] + a[4]) / 2, HIT.z + (a[2] + a[5]) / 2);
        } else outline.visible = false;
      } else outline.visible = false;
      if (mine && mine.p > 0 && !gui) { crack.visible = true; crack.position.set(mine.x + .5, mine.y + .5, mine.z + .5); crackTex.offset.x = Math.min(9, Math.floor(mine.p * 10)) / 10; } else crack.visible = false;
      renderer.setRenderTarget(null);
      renderer.setClearColor(fogc, 1); renderer.clear();
      renderer.render(scene, cam);
      if (persp === 0 && !hideHud && scr === 'game' && mode() !== 'spectator' && !W.pano) { renderer.clearDepth(); updHand(alpha, ex, ey, ez); renderer.render(hScene, hCam); }
      updParticles(Math.min(.05, 1 / 60));
    }
    function updSelf(alpha) {
      if (!selfE || selfE.name !== P.name) { if (selfE) { scene.remove(selfE.root); } selfE = remotePlayer('self', P.name); const i = ENTS.indexOf(selfE); if (i >= 0) ENTS.splice(i, 1); entById.delete(selfE.id); selfE.tag.visible = false; selfE.walkD = 0; }
      const vis = persp > 0 && scr === 'game' && !W.pano && mode() !== 'spectator' && !P.dead;
      selfE.root.visible = vis;
      if (!vis) return;
      selfE.px = P.px; selfE.py = P.py; selfE.pz = P.pz; selfE.x = P.x; selfE.y = P.y; selfE.z = P.z;
      const sp = Math.min(1, Math.hypot(P.x - P.px, P.z - P.pz) * 4);
      if (selfE.lastT !== tickN) { selfE.lastT = tickN; selfE.limbAP = selfE.limbA; selfE.limbP = selfE.limb; selfE.limbA += (sp - selfE.limbA) * .4; selfE.limb += selfE.limbA * 1.2; selfE.pyaw = selfE.yaw; selfE.phyaw = selfE.hyaw; selfE.yaw = turn(selfE.yaw, P.yaw, sp > .1 ? .5 : .15); selfE.hyaw = P.yaw; }
      selfE.pitch = -P.pitch; selfE.sneak = P.sneak; selfE.swing = swingT >= 0 ? 6 - swingT : 0; selfE.hurtT = P.hurtT;
      const h = held(); setRemoteHeld(selfE, h ? h.id : -1);
      animEnt(selfE, alpha);
      selfE.tag.visible = false;
    }
    function updHand(alpha, ex, ey, ez) {
      if (!handG) {
        handG = new THREE.Group(); hScene.add(handG);
        const sk = playerSkinTex(P.name), mat = new THREE.MeshBasicMaterial({ map: sk.t || sk, vertexColors: true, alphaTest: .1, toneMapped: false });
        const md = instModel(sk.alex ? 'alex' : 'steve', mat); handArm = md.parts.rarm; md.root.remove(handArm); handArm.position.set(0, 0, 0); handArm.rotation.set(0, 0, 0); handArm.userData.mat = mat;
        const holder = new THREE.Group(); holder.add(handArm); handG.add(holder); handG.userData.holder = holder;
      }
      const h = held(), id = h ? h.id : -1, br = brAt(ex, ey - .2, ez);
      if (id !== handId) { if (handItem) { handG.remove(handItem); handItem = null; } handId = id; if (id >= 0) { handItem = itemMesh(id, isFlat(id) ? .32 : .28); handG.add(handItem); } }
      const holder = handG.userData.holder;
      const sw = swingT >= 0 ? (swingT + alpha) / CFG.SWING_TICKS : 0, sq = Math.sqrt(sw), eq = (1 - equipT) * .6;
      const sx = -.4 * Math.sin(sq * Math.PI), sy = .2 * Math.sin(sq * Math.PI * 2), sz = -.2 * Math.sin(sw * Math.PI);
      const bobY = SET.bob ? -Math.abs(Math.cos(lerp(P.walkP, P.walk, alpha) * Math.PI) * lerp(P.bobP, P.bob, alpha)) * .1 : 0;
      const eatB = eating && eating.t > 0 ? Math.abs(Math.cos(eating.t / 4 * Math.PI)) * .1 : 0;
      handG.position.set(0, bobY, 0);
      if (handItem) {
        holder.visible = false; handItem.visible = true;
        const flat = isFlat(id), it = IT[id];
        handItem.material.color.setScalar(br);
        if (eating) { handItem.position.set(.3 + sx * .2, -.35 + eatB - eq, -.6); handItem.rotation.set(-.3, -.6, .3); }
        else if (drawing && (it.bow || it.crossbow)) { handItem.position.set(.2, -.3, -.6); handItem.rotation.set(0, -1.3, -.4); }
        else if (shielding && it.shield) { handItem.position.set(.15, -.35, -.55); handItem.rotation.set(0, -.2, 0); }
        else if (flat) { handItem.position.set(.46 + sx, -.26 + sy - eq, -.75 + sz); handItem.rotation.set(-sw * 1.2 + .1, -1.45 + Math.sin(sq * Math.PI) * .4, .45); }
        else { handItem.position.set(.46 + sx, -.3 + sy - eq, -.78 + sz); handItem.rotation.set(-sw * 1.2, .785 + Math.sin(sq * Math.PI) * .4, 0); }
      } else {
        holder.visible = true;
        handArm.userData.mat.color.setScalar(br);
        holder.position.set(.72 + sx * .8, -.72 + sy * .5 - eq, -.5 + sz);
        holder.rotation.set(2.1 - Math.sin(sq * Math.PI) * .5, .5 + Math.sin(sq * Math.PI) * .4, .1, 'YXZ');
      }
    }
    function updRain(now, ex, ey, ez) {
      const on = W.raining && !W.pano && SET.particles > 0;
      if (!rainP) {
        const N = 900, gq = new THREE.BufferGeometry(), pos = new Float32Array(N * 6);
        gq.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        rainP = new THREE.LineSegments(keep(gq), keep(new THREE.LineBasicMaterial({ color: 0x8aa0c8, transparent: true, opacity: .5, depthWrite: false })));
        rainP.frustumCulled = false; rainP.userData.d = Array.from({ length: N }, () => [RNG() * 32 - 16, RNG() * 28 - 10, RNG() * 32 - 16, .7 + RNG() * .4]);
        scene.add(rainP);
      }
      rainP.visible = on;
      if (!on) return;
      const pos = rainP.geometry.attributes.position.array, D = rainP.userData.d;
      const B = W.gen.BIO[bio(Math.floor(ex), Math.floor(ez))] || {};
      const snow = (B.t ?? .8) < .15, dry = (B.r ?? .5) <= 0 || B.dry;
      rainP.material.color.setHex(snow ? 0xffffff : 0x8aa0c8);
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        d[1] -= snow ? .05 : d[3] * .9;
        if (d[1] < -10) { d[1] += 28; d[0] = RNG() * 32 - 16; d[2] = RNG() * 32 - 16; }
        const x = Math.floor(ex) + d[0], y = Math.floor(ey) + d[1], z = Math.floor(ez) + d[2];
        const open = !dry && (getL(Math.floor(x), Math.floor(y), Math.floor(z)) >> 4) === 15 && !solidAt(Math.floor(x), Math.floor(y), Math.floor(z));
        const o = i * 6, ln = open ? (snow ? .08 : .7) : 0;
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; pos[o + 3] = x + (snow ? .06 : 0); pos[o + 4] = y + ln; pos[o + 5] = z;
      }
      rainP.geometry.attributes.position.needsUpdate = true;
      if (!snow && !dry && tickN % 8 === 0 && RNG() < .3 && SET.sound) snd('rain', P);
    }
    let lastNow = 0;
    function frameLoop(dt0, now) {
      const dt = lastNow ? clamp((now - lastNow) / 1000, 0, .25) : dt0; lastNow = now;
      frameN++;
      if (frameN % 15 === 1) resize();
      fpsN++; fpsT += dt; if (fpsT >= 1) { fps = fpsN; fpsN = 0; fpsT = 0; }
      if (!W && (scr === 'title')) startPano();
      touchTick();
      let alpha = 1;
      if (W) {
        const loading = scr === 'loading' || scr === 'waiting';
        streamChunks(loading ? 24 : 7);
        if (W.pano) { if (!panoReady && nearMeshed(2) >= 1) { panoReady = true; const t = topY(Math.floor(P.x), Math.floor(P.z)); let m = t; for (let dz = -6; dz <= 6; dz += 3) for (let dx = -6; dx <= 6; dx += 3) m = Math.max(m, topY(Math.floor(P.x) + dx, Math.floor(P.z) + dz)); P.y = P.py = m + 3 - P.eye; } }
        else if (scr === 'loading') {
          if (NET.role === 'guest' && !NET.ready) loadP = Math.max(loadP, .1);
          else {
            const p = nearMeshed(2); loadP = .5 + p * .5; loadMsg = W.remote ? 'Loading terrain...' : loadMsg;
            if (p >= 1 || performance.now() - loadT0 > 20000) {
              scr = 'game'; panoReady = false; P.name = NET.role ? P.name : myName();
              if (NET.pendOpen || NET.role === 'host') { NET.pendOpen = false; hostAfterOpen(); }
              if (W.mode === 'spectator') P.fly = true;
              chatSys(W.remote ? 'Joined ' + W.name : '', '#ffffff'); chatLog.pop();
            }
          }
        }
        if (scr === 'game') {
          const paused = !NET.role && (gui === 'pause' || gui === 'options' || gui === 'controls');
          if (!paused) { acc += Math.min(dt, .25); let n = 0; while (acc >= .05 && n < 5) { tick(); acc -= .05; n++; } if (n >= 5) acc = 0; }
          alpha = paused ? 1 : clamp(acc / .05, 0, 1);
          lightF = alpha;
          if (!gui && !chatOpen) updTarget(); else { HIT.b = false; HIT.ent = null; }
        }
        const show3d = scr === 'game' || scr === 'title' && W.pano;
        if (show3d) render(now, alpha);
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, hud.width, hud.height);
      g.imageSmoothingEnabled = false;
      g.setTransform(GK, 0, 0, GK, 0, 0);
      btns = []; fields = []; sliders = [];
      if (!W || !(scr === 'game' || scr === 'title' && W.pano)) { renderer.setClearColor(0, 1); renderer.clear(); }
      if (scr === 'game' && W) {
        if (!hideHud || gui) {
          if (!hideHud) { drawHUD(now); drawChat(now); }
          if (touch && !gui && !hideHud && !P.dead) drawTouch();
          if (!touch && !gui && !locked() && !freeMouse && !chatOpen && !P.dead && !P.sleeping) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, GH / 2 + 14, GW, 14); textC('Click to play', GW / 2, GH / 2 + 17, '#ffffff'); }
          try { drawGameGui(now); } catch (e) { if (!frameLoop.gerr) { frameLoop.gerr = 1; if (window.console) console.error(e); } gui = null; }
        }
        if (W.rules.showCoordinates && !showF3 && !hideHud) text('XYZ: ' + Math.floor(P.x) + ' / ' + Math.floor(P.y - CFG.YOFF) + ' / ' + Math.floor(P.z), 2, 2, '#ffffff');
      } else drawScreen(now);
      if (focusKey && !fields.some(f => f.key === focusKey) && focusKey !== 'sign') blurField();
      else if (focusKey) { const f = fields.find(q => q.key === focusKey); if (f) { const k = cssW / hud.width * GK; inp.style.left = f.x * k + 'px'; inp.style.top = f.y * k + 'px'; inp.style.width = f.w * k + 'px'; inp.style.height = f.h * k + 'px'; } }
      if (focusKey === 'chat') FIELDV.chat = inp.value;
    }
    wrap.__mc = () => ({ scr, gui, GK, GW, GH, pRect, chatOpen, btns: btns.map(b => [b.l, b.x, b.y, b.w, b.h, b.en]), P: { x: P.x, y: P.y, z: P.z, hp: P.hp, food: P.food, yaw: P.yaw, pitch: P.pitch }, ents: (() => { const o = {}; for (const e of ENTS) { const k = e.kind + ':' + (e.type || (e.st ? IT[e.st.id].id : '')); o[k] = (o[k] || 0) + 1; } return o; })(), keysDown: [...keys], focus: focusKey, mobs: ENTS.filter(e => e.kind === 'mob').map(e => [e.type, +e.x.toFixed(1), +(e.y - CFG.YOFF).toFixed(1), +e.z.toFixed(1), e.root.visible, e.hp, !!e.dead, e.root.parent ? 1 : 0]), fps, cols: W ? W.cols.size : 0, mode: W && W.mode, role: NET.role, time: W && W.time, chat: chatLog.slice(-8).map(c => c.m), hit: HIT.b ? [HIT.x, HIT.y, HIT.z] : null, sel, inv: inv.map(s => s && IT[s.id].id + 'x' + s.n), slots: slots.map(q => { const v = q.get(); return [q.g, q.i, q.x, q.y, v ? IT[v.id].id + 'x' + v.n : null]; }), cursor: cursor && IT[cursor.id].id + 'x' + cursor.n });
    resize();
    api.loop((dt, now) => { try { frameLoop(dt, now); } catch (e) { if (!frameLoop.err) { frameLoop.err = 1; if (window.console) console.error(e); } } });
    const sizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
    if (sizeObs) sizeObs.observe(wrap);
    setTimeout(() => { try { buildIcons(); } catch (e) { if (window.console) console.error(e); } }, 0);
    return () => {
      try { saveNow(); } catch (e) { }
      if (sizeObs) sizeObs.disconnect();
      try { if (NET.role) api.net.close(); } catch (e) { }
      try { closeWorld(); } catch (e) { }
      if (WSRC) { try { URL.revokeObjectURL(WSRC); } catch (e) { } WSRC = null; }
      stopDisc();
      if (locked()) try { document.exitPointerLock(); } catch (e) { }
      for (const o of trash) { try { o.dispose(); } catch (e) { } }
      try { if (AC) AC.close(); } catch (e) { }
    };
  }
