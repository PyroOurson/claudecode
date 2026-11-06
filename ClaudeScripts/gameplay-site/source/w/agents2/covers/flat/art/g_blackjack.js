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
  function chip(x, y, R, col) { return c(x + 4, y + 6, R, '#000', 'opacity=".3"') + c(x, y, R, col) + c(x, y, R * 0.78, 'none', 'stroke="#fff" stroke-width="' + R * 0.2 + '" stroke-dasharray="' + R * 0.36 + ' ' + R * 0.36 + '"') + c(x, y, R * 0.55, '#fff', 'opacity=".25"') + c(x, y, R * 0.48, col); }
  G['blackjack'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3d8cf0', 0], ['#1650b8', 0.6], ['#0a2766', 1]], 0.45, 0.3, 0.85));
      o += sk('M-20 330 Q200 230 420 330', '#ffd34d', 6, 'opacity=".55"');
      o += card(148, 160, 170, 238, -13, 'A', 'S') + card(252, 166, 170, 238, 11, 'J', 'S');
      o += c(206, 322, 80, '#000', 'opacity=".3"') + c(200, 314, 80, lg(['#ffe680', '#f0a81c', '#b86a0a'])) + c(200, 314, 66, 'none', 'stroke="#7a4300" stroke-width="5" stroke-dasharray="12 9"') + c(200, 314, 58, lg(['#1d2a55', '#0c1430']));
      o += t(200, 342, '21', 76, '#ffd34d', { ls: -3 }) + d('M138 286 C160 252 230 244 262 270 C230 262 170 266 138 300 Z', '#fff', 'opacity=".35"');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a6fd8', '#0a2766'], 0.5, 0.2, 0.9));
      o += d('M-40 -20 H1000 V40 C760 110 200 110 -40 40 Z', '#3a1d0e') + d('M-40 40 C200 110 760 110 1000 40 V60 C760 130 200 130 -40 60 Z', '#6b3a1a');
      o += sk('M60 250 Q480 520 900 250', '#ffd34d', 6, 'opacity=".7"') + sk('M120 210 Q480 440 840 210', '#fff', 3, 'opacity=".5"');
      [[150, 350], [300, 440], [480, 470], [660, 440], [810, 350]].forEach(function (q, i) { o += e(q[0], q[1], 64, 44, 'none', 'stroke="#fff" stroke-width="4" opacity=".6"') + chip(q[0] - 14, q[1] + 6, 26, ['#e8333f', '#1c1c1c', '#2fae4a', '#e8333f', '#7a3fd0'][i]) + card(q[0] + 4, q[1] - 90, 70, 98, -8, ['10', '9', 'A', '7', 'J'][i], ['S', 'H', 'D', 'C', 'H'][i]) + card(q[0] + 30, q[1] - 84, 70, 98, 8, ['A', '8', 'Q', '6', '5'][i], ['H', 'C', 'S', 'D', 'S'][i]); });
      o += card(430, 170, 80, 112, -4, 'K', 'S') + card(520, 170, 80, 112, 4) + r(330, 50, 300, 54, '#14204a', 10) + rep(8, function (i) { return r(342 + i * 36, 58, 28, 40, ['#e8333f', '#1c1c1c', '#2fae4a', '#7a3fd0'][i % 4], 6); });
      return o;
    }
  };
})();
