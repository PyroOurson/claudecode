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
    function kv(store, op, val) {
      return db().then(d => {
        if (!d) {
          const idx = lsGet(store + 'idx') || [];
          if (op === 'all') return idx.map(id => lsGet(store + ':' + id)).filter(Boolean);
          if (op === 'get') return lsGet(store + ':' + val);
          if (op === 'put') { if (!idx.includes(val.id)) { idx.push(val.id); lsSet(store + 'idx', idx); } lsSet(store + ':' + val.id, val); return true; }
          if (op === 'del') { lsSet(store + 'idx', idx.filter(i => i !== val)); try { localStorage.removeItem(LSK + store + ':' + val); } catch (e) { } return true; }
          return null;
        }
        return new Promise(res => {
          try {
            const tx = d.transaction(store, op === 'all' || op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(store);
            const r = op === 'all' ? st.getAll() : op === 'get' ? st.get(val) : op === 'put' ? st.put(val) : st.delete(val);
            r.onsuccess = () => res(op === 'all' || op === 'get' ? r.result : true); r.onerror = () => res(op === 'all' ? [] : null);
          } catch (e) { res(op === 'all' ? [] : null); }
        });
      });
    }
    function listWorlds() { return kv('meta', 'all').then(l => (l || []).filter(w => w && w.id).sort((a, b) => (b.last || 0) - (a.last || 0))); }
    function deleteWorld(id) { return Promise.all([kv('meta', 'del', id), kv('data', 'del', id)]); }
    function renameWorld(id, name) { return kv('meta', 'get', id).then(m => m ? kv('meta', 'put', Object.assign(m, { name })) : null); }
    function metaOf() { return { id: W.id, name: W.name, folder: W.folder || W.name, seed: W.seed, type: W.type, mode: W.mode, defMode: W.defMode, hardcore: W.hardcore, diff: W.diff, cheats: W.cheats, created: W.created || Date.now(), last: Date.now(), rules: W.rules }; }
    function worldData() {
      const edits = []; W.edits.forEach((ed, k) => { const a = new Uint32Array(ed.size); let i = 0; ed.forEach((s, li) => { a[i++] = li * 16384 + s; }); edits.push([k, u32b64(a)]); });
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
      return Promise.all([kv('meta', 'put', meta), kv('data', 'put', data)]).then(r => { saving = false; return r; }, () => { saving = false; });
    }
    function saveSoon() { clearTimeout(saveT); saveT = setTimeout(() => saveNow(), 800); }
    api.on(window, 'pagehide', () => { saveNow(); });
    api.on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });
    function restoreData(d) {
      if (!d) return;
      if (Array.isArray(d.edits)) for (const [k, b] of d.edits) { if (typeof b !== 'string') continue; const a = b64u32(b), ed = new Map(); for (const v of a) { const s = v % 16384; if (s < NSTATE) ed.set(Math.floor(v / 16384), s); } W.edits.set(k, ed); }
      if (Array.isArray(d.be)) for (const [k, v] of d.be) if (v) W.be.set(k, v);
      if (d.players) W.players = d.players;
      if (fin(d.time)) W.time = d.time;
      W.raining = !!d.raining; W.thunder = !!d.thunder; if (fin(d.weatherT)) W.weatherT = d.weatherT;
      if (Array.isArray(d.spawn)) W.spawn = d.spawn;
      W.visited = new Set(d.visited || []); W.bonusDone = !!d.bonusDone;
      applyPlayerData(d.player);
      if (d.player && d.player.dead) { P.dead = false; }
      W.pendEnts = Array.isArray(d.ents) ? d.ents : [];
    }
    function spawnSaved() {
      const L = W.pendEnts; W.pendEnts = null;
      if (!L) return;
      for (const o of L) {
        if (!o || ![o.x, o.y, o.z].every(fin)) continue;
        if (o.k === 'mob' && MT[o.type]) { const e = spawnMob(o.type, o.x, o.y, o.z, { baby: o.baby, size: o.size, yaw: o.yaw, hp: o.hp, persist: o.persist }); if (e) { if (o.color) e.color = o.color; if (o.sheared) { e.sheared = true; if (e.wool) e.wool.root.visible = false; } e.persist = !!o.persist; } }
        else if (o.k === 'item') { const s = decS(o.s); if (s) { const e = spawnItem(s, o.x, o.y, o.z, 0, 0, 0, 0); if (e && fin(o.life)) e.life = o.life; } }
        else if (o.k === 'xp') spawnXp(o.v | 0, o.x, o.y, o.z);
      }
    }
