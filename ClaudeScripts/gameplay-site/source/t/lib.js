const { chromium } = (() => { for (const m of ['playwright', 'C:/tmp/pw/node_modules/playwright', '/opt/node22/lib/node_modules/playwright']) { try { return require(m); } catch (e) {} } throw new Error('playwright not found'); })();
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), zlib = require('zlib');
const BASE = process.env.SITE_URL || 'http://127.0.0.1:8080/';
const ARGS = process.platform === 'win32' ? ['--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] : process.env.SITE_GL === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] : ['--disable-gpu', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'];
async function launch(o = {}) { return chromium.launch(Object.assign(process.platform === 'win32' && !process.env.PW_BUNDLED ? { channel: 'chrome' } : {}, { headless: o.headless !== false, args: ARGS.concat(o.args || []) })); }
const NOPAD = () => { try { Object.defineProperty(navigator, 'getGamepads', { value: () => [], configurable: true }); } catch (e) {} };
async function visitor(browser, o = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: o.viewport || { width: 1366, height: 768 }, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile }, o.storageState ? { storageState: o.storageState } : {}));
  if (!o.gamepad) await ctx.addInitScript(NOPAD);
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
const P = 'Passw0rd123';
const USERS = { test: ['gp_tester@test.example.com', 'TestAcc0unt!'], test2: ['gp_tester2@test.example.com', 'TestAcc0unt!'], ann: ['ann@example.com', P], bob: ['bob@example.com', P], cat: ['cat@example.com', P], owner: ['tester1@example.com', P], dan: ['adm_dan@example.com', P], eve: ['adm_eve@example.com', P] };
const DIR = process.env.STATE_DIR || path.join(os.tmpdir(), 'gameplay-test-states');
const states = {};
const stateOf = who => { if (states[who]) return states[who]; try { return states[who] = JSON.parse(fs.readFileSync(path.join(DIR, who + '.json'), 'utf8')); } catch (e) { return null; } };
const keep = (who, st) => { states[who] = st; try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(path.join(DIR, who + '.json'), JSON.stringify(st)); } catch (e) {} };
async function player(browser, who, o = {}) {
  const st = o.fresh ? null : stateOf(who);
  const v = await visitor(browser, Object.assign({}, o, st ? { storageState: st } : {}));
  if (o.setup) await o.setup(v);
  await v.goto('', 600);
  if (!(await v.signedIn())) {
    try { await v.login(USERS[who][0], USERS[who][1]); }
    catch (e) { const st = await v.page.evaluate(() => ({ modal: !document.querySelector('#aumodal').hidden, note: document.querySelector('#aunote').textContent, up: document.querySelector('#auupnote').textContent, email: document.querySelector('#auemail').value, signed: !!(window.Ameplay && Ameplay.account.signedIn), ck: !document.querySelector('#ckbar').hidden })).catch(() => null); throw new Error('login failed for ' + who + ': ' + String(e.message).slice(0, 200) + ' | ' + JSON.stringify(st) + ' | ' + v.log.slice(-5).join(' | ')); }
  }
  await v.page.waitForTimeout(500);
  keep(who, await v.ctx.storageState());
  v.who = who;
  v.lobby = () => v.page.evaluate(() => { const l = document.querySelector('.g-lobby'); if (!l) return null; const q = s => l.querySelector(s); return { text: l.innerText.replace(/\s+/g, ' ').slice(0, 700), card: (q('.gl-card') || {}).className || '', code: (q('.gl-codetxt') || {}).textContent || '', pubSwitch: !!q('[data-n="pub"]'), joinBox: !!q('.gl-code-in'), players: [...l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat) .gl-who b i')].map(x => x.textContent), play: q('[data-n="play"]') ? !q('[data-n="play"]').disabled : null, hint: (q('.gl-hint') || {}).textContent || '' }; });
  v.net = () => v.page.evaluate(() => window.Ameplay && Ameplay.diag ? Ameplay.diag.dump().events.filter(e => e.k === 'net').map(e => e.d) : []);
  const tap = async (sel, text, ms = 90000) => { const t0 = Date.now(); for (;;) { const ok = await v.page.evaluate(([q, t]) => { const e = [...document.querySelectorAll(q)].find(x => (!t || (x.textContent || '').includes(t)) && x.getBoundingClientRect().width > 0 && !x.disabled); if (!e) return false; e.click(); return true; }, [sel, text || '']); if (ok) return true; if (Date.now() - t0 > ms) throw new Error('tap: not found ' + sel + ' ' + (text || '')); await v.page.waitForTimeout(250); } };
  v.tap = tap;
  v.toParty = async (game, btn) => { await v.openGame(game, 2000); await tap('#frame button', btn || 'Online party'); await v.page.waitForTimeout(500); if (!(await v.page.$('.g-lobby .gl-card'))) await tap('#frame button', 'Create or join a party', 8000).catch(() => {}); await v.page.waitForSelector('.g-lobby .gl-card', { timeout: 90000 }); await v.page.waitForTimeout(500); };
  v.click = async n => { await tap('.g-lobby [data-n="' + n + '"]'); await v.page.waitForTimeout(400); };
  v.waitLobby = async (n, ms = 120000) => { await v.page.waitForFunction(k => { const l = document.querySelector('.g-lobby .gl-lob'); return !!l && l.querySelectorAll('.gl-players .gl-pl:not(.gl-seat)').length >= k && !document.querySelector('.g-lobby .gl-codetxt.gl-pend'); }, n, { timeout: ms }); };
  v.ses = () => v.page.evaluate(() => sessionStorage.getItem('gameplay:netses'));
  return v;
}
const conf = () => {
  const f = process.env.STAGE_JSON;
  const o = f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  return { url: (process.env.STAGE_SB_URL || o.API_URL || 'http://127.0.0.1:54321').replace(/\/+$/, ''), key: process.env.STAGE_SB_KEY || o.PUBLISHABLE_KEY || o.ANON_KEY, service: process.env.STAGE_SERVICE_KEY || o.SERVICE_ROLE_KEY || o.SECRET_KEY };
};
async function call(path, { method = 'POST', body, token, key } = {}) {
  const c = conf(), k = key || c.key, h = { apikey: k, 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token; else if (/^eyJ/.test(k)) h.Authorization = 'Bearer ' + k;
  const r = await fetch(c.url + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
  if (!r.ok) { const e = new Error((j && (j.message || j.msg || j.error_description || j.error)) || 'HTTP ' + r.status); e.status = r.status; e.body = j; throw e; }
  return j;
}
const apiLogin = (email, password) => call('/auth/v1/token?grant_type=password', { body: { email, password } });
const signup = (email, password, data) => call('/auth/v1/signup', { body: { email, password, data } });
const rpc = (name, body, token) => call('/rest/v1/rpc/' + name, { body: body || {}, token });
const rest = (path, o) => call('/rest/v1/' + path, o);
const api = { conf, call, login: apiLogin, signup, rpc, rest };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.bin': 'application/octet-stream', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const HEAD = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN', 'Content-Security-Policy': "frame-ancestors 'self'; base-uri 'self'; object-src 'none'", 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=()' };
const gz = new Map();
function serve(root, port, o = {}) {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split(/[?#]/)[0]);
    let f = u === '/check' ? path.join(root, 'gameplay', 'check.html') : path.join(root, u);
    if (!f.startsWith(root)) { r.writeHead(403); r.end(); return; }
    let st = null;
    try { st = fs.statSync(f); if (st.isDirectory()) { f = path.join(f, 'index.html'); st = fs.statSync(f); } } catch (e) { st = null; }
    if (!st) { f = path.join(root, 'index.html'); }
    const ext = path.extname(f), asset = /[\\/]gameplay[\\/][^\\/]+\.(bin|js|json)$/.test(f);
    const send = () => {
      let body;
      try { body = fs.readFileSync(f); } catch (e) { r.writeHead(404); r.end('not found'); return; }
      const h = Object.assign({ 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': asset ? 'public, max-age=31536000, immutable' : 'no-cache' }, HEAD);
      if (/html|javascript|json|text|xml|svg/.test(h['content-type']) && /gzip/.test(q.headers['accept-encoding'] || '')) {
        const k = f + ':' + body.length + ':' + (st ? st.mtimeMs : 0);
        if (!gz.has(k)) gz.set(k, zlib.gzipSync(body, { level: 6 }));
        body = gz.get(k); h['content-encoding'] = 'gzip';
      }
      h['content-length'] = body.length;
      r.writeHead(200, h); r.end(q.method === 'HEAD' ? undefined : body);
    };
    const d = typeof o.delay === 'function' ? o.delay(u) : o.delay || 0;
    if (d) setTimeout(send, d); else send();
  });
  return new Promise(res => srv.listen(port, o.host || '127.0.0.1', () => res(srv)));
}
const WIN = process.platform === 'win32';
const GAME_LAUNCH = WIN ? { channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] } : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] };
const VENDOR = path.join(__dirname, '..', 'w', 'vendor');
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const UID = 'aaaaaaaa-0000-0000-0000-000000000001';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = () => Math.floor(Date.now() / 1000) + 7200;
const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'tester@example.com', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: new Date().toISOString() };
const session = () => ({ access_token: 'eyJhbGciOiJIUzI1NiJ9.' + b64({ sub: UID, role: 'authenticated', exp: exp() }) + '.sig', token_type: 'bearer', expires_in: 7200, expires_at: exp(), refresh_token: 'r', user });

async function open(html, id, o = {}) {
  const mockStats = {};
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
  const b = await chromium.launch(Object.assign({ headless: o.headless !== false }, GAME_LAUNCH));
  const vp = o.viewport || { width: 1280, height: 800 };
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile });
  if (!o.gamepad) await ctx.addInitScript(NOPAD);
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
    if (p === '/rest/v1/rpc/diag_enabled') return j(200, o.diag !== false);
    if (p === '/rest/v1/rpc/diag_push') return j(200, 0);
    if (p === '/rest/v1/rpc/sync_game_stats') {
      let body = null; try { body = q.postDataJSON(); } catch (e) {}
      (body && Array.isArray(body.p_rows) ? body.p_rows : []).forEach(r => {
        if (!r || typeof r.game_id !== 'string') return;
        const m = mockStats[r.game_id] || (mockStats[r.game_id] = { user_id: UID, game_id: r.game_id, plays: 0, seconds_played: 0, best_score: null, best_better: r.better === 'low' ? 'low' : 'high', last_played: null });
        m.plays += +r.plays || 0; m.seconds_played += +r.seconds || 0;
        if (typeof r.best === 'number') m.best_score = m.best_score == null ? r.best : (m.best_better === 'low' ? Math.min(m.best_score, r.best) : Math.max(m.best_score, r.best));
        if (r.last_played) m.last_played = r.last_played;
      });
      return j(200, Object.values(mockStats));
    }
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
  const diag = kinds => page.evaluate(k => { const d = window.Ameplay && Ameplay.diag ? Ameplay.diag.dump().events : []; return k ? d.filter(e => k.includes(e.k)) : d; }, kinds || null);
  const fps = async () => { const f = (await diag(['fps'])).map(e => e.d); return f.length ? { samples: f.length, avg: Math.round(f.reduce((a, x) => a + x.fps, 0) / f.length * 10) / 10, min: Math.min(...f.map(x => x.fps)), worstFrameMs: Math.max(...f.map(x => x.worst)), slowFrames: f.reduce((a, x) => a + x.slow, 0) } : null; };
  const cost = async (ms = 5000) => {
    await page.evaluate(() => {
      if (window.__gpCost) { window.__gpCost.f = []; return; }
      const C = window.__gpCost = { f: [], cur: 0, on: false }, R = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = cb => R(t => { const a = performance.now(); try { cb(t); } finally { C.cur += performance.now() - a; if (!C.on) { C.on = true; Promise.resolve().then(() => { C.on = false; C.f.push(C.cur); C.cur = 0; }); } } });
    });
    await page.waitForTimeout(ms);
    return page.evaluate(() => { const f = window.__gpCost.f.slice().sort((a, b) => a - b), n = f.length; if (!n) return null; const r = x => Math.round(x * 100) / 100; return { frames: n, avgMs: r(f.reduce((a, x) => a + x, 0) / n), p50Ms: r(f[Math.floor(n * .5)]), p95Ms: r(f[Math.floor(n * .95)]), maxMs: r(f[n - 1]) }; });
  };
  return { page, ctx, browser: b, errs, frame, start, shot, close, base, diag, fps, cost };
}
async function playCli([html, id, out, steps]) {
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
}
const CTX_LAUNCH = WIN ? { channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] } : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] };
const THREE = () => fs.readFileSync(path.join(__dirname, '..', 'w', 'vendor', 'three-r128.min.js'), 'utf8');
async function launchCtx(opts = {}) {
  const b = await chromium.launch(CTX_LAUNCH);
  const ctx = await b.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  if (!opts.gamepad) await ctx.addInitScript(NOPAD);
  await ctx.route(/three(\.min)?\.js|peerjs/, r => {
    if (/three/.test(r.request().url())) r.fulfill({ status: 200, contentType: 'application/javascript', body: THREE() });
    else r.abort();
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  return { b, ctx };
}
const T = 'TestAcc0unt!';
const STAGE_USERS = [
  ['gp_tester@test.example.com', T, 'gp_tester', 'user', true],
  ['gp_tester2@test.example.com', T, 'gp_tester2', 'user', true],
  ['ann@example.com', P, 'ann_player', 'user'],
  ['bob@example.com', P, 'bob_player', 'user'],
  ['cat@example.com', P, 'cat_player', 'user'],
  ['tester1@example.com', P, 'tester1', 'owner'],
  ['adm_dan@example.com', P, 'adm_dan', 'admin'],
  ['adm_eve@example.com', P, 'adm_eve', 'admin']
];
const extra = +(process.env.EXTRA_USERS || 0);
for (let i = 1; i <= extra; i++) STAGE_USERS.push(['load' + i + '@example.com', P, 'load_player' + i, 'user']);
async function users() {
  const c = conf(), DBC = process.env.STAGE_DB || 'supabase_db_staging';
  const sql = q => require('child_process').execFileSync('docker', ['exec', '-i', DBC, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atqc', q]).toString().trim();
  for (const [email, password, username, role, test] of STAGE_USERS) {
    let id = sql("select id from auth.users where email = '" + email + "'");
    if (!id) {
      const r = await fetch(c.url + '/auth/v1/admin/users', { method: 'POST', headers: { apikey: c.service, Authorization: 'Bearer ' + c.service, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { username } }) });
      const j = await r.json();
      if (!r.ok) { console.log('could not create', email, JSON.stringify(j).slice(0, 200)); continue; }
      id = j.id;
    }
    sql("update public.profiles set username = '" + username + "', role = '" + role + "' where id = '" + id + "'");
    if (test) sql("insert into public.test_accounts (user_id, email, password, note) values ('" + id + "', '" + email + "', 'x', 'staging') on conflict (user_id) do nothing"); if (test) sql("update public.test_accounts set diag = true where user_id = '" + id + "'");
    console.log(email, username, role, id);
  }
  const pl = ['ann_player', 'bob_player', 'cat_player'].map(u => sql("select id from public.profiles where username = '" + u + "'")).filter(Boolean);
  for (const x of pl) for (const y of pl) if (x !== y) sql("insert into public.friends (user_id, friend_id) values ('" + x + "', '" + y + "') on conflict do nothing");
  console.log('friends:', pl.length, 'players');
}
module.exports = { chromium, BASE, launch, visitor, player, USERS, api, serve, open, launchCtx, users };
if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  (async () => {
    if (cmd === 'serve') {
      const root = path.resolve(a[0] || path.join(__dirname, '..', 'w', 'site_stage')), port = +a[1] || 8080;
      await serve(root, port, { delay: +process.env.DELAY || 0 });
      console.log('serving ' + root + ' on http://127.0.0.1:' + port);
    } else if (cmd === 'users') await users();
    else if (cmd === 'login') { const s = await apiLogin(a[0], a[1]); console.log(JSON.stringify({ uid: s.user.id, token: s.access_token })); }
    else if (cmd === 'rpc') { const s = a[2] ? await apiLogin(a[2], a[3]) : null; console.log(JSON.stringify(await rpc(a[0], JSON.parse(a[1] || '{}'), s && s.access_token), null, 1)); }
    else if (cmd === 'play') await playCli(a);
    else console.log('usage: node lib.js serve [dir] [port] | users | login <email> <password> | rpc <name> <json> [email password] | play <html> <game-id> <shot dir> [steps json]');
  })().catch(e => { console.error('ERROR', e.status || '', e.message, JSON.stringify(e.body || '')); process.exit(1); });
}
