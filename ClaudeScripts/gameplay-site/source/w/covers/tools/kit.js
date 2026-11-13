var G = {};
var _u = 0;
function uid(p) { return (p || 'k') + (_u++); }
function A(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
function r(x, y, w, h, f, rx, x2) { return '<rect' + A({ x: x, y: y, width: w, height: h, fill: f, rx: rx }) + ' ' + (x2 || '') + '/>'; }
function c(cx, cy, rr, f, x2) { return '<circle' + A({ cx: cx, cy: cy, r: rr, fill: f }) + ' ' + (x2 || '') + '/>'; }
function e(cx, cy, rx, ry, f, x2) { return '<ellipse' + A({ cx: cx, cy: cy, rx: rx, ry: ry, fill: f }) + ' ' + (x2 || '') + '/>'; }
function p(pts, f, x2) { if (Array.isArray(pts)) pts = pts.map(function (q) { return q.join(','); }).join(' '); return '<polygon points="' + pts + '" fill="' + f + '" ' + (x2 || '') + '/>'; }
function d(path, f, x2) { return '<path d="' + path + '" fill="' + f + '" ' + (x2 || '') + '/>'; }
function sk(path, col, w, x2) { return '<path d="' + path + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" ' + (x2 || '') + '/>'; }
function ln(x1, y1, x2, y2, col, w, x3) { return '<line' + A({ x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }) + ' ' + (x3 || '') + '/>'; }
function t(x, y, s, size, f, o) { o = o || {}; return '<text' + A({ x: x, y: y, 'font-size': size, fill: f, 'font-family': o.font || 'Montserrat', 'font-weight': o.w || 900, 'text-anchor': o.a || 'middle', 'letter-spacing': o.ls, stroke: o.st, 'stroke-width': o.sw, 'paint-order': o.st ? 'stroke' : undefined, 'stroke-linejoin': o.st ? 'round' : undefined, transform: o.tr }) + '>' + s + '</text>'; }
function g(tr, inner, x2) { return '<g transform="' + tr + '" ' + (x2 || '') + '>' + inner + '</g>'; }
function rep(n, fn) { var s = ''; for (var i = 0; i < n; i++) s += fn(i); return s; }
function lg(stops, x1, y1, x2, y2) { var id = uid('l'); _defs += '<linearGradient id="' + id + '"' + A({ x1: x1 === undefined ? 0 : x1, y1: y1 === undefined ? 0 : y1, x2: x2 === undefined ? 0 : x2, y2: y2 === undefined ? 1 : y2 }) + '>' + stops.map(function (s, i) { return '<stop offset="' + (Array.isArray(s) ? s[1] : i / Math.max(1, stops.length - 1)) + '" stop-color="' + (Array.isArray(s) ? s[0] : s) + '"/>'; }).join('') + '</linearGradient>'; return 'url(#' + id + ')'; }
function rg(stops, cx, cy, rr) { var id = uid('r'); _defs += '<radialGradient id="' + id + '"' + A({ cx: cx === undefined ? 0.5 : cx, cy: cy === undefined ? 0.5 : cy, r: rr === undefined ? 0.5 : rr }) + '>' + stops.map(function (s, i) { return '<stop offset="' + (Array.isArray(s) ? s[1] : i / Math.max(1, stops.length - 1)) + '" stop-color="' + (Array.isArray(s) ? s[0] : s) + '"/>'; }).join('') + '</radialGradient>'; return 'url(#' + id + ')'; }
function star(cx, cy, R, ri, n, f, rot, x2) { var q = []; rot = rot || -90; for (var i = 0; i < n * 2; i++) { var a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? ri : R; q.push([+(cx + rr * Math.cos(a)).toFixed(1), +(cy + rr * Math.sin(a)).toFixed(1)]); } return p(q, f, x2); }
function rnd(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
var _defs = '';
function svgWrap(w, h, inner) { var out = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + _defs + '</defs>' + inner + '</svg>'; _defs = ''; return out; }
function show(id, name) {
  var a = G[id];
  var bg = svgWrap(960, 600, a.bg());
  var ic = svgWrap(400, 400, a.icon());
  var fs = a.fs || (name.length > 15 ? 50 : 56);
  document.getElementById('c').innerHTML = '<div class="bg">' + bg + '</div><div class="vg"></div><div class="box">' + ic + '</div><div class="nm" style="font-size:' + fs + 'px">' + name + '</div>';
}
function pix(rows, x0, y0, s, pal, x2) { var o = ''; rows.forEach(function (row, j) { for (var i = 0; i < row.length; i++) { var ch = row[i]; if (pal[ch]) o += '<rect x="' + (x0 + i * s) + '" y="' + (y0 + j * s) + '" width="' + (s + 0.6) + '" height="' + (s + 0.6) + '" fill="' + pal[ch] + '"/>'; } }); return x2 ? '<g ' + x2 + '>' + o + '</g>' : o; }
function shade(rx, ry, cx, cy, op) { return e(cx, cy, rx, ry, '#000', 'opacity="' + (op || 0.18) + '"'); }
