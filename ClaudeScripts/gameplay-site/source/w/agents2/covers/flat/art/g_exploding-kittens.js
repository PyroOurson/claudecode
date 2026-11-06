(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function bomb(x, y, R) {
    var o = e(x + 8, y + R * 0.95, R * 0.9, R * 0.22, '#000', 'opacity=".3"') + c(x, y, R, rg([['#5a5e6e', 0], ['#22242c', 0.5], ['#0a0a0e', 1]], 0.35, 0.3, 0.75));
    o += r(x - R * 0.28, y - R * 1.12, R * 0.56, R * 0.3, lg(['#9aa2b4', '#4a5060']), 6, 'transform="rotate(20 ' + x + ' ' + y + ')"');
    o += sk('M' + (x + R * 0.3) + ' ' + (y - R * 1.05) + ' C' + (x + R * 0.6) + ' ' + (y - R * 1.6) + ' ' + (x + R * 1.1) + ' ' + (y - R * 1.3) + ' ' + (x + R * 1.0) + ' ' + (y - R * 1.75), '#c9a46a', R * 0.12);
    o += star(x + R * 1.0, y - R * 1.8, R * 0.5, R * 0.18, 8, '#ffd21a') + star(x + R * 1.0, y - R * 1.8, R * 0.28, R * 0.1, 8, '#fff6c4');
    o += e(x - R * 0.38, y - R * 0.38, R * 0.3, R * 0.18, '#fff', 'transform="rotate(-40 ' + (x - R * 0.38) + ' ' + (y - R * 0.38) + ')" opacity=".55"');
    return o;
  }
  function cat(x, y, s) {
    var o = d('M-96 120 C-110 20 -60 -10 0 -10 C60 -10 110 20 96 120 Z', '#1e1f28');
    o += p([[-92, -40], [-84, -150], [-24, -96]], '#1e1f28') + p([[92, -40], [84, -150], [24, -96]], '#1e1f28') + p([[-80, -56], [-76, -124], [-40, -92]], '#ff8aa8') + p([[80, -56], [76, -124], [40, -92]], '#ff8aa8');
    o += e(0, -40, 104, 86, '#1e1f28') + e(-40, -110, 30, 10, '#fff', 'opacity=".12"');
    o += c(-40, -48, 30, '#fff') + c(40, -48, 30, '#fff') + c(-36, -46, 18, '#ffd21a') + c(36, -46, 18, '#ffd21a') + c(-36, -46, 9, '#16181f') + c(36, -46, 9, '#16181f') + c(-42, -54, 6, '#fff') + c(30, -54, 6, '#fff');
    o += p([[-10, -12], [10, -12], [0, 0]], '#ff8aa8') + e(0, 22, 14, 18, '#7a1428') + sk('M-60 -6 L-130 -20 M-60 6 L-128 12 M60 -6 L130 -20 M60 6 L128 12', '#e8e8ee', 3);
    o += e(-62, 96, 26, 20, '#2a2c38') + e(62, 96, 26, 20, '#2a2c38');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['exploding-kittens'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ffd84a', 0], ['#ff7a1a', 0.45], ['#c4141e', 1]], 0.62, 0.32, 0.85));
      o += star(250, 130, 260, 120, 16, '#ffe680', 0, 'opacity=".45"') + star(250, 130, 150, 70, 12, '#fff6c4', 0, 'opacity=".6"');
      o += cat(142, 286, 1.0);
      o += bomb(292, 296, 74);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#ff9a2a', '#7a0a12'], 0.5, 0.45, 0.8));
      o += star(480, 300, 520, 260, 20, '#ffd84a', 0, 'opacity=".4"') + star(480, 300, 300, 150, 16, '#fff2a0', 0, 'opacity=".4"');
      [[160, 200, -16, '#2340a8'], [320, 430, 10, '#1f9a4a'], [660, 430, -12, '#7a3fd0'], [820, 200, 16, '#16181f']].forEach(function (q) { o += g('translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')', r(-66, -94, 132, 188, '#000', 14, 'opacity=".3" transform="translate(6,8)"') + r(-66, -94, 132, 188, '#fff', 14) + r(-56, -84, 112, 168, q[3], 10)); });
      o += bomb(480, 300, 90) + cat(250, 470, 0.7);
      return o;
    }
  };
})();
