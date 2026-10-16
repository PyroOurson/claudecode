const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.bin': 'application/octet-stream', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml' };
const gzCache = new Map();
exports.serve = (root, port, opts = {}) => {
  const prefix = opts.prefix || '/';
  const log = opts.log || null;
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]);
    if (!u.startsWith(prefix)) { r.writeHead(404); r.end('nf'); return; }
    let rel = u.slice(prefix.length);
    let fn = path.join(root, rel);
    let st = null;
    try { st = fs.statSync(fn); if (st.isDirectory()) { fn = path.join(fn, 'index.html'); st = fs.statSync(fn); } } catch (e) { st = null; }
    if (!st) { if (opts.spa) { fn = path.join(root, 'index.html'); } else { r.writeHead(404); r.end('nf'); return; } }
    const ext = path.extname(fn);
    let body = fs.readFileSync(fn);
    const h = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': opts.cache ? opts.cache(rel, ext) : 'no-cache' };
    if (/html|javascript|json|text|xml|svg/.test(h['content-type']) && /gzip/.test(q.headers['accept-encoding'] || '')) {
      const k = fn + ':' + body.length;
      if (!gzCache.has(k)) gzCache.set(k, zlib.gzipSync(body, { level: 6 }));
      body = gzCache.get(k); h['content-encoding'] = 'gzip';
    }
    h['content-length'] = body.length;
    if (log) log.push({ url: q.url, bytes: body.length });
    r.writeHead(200, h); r.end(body);
  });
  return new Promise(res => srv.listen(port, () => res(srv)));
};
