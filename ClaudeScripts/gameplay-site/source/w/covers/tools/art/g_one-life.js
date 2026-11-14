(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function face(x, y, s, o) {
    var skin = o.skin, hair = o.hair, shirt = o.shirt, bg = o.bg;
    var q = c(0, 0, 100, bg);
    if (o.long) q += d('M-50 -10 C-56 40 -48 74 -36 84 L36 84 C48 74 56 40 50 -10 C46 -48 26 -66 0 -66 C-26 -66 -46 -48 -50 -10Z', hair);
    q += d('M-72 100 C-66 60 -38 42 0 42 C38 42 66 60 72 100Z', shirt) + d('M-18 42 C-12 52 12 52 18 42', 'none', 'stroke="#000" stroke-opacity=".14" stroke-width="5"');
    q += r(-15, 20, 30, 30, skin, 14);
    q += c(-44, -14, 10, skin) + c(44, -14, 10, skin);
    q += e(0, -16, 42, 48, skin);
    if (o.kid) q += c(-24, 4, 8, '#ff8f8f', 'opacity=".3"') + c(24, 4, 8, '#ff8f8f', 'opacity=".3"');
    q += c(-16, -18, 6, '#3b2a1e') + c(16, -18, 6, '#3b2a1e') + c(-14, -20, 2, '#fff') + c(18, -20, 2, '#fff');
    q += d('M-26 -34 q9 -5 17 0 M9 -34 q8 -5 17 0', 'none', 'stroke="' + (o.brow || hair) + '" stroke-width="5" stroke-linecap="round"');
    q += d('M-14 8 q14 13 28 0', 'none', 'stroke="#8a3d33" stroke-width="5.5" stroke-linecap="round"');
    if (o.long) q += d('M-42 -14 C-42 -46 -24 -62 0 -62 C24 -62 42 -46 42 -14 C30 -34 18 -40 6 -40 C-4 -32 -22 -26 -42 -14Z', hair);
    else if (o.gray) q += d('M-41 -22 C-41 -36 -36 -44 -30 -48 C-33 -38 -33 -30 -33 -20Z M41 -22 C41 -36 36 -44 30 -48 C33 -38 33 -30 33 -20Z', hair);
    else q += d('M-42 -20 C-42 -50 -24 -64 0 -64 C24 -64 42 -50 42 -20 C34 -36 18 -42 0 -42 C-18 -42 -34 -36 -42 -20Z', hair);
    if (o.glasses) q += '<g fill="none" stroke="#2f3542" stroke-width="4.5"><circle cx="-16" cy="-18" r="14"/><circle cx="16" cy="-18" r="14"/><path d="M-2 -18h4M-30 -20l-10 -4M30 -20l10 -4"/></g>';
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', '<clipPath id="' + o.id + '"><circle cx="0" cy="0" r="100"/></clipPath><g clip-path="url(#' + o.id + ')">' + q + '</g>');
  }
  function bar(x, y, w, v, col) { return r(x, y, w, 16, '#e3e8f0', 8) + r(x, y, w * v, 16, col, 8); }
  function plus(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', c(0, 6, 46, '#000', 'opacity=".2"') + c(0, 0, 46, '#ffffff') + c(0, 0, 38, rg([['#4fd896', 0], ['#22b573', 0.6], ['#17925b', 1]], 0.35, 0.3, 0.8)) + sk('M0 -17 L0 17 M-17 0 L17 0', '#ffffff', 9));
  }
  G['one-life'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5fc8ff', '#2f6fe0'], 0, 0, 1, 1));
      o += c(70, 70, 120, '#ffffff', 'opacity=".08"') + c(340, 330, 140, '#ffffff', 'opacity=".07"');
      o += face(120, 300, 0.62, { id: uid('cf'), skin: '#efc3a2', hair: '#7b4a2a', shirt: '#f2b542', bg: '#fff0cc', kid: 1 });
      o += face(280, 300, 0.62, { id: uid('cf'), skin: '#dba47c', hair: '#aba59d', shirt: '#9b6be0', bg: '#ece2ff', gray: 1, glasses: 1, brow: '#8f877d' });
      o += face(200, 168, 1.02, { id: uid('cf'), skin: '#f7dcc8', hair: '#a4532c', shirt: '#40b98c', bg: '#dcf4e7', long: 1 });
      o += plus(300, 92, 0.95);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg([['#5aa8f5', 0], ['#2a5cc4', 1]], 0.5, 0.5, 0.8));
      o += rep(4, function (i) { var y = 40 + i * 140; return r(60, y, 520, 120, '#ffffff', 18) + r(84, y + 20, 110, 18, '#3d7be0', 9) + rep(3, function (j) { return c(92, y + 60 + j * 22, 5, j === 1 ? '#e5533d' : '#1fa463') + r(108, y + 54 + j * 22, 300 + ((i + j) % 3) * 50, 12, '#c9d3e2', 6); }); });
      o += r(620, 40, 300, 520, '#ffffff', 18);
      o += rep(4, function (i) { return r(650, 80 + i * 60, 36, 36, '#eef3fb', 10) + bar(700, 90 + i * 60, 190, [0.8, 0.62, 0.45, 0.9][i], ['#22b573', '#7cc443', '#e8c22e', '#22b573'][i]); });
      o += face(770, 430, 0.9, { id: uid('cf'), skin: '#bb7d57', hair: '#2a211e', shirt: '#5b8def', bg: '#dbe6ff' });
      o += plus(320, 560, 1.4);
      return o;
    }
  };
})();
