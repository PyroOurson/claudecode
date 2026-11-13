(function () {
  function red(su) { return su === 'H' || su === 'D'; }
  function fig(rk, col) {
    var o = r(-36, -48, 72, 96, 'none', 6, 'stroke="' + col + '" stroke-width="2.5" opacity=".6"');
    o += d('M-30 46 L-30 22 C-30 6 -18 0 0 0 C18 0 30 6 30 22 L30 46 Z', col) + p([[-15, 0], [0, 16], [15, 0]], '#f5d26a') + r(-2.5, 14, 5, 32, '#f5d26a') + r(-30, 36, 60, 5, '#f5d26a');
    if (rk === 'Q') o += d('M-16 -10 C-22 -30 -12 -38 0 -38 C12 -38 22 -30 16 -10 L12 2 L-12 2 Z', '#7a3b12');
    o += c(0, -18, 13, '#f7d4b4') + c(-4.5, -20, 1.8, '#222') + c(4.5, -20, 1.8, '#222') + sk('M-4 -12 Q0 -9 4 -12', '#a3412a', 1.6);
    if (rk === 'K') o += d('M-13 -16 C-14 4 14 4 13 -16 C8 -9 -8 -9 -13 -16 Z', '#8a5a2a') + p([[-15, -29], [-15, -44], [-7.5, -36], [0, -47], [7.5, -36], [15, -44], [15, -29]], '#f5c542') + c(0, -47, 2.5, '#e8333f');
    if (rk === 'Q') o += p([[-12, -30], [-12, -40], [-6, -35], [0, -42], [6, -35], [12, -40], [12, -30]], '#f5c542') + c(0, -42, 2.2, '#2f74e0');
    if (rk === 'J') o += d('M-17 -26 C-16 -40 16 -40 17 -26 Z', col) + r(-17, -28, 34, 4, '#f5d26a', 2) + d('M10 -34 C22 -50 30 -44 26 -36 C22 -40 16 -38 12 -32 Z', '#f5d26a');
    return o;
  }
  function card(x, y, w, h, rot, rk, su, back) {
    var col = red(su) ? '#d81e2c' : '#16181f', R = w * 0.1;
    var o = r(-w / 2 + w * 0.05, -h / 2 + h * 0.05, w, h, '#000', R, 'opacity=".3"');
    o += r(-w / 2, -h / 2, w, h, lg(['#ffffff', '#e9ecf3']), R) + r(-w / 2, -h / 2, w, h, 'none', R, 'stroke="#c3c8d4" stroke-width="' + w * 0.015 + '"');
    if (rk) {
      o += t(-w / 2 + w * 0.2, -h / 2 + w * 0.3, rk, w * (rk.length > 1 ? 0.21 : 0.26), col, { ls: rk.length > 1 ? -2 : undefined }) + g('translate(' + (-w / 2 + w * 0.2) + ',' + (-h / 2 + w * 0.48) + ')', D_suit(su, w * 0.0032, col));
      if (rk === 'J' || rk === 'Q' || rk === 'K') o += g('translate(' + w * 0.06 + ',' + h * 0.06 + ') scale(' + w * 0.0085 + ')', fig(rk, col === '#16181f' ? '#2a4fb8' : col));
      else o += g('translate(0,' + h * 0.08 + ')', D_suit(su, w * 0.0105, col));
    } else {
      var bc = back || (su && su.charAt(0) === '#' ? su : '#b3142a');
      o += r(-w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, bc, w * 0.06) + r(-w / 2 + w * 0.16, -h / 2 + w * 0.16, w * 0.68, h - w * 0.32, 'none', w * 0.04, 'stroke="#fff" stroke-width="' + w * 0.03 + '" opacity=".55"') + g('translate(0,0)', D_suit('D', w * 0.006, '#fff'), 'opacity=".55"');
    }
    o += d('M' + (-w / 2 + R) + ' ' + (-h / 2) + ' H' + (w / 2 - R) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + R) + ' Z', '#fff', 'opacity=".22"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function web(cx, cy, R, col, n) {
    var o = '';
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o += ln(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, col, 3); }
    for (var k = 1; k <= 5; k++) { var rr = R * k / 5, q = []; for (var j = 0; j <= n; j++) { var b = j / n * Math.PI * 2; q.push((j ? 'Q' + (cx + Math.cos(b - Math.PI / n) * rr * 0.86).toFixed(1) + ' ' + (cy + Math.sin(b - Math.PI / n) * rr * 0.86).toFixed(1) + ' ' : 'M') + (cx + Math.cos(b) * rr).toFixed(1) + ' ' + (cy + Math.sin(b) * rr).toFixed(1)); } o += sk(q.join(' '), col, 2.5); }
    return o;
  }
  function spider(x, y, s) {
    var o = '';
    [-1, 1].forEach(function (m) { [[-30, -40], [-10, -46], [10, -40], [30, -26]].forEach(function (L, i) { o += sk('M0 ' + (i * 8 - 10) + ' L' + m * 44 + ' ' + (L[0] - 4) + ' L' + m * (70 + i * 4) + ' ' + (L[0] + 40 + i * 16), '#16181f', 7); }); });
    o += e(0, 26, 34, 38, '#16181f') + c(0, -18, 26, '#16181f') + e(-10, 14, 10, 14, '#4a4e60', 'opacity=".8"');
    o += c(-10, -20, 9, '#fff') + c(10, -20, 9, '#fff') + c(-9, -18, 4.5, '#16181f') + c(11, -18, 4.5, '#16181f') + p([[-12, 40], [12, 40], [0, 24]], '#e8233a', 'opacity=".9"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['spider-solitaire'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2f8a5a', 0], ['#145a38', 0.6], ['#06261a', 1]], 0.4, 0.3, 0.85));
      o += web(400, 0, 300, '#d8f0e4', 12);
      [['K', 'S'], ['Q', 'S'], ['J', 'S'], ['10', 'S'], ['9', 'S']].forEach(function (q, i) { o += card(150, 112 + i * 44, 150, 210, 0, q[0], q[1]); });
      o += ln(298, 0, 298, 182, '#fff', 3) + spider(298, 214, 1.15);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#1f7a4a', '#03140c'], 0.5, 0.4, 0.85));
      for (var i = 0; i < 10; i++) { var n = 3 + (i * 7) % 5; for (var k = 0; k < n; k++) o += card(60 + i * 93, 80 + k * 30, 84, 118, 0, null, '#2a5bd7'); o += card(60 + i * 93, 80 + n * 30, 84, 118, 0, ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4'][i], 'S'); }
      o += web(960, 0, 420, '#d8f0e4', 14) + web(0, 600, 300, '#d8f0e4', 10);
      return o;
    }
  };
})();
