(function () {
  var OUT = '#1c1130', COL = ['#c64cf2', '#27c4ff', '#3ee64f', '#ff4d5e'], ROT = [-90, 180, 0, 90];
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function arrow(x, y, s, lane, hollow) {
    var q = [[0, -s], [s * .95, -s * .02], [s * .44, -s * .02], [s * .44, s * .86], [-s * .44, s * .86], [-s * .44, -s * .02], [-s * .95, -s * .02]];
    var col = COL[lane], o = '';
    o += p(q, '#000', 'opacity=".28" transform="translate(' + s * .06 + ',' + s * .1 + ')"');
    o += p(q, hollow ? 'rgba(255,255,255,.12)' : col, 'stroke="' + OUT + '" stroke-width="' + s * .2 + '" stroke-linejoin="round"');
    if (!hollow) o += p([[0, -s * .72], [s * .55, -s * .12], [0, -s * .12]], '#fff', 'opacity=".38"');
    else o += p(q, 'none', 'stroke="' + col + '" stroke-width="' + s * .07 + '" stroke-linejoin="round" opacity=".9"');
    return g('translate(' + x + ',' + y + ') rotate(' + ROT[lane] + ')', o);
  }
  function lights(x0, x1, y, sag, n, rad) {
    var o = sk('M' + x0 + ' ' + y + ' Q' + (x0 + x1) / 2 + ' ' + (y + sag * 2) + ' ' + x1 + ' ' + y, '#2a1838', 3);
    for (var i = 0; i <= n; i++) {
      var u = i / n, x = x0 + (x1 - x0) * u, yy = y + sag * 4 * u * (1 - u), cl = ['#ffd23f', '#ff5fa8', '#47f0ff', '#7dff9e'][i % 4];
      o += c(x, yy + rad, rad * 2.2, cl, 'opacity=".25"') + c(x, yy + rad, rad, cl);
    }
    return o;
  }
  function mic(x, y, s, rot) {
    var o = r(-s * .2, s * .3, s * .4, s * 1.25, lg(['#3a2a52', '#1c1130'], 0, 0, 1, 0), s * .16, 'stroke="' + OUT + '" stroke-width="' + s * .09 + '"');
    o += r(-s * .3, s * .22, s * .6, s * .22, '#c9c2dc', s * .06, 'stroke="' + OUT + '" stroke-width="' + s * .08 + '"');
    o += c(0, 0, s * .52, rg([['#ffffff', 0], ['#cfc8e6', .5], ['#8a82a8', 1]], .38, .32, .8), 'stroke="' + OUT + '" stroke-width="' + s * .1 + '"');
    o += rep(5, function (i) { return ln(-s * .38, -s * .3 + i * s * .15, s * .38, -s * .3 + i * s * .15, '#6a6288', s * .035, 'opacity=".7"'); });
    o += c(-s * .18, -s * .2, s * .12, '#fff', 'opacity=".8"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  G['beat-duel'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ff7fc0', 0], ['#9a2f9e', .5], ['#2a0f4e', 1]], .5, .62, .85));
      o += rep(7, function (i) { return r(20 + i * 56, 250 - (i % 3) * 40, 44, 200, '#1c0f36', 0, 'opacity=".55"') + rep(4, function (k) { return r(30 + i * 56 + (k % 2) * 18, 268 - (i % 3) * 40 + k * 26, 8, 10, '#ffd96a', 0, 'opacity=".55"'); }); });
      o += lights(-10, 410, 22, 26, 9, 6);
      o += r(26, 66, 348, 108, '#120a26', 30, 'opacity=".45"');
      [0, 1, 2, 3].forEach(function (l) { o += arrow(68 + l * 88, 120, 34, l, false); });
      [[0, 228, .7], [3, 262, .62], [2, 214, .66]].forEach(function (a) { o += arrow(68 + a[0] * 88, a[1], 34 * a[2], a[0], false); });
      o += e(200, 388, 170, 26, '#120a26', 'opacity=".5"');
      o += mic(212, 300, 64, 18);
      o += sk('M128 300 Q112 330 128 360', '#ffd23f', 7, 'opacity=".85"') + sk('M100 290 Q78 330 100 372', '#ffd23f', 6, 'opacity=".55"') + sk('M296 300 Q312 330 296 360', '#ffd23f', 7, 'opacity=".85"') + sk('M324 290 Q346 330 324 372', '#ffd23f', 6, 'opacity=".55"');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a0f4e', '#7a2a86', '#ff6fa8'], 0, 0, 0, 1));
      o += rep(16, function (i) { var h = 160 + (i * 37) % 180; return r(i * 62 - 10, 600 - h - 90, 56, h + 90, '#1c0f36', 0, 'opacity=".8"') + rep(6, function (k) { return r(i * 62 + 4 + (k % 3) * 16, 600 - h - 70 + Math.floor(k / 3) * 40, 8, 12, '#ffd96a', 0, 'opacity=".5"'); }); });
      o += lights(-20, 980, 40, 40, 18, 8);
      o += r(0, 520, 960, 80, '#3a1d58') + r(0, 516, 960, 8, '#ff5fa8', 0, 'opacity=".6"');
      [0, 1, 2, 3].forEach(function (l) { o += arrow(300 + l * 120, 170, 46, l, true); });
      [0, 1, 2, 3, 1, 2, 0, 3].forEach(function (l, i) { o += arrow(300 + l * 120, 290 + i * 60, 40, l, false); });
      o += r(30, 300, 150, 220, '#140a26', 16) + c(105, 370, 44, '#2a1838') + c(105, 370, 26, '#ffd23f', 'opacity=".7"') + c(105, 460, 44, '#2a1838') + c(105, 460, 26, '#ffd23f', 'opacity=".7"');
      o += r(780, 300, 150, 220, '#140a26', 16) + c(855, 370, 44, '#2a1838') + c(855, 370, 26, '#ffd23f', 'opacity=".7"') + c(855, 460, 44, '#2a1838') + c(855, 460, 26, '#ffd23f', 'opacity=".7"');
      return o;
    }
  };
})();
