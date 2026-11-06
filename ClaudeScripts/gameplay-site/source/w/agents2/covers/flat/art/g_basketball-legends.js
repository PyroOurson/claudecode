(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function bball(x, y, R) {
    var o = c(x + 4, y + 6, R, '#000', 'opacity=".3"') + c(x, y, R, rg([['#ffb060', 0], ['#ff7a1a', 0.6], ['#c44a00', 1]], 0.38, 0.32, 0.75));
    o += sk('M' + (x - R) + ' ' + y + ' H' + (x + R) + ' M' + x + ' ' + (y - R) + ' V' + (y + R), '#4a1a00', R * 0.07);
    o += sk('M' + (x - R * 0.7) + ' ' + (y - R * 0.7) + ' C' + (x - R * 0.2) + ' ' + (y - R * 0.3) + ' ' + (x - R * 0.2) + ' ' + (y + R * 0.3) + ' ' + (x - R * 0.7) + ' ' + (y + R * 0.7), '#4a1a00', R * 0.07) + sk('M' + (x + R * 0.7) + ' ' + (y - R * 0.7) + ' C' + (x + R * 0.2) + ' ' + (y - R * 0.3) + ' ' + (x + R * 0.2) + ' ' + (y + R * 0.3) + ' ' + (x + R * 0.7) + ' ' + (y + R * 0.7), '#4a1a00', R * 0.07);
    return o + e(x - R * 0.38, y - R * 0.45, R * 0.25, R * 0.13, '#fff', 'opacity=".55" transform="rotate(-35 ' + (x - R * 0.38) + ' ' + (y - R * 0.45) + ')"');
  }
  function hoop(x, y, s) {
    var o = r(-6, -110, 12, 300, '#5a6070') + r(-80, -130, 150, 100, '#000', 8, 'opacity=".25" transform="translate(6,8)"') + r(-80, -130, 150, 100, '#fff', 8) + r(-80, -130, 150, 100, 'none', 8, 'stroke="#c8ccd8" stroke-width="4"') + r(-30, -96, 60, 44, 'none', 2, 'stroke="#e8233a" stroke-width="6"');
    o += sk('M-56 -30 L-44 30 M-36 -30 L-24 30 M-12 -30 L-12 30 M12 -30 L0 30 M32 -30 L12 30 M-56 -30 L32 30 M32 -30 L-44 30', '#fff', 3, 'opacity=".9"');
    o += e(-12, -30, 48, 10, 'none', 'stroke="#ff6a1a" stroke-width="8"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function player(x, y, s) {
    var SK = '#a0643a', J = '#ffd23a', JD = '#7a2ad8';
    var o = sk('M-30 180 L-50 260 M30 180 L60 250', SK, 30) + r(-46, 120, 92, 70, JD, 18) + r(-40, 120, 6, 70, '#fff', 0, 'opacity=".3"');
    o += d('M-50 30 C-56 80 -50 120 -46 130 L46 130 C50 120 56 80 50 30 C30 18 -30 18 -50 30 Z', J) + sk('M-30 26 C-20 50 20 50 30 26', JD, 8) + t(0, 104, '7', 52, JD);
    o += sk('M36 44 C70 10 90 -50 104 -110', SK, 28) + sk('M-40 46 C-70 70 -86 100 -90 120', SK, 26);
    o += c(0, -50, 78, '#2a1a12') + c(0, -50, 72, SK) + d('M-72 -66 C-70 -120 -30 -134 0 -134 C30 -134 70 -120 72 -66 C50 -90 -50 -90 -72 -66 Z', '#1b1d24');
    o += r(-74, -86, 148, 20, '#fff', 8) + r(-74, -86, 148, 7, '#e8233a', 4);
    o += e(-12, -44, 14, 16, '#fff') + e(34, -46, 13, 15, '#fff') + c(-6, -48, 7, '#1b1d24') + c(39, -50, 7, '#1b1d24');
    o += sk('M-28 -66 L2 -60 M24 -62 L50 -68', '#1b1d24', 6) + d('M-4 -8 C8 6 30 6 40 -10 Z', '#fff', 'stroke="#5a2a10" stroke-width="4"');
    o += e(-42, -86, 18, 10, '#fff', 'opacity=".2"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['basketball-legends'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a1a8a', '#8a2ac8', '#ff7a3a']));
      o += rep(8, function (i) { return c(30 + i * 50, 300, 30, '#fff', 'opacity=".05"'); }) + rep(14, function (i) { return c(14 + i * 30, 270 + (i % 2) * 10, 3, '#fff', 'opacity=".5"'); });
      o += r(0, 336, 400, 64, '#c8823a') + rep(5, function (i) { return r(i * 80, 336, 4, 64, '#a86a2a'); }) + r(0, 336, 400, 5, '#fff', 0, 'opacity=".5"');
      o += hoop(318, 150, 0.95);
      o += player(160, 250, 0.9);
      o += bball(262, 132, 40);
      o += sk('M210 70 l-12 -14 M232 60 l-4 -18 M190 92 l-18 -6', '#fff', 5);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a1060', '#7a2ab8', '#e86a3a']));
      o += rep(40, function (i) { return c(12 + i * 24, 300 + (i % 3) * 20, 9, ['#ffd23a', '#fff', '#ff6a8a'][i % 3], 'opacity=".35"'); });
      o += r(0, 470, 960, 130, '#c8823a') + e(480, 520, 140, 40, 'none', 'stroke="#fff" stroke-width="5" opacity=".6"');
      o += hoop(120, 260, 1.1) + g('translate(960,0) scale(-1,1)', hoop(120, 260, 1.1)) + player(380, 380, 0.7) + player(600, 380, 0.7) + bball(490, 200, 40);
      return o;
    }
  };
})();
