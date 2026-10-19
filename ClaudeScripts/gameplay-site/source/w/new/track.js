const TRS = { t0: Date.now(), vis: 0, vt: performance.now(), von: document.visibilityState === 'visible', foc: 0, blur: 0, keys: 0, clicks: 0, taps: 0, md: 0, mx: null, my: null, wheel: 0, scr: 0, sy: 0, games: 0, gset: new Set(), fs: 0, off: 0, errs: 0, idle: 0, la: performance.now(), copy: 0, rsz: 0, seq: 0 };
const TR = { g: null, v0: 0, sy: 0, impQ: [], io: null, clicks: [], dw: 0, vit: { cls: 0, inp: 0, lcp: null }, vsent: false, pads: new Set(), kb: '', env: 0, asked: new Set() };
const TR_DC = /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|vultr|choopa|oracle|contabo|leaseweb|m247|datacamp|cdn77|scaleway|alibaba|tencent|hostinger|ionos|psychz|zenlayer|packethub|tzulo|quadranet|nordvpn|expressvpn|proton|mullvad|surfshark|private internet|cyberghost|ipvanish|hide\.me|windscribe|cloudflare|fastly|gcore|constant company|hostwinds|kamatera|clouvider|serverius|worldstream|hivelocity|colocrossing/i;
const trPadKind = id => /054c|sony|playstation|dualsense|dualshock/i.test(id) ? 'PlayStation' : /045e|xbox|xinput/i.test(id) ? 'Xbox' : /057e|nintendo|switch|joy-con/i.test(id) ? 'Switch' : /8bitdo/i.test(id) ? '8BitDo' : /046d|logitech/i.test(id) ? 'Logitech' : 'Other';
const trSel = el => { const a = el.closest('[id],[data-id],a,button,[role="button"]') || el, t = a.tagName.toLowerCase(); return (t + (a.id ? '#' + a.id : a.dataset && a.dataset.id ? '[' + a.dataset.id + ']' : typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\s+/)[0] : '') + (a !== el ? ' ' + el.tagName.toLowerCase() : '')).slice(0, 80); };
const trTo = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
const trOff = tz => { try { const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName'); return p ? p.value : ''; } catch (e) { return ''; } };
const trKbOf = (q, y, w) => q === 'a' ? 'azerty' : y === 'z' ? 'qwertz' : q === "'" ? 'dvorak' : q === 'q' && w === 'w' && y === 'y' ? 'qwerty' : '';
const trVis = () => { const t = performance.now(); if (TRS.von) TRS.vis += t - TRS.vt; TRS.vt = t; TRS.von = document.visibilityState === 'visible'; };
const trZoom = () => { if (!trMq('(pointer: fine)') || window.top !== window || !outerWidth || !innerWidth) return null; const z = outerWidth / innerWidth, s = [.25, .33, .5, .67, .75, .8, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5].reduce((a, b) => Math.abs(b - z) < Math.abs(a - z) ? b : a); return Math.abs(s - z) / s < .03 ? s : null; };
const trVotes = () => { try { return JSON.parse(localStorage.getItem('gameplay:votes')) || {}; } catch (e) { return {}; } };

function trStart(g, ctl) {
  TRS.games++; TRS.gset.add(g.id);
  const A = ctl.api, G = { g, t0: performance.now(), why: 'exit', rounds: 0, sc: [], last: null, lv: null, fr: 0, ft: 0, fs: [], inp: { k: 0, m: 0, t: 0, p: 0 }, on: {} };
  if (TR.g) trEnd1(TR.g);
  TR.g = G;
  const sc = A.score, sb = A.submit, ov = A.overlay;
  A.score = v => { if (typeof v === 'number' && isFinite(v)) G.last = v; return sc(v); };
  A.submit = v => { if (typeof v === 'number' && isFinite(v) && G.sc.length < 40) G.sc.push(v); return sb(v); };
  A.overlay = (o = {}) => { const r = ov(o); if (o && o.stats && o.stats.length) trRound(G, o); else if (performance.now() - G.t0 > 90000) trAsk(G); return r; };
  A.on(window, 'keydown', e => { if (!isField(e.target)) G.on.k = 1; }, true);
  A.on(frame, 'pointerdown', e => { G.on[e.pointerType === 'touch' || e.pointerType === 'pen' ? 't' : 'm'] = 1; }, true);
  ctl.add(() => trEnd1(G));
  let last = 0, s0 = 0, n = 0, k = 0;
  const step = t => {
    if (TR.g !== G) return;
    requestAnimationFrame(step);
    if (PAUSE.on || document.visibilityState !== 'visible') { last = 0; return; }
    if (!last || t - last > 1000) { last = s0 = t; n = 0; return; }
    G.fr++; G.ft += t - last; last = t; n++;
    if (++k % 10 === 0 && navigator.getGamepads) { for (const p of navigator.getGamepads()) if (p && (p.buttons.some(b => b.pressed) || p.axes.some(a => Math.abs(a) > .5))) { G.on.p = 1; break; } }
    if (t - s0 >= 1000) {
      if (t - G.t0 > 3000 && G.fs.length < 7200) G.fs.push(n * 1000 / (t - s0));
      for (const x in G.on) G.inp[x]++;
      G.on = {}; n = 0; s0 = t;
    }
  };
  requestAnimationFrame(step);
}
function trRound(G, o) {
  G.rounds++;
  for (const [k, v] of o.stats) {
    if (!/^(level|wave|stage|floor|round|lap|world|chapter|zone|tier|night|day)s?\b/i.test(String(k))) continue;
    const n = parseFloat(String(v).replace(/<[^>]*>/g, '').replace(/[^\d.-]/g, ''));
    if (isFinite(n) && (G.lv == null || n > G.lv)) G.lv = n;
  }
  trAsk(G);
}
function trAsk(G) {
  const id = G.g.id, card = frame.querySelector('.g-overlay:last-child .g-ov-card');
  if (!card || TR.asked.has(id) || trVotes()[id]) return;
  TR.asked.add(id);
  const box = document.createElement('div');
  box.className = 'g-vote';
  box.innerHTML = `<span>${esc(auT('Enjoying {g}?').replace('{g}', G.g.title))}</span><button type="button" data-gv="1" aria-label="${esc(auT('I like it'))}"><svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7"/></svg></button><button type="button" data-gv="-1" aria-label="${esc(auT('Not for me'))}"><svg viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2l2-7a2 2 0 0 1 2-1h10"/></svg></button>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-gv]');
    e.stopPropagation();
    if (!b) return;
    trVote(id, +b.dataset.gv);
    box.innerHTML = `<span>${esc(auT('Thanks for the feedback!'))}</span>`;
    frame.focus({ preventScroll: true });
  });
  card.append(box);
}
function trVote(id, v) {
  const V = trVotes();
  V[id] = v;
  try { localStorage.setItem('gameplay:votes', JSON.stringify(V)); } catch (e) {}
  if (SB.on) sbRest('rpc/vote_game', { method: 'POST', body: { p_game: id, p_vote: v }, auth: !!SB.user }).catch(() => {});
}
function trEnd1(G) {
  if (TR.g !== G) return;
  TR.g = null;
  const fs = G.fs.slice().sort((a, b) => a - b), I = G.inp;
  track('game_quit', { game: G.g.id, sec: Math.round((performance.now() - G.t0) / 1000), why: G.why, rounds: G.rounds, sc: G.sc, last: G.last, lv: G.lv, fps: G.ft ? G.fr * 1000 / G.ft : null, fpsmin: fs.length ? fs[0] : null, fps5: fs.length ? fs[Math.floor(fs.length * .05)] : null, ik: I.k, im: I.m, it: I.t, ip: I.p });
}
function trView(from) {
  const now = performance.now();
  if (from) track('page_time', { v: from, sec: Math.round((now - TR.v0) / 1000) });
  if (from === 'home') trScroll();
  TR.v0 = now;
}
function trScroll() {
  if (TR.sy > 0) track('scroll', { v: 'home', pct: Math.min(100, Math.round(TR.sy / 5) * 5) });
  TR.sy = 0;
}
function trImpFlush() { while (TR.impQ.length) track('impr', { l: TR.impQ.splice(0, 40) }); }
function trImpScan() {
  if (!window.IntersectionObserver) return;
  if (!TR.io) TR.io = new IntersectionObserver(es => es.forEach(e => {
    const el = e.target;
    if (!e.isIntersecting) { clearTimeout(el._it); return; }
    el._it = setTimeout(() => { if (!el.isConnected) return; TR.io.unobserve(el); TR.impQ.push(el.dataset.id + '|' + el.dataset.src + '|' + [...el.parentNode.children].indexOf(el)); if (TR.impQ.length >= 40) trImpFlush(); }, 1000);
  }), { threshold: .5 });
  document.querySelectorAll('a[data-id][data-src]:not([data-imp])').forEach(el => { el.dataset.imp = '1'; TR.io.observe(el); });
}
function trDead(t) {
  if (TR.dw || !window.MutationObserver) return;
  const href = location.href, sy = scrollY;
  let hit = false;
  const mo = new MutationObserver(() => { hit = true; });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  TR.dw = setTimeout(() => { mo.disconnect(); TR.dw = 0; if (!hit && location.href === href && Math.abs(scrollY - sy) < 2) track('dead', { t: trSel(t), v: view }); }, 900);
}
function trVitalsSend() {
  if (TR.vsent) return;
  TR.vsent = true;
  const n = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null, f = performance.getEntriesByName ? performance.getEntriesByName('first-contentful-paint')[0] : null;
  track('vitals', { lcp: TR.vit.lcp, cls: Math.round(TR.vit.cls * 1000) / 1000, inp: TR.vit.inp || null, fcp: f ? f.startTime : null, ttfb: n ? n.responseStart : null, load: n && n.loadEventEnd ? n.loadEventEnd : null, v: view });
}
function trHz() {
  return new Promise(r => {
    if (document.visibilityState !== 'visible') { r(null); return; }
    const t = [];
    const f = x => {
      t.push(x);
      if (t.length < 61) { requestAnimationFrame(f); return; }
      const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b), hz = 1000 / d[d.length >> 1];
      r([30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 360].reduce((a, b) => Math.abs(b - hz) < Math.abs(a - hz) ? b : a));
    };
    requestAnimationFrame(f);
  });
}
async function trGeo() {
  try { const c = JSON.parse(sessionStorage.getItem('gameplay:geo')); if (c) return c; } catch (e) {}
  try {
    const j = await (await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })).json();
    const org = String(j.organization_name || j.organization || '').replace(/^AS\d+\s*/, '');
    const o = { cc: String(j.country_code || '').slice(0, 2).toUpperCase(), country: j.country || '', region: j.region || '', city: j.city || '', isp: org, asn: +j.asn || +(String(j.organization || '').match(/^AS(\d+)/) || [])[1] || null, gtz: j.timezone || '' };
    try { sessionStorage.setItem('gameplay:geo', JSON.stringify(o)); } catch (e) {}
    return o;
  } catch (e) { return null; }
}
function trGpu() {
  try {
    const c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return '';
    const x = /Firefox\//.test(navigator.userAgent) ? null : gl.getExtension('WEBGL_debug_renderer_info');
    const r = String(gl.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    const lc = gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
    return r.replace(/^ANGLE \((.*)\)$/, '$1').replace(/,? ?(Direct3D|D3D|OpenGL|Vulkan|Metal).*$/i, '').replace(/ \(0x[0-9a-f]+\)/gi, '').replace(/^[^,]{2,24}, (?=.*\S)/, '').trim().slice(0, 100);
  } catch (e) { return ''; }
}
function trOs(hi) {
  const ua = navigator.userAgent, d = device().os, pv = hi && hi.platformVersion ? String(hi.platformVersion) : '';
  let m;
  if (d === 'Windows') { const v = parseInt(pv, 10); return v >= 13 ? 'Windows 11' : v > 0 ? 'Windows 10' : (m = ua.match(/Windows NT ([\d.]+)/)) ? 'Windows ' + ({ '10.0': '10 or 11', '6.3': '8.1', '6.2': '8', '6.1': '7' }[m[1]] || m[1]) : 'Windows'; }
  if (d === 'Android') return 'Android ' + (pv ? pv.split('.')[0] : (m = ua.match(/Android (\d+)/)) ? m[1] : '');
  if ((m = ua.match(/(?:iPhone|iPad|CPU) OS (\d+)_(\d+)/))) return 'iOS ' + m[1] + '.' + m[2];
  if (d === 'iOS') return (m = ua.match(/Version\/(\d+\.\d+)/)) ? 'iPadOS ' + m[1] : 'iPadOS';
  if (d === 'macOS') return 'macOS' + (pv ? ' ' + pv.split('.').slice(0, 2).join('.') : (m = ua.match(/Mac OS X (\d+)[_.](\d+)/)) ? ' ' + m[1] + '.' + m[2] : '');
  return d;
}
function trBr(hi) {
  const b = device().browser, ua = navigator.userAgent, want = { Chrome: 'Google Chrome', Edge: 'Microsoft Edge', Opera: 'Opera' }[b];
  const fv = hi && hi.fullVersionList && want ? hi.fullVersionList.find(x => x.brand === want) : null;
  if (fv) return b + ' ' + String(fv.version).split('.')[0];
  const m = ua.match(b === 'Firefox' ? /Firefox\/(\d+)/ : b === 'Safari' ? /Version\/(\d+(?:\.\d+)?)/ : b === 'Samsung' ? /SamsungBrowser\/(\d+)/ : b === 'Edge' ? /Edg\/(\d+)/ : b === 'Opera' ? /OPR\/(\d+)/ : /Chrome\/(\d+)/);
  return b + (m ? ' ' + m[1] : '');
}
function trAdb() {
  return new Promise(r => {
    const b = document.createElement('div');
    b.className = 'adsbox ad-banner ad-unit pub_300x250 text-ad';
    b.style.cssText = 'position:absolute;left:-999px;top:0;width:10px;height:10px';
    b.innerHTML = '&nbsp;';
    document.body.append(b);
    setTimeout(() => { const s = getComputedStyle(b); r(!b.offsetHeight || s.display === 'none' || s.visibility === 'hidden'); b.remove(); }, 400);
  });
}
async function trEnv() {
  if (!anOk() || TR.env) return;
  TR.env = 1;
  try { if (sessionStorage.getItem('gameplay:env') === SID) return; sessionStorage.setItem('gameplay:env', SID); } catch (e) {}
  const ud = navigator.userAgentData, c = navigator.connection || {}, now = new Date(), tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();
  const [hi, kbm, geo, hz, adb] = await Promise.all([
    trTo(ud && ud.getHighEntropyValues ? ud.getHighEntropyValues(['platformVersion', 'model', 'architecture', 'bitness', 'fullVersionList']).catch(() => null) : Promise.resolve(null), 2000),
    trTo(navigator.keyboard && navigator.keyboard.getLayoutMap ? navigator.keyboard.getLayoutMap().catch(() => null) : Promise.resolve(null), 2000),
    trTo(trGeo(), 6000), trTo(trHz(), 4000), trTo(trAdb(), 2000)
  ]);
  if (kbm && !TR.kb) TR.kb = trKbOf(kbm.get('KeyQ'), kbm.get('KeyY'), kbm.get('KeyW'));
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean).map(p => trPadKind(p.id)) : [];
  track('env_dev', { osv: trOs(hi), brv: trBr(hi), model: hi && hi.model ? hi.model : device().type === 'desktop' ? null : /iPhone/.test(navigator.userAgent) ? 'iPhone' : /iPad|Macintosh/.test(navigator.userAgent) ? 'iPad' : 'Unknown model', arch: hi && hi.architecture ? hi.architecture + (hi.bitness ? '-' + hi.bitness : '') : null, cores: navigator.hardwareConcurrency || null, mem: navigator.deviceMemory || null, gpu: trGpu() || null, gl2: 'WebGL2RenderingContext' in window, wgpu: 'gpu' in navigator, hz, kb: TR.kb || null, pads, adb, langs: (navigator.languages || []).slice(0, 6) });
  const g = geo || {}, dc = TR_DC.test(g.isp || ''), tzm = !!(g.gtz && tz && g.gtz !== tz && trOff(g.gtz) !== trOff(tz));
  setTimeout(() => trMore().catch(() => {}), 2500);
  track('env_geo', { tz, off: -now.getTimezoneOffset(), lh: now.getHours(), wd: now.getDay(), net: c.effectiveType || null, ctype: c.type || 'unknown', dl: c.downlink != null ? c.downlink : null, rtt: c.rtt != null ? c.rtt : null, save: c.saveData != null ? !!c.saveData : null, cc: g.cc || null, country: g.country || null, region: g.region || null, city: g.city || null, isp: g.isp || null, asn: g.asn || null, dc, tzm, vpn: dc || tzm });
}
const trMq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
const trB = (v, cuts, unit) => { if (v == null || !isFinite(v)) return null; for (const c of cuts) if (v < c) return '<' + c + unit; return cuts[cuts.length - 1] + unit + '+'; };
const trHost = u => { try { return u ? new URL(u).hostname.replace(/^www\./, '').slice(0, 60) : ''; } catch (e) { return ''; } };
function trBench() {
  const t = performance.now();
  let x = 0;
  for (let i = 0; i < 3e6; i++) x += Math.sqrt(i) * Math.sin(i);
  return x && Math.round((performance.now() - t) * 10) / 10;
}
async function trMore() {
  const sc = screen || {}, o = sc.orientation || {}, dpr = window.devicePixelRatio || 1;
  track('env_scr', { sw: sc.width || null, sh: sc.height || null, aw: sc.availWidth || null, ah: sc.availHeight || null, cd: sc.colorDepth || null, dpr: Math.round(dpr * 100) / 100, ori: o.type || null, vw: innerWidth, vh: innerHeight, tp: navigator.maxTouchPoints || 0, ptr: trMq('(pointer: fine)') ? 'fine' : trMq('(pointer: coarse)') ? 'coarse' : 'none', hov: trMq('(hover: hover)'), dark: trMq('(prefers-color-scheme: dark)'), rmo: trMq('(prefers-reduced-motion: reduce)'), con: trMq('(prefers-contrast: more)'), fcol: trMq('(forced-colors: active)'), rtr: trMq('(prefers-reduced-transparency: reduce)'), hdr: trMq('(dynamic-range: high)'), gam: trMq('(color-gamut: rec2020)') ? 'rec2020' : trMq('(color-gamut: p3)') ? 'p3' : 'srgb', dm: ['fullscreen', 'standalone', 'minimal-ui'].find(m => trMq('(display-mode: ' + m + ')')) || 'browser', ext: sc.isExtended != null ? !!sc.isExtended : null, zoom: trZoom(), res: (sc.width || 0) + 'x' + (sc.height || 0) });
  const n = navigator, A = window.AudioContext || window.webkitAudioContext;
  let sr = null, ach = null, mtex = null, glx = null, voices = null, devs = null, bat = null, est = null, gpuv = null, pers = null;
  try { if (A) { const ac = new A(); sr = ac.sampleRate; ach = ac.destination ? ac.destination.maxChannelCount : null; ac.close(); } } catch (e) {}
  try { const gl = document.createElement('canvas').getContext('webgl'); if (gl) { mtex = gl.getParameter(gl.MAX_TEXTURE_SIZE); glx = (gl.getSupportedExtensions() || []).length; const lc = gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext(); } } catch (e) {}
  try { voices = window.speechSynthesis ? speechSynthesis.getVoices().length : null; } catch (e) {}
  const v = document.createElement('video'), cp = t => { try { return window.MediaSource && MediaSource.isTypeSupported ? MediaSource.isTypeSupported(t) : !!v.canPlayType(t); } catch (e) { return false; } };
  const [dl, b, q, gp, ps] = await Promise.all([
    trTo(n.mediaDevices && n.mediaDevices.enumerateDevices ? n.mediaDevices.enumerateDevices().catch(() => null) : Promise.resolve(null), 2000),
    trTo(n.getBattery ? n.getBattery().catch(() => null) : Promise.resolve(null), 2000),
    trTo(n.storage && n.storage.estimate ? n.storage.estimate().catch(() => null) : Promise.resolve(null), 2000),
    trTo(n.gpu && n.gpu.requestAdapter ? n.gpu.requestAdapter().catch(() => null) : Promise.resolve(null), 3000),
    trTo(n.storage && n.storage.persisted ? n.storage.persisted().catch(() => null) : Promise.resolve(null), 2000)
  ]);
  if (dl) devs = { mic: dl.filter(d => d.kind === 'audioinput').length, cam: dl.filter(d => d.kind === 'videoinput').length, spk: dl.filter(d => d.kind === 'audiooutput').length };
  if (b) bat = { lvl: Math.round(b.level * 100), chg: !!b.charging };
  if (q) est = { quota: Math.round((q.quota || 0) / 1048576), used: Math.round((q.usage || 0) / 1048576) };
  if (gp) { try { const i = gp.info || (gp.requestAdapterInfo ? await trTo(gp.requestAdapterInfo(), 1500) : null); if (i) gpuv = [i.vendor, i.architecture].filter(Boolean).join(' ').slice(0, 60) || null; } catch (e) {} }
  if (ps != null) pers = !!ps;
  const ro = (() => { try { return Intl.DateTimeFormat().resolvedOptions(); } catch (e) { return {}; } })();
  let hc = null, fdw = null;
  try { hc = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle || null; } catch (e) {}
  try { const L = new Intl.Locale(ro.locale || n.language); const w = L.getWeekInfo ? L.getWeekInfo() : L.weekInfo; fdw = w ? w.firstDay : null; } catch (e) {}
  const nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null, mem = performance.memory;
  const bench = await new Promise(r => (window.requestIdleCallback || setTimeout)(() => { try { r(trBench()); } catch (e) { r(null); } }, { timeout: 3000 }));
  track('env_caps', { ck: n.cookieEnabled, dnt: n.doNotTrack === '1' || window.doNotTrack === '1', gpc: !!n.globalPrivacyControl, pdf: n.pdfViewerEnabled != null ? !!n.pdfViewerEnabled : null, bot: !!n.webdriver, wasm: typeof WebAssembly === 'object', sab: typeof SharedArrayBuffer === 'function', coi: !!window.crossOriginIsolated, swk: 'serviceWorker' in n, notif: window.Notification ? Notification.permission : null, vib: 'vibrate' in n, bt: 'bluetooth' in n, usb: 'usb' in n, ser: 'serial' in n, hid: 'hid' in n, xr: 'xr' in n, midi: 'requestMIDIAccess' in n, share: 'share' in n, wl: 'wakeLock' in n, voices, mic: devs ? devs.mic : null, cam: devs ? devs.cam : null, spk: devs ? devs.spk : null, sr, ach, h264: cp('video/mp4; codecs="avc1.42E01E"'), vp9: cp('video/webm; codecs="vp9"'), av1: cp('video/mp4; codecs="av01.0.05M.08"'), hevc: cp('video/mp4; codecs="hvc1.1.6.L93.B0"'), mtex, glx, gpuv, quota: est ? est.quota : null, used: est ? est.used : null, qb: est ? trB(est.quota, [200, 1000, 10000, 100000], ' MB') : null, pers, heap: mem ? Math.round(mem.jsHeapSizeLimit / 1048576) : null, bat: bat ? bat.lvl : null, batb: bat ? trB(bat.lvl, [20, 50, 80], '%') : null, chg: bat ? bat.chg : null, bench, benchb: trB(bench, [15, 30, 60, 120], ' ms'), loc: ro.locale || null, cal: ro.calendar || null, num: ro.numberingSystem || null, hc, fdw, ref: trHost(document.referrer) || 'direct', land: (location.pathname + location.hash).slice(0, 60), navt: nav ? nav.type : null, hist: history.length, plat: n.platform || null, vend: n.vendor || null, ua: n.userAgent.slice(0, 300), route: SB.on ? (SBN.best() === SUPABASE_DIRECT ? 'direct' : 'relay') : 'none', down: !!window.__gpSbDown });
}
function trSess(final) {
  if (!anOk()) return;
  const t = performance.now();
  trVis();
  TRS.idle = Math.max(TRS.idle, t - TRS.la);
  track('sess_sum', { seq: ++TRS.seq, final: !!final, dur: Math.round((Date.now() - TRS.t0) / 1000), vis: Math.round(TRS.vis / 1000), foc: TRS.foc, blur: TRS.blur, keys: TRS.keys, clicks: TRS.clicks, taps: TRS.taps, mdist: Math.round(TRS.md), wheel: TRS.wheel, scr: Math.round(TRS.scr), games: TRS.games, gset: TRS.gset.size, gl: [...TRS.gset].slice(0, 30), fs: TRS.fs, off: TRS.off, errs: TRS.errs, idle: Math.round(TRS.idle / 1000), copy: TRS.copy, rsz: TRS.rsz, route: SB.on ? (SBN.best() === SUPABASE_DIRECT ? 'direct' : 'relay') : 'none', acct: SB.user ? 'user' : SB.guest ? 'guest' : 'none', lang: document.documentElement.lang || null, theme: document.documentElement.getAttribute('data-theme') || 'system' });
}
function trHidden() { trImpFlush(); trVitalsSend(); trSess(false); }
function trEnd() {
  if (TR.g) { TR.g.why = 'close'; trEnd1(TR.g); }
  trScroll(); trImpFlush(); trVitalsSend();
  track('page_time', { v: view, sec: Math.round((performance.now() - TR.v0) / 1000), exit: true });
  trSess(true);
}
function trBoot() {
  TR.v0 = performance.now();
  const ob = (type, fn, o) => { try { new PerformanceObserver(l => l.getEntries().forEach(fn)).observe(Object.assign({ type, buffered: true }, o)); } catch (e) {} };
  ob('layout-shift', e => { if (!e.hadRecentInput) TR.vit.cls += e.value; });
  ob('largest-contentful-paint', e => { TR.vit.lcp = e.startTime; });
  ob('event', e => { if (e.interactionId) TR.vit.inp = Math.max(TR.vit.inp, e.duration); }, { durationThreshold: 40 });
  addEventListener('scroll', () => { if (view !== 'home') return; const h = document.documentElement.scrollHeight; if (h > 0) TR.sy = Math.max(TR.sy, 100 * (scrollY + innerHeight) / h); }, { passive: true });
  document.addEventListener('click', e => {
    const t = e.target;
    if (!(t instanceof Element) || t.closest('.g-root, input, textarea, select, [contenteditable]')) return;
    const now = performance.now(), x = e.clientX, y = e.clientY;
    TR.clicks = TR.clicks.filter(c => now - c.t < 800 && Math.hypot(c.x - x, c.y - y) < 30);
    TR.clicks.push({ t: now, x, y });
    if (TR.clicks.length === 3) track('rage', { t: trSel(t), v: view });
    if (getComputedStyle(t).cursor === 'pointer' || t.closest('a, button, [role="button"], img, label')) trDead(t);
  }, true);
  addEventListener('keydown', e => {
    if (TR.kb || !e.key || e.key.length !== 1 || !/^Key[QWYZA]$/.test(e.code)) return;
    const k = e.key.toLowerCase(), c = e.code;
    const l = (c === 'KeyQ' && k === 'a') || (c === 'KeyA' && k === 'q') || (c === 'KeyW' && k === 'z') ? 'azerty' : (c === 'KeyY' && k === 'z') || (c === 'KeyZ' && k === 'y') ? 'qwertz' : (c === 'KeyY' && k === 'y') || (c === 'KeyZ' && k === 'z') ? 'qwerty' : '';
    if (l) { TR.kb = l; if (TR.env) track('kb', { kb: l }); }
  }, true);
  addEventListener('gamepadconnected', e => {
    const id = String(e.gamepad && e.gamepad.id || '');
    if (!id || TR.pads.has(id)) return;
    TR.pads.add(id);
    track('pad', { kind: trPadKind(id), id: id.replace(/\s*\(.*?\)\s*/g, ' ').trim().slice(0, 60) || trPadKind(id), map: e.gamepad.mapping || '' });
  });
  let mt = 0;
  if (window.MutationObserver) new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(trImpScan, 400); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  trImpScan();
  setInterval(trImpFlush, 30000);
  if (anOk()) setTimeout(trEnv, 1500);
  const act = () => { const t = performance.now(); TRS.idle = Math.max(TRS.idle, t - TRS.la); TRS.la = t; };
  addEventListener('keydown', () => { TRS.keys++; act(); }, { capture: true, passive: true });
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch') TRS.taps++; else TRS.clicks++; act(); }, { capture: true, passive: true });
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; if (TRS.mx != null) TRS.md += Math.min(400, Math.hypot(e.clientX - TRS.mx, e.clientY - TRS.my)); TRS.mx = e.clientX; TRS.my = e.clientY; act(); }, { capture: true, passive: true });
  addEventListener('wheel', () => { TRS.wheel++; act(); }, { capture: true, passive: true });
  addEventListener('scroll', () => { TRS.scr += Math.abs(scrollY - TRS.sy); TRS.sy = scrollY; }, { passive: true });
  addEventListener('focus', () => TRS.foc++);
  addEventListener('blur', () => TRS.blur++);
  addEventListener('offline', () => TRS.off++);
  addEventListener('error', () => TRS.errs++);
  addEventListener('copy', () => TRS.copy++);
  addEventListener('resize', () => TRS.rsz++, { passive: true });
  document.addEventListener('fullscreenchange', () => { if (document.fullscreenElement) TRS.fs++; });
  document.addEventListener('visibilitychange', trVis);
  setInterval(() => { if (document.visibilityState === 'visible') trSess(false); }, 300000);
}
Ameplay.ads = {
  watch(el, slot, net) {
    if (!el || !window.IntersectionObserver) return;
    let t = 0;
    const io = new IntersectionObserver(es => es.forEach(e => { clearTimeout(t); if (e.isIntersecting) t = setTimeout(() => { io.disconnect(); track('ad_impression', { slot: String(slot || ''), net: String(net || '') }); }, 1000); }), { threshold: .5 });
    io.observe(el);
    el.addEventListener('click', () => track('ad_click', { slot: String(slot || ''), net: String(net || '') }), true);
  },
  revenue(slot, usd, net) { track('ad_revenue', { slot: String(slot || ''), net: String(net || ''), usd: +usd || 0 }); }
};
