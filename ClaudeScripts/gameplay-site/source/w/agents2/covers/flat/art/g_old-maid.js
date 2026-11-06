(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function maid() {
    var o = d('M-62 80 C-62 30 -40 10 0 10 C40 10 62 30 62 80 Z', '#9a4fc8') + d('M-30 14 L0 52 L30 14 Z', '#f3e6ff') + c(0, 30, 6, '#e8333f');
    o += c(0, -40, 44, '#c9ced8') + c(0, -92, 24, '#c9ced8') + c(-6, -98, 8, '#fff', 'opacity=".5"');
    o += e(0, -24, 38, 42, '#f7d4b4') + d('M-38 -36 C-36 -70 36 -70 38 -36 C26 -52 -26 -52 -38 -36 Z', '#d8dce6');
    o += c(-15, -26, 13, '#fff', 'stroke="#5a2a8a" stroke-width="4"') + c(15, -26, 13, '#fff', 'stroke="#5a2a8a" stroke-width="4"') + ln(-2, -26, 2, -26, '#5a2a8a', 4) + c(-15, -25, 4.5, '#16181f') + c(15, -25, 4.5, '#16181f');
    o += c(-24, -6, 7, '#ff8aa8', 'opacity=".6"') + c(24, -6, 7, '#ff8aa8', 'opacity=".6"') + sk('M-12 2 Q0 12 12 2', '#a3412a', 3.5) + e(0, -14, 4, 5, '#e8b090');
    return o;
  }
  function mcard(x, y, w, h, rot, face) {
    var o = r(-w / 2 + 8, -h / 2 + 10, w, h, '#000', 18, 'opacity=".28"') + r(-w / 2, -h / 2, w, h, '#fff', 18);
    if (face) o += r(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, lg(['#fff3c4', '#ffd88a']), 12) + g('translate(0,' + h * 0.04 + ') scale(' + w / 170 + ')', maid());
    else o += r(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, '#ff6fa8', 12) + rep(4, function (i) { return rep(5, function (j) { return c(-w / 2 + 28 + i * (w - 56) / 3, -h / 2 + 28 + j * (h - 56) / 4, w * 0.05, '#fff', 'opacity=".55"'); }); }) + c(0, 0, w * 0.2, 'none', 'stroke="#fff" stroke-width="' + w * 0.04 + '" opacity=".8"');
    o += d('M' + (-w / 2 + 18) + ' ' + (-h / 2) + ' H' + (w / 2 - 18) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + 18) + ' Z', '#fff', 'opacity=".25"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  G['old-maid'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#e2b8ff', 0], ['#a466e0', 0.6], ['#5e2aa0', 1]], 0.45, 0.3, 0.85));
      o += mcard(104, 222, 140, 200, -22) + mcard(296, 222, 140, 200, 22);
      o += mcard(200, 198, 176, 250, 0, 1);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#c99ae8');
      o += rep(12, function (i) { return rep(8, function (j) { var x = i * 84 + (j % 2) * 42, y = j * 80; return c(x, y, 14, '#e8c6ff') + c(x, y, 6, '#ff8ab8'); }); });
      o += r(0, 420, 960, 180, '#7a4a2a') + r(0, 420, 960, 16, '#9a6a3a');
      o += mcard(300, 300, 150, 214, -12) + mcard(420, 290, 150, 214, -4) + mcard(540, 290, 150, 214, 4, 1) + mcard(660, 300, 150, 214, 12);
      o += e(840, 470, 70, 18, '#fff') + r(790, 400, 100, 70, '#fff', 30) + d('M886 418 C920 418 920 452 886 452', 'none', 'stroke="#fff" stroke-width="10"') + r(790, 420, 100, 14, '#ff6fa8');
      return o;
    }
  };
})();
