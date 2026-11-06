(function () {
  function pawn(x, y, s, f, dd, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')',
      e(0, 4, 44, 13, '#000', 'opacity=".25"') + e(0, 0, 40, 14, dd) + e(0, -6, 40, 14, f) +
      d('M-30 -8 L-14 -80 L14 -80 L30 -8 Z', f) + d('M4 -80 L14 -80 L30 -8 C22 -4 12 -2 2 -2 Z', dd, 'opacity=".5"') +
      e(0, -82, 22, 8, dd) + c(0, -108, 28, f) + d('M12 -132 A28 28 0 0 1 12 -84 A32 32 0 0 0 12 -132 Z', dd, 'opacity=".5"') +
      e(-10, -118, 8, 12, '#fff', 'opacity=".75" transform="rotate(-25 -10 -118)"') + sk('M-20 -16 L-9 -70', '#fff', 5, 'opacity=".45"'));
  }
  function slide(x, y, len, s, col, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')',
      r(0, -s * 0.28, len, s * 0.56, col, 4) + r(0, -s * 0.28, len, s * 0.16, '#fff', 4, 'opacity=".3"') + p([[-s * 0.1, -s * 0.55], [s * 0.6, 0], [-s * 0.1, s * 0.55]], col) + c(len, 0, s * 0.5, col) + c(len, 0, s * 0.5, 'none', 'stroke="#fff" stroke-width="' + s * 0.08 + '"'));
  }
  function track(x0, y0, n, s, dir) {
    return rep(n, function (i) { var x = dir ? x0 : x0 + i * s, y = dir ? y0 + i * s : y0; return r(x, y, s, s, '#fff', 0, 'stroke="#9fb6cf" stroke-width="3"'); });
  }
  function card(x, y, s, num, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')',
      r(-62, -86, 132, 180, '#000', 14, 'opacity=".25"') + r(-66, -92, 132, 180, '#fff', 14) + r(-58, -84, 116, 164, 'none', 10, 'stroke="#2d7cf0" stroke-width="6"') + t(0, 26, num, 92, '#e8322c', { font: 'Luckiest Guy', w: 400 }) + t(-38, -54, num, 26, '#2d7cf0', { font: 'Luckiest Guy', w: 400 }));
  }
  G['sorry'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#6fd0ff', '#2b8de8']));
      o += track(0, 300, 6, 70, 0) + r(0, 280, 400, 20, '#1d6cc2', 0, 'opacity=".35"');
      o += slide(40, 335, 250, 56, '#ffcc1a', 0);
      o += card(318, 168, 0.82, '11', 12);
      o += pawn(134, 346, 1.05, '#2d7cf0', '#1650b0', -62) + pawn(250, 330, 1.35, '#ef3b36', '#a8201c', 0);
      o += g('translate(110,92) rotate(-8)', d('M-96 -42 Q-96 -66 -72 -66 L72 -66 Q96 -66 96 -42 L96 22 Q96 46 72 46 L-6 46 L-30 78 L-34 46 L-72 46 Q-96 46 -96 22 Z', '#fff') + t(0, 8, 'SORRY!', 46, '#e8322c', { font: 'Luckiest Guy', w: 400 }));
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#dcefff');
      o += track(0, 0, 14, 70, 0) + track(0, 530, 14, 70, 0) + track(0, 70, 7, 70, 1) + track(890, 70, 7, 70, 1);
      o += slide(80, 35, 230, 56, '#ef3b36', 0) + slide(560, 35, 300, 56, '#2d7cf0', 0) + slide(150, 565, 260, 56, '#ffcc1a', 0) + slide(620, 565, 230, 56, '#22b34c', 0);
      o += c(250, 210, 80, '#ef3b36') + c(250, 210, 62, '#fff') + c(710, 400, 80, '#2d7cf0') + c(710, 400, 62, '#fff');
      o += card(480, 300, 1.4, '7', -10) + card(600, 280, 1.4, '4', 12);
      o += pawn(250, 240, 0.8, '#ef3b36', '#a8201c') + pawn(710, 430, 0.8, '#2d7cf0', '#1650b0') + pawn(380, 50, 0.6, '#22b34c', '#137a31') + pawn(820, 580, 0.6, '#ffcc1a', '#c48f00');
      return o;
    }
  };
})();
