const fs = require('fs'), path = require('path');
const [, , file, outdir] = process.argv;
const s = fs.readFileSync(file, 'utf8');
const BT = String.fromCharCode(96);
let i = 0, n = 0;
while ((i = s.indexOf('(' + BT + '\\0asm', i)) >= 0) {
  let j = i + 2;
  for (; j < s.length; j++) { const c = s[j]; if (c === '\\') { j++; continue; } if (c === BT) break; }
  const body = s.slice(i + 2, j);
  const str = (0, eval)(BT + body + BT);
  const b = new Uint8Array(str.length);
  for (let k = 0; k < str.length; k++) { const G = str.charCodeAt(k); b[k] = ~G >> 8 & G; }
  const name = path.basename(file).split('-')[0] + '_' + n + '.wasm';
  fs.writeFileSync(path.join(outdir, name), b);
  console.log(name, b.length, 'helper', JSON.stringify(s.slice(i - 6, i)));
  n++; i = j;
}
