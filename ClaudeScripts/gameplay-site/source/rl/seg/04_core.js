      function run({ THREE, renderer, canvas, w, h }) {
        let dead = false;
        const bin = [], own = o => (bin.push(o), o), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        wrap.style.width = canvas.style.width; canvas.style.width = '100%'; wrap.prepend(canvas);
        const tex = (tw, th, paint, rep) => {
          const c = document.createElement('canvas'); c.width = tw; c.height = th; paint(c.getContext('2d'), tw, th);
          const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
          if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
          return own(t);
        };
        const lin = (hx, k = 1) => new THREE.Color(hx).convertSRGBToLinear().multiplyScalar(k);
        const mergeG = list => {
          const gs = list.map(g => { const n = g.index ? g.toNonIndexed() : g; if (n !== g) g.dispose(); return n; });
          const uv = gs.every(g => g.attributes.uv), cl = gs.every(g => g.attributes.color);
          let n = 0;
          for (const g of gs) n += g.attributes.position.count;
          const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), tc = uv ? new Float32Array(n * 2) : null, cc = cl ? new Float32Array(n * 3) : null;
          let o = 0;
          for (const g of gs) {
            pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
            if (uv) tc.set(g.attributes.uv.array, o * 2);
            if (cl) cc.set(g.attributes.color.array, o * 3);
            o += g.attributes.position.count; g.dispose();
          }
          const out = own(new THREE.BufferGeometry());
          out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
          if (uv) out.setAttribute('uv', new THREE.BufferAttribute(tc, 2));
          if (cl) out.setAttribute('color', new THREE.BufferAttribute(cc, 3));
          return out;
        };
        const GX = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); if (rz) g.rotateZ(rz); return g.translate(x, y, z); };
