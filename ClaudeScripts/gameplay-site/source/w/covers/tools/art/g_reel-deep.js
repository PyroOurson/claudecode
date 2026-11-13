(function () {
  var OL = '#2a2438';
  function fish(cx, cy, L, H, col, col2, dir, bands, gold) {
    var sw = 'stroke="' + OL + '" stroke-width="' + Math.max(2.4, L * 0.035).toFixed(1) + '" stroke-linejoin="round"', o = '';
    if (gold) o += c(cx, cy, L * 0.9, '#fff3a0', 'opacity=".22"') + c(cx, cy, L * 0.65, '#fff3a0', 'opacity=".25"');
    var inner = p([[-L * 0.36, 0], [-L * 0.62, -H * 0.42], [-L * 0.55, 0], [-L * 0.62, H * 0.42]], shade2(col), sw);
    inner += d('M' + (-L * 0.05) + ' ' + (-H * 0.45) + ' Q' + (L * 0.08) + ' ' + (-H * 0.9) + ' ' + (L * 0.2) + ' ' + (-H * 0.42) + ' Z', shade2(col), sw);
    inner += e(0, 0, L * 0.42, H * 0.5, lg([col, col, col2], 0, 0, 0, 1), sw);
    if (bands) [0.18, -0.08, -0.3].forEach(function (b) { inner += r(L * b, -H * 0.48, L * 0.08, H * 0.96, '#fff', 0, 'stroke="' + OL + '" stroke-width="2"'); });
    inner += e(L * 0.05, -H * 0.27, L * 0.2, H * 0.08, '#fff', 'opacity=".35"');
    inner += c(L * 0.27, -H * 0.1, Math.max(4, H * 0.15), '#fff', 'stroke="#222" stroke-width="2"') + c(L * 0.3, -H * 0.1, Math.max(2, H * 0.075), '#111');
    o += g('translate(' + cx + ' ' + cy + ') scale(' + dir + ' 1)', inner);
    return o;
  }
  function shade2(col) { return col === '#ff7b1c' ? '#e0600a' : col === '#ffcf33' ? '#e8a810' : col === '#f4d35e' ? '#d8b23a' : col === '#4f8fd0' ? '#3a72b0' : '#7aa0b0'; }
  function boat(cx, cy, s) {
    var sw = 'stroke="' + OL + '" stroke-width="' + (3 / s).toFixed(2) + '" stroke-linejoin="round"', o = '';
    o += c(-22, -50, 11, '#f4c7a1', sw) + e(-22, -57, 20, 5, '#ffd23f', sw) + d('M-32 -58 A10 10 0 0 1 -12 -58 Z', '#ffd23f', sw) + c(-18, -51, 1.8, '#222');
    o += d('M-34 -16 Q-36 -44 -22 -42 Q-8 -44 -10 -16 Z', '#3a86ff', sw);
    o += d('M-72 -16 L72 -16 Q62 14 40 18 L-44 18 Q-66 14 -72 -16 Z', lg(['#d85a40', '#a8321e'], 0, 0, 0, 1), sw);
    o += p([[-70, -14], [70, -14], [68, -8], [-68, -8]], '#fff', sw);
    o += sk('M-8 -30 Q24 -64 52 -52', OL, 5 / s) + sk('M-8 -30 Q24 -64 52 -52', '#a0703c', 2.6 / s);
    return g('translate(' + cx + ' ' + cy + ') scale(' + s + ')', o);
  }
  function hook(x, y, s) { return sk('M' + x + ' ' + (y - 14 * s) + ' V' + (y + 8 * s) + ' A' + (9 * s) + ' ' + (9 * s) + ' 0 0 1 ' + (x - 18 * s) + ' ' + (y + 8 * s), '#d9dde3', 5 * s) + sk('M' + x + ' ' + (y - 14 * s) + ' V' + (y + 8 * s) + ' A' + (9 * s) + ' ' + (9 * s) + ' 0 0 1 ' + (x - 18 * s) + ' ' + (y + 8 * s), OL, 1.6 * s, 'opacity=".6"'); }
  function bubbles(n, seed, w, h, s) { var rn = rnd(seed), o = ''; for (var i = 0; i < n; i++) o += c(rn() * w, rn() * h, (2 + rn() * 5) * s, 'none', 'stroke="#fff" stroke-width="' + (1.6 * s).toFixed(1) + '" opacity=".55"'); return o; }
  function water(w, h, top) {
    var o = r(0, 0, w, h, lg([['#7fd4ff', 0], ['#d9f4ff', top / h - 0.01], ['#58d0ee', top / h], ['#1c64b5', 0.7], ['#0a1d58', 1]], 0, 0, 0, 1));
    var rn = rnd(3);
    for (var i = 0; i < 6; i++) { var x = rn() * w; o += p([[x - 20, top], [x + 30, top], [x + 120 - rn() * 60, h], [x - 90, h]], '#fff', 'opacity=".07"'); }
    var wp = 'M0 ' + top; for (var j = 0; j <= 16; j++) wp += ' Q' + (j * w / 16 - w / 32).toFixed(1) + ' ' + (top - 6) + ' ' + (j * w / 16).toFixed(1) + ' ' + top;
    o += d(wp + ' V' + (top + 14) + ' H0 Z', '#9ee6ff', 'opacity=".6"');
    return o;
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  G['reel-deep'] = {
    icon: function () {
      var o = water(400, 400, 112);
      o += c(330, 40, 30, '#fff3a0', 'opacity=".9"') + e(90, 46, 40, 14, '#fff') + e(120, 38, 26, 12, '#fff');
      o += boat(150, 106, 1.25);
      o += sk('M215 41 L238 300', '#fff', 2.2, 'opacity=".9"');
      o += hook(238, 304, 1.4);
      o += fish(112, 220, 112, 60, '#ff7b1c', '#ffffff', 1, true, false);
      o += fish(310, 196, 92, 50, '#4f8fd0', '#ffb347', -1, false, false);
      o += fish(132, 338, 104, 54, '#ffcf33', '#fff2a8', 1, false, true);
      o += fish(330, 330, 76, 40, '#9fd8d4', '#f4fffd', -1, false, false);
      o += bubbles(14, 7, 400, 400, 1) ;
      return o + gloss();
    },
    bg: function () {
      var o = water(960, 600, 150);
      o += boat(470, 146, 1.8);
      o += sk('M564 52 L590 430', '#fff', 3, 'opacity=".8"') + hook(590, 434, 2);
      o += fish(180, 300, 180, 96, '#ff7b1c', '#ffffff', 1, true, false) + fish(800, 280, 160, 86, '#4f8fd0', '#ffb347', -1, false, false) + fish(330, 500, 150, 80, '#ffcf33', '#fff2a8', 1, false, true) + fish(760, 500, 140, 74, '#9fd8d4', '#f4fffd', -1, false, false);
      o += bubbles(30, 9, 960, 600, 2);
      return o;
    }
  };
})();
