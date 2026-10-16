const { chromium } = require('C:/tmp/pw/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const D = __dirname;
const OUT = process.env.COVER_PNG || 'C:/tmp/gameplay-build/w/agents3/covers/png';
const games = JSON.parse(fs.readFileSync(D + '/games.json', 'utf8'));
const want = process.argv.slice(2);
const list = want.length ? games.filter(x => want.includes(x[0])) : games;
const arts = fs.readdirSync(D + '/art').filter(f => f.endsWith('.js')).sort().map(f => '<script>' + fs.readFileSync(D + '/art/' + f, 'utf8') + '</script>').join('\n');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Press+Start+2P&family=Luckiest+Guy&family=Lilita+One&display=block" rel="stylesheet">
<style>
html,body{margin:0;background:#000}
#c{position:relative;width:960px;height:600px;overflow:hidden;background:#111}
.bg{position:absolute;inset:-30px;filter:blur(9px) brightness(.62) saturate(1.15)}
.bg svg{width:1020px;height:660px;display:block}
.vg{position:absolute;inset:0;background:radial-gradient(ellipse 75% 80% at 50% 42%,rgba(0,0,0,0) 40%,rgba(0,0,0,.42) 100%)}
.box{position:absolute;left:270px;top:32px;width:420px;height:420px;border-radius:96px;overflow:hidden;box-shadow:0 22px 44px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08)}
.box svg{width:420px;height:420px;display:block}
.nm{position:absolute;left:0;right:0;top:470px;text-align:center;font-family:Montserrat;font-weight:800;color:#fff;letter-spacing:.5px;text-shadow:0 4px 14px rgba(0,0,0,.65),0 2px 3px rgba(0,0,0,.5)}
</style></head><body><div id="c"></div><script>${fs.readFileSync(D + '/kit.js', 'utf8')}</script>\n${arts}</body></html>`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(OUT + '/_page.html', html);
  const b = await chromium.launch({ channel: 'chrome' });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file:///' + OUT.replace(/\\/g, '/') + '/_page.html');
  await pg.evaluate(() => document.fonts.ready);
  for (const [id, name] of list) {
    const ok = await pg.evaluate(([id, name]) => { if (!G[id]) return 'missing'; try { show(id, name); return 'ok'; } catch (e) { return 'err ' + e.message; } }, [id, name]);
    if (ok !== 'ok') { console.log(id, ok); continue; }
    await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await (await pg.$('#c')).screenshot({ path: OUT + '/' + id + '.png' });
  }
  if (errs.length) console.log('pageerrors', errs);
  await b.close();
})();
