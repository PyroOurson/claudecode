    let EX = 0, EY = 0, EZ = 0;
    const reach = () => mode() === 'creative' ? CFG.REACH_CREATIVE : CFG.REACH;
    function lookDir() { const cp = Math.cos(P.pitch); return [-Math.sin(P.yaw) * cp, Math.sin(P.pitch), -Math.cos(P.yaw) * cp]; }
    function attackPress() {
      if (P.dead || gui || scr !== 'game') return;
      swing();
      if (mode() === 'spectator') return;
      if (HIT.ent) { attackMob(HIT.ent); return; }
      if (!HIT.b) { P.atkT = tickN; return; }
      if (mode() === 'adventure') return;
      const s = getS(HIT.x, HIT.y, HIT.z);
      if (creative()) { const h = held(); if (h && IT[h.id].tool && IT[h.id].tool.k === 'sword') return; breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; return; }
      if (relHard(s) >= 1) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; }
    }
    function breakNet(x, y, z) {
      breakBlock(x, y, z, true);
    }
    function usePress() {
      if (P.dead || gui || scr !== 'game') return;
      doUse(); useCd = CFG.USE_DELAY;
    }
    function doUse() {
      if (mode() === 'spectator') return;
      const st = held();
      if (HIT.ent) { if (interactMob(HIT.ent)) return; }
      if (HIT.b && !(P.sneak && st)) { if (useBlock(HIT.x, HIT.y, HIT.z)) { swing(); return; } }
      if (HIT.b && st && canBuild()) { if (useOnBlock(st, HIT.x, HIT.y, HIT.z, HIT.f)) return; }
      if (HIT.b && st && !IT[st.id].place && IT[st.id].bucket) { if (useItem(st, true)) return; }
      if (st && useItem(st, HIT.b)) return;
      if (st && HIT.b && IT[st.id].place && canBuild()) { placeBlock(IT[st.id], HIT, false); return; }
      if (!st && offhand && HIT.b && IT[offhand.id].place && canBuild()) { placeBlock(IT[offhand.id], HIT, true); return; }
      if (offhand && IT[offhand.id].shield) shielding = true;
    }
    function useBlock(x, y, z) {
      const s = getS(x, y, z), t = TT[STT[s]], u = t.use;
      if (!u) return false;
      if (u === 'craft') { openGui('table'); return true; }
      if (u === 'furnace') { openContainer(x, y, z, 'furnace'); return true; }
      if (u === 'chest') { if (t.cont && SOL[getS(x, y + 1, z)] === 1 && t.id.includes('chest') && !t.shulker) return true; openContainer(x, y, z, t.cont === 9 ? 'dispenser' : t.cont === 5 ? 'hopper' : 'chest'); snd('chest_open', { x, y, z }); if (t.id === 'barrel') setBlock(x, y, z, sw(s, 'open', 1)); return true; }
      if (u === 'ender') { openGui('ender'); snd('chest_open', { x, y, z }); return true; }
      if (u === 'stonecutter') { openGui('stonecutter'); return true; }
      if (u === 'door' || u === 'trapdoor' || u === 'gate') {
        if (mode() === 'spectator') return false;
        const ns = sw(s, 'open', sv(s, 'open') ? 0 : 1);
        if (u === 'gate' && !sv(s, 'open')) { const q = fq(s), pq = horizQ(); if ((q & 1) === (pq & 1) && q !== pq) setBlock(x, y, z, sw(ns, 'facing', pq)); else setBlock(x, y, z, ns); }
        else setBlock(x, y, z, ns);
        if (u === 'door') { const oy = sv(s, 'half') ? -1 : 1, o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, sw(o, 'open', sv(ns, 'open'))); }
        snd(sv(ns, 'open') ? 'door_open' : 'door_close', { x, y, z });
        return true;
      }
      if (u === 'idoor') return false;
      if (u === 'lever') { setBlock(x, y, z, sw(s, 'powered', sv(s, 'powered') ? 0 : 1)); snd('click', { x, y, z }); redstoneAround(x, y, z); return true; }
      if (u === 'button') { if (sv(s, 'powered')) return true; setBlock(x, y, z, sw(s, 'powered', 1)); snd('click', { x, y, z }); schedule(x, y, z, t.btnTime || 20, 'button'); redstoneAround(x, y, z); return true; }
      if (u === 'repeater') { setBlock(x, y, z, sw(s, 'delay', (sv(s, 'delay') + 1) & 3)); snd('click', { x, y, z }); return true; }
      if (u === 'daylight') { setBlock(x, y, z, sw(s, 'inverted', sv(s, 'inverted') ? 0 : 1)); return true; }
      if (u === 'note') { const n = (sv(s, 'note') + (P.sneak ? 0 : 1)) % 25; setBlock(x, y, z, sw(s, 'note', n)); noteSnd(n, getS(x, y - 1, z), { x, y, z }); particle(x + .5, y + 1.2, z + .5, 0, .6, 0, [n * 10, 255 - n * 8, 120], .8, .15, 0, 1); return true; }
      if (u === 'bed') { trySleep(x, y, z, s, t); return true; }
      if (u === 'cake') { if (P.food < 20 || creative()) { P.food = Math.min(20, P.food + 2); P.sat = Math.min(P.food, P.sat + .4); snd('eat'); const b = sv(s, 'bites'); if (b >= 6) setBlock(x, y, z, 0); else setBlock(x, y, z, sw(s, 'bites', b + 1)); } return true; }
      if (u === 'composter') { const st = held(), l = sv(s, 'level'); if (l === 8) { setBlock(x, y, z, S('composter')); spawnItem({ id: IN.bone_meal.idx, n: 1 }, x + .5, y + 1.1, z + .5); snd('compost'); return true; } if (st && compostChance(IT[st.id]) > 0 && l < 7) { if (RNG() < compostChance(IT[st.id])) { setBlock(x, y, z, sw(s, 'level', l + 1)); if (l + 1 === 7) schedule(x, y, z, 20, 'compost'); } consumeHeld(1); snd('compost'); for (let i = 0; i < 4; i++) particle(x + .5, y + 1, z + .5, (RNG() - .5), .5, (RNG() - .5), [120, 200, 80], .5, .05, 6); return true; } return false; }
      if (u === 'cauldron') { const st = held(); if (!st) return false; const it = IT[st.id]; if (it.id === 'glass_bottle' && sv(s, 'level') && sv(s, 'content') === 0) { setBlock(x, y, z, sv(s, 'level') === 1 ? S('cauldron') : sw(s, 'level', sv(s, 'level') - 1)); consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; } if (it.id === 'potion' && sv(s, 'level') < 3 && sv(s, 'content') === 0) { setBlock(x, y, z, S('cauldron', { level: sv(s, 'level') + 1, content: 'water' })); consumeHeld(1, { id: IN.glass_bottle.idx, n: 1 }); return true; } return false; }
      if (u === 'pot') { const st = held(), p = svn(s, 'plant'); if (p === 'none' && st) { const nm = IT[st.id].id, vals = t.props[0][1]; if (vals.includes(nm)) { setBlock(x, y, z, sw(s, 'plant', nm)); consumeHeld(1); return true; } return false; } if (p !== 'none' && !st) { inv[sel] = { id: IN[p].idx, n: 1 }; setBlock(x, y, z, S('flower_pot')); return true; } return false; }
      if (u === 'jukebox') { const be = beAt(x, y, z, true); if (be.disc) { spawnItem(be.disc, x + .5, y + 1.1, z + .5, 0, .2, 0); be.disc = null; stopDisc(); return true; } const st = held(); if (st && IT[st.id].disc) { be.disc = { ...st, n: 1 }; consumeHeld(1); playDisc(IT[st.id].disc, x, y, z); chatSys('Now Playing: C418 - ' + IT[st.id].desc); return true; } return false; }
      if (u === 'candle') { const st = held(); if (sv(s, 'lit') && !st) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); return true; } return false; }
      if (u === 'tnt') return false;
      if (u === 'sign') { openSign(x, y, z); return true; }
      if (u === 'enchant') { chatSys('Enchanting is not available yet.'); return true; }
      return false;
    }
    function compostChance(it) {
      if (!it) return 0;
      const n = it.id;
      if (/seeds|short_grass|kelp|sweet_berries|glow_berries|leaves|sapling|moss_carpet|hanging_roots|pitcher_pod|pink_petals|leaf_litter/.test(n)) return .3;
      if (/cactus|sugar_cane|vine|melon_slice|tall_grass|dry_grass|bush|shrub|wildflowers/.test(n)) return .5;
      if (/apple|beetroot|carrot|cocoa|potato|wheat|fern|mushroom|flower|lily_pad|melon|moss_block|pumpkin|sea_pickle|dandelion|poppy|tulip|orchid|allium|bluet|daisy|cornflower|lily_of|azalea|eyeblossom|shelf/.test(n)) return .65;
      if (/baked_potato|bread|cookie|hay_block|nether_wart/.test(n)) return .85;
      if (/cake|pumpkin_pie/.test(n)) return 1;
      return 0;
    }
    function trySleep(x, y, z, s, t) {
      const night = (W.time % 24000) > 12542 && (W.time % 24000) < 23460, storm = W.thunder;
      if (t.bed === 1) { P.spawn = [x + .5, y + 1, z + .5]; chatSys('Respawn point set'); }
      if (!night && !storm) { chatSys('You can only sleep at night or during thunderstorms'); return; }
      for (const e of ENTS) if (e.kind === 'mob' && MT[e.type].hostile && Math.abs(e.x - x) < 8 && Math.abs(e.y - y) < 5 && Math.abs(e.z - z) < 8) { chatSys('You may not rest now; there are monsters nearby'); return; }
      P.sleeping = 1; P.bedPos = [x, y, z]; P.x = x + .5; P.z = z + .5; P.y = y + .56; P.vx = P.vy = P.vz = 0;
      netSend({ t: 'sleep', v: 1 });
    }
    function wake() { if (!P.sleeping) return; P.sleeping = 0; const b = P.bedPos; if (b) { P.y = b[1] + .6; const bs = getS(b[0], b[1], b[2]); if (TT[STT[bs]].bed === 2) { setBlock(b[0], b[1], b[2], 0); } } netSend({ t: 'sleep', v: 0 }); }
    function tickInteract() {
      if (breakCd > 0) breakCd--;
      if (useCd > 0) useCd--;
      if (gui || P.dead) { mine = null; eating = null; drawing = null; shielding = false; return; }
      if (P.sleeping) return;
      const st = held();
      if (eating) {
        if (!useHeld || !st || st.id !== eating.id) eating = null;
        else {
          eating.t++;
          if (eating.t > 7 && eating.t % 4 === 0 && !eating.drink) { snd('eat'); for (let i = 0; i < 3; i++) { const c = tilePxItem(st.id); particle(P.x - Math.sin(P.yaw) * .4, P.y + P.eye - .2, P.z - Math.cos(P.yaw) * .4, (RNG() - .5) * 1.5, RNG() * 1.5, (RNG() - .5) * 1.5, c, .5, .06, 14); } }
          if (eating.drink && eating.t % 6 === 0) snd('drink');
          if (eating.t >= eating.dur) { finishEat(st); eating = null; useCd = 4; }
        }
      }
      if (drawing) {
        if (!st || st.id !== drawing.id) drawing = null;
        else if (useHeld) { drawing.t++; if (drawing.cb && drawing.t === 25) { st.x = { loaded: 1 }; snd('crossbow_load'); drawing = null; } }
        else {
          const it = IT[st.id];
          if (it.bow) { let f = drawing.t / 20; f = (f * f + f * 2) / 3; if (f > 1) f = 1; if (f >= .1) { if (fireArrow(f * 3, f >= 1 ? 3 : 2)) damageTool(1); } }
          else if (it.trident && drawing.t >= 10) { snd('throw'); }
          drawing = null;
        }
      }
      shielding = useHeld && ((st && IT[st.id].shield) || (offhand && IT[offhand.id].shield && !(st && (IT[st.id].food || IT[st.id].bow))));
      if (attackHeld && !HIT.ent && HIT.b && mode() !== 'adventure' && mode() !== 'spectator') {
        if (swingT < 0) swingT = 0;
        if (breakCd === 0) {
          if (creative()) { const h = held(); if (!(h && IT[h.id].tool && IT[h.id].tool.k === 'sword')) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; } }
          else {
            const s = getS(HIT.x, HIT.y, HIT.z);
            if (!mine || mine.x !== HIT.x || mine.y !== HIT.y || mine.z !== HIT.z || mine.s !== s) mine = { x: HIT.x, y: HIT.y, z: HIT.z, s, p: 0, t: 0 };
            mine.p += relHard(s);
            if (mine.t++ % 4 === 0) { playBlockSnd(s, 'hit', HIT.x, HIT.y, HIT.z); burst(HIT.x + HIT.fx * .55, HIT.y + HIT.fy * .55, HIT.z + HIT.fz * .55, s, 2, 1.5); }
            if (mine.p >= 1) { breakNet(mine.x, mine.y, mine.z); mine = null; breakCd = CFG.BREAK_DELAY; }
            netAct({ mine: mine ? [mine.x, mine.y, mine.z, Math.min(9, mine.p * 10 | 0)] : 0 });
          }
        }
      } else if (mine) { mine = null; netAct({ mine: 0 }); }
      if (useHeld && useCd === 0 && !eating && !drawing) { const h = held(); if (!(h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink))) { doUse(); useCd = CFG.USE_DELAY; } }
    }
    function tilePxItem(id) { const k = ITIDX.get(id); if (k === undefined) { const t = IT[id].block ? TN[IT[id].block] : null; return t ? tileAvg(TIL[t.base * 6 + 2] >= 0 ? TIL[t.base * 6 + 2] : 0) : [200, 120, 80]; } const ox = (k & 63) * 16, oy = (k >> 6) * 16; for (let i = 0; i < 8; i++) { const o = ((oy + ri(16)) * 1024 + ox + ri(16)) * 4; if (itaImg.data[o + 3]) return [itaImg.data[o], itaImg.data[o + 1], itaImg.data[o + 2]]; } return [200, 120, 80]; }
    function finishEat(st) {
      const it = IT[st.id];
      if (it.food) {
        P.food = Math.min(20, P.food + it.food.n); P.sat = Math.min(P.food, P.sat + it.food.s);
        snd('burp');
        const id = it.id;
        if (id === 'golden_apple') { P.absorb = Math.max(P.absorb, 4); P.effects.regen = Math.max(P.effects.regen || 0, 100); }
        if (id === 'enchanted_golden_apple') { P.absorb = 16; P.effects.regen = 400; P.effects.fireRes = 6000; }
        if (id === 'rotten_flesh' && RNG() < .8) P.effects.hunger = 600;
        if (id === 'chicken' && RNG() < .3) P.effects.hunger = 600;
        if (id === 'spider_eye' || (id === 'poisonous_potato' && RNG() < .6)) P.effects.poison = id === 'spider_eye' ? 100 : 100;
        if (id === 'pufferfish') { P.effects.poison = 1200; P.effects.hunger = 300; }
        if (id === 'chorus_fruit') teleportPlayerRandom();
        if (id === 'honey_bottle') P.effects.poison = 0;
        if (mode() !== 'creative') { st.n--; if (it.food.bowl) giveOrDrop({ id: IN.bowl.idx, n: 1 }); if (id === 'honey_bottle') giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); if (st.n <= 0) inv[sel] = null; }
      } else if (it.drink) {
        if (it.drink === 'milk') { P.effects = {}; if (mode() !== 'creative') inv[sel] = { id: IN.bucket.idx, n: 1 }; }
        else if (mode() !== 'creative') { st.n--; if (st.n <= 0) inv[sel] = null; giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); }
      }
    }
    function teleportPlayerRandom() { for (let k = 0; k < 16; k++) { const x = Math.floor(P.x + (RNG() - .5) * 16), z = Math.floor(P.z + (RNG() - .5) * 16); for (let y = Math.floor(P.y) + 8; y > P.y - 8; y--) if (SOL[getS(x, y - 1, z)] && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)]) { P.x = x + .5; P.y = y; P.z = z + .5; snd('teleport'); return; } } }
    function tickPlayer() {
      P.px = P.x; P.py = P.y; P.pz = P.z; P.walkP = P.walk; P.bobP = P.bob; P.eyeP = P.eye;
      if (P.hurtT > 0) P.hurtT--;
      if (P.shake > 0) P.shake--;
      const c0 = colAt(Math.floor(P.x) >> 4, Math.floor(P.z) >> 4);
      if (!c0 || !c0.meshed) { if (P.y < -64) P.y = 200; return; }
      const md = mode(), spec = md === 'spectator';
      P.spec = spec;
      if (P.place) {
        P.place = false;
        let bx = Math.floor(P.x), bz = Math.floor(P.z);
        const openTop = (x, z) => { let y = H - 2; while (y > 1 && !SOL[getS(x, y, z)] && !FLU[getS(x, y, z)]) y--; const b = getS(x, y, z); return FLU[b] || LEAF[b] || TT[STT[b]].tags.has('log') ? -1 : y; };
        if (!P.spawn && openTop(bx, bz) < 0) { let found = false; for (let r = 1; r <= 24 && !found; r++) for (let k = 0; k < 8 * r && !found; k++) { const a = k / (8 * r) * Math.PI * 2, x = bx + Math.round(Math.cos(a) * r), z = bz + Math.round(Math.sin(a) * r); const c = colAt(x >> 4, z >> 4); if (!c || c.st < 1) continue; if (openTop(x, z) > 0) { bx = x; bz = z; P.x = x + .5; P.z = z + .5; found = true; if (W && !W.remote && W.spawn && Math.abs(W.spawn[0] - .5) < 1e-6) W.spawn = [P.x, W.spawn[1], P.z]; } } }
        let y = openTop(bx, bz);
        if (y < 0) { y = H - 2; while (y > 1 && !SOL[getS(bx, y, bz)] && !FLU[getS(bx, y, bz)]) y--; }
        if (P.y < y + 1 || !boxFree(P, 0, 0, 0)) P.y = y + 1;
        P.py = P.y;
      }
      if (P.sleeping) { P.vx = P.vz = 0; P.vy = 0; if (++P.sleeping >= 100 && NET.role !== 'guest' && ![...RP.values()].some(e => !e.pdead && e.mode !== 'spectator')) { W.time = Math.ceil(W.time / 24000) * 24000; W.raining = W.thunder = false; wake(); } return; }
      let fwd = 0, str = 0;
      const K = c => keys.has(c), active = !gui && !P.dead && !chatOpen;
      if (active) {
        if (K(KB.fwd) || K('ArrowUp')) fwd++;
        if (K(KB.back) || K('ArrowDown')) fwd--;
        if (K(KB.left) || K('ArrowLeft')) str--;
        if (K(KB.right) || K('ArrowRight')) str++;
        fwd = clamp(fwd - stick.y, -1, 1); str = clamp(str + stick.x, -1, 1);
      }
      const jump = active && (K(KB.jump) || tJump), sneakKey = active && (K(KB.sneak) || K('ShiftRight') || tSneak);
      if (spec) P.fly = true;
      P.sneak = sneakKey && !P.fly;
      fwd *= CFG.INPUT_MUL; str *= CFG.INPUT_MUL;
      if (P.sneak) { fwd *= CFG.SNEAK_MUL; str *= CFG.SNEAK_MUL; }
      if (eating || drawing || shielding) { fwd *= .2; str *= .2; }
      const canSprint = (md === 'creative' || spec || P.food > 6) && !P.sneak && !eating && !drawing;
      if (!P.sprint && canSprint && fwd >= .8 && (sprintKey || K(KB.sprint) || sprintTap > 0 || Math.hypot(stick.x, stick.y) > .97)) P.sprint = true;
      if (P.sprint && (fwd < .8 || (P.collH && !P.fly) || !canSprint)) P.sprint = false;
      sprintTap = 0;
      const inW = !spec && fluidIn(P, 1), inL = !spec && fluidIn(P, 2);
      P.inLava = inL;
      const feet = getS(Math.floor(P.x), Math.floor(P.y + .1), Math.floor(P.z)), feetT = TT[STT[feet]];
      P.climbing = !spec && !P.fly && (feetT.climb || isT(feet, 'scaffolding')) ? 1 : 0;
      const web = !spec && blockIn(P, b => TT[STT[b]].web), powder = !spec && blockIn(P, b => TT[STT[b]].powder) && !(armor[3] && IT[armor[3].id].id === 'leather_boots');
      const sy2 = Math.sin(P.yaw), cy2 = Math.cos(P.yaw);
      const accel = a => { let f = str * str + fwd * fwd; if (f >= 1e-4) { f = Math.sqrt(f); if (f < 1) f = 1; f = a / f; const s = str * f, w = fwd * f; P.vx += s * cy2 - w * sy2; P.vz += -s * sy2 - w * cy2; } };
      if (P.fly) { if (sneakKey) P.vy -= CFG.FLY_V * 3 * (spec ? 1 : 1); if (jump) P.vy += CFG.FLY_V * 3; }
      else if (inW || inL) { if (jump) P.vy += CFG.WATER_UP; }
      else if (P.climbing) { if (jump || (P.collH && fwd > 0)) P.vy = .2; }
      else if (jump && P.onGround && P.jumpT === 0) {
        P.vy = CFG.JUMP * (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'honey_block') ? .5 : 1);
        if (P.sprint) { P.vx -= sy2 * CFG.SPRINT_JUMP; P.vz -= cy2 * CFG.SPRINT_JUMP; }
        P.jumpT = CFG.JUMP_TICKS; stat('jump'); exhaust(P.sprint ? CFG.EXH_SPRINT_JUMP : CFG.EXH_JUMP);
        const fb = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (isT(fb, 'farmland') && mode() !== 'creative' && RNG() < .3) setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
      }
      if (!jump) P.jumpT = 0; else if (P.jumpT > 0) P.jumpT--;
      const gB = getS(Math.floor(P.x), Math.floor(P.y - .51), Math.floor(P.z)), gT = TT[STT[gB]];
      const slip = gT.slip || .6;
      if (spec) {
        accel(CFG.FLY_ACC * (P.sprint ? 2 : 1) * 1.5);
        P.x += P.vx; P.y += P.vy; P.z += P.vz; P.vy *= CFG.FLY_VDRAG; P.vx *= .91; P.vz *= .91; P.onGround = false;
      } else if ((inW || inL) && !P.fly) {
        accel(inL ? .02 : P.sprint ? .04 : CFG.SWIM_ACC);
        if (P.sprint && inW && fluidIn(P, 1, 1.4)) { P.vy += Math.sin(P.pitch) * .02; }
        moveE(P, P.vx, P.vy, P.vz, false, .6);
        const dr = inL ? CFG.LAVA_DRAG : CFG.WATER_DRAG;
        P.vx *= dr; P.vy *= inL ? .5 : .8; P.vz *= dr; P.vy -= inL ? .02 : CFG.WATER_GRAV;
        if (P.collH && boxFree(P, P.vx, .6 + P.vy, P.vz)) P.vy = .3;
      } else {
        const a = P.fly ? CFG.FLY_ACC * (P.sprint ? 2 : 1) : P.onGround ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277 / Math.pow(slip * .91, 3)) * .6 * .6 / .6 : (P.sprint ? CFG.AIR_ACC_SPRINT : CFG.AIR_ACC);
        accel(P.onGround && !P.fly ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277136 / Math.pow(slip * .91, 3)) : a);
        if (P.climbing) { P.vx = clamp(P.vx, -.15, .15); P.vz = clamp(P.vz, -.15, .15); P.vy = Math.max(P.vy, P.sneak ? 0 : -.15); }
        if (web) { P.vx *= .25; P.vy *= .05; P.vz *= .25; }
        if (powder) { P.vx *= .9; P.vy = Math.max(-.05, P.vy * .9); P.vz *= .9; }
        const vy0 = P.vy;
        moveE(P, P.vx, P.vy, P.vz, P.sneak && !P.fly, CFG.STEP);
        if (P.fly) P.vy = vy0 * CFG.FLY_VDRAG; else P.vy = (P.vy - CFG.GRAVITY) * CFG.VDRAG;
        const dr = P.onGround ? slip * .91 : CFG.AIR_DRAG;
        P.vx *= dr; P.vz *= dr;
        if (P.onGround && gT.bounce && vy0 < -.1 && !P.sneak) P.vy = -vy0 * .95;
        if (gT.id === 'soul_sand') { P.vx *= .4; P.vz *= .4; }
        if (gT.id === 'honey_block') { P.vx *= .4; P.vz *= .4; }
        if (feetT.id === 'sweet_berry_bush' && (Math.abs(P.vx) > .003 || Math.abs(P.vz) > .003)) { P.vx *= .8; P.vz *= .8; if (sv(feet, 'age') > 0 && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus'); }
      }
      if (P.fly && P.onGround && md !== 'creative' && !spec) P.fly = false;
      if (P.fly && P.onGround && md === 'creative') P.fly = false;
      if (P.y > H + 100) { P.y = H + 100; P.vy = Math.min(0, P.vy); }
      if (P.y < -64 && !spec) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'void'); }
      const nowW = inW;
      if (nowW && !P.wasW && P.vy < -.3) snd('splash');
      P.wasW = nowW;
      if (nowW || P.fly || P.climbing || web || powder) P.fall = 0;
      else if (P.onGround) {
        if (P.fall > 0) {
          const land = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), lt = TT[STT[land]];
          let d = Math.ceil(P.fall - CFG.FALL_SAFE);
          if (lt.soft) d = Math.ceil(d * lt.soft);
          if (lt.bounce || lt.id === 'slime_block') d = P.sneak ? d : 0;
          if (lt.bouncy) d = Math.ceil((P.fall * (1 - lt.bouncy) - CFG.FALL_SAFE));
          if (lt.id === 'powder_snow' || lt.id === 'scaffolding' || lt.id === 'cobweb' || FLU[getS(Math.floor(P.x), Math.floor(P.y), Math.floor(P.z))]) d = 0;
          if (d > 0) hurtPlayer(d, null, null, 'fall');
          else if (P.fall > 1) matSnd(lt.snd, 0, { x: P.x, y: P.y, z: P.z }, 1.4);
          if (P.fall > 1 && isT(land, 'farmland') && md !== 'creative') setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
          P.fall = 0;
        }
      } else if (P.y < P.py) P.fall += P.py - P.y;
      const hd = Math.hypot(P.x - P.px, P.z - P.pz);
      if (P.onGround && !nowW && !P.sneak) { P.walk += hd * .6; if (P.walk > P.nextStep) { P.nextStep = Math.floor(P.walk) + 1; const b = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (b) matSnd(TT[STT[b]].snd, 0, null); } }
      else if (P.onGround) P.walk += hd * .6;
      if (P.climbing && Math.abs(P.y - P.py) > .05 && tickN % 8 === 0) matSnd('ladder', 0, null);
      P.bob += ((P.onGround && !P.fly ? Math.min(.1, hd) : 0) - P.bob) * .4;
      if (P.sprint) exhaust(hd * CFG.EXH_SPRINT);
      if (nowW) exhaust(Math.hypot(hd, P.y - P.py) * CFG.EXH_SWIM);
      const tgtEye = P.sleeping ? .2 : P.sneak ? CFG.EYE_SNEAK : CFG.EYE;
      P.eye += (tgtEye - P.eye) * .5;
      P.h = P.sneak ? CFG.PH_SNEAK : CFG.PH;
      if (!P.sneak && !boxFree(P, 0, 0, 0, CFG.PH) && boxFree(P, 0, 0, 0, CFG.PH_SNEAK)) { P.sneak = true; P.h = CFG.PH_SNEAK; }
      P.eyeW = !spec && eyeIn(1);
      P.eyeL = !spec && eyeIn(2);
      if (P.eyeW && md !== 'creative' && !spec && !P.effects.waterBreathing) { if (--P.air <= -20) { P.air = 0; hurtPlayer(2, null, null, 'drown'); } } else P.air = Math.min(CFG.AIR_MAX, P.air + 5);
      if (inL && md !== 'creative' && !spec) { if (!P.effects.fireRes) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'lava'); } P.fire = 300; }
      if (!spec && blockIn(P, b => TT[STT[b]].fire)) { P.fire = Math.max(P.fire, 160); if (tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (P.fire > 0) { P.fire--; if (nowW || W.raining && skyOpenP()) P.fire = 0; if (P.fire % 20 === 0 && !inL && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (!spec && (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'magma_block')) && !P.sneak && tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire');
      if (!spec && blockIn({ x: P.x, y: P.y, z: P.z, w: P.w + .02, h: P.h }, b => TT[STT[b]].id === 'cactus') && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus');
      if (!spec && md !== 'creative' && !boxFree({ x: P.x, y: P.y + P.eye - .1, z: P.z, w: .2, h: .2 }, 0, 0, 0) && SOL[getS(Math.floor(P.x), Math.floor(P.y + P.eye), Math.floor(P.z))] === 1 && tickN % 10 === 0) hurtPlayer(1, null, null, 'suffocate');
      for (const k in P.effects) { if (P.effects[k] > 0) P.effects[k]--; else delete P.effects[k]; }
      if (P.effects.poison && tickN % 25 === 0 && P.hp > 1) hurtPlayer(1, null, null, 'magic');
      if (P.effects.regen && tickN % 50 === 0 && P.hp < 20) P.hp = Math.min(20, P.hp + 1);
      if (P.effects.hunger) exhaust(.005);
      if (md === 'survival' || md === 'adventure') {
        if (P.exh > 4) { P.exh -= 4; if (P.sat > 0) P.sat = Math.max(0, P.sat - 1); else if (W.diff > 0) P.food = Math.max(0, P.food - 1); }
        const natRegen = W.rules.naturalRegeneration !== false;
        if (natRegen && P.food >= 20 && P.sat > 0 && P.hp < 20) { if (++P.regenT >= 10) { const a = Math.min(P.sat, 6); P.hp = Math.min(20, P.hp + a / 6); exhaust(a); P.regenT = 0; } }
        else if (natRegen && P.food >= 18 && P.hp < 20) { if (++P.regenT >= CFG.REGEN_TICKS) { P.hp = Math.min(20, P.hp + 1); exhaust(CFG.EXH_REGEN); P.regenT = 0; } }
        else if (P.food <= 0) { if (++P.regenT >= CFG.REGEN_TICKS) { if (P.hp > (W.diff === 3 ? 0 : W.diff === 2 ? 1 : 10)) hurtPlayer(1, null, null, 'starve'); P.regenT = 0; } }
        else P.regenT = 0;
        if (W.diff === 0 && P.hp < 20 && tickN % 20 === 0) P.hp = Math.min(20, P.hp + 1);
        if (W.diff === 0 && P.food < 20 && tickN % 20 === 0) P.food++;
      }
      if (P.hp > 20) P.hp = 20;
    }
    const skyOpenP = () => (getL(Math.floor(P.x), Math.floor(P.y + 1.6), Math.floor(P.z)) >> 4) === 15;
    function eyeIn(fk) { const x = Math.floor(P.x), y = Math.floor(P.y + P.eye), z = Math.floor(P.z), b = getS(x, y, z); if (FLU[b] !== fk) return false; const lv = (b - TT[STT[b]].base) & 7, top = FLU[getS(x, y + 1, z)] === fk ? 1 : lv ? (8 - lv) / 9 : 8 / 9; return P.y + P.eye - y < top; }
