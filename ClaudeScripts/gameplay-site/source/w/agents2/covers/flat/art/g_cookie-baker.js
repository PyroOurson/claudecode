(function () {
  function edge(cx, cy, R, seed, bite) {
    var q = [], rn = rnd(seed), n = 72;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a), rr = R * (0.965 + rn() * 0.05);
      if (bite) {
        var bx = bite[0] - cx, by = bite[1] - cy, dot = ux * bx + uy * by, disc = dot * dot - (bx * bx + by * by) + bite[2] * bite[2];
        if (disc > 0) { var th = dot - Math.sqrt(disc); if (th > 0 && th < rr) rr = th * (0.97 + rn() * 0.05); }
      }
      q.push([+(cx + ux * rr).toFixed(1), +(cy + uy * rr).toFixed(1)]);
    }
    return q;
  }
  function blob(cx, cy, s, seed, f, x2) {
    var q = [], rn = rnd(seed), n = 7;
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + rn() * 0.4, rr = s * (0.7 + rn() * 0.45); q.push([+(cx + Math.cos(a) * rr).toFixed(1), +(cy + Math.sin(a) * rr * 0.85).toFixed(1)]); }
    return p(q, f, 'stroke="' + f + '" stroke-width="' + (s * 0.35).toFixed(1) + '" stroke-linejoin="round" ' + (x2 || ''));
  }
  function cookie(cx, cy, R, seed, gold, bite) {
    var pal = gold ? ['#fff4b0', '#f6c440', '#c98a10', '#7a4a06', '#a8680a'] : ['#f4cf8e', '#d99a52', '#a8662a', '#5c3214', '#3b1d0b'];
    var pts = edge(cx, cy, R, seed, bite), o = '';
    o += p(pts.map(function (v) { return [v[0] + R * 0.05, v[1] + R * 0.09]; }), '#000', 'opacity=".28"');
    o += p(pts, pal[3]);
    o += p(edge(cx, cy, R * 0.93, seed + 3, bite ? [bite[0], bite[1], bite[2] + R * 0.05] : null), rg([[pal[0], 0], [pal[1], 0.45], [pal[2], 1]], 0.36, 0.3, 0.8));
    var rn = rnd(seed + 11), spots = [[-0.42, -0.3, 0.2], [0.12, -0.46, 0.16], [0.36, 0.05, 0.19], [-0.1, 0.05, 0.22], [-0.48, 0.32, 0.15], [0.12, 0.48, 0.18], [0.5, -0.36, 0.12], [-0.12, -0.7, 0.1], [0.62, 0.42, 0.11]];
    spots.forEach(function (sp, i) {
      var x = cx + sp[0] * R, y = cy + sp[1] * R, s = sp[2] * R * 0.62;
      if (bite) { var dx = x - bite[0], dy = y - bite[1]; if (Math.sqrt(dx * dx + dy * dy) < bite[2] + s * 1.6) return; }
      o += blob(x + s * 0.12, y + s * 0.2, s, seed + i * 7, pal[4], 'opacity=".35"') + blob(x, y, s, seed + i * 7, gold ? '#b8740a' : '#4a2410') + e(x - s * 0.3, y - s * 0.35, s * 0.32, s * 0.2, '#fff', 'opacity="' + (gold ? 0.55 : 0.28) + '"');
    });
    for (var k = 0; k < 14; k++) { var a = rn() * Math.PI * 2, dd = rn() * R * 0.75; o += e(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, R * 0.035, R * 0.018, pal[3], 'opacity=".35" transform="rotate(' + Math.round(rn() * 180) + ' ' + (cx + Math.cos(a) * dd).toFixed(1) + ' ' + (cy + Math.sin(a) * dd).toFixed(1) + ')"'); }
    o += d('M' + (cx - R * 0.72) + ' ' + (cy - R * 0.2) + ' Q' + (cx - R * 0.62) + ' ' + (cy - R * 0.7) + ' ' + (cx - R * 0.1) + ' ' + (cy - R * 0.8), 'none', 'stroke="#fff" stroke-width="' + (R * 0.07).toFixed(1) + '" stroke-linecap="round" opacity=".38"');
    return o;
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function rays(cx, cy, n, R, col, op) {
    var o = '';
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, w = Math.PI / n * 0.55; o += p([[cx, cy], [cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R], [cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R]], col, 'opacity="' + op + '"'); }
    return o;
  }
  G['cookie-baker'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2fa5a0', 0], ['#17706f', 0.55], ['#0b3a40', 1]], 0.4, 0.3, 0.9));
      o += rays(200, 210, 16, 330, '#bff5e6', 0.09);
      o += e(204, 364, 138, 18, '#000', 'opacity=".25"');
      o += cookie(194, 206, 152, 5, false, [334, 96, 56]);
      o += blob(352, 178, 9, 3, '#c98a48') + blob(366, 208, 6, 8, '#a8662a') + blob(340, 220, 5, 12, '#d99a52');
      o += c(84, 80, 46, '#ffe9a0', 'opacity=".08"') + c(84, 80, 34, '#ffe9a0', 'opacity=".12"') + c(84, 80, 22, '#fff6c8', 'opacity=".2"') + star(84, 80, 30, 11, 4, '#fff3b0') + star(84, 80, 16, 6, 4, '#fff', 45);
      o += star(336, 310, 13, 5, 4, '#fff3b0', 0, 'opacity=".9"');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg([['#2b9c96', 0], ['#145c5e', 0.55], ['#082a30', 1]], 0.5, 0.42, 0.8));
      o += rays(480, 280, 22, 900, '#c9fff0', 0.07);
      o += cookie(480, 280, 190, 21, false, [640, 140, 60]);
      var rn = rnd(77);
      [[110, 120, 52], [250, 470, 40], [820, 110, 58], [880, 420, 46], [690, 520, 34], [70, 380, 36], [330, 90, 30], [610, 60, 26]].forEach(function (q, i) { o += cookie(q[0], q[1], q[2], 30 + i * 5, i === 2, null); });
      for (var i = 0; i < 40; i++) { var x = rn() * 960, y = rn() * 600; o += r(x, y, 14, 5, ['#ff7a9a', '#ffd34d', '#8ee6ff', '#ffffff'][i % 4], 2.5, 'transform="rotate(' + Math.round(rn() * 180) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')" opacity=".75"'); }
      o += d('M0 540 Q120 515 240 540 T480 540 T720 540 T960 540 V600 H0 Z', '#f6f2e8') + d('M0 552 Q120 530 240 552 T480 552 T720 552 T960 552', 'none', 'stroke="#fff" stroke-width="5" opacity=".7"');
      return o;
    }
  };
})();
