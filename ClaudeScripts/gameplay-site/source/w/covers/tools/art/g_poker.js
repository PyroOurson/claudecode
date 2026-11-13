(function () {
  function red(su) { return su === 'H' || su === 'D'; }
  function fig(rk, col) {
    var o = r(-36, -48, 72, 96, 'none', 6, 'stroke="' + col + '" stroke-width="2.5" opacity=".6"');
    o += d('M-30 46 L-30 22 C-30 6 -18 0 0 0 C18 0 30 6 30 22 L30 46 Z', col) + p([[-15, 0], [0, 16], [15, 0]], '#f5d26a') + r(-2.5, 14, 5, 32, '#f5d26a') + r(-30, 36, 60, 5, '#f5d26a');
    if (rk === 'Q') o += d('M-16 -10 C-22 -30 -12 -38 0 -38 C12 -38 22 -30 16 -10 L12 2 L-12 2 Z', '#7a3b12');
    o += c(0, -18, 13, '#f7d4b4') + c(-4.5, -20, 1.8, '#222') + c(4.5, -20, 1.8, '#222') + sk('M-4 -12 Q0 -9 4 -12', '#a3412a', 1.6);
    if (rk === 'K') o += d('M-13 -16 C-14 4 14 4 13 -16 C8 -9 -8 -9 -13 -16 Z', '#8a5a2a') + p([[-15, -29], [-15, -44], [-7.5, -36], [0, -47], [7.5, -36], [15, -44], [15, -29]], '#f5c542') + c(0, -47, 2.5, '#e8333f');
    if (rk === 'Q') o += p([[-12, -30], [-12, -40], [-6, -35], [0, -42], [6, -35], [12, -40], [12, -30]], '#f5c542') + c(0, -42, 2.2, '#2f74e0');
    if (rk === 'J') o += d('M-17 -26 C-16 -40 16 -40 17 -26 Z', col) + r(-17, -28, 34, 4, '#f5d26a', 2) + d('M10 -34 C22 -50 30 -44 26 -36 C22 -40 16 -38 12 -32 Z', '#f5d26a');
    return o;
  }
  function card(x, y, w, h, rot, rk, su, back) {
    var col = red(su) ? '#d81e2c' : '#16181f', R = w * 0.1;
    var o = r(-w / 2 + w * 0.05, -h / 2 + h * 0.05, w, h, '#000', R, 'opacity=".3"');
    o += r(-w / 2, -h / 2, w, h, lg(['#ffffff', '#e9ecf3']), R) + r(-w / 2, -h / 2, w, h, 'none', R, 'stroke="#c3c8d4" stroke-width="' + w * 0.015 + '"');
    if (rk) {
      o += t(-w / 2 + w * 0.2, -h / 2 + w * 0.3, rk, w * (rk.length > 1 ? 0.21 : 0.26), col, { ls: rk.length > 1 ? -2 : undefined }) + g('translate(' + (-w / 2 + w * 0.2) + ',' + (-h / 2 + w * 0.48) + ')', D_suit(su, w * 0.0032, col));
      if (rk === 'J' || rk === 'Q' || rk === 'K') o += g('translate(' + w * 0.06 + ',' + h * 0.06 + ') scale(' + w * 0.0085 + ')', fig(rk, col === '#16181f' ? '#2a4fb8' : col));
      else o += g('translate(0,' + h * 0.08 + ')', D_suit(su, w * 0.0105, col));
    } else {
      var bc = back || (su && su.charAt(0) === '#' ? su : '#b3142a');
      o += r(-w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, bc, w * 0.06) + r(-w / 2 + w * 0.16, -h / 2 + w * 0.16, w * 0.68, h - w * 0.32, 'none', w * 0.04, 'stroke="#fff" stroke-width="' + w * 0.03 + '" opacity=".55"') + g('translate(0,0)', D_suit('D', w * 0.006, '#fff'), 'opacity=".55"');
    }
    o += d('M' + (-w / 2 + R) + ' ' + (-h / 2) + ' H' + (w / 2 - R) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + R) + ' Z', '#fff', 'opacity=".22"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function chips(x, y, rx, n, col, dk) {
    var ry = rx * 0.42, hh = rx * 0.2, o = e(x + rx * 0.12, y + ry + rx * 0.06, rx * 1.08, ry * 1.1, '#000', 'opacity=".35"');
    for (var k = 0; k < n; k++) {
      var yk = y - k * hh;
      o += e(x, yk, rx, ry, dk) + r(x - rx, yk - hh, rx * 2, hh, dk);
      o += rep(4, function (i) { var a = -0.8 + i * 0.55; return r(x + Math.sin(a) * rx - rx * 0.08, yk - hh, rx * 0.16, hh, '#fff', 0, 'opacity=".9"'); });
      o += e(x, yk - hh, rx, ry, col);
    }
    var yt = y - n * hh;
    o += e(x, yt, rx * 0.8, ry * 0.8, 'none', 'stroke="#fff" stroke-width="' + ry * 0.26 + '" stroke-dasharray="' + rx * 0.3 + ' ' + rx * 0.3 + '"');
    o += e(x, yt, rx * 0.55, ry * 0.55, dk) + e(x, yt, rx * 0.48, ry * 0.48, col) + e(x - rx * 0.3, yt - ry * 0.35, rx * 0.35, ry * 0.22, '#fff', 'opacity=".35"');
    return o;
  }
  G['poker'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2bb066', 0], ['#0e6b38', 0.7], ['#08401f', 1]], 0.45, 0.35, 0.8));
      o += e(200, 470, 330, 200, 'none', 'stroke="#f2c14e" stroke-width="5" opacity=".5"');
      o += card(152, 168, 168, 236, -14, 'A', 'S') + card(252, 172, 168, 236, 12, 'A', 'H');
      o += chips(96, 352, 64, 5, '#e8333f', '#a3121f') + chips(214, 368, 64, 3, '#2a2d38', '#121318') + chips(326, 350, 64, 6, '#2f74e0', '#1a4aa0');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#3a1a10', '#120604'], 0.5, 0.5, 0.8));
      o += e(480, 310, 470, 270, '#4a250f') + e(480, 300, 450, 250, '#6b3a1a') + e(480, 300, 410, 214, rg(['#22a05a', '#0c5c30'], 0.5, 0.45, 0.6));
      o += e(480, 300, 330, 160, 'none', 'stroke="#f2c14e" stroke-width="4" opacity=".45"');
      [['K', 'S'], ['10', 'H'], ['Q', 'D'], ['J', 'C'], ['9', 'S']].forEach(function (q, i) { o += card(300 + i * 90, 300, 78, 110, 0, q[0], q[1]); });
      o += chips(470, 410, 34, 6, '#e8333f', '#a3121f') + chips(530, 404, 34, 4, '#2f74e0', '#1a4aa0') + chips(410, 404, 34, 3, '#2a2d38', '#121318');
      [[170, 190, -30], [250, 470, 20], [480, 110, 0], [720, 470, -20], [800, 190, 30]].forEach(function (q) { o += card(q[0], q[1], 64, 90, q[2]) + card(q[0] + 30, q[1] + 6, 64, 90, q[2] + 10) + chips(q[0] + (q[0] < 480 ? 70 : -40), q[1] + 60, 22, 4, '#e8333f', '#a3121f'); });
      return o;
    }
  };
})();
