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
