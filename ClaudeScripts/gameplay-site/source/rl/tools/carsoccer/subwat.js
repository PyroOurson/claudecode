const fs = require('fs');
const [, , watFile, roots, out] = process.argv;
const L = fs.readFileSync(watFile, 'utf8').split('\n');
const start = {}, types = [];
L.forEach((l, i) => { const m = l.match(/^  \(func \(;(\d+);\)/); if (m) start[m[1]] = i; if (/^  \(type \(;\d+;\)/.test(l)) types.push(l); });
const ids = Object.keys(start).map(Number).sort((a, b) => a - b);
const body = id => { const s = start[id], nxt = ids[ids.indexOf(id) + 1]; let e = nxt != null ? start[nxt] : L.findIndex((l, i) => i > s && /^  \((export|elem|data|global|table|memory|tag)/.test(l)); return L.slice(s, e); };
const want = new Set(), q = roots.split(',').map(Number);
while (q.length) { const id = q.pop(); if (want.has(id)) continue; want.add(id); for (const l of body(id)) { const m = l.match(/\bcall (\d+)\b/); if (m) q.push(+m[1]); if (/call_indirect|throw|try|catch|rethrow/.test(l)) console.error('warn', id, l.trim()); } }
const globals = L.filter(l => /^  \(global /.test(l));
const imports = L.filter(l => /^  \(import /.test(l));
const fnames = [...want].sort((a, b) => a - b);
let o = ['(module'];
o.push(...types);
for (const id of fnames) {
  let b = body(id).join('\n');
  b = b.replace(/^  \(func \(;(\d+);\)/, '  (func $f$1 (export "f$1")').replace(/\bcall (\d+)\b/g, 'call $f$1');
  o.push(b);
}
o.push('  (memory 512)', ...globals.map(g => g.replace(/^  \(global \(;(\d+);\)/, '  (global (;$1;)')), ')');
fs.writeFileSync(out, o.join('\n'));
console.log('funcs', fnames.join(' '));
