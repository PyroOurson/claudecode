(function () {
  function block(x, y, w, h, red) {
    var f = red ? lg(['#ff5a4a', '#d42a1e']) : lg(['#f6d29a', '#e2b06a']), dk = red ? '#8e1510' : '#9a6a30', o = '';
    o += r(x + 4, y + 8, w, h, '#000', 12, 'opacity=".35"') + r(x, y + 5, w, h, dk, 12) + r(x, y, w, h, f, 12) + r(x + 8, y + 6, w - 16, 10, '#fff', 5, 'opacity=".4"');
    if (!red) { var q = rnd(Math.round(x * 3 + y * 7 + w)); for (var k = 0; k < 4; k++) { var yy = y + 18 + q() * (h - 30), xx = x + 18 + q() * (w - 30); o += w > h ? sk('M' + (x + 12) + ' ' + yy + ' Q' + (x + w / 2) + ' ' + (yy + (q() - 0.5) * 12) + ' ' + (x + w - 12) + ' ' + yy, '#c88a40', 2.5, 'opacity=".5"') : sk('M' + xx + ' ' + (y + 12) + ' Q' + (xx + (q() - 0.5) * 12) + ' ' + (y + h / 2) + ' ' + xx + ' ' + (y + h - 12), '#c88a40', 2.5, 'opacity=".5"'); } }
    else o += p([[x + w * 0.36, y + h * 0.3], [x + w * 0.64, y + h / 2], [x + w * 0.36, y + h * 0.7]], '#fff') + r(x + w * 0.2, y + h * 0.42, w * 0.2, h * 0.16, '#fff', 3);
    return o;
  }
  function tray(x0, y0, s, n, exitRow, pad) {
    var W = n * s + 2 * pad;
    return r(x0 - pad + 6, y0 - pad + 12, W, W, '#000', 30, 'opacity=".35"') + r(x0 - pad, y0 - pad, W, W, lg(['#7a4320', '#4e2810']), 30) + r(x0 - pad + 8, y0 - pad + 6, W - 16, 12, '#fff', 6, 'opacity=".15"') + r(x0, y0, n * s, n * s, '#3a1e0a', 8) + r(x0 + n * s - 4, y0 + exitRow * s + 6, pad + 8, s - 12, '#3a1e0a');
  }
  function place(x0, y0, s, B) { return B.map(function (b) { var gp = 5; return block(x0 + b[0] * s + gp, y0 + b[1] * s + gp, b[2] * s - 2 * gp, b[3] * s - 2 * gp, b[4]); }).join(''); }
  G['unblock-me'] = {
    icon: function () {
      var s = 58, x0 = 26, y0 = 26;
      var o = r(0, 0, 400, 400, '#5a2f14') + tray(x0, y0, s, 6, 2, 26);
      o += place(x0, y0, s, [[0, 0, 1, 3], [1, 0, 2, 1], [3, 0, 1, 2], [4, 0, 2, 1], [5, 1, 1, 3], [2, 1, 1, 1], [0, 3, 3, 1], [3, 3, 1, 2], [4, 4, 2, 1], [1, 4, 1, 2], [2, 4, 1, 2], [4, 5, 2, 1]]);
      o += place(x0, y0, s, [[1.4, 2, 2, 1, 1]]);
      o += sk('M' + (x0 + 3.6 * s) + ' ' + (y0 + 2.5 * s) + ' L' + (x0 + 4.7 * s) + ' ' + (y0 + 2.5 * s), '#fff', 9, 'stroke-dasharray="4 16" opacity=".85"');
      return o;
    },
    bg: function () {
      var s = 90, x0 = 210, y0 = 30;
      var o = r(0, 0, 960, 600, lg(['#c98a4f', '#8a5228'])) + tray(x0, y0, s, 6, 2, 40);
      o += place(x0, y0, s, [[0, 0, 1, 2], [1, 0, 3, 1], [4, 0, 1, 2], [5, 0, 1, 3], [0, 2, 2, 1, 1], [2, 1, 1, 3], [3, 2, 1, 2], [0, 3, 2, 1], [4, 3, 2, 1], [0, 4, 1, 2], [1, 5, 3, 1], [4, 4, 1, 2], [5, 4, 1, 2]]);
      return o;
    }
  };
})();
