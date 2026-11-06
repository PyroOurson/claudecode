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
  function board(w, h) {
    var o = r(-w / 2 + 8, -h / 2 + 14, w, h, '#000', h / 2, 'opacity=".35"') + r(-w / 2, -h / 2 + 8, w, h, '#a8642a', h / 2) + r(-w / 2, -h / 2, w, h, lg(['#ffd896', '#e8a85a', '#c8803a']), h / 2);
    o += rep(5, function (k) { return d('M' + (-w / 2 + 30) + ' ' + (-h / 2 + 14 + k * 14) + ' C' + (-w / 6) + ' ' + (-h / 2 + 8 + k * 14) + ' ' + (w / 6) + ' ' + (-h / 2 + 22 + k * 14) + ' ' + (w / 2 - 30) + ' ' + (-h / 2 + 12 + k * 14), 'none', 'stroke="#b8763a" stroke-width="2" opacity=".5"'); });
    [-1, 0, 1].forEach(function (row) { for (var i = 0; i < 12; i++) { var x = -w / 2 + 44 + i * (w - 88) / 11 + (i > 5 ? 10 : 0); o += c(x, row * h * 0.26, 5.5, '#5a2a0a') + c(x + 1, row * h * 0.26 + 1, 3, '#2a1004'); } });
    return o;
  }
  function peg(x, y, col, dk) { return e(x + 4, y + 2, 9, 4, '#000', 'opacity=".35"') + r(x - 6, y - 52, 12, 52, lg([col, dk], 0, 0, 1, 0), 6) + c(x, y - 54, 11, col) + c(x - 3.5, y - 57, 4, '#fff', 'opacity=".6"'); }
  G['cribbage'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a7a4a', 0], ['#1e4a2a', 0.6], ['#0a2412', 1]], 0.45, 0.3, 0.85));
      o += card(166, 134, 140, 196, -16, '5', 'H') + card(248, 128, 140, 196, 4, '5', 'C') + card(326, 144, 140, 196, 22, 'J', 'D');
      o += g('translate(200,290) rotate(-14)', board(440, 128) + peg(-104, -33, '#e8333f', '#8a0a14') + peg(-30, -33, '#e8333f', '#8a0a14') + peg(44, 0, '#2a6af0', '#123a98') + peg(118, 0, '#2a6af0', '#123a98'));
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#5a2e14');
      o += rep(10, function (i) { return r(0, i * 64, 960, 4, '#3a1a08', 0, 'opacity=".7"') + r(0, i * 64 + 30, 960, 2, '#7a4a24', 0, 'opacity=".6"'); });
      o += g('translate(480,330) rotate(-6)', board(860, 200) + peg(-200, -52, '#e8333f', '#8a0a14') + peg(100, 0, '#2a6af0', '#123a98') + peg(260, 52, '#f6f6f6', '#9aa2b4'));
      [['5', 'S'], ['10', 'H'], ['J', 'C'], ['5', 'D']].forEach(function (q, i) { o += card(300 + i * 110, 120, 100, 140, (i - 1.5) * 6, q[0], q[1]); });
      return o;
    }
  };
})();
