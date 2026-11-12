const DIAG = (() => {
  const K = 'gameplay:diag', SK = 'gameplay:diagsid', MAXQ = 6000, MAXALL = 30000;
  let st = null;
  try { st = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) {}
  const D = { on: !!(st && typeof st.uid === 'string' && st.uid), uid: st && st.uid || null, full: !!(st && st.full), sid: '', seq: 0, q: [], all: [], drop: 0, sent: 0, push: null, busy: false, timer: 0, game: null, fps: 0, raf: 0, rid: 0, booted: false };
  const now = () => Date.now();
  const rnd = () => { try { const a = new Uint8Array(10); crypto.getRandomValues(a); return Array.from(a, x => (x % 36).toString(36)).join(''); } catch (e) { return Math.random().toString(36).slice(2, 12); } };
  const lim = n => D.full ? n * 6 : n;
  const RED = /"([a-z_]*(?:password|token|secret|credential|apikey|api_key|code_verifier|nonce)[a-z_]*)"\s*:\s*"[^"]*"/gi;
  const red = (s, n) => { s = String(s == null ? '' : s); if (s.length < 200000) s = s.replace(RED, '"$1":"[redacted]"'); const c = lim(n || 4000); if (s.length > c) s = s.slice(0, c) + '…[' + s.length + ']'; return s.replace(/eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}(\.[A-Za-z0-9_-]*)?/g, '[jwt]'); };
  const url = u => String(u || '').replace(/([?&](apikey|token|access_token|code|refresh_token)=)[^&#]*/gi, '$1[redacted]').slice(0, 400);
  const str = (v, n) => {
    try {
      if (typeof v === 'string') return red(v, n);
      if (v instanceof Error) return red((v.name || 'Error') + ': ' + v.message + (v.stack ? '\n' + v.stack : ''), n);
      if (v && typeof v === 'object' && v.nodeType) return '<' + String(v.nodeName || '').toLowerCase() + (v.id ? '#' + v.id : '') + '>';
      if (typeof v === 'function') return '[function ' + (v.name || '') + ']';
      const seen = new Set();
      return red(JSON.stringify(v, (k, x) => { if (x && typeof x === 'object') { if (seen.has(x)) return '[circular]'; seen.add(x); } return typeof x === 'bigint' ? String(x) : x; }), n);
    } catch (e) { return '[unserializable]'; }
  };
  const size = v => { try { return typeof v === 'string' ? v.length : v && (v.byteLength != null ? v.byteLength : v.size != null ? v.size : 0) || 0; } catch (e) { return 0; } };
  const body = (v, n) => typeof v === 'string' ? red(v, n) : v == null ? undefined : '[' + (v.constructor && v.constructor.name || typeof v) + ' ' + size(v) + ']';
  function ev(k, d) {
    if (!D.on) return;
    const e = { q: ++D.seq, t: now(), k, d: d === undefined ? null : d };
    D.q.push(e); D.all.push(e);
    if (D.q.length > MAXQ) { D.q.splice(0, D.q.length - MAXQ); D.drop++; }
    if (D.all.length > MAXALL) D.all.splice(0, D.all.length - MAXALL);
  }
  const rate = (o, cap) => { const s = Math.floor(now() / 1000); if (o.s !== s) { o.s = s; o.n = 0; } return ++o.n <= lim(cap); };

  const C = window.console || {};
  ['log', 'info', 'warn', 'error', 'debug'].forEach(l => {
    const f = C[l];
    if (typeof f !== 'function') return;
    C[l] = function () { try { if (D.on) ev('log', { l, a: Array.prototype.map.call(arguments, x => str(x, 600)) }); } catch (e) {} return f.apply(this, arguments); };
  });
  addEventListener('error', e => {
    if (!D.on) return;
    const t = e.target;
    if (t && t !== window && t.nodeName) { ev('err', { kind: 'resource', el: String(t.nodeName).toLowerCase(), src: url(t.src || t.href || '') }); return; }
    ev('err', { kind: 'error', m: str(e.message, 600), src: url(e.filename), line: e.lineno, col: e.colno, stack: e.error && e.error.stack ? red(e.error.stack, 3000) : undefined });
  }, true);
  addEventListener('unhandledrejection', e => { if (D.on) ev('err', { kind: 'rejection', m: str(e.reason, 3000) }); });

  const F = window.fetch;
  if (typeof F === 'function') window.fetch = function (input, init) {
    if (!D.on) return F.apply(this, arguments);
    let u = '', m = 'GET';
    try { u = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url || ''; m = init && init.method || input && input.method || 'GET'; } catch (e) {}
    if (/rpc\/diag_push/.test(u)) return F.apply(this, arguments);
    const id = ++D.rid, t = performance.now(), api = /\/(rest|auth|storage|functions)\/v1\//.test(u);
    ev('req', { id, m: String(m).toUpperCase(), u: url(u), b: init ? body(init.body, 3000) : undefined });
    return F.apply(this, arguments).then(r => {
      const d = { id, s: r.status, ms: Math.round(performance.now() - t), ct: (r.headers.get('content-type') || '').slice(0, 60), len: +r.headers.get('content-length') || undefined };
      if (api && /json|text/.test(d.ct) && !(d.len > 300000)) r.clone().text().then(x => { d.len = d.len || x.length; d.b = red(x, 3000); ev('res', d); }, () => ev('res', d));
      else ev('res', d);
      return r;
    }, e => { ev('res', { id, ms: Math.round(performance.now() - t), e: str(e, 400), n: e && e.name || '' }); throw e; });
  };
  const X = window.XMLHttpRequest;
  if (X && X.prototype) {
    const xo = X.prototype.open, xs = X.prototype.send;
    X.prototype.open = function (m, u) { try { this.__gd = { m: String(m).toUpperCase(), u: url(u) }; } catch (e) {} return xo.apply(this, arguments); };
    X.prototype.send = function (b) {
      const g = this.__gd;
      if (D.on && g) {
        const id = ++D.rid, t = performance.now();
        ev('req', { id, m: g.m, u: g.u, b: body(b, 2000), x: 1 });
        this.addEventListener('loadend', () => ev('res', { id, s: this.status, ms: Math.round(performance.now() - t), x: 1 }));
      }
      return xs.apply(this, arguments);
    };
  }

  let wsn = 0;
  const WS0 = window.WebSocket;
  if (typeof WS0 === 'function') {
    const hook = (ws, u) => {
      const id = ++wsn, r = { s: 0, n: 0 }, t = performance.now();
      let cut = 0;
      const msg = (dir, v) => { if (rate(r, 30)) ev('ws', { id, a: dir, n: size(v), b: typeof v === 'string' ? red(v, 500) : undefined }); else cut++; };
      ev('ws', { id, a: 'new', u: url(u) });
      ws.addEventListener('open', () => ev('ws', { id, a: 'open', ms: Math.round(performance.now() - t) }));
      ws.addEventListener('close', e => ev('ws', { id, a: 'close', code: e.code, why: str(e.reason, 200), clean: e.wasClean, cut }));
      ws.addEventListener('error', () => ev('ws', { id, a: 'error', state: ws.readyState }));
      ws.addEventListener('message', e => msg('rx', e.data));
      const send = ws.send;
      ws.send = function (v) { try { msg('tx', v); } catch (e) {} return send.apply(this, arguments); };
    };
    window.WebSocket = class extends WS0 {
      constructor(u, p) { if (p === undefined) super(u); else super(u, p); if (D.on) { try { hook(this, u); } catch (e) {} } }
    };
  }

  let pcn = 0;
  const PC0 = window.RTCPeerConnection;
  if (typeof PC0 === 'function') {
    const chan = (pid, ch, how) => {
      if (!ch || ch.__gd) return;
      ch.__gd = 1;
      const lb = String(ch.label || '').slice(0, 24), c = { tx: 0, txb: 0, rx: 0, rxb: 0 }, r = { s: 0, n: 0 }, loud = ch.ordered !== false;
      let tm = 0;
      const sum = () => { if (c.tx || c.rx) { ev('dc', { pc: pid, ch: lb, a: 'sum', tx: c.tx, txb: c.txb, rx: c.rx, rxb: c.rxb }); c.tx = c.txb = c.rx = c.rxb = 0; } };
      const pk = (dir, v) => { const n = size(v); if (dir === 'tx') { c.tx++; c.txb += n; } else { c.rx++; c.rxb += n; } if (rate(r, loud ? 20 : 1)) { let b; try { b = typeof v === 'string' ? red(v, 500) : v && v.byteLength != null && v.byteLength < 4096 ? red(new TextDecoder().decode(v), 500) : undefined; } catch (e) {} ev('dc', { pc: pid, ch: lb, a: dir, n, b }); } };
      ev('dc', { pc: pid, ch: lb, a: 'new', how, id: ch.id, ordered: ch.ordered, rtx: ch.maxRetransmits, state: ch.readyState });
      ch.addEventListener('open', () => { ev('dc', { pc: pid, ch: lb, a: 'open' }); clearInterval(tm); tm = setInterval(sum, 1000); });
      ch.addEventListener('close', () => { sum(); clearInterval(tm); ev('dc', { pc: pid, ch: lb, a: 'close' }); });
      ch.addEventListener('error', e => ev('dc', { pc: pid, ch: lb, a: 'error', m: str(e && e.error || e, 300) }));
      ch.addEventListener('message', e => pk('rx', e.data));
      const send = ch.send;
      ch.send = function (v) { try { pk('tx', v); } catch (e) {} return send.apply(this, arguments); };
    };
    const hookPc = (pc, cfg) => {
      const id = ++pcn, t = performance.now(), ms = () => Math.round(performance.now() - t);
      let ice = [];
      try { ice = (cfg && cfg.iceServers || []).map(s => [].concat(s.urls || s.url || []).join(',')).slice(0, 12); } catch (e) {}
      ev('pc', { id, a: 'new', ice, policy: cfg && cfg.iceTransportPolicy || 'all' });
      const stats = () => {
        if (!pc.getStats) return;
        pc.getStats().then(rep => {
          let pair = null;
          const by = {};
          rep.forEach(s => { by[s.id] = s; if (s.type === 'transport' && s.selectedCandidatePairId) pair = s.selectedCandidatePairId; });
          let p = pair && by[pair];
          if (!p) rep.forEach(s => { if (s.type === 'candidate-pair' && s.state === 'succeeded' && (s.nominated || s.selected)) p = p || s; });
          if (!p) return;
          const l = by[p.localCandidateId] || {}, rm = by[p.remoteCandidateId] || {};
          ev('pc', { id, a: 'pair', local: l.candidateType, lproto: l.protocol, relay: l.relayProtocol, remote: rm.candidateType, rtt: p.currentRoundTripTime, sent: p.bytesSent, recv: p.bytesReceived });
        }).catch(() => {});
      };
      pc.addEventListener('iceconnectionstatechange', () => { ev('pc', { id, a: 'ice', s: pc.iceConnectionState, ms: ms() }); if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') setTimeout(stats, 300); });
      pc.addEventListener('connectionstatechange', () => ev('pc', { id, a: 'conn', s: pc.connectionState, ms: ms() }));
      pc.addEventListener('icegatheringstatechange', () => ev('pc', { id, a: 'gather', s: pc.iceGatheringState, ms: ms() }));
      pc.addEventListener('signalingstatechange', () => ev('pc', { id, a: 'sig', s: pc.signalingState, ms: ms() }));
      pc.addEventListener('icecandidate', e => { const c = e.candidate; ev('pc', { id, a: 'cand', c: c ? String(c.candidate || '').slice(0, 200) : null, ms: ms() }); });
      pc.addEventListener('icecandidateerror', e => ev('pc', { id, a: 'canderr', code: e.errorCode, m: String(e.errorText || '').slice(0, 200), u: url(e.url) }));
      pc.addEventListener('datachannel', e => chan(id, e.channel, 'remote'));
      const mk = pc.createDataChannel;
      if (mk) pc.createDataChannel = function () { const ch = mk.apply(this, arguments); try { chan(id, ch, 'local'); } catch (e) {} return ch; };
      const close = pc.close;
      pc.close = function () { try { stats(); ev('pc', { id, a: 'close', ms: ms() }); } catch (e) {} return close.apply(this, arguments); };
    };
    window.RTCPeerConnection = class extends PC0 {
      constructor(c, x) { super(c, x); if (D.on) { try { hookPc(this, c); } catch (e) {} } }
    };
  }

  const editable = t => !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.nodeName || '')));
  const ir = { s: 0, n: 0 };
  const inp = (a, e) => { if (!D.on || !D.game || editable(e.target) || !rate(ir, 60)) return; ev('in', a === 'kd' || a === 'ku' ? { a, c: e.code, r: e.repeat ? 1 : undefined } : { a, x: Math.round(e.clientX), y: Math.round(e.clientY), b: e.button, p: e.pointerType }); };
  addEventListener('keydown', e => inp('kd', e), true);
  addEventListener('keyup', e => inp('ku', e), true);
  addEventListener('pointerdown', e => inp('pd', e), true);
  addEventListener('pointerup', e => inp('pu', e), true);
  document.addEventListener('visibilitychange', () => { ev('life', { a: 'vis', s: document.visibilityState }); if (document.visibilityState === 'hidden') flush(true); });
  addEventListener('online', () => ev('life', { a: 'online' }));
  addEventListener('offline', () => ev('life', { a: 'offline' }));
  addEventListener('pagehide', e => { ev('life', { a: 'pagehide', persisted: !!e.persisted }); flush(true); });
  addEventListener('hashchange', () => ev('life', { a: 'route', u: url(location.pathname + location.hash) }));

  let po = null;
  function perf() {
    if (po || !window.PerformanceObserver) return;
    try {
      po = new PerformanceObserver(l => l.getEntries().forEach(e => {
        if (!D.on) return;
        if (e.entryType === 'longtask') ev('perf', { a: 'long', ms: Math.round(e.duration), at: Math.round(e.startTime) });
        else if (e.entryType === 'resource' && !/rpc\/diag_push/.test(e.name)) ev('perf', { a: 'res', u: url(e.name), ms: Math.round(e.duration), kb: Math.round((e.transferSize || 0) / 102.4) / 10, it: e.initiatorType, st: e.responseStatus || undefined });
        else if (e.entryType === 'paint') ev('perf', { a: e.name, at: Math.round(e.startTime) });
      }));
      ['longtask', 'resource', 'paint'].forEach(t => { try { po.observe({ type: t, buffered: true }); } catch (e) {} });
    } catch (e) {}
  }
  function frames() {
    cancelAnimationFrame(D.raf);
    if (!D.on || !D.game) return;
    let n = 0, last = performance.now(), t0 = last, worst = 0, slow = 0;
    const step = t => {
      if (!D.on || !D.game) return;
      const d = t - last; last = t; n++;
      if (d > worst) worst = d;
      if (d > 34) slow++;
      if (t - t0 >= 2000) {
        const m = performance.memory;
        ev('fps', { g: D.game, fps: Math.round(n * 1000 / (t - t0) * 10) / 10, worst: Math.round(worst), slow, heap: m ? Math.round(m.usedJSHeapSize / 1048576) : undefined, hid: document.hidden ? 1 : undefined });
        n = 0; t0 = t; worst = 0; slow = 0;
      }
      D.raf = requestAnimationFrame(step);
    };
    D.raf = requestAnimationFrame(step);
  }
  function boot() {
    if (!D.on || D.booted) return;
    D.booted = true;
    let prev = null;
    try { prev = sessionStorage.getItem(SK); } catch (e) {}
    D.sid = rnd();
    try { sessionStorage.setItem(SK, D.sid); } catch (e) {}
    const keys = {};
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); keys[k.slice(0, 60)] = (localStorage.getItem(k) || '').length; } } catch (e) {}
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const c = navigator.connection || {};
    ev('boot', { prev, uid: D.uid, full: D.full, u: url(location.href), ref: url(document.referrer), ua: navigator.userAgent, lang: navigator.language, scr: [screen.width, screen.height, devicePixelRatio], vp: [innerWidth, innerHeight], cores: navigator.hardwareConcurrency, mem: navigator.deviceMemory, net: { type: c.effectiveType, down: c.downlink, rtt: c.rtt, save: c.saveData }, online: navigator.onLine, tz: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })(), nav: nav ? { type: nav.type, dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart), tcp: Math.round(nav.connectEnd - nav.connectStart), ttfb: Math.round(nav.responseStart), dom: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), kb: Math.round((nav.transferSize || 0) / 1024) } : null, gate: window.__gpT || null, store: keys });
    perf();
    clearInterval(D.timer);
    D.timer = setInterval(() => flush(false), 4000);
    idbOld();
  }

  const idb = () => new Promise((res, rej) => {
    try {
      const r = indexedDB.open('gameplay-diag', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('q'); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  const idbDo = (mode, fn) => idb().then(db => new Promise((res, rej) => { const tx = db.transaction('q', mode), s = tx.objectStore('q'); let out; try { out = fn(s); } catch (e) { rej(e); return; } tx.oncomplete = () => { db.close(); res(out && out.result !== undefined ? out.result : out); }; tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); }; }));
  async function idbOld() {
    try {
      const keys = await idbDo('readonly', s => s.getAllKeys());
      for (const k of (keys || []).slice(0, 40)) {
        if (String(k).indexOf(D.sid + ':') === 0) continue;
        const b = await idbDo('readonly', s => s.get(k));
        if (!b || !Array.isArray(b.e) || !D.push) continue;
        try { await D.push(b.sid, b.e); await idbDo('readwrite', s => s.delete(k)); } catch (e) { if (gone(e)) return; break; }
      }
    } catch (e) {}
  }
  const gone = e => { if (e && (e.code === '42501' || /not a test account/i.test(e.message || ''))) { disarm(); return true; } return false; };
  async function flush(last) {
    if (!D.on || D.busy || !D.q.length) return;
    const batch = D.q.splice(0, 400), key = D.sid + ':' + batch[0].q;
    D.busy = true;
    try { await idbDo('readwrite', s => s.put({ sid: D.sid, e: batch }, key)); } catch (e) {}
    try {
      if (!D.push) throw new Error('no uploader');
      await D.push(D.sid, batch, last);
      D.sent += batch.length;
      idbDo('readwrite', s => s.delete(key)).catch(() => {});
    } catch (e) { if (!gone(e)) { D.q = batch.concat(D.q).slice(-MAXQ); } }
    D.busy = false;
    if (D.q.length > 400 && !last) setTimeout(() => flush(false), 200);
  }
  function arm(uid, full) {
    if (!uid) return;
    const was = D.on && D.uid === uid;
    D.on = true; D.uid = uid; if (full !== undefined) D.full = !!full;
    try { localStorage.setItem(K, JSON.stringify({ uid, full: D.full })); } catch (e) {}
    if (!was || !D.booted) { D.booted = false; boot(); frames(); }
  }
  function disarm() {
    D.on = false; D.uid = null; D.q = []; D.all = []; D.booted = false;
    clearInterval(D.timer); cancelAnimationFrame(D.raf);
    try { localStorage.removeItem(K); } catch (e) {}
    try { indexedDB.deleteDatabase('gameplay-diag'); } catch (e) {}
  }
  boot();
  return {
    ev, arm, disarm, flush: () => flush(false),
    get on() { return D.on; }, get sid() { return D.sid; }, get uid() { return D.uid; },
    set push(f) { D.push = f; if (D.on) { idbOld(); flush(false); } },
    game(id) { if (D.game === id) return; D.game = id || null; ev('game', { id: D.game }); frames(); },
    setFull(v) { D.full = !!v; if (D.on) { try { localStorage.setItem(K, JSON.stringify({ uid: D.uid, full: D.full })); } catch (e) {} ev('cfg', { full: D.full }); } },
    stats: () => ({ on: D.on, sid: D.sid, events: D.seq, queued: D.q.length, sent: D.sent, dropped: D.drop, full: D.full }),
    dump: () => ({ sid: D.sid, uid: D.uid, at: now(), u: url(location.href), ua: navigator.userAgent, events: D.all.slice() })
  };
})();
