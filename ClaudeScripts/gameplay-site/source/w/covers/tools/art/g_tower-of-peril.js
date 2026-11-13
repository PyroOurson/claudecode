(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var SEC = ['#5fd35a', '#f4cf3a', '#ff9a2e', '#ff4b4b', '#4f8cff', '#c46cff', '#3fd0a0'];
  function block(x, y, w, h, col) {
    return r(x, y, w, h, col) + r(x, y, w, h * 0.22, '#fff', 0, 'opacity=".28"') + r(x, y + h * 0.78, w, h * 0.22, '#000', 0, 'opacity=".18"');
  }
  function tower(cx, base, w, n, sh, seed) {
    var o = '', R = rnd(seed);
    o += r(cx - w / 2 - 10, base - n * sh - 20, 10, n * sh + 20, '#59617a') + r(cx + w / 2, base - n * sh - 20, 10, n * sh + 20, '#59617a');
    for (var i = 0; i < n; i++) {
      var y = base - (i + 1) * sh, col = SEC[i % SEC.length];
      o += r(cx - w / 2, y + sh - 6, w, 6, col, 0, 'opacity=".9"');
      for (var k = 0; k < 4; k++) { var bw = w * (0.18 + R() * 0.16), bx = cx - w / 2 + 6 + R() * (w - bw - 12), by = y + 12 + R() * (sh - 40); o += block(bx, by, bw, 12 + R() * 8, col); }
      if (i % 2 === 1) o += r(cx - w / 2 + 8 + R() * (w - 60), y + sh * 0.5, 44, 8, '#ff2a2a');
    }
    o += r(cx - w / 2, base - n * sh - 6, w, 6, '#ffd34d');
    o += r(cx - w / 2, base - n * sh, w, n * sh, '#cfeeff', 0, 'opacity=".1"');
    return o;
  }
  function avatar(x, y, s) {
    var o = '';
    o += r(x - 14 * s, y + 30 * s, 12 * s, 26 * s, '#2a3550', 0, 'transform="rotate(-18 ' + (x - 8 * s) + ' ' + (y + 30 * s) + ')"');
    o += r(x + 2 * s, y + 30 * s, 12 * s, 26 * s, '#2a3550', 0, 'transform="rotate(24 ' + (x + 8 * s) + ' ' + (y + 30 * s) + ')"');
    o += r(x - 16 * s, y, 32 * s, 32 * s, '#e8423a') + r(x - 16 * s, y, 32 * s, 7 * s, '#fff', 0, 'opacity=".25"');
    o += r(x - 30 * s, y - 20 * s, 12 * s, 28 * s, '#ffd6a8', 0, 'transform="rotate(-25 ' + (x - 24 * s) + ' ' + y + ')"');
    o += r(x + 18 * s, y - 20 * s, 12 * s, 28 * s, '#ffd6a8', 0, 'transform="rotate(25 ' + (x + 24 * s) + ' ' + y + ')"');
    o += r(x - 11 * s, y - 22 * s, 22 * s, 22 * s, '#ffd6a8');
    o += r(x - 6 * s, y - 15 * s, 3.5 * s, 5 * s, '#1b1b22') + r(x + 3 * s, y - 15 * s, 3.5 * s, 5 * s, '#1b1b22');
    o += sk('M' + (x - 5 * s) + ' ' + (y - 7 * s) + ' q' + 5 * s + ' ' + 4 * s + ' ' + 10 * s + ' 0', '#1b1b22', 1.8 * s);
    return o;
  }
  G['tower-of-peril'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2f7ff0', '#8fd0ff', '#d8f0ff']));
      o += e(80, 300, 110, 36, '#fff', 'opacity=".75"') + e(330, 250, 90, 28, '#fff', 'opacity=".6"');
      o += r(0, 370, 400, 30, '#6cc25f');
      o += tower(200, 380, 190, 7, 52, 3);
      o += avatar(212, 74, 1.35);
      o += g('translate(316 46)', c(0, 0, 36, '#0e1222', 'opacity=".85"') + c(0, 0, 30, '#fff') + sk('M0 -18V0l12 8', '#0e1222', 5) + c(0, 0, 3.5, '#ff4b4b'));
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2f7ff0', '#9fd8ff', '#e3f4ff']));
      o += e(170, 380, 220, 60, '#fff', 'opacity=".7"') + e(800, 300, 200, 50, '#fff', 'opacity=".6"');
      o += r(0, 540, 960, 60, '#6cc25f');
      o += tower(480, 560, 260, 8, 66, 5) + tower(170, 560, 120, 5, 50, 8) + tower(800, 560, 130, 6, 48, 9);
      o += avatar(500, 60, 1.6);
      return o;
    }
  };
})();
