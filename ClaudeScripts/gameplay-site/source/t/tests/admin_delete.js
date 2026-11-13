const lib = require('../lib.js');
const { execFileSync } = require('child_process');
const DBC = process.env.STAGE_DB || 'supabase_db_staging';
const sql = q => execFileSync('docker', ['exec', '-i', DBC, 'psql', '-U', 'postgres', '-d', 'postgres', '-Atqc', q]).toString().trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const c = lib.api.conf(), tag = Date.now().toString(36).slice(-5);
  const made = [];
  for (const k of ['a', 'b', 'c']) {
    const email = 'del_' + k + tag + '@example.com', username = 'del_' + k + tag;
    const r = await fetch(c.url + '/auth/v1/admin/users', { method: 'POST', headers: { apikey: c.service, Authorization: 'Bearer ' + c.service, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Passw0rd123', email_confirm: true }) });
    const j = await r.json();
    if (!r.ok) throw new Error('could not create ' + email + ': ' + JSON.stringify(j));
    sql("update public.profiles set username = '" + username + "' where id = '" + j.id + "'");
    made.push({ id: j.id, username });
  }
  const b = await lib.launch();
  let fail = null;
  try {
    const o = await lib.player(b, 'owner', { init: () => { try { Object.keys(localStorage).filter(k => k.indexOf('gameplay:dock:') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} } });
    await o.page.goto(new URL('#/admin', lib.BASE).href);
    await o.page.waitForSelector('#adt tbody tr[data-uid]', { timeout: 60000 });
    for (const [i, u] of made.entries()) {
      await o.page.fill('#adq', u.username);
      await o.page.waitForSelector('#adt tr[data-uid="' + u.id + '"]', { timeout: 30000 });
      await o.page.click('#adt tr[data-uid="' + u.id + '"]');
      await o.page.waitForSelector('#adpanel:not([hidden])', { timeout: 20000 });
      const st = await o.page.evaluate(() => { const d = document.querySelector('#addelb'); return { busy: d.classList.contains('is-busy'), disabled: d.disabled, pe: getComputedStyle(d).pointerEvents }; });
      if (st.busy || st.disabled || st.pe === 'none') { fail = 'card ' + (i + 1) + ' opened with the delete button stuck: ' + JSON.stringify(st); break; }
      await o.page.fill('#addel', u.username);
      await o.page.click('#addelb', { timeout: 5000 });
      await o.page.click('#addelb', { timeout: 5000 });
      await o.page.waitForFunction(id => !document.querySelector('#adt tr[data-uid="' + id + '"]') && document.querySelector('#adpanel').hidden, u.id, { timeout: 30000 });
      if (sql("select count(*) from auth.users where id = '" + u.id + "'") !== '0') { fail = 'account ' + u.username + ' still exists after deletion'; break; }
      await sleep(400);
    }
    if (!fail) {
      await o.page.fill('#adq', '');
      await o.page.waitForSelector('#adt tbody tr[data-uid]', { timeout: 30000 });
      await o.page.click('#adt tbody tr[data-uid]');
      await o.page.waitForSelector('#adpanel:not([hidden])', { timeout: 20000 });
      const busy = await o.page.evaluate(() => [...document.querySelectorAll('#adpanel .is-busy')].map(e => e.id || e.className));
      if (busy.length) fail = 'another card opened with busy controls after three deletions: ' + busy.join(', ');
    }
  } catch (e) { fail = String(e && e.message || e).split('\n')[0]; }
  for (const u of made) sql("delete from auth.users where id = '" + u.id + "'");
  await b.close();
  console.log(fail ? 'FAIL admin delete: ' + fail : 'PASS admin delete: three accounts deleted in a row without a reload, each next card opened normally');
  process.exit(fail ? 1 : 0);
})();
