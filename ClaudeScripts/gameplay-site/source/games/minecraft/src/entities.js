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
    function delEnt(e) { e.gone = 1; e.dead = e.dead || 1; const i = ENTS.indexOf(e); if (i >= 0) ENTS.splice(i, 1); entById.delete(e.id); if (e.root) { scene.remove(e.root); e.root.traverse(o => { if (o.material && o.material !== e.sharedMat) o.material.dispose && o.material.dispose(); }); } if (e.tag) { e.tag.material.map.dispose(); e.tag.material.dispose(); } }
    const shC = cv(32, 32), shg = shC.getContext('2d'), shGr = shg.createRadialGradient(16, 16, 2, 16, 16, 16);
    shGr.addColorStop(0, 'rgba(0,0,0,.5)'); shGr.addColorStop(.6, 'rgba(0,0,0,.3)'); shGr.addColorStop(1, 'rgba(0,0,0,0)'); shg.fillStyle = shGr; shg.fillRect(0, 0, 32, 32);
    const shGeo = keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)), shMat = keep(new THREE.MeshBasicMaterial({ map: tex(shC), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }));
    function nameTag(name) {
      name = String(name).slice(0, 32);
      const w = tw(name) + 2, K = 4, c = cv(w * K, 10 * K), x = c.getContext('2d'); let px = 1;
      x.imageSmoothingEnabled = false; x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, c.width, c.height);
      for (const ch of name) { const i = ch.charCodeAt(0) - 32; if (i < 0 || i >= 95) { px += 4; continue; } x.drawImage(fontC, (i & 15) * 8, (i >> 4) * 9, 8, 8, px * K, K, 8 * K, 8 * K); px += fontW[i] + 1; }
      const t = new THREE.CanvasTexture(c); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
      s.scale.set(w * .025, .25, 1); s.renderOrder = 5;
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
    const DFL = () => W.diff > 3 ? 3 : W.diff;
    const difMul = o => o === P || o.kind === 'player' ? [0, .5, 1, 1.5][DFL()] ?? 1 : 1;
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
      if (e.pHit && tickN - e.pHit < 200) { stat('kills'); stat('k_' + e.type); }
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
    const PFN = 4100, PFX = new Int32Array(PFN), PFY = new Int32Array(PFN), PFZ = new Int32Array(PFN), PFG = new Float32Array(PFN), PFH = new Float32Array(PFN), PFP = new Int16Array(PFN), PFO = new Int16Array(PFN), PFS = new Uint16Array(1 << 17), PFV = new Float32Array(1 << 17);
    const PDX = [1, -1, 0, 0], PDZ = [0, 0, 1, -1], PDY = [0, 1, -1, -2, -3];
    let pfGen = 0;
    function findPath(e, tx, ty, tz, maxN) {
      const sx = Math.floor(e.x), sy = Math.floor(e.y + .01), sz = Math.floor(e.z), hh = Math.ceil(e.h), lim = Math.min(maxN || 260, 1000);
      if (++pfGen > 65000) { PFS.fill(0); pfGen = 1; }
      let nn = 1, no = 1, best = 0, n = 0;
      PFX[0] = sx; PFY[0] = sy; PFZ[0] = sz; PFG[0] = 0; PFH[0] = Math.abs(tx - sx) + Math.abs(ty - sy) + Math.abs(tz - sz); PFP[0] = -1; PFO[0] = 0;
      PFS[32 | 32 << 6 | 16 << 12] = pfGen; PFV[32 | 32 << 6 | 16 << 12] = 0;
      while (no && n++ < lim) {
        let bi = 0, bf = PFG[PFO[0]] + PFH[PFO[0]];
        for (let i = 1; i < no; i++) { const q = PFO[i], f = PFG[q] + PFH[q]; if (f < bf) { bf = f; bi = i; } }
        const c = PFO[bi]; PFO.copyWithin(bi, bi + 1, no); no--;
        if (PFH[c] < PFH[best]) best = c;
        if (PFH[c] <= 1) { best = c; break; }
        const cx = PFX[c], cy = PFY[c], cz = PFZ[c];
        for (let d = 0; d < 4; d++) for (let j = 0; j < 5; j++) {
          const dy = PDY[j], x = cx + PDX[d], y = cy + dy, z = cz + PDZ[d];
          if (dy === 1 && SOL[getS(cx, cy + hh, cz)]) continue;
          const lx = x - sx + 32, ly = y - sy + 16, lz = z - sz + 32;
          if (lx < 0 || lx > 63 || lz < 0 || lz > 63 || ly < 0 || ly > 31) continue;
          if (!walkable(x, y, z, hh)) continue;
          if (dy < 0) { let ok = true; for (let k = 0; k > dy; k--) if (SOL[getS(x, cy + k, z)] === 1) ok = false; if (!ok) continue; }
          const k = lx | lz << 6 | ly << 12, g2 = PFG[c] + 1 + (dy > 0 ? .5 : 0) + (FLU[getS(x, y, z)] ? 2 : 0);
          if (PFS[k] === pfGen && PFV[k] <= g2) continue;
          PFS[k] = pfGen; PFV[k] = g2;
          PFX[nn] = x; PFY[nn] = y; PFZ[nn] = z; PFG[nn] = g2; PFH[nn] = Math.abs(tx - x) + Math.abs(ty - y) * 1.5 + Math.abs(tz - z); PFP[nn] = c; PFO[no++] = nn++;
          break;
        }
      }
      const path = []; let c = best; while (c >= 0 && PFP[c] >= 0) { path.push([PFX[c] + .5, PFY[c], PFZ[c] + .5]); c = PFP[c]; }
      return path.reverse();
    }
    const targetable = pl => !(pl.dead || pl.spec || (pl === P && (mode() === 'creative' || mode() === 'spectator')) || (pl.kind === 'player' && (pl.creative || pl.pdead || pl.mode === 'creative' || pl.mode === 'spectator')));
    function perceive(e, pl, T) {
      const dx = pl.x - e.x, dy = pl.y - e.y, dz = pl.z - e.z, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > 1225) return false;
      if (d2 < 9) return true;
      const mv = Math.hypot(pl.x - pl.px, pl.z - pl.pz), noise = pl.sneak ? 0 : mv > .25 ? 16 : mv > .05 ? 9 : 0;
      if (d2 < noise * noise) return true;
      const da = Math.abs(((Math.atan2(-dx, -dz) - e.hyaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (da > 1.92 && !(e.hurtT > 0)) return false;
      return losClear(e.x, e.y + T.eye, e.z, pl.x, pl.y + 1.6, pl.z);
    }
    function smartSense(e, T) {
      if (!e.lk) { e.lk = { x: e.x, y: e.y, z: e.z, w: .6, h: 1.8 }; e.tvx = e.tvz = 0; e.lkT = 0; e.sees = false; e.react = 0; e.strD = RNG() < .5 ? 1 : -1; e.strT = 0; }
      const tg0 = e.target;
      if (tg0 && (tg0.dead === true || tg0.pdead || !targetable(tg0))) { e.target = null; e.sees = false; e.path = null; }
      if ((e.age + (e.id | 0)) % 4) return;
      if (e.type === 'spider' && !e.angry && brAt(e.x, e.y + .5, e.z) > .55) { e.sees = false; if (e.target && (e.lkT += 4) > 60) e.target = null; return; }
      let seen = null, bd = 1e9;
      for (const pl of playersList()) { if (!targetable(pl) || !perceive(e, pl, T)) continue; const d = (pl.x - e.x) ** 2 + (pl.y - e.y) ** 2 + (pl.z - e.z) ** 2; if (d < bd) { bd = d; seen = pl; } }
      if (seen) {
        if (!e.target) { e.react = 5; for (const o of ENTS) if (o !== e && o.kind === 'mob' && !o.target && !o.dead && MT[o.type].hostile && !MT[o.type].neutral && Math.abs(o.x - e.x) < 14 && Math.abs(o.z - e.z) < 14 && Math.abs(o.y - e.y) < 6) { if (!o.lk) o.lk = { x: 0, y: 0, z: 0, w: .6, h: 1.8 }; o.target = seen; o.lk.x = seen.x; o.lk.y = seen.y; o.lk.z = seen.z; o.tvx = o.tvz = 0; o.lkT = 0; o.sees = false; o.react = 8 + ri(10); o.strD = 1; o.strT = 0; } }
        const nvx = seen.x - seen.px, nvz = seen.z - seen.pz;
        e.tvx = e.target === seen ? e.tvx * .4 + nvx * .6 : nvx; e.tvz = e.target === seen ? e.tvz * .4 + nvz * .6 : nvz;
        e.target = seen; e.lk.x = seen.x; e.lk.y = seen.y; e.lk.z = seen.z; e.lkT = 0; e.sees = true;
      } else {
        e.sees = false; e.tvx = e.tvz = 0;
        if (e.target) { e.lkT += 4; if (e.lkT > 240) { e.target = null; e.path = null; } else if (Math.hypot(e.lk.x - e.x, e.lk.z - e.z) < 1.6 && e.lkT % 40 === 0) { e.lk.x += (RNG() - .5) * 12; e.lk.z += (RNG() - .5) * 12; e.pathT = 0; } }
      }
    }
    let PKN = 1;
    function packRank(e, tg) {
      const ed = (e.x - tg.x) * (e.x - tg.x) + (e.z - tg.z) * (e.z - tg.z);
      let n = 1, rank = 0, ld = ed;
      PKX = e.x; PKZ = e.z;
      for (let i = 0, EN = ENTS.length; i < EN; i++) {
        const o = ENTS[i];
        if (o === e || o.kind !== 'mob' || o.dead || o.target !== tg || !MT[o.type].hostile || Math.abs(o.x - e.x) > 14 || Math.abs(o.z - e.z) > 14) continue;
        n++;
        const od = (o.x - tg.x) * (o.x - tg.x) + (o.z - tg.z) * (o.z - tg.z);
        if (od < ed - 1e-9 || od < ed + 1e-9 && o.id < e.id) rank++;
        if (od < ld) { ld = od; PKX = o.x; PKZ = o.z; }
      }
      PKN = n;
      return rank;
    }
    const FLK = [0, 2.2, -2.2, Math.PI, 1.2, -1.2, 2.7, -2.7];
    function flankGoal(e, tg, rank, far) {
      const ya = Math.atan2(-(PKX - tg.x), -(PKZ - tg.z)) + FLK[rank % 8], R = far ? 4.5 : 1.1;
      let gx = tg.x - Math.sin(ya) * R, gz = tg.z - Math.cos(ya) * R;
      const mx = e.x - tg.x, mz = e.z - tg.z, md = Math.sqrt(mx * mx + mz * mz) || 1, sx = gx - tg.x, sz = gz - tg.z, sd = Math.sqrt(sx * sx + sz * sz) || 1;
      if (md > 3.4 && (mx * sx + mz * sz) / (md * sd) < -.2) { const side = mx * sz - mz * sx > 0 ? 1 : -1; gx = tg.x + (mx / md * .2 - mz / md * side) * 4.6; gz = tg.z + (mz / md * .2 + mx / md * side) * 4.6; }
      FGX = gx; FGZ = gz;
    }
    let FGX = 0, FGZ = 0, PKX = 0, PKZ = 0;
    const facing = (tg, e) => { const dx = e.x - tg.x, dz = e.z - tg.z, d = Math.sqrt(dx * dx + dz * dz) || 1; return (-Math.sin(tg.yaw || 0) * dx - Math.cos(tg.yaw || 0) * dz) / d; };
    function blinkBehind(e, tg) {
      for (let k = 0; k < 6; k++) {
        const ya = (tg.yaw || 0) + (RNG() - .5) * 1.2, r = 2 + RNG() * 1.5, x = Math.floor(tg.x + Math.sin(ya) * r), z = Math.floor(tg.z + Math.cos(ya) * r);
        for (let y = Math.floor(tg.y) + 2; y >= Math.floor(tg.y) - 2; y--) {
          if (SOL[getS(x, y - 1, z)] === 1 && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)] && !SOL[getS(x, y + 2, z)] && !FLU[getS(x, y, z)]) {
            for (let i = 0; i < 12; i++) particle(e.x, e.y + RNG() * 2.5, e.z, (RNG() - .5) * 2, RNG(), (RNG() - .5) * 2, [180, 60, 220], .6, .06, -1, 1);
            e.x = e.px = x + .5; e.y = e.py = y; e.z = e.pz = z + .5; e.path = null; snd('teleport', e);
            return true;
          }
        }
      }
      return false;
    }
    function nearestPlayer(e, r, needLos) {
      let best = null, bd = r * r;
      for (const pl of playersList()) {
        if (!targetable(pl)) continue;
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
      let fwd = 0, sp = T.sp, lookP = null, jump = false, str = 0;
      const daylight = sunB > .5 && !W.raining, smart = W.diff > 3 && T.hostile && !T.neutral;
      if (smart) smartSense(e, T);
      else if (T.hostile && !T.neutral && e.type !== 'spider') { if (!e.target || e.target.dead || (e.age % 20 === 0 && Math.hypot(e.target.x - e.x, e.target.z - e.z) > 40)) e.target = nearestPlayer(e, 35, true); }
      else if (e.type === 'spider') { const br2 = brAt(e.x, e.y + .5, e.z); if (e.age % 20 === 0 && (!e.target || br2 > .55 && !e.angry)) e.target = br2 < .5 || e.angry ? nearestPlayer(e, 16, true) : null; }
      else if (e.type === 'enderman') { if (e.age % 5 === 0 && !e.angry) for (const pl of playersList()) { if (pl === P && mode() !== 'survival' && mode() !== 'adventure') continue; const dx = e.x - pl.x, dy = e.y + 2.55 - (pl.y + 1.62), dz = e.z - pl.z, d = Math.hypot(dx, dy, dz); if (d > 64 || pl !== P) continue; const lx = -Math.sin(P.yaw) * Math.cos(P.pitch), ly = Math.sin(P.pitch), lz = -Math.cos(P.yaw) * Math.cos(P.pitch); if ((lx * dx + ly * dy + lz * dz) / d > 1 - .025 / d * 2 && losClear(pl.x, pl.y + 1.62, pl.z, e.x, e.y + 2.55, e.z)) { e.angry = 400; e.target = pl; snd('enderman_scream', e); } } if (e.angry > 0 && --e.angry === 0) e.target = null; if (W.diff > 3 && e.angry > 0 && e.target && !e.dead) { const tq = e.target, qd = Math.sqrt((tq.x - e.x) * (tq.x - e.x) + (tq.z - e.z) * (tq.z - e.z)); e.tpCd = (e.tpCd || 0) - 1; if (e.tpW > 0) { if (--e.tpW === 0 && blinkBehind(e, tq)) e.tpCd = 90 + ri(70); } else if (e.tpCd <= 0 && qd > 3.2 && qd < 28 && (facing(tq, e) > .5 || e.hurtT > 14)) e.tpW = 7 + ri(5); } if ((inW || (W.raining && skyOpen(e))) && e.age % 10 === 0) { hurtEnt(e, 1, null, 'water'); teleportMob(e); } }
      const tg = e.target;
      if (tg && T.hostile) {
        const B = smart && !e.sees ? e.lk : tg, sees = !smart || e.sees, df = DFL();
        const dx = B.x - e.x, dz = B.z - e.z, dy = B.y - e.y, dist = Math.hypot(dx, dz), aim = Math.atan2(-dx, -dz);
        let gx = B.x, gz = B.z;
        lookP = B;
        if (smart && e.react > 0) e.react--;
        else if (e.type === 'creeper') {
          if (sees && dist < 3 && Math.abs(dy) < 3) { if (e.fuse < 0) { e.fuse = 0; snd('fuse', e); } }
          else if (e.fuse >= 0 && dist > 7) e.fuse = -1;
          if (e.fuse >= 0) { e.fuse++; fwd = smart && dist > 1.2 ? 1 : 0; if (e.fuse >= 30) { delEnt(e); explode(e.x, e.y + .8, e.z, 3, e); return; } }
          else {
            if (dist > 1.5) fwd = 1;
            if (smart && sees && dist > 3.2 && tg.yaw !== undefined) {
              const rk = packRank(e, tg);
              if (PKN > 1) { flankGoal(e, tg, Math.max(1, rk), false); gx = FGX; gz = FGZ; }
              else if (dist > 6) { gx += Math.sin(tg.yaw) * 3; gz += Math.cos(tg.yaw) * 3; }
              if (dist < 8 && facing(tg, e) > .7) { if (--e.strT <= 0 || e.collH) { e.strD = -e.strD; e.strT = 7 + ri(9); } str = e.strD * .8; }
            }
          }
        } else if (T.ranged) {
          if (e.age % 10 === 0) e.see = sees && losClear(e.x, e.y + 1.6, e.z, tg.x, tg.y + 1.6, tg.z);
          fwd = !e.see || dist > 12 ? 1 : dist < 5 ? -.8 : 0;
          if (smart && e.see && dist >= 4 && dist <= 13) { if (--e.strT <= 0 || e.collH) { e.strD = -e.strD; e.strT = 14 + ri(24); } str = e.strD; }
          if (e.see && dist < 14) { e.yaw = turn(e.yaw, aim, .5); if (e.cd === 0) { shootAt(e, tg, smart); e.cd = [60, 40, 30, 20][df] || 40; } }
        } else {
          if (dist > 1.1) fwd = 1;
          const reach = e.w * 2 + tg.w;
          if (sees && dist * dist + dy * dy * .25 < reach * reach * .36 + .9 && Math.abs(dy) < 2 && e.cd === 0) { hurtEnt(tg, (T.dmg + (df === 3 ? T.dmg * .5 : df === 1 ? -T.dmg * .3 : 0)) | 0 || 1, e, 'mob'); e.cd = 20; e.swing = 6; }
          if (smart && sees && dist > 2.2) {
            const s = sp * sp * 2.93; let t = dist / s;
            t = Math.min(30, Math.hypot(dx + e.tvx * t, dz + e.tvz * t) / s); t = Math.min(30, Math.hypot(dx + e.tvx * t, dz + e.tvz * t) / s);
            gx += e.tvx * t; gz += e.tvz * t;
            const rk = packRank(e, tg);
            if (rk > 0 && dist > 2.6 && e.type !== 'spider') { flankGoal(e, tg, rk, false); gx = FGX; gz = FGZ; }

          }
          if (e.type === 'spider' && e.onGround && dist > 2 && dist < 6 && RNG() < .1) { const lx = gx - e.x, lz = gz - e.z, ll = Math.hypot(lx, lz) || 1; e.vy = .42; e.vx += lx / ll * .3; e.vz += lz / ll * .3; }
          if (e.type === 'slime' && e.onGround && --e.jumpT <= 0) { const lx = gx - e.x, lz = gz - e.z, ll = Math.hypot(lx, lz) || 1; e.jumpT = 20 + ri(20); e.vy = .42 + e.size * .05; e.vx = lx / ll * .25; e.vz = lz / ll * .25; snd('slime', e); }
        }
        if (fwd > 0 && e.type !== 'slime') {
          if (--e.pathT <= 0 || !e.path) { e.path = findPath(e, Math.floor(gx), Math.floor(B.y), Math.floor(gz), smart ? 600 : 300); e.pathT = smart ? 8 + ri(6) : 15 + ri(10); }
          let wx = gx, wz = gz;
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
      for (let i = 0, EN = ENTS.length; i < EN; i++) { const o = ENTS[i]; if (o === e || o.kind !== 'mob' || o.dead) continue; const ox = e.x - o.x, oz = e.z - o.z, r = (e.w + o.w) / 2, q = ox * ox + oz * oz; if (q < r * r && q > 1e-8 && Math.abs(e.y - o.y) < Math.max(e.h, o.h)) { const d2 = Math.sqrt(q); e.vx += ox / d2 * .03; e.vz += oz / d2 * .03; } }
      const PLS = playersList();
      for (let i = 0; i < PLS.length; i++) { const pl = PLS[i]; if (pl.dead) continue; const dx = e.x - pl.x, dz = e.z - pl.z, r = (e.w + pl.w) / 2, q = dx * dx + dz * dz; if (q < r * r && q > 1e-8 && Math.abs(e.y - pl.y) < e.h) { const d2 = Math.sqrt(q), f = (r - d2) / r * .05; e.vx += dx / d2 * f; e.vz += dz / d2 * f; if (pl === P) { P.vx -= dx / d2 * f * .5; P.vz -= dz / d2 * f * .5; } } }
      if (fwd && e.type !== 'slime') { const a = (inW || inL ? .02 : e.onGround ? sp * sp * 1.33 : .02) * fwd; e.vx -= Math.sin(e.yaw) * a; e.vz -= Math.cos(e.yaw) * a; }
      if (str && e.onGround) { const a = sp * sp * 1.1 * str; e.vx -= Math.sin(e.yaw + 1.5708) * a; e.vz -= Math.cos(e.yaw + 1.5708) * a; }
      if (inW || inL) { if (e.type !== 'chicken' || true) e.vy += .04; if (e.collH) e.vy = .3; }
      else if ((e.collH && e.onGround && fwd) || (jump && e.onGround)) e.vy = CFG.JUMP;
      if (T.climb && e.collH && fwd) e.vy = .2;
      const vy0 = e.vy;
      moveE(e, e.vx, e.vy, e.vz, !T.hostile && !e.panic || str !== 0 && e.onGround, .6);
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
      const md = Math.sqrt((e.x - e.px) * (e.x - e.px) + (e.z - e.pz) * (e.z - e.pz));
      e.limbA += (Math.min(1, md * 4) - e.limbA) * .4; e.limb += e.limbA;
      const pl = nearestPlayerAny(e);
      const dd = pl ? Math.sqrt((pl.x - e.x) * (pl.x - e.x) + (pl.y - e.y) * (pl.y - e.y) + (pl.z - e.z) * (pl.z - e.z)) : 999;
      if (!e.persist && T.hostile && (dd > CFG.DESPAWN || (dd > 32 && RNG() < 1 / 800))) { delEnt(e); return; }
      if (e.y < -70 || !colAt(Math.floor(e.x) >> 4, Math.floor(e.z) >> 4)) { if (e.y < -70) delEnt(e); else e.frozen = true; }
    }
    function nearestPlayerAny(e) { let best = null, bd = 1e18; const L = playersList(); for (let i = 0; i < L.length; i++) { const pl = L[i], d = (pl.x - e.x) * (pl.x - e.x) + (pl.y - e.y) * (pl.y - e.y) + (pl.z - e.z) * (pl.z - e.z); if (d < bd) { bd = d; best = pl; } } return best; }
    function skyOpen(e) { const L = getL(Math.floor(e.x), Math.floor(e.y + e.h * .9), Math.floor(e.z)); return (L >> 4) === 15; }
    function shootAt(e, tg, smart) {
      const sx = e.x, sy = e.y + 1.5, sz = e.z, df = DFL();
      let dx = tg.x - sx, dy = tg.y + tg.h / 3 - sy, dz = tg.z - sz, vx, vy, vz;
      const inac = [10, 10, 6, 2][df] * .0075, gs = () => (RNG() + RNG() + RNG() - 1.5) * inac;
      if (smart) {
        const tvx = tg.x - tg.px, tvz = tg.z - tg.pz;
        let t = Math.hypot(dx, dy, dz) / 1.6, S = t;
        for (let k = 0; k < 4; k++) {
          S = (1 - Math.pow(.99, t)) * 100;
          vx = (dx + tvx * t) / S; vz = (dz + tvz * t) / S; vy = (dy + 5 * (t - S)) / S;
          t = Math.max(1, t * Math.hypot(vx, vy, vz) / 1.6);
        }
        const l = Math.hypot(vx, vy, vz) || 1;
        vx = (vx / l + gs()) * 1.6; vy = (vy / l + gs()) * 1.6; vz = (vz / l + gs()) * 1.6;
      } else {
        dy += Math.hypot(dx, dz) * .2;
        const l = Math.hypot(dx, dy, dz) || 1;
        vx = (dx / l + gs()) * 1.6; vy = (dy / l + gs()) * 1.6; vz = (dz / l + gs()) * 1.6;
      }
      spawnArrow(sx, sy, sz, vx, vy, vz, e, 2 + df * .1, false);
      snd('bow', e); e.swing = 6;
    }
    const SPLB = [.785, .589, .589, .785], SPLY = [-.785, -.393, .393, .785];
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
        if (e.type === 'spider') { const LG = e.legs || (e.legs = [p.leg0, p.leg1, p.leg2, p.leg3, p.leg4, p.leg5, p.leg6, p.leg7]); for (let i = 0; i < 8; i++) { const sd = i & 1 ? -1 : 1, k = i >> 1, base = SPLB[k] * sd, yb = SPLY[k] * -sd * -1; const ph = Math.cos(ls * .6662 * 2 + k * Math.PI / 2 * (sd > 0 ? 1 : 1) + (sd > 0 ? 0 : Math.PI)) * .4 * la, ph2 = Math.abs(Math.sin(ls * .6662 + k * Math.PI / 2)) * .4 * la; LG[i].rotation.set(0, yb + ph * sd, -base + ph2 * sd, 'YXZ'); } }
        else if (e.type === 'chicken') { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; const fl = e.onGround ? 0 : Math.abs(Math.sin(at * 1.2)) * 1.2; p.wing0.rotation.z = -fl; p.wing1.rotation.z = fl; }
        else { p.leg0.rotation.x = -sw; p.leg1.rotation.x = sw; p.leg2.rotation.x = sw; p.leg3.rotation.x = -sw; }
        if (e.wool) { const wp = e.wool.parts; for (const k in wp) wp[k].rotation.copy(p[k].rotation); }
      }
      if (e.kind === 'player') { e.tag.visible = !sneak; }
    }
    const P = { x: .5, y: 100, z: .5, px: .5, py: 100, pz: .5, vx: 0, vy: 0, vz: 0, w: CFG.PW, h: CFG.PH, onGround: false, collH: false, yaw: 0, pitch: 0, fall: 0, hp: 20, food: 20, sat: 5, exh: 0, air: 300, regenT: 0, hurtT: 0, shake: 0, sprint: false, sneak: false, fly: false, jumpT: 0, xp: 0, lvl: 0, score: 0, walk: 0, walkP: 0, nextStep: 1, bob: 0, bobP: 0, eye: CFG.EYE, eyeP: CFG.EYE, eyeW: false, place: false, hit: true, kind: 'self', fire: 0, absorb: 0, spawn: null, swimT: 0, atkT: 0, dead: false, sleeping: 0, effects: {}, lastHurt: 0, lastDmg: 0, climbing: false, inLava: false, kbT: 0 };
    let inv = new Array(36).fill(null), armor = [null, null, null, null], offhand = null, craft2 = new Array(4).fill(null), craft3 = new Array(9).fill(null), cursor = null, sel = 0, ender = new Array(27).fill(null);
    let scr = 'title', gui = null, guiKey = null, tickN = 0, frameN = 0, sunB = 1, deadT = 0;
    let attackHeld = false, useHeld = false, breakCd = 0, useCd = 0, mine = null, swingT = -1, eating = null, drawing = null, equipT = 1, nameT = 0, lastSel = -1, sprintTap = 0, sprintKey = false, shielding = false;
    let tJump = false, tSneak = false;
    const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
    const mode = () => W ? W.mode : 'survival';
    const creative = () => W && W.mode === 'creative';
    const canBuild = () => W && (W.mode === 'survival' || W.mode === 'creative');
    const held = () => inv[sel];
    let plTick = -1, plWorld = null, plDead = false, plList = [];
    const playersList = () => {
      if (plTick === tickN && plWorld === W && plDead === P.dead && W) return plList;
      const l = W && W.dead !== true && !P.dead ? [P] : [];
      for (const e of ENTS) if (e.kind === 'player' && e.y > -500) l.push(e);
      plTick = tickN; plWorld = W; plDead = P.dead; plList = l;
      return l;
    };
    const ST = (id, n, d) => ({ id, n: n || 1, d: d || 0 });
    const sameSt = (a, b) => a && b && a.id === b.id && (a.d || 0) === (b.d || 0) && JSON.stringify(a.x || null) === JSON.stringify(b.x || null);
    function giveItem(s, silent) {
      const ms = IT[s.id].stack;
      let n = s.n;
      for (let pass = 0; pass < 2 && n > 0; pass++) {
        const order = [];
        for (let i = 0; i < 9; i++) order.push(i);
        for (let i = 9; i < 36; i++) order.push(i);
        if (pass === 0) order.unshift(sel);
        for (const i of order) {
          if (n <= 0) break;
          const t = inv[i];
          if (pass === 0 && t && sameSt(t, s) && ms > 1 && t.n < ms) { const m = Math.min(ms - t.n, n); t.n += m; n -= m; }
          else if (pass === 1 && !t) { const m = Math.min(ms, n); inv[i] = { id: s.id, n: m, d: s.d || 0, x: s.x }; n -= m; }
        }
      }
      void silent;
      return n;
    }
    const giveOrDrop = s => { const left = giveItem(s); if (left > 0) throwStack({ id: s.id, n: left, d: s.d, x: s.x }, false); };
    function throwStack(s, far) {
      const cp = Math.cos(P.pitch), sp = far ? .3 : .1;
      spawnItem(s, P.x, P.y + P.eye - .3, P.z, -Math.sin(P.yaw) * cp * sp + (RNG() - .5) * .02, Math.sin(P.pitch) * sp + .1, -Math.cos(P.yaw) * cp * sp + (RNG() - .5) * .02, 40);
    }
    const exhaust = v => { if (mode() === 'survival' || mode() === 'adventure') P.exh = Math.min(40, P.exh + v); };
    const xpNeed = l => l >= 30 ? 112 + (l - 30) * 9 : l >= 15 ? 37 + (l - 15) * 5 : 7 + l * 2;
    function addXp(n) {
      if (n <= 0) return;
      P.score += n; P.xp += n;
      let need = xpNeed(P.lvl);
      while (P.xp >= need) { P.xp -= need; P.lvl++; need = xpNeed(P.lvl); if (P.lvl % 5 === 0) snd('levelup'); }
      snd('orb'); api.score(P.score);
    }
    function armorPts() { let d = 0, t = 0; for (const a of armor) if (a) { const A = IT[a.id].armor; if (A) { d += A.def; t += A.tough; } } return [d, t]; }
    function damageArmor(dmg) { const n = Math.max(1, Math.floor(dmg / 4)); for (let i = 0; i < 4; i++) { const a = armor[i]; if (!a || !IT[a.id].dur) continue; a.d += n; if (a.d >= IT[a.id].dur) { armor[i] = null; snd('tbreak'); } } }
    function hurtPlayer(d, sx, sz, kind) {
      if (P.dead || scr !== 'game' || d < 0) return;
      const md = mode();
      if ((md === 'creative' || md === 'spectator') && kind !== 'void') return;
      if (kind === 'mob' || kind === 'arrow' || kind === 'player') { if (W.diff === 0) d = 0; }
      if (P.hurtT > 10 && kind !== 'void' && kind !== 'starve' && kind !== 'drown') { if (d <= P.lastDmg) return; d -= P.lastDmg; }
      if (shielding && (kind === 'mob' || kind === 'arrow' || kind === 'explosion' || kind === 'player') && sx != null) { const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), dx = sx - P.x, dz = sz - P.z; if (fx * dx + fz * dz > 0) { snd('shield'); if (offhand && IN.shield && offhand.id === IN.shield.idx) offhand.d++; else if (held() && held().id === IN.shield.idx) held().d++; if (sx != null) { const l = Math.hypot(dx, dz) || 1; P.vx -= dx / l * .3; P.vz -= dz / l * .3; } return; } }
      const bypass = kind === 'fall' || kind === 'drown' || kind === 'starve' || kind === 'void' || kind === 'fire' || kind === 'lava' || kind === 'magic' || kind === 'suffocate';
      if (!bypass && kind !== 'anvil') { const [def, tough] = armorPts(); if (def) { const red = Math.min(20, Math.max(def / 5, def - d / (2 + tough / 4))); d = d * (1 - red / 25); damageArmor(d); } }
      if (kind === 'fall') { const hb = held(); void hb; }
      d = Math.max(0, d);
      if (P.absorb > 0) { const a = Math.min(P.absorb, d); P.absorb -= a; d -= a; }
      P.lastDmg = d + (P.lastDmg && P.hurtT > 10 ? P.lastDmg : 0);
      if (d <= 0 && kind !== 'void') { if (sx != null) knock(sx, sz); return; }
      P.hp -= d; stat('dmgT', d); P.hurtT = 20; P.shake = 10; exhaust(CFG.EXH_HURT);
      if (sx != null) knock(sx, sz);
      snd(kind === 'fall' && d > 4 ? 'fall_big' : kind === 'fall' ? 'fall_small' : 'hurt');
      P.lastKind = kind;
      if (P.hp <= 0) {
        const tot = (s => s && s.id === IN.totem_of_undying.idx);
        if (tot(held()) || tot(offhand)) { if (tot(held())) inv[sel] = null; else offhand = null; P.hp = 1; P.absorb = 4; P.effects.regen = 900; for (let i = 0; i < 40; i++) particle(P.x, P.y + 1, P.z, (RNG() - .5) * 4, RNG() * 4, (RNG() - .5) * 4, [RNG() < .5 ? 240 : 120, 220, 60], 1.2, .08, 4, 1); snd('totem'); chatSys(P.name + ' used a Totem of Undying'); return; }
        die(kind);
      }
    }
    function knock(sx, sz) { const dx = P.x - sx, dz = P.z - sz, l = Math.hypot(dx, dz) || 1; P.vx = P.vx / 2 + dx / l * .4; P.vz = P.vz / 2 + dz / l * .4; P.vy = Math.min(.4, P.vy / 2 + .4); }
    const DEATHMSG = { fall: 'fell from a high place', drown: 'drowned', starve: 'starved to death', void: 'fell out of the world', fire: 'burned to death', lava: 'tried to swim in lava', mob: 'was slain', arrow: 'was shot by Skeleton', explosion: 'blew up', suffocate: 'suffocated in a wall', cactus: 'was pricked to death', anvil: 'was squashed by a falling anvil', magic: 'was killed by magic', player: 'was slain by a player', freeze: 'froze to death' };
    function die(kind) {
      if (P.dead) return;
      P.dead = true; P.hp = 0; deadT = 0; P.sprint = false; attackHeld = useHeld = false; eating = null; mine = null; drawing = null;
      const msg = (P.name || 'Player') + ' ' + (DEATHMSG[kind] || 'died');
      chatSys(msg); netSend({ t: 'chat', s: 1, m: msg });
      P.deathMsg = msg; P.scoreAtDeath = P.score; P.lifeAtDeath = P.st.sinceDeath || 0; stat('deaths'); P.st.sinceDeath = 0;
      if (W.rules.keepInventory !== true && mode() !== 'creative') {
        for (const arr of [inv, armor, craft2, craft3, scIn]) for (let i = 0; i < arr.length; i++) if (arr[i]) { const s = arr[i]; arr[i] = null; spawnItem(s, P.x, P.y + 1, P.z, (RNG() - .5) * .5, .2 + RNG() * .2, (RNG() - .5) * .5, 40); }
        if (offhand) { spawnItem(offhand, P.x, P.y + 1, P.z); offhand = null; }
        if (cursor) { spawnItem(cursor, P.x, P.y + 1, P.z); cursor = null; }
        const xp = Math.min(100, P.lvl * 7); if (xp) spawnXp(xp, P.x, P.y + .5, P.z);
        P.xp = 0; P.lvl = 0;
      }
      gui = 'dead';
      if (locked()) { unlockIntent = true; document.exitPointerLock(); }
      if (W.hardcore) { W.mode = 'spectator'; }
      if (P.score > 0) api.submit(P.score);
      saveSoon();
    }
    function respawn() {
      P.dead = false; gui = null;
      const sp = P.spawn && validSpawn(P.spawn) ? P.spawn : W.spawn;
      Object.assign(P, { hp: 20, food: 20, sat: 5, exh: 0, air: 300, vx: 0, vy: 0, vz: 0, fall: 0, fly: false, hurtT: 0, shake: 0, fire: 0, absorb: 0, effects: {}, x: sp[0], y: sp[1], z: sp[2], place: !P.spawn || sp === W.spawn, score: 0 });
      if (W.hardcore) { P.fly = true; }
      P.px = P.x; P.py = P.y; P.pz = P.z;
      api.score(0); lockMouse();
      netSend({ t: 'respawn' });
    }
    function validSpawn(s) { const b = getS(Math.floor(s[0]), Math.floor(s[1]) - 0, Math.floor(s[2])); void b; return true; }
    function swing() { if (swingT < 0 || swingT >= CFG.SWING_TICKS / 2) swingT = 0; netAct({ sw: 1 }); }
    const toolOf = s => s && IT[s.id].tool ? IT[s.id].tool : null;
    function mineSpeed(s, t) {
      const tl = toolOf(held()), tk = tl ? tl.k : null;
      let sp = 1;
      if (tk === 'shears') { if (t.tags.has('leaves') || t.web) sp = 15; else if (t.tags.has('wool')) sp = 5; else if (t.id === 'vine' || t.id === 'glow_lichen') sp = 2; }
      else if (tk === 'sword') { if (t.web) sp = 15; else if (t.id === 'bamboo') sp = 999; else if (t.plant || t.tags.has('leaves') || t.id.includes('pumpkin') || t.id === 'melon') sp = 1.5; }
      else if (tk && tk === t.tool) sp = tl.sp;
      else if (tk === 'axe' && (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry' || t.snd === 'nether_wood') && !t.tool) sp = tl.sp;
      if (P.eyeW && !hasAqua()) sp /= 5;
      if (!P.onGround && !P.fly && !P.climbing) sp /= 5;
      return sp;
    }
    const hasAqua = () => false;
    function canHarvest(t) {
      if (!t.req) return true;
      const tl = toolOf(held());
      if (!tl) return false;
      if (tl.k === 'shears' && (t.web || t.tags.has('leaves') || t.tags.has('wool'))) return true;
      if (tl.k === 'sword' && t.web) return true;
      return tl.k === t.tool && tl.lvl >= t.lvl;
    }
    function relHard(s) {
      const t = TT[STT[s]];
      if (t.hard < 0) return 0;
      if (t.hard === 0) return 1;
      return mineSpeed(s, t) / t.hard / (canHarvest(t) ? 30 : 100);
    }
    function damageTool(n) {
      const s = held();
      if (!s || !IT[s.id].dur || mode() === 'creative') return;
      s.d += n;
      if (s.d >= IT[s.id].dur) { inv[sel] = null; snd('tbreak'); for (let i = 0; i < 10; i++) particle(P.x - Math.sin(P.yaw) * .5, P.y + 1.4, P.z - Math.cos(P.yaw) * .5, (RNG() - .5) * 2, RNG() * 2, (RNG() - .5) * 2, [150, 120, 80], .5, .05, 12); }
    }
    function dropBlock(s, x, y, z, ctx) {
      if (W.rules.doTileDrops === false) return;
      const t = TT[STT[s]];
      ctx = ctx || {};
      let D;
      if (typeof t.drop === 'function') D = t.drop(s, ctx);
      else if (t.drop === null) D = null;
      else if (Array.isArray(t.drop)) D = t.drop;
      else if (typeof t.drop === 'string') D = [[t.drop, 1]];
      else D = [[typeof t.item === 'string' ? t.item : t.id, 1]];
      if (!D) return;
      if (t.slab && sv(s, 'type') === 2) D = [[t.id, 2]];
      for (const [id, n] of D) { if (n > 0 && IN[id]) spawnItem({ id: IN[id].idx, n }, x + .5 + (RNG() - .5) * .3, y + .4, z + .5 + (RNG() - .5) * .3, (RNG() - .5) * .2, .2, (RNG() - .5) * .2); }
      if (t.xp && !ctx.silk && !ctx.explosion) spawnXp(rr(t.xp[0], t.xp[1]), x + .5, y + .5, z + .5);
    }
    function breakBlock(x, y, z, byP) {
      const s = getS(x, y, z);
      if (!s) return;
      const t = TT[STT[s]];
      if (FLU[s] || (t.hard < 0 && !creative())) return;
      if (byP) stat('mined');
      burst(x, y, z, s, 16);
      playBlockSnd(s, 'break', x, y, z);
      const tl = toolOf(held());
      const ctx = { silk: false, shears: tl && tl.k === 'shears', tool: tl, fortune: 0 };
      if (t.door) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0, 0); }
      if (t.bed) { const hd = sv(s, 'part'), q = fq(s), d = F4D[q], ox = hd ? -d[0] : d[0], oz = hd ? -d[1] : d[1]; const o = getS(x + ox, y, z + oz); if (TT[STT[o]] === t) setBlock(x + ox, y, z + oz, 0); }
      if (t.tall) { const up = sv(s, 'half'), oy = up ? -1 : 1; const o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, 0); }
      if (t.id === 'tall_seagrass') { }
      const wet = !t.fluid && (FLU[getS(x, y + 1, z)] === 1 && false);
      void wet;
      if (byP && !creative() && canHarvest(t)) { if (t.tags.has('leaves') || t.id === 'short_grass' || t.id === 'fern' || t.id === 'tall_grass') dropBlock(s, x, y, z, ctx); else dropBlock(s, x, y, z, ctx); }
      removeBlockEntity(x, y, z, byP && !creative());
      if (t.id === 'ice' && byP && !creative() && SOL[getS(x, y - 1, z)]) setBlock(x, y, z, S('water', { level: 0 }));
      else setBlock(x, y, z, t.water && t.id !== 'kelp' && t.id !== 'kelp_plant' ? S('water', { level: 0 }) : (t.id === 'kelp' || t.id === 'kelp_plant' || t.id === 'seagrass' || t.id === 'tall_seagrass') ? S('water', { level: 0 }) : 0);
      if (byP && !creative()) { if (t.hard > 0) damageTool(IT[held()?.id]?.tool?.k === 'sword' ? 2 : 1); exhaust(CFG.EXH_MINE); }
    }
    function playBlockSnd(s, kind, x, y, z) { const t = TT[STT[s]]; matSnd(t.snd, kind === 'break' ? 2 : kind === 'place' ? 2 : kind === 'hit' ? 1 : 0, x != null ? { x: x + .5, y: y + .5, z: z + .5 } : null); }
    const boxHit = (e, x, y, z) => x < e.x + e.w / 2 && x + 1 > e.x - e.w / 2 && y < e.y + e.h && y + 1 > e.y && z < e.z + e.w / 2 && z + 1 > e.z - e.w / 2;
    const horizQ = () => { const a = ((P.yaw % 6.2832) + 6.2832) % 6.2832; return [0, 3, 2, 1][Math.round(a / (Math.PI / 2)) & 3]; };
    const dirFacing6 = () => { if (P.pitch > .79) return 4; if (P.pitch < -.79) return 5; return horizQ(); };
    const supportOK = (x, y, z, f) => { const s = getS(x, y, z); return FULLT[s] || (f === 2 && (TT[STT[s]].slab && sv(s, 'type') !== 0 || TT[STT[s]].stair && sv(s, 'half') === 1 || (TT[STT[s]].tags.has('fence') || TT[STT[s]].tags.has('wall')))); };
    const DIRTLIKE = new Set(['grass_block', 'dirt', 'coarse_dirt', 'podzol', 'rooted_dirt', 'mycelium', 'farmland', 'moss_block', 'pale_moss_block', 'mud', 'muddy_mangrove_roots']);
    function placementState(t, x, y, z, hit) {
      let s = S(t.id);
      if (LEAF[s] && t.pk.persistent !== undefined) s = sw(s, 'persistent', 1);
      const f = hit.f, hy = hit.py - Math.floor(hit.py), q = horizQ();
      const below = getS(x, y - 1, z), bt = TT[STT[below]];
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 4) {
        if (t.stair) s = sw(sw(s, 'facing', q), 'half', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
        else if (t.door || t.gate || t.bed) s = sw(s, 'facing', q);
        else if (t.id.includes('trapdoor')) { if (f >= 2 && f <= 3) s = sw(sw(s, 'facing', (q + 2) & 3), 'half', f === 3 ? 1 : 0); else s = sw(sw(s, 'facing', [5, 0, 4, 1].indexOf(f) >= 0 ? [1, 3, 2, 0][[0, 1, 4, 5].indexOf(f)] : 0), 'half', hy > .5 ? 1 : 0); }
        else if (t.torch || t.id === 'ladder' || t.id.endsWith('wall_sign') || t.id === 'tripwire_hook' || t.id === 'cocoa' || t.id === 'shelf_mushroom') { if (f < 2 || f > 3) s = sw(s, 'facing', [0, 1, 0, 0, 4, 5].indexOf(f) < 0 ? 0 : [1, 3, -1, -1, 2, 0][f]); }
        else if (t.pk.face !== undefined) { const fc = f === 2 ? 0 : f === 3 ? 2 : 1; s = sw(s, 'face', fc); s = sw(s, 'facing', fc === 1 ? [1, 3, -1, -1, 2, 0][f] : q); }
        else s = sw(s, 'facing', (q + 2) & 3);
      }
      if (t.pk.facing !== undefined && t.props[t.pk.facing][1].length === 6) {
        if (t.place6 === 2) { const d = dirFacing6(); s = sw(s, 'facing', d < 4 ? (d + 2) & 3 : d === 4 ? 5 : 4); }
        else s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
        if (t.id === 'end_rod' || t.id === 'lightning_rod' || t.id.includes('amethyst')) s = sw(s, 'facing', [1, 3, 4, 5, 2, 0][f]);
      }
      if (t.id === 'hopper') s = sw(s, 'facing', f === 2 ? 0 : [4, 3, 0, 0, 2, 1][f]);
      if (t.pk.axis !== undefined) { const ax = f < 2 ? 1 : f < 4 ? 0 : 2; s = sw(s, 'axis', t.props[t.pk.axis][1].length === 2 ? (ax === 1 ? 0 : 1) : ax); }
      if (t.pk.rotation !== undefined) { const a = ((P.yaw + Math.PI) / (Math.PI * 2) * 16); s = sw(s, 'rotation', ((Math.round(-a) % 16) + 16 + 8) % 16); }
      if (t.slab) s = sw(s, 'type', f === 3 || (f !== 2 && hy > .5) ? 1 : 0);
      if (t.pk.hanging !== undefined) s = sw(s, 'hanging', f === 3 ? 1 : 0);
      if (t.id === 'pointed_dripstone') s = sw(s, 'vertical_direction', f === 3 ? 0 : 1);
      if (t.id === 'glow_lichen') s = sw(s, 'face', [5, 4, 0, 1, 3, 2][f]);
      if (t.id === 'vine') { if (f < 2 || f > 3) { const k = [3, 1, 0, 0, 0, 2][f]; s = S('vine', { [FACE4[k]]: true }); } else if (f === 3) s = S('vine', { up: true }); else return null; }
      if (t.sign && !t.id.includes('wall') && !t.id.includes('hanging') && f !== 2) { const wt = TN[t.id.replace('_sign', '_wall_sign')]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.torch && f !== 2) { if (f === 3) return null; const wt = TN['wall_' + t.id]; if (!wt) return null; s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); if (t.ctexL) s = sw(s, 'lit', 1); }
      if (t.head && f !== 2 && f !== 3) { const wt = TN[t.id.replace(/_(skull|head)$/, '_wall_$1')]; if (wt) s = sw(wt.base, 'facing', [1, 3, 0, 0, 2, 0][f]); }
      if (t.id === 'grass_block' || t.id === 'podzol' || t.id === 'mycelium') { if (isT(getS(x, y + 1, z), 'snow')) s = sw(s, 'snowy', 1); }
      if (t.attach === 1 && !(t.torch && f === 2) && t.pk.face === undefined) { const d = DIR6[OPP6[f]]; if (!supportOK(x + d[0], y + d[1], z + d[2], f)) { if (t.torch && f === 2 && supportOK(x, y - 1, z, 2)) { } else if (!(t.torch && f === 2)) return null; } }
      if (t.torch && f === 2 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.id === 'ladder' && (f < 2 || f > 3) && !FULLT[getS(x - DIR6[f][0], y, z - DIR6[f][2])]) return null;
      if (t.id === 'ladder' && (f === 2 || f === 3)) return null;
      if (t.pk.face !== undefined && t.attach) { const fc = sv(s, 'face'), d = fc === 0 ? [0, -1, 0] : fc === 2 ? [0, 1, 0] : DIR6[OPP6[f]]; if (!FULLT[getS(x + d[0], y + d[1], z + d[2])]) return null; }
      if (t.attach === 3 && !supportOK(x, y - 1, z, 2)) return null;
      if (t.attach === 4 && !FULLT[getS(x, y + 1, z)] && !(t.id === 'pale_hanging_moss' && (isT(getS(x, y + 1, z), 'pale_hanging_moss') || LEAF[getS(x, y + 1, z)]))) return null;
      if (t.plant && !t.water && t.id !== 'cobweb' && t.attach !== 4 && t.id !== 'pointed_dripstone') {
        if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { if (!isT(below, t.soil || 'farmland')) return null; }
        else if (t.id === 'dead_bush' || t.id === 'short_dry_grass' || t.id === 'tall_dry_grass' || t.id === 'cactus_flower') { if (!DIRTLIKE.has(bt.id) && !bt.id.includes('sand') && !bt.id.includes('terracotta') && !(t.id === 'cactus_flower' && bt.id === 'cactus')) return null; }
        else if (t.id.includes('mushroom') && t.id !== 'shelf_mushroom') { if (!FULLT[below]) return null; }
        else if (t.id.includes('fungus') || t.id.includes('roots') || t.id === 'nether_sprouts') { if (!bt.id.includes('nylium') && !DIRTLIKE.has(bt.id) && bt.id !== 'soul_soil') return null; }
        else if (t.id === 'sugar_cane') { if (!(isT(below, 'sugar_cane') || ((DIRTLIKE.has(bt.id) || bt.id.includes('sand')) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, c]) => FLU[getS(x + a, y - 1, z + c)] === 1 || isT(getS(x + a, y - 1, z + c), 'frosted_ice'))))) return null; }
        else if (t.id === 'sweet_berry_bush' || t.sapling || t.flower || t.tall || t.id === 'short_grass' || t.id === 'fern' || t.id === 'bush' || t.id === 'firefly_bush' || t.id === 'red_shrub' || t.id.includes('petals') || t.id === 'wildflowers' || t.id === 'leaf_litter') { if (!DIRTLIKE.has(bt.id) && !(t.id === 'leaf_litter' && FULLT[below])) return null; }
        else if (t.id.includes('coral')) { if (!FULLT[below]) return null; }
      }
      if (t.id === 'cactus') { if (!(isT(below, 'cactus') || bt.id === 'sand' || bt.id === 'red_sand')) return null; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (SOL[getS(x + a, y, z + c)]) return null; }
      if (t.id === 'bamboo' && !(isT(below, 'bamboo') || DIRTLIKE.has(bt.id) || bt.id.includes('sand') || bt.id === 'gravel')) return null;
      if (t.id === 'lily_pad' || t.id === 'frogspawn') { if (FLU[below] !== 1 && !isT(below, 'ice')) return null; }
      if (t.water && !t.id.includes('dead')) { const cur = getS(x, y, z); if (FLU[cur] !== 1) { if (t.id.includes('coral')) { } else return null; } }
      if (t.id === 'nether_wart' && !isT(below, 'soul_sand')) return null;
      if (t.id === 'cocoa') { if (f < 2 || f > 3) { const d = DIR6[OPP6[f]]; if (!isT(getS(x + d[0], y, z + d[2]), 'jungle_log') && !isT(getS(x + d[0], y, z + d[2]), 'jungle_wood') && !isT(getS(x + d[0], y, z + d[2]), 'stripped_jungle_log')) return null; s = sw(S('cocoa'), 'facing', [1, 3, 0, 0, 2, 0][f]); } else return null; }
      return s;
    }
    function placeBlock(it, hit, offhandUse) {
      let x = hit.x, y = hit.y, z = hit.z;
      const tgt = getS(x, y, z), tt = TT[STT[tgt]];
      const t = TN[it.place];
      if (!t) return false;
      if (t.slab && tt === t && sv(tgt, 'type') !== 2 && ((sv(tgt, 'type') === 0 && hit.f === 2) || (sv(tgt, 'type') === 1 && hit.f === 3))) { setBlock(x, y, z, sw(tgt, 'type', 2)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'snow' && tt === t && sv(tgt, 'layers') < 7) { setBlock(x, y, z, sw(tgt, 'layers', sv(tgt, 'layers') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id.endsWith('candle') && tt === t && sv(tgt, 'candles') < 3) { setBlock(x, y, z, sw(tgt, 'candles', sv(tgt, 'candles') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if ((t.id === 'pink_petals' || t.id === 'wildflowers') && tt === t && sv(tgt, 'flower_amount') < 3) { setBlock(x, y, z, sw(tgt, 'flower_amount', sv(tgt, 'flower_amount') + 1)); playBlockSnd(tgt, 'place', x, y, z); return true; }
      if (t.id === 'sea_pickle' && tt === t && sv(tgt, 'pickles') < 3) { setBlock(x, y, z, sw(tgt, 'pickles', sv(tgt, 'pickles') + 1)); return true; }
      if (!REP[tgt] || (tt === t && !t.repl) || (tt.id === 'snow' && sv(tgt, 'layers') > 0)) { x += hit.fx; y += hit.fy; z += hit.fz; }
      if (y < 0 || y >= H - 1) return false;
      const cur = getS(x, y, z), ct = TT[STT[cur]];
      if (!REP[cur] && !(FLU[cur] && FLU[cur] !== 0)) return false;
      if (ct.tall && REP[cur]) { const up = sv(cur, 'half'); setBlock(x, y + (up ? -1 : 1), z, 0); }
      if (t.slab && TT[STT[cur]] === t) { }
      const H2 = { f: hit.f, py: hit.py, fx: hit.fx, fy: hit.fy, fz: hit.fz };
      if (hit.x !== x || hit.y !== y || hit.z !== z) { }
      let s = placementState(t, x, y, z, H2);
      if (s === null || s === undefined) return false;
      if (it.placeAge === 0) s = sw(s, 'age', 0);
      if (TT[STT[s]].id === 'redstone_wire') s = S('redstone_wire');
      const solid = SOL[s] && !(SOL[s] === 2 && COLL[s] && !COLL[s].length);
      if (solid) for (const pl of playersList()) if (boxHit(pl, x, y, z) && SOL[s] && (SOL[s] === 1 || (blockBoxes(s, x, y, z) || []).some(b => b[4] - b[1] > .2))) return false;
      if (solid) for (const e of ENTS) if (e.kind === 'mob' && !e.dead && boxHit(e, x, y, z)) return false;
      if (t.door) { if (!REP[getS(x, y + 1, z)] || !supportOK(x, y - 1, z, 2)) return false; const q = sv(s, 'facing'), L = F4D[(q + 3) & 3], R = F4D[(q + 1) & 3]; const lt = TT[STT[getS(x + L[0], y, z + L[1])]], rt = TT[STT[getS(x + R[0], y, z + R[1])]]; let hinge = 0; if (lt.door && !rt.door) hinge = 1; else { const hx2 = hit.px - Math.floor(hit.px), hz2 = hit.pz - Math.floor(hit.pz); const side = q === 0 ? hx2 > .5 : q === 1 ? hz2 > .5 : q === 2 ? hx2 < .5 : hz2 < .5; if (!lt.door && !rt.door && side) hinge = 1; } s = sw(s, 'hinge', hinge); setBlock(x, y, z, s); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else if (t.bed) { const q = sv(s, 'facing'), d = F4D[q]; if (!REP[getS(x + d[0], y, z + d[1])] || !supportOK(x, y - 1, z, 2)) return false; setBlock(x, y, z, sw(s, 'part', 0)); setBlock(x + d[0], y, z + d[1], sw(s, 'part', 1)); }
      else if (t.tall) { if (!REP[getS(x, y + 1, z)]) return false; setBlock(x, y, z, sw(s, 'half', 0)); setBlock(x, y + 1, z, sw(s, 'half', 1)); }
      else setBlock(x, y, z, s);
      if (t.cont || t.use === 'furnace' || t.sign) initBlockEntity(x, y, z, t, it);
      playBlockSnd(s, 'place', x, y, z); swing();
      if (!creative()) { const st = offhandUse ? offhand : held(); if (st && --st.n <= 0) { if (offhandUse) offhand = null; else inv[sel] = null; } }
      if (hooks.afterPlace) hooks.afterPlace(x, y, z, s);
      if (t.sign) openSign(x, y, z);
      return true;
    }
    function attackMob(e) {
      const st = held(), it = st ? IT[st.id] : null;
      let dmg = it && it.dmg ? it.dmg : 1;
      const cd = atkCooldown(), charge = clamp((tickN - P.atkT) / cd, 0, 1);
      dmg *= .2 + charge * charge * .8;
      const crit = charge > .9 && P.fall > 0 && !P.onGround && !P.fly && !P.eyeW && !P.climbing;
      if (crit) dmg *= 1.5;
      P.atkT = tickN;
      const kbS = P.sprint && charge > .9;
      const kx = -Math.sin(P.yaw), kz = -Math.cos(P.yaw);
      if (e.kind === 'player') { netSendTo(e.pid, { t: 'hurt', d: dmg, sx: P.x, sz: P.z, k: 'player', by: P.name }); }
      else { stat('dmgD', dmg); e.pHit = tickN; hurtEnt(e, dmg, P, 'player', kx, kz); }
      if (kbS && e.kind === 'mob') { e.vx += kx * .5; e.vz += kz * .5; e.vy += .1; P.vx *= .6; P.vz *= .6; P.sprint = false; }
      if (crit) for (let i = 0; i < 12; i++) particle(e.x, e.y + e.h * .7, e.z, (RNG() - .5) * 4, RNG() * 3, (RNG() - .5) * 4, [255, 255, 230], .5, .06, 6, 1);
      if (it && it.dur) damageTool(it.tool && it.tool.k === 'sword' ? 1 : 2);
      exhaust(CFG.EXH_ATTACK);
      snd(crit ? 'crit' : charge > .9 ? 'hit_strong' : 'hit_weak', e);
    }
    const atkCooldown = () => { const st = held(); const sp = st && IT[st.id].aspd ? IT[st.id].aspd : 4; return 20 / sp; };
    function interactMob(e) {
      const st = held(), it = st ? IT[st.id] : null, T = MT[e.type];
      if (e.kind !== 'mob') return false;
      if (it && it.egg) return false;
      if (it && T.breed && T.breed.includes(it.id) && !e.baby && e.breedCd === 0 && e.love === 0) { netOrLocal('love', e, () => { e.love = 600; for (let i = 0; i < 5; i++) particle(e.x, e.y + e.h, e.z, (RNG() - .5), 1, (RNG() - .5), [255, 80, 120], .8, .1, -.5, 1); }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (it && T.breed && T.breed.includes(it.id) && e.baby) { e.babyT -= 2400; if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.id === 'shears' && !e.sheared && !e.baby) { netOrLocal('shear', e, () => { e.sheared = true; e.wool.root.visible = false; spawnItem({ id: IN[e.color + '_wool'].idx, n: 1 + ri(3) }, e.x, e.y + 1, e.z); }); snd('shear', e); damageTool(1); swing(); return true; }
      if (e.type === 'sheep' && it && it.dye && e.color !== it.dye && !e.sheared) { netOrLocal('dye:' + it.dye, e, () => { e.color = it.dye; }); if (!creative()) consumeHeld(1); swing(); return true; }
      if (e.type === 'cow' && it && it.id === 'bucket') { consumeHeld(1, { id: IN.milk_bucket.idx, n: 1 }); snd('milk', e); swing(); return true; }
      return false;
    }
    function consumeHeld(n, rep) {
      const st = held(); if (!st) return;
      if (creative()) { if (rep) giveOrDrop(rep); return; }
      st.n -= n;
      if (st.n <= 0) inv[sel] = rep || null; else if (rep) giveOrDrop(rep);
    }
    function useItem(st, hitB) {
      const it = IT[st.id];
      if (it.food && (it.food.always || P.food < 20 || creative())) { if (!eating) eating = { id: st.id, t: 0, dur: it.food.fast ? 16 : it.id === 'honey_bottle' ? 40 : CFG.EAT_TICKS }; return true; }
      if (it.drink) { if (!eating) eating = { id: st.id, t: 0, dur: 32, drink: 1 }; return true; }
      if (it.bow) { const hasA = creative() || inv.some(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx)) || (offhand && offhand.id === IN.arrow.idx); if (hasA && !drawing) drawing = { t: 0, id: st.id }; return true; }
      if (it.crossbow) { if (!st.x || !st.x.loaded) { if (!drawing) drawing = { t: 0, id: st.id, cb: 1 }; } else { fireArrow(3.15, 9); st.x = null; damageTool(1); } return true; }
      if (it.trident) { if (!drawing) drawing = { t: 0, id: st.id, tri: 1 }; return true; }
      if (it.throwable) { const sp = it.throwable === 'ender_pearl' ? 1.5 : it.throwable === 'splash' ? .5 : 1.5, cp = Math.cos(P.pitch); spawnThrownNet(it.throwable, P.x - Math.sin(P.yaw) * .3, P.y + P.eye - .1, P.z - Math.cos(P.yaw) * .3, -Math.sin(P.yaw) * cp * sp + P.vx, Math.sin(P.pitch) * sp + (P.onGround ? 0 : P.vy), -Math.cos(P.yaw) * cp * sp + P.vz); snd('throw'); consumeHeld(1); swing(); useCd = it.throwable === 'ender_pearl' ? 20 : 4; return true; }
      if (it.armor && !hitB) { const sl = it.armor.slot; const cur = armor[sl]; armor[sl] = { ...st, n: 1 }; inv[sel] = cur || (st.n > 1 ? { ...st, n: st.n - 1 } : null); snd('equip'); return true; }
      if (it.egg && hitB) { const hx2 = HIT.x + HIT.fx + .5, hy = HIT.y + HIT.fy, hz2 = HIT.z + HIT.fz + .5; spawnMobNet(it.egg, hx2, hy, hz2); consumeHeld(1); swing(); return true; }
      if (it.bucket) return useBucket(st, it);
      if (it.shield) { shielding = true; return true; }
      if (it.spyglass) { P.zoom = true; return true; }
      return false;
    }
    function spawnMobNet(type, x, y, z) { if (NET.role === 'guest') netSend({ t: 'spawn', m: type, x, y, z }); else { const e = spawnMob(type, x, y, z, { persist: true }); if (e) e.yaw = P.yaw + Math.PI; } }
    function spawnThrownNet(type, x, y, z, vx, vy, vz) { if (NET.role === 'guest') netSend({ t: 'throw', ty: type, x, y, z, vx, vy, vz }); else spawnThrown(type, x, y, z, vx, vy, vz, P); }
    function fireArrow(v, base) {
      let ai = inv.findIndex(s => s && (s.id === IN.arrow.idx || s.id === IN.spectral_arrow.idx || s.id === IN.tipped_arrow.idx));
      if (offhand && offhand.id === IN.arrow.idx) ai = -2;
      if (ai < 0 && ai !== -2 && !creative()) return false;
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      const x = P.x + dx * .3, y = P.y + P.eye - .1, z = P.z + dz * .3, sp = v;
      if (NET.role === 'guest') netSend({ t: 'arrow', x, y, z, vx: dx * sp, vy: dy * sp, vz: dz * sp, d: base || 2, p: !creative() });
      else spawnArrow(x, y, z, dx * sp, dy * sp, dz * sp, P, base || 2, !creative());
      if (!creative()) { if (ai === -2) { if (--offhand.n <= 0) offhand = null; } else if (ai >= 0 && --inv[ai].n <= 0) inv[ai] = null; }
      snd('bow');
      return true;
    }
    function useBucket(st, it) {
      const cp = Math.cos(P.pitch), dx = -Math.sin(P.yaw) * cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * cp;
      raycast(EX, EY, EZ, dx, dy, dz, reach(), true, null);
      if (!HIT.b) return false;
      const s = getS(HIT.x, HIT.y, HIT.z), t = TT[STT[s]];
      if (it.bucket === 'empty') {
        if (FLU[s] && ((s - t.base) & 15) === 0) { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN[FLU[s] === 1 ? 'water_bucket' : 'lava_bucket'].idx, n: 1 }); snd(FLU[s] === 1 ? 'bucket_fill' : 'bucket_fill_lava'); swing(); return true; }
        if (t.id === 'powder_snow') { setBlock(HIT.x, HIT.y, HIT.z, 0); consumeHeld(1, { id: IN.powder_snow_bucket.idx, n: 1 }); return true; }
        if (t.id === 'cauldron' && sv(s, 'level') === 3) { const ct = sv(s, 'content'); setBlock(HIT.x, HIT.y, HIT.z, S('cauldron')); consumeHeld(1, { id: IN[['water_bucket', 'lava_bucket', 'powder_snow_bucket'][ct]].idx, n: 1 }); snd('bucket_fill'); return true; }
        return false;
      }
      if (t.id === 'cauldron' && (it.bucket === 'water' || it.bucket === 'lava' || it.bucket === 'powder_snow')) { setBlock(HIT.x, HIT.y, HIT.z, S('cauldron', { level: 3, content: it.bucket })); if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 }; snd('bucket_empty'); return true; }
      let x = HIT.x, y = HIT.y, z = HIT.z;
      if (!REP[s] || (FLU[s] && it.bucket !== (FLU[s] === 1 ? 'water' : 'lava'))) { x += HIT.fx; y += HIT.fy; z += HIT.fz; }
      const cur = getS(x, y, z);
      if (!REP[cur] && !FLU[cur]) return false;
      if (it.bucket === 'water' && W.dim === 'nether') { snd('fizz'); }
      else setBlock(x, y, z, it.bucket === 'powder_snow' ? S('powder_snow') : S(it.bucket, { level: 0 }));
      if (it.mobB && NET.role !== 'guest') { }
      if (!creative()) inv[sel] = { id: IN.bucket.idx, n: 1 };
      snd(it.bucket === 'lava' ? 'bucket_empty_lava' : 'bucket_empty'); swing();
      return true;
    }
    function useOnBlock(st, x, y, z, f) {
      const s = getS(x, y, z), t = TT[STT[s]], it = st ? IT[st.id] : null;
      if (it && it.boneMeal) { if (boneMeal(x, y, z, s, t)) { consumeHeld(1); swing(); for (let i = 0; i < 12; i++) particle(x + RNG(), y + RNG() * .8 + .2, z + RNG(), 0, .5, 0, [120, 220, 120], .8, .06, -.2, 1); return true; } }
      if (it && it.tool && it.tool.k === 'hoe' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'dirt_path' || t.id === 'coarse_dirt' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, t.id === 'coarse_dirt' ? S('dirt') : t.id === 'rooted_dirt' ? S('dirt') : S('farmland')); if (t.id === 'rooted_dirt') spawnItem({ id: IN.hanging_roots.idx, n: 1 }, x + .5, y + 1.2, z + .5); snd('hoe'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'grass_block' || t.id === 'dirt' || t.id === 'podzol' || t.id === 'coarse_dirt' || t.id === 'mycelium' || t.id === 'rooted_dirt') && f !== 3 && !SOL[getS(x, y + 1, z)]) { setBlock(x, y, z, S('dirt_path')); snd('shovel'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'shovel' && (t.id === 'campfire' || t.id === 'soul_campfire') && sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); damageTool(1); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.strip && TN[t.strip]) { setBlock(x, y, z, sw(TN[t.strip].base, 'axis', sv(s, 'axis'))); snd('strip'); damageTool(1); swing(); return true; }
      if (it && it.tool && it.tool.k === 'axe' && t.ox !== undefined) { const nm = t.id; if (nm.startsWith('waxed_')) { setBlock(x, y, z, sameProps(s, TN[nm.slice(6)])); snd('wax_off'); damageTool(1); swing(); return true; } const pre = ['exposed_', 'weathered_', 'oxidized_'], i = pre.findIndex(p => nm.startsWith(p)); if (i >= 0) { const base = nm.slice(pre[i].length), nn = (i ? pre[i - 1] : '') + (base === 'copper' && !i ? 'copper_block' : base); if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); snd('scrape'); damageTool(1); swing(); return true; } } }
      if (it && it.id === 'honeycomb' && t.ox !== undefined && !t.id.startsWith('waxed_')) { const nn = 'waxed_' + t.id; if (TN[nn]) { setBlock(x, y, z, sameProps(s, TN[nn])); consumeHeld(1); snd('wax_on'); swing(); return true; } }
      if (it && (it.ignite) && (t.tnt)) { setBlock(x, y, z, 0); if (NET.role !== 'guest') spawnTNT(x, y, z); else netSend({ t: 'tnt', x, y, z }); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite && (t.id === 'campfire' || t.id === 'soul_campfire' || t.id.endsWith('candle')) && !sv(s, 'lit')) { setBlock(x, y, z, sw(s, 'lit', 1)); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; }
      if (it && it.ignite) { const d = DIR6[f], nx = x + d[0], ny = y + d[1], nz2 = z + d[2]; if (REP[getS(nx, ny, nz2)] && !FLU[getS(nx, ny, nz2)]) { const soul = isT(getS(nx, ny - 1, nz2), 'soul_sand') || isT(getS(nx, ny - 1, nz2), 'soul_soil'); if (isT(s, 'obsidian') && tryPortal(nx, ny, nz2)) { } else setBlock(nx, ny, nz2, S(soul ? 'soul_fire' : 'fire')); snd('ignite'); if (it.ignite === 1) damageTool(1); else consumeHeld(1); swing(); return true; } }
      if (it && it.id === 'glass_bottle' && FLU[getS(x + DIR6[f][0], y + DIR6[f][1], z + DIR6[f][2])] === 1) { consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; }
      if (it && it.tool && it.tool.k === 'shears' && t.id === 'pumpkin') { setBlock(x, y, z, sw(S('carved_pumpkin'), 'facing', horizQ() + 2 & 3)); spawnItem({ id: IN.pumpkin_seeds.idx, n: 4 }, x + .5, y + 1, z + .5); damageTool(1); snd('shear'); return true; }
      return false;
    }
    function sameProps(s, nt) { const t = TT[STT[s]]; let n = nt.base; for (const [k] of t.props) if (nt.pk[k] !== undefined) n = sw(n, k, sv(s, k)); return n; }
    function tryPortal(x, y, z) { void x; void y; void z; return false; }
    function boneMeal(x, y, z, s, t) {
      if (NET.role === 'guest') { netSend({ t: 'bonemeal', x, y, z }); return t.crop || t.sapling || t.id === 'grass_block'; }
      if (t.crop === 'farm' || t.crop === 'stem' || t.id === 'torchflower_crop') { const m = t.maxAge, a = sv(s, 'age'); if (a >= m) return false; setBlock(x, y, z, sw(s, 'age', Math.min(m, a + rr(2, 5)))); return true; }
      if (t.crop === 'berry') { const a = sv(s, 'age'); if (a >= 3) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.id === 'cocoa') { const a = sv(s, 'age'); if (a >= 2) return false; setBlock(x, y, z, sw(s, 'age', a + 1)); return true; }
      if (t.sapling) { if (RNG() < .45) growTree(x, y, z, t.sapling); return true; }
      if (t.id === 'grass_block') { for (let i = 0; i < 40; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3; let gy = y + 1; if (isT(getS(gx, gy - 1, gz), 'grass_block') && !getS(gx, gy, gz)) { const r = RNG(); setBlock(gx, gy, gz, r < .8 ? S('short_grass') : r < .9 ? S(['dandelion', 'poppy'][ri(2)]) : S('short_grass')); } } return true; }
      if (t.id === 'short_grass' || t.id === 'fern') { if (!getS(x, y + 1, z)) { const tn = t.id === 'fern' ? 'large_fern' : 'tall_grass'; setBlock(x, y, z, S(tn, { half: 'bottom' })); setBlock(x, y + 1, z, S(tn, { half: 'top' })); } return true; }
      if (t.flower && !t.tall && t.id !== 'wither_rose') { for (let i = 0; i < 8; i++) { const gx = x + ri(5) - 2, gz = z + ri(5) - 2; if (isT(getS(gx, y - 1, gz), 'grass_block') && !getS(gx, y, gz)) setBlock(gx, y, gz, s); } return true; }
      if (t.tall && t.flower !== undefined || t.id === 'sunflower' || t.id === 'lilac' || t.id === 'rose_bush' || t.id === 'peony') { spawnItem({ id: IN[t.id].idx, n: 1 }, x + .5, y + .5, z + .5); return true; }
      if (t.id === 'shelf_mushroom' && sv(s, 'size') === 0) { setBlock(x, y, z, sw(s, 'size', 1)); return true; }
      if (t.id === 'moss_block') { for (let i = 0; i < 30; i++) { const gx = x + ri(7) - 3, gz = z + ri(7) - 3, gy = y + ri(3) - 1; const b = getS(gx, gy, gz); if ((isT(b, 'stone') || isT(b, 'dirt') || isT(b, 'grass_block')) && !getS(gx, gy + 1, gz)) setBlock(gx, gy, gz, S('moss_block')); } return true; }
      if (t.id === 'sugar_cane' || t.id === 'cactus' || t.id === 'bamboo') { let top = y; while (TT[STT[getS(x, top + 1, z)]] === t) top++; if (!getS(x, top + 1, z)) { setBlock(x, top + 1, z, t.base); return true; } }
      if (t.id === 'kelp' || t.id === 'kelp_plant') { let top = y; while (isT(getS(x, top + 1, z), 'kelp') || isT(getS(x, top + 1, z), 'kelp_plant')) top++; if (FLU[getS(x, top + 1, z)] === 1) { setBlock(x, top, z, S('kelp_plant')); setBlock(x, top + 1, z, S('kelp')); return true; } }
      return false;
    }
    let EX = 0, EY = 0, EZ = 0;
    const reach = () => mode() === 'creative' ? CFG.REACH_CREATIVE : CFG.REACH;
    const LDIR = [0, 0, 0];
    function lookDir() { const cp = Math.cos(P.pitch); LDIR[0] = -Math.sin(P.yaw) * cp; LDIR[1] = Math.sin(P.pitch); LDIR[2] = -Math.cos(P.yaw) * cp; return LDIR; }
    function attackPress() {
      if (P.dead || gui || scr !== 'game') return;
      swing();
      if (mode() === 'spectator') return;
      if (HIT.ent) { attackMob(HIT.ent); return; }
      if (!HIT.b) { P.atkT = tickN; return; }
      if (mode() === 'adventure') return;
      const s = getS(HIT.x, HIT.y, HIT.z);
      if (creative()) { const h = held(); if (h && IT[h.id].tool && IT[h.id].tool.k === 'sword') return; breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; return; }
      if (relHard(s) >= 1) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; mine = null; }
    }
    function breakNet(x, y, z) {
      breakBlock(x, y, z, true);
    }
    function usePress() {
      if (P.dead || gui || scr !== 'game') return;
      doUse(); useCd = CFG.USE_DELAY;
    }
    function doUse() {
      if (mode() === 'spectator') return;
      const st = held();
      if (HIT.ent) { if (interactMob(HIT.ent)) return; }
      if (HIT.b && !(P.sneak && st)) { if (useBlock(HIT.x, HIT.y, HIT.z)) { swing(); return; } }
      if (HIT.b && st && canBuild()) { if (useOnBlock(st, HIT.x, HIT.y, HIT.z, HIT.f)) return; }
      if (HIT.b && st && !IT[st.id].place && IT[st.id].bucket) { if (useItem(st, true)) return; }
      if (st && useItem(st, HIT.b)) return;
      if (st && HIT.b && IT[st.id].place && canBuild()) { placeBlock(IT[st.id], HIT, false); return; }
      if (!st && offhand && HIT.b && IT[offhand.id].place && canBuild()) { placeBlock(IT[offhand.id], HIT, true); return; }
      if (offhand && IT[offhand.id].shield) shielding = true;
    }
    function useBlock(x, y, z) {
      const s = getS(x, y, z), t = TT[STT[s]], u = t.use;
      if (!u) return false;
      if (u === 'craft') { openGui('table'); return true; }
      if (u === 'furnace') { openContainer(x, y, z, 'furnace'); return true; }
      if (u === 'chest') { if (t.cont && SOL[getS(x, y + 1, z)] === 1 && t.id.includes('chest') && !t.shulker) return true; openContainer(x, y, z, t.cont === 9 ? 'dispenser' : t.cont === 5 ? 'hopper' : 'chest'); snd('chest_open', { x, y, z }); if (t.id === 'barrel') setBlock(x, y, z, sw(s, 'open', 1)); return true; }
      if (u === 'ender') { openGui('ender'); snd('chest_open', { x, y, z }); return true; }
      if (u === 'stonecutter') { openGui('stonecutter'); return true; }
      if (u === 'door' || u === 'trapdoor' || u === 'gate') {
        if (mode() === 'spectator') return false;
        const ns = sw(s, 'open', sv(s, 'open') ? 0 : 1);
        if (u === 'gate' && !sv(s, 'open')) { const q = fq(s), pq = horizQ(); if ((q & 1) === (pq & 1) && q !== pq) setBlock(x, y, z, sw(ns, 'facing', pq)); else setBlock(x, y, z, ns); }
        else setBlock(x, y, z, ns);
        if (u === 'door') { const oy = sv(s, 'half') ? -1 : 1, o = getS(x, y + oy, z); if (TT[STT[o]] === t) setBlock(x, y + oy, z, sw(o, 'open', sv(ns, 'open'))); }
        snd(sv(ns, 'open') ? 'door_open' : 'door_close', { x, y, z });
        return true;
      }
      if (u === 'idoor') return false;
      if (u === 'lever') { setBlock(x, y, z, sw(s, 'powered', sv(s, 'powered') ? 0 : 1)); snd('click', { x, y, z }); redstoneAround(x, y, z); return true; }
      if (u === 'button') { if (sv(s, 'powered')) return true; setBlock(x, y, z, sw(s, 'powered', 1)); snd('click', { x, y, z }); schedule(x, y, z, t.btnTime || 20, 'button'); redstoneAround(x, y, z); return true; }
      if (u === 'repeater') { setBlock(x, y, z, sw(s, 'delay', (sv(s, 'delay') + 1) & 3)); snd('click', { x, y, z }); return true; }
      if (u === 'daylight') { setBlock(x, y, z, sw(s, 'inverted', sv(s, 'inverted') ? 0 : 1)); return true; }
      if (u === 'note') { const n = (sv(s, 'note') + (P.sneak ? 0 : 1)) % 25; setBlock(x, y, z, sw(s, 'note', n)); noteSnd(n, getS(x, y - 1, z), { x, y, z }); particle(x + .5, y + 1.2, z + .5, 0, .6, 0, [n * 10, 255 - n * 8, 120], .8, .15, 0, 1); return true; }
      if (u === 'bed') { trySleep(x, y, z, s, t); return true; }
      if (u === 'cake') { if (P.food < 20 || creative()) { P.food = Math.min(20, P.food + 2); P.sat = Math.min(P.food, P.sat + .4); snd('eat'); const b = sv(s, 'bites'); if (b >= 6) setBlock(x, y, z, 0); else setBlock(x, y, z, sw(s, 'bites', b + 1)); } return true; }
      if (u === 'composter') { const st = held(), l = sv(s, 'level'); if (l === 8) { setBlock(x, y, z, S('composter')); spawnItem({ id: IN.bone_meal.idx, n: 1 }, x + .5, y + 1.1, z + .5); snd('compost'); return true; } if (st && compostChance(IT[st.id]) > 0 && l < 7) { if (RNG() < compostChance(IT[st.id])) { setBlock(x, y, z, sw(s, 'level', l + 1)); if (l + 1 === 7) schedule(x, y, z, 20, 'compost'); } consumeHeld(1); snd('compost'); for (let i = 0; i < 4; i++) particle(x + .5, y + 1, z + .5, (RNG() - .5), .5, (RNG() - .5), [120, 200, 80], .5, .05, 6); return true; } return false; }
      if (u === 'cauldron') { const st = held(); if (!st) return false; const it = IT[st.id]; if (it.id === 'glass_bottle' && sv(s, 'level') && sv(s, 'content') === 0) { setBlock(x, y, z, sv(s, 'level') === 1 ? S('cauldron') : sw(s, 'level', sv(s, 'level') - 1)); consumeHeld(1, { id: IN.potion.idx, n: 1 }); snd('bottle_fill'); return true; } if (it.id === 'potion' && sv(s, 'level') < 3 && sv(s, 'content') === 0) { setBlock(x, y, z, S('cauldron', { level: sv(s, 'level') + 1, content: 'water' })); consumeHeld(1, { id: IN.glass_bottle.idx, n: 1 }); return true; } return false; }
      if (u === 'pot') { const st = held(), p = svn(s, 'plant'); if (p === 'none' && st) { const nm = IT[st.id].id, vals = t.props[0][1]; if (vals.includes(nm)) { setBlock(x, y, z, sw(s, 'plant', nm)); consumeHeld(1); return true; } return false; } if (p !== 'none' && !st) { inv[sel] = { id: IN[p].idx, n: 1 }; setBlock(x, y, z, S('flower_pot')); return true; } return false; }
      if (u === 'jukebox') { const be = beAt(x, y, z, true); if (be.disc) { spawnItem(be.disc, x + .5, y + 1.1, z + .5, 0, .2, 0); be.disc = null; stopDisc(); return true; } const st = held(); if (st && IT[st.id].disc) { be.disc = { ...st, n: 1 }; consumeHeld(1); playDisc(IT[st.id].disc, x, y, z); chatSys('Now Playing: C418 - ' + IT[st.id].desc); return true; } return false; }
      if (u === 'candle') { const st = held(); if (sv(s, 'lit') && !st) { setBlock(x, y, z, sw(s, 'lit', 0)); snd('fizz'); return true; } return false; }
      if (u === 'tnt') return false;
      if (u === 'sign') { openSign(x, y, z); return true; }
      if (u === 'enchant') { chatSys('Enchanting is not available yet.'); return true; }
      return false;
    }
    function compostChance(it) {
      if (!it) return 0;
      const n = it.id;
      if (/seeds|short_grass|kelp|sweet_berries|glow_berries|leaves|sapling|moss_carpet|hanging_roots|pitcher_pod|pink_petals|leaf_litter/.test(n)) return .3;
      if (/cactus|sugar_cane|vine|melon_slice|tall_grass|dry_grass|bush|shrub|wildflowers/.test(n)) return .5;
      if (/apple|beetroot|carrot|cocoa|potato|wheat|fern|mushroom|flower|lily_pad|melon|moss_block|pumpkin|sea_pickle|dandelion|poppy|tulip|orchid|allium|bluet|daisy|cornflower|lily_of|azalea|eyeblossom|shelf/.test(n)) return .65;
      if (/baked_potato|bread|cookie|hay_block|nether_wart/.test(n)) return .85;
      if (/cake|pumpkin_pie/.test(n)) return 1;
      return 0;
    }
    function trySleep(x, y, z, s, t) {
      const night = (W.time % 24000) > 12542 && (W.time % 24000) < 23460, storm = W.thunder;
      if (t.bed === 1) { P.spawn = [x + .5, y + 1, z + .5]; chatSys('Respawn point set'); }
      if (!night && !storm) { chatSys('You can only sleep at night or during thunderstorms'); return; }
      for (const e of ENTS) if (e.kind === 'mob' && MT[e.type].hostile && Math.abs(e.x - x) < 8 && Math.abs(e.y - y) < 5 && Math.abs(e.z - z) < 8) { chatSys('You may not rest now; there are monsters nearby'); return; }
      P.sleeping = 1; P.bedPos = [x, y, z]; P.x = x + .5; P.z = z + .5; P.y = y + .56; P.vx = P.vy = P.vz = 0;
      netSend({ t: 'sleep', v: 1 });
    }
    function wake() { if (!P.sleeping) return; P.sleeping = 0; const b = P.bedPos; if (b) { P.y = b[1] + .6; const bs = getS(b[0], b[1], b[2]); if (TT[STT[bs]].bed === 2) { setBlock(b[0], b[1], b[2], 0); } } netSend({ t: 'sleep', v: 0 }); }
    function tickInteract() {
      if (breakCd > 0) breakCd--;
      if (useCd > 0) useCd--;
      if (gui || P.dead) { mine = null; eating = null; drawing = null; shielding = false; return; }
      if (P.sleeping) return;
      const st = held();
      if (eating) {
        if (!useHeld || !st || st.id !== eating.id) eating = null;
        else {
          eating.t++;
          if (eating.t > 7 && eating.t % 4 === 0 && !eating.drink) { snd('eat'); for (let i = 0; i < 3; i++) { const c = tilePxItem(st.id); particle(P.x - Math.sin(P.yaw) * .4, P.y + P.eye - .2, P.z - Math.cos(P.yaw) * .4, (RNG() - .5) * 1.5, RNG() * 1.5, (RNG() - .5) * 1.5, c, .5, .06, 14); } }
          if (eating.drink && eating.t % 6 === 0) snd('drink');
          if (eating.t >= eating.dur) { finishEat(st); eating = null; useCd = 4; }
        }
      }
      if (drawing) {
        if (!st || st.id !== drawing.id) drawing = null;
        else if (useHeld) { drawing.t++; if (drawing.cb && drawing.t === 25) { st.x = { loaded: 1 }; snd('crossbow_load'); drawing = null; } }
        else {
          const it = IT[st.id];
          if (it.bow) { let f = drawing.t / 20; f = (f * f + f * 2) / 3; if (f > 1) f = 1; if (f >= .1) { if (fireArrow(f * 3, f >= 1 ? 3 : 2)) damageTool(1); } }
          else if (it.trident && drawing.t >= 10) { snd('throw'); }
          drawing = null;
        }
      }
      shielding = useHeld && ((st && IT[st.id].shield) || (offhand && IT[offhand.id].shield && !(st && (IT[st.id].food || IT[st.id].bow))));
      if (attackHeld && !HIT.ent && HIT.b && mode() !== 'adventure' && mode() !== 'spectator') {
        if (swingT < 0) swingT = 0;
        if (breakCd === 0) {
          if (creative()) { const h = held(); if (!(h && IT[h.id].tool && IT[h.id].tool.k === 'sword')) { breakNet(HIT.x, HIT.y, HIT.z); breakCd = CFG.BREAK_DELAY; } }
          else {
            const s = getS(HIT.x, HIT.y, HIT.z);
            if (!mine || mine.x !== HIT.x || mine.y !== HIT.y || mine.z !== HIT.z || mine.s !== s) mine = { x: HIT.x, y: HIT.y, z: HIT.z, s, p: 0, t: 0 };
            mine.p += relHard(s);
            if (mine.t++ % 4 === 0) { playBlockSnd(s, 'hit', HIT.x, HIT.y, HIT.z); burst(HIT.x + HIT.fx * .55, HIT.y + HIT.fy * .55, HIT.z + HIT.fz * .55, s, 2, 1.5); }
            if (mine.p >= 1) { breakNet(mine.x, mine.y, mine.z); mine = null; breakCd = CFG.BREAK_DELAY; }
            netAct({ mine: mine ? [mine.x, mine.y, mine.z, Math.min(9, mine.p * 10 | 0)] : 0 });
          }
        }
      } else if (mine) { mine = null; netAct({ mine: 0 }); }
      if (useHeld && useCd === 0 && !eating && !drawing) { const h = held(); if (!(h && (IT[h.id].food || IT[h.id].bow || IT[h.id].drink))) { doUse(); useCd = CFG.USE_DELAY; } }
    }
    function tilePxItem(id) { const k = ITIDX.get(id); if (k === undefined) { const t = IT[id].block ? TN[IT[id].block] : null; return t ? tileAvg(TIL[t.base * 6 + 2] >= 0 ? TIL[t.base * 6 + 2] : 0) : [200, 120, 80]; } const ox = (k & 63) * 16, oy = (k >> 6) * 16; for (let i = 0; i < 8; i++) { const o = ((oy + ri(16)) * 1024 + ox + ri(16)) * 4; if (itaImg.data[o + 3]) return [itaImg.data[o], itaImg.data[o + 1], itaImg.data[o + 2]]; } return [200, 120, 80]; }
    function finishEat(st) {
      const it = IT[st.id];
      if (it.food) {
        P.food = Math.min(20, P.food + it.food.n); P.sat = Math.min(P.food, P.sat + it.food.s);
        snd('burp');
        const id = it.id;
        if (id === 'golden_apple') { P.absorb = Math.max(P.absorb, 4); P.effects.regen = Math.max(P.effects.regen || 0, 100); }
        if (id === 'enchanted_golden_apple') { P.absorb = 16; P.effects.regen = 400; P.effects.fireRes = 6000; }
        if (id === 'rotten_flesh' && RNG() < .8) P.effects.hunger = 600;
        if (id === 'chicken' && RNG() < .3) P.effects.hunger = 600;
        if (id === 'spider_eye' || (id === 'poisonous_potato' && RNG() < .6)) P.effects.poison = id === 'spider_eye' ? 100 : 100;
        if (id === 'pufferfish') { P.effects.poison = 1200; P.effects.hunger = 300; }
        if (id === 'chorus_fruit') teleportPlayerRandom();
        if (id === 'honey_bottle') P.effects.poison = 0;
        if (mode() !== 'creative') { st.n--; if (it.food.bowl) giveOrDrop({ id: IN.bowl.idx, n: 1 }); if (id === 'honey_bottle') giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); if (st.n <= 0) inv[sel] = null; }
      } else if (it.drink) {
        if (it.drink === 'milk') { P.effects = {}; if (mode() !== 'creative') inv[sel] = { id: IN.bucket.idx, n: 1 }; }
        else if (mode() !== 'creative') { st.n--; if (st.n <= 0) inv[sel] = null; giveOrDrop({ id: IN.glass_bottle.idx, n: 1 }); }
      }
    }
    function teleportPlayerRandom() { for (let k = 0; k < 16; k++) { const x = Math.floor(P.x + (RNG() - .5) * 16), z = Math.floor(P.z + (RNG() - .5) * 16); for (let y = Math.floor(P.y) + 8; y > P.y - 8; y--) if (SOL[getS(x, y - 1, z)] && !SOL[getS(x, y, z)] && !SOL[getS(x, y + 1, z)]) { P.x = x + .5; P.y = y; P.z = z + .5; snd('teleport'); return; } } }
    function tickPlayer() {
      P.px = P.x; P.py = P.y; P.pz = P.z; P.walkP = P.walk; P.bobP = P.bob; P.eyeP = P.eye;
      if (P.hurtT > 0) P.hurtT--;
      if (P.shake > 0) P.shake--;
      const c0 = colAt(Math.floor(P.x) >> 4, Math.floor(P.z) >> 4);
      if (!c0 || !c0.meshed) { if (P.y < -64) P.y = 200; return; }
      const md = mode(), spec = md === 'spectator';
      P.spec = spec;
      if (P.place) {
        P.place = false;
        let bx = Math.floor(P.x), bz = Math.floor(P.z);
        const openTop = (x, z) => { let y = H - 2; while (y > 1 && !SOL[getS(x, y, z)] && !FLU[getS(x, y, z)]) y--; const b = getS(x, y, z); return FLU[b] || LEAF[b] || TT[STT[b]].tags.has('log') ? -1 : y; };
        if (!P.spawn && openTop(bx, bz) < 0) { let found = false; for (let r = 1; r <= 24 && !found; r++) for (let k = 0; k < 8 * r && !found; k++) { const a = k / (8 * r) * Math.PI * 2, x = bx + Math.round(Math.cos(a) * r), z = bz + Math.round(Math.sin(a) * r); const c = colAt(x >> 4, z >> 4); if (!c || c.st < 1) continue; if (openTop(x, z) > 0) { bx = x; bz = z; P.x = x + .5; P.z = z + .5; found = true; if (W && !W.remote && W.spawn && Math.abs(W.spawn[0] - .5) < 1e-6) W.spawn = [P.x, W.spawn[1], P.z]; } } }
        let y = openTop(bx, bz);
        if (y < 0) { y = H - 2; while (y > 1 && !SOL[getS(bx, y, bz)] && !FLU[getS(bx, y, bz)]) y--; }
        if (P.y < y + 1 || !boxFree(P, 0, 0, 0)) P.y = y + 1;
        P.py = P.y;
      }
      if (P.sleeping) { P.vx = P.vz = 0; P.vy = 0; if (++P.sleeping >= 100 && NET.role !== 'guest' && ![...RP.values()].some(e => !e.pdead && e.mode !== 'spectator')) { W.time = Math.ceil(W.time / 24000) * 24000; W.raining = W.thunder = false; wake(); } return; }
      let fwd = 0, str = 0;
      const K = c => keys.has(c), active = !gui && !P.dead && !chatOpen;
      if (active) {
        if (K(KB.fwd) || K('ArrowUp')) fwd++;
        if (K(KB.back) || K('ArrowDown')) fwd--;
        if (K(KB.left) || K('ArrowLeft')) str--;
        if (K(KB.right) || K('ArrowRight')) str++;
        fwd = clamp(fwd - stick.y, -1, 1); str = clamp(str + stick.x, -1, 1);
      }
      const jump = active && (K(KB.jump) || tJump), sneakKey = active && (K(KB.sneak) || K('ShiftRight') || tSneak);
      if (spec) P.fly = true;
      P.sneak = sneakKey && !P.fly;
      fwd *= CFG.INPUT_MUL; str *= CFG.INPUT_MUL;
      if (P.sneak) { fwd *= CFG.SNEAK_MUL; str *= CFG.SNEAK_MUL; }
      if (eating || drawing || shielding) { fwd *= .2; str *= .2; }
      const canSprint = (md === 'creative' || spec || P.food > 6) && !P.sneak && !eating && !drawing;
      if (!P.sprint && canSprint && fwd >= .8 && (sprintKey || K(KB.sprint) || sprintTap > 0 || Math.hypot(stick.x, stick.y) > .97)) P.sprint = true;
      if (P.sprint && (fwd < .8 || (P.collH && !P.fly) || !canSprint)) P.sprint = false;
      sprintTap = 0;
      const inW = !spec && fluidIn(P, 1), inL = !spec && fluidIn(P, 2);
      P.inLava = inL;
      const feet = getS(Math.floor(P.x), Math.floor(P.y + .1), Math.floor(P.z)), feetT = TT[STT[feet]];
      P.climbing = !spec && !P.fly && (feetT.climb || isT(feet, 'scaffolding')) ? 1 : 0;
      const web = !spec && blockIn(P, b => TT[STT[b]].web), powder = !spec && blockIn(P, b => TT[STT[b]].powder) && !(armor[3] && IT[armor[3].id].id === 'leather_boots');
      const sy2 = Math.sin(P.yaw), cy2 = Math.cos(P.yaw);
      const accel = a => { let f = str * str + fwd * fwd; if (f >= 1e-4) { f = Math.sqrt(f); if (f < 1) f = 1; f = a / f; const s = str * f, w = fwd * f; P.vx += s * cy2 - w * sy2; P.vz += -s * sy2 - w * cy2; } };
      if (P.fly) { if (sneakKey) P.vy -= CFG.FLY_V * 3 * (spec ? 1 : 1); if (jump) P.vy += CFG.FLY_V * 3; }
      else if (inW || inL) { if (jump) P.vy += CFG.WATER_UP; }
      else if (P.climbing) { if (jump || (P.collH && fwd > 0)) P.vy = .2; }
      else if (jump && P.onGround && P.jumpT === 0) {
        P.vy = CFG.JUMP * (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'honey_block') ? .5 : 1);
        if (P.sprint) { P.vx -= sy2 * CFG.SPRINT_JUMP; P.vz -= cy2 * CFG.SPRINT_JUMP; }
        P.jumpT = CFG.JUMP_TICKS; stat('jump'); exhaust(P.sprint ? CFG.EXH_SPRINT_JUMP : CFG.EXH_JUMP);
        const fb = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (isT(fb, 'farmland') && mode() !== 'creative' && RNG() < .3) setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
      }
      if (!jump) P.jumpT = 0; else if (P.jumpT > 0) P.jumpT--;
      const gB = getS(Math.floor(P.x), Math.floor(P.y - .51), Math.floor(P.z)), gT = TT[STT[gB]];
      const slip = gT.slip || .6;
      if (spec) {
        accel(CFG.FLY_ACC * (P.sprint ? 2 : 1) * 1.5);
        P.x += P.vx; P.y += P.vy; P.z += P.vz; P.vy *= CFG.FLY_VDRAG; P.vx *= .91; P.vz *= .91; P.onGround = false;
      } else if ((inW || inL) && !P.fly) {
        accel(inL ? .02 : P.sprint ? .04 : CFG.SWIM_ACC);
        if (P.sprint && inW && fluidIn(P, 1, 1.4)) { P.vy += Math.sin(P.pitch) * .02; }
        moveE(P, P.vx, P.vy, P.vz, false, .6);
        const dr = inL ? CFG.LAVA_DRAG : CFG.WATER_DRAG;
        P.vx *= dr; P.vy *= inL ? .5 : .8; P.vz *= dr; P.vy -= inL ? .02 : CFG.WATER_GRAV;
        if (P.collH && boxFree(P, P.vx, .6 + P.vy, P.vz)) P.vy = .3;
      } else {
        const a = P.fly ? CFG.FLY_ACC * (P.sprint ? 2 : 1) : P.onGround ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277 / Math.pow(slip * .91, 3)) * .6 * .6 / .6 : (P.sprint ? CFG.AIR_ACC_SPRINT : CFG.AIR_ACC);
        accel(P.onGround && !P.fly ? (P.sprint ? CFG.SPRINT : CFG.WALK) * (0.16277136 / Math.pow(slip * .91, 3)) : a);
        if (P.climbing) { P.vx = clamp(P.vx, -.15, .15); P.vz = clamp(P.vz, -.15, .15); P.vy = Math.max(P.vy, P.sneak ? 0 : -.15); }
        if (web) { P.vx *= .25; P.vy *= .05; P.vz *= .25; }
        if (powder) { P.vx *= .9; P.vy = Math.max(-.05, P.vy * .9); P.vz *= .9; }
        const vy0 = P.vy;
        moveE(P, P.vx, P.vy, P.vz, P.sneak && !P.fly, CFG.STEP);
        if (P.fly) P.vy = vy0 * CFG.FLY_VDRAG; else P.vy = (P.vy - CFG.GRAVITY) * CFG.VDRAG;
        const dr = P.onGround ? slip * .91 : CFG.AIR_DRAG;
        P.vx *= dr; P.vz *= dr;
        if (P.onGround && gT.bounce && vy0 < -.1 && !P.sneak) P.vy = -vy0 * .95;
        if (gT.id === 'soul_sand') { P.vx *= .4; P.vz *= .4; }
        if (gT.id === 'honey_block') { P.vx *= .4; P.vz *= .4; }
        if (feetT.id === 'sweet_berry_bush' && (Math.abs(P.vx) > .003 || Math.abs(P.vz) > .003)) { P.vx *= .8; P.vz *= .8; if (sv(feet, 'age') > 0 && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus'); }
      }
      if (P.fly && P.onGround && md !== 'creative' && !spec) P.fly = false;
      if (P.fly && P.onGround && md === 'creative') P.fly = false;
      if (P.y > H + 100) { P.y = H + 100; P.vy = Math.min(0, P.vy); }
      if (P.y < -64 && !spec) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'void'); }
      const nowW = inW;
      if (nowW && !P.wasW && P.vy < -.3) snd('splash');
      P.wasW = nowW;
      if (nowW || P.fly || P.climbing || web || powder) P.fall = 0;
      else if (P.onGround) {
        if (P.fall > 0) {
          const land = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), lt = TT[STT[land]];
          let d = Math.ceil(P.fall - CFG.FALL_SAFE);
          if (lt.soft) d = Math.ceil(d * lt.soft);
          if (lt.bounce || lt.id === 'slime_block') d = P.sneak ? d : 0;
          if (lt.bouncy) d = Math.ceil((P.fall * (1 - lt.bouncy) - CFG.FALL_SAFE));
          if (lt.id === 'powder_snow' || lt.id === 'scaffolding' || lt.id === 'cobweb' || FLU[getS(Math.floor(P.x), Math.floor(P.y), Math.floor(P.z))]) d = 0;
          if (d > 0) hurtPlayer(d, null, null, 'fall');
          else if (P.fall > 1) matSnd(lt.snd, 0, { x: P.x, y: P.y, z: P.z }, 1.4);
          if (P.fall > 1 && isT(land, 'farmland') && md !== 'creative') setBlock(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z), S('dirt'));
          P.fall = 0;
        }
      } else if (P.y < P.py) P.fall += P.py - P.y;
      const hd = Math.hypot(P.x - P.px, P.z - P.pz);
      if (P.onGround && !nowW && !P.sneak) { P.walk += hd * .6; if (P.walk > P.nextStep) { P.nextStep = Math.floor(P.walk) + 1; const b = getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)); if (b) matSnd(TT[STT[b]].snd, 0, null); } }
      else if (P.onGround) P.walk += hd * .6;
      if (P.climbing && Math.abs(P.y - P.py) > .05 && tickN % 8 === 0) matSnd('ladder', 0, null);
      P.bob += ((P.onGround && !P.fly ? Math.min(.1, hd) : 0) - P.bob) * .4;
      if (P.sprint) exhaust(hd * CFG.EXH_SPRINT);
      if (nowW) exhaust(Math.hypot(hd, P.y - P.py) * CFG.EXH_SWIM);
      const tgtEye = P.sleeping ? .2 : P.sneak ? CFG.EYE_SNEAK : CFG.EYE;
      P.eye += (tgtEye - P.eye) * .5;
      P.h = P.sneak ? CFG.PH_SNEAK : CFG.PH;
      if (!P.sneak && !boxFree(P, 0, 0, 0, CFG.PH) && boxFree(P, 0, 0, 0, CFG.PH_SNEAK)) { P.sneak = true; P.h = CFG.PH_SNEAK; }
      P.eyeW = !spec && eyeIn(1);
      P.eyeL = !spec && eyeIn(2);
      if (P.eyeW && md !== 'creative' && !spec && !P.effects.waterBreathing) { if (--P.air <= -20) { P.air = 0; hurtPlayer(2, null, null, 'drown'); } } else P.air = Math.min(CFG.AIR_MAX, P.air + 5);
      if (inL && md !== 'creative' && !spec) { if (!P.effects.fireRes) { if (tickN % 10 === 0) hurtPlayer(4, null, null, 'lava'); } P.fire = 300; }
      if (!spec && blockIn(P, b => TT[STT[b]].fire)) { P.fire = Math.max(P.fire, 160); if (tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (P.fire > 0) { P.fire--; if (nowW || W.raining && skyOpenP()) P.fire = 0; if (P.fire % 20 === 0 && !inL && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire'); }
      if (!spec && (isT(getS(Math.floor(P.x), Math.floor(P.y - .2), Math.floor(P.z)), 'magma_block')) && !P.sneak && tickN % 10 === 0 && !P.effects.fireRes) hurtPlayer(1, null, null, 'fire');
      if (!spec && blockIn({ x: P.x, y: P.y, z: P.z, w: P.w + .02, h: P.h }, b => TT[STT[b]].id === 'cactus') && tickN % 10 === 0) hurtPlayer(1, null, null, 'cactus');
      if (!spec && md !== 'creative' && !boxFree({ x: P.x, y: P.y + P.eye - .1, z: P.z, w: .2, h: .2 }, 0, 0, 0) && SOL[getS(Math.floor(P.x), Math.floor(P.y + P.eye), Math.floor(P.z))] === 1 && tickN % 10 === 0) hurtPlayer(1, null, null, 'suffocate');
      for (const k in P.effects) { if (P.effects[k] > 0) P.effects[k]--; else delete P.effects[k]; }
      if (P.effects.poison && tickN % 25 === 0 && P.hp > 1) hurtPlayer(1, null, null, 'magic');
      if (P.effects.regen && tickN % 50 === 0 && P.hp < 20) P.hp = Math.min(20, P.hp + 1);
      if (P.effects.hunger) exhaust(.005);
      if (md === 'survival' || md === 'adventure') {
        if (P.exh > 4) { P.exh -= 4; if (P.sat > 0) P.sat = Math.max(0, P.sat - 1); else if (W.diff > 0) P.food = Math.max(0, P.food - 1); }
        const natRegen = W.rules.naturalRegeneration !== false;
        if (natRegen && P.food >= 20 && P.sat > 0 && P.hp < 20) { if (++P.regenT >= 10) { const a = Math.min(P.sat, 6); P.hp = Math.min(20, P.hp + a / 6); exhaust(a); P.regenT = 0; } }
        else if (natRegen && P.food >= 18 && P.hp < 20) { if (++P.regenT >= CFG.REGEN_TICKS) { P.hp = Math.min(20, P.hp + 1); exhaust(CFG.EXH_REGEN); P.regenT = 0; } }
        else if (P.food <= 0) { if (++P.regenT >= CFG.REGEN_TICKS) { if (P.hp > (W.diff >= 3 ? 0 : W.diff === 2 ? 1 : 10)) hurtPlayer(1, null, null, 'starve'); P.regenT = 0; } }
        else P.regenT = 0;
        if (W.diff === 0 && P.hp < 20 && tickN % 20 === 0) P.hp = Math.min(20, P.hp + 1);
        if (W.diff === 0 && P.food < 20 && tickN % 20 === 0) P.food++;
      }
      if (P.hp > 20) P.hp = 20;
    }
    const skyOpenP = () => (getL(Math.floor(P.x), Math.floor(P.y + 1.6), Math.floor(P.z)) >> 4) === 15;
    function eyeIn(fk) { const x = Math.floor(P.x), y = Math.floor(P.y + P.eye), z = Math.floor(P.z), b = getS(x, y, z); if (FLU[b] !== fk) return false; const lv = (b - TT[STT[b]].base) & 7, top = FLU[getS(x, y + 1, z)] === fk ? 1 : lv ? (8 - lv) / 9 : 8 / 9; return P.y + P.eye - y < top; }
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
      const R2 = Math.min(RD, 6), stamp = tickN;
      const around = (ccx, ccz) => {
        for (let dz = -R2; dz <= R2; dz++) for (let dx = -R2; dx <= R2; dx++) {
          const c = colAt(ccx + dx, ccz + dz); if (!c || c.st < 2 || c.rt === stamp) continue;
          c.rt = stamp;
          for (let sy = 0; sy <= c.top; sy++) {
            const sec = c.s[sy]; if (!sec) continue;
            for (let i = 0; i < rs; i++) {
              const li = ri(4096), s = sec[li]; if (!RTK[s]) continue;
              randomTick(c.cx * 16 + (li & 15), sy * 16 + (li >> 8), c.cz * 16 + (li >> 4 & 15), s, TT[STT[s]]);
            }
          }
        }
      };
      around(Math.floor(P.x) >> 4, Math.floor(P.z) >> 4);
      for (const e of RP.values()) around(Math.floor(e.x) >> 4, Math.floor(e.z) >> 4);
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
    let AC = null, master = null, NBUF = null, musicBus = null, musicT = 600, discT = null;
    function ac() {
      if (AC) return AC;
      try {
        const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
        AC = new A(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
        NBUF = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = NBUF.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = RNG() * 2 - 1;
        musicBus = AC.createGain(); const dl = AC.createDelay(), fb = AC.createGain(); dl.delayTime.value = .34; fb.gain.value = .3;
        musicBus.connect(master); musicBus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);
      } catch (e) { AC = null; }
      return AC;
    }
    const env = (gn, t, a, d, v) => { gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + a); gn.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
    function nzS(dur, vol, type, f, q, dt, f2, out) {
      const t = AC.currentTime + (dt || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain();
      s.buffer = NBUF; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
      env(gn, t, .004, dur, vol); s.connect(fl); fl.connect(gn); gn.connect(out || master); s.start(t, RNG() * .5); s.stop(t + dur + .05);
    }
    function tnS(type, f0, f1, dur, vol, dt, cut, out) {
      const t = AC.currentTime + (dt || 0), o = AC.createOscillator(), gn = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      env(gn, t, .005, dur, vol);
      if (cut) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); fl.connect(gn); } else o.connect(gn);
      gn.connect(out || master); o.start(t); o.stop(t + dur + .05);
    }
    const MATC = { stone: 's', deepslate: 's', netherrack: 'r', basalt: 's', nether_bricks: 's', copper: 'm', metal: 'm', anvil: 'm', lantern: 'm', chain: 'm', heavy_core: 'm', lodestone: 's', mud_bricks: 's', resin: 'g', wood: 'w', bamboo: 'w', cherry: 'w', nether_wood: 'w', ladder: 'w', scaffold: 'w', grass: 'g', plant: 'g', crop: 'g', vine: 'g', azalea: 'g', moss: 'g', wart: 'g', cherry_leaves: 'g', azalea_leaves: 'g', fungus: 'g', slime: 'q', honey: 'q', gravel: 'r', mud: 'r', soul: 'r', nylium: 'r', sand: 'a', snow: 'a', glass: 'l', amethyst: 'l', froglight: 'l', wool: 'c', candle: 'c', decorated_pot: 's', sculk: 'c', coral: 'c', bone: 's', creaking_heart: 'w' };
    function matSnd(m, kind, pos, v) {
      if (api.muted || !SET.sound || !ac()) return;
      let vol = [.08, .07, .22][kind] * (v ?? 1);
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 16) return; vol *= 1 - d / 16; }
      const c = MATC[m] || 's', dur = [.07, .06, .16][kind], r = .85 + RNG() * .3;
      if (c === 'g') nzS(dur, vol, 'lowpass', 2600 * r, .6);
      else if (c === 'r') { nzS(dur, vol, 'bandpass', 900 * r, .8); if (kind === 2) nzS(dur * .7, vol * .7, 'bandpass', 1400 * r, 1, .05); }
      else if (c === 's') { nzS(dur * .8, vol, 'bandpass', 1900 * r, 1.4); if (kind === 2) tnS('square', 180 * r, 90, .06, vol * .2); }
      else if (c === 'm') { nzS(dur * .6, vol * .8, 'bandpass', 3200 * r, 3); tnS('triangle', 900 * r, 700, dur, vol * .3); }
      else if (c === 'w') { nzS(dur, vol, 'lowpass', 850 * r, 1); tnS('triangle', 150 * r, 80, dur, vol * .7); }
      else if (c === 'a') nzS(dur * 1.3, vol * .8, 'highpass', 1500 * r, .5);
      else if (c === 'c') nzS(dur * 1.2, vol * .7, 'lowpass', 700 * r, .5);
      else if (c === 'q') { tnS('sine', 300 * r, 150, dur * 1.5, vol * .6); nzS(dur, vol * .4, 'lowpass', 600, 1); }
      else if (c === 'l') { if (kind === 2) { nzS(.25, vol, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f * r, f * r * .9, .12, vol * .3, i * .03)); } else nzS(dur, vol, 'bandpass', 2500, 2); }
    }
    function snd(name, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = 1;
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 20) return; v = 1 - d / 20; }
      if (pos && NET.role === 'host' && pos !== P) netSend({ t: 'snd', n: name, x: +pos.x.toFixed(1), y: +pos.y.toFixed(1), z: +pos.z.toFixed(1) });
      const r = .9 + RNG() * .2;
      switch (name) {
        case 'hurt': tnS('triangle', 340 * r, 160, .17, .3); nzS(.1, .12, 'bandpass', 700, 1.5); break;
        case 'fall_small': nzS(.12, .22, 'lowpass', 500, .7); tnS('triangle', 260, 140, .12, .2); break;
        case 'fall_big': nzS(.2, .3, 'lowpass', 380, .7); tnS('triangle', 200, 90, .2, .28); break;
        case 'pop': tnS('sine', 900 * r, 1700 * r, .06, .12); break;
        case 'orb': tnS('sine', 1900 * r, 2300 * r, .1, .07); tnS('sine', 2800 * r, 3100, .08, .04, .03); break;
        case 'click': tnS('square', 1500, 1400, .02, .05 * v); nzS(.02, .05 * v, 'highpass', 3000, .5); break;
        case 'pig': tnS('square', 330 * r, 230 * r, .12, .08 * v, 0, 1300); tnS('square', 300 * r, 210 * r, .1, .07 * v, .16, 1300); break;
        case 'pig_hurt': tnS('square', 420 * r, 300 * r, .14, .1 * v, 0, 1600); break;
        case 'pig_death': tnS('square', 380 * r, 140 * r, .4, .1 * v, 0, 1400); break;
        case 'cow': tnS('sawtooth', 135 * r, 104 * r, .9, .15 * v, 0, 600); break;
        case 'cow_hurt': tnS('sawtooth', 180 * r, 130 * r, .3, .15 * v, 0, 700); break;
        case 'cow_death': tnS('sawtooth', 160 * r, 80 * r, .7, .15 * v, 0, 600); break;
        case 'sheep': tnS('sawtooth', 300 * r, 280 * r, .5, .08 * v, 0, 1200); tnS('sine', 7 * r, 7, .5, .0); break;
        case 'sheep_hurt': case 'sheep_death': tnS('sawtooth', 360 * r, 260 * r, .3, .1 * v, 0, 1400); break;
        case 'chicken': tnS('square', 900 * r, 1100 * r, .06, .05 * v, 0, 3000); tnS('square', 1000 * r, 900 * r, .06, .05 * v, .09, 3000); break;
        case 'chicken_hurt': case 'chicken_death': tnS('square', 1200 * r, 700 * r, .12, .07 * v, 0, 3000); break;
        case 'zombie': tnS('sawtooth', 95 * r, 72 * r, .75, .14 * v, 0, 700); tnS('sawtooth', 97 * r, 75 * r, .7, .08 * v, .05, 500); break;
        case 'zombie_hurt': tnS('sawtooth', 150 * r, 90, .25, .16 * v, 0, 900); break;
        case 'zombie_death': tnS('sawtooth', 120 * r, 50, .7, .16 * v, 0, 700); break;
        case 'skeleton': case 'skeleton_hurt': case 'skeleton_death': for (let i = 0; i < 5; i++) nzS(.03, .09 * v, 'bandpass', 2600 * r, 4, i * .05); break;
        case 'creeper_hurt': case 'creeper_death': nzS(.2, .1 * v, 'bandpass', 1200, 1); break;
        case 'creeper': break;
        case 'spider': nzS(.25, .06 * v, 'bandpass', 3500 * r, 3); break;
        case 'spider_hurt': case 'spider_death': nzS(.2, .1 * v, 'bandpass', 2800 * r, 2); tnS('sawtooth', 600, 300, .15, .05 * v); break;
        case 'enderman': tnS('sine', 120 * r, 80, .6, .08 * v); break;
        case 'enderman_hurt': case 'enderman_death': case 'enderman_scream': tnS('sawtooth', 500 * r, 900 * r, .5, .1 * v, 0, 2000); break;
        case 'slime': case 'slime_hurt': case 'slime_death': tnS('sine', 200 * r, 90, .15, .14 * v); break;
        case 'poof': nzS(.3, .14 * v, 'lowpass', 1300, .5); break;
        case 'bow': nzS(.16, .12 * v, 'highpass', 1200, .7, 0, 4000); break;
        case 'arrow_hit': nzS(.08, .14 * v, 'lowpass', 900, 1); break;
        case 'arrow_land': tnS('square', 320, 150, .05, .07 * v); break;
        case 'throw': nzS(.15, .08, 'highpass', 900, .7, 0, 3000); break;
        case 'eat': nzS(.07, .16, 'bandpass', 1500 * r, 1.2); break;
        case 'drink': tnS('sine', 300 * r, 500 * r, .08, .1); break;
        case 'burp': tnS('sawtooth', 120, 70, .25, .14, 0, 500); break;
        case 'splash': nzS(.45, .2, 'lowpass', 1800, .5, 0, 400); break;
        case 'tbreak': tnS('square', 900, 300, .08, .1); nzS(.1, .1, 'highpass', 2500, .5); break;
        case 'goal': [659, 988, 1319].forEach((f, i) => tnS('sine', f, f * 1.01, .18, .07, i * .07)); tnS('triangle', 330, 330, .3, .04, .14); break;
        case 'levelup': [523, 659, 784, 1047].forEach((f, i) => tnS('sine', f, f, .22, .08, i * .08)); break;
        case 'hit_weak': nzS(.05, .1 * v, 'lowpass', 1000, 1); break;
        case 'hit_strong': nzS(.06, .16 * v, 'lowpass', 900, 1); tnS('triangle', 200, 90, .07, .1 * v); break;
        case 'crit': nzS(.08, .18 * v, 'bandpass', 2400, 1); tnS('triangle', 260, 100, .09, .12 * v); break;
        case 'fuse': nzS(1.4, .1 * v, 'highpass', 3000, .5); break;
        case 'explode': nzS(1.4, .55 * Math.max(.3, v), 'lowpass', 600, .7, 0, 60); tnS('sine', 80, 30, 1, .4 * Math.max(.3, v)); break;
        case 'door_open': case 'door_close': nzS(.12, .13 * v, 'lowpass', 900, 1); tnS('triangle', name === 'door_open' ? 160 : 120, 90, .1, .1 * v); break;
        case 'chest_open': tnS('triangle', 140, 90, .25, .1 * v); nzS(.2, .06 * v, 'lowpass', 800, 1); break;
        case 'chest_close': tnS('triangle', 120, 70, .12, .12 * v); break;
        case 'bucket_fill': case 'bucket_empty': nzS(.3, .15, 'lowpass', 1500, .8, 0, 500); break;
        case 'bucket_fill_lava': case 'bucket_empty_lava': nzS(.4, .15, 'lowpass', 600, .8, 0, 200); break;
        case 'fizz': nzS(.5, .1 * v, 'highpass', 2500, .6); break;
        case 'ignite': nzS(.15, .12, 'highpass', 2000, .8); tnS('square', 2000, 1500, .04, .04); break;
        case 'hoe': case 'shovel': nzS(.12, .14, 'bandpass', 900, .8); break;
        case 'strip': case 'scrape': case 'wax_off': nzS(.18, .14, 'bandpass', 1400, 1.5); break;
        case 'wax_on': nzS(.12, .1, 'lowpass', 1200, .5); break;
        case 'shear': nzS(.08, .12 * v, 'highpass', 3000, 2); nzS(.08, .1 * v, 'highpass', 3500, 2, .08); break;
        case 'milk': nzS(.3, .12, 'lowpass', 1000, .8); break;
        case 'teleport': tnS('sine', 300, 900, .4, .1 * v); break;
        case 'glass_break': nzS(.25, .14 * v, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f, f * .9, .12, .05 * v, i * .03)); break;
        case 'equip': nzS(.12, .1, 'bandpass', 1800, 1); tnS('triangle', 600, 500, .08, .05); break;
        case 'shield': tnS('triangle', 220, 120, .1, .15); nzS(.08, .12, 'lowpass', 800, 1); break;
        case 'totem': [392, 523, 659, 784].forEach((f, i) => tnS('triangle', f, f, .4, .08, i * .06)); break;
        case 'anvil_land': tnS('square', 600, 580, .4, .1 * v, 0, 3000); break;
        case 'piston_out': case 'piston_in': nzS(.12, .14 * v, 'lowpass', 600, 1); tnS('square', 110, 70, .1, .06 * v); break;
        case 'compost': nzS(.12, .1, 'lowpass', 700, 1); break;
        case 'bottle_fill': tnS('sine', 400, 900, .2, .08); break;
        case 'crossbow_load': tnS('square', 300, 600, .2, .06); break;
        case 'land': nzS(.12, .2, 'lowpass', 420, .7); break;
      }
    }
    const INSTR = { harp: ['sine', 1], bass: ['triangle', .25], snare: ['noise', 1], hat: ['noiseh', 1], basedrum: ['kick', 1], bell: ['sine', 4], flute: ['sine', 2], chime: ['triangle', 4], guitar: ['sawtooth', .5], xylophone: ['triangle', 2], iron_xylophone: ['square', 1], cow_bell: ['square', 2], didgeridoo: ['sawtooth', .25], bit: ['square', 1], banjo: ['sawtooth', 1], pling: ['triangle', 1] };
    function instrFor(s) { const t = TT[STT[s]], id = t.id; if (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry') return 'bass'; if (t.snd === 'sand' || id === 'gravel' || id.includes('concrete_powder')) return 'snare'; if (t.snd === 'glass' || id === 'glowstone' || id === 'sea_lantern') return id === 'glowstone' ? 'pling' : 'hat'; if (t.snd === 'stone' || t.snd === 'deepslate' || t.snd === 'netherrack') return 'basedrum'; if (id === 'gold_block') return 'bell'; if (id === 'clay') return 'flute'; if (id === 'packed_ice') return 'chime'; if (t.tags.has('wool')) return 'guitar'; if (id === 'bone_block') return 'xylophone'; if (id === 'iron_block') return 'iron_xylophone'; if (id === 'soul_sand') return 'cow_bell'; if (id === 'pumpkin') return 'didgeridoo'; if (id === 'emerald_block') return 'bit'; if (id === 'hay_block') return 'banjo'; return 'harp'; }
    function noteSnd(n, below, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = .14; if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 48) return; v *= 1 - d / 48; }
      const ins = instrFor(below), [ty, mul] = INSTR[ins], f = 185 * Math.pow(2, (n - 12) / 12) * mul;
      if (ty === 'noise') nzS(.12, v, 'bandpass', 1500 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'noiseh') nzS(.05, v, 'highpass', 6000 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'kick') tnS('sine', 120 * Math.pow(2, (n - 12) / 24), 40, .2, v * 1.5);
      else { tnS(ty, f, f, .8, v, 0, ty === 'sawtooth' ? 2000 : 0); if (ty === 'sine') tnS('sine', f * 2, f * 2, .5, v * .2); }
    }
    function note(f, dt, v, out) {
      const t0 = AC.currentTime + dt;
      for (const [m, a] of [[1, 1], [2, .3], [3, .1]]) {
        const o = AC.createOscillator(), gn = AC.createGain();
        o.type = 'sine'; o.frequency.value = f * m; gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(v * a, t0 + .012); gn.gain.exponentialRampToValueAtTime(.0001, t0 + 2.6 / m);
        o.connect(gn); gn.connect(out || musicBus); o.start(t0); o.stop(t0 + 2.7);
      }
    }
    function musicTick() {
      if (!SET.music || api.muted || !AC || (scr !== 'game' && scr !== 'title') || discT) return;
      if (--musicT > 0) return;
      musicT = 20 * (60 + RNG() * 120);
      const sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], base = [261.63, 220, 196, 233.08, 174.61][ri(5)];
      let t = .1, i = 4 + ri(3);
      for (let n = 0; n < 20; n++) {
        i = clamp(i + [-2, -1, -1, 0, 1, 1, 2][ri(7)], 0, sc.length - 1);
        const f = base * 2 ** (sc[i] / 12);
        note(f, t, .05); if (n % 4 === 0) note(f / 2, t, .04); if (n % 8 === 2) note(f * 1.5, t + .3, .025);
        t += [.6, 1.2, 1.2, 1.8, 2.4][ri(5)];
      }
    }
    function playDisc(name, x, y, z) {
      stopDisc(); if (!ac()) return;
      const R = rng(hstr(name)), sc = [0, 3, 5, 7, 10, 12, 15], base = 196 * Math.pow(2, R() * .5);
      const seq = []; let i = 3; for (let n = 0; n < 32; n++) { i = clamp(i + ri(3) - 1, 0, 6); seq.push(base * 2 ** (sc[i] / 12)); }
      let k = 0;
      discT = setInterval(() => { if (!api.alive || api.muted) return; const d = Math.hypot(x - P.x, y - P.y, z - P.z); if (d < 48) note(seq[k % 32], 0, .06 * (1 - d / 48), master); if (k % 4 === 0 && d < 48) note(seq[(k + 2) % 32] / 2, 0, .04 * (1 - d / 48), master); k++; }, 320);
    }
    function stopDisc() { if (discT) { clearInterval(discT); discT = null; } }
