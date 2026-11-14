(function () {
  var OL = '#26190d';
  function S(w) { return 'stroke="' + OL + '" stroke-width="' + (w || 6) + '" stroke-linejoin="round"'; }
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".38" stop-color="#fff" stop-opacity=".05"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function shooter(x, y, s, frost) {
    var hd = frost ? rg([['#e6fbff', 0], ['#8fd8f0', 0.55], ['#3c9cc4', 1]], 0.35, 0.3, 0.8) : rg([['#d8ff9a', 0], ['#86d63e', 0.5], ['#3f8f1e', 1]], 0.35, 0.3, 0.8);
    var sn = frost ? lg(['#bdefff', '#58b4d8']) : lg(['#a6ec5c', '#4ea524']);
    var lf = frost ? '#5fc0e0' : '#4ea524', lf2 = frost ? '#8fe0f8' : '#7fd23a';
    var o = e(0, 156, 70, 14, '#000', 'opacity=".25"');
    o += d('M-6 150 C-14 110 -2 70 -4 40 L12 40 C14 74 6 112 14 150 Z', '#3f8f1e', S(6));
    o += d('M4 148 C-30 112 -78 118 -92 140 C-60 160 -24 160 4 148 Z', lf, S(6)) + d('M6 148 C40 118 84 124 96 144 C64 162 30 160 6 148 Z', lf, S(6));
    o += d('M-58 -40 C-110 -70 -126 -40 -120 -10 C-96 -30 -74 -30 -58 -24 Z', lf, S(6)) + d('M-50 -64 C-84 -118 -54 -136 -30 -126 C-40 -100 -40 -84 -34 -70 Z', lf2, S(6));
    o += r(30, -46, 112, 84, sn, 34, S(7));
    o += e(144, -4, 28, 50, frost ? '#9ee4fa' : '#8fe04a', S(7)) + e(148, -4, 16, 34, frost ? '#14506a' : '#1e4a0e');
    o += c(0, 0, 88, hd, S(7));
    o += e(-30, -46, 34, 18, '#fff', 'opacity=".5" transform="rotate(-32 -30 -46)"');
    o += e(34, -28, 18, 26, '#14100c') + c(40, -38, 8, '#fff') + c(30, -16, 3.5, '#fff', 'opacity=".7"');
    o += sk('M10 -66 Q30 -76 52 -62', OL, 6);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function pea(x, y, rr, frost) {
    return c(x, y, rr, frost ? rg([['#ffffff', 0], ['#a8ecff', 0.5], ['#4cb0d8', 1]], 0.35, 0.3, 0.75) : rg([['#e2ffb0', 0], ['#8fe04a', 0.5], ['#3f8f1e', 1]], 0.35, 0.3, 0.75), S(rr > 18 ? 6 : 4)) + e(x - rr * 0.35, y - rr * 0.38, rr * 0.34, rr * 0.22, '#fff', 'opacity=".7" transform="rotate(-30 ' + (x - rr * 0.35) + ' ' + (y - rr * 0.38) + ')"');
  }
  function sunflower(x, y, s) {
    var o = e(0, 108, 50, 10, '#000', 'opacity=".25"');
    o += d('M-6 106 C-10 70 2 40 -4 20 L8 20 C12 44 2 72 8 106 Z', '#3f8f1e', S(5));
    o += d('M2 96 C-24 70 -58 78 -66 94 C-42 108 -20 106 2 96 Z', '#4ea524', S(5));
    o += rep(14, function (k) { var a = k * 360 / 14; return e(0, -52, 15, 28, '#ffd23f', S(4) + ' transform="rotate(' + a + ')"'); });
    o += c(0, 0, 38, rg([['#d6884a', 0], ['#9a5a22', 1]], 0.4, 0.35, 0.7), S(5));
    o += e(-12, -6, 5, 8, '#14100c') + e(12, -6, 5, 8, '#14100c') + sk('M-14 12 Q0 24 14 12', OL, 5);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function nut(x, y, s) {
    var o = e(0, 74, 56, 12, '#000', 'opacity=".25"');
    o += e(0, 0, 58, 72, rg([['#e8b46a', 0], ['#b4782e', 0.7], ['#80501c', 1]], 0.35, 0.3, 0.8), S(6));
    o += e(-20, -16, 9, 13, '#fff', S(4)) + e(18, -16, 9, 13, '#fff', S(4)) + c(-17, -14, 4.5, '#14100c') + c(21, -14, 4.5, '#14100c') + sk('M-14 24 Q0 18 14 24', OL, 5);
    o += sk('M-36 -40 Q-44 -10 -38 20', '#8a5a24', 4) + e(-26, -46, 16, 9, '#fff', 'opacity=".35" transform="rotate(-30 -26 -46)"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function zombie(x, y, s, hat) {
    var sk1 = '#a8bb8c', coat = '#6a4b32';
    var o = e(0, 150, 60, 12, '#000', 'opacity=".25"');
    o += sk('M-10 80 L-20 146', OL, 24) + sk('M-10 80 L-20 146', '#3b3f5e', 16) + sk('M14 80 L22 146', OL, 24) + sk('M14 80 L22 146', '#3b3f5e', 16);
    o += e(-24, 148, 18, 8, '#2a2018', S(4)) + e(22, 148, 18, 8, '#2a2018', S(4));
    o += d('M-36 -4 L36 -4 L40 88 L-40 88 Z', coat, S(6)) + d('M-12 -4 L12 -4 L6 40 L0 50 L-6 40 Z', '#eeebe0', S(4)) + d('M-5 -2 L5 -2 L4 34 L0 42 L-4 34 Z', '#c4302c', S(3));
    o += sk('M-30 10 L-76 26 L-96 24', OL, 22) + sk('M-30 10 L-76 26', coat, 15) + sk('M-76 26 L-96 24', sk1, 14);
    o += sk('M-26 30 L-66 50 L-88 52', OL, 22) + sk('M-26 30 L-66 50', coat, 15) + sk('M-66 50 L-88 52', sk1, 14);
    o += e(0, -44, 40, 44, sk1, S(6)) + e(-15, -50, 14, 15, '#fffbe9', S(4)) + e(10, -52, 11, 12, '#fffbe9', S(4)) + c(-19, -48, 5, '#14100c') + c(6, -50, 4, '#14100c');
    o += e(-10, -14, 13, 9, '#4b1c1c', S(4)) + r(-16, -22, 6, 7, '#f1ebc9') + r(-6, -22, 6, 6, '#f1ebc9');
    if (hat) o += p([[0, -132], [-30, -76], [30, -76]], lg(['#ffb35a', '#e0761e'], 0, 0, 1, 0), S(5)) + p([[-8, -110], [8, -110], [14, -96], [-14, -96]], '#fff1dc') + e(0, -76, 40, 9, '#c2621a', S(5));
    else o += sk('M-10 -86 Q-4 -100 6 -96 M2 -86 Q10 -98 18 -90', OL, 4);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function sun(x, y, s) {
    var o = c(0, 0, 70, rg([['#fff6b0', 0], ['rgba(255,224,102,.8)', 0.45], ['rgba(255,224,102,0)', 1]], 0.5, 0.5, 0.5));
    o += star(0, 0, 50, 34, 12, '#ffd43b', -90, 'stroke="#f0a51c" stroke-width="4" stroke-linejoin="round"') + c(0, 0, 28, rg([['#fffbe0', 0], ['#ffe25a', 0.6], ['#f7a823', 1]], 0.4, 0.35, 0.7), 'stroke="#e8961a" stroke-width="4"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['garden-defense'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#e4f7ff', 0], ['#8fd6ff', 0.45], ['#3d9fe0', 1]], 0.2, 0.15, 1));
      o += c(60, 54, 90, '#fff', 'opacity=".25"');
      o += rep(9, function (i) { return r(i * 46 - 6, 236, 30, 70, '#f4f1e8', 4, S(4)) + p([[i * 46 - 6, 238], [i * 46 + 9, 222], [i * 46 + 24, 238]], '#f4f1e8', S(4)); });
      o += r(-10, 258, 420, 10, '#d8d2c2', 0, S(3));
      o += r(0, 292, 400, 108, '#5cb83a') + rep(5, function (i) { return r(i * 92 - 20, 292, 46, 108, '#6ccb46'); }) + r(0, 292, 400, 8, '#000', 0, 'opacity=".12"');
      o += shooter(128, 194, 0.9);
      o += sk('M300 170 L318 170 M294 192 L314 192 M300 214 L316 214', '#fff', 6, 'opacity=".9"');
      o += pea(352, 192, 26);
      o += sun(330, 66, 0.75);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#8fd6ff', '#cfeeff']));
      o += e(220, 40, 90, 26, '#fff', 'opacity=".9"') + e(700, 30, 120, 30, '#fff', 'opacity=".9"');
      o += rep(24, function (i) { return r(i * 42, 44, 28, 70, '#f4f1e8', 4) + p([[i * 42, 46], [i * 42 + 14, 32], [i * 42 + 28, 46]], '#f4f1e8'); }) + r(0, 66, 960, 10, '#d8d2c2');
      for (var i = 0; i < 9; i++) for (var j = 0; j < 5; j++) o += r(100 + i * 96, 110 + j * 98, 96, 98, (i + j) % 2 ? '#5cb83a' : '#6ccb46');
      o += r(0, 0, 100, 600, '#e9dcc0') + r(18, 210, 66, 150, '#8a5a2c', 30) + r(26, 220, 50, 140, '#a8723a', 24) + c(66, 290, 5, '#f0c040') + r(96, 110, 6, 490, '#000', 0, 'opacity=".15"');
      o += sunflower(150, 150, 0.7) + sunflower(150, 445, 0.7) + sunflower(150, 545, 0.62);
      o += shooter(250, 200, 0.42) + shooter(250, 395, 0.42) + shooter(346, 298, 0.42, true) + shooter(250, 298, 0.42) + shooter(346, 494, 0.42);
      o += nut(540, 300, 0.75) + nut(540, 500, 0.75);
      o += pea(380, 180, 12) + pea(470, 180, 12) + pea(420, 375, 12) + pea(450, 278, 12, true) + pea(470, 474, 12);
      o += zombie(720, 180, 0.62, true) + zombie(640, 285, 0.62) + zombie(840, 380, 0.62, true) + zombie(620, 480, 0.62) + zombie(900, 520, 0.6);
      o += sun(470, 250, 0.6) + sun(780, 470, 0.5);
      return o;
    }
  };
})();
