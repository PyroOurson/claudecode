const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [inp, out, sc] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: +sc || 2 });
  await p.setContent('<html><body style="margin:0">' + fs.readFileSync(inp, 'utf8') + '</body></html>');
  await p.screenshot({ path: out });
  await b.close();
})();
