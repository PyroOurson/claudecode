const { chromium } = (() => { for (const m of ['playwright', 'C:/tmp/pw/node_modules/playwright', '/opt/node22/lib/node_modules/playwright']) { try { return require(m); } catch (e) {} } throw new Error('playwright not found'); })();
const WIN = process.platform === 'win32';
const LAUNCH = WIN ? { channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] } : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] };
const fs = require('fs');
const THREE = fs.readFileSync(__dirname + '/package/build/three.min.js', 'utf8');
exports.launch = async (opts = {}) => {
  const b = await chromium.launch(LAUNCH);
  const ctx = await b.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  await ctx.route(/three(\.min)?\.js|peerjs/, r => {
    if (/three/.test(r.request().url())) r.fulfill({ status: 200, contentType: 'application/javascript', body: THREE });
    else r.abort();
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  return { b, ctx };
};
