const { launch, visitor, BASE } = require('../site.js');
const { execFileSync } = require('child_process');
const DB = process.env.STAGE_DB_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SB = process.env.STAGE_SB_URL || 'http://127.0.0.1:54321';
const PASS = process.env.STAGE_SITE_PASS || 'stagepass1';
const sql = q => execFileSync('psql', [DB, '-Atqc', q]).toString().trim();
const state = () => { const v = s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && c.visibility !== 'hidden' && c.display !== 'none'; }; return v('#f') ? 'password' : v('#sp') || v('#sps') ? 'skeleton' : document.querySelector('#top') ? 'site' : 'blank'; };
(async () => {
  const key = sql('select open_key from public.site_gate where id = 1');
  sql('update public.site_gate set open_key = null where id = 1');
  let fails = 0;
  const b = await launch();
  try {
    const v = await visitor(b);
    await v.ctx.route(u => u.href.indexOf(SB) === 0, async r => { await new Promise(x => setTimeout(x, 2000)); try { await r.continue(); } catch (e) {} });
    const seen = [];
    const nav = v.page.goto(BASE, { waitUntil: 'commit' }).catch(() => {});
    const t0 = Date.now();
    while (Date.now() - t0 < 4500) { let s = 'nav'; try { s = await v.page.evaluate(state); } catch (e) {} if (seen[seen.length - 1] !== s) seen.push(s); await new Promise(r => setTimeout(r, 30)); }
    await nav;
    const ok1 = seen.join('>').replace(/^nav>|blank>/g, '') === 'skeleton>password';
    console.log((ok1 ? 'PASS' : 'FAIL') + ' locked gate, slow backend: skeleton then the password form once: ' + seen.join(' > '));
    fails += ok1 ? 0 : 1;
    await v.page.fill('#p', 'wrong-password');
    await v.page.click('#b');
    await v.page.waitForFunction(() => /Wrong password/.test(document.querySelector('#m').textContent), null, { timeout: 15000 });
    console.log('PASS wrong password is refused: ' + await v.page.textContent('#m'));
    await v.page.fill('#p', PASS);
    await v.page.click('#b');
    await v.page.waitForFunction(() => window.Ameplay && document.querySelector('#top'), null, { timeout: 20000 });
    console.log('PASS right password opens the site');
    await v.page.reload();
    const seen2 = [];
    const t1 = Date.now();
    while (Date.now() - t1 < 3500) { let s = 'nav'; try { s = await v.page.evaluate(state); } catch (e) {} if (seen2[seen2.length - 1] !== s) seen2.push(s); await new Promise(r => setTimeout(r, 30)); }
    const ok2 = seen2.indexOf('password') < 0 && seen2.indexOf('site') >= 0;
    console.log((ok2 ? 'PASS' : 'FAIL') + ' unlocked browser reloads without the password form: ' + seen2.join(' > '));
    fails += ok2 ? 0 : 1;
    await v.close();
  } finally {
    if (key) sql("update public.site_gate set open_key = '" + key.replace(/'/g, '') + "' where id = 1");
    await b.close();
  }
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
