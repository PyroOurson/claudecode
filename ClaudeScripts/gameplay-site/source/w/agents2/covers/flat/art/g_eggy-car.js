(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function egg(x, y, s, rot) {
    var o = d('M0 -60 C30 -60 46 -12 46 14 C46 44 26 60 0 60 C-26 60 -46 44 -46 14 C-46 -12 -30 -60 0 -60 Z', '#e8dcc0') + d('M-2 -58 C26 -58 42 -12 42 12 C42 40 24 54 -2 54 C-26 54 -44 40 -44 12 C-44 -12 -30 -58 -2 -58 Z', rg([['#ffffff', 0], ['#fffaf0', 0.6], ['#f0e4c8', 1]], 0.38, 0.3, 0.8));
    o += e(-18, -24, 10, 18, '#fff', 'opacity=".9" transform="rotate(20 -18 -24)"');
    if (s > 0.9) o += e(-14, 4, 6, 9, '#2a1a10') + e(16, 4, 6, 9, '#2a1a10') + c(-12, 1, 2.2, '#fff') + c(18, 1, 2.2, '#fff') + e(-26, 20, 7, 4, '#ff9a8a', 'opacity=".6"') + e(28, 20, 7, 4, '#ff9a8a', 'opacity=".6"') + d('M-8 22 Q1 30 10 22 Q1 26 -8 22 Z', '#2a1a10', 'stroke="#2a1a10" stroke-width="4" stroke-linejoin="round"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')', o);
  }
  function car(x, y, s, rot, col, dk, eg) {
    var o = '';
    o += egg(-40, -98, eg || 1, -16);
    if (eg) o += sk('M-96 -150 q-12 10 -8 26 M-104 -122 q-8 8 -4 18', '#fff', 5, 'opacity=".9"') + sk('M18 -168 q14 6 14 24', '#fff', 5, 'opacity=".9"');
    o += d('M-110 -8 L-104 -40 L-14 -40 L-8 -56 C-4 -64 40 -64 50 -56 L70 -34 L110 -28 C122 -26 126 -14 126 -2 L126 10 L-110 10 Z', dk);
    o += d('M-110 -12 L-104 -40 L-14 -40 L-8 -56 C-4 -64 40 -64 50 -56 L70 -34 L110 -28 C122 -26 126 -14 126 -6 L-110 -6 Z', col);
    o += d('M-2 -52 C2 -58 36 -58 44 -52 L60 -34 L-8 -34 Z', '#9fe0ff') + d('M4 -52 L18 -52 L6 -36 L-6 -36 Z', '#fff', 'opacity=".6"');
    o += r(-106, -40, 92, 8, dk, 3) + r(-90, -30, 230, 5, '#fff', 3, 'opacity=".3"') + r(110, -22, 14, 10, '#ffe27a', 3);
    o += c(-66, 14, 26, '#1b1d24') + c(-66, 14, 12, '#c8ccd8') + c(78, 14, 26, '#1b1d24') + c(78, 14, 12, '#c8ccd8');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  G['eggy-car'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#4ab0ff', '#9ad8ff', '#e0f6ff']));
      o += c(330, 70, 34, '#fff6b0') + e(90, 80, 60, 18, '#fff', 'opacity=".85"') + e(120, 68, 34, 16, '#fff', 'opacity=".85"');
      o += d('M0 250 C80 210 160 230 240 200 C300 180 360 190 400 170 V400 H0 Z', '#7ac85a', 'opacity=".6"');
      o += d('M0 360 C100 340 200 300 290 260 C340 238 380 230 400 228 V400 H0 Z', '#4cb03a') + d('M0 360 C100 340 200 300 290 260 C340 238 380 230 400 228', 'none', 'stroke="#8ae05a" stroke-width="8"');
      o += d('M0 400 V376 C100 360 200 330 290 290 C340 268 380 262 400 262 V400 Z', '#8a5a2a', 'opacity=".5"');
      o += car(206, 300, 1.12, -20, '#ff5a3a', '#b8281a', 1.22);
      o += sk('M60 330 l-30 10 M70 350 l-36 8', '#fff', 6, 'opacity=".7"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#3aa0f0', '#bce8ff']));
      o += rep(5, function (i) { return e(100 + i * 200, 90 + (i % 2) * 40, 80, 22, '#fff', 'opacity=".8"'); });
      o += d('M0 420 C160 360 300 440 480 380 C660 320 800 400 960 340 V600 H0 Z', '#4cb03a') + d('M0 470 C200 440 340 500 520 450 C700 400 820 460 960 430 V600 H0 Z', '#8a5a2a');
      o += car(480, 360, 1.2, -10, '#ff5a3a', '#b8281a');
      o += rep(6, function (i) { return c(80 + i * 160, 300 + (i % 2) * 40, 14, '#ffd23a'); });
      return o;
    }
  };
})();
