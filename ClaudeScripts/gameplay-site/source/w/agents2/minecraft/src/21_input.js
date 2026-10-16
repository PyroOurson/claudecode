    const KBD = { fwd: 'KeyW', left: 'KeyA', back: 'KeyS', right: 'KeyD', jump: 'Space', sneak: 'ShiftLeft', sprint: 'ControlLeft', inv: 'KeyE', drop: 'KeyQ', swap: 'KeyF', chat: 'KeyT', cmd: 'Slash', list: 'Tab', pick: 'Mouse2', persp: 'F5', f3: 'F3', hide: 'F1' };
    const KB = Object.assign({}, KBD, SV.kb && typeof SV.kb === 'object' ? SV.kb : {});
    const saveKB = () => { SV.kb = KB; api.save(SV); };
    let freeMouse = false, unlockIntent = false, persp = 0, hideHud = false, fovDirty = true, lastW = 0, lastSpace = 0, lastJumpTap = 0, sneakToggle = false, aimT = null, tl = { id: null }, lastTouch = 0, mDrag = null;
    const tbs = new Map();
    const locked = () => document.pointerLockElement === canvas;
    let gestT = 0, lockT = 0, uiT = 0;
    function lockMouse(gest) {
      if (touch || locked() || scr !== 'game' || freeMouse && !gest) return;
      if (gest) gestT = performance.now();
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { if (performance.now() - gestT < 1500) freeMouse = true; }); } catch (e) { if (gest) freeMouse = true; }
      if (gest) api.timeout(() => { if (!locked() && scr === 'game' && !gui && !touch && !chatOpen) freeMouse = true; }, 1200);
    }
    function releaseMouse() { uiT = performance.now(); attackHeld = useHeld = false; mine = null; tJump = false; if (locked()) { unlockIntent = true; try { document.exitPointerLock(); } catch (e) { } } }
    api.on(document, 'pointerlockchange', () => {
      const t = performance.now();
      if (locked()) { freeMouse = false; lockT = t; if (gui || chatOpen || scr !== 'game' || P.dead) releaseMouse(); return; }
      attackHeld = useHeld = false;
      if (unlockIntent) { unlockIntent = false; return; }
      if (t - lockT < 600 || t - uiT < 900) return;
      if (scr === 'game' && !gui && !chatOpen && !P.dead) { gui = 'pause'; saveSoon(); }
    });
    api.on(document, 'pointerlockerror', () => { if (performance.now() - gestT < 1500) freeMouse = true; });
    const lookBy = (dx, dy) => { if (P.sleeping) return; P.yaw -= dx; P.pitch = clamp(P.pitch - dy, -1.5707, 1.5707); };
    function openChat(pre) { chatOpen = true; FIELDV.chat = pre || ''; chatHi = -1; releaseMouse(); focusField('chat', pre || '', 256); }
    function closeChat() { uiT = performance.now(); chatOpen = false; FIELDV.chat = ''; blurField(); lockMouse(); }
    function sendChat() {
      const m = (inp.value || '').trim();
      closeChat();
      if (!m) return;
      chatHist.push(m); if (chatHist.length > 50) chatHist.shift();
      if (m[0] === '/') { runCommand(m.slice(1)); return; }
      const line = '<' + P.name + '> ' + m;
      chatSys(line); netSend({ t: 'chat', m: line });
    }
    function guiDown(gx, gy, btn, shift) {
      for (const f of fields) if (inR(gx, gy, f)) { if (focusKey !== f.key) focusField(f.key, FIELDV[f.key] || '', f.maxLen); return; }
      if (focusKey && focusKey !== 'chat' && focusKey !== 'sign') blurField();
      for (const s of sliders) if (inR(gx, gy, s)) { activeSlider = s; s.set(clamp((gx - s.x - 4) / (s.w - 8), 0, 1)); return; }
      for (let i = btns.length - 1; i >= 0; i--) { const b = btns[i]; if (b.en && inR(gx, gy, b)) { if (b.l !== undefined) snd('click'); try { b.fn(); } catch (e) { if (window.console) console.error(e); } return; } }
      if (scr === 'game' && gui) invDown(btn, shift);
    }
    function pickBlock() {
      if (!HIT.b || !creative()) return;
      const s = getS(HIT.x, HIT.y, HIT.z), id = blockItemOf(s);
      for (let i = 0; i < 9; i++) if (inv[i] && inv[i].id === id) { sel = i; return; }
      let k = inv.findIndex((s2, i) => i < 9 && !s2); if (k < 0) k = sel; sel = k; inv[k] = { id, n: IT[id].stack, d: 0 };
    }
    function dropHeld(all) { const s = held(); if (!s || P.dead || gui) return; const n = all ? s.n : 1; throwStack({ id: s.id, n, d: s.d, x: s.x }, true); s.n -= n; if (s.n <= 0) inv[sel] = null; swing(); }
    function swapHands() { const a = inv[sel]; inv[sel] = offhand; offhand = a; }
    wrap.addEventListener('contextmenu', e => e.preventDefault());
    wrap.addEventListener('mousedown', e => {
      if (e.target === inp) return;
      if (touch) { if (performance.now() - lastTouch < 900) return; touch = false; resize(); }
      e.preventDefault(); ac();
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      const btn = e.button === 2 ? 2 : e.button === 1 ? 1 : 0;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { guiDown(gx, gy, btn === 2 ? 2 : btn, e.shiftKey); return; }
      if (!locked() && !freeMouse) { lockMouse(true); return; }
      if (freeMouse && !locked()) try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (er) { }
      if (btn === 0) { attackHeld = true; attackPress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false }; }
      else if (btn === 2) { useHeld = true; usePress(); if (!locked()) mDrag = { x: e.clientX, y: e.clientY, moved: false, use: 1 }; }
      else pickBlock();
    });
    api.on(window, 'mouseup', e => {
      if (e.button === 0) attackHeld = false;
      if (e.button === 2) useHeld = false;
      mDrag = null; activeSlider = null;
      if (!touch && scr === 'game' && gui) invUp();
    });
    api.on(document, 'mousemove', e => {
      if (locked()) { if (scr === 'game' && !gui && !chatOpen && Math.abs(e.movementX) < 400 && Math.abs(e.movementY) < 400) lookBy(e.movementX * CFG.SENS * SET.sens, e.movementY * CFG.SENS * SET.sens); return; }
      if (touch) return;
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1));
      if (scr === 'game' && gui) invMove();
      if (mDrag && scr === 'game' && !gui) {
        const dx = e.clientX - mDrag.x, dy = e.clientY - mDrag.y;
        if (!mDrag.moved && Math.hypot(dx, dy) > 4) { mDrag.moved = true; attackHeld = false; useHeld = false; mine = null; }
        if (mDrag.moved) { const k = 3.2 / (wrap.getBoundingClientRect().width || 960) * SET.sens; lookBy(dx * k, dy * k); mDrag.x = e.clientX; mDrag.y = e.clientY; }
      }
    });
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const d = e.deltaY || e.deltaX;
      if (!d) return;
      if (scr === 'game' && !gui && !chatOpen) { sel = (sel + (d > 0 ? 1 : 8)) % 9; return; }
      if (scr === 'game' && gui) { if (gui === 'controls') ctrlScroll += d > 0 ? 20 : -20; else invWheel(d); return; }
      if (scr === 'worlds') wScroll += d > 0 ? 24 : -24;
      if (scr === 'controls') ctrlScroll += d > 0 ? 20 : -20;
    }, { passive: false });
    function touchLayout() {
      const r = Math.min(34, GH * .11), jx = 12 + r * 1.2, jy = GH - 52 - r, bs = Math.min(30, GH * .1);
      const jump = { x: GW - bs * 1.8 - 10, y: GH - bs * 1.8 - 48, w: bs * 1.8, h: bs * 1.8 };
      return {
        r, jx, jy, bs, jump,
        sneak: { x: jump.x + bs * .2, y: jump.y - bs * 1.2 - 6, w: bs * 1.4, h: bs * 1.2 },
        pause: { x: GW - 26, y: 4, w: 22, h: 18 }, inv: { x: GW - 52, y: 4, w: 22, h: 18 }, chat: { x: GW - 78, y: 4, w: 22, h: 18 }, drop: { x: GW - 104, y: 4, w: 22, h: 18 }, persp: { x: GW - 130, y: 4, w: 22, h: 18 }
      };
    }
    function drawTouch() {
      const L = touchLayout();
      g.globalAlpha = .55;
      g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.fillStyle = 'rgba(0,0,0,.35)';
      const cx = stick.id != null ? stick.cx : L.jx, cy = stick.id != null ? stick.cy : L.jy;
      g.beginPath(); g.arc(cx, cy, L.r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx + stick.x * L.r * .6, cy + stick.y * L.r * .6, L.r * .38, 0, 7); g.fill();
      const box = (b, lbl, on) => { g.fillStyle = on ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'; g.fillRect(b.x, b.y, b.w, b.h); ring(b.x, b.y, b.w, b.h, 1, '#fff'); textC(lbl, b.x + b.w / 2, b.y + b.h / 2 - 4, '#ffffff'); };
      box(L.jump, P.fly ? 'UP' : 'JUMP', tJump); box(L.sneak, P.fly ? 'DOWN' : 'SNEAK', tSneak);
      box(L.pause, '||'); box(L.inv, '...'); box(L.chat, 'T'); box(L.drop, 'Q'); box(L.persp, 'F5');
      g.globalAlpha = 1;
    }
    const setAim = e => { const r = wrap.getBoundingClientRect(); aimT = { nx: (e.clientX - r.left) / (r.width || 1) * 2 - 1, ny: -((e.clientY - r.top) / (r.height || 1) * 2 - 1) }; };
    const setStick = (gx, gy) => { const r = touchLayout().r; let dx = (gx - stick.cx) / r, dy = (gy - stick.cy) / r; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.x = dx; stick.y = dy; };
    wrap.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || e.target === inp) return;
      e.preventDefault(); lastTouch = performance.now(); ac();
      if (!touch) { touch = true; releaseMouse(); resize(); }
      const [gx, gy] = toGui(e); mx = gx; my = gy;
      if (scr !== 'game' || gui || chatOpen || P.sleeping) { tbs.set(e.pointerId, 'gui'); guiDown(gx, gy, 0, false); return; }
      if (P.dead) return;
      const L = touchLayout(), now = performance.now();
      if (inR(gx, gy, L.inv)) { openGui('inv'); return; }
      if (inR(gx, gy, L.pause)) { gui = 'pause'; saveSoon(); return; }
      if (inR(gx, gy, L.chat)) { openChat(''); return; }
      if (inR(gx, gy, L.drop)) { dropHeld(false); return; }
      if (inR(gx, gy, L.persp)) { persp = (persp + 1) % 3; return; }
      if (inR(gx, gy, L.jump)) { tbs.set(e.pointerId, 'jump'); tJump = true; if ((creative() || mode() === 'spectator') && now - lastJumpTap < 350) { P.fly = !P.fly; P.vy = 0; lastJumpTap = 0; } else lastJumpTap = now; return; }
      if (inR(gx, gy, L.sneak)) { tbs.set(e.pointerId, 'sneak'); if (P.fly) tSneak = true; else { sneakToggle = !sneakToggle; tSneak = sneakToggle; } return; }
      const hx = (GW - 182) >> 1;
      if (gy >= GH - 24 && gx >= hx && gx < hx + 182) { sel = clamp((gx - hx) / 20 | 0, 0, 8); return; }
      if (stick.id == null && gx < GW * .42 && gy > GH * .4) { stick.id = e.pointerId; const near = Math.hypot(gx - L.jx, gy - L.jy) < L.r * 1.8; stick.cx = near ? L.jx : gx; stick.cy = near ? L.jy : gy; setStick(gx, gy); return; }
      if (tl.id == null) { tl = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: now, moved: false, mining: false }; setAim(e); }
    });
    api.on(window, 'pointermove', e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { const [gx, gy] = toGui(e); setStick(gx, gy); return; }
      if (e.pointerId === tl.id) {
        if (!tl.moved && Math.hypot(e.clientX - tl.sx, e.clientY - tl.sy) > 10) { tl.moved = true; if (!tl.mining) { attackHeld = false; useHeld = false; } }
        if (tl.moved && !tl.mining) { const k = 3.2 / (wrap.getBoundingClientRect().width || 400) * SET.sens; lookBy((e.clientX - tl.x) * k, (e.clientY - tl.y) * k); }
        tl.x = e.clientX; tl.y = e.clientY; setAim(e); return;
      }
      if (scr !== 'game' || gui) { const [gx, gy] = toGui(e); mx = gx; my = gy; if (activeSlider) activeSlider.set(clamp((gx - activeSlider.x - 4) / (activeSlider.w - 8), 0, 1)); if (scr === 'game' && gui) invMove(); }
    });
    const touchUp = e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; }
      const b = tbs.get(e.pointerId);
      if (b) { tbs.delete(e.pointerId); if (b === 'jump') tJump = false; else if (b === 'sneak' && P.fly) tSneak = false; else if (b === 'gui') { activeSlider = null; if (scr === 'game' && gui) invUp(); } }
      if (e.pointerId === tl.id) {
        if (!tl.moved && !tl.mining && performance.now() - tl.t < 300 && scr === 'game' && !gui && e.type === 'pointerup') { setAim(e); updTarget(); if (HIT.ent) attackPress(); else usePress(); }
        attackHeld = false; useHeld = false; tl = { id: null }; aimT = null;
      }
    };
    api.on(window, 'pointerup', touchUp); api.on(window, 'pointercancel', touchUp);
    function touchTick() {
      if (tl.id != null && !tl.moved && !tl.mining && performance.now() - tl.t > 280 && scr === 'game' && !gui) { tl.mining = true; attackHeld = true; const h = held(); if (h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink || IT[h.id].shield || IT[h.id].crossbow || IT[h.id].trident)) { attackHeld = false; useHeld = true; usePress(); } else attackPress(); }
    }
    inp.addEventListener('input', () => { if (focusKey && focusKey !== 'sign') FIELDV[focusKey] = inp.value; });
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); const f = fields.find(q => q.key === focusKey); if (focusKey === 'chat') sendChat(); else if (focusKey === 'sign') { signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + 1) % 4; inp.value = signLines[signLine]; } else if (f && f.onEnter) f.onEnter(); else blurField(); return; }
      if (e.key === 'Escape') { e.preventDefault(); if (focusKey === 'chat') closeChat(); else if (focusKey === 'sign') closeGui(); else blurField(); return; }
      if (focusKey === 'sign' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); signLines[signLine] = inp.value.slice(0, 15); signLine = (signLine + (e.key === 'ArrowUp' ? 3 : 1)) % 4; inp.value = signLines[signLine]; return; }
      if (focusKey === 'chat' && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && chatHist.length) { e.preventDefault(); chatHi = clamp((chatHi < 0 ? chatHist.length : chatHi) + (e.key === 'ArrowUp' ? -1 : 1), 0, chatHist.length); inp.value = FIELDV.chat = chatHist[chatHi] || ''; return; }
      if (focusKey === 'chat' && e.key === 'Tab') { e.preventDefault(); const v = inp.value; if (v[0] === '/') { const c = tabComplete(v); if (c) inp.value = FIELDV.chat = c; } }
    });
    api.on(window, 'keydown', e => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const c = e.code;
      if (touch && !e.repeat && c && c !== 'Unidentified') { touch = false; resize(); }
      ac();
      if (ctrlWait) { e.preventDefault(); if (c !== 'Escape') KB[ctrlWait] = c; ctrlWait = null; saveKB(); return; }
      if (c === 'F1' || c === 'F3' || c === 'F5' || c === 'Tab' || c === 'Space' || c === 'Slash' || /^Arrow/.test(c)) e.preventDefault();
      if (scr !== 'game') {
        if (c === 'Escape') { if (scr === 'worlds' || scr === 'mp' || scr === 'options') scr = 'title'; else if (scr === 'create' || scr === 'edit' || scr === 'delete') goWorlds(); else if (scr === 'controls') scr = 'options'; }
        if (c === 'Enter' && scr === 'worlds' && selWorld >= 0) playSel();
        return;
      }
      if (gui === 'dead') return;
      if (c === 'Escape') { if (gui === 'options' || gui === 'controls' || gui === 'plist') { persistSet(); gui = 'pause'; } else if (gui) closeGui(); else { gui = 'pause'; releaseMouse(); saveSoon(); } return; }
      if (gui === 'pause' || gui === 'options' || gui === 'controls' || gui === 'plist' || gui === 'sign') return;
      if (c === KB.inv && !e.repeat) { if (gui) closeGui(); else if (!chatOpen && !P.dead) openGui('inv'); return; }
      if (gui) { invKey(c); return; }
      if (chatOpen) return;
      const d = /^Digit([1-9])$/.exec(c);
      if (d) { sel = +d[1] - 1; return; }
      if (c === KB.f3) { showF3 = !showF3; return; }
      if (c === KB.hide) { hideHud = !hideHud; return; }
      if (e.repeat) return;
      if (c === KB.persp) { persp = (persp + 1) % 3; return; }
      if (c === KB.chat) { e.preventDefault(); openChat(''); return; }
      if (c === KB.cmd) { e.preventDefault(); openChat('/'); return; }
      if (c === KB.drop) { dropHeld(e.ctrlKey || e.metaKey); return; }
      if (c === KB.swap) { swapHands(); return; }
      if (c === KB.sprint) sprintKey = true;
      const now = performance.now();
      if (c === KB.fwd) { if (now - lastW < CFG.DOUBLE_TAP * 50) sprintTap = 1; lastW = now; }
      if (c === KB.jump && (creative() || mode() === 'spectator')) { if (now - lastSpace < CFG.DOUBLE_TAP * 50 && mode() !== 'spectator') { P.fly = !P.fly; P.vy = 0; lastSpace = 0; } else lastSpace = now; }
    });
    api.on(window, 'keyup', e => { if (e.code === KB.sprint) sprintKey = false; });
    api.on(window, 'blur', () => { attackHeld = useHeld = false; sprintKey = false; });
