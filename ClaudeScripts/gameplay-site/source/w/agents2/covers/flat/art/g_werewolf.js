(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function moon(x, y, R) {
    var o = c(x, y, R * 1.45, '#fff4c0', 'opacity=".1"') + c(x, y, R * 1.2, '#fff4c0', 'opacity=".14"');
    o += c(x, y, R, rg([['#fffdf0', 0], ['#ffeeb0', 0.7], ['#f2cf6a', 1]], 0.38, 0.35, 0.65));
    o += c(x - R * 0.3, y - R * 0.28, R * 0.14, '#ecd38a', 'opacity=".7"') + c(x + R * 0.32, y + R * 0.25, R * 0.2, '#ecd38a', 'opacity=".6"') + c(x + R * 0.36, y - R * 0.36, R * 0.09, '#ecd38a', 'opacity=".7"') + c(x - R * 0.2, y + R * 0.45, R * 0.08, '#ecd38a', 'opacity=".6"');
    return o;
  }
  function pine(x, y, h, col) {
    var w = h * 0.36;
    return p([[x, y - h], [x - w * 0.6, y - h * 0.55], [x + w * 0.6, y - h * 0.55]], col) + p([[x, y - h * 0.8], [x - w * 0.85, y - h * 0.25], [x + w * 0.85, y - h * 0.25]], col) + p([[x, y - h * 0.55], [x - w, y], [x + w, y]], col) + r(x - w * 0.1, y - 4, w * 0.2, h * 0.12, col);
  }
  var BODY = 'M106 372 C90 342 92 306 112 280 L96 278 L120 262 L104 258 L130 242 L116 238 L142 222 C148 212 153 202 156 194 C162 180 166 170 170 158 L222 150 L228 164 L216 170 L230 182 L216 188 L228 202 L214 208 C228 230 230 256 220 278 C214 300 214 332 222 356 C234 360 246 364 246 372 Z';
  var HEAD = 'M-34 4 C-38 -8 -36 -14 -32 -20 L-16 -56 L-14 -30 L8 -66 L8 -27 C8 -27 13 -25 18 -24 L68 -14 C76 -14 82 -10 80 -4 C80 0 78 2 74 2 L26 12 L64 24 C63 30 57 33 50 32 L24 32 C14 37 2 40 -8 40 C-22 40 -34 26 -34 4 Z';
  var TAIL = 'M100 362 C70 372 36 364 20 340 C40 348 66 348 94 338 Z';
  function wolfShape(col) {
    return d(BODY, col) + d(TAIL, col) + g('translate(196,140) rotate(-40)', d(HEAD, col));
  }
  function wolf(x, y, s, col, rim) {
    var o = rim ? g('translate(4,-4)', wolfShape(rim)) : '';
    o += wolfShape(col) + g('translate(196,140) rotate(-40)', d('M-8 -10 C-3 -16 4 -17 10 -15 C6 -10 -2 -8 -8 -10 Z', '#ffd23a'));
    return g('translate(' + x + ',' + y + ') scale(' + s + ') translate(-160,-372)', o);
  }
  function hut(x, y, s, col, win) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', p([[-30, 0], [0, -26], [30, 0]], col) + r(-24, -2, 48, 34, col) + r(-14, 6, 12, 12, win) + r(4, 6, 12, 12, win));
  }
  G['werewolf'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#141e5a', '#34388e', '#6a3f98']));
      var R = rnd(5);
      o += rep(26, function () { return c(R() * 400, R() * 260, 1 + R() * 2.2, '#fff', 'opacity="' + (0.4 + R() * 0.5).toFixed(2) + '"'); });
      o += moon(214, 158, 118);
      o += d('M0 304 C70 282 140 290 200 306 C270 288 340 272 400 292 V400 H0 Z', '#1d1f4e');
      o += pine(34, 336, 120, '#0e1030') + pine(76, 350, 84, '#0e1030') + pine(362, 326, 128, '#0e1030') + pine(324, 352, 76, '#0e1030');
      o += hut(322, 338, 0.62, '#12133a', '#ffcf5a') + hut(288, 346, 0.5, '#12133a', '#ffb84a');
      o += d('M50 400 L78 356 C120 338 268 336 306 352 L344 400 Z', '#0a0b22');
      o += wolf(176, 380, 1.0, '#0a0b22', '#8c8ce0');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#121a52', '#2e3282', '#5a3a8a']));
      var R = rnd(9);
      o += rep(60, function () { return c(R() * 960, R() * 330, 1 + R() * 2, '#fff', 'opacity=".7"'); });
      o += moon(700, 170, 120);
      o += d('M0 380 C160 320 300 360 480 340 C640 320 800 360 960 330 V600 H0 Z', '#22245a');
      o += rep(5, function (i) { var x = 150 + i * 130, y = 420 + (i % 2) * 20; return p([[x - 50, y], [x, y - 50], [x + 50, y]], '#3a2a3a') + r(x - 40, y, 80, 60, '#4a3a4a') + r(x - 12, y + 14, 22, 22, '#ffcf5a'); });
      o += rep(14, function (i) { return pine(i * 72 + 20, 600 - (i % 3) * 10, 170 + (i % 4) * 30, '#0c0e2c'); });
      o += wolf(620, 600, 1.1, '#0a0b22');
      return o;
    }
  };
})();
