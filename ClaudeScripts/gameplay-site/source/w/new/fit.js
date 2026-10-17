const shortQuery = window.matchMedia ? matchMedia('(max-height: 520px) and (orientation: landscape)') : { matches: false };
const stageMode = () => gamebox.classList.contains('fs') ? 'fs' : (view === 'game' && gamebox.classList.contains('theater')) ? 'theater' : 'off';
function fitStage() {
  const mode = stageMode();
  const frameEl = document.getElementById('frame'), st = document.getElementById('stage');
  gpFill(mode === 'fs', frameEl, st);
  if (mode === 'off') {
    st.style.background = '';
    if (fsScale !== 1) { frameEl.style.transform = ''; fsScale = 1; fsT = [0, 0]; applyGlScale(1); }
    if (st.style.height) st.style.height = '';
    return;
  }
  const root = frameEl.querySelector('.g-root');
  if (!root || !frameEl.offsetWidth) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const el of root.children) {
    if (!el.offsetWidth || !el.offsetHeight) continue;
    const pos = getComputedStyle(el).position;
    if (pos === 'absolute' || pos === 'fixed') continue;
    x0 = Math.min(x0, el.offsetLeft); y0 = Math.min(y0, el.offsetTop);
    x1 = Math.max(x1, el.offsetLeft + el.offsetWidth); y1 = Math.max(y1, el.offsetTop + el.offsetHeight);
  }
  if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = root.offsetWidth; y1 = root.offsetHeight; }
  const cx = root.offsetLeft + x0, cy = root.offsetTop + y0, cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  const sw = st.clientWidth;
  let s, sh;
  if (mode === 'fs') {
    sh = st.clientHeight;
    const pad = root.querySelector('canvas') ? 0 : 20;
    if (gpHud(frameEl, cw, ch)) { requestAnimationFrame(fitStage); return; }
    s = Math.max(0.3, Math.min((sw - pad * 2) / cw, (sh - pad * 2) / ch, 8));
    gpEdge(root, st);
  } else {
    const pad = 12, bar = gamebox.querySelector('.play-bar');
    const short = shortQuery.matches;
    const availH = short ? Math.max(150, innerHeight - (bar ? bar.offsetHeight : 50) - 2) : Math.max(380, innerHeight - 64 - 8 - (bar ? bar.offsetHeight : 60) - 30);
    const minS = short ? 0.3 : root.querySelector('canvas') ? 0.55 : 1;
    s = Math.max(minS, Math.min((sw - pad * 2) / cw, (availH - pad * 2) / ch, 2.4));
    sh = short ? availH : Math.max(440, Math.ceil(ch * s + pad * 2));
    if (st.style.height !== sh + 'px') st.style.height = sh + 'px';
  }
  const fl = (sw - frameEl.offsetWidth) / 2, ft = (sh - frameEl.offsetHeight) / 2;
  let tx = (sw - cw * s) / 2 - fl - cx * s, ty = (sh - ch * s) / 2 - ft - cy * s;
  if (Math.abs(s - 1) < 0.001) { tx = Math.round(tx); ty = Math.round(ty); }
  if (fsScale !== 1 && Math.abs(s / fsScale - 1) < 0.03 && Math.abs(tx - fsT[0]) < 10 && Math.abs(ty - fsT[1]) < 10) return;
  frameEl.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  fsScale = s; fsT = [tx, ty]; applyGlScale(s);
}
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitStage); };
function startFitTimer() { clearInterval(fitTimer); fitTimer = setInterval(() => { if (stageMode() !== 'off') fitStage(); }, 1500); }
function gpMain(frameEl) {
  let best = null;
  glSet.forEach(e => { if (e.canvas && frameEl.contains(e.canvas) && (!best || e.w0 * e.h0 > best.w0 * best.h0)) best = e; });
  return best;
}
function gpFill(on, frameEl, st) {
  const e = gpMain(frameEl);
  if (!e) return;
  if (e.noFill) on = false;
  let w = e.w0, h = e.h0;
  if (on) {
    const A = st.clientWidth / Math.max(1, st.clientHeight), a = e.w0 / e.h0;
    if (Math.abs(A - a) > 0.01) { if (A > a) w = Math.round(e.h0 * A); else h = Math.round(e.w0 / A); }
  }
  if (w === e.cw && h === e.ch && e.fill === on) return;
  e.cw = w; e.ch = h; e.fill = on;
  try { e.own = true; e.renderer.setSize(w, h, false); } catch (x) {} e.own = false;
  e.canvas.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
  e.canvas.style.aspectRatio = `${w} / ${h}`;
  if (on && w > e.w0) { if (frameEl.dataset.fw == null) frameEl.dataset.fw = frameEl.style.getPropertyValue('--fw'); frameEl.style.setProperty('--fw', w + 'px'); }
  else if (frameEl.dataset.fw != null) { frameEl.style.setProperty('--fw', frameEl.dataset.fw); delete frameEl.dataset.fw; }
  fsScale = 0;
  if (on && (w !== e.w0 || h !== e.h0)) {
    const r = e.canvas.offsetWidth / Math.max(1, e.canvas.offsetHeight);
    if (Math.abs(r / (w / h) - 1) > 0.03) { e.noFill = true; gpFill(false, frameEl, st); }
  }
}
function gpHud(frameEl, cw, ch) {
  const e = gpMain(frameEl);
  if (!e || !e.fill || e.noFill) return false;
  if (Math.abs(e.canvas.offsetWidth / cw - 1) < 0.03 && Math.abs(e.canvas.offsetHeight / ch - 1) < 0.03) return false;
  e.noFill = true;
  gpFill(false, frameEl, document.getElementById('stage'));
  return true;
}
function gpEdge(root, st) {
  let col = '';
  const c = root.querySelector('canvas');
  if (c && !gpMain(document.getElementById('frame'))) {
    try { if (c.width && c.height) { const t = gpEdge.t || (gpEdge.t = document.createElement('canvas')); t.width = 2; t.height = 1; const x = t.getContext('2d', { willReadFrequently: true }), y = Math.floor(c.height / 2); x.clearRect(0, 0, 2, 1); x.drawImage(c, 0, y, 1, 1, 0, 0, 1, 1); x.drawImage(c, c.width - 1, y, 1, 1, 1, 0, 1, 1); const d = x.getImageData(0, 0, 2, 1).data; if (d[3] > 200 && d[7] > 200) col = `rgb(${(d[0] + d[4]) >> 1},${(d[1] + d[5]) >> 1},${(d[2] + d[6]) >> 1})`; } } catch (x) {}
  }
  if (!col) { const b = getComputedStyle(root).backgroundColor; if (b && !/rgba\(\s*0,\s*0,\s*0,\s*0\)|transparent/.test(b)) col = b; }
  st.style.background = col || '#000';
}
