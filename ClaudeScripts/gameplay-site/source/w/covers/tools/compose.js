const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const C = __dirname;
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const fontFiles = fs.readdirSync(C + '/fonts').filter(f => f.endsWith('.ttf'));
const fam = f => f.replace(/\.ttf$/, '').replace(/_wght_\d+$/, '').replace(/_/g, ' ');
const faces = fontFiles.map(f => `@font-face{font-family:'${fam(f)}';src:url('file://${C}/fonts/${f}');font-weight:100 900;}`).join('\n');

function page(job) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${faces}
html,body{margin:0;padding:0;background:#000;overflow:hidden}
#c{position:relative;width:${job.w || 960}px;height:${job.h || 600}px;overflow:hidden}
#c img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
svg{position:absolute;inset:0}
</style></head><body><div id="c">${job.under || ''}${job.bg ? `<img class="bg" src="file://${job.bg}">` : ''}${job.html || ''}<svg id="s" width="${job.w || 960}" height="${job.h || 600}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></div></body></html>`;
}

async function build(p, L, W, H) {
  return await p.evaluate(({ L, W, H }) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.getElementById('s');
    const mk = (t, a, par) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (par || svg).appendChild(e); return e; };
    const defs = mk('defs', {});
    let uid = 0;
    const id = p => p + (uid++);
    const grad = (stops, x1, y1, x2, y2) => {
      const g = mk('linearGradient', { id: id('g'), x1: x1 ?? 0, y1: y1 ?? 0, x2: x2 ?? 0, y2: y2 ?? 1 }, defs);
      stops.forEach((s, i) => { const o = Array.isArray(s) ? s[1] : i / Math.max(1, stops.length - 1); mk('stop', { offset: o, 'stop-color': Array.isArray(s) ? s[0] : s }, g); });
      return 'url(#' + g.id + ')';
    };
    const blurF = (r, color, op) => {
      const f = mk('filter', { id: id('f'), x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
      mk('feGaussianBlur', { stdDeviation: r }, f);
      return 'url(#' + f.id + ')';
    };
    const root = mk('g', {});
    const inner = mk('g', {}, root);
    const lines = L.lines;
    let yCur = 0;
    const lineEls = [];
    lines.forEach((ln, li) => {
      const size = ln.size || 100;
      const font = ln.font || L.font;
      const t = mk('text', { id: id('t'), x: ln.dx || 0, y: yCur + size * 0.8, 'font-family': "'" + font + "', sans-serif", 'font-size': size, 'font-weight': ln.weight || L.weight || 900, 'text-anchor': 'middle', 'letter-spacing': (ln.ls ?? L.ls ?? 0) + 'em', 'font-style': ln.italic || L.italic ? 'italic' : 'normal' }, defs);
      t.textContent = ln.t;
      lineEls.push({ t, ln, size, y: yCur });
      yCur += size * (ln.lh || L.lh || 0.98) + (ln.gap || 0);
    });
    const layers = { shadow: mk('g', {}, inner), glow: mk('g', {}, inner), depth: mk('g', {}, inner), outer: mk('g', {}, inner), stroke: mk('g', {}, inner), fill: mk('g', {}, inner), gloss: mk('g', {}, inner), over: mk('g', {}, inner) };
    lineEls.forEach(({ t, ln, size, y }) => {
      const P = Object.assign({}, L, ln.style || {});
      const href = '#' + t.id;
      const use = (par, a) => { const u = mk('use', a, par); u.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href); u.setAttribute('href', href); return u; };
      const sw = (P.sw ?? 0.06) * size;
      const ow = (P.ow ?? 0) * size;
      const dep = Math.round((P.depth ?? 0.1) * size);
      const dd = P.ddir || [0.25, 1];
      const ln2 = Math.hypot(dd[0], dd[1]);
      const dx = dd[0] / ln2, dy = dd[1] / ln2;
      const skw = P.skew ? `skewX(${P.skew})` : '';
      [layers.shadow, layers.glow, layers.depth, layers.outer, layers.stroke, layers.fill, layers.gloss, layers.over].forEach(g => { if (skw) g.setAttribute('transform', skw); });
      if (P.shadow !== 0) {
        use(layers.shadow, { fill: P.shc || '#000', stroke: P.shc || '#000', 'stroke-width': sw * 2 + ow * 2 + 6, 'stroke-linejoin': 'round', opacity: P.shadow ?? 0.55, filter: blurF(P.shr ?? size * 0.08), transform: `translate(${dx * dep * 1.0 + 2},${dy * dep * 1.0 + size * 0.06})` });
      }
      if (P.glow) {
        use(layers.glow, { fill: P.glow, stroke: P.glow, 'stroke-width': sw * 2 + ow * 2, 'stroke-linejoin': 'round', opacity: P.ga ?? 0.9, filter: blurF(P.gr ?? size * 0.18) });
        if (P.glow2) use(layers.glow, { fill: P.glow2, stroke: P.glow2, 'stroke-width': sw * 2 + ow * 2, opacity: P.ga2 ?? 0.6, filter: blurF(P.gr2 ?? size * 0.5) });
      }
      const dc = P.dcol || ['#222', '#000'];
      const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
      const mixc = (a, b, k) => { const A = hexToRgb(a), B = hexToRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; };
      for (let i = dep; i >= 1; i--) {
        const c = mixc(dc[0], dc[1], i / Math.max(1, dep));
        use(layers.depth, { fill: c, stroke: P.ow ? (P.dout || c) : c, 'stroke-width': sw * 2 + ow * 2, 'stroke-linejoin': 'round', transform: `translate(${dx * i},${dy * i})` });
      }
      if (ow) use(layers.outer, { fill: P.oc || '#fff', stroke: P.oc || '#fff', 'stroke-width': sw * 2 + ow * 2, 'stroke-linejoin': 'round' });
      if (sw) use(layers.stroke, { fill: P.sc || '#000', stroke: P.sc || '#000', 'stroke-width': sw * 2, 'stroke-linejoin': 'round' });
      let fill = P.fill || ['#ffffff', '#cccccc'];
      let fillv;
      if (P.fillimg) {
        const pat = mk('pattern', { id: id('p'), patternUnits: 'userSpaceOnUse', width: P.fillimgw || 64, height: P.fillimgw || 64 }, defs);
        const im = mk('image', { width: P.fillimgw || 64, height: P.fillimgw || 64, preserveAspectRatio: 'none', 'image-rendering': 'pixelated', style: 'image-rendering:pixelated' }, pat);
        im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', P.fillimg);
        im.setAttribute('href', P.fillimg);
        fillv = 'url(#' + pat.id + ')';
      } else {
        const bb = { y0: y, y1: y + size * 0.8 };
        const g = mk('linearGradient', { id: id('g'), gradientUnits: 'userSpaceOnUse', x1: 0, y1: y + size * (P.gy0 ?? 0.05), x2: 0, y2: y + size * (P.gy1 ?? 0.82) }, defs);
        fill.forEach((s, i) => { const o = Array.isArray(s) ? s[1] : i / Math.max(1, fill.length - 1); mk('stop', { offset: o, 'stop-color': Array.isArray(s) ? s[0] : s }, g); });
        fillv = 'url(#' + g.id + ')';
      }
      use(layers.fill, { fill: fillv, stroke: P.istroke || 'none', 'stroke-width': (P.isw || 0) * size, 'paint-order': 'stroke' });
      if (P.inner) {
        const f = mk('filter', { id: id('f'), x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
        mk('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: P.innerr || size * 0.03, result: 'b' }, f);
        mk('feOffset', { dx: 0, dy: -(P.innero ?? size * 0.03), result: 'o' }, f);
        mk('feComposite', { in: 'SourceAlpha', in2: 'o', operator: 'out', result: 'e' }, f);
        mk('feFlood', { 'flood-color': P.inner, 'flood-opacity': P.innera ?? 0.6 }, f);
        mk('feComposite', { in2: 'e', operator: 'in' }, f);
        use(layers.over, { fill: '#000', filter: 'url(#' + f.id + ')' });
      }
      if (P.gloss) {
        const cp = mk('clipPath', { id: id('c') }, defs);
        const r = mk('rect', { x: -5000, y: y - size, width: 10000, height: size * (1 + (P.glossh ?? 0.42)) }, cp);
        const gg = mk('linearGradient', { id: id('g'), gradientUnits: 'userSpaceOnUse', x1: 0, y1: y, x2: 0, y2: y + size * (P.glossh ?? 0.42) }, defs);
        mk('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': P.gloss }, gg);
        mk('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': P.gloss * 0.25 }, gg);
        use(layers.gloss, { fill: 'url(#' + gg.id + ')', 'clip-path': 'url(#' + cp.id + ')' });
      }
      if (P.edge) use(layers.over, { fill: 'none', stroke: P.edge, 'stroke-width': (P.edgew || 0.012) * size, opacity: P.edgea ?? 0.8 });
    });
    if (L.tag) {
      const T = L.tag;
      const tg = mk('g', {}, root);
      const bbm = inner.getBBox();
      const ty = (T.above ? bbm.y - (T.size || 26) * 0.6 : bbm.y + bbm.height + (T.size || 26) * (T.gap ?? 0.9));
      if (T.bar) {
        const tt = mk('text', { x: 0, y: ty, 'font-family': "'" + (T.font || 'Oswald') + "'", 'font-size': T.size || 26, 'font-weight': 700, 'text-anchor': 'middle', 'letter-spacing': (T.ls ?? 0.3) + 'em', fill: T.color || '#fff' }, tg);
        tt.textContent = T.t;
        const b = tt.getBBox();
        const pad = (T.size || 26) * 0.5;
        const rr = mk('rect', { x: b.x - pad, y: b.y - pad * 0.35, width: b.width + pad * 2, height: b.height + pad * 0.7, rx: T.rx ?? 4, fill: T.bar, opacity: T.bara ?? 1 }, tg);
        tg.insertBefore(rr, tt);
      } else {
        const sh = mk('text', { x: 0, y: ty + 2, 'font-family': "'" + (T.font || 'Oswald') + "'", 'font-size': T.size || 26, 'font-weight': 700, 'text-anchor': 'middle', 'letter-spacing': (T.ls ?? 0.3) + 'em', fill: '#000', opacity: 0.6, filter: blurF(3) }, tg);
        sh.textContent = T.t;
        const tt = mk('text', { x: 0, y: ty, 'font-family': "'" + (T.font || 'Oswald') + "'", 'font-size': T.size || 26, 'font-weight': 700, 'text-anchor': 'middle', 'letter-spacing': (T.ls ?? 0.3) + 'em', fill: T.color || '#fff' }, tg);
        tt.textContent = T.t;
      }
    }
    const bb = root.getBBox();
    const maxw = (L.maxw || 0.8) * W, maxh = (L.maxh || 0.32) * H;
    const s = Math.min(maxw / bb.width, maxh / bb.height, L.maxscale || 99);
    const cx = (L.x ?? 0.5) * W, cy = (L.y ?? 0.2) * H;
    const ax = L.anchor === 'left' ? bb.x : (L.anchor === 'right' ? bb.x + bb.width : bb.x + bb.width / 2);
    root.setAttribute('transform', `translate(${cx},${cy}) rotate(${L.rot || 0}) scale(${s}) translate(${-ax},${-(bb.y + bb.height / 2)})`);
    return { w: bb.width * s, h: bb.height * s, s };
  }, { L, W, H });
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  for (const job of jobs) {
    const W = job.w || 960, H = job.h || 600;
    await p.setViewportSize({ width: W, height: H });
    const f = C + '/tmp_page.html';
    fs.writeFileSync(f, page(job));
    await p.goto('file://' + f);
    await p.evaluate(async () => { await document.fonts.ready; const fams = new Set(); document.fonts.forEach(ff => fams.add(ff)); });
    if (job.logo) {
      const fonts = [job.logo.font].concat(job.logo.lines.map(l => l.font).filter(Boolean)).concat(job.logo.tag ? [job.logo.tag.font || 'Oswald'] : []);
      await p.evaluate(async fs2 => { for (const f of fs2) { try { await document.fonts.load('900 100px "' + f + '"'); await document.fonts.load('700 100px "' + f + '"'); await document.fonts.load('400 100px "' + f + '"'); } catch (e) {} } }, fonts);
      const r = await build(p, job.logo, W, H);
      console.log(job.id, JSON.stringify(r));
    }
    await p.waitForTimeout(80);
    await p.screenshot({ path: job.out, omitBackground: !!job.transparent });
  }
  await b.close();
})();
