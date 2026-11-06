(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function ncol(n) { return n <= 4 ? '#1f5fd0' : n <= 8 ? '#1f9a4a' : '#e0262f'; }
  function scard(x, y, w, h, rot, n) {
    var o = r(-w / 2 + 6, -h / 2 + 9, w, h, '#000', w * 0.1, 'opacity=".3"') + r(-w / 2, -h / 2, w, h, lg(['#ffffff', '#eef0f4']), w * 0.1) + r(-w / 2 + w * 0.06, -h / 2 + w * 0.06, w * 0.88, h - w * 0.12, 'none', w * 0.07, 'stroke="#ff8a1a" stroke-width="' + w * 0.025 + '"');
    if (n) o += t(-w * 0.27, -h / 2 + w * 0.3, '' + n, w * 0.22, ncol(n), { ls: -2 }) + t(0, h * 0.16, '' + n, w * (n > 9 ? 0.6 : 0.78), ncol(n), { ls: -4 });
    else o += r(-w / 2 + w * 0.12, -h / 2 + w * 0.12, w * 0.76, h - w * 0.24, lg(['#ff5a3a', '#ffb21a']), w * 0.05) + star(0, 0, w * 0.36, w * 0.15, 5, '#fff') + star(0, 0, w * 0.22, w * 0.09, 5, '#ff8a1a');
    o += d('M' + (-w / 2 + w * 0.1) + ' ' + (-h / 2) + ' H' + (w / 2 - w * 0.1) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + w * 0.1) + ' Z', '#fff', 'opacity=".25"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  G['skip-bo'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ffc24a', 0], ['#f06a12', 0.6], ['#8a2a06', 1]], 0.45, 0.3, 0.85));
      for (var i = 0; i < 5; i++) o += scard(142 + i * 4, 126 + i * 32, 150, 210, -8 + i * 2, 8 + i);
      o += scard(300, 250, 130, 182, 18, 0);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#ff9a2a', '#6a1a04'], 0.5, 0.45, 0.8));
      [1, 5, 9, 12].forEach(function (n, i) { o += scard(240 + i * 160, 220, 120, 168, 0, n); });
      o += scard(130, 450, 120, 168, -6, 0) + scard(260, 450, 120, 168, 4, 7) + scard(700, 450, 120, 168, -4, 3) + scard(830, 450, 120, 168, 6, 10);
      return o;
    }
  };
})();
