(function () {
  function house(x, y, s, f, rf, dk) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')',
      e(10, 6, 70, 14, '#000', 'opacity=".25"') + p([[-50, -50], [10, -50], [10, 0], [-50, 0]], f) + p([[10, -50], [50, -64], [50, -14], [10, 0]], dk) +
      p([[-62, -48], [-20, -100], [22, -48]], rf) + p([[-20, -100], [36, -114], [62, -62], [22, -48]], dk) + p([[-58, -52], [-20, -96], [-16, -90], [-50, -52]], '#fff', 'opacity=".35"') + r(-30, -34, 18, 34, dk) + r(-6, -38, 12, 12, '#fff', 2, 'opacity=".6"'));
  }
  function hotel(x, y, s) {
    var f = '#e8322c', dk = '#a51c18';
    return g('translate(' + x + ',' + y + ') scale(' + s + ')',
      e(20, 6, 110, 18, '#000', 'opacity=".25"') + p([[-90, -70], [40, -70], [40, 0], [-90, 0]], f) + p([[40, -70], [100, -90], [100, -20], [40, 0]], dk) +
      p([[-100, -66], [-26, -126], [50, -66]], f) + p([[-26, -126], [44, -146], [112, -86], [50, -66]], dk) + p([[-94, -70], [-26, -122], [-22, -114], [-84, -70]], '#fff', 'opacity=".35"') +
      rep(4, function (i) { return r(-78 + i * 30, -56, 16, 16, '#ffe9a8', 2); }) + r(-38, -28, 22, 28, '#7a1210'));
  }
  function deed(x, y, s, band, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')',
      r(-70, -92, 150, 196, '#000', 6, 'opacity=".22"') + r(-76, -98, 152, 196, '#fff', 6) + r(-66, -88, 132, 40, band, 3) + r(-66, -88, 132, 40, 'none', 3, 'stroke="#1a1a1a" stroke-width="3"') +
      rep(5, function (i) { return r(-56, -32 + i * 22, 70 - (i % 2) * 20, 8, '#c7ccd6', 4) + r(30, -32 + i * 22, 26, 8, '#c7ccd6', 4); }));
  }
  function bill(x, y, s, f, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', r(-90, -44, 180, 88, '#000', 4, 'opacity=".18"') + r(-94, -48, 180, 88, f, 4) + r(-84, -38, 160, 68, 'none', 3, 'stroke="#fff" stroke-width="3" opacity=".7"') + c(-4, -4, 24, '#fff', 'opacity=".5"'));
  }
  var BANDS = ['#8b4a2b', '#a9e0f7', '#d93a96', '#f7941d', '#ed1b24', '#fef200', '#1fb25a', '#0072bb'];
  G['monopoly'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#cde6d0');
      o += rep(5, function (i) { return r(i * 80, 0, 80, 120, '#eef7ef', 0, 'stroke="#1a1a1a" stroke-width="4"') + r(i * 80, 0, 80, 34, BANDS[(i + 4) % 8], 0, 'stroke="#1a1a1a" stroke-width="4"'); });
      o += bill(110, 330, 1, '#f8c7d4', -12) + bill(130, 318, 1, '#ffe98a', -4) + bill(150, 306, 1, '#b9e4a6', 6);
      o += deed(300, 272, 0.78, '#0072bb', 10);
      o += house(90, 250, 0.9, '#2fb34a', '#2fb34a', '#1a7a2e') + hotel(205, 230, 1.15);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#cde6d0'), S = 96;
      for (var i = 0; i < 10; i++) { var f = BANDS[Math.floor(i / 2.5) % 8]; o += r(i * S, 0, S, 140, '#eef7ef', 0, 'stroke="#1a1a1a" stroke-width="4"') + r(i * S, 104, S, 36, BANDS[(i + 3) % 8], 0, 'stroke="#1a1a1a" stroke-width="4"'); }
      for (i = 0; i < 10; i++) o += r(i * S, 470, S, 140, '#eef7ef', 0, 'stroke="#1a1a1a" stroke-width="4"') + r(i * S, 470, S, 36, BANDS[(i + 6) % 8], 0, 'stroke="#1a1a1a" stroke-width="4"');
      o += g('translate(300,300) rotate(-35)', r(-110, -60, 220, 120, '#ff9a3c', 10) + t(0, 18, '?', 90, '#fff', { w: 900 })) + g('translate(660,300) rotate(-35)', r(-110, -60, 220, 120, '#2aa8e0', 10) + r(-70, -30, 140, 60, 'none', 8, 'stroke="#fff" stroke-width="6"'));
      o += bill(480, 300, 1.2, '#ffe98a', 8) + bill(500, 290, 1.2, '#b9e4a6', -6) + house(140, 120, 0.7, '#2fb34a', '#2fb34a', '#1a7a2e') + house(220, 120, 0.7, '#2fb34a', '#2fb34a', '#1a7a2e') + hotel(800, 560, 0.8) + deed(860, 300, 0.9, '#d93a96', 12) + deed(100, 320, 0.9, '#f7941d', -10);
      return o;
    }
  };
})();
