const { launch } = require('./lib.js');
const fs = require('fs');
const O = process.argv[2];
const outDir = process.argv[3];
const only = process.argv[4] ? process.argv[4].split(',') : null;
const W = +process.argv[5] || 1280, H = +process.argv[6] || 800;
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const { b, ctx } = await launch({ viewport: { width: W, height: H }, mobile: W < 700 });
  const boot = await ctx.newPage();
  await boot.goto('file://' + O);
  await boot.waitForTimeout(500);
  let ids = await boot.evaluate(() => Ameplay.debug.games.map(g => g.id));
  await boot.close();
  if (only) ids = ids.filter(i => only.includes(i));
  const report = [];
  for (const id of ids) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 160)); });
    try {
      await p.goto('file://' + O + '#/' + id);
      await p.waitForTimeout(2200);
      const pre = await p.evaluate(() => ({ score: document.querySelector('#pScore').textContent, plays: JSON.parse(localStorage.getItem('gameplay:v1') || '{}').plays }));
      await p.screenshot({ path: `${outDir}/${id}_a.png` });
      const btn = await p.$('.g-overlay.show [data-a="1"]');
      if (btn) { await btn.click().catch(() => {}); }
      await p.waitForTimeout(2500);
      await p.keyboard.press('Space').catch(() => {});
      await p.waitForTimeout(1200);
      await p.screenshot({ path: `${outDir}/${id}_b.png` });
      const post = await p.evaluate(() => ({ score: document.querySelector('#pScore').textContent, k: document.querySelector('#pScoreK').textContent, best: document.querySelector('#pBest').textContent, plays: JSON.parse(localStorage.getItem('gameplay:v1') || '{}').plays, tr: document.querySelector('#frame').style.transform, sh: document.querySelector('#stage').style.height, bw: document.querySelector('.g-root') ? document.querySelector('.g-root').getBoundingClientRect().width : 0 }));
      report.push({ id, pre, post, errs });
    } catch (e) { report.push({ id, fail: e.message.slice(0, 200), errs }); }
    await p.close();
  }
  fs.writeFileSync(outDir + '/report.json', JSON.stringify(report, null, 1));
  await b.close();
})();
