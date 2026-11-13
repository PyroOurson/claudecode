(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function tree(x, y, R) {
    return c(x + 8, y + 12, R, '#000', 'opacity=".25"') + c(x, y, R, '#2a6a24') + c(x - R * 0.1, y - R * 0.1, R * 0.8, '#3a8a2e') + c(x - R * 0.28, y - R * 0.28, R * 0.38, '#5aaa44') + c(x, y, R * 0.18, '#6a4a2a');
  }
  function crate(x, y, w, rot) {
    var o = r(-w / 2 + 6, -w / 2 + 9, w, w, '#000', 4, 'opacity=".3"') + r(-w / 2, -w / 2, w, w, '#a8742e', 4) + r(-w / 2 + w * 0.1, -w / 2 + w * 0.1, w * 0.8, w * 0.8, '#c8923e', 2);
    o += sk('M' + (-w * 0.4) + ' ' + (-w * 0.4) + ' L' + (w * 0.4) + ' ' + (w * 0.4) + ' M' + (w * 0.4) + ' ' + (-w * 0.4) + ' L' + (-w * 0.4) + ' ' + (w * 0.4), '#8a5a22', w * 0.1);
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function player(x, y, s, rot, skin, vest) {
    var o = r(-8, -150, 16, 110, '#2a2c34', 4) + r(-12, -86, 24, 40, '#3a3c46', 4) + r(-5, -150, 4, 100, '#5a5c66');
    o += c(-6, -54, 16, '#2a1e14') + c(-6, -54, 13, skin) + c(16, -90, 16, '#2a1e14') + c(16, -90, 13, skin);
    o += c(4, 6, 56, '#000', 'opacity=".3"') + c(0, 0, 56, '#2a1e14') + c(0, 0, 51, skin);
    if (vest) o += c(0, 0, 51, 'none', 'stroke="' + vest + '" stroke-width="10"');
    o += c(-16, -16, 18, '#fff', 'opacity=".35"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')', o);
  }
  G['surviv'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#7ab84a');
      var R = rnd(8);
      o += rep(40, function () { return c(R() * 400, R() * 400, 4 + R() * 6, '#6aa83e', 'opacity=".7"'); });
      o += d('M0 0 H400 V400 H0 Z M200 230 m-250 0 a250 250 0 1 0 500 0 a250 250 0 1 0 -500 0 Z', '#e8233a', 'fill-rule="evenodd" opacity=".35"') + c(200, 230, 250, 'none', 'stroke="#ff3a3a" stroke-width="6" opacity=".9"');
      o += tree(330, 300, 62) + tree(60, 70, 54) + crate(84, 310, 74, 8) + c(330, 90, 24, '#8a8f9a') + c(326, 86, 16, '#a8adb8');
      o += sk('M268 120 L330 40', '#ffe27a', 6, 'opacity=".9"') + sk('M300 150 L366 70', '#ffe27a', 5, 'opacity=".7"');
      o += player(196, 226, 1.1, 38, '#f8c574', '#3a6aa8');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#7ab84a');
      var R = rnd(5);
      o += r(0, 260, 960, 60, '#c8b07a') + r(560, 0, 70, 600, '#5a9ad8');
      o += rep(14, function () { return tree(R() * 960, R() * 600, 40 + R() * 30); }) + rep(6, function () { return crate(R() * 960, R() * 600, 60, R() * 30); });
      o += c(480, 300, 520, 'none', 'stroke="#ff3a3a" stroke-width="10"') + player(380, 300, 0.9, 60, '#f8c574', '#3a6aa8') + player(720, 400, 0.9, -110, '#f8c574', '#a83a3a');
      return o;
    }
  };
})();
