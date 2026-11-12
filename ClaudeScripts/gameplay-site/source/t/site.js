const { chromium } = (() => { for (const m of ['playwright', 'C:/tmp/pw/node_modules/playwright', '/opt/node22/lib/node_modules/playwright']) { try { return require(m); } catch (e) {} } throw new Error('playwright not found'); })();
const fs = require('fs'), path = require('path');
const BASE = process.env.SITE_URL || 'http://127.0.0.1:8080/';
const ARGS = process.platform === 'win32' ? ['--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];
async function launch(o = {}) { return chromium.launch({ headless: o.headless !== false, args: ARGS.concat(o.args || []) }); }
async function visitor(browser, o = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: o.viewport || { width: 1366, height: 768 }, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile }, o.storageState ? { storageState: o.storageState } : {}));
  if (!o.gpuProbe) await ctx.addInitScript(() => { try { if (!localStorage.getItem('gameplay:gpu')) localStorage.setItem('gameplay:gpu', JSON.stringify({ r: 'test renderer', mtex: 8192, glx: 30, gv: '' })); } catch (e) {} });
  if (o.init) await ctx.addInitScript(o.init);
  const tune = p => { const wf = p.waitForFunction.bind(p); p.waitForFunction = (fn, arg, opt) => wf(fn, arg, Object.assign({ polling: 250 }, opt || {})); return p; };
  ctx.on('page', tune);
  const page = tune(await ctx.newPage());
  const log = [], t0 = Date.now(), T = () => ((Date.now() - t0) / 1000).toFixed(2);
  page.on('console', m => { const k = m.type(); if (k === 'error' || k === 'warning') log.push(T() + ' console.' + k + ' ' + m.text().slice(0, 400)); });
  page.on('pageerror', e => log.push(T() + ' pageerror ' + String(e && e.stack || e).slice(0, 600)));
  page.on('requestfailed', r => { const f = r.failure(); if (!f || !/ERR_ABORTED/.test(f.errorText)) log.push(T() + ' reqfailed ' + r.url().slice(0, 160) + ' ' + (f && f.errorText)); });
  page.on('response', r => { if (r.status() >= 400) log.push(T() + ' http ' + r.status() + ' ' + r.request().method() + ' ' + r.url().slice(0, 160)); });
  const shot = async (dir, name, full) => { fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, name + '.png'); await page.screenshot({ path: f, fullPage: !!full, timeout: 120000 }); return f; };
  const text = async n => (await page.evaluate(() => document.body ? document.body.innerText : '')).replace(/\s+/g, ' ').slice(0, n || 400);
  const consent = async () => { const ck = page.locator('#ckterms'); if (await ck.isVisible().catch(() => false)) { await ck.check(); await page.locator('[data-ckc]').first().click(); await page.waitForTimeout(300); } };
  const ready = async (ms = 120000) => { await page.waitForFunction(() => window.Ameplay && Ameplay.debug && document.querySelector('#top'), null, { timeout: ms }); };
  const goto = async (u, w) => { await page.goto(new URL(u || '', BASE).href); await ready(); if (w) await page.waitForTimeout(w); };
  const login = async (email, password) => {
    await consent();
    await page.waitForSelector('#aumodal:not([hidden])', { timeout: 60000 });
    if (!(await page.locator('#auform').isVisible().catch(() => false))) await page.locator('[data-aumode="in"]').first().click();
    await page.fill('#auemail', email);
    await page.fill('#aupass', password);
    await page.locator('#auform button[type=submit]').click();
    await page.waitForFunction(() => window.Ameplay && Ameplay.account && Ameplay.account.signedIn, null, { timeout: 180000 });
    await page.waitForTimeout(600);
  };
  const signedIn = () => page.evaluate(() => !!(window.Ameplay && Ameplay.account && Ameplay.account.signedIn));
  const openGame = async (id, w = 2500) => { await page.evaluate(i => Ameplay.debug.open(i), id); await page.waitForSelector('#frame .g-root', { timeout: 60000 }); await page.waitForTimeout(w); };
  const startGame = async () => { const s = await page.$('.g-overlay.show [data-a="1"]'); if (s) await s.click().catch(() => {}); };
  const frame = () => page.evaluate(() => { const r = (document.querySelector('#frame canvas') || document.querySelector('#frame .g-root') || document.querySelector('#frame')).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const diag = () => page.evaluate(() => window.Ameplay && Ameplay.diag ? Object.assign({ n: Ameplay.diag.dump().events.length }, Ameplay.diag.stats()) : null);
  return { ctx, page, log, shot, text, consent, ready, goto, login, signedIn, openGame, startGame, frame, diag, close: () => ctx.close() };
}
module.exports = { launch, visitor, BASE, chromium };
