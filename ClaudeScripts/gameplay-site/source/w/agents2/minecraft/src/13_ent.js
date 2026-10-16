    const MT = {
      pig: { hp: 10, w: .9, h: .9, sp: .25, xp: [1, 3], snd: 'pig', breed: ['carrot', 'potato', 'beetroot'], model: 'pig', eye: .7 },
      cow: { hp: 10, w: .9, h: 1.4, sp: .2, xp: [1, 3], snd: 'cow', breed: ['wheat'], model: 'cow', eye: 1.2 },
      sheep: { hp: 8, w: .9, h: 1.3, sp: .23, xp: [1, 3], snd: 'sheep', breed: ['wheat'], model: 'sheep', eye: 1.1 },
      chicken: { hp: 4, w: .4, h: .7, sp: .25, xp: [1, 3], snd: 'chicken', breed: ['wheat_seeds', 'melon_seeds', 'pumpkin_seeds', 'beetroot_seeds', 'torchflower_seeds', 'pitcher_pod'], model: 'chicken', eye: .6 },
      zombie: { hp: 20, w: .6, h: 1.95, sp: .23, xp: [5, 5], snd: 'zombie', hostile: 1, dmg: 3, burn: 1, model: 'zombie', eye: 1.74, undead: 1 },
      skeleton: { hp: 20, w: .6, h: 1.99, sp: .25, xp: [5, 5], snd: 'skeleton', hostile: 1, burn: 1, model: 'skeleton', ranged: 1, eye: 1.74, undead: 1 },
      creeper: { hp: 20, w: .6, h: 1.7, sp: .25, xp: [5, 5], snd: 'creeper', hostile: 1, model: 'creeper', eye: 1.45 },
      spider: { hp: 16, w: 1.4, h: .9, sp: .3, xp: [5, 5], snd: 'spider', hostile: 1, dmg: 2, model: 'spider', climb: 1, eye: .65 },
      enderman: { hp: 40, w: .6, h: 2.9, sp: .3, xp: [5, 5], snd: 'enderman', hostile: 1, neutral: 1, dmg: 7, model: 'enderman', eye: 2.55 },
      slime: { hp: 16, w: 2.04, h: 2.04, sp: .3, xp: [4, 4], snd: 'slime', hostile: 1, dmg: 4, model: 'slime', eye: 1.3 }
    };
    const ENTS = [];
    let EID = 1;
    const entById = new Map();
    function addEnt(e) { e.id = e.id || EID++; ENTS.push(e); entById.set(e.id, e); if (e.root) scene.add(e.root); return e; }
    function delEnt(e) { e.dead = 2; const i = ENTS.indexOf(e); if (i >= 0) ENTS.splice(i, 1); entById.delete(e.id); if (e.root) { scene.remove(e.root); e.root.traverse(o => { if (o.material && o.material !== e.sharedMat) o.material.dispose && o.material.dispose(); }); } if (e.tag) { e.tag.material.map.dispose(); e.tag.material.dispose(); } }
    const shC = cv(32, 32), shg = shC.getContext('2d'), shGr = shg.createRadialGradient(16, 16, 2, 16, 16, 16);
    shGr.addColorStop(0, 'rgba(0,0,0,.5)'); shGr.addColorStop(.6, 'rgba(0,0,0,.3)'); shGr.addColorStop(1, 'rgba(0,0,0,0)'); shg.fillStyle = shGr; shg.fillRect(0, 0, 32, 32);
    const shGeo = keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), shMat = keep(new THREE.MeshBasicMaterial({ map: tex(shC), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }));
    function nameTag(name) {
      const c = cv(256, 40), x = c.getContext('2d');
      x.font = 'bold 26px monospace';
      const w = Math.min(250, x.measureText(name).width + 16);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect((256 - w) / 2, 4, w, 32);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, 128, 21);
      const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
      s.scale.set(1.6, .25, 1); s.renderOrder = 5;
      return s;
    }
    const WOOLW = { white: .818, black: .05, gray: .05, light_gray: .05, brown: .03, pink: .002 };
    function sheepColor() { let r = RNG(); for (const k in WOOLW) { if ((r -= WOOLW[k]) <= 0) return k; } return 'white'; }
    function spawnMob(type, x, y, z, o) {
      const T = MT[type]; if (!T) return null;
      o = o || {};
      const mat = new THREE.MeshBasicMaterial({ map: skinTex(T.model), vertexColors: true, alphaTest: .1, toneMapped: false });
      const md = instModel(T.model, mat);
      const root = new THREE.Group(); root.add(md.root);
      const sc = o.baby ? .5 : 1;
      md.root.scale.setScalar(type === 'slime' ? (o.size || 2) * .5 * 1.02 : sc);
      const shd2 = new THREE.Mesh(shGeo, shMat); shd2.scale.set(T.w * 1.6, 1, T.w * 1.6); shd2.position.y = .03; shd2.renderOrder = 3; root.add(shd2);
      const e = { kind: 'mob', type, x, y, z, px: x, py: y, pz: z, vx: 0, vy: 0, vz: 0, w: T.w * (type === 'slime' ? (o.size || 2) / 2 : sc), h: T.h * (type === 'slime' ? (o.size || 2) / 2 : sc), yaw: o.yaw ?? RNG() * 6.28, pyaw: 0, hyaw: 0, phyaw: 0, pitch: 0, onGround: false, hp: o.hp ?? T.hp * (type === 'slime' ? Math.pow(o.size || 2, 2) / 4 : 1), maxHp: T.hp, hurtT: 0, fire: 0, cd: 20, age: 0, wT: 0, wYaw: 0, walking: false, panic: 0, limb: 0, limbA: 0, limbP: 0, limbAP: 0, swing: 0, hit: true, root, md, mat, shd: shd2, baby: !!o.baby, babyT: o.baby ? 24000 : 0, love: 0, breedCd: 0, fuse: -1, color: o.color || (type === 'sheep' ? sheepColor() : null), sheared: !!o.sheared, eggT: 6000 + ri(6000), air: 300, target: null, path: null, pathT: 0, angry: 0, persist: !!o.persist, size: o.size || 2, jumpT: 0, see: false };
      e.pyaw = e.yaw; e.hyaw = e.yaw;
      if (type === 'sheep') { const wm = new THREE.MeshBasicMaterial({ map: skinTex('sheep_wool'), vertexColors: true, alphaTest: .1, toneMapped: false }); const wd = instModel('sheep_wool', wm); md.root.add(wd.root); e.wool = wd; e.woolMat = wm; wd.root.visible = !e.sheared; }
      if (type === 'slime') { md.parts.outer.children[0].material = new THREE.MeshBasicMaterial({ map: skinTex('slime'), vertexColors: true, transparent: true, opacity: .6, depthWrite: false, toneMapped: false }); }
      if (type === 'skeleton') { const bow = itemMesh(IN.bow.idx, .7); bow.position.set(.05, -.6, .1); bow.rotation.set(0, Math.PI / 2, -.4); md.parts.larm.add(bow); }
      return addEnt(e);
    }
    function remotePlayer(pid, name) {
      const sk = playerSkinTex(name || pid);
      const mat = new THREE.MeshBasicMaterial({ map: sk.t || sk, vertexColors: true, alphaTest: .1, toneMapped: false });
      const md = instModel(sk.alex ? 'alex' : 'steve', mat);
      const root = new THREE.Group(); root.add(md.root);
      const shd2 = new THREE.Mesh(shGeo, shMat); shd2.scale.set(1, 1, 1); shd2.position.y = .03; root.add(shd2);
      const tag = nameTag(name || 'Player'); tag.position.y = 2.15; root.add(tag);
      const e = { kind: 'player', id: 'p:' + pid, pid, name, x: 0, y: -999, z: 0, px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, vx: 0, vy: 0, vz: 0, w: .6, h: 1.8, yaw: 0, pyaw: 0, hyaw: 0, phyaw: 0, pitch: 0, limb: 0, limbA: 0, limbP: 0, limbAP: 0, swing: 0, hit: true, root, md, mat, tag, held: -1, heldMesh: null, sneak: false, hp: 20, hurtT: 0, age: 0 };
      return addEnt(e);
    }
    function spawnItem(st, x, y, z, vx, vy, vz, delay) {
      if (!st || st.n <= 0) return null;
      if (NET.role === 'guest' && !st._host) { netSend({ t: 'drop', s: encS(st), x, y, z, vx, vy, vz, d: delay }); return null; }
      const items = ENTS.filter(e => e.kind === 'item'); if (items.length > 400) delEnt(items[0]);
      const m = itemMesh(st.id, .25);
      const root = new THREE.Group(); root.add(m);
      const e = { kind: 'item', st: { id: st.id, n: st.n, d: st.d || 0, x: st.x }, x, y, z, px: x, py: y, pz: z, vx: vx ?? (RNG() - .5) * .2, vy: vy ?? .2, vz: vz ?? (RNG() - .5) * .2, w: .25, h: .25, onGround: false, age: ri(100), life: 0, delay: delay ?? 10, root, mesh: m, hit: false, flat: isFlat(st.id) };
      return addEnt(e);
    }
    function spawnXp(n, x, y, z) {
      if (NET.role === 'guest') return;
      while (n > 0) { const v = n >= 17 ? 17 : n >= 7 ? 7 : n >= 3 ? 3 : 1; n -= v; addEnt({ kind: 'xp', v, x, y, z, px: x, py: y, pz: z, vx: (RNG() - .5) * .3, vy: .2 + RNG() * .2, vz: (RNG() - .5) * .3, w: .5, h: .5, age: 0, life: 0, root: xpMesh(v), hit: false }); }
    }
    const xpTex = (() => { const c = cv(16, 16), x = c.getContext('2d'); x.fillStyle = '#c8f040'; x.fillRect(5, 5, 6, 6); x.fillStyle = '#f8ff90'; x.fillRect(6, 6, 3, 3); x.fillStyle = '#6a9a10'; x.fillRect(5, 10, 6, 1); x.fillRect(10, 5, 1, 6); return tex(c); })();
    function xpMesh(v) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: xpTex, transparent: true, depthWrite: false })); const k = v >= 17 ? .5 : v >= 7 ? .4 : v >= 3 ? .32 : .25; s.scale.set(k, k, 1); const g2 = new THREE.Group(); g2.add(s); return g2; }
    function spawnFalling(s, x, y, z) {
      const m = new THREE.Mesh(blockGeom(s, 1), blockMatE.clone());
      const root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'fall', s, x: x + .5, y, z: z + .5, px: x + .5, py: y, pz: z + .5, vx: 0, vy: 0, vz: 0, w: .98, h: .98, age: 0, root, mesh: m, hit: false, fallD: 0 });
    }
    const arrowGeo = (() => {
      const pos = [], cols = [], ix = [];
      const add = (w, h, d, bx2, by, bz, c) => { const gq = new THREE.BoxGeometry(w, h, d), a = gq.attributes.position, n = pos.length / 3, ii = gq.index.array; gq.translate(bx2, by, bz); for (let i = 0; i < a.count; i++) { pos.push(a.getX(i), a.getY(i), a.getZ(i)); cols.push(c[0] / 255, c[1] / 255, c[2] / 255); } for (let i = 0; i < ii.length; i++) ix.push(ii[i] + n); gq.dispose(); };
      add(.035, .035, .5, 0, 0, -.02, [150, 116, 66]); add(.07, .07, .06, 0, 0, .25, [168, 168, 172]); add(.12, .012, .1, 0, 0, -.2, [238, 238, 232]); add(.012, .12, .1, 0, 0, -.2, [206, 206, 200]);
      const gq = new THREE.BufferGeometry(); gq.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gq.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gq.setIndex(ix); return keep(gq);
    })(), arrowMat = keep(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    function spawnArrow(x, y, z, vx, vy, vz, owner, dmg, pick) {
      const m = new THREE.Mesh(arrowGeo, arrowMat), root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'arrow', x, y, z, px: x, py: y, pz: z, vx, vy, vz, w: .5, h: .5, age: 0, stuck: 0, owner, dmg: dmg || 2, pick: !!pick, root, mesh: m, hit: false });
    }
    function spawnThrown(type, x, y, z, vx, vy, vz, owner) {
      const it = IN[type === 'xp_bottle' ? 'experience_bottle' : type === 'splash' ? 'splash_potion' : type];
      const m = itemMesh((it || IN.snowball).idx, .25), root = new THREE.Group(); root.add(m);
      return addEnt({ kind: 'thrown', type, x, y, z, px: x, py: y, pz: z, vx, vy, vz, w: .25, h: .25, age: 0, owner, root, mesh: m, hit: false });
    }
    function spawnTNT(x, y, z, fuse) {
      const m = new THREE.Mesh(blockGeom(TN.tnt.base, 1), blockMatE.clone()), root = new THREE.Group(); root.add(m);
      snd('fuse', { x, y, z });
      return addEnt({ kind: 'tnt', x: x + .5, y, z: z + .5, px: x + .5, py: y, pz: z + .5, vx: (RNG() - .5) * .04, vy: .2, vz: (RNG() - .5) * .04, w: .98, h: .98, fuse: fuse ?? 80, root, mesh: m, hit: false, age: 0 });
    }
    function physE(e, grav, drag) {
      e.px = e.x; e.py = e.y; e.pz = e.z;
      e.vy -= grav;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 * (TT[STT[getS(Math.floor(e.x), Math.floor(e.y - .1), Math.floor(e.z))]].slip ? 1.6 : 1) : drag;
      e.vx *= Math.min(.98, fr); e.vz *= Math.min(.98, fr); e.vy *= .98;
    }
    function tickItem(e) {
      e.age++; e.life++;
      if (e.delay > 0) e.delay--;
      const inW = FLU[getS(Math.floor(e.x), Math.floor(e.y + .1), Math.floor(e.z))] === 1, inL = FLU[getS(Math.floor(e.x), Math.floor(e.y + .1), Math.floor(e.z))] === 2;
      if (inL && IT[e.st.id].id.indexOf('netherite') < 0) { burstAt(e.x, e.y, e.z, [255, 120, 30], 4); snd('fizz', e); delEnt(e); return; }
      if (!boxFree(e, 0, 0, 0)) { e.y += .1; e.vy = .1; }
      e.px = e.x; e.py = e.y; e.pz = e.z;
      if (inW) { e.vy += .01; e.vy *= .8; } else e.vy -= .04;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 : inW ? .85 : .98;
      e.vx *= fr; e.vz *= fr; e.vy *= .98;
      if (e.life > 6000 || e.y < -64) { delEnt(e); return; }
      if (e.life % 20 === 0) for (const o of ENTS) if (o !== e && o.kind === 'item' && o.st.id === e.st.id && !IT[o.st.id].dur && Math.abs(o.x - e.x) < .5 && Math.abs(o.y - e.y) < .5 && Math.abs(o.z - e.z) < .5 && o.st.n + e.st.n <= IT[e.st.id].stack) { e.st.n += o.st.n; delEnt(o); break; }
      if (e.delay <= 0) {
        for (const pl of playersList()) {
          if (pl.dead || pl.spec) continue;
          if (Math.abs(e.x - pl.x) < 1.3 && e.y > pl.y - .7 && e.y < pl.y + 2.4 && Math.abs(e.z - pl.z) < 1.3) {
            if (pl === P) { const left = giveItem(e.st, true); if (left < e.st.n) { snd('pop'); pickupAnim(e); } if (left <= 0) { delEnt(e); return; } e.st.n = left; }
            else { netSendTo(pl.pid, { t: 'give', s: encS(e.st) }); snd('pop', e); delEnt(e); return; }
          }
        }
      }
    }
    function pickupAnim(e) { void e; }
    function tickXp(e) {
      e.age++; e.life++;
      e.px = e.x; e.py = e.y; e.pz = e.z;
      let tgt = null, bd = 64;
      for (const pl of playersList()) { if (pl.dead || pl.spec) continue; const d = (pl.x - e.x) ** 2 + (pl.y + .9 - e.y) ** 2 + (pl.z - e.z) ** 2; if (d < bd) { bd = d; tgt = pl; } }
      if (tgt) { const d = Math.sqrt(bd), f = (1 - d / 8) ** 2 * .1; e.vx += (tgt.x - e.x) / d * f; e.vy += (tgt.y + .9 - e.y) / d * f; e.vz += (tgt.z - e.z) / d * f; if (d < 1 && e.age > 10) { if (tgt === P) addXp(e.v); else netSendTo(tgt.pid, { t: 'xp', v: e.v }); snd('orb'); delEnt(e); return; } }
      e.vy -= .03;
      moveE(e, e.vx, e.vy, e.vz, false, 0);
      const fr = e.onGround ? .588 : .98; e.vx *= fr; e.vz *= fr; e.vy *= .98;
      if (e.life > 6000) delEnt(e);
    }
    function tickFall(e) {
      e.age++;
      e.px = e.x; e.py = e.y; e.pz = e.z;
      e.vy = (e.vy - .04) * .98;
      const y0 = e.y;
      moveE(e, 0, e.vy, 0, false, 0);
      e.fallD += y0 - e.y;
      const t = TT[STT[e.s]];
      if (t.anvil !== undefined) for (const o of ENTS.concat([P])) if (o.hit && Math.abs(o.x - e.x) < .8 && Math.abs(o.z - e.z) < .8 && o.y < e.y + .5 && o.y + o.h > e.y && e.vy < -.1) { hurtEnt(o, Math.min(40, Math.ceil(e.fallD - 1) * 2), null, 'anvil'); }
      if (t.powder2 && blockIn(e, b => FLU[b] === 1)) { const bx = Math.floor(e.x), by = Math.floor(e.y + .5), bz = Math.floor(e.z); setBlock(bx, by, bz, TN[t.powder2].base); delEnt(e); return; }
      if (e.onGround || e.age > 600) {
        const bx = Math.floor(e.x), by = Math.floor(e.y + .5), bz = Math.floor(e.z), cur = getS(bx, by, bz);
        if ((REP[cur] || SHP[cur] === 0) && !FLU[cur] || FLU[cur]) { setBlock(bx, by, bz, e.s); playBlockSnd(e.s, 'place', bx, by, bz); if (t.anvil !== undefined) snd('anvil_land', e); }
        else spawnItem({ id: blockItemOf(e.s), n: 1 }, e.x, e.y + .5, e.z);
        delEnt(e);
      }
    }
    function blockItemOf(s) { const t = TT[STT[s]]; const n = typeof t.item === 'string' ? t.item : t.id; return IN[n] ? IN[n].idx : IN.stone.idx; }
    function tickArrow(e) {
      e.age++; e.px = e.x; e.py = e.y; e.pz = e.z;
      if (e.stuck) { if (e.pick && e.age > 10 && Math.abs(P.x - e.x) < 1.2 && Math.abs(P.y + .9 - e.y) < 1.5 && Math.abs(P.z - e.z) < 1.2 && !P.dead) { if (giveItem({ id: IN.arrow.idx, n: 1 }, true) === 0) { snd('pop'); delEnt(e); return; } } if (++e.stuck > 1200) delEnt(e); if (!solidAt(Math.floor(e.x), Math.floor(e.y), Math.floor(e.z))) { e.stuck = 0; } return; }
      if (e.age > 1200 || e.y < -64) { delEnt(e); return; }
      const sp = Math.hypot(e.vx, e.vy, e.vz), n = Math.max(1, Math.ceil(sp * 3));
      for (let s = 0; s < n; s++) {
        const nx = e.x + e.vx / n, ny = e.y + e.vy / n, nz2 = e.z + e.vz / n;
        for (const o of ENTS.concat(NET.role === 'guest' ? [] : [P])) {
          if (!o.hit || o === e.owner || o.dead || (o === P && P.spec)) continue;
          if (e.age < 3 && o === e.owner) continue;
          const hw = o.w / 2 + .15;
          if (nx > o.x - hw && nx < o.x + hw && nz2 > o.z - hw && nz2 < o.z + hw && ny > o.y && ny < o.y + o.h) {
            const dmg = Math.ceil(sp * e.dmg);
            hurtEnt(o, dmg, e.owner || e, 'arrow', e.vx, e.vz);
            snd('arrow_hit', e); delEnt(e); return;
          }
        }
        const b = getS(Math.floor(nx), Math.floor(ny), Math.floor(nz2));
        if (SOL[b]) {
          const L = blockBoxes(b, Math.floor(nx), Math.floor(ny), Math.floor(nz2)) || [];
          const lx = nx - Math.floor(nx), ly = ny - Math.floor(ny), lz = nz2 - Math.floor(nz2);
          if (L.some(c => lx > c[0] && lx < c[3] && ly > c[1] && ly < c[4] && lz > c[2] && lz < c[5])) { e.stuck = 1; snd('arrow_land', e); e.x = nx; e.y = ny; e.z = nz2; if (TT[STT[b]].tnt === undefined) { } if (TT[STT[b]].id === 'target') { } return; }
        }
        e.x = nx; e.y = ny; e.z = nz2;
      }
      const w = FLU[getS(Math.floor(e.x), Math.floor(e.y), Math.floor(e.z))] === 1 ? .6 : .99;
      e.vx *= w; e.vy = e.vy * w - .05; e.vz *= w;
    }
    function tickThrown(e) {
      e.age++; e.px = e.x; e.py = e.y; e.pz = e.z;
      const n = 3;
      for (let s = 0; s < n; s++) {
        const nx = e.x + e.vx / n, ny = e.y + e.vy / n, nz2 = e.z + e.vz / n;
        let hitE = null;
        for (const o of ENTS.concat([P])) { if (!o.hit || o === e.owner || o.dead || (o === P && (NET.role === 'guest' || P.spec))) continue; const hw = o.w / 2 + .1; if (nx > o.x - hw && nx < o.x + hw && nz2 > o.z - hw && nz2 < o.z + hw && ny > o.y && ny < o.y + o.h) { hitE = o; break; } }
        const bs = getS(Math.floor(nx), Math.floor(ny), Math.floor(nz2));
        if (hitE || SOL[bs] === 1 || (SOL[bs] && !boxFree({ x: nx, y: ny - .1, z: nz2, w: .2, h: .2 }, 0, 0, 0))) {
          if (e.type === 'snowball') { if (hitE) hurtEnt(hitE, hitE.type === 'blaze' ? 3 : 0, e.owner, 'snowball', e.vx, e.vz); for (let i = 0; i < 8; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [240, 248, 255], .4, .06, 10); }
          else if (e.type === 'egg') { if (hitE) hurtEnt(hitE, 0, e.owner, 'egg', e.vx, e.vz); for (let i = 0; i < 8; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [240, 230, 200], .4, .05, 10); if (RNG() < 1 / 8 && NET.role !== 'guest') { const k = RNG() < 1 / 32 ? 4 : 1; for (let i = 0; i < k; i++) spawnMob('chicken', nx, ny, nz2, { baby: true }); } }
          else if (e.type === 'ender_pearl') { if (e.owner === P) { P.x = nx; P.y = ny; P.z = nz2; P.vx = P.vy = P.vz = 0; P.fall = 0; if (mode() !== 'creative') hurtPlayer(5, null, null, 'fall'); } for (let i = 0; i < 20; i++) particle(nx, ny, nz2, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [180, 60, 220], .6, .06, -1, 1); snd('teleport', e); }
          else if (e.type === 'xp_bottle') { spawnXp(3 + ri(9), nx, ny, nz2); for (let i = 0; i < 12; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [90, 140, 255], .6, .06, 4, 1); snd('glass_break', e); }
          else if (e.type === 'splash') { for (let i = 0; i < 16; i++) particle(nx, ny, nz2, (RNG() - .5) * 3, RNG() * 2, (RNG() - .5) * 3, [56, 92, 220], .6, .06, 6); snd('glass_break', e); for (const o of ENTS.concat([P])) if (Math.hypot(o.x - nx, o.y - ny, o.z - nz2) < 4) { o.fire = 0; if (o.type === 'enderman') hurtEnt(o, 1, e.owner, 'water'); } for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (TT[STT[getS(Math.floor(nx) + dx, Math.floor(ny) + dy, Math.floor(nz2) + dz)]].fire) setBlock(Math.floor(nx) + dx, Math.floor(ny) + dy, Math.floor(nz2) + dz, 0); }
          else if (e.type === 'wind_charge') { explode(nx, ny, nz2, 1.2, e.owner, true); }
          delEnt(e); return;
        }
        e.x = nx; e.y = ny; e.z = nz2;
      }
      e.vx *= .99; e.vy = e.vy * .99 - .03; e.vz *= .99;
      if (e.age > 600) delEnt(e);
    }
    function tickTNT(e) {
      physE(e, .04, .98);
      if (e.fuse % 5 === 0) particle(e.x, e.y + 1, e.z, 0, .5, 0, [90, 90, 90], .6, .08, -.5);
      if (--e.fuse <= 0) { delEnt(e); explode(e.x, e.y + .49, e.z, 4, null); }
    }
    function explode(x, y, z, power, src, noBlocks) {
      snd('explode', { x, y, z });
      const big = power > 2;
      for (let i = 0; i < (big ? 24 : 8); i++) particle(x + (RNG() - .5) * power, y + (RNG() - .5) * power, z + (RNG() - .5) * power, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [230, 230, 230], .8 + RNG() * .6, .3 + RNG() * .5, -.5, 1);
      if (NET.role === 'guest') return;
      const destroyed = new Set();
      const grief = !noBlocks && W.rules.mobGriefing !== false && !(src && src.kind === 'mob' && W.rules.mobGriefing === false) && mode() !== 'adventure' || (!noBlocks && !src);
      if (grief && !noBlocks) for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) for (let k = 0; k < 16; k++) {
        if (i !== 0 && i !== 15 && j !== 0 && j !== 15 && k !== 0 && k !== 15) continue;
        let dx = i / 15 * 2 - 1, dy = j / 15 * 2 - 1, dz = k / 15 * 2 - 1;
        const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        let f = power * (.7 + RNG() * .6), px = x, py = y, pz = z;
        while (f > 0) {
          const bx = Math.floor(px), by = Math.floor(py), bz = Math.floor(pz), s = getS(bx, by, bz);
          if (s) { const t = TT[STT[s]]; f -= (Math.min(3600000, FLU[s] ? 100 : t.res) + .3) * .3; if (f > 0 && !FLU[s]) destroyed.add(bx + ',' + by + ',' + bz); }
          px += dx * .3; py += dy * .3; pz += dz * .3; f -= .225;
        }
      }
      for (const k of destroyed) {
        const [bx, by, bz] = k.split(',').map(Number), s = getS(bx, by, bz), t = TT[STT[s]];
        if (t.tnt) { setBlock(bx, by, bz, 0); spawnTNT(bx, by, bz, 10 + ri(20)); continue; }
        if (t.hard < 0) continue;
        if (RNG() < 1 / power) dropBlock(s, bx, by, bz, { explosion: 1 });
        removeBlockEntity(bx, by, bz, true);
        setBlock(bx, by, bz, 0);
      }
      const R = power * 2;
      for (const o of ENTS.concat(playersList().filter(p => p === P))) {
        if (!o.hit || o.dead) continue;
        const d = Math.hypot(o.x - x, o.y + o.h / 2 - y, o.z - z) / R;
        if (d > 1) continue;
        let seen = 0; for (let k = 0; k < 4; k++) { const tx = o.x + (k & 1 ? .2 : -.2), ty = o.y + o.h * (k < 2 ? .25 : .75), tz = o.z; if (losClear(x, y, z, tx, ty, tz)) seen++; }
        const imp = (1 - d) * seen / 4, dmg = Math.floor((imp * imp + imp) / 2 * 7 * power + 1);
        const kx = (o.x - x) / (d * R + .01), kz = (o.z - z) / (d * R + .01);
        if (imp > 0) { hurtEnt(o, noBlocks ? 0 : dmg * difMul(o), src, 'explosion', 0, 0); o.vx += kx * imp * (noBlocks ? 1.5 : 1); o.vy += imp * (noBlocks ? 1.2 : .8); o.vz += kz * imp * (noBlocks ? 1.5 : 1); }
      }
      for (const o of ENTS) if (o.kind === 'item' && Math.hypot(o.x - x, o.y - y, o.z - z) < power && !noBlocks) delEnt(o);
      for (const pl of playersList()) if (pl !== P && Math.hypot(pl.x - x, pl.y - y, pl.z - z) < R) { const d = Math.hypot(pl.x - x, pl.y + .9 - y, pl.z - z) / R, imp = 1 - d; netSendTo(pl.pid, { t: 'hurt', d: noBlocks ? 0 : Math.floor((imp * imp + imp) / 2 * 7 * power + 1), kx: (pl.x - x) * imp * .3, ky: imp * .8, kz: (pl.z - z) * imp * .3, k: 'explosion' }); }
      netSend({ t: 'boom', x, y, z, p: power });
    }
    const difMul = o => o === P || o.kind === 'player' ? [0, .5, 1, 1.5][W.diff] ?? 1 : 1;
    function losClear(x0, y0, z0, x1, y1, z1) {
      const d = Math.hypot(x1 - x0, y1 - y0, z1 - z0), n = Math.ceil(d * 2);
      for (let i = 1; i < n; i++) { const t = i / n; if (OPQ[getS(Math.floor(lerp(x0, x1, t)), Math.floor(lerp(y0, y1, t)), Math.floor(lerp(z0, z1, t)))]) return false; }
      return true;
    }
    const turn = (a, b, s) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + clamp(d, -s, s); };
    function hurtEnt(o, dmg, src, kind, kx, kz) {
      if (o === P) { hurtPlayer(dmg, src ? src.x : null, src ? src.z : null, kind); return; }
      if (o.kind === 'player') { netSendTo(o.pid, { t: 'hurt', d: dmg, sx: src ? src.x : null, sz: src ? src.z : null, k: kind }); return; }
      if (o.kind !== 'mob' || o.dead) return;
      if (NET.role === 'guest') { netSend({ t: 'atk', id: o.id, d: dmg, kx: kx || (src ? o.x - src.x : 0), kz: kz || (src ? o.z - src.z : 0), k: kind }); return; }
      if (o.hurtT > 10 && dmg <= (o.lastDmg || 0)) return;
      const real = o.hurtT > 10 ? dmg - (o.lastDmg || 0) : dmg;
      o.lastDmg = dmg;
      o.hp -= real; o.hurtT = 20;
      if (dmg > 0) for (let i = 0; i < 4; i++) particle(o.x + (RNG() - .5) * o.w, o.y + o.h * (.3 + RNG() * .6), o.z + (RNG() - .5) * o.w, (RNG() - .5) * 2, RNG() * 2 + .5, (RNG() - .5) * 2, [180 + RNG() * 50, 20, 20], .4, .05, 14);
      let dx = kx || 0, dz = kz || 0;
      if (src && !kx) { dx = o.x - src.x; dz = o.z - src.z; }
      const d = Math.hypot(dx, dz);
      if (d > 1e-4 && kind !== 'fire' && kind !== 'drown' && kind !== 'starve') { o.vx = o.vx / 2 + dx / d * .4; o.vz = o.vz / 2 + dz / d * .4; o.vy = Math.min(.4, o.vy / 2 + .4); }
      const T = MT[o.type];
      if (!T.hostile) { o.panic = 60 + ri(40); }
      if (T.neutral && src && (src === P || src.kind === 'player')) { o.angry = 600; o.target = src; }
      if (T.hostile && src && (src === P || src.kind === 'player')) o.target = src;
      if (src === P || (src && src.kind === 'player')) o.byP = src;
      snd(T.snd + '_hurt', o);
      if (o.type === 'enderman' && kind === 'arrow') { teleportMob(o); }
      if (o.hp <= 0) { o.dead = 1; snd(T.snd + '_death', o); }
    }
    function killMob(e) {
      for (let i = 0; i < 14; i++) particle(e.x + (RNG() - .5) * e.w, e.y + RNG() * e.h, e.z + (RNG() - .5) * e.w, (RNG() - .5) * 1.2, RNG() * 1.5, (RNG() - .5) * 1.2, [230, 230, 230], .6 + RNG() * .5, .1 + RNG() * .1, -1, 1);
      const T = MT[e.type], cooked = e.fire > 0, r = n => ri(n + 1), D = [];
      if (!e.baby) {
        if (e.type === 'pig') D.push([cooked ? 'cooked_porkchop' : 'porkchop', 1 + r(2)]);
        else if (e.type === 'cow') D.push([cooked ? 'cooked_beef' : 'beef', 1 + r(2)], ['leather', r(2)]);
        else if (e.type === 'sheep') { D.push([cooked ? 'cooked_mutton' : 'mutton', 1 + r(1)]); if (!e.sheared) D.push([e.color + '_wool', 1]); }
        else if (e.type === 'chicken') D.push([cooked ? 'cooked_chicken' : 'chicken', 1], ['feather', r(2)]);
        else if (e.type === 'zombie') { D.push(['rotten_flesh', r(2)]); if (e.byP && RNG() < .025) D.push([['iron_ingot', 'carrot', 'potato'][ri(3)], 1]); }
        else if (e.type === 'skeleton') D.push(['bone', r(2)], ['arrow', r(2)]);
        else if (e.type === 'creeper') D.push(['gunpowder', r(2)]);
        else if (e.type === 'spider') { D.push(['string', r(2)]); if (e.byP && RNG() < 1 / 3) D.push(['spider_eye', 1]); }
        else if (e.type === 'enderman') D.push(['ender_pearl', r(1)]);
        else if (e.type === 'slime' && e.size === 1) D.push(['slime_ball', r(2)]);
      }
      if (W.rules.doMobLoot !== false) for (const [id, n] of D) if (n > 0 && IN[id]) spawnItem({ id: IN[id].idx, n }, e.x, e.y + .5, e.z);
      if (e.byP && !e.baby && T.xp) spawnXp(e.type === 'slime' ? e.size : rr(T.xp[0], T.xp[1]), e.x, e.y + .5, e.z);
      if (e.type === 'slime' && e.size > 1) for (let i = 0; i < 2 + ri(3); i++) spawnMob('slime', e.x + (RNG() - .5), e.y + .5, e.z + (RNG() - .5), { size: e.size / 2 });
      delEnt(e);
    }
    function teleportMob(e) {
      for (let k = 0; k < 16; k++) {
        const x = Math.floor(e.x + (RNG() - .5) * 32), z = Math.floor(e.z + (RNG() - .5) * 32);
        let y = Math.floor(e.y + 16);
        while (y > e.y - 16 && !SOL[getS(x, y - 1, z)]) y--;
        if (SOL[getS(x, y - 1, z)] && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)] && !SOL[getS(x, y + 2, z)] && !FLU[getS(x, y, z)]) { for (let i = 0; i < 12; i++) particle(e.x, e.y + RNG() * 2.5, e.z, (RNG() - .5) * 2, RNG(), (RNG() - .5) * 2, [180, 60, 220], .6, .06, -1, 1); e.x = x + .5; e.y = y; e.z = z + .5; e.px = e.x; e.py = e.y; e.pz = e.z; snd('teleport', e); return true; }
      }
      return false;
    }
    const walkable = (x, y, z, h) => { const fl = getS(x, y - 1, z); if (!(SOL[fl] || FLU[fl] === 1)) return false; if (TT[STT[fl]].id === 'lava' || TT[STT[fl]].hurt || TT[STT[fl]].magma) return false; for (let k = 0; k < h; k++) { const b = getS(x, y + k, z); if (SOL[b] === 1 || (SOL[b] && !TT[STT[b]].door) || FLU[b] === 2 || TT[STT[b]].fire) return false; } return true; };
    function findPath(e, tx, ty, tz, maxN) {
      const sx = Math.floor(e.x), sy = Math.floor(e.y + .01), sz = Math.floor(e.z), hh = Math.ceil(e.h), K = (x, y, z) => x * 73856093 ^ y * 19349663 ^ z * 83492791;
      const open = [[sx, sy, sz, 0, Math.abs(tx - sx) + Math.abs(ty - sy) + Math.abs(tz - sz), null]], seen = new Map([[K(sx, sy, sz), 0]]);
      let best = open[0], n = 0;
      while (open.length && n++ < (maxN || 260)) {
        let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][3] + open[i][4] < open[bi][3] + open[bi][4]) bi = i;
        const c = open.splice(bi, 1)[0];
        if (c[4] < best[4]) best = c;
        if (c[4] <= 1) { best = c; break; }
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (const dy of [0, 1, -1, -2, -3]) {
          const x = c[0] + dx, y = c[1] + dy, z = c[2] + dz;
          if (dy === 1 && SOL[getS(c[0], c[1] + hh, c[2])]) continue;
          if (!walkable(x, y, z, hh)) continue;
          if (dy < 0) { let ok = true; for (let k = 0; k > dy; k--) if (SOL[getS(x, c[1] + k, z)] === 1) ok = false; if (!ok) continue; }
          const k = K(x, y, z), g2 = c[3] + 1 + (dy > 0 ? .5 : 0) + (FLU[getS(x, y, z)] ? 2 : 0);
          if (seen.has(k) && seen.get(k) <= g2) continue;
          seen.set(k, g2);
          open.push([x, y, z, g2, Math.abs(tx - x) + Math.abs(ty - y) * 1.5 + Math.abs(tz - z), c]);
          break;
        }
      }
      const path = []; let c = best; while (c && c[5]) { path.push([c[0] + .5, c[1], c[2] + .5]); c = c[5]; }
      return path.reverse();
    }
    function nearestPlayer(e, r, needLos) {
      let best = null, bd = r * r;
      for (const pl of playersList()) {
        if (pl.dead || pl.spec || (pl === P && (mode() === 'creative' || mode() === 'spectator'))) continue;
        if (pl.kind === 'player' && pl.creative) continue;
        const d = (pl.x - e.x) ** 2 + (pl.y - e.y) ** 2 + (pl.z - e.z) ** 2;
        if (d < bd && (!needLos || losClear(e.x, e.y + e.h * .85, e.z, pl.x, pl.y + 1.6, pl.z))) { bd = d; best = pl; }
      }
      return best;
    }
    function tickMob(e) {
      e.pyaw = e.yaw; e.phyaw = e.hyaw; e.age++;
      e.limbP = e.limb; e.limbAP = e.limbA;
      const T = MT[e.type];
      e.px = e.x; e.py = e.y; e.pz = e.z;
      if (e.dead) { if (++e.dead >= 20) killMob(e); return; }
      if (e.hurtT > 0) e.hurtT--;
      if (e.cd > 0) e.cd--;
      if (e.swing > 0) e.swing--;
      if (e.breedCd > 0) e.breedCd--;
      if (e.love > 0) e.love--;
      if (e.baby && --e.babyT <= 0) { e.baby = false; e.md.root.scale.setScalar(1); e.w = T.w; e.h = T.h; }
      if (W.diff === 0 && T.hostile && !e.persist) { delEnt(e); return; }
      const inW = fluidIn(e, 1), inL = fluidIn(e, 2);
      let fwd = 0, sp = T.sp, lookP = null, jump = false;
      const daylight = sunB > .5 && !W.raining;
      if (T.hostile && !T.neutral && e.type !== 'spider') { if (!e.target || e.target.dead || (e.age % 20 === 0 && Math.hypot(e.target.x - e.x, e.target.z - e.z) > 40)) e.target = nearestPlayer(e, 35, true); }
      else if (e.type === 'spider') { const br2 = brAt(e.x, e.y + .5, e.z); if (e.age % 20 === 0 && (!e.target || br2 > .55 && !e.angry)) e.target = br2 < .5 || e.angry ? nearestPlayer(e, 16, true) : null; }
      else if (e.type === 'enderman') { if (e.age % 5 === 0 && !e.angry) for (const pl of playersList()) { if (pl === P && mode() !== 'survival' && mode() !== 'adventure') continue; const dx = e.x - pl.x, dy = e.y + 2.55 - (pl.y + 1.62), dz = e.z - pl.z, d = Math.hypot(dx, dy, dz); if (d > 64 || pl !== P) continue; const lx = -Math.sin(P.yaw) * Math.cos(P.pitch), ly = Math.sin(P.pitch), lz = -Math.cos(P.yaw) * Math.cos(P.pitch); if ((lx * dx + ly * dy + lz * dz) / d > 1 - .025 / d * 2 && losClear(pl.x, pl.y + 1.62, pl.z, e.x, e.y + 2.55, e.z)) { e.angry = 400; e.target = pl; snd('enderman_scream', e); } } if (e.angry > 0 && --e.angry === 0) e.target = null; if ((inW || (W.raining && skyOpen(e))) && e.age % 10 === 0) { hurtEnt(e, 1, null, 'water'); teleportMob(e); } }
      const tg = e.target;
      if (tg && T.hostile) {
        const dx = tg.x - e.x, dz = tg.z - e.z, dy = tg.y - e.y, dist = Math.hypot(dx, dz), aim = Math.atan2(-dx, -dz);
        lookP = tg;
        if (e.type === 'creeper') {
          if (dist < 3 && Math.abs(dy) < 3) { if (e.fuse < 0) { e.fuse = 0; snd('fuse', e); } }
          else if (e.fuse >= 0 && dist > 7) e.fuse = -1;
          if (e.fuse >= 0) { e.fuse++; fwd = 0; if (e.fuse >= 30) { delEnt(e); explode(e.x, e.y + .8, e.z, 3, e); return; } }
          else { if (dist > 1.5) fwd = 1; }
        } else if (T.ranged) {
          if (e.age % 10 === 0) e.see = losClear(e.x, e.y + 1.6, e.z, tg.x, tg.y + 1.6, tg.z);
          fwd = !e.see || dist > 12 ? 1 : dist < 5 ? -.8 : 0;
          if (e.see && dist < 14) { e.yaw = turn(e.yaw, aim, .5); if (e.cd === 0) { shootAt(e, tg); e.cd = [60, 40, 30, 20][W.diff] || 40; } }
        } else {
          if (dist > 1.1) fwd = 1;
          const reach = e.w * 2 + tg.w;
          if (dist * dist + dy * dy * .25 < reach * reach * .36 + .9 && Math.abs(dy) < 2 && e.cd === 0) { hurtEnt(tg, (T.dmg + (W.diff === 3 ? T.dmg * .5 : W.diff === 1 ? -T.dmg * .3 : 0)) | 0 || 1, e, 'mob'); e.cd = 20; e.swing = 6; if (e.type === 'spider') { } }
          if (e.type === 'spider' && e.onGround && dist > 2 && dist < 6 && RNG() < .1) { e.vy = .42; e.vx += dx / dist * .3; e.vz += dz / dist * .3; }
          if (e.type === 'slime' && e.onGround && --e.jumpT <= 0) { e.jumpT = 20 + ri(20); e.vy = .42 + e.size * .05; e.vx = dx / dist * .25; e.vz = dz / dist * .25; snd('slime', e); }
        }
        if (fwd > 0 && e.type !== 'slime') {
          if (--e.pathT <= 0 || !e.path) { e.path = findPath(e, Math.floor(tg.x), Math.floor(tg.y), Math.floor(tg.z), 300); e.pathT = 15 + ri(10); }
          let wx = tg.x, wz = tg.z;
          if (e.path && e.path.length) { const n = e.path[0]; if (Math.hypot(n[0] - e.x, n[2] - e.z) < .45) e.path.shift(); if (e.path.length) { wx = e.path[0][0]; wz = e.path[0][2]; if (e.path[0][1] > e.y + .5) jump = true; } }
          e.yaw = turn(e.yaw, Math.atan2(-(wx - e.x), -(wz - e.z)), .6);
        } else if (fwd < 0) e.yaw = turn(e.yaw, aim, .5);
        if (T.burn && daylight) { }
      } else if (e.panic > 0) {
        e.panic--; fwd = 1; sp *= 1.25;
        if (e.panic % 20 === 0 || e.collH) e.wYaw = RNG() * 6.28;
        e.yaw = turn(e.yaw, e.wYaw, .5);
      } else {
        let fol = null;
        if (T.breed && e.age % 10 === 0) { for (const pl of playersList()) { if (pl.dead) continue; const d = Math.hypot(pl.x - e.x, pl.z - e.z); const h = pl === P ? held() : pl.heldId >= 0 ? { id: pl.heldId } : null; if (d < 10 && h && T.breed.includes(IT[h.id].id)) { fol = pl; break; } } e.fol = fol; }
        fol = e.fol;
        if (e.love > 0) { let mate = null, bd = 64; for (const o of ENTS) if (o !== e && o.kind === 'mob' && o.type === e.type && o.love > 0 && !o.baby) { const d = (o.x - e.x) ** 2 + (o.z - e.z) ** 2; if (d < bd) { bd = d; mate = o; } } if (mate) { if (bd < 2) { if (NET.role !== 'guest' && e.id < mate.id) { const b = spawnMob(e.type, (e.x + mate.x) / 2, e.y, (e.z + mate.z) / 2, { baby: true, color: e.type === 'sheep' ? (RNG() < .5 ? e.color : mate.color) : null }); void b; spawnXp(1 + ri(7), e.x, e.y + .5, e.z); for (let i = 0; i < 6; i++) particle(e.x, e.y + 1, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, -.5, 1); } e.love = mate.love = 0; e.breedCd = mate.breedCd = 6000; } else { e.yaw = turn(e.yaw, Math.atan2(-(mate.x - e.x), -(mate.z - e.z)), .5); fwd = 1; } } }
        else if (fol) { const dx = fol.x - e.x, dz = fol.z - e.z, d = Math.hypot(dx, dz); lookP = fol; if (d > 2) { e.yaw = turn(e.yaw, Math.atan2(-dx, -dz), .4); fwd = 1; } }
        else {
          if (--e.wT <= 0) { e.walking = RNG() < (T.hostile ? .3 : .45); e.wYaw = RNG() * 6.28; e.wT = 60 + ri(120); }
          if (e.walking) { e.yaw = turn(e.yaw, e.wYaw, .25); fwd = .8; }
          if (!e.walking && e.age % 40 === 0 && RNG() < .3) { const pl = nearestPlayer(e, 8, false); e.lookAtP = pl; }
          lookP = e.lookAtP;
          if (e.type === 'slime' && e.onGround && --e.jumpT <= 0) { e.jumpT = 30 + ri(40); e.vy = .42; e.yaw = RNG() * 6.28; e.vx = -Math.sin(e.yaw) * .2; e.vz = -Math.cos(e.yaw) * .2; }
        }
        if (e.type === 'sheep' && e.sheared && RNG() < 1 / 1000) { const bx = Math.floor(e.x), by = Math.floor(e.y - .5), bz = Math.floor(e.z); if (isT(getS(bx, by, bz), 'grass_block') && NET.role !== 'guest') { setBlock(bx, by, bz, TN.dirt.base); e.sheared = false; e.wool.root.visible = true; e.eat = 40; } }
        if (!T.hostile && RNG() < .003) snd(T.snd, e);
        if (T.hostile && RNG() < .004) snd(T.snd, e);
        if (e.type === 'chicken' && --e.eggT <= 0 && !e.baby) { e.eggT = 6000 + ri(6000); spawnItem({ id: IN.egg.idx, n: 1 }, e.x, e.y + .3, e.z); snd('pop', e); }
      }
      if (e.eat > 0) e.eat--;
      if (lookP) { e.hyaw = turn(e.hyaw, Math.atan2(-(lookP.x - e.x), -(lookP.z - e.z)), .35); e.pitch = clamp(Math.atan2((lookP.y + 1.6) - (e.y + T.eye), Math.hypot(lookP.x - e.x, lookP.z - e.z)), -.8, .8); }
      else { e.hyaw = turn(e.hyaw, e.yaw, .2); e.pitch *= .9; }
      e.hyaw = e.yaw + clamp(((e.hyaw - e.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI, -1.2, 1.2);
      for (const o of ENTS) if (o !== e && o.kind === 'mob' && !o.dead) { const ox = e.x - o.x, oz = e.z - o.z, d2 = Math.hypot(ox, oz), r = (e.w + o.w) / 2; if (d2 < r && d2 > 1e-4 && Math.abs(e.y - o.y) < Math.max(e.h, o.h)) { e.vx += ox / d2 * .03; e.vz += oz / d2 * .03; } }
      for (const pl of playersList()) { if (pl.dead) continue; const dx = e.x - pl.x, dz = e.z - pl.z, d2 = Math.hypot(dx, dz), r = (e.w + pl.w) / 2; if (d2 < r && d2 > 1e-4 && Math.abs(e.y - pl.y) < e.h) { const f = (r - d2) / r * .05; e.vx += dx / d2 * f; e.vz += dz / d2 * f; if (pl === P) { P.vx -= dx / d2 * f * .5; P.vz -= dz / d2 * f * .5; } } }
      if (fwd && e.type !== 'slime') { const a = (inW || inL ? .02 : e.onGround ? sp * sp * 1.33 : .02) * fwd; e.vx -= Math.sin(e.yaw) * a; e.vz -= Math.cos(e.yaw) * a; }
      if (inW || inL) { if (e.type !== 'chicken' || true) e.vy += .04; if (e.collH) e.vy = .3; }
      else if ((e.collH && e.onGround && fwd) || (jump && e.onGround)) e.vy = CFG.JUMP;
      if (T.climb && e.collH && fwd) e.vy = .2;
      const vy0 = e.vy;
      moveE(e, e.vx, e.vy, e.vz, !T.hostile && !e.panic, .6);
      if (inW || inL) { e.vx *= .8; e.vy = e.vy * .8 - .02; e.vz *= .8; }
      else {
        e.vy = (e.vy - CFG.GRAVITY) * CFG.VDRAG;
        if (e.type === 'chicken' && e.vy < -.1 && !e.onGround) e.vy = -.1 + (e.vy + .1) * .4;
        const dr = e.onGround ? CFG.GROUND_DRAG : CFG.AIR_DRAG; e.vx *= dr; e.vz *= dr;
      }
      if (!e.onGround && vy0 < 0 && !inW) e.fallD = (e.fallD || 0) - (e.y - e.py); else { if (e.onGround && e.fallD > 3 && e.type !== 'chicken') hurtEnt(e, Math.ceil(e.fallD - 3), null, 'fall'); if (e.onGround || inW) e.fallD = 0; }
      if (T.burn && daylight && !inW && !e.baby && e.age % 20 === 0 && skyOpen(e)) e.fire = Math.max(e.fire, 160);
      if (inL) e.fire = 300;
      if (inL && e.age % 10 === 0) hurtEnt(e, 4, null, 'lava');
      if (e.fire > 0) { e.fire--; if (inW) e.fire = 0; if (e.fire % 20 === 0) hurtEnt(e, 1, null, 'fire'); if (e.age % 3 === 0) particle(e.x + (RNG() - .5) * e.w, e.y + RNG() * e.h, e.z + (RNG() - .5) * e.w, 0, 1, 0, [255, 150 + RNG() * 90, 30], .4, .08, -1, 1); }
      if (blockIn(e, b => TT[STT[b]].fire) && e.age % 10 === 0) { e.fire = Math.max(e.fire, 160); hurtEnt(e, 1, null, 'fire'); }
      if (!inW || T.undead) e.air = 300; else if (fluidIn(e, 1, T.eye) && e.type !== 'chicken' && --e.air < -19) { e.air = 0; hurtEnt(e, 2, null, 'drown'); }
      const md = Math.hypot(e.x - e.px, e.z - e.pz);
      e.limbA += (Math.min(1, md * 4) - e.limbA) * .4; e.limb += e.limbA;
      const pl = nearestPlayerAny(e);
      const dd = pl ? Math.hypot(pl.x - e.x, pl.y - e.y, pl.z - e.z) : 999;
      if (!e.persist && T.hostile && (dd > CFG.DESPAWN || (dd > 32 && RNG() < 1 / 800))) { delEnt(e); return; }
      if (e.y < -70 || !colAt(Math.floor(e.x) >> 4, Math.floor(e.z) >> 4)) { if (e.y < -70) delEnt(e); else e.frozen = true; }
    }
    function nearestPlayerAny(e) { let best = null, bd = 1e18; for (const pl of playersList()) { const d = (pl.x - e.x) ** 2 + (pl.y - e.y) ** 2 + (pl.z - e.z) ** 2; if (d < bd) { bd = d; best = pl; } } return best; }
    function skyOpen(e) { const L = getL(Math.floor(e.x), Math.floor(e.y + e.h * .9), Math.floor(e.z)); return (L >> 4) === 15; }
    function shootAt(e, tg) {
      const sx = e.x, sy = e.y + 1.5, sz = e.z;
      let dx = tg.x - sx, dy = tg.y + tg.h / 3 - sy, dz = tg.z - sz;
      dy += Math.hypot(dx, dz) * .2;
      const l = Math.hypot(dx, dy, dz) || 1, inac = [10, 10, 6, 2][W.diff] * .0075, gs = () => (RNG() + RNG() + RNG() - 1.5) * inac;
      spawnArrow(sx, sy, sz, (dx / l + gs()) * 1.6, (dy / l + gs()) * 1.6, (dz / l + gs()) * 1.6, e, 2 + W.diff * .1, false);
      snd('bow', e); e.swing = 6;
    }
    function animEnt(e, a) {
      const x = lerp(e.px, e.x, a), y = lerp(e.py, e.y, a), z = lerp(e.pz, e.z, a);
      if (e.kind === 'item') { const t = e.age + a; e.root.position.set(x, y + .15 + Math.sin(t / 10) * .08, z); e.root.rotation.y = t / 20; e.mesh.material.color.setScalar(brAt(x, y + .2, z)); return; }
      if (e.kind === 'xp') { const t = e.age + a; e.root.position.set(x, y + .2 + Math.sin(t / 8) * .05, z); e.root.children[0].material.color.setHSL(.2 + Math.sin(t / 6) * .05, 1, .55); return; }
      if (e.kind === 'fall' || e.kind === 'tnt') { e.root.position.set(x, y + .5, z); const b = brAt(x, y + .5, z); if (e.kind === 'tnt') { const fl = (e.fuse / 5 | 0) % 2 === 0; e.mesh.material.color.setScalar(fl ? b * 2.2 : b); const s = e.fuse < 10 ? 1 + (10 - e.fuse) * .02 : 1; e.mesh.scale.setScalar(s); } else e.mesh.material.color.setScalar(b); return; }
      if (e.kind === 'arrow' || e.kind === 'thrown') { e.root.position.set(x, y, z); if (e.kind === 'arrow' && !e.stuck) { V3.set(x + e.vx, y + e.vy, z + e.vz); e.root.lookAt(V3); } if (e.kind === 'thrown') e.root.rotation.y = e.age / 3; return; }
      const ls = lerp(e.limbP, e.limb, a), la = lerp(e.limbAP, e.limbA, a), sw = Math.cos(ls * .6662) * 1.4 * la, p = e.md.parts, at = e.age + a;
      const yaw = e.pyaw + (((e.yaw - e.pyaw + Math.PI) % 6.2832 + 6.2832) % 6.2832 - Math.PI) * a;
      e.root.position.set(x, y, z); e.root.rotation.set(0, yaw, e.dead ? Math.min(1, Math.sqrt(Math.max(0, (e.dead + a - 1) / 20 * 1.6))) * 1.5708 : 0);
      if (e.shd) e.shd.visible = !e.dead;
      const b = brAt(x, y + e.h * .7, z), sneak = e.sneak;
      if (e.hurtT > 10 || e.dead) e.mat.color.setRGB(b * 1.4, b * .55, b * .55); else if (e.fire > 0) e.mat.color.setRGB(b, b * .93, b * .82); else e.mat.color.setScalar(b);
      if (e.type === 'creeper' && e.fuse >= 0) { const f = e.fuse + a, k = 1 + Math.sin(f * 3) * .01 + f / 30 * .2; e.md.root.scale.set(k, k * (1 - f / 30 * .1), k); if ((f / 4 | 0) % 2) e.mat.color.setScalar(b * 2.2); }
      if (e.woolMat) e.woolMat.color.setRGB(b * DYE[e.color][0] / 255, b * DYE[e.color][1] / 255, b * DYE[e.color][2] / 255);
      if (e.type === 'slime') e.md.parts.outer.children[0].material.color.setScalar(b);
      const hy = (((lerp(e.phyaw, e.hyaw, a) - yaw + Math.PI) % 6.2832 + 6.2832) % 6.2832) - Math.PI;
      if (p.head) { p.head.rotation.set(-(e.pitch || 0) * (e.kind === 'player' ? 1 : 1) * -1 * -1 + 0, hy, 0, 'YXZ'); p.head.rotation.x = -(e.pitch || 0) * -1; }
      if (p.head && e.eat > 0) p.head.rotation.x = -(.6 + Math.sin(at * .8) * .2);
      if (p.rleg && p.lleg) {
        p.rleg.rotation.x = -sw; p.lleg.rotation.x = sw;
        if (e.type === 'zombie') { const s2 = e.swing > 0 ? Math.sin((6 - e.swing) / 6 * Math.PI) * .4 : 0; p.rarm.rotation.x = p.larm.rotation.x = 1.5 + Math.sin(at * .067) * .05 + s2; p.rarm.rotation.z = -.06 - Math.sin(at * .09) * .04; p.larm.rotation.z = .06 + Math.sin(at * .09) * .04; }
        else if (e.type === 'skeleton') { const aimA = e.see && e.target ? 1.45 : 0; p.rarm.rotation.x = aimA ? aimA : sw * .5; p.larm.rotation.x = aimA ? aimA : -sw * .5; p.rarm.rotation.y = aimA ? .2 : 0; p.larm.rotation.y = aimA ? -.5 : 0; }
        else if (e.type === 'enderman') { p.rarm.rotation.x = -sw * .5 + (e.angry ? .1 : 0); p.larm.rotation.x = sw * .5; p.rleg.rotation.x = -sw * .6; p.lleg.rotation.x = sw * .6; if (e.angry) p.head.position.y = (24 + 14 + 5) / 16; else p.head.position.y = (24 + 14) / 16; }
        else {
          const s2 = e.swing > 0 ? Math.sin((6 - e.swing + a) / 6 * Math.PI) : 0;
          p.rarm.rotation.x = sw * .9 + s2 * 1.4 + (e.heldMesh ? .3 : 0); p.larm.rotation.x = -sw * .9; p.rarm.rotation.z = -.05; p.larm.rotation.z = .05;
          if (p.body) p.body.rotation.x = sneak ? .5 : 0;
          if (sneak) { p.rleg.position.z = p.lleg.position.z = 4 / 16; p.rleg.position.y = p.lleg.position.y = (24 - 12.2) / 16; p.head.position.y = 24 / 16 - 4.2 / 16; p.rarm.position.y = p.larm.position.y = (24 - 2 - 3.2) / 16; p.body.position.y = (24 - 3.2) / 16; p.head.position.y = (24 - 4.2) / 16; }
          else { p.rleg.position.z = p.lleg.position.z = 0; p.rleg.position.y = p.lleg.position.y = 12 / 16; p.rarm.position.y = p.larm.position.y = 22 / 16; p.body.position.y = p.head.position.y = 24 / 16; }
        }
      } else if (p.leg0) {
        if (e.type === 'spider') { for (let i = 0; i < 8; i++) { const sd = i & 1 ? -1 : 1, k = i >> 1, base = [.785, .589, .589, .785][k] * sd, yb = [-.785, -.393, .393, .785][k] * -sd * -1; const ph = Math.cos(ls * .6662 * 2 + k * Math.PI / 2 * (sd > 0 ? 1 : 1) + (sd > 0 ? 0 : Math.PI)) * .4 * la, ph2 = Math.abs(Math.sin(ls * .6662 + k * Math.PI / 2)) * .4 * la; p['leg' + i].rotation.set(0, yb + ph * sd, -base + ph2 * sd, 'YXZ'); } }
        else if (e.type === 'chicken') { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; const fl = e.onGround ? 0 : Math.abs(Math.sin(at * 1.2)) * 1.2; p.wing0.rotation.z = -fl; p.wing1.rotation.z = fl; }
        else { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; p.leg2.rotation.x = sw; p.leg3.rotation.x = -sw; }
        if (e.wool) { const wp = e.wool.parts; for (const k in wp) wp[k].rotation.copy(p[k].rotation); }
      }
      if (e.kind === 'player') { e.tag.visible = !sneak; }
    }
