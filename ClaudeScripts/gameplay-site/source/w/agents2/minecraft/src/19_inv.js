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
    function invMove() {
      if (!drag) return;
      if (drag.scroll) { const [, oy] = pRect, rowsN = Math.ceil(tabList(cTab).length / 9); cScroll = Math.round(clamp((my - oy - 18) / 110, 0, 1) * Math.max(0, rowsN - 5)); return; }
      const sl = slotAt(mx, my);
      if (!sl || drag.list.includes(sl) || !cursor) return;
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
        g.fillStyle = '#000'; g.fillRect(ox + 25, oy + 7, 52, 72); g.fillStyle = '#2a2a2a'; g.fillRect(ox + 26, oy + 8, 50, 70);
        drawPlayerModel(ox + 51, oy + 24, 1.7);
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
          g.fillStyle = '#000'; g.fillRect(ox + 72, oy + 5, 34, 45); g.fillStyle = '#2a2a2a'; g.fillRect(ox + 73, oy + 6, 32, 43);
          drawPlayerModel(ox + 89, oy + 16, 1);
        }
      }
      for (const sl of slots) {
        if (sl.g === 'trash') { frame(sl.x, sl.y, 18); g.strokeStyle = '#a03030'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sl.x + 3, sl.y + 3); g.lineTo(sl.x + 13, sl.y + 13); g.moveTo(sl.x + 13, sl.y + 3); g.lineTo(sl.x + 3, sl.y + 13); g.stroke(); continue; }
        if (sl.g === 'out' || sl.g === 'scout' || sl.g === 'fout') { g.fillStyle = '#373737'; g.fillRect(sl.x - 5, sl.y - 5, 26, 26); g.fillStyle = '#fff'; g.fillRect(sl.x - 4, sl.y - 4, 25, 25); g.fillStyle = '#8b8b8b'; g.fillRect(sl.x - 4, sl.y - 4, 24, 24); }
        else drawSlotBg(sl);
        const st = sl.get();
        if (!st && sl.g === 'armor') { g.globalAlpha = .35; g.drawImage(I.aC, sl.x + 4, sl.y + 4); g.globalAlpha = 1; }
        if (!st && sl.g === 'off') { g.fillStyle = 'rgba(60,60,60,.4)'; g.fillRect(sl.x + 4, sl.y + 2, 8, 11); }
        drawItem(st, sl.x, sl.y);
        if (drag && drag.list && drag.list.includes(sl)) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(sl.x, sl.y, 16, 16); }
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
    function drawSign() {
      g.fillStyle = 'rgba(16,16,16,.6)'; g.fillRect(0, 0, GW, GH);
      textC('Edit Sign Message', GW / 2, 20, '#ffffff');
      const w = 104, x = (GW - w) >> 1, y = 44;
      const s = guiPos ? getS(guiPos[0], guiPos[1], guiPos[2]) : 0, t = TT[STT[s]], tl = t && TIL[t.base * 6 + 4] >= 0 ? TIL[t.base * 6 + 4] : 0, col = tileAvg(tl);
      g.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; g.fillRect(x, y, w, 56); ring(x, y, w, 56, 1, 'rgba(0,0,0,.5)');
      if (!/hanging/.test(t ? t.id : '')) { g.fillStyle = `rgb(${col[0] * .6 | 0},${col[1] * .6 | 0},${col[2] * .6 | 0})`; g.fillRect(x + w / 2 - 4, y + 56, 8, 40); }
      if (focusKey === 'sign') signLines[signLine] = inp.value.slice(0, 15);
      for (let i = 0; i < 4; i++) {
        const v = signLines[i] + (i === signLine && (performance.now() / 300 | 0) % 2 ? '_' : '');
        textC(v, GW / 2, y + 6 + i * 12, '#000000', false);
        if (inR(mx, my, { x, y: y + 4 + i * 12, w, h: 12 })) { }
      }
      fields.push({ key: 'sign', x, y: y + 4 + signLine * 12, w, h: 12, maxLen: 15, onEnter: () => { signLine = (signLine + 1) % 4; focusField('sign', signLines[signLine], 15); } });
      button(GW / 2 - 100, GH - 40, 200, 20, 'Done', () => closeGui());
      for (let i = 0; i < 4; i++) btns.push({ x, y: y + 4 + i * 12, w, h: 12, en: true, fn: () => { signLines[signLine] = inp.value.slice(0, 15); signLine = i; focusField('sign', signLines[i], 15); } });
    }
