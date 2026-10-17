const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const [src, out] = process.argv.slice(2);
const pass = process.env.GATE_PASS;
const plan = JSON.parse(fs.readFileSync(path.join(src, 'plan.json'), 'utf8'));
const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const dirOut = path.join(out, plan.dir);
fs.mkdirSync(out, { recursive: true });
fs.rmSync(dirOut, { recursive: true, force: true });
fs.mkdirSync(dirOut, { recursive: true });
const manifest = [];
const put = (rel, buf) => {
  fs.writeFileSync(path.join(out, rel), buf);
  manifest.push(rel + ' ' + buf.length + ' ' + crypto.createHash('sha256').update(buf).digest('hex'));
};
const fonts = (/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/.exec(html) || [])[1] || '';
if (!pass) {
  plan.files.forEach(f => put(plan.dir + f, fs.readFileSync(path.join(src, 'files', f))));
  const page = html.replace('"%%GPKEY%%"', 'null');
  fs.writeFileSync(path.join(out, 'index.html'), page);
  fs.writeFileSync(path.join(dirOut, 'manifest.txt'), manifest.join('\n') + '\n');
  console.log('gate2: public build', out, 'index', page.length, 'files', plan.files.length);
  process.exit(0);
}
const salt = Buffer.from('gameplay-gate-v1');
const iter = 310000;
const key = crypto.pbkdf2Sync(Buffer.from(pass, 'utf8'), salt, iter, 32, 'sha256');
const seal = buf => {
  const gz = zlib.gzipSync(buf, { level: 9 });
  const iv = crypto.createHmac('sha256', key).update(gz).digest().subarray(0, 12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  return { gz, iv, ct: Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]) };
};
let total = 0;
plan.files.forEach(f => {
  const { iv, ct } = seal(fs.readFileSync(path.join(src, 'files', f)));
  const base = f.replace(/\.[a-z0-9]+$/i, '');
  const buf = Buffer.concat([iv, ct]);
  total += buf.length;
  put(plan.dir + base + '.bin', buf);
});
const pre = plan.pre || (plan.packs || []).slice(0, 6);
const { gz, iv, ct } = seal(Buffer.from(html, 'utf8'));
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>gameplay</title>
${fonts ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' : ''}<style>
:root{color-scheme:light;--bg:#f6f4ff;--card:#fff;--ink:#17142b;--muted:#6b6785;--accent:#6d4cf5;--ink-a:#fff;--line:#e6e2f6;--bad:#d93a4a;--soft:#ece8ff}
:root.dk{color-scheme:dark;--bg:#12101f;--card:#1b182d;--ink:#f0eeff;--muted:#a29fc0;--accent:#8e74ff;--ink-a:#12101f;--line:#2f2a50;--bad:#ff6b7a;--soft:#2b2552}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);font:16px/1.4 "Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.c{width:100%;max-width:360px;padding:32px 24px;border-radius:22px;background:var(--card);border:1px solid var(--line);box-shadow:0 24px 60px -30px rgba(31,29,43,.45);text-align:center}
.lg{display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;font-weight:800;font-size:22px;letter-spacing:-.03em}
.lg i{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--accent);color:var(--ink-a);font-style:normal;font-size:14px}
h1{margin:0 0 6px;font-size:20px}p{margin:0 0 18px;color:var(--muted);font-size:14px}
input{width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid var(--line);background:transparent;color:inherit;font-size:16px;outline:none}
input{font-family:inherit}input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(109,76,245,.2)}
button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:12px;background:var(--accent);color:var(--ink-a);font-weight:800;font-size:16px;font-family:inherit;cursor:pointer}
button:disabled{opacity:.6;cursor:default}
.m{min-height:20px;margin:12px 0 0;font-size:14px;color:var(--muted)}.m.b{color:var(--bad)}
.c{animation:in .45s cubic-bezier(.22,.8,.2,1)}@keyframes in{from{opacity:0;transform:translateY(12px) scale(.97)}}
button{transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .2s}button:active{transform:scale(.97)}
.sp{position:fixed;inset:0;display:grid;place-items:center;padding:16px;animation:fade .3s .2s backwards}
.sp[hidden]{display:none}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fade{from{opacity:0}}
.sp>div{width:min(481px,100%);padding:40px;border-radius:26px;background:var(--card);border:1px solid var(--line);box-shadow:0 14px 36px -10px rgba(60,40,150,.12)}
.sp i{display:block;height:52px;margin-top:16px;border-radius:11px;background:var(--soft) linear-gradient(100deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%) 0 0/300% 100% no-repeat;animation:sh 1.5s linear infinite}
.sp i:first-child{width:62%;height:34px;margin:0}.sp i:nth-child(2){width:88%;height:15px;margin:14px 0 28px}
@keyframes sh{from{background-position:100% 0}to{background-position:0 0}}
button.bz{position:relative;color:transparent}button.bz::after{content:"";position:absolute;inset:0;margin:auto;width:18px;height:18px;border-radius:50%;border:2.5px solid var(--ink-a);border-right-color:transparent;animation:spin .7s linear infinite}
@media (prefers-reduced-motion:reduce){.sp i,button.bz::after{animation:none}}
.pw{-webkit-text-security:disc;text-security:disc}.shake{animation:sh .35s}@keyframes sh{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
</style><script>try{var t=(JSON.parse(localStorage.getItem('gameplay:v1')||'{}')||{}).prefs||{};if(t.theme==='dark'||(t.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.className='dk'}catch(e){}</script></head><body>
<div class="sp" id="sp" hidden aria-label="Loading"><div><i></i><i></i><i></i><i></i><i></i></div></div><form class="c" id="f" autocomplete="off"><div class="lg"><i>&#9654;</i>gameplay</div><h1 id="h">Enter the password</h1><p id="t">This site is private.</p><input id="p" class="pw" type="text" name="gp-site-code" placeholder="Password" autofocus aria-label="Password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-bwignore data-form-type="other"><button id="b">Unlock</button><div class="m" id="m"></div></form>
<script>
(() => {
  const D = { s: '${salt.toString('base64')}', i: '${iv.toString('base64')}', n: ${iter}, c: '${ct.toString('base64')}', d: ${JSON.stringify(plan.dir)}, p: ${JSON.stringify(pre)} };
  const K = 'gameplay:gate', MAX = 5;
  const $ = id => document.getElementById(id);
  const b64 = s => { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };
  const enc = u => btoa(String.fromCharCode.apply(null, u));
  const rd = () => { let o = {}; try { o = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) {} const ck = (document.cookie.match(/gpgate=(\\d+)/) || [])[1]; if (ck && +ck > (o.f || 0)) o.f = +ck; return o; };
  const wr = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) {} try { document.cookie = 'gpgate=' + (o.f || 0) + ';max-age=31536000;path=/;SameSite=Lax'; } catch (e) {} };
  let st = rd();
  const lock = () => { $('h').textContent = 'Locked'; $('t').textContent = 'Too many wrong passwords on this computer.'; $('p').remove(); $('b').remove(); $('m').textContent = ''; };
  const warm = () => {
    if (window.__gpPre) return;
    let paths = false;
    try { paths = sessionStorage.getItem('gameplay:paths') === '1'; } catch (e) {}
    paths = paths || /(^|\\.)(web\\.app|firebaseapp\\.com)$/i.test(location.hostname);
    if (/^#\\/[\\w-]/.test(location.hash) || (paths && location.pathname.replace(/\\//g, ''))) return;
    const root = paths ? location.origin + '/' : new URL('.', location.href).href;
    window.__gpPre = {};
    D.p.forEach(f => { const p = fetch(root + D.d + f + '.bin').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }); p.catch(() => {}); window.__gpPre[f] = p; });
  };
  const put = (txt, raw) => { txt = txt.replace('"%%GPKEY%%"', JSON.stringify(enc(raw))); document.open(); document.write(txt); document.close(); };
  const show = async raw => {
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(D.i) }, key, b64(D.c));
    return new Response(new Blob([pt]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  };
  const derive = async pw => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64(D.s), iterations: D.n, hash: 'SHA-256' }, base, 256));
  };
  if (!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc'))) $('p').type = 'password';
  const ok = !!(window.crypto && crypto.subtle && window.DecompressionStream);
  if (!ok) { $('t').textContent = 'Please update your browser to open this site.'; $('p').remove(); $('b').remove(); return; }
  if ((st.f || 0) >= MAX) { lock(); return; }
  const left = () => { const n = MAX - (st.f || 0); return n + (n === 1 ? ' try' : ' tries') + ' left'; };
  if (st.f) $('m').textContent = left();
  if (st.k) { $('f').style.visibility = 'hidden'; $('sp').hidden = false; const raw = b64(st.k); warm(); show(raw).then(t => put(t, raw), () => { delete st.k; wr(st); $('f').style.visibility = ''; $('sp').hidden = true; }); }
  $('f').addEventListener('submit', async e => {
    e.preventDefault();
    const pw = $('p').value;
    if (!pw) return;
    $('b').disabled = true; $('b').classList.add('bz'); $('m').className = 'm'; $('m').textContent = '';
    let raw;
    let txt;
    try { raw = await derive(pw); txt = await show(raw); }
    catch (x) { txt = null; }
    if (txt != null) { $('p').value = ''; st.f = 0; st.k = enc(raw); wr(st); warm(); $('f').style.visibility = 'hidden'; $('sp').hidden = false; requestAnimationFrame(() => put(txt, raw)); return; }
    $('b').classList.remove('bz');
    {
      st = rd(); st.f = (st.f || 0) + 1; delete st.k; wr(st);
      if (st.f >= MAX) { lock(); return; }
      $('b').disabled = false; $('p').value = ''; $('p').focus();
      $('m').className = 'm b'; $('m').textContent = 'Wrong password · ' + left();
      $('f').classList.remove('shake'); void $('f').offsetWidth; $('f').classList.add('shake');
    }
  });
})();
</script></body></html>
`;
fs.writeFileSync(path.join(out, 'index.html'), page);
fs.writeFileSync(path.join(dirOut, 'manifest.txt'), manifest.join('\n') + '\n');
console.log('gate2:', out, 'index', page.length, 'bytes (payload html', html.length, 'gz', gz.length + ')', 'files', plan.files.length, 'total', total);
