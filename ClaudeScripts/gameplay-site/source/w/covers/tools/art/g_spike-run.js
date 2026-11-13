(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function blk(x, y, w, h) {
    return r(x, y, w, h, '#2d3550') + r(x, y, w, 7, '#58648c') + r(x, y + 7, w, 5, '#3d4768') + r(x, y, 4, h, '#000', 0, 'opacity=".25"') + r(x + w - 4, y, 4, h, '#000', 0, 'opacity=".25"');
  }
  function spikes(x, y, n, s) {
    var o = '';
    for (var i = 0; i < n; i++) { var a = x + i * 20 * s; o += p([[a, y], [a + 10 * s, y - 24 * s], [a + 20 * s, y]], '#e6e9f2', 'stroke="#7a8098" stroke-width="2" stroke-linejoin="round"') + r(a + 8.5 * s, y - 18 * s, 3 * s, 5 * s, '#c23a48'); }
    return o;
  }
  function saw(x, y, R) {
    var pts = [];
    for (var i = 0; i < 28; i++) { var a = i * Math.PI / 14, rr = i % 2 ? R * .78 : R; pts.push([+(x + Math.cos(a) * rr).toFixed(1), +(y + Math.sin(a) * rr).toFixed(1)]); }
    return p(pts, '#d7dbe6') + c(x, y, R * .62, '#9aa0b4') + c(x, y, R * .24, '#e2453c') + c(x - R * .25, y - R * .3, R * .1, '#fff', 'opacity=".6"');
  }
  function man(x, y, s, pose) {
    var b = pose === 'jump' ? 'M0 -18 L2 -35 M1 -32 L-8 -33 L-12 -42 M1 -32 L9 -30 L14 -38 M0 -18 L6 -11 L2 -3 M0 -18 L-5 -10 L-10 -2' : 'M0 -18 L3 -33 M3 -30 L-6 -24 L-9 -16 M3 -30 L11 -25 L15 -18 M0 -18 L9 -9 L14 0 M0 -18 L-8 -9 L-14 -6';
    var hx = pose === 'jump' ? 3 : 5, hy = pose === 'jump' ? -43 : -41;
    var o = sk(b, '#fff', 8.5, 'opacity=".95"') + sk(b, '#0b0e18', 5.2) + c(hx, hy, 9.8, '#fff', 'opacity=".95"') + c(hx, hy, 7.8, '#0b0e18');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function city(w, h, base, col, seed) {
    var o = '', x = 0, k = seed;
    while (x < w) { k = (k * 9301 + 49297) % 233280; var bw = 40 + k / 233280 * 70; k = (k * 9301 + 49297) % 233280; var bh = h * (.3 + k / 233280 * .5); o += r(x, base - bh, bw, bh + 4, col); x += bw + 6; }
    return o;
  }
  G['spike-run'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#1a2c62', '#3d5fb0', '#ff9a52']));
      o += c(310, 80, 34, '#ffe9b0', 'opacity=".85"');
      o += city(400, 220, 300, '#22355f', 3) + city(400, 150, 320, '#18264a', 7);
      o += blk(0, 300, 130, 100) + blk(280, 300, 120, 100);
      o += r(130, 330, 150, 70, '#10182e') + spikes(132, 352, 7, 1.05);
      o += saw(204, 250, 36);
      o += man(196, 214, 3.7, 'jump');
      o += star(330, 220, 26, 11, 5, '#ffd23a', -90, 'stroke="#b07a00" stroke-width="4" stroke-linejoin="round"');
      o += r(42, 222, 4, 78, '#c8ccd8') + d('M46 222 Q66 228 84 234 L46 248 Z', '#3ad36a');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#1b2a4e', '#3a5590', '#5a7fb8']));
      o += city(960, 360, 470, '#22355f', 11) + city(960, 260, 500, '#18264a', 5);
      o += blk(0, 470, 300, 130) + blk(420, 430, 200, 170) + blk(760, 470, 200, 130);
      o += r(300, 520, 120, 80, '#10182e') + spikes(302, 540, 6, 1) + r(620, 520, 140, 80, '#10182e') + spikes(622, 540, 7, 1);
      o += saw(690, 380, 40) + saw(250, 300, 30);
      o += man(520, 430, 2.4, 'run') + man(350, 340, 2.2, 'jump');
      return o;
    }
  };
})();
