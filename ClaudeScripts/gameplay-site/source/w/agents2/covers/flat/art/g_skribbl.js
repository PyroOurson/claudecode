(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function pencil(x, y, rot, s) {
    var o = r(-16, -80, 32, 150, '#000', 6, 'opacity=".25" transform="translate(8,8)"');
    o += r(-16, -80, 32, 150, '#ffc531') + r(-16, -80, 10, 150, '#ffe07a') + r(6, -80, 10, 150, '#e09a10');
    o += p([[-16, -80], [16, -80], [0, -122]], '#f3cf9a') + p([[-6, -106], [6, -106], [0, -122]], '#2a2350');
    o += r(-17, 66, 34, 16, '#c9ced8') + r(-17, 71, 34, 4, '#9aa0ae') + r(-16, 82, 32, 24, '#ff7aa0', 8);
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function doodles(w, h, n, seed, op) {
    var R = rnd(seed), o = '';
    for (var i = 0; i < n; i++) {
      var x = R() * w, y = R() * h, k = i % 4, s = 10 + R() * 16;
      if (k === 0) o += c(x, y, s, 'none', 'stroke="#fff" stroke-width="4" opacity="' + op + '"');
      else if (k === 1) o += sk('M' + (x - s) + ' ' + y + ' q' + s / 2 + ' ' + (-s) + ' ' + s + ' 0 t' + s + ' 0', '#fff', 4, 'opacity="' + op + '"');
      else if (k === 2) o += star(x, y, s, s * 0.45, 5, 'none', -90, 'stroke="#fff" stroke-width="4" opacity="' + op + '"');
      else o += sk('M' + (x - s) + ' ' + (y - s) + ' L' + (x + s) + ' ' + (y + s) + ' M' + (x + s) + ' ' + (y - s) + ' L' + (x - s) + ' ' + (y + s), '#fff', 4, 'opacity="' + op + '"');
    }
    return o;
  }
  function apple(x, y, s) {
    var o = d('M0 -42 C-30 -60 -68 -44 -66 -4 C-64 38 -30 68 0 56 C30 68 64 38 66 -4 C68 -44 30 -60 0 -42 Z', '#ff4b4b');
    o += d('M0 -42 C30 -60 68 -44 66 -4 C64 38 30 68 0 56 C14 40 20 0 0 -42 Z', '#d92a2a', 'opacity=".5"');
    o += e(-34, -14, 10, 20, '#fff', 'opacity=".6" transform="rotate(20 -34 -14)"');
    o += sk('M0 -42 C-30 -60 -68 -44 -66 -4 C-64 38 -30 68 0 56 C30 68 64 38 66 -4 C68 -44 30 -60 0 -42', '#22263a', 7);
    o += sk('M0 -40 C-2 -56 2 -66 8 -74', '#7a4a1e', 8) + d('M6 -60 C22 -80 48 -78 54 -70 C42 -54 22 -52 6 -60 Z', '#3dbb4e') + sk('M6 -60 C22 -80 48 -78 54 -70 C42 -54 22 -52 6 -60', '#22263a', 5);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  var PAL = ['#16181f', '#ff4b4b', '#ff9f1a', '#ffe23a', '#3dbb4e', '#2f8cff', '#a24bff', '#ffffff'];
  G['skribbl'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#4a86ff', 0], ['#2456e0', 0.6], ['#14339a', 1]], 0.4, 0.3, 0.85));
      o += doodles(400, 400, 16, 3, 0.12);
      o += g('rotate(-4 200 190)', r(54, 46, 292, 252, '#000', 24, 'opacity=".28" transform="translate(6,10)"') + r(54, 46, 292, 252, '#fff', 24) + rep(5, function (i) { return r(124 + i * 32, 74, 24, 7, '#3a3f58', 3); }) + apple(198, 196, 1.15));
      o += rep(8, function (i) { var x = 54 + i * 41.7; return c(x + 3, 350, 17, '#000', 'opacity=".25"') + c(x, 346, 17, PAL[i], 'stroke="#0e1f66" stroke-width="4"') + c(x - 5, 340, 5, '#fff', 'opacity=".45"'); });
      o += pencil(312, 214, 225, 0.82);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#3a76ff', '#1840b0']));
      o += doodles(960, 600, 60, 11, 0.18);
      o += r(250, 90, 460, 330, '#fff', 26) + apple(480, 260, 1.8) + rep(6, function (i) { return r(370 + i * 38, 120, 28, 8, '#3a3f58', 4); });
      o += rep(8, function (i) { return c(300 + i * 52, 480, 20, PAL[i], 'stroke="#0e1f66" stroke-width="4"'); });
      [[110, 200, '#ffd23a'], [130, 380, '#7fe08a'], [850, 200, '#ff8aa8'], [830, 390, '#9fd0ff']].forEach(function (q) { o += c(q[0], q[1], 46, q[2]) + c(q[0] - 15, q[1] - 6, 6, '#22263a') + c(q[0] + 15, q[1] - 6, 6, '#22263a') + sk('M' + (q[0] - 16) + ' ' + (q[1] + 12) + ' Q' + q[0] + ' ' + (q[1] + 26) + ' ' + (q[0] + 16) + ' ' + (q[1] + 12), '#22263a', 5); });
      return o;
    }
  };
})();
