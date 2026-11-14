    const NET = { role: null, me: null, hostId: null, synced: new Set(), names: new Map(), ready: false, edN: 0, edGot: 0, pend: null, inLobby: false, viewers: new Map(), beSent: new Map(), lastPs: 0, sleepT: 0, pendHello: [] };
    const RP = new Map();
    const encS = s => s ? { id: s.id, n: s.n, d: s.d || 0, x: s.x } : null;
    const decS = o => o && IT[o.id | 0] ? { id: o.id | 0, n: clamp(o.n | 0, 1, 6400), d: Math.max(0, o.d | 0), x: o.x && typeof o.x === 'object' ? o.x : undefined } : null;
    const fin = v => typeof v === 'number' && isFinite(v);
    function netSend(m, fast) { if (!NET.role || NET.inLobby && !fast && NET.role === 'guest') return; try { api.net.send(m, fast); } catch (e) { } }
    function netSendTo(pid, m, fast) {
      if (!NET.role || !pid) return;
      try {
        if (NET.role === 'host') api.net.sendTo(pid, m, fast);
        else if (pid === NET.hostId) api.net.send(m, fast);
        else api.net.send({ t: 'relay', to: pid, m }, fast);
      } catch (e) { }
    }
    let actQ = null;
    function netAct(o) { if (!NET.role) return; actQ = Object.assign(actQ || {}, o); }
    function netOrLocal(a, e, fn) { if (NET.role === 'guest') netSend({ t: 'mi', id: e.id, a }); else fn(); }
    const u32b64 = a => { const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return btoa(s); };
    const b64u32 = s => { const bin = atob(s), b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return new Uint32Array(b.buffer, 0, b.length >> 2); };
    function editDirect(x, y, z, s) {
      if (y < 0 || y >= H) return;
      const k = ck(x >> 4, z >> 4), li = (x & 15) | (z & 15) << 4 | (y & 15) << 8 | (y >> 4) << 12;
      let ed = W.edits.get(k); if (!ed) W.edits.set(k, ed = new Map());
      ed.set(li, s); ed.b = null;
    }
    function applyChange(x, y, z, s, flags) {
      if (!fin(x) || !fin(y) || !fin(z) || !(s >= 0 && s < NSTATE)) return;
      const c = colAt(x >> 4, z >> 4);
      if (c && c.st >= 1) setBlock(x, y, z, s, flags); else editDirect(x, y, z, s);
    }
    function playerData() { return { x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch, hp: P.hp, food: P.food, sat: P.sat, xp: P.xp, lvl: P.lvl, score: P.score, inv: inv.map(encS), armor: armor.map(encS), offhand: encS(offhand), ender: ender.map(encS), mode: W.mode, spawn: P.spawn, effects: P.effects, fly: P.fly, air: P.air, dead: P.dead, sel, st: P.st, adv: P.adv, goal: P.goal }; }
    function applyPlayerData(d) {
      if (!d) return false;
      if ([d.x, d.y, d.z].every(fin)) { P.x = d.x; P.y = d.y; P.z = d.z; P.px = P.x; P.py = P.y; P.pz = P.z; P.place = false; }
      for (const k of ['yaw', 'pitch', 'hp', 'food', 'sat', 'xp', 'lvl', 'score', 'air']) if (fin(d[k])) P[k] = d[k];
      if (d.st && typeof d.st === 'object' && !Array.isArray(d.st)) { const st = {}; for (const k in d.st) if (fin(d.st[k])) st[k] = d.st[k]; P.st = st; }
      if (d.adv && typeof d.adv === 'object' && !Array.isArray(d.adv)) P.adv = d.adv;
      if (fin(d.goal)) P.goal = d.goal;
      if (Array.isArray(d.inv)) inv = d.inv.slice(0, 36).map(decS).concat(new Array(36).fill(null)).slice(0, 36);
      if (Array.isArray(d.armor)) armor = d.armor.slice(0, 4).map(decS).concat([null, null, null, null]).slice(0, 4);
      offhand = decS(d.offhand);
      if (Array.isArray(d.ender)) ender = d.ender.slice(0, 27).map(decS).concat(new Array(27).fill(null)).slice(0, 27);
      if (d.mode && GMN[d.mode]) W.mode = d.mode;
      P.spawn = Array.isArray(d.spawn) && d.spawn.every(fin) ? d.spawn : null;
      P.effects = {}; if (d.effects && typeof d.effects === 'object' && !Array.isArray(d.effects)) for (const k in d.effects) if (fin(d.effects[k]) || d.effects[k] && typeof d.effects[k] === 'object') P.effects[k] = d.effects[k];
      P.fly = !!d.fly && (W.mode === 'creative' || W.mode === 'spectator');
      if (fin(d.sel)) sel = clamp(d.sel | 0, 0, 8);
      if (!(P.hp > 0) || P.hp > 1000) { P.hp = 20; P.food = 20; }
      P.food = clamp(P.food, 0, 20); P.sat = clamp(P.sat, 0, 20); P.pitch = clamp(P.pitch, -1.5707, 1.5707); P.lvl = clamp(P.lvl | 0, 0, 100000); P.xp = clamp(P.xp, 0, 1e7); P.score = clamp(P.score, 0, 1e9);
      return true;
    }
    function rpFor(pid, name) {
      let e = RP.get(pid);
      if (!e) { e = remotePlayer(pid, name || 'Player'); e.isHost = pid === NET.hostId; RP.set(pid, e); }
      return e;
    }
    function dropRP(pid) { const e = RP.get(pid); if (e) { delEnt(e); RP.delete(pid); } }
    function worldInfo() { return { seed: W.seed, type: W.type, name: W.name, wid: W.id, diff: W.diff, hardcore: W.hardcore, cheats: W.cheats, rules: W.rules, time: W.time, raining: W.raining, thunder: W.thunder, spawn: W.spawn, defMode: W.defMode || 'survival' }; }
    function sendInit(pid, name) {
      const pd = W.players && W.players[name];
      const pl = [{ pid: NET.me, name: P.name, host: 1 }].concat([...RP.values()].filter(e => e.pid !== pid).map(e => ({ pid: e.pid, name: e.name })));
      const be = []; W.be.forEach((v, k) => { if (v.items || v.text || v.kind !== undefined) be.push([k, v]); });
      netSendTo(pid, { t: 'init', w: worldInfo(), you: pd || null, pl, be });
      const parts = []; let cur = [], n = 0;
      W.edits.forEach((ed, k) => { cur.push(k, ed.size); ed.forEach((s, li) => { cur.push(li * 16384 + s); }); n += ed.size + 2; if (n > 9000) { parts.push(cur); cur = []; n = 0; } });
      if (cur.length) parts.push(cur);
      parts.forEach((p, i) => netSendTo(pid, { t: 'ed', i, n: parts.length, d: u32b64(new Uint32Array(p)) }));
      netSendTo(pid, { t: 'ready', n: parts.length });
      NET.synced.add(pid);
    }
    function applyEd(d) {
      const a = b64u32(d);
      for (let i = 0; i < a.length;) {
        const k = a[i], n = a[i + 1]; i += 2;
        const cx = Math.floor(k / 65536) - 32768, cz = (k % 65536) - 32768;
        let ed = W.edits.get(k); if (!ed) W.edits.set(k, ed = new Map());
        ed.b = null;
        const c = colAt(cx, cz);
        for (let j = 0; j < n && i < a.length; j++, i++) {
          const v = a[i], li = Math.floor(v / 16384), s = v % 16384;
          if (s >= NSTATE) continue;
          ed.set(li, s);
          if (c && c.st >= 1) { const sy = li >> 12, l = li & 4095; setBlock(cx * 16 + (l & 15), sy * 16 + (l >> 8), cz * 16 + (l >> 4 & 15), s, 3); }
        }
      }
    }
    const KC = { mob: 0, item: 1, xp: 2, fall: 3, tnt: 4, arrow: 5, thrown: 6 };
    const r2 = v => Math.round(v * 100) / 100;
    function entSnap(e) {
      const k = KC[e.kind];
      const a = [e.id, k, r2(e.x), r2(e.y), r2(e.z)];
      if (k === 0) a.push(r2(e.yaw), r2(e.hyaw), r2(e.pitch || 0), (e.hurtT > 0 ? 1 : 0) | (e.baby ? 2 : 0) | (e.sheared ? 4 : 0) | (e.angry ? 8 : 0) | (e.dead ? 16 : 0) | (e.fire > 0 ? 32 : 0) | (e.see ? 64 : 0) | (e.target ? 128 : 0), e.type, e.color || '', e.fuse ?? -1, e.size || 0, e.swing || 0, e.eat || 0);
      else if (k === 1) a.push(e.st.id, e.st.n);
      else if (k === 2) a.push(e.v);
      else if (k === 3) a.push(e.s);
      else if (k === 4) a.push(e.fuse);
      else if (k === 5) a.push(r2(e.vx), r2(e.vy), r2(e.vz), e.stuck ? 1 : 0);
      else if (k === 6) a.push(e.type);
      return a;
    }
    function hostSnapshots() {
      for (const [pid, rp] of RP) {
        if (!NET.synced.has(pid) || tickN % (rp.snI || 2)) continue;
        const L = [];
        for (const e of ENTS) { if (KC[e.kind] === undefined || e.gone) continue; const d = (e.x - rp.x) ** 2 + (e.z - rp.z) ** 2; if (d < 96 * 96) L.push([d, e]); }
        L.sort((a, b) => a[0] - b[0]);
        rp.snI = L.length > 60 ? 4 : L.length > 30 ? 3 : 2;
        netSendTo(pid, { t: 'es', e: L.slice(0, 90).map(q => entSnap(q[1])), tm: W.time, rn: W.raining ? 1 : 0, th: W.thunder ? 1 : 0, df: W.diff }, true);
      }
    }
    function mirrorOf(a) {
      const [id, k, x, y, z] = a;
      let e = entById.get(id);
      if (e && e.kindCode !== k) { delEnt(e); e = null; }
      if (!e) {
        if (k === 0) { e = spawnMob(a[9], x, y, z, { baby: !!(a[8] & 2), size: a[12] || 2, yaw: a[5] }); if (e && a[10]) e.color = a[10]; }
        else if (k === 1) e = spawnItem({ id: a[5], n: a[6], d: 0, _host: 1 }, x, y, z, 0, 0, 0, 0);
        else if (k === 2) e = addEnt({ kind: 'xp', v: a[5], x, y, z, px: x, py: y, pz: z, vx: 0, vy: 0, vz: 0, w: .5, h: .5, age: 0, life: 0, root: xpMesh(a[5]), hit: false });
        else if (k === 3) e = spawnFalling(a[5], x - .5, y, z - .5);
        else if (k === 4) e = spawnTNT(x - .5, y, z - .5, a[5]);
        else if (k === 5) e = spawnArrow(x, y, z, a[5], a[6], a[7], null, 0, false);
        else if (k === 6) e = spawnThrown(a[5], x, y, z, 0, 0, 0, null);
        if (!e) return null;
        entById.delete(e.id); e.id = id; entById.set(id, e); e.mirror = 1; e.kindCode = k;
        e.px = e.x = x; e.py = e.y = y; e.pz = e.z = z;
      }
      e.tx = x; e.ty = y; e.tz = z; e.seen = NET.snapN;
      if (k === 0) { e.tyaw = a[5]; e.hyaw = a[6]; e.pitch = a[7]; const f = a[8]; if (f & 1 && !(e.hurtT > 0)) e.hurtT = 10; e.sheared = !!(f & 4); if (e.wool) e.wool.root.visible = !e.sheared; e.angry = !!(f & 8); if (f & 16 && !e.dead) e.dead = 1; e.fire = f & 32 ? 2 : 0; e.see = !!(f & 64); e.target = f & 128 ? P : null; if (a[10]) e.color = a[10]; e.fuse = a[11]; if (a[13] > 0 && !(e.swing > 0)) e.swing = a[13]; e.eat = a[14]; }
      else if (k === 1 && e.st) e.st.n = a[6];
      else if (k === 4) e.fuse = a[5];
      else if (k === 5) { e.vx = a[5]; e.vy = a[6]; e.vz = a[7]; e.stuck = a[8]; }
      return e;
    }
    function applySnapshot(m) {
      NET.snapN = (NET.snapN || 0) + 1;
      if (Array.isArray(m.e)) for (const a of m.e) if (Array.isArray(a) && a.length >= 5 && [a[2], a[3], a[4]].every(fin)) mirrorOf(a);
      for (const e of ENTS.slice()) if (e.mirror && e.seen !== NET.snapN) delEnt(e);
      if (fin(m.tm)) { if (Math.abs(m.tm - W.time) > 40) W.time = m.tm; }
      W.raining = !!m.rn; W.thunder = !!m.th; if (fin(m.df)) W.diff = m.df;
    }
    function tickMirrors() {
      for (const e of ENTS) {
        if (!e.mirror) continue;
        e.px = e.x; e.py = e.y; e.pz = e.z; e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
        if (e.tx === undefined) continue;
        const k = e.kind === 'arrow' ? .6 : .35;
        e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.z += (e.tz - e.z) * k;
        if (e.kind === 'mob') {
          const dx = e.x - e.px, dz = e.z - e.pz, sp = Math.min(1, Math.hypot(dx, dz) * 4);
          e.limbAP = e.limbA; e.limbP = e.limb; e.limbA += (sp - e.limbA) * .4; e.limb += e.limbA;
          if (e.tyaw !== undefined) e.yaw = turn(e.yaw, e.tyaw, .6);
          if (e.hurtT > 0) e.hurtT--; if (e.swing > 0) e.swing--;
          if (e.dead) e.dead++;
          e.onGround = true;
        }
      }
      for (const e of RP.values()) {
        e.px = e.x; e.py = e.y; e.pz = e.z; e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
        if (e.tx === undefined) continue;
        if (Math.abs(e.tx - e.x) > 16 || Math.abs(e.ty - e.y) > 16 || Math.abs(e.tz - e.z) > 16) { e.x = e.px = e.tx; e.y = e.py = e.ty; e.z = e.pz = e.tz; }
        e.x += (e.tx - e.x) * .5; e.y += (e.ty - e.y) * .5; e.z += (e.tz - e.z) * .5;
        const dx = e.x - e.px, dz = e.z - e.pz, sp = Math.min(1, Math.hypot(dx, dz) * 4);
        e.limbAP = e.limbA; e.limbP = e.limb; e.limbA += (sp - e.limbA) * .4; e.limb += e.limbA * 1.2;
        e.yaw = turn(e.yaw, e.tyaw ?? e.yaw, .5); e.hyaw = e.tyaw ?? e.hyaw;
        if (e.hurtT > 0) e.hurtT--; if (e.swing > 0) e.swing--;
      }
    }
    function setRemoteHeld(e, id) {
      if (e.held === id) return;
      e.held = id;
      if (e.heldMesh) { e.md.parts.rarm.remove(e.heldMesh); e.heldMesh = null; }
      if (id >= 0 && IT[id]) { const m = itemMesh(id, isFlat(id) ? .55 : .35); m.position.set(-1 / 16, -10 / 16, -2 / 16); m.rotation.set(isFlat(id) ? -.3 : 0, isFlat(id) ? Math.PI / 2 : .6, isFlat(id) ? -.8 : 0); e.md.parts.rarm.add(m); e.heldMesh = m; }
    }
    function onPs(e, m) {
      if (![m.x, m.y, m.z].every(fin)) return;
      e.tx = m.x; e.ty = m.y; e.tz = m.z; if (e.y < -500) { e.x = e.px = m.x; e.y = e.py = m.y; e.z = e.pz = m.z; }
      if (fin(m.r)) e.tyaw = m.r; if (fin(m.p)) e.pitch = m.p;
      e.sneak = !!m.s; e.sleeping = !!m.sl; e.pdead = !!m.dd; e.mode = m.m || 'survival';
      e.root.visible = !m.dd && e.mode !== 'spectator';
      e.hit = !m.dd && e.mode !== 'spectator' && e.mode !== 'creative';
      if (fin(m.h)) setRemoteHeld(e, m.h | 0);
      if (m.sw) e.swing = 6;
      if (m.hr) e.hurtT = 10;
    }
    function myPs() { const h = held(); return { t: 'ps', x: r2(P.x), y: r2(P.y), z: r2(P.z), r: r2(P.yaw), p: r2(P.pitch), s: P.sneak ? 1 : 0, sl: P.sleeping ? 1 : 0, dd: P.dead ? 1 : 0, m: W.mode, h: h ? h.id : -1, sw: swingT === 0 ? 1 : 0, hr: P.hurtT === 19 ? 1 : 0 }; }
    function netTick() {
      if (!NET.role || !W) return;
      if (changes.length) {
        const c = changes.splice(0, changes.length);
        if (NET.role === 'host') netSend({ t: 'bc', c }); else if (NET.ready) netSend({ t: 'bc', c });
      }
      if (NET.role === 'guest' && !NET.ready) return;
      const ps = myPs();
      if (actQ) { Object.assign(ps, actQ); actQ = null; }
      if (NET.role === 'host') ps.pid = NET.me;
      netSend(ps, true);
      if (NET.role === 'host') {
        hostSnapshots();
        if (tickN % 10 === 0) beSync();
        const all = [P].concat([...RP.values()].filter(e => !e.pdead && e.mode !== 'spectator'));
        if (all.length > 1 && all.every(p => p === P ? P.sleeping > 0 : p.sleeping)) { if (++NET.sleepT >= 100) { W.time = Math.ceil(W.time / 24000) * 24000; W.raining = W.thunder = false; NET.sleepT = 0; wake(); netSend({ t: 'wake' }); } } else NET.sleepT = 0;
      } else if (tickN % 100 === 0) netSend({ t: 'pdata', d: playerData() });
    }
    function beChanged(x, y, z) {
      const k = bk(x, y, z), v = W.be.get(k);
      if (!NET.role) return;
      if (NET.role === 'guest') netSend({ t: 'beset', k, v: v || null });
      else NET.beSent.delete(k);
    }
    function viewing(k, on) { if (NET.role === 'guest') netSend({ t: 'view', k, on: on ? 1 : 0 }); else if (NET.role === 'host') { const s = NET.viewers.get(NET.me) || new Set(); if (on) s.add(k); else s.delete(k); NET.viewers.set(NET.me, s); } }
    function beSync() {
      const keysV = new Set(); NET.viewers.forEach(s => s.forEach(k => keysV.add(k)));
      for (const k of keysV) {
        const v = W.be.get(k), js = JSON.stringify(v || null);
        if (NET.beSent.get(k) === js) continue;
        NET.beSent.set(k, js);
        NET.viewers.forEach((s, pid) => { if (pid !== NET.me && s.has(k)) netSendTo(pid, { t: 'be', k, v: v || null }); });
      }
    }
    const sanBE = v => { if (!v || typeof v !== 'object') return null; const o = {}; if (Array.isArray(v.items)) o.items = v.items.slice(0, 54).map(decS); for (const s of ['i', 'f', 'o']) if (s in v) o[s] = decS(v[s]); for (const n of ['b', 'bm', 'c', 'ct', 'xp']) if (fin(v[n])) o[n] = v[n]; if (typeof v.kind === 'string') o.kind = v.kind; if (Array.isArray(v.text)) o.text = v.text.slice(0, 4).map(t => String(t || '').slice(0, 15)); if (v.disc) o.disc = decS(v.disc); if (v.shulker) o.shulker = 1; if (typeof v.title === 'string') o.title = v.title.slice(0, 40); return o; };
    function hostData(m, from) {
      const rp = RP.get(from);
      if (m.t === 'hello' && (!W || scr !== 'game' || W.remote)) { NET.pendHello.push([m, from]); return; }
      if (m.t === 'hello') {
        const name = String(m.name || NET.names.get(from) || 'Player').slice(0, 16);
        const e = rpFor(from, name); e.name = name;
        sendInit(from, name);
        chatSys(name + ' joined the game', '#ffff55'); netSend({ t: 'chat', m: name + ' joined the game', c: '#ffff55' });
        netSend({ t: 'pj', pid: from, name });
        return;
      }
      if (!rp) return;
      const T = m.t;
      if (T === 'ps') { onPs(rp, m); m.pid = from; for (const [pid] of RP) if (pid !== from && NET.synced.has(pid)) netSendTo(pid, m, true); return; }
      if (T === 'bc') { const c = m.c; if (Array.isArray(c)) for (let i = 0; i + 3 < c.length && i < 40000; i += 4) applyChange(c[i], c[i + 1], c[i + 2], c[i + 3], 0); return; }
      if (T === 'drop') { const s = decS(m.s); if (s && [m.x, m.y, m.z].every(fin)) { s._host = 1; spawnItem(s, m.x, m.y, m.z, fin(m.vx) ? m.vx : undefined, fin(m.vy) ? m.vy : undefined, fin(m.vz) ? m.vz : undefined, fin(m.d) ? m.d : 40); } return; }
      if (T === 'atk') { const e = entById.get(m.id); if (e && fin(m.d)) hurtEnt(e, clamp(m.d, 0, 100), rp, m.k || 'player', fin(m.kx) ? m.kx : undefined, fin(m.kz) ? m.kz : undefined); return; }
      if (T === 'mi') { const e = entById.get(m.id); if (!e || e.kind !== 'mob') return; const a = String(m.a || ''); if (a === 'love') { e.love = 600; for (let i = 0; i < 5; i++) particle(e.x, e.y + e.h, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, 0, 1); } else if (a === 'shear' && e.type === 'sheep' && !e.sheared) { e.sheared = true; if (e.wool) e.wool.root.visible = false; spawnItem({ id: IN[e.color + '_wool'].idx, n: 1 + ri(3) }, e.x, e.y + 1, e.z); } else if (a.startsWith('dye:') && e.type === 'sheep' && DYE[a.slice(4)]) e.color = a.slice(4); else if (a === 'milk') { } return; }
      if (T === 'spawn') { if (MT[m.m] && [m.x, m.y, m.z].every(fin)) spawnMob(m.m, m.x, m.y, m.z, { persist: true }); return; }
      if (T === 'throw') { if ([m.x, m.y, m.z, m.vx, m.vy, m.vz].every(fin)) spawnThrown(String(m.ty), m.x, m.y, m.z, m.vx, m.vy, m.vz, rp); return; }
      if (T === 'arrow') { if ([m.x, m.y, m.z, m.vx, m.vy, m.vz].every(fin)) spawnArrow(m.x, m.y, m.z, m.vx, m.vy, m.vz, rp, fin(m.d) ? clamp(m.d, 0, 30) : 2, !!m.p); snd('bow', rp); return; }
      if (T === 'tnt') { if ([m.x, m.y, m.z].every(fin)) spawnTNT(m.x | 0, m.y | 0, m.z | 0); return; }
      if (T === 'bonemeal') { if ([m.x, m.y, m.z].every(fin)) { const s = getS(m.x, m.y, m.z); if (s > 0) boneMeal(m.x, m.y, m.z, s, TT[STT[s]]); } return; }
      if (T === 'chat') { const line = String(m.m || '').slice(0, 300); chatSys(line, m.c); for (const [pid] of RP) if (pid !== from) netSendTo(pid, { t: 'chat', m: line, c: m.c }); return; }
      if (T === 'cmd') { runCommand(String(m.s || '').slice(0, 300), rp); return; }
      if (T === 'pdata') { if (m.d && typeof m.d === 'object') { W.players = W.players || {}; W.players[rp.name] = m.d; } return; }
      if (T === 'beget') { const k = String(m.k || ''); const v = W.be.get(k); netSendTo(from, { t: 'be', k, v: v || null }); return; }
      if (T === 'beset') { const k = String(m.k || ''); if (!/^-?\d+,-?\d+,-?\d+$/.test(k)) return; const v = sanBE(m.v); const old = W.be.get(k); if (v) { if (old) { for (const n in v) old[n] = v[n]; } else W.be.set(k, v); } NET.beSent.delete(k); if (guiPos && bk(guiPos[0], guiPos[1], guiPos[2]) === k) guiBE = W.be.get(k); return; }
      if (T === 'view') { const s = NET.viewers.get(from) || new Set(); if (m.on) s.add(String(m.k)); else s.delete(String(m.k)); NET.viewers.set(from, s); return; }
      if (T === 'relay') { if (m.to === NET.me) { hostData(m.m, from); return; } if (RP.has(m.to) && m.m && typeof m.m === 'object') netSendTo(m.to, Object.assign({}, m.m, { from })); return; }
      if (T === 'hurt') { if (fin(m.d)) hurtPlayer(clamp(m.d, 0, 100), fin(m.sx) ? m.sx : null, fin(m.sz) ? m.sz : null, m.k === 'player' ? 'player' : 'mob'); return; }
      if (T === 'give') { const s = decS(m.s); if (s) giveOrDrop(s); return; }
      if (T === 'xp') { if (fin(m.v)) addXp(m.v); return; }
      if (T === 'sleep') { rp.sleeping = !!m.v; return; }
      if (T === 'respawn') { rp.pdead = false; return; }
    }
    function guestData(m, from) {
      const T = m.t;
      if (T === 'init') { guestInit(m); return; }
      if (!W || !NET.wInit) return;
      if (T === 'ed') { if (typeof m.d === 'string') applyEd(m.d); NET.edGot++; loadP = m.n ? NET.edGot / m.n * .5 : .5; return; }
      if (T === 'ready') { NET.ready = true; return; }
      if (T === 'bc') { const c = m.c; if (Array.isArray(c)) for (let i = 0; i + 3 < c.length; i += 4) applyChange(c[i], c[i + 1], c[i + 2], c[i + 3], 3); return; }
      if (T === 'es') { applySnapshot(m); return; }
      if (T === 'ps') { const pid = m.pid; if (!pid || pid === NET.me) return; const e = rpFor(pid, NET.names.get(pid) || 'Player'); onPs(e, m); return; }
      if (T === 'pj') { if (m.pid !== NET.me) { NET.names.set(m.pid, String(m.name || 'Player')); const e = rpFor(m.pid, m.name); e.name = m.name; } return; }
      if (T === 'pl') { dropRP(m.pid); return; }
      if (T === 'chat') { chatSys(String(m.m || '').slice(0, 300), m.c); return; }
      if (T === 'give') { const s = decS(m.s); if (s) { const left = giveItem(s); if (left > 0) throwStack({ id: s.id, n: left, d: s.d, x: s.x }, false); snd('pop'); } return; }
      if (T === 'xp') { if (fin(m.v)) addXp(m.v); return; }
      if (T === 'hurt') { if (fin(m.d)) { hurtPlayer(clamp(m.d, 0, 1000), fin(m.sx) ? m.sx : null, fin(m.sz) ? m.sz : null, m.k || 'mob'); if (fin(m.kx) && fin(m.kz)) { P.vx += m.kx; P.vy += m.ky || 0; P.vz += m.kz; } } return; }
      if (T === 'boom') { if ([m.x, m.y, m.z].every(fin)) boomFx(m.x, m.y, m.z, m.p || 4); return; }
      if (T === 'snd') { if (typeof m.n === 'string' && [m.x, m.y, m.z].every(fin)) snd(m.n, { x: m.x, y: m.y, z: m.z }); return; }
      if (T === 'be') { const k = String(m.k || ''); const v = sanBE(m.v); if (v) { const old = W.be.get(k); if (old) { for (const n in v) old[n] = v[n]; } else W.be.set(k, v); } else W.be.delete(k); if (guiPos && bk(guiPos[0], guiPos[1], guiPos[2]) === k && W.be.get(k)) guiBE = W.be.get(k); signDirty = true; return; }
      if (T === 'wake') { wake(); return; }
      if (T === 'w') { if (m.w) Object.assign(W, { rules: m.w.rules || W.rules, cheats: !!m.w.cheats }); return; }
      void from;
    }
    function boomFx(x, y, z, p) { snd('explode', { x, y, z }); for (let i = 0; i < 30; i++) particle(x + (RNG() - .5) * p, y + (RNG() - .5) * p, z + (RNG() - .5) * p, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [230, 230, 230], 1 + RNG(), .3 + RNG() * .3, -1, 1); }
    function guestInit(m) {
      const w = m.w || {};
      if (!fin(w.seed)) return;
      if (W && NET.wInit && W.id === w.wid) { NET.ready = false; return; }
      closeWorld();
      openWorldObj({ id: w.wid, name: String(w.name || 'Multiplayer'), seed: w.seed | 0, type: WTYPES.includes(w.type) ? w.type : 'default', mode: w.defMode || 'survival', defMode: w.defMode, diff: fin(w.diff) ? w.diff : 2, hardcore: !!w.hardcore, cheats: !!w.cheats, rules: Object.assign(defRules(), w.rules || {}), time: fin(w.time) ? w.time : 1000, raining: !!w.raining, thunder: !!w.thunder, spawn: Array.isArray(w.spawn) ? w.spawn : null, remote: true });
      NET.wInit = true; NET.ready = false; NET.edGot = 0;
      if (!applyPlayerData(m.you)) { if (W.spawn) { P.x = W.spawn[0]; P.y = W.spawn[1]; P.z = W.spawn[2]; P.place = true; } }
      if (Array.isArray(m.be)) for (const [k, v] of m.be) { const s = sanBE(v); if (s && typeof k === 'string') W.be.set(k, s); }
      if (Array.isArray(m.pl)) for (const p of m.pl) { if (!p || p.pid === NET.me) continue; NET.names.set(p.pid, String(p.name || 'Player')); const e = rpFor(p.pid, p.name); e.name = p.name; e.isHost = !!p.host; }
      scr = 'loading'; loadMsg = 'Downloading terrain...'; loadP = 0;
    }
    let netBound = false;
    function bindNet() {
      if (netBound || !api.net) return;
      netBound = true;
      api.net.on('data', (m, from) => {
        if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
        try { if (NET.role === 'host') hostData(m, from); else if (NET.role === 'guest') guestData(m, from); } catch (e) { if (window.console) console.warn(e); }
      });
      api.net.on('join', p => { if (NET.role === 'host' && p && p.name) NET.names.set(p.id, p.name); });
      api.net.on('rejoin', p => {
        if (NET.role !== 'host' || !p || !W || W.remote || scr !== 'game') return;
        const e = RP.get(p.id);
        if (!e) return;
        NET.beSent.clear();
        sendInit(p.id, e.name);
      });
      api.net.on('leave', p => {
        if (!NET.role || !p) return;
        const e = RP.get(p.id);
        if (e) { if (NET.role === 'host' && e.lastPd) { } chatSys(e.name + ' left the game', '#ffff55'); if (NET.role === 'host') { netSend({ t: 'chat', m: e.name + ' left the game', c: '#ffff55' }); netSend({ t: 'pl', pid: p.id }); } }
        dropRP(p.id); NET.synced.delete(p.id); NET.viewers.delete(p.id);
      });
      api.net.on('close', r => { if (NET.role === 'guest') { NET.role = null; discMsg = r === 'kick' ? 'You were kicked from the game' : 'The host closed the game or the connection was lost'; afterLeave(); scr = 'disc'; } else if (NET.role === 'host') { NET.role = null; for (const k of [...RP.keys()]) dropRP(k); chatSys('Party closed', '#aaaaaa'); } });
      api.net.on('lobby', () => { if (NET.role === 'guest') { NET.inLobby = true; chatSys('The host is inviting more players...', '#aaaaaa'); roomAgain(); } });
    }
    function roomOpts() { return { title: 'Minecraft', text: 'Play together on the same Wi-Fi / LAN or online. The host shares their world.', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 4, max: 8, min: 2, name: myName() }; }
    function roomAgain() {
      api.net.room(roomOpts()).then(r => { NET.inLobby = false; if (!r) { leaveMP(); return; } if (r.role === 'guest' && W && NET.wInit) { NET.ready = true; } });
    }
    function startRoom(onHost) {
      if (!api.net || !api.net.room) { discMsg = 'Multiplayer is not available here'; scr = 'disc'; return; }
      bindNet();
      releaseMouse();
      NET.inLobby = true;
      api.net.room(roomOpts()).then(r => {
        NET.inLobby = false;
        if (!r) { if (onHost && onHost.cancel) onHost.cancel(); return; }
        NET.me = r.id;
        const me = (r.players || []).find(p => p.id === r.id);
        if (me && me.name) P.name = me.name;
        for (const p of r.players || []) NET.names.set(p.id, p.name);
        if (r.role === 'host') {
          NET.role = 'host'; NET.hostId = r.id;
          if (onHost && onHost.host) onHost.host();
          chatSys('Party open! Code: ' + (api.net.code || ''), '#55ff55');
        } else {
          if (scr === 'game' && W && NET.role !== 'guest') { saveNow(); closeWorld(); }
          NET.role = 'guest'; NET.wInit = false; NET.ready = false;
          const h = (r.players || []).find(p => p.host); NET.hostId = h ? h.id : null;
          scr = 'waiting'; loadMsg = 'Connecting to ' + (h ? h.name : 'the host') + '...'; loadP = 0;
          netSend({ t: 'hello', name: P.name });
        }
      }, () => { NET.inLobby = false; });
    }
    function openToLan() { if (NET.role === 'guest') return; gui = null; startRoom({ host: () => { gui = null; lockMouse(); }, cancel: () => { if (scr === 'game') gui = 'pause'; } }); }
    function joinParty() { P.name = myName(); startRoom({ host: () => { mpMode = 'host'; NET.pendHost = true; chatSys('Choose a world to host', '#ffff55'); goWorlds(); }, cancel: () => { } }); }
    function leaveMP() { if (NET.role) { try { api.net.close(); } catch (e) { } } NET.role = null; afterLeave(); }
    function afterLeave() { for (const k of [...RP.keys()]) dropRP(k); NET.synced.clear(); NET.viewers.clear(); NET.wInit = false; NET.ready = false; NET.inLobby = false; if (W && W.remote) closeWorld(); }
    function hostAfterOpen() { for (const p of api.net.players || []) if (p.id !== NET.me) NET.names.set(p.id, p.name); const q = NET.pendHello.splice(0); for (const [m, from] of q) hostData(m, from); }
    const DBN = 'gameplay-minecraft';
    let dbP = null, saveT = 0, saving = false;
    function db() {
      if (!dbP) dbP = new Promise(res => {
        try {
          const r = indexedDB.open(DBN, 1);
          r.onupgradeneeded = () => { const d = r.result; for (const s of ['meta', 'data']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' }); };
          r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null);
          setTimeout(() => res(null), 4000);
        } catch (e) { res(null); }
      });
      return dbP;
    }
    const LSK = 'gameplay:mc:';
    const lsGet = k => { try { return JSON.parse(localStorage.getItem(LSK + k) || 'null'); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(LSK + k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const lsIdx = store => {
      const a = lsGet(store + 'idx');
      if (Array.isArray(a)) return a.filter(i => typeof i === 'string');
      const out = [], pre = LSK + store + ':';
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(pre)) out.push(k.slice(pre.length)); } } catch (e) { }
      return out;
    };
    function kv(store, op, val) {
      return db().then(d => {
        if (!d) {
          const idx = lsIdx(store);
          if (op === 'all') return idx.map(id => lsGet(store + ':' + id)).filter(Boolean);
          if (op === 'get') { const v = lsGet(store + ':' + val); if (v == null) { let raw = null; try { raw = localStorage.getItem(LSK + store + ':' + val); } catch (e) { } if (raw != null && raw !== 'null') return { id: val, corrupt: String(raw).slice(0, 2000000) }; } return v; }
          if (op === 'put') { if (!lsSet(store + ':' + val.id, val)) return false; if (!idx.includes(val.id)) { idx.push(val.id); lsSet(store + 'idx', idx); } return true; }
          if (op === 'del') { lsSet(store + 'idx', idx.filter(i => i !== val)); try { localStorage.removeItem(LSK + store + ':' + val); } catch (e) { } return true; }
          return null;
        }
        return new Promise(res => {
          try {
            const tx = d.transaction(store, op === 'all' || op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(store);
            const r = op === 'all' ? st.getAll() : op === 'get' ? st.get(val) : op === 'put' ? st.put(val) : st.delete(val);
            const bad = () => res(op === 'all' ? [] : null);
            if (op === 'all' || op === 'get') r.onsuccess = () => res(r.result); else tx.oncomplete = () => res(true);
            r.onerror = bad; tx.onabort = bad; tx.onerror = bad;
          } catch (e) { res(op === 'all' ? [] : null); }
        });
      });
    }
    const okMeta = w => w && typeof w === 'object' && typeof w.id === 'string' && w.id.length > 0 && w.id.length < 80;
    function listWorlds() { return kv('meta', 'all').then(l => (Array.isArray(l) ? l : []).filter(okMeta).sort((a, b) => (+b.last || 0) - (+a.last || 0)), () => []); }
    function deleteWorld(id) { return Promise.all([kv('meta', 'del', id), kv('data', 'del', id), kv('data', 'del', id + '~bak')]); }
    function cleanMeta(m) {
      const o = Object.assign({}, m);
      o.name = String(o.name == null ? 'World' : o.name).slice(0, 64) || 'World';
      o.folder = String(o.folder == null ? o.name : o.folder).slice(0, 64);
      o.seed = fin(+o.seed) ? +o.seed | 0 : 0;
      o.type = WTYPES.includes(o.type) ? o.type : 'default';
      o.mode = GMN[o.mode] && o.mode !== 'hardcore' ? o.mode : 'survival';
      o.defMode = GMN[o.defMode] && o.defMode !== 'hardcore' ? o.defMode : o.mode;
      o.diff = fin(o.diff) ? clamp(o.diff | 0, 0, 4) : 2;
      o.rules = o.rules && typeof o.rules === 'object' && !Array.isArray(o.rules) ? o.rules : {};
      o.created = fin(o.created) ? o.created : Date.now();
      return o;
    }
    let saveWarn = -1e9;
    function renameWorld(id, name) { return kv('meta', 'get', id).then(m => m ? kv('meta', 'put', Object.assign(m, { name })) : null); }
    function metaOf() { return { id: W.id, name: W.name, folder: W.folder || W.name, seed: W.seed, type: W.type, mode: W.mode, defMode: W.defMode, hardcore: W.hardcore, diff: W.diff, cheats: W.cheats, created: W.created || Date.now(), last: Date.now(), rules: W.rules }; }
    function worldData() {
      const edits = []; W.edits.forEach((ed, k) => { if (!ed.size) return; if (!ed.b) { const a = new Uint32Array(ed.size); let i = 0; ed.forEach((s, li) => { a[i++] = li * 16384 + s; }); ed.b = u32b64(a); } edits.push([k, ed.b]); });
      const be = []; W.be.forEach((v, k) => be.push([k, v]));
      const ents = [];
      for (const e of ENTS) {
        if (e.mirror) continue;
        if (e.kind === 'mob' && !e.dead) ents.push({ k: 'mob', type: e.type, x: r2(e.x), y: r2(e.y), z: r2(e.z), yaw: r2(e.yaw), hp: e.hp, baby: !!e.baby, color: e.color, sheared: !!e.sheared, persist: !!e.persist, size: e.size });
        else if (e.kind === 'item' && e.st) ents.push({ k: 'item', s: encS(e.st), x: r2(e.x), y: r2(e.y), z: r2(e.z), life: e.life });
        else if (e.kind === 'xp') ents.push({ k: 'xp', v: e.v, x: r2(e.x), y: r2(e.y), z: r2(e.z) });
      }
      return { id: W.id, edits, be, ents, player: playerData(), players: W.players || {}, time: W.time, raining: W.raining, thunder: W.thunder, weatherT: W.weatherT, spawn: W.spawn, visited: [...(W.visited || [])], bonusDone: !!W.bonusDone };
    }
    function saveNow() {
      if (!W || W.pano) return Promise.resolve();
      if (W.remote) { netSend({ t: 'pdata', d: playerData() }); return Promise.resolve(); }
      if (W.hardcore && P.dead && W.mode === 'spectator') { }
      let meta, data;
      try { meta = metaOf(); data = worldData(); } catch (e) { return Promise.resolve(); }
      saving = true;
      const done = r => { saving = false; if ((!r || r[0] !== true || r[1] !== true) && performance.now() - saveWarn > 60000) { saveWarn = performance.now(); chatSys('Could not save the world: the storage of this browser is full or blocked', '#ff5555'); } return r; };
      return Promise.race([Promise.all([kv('meta', 'put', meta), kv('data', 'put', data)]), new Promise(res => setTimeout(() => res(null), 5000))]).then(done, () => done(null));
    }
    function saveSoon() { clearTimeout(saveT); saveT = setTimeout(() => saveNow(), 800); }
    api.on(window, 'pagehide', () => { saveNow(); });
    api.on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });
    function restoreData(d) {
      if (d == null) return true;
      if (typeof d !== 'object' || Array.isArray(d)) return false;
      let ok = d.corrupt === undefined;
      const bad = () => { ok = false; };
      if (d.edits != null && !Array.isArray(d.edits)) bad();
      if (Array.isArray(d.edits)) for (const en of d.edits) {
        if (!Array.isArray(en) || !fin(en[0]) || typeof en[1] !== 'string') { bad(); continue; }
        const k = en[0], b = en[1];
        let a;
        try { a = b64u32(b); } catch (e) { bad(); continue; }
        if (a.length > 1500000) { bad(); continue; }
        const ed = new Map();
        for (let i = 0; i < a.length; i++) { const v = a[i], s = v % 16384, li = Math.floor(v / 16384); if (s < NSTATE && li < NSEC * 4096) ed.set(li, s); }
        if (ed.size === a.length) ed.b = b; else bad();
        W.edits.set(k, ed);
      }
      if (d.be != null && !Array.isArray(d.be)) bad();
      if (Array.isArray(d.be)) for (const en of d.be) {
        if (!Array.isArray(en) || typeof en[0] !== 'string' || !en[1] || typeof en[1] !== 'object' || Array.isArray(en[1])) { if (en != null) bad(); continue; }
        const v = en[1];
        if (v.items != null && !Array.isArray(v.items)) { delete v.items; bad(); }
        if (Array.isArray(v.items)) v.items = v.items.slice(0, 54).map(decS);
        if (v.text != null && !Array.isArray(v.text)) { delete v.text; bad(); }
        W.be.set(en[0], v);
      }
      if (d.players && typeof d.players === 'object' && !Array.isArray(d.players)) W.players = d.players; else if (d.players != null) bad();
      if (fin(d.time) && d.time >= 0 && d.time < 1e12) W.time = Math.floor(d.time); else if (d.time != null) bad();
      W.raining = !!d.raining; W.thunder = !!d.thunder; if (fin(d.weatherT)) W.weatherT = d.weatherT;
      if (Array.isArray(d.spawn) && d.spawn.length >= 3 && d.spawn.slice(0, 3).every(fin) && Math.abs(d.spawn[0]) < 3e7 && Math.abs(d.spawn[2]) < 3e7 && d.spawn[1] > -64 && d.spawn[1] < H + 64) W.spawn = d.spawn.slice(0, 3); else if (d.spawn != null) bad();
      W.visited = new Set(Array.isArray(d.visited) ? d.visited.filter(fin).slice(0, 200000) : []); W.bonusDone = !!d.bonusDone;
      try { const pd = d.player && typeof d.player === 'object' ? d.player : null; if (d.player != null && !pd) bad(); if (pd && !applyPlayerData(pd)) bad(); } catch (e) { bad(); }
      if (![P.x, P.y, P.z].every(fin) || Math.abs(P.x) > 3e7 || Math.abs(P.z) > 3e7 || P.y < -64 || P.y > H + 200) { P.x = P.px = W.spawn[0]; P.y = P.py = W.spawn[1]; P.z = P.pz = W.spawn[2]; P.place = true; bad(); }
      if (d.player && d.player.dead) { P.dead = false; }
      W.pendEnts = Array.isArray(d.ents) ? d.ents.slice(0, 600) : [];
      if (d.ents != null && !Array.isArray(d.ents)) bad();
      return ok;
    }
    function spawnSaved() {
      const L = W.pendEnts; W.pendEnts = null;
      if (!L) return;
      for (const o of L) {
        if (!o || ![o.x, o.y, o.z].every(fin)) continue;
        if (o.k === 'mob' && typeof o.type === 'string' && MT.hasOwnProperty(o.type)) { const e = spawnMob(o.type, o.x, o.y, o.z, { baby: !!o.baby, size: fin(o.size) ? clamp(o.size | 0, 1, 4) : undefined, yaw: fin(o.yaw) ? o.yaw : 0, hp: fin(o.hp) && o.hp > 0 ? Math.min(o.hp, 1000) : undefined, persist: !!o.persist }); if (e) { if (typeof o.color === 'string' && DYE[o.color]) e.color = o.color; if (o.sheared) { e.sheared = true; if (e.wool) e.wool.root.visible = false; } e.persist = !!o.persist; } }
        else if (o.k === 'item') { const s = decS(o.s); if (s) { const e = spawnItem(s, o.x, o.y, o.z, 0, 0, 0, 0); if (e && fin(o.life)) e.life = o.life; } }
        else if (o.k === 'xp') spawnXp(o.v | 0, o.x, o.y, o.z);
      }
    }
    let blurOn = false, panoReady = false, panoA = 0, acc = 0, fpsN = 0, fpsT = 0, loadT0 = 0, selfE = null, handG = null, handArm = null, handItem = null, handId = -2, lightF = 0, rainP = null, flash = 0;
    const V3 = new THREE.Vector3(), V3b = new THREE.Vector3();
    const PF = { n: 0, fr: 0, mx: 0, st: 0, tk: 0, tn: 0, tmx: 0, ic: 0, icx: 0, rdx: 0, stx: 0, rd: 0, ui: 0, ln: 0, lc: 0, lmx: 0, mn: 0, mc: 0, mmx: 0, vn: 0, vc: 0, vmx: 0 };
    const VIS = { cx: 1e9, sy: 0, cz: 0, cell: -1, mask: 63, f: 0, n: 0, tot: 0, burst: 0, on: true }, VQC = [], VQS = [], VQF = [], MQ = [];
    const stopMusic = () => { };
    function burstAt(x, y, z, rgb, n) { for (let i = 0; i < n * 3; i++) particle(x, y + .2, z, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, rgb, .6, .08, 6); }
    P.name = myName();
    function remeshAll() { if (!W) return; FANCY = SET.fancy; W.cols.forEach(c => { if (c.meshed) for (let s = 0; s < NSEC; s++) if (c.s[s] || c.m[s]) { c.md[s] = 1; W.dirty.add(c); } }); }
    const pendVis = c => { if (!c.vt) return true; for (let s = 0; s <= c.top; s++) if (c.md[s] && c.vs[s]) return true; return false; };
    function resetPlayer() {
      Object.assign(P, { st: {}, adv: {}, goal: 0, x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, fall: 0, fly: false, xp: 0, lvl: 0, score: 0, dead: false, sleeping: 0, effects: {}, fire: 0, absorb: 0, spawn: null, hurtT: 0, place: true, yaw: 0, pitch: 0 });
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
      Object.assign(W, { id: o.id || null, name: o.name || 'World', folder: o.folder || o.name, mode: o.mode || 'survival', defMode: o.defMode || o.mode || 'survival', diff: fin(o.diff) ? clamp(o.diff | 0, 0, 4) : 2, hardcore: !!o.hardcore, cheats: !!o.cheats, rules: Object.assign(defRules(), o.rules || {}), time: fin(o.time) ? o.time : 0, raining: !!o.raining, thunder: !!o.thunder, weatherT: fin(o.weatherT) ? o.weatherT : 12000 + ri(100000), dim: 'overworld', players: {}, remote: !!o.remote, pano: !!o.pano, created: o.created || Date.now(), visited: new Set(), bonus: !!o.bonus });
      W.spawn = Array.isArray(o.spawn) ? o.spawn : W.gen.spawn();
      hooks.onSet = onSetHook;
      hooks.colLoaded = colLoaded;
      resetPlayer();
      P.x = P.px = W.spawn[0]; P.y = P.py = W.spawn[1]; P.z = P.pz = W.spawn[2];
      P.name = NET.role ? P.name : myName();
      startWorkers();
      tickN = 0; simT = 0; acc = 0; simLast = 0; loadT0 = performance.now(); NET.ready = !o.remote; FANCY = SET.fancy; VIS.cx = 1e9; VIS.cell = -1; VIS.mask = 63;
      if (!o.pano) { grab(); scr = 'loading'; loadMsg = 'Loading terrain...'; loadP = 0; }
      return W;
    }
    function startPano() {
      if (W) return;
      openWorldObj({ seed: 20260316, type: 'default', mode: 'spectator', pano: true, time: 6000 });
      scr = 'title';
    }
    function openWorld(id, host) {
      scr = 'loading'; loadMsg = 'Loading world...'; loadP = 0;
      Promise.all([kv('meta', 'get', id), kv('data', 'get', id)]).then(([m0, d]) => {
        if (!okMeta(m0)) { goWorlds(); return; }
        const m = cleanMeta(m0);
        openWorldObj(Object.assign({}, m, { time: 0, spawn: null }));
        let good = false;
        try { good = restoreData(d); } catch (e) { good = false; }
        if (!good && d != null) { try { kv('data', 'get', id + '~bak').then(b => { if (!b) kv('data', 'put', typeof d === 'object' && !Array.isArray(d) ? Object.assign({}, d, { id: id + '~bak' }) : { id: id + '~bak', raw: d }); }); } catch (e) { } chatSys('Part of this world save could not be read. A backup copy of the old data was kept.', '#ffaa00'); }
        W.created = m.created;
        afterOpen(host);
      }).catch(() => { try { closeWorld(); } catch (e) { } goWorlds(); });
    }
    function createWorld(cfg, host) {
      const id = 'w' + Date.now().toString(36) + ri(1e6).toString(36), hc = cfg.mode === 'hardcore';
      openWorldObj({ id, name: cfg.name, seed: parseSeed(cfg.seed), type: cfg.type, mode: hc ? 'survival' : cfg.mode, defMode: hc ? 'survival' : cfg.mode, diff: hc ? 4 : cfg.diff, hardcore: hc, cheats: !hc && cfg.cheats, rules: cfg.rules, time: 0, bonus: cfg.bonus });
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
      if (W && !W.remote) { scr = 'loading'; loadMsg = 'Saving world'; let once = false; const f3 = () => { if (!once) { once = true; fin2(); } }; saveNow().then(f3, f3); setTimeout(f3, 6000); } else fin2();
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
      const t0 = performance.now(), cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4, rd = W.pano ? Math.min(RD, 5) : RD, R = rd + 1;
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
        if (c.st === 1 || (c.st === 2 && !c.meshed && d <= (rd + .5) * (rd + .5))) { c.dq = d; cand.push(c); }
      });
      if (cand.length) {
        cand.sort((a, b) => a.dq - b.dq);
        for (const c of cand) {
          if (performance.now() - t0 > budget) break;
          if (c.st === 1) { const a = performance.now(); stitchLight(c); const d = performance.now() - a; PF.ln++; PF.lc += d; if (d > PF.lmx) PF.lmx = d; continue; }
          let ok = true;
          for (let dz = -1; dz <= 1 && ok; dz++) for (let dx = -1; dx <= 1 && ok; dx++) { const n = colAt(c.cx + dx, c.cz + dz); if (!n || n.st < 2) ok = false; }
          if (!ok) continue;
          c.meshed = true; c.md.fill(0);
          for (let s = 0; s <= c.top; s++) if (c.s[s]) c.md[s] = 1;
          W.dirty.add(c);
          if (W.visd < 1) W.visd = 1;
        }
      }
      updVis();
      if (W.dirty.size) {
        const vcx = VIS.cx, vcz = VIS.cz, vsy = VIS.sy;
        MQ.length = 0;
        for (const c of W.dirty) {
          const near = Math.abs(c.cx - vcx) <= 1 && Math.abs(c.cz - vcz) <= 1;
          let pend = false, any = false;
          for (let s = 0; s < NSEC; s++) if (c.md[s]) { pend = true; if (c.vs[s] || near && Math.abs(s - vsy) <= 1) { any = true; break; } }
          if (!pend) { W.dirty.delete(c); continue; }
          if (any) { c.dq = (c.cx - vcx) ** 2 + (c.cz - vcz) ** 2; MQ.push(c); }
        }
        if (MQ.length) {
          MQ.sort((a, b) => a.dq - b.dq);
          const lim = budget + (budget < 20 && VIS.burst > 0 ? 3 : 0);
          let over = false;
          for (let qi = 0; qi < MQ.length && !over; qi++) {
            const c = MQ[qi], near = Math.abs(c.cx - vcx) <= 1 && Math.abs(c.cz - vcz) <= 1;
            for (let k = 0; k < NSEC * 2 && !over; k++) {
              const s = vsy + ((k & 1) ? -((k + 1) >> 1) : (k >> 1));
              if (s < 0 || s >= NSEC || !c.md[s] || !(c.vs[s] || near && Math.abs(s - vsy) <= 1)) continue;
              const a = performance.now();
              c.md[s] = 0; meshSection(c, s); setSecMesh(c, s);
              const b = performance.now(), d = b - a; PF.mn++; PF.mc += d; if (d > PF.mmx) PF.mmx = d;
              if (b - t0 > lim) over = true;
            }
          }
          MQ.length = 0;
        }
      }
      if (VIS.burst > 0) VIS.burst--;
    }
    function updVis() {
      const px = persp ? cam.position.x : P.x, py = persp ? cam.position.y : P.y + P.eye, pz = persp ? cam.position.z : P.z;
      const bx = Math.floor(px), by = clamp(Math.floor(py), 0, H - 1), bz = Math.floor(pz), cx = bx >> 4, cz = bz >> 4, sy = by >> 4, cell = (bx & 15) | (bz & 15) << 4 | (by & 15) << 8;
      const c0 = colAt(cx, cz);
      if (!c0 || !c0.meshed) return;
      const tn = performance.now();
      let run = W.visd === 2 || cx !== VIS.cx || cz !== VIS.cz || sy !== VIS.sy || W.visd === 1 && tn - VIS.f >= 80, mask = VIS.mask;
      if (W.cdq.size) { for (const c of W.cdq) { for (let s = 0; s < NSEC; s++) if (c.cd >> s & 1) c.cn[s] = W.conn.all(c.s[s]); c.cd = 0; } W.cdq.clear(); }
      if (run || cell !== VIS.cell) { const sec = c0.s[sy]; mask = Math.floor(py) !== by ? 63 : sec && OPQ[sec[cell]] ? 0 : W.conn.from(sec, cell); if (mask !== VIS.mask) run = true; }
      VIS.cell = cell;
      if (!run) return;
      const a = performance.now(), urgent = W.visd === 2 || cx !== VIS.cx || cz !== VIS.cz || sy !== VIS.sy;
      VIS.cx = cx; VIS.cz = cz; VIS.sy = sy; VIS.mask = mask; VIS.f = tn; W.visd = 0;
      const pair = W.conn.pair, on = VIS.on && mask !== 0;
      W.cols.forEach(c => { if (c.meshed) { c.vs.fill(on ? 0 : 64); c.vt = 1; } });
      if (on) {
        let qh = 0, qt = 0;
        VQC[qt] = c0; VQS[qt] = sy; VQF[qt++] = -1; c0.vs[sy] = 64;
        while (qh < qt) {
          const c = VQC[qh], s = VQS[qh], ef = VQF[qh++], cn = c.cn[s], ddx = c.cx - cx, ddz = c.cz - cz, ddy = s - sy;
          for (let f = 0; f < 6; f++) {
            const D = DIR6[f];
            if (D[0] * ddx < 0 || D[1] * ddy < 0 || D[2] * ddz < 0) continue;
            if (ef < 0) { if (!(mask >> f & 1)) continue; } else if (f === ef || !(cn >> pair[ef * 6 + f] & 1)) continue;
            const ns = s + D[1];
            if (ns < 0 || ns >= NSEC) continue;
            const nc = D[1] ? c : colAt(c.cx + D[0], c.cz + D[2]);
            if (!nc || !nc.meshed) continue;
            const nf = OPP6[f], bit = 1 << nf;
            if (nc.vs[ns] & bit) continue;
            nc.vs[ns] |= bit | 64;
            VQC[qt] = nc; VQS[qt] = ns; VQF[qt++] = nf;
          }
        }
        for (let i = 0; i < qt; i++) VQC[i] = null;
      }
      let n = 0, tot = 0;
      W.cols.forEach(c => { if (!c.meshed) return; for (let s = 0; s <= c.top; s++) { const r = c.m[s], v = c.vs[s] !== 0; if (c.s[s]) { tot++; if (v) n++; } if (r) { if (r.o) r.o.visible = v; if (r.t) r.t.visible = v; } } });
      VIS.n = n; VIS.tot = tot;
      if (urgent) VIS.burst = 3;
      const d = performance.now() - a; PF.vn++; PF.vc += d; if (d > PF.vmx) PF.vmx = d;
    }
    function nearMeshed(r) {
      const cx0 = Math.floor(P.x) >> 4, cz0 = Math.floor(P.z) >> 4; let n = 0, t = 0;
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { t++; const c = colAt(cx0 + dx, cz0 + dz); if (c && c.meshed && !pendVis(c)) n++; }
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
        if (e.mirror || e.gone) continue;
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
      if (!P.dead && !W.pano && scr === 'game') { stat('play'); stat('sinceDeath'); const dh = Math.hypot(P.x - P.px, P.z - P.pz) * 100; if (dh > 0 && dh < 300) stat(P.fly ? 'flyCm' : P.eyeW ? 'swimCm' : P.sprint ? 'sprintCm' : 'walkCm', dh); if (P.y < P.py && !P.fly) stat('fallCm', (P.py - P.y) * 100); }
      advTick();
      goalTick();
      tickInteract();
      if (guiPos && guiBE && gui !== 'sign' && W.be.get(bk(guiPos[0], guiPos[1], guiPos[2])) !== guiBE) closeGui();
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
      SKYS.ang = ang; SKYS.b = b;
      return SKYS;
    }
    const SKYS = { ang: 0, b: 1 };
    const C1 = new THREE.Color(), C2 = new THREE.Color(), CTOP = new THREE.Color(), CFOG = new THREE.Color(), CGLOW = new THREE.Color(1, .55, .25);
    function render(now, alpha) {
      const st = skyState(); sunB = st.b;
      lightF = alpha;
      U.sky.value = .27 + .73 * st.b; if (flash > 0) U.sky.value = 1;
      U.frame.value = VIS.frz ? 0 : Math.floor(now / 100) % 16;
      U.gam.value = SET.gam;
      const B = W.gen.BIO[bio(Math.floor(P.x), Math.floor(P.z))] || {};
      const tmp = clamp((B.t ?? .8) / 3, -1, 1), skyHue = .6222 - tmp * .05, skySat = .5 + tmp * .1;
      C1.setHSL(skyHue, skySat, .5 + .2 * 0).multiplyScalar(1);
      const top = CTOP.setRGB(.47, .65, 1).lerp(C1.setHSL(skyHue, skySat, .62), .5).multiplyScalar(st.b);
      const fogc = CFOG.setRGB(.75, .85, 1).multiplyScalar(st.b * .94 + .06);
      if (W.raining) { const gy = top.r * .3 + top.g * .59 + top.b * .11; top.lerp(C2.setRGB(gy, gy, gy), .6); const fy = fogc.r * .3 + fogc.g * .59 + fogc.b * .11; fogc.lerp(C2.setRGB(fy, fy, fy), .5); }
      const cs = Math.cos(st.ang * Math.PI * 2), glow = cs > -.4 && cs < .4 ? (1 - Math.abs(cs) / .4) : 0;
      const sx = -Math.sin(st.ang * Math.PI * 2);
      skyU.sun.value.set(sx, Math.cos(st.ang * Math.PI * 2), 0); skyU.glowA.value = glow * .9; skyU.rain.value = W.raining ? 1 : 0;
      fogc.lerp(CGLOW, glow * .25 * (1 - (W.raining ? 1 : 0)));
      fogRD += (RD - fogRD) * .04;
      let fogN = fogRD * 16 * .7, fogF = fogRD * 16;
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
      cloudU.off.value.set((W.time + alpha) * .03 - Math.round(ex) * 0 + 0, 0); cloudU.col.value.setScalar(.25 + st.b * .75); cloudU.far.value = Math.max(120, fogRD * 24);
      clouds.position.set(0, 0, 0);
      let yaw = P.yaw, pitch = P.pitch;
      if (W.pano) { panoA = now * 3e-5; yaw = panoA; pitch = -.12; }
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
      renderer.setClearColor(fogc, 1); renderer.clear(); renderer.info.reset();
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
        holder.scale.setScalar(1.25);
        holder.position.set(.6 + sx * .8, -.6 + sy * .5 - eq, -.62 + sz);
        holder.rotation.set(2.0 - Math.sin(sq * Math.PI) * .5, .4 + Math.sin(sq * Math.PI) * .4, .12, 'YXZ');
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
    let lastNow = 0, restT = 4, pauseF = 0, pauseW = 0;
    function autoRD(now, ft) {
      const js = AR.jn ? AR.js / AR.jn : 0, gap = AR.gap;
      AR.js = AR.jn = 0; AR.gap = false;
      if (scr !== 'game' || !W || W.pano || gui || gap || tickN < 100 || document.hidden) { AR.lo = AR.hi = 0; return; }
      const rdAuto = !SET.rd;
      if (ft > 20) {
        AR.hi = 0;
        if (++AR.lo < 3) return;
        AR.lo = 0;
        if (PRQ > 1.26 || PRQ > PRMIN && (!rdAuto || RD <= AR.min || AR.noDown)) { AR.pcap = PRQ; AR.pcapT = now + 240000; if (!setPR(PRQ - .25)) return; }
        else if (rdAuto && RD > AR.min && !AR.noDown) {
          if (!AR.r0) { AR.r0 = RD; AR.f0 = ft; }
          else if (RD <= AR.r0 - 2) { if (ft > AR.f0 * .87) { RD = AR.r0; AR.noDown = true; SET.rda = RD; persistSet(); return; } AR.r0 = RD; AR.f0 = ft; }
          RD--; AR.cap = RD + 1; AR.capT = now + 240000; SET.rda = RD;
        } else return;
      } else if (ft < 17.5 && js < 7) {
        AR.lo = 0;
        if (++AR.hi < 12) return;
        AR.hi = 0;
        if (rdAuto && RD < AR.max && !(RD + 1 >= AR.cap && now < AR.capT)) { RD++; SET.rda = RD; }
        else if (PRQ < PRMAX && !(PRQ + .25 >= AR.pcap && now < AR.pcapT)) { if (!setPR(PRQ + .25)) return; }
        else return;
      } else { AR.lo = AR.hi = 0; return; }
      persistSet();
    }
    let simLast = 0, frameWall = 0;
    function simStep(tw, maxDt, maxTicks) {
      const dt = simLast ? clamp((tw - simLast) / 1000, 0, maxDt) : 0;
      simLast = tw; acc += dt;
      let n = 0;
      while (acc >= .05 && n < maxTicks) { const t0 = performance.now(); tick(); const td = performance.now() - t0; fT += (td - fT) * .1; PF.tk += td; PF.tn++; if (td > PF.tmx) PF.tmx = td; acc -= .05; n++; }
      if (n >= maxTicks) acc = 0;
      return n;
    }
    function bgStep() {
      if (!W || scr !== 'game' || NET.role !== 'host') return;
      const tw = performance.now();
      if (tw - frameWall < 300) return;
      try { simStep(tw, 3, 60); } catch (e) { if (!frameLoop.err) { frameLoop.err = 1; if (window.console) console.error(e); } }
    }
    function frameLoop(dt0, now) {
      const dt = lastNow ? clamp((now - lastNow) / 1000, 0, .25) : dt0; lastNow = now;
      const pf0 = performance.now(); let pf1 = pf0, pfS = 0;
      frameN++;
      if (frameN % 15 === 1) resize();
      if (frameN % 20 === 3) updSigns();
      if (dt > .2) AR.gap = true;
      fpsN++; fpsT += dt; if (fpsT >= 1) { const ft = fpsT * 1000 / fpsN; fps = fpsN; fpsN = 0; fpsT = 0; autoRD(now, ft); }
      frameWall = pf0;
      if (!W && (scr === 'title')) startPano();
      if (W && icI < IT.length) { const a = performance.now(); iconStep(scr === 'game' && !gui ? 2 : 6); const d = performance.now() - a; PF.ic += d; if (d > PF.icx) PF.icx = d; }
      touchTick();
      let alpha = 1;
      if (W) {
        const loading = scr === 'loading' || scr === 'waiting';
        streamChunks(loading ? 24 : clamp(9 - restT, 2, 4));
        pfS = performance.now() - pf0; PF.st += pfS; if (pfS > PF.stx) PF.stx = pfS;
        if (W.pano) { if (!panoReady && nearMeshed(RD < 3 ? 1 : 2) >= 1) { panoReady = true; const t = topY(Math.floor(P.x), Math.floor(P.z)); let m = t; for (let dz = -6; dz <= 6; dz += 3) for (let dx = -6; dx <= 6; dx += 3) m = Math.max(m, topY(Math.floor(P.x) + dx, Math.floor(P.z) + dz)); P.y = P.py = m + 3 - P.eye; } }
        else if (scr === 'loading') {
          if (NET.role === 'guest' && !NET.ready) loadP = Math.max(loadP, .1);
          else {
            const p = nearMeshed(RD < 3 ? 1 : 2); loadP = .5 + p * .5; loadMsg = W.remote ? 'Loading terrain...' : loadMsg;
            if (p >= 1 || performance.now() - loadT0 > 20000) {
              scr = 'game'; panoReady = false; P.name = NET.role ? P.name : myName();
              if (NET.pendOpen || NET.role === 'host') { NET.pendOpen = false; hostAfterOpen(); }
              if (W.mode === 'spectator') P.fly = true;
              chatSys(W.remote ? 'Joined ' + W.name : '', '#ffffff'); chatLog.pop();
            }
          }
        }
        if (scr !== 'game') simLast = pf0;
        if (scr === 'game') {
          const paused = !NET.role && (gui === 'pause' || gui === 'options' || gui === 'controls' || gui === 'stats' || gui === 'adv' || gui === 'help');
          if (!paused) simStep(pf0, .25, 5); else simLast = pf0;
          alpha = paused ? 1 : clamp(acc / .05, 0, 1);
          lightF = alpha;
          if (!gui && !chatOpen) updTarget(); else { HIT.b = false; HIT.ent = null; }
        }
        const show3d = scr === 'game' || W.pano, held3 = scr === 'game' && !NET.role && (gui === 'pause' || gui === 'stats' || gui === 'adv' || gui === 'help' || gui === 'controls') && cssW * 8192 + cssH === pauseW;
        pauseF = held3 ? pauseF + 1 : 0; pauseW = cssW * 8192 + cssH;
        if (show3d && (pauseF < 3 || pauseF % 30 === 0)) { const a = performance.now(); render(now, alpha); const d = performance.now() - a; PF.rd += d; if (d > PF.rdx) PF.rdx = d; }
      }
      pf1 = performance.now();
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, hud.width, hud.height);
      g.imageSmoothingEnabled = false;
      g.setTransform(GK, 0, 0, GK, 0, 0);
      btns = []; fields = []; sliders = [];
      if (!W || !(scr === 'game' || W.pano)) { if (!frameLoop.blk) { frameLoop.blk = 1; renderer.setRenderTarget(null); renderer.setClearColor(0, 1); renderer.clear(); } } else frameLoop.blk = 0;
      const wb = scr === 'game' ? gui === 'pause' || gui === 'options' || gui === 'controls' || gui === 'plist' || gui === 'stats' || gui === 'adv' || gui === 'help' : scr !== 'title' && !!W && !!W.pano && panoReady;
      if (wb !== blurOn) { blurOn = wb; canvas.style.filter = wb ? 'blur(' + Math.max(3, Math.round(GK * 2.5 / (window.devicePixelRatio || 1))) + 'px)' : ''; }
      if (scr === 'game' && W) {
        if (!hideHud || gui || chatOpen) {
          if (!hideHud && !blurOn) { drawHUD(now); if (!gui) drawGoals(now); drawChat(now); } else if (chatOpen) drawChat(now);
          if (touch && !gui && !hideHud && !P.dead) drawTouch();
          try { drawGameGui(now); drawToasts(now); } catch (e) { if (!frameLoop.gerr) { frameLoop.gerr = 1; if (window.console) console.error(e); } gui = null; }
        }
        if (W.rules.showCoordinates && !showF3 && !hideHud) text('XYZ: ' + Math.floor(P.x) + ' / ' + Math.floor(P.y - CFG.YOFF) + ' / ' + Math.floor(P.z), 2, 2, '#ffffff');
      } else { if (locked() && scr !== 'loading' && now - wantLock > 4000) releaseMouse(); drawScreen(now); }
      if (focusKey && !fields.some(f => f.key === focusKey) && focusKey !== 'sign') blurField();
      else if (focusKey) { const f = fields.find(q => q.key === focusKey); if (f) { const k = cssW / hud.width * GK; inp.style.left = f.x * k + 'px'; inp.style.top = f.y * k + 'px'; inp.style.width = f.w * k + 'px'; inp.style.height = f.h * k + 'px'; } }
      if (focusKey === 'chat') FIELDV.chat = inp.value;
      const pf2 = performance.now(); PF.ui += pf2 - pf1; PF.fr += pf2 - pf0; PF.n++; if (pf2 - pf0 > PF.mx) PF.mx = pf2 - pf0;
      restT += (Math.min(30, pf2 - pf0 - pfS) - restT) * .1; AR.js += pf2 - pf0; AR.jn++;
    }
    wrap.__mc = r => ({ pf: (() => { const o = Object.assign({}, PF); if (r) for (const k in PF) PF[k] = 0; return o; })(), fields: fields.map(f => [f.key, f.x, f.y, f.w, f.h]), dirty: W ? W.dirty.size : 0, ic: [icI, IT.length], pr: PRQ, tl: touch ? touchLayout() : null, frame: frameN, tick: tickN, rd: RD, diff: W ? W.diff : -1, st: P.st, setRd: SET.rd, locked: locked(), sleeping: P.sleeping, pend: (() => { let n = 0; if (W) for (const c of W.dirty) for (let s = 0; s < NSEC; s++) if (c.md[s] && c.vs[s]) n++; return n; })(), vis: [VIS.n, VIS.tot], draw: [renderer.info.render.calls, renderer.info.render.triangles, renderer.info.memory.geometries], onGround: P.onGround, fly: P.fly, dead: P.dead, lvl: P.lvl, spawn: P.spawn, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0, nEnt: ENTS.length, signs: signG.children.map(m => [+m.position.x.toFixed(3), +(m.position.y - CFG.YOFF).toFixed(3), +m.position.z.toFixed(3), +m.rotation.y.toFixed(2)]), scr, gui, GK, GW, GH, pRect, chatOpen, btns: btns.map(b => [b.l, b.x, b.y, b.w, b.h, b.en]), P: { x: P.x, y: P.y, z: P.z, hp: P.hp, food: P.food, yaw: P.yaw, pitch: P.pitch }, ents: (() => { const o = {}; for (const e of ENTS) { const k = e.kind + ':' + (e.type || (e.st ? IT[e.st.id].id : '')); o[k] = (o[k] || 0) + 1; } return o; })(), keysDown: [...keys], focus: focusKey, mobs: ENTS.filter(e => e.kind === 'mob').map(e => [e.type, +e.x.toFixed(1), +(e.y - CFG.YOFF).toFixed(1), +e.z.toFixed(1), e.root.visible, e.hp, !!e.dead, e.root.parent ? 1 : 0]), fps, cols: W ? W.cols.size : 0, mode: W && W.mode, role: NET.role, time: W && W.time, chat: chatLog.slice(-8).map(c => c.m), hit: HIT.b ? [HIT.x, HIT.y, HIT.z] : null, sel, inv: inv.map(s => s && IT[s.id].id + 'x' + s.n), slots: slots.map(q => { const v = q.get(); return [q.g, q.i, q.x, q.y, v ? IT[v.id].id + 'x' + v.n : null]; }), cursor: cursor && IT[cursor.id].id + 'x' + cursor.n });
    wrap.__mcDbg = o => { Object.assign(VIS, o); if (W) W.visd = 2; };
    wrap.__mcBench = all => { const T = []; let q = 0; W.cols.forEach(c => { if (c.meshed) for (let s = 0; s <= c.top; s++) if ((all || c.vs[s]) && c.s[s]) { const a = performance.now(); meshSection(c, s); T.push(performance.now() - a); q += (MO.ni + MESHT.ni) / 6; } }); return [T, q]; };
    resize();
    api.loop((dt, now) => { try { frameLoop(dt, now); } catch (e) { if (!frameLoop.err) { frameLoop.err = 1; if (window.console) console.error(e); } } });
    const sizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
    if (sizeObs) sizeObs.observe(wrap);
    api.interval(bgStep, 100);
    try { if (api.net && api.net.invite) joinParty(); } catch (e) { }
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
  const G = '.gm-blockcraft-3d';
  Ameplay.register({
    id: 'blockcraft-3d',
    title: 'Minecraft',
    category: '3D',
    ownPause: true,
    tint: '#5d9b3a',
    blurb: 'Survival, Creative and Adventure worlds with 1100+ blocks, crafting, mobs, flowing water and LAN / online multiplayer.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Space</kbd> jump (double-tap to fly in Creative) · <kbd>Shift</kbd> sneak · <kbd>Ctrl</kbd> or double-tap <kbd>W</kbd> sprint · left click mine/attack · right click place/use · middle click pick block · <kbd>E</kbd> inventory · <kbd>Q</kbd> drop · <kbd>F</kbd> swap hands · <kbd>T</kbd> chat · <kbd>/</kbd> commands · <kbd>1</kbd>–<kbd>9</kbd>/wheel hotbar · <kbd>F3</kbd> debug · <kbd>F5</kbd> camera · <kbd>Esc</kbd> menu · touch: stick to move, drag to look, tap to place/attack, hold to mine',
    better: 'high',
    format: v => v + ' XP',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 7 55 19.5v25L32 57 9 44.5v-25z"/><path d="M9 19.5 32 32l23-12.5M32 32v25"/><path d="M9 27l23 12.5L55 27" opacity=".3"/><path d="M16 31v5M23 35v6M41 35v5M48 31v6" opacity=".3"/></svg>',
    css: `
${G}{gap:0}
${G} .bc-wrap{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px)) * 1.6));aspect-ratio:16/10;overflow:hidden;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:var(--r)}
${G} .bc-gl,${G} .bc-hud{position:absolute;left:0;top:0;width:100%;height:100%;display:block;border-radius:0;object-fit:cover}
${G} .bc-hud{image-rendering:crisp-edges;image-rendering:pixelated}
${G} .bc-in{position:absolute;z-index:2;opacity:0;font-size:16px;border:0;padding:0;margin:0;background:transparent;color:transparent;caret-color:transparent;outline:0}
@media (max-width:640px){${G} .bc-wrap{width:100%;aspect-ratio:auto;height:clamp(380px,calc(100dvh - var(--goff,250px)),135vw)}}
`,
    mount(root, api) {
      const keys = api.keys;
      let cleanup = null, gone = false;
      api.gl(960, 600, { antialias: false }).then(v => v && api.alive ? run(root, api, keys, v) : null).then(c => { if (!c) return; if (gone) c(); else cleanup = c; }, e => { if (window.console) console.error(e); });
      return { destroy() { gone = true; if (cleanup) { const c = cleanup; cleanup = null; c(); } } };
    }
  });
  Ameplay.covers['blockcraft-3d'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bcx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f93f2"/><stop offset=".7" stop-color="#9cc3ff"/><stop offset="1" stop-color="#c4dcff"/></linearGradient></defs><rect width="400" height="300" fill="url(#bcx-sky)"/><rect x="292" y="26" width="46" height="46" fill="#fff6b0" opacity=".45"/><rect x="301" y="35" width="28" height="28" fill="#fffbe0"/><g fill="#fff" opacity=".92"><rect x="26" y="40" width="96" height="16"/><rect x="46" y="28" width="44" height="14"/><rect x="170" y="22" width="70" height="12"/><rect x="186" y="12" width="30" height="12"/></g><ellipse cx="200" cy="262" rx="150" ry="22" fill="#2a5a1e" opacity=".25"/><polygon points="196,98 220,110 196,122 172,110" fill="#86d16a"/><polygon points="172,110 196,122 172,134 148,122" fill="#86d16a"/><polygon points="220,110 244,122 220,134 196,122" fill="#86d16a"/><polygon points="244,122 220,134 220,158 244,146" fill="#6c4527"/><polygon points="220,134 244,122 244,129 220,141" fill="#4a9139"/><polygon points="220,14 244,26 220,38 196,26" fill="#4caf50"/><rect x="216" y="24" width="7" height="4" fill="#6cc96f"/><polygon points="244,146 268,158 244,170 220,158" fill="#86d16a"/><polygon points="148,98 172,110 148,122 124,110" fill="#86d16a"/><polygon points="196,98 220,110 196,122 172,110" fill="#86d16a"/><polygon points="196,2 220,14 196,26 172,14" fill="#4caf50"/><polygon points="172,14 196,26 196,50 172,38" fill="#3a9142"/><rect x="192" y="12" width="7" height="4" fill="#6cc96f"/><polygon points="244,2 268,14 244,26 220,14" fill="#4caf50"/><polygon points="268,14 244,26 244,50 268,38" fill="#2c7434"/><rect x="240" y="12" width="7" height="4" fill="#6cc96f"/><polygon points="268,158 292,170 268,182 244,170" fill="#86d16a"/><polygon points="244,146 220,158 220,182 244,170" fill="#6c4527"/><polygon points="124,110 148,122 124,134 100,122" fill="#86d16a"/><polygon points="100,122 124,134 124,158 100,146" fill="#8a5a33"/><polygon points="100,122 124,134 124,141 100,129" fill="#5aa846"/><polygon points="244,122 220,134 220,158 244,146" fill="#5e4426"/><polygon points="172,86 196,98 172,110 148,98" fill="#86d16a"/><polygon points="148,98 172,110 172,134 148,122" fill="#8a5a33"/><polygon points="196,98 172,110 172,134 196,122" fill="#6c4527"/><polygon points="148,98 172,110 172,117 148,105" fill="#5aa846"/><polygon points="172,110 196,98 196,105 172,117" fill="#4a9139"/><polygon points="196,98 220,110 220,134 196,122" fill="#7a5a34"/><polygon points="244,98 220,110 220,134 244,122" fill="#5e4426"/><polygon points="196,74 220,86 220,110 196,98" fill="#7a5a34"/><polygon points="244,74 220,86 220,110 244,98" fill="#5e4426"/><polygon points="172,38 196,50 172,62 148,50" fill="#4caf50"/><polygon points="148,50 172,62 172,86 148,74" fill="#3a9142"/><rect x="168" y="48" width="7" height="4" fill="#6cc96f"/><polygon points="268,38 292,50 268,62 244,50" fill="#4caf50"/><polygon points="292,50 268,62 268,86 292,74" fill="#2c7434"/><rect x="264" y="48" width="7" height="4" fill="#6cc96f"/><polygon points="220,14 244,26 220,38 196,26" fill="#4caf50"/><polygon points="244,170 268,182 244,194 220,182" fill="#86d16a"/><polygon points="292,170 316,182 292,194 268,182" fill="#86d16a"/><polygon points="316,182 292,194 292,218 316,206" fill="#6c4527"/><polygon points="292,194 316,182 316,189 292,201" fill="#4a9139"/><polygon points="100,146 124,158 100,170 76,158" fill="#86d16a"/><polygon points="76,158 100,170 100,194 76,182" fill="#8a5a33"/><polygon points="76,158 100,170 100,177 76,165" fill="#5aa846"/><polygon points="148,122 172,134 148,146 124,134" fill="#86d16a"/><polygon points="124,134 148,146 148,170 124,158" fill="#8a5a33"/><polygon points="124,134 148,146 148,153 124,141" fill="#5aa846"/><polygon points="196,122 220,134 196,146 172,134" fill="#86d16a"/><polygon points="220,134 196,146 196,170 220,158" fill="#6c4527"/><polygon points="196,146 220,134 220,141 196,153" fill="#4a9139"/><polygon points="172,62 196,74 196,98 172,86" fill="#3a9142"/><polygon points="268,62 244,74 244,98 268,86" fill="#2c7434"/><polygon points="196,26 220,38 196,50 172,38" fill="#4caf50"/><polygon points="172,38 196,50 196,74 172,62" fill="#3a9142"/><polygon points="220,38 196,50 196,74 220,62" fill="#2c7434"/><rect x="192" y="36" width="7" height="4" fill="#6cc96f"/><polygon points="244,26 268,38 244,50 220,38" fill="#4caf50"/><polygon points="220,38 244,50 244,74 220,62" fill="#3a9142"/><polygon points="268,38 244,50 244,74 268,62" fill="#2c7434"/><rect x="240" y="36" width="7" height="4" fill="#6cc96f"/><polygon points="52,218 76,230 76,254 52,242" fill="#8a5a33"/><polygon points="316,206 340,218 316,230 292,218" fill="#86d16a"/><polygon points="340,218 316,230 316,254 340,242" fill="#6c4527"/><polygon points="316,230 340,218 340,225 316,237" fill="#4a9139"/><polygon points="76,182 100,194 76,206 52,194" fill="#86d16a"/><polygon points="52,194 76,206 76,230 52,218" fill="#8a5a33"/><polygon points="52,194 76,206 76,213 52,201" fill="#5aa846"/><polygon points="268,182 292,194 268,206 244,194" fill="#86d16a"/><polygon points="292,194 268,206 268,230 292,218" fill="#6c4527"/><polygon points="268,206 292,194 292,201 268,213" fill="#4a9139"/><polygon points="124,158 148,170 124,182 100,170" fill="#86d16a"/><polygon points="100,170 124,182 124,206 100,194" fill="#8a5a33"/><polygon points="100,170 124,182 124,189 100,177" fill="#5aa846"/><polygon points="220,158 244,170 220,182 196,170" fill="#86d16a"/><polygon points="244,170 220,182 220,206 244,194" fill="#6c4527"/><polygon points="220,182 244,170 244,177 220,189" fill="#4a9139"/><polygon points="172,134 196,146 172,158 148,146" fill="#86d16a"/><polygon points="148,146 172,158 172,182 148,170" fill="#8a5a33"/><polygon points="196,146 172,158 172,182 196,170" fill="#6c4527"/><polygon points="148,146 172,158 172,165 148,153" fill="#5aa846"/><polygon points="172,158 196,146 196,153 172,165" fill="#4a9139"/><polygon points="220,62 244,74 220,86 196,74" fill="#4caf50"/><polygon points="196,74 220,86 220,110 196,98" fill="#3a9142"/><polygon points="244,74 220,86 220,110 244,98" fill="#2c7434"/><rect x="216" y="72" width="7" height="4" fill="#6cc96f"/><polygon points="76,230 100,242 100,266 76,254" fill="#8a5a33"/><polygon points="292,218 316,230 292,242 268,230" fill="#86d16a"/><polygon points="316,230 292,242 292,266 316,254" fill="#6c4527"/><polygon points="292,242 316,230 316,237 292,249" fill="#4a9139"/><polygon points="100,194 124,206 100,218 76,206" fill="#86d16a"/><polygon points="76,206 100,218 100,242 76,230" fill="#8a5a33"/><polygon points="76,206 100,218 100,225 76,213" fill="#5aa846"/><polygon points="244,194 268,206 244,218 220,206" fill="#86d16a"/><polygon points="148,170 172,182 148,194 124,182" fill="#86d16a"/><polygon points="124,182 148,194 148,218 124,206" fill="#8a5a33"/><polygon points="172,182 148,194 148,218 172,206" fill="#6c4527"/><polygon points="124,182 148,194 148,201 124,189" fill="#5aa846"/><polygon points="148,194 172,182 172,189 148,201" fill="#4a9139"/><polygon points="196,170 220,182 196,194 172,182" fill="#86d16a"/><polygon points="172,182 196,194 196,218 172,206" fill="#8a5a33"/><polygon points="220,182 196,194 196,218 220,206" fill="#6c4527"/><polygon points="172,182 196,194 196,201 172,189" fill="#5aa846"/><polygon points="196,194 220,182 220,189 196,201" fill="#4a9139"/><polygon points="100,242 124,254 124,278 100,266" fill="#8a5a33"/><polygon points="292,242 268,254 268,278 292,266" fill="#6c4527"/><polygon points="124,206 148,218 124,230 100,218" fill="#86d16a"/><polygon points="100,218 124,230 124,254 100,242" fill="#8a5a33"/><polygon points="148,218 124,230 124,254 148,242" fill="#6c4527"/><polygon points="100,218 124,230 124,237 100,225" fill="#5aa846"/><polygon points="124,230 148,218 148,225 124,237" fill="#4a9139"/><polygon points="172,206 196,218 172,230 148,218" fill="#86d16a"/><polygon points="148,218 172,230 172,254 148,242" fill="#8a5a33"/><polygon points="196,218 172,230 172,254 196,242" fill="#6c4527"/><polygon points="148,218 172,230 172,237 148,225" fill="#5aa846"/><polygon points="172,230 196,218 196,225 172,237" fill="#4a9139"/><polygon points="220,206 244,218 220,230 196,218" fill="#86d16a"/><polygon points="196,218 220,230 220,254 196,242" fill="#8a5a33"/><polygon points="244,218 220,230 220,254 244,242" fill="#6c4527"/><polygon points="196,218 220,230 220,237 196,225" fill="#5aa846"/><polygon points="220,230 244,218 244,225 220,237" fill="#4a9139"/><polygon points="268,206 292,218 268,230 244,218" fill="#86d16a"/><polygon points="244,218 268,230 268,254 244,242" fill="#8a5a33"/><polygon points="292,218 268,230 268,254 292,242" fill="#6c4527"/><polygon points="244,218 268,230 268,237 244,225" fill="#5aa846"/><polygon points="268,230 292,218 292,225 268,237" fill="#4a9139"/><polygon points="148,242 172,254 148,266 124,254" fill="#3fa9f0"/><polygon points="124,254 148,266 148,290 124,278" fill="#2f7fd0"/><polygon points="196,242 220,254 196,266 172,254" fill="#3fa9f0"/><polygon points="244,242 268,254 244,266 220,254" fill="#3fa9f0"/><polygon points="268,254 244,266 244,290 268,278" fill="#2a6cb8"/><polygon points="172,254 196,266 172,278 148,266" fill="#3fa9f0"/><polygon points="148,266 172,278 172,302 148,290" fill="#2f7fd0"/><polygon points="220,254 244,266 220,278 196,266" fill="#3fa9f0"/><polygon points="244,266 220,278 220,302 244,290" fill="#2a6cb8"/><polygon points="196,266 220,278 196,290 172,278" fill="#3fa9f0"/><polygon points="172,278 196,290 196,314 172,302" fill="#2f7fd0"/><polygon points="220,278 196,290 196,314 220,302" fill="#2a6cb8"/><rect x="146" y="122" width="4" height="12" fill="#2f7a2b"/><rect x="143" y="116" width="10" height="8" fill="#ffd23f"/><rect x="266" y="182" width="4" height="12" fill="#2f7a2b"/><rect x="263" y="176" width="10" height="8" fill="#e83b3b"/><rect x="98" y="146" width="4" height="12" fill="#2f7a2b"/><rect x="95" y="140" width="10" height="8" fill="#e83b3b"/><g transform="translate(196 182)"><rect x="-9" y="-30" width="8" height="30" fill="#3b3f9a"/><rect x="1" y="-30" width="8" height="30" fill="#30347f"/><rect x="-10" y="-62" width="20" height="32" fill="#1f9fa0"/><rect x="-22" y="-62" width="12" height="10" fill="#1f9fa0"/><rect x="10" y="-62" width="12" height="10" fill="#178486"/><rect x="-22" y="-62" width="12" height="8" transform="translate(-6 0)" fill="#5a8f3e"/><rect x="-28" y="-60" width="10" height="26" fill="#5a8f3e" transform="rotate(-80 -23 -60)"/><rect x="18" y="-60" width="10" height="26" fill="#4e7e35" transform="rotate(-80 23 -60)"/><rect x="-12" y="-86" width="24" height="24" fill="#6aa84f"/><rect x="-12" y="-86" width="24" height="6" fill="#4f8a3a"/><rect x="-8" y="-74" width="6" height="4" fill="#1d2b1a"/><rect x="2" y="-74" width="6" height="4" fill="#1d2b1a"/><rect x="-5" y="-67" width="10" height="2" fill="#3b5e2b"/></g><g transform="translate(322 236) rotate(-45)"><rect x="-6" y="-8" width="12" height="96" fill="#8b5a2b"/><rect x="0" y="-8" width="6" height="96" fill="#6e4422"/><path d="M-58-16H58V0H46V10H30V0H-30V10H-46V0H-58Z" fill="#2bb0c4"/><path d="M-58-16H58V-6H-58Z" fill="#5decf5"/><path d="M-28-28H28V-16H-28Z" fill="#5decf5"/><path d="M-28-28H6V-22H-28ZM-52-14H-22V-10H-52Z" fill="#c8fbff"/></g></svg>`;
})();
