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
  function crown(s) {
    var o = d('M-110 30 L-128 -70 L-62 -18 L0 -96 L62 -18 L128 -70 L110 30 Z', lg(['#fff2a0', '#ffc42a', '#d0860a'])) + r(-114, 22, 228, 46, lg(['#ffd84a', '#c27a08']), 10);
    o += c(-128, -74, 14, '#ffe680') + c(0, -100, 16, '#ffe680') + c(128, -74, 14, '#ffe680');
    o += c(-60, 45, 13, '#e8233a') + e(0, 45, 18, 14, '#2a8af0') + c(60, 45, 13, '#2fbf5a') + c(0, -20, 18, '#e8233a') + c(-6, -26, 6, '#fff', 'opacity=".6"');
    o += d('M-104 22 L-118 -46 L-70 -6 Z', '#fff', 'opacity=".35"') + r(-108, 26, 216, 10, '#fff', 5, 'opacity=".35"');
    return g('scale(' + s + ')', o);
  }
  G['president'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#9a5af0', 0], ['#5a20b8', 0.6], ['#260a5a', 1]], 0.45, 0.3, 0.85));
      o += rep(12, function (i) { var a = i * 30 * Math.PI / 180; return p([[200, 120], [200 + Math.cos(a - 0.1) * 320, 120 + Math.sin(a - 0.1) * 320], [200 + Math.cos(a + 0.1) * 320, 120 + Math.sin(a + 0.1) * 320]], '#ffe680', 'opacity=".1"'); });
      o += card(140, 262, 160, 224, -14, '2', 'S') + card(260, 262, 160, 224, 14, '2', 'H');
      o += e(206, 154, 130, 20, '#000', 'opacity=".25"') + g('translate(200,112)', crown(0.98));
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#7a3ad0', '#1e0848'], 0.5, 0.3, 0.9));
      o += p([[400, 600], [560, 600], [520, 300], [440, 300]], '#c4122a');
      o += r(380, 300, 200, 300, lg(['#ffd84a', '#c27a08'])) + r(180, 380, 200, 220, lg(['#e8ecf4', '#9aa2b4'])) + r(580, 430, 200, 170, lg(['#e89a5a', '#9a4a1a']));
      o += t(480, 400, '1', 90, '#7a4300') + t(280, 470, '2', 80, '#5a6070') + t(680, 510, '3', 70, '#6a2a0a');
      o += g('translate(480,220)', crown(0.7)) + card(260, 300, 90, 126, -10, 'K', 'S') + card(700, 350, 90, 126, 10, '3', 'D');
      var q = rnd(11);
      o += rep(40, function () { return r(q() * 960, q() * 300, 10, 18, ['#ffd84a', '#ff5a8a', '#4ad0ff', '#7ae05a'][Math.floor(q() * 4)], 2, 'transform="rotate(' + Math.round(q() * 180) + ')"'); });
      return o;
    }
  };
})();
