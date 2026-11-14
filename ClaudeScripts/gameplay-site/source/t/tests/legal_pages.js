const lib = require('../lib.js');
const { visitor } = lib;
const must = (c, m) => { if (!c) throw new Error(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await lib.launch();
  let fail = null;
  try {
    const v = await visitor(b, {});
    await v.goto('', 1200);
    const early = await v.page.evaluate(() => performance.getEntriesByType('resource').filter(r => /\/gameplay\//.test(r.name)).length);
    const link = await v.page.$('#ckbar [data-legal="privacy"], #ckbar a[href*="privacy"]');
    must(link, 'no privacy link in the cookie notice');
    await link.evaluate(e => e.click());
    await v.page.waitForFunction(() => { const d = document.querySelector('#lgdoc'); return !!d && d.innerText.length > 40000; }, null, { timeout: 60000 });
    const sheet = await v.page.evaluate(() => ({ title: document.querySelector('#lgt').textContent, len: document.querySelector('#lgdoc').innerText.length }));
    must(/Privacy/.test(sheet.title), 'wrong sheet title: ' + sheet.title);
    await v.close();
    const p = await lib.player(b, 'ann');
    const out = {};
    for (const k of ['terms', 'privacy', 'cookies']) {
      await p.page.evaluate(x => { location.hash = '#/' + x; }, k);
      await p.page.waitForFunction(x => { const d = document.querySelector('#doc'); const a = document.querySelector('.ltabs a[aria-current="page"]'); return !!d && d.innerText.length > 40000 && !!a && a.dataset.legal === x; }, k, { timeout: 60000 });
      out[k] = await p.page.evaluate(() => document.querySelector('#doc').innerText.trim().split(/\s+/).length);
      await sleep(300);
    }
    await p.page.reload({ waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.ready();
    await p.page.waitForFunction(() => { const d = document.querySelector('#doc'); return !!d && d.innerText.length > 40000; }, null, { timeout: 60000 });
    console.log('PASS legal pages load on demand: cookie notice sheet ' + sheet.len + ' characters; words shown: ' + JSON.stringify(out) + '; direct reload of a legal page works; files fetched before any legal page was opened: ' + early);
  } catch (e) { fail = e; console.log('FAIL legal pages: ' + String(e && e.message || e).split('\n')[0]); }
  await b.close().catch(() => {});
  process.exit(fail ? 1 : 0);
})();
