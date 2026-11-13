const { launch, visitor, BASE } = require('../lib.js');
const SB = process.env.STAGE_SB_URL || 'http://127.0.0.1:54321';
const EMAIL = process.env.TEST_EMAIL || 'gp_tester@test.example.com', PASS = process.env.TEST_PASS || 'TestAcc0unt!';
const probe = () => {
  if (document.documentElement.getAttribute('data-boot') === 'check') return 'site-skeleton';
  const vis = s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05; };
  const au = document.querySelector('#aumodal');
  let view = null;
  if (au && vis('#aumodal')) view = ['auform', 'auupform', 'acform', 'aurform', 'anform'].find(id => vis('#' + id)) || 'wait';
  return [vis('#f') ? 'password' : '', vis('#sp') ? 'gate-skeleton' : '', view ? 'auth:' + view : '', vis('#sfalert') ? 'alert' : '', vis('#sfbar') ? 'banner' : '', vis('#top') && !view ? 'site' : ''].filter(Boolean).join('+') || 'blank';
};
async function timeline(page, ms) {
  const out = [], t0 = Date.now();
  while (Date.now() - t0 < ms) {
    let s = 'nav';
    try { s = await page.evaluate(probe); } catch (e) {}
    if (!out.length || out[out.length - 1][1] !== s) out.push([Date.now() - t0, s]);
    await new Promise(r => setTimeout(r, 25));
  }
  return out;
}
const slow = async (ctx, ms) => ctx.route(u => u.href.indexOf(SB) === 0, async r => { await new Promise(x => setTimeout(x, ms)); try { await r.continue(); } catch (e) {} });
async function run(name, browser, o, check) {
  const v = await visitor(browser, o.state ? { storageState: o.state } : {});
  if (o.delay) await slow(v.ctx, o.delay);
  if (o.before) await o.before(v);
  const nav = v.page.goto(BASE, { waitUntil: 'commit' }).catch(() => {});
  const tl = await timeline(v.page, o.ms || 7000);
  await nav;
  const seen = [...new Set(tl.map(x => x[1]))];
  const bad = check(seen, tl);
  console.log((bad ? 'FAIL ' : 'PASS ') + name + (bad ? ': ' + bad : '') + '\n     ' + tl.map(x => x[0] + 'ms ' + x[1]).join(' -> '));
  const st = o.keep ? await v.ctx.storageState() : null;
  await v.close();
  return { bad, st };
}
(async () => {
  const b = await launch();
  let fails = 0;
  const has = (seen, re) => seen.some(s => re.test(s));
  const r1 = await run('new visitor, gate open, slow backend: no password form, straight to sign-up', b, { delay: 2500, ms: 9000 }, seen => has(seen, /password/) ? 'password form was shown' : has(seen, /^site|\+site/) ? 'the site shell was shown before the sign-up screen' : has(seen, /auth:auform/) ? 'the login form flashed before sign-up' : !has(seen, /auth:auupform/) ? 'sign-up never appeared' : '');
  fails += r1.bad ? 1 : 0;
  const r1b = await run('visitor who had an account before, signed out: straight to the login form', b, { ms: 6000, before: v => v.ctx.addInitScript(() => { try { localStorage.setItem('gameplay:reset', '4'); localStorage.setItem('gameplay:acct', '1'); } catch (e) {} }) }, seen => has(seen, /password/) ? 'password form was shown' : has(seen, /^site|\+site/) ? 'the site shell was shown first' : has(seen, /auth:auupform/) ? 'the sign-up form flashed' : !has(seen, /auth:auform/) ? 'login never appeared' : '');
  fails += r1b.bad ? 1 : 0;
  const v = await visitor(b);
  await v.goto('', 800);
  await v.login(EMAIL, PASS);
  await v.page.waitForTimeout(1500);
  const state = await v.ctx.storageState();
  await v.close();
  const r2 = await run('returning signed-in user, slow backend: no password form, no login screen', b, { state, delay: 2500, ms: 9000 }, seen => has(seen, /password/) ? 'password form was shown' : has(seen, /auth:/) ? 'an auth screen was shown: ' + seen.filter(s => /auth:/.test(s)).join(',') : !has(seen, /site/) ? 'site never appeared' : '');
  fails += r2.bad ? 1 : 0;
  const r3 = await run('returning signed-in user, fast backend: no auth screen', b, { state, ms: 5000 }, seen => has(seen, /password|auth:/) ? 'flash: ' + seen.join(',') : !has(seen, /site/) ? 'site never appeared' : '');
  fails += r3.bad ? 1 : 0;
  const bad = JSON.parse(JSON.stringify(state));
  bad.origins.forEach(o => o.localStorage.forEach(e => { if (e.name === 'sb-gameplay-auth') { const s = JSON.parse(e.value); s.access_token = 'x.y.z'; s.refresh_token = 'revoked'; s.expires_at = 1; e.value = JSON.stringify(s); } }));
  const r4 = await run('stored session expired and refused: skeleton, then the login form (no site, no password form)', b, { state: bad, delay: 1200, ms: 9000 }, seen => has(seen, /password/) ? 'password form was shown' : has(seen, /^site$|\+site$/) ? 'the site was shown before the login form' : !has(seen, /auth:auform/) ? 'login form never appeared: ' + seen.join(',') : '');
  fails += r4.bad ? 1 : 0;
  await b.close();
  console.log(fails ? fails + ' failing' : 'all passing');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
