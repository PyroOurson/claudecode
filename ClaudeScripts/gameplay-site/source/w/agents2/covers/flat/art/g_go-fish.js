(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function fish(col, dk) { return d('M-60 0 C-40 -40 30 -44 60 0 C30 44 -40 40 -60 0 Z', col) + p([[50, 0], [92, -34], [84, 0], [92, 34]], dk) + d('M-10 -34 C0 -56 26 -52 30 -30 Z', dk) + d('M-40 6 C-20 30 20 32 50 8 C20 40 -30 38 -40 6 Z', '#000', 'opacity=".12"') + c(-30, -8, 13, '#fff') + c(-33, -8, 7, '#16181f') + c(-35, -11, 2.4, '#fff') + sk('M-52 12 Q-46 18 -40 14', '#16181f', 3) + sk('M4 -20 Q14 0 4 20', dk, 5) + sk('M22 -18 Q32 0 22 18', dk, 5) + d('M-48 -14 C-30 -36 10 -36 30 -24 C0 -28 -30 -24 -48 -14 Z', '#fff', 'opacity=".4"'); }
  function fcard(x, y, w, h, rot, col, dk, n) { return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', r(-w / 2 + 8, -h / 2 + 10, w, h, '#000', 18, 'opacity=".25"') + r(-w / 2, -h / 2, w, h, '#fff', 18) + r(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, lg(['#fff7d6', '#ffd47a']), 12) + (n ? c(0, -h / 2 + 24, 9, '#0a5aa8') + t(-w / 2 + 30, -h / 2 + 50, n, 34, '#0a5aa8') + t(w / 2 - 30, h / 2 - 22, n, 34, '#0a5aa8') : '') + g('translate(0,' + h * 0.04 + ') scale(' + w / 190 + ')', fish(col, dk)) + d('M' + (-w / 2 + 18) + ' ' + (-h / 2) + ' H' + (w / 2 - 18) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + 18) + ' Z', '#fff', 'opacity=".3"')); }
  G['go-fish'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#62e0f5', '#1aa3dc', '#0a5aa8']));
      o += c(70, 70, 44, '#fff', 'opacity=".25"');
      o += fcard(196, 196, 204, 262, 8, '#ff8a1a', '#d4520a', '7');
      o += sk('M214 -10 L214 76', '#f6f6f6', 4) + sk('M214 72 L214 96 C214 114 234 114 236 98', '#c9ced8', 9) + p([[229, 90], [244, 94], [236, 104]], '#c9ced8') + ln(211, 74, 211, 94, '#fff', 3, 'opacity=".8"');
      o += c(120, 300, 7, '#bff3ff') + c(104, 276, 5, '#bff3ff') + c(300, 310, 8, '#bff3ff') + c(318, 286, 5, '#bff3ff');
      o += d('M0 300 C50 280 90 320 140 300 C190 280 230 320 280 300 C330 280 370 320 400 300 V400 H0 Z', '#0a6ab8', 'opacity=".85"') + d('M0 330 C50 310 90 350 140 330 C190 310 230 350 280 330 C330 310 370 350 400 330 V400 H0 Z', '#084c8a');
      o += sk('M0 300 C50 280 90 320 140 300 C190 280 230 320 280 300 C330 280 370 320 400 300', '#bff3ff', 6, 'opacity=".8"');
      o += c(80, 360, 9, 'none', 'stroke="#bff3ff" stroke-width="3"') + c(330, 352, 12, 'none', 'stroke="#bff3ff" stroke-width="3"') + c(350, 380, 6, 'none', 'stroke="#bff3ff" stroke-width="3"');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#3fc8ef', '#0a5aa8', '#062e62']));
      o += rep(6, function (i) { return p([[i * 190 + 40, 0], [i * 190 + 120, 0], [i * 190 + 220, 600], [i * 190 + 120, 600]], '#fff', 'opacity=".06"'); });
      [[160, 200, -14, '#ff8a1a', '#d4520a'], [340, 360, 10, '#ffd21a', '#d49a0a'], [640, 220, -6, '#ff5a8a', '#c4205a'], [820, 380, 14, '#7ae05a', '#3a9a2a'], [480, 150, 4, '#ff8a1a', '#d4520a']].forEach(function (q) { o += fcard(q[0], q[1], 150, 204, q[2], q[3], q[4]); });
      o += d('M0 520 C120 490 240 540 360 510 C480 480 600 540 720 510 C840 480 900 520 960 510 V600 H0 Z', '#e8c98a') + rep(12, function (i) { return c(30 + i * 80, 470 - (i % 3) * 120, 8 + (i % 4) * 3, 'none', 'stroke="#bff3ff" stroke-width="3"'); });
      return o;
    }
  };
})();
