G['paper-land'] = {
  cube: function (x, y, s, rot, base, side, hi, face) {
    var h = 50 * s, rr = 15 * s, dep = 16 * s;
    var o = e(x, y + dep + h * 0.35, h * 1.15, h * 0.62, '#2a2850', 'opacity=".18"');
    o += g('translate(' + x + ',' + (y + dep) + ') rotate(' + rot + ')', r(-h, -h, h * 2, h * 2, side, rr));
    o += g('translate(' + x + ',' + (y + dep * 0.5) + ') rotate(' + rot + ')', r(-h, -h, h * 2, h * 2, side, rr));
    var f = r(-h, -h, h * 2, h * 2, base, rr) + r(-h + 5 * s, -h + 5 * s, h * 2 - 10 * s, h * 2 - 10 * s, 'none', rr * 0.8, 'stroke="' + hi + '" stroke-width="' + 5 * s + '"');
    f += d('M' + (-h + 10 * s) + ' ' + (-h + 26 * s) + 'Q' + (-h + 10 * s) + ' ' + (-h + 10 * s) + ' ' + (-h + 26 * s) + ' ' + (-h + 10 * s) + 'L' + (h * 0.2) + ' ' + (-h + 10 * s), 'none', 'stroke="#fff" stroke-opacity=".55" stroke-width="' + 7 * s + '" stroke-linecap="round"');
    if (face) {
      f += e(-h * 0.62, h * 0.18, h * 0.2, h * 0.13, '#ff9db0', 'opacity=".75"') + e(h * 0.62, h * 0.18, h * 0.2, h * 0.13, '#ff9db0', 'opacity=".75"');
      f += c(-h * 0.36, -h * 0.22, h * 0.3, '#fff') + c(h * 0.36, -h * 0.22, h * 0.3, '#fff');
      f += c(-h * 0.3, -h * 0.12, h * 0.15, '#1d1b2e') + c(h * 0.42, -h * 0.12, h * 0.15, '#1d1b2e');
      f += c(-h * 0.25, -h * 0.18, h * 0.055, '#fff') + c(h * 0.47, -h * 0.18, h * 0.055, '#fff');
      f += sk('M' + (-h * 0.26) + ' ' + (h * 0.3) + 'Q0 ' + (h * 0.56) + ' ' + (h * 0.26) + ' ' + (h * 0.3), '#1d1b2e', 7 * s);
    }
    return o + g('translate(' + x + ',' + y + ') rotate(' + rot + ')', f);
  },
  land: function (path, base, side, dep) {
    return d(path, '#2a2850', 'opacity=".13" transform="translate(0,' + (dep + 8) + ')"') + d(path, side, 'transform="translate(0,' + dep + ')"') + d(path, side, 'transform="translate(0,' + dep / 2 + ')"') + d(path, base);
  },
  floor: function (w, h, step) {
    var o = r(0, 0, w, h, lg(['#f1f3fa', '#d8deec']));
    for (var y = 0; y < h + step; y += step) for (var x = (y / step) % 2 ? step / 2 : 0; x < w + step; x += step) o += p([[x, y - 7], [x + 7, y], [x, y + 7], [x - 7, y]], '#dde2ee');
    return o;
  },
  icon: function () {
    var A = G['paper-land'];
    var o = A.floor(400, 400, 44);
    o += A.land('M268 -10L420 -10L420 120C380 140 340 120 318 96C296 72 262 40 268 -10Z', '#4d8dff', '#3466c4', 14);
    o += A.land('M-10 214C30 196 92 204 122 232C150 258 150 300 186 318C214 332 210 372 196 410L-10 410Z', '#ff5e5b', '#c2423f', 16);
    o += sk('M150 262C150 176 186 118 252 112C318 106 352 160 334 218C322 256 292 274 262 278', '#ff8f8c', 34, 'stroke-opacity=".8"');
    o += sk('M150 262C150 176 186 118 252 112C318 106 352 160 334 218C322 256 292 274 262 278', '#fff', 6, 'stroke-opacity=".35" stroke-dasharray="2 16"');
    o += A.cube(244, 258, 1.32, -14, '#ff5e5b', '#a83634', '#ff9b98', true);
    o += g('translate(340,300)', star(0, 0, 18, 6, 4, '#fff', -90, 'opacity=".95"')) + c(318, 334, 5, '#fff', 'opacity=".9"') + c(362, 270, 4, '#fff', 'opacity=".8"');
    o += rep(5, function (i) { return e(90, 50, 80 + i * 40, 50 + i * 26, '#fff', 'opacity=".07"'); });
    return o;
  },
  bg: function () {
    var A = G['paper-land'];
    var o = A.floor(960, 600, 52);
    o += c(480, 1180, 1000, 'none', 'stroke="#c9cfdf" stroke-width="40"');
    o += A.land('M40 120C90 70 190 80 230 130C270 180 250 250 190 270C130 290 60 270 40 220C25 185 20 150 40 120Z', '#ff5e5b', '#c2423f', 18);
    o += A.land('M620 40C700 10 820 30 860 90C900 150 870 220 800 230C730 240 650 220 620 160C600 120 590 60 620 40Z', '#4d8dff', '#3466c4', 18);
    o += A.land('M330 380C380 340 470 350 500 400C530 450 500 520 430 530C360 540 300 510 300 460C300 430 310 400 330 380Z', '#ffc93c', '#c49a26', 18);
    o += A.land('M720 380C760 350 840 360 870 400C900 450 880 520 810 530C750 540 700 500 700 450C700 420 705 395 720 380Z', '#4cd47a', '#2f9e58', 18);
    o += A.land('M90 420C120 400 180 410 196 450C210 490 180 540 130 540C90 540 60 510 64 470C66 450 76 430 90 420Z', '#b066ff', '#7f45c4', 18);
    o += sk('M230 170C300 140 380 160 400 220C420 290 360 320 300 300', '#ff8f8c', 26, 'stroke-opacity=".8"');
    o += sk('M640 170C580 220 560 300 600 340C640 380 700 360 720 330', '#86afff', 26, 'stroke-opacity=".8"');
    o += sk('M500 420C560 380 640 390 660 450', '#ffd97a', 26, 'stroke-opacity=".85"');
    o += A.cube(300, 300, 0.62, 20, '#ff5e5b', '#a83634', '#ff9b98', true);
    o += A.cube(720, 330, 0.62, -30, '#4d8dff', '#264a94', '#8fb3ff', true);
    o += A.cube(660, 450, 0.55, 10, '#ffc93c', '#a8801e', '#ffe08a', true);
    o += A.cube(150, 470, 0.5, -10, '#b066ff', '#6a3aa8', '#d6a8ff', true);
    return o;
  }
};
