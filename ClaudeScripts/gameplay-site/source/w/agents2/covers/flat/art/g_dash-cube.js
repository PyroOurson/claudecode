(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".42" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function tiles(w, h, s, seed) {
    var o = '', n = seed;
    for (var y = 0; y < h; y += s) for (var x = 0; x < w; x += s) {
      n = (n * 9301 + 49297) % 233280;
      var k = n / 233280;
      if (k < 0.55) o += r(x + 5, y + 5, s - 10, s - 10, k < 0.2 ? '#000' : '#fff', 4, 'opacity="' + (k < 0.2 ? 0.1 : 0.04 + k * 0.06).toFixed(3) + '"');
    }
    return o;
  }
  function spike(x, y, w, h, sw) {
    return p([[x, y], [x + w / 2, y - h], [x + w, y]], '#000', 'stroke="#d8ccff" stroke-width="' + (sw + 8) + '" stroke-linejoin="round" opacity=".35"') +
      p([[x, y], [x + w / 2, y - h], [x + w, y]], lg(['#2a1a5e', '#06030f']), 'stroke="#fff" stroke-width="' + sw + '" stroke-linejoin="round"');
  }
  function block(x, y, s, sw) {
    return r(x, y, s, s, lg(['#2a2050', '#050310']), 0, 'stroke="#fff" stroke-width="' + sw + '"') + r(x + sw + 4, y + sw + 4, s - sw * 2 - 8, s - sw * 2 - 8, 'none', 0, 'stroke="#fff" stroke-width="2" opacity=".18"');
  }
  function cube(cx, cy, s, rot) {
    var h = s / 2, k = s / 210;
    var o = r(-h - 4, -h + 10, s + 8, s + 8, '#000', 18 * k, 'opacity=".35"');
    o += r(-h, -h, s, s, '#000', 16 * k);
    o += r(-h + 13 * k, -h + 13 * k, s - 26 * k, s - 26 * k, lg(['#c4ff6a', '#7dff00', '#3fb800']), 8 * k);
    o += d('M' + (-h + 13 * k) + ' ' + (-h + 13 * k) + 'h' + (s - 26 * k) + 'v' + (30 * k) + 'q' + (-(s - 26 * k) * 0.5) + ' ' + (22 * k) + ' ' + (-(s - 26 * k)) + ' ' + (6 * k) + 'z', '#fff', 'opacity=".35"');
    o += r(-58 * k, -58 * k, 116 * k, 116 * k, '#000', 6 * k);
    o += r(-46 * k, -46 * k, 92 * k, 92 * k, lg(['#9dffff', '#00e6ff', '#00a8d8']), 4 * k);
    o += r(-24 * k, -24 * k, 48 * k, 48 * k, '#000', 3 * k);
    o += r(-46 * k, -46 * k, 92 * k, 18 * k, '#fff', 4 * k, 'opacity=".4"');
    return g('translate(' + cx + ',' + cy + ') rotate(' + rot + ')', o);
  }
  function orb(x, y, R) {
    return c(x, y, R * 2.4, rg([['#ffe53b', 0], ['#ffe53b', 0.25], ['#ffe53b', 1]].map(function (q, i) { return i === 2 ? ['rgba(255,229,59,0)', 1] : q; })), 'opacity=".55"') +
      c(x, y, R * 1.55, 'none', 'stroke="#fff" stroke-width="' + R * 0.22 + '" opacity=".9"') +
      c(x, y, R, rg([['#fff', 0], ['#ffe53b', 0.45], ['#d29a00', 1]], 0.38, 0.35, 0.7), 'stroke="#000" stroke-width="' + R * 0.28 + '"');
  }
  function portal(x, y, ry, col) {
    return e(x, y, ry * 0.42, ry * 1.25, rg([[col, 0], ['rgba(0,0,0,0)', 1]]), 'opacity=".6"') +
      e(x, y, ry * 0.32, ry, 'none', 'stroke="#000" stroke-width="' + ry * 0.24 + '"') +
      e(x, y, ry * 0.32, ry, col, 'fill-opacity=".22" stroke="' + col + '" stroke-width="' + ry * 0.13 + '"') +
      e(x - ry * 0.08, y - ry * 0.2, ry * 0.12, ry * 0.5, '#fff', 'opacity=".35"');
  }
  function trail(pts, col, w) {
    return sk(pts, col, w, 'stroke-dasharray="1 ' + (w * 1.9).toFixed(1) + '" opacity=".75"');
  }
  G['dash-cube'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#6b3cff', '#3d17b8', '#1c0870']));
      o += tiles(400, 320, 80, 7);
      o += c(170, 170, 170, rg([['rgba(160,255,80,.45)', 0], ['rgba(120,200,255,.12)', 0.5], ['rgba(0,0,0,0)', 1]]));
      o += r(0, 316, 400, 84, lg(['#2a0f8a', '#12054a']));
      o += rep(4, function (i) { return r(i * 110 - 10, 330, 100, 80, '#000', 6, 'opacity=".18"'); });
      o += r(0, 309, 400, 14, lg([['rgba(255,255,255,0)', 0], ['#fff', 0.5], ['rgba(255,255,255,0)', 1]], 0, 0, 1, 0), 0, 'opacity=".35"');
      o += r(0, 313, 400, 5, lg([['rgba(255,255,255,0)', 0], ['#fff', 0.5], ['rgba(255,255,255,0)', 1]], 0, 0, 1, 0));
      o += spike(248, 316, 62, 74, 7) + spike(310, 316, 62, 74, 7);
      o += trail('M14 304 Q 50 190 120 158', '#fff', 11);
      o += rep(7, function (i) { var a = [[40, 262, 14], [62, 236, 10], [30, 220, 8], [88, 200, 12], [54, 196, 7], [104, 178, 8], [20, 280, 9]][i]; return g('rotate(' + (i * 23) + ' ' + a[0] + ' ' + a[1] + ')', r(a[0] - a[2] / 2, a[1] - a[2] / 2, a[2], a[2], i % 3 ? '#7dff00' : '#00ffff', 1.5, 'stroke="#000" stroke-width="2.5"')); });
      o += orb(320, 92, 22);
      o += cube(166, 156, 184, -16);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#5a2ae6', '#2b0d8b', '#14054d']));
      o += tiles(960, 470, 120, 3);
      o += r(0, 470, 960, 130, lg(['#2a0f8a', '#0c0338']));
      o += rep(9, function (i) { return r(i * 120 - 20, 484, 112, 112, '#000', 6, 'opacity=".2"'); });
      o += r(0, 466, 960, 7, lg([['rgba(255,255,255,0)', 0], ['#fff', 0.5], ['rgba(255,255,255,0)', 1]], 0, 0, 1, 0));
      o += spike(60, 470, 56, 66, 6) + spike(116, 470, 56, 66, 6);
      o += block(250, 414, 56, 5) + block(306, 414, 56, 5) + block(306, 358, 56, 5) + spike(306, 358, 56, 56, 5);
      o += spike(470, 470, 56, 66, 6) + spike(526, 470, 56, 66, 6) + spike(582, 470, 56, 66, 6);
      o += block(700, 414, 56, 5) + block(756, 414, 56, 5) + block(812, 414, 56, 5) + block(756, 358, 56, 5) + block(812, 358, 56, 5) + block(812, 302, 56, 5);
      o += portal(910, 300, 92, '#ff5fd2');
      o += orb(560, 250, 20);
      o += trail('M150 420 Q 260 210 400 250', '#fff', 10);
      o += cube(440, 268, 92, 20);
      o += rep(10, function (i) { return r(150 + i * 26, 380 - i * 14 + (i % 2) * 18, 9, 9, i % 2 ? '#00ffff' : '#7dff00', 1, 'opacity=".8"'); });
      return o;
    }
  };
})();
