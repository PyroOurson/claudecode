    const CMDS = ['gamemode', 'time', 'weather', 'give', 'tp', 'teleport', 'kill', 'seed', 'difficulty', 'gamerule', 'summon', 'xp', 'experience', 'clear', 'effect', 'spawnpoint', 'setworldspawn', 'help', 'list', 'say', 'me', 'msg', 'setblock', 'fill', 'heal', 'locate'];
    const WORLD_CMDS = new Set(['time', 'weather', 'difficulty', 'gamerule', 'summon', 'setworldspawn', 'setblock', 'fill', 'say']);
    function tabComplete(v) {
      const parts = v.slice(1).split(' ');
      if (parts.length === 1) { const m = CMDS.filter(c => c.startsWith(parts[0])); return m.length ? '/' + m[0] + ' ' : null; }
      const last = parts[parts.length - 1], cmd = parts[0];
      let pool = [];
      if (cmd === 'give' && parts.length === 3 || cmd === 'clear') pool = IT.map(i => i.id);
      else if (cmd === 'give' && parts.length === 2) pool = ['@s', '@p', '@a', P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name));
      else if (cmd === 'gamemode') pool = ['survival', 'creative', 'adventure', 'spectator'];
      else if (cmd === 'time') pool = parts.length === 2 ? ['set', 'add', 'query'] : ['day', 'noon', 'night', 'midnight'];
      else if (cmd === 'weather') pool = ['clear', 'rain', 'thunder'];
      else if (cmd === 'difficulty') pool = ['peaceful', 'easy', 'normal', 'hard'];
      else if (cmd === 'gamerule') pool = parts.length === 2 ? RULES.map(r => r[0]).concat(['randomTickSpeed']) : ['true', 'false'];
      else if (cmd === 'summon') pool = Object.keys(MT).concat(['item', 'tnt', 'falling_block']);
      else if (cmd === 'effect') pool = parts.length === 2 ? ['give', 'clear'] : ['regeneration', 'poison', 'hunger', 'fire_resistance', 'water_breathing'];
      const m = pool.filter(p => p.startsWith(last.replace(/^minecraft:/, '')));
      if (!m.length) return null;
      parts[parts.length - 1] = m[0];
      return '/' + parts.join(' ');
    }
    const coord = (s, base) => s === undefined ? base : s[0] === '~' ? base + (+s.slice(1) || 0) : +s;
    function runCommand(str, from) {
      const a = str.trim().split(/\s+/), cmd = (a[0] || '').toLowerCase().replace(/^minecraft:/, '');
      const say = (m, c) => { if (from) netSendTo(from.pid, { t: 'chat', m, c }); else chatSys(m, c); };
      const err = m => say(m, '#ff5555');
      const cheats = from ? W.cheats : W.cheats || NET.role === 'guest' && W.cheats;
      if (!CMDS.includes(cmd)) { err('Unknown or incomplete command, see below for error'); err('/' + str + '<--[HERE]'); return; }
      if (cmd === 'help') { say('Commands: /' + CMDS.join(', /')); return; }
      if (cmd === 'seed') { say('Seed: [' + W.seed + ']', '#55ff55'); return; }
      if (cmd === 'list') { const L = [P.name].concat(ENTS.filter(e => e.kind === 'player').map(e => e.name)); say('There are ' + L.length + ' of a max of 8 players online: ' + L.join(', ')); return; }
      if (cmd === 'me' || cmd === 'msg') { const m = '* ' + P.name + ' ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (!cheats) { err('You do not have permission to use this command (cheats are off)'); return; }
      if (NET.role === 'guest' && WORLD_CMDS.has(cmd)) { netSend({ t: 'cmd', s: str }); return; }
      if (from && !WORLD_CMDS.has(cmd)) { err('Run that command on your own client'); return; }
      if (cmd === 'say') { const m = '[' + (from ? from.name : P.name) + '] ' + a.slice(1).join(' '); chatSys(m); netSend({ t: 'chat', m }); return; }
      if (cmd === 'gamemode') {
        const m = { survival: 'survival', s: 'survival', '0': 'survival', creative: 'creative', c: 'creative', '1': 'creative', adventure: 'adventure', a: 'adventure', '2': 'adventure', spectator: 'spectator', sp: 'spectator', '3': 'spectator' }[(a[1] || '').toLowerCase()];
        if (!m) { err('Unknown game mode: ' + (a[1] || '')); return; }
        setMode(m); say('Set own game mode to ' + GMN[m] + ' Mode'); return;
      }
      if (cmd === 'time') {
        const DAYV = { day: 1000, noon: 6000, night: 13000, midnight: 18000, sunrise: 23000, sunset: 12000 };
        if (a[1] === 'query') { say('The time is ' + Math.floor(a[2] === 'day' ? W.time / 24000 : W.time % 24000)); return; }
        const v = DAYV[a[2]] ?? parseInt(a[2]);
        if (!isFinite(v)) { err('Invalid time'); return; }
        if (a[1] === 'set') W.time = Math.floor(W.time / 24000) * 24000 + v; else if (a[1] === 'add') W.time += v; else { err('Usage: /time <set|add|query> <value>'); return; }
        say('Set the time to ' + Math.floor(W.time % 24000)); return;
      }
      if (cmd === 'weather') {
        const k = a[1];
        if (k === 'clear') { W.raining = false; W.thunder = false; } else if (k === 'rain') { W.raining = true; W.thunder = false; } else if (k === 'thunder') { W.raining = true; W.thunder = true; } else { err('Usage: /weather <clear|rain|thunder>'); return; }
        W.weatherT = (+a[2] || 300 + ri(600)) * 20;
        say('Set the weather to ' + (k === 'clear' ? 'clear' : k === 'rain' ? 'rain' : 'rain & thunder')); return;
      }
      if (cmd === 'difficulty') { const i = ['peaceful', 'easy', 'normal', 'hard'].indexOf((a[1] || '').toLowerCase()); if (i < 0) { say('The difficulty is ' + DIFFN[W.diff]); return; } if (W.hardcore) { err('Cannot change difficulty in Hardcore'); return; } W.diff = i; if (i === 0) for (const e of ENTS.slice()) if (e.kind === 'mob' && MT[e.type].hostile) delEnt(e); say('The difficulty has been set to ' + DIFFN[i]); return; }
      if (cmd === 'gamerule') {
        const k = a[1]; if (!k) { err('Usage: /gamerule <rule> [value]'); return; }
        if (a[2] === undefined) { say('Gamerule ' + k + ' is currently set to: ' + W.rules[k]); return; }
        W.rules[k] = a[2] === 'true' ? true : a[2] === 'false' ? false : isFinite(+a[2]) ? +a[2] : a[2];
        say('Gamerule ' + k + ' is now set to: ' + W.rules[k]); return;
      }
      if (cmd === 'give') {
        let tgt = a[1], nm = a[2], n = parseInt(a[3]) || 1;
        if (!nm) { nm = tgt; tgt = '@s'; }
        const it = IN[(nm || '').replace(/^minecraft:/, '')];
        if (!it || !it.tab) { err('Unknown item: ' + nm); return; }
        n = clamp(n, 1, 6400);
        const self = tgt === '@s' || tgt === '@p' || tgt === P.name || tgt === '@a';
        if (self) { let left = n; while (left > 0) { const k = Math.min(left, it.stack); giveOrDrop({ id: it.idx, n: k, d: 0 }); left -= k; } snd('pop'); }
        const others = ENTS.filter(e => e.kind === 'player' && (tgt === '@a' || e.name === tgt));
        for (const o of others) netSendTo(o.pid, { t: 'give', s: { id: it.idx, n, d: 0 } });
        if (!self && !others.length) { err('No player was found'); return; }
        say('Gave ' + n + ' [' + it.name + '] to ' + (tgt === '@a' ? 'all players' : self ? P.name : tgt)); return;
      }
      if (cmd === 'tp' || cmd === 'teleport') {
        if (a.length > 2 && (a[1] === '@s' || a[1] === '@p' || a[1] === P.name)) a.splice(1, 1);
        if (a.length >= 4) { const x = coord(a[1], P.x), y = coord(a[2], P.y - CFG.YOFF) + CFG.YOFF, z = coord(a[3], P.z); if (![x, y, z].every(isFinite)) { err('Invalid position'); return; } P.x = x; P.y = y; P.z = z; P.vx = P.vy = P.vz = 0; P.fall = 0; P.px = x; P.py = y; P.pz = z; if (a[4] !== undefined && isFinite(+a[4])) P.yaw = Math.PI - (+a[4]) * Math.PI / 180; if (a[5] !== undefined && isFinite(+a[5])) P.pitch = clamp(-(+a[5]) * Math.PI / 180, -1.5707, 1.5707); say('Teleported ' + P.name + ' to ' + x.toFixed(1) + ', ' + (y - CFG.YOFF).toFixed(1) + ', ' + z.toFixed(1)); return; }
        const o = ENTS.find(e => e.kind === 'player' && e.name === a[1]);
        if (o) { P.x = o.x; P.y = o.y; P.z = o.z; say('Teleported ' + P.name + ' to ' + o.name); return; }
        err('Usage: /tp <x> <y> <z> or /tp <player>'); return;
      }
      if (cmd === 'kill') { if (!a[1] || a[1] === '@s' || a[1] === P.name) { hurtPlayer(1000, null, null, 'void'); say('Killed ' + P.name); return; } if (a[1] === '@e') { let n = 0; for (const e of ENTS.slice()) if (e.kind === 'mob') { killMob(e); n++; } say('Killed ' + n + ' entities'); return; } err('No entity was found'); return; }
      if (cmd === 'heal') { P.hp = 20; P.food = 20; P.sat = 5; say('Healed'); return; }
      if (cmd === 'clear') { let n = 0; const id = a[1] && IN[a[1].replace(/^minecraft:/, '')]; for (let i = 0; i < 36; i++) if (inv[i] && (!id || inv[i].id === id.idx)) { n += inv[i].n; inv[i] = null; } if (!id) { for (let i = 0; i < 4; i++) if (armor[i]) { n++; armor[i] = null; } if (offhand) { n++; offhand = null; } } say('Removed ' + n + ' item(s) from player ' + P.name); return; }
      if (cmd === 'xp' || cmd === 'experience') { const sub = a[1] === 'add' || a[1] === 'set' ? a[1] : 'add', v = parseInt(sub === a[1] ? a[2] : a[1]) || 0, lv = /levels?$/.test(a[a.length - 1]); if (sub === 'set') { if (lv) { P.lvl = Math.max(0, v); P.xp = 0; } else { P.xp = 0; addXp(v); } } else if (lv) P.lvl = Math.max(0, P.lvl + v); else addXp(v); say((lv ? 'Gave ' + v + ' experience levels' : 'Gave ' + v + ' experience points') + ' to ' + P.name); return; }
      if (cmd === 'effect') {
        if (a[1] === 'clear') { P.effects = {}; say('Removed every effect from ' + P.name); return; }
        const nm = (a[3] || a[2] || '').replace(/^minecraft:/, ''), map = { regeneration: 'regen', poison: 'poison', hunger: 'hunger', fire_resistance: 'fireRes', water_breathing: 'waterBreathing' }, k = map[nm];
        if (!k) { err('Unknown effect: ' + nm); return; }
        P.effects[k] = (parseInt(a[4] || a[3]) || 30) * 20; say('Applied effect ' + title(nm) + ' to ' + P.name); return;
      }
      if (cmd === 'spawnpoint') { P.spawn = [P.x, P.y, P.z]; say('Set spawn point to ' + Math.floor(P.x) + ', ' + Math.floor(P.y - CFG.YOFF) + ', ' + Math.floor(P.z)); return; }
      const src = from || P;
      if (cmd === 'setworldspawn') { W.spawn = [Math.floor(src.x) + .5, Math.floor(src.y), Math.floor(src.z) + .5]; say('Set the world spawn point to ' + Math.floor(src.x) + ', ' + Math.floor(src.y - CFG.YOFF) + ', ' + Math.floor(src.z)); return; }
      if (cmd === 'summon') {
        const ty = (a[1] || '').replace(/^minecraft:/, ''), x = coord(a[2], src.x), y = a[3] !== undefined ? coord(a[3], src.y - CFG.YOFF) + CFG.YOFF : src.y, z = coord(a[4], src.z);
        if (ty === 'tnt') { spawnTNT(Math.floor(x), Math.floor(y), Math.floor(z), 80); say('Summoned new Primed TNT'); return; }
        if (!MT[ty]) { err('Unknown entity: ' + ty); return; }
        spawnMob(ty, x, y, z, { persist: true }); say('Summoned new ' + title(ty)); return;
      }
      if (cmd === 'setblock' || cmd === 'fill') {
        const n = cmd === 'fill' ? 7 : 4, nm = (a[n] || '').replace(/^minecraft:/, ''), t = TN[nm];
        if (!t) { err('Unknown block type: ' + nm); return; }
        const p1 = [coord(a[1], src.x), coord(a[2], src.y - CFG.YOFF) + CFG.YOFF, coord(a[3], src.z)].map(Math.floor);
        const p2 = cmd === 'fill' ? [coord(a[4], src.x), coord(a[5], src.y - CFG.YOFF) + CFG.YOFF, coord(a[6], src.z)].map(Math.floor) : p1;
        let c = 0;
        const vol = (Math.abs(p2[0] - p1[0]) + 1) * (Math.abs(p2[1] - p1[1]) + 1) * (Math.abs(p2[2] - p1[2]) + 1);
        if (vol > 32768) { err('Too many blocks in the specified area (maximum 32768, specified ' + vol + ')'); return; }
        for (let x = Math.min(p1[0], p2[0]); x <= Math.max(p1[0], p2[0]); x++) for (let y = Math.min(p1[1], p2[1]); y <= Math.max(p1[1], p2[1]); y++) for (let z = Math.min(p1[2], p2[2]); z <= Math.max(p1[2], p2[2]); z++) if (setBlock(x, y, z, t.base)) c++;
        say(cmd === 'fill' ? 'Successfully filled ' + c + ' block(s)' : 'Changed the block at ' + p1[0] + ', ' + (p1[1] - CFG.YOFF) + ', ' + p1[2]); return;
      }
      if (cmd === 'locate') { say('Structures are not generated in this version', '#aaaaaa'); return; }
    }
    function setMode(m) {
      W.mode = m;
      if (m === 'creative' || m === 'spectator') { P.fire = 0; } else P.fly = false;
      if (m === 'spectator') P.fly = true;
      if (gui === 'inv' || gui === 'creative') { closeGui(true); openGui('inv'); }
    }
