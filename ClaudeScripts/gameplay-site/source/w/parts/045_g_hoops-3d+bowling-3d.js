
(() => {
  'use strict';

  const G = 9.81;
  const V3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
  const rot = (q, x, y, z, o, inv) => {
    const qx = inv ? -q.x : q.x, qy = inv ? -q.y : q.y, qz = inv ? -q.z : q.z, qw = q.w;
    const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    o.x = ix * qw - iw * qx - iy * qz + iz * qy;
    o.y = iy * qw - iw * qy - iz * qx + ix * qz;
    o.z = iz * qw - iw * qz - ix * qy + iy * qx;
    return o;
  };
  const T1 = V3(), RV = V3();
  const body = (m, ix, iy, iz, sph, pts) => ({
    p: V3(), v: V3(), w: V3(), q: { x: 0, y: 0, z: 0, w: 1 }, m, im: 1 / m, ii: V3(1 / ix, 1 / iy, 1 / iz), iso: ix === iy && iy === iz,
    sph, ws: sph.map(() => V3()), pts: pts || [], r: sph[0].r, sleep: false, still: 0, gone: false
  });
  const iiw = (b, x, y, z, o) => {
    if (b.iso) { o.x = x * b.ii.x; o.y = y * b.ii.x; o.z = z * b.ii.x; return o; }
    rot(b.q, x, y, z, o, true); o.x *= b.ii.x; o.y *= b.ii.y; o.z *= b.ii.z;
    return rot(b.q, o.x, o.y, o.z, o, false);
  };
  const imp = (b, rx, ry, rz, jx, jy, jz) => {
    b.v.x += jx * b.im; b.v.y += jy * b.im; b.v.z += jz * b.im;
    iiw(b, ry * jz - rz * jy, rz * jx - rx * jz, rx * jy - ry * jx, T1);
    b.w.x += T1.x; b.w.y += T1.y; b.w.z += T1.z;
  };
  const kAt = (b, rx, ry, rz, nx, ny, nz) => {
    iiw(b, ry * nz - rz * ny, rz * nx - rx * nz, rx * ny - ry * nx, T1);
    return b.im + (T1.y * rz - T1.z * ry) * nx + (T1.z * rx - T1.x * rz) * ny + (T1.x * ry - T1.y * rx) * nz;
  };
  const relv = (A, B, ax, ay, az, bx, by, bz) => {
    RV.x = B.v.x + B.w.y * bz - B.w.z * by; RV.y = B.v.y + B.w.z * bx - B.w.x * bz; RV.z = B.v.z + B.w.x * by - B.w.y * bx;
    if (A) { RV.x -= A.v.x + A.w.y * az - A.w.z * ay; RV.y -= A.v.y + A.w.z * ax - A.w.x * az; RV.z -= A.v.z + A.w.x * ay - A.w.y * ax; }
  };

  const contact = (A, B, px, py, pz, nx, ny, nz, pen, e, mu, fix) => {
    if (B.sleep || (A && A.sleep)) {
      if (!A || (A.sleep && B.sleep)) return 0;
      A.sleep = B.sleep = false; A.still = B.still = 0;
    }
    if (fix) {
      const d = pen - 4e-4;
      if (d <= 0) return 0;
      const ia = A ? A.im : 0, s = 0.8 * d / (ia + B.im);
      B.p.x += nx * s * B.im; B.p.y += ny * s * B.im; B.p.z += nz * s * B.im;
      if (A) { A.p.x -= nx * s * ia; A.p.y -= ny * s * ia; A.p.z -= nz * s * ia; }
      return 0;
    }
    const bx = px - B.p.x, by = py - B.p.y, bz = pz - B.p.z;
    const ax = A ? px - A.p.x : 0, ay = A ? py - A.p.y : 0, az = A ? pz - A.p.z : 0;
    relv(A, B, ax, ay, az, bx, by, bz);
    const vn = RV.x * nx + RV.y * ny + RV.z * nz;
    if (vn >= 0) return 0;
    const jn = -(1 + (vn < -0.45 ? e : 0)) * vn / (kAt(B, bx, by, bz, nx, ny, nz) + (A ? kAt(A, ax, ay, az, nx, ny, nz) : 0));
    imp(B, bx, by, bz, jn * nx, jn * ny, jn * nz);
    if (A) imp(A, ax, ay, az, -jn * nx, -jn * ny, -jn * nz);
    if (mu > 0) {
      relv(A, B, ax, ay, az, bx, by, bz);
      const v2 = RV.x * nx + RV.y * ny + RV.z * nz;
      let tx = RV.x - v2 * nx, ty = RV.y - v2 * ny, tz = RV.z - v2 * nz;
      const vt = Math.hypot(tx, ty, tz);
      if (vt > 1e-6) {
        tx /= vt; ty /= vt; tz /= vt;
        const jt = Math.min(vt / (kAt(B, bx, by, bz, tx, ty, tz) + (A ? kAt(A, ax, ay, az, tx, ty, tz) : 0)), mu * jn);
        imp(B, bx, by, bz, -jt * tx, -jt * ty, -jt * tz);
        if (A) imp(A, ax, ay, az, jt * tx, jt * ty, jt * tz);
      }
    }
    return jn;
  };
  const integ = (b, h) => {
    b.p.x += b.v.x * h; b.p.y += b.v.y * h; b.p.z += b.v.z * h;
    const q = b.q, hx = b.w.x * h * 0.5, hy = b.w.y * h * 0.5, hz = b.w.z * h * 0.5, x = q.x, y = q.y, z = q.z, w = q.w;
    q.x += hx * w + hy * z - hz * y; q.y += hy * w + hz * x - hx * z; q.z += hz * w + hx * y - hy * x; q.w -= hx * x + hy * y + hz * z;
    const l = 1 / Math.hypot(q.x, q.y, q.z, q.w);
    q.x *= l; q.y *= l; q.z *= l; q.w *= l;
  };
  const hit = j => j + 1e-9;

  const sPlane = (b, r, nx, ny, nz, d, e, mu, fix) => {
    const pen = d + r - (b.p.x * nx + b.p.y * ny + b.p.z * nz);
    return pen > 0 ? hit(contact(null, b, b.p.x - nx * r, b.p.y - ny * r, b.p.z - nz * r, nx, ny, nz, pen, e, mu, fix)) : 0;
  };
  const sBox = (b, r, cx, cy, cz, hx, hy, hz, e, mu, fix) => {
    const px = b.p.x, py = b.p.y, pz = b.p.z;
    const qx = Math.max(cx - hx, Math.min(cx + hx, px)), qy = Math.max(cy - hy, Math.min(cy + hy, py)), qz = Math.max(cz - hz, Math.min(cz + hz, pz));
    let nx = px - qx, ny = py - qy, nz = pz - qz, pen;
    const d2 = nx * nx + ny * ny + nz * nz;
    if (d2 >= r * r) return 0;
    if (d2 > 1e-12) { const d = Math.sqrt(d2); nx /= d; ny /= d; nz /= d; pen = r - d; }
    else {
      const dx = hx - Math.abs(px - cx), dy = hy - Math.abs(py - cy), dz = hz - Math.abs(pz - cz);
      nx = ny = nz = 0;
      if (dx < dy && dx < dz) { nx = px < cx ? -1 : 1; pen = dx + r; } else if (dy < dz) { ny = py < cy ? -1 : 1; pen = dy + r; } else { nz = pz < cz ? -1 : 1; pen = dz + r; }
    }
    return hit(contact(null, b, px - nx * r, py - ny * r, pz - nz * r, nx, ny, nz, pen, e, mu, fix));
  };
  const sRing = (b, r, cx, cy, cz, R, tr, e, mu, fix) => {
    let dx = b.p.x - cx, dz = b.p.z - cz;
    const dh = Math.hypot(dx, dz);
    if (dh < 1e-6) { dx = 1; dz = 0; } else { dx /= dh; dz /= dh; }
    const qx = cx + dx * R, qz = cz + dz * R;
    let nx = b.p.x - qx, ny = b.p.y - cy, nz = b.p.z - qz;
    const d = Math.hypot(nx, ny, nz), rr = r + tr;
    if (d >= rr || d < 1e-9) return 0;
    nx /= d; ny /= d; nz /= d;
    return hit(contact(null, b, qx + nx * tr, cy + ny * tr, qz + nz * tr, nx, ny, nz, rr - d, e, mu, fix));
  };
  const sCyl = (b, r, cx, cz, R, y0, y1, e, mu, fix) => {
    if (b.p.y < y0 || b.p.y > y1) return 0;
    let nx = b.p.x - cx, nz = b.p.z - cz;
    const d = Math.hypot(nx, nz);
    if (d >= R + r || d < 1e-9) return 0;
    nx /= d; nz /= d;
    return hit(contact(null, b, cx + nx * R, b.p.y, cz + nz * R, nx, 0, nz, R + r - d, e, mu, fix));
  };
  const ss = (A, a, ra, B, c, rb, e, mu, fix) => {
    let nx = c.x - a.x, ny = c.y - a.y, nz = c.z - a.z;
    const d2 = nx * nx + ny * ny + nz * nz, rr = ra + rb;
    if (d2 >= rr * rr || d2 < 1e-12) return 0;
    const d = Math.sqrt(d2);
    nx /= d; ny /= d; nz /= d;
    return hit(contact(A, B, a.x + nx * ra, a.y + ny * ra, a.z + nz * ra, nx, ny, nz, rr - d, e, mu, fix));
  };

  const HP = { rimY: 3.05, rimR: 0.2386, tube: 0.0095, inner: 0.2286, r: 0.12 };
  const hoopWorld = () => {
    const balls = [];
    const W = { balls, ev: [] };
    W.add = () => {
      const b = body(0.6, 0.00576, 0.00576, 0.00576, [{ x: 0, y: 0, z: 0, r: HP.r }]);
      b.live = false; balls.push(b);
      return b;
    };
    const col = (b, fix) => {
      const r = HP.r;
      let j;
      if ((j = sPlane(b, r, 0, 1, 0, 0, 0.8, 0.55, fix)) && !fix) { b.floor = true; if (j > 0.35) W.ev.push(['floor', b, j]); }
      sPlane(b, r, 0, 0, 1, -4.9, 0.5, 0.3, fix);
      sPlane(b, r, 0, 0, -1, -12, 0.5, 0.3, fix);
      sPlane(b, r, 1, 0, 0, -11, 0.5, 0.3, fix);
      sPlane(b, r, -1, 0, 0, -11, 0.5, 0.3, fix);
      if ((j = sBox(b, r, 0, 3.435, -0.396, 0.915, 0.535, 0.015, 0.62, 0.25, fix)) && !fix) { b.board = true; if (j > 0.2) W.ev.push(['board', b, j]); }
      if ((j = sRing(b, r, 0, HP.rimY, 0, HP.rimR, HP.tube, 0.55, 0.35, fix)) && !fix) { b.rim = true; if (j > 0.12) W.ev.push(['rim', b, j]); }
      if ((j = sBox(b, r, 0, 3.035, -0.31, 0.05, 0.015, 0.07, 0.5, 0.3, fix)) && !fix) b.rim = true;
      sCyl(b, r, 0, -1.9, 0.13, 0, 3.45, 0.4, 0.3, fix);
      sBox(b, r, 0, 3.33, -1.15, 0.05, 0.06, 0.74, 0.4, 0.3, fix);
    };
    W.step = h => {
      for (const b of balls) if (b.live) { b.v.y -= G * h; b.py = b.p.y; }
      for (let it = 0; it < 4; it++) {
        const fix = it === 3;
        for (let i = 0; i < balls.length; i++) {
          const a = balls[i];
          if (!a.live) continue;
          col(a, fix);
          for (let k = i + 1; k < balls.length; k++) if (balls[k].live) ss(a, a.p, HP.r, balls[k], balls[k].p, HP.r, 0.75, 0.2, fix);
        }
      }
      for (const b of balls) {
        if (!b.live) continue;
        const dx = b.p.x, dz = b.p.z, hd = Math.hypot(dx, dz);
        if (b.p.y < HP.rimY && b.p.y > HP.rimY - 0.45 && hd < 0.25) {
          const k = Math.min(1, 7 * h);
          b.v.x -= (b.v.x + dx * 6) * k; b.v.z -= (b.v.z + dz * 6) * k; b.v.y *= 1 - 1.4 * h;
          b.w.x *= 1 - 3 * h; b.w.y *= 1 - 3 * h; b.w.z *= 1 - 3 * h;
        }
        integ(b, h);
        if (!b.scored && b.py >= HP.rimY && b.p.y < HP.rimY && b.v.y < 0 && Math.hypot(b.p.x, b.p.z) < HP.inner) { b.scored = true; W.ev.push(['score', b, 0]); }
      }
    };
    return W;
  };
  const shotSpeed = (d, h, th) => Math.sqrt(G * d * d / (2 * Math.cos(th) ** 2 * Math.max(0.05, d * Math.tan(th) - h)));



  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const smooth = (k, dt) => 1 - Math.exp(-k * dt);
  const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tri01 = u => { const s = ((u % 1) + 1) % 1; return s < 0.5 ? s * 2 : 2 - s * 2; };
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const setT = (el, s) => { s = String(s); if (el.textContent !== s) el.textContent = s; };
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const glSize = (root, pw, ph) => root.clientWidth && root.clientWidth < 560 ? [pw, ph] : [960, 600];
  function fitPR(api, v) {
    if (!COARSE) return;
    const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) v.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / v.w); };
    fit(); api.on(window, 'resize', fit);
  }

  const kit = (root, api, v) => {
    const { THREE: T, renderer, canvas } = v;
    const wrap = document.createElement('div');
    wrap.className = 't4-stage';
    wrap.style.width = canvas.style.width;
    canvas.style.width = '100%';
    root.append(wrap);
    wrap.append(canvas);
    const hud = document.createElement('div');
    hud.className = 't4-hud';
    wrap.append(hud);
    const owned = [], aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const tex = (c, srgb = true) => {
      const t = new T.CanvasTexture(c);
      if (srgb) t.encoding = T.sRGBEncoding;
      t.anisotropy = aniso;
      owned.push(t);
      return t;
    };
    const env = build => {
      const s = new T.Scene();
      build(s);
      const pm = new T.PMREMGenerator(renderer), rt = pm.fromScene(s, 0.04);
      pm.dispose();
      s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      owned.push(rt);
      return rt.texture;
    };
    const glow = () => {
      const [c, g] = cnv(64, 64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return tex(c);
    };
    const pop = (html, cls) => {
      const el = document.createElement('div');
      el.className = 't4-pop ' + (cls || '');
      el.innerHTML = html;
      hud.append(el);
      api.timeout(() => el.remove(), 1400);
    };
    const dispose = scene => {
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
      owned.forEach(t => t.dispose());
    };
    return { T, renderer, canvas, wrap, hud, tex, env, glow, pop, dispose };
  };
  const mount3d = build => (root, api) => {
    let stop = null;
    (async () => {
      const v = await api.gl(...glSize(root, 640, 800));
      if (v && api.alive) { stop = build(root, api, v); fitPR(api, v); }
    })();
    return { destroy() { if (stop) stop(); } };
  };
  const baseCss = id => `
.gm-${id} .t4-stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;background:#15132a;box-shadow:0 22px 44px -26px rgba(31,29,43,.7)}
.gm-${id} .t4-stage canvas{display:block;border-radius:0}
.gm-${id} .t4-hud{position:absolute;inset:0;pointer-events:none;color:#fff;font-family:var(--sans);font-weight:900;line-height:1.1;text-shadow:0 2px 6px rgba(0,0,0,.35)}
.gm-${id} .t4-pill{position:absolute;top:2cqw;min-width:9cqw;padding:.7cqw 1.6cqw .8cqw;border-radius:1.6cqw;background:rgba(18,16,36,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-align:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.gm-${id} .t4-pill span{display:block;font-size:clamp(8px,1.05cqw,11px);letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.gm-${id} .t4-pill b{display:block;font-size:clamp(16px,3.4cqw,34px);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.gm-${id} .t4-meter{position:absolute;right:2.2cqw;top:26%;height:46%;width:clamp(9px,1.5cqw,15px);border-radius:99px;background:linear-gradient(0deg,#22b07d,#9be15d 40%,#f7c548 65%,#ff7a45 85%,#ef4f4f);box-shadow:0 0 0 2px rgba(18,16,36,.55),0 6px 16px rgba(0,0,0,.35);opacity:0;transition:opacity .2s}
.gm-${id} .t4-meter.on{opacity:1}
.gm-${id} .t4-meter i{position:absolute;left:0;right:0;top:0;height:100%;border-radius:99px 99px 0 0;background:rgba(22,20,42,.86)}
.gm-${id} .t4-meter b{position:absolute;left:-5px;right:-5px;height:3px;margin-bottom:-1.5px;border-radius:2px;background:#fff;opacity:0;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.gm-${id} .t4-hint{position:absolute;left:50%;bottom:2.2cqw;transform:translateX(-50%);max-width:92%;text-align:center;font-size:clamp(10px,1.45cqw,15px);font-weight:800;padding:.6cqw 1.8cqw;border-radius:99px;background:rgba(18,16,36,.5);transition:opacity .35s}
.gm-${id} .t4-hint.off{opacity:0}
.gm-${id} .t4-pop{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);font-size:clamp(22px,5.2cqw,54px);letter-spacing:-.02em;white-space:nowrap;text-align:center;animation:t4pop-${id} 1.3s var(--ease) forwards;text-shadow:0 3px 0 rgba(0,0,0,.18),0 6px 20px rgba(0,0,0,.45)}
.gm-${id} .t4-pop small{display:block;font-size:.42em;letter-spacing:.12em;text-transform:uppercase;opacity:.9;margin-top:.2em}
@container (max-width:560px){.gm-${id} .t4-hint{left:2cqw;transform:none;max-width:46%;text-align:left;border-radius:10px;font-size:9.5px;padding:4px 9px}}
@keyframes t4pop-${id}{0%{opacity:0;transform:translate(-50%,-25%) scale(.55)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}24%{transform:translate(-50%,-50%) scale(1)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-95%) scale(.96)}}`;

  const HSPOTS = [['Free throw', 0, 4.22], ['Left wing', -42, 5.0], ['Right wing', 42, 5.0], ['Top of the key', 0, 7.0], ['Left corner', -76, 6.85], ['Right corner', 76, 6.85], ['Deep three', 0, 8.2]];
  const HAND_Y = 1.75, pIdeal = d => 0.6 + (d - 4.22) * 0.075;

  const hoopsGame = (root, api, v) => {
    const K = kit(root, api, v), { T, renderer, canvas, hud } = K, keys = api.keys;
    const scene = new T.Scene(), BG = new T.Color('#17142c');
    scene.background = BG;
    scene.fog = new T.Fog(BG, 13, 40);
    renderer.toneMappingExposure = 0.88;
    scene.environment = K.env(s => {
      s.add(new T.Mesh(new T.BoxGeometry(44, 26, 44), new T.MeshBasicMaterial({ color: '#16132a', side: T.BackSide })));
      const lit = new T.MeshBasicMaterial({ color: new T.Color(4.5, 4.1, 3.6) });
      for (let i = -2; i <= 2; i++) for (let k = -2; k <= 2; k++) {
        const m = new T.Mesh(new T.PlaneGeometry(2.2, 2.2), lit);
        m.rotation.x = Math.PI / 2; m.position.set(i * 6.5, 12, k * 6.5); s.add(m);
      }
      const led = new T.Mesh(new T.PlaneGeometry(44, 1.4), new T.MeshBasicMaterial({ color: new T.Color(2.2, 1.2, 4.5) }));
      led.position.set(0, -2, -21.8); s.add(led);
      const fl = new T.Mesh(new T.PlaneGeometry(44, 44), new T.MeshBasicMaterial({ color: new T.Color(0.42, 0.26, 0.15) }));
      fl.rotation.x = -Math.PI / 2; fl.position.y = -3; s.add(fl);
    });
    const cam = new T.PerspectiveCamera(50, v.w / v.h, 0.05, 90);

    scene.add(new T.HemisphereLight('#fff3e0', '#3d2a1f', 0.42));
    const sun = new T.DirectionalLight('#fff4e6', 1.35);
    sun.position.set(3, 15, 7); sun.target.position.set(0, 0, 1.5);
    sun.castShadow = true; sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 4, far: 34 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    const spotL = new T.SpotLight('#ffffff', 1.1, 26, 0.5, 0.7, 1.2);
    spotL.position.set(0, 12, 2.5); spotL.target.position.set(0, 2.6, -0.2);
    scene.add(spotL, spotL.target);

    const courtTex = (() => {
      const S = 2048 / 24, [c, g] = cnv(2048, 1536), R = rng(11), X = x => (x + 12) * S, Z = z => (z + 5) * S, pw = 0.075 * S;
      for (let x = 0; x < 2048; x += pw) {
        let y = -R() * 220;
        while (y < 1536) {
          const len = (1.2 + R() * 2.6) * S;
          g.fillStyle = `hsl(${29 + R() * 6},${50 + R() * 12}%,${53 + R() * 9}%)`;
          g.fillRect(x, y, pw + 0.6, len);
          for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(90,45,15,${0.04 + R() * 0.07})`; g.fillRect(x + R() * pw, y, 0.5 + R() * 0.8, len); }
          g.fillStyle = 'rgba(60,30,10,.3)'; g.fillRect(x, y, pw, 1);
          y += len;
        }
        g.fillStyle = 'rgba(60,30,10,.22)'; g.fillRect(x, 0, 1, 1536);
      }
      g.fillStyle = 'rgba(70,28,24,.42)';
      g.beginPath(); g.rect(0, 0, 2048, 1536); g.rect(X(-7.5), Z(-1.6), 15 * S, 14 * S); g.fill('evenodd');
      g.fillStyle = 'rgba(108,92,231,.86)'; g.fillRect(X(-2.45), Z(-1.6), 4.9 * S, 5.8 * S);
      g.strokeStyle = 'rgba(255,255,255,.96)'; g.lineWidth = 0.05 * S;
      g.strokeRect(X(-7.5), Z(-1.6), 15 * S, 14 * S);
      g.strokeRect(X(-2.45), Z(-1.6), 4.9 * S, 5.8 * S);
      g.beginPath(); g.arc(X(0), Z(4.2), 1.8 * S, 0, Math.PI); g.stroke();
      g.setLineDash([0.3 * S, 0.25 * S]); g.beginPath(); g.arc(X(0), Z(4.2), 1.8 * S, Math.PI, Math.PI * 2); g.stroke(); g.setLineDash([]);
      const a3 = Math.atan2(1.415, 6.6);
      g.beginPath(); g.moveTo(X(-6.6), Z(-1.6)); g.lineTo(X(-6.6), Z(1.415)); g.arc(X(0), Z(0), 6.75 * S, Math.PI - a3, a3, true); g.lineTo(X(6.6), Z(-1.6)); g.stroke();
      g.beginPath(); g.arc(X(0), Z(0), 1.25 * S, 0, Math.PI); g.stroke();
      g.beginPath(); g.arc(X(0), Z(12.4), 1.8 * S, 0, Math.PI * 2); g.stroke();
      for (const z of [0.3, 1.15, 2.0, 2.85]) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X(s * 2.45), Z(z)); g.lineTo(X(s * 2.62), Z(z)); g.stroke(); }
      g.font = `900 ${0.85 * S}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,.72)';
      g.fillText('GAMEPLAY', X(-4.6), Z(-3.0)); g.fillText('HOOPS 3D', X(4.6), Z(-3.0));
      return K.tex(c);
    })();
    const crowdTex = (() => {
      const [c, g] = cnv(1024, 512), R = rng(21), rows = 34, rh = 512 / rows;
      const shirts = ['#6c5ce7', '#ffffff', '#ff7a45', '#2ec4b6', '#f7c548', '#e84a5f', '#3a86ff', '#9aa0b5', '#2b2d42', '#6c5ce7'];
      const skin = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'], hairs = ['#1c1410', '#3b2417', '#6a4528', '#b98b4a', '#d9d4c8', '#1c1410', '#7a2f1d'];
      g.fillStyle = '#1d1a33'; g.fillRect(0, 0, 1024, 512);
      for (let r = 0; r < rows; r++) {
        const y = r * rh;
        g.fillStyle = '#2b2748'; g.fillRect(0, y + rh * 0.66, 1024, rh * 0.34);
        for (let x = R() * 5; x < 1024; x += 6.5 + R() * 3.5) {
          if (R() < 0.13) continue;
          const sk = skin[(R() * skin.length) | 0], sh = shirts[(R() * shirts.length) | 0], up = R() < 0.16;
          if (up) { g.fillStyle = sk; g.fillRect(x + (R() < 0.5 ? 0.2 : 4.4), y + rh * 0.05, 1, rh * 0.5); }
          g.fillStyle = sh; g.beginPath(); g.moveTo(x - 0.4, y + rh * 0.98); g.lineTo(x - 0.1, y + rh * 0.55); g.quadraticCurveTo(x + 2.75, y + rh * 0.4, x + 5.6, y + rh * 0.55); g.lineTo(x + 5.9, y + rh * 0.98); g.fill();
          g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 0.5, y + rh * 0.58, 2, rh * 0.38);
          g.fillStyle = sk; g.beginPath(); g.arc(x + 2.75, y + rh * 0.33, 2.3, 0, 7); g.fill();
          g.fillStyle = hairs[(R() * hairs.length) | 0]; g.beginPath(); g.arc(x + 2.75, y + rh * 0.3, 2.45, Math.PI * 1.05, Math.PI * 1.95); g.fill();
          if (R() < 0.04) { g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(x + 2.75, y + rh * 0.12, 1.1, 0, 7); g.fill(); }
        }
      }
      for (const x of [256, 768]) { g.fillStyle = '#16142a'; g.fillRect(x - 7, 0, 14, 512); }
      const gr = g.createLinearGradient(0, 0, 0, 512);
      gr.addColorStop(0, 'rgba(12,10,28,.82)'); gr.addColorStop(1, 'rgba(12,10,28,.08)');
      g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
      for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(R() * 1024, R() * 512, 1.5, 0, 7); g.fill(); }
      return K.tex(c);
    })();
    const ledTex = (() => {
      const [c, g] = cnv(2048, 80), gr = g.createLinearGradient(0, 0, 2048, 0);
      ['#6c5ce7', '#3a86ff', '#ff5fa2', '#6c5ce7', '#2ec4b6', '#6c5ce7'].forEach((col, i, a) => gr.addColorStop(i / (a.length - 1), col));
      g.fillStyle = gr; g.fillRect(0, 0, 2048, 80);
      g.font = `900 46px ${FONT}`; g.textBaseline = 'middle'; g.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) g.fillText(i % 2 ? 'HOOPS 3D' : 'GAMEPLAY', 70 + i * 410, 43);
      g.fillStyle = 'rgba(0,0,0,.3)';
      for (let x = 0; x < 2048; x += 4) g.fillRect(x, 0, 1, 80);
      for (let y = 0; y < 80; y += 4) g.fillRect(0, y, 2048, 1);
      const t = K.tex(c);
      t.wrapS = T.RepeatWrapping;
      return t;
    })();
    const ballMaps = (() => {
      const W = 512, H = 256, [c, g] = cnv(W, H), [cb, gb] = cnv(W, H), R = rng(5);
      const im = g.createImageData(W, H), bm = gb.createImageData(W, H);
      for (let y = 0; y < H; y++) {
        const th = (y + 0.5) / H * Math.PI, st = Math.sin(th), py = Math.cos(th);
        for (let x = 0; x < W; x++) {
          const ph = (x + 0.5) / W * Math.PI * 2, px = -Math.cos(ph) * st, pz = Math.sin(ph) * st;
          const d = Math.min(Math.abs(py), Math.abs(pz), Math.abs(Math.abs(px) - 0.52 - 0.3 * py * py));
          const seam = clamp((0.03 - d) / 0.012, 0, 1), n = R(), peb = n > 0.55 ? 1 : 0;
          const k = (y * W + x) * 4, sh = 0.92 + n * 0.1 - peb * 0.05;
          im.data[k] = (232 * sh) * (1 - seam) + 34 * seam;
          im.data[k + 1] = (108 * sh) * (1 - seam) + 22 * seam;
          im.data[k + 2] = (40 * sh) * (1 - seam) + 18 * seam;
          im.data[k + 3] = 255;
          const b = (150 + peb * 70 + n * 20) * (1 - seam);
          bm.data[k] = bm.data[k + 1] = bm.data[k + 2] = b; bm.data[k + 3] = 255;
        }
      }
      g.putImageData(im, 0, 0); gb.putImageData(bm, 0, 0);
      return [K.tex(c), K.tex(cb, false)];
    })();
    const marksTex = (() => {
      const [c, g] = cnv(512, 300), s = 512 / 1.83;
      g.strokeStyle = '#fff'; g.lineWidth = 0.05 * s;
      g.strokeRect(0.04 * s, 0.04 * s, 512 - 0.08 * s, 300 - 0.08 * s);
      g.strokeRect((1.83 - 0.59) / 2 * s, (3.97 - 3.51) * s, 0.59 * s, 0.45 * s);
      return K.tex(c);
    })();

    const bannerTex = (() => {
      const [c, g] = cnv(1024, 512), cols = [['#6c5ce7', '#3a2fb0'], ['#ff7a45', '#c2410c'], ['#2ec4b6', '#0f766e'], ['#e84a5f', '#9f1239']];
      cols.forEach(([c1, c2], i) => {
        const x = i * 256, gr = g.createLinearGradient(x, 0, x, 512);
        gr.addColorStop(0, c1); gr.addColorStop(1, c2);
        g.fillStyle = gr; g.beginPath(); g.moveTo(x + 14, 0); g.lineTo(x + 242, 0); g.lineTo(x + 242, 430); g.lineTo(x + 128, 500); g.lineTo(x + 14, 430); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 28, 14); g.lineTo(x + 228, 14); g.lineTo(x + 228, 416); g.lineTo(x + 128, 474); g.lineTo(x + 28, 416); g.closePath(); g.stroke();
        g.fillStyle = '#fff'; g.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 26 : 62; g.lineTo(x + 128 + Math.cos(a) * r, 150 + Math.sin(a) * r); }
        g.closePath(); g.fill();
        g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.fillText(['CHAMPS', 'MVP', 'FINALS', 'ALL-STAR'][i], x + 128, 290);
        g.font = `900 28px ${FONT}`; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(String(2019 + i * 2), x + 128, 340);
      });
      return K.tex(c);
    })();
    const clockTex = (() => {
      const [c, g] = cnv(256, 128);
      g.fillStyle = '#14101f'; g.fillRect(0, 0, 256, 128);
      g.font = `900 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = '#ff2d2d'; g.shadowBlur = 16; g.fillStyle = '#ff4a3d'; g.fillText('24', 128, 70);
      return K.tex(c);
    })();
    const floor = new T.Mesh(new T.PlaneGeometry(24, 18), new T.MeshStandardMaterial({ map: courtTex, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.86, envMapIntensity: 0.5 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); floor.receiveShadow = true;
    scene.add(floor);
    const mirror = new T.Group();
    mirror.scale.y = -1;
    scene.add(mirror);
    const crowdMat = new T.MeshBasicMaterial({ map: crowdTex, color: '#8a87a3' });
    const stands = (x, z, ry, w) => {
      const gp = new T.Group(), m = new T.Mesh(new T.PlaneGeometry(w, 10), crowdMat), a = 0.58;
      m.rotation.x = -a; m.position.set(0, 1.25 + 5 * Math.cos(a), -5 * Math.sin(a));
      gp.add(m); gp.position.set(x, 0, z); gp.rotation.y = ry; scene.add(gp);
    };
    stands(0, -5.4, 0, 30); stands(-12.6, 4, Math.PI / 2, 20); stands(12.6, 4, -Math.PI / 2, 20);
    const bannerMat = new T.MeshBasicMaterial({ map: bannerTex, color: '#b9b6d0', transparent: true, alphaTest: 0.5 });
    [[-7.3, 0], [-4.7, 1], [4.7, 2], [7.3, 3]].forEach(([x, i]) => {
      const geo = new T.PlaneGeometry(1.7, 3.4), uv = geo.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setX(k, i * 0.25 + uv.getX(k) * 0.25);
      const m = new T.Mesh(geo, bannerMat);
      m.position.set(x, 7.4, -7.6); scene.add(m);
    });
    const ledMat = new T.MeshBasicMaterial({ map: ledTex, toneMapped: false });
    const leds = [[0, -4.85, 0, 24], [-12.1, 4, Math.PI / 2, 18], [12.1, 4, -Math.PI / 2, 18]].map(([x, z, ry, w]) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, 0.9), ledMat);
      m.position.set(x, 0.5, z); m.rotation.y = ry; scene.add(m); mirror.add(m.clone());
      return m;
    });

    const hoop = new T.Group();
    scene.add(hoop);
    const part = (geo, mat, x, y, z, cast = true) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; hoop.add(m);
      return m;
    };
    const dark = new T.MeshStandardMaterial({ color: '#2a2838', roughness: 0.45, metalness: 0.5 });
    const padM = new T.MeshStandardMaterial({ color: '#5a49d6', roughness: 0.7 });
    const padD = new T.MeshStandardMaterial({ color: '#26213f', roughness: 0.8, envMapIntensity: 0.4 });
    const orange = new T.MeshStandardMaterial({ color: '#ff5a1f', roughness: 0.3, metalness: 0.55 });
    part(new T.BoxGeometry(1.83, 1.07, 0.03), new T.MeshStandardMaterial({ color: '#dcefff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.3, envMapIntensity: 2.5, depthWrite: false }), 0, 3.435, -0.396, false);
    const fw = 0.045;
    part(new T.BoxGeometry(1.83 + fw * 2, fw, 0.05), dark, 0, 3.97 + fw / 2, -0.396);
    part(new T.BoxGeometry(1.83 + fw * 2, fw, 0.05), dark, 0, 2.9 - fw / 2, -0.396);
    part(new T.BoxGeometry(fw, 1.07, 0.05), dark, -0.915 - fw / 2, 3.435, -0.396);
    part(new T.BoxGeometry(fw, 1.07, 0.05), dark, 0.915 + fw / 2, 3.435, -0.396);
    const marks = new T.Mesh(new T.PlaneGeometry(1.83, 1.07), new T.MeshBasicMaterial({ map: marksTex, transparent: true, depthWrite: false }));
    marks.position.set(0, 3.435, -0.379); hoop.add(marks);
    part(new T.BoxGeometry(1.97, 0.07, 0.1), padM, 0, 2.85, -0.39);
    part(new T.BoxGeometry(0.1, 0.03, 0.15), orange, 0, 3.035, -0.31);
    part(new T.BoxGeometry(0.34, 0.26, 0.03), dark, 0, 3.08, -0.43);
    part(new T.BoxGeometry(0.1, 0.12, 1.5), dark, 0, 3.33, -1.15);
    part(new T.BoxGeometry(0.07, 0.07, 1.62), dark, 0, 2.9, -1.17).rotation.x = -0.45;
    part(new T.CylinderGeometry(0.1, 0.1, 3.45, 20), dark, 0, 1.725, -1.9);
    part(new T.CylinderGeometry(0.15, 0.15, 2.0, 24), padD, 0, 1.0, -1.9);
    part(new T.BoxGeometry(1.3, 0.85, 1.7), padD, 0, 0.425, -2.75);
    part(new T.BoxGeometry(1.32, 0.08, 1.72), padM, 0, 0.82, -2.75);
    part(new T.TorusGeometry(HP.rimR, HP.tube, 10, 48), orange, 0, HP.rimY, 0).rotation.x = Math.PI / 2;
    const gusset = new T.Shape();
    gusset.moveTo(0, 0); gusset.lineTo(0.16, 0); gusset.lineTo(0, -0.1); gusset.closePath();
    const gGeo = new T.ExtrudeGeometry(gusset, { depth: 0.02, bevelEnabled: false });
    gGeo.rotateY(Math.PI / 2); gGeo.translate(-0.01, 0, 0);
    part(gGeo, orange, 0, 3.02, -0.33, false).rotation.y = Math.PI;
    for (const sx of [-1, 1]) part(new T.CylinderGeometry(0.012, 0.012, 0.16, 8), orange, sx * 0.05, 3.035, -0.275, false).rotation.x = Math.PI / 2;
    const led = new T.MeshBasicMaterial({ color: new T.Color(0.55, 0.45, 2.2), toneMapped: false });
    for (const [lw, lh, lx, ly] of [[1.83, 0.02, 0, 3.955], [1.83, 0.02, 0, 2.915], [0.02, 1.07, -0.905, 3.435], [0.02, 1.07, 0.905, 3.435]]) part(new T.BoxGeometry(lw, lh, 0.012), led, lx, ly, -0.372, false);
    part(new T.BoxGeometry(0.9, 0.34, 0.12), dark, 0, 4.17, -0.5);
    const clockFace = new T.Mesh(new T.PlaneGeometry(0.8, 0.28), new T.MeshBasicMaterial({ map: clockTex, toneMapped: false }));
    clockFace.position.set(0, 4.17, -0.438); hoop.add(clockFace);
    for (const sx of [-1, 1]) part(new T.BoxGeometry(0.05, 0.22, 0.05), dark, sx * 0.36, 4.0, -0.45, false);
    for (const y of [0.55, 1.35]) part(new T.CylinderGeometry(0.153, 0.153, 0.09, 24), padM, 0, y, -1.9, false);
    part(new T.CylinderGeometry(0.2, 0.2, 0.05, 24), dark, 0, 0.02, -1.9, false);
    part(new T.CylinderGeometry(0.1, 0.14, 0.2, 20), dark, 0, 2.2, -1.9, false);

    const NC = 12, NR = 6, NV = NC * (NR + 1);
    const rest = new Float32Array(NV * 3), off = new Float32Array(NV * 3), vel = new Float32Array(NV * 3);
    for (let j = 0; j <= NR; j++) for (let i = 0; i < NC; i++) {
      const k = (j * NC + i) * 3, f = j / NR, a = (i + 0.5 * (j % 2)) / NC * Math.PI * 2, r = 0.232 - 0.1 * Math.pow(f, 0.85);
      rest[k] = Math.cos(a) * r; rest[k + 1] = HP.rimY - 0.01 - 0.42 * f; rest[k + 2] = Math.sin(a) * r;
    }
    const segs = [];
    for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
      const a = j * NC + i;
      segs.push(a, (j + 1) * NC + i, a, (j + 1) * NC + ((i + (j % 2 ? 1 : -1) + NC) % NC));
    }
    const netPos = new Float32Array(segs.length * 3), netGeo = new T.BufferGeometry();
    netGeo.setAttribute('position', new T.BufferAttribute(netPos, 3));
    const net = new T.LineSegments(netGeo, new T.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 }));
    net.frustumCulled = false;
    hoop.add(net);
    mirror.add(hoop.clone());

    const ballGeo = new T.SphereGeometry(HP.r, 40, 28);
    const ballMat = new T.MeshStandardMaterial({ map: ballMaps[0], bumpMap: ballMaps[1], bumpScale: 0.012, roughness: 0.62, metalness: 0, emissive: new T.Color('#ff4a00'), emissiveIntensity: 0 });
    const W = hoopWorld(), balls = [], byBody = new Map();
    for (let i = 0; i < 5; i++) {
      const b = W.add(), m = new T.Mesh(ballGeo, ballMat), mm = new T.Mesh(ballGeo, ballMat);
      m.castShadow = true; m.visible = mm.visible = false;
      scene.add(m); mirror.add(mm);
      const o = { b, m, mm, st: 'off', s: 0, age: 0 };
      balls.push(o); byBody.set(b, o);
    }

    const guideGeo = new T.PlaneGeometry(0.05, 2.8);
    guideGeo.translate(0, 1.4, 0); guideGeo.rotateX(-Math.PI / 2);
    const guide = new T.Mesh(guideGeo, new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
    guide.position.y = 0.006; scene.add(guide);
    const NP = 90, pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3), pLife = new Float32Array(NP);
    const pGeo = new T.BufferGeometry();
    pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new T.BufferAttribute(pCol, 3));
    const parts = new T.Points(pGeo, new T.PointsMaterial({ size: 0.2, map: K.glow(), vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    parts.frustumCulled = false; scene.add(parts);
    let pIdx = 0;
    const emit = (x, y, z, vx, vy, vz) => {
      const i = pIdx++ % NP, k = i * 3;
      pPos[k] = x + (Math.random() - 0.5) * 0.12; pPos[k + 1] = y + (Math.random() - 0.5) * 0.12; pPos[k + 2] = z + (Math.random() - 0.5) * 0.12;
      pVel[k] = vx * 0.2 + (Math.random() - 0.5) * 0.4; pVel[k + 1] = vy * 0.2 + 0.4 + Math.random() * 0.5; pVel[k + 2] = vz * 0.2 + (Math.random() - 0.5) * 0.4;
      pLife[i] = 1;
    };

    hud.innerHTML = `<div class="t4-pill" style="left:2cqw"><span>Time</span><b class="hs-time">60</b></div>
<div class="t4-pill" style="right:2cqw"><span>Score</span><b class="hs-score">0</b></div>
<div class="hs-mid"><b class="hs-spot">Free throw</b><div class="hs-dots"><i></i><i></i><i></i></div><div class="hs-fire">On fire</div></div>
<div class="t4-meter"><i></i><b></b></div>
<div class="t4-hint off">Flick up from the ball to shoot &middot; or hold <b>Space</b>, <b>&larr; &rarr;</b> to aim</div>`;
    const $ = s => hud.querySelector(s);
    const hTime = $('.hs-time'), hScore = $('.hs-score'), hSpot = $('.hs-spot'), hDots = [...hud.querySelectorAll('.hs-dots i')], hFire = $('.hs-fire');
    const meter = $('.t4-meter'), meterCover = meter.querySelector('i'), meterMark = meter.querySelector('b'), hint = $('.t4-hint');

    let st = 'intro', time = 60, score = 0, makes = 0, shots = 0, swishes = 0, streak = 0, bestStreak = 0, spot = 0, atSpot = 0;
    let held = null, cool = 0, moveT = 0, endT = 0, charging = false, chargeT = 0, drag = null, kyaw = 0, guideT = 0;
    let lastP = null, lastMade = false, acc = 0, shake = 0, sndT = 0, tickSec = 99, clock = 0;
    const mult = () => streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
    const spotXZ = i => { const [, a, d] = HSPOTS[i], r = a * Math.PI / 180; return [Math.sin(r) * d, Math.cos(r) * d, -Math.sin(r), -Math.cos(r)]; };
    const handPos = (o, p) => {
      const [x, z, fx, fz] = spotXZ(spot), pull = p * 0.07;
      o.x = x + fx * (0.38 - pull); o.y = HAND_Y - pull * 0.6; o.z = z + fz * (0.38 - pull);
      return o;
    };
    const V1 = new T.Vector3(), camP = new T.Vector3(0, 2.4, 9), camL = new T.Vector3(0, 2.6, 0), wantP = new T.Vector3(), wantL = new T.Vector3();
    let fov = 50;
    const hud2 = () => {
      setT(hScore, score);
      setT(hSpot, HSPOTS[spot][0]);
      hDots.forEach((d, i) => d.classList.toggle('on', i < atSpot));
      const m = mult();
      hFire.classList.toggle('on', m > 1);
      setT(hFire, m > 1 ? `On fire  ×${m}` : 'On fire');
    };
    const meterShow = p => {
      meter.classList.toggle('on', p != null);
      if (p != null) meterCover.style.height = (100 - clamp(p / 1.2, 0, 1) * 100).toFixed(1) + '%';
      if (lastP != null) { meterMark.style.opacity = 1; meterMark.style.bottom = (clamp(lastP / 1.2, 0, 1) * 100).toFixed(1) + '%'; meterMark.style.background = lastMade ? '#22b07d' : '#fff'; }
    };
    const spawn = () => {
      const o = balls.find(q => q.st === 'off') || balls.filter(q => q.st === 'rest' || (q.st === 'fly' && q.b.res)).sort((a, c) => c.age - a.age)[0];
      if (!o) return;
      o.b.live = false; o.st = 'hand'; o.s = 0; o.age = 0;
      o.b.q.x = o.b.q.y = o.b.q.z = 0; o.b.q.w = 1;
      held = o;
    };
    const dragP = () => {
      const r = canvas.getBoundingClientRect(), dy = drag.y0 - drag.y, dx = drag.x - drag.x0;
      return [clamp(dy / (0.5 * Math.max(r.height, 360)), 0, 1.2), clamp(Math.atan2(dx, Math.max(dy, 24)) * 0.22, -0.2, 0.2), dy];
    };
    const shoot = (p, yaw) => {
      if (!held || st !== 'play') return;
      const o = held, b = o.b;
      held = null;
      handPos(b.p, p);
      const dx = -b.p.x, dz = -b.p.z, d = Math.hypot(dx, dz), h = HP.rimY - b.p.y;
      const th = Math.atan(Math.tan(47 * Math.PI / 180) + 2 * h / d), ideal = pIdeal(HSPOTS[spot][2]), sp = shotSpeed(d, h, th) * (1.006 + 0.3 * (p - ideal));
      const cx = dx / d, cz = dz / d, c = Math.cos(yaw), s = Math.sin(yaw), ux = cx * c - cz * s, uz = cx * s + cz * c, hv = sp * Math.cos(th);
      b.v.x = ux * hv; b.v.z = uz * hv; b.v.y = sp * Math.sin(th);
      b.w.x = -uz * 14; b.w.y = 0; b.w.z = ux * 14;
      b.live = true; b.rim = b.board = b.floor = b.scored = false; b.res = null; b.t = 0; b.pow = p - ideal; b.yaw = yaw;
      o.st = 'fly'; o.age = 0; o.s = 1;
      shots++; cool = 0.55; lastP = p; lastMade = false; guideT = 0;
      hint.classList.add('off');
      api.sfx('tap');
    };
    const netKick = k => {
      for (let j = 1; j <= NR; j++) for (let i = 0; i < NC; i++) {
        const q = (j * NC + i) * 3, f = j / NR;
        vel[q + 1] -= k * f * 1.3; vel[q] -= rest[q] * k * 2.2 * f; vel[q + 2] -= rest[q + 2] * k * 2.2 * f;
      }
    };
    const make = o => {
      const b = o.b, swish = !b.rim && !b.board, bank = b.board && !b.rim, m = mult(), pts = (swish ? 3 : 2) * m;
      b.res = 'make';
      if (st !== 'play' && st !== 'buzz') return;
      score += pts; makes++; streak++; bestStreak = Math.max(bestStreak, streak); atSpot++;
      if (swish) swishes++;
      lastMade = true;
      api.score(score);
      K.pop(`+${pts}<small>${time <= 0 ? 'Buzzer beater!' : swish ? 'Swish' : bank ? 'Bank shot' : 'Bucket'}${m > 1 ? '  ×' + m : ''}</small>`, swish ? 'hs-swish' : '');
      api.sfx(swish ? 'pop' : 'good');
      netKick(swish ? 1.4 : 0.9);
      if (streak === 3 || streak === 6) api.timeout(() => { if (st !== 'intro') { K.pop(streak >= 6 ? 'Unstoppable!' : 'On fire!', 'hs-hot'); api.sfx('win'); } }, 450);
      if (atSpot >= 3 && st === 'play' && !moveT) moveT = 0.75;
      hud2();
    };
    const miss = o => {
      const b = o.b;
      b.res = 'miss';
      if (st !== 'play' && st !== 'buzz') return;
      if (streak >= 3) K.pop('Fire’s out', 'hs-cold');
      else K.pop(b.pow < -0.035 ? 'Short' : b.pow > 0.05 ? 'Long' : Math.abs(b.yaw) > 0.016 ? (b.yaw > 0 ? 'Wide right' : 'Wide left') : 'Rimmed out', 'hs-miss');
      streak = 0;
      hud2();
    };
    const start = () => {
      for (const o of balls) { o.st = 'off'; o.b.live = false; o.m.visible = o.mm.visible = false; }
      st = 'play'; time = 60; score = makes = shots = swishes = streak = bestStreak = spot = atSpot = 0;
      held = null; cool = 0.35; moveT = 0; endT = 0; charging = false; drag = null; kyaw = 0; lastP = null; tickSec = 99;
      hint.classList.remove('off');
      api.score(0); hud2(); meterShow(null);
      setT(hTime, 60); hTime.classList.remove('low');
    };
    const finish = () => {
      st = 'over';
      meterShow(null);
      const nb = api.submit(score);
      api.sfx(nb ? 'win' : 'lose');
      api.overlay({
        kicker: nb ? 'New best!' : 'Time!', title: `${score} point${score === 1 ? '' : 's'}`,
        stats: [['Makes', `${makes}/${shots}`], ['Swishes', swishes], ['Best streak', bestStreak], ['Best', api.best ?? '—']],
        button: 'Play again', onAction: start
      });
    };

    api.on(canvas, 'pointerdown', e => {
      if (st !== 'play' || !held || charging || drag) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
      meterShow(0);
    });
    api.on(canvas, 'pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.x = e.clientX; drag.y = e.clientY;
    });
    api.on(canvas, 'pointerup', e => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.x = e.clientX; drag.y = e.clientY;
      const [p, yaw, dy] = dragP();
      drag = null;
      if (dy > 14) shoot(p, yaw); else meterShow(null);
    });
    api.on(canvas, 'pointercancel', () => { drag = null; meterShow(null); });
    api.on(canvas, 'lostpointercapture', () => { if (drag) { drag = null; meterShow(null); } });
    api.on(window, 'keydown', e => {
      if (e.code !== 'Space' || e.repeat || st !== 'play' || !held || drag) return;
      charging = true; chargeT = 0;
    });
    api.on(window, 'keyup', e => {
      if (e.code !== 'Space' || !charging) return;
      charging = false;
      if (st === 'play' && held) shoot(1.2 * tri01(chargeT / 2), kyaw); else meterShow(null);
    });

    const H = 1 / 360;
    api.loop(dt => {
      clock += dt;
      cool -= dt; sndT -= dt;
      if (st === 'play') {
        const ax = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
        if (ax) { kyaw = clamp(kyaw + ax * dt * 0.07, -0.14, 0.14); guideT = 1.5; }
        time -= dt;
        const sec = Math.ceil(time);
        if (sec <= 5 && sec < tickSec && sec > 0) { tickSec = sec; api.sfx('tick'); }
        setT(hTime, Math.max(0, sec));
        hTime.classList.toggle('low', time <= 10);
        if (time <= 0) {
          st = 'buzz'; endT = 0; charging = false; drag = null;
          if (held) { held.st = 'off'; held = null; }
          K.pop('Time!', 'hs-cold'); api.sfx('bad'); meterShow(null);
        }
        if (moveT > 0 && (moveT -= dt) <= 0) {
          moveT = 0;
          spot = spot + 1 >= HSPOTS.length ? 3 : spot + 1; atSpot = 0;
          if (held) { held.st = 'off'; held = null; }
          cool = 0.85; charging = false; drag = null; meterShow(null);
          K.pop(HSPOTS[spot][0] + '<small>New spot</small>', 'hs-spot'); api.sfx('tick');
          hud2();
        }
        if (st === 'play' && !held && cool <= 0) spawn();
      } else if (st === 'buzz') {
        endT += dt;
        if (endT > 4.5 || !balls.some(o => o.st === 'fly' && !o.b.res)) finish();
      }

      acc = Math.min(acc + dt, 0.1);
      while (acc >= H) {
        W.step(H); acc -= H;
        for (const o of balls) if (o.st === 'fly' && !o.b.res) o.b.t += H;
      }
      for (const [k, b, j] of W.ev) {
        const o = byBody.get(b);
        if (k === 'score') { if (o && o.st === 'fly' && !b.res) make(o); }
        else if (k === 'rim') { shake = Math.max(shake, Math.min(0.5, j * 0.25)); if (sndT <= 0) { api.sfx('hit'); sndT = 0.08; } }
        else if (k === 'board') { if (sndT <= 0) { api.sfx('tick'); sndT = 0.08; } }
      }
      W.ev.length = 0;
      for (const o of balls) {
        if (o.st === 'fly' || o.st === 'rest') o.age += dt;
        if (o.st === 'fly' && !o.b.res && (o.b.floor || o.b.t > 4)) miss(o);
        if (o.st === 'fly' && o.b.res && o.age > 2.5) o.st = 'rest';
        if (o.st === 'rest' && o.age > 7) { o.s -= dt * 3; if (o.s <= 0) { o.st = 'off'; o.b.live = false; } }
      }

      let showP = null, gYaw = kyaw;
      if (charging) { chargeT += dt; showP = 1.2 * tri01(chargeT / 2); }
      if (drag) { const r = dragP(); showP = r[0]; gYaw = r[1]; }
      if (showP != null || meter.classList.contains('on')) meterShow(showP);
      guideT -= dt;
      const gOn = held && (drag || charging || guideT > 0);
      guide.material.opacity += ((gOn ? 0.42 : 0) - guide.material.opacity) * smooth(10, dt);
      if (held) {
        handPos(V1, showP || 0);
        const dx = -V1.x, dz = -V1.z, d = Math.hypot(dx, dz), c = Math.cos(gYaw), s = Math.sin(gYaw), ux = (dx * c - dz * s) / d, uz = (dx * s + dz * c) / d;
        guide.position.x = V1.x; guide.position.z = V1.z; guide.rotation.y = Math.atan2(-ux, -uz);
      }

      const fire = mult() > 1;
      ballMat.emissiveIntensity += ((fire ? 0.55 + Math.sin(clock * 9) * 0.1 : 0) - ballMat.emissiveIntensity) * smooth(6, dt);

      for (const o of balls) {
        const { m, mm, b } = o;
        if (o.st === 'off') { m.visible = mm.visible = false; continue; }
        if (o.st === 'hand') {
          o.s = Math.min(1, o.s + dt * 5);
          handPos(V1, showP || 0);
          b.p.x = V1.x; b.p.y = V1.y + Math.sin(clock * 2.4) * 0.012; b.p.z = V1.z;
          m.rotation.set(0, clock * 0.6, 0.25);
          if (fire && Math.random() < dt * 30) emit(b.p.x, b.p.y, b.p.z, 0, 0, 0);
        } else {
          m.quaternion.set(b.q.x, b.q.y, b.q.z, b.q.w);
          if (fire && o.st === 'fly' && !b.res) for (let k = 0; k < 2; k++) emit(b.p.x, b.p.y, b.p.z, b.v.x, b.v.y, b.v.z);
        }
        const sc = o.st === 'hand' ? easeIO(o.s) : Math.max(0.001, o.s);
        m.position.set(b.p.x, b.p.y, b.p.z); m.scale.setScalar(sc); m.visible = true;
        mm.position.copy(m.position); mm.quaternion.copy(m.quaternion); mm.scale.setScalar(sc); mm.visible = b.p.y < 1.2;
      }

      for (let i = 0; i < NP; i++) {
        const k = i * 3;
        if (pLife[i] > 0) {
          pLife[i] -= dt * 2.4;
          const l = Math.max(0, pLife[i]);
          pPos[k] += pVel[k] * dt; pPos[k + 1] += pVel[k + 1] * dt; pPos[k + 2] += pVel[k + 2] * dt;
          pCol[k] = l; pCol[k + 1] = l * (0.25 + 0.5 * l); pCol[k + 2] = l * l * 0.2;
        } else { pCol[k] = pCol[k + 1] = pCol[k + 2] = 0; }
      }
      pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;

      const step = Math.min(dt, 1 / 30);
      for (let j = 1; j <= NR; j++) for (let i = 0; i < NC; i++) {
        const q = (j * NC + i) * 3, up = ((j - 1) * NC + i) * 3, dn = j < NR ? ((j + 1) * NC + i) * 3 : q;
        for (let a = 0; a < 3; a++) {
          const f = -140 * off[q + a] - 5 * vel[q + a] + 55 * ((off[up + a] + off[dn + a]) * 0.5 - off[q + a]);
          vel[q + a] += f * step;
        }
      }
      for (let q = NC * 3; q < NV * 3; q++) off[q] += vel[q] * step;
      for (const o of balls) {
        const b = o.b;
        if (!b.live || Math.abs(b.p.y - (HP.rimY - 0.2)) > 0.5 || Math.hypot(b.p.x, b.p.z) > 0.5) continue;
        const R2 = HP.r + 0.012;
        for (let q = NC * 3; q < NV * 3; q += 3) {
          const x = rest[q] + off[q] - b.p.x, y = rest[q + 1] + off[q + 1] - b.p.y, z = rest[q + 2] + off[q + 2] - b.p.z, d = Math.hypot(x, y, z);
          if (d < R2 && d > 1e-6) {
            const push = (R2 - d) / d;
            off[q] += x * push; off[q + 1] += y * push; off[q + 2] += z * push;
            vel[q] = vel[q] * 0.3 + b.v.x * 0.5; vel[q + 1] = vel[q + 1] * 0.3 + b.v.y * 0.5; vel[q + 2] = vel[q + 2] * 0.3 + b.v.z * 0.5;
          }
        }
      }
      for (let s = 0; s < segs.length; s++) {
        const q = segs[s] * 3, k = s * 3;
        netPos[k] = rest[q] + off[q]; netPos[k + 1] = rest[q + 1] + off[q + 1]; netPos[k + 2] = rest[q + 2] + off[q + 2];
      }
      netGeo.attributes.position.needsUpdate = true;

      const [sx, sz, fx, fz] = spotXZ(spot);
      wantP.set(sx - fx * 1.55, 2.12, sz - fz * 1.55);
      wantL.set(0, 2.5, 0);
      if (st === 'intro') { wantP.x += Math.sin(clock * 0.25) * 1.3; wantP.y += 0.3; }
      camP.lerp(wantP, smooth(3.2, dt)); camL.lerp(wantL, smooth(3.2, dt));
      const wantF = 50 - (HSPOTS[spot][2] - 4.22) * 1.4;
      if (Math.abs(wantF - fov) > 0.01) { fov += (wantF - fov) * smooth(3, dt); cam.fov = fov; cam.updateProjectionMatrix(); }
      shake *= Math.exp(-dt * 9);
      cam.position.set(camP.x + (Math.random() - 0.5) * shake * 0.03, camP.y + (Math.random() - 0.5) * shake * 0.03, camP.z);
      cam.lookAt(camL);
      renderer.render(scene, cam);
    });

    renderer.compile(scene, cam);
    hud2();
    api.overlay({
      kicker: '3D', title: 'Hoops 3D',
      text: 'Flick up from the ball to shoot: the flick length is power, its angle is aim. On a keyboard hold <kbd>Space</kbd>, let go at the right power, <kbd>&larr;</kbd> <kbd>&rarr;</kbd> to aim. Swish = 3, bucket = 2, three in a row and you’re on fire. Every 3 makes you move further out, so flick harder. 60 seconds!',
      button: 'Play', onAction: start
    });
    return () => K.dispose(scene);
  };

  Ameplay.register({
    id: 'hoops-3d',
    title: 'Hoops 3D',
    category: '3D',
    blurb: 'Flick, swish and catch fire. Sink all you can in 60 seconds.',
    help: 'Flick up from the ball to shoot (length = power, angle = aim) &middot; or hold <kbd>Space</kbd> and release, <kbd>&larr;</kbd> <kbd>&rarr;</kbd> to aim',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="6" width="28" height="19" rx="2"/><rect x="39" y="13" width="10" height="8" opacity=".35"/><path d="M34 27h20"/><path d="M36 27l3 9M52 27l-3 9M41 27l3 9M47 27l-3 9" opacity=".5"/><circle cx="20" cy="43" r="13"/><path d="M7 43h26M20 30v26M11 33c4.5 4 4.5 16 0 20M29 33c-4.5 4-4.5 16 0 20"/></svg>',
    css: baseCss('hoops-3d') + `
.gm-hoops-3d .hs-mid{position:absolute;left:50%;top:2cqw;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.6cqw}
.gm-hoops-3d .hs-spot{font-size:clamp(11px,1.7cqw,17px);padding:.5cqw 1.6cqw;border-radius:99px;background:rgba(18,16,36,.5);white-space:nowrap}
.gm-hoops-3d .hs-dots{display:flex;gap:.7cqw}
.gm-hoops-3d .hs-dots i{width:clamp(7px,1.1cqw,11px);height:clamp(7px,1.1cqw,11px);border-radius:50%;background:rgba(255,255,255,.25);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.6);transition:background .25s,transform .35s var(--spring)}
.gm-hoops-3d .hs-dots i.on{background:#ff8a3d;box-shadow:none;transform:scale(1.15)}
.gm-hoops-3d .hs-fire{font-size:clamp(10px,1.45cqw,15px);letter-spacing:.06em;text-transform:uppercase;padding:.45cqw 1.4cqw;border-radius:99px;background:linear-gradient(90deg,#ff3d3d,#ff8a00,#ffd23f);opacity:0;transform:scale(.6);transition:opacity .3s,transform .4s var(--spring);white-space:pre}
.gm-hoops-3d .hs-fire.on{opacity:1;transform:none}
.gm-hoops-3d .t4-pill b.low{color:#ff6b6b}
.gm-hoops-3d .t4-pop.hs-swish{color:#fff6c8}
.gm-hoops-3d .t4-pop.hs-hot{color:#ffb13d}
.gm-hoops-3d .t4-pop.hs-cold{color:#bfe3ff}
.gm-hoops-3d .t4-pop.hs-miss{font-size:clamp(16px,3cqw,30px);color:#ffd9d9;top:58%}
.gm-hoops-3d .t4-pop.hs-spot{color:#d9d3ff;top:30%}`,
    mount: mount3d(hoopsGame)
  });

})();

