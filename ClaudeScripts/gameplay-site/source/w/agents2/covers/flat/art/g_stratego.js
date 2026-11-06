(function () {
  function grass(x0, y0, n, m, s, lakes) {
    var o = '';
    for (var j = 0; j < m; j++) for (var i = 0; i < n; i++) {
      var x = x0 + i * s, y = y0 + j * s, L = lakes && lakes[i + ',' + j];
      o += r(x, y, s, s, L ? '#2f8fe0' : (i + j) % 2 ? '#5cb84a' : '#68c454', 0, 'stroke="#3f8a32" stroke-width="2"');
      if (L) o += sk('M' + (x + s * 0.2) + ' ' + (y + s * 0.4) + ' q' + s * 0.15 + ' -' + s * 0.1 + ' ' + s * 0.3 + ' 0 t' + s * 0.3 + ' 0', '#9fd8ff', s * 0.05) + sk('M' + (x + s * 0.35) + ' ' + (y + s * 0.65) + ' q' + s * 0.15 + ' -' + s * 0.1 + ' ' + s * 0.3 + ' 0', '#9fd8ff', s * 0.05);
    }
    return o;
  }
  function piece(x, y, s, f, dk, face) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')',
      e(10, 6, 80, 16, '#000', 'opacity=".35"') + p([[-60, 0], [60, 0], [76, -12], [-44, -12]], dk) + p([[60, 0], [76, -12], [76, -172], [60, -160]], dk) + p([[-60, -160], [-44, -172], [76, -172], [60, -160]], f) +
      r(-60, -160, 120, 160, f, 6) + r(-52, -152, 18, 140, '#fff', 8, 'opacity=".22"') + (face || ''));
  }
  var bomb = c(0, -70, 34, '#1e2028') + e(-11, -82, 10, 7, '#fff', 'opacity=".5" transform="rotate(-35 -11 -82)"') + r(-10, -112, 20, 14, '#5a5e6a', 3) + sk('M0 -112 C6 -126 20 -126 22 -136', '#d8b26a', 5) + star(26, -140, 14, 6, 8, '#ffd23f') + c(26, -140, 5, '#fff');
  var plate = c(0, -84, 42, '#fff', 'opacity=".95"');
  var crest = d('M-30 -120 L30 -120 L30 -78 C30 -50 0 -36 0 -36 C0 -36 -30 -50 -30 -78 Z', 'none', 'stroke="#ffd23f" stroke-width="6"') + star(0, -86, 16, 7, 5, '#ffd23f');
  G['stratego'] = {
    icon: function () {
      var o = grass(-20, -20, 6, 6, 80, { '2,1': 1, '3,1': 1, '2,0': 1, '3,0': 1 });
      o += r(0, 0, 400, 400, lg([['#000', 0], ['#000', 1]]), 0, 'opacity=".08"');
      o += piece(276, 300, 1.05, '#2d6ff0', '#173f9e', crest);
      o += piece(130, 360, 1.35, '#e8322c', '#9e1914', plate + bomb);
      return o;
    },
    bg: function () {
      var o = grass(0, 0, 12, 8, 80, { '3,3': 1, '4,3': 1, '3,4': 1, '4,4': 1, '7,3': 1, '8,3': 1, '7,4': 1, '8,4': 1 });
      for (var i = 0; i < 12; i++) { o += piece(40 + i * 80, 150, 0.4, '#2d6ff0', '#173f9e') + piece(40 + i * 80, 70, 0.4, '#2d6ff0', '#173f9e'); o += piece(40 + i * 80, 550, 0.4, '#e8322c', '#9e1914', plate) + (i % 3 ? piece(40 + i * 80, 470, 0.4, '#e8322c', '#9e1914', plate) : ''); }
      return o;
    }
  };
})();
