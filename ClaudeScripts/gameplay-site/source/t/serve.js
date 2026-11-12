const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
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
module.exports = { serve };
if (require.main === module) {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'w', 'site_stage')), port = +process.argv[3] || 8080;
  serve(root, port, { delay: +process.env.DELAY || 0 }).then(() => console.log('serving ' + root + ' on http://127.0.0.1:' + port));
}
