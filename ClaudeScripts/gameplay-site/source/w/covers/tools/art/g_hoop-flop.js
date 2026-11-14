(function () {
  var O = '#1d1b26', OL = 'stroke="' + O + '" stroke-width="8" stroke-linejoin="round"';
  function gloss() {
    var id = uid('hfg');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function ball(x, y, R, rot) {
    var o = c(5, 7, R, '#000', 'opacity=".25"') + c(0, 0, R, rg([['#ffb866', 0], ['#f07a22', .55], ['#c4500f', 1]], .35, .3, .8), OL);
    o += sk('M' + -R + ' 0 H' + R + ' M0 ' + -R + ' V' + R, '#4a200c', R * .09);
    o += sk('M' + (-R * .72) + ' ' + (-R * .7) + ' Q' + (-R * .18) + ' 0 ' + (-R * .72) + ' ' + (R * .7) + ' M' + (R * .72) + ' ' + (-R * .7) + ' Q' + (R * .18) + ' 0 ' + (R * .72) + ' ' + (R * .7), '#4a200c', R * .08);
    o += e(-R * .36, -R * .42, R * .3, R * .17, '#fff', 'opacity=".55" transform="rotate(-35 ' + (-R * .36) + ' ' + (-R * .42) + ')"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function hoop(x, y, s, flip) {
    var o = r(-34, -10, 18, 600, '#aeb4c2', 0, OL) + r(-30, -10, 6, 600, '#d8dce6');
    o += r(-16, 40, 40, 14, '#aeb4c2', 0, OL);
    o += r(16, -70, 22, 150, '#ffffff', 4, OL) + r(18, -66, 6, 142, '#d8dce6');
    o += sk('M40 62 L56 128 M64 62 L70 128 M88 62 L84 128 M112 62 L98 128 M136 62 L112 128', O, 9) + sk('M40 62 L56 128 M64 62 L70 128 M88 62 L84 128 M112 62 L98 128 M136 62 L112 128', '#ffffff', 5);
    o += sk('M48 92 H128 M54 116 H108', O, 8) + sk('M48 92 H128 M54 116 H108', '#ffffff', 4);
    o += r(30, 50, 116, 16, '#e8322a', 5, OL) + r(36, 52, 104, 4, '#ff9a8a');
    return g('translate(' + x + ',' + y + ') scale(' + (flip ? -s : s) + ',' + s + ')', o);
  }
  function baller(x, y, s, rot, col, dk, skin, hair, arm, leg, num) {
    var o = '';
    o += g('rotate(' + (leg || 0) + ')', r(-18, -4, 36, 104, skin, 6, OL) + r(-24, -10, 48, 52, col, 8, OL) + r(-24, 26, 48, 8, dk) + r(-24, 96, 62, 26, O, 8) + r(-20, 112, 56, 8, '#ffffff', 3));
    o += r(-36, -128, 72, 130, col, 12, OL) + r(-36, -128, 16, 130, dk, 6) + r(14, -128, 10, 130, 'rgba(255,255,255,.18)');
    o += t(6, -48, num || '7', 46, '#ffffff', { st: O, sw: 6 });
    o += g('translate(0,-112) rotate(' + arm + ')', r(-13, -118, 26, 118, skin, 8, OL) + r(-18, -26, 36, 30, col, 8, OL) + c(0, -120, 17, skin, OL));
    o += g('translate(0,-178)', r(-46, -46, 92, 92, skin, 8, OL) + r(-46, -46, 92, 28, hair, 6) + r(-46, -46, 28, 62, hair, 6) + r(-46, 30, 92, 12, 'rgba(0,0,0,.12)') + r(16, -14, 12, 24, O, 2) + r(30, -14, 6, 8, '#ffffff') + r(10, 16, 26, 16, '#7a1f2b', 4, 'stroke="' + O + '" stroke-width="5"') + r(-8, 0, 14, 20, 'rgba(0,0,0,.14)', 3));
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function city(y, col, win, seed, w) {
    var R = rnd(seed), o = '', x = -20;
    while (x < w) { var bw = 50 + R() * 70 | 0, bh = 70 + R() * 140 | 0; o += r(x, y - bh, bw, bh + 40, col); if (win) for (var wy = y - bh + 14; wy < y - 10; wy += 22) for (var wx = x + 8; wx < x + bw - 12; wx += 16) if (R() < .45) o += r(wx, wy, 8, 10, win); x += bw + 6; }
    return o;
  }
  function floor(y, w, h) {
    var o = r(0, y, w, h, lg(['#e7b479', '#c9874c'])) + r(0, y, w, 10, '#f3c690');
    for (var i = 0; i < w / 60; i++) o += r(i * 60 + (i % 2) * 20, y + 10, 4, h, '#b57a42', 0, 'opacity=".55"');
    return o;
  }
  G['hoop-flop'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#6cc6ff', '#3d8fe6']));
      o += c(60, 60, 120, '#ffffff', 'opacity=".12"') + c(60, 60, 70, '#ffffff', 'opacity=".14"');
      o += city(300, '#8fcff7', '#c4e6fb', 5, 400);
      o += floor(300, 400, 100) + sk('M-10 352 Q200 336 410 352', '#ffffff', 6, 'opacity=".9"');
      o += e(176, 372, 84, 13, '#000', 'opacity=".2"');
      o += hoop(396, 112, .95, true);
      o += sk('M84 150 l-34 -8 M92 182 l-40 6 M104 118 l-26 -24', '#ffffff', 8, 'opacity=".9"');
      o += baller(150, 290, .9, 20, '#f04848', '#b8253a', '#f2c49a', '#2a1b14', 46, -36, '7');
      o += ball(304, 118, 40, 20);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ff9f5a', '#ffd08a']));
      o += c(700, 170, 90, '#fff2c4', 'opacity=".7"');
      o += city(330, '#e9845a', '#ffe2a0', 11, 960) + city(380, '#c4664a', '#ffd36b', 23, 960);
      o += r(0, 330, 960, 90, '#a8724a') + rep(40, function (i) { return r(i * 24, 330 - (i % 2) * 10, 20, 100, i % 2 ? '#b9845a' : '#8f5d3a'); });
      o += rep(28, function (i) { return e(i * 36, 420, 30, 18, i % 2 ? '#5fbf3a' : '#7fd84a'); });
      o += r(0, 430, 960, 170, lg(['#4a4c52', '#34363b'])) + sk('M60 470 H900 L960 590 H0 Z', '#ffffff', 6, 'opacity=".8"') + sk('M480 470 V590', '#ffffff', 6, 'opacity=".8"');
      o += hoop(40, 210, 1.1, false) + hoop(920, 210, 1.1, true);
      o += baller(300, 520, .62, -24, '#f04848', '#b8253a', '#f2c49a', '#2a1b14', 30, 30, '7');
      o += baller(420, 540, .62, 30, '#f04848', '#b8253a', '#9a643f', '#151515', -60, -20, '3');
      o += baller(600, 530, .62, 18, '#3b7cf4', '#2453c2', '#e8b48a', '#e2b04a', -150, 20, '9');
      o += baller(710, 545, .62, -40, '#3b7cf4', '#2453c2', '#c98d5e', '#5b3a22', 120, -30, '5');
      o += ball(500, 170, 34, 30) + sk('M300 260 Q400 120 480 160', '#ffffff', 6, 'stroke-dasharray="4 18" opacity=".8"');
      return o;
    }
  };
})();
