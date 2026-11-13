(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function stars(n, w, h, seed, big) {
    var R = rnd(seed), o = '';
    for (var i = 0; i < n; i++) { var s = R() < 0.12 ? (big || 2.6) : 1.2 + R(); o += c((R() * w).toFixed(1), (R() * h).toFixed(1), s.toFixed(1), '#fff', 'opacity="' + (0.35 + R() * 0.6).toFixed(2) + '"'); }
    return o;
  }
  function planet(x, y, rr, ring) {
    var o = c(x, y, rr * 1.25, rg([['#9ec8ff', 0], ['#9ec8ff', 0.75], ['rgba(158,200,255,0)', 1]], 0.5, 0.5, 0.5), 'opacity=".35"');
    if (ring) o += g('translate(' + x + ',' + y + ') rotate(-18) scale(1,0.32)', sk('M' + (-rr * 1.95) + ' 0 A' + rr * 1.95 + ' ' + rr * 1.95 + ' 0 0 1 ' + rr * 1.95 + ' 0', '#ecd6a6', rr * 0.22, 'opacity=".55"') + sk('M' + (-rr * 1.62) + ' 0 A' + rr * 1.62 + ' ' + rr * 1.62 + ' 0 0 1 ' + rr * 1.62 + ' 0', '#fff0cd', rr * 0.1, 'opacity=".7"'));
    o += c(x, y, rr, rg([['#fbe9bd', 0], ['#d6b06c', 0.55], ['#3c2c12', 1]], 0.3, 0.25, 0.85));
    var id = uid('pc');
    _defs += '<clipPath id="' + id + '"><circle cx="' + x + '" cy="' + y + '" r="' + rr + '"/></clipPath>';
    var bands = '';
    for (var i = 0; i < 7; i++) bands += e(x, y - rr + (i + 0.4) * (2 * rr / 7), rr * 1.1, rr / 7 * (0.5 + 0.3 * Math.sin(i * 2.1)), ['#f1d9a2', '#c9a25c', '#f6e6bf'][i % 3], 'opacity=".4"');
    bands += c(x, y, rr, rg([['rgba(0,0,10,0)', 0], ['rgba(0,0,10,0)', 0.45], ['rgba(0,0,10,.6)', 1]], 0.32, 0.3, 0.85));
    o += '<g clip-path="url(#' + id + ')">' + bands + '</g>';
    if (ring) o += g('translate(' + x + ',' + y + ') rotate(-18) scale(1,0.32)', sk('M' + rr * 1.95 + ' 0 A' + rr * 1.95 + ' ' + rr * 1.95 + ' 0 0 1 ' + (-rr * 1.95) + ' 0', '#ecd6a6', rr * 0.22, 'opacity=".8"') + sk('M' + rr * 1.62 + ' 0 A' + rr * 1.62 + ' ' + rr * 1.62 + ' 0 0 1 ' + (-rr * 1.62) + ' 0', '#fff0cd', rr * 0.1, 'opacity=".9"'));
    return o;
  }
  function probe(x, y, s, rot) {
    var o = '';
    o += d('M-34 -9 Q-150 -20 -250 0 Q-150 20 -34 9 Z', lg([['rgba(255,60,20,0)', 0], ['rgba(255,128,40,.75)', 0.55], ['#ffe078', 0.85], ['#fffbe8', 1]], 0, 0, 1, 0));
    o += d('M-34 -4 Q-80 -6 -120 0 Q-80 6 -34 4 Z', '#ffffff', 'opacity=".85"');
    o += r(-38, -3, 76, 6, '#26305a');
    o += r(-17, -36, 26, 23, '#1c3c8c') + r(-17, 13, 26, 23, '#1c3c8c');
    o += sk('M-8.5 -36 V-13 M0.5 -36 V-13 M-8.5 13 V36 M0.5 13 V36 M-17 -24.5 H9 M-17 24.5 H9', '#7fb4ff', 1.2);
    o += r(-17, -36, 26, 23, 'none', 0, 'stroke="#c4d8ff" stroke-width="1.6"') + r(-17, 13, 26, 23, 'none', 0, 'stroke="#c4d8ff" stroke-width="1.6"');
    o += r(-5.5, -13, 3, 26, '#8a93b8');
    o += p([[-14, -12], [12, -12], [18, -6], [18, 6], [12, 12], [-14, 12], [-18, 6], [-18, -6]], lg([['#ffe7a3', 0], ['#e9b54a', 0.45], ['#8a5a1a', 1]]), 'stroke="rgba(80,46,10,.7)" stroke-width="1"');
    o += sk('M-10 -7 H8 M-12 0 H14', '#fff5d2', 1, 'opacity=".6"');
    o += r(-24, -5, 7, 10, '#3a4466') + p([[-24, -6], [-31, -9], [-31, 9], [-24, 6]], '#5c6890');
    o += g('translate(10,-14) rotate(-32)', d('M-15 -8 A15 6 0 0 1 15 -8 Z', lg([['#f4f7ff', 0], ['#9aa5c6', 1]], 0, 0, 1, 0)) + sk('M0 -8 V-17', '#d9e1f7', 1.6) + c(0, -18, 2.2, '#ff6b5a'));
    o += sk('M18 2 L44 10', '#aab4d4', 1.3) + c(44, 10, 2.6, '#d6dcf0') + c(4, 5, 2.2, '#7ad7ff');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  G['long-shot'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#5046b8', 0], ['#2a2b84', 0.55], ['#0e1444', 1]], 0.35, 0.3, 0.95));
      o += c(80, 300, 160, rg([['rgba(220,80,160,.35)', 0], ['rgba(220,80,160,0)', 1]]));
      o += c(330, 90, 150, rg([['rgba(60,170,230,.3)', 0], ['rgba(60,170,230,0)', 1]]));
      o += stars(70, 400, 400, 11);
      o += planet(300, 290, 74, true);
      o += c(70, 86, 20, rg([['#ffb08a', 0], ['#c4502c', 0.6], ['#4a1608', 1]], 0.35, 0.3, 0.8));
      o += probe(178, 186, 2.35, -24);
      o += GL();
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg([['#0a0f33', 0], ['#1d1860', 0.6], ['#2a1450', 1]]));
      o += c(200, 420, 360, rg([['rgba(220,80,160,.45)', 0], ['rgba(220,80,160,0)', 1]]));
      o += c(780, 150, 340, rg([['rgba(60,170,230,.4)', 0], ['rgba(60,170,230,0)', 1]]));
      o += stars(160, 960, 600, 5, 3.2);
      o += planet(760, 430, 150, true);
      o += c(170, 120, 46, rg([['#ffb08a', 0], ['#c4502c', 0.6], ['#4a1608', 1]], 0.35, 0.3, 0.8));
      o += probe(430, 290, 3.6, -20);
      return o;
    }
  };
})();
