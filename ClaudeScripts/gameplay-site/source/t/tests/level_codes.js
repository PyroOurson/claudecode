const lib = require('../lib.js');
const html = process.argv[2] || 'C:/tmp/gp/lead/wobble.html';
(async () => {
  const store = {}, calls = [];
  const setup = async ctx => {
    await ctx.route(/supabase\.co\/rest\/v1\/rpc\/level_(share|get)/, async rt => {
      const q = rt.request(), f = /level_(share|get)/.exec(q.url())[0];
      const j = v => rt.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(v) });
      if (q.method() === 'OPTIONS') return rt.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      const b = q.postDataJSON() || {};
      calls.push([f, b]);
      if (f === 'level_share') { const c = 'K7MQ4X'; store[c] = b.p_body; return j(c); }
      return j(store[String(b.p_code || '')] || null);
    });
  };
  const g = await lib.open(html, 'wobble-ride', { setup });
  const out = [], fail = [];
  const must = (ok, m) => { (ok ? out : fail).push(m); };
  try {
    await g.page.waitForTimeout(1000);
    const prep = await g.page.evaluate(() => { const w = document.querySelector('#frame .g-root').__wr || [...document.querySelectorAll('#frame *')].map(e => e.__wr).find(Boolean); if (!w) return 'no hook'; window.__w = w; w.sv.mine[0] = Object.assign({}, w.HW.LEVELS[0], { mine: 1, id: 'u0' }); w.sv.mine[1] = null; return 'ok'; });
    must(prep === 'ok', 'test hook found (' + prep + ')');
    await g.page.evaluate(() => window.__w.shareLevel(0));
    await g.page.waitForSelector('.wr-dlg textarea', { timeout: 5000 });
    const shown = await g.page.$eval('.wr-dlg textarea', t => t.value);
    const sc = calls.find(c => c[0] === 'level_share');
    must(shown === 'K7M-Q4X', 'sharing a level shows the short code (' + shown.slice(0, 20) + ')');
    must(!!sc && sc[1].p_game === 'wobble-ride' && /^WR[01]/.test(sc[1].p_body || ''), 'the long code was stored on the server');
    await g.page.evaluate(() => document.querySelector('.wr-dlg [data-k="x"]').click());
    await g.page.evaluate(() => window.__w.importCode());
    await g.page.waitForSelector('.wr-dlg textarea', { timeout: 5000 });
    await g.page.fill('.wr-dlg textarea', 'zzz-zzz');
    await g.page.click('.wr-dlg [data-k="ok"]');
    await g.page.waitForTimeout(800);
    const miss = await g.page.$eval('.wr-dlg .wr-msg', m => m.textContent).catch(() => '');
    must(/No level has this code/.test(miss), 'an unknown short code says so (' + miss + ')');
    await g.page.fill('.wr-dlg textarea', ' k7m-q4x ');
    await g.page.click('.wr-dlg [data-k="ok"]');
    await g.page.waitForTimeout(1200);
    const gone = await g.page.$('.wr-dlg');
    const get = calls.filter(c => c[0] === 'level_get').pop();
    const saved = await g.page.evaluate(() => !!window.__w.sv.mine[1] && window.__w.sv.mine[1].name);
    must(!gone && !!get && get[1].p_code === 'K7MQ4X' && !!saved, 'typing the short code loads the level into a free slot (' + saved + ')');
    must(!g.errs.length, 'no page errors (' + g.errs.slice(0, 2).join(' | ') + ')');
  } catch (e) { fail.push('error: ' + String(e && e.message || e).split('\n')[0]); }
  await g.close();
  out.forEach(m => console.log('PASS ' + m));
  fail.forEach(m => console.log('FAIL ' + m));
  console.log(fail.length ? fail.length + ' failing' : 'all passing');
  process.exit(fail.length ? 1 : 0);
})();
