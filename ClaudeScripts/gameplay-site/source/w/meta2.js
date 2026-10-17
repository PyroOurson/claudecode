const fs = require('fs'), vm = require('vm'), path = require('path'), inspector = require('inspector');
const [dir, outFile, extraFile] = process.argv.slice(2);
const order = JSON.parse(fs.readFileSync(path.join(dir, '_order.json')));
const have = fs.readdirSync(dir);
const partFile = (n, ext) => { const re = new RegExp('^\\d{3}_' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.' + ext + '$'); const f = have.filter(x => re.test(x)).sort()[0]; if (!f) throw new Error('missing part ' + n); return path.join(dir, f); };
const KEEP = ['title', 'category', 'tint', 'blurb', 'help', 'better', 'width', 'ownPause'];
const session = new inspector.Session();
session.connect();
const post = (m, p) => { let res, err; session.post(m, p, (e, r) => { err = e; res = r; }); if (err) throw new Error(m + ': ' + JSON.stringify(err)); return res; };
const handle = v => { globalThis.__mv = v; return post('Runtime.evaluate', { expression: 'globalThis.__mv' }).result.objectId; };
const fetchVal = oid => { post('Runtime.callFunctionOn', { objectId: oid, functionDeclaration: 'function () { globalThis.__mv = this; }' }); return globalThis.__mv; };
function closureVars(fn) {
  const props = post('Runtime.getProperties', { objectId: handle(fn), ownProperties: true });
  const sc = (props.internalProperties || []).find(p => p.name === '[[Scopes]]');
  const out = new Map();
  if (!sc) return out;
  const scopes = post('Runtime.getProperties', { objectId: sc.value.objectId, ownProperties: true }).result;
  scopes.forEach(s => {
    if (!s.value || !/^Closure|^Block|^Script/.test(s.value.description || '')) return;
    post('Runtime.getProperties', { objectId: s.value.objectId, ownProperties: true }).result.forEach(v => {
      if (out.has(v.name) || !v.value) return;
      if (v.value.objectId) out.set(v.name, { oid: v.value.objectId });
      else out.set(v.name, { val: v.value.unserializableValue !== undefined ? eval(v.value.unserializableValue) : v.value.value });
    });
  });
  return out;
}
const tokens = src => { const t = new Set(); src.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, ' ').replace(/(^|[^.\w$]|\?\.)([A-Za-z_$][\w$]*)/g, (m, a, b) => { if (a !== '?.') t.add(b); return m; }); return t; };
const onlyLength = (src, name) => { const all = src.match(new RegExp('(^|[^.\\w$])' + name.replace(/\$/g, '\\$') + '(?![\\w$])', 'g')) || []; const len = src.match(new RegExp('(^|[^.\\w$])' + name.replace(/\$/g, '\\$') + '\\.length(?![\\w$])', 'g')) || []; return all.length > 0 && all.length === len.length; };
function fnSrc(f) {
  let s = f.toString();
  if (/^(async\s+)?function\b/.test(s) || /^(async\s*)?(\([^)]*\)|[\w$]+)\s*=>/.test(s)) return s;
  if (/^class\b/.test(s)) throw new Error('class');
  return 'function ' + s.replace(/^(async\s+)?(get\s+|set\s+)?/, '$1');
}
function ser(v, depth) {
  if (depth > 6) throw new Error('deep');
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  const t = typeof v;
  if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
  if (t === 'string' || t === 'boolean') return JSON.stringify(v);
  if (t === 'function') throw new Error('nested function');
  if (Array.isArray(v)) return '[' + v.map(x => ser(x, depth + 1)).join(',') + ']';
  if (t === 'object' && Object.getPrototypeOf(v) && Object.getPrototypeOf(Object.getPrototypeOf(v)) === null) return '{' + Object.keys(v).map(k => JSON.stringify(k) + ':' + ser(v[k], depth + 1)).join(',') + '}';
  throw new Error('unsupported ' + t);
}
function shimFor(fn) {
  const decls = new Map(), seen = new Set();
  const walk = f => {
    if (seen.has(f)) return;
    seen.add(f);
    const src = fnSrc(f), toks = tokens(src), cv = closureVars(f);
    cv.forEach((ref, name) => {
      if (!toks.has(name) || decls.has(name)) return;
      if ('val' in ref) { decls.set(name, ser(ref.val, 0)); return; }
      const val = fetchVal(ref.oid);
      if (typeof val === 'function') { decls.set(name, fnSrc(val)); walk(val); return; }
      if (onlyLength(src, name) && val && typeof val.length === 'number') { decls.set(name, '{ length: ' + val.length + ' }'); return; }
      decls.set(name, ser(val, 0));
    });
  };
  walk(fn);
  const body = fnSrc(fn);
  if (!decls.size) return body;
  return '(() => { ' + [...decls].map(([k, v]) => 'const ' + k + ' = ' + v + ';').join(' ') + ' return ' + body + '; })()';
}
const SAMPLES = [0, 1, 2, 3, 4, 5, 7, 9, 9.5, 10, 11, 12.34, 15, 20, 25, 33, 42, 50, 59, 59.94, 60, 61, 75.5, 99, 99.9, 100, 101, 123, 150.25, 200, 365, 500, 599, 600, 999, 1000, 1001, 1234, 1999.5, 3599, 3600, 5000, 7261.7, 9999, 10000, 12345, 65432.1, 99999, 100000, 123456, 999999, 1e6, 1234567, 9.87e7, 1e9, 3.3e12, 1e15, 4.2e18, 1e21, 0.5, 0.25, 0.1];
function verify(fn, shim) {
  let f2;
  try { f2 = vm.runInNewContext('(' + shim + ')'); } catch (e) { return 'compile: ' + e.message; }
  for (const v of SAMPLES) {
    let a, b;
    try { a = 'ok:' + String(fn(v)); } catch (e) { a = 'err'; }
    try { b = 'ok:' + String(f2(v)); } catch (e) { b = 'err'; }
    if (a !== b) return 'mismatch at ' + v + ': ' + a + ' vs ' + b;
  }
  return null;
}
const P = new Proxy(function () {}, { get: (o, p) => typeof p === 'symbol' ? undefined : P, apply: () => P, construct: () => P });
const covers = {}, shots = {}, games = [], parts = {};
const portal = fs.readFileSync(partFile(order[1][1], 'js'), 'utf8');
const cm = /const C = (Object\.freeze\(\{[\s\S]*?\}\));\n/.exec(portal);
const Ameplay = { colors: vm.runInNewContext(cm[1]), covers, shots, register: null, analytics: { track() {}, sink: null } };
const problems = [];
const run = (src, name) => {
  const regs = [];
  Ameplay.register = g => regs.push(g);
  const ctx = { Ameplay, console, atob: s => Buffer.from(s, 'base64').toString('binary'), btoa: s => Buffer.from(s, 'binary').toString('base64'), TextDecoder, TextEncoder, URL, setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {}, performance: { now: () => 0 }, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1 };
  ['matchMedia', 'Path2D', 'document', 'navigator', 'localStorage', 'sessionStorage', 'Image', 'Audio', 'AudioContext', 'webkitAudioContext', 'addEventListener', 'removeEventListener', 'location', 'history', 'getComputedStyle', 'CanvasRenderingContext2D', 'OffscreenCanvas', 'ImageData', 'Blob', 'fetch', 'screen', 'THREE', 'Peer', 'indexedDB', 'crypto', 'speechSynthesis', 'ResizeObserver', 'IntersectionObserver', 'MutationObserver', 'Event', 'CustomEvent', 'KeyboardEvent', 'PointerEvent', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'XMLSerializer', 'Worker', 'FontFace', 'alert', 'confirm', 'prompt', 'open', 'scrollTo', 'getSelection', 'visualViewport', 'dispatchEvent', 'createImageBitmap', 'WebGLRenderingContext', 'WebGL2RenderingContext', 'DecompressionStream', 'CompressionStream', 'Response', 'Request', 'Headers', 'TextMetrics'].forEach(k => { ctx[k] = P; });
  vm.createContext(ctx);
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  try { vm.runInContext(src, ctx, { filename: name }); } catch (e) { problems.push(name + ': ' + e.message); }
  return regs;
};
order.forEach(([k, n], i) => {
  if (k !== 'script' || i < 2) return;
  const fn = partFile(n, 'js');
  const regs = run(fs.readFileSync(fn, 'utf8'), fn);
  if (n.startsWith('g_')) parts[n] = regs.map(g => g.id);
  else if (regs.length) problems.push(n + ': non-game part registered games');
  regs.forEach(g => {
    if (typeof g.mount !== 'function') { problems.push(g.id + ': no mount'); return; }
    const m = { id: g.id, part: n };
    KEEP.forEach(f => { if (g[f] !== undefined) m[f] = g[f]; });
    KEEP.forEach(f => { if (m[f] !== undefined && typeof m[f] === 'function') problems.push(g.id + ': ' + f + ' is a function'); });
    if (typeof g.icon === 'string') m.icon = g.icon;
    if (typeof g.format === 'function') {
      try { m.format = shimFor(g.format); const bad = verify(g.format, m.format); if (bad) { problems.push(g.id + ': format ' + bad); m.format = null; } }
      catch (e) { problems.push(g.id + ': format ' + e.message); m.format = null; }
    }
    if (typeof g.css === 'string') m.cssLen = g.css.length;
    const prev = games.findIndex(x => x.id === g.id);
    if (prev >= 0) games.splice(prev, 1);
    games.push(m);
  });
});
if (extraFile) run(fs.readFileSync(extraFile, 'utf8'), extraFile);
games.forEach(m => { if (covers[m.id] || shots[m.id]) delete m.icon; });
fs.writeFileSync(outFile, JSON.stringify({ games, parts, covers, shots, problems }));
console.log('meta2:', games.length, 'games,', Object.keys(covers).length, 'covers,', Object.keys(shots).length, 'shots,', problems.length, 'problems');
problems.forEach(p => console.log('  ' + p));
