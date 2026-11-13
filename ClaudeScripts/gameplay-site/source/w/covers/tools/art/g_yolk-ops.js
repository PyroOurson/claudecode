G['yolk-ops'] = (function () {
  function egg(sc) {
    var o = '';
    o += d('M0 -150 C70 -150 112 -40 112 40 C112 110 62 150 0 150 C-62 150 -112 110 -112 40 C-112 -40 -70 -150 0 -150 Z', lg(['#fffaf0', '#fff1d6', '#f0d8b0']));
    o += d('M-70 -80 C-50 -120 -20 -138 0 -140', 'none', 'stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity=".8"');
    o += e(-36, -10, 26, 32, '#ffffff', 'stroke="#2a2340" stroke-width="5"') + e(36, -10, 26, 32, '#ffffff', 'stroke="#2a2340" stroke-width="5"');
    o += e(-30, -4, 13, 17, '#2a2340') + e(42, -4, 13, 17, '#2a2340') + c(-26, -10, 4.5, '#ffffff') + c(46, -10, 4.5, '#ffffff');
    o += sk('M-66 -52 L-14 -38', '#2a2340', 9) + sk('M66 -52 L14 -38', '#2a2340', 9);
    o += sk('M-18 46 Q0 36 18 46', '#2a2340', 7);
    o += e(-66, 34, 16, 9, '#ffb8b0', 'opacity=".9"') + e(66, 34, 16, 9, '#ffb8b0', 'opacity=".9"');
    o += d('M-112 -64 C-104 -150 104 -150 112 -64 C80 -84 -80 -84 -112 -64 Z', lg(['#7a9a54', '#5a7a3a'])) + d('M-124 -60 C-60 -84 60 -84 124 -60 C126 -48 -126 -48 -124 -60 Z', '#4a6a2e');
    o += c(-60, -110, 6, '#c8e09a', 'opacity=".7"') + c(40, -122, 5, '#c8e09a', 'opacity=".7"');
    o += sk('M60 116 L74 98 L68 84 L84 70', '#c9b08a', 4) + sk('M74 98 L92 104', '#c9b08a', 3);
    return g('scale(' + sc + ')', o);
  }
  function gun() {
    var o = '';
    o += r(-20, -16, 190, 40, '#ff9a2a', 10, 'stroke="#2a2340" stroke-width="5"') + r(60, -40, 96, 22, '#ffd23d', 6, 'stroke="#2a2340" stroke-width="5"');
    o += r(164, -8, 74, 22, '#3a3a48', 6, 'stroke="#2a2340" stroke-width="5"') + c(248, 3, 15, '#ffd23d', 'stroke="#2a2340" stroke-width="5"');
    o += r(-70, -10, 60, 44, '#ff9a2a', 10, 'stroke="#2a2340" stroke-width="5"') + r(74, 18, 34, 50, '#3a3a48', 6, 'stroke="#2a2340" stroke-width="5"');
    o += c(0, 30, 26, '#ffffff', 'stroke="#2a2340" stroke-width="5"') + c(118, 22, 24, '#ffffff', 'stroke="#2a2340" stroke-width="5"');
    o += star(282, 2, 46, 16, 8, '#fff3b0', -90) + star(282, 2, 24, 10, 8, '#ffffff', -70);
    return o;
  }
  return {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#fff3c0', 0], ['#ffcf5a', 0.55], ['#ff9f2e', 1]], 0.5, 0.42, 0.75));
      o += rep(14, function (i) { var a = (i * 360 / 14) * Math.PI / 180; return p([[200, 180], [200 + Math.cos(a - 0.1) * 420, 180 + Math.sin(a - 0.1) * 420], [200 + Math.cos(a + 0.1) * 420, 180 + Math.sin(a + 0.1) * 420]], '#ffffff', 'opacity=".16"'); });
      o += e(196, 360, 130, 22, '#7a4a10', 'opacity=".22"');
      o += g('translate(70,330) rotate(-16)', d('M0 0 C20 -30 60 -30 70 0 C50 -6 30 10 0 0 Z', '#fff4dc', 'stroke="#2a2340" stroke-width="4"') + e(36, 6, 30, 12, '#ffb81a', 'stroke="#2a2340" stroke-width="4"'));
      o += g('translate(186,196)', egg(0.95));
      o += g('translate(120,246) rotate(-6)', gun(), 'transform-origin="0 0"');
      o += star(340, 70, 18, 7, 4, '#ffffff', -90, 'opacity=".9"') + star(60, 90, 12, 5, 4, '#ffffff', -90, 'opacity=".85"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#58b4ff', '#a8dcff', '#f2fbff']));
      [[160, 100, 1.1], [520, 70, 0.9], [800, 130, 1]].forEach(function (q) { o += g('translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ')', e(0, 0, 70, 26, '#fff') + e(-36, -10, 40, 26, '#fff') + e(30, -16, 44, 30, '#fff')); });
      o += e(150, 420, 300, 120, '#6ab04a') + e(820, 420, 320, 130, '#5a9a40');
      o += r(0, 400, 960, 200, '#7cc85a');
      o += r(80, 210, 240, 200, '#d8483a') + p([[60, 214], [200, 120], [340, 214]], '#8a3a30') + r(160, 300, 80, 110, '#8a3a30') + sk('M160 300 L240 410 M240 300 L160 410', '#f4f1ea', 8) + r(76, 206, 248, 10, '#f4f1ea');
      o += r(360, 150, 70, 260, '#a6b4c0') + e(395, 150, 35, 14, '#8a3a30') + r(440, 190, 56, 220, '#b8c4ce') + e(468, 190, 28, 12, '#8a3a30');
      o += r(600, 260, 250, 150, '#f4f1ea') + p([[580, 264], [725, 190], [870, 264]], '#8a3a30') + rep(4, function (i) { return r(625 + i * 58, 300, 34, 40, '#8cd0f0', 4); });
      o += r(0, 470, 960, 26, '#4ab8e8') + rep(9, function (i) { return r(30 + i * 110, 478, 50, 5, '#ffffff', 2, 'opacity=".5"'); });
      o += rep(6, function (i) { return r(60 + i * 150, 420, 70, 40, '#f0cc5a', 6); });
      o += rep(12, function (i) { return r(i * 82, 540, 6, 40, '#c89660') + r(i * 82 - 30, 548, 80, 6, '#c89660'); });
      return o;
    }
  };
})();
