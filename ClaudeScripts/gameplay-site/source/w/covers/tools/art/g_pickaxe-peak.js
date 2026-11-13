(function () {
  var O = '#1d1b26', OL = 'stroke="' + O + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"';
  function gloss() {
    var id = uid('ppg');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function stars(n, w, h, seed) { var R = rnd(seed); return rep(n, function () { return c(R() * w, R() * h, 1 + R() * 2.4, '#fff', 'opacity="' + (.4 + R() * .6).toFixed(2) + '"'); }); }
  function pip(x, y, s, ax, ay) {
    var o = '';
    o += e(0, -36, 66, 16, '#3b2114');
    o += c(0, -84, 46, '#5d4b45', OL) + e(10, -66, 22, 26, '#8a756c');
    o += e(40, -88, 22, 15, '#7a655d', OL) + c(60, -90, 9, '#ff8fa3', 'stroke="' + O + '" stroke-width="5"');
    o += c(20, -102, 5.5, O) + c(21.5, -104, 2, '#fff');
    o += sk('M50 -86 L84 -80 M50 -94 L84 -96', 'rgba(29,27,38,.6)', 2.5);
    o += d('M-42 -108 A42 42 0 0 1 42 -108 Z', '#ffcf33', OL) + ln(-50, -110, 50, -110, '#e0a91a', 8) + c(28, -128, 10, '#fffbe0', 'stroke="' + O + '" stroke-width="4"');
    o += d('M-70 -36 L70 -36 L56 64 Q0 80 -56 64 Z', lg([['#9c4f22', 0], ['#e08a4e', .35], ['#c8713a', .6], ['#7e3d17', 1]], 0, 0, 1, 0), OL);
    o += sk('M-68 -16 L68 -16 M-60 40 Q0 52 60 40', 'rgba(80,35,12,.55)', 6);
    o += rep(4, function (i) { return c(-50 + i * 33, -16, 3.5, '#f6c08f'); });
    o += d('M-70 -36 A70 13 0 0 0 70 -36', 'none', 'stroke="#f0a46a" stroke-width="10"');
    var hx = ax, hy = ay, px = 0, py = -42, dx = hx - px, dy = hy - py, l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l, tx = hx - ux * 300, ty = hy - uy * 300;
    o += ln(tx, ty, hx, hy, O, 15) + ln(tx, ty, hx, hy, '#b07a42', 9);
    o += ln(-20, -66, px + ux * 14, py + uy * 14, O, 17) + ln(-20, -66, px + ux * 14, py + uy * 14, '#5d4b45', 11) + c(px + ux * 14, py + uy * 14, 10, '#ffb3c1', 'stroke="' + O + '" stroke-width="4"');
    o += ln(22, -64, px - ux * 16, py - uy * 16, O, 17) + ln(22, -64, px - ux * 16, py - uy * 16, '#5d4b45', 11) + c(px - ux * 16, py - uy * 16, 10, '#ffb3c1', 'stroke="' + O + '" stroke-width="4"');
    var vx = -uy, vy = ux;
    o += d('M' + (hx + vx * 56 - ux * 16) + ' ' + (hy + vy * 56 - uy * 16) + ' Q' + (hx + vx * 26 + ux * 14) + ' ' + (hy + vy * 26 + uy * 14) + ' ' + (hx + ux * 12) + ' ' + (hy + uy * 12) + ' Q' + (hx - vx * 26 + ux * 14) + ' ' + (hy - vy * 26 + uy * 14) + ' ' + (hx - vx * 56 - ux * 16) + ' ' + (hy - vy * 56 - uy * 16) + ' Q' + (hx - vx * 26) + ' ' + (hy - vy * 26) + ' ' + (hx - ux * 10) + ' ' + (hy - uy * 10) + ' Q' + (hx + vx * 26) + ' ' + (hy + vy * 26) + ' ' + (hx + vx * 56 - ux * 16) + ' ' + (hy + vy * 56 - uy * 16) + ' Z', '#9aa3b3', 'stroke="' + O + '" stroke-width="6" stroke-linejoin="round"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function rock(pts, fill, top) { return p(pts, fill, OL) + (top ? sk('M' + pts[0].join(' ') + ' L' + pts[1].join(' ') + ' L' + pts[2].join(' '), top, 6) : ''); }
  G['pickaxe-peak'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a4c9a', '#6a6fc0', '#ffb07a'], 0, 0, 0, 1));
      o += stars(22, 400, 160, 7) + c(70, 70, 26, '#f6f3df') + c(82, 62, 22, '#43559f');
      o += p([[0, 290], [70, 200], [130, 240], [200, 160], [280, 230], [340, 180], [400, 220], [400, 400], [0, 400]], '#4a4f86', 'opacity=".9"');
      o += rock([[200, 400], [222, 318], [292, 280], [360, 306], [400, 326], [400, 400]], '#a3aab8', '#dde1e8');
      o += rock([[-10, 400], [0, 364], [70, 352], [196, 364], [214, 400]], '#80859e', '#b5b9d0');
      o += pip(118, 300, 1, 118, -4);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#1f2a63', '#4a4f9a', '#ef9a6a'], 0, 0, 0, 1));
      o += stars(60, 960, 260, 11) + c(160, 120, 40, '#f3f0dc');
      o += p([[0, 420], [140, 260], [260, 330], [420, 180], [560, 300], [700, 210], [840, 300], [960, 250], [960, 600], [0, 600]], '#3a3e6e');
      o += p([[0, 480], [200, 360], [380, 430], [520, 330], [700, 420], [860, 360], [960, 400], [960, 600], [0, 600]], '#2c305a');
      o += rock([[380, 600], [420, 430], [560, 380], [700, 440], [760, 600]], '#959cab', '#cfd4de');
      o += rock([[200, 600], [230, 470], [380, 452], [440, 600]], '#737892', '#a7abc4');
      o += pip(330, 450, 1, 150, -20);
      return o;
    }
  };
})();
