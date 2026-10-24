const { chromium } = require('C:/tmp/pw/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const VENDOR = path.join(__dirname, '..', 'w', 'vendor');
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const UID = 'aaaaaaaa-0000-0000-0000-000000000001';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = () => Math.floor(Date.now() / 1000) + 7200;
const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'tester@example.com', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: new Date().toISOString() };
const session = () => ({ access_token: 'eyJhbGciOiJIUzI1NiJ9.' + b64({ sub: UID, role: 'authenticated', exp: exp() }) + '.sig', token_type: 'bearer', expires_in: 7200, expires_at: exp(), refresh_token: 'r', user });

async function open(html, id, o = {}) {
  const root = path.dirname(path.resolve(html)), main = path.basename(html);
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split(/[?#]/)[0]);
    let f = path.join(root, u);
    const v = path.join(VENDOR, path.basename(u));
    if (/^\/gameplay\//.test(u) && fs.existsSync(v)) f = v;
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, main);
    r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/' + main;
  const b = await chromium.launch({ channel: 'chrome', headless: o.headless !== false, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const vp = o.viewport || { width: 1280, height: 800 };
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile });
  await ctx.addInitScript(([s, muted, name]) => {
    try {
      if (name) localStorage.setItem('gameplay:profile', JSON.stringify({ username: name, displayName: name }));
      localStorage.setItem('sb-gameplay-auth', JSON.stringify(s));
      localStorage.setItem('gameplay:consent', JSON.stringify({ v: 2, analytics: false, level: 'essential', terms: true, at: Date.now() }));
      if (muted) { const v = JSON.parse(localStorage.getItem('gameplay:v1') || '{}'); v.muted = true; localStorage.setItem('gameplay:v1', JSON.stringify(v)); }
    } catch (e) {}
  }, [session(), o.muted !== false, o.name || null]);
  await ctx.route(o.peer ? /fonts\.(googleapis|gstatic)\.com|geojs\.io/ : /fonts\.(googleapis|gstatic)\.com|peerjs\.com|geojs\.io/, r => r.abort());
  await ctx.routeWebSocket(/realtime\/v1\/websocket/, w => w.onMessage(m => {
    let x; try { x = JSON.parse(m); } catch (e) { return; }
    const arr = Array.isArray(x), msg = arr ? { join_ref: x[0], ref: x[1], topic: x[2] } : x;
    w.send(JSON.stringify(arr ? [msg.join_ref, msg.ref, msg.topic, 'phx_reply', { status: 'ok', response: {} }] : { topic: msg.topic, event: 'phx_reply', payload: { status: 'ok', response: {} }, ref: msg.ref, join_ref: msg.join_ref }));
  }));
  await ctx.route(/supabase\.co\//, async rt => {
    const q = rt.request(), p = new URL(q.url()).pathname;
    const j = (s, v) => rt.fulfill({ status: s, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(v) });
    if (q.method() === 'OPTIONS') return rt.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    if (p === '/auth/v1/settings') return j(200, { external: { email: true, google: true } });
    if (p === '/auth/v1/user') return j(200, user);
    if (p === '/auth/v1/token') return j(200, session());
    if (p === '/rest/v1/rpc/touch_presence' || p === '/rest/v1/rpc/my_status') return j(200, [{ role: 'user', locked: false, locked_reason: null }]);
    if (p.startsWith('/rest/v1/profiles')) return j(200, [{ id: UID, username: 'tester', display_name: 'Tester', avatar_url: null, created_at: new Date().toISOString() }]);
    if (p.startsWith('/rest/v1/rpc/')) return j(200, null);
    return j(200, []);
  });
  if (o.setup) await o.setup(ctx);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + (e.stack || e.message).slice(0, 600)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fonts\.g|peerjs/i.test(m.text())) errs.push('ERR ' + m.text().slice(0, 300)); });
  await page.goto(base + '#/' + id);
  await page.waitForTimeout(o.wait || 3000);
  for (const t of ['Only essentials', 'Accept all']) { const e = page.getByText(t, { exact: true }).first(); if (await e.isVisible().catch(() => false)) { await e.click().catch(() => {}); break; } }
  const frame = () => page.evaluate(() => { const r = (document.querySelector('#frame canvas') || document.querySelector('#frame .g-root') || document.querySelector('#frame')).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const start = async () => { const s = await page.$('.g-overlay.show [data-a="1"]'); if (s) await s.click().catch(() => {}); };
  let n = 0;
  const shot = async (dir, name, full) => { fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, (name || String(++n).padStart(3, '0')) + '.png'); if (full) await page.screenshot({ path: f }); else { const r = await frame(); await page.screenshot({ path: f, clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.max(1, r.w), height: Math.max(1, r.h) } }); } return f; };
  const close = async () => { await b.close(); srv.close(); };
  return { page, ctx, browser: b, errs, frame, start, shot, close, base };
}
module.exports = { open };

if (require.main === module) {
  const [html, id, out, steps] = process.argv.slice(2);
  (async () => {
    const g = await open(html, id);
    await g.start();
    await g.page.waitForTimeout(1500);
    for (const [k, a, c] of JSON.parse(steps || '[["wait",3000],["shot"]]')) {
      if (k === 'wait') await g.page.waitForTimeout(a);
      else if (k === 'press') await g.page.keyboard.press(a);
      else if (k === 'down') await g.page.keyboard.down(a);
      else if (k === 'up') await g.page.keyboard.up(a);
      else if (k === 'click') { const r = await g.frame(); await g.page.mouse.click(r.x + a * r.w, r.y + c * r.h); }
      else if (k === 'eval') console.log(JSON.stringify(await g.page.evaluate(a)));
      else if (k === 'shot') console.log(await g.shot(out, a));
    }
    console.log(g.errs.length ? g.errs.join('\n') : 'no errors');
    await g.close();
  })();
}
