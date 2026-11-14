const lib = require('../lib.js');
(async () => {
  const b = await lib.launch();
  const out = [], fail = [];
  const must = (ok, m) => { (ok ? out : fail).push(m); };
  try {
    for (const mode of ['missing', 'present']) {
      let asked = 0;
      const v = await lib.visitor(b, { setup: null });
      if (mode === 'missing') {
        await v.page.route(/\/functions\/v1\/login/, r => r.fulfill({ status: 404, contentType: 'application/json', body: '{"code":"NOT_FOUND","message":"Requested function was not found"}' }));
        await v.page.route(/\/rest\/v1\/rpc\/login_email/, r => { asked++; return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(lib.USERS.ann[0]) }); });
      }
      await v.goto('', 1500);
      await v.consent();
      await v.page.waitForSelector('#aumodal:not([hidden])', { timeout: 60000 });
      if (!(await v.page.locator('#auform').isVisible().catch(() => false))) await v.page.locator('[data-aumode="in"]').first().click();
      await v.page.fill('#auemail', 'ann_player');
      await v.page.fill('#aupass', lib.USERS.ann[1]);
      await v.page.locator('#auform button[type=submit]').click();
      const ok = await v.page.waitForFunction(() => window.Ameplay && Ameplay.account && Ameplay.account.signedIn, null, { timeout: 30000 }).then(() => true, () => false);
      const who = ok ? await v.page.evaluate(() => Ameplay.account.username) : await v.page.evaluate(() => (document.querySelector('#aunote') || {}).textContent);
      must(ok && (mode === 'present' || asked === 1), 'username sign-in with the login function ' + mode + ': ' + who + (mode === 'missing' ? ' (old lookup used ' + asked + 'x)' : ''));
      await v.close();
    }
  } catch (e) { fail.push('error: ' + String(e && e.message || e).split('\n')[0]); }
  await b.close();
  out.forEach(m => console.log('PASS ' + m));
  fail.forEach(m => console.log('FAIL ' + m));
  console.log(fail.length ? fail.length + ' failing' : 'all passing');
  process.exit(fail.length ? 1 : 0);
})();
