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
