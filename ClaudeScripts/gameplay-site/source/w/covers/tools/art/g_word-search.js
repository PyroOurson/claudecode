(function () {
  function letters(x0, y0, s, rows, col, fs) { var o = ''; rows.forEach(function (row, j) { for (var i = 0; i < row.length; i++) o += t(x0 + i * s + s / 2, y0 + j * s + s * 0.68, row[i], fs || s * 0.56, col, { w: 800 }); }); return o; }
  function hl(x1, y1, x2, y2, w, f) { return ln(x1, y1, x2, y2, f, w, 'opacity=".55"') + ln(x1, y1, x2, y2, 'none', w); }
  function cap(x1, y1, x2, y2, w, f) { return ln(x1, y1 + 4, x2, y2 + 4, '#000', w, 'opacity=".08"') + ln(x1, y1, x2, y2, f, w, 'opacity=".6"') + ln(x1, y1 - w * 0.28, x2, y2 - w * 0.28, '#fff', w * 0.14, 'opacity=".35"'); }
  function paper(w, h, s) { return r(0, 0, w, h, '#fffdf6') + rep(Math.ceil(h / s), function (j) { return ln(0, j * s, w, j * s, '#e3ecf8', 2); }); }
  G['word-search'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5ad1a8', '#1f9f86'], 0, 0, 1, 1));
      o += r(28, 36, 344, 344, '#0e6b5a', 24, 'opacity=".5"') + r(28, 28, 344, 344, '#fffdf6', 24);
      var s = 62, x0 = 45, y0 = 44;
      var rows = ['WFINDQ', 'ORPZEX', 'RKAJTU', 'DMOSEH', 'SLGVNB'];
      o += cap(x0 + s * 1.5, y0 + s * 0.5, x0 + s * 4.5, y0 + s * 0.5, 52, '#ffd21f');
      o += cap(x0 + s * 0.5, y0 + s * 0.5, x0 + s * 0.5, y0 + s * 4.5, 52, '#ff6aa0');
      o += cap(x0 + s * 1.5, y0 + s * 1.5, x0 + s * 3.5, y0 + s * 3.5, 52, '#3db5ff');
      o += letters(x0, y0, s, rows, '#1b2a4a');
      return o;
    },
    bg: function () {
      var o = paper(960, 600, 60), q = rnd(12), A = 'ABCDEFGHIJKLMNOPRSTUVWY', rows = [];
      for (var j = 0; j < 10; j++) { var row = ''; for (var i = 0; i < 16; i++) row += A[Math.floor(q() * A.length)]; rows.push(row); }
      o += cap(150, 90, 450, 90, 50, '#ffd21f') + cap(630, 150, 870, 390, 50, '#ff6aa0') + cap(90, 270, 90, 510, 50, '#3db5ff') + cap(330, 450, 690, 450, 50, '#7be06a');
      o += letters(0, 0, 60, rows, '#2a3a5a', 34);
      return o;
    }
  };
})();
