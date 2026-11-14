(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function person(x, y, s, body, head, dis, look) {
    var bf = lg([body, '#bdb4dc']), hf = rg([['#ffffff', 0], [head, 0.6], ['#d9d2f0', 1]], 0.38, 0.32, 0.75);
    var o = e(0, 128, 84, 14, '#000', 'opacity=".25"') + d('M-84 130 C-84 52 -44 30 0 30 C44 30 84 52 84 130 Z', bf) + d('M-60 60 C-40 44 -20 40 0 40 L0 130 L-70 130 Z', '#fff', 'opacity=".14"');
    o += d('M-26 34 L0 62 L26 34 C16 30 8 29 0 29 C-8 29 -16 30 -26 34 Z', '#000', 'opacity=".1"');
    o += c(0, -32, 62, hf) + e(-24, -66, 22, 13, '#fff', 'opacity=".55"');
    if (dis) {
      o += sk('M-50 -70 C-40 -84 -16 -84 -8 -72', '#14141c', 10) + sk('M50 -70 C40 -84 16 -84 8 -72', '#14141c', 10);
      o += c(-24, -38, 21, '#fff', 'opacity=".35"') + c(24, -38, 21, '#fff', 'opacity=".35"') + c(-24, -38, 21, 'none', 'stroke="#14141c" stroke-width="9"') + c(24, -38, 21, 'none', 'stroke="#14141c" stroke-width="9"') + sk('M-4 -40 Q0 -46 4 -40', '#14141c', 7) + sk('M-46 -42 L-62 -48 M46 -42 L62 -48', '#14141c', 7);
      o += c(-30, -36, 7, '#14141c') + c(18, -36, 7, '#14141c') + c(-32, -39, 2.5, '#fff') + c(16, -39, 2.5, '#fff');
      o += d('M-6 -28 C-18 -4 -16 8 0 8 C16 8 18 -4 6 -28 Z', '#ff9e7a') + e(-5, -8, 4, 7, '#fff', 'opacity=".55"');
      o += d('M-42 18 C-32 2 -12 4 0 12 C12 4 32 2 42 18 C32 15 20 22 0 20 C-20 22 -32 15 -42 18 Z', '#14141c');
      o += d('M50 -64 C56 -54 60 -46 56 -40 C52 -34 44 -38 46 -46 C47 -52 49 -58 50 -64 Z', '#7fd4ff') + e(51, -45, 2.5, 4, '#fff', 'opacity=".8"');
    } else {
      var lx = look * 9;
      o += c(-22, -36, 13, '#fff') + c(22, -36, 13, '#fff') + c(-22 + lx, -35, 8, '#2a1a2a') + c(22 + lx, -35, 8, '#2a1a2a') + c(-20 + lx, -38, 2.6, '#fff') + c(24 + lx, -38, 2.6, '#fff');
      o += sk(look > 0 ? 'M-34 -58 L-12 -54 M12 -60 L34 -62' : 'M34 -58 L12 -54 M-12 -60 L-34 -62', '#2a1a2a', 6);
      o += sk(look > 0 ? 'M-10 0 Q4 -4 16 2' : 'M10 0 Q-4 -4 -16 2', '#2a1a2a', 6);
    }
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['undercover'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ff6a9a', 0], ['#c41f5c', 0.55], ['#5e0c36', 1]], 0.4, 0.3, 0.85));
      o += p([[200, -20], [90, 400], [310, 400]], '#fff', 'opacity=".1"');
      o += person(80, 266, 0.72, '#ece8fa', '#f7f4ff', false, 1) + person(320, 266, 0.72, '#ece8fa', '#f7f4ff', false, -1);
      o += person(200, 252, 1.12, '#ece8fa', '#f7f4ff', true);
      o += c(328, 82, 40, '#fff') + p([[300, 104], [292, 132], [318, 112]], '#fff') + t(328, 102, '?', 56, '#c41f5c');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#d0306a', '#3a0822'], 0.5, 0.45, 0.85));
      o += rep(7, function (i) { return person(90 + i * 130, 470 - (i % 2) * 40, 0.9, '#ece8fa', '#f7f4ff', i === 3, i < 3 ? 1 : -1); });
      o += rep(6, function (i) { return g('translate(' + (140 + i * 136) + ',' + (130 + (i % 2) * 40) + ') rotate(' + (i % 2 ? 8 : -8) + ')', r(-60, -36, 120, 72, '#fff', 12) + r(-40, -8, 80, 14, '#c41f5c', 7)); });
      return o;
    }
  };
})();
