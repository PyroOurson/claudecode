const { launch } = require('/tmp/gameplay-build/t/lib.js');
const [html, outDir, w, h, mob] = process.argv.slice(2);
require('fs').mkdirSync(outDir, { recursive: true });
(async () => {
  const { b, ctx } = await launch({ viewport: { width: +w || 1280, height: +h || 720 }, mobile: mob === 'm' });
  await ctx.addInitScript(() => { try { localStorage.setItem('gameplay:v1', JSON.stringify({ best: {}, plays: {}, recent: [], muted: true, theater: false })); } catch (e) {} });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 400)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load/.test(m.text())) errs.push('ERR ' + m.text().slice(0, 400)); });
  await p.goto('file://' + html + '#/rocket-soccer');
  await p.waitForTimeout(4000);
  const box = async () => p.evaluate(() => { const r = document.querySelector('#frame .g-root .wrap').getBoundingClientRect(); return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: r.width, height: r.height }; });
  const shot = async n => { await p.screenshot({ path: outDir + '/' + n + '.png', clip: await box() }); };
  await shot('00_menu');
  if (mob !== 'm' && mob !== 'menu') {
    if (mob === 'split') await p.evaluate(() => document.querySelector('.menu [data-k="play"][data-v="local"]').click());
    else await p.evaluate(() => document.querySelector('.menu [data-k="size"][data-v="1"]').click());
    await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector('.menu [data-go]').click());
    await p.waitForFunction(() => document.querySelector('.wrap').__rs.world().state === 'play', null, { timeout: 180000 }).catch(() => errs.push('never play'));
    await shot('01_play');
    if (mob === 'split') { await p.keyboard.down('KeyW'); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(2500); await shot('02_split'); }
    else {
      await p.evaluate(() => { const W = document.querySelector('.wrap').__rs.world(); const B = W.ball; B.p.x = 300; B.p.y = 3600; B.p.z = 250; B.v.x = -150; B.v.y = 2200; B.v.z = 200; W.lastTouch = W.cars[0]; W.touchHist.push({ c: W.cars[0], t: W.time, shot: false }); });
      await p.waitForFunction(() => document.querySelector('.wrap').classList.contains('fxrep'), null, { timeout: 240000 }).catch(() => errs.push('no replay'));
      await p.waitForTimeout(1500); await shot('02_replay');
      await p.waitForTimeout(3000); await shot('03_replay');
    }
  }
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
