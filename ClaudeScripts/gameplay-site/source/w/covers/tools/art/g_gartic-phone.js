(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function handset(x, y, rot, s, col, dk) {
    var o = sk('M-74 6 C-50 -50 50 -50 74 6', '#000', 38, 'opacity=".25" transform="translate(7,10)"');
    o += e(-78, 12, 40, 26, '#000', 'opacity=".25" transform="translate(7,10) rotate(-28 -78 12)"') + e(78, 12, 40, 26, '#000', 'opacity=".25" transform="translate(7,10) rotate(28 78 12)"');
    o += sk('M-74 6 C-50 -50 50 -50 74 6', dk, 38) + sk('M-74 2 C-50 -54 50 -54 74 2', col, 30);
    o += e(-78, 14, 40, 26, dk, 'transform="rotate(-28 -78 14)"') + e(78, 14, 40, 26, dk, 'transform="rotate(28 78 14)"');
    o += e(-78, 8, 38, 22, col, 'transform="rotate(-28 -78 8)"') + e(78, 8, 38, 22, col, 'transform="rotate(28 78 8)"');
    o += sk('M-56 -24 C-30 -48 30 -48 56 -24', '#fff', 8, 'opacity=".5"') + e(-88, 0, 14, 6, '#fff', 'opacity=".45" transform="rotate(-28 -88 0)"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function coil(x0, y0, x1, y1, n, rr, col, dk) {
    var L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, A = L / (Math.PI * 2 * n), q = [];
    for (var i = 0; i <= n * 24; i++) { var th = i / 24 * Math.PI * 2, u = A * th - rr * Math.sin(th), v = rr * Math.cos(th) - rr; q.push((x0 + ux * u - uy * v).toFixed(1) + ' ' + (y0 + uy * u + ux * v).toFixed(1)); }
    var path = 'M' + q.join(' L');
    return sk(path, '#000', 9, 'opacity=".22" transform="translate(5,8)"') + sk(path, dk, 9) + sk(path, col, 5);
  }
  function bubble(x, y, rot, s) {
    var o = r(-92, -52, 184, 104, '#000', 30, 'opacity=".26" transform="translate(7,10)"') + p([[-30, 46], [-54, 86], [6, 50]], '#000', 'opacity=".26" transform="translate(7,10)"');
    o += r(-92, -52, 184, 104, '#fff', 30) + p([[-30, 46], [-54, 86], [6, 50]], '#fff');
    o += r(-64, -26, 128, 16, '#c9b8ff', 8) + r(-64, 4, 92, 16, '#c9b8ff', 8) + c(48, 12, 7, '#7a4cf0') + c(68, 12, 7, '#7a4cf0') + c(28, 12, 7, '#7a4cf0');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function sheet(x, y, rot, s, kind) {
    var o = r(-110, -125, 220, 250, '#000', 18, 'opacity=".28" transform="translate(8,12)"') + r(-110, -125, 220, 250, '#fffaf0', 18) + r(-110, -125, 220, 38, '#ffe7a8', 18) + r(-110, -100, 220, 13, '#ffe7a8');
    o += c(-84, -106, 8, '#ff6b6b') + c(-60, -106, 8, '#ffc531') + c(-36, -106, 8, '#4cc46a');
    if (kind === 1) {
      o += c(56, -42, 26, '#ffd23a') + sk('M56 -82 V-74 M56 -10 V-2 M16 -42 H24 M88 -42 H96 M28 -70 L34 -64 M84 -70 L78 -64 M28 -14 L34 -20 M84 -14 L78 -20', '#ffa21a', 6);
      o += r(-74, 0, 96, 82, '#7fc8ff') + p([[-88, 4], [-26, -52], [36, 4]], '#ff6b6b') + r(-44, 38, 30, 44, '#a66a3a');
      o += sk('M-90 2 L-26 -56 L38 2 M-76 0 V84 H24 V0 M-44 84 V38 H-14 V84', '#2a2350', 7);
      o += sk('M-96 98 H96', '#4cc46a', 8);
    } else {
      o += r(-80, -40, 160, 16, '#d6cdf2', 8) + r(-80, -6, 120, 16, '#d6cdf2', 8);
      o += t(0, 92, '?', 110, '#7a4cf0');
    }
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  G['gartic-phone'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#a77bff', 0], ['#6c3ff0', 0.55], ['#3a1a9a', 1]], 0.4, 0.3, 0.85));
      o += rep(7, function (i) { return c(30 + i * 60, 380 - (i % 2) * 20, 30, '#fff', 'opacity=".06"'); });
      o += sheet(186, 262, -6, 0.98, 1);
      o += coil(346, 136, 352, 360, 8, 12, '#ff4d5e', '#b81f33');
      o += bubble(124, 86, -6, 0.8);
      o += handset(286, 92, 22, 0.76, '#ff4d5e', '#b81f33');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#7a4cf0', '#3a1a9a']));
      var R = rnd(7);
      [[140, 160, -12, 1], [330, 430, 8, 2], [480, 150, -4, 1], [640, 430, 10, 1], [820, 170, 12, 2], [120, 470, 6, 2], [860, 470, -8, 1]].forEach(function (q) { o += sheet(q[0], q[1], q[2], 0.8, q[3]); });
      o += handset(480, 330, -10, 1.2, '#ff4d5e', '#b81f33') + handset(240, 300, 30, 0.8, '#ffc531', '#c8900a') + handset(720, 290, -30, 0.8, '#4cc46a', '#2a8a44');
      return o;
    }
  };
})();
