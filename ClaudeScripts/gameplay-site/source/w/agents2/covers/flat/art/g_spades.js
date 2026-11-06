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
  var SP = 'M0 -34 C-10 -18 -38 -6 -36 12 C-34 26 -16 28 -4 18 L-10 34 L10 34 L4 18 C16 28 34 26 36 12 C38 -6 10 -18 0 -34 Z';
  function emblem(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', d(SP, '#000', 'transform="translate(3,5)" opacity=".35"') + d(SP, lg(['#fff2a0', '#e0a21c', '#8a5a08']), 'transform="scale(1.12)"') + d(SP, lg(['#4a5068', '#16181f', '#05060a'])) + d('M0 -28 C-8 -16 -28 -6 -28 6 C-20 -6 -8 -12 0 -18 Z', '#fff', 'opacity=".45"') + e(-16, 6, 6, 4, '#fff', 'opacity=".25"'));
  }
  G['spades'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a4a7a', 0], ['#161c34', 0.6], ['#05070e', 1]], 0.45, 0.3, 0.85));
      o += rep(12, function (i) { var a = i * 30 * Math.PI / 180; return p([[200, 230], [200 + Math.cos(a - 0.08) * 320, 230 + Math.sin(a - 0.08) * 320], [200 + Math.cos(a + 0.08) * 320, 230 + Math.sin(a + 0.08) * 320]], '#ffd84a', 'opacity=".08"'); });
      o += card(104, 160, 132, 186, -26, 'K', 'S') + card(200, 132, 132, 186, 0, 'A', 'S') + card(296, 160, 132, 186, 26, '2', 'S');
      o += emblem(200, 270, 3.7);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a3458', '#06080e'], 0.5, 0.45, 0.8));
      o += e(480, 300, 420, 240, '#1a5a3a') + e(480, 300, 400, 222, rg(['#24804e', '#0c3a22'], 0.5, 0.5, 0.6));
      o += card(480, 190, 100, 140, 0, 'A', 'S') + card(370, 300, 100, 140, 90, 'K', 'S') + card(590, 300, 100, 140, -90, 'Q', 'S') + card(480, 410, 100, 140, 180, '3', 'S');
      [[150, 120], [810, 120], [150, 480], [810, 480]].forEach(function (q, i) { o += rep(i + 2, function (k) { return card(q[0] + k * 10, q[1] - k * 6, 80, 112, -10 + k * 4, null, '#16181f'); }); });
      return o;
    }
  };
})();
