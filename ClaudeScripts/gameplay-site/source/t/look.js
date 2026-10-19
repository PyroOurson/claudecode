const { launch } = require('./lib.js');
const fs = require('fs');
const [html, id, out, stepsJson, w, h] = process.argv.slice(2);
(async () => {
  const { b, ctx } = await launch({ viewport: { width: +w || 1280, height: +h || 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('gameplay:v1', JSON.stringify({ best: {}, plays: {}, recent: [], muted: true, theater: false })); } catch (e) {} });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load/.test(m.text())) errs.push('ERR ' + m.text().slice(0, 300)); });
  await p.goto('file://' + html + '#/' + id);
  await p.waitForTimeout(2500);
  const steps = stepsJson ? JSON.parse(stepsJson) : [['clickPrimary'], ['wait', 3000]];
  const bbox = () => p.evaluate(() => {
    const root = document.querySelector('#frame .g-root');
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const el of root.children) { const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; if (getComputedStyle(el).position === 'fixed') continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  });
  let n = 0;
  for (const [k, a, c] of steps) {
    if (k === 'clickPrimary') { const btn = await p.$('.g-overlay.show [data-a="1"]'); if (btn) await btn.click().catch(() => {}); }
    else if (k === 'click') await p.click(a, { timeout: 2000 }).catch(() => {});
    else if (k === 'wait') await p.waitForTimeout(a);
    else if (k === 'press') await p.keyboard.press(a).catch(() => {});
    else if (k === 'down') await p.keyboard.down(a).catch(() => {});
    else if (k === 'up') await p.keyboard.up(a).catch(() => {});
    else if (k === 'rel') { const bx = await bbox(); await p.mouse.click(bx.x + a * bx.w, bx.y + c * bx.h); }
    else if (k === 'relmove') { const bx = await bbox(); await p.mouse.move(bx.x + a * bx.w, bx.y + c * bx.h); }
    else if (k === 'eval') await p.evaluate(a).catch(() => {});
    else if (k === 'shot') { const bx = await bbox(); await p.screenshot({ path: out.replace(/\.png$/, '_' + (++n) + '.png'), clip: { x: Math.max(0, bx.x), y: Math.max(0, bx.y), width: bx.w, height: bx.h } }); }
  }
  const bx = await bbox();
  await p.screenshot({ path: out, clip: { x: Math.max(0, bx.x), y: Math.max(0, bx.y), width: bx.w, height: bx.h } });
  console.log(errs.length ? errs.join('\n') : 'no errors', Math.round(bx.w) + 'x' + Math.round(bx.h));
  await b.close();
})();
