(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function slime(x, y, R, col, dk, dir, lx, ly) {
    var o = e(x, y + 6, R * 1.05, R * 0.12, '#000', 'opacity=".25"');
    o += d('M' + (x - R) + ' ' + y + ' A' + R + ' ' + R + ' 0 0 1 ' + (x + R) + ' ' + y + ' Z', dk);
    o += d('M' + (x - R * 0.94) + ' ' + y + ' A' + R * 0.94 + ' ' + R * 0.94 + ' 0 0 1 ' + (x + R * 0.94) + ' ' + y + ' Z', rg([[col, 0], [col, 0.6], [dk, 1]], 0.4, 0.55, 0.8));
    o += e(x - R * 0.42, y - R * 0.66, R * 0.26, R * 0.12, '#fff', 'opacity=".5" transform="rotate(-30 ' + (x - R * 0.42) + ' ' + (y - R * 0.66) + ')"');
    var ex = x + dir * R * 0.42, ey = y - R * 0.56, er = R * 0.2;
    o += c(ex, ey, er, '#fff', 'stroke="' + dk + '" stroke-width="3"');
    var a = Math.atan2(ly - ey, lx - ex);
    o += c(ex + Math.cos(a) * er * 0.45, ey + Math.sin(a) * er * 0.45, er * 0.5, '#1b1d24') + c(ex + Math.cos(a) * er * 0.45 - er * 0.15, ey + Math.sin(a) * er * 0.45 - er * 0.18, er * 0.15, '#fff');
    return o;
  }
  function vball(x, y, R) {
    var o = c(x, y, R, rg([['#fff6b0', 0], ['#ffd21a', 0.6], ['#e8a000', 1]], 0.38, 0.32, 0.75));
    o += sk('M' + (x - R) + ' ' + y + ' C' + (x - R * 0.4) + ' ' + (y - R * 0.4) + ' ' + (x + R * 0.4) + ' ' + (y - R * 0.4) + ' ' + (x + R) + ' ' + y, '#c47a00', 3) + sk('M' + x + ' ' + (y - R) + ' C' + (x + R * 0.5) + ' ' + (y - R * 0.3) + ' ' + (x + R * 0.5) + ' ' + (y + R * 0.3) + ' ' + x + ' ' + (y + R), '#c47a00', 3);
    return o + c(x - R * 0.35, y - R * 0.4, R * 0.18, '#fff', 'opacity=".8"');
  }
  function net(x, top, base) {
    var o = r(x - 6, top, 12, base - top, '#e8ecf4', 4) + r(x - 6, top, 4, base - top, '#fff');
    o += r(x - 4, top + 6, 8, (base - top) * 0.5, '#fff', 0, 'opacity=".25"');
    return o;
  }
  G['slime-volley'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a8ae8', '#7ac4ff', '#c8ecff']));
      o += e(80, 70, 60, 18, '#fff', 'opacity=".75"') + e(310, 120, 50, 14, '#fff', 'opacity=".6"');
      o += r(0, 312, 400, 88, '#f0c878') + r(0, 312, 400, 8, '#fff2c8') + rep(10, function (i) { return c(20 + i * 42, 350 + (i % 3) * 14, 3, '#d8a858'); });
      o += r(194, 196, 12, 116, '#fff') + rep(7, function (i) { return ln(194, 200 + i * 16, 206, 200 + i * 16, '#9aa0ae', 2); }) + r(190, 188, 20, 12, '#d8dce6', 4);
      o += sk('M118 250 Q160 60 238 120', '#fff', 4, 'stroke-dasharray="3 12" opacity=".9"');
      o += slime(104, 312, 88, '#ff5a3a', '#b8281a', 1, 250, 112) + slime(306, 312, 76, '#2ad0c0', '#108a80', -1, 250, 112);
      o += vball(250, 112, 30);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a7ad8', '#8acaff', '#d8f0ff']));
      o += r(0, 450, 960, 150, '#e8c070') + r(474, 280, 12, 170, '#fff');
      o += rep(5, function (i) { return e(100 + i * 200, 90 + (i % 2) * 40, 80, 22, '#fff', 'opacity=".7"'); });
      o += slime(240, 450, 120, '#ff5a3a', '#b8281a', 1, 520, 180) + slime(720, 450, 120, '#2ad0c0', '#108a80', -1, 520, 180) + vball(520, 180, 40);
      return o;
    }
  };
})();
