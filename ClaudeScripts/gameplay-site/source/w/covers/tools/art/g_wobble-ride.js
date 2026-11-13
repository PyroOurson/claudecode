(function () {
  var O = '#1d1b26', OL = 'stroke="' + O + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"';
  function gloss() {
    var id = uid('wrg');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function cloud(x, y, s, op) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(0, 0, 60, 24, '#fff') + c(-24, -12, 26, '#fff') + c(14, -20, 32, '#fff') + c(42, -6, 20, '#fff'), 'opacity="' + (op || 1) + '"');
  }
  function wheel(x, y, R, n, rot) {
    var o = c(x, y, R, '#2a2b33', OL) + c(x, y, R * .74, '#d9dde6', 'stroke="' + O + '" stroke-width="5"') + c(x, y, R * .62, '#f0f2f7');
    for (var i = 0; i < n; i++) { var a = (rot || 0) + i * Math.PI * 2 / n; o += ln(x, y, x + Math.cos(a) * R * .62, y + Math.sin(a) * R * .62, '#8d93a3', 4); }
    return o + c(x, y, R * .14, '#6b7080', 'stroke="' + O + '" stroke-width="4"');
  }
  function gran(x, y, s, rot, flame) {
    var o = '';
    if (flame) o += d('M-112 -34 Q-190 -40 -232 -14 Q-190 6 -112 4 Z', '#ffd23f') + d('M-112 -26 Q-160 -28 -186 -14 Q-160 0 -112 -4 Z', '#fff4b8');
    o += r(-132, -44, 58, 30, '#e8453c', 12, OL) + p([[-74, -44], [-54, -29], [-74, -14]], '#aeb4c0', OL);
    o += r(-66, -150, 14, 156, '#3a3d48', 6, OL) + ln(-60, -150, -92, -160, '#4a4d57', 9);
    o += r(-66, -6, 140, 18, '#2d6bd6', 8, OL) + ln(70, 6, 104, 112, '#aeb4c0', 10) + r(76, 98, 64, 12, '#aeb4c0', 6, OL);
    o += wheel(-64, 74, 96, 12, .3) + wheel(110, 128, 34, 6, 1);
    o += g('rotate(-8)', r(-30, -18, 112, 34, '#7457c4', 14, OL));
    o += r(70, 2, 26, 86, '#7457c4', 12, OL) + e(96, 92, 30, 16, '#6b4226', OL);
    o += g('rotate(-14)', r(-50, -136, 74, 128, '#e8679c', 26, OL) + rep(4, function (i) { return c(12, -118 + i * 28, 5, '#fff4d6'); }));
    o += g('translate(-6,-118) rotate(-150)', r(-14, -4, 28, 92, '#e8679c', 13, OL) + c(0, 96, 17, '#f2c49a', OL));
    o += g('translate(10,-112) rotate(-122)', r(-14, -4, 28, 92, '#e8679c', 13, OL) + c(0, 96, 17, '#f2c49a', OL));
    o += g('translate(-6,-176)', c(-34, -34, 24, '#eef0f5', OL) + c(0, 0, 50, '#f2c49a', OL) + d('M-50 -6 A50 50 0 0 1 48 -14 Q20 -34 -10 -30 Q-34 -26 -50 -6 Z', '#eef0f5', OL)
      + c(16, 2, 13, '#fff', 'stroke="#7a4a2a" stroke-width="5"') + c(42, 0, 11, '#fff', 'stroke="#7a4a2a" stroke-width="5"') + c(19, 3, 5, O) + c(44, 2, 4, O)
      + ln(28, 2, 31, 2, '#7a4a2a', 5) + d('M14 24 Q30 40 46 22 Z', '#7a1f2b', 'stroke="' + O + '" stroke-width="5"'));
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function crate(x, y, sz, rot) {
    var h = sz / 2;
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', r(-h, -h, sz, sz, '#c08a52', 6, OL) + sk('M' + (-h + 10) + ' ' + (-h + 10) + ' L' + (h - 10) + ' ' + (h - 10) + ' M' + (-h + 10) + ' ' + (h - 10) + ' L' + (h - 10) + ' ' + (-h + 10), '#8f5f2e', 6) + r(-h, -h, sz, sz, 'none', 6, OL));
  }
  G['wobble-ride'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#4fb6f5', '#bfe8ff']));
      o += c(330, 70, 44, '#fff3b0', 'opacity=".9"') + c(330, 70, 70, '#fff3b0', 'opacity=".25"');
      o += cloud(90, 70, .8, .95) + cloud(250, 140, .55, .8);
      o += d('M0 300 Q90 262 180 292 Q270 320 400 280 V400 H0 Z', '#5fb043', OL) + d('M0 330 Q120 304 230 330 Q320 350 400 322 V400 H0 Z', '#8a5a3a');
      o += p([[-10, 312], [96, 312], [96, 262]], '#c08a52', OL) + sk('M8 304 L90 270', '#8f5f2e', 5);
      o += crate(318, 268, 56, -6) + crate(356, 226, 44, 10);
      o += sk('M36 214 l-28 -6 M44 182 l-34 0 M60 150 l-26 -14', '#ffffff', 8, 'opacity=".9"');
      o += gran(204, 196, .68, -16, true);
      o += star(334, 116, 52, 30, 10, '#ffd23f', -90, OL) + t(334, 125, 'POP!', 24, '#1d1b26', { w: 900 });
      o += g('translate(300,62) rotate(28)', e(0, 0, 22, 12, '#6b4226', OL));
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4fb6f5', '#cdeeff']));
      o += c(760, 140, 80, '#fff3b0', 'opacity=".8"');
      o += cloud(160, 120, 1.4, .9) + cloud(520, 90, 1, .8) + cloud(860, 220, .9, .8);
      o += d('M0 380 Q160 320 320 360 Q480 400 640 350 Q800 300 960 340 V600 H0 Z', '#7fcc5a') + d('M0 430 Q200 390 420 430 Q640 470 960 420 V600 H0 Z', '#5fb043', OL) + r(0, 470, 960, 130, '#8a5a3a');
      o += p([[120, 440], [330, 440], [330, 370]], '#c08a52', OL);
      o += crate(700, 412, 70, -8) + crate(770, 404, 60, 6) + crate(736, 348, 60, 14);
      o += gran(470, 300, 1, -14, true);
      o += star(860, 150, 50, 22, 8, '#ffd23f', -90, OL);
      return o;
    }
  };
})();
