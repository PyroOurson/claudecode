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
  function bolt(s, col) { return g('scale(' + s + ')', p([[22, -110], [-58, 14], [-6, 14], [-30, 110], [58, -22], [6, -22], [34, -110]], col)); }
  G['speed'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg([['#22e0ff', 0], ['#3a5af0', 0.55], ['#2a0f8a', 1]], 0, 0, 1, 1));
      o += rep(9, function (i) { var y = 40 + i * 42; return r(-20, y, 120 + (i * 53) % 140, 8, '#fff', 4, 'opacity=".35"'); });
      o += card(130, 214, 140, 196, -18, '5', 'D') + card(200, 196, 140, 196, -6, '6', 'C') + card(272, 186, 140, 196, 8, '7', 'H');
      o += g('translate(288,286) rotate(10)', bolt(1.12, '#16181f')) + g('translate(282,278) rotate(10)', bolt(1.12, lg(['#fff6a0', '#ffd21a', '#ff9a0a'])));
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg([['#1ac8f0', 0], ['#3040c8', 0.6], ['#1a0a5a', 1]], 0, 0, 1, 1));
      o += rep(24, function (i) { var q = rnd(i + 5); return r(q() * 900 - 100, q() * 600, 160 + q() * 260, 10, '#fff', 5, 'opacity=".25"'); });
      o += card(400, 300, 130, 182, -6, '9', 'S') + card(560, 300, 130, 182, 6, '10', 'D');
      [[140, 500], [260, 520], [700, 520], [820, 500]].forEach(function (q, i) { o += card(q[0], q[1], 110, 154, (i - 1.5) * 8, ['3', 'J', '8', 'Q'][i], ['H', 'C', 'D', 'S'][i]); });
      [[140, 90], [260, 80], [700, 80], [820, 90]].forEach(function (q) { o += card(q[0], q[1], 110, 154, 180, null, '#1a6a3a'); });
      o += g('translate(480,300)', bolt(1.2, '#ffd21a'));
      return o;
    }
  };
})();
