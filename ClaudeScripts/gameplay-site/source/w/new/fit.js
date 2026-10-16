const stageMode = () => document.fullscreenElement === gamebox ? 'fs' : (view === 'game' && gamebox.classList.contains('theater')) ? 'theater' : 'off';
function fitStage() {
  const mode = stageMode();
  const frameEl = document.getElementById('frame'), st = document.getElementById('stage');
  if (mode === 'off') {
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
    const pad = 18;
    sh = st.clientHeight;
    s = Math.max(0.3, Math.min((sw - pad * 2) / cw, (sh - pad * 2) / ch, 4));
  } else {
    const pad = 12, bar = gamebox.querySelector('.play-bar');
    const availH = Math.max(380, innerHeight - 64 - 8 - (bar ? bar.offsetHeight : 60) - 30);
    const minS = root.querySelector('canvas') ? 0.55 : 1;
    s = Math.max(minS, Math.min((sw - pad * 2) / cw, (availH - pad * 2) / ch, 2.4));
    sh = Math.max(440, Math.ceil(ch * s + pad * 2));
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
function startFitTimer() { clearInterval(fitTimer); fitTimer = setInterval(() => { if (stageMode() !== 'off') fitStage(); }, 700); }
