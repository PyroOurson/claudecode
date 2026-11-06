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
  function bubble(x, y, w, h, txt, size) { return r(x + 6, y + 8, w, h, '#000', h / 2, 'opacity=".25"') + d('M' + (x + w * 0.62) + ' ' + (y + h - 4) + ' L' + (x + w * 0.86) + ' ' + (y + h + 34) + ' L' + (x + w * 0.42) + ' ' + (y + h - 4) + ' Z', '#fff') + r(x, y, w, h, '#fff', h / 2) + t(x + w / 2, y + h / 2 + size * 0.36, txt, size, '#16181f', { ls: -1 }); }
  G['cheat'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ffe066', 0], ['#ffa21a', 0.6], ['#d0560a', 1]], 0.4, 0.3, 0.85));
      o += rep(10, function (i) { var a = i * 36 * Math.PI / 180; return p([[200, 250], [200 + Math.cos(a - 0.12) * 320, 250 + Math.sin(a - 0.12) * 320], [200 + Math.cos(a + 0.12) * 320, 250 + Math.sin(a + 0.12) * 320]], '#fff', 'opacity=".12"'); });
      [[-26, 160, 262], [-8, 196, 270], [14, 226, 262]].forEach(function (q) { o += card(q[1], q[2], 150, 210, q[0], null, '#2340a8'); });
      o += card(250, 254, 150, 210, 30, '7', 'C');
      o += bubble(28, 32, 250, 96, '3 ACES!', 46);
      o += g('rotate(-12 316 160)', r(266, 138, 108, 50, '#e8233a', 12) + r(266, 138, 108, 50, 'none', 12, 'stroke="#fff" stroke-width="4"') + t(320, 174, 'LIE', 32, '#fff', { ls: 2 }));
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#ffb02e', '#a83a08'], 0.5, 0.5, 0.8));
      var q = rnd(7);
      for (var i = 0; i < 16; i++) o += card(330 + q() * 300, 220 + q() * 200, 120, 168, q() * 120 - 60, null, '#2340a8');
      o += card(160, 300, 130, 182, -20, 'A', 'S') + card(800, 300, 130, 182, 20, '4', 'D');
      o += bubble(70, 60, 260, 90, '2 KINGS', 44) + bubble(640, 60, 250, 90, 'CHEAT!', 44);
      return o;
    }
  };
})();
