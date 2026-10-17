
(() => {
  'use strict';
  const C = Ameplay.colors;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const smooth = t => t * t * (3 - 2 * t);
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const glSize = (root, pw, ph) => root.clientWidth && root.clientWidth < 560 ? [pw, ph] : [960, 600];
  function fitPR(api, v) {
    if (!COARSE) return;
    const fit = () => { const cw = v.canvas.clientWidth; if (cw && !document.fullscreenElement) v.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / v.w); };
    fit(); api.on(window, 'resize', fit);
  }

  function hash2(x, z) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function vnoise(x, z) {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, z, oct) {
    let s = 0, amp = .5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, z * f); n += amp; amp *= .5; f *= 2.03; }
    return s / n;
  }

  const uiCss = id => `
.gm-${id} .wrap{position:relative;max-width:100%;container-type:inline-size;border-radius:var(--r);overflow:hidden;background:#bcd6ee;box-shadow:0 18px 40px -24px rgba(20,24,60,.55)}
.gm-${id} .wrap canvas{width:100%!important;border-radius:0}
.gm-${id} .hud{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff}
.gm-${id} .chip{position:relative;display:flex;flex-direction:column;gap:1px;padding:max(4px,1cqw) max(7px,1.6cqw);border-radius:max(8px,1.5cqw);background:rgba(16,18,40,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 8px 20px -10px rgba(0,0,0,.55)}
.gm-${id} .chip .k{font-size:max(7px,1.1cqw);font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.72}
.gm-${id} .chip .v{font-size:max(12px,2.6cqw);font-weight:900;font-variant-numeric:tabular-nums;line-height:1.08;letter-spacing:-.02em}
.gm-${id} .chip .v small{font-size:.5em;opacity:.7;margin-left:3px}
.gm-${id} .pop{position:absolute;left:50%;top:34%;font-size:max(16px,3.3cqw);font-weight:900;white-space:nowrap;text-shadow:0 3px 0 rgba(0,0,0,.28),0 0 22px rgba(255,190,70,.9);animation:${id}-pop 1.05s cubic-bezier(.2,.8,.2,1) forwards}
.gm-${id} .pop.sm{font-size:max(12px,2cqw);top:44%;text-shadow:0 2px 0 rgba(0,0,0,.3)}
.gm-${id} .pop.bad{color:#ffd0d0;text-shadow:0 2px 0 rgba(0,0,0,.3)}
@keyframes ${id}-pop{0%{opacity:0;transform:translate(-50%,-20%) scale(.55)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.18)}28%{transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-170%) scale(.96)}}
.gm-${id} .ctl{display:none;width:100%;max-width:960px;justify-content:space-between;align-items:center;gap:12px}
.gm-${id} .pad{display:flex;gap:12px}
.gm-${id} .pad.r{margin-left:auto}
.gm-${id} .pad button{width:68px;height:68px;padding:0;border-radius:50%;border:0;background:var(--sunk);color:var(--ink);display:grid;place-items:center;touch-action:none;-webkit-user-select:none;user-select:none;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(31,29,43,.12)}
.gm-${id} .pad button.on{background:var(--accent);color:#fff;box-shadow:none;transform:translateY(2px)}
.gm-${id} .pad svg{width:42%;height:42%;pointer-events:none}
@media (hover:none),(pointer:coarse){.gm-${id} .ctl{display:flex}}
.gm-${id}.touch .ctl{display:flex}
`;

  const ARROW = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

  function ui(root, canvas) {
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.style.width = canvas.style.width;
    wrap.style.aspectRatio = canvas.style.aspectRatio;
    root.append(wrap);
    root.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') root.classList.add('touch'); });
    wrap.append(canvas);
    const hud = document.createElement('div');
    hud.className = 'hud';
    wrap.append(hud);
    const row = style => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;display:flex;align-items:flex-start;gap:max(6px,1cqw);' + style;
      hud.append(el);
      return el;
    };
    const chip = (parent, k) => {
      const el = document.createElement('div');
      el.className = 'chip';
      el.innerHTML = `<span class="k">${k}</span><span class="v"></span>`;
      parent.append(el);
      return el.lastChild;
    };
    const pop = (text, cls) => {
      const el = document.createElement('div');
      el.className = 'pop' + (cls ? ' ' + cls : '');
      el.textContent = text;
      el.addEventListener('animationend', () => el.remove());
      hud.append(el);
    };
    let ctl = null;
    const pad = (side, defs, held) => {
      if (!ctl) { ctl = document.createElement('div'); ctl.className = 'ctl'; root.append(ctl); }
      const el = document.createElement('div');
      el.className = 'pad ' + side;
      for (const [code, svg, label] of defs) {
        const b = document.createElement('button');
        b.type = 'button'; b.innerHTML = svg; b.setAttribute('aria-label', label);
        const off = () => { held.delete(code); b.classList.remove('on'); };
        b.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          held.add(code); b.classList.add('on');
          try { b.setPointerCapture(e.pointerId); } catch (err) {}
        });
        b.addEventListener('pointerup', off);
        b.addEventListener('pointercancel', off);
        b.addEventListener('lostpointercapture', off);
        b.addEventListener('contextmenu', e => e.preventDefault());
        el.append(b);
      }
      ctl.append(el);
      return el;
    };
    return { wrap, hud, row, chip, pop, pad };
  }

  function geoKit(THREE) {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), up2 = new THREE.Vector3(1, 0, 0), pa = new THREE.Vector3(), pb = new THREE.Vector3();
    const BOX = new THREE.BoxGeometry(1, 1, 1), white = new THREE.Color(1, 1, 1);
    function acc() {
      const pos = [], nor = [], col = [];
      const A = {
        add(geo, x, y, z, rx, ry, rz, sx, sy, sz, c) {
          const g = geo.index ? geo.toNonIndexed() : geo.clone();
          eu.set(rx || 0, ry || 0, rz || 0); q.setFromEuler(eu);
          m4.compose(v3.set(x || 0, y || 0, z || 0), q, s3.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz));
          g.applyMatrix4(m4);
          const p = g.attributes.position, n = g.attributes.normal, ca = g.attributes.color, k = c || white;
          for (let i = 0; i < p.count; i++) {
            pos.push(p.getX(i), p.getY(i), p.getZ(i));
            nor.push(n.getX(i), n.getY(i), n.getZ(i));
            if (ca && !c) col.push(ca.getX(i), ca.getY(i), ca.getZ(i)); else col.push(k.r, k.g, k.b);
          }
          g.dispose();
          return A;
        },
        box(sx, sy, sz, x, y, z, c, rx, ry, rz) { return A.add(BOX, x, y, z, rx, ry, rz, sx, sy, sz, c); },
        beam(x1, y1, z1, x2, y2, z2, w, h, c) {
          pa.set(x1, y1, z1); pb.set(x2, y2, z2);
          const len = pa.distanceTo(pb);
          m4.lookAt(pb, pa, Math.abs(pb.y - pa.y) > len * .98 ? up2 : up);
          q.setFromRotationMatrix(m4);
          eu.setFromQuaternion(q);
          return A.add(BOX, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, eu.x, eu.y, eu.z, w, h, len, c);
        },
        build() {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
          g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
          g.computeBoundingSphere();
          return g;
        }
      };
      return A;
    }
    function smooth(g0, deg) {
      const g = g0.index ? g0.toNonIndexed() : g0;
      const p = g.attributes.position, n = g.attributes.normal, cnt = p.count, map = new Map(), out = new Float32Array(cnt * 3), lim = Math.cos(deg * Math.PI / 180);
      for (let i = 0; i < cnt; i++) {
        const k = Math.round(p.getX(i) * 500) + ',' + Math.round(p.getY(i) * 500) + ',' + Math.round(p.getZ(i) * 500);
        const l = map.get(k);
        if (l) l.push(i); else map.set(k, [i]);
      }
      for (const list of map.values()) for (const i of list) {
        let x = 0, y = 0, z = 0;
        const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
        for (const j of list) {
          const mx = n.getX(j), my = n.getY(j), mz = n.getZ(j);
          if (nx * mx + ny * my + nz * mz >= lim) { x += mx; y += my; z += mz; }
        }
        const l = Math.hypot(x, y, z);
        if (l < 1e-6) { out[i * 3] = nx; out[i * 3 + 1] = ny || 1; out[i * 3 + 2] = nz; } else { out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l; }
      }
      g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
      return g;
    }
    function rpoly(pts, r) {
      const sh = new THREE.Shape(), n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], rr = Array.isArray(r) ? r[i] : r;
        const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), a = Math.min(rr, d1 / 2.2, d2 / 2.2);
        const sx = p1[0] + (p0[0] - p1[0]) * a / d1, sy = p1[1] + (p0[1] - p1[1]) * a / d1, ex = p1[0] + (p2[0] - p1[0]) * a / d2, ey = p1[1] + (p2[1] - p1[1]) * a / d2;
        if (i === 0) sh.moveTo(sx, sy); else sh.lineTo(sx, sy);
        if (a > 0) sh.quadraticCurveTo(p1[0], p1[1], ex, ey);
      }
      sh.closePath();
      return sh;
    }
    function side(pts, width, r, bev, seg) {
      const b = bev || 0;
      const g = new THREE.ExtrudeGeometry(rpoly(pts, r), { depth: Math.max(.001, width - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: seg || 3 });
      g.translate(0, 0, -(width - 2 * b) / 2);
      g.rotateY(-Math.PI / 2);
      return smooth(g, 50);
    }
    function loft(secs) {
      const n = secs[0].length, pos = [], idx = [];
      for (const s of secs) for (const p of s) pos.push(p[0], p[1], p[2]);
      for (let k = 0; k < secs.length - 1; k++) for (let i = 0; i < n; i++) {
        const a = k * n + i, b = k * n + (i + 1) % n, c = (k + 1) * n + i, d = (k + 1) * n + (i + 1) % n;
        idx.push(a, c, b, b, c, d);
      }
      for (const [k, flip] of [[0, 1], [secs.length - 1, 0]]) {
        let cx = 0, cy = 0, cz = 0;
        for (const p of secs[k]) { cx += p[0]; cy += p[1]; cz += p[2]; }
        const ci = pos.length / 3;
        pos.push(cx / n, cy / n, cz / n);
        for (let i = 0; i < n; i++) {
          const a = k * n + i, b = k * n + (i + 1) % n;
          if (flip) idx.push(ci, b, a); else idx.push(ci, a, b);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    }
    function foil(chord, thick, n, z0, y0, cam) {
      const out = [], pr = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = (1 - Math.cos(t * Math.PI)) / 2;
        pr.push([x, 5 * thick * (.2969 * Math.sqrt(x) - .126 * x - .3516 * x * x + .2843 * x * x * x - .1036 * x * x * x * x), x]);
      }
      for (let i = 0; i <= n; i++) out.push([z0 + pr[i][0] * chord, y0 + pr[i][1] * chord + (cam || 0) * Math.sin(pr[i][0] * Math.PI) * chord]);
      for (let i = n - 1; i >= 1; i--) out.push([z0 + pr[i][0] * chord, y0 - pr[i][1] * chord * .8 + (cam || 0) * Math.sin(pr[i][0] * Math.PI) * chord]);
      return out;
    }
    function tint(g, fn) {
      const p = g.attributes.position, c = new Float32Array(p.count * 3), t = new THREE.Color();
      for (let i = 0; i < p.count; i++) { fn(t, p.getX(i), p.getY(i), p.getZ(i), i); c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b; }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      return g;
    }
    const lc = hex => new THREE.Color(hex).convertSRGBToLinear();
    return { acc, smooth, rpoly, side, loft, foil, tint, lc, BOX };
  }

  function kit(THREE) {
    const std = (hex, o) => {
      const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: .6, metalness: 0 }, o));
      m.color.convertSRGBToLinear(); m.emissive.convertSRGBToLinear();
      return m;
    };
    const lin = hex => new THREE.Color(hex).convertSRGBToLinear();

    function sky(radius) {
      const u = {
        top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() },
        sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunAmt: { value: 1 }
      };
      const m = new THREE.ShaderMaterial({
        uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: 'varying vec3 vD;\nvoid main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunAmt; varying vec3 vD;\n' +
          'void main(){ vec3 d = normalize(vD); float h = d.y;\n' +
          'vec3 c = h > 0.0 ? mix(hor, top, pow(min(h * 1.7, 1.0), 0.55)) : mix(hor, bot, min(-h * 5.0, 1.0));\n' +
          'float s = max(dot(d, sunDir), 0.0);\n' +
          'c += sunCol * (smoothstep(0.9993, 0.9997, s) * 7.0 + pow(s, 9.0) * 0.28 + pow(s, 90.0) * 0.6) * sunAmt;\n' +
          'gl_FragColor = vec4(c, 1.0);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}'
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), m);
      mesh.frustumCulled = false; mesh.renderOrder = -10;
      return { mesh, u };
    }

    function burst(scene, n, size) {
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshStandardMaterial({ roughness: .5, metalness: .2 }), n);
      im.frustumCulled = false;
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const P = [], dummy = new THREE.Object3D(), tc = new THREE.Color();
      for (let i = 0; i < n; i++) {
        P.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), rx: 0, ry: 0, life: 0, s: 1 });
        im.setColorAt(i, tc.set(0xffffff));
        dummy.scale.setScalar(0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
      }
      scene.add(im);
      let next = 0, live = 0;
      return {
        fire(pos, count, speed, colors, up) {
          for (let k = 0; k < count; k++) {
            const i = next, q = P[i]; next = (next + 1) % n;
            q.p.copy(pos);
            q.v.set(rnd(-1, 1), rnd(-.2, 1) + up, rnd(-1, 1)).normalize().multiplyScalar(speed * rnd(.35, 1));
            q.life = rnd(.7, 1.4); q.s = rnd(.5, 1.5); q.rx = rnd(-9, 9); q.ry = rnd(-9, 9);
            im.setColorAt(i, tc.set(pick(colors)).convertSRGBToLinear());
          }
          im.instanceColor.needsUpdate = true;
          live = 1.6;
        },
        update(dt, g, floor, shift) {
          if (live <= 0) return;
          live -= dt;
          for (let i = 0; i < n; i++) {
            const q = P[i];
            if (q.life <= 0) { if (q.s) { q.s = 0; dummy.scale.setScalar(0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); } continue; }
            q.life -= dt;
            q.v.y -= g * dt;
            q.p.addScaledVector(q.v, dt);
            if (shift) q.p.z += shift;
            if (q.p.y < floor) { q.p.y = floor; q.v.y *= -.35; q.v.x *= .7; q.v.z *= .7; }
            dummy.position.copy(q.p);
            dummy.rotation.set(q.rx * q.life, q.ry * q.life, 0);
            dummy.scale.setScalar(Math.max(0, q.s * Math.min(1, q.life * 2.5)));
            dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
          }
          im.instanceMatrix.needsUpdate = true;
        }
      };
    }

    function dispose(scene) {
      const seen = new Set();
      scene.traverse(o => {
        if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
        const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of ms) {
          if (seen.has(m)) continue;
          seen.add(m);
          if (m.map) m.map.dispose();
          m.dispose();
        }
      });
    }

    function canvasTex(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      t.redraw = (...a) => { draw(c.getContext('2d'), w, h, ...a); t.needsUpdate = true; };
      t.redraw();
      return t;
    }

    return { std, lin, sky, burst, dispose, canvasTex, G: geoKit(THREE) };
  }

  function lerpPreset(out, a, b, t) {
    for (const k in a) {
      if (typeof a[k] === 'number') out[k] = lerp(a[k], b[k], t);
      else out[k].copy(a[k]).lerp(b[k], t);
    }
    return out;
  }
  function makePreset(lin, p) {
    const o = {};
    for (const k in p) o[k] = typeof p[k] === 'string' ? lin(p[k]) : p[k];
    return o;
  }


  function carKit(THREE, K) {
    const { std, G } = K;
    const { acc, side } = G;
    const CYL = new THREE.CylinderGeometry(1, 1, 1, 10), HALF = new THREE.CircleGeometry(1, 16, 0, Math.PI), BX = G.BOX;
    const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
    const tireG = acc()
      .add(lathe([[.6, -.5], [.86, -.5], [.97, -.42], [1, -.28], [1, .28], [.97, .42], [.86, .5], [.6, .5]], 16), 0, 0, 0, 0, 0, Math.PI / 2)
      .add(CYL, 0, 0, 0, 0, 0, Math.PI / 2, .62, .9, .62).build();
    const rimA = acc();
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + .3;
      rimA.box(.05, .5, .13, .47, Math.cos(a) * .3, Math.sin(a) * .3, null, a, 0, 0);
    }
    rimA.add(new THREE.TorusGeometry(.6, .05, 4, 16), .47, 0, 0, 0, Math.PI / 2, 0);
    rimA.add(new THREE.CylinderGeometry(1, 1, 1, 8), .48, 0, 0, 0, 0, Math.PI / 2, .16, .05, .16);
    const rimG = rimA.build();
    const M = {
      glass: std('#34506e', { roughness: .08, metalness: .75 }),
      black: std('#16171b', { roughness: .9 }),
      rubber: std('#0f1013', { roughness: .85 }),
      trim: std('#2b2d34', { roughness: .45, metalness: .4 }),
      chrome: std('#dfe3e8', { roughness: .2, metalness: 1 }),
      white: std('#f4f4f0', { roughness: .4, metalness: .1 }),
      gray: std('#c9ccd2', { roughness: .5, metalness: .2 }),
      head: std('#fff8e6', { emissive: '#fff1c8', emissiveIntensity: .4, roughness: .15 }),
      tail: std('#6a0b10', { emissive: '#ff1a1a', emissiveIntensity: .4, roughness: .3 }),
      tailOn: std('#a0141a', { emissive: '#ff2a2a', emissiveIntensity: 3, roughness: .3 }),
      amber: std('#7a5212', { emissive: '#ff9a1a', emissiveIntensity: .1, roughness: .3 }),
      amberOn: std('#ffb340', { emissive: '#ffa21a', emissiveIntensity: 4, roughness: .3 }),
      sign: std('#ffb340', { emissive: '#ff9a1a', emissiveIntensity: .8, roughness: .4 })
    };
    const paints = new Map();
    const paint = hex => {
      if (!paints.has(hex)) paints.set(hex, std(hex, { roughness: .28, metalness: .35 }));
      return paints.get(hex);
    };
    const cache = {};
    function parts(type) {
      if (cache[type]) return cache[type];
      const A = { P: acc(), gl: acc(), bk: acc(), tr: acc(), ch: acc(), wh: acc(), hd: acc(), tl: acc(), bl: acc(), br: acc(), cg: acc(), sg: acc() };
      const W = [], I = { hx: .95, hz: 2.3, zc: 0, r: .34 };
      const wheel = (r, w, x, z) => {
        W.push([r, w, x, z]);
        const s = x < 0 ? -1 : 1;
        if (I.bw) A.bk.add(HALF, s * I.bw, r, z, 0, s * Math.PI / 2, 0, r * 1.2, r * 1.2, 1);
        I.r = r;
      };
      const lights = (w, yh, zf, yt, zr, lw, lh) => {
        for (const s of [-1, 1]) {
          A.hd.box(lw, lh, .08, s * w, yh, zf);
          A.bk.box(lw + .06, lh + .06, .05, s * w, yh, zf + (zf < 0 ? .03 : -.03));
          A.tl.box(lw, lh * 1.1, .08, s * w, yt, zr);
          A.bk.box(lw + .06, lh * 1.1 + .06, .05, s * w, yt, zr + (zr < 0 ? .03 : -.03));
          const sd = s < 0 ? A.bl : A.br;
          sd.box(.14, .09, .09, s * (w + lw / 2 + .06), yh - .02, zf);
          sd.box(.14, .09, .09, s * (w + lw / 2 + .06), yt, zr);
        }
      };
      const plate = (y, z, dir) => {
        A.wh.box(.5, .12, .02, 0, y, z);
        A.bk.box(.4, .05, .025, 0, y, z + dir * .004);
      };
      const exhaust = (x, y, z, r) => A.ch.add(CYL, x, y, z, Math.PI / 2, 0, 0, r, .18, r);
      const body = (pts, w, r, b) => A.P.add(side(pts, w, r, b), 0, 0, 0);
      const cabin = (gh, gw, rf) => {
        A.gl.add(side(gh, gw, .08, .02), 0, 0, 0);
        const yt = gh[1][1], z1 = gh[1][0], z2 = gh[2][0];
        A.P.add(side([[z1 - .07, yt - .04], [z2 + .05, yt - .04], [z2 - .02, yt + .05], [z1 + .06, yt + .05]], gw + .03, .02, .02), 0, 0, 0);
        for (const s of [-1, 1]) {
          const x = s * (gw / 2 + .005);
          A.P.beam(x, gh[0][1] - .02, gh[0][0], x, yt, z1 - .02, .08, .08);
          A.P.beam(x, yt, z2 + .02, x, gh[3][1] - .02, gh[3][0], .09, .08);
          if (rf !== false) A.P.box(.08, yt - gh[0][1], .09, x, (yt + gh[0][1]) / 2, (z1 + z2) / 2 + .02);
        }
      };
      const mirrors = (y, z, x, c) => {
        for (const s of [-1, 1]) {
          A.P.box(.13, .1, .2, s * x, y, z);
          A.bk.box(.12, .06, .16, s * (x + .01), y, z + .01);
          A.bk.box(.12, .03, .03, s * (x - .08), y - .03, z + .06);
        }
      };
      const seams = (zs, y0, y1, hw) => {
        for (const s of [-1, 1]) for (const z of zs) A.bk.box(.014, y1 - y0, .02, s * hw, (y0 + y1) / 2, z);
      };
      const handles = (zs, y, hw) => {
        for (const s of [-1, 1]) for (const z of zs) A.ch.box(.02, .035, .16, s * hw, y, z);
      };
      if (type === 'sports') {
        body([[-2.14, .3], [-2.14, .55], [-1.92, .72], [-1.2, .82], [-.6, .88], [1.3, .88], [1.98, .9], [2.14, .78], [2.14, .3]], 1.84, .09, .06);
        cabin([[-.62, .86], [.1, 1.24], [.95, 1.24], [1.72, .9]], 1.46, false);
        A.P.box(.05, .34, .1, .73, 1.05, .45); A.P.box(.05, .34, .1, -.73, 1.05, .45);
        A.P.box(1.84, .05, .34, 0, 1.2, 2.0); A.P.box(.05, .22, .42, .92, 1.12, 2.0); A.P.box(.05, .22, .42, -.92, 1.12, 2.0);
        for (const s of [-1, 1]) A.tr.box(.07, .22, .1, s * .6, 1.02, 2.02);
        for (const x of [-.2, .2]) {
          A.wh.beam(x, .735, -2.0, x, .835, -1.2, .12, .014);
          A.wh.beam(x, .835, -1.2, x, .895, -.6, .12, .014);
          A.wh.box(.12, .014, .85, x, 1.298, .5);
          A.wh.beam(x, .915, 1.4, x, .925, 2.05, .12, .014);
        }
        A.bk.box(1.72, .1, .2, 0, .33, -2.1); A.bk.box(1.9, .1, 3.2, 0, .31, 0); A.bk.box(1.5, .14, .12, 0, .36, 2.1);
        A.bk.box(1.2, .13, .06, 0, .5, -2.15); A.bk.box(.5, .1, .06, -.66, .45, -2.14); A.bk.box(.5, .1, .06, .66, .45, -2.14);
        for (let i = 0; i < 4; i++) A.bk.box(1.1, .016, .05, 0, .915, 1.0 + i * .14);
        for (const s of [-1, 1]) { A.bk.box(.02, .16, .55, s * .93, .55, .5); A.bk.box(.02, .1, .6, s * .93, .5, -1.0); }
        seams([-.56, .85], .5, .86, .915);
        handles([.65], .78, .925);
        mirrors(.98, -.5, .99);
        A.ch.box(.14, .14, .08, -.45, .38, 2.16); A.ch.box(.14, .14, .08, .45, .38, 2.16);
        exhaust(-.45, .36, 2.16, .07); exhaust(.45, .36, 2.16, .07);
        plate(.6, 2.15, 1);
        A.ch.box(.4, .03, .02, 0, .5, -2.18);
        lights(.62, .72, -2.14, .7, 2.13, .46, .13);
        I.bw = .925;
        for (const z of [-1.38, 1.38]) for (const s of [-1, 1]) wheel(.36, .3, s * .86, z);
        Object.assign(I, { hx: .94, hz: 2.22 });
      } else if (type === 'sedan' || type === 'hatch') {
        const sd = type === 'sedan', hz = sd ? 2.3 : 1.95, z0 = hz - .02;
        body(sd ? [[-z0, .34], [-z0, .66], [-z0 + .2, .86], [-1.0, .96], [1.3, .96], [z0 - .18, .93], [z0, .78], [z0, .34]] : [[-z0, .34], [-z0, .66], [-z0 + .2, .86], [-.75, .96], [1.1, .98], [z0 - .12, .96], [z0, .8], [z0, .34]], 1.84, .1, .055);
        cabin(sd ? [[-1.0, .95], [-.38, 1.47], [.8, 1.47], [1.32, .95]] : [[-.62, .95], [-.02, 1.47], [1.0, 1.47], [1.6, .97]], 1.6);
        A.bk.box(1.88, .2, .16, 0, .45, -hz); A.bk.box(1.88, .2, .16, 0, .45, hz);
        A.ch.box(1.2, .035, .03, 0, .56, -hz - .08); A.ch.box(1.0, .035, .03, 0, .53, hz + .08);
        A.tr.box(1.86, .07, hz * 1.4, 0, .4, 0);
        A.bk.box(.9, .2, .05, 0, .66, -hz + .02);
        for (let i = 0; i < 4; i++) A.ch.box(.86, .014, .02, 0, .6 + i * .045, -hz - .005);
        const pz = sd ? [-.52, .26, 1.2] : [-.5, .3, 1.1];
        seams(pz, .55, .95, .925);
        handles([-.15, .62], .88, .925);
        mirrors(1.04, sd ? -.92 : -.58, .98);
        exhaust(-.55, .38, hz + .02, .045);
        plate(.64, hz + .09, 1);
        if (sd) A.P.box(1.6, .05, .14, 0, 1.0, 2.06);
        else { A.P.box(1.5, .05, .22, 0, 1.52, 1.12); }
        lights(.58, .82, -hz - .01, .84, hz + .01, .42, .13);
        const wz = hz - .9;
        I.bw = .925;
        for (const z of [-wz, wz]) for (const s of [-1, 1]) wheel(.34, .26, s * .82, z);
        Object.assign(I, { hx: .94, hz });
      } else if (type === 'suv') {
        body([[-2.4, .4], [-2.4, .98], [-2.2, 1.24], [-1.5, 1.34], [2.3, 1.34], [2.4, 1.2], [2.4, .4]], 1.96, .1, .06);
        cabin([[-1.25, 1.33], [-.78, 1.93], [1.75, 1.93], [1.85, 1.33]], 1.78);
        A.bk.box(2.0, .24, 4.6, 0, .54, 0); A.bk.box(2.02, .26, .18, 0, .55, -2.4); A.bk.box(2.02, .26, .18, 0, .55, 2.4);
        A.bk.box(1.0, .5, .08, 0, 1.0, 2.41); A.bk.box(1.2, .25, .06, 0, .88, -2.4);
        for (let i = 0; i < 4; i++) A.ch.box(1.1, .02, .02, 0, 1.0 + i * .06, -2.42);
        for (const s of [-1, 1]) { A.tr.box(.06, .08, 2.6, s * .8, 2.02, .35); A.tr.box(.06, .08, .06, s * .8, 1.99, -.9); A.tr.box(.06, .08, .06, s * .8, 1.99, 1.55); A.tr.box(.1, .08, 3.0, s * .98, .38, .1); }
        seams([-.7, .3, 1.35], .62, 1.28, .985);
        handles([-.2, .85], 1.16, .985);
        mirrors(1.38, -1.05, 1.07);
        A.ch.box(.5, .05, .04, 0, 1.02, -2.43);
        A.tr.box(.7, .08, .1, 0, 1.38, 2.34);
        plate(.78, 2.46, 1);
        exhaust(.55, .42, 2.46, .05);
        lights(.66, 1.02, -2.41, 1.08, 2.41, .4, .15);
        I.bw = 1.0;
        for (const z of [-1.55, 1.55]) for (const s of [-1, 1]) wheel(.42, .3, s * .9, z);
        Object.assign(I, { hx: 1.0, hz: 2.42 });
      } else if (type === 'truck') {
        A.P.add(side([[-5.4, .7], [-5.4, 2.1], [-5.24, 2.64], [-4.8, 2.86], [-3.25, 2.86], [-3.25, .7]], 2.36, .12, .07), 0, 0, 0);
        A.gl.box(2.12, .78, .05, 0, 2.28, -5.36, null, .2, 0, 0);
        for (const s of [-1, 1]) {
          A.gl.box(.05, .72, 1.05, s * 1.19, 2.3, -4.45);
          A.P.box(.1, .06, 1.2, s * 1.2, 2.69, -4.45); A.P.box(.1, .06, 1.2, s * 1.2, 1.92, -4.45);
          A.bk.box(.04, 1.5, .03, s * 1.19, 1.4, -3.9); A.bk.box(.04, 1.5, .03, s * 1.19, 1.4, -4.9);
          A.ch.box(.03, .05, .22, s * 1.19, 1.55, -4.2);
          A.bk.box(.2, .04, .4, s * 1.35, 2.5, -5.1, null, 0, 0, 0); A.bk.box(.1, .6, .2, s * 1.42, 2.4, -5.1);
          A.gl.box(.04, .5, .16, s * 1.47, 2.4, -5.1);
          A.ch.add(CYL, s * 1.3, 2.4, -3.18, 0, 0, 0, .09, 2.6, .09);
          A.tr.add(CYL, s * 1.3, 3.75, -3.18, 0, 0, 0, .12, .1, .12);
          A.ch.add(CYL, s * 1.18, .95, -2.5, Math.PI / 2, 0, 0, .34, 1.5, .34);
          A.bk.box(.5, .08, .3, s * 1.18, 1.34, -1.45);
          A.bk.box(.05, .55, .5, s * 1.0, .45, 4.6);
          A.tr.box(.4, .1, .5, s * 1.22, .8, -4.5);
          A.tr.box(.4, .1, .5, s * 1.22, .55, -4.55);
        }
        A.P.add(side([[-4.9, 2.84], [-3.2, 2.84], [-3.2, 3.28], [-4.2, 3.46], [-4.8, 3.1]], 2.1, .06, .06), 0, 0, 0);
        A.bk.box(2.46, .42, .22, 0, .62, -5.45); A.ch.box(2.4, .05, .24, 0, .86, -5.45);
        A.bk.box(1.7, .78, .06, 0, 1.2, -5.43);
        for (let i = 0; i < 6; i++) A.ch.box(1.6, .035, .05, 0, .92 + i * .12, -5.46);
        A.ch.box(.2, .2, .06, 0, 1.55, -5.46);
        A.bk.box(1.9, .45, 10.6, 0, .78, -.2);
        A.bk.box(2.2, .3, .1, 0, .42, -5.5);
        A.tr.box(2.52, .3, 8.2, 0, 1.0, 1.0);
        A.cg.add(side([[-3.1, 1.1], [5.1, 1.1], [5.1, 3.85], [-3.1, 3.85]], 2.48, .04, .05), 0, 0, 0);
        for (let i = 0; i < 11; i++) for (const s of [-1, 1]) A.cg.box(.05, 2.5, .1, s * 1.265, 2.45, -2.6 + i * .76);
        for (const s of [-1, 1]) { A.P.box(.03, .5, 8.0, s * 1.256, 2.0, 1.0); A.tr.box(.05, .06, 8.2, s * 1.255, 3.78, 1.0); A.tr.box(.05, .06, 8.2, s * 1.255, 1.18, 1.0); }
        A.tr.box(2.5, .06, .06, 0, 3.8, -3.1); A.bk.box(2.4, .5, .06, 0, 1.4, 5.12); A.tr.box(.04, 2.6, .04, 0, 2.45, 5.11);
        A.bk.box(2.0, .1, .1, 0, .72, 5.1); A.ch.box(2.0, .04, .1, 0, .78, 5.14);
        lights(.85, 1.2, -5.46, 1.3, 5.14, .36, .18);
        A.hd.box(.2, .12, .08, -.45, .62, -5.5); A.hd.box(.2, .12, .08, .45, .62, -5.5);
        for (const z of [-4.0, 2.6, 3.9]) for (const s of [-1, 1]) wheel(.52, .38, s * 1.04, z);
        Object.assign(I, { hx: 1.25, hz: 5.3, zc: -.17 });
      } else {
        A.P.add(side([[-5.78, .5], [-5.78, 2.5], [-5.46, 3.1], [5.5, 3.14], [5.78, 2.9], [5.78, .5]], 2.46, .15, .07), 0, 0, 0);
        A.gl.box(2.3, 1.3, .06, 0, 2.15, -5.8, null, -.05, 0, 0);
        A.gl.box(2.3, 1.2, .06, 0, 2.2, 5.8);
        for (let i = 0; i < 8; i++) for (const s of [-1, 1]) A.gl.box(.05, .92, 1.12, s * 1.255, 2.32, -4.35 + i * 1.28);
        for (const s of [-1, 1]) {
          A.P.box(.1, .08, 11.0, s * 1.24, 2.83, 0); A.P.box(.1, .08, 11.0, s * 1.24, 1.84, 0);
          A.gl.box(.05, 1.75, .85, s * 1.256, 1.35, -4.9);
          A.bk.box(.07, 1.9, .06, s * 1.25, 1.4, -5.38); A.bk.box(.07, 1.9, .06, s * 1.25, 1.4, -4.42);
          A.bk.box(.07, .08, .96, s * 1.25, 2.32, -4.9);
          A.bk.box(.1, .6, .22, s * 1.45, 2.2, -5.4);
          A.bk.box(.28, .05, .05, s * 1.34, 2.3, -5.4);
          A.bk.box(.14, .5, .05, s * 1.27, .55, 0);
        }
        A.sg.box(1.5, .26, .05, 0, 3.0, -5.82);
        A.bk.box(1.6, .5, .06, 0, 1.1, 5.8);
        for (let i = 0; i < 5; i++) A.tr.box(1.5, .02, .03, 0, .95 + i * .1, 5.83);
        A.wh.box(2.54, .14, 11.0, 0, 1.45, 0);
        A.wh.box(1.5, .3, 2.2, 0, 3.4, -2.2); A.wh.box(1.5, .3, 2.2, 0, 3.4, 1.4); A.wh.box(.7, .2, .7, 0, 3.35, 4.4);
        A.bk.box(2.54, .3, .2, 0, .62, -5.82); A.bk.box(2.54, .3, .2, 0, .62, 5.82);
        A.tr.box(2.2, .06, .04, 0, .8, -5.84);
        lights(.85, .95, -5.82, 1.05, 5.82, .38, .18);
        plate(.78, 5.86, 1);
        I.bw = 1.235;
        for (const z of [-3.9, 3.7]) for (const s of [-1, 1]) wheel(.52, .38, s * 1.05, z);
        Object.assign(I, { hx: 1.25, hz: 5.82 });
      }
      const out = { W, I };
      for (const k in A) out[k] = A[k].build();
      cache[type] = out;
      return out;
    }
    function build(type, hex) {
      const T = parts(type), g = new THREE.Group(), V = { g, type, wheels: [], bl: [], br: [], tails: [], heads: [], hx: T.I.hx, hz: T.I.hz, zc: T.I.zc, r: T.I.r };
      const mesh = (geo, mat, shadow) => {
        const m = new THREE.Mesh(geo, mat);
        if (shadow) m.castShadow = true;
        g.add(m);
        return m;
      };
      mesh(T.P, paint(hex), true); mesh(T.gl, M.glass, true); mesh(T.bk, M.black); mesh(T.tr, M.trim); mesh(T.ch, M.chrome); mesh(T.wh, M.white);
      if (T.cg.attributes.position.count) mesh(T.cg, pick([M.white, M.gray]), true);
      if (T.sg.attributes.position.count) mesh(T.sg, M.sign);
      V.heads.push(mesh(T.hd, M.head)); V.tails.push(mesh(T.tl, M.tail)); V.bl.push(mesh(T.bl, M.amber)); V.br.push(mesh(T.br, M.amber));
      for (const [r, w, x, z] of T.W) {
        const piv = new THREE.Object3D();
        piv.position.set(x, r, z);
        const t = new THREE.Mesh(tireG, M.rubber); t.scale.set(w, r, r);
        const rim = new THREE.Mesh(rimG, M.chrome); rim.scale.set(w, r, r); if (x < 0) rim.rotation.y = Math.PI;
        piv.add(t, rim); g.add(piv); V.wheels.push(piv);
      }
      return V;
    }
    return { M, build };
  }
  function roadWorld(THREE, K, scene, renderer) {
    const { std, canvasTex, G } = K;
    const W = {};
    const RW = 17, RLEN = 24, LEN = 640, ZC = -280;
    const aniso = renderer.capabilities.getMaxAnisotropy();
    W.road = canvasTex(512, 1024, (g, w, h, two) => {
      const mx = w / RW, mz = h / RLEN, X = m => w / 2 + m * mx;
      g.fillStyle = '#4a4d55'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#5a5c62'; g.fillRect(0, 0, X(-7.3), h); g.fillRect(X(7.3), 0, w - X(7.3), h);
      for (let i = 0; i < 14000; i++) {
        g.fillStyle = i & 1 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)';
        g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 10 + Math.random() * 38, gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, Math.random() < .5 ? 'rgba(20,20,26,.16)' : 'rgba(120,124,132,.1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      g.fillStyle = 'rgba(18,18,24,.17)';
      for (let l = 0; l < 4; l++) { const c = (l - 1.5) * 3.6; g.fillRect(X(c - 1.05), 0, .55 * mx, h); g.fillRect(X(c + .5), 0, .55 * mx, h); }
      for (const y of [1, h / 2]) {
        g.fillStyle = 'rgba(10,10,14,.5)'; g.fillRect(0, y, w, 2);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y + 2, w, 1);
      }
      g.strokeStyle = 'rgba(14,14,18,.4)'; g.lineWidth = 1.2;
      for (let i = 0; i < 10; i++) {
        let x = Math.random() * w, y = Math.random() * h;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (Math.random() - .5) * 26; y += (Math.random() - .3) * 26; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const y = Math.random() * h, ph = (2 + Math.random() * 5) * mz, l = Math.floor(Math.random() * 4), c = (l - 1.5) * 3.6;
        g.fillStyle = Math.random() < .5 ? 'rgba(30,31,36,.35)' : 'rgba(96,98,104,.22)';
        g.fillRect(X(c - 1.3 + Math.random() * .6), y, (1.2 + Math.random() * 1.2) * mx, ph);
      }
      for (const s of [-1, 1]) {
        for (let z = 0; z < h; z += .36 * mz) {
          g.fillStyle = 'rgba(16,16,20,.55)'; g.fillRect(X(s > 0 ? 7.42 : -7.72), z, .3 * mx, .12 * mz);
          g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(X(s > 0 ? 7.42 : -7.72), z + .12 * mz, .3 * mx, .04 * mz);
        }
        g.fillStyle = 'rgba(14,14,18,.5)'; g.fillRect(X(s > 0 ? 7.74 : -8.5), 0, .76 * mx, h);
      }
      g.fillStyle = '#f0efe6'; g.fillRect(X(-7.32), 0, .2 * mx, h); g.fillRect(X(7.12), 0, .2 * mx, h);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(X(-7.32), 0, .04 * mx, h); g.fillRect(X(7.12), 0, .04 * mx, h);
      for (const c of [-3.6, 0, 3.6]) {
        if (two && c === 0) { g.fillStyle = '#f3c22e'; g.fillRect(X(-.24), 0, .15 * mx, h); g.fillRect(X(.09), 0, .15 * mx, h); continue; }
        g.fillStyle = '#efeee4';
        for (let z = 0; z < RLEN; z += 12) { g.fillRect(X(c - .08), z * mz, .16 * mx, 4 * mz); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(X(c - .08), z * mz + 3.2 * mz, .16 * mx, .8 * mz); g.fillStyle = '#efeee4'; }
      }
    });
    W.road.wrapT = THREE.RepeatWrapping; W.road.anisotropy = aniso; W.road.repeat.set(1, LEN / RLEN);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(RW, LEN), new THREE.MeshStandardMaterial({ map: W.road, roughness: .82 }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, .01, ZC); road.receiveShadow = true;
    scene.add(road);
    W.grass = canvasTex(256, 256, g => {
      g.fillStyle = '#5f9a3e'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = pick(['#6aa646', '#548c35', '#73ad4c', '#4e8431', '#7cb257']);
        g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 2 + Math.random() * 6);
      }
      for (let i = 0; i < 70; i++) {
        g.fillStyle = pick(['#fff3b0', '#ffffff', '#ffd6e0', '#ffe066']);
        g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    });
    W.grass.wrapS = W.grass.wrapT = THREE.RepeatWrapping; W.grass.anisotropy = aniso; W.grass.repeat.set(70, LEN / 10);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, LEN), new THREE.MeshStandardMaterial({ map: W.grass, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.02, ZC); ground.receiveShadow = true;
    scene.add(ground);
    W.gravel = canvasTex(128, 256, g => {
      g.fillStyle = '#8f8878'; g.fillRect(0, 0, 128, 256);
      for (let i = 0; i < 1400; i++) {
        g.fillStyle = pick(['#a39b88', '#7a7466', '#b4ad9a', '#6e695c']);
        g.fillRect(Math.random() * 128, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2);
      }
    });
    W.gravel.wrapS = W.gravel.wrapT = THREE.RepeatWrapping; W.gravel.anisotropy = aniso; W.gravel.repeat.set(1, LEN / 8);
    const gravelMat = new THREE.MeshStandardMaterial({ map: W.gravel, roughness: 1 });
    for (const s of [-1, 1]) {
      const st = new THREE.Mesh(new THREE.PlaneGeometry(2.4, LEN), gravelMat);
      st.rotation.x = -Math.PI / 2; st.position.set(s * 10.1, .005, ZC); st.receiveShadow = true;
      scene.add(st);
    }
    const dummy = new THREE.Object3D();
    const inst = (geo, mat, list, shadow) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((p, i) => {
        dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(p[6] || 0, p[3] || 0, 0);
        dummy.scale.set(p[4] || 1, p[5] || p[4] || 1, p[7] || p[4] || 1); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
      });
      im.castShadow = !!shadow;
      im.frustumCulled = false;
      return im;
    };
    const jitter = (im, a, b) => {
      const c = new THREE.Color();
      for (let i = 0; i < im.count; i++) im.setColorAt(i, c.setScalar(rnd(a, b)));
      return im;
    };
    W.posts = new THREE.Group();
    W.conc = canvasTex(64, 256, (g, w, h) => {
      g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = pick(['rgba(255,255,255,.12)', 'rgba(0,0,0,.08)', 'rgba(90,84,74,.1)']); g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
      for (let i = 0; i < 5; i++) { const y = Math.random() * h; g.fillStyle = 'rgba(70,64,56,.12)'; g.fillRect(0, y, w, 6 + Math.random() * 20); }
      g.fillStyle = 'rgba(40,38,34,.75)'; g.fillRect(0, 0, w, 3);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 3, w, 2);
    });
    W.conc.wrapS = W.conc.wrapT = THREE.RepeatWrapping; W.conc.repeat.set(1, .25); W.conc.anisotropy = aniso;
    const jb = new THREE.Shape(), wy = [[.02, .5], [0, .55], [.08, .61], [0, .67], [.08, .73], [0, .79], [.02, .84]];
    jb.moveTo(wy[0][0], wy[0][1]); for (const [x, y] of wy) jb.lineTo(x, y); for (let i = wy.length - 1; i >= 0; i--) jb.lineTo(wy[i][0] + .05, wy[i][1]);
    const jbG = new THREE.ExtrudeGeometry(jb, { depth: LEN, bevelEnabled: false });
    jbG.translate(0, 0, -LEN / 2);
    const railMat = std('#c3c9d0', { roughness: .32, metalness: .75 });
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(jbG, railMat);
      b.position.set(s * 7.75, 0, ZC); b.scale.x = s; b.castShadow = true; b.receiveShadow = true;
      W.posts.add(b);
    }
    const gpost = [];
    for (let z = 40; z > -600; z -= 4) for (const s of [-1, 1]) gpost.push([s * 7.98, 0, z]);
    const gpG = G.acc().box(.12, .8, .14, 0, .4, 0).box(.16, .14, .1, -.0, .67, 0).build();
    W.posts.add(inst(gpG, std('#8d949c', { roughness: .5, metalness: .6 }), gpost, true));
    const refL = [], refR = [], dels = [];
    for (let z = 40; z > -600; z -= 4) for (const s of [-1, 1]) (s < 0 ? refL : refR).push([s * 7.86, .67, z]);
    for (let z = 40; z > -600; z -= 24) for (const s of [-1, 1]) dels.push([s * 8.05, .86 + .3, z]);
    const refG = new THREE.BoxGeometry(.03, .1, .18);
    W.posts.add(inst(refG, std('#ffd24a', { emissive: '#ffb020', emissiveIntensity: .5, roughness: .3 }), refL), inst(refG, std('#f4f4f0', { emissive: '#dfe6f0', emissiveIntensity: .45, roughness: .3 }), refR));
    const delG = G.acc().box(.1, .6, .1, 0, 0, 0).box(.12, .14, .12, 0, .22, 0, G.lc('#ffd24a')).build();
    W.posts.add(inst(delG, std('#ffffff', { vertexColors: true, roughness: .5, emissive: '#3a3010', emissiveIntensity: .4 }), dels));
    scene.add(W.posts);
    W.lamps = new THREE.Group();
    W.lampMat = std('#fff6d8', { emissive: '#ffd890', emissiveIntensity: 0 });
    const poleMat = std('#7d848c', { roughness: .5, metalness: .6 });
    const lampG = G.acc()
      .add(new THREE.CylinderGeometry(.09, .15, 8.4, 8), 0, 4.2, 0)
      .add(new THREE.CylinderGeometry(.24, .28, .5, 8), 0, .25, 0)
      .add(new THREE.CylinderGeometry(.17, .17, .12, 8), 0, .55, 0)
      .box(2.6, .12, .14, 1.2, 8.3, 0)
      .beam(0, 7.1, 0, 1.6, 8.28, 0, .07, .07)
      .box(1.0, .16, .44, 2.3, 8.28, 0)
      .box(.9, .05, .5, 2.3, 8.4, 0)
      .box(.1, .2, .1, 2.8, 8.34, 0).build();
    const lensG = new THREE.BoxGeometry(.84, .05, .36);
    const lamps = [], lens = [], pools = [];
    for (let z = 50; z > -650; z -= 50) for (const s of [-1, 1]) {
      lamps.push([s * 9.8, 0, z, s > 0 ? Math.PI : 0]); lens.push([s * 9.8 - s * 2.3, 8.17, z]); pools.push([s * 6.4, .04, z, 0, 1, 1, -Math.PI / 2]);
    }
    W.lamps.add(inst(lampG, poleMat, lamps, true));
    W.lamps.add(inst(lensG, W.lampMat, lens));
    W.poolTex = canvasTex(128, 128, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.5, 'rgba(255,200,120,.45)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
    W.poolMat = new THREE.MeshBasicMaterial({ map: W.poolTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    W.lamps.add(inst(new THREE.PlaneGeometry(12, 12), W.poolMat, pools));
    scene.add(W.lamps);
    W.signTex = canvasTex(1024, 512, (g, w, h) => {
      const panel = (x, y, pw, ph, bg, fg) => {
        g.fillStyle = bg; g.beginPath(); g.roundRect(x, y, pw, ph, 18); g.fill();
        g.strokeStyle = fg; g.lineWidth = 7; g.beginPath(); g.roundRect(x + 12, y + 12, pw - 24, ph - 24, 12); g.stroke();
      };
      g.textAlign = 'center'; g.textBaseline = 'middle';
      panel(4, 4, 500, 248, '#0f7a4a', '#ffffff'); panel(520, 4, 500, 248, '#0f7a4a', '#ffffff');
      g.fillStyle = '#ffffff'; g.font = '800 58px sans-serif';
      g.fillText('CITY CENTRE', 254, 100); g.fillText('AIRPORT', 770, 100);
      g.font = '800 70px sans-serif'; g.fillText('12 km', 254, 188); g.fillText('34 km', 770, 188);
      panel(4, 264, 500, 244, '#0f7a4a', '#ffffff');
      g.fillStyle = '#ffffff'; g.font = '800 60px sans-serif'; g.fillText('EXIT 7', 254, 340);
      g.font = '700 44px sans-serif'; g.fillText('Lakeside  3 km', 254, 430);
      g.fillStyle = '#f4f4f0'; g.fillRect(520, 264, 500, 244);
      g.fillStyle = '#d8232a'; g.beginPath(); g.arc(770, 386, 112, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(770, 386, 82, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#16171b'; g.font = '800 86px sans-serif'; g.fillText('120', 770, 392);
    });
    W.signMat = new THREE.MeshStandardMaterial({ map: W.signTex, roughness: .55, metalness: .1, emissive: 0xffffff, emissiveMap: W.signTex, emissiveIntensity: 0 });
    W.signMat.emissive.convertSRGBToLinear();
    const quads = list => {
      const pos = [], nor = [], uv = [], idx = [];
      for (const [w, h, x, y, z, u0, v0, u1, v1] of list) {
        const k = pos.length / 3;
        pos.push(x - w / 2, y - h / 2, z, x + w / 2, y - h / 2, z, x + w / 2, y + h / 2, z, x - w / 2, y + h / 2, z);
        for (let i = 0; i < 4; i++) nor.push(0, 0, 1);
        uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      return g;
    };
    W.signs = new THREE.Group();
    const gantryF = G.acc();
    for (const s of [-1, 1]) {
      gantryF.box(.5, 7.2, .5, s * 10.4, 3.6, 0).box(.9, .3, .9, s * 10.4, .15, 0);
      gantryF.box(.4, .25, .25, s * 9.5, 6.35, 0);
    }
    gantryF.box(21, .3, .3, 0, 6.9, 0).box(21, .3, .3, 0, 5.9, -.1);
    for (let i = 0; i < 14; i++) gantryF.beam(-10 + i * 1.5, i & 1 ? 6.9 : 5.9, 0, -10 + (i + 1) * 1.5, i & 1 ? 5.9 : 6.9, -.05, .12, .12);
    gantryF.box(6.2, 2.5, .08, -4.8, 6.4, -.08).box(6.2, 2.5, .08, 4.8, 6.4, -.08);
    const gantryB = quads([[6.0, 2.3, -4.8, 6.4, -.02, 0.004, .5, .496, 1], [6.0, 2.3, 4.8, 6.4, -.02, .508, .5, 1, 1]]);
    const sideF = G.acc().box(.12, 3.4, .12, -1.1, 1.7, 0).box(.12, 3.4, .12, 1.1, 1.7, 0).box(2.8, 1.8, .06, 0, 3.0, -.06);
    const sideB = quads([[2.6, 1.65, 0, 3.0, -.02, 0.004, 0, .496, .496]]);
    const limF = G.acc().box(.1, 2.6, .1, 0, 1.3, 0).box(1.25, 1.25, .05, 0, 2.7, -.05);
    const limB = quads([[1.15, 1.15, 0, 2.7, -.02, .508, 0, 1, .496]]);
    const gz = [-60, -360, -660, 240].map(z => [0, 0, z]), sz = [-210, -510, 90, 390].map(z => [11.6, 0, z]), lz = [-130, -430, 170, 470].map(z => [10.2, 0, z]);
    const frameMat = std('#7d848c', { roughness: .55, metalness: .5 });
    W.signs.add(inst(gantryF.build(), frameMat, gz, true), inst(gantryB, W.signMat, gz));
    W.signs.add(inst(sideF.build(), frameMat, sz, true), inst(sideB, W.signMat, sz));
    W.signs.add(inst(limF.build(), frameMat, lz, true), inst(limB, W.signMat, lz));
    scene.add(W.signs);
    W.bridges = new THREE.Group();
    const brG = G.acc()
      .box(52, 1.0, 10, 0, 7.6, 0).box(52, 1.1, .35, 0, 8.6, 4.8).box(52, 1.1, .35, 0, 8.6, -4.8)
      .box(52, .7, .6, 0, 6.8, 3.2).box(52, .7, .6, 0, 6.8, 0).box(52, .7, .6, 0, 6.8, -3.2);
    for (const s of [-1, 1]) brG.box(2.2, 7.2, 10.5, s * 12.6, 3.6, 0).box(3.2, .5, 11, s * 12.6, 6.95, 0).box(6, 2.4, 11, s * 18.5, 1.2, 0);
    const bz = [[0, 0, -500], [0, 0, 100]];
    W.bridges.add(inst(brG.build(), std('#c4c0b8', { roughness: .9 }), bz, true));
    scene.add(W.bridges);
    W.billTex = canvasTex(1024, 512, (g, w, h) => {
      const ad = (x, bg, fg, a, b, c) => {
        const gr = g.createLinearGradient(x, 0, x + 512, 256); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]);
        g.fillStyle = gr; g.fillRect(x, 0, 512, 256);
        g.fillStyle = fg; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
        g.font = '900 64px sans-serif'; g.fillText(a, x + 28, 104);
        g.font = '700 34px sans-serif'; g.fillText(b, x + 30, 160);
        g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x + 30, 188, 220, 44);
        g.fillStyle = bg[1]; g.font = '800 28px sans-serif'; g.fillText(c, x + 44, 220);
      };
      ad(0, ['#ff7a18', '#c3161c'], '#fff', 'BURGER STOP', 'Open 24/7 · next exit', 'EXIT 9  ›');
      ad(512, ['#0f4c81', '#1aa3c8'], '#fff', 'LAKE HOTEL', 'Pool · Spa · Free parking', '5 km  ›');
      g.save(); g.translate(0, 256);
      ad(0, ['#2b9348', '#155d27'], '#fff', 'FRESH FRUIT', 'Farm shop · 2 km', 'TURN RIGHT');
      ad(512, ['#3d348b', '#7678ed'], '#fff', 'DRIVE SAFE', 'Keep your distance', 'BUCKLE UP');
      g.restore();
    });
    W.billMat = new THREE.MeshStandardMaterial({ map: W.billTex, roughness: .6, emissive: 0xffffff, emissiveMap: W.billTex, emissiveIntensity: 0 });
    W.bills = new THREE.Group();
    const billF = G.acc().box(.35, 6, .35, -2.5, 3, 0).box(.35, 6, .35, 2.5, 3, 0).box(8.4, 3.6, .2, 0, 6.6, -.12).box(8.4, .12, .8, 0, 4.75, .3);
    const billQ = [];
    for (let i = 0; i < 4; i++) billQ.push(quads([[8, 3.2, 0, 6.6, -.0, (i & 1) * .5 + .004, i < 2 ? .5 : 0, (i & 1) * .5 + .496, i < 2 ? 1 : .5]]));
    const billMats = [std('#5d636b', { roughness: .6, metalness: .4 })];
    const bills = [[[-19, 0, -120, .25]], [[20, 0, -260, -.25]], [[-21, 0, -400, .2]], [[19, 0, -540, -.2]]];
    bills.forEach((p, i) => { const q = [p[0], [p[0][0], 0, p[0][2] - 600, p[0][3]]]; W.bills.add(inst(billF.build(), billMats[0], q, true), inst(billQ[i], W.billMat, q)); });
    scene.add(W.bills);
    W.houses = new THREE.Group();
    const hb = [], hr = [];
    for (let i = 0; i < 18; i++) {
      const s = i & 1 ? 1 : -1, x = s * rnd(34, 110), z = -rnd(0, 600), k = rnd(.8, 1.3), r = rnd(-.4, .4) + (s > 0 ? Math.PI / 2 : -Math.PI / 2);
      for (const zz of [z + 40, z - 560]) { hb.push([x, 1.6 * k, zz, r, 6 * k, 3.2 * k, 0, 8 * k]); hr.push([x, 3.85 * k, zz, r, 3.8 * k, 1.3 * k, 0, 8.4 * k]); }
    }
    const roofG = new THREE.CylinderGeometry(1, 1, 1, 3); roofG.rotateX(Math.PI / 2); roofG.rotateZ(Math.PI);
    W.houses.add(jitter(inst(new THREE.BoxGeometry(1, 1, 1), std('#efe6d6', { roughness: .9 }), hb, true), .82, 1.05));
    W.houses.add(jitter(inst(roofG, std('#a8452f', { roughness: .8, flatShading: true }), hr, true), .7, 1.1));
    scene.add(W.houses);
    W.trees = new THREE.Group();
    const trunks = [], pines = [], rounds = [], bushes = [];
    for (let i = 0; i < 70; i++) {
      const s = i & 1 ? 1 : -1, x = s * (rnd(12, 26) + (Math.random() < .35 ? rnd(10, 60) : 0)), z = -rnd(0, 600), k = rnd(.8, 1.5), r = rnd(0, 6);
      for (const zz of [z + 40, z - 560]) {
        trunks.push([x, 1.0 * k, zz, r, k * .9, k, 0, k * .9]);
        (i % 3 ? pines : rounds).push(i % 3 ? [x, 3.9 * k, zz, r, k] : [x, 3.3 * k, zz, r, k]);
      }
    }
    for (let i = 0; i < 90; i++) {
      const s = i & 1 ? 1 : -1, x = s * rnd(13, 17), z = -rnd(0, 600), k = rnd(.7, 1.4), r = rnd(0, 6);
      for (const zz of [z + 40, z - 560]) bushes.push([x, .5 * k, zz, r, k]);
    }
    const lc = G.lc;
    const pineG = G.acc()
      .add(new THREE.ConeGeometry(1.85, 2.4, 8), 0, -1.3, 0, 0, 0, 0, 1, 1, 1, lc('#1f5a2d'))
      .add(new THREE.ConeGeometry(1.5, 2.2, 8), 0, -.2, 0, 0, .4, 0, 1, 1, 1, lc('#2a6e36'))
      .add(new THREE.ConeGeometry(1.15, 1.9, 8), 0, .8, 0, 0, .8, 0, 1, 1, 1, lc('#35823f'))
      .add(new THREE.ConeGeometry(.75, 1.7, 8), 0, 1.7, 0, 0, 1.2, 0, 1, 1, 1, lc('#4a9a4c')).build();
    const blob = new THREE.IcosahedronGeometry(1, 1);
    const roundG = G.acc()
      .add(blob, 0, -.5, 0, 0, 0, 0, 1.55, 1.25, 1.55, lc('#3f7f33'))
      .add(blob, 1.0, -.7, .5, 0, 0, 0, 1.1, 1, 1.1, lc('#478a38'))
      .add(blob, -1.0, -.6, -.4, 0, 0, 0, 1.15, 1, 1.15, lc('#3b7a30'))
      .add(blob, .1, .6, -.2, 0, 0, 0, 1.3, 1.1, 1.3, lc('#5a9f43'))
      .add(blob, -.5, -.3, 1.0, 0, 0, 0, 1, .9, 1, lc('#4a8d3a'))
      .add(blob, .5, .1, -1.0, 0, 0, 0, .95, .85, .95, lc('#53984a')).build();
    const bushG = G.acc()
      .add(blob, 0, 0, 0, 0, 0, 0, .8, .6, .8, lc('#3f7f33'))
      .add(blob, .6, -.1, .2, 0, 0, 0, .55, .45, .55, lc('#4f9440'))
      .add(blob, -.55, -.1, -.1, 0, 0, 0, .5, .42, .5, lc('#478a38')).build();
    const leafM = () => std('#ffffff', { roughness: .85, flatShading: true, vertexColors: true });
    const trunkG = G.acc()
      .add(new THREE.CylinderGeometry(.2, .3, 2.0, 7), 0, 0, 0, 0, 0, 0, 1, 1, 1, lc('#6b4a2e'))
      .add(new THREE.CylinderGeometry(.3, .45, .4, 7), 0, -.9, 0, 0, 0, 0, 1, 1, 1, lc('#5d3f26')).build();
    W.trees.add(inst(trunkG, std('#ffffff', { roughness: .9, vertexColors: true }), trunks, true));
    W.trees.add(jitter(inst(pineG, leafM(), pines, true), .8, 1.12));
    W.trees.add(jitter(inst(roundG, leafM(), rounds, true), .8, 1.12));
    W.trees.add(jitter(inst(bushG, leafM(), bushes, false), .75, 1.15));
    scene.add(W.trees);
    W.hills = new THREE.Group();
    const hills = [];
    for (let i = 0; i < 26; i++) {
      const s = i & 1 ? 1 : -1, x = s * rnd(60, 240), z = -rnd(0, 600), r = rnd(25, 70);
      for (const zz of [z + 60, z - 540]) hills.push([x, -r * .5, zz, rnd(0, 6), r, r * rnd(.45, .8), 0, r * rnd(.9, 1.4)]);
    }
    const hillG = new THREE.SphereGeometry(1, 11, 7);
    const hc1 = lc('#4a8334'), hc2 = lc('#78b04e'), hc3 = lc('#8fa86a');
    G.tint(hillG, (c, x, y, z) => { const t = Math.max(0, Math.min(1, y * 1.2)); c.copy(hc1).lerp(hc2, t).lerp(hc3, Math.max(0, y - .75) * 2.5).multiplyScalar(.92 + vnoise(x * 4 + 9, z * 4) * .16); });
    W.hills.add(inst(hillG, std('#ffffff', { roughness: 1, flatShading: true, vertexColors: true }), hills));
    scene.add(W.hills);
    W.ridges = [];
    for (const [dist, h0, h1, seed] of [[600, 30, 95, 3.1], [520, 12, 55, 9.7]]) {
      const pos = [], idx = [], N = 120;
      for (let i = 0; i <= N; i++) {
        const a = -Math.PI * .7 + i / N * Math.PI * 1.4, h = h0 + (h1 - h0) * Math.min(1, Math.pow(fbm(i * .21 + seed, seed, 4), 1.6) * 1.8);
        pos.push(Math.sin(a) * dist, -30, -Math.cos(a) * dist, Math.sin(a) * dist, h, -Math.cos(a) * dist);
        if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ fog: false, side: THREE.DoubleSide }));
      m.renderOrder = -5; m.frustumCulled = false; scene.add(m); W.ridges.push(m);
    }
    const sp = [];
    for (let i = 0; i < 700; i++) {
      const a = Math.random() * Math.PI * 2, y = Math.pow(Math.random(), .7), r = Math.sqrt(1 - y * y);
      sp.push(Math.cos(a) * r * 640, y * 640 + 10, Math.sin(a) * r * 640);
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    W.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    W.stars = new THREE.Points(sg, W.starMat); W.stars.renderOrder = -9; W.stars.frustumCulled = false;
    scene.add(W.stars);
    W.scroll = d => {
      W.road.offset.y = (W.road.offset.y + d / RLEN) % 1;
      W.grass.offset.y = (W.grass.offset.y + d / 10) % 1;
      W.gravel.offset.y = (W.gravel.offset.y + d / 8) % 1;
      W.posts.position.z = (W.posts.position.z + d) % 4;
      W.lamps.position.z = (W.lamps.position.z + d) % 50;
      W.signs.position.z = (W.signs.position.z + d) % 300;
      W.trees.position.z = (W.trees.position.z + d) % 600;
      W.hills.position.z = (W.hills.position.z + d) % 600;
      W.bridges.position.z = (W.bridges.position.z + d) % 600;
      W.bills.position.z = (W.bills.position.z + d) % 600;
      W.houses.position.z = (W.houses.position.z + d) % 600;
    };
    return W;
  }
  const HW_DAY = { top: '#2f7fe6', hor: '#d3e8ff', bot: '#9fb8cf', fog: '#c8def2', sun: '#fff1dc', sunI: 2.4, hemi: .9, hemiSky: '#d6e8ff', el: .75, glow: 1, night: 0 };
  const HW_SUNSET = { top: '#33468a', hor: '#ff9a58', bot: '#8a5a6a', fog: '#e9a385', sun: '#ffa25a', sunI: 1.8, hemi: .55, hemiSky: '#ffb892', el: .06, glow: 1.7, night: .3 };
  const HW_NIGHT = { top: '#02040b', hor: '#141d3a', bot: '#0a0e1a', fog: '#111930', sun: '#8aa4ff', sunI: .35, hemi: .22, hemiSky: '#3a4a80', el: .55, glow: .1, night: 1 };
  const HW_DAWN = { top: '#4a5f9e', hor: '#ffc29c', bot: '#8f8090', fog: '#e9bda8', sun: '#ffcf9e', sunI: 1.5, hemi: .55, hemiSky: '#ffd2b4', el: .1, glow: 1.3, night: .25 };
  const HW_CYCLE = [[0, HW_DAY], [.24, HW_DAY], [.38, HW_SUNSET], [.5, HW_NIGHT], [.84, HW_NIGHT], [.94, HW_DAWN], [1, HW_DAY]];
  const HW_PAL = ['#f2f2f0', '#1d3557', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#8d99ae', '#23262e', '#b5179e', '#c1121f', '#6c757d', '#3a86ff', '#ffbe0b', '#606c38'];

  function highway(api, root, v, K) {
    const { THREE, renderer, canvas } = v;
    const U = ui(root, canvas);
    const keys = api.keys, held = new Set();
    const fmt = n => n.toLocaleString() + ' m';
    const laneX = i => (i - 1.5) * 3.6;
    const PHX = .94, PHZ = 2.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, v.w / v.h, .1, 1000);
    camera.position.set(0, 3, 7.5);
    scene.fog = new THREE.Fog(0xffffff, 45, 430);
    const sky = K.sky(700); scene.add(sky.mesh);
    const W = roadWorld(THREE, K, scene, renderer);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    hemi.groundColor = K.lin('#55663f');
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 45, bottom: -45, near: 1, far: 220 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
    sun.target.position.set(0, 0, -14);
    scene.add(sun, sun.target);
    const headL = new THREE.SpotLight(0xfff1d6, 0, 95, .5, .55, 1.1);
    scene.add(headL, headL.target);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(sky.mesh.geometry, sky.mesh.material));
    let envRT = null, envT = 0;
    const updateEnv = () => {
      const rt = pmrem.fromScene(envScene, 0, .1, 1000);
      if (envRT) envRT.dispose();
      envRT = rt; scene.environment = rt.texture;
    };

    const CK = carKit(THREE, K), M = CK.M;
    const player = CK.build('sports', '#e8293b');
    player.g.rotation.order = 'YXZ';
    for (const w of player.wheels) w.rotation.order = 'YXZ';
    scene.add(player.g);
    const pool = [];
    const addPool = (type, n, pal) => {
      for (let i = 0; i < n; i++) {
        const V = CK.build(type, pick(pal || HW_PAL));
        V.on = false; V.g.visible = false; V.bOn = 0; V.bk = false;
        scene.add(V.g); pool.push(V);
      }
    };
    addPool('sedan', 12); addPool('hatch', 8); addPool('suv', 7);
    addPool('truck', 4, ['#d62828', '#1d3557', '#2a9d8f', '#f77f00', '#fcbf49']);
    addPool('bus', 2, ['#ffb703', '#e63946', '#3a86ff']);
    const burst = K.burst(scene, 90, .22);

    const P = HW_CYCLE.map(([t, p]) => [t, makePreset(K.lin, p)]);
    const cur = makePreset(K.lin, HW_DAY);
    const sd = new THREE.Vector3(), tint = K.lin('#2d3d3c'), tmp = new THREE.Vector3(), look = new THREE.Vector3(), camBase = new THREE.Vector3(0, 3, 7.5);
    const GEARS = [0, 16, 27, 38, 50, 63, 77, 92.5], VMAX = 92.5;
    const saved = api.load() || {};
    let cockpit = !!saved.cockpit;
    scene.add(camera);
    const cock = new THREE.Group();
    camera.add(cock);
    const plastic = K.std('#131418', { roughness: .9 }), plastic2 = K.std('#2a2c33', { roughness: .6 }), leather = K.std('#26211f', { roughness: .85 }), alu = K.std('#9aa1aa', { roughness: .3, metalness: .8 }), glove = K.std('#15161a', { roughness: .8 });
    const cMesh = (geo, mat, x, y, z, rx, ry, rz, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0); (parent || cock).add(m); return m; };
    const BXG = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const hood = cMesh(BXG(2.0, .12, 2.2), player.g.children[0].material, .36, -.5, -2.0, .07);
    cMesh(BXG(2.4, .32, .8), plastic, .4, -.37, -1.1, -.06);
    cMesh(BXG(2.4, .3, .1), plastic2, .4, -.43, -.72, -.25);
    cMesh(BXG(.62, .03, .26), plastic, 0, -.03, -.84, -.1); cMesh(BXG(.62, .24, .04), plastic, 0, -.13, -.98); cMesh(BXG(.64, .1, .3), plastic, 0, -.29, -.9);
    cMesh(BXG(.36, .17, .02), plastic2, .52, -.33, -.58, -.3);
    cMesh(BXG(.14, .035, .022), alu, .52, -.25, -.57, -.3);
    for (const x of [.44, .6]) cMesh(new THREE.CylinderGeometry(.032, .032, .025, 14), alu, x, -.35, -.57, Math.PI / 2 - .3);
    const gaugeC = document.createElement('canvas'); gaugeC.width = 512; gaugeC.height = 224;
    const gaugeT = new THREE.CanvasTexture(gaugeC); gaugeT.encoding = THREE.sRGBEncoding;
    cMesh(new THREE.PlaneGeometry(.5, .22), new THREE.MeshBasicMaterial({ map: gaugeT, toneMapped: false }), 0, -.125, -.955, -.12);
    const gctx = gaugeC.getContext('2d');
    const dial = (cx, cy, r, val, max, step, sub, label, unit, red) => {
      const a0 = Math.PI * .75, span = Math.PI * 1.5, ang = v => a0 + span * v / max;
      gctx.fillStyle = '#0b0c10'; gctx.beginPath(); gctx.arc(cx, cy, r, 0, Math.PI * 2); gctx.fill();
      gctx.strokeStyle = '#9aa1aa'; gctx.lineWidth = 4; gctx.beginPath(); gctx.arc(cx, cy, r - 2, 0, Math.PI * 2); gctx.stroke();
      if (red) { gctx.strokeStyle = '#e8293b'; gctx.lineWidth = 8; gctx.beginPath(); gctx.arc(cx, cy, r - 12, ang(red), ang(max)); gctx.stroke(); }
      gctx.fillStyle = '#e9edf3'; gctx.strokeStyle = '#e9edf3'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.font = '700 15px sans-serif';
      for (let v = 0; v <= max + 1e-6; v += step / sub) {
        const a = ang(v), major = Math.abs(v / step - Math.round(v / step)) < 1e-6, r0 = r - (major ? 22 : 15);
        gctx.lineWidth = major ? 3 : 1.5; gctx.beginPath(); gctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); gctx.lineTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8)); gctx.stroke();
        if (major) gctx.fillText(Math.round(v / (max > 1000 ? 1000 : 1)), cx + Math.cos(a) * (r - 36), cy + Math.sin(a) * (r - 36));
      }
      gctx.font = '800 12px sans-serif'; gctx.fillStyle = '#8f97a3'; gctx.fillText(label, cx, cy + r * .42);
      const a = ang(clamp(val, 0, max));
      gctx.strokeStyle = '#ff5a3c'; gctx.lineWidth = 4; gctx.beginPath(); gctx.moveTo(cx - Math.cos(a) * 10, cy - Math.sin(a) * 10); gctx.lineTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)); gctx.stroke();
      gctx.fillStyle = '#30343c'; gctx.beginPath(); gctx.arc(cx, cy, 9, 0, Math.PI * 2); gctx.fill();
      if (unit) { gctx.fillStyle = '#ffffff'; gctx.font = '900 24px sans-serif'; gctx.fillText(unit, cx, cy + r * .66); }
    };
    const drawGauges = () => {
      gctx.fillStyle = '#16171c'; gctx.fillRect(0, 0, 512, 224);
      dial(128, 112, 106, S.kmhF || 0, 340, 40, 4, 'KM/H', String(Math.round(S.kmhF || 0)));
      dial(384, 112, 106, S.rpm || 0, 8000, 1000, 2, 'RPM x1000', '', 6500);
      gctx.fillStyle = '#0b0c10'; gctx.fillRect(226, 70, 60, 84);
      gctx.fillStyle = '#ffb020'; gctx.font = '900 54px sans-serif'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillText(S.gear || 1, 256, 108);
      gctx.fillStyle = S.dmg > .6 ? '#ff4d4d' : S.dmg > .25 ? '#ffb020' : '#3ddc84'; gctx.fillRect(232, 160, 48 * Math.max(.04, 1 - (S.dmg || 0)), 6);
      gaugeT.needsUpdate = true;
    };
    const wheel = new THREE.Group(); wheel.position.set(0, -.44, -.64); wheel.rotation.x = -.42; cock.add(wheel);
    const tube = (x1, y1, z1, x2, y2, z2, r0, r1, mat, parent) => { const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2), m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), 10), mat); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); (parent || cock).add(m); return m; };
    cMesh(new THREE.TorusGeometry(.18, .024, 10, 40), leather, 0, 0, 0, 0, 0, 0, wheel);
    cMesh(new THREE.CylinderGeometry(.055, .06, .05, 18), plastic2, 0, 0, .01, Math.PI / 2, 0, 0, wheel);
    cMesh(BXG(.32, .03, .016), alu, 0, -.01, .005, 0, 0, 0, wheel);
    cMesh(BXG(.03, .16, .016), alu, 0, -.095, .005, 0, 0, 0, wheel);
    cMesh(BXG(.035, .012, .05), K.std('#e8293b', { roughness: .5 }), 0, .18, 0, 0, 0, 0, wheel);
    cMesh(new THREE.CircleGeometry(.03, 16), K.std('#e8293b', { roughness: .4, metalness: .3 }), 0, 0, .037, 0, 0, 0, wheel);
    for (const sx of [-1, 1]) {
      const h = cMesh(new THREE.SphereGeometry(.033, 12, 8), glove, sx * .17, .07, .025, 0, 0, sx * .5, wheel); h.scale.set(1, 1.35, 1);
    }
    tube(0, -.06, -.04, 0, -.15, -.3, .045, .05, plastic, wheel);
    const pil = (x1, y1, z1, x2, y2, z2, w) => { const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2), m = new THREE.Mesh(BXG(w, w * .6, a.distanceTo(b)), plastic); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize()); cock.add(m); return m; };
    pil(-.7, -.22, -.95, -.52, .46, -.25, .09); pil(1.5, -.22, -1.0, 1.24, .46, -.25, .09);
    cMesh(BXG(2.2, .08, .34), plastic2, .4, .47, -.3);
    cMesh(BXG(.1, .5, 1.6), plastic2, -.74, -.42, -.15);
    const mirRT = new THREE.WebGLRenderTarget(320, 96);
    const mirCam = new THREE.PerspectiveCamera(42, 320 / 96, .5, 900);
    scene.add(mirCam);
    const mirMat = new THREE.MeshBasicMaterial({ map: mirRT.texture, toneMapped: false });
    mirRT.texture.repeat.x = -1; mirRT.texture.offset.x = 1;
    cMesh(BXG(.3, .085, .03), plastic, .24, .22, -.56, .1);
    cMesh(new THREE.PlaneGeometry(.28, .07), mirMat, .24, .22, -.543, .1);
    cMesh(BXG(.02, .1, .02), plastic, .24, .3, -.57);
    for (const [x, y, z, ry] of [[-.86, -.1, -1.0, .45], [1.75, -.1, -1.15, -.45]]) {
      const mm = new THREE.Group(); mm.position.set(x, y, z); mm.rotation.y = ry; cock.add(mm);
      cMesh(BXG(.2, .13, .06), player.g.children[0].material, 0, 0, -.035, 0, 0, 0, mm);
      cMesh(new THREE.PlaneGeometry(.18, .11), mirMat, 0, 0, .0, 0, 0, 0, mm);
    }
    cock.visible = false;
    const NST = 80, stPos = new Float32Array(NST * 6), stZ = new Float32Array(NST);
    const stGeo = new THREE.BufferGeometry(); stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
    const stMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    const streaks = new THREE.LineSegments(stGeo, stMat); streaks.frustumCulled = false; scene.add(streaks);
    const stX = new Float32Array(NST), stY = new Float32Array(NST);
    const stReset = (i, far) => { const sx = Math.random() < .5 ? -1 : 1; stX[i] = Math.random() < .25 ? rnd(-6, 6) : sx * rnd(4, 15); stY[i] = stX[i] > -3 && stX[i] < 3 ? rnd(4.5, 8) : rnd(.3, 6.5); stZ[i] = far ? -rnd(20, 120) : -rnd(90, 130); };
    for (let i = 0; i < NST; i++) stReset(i, true);
    const updStreaks = dt => {
      const f = clamp((S.V - 38) / 50, 0, 1);
      stMat.opacity = f * .5;
      streaks.visible = f > 0;
      if (!f) return;
      const len = S.V * .07;
      for (let i = 0; i < NST; i++) {
        stZ[i] += S.V * dt;
        if (stZ[i] > 8) stReset(i, false);
        const k = i * 6;
        stPos[k] = stPos[k + 3] = stX[i]; stPos[k + 1] = stPos[k + 4] = stY[i]; stPos[k + 2] = stZ[i]; stPos[k + 5] = stZ[i] - len;
      }
      stGeo.attributes.position.needsUpdate = true;
    };


    const left = U.row('left:max(10px,1.6cqw);top:max(10px,1.6cqw);flex-direction:column;gap:max(3px,.6cqw)');
    left.className = 'lt';
    const hDist = U.chip(left, 'Score'), hNear = U.chip(left, 'Near misses'), hDmg = U.chip(left, 'Damage');
    const vig = document.createElement('div'); vig.className = 'vig'; U.hud.prepend(vig);
    const camBtn = document.createElement('button'); camBtn.type = 'button'; camBtn.className = 'cam'; camBtn.innerHTML = '<span>C</span> Camera';
    camBtn.addEventListener('pointerdown', e => { e.stopPropagation(); });
    camBtn.addEventListener('click', e => { e.stopPropagation(); camBtn.blur(); toggleCam(); });
    U.hud.append(camBtn);
    const toggleCam = () => { cockpit = !cockpit; api.save(Object.assign(api.load() || {}, { cockpit })); applyCam(); };
    const applyCam = () => { cock.visible = cockpit; player.g.visible = !cockpit; speedo.style.display = cockpit ? 'none' : ''; camera.near = cockpit ? .05 : .1; camera.updateProjectionMatrix(); };
    api.on(window, 'keydown', e => { if (e.code === 'KeyC' && !e.repeat && !e.ctrlKey && !e.metaKey) toggleCam(); });
    const right = U.row('right:max(10px,1.6cqw);top:max(58px,8.6cqw);flex-direction:column;align-items:flex-end;gap:max(3px,.6cqw)');
    right.className = 'rt';
    const hKm = U.chip(right, 'Distance'), hMode = U.chip(right, 'Mode'), hWrong = U.chip(right, 'Opposing lane');
    hWrong.textContent = 'x2';
    hWrong.parentNode.classList.add('opp'); hMode.parentNode.style.display = 'none';
    const speedo = document.createElement('div');
    speedo.className = 'speedo';
    speedo.innerHTML = '<b>0</b><span>km/h</span>';
    U.hud.append(speedo);
    const hSpd = speedo.firstChild;
    U.pad('l', [['L', ARROW('M15 5l-7 7 7 7'), 'Steer left'], ['R', ARROW('M9 5l7 7-7 7'), 'Steer right']], held);
    U.pad('r', [['B', ARROW('M5 9l7 7 7-7'), 'Brake'], ['G', ARROW('M5 15l7-7 7 7'), 'Gas']], held);
    const has = (a, b, c) => keys.has(a) || keys.has(b) || held.has(c);

    const fresh = () => ({ dmg: 0, gear: 2, rpm: 3000, kmhF: 86, shift: 0, scrape: 0, x: laneX(2), vx: 0, V: 24, dist: 0, bonus: 0, near: 0, top: 0, yaw: 0, roll: 0, pitch: 0, pitchT: 0, steer: 0, spin: 0, crashT: 0, acc: 0, gap: 40, tick: 0, shown: -1, shake: 0, spark: 0, kmh: -1 });
    let S = fresh(), mode = 'ready', twoWay = false, clock = 0, T = 0, ts = 1, braking = false;
    const total = () => Math.floor(S.dist + S.bonus);

    function hudAll() {
      const d = mode === 'ready' ? 0 : total();
      if (d !== S.hd) { S.hd = d; hDist.textContent = d.toLocaleString(); hNear.textContent = S.near; hKm.textContent = ((mode === 'ready' ? 0 : S.dist) / 1000).toFixed(2) + ' km'; }
      const dm = Math.round(S.dmg * 100);
      if (dm !== S.hdm) { S.hdm = dm; hDmg.textContent = dm + '%'; hDmg.style.color = dm > 60 ? '#ff5a4a' : dm > 25 ? '#ffb020' : ''; }
      hMode.textContent = twoWay ? 'Two-way' : 'One-way';
      hWrong.parentNode.style.display = twoWay && S.x < 0 && mode === 'run' ? '' : 'none';
      const kmh = Math.round(S.V * 3.6);
      if (kmh !== S.kmh) {
        S.kmh = kmh; hSpd.textContent = kmh;
        speedo.style.setProperty('--p', Math.min(1, kmh / 250).toFixed(3));
      }
    }

    function spawn(k, live, zo) {
      let lane = Math.floor(Math.random() * 4);
      if (live && zo == null && Math.random() < .42) lane = clamp(Math.round(S.x / 3.6 + 1.5), 0, 3);
      const onc = twoWay && lane < 2;
      const r = Math.random();
      const type = r < .07 + k * .06 ? 'truck' : r < .11 + k * .08 ? 'bus' : r < .33 ? 'suv' : r < .58 ? 'hatch' : 'sedan';
      const V = pool.find(p => !p.on && p.type === type) || pool.find(p => !p.on && (p.type === 'sedan' || p.type === 'hatch'));
      if (!V) return false;
      const big = V.type === 'truck' || V.type === 'bus';
      const speed = (big ? rnd(17, 23) : rnd(20, 29)) * (1 + k * .18);
      const ahead = onc || S.V > speed - 1;
      const z = zo != null ? zo : ahead ? -rnd(300, 340) : 62;
      if (!ahead && Math.abs(laneX(lane) - S.x) < 3) return false;
      if (!live && Math.abs(laneX(lane) - S.x) < 3) return false;
      const used = new Set([lane]);
      for (const o of pool) {
        if (!o.on) continue;
        if ((o.lane === lane || o.tl === lane) && Math.abs(o.z - z) < o.hz + V.hz + 26) return false;
        if (Math.abs(o.z - z) < 50) { used.add(o.lane); used.add(o.tl); }
      }
      if (used.size >= 4) return false;
      Object.assign(V, { on: true, lane, tl: lane, x: laneX(lane), z, v: speed, v0: speed, dir: onc ? -1 : 1, ch: 0, t: 0, ct: rnd(1, 5), passed: z > 0, wreck: false, spin: 0, vx: 0, yaw: 0, brake: false, bd: 0, wants: !big && Math.random() < .3 + .45 * k });
      V.g.visible = true;
      return true;
    }

    function tryChange(V) {
      const lo = twoWay ? (V.dir < 0 ? 0 : 2) : 0, hi = twoWay ? (V.dir < 0 ? 1 : 3) : 3, opts = [];
      for (const d of [-1, 1]) {
        const l = V.lane + d;
        if (l < lo || l > hi) continue;
        let ok = !(Math.abs(laneX(l) - S.x) < 3 && Math.abs(V.z) < V.hz + 16);
        if (ok) for (const o of pool) if (o !== V && o.on && (o.lane === l || o.tl === l) && Math.abs(o.z - V.z) < o.hz + V.hz + 16) { ok = false; break; }
        if (ok) opts.push(d);
      }
      if (!opts.length) return;
      const d = pick(opts);
      V.tl = V.lane + d; V.ch = 1; V.t = 0; V.fx = V.x; V.bd = d;
    }

    function traffic(dt, live) {
      const blinkOn = (clock * 2.6) % 1 < .55;
      for (const V of pool) {
        if (!V.on) continue;
        if (V.wreck) {
          V.v = damp(V.v, 0, 2, dt);
          V.yaw += V.spin * dt; V.spin = damp(V.spin, 0, 1.6, dt);
          V.vx = damp(V.vx, 0, 2.5, dt); V.x += V.vx * dt;
        } else {
          let target = V.v0;
          for (const o of pool) {
            if (o === V || !o.on || o.dir !== V.dir) continue;
            if (o.lane !== V.lane && o.tl !== V.lane && o.lane !== V.tl && o.tl !== V.tl) continue;
            const gap = (V.z - o.z) * V.dir - o.hz - V.hz;
            if (gap > -2 && gap < 24) target = Math.min(target, o.v - (24 - gap) * .3);
          }
          if (Math.abs(V.x - S.x) < 2.6) {
            if (V.dir > 0) {
              const gap = V.z - PHZ - V.hz;
              if (gap > -2 && gap < 24) target = Math.min(target, S.V - (24 - gap) * .3);
            } else if (mode !== 'run' && mode !== 'ready') {
              const gap = -V.z - PHZ - V.hz;
              if (gap > -2 && gap < 40) target = 0;
            }
          }
          target = Math.max(0, target);
          V.brake = target < V.v - .6;
          V.v = V.brake ? damp(V.v, target, 4, dt) : damp(V.v, target, .8, dt);
          if (V.ch === 0 && V.wants && live && V.z > -220 && V.z < -30 && (V.ct -= dt) <= 0) { V.wants = Math.random() < .35; V.ct = rnd(3, 7); tryChange(V); }
          if (V.ch === 1 && (V.t += dt) >= 1.1) { V.ch = 2; V.t = 0; }
          else if (V.ch === 2) {
            V.t = Math.min(1, V.t + dt / 1.6);
            V.x = lerp(V.fx, laneX(V.tl), smooth(V.t));
            V.yaw = -Math.sin(V.t * Math.PI) * .07 * V.bd * V.dir;
            if (V.t >= 1) { V.ch = 0; V.lane = V.tl; V.yaw = 0; }
          }
        }
        V.z += (V.dir > 0 ? S.V - V.v : S.V + V.v) * dt;
        const spin = V.v * dt / V.r;
        for (const w of V.wheels) w.rotation.x -= spin;
        V.g.position.set(V.x, 0, V.z);
        V.g.rotation.y = (V.dir > 0 ? 0 : Math.PI) + V.yaw;
        const b = V.wreck ? (blinkOn ? 2 : 0) : V.ch > 0 && blinkOn ? V.bd * V.dir : 0;
        if (b !== V.bOn) {
          V.bOn = b;
          for (const m of V.bl) m.material = b < 0 || b === 2 ? M.amberOn : M.amber;
          for (const m of V.br) m.material = b > 0 ? M.amberOn : M.amber;
        }
        if (V.brake !== V.bk) { V.bk = V.brake; for (const m of V.tails) m.material = V.brake ? M.tailOn : M.tail; }
        if (live) {
          const dx = Math.abs(V.x - S.x);
          if (dx < V.hx + PHX - .05 && Math.abs(V.z) < V.hz + PHZ - .1) crash(V);
          else if (!V.passed && V.z > 0) {
            V.passed = true;
            const gap = dx - V.hx - PHX, fast = S.V * 3.6 > 100;
            if (gap < .9) {
              const add = fast ? 100 : 50;
              S.near++; S.bonus += add;
              U.pop('Near miss +' + add);
              api.sfx('pop');
            } else if (fast && V.dir > 0) { S.bonus += 20; U.pop('Overtake +20', 'sm'); }
          }
        }
        if (V.z > 75 || V.z < -470) { V.on = false; V.g.visible = false; }
      }
    }
    function crash(V) {
      if (mode !== 'run') return;
      mode = 'crash'; S.crashT = 0; ts = .22; S.shake = 1;
      if (!V) {
        const side = S.x > 0 ? -1 : 1;
        S.spin = side * rnd(2.4, 3.6); S.vx = side * 4; S.V *= .45;
        tmp.set(S.x - side * 1, .7, -.5);
        burst.fire(tmp, 50, 9, ['#e8293b', '#cfd4da', '#ffcf5a', '#16171b', '#ff9f1c', '#b9b6ae'], 1.1);
        api.sfx('hit'); api.score(total());
        return;
      }
      const side = V.x < S.x ? 1 : -1;
      S.spin = side * rnd(2.4, 3.6); S.vx = side * 5;
      Object.assign(V, { wreck: true, spin: -side * rnd(1.5, 3), vx: -side * 3, ch: 0, yaw: V.yaw });
      if (V.dir < 0) V.v = 0;
      S.V *= V.dir < 0 ? .15 : .5;
      tmp.set((V.x + S.x) / 2, .9, V.z * .5);
      burst.fire(tmp, 50, 10, ['#e8293b', '#2a3850', '#cfd4da', '#ffcf5a', '#16171b', '#ff9f1c'], 1.1);
      api.sfx('hit');
      api.score(total());
    }

    function finish() {
      mode = 'over';
      const t = total(), nb = api.submit(t);
      api.score(t);
      const unit = (n, u) => `${n}<small style="font-size:12px;font-weight:700;color:var(--muted)"> ${u}</small>`;
      api.overlay({
        kicker: nb ? 'New best!' : 'Crashed',
        title: 'Game over',
        text: (S.dmg >= 1 ? 'Too much barrier scraping wrecked the car. ' : '') + (S.near ? `${S.near} near miss${S.near > 1 ? 'es' : ''} added ${S.bonus.toLocaleString()} m of bonus.` : 'Skim past cars for near-miss bonuses.'),
        stats: [['Score', unit(t.toLocaleString(), 'm')], ['Top speed', unit(Math.round(S.top * 3.6), 'km/h')], ['Near misses', S.near], ['Best', api.best != null ? unit(api.best.toLocaleString(), 'm') : '—']],
        button: 'Play again', onAction: () => start(twoWay),
        secondary: 'Change mode', onSecondary: menu
      });
    }

    function start(two) {
      if (two !== twoWay) { twoWay = two; W.road.redraw(two); }
      for (const V of pool) { V.on = false; V.g.visible = false; }
      S = fresh(); mode = 'run'; ts = 1; T = 0; envT = 99;
      S.V = 25;
      for (let i = 0; i < 16; i++) spawn(0, true, -rnd(70, 300));
      api.score(0);
    }

    function menu() {
      if (mode !== 'ready') { for (const V of pool) { V.on = false; V.g.visible = false; } S = fresh(); }
      mode = 'ready';
      api.overlay({
        kicker: '3D', title: 'Traffic Racer',
        text: 'Hold the gas and weave through traffic up to 330 km/h. Skim past cars for near-miss bonuses, doubled above 100 km/h. Scraping the barriers damages the car. Two-way adds oncoming lanes on the left that score double. Press C (or the Camera button) for the cockpit view.',
        button: 'One-way', onAction: () => start(false),
        secondary: 'Two-way', onSecondary: () => start(true)
      });
    }

    function drive(dt) {
      const g = has('ArrowUp', 'KeyW', 'G'), b = has('ArrowDown', 'KeyS', 'B');
      const st = (has('ArrowRight', 'KeyD', 'R') ? 1 : 0) - (has('ArrowLeft', 'KeyA', 'L') ? 1 : 0);
      const gear0 = S.gear;
      let gi = 1; while (gi < GEARS.length - 1 && S.V > GEARS[gi] - .4) gi++;
      if (gi > gear0 && g) S.shift = .24;
      S.gear = gi;
      S.shift = Math.max(0, S.shift - dt);
      if (b) S.V -= 21 * dt;
      else if (g) S.V += 9.2 * Math.max(0, 1 - Math.pow(S.V / VMAX, 2.4)) * (S.shift > 0 ? .3 : 1) * dt;
      else S.V -= (.5 + S.V * .011) * dt;
      S.V = clamp(S.V, 8.4, VMAX);
      const lo = GEARS[S.gear - 1], hi = GEARS[S.gear];
      S.rpm = damp(S.rpm, clamp(S.gear === 1 ? 900 + S.V / hi * 6400 : 2600 + (S.V - lo) / (hi - lo) * 4900, 800, 7900) + (g ? 250 : 0), 10, dt);
      S.kmhF = S.V * 3.6;
      S.top = Math.max(S.top, S.V);
      braking = b;
      const lat = 4.6 + S.V * .075;
      S.vx = damp(S.vx, st * lat, 7, dt);
      S.x += S.vx * dt;
      S.steer = damp(S.steer, st * .32, 12, dt);
      const LIM = 6.78;
      if (Math.abs(S.x) > LIM) {
        const sg = Math.sign(S.x), hit = Math.max(0, S.vx * sg);
        S.x = sg * LIM;
        S.dmg = Math.min(1, S.dmg + hit * .03 + dt * (.2 + S.V / VMAX * .55));
        S.vx = -sg * (1.2 + hit * .35);
        S.V -= S.V * 1.3 * dt + hit * .5;
        S.shake = Math.max(S.shake, .18 + hit * .05);
        if ((S.spark -= dt) <= 0) { S.spark = .04; tmp.set(S.x + sg * .95, .4, .6); burst.fire(tmp, 4, 5, ['#ffd166', '#ff9f1c', '#fff3b0'], .6); }
        if ((S.scrape -= dt) <= 0) { S.scrape = .9; U.pop('Scraping! ' + Math.round(S.dmg * 100) + '% damage', 'bad'); api.sfx('hit'); }
        if (S.dmg >= 1) { crash(null); return; }
      }
      S.pitchT = b ? -.022 : g ? .012 : 0;
      const k = 1 - Math.exp(-S.dist / 5000);
      S.dist += S.V * dt * (twoWay && S.x < 0 ? 2 : 1);
      S.acc += Math.max(S.V, 16) * dt;
      if (S.acc >= S.gap && spawn(k, true)) { S.acc = 0; S.gap = lerp(50, 19, k) * rnd(.7, 1.3) * (twoWay ? .85 : 1) * (1 + S.V / VMAX * .25); }
      if ((S.tick -= dt) <= 0) { S.tick = .2; const t = total(); if (t !== S.shown) api.score(S.shown = t); }
    }

    function cycle(dt) {
      T += dt;
      const p = (T / 190) % 1;
      let i = 0;
      while (p > P[i + 1][0]) i++;
      const a = P[i], b = P[i + 1];
      lerpPreset(cur, a[1], b[1], smooth((p - a[0]) / (b[0] - a[0])));
      const u = sky.u;
      u.top.value.copy(cur.top); u.hor.value.copy(cur.hor); u.bot.value.copy(cur.bot);
      u.sunCol.value.copy(cur.sun); u.sunAmt.value = cur.glow;
      sd.set(Math.sin(.45) * Math.cos(cur.el), Math.sin(cur.el), -Math.cos(.45) * Math.cos(cur.el));
      u.sunDir.value.copy(sd);
      scene.fog.color.copy(cur.fog);
      sun.color.copy(cur.sun); sun.intensity = cur.sunI;
      sun.position.copy(sun.target.position).addScaledVector(sd, 90);
      hemi.color.copy(cur.hemiSky); hemi.intensity = cur.hemi;
      const n = cur.night;
      W.lampMat.emissiveIntensity = n * 3.2;
      W.signMat.emissiveIntensity = n * .55;
      W.billMat.emissiveIntensity = n * .7;
      W.poolMat.opacity = n * .5;
      W.starMat.opacity = clamp((n - .4) / .6, 0, 1);
      M.head.emissiveIntensity = .4 + n * 3;
      M.tail.emissiveIntensity = .4 + n * 1.8;
      headL.intensity = n * 6;
      W.ridges[0].material.color.copy(cur.fog).lerp(tint, .22);
      W.ridges[1].material.color.copy(cur.fog).lerp(tint, .42);
      envT += dt;
      if (envT > (a[1] !== b[1] ? (COARSE ? 6 : 2.5) : 30)) { envT = 0; updateEnv(); }
    }

    function view(dt, rdt) {
      const f = clamp((S.V - 20) / 65, 0, 1);
      vig.style.opacity = (clamp((S.V - 40) / 50, 0, 1) * .9).toFixed(3);
      if (cockpit) {
        const vib = (.0025 + f * f * .006) * (mode === 'run' ? 1 : .4);
        camera.rotation.order = 'YXZ';
        camera.position.set(S.x - .36 * Math.cos(S.yaw) + rnd(-vib, vib), 1.04 + S.pitch * .3 + rnd(-vib, vib), .15 + .36 * Math.sin(S.yaw));
        camera.rotation.set(S.pitch * 1.4 - .045 + (S.shake > 0 ? rnd(-.03, .03) * S.shake : 0), S.yaw + (S.shake > 0 ? rnd(-.03, .03) * S.shake : 0), S.roll * .6);
        S.shake = Math.max(0, S.shake - rdt * 1.4);
        const fov = 64 + f * 16;
        if (Math.abs(camera.fov - fov) > .01) { camera.fov = damp(camera.fov, fov, 3, rdt); camera.updateProjectionMatrix(); }
        wheel.rotation.z = -S.steer * 3.2;
        sky.mesh.position.copy(camera.position);
        W.stars.position.copy(camera.position);
        for (const r of W.ridges) r.position.x = camera.position.x;
        if ((S.gt = (S.gt || 0) + rdt) > .05) { S.gt = 0; drawGauges(); }
        S.mf = (S.mf || 0) + 1;
        if (S.mf % 2 === 0) {
          mirCam.position.set(S.x, 1.25, .6); mirCam.rotation.set(-.02, Math.PI + S.yaw, 0);
          const sv = streaks.visible;
          cock.visible = false; streaks.visible = false;
          renderer.setRenderTarget(mirRT); renderer.render(scene, mirCam); renderer.setRenderTarget(null);
          cock.visible = true; streaks.visible = sv;
        }
        return;
      }
      camBase.x = damp(camBase.x, S.x * .72, 6, rdt);
      camBase.y = damp(camBase.y, 4.9 + f * .25, 4, rdt);
      camBase.z = damp(camBase.z, 8.6 + f * .8, 4, rdt);
      camera.position.copy(camBase);
      if (S.shake > 0) {
        camera.position.x += rnd(-.35, .35) * S.shake; camera.position.y += rnd(-.25, .25) * S.shake;
        S.shake = Math.max(0, S.shake - rdt * 1.4);
      }
      const hum = f * f * .05 * (mode === 'run' ? 1 : .3);
      camera.position.x += rnd(-hum, hum); camera.position.y += rnd(-hum, hum) * .7;
      const fov = 54 + f * 12;
      if (Math.abs(camera.fov - fov) > .01) { camera.fov = damp(camera.fov, fov, 3, rdt); camera.updateProjectionMatrix(); }
      look.set(S.x * .9, 0, -9);
      camera.lookAt(look);
      camera.rotateZ(-S.vx * .005);
      sky.mesh.position.copy(camera.position);
      W.stars.position.copy(camera.position);
      for (const r of W.ridges) r.position.x = camera.position.x;
    }

    api.loop(rdt => {
      clock += rdt;
      if (mode === 'crash') {
        S.crashT += rdt; ts = damp(ts, .9, .8, rdt);
        if (S.crashT > 1.9) finish();
      } else ts = 1;
      const dt = rdt * ts;
      if (mode === 'run') drive(dt);
      else if (mode === 'ready') {
        braking = false;
        S.V = damp(S.V, 24, 2, dt); S.x = damp(S.x, laneX(2), 2, dt); S.vx = 0;
        S.acc += S.V * dt;
        if (S.acc > 45 && spawn(.1, false)) S.acc = 0;
      } else {
        braking = true;
        S.V = damp(S.V, 0, 1.3, dt);
        S.yaw += S.spin * dt; S.spin = damp(S.spin, 0, 1.4, dt);
        S.vx = damp(S.vx, 0, 2, dt); S.x = clamp(S.x + S.vx * dt, -7.6, 7.6);
      }
      W.scroll(S.V * dt);
      traffic(dt, mode === 'run');
      const pg = player.g;
      if (mode === 'run' || mode === 'ready') {
        S.yaw = -S.vx / Math.max(S.V, 6) * .9;
        S.roll = damp(S.roll, S.vx * .012, 8, dt);
        S.pitch = damp(S.pitch, S.pitchT, 5, dt);
      }
      pg.position.set(S.x, Math.sin(clock * 31) * .006 * clamp(S.V / 40, 0, 1), 0);
      pg.rotation.set(S.pitch, S.yaw, S.roll);
      const spin = S.V * dt / player.r;
      player.wheels.forEach((w, i) => { w.rotation.x -= spin; if (i < 2) w.rotation.y = S.steer; });
      if (braking !== S.bk) { S.bk = braking; for (const m of player.tails) m.material = braking ? M.tailOn : M.tail; }
      headL.position.set(S.x, .8, -2.3);
      headL.target.position.set(S.x + S.vx * .4, 0, -26);
      burst.update(dt, 9.8, .08, S.V * dt);
      updStreaks(dt);
      cycle(dt);
      view(dt, rdt);
      hudAll();
      renderer.render(scene, camera);
    });

    updateEnv();
    applyCam();
    menu();
    return () => { K.dispose(scene); if (envRT) envRT.dispose(); pmrem.dispose(); mirRT.dispose(); gaugeT.dispose(); };
  }

  Ameplay.register({
    id: 'highway-3d',
    title: 'Highway 3D',
    category: '3D',
    blurb: 'Weave through highway traffic at full speed, from day into night.',
    help: '<kbd>←</kbd> <kbd>→</kbd> steer · <kbd>↑</kbd> gas · <kbd>↓</kbd> brake (or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>) · <kbd>C</kbd> cockpit / chase camera · on-screen pedals on touch',
    better: 'high',
    format: v => v.toLocaleString() + ' m',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6 9 58M41 6l14 52"/><path d="M32 8v6M32 22v6" opacity=".4"/><path d="M19 45l3-8.5c.5-1.3 1.6-2.1 3-2.1h14c1.4 0 2.5.8 3 2.1l3 8.5"/><rect x="16" y="44" width="32" height="10" rx="3"/><path d="M20 54v3M44 54v3"/><circle cx="22" cy="49" r="1.5"/><circle cx="42" cy="49" r="1.5"/></svg>',
    css: uiCss('highway-3d') + `
.gm-highway-3d .speedo{--p:0;position:absolute;left:50%;bottom:max(8px,1.8cqw);transform:translateX(-50%);width:max(92px,13cqw);aspect-ratio:1;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;background:radial-gradient(closest-side,rgba(14,16,34,.8) 78%,transparent 79%),conic-gradient(from 225deg,#ffd166 0deg,#ff5d5d calc(var(--p) * 270deg),rgba(255,255,255,.25) calc(var(--p) * 270deg) 270deg,transparent 270deg);box-shadow:0 12px 26px -14px rgba(0,0,0,.7)}
.gm-highway-3d .speedo{left:auto;right:max(8px,1.6cqw);transform:none;width:max(66px,13cqw)}
.gm-highway-3d .speedo b{font-size:max(17px,3.5cqw);font-weight:900;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.gm-highway-3d .vig{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 55%,rgba(8,10,18,.22) 78%,rgba(8,10,18,.55) 100%);pointer-events:none}
.gm-highway-3d .cam{position:absolute;left:max(10px,1.6cqw);bottom:max(10px,1.6cqw);pointer-events:auto;display:flex;align-items:center;gap:6px;height:max(30px,4.6cqw);padding:0 max(10px,1.6cqw);border:0;border-radius:999px;background:rgba(16,18,40,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#fff;font:800 max(11px,1.5cqw)/1 var(--sans);cursor:pointer}
.gm-highway-3d .cam span{display:grid;place-items:center;min-width:1.6em;height:1.6em;border-radius:6px;background:rgba(255,255,255,.22);font-size:.85em}
.gm-highway-3d .speedo span{font-size:max(7px,1.05cqw);font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.gm-highway-3d .chip{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none;padding:0;border-radius:0;text-shadow:0 2px 0 rgba(0,0,0,.85),0 0 5px rgba(0,0,0,.7)}
.gm-highway-3d .chip .k{color:#ffd21a;opacity:1;font-size:max(9px,1.45cqw);letter-spacing:.05em}
.gm-highway-3d .chip .v{font-size:max(15px,2.9cqw);letter-spacing:0}
.gm-highway-3d .lt .chip:first-child .v{color:#b6ff6a;font-size:max(18px,3.6cqw)}
.gm-highway-3d .chip.opp .v{color:#b6ff6a}
.gm-highway-3d .rt .chip{align-items:flex-end}
.gm-highway-3d .speedo{top:max(10px,1.6cqw);bottom:auto;right:max(10px,1.6cqw);left:auto;transform:none;width:auto;aspect-ratio:auto;border-radius:0;background:none!important;box-shadow:none;display:grid;grid-template-columns:auto auto;align-items:baseline;justify-items:end;column-gap:.3em;text-shadow:0 2px 0 rgba(0,0,0,.85),0 0 5px rgba(0,0,0,.7)}
.gm-highway-3d .speedo::before{content:'SPEED';grid-column:1/3;color:#ffd21a;font-size:max(9px,1.45cqw);font-weight:900;letter-spacing:.05em}
.gm-highway-3d .speedo b{font-size:max(18px,3.6cqw)}
.gm-highway-3d .speedo span{opacity:1;font-size:max(9px,1.4cqw);letter-spacing:.04em}`,
    mount(root, api) {
      let cleanup = null;
      api.gl(...glSize(root, 720, 720)).then(v => { if (v && api.alive) { cleanup = highway(api, root, v, kit(v.THREE)); fitPR(api, v); } });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });

  const SP_TIMES = [
    { top: '#2a78e4', hor: '#d8ecff', bot: '#9cc3de', fog: '#cfe3f4', sun: '#fff3df', sunI: 2.5, hemi: .95, hemiSky: '#d8eaff', el: .8, az: .6, glow: 1 },
    { top: '#3a6cd0', hor: '#ffe1bb', bot: '#c7a98f', fog: '#f1dcc4', sun: '#ffd29a', sunI: 2.2, hemi: .8, hemiSky: '#ffe2c4', el: .3, az: -.5, glow: 1.4 },
    { top: '#4a7ad6', hor: '#ffd1c0', bot: '#b9a3b5', fog: '#efd6cf', sun: '#ffc6a0', sunI: 1.9, hemi: .75, hemiSky: '#ffd8cc', el: .17, az: .35, glow: 1.6 }
  ];

  function skyModels(THREE, K, scene) {
    const { std, lin, canvasTex } = K;
    const { acc, loft, foil, tint } = K.G;
    const cR = lin('#e63946'), cC = lin('#f7f3ea'), cD = lin('#2b2d42'), cN = lin('#1d3557'), cY = lin('#ffc83d'), cW = lin('#ffffff');
    const plane = new THREE.Group();
    plane.rotation.order = 'YXZ';
    const dark = std('#2b2d42', { roughness: .5, metalness: .3 });
    const bodyM = std('#ffffff', { roughness: .32, metalness: .2, vertexColors: true });
    const chromeM = std('#dfe3e8', { roughness: .2, metalness: 1 });
    const glassM = std('#a8dcff', { roughness: .05, metalness: .5, transparent: true, opacity: .62 });
    const skinM = std('#f0b98f', { roughness: .7 }), leatherM = std('#5b3a22', { roughness: .6 }), scarfM = std('#ffffff', { roughness: .8, side: THREE.DoubleSide });
    const add = (geo, mat, x, y, z, rx, ry, rz, sh) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0);
      if (sh !== false) m.castShadow = true;
      plane.add(m);
      return m;
    };
    const fusG = new THREE.LatheGeometry([[0, 2.8], [.08, 2.74], [.16, 2.4], [.26, 1.9], [.37, 1.2], [.46, .5], [.53, -.3], [.58, -1.0], [.62, -1.8], [.645, -2.4], [.63, -2.8], [.56, -2.93]].map(p => new THREE.Vector2(p[0], -p[1])), 28);
    fusG.rotateX(-Math.PI / 2);
    tint(fusG, (c, x, y, z) => {
      const r = Math.hypot(x, y) || 1, vy = y / r;
      if (z < -2.66) c.copy(cD);
      else if (z > 2.1) c.copy(cR);
      else if (z > -2.4 && vy < .02 + Math.max(0, (z - 1.2)) * .12) c.copy(cC);
      else c.copy(cR);
      c.multiplyScalar(.82 + .18 * Math.max(0, Math.min(1, vy * .5 + .55)));
    });
    const wingSecs = (sg, T, span) => T.map(t => {
      const cut = t > .88 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - .88) / .12, 2) * .92)) : 1;
      const base = 1.5 * (1 - .36 * t), chord = base * Math.max(.2, cut), zle = -1.45 + t * .22 + (base - chord) * .5;
      const s = foil(chord, .12 * (1 - .3 * t), 8, zle, 0, .02).map(([z, y]) => [sg * t * span, y - .14 + .26 * t, z]);
      return sg < 0 ? s.reverse() : s;
    });
    const WT = [0, .2, .45, .7, .84, .841, .88, .96, 1];
    const wingG = side => {
      const g = loft(wingSecs(side, WT, 3.95));
      tint(g, (c, x) => c.copy(Math.abs(x) > 3.32 ? cR : cC));
      return g;
    };
    const stabG = sg => {
      const g = loft([0, .3, .6, .85, .96, 1].map(t => {
        const ch = (.82 - .32 * t) * (t > .9 ? .5 : 1), s = foil(ch, .09, 6, 1.8 + t * .22, 0, 0).map(([z, y]) => [sg * t * 1.4, y + .12, z]);
        return sg < 0 ? s.reverse() : s;
      }));
      tint(g, (c, x, y, z) => c.copy(Math.abs(x) > 1.2 ? cR : cC));
      return g;
    };
    const finG = loft([0, .3, .6, .85, 1].map(h => {
      const ch = .95 - .45 * h * (h > .8 ? 1.2 : 1);
      return foil(Math.max(.25, ch), .1, 6, 1.9 + h * .38, 0, 0).map(([z, y]) => [y, .2 + h * .95, z]);
    }));
    tint(finG, (c, x, y) => c.copy(y > 1.0 ? cC : cR));
    const roundel = (x, s) => acc()
      .add(new THREE.CircleGeometry(.17, 20), x, .02, .9, 0, s * Math.PI / 2, 0, 1, 1, 1, cW)
      .add(new THREE.CircleGeometry(.12, 20), x + s * .003, .02, .9, 0, s * Math.PI / 2, 0, 1, 1, 1, cN)
      .add(new THREE.CircleGeometry(.06, 16), x + s * .006, .02, .9, 0, s * Math.PI / 2, 0, 1, 1, 1, cR);
    const bodyA = acc().add(fusG, 0, 0, 0).add(wingG(1), 0, 0, 0).add(wingG(-1), 0, 0, 0).add(stabG(1), 0, 0, 0).add(stabG(-1), 0, 0, 0).add(finG, 0, 0, 0);
    for (const s of [-1, 1]) {
      bodyA.add(new THREE.CircleGeometry(.17, 20), s * .434, .03, .98, 0, s * Math.PI / 2, 0, 1, 1, 1, cW);
      bodyA.add(new THREE.CircleGeometry(.12, 20), s * .437, .03, .98, 0, s * Math.PI / 2, 0, 1, 1, 1, cN);
      bodyA.add(new THREE.CircleGeometry(.06, 16), s * .44, .03, .98, 0, s * Math.PI / 2, 0, 1, 1, 1, cR);
      bodyA.add(new THREE.SphereGeometry(1, 10, 8), s * .93, -.74, -1.08, 0, 0, 0, .11, .3, .44, cR);
      bodyA.add(new THREE.CylinderGeometry(.06, .06, .16, 8), s * .93, -.9, -1.08, 0, 0, Math.PI / 2, 1, 1, 1, cC);
    }
    add(bodyA.build(), bodyM, 0, 0, 0);
    const darkA = acc();
    darkA.add(new THREE.CylinderGeometry(.5, .5, .06, 16), 0, 0, -2.93, Math.PI / 2, 0, 0);
    for (const s of [-1, 1]) {
      darkA.beam(s * .62, -.34, -1.0, s * .93, -.74, -1.08, .08, .06);
      darkA.beam(s * .45, -.3, -.7, s * .9, -.7, -1.0, .05, .05);
      darkA.add(new THREE.CylinderGeometry(.23, .23, .15, 14), s * .93, -.9, -1.08, 0, 0, Math.PI / 2);
      darkA.box(1.0, .014, .05, s * 2.5, .052, -.35);
      darkA.box(.7, .014, .05, s * .95, .14, 2.3);
    }
    darkA.beam(0, -.15, 2.45, 0, -.42, 2.62, .05, .05).add(new THREE.CylinderGeometry(.08, .08, .05, 8), 0, -.47, 2.62, 0, 0, Math.PI / 2);
    for (const z of [-.2, -.55, -.9]) {
      const sc = Math.sqrt(Math.max(0, 1 - Math.pow((z + .5) / .945, 2)));
      darkA.add(new THREE.TorusGeometry(1, .022, 4, 14, Math.PI), 0, .38, z, 0, 0, 0, .45 * sc, .405 * sc, 1);
    }
    darkA.box(.03, .03, 1.0, 0, .78, -.5);
    add(darkA.build(), dark, 0, 0, 0, 0, 0, 0, false);
    const chromeA = acc();
    for (const s of [-1, 1]) {
      chromeA.add(new THREE.CylinderGeometry(.045, .045, .55, 8), s * .5, -.2, -2.2, Math.PI / 2, .15 * s, 0);
      chromeA.add(new THREE.CylinderGeometry(.07, .07, .04, 10), s * .93, -.9, -1.08, 0, 0, Math.PI / 2);
    }
    chromeA.add(new THREE.CylinderGeometry(.012, .012, .5, 5), 0, .62, 1.2, 0, 0, 0);
    add(chromeA.build(), chromeM, 0, 0, 0, 0, 0, 0, false);
    const canopy = add(new THREE.SphereGeometry(.45, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glassM, 0, .38, -.5, 0, 0, 0, false);
    canopy.scale.set(1, .9, 2.1);
    const pilot = acc();
    pilot.add(new THREE.SphereGeometry(.16, 12, 10), 0, .52, -.42, 0, 0, 0, 1, 1.05, 1, lin('#f0b98f'));
    pilot.add(new THREE.SphereGeometry(.175, 12, 10, 0, Math.PI * 2, 0, Math.PI * .58), 0, .54, -.4, 0, 0, 0, 1, 1, 1.05, lin('#5b3a22'));
    pilot.box(.31, .075, .09, 0, .55, -.54, lin('#2b2d42')); pilot.add(new THREE.CylinderGeometry(.045, .045, .03, 8), -.07, .55, -.585, Math.PI / 2, 0, 0, 1, 1, 1, lin('#9fd8ff')); pilot.add(new THREE.CylinderGeometry(.045, .045, .03, 8), .07, .55, -.585, Math.PI / 2, 0, 0, 1, 1, 1, lin('#9fd8ff'));
    pilot.box(.34, .22, .22, 0, .3, -.38, lin('#2b2d42'));
    add(pilot.build(), std('#ffffff', { roughness: .65, vertexColors: true }), 0, 0, 0, 0, 0, 0, false);
    const scarf = add(new THREE.PlaneGeometry(.12, .62), scarfM, 0, .46, -.12, Math.PI / 2, 0, 0, false);
    scarf.geometry.translate(0, .31, 0);
    scarf.position.z = -.3;
    const prop = new THREE.Group();
    prop.position.set(0, 0, -2.98);
    const propA = acc();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-.1, 0); bladeShape.lineTo(.1, 0); bladeShape.lineTo(.07, 1.45); bladeShape.lineTo(-.07, 1.45); bladeShape.closePath();
    const bladeG = new THREE.ExtrudeGeometry(bladeShape, { depth: .04, bevelEnabled: false });
    bladeG.translate(0, 0, -.02);
    propA.add(bladeG, 0, 0, 0, 0, .35, 0, 1, 1, 1, cN).add(bladeG, 0, 0, 0, 0, .35, Math.PI, 1, 1, 1, cN);
    propA.box(.15, .3, .042, 0, 1.3, 0, cY, 0, .35, 0).box(.15, .3, .042, 0, -1.3, 0, cY, 0, .35, Math.PI);
    const spin = new THREE.LatheGeometry([[0, .45], [.1, .4], [.2, .26], [.27, .08], [.28, 0]].map(p => new THREE.Vector2(p[0], p[1])), 16);
    spin.rotateX(-Math.PI / 2);
    propA.add(spin, 0, 0, -.02, 0, 0, 0, 1, 1, 1, cR);
    const propMesh = new THREE.Mesh(propA.build(), std('#ffffff', { roughness: .4, metalness: .3, vertexColors: true, side: THREE.DoubleSide }));
    propMesh.castShadow = true;
    prop.add(propMesh);
    plane.add(prop);
    const blur = new THREE.Mesh(new THREE.CircleGeometry(1.45, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide }));
    blur.position.set(0, 0, -3.0);
    plane.add(blur);
    const navL = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b3b })), navR = new THREE.Mesh(navL.geometry, new THREE.MeshBasicMaterial({ color: 0x3bff6b }));
    navL.position.set(-3.95, .12, -1.0); navR.position.set(3.95, .12, -1.0);
    plane.add(navL, navR);
    scene.add(plane);

    const ringGeo = new THREE.TorusGeometry(6, .5, 12, 48);
    const ringMat = std('#ffc83d', { emissive: '#ffae00', emissiveIntensity: .35, metalness: .55, roughness: .3 });
    const ringHot = std('#ffe56b', { emissive: '#ffd23d', emissiveIntensity: 1.1, metalness: .4, roughness: .25 });
    const stripeA = acc();
    for (let i = 0; i < 8; i++) stripeA.add(new THREE.TorusGeometry(6, .56, 8, 6, Math.PI / 9), 0, 0, 0, 0, 0, i * Math.PI / 4 + .1);
    const stripeG = stripeA.build();
    const stripeM = std('#e63946', { roughness: .4, metalness: .3, emissive: '#7a0d18', emissiveIntensity: .35 });
    const haloG = new THREE.TorusGeometry(6, .9, 6, 40), haloM = new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const ringPool = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(ringGeo, ringMat);
      m.castShadow = true; m.visible = false;
      m.add(new THREE.Mesh(stripeG, stripeM), new THREE.Mesh(haloG, haloM));
      scene.add(m); ringPool.push({ m, on: false, x: 0, y: 0, z: 0, done: 0, t: 0 });
    }
    const balloons = [];
    const envL = [[1.35, -6.2], [2.1, -5.8], [3.2, -5.0], [4.2, -3.6], [4.8, -1.8], [4.93, -1.2], [5, 0], [4.8, 1.8], [4.2, 3.6], [3.2, 4.9], [2.0, 5.7], [.9, 6.1], [0, 6.25]].map(p => new THREE.Vector2(p[0], p[1]));
    const envG0 = new THREE.LatheGeometry(envL, 36);
    const skirtG = new THREE.CylinderGeometry(1.5, .9, 1.6, 14, 1, true);
    const wickerT = canvasTex(64, 64, (g) => {
      g.fillStyle = '#a8763f'; g.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) {
        g.fillStyle = (x + y) % 16 ? '#8a5c2e' : '#c18f55'; g.fillRect(x + 1, y + 1, 7, 7);
      }
    });
    wickerT.wrapS = wickerT.wrapT = THREE.RepeatWrapping; wickerT.repeat.set(3, 2);
    const wicker = std('#ffffff', { roughness: .9, map: wickerT });
    const trimA = acc();
    trimA.box(1.8, .14, 1.8, 0, -8.82, 0, lin('#6b4423')).box(1.7, .1, 1.7, 0, -10.0, 0, lin('#6b4423'));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      trimA.box(.1, 1.2, .1, sx * .82, -9.4, sz * .82, lin('#6b4423'));
      trimA.beam(sx * .8, -8.8, sz * .8, sx * .6, -6.9, sz * .6, .05, .05, lin('#3b2a1c'));
      trimA.add(new THREE.SphereGeometry(.13, 6, 5), sx * .98, -9.9, sz * .3, 0, 0, 0, 1, 1.3, .8, lin('#d9c9a8'));
    }
    trimA.add(new THREE.CylinderGeometry(.22, .22, .5, 8), 0, -7.1, 0, 0, 0, 0, 1, 1, 1, lin('#454952'));
    trimA.box(.06, 1.8, .06, .45, -7.6, 0, lin('#454952')).box(.06, 1.8, .06, -.45, -7.6, 0, lin('#454952'));
    const trimG = trimA.build();
    const trimM = std('#ffffff', { roughness: .8, vertexColors: true });
    const flameG = new THREE.ConeGeometry(.3, 1.3, 8).translate(0, .65, 0).rotateX(Math.PI);
    const flameM = new THREE.MeshBasicMaterial({ color: 0xffa23a, transparent: true, opacity: .9, depthWrite: false, fog: false });
    const BCOL = [['#ff595e', '#ffca3a'], ['#1982c4', '#f1faee'], ['#8ac926', '#ffffff'], ['#6a4c93', '#ffca3a'], ['#ff924c', '#ffffff'], ['#e63946', '#1d3557']];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group(), geo = envG0.toNonIndexed(), gp = geo.attributes.position, gc = new Float32Array(gp.count * 3), cc = new THREE.Color();
      const [a, b] = BCOL[i].map(lin), band = new THREE.Color(i % 2 ? '#2b2d42' : '#ffffff').convertSRGBToLinear();
      for (let t = 0; t < gp.count; t += 3) {
        const mx = (gp.getX(t) + gp.getX(t + 1) + gp.getX(t + 2)) / 3, my = (gp.getY(t) + gp.getY(t + 1) + gp.getY(t + 2)) / 3, mz = (gp.getZ(t) + gp.getZ(t + 1) + gp.getZ(t + 2)) / 3;
        cc.copy(Math.floor((Math.atan2(mz, mx) + Math.PI) / (Math.PI * 2) * 12) % 2 ? a : b);
        if (my > -1.75 && my < -1.25) cc.copy(band);
        if (my < -5.7) cc.copy(a);
        cc.multiplyScalar(.78 + .22 * Math.max(0, Math.min(1, (my + 6) / 8)));
        for (let k = 0; k < 3; k++) { gc[(t + k) * 3] = cc.r; gc[(t + k) * 3 + 1] = cc.g; gc[(t + k) * 3 + 2] = cc.b; }
      }
      geo.setAttribute('color', new THREE.BufferAttribute(gc, 3));
      const env = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .55 }));
      env.scale.set(1, 1, 1); env.castShadow = true;
      const skirt = new THREE.Mesh(skirtG, std(BCOL[i][0], { roughness: .6, side: THREE.DoubleSide }));
      skirt.position.y = -6.1;
      const basket = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), wicker);
      basket.position.y = -9.4; basket.castShadow = true;
      const trim = new THREE.Mesh(trimG, trimM);
      const flame = new THREE.Mesh(flameG, flameM);
      flame.position.y = -6.9;
      g.add(env, skirt, basket, trim, flame);
      g.visible = false;
      scene.add(g);
      balloons.push({ g, flame, on: false, x: 0, y: 0, z: 0, ph: rnd(0, 6) });
    }
    envG0.dispose();
    const cloudGeo = new THREE.IcosahedronGeometry(1, 1);
    const cloudMat = std('#ffffff', { roughness: 1, flatShading: true, emissive: '#dfe7f2', emissiveIntensity: .22, envMapIntensity: .5, vertexColors: true });
    const clouds = [];
    const cTop = lin('#ffffff'), cBot = lin('#cfdbec');
    for (let i = 0; i < 18; i++) {
      const A = acc();
      const n = 4 + (i % 3);
      for (let k = 0; k < n; k++) {
        const r = rnd(5, 10) * (k === 0 ? 1.4 : 1);
        A.add(cloudGeo, (k - n / 2) * rnd(5, 8), rnd(-1, 3) * (k === 0 ? 0 : 1), rnd(-5, 5), 0, 0, 0, r * 1.3, r * .8, r);
      }
      const geo = A.build();
      tint(geo, (c, x, y) => c.copy(cBot).lerp(cTop, Math.max(0, Math.min(1, (y + 6) / 11))));
      const c = new THREE.Mesh(geo, cloudMat);
      scene.add(c); clouds.push(c);
    }
    return { plane, prop, blur, scarf, ringPool, ringMat, ringHot, balloons, clouds };
  }

  function skyPilot(api, root, v, K) {
    const { THREE, renderer, canvas } = v;
    const { std, lin } = K;
    const U = ui(root, canvas);
    const keys = api.keys, held = new Set();
    const CH = 160, SEG = 32, CEIL = 165;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, v.w / v.h, .5, 1200);
    scene.fog = new THREE.Fog(0xffffff, 140, 560);
    const sky = K.sky(900); scene.add(sky.mesh);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    hemi.groundColor = lin('#5d6b4a');
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(COARSE ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 420 });
    sun.shadow.bias = -.0005; sun.shadow.normalBias = .05;
    scene.add(sun, sun.target);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(sky.mesh.geometry, sky.mesh.material));
    let envRT = null;


    let ox = 0, oz = 0, lastCx = null, lastCz = null;
    const height = (x, z) => {
      const X = x + ox, Z = z + oz;
      let h = (fbm(X * .0032, Z * .0032, 4) - .47) * 250;
      if (h > 0) h += Math.pow(fbm(X * .009 + 31.7, Z * .009 - 12.3, 3), 3) * 150 * Math.min(1, h / 25);
      return h;
    };
    const cSea = lin('#cdb98a'), cSand = lin('#ead7a2'), cG1 = lin('#8cc85c'), cG2 = lin('#4b9a3d'), cG3 = lin('#b5c25a'), cF = lin('#3a7634'), cR = lin('#8a8077'), cR2 = lin('#a59d95'), cSnow = lin('#f6f8fb'), cShal = lin('#e9dcae'), tc = new THREE.Color();
    function colorAt(h, j, n) {
      if (h < -1.5) tc.copy(cSea).multiplyScalar(.9 + Math.max(-1, h / 40) * .25);
      else if (h < 2.4) tc.copy(h < .6 ? cShal : cSand);
      else if (h < 30) tc.copy(cG1).lerp(cG2, h / 30).lerp(cG3, clamp(n * 1.5 - .5, 0, .55));
      else if (h < 55) tc.copy(cF).lerp(cR, (h - 30) / 25 * (.7 + n * .6));
      else if (h < 84 + n * 12) tc.copy(cR).lerp(cR2, clamp((h - 55) / 33, 0, 1)).multiplyScalar(.93 + .07 * Math.sin(h * .8 + n * 7));
      else tc.copy(cSnow);
      return tc.multiplyScalar(.9 + j * .18);
    }
    const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95, envMapIntensity: .2 });
    const baseGeo = new THREE.PlaneGeometry(CH, CH, SEG, SEG);
    baseGeo.rotateX(-Math.PI / 2);
    const treeG = K.G.acc()
      .add(new THREE.CylinderGeometry(.35, .5, 2, 5), 0, 1, 0, 0, 0, 0, 1, 1, 1, lin('#6b4a2e'))
      .add(new THREE.ConeGeometry(2.4, 4.5, 6), 0, 3.8, 0, 0, 0, 0, 1, 1, 1, lin('#2f7a3a'))
      .add(new THREE.ConeGeometry(1.8, 3.6, 6), 0, 5.8, 0, 0, .5, 0, 1, 1, 1, lin('#3d9147'))
      .add(new THREE.ConeGeometry(1.1, 2.8, 6), 0, 7.6, 0, 0, 1, 0, 1, 1, 1, lin('#55ab58')).build();
    const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .9, envMapIntensity: .3 });
    const treeD = new THREE.Object3D(), treeC = new THREE.Color();
    const chunks = [];
    for (let i = 0; i < 25; i++) {
      const geo = baseGeo.clone();
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
      const m = new THREE.Mesh(geo, terrainMat);
      m.receiveShadow = true; m.userData.key = '';
      const tr = new THREE.InstancedMesh(treeG, treeMat, 90);
      tr.setColorAt(0, treeC.setScalar(1)); tr.frustumCulled = false; tr.count = 0; m.add(tr); m.userData.trees = tr;
      scene.add(m); chunks.push(m);
    }
    baseGeo.dispose();
    function buildChunk(m, cx, cz) {
      m.userData.key = cx + ',' + cz;
      m.position.set(cx * CH, 0, cz * CH);
      const pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
      for (let i = 0; i < pos.count; i++) {
        const wx = pos.getX(i) + cx * CH, wz = pos.getZ(i) + cz * CH, h = height(wx, wz);
        pos.setY(i, h);
        const c = colorAt(h, hash2(Math.round(wx * 3.1), Math.round(wz * 2.7)), vnoise(wx * .05 + 3.3, wz * .05 - 1.1));
        col.setXYZ(i, c.r, c.g, c.b);
      }
      pos.needsUpdate = true; col.needsUpdate = true;
      m.geometry.computeBoundingSphere();
      const tr = m.userData.trees;
      let k = 0;
      for (let i = 0; i < 110 && k < 90; i++) {
        const lx = (hash2(cx * 977 + i * 13, cz * 571 + 7) - .5) * CH, lz = (hash2(cx * 313 + 5, cz * 419 + i * 17) - .5) * CH, wx = lx + cx * CH, wz = lz + cz * CH, h = height(wx, wz);
        if (h < 3.4 || h > 50 || fbm(wx * .011 + 40, wz * .011 + 9, 2) < .5) continue;
        treeD.position.set(lx, h - .4, lz); treeD.rotation.set(0, i, 0); treeD.scale.setScalar(1 + hash2(i * 31 + cx, cz + i) * 1.1);
        treeD.updateMatrix(); tr.setMatrixAt(k, treeD.matrix);
        tr.setColorAt(k++, treeC.setScalar(.8 + hash2(i + 5, cx * 3 + cz) * .35));
      }
      tr.count = k; tr.instanceMatrix.needsUpdate = true;
      if (tr.instanceColor) tr.instanceColor.needsUpdate = true;
    }
    function updateChunks(px, pz, force) {
      const pcx = Math.round(px / CH), pcz = Math.round(pz / CH);
      if (!force && pcx === lastCx && pcz === lastCz) return;
      lastCx = pcx; lastCz = pcz;
      const need = new Set(), free = [];
      for (let dx = -2; dx <= 2; dx++) for (let dz = -3; dz <= 1; dz++) need.add((pcx + dx) + ',' + (pcz + dz));
      for (const m of chunks) { if (!force && need.has(m.userData.key)) need.delete(m.userData.key); else free.push(m); }
      for (const key of need) { const [a, b] = key.split(',').map(Number); buildChunk(free.pop(), a, b); }
    }
    const waterT = K.canvasTex(256, 256, g => {
      g.fillStyle = '#e6f2fb'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 320; i++) {
        const x = Math.random() * 256, y = Math.random() * 256, l = rnd(6, 26), hi = Math.random() < .45;
        g.strokeStyle = hi ? 'rgba(255,255,255,.7)' : 'rgba(90,150,200,.32)'; g.lineWidth = hi ? 1.6 : 2.4;
        for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + l / 2, y + dy - 2, x + dx + l, y + dy); g.stroke(); }
      }
    });
    waterT.wrapS = waterT.wrapT = THREE.RepeatWrapping; waterT.repeat.set(40, 40); waterT.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const water = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), std('#2690c4', { map: waterT, roughness: .16, metalness: .1, transparent: true, opacity: .88, envMapIntensity: .4 }));
    water.rotation.x = -Math.PI / 2; water.receiveShadow = true;
    scene.add(water);


    const { plane, prop, blur, scarf, ringPool, ringMat, ringHot, balloons, clouds } = skyModels(THREE, K, scene);
    const burst = K.burst(scene, 90, .45);
    const ringBoost = std('#59c8ff', { emissive: '#1f8fff', emissiveIntensity: 1.0, metalness: .4, roughness: .25 });
    const ringMove = std('#c77dff', { emissive: '#9d4edd', emissiveIntensity: .9, metalness: .4, roughness: .25 });
    const coinG = new THREE.CylinderGeometry(1.15, 1.15, .26, 20); coinG.rotateX(Math.PI / 2);
    const coinM = std('#ffd23d', { emissive: '#c98a00', emissiveIntensity: .55, metalness: .8, roughness: .25 });
    const coinStar = K.G.acc();
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; coinStar.box(.18, .62, .06, Math.sin(a) * .3, Math.cos(a) * .3, .14, null, 0, 0, -a); coinStar.box(.18, .62, .06, Math.sin(a) * .3, Math.cos(a) * .3, -.14, null, 0, 0, -a); }
    const coinStarG = coinStar.build(), coinStarM = std('#fff3b0', { emissive: '#ffcc33', emissiveIntensity: .4, metalness: .6, roughness: .3 });
    const coins = [];
    for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(coinG, coinM); m.add(new THREE.Mesh(coinStarG, coinStarM)); m.visible = false; scene.add(m); coins.push({ m, on: false, x: 0, y: 0, z: 0 }); }
    const canG = K.G.acc().box(1.6, 2.1, .8, 0, 0, 0).box(.5, .35, .25, .45, 1.2, 0, lin('#2b2d42')).box(.9, .16, .2, -.25, 1.15, 0, lin('#2b2d42')).box(1.3, .1, .84, 0, .4, 0, lin('#ffd23d')).build();
    const canM = std('#ffffff', { vertexColors: true, roughness: .4, metalness: .3, emissive: '#5a0a10', emissiveIntensity: .4 });
    const cans = [];
    const canHalo = new THREE.MeshBasicMaterial({ color: 0xff7a6b, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(canG, canM); const hl = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 10), canHalo); m.add(hl); m.visible = false; scene.add(m); cans.push({ m, on: false, x: 0, y: 0, z: 0 }); }
    const UPS = [
      { k: 'eng', name: 'Engine', desc: l => `+${l * 7}% cruise and boost speed`, cost: [60, 150, 300, 550, 900] },
      { k: 'tank', name: 'Fuel tank', desc: l => `+${l * 25}% flight time per tank`, cost: [60, 150, 300, 550, 900] },
      { k: 'hand', name: 'Handling', desc: l => `+${l * 15}% turn and climb response`, cost: [50, 130, 260, 480, 800] },
      { k: 'arm', name: 'Armour', desc: l => l ? `Survive ${l} crash${l > 1 ? 'es' : ''} per flight` : 'Survive crashes per flight', cost: [150, 400, 900] }
    ];
    const SV = Object.assign({ coins: 0, eng: 0, tank: 0, hand: 0, arm: 0 }, api.load() || {});
    const persist = () => api.save(SV);
    const lvl = k => SV[k] || 0;


    const left = U.row('left:max(10px,1.6cqw);top:max(10px,1.6cqw)');
    const hFuel = U.chip(left, 'Fuel'), hAlt = U.chip(left, 'Altitude');
    hFuel.innerHTML = '<i class="bar"><i></i></i>';
    const fuelBar = hFuel.firstChild.firstChild;
    const right = U.row('right:max(10px,1.6cqw);top:max(10px,1.6cqw);flex-direction:row-reverse');
    const hScore = U.chip(right, 'Score'), hRings = U.chip(right, 'Rings'), hCoins = U.chip(right, 'Coins'), hMult = U.chip(right, 'Chain');
    const hArm = U.chip(left, 'Armour');
    hMult.parentNode.style.background = 'rgba(108,92,231,.8)';
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.innerHTML = ARROW('M9 5l7 7-7 7');
    U.hud.append(arrow);
    U.pad('r', [['BO', '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>', 'Boost']], held);

    const aim = { on: false, x: 0, y: 0, touch: false };
    const setAim = e => { const p = v.toLocal(e); aim.x = p.nx; aim.y = p.ny; aim.on = true; aim.touch = e.pointerType !== 'mouse'; };
    canvas.addEventListener('pointerdown', e => { setAim(e); if (aim.touch) try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
    canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons || aim.touch) setAim(e); });
    canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') aim.on = false; });
    const lift = e => { if (e.pointerType !== 'mouse') aim.on = false; };
    api.on(window, 'pointerup', lift);
    api.on(window, 'pointercancel', lift);

    const pos = new THREE.Vector3(), fw = new THREE.Vector3(), camT = new THREE.Vector3(), look = new THREE.Vector3(), lookT = new THREE.Vector3(), sd = new THREE.Vector3(), tmp = new THREE.Vector3();
    let S = null, mode = 'ready', last = null, clock = 0, ts = 1, preset = SP_TIMES[0];
    const rings = [];
    const score = () => S.pts + Math.floor(S.dist);
    const diff = () => 1 - Math.exp(-S.dist / 4500);

    function applySky() {
      const p = makePreset(lin, preset), u = sky.u;
      u.top.value.copy(p.top); u.hor.value.copy(p.hor); u.bot.value.copy(p.bot); u.sunCol.value.copy(p.sun); u.sunAmt.value = p.glow;
      sd.set(Math.sin(p.az) * Math.cos(p.el), Math.sin(p.el), -Math.cos(p.az) * Math.cos(p.el));
      u.sunDir.value.copy(sd);
      scene.fog.color.copy(p.fog);
      sun.color.copy(p.sun); sun.intensity = p.sunI;
      hemi.color.copy(p.hemiSky); hemi.intensity = p.hemi;
      const rt = pmrem.fromScene(envScene, 0, .1, 1000);
      if (envRT) envRT.dispose();
      envRT = rt; scene.environment = rt.texture;
    }

    function placeBalloon(a, b, inPath) {
      const B = balloons.find(o => !o.on);
      if (!B) return;
      const t = rnd(.35, .65), side = Math.random() < .5 ? -1 : 1;
      B.x = lerp(a.x, b.x, t) + (inPath ? rnd(-2, 2) : side * rnd(11, 18));
      B.z = lerp(a.z, b.z, t);
      B.y = Math.max(lerp(a.y, b.y, t) + rnd(-3, 5), height(B.x, B.z) + 16);
      B.on = true; B.g.visible = true;
    }

    function addRing() {
      const R = ringPool.find(r => !r.on);
      if (!R) return false;
      const k = diff(), z = last.z - rnd(95, 130), x = last.x + rnd(-1, 1) * (14 + 22 * k);
      let hm = -99;
      for (let i = 1; i <= 5; i++) {
        const t = i / 5, px = lerp(last.x, x, t), pz = lerp(last.z, z, t);
        hm = Math.max(hm, height(px, pz), height(px + 7, pz), height(px - 7, pz));
      }
      const y = clamp(Math.max(clamp(last.y + rnd(-15, 15), 26, 95), hm + 17), 26, CEIL - 20);
      const n = S ? S.made = (S.made || 0) + 1 : 0, r = Math.random();
      const kind = n > 3 && r < .14 ? 'boost' : n > 5 && r < .14 + .18 + k * .2 ? 'move' : 'gold';
      Object.assign(R, { on: true, x, y, z, x0: x, done: 0, t: 0, kind, amp: kind === 'move' ? rnd(5, 8) : 0, ph: rnd(0, 6), mat: kind === 'boost' ? ringBoost : kind === 'move' ? ringMove : ringMat });
      R.m.position.set(x, y, z); R.m.scale.setScalar(1); R.m.visible = true; R.m.material = R.mat;
      rings.push(R);
      if (rings.length > 1 && Math.random() < .55) {
        const nC = 5 + Math.floor(Math.random() * 3), arc = Math.random() < .5 ? rnd(-6, 6) : 0;
        for (let i = 0; i < nC; i++) {
          const C = coins.find(c => !c.on);
          if (!C) break;
          const t = .22 + i / (nC - 1) * .56;
          C.x = lerp(last.x, x, t) + Math.sin(t * Math.PI) * arc; C.y = lerp(last.y, y, t) + Math.sin(t * Math.PI) * Math.abs(arc) * .6; C.z = lerp(last.z, z, t);
          C.y = Math.max(C.y, height(C.x, C.z) + 8);
          C.on = true; C.m.visible = true; C.m.position.set(C.x, C.y, C.z);
        }
      } else if (rings.length > 2 && Math.random() < .2) {
        const C = cans.find(c => !c.on);
        if (C) {
          const t = rnd(.4, .6), sd2 = Math.random() < .5 ? -1 : 1;
          C.x = lerp(last.x, x, t) + sd2 * rnd(6, 11); C.z = lerp(last.z, z, t); C.y = Math.max(lerp(last.y, y, t) + rnd(-4, 4), height(C.x, C.z) + 10);
          C.on = true; C.m.visible = true; C.m.position.set(C.x, C.y, C.z);
        }
      }
      if (rings.length > 2 && Math.random() < .22 + .4 * k) placeBalloon(last, R, k > .35 && Math.random() < .3);
      last = { x, y, z };
      return true;
    }

    function placeCloud(c, ahead) {
      const low = Math.random() < .22;
      c.position.set(pos.x + rnd(-480, 480), low ? rnd(55, 80) : rnd(100, 150), pos.z - (ahead ? rnd(350, 750) : rnd(-150, 700)));
      c.rotation.y = rnd(0, 6);
      c.scale.setScalar(rnd(.8, 1.6));
    }

    function reset(play) {
      for (let tries = 0; tries < 40; tries++) {
        ox = rnd(-9e4, 9e4); oz = rnd(-9e4, 9e4);
        let ok = true;
        for (let z = 0; z > -420 && ok; z -= 20) for (const x of [-24, 0, 24]) if (height(x, z) > 30) { ok = false; break; }
        if (ok) break;
      }
      preset = play ? pick(SP_TIMES) : SP_TIMES[0];
      applySky();
      S = { made: 0, coins: 0, arm: lvl('arm'), inv: 0, boostT: 0, yaw: 0, pitch: 0, roll: 0, sx: 0, sy: 0, speed: 30, fuel: 100, dist: 0, pts: 0, rings: 0, chain: 0, mult: 1, tick: 0, crashT: 0, why: '', spin: 0, low: false, shown: '' };
      pos.set(0, 55, 0);
      for (const R of ringPool) { R.on = false; R.m.visible = false; }
      rings.length = 0;
      for (const B of balloons) { B.on = false; B.g.visible = false; }
      for (const C of coins.concat(cans)) { C.on = false; C.m.visible = false; }
      last = { x: 0, y: 55, z: -20 };
      while (rings.length < 7) addRing();
      plane.visible = true;
      plane.position.copy(pos);
      plane.rotation.set(0, 0, 0);
      updateChunks(pos.x, pos.z, true);
      for (const c of clouds) placeCloud(c, false);
      camera.position.set(0, 60, 14);
      look.set(0, 55, -12);
      camera.fov = 62; camera.updateProjectionMatrix();
    }

    function start() {
      reset(true);
      mode = 'run'; ts = 1;
      api.score(0);
    }

    function crash(why, B) {
      if (mode !== 'run') return;
      if (S.inv > 0) return;
      if (S.arm > 0) {
        S.arm--; S.inv = 1.8;
        if (B) { B.on = false; B.g.visible = false; }
        else { pos.y = Math.max(height(pos.x, pos.z), 0) + 6; S.pitch = .45; }
        burst.fire(pos, 30, 12, ['#cfd4da', '#ffd166', '#8d99ae', '#ffffff'], .6);
        U.pop('Armour saved you! ' + S.arm + ' left', 'bad');
        api.sfx('hit');
        return;
      }
      mode = 'crash'; S.crashT = 0; S.why = S.fuel <= 0 ? 'Out of fuel' : why; ts = .3;
      burst.fire(pos, 60, 16, why === 'Splashdown' ? ['#ffffff', '#cfefff', '#7fc8f8', '#e63946'] : ['#ff9f1c', '#ffd166', '#e63946', '#2b2d42', '#f7f3ea'], .8);
      plane.visible = false;
      api.sfx('hit');
      api.score(score());
    }

    function finish() {
      mode = 'over';
      const t = score(), nb = api.submit(t);
      api.score(t);
      SV.coins += S.coins; persist();
      api.overlay({
        kicker: nb ? 'New best!' : S.why,
        title: 'Game over',
        text: S.fuel <= 0 ? 'Out of fuel. Fly through more rings to keep the tank topped up.' : 'Rings refuel the plane, and chaining them raises your multiplier.',
        stats: [['Score', t.toLocaleString()], ['Rings', S.rings], ['Coins', '+' + S.coins], ['Best', api.best != null ? api.best.toLocaleString() : '—']],
        button: 'Play again', onAction: start, secondary: 'Hangar', onSecondary: hangar
      });
    }

    function hangar() {
      const pips = (l, m) => Array.from({ length: m }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('');
      const rows = UPS.map(u => {
        const l = lvl(u.k), max = u.cost.length, c = u.cost[l];
        const btn = l >= max ? '<span class="sp-max">MAX</span>' : `<button type="button" class="sp-buy" data-up="${u.k}" ${SV.coins < c ? 'disabled' : ''}>${c} <b>●</b></button>`;
        return `<div class="sp-row"><div class="sp-n"><b>${u.name}</b><small>${u.desc(Math.max(1, l + (l < max ? 1 : 0)))}${l < max ? ' (next)' : ''}</small><span class="sp-pips">${pips(l, max)}</span></div>${btn}</div>`;
      }).join('');
      api.overlay({
        kicker: 'Upgrades', title: 'Hangar',
        text: `<span class="sp-hg"><span class="sp-bank">● ${SV.coins.toLocaleString()} coins</span>Collect coins in flight and spend them here. Upgrades are saved.${rows}</span>`,
        button: 'Fly', onAction: start, secondary: 'Back', onSecondary: menu
      });
    }
    api.on(window, 'click', e => {
      const b = e.target.closest && e.target.closest('.sp-buy');
      if (!b || b.disabled) return;
      const u = UPS.find(x => x.k === b.dataset.up), l = lvl(u.k), c = u.cost[l];
      if (c == null || SV.coins < c) return;
      SV.coins -= c; SV[u.k] = l + 1; persist();
      api.sfx('good');
      hangar();
    });
    function menu() {
      api.overlay({
        kicker: '3D', title: 'Sky Pilot',
        text: 'Fly through rings for points and fuel, and chain them to raise your multiplier. Blue rings give a free speed boost, purple rings drift sideways, red cans refuel you, and coins buy upgrades in the hangar. Steer clear of mountains, the sea and hot-air balloons.',
        stats: [['Coins', SV.coins.toLocaleString()], ['Engine', 'Lv ' + lvl('eng')], ['Tank', 'Lv ' + lvl('tank')], ['Armour', 'Lv ' + lvl('arm')]],
        button: 'Play', onAction: start, secondary: 'Hangar', onSecondary: hangar
      });
    }

    function ringCheck(z0) {
      for (const R of rings) {
        if (R.done || R.z > z0 || R.z < pos.z) continue;
        const t = (z0 - R.z) / Math.max(1e-4, z0 - pos.z);
        const cx = lerp(tmp.x, pos.x, t), cy = lerp(tmp.y, pos.y, t);
        if (Math.hypot(cx - R.x, cy - R.y) < 5.6) {
          R.done = 1;
          S.rings++; S.chain++;
          S.mult = Math.min(5, 1 + Math.floor(S.chain / 3));
          const add = (R.kind === 'move' ? 200 : R.kind === 'boost' ? 150 : 100) * S.mult;
          S.pts += add; S.coins += R.kind === 'gold' ? 1 : 3;
          S.fuel = Math.min(100, S.fuel + 13);
          if (R.kind === 'boost') S.boostT = 2.6;
          U.pop((R.kind === 'boost' ? 'Boost! ' : '') + '+' + add + (S.mult > 1 ? '  x' + S.mult : ''));
          burst.fire(lookT.set(R.x, R.y, R.z), 26, 9, ['#ffd23d', '#fff3b0', '#ffae00'], 0);
          api.sfx(S.mult > 1 ? 'good' : 'pop');
        } else {
          R.done = 2;
          if (S.chain >= 3) U.pop('Chain lost', 'bad');
          S.chain = 0; S.mult = 1;
          api.sfx('tick');
        }
      }
    }

    function fly(dt) {
      const k = diff();
      const kx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
      const ky = (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0);
      let ix = kx, iy = ky;
      if (!kx && !ky && aim.on) {
        const dz = (a, d) => Math.abs(a) < d ? 0 : a - Math.sign(a) * d;
        ix = clamp(dz(aim.x, .05) * 1.7, -1, 1);
        iy = clamp(dz(aim.y + .12, .05) * 1.9, -1, 1);
      }
      const engine = S.fuel > 0;
      S.boostT = Math.max(0, S.boostT - dt); S.inv = Math.max(0, S.inv - dt);
      const free = S.boostT > 0;
      const boost = engine && (free || (S.fuel > 3 && (keys.has('Space') || held.has('BO'))));
      if (!engine) { ix *= .5; iy = Math.min(iy, -.6); }
      if (pos.y > CEIL - 15) iy = Math.min(iy, -(pos.y - CEIL + 15) / 15);
      const hk = 1 + lvl('hand') * .15, ek = 1 + lvl('eng') * .07;
      S.sx = damp(S.sx, ix, 5 * hk, dt); S.sy = damp(S.sy, iy, 5 * hk, dt);
      S.yaw = clamp(S.yaw - S.sx * 1.0 * hk * dt, -1.1, 1.1);
      S.pitch = damp(S.pitch, S.sy * .5, 3.2 * hk, dt);
      S.roll = damp(S.roll, -S.sx * .85, 4 * hk, dt);
      S.speed = damp(S.speed, (boost ? 48 * ek + (free ? 6 : 0) : engine ? (30 + k * 6) * ek : 20) - S.pitch * 9, boost ? 2.2 : 1.1, dt);
      S.fuel = Math.max(0, S.fuel - (3 + 2.4 * k + (boost && !free ? 10 : 0)) * dt / (1 + lvl('tank') * .25));
      S.boost = boost;
      for (const C of coins) {
        if (!C.on) continue;
        if (Math.abs(C.z - pos.z) < 3.4 && Math.hypot(C.x - pos.x, C.y - pos.y) < 3.6) { C.on = false; C.m.visible = false; S.coins++; S.pts += 10; api.sfx('tick'); burst.fire(lookT.set(C.x, C.y, C.z), 6, 5, ['#ffd23d', '#fff3b0'], 0); }
      }
      for (const C of cans) {
        if (!C.on) continue;
        if (Math.abs(C.z - pos.z) < 3.6 && Math.hypot(C.x - pos.x, C.y - pos.y) < 4) { C.on = false; C.m.visible = false; S.fuel = Math.min(100, S.fuel + 30); U.pop('Fuel +30%', 'sm'); api.sfx('good'); }
      }
      tmp.copy(pos);
      fw.set(-Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch));
      pos.addScaledVector(fw, S.speed * dt);
      S.dist = Math.max(S.dist, -pos.z);
      ringCheck(tmp.z);
      const h = height(pos.x, pos.z);
      if (pos.y - .9 < Math.max(h, 0)) crash(h < 0 ? 'Splashdown' : 'Crashed');
      for (const B of balloons) {
        if (!B.on) continue;
        const dx = pos.x - B.x, dy = (pos.y - B.y) / 1.2, dz = pos.z - B.z;
        if (dx * dx + dy * dy + dz * dz < 33 || Math.hypot(pos.x - B.x, pos.y - B.y + 9.4, pos.z - B.z) < 2.2) crash('Hit a balloon', B);
      }
      if ((S.tick -= dt) <= 0) { S.tick = .2; api.score(score()); }
    }

    function view(dt, rdt) {
      fw.set(-Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch));
      camT.set(pos.x + Math.sin(S.yaw) * 13, pos.y + 4.2 - Math.sin(S.pitch) * 5, pos.z + Math.cos(S.yaw) * 13);
      const g = Math.max(height(camT.x, camT.z), 0) + 2.5;
      if (camT.y < g) camT.y = g;
      const kk = mode === 'run' || mode === 'ready' ? 5 : 1.2;
      camera.position.x = damp(camera.position.x, camT.x, kk, rdt);
      camera.position.y = damp(camera.position.y, camT.y, kk * .8, rdt);
      camera.position.z = damp(camera.position.z, camT.z, kk, rdt);
      lookT.copy(pos).addScaledVector(fw, 12);
      look.x = damp(look.x, lookT.x, 8, rdt); look.y = damp(look.y, lookT.y, 8, rdt); look.z = damp(look.z, lookT.z, 8, rdt);
      camera.lookAt(look);
      camera.rotateZ(S.roll * .3);
      const fov = 62 + clamp((S.speed - 30) / 18, 0, 1) * 13;
      if (Math.abs(camera.fov - fov) > .01) { camera.fov = damp(camera.fov, fov, 3, rdt); camera.updateProjectionMatrix(); }
      sky.mesh.position.copy(camera.position);
      water.position.set(pos.x, 0, pos.z);
      waterT.offset.set(pos.x / 37.5 + clock * .004, -pos.z / 37.5 + clock * .002);
      sun.target.position.copy(pos);
      sun.position.copy(pos).addScaledVector(sd, 200);
    }

    function hudAll() {
      const f = S.fuel / 100;
      fuelBar.style.transform = `scaleX(${f.toFixed(3)})`;
      const low = f < .25;
      if (low !== S.low) { S.low = low; fuelBar.parentNode.classList.toggle('low', low); }
      const s = `${Math.round(pos.y)}|${score()}|${S.rings}|${S.mult}|${S.coins}|${S.arm}`;
      if (s !== S.shown) {
        S.shown = s;
        hCoins.textContent = mode === 'ready' ? SV.coins.toLocaleString() : S.coins;
        hArm.textContent = '◆'.repeat(S.arm) || '—';
        hArm.parentNode.style.display = lvl('arm') ? '' : 'none';
        hAlt.innerHTML = Math.round(pos.y) + '<small>m</small>';
        hScore.textContent = mode === 'ready' ? 0 : score().toLocaleString();
        hRings.textContent = S.rings;
        hMult.textContent = 'x' + S.mult;
        hMult.parentNode.style.display = S.mult > 1 ? '' : 'none';
      }
      const R = rings.find(r => !r.done);
      let show = false;
      if (R && mode === 'run') {
        tmp.set(R.x, R.y, R.z).project(camera);
        const behind = tmp.z > 1;
        let x = behind ? -tmp.x : tmp.x, y = behind ? -tmp.y : tmp.y;
        if (behind || Math.abs(x) > .94 || Math.abs(y) > .9) {
          const s2 = 1 / Math.max(Math.abs(x) / .86, Math.abs(y) / .78, 1e-3);
          x *= s2; y *= s2; show = true;
          arrow.style.left = (50 + x * 50) + '%'; arrow.style.top = (50 - y * 50) + '%';
          arrow.style.transform = `translate(-50%,-50%) rotate(${-Math.atan2(y, x)}rad)`;
        }
      }
      if (show !== S.arrow) { S.arrow = show; arrow.style.display = show ? '' : 'none'; }
    }

    api.loop(rdt => {
      clock += rdt;
      if (mode === 'crash') {
        S.crashT += rdt; ts = damp(ts, 1, 1, rdt);
        if (S.crashT > 1.8) finish();
      }
      const dt = rdt * ts;
      if (mode === 'run') fly(dt);
      else if (mode === 'ready') {
        S.yaw = Math.sin(clock * .4) * .15; S.roll = -Math.cos(clock * .4) * .2; S.pitch = 0; S.speed = 30;
        fw.set(-Math.sin(S.yaw), 0, -Math.cos(S.yaw));
        pos.addScaledVector(fw, S.speed * dt);
        pos.y = damp(pos.y, Math.max(60, height(pos.x, pos.z - 60) + 30), 1, dt);
      }
      if (mode === 'run' || mode === 'ready') {
        plane.position.copy(pos);
        plane.rotation.set(S.pitch, S.yaw, S.roll);
        plane.visible = !(S.inv > 0 && (clock * 12) % 1 < .4);
        const spin = S.fuel > 0 ? (S.boost ? 70 : 45) : 6;
        prop.rotation.z += spin * dt;
        scarf.rotation.z = Math.sin(clock * 14) * .22 + S.sx * .3;
        blur.material.opacity = S.fuel > 0 ? .12 + (S.boost ? .1 : 0) : 0;
      }
      updateChunks(pos.x, pos.z, false);
      for (const R of rings) {
        if (R.done === 1) {
          R.t += dt;
          R.m.scale.setScalar(1 + R.t * 2.2);
          if (R.t > .3) R.m.visible = false;
        } else R.m.rotation.z += dt * .4;
      }
      const nextR = rings.find(r => !r.done);
      for (const R of rings) {
        R.m.material = R === nextR && R.kind === 'gold' ? ringHot : R.mat;
        if (R.kind === 'move' && R.done !== 1) { R.x = R.x0 + Math.sin(clock * 1.3 + R.ph) * R.amp; R.m.position.x = R.x; }
      }
      for (const C of coins) if (C.on) { C.m.rotation.y = clock * 3 + C.x; if (C.z > pos.z + 30) { C.on = false; C.m.visible = false; } }
      for (const C of cans) if (C.on) { C.m.rotation.y = clock * 1.5; C.m.position.y = C.y + Math.sin(clock * 2 + C.x) * .5; if (C.z > pos.z + 30) { C.on = false; C.m.visible = false; } }
      if (nextR) nextR.m.scale.setScalar(1 + Math.sin(clock * 6) * .04);
      for (let i = rings.length; i--;) {
        const R = rings[i];
        if (R.z > pos.z + 40) { R.on = false; R.m.visible = false; rings.splice(i, 1); }
      }
      while (rings.length < 7 && addRing());
      for (const B of balloons) {
        if (!B.on) continue;
        if (B.z > pos.z + 60) { B.on = false; B.g.visible = false; continue; }
        B.g.position.set(B.x, B.y + Math.sin(clock * .8 + B.ph) * 1.2, B.z);
        const fl = .75 + .25 * Math.sin(clock * 22 + B.ph * 5);
        B.flame.scale.set(fl, .8 + .4 * Math.sin(clock * 17 + B.ph), fl);
      }
      for (const c of clouds) if (c.position.z > pos.z + 150 || Math.abs(c.position.x - pos.x) > 620) placeCloud(c, true);
      burst.update(dt, mode === 'crash' || mode === 'over' ? 6 : 2, -50, 0);
      view(dt, rdt);
      hudAll();
      renderer.render(scene, camera);
    });

    reset(false);
    menu();
    return () => { K.dispose(scene); if (envRT) envRT.dispose(); pmrem.dispose(); };
  }

  Ameplay.register({
    id: 'sky-pilot',
    title: 'Sky Pilot',
    category: '3D',
    blurb: 'Fly a little prop plane through rings over endless islands, collect coins and upgrade it in the hangar.',
    help: 'Steer with the mouse or touch, or <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> · <kbd>Space</kbd> boost',
    better: 'high',
    width: 960,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 12v34"/><path d="M8 28h48l-4 6H12z"/><path d="M24 50h16"/><path d="M32 46v4"/><path d="M26 12h12"/><circle cx="32" cy="22" r="4"/><circle cx="52" cy="12" r="6" opacity=".5"/></svg>',
    css: uiCss('sky-pilot') + `
.gm-sky-pilot .bar{display:block;width:max(84px,13cqw);height:max(8px,1.1cqw);margin-top:max(4px,.6cqw);border-radius:99px;background:rgba(255,255,255,.22);overflow:hidden}
.gm-sky-pilot .bar i{display:block;width:100%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#22b07d,#8be3b0);transform-origin:left center}
.gm-sky-pilot .bar.low i{background:linear-gradient(90deg,#ef4f4f,#ff9f80);animation:sky-pilot-blink .5s steps(2) infinite}
@keyframes sky-pilot-blink{50%{opacity:.35}}
.gm-sky-pilot .arrow{position:absolute;width:max(30px,4.2cqw);height:max(30px,4.2cqw);display:none;color:#ffd23d;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
.gm-sky-pilot .arrow svg{width:100%;height:100%}
.gm-sky-pilot .wrap canvas{cursor:crosshair}
.g-overlay .sp-hg{display:block;text-align:left}
.g-overlay .sp-bank{display:block;text-align:center;font-weight:900;font-size:18px;color:#c98a00;margin-bottom:6px}
.g-overlay .sp-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line,rgba(0,0,0,.08))}
.g-overlay .sp-row:first-of-type{margin-top:8px}
.g-overlay .sp-n{flex:1;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:2px;min-width:0}
.g-overlay .sp-n b{font-weight:900;color:var(--ink)}
.g-overlay .sp-n small{font-size:12px;color:var(--muted)}
.g-overlay .sp-pips{display:flex;gap:3px;margin-top:2px}
.g-overlay .sp-pips i{width:16px;height:6px;border-radius:3px;background:var(--sunk,rgba(0,0,0,.1))}
.g-overlay .sp-pips i.on{background:var(--accent,#6c5ce7)}
.g-overlay .sp-buy{height:34px;padding:0 12px;border:0;border-radius:999px;background:var(--accent,#6c5ce7);color:#fff;font:800 13px/1 var(--sans);cursor:pointer;white-space:nowrap}
.g-overlay .sp-buy b{color:#ffd23d}
.g-overlay .sp-buy:disabled{opacity:.4;cursor:default}
.g-overlay .sp-max{font:900 12px/1 var(--sans);color:var(--muted);letter-spacing:.1em}`,
    mount(root, api) {
      let cleanup = null;
      api.gl(...glSize(root, 720, 720)).then(v => { if (v && api.alive) { cleanup = skyPilot(api, root, v, kit(v.THREE)); fitPR(api, v); } });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });
})();

