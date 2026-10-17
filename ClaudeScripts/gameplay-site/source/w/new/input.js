const IN = { used: {}, pads: {}, held: {}, raf: 0, cap: null, tab: 'kb', seen: false, hint: 0 };
const IN_PAD = [['b0', 'A'], ['b1', 'B'], ['b2', 'X'], ['b3', 'Y'], ['b4', 'LB'], ['b5', 'RB'], ['b6', 'LT'], ['b7', 'RT'], ['b8', 'Back'], ['b9', 'Start'], ['b10', 'Left stick press'], ['b11', 'Right stick press'], ['b12', 'D-pad up'], ['b13', 'D-pad down'], ['b14', 'D-pad left'], ['b15', 'D-pad right'], ['ly-', 'Left stick up'], ['ly+', 'Left stick down'], ['lx-', 'Left stick left'], ['lx+', 'Left stick right'], ['ry-', 'Right stick up'], ['ry+', 'Right stick down'], ['rx-', 'Right stick left'], ['rx+', 'Right stick right']];
const IN_DEF = { b0: 'Space', b1: 'KeyX', b2: 'KeyZ', b3: 'KeyC', b4: 'KeyQ', b5: 'KeyE', b6: 'ShiftLeft', b7: 'Enter', b9: 'Escape', b12: 'ArrowUp', b13: 'ArrowDown', b14: 'ArrowLeft', b15: 'ArrowRight', 'ly-': 'ArrowUp', 'ly+': 'ArrowDown', 'lx-': 'ArrowLeft', 'lx+': 'ArrowRight' };
const IN_GAME = {
  'rocket-soccer': { b0: 'Space', b1: 'ShiftLeft', b2: 'KeyX', b3: 'KeyC', b4: 'KeyQ', b5: 'KeyE', b6: 'KeyS', b7: 'KeyW', b9: 'Escape', b12: 'ArrowUp', b13: 'ArrowDown', b14: 'ArrowLeft', b15: 'ArrowRight', 'ly-': 'KeyW', 'ly+': 'KeyS', 'lx-': 'KeyA', 'lx+': 'KeyD' },
  'blockcraft-3d': { b0: 'Space', b1: 'ShiftLeft', b4: 'KeyQ', b5: 'KeyE', b9: 'Escape', 'ly-': 'KeyW', 'ly+': 'KeyS', 'lx-': 'KeyA', 'lx+': 'KeyD' }
};
const IN_KEYS = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], Backspace: ['Backspace', 8], ShiftLeft: ['Shift', 16], ShiftRight: ['Shift', 16], ControlLeft: ['Control', 17], ControlRight: ['Control', 17], AltLeft: ['Alt', 18], AltRight: ['Alt', 18], ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39], Minus: ['-', 189], Equal: ['=', 187], Comma: [',', 188], Period: ['.', 190], Slash: ['/', 191], Semicolon: [';', 186], Quote: ["'", 222], BracketLeft: ['[', 219], BracketRight: [']', 221], Backslash: ['\\', 220], Backquote: ['`', 192] };
function inInfo(code) {
  if (IN_KEYS[code]) return IN_KEYS[code];
  let m = /^Key([A-Z])$/.exec(code); if (m) return [m[1].toLowerCase(), m[1].charCodeAt(0)];
  m = /^Digit(\d)$/.exec(code); if (m) return [m[1], 48 + +m[1]];
  m = /^Numpad(\d)$/.exec(code); if (m) return [m[1], 96 + +m[1]];
  m = /^F(\d+)$/.exec(code); if (m) return [code, 111 + +m[1]];
  return [code, 0];
}
function inName(code) {
  if (!code) return auT('None');
  const N = { Space: 'Space', Enter: 'Enter', Escape: 'Esc', ShiftLeft: 'Left Shift', ShiftRight: 'Right Shift', ControlLeft: 'Left Ctrl', ControlRight: 'Right Ctrl', AltLeft: 'Left Alt', AltRight: 'Right Alt', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Backspace: 'Backspace', Tab: 'Tab' };
  if (N[code]) return N[code];
  const i = inInfo(code);
  return /^Key|^Digit/.test(code) ? i[0].toUpperCase() : code.replace(/^Numpad/, 'Num ');
}
const inGid = () => cur ? cur.g.id : null;
function inProf(id) {
  S.prefs.ctl = S.prefs.ctl && typeof S.prefs.ctl === 'object' ? S.prefs.ctl : {};
  const p = S.prefs.ctl[id] = S.prefs.ctl[id] || {};
  p.k = p.k || {}; p.p = p.p || {};
  return p;
}
function inPadMap(id) { const p = inProf(id).p, d = IN_GAME[id] || IN_DEF, m = {}; IN_PAD.forEach(([k]) => { m[k] = k in p ? p[k] : (d[k] || ''); }); return m; }
function inKeyMap(id) { const k = inProf(id).k, m = {}; Object.keys(k).forEach(from => { m[from] = k[from]; }); return m; }
const inTyping = t => !!(t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], .chat, .modal, .menu'));
function inTarget() { const a = document.activeElement; return a && a !== document.body && a.closest && a.closest('.g-root') ? a : (document.querySelector('#frame .g-root') || document.body); }
function inSend(type, code, rep) {
  const i = inInfo(code);
  const ev = new KeyboardEvent(type, { code, key: i[0], bubbles: true, cancelable: true, repeat: !!rep, shiftKey: /^Shift/.test(code) && type === 'keydown', ctrlKey: /^Control/.test(code) && type === 'keydown', altKey: /^Alt/.test(code) && type === 'keydown' });
  try { Object.defineProperty(ev, 'keyCode', { get: () => i[1] }); Object.defineProperty(ev, 'which', { get: () => i[1] }); } catch (e) {}
  ev.gpSyn = true;
  inTarget().dispatchEvent(ev);
}
function inLearn(e) {
  const id = inGid();
  if (!id || !e.code) return;
  const u = IN.used[id] = IN.used[id] || new Set();
  if (!u.has(e.code)) { u.add(e.code); try { const L = JSON.parse(localStorage.getItem('gameplay:keys') || '{}'); L[id] = [...u]; localStorage.setItem('gameplay:keys', JSON.stringify(L)); } catch (x) {} }
}
function inUsed(id) {
  let L = {};
  try { L = JSON.parse(localStorage.getItem('gameplay:keys') || '{}') || {}; } catch (e) {}
  const s = new Set([...(L[id] || []), ...(IN.used[id] ? [...IN.used[id]] : [])]);
  Object.values(inPadMap(id)).forEach(c => { if (c) s.add(c); });
  Object.values(inKeyMap(id)).forEach(c => { if (c) s.add(c); });
  return [...s].filter(c => c && c !== 'Escape').sort((a, b) => inName(a).localeCompare(inName(b)));
}
function inKey(e) {
  if (e.gpSyn || !cur || AD.locked) return;
  if (IN.cap) { e.preventDefault(); e.stopImmediatePropagation(); if (e.type === 'keydown') inCaptured(e.code); return; }
  if (inTyping(e.target) || openK) return;
  const m = inKeyMap(cur.g.id);
  if (e.type === 'keydown') setTimeout(() => { if (e.defaultPrevented && !(e.code in m)) inLearn(e); }, 0);
  if (!(e.code in m)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const to = m[e.code];
  if (to) inSend(e.type, to, e.repeat);
}
function inPadPoll() {
  IN.raf = 0;
  const P = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (!P.length) return;
  const id = inGid(), map = id ? inPadMap(id) : null, now = {};
  P.forEach(gp => {
    const b = i => gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .4);
    for (let i = 0; i < Math.min(16, gp.buttons.length); i++) if (b(i)) now['b' + i] = 1;
    const ax = (i, n) => { const v = gp.axes[i] || 0; if (v < -.4) now[n + '-'] = 1; else if (v > .4) now[n + '+'] = 1; };
    ax(0, 'lx'); ax(1, 'ly'); ax(2, 'rx'); ax(3, 'ry');
  });
  if (map && !openK && !AD.locked) {
    const want = {};
    Object.keys(now).forEach(k => { const c = map[k]; if (c) want[c] = (want[c] || 0) + 1; });
    Object.keys(IN.held).forEach(c => { if (!want[c]) { inSend('keyup', c); delete IN.held[c]; } });
    Object.keys(want).forEach(c => { if (!IN.held[c]) { IN.held[c] = 1; inSend('keydown', c); } });
  } else inRelease();
  IN.pads = now;
  if (!$('#ctlmodal').hidden) inLive(now);
  IN.raf = requestAnimationFrame(inPadPoll);
}
function inRelease() { Object.keys(IN.held).forEach(c => inSend('keyup', c)); IN.held = {}; }
function inPadStart() { if (!IN.raf) IN.raf = requestAnimationFrame(inPadPoll); }
function inOpen() {
  const id = inGid();
  if (!id) return;
  if (gamebox.classList.contains('fs')) fsExit();
  inDraw();
  if (openK !== 'mctl') setOpen('mctl');
}
function inDraw() {
  const id = inGid(), box = $('#ctlbody');
  if (!id || !box) return;
  const g = byId.get(id), P = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  $('#ctlt').textContent = auT('Controls · {g}').replace('{g}', g ? g.title : id);
  const tabs = `<div class="adm-tabs ctl-tabs" data-m="${IN.tab === 'kb' ? 'users' : 'tickets'}"><button type="button" data-ct="kb" aria-selected="${IN.tab === 'kb'}">${esc(auT('Keyboard'))}</button><button type="button" data-ct="pad" aria-selected="${IN.tab === 'pad'}">${esc(auT('Controller'))}</button><i></i></div>`;
  if (IN.tab === 'kb') {
    const km = inKeyMap(id), used = inUsed(id);
    box.innerHTML = tabs + `<p class="ctl-p">${esc(auT('Pick a key the game uses, then press the key you want to use instead. Keys the game uses appear here after you play it for a moment.'))}</p><div class="ctl-l">${used.length ? used.map(c => { const from = Object.keys(km).find(k => km[k] === c && k !== c); return `<div class="ctl-r"><span class="ctl-a"><kbd>${esc(inName(c))}</kbd><small>${esc(auT('game key'))}</small></span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg><button class="btn2${IN.cap && IN.cap.to === c ? ' cap' : ''}" type="button" data-kb="${esc(c)}">${IN.cap && IN.cap.to === c ? esc(auT('Press a key…')) : `<kbd>${esc(inName(from || c))}</kbd>`}</button>${from ? `<button class="x" type="button" data-kbr="${esc(c)}" aria-label="${esc(auT('Reset'))}">${SO_ICO.x}</button>` : '<span class="x"></span>'}</div>`; }).join('') : `<div class="adm-mut">${esc(auT('Play the game for a moment, then come back: the keys it uses will show up here.'))}</div>`}</div><div class="ctl-f"><button class="btn2" type="button" data-kbadd>${esc(auT('Add a game key'))}</button><button class="btn2" type="button" data-kbclear>${esc(auT('Reset keyboard'))}</button></div>`;
  } else {
    const pm = inPadMap(id);
    box.innerHTML = tabs + `<p class="ctl-p" id="ctlpad">${esc(P.length ? auT('Connected: {n}').replace('{n}', P[0].id.replace(/\(.*?\)/g, '').trim().slice(0, 60)) : auT('Connect a controller (USB or Bluetooth) and press any button.'))}</p><div class="ctl-l">${IN_PAD.map(([k, n]) => `<div class="ctl-r" data-pk="${k}"><span class="ctl-a"><b>${esc(auT(n))}</b></span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg><button class="btn2${IN.cap && IN.cap.pk === k ? ' cap' : ''}" type="button" data-pb="${k}">${IN.cap && IN.cap.pk === k ? esc(auT('Press a key…')) : `<kbd>${esc(inName(pm[k]))}</kbd>`}</button><button class="x" type="button" data-pbn="${k}" aria-label="${esc(auT('None'))}">${SO_ICO.x}</button></div>`).join('')}</div><div class="ctl-f"><button class="btn2" type="button" data-pbclear>${esc(auT('Reset controller'))}</button></div>`;
  }
}
function inLive(now) { document.querySelectorAll('#ctlbody [data-pk]').forEach(r => r.classList.toggle('on', !!now[r.dataset.pk])); const t = $('#ctlpad'); if (t && Object.keys(now).length && !IN.seen) { IN.seen = true; inDraw(); } }
function inCaptured(code, pk) {
  const c = IN.cap, id = inGid();
  IN.cap = null;
  if (!c || !id) { inDraw(); return; }
  const p = inProf(id);
  if (c.add) { if (code && code !== 'Escape') { (IN.used[id] = IN.used[id] || new Set()).add(code); inLearn({ code }); } }
  else if (c.to && code && code !== 'Escape') { Object.keys(p.k).forEach(k => { if (p.k[k] === c.to) delete p.k[k]; }); if (code !== c.to) { p.k[code] = c.to; p.k[c.to] = p.k[c.to] || ''; } else delete p.k[c.to]; Object.keys(p.k).forEach(k => { if (p.k[k] === '' && !Object.values(p.k).includes(k)) delete p.k[k]; }); }
  else if (c.pk && code && code !== 'Escape') p.p[c.pk] = code;
  save(); inDraw();
}
function inBoot() {
  addEventListener('keydown', inKey, true);
  addEventListener('keyup', inKey, true);
  addEventListener('gamepadconnected', e => { inPadStart(); if (Date.now() - IN.hint > 60000) { IN.hint = Date.now(); toast(auT('Controller connected')); } if (openK === 'mctl') inDraw(); });
  addEventListener('gamepaddisconnected', () => { inRelease(); if (openK === 'mctl') inDraw(); });
  addEventListener('blur', inRelease);
  MENUS.mctl = ['#ctlmodal'];
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="ctlmodal" hidden role="dialog" aria-modal="true" aria-labelledby="ctlt"><div class="mc"><div class="mh"><h3 id="ctlt">${esc(auT('Controls'))}</h3><button class="x" type="button" data-close aria-label="${esc(auT('Close'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="mb" id="ctlbody"></div></div></div>`);
  const rb = $('#pRestart');
  if (rb) rb.insertAdjacentHTML('beforebegin', `<button class="icon" type="button" id="pCtl" title="${esc(auT('Controls'))}" aria-label="${esc(auT('Change controls'))}">${SO_ICO.pad}</button>`);
  $('#pCtl').addEventListener('click', e => { e.stopPropagation(); inOpen(); });
  $('#ctlmodal').addEventListener('click', e => {
    const t = e.target;
    if (t === e.currentTarget || t.closest('[data-close]')) { IN.cap = null; closeAll(); return; }
    e.stopPropagation();
    const id = inGid(); if (!id) return;
    const p = inProf(id), b = x => t.closest(x);
    if (b('[data-ct]')) { IN.tab = b('[data-ct]').dataset.ct; IN.cap = null; inDraw(); return; }
    if (b('[data-kb]')) { IN.cap = { to: b('[data-kb]').dataset.kb }; inDraw(); return; }
    if (b('[data-kbr]')) { const to = b('[data-kbr]').dataset.kbr; Object.keys(p.k).forEach(k => { if (p.k[k] === to || k === to) delete p.k[k]; }); save(); inDraw(); return; }
    if (b('[data-kbadd]')) { IN.cap = { add: true }; b('[data-kbadd]').textContent = auT('Press the game key…'); b('[data-kbadd]').classList.add('cap'); return; }
    if (b('[data-kbclear]')) { p.k = {}; save(); inDraw(); return; }
    if (b('[data-pb]')) { IN.cap = { pk: b('[data-pb]').dataset.pb }; inDraw(); return; }
    if (b('[data-pbn]')) { p.p[b('[data-pbn]').dataset.pbn] = ''; save(); inDraw(); return; }
    if (b('[data-pbclear]')) { p.p = {}; save(); inDraw(); return; }
  });
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) inPadStart();
}
