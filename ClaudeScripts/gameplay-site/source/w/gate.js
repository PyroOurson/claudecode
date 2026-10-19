const fs = require('fs'), zlib = require('zlib'), crypto = require('crypto');
const [inp, out] = process.argv.slice(2);
const pass = process.env.GATE_PASS;
if (!pass) { console.error('GATE_PASS missing'); process.exit(1); }
const html = fs.readFileSync(inp);
const gz = zlib.gzipSync(html, { level: 9 });
const salt = Buffer.from('gameplay-gate-v1');
const iter = 310000;
const key = crypto.pbkdf2Sync(Buffer.from(pass, 'utf8'), salt, iter, 32, 'sha256');
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([c.update(gz), c.final(), c.getAuthTag()]);
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>gameplay</title>
<style>
:root{color-scheme:light dark;--bg:#f4f3fb;--card:#fff;--ink:#1f1d2b;--muted:#6b6880;--accent:#6c4ef5;--line:#e3e1ef;--bad:#e5484d}
@media (prefers-color-scheme:dark){:root{--bg:#14131c;--card:#1e1c2a;--ink:#f1f0f7;--muted:#a3a0b8;--line:#2e2b40}}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.c{width:100%;max-width:360px;padding:32px 24px;border-radius:22px;background:var(--card);border:1px solid var(--line);box-shadow:0 24px 60px -30px rgba(31,29,43,.45);text-align:center}
.lg{display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;font-weight:900;font-size:24px;letter-spacing:-.02em}
.lg i{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--accent);color:#fff;font-style:normal;font-size:16px}
h1{margin:0 0 6px;font-size:20px}p{margin:0 0 18px;color:var(--muted);font-size:14px}
input{width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid var(--line);background:transparent;color:inherit;font-size:16px;outline:none}
input:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(108,78,245,.18)}
button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;cursor:pointer}
button:disabled{opacity:.6;cursor:default}
.m{min-height:20px;margin:12px 0 0;font-size:14px;color:var(--muted)}.m.b{color:var(--bad)}
.shake{animation:sh .35s}@keyframes sh{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
</style></head><body>
<form class="c" id="f" autocomplete="off"><div class="lg"><i>&#9654;</i>gameplay</div><h1 id="h">Enter the password</h1><p id="t">This site is private.</p><input id="p" type="password" placeholder="Password" autofocus aria-label="Password"><button id="b">Unlock</button><div class="m" id="m"></div></form>
<script>
(() => {
  const D = { s: '${salt.toString('base64')}', i: '${iv.toString('base64')}', n: ${iter}, c: '${ct.toString('base64')}' };
  const K = 'gameplay:gate', MAX = 5;
  const $ = id => document.getElementById(id);
  const b64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
  const enc = u => btoa(String.fromCharCode.apply(null, u));
  const rd = () => { let o = {}; try { o = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) {} const ck = (document.cookie.match(/gpgate=(\\d+)/) || [])[1]; if (ck && +ck > (o.f || 0)) o.f = +ck; return o; };
  const wr = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) {} try { document.cookie = 'gpgate=' + (o.f || 0) + ';max-age=31536000;path=/;SameSite=Lax'; } catch (e) {} };
  let st = rd();
  const lock = () => { $('h').textContent = 'Locked'; $('t').textContent = 'Too many wrong passwords on this computer.'; $('p').remove(); $('b').remove(); $('m').textContent = ''; };
  const put = txt => { document.open(); document.write(txt); document.close(); };
  const show = async raw => {
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(D.i) }, key, b64(D.c));
    return new Response(new Blob([pt]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  };
  const derive = async pw => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64(D.s), iterations: D.n, hash: 'SHA-256' }, base, 256));
  };
  const ok = !!(window.crypto && crypto.subtle && window.DecompressionStream);
  if (!ok) { $('t').textContent = 'Please update your browser to open this site.'; $('p').remove(); $('b').remove(); return; }
  if ((st.f || 0) >= MAX) { lock(); return; }
  const left = () => { const n = MAX - (st.f || 0); return n + (n === 1 ? ' try' : ' tries') + ' left'; };
  if (st.f) $('m').textContent = left();
  if (st.k) { $('f').style.visibility = 'hidden'; show(b64(st.k)).then(put, () => { delete st.k; wr(st); $('f').style.visibility = ''; }); }
  $('f').addEventListener('submit', async e => {
    e.preventDefault();
    const pw = $('p').value;
    if (!pw) return;
    $('b').disabled = true; $('m').className = 'm'; $('m').textContent = 'Checking…';
    let raw;
    let txt;
    try { raw = await derive(pw); txt = await show(raw); }
    catch (x) { txt = null; }
    if (txt != null) { st.f = 0; st.k = enc(raw); wr(st); put(txt); return; }
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
fs.writeFileSync(out, page);
console.log('gated', out, 'html', html.length, 'gz', gz.length, 'page', page.length);
