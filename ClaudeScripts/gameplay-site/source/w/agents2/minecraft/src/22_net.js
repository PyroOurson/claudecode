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
      ed.set(li, s);
    }
    function applyChange(x, y, z, s, flags) {
      if (!fin(x) || !fin(y) || !fin(z) || !(s >= 0 && s < NSTATE)) return;
      const c = colAt(x >> 4, z >> 4);
      if (c && c.st >= 1) setBlock(x, y, z, s, flags); else editDirect(x, y, z, s);
    }
    function playerData() { return { x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch, hp: P.hp, food: P.food, sat: P.sat, xp: P.xp, lvl: P.lvl, score: P.score, inv: inv.map(encS), armor: armor.map(encS), offhand: encS(offhand), ender: ender.map(encS), mode: W.mode, spawn: P.spawn, effects: P.effects, fly: P.fly, air: P.air, dead: P.dead, sel }; }
    function applyPlayerData(d) {
      if (!d) return false;
      if ([d.x, d.y, d.z].every(fin)) { P.x = d.x; P.y = d.y; P.z = d.z; P.px = P.x; P.py = P.y; P.pz = P.z; P.place = false; }
      for (const k of ['yaw', 'pitch', 'hp', 'food', 'sat', 'xp', 'lvl', 'score', 'air']) if (fin(d[k])) P[k] = d[k];
      if (Array.isArray(d.inv)) inv = d.inv.slice(0, 36).map(decS).concat(new Array(36).fill(null)).slice(0, 36);
      if (Array.isArray(d.armor)) armor = d.armor.slice(0, 4).map(decS).concat([null, null, null, null]).slice(0, 4);
      offhand = decS(d.offhand);
      if (Array.isArray(d.ender)) ender = d.ender.slice(0, 27).map(decS).concat(new Array(27).fill(null)).slice(0, 27);
      if (d.mode && GMN[d.mode]) W.mode = d.mode;
      P.spawn = Array.isArray(d.spawn) && d.spawn.every(fin) ? d.spawn : null;
      P.effects = d.effects && typeof d.effects === 'object' ? d.effects : {};
      P.fly = !!d.fly && (W.mode === 'creative' || W.mode === 'spectator');
      if (fin(d.sel)) sel = clamp(d.sel | 0, 0, 8);
      if (P.hp <= 0) { P.hp = 20; P.food = 20; }
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
        if (!NET.synced.has(pid)) continue;
        const L = [];
        for (const e of ENTS) { if (KC[e.kind] === undefined || e.dead === 2) continue; const d = (e.x - rp.x) ** 2 + (e.z - rp.z) ** 2; if (d < 96 * 96) L.push([d, e]); }
        L.sort((a, b) => a[0] - b[0]);
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
        if (tickN % 2 === 0) hostSnapshots();
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
