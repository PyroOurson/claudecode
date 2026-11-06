(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function word(x, y, w, col, sz) {
    return t(x, y, w, sz || 19, col, { a: 'start', w: 800, tr: 'skewX(-10) translate(' + (y * 0.176).toFixed(1) + ',0)' });
  }
  function paper(x, y, rot, s) {
    var o = r(-130, -150, 260, 300, '#000', 14, 'opacity=".28" transform="translate(8,12)"') + r(-130, -150, 260, 300, '#fffdf6', 14);
    o += rep(8, function (i) { return ln(-130, -78 + i * 30, 130, -78 + i * 30, '#9cc4ff', 2); }) + ln(-96, -150, -96, 150, '#ff7a7a', 3);
    var hc = ['#ff7a2a', '#2f8cff', '#2bb85a'], hn = ['PAYS', 'ANIMAL', 'FRUIT'];
    for (var k = 0; k < 3; k++) o += r(-90 + k * 74, -132, 68, 30, hc[k], 8) + r(-82 + k * 74, -128, 52, 8, '#fff', 4, 'opacity=".35"') + t(-56 + k * 74, -111, hn[k], 11, '#fff', { w: 900, ls: 0.5 });
    var W = [['Brésil', 'Baleine', ''], ['Bolivie', 'Bison', 'Banane'], ['Bénin', 'Blaireau', 'Baie'], ['Belize', 'Biche', ''], ['Bhoutan', '', ''], ['', 'Bouc', '']];
    for (var j = 0; j < W.length; j++) for (var k2 = 0; k2 < 3; k2++) if (W[j][k2]) o += word(-88 + k2 * 74, -54 + j * 30, W[j][k2], '#22378f', W[j][k2].length > 6 ? 15 : 17);
    o += c(-112, -52, 9, 'none', 'stroke="#e8233a" stroke-width="3"') + sk('M-117 -51 l4 4 l7 -9', '#e8233a', 3) + c(-112, 8, 9, 'none', 'stroke="#e8233a" stroke-width="3"') + sk('M-117 9 l4 4 l7 -9', '#e8233a', 3);
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function letter(x, y, rot, ch, col, dk, s) {
    var o = r(-56, -56, 112, 112, '#000', 22, 'opacity=".3" transform="translate(6,10)"') + r(-56, -50, 112, 112, dk, 22) + r(-56, -56, 112, 108, col, 22) + r(-46, -50, 92, 36, '#fff', 16, 'opacity=".22"');
    o += t(0, 28, ch, 84, '#fff', { st: dk, sw: 3 });
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + (s || 1) + ')', o);
  }
  function watch(x, y, R) {
    var o = c(x + 6, y + 10, R, '#000', 'opacity=".3"') + r(x - R * 0.18, y - R * 1.32, R * 0.36, R * 0.3, '#5a6070', 5) + r(x - R * 0.3, y - R * 1.44, R * 0.6, R * 0.18, '#7a8090', 5);
    o += c(x, y, R, '#e8233a') + c(x, y, R * 0.8, '#fff') + sec(x, y, R * 0.8, -90, 30, '#ffd9dc');
    o += rep(12, function (i) { var a = i * 30 * Math.PI / 180; return ln(x + Math.cos(a) * R * 0.66, y + Math.sin(a) * R * 0.66, x + Math.cos(a) * R * 0.74, y + Math.sin(a) * R * 0.74, '#444', 3); });
    o += ln(x, y, x + R * 0.48, y + R * 0.28, '#1b1d24', 6) + c(x, y, 6, '#1b1d24') + e(x - R * 0.4, y - R * 0.5, R * 0.22, R * 0.1, '#fff', 'opacity=".5" transform="rotate(-40 ' + (x - R * 0.4) + ' ' + (y - R * 0.5) + ')"');
    return o;
  }
  function sec(cx, cy, R, a0, a1, col) {
    var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180;
    return d('M' + cx + ' ' + cy + ' L' + (cx + R * Math.cos(r0)).toFixed(1) + ' ' + (cy + R * Math.sin(r0)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(r1)).toFixed(1) + ' ' + (cy + R * Math.sin(r1)).toFixed(1) + ' Z', col);
  }
  G['petit-bac'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#6ee08a', 0], ['#22a85a', 0.55], ['#0e6a3a', 1]], 0.4, 0.3, 0.85));
      o += paper(178, 222, -6, 0.98);
      o += letter(320, 84, 10, 'B', '#ff7a2a', '#c4501a', 0.9);
      o += watch(318, 312, 58);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2ab866', '#073a1e'], 0.5, 0.45, 0.85));
      o += paper(480, 300, -3, 1.5) + paper(150, 330, -12, 1) + paper(820, 320, 10, 1);
      o += letter(250, 110, -10, 'P', '#ff7a2a', '#c4501a') + letter(480, 80, 0, 'B', '#2f8cff', '#1a5ac0') + letter(710, 110, 10, 'A', '#2bb85a', '#1a7a3a') + watch(780, 480, 70);
      return o;
    }
  };
})();
