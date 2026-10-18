const fs = require('fs');
const [, , f, o] = process.argv;
const s = fs.readFileSync(f, 'utf8');
const BT = String.fromCharCode(96), BS = String.fromCharCode(92);
let out = '', i = 0, k;
while ((k = s.indexOf('(' + BT + BS + '0asm', i)) >= 0) {
  let j = k + 2;
  for (; j < s.length; j++) { const c = s[j]; if (c === BS) { j++; continue; } if (c === BT) break; }
  out += s.slice(i, k + 1) + BT + 'WASM' + BT;
  i = j + 1;
}
out += s.slice(i);
fs.writeFileSync(o, out.replace(/;(?=[a-zA-Z_$])/g, ';\n').replace(/\}(?=function|const|let|var|class)/g, '}\n'));
console.log(s.length, '->', out.length);
