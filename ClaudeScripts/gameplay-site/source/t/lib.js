const { chromium } = require('C:/tmp/pw/node_modules/playwright');
const fs = require('fs');
const THREE = fs.readFileSync(__dirname + '/package/build/three.min.js', 'utf8');
exports.launch = async (opts = {}) => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  await ctx.route(/three(\.min)?\.js|peerjs/, r => {
    if (/three/.test(r.request().url())) r.fulfill({ status: 200, contentType: 'application/javascript', body: THREE });
    else r.abort();
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  return { b, ctx };
};
