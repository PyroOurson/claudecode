(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var HC = ['#2f8cff', '#e8233a', '#ffb21a', '#2bb85a', '#a24bff'];
  function card(x, y, rot, s, seed) {
    var o = r(-130, -150, 260, 300, '#000', 20, 'opacity=".3" transform="translate(8,12)"') + r(-130, -150, 260, 300, '#fff', 20);
    'BINGO'.split('').forEach(function (L, i) { o += r(-118 + i * 48, -138, 44, 48, HC[i], 9) + t(-96 + i * 48, -102, L, 32, '#fff'); });
    var R = rnd(seed), dab = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [0, 3], [3, 0], [4, 1]];
    for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) {
      var cx = -96 + i * 48, cy = -60 + j * 48;
      o += r(cx - 22, cy - 22, 44, 44, '#f1f2f8', 7);
      if (i === 2 && j === 2) o += star(cx, cy, 18, 8, 5, '#ffb21a');
      else o += t(cx, cy + 8, '' + (1 + i * 15 + Math.floor(R() * 15)), 21, '#2a2f45');
      if (dab.some(function (q) { return q[0] === i && q[1] === j; })) o += c(cx, cy, 19, '#e8233a', 'opacity=".72"');
    }
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function ball(x, y, R, col, dk, num) {
    var o = e(x + 6, y + R * 0.92, R * 0.9, R * 0.2, '#000', 'opacity=".35"') + c(x, y, R, rg([[col, 0], [col, 0.5], [dk, 1]], 0.35, 0.3, 0.75));
    o += c(x, y, R * 0.56, '#fff') + t(x, y + R * 0.2, num, R * (num.length > 1 ? 0.52 : 0.62), '#1b1d2a');
    o += e(x - R * 0.42, y - R * 0.5, R * 0.3, R * 0.15, '#fff', 'opacity=".55" transform="rotate(-38 ' + (x - R * 0.42) + ' ' + (y - R * 0.5) + ')"');
    return o;
  }
  G['bingo'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ff6a5a', 0], ['#d8203a', 0.55], ['#7a0a24', 1]], 0.4, 0.3, 0.85));
      o += rep(12, function (i) { var a = i * 30; return p([[200, 200], [200 + Math.cos((a - 7) * Math.PI / 180) * 400, 200 + Math.sin((a - 7) * Math.PI / 180) * 400], [200 + Math.cos((a + 7) * Math.PI / 180) * 400, 200 + Math.sin((a + 7) * Math.PI / 180) * 400]], '#fff', 'opacity=".08"'); });
      o += card(178, 182, -7, 0.94, 3);
      o += ball(300, 312, 64, '#2f8cff', '#1a4aa8', '7') + ball(98, 330, 50, '#ffb21a', '#c47a00', '42');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#e8304a', '#4a0618'], 0.5, 0.45, 0.85));
      o += card(480, 300, -4, 1.4, 5) + card(170, 320, -12, 1, 8) + card(800, 320, 12, 1, 9);
      var R = rnd(2);
      o += rep(10, function (i) { return ball(80 + i * 90, 80 + (i % 3) * 30 + R() * 30, 34, HC[i % 5], '#1a1a3a', '' + Math.floor(1 + R() * 75)); });
      return o;
    }
  };
})();
