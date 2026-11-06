(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function sball(x, y, R, rot) {
    var o = c(4, 6, R, '#000', 'opacity=".3"') + c(0, 0, R, '#fff') + c(0, 0, R, 'none', 'stroke="#1b1d24" stroke-width="' + R * 0.08 + '"');
    var pent = function (cx, cy, rr) { var q = []; for (var i = 0; i < 5; i++) { var a = (-90 + i * 72) * Math.PI / 180; q.push([+(cx + Math.cos(a) * rr).toFixed(1), +(cy + Math.sin(a) * rr).toFixed(1)]); } return p(q, '#1b1d24'); };
    o += pent(0, 0, R * 0.36);
    for (var i = 0; i < 5; i++) { var a = (-90 + i * 72) * Math.PI / 180; o += pent(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92, R * 0.3); }
    o += e(-R * 0.35, -R * 0.4, R * 0.28, R * 0.15, '#fff', 'opacity=".8" transform="rotate(-35 ' + (-R * 0.35) + ' ' + (-R * 0.4) + ')"');
    var id = uid('cb');
    _defs += '<clipPath id="' + id + '"><circle cx="0" cy="0" r="' + R + '"/></clipPath>';
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', '<g clip-path="url(#' + id + ')">' + o + '</g>' + c(0, 0, R, 'none', 'stroke="#1b1d24" stroke-width="' + R * 0.08 + '"'));
  }
  function head(x, y, s, hair, shirt, flip) {
    var o = e(0, 150, 100, 14, '#000', 'opacity=".3"');
    o += d('M40 96 L70 124 L120 124 C132 124 136 138 126 146 L60 148 C46 148 40 140 40 130 Z', shirt) + r(52, 136, 80, 12, '#fff', 4);
    o += c(0, 0, 112, '#2a1a12') + c(0, 0, 104, '#f2c49a') + e(-40, -50, 34, 22, '#fff', 'opacity=".3" transform="rotate(-30 -40 -50)"');
    o += p([[-104, -10], [-100, -70], [-120, -60], [-80, -100], [-90, -120], [-40, -110], [-30, -140], [10, -112], [30, -140], [50, -104], [90, -110], [80, -80], [110, -60], [100, -20], [70, -50], [20, -60], [-40, -54], [-80, -40]], hair);
    o += r(-104, -46, 208, 22, shirt, 8, 'transform="rotate(-4)"');
    o += e(18, 0, 22, 26, '#fff') + e(70, -2, 20, 24, '#fff') + c(28, 2, 11, '#1b1d24') + c(78, 0, 10, '#1b1d24') + c(31, -2, 4, '#fff') + c(81, -4, 4, '#fff');
    o += sk('M-6 -30 L40 -20 M54 -24 L92 -30', '#2a1a12', 8);
    o += d('M10 50 C30 76 72 74 90 44 Z', '#7a1a1a') + d('M18 52 L84 48 L80 58 L22 60 Z', '#fff');
    o += e(-60, 20, 16, 20, '#e8a07a');
    return g('translate(' + x + ',' + y + ') scale(' + (flip ? -s : s) + ',' + s + ')', o);
  }
  G['head-soccer'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5ab8ff', '#a8dcff']));
      o += r(0, 120, 400, 60, '#3a4a6a') + rep(20, function (i) { return c(10 + i * 20, 140 + (i % 2) * 14, 9, ['#ff5a5a', '#ffd23a', '#4aa8ff', '#fff'][i % 4], 'opacity=".8"'); });
      o += r(0, 300, 400, 100, '#3ab84a') + rep(5, function (i) { return r(i * 80, 300, 40, 100, '#4ac85a'); }) + r(0, 300, 400, 5, '#fff', 0, 'opacity=".7"');
      o += r(318, 150, 90, 160, '#fff', 0, 'opacity=".25"') + rep(6, function (i) { return ln(318 + i * 16, 150, 318 + i * 16, 310, '#fff', 2, 'opacity=".7"'); }) + rep(10, function (i) { return ln(318, 150 + i * 16, 410, 150 + i * 16, '#fff', 2, 'opacity=".7"'); }) + r(312, 144, 12, 166, '#fff') + r(312, 144, 100, 12, '#fff');
      o += head(148, 196, 0.98, '#e8432a', '#2f6fe8');
      o += sball(290, 268, 38, 20);
      o += sk('M232 290 l-24 6 M236 270 l-30 -4', '#fff', 5, 'opacity=".8"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4aa8f0', '#a8dcff']));
      o += r(0, 140, 960, 140, '#2a3a5a') + rep(48, function (i) { return c(10 + i * 20, 170 + (i % 3) * 30, 10, ['#ff5a5a', '#ffd23a', '#4aa8ff', '#fff'][i % 4], 'opacity=".7"'); });
      o += r(0, 440, 960, 160, '#3ab84a') + rep(8, function (i) { return r(i * 120, 440, 60, 160, '#4ac85a'); });
      o += r(0, 260, 110, 190, '#fff', 0, 'opacity=".3"') + r(850, 260, 110, 190, '#fff', 0, 'opacity=".3"');
      o += head(300, 340, 0.85, '#e8432a', '#2f6fe8') + head(680, 340, 0.85, '#2a1a12', '#e8233a', true) + sball(480, 250, 40, 0);
      return o;
    }
  };
})();
