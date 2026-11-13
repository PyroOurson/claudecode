const lib = require('../lib.js');
const { execFileSync } = require('child_process');
const DBC = process.env.STAGE_DB || 'supabase_db_staging';
const sql = q => execFileSync('docker', ['exec', '-i', DBC, 'psql', '-U', 'postgres', '-d', 'postgres', '-Atqc', q]).toString().trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = +(process.env.PEAK_N || 15);
(async () => {
  const have = +sql("select count(*) from auth.users where email like 'load%@example.com'");
  if (have < N) throw new Error('create the load accounts first: EXTRA_USERS=' + N + ' node t/lib.js users');
  sql('delete from private.presence_now');
  sql("delete from private.online_peak; delete from private.online_day; delete from private.online_min; delete from private.online_sec");
  const b = await lib.launch();
  let fail = null, note = '';
  const vs = [];
  try {
    const t0 = new Date();
    for (let i = 1; i <= N; i++) {
      const v = await lib.visitor(b);
      await v.goto('', 300);
      await v.login('load' + i + '@example.com', 'Passw0rd123');
      vs.push(v);
    }
    const until = Date.now() + 120000;
    let on = 0;
    while (Date.now() < until && (on = +sql("select count(*) from private.presence_now where at > now() - interval '100 seconds'")) < N) await sleep(1000);
    if (on < N) throw new Error('only ' + on + ' of ' + N + ' players showed as online');
    await sleep(2500);
    const t1 = new Date();
    for (const v of vs) await v.close();
    vs.length = 0;
    await sleep(3000);
    const pk = sql("select n || '|' || at from private.online_peak where scope = 'site'");
    const [pn, pat] = pk.split('|');
    if (+pn !== N) fail = 'the server recorded a peak of ' + (pn || 'nothing') + ', expected ' + N;
    else if (new Date(pat) < new Date(t0.getTime() - 2000) || new Date(pat) > new Date(t1.getTime() + 2000)) fail = 'the peak time ' + pat + ' is outside the test window';
    if (!fail) {
      const o = await lib.player(b, 'owner', { init: () => { try { Object.keys(localStorage).filter(k => k.indexOf('gameplay:dock:') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} } });
      await o.page.goto(new URL('#/admin', lib.BASE).href);
      await o.page.waitForFunction(n => { const e = document.querySelector('#adupd'); return !!e && e.textContent.indexOf('peak ' + n + ' ') >= 0; }, N, { timeout: 60000 }).catch(() => {});
      const txt = await o.page.evaluate(() => (document.querySelector('#adupd') || {}).textContent || '');
      note = 'dashboard shows "' + txt + '"; recorded at ' + pat;
      if (txt.indexOf('peak ' + N + ' ') < 0) fail = 'the dashboard does not show the peak of ' + N + ' (' + note + ')';
      await o.close();
    }
  } catch (e) { fail = String(e && e.message || e).split('\n')[0]; }
  for (const v of vs) await v.close().catch(() => {});
  await b.close();
  console.log(fail ? 'FAIL peak: ' + fail : 'PASS peak: ' + N + ' players online with no dashboard open, then all closed; ' + note);
  process.exit(fail ? 1 : 0);
})();
