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
  function wheel(R) {
    var S = [['S', '#232a52'], ['H', '#e8233a'], ['C', '#1f9a4a'], ['D', '#ff8a1a']], o = '';
    S.forEach(function (s, i) {
      var a0 = (i * 90 - 135) * Math.PI / 180, a1 = (i * 90 - 45) * Math.PI / 180, am = (a0 + a1) / 2;
      o += d('M0 0 L' + (Math.cos(a0) * R).toFixed(1) + ' ' + (Math.sin(a0) * R).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (Math.cos(a1) * R).toFixed(1) + ' ' + (Math.sin(a1) * R).toFixed(1) + ' Z', s[1]);
      o += g('translate(' + (Math.cos(am) * R * 0.78).toFixed(1) + ',' + (Math.sin(am) * R * 0.78).toFixed(1) + ')', D_suit(s[0], R * 0.0075, '#fff'));
    });
    return o + c(0, 0, R, 'none', 'stroke="#fff" stroke-width="' + R * 0.05 + '"');
  }
  function eight(x, y, w, h, rot) {
    var o = r(-w / 2 + 8, -h / 2 + 12, w, h, '#000', w * 0.1, 'opacity=".3"') + r(-w / 2, -h / 2, w, h, lg(['#ffffff', '#e9ecf3']), w * 0.1);
    o += t(-w / 2 + w * 0.18, -h / 2 + w * 0.3, '8', w * 0.26, '#16181f') + t(w / 2 - w * 0.18, h / 2 - w * 0.1, '8', w * 0.26, '#16181f');
    o += t(0, h * 0.25, '8', w * 1.0, lg(['#ff4a6a', '#ffb21a', '#2fbf5a', '#2a6af0']), { font: 'Luckiest Guy', st: '#16181f', sw: w * 0.05 });
    o += d('M' + (-w / 2 + w * 0.1) + ' ' + (-h / 2) + ' H' + (w / 2 - w * 0.1) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + w * 0.1) + ' Z', '#fff', 'opacity=".25"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  G['crazy-eights'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ff6fc0', 0], ['#d4168a', 0.6], ['#6a0a52', 1]], 0.45, 0.3, 0.85));
      o += c(206, 210, 168, '#000', 'opacity=".2"') + g('translate(200,200) rotate(-12)', wheel(166));
      o += sk('M60 330 A190 190 0 0 1 40 120', '#fff', 10, 'opacity=".85"') + p([[22, 128], [40, 92], [62, 130]], '#fff', 'opacity=".85"');
      o += sk('M340 70 A190 190 0 0 1 360 280', '#fff', 10, 'opacity=".85"') + p([[378, 272], [360, 308], [338, 270]], '#fff', 'opacity=".85"');
      o += eight(200, 206, 172, 240, 8);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#e8309a', '#4a0638'], 0.5, 0.5, 0.8));
      o += rep(6, function (i) { return c(480, 300, 80 + i * 90, 'none', 'stroke="#fff" stroke-width="10" stroke-dasharray="60 50" opacity=".12"'); });
      o += g('translate(480,300)', wheel(150)) + eight(480, 300, 150, 210, -6);
      [[150, 180, -20, '8', 'H'], [260, 420, 15, '5', 'C'], [700, 160, 20, '8', 'S'], [820, 420, -15, 'K', 'D']].forEach(function (q) { o += card(q[0], q[1], 120, 168, q[2], q[3], q[4]); });
      return o;
    }
  };
})();
