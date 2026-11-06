(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function coin(x, y, R, n) {
    var o = e(x + 6, y + R * 0.5, R * 1.05, R * 0.5, '#000', 'opacity=".3"');
    for (var k = 0; k < n; k++) { var yk = y - k * R * 0.22; o += e(x, yk, R, R * 0.42, '#a8640a') + r(x - R, yk - R * 0.22, R * 2, R * 0.22, '#c27a08') + e(x, yk - R * 0.22, R, R * 0.42, lg(['#fff2a0', '#f5b21c', '#c27a08'])); }
    var yt = y - n * R * 0.22;
    return o + e(x, yt, R * 0.7, R * 0.28, 'none', 'stroke="#a8640a" stroke-width="' + R * 0.08 + '"') + e(x - R * 0.3, yt - R * 0.1, R * 0.3, R * 0.1, '#fff', 'opacity=".6"');
  }
  function figure() {
    var o = d('M-70 120 C-70 20 -56 -60 0 -96 C56 -60 70 20 70 120 Z', '#8a1424') + d('M-46 120 C-40 40 -30 -40 0 -66 C30 -40 40 40 46 120 Z', '#5a0a16');
    o += e(0, -16, 34, 42, '#1a0a0e') + d('M-30 -26 C-20 -40 20 -40 30 -26 L26 -6 C14 -12 -14 -12 -26 -6 Z', lg(['#fff2a0', '#e0a21c']));
    o += e(-13, -22, 7, 4, '#ff3a3a') + e(13, -22, 7, 4, '#ff3a3a') + d('M-70 120 L-50 60 L0 90 L50 60 L70 120 Z', '#5a0a16') + r(-70, 96, 140, 10, '#e0a21c');
    return o;
  }
  function icard(x, y, w, h, rot) {
    var o = r(-w / 2 + 8, -h / 2 + 10, w, h, '#000', 14, 'opacity=".35"') + r(-w / 2, -h / 2, w, h, lg(['#f6e6c0', '#d8bc84']), 14) + r(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, lg(['#2a6a7a', '#0c2a36']), 8);
    o += '<svg x="' + (-w / 2 + 10) + '" y="' + (-h / 2 + 10) + '" width="' + (w - 20) + '" height="' + (h - 20) + '" viewBox="-80 -120 160 240">' + c(0, -40, 70, '#ffe680', 'opacity=".25"') + figure() + '</svg>';
    o += r(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 'none', 8, 'stroke="#e0a21c" stroke-width="4"') + d('M' + (-w / 2 + 14) + ' ' + (-h / 2) + ' H' + (w / 2 - 14) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + 14) + ' Z', '#fff', 'opacity=".18"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  function dagger() { return p([[-9, 0], [9, 0], [0, -170]], lg(['#ffffff', '#9aa2b4'], 0, 0, 1, 0)) + r(-1.5, -150, 3, 150, '#7a8498') + r(-34, -2, 68, 14, lg(['#ffe680', '#c27a08']), 7) + r(-7, 12, 14, 50, '#3a1a0e', 5) + c(0, 68, 11, '#e8233a'); }
  G['coup'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2e7a8a', 0], ['#123a48', 0.6], ['#04141a', 1]], 0.45, 0.3, 0.85));
      o += g('translate(110,200) rotate(-16)', r(-74, -110, 148, 220, '#000', 14, 'opacity=".3" transform="translate(6,8)"') + r(-74, -110, 148, 220, '#f6e6c0', 14) + r(-64, -100, 128, 200, '#7a1424', 8) + star(0, 0, 40, 16, 4, '#e0a21c'));
      o += icard(222, 180, 176, 260, 8);
      o += g('translate(330,300) rotate(32)', dagger());
      o += coin(98, 352, 54, 4) + coin(178, 372, 44, 2);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#1e5a6a', '#030c10'], 0.5, 0.45, 0.85));
      o += r(0, 380, 960, 220, '#3a1a0e') + r(0, 380, 960, 10, '#5a2a14');
      o += icard(180, 300, 150, 220, -10) + icard(780, 300, 150, 220, 10);
      o += coin(400, 460, 40, 5) + coin(480, 470, 40, 3) + coin(560, 456, 40, 6) + g('translate(480,300) rotate(90)', dagger());
      o += rep(3, function (i) { return c(330 + i * 150, 120, 50, '#ffe680', 'opacity=".15"'); });
      return o;
    }
  };
})();
