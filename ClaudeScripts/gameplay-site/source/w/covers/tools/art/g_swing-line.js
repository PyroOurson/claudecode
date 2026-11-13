(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function cloud(x, y, s, op) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(0, 0, 70, 18, '#fff') + c(30, -10, 34, '#fff') + c(-26, -4, 22, '#fff'), 'opacity="' + (op || .8) + '"');
  }
  function hook(x, y, s, glow) {
    var o = '';
    if (glow) o += c(0, 0, 30, 'none', 'stroke="#fff" stroke-width="5" opacity=".9"');
    o += c(3, 4, 18, '#000', 'opacity=".22"') + c(0, 0, 18, '#ff5a8a') + c(0, 0, 10, '#ffd0df');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function man(x, y, s, rot, hang) {
    var L = '#1d2333', W = '#0b0f1a';
    var arms = hang ? 'M0 -8 L-10 -21 L-3 -36 M0 -8 L10 -22 L3 -36' : 'M0 -8 L-10 -12 L-18 -19 M0 -8 L10 -11 L18 -17';
    var legs = hang ? 'M0 9 L-5 20 L-8 31 M0 9 L5 20 L9 30' : 'M0 9 L-7 20 L-9 30 M0 9 L8 19 L10 29';
    var body = 'M0 -11 L0 9 ' + arms + ' ' + legs;
    var o = sk(body, W, 9) + sk(body, L, 5.6) + c(0, -21, 10.4, W) + c(0, -21, 8.6, L) + c(-2.6, -24, 3, '#fff', 'opacity=".3"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  G['swing-line'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#4fa8ff', '#9fd8ff', '#e2f6ff']));
      o += c(318, 86, 46, '#fff7c2', 'opacity=".9"') + c(318, 86, 70, '#fff7c2', 'opacity=".18"');
      o += cloud(90, 90, .9) + cloud(250, 170, .7, .7);
      o += d('M0 330 C80 290 160 300 230 320 C300 340 350 310 400 300 V400 H0 Z', '#9cd38c') + d('M0 360 C90 330 200 345 270 360 C330 372 370 356 400 350 V400 H0 Z', '#6dbb5e');
      o += d('M0 384 C100 376 300 392 400 380 V400 H0 Z', '#3d9be0');
      var trail = 'M50 320 C90 318 130 298 158 276';
      o += sk(trail, '#fff', 22, 'opacity=".35"') + sk(trail, '#fff', 10, 'opacity=".5"');
      o += ln(300, 84, 236, 170, '#2a2f45', 9) + ln(300, 84, 236, 170, '#f4f1e6', 4.5);
      o += hook(300, 84, 1.5, true);
      o += man(186, 240, 2.6, 36, true);
      o += g('translate(96,236)', p([[-14, -6], [-7, -16], [7, -16], [14, -6], [0, 16]], '#0e8a80') + p([[-10, -6], [-5, -12], [5, -12], [10, -6], [0, 11]], '#3fe0d0'));
      o += star(330, 250, 26, 11, 5, '#ffd23a', -90, 'stroke="#b07a00" stroke-width="4" stroke-linejoin="round"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4fa8ff', '#a6dcff', '#e2f6ff']));
      o += c(780, 120, 70, '#fff7c2', 'opacity=".85"');
      o += cloud(150, 110, 1.3) + cloud(520, 80, 1) + cloud(860, 220, 1.1);
      o += d('M0 420 C160 360 320 380 480 410 C640 440 800 380 960 390 V600 H0 Z', '#9cd38c') + d('M0 480 C200 440 380 470 540 490 C700 510 840 470 960 470 V600 H0 Z', '#6dbb5e');
      o += r(0, 548, 960, 52, '#3d9be0');
      o += hook(220, 150, 1.6) + hook(470, 120, 1.6) + hook(720, 160, 1.6);
      o += ln(470, 120, 520, 226, '#2a2f45', 8) + ln(470, 120, 520, 226, '#f4f1e6', 4);
      o += man(560, 300, 2.4, -28, true) + man(300, 260, 2.2, 60, false);
      return o;
    }
  };
})();
