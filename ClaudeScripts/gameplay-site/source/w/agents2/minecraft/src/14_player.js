    const P = { x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, w: CFG.PW, h: CFG.PH, onGround: false, collH: false, yaw: 0, pitch: 0, fall: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, regenT: 0, hurtT: 0, shake: 0, sprint: false, sneak: false, fly: false, jumpT: 0, xp: 0, lvl: 0, score: 0, walk: 0, walkP: 0, nextStep: 1, bob: 0, bobP: 0, eye: CFG.EYE, eyeP: CFG.EYE, eyeW: false, place: false, hit: true, kind: 'self', fire: 0, absorb: 0, spawn: null, swimT: 0, atkT: 0, dead: false, sleeping: 0, effects: {}, lastHurt: 0, lastDmg: 0, climbing: false, inLava: false, kbT: 0 };
    let inv = new Array(36).fill(null), armor = [null, null, null, null], offhand = null, craft2 = new Array(4).fill(null), craft3 = new Array(9).fill(null), cursor = null, sel = 0, ender = new Array(27).fill(null);
    let scr = 'title', gui = null, guiKey = null, tickN = 0, frameN = 0, sunB = 1, deadT = 0;
    let attackHeld = false, useHeld = false, breakCd = 0, useCd = 0, mine = null, swingT = -1, eating = null, drawing = null, equipT = 1, nameT = 0, lastSel = -1, sprintTap = 0, sprintKey = false, shielding = false;
    let tJump = false, tSneak = false;
    const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
    const mode = () => W ? W.mode : 'survival';
    const creative = () => W && W.mode === 'creative';
    const canBuild = () => W && (W.mode === 'survival' || W.mode === 'creative');
    const held = () => inv[sel];
    const playersList = () => { const l = W && W.dead !== true && !P.dead ? [P] : []; for (const e of ENTS) if (e.kind === 'player' && e.y > -500) l.push(e); return l; };
    const ST = (id, n, d) => ({ id, n: n || 1, d: d || 0 });
    const sameSt = (a, b) => a && b && a.id === b.id && (a.d || 0) === (b.d || 0) && JSON.stringify(a.x || null) === JSON.stringify(b.x || null);
    function giveItem(s, silent) {
      const ms = IT[s.id].stack;
      let n = s.n;
      for (let pass = 0; pass < 2 && n > 0; pass++) {
        const order = [];
        for (let i = 0; i < 9; i++) order.push(i);
        for (let i = 9; i < 36; i++) order.push(i);
        if (pass === 0) order.unshift(sel);
        for (const i of order) {
          if (n <= 0) break;
          const t = inv[i];
          if (pass === 0 && t && sameSt(t, s) && ms > 1 && t.n < ms) { const m = Math.min(ms - t.n, n); t.n += m; n -= m; }
          else if (pass === 1 && !t) { const m = Math.min(ms, n); inv[i] = { id: s.id, n: m, d: s.d || 0, x: s.x }; n -= m; }
        }
      }
      void silent;
      return n;
    }
    const giveOrDrop = s => { const left = giveItem(s); if (left > 0) throwStack({ id: s.id, n: left, d: s.d, x: s.x }, false); };
    function throwStack(s, far) {
      const cp = Math.cos(P.pitch), sp = far ? .3 : .1;
      spawnItem(s, P.x, P.y + P.eye - .3, P.z, -Math.sin(P.yaw) * cp * sp + (RNG() - .5) * .02, Math.sin(P.pitch) * sp + .1, -Math.cos(P.yaw) * cp * sp + (RNG() - .5) * .02, 40);
    }
    const exhaust = v => { if (mode() === 'survival' || mode() === 'adventure') P.exh = Math.min(40, P.exh + v); };
    const xpNeed = l => l >= 30 ? 112 + (l - 30) * 9 : l >= 15 ? 37 + (l - 15) * 5 : 7 + l * 2;
    function addXp(n) {
      if (n <= 0) return;
      P.score += n; P.xp += n;
      let need = xpNeed(P.lvl);
      while (P.xp >= need) { P.xp -= need; P.lvl++; need = xpNeed(P.lvl); if (P.lvl % 5 === 0) snd('levelup'); }
      snd('orb'); api.score(P.score);
    }
    function armorPts() { let d = 0, t = 0; for (const a of armor) if (a) { const A = IT[a.id].armor; if (A) { d += A.def; t += A.tough; } } return [d, t]; }
    function damageArmor(dmg) { const n = Math.max(1, Math.floor(dmg / 4)); for (let i = 0; i < 4; i++) { const a = armor[i]; if (!a || !IT[a.id].dur) continue; a.d += n; if (a.d >= IT[a.id].dur) { armor[i] = null; snd('tbreak'); } } }
    function hurtPlayer(d, sx, sz, kind) {
      if (P.dead || scr !== 'game' || d < 0) return;
      const md = mode();
      if ((md === 'creative' || md === 'spectator') && kind !== 'void') return;
      if (kind === 'mob' || kind === 'arrow' || kind === 'player') { if (W.diff === 0) d = 0; }
      if (P.hurtT > 10 && kind !== 'void' && kind !== 'starve' && kind !== 'drown') { if (d <= P.lastDmg) return; d -= P.lastDmg; }
      if (shielding && (kind === 'mob' || kind === 'arrow' || kind === 'explosion' || kind === 'player') && sx != null) { const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), dx = sx - P.x, dz = sz - P.z; if (fx * dx + fz * dz > 0) { snd('shield'); if (offhand && IN.shield && offhand.id === IN.shield.idx) offhand.d++; else if (held() && held().id === IN.shield.idx) held().d++; if (sx != null) { const l = Math.hypot(dx, dz) || 1; P.vx -= dx / l * .3; P.vz -= dz / l * .3; } return; } }
      const bypass = kind === 'fall' || kind === 'drown' || kind === 'starve' || kind === 'void' || kind === 'fire' || kind === 'lava' || kind === 'magic' || kind === 'suffocate';
      if (!bypass && kind !== 'anvil') { const [def, tough] = armorPts(); if (def) { const red = Math.min(20, Math.max(def / 5, def - d / (2 + tough / 4))); d = d * (1 - red / 25); damageArmor(d); } }
      if (kind === 'fall') { const hb = held(); void hb; }
      d = Math.max(0, d);
      if (P.absorb > 0) { const a = Math.min(P.absorb, d); P.absorb -= a; d -= a; }
      P.lastDmg = d + (P.lastDmg && P.hurtT > 10 ? P.lastDmg : 0);
      if (d <= 0 && kind !== 'void') { if (sx != null) knock(sx, sz); return; }
      P.hp -= d; P.hurtT = 20; P.shake = 10; exhaust(CFG.EXH_HURT);
      if (sx != null) knock(sx, sz);
      snd(kind === 'fall' && d > 4 ? 'fall_big' : kind === 'fall' ? 'fall_small' : 'hurt');
      P.lastKind = kind;
      if (P.hp <= 0) {
        const tot = (s => s && s.id === IN.totem_of_undying.idx);
        if (tot(held()) || tot(offhand)) { if (tot(held())) inv[sel] = null; else offhand = null; P.hp = 1; P.absorb = 4; P.effects.regen = 900; for (let i = 0; i < 40; i++) particle(P.x, P.y + 1, P.z, (RNG() - .5) * 4, RNG() * 4, (RNG() - .5) * 4, [RNG() < .5 ? 240 : 120, 220, 60], 1.2, .08, 4, 1); snd('totem'); chatSys(P.name + ' used a Totem of Undying'); return; }
        die(kind);
      }
    }
    function knock(sx, sz) { const dx = P.x - sx, dz = P.z - sz, l = Math.hypot(dx, dz) || 1; P.vx = P.vx / 2 + dx / l * .4; P.vz = P.vz / 2 + dz / l * .4; P.vy = Math.min(.4, P.vy / 2 + .4); }
    const DEATHMSG = { fall: 'fell from a high place', drown: 'drowned', starve: 'starved to death', void: 'fell out of the world', fire: 'burned to death', lava: 'tried to swim in lava', mob: 'was slain', arrow: 'was shot by Skeleton', explosion: 'blew up', suffocate: 'suffocated in a wall', cactus: 'was pricked to death', anvil: 'was squashed by a falling anvil', magic: 'was killed by magic', player: 'was slain by a player', freeze: 'froze to death' };
    function die(kind) {
      if (P.dead) return;
      P.dead = true; P.hp = 0; deadT = 0; P.sprint = false; attackHeld = useHeld = false; eating = null; mine = null; drawing = null;
      const msg = (P.name || 'Player') + ' ' + (DEATHMSG[kind] || 'died');
      chatSys(msg); netSend({ t: 'chat', s: 1, m: msg });
      P.deathMsg = msg; P.scoreAtDeath = P.score;
      if (W.rules.keepInventory !== true && mode() !== 'creative') {
        for (const arr of [inv, armor, craft2, craft3]) for (let i = 0; i < arr.length; i++) if (arr[i]) { const s = arr[i]; arr[i] = null; spawnItem(s, P.x, P.y + 1, P.z, (RNG() - .5) * .5, .2 + RNG() * .2, (RNG() - .5) * .5, 40); }
        if (offhand) { spawnItem(offhand, P.x, P.y + 1, P.z); offhand = null; }
        if (cursor) { spawnItem(cursor, P.x, P.y + 1, P.z); cursor = null; }
        const xp = Math.min(100, P.lvl * 7); if (xp) spawnXp(xp, P.x, P.y + .5, P.z);
        P.xp = 0; P.lvl = 0;
      }
      gui = 'dead';
      if (locked()) { unlockIntent = true; document.exitPointerLock(); }
      if (W.hardcore) { W.mode = 'spectator'; }
      if (P.score > 0) api.submit(P.score);
      saveSoon();
    }
    function respawn() {
      P.dead = false; gui = null;
      const sp = P.spawn && validSpawn(P.spawn) ? P.spawn : W.spawn;
      Object.assign(P, { hp: 20, food: 20, sat: 5, exh: 0, air: 300, vx: 0, vy: 0, vz: 0, fall: 0, fly: false, hurtT: 0, shake: 0, fire: 0, absorb: 0, effects: {}, x: sp[0], y: sp[1], z: sp[2], place: !P.spawn || sp === W.spawn, score: 0 });
      if (W.hardcore) { P.fly = true; }
      P.px = P.x; P.py = P.y; P.pz = P.z;
      api.score(0); lockMouse();
      netSend({ t: 'respawn' });
    }
    function validSpawn(s) { const b = getS(Math.floor(s[0]), Math.floor(s[1]) - 0, Math.floor(s[2])); void b; return true; }
    function swing() { if (swingT < 0 || swingT >= CFG.SWING_TICKS / 2) swingT = 0; netAct({ sw: 1 }); }
    const toolOf = s => s && IT[s.id].tool ? IT[s.id].tool : null;
    function mineSpeed(s, t) {
      const tl = toolOf(held()), tk = tl ? tl.k : null;
      let sp = 1;
      if (tk === 'shears') { if (t.tags.has('leaves') || t.web) sp = 15; else if (t.tags.has('wool')) sp = 5; else if (t.id === 'vine' || t.id === 'glow_lichen') sp = 2; }
      else if (tk === 'sword') { if (t.web) sp = 15; else if (t.id === 'bamboo') sp = 999; else if (t.plant || t.tags.has('leaves') || t.id.includes('pumpkin') || t.id === 'melon') sp = 1.5; }
      else if (tk && tk === t.tool) sp = tl.sp;
      else if (tk === 'axe' && (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry' || t.snd === 'nether_wood') && !t.tool) sp = tl.sp;
      if (P.eyeW && !hasAqua()) sp /= 5;
      if (!P.onGround && !P.fly && !P.climbing) sp /= 5;
      return sp;
    }
    const hasAqua = () => false;
    function canHarvest(t) {
      if (!t.req) return true;
      const tl = toolOf(held());
      if (!tl) return false;
      if (tl.k === 'shears' && (t.web || t.tags.has('leaves') || t.tags.has('wool'))) return true;
      if (tl.k === 'sword' && t.web) return true;
      return tl.k === t.tool && tl.lvl >= t.lvl;
    }
    function relHard(s) {
      const t = TT[STT[s]];
      if (t.hard < 0) return 0;
      if (t.hard === 0) return 1;
      return mineSpeed(s, t) / t.hard / (canHarvest(t) ? 30 : 100);
    }
    function damageTool(n) {
      const s = held();
      if (!s || !IT[s.id].dur || mode() === 'creative') return;
      s.d += n;
      if (s.d >= IT[s.id].dur) { inv[sel] = null; snd('tbreak'); for (let i = 0; i < 10; i++) particle(P.x - Math.sin(P.yaw) * .5, P.y + 1.4, P.z - Math.cos(P.yaw) * .5, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [150, 120, 80], .5, .05, 12); }
    }
    function dropBlock(s, x, y, z, ctx) {
      if (W.rules.doTileDrops === false) return;
      const t = TT[STT[s]];
      ctx = ctx || {};
      let D;
      if (typeof t.drop === 'function') D = t.drop(s, ctx);
      else if (t.drop === null) D = null;
      else if (Array.isArray(t.drop)) D = t.drop;
      else if (typeof t.drop === 'string') D = [[t.drop, 1]];
      else D = [[typeof t.item === 'string' ? t.item : t.id, 1]];
      if (!D) return;
      if (t.slab && sv(s, 'type') === 2) D = [[t.id, 2]];
      for (const [id, n] of D) { if (n > 0 && IN[id]) spawnItem({ id: IN[id].idx, n }, x + .5 + (RNG() - .5) * .3, y + .4, z + .5 + (RNG() - .5) * .3, (RNG() - .5) * .2, .2, (RNG() - .5) * .2); }
      if (t.xp && !ctx.silk && !ctx.explosion) spawnXp(rr(t.xp[0], t.xp[1]), x + .5, y + .5, z + .5);
    }
    function breakBlock(x, y, z, byP) {
      const s = getS(x, y, z);
      if (!s) return;
      const t = TT[STT[s]];
      if (FLU[s] || (t.hard < 0 && !creative())) return;
      burst(x, y, z, s, 16);
      playBlockSnd(s, 'break', x, y, z);
      const tl = toolOf(held());
      const ctx = { silk: false, shears: tl && tl.k === 'shears', tool: tl, fortune: 0 };
      if (t.door) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0, 0); }
      if (t.bed) { const hd = sv(s, 'part'), q = fq(s), d = F4D[q], ox = hd ? -d[0] : d[0], oz = hd ? -d[1] : d[1]; const o = getS(x + ox, y, z + oz); if (TT[STT[o]] === t) setBlock(x + ox, y, z + oz, 0); }
      if (t.tall) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0); }
      if (t.id === 'tall_seagrass') { }
      const wet = !t.fluid && (FLU[getS(x, y + 1, z)] === 1 && false);
      void wet;
      if (byP && !creative() && canHarvest(t)) { if (t.tags.has('leaves') || t.id === 'short_grass' || t.id === 'fern' || t.id === 'tall_grass') dropBlock(s, x, y, z, ctx); else dropBlock(s, x, y, z, ctx); }
      removeBlockEntity(x, y, z, byP && !creative());
      if (t.id === 'ice' && byP && !creative() && SOL[getS(x, y - 1, z)]) setBlock(x, y, z, S('water', { level: 0 }));
      else setBlock(x, y, z, t.water && t.id !== 'kelp' && t.id !== 'kelp_plant' ? S('water', { level: 0 }) : (t.id === 'kelp' || t.id === 'kelp_plant' || t.id === 'seagrass' || t.id === 'tall_seagrass') ? S('water', { level: 0 }) : 0);
      if (byP && !creative()) { if (t.hard > 0) damageTool(IT[held()?.id]?.tool?.k === 'sword' ? 2 : 1); exhaust(CFG.EXH_MINE); }
    }
    function playBlockSnd(s, kind, x, y, z) { const t = TT[STT[s]]; matSnd(t.snd, kind === 'break' ? 2 : kind === 'place' ? 2 : kind === 'hit' ? 1 : 0, x != null ? { x: x + .5, y: y + .5, z: z + .5 } : null); }
    const boxHit = (e, x, y, z) => x < e.x + e.w / 2 && x + 1 > e.x - e.w / 2 && y < e.y + e.h && y + 1 > e.y && z < e.z + e.w / 2 && z + 1 > e.z - e.w / 2;
    const horizQ = () => { const a = ((P.yaw % 6.2832) + 6.2832) % 6.2832; return [0, 3, 2, 1][Math.round(a / (Math.PI / 2)) & 3]; };
    const dirFacing6 = () => { if (P.pitch > .79) return 4; if (P.pitch < -.79) return 5; return horizQ(); };
    const supportOK = (x, y, z, f) => { const s = getS(x, y, z); return FULLT[s] || (f === 2 && (TT[STT[s]].slab && sv(s, 'type') !== 0 || TT[STT[s]].stair && sv(s, 'half') === 1 || (TT[STT[s]].tags.has('fence') || TT[STT[s]].tags.has('wall')))); };
    const DIRTLIKE = new Set(['grass_block', 'dirt', 'coarse_dirt', 'podzol', 'rooted_dirt', 'mycelium', 'farmland', 'moss_block', 'pale_moss_block', 'mud', 'muddy_mangrove_roots']);
    function placementState(t, x, y, z, hit) {
      let s = S(t.id);
      if (LEAF[s] && t.pk.persistent !== undefined) s = sw(s, 'persistent', 1);
      const f = hit.f, hy = hit.py - Math.floor(hit.py), q = horizQ();
      const below = getS(x, y - 1, z), bt = TT[STT[below]];
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 4) {
        if (t.stair) s = sw(sw(s, 'facing', q), 'half', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
        else if (t.door || t.gate || t.bed) s = sw(s, 'facing', q);
        else if (t.id.includes('trapdoor')) { if (f >= 2 && f <= 3) s = sw(sw(s, 'facing', (q + 2) & 3), 'half', f === 3 ? 1 : 0); else s = sw(sw(s, 'facing', [5, 0, 4, 1].indexOf(f) >= 0 ? [1, 3, 2, 0][[0, 1, 4, 5].indexOf(f)] : 0), 'half', hy > .5 ? 1 : 0); }
        else if (t.torch || t.id === 'ladder' || t.id.endsWith('wall_sign') || t.id === 'tripwire_hook' || t.id === 'cocoa' || t.id === 'shelf_mushroom') { if (f < 2 || f > 3) s = sw(s, 'facing', [0, 1, 0, 0, 4, 5].indexOf(f) < 0 ? 0 : [1, 3, -1, -1, 2, 0][f]); }
        else if (t.pk.face !== undefined) { const fc = f === 2 ? 0 : f === 3 ? 2 : 1; s = sw(s, 'face', fc); s = sw(s, 'facing', fc === 1 ? [1, 3, -1, -1, 2, 0][f] : q); }
        else s = sw(s, 'facing', (q + 2) & 3);
      }
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 6) {
        if (t.place6 === 2) { const d = dirFacing6(); s = sw(s, 'facing', d < 4 ? (d + 2) & 3 : d === 4 ? 5 : 4); }
        else s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
        if (t.id === 'end_rod' || t.id === 'lightning_rod' || t.id.includes('amethyst')) s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
      }
      if (t.id === 'hopper') s = sw(s, 'facing', f === 2 ? 0 : [4, 3, 0, 0, 2, 1][f]);
      if (t.pk.axis !== undefined) { const ax = f < 2 ? 1 : f < 4 ? 0 : 2; s = sw(s, 'axis', t.props[t.pk.axis][1].length === 2 ? (ax === 1 ? 0 : 1) : ax); }
      if (t.pk.rotation !== undefined) { const a = ((P.yaw + Math.PI) / (Math.PI * 2) * 16); s = sw(s, 'rotation', ((Math.round(-a) % 16) + 16 + 8) % 16); }
      if (t.slab) s = sw(s, 'type', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
      if (t.pk.hanging !== undefined) s = sw(s, 'hanging', f === 3 ? 1 : 0);
      if (t.id === 'pointed_dripstone') s = sw(s, 'vertical_direction', f === 3 ? 0 : 1);
      if (t.id === 'glow_lichen') s = sw(s, 'face', [5, 4, 0, 1, 3, 2][f]);
      if (t.id === 'vine') { if (f < 2 || f > 3) { const k = [3, 1, 0, 0, 0, 2][f]; s = S('vine', { [FACE4[k]]: true }); } else if (f === 3) s = S('vine', { up: true }); else return null; }
      if (t.sign && !t.id.includes('wall') && !t.id.includes('hanging') && f !== 2) { const wt = TN[t.id.replace('_sign', '_wall_sign')]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.torch && f !== 2) { if (f === 3) return null; const wt = TN['wall_' + t.id]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); if (t.ctexL) s = sw(s, 'lit', 1); }
      if (t.head && f !== 2 && f !== 3) { const wt = TN[t.id.replace(/_(skull|head)$/, '_wall_$1')]; if (wt) s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.id === 'grass_block' || t.id === 'podzol' || t.id === 'mycelium') { if (isT(getS(x, y + 1, z), 'snow')) s = sw(s, 'snowy', 1); }
      if (t.attach === 1 && !(t.torch && f === 2) && t.pk.face === undefined) { const d = DIR6[OPP6[f]]; if (!supportOK(x + d[0], y + d[1], z + d[2], f)) { if (t.torch && f === 2 && supportOK(x, y - 1, z, 2)) { } else if (!(t.torch && f === 2)) return null; } }
      if (t.torch && f === 2 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.id === 'ladder' && (f < 2 || f > 3) && !FULLT[getS(x - DIR6[f][0], y, z - DIR6[f][2])]) return null;
      if (t.id === 'ladder' && (f === 2 || f === 3)) return null;
      if (t.pk.face !== undefined && t.attach) { const fc = sv(s, 'face'), d = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : DIR6[OPP6[f]]; if (!FULLT[getS(x + d[0], y + d[1], z + d[2])]) return null; }
      if (t.attach === 3 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.attach === 4 && !FULLT[getS(x, y + 1, z)] && !(t.id === 'pale_hanging_moss' && (isT(getS(x, y + 1, z), 'pale_hanging_moss') || LEAF[getS(x, y + 1, z)]))) return null;
      if (t.plant && !t.water && t.id !== 'cobweb' && t.attach !== 4 && t.id !== 'pointed_dripstone') {
        if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { if (!isT(below, t.soil || 'farmland')) return null; }
        else if (t.id === 'dead_bush' || t.id === 'short_dry_grass' || t.id === 'tall_dry_grass' || t.id === 'cactus_flower') { if (!DIRTLIKE.has(bt.id) && !bt.id.includes('sand') && !bt.id.includes('terracotta') && !(t.id === 'cactus_flower' && bt.id === 'cactus')) return null; }
        else if (t.id.includes('mushroom') && t.id !== 'shelf_mushroom') { if (!FULLT[below]) return null; }
        else if (t.id.includes('fungus') || t.id.includes('roots') || t.id === 'nether_sprouts') { if (!bt.id.includes('nylium') && !DIRTLIKE.has(bt.id) && bt.id !== 'soul_soil') return null; }
        else if (t.id === 'sugar_cane') { if (!(isT(below, 'sugar_cane') || ((DIRTLIKE.has(bt.id) || bt.id.includes('sand')) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => FLU[getS(x + a, y - 1, z + c)] === 1 || isT(getS(x + a, y - 1, z + c), 'frosted_ice'))))) return null; }
        else if (t.id === 'sweet_berry_bush' || t.sapling || t.flower || t.tall || t.id === 'short_grass' || t.id === 'fern' || t.id === 'bush' || t.id === 'firefly_bush' || t.id === 'red_shrub' || t.id.includes('petals') || t.id === 'wildflowers' || t.id === 'leaf_litter') { if (!DIRTLIKE.has(bt.id) && !(t.id === 'leaf_litter' && FULLT[below])) return null; }
        else if (t.id.includes('coral')) { if (!FULLT[below]) return null; }
      }
      if (t.id === 'cactus') { if (!(isT(below, 'cactus') || bt.id === 'sand' || bt.id === 'red_sand')) return null; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (SOL[getS(x + a, y, z + c)]) return null; }
      if (t.id === 'bamboo' && !(isT(below, 'bamboo') || DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id === 'gravel')) return null;
      if (t.id === 'lily_pad' || t.id === 'frogspawn') { if (FLU[below] !== 1 && !isT(below, 'ice')) return null; }
      if (t.water && !t.id.includes('dead')) { const cur = getS(x, y, z); if (FLU[cur] !== 1) { if (t.id.includes('coral')) { } else return null; } }
      if (t.id === 'nether_wart' && !isT(below, 'soul_sand')) return null;
      if (t.id === 'cocoa') { if (f < 2 || f > 3) { const d = DIR6[OPP6[f]]; if (!isT(getS(x + d[0], y, z + d[2]), 'jungle_log') && !isT(getS(x + d[0], y, z + d[2]), 'jungle_wood') && !isT(getS(x + d[0], y, z + d[2]), 'stripped_jungle_log')) return null; s = sw(S('cocoa'), 'facing', [1, 3, 0, 0, 2, 0][f]); } else return null; }
      return s;
    }
    function placeBlock(it, hit, offhandUse) {
      let x = hit.x, y = hit.y, z = hit.z;
      const tgt = getS(x, y, z), tt = TT[STT[tgt]];
      const t = TN[it.place];
      if (!t) return false;
      if (t.slab && tt === t && sv(tgt, 'type') !== 2 && ((sv(tgt, 'type') === 0 && hit.f === 2) || (sv(tgt, 'type') === 1 && hit.f === 3))) { setBlock(x, y, z, sw(tgt, 'type', 2)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'snow' && tt === t && sv(tgt, 'layers') < 7) { setBlock(x, y, z, sw(tgt, 'layers', sv(tgt, 'layers') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id.endsWith('candle') && tt === t && sv(tgt, 'candles') < 3) { setBlock(x, y, z, sw(tgt, 'candles', sv(tgt, 'candles') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if ((t.id === 'pink_petals' || t.id === 'wildflowers') && tt === t && sv(tgt, 'flower_amount') < 3) { setBlock(x, y, z, sw(tgt, 'flower_amount', sv(tgt, 'flower_amount') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'sea_pickle' && tt === t && sv(tgt, 'pickles') < 3) { setBlock(x, y, z, sw(tgt, 'pickles', sv(tgt, 'pickles') + 1)); return true; }
      if (!REP[tgt] || (tt === t && !t.repl) || (tt.id === 'snow' && sv(tgt, 'layers') > 0)) { x += hit.fx; y += hit.fy; z += hit.fz; }
      if (y < 0 || y >= H - 1) return false;
      const cur = getS(x, y, z), ct = TT[STT[cur]];
      if (!REP[cur] && !(FLU[cur] && FLU[cur] !== 0)) return false;
      if (ct.tall && REP[cur]) { const up = sv(cur, 'half'); setBlock(x, y + (up ? -1 : 1), z, 0); }
      if (t.slab && TT[STT[cur]] === t) { }
      const H2 = { f: hit.f, py: hit.py, fx: hit.fx, fy: hit.fy, fz: hit.fz };
      if (hit.x !== x || hit.y !== y || hit.z !== z) { }
      let s = placementState(t, x, y, z, H2);
      if (s === null || s === undefined) return false;
      if (it.placeAge === 0) s = sw(s, 'age', 0);
      if (TT[STT[s]].id === 'redstone_wire') s = S('redstone_wire');
      const solid = SOL[s] && !(SOL[s] === 2 && COLL[s] && !COLL[s].length);
      if (solid) for (const pl of playersList()) if (boxHit(pl, x, y, z) && SOL[s] && (SOL[s] === 1 || (blockBoxes(s, x, y, z) || []).some(b => b[4] - b[1] > .2))) return false;
      if (solid) for (const e of ENTS) if (e.kind === 'mob' && !e.dead && boxHit(e, x, y, z)) return false;
      if (t.door) { if (!REP[getS(x, y + 1, z)] || !supportOK(x, y - 1, z, 2)) return false; const q = sv(s, 'facing'), L = F4D[(q + 3) & 3], R = F4D[(q + 1) & 3]; const lt = TT[STT[getS(x + L[0], y, z + L[1])]], rt = TT[STT[getS(x + R[0], y, z + R[1])]]; let hinge = 0; if (lt.door && !rt.door) hinge = 1; else { const hx2 = hit.px - Math.floor(hit.px), hz2 = hit.pz - Math.floor(hit.pz); const side = q === 0 ? hx2 > .5 : q === 1 ? hz2 > .5 : q === 2 ? hx2 < .5 : hz2 < .5; if (!lt.door && !rt.door && side) hinge = 1; } s = sw(s, 'hinge', hinge); setBlock(x, y, z, s); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else if (t.bed) { const q = sv(s, 'facing'), d = F4D[q]; if (!REP[getS(x + d[0], y, z + d[1])] || !supportOK(x, y - 1, z, 2)) return false; setBlock(x, y, z, sw(s, 'part', 0)); setBlock(x + d[0], y, z + d[1], sw(s, 'part', 1)); }
      else if (t.tall) { if (!REP[getS(x, y + 1, z)]) return false; setBlock(x, y, z, sw(s, 'half', 0)); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else setBlock(x, y, z, s);
      if (t.cont || t.use === 'furnace' || t.sign) initBlockEntity(x, y, z, t, it);
      playBlockSnd(s, 'place', x, y, z); swing();
      if (!creative()) { const st = offhandUse ? offhand : held(); if (st && --st.n <= 0) { if (offhandUse) offhand = null; else inv[sel] = null; } }
      if (hooks.afterPlace) hooks.afterPlace(x, y, z, s);
      if (t.sign) openSign(x, y, z);
      return true;
    }
    function attackMob(e) {
      const st = held(), it = st ? IT[st.id] : null;
      let dmg = it && it.dmg ? it.dmg : 1;
      const cd = atkCooldown(), charge = clamp((tickN - P.atkT) / cd, 0, 1);
      dmg *= .2 + charge * charge * .8;
      const crit = charge > .9 && P.fall > 0 && !P.onGround && !P.fly && !P.eyeW && !P.climbing;
      if (crit) dmg *= 1.5;
      P.atkT = tickN;
      const kbS = P.sprint && charge > .9;
      const kx = -Math.sin(P.yaw), kz = -Math.cos(P.yaw);
      if (e.kind === 'player') { netSendTo(e.pid, { t: 'hurt', d: dmg, sx: P.x, sz: P.z, k: 'player', by: P.name }); }
      else hurtEnt(e, dmg, P, 'player', kx, kz);
      if (kbS && e.kind === 'mob') { e.vx += kx * .5; e.vz += kz * .5; e.vy += .1; P.vx *= .6; P.vz *= .6; P.sprint = false; }
      if (crit) for (let i = 0; i < 12; i++) particle(e.x, e.y + e.h * .7, e.z, (RNG() - .5) * 4, RNG() * 3, (RNG() - .5) * 4, [255, 255, 230], .5, .06, 6, 1);
      if (it && it.dur) damageTool(it.tool && it.tool.k === 'sword' ? 1 : 2);
      exhaust(CFG.EXH_ATTACK);
      snd(crit ? 'crit' : charge > .9 ? 'hit_strong' : 'hit_weak', e);
    }
    const atkCooldown = () => { const st = held(); const sp = st && IT[st.id].aspd ? IT[st.id].aspd : 4; return 20 / sp; };
    function interactMob(e) {
      const st = held(), it = st ? IT[st.id] : null, T = MT[e.type];
      if (e.kind !== 'mob') return false;
      if (it && it.egg) return false;
      if (it && T.breed && T.breed.includes(it.id) && !e.baby && e.breedCd === 0 && e.love === 0) { netOrLocal('love', e, () => { e.love = 600; for (let i = 0; i < 5; i++) particle(e.x, e.y + e.h, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, -.5, 1); }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (it && T.breed && T.breed.includes(it.id) && e.baby) { e.babyT -= 2400; if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.id === 'shears' && !e.sheared && !e.baby) { netOrLocal('shear', e, () => { e.sheared = true; e.wool.root.visible = false; spawnItem({ id: IN[e.color + '_wool'].idx, n: 1 + ri(3) }, e.x, e.y + 1, e.z); }); snd('shear', e); damageTool(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.dye && e.color !== it.dye && !e.sheared) { netOrLocal('dye:' + it.dye, e, () => { e.color = it.dye; }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'cow' && it && it.id === 'bucket') { consumeHeld(1, { id: IN.milk_bucket.idx, n: 1 }); snd('milk', e); swing(); return true; }
      return false;
    }
    function consumeHeld(n, rep) {
      const st = held(); if (!st) return;
      if (creative()) { if (rep) giveOrDrop(rep); return; }
      st.n -= n;
      if (st.n <= 0) inv[sel] = rep || null; else if (rep) giveOrDrop(rep);
    }
    function useItem(st, hitB) {
      const it = IT[st.id];
      if (it.food && (it.food.always || P.food < 20 || creative())) { if (!eating) eating = { id: st.id, t: 0, dur: it.food.fast ? 16 : it.id === 'honey_bottle' ? 40 : CFG.EAT_TICKS }; return true; }
      if (it.drink) { if (!eating) eating = { id: st.id, t: 0, dur: 32, drink: 1 }; return true; }
      if (it.bow) { const hasA = creative() || inv.some(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx)) || (offhand && offhand.id === IN.arrow.idx); if (hasA && !drawing) drawing = { t: 0, id: st.id }; return true; }
      if (it.crossbow) { if (!st.x || !st.x.loaded) { if (!drawing) drawing = { t: 0, id: st.id, cb: 1 }; } else { fireArrow(3.15, 9); st.x = null; damageTool(1); } return true; }
      if (it.trident) { if (!drawing) drawing = { t: 0, id: st.id, tri: 1 }; return true; }
      if (it.throwable) { const sp = it.throwable === 'ender_pearl' ? 1.5 : it.throwable === 'splash' ? .5 : 1.5, cp = Math.cos(P.pitch); spawnThrownNet(it.throwable, P.x - Math.sin(P.yaw) * .3, P.y + P.eye - .1, P.z - Math.cos(P.yaw) * .3, -Math.sin(P.yaw) * cp * sp + P.vx, Math.sin(P.pitch) * sp + (P.onGround ? 0 : P.vy), -Math.cos(P.yaw) * cp * sp + P.vz); snd('throw'); consumeHeld(1); swing(); useCd = it.throwable === 'ender_pearl' ? 20 : 4; return true; }
      if (it.armor && !hitB) { const sl = it.armor.slot; const cur = armor[sl]; armor[sl] = { ...st, n: 1 }; inv[sel] = cur || (st.n > 1 ? { ...st, n: st.n - 1 } : null); snd('equip'); return true; }
      if (it.egg && hitB) { const hx2 = HIT.x + HIT.fx + .5, hy = HIT.y + HIT.fy, hz2 = HIT.z + HIT.fz + .5; spawnMobNet(it.egg, hx2, hy, hz2); consumeHeld(1); swing(); return true; }
      if (it.bucket) return useBucket(st, it);
      if (it.shield) { shielding = true; return true; }
      if (it.spyglass) { P.zoom = true; return true; }
      return false;
    }
    function spawnMobNet(type, x, y, z) { if (NET.role === 'guest') netSend({ t: 'spawn', m: type, x, y, z }); else { const e = spawnMob(type, x, y, z, { persist: true }); if (e) e.yaw = P.yaw + Math.PI; } }
    function spawnThrownNet(type, x, y, z, vx, vy, vz) { if (NET.role === 'guest') netSend({ t: 'throw', ty: type, x, y, z, vx, vy, vz }); else spawnThrown(type, x, y, z, vx, vy, vz, P); }
    function fireArrow(v, base) {
      let ai = inv.findIndex(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx));
      if (offhand && offhand.id === IN.arrow.idx) ai = -2;
      if (ai < 0 && ai !== -2 && !creative()) return false;
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      const x = P.x + dx * .3, y = P.y + P.eye - .1, z = P.z + dz * .3, sp = v;
      if (NET.role === 'guest') netSend({ t: 'arrow', x, y, z, vx: dx * sp, vy: dy * sp, vz: dz * sp, d: base || 2, p: !creative() });
      else spawnArrow(x, y, z, dx * sp, dy * sp, dz * sp, P, base || 2, !creative());
      if (!creative()) { if (ai === -2) { if (--offhand.n <= 0) offhand = null; } else if (ai >= 0 && --inv[ai].n <= 0) inv[ai] = null; }
      snd('bow');
      return true;
    }
    function useBucket(st, it) {
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      raycast(EX, EY, EZ, dx, dy, dz, reach(), true, null);
      if (!HIT.b) return false;
      const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]];
      if (it.bucket === 'empty') {
        if (FLU[s] && ((s - t.base) & 15) === 0) { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN[FLU[s] === 1 ? 'water_bucket' : 'lava_bucket'].idx, n: 1 }); snd(FLU[s] === 1 ? 'bucket_fill' : 'bucket_fill_lava'); swing(); return true; }
        if (t.id === 'powder_snow') { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN.powder_snow_bucket.idx, n: 1 }); return true; }
        if (t.id === 'cauldron' && sv(s, 'level') === 3) { const ct = sv(s, 'content'); setBlock(HIT.x, HIT.y, HIT.z, S('cauldron')); consumeHeld(1, { id: IN[['water_bucket', 'lava_bucket', 'powder_snow_bucket'][ct]].idx, n: 1 }); snd('bucket_fill'); return true; }
        return false;
      }
      if (t.id === 'cauldron' && (it.bucket === 'water' || it.bucket === 'lava' || it.bucket === 'powder_snow')) { setBlock(HIT.x, HIT.y, HIT.z, S('cauldron', { level: 3, content: it.bucket })); if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 }; snd('bucket_empty'); return true; }
      let x = HIT.x, y = HIT.y, z = HIT.z;
      if (!REP[s] || (FLU[s] && it.bucket !== (FLU[s] === 1 ? 'water' : 'lava'))) { x += HIT.fx; y += HIT.fy; z += HIT.fz; }
      const cur = getS(x, y, z);
      if (!REP[cur] && !FLU[cur]) return false;
      if (it.bucket === 'water' && W.dim === 'nether') { snd('fizz'); }
      else setBlock(x, y, z, it.bucket === 'powder_snow' ? S('powder_snow') : S(it.bucket, { level: 0 }));
      if (it.mobB && NET.role !== 'guest') { }
      if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 };
      snd(it.bucket === 'lava' ? 'bucket_empty_lava' : 'bucket_empty'); swing();
      return true;
    }
    function useOnBlock(st, x, y, z, f) {
      const s = getS(x, y, z), t = TT[STT[s]], it = st ? IT[st.id] : null;
      if (it && it.boneMeal) { if (boneMeal(x, y, z, s, t)) { consumeHeld(1); swing(); for (let i = 0; i < 12; i++) particle(x + RNG(), y + RNG() * .8 + .2, z + RNG(), 0, .5, 0, [120, 220, 120], .8, .06, -.2, 1); return true; } }
      if (it && it.tool && it.tool.k === 'hoe' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'dirt_path' || t.id === 'coarse_dirt' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, t.id === 'coarse_dirt' ? S('dirt') : t.id === 'rooted_dirt' ? S('dirt') : S('farmland')); if (t.id === 'rooted_dirt') spawnItem({ id: IN.hanging_roots.idx, n: 1 }, x + .5, y + 1.2, z + .5); snd('hoe'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'podzol' || t.id === 'coarse_dirt' || t.id === 'mycelium' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, S('dirt_path')); snd('shovel'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'campfire' || t.id === 'soul_campfire') && sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); damageTool(1); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.strip && TN[t.strip]) { setBlock(x, y, z, sw(TN[t.strip].base, 'axis', sv(s, 'axis'))); snd('strip'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.ox !== undefined) { const nm = t.id; if (nm.startsWith('waxed_')) { setBlock(x, y, z, sameProps(s, TN[nm.slice(6)])); snd('wax_off'); damageTool(1); swing(); return true; } const pre = ['exposed_', 'weathered_', 'oxidized_'], i = pre.findIndex(p => nm.startsWith(p)); if (i >= 0) { const base = nm.slice(pre[i].length), nn = (i ? pre[i - 1] : '') + (base === 'copper' && !i ? 'copper_block' : base); if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); snd('scrape'); damageTool(1); swing(); return true; } } }
      if (it && it.id === 'honeycomb' && t.ox !== undefined && !t.id.startsWith('waxed_')) { const nn = 'waxed_' + t.id; if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); consumeHeld(1); snd('wax_on'); swing(); return true; } }
      if (it && (it.ignite) && (t.tnt)) { setBlock(x, y, z, 0); if (NET.role !== 'guest') spawnTNT(x, y, z); else netSend({ t: 'tnt', x, y, z }); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite && (t.id === 'campfire' || t.id === 'soul_campfire' || t.id.endsWith('candle')) && !sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 1)); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite) { const d = DIR6[f], nx = x + d[0], ny = y + d[1], nz2 = z + d[2]; if (REP[getS(nx, ny, nz2)] && !FLU[getS(nx, ny, nz2)]) { const soul = isT(getS(nx, ny - 1, nz2), 'soul_sand') || isT(getS(nx, ny - 1, nz2), 'soul_soil'); if (isT(s, 'obsidian') && tryPortal(nx, ny, nz2)) { } else setBlock(nx, ny, nz2, S(soul ? 'soul_fire' : 'fire')); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; } }
      if (it && it.id === 'glass_bottle' && FLU[getS(x + DIR6[f][0], y + DIR6[f][1], z + DIR6[f][2])] === 1) { consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; }
      if (it && it.tool && it.tool.k === 'shears' && t.id === 'pumpkin') { setBlock(x, y, z, sw(S('carved_pumpkin'), 'facing', horizQ() + 2 & 3)); spawnItem({ id: IN.pumpkin_seeds.idx, n: 4 }, x + .5, y + 1, z + .5); damageTool(1); snd('shear'); return true; }
      return false;
    }
    function sameProps(s, nt) { const t = TT[STT[s]]; let n = nt.base; for (const [k] of t.props) if (nt.pk[k] !== undefined) n = sw(n, k, sv(s, k)); return n; }
    function tryPortal(x, y, z) { void x; void y; void z; return false; }
    function boneMeal(x, y, z, s, t) {
      if (NET.role === 'guest') { netSend({ t: 'bonemeal', x, y, z }); return t.crop || t.sapling || t.id === 'grass_block'; }
      if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { const m = t.maxAge, a = sv(s, 'age'); if (a >= m) return false; setBlock(x, y, z, sw(s, 'age', Math.min(m, a + rr(2, 5)))); return true; }
      if (t.crop === 'berry') { const a = sv(s, 'age'); if (a >= 3) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.id === 'cocoa') { const a = sv(s, 'age'); if (a >= 2) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.sapling) { if (RNG() < .45) growTree(x, y, z, t.sapling); return true; }
      if (t.id === 'grass_block') { for (let i = 0; i < 40; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3; let gy = y + 1; if (isT(getS(gx, gy - 1, gz), 'grass_block') && !getS(gx, gy, gz)) { const r = RNG(); setBlock(gx, gy, gz, r < .8 ? S('short_grass') : r < .9 ? S(['dandelion', 'poppy'][ri(2)]) : S('short_grass')); } } return true; }
      if (t.id === 'short_grass' || t.id === 'fern') { if (!getS(x, y + 1, z)) { const tn = t.id === 'fern' ? 'large_fern' : 'tall_grass'; setBlock(x, y, z, S(tn, { half: 'bottom' })); setBlock(x, y + 1, z, S(tn, { half: 'top' })); } return true; }
      if (t.flower && !t.tall && t.id !== 'wither_rose') { for (let i = 0; i < 8; i++) { const gx = x + ri(5) - 2, gz = z + ri(5) - 2; if (isT(getS(gx, y - 1, gz), 'grass_block') && !getS(gx, y, gz)) setBlock(gx, y, gz, s); } return true; }
      if (t.tall && t.flower !== undefined || t.id === 'sunflower' || t.id === 'lilac' || t.id === 'rose_bush' || t.id === 'peony') { spawnItem({ id: IN[t.id].idx, n: 1 }, x + .5, y + .5, z + .5); return true; }
      if (t.id === 'shelf_mushroom' && sv(s, 'size') === 0) { setBlock(x, y, z, sw(s, 'size', 1)); return true; }
      if (t.id === 'moss_block') { for (let i = 0; i < 30; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3, gy = y + ri(3) - 1; const b = getS(gx, gy, gz); if ((isT(b, 'stone') || isT(b, 'dirt') || isT(b, 'grass_block')) && !getS(gx, gy + 1, gz)) setBlock(gx, gy, gz, S('moss_block')); } return true; }
      if (t.id === 'sugar_cane' || t.id === 'cactus' || t.id === 'bamboo') { let top = y; while (TT[STT[getS(x, top + 1, z)]] === t) top++; if (!getS(x, top + 1, z)) { setBlock(x, top + 1, z, t.base); return true; } }
      if (t.id === 'kelp' || t.id === 'kelp_plant') { let top = y; while (isT(getS(x, top + 1, z), 'kelp') || isT(getS(x, top + 1, z), 'kelp_plant')) top++; if (FLU[getS(x, top + 1, z)] === 1) { setBlock(x, top, z, S('kelp_plant')); setBlock(x, top + 1, z, S('kelp')); return true; } }
      return false;
    }
