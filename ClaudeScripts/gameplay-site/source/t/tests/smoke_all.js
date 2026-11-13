const lib = require('../party_lib.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const only = (process.env.ONLY || '').split(',').filter(Boolean);
(async () => {
  const b = await lib.launch();
  const v = await lib.player(b, process.env.SMOKE_USER || 'ann');
  const errs = [];
  v.page.on('pageerror', e => errs.push('pageerror ' + String(e && e.message || e).slice(0, 200)));
  v.page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fonts\.g|peerjs|adapters/i.test(m.text())) errs.push('console ' + m.text().slice(0, 200)); });
  const ids = await v.page.evaluate(() => { const g = Ameplay.debug.games; const l = typeof g === 'function' ? g() : g; return l.map(x => x.id); });
  const list = only.length ? ids.filter(i => only.includes(i)) : ids;
  const bad = [];
  let n = 0;
  for (const id of list) {
    errs.length = 0;
    let st = 'ok';
    try {
      await v.page.evaluate(i => Ameplay.debug.open(i), id);
      await v.page.waitForFunction(i => { const r = document.querySelector('#frame .g-root'); return !!r && r.className.indexOf('gm-' + i) >= 0 && r.childElementCount > 0; }, id, { timeout: 45000 });
      await sleep(900);
      const s = await v.page.$('#frame .g-overlay.show [data-a="1"]');
      if (s) await s.evaluate(e => e.click()).catch(() => {});
      await sleep(900);
      const txt = await v.page.evaluate(() => (document.querySelector('#frame') || {}).innerText || '');
      if (/hit an error and could not start|not available any more|Couldn’t load the game/i.test(txt)) st = 'shows an error card';
    } catch (e) { st = 'did not mount: ' + String(e && e.message || e).split('\n')[0].slice(0, 80); }
    const e2 = errs.slice();
    if (st !== 'ok' || e2.length) bad.push(id + ': ' + st + (e2.length ? ' | ' + e2.slice(0, 2).join(' | ') : ''));
    n++;
    if (n % 20 === 0) console.log(n + ' of ' + list.length + ' opened, ' + bad.length + ' with problems');
    await v.page.evaluate(() => Ameplay.debug.close());
    await sleep(250);
  }
  console.log(list.length + ' games opened; ' + bad.length + ' with problems');
  bad.forEach(x => console.log('  ' + x));
  await b.close();
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(String(e && e.stack || e).slice(0, 600)); process.exit(1); });
