    const SCHED = new Map(), SCHK = new Set();
    let simT = 0;
    function schedule(x, y, z, d, kind) {
      const k = x + ',' + y + ',' + z + ',' + kind;
      if (SCHK.has(k)) return;
      SCHK.add(k);
      const t = simT + Math.max(1, d | 0);
      let a = SCHED.get(t); if (!a) SCHED.set(t, a = []);
      a.push([x, y, z, kind, k]);
    }
    const isHost = () => NET.role !== 'guest';
    const WSTATE = l => S('water', { level: l }), LSTATE = l => S('lava', { level: l });
    const flv = s => (s - TT[STT[s]].base) & 15;
    const fState = (fk, l) => fk === 1 ? WSTATE(l) : LSTATE(l);
    function onSetHook(x, y, z, old, s, flags) {
      if (!isHost()) return;
      for (let d = 0; d < 6; d++) { const D = DIR6[d]; neighborChanged(x + D[0], y + D[1], z + D[2], x, y, z); }
      neighborChanged(x, y, z, x, y, z);
      const ot = TT[STT[old]];
      if (ot.tags.has('log') && !TT[STT[s]].tags.has('log')) for (let dy = -4; dy <= 4; dy++) for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { const b = getS(x + dx, y + dy, z + dz); if (LEAF[b] && !sv(b, 'persistent')) schedule(x + dx, y + dy, z + dz, 10 + ri(120), 'leaf'); }
      if (ot.redstone || TT[STT[s]].redstone || ot.power || TT[STT[s]].power || SOL[old] !== SOL[s]) redstoneAround(x, y, z);
      void flags;
    }
    function neighborChanged(x, y, z, sx, sy, sz) {
      const s = getS(x, y, z);
      if (!s) return;
      const t = TT[STT[s]];
      if (FLU[s]) { schedule(x, y, z, FLU[s] === 1 ? 5 : W.dim === 'nether' ? 10 : 30, 'fluid'); if (FLU[s] === 2) lavaContact(x, y, z, s); return; }
      if (t.grav) schedule(x, y, z, 2, 'fall');
      if (t.water && !FLU[s]) { }
      if (t.powder2) { for (const D of DIR6) if (D[1] !== -1 && FLU[getS(x + D[0], y + D[1], z + D[2])] === 1) { setBlock(x, y, z, TN[t.powder2].base); return; } }
      if (needsSupport(t)) schedule(x, y, z, 1, 'support');
      if (t.id === 'redstone_wire' || t.rtorch || t.rep || t.lamp || t.door || t.id.includes('trapdoor') || t.gate || t.tnt || t.bulb || t.piston || t.id === 'note_block') schedule(x, y, z, t.rtorch ? 2 : 1, 'red');
      void sx; void sy; void sz;
    }
    function needsSupport(t) { return t.plant || t.torch || t.attach || t.door || t.bed || t.tall || t.id === 'ladder' || t.id === 'vine' || t.id === 'sugar_cane' || t.id === 'cactus' || t.id === 'bamboo' || t.id.includes('carpet') || t.id === 'snow' || t.rail || t.id === 'lily_pad' || t.id === 'kelp' || t.id === 'kelp_plant' || t.id === 'scaffolding' || t.sign || t.id === 'cocoa' || t.id.includes('pressure_plate') || t.fire; }
    function supported(x, y, z, s, t) {
      const below = getS(x, y - 1, z), bt = TT[STT[below]];
      if (t.fire) return SOL[below] === 1 || hasFlammableNb(x, y, z);
      if (t.torch) { if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1; } return supportOK(x, y - 1, z, 2); }
      if (t.door) { const up = sv(s, 'half'); return up ? TT[STT[getS(x, y - 1, z)]] === t : supportOK(x, y - 1, z, 2) && TT[STT[getS(x, y + 1, z)]] === t; }
      if (t.tall) { const up = sv(s, 'half'); return up ? TT[STT[below]] === t : TT[STT[getS(x, y + 1, z)]] === t && (DIRTLIKE.has(bt.id) || t.water || bt.id.includes('sand') && t.id === 'tall_dry_grass'); }
      if (t.bed) { const hd = sv(s, 'part'), d = F4D[fq(s)], o = getS(x + (hd ? -d[0] : d[0]), y, z + (hd ? -d[1] : d[1])); return TT[STT[o]] === t; }
      if (t.id === 'ladder' || t.id.endsWith('wall_sign') || t.id === 'tripwire_hook') { const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1 || t.id.includes('sign') && SOL[getS(x - d[0], y, z - d[1])]; }
      if (t.id === 'vine') { if (sv(s, 'up') && SOL[getS(x, y + 1, z)]) return true; for (let q = 0; q < 4; q++) if (sv(s, FACE4[q])) { const d = F4D[q]; if (FULLT[getS(x + d[0], y, z + d[1])] || LEAF[getS(x + d[0], y, z + d[1])]) return true; } return isT(getS(x, y + 1, z), 'vine'); }
      if (t.id === 'cocoa') { const d = F4D[fq(s)]; const b = getS(x - d[0], y, z - d[1]); return TT[STT[b]].id.includes('jungle'); }
      if (t.id === 'shelf_mushroom') { const d = F4D[fq(s)]; return SOL[getS(x - d[0], y, z - d[1])] === 1; }
      if (t.pk.face !== undefined && t.attach) { const fc = sv(s, 'face'); if (fc === 0) return FULLT[below] === 1; if (fc === 2) return FULLT[getS(x, y + 1, z)] === 1; const d = F4D[fq(s)]; return FULLT[getS(x - d[0], y, z - d[1])] === 1; }
      if (t.attach === 4) return FULLT[getS(x, y + 1, z)] || (t.id === 'pale_hanging_moss' && (isT(getS(x, y + 1, z), 'pale_hanging_moss') || LEAF[getS(x, y + 1, z)]));
      if (t.attach === 2 && t.pk.facing !== undefined) { const f = sv(s, 'facing'); const d = f < 4 ? [-F4D[f][0], 0, -F4D[f][1]] : f === 4 ? [0, -1, 0] : [0, 1, 0]; return FULLT[getS(x + d[0], y + d[1], z + d[2])] === 1; }
      if (t.id === 'sugar_cane') return isT(below, 'sugar_cane') || ((DIRTLIKE.has(bt.id) || bt.id.includes('sand')) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => FLU[getS(x + a, y - 1, z + c)] === 1));
      if (t.id === 'cactus') { if (!(isT(below, 'cactus') || bt.id === 'sand' || bt.id === 'red_sand')) return false; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (SOL[getS(x + a, y, z + c)]) return false; return true; }
      if (t.id === 'bamboo') return isT(below, 'bamboo') || DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id === 'gravel';
      if (t.id === 'kelp' || t.id === 'kelp_plant') return isT(below, 'kelp_plant') || SOL[below] === 1;
      if (t.id === 'lily_pad') return FLU[below] === 1 || isT(below, 'ice');
      if (t.id === 'scaffolding') return true;
      if (t.crop === 'farm' || t.crop === 'stem' || t.id.startsWith('attached_')) return isT(below, t.soil || 'farmland');
      if (t.plant || t.attach === 3 || t.rail || t.id.includes('carpet') || t.id === 'snow' || t.id.includes('pressure_plate') || t.sign) {
        if (t.sign && !t.id.includes('wall') && !t.id.includes('hanging')) return SOL[below];
        if (t.sign && t.id.includes('hanging')) return SOL[getS(x, y + 1, z)];
        if (t.id === 'snow') return SOL[below] === 1 && !isT(below, 'ice') || LEAF[below];
        if (t.water) return SOL[below] === 1 || t.id === 'tall_seagrass';
        if (t.attach === 3 || t.rail || t.id.includes('carpet') || t.id.includes('pressure_plate')) return SOL[below] && !(FLU[below]) || supportOK(x, y - 1, z, 2);
        if (t.id === 'dead_bush' || t.id.includes('dry_grass')) return DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id.includes('terracotta');
        if (t.id.includes('mushroom') || t.id === 'cobweb' || t.id.includes('coral') || t.id === 'pointed_dripstone' || t.id === 'sea_pickle') return true;
        if (t.id.includes('fungus') || t.id.includes('roots') || t.id === 'nether_sprouts') return bt.id.includes('nylium') || DIRTLIKE.has(bt.id) || bt.id === 'soul_soil';
        if (t.id === 'nether_wart') return isT(below, 'soul_sand');
        if (t.id === 'leaf_litter') return SOL[below] === 1;
        return DIRTLIKE.has(bt.id);
      }
      return true;
    }
    function hasFlammableNb(x, y, z) { for (const D of DIR6) { const b = getS(x + D[0], y + D[1], z + D[2]); if (TT[STT[b]].flam) return true; } return false; }
    function popBlock(x, y, z, noDrop) {
      const s = getS(x, y, z), t = TT[STT[s]];
      if (!s) return;
      if (!noDrop && !t.fire) dropBlock(s, x, y, z, { tool: null });
      if (t.water) setBlock(x, y, z, WSTATE(0)); else setBlock(x, y, z, 0);
    }
    function lavaContact(x, y, z, s) {
      for (const D of DIR6) {
        if (D[1] === -1) continue;
        const b = getS(x + D[0], y + D[1], z + D[2]);
        if (FLU[b] === 1) { setBlock(x, y, z, S(flv(s) === 0 ? 'obsidian' : 'cobblestone')); snd('fizz', { x, y, z }); for (let i = 0; i < 6; i++) particle(x + RNG(), y + 1, z + RNG(), 0, .8, 0, [200, 200, 200], .8, .1, -.5, 1); return true; }
      }
      return false;
    }
    function fluidTick(x, y, z) {
      const s = getS(x, y, z), fk = FLU[s];
      if (!fk) return;
      const lv = flv(s), drop = fk === 1 ? 1 : W.dim === 'nether' ? 1 : 2, maxD = fk === 1 ? 7 : W.dim === 'nether' ? 7 : 6, rate = fk === 1 ? 5 : W.dim === 'nether' ? 10 : 30;
      if (fk === 2 && lavaContact(x, y, z, s)) return;
      let cur = lv;
      if (lv !== 0) {
        const up = getS(x, y + 1, z);
        let nl;
        if (FLU[up] === fk) nl = 8;
        else {
          let mn = 99, src = 0;
          for (let q = 0; q < 4; q++) { const d = F4D[q], b = getS(x + d[0], y, z + d[1]); if (FLU[b] !== fk) continue; const l = flv(b); if (l === 0) src++; const e = l >= 8 ? 0 : l; if (e < mn) mn = e; }
          nl = mn === 99 ? 99 : mn + drop;
          if (fk === 1 && src >= 2 && W.rules.waterSourceConversion !== false) { const bl = getS(x, y - 1, z); if (SOL[bl] === 1 || (FLU[bl] === 1 && flv(bl) === 0)) nl = 0; }
        }
        if (nl > maxD && nl !== 8) { setBlock(x, y, z, 0); return; }
        if (nl !== lv) { setBlock(x, y, z, fState(fk, nl)); cur = nl; }
      }
      const by = y - 1, bs = getS(x, by, z);
      const canInto = b => b >= 0 && (b === 0 || (REP[b] && !FLU[b]) || (FLU[b] === fk && flv(b) !== 0) || (!SOL[b] && !FLU[b] && TT[STT[b]].plant && !TT[STT[b]].water) || FLU[b] && FLU[b] !== fk);
      if (by >= 0 && canInto(bs) && !(FLU[bs] === fk && flv(bs) >= 8)) {
        if (FLU[bs] && FLU[bs] !== fk) { if (fk === 1) { setBlock(x, by, z, S(flv(bs) === 0 ? 'obsidian' : 'cobblestone')); } else setBlock(x, by, z, S('stone')); snd('fizz', { x, y: by, z }); return; }
        if (bs && !FLU[bs]) popBlock(x, by, z, fk === 2);
        setBlock(x, by, z, fState(fk, 8));
        if (cur !== 0) return;
      }
      if (by >= 0 && FLU[bs] === fk && flv(bs) >= 8 && cur !== 0) return;
      const nl = cur >= 8 ? drop : cur + drop;
      if (nl > maxD) return;
      if (by >= 0 && canInto(bs) && cur !== 0) return;
      const dirs = flowDirs(x, y, z, fk);
      for (const q of dirs) {
        const d = F4D[q], nx = x + d[0], nz2 = z + d[1], b = getS(nx, y, nz2);
        if (b < 0) continue;
        if (FLU[b] === fk) { if (flv(b) !== 0 && (flv(b) >= 8 ? false : flv(b) > nl)) setBlock(nx, y, nz2, fState(fk, nl)); continue; }
        if (FLU[b] && FLU[b] !== fk) { if (fk === 2) setBlock(nx, y, nz2, S(nl === 0 ? 'obsidian' : 'cobblestone')); else setBlock(nx, y, nz2, S(flv(b) === 0 ? 'obsidian' : 'cobblestone')); snd('fizz', { x: nx, y, z: nz2 }); continue; }
        if (!canInto(b)) continue;
        if (b) popBlock(nx, y, nz2, fk === 2);
        setBlock(nx, y, nz2, fState(fk, nl));
      }
      void rate;
    }
    function flowDirs(x, y, z, fk) {
      const best = [], lim = fk === 1 ? 4 : 2;
      let bd = 99;
      const passable = b => b >= 0 && (b === 0 || REP[b] || (!SOL[b] && TT[STT[b]].plant)) && !(FLU[b] === fk && flv(b) === 0);
      for (let q = 0; q < 4; q++) {
        const d = F4D[q], nx = x + d[0], nz2 = z + d[1], b = getS(nx, y, nz2);
        if (!passable(b) && !(FLU[b] === fk)) continue;
        if (FLU[b] === fk && flv(b) === 0) continue;
        let dist = 99;
        const st = [[nx, nz2, 1, q]], seen = new Set([nx + ',' + nz2]);
        while (st.length) {
          const [cx, cz, n, from] = st.shift();
          const bl = getS(cx, y - 1, cz);
          if (bl >= 0 && (bl === 0 || REP[bl] || (FLU[bl] === fk && flv(bl) !== 0))) { dist = n; break; }
          if (n >= lim) continue;
          for (let q2 = 0; q2 < 4; q2++) { if (q2 === ((from + 2) & 3)) continue; const e = F4D[q2], ex = cx + e[0], ez = cz + e[1], k = ex + ',' + ez; if (seen.has(k)) continue; seen.add(k); const bb = getS(ex, y, ez); if (passable(bb) || FLU[bb] === fk && flv(bb) !== 0) st.push([ex, ez, n + 1, q2]); }
        }
        if (dist < bd) { bd = dist; best.length = 0; best.push(q); } else if (dist === bd) best.push(q);
      }
      return best;
    }
    function tickSched() {
      simT++;
      const a = SCHED.get(simT);
      if (!a) return;
      SCHED.delete(simT);
      let n = 0;
      for (const [x, y, z, kind, k] of a) {
        SCHK.delete(k);
        if (++n > 4000) { schedule(x, y, z, 1, kind); continue; }
        const s = getS(x, y, z);
        if (s < 0) continue;
        const t = TT[STT[s]];
        if (kind === 'fluid') fluidTick(x, y, z);
        else if (kind === 'fall') { if (t.grav) { const b = getS(x, y - 1, z); if (y > 0 && b >= 0 && (b === 0 || FLU[b] || REP[b] || TT[STT[b]].fire)) { setBlock(x, y, z, 0); spawnFalling(s, x, y, z); } } }
        else if (kind === 'support') { if (needsSupport(t) && !supported(x, y, z, s, t)) { if (t.door || t.tall || t.bed) { const keepDrop = t.door ? !sv(s, 'half') : t.tall ? !sv(s, 'half') : !sv(s, 'part'); popBlock(x, y, z, !keepDrop); } else popBlock(x, y, z, t.fire); } }
        else if (kind === 'leaf') { if (LEAF[s] && !sv(s, 'persistent') && !logNear(x, y, z)) { dropBlock(s, x, y, z, {}); setBlock(x, y, z, 0); for (let i = 0; i < 3; i++) particle(x + RNG(), y + RNG(), z + RNG(), 0, -.5, 0, tileAvg(TIL[s * 6]), 1, .06, 2); } }
        else if (kind === 'button') { if (t.use === 'button' && sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', 0)); snd('click', { x, y, z }); redstoneAround(x, y, z); } }
        else if (kind === 'plate') { if (t.plate && sv(s, 'power') && !entOnPlate(x, y, z)) { setBlock(x, y, z, sw(s, 'power', 0)); snd('click', { x, y, z }); redstoneAround(x, y, z); } else if (t.plate && sv(s, 'power')) schedule(x, y, z, 10, 'plate'); }
        else if (kind === 'red') redstoneUpdate(x, y, z, s, t);
        else if (kind === 'rep') repeaterOut(x, y, z, s, t);
        else if (kind === 'compost') { if (t.id === 'composter' && sv(s, 'level') === 7) setBlock(x, y, z, sw(s, 'level', 8)); }
        else if (kind === 'obs') { if (t.id === 'observer' && sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', 0)); redstoneAround(x, y, z); } }
      }
    }
    function logNear(x, y, z) {
      const seen = new Set([x + ',' + y + ',' + z]), q = [[x, y, z, 0]];
      while (q.length) {
        const [cx, cy, cz, d] = q.shift();
        for (const D of DIR6) {
          const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2], k = nx + ',' + ny + ',' + nz2;
          if (seen.has(k)) continue; seen.add(k);
          const b = getS(nx, ny, nz2);
          if (b < 0) return true;
          if (TT[STT[b]].tags.has('log')) return true;
          if (LEAF[b] && d < 5) q.push([nx, ny, nz2, d + 1]);
        }
      }
      return false;
    }
    function entOnPlate(x, y, z) { for (const e of ENTS.concat(playersList())) { if ((e.kind === 'mob' || e.kind === 'item' || e === P || e.kind === 'player') && Math.floor(e.y + .05) === y && e.x + e.w / 2 > x + .06 && e.x - e.w / 2 < x + .94 && e.z + e.w / 2 > z + .06 && e.z - e.w / 2 < z + .94) return true; } return false; }
    function checkPlates() {
      for (const pl of [P].concat(ENTS.filter(e => e.kind === 'mob' || e.kind === 'item' || e.kind === 'player'))) {
        const x = Math.floor(pl.x), y = Math.floor(pl.y + .05), z = Math.floor(pl.z), s = getS(x, y, z), t = TT[STT[s]];
        if (t.plate && !sv(s, 'power')) { if (t.plateKind === 'mob' && pl.kind === 'item') continue; setBlock(x, y, z, sw(s, 'power', t.props[0][1].length > 2 ? 15 : 1)); snd('click', { x, y, z }); redstoneAround(x, y, z); schedule(x, y, z, 20, 'plate'); }
        if (t.id === 'tripwire_hook') { }
      }
    }
    function srcPower(x, y, z, toX, toY, toZ) {
      const s = getS(x, y, z); if (s <= 0) return 0;
      const t = TT[STT[s]];
      if (t.id === 'redstone_block') return 15;
      if (t.use === 'lever' || t.use === 'button') return sv(s, 'powered') ? 15 : 0;
      if (t.plate) return sv(s, 'power') ? (t.props[0][1].length > 2 ? sv(s, 'power') : 15) : 0;
      if (t.rtorch) { if (!sv(s, 'lit')) return 0; if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; if (toX === x - d[0] && toZ === z - d[1] && toY === y) return 0; } else if (toY === y - 1 && toX === x && toZ === z) return 0; return 15; }
      if (t.daylight) return sv(s, 'power');
      if (t.id === 'observer') { if (!sv(s, 'powered')) return 0; const f = sv(s, 'facing'), d = f < 4 ? [-F4D[f][0], 0, -F4D[f][1]] : f === 4 ? [0, -1, 0] : [0, 1, 0]; return toX === x + d[0] && toY === y + d[1] && toZ === z + d[2] ? 15 : 0; }
      if (t.rep) { if (!sv(s, 'powered')) return 0; const d = F4D[fq(s)]; return toX === x - d[0] && toZ === z - d[1] && toY === y ? 15 : 0; }
      if (t.id === 'tripwire_hook') return sv(s, 'powered') ? 15 : 0;
      if (t.id === 'target') return 0;
      return 0;
    }
    function strongPowered(x, y, z) {
      const s = getS(x, y, z); if (SOL[s] !== 1 || !OPQ[s]) return 0;
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if (nt.use === 'lever' || nt.use === 'button') { if (!sv(n, 'powered')) continue; const fc = sv(n, 'face'); const att = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : [-F4D[fq(n)][0], 0, -F4D[fq(n)][1]]; if (nx + att[0] === x && ny + att[1] === y && nz2 + att[2] === z) p = 15; }
        else if (nt.rtorch && D[1] === -1 && sv(n, 'lit')) p = 15;
        else if (nt.rep && sv(n, 'powered')) { const d = F4D[fq(n)]; if (nx - d[0] === x && nz2 - d[1] === z && ny === y) p = 15; }
        else if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power'));
        else if (nt.wire && D[1] === 0) { const w = sv(n, 'power'); if (w) { const m = nt.cmask(n, nbFn(nx, ny, nz2)); const q = [5, 1, -1, -1, 4, 0]; void q; const conn = m & 15, cnt = (conn & 1) + (conn >> 1 & 1) + (conn >> 2 & 1) + (conn >> 3 & 1); const dirTo = [3, 1, -1, -1, 0, 2][d6Index(-D[0], 0, -D[2])]; if (cnt === 0 || (conn & (1 << dirTo)) || (cnt === 1 && (conn & (1 << ((dirTo + 2) & 3))))) p = Math.max(p, w); } }
        else if (nt.plate && D[1] === 1) p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
      }
      return p;
    }
    const d6Index = (dx, dy, dz) => dx === 1 ? 0 : dx === -1 ? 1 : dy === 1 ? 2 : dy === -1 ? 3 : dz === 1 ? 4 : 5;
    function powerInto(x, y, z) {
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2];
        p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
        const n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if (nt.wire && D[1] !== 1) p = Math.max(p, sv(n, 'power'));
        if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power'));
        if (FULLT[n]) p = Math.max(p, strongPowered(nx, ny, nz2));
        if (p >= 15) return 15;
      }
      return p;
    }
    function redstoneAround(x, y, z) {
      if (!isHost()) return;
      const seen = new Set();
      for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 3) continue;
        const nx = x + dx, ny = y + dy, nz2 = z + dz, s = getS(nx, ny, nz2), t = TT[STT[s]];
        if (s <= 0) continue;
        if (t.wire) { const k = nx + ',' + ny + ',' + nz2; if (!seen.has(k)) wireNet(nx, ny, nz2, seen); }
        else if (t.rtorch || t.rep || t.lamp || t.door || t.id.includes('trapdoor') || t.gate || t.tnt || t.bulb || t.id === 'note_block' || t.piston || t.rail) schedule(nx, ny, nz2, t.rtorch ? 2 : 1, 'red');
      }
    }
    function wireNet(x, y, z, seen) {
      const net = [], q = [[x, y, z]], key = (a, b, c) => a + ',' + b + ',' + c;
      seen.add(key(x, y, z));
      while (q.length && net.length < 2000) {
        const [cx, cy, cz] = q.shift(); net.push([cx, cy, cz]);
        for (let qd = 0; qd < 4; qd++) { const d = F4D[qd]; for (const dy of [0, 1, -1]) { const nx = cx + d[0], ny = cy + dy, nz2 = cz + d[1]; const n = getS(nx, ny, nz2); if (!TT[STT[n]].wire) continue; if (dy === 1 && FULLT[getS(cx, cy + 1, cz)]) continue; if (dy === -1 && FULLT[getS(nx, cy, nz2)]) continue; const k = key(nx, ny, nz2); if (seen.has(k)) continue; seen.add(k); q.push([nx, ny, nz2]); } }
      }
      const P2 = new Map();
      for (const [cx, cy, cz] of net) {
        let p = 0;
        for (const D of DIR6) { const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2], n = getS(nx, ny, nz2); if (TT[STT[n]].wire) continue; p = Math.max(p, srcPower(nx, ny, nz2, cx, cy, cz)); if (FULLT[n] && D[1] !== 1) p = Math.max(p, strongSrcOnly(nx, ny, nz2)); if (FULLT[n] && D[1] === 1) p = Math.max(p, strongSrcOnly(nx, ny, nz2)); }
        P2.set(key(cx, cy, cz), p);
      }
      const order = net.slice().sort((a, b) => P2.get(key(...b)) - P2.get(key(...a)));
      const qq = order.filter(n => P2.get(key(...n)) > 1);
      while (qq.length) {
        const [cx, cy, cz] = qq.shift(), p = P2.get(key(cx, cy, cz));
        for (let qd = 0; qd < 4; qd++) { const d = F4D[qd]; for (const dy of [0, 1, -1]) { const k = key(cx + d[0], cy + dy, cz + d[1]); if (!P2.has(k)) continue; if (P2.get(k) < p - 1) { P2.set(k, p - 1); qq.push([cx + d[0], cy + dy, cz + d[1]]); } } }
      }
      for (const [cx, cy, cz] of net) {
        const s = getS(cx, cy, cz), np = P2.get(key(cx, cy, cz));
        if (sv(s, 'power') !== np) { setBlock(cx, cy, cz, sw(s, 'power', np), 2); for (const D of DIR6) { const nx = cx + D[0], ny = cy + D[1], nz2 = cz + D[2]; const n = getS(nx, ny, nz2), nt = TT[STT[n]]; if (!nt.wire && (nt.redstone || nt.lamp || nt.door || nt.gate || nt.id.includes('trapdoor') || nt.tnt || nt.rail)) schedule(nx, ny, nz2, 1, 'red'); if (FULLT[n]) for (const E of DIR6) { const m = getS(nx + E[0], ny + E[1], nz2 + E[2]), mt = TT[STT[m]]; if (!mt.wire && (mt.redstone || mt.lamp || mt.door || mt.gate || mt.id.includes('trapdoor') || mt.tnt)) schedule(nx + E[0], ny + E[1], nz2 + E[2], mt.rtorch ? 2 : 1, 'red'); } } }
      }
    }
    function strongSrcOnly(x, y, z) {
      let p = 0;
      for (const D of DIR6) {
        const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]];
        if ((nt.use === 'lever' || nt.use === 'button') && sv(n, 'powered')) { const fc = sv(n, 'face'); const att = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : [-F4D[fq(n)][0], 0, -F4D[fq(n)][1]]; if (nx + att[0] === x && ny + att[1] === y && nz2 + att[2] === z) p = 15; }
        else if (nt.rtorch && D[1] === -1 && sv(n, 'lit')) p = 15;
        else if (nt.rep && sv(n, 'powered')) { const d = F4D[fq(n)]; if (nx - d[0] === x && nz2 - d[1] === z && ny === y) p = 15; }
        else if (nt.plate && D[1] === 1) p = Math.max(p, srcPower(nx, ny, nz2, x, y, z));
      }
      return p;
    }
    function redstoneUpdate(x, y, z, s, t) {
      if (t.wire) { wireNet(x, y, z, new Set()); return; }
      if (t.rtorch) {
        let ax = x, ay = y - 1, az = z;
        if (t.id.startsWith('wall_')) { const d = F4D[fq(s)]; ax = x - d[0]; ay = y; az = z - d[1]; }
        const pw = FULLT[getS(ax, ay, az)] ? Math.max(strongPowered(ax, ay, az), powerIntoBlock(ax, ay, az)) : 0;
        const lit = pw > 0 ? 0 : 1;
        if (sv(s, 'lit') !== lit) { setBlock(x, y, z, sw(s, 'lit', lit)); redstoneAround(x, y, z); }
        return;
      }
      if (t.rep) { const d = F4D[fq(s)], bx = x + d[0], bz = z + d[1]; const inP = Math.max(srcPower(bx, y, bz, x, y, z), TT[STT[getS(bx, y, bz)]].wire ? sv(getS(bx, y, bz), 'power') : 0, FULLT[getS(bx, y, bz)] ? strongPowered(bx, y, bz) : 0) > 0 ? 1 : 0; if (inP !== sv(s, 'powered')) schedule(x, y, z, (sv(s, 'delay') + 1) * 2, 'rep'); return; }
      const p = powerInto(x, y, z) > 0 ? 1 : 0;
      if (t.lamp) { if (sv(s, 'lit') !== p) setBlock(x, y, z, sw(s, 'lit', p)); return; }
      if (t.tnt && p) { setBlock(x, y, z, 0); spawnTNT(x, y, z); return; }
      if ((t.door || t.id.includes('trapdoor') || t.gate) && t.pk.powered !== undefined) {
        let pp = p;
        if (t.door) { const oy = sv(s, 'half') ? -1 : 1; pp = Math.max(p, powerInto(x, y + oy, z) > 0 ? 1 : 0); }
        if (sv(s, 'powered') !== pp) { let ns = sw(sw(s, 'powered', pp), 'open', pp); setBlock(x, y, z, ns); if (t.door) { const oy = sv(s, 'half') ? -1 : 1, o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, sw(sw(o, 'powered', pp), 'open', pp)); } snd(pp ? 'door_open' : 'door_close', { x, y, z }); }
        return;
      }
      if (t.bulb) { if (p !== sv(s, 'powered')) { let ns = sw(s, 'powered', p); if (p) ns = sw(ns, 'lit', sv(s, 'lit') ? 0 : 1); setBlock(x, y, z, ns); } return; }
      if (t.id === 'note_block') { if (p !== sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', p)); if (p) noteSnd(sv(s, 'note'), getS(x, y - 1, z), { x, y, z }); } return; }
      if (t.rail && t.pk.powered !== undefined && t.id !== 'detector_rail') { if (sv(s, 'powered') !== p) setBlock(x, y, z, sw(s, 'powered', p)); return; }
      if (t.piston) pistonUpdate(x, y, z, s, t, p);
    }
    function powerIntoBlock(x, y, z) { let p = 0; for (const D of DIR6) { const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], n = getS(nx, ny, nz2), nt = TT[STT[n]]; if (nt.wire && D[1] === 1) p = Math.max(p, sv(n, 'power')); else if (nt.wire && D[1] === 0 && sv(n, 'power')) { const m = nt.cmask(n, nbFn(nx, ny, nz2)) & 15; const dirTo = [3, 1, -1, -1, 0, 2][d6Index(-D[0], 0, -D[2])]; const cnt = (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1); if (cnt === 0 || (m & (1 << dirTo)) || (cnt === 1 && (m & (1 << ((dirTo + 2) & 3))))) p = Math.max(p, sv(n, 'power')); } } return p; }
    function repeaterOut(x, y, z, s, t) {
      if (!t.rep) return;
      const d = F4D[fq(s)], bx = x + d[0], bz = z + d[1];
      const inP = Math.max(srcPower(bx, y, bz, x, y, z), TT[STT[getS(bx, y, bz)]].wire ? sv(getS(bx, y, bz), 'power') : 0, FULLT[getS(bx, y, bz)] ? strongPowered(bx, y, bz) : 0) > 0 ? 1 : 0;
      if (inP !== sv(s, 'powered')) { setBlock(x, y, z, sw(s, 'powered', inP)); redstoneAround(x - d[0], y, z - d[1]); redstoneAround(x, y, z); }
    }
    function pistonUpdate(x, y, z, s, t, p) {
      const f = sv(s, 'facing'), ext = sv(s, 'extended'), D = f < 4 ? [F4D[f][0], 0, F4D[f][1]] : f === 4 ? [0, 1, 0] : [0, -1, 0];
      if (p && !ext) {
        const line = []; let cx = x + D[0], cy = y + D[1], cz = z + D[2];
        for (let k = 0; k < 13; k++) { const b = getS(cx, cy, cz); if (b === 0 || REP[b] || FLU[b]) break; const bt = TT[STT[b]]; if (bt.hard < 0 || bt.id === 'obsidian' || bt.id.includes('obsidian') || bt.cont || bt.use === 'furnace') return; if (k === 12) return; line.push([cx, cy, cz, b]); cx += D[0]; cy += D[1]; cz += D[2]; }
        const end = getS(cx, cy, cz); if (end && !REP[end] && !FLU[end]) return; if (end && REP[end] && !FLU[end]) popBlock(cx, cy, cz);
        for (let i = line.length - 1; i >= 0; i--) { const [bx, by, bz, b] = line[i]; const bt = TT[STT[b]]; if (bt.plant || bt.torch) { popBlock(bx, by, bz); continue; } setBlock(bx + D[0], by + D[1], bz + D[2], b); }
        setBlock(x + D[0], y + D[1], z + D[2], 0);
        setBlock(x, y, z, sw(s, 'extended', 1)); snd('piston_out', { x, y, z });
      } else if (!p && ext) {
        setBlock(x, y, z, sw(s, 'extended', 0)); snd('piston_in', { x, y, z });
        if (t.piston === 2) { const fx = x + D[0] * 2, fy = y + D[1] * 2, fz = z + D[2] * 2, b = getS(fx, fy, fz), bt = TT[STT[b]]; if (b && !FLU[b] && bt.hard >= 0 && SOL[b] === 1 && !bt.cont) { setBlock(x + D[0], y + D[1], z + D[2], b); setBlock(fx, fy, fz, 0); } }
      }
    }
    const BE = () => W.be;
    const bk = (x, y, z) => x + ',' + y + ',' + z;
    function beAt(x, y, z, create) { const k = bk(x, y, z); let b = W.be.get(k); if (!b && create) { b = {}; W.be.set(k, b); } return b; }
    function initBlockEntity(x, y, z, t, it) {
      const k = bk(x, y, z);
      if (t.cont) W.be.set(k, { items: it && it.x && it.x.items ? it.x.items.map(d => d && { ...d }) : new Array(t.cont).fill(null) });
      if (t.use === 'furnace') W.be.set(k, { i: null, f: null, o: null, b: 0, bm: 0, c: 0, xp: 0, kind: t.fkind });
      if (t.sign) W.be.set(k, { text: ['', '', '', ''] });
    }
    function removeBlockEntity(x, y, z, drop) {
      const k = bk(x, y, z), b = W.be.get(k);
      if (!b) return;
      const s = getS(x, y, z), t = TT[STT[s]];
      W.be.delete(k);
      if (!drop) return;
      if (t.shulker) { spawnItem({ id: IN[t.id].idx, n: 1, x: { items: b.items } }, x + .5, y + .5, z + .5); return; }
      if (b.items) for (const st of b.items) if (st) spawnItem(st, x + .5, y + .5, z + .5);
      for (const k2 of ['i', 'f', 'o']) if (b[k2]) spawnItem(b[k2], x + .5, y + .5, z + .5);
      if (b.disc) { spawnItem(b.disc, x + .5, y + 1, z + .5); stopDisc(); }
      if (b.xp >= 1) spawnXp(Math.floor(b.xp), x + .5, y + .5, z + .5);
    }
    function tickFurnaces() {
      W.be.forEach((F, k) => {
        if (F.kind === undefined) return;
        const fast = F.kind !== 'furnace', ct = fast ? 100 : 200;
        const was = F.b > 0;
        if (F.b > 0) F.b--;
        const r = F.i && SMELT[F.i.id];
        const okKind = r && (F.kind === 'furnace' || (F.kind === 'blast_furnace' && SM_BLAST.has(F.i.id)) || (F.kind === 'smoker' && SM_SMOKE.has(F.i.id)));
        const can = okKind && (!F.o || (F.o.id === r[0] && F.o.n < IT[r[0]].stack));
        if (F.b === 0 && can && F.f && fuelOf(F.f.id)) { F.bm = F.b = fast ? fuelOf(F.f.id) / 2 : fuelOf(F.f.id); if (IT[F.f.id].id === 'lava_bucket') F.f = { id: IN.bucket.idx, n: 1 }; else if (--F.f.n <= 0) F.f = null; }
        if (F.b > 0 && can) { if (++F.c >= ct) { F.c = 0; if (--F.i.n <= 0) F.i = null; if (F.o) F.o.n++; else F.o = { id: r[0], n: 1, d: 0 }; F.xp += r[1]; } }
        else F.c = Math.max(0, F.c - 2);
        F.ct = ct;
        if (was !== F.b > 0) { const [x, y, z] = k.split(',').map(Number), s = getS(x, y, z); if (TT[STT[s]].use === 'furnace') setBlock(x, y, z, sw(s, 'lit', F.b > 0 ? 1 : 0)); }
      });
    }
    function randomTicks() {
      const rs = W.rules.randomTickSpeed ?? 3;
      if (!rs) return;
      const cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4, R2 = Math.min(SET.rd, 6);
      const centers = [[cx0, cz0]];
      for (const e of ENTS) if (e.kind === 'player') centers.push([Math.floor(e.x) >> 4, Math.floor(e.z) >> 4]);
      const done = new Set();
      for (const [ccx, ccz] of centers) for (let dz = -R2; dz <= R2; dz++) for (let dx = -R2; dx <= R2; dx++) {
        const c = colAt(ccx + dx, ccz + dz); if (!c || c.st < 2) continue;
        const k = ck(c.cx, c.cz); if (done.has(k)) continue; done.add(k);
        for (let sy = 0; sy <= c.top; sy++) {
          const sec = c.s[sy]; if (!sec) continue;
          for (let i = 0; i < rs; i++) {
            const li = ri(4096), s = sec[li]; if (!s) continue;
            const t = TT[STT[s]];
            if (!t.tick && !t.crop && !t.sapling && !LEAF[s] && t.id !== 'grass_block' && t.id !== 'mycelium' && t.id !== 'farmland' && !t.fire && t.id !== 'ice' && t.id !== 'snow' && t.ox === undefined && t.id !== 'dirt' && !FLU[s]) continue;
            randomTick(c.cx * 16 + (li & 15), sy * 16 + (li >> 8), c.cz * 16 + (li >> 4 & 15), s, t);
          }
        }
      }
    }
    function randomTick(x, y, z, s, t) {
      const L = getL(x, y + 1, z), sky = (L >> 4) * U.sky.value, light = Math.max(sky, L & 15);
      if (t.id === 'grass_block' || t.id === 'mycelium') {
        const up = getS(x, y + 1, z);
        if ((LAT[up] >= 15 || FLU[up]) && !isT(up, 'snow')) { setBlock(x, y, z, S('dirt')); return; }
        if (light >= 9) for (let k = 0; k < 4; k++) { const nx = x + ri(3) - 1, ny = y + ri(5) - 3, nz2 = z + ri(3) - 1; if (isT(getS(nx, ny, nz2), 'dirt') && LAT[getS(nx, ny + 1, nz2)] < 15 && !FLU[getS(nx, ny + 1, nz2)] && Math.max(getL(nx, ny + 1, nz2) >> 4, getL(nx, ny + 1, nz2) & 15) >= 4) setBlock(nx, ny, nz2, S(t.id)); }
        return;
      }
      if (t.id === 'farmland') {
        let wet = false;
        for (let dz = -4; dz <= 4 && !wet; dz++) for (let dx = -4; dx <= 4 && !wet; dx++) for (let dy = 0; dy <= 1; dy++) if (FLU[getS(x + dx, y + dy, z + dz)] === 1) { wet = true; break; }
        if (W.raining && (getL(x, y + 1, z) >> 4) === 15) wet = true;
        const m = sv(s, 'moisture');
        if (wet) { if (m < 7) setBlock(x, y, z, sw(s, 'moisture', 7)); }
        else if (m > 0) setBlock(x, y, z, sw(s, 'moisture', m - 1));
        else if (!TT[STT[getS(x, y + 1, z)]].crop) setBlock(x, y, z, S('dirt'));
        return;
      }
      if (t.crop === 'farm' || t.id === 'torchflower_crop') {
        if (light < 9 && t.id !== 'nether_wart') return;
        const a = sv(s, 'age'); if (a >= t.maxAge) return;
        const soil = getS(x, y - 1, z), moist = isT(soil, 'farmland') && sv(soil, 'moisture') > 0;
        const f = moist ? 3 : 1, ch = t.id === 'nether_wart' ? .1 : 1 / (Math.floor(25 / f) + 1);
        if (RNG() < ch) setBlock(x, y, z, sw(s, 'age', a + 1));
        return;
      }
      if (t.crop === 'stem') {
        if (light < 9) return;
        const a = sv(s, 'age');
        if (RNG() > .3) return;
        if (a < 7) { setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
        const q = ri(4), d = F4D[q], fx = x + d[0], fz = z + d[1];
        for (let k = 0; k < 4; k++) { const e = F4D[k]; if (isT(getS(x + e[0], y, z + e[1]), t.fruit)) return; }
        const below = getS(fx, y - 1, fz);
        if (!getS(fx, y, fz) && (DIRTLIKE.has(TT[STT[below]].id) || isT(below, 'farmland'))) { setBlock(fx, y, fz, S(t.fruit)); setBlock(x, y, z, S('attached_' + t.fruit + '_stem', { facing: FACE4[q] })); }
        return;
      }
      if (t.crop === 'berry') { const a = sv(s, 'age'); if (a < 3 && light >= 9 && RNG() < .2) setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
      if (t.id === 'cocoa') { const a = sv(s, 'age'); if (a < 2 && RNG() < .2) setBlock(x, y, z, sw(s, 'age', a + 1)); return; }
      if (t.sapling) { if (light >= 9 && RNG() < 1 / 7) { if (sv(s, 'stage') === 0 && t.pk.stage !== undefined) setBlock(x, y, z, sw(s, 'stage', 1)); else growTree(x, y, z, t.sapling); } return; }
      if (t.crop === 'cane' || t.crop === 'cactus') {
        if (getS(x, y + 1, z)) return;
        let h = 1; while (TT[STT[getS(x, y - h, z)]] === t) h++;
        if (h >= 3) return;
        const a = sv(s, 'age');
        if (a >= 15) { setBlock(x, y + 1, z, t.base); setBlock(x, y, z, sw(s, 'age', 0)); if (t.crop === 'cactus' && !supported(x, y + 1, z, t.base, t)) popBlock(x, y + 1, z); }
        else setBlock(x, y, z, sw(s, 'age', a + 1));
        return;
      }
      if (t.id === 'kelp') { const a = sv(s, 'age'); if (a < 25 && FLU[getS(x, y + 1, z)] === 1 && flv(getS(x, y + 1, z)) === 0 && RNG() < .14) { setBlock(x, y, z, S('kelp_plant')); setBlock(x, y + 1, z, S('kelp', { age: a + 1 })); } return; }
      if (t.id === 'bamboo') { let h = 1; while (isT(getS(x, y - h, z), 'bamboo')) h++; if (h < 12 && !getS(x, y + 1, z) && light >= 9 && RNG() < .3) { setBlock(x, y + 1, z, S('bamboo', { leaves: 'large' })); if (h > 1) setBlock(x, y, z, S('bamboo', { leaves: 'small' })); } return; }
      if (LEAF[s]) { if (!sv(s, 'persistent') && RNG() < .05 && !logNear(x, y, z)) schedule(x, y, z, 1 + ri(20), 'leaf'); return; }
      if (t.fire) { fireTick(x, y, z, s); return; }
      if (t.id === 'ice') { if ((L & 15) > 11) setBlock(x, y, z, W.dim === 'nether' ? 0 : WSTATE(0)); return; }
      if (t.id === 'snow') { if ((L & 15) > 11) popBlock(x, y, z); return; }
      if (t.tick === 'bud') { if (RNG() < .2) { const f = ri(6), D = DIR6[[5, 0, 4, 1, 2, 3][f]], nx = x + D[0], ny = y + D[1], nz2 = z + D[2], b = getS(nx, ny, nz2), seq = ['small_amethyst_bud', 'medium_amethyst_bud', 'large_amethyst_bud', 'amethyst_cluster'], fn = ['north', 'east', 'south', 'west', 'up', 'down'][f]; if (!b || FLU[b] === 1) setBlock(nx, ny, nz2, S(seq[0], { facing: fn })); else { const i = seq.indexOf(TT[STT[b]].id); if (i >= 0 && i < 3) setBlock(nx, ny, nz2, S(seq[i + 1], { facing: svn(b, 'facing') })); } } return; }
      if (t.ox !== undefined && t.ox >= 0 && t.ox < 3 && RNG() < .0006) { const nm = t.id, pre = ['', 'exposed_', 'weathered_', 'oxidized_']; let base = nm; for (const p of pre.slice(1)) if (nm.startsWith(p)) base = nm.slice(p.length); if (base === 'copper_block') base = 'copper'; const nn = pre[t.ox + 1] + (base === 'copper' ? 'copper' : base); if (TN[nn]) setBlock(x, y, z, sameProps(s, TN[nn])); return; }
      if (W.raining && t.id !== 'snow') { }
    }
    function fireTick(x, y, z, s) {
      if (W.rules.doFireTick === false) return;
      const below = getS(x, y - 1, z), inf = isT(below, 'netherrack') || isT(below, 'magma_block') || isT(below, 'soul_sand');
      if (W.raining && (getL(x, y, z) >> 4) === 15 && RNG() < .5 && !inf) { setBlock(x, y, z, 0); return; }
      const age = sv(s, 'age');
      if (age < 15) setBlock(x, y, z, sw(s, 'age', Math.min(15, age + ri(3) / 2 + 1 | 0)), 2);
      if (!inf && !hasFlammableNb(x, y, z) && (SOL[below] !== 1 || age > 3)) { setBlock(x, y, z, 0); return; }
      if (!inf && age === 15 && RNG() < .25 && !TT[STT[below]].flam) { setBlock(x, y, z, 0); return; }
      for (const D of DIR6) { const nx = x + D[0], ny = y + D[1], nz2 = z + D[2], b = getS(nx, ny, nz2), bt = TT[STT[b]]; if (bt.flam && RNG() < .12) { if (bt.tnt) { setBlock(nx, ny, nz2, 0); spawnTNT(nx, ny, nz2); } else setBlock(nx, ny, nz2, RNG() < .4 ? S('fire') : 0); } }
      for (let k = 0; k < 2; k++) { const nx = x + ri(3) - 1, ny = y + ri(4) - 1, nz2 = z + ri(3) - 1; if (!getS(nx, ny, nz2) && hasFlammableNb(nx, ny, nz2) && RNG() < .3) setBlock(nx, ny, nz2, S('fire')); }
    }
    function growTree(x, y, z, kind) {
      const k = kind === 'azalea' ? 'oak' : kind === 'crimson' || kind === 'warped' ? null : kind;
      if (!k) { setBlock(x, y, z, 0); const st = kind + '_stem', wb = kind === 'crimson' ? 'nether_wart_block' : 'warped_wart_block'; const h = 4 + ri(6); for (let i = 0; i < h; i++) setBlock(x, y + i, z, S(st)); for (let dy = h - 3; dy <= h; dy++) { const r = dy === h ? 1 : 2; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (!getS(x + dx, y + dy, z + dz) && RNG() < .8) setBlock(x + dx, y + dy, z + dz, S(wb)); } return; }
      const big2 = (k === 'dark_oak' || k === 'pale_oak');
      if (big2) { let ok = false; for (const [ox, oz] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) { const tt = TN[k + '_sapling']; if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, c]) => TT[STT[getS(x + ox + a, y, z + oz + c)]] === tt)) { x += ox; z += oz; ok = true; break; } } if (!ok) return; for (const [a, c] of [[0, 0], [1, 0], [0, 1], [1, 1]]) setBlock(x + a, y, z + c, 0); }
      const LOG = S((k === 'mangrove' ? 'mangrove' : k) + '_log'), LEAVES = k === 'poplar' ? S(['red_poplar_leaves', 'orange_poplar_leaves', 'yellow_poplar_leaves'][ri(3)]) : S(k + '_leaves');
      const hgt = { oak: 4 + ri(3), birch: 5 + ri(3), spruce: 6 + ri(4), jungle: 4 + ri(8), acacia: 5 + ri(3), dark_oak: 6 + ri(3), cherry: 5 + ri(3), pale_oak: 6 + ri(3), mangrove: 5 + ri(3), poplar: 7 + ri(4) }[k] || 5;
      for (let i = 1; i <= hgt + 1; i++) { const b = getS(x, y + i, z); if (b && !REP[b] && !LEAF[b]) return; }
      if (!big2) setBlock(x, y, z, 0);
      const setL2 = (a, b, c) => { const cur = getS(a, b, c); if (!cur || REP[cur]) setBlock(a, b, c, LEAVES); };
      if (k === 'spruce') { for (let dy = 2; dy <= hgt + 1; dy++) { const r = dy > hgt ? 0 : ((hgt - dy) % 2 === 0 ? 1 : 2) - (dy < 3 ? 0 : 0); for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (!(r > 0 && Math.abs(dx) === r && Math.abs(dz) === r)) setL2(x + dx, y + dy, z + dz); } }
      else if (k === 'acacia') { const d = F4D[ri(4)]; let tx = x, tz = z; for (let i = 0; i < hgt; i++) { if (i >= hgt - 3) { tx += d[0]; tz += d[1]; } setBlock(tx, y + i, tz, LOG); } for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dz) <= 3) setL2(tx + dx, y + hgt, tz + dz); for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) setL2(tx + dx, y + hgt + 1, tz + dz); return; }
      else if (big2) { for (let dy = hgt - 2; dy <= hgt + 1; dy++) { const r = dy === hgt + 1 ? 2 : 3; for (let dz = -r; dz <= r + 1; dz++) for (let dx = -r; dx <= r + 1; dx++) if (dx * dx + dz * dz <= r * r + 2) setL2(x + dx, y + dy, z + dz); } for (let i = 0; i < hgt; i++) for (const [a, c] of [[0, 0], [1, 0], [0, 1], [1, 1]]) setBlock(x + a, y + i, z + c, LOG); return; }
      else if (k === 'cherry') { for (let dy = hgt - 2; dy <= hgt + 1; dy++) { const r = dy >= hgt ? 2 : 3; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r + 1 && RNG() < .9) setL2(x + dx, y + dy, z + dz); } }
      else if (k === 'poplar') { for (let dy = hgt - 6; dy <= hgt + 2; dy++) { const r = dy > hgt ? 1 : dy < hgt - 4 ? 2 : 3; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dz * dz <= r * r && RNG() < .92) setL2(x + dx, y + dy, z + dz); } }
      else { for (let dy = hgt - 3; dy <= hgt; dy++) { const r = dy >= hgt - 1 ? 1 : 2; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { if (Math.abs(dx) === r && Math.abs(dz) === r && (dy === hgt || RNG() < .5)) continue; setL2(x + dx, y + dy, z + dz); } } }
      for (let i = 0; i < hgt; i++) setBlock(x, y + i, z, LOG);
      const dl = getS(x, y - 1, z); if (isT(dl, 'grass_block')) setBlock(x, y - 1, z, S('dirt'));
    }
