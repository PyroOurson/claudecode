(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var KICK = { h: [-10, -112], b: 'M-6 -86 L4 -20 M-2 -72 L-40 -52 L-62 -76 M-2 -72 L30 -88 L56 -76 M4 -20 L52 -32 L100 -26 M4 -20 L-26 22 L-14 66' };
  var HIT = { h: [34, -104], b: 'M26 -80 L0 -18 M20 -66 L50 -86 L74 -104 M20 -66 L-12 -62 L-30 -88 M0 -18 L-22 30 L-32 72 M0 -18 L32 26 L54 66' };
  var RUN = { h: [6, -110], b: 'M4 -84 L-4 -20 M2 -70 L34 -50 L60 -60 M2 -70 L-30 -56 L-44 -30 M-4 -20 L30 14 L20 60 M-4 -20 L-36 20 L-60 30' };
  function fig(x, y, s, pose, col, rot) {
    var o = sk(pose.b, '#14141c', 26) + c(pose.h[0], pose.h[1], 28, '#14141c');
    o += sk(pose.b, col, 16) + c(pose.h[0], pose.h[1], 22, col) + c(pose.h[0] - 7, pose.h[1] - 8, 7, '#fff', 'opacity=".45"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')', o);
  }
  function plat(x, y, w, h) {
    return r(x + 6, y + 10, w, h, '#000', 6, 'opacity=".3"') + r(x, y, w, h, '#2a2430', 6) + r(x, y, w, 8, '#5a4a60', 4);
  }
  G['stick-fight'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ff7a3a', '#e8445a', '#6a1a5a']));
      o += c(300, 120, 70, '#ffd28a', 'opacity=".55"') + c(300, 120, 50, '#fff0c0', 'opacity=".6"');
      o += d('M0 300 L40 250 L90 280 L150 220 L220 290 L290 240 L350 280 L400 250 V400 H0 Z', '#4a1440', 'opacity=".55"');
      o += plat(30, 320, 340, 34) + r(80, 354, 18, 60, '#2a2430') + r(300, 354, 18, 60, '#2a2430');
      o += star(232, 196, 46, 18, 10, '#fff') + star(232, 196, 30, 12, 10, '#ffe23a');
      o += fig(118, 250, 1.2, KICK, '#ffd23a', -6) + fig(286, 252, 1.2, HIT, '#4aa8ff', 10);
      o += r(318, 296, 40, 12, '#14141c', 3, 'transform="rotate(30 338 302)"') + r(318, 300, 12, 20, '#14141c', 2, 'transform="rotate(30 338 302)"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ff8a3a', '#d83a5a', '#4a1240']));
      o += c(720, 160, 110, '#ffd28a', 'opacity=".5"');
      o += plat(60, 420, 300, 40) + plat(600, 420, 300, 40) + plat(330, 280, 300, 34) + plat(100, 200, 160, 26) + plat(700, 200, 160, 26);
      o += fig(220, 404, 1, RUN, '#ffd23a') + fig(480, 264, 1, KICK, '#ff4b4b') + fig(760, 404, 1, HIT, '#4aa8ff') + fig(180, 184, 0.8, HIT, '#3ad05a');
      return o;
    }
  };
})();
