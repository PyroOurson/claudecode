(() => {
  'use strict';
  const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const EPOCH = 20454;
  const HUES = ['#f7da21', '#6aaa64', '#7aa7f0', '#ba81c5', '#ff8a3d', '#4cc9f0', '#ff5d73'];
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const shuf = (a, R = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const dayNo = () => { const d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const stride = n => { let s = Math.max(1, Math.round(n * .382)); while (gcd(s, n) !== 1) s++; return s; };
  const dIdx = (day, n, salt = 0) => (day * stride(n) + salt) % n;
  const mmss = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const dateLbl = (day, y) => new Date(day * 864e5).toLocaleDateString(undefined, y ? { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const blocked = api => api.paused || !!document.querySelector('.g-overlay.show');

  const tap = (el, sel, fn) => {
    el.addEventListener('pointerdown', e => { if (e.button) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) { e.preventDefault(); fn(b, e); } });
    el.addEventListener('click', e => { if (e.detail) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) fn(b, e); });
  };
  function segBar(groups, sel, onPick) {
    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    bar.innerHTML = groups.map(([k, items]) => `<div class="seg" role="group">${items.map(([v, t]) => `<button type="button" tabindex="-1" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    const sync = () => bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(sel[b.dataset.k] === b.dataset.v)));
    tap(bar, 'button', b => { if (sel[b.dataset.k] === b.dataset.v) return; sel[b.dataset.k] = b.dataset.v; sync(); onPick(b.dataset.k); });
    sync();
    bar.sync = sync;
    return bar;
  }

  const newSt = () => ({ p: 0, w: 0, cs: 0, ms: 0, ld: 0, d: {}, b: {} });
  const curStreak = (st, today) => st.ld >= today - 1 ? st.cs : 0;
  function addRes(st, win, day, today, skipP) {
    if (!skipP) st.p++;
    if (win) st.w++;
    if (day === today) {
      if (win) { st.cs = st.ld === today - 1 ? st.cs + 1 : 1; st.ld = today; st.ms = Math.max(st.ms, st.cs); }
      else { st.cs = 0; st.ld = today; }
    }
  }
  const pct = st => st.p ? Math.round(100 * st.w / st.p) : 0;

  function copy(api, text) {
    const ok = () => api.toast('Result copied to clipboard');
    const fb = () => {
      const t = document.createElement('textarea');
      t.value = text; t.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      document.body.append(t); t.select();
      let good = false;
      try { good = document.execCommand('copy'); } catch (e) {}
      t.remove();
      if (good) ok(); else api.toast(text.split('\n')[0]);
    };
    if (navigator.share && matchMedia('(pointer:coarse)').matches) navigator.share({ text }).catch(e => { if (!e || e.name !== 'AbortError') fb(); });
    else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb);
    else fb();
  }
  function flash(box, text, cls) {
    box.querySelectorAll('.msg').forEach(x => x.remove());
    const m = document.createElement('div');
    m.className = 'msg ' + (cls || '');
    m.textContent = text;
    m.addEventListener('animationend', () => m.remove());
    box.append(m);
  }

  function confetti(root, api, n = 140) {
    const w = root.clientWidth, h = Math.max(root.clientHeight, 320), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.className = 'gm-fx'; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    root.append(c);
    const g = c.getContext('2d'), P = [];
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1;
      P.push({ x: w / 2 - s * w * .42, y: h * .62, vx: s * (160 + Math.random() * 560), vy: -(380 + Math.random() * 640), z: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * 14, f: Math.random() * 6, col: HUES[i % HUES.length] });
    }
    let life = 0;
    const stop = api.loop(dt => {
      life += dt;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
      g.globalAlpha = life > 2.3 ? Math.max(0, (2.9 - life) / .6) : 1;
      for (const p of P) {
        p.vy += 900 * dt; p.vx *= 1 - 1.3 * dt; p.vy *= 1 - .5 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.f += dt * 9;
        const co = Math.cos(p.r) * dpr, si = Math.sin(p.r) * dpr, k = Math.cos(p.f);
        g.setTransform(co, si, -si * k, co * k, p.x * dpr, p.y * dpr);
        g.fillStyle = p.col; g.fillRect(-p.z / 2, -p.z * .3, p.z, p.z * .6);
      }
      if (life > 2.9) { stop(); c.remove(); }
    });
  }

  const baseCss = id => `
.gm-${id}{justify-content:flex-start;gap:clamp(8px,1.6vw,12px);padding:clamp(12px,2.4vw,20px);border-radius:20px;background:#fff;color:#121213;font-family:${FONT};-webkit-font-smoothing:antialiased}
.gm-${id} button{font-family:${FONT}}
.gm-${id} .seg-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm-${id} .seg{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:4px;border-radius:999px;background:#f0f1f2}
.gm-${id} .seg button{height:34px;padding:0 15px;border:0;border-radius:999px;background:none;font:700 13.5px/1 ${FONT};color:#5b5d60;cursor:pointer;white-space:nowrap;touch-action:manipulation}
.gm-${id} .seg button:hover{color:#121213}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:#121213;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.gm-${id} .pill{height:36px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #c9ccd0;border-radius:999px;background:#fff;color:#121213;font:600 14px/1 ${FONT};cursor:pointer;touch-action:manipulation;white-space:nowrap}
.gm-${id} .pill:hover:not(:disabled){background:#f4f5f6}
.gm-${id} .pill:active:not(:disabled){background:#e8e9eb}
.gm-${id} .pill:disabled{opacity:.4;cursor:default}
.gm-${id} .pill.dark{background:#121213;border-color:#121213;color:#fff}
.gm-${id} .pill.dark:hover:not(:disabled){background:#2c2d2f}
.gm-${id} .pill:focus-visible,.gm-${id} .seg button:focus-visible{outline:2px solid #3a86ff;outline-offset:2px}
.gm-${id} .nv{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.gm-${id} .nv-r{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.gm-${id} .nv-a{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap}
.gm-${id} .nv-a[hidden]{display:none}
.gm-${id} .nv-a .pill{height:32px;padding:0 12px}
.gm-${id} .nv-a .nv-p,.gm-${id} .nv-a .nv-n{width:32px;padding:0;font-size:20px;line-height:1}
.gm-${id} .nv-l{min-width:104px;text-align:center;font-size:13px;font-weight:700;color:#5b5d60}
.gm-${id} .nv-i{width:100%;margin:0;padding-bottom:8px;text-align:center;border-bottom:1px solid #d3d6da;font-size:13px;font-weight:700;color:#5b5d60;font-variant-numeric:tabular-nums}
.gm-${id} .msg{position:absolute;left:50%;top:0;z-index:9;transform:translateX(-50%);padding:10px 16px;border-radius:6px;background:#121213;color:#fff;font:700 14px/1.2 ${FONT};white-space:nowrap;pointer-events:none;animation:gmNgMsg 1.7s forwards}
.gm-${id} .msg.gold{background:#f7da21;color:#121213}
.gm-${id} .gm-fx{position:absolute;left:0;top:0;z-index:30;pointer-events:none}
.gm-${id} .gm-pop{position:absolute;z-index:6;pointer-events:none;font:900 22px/1 ${FONT};color:#121213;white-space:nowrap;animation:gmNgPop .9s ease-out forwards}
@keyframes gmNgMsg{0%{opacity:0;transform:translate(-50%,-6px)}8%{opacity:1;transform:translate(-50%,0)}78%{opacity:1}100%{opacity:0}}
@keyframes gmNgPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.1)}60%{opacity:1}100%{opacity:0;transform:translate(-50%,-200%) scale(1)}}
@keyframes gmNgShake{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes gmNgPopIn{50%{transform:scale(1.08)}}
@media (max-width:420px){.gm-${id} .seg button{padding:0 11px}}`;

  function nav(api, root, o) {
    const today = dayNo(), lo = Math.max(EPOCH, today - 365), saved = api.load() || {};
    const S = Object.assign({ mode: 'daily', st: newSt(), prog: {} }, saved);
    if (!S.st || typeof S.st !== 'object') S.st = newSt();
    if (!S.prog || typeof S.prog !== 'object') S.prog = {};
    S.st = Object.assign(newSt(), S.st);
    S.mode = S.mode === 'arch' ? 'arch' : 'daily';
    let arch = Math.min(today - 1, Math.max(lo, (S.arch | 0) || today - 1));
    const canArch = today - 1 >= lo;
    if (!canArch) S.mode = 'daily';
    const sel = { mode: S.mode };
    const el = document.createElement('div');
    el.className = 'nv';
    el.innerHTML = '<div class="nv-r"><span class="nv-m"></span><button type="button" class="pill nv-s">Stats</button></div><div class="nv-a" hidden><button type="button" class="pill nv-p" aria-label="Older puzzle">&#8249;</button><span class="nv-l"></span><button type="button" class="pill nv-n" aria-label="Newer puzzle">&#8250;</button><button type="button" class="pill nv-x">Random</button></div><p class="nv-i"></p>';
    const N = {
      S, el, today, extra: '',
      day: () => sel.mode === 'daily' ? today : arch,
      isToday: () => sel.mode === 'daily',
      persist() { S.mode = sel.mode; S.arch = arch; api.save(S); },
      prog(key) {
        if (!S.prog[key]) {
          S.prog[key] = {};
          const ks = Object.keys(S.prog);
          for (let i = 0; i < ks.length - 90; i++) delete S.prog[ks[i]];
        }
        return S.prog[key];
      },
      info(extra) {
        if (extra !== undefined) N.extra = extra;
        const d = N.day();
        el.querySelector('.nv-i').textContent = (sel.mode === 'daily' ? `Daily · ${dateLbl(d)} · streak ${curStreak(S.st, today)}` : `Archive · ${dateLbl(d, true)}`) + (N.extra ? ' · ' + N.extra : '');
        el.querySelector('.nv-l').textContent = dateLbl(d, true);
        el.querySelector('.nv-p').disabled = arch <= lo;
        el.querySelector('.nv-n').disabled = arch >= today - 1;
      }
    };
    const modeBar = segBar([['mode', [['daily', 'Daily'], ['arch', 'Archive']]]], sel, () => { if (sel.mode === 'arch' && !canArch) { sel.mode = 'daily'; modeBar.sync(); api.toast('The archive opens tomorrow'); return; } show(); o.open(); });
    el.querySelector('.nv-m').replaceWith(modeBar);
    const show = () => { el.querySelector('.nv-a').hidden = sel.mode !== 'arch'; };
    const go = d => { arch = Math.min(today - 1, Math.max(lo, d)); o.open(); };
    tap(el, '.nv-p', () => go(arch - 1));
    tap(el, '.nv-n', () => go(arch + 1));
    tap(el, '.nv-x', () => {
      const pool = [];
      for (let d = lo; d < today; d++) if (d !== arch && !(S.prog['d' + d] && S.prog['d' + d].done)) pool.push(d);
      const all = [];
      for (let d = lo; d < today; d++) if (d !== arch) all.push(d);
      const src = pool.length ? pool : all;
      if (src.length) go(src[Math.floor(Math.random() * src.length)]);
    });
    tap(el, '.nv-s', () => o.stats());
    show();
    return N;
  }
  function statsOv(api, N, extra, text) {
    const st = N.S.st;
    api.overlay({
      kicker: 'Statistics',
      title: 'Your stats',
      text: text || '',
      stats: [['Played', st.p], ['Win %', pct(st)], ['Streak', curStreak(st, N.today)], ['Max streak', st.ms]].concat(extra || []),
      button: 'Close'
    });
  }
  const popText = (root, el, txt) => {
    const r = el.getBoundingClientRect(), o = root.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'gm-pop'; s.textContent = txt;
    s.style.left = (r.left + r.width / 2 - o.left) + 'px'; s.style.top = (r.top - o.top + 6) + 'px';
    s.addEventListener('animationend', () => s.remove());
    root.append(s);
  };

  const BEE_Z = 'dF3bdqPKknz312xxke3PQVCSaCHgALKNv34yIrIKpO5Za2aftq0LFFV5iYyM_K-qpuarmm5vh1NVP-a3vBv68Jb3zdC_vYfm7b3tL2_v9vslvJX30C9v2al6K-wXYX3LB_uxGezXb_mjXuzlWejayn6apgovbZvwVuAT8kvVdvbh7dKG-e24vmVdtbT2HcWvfZv9n_2mH6Z71b1lg13SW27vtJfP17eSr8vvba935NPyVtpXlfzh0Tdvx_mtWN7yr_CWTdWMXx_t3x-4xmq2P7TNxV6fD5X95zHaZc11mPHXvg64t3J5Owb7umE62T_snie8-Yibrlq7xKmqF37cwy4ss2-s-Eb75NkWxa5kwovLWbda4jrWGbdiy3Soq7qtcDv38Ha0f73X-Kh3X4U6dGGqbG0_7Xs_7Zefw_RW9AuvA_dll3usTp19Hb6Tvx34dYXdAS_W_qfVC-xB2b1_zngJlvljxb3jmeVd1d75PPOhqxouTnG_Dw2_Gg-uHKt-tVu1z6_SN3Ep7ZUP-4h3-_Vqr7X_m7khptC0eGfxsDvFKtqb8FTwtB_3R4ePxtKtb0f8a-afsU54RRa4uvhDW78V2HPFas_-Gri32mCL-M6bK_DqtuHrymXFnzNbyszekQ0TdsC8tFzT7H8Pe1yLvXLCTrBPqi76uOFU2a_79c5Vy9fO3mAfnS32YLAm9pDLC66Cd_uFy_po-JhwrR84CrbodoNlO9_x4LE9uJPfcQgmPHtbj1nPNcdOsTU5tna5x261_dHiR_vHwrvCE8T1PvCCnKdnxLsfds08Z_aezFbj0PAG2sFehOOU22YouRmOPAk4BceJa4_rxKYvB_1sn97g2dhefTs-7L4nu8vat1XrO-Xd3nDUChf8wA-7TNyanx6_I1sJ_WwfGvoWj2q4V_Yd-CeuKbeF98dsD3DSg-YmwjZt9WlZW9lTsIXPB_uocbD9kP2p6oBdhaM0tD1vwh7Ug4-1t8st5u0kLFgCeziwK_d2skvVjtutgD3dVifA7EGJgx1vNxtOsGrtrEXEr4MsCB8dF1WGpuCRLrS6tot67G7eaXuG6TAjgT88OvuY6zA0XOsvWQQ_jTACCx5djrNXTHMVjyO-dKFlaePy7O4hHg5_iPlQx2W13XgIF7v6zK7QjJwMIXcVXvdWnHCKmslMsZmMrsIzmgcdy9EW2a57uQasvq3N4VxNb9m5as2OBNm5kLaGtoSZjeqrXbiSZtBhJBr88MEV6rF0OIrTfdtQuJkfLlrePWhzBhgTPbzscjWvcGz577a2T6ka29Whs5XsBjuc2QBXMlV20LMl2IGqqwkHoT3D7Zh_CmaBFnMG_YBn9g0XcbjAOpew8KOttdlNbCocoEyH2gxRR0Pf11j_0q4YxyHuDnsHtvSlDb4JcPBts3Mnhcv-rvFQZu5kGIIC5skutO1wOnGG8VVLtSSbaS-yJ9XapcGCrfhw3N1E32iuRqe4dHMpv4prGPrhvr4drgGu6m6fYT_QhzYyi_geu-Rba6uXdfxRPvme7tj-PJ3MMML4Psx9FnDq9VTZ5qWtO2NhcVUtVr_ohm9Y6XuIC4ZdXtq737UH7_DbJY4FrBR3lhmyYph4azk8FPZXvrSX64I7ecu_qy-tNjaSWbK54wIfbva0Dp1ZgRlP2C7cHkYx8L573iFPme0peXeuOb_hVinoWKaBbttu3pYdFzzA1eC1PIX1Ndxhj6_Y-drr7zSE1xVrOGEn2fEJZoPG6xZH9Ngj-qr8p-qbgCdc4YTY8th_sktl77boJZzsMb7TlMHd2ctPLc64PU6d0fdoUC79803c7MbugzlYBim3qrOTgFM0tA39kT3McKEleO9W2QF5YVkDuBC7504mY7rYV8JMw4spjii-eEhtp-Hb9F64-EDzVNheth0Je7LzbO7ViiXuPzrz7-hh8BH7e_DPftCt4GzK4NJtzLyAjk_bPEPRV7UMmAdnOKKwXbYK2IZXc7vYnxccXEZHDztNto8q_q08BT7coM1sZwFxDLaXWV84bflbWAk-Ph5UWzacVPfF1-FxsSfc3gO2WrE8EE0OjB3gDC2UtNWzf9E19hXu5q18wJAHi4_s8H5Xq-1Yi-EulTl8nux8WrsODmSe8dMSHjohvzrIXEMGgIgjbL_Os9m46e1z0rX6UykYdMLLyYZ3-JPta66CHVfzsBa34AnYidjWn5_-6UFmjKHz5brOCz2rvT6vWx32Rgt-2Z8unkD7UTYvX_CgbD36VuGBeduW12NhFS4FgVY23GjYaGARAXLv2XO6tifaMbPjtiC8B7uo80pDhxXuwhYaxwvnymTrpam6CkmGGfpDX50GhGJ5PSBOycO9RWphnorLcTGzZC-98KdiMBczPOiujg8ZoXWWz52S28X_LgrpERPalvzsEID9vr4wn-orFzBgvw53ezXD8auCawtAe9nuzraD_cFC_gXGacDZK1vemF2y2ZJmwB945cyc0uV_m-EIZjtxSitGIw8uYKlDmWMTFvg8e_nMRfwrlTAXah80tZ2vLR4EUqKCexQJFeIwBgExtGxTBoCHnmOLIdK6XfUNs8cfGb68Y4ZENwLXXXlQ6XF63l7bmKR9hRjEWMq3N3afPdODWmZlSjEzrAX3O_bs3hIyMJaN2zYy78ezy4Ep46_8WYrf7EY7Pv2V23m9M7bGbyxK_cFy27LbmszfYYo53JER_kV-GFlLMdUMQO0L6sC8yNyfhQ5mARaEk7Ym7_KNU4v1gyEJd-376seuBxkF7-7UDvikom5HWh_88tONf8EdUWCjvCvPKGj6i-GnbRjDWrjMSOAYlCNYENjbQzL_ZrkMTCmC28JiHJkHhniWvCgC_7LHnv20Ia0dFiFbTwOs5NW8uTmaiU8-0GHTOV951a28sxafgfrB_HjF1Opg5vca5BT5IGBcbH9PC7MSuEYL7uGuCoZwsPahZh5mx8C2MdL1bsCO5k7tuJBm1LsuPkNbxOWB7cC49AiXI6ODTfgUSOIUaPeE-fkPMz1x2VWyKu9LYOoOD9Q3u-zmB_Z14R-OvzCxXWU-5t3zZXwKD8OxesAmyzRbzKk82hME-7r_PeRUdRiRXL7btyVMxOLVGTYGWZIfAJg6-DSkcdfQ01sOtrQWh08KpHXKvjzV2hmmbGrrYeGZxTayFMn2byvfZSfmYNsGO9PMNW530d6yaOiBRIlHwaLl6e1g2Qz2pt1KdmoZTE9IRt5pRz6QbdFpR98kl5nVgAUUeeBAwA7kZmkqfFSIhum4ugdCwsB7sBsosKXMu9Kx2MszQQ4PbswgsKivPMIymwhXooSKySTut5hXmIYTDJ3soFvAguERMgG4Of7YIG-Qf-m319k2Lod6YoaJs24BFYCCyox02XJjclcjjT1ZjGc-54oESOl_UBJsT9hjY7fSK3JR7qp8bJW3KaRV_isvgyshDFXMKSe1WL-_6NHya3eex-OoUE3zPr3Nr-tyhRfJ2689nhJzwny4RNQJMRozBEZlFhHNTFJL5tY98qezA1aFgAdF4_n5Yct2nezMMf_Eqj5geIv48hJJ6TveYm4vTDBMZqUiQKY7MD85rb4S8Enfw3TjPrQNOp_CvGDXWlZPHEl3VzJILJkRcmealb9WzFjoUIh6TLaHGFo3PJjZjWEm7jWlNV0IIyyK7WaYkQVJCwyAslc8QoSPHWJHxadv73rjbLFYC3QD7kTnj_-duUbI5N0wxGdzP3U4MbA--4NN5ybQp2Bi_5w0F3TcCZODxVL0s8wR8vHEs730el3Ycud7K8QMW0LxOy3c3vpZAC8T4on4J27BrgIr-bg_bReztcn7PuFutAftfONJuNo2PnIPE06BM-mrB783fyCPXjsEh3cLo-2hH5YKnhYQL1ztNQAMU7iFGBqvtMgv7ZOs8ywpGzpEKkL6YAuCHMzI32TcowXebbcHbzjC8SywmccnTEWrWd72GG1cPXu8gkm39eKrCW7cx-0J981fy_se9h8lFAjQWPlwPIAGSs86xz0AWqRZ_uD27QMT_HrZAHNAhh9fnmefsJT62Gwd6ToPj1OYABAB6spq_a2peP850VzlCRaxF8sWQB1xjtxeX5RD09IiCQCUwgyEkKcZIKWsj1lRZDbbN8ObtvQUCx54xhwmTzGvPU5ZNOSawwUvLO4WGsVDMDOgERwKGGi44yU4DWPbDdjahGfLAdi37cgegUrXIoA-fBFHMM_U4R7fka-YE2fIgVtAaIvE7kiM8bIDxYqHEKlJcO5uPxSMmQQ5MSnvPanCEsFN4J9tDVNlRtKSX0BObfMUjx6-q3b5K1cv-20f5dPzO-CfiBjAD4QZiFsGy0rQ9gpIKLsRnkImn_W-qyyZwh3bc7G1-KH_whXb_w736Bk7PTnutrfDajm7JR9XQuXZY_pCvnH4rTrEW-39sVzx2_D236nCozxVQCOWhX5fHoOhktB0bAJWS3jVdW02FHm4_anrsB1uFtISg28GJg7R3xdne4HFioOXcSxQR0UGS2b5GKAfMyRBpg2H3T611EuIChWPkZ_C9ShW1nVwGWaEYEiainCOZXphS3ywLRr5Fi5zdj538qnMpgCuEBUPjV_SCuc8Boej8kdYiEMvTJAKnM0lxRLmVog0wQYGfh0cIw1jlyDcXZZ4Gipmpyuzaj12lRTsoyuZVQf57JYQ5MgTtaxJFNyLfYoX_Y8jym3FNAwoR_D67wDUsBlm-4S7rOf9NAxI03oilnYRvAQegZmpSloB_1iu84XhtK2RP8QYHt0smY_4EY-6Pfs_Ax_89rDlOGCtZaaf_pBbLEwYxzIHOGzLzQuYoBWQ2riwMBKz72w62aUyx0FsjAiyftBcIrSzz2dgHT-8BpjQcGFP2FDFGWBw0SFkwX8I88Y1VNzOR0afceNVpFixC3BiSIKYJ85p1zkShPxWaF-BS4DZvgFQQJh4CTH4VEbd89oQjwSVGAjG4YEHxfn4HlZGiRna7VhyhdIT48DFbwirCZyVdRPgj6XHoUwvfW1R26qIVMzMb-x7ea2yODRK9pD5YfvnwccRtLG4yYPiOGSRA7eeBeQdDALjQmQhIe3gayx1-GP37bg8TnY9N5acHD_QdeMYVZ1KJA1j78mtZPByKbJRWYnnWMRMDgC-eP4DSjy0eL8Vwk8gk8PNjFuo_Aq9EocNn445Dj68hh44jsz-Tz0d35EYVyFvUVdI-ZuItxRht8lnepzSkf-F6Ha520YPeBIvGfwAtJVnOg0jEiUUWR4zrwUbi39qmng5ZsDuQIpsJ5snjCg5UfwRYCajqwW5eBbsfvMzTcAVQWQOjJ0Xrzd9A3VYdgc3OyNazi54HBe5y7QMrGL2YYuLBBfmg9nDXqaxR-DdnYHnRJDHLggfgFLAfVjgEXoWiZFMA2NCkCLHl_0J3wHJPEr3gRkUYc1w5pP-8vDLTejHvPnpr-D2cuhpt_g4zt3wzZPrqTaB0-9oyZBQwnPuq0tfwqf5uBq3d0TUG0AZWR-3d_NsElAHthsrGtQ_zaEtT7yG4mvoGGp9LorL8z_VHaAmt6mcxxUx0W9AxdkO3ewmLlS8IADnACtROgE5gckkIJBgVj5HyUqpL0D-mcC28uwikJQwMjBYdO-8rYDci6k569M4pvB7AEiRJB0dK6HlqbStN-w5_w72sLMvvIUZFBwGqq-0TObusVY4i4Dms1972QHFDC8UZKdThAkLQTxM5kZcft2F9ESx23eeQX7B4rae6SbMMgqMZ9uoNOU5YlUapTYw3IRhQUaR_Rke8slTNHR0aKoTYpvRKypCyBlIWp4OCJH7iRtuIB5Hzgjvwh0wfv5g9lO68x2YympzmV-d_Hz7dok3o5fg-4CWD_fWV2EAnr-i2nMxMwtnjyc-XBxm5nZXRgF_zsCmx7YZ5_g9M-DCEFGtYqkWRgnxMdZXURzgTVWDmGAdGi5a6Xt50o7iIk2quCG_rR-tynHXYXS40P3DMqFiEvbVQ_gr2m6gsAxpjrPtGu32B9gImf14Q_T6W00ACTt45fIP_6t6IE4Z62QyoFdkInvYJgccYq8OynfnZc9V4B0DFIFz_w37ICMLSvv4bsYEu8B7BMxugQs5Fn3zSn_gF-3QZiRn37Bgtkrx5Xoh_Gws-vEqm-dPQDhfLHL6-fJrF_mL7WR7gHbvxNWs41uPUyrx8Vv0APz7rgOQoXK-Opx0391OmPh97iMWfaXzZ2Z9zPez2_oznJTEAu9bVM5CkBGmSDAoW6QrZmcD_5zbISxjvHfnFbIeRh9z4mVM6e6xR69vhwE--Wl1GbUwQPCC7JKKGMurXzUTAspUR9w0Nx_sWFFmmyeDD7xUIj_E2iQ2gS0McSQL8RHvBcVL2q0AEa-sDCmef45WZ3qnDDWlRp8VpoEY2kQk8x0lYmRZF_M8uQrPyX9YjI0wlQ7w-XNlBcqr2WLG4L_VX8GIEgnyC9xhnQE7IfJWCNIuKnOWnpRjeauWN0Q3BRgR3ANENHU1bwVbpD8MRpLtKm4hjHhwqKyxoFDdsOzTLWVeyWmUsAGwfAtCBYSptrR3Bkyn4eevMKjfPdCXw7TEQiRu-6qzHdxTdyEt0jJVI-_ul_w7UN2mhGrC-TIARihkeWQXREWijYgVqgLFWuLp7gR34E6GnYv39k8Rb9HySTKsrXovsa3yltu3zyl62kWjwz2xUvC9CNThFcESibBDIuKsz1VYrNTqmRCv9-R0mGKWE29ZMGCVBtHCN3eyjtk-2cz_uZEZZNt7f-pKwPSzV8zW2kI52PiB3v8wIcVmuiIz65meGXBLBnIxRuwXrFgR6kvgB-uagRkGKUiNUI9kvG1DXl_vHGvh-Z-9rNOum1rdt33TlyI70t3WWG3-JicAsRPfs5n3d4Xm2D5XGlLEKUfEczHZQr10BO7GIOua4L1dij7HtDFe7dP-BbP0qDVXOWtCGPxFiO07rX8bnlMXwjK2_KcQ7yOH28NXYSNrlS7PO6ojhbU4v7gYLT_LKtitxXVhTJ0j_23J57v7ISgu21XfVEoxo-A1tHLofI1xTIEvgchasopRBrF04YM62luY2HroWvs6oEP4uLaLp9uxLZbXLvIwd4SjtvUHbkWQcQc-Ij0f7SheVzT-DECw0tyHOAUPetjvyJlDVnXsY-a65-hljzbuuKfSBiL3grCNIHK4Ia_AKelkrGLrdHicuAkuj_v-jMK3FGHR0xboumVMTZOM1iqkadnZB0Sp9gXD3mxseMqKVAs4DCPYYv9BndgpFlBzNdIpwZ4FGntKYaRyM5Z2bnorYDYHMxIj02uyVbNlRKwD2sogk7RoweEMx_HvpHzcsZ_GfxgTp2JsOdGzEcxZr71Fb6D0Ob4r4mVgnxVk_R4Va5in7DfLXj3ejrX4vdrpwSE8mQiEsICGLf5ZE1WxcFNDAzgTBFJBP92Ae0ulg4-47T0rbpchJomEyqZYA1eYCXeQ-0HO5tOq-pISqB2r4t0BDdxti3ROwN4HIqi7UuUizDFOiOuKh-yH3deXVQoUMGudCOQpXQww-L4a-CfWq7c7Ya0eaFPZRxgOOeFKzItsphij474Jj_wyPNmls9_gVB7WC7BaC3q-_T0BZTHng3u0_19dnQBDdYiHUM-1QG9B7ZO01KkXxSpF6N3O_LMYPID78BTSL6IX2YFaae5Yn9C77y1zPiAas4P4Zy2TkN78HHiRl8hkzJgqi7X3B078Fjyh7264MdI78hoV_BIULbHJnY2JcgV5TgHRRugbfCXW_YzaCZE4GkFYZETZShYdXIxB1ovr3cV2HSndKHQG5kPoLGDmyaBtRC3hXk1maCeVWnJ8ZV7bk9EeID-hrdwFWgZu-XklPGtEPf3SR4rp02XguIuvhYUA1UVU8uIK6mbGCi8rup5O1mHPmegipOHsCSxPi1LX2zv51UG4mptFYPxrxAFZgwd0fWojmsSd40y2hDrmQ9i8VCd8kiABk5lkOUKC0sQ_40-2gnMkG_My89Uhvt-hb7F7GWjaAxcKzyrrQAOSP6EDomOh2n8Ex3NO7Qj0kqiWgfWSnuWjrkkSnZBx5Cz2qlDAxg5W50jGiEScAYD5g-0D1T10vr9BOue7TsLxSlLge6WBlbP-7QvBCkDctaERRVtZSg-4ruzVD-J5g0fh5ymwCo8o7UsBPiwRvF28ZwadDPeBRF4G7nG73QcRTvp40hcqtjAslWoTQSXRi6LKgvGXnvOFZIrIdWe3DkK7dsHfSenIBz3TJZDo3Wjf4kN7ZqgbJX_AKydlk60jTVsi4T6sGORP10hux43GzcJr0a1qQ2wwDaiyYsS5Qa98wZsNiCLEPqC2wSeOsmXVJHTb3vwty-3ofXEPkxOdSwY8uQIHcyYMXyfkJ4BNPRbZLPnOdezO0J7PttAddHLs5QpOX2oUqeFwJjyIEWyD1FBUfKNs5-5j3wCgSnfa_HvshFk98_krSxr4GHDmSjIpvWMn79tRa9yR8gWr-mB7F2O12UNZReCIup1Eg4_gzjiSDFux0o84WCiqiAq4jyn5METL3kEiy5StocdWw-sOoZqfvEjWiL1rgZOvZ9aFExhKizwQWScLW6U6fHgt6z1t2H5B0soRvuEIGun7HHOQTCV_JgxhcqZG1s9DCu14tku3rQgtH8CwetiUI8HLVNOgUcWROI5t8F6NSCceZpn1bk-uMH8BmOuhKsoD6KbZkEjS8vDnFGDA3j5AWifJT8zA1GnWnltytNl0I7rVgLYB5C00tT84B1NQpni4ok3gMsGZts-M82P1nVhMhG8Udee3SeXELjhOWjNHsE2NojtBAt5hS7yN5GHcvCg_SFNeU2SLnbpErpj98C4biKBHxo0FKzLxrhWPmRPBPXM_KVRQlb_2-lqpXEb4QXH5R6OMO04Y6btIywUKgMhAintKdZ_wDV0pU5l_EG4LPL2WF7wI-0eYq6tTliV47nwGc8Ks7QOkPEtrRx5h7oBufcFTPIWknXq5DB127n0EfZ5A5E1DBOAW8-4xPUsyDZRhonITUQVmVLV5Cc947cpUWWJwJicdIldngHlA_k9AhdwKwarNFl4UqALOG9SHAPZD9_I1DYqdv_f40C7v-CVVDwBpZb6XKGkfjZcI6eGcMuTzGUH79VHZ_wGIiU1VpDl7UMqQaodPxfSyXIU7Twq2wMMBSNwz2quvCBboCVEKvXH_jbunSDyd6H5Qgg0L3g3TcAZedhyvK8A_Jl8Dw8_Us5UAX-2fFCGjldP9LDqRdqeEXKc-ff_7Dl_yqzgGB0T8plMAyIwda03kVnhyNqF0QBJ8Tioi_DRsykA-CusLAMUyy5dX7b6OwAlXzFYo7izQ4BWXsTjLkI6xftByHlpLBLIaOUSG789QdCyZqpeeXuYx7L3TsohO1lf3WILIRhKzp9ousyFH5wWPY-1iIvuvpHHUNlN5_jrwOD5Y5WDzR8OwzNtO8q01yjmcxa82Wz7F5lJGa49ZKDPCt-wLv_VCe6VWGrDJwTk_dIgfGs_ZwWF_YQfdaReTZRFELKoBN5goQyzzMJU9r0rkl9VhjWhYizmxjAlfduxheR9o387uvGQbYAsJv3_qoe2qA7ot8mz_6gct4b_mSNrdV2aJUkzPDP3jZr7KeQt8ES5yK8OaLGScCRAAasOumMvKZT66ixNYxoo5SkgtKF7HeV8siUspZ61wKhYqeL_gv5inQ4Hi5S1Cip7wMv9qxMxHJ5x4qvVy2JxyobIY6TZHNlRWN52QPdbJagTB0_hbMWJeT7z7kK2gNLid5GuOSypHeuz4mEIs9iSIK7ooeZaE0MI2XK6xsV0fmH8rZTbjXJx2hYhYhcjvvrW8JXFORayI6fEX2OfipIcdJNQxCfC0ZpqDynakNG91u-cayGMBdzD_QfRPDhrItyed8ElNj3W0iFeVhSqikArrwakuJl6JOaxWCRwSy4c7ql4IXiWQV80V-jiUwGKGhLzIAie2O19EgVZ9xzZVW7OTJ-9_V5S_ptqb1F0jIP9BCpmZO7ffm23VwXLaVEQQL_oEC0V9gfJZfc6Rj50kB3D996FDCwTJwXOqWTlHhcy1GkYIfEqnHTgk4fS0WMuKJfPE10EWQddUkOdIptzJ9jFa-8BdepeTHVVJKndwJisq3O_M-aoLcDfQVdXvQOgA_0qs1WHy3kl47vLiPNYmWhAZBJinfnZ2N-lQtXcQISivSPKyOOCD-A1fhCpc8AJmydYoXFTtwMDisc510LMFXbMMNTpzji-Rj5du55mOk318c6Lqb4WfWSTUIxsBuDGrRbR038VOv06wy0ZBa9o68ua3fYaObwUtbH_VsSCKWOuguAv6UV9Wj2XonW4yOCOGHv4-KN-JfVOxNUEIjvpUjomzXE7sUfHedjJK0XYF0xI5zsdFXfqfsf1qaNQgpRIgEEf1XL2z08iz_0evwIPZNEP3u_rIBCqT0Yw3c3uvTNKYShHjJeaBQL4j60J7w4nV3C4dDRPM-Y-o5bCR7HPeeSKYSPZOUGsg9qQwg2K_HZJ9dnT3yItcAQR4TYGUCgtUNpEUXFJpAMHqIkkNXO0Hng3437pBu4lnXZPjX89nTn1tV4IHBExa_2b2Hz10fo_bK4d7S0pDOfGZw_k_YEIBugbtTNTZdeIlo5HQOn0hBEL69MR71OQ-pmhwKA7ilC6sIxlLKMy3PcO-PjqI4pFY6N7ey3VZ3IawSs1CB8KL1GA1RUc0b-_VDgPmCwWRWqCXrzNsUAc2VflwljozjIlEBjxOZhKD0xxhVOMOA37ljxrXr7fnTFAKXFj-B7IPXOkpqDDwSqvHhb0YKbv1n2SElkqtHXD0E1-1Y96wY_CTrtrS_vkx74_Z_3Q5n1zaCXusNXsVxPBlF09040MXWbjelWvmwLxZzZYnCVWwnWZ56PHxgsoJDwf6Lp-AGT-JZMR21XuEJetnelq5o77icfMLk04FGhtoZrRbdtuZj__uTay8gco7UeLd_vgx7b1B96jGLMvCPtQB4X1uH6Drk-cPQz5gY6tFysJ9oFj7XjIcaEIFun-04XcegdiumISNWDijR4ynGHcVK7Fp9XE82O4w8Ya0HwAvSlREmaw_3ZLWZSdaM0Ra8bLtZD6s2ttWaR-jr1Kfs0DEp9oAK8IhURPxXIeRVHZnM_b7-pDYbcJDYix2UhiK88aoVgVHSFW0YQ88oHWiUL0L73B0dCW-66jZJO-Sn9aNh8I2LX7ZcKrIVqYPHBKwf2mJb871FL51loRZJTf5vgyRn-JVTXQcMBkDnmyv5dP0tmA-i3xEM8l7x5KCl3eVn-VCdvb2h8cUSQ3XRPkdk7JG3VAlTMcc220KSDOBIiNamYhDS_hxKmIJPRPbO8g9qSpx9dLFPbj-j5SEGH2VlJgB8uc431bb4Sr5cVtZLXMmZYxziH-Zw_sGDpE9YgU10m2vWzYC0uwADtEi-kiL_T5M0e6CyhnhsGb49vys107Fh8U8TTwDZHZjTP-7Hc4W2dDkcpbq8YlfENVMAvbOjqOl6DVnfSD7YoszO9ZEtIgpxiJcC3VutmgcWc0CY33wqm47deJPTTdhzdjC66DtnP2u7DYVLn_7O_8UO7CJKd6yy21AmL0DkG92CXXeg8q2JuAHjx1GI8EVkRgwzRF-XvatIzQokQjb7dl5qdwkyjtad6r77gURQ3OpoR1CEaT-sxdXwqJ-sABJ79dKPOjJ-gwi8NycuPhEERBqlcOJQLiGhAd0TA5MJjZuHRgVAcEo0ghkfFHOqhaz0gNQZwrR5MQqLo7iKDw2J7A7jpFQJ_ZURCFwMarRsqUrJtMIHpVRzyy7fhB7eP99UsRJDdKeZWZDDQqDDADzfTxKi0Q7B2Cg_dGrGemW7tIT9ZRkq81EMD3ZmKfhe4ezn9uoPUIP8-VQsWWRjfJ259cjp2THE_4xki32vaM1lvNGV0lcFTvswbcdzFbJ58rE8v1Hdpetx0z32agnkG8HSJvRj9ueSCTSbi4VyX9N2JjxMf-f4glWAyYuPKjZfhVwuBAfKsEJWtQYjObBBHvVgvYixxLE_ZKqOCed16zB8StXtZGdz9pNlO5i8aXbNRCMEyLFxR1JBFVi2CdMh-JbkuODV0f3WNYzJ8lGAtDvVI-SdEsFHgFNTJS0Or0SKLEt4J4A2Xsq9pgjQW6PKqMyQGYbOiMdHnNA2wIvc1ufqqt83mdPUMXC31efmDgM0b3TMZjNPoIWFkup8eX0MJ4zgH2yEB-FyEJ5d2UJdh-c2ECUq3FXXdVOiu6q2btO4Fix8o_UQr54_fc6DdHHv7Pnr1eenVlibytad1WSKohns3RJFiH5ZZ_6bS3zBy1IMFzWx5wUjVnCYKXnJiwVy0gcRT252eKoxezSSRbs_KCTHobg8Guu77-mqq_zlegzAJlm4wtl4S7ratsLp90rp9nl4m0z106CSm0X39Tj-KCsOPtvvPkR-B-1ZcjsvFcvRLv5FmMbzwSLCK7v2xEITP9LTaUJal-aHmc13STS0tY0ycrqDSvWu4ggbMZX220UetSMvTmOYR-CCkV99L955yRKL0qikLHrT4iF0IWMlP7GeHaDstUnlphADmJAdVIA4QgcLftqnUH8Le5Utp4kywQws5ng2_LUZfTLT85_4z2iz8qlDpf2K4pPkj9NOhSUqWhc4WdIzQbh9Bz7H7tXDjEcWB-7rkJcEfQSLVd1lVQ8FotEzzZ9mYWVp4jWRFlLEAoRjE0OziSH6BIVjrqRPhHZtSQmJGUFJM-F9F3QqfrlyjiMzuuVYc-4sN-KvTg70S2crYf3PcOF4tgkjSsifKlhcms5pKBaE7OpfYcynl_zl0jhneKHn-L3RjEddXX7LUwsm3_EDhaPSlZIlzZtFPHKHw5m7lQIIvB5T6DjSPJHqmnv9-x35SXX7FxFEYQcLbyxWP4iClhEuVTXdojt80-d-GXM9r-cusCjKD7DFFuXXNxs8bwcm_lzBXDkBt3PSf90-qGDmNKKXD1ozDcsOKWYxASJFyJNUqzCnyIb8FKx4CCtVcFKaU8EBbPXtZn4oZl0iWiVSEhWoAIokuXOy6ai9hQpqj-fUU6L5G3zUnjT1eOiO0VTge30wUltEnWByJLnToEhwru4ospO7FDYp_wEKcjdq73ajeiYvZRj-ctKwQn2X6_4QQGOJeEtC3SAgPekTIePUBvUxl1einSePdOhduuTCJnIQVHscFfliIs_WL5H2c6xmtLuOlJXSEIhUXYn7igCAduu-Ny21yZiKhID5XXW9JuBYhhktJftJvrgco-h5vPdcC5iPDIPbqvyR6KxTBYbqKbAph-k1QS90FxC6_Ei0ELRg6mtbwoeqIHyhLp89Mu8xx3tsZ_iRsrDtjJl0r7dC4W8CF5MT19e0mZh298SVEEBPhWuRyXVXhIV_loy8w2u4wj2VyOJ2gd1e21RHVVyFcUldWa1XbrSfiegIRmWZxGOqDL7mRRQaEfku1m2cACtHaZNivgOM_qJTRkcUM6H6PAf4sGRQQVCDrYVDGGpqAoHKfuiipyatRCvYzESQrYZH6xA4SV9uRGt4k7HGPyiomOfZ58Oe0gRv1_QUX2Hudos37IfhncMna7VdK9QRj_ZXlWcVkjz7tIPcyxLDkzYIHf37g6W4FW9xTAOXwi7uiR-OpXj7tSmK5yb1GvnjM7sVj_qdAX2M0CMCUEXQRzLhUf7xqxWeHALfZRkjh7MlUyLqE7i2iCoC1JhtbPLnKiA5D2qMgZM4CeX4IuRN8M6djCfo0KbP9tNw6UmOe4xb5AgvvgS5hdx2ss-2muVOzFho2zceyoWqyjIVI2hbz5HorG3MEtCvBnYFH-_V37mYmEPwMdj2SqG0J0u-lTvmjxOQ8j4Eba8GGJdZObL-vVRr5I7foh9IdfItOnUaqrQkqoXSlCINLoBtbxUJlXqSPmPaKj0W2NH3qnDCU0KgnEcKoWwT47c1V6AClwrKijki0yW7LBM5gXMVHdyHUVixxHF20_dKKR_i9n5h1TUojfu0A1eoPTRiAA0JdE12xKI18dOXR4UJGeUmSIdpDNTE5sSoT5MmebF9cPFiZkjN-6pIJA3oJIx9Ium8_Jo9cmC731fkBc6S1rQ9gRNxB8Ku4kK6j0oOIXtLX3WXcm5rB-8h9ee4mXkIn9_6Ff2FDqWcDblKO3JSb8qOmldWZyyF4GTwVw2YadHOoq2fS9Yyk_KrY9JehctxCp8p_JEIcH3T5YLKKs4xihj6L6Su5HeIUxo1yXC4USUfNmLS6nQuRd7pOUtVcLBuXDpMCoXPqYTMIEzU9gkN7EMVKohDRaGjva5jxjA5OSUYzyt3gafgvNjLy7kM_OvT2qVEMmQimLrDeExWKcO0DBJ1sWuy7Z89mP7Kvv9FTPGdv1hOAElUwuRFFN2nI3CsxOcmUqgN8UegKGSF7-3zhTBI8xyYQtrbGOhLiP1InBOAewRWd7aLLM_UHOuNQhhY7vqTVENAXEjeyeVAd4rh3h3UBCANuwvYr0O2yMekWwU69nU_fw7aP2Yo2oMiW0Cf6XVEOXtGRsxDRuaLmwpRlMJnBFuTLrBKGWGd1U7ClemtoCKmt-0OHcvoLTLMIkEN7t-8Bw70_ZN623ksdi2urpxAzh_2rhkiXUppsBMfQrwnUVepKLtl4z_d_8kcUSJliuFjqKXhXRH1cQDjbuifsdCFB-aXZI0Ar4Gvlk5CweHVBDhiw3qfiYRbRx33dsOjn-SikbFIukL9jfixOWuYXH1tnr8ObXfibmwz817p4Y128IU9z1M37GJUFseWAHpDqgxXXZBkBO9gMXGq30-jB_CkdFsz_68HSJ9Xl45XKXghK57vu3-9tq_udHpvtQm0L_iOb-_7IZsFd73co1Dt1Eub4zGwXVmL9n7_DcDVKuHjPJ7hweDQZU9sArx-ckgRQrgPeyHDvjVi5u17ju5hJh8Y4cdHsySsA1Pp02zhSKZOPpXN0gewa8b2cp1wRr9T-h2Ht4jKoZfFPy84D5TkLMpcgt65Rn9mBO5KL9HQG58hTUyh6GQHzsKeovJIW0ANSdZzezCj2wL2K98_o59MFCcb7ubSV-wyj_kEcf6smd0sDN1Fu0w8Ea7v1p6IerVNwyDD2uSvJeOvwdblHIGkQXYGVZ7HrsKgsz_sfmYunkbYc8b37KJ8awqa0fRrijMhckDzUuH4rw8SYWAsIRADV0C-RSlYWOjbK8vw3U4wKdEeycC1YY9kHhJogrU53BLo1Jl_9pHTsVyMz4ntBEcass5GZATtsXsg7aCjag4WKUjA-sZhEQEz7aRUfFlNlDSRNNK8p662Nu0mnxeLWJiKSiz_GpeZaAyyzbxP7_Q0j6gPdCe3XdAoASPt3X96ZpBCpVe-YJOljq8KA3EZrj3eYcJWo63ZSaH0FEtN7wdLJt4mmqyC3BbTs8onwGmbTbFAubSLLKo6GmHy2WksDA3ODfFpVVKyK3HSQyYXpJReAWNbh94xlcXk2OvyRLgnSlGffhT1WpczCiXGxOOg_P2XO-JsbJMOcELZhoses0iXUdKLtOu-kUO0me1sL6CaFL6m-UUdWlYyUP2bWvHavxCpqB09DwRflfCwiE_nbLHK9fhq9oG1hBGhOigxRmuhXlpXc7xyICgpRJ_7o08wIMsT7F0-AZTxB2WVNmzO5bYCTfviw7HNyWpswfnbGhfW2pbEffOAJVL5mi6DFEEtJxQY2FUPM8RjxInLGlOe3vr3WVZWqe_IPFCaaSQmj-1FDz1saSfIknQ1qUe5VR1nhRto22oo7xrRIGyNawa-DS7VUXVaiGPP6LIsZV_54cyNJlmwxIpal_s54X-NtRMFPlcK-T6ovhB-J5yDpMipc4RMOEw764YPrm2f_EdUsOJ58FLm-ZeUJyt8-cMRf7utcMn32851wZHb2RWE2jPsVVCFDrOu4o1NuVh-dD8q2sHKemjF_gsUBtqyZ4_qa2vmlSvG6hFU9wpu4otGweVCP9DLtbRUmnf50M9sYBiOTxP7pQSwuI7xHEE-aiMjxO9xNbbwp0SMTxcZnSN04WpC8_48Tcmde9Re-AcEwwX8b7EotWm_RsXkjyC_X36lDGOOcP8GaLpUTVt0M60dAqh7jXJU0ZB6Z3CWtZeYGj_DOvrkyqJdbCsPV22NJPjNEIvUmFSofZRMoxRhoniroiPoHrGrRZHt4GIQinc604mFXFX95eerj5yDpQroOTwRKRRUmsdbzl_PEt-Ty-KxdUGOJp7BCYrwmyaAMLbHSdyFVzVk-10mqkGzAJ8O_In9UY4nbQVY_emNzB2u1X-7L25mAK_PlQl1iicG8bg2L499GgJ-7T_uE5OMYzoo3L0gefsLggW8myYO-C5uMZ3CHycYvsrI22aDAcVBikOkMduX3wY7XvBwZOuJKCeD2ik17FNl1LpwR14Od01Y2KcV29IHVgC6MPIJyKTDxc_NKmiHBVI8qUar6B2dCSdocWoHD1eqJWO_SDAaRFiQKa-29pI0rMcJh2AEiJEIz4gmuiIuFsK5dWtz0aY4r7_V23Zm__zVN8iXo4j0OCIcoO_5Eenqo-aHpSIx0GGVkGQEuXwiO1c2WNkSrku12mo4SUPs8VBrDiq3GOpQ6xcDhtYT82i_IF5TAPw5xqmux84HYEtrBZRkMQMy6u5RX6cMujJlU9jCFsNE8iWyBcMQWJF7sba-1Z6yocROJOPJOF0wirqYRyWOhD98zZo11ab-gSU4ohf_Tpxithsm1jslK47qsSDIYKDtCpKSiC2ogqQqENmNtaeuscP125fvQfi8KivlKsMnDNTwxbh9xZY3Sovbh--LEjyuypDmH3w42M_qYjKmAEVFQSLo2KnDzJ7Ix08C_2uQ1tYgOMAJfUCJ0Ga7FwsOSyjBHKh5ljSIBV-MJOod-BwiCR9nvxYkAsUlFYR-RbNV959PZmuw49Z3unEqos6q3JwIlSY6Pjf-9ab_yw9XIw6ewXr3l9ezAjPVT9KTaSCGQPc0mdGctPsdM9n11_gFV85naAIpEizUqhaxrLzXN4U9Gh2IKSU5hNPDpO0iiegMiHM-X0k-OiR4lS3G8y7C4WxW66V-GFCNS2kTBfNAWu-tFFC0APGvUjZjihkRoBN7vL-zkpYyJwRVh7rpu9TGieycD6jolavYe3mbzbsH4omwNc7zhp5Lna3seuPrDlvuFCQ1uzlinL1PTOOZut-bF9YyHrf66eygBtTRTc6aTppsRf3j5zEbWajnxzKkJvFmYEfZuSmq-r6j9K9VzYofu_znjAIB4UGGog-cqphATWLtVInUWhStwEbXJz4iw-3IPvDh7W4PSk4RMwSeEKoJJObEX2XnNeFvKmPENNFyokXsV3dy46UPWLG_eHyugLBUKEwEyvhcIijn9OgPdbCaqV7nVAX2uW9jt_oIxj2LMw2TlgSR0gFsi1R57lJlDKeBorfd7CwTVQbTxpuEo1Zt76wDUigg8OWXXZ0Uc8hNv3Uec83mhPQSojlmmxe1DmPX9s54Yfoch1Vkxww7OPYMsCk6in1Kj8LXgjW6Pjfp9QSxRZnUv84cCWmjXWbYEaAiGZlBurtaeigw8t9BMsZWACZIbywaARX_kulIAsFqtUFfuuwodwWxXedZmc5Av1UH6163fTgfnnhnCMhOtFEzDXFeeLoijyx_JZElfEu2WnDejIWTNo485XPRdfEu-WkKGf-3hHcPpxWHpOI74plahEAuyWCOLiNn4hLE2l3dOYh5tw3RiiE7UEeuMFD_FpXn_OGA9U_ohaW7jyZf2dl8Kd3-m2NcBLG4HEB28g0dAzWnShN8y9gWTtpB4IJm0fOj5yoazXJo_d6hmPZg5Prv6NG7V6EH5lH5UxxDQZ6J7SQBu46uzmXUr4tUGL5JX7fpmeG_JSvgy_jOZMcuvPUojkJGpym2HulWrpLAb1zatQXEQdM85zp6z0mInmvc-UWShBGVU8InRescaHpnQLXM5Ajb08B03vgvZ5CnBos5gEma5VI8TmGkKWLW0cGT55wgUVoMRm9SYsiEIFh5alr_m6YbrzpNY2Qq6jNZREM-uQhvrgpe1Lv7ro8sdWVJD_z4V1wNY1SiN2Rtu9RNS5iev4s6_asrepjD15IvpEa6873KlBNY5XKVm1FyMHfdyKLxX70bmyjx9YndnH9fwSe3eyvbp1LolNOLdjzqpCabyYhRWeLljR3tUYfN60OOIn-uxLvj4wE821BeXEIACZ8aYN4dYmFEWi6yvHdd7pvLyZfcWqRuvVh-rOZB_r6D2XLUrqIsT9JSs-zs1cEv27mRAI7Ds_3TpsgMhkzsfc5VdJ-fBJxePJyW-fJ7-_b4Q8166gh_dpRb2n6GaJtk6rvzoDc2hhAltRsy_6yVxHYlGdSkajws-TR4vWlTLVGYYIFVZAmSi1K5SpKaDJP1-oCeDpiURRbRcXQnT6XSPo-3qymWrXurYvCVHVc8ulJEYca1rxCp_vz09lET_6FBCOytlZFrJxftGBxQqnc6V3-kkf8W9pk2bQ8oFydApp66724SBt2eNG4nV5qcO70Z4V7zhlU60sfuej5LPYQt8O2YFuzWVJY7R3PX5jjSUmQpFxqQKypzHbT5AF4xXxKsnf-ZIkyNw4xSIIgvBbfLKGDvv3gwmv3LQTgSYlSzN77iuSfmuaq4EOhM7-s-wb-TGS6ZleseJERpAZaobEqHXqvRSSpO1dGm5PM_wubD1aueTnmjyRrNTQ6LI_z-bk1AvKg8NvFOA2D1H4WFxmgDXoWO2SJW32Z0eoSN_3gTBpEjxNgUdB6RkZaFTnVLOtdQprlkZ8UhefufRlyjvOTG3blZ5CEzmwELiwSlOV0jdNLTyMtYwjCbjE9-p7mMKhCccUClk85j8tQUSmPrT4QlvTsg5bs4pDRunc4kvfz5hLmctTLWiKZu-DMa98iLudWxrb6aYOh6EP3NjKfKx_eEOirvtvl6kGFuCyzNzvzDX1whX01d-2oUdk8i1X57P4y1aa7l0knL05ecojU0_ThW-zIQuHxqhhShH2LIzn3ayArmicFCtLeU1Q-PEBntXmKowZzzpj1Bdg94r6O2vnnBwwNRl_4bEgVskj3YpzmE6ivImPjlKFJYdcIiM3ahqgIrf0gPyq1iys5Ctue1aCmz0l6-hSj0_HAnMiUD_3-1ZrlgwDQD_bbSo4fGBYLARALZbWWquqbEA7kYL1QvCRtaBpRGbomclUcE3ALzSySz66b3Xe5mjG-HLrvtiKrbzmoU0tmhdrJU1S3ipAHqRXiJrB9scfGoAGLGJcjKTSPkj54MoSA4WbO2wIBKuz3U-eW7dIKyoJe058W-SKatfMzNmX31JAuzmC3paSpikSIPxF3stjHr1lsz9L5jMwv5EOoM_Dm875SBZ6tkLA9GlcH1Jn7rpIUBmTbuWOR5cXAMWZ6-a7YHlsmI_tGUyszxvmlAmcVQx-TTz9lJZbSu-vbf5eKAlreyLpyCaXr4p972REuIWr7PHVLWRFUyFhmL36iFwuS5KWiadj1k5-6yudqTDEvXiXPyeZ7sYdGb-X49sbrwWFLapwgt5VIZ_GUJbyIyecce92T05VxKAQO_6lyQjL0a49iKZVO8szGeJtTZGid5GtyyUK7R6vUuo-1GVaSQcwVNa3murHfzKcW9iExpwsVwAL_5QPiPAGwFIyPU3V4H4Q1R8KKKxMTdl_0yOOohA0bUWrucL3TNePMvYdIYnvx-0WC-gxofr172hK6b6XA7KY6SS29cRn9hQTKaZ-ia9TCDpisb8jQbluiA2odlPLma8XIou017MUX-S6uYMEW_Y_ZH9LTWAXJDEkJ18G2HWhO9v0kcbE5NghgfysY1WDqr0qdl1Ftbqhcnqi4hyhNVizrGFJH7iIXEYVQYX_fgyRkh8HlOzGlvBcCqPAlzKgt0DNsI3P283I4X5SVVnYl7ObkZNOJhYy2EtX8rjZQAePoiF1Sv4m3ZL5vLZZczcO1mheAWfbhqNJsImcHqvBr7pHjY-SCksJyfkGWLyA3weSuFMdTF82LqvrQKRnsTuiryBsnFckM3O9st7x5R2nGknchCjZkfVl9C2yknRl1nZGnk2vZxbGe4pgq3Vu0NXnPPsnheV7E751k80Mno-lKXupjpsr1fXjsxl7E6rwcM0VW88hA12AdasVO0mx_1GSd_z5r9LKp3pOzhkMU8uCgC1rYSV9_5vDdSZR3-hEEy0QxY_82-8r5afCZp_0kgHLTge01QxP7h8YP0dfqG3512uJEK7oXUtserN3JvEMY84vPqLSvY7kNoGC2QgOxc-0xVtxKJJ_ETg595XG6I1RyIfb9yj1cJnzx8Th8oDR1fZwc53JKOWNjtg-QduIDsy_uV4fEGcawV2GVqz473Nmgue-L4PTRZhBQw5ua2AWS_w7KKE6EBMKm6bsBDOTCwk2tLiJK7-xilJAkUEPxUbgHzSf1J1yhO2prwKgrGx5d8RWFU4ua1Rwxgicl2hNiGjTIUm2dG3vaNS1urUOk7jrZlnn8PuNNaKC2-N_irg7OO9LJdrbzuYXG0S4954FE0tfvg1SCMTUDzilCSL16g-0MlZD7GglzkpO10NVd1IVO3nYfk2g8kCgPGzZuo7d_aktLF6J0sZE6TdMYO09k8nncc1W16elfXSpyicoOT93vM8U210iojcgQW5OJ166uJoljHQ-0t0OtsS6RYuM0QQtMLT_qReNQC1bvFMw4HyfSG4P04pTvXpPs9BGQ137CsYt_9i7yDWAEOTj6eeFp28mp00FDDGV27SFq0KpYxU_lNm-G1af-a1IMLVXaQxRg-QtLmZMsAlbv97eLTJjBVTdt7z0hbnm0SntJZiQTxVcaSoPVw1GHV-L8eO73K7q7IiwwbqnebqZKSKKQf08I6xxfKTge-KQMJdeY4vw-rspGwKNdKbR3eFRRGt6SvhbnIkTl_TQACA7XDY_FpVTV7WeI7eqHOHUteZCFc882Ng6fnytltv0u1orDU64ETBkTFdI972GpKOxNG--hAiyfRmbKrYq5jFG56vrXBK6oeB87qRIj5Gq5b6Zx3Y_Umu86nnrCg8QQNsATX7lCmeHeV7OYoWYARW_INNsPY2iZqgxv_10x0DRjmFDtNOechJAhrmmqf03ddQO8-siagSNB2COPwJg8l4vOKSvmtqS3R4IGfN4ppqU0wBsi5WlDLH2YzZ8_b9mtvWMVVw0KJkff62wYVM5-dX5u9_hTXWnvbrE563s3dtOL05fQR-f20hb_5U3799NjuiTBcfbFaaOHyocIxJDoaXBXmr_3WwkbO1Xqm8VOoeJ_qoJdHuJMXVEAkQ4U9Lh3g2h3cuV3TkjyyTKl5njZ_rsRnCH6wKFN078mwvEhxaE09s2i6ucLm_AIEoz7Xvs4NubZYgpR82Etccr0FHFmFcFVccOtFjVhRP_YvxUn5ms7ilSRxMnKliP9YFk_5jjnwycl96no8lo_jDr0fQpGkqpGPkW9qZhsX91y4SnPSYiIxymk8-ZRi0Yo9LF1eE3c_5I3GWH6VXjblq7Ga0wx7TWy_X3eO_4YJ4Hv51S_KjbP56l6-HVICuspER7qlNttSTtnlOLgC6fLfqM6FnNBc0kHopgVsscPVnyIUSWRD13ORXQEgVb3kZ1sGj_NMNIbB9CGiMd13-1IHjGfFfX3bCdMQ2NtomXSzdFCeFyyA1vOUlby2rxMc8eQdpgS-naGewZ5PeqpluvLzCP1LxyfDnVSEn3a2nim9VJNrhRbq2bKNjk4tNRv4AmRo05nYTyXwCkIWXv2_cYKRxD1UYXEXHwe6otQMU-rxQaTrokKkoMb4x_NYSroDgDH3xOBRNyAp4lZLyfhI4bBGbRoVKHI23kUO6yjZUYoTeRjVBGadfxJYfsI6rJg0CNUejOyx3nYBV_nnshwodrGJb0e3f8zuvjMRPYEd8wYDR8urJ8xWUzvbUcM4lUTPyIUjRGUnOrQUnhLlLswxzmzHn_O99iNOYbZO1jU0X3m9NNslraph8zZQjX4H46az1bQNCyPBv3d_N5cs3p94xT2yb1Z1SG9BUiUp3x1kPTmjhdTTfWVj_FTJKHsct1ARvWpEcHda6GW_2DCZJxTGwkwzxkxDOqp7YRLxJa-0fuTsvuMW6az2dWgZ__eWFuY9wNEx3GbOr4mt-WyQVv7IghymYPIbaMckpqteHoeSsZ22fLaQmpPoNUyPMlF8SZUej3I2Kyp9HU6ic2gQTsqlXttmuyNKMbB6pbcXB5bAUTciPrTTRyHvi9tOYxKVo4vufAcFzqeE7dDlf18uExUIUoS5N6Lhg15mhJSvDtzwvNBuL3po1gOSnOQ6ivHDTGdYiOmZsbmfogcf7m4WKmUpAGHftZ4pomvIHNJZz-I7qYuTfbeIw0jWLAvhz7pSjN19u7ebVb5OdWSUqI5Jphy8tKpm9cptcXK9KSScrI8uefMz35tjtNVlWf_OmvpPmwqzrFPbbN1cw2i-SfPdawuw_Zz4zWRucbEnrUOURKQrVwH5QlziE1qcDKpXWuTy2y8JFzOrvq8EYddOdVMhmjFEreS5CAPdqbpyLTsXlR3xbYrCj6fT0P7MkkKZd9NlDhlJdCLEWmRVgHrncZFrkljShOIfRBiVMMjjt_50OFy9ykdw3SNGa-6YXCP0DsTRUU8b5bhvJSLCtew0cjmC9FykgwEt9bgMuUaB-J9lqSoTN6fI0Uy9uDeNmLV3zEAI9VsitKaHib4Gbe9dtUYSVF-0kRH5jyMVd4VUN0iP21RsUCsDyrR1W2PHPI0qdqbodkAigEu9U2ZOmpRU2_1Z4UobHZpQ6_5DRknKQr5G5MtXsIPYpBhRG_Tla_ggA9ObruGGVfzg1LVTHkG-8t_7Sn8wEC9HepwChPry2lUrtQx-ihjd2hCpbEeoPf9hmbrnfNKm0QGPiXKwFYIEfpoOuK_8cFDvfrMU4fLCbtt04uzgRlotnZQczlcsEUyNRTk7U4zJJf00TMqkVnWXb0dbmwGtNu11bHPviR2PvfVIrZ_Lp7w4tJVW3zujZokaLH3rt2kyspFhbMD7a0jYWsUB8WwFU35UkeQIw62Qpn4rUm751NhEKpRndeIQ9NWPlIQKIBQfm-zksZ3e-Eti7gsul65sBbMeXJxyfl8LFyqvVIvK8vJgmA6s9VkJtihEQ5s30V6Wkr2p-gbsWsoY4W4b2GpUMLMegnXDrbV8Yk4hM47OLy79EVmzKnw_bJjU7tW1JMI-H1cHuhjsX39pWGR3ezjDRipTV5iZK8fWuvULJnX9YNjUzXF5vhVbXrb-HPvz_1xoQZnduLIH6Y9mSW2laiVE5stPzSvg0Ja6q-U2BL07fiXmXzvKHrSxH5Ldh7HqRWcmdjFFXNhDW2N4rETSkv8cMxx4CjWWCQijGandYm9tmwgWLwXsrSsIRZ02MA5UbXNRe7m2JT3OHkzzpTE6khOPVEvTb6xDnF4w7ntGQnce4zYeSfbFNR9v_hG-mIYm6ub_oztXJYdbMKrzgyIknpJU6YMPjdDvRBecIB0UfqwgtpVZdQhoa49NKm-2oYM8MFd6-O5vKJP5cOBHona9wLbmKkp1m6KeKBFfbKnsr2oYxoC2f976ASJ4EUt7vzHblNdsxCzEA3YSVVHemTPPJ57paPudlTpcx0ujao8DnoQGsCNrSOmPjCWgkuPY4Uwa7rDoFCQb_vgIvzoMjgmAPGz034L9fyWP7T5GLQVhR49ZIGbmTyS2h4Kuk7con5oJAvtW_mQ8ku8LWLAXJygxg0EJdm1YlNJxcffJeEYIUM5numyl4vb9aDE_eC9DWZoWe80O_k_Iels2Xpvfyuf06DU5N_l2Dhe5dOHm2Z__noeeRx_4E2QajplCeShDnPKEfwJiwcprYgnUfpSUfzd28cyNWTHyjTnXao6zkNc76yBq16q4bt9GbPAsHeypIFaX3byO_Ynyyz72Dp1af_vQf3PdnpqZ-KwiYsckAZaZNJrzmbMTz7GjrQc5UOKVSmm_2wEqNPxwMAsarR5WTQhw8DESRmTbtDG_eGNUX6Rs0yqtF3YNZWIvsO5mtJwzzuz5ZEHup2eNT0XNq1Uu8kOaUDDrkO0TXJ2GtdAN0kllpGiS1Fpydv3qbq309b-TApMnBrB9j42VKHSsfwlA_jEdMo4RaK4eY518WKHuub4Rh6aruP2c7kzt49IQ9x-PLeale7qXaaJ7e8e5cd2IS6IOhiPPsGWWlF1QEOa5tH0Pb700ydAlE2Qgaai1PLUGF3C2HJJ3DZ9JOPc3mNJsJRWj8bgtMsik6xZZHE2Dnpzl3_1AruvLCcoatn91SoyMAIql2_2KcN3SQFdszDoXdrwbZ8T-HlIg2Ev1ZmPDs3aq4tEGKK6rn-jS3BEMcOf1sdQQH8A9ReESmxLpHyhbZixJWeGl4SmEhHf-5kQGyVxZjrpaeedMVDvGKcqIMOSqulXlZrxS9c5ovRo5Tp8n_OL1G0cpro_aFFgw-IPoYZBX_XE09zscWoB9z54tJBpe8VmFT9HWEKOnHkhVNRR57l-OoTc3LuKU_f19GdNMzgMjZCBIDns4jea_qhspE6Og6U4HGA-p1wijvwgJV-IfdNyGRVx4XPYPnPhqSzGaqr8tmw_8F9f8ivvulELivn2d709xoLvsDcbtpbcxGGur-EO715LOrvzPuY8tafhYk_VJAxmCU-KjUg7qznOKR6vSIfyZRi3zu5Jki3zg0__X9Xyg9k59ctl9XVT7QmgUf_GqlPUB0m7rYXELvUJ3DhkBNUOX0AD__tTndD3QkCKncbzHq9Q2-uQxHf-9yD2ria6jHZMymoYKP7wOfM7eraGp5lBGVgSRCtKfn9J66O4NhTd0A0Krge7x6cL55CSgAHHBJF7FeInCtahz8b81rfqgc4PPISq2xpNsyAM_hdAY-yn6YFsT7e_5ezJ9mFYRvpviLI_Or6xCgnVgB80Ej1NQO1gxICvTC4E9nZoz2dgphAF_JaccdUQ8Mzud1wGSCRoWFgIUNqjOgynLopiOkDorKrmOj5EgwdiRxV3QYfXysy37lbVoo3xuNH7t-ZJpd7_HxIrzLUnxasRpcv2ynglLqGDmT0m9f6ArwysjD2HOScgkDeZNdW8A2ZdUot99wyYQJkhfSYddyo_pH2-6upA1hN9tXgtDmwojUyHaNKxTc3liTiy55YgwZWCzQTruAvmJTEOV0nvt97wf46dmJ0m0WTIlOzD_7vZQam66mpr_kB_fUvyzUQEIrtbon-rftV6T3JPNQ2cX5aDuzuO_PLhpmJ68LmayEj-BoOudyj04HJtj2crakNb49eBVJ8kONYLKRtfWwFLVE8_Zn-oI2ZVQ6BwJP9IrF7Rl_DAR5bg4whozMkl94ALM6Frb6mvGIE8qHtw0VJnFPu6DklcTFs3yb6M1VY3FrKO2_-k1iI8wbW6tbiBQ1v_XXsffCqGmLfbzKe8r8a34xjzAD8h-TY1o_yrq6z3CpPqEcuSBpMPMEq92-RY5tkNDnCDGryeAxywQY1rbPvNEW3ScHiSqPyyJJ0N800iZjdwJ69uUPazBuoru5wWb7jRSgHqA_XquGv_-27fDl34BWx56FlICUGIWmz7XCT0V9_ITzuHrSFpEzYqXbZvFm1vPx0oEZ5s0RFoKH0AcWf3_kTPi71CN1FOwaerOE8C-Gw2ca4Y0MKrhmYdpuoMkaw7bTWnu0rEEi6AYqAoWY0LiS8NlLy6hY2kjfm6voUCXX2t3v7rqlPY6xN2O0QiZx2Nyv0DKwWp6511Ao49bTxpqlPb8rqbHbEBtUUcU5dPUPvxluinPJqB3qyRV9ygDAL6beAxgG6fF3Ziy-HjIpG7HTd9iOxWX6-WknYqFtPHwFZMm9AlAKNtaGaDJZzSKFKPCtGDPbkov0ctMA2DD23tq1aMPHLR2TT1-Et1s_SOpE25QwoxktYU96RglN_oNCdNQox5Lx4ANzUiARUF1UNIZ5P0KHokYBxSRTMV8IZR5EVLgdd4HOlH4LO85jiQdKxDB4eI1fvSrG1QAPoLRFPKHyqW0hDLxDvWphlQew6xs6GTLO7WgRqHUkxJyRo-A2Xsqxd7ehHOF8BxeZp6Ff1IRj0FREVQO_UpG83L1OSGDGs8SiYTmhIDJV5uY0hCSAvEzMc3yQXdGs3svWJFso-GgxO7sdTOAV3DtMklqLmg18gbAj5p6o3ZdTApqAM0z06jwHLEvrq_O-rOku_ceoYvPrL-tpE_9mFV_9xpMj6_YOGe_3tQdqybbpuE5SdnYEZKC97OJpN3HzX23BSVnUBjpajlAoletcDu1TxEiEBoVXPIjIQrnWJyXrYZChxrRWqExBqoVieMxBXIkr7S4Goes_TR_G4JYjGeca58F0VoHFwmlhU4Csr585R7qHrFCv4ZiHgqFRzLdauM757PBVwUcbad-TjEVYzNAtwiAyWmeKOj2brVJ_wIg9auCokmVE6p12Vyz5ItV691LM8EMqWY3hIgnagaWW9NTuOtYhZV8L8WXYU4930z7bum1-qShq7MPqSRY8I4aKehMcl-NIxQVg66_kjkoq4JwxPg8F6blTgpad-h259vBwfLNESjRaRE6NNnmDstoGDTQtEmd7I1u8c5umHfmM6iWrFsFMPdsxom2AuLmadIDAib5UunG9RITNqFbts5FuhLiKEfaZslGIfOnk92-91DVDV8EZC9VLEjLnipI79GER-ffusEotTM3yeN4EDORXZT93ccjXRFFCTSR8P5iWKrzyFmFZjR3QMc3pRl3YkNaVY6P7ngoA4ND0igQOqpjIwon7-ESNY-mRQW59NVF9fZFNTVRAbnUxsGSABxxhQ6HNWCam6LYzgjRyNBs090tq3fk1fRYco1zoG717HiTfsIPUU_IAPdiMGq-9QHtaJ-KyWNWO5nagJGCmsK6dn1_9IEeg1xoSC07rTbdxt6EvDFTlx6QjWtEfsA9H50qCsN60gcG1oql_UAsfbr_3ns26jGxAVk4BvpeYeuupOFf4B697_dCcPWe_IUahz0YBUcmqc6oU-y9bhjcM6Z0x1r1Zq9Bua2-W_hu9gF6SV3DWUVWsSpoP8UydhopqNPlffOer4KmEjqdX6iSJwjeiKOD8faRm7DNjKj3kZmRCLPx3Z_TDcBYYzDKMSkaxNBR0zyyzY0CEIzYEt-7LLlYY937O7k-NSGz0eQtKcLZncfe-F9X80-ja7ydr-dpt0o_MA3pPLIv3odfeilEAeUybdwGKVtt7QDV5cCLjtBZoRUuXfwuAhFlBfP4ca-OGD1ab_GpXq6CJgJcyJ44H5yUnMJmyyT2pWTqchbaXSwLS_f7AWE7A8PC6azkxpta8XkQGRpETRI-7aRbaliTt6Vp67ViQx4DAuUtlQu7XLKKpWaQuxBvGWJkkgh2Yuh6xDnDkjPCX2hWrmN9baj00JuiZ949Za8yZuFOHn3F23pOPV8CF7jOqwSxUV3FZrMRJH5QTNwmmkoAHT2YXn_3cm7r6sTr6Giz58GuAElM0E9DlEFQBeI_IAGaUhCNwBzzUHemVJExmKLqLnjuESNdqn6qIwy9GR-VgLwHpPmPxQL_nFGyHGpqGeVW4JJoIPPyjt_bW13o2sqiTjCXUGi5aiIn8VtXTWJIvAC4BzmRPgWvPoPXPI7srxL1XuzDLL6RLAXPwj8-dK7Uv_Fa9d5PE9Q2I18yz6k_VlFmYEP8WdSmSZooDFbZf-EeXEWXTOo-5CppeLZJ7foEvFw2bCjLU9tWyWiIXb1hVFIfsMG6zRMBjxe7zeYLJFxxVoXuB-4fEht2srDR5xrEhFLkJl6KVkck8qxakTP6sTogMHzYjDWR75TqjwMwBaKicoP4NuSgmYrHzipc_Ke-gGNZMvChgGkYygjPCg9C8E8TdcT12UZHrzFJm6uJvjojQbjddt-p6FSxKGCU0zFknZZpRkArXtTePiHt0t6nRDB0Oid7OOznI-4hQsagvJtpAYG-OAzr5E9w917GVzjgLKx7_xi9TKK1Kw7vNru_kOWEyeJNzKcu7psMQ4z7p7H-R6ee2LKV6XDHasy73zwyV3qrAUELYA6AEnhIBl1OeciESSIwJtNvjcOkLI7HkDGcmHTgPMpwMde3ide82pXB1juyARQmc1cV7APg7JcyS-9kEHzoWYJJs7ic9T-fxKJA5eylnojOZXPQlPeLfWV6gM7OR2XUnH4chHsVO8HC5dYsIS_85Y4m8glca4uQQCEpw8cpWNe5yexDmNVaLf7JGhCeca9LBgLFST35_OgYFUi7n1Mm8imi5Gvg0ZRTjsOSHqI1U-NP_I4ezUWXtHfOsR401v3f8WD5hq4pNzF6aCyZTuxscU32dyFJyU8ykFVUOkouqGKra4ZTBJEUlEia_wb2Vv8RWlj1l2TWaAVR5DdobtCGno0nR8uhok3Ue5hwGMupCBJJsPj7jrm8Md2HCgQgHt4mjBhTuTEpnMgymR9cEBe0bMDm_IR0DocGpTrAiv9MIOxK_wJhPL0gdOhaReq3of39YASBvHw-AcaAhCnfd8k9XMPwBkfJCHtC5Utc43kaBdSbiv1W1JIiBOnmCtd2Uc99E-yIpGIrL48ux1ic6RiT2QVc3LxtMb8S5Tdf8z4bRsOmuuHKITYBe-ZgGw9npPtcA-M5irBdbIf7eIn8hJ2JxCp0cXnjNMwXG1dcI4RJsZhJsoFOhFF1SaPGYRgtH601D5FAXrAAxs4HDBE3sr0DNZdIXAQuEJqFPCEBI-AEd4mGqjyLHkA3nrO-uTvb-VvfTu0JyUquVvYVeFOjeLBcQCN-dx2pFPcfZ4cuN-1qsMN2f6IbC2hRG-dsAJZutaH33q82qIS0KtTIsrrtziigzQpba_fubMDNH0YBrMRJGDL480lMzDKD1LQn6QIRiBOOlZlP4628Sj9W1vBM3IR1QFgVNLMPSKkILceMpKrCHMKUKOaVRftXA_ODyaIJx9UgMl6J0ERoevnpLpQHE4yxw6EIepfcjhBLeQAx9k1XtSYHlVw_lbuRNPXZqVlb-hju90UJlvvkwYTU_CDUCEDx82YJiLpi019n322ep9kg6WndmunZVN4OU7OzC2-qm3iD03L5MT2mP6qVoOon4luVAE5ShRv0rznC_V5XvQU0ZaEls7ZtmA4KxeSPTmr7o3BfY3mSoxuHcGaIumb7HQHGL28pcLQ_rGM5j2c-o5GhVtIzSldWAbGRp234T22ST-uap1pyBo30uWVFZoPandto8wVPilW7ns9s98vVG1_wmvFW2jwoUevGwjjQ_UCVUMTtO2ewQSCfnVlaQ6FCbYgKTbzNCShREQT-FXnCyPq-rQfL01Cg5JNQo4g0YbI0ivXLQOKkAanVT7cBz0wRAhzZLOW-rBxbB1SyHmOzWvNU8cQutrSlKN-EzJZVXgsBrYJMNl513BH8LgJQK_uYCa2R6gyH7QDLwMLYiyAsVMIZI6kT7WnMsCf1deJxrHTkFUmA2jOQHKJYkIhAZIrH0s5kLiGiRMqJGMI67vyUnQxcO4mazviiDuzjgnuIvQOPzKwdGnORxz15DJ-XqVgoxesG7-G_dtoLXzS1A2qmHu_61S5_EjCnFINQPOjXZpP-0E5FxITKQlu8ZBFo_UQYwPwLdAfw_bu-JXenhi7WBlCI1qpCK9UrqL9v0fcrIPLauVLYjJozFWuFr4jATx_JK1GfJH-VESu9hP1lJs1bJGRhU3DvMlSOiYXJSRSrBoTr-zhOriKCaSYpxgQ-euTs536mAuooMb7vz6NEdyBOw7a7aZ3bUdcHpncs530msW9VEG1cABKCVBik2bsTCtO-S5J-q6a46bchrdy9HkyrieEIh3eHWJCrx49uSkgEtA0Q1JSjt7nxWoh6T_56PEaD1PFMEKYfDTomYZl6KlFpSnPv4ZH5O4FdcndvSMuRxsPEqAlEWclG-TjWu8xJZrQr0us2xGPOQEexYZ-m5MlONu1fRwp7LSCyvm109aamfkwdnE8i21gQxw4ue4TJkmdeQSacW7gYSWjC8rL1G_JMI4ZGBMYYKCdiLm2Rwg5FGO-i5119dq8-p-4C_6zePg6wCpT0zZzedWNpbbH9WFEOcr9BTVMGvSk1eQ-1Y5BBE1H7NgaFJRkY9XdhZGQT9MFFuLjq1jkbucZVnxwn5U6EBKZE-nTaT8aISKWR-cswc2w94JsATbzsHLHCWMU57A44hOjxro15uxfmy_LH9NWJ9hRPHWSpXPJ-XJQ_dDAurJ78OxF_-buePPFq4Q5pLa27iTyt1o7RdBlkk7UNK5tkWHEjmpz-lwYnfuQkygGWtVO3nWuoLkPIFyT5LkpSKLC2SaiSMHCpAusBtiM1xvbwEioJeE6ZT2FM685Apsmxh5Q4mh_UgOY5WayCfU0OYSaoBFHF8ytU1YrPhIOIaI2kyiAU3I4XyHNN3_XcIT5JTFUqIk0jFiCE2p8Ip2_IGe4m_FhFsOG-AjXJZJjeZfHYalb8zQ4M6MemAG4Jnp-Vl8TnNh3aJySVBF2D0uMt4ux8n4F4H3kOav3nxJLlGyBRP5CM3po0bUoRDwqey-JRHGLFsVy8bsXdODmOW8gaIR8dl688zyJxJUscWbdHCmCFCLAAN8-Cq1yCmCUdvxTJUXuEc_gCyAYwe7JabokGKOqvqiDkmpiD7E9D0PsEnOkDpNqstqCxz54uNckWk9IJdtOAzNlaya5M0EZHWKsqoktjBQz6HciWE9jtMsQIhzY-9QF2wlKU37Y3rVwlsOdfT3qtrHlg8lXzmeWHmE8dOxY9bWHBNSWU4jLgdRAs1Ak9C-AjKfBxwkfPdvgpaNh1DYvrFUY221E1SbP67EEXTVqTzglcyo_LJbhu0g_QQwNtVUN-mPey_YXLJB9SMtxlCJ4fvUi2TPF_By5-sd9zCyIICZXfh4sHgvsdmA9yUcOSPUbR7F62N7qQqQVQ7lLG231b0Uej_kXkq7k0Gp-FP0WypxibZOa3QV2hfDUcXQABZ_YoOyeURxecYrbme_cDYi1Tf0kd6C6RtBprr1U02MjM0Tapg8XW1YTGwSz5R6IIHp4VHqPDBxECw_xIfoulHo6Nxso93Q-CUgVH_zzv6G68TtR43FvS_EgkUAOJ7Z3uUZx18437huKmLnKsPKjVvTLrdFKM2Q7ajm1PuQYNg_BbPFFp0jeML3u4Os-IBioYVullx-mr2dij4ZIHnfjcxyHgj_2uVVbM5jtT_T0ZCynxMQ4-1LDbg1cveJwRW5XTYjPO40oxVwZbNSeHbgwOru9GHsn36N2ZmqiDFWfepgXCndQKIxdCrFrLB9GblcEcIemaeNUtiRHCEPrQYdILZzBsc5gsR_C40uaDofzmUIz21Szv0YNPU9N2gXkaYCQjsFWlsEiKLBgXLj4eHQcDeSRBwAlKD8ernd4ASYCUk9EmNCrTHS4Qaqka6L_aYMXu-UcD7Z3K6dFZq30Zp6GdiZia9a3RGLGgQbx0J-oxcEpzkAI4H2ozXpXc6eO1OTcdddVoVO5DNqlvv87Vq9THxsTygz0H8mNPWZvbCHn7sd8BebUzfIzv3b33hsMEB77mTPR_q727UXmSTkiXzDOAU_FLjVY0b226jyPtSZEzJAxz8YhzaZ67aEWKcn5Hjwd_AEdhZkaStOwOUe0BGRp2AsCbXApkNW-2lbXiuVWlXg3dcxdJrVbU5neZdi613EmmcD9qUnsGP26qTSZEjbmaVt6Ik-3KZIL70t1z8x2TS821cVP2XEWHBfJTL_VxkbSNLGdIwnS29Ec5EsFbr_X0t6XGAd-ODg-dLGtU13JC4M9751YLPMom-GHfSEWQ89oImq7ziVAsjuFFjKLEZmhD-MwufTCnVwDc4oHhn0U7KNy0eKZ7KASMQjYD47QBjWr94iJOnMdwVu2CmdLkofm2CCejRKhnhlPnDvFeMBkOPmLg6IYZg5OkiGuy6CCJOGijVr8HLxadD4rTIcHo8OW624mrNpfSsUIac4P4K9U_x9ccI5jB5yeSlFrC8k5AOa6REMjmQvhpISy7VTeQiRtHpifkLJXRoYJ21tdFQ_Tf33CmWyEBbjAogaR5kq7dkZzzSDnCksER3TGPZaPjngVOUIs9b3jE24UZ-0AjkJppGokk4UwRlPfjpNKNGM1OwKIjdw0oXeuoH2wk_AEBtuKlaGa2fLfR3dC7H5RElpeIbPOChoPw4CuHbbCvANdmuk6Lef4cEScNgcVjsO3Y1di57H_ahtmqdz48APa7Bmc76xtJMgcPHSI1c_fiCBn64UadgMkEQ_r7MJIh1-AaP-NlRPuRVjeoTNnlsYmEeadaPcyb_GfLKw02appXtI9BYWE7IilujKYk9uSNXChmOD67jtI2GmHHL_ilPxOFIwkCrT1UkVmolNTp9fZcay1ASzL_qD2d_Spvz7BsBcvYHFmuKe2v7-DInzvobHYEP3WZFqwHzKdHp9zqYFEJQmpLIajEeKOlC8fhZH5IICo5Fhcwd1mldDczDXQ1Nv5d0geAhA4_EpNxUkstuIHK7CUv0Yi0LtsB27P44DVp5wNrlGXGne8ooAX_AoiEY0Jdr36_W31R6fsS2pRViop4bmyVNfRgbWYVrpODwdhT65_7qSG9gJEyAfbUoq2QIRVThia-0kw70JAo_ph9R3PcGUNwctKiLoHFKbwnO_wPpbwVNJdotwVXSnBaaAwXWwhSmiXlC-wpVEknBIPg3MTWXxWn9aVVVxq2OIMPENScXaetEA7irQlWUqmob7zOfiVe1Cchyfe_LPgMrs0nC_mtRht3Mh6qtuxYndwkOQGPWbVb8mDRyvbIDsVsIs1zrsKgyojW9U2lvNiyXYjSJbbfHWnJI3QgXGz1cRAr3Ip2jIqWxXtPVWZuCgu3xeHEm0C9HXiysQpD_tO6MjF6eOgrkWyRUlQtU2z42dnDPjcSpZBymFRPYKuSJs9kue9olJOfVqp2NL1ED34qUmS4EwEshkqtx2XmwB2TzK-iIe-2eXMLXMOHHWFLRIkJL8z5h28ETXJpPzz3AAyDZ2St0DWAOF1yVFQzooW27staEpfODR9_Bi3EYmFQMv6HltoNS_i5LNILNbrHfyx-O7CqFwYd8DsAMekKS_B0XV5SnDA5POOrdcJPJt4V3lFdXR6KeeqSRnLdyORtroQyaDOTL8p4eJaPSdjlyslbGqRcODHrvQYbTru6Tb7iHI-Oo6y1sgXiUegeqoovUXwB2PE8WnbGnFEdkKHnYghPaw4PoqZHgD00VdxpEW_tyzVQSXap-qWDTsatfmnOlDNQg0U8OOj9DocbWlQhgqXSdwVah3k54iI2rHCzr9rdG28nOJxT0ydazWKddCgQ9wzBz4sUiScCwGZTjxXbA4N7sv_PJKamg8drPoIvBZBVYR2pnxOuYs0sRlU7hu1wra-dvbt_1GlxHcsrthkK_zDIcecqufz3j98wZm6MMrwPtjiAdbah8BLDQJmFmVG5MSiFYNyBFX5V8WrAmVdVgHhtSWIlYsV-tTPu0bs-twll06Zk5i1F3ViVWpJ5d1hI3PSyLAaDMvyND6DXaH46SDJ036p5pUjmixmHq6kbgZmcXCxw_xqahA9maMnk7Nvf_gFEOyopOXB4SJgtwBnZykU3aWWtQzjlSpIUFmHjCP5hydK6f-AIpu-o46G2bXouLEtLVooLyWazdC1UNL4HDFmE1AEGO9IyIlILWDEDKPd1YVOm5y_OpJhEMJENYVs5ZGbbZGTJDmmiLRqGHQa8e9vpSyz5kCQF2bjHm8_zjtqvMo7daKm-8B7tV-py6VRpXijhcQIlTRv97SXVUbGzfC8wX1em_M5F1N7l6Wg7abotVMkY_X8WUmZrTQjoWYUpDhhLmKpSba5GscuPGlncKqYX6p3cCNySQeyF1tka1bdMYhApW7HsGmzo4cwX9teZY8QA4NY2n5saoOdU_B2A0pjoEv6voqMGYESybH112rXt4Fs9tnPAlB-oVcqdyeB0JIMKBS4MmGuUentQm0stLQMAiOyH9fCbL115dfDDTCVNKqlPA2KYBZwl1IA06gpHWnqI1F0qf-0K1VgnGbv-uX-zn0-c9Mv6OmfeyA912BL71_9UFu1P5-VXlhCSfNGiMB71sUYBbrdaITSxy4U3BMmihVQI4BaR5-kd05Z9-P6lzbzpZ0SY8pLhoUmsyDC0Phw14PGwQtVmlzg-e2mvzjtZ6Wr1by5PEvOkHSIGJlce9a68h_sq5bFaWIfw9aqvlvC_HHhvKop9a_jwT-89f119ikc0YnYlGe5Y-wl15Q__OHyJNhDupFYy9nK03WwQMmjCZSdo4hNuMfqp3tFV2JunVC_X4_UALtGw51IGW3UHTvuVTxip920p-pz9VyqjFNO3P3OaVJuuY0Jx1cho-Is8ptX9dl_tqkPxtya4SPVp3cCk7FPCTuojrye6r4mCpgoPZOZdHZdcEhJ268dVSmKiNdR-eY6pAHBYRvgl9Bh8w1ebB7InejYT_ISEapnfoziq0_9Q9lYo_4ZaRssle0wWU96isS-cuDbq3PqdGERYqpTK3IScSCThCEIi5Itaz8-ATTOad3OkjnB4SkRAtFJNMk1PhuKglTNbrrzTnrfK2gORBy_Iojlk4FcKnMvd4eiYhprW6iFMV5dUQ-U9hnqbWSxC6qcESc8daf0rHAXI6eh2XcocYEqtPmHhfhVHGcs-fwpMUQwlcA8POebhThqNvYddzie5m4e09TuBx3vB9byEHvTfkfwuf970Pb0PC3MrMDChq_90DYHlVN3KeVJvoVfi_XwDu84-TTMZ0ydPYuaYfytnOannWO160Wthl31Oz0uFq5L0SkFvwbper57HIxTOSpgbaFLV45iSACKK7qHAlbgt4O0AxuIX9ingFARg-LyTPycio_vtL7jMBNQvyvC5TcQSToTqGPsz2bRKbbkpLFvxym6dd7Xj-4GR1Mm7MoaU9feFVI3HPvCiIlg78aBtRAPXGevOTkbNvfttBB1t9Q_SJMZ9HDo5EERQQZHuqM7nJDWDbgjZQU5MJcjdX0lXNED4WzoKHCazyDvwwLXlmHS67YnBejatGXM-feZTzltqZT776jEOojB-xSDlPSAcmzSzlhaTuVKKZQPfJ-l1s6vUpcJkWd778--pYolNwjvzqRjF79S_7SMhEymftlEcQU1fPvML4409EFcu7kSHn2gOuP65YEacfMce0LRBLOyt0IsZBjAVRSJfyBLErqFm5kAndP8eUn8Xd0pZTvqPL13YYeibgO3XHiGWptRlfjjV8w5-ULn0A7bcMvZ6SK2DrVfXNuFS3Co0VMS6LJFrfXt-jdM7I78vuHGD2kG8N566pCR1hp7VTgaUiNjKXAg8Pq4sKWZ_QJJqdjfTWb0FHcPuTaunQLNk0K62wXYsO93jtNVC9SsnNBHrlAJNWf5nKxMxRod8fRSo_AsGQ6KTO9q4-Om4vCHYV9S3NqasOSj42IblwOfduGK4GLf3lU9psDFcI67nFRwQTAV9AUq6lDzSpBdd-kIeWN-0vcuroG6jJ6TU5IQr1qi1mk5Cw46vhYGpJTtWpwWOnQcQhDwcD6lwsY8Ru2dwgkEhxaUD_3w2XWTaMTq_pEWpx3JSucv0sKGdPw1b1vD1eNhHXRiycgeLLUUzqKscnWV_4ekQaI8CRDBU9QncgvyPjnO6nSFo50iqGW9N_y6_FsjVjQs8iehiE3EJvmkqBA4g3pIfsGjAZHHUhjWGFd6y230KCqiFG2jUyScT2lBPfxSxBiX509VauS-J7CXQIuVa02t7XrDnypq_u3m5HjhbxuqxYP-5UMYRlYT87maXo6lctudD7-1sT5G1uzzfDOyQJrYr8AsG_SeowdJX-FFvT-pcChyRVTYdt6Iuez1t3Jvoz5NIY3pJFnh4sCdd4JE4v6HT4GpOIGVeB1nLCaj4nwuH5j5txK9TkTO8p3mNz1JChBaBr83W7wINCda7byFRyImbZ96WC93r0UBdrCNgRz7jhoX6hkZO03_-9-DmHLDcwUNTLpvgXwdofP8FtX6YHNWUaQ4Ltv7URBRTjcftN4lEp6PKnyf_f5YhffH3nL9g3e8kxE9baoPuTrL8-WXahTaI1EiRmQNTfDESCWk0xqQhPl8PHeN6DQI9aif1D1NN-Q3LhUbfkoYaL_4OHlJWaWLp-H0DWqSN_-r_oGcY7kX54vFEqlvY4nfXlB1xTn7b6pOCJJO7Q4F6FwjILCzZPASUm3x7_ws01gsE8v3mgwXe_cYX0ZqWQS2nuulqg6t0plR42SXYpxy2dhi7zsG8ge5n4kijLHggy7kyrShpG475dvO591gsZ28DSd5NGko93HdFBV80A0YN-gwf1IGUcEzWp2J9fSneUKAU05oG2bvlggJsfFPKn-isUXYcxencLLCZqjEuHtRGEEHho9On7x20rh_U-tbsVH3455OMQxRIZYC7xFp89CL_fsvnZFPJZVYNx7uT4KQY5ph4qyX0Y-6rIrLoC2epxGhnHZmKrHGvDrn3ZUj-hciz5qsdSgSLq9JJltfBUOXa-wMkMwxS25JitqF8vqnYnz2sDWieMwlpC6Y3aw3VlbQvm9p2RW-EB3GuWbCZ6gTR5HO3yRLFpXUjpuoKcsEG1GtiV0hYZfQp1l_x538yco5pRZpO01DfuPd95_Pz7jrkESW5W_qMe7SNBIv4N7TbKEEOkTXZdb0onqQ-lRkyHetNrNdm8L8x0QSk9Kl7OS68RrmynbWwYVBJnBshmFjUULDk_xtCk5jwpkkx4tl4aTLqqsfXVSa8_eMMkTiULbKN8uv1_CQhFqfzoHbHhcCxKQLRlvh4xNjOEnG5bWa2IA1caQ7UGOhUmRKVXEwrA7dLQ1dimiX2YmW0jRxHEFOdALpzv0OhTWoeGM71W2nKcjIl5oXnYIH01zIbkkB2tOkwFvDaJkpeEeeRPT2KZ_2NDaDFNalqTvof4RFIgJOLQOK4XDna915-rwtpZnfWvhmHP6L3iHLPWKmvTV6YJbG1uhYzO2l35TYJYlM2JzzLeLuJbyecxh0OYsj9oP491uZCAKHG9sW4_wLnY-eDB-8lABm5hJM5zQmq9tVfC_2HeLHFc7580aG7EwsJXEViRps4vnvDbt4Y0D_Qj4lryMuQ0QYROYrn1RBPHUoXXB2F6Rj3_6oJV59_PBNmGVRvQhXQNd9GSTbb-tyjU8cvR9TEuK7xBqqVmg7p9VunLFXJrILWcMRnyWnZa_U33lOjXMY8S591Wfy1fmlwgnB9BYGue-Lr8HWIsyW4J0a_3GqtE_jjCRNxknZ01Y4LcTHi72kO7U7zOEAvXLSov9fW1e2mLiyJN_v17QlwO3PESCQBiHpaDGNv34qIjKrSuCHmTNju0FLVVYuscgpoGgvaOpscyR4xs4iLZ5rOjlyPCwhmoVbKwW28OM16TnU2TB8g_suB_Yl9OygEz7XG5UuvMd_uU-QCVqyiWNRWBruITrxKX_NnbjShkNvY9Vv2c7upNEOyIQMfb_GuqucehpXPSEmG3kI_x9K_5fPWKXg5cemoq_eW_Jr2IWMMm3xzbukdVPngZNue8f310ziR9uffxODa4VlZwCWkL38bNKDi0gDhM9Oo30yBxbSSH0aIMJnl8YQWvxQjZ1FUcDCvmcR-zT0C6uuxE1MJrsC5NZX6sE87OA-mKpLvq7aPmTD5bDyG8g43T0s_kfa6y-ycSseFJbNsDH4Ldk4LEa2DRH5_dLSI6NchT10vN88-NqZgXNWflb4Pa9sWga6joi1sjhyuuR44FPLzF-iYK502qmy5Uu5lFcZnVllOQjDMsmZ2QhRw-ewQWkjzMnvKpWSSMWYGJ1XBVzl1YYQWon-lQOMhTmLlSErQjze6CjBCYYti4JNnXLtSTNU_nFqrUnpk85J0ZSKuxiEGG4BDRgi7Dpv0anVbT3QXs_cQE5bi4hP8FEO4TGr1ZY8bA7mhAXAiUks6hqiDUk9m2lOTMRX9aquKcXq2ggxsRSULzc31ECDV6Yo8f38ZAueArRwhUlR4zMeVF8K2ou9pynlZesk-qLMayIWjNPS2Pm1jOMwR-3OKmsa0Kci5Ycy7_hNusJMuYb4ZjFQ6s1LZN96tuAeN0YC3q8npoBfLnoOTotf_j0ed5PYkXtkHYKVt13WiE1qlZsoODG_EPJOkqMwiKGwHfjWplikwzY3JkmucDyyfZMpeAgfXC1bxZqWwj42aeAj9ckX9glocICTsN0tIyHyYLf-4CX6dqFwcaN4lcflbDVF7PmEogb-0U5PiKuMaqdx_U3HfK2yn2fWoLbueU9Weu9dxhtk0bdQ_0roMFsYm-xgzX2_pNSDLFl23aIVO3lOC4CFaCt2RFDrDABbfj-B4gdjjYQg8DPweX804ALPgudA-K-A4ZuUCopB-ORwxPRnjB-L9ViFmy-e9zrDHTV3h_F8aJwxABhobHCZD1DMUhqKpdsN8-SOJBlXzRlYsDKrgi6OXFPIwE9QntLhkAdq85s1hSCGXe1q7U9jalJ5GBK75cUNS6XWJPygbqJZEv_EKvPoJEo5R3wchJzLe7Q4OWf6nBRwaFOBX97imF8ulv9XuUcBjKsr9YP63wxoHf47i2rZvwqcvHucDICKi4okSjtrf_Hw5ZPCRZSRCtMTlDlzOrrbkNhJCPNjqDiKhzVW36tsIBCTY3iK2cTezT1aV-QVMpt8mgdpQXD2LK8xn_oekudxbzpShoiyrjbRRot52UjK6HcGAZ_EaZCRjckVDMnCtD5iBE3F_r12izuNsi4iSoIfLzrNq3dF1t1mdih_-1NtRErio9Uo0NrA7rlkiujDGAWRap_FEVzzN0quz7Gb-ovK85j0cqj2SbzTaRBE4QgxVVBdd_QIzEBYZmhh_I3SFLSY77wHHhVyiDryYp-lNTY4-JhaMrygR912XGIYDYWoQOGOXqCpxlqycsF4H-FDK8-a5XZ3YOpudPC8m1ajswOlo-8NADqEufBd52fktki41TVbfanFepzdWAqDCG4i58KEAATz-zZXGoyoQiaqnCMR8zG-Hs28uEx2PPHldL9Y7xxIZK_05XcLJwaWWiczrQ6JOBu_Ua9WoJh-2_cnwlsK9jIyGmuLd1WTqMGUFUHIMHHEGKBvSYHgJBG1xhKLPzP8byAtL4tbORhSlFU6CUSimviz7YpdlHwkl46ZmvBSIO8QmZA7YTpHmsOop-m5FpcQA6MzuSkIELOJuHvhUXOtLErxmcQnEarb9ug0HrC9hFNLwnux3dwvUSBA0ysIEumxcBDxGckDZvN8oDF3PYxs3qtUqExPUwaz3xVvTAKibGhxUal5R57IXOWbd9O3Xq3p922kKMp5VhJngrRl-ApKSUtEbuy2JRsQcm30R2KOYHOZsxdUByFBjxSfnV7Gc9J32M0mhKQFbqLppeCTBkh86vASXJetamhulWODDSNEXzGdKuizkFdh6og6hcuW463yVgnQNZtqXy9ZYxzIGAmFYGVlSdn25uB7olimenIS61815i1QBe1hIpY7SpUc-UDBlX1qI6WUdHcyZuQOqsGfLPjL33colot4N5xoUsKDcKJ1dqXoeys6BV04in_A68OIIxOUJ5v8iLYzaolSPcL99AZI0BGwGxn7R1fPPBsg7FecaDlKsyp8PNHI7uCJjz6RLKgvuMTUYZHJUfYZu-8oyi1gKB4p4XrT0-UNveuO94zyv2jq85oKvLtvg4O6et67xYwqFFDVFLkyNIwY1tk4YnhkbWSoL8QzfArRrYnArMo1RFCxZAuA54jMN5iJVCPHGDoN2sqzNoU49KLPeirIgL_mX0hS2AQZzZxme5VNAmt1fSltWLvt31RxBEnAaNqL-9Gv5NTIIBxuql4p1NtyyaQnH8m25WjcQOvTG6i0U0dkwA5aQ3Vx1GdIYA5Zd1hWMCW-Y2Si1Br3GRKAShIvOOSvqziwTGWch_LWYyEvIwJBU3-eRN1JhLMNqu1z3tJyOEIcaxMGMH960yhCy8nLLt37eypTWkisabRdq8NVdvTWKYfUlg2njFkrI2FeCFf765__bf2tYXpGHH9Uac4OAdlGWjlqOAgNz4qzKEuGI7iqU2s0ezMBiNIkL0JE1sXbpORvT3lDqgJ1k2epOKv3OnV8wn2q31nQ_Bmwj3K-I17-pAIiUt866CLLYDp1H_k47nWf9zh6opQRGNAOVwdBNkPd29UuHMvBpAgPJpQ5plQJhIDY-BGjwVGTEcjfbWpqsDEMXYrQXNKgy7xHE9nPAGu7Nrq6HLyj65izv_r51xL5kRzP0BNmdQHp00aC0ybzdwcd9fSCebLi0rPKfKLnxWFANBqT5JRiISQXiC08uNUwGw9_5ygbBxapzD16Nh4sP2AZWkl9vPPghdhMBFfUhFLqwCoHNTiCvPzuCWyCspNIDdB23vDJsoCW3Glc1xc1AatsbgIdKmRSsJ759IAba4FdhgCKwxh2aTbDbxBBqM4nIMee8MYvpIyN1XJPV1M9ZKMdP6hCqn6VNTZdfyKFkWJS4JY3Icg-5VvXubjli98GmTJJjRsZolI7NPWfRE3famGwNgFf4k7o-wJWgNH94uGP8nIgGOvRilE4DkOkBVybqjUaRwgGPIe3F1VO58zpzISIobkY6R88NyLpLwOv7HsHJi9-Huc4siRA_3D-nZDxIFxMwrzgqlSbn-PW6_mN5wE1z41Z1bawv4GYDCn88LTUGOgu0aPpgiiRcRRipvBJhbk4c4AEIpPB2ni8U2vckFF1JcsUSpnMK4quFM4vyy9-YGXnwZQFsdmfOaVmdzUKeFbij57QvuVL5aSjO-K-GdDkxDMYOy_6I3oXhFTOXlEXdiqxBo86AI5gHfGdWR6QfavJXp7WJWrg99F1iVyaQ_baD2gGGBQJ3_3pR9U5z8O-N8RoWw7H9ofibWobbGxtcu34PklB7tj5h7BvQrIpIzkLAIb5z8gQhb1zy4zaV707JiQzQaNXt-qCOh1dEkvChD7PMqutzzJvS2iMJXuYe73M4skH8dGGcAURsmPnpjqsMHvvgakvyG4O_VOoyYE_iYwz70ctMAR-QMcrfI_s9SgIdKUxMdar7EOkp2t6kDCwvDZe0ubosb_GR6zNY09ML6N6aHTh5cOWb-g2s2Yebr0BBcA-gYkFrJbxH4ZJJKBIUJqZhOMvNaN3gYpIRF3SwjbbLSqx-xC4vBvIXlAnLMHDv3BjF5soH2hDtH9Gas6eMJHwJkGru26P9NhyPSxOBAdHRdrUtyy_iQ-iFDtwL2Wb0T0hiV6yBt9glMB5fsbTqFhO5vcQ0WVNbO-8HlnlmrQ1Mdn6J8w92hpN4uP_vOvJ-unz41bFHzfBhPNzo6iBmOqo6GD9-FAUOffOU2NVqI_o_kY7mEj_jd_UmWL0IiL-3-6ZTUkV8BRIxmfcQrFX9nQs7Zj9lCHn3s6NC--7I2yB9J_Ixxv4s_T0xE756KrMG3ayk7Ok2QtySV5GxpczSpxvCf_-RIPdonTzxh3QlKYM57ZEdfXzzA4q7oVbRsLbGsFJjwg3_m15hFMXWoCRtblRCK04_h6JA5FlCzdPIrawPGqfkg3RiZ1em3AYubECnt6e-eP-TLCUnT9k4kULOACpg5dqUL5BCaE65ZE8xcc2Tr9qp4Y4eq2NtIg3PDeRtEhynd73aGdr87-PO8G8nXDjPGDGAYigJf3AWIYZY7jgY7WTpes203o_7QsCrs45k4SwWX_JxEXOVoSDGHxV3hUTen_e-2fWuVyaVBAzarMKUx4s1dX0ALp8qF8u5ozs61WL-1anw_h1q4TTQDZydiTftF_Dzd-2yw3Nrx93K4c4Y2tnWdIwswaDG4-7NSp8ljGCm3wJx6-HjLwwVEivPPMqF53bxLMaqjX25HjFOsqA_EeTV48Bs5dszINrYVfvnf92PIoQDleuE08-AjgpVMC0s6O3ZfReq09DP6C4BIefLbcvlxV2bd4l-tPjaEEVAsoTdLMr3we6ndTr2G9MtoU4u0JKz_SYqQ05YCgLEsGOTmqcKrhDd2tdHWsH33uDQQ8WVdtTG-u1XXRlpY2KWbmaraaYZhxI7MjrtADu-fXibpLzhpIgm4FjPZlYKVR4aMrRsHTobe47czRpVpy7h0RDYc-8WySccM2UTufoUdHXmYCPCPV2BYtJK9kuHZvhjqbK12yV4KeZSB5xJIX3q0O_PEf5eTsjrg3f08QqdDJlgedvcyRqQCOzIMZgfhvQ_J1fapTRl11shoR4tooaIvWKhrTQBcEbg7rv1kRQH17pPXkH5nWx_lBAcVvQcpDrcUMFvvHXbg5PA1MVG-u2SdQ2B6bvj03b9eZkUCcoPEknvLIqdPpnZ-SOMjo6uMxHnVSUILouUmgUYnh6cIFWxyE6lE9Q4aqEZd3L4IsfAvjxl0CqlGG6yBDSwCLqeqN_wTu7yWSCpwmRuV-zIk5YEAdpVNQnkb91TGJjtIyuV5tKYtRG8X6plm4ivxUCi3VaJ_1zOwhlPs_1LSTBv9ej9mkQMWzaK96LVtN1WOKp8H7UMJEGsCn88bmLKlKzSU9lre-nWPiH-AdtAhjqrVzaKeNx7H6oNqvDBpfPKUPPjfKqMEw3iIhFqhMeo6Dad9vldao8I62_EP4OMkpUpbQRAxvYGVyFLNivFho6TqdDWhEx8lm5KIcGKwSTEN1LjSzLKvei2FEkhSPYztGT8UpLOhFarmya9oc6IXf2S_ytzaIGE3taT4JN0Fus59p7SnBJ9NtYJJVL3yK9ZPL83yqaoIpI-8sot8IENRSaJXYI5SYEsycvRgtrP5lO25JTP5HlLMhZjzHtlFa3IyO2RTzh48Y35gn-1mO4ZjHhWk_x_OxFh2Kvd-NYERuUEwYKc51MMCz9QKYkaYyYU-du11Y27MWQXwgaqZQx0Eh6n803zhADEQH5-Ixb84DsjcJe6j6Eq8ReCvsZmflPlQ8ITa3LlS_hQU-S8rxk980Gj0fE6PUeR0WeQAFP896nMbMbm9xbbo4EMyX_8g5Wuv7MmrAiTM_Ju2j_4MQAw8SQRTxdS9A141idfiEv4W-_aNPdoun0ZRo-NCvz5ROZr7NmAeVKptl3vdGnFlcfba7KiNY3f2UzHSsR9DlLzu7cpNc6i-V2dIyZA9Cbp5hDWDrMid8qqx2bhKTChTitri37zr9VePWgspuE09p4xvSX3pmZBsvRxmRnkWS61C6K0dNLxqv7wfbwSUDYFugddPYIKX-stYw3lc7_-9q1YRXKZT2X-LXHmFcRbGXbUGM7h9wUzoq1p6biy44nOpJQT_GnuM0gQ4ozw0anfXYI2cQWQ-9r7a8Tf4QHyobNLz1Cdw_CapiGfokVi0uE3LgakmvwE0sj5HRhmXHy-cXh77ooqdSFPgw8FGIzrdn2_Vvg3VAOcgPKhYtKISfOFgExvpLJNasr_6lpv00THfB844fdX-DHyL9OUpk6UM8qhPYFYF6RCIgNZbQeNwwfZIQmRjPF-aZnJuB2A6PSnhSrP62SpjqnqYnUxIa-2LzyDELenSFIxxd2LO_baSPhOVei9WSAUQiSne3zDZOZsMh2zPFR4gCjFNBCSaG_zlHYXa_mkdVffcC74oyBagy7IzBrUu-AGrTGGtsZj3A_uIjYMztmttvr7oqlcVyNs_SqJNUozcqp3Su-nGA78exSymqc8YYYUBOhpOgMJvYfa4XW5fHUVWYOGmoTN34-t980dNutVEGahhCtUfpIVWCOgohU2URfdJUen1FL_kZdPq9XypFnF-a9E6U0EhC8_m_lrC1KZpw1DPoktv2HD_1AbWSOhE7syS3tsho_BhHti0NiOReA9S-yPj4desN3FkHhn9hb4_hOiexA9hbhwzuER1YVfbs4NvfAAU9l7rGTuFsOnQpV8qsYRPgfLP0vnDcbXP6Xy7TsJIG-vx81rWm2YnO7fABBzzSpU1MLmk5IAieg-rtc6oy94KO8yHPaMT4VV-P0Xh3kL6UfyYAUkB40wLHCMvEMPhWIawnN5wuTFJ64AJ05Cmts1smYnRiQ3u-V64HMEvLLYZYHVrw7b1vPL8pVrMMRcpfV0bL9EZiIPTwU2omCNj07UyWJMXSljKKuJTVx3etW_e9Sg-qegukkRAwXW4jM692ZgDDMcaB5GySGcVRPA1fXvtUofD8OMgqDEo9CwWExjhVK7f13q1smA3fHxnAOfeCCI2g_akbMGbda3PAp0_P4a4IVkPzf1Xeq3slOTBVL9zSUG0qh-heQhvutWkL0ZgVCFF0lpdyS4uOmZ7KDldMnFxHuKZuMgw4JcviZx5dYv1QqcZYhxFz5RhN-oP3eYtp1LhD9NTftlvfwi9ZNpKxBKFN9emlAgrkQsf1mal4s9NGGs8TDmtXeoaYKvQEl7iSsb4LrLW-RZ_1xh_hwTzVbs5K6mrwEq6fUFYiKOeMmzTlIiJ5_3UdWhw_3Qmo46YDeS01q2zzpupQcjgtIeMKZl9fY_s-Sk_3amkoyVfldqWVbzBARln2sNYwXu1n6ZRdDyFR64qbK6Wwyy5giLyBBQDcCt1SEPPXYEnqBd75yYgrjq-PQRQO2Ej4QTkYcq6VhU6ynOhO0tMEPWAZWX0VPst-nGh6NDBqtPXm1VcxkrX_epdLCs3ImvZNL48TR1D_TJ2758FV9FWMTakB0w9rekH4GTJhxkzgvXJp2gObJn1BAHs2dlGbVlRGiM-lE5WUD5bpsgE_LjUGtSbkkd1RqJFQJiia3F0XRbCpnJY0cI2EiNUKEMwT854ZpkFzqdslpDb8imykkjxv8Uu_lWHETHlYY9V6ajEKkZxMnUO-p03LaqGLbr2di4W-pJ1j7lNIwQRpO2GOjB1odpQiJYWaMxC9CKLmbyBHyFNEL6Mhi_mb8iISLSjPCiPoPp3j742otxL8C8lT1VC4ZSJSYM9xm0plM69G8ASpxKGxkAfa8fDz7hR07mjLlx1UrwWzUFXx9CyOIFM9lg2joXVxOWGG3NwBcTVslFRFrlwYgGfakkPLQJMeNzQVYE1Z6q5Cwk-zpA9DSfyZ8bxA0A1y3ON-PLjBPwDHtRMYKqFSTUYiqFdC5lZ72BoeW0Q3Q9iLgL2p9n6dh3N5iatDafGtQV6OAo7BBzE549-rrLjR2JSP-7Co7snWq79YIlnL8lFMe5C0mqcvaXWPvmF3u6T9Dw1jQfuF3N2EEx3KXXMIaUmo4vkmMLWlt8Q5uC8kH05-nRCnxy8pod9C0-ougQNYohSS124XiMAbJCzoANgsqww2dGB159_3JqezTixp972zxduMPXdZmMKPjjC4xk8tacRyXAI1cmCfFapNlo_WDb_41678V_60tfBin9lnd2mwVUHii9Y6JBRijjNCjKOHKxKQPe41SCc64tsOIOF5SbQf-gWEzGbiy4ZNbtcjQthM23kx1sqQnw3zvYdscHQpcAlAOkYCRr_Jq48WGvWLjKB-5GEVWbaIuo8J-NMS8bqYHe8cBK91Dw7uuotVwbfMox5q1k8_sKzYtUpYtUx48SIocSht7qu-i4-NAE-VpMRWpcOmjENzVhbK-aPtdkFqhdka3DHE8JLwHQ9wNtPWhW09rvSrCIM3WojbS7lytsM7wfjkjrLyQrBlU1heBwctrY_T_rja81c4G4JvUJ5pCmCxuHLzthGj6xZURe4XuPY3Mbk20M2wZHey9d1U4QlIjgG7I4ai9quhFQNXci-18AVHrKvVOFjI13IXH7hgMQ4qx9zyGHmr77y660K77jXu56TBUS-bNpx4NWFR0ogxX9olW-ee4LkJzTzYPwHWbpMCs7rnhf4_eixJmQZZi-grSJ83eEvkG_W8_WnJAaKdVRbKNjIcTAT9hcsyiuXHdIlpWHk0qrc6oJyVTi1JFqI-PZ6tFcdZx6paIcc1isEXXBZ22OW1BW6YWSOQ6Q-tEcXNpw2xMTwvqHyRwj05LQ3F9-XpQ_T62NYUPkj6WYDwU4LZqE0koXEGNfrlzNE95i6IyIYtYky7cOclEj2OeiU28oH2GjjYsPK2jjGo3S5K7WNx3TEJZ8DstY-cGkoSmE1Yufv7J5G8wv8v5vbF-r2aexMWxQv9Jcl6abZ87haLCOGeXS81tImKUjGPpx8dskstkihAv6YDcHHNVdFSlYJ5FIHS_OBi61NxupaPtvWqqxy3J-B4TYag80WzQqWyYMZfmqPHKrbnS82beyKefsL0XUXN7b8EiD48MvOFmjK5_r9D56DC8P4YAZ6iWEU8OOf8NieIPgA_UfnW3O2shKBy_Umwd9qxMZwhPkHoKsh1qTHze2Gv4TJJQImafZ-Z5UNsDT5XUW24t0-Qwvw_QT2kt0lXy-Gtnc-zOzDzL1byfGx38mVai1JR8ry_iDeMU7mJyEdm8d9_UK8xPWEB5h_WpgG_ooBxBsieJy-hH0crZABtugehTkHnjQYPvGGTvW_zjIbc8DauMBfdUUHXXwNpFvl6hWntCSTZTTI5GmeHm6l_6t8wM2cFg-fOqVYuM-YLcBExNGYm_jHP9ZDPhfQ2OtnhfXUH68rv157UacSuN-YZDwBldkD16en9lg2Ge1jb-Cg_c2kFs57qKT2edTu8V7e-tyRvfsbIn6iJ1LglxQOL7RVkbqvWMGqW-zYx8ayDwgLFFCIMpCW_OvyTfyiHaHOUVykfHVolJW1NNGYuBnrdTRoT4fKac2OToKbAax35advJxjhJ06u_d6uyaOxT1SkR2Thvxts15K5rPVhfzmYoDH3cYOladJz0rR_uVqUrP8vdJABAf6NDE8kzxkTrK4l26BMPbeF34yJcibQfqIVwNQUgcLGd82zXElcIiAbYB1iEYqf5BhZAcVsv0Xhu1a7d9rN0DHUNAlllLSosBvCQY-Jbfrfw8QVcZWgdbPDfNovuRsXsYs1YXLqQRBNh8C5wZaLgpJmZkwon2s_g8tVhpiBufasIdOA58Nm7sSOnNz_QX_cmn5bR7jUPm-nVEiWQyImVTIDGcwjiHVOUD-qLF2sPEk16ZZFmLLZxBb539tadVecynkPXIbh1ErAloBin_FB31y3mmm1LkWWPcp0sWOnF77dTrhj8Lq_XyPFW_nYOw8jYPVjv76m6bzhVjDfHd6dieGUF7yW2b5-rFdTGsXrzXEym3bWeVm_Smc777iEX3fNHjnbAMF3OZklAaCTtWBbVMLP7hLIOKx6MyhLawTabPRVk-rpPdD7sH3QXVyDe9iiTW0xAnKItVbW9OQ3edVxm3zlUvtglRKsiA1xxIpP14UjdVnpZ9HQ1nJGqP3QFJkwlmN63a5WXr2qZqlGjrqSBTQ6iPJTs_4s96bEOpvLAX-YS_cfhft_DsAcHsTmbSOktJs70Lqo-W535gBfpxB4GN1Hl2-3HQF2NrDs29Mte-FTSmHxapVk-UHl3C0iDlcQ0vHv9lB7I41kZW2y8u1Y_VZyqQTD_CfXDON9zwuxUTJb6cc8c2Je-yhIEc5RZJSXOszHC_05PGZoaUTsQou5A1LMus3UljxEttlqbuJcqJOjguIhldB_DZIGUGsT5cXQhgNX_2haO6tf8DDkB7s0ed6yocQuQTUUSEje5P2p2hMbxIg4gqDTtNM8vBwTq1i-HxoWmSgl4--4o0Licyklt7Pel-_kMboPym82nVogRe1JKDPxeln6LOZj1ztLTaS-F_iqYaRw7aMcXqRlIkho5rHO-EJMiwUdXBKM3Ya7on1dl-Xvly_GUPvbxGzGCUbj8JEE1kGVWikOkdnq9YRlUVSgPQafs_KqPcegzUSA6tjjUxgw8PoXijfPANR_1lezO0I9SakvjdzVBgNzJKeiq77vneYfnOM2zt2QXH5OlMaW5m_vXZ5drw35HSKdRmCKuQLyJEOqpmDCODcXiFyG_ONIbsuSdvej4U5Ou0BIEPxO5d6dRdQbvnVPdaoSc90NpU8TrOY6tvxtkrjaVHbYxlWplen8AxJtqVoq2YNlWsAuGNwKXQsWmhtYZKadLKR_1SrK4RdVZPCdGl-K7bbtvRfVS9fVan1XomsBS9HmAXpbiE8wVf_DHKuh2zDEa3c7VkYK5CuJRCqlZQ9mjqCtM4XhzlCLhyWYvXI157b2XWZdm-2YPwxhqPOpKtmBSVZ2t8TFIRTg717JfSknUJm0YAqwJjMIlZllhusTwI6T2pxqGE7dkb7slUDAd5RY2BKipGW8M0atjQ6JsiBF45Fz0VAIBMx-r_0LM3dadCHoLAvRKpkraNSr3JK6CmjuMCHR7sBSK0h9cwC3lValpBv6muzSa6eyuzDm_awIIt3WFmHRY8kq_erLtN01TtsT_fVQjBJ__niyvtsKaB4p6bkmuIJUxPKOqPoL5TlqgTcL4kWp4ykbUcKwFq2NMYY8dr3JFpjGYqQISq50VE7pQysJu88rFtkAGmfC6zOSxQ4dhlbHU22Sg8-JUqAyxg3WjKxfdjw6-kSkwxphSJkHWpdO6T0aq_ZZu8kafgtIRVdHFy1Vk9L88kxjmf1swGy-yelpVeCd9Qo4BdkL_xj5qyyKacXeDkvlJty45TY_trglGEPNhIiYmpoI6D3A6Iql9JbGIjEXMvSJPlWjNlbQMHndvh0VRUQjKFT8Z0kI_XbTNqN1HvJDYDuMKiLhXSCdpuNOzCuC78oAZCOOZOi2kWuEWBYRWEZDc8EsIUmnsl2zSZX6SPFdJVHaeqhgve30V4QzRrW3TicM7v1lgCzP7E0LaMhsOM2DnaEvqwveX2pnc28C9KMj-PCdBbntfTYm2o4ljbJKKXhv2B6pgDsprkg6bKSioAZkzEuUPFN3SuTdO-qB9RNPzNuemKtoBM2qhT9Vebhfwr8g-4jm8e3rnGeJ_XOjq3G2CVyekOiJ2doDBSTXpyDM9_w0bVIHWGXR0l-u2CMDFZTNZpspffUfJIGLFDamMtawSC74d50Mx-FZmggDX5VY_ohHVykHODtbHsiaMMPkSzaDoRRhtCE7uPNZvJtMsFQWpywutSQ0z1t0vYg0qnick8U4FH36qQWMB6_mM4qTO3M3DUDScDjlgnFnhgOpuFG_agVE8ZDk4UEToMVL-nZAiCnNwxF383UpE1eRUr0tBc2Ru-f0CttdT_pJT3qgiEYsY8yMLbf8TGlyTGro50LGvVgR-h_HqE-rMjXIs1usl0gKH7wdL1z6OSdz0X5mSaGleT1ra-wyHZKmTTFy9k-Xq0Mhpcf9sleb1yeVvdkzEJnPO0JTvd6nQAd_X8O5At6vp10b58USvRNdskJ_UVB7nRNZq78ofqiLskIRx1cctIGT2nYSiLsyMF5U5TdVnU8NMKnQaLCSbUhyLpgJCW9NJliW0Oh59RfGUfOVY535K6Cf2mZLZJaOZKowBksCP0ulz4zpVP4Ib9QBtldLm-Vr1QhkigaiDC9hJ8YhpPTLwRq5ZMQiJ6ASeDc_1D4jaYwvHxSLGBjdMuLAj--tMcTvDm_kZWSaUtAcBB9CLvIpmx9KHIvzoNcYqnWRiVzPA-6uoWqX4Rz5x8F8X5-yvPvoYQH1O1NJGTKXNuyKuYmRiKJhfA2K5UURsdwGNaAsm5yDU_TZwn6W6SuCdw2dlbULvumVuKl99o-bfXZkuE3cJEeCscNacZUaj7iw4MiyEZZp9_Q4JynUaRfSfxG2WiQHYPOBjGT4-hu0CkWJKk5GxMTG1x7bO7LEKYtxGQqT9nrtEfjejAmRYWrHou2mNs__RyUS1YcsBt4sg64L0n_uONfWqusjUAgGQ1xxF1HWfT7Czp9ZUPmzLjafLH7JVLa0Ur0Z2sKEuAse4LXM_hbOMA068HhWvnm_jGB4F-R29GWvYh4olkS8TP6ONrRMt7Ty8yX3KcSf9ABiQ8Ar9GH2lSDZuzDGeG8y_QNI2gO9MxQG7B337gdsvNkDbLLqRZgRDIHfLa5WLHeTFgEg7aR85nWhplL52TDKmidtFGZi57tdlVs5gq5B2rUgarGNNFKJchTmlS04ZPEMvHNEHrOfqrcuTeWb5NJwFTnH5kODe5DcnMVeMxso3aLkFucoIzfv538xlcxhIejOhft8pzvcSopzVvVTDdtyMjVXg_kFIjm2PcxroZpy5U4TbMlXyWq05mUplRc7sEnnD2GCzDnDMMNw5IKDMD24avCKU4PdNwHZK3zN1Z3TUcG7z4Yc0sybKPQVJwaGLNPqvloPYiu8CS_-QulTIWAQtVfoo-MzvdTaaGVVD6kbXhafBud28v_6_bu04gmWuyoB_voQ-9e7ozSClaNyus6bwdxEqdJGJtztXWQVrOEc0wRV3XjoNv3kDdpwk_We-iJnQRUSJWmCIGVYRf7Zvm6CmxM5KazYQxlsBTMx5zNFFHR-gDxrs476-diaL8ohq0UCEAZ5dRC505ZBBjB9bOS-fotchmKthJKXv0taOl2bv4xGfUTMDFnQeR6p4mqkuhiCXki31vaMA_IWFuJSxaTMO___15VqdmSRlg3CN8SXbI26Qck_ni0ePgbowXCF0jBqIM3rcA_punYQ87IIsBbyzkYxWB3sjkw67D2yYvoKbjbxsCIFd__sQBDPkYAE9oVhBHUM1Oi6mv3mzdAqMxC4XsYiSTvwZhKTHRYSsJuM4ba6_ifn_-789PpT4FP0ZQjkn1_k44RhQ7xREdp3a51qiqih7vvxibJ_2gu5YPVLps7Oyzlvlorz_VlaZhxLZifmxIkUxZyVwDT4PYJR_dALXh4dxWJ8yLrKOQASI8Gg0utXB4vgkD4mZPaJqFJ_o816fh_wE';
  const BEE_P = 'afiotun ehnptyo eghltwi aginrtp gimorun bgilnyo abelotc aehlrtm fgmnori beijmna cdimnuo chmprya aflmour ailnotf cdeirun delopua ceinrtm adlnoti cehmnor belrtui aegnrwl aiklnwg ademrtk aeimnrf aeloryv adeinro abelprm cilptxe acilnor bcdilme aeloprb dfgioun abeilry aeklntb aeirtvp cmnopya abehmrc cegirva cdeiotm dghitwe adenotp aeilnvc egortum bceklor cdlmowe bdeinoc eginuyl einrtub acinotp eginotc dinopta dlnruya efirtzl ginorud aelnori aceprtu aceoprm acgiknr eilmtua gnoprvi bcklpya demorwp lnrtuya ceprtui aclnpue acimnpg acilptr bcehour abenqut cgmnoti cdnotur adeprtu cenptyr aeinqut aeinrty adklrwo afimrwe eimprvo aegnpto aeikmul abelnto dilntuo aghlrti aimrtyl abilnrt fgiorve aeintvo deilryv ceinrtf aelnrtu biltvya abertwl dgnopra aimnotl bginpro abcdeti aelntui ainoqut lmrtxye egilrtb aeilrth acelnru abcdfke dghmnti adehknt gioqtun aemntyi aginrtl acgilnp aeilotv cenortl ailnotp abirtvo aortwym aehlmtp aeinrtf cdeintg acenrtb cinprxe aeghipn bchrtue almnoyr cdeirvp acdhive ablnoyt egmnoti eghlnwi adegrth adegrty aciltyo abcdnue abcgikn achnorm abenrwl gikorwn aeortwl acgioun deinrum cehiktn ademotc gnoprui egintwh egirtvo bglruya dimntwo cdgikon cejortp celprud celortu acmnori cgiorun aelruyg abdemrc eilrtyf adhioyl acgioyl abeoqur cimotun afginrm eginrtc adlpryi acghikn ghiorut celortf cdenprt acetxyl abcktuo aclortu abelmru adehlni abelpto cdenoua einprtu acegoul acehmni degnorw cfginro abegtvl ceginoa aeoprtb cdelrtf acfirtl adinoyr cdehpti eghlnpi defmnur ekortva imrtuya aeglnyo bhiprto aegirym aeortug filoprt cdeirtp aehntud bdemori acdenth ehlnopt cegimno cdeilng aelptyn inptuve acinryl cehouvr ginotul cefiryt acdeorh aehiltp cdhimoe cdeirtf dklmnra imnortg afgilnm adelnrh einortu clrtuya adenrtw lprtuyo aelntzi cinotue abintvr acmoryn ghlmtyo acdintg deginru cdginxe eghirtl cdeloru delnuvi agorvye aemntyl eiprtvm dfilnog aciltun hprtxye acinopm einrtyl aciloth abcilng aeimntc cegnoyl aeflrui eginrtu acgknpi cflnoti ghoprta achimng emortvi deinotv cefinrg aefiqur acirtun achmnri eimntyd acehrtp cegorvn ceinotf defintc gilrtyo abeklrm diltuze adekmrn aeoprtg acdelnb aeinpxd ailprtm acdelrh acginyr cdenvyo gimnxza cilnorg afinpul dgikmon adeorwf agilmnt acdimtr dehnrtu bcilote chimnpo ceijntd bdefint begilvn enrtuwd deinrul cdhotue adlnyze aceiqur agilnrd aefilrg eiprwyt aelnruf dhirtwa ehilnto aeltuvn acgorue aehmopn einortf aelortv degilnf elmoryp abcelop acdenru adimopl cilnrug adghinl cemnowr cenrvyo adefrvo elortym abdeltf acertxo eglotva dehirtl chilrva eimnptl adinptg ginorwd aegkorb gimotvn aeginth ainopvl aeginrw dglruya adeilvm hilnrtg belortu dehorva aeintvc amnotyi fiklnra abinotc enortvu aenrtxl beginrf dgintua aeinxyt aelrtui deghina aghinul bcdeirl aegnrtp egilnro abcnoyl clmopte einrtwv ehltwya aeimnxg ciotuyn ahmopyl egiqrun almnopr adginrb ailnptm ilmptue acehilm eglprvi aceilrh aegntvd adegrtu glnqtui cenorth adeflry cgklnti eflrvwo ceghnwi bcgioun adegnru cegiloa aceinth ghintua acdenrh ailnotb cenruvo abdelru demotua adenuwt acdeirh elortwi aginrtf aghntyi adelnrv cefinul cegnrui abcilpe cehlmya knrtuye adelnpb cdeirtl ehmntwo abemnti cdelrut cenortv acghlne cdiopue aelnrvc airtuvl acdegrh ceilnov acertuf efnortu aemptyn abeinro abcnrye lnotvye cdgnoti iloptun ailrtyc acelruf acefltp aflmoyr abehltp imoprue bdemnru ejmntyo aeilpvt belmorp deilnyg adeilub acehlti aenortf cehirya aeglnry aelprtu adioprn agilmnc aegnvwi acehnrg adeiltv cilnruo ailnovc degilnb amntxyo aemoprg acefpul cdenotm aceimth aertuwo ehiprtc abglnzi cgikorn adeintv lmprtyo efilpro aeoprti aeilntv acdghne bceruya egimnpt cdenorw aciklto egilnyr aflnotr adgnovi abiknrg acinptl acortyn acelmri adgijon adelrxn afinoxt cdeintm egnouyr ghlntye aehirtg cfilpro eilnotv aginpwr acmnoul ceginrp delorvp aeoprty cdeirtu hlmntyo adervyg deginul abhintg bcgimno aenorty eijnrud agilmnr aenprth firtuxe dkorwye aimpryl deginwl einortv aeprtyh ceinorf ghnrtui acdeiun cdintuo adeltui cdfitve abertui aefgiol adefinc fimnruo mnoprti aeimpzd abeilrc deintul denoruw acilmnt acmorti eoprtxd cdeinov ainotvm aginrwd amnorye ailntyc aeortwf cfinort aceloth amntuyo acfinyl ahmnpto abiortl aeglrty eilnpxa ceghina ahlnoti agilmno aghinoc agilnur deilnov aginotb eginorv eilntuo bilmtyo eginruf bglnowi aelmntg agilnpt abioprl ceortvi aegintb alnotyi adeirty efgortn aeilmnr choprye cdglnte ceginth cdenotu aeilprm abelmro adeimyt acelpti dginopr abcgiol acfrtyo adegrup deioprv imrtuxe bceimno eghltyo degorvn acdgnvi aeiptvd abelntu diknove cdeirzt ailrtuc aginorc diltvya imnoryt deinrth aemprtu alnptuo aelnoth abhortm adginzl ciqrtue aemptvn egiotyl einotxc deginoc adinout cdehirn aeilrug cdefnoi aegilnp cgiopyn aegilrc dghlnoi acilnrm emnortl ackorwe aeghlud abdilro behortd agintvo bcdkloe acdertk abdeorw adelrzi gilnopt aehlpri bdilrza adortun aeinrvc fhlmrua aceipth cdfinye agilnwo degilob celtuyr aceintp defmorp cenqruo acdetvo enopryl efgirth ahmnryo bcdeitn ghrtuwo dflmnra adefhro ekortwn cmnorye aeilrvc acdemrh cefkowr aefmorn aceirtb cdeopri aimnrxe abmnoti begimrn abcertk acelpri acikmne dgimpra aeltuvd adelorv aginrtd denotwm abeflrp efiprud cdenorm ghnrtvi aelmorv aehirvc acfioyl celmopd cdoptur cdntuwo acntuyo abglnui abclnoi aeilmro adotuwr abintyl aginpyl denoruf acehmtd beilorn acftuyl agiklnt afinotc abcenrm cdelori aeimrvp aegnrtu filnpta giklnoc acelori cdeortl aciortp aegilnv enprtvd bdegnui ablmnor adeilry aelnpry dhirtyo cdenoul ciklmre deimrtp eflnorc elnryza acinotd einrvwg ceilnxo defilyt abdlryo agilnod cdimnya degorup acfnrue agirvyn cdelnui aeilrvp iklnrwe acinrvl ehirtwd acgitvn aertuvc eioptxl aceflti';
  const CW_G = '##SHE,TOWEL,AMEND,PEACE,ENTER/#STAR,STAGE,TOKEN,EVENT,WENT#/#AWE#,TREAT,ERASE,NOVEL,DWELL/##MOM,WROTE,ROUTE,ASSET,PEER#/##EAT,#OATH,ANGLE,STEAM,HORSE/#CAB#,FAULT,UNDER,RAISE,#LOSE/#EYE#,CLOSE,ABUSE,TOTAL,#WHY#/##LET,#MOVE,BUYER,ALARM,RELY#/##PUB,STATE,TASTE,ALTER,YEAR#/##WAS,SCARE,EATEN,TREND,#ERA#/##RUG,STONE,HABIT,EXIT#,DINE#/##ALE,##SIX,PRINT,RIDER,OPERA/##BAT,MERGE,ACORN,SHOE#,SOME#/##SAT,#FIVE,WAGON,ADMIT,READ#/##RAP,##AGO,PEDAL,EMAIL,TURN#/##SAD,#HUGE,BEGIN,ORAL#,WORE#/##GUM,SPINE,PLAIN,AUNT#,#STY#/##RUN,PAUSE,ACRES,CHART,EEL##/##SAG,APPLE,REALM,MERE#,#KEY#/##PIN,#CITE,DUVET,ATOM#,YET##/##ADD,##LIE,JUICE,ASKED,WEED#/##CAR,GRAPE,ROMAN,ALERT,BELT#/##CUP,SHAPE,PURSE,ANGEL,#GOT#/#MET#,PEARL,ARGUE,YIELD,#TRY#/##LAB,#LOVE,MOVIE,AGED#,NOR##/##DIP,#HERE,LEMON,IRON#,PONY#/##BED,##OAR,GLORY,EAST#,MYTH#/##WHO,AHEAD,LEAVE,SAVE#,OPEN#/##HIS,#POSE,RINSE,ALOUD,MERE#/##AMP,HUMOR,OPERA,MONEY,END##/##BUD,##ONE,TRAIT,HASTE,ENTER/##PRO,#SOAR,SOUND,HINGE,ELDER/##OWN,##ARE,BASIS,EXIST,TEST#/##SEA,##PAW,STORE,LION#,YEN##/##NOW,##OWE,FAINT,ELSE#,DEER#/##HIT,SHADE,NOBLE,ALIEN,PET##/##VOW,##ACE,BAGEL,USUAL,THEN#/##SKI,#STIR,ALONE,GOOD#,OWL##/##PAN,ARISE,ROAST,CANE#,#DOT#/##SIR,#LANE,SOUND,ONCE#,BEER#/#ACT#,STRAW,ALIKE,GAMES,#SENT/##VAN,#AIDE,ARROW,REAR#,TALE#/##FED,##EVE,LEVEL,ARENA,PARTY/##FUR,#SAGE,WORLD,ARMY#,YES##/##FLY,##LIE,TWIST,HINT#,EGG##/##LIP,##ONE,AMONG,GAS##,EYE##/##HAY,##ORE,APRON,PASS#,TREE#/##TAG,#SAFE,PASTA,ALTER,DEER#/##POD,##AIR,DAILY,URN##,GET##/#RAM#,RISEN,AGILE,WIDOW,#DEN#/##CAP,STAGE,LINEN,IRON#,MEET#/##MOP,AROMA,LEVER,SAINT,ODE##/##SPY,##TEA,STEAM,LIAR#,YELL#/##FAT,#MALE,ROBIN,IDLE#,BEEN#/##HER,BRAVE,EASEL,ENTRY,#KEY#/##SON,WRITE,EIGHT,DOME#,#TAR#/##CAT,##AIR,STUDY,EASE#,APE##/##NAP,SLATE,PIVOT,OVAL#,TELL#/##GAS,#DUCK,WEARY,HERE#,ODDS#/##MAT,##ALE,AMPLE,SALON,KNEW#/##ARK,BASIN,OXIDE,WEDGE,##EEL/##STY,OPERA,RIVER,BLEND,#END#/##PAT,#RUSH,POLKA,ASSET,WEED#/##ANT,##TOO,PHONE,ROLE#,OWL##/##TAN,#LOGO,JOKER,EVENT,TENTH/##GUM,##ERA,PENNY,EAR##,ATE##/##JAW,#MUCH,FAIRY,ONCE#,EYE##/##TAR,#MILE,HUMAN,ALERT,TERM#/##BUS,#RANK,BUDDY,EDGE#,DEER#/##SKI,#SEEN,RAVEN,OVEN#,DEN##/##LID,##EVE,WAGON,APART,RELY#/##RAT,BLAME,EATEN,TWIN#,#NOD#/##IRE,##MIX,TOAST,EAGER,ARENA/##MET,##EMU,RADAR,AGAIN,TOLL#/##FEW,##AXE,SOLID,PAST#,ATE##/##PIG,STOVE,PILOT,YEAR#,#DRY#/##ARE,##LID,AMONG,SENSE,KNEE#/##YAK,##ODE,STUDY,ION##,PEG##/##ICE,##DAY,WHERE,HEAR#,ONLY#/##ALL,#TRIO,PRINT,RISE#,OPEN#/##FAN,#GLUE,COUNT,UNIT#,BED##/##RAW,##AGE,WEIRD,EASE#,TREE#/##SAT,BATCH,AWARE,RAGE#,#YES#/##TAB,#TALE,ORBIT,RULE#,BEEN#/##TOP,#SAFE,PASTE,ALTER,TEEN#/##RAY,##EVE,STAIN,HELD#,YAM##/##ILL,RADIO,OCEAN,SHARE,EEL##/##DAD,#MORE,RANGE,ALOUD,MERE#/#APT#,STRAW,ALIKE,GAMES,#SENT/##HIT,#WADE,GIVEN,AREA#,PEN##'.split('/').map(g => g.split(','));
  const CW_C = {"SHE":"Not he","TAPE":"Sticky strip","TOWEL":"Bath item","OMEN":"Sign of things to come","AMEND":"Revise, as a law","SWEAT":"Gym output","PEACE":"Absence of war","HENCE":"For that reason","ENTER":"Come in","ELDER":"Older sibling","STAR":"Sun, for one","STEW":"Slow-cooked meal","STAGE":"Theater platform","STOVE":"Kitchen heater","TOKEN":"Arcade coin","TAKEN":"Not available","EVENT":"Happening","AGENT":"Spy, perhaps","WENT":"Departed","RENT":"Landlord's due","AWE":"Wonder","TEND":"Care for","TREAT":"Halloween goodie","ARROW":"Archer's shot","ERASE":"Rub out","WEAVE":"Make cloth","NOVEL":"Book of fiction","EASEL":"Artist's stand","DWELL":"Live","TELL":"Inform","MOM":"Mother","WRAP":"Gift cover","WROTE":"Penned","ROSE":"Thorny flower","ROUTE":"Path","MOUSE":"Computer pointer","ASSET":"Valuable thing to have","OTTER":"Playful river swimmer","PEER":"Look closely","MEET":"Gather","EAT":"Have a meal","ASH":"Fireplace residue","OATH":"Solemn promise","ONTO":"Upon","ANGLE":"Corner between two lines","EAGER":"Raring to go","STEAM":"Kettle vapor","ATLAS":"Book of maps","HORSE":"Stable animal","THEME":"Central idea","CAB":"Taxi","FUR":"Mink coat material","FAULT":"Mistake, or a San Andreas feature","CANAL":"Panama feature","UNDER":"Beneath","AUDIO":"Sound, in tech","RAISE":"Lift","BLESS":"Say \"gesundheit\" to","LOSE":"Misplace","TREE":"Oak or maple","EYE":"Seeing organ","CAT":"Purring pet","CLOSE":"Near","ELBOW":"Joint in the arm","ABUSE":"Mistreat","YOUTH":"Early years","TOTAL":"Sum","ESSAY":"School paper","WHY":"Question of reason","EEL":"Slippery swimmer","LET":"Allow","BAR":"Tavern","MOVE":"Relocate","MULE":"Stubborn animal","BUYER":"Shopper","LOYAL":"Faithful","ALARM":"Wake-up device","EVERY":"Each and all","RELY":"Depend","TERM":"Semester","PUB":"British bar","STAY":"Remain","STATE":"Texas or Ohio","TALE":"Story","TASTE":"Flavor sense","PASTA":"Spaghetti, e.g.","ALTER":"Make different","UTTER":"Say","YEAR":"Twelve months","BEER":"Pub pour","WAS":"Existed","SET":"Tennis unit","SCARE":"Boo!","CARE":"Look after","EATEN":"Consumed","WATER":"H2O","TREND":"Fad","ARENA":"Stadium","ERA":"Period of time","SEND":"Dispatch","RUG":"Floor covering","SHED":"Garden storage","STONE":"Pebble","TAXI":"Cab","HABIT":"Nail-biting, e.g.","ROBIN":"Spring songbird","EXIT":"Way out","UNITE":"Join together","DINE":"Eat out","GET":"Obtain","ALE":"Pub pint","PRO":"Expert","SIX":"Half a dozen","RIP":"Tear","PRINT":"Newspaper type","ASIDE":"Whispered line on stage","RIDER":"Horse mounter","LINER":"Ocean cruise ship","OPERA":"Aida, for one","EXTRA":"Spare","BAT":"Flying mammal","MASS":"Church service","MERGE":"Combine","ECHO":"Canyon call back","ACORN":"Oak seed","BROOM":"Sweeper","SHOE":"Loafer, e.g.","AGREE":"See eye to eye","SOME":"A few","TEN":"Perfect score","SAT":"Took a seat","WAR":"Battle","FIVE":"High-___","FADE":"Lose color","WAGON":"Covered ___ (pioneer vehicle)","SIGMA":"Greek S","ADMIT":"Own up to","AVOID":"Steer clear of","READ":"Look at a book","TENT":"Camper's shelter","RAP":"Hip-hop genre","PET":"Dog or cat","AGO":"In the past","EMU":"Flightless bird","PEDAL":"Bike part","RADAR":"Aircraft detector","EMAIL":"Inbox filler","AGAIN":"Once more","TURN":"Rotate","POLL":"Survey","SAD":"Blue","BOW":"Violin accessory","HUGE":"Gigantic","HERO":"Brave figure","BEGIN":"Kick off","SUGAR":"Sweet stuff","ORAL":"Spoken","AGILE":"Nimble","WORE":"Had on","DEN":"Lion's lair","GUM":"Chewy candy","SPA":"Relaxing resort","SPINE":"Backbone","PLUS":"Addition sign","PLAIN":"Ordinary","GIANT":"Huge","AUNT":"Mom's sister","UNITY":"Oneness","STY":"Pig's home","MEN":"Gents","RUN":"Jog","PACE":"Walking speed","PAUSE":"Stop momentarily","ACHE":"Dull pain","ACRES":"Farm measures","RURAL":"Countryside","CHART":"Graph","USER":"Computer operator","NEST":"Robin's home","SAG":"Droop","ARM":"Elbow's place","APPLE":"Orchard fruit","PEEK":"Quick look","REALM":"Kingdom","SPARE":"Extra","MERE":"Nothing more than","ALLEY":"Narrow passage between buildings","KEY":"Lock opener","GEM":"Diamond, e.g.","PIN":"Bowling target","DAY":"Twenty-four hours","CITE":"Quote as evidence","CUTE":"Adorable","DUVET":"Quilted bedcover","PIVOT":"Turn on an axis","ATOM":"Tiny particle","ITEM":"Thing on a list","YET":"Still","NET":"Tennis court divider","ADD":"Sum up","JAW":"Chewing part","LIE":"Fib","USE":"Employ","JUICE":"OJ, for one","ALIKE":"Similar","ASKED":"Posed a question","DICED":"Chopped small","WEED":"Garden nuisance","DEED":"Property document","CAR":"Vehicle","GRAB":"Snatch","GRAPE":"Wine source","ROLE":"Actor's part","ROMAN":"Like Caesar","CAMEL":"Desert ride","ALERT":"Wide awake","APART":"Separated","BELT":"Waist wear","CUP":"Coffee holder","SHAPE":"Circle or square","HUNG":"Dangled","PURSE":"Handbag","CARGO":"Ship's load","ANGEL":"Halo wearer","UPSET":"Distressed","GOT":"Obtained","PEEL":"Banana skin","MET":"Got together","PAY":"Compensation","PEARL":"Oyster's gem","MERIT":"Worth","ARGUE":"Quarrel","YIELD":"Give way","TRULY":"Sincerely","TRY":"Attempt","LED":"Guided","LAB":"Scientist's workplace","MAN":"Gentleman","LOVE":"Tennis zero","LOGO":"Brand symbol","MOVIE":"Film","LOVER":"Romeo, for one","AGED":"Like fine wine","AVID":"Eager","NOR":"Neither's partner","BEE":"Honey maker","DIP":"Chip go-with","LIP":"Mouth part","HERE":"Not there","LEMON":"Sour citrus","DEMON":"Devil","IRON":"Wrinkle remover","IRONY":"Opposite of what's expected","PONY":"Small horse","PEN":"Writing tool","BED":"Place to sleep","OAR":"Rowboat paddle","LAY":"Place down","GLORY":"Fame","BOOST":"Give a lift to","EAST":"Where the sun rises","EARTH":"Our planet","MYTH":"Zeus story","DRY":"Not wet","WHO":"Question of identity","ALSO":"Too","AHEAD":"In front","HEAP":"Big pile","LEAVE":"Depart","SAVE":"Rescue","HAVEN":"Safe place","OPEN":"Not closed","ODE":"Poem of praise","HIS":"Belonging to him","RAM":"Male sheep","POSE":"Strike one for the camera","PILE":"Heap","RINSE":"Wash lightly","HONOR":"Esteem","ALOUD":"Not silently","ISSUE":"Magazine edition","SEED":"Planted thing","AMP":"Guitar booster","HOME":"Where the heart is","HUMOR":"Comedy","UPON":"On top of","MONEY":"Cash","MORE":"Additional","END":"Finish","PRAY":"Ask a higher power","BUD":"Flower in waiting","THE":"Definite article","ONE":"Single","RAN":"Sprinted","TRAIT":"Characteristic","BOAST":"Brag","HASTE":"Hurry","DETER":"Discourage","SOAR":"Fly high","SOIL":"Garden dirt","SOUND":"Noise","POUND":"Hammer away","HINGE":"Door joint","RANGE":"Stove","ORDER":"Command","OWN":"Possess","BET":"Wager","ARE":"Form of \"to be\"","AXE":"Lumberjack's tool","BASIS":"Foundation","OASIS":"Desert watering hole","EXIST":"Be","WRIST":"Watch location","TEST":"Exam","SEA":"Large body of water","SLY":"Cunning","PAW":"Dog's foot","TIE":"Dress shirt accessory","STORE":"Shop","SPOON":"Soup utensil","LION":"King of the jungle","EARN":"Make money","YEN":"Japanese currency","NOW":"At this moment","FED":"Gave food to","OWE":"Be in debt","FAINT":"Pass out","NOISE":"Racket","ELSE":"Otherwise","OWNER":"Proprietor","DEER":"Antlered animal","WET":"Soaked","HIT":"Smash","SNAP":"Break with a crack","SHADE":"Spot under a tree","HOLE":"Golf target","NOBLE":"Of high rank","ALIEN":"Extraterrestrial","IDLE":"Not working","TEEN":"Thirteen to nineteen","VOW":"Wedding promise","BUT":"However","ACE":"Top card","BAGEL":"Ring-shaped roll","VAGUE":"Not clear","USUAL":"Customary","OCEAN":"Atlantic, e.g.","THEN":"At that time","WELL":"Water source","SKI":"Slope glider","STIR":"Mix with a spoon","SLOW":"Not fast","ALONE":"By oneself","STOOL":"Bar seat","GOOD":"Not bad","KIND":"Nice","OWL":"Hooter","IRE":"Anger","PAN":"Skillet","ARC":"Curved path","ARISE":"Get up","ROAD":"Highway","ROAST":"Sunday dinner meat","PIANO":"Keyboard instrument","CANE":"Walking aid","DOT":"Period","SIR":"Knight's title","SOB":"Cry noisily","LANE":"Bowling alley strip","LONE":"Solitary","SAUCE":"Marinara or tartar","ONCE":"One time","INNER":"Interior","RED":"Stop sign color","ACT":"Perform","STRAW":"Milkshake sipper","CRIME":"Illegal act","GAMES":"Chess and checkers","SENT":"Mailed","WEST":"Where the sun sets","VAN":"Moving vehicle","ART":"Museum display","AIDE":"Presidential helper","AREA":"Region","VIRAL":"Spreading online","REAR":"Back","ADORE":"Love deeply","NEW":"Brand ___","LAP":"One time around the track","EVE":"Night before","LEVEL":"Even","FEVER":"Flu symptom","PARTY":"Birthday bash","DELAY":"Hold up","WAY":"Path","SAGE":"Wise person","SORE":"Achy","WORLD":"Globe","FARMS":"Barnyard places","ARMY":"Soldiers","UGLY":"Not pretty","YES":"Affirmative","FLY":"Buzzing insect","WIG":"Hairpiece","TWIST":"Plot turn","FLING":"Toss","HINT":"Subtle clue","LIST":"Grocery note","EGG":"Omelet ingredient","AGE":"Years lived","MAY":"Month after April","AMONG":"In the midst of","LOOSE":"Not tight","GAS":"Fill up","INN":"Small hotel","PEG":"Tent stake","HAY":"Horse feed","APT":"Fitting","ORE":"Mined material","PAR":"Golfer's goal","APRON":"Cook's cover-up","PASS":"Go by","AROSE":"Got up","TAG":"Game of chase","PAD":"Notebook","SAFE":"Secure","SALE":"Discount event","AFTER":"Behind in time","GEAR":"Equipment","POD":"Pea holder","DUG":"Excavated","AIR":"Breathable mix","DAILY":"Every day","PAINT":"Wall coating","URN":"Vase-like vessel","OIL":"Cooking fat","RAW":"Uncooked","RISEN":"Gone up","RIGID":"Stiff","WIDOW":"Surviving spouse","MELON":"Cantaloupe or honeydew","CAP":"Baseball hat","SLIM":"Thin","TIRE":"Wheel cover","LINEN":"Bedsheet fabric","CANOE":"Paddled boat","MOP":"Floor cleaner","AROMA":"Pleasant smell","LEVER":"Pry bar","SAINT":"Holy one","PART":"Piece","SPY":"Secret agent","TEA":"Earl Grey, e.g.","STEAL":"Take illegally","LIAR":"Fibber","YELL":"Shout","YAM":"Sweet potato cousin","FAT":"Not thin","RIB":"Barbecue item","MALE":"Opposite of female","MODE":"Setting","FABLE":"Aesop story","BEEN":"Was, in the past","HER":"Not him","BRAVE":"Courageous","RANK":"Military level","ENTRY":"Doorway","SON":"Father's boy","WED":"Marry","WRITE":"Pen a note","RIOT":"Wild disturbance","EIGHT":"Octet number","DOME":"Capitol topper","OTHER":"Different","TAR":"Road paving material","TAP":"Faucet","STUDY":"Hit the books","CAUSE":"Reason","EASE":"Comfort","APE":"Gorilla, for one","NAP":"Short snooze","SPOT":"Leopard's marking","SLATE":"Roofing stone","LIVE":"Reside","NAVAL":"Of the fleet","OVAL":"Egg shape","ATOLL":"Ring-shaped coral island","DUCK":"Pond swimmer","WEARY":"Tired","GUARD":"Protect","ODDS":"Betting numbers","SKY":"Blue above","MAT":"Doormat","ASK":"Pose a question","AMPLE":"More than enough","MAPLE":"Syrup source","SALON":"Hair place","ALLOW":"Permit","KNEW":"Was aware","ARK":"Noah's vessel","BASIN":"Sink","OXIDE":"Rust compound","WEDGE":"Cheese slice","RIDGE":"Mountain crest","KNEEL":"Get down on one knee","ORB":"Sphere","RIVER":"Nile or Amazon","SEVEN":"Lucky number","BLEND":"Mix together","YARD":"Lawn area","PAT":"Gentle tap","RUSH":"Hurry","POLKA":"Dot type","PULSE":"Heartbeat","THAT":"Not this","ANT":"Picnic pest","TOO":"Also","HOW":"Question of method","PHONE":"Handheld caller","NONE":"Zero","TOE":"Foot digit","TAN":"Beach souvenir","JET":"Fast plane","JOKER":"Wild card","TENTH":"Next after ninth","NORTH":"Compass point","PEA":"Pod item","PENNY":"Lincoln's coin","GENRE":"Category of music or film","EAR":"Corn unit","ATE":"Had lunch","FOE":"Enemy","MUCH":"A lot","MANY":"Numerous","FAIRY":"Tooth collector of legend","ACRE":"Land measure","HAT":"Fedora, e.g.","MILE":"Marathon unit","HUMAN":"Person","TIMER":"Kitchen device","BUS":"School ride","RUDE":"Impolite","BUDDY":"Pal","BADGE":"Sheriff's emblem","EDGE":"Brink","ROD":"Fishing pole","SEEN":"Spotted","RAVEN":"Poe bird","OVEN":"Baker's appliance","KEEN":"Sharp","LID":"Pot cover","LEGAL":"Lawful","IVORY":"Piano key material","DENT":"Fender bender result","RAT":"Lab rodent","BLAME":"Hold responsible","LAWN":"Mower's target","RATIO":"Proportion","TWIN":"Double","NOD":"Sign of agreement","MIX":"Blend","TOAST":"Breakfast bread, browned","IMAGE":"Picture","MEDAL":"Olympic prize","TOLL":"Bridge charge","FEW":"Not many","OAT":"Cereal grain","SOLID":"Not liquid","FALSE":"Untrue","PAST":"History","PIG":"Oinker","TIED":"Even in score","PILOT":"Cockpit occupant","POLAR":"Like a bear in the Arctic","SENSE":"Taste or touch","KNEE":"Joint in the leg","YAK":"Himalayan bovine","SIP":"Small drink","YOUNG":"Not old","ION":"Charged particle","ICE":"Rink surface","HEN":"Egg layer","WHERE":"Question of place","IDEAL":"Perfect","HEAR":"Listen","CARRY":"Tote","ONLY":"Solely","ALL":"Everything","TRIO":"Three musicians","TRIP":"Vacation","RISE":"Go up","LOT":"Parking space","FAN":"Cooling device","CUB":"Young bear","GLUE":"Sticky stuff","GONE":"Left","COUNT":"Tally","FLUID":"Liquid","UNIT":"Single item","WEIRD":"Odd","BATCH":"Group of cookies","AWAY":"Not home","AWARE":"Informed","RAGE":"Fury","TAB":"Browser feature","TRUE":"Not false","ORBIT":"Go around Earth","TABLE":"Dinner furniture","RULE":"Law","TOP":"Summit","PASTE":"Glue","OFTEN":"Frequently","RAY":"Sunbeam","SHY":"Timid","STAIN":"Wine spill result","HELD":"Gripped","ILL":"Under the weather","RADIO":"Dial-twisting device","SHARE":"Split","DAD":"Pop","DONOR":"Charity giver","PRIME":"Top quality","GAP":"Space between","WADE":"Walk through water","WIRE":"Electrician's roll","GIVEN":"Presented","IDEA":"Brainstorm result"};
  const CN = [[["Citrus fruits","LEMON","TANGERINE","GRAPEFRUIT","KUMQUAT"],["Shades of green","LIME","OLIVE","JADE","EMERALD"],["Kitchen herbs","BASIL","THYME","DILL","SAGE"],["Hide a body part","CHARM","SHINY","EARTH","CHINA"]],[["Gemstones","OPAL","TOPAZ","GARNET","AMETHYST"],["Snakes","COBRA","MAMBA","ADDER","ANACONDA"],["Programming languages","PYTHON","RUBY","JAVA","SWIFT"],["Cars named for animals","MUSTANG","JAGUAR","BEETLE","STINGRAY"]],[["Parts of a shoe","SOLE","HEEL","LACE","TONGUE"],["Freshwater fish","BASS","TROUT","PERCH","CARP"],["Things with a neck","BOTTLE","GUITAR","GIRAFFE","SHIRT"],["Food slang for money","BREAD","DOUGH","CHEDDAR","CABBAGE"]],[["Boats","CANOE","YACHT","FERRY","KAYAK"],["Chess pieces","KING","BISHOP","KNIGHT","PAWN"],["Crow family","CROW","ROOK","RAVEN","MAGPIE"],["Palindromes","LEVEL","RADAR","CIVIC","REFER"]],[["Pasta shapes","PENNE","FUSILLI","RIGATONI","FARFALLE"],["Pizza toppings","PEPPERONI","MUSHROOM","ANCHOVY","SAUSAGE"],["Italian cities","ROME","MILAN","VENICE","NAPLES"],["Hidden numbers","PHONE","OFTEN","WEIGHT","NETWORK"]],[["Winter sports","SKIING","CURLING","LUGE","BOBSLED"],["Things with blades","KNIFE","RAZOR","BLENDER","GRASS"],["Words after ICE","CREAM","CUBE","AGE","CAP"],["Start with an animal","BEARD","DOGMA","CATALOG","PIGMENT"]],[["Farm animals","COW","PIG","SHEEP","GOAT"],["Dog breeds","POODLE","BEAGLE","BOXER","COLLIE"],["Words before FISH","STAR","SWORD","CAT","GOLD"],["Anagrams of each other","LISTEN","SILENT","TINSEL","ENLIST"]],[["Weather","RAIN","SNOW","HAIL","SLEET"],["Trees","OAK","MAPLE","PINE","BIRCH"],["Things you can catch","COLD","BUS","WAVE","BREAK"],["Silent first letter","KNIGHT","GNAT","WRECK","PSALM"]],[["Clothing","SOCK","SCARF","GLOVE","JACKET"],["Furniture","SOFA","DESK","STOOL","SHELF"],["Words before BOX","MAIL","TOOL","JUKE","LUNCH"],["Sound like letters","BEE","SEA","EYE","TEA"]],[["Flowers","ROSE","TULIP","DAISY","LILY"],["Insects","ANT","FLY","BEETLE","MOTH"],["Words after SUN","FLOWER","BURN","SET","GLASSES"],["Sound like numbers","WON","TOO","FORE","ATE"]],[["Sandwiches","CLUB","PANINI","REUBEN","SUB"],["Dances","WALTZ","SALSA","TANGO","FOXTROT"],["Greek letters","BETA","GAMMA","SIGMA","OMEGA"],["NATO alphabet","ALPHA","DELTA","ECHO","BRAVO"]],[["Rooms","KITCHEN","ATTIC","CELLAR","GARAGE"],["Cheeses","BRIE","GOUDA","FETA","SWISS"],["Words before BALL","SNOW","EYE","FIRE","MEAT"],["Spell another word backwards","STRESSED","DRAWER","DIAPER","SPOOL"]],[["Currencies","DOLLAR","EURO","PESO","YEN"],["Metals","IRON","TIN","ZINC","COPPER"],["Words after FIRE","FLY","WORKS","PLACE","FIGHTER"],["Same spelling, two sounds","LEAD","TEAR","WIND","BOW"]],[["Shapes","CIRCLE","SQUARE","TRIANGLE","OVAL"],["Units of length","INCH","YARD","MILE","FOOT"],["Golf terms","BIRDIE","EAGLE","BOGEY","PAR"],["Things with teeth","COMB","SAW","ZIPPER","GEAR"]],[["Fruits","BANANA","GRAPE","PEAR","PEACH"],["Rivers","NILE","DANUBE","THAMES","RHINE"],["Tech companies","APPLE","AMAZON","ORACLE","TESLA"],["Words before STONE","LIME","KEY","MILE","GRAVE"]],[["Space objects","COMET","METEOR","GALAXY","NEBULA"],["Noble gases","HELIUM","NEON","ARGON","RADON"],["Words after MOON","LIGHT","WALK","STONE","SHINE"],["Hide a tree","SOAKED","FIRST","ASHEN","HELMET"]],[["Instruments","FLUTE","VIOLIN","TRUMPET","DRUM"],["Music genres","JAZZ","BLUES","FUNK","REGGAE"],["Musical directions","PIANO","FORTE","ALLEGRO","ADAGIO"],["Start with a metal","TINY","IRONY","LEADER","GOLDEN"]],[["Breakfast foods","WAFFLE","PANCAKE","OMELET","CEREAL"],["Spices","CUMIN","PAPRIKA","NUTMEG","SAFFRON"],["Nuts","ALMOND","CASHEW","PECAN","WALNUT"],["Their own opposites","SANCTION","CLEAVE","DUST","OVERSIGHT"]],[["Pixar films","UP","COCO","SOUL","BRAVE"],["Fictional detectives","HOLMES","MARPLE","POIROT","COLUMBO"],["Shakespeare plays","HAMLET","MACBETH","OTHELLO","TEMPEST"],["Start with a drink","GINGER","RUMOR","TEAM","COLANDER"]],[["Bowling terms","STRIKE","SPARE","GUTTER","SPLIT"],["Bones","FEMUR","TIBIA","ULNA","RADIUS"],["Geometry terms","ANGLE","CHORD","DIAMETER","ARC"],["Silent H","HONEST","HOUR","HEIR","HONOR"]],[["Coffee drinks","LATTE","MOCHA","ESPRESSO","CAPPUCCINO"],["Hairstyles","BOB","BUN","MULLET","BRAID"],["Words after COFFEE","TABLE","SHOP","BEAN","CUP"],["Two sets of double letters","BALLOON","ADDRESS","SUCCESS","MILLENNIUM"]],[["Painters","MONET","MANET","DEGAS","RENOIR"],["Composers","BACH","MOZART","HAYDN","VERDI"],["Poets","BYRON","KEATS","BLAKE","FROST"],["Words before BITE","SOUND","SNAKE","FLEA","BYTE"]],[["Fabrics","SILK","WOOL","LINEN","VELVET"],["Hats","BERET","FEDORA","BEANIE","FEZ"],["Shoes","LOAFER","SNEAKER","SANDAL","CLOG"],["Start with a fish","CARPET","SOLEMN","BASSOON","CODE"]],[["Cooking methods","BOIL","ROAST","BRAISE","POACH"],["Knife cuts","DICE","MINCE","CHOP","JULIENNE"],["Things you can crack","JOKE","CODE","WHIP","SAFE"],["Palindromic names","ANNA","OTTO","HANNAH","ADA"]],[["Playground","SWING","SLIDE","SEESAW","SANDBOX"],["Camping gear","TENT","LANTERN","COMPASS","CANTEEN"],["Things with a bridge","NOSE","GUITAR","SHIP","VIOLIN"],["Hidden alphabet run","DEFY","HIJACK","STUDY","NOPE"]],[["Office supplies","STAPLER","PAPERCLIP","FOLDER","MARKER"],["Computer keys","ENTER","SHIFT","TAB","ESCAPE"],["Web browsers","CHROME","SAFARI","EDGE","OPERA"],["Things that can run","BATH","ERRAND","NOSE","MARATHON"]],[["Martial arts","JUDO","KARATE","AIKIDO","SUMO"],["Gymnastics apparatus","VAULT","BEAM","FLOOR","RINGS"],["Tennis terms","ACE","LOVE","DEUCE","VOLLEY"],["Words before MAN","SNOW","POST","MILK","FIRE"]],[["Baby animals","CUB","CALF","FOAL","LAMB"],["Animal groups","PRIDE","FLOCK","SWARM","PACK"],["Male animals","BULL","STAG","ROOSTER","RAM"],["Add T to the front","RAIN","WIN","RUST","RAP"]],[["Shades of blue","NAVY","TEAL","AZURE","COBALT"],["Shades of red","CRIMSON","SCARLET","MAROON","CHERRY"],["Shades of yellow","LEMON","MUSTARD","CANARY","AMBER"],["Start with a body part","HANDLE","LEGEND","ARMOR","HEARTH"]],[["Wild cats","LION","TIGER","LEOPARD","CHEETAH"],["Kinds of bear","GRIZZLY","POLAR","PANDA","KODIAK"],["Primates","GORILLA","BABOON","LEMUR","CHIMP"],["Sound like animals","DEAR","BARE","HAIR","WAIL"]],[["School subjects","ALGEBRA","BIOLOGY","HISTORY","PHYSICS"],["Punctuation","COMMA","COLON","PERIOD","DASH"],["Parts of speech","NOUN","VERB","ADVERB","PRONOUN"],["Things you can split","ATOM","BILL","HAIRS","DIFFERENCE"]],[["Bathroom","SINK","TUB","SHOWER","TOILET"],["Garden tools","RAKE","HOE","SHOVEL","TROWEL"],["Words before WORK","HOME","TEAM","FIRE","HOUSE"],["Words after JACK","POT","KNIFE","RABBIT","HAMMER"]],[["Desserts","BROWNIE","SUNDAE","CHEESECAKE","TIRAMISU"],["Cereal grains","WHEAT","RICE","OATS","BARLEY"],["Words before BREAD","SHORT","GINGER","FLAT","CORN"],["Sound like fish","SOUL","ROW","PLACE","COY"]],[["Fairy-tale characters","CINDERELLA","RAPUNZEL","PINOCCHIO","GOLDILOCKS"],["Mythical creatures","DRAGON","GRIFFIN","PHOENIX","UNICORN"],["Greek gods","ZEUS","HERA","ARES","APOLLO"],["Hide a fantasy creature","SHELF","TROLLEY","PROGRESS","FORCE"]],[["Board games","MONOPOLY","SCRABBLE","CHESS","CHECKERS"],["Poker actions","BLUFF","RAISE","FOLD","ANTE"],["Words after BLACK","JACK","BOARD","BIRD","MAIL"],["Hide a card rank","PLACE","SMOKING","HIJACK","ATTEND"]],[["Pirate words","PLANK","PARROT","CUTLASS","TREASURE"],["Parts of a ship","MAST","HULL","KEEL","RUDDER"],["Knots","BOWLINE","GRANNY","SQUARE","SLIP"],["Words before SHIP","FRIEND","HARD","LEADER","CITIZEN"]],[["Vegetables","CARROT","CELERY","LEEK","KALE"],["Beans","PINTO","KIDNEY","NAVY","FAVA"],["Capital cities","LIMA","ROME","OSLO","PARIS"],["Start with a bird","CROWD","HENCE","SWANK","WRENCH"]],[["Oceans","ATLANTIC","PACIFIC","ARCTIC","INDIAN"],["Deserts","SAHARA","GOBI","MOJAVE","KALAHARI"],["Great Lakes","HURON","ERIE","ONTARIO","SUPERIOR"],["Anagrams of countries","PLANE","PAINS","RAIN","PURE"]],[["Parts of a book","COVER","CHAPTER","INDEX","PAGE"],["Parts of the eye","IRIS","PUPIL","RETINA","LENS"],["Things with a spine","BOOK","CACTUS","HEDGEHOG","PORCUPINE"],["Add E for a new word","CAP","PIN","HAT","KIT"]],[["Condiments","KETCHUP","MUSTARD","MAYO","RELISH"],["Sauces","PESTO","SALSA","GRAVY","RAGU"],["Words before SAUCE","SOY","HOT","APPLE","TARTAR"],["Clue suspects","PLUM","PEACOCK","WHITE","GREEN"]],[["Gym equipment","DUMBBELL","TREADMILL","KETTLEBELL","BARBELL"],["Yoga poses","COBRA","TREE","WARRIOR","CAMEL"],["Words before BELL","DOOR","BLUE","CAT","HARE"],["Anagrams of animals","BARE","REED","FLOW","ART"]],[["Zodiac signs","ARIES","VIRGO","LIBRA","TAURUS"],["Chinese zodiac","RAT","OX","RABBIT","DRAGON"],["Things with horns","RHINO","DEVIL","CAR","VIKING"],["Words after FOOT","PRINT","NOTE","HILL","STEP"]],[["Pets","CAT","DOG","HAMSTER","GOLDFISH"],["Birds of prey","EAGLE","HAWK","FALCON","OSPREY"],["Things with tails","COMET","KITE","COIN","SHIRT"],["Words before FLY","BUTTER","DRAGON","FIRE","HOUSE"]],[["Seasons","SPRING","SUMMER","AUTUMN","WINTER"],["Water features","FOUNTAIN","WATERFALL","GEYSER","WELL"],["Words before TIME","BED","LUNCH","HALF","PAST"],["Words after RAIN","BOW","COAT","DROP","FOREST"]],[["Kitchen utensils","WHISK","LADLE","SPATULA","TONGS"],["Cookware","SKILLET","WOK","SAUCEPAN","KETTLE"],["Things you can beat","EGGS","DRUM","RECORD","TRAFFIC"],["Words after BACK","PACK","YARD","BONE","FIRE"]],[["Transport","BUS","TRAIN","TAXI","FERRY"],["Bicycle parts","PEDAL","CHAIN","SADDLE","HANDLEBAR"],["Words before CAR","SIDE","RACE","CABLE","BOX"],["Words after JET","SKI","LAG","STREAM","PACK"]],[["Soccer terms","GOAL","OFFSIDE","PENALTY","CORNER"],["Basketball moves","DUNK","LAYUP","DRIBBLE","REBOUND"],["Baseball plays","BUNT","STEAL","WALK","BALK"],["Words after HOME","RUN","SICK","PAGE","MADE"]],[["Jewelry","RING","NECKLACE","BRACELET","EARRING"],["Watch parts","DIAL","HAND","STRAP","CROWN"],["Things with a crown","KING","TOOTH","PINEAPPLE","HILL"],["Hide a garden tool","SHOES","DRAKE","WHOSE","FORKED"]],[["Berries","STRAWBERRY","BLUEBERRY","RASPBERRY","CRANBERRY"],["Tropical fruits","MANGO","PAPAYA","GUAVA","LYCHEE"],["Things you can peel","BANANA","ONION","ORANGE","PAINT"],["Start with a fruit","FIGURE","PEARL","PLUMBER","DATELINE"]],[["Dinnerware","PLATE","BOWL","SAUCER","MUG"],["Cutlery","FORK","KNIFE","SPOON","CHOPSTICKS"],["Things you can set","TABLE","ALARM","RECORD","SAIL"],["Words before WARE","SILVER","HARD","SOFT","GLASS"]],[["Sea mammals","WHALE","DOLPHIN","SEAL","WALRUS"],["Shellfish","CRAB","LOBSTER","SHRIMP","OYSTER"],["Words after SEA","HORSE","SHELL","WEED","SICK"],["Words after BOOK","MARK","WORM","CASE","KEEPER"]],[["Solid shapes","CUBE","SPHERE","CONE","CYLINDER"],["Four-sided shapes","SQUARE","RECTANGLE","RHOMBUS","TRAPEZOID"],["Math operations","ADD","DIVIDE","MULTIPLY","SUBTRACT"],["Number prefixes","UNICORN","BICYCLE","TRIPOD","OCTOPUS"]],[["Chemical elements","OXYGEN","CARBON","HYDROGEN","NITROGEN"],["Precious metals","GOLD","SILVER","PLATINUM","PALLADIUM"],["Words after GOLDEN","GATE","RULE","EAGLE","RATIO"],["Words after STAR","FISH","DUST","LIGHT","SHIP"]],[["Family members","MOTHER","FATHER","SISTER","UNCLE"],["Military ranks","GENERAL","COLONEL","MAJOR","SERGEANT"],["Words after PRIVATE","EYE","SCHOOL","PROPERTY","LIFE"],["Words before LAW","BY","OUT","MARTIAL","COMMON"]],[["European countries","FRANCE","SPAIN","ITALY","GREECE"],["Pastries","DANISH","CROISSANT","ECLAIR","STRUDEL"],["Words before TOAST","FRENCH","MELBA","CINNAMON","GARLIC"],["Hide a country","PERUSE","MALIGN","MIRANDA","ROMANCE"]],[["Kitchen appliances","TOASTER","BLENDER","MICROWAVE","FRIDGE"],["Cleaning tools","MOP","BROOM","SPONGE","VACUUM"],["Words after DUST","PAN","BIN","STORM","BOWL"],["All five vowels","EDUCATION","SEQUOIA","DIALOGUE","OUTRAGEOUS"]],[["Famous bears","PADDINGTON","WINNIE","BALOO","YOGI"],["Famous mice","MICKEY","MINNIE","JERRY","STUART"],["Famous ducks","DONALD","DAFFY","DAISY","SCROOGE"],["Cartoon dogs","SNOOPY","LASSIE","PLUTO","GOOFY"]],[["Halloween","PUMPKIN","GHOST","WITCH","COSTUME"],["Christmas","TINSEL","WREATH","STOCKING","REINDEER"],["Thanksgiving","TURKEY","GRAVY","CRANBERRY","STUFFING"],["Things you can blow","KISS","FUSE","WHISTLE","BUBBLE"]],[["European capitals","PARIS","MADRID","BERLIN","VIENNA"],["Asian capitals","TOKYO","SEOUL","HANOI","BANGKOK"],["US state capitals","AUSTIN","BOSTON","DENVER","PHOENIX"],["Anagrams of capitals","MORE","SOLO","MAIL","PAIRS"]],[["Types of rock","GRANITE","MARBLE","SLATE","BASALT"],["Soil and sand","CLAY","SAND","LOAM","SILT"],["Landforms","CANYON","MESA","DELTA","PLATEAU"],["One-word bands","QUEEN","KISS","YES","RUSH"]],[["At the beach","TOWEL","BUCKET","SHOVEL","SANDCASTLE"],["Swim gear","GOGGLES","SNORKEL","FLIPPERS","WETSUIT"],["Words before GUARD","LIFE","SHIN","MUD","COAST"],["Start with a day abbreviation","MONKEY","WEDGE","FRIEND","SATIN"]],[["Desserts","PIE","CAKE","PUDDING","TART"],["Candy","LICORICE","TOFFEE","FUDGE","NOUGAT"],["Words after CHOCOLATE","CHIP","BAR","MOUSSE","FACTORY"],["Words after SWEET","HEART","TOOTH","POTATO","PEA"]],[["Dog commands","SIT","STAY","HEEL","FETCH"],["Horse gaits","WALK","TROT","CANTER","GALLOP"],["Words before HORSE","DARK","TROJAN","SEA","ROCKING"],["Hide an insect","MOTHER","WASPISH","PLANT","BEEFY"]],[["School rooms","GYM","LIBRARY","CAFETERIA","LAB"],["School supplies","PENCIL","ERASER","RULER","BINDER"],["Words after PAPER","CLIP","WEIGHT","BACK","TOWEL"],["Hide ART","PARTY","CARTON","SMART","DEPART"]]];
  const WS_T = [["Ocean Life",["WHALE","DOLPHIN","SHARK","OCTOPUS","SQUID","JELLYFISH","SEAHORSE","TURTLE","CORAL","REEF","LOBSTER","CRAB","URCHIN","STARFISH","MANTA","EEL","OTTER","SEAL","WALRUS","PLANKTON","ANEMONE","KELP","CLAM","OYSTER","TUNA","MARLIN","BARNACLE","NARWHAL","PUFFER","ANGLER"]],["Farm Friends",["TRACTOR","BARN","SILO","HAY","COW","PIG","SHEEP","GOAT","HORSE","CHICKEN","DUCK","GOOSE","TURKEY","FARMER","FIELD","FENCE","PLOW","HARVEST","CORN","WHEAT","ORCHARD","STABLE","ROOSTER","LAMB","CALF","MEADOW","SCARECROW","WELL","COOP"]],["Outer Space",["GALAXY","PLANET","COMET","METEOR","ASTEROID","NEBULA","ORBIT","ROCKET","SATELLITE","TELESCOPE","ASTRONAUT","GRAVITY","ECLIPSE","COSMOS","SATURN","JUPITER","MARS","VENUS","NEPTUNE","URANUS","MERCURY","STAR","MOON","SOLAR","LUNAR","QUASAR","SUPERNOVA"]],["In the Kitchen",["SPATULA","WHISK","LADLE","COLANDER","GRATER","BLENDER","TOASTER","OVEN","STOVE","FRIDGE","KETTLE","SKILLET","SAUCEPAN","APRON","MIXER","TONGS","PEELER","CLEAVER","TRAY","PLATTER","MUG","SPOON","FORK","KNIFE","BOWL","CUP","TEAPOT","FREEZER"]],["Weather Watch",["THUNDER","LIGHTNING","RAINBOW","BLIZZARD","TORNADO","HURRICANE","BREEZE","DRIZZLE","FOG","MIST","FROST","SLEET","HAIL","SNOWFLAKE","MONSOON","CLOUD","STORM","GUST","HUMID","CLIMATE","FORECAST","BAROMETER","SUNSHINE","DROUGHT","FLOOD","TWISTER","SQUALL"]],["Sports Day",["SOCCER","TENNIS","HOCKEY","BASEBALL","BASKETBALL","VOLLEYBALL","GOLF","RUGBY","CRICKET","BOXING","SWIMMING","ARCHERY","FENCING","SKIING","SURFING","CYCLING","ROWING","DIVING","JUDO","KARATE","BOWLING","SKATING","CURLING","POLO","NETBALL","SQUASH","HANDBALL","SAILING"]],["Fruit Basket",["APPLE","BANANA","ORANGE","GRAPE","MANGO","PAPAYA","PEACH","PEAR","PLUM","CHERRY","LEMON","LIME","MELON","KIWI","FIG","DATE","GUAVA","LYCHEE","APRICOT","COCONUT","PINEAPPLE","BERRY","CURRANT","QUINCE","NECTARINE","TANGERINE","POMELO","PERSIMMON"]],["Around the House",["KITCHEN","BEDROOM","GARAGE","ATTIC","CELLAR","PORCH","BALCONY","HALLWAY","WINDOW","DOOR","STAIRS","ROOF","CHIMNEY","FLOOR","CEILING","CARPET","CURTAIN","SOFA","TABLE","CHAIR","LAMP","SHELF","CLOSET","PANTRY","LIBRARY","NURSERY","FOYER","DEN"]],["World Capitals",["PARIS","LONDON","ROME","MADRID","BERLIN","VIENNA","LISBON","OSLO","DUBLIN","ATHENS","CAIRO","NAIROBI","TOKYO","SEOUL","DELHI","BANGKOK","HANOI","LIMA","QUITO","OTTAWA","HAVANA","BOGOTA","CANBERRA","WARSAW","PRAGUE","BUDAPEST","HELSINKI","STOCKHOLM"]],["Musical Instruments",["PIANO","GUITAR","VIOLIN","CELLO","FLUTE","OBOE","CLARINET","TRUMPET","TROMBONE","TUBA","HARP","DRUMS","BANJO","UKULELE","SAXOPHONE","ACCORDION","BASSOON","PICCOLO","XYLOPHONE","CYMBAL","TRIANGLE","MARIMBA","MANDOLIN","HARMONICA","ORGAN","BUGLE","LUTE"]],["Jungle Animals",["TIGER","LEOPARD","JAGUAR","GORILLA","CHIMP","MONKEY","PARROT","TOUCAN","COBRA","PYTHON","ANACONDA","SLOTH","LEMUR","OKAPI","TAPIR","MACAW","GECKO","IGUANA","PANTHER","ORANGUTAN","BABOON","MANDRILL","CHAMELEON","MOSQUITO","PIRANHA","ELEPHANT","RHINO","LION"]],["Dinosaur Dig",["RAPTOR","STEGOSAURUS","TRICERATOPS","BRACHIOSAURUS","FOSSIL","EXTINCT","JURASSIC","TRIASSIC","CRETACEOUS","HERBIVORE","CARNIVORE","SKELETON","AMBER","ASTEROID","PTERODACTYL","ANKYLOSAURUS","DIPLODOCUS","ALLOSAURUS","EGGS","BONES","DIG","MUSEUM","PALEONTOLOGY","FERN","SWAMP","VOLCANO","TAIL","CLAW"]],["Back to School",["PENCIL","ERASER","RULER","BINDER","NOTEBOOK","BACKPACK","LOCKER","TEACHER","STUDENT","HOMEWORK","LESSON","RECESS","CAFETERIA","LIBRARY","GYM","PLAYGROUND","CHALK","MARKER","STAPLER","GLUE","SCISSORS","CRAYON","TEXTBOOK","QUIZ","EXAM","GRADE","DESK","BELL"]],["Gemstones & Metals",["DIAMOND","RUBY","EMERALD","SAPPHIRE","OPAL","TOPAZ","GARNET","AMETHYST","PEARL","JADE","ONYX","AGATE","QUARTZ","TURQUOISE","GOLD","SILVER","COPPER","IRON","TIN","ZINC","PLATINUM","BRONZE","BRASS","STEEL","LEAD","NICKEL","COBALT","TITANIUM"]],["Pirates Ahoy",["PIRATE","CAPTAIN","TREASURE","PARROT","CUTLASS","PLANK","ANCHOR","COMPASS","ISLAND","MAP","CHEST","SAILOR","SHIPWRECK","CANNON","FLAG","SKULL","RUM","BOOTY","CREW","DECK","MAST","HOOK","PATCH","GALLEON","LAGOON","VOYAGE","HARBOR","BUCCANEER"]],["Camping Trip",["TENT","CAMPFIRE","LANTERN","COMPASS","BACKPACK","HIKING","TRAIL","FOREST","RIVER","KAYAK","MARSHMALLOW","SLEEPING","STOVE","CANTEEN","FLASHLIGHT","BINOCULARS","MOSQUITO","FISHING","LAKE","MOUNTAIN","SUMMIT","RANGER","FIREWOOD","HAMMOCK","TARP","COOLER","KINDLING"]],["Science Lab",["ATOM","MOLECULE","ELEMENT","CELL","GENE","NEURON","ENZYME","PROTEIN","ENERGY","FORCE","MAGNET","MICROSCOPE","BEAKER","FLASK","EXPERIMENT","HYPOTHESIS","THEORY","LABORATORY","CHEMICAL","REACTION","OXYGEN","CARBON","NITROGEN","HYDROGEN","GRAVITY","VELOCITY","FRICTION"]],["Breakfast Time",["PANCAKE","WAFFLE","OMELET","BACON","SAUSAGE","TOAST","BAGEL","CEREAL","MUFFIN","CROISSANT","YOGURT","GRANOLA","OATMEAL","SYRUP","BUTTER","JAM","HONEY","COFFEE","TEA","JUICE","MILK","EGGS","PORRIDGE","SCONE","DONUT","FRUIT","CREPE"]],["Wild West",["COWBOY","SHERIFF","OUTLAW","SALOON","HORSE","SADDLE","LASSO","RANCH","CATTLE","STAMPEDE","DESERT","CANYON","CACTUS","WAGON","BANDIT","DEPUTY","SPURS","BOOTS","HOLSTER","TUMBLEWEED","PRAIRIE","FRONTIER","MARSHAL","POSSE","BUFFALO","RODEO","STAGECOACH"]],["Mythical Creatures",["DRAGON","UNICORN","PHOENIX","GRIFFIN","CENTAUR","MERMAID","TROLL","GOBLIN","GIANT","OGRE","FAIRY","GNOME","DWARF","ELF","WIZARD","WITCH","SPHINX","KRAKEN","HYDRA","PEGASUS","MINOTAUR","YETI","WEREWOLF","VAMPIRE","GHOST","GENIE","CYCLOPS","BASILISK"]],["Garden Party",["ROSE","TULIP","DAISY","LILY","ORCHID","PEONY","IRIS","POPPY","LAVENDER","JASMINE","SUNFLOWER","MARIGOLD","PANSY","VIOLET","BLOSSOM","PETAL","STEM","LEAF","SEED","SOIL","TROWEL","RAKE","SPRINKLER","GREENHOUSE","HEDGE","COMPOST","BUTTERFLY","BEE"]],["Transportation",["AIRPLANE","HELICOPTER","TRAIN","SUBWAY","TRAM","BUS","TAXI","TRUCK","BICYCLE","SCOOTER","MOTORCYCLE","FERRY","SUBMARINE","CANOE","SAILBOAT","YACHT","ROCKET","BALLOON","TRACTOR","AMBULANCE","SKATEBOARD","CARRIAGE","GONDOLA","LIMOUSINE","MINIVAN","TROLLEY","GLIDER"]],["Famous Landmarks",["EIFFEL","PYRAMID","COLOSSEUM","PARTHENON","STONEHENGE","ACROPOLIS","ALCATRAZ","NIAGARA","EVEREST","SAHARA","AMAZON","SERENGETI","VESUVIUS","BROOKLYN","PETRA","ANGKOR","KREMLIN","LOUVRE","VERSAILLES","BASTILLE","ALHAMBRA","UFFIZI","POMPEII"]],["Board Game Night",["CHESS","CHECKERS","MONOPOLY","SCRABBLE","BACKGAMMON","DOMINOES","DICE","CARDS","POKER","BRIDGE","RUMMY","BINGO","CLUE","RISK","SORRY","LUDO","MAHJONG","DARTS","PUZZLE","TRIVIA","CHARADES","JENGA","PAWN","KNIGHT","BISHOP","ROOK","QUEEN"]],["Creepy Crawlies",["SPIDER","BEETLE","BUTTERFLY","MOTH","DRAGONFLY","GRASSHOPPER","CRICKET","CICADA","LADYBUG","MANTIS","CATERPILLAR","WASP","HORNET","BEE","ANT","TERMITE","FLEA","TICK","SCORPION","CENTIPEDE","MILLIPEDE","WORM","SNAIL","SLUG","FIREFLY","MOSQUITO","COCKROACH","LOCUST"]],["Winter Wonderland",["SNOWMAN","SLED","SKIS","SKATES","MITTENS","SCARF","PARKA","BOOTS","COCOA","FIREPLACE","ICICLE","BLIZZARD","SNOWFLAKE","IGLOO","FROST","GLACIER","TOBOGGAN","BEANIE","CAROL","WREATH","LANTERN","HIBERNATE","SLEIGH","FLURRY","SNOWDRIFT","CHILL","SNOWBALL"]],["Healthy Habits",["SLEEP","EXERCISE","WATER","VEGETABLE","PROTEIN","FIBER","VITAMIN","CALCIUM","STRETCH","YOGA","JOGGING","WALKING","SWIMMING","BREATHE","MEDITATE","HYDRATE","BALANCE","ENERGY","MUSCLE","HEART","LUNGS","BONES","POSTURE","RELAX","NUTRITION","DIET","SALAD","FRUIT"]],["Ancient Worlds",["PHARAOH","PYRAMID","SPHINX","TEMPLE","GLADIATOR","EMPEROR","SENATE","LEGION","CHARIOT","SCROLL","PAPYRUS","HIEROGLYPH","MUMMY","TOMB","ORACLE","ODYSSEY","SPARTA","ATHENS","BABYLON","PERSIA","VIKING","SAMURAI","ARMOR","CATAPULT","AQUEDUCT","MOSAIC","AMPHORA","ARCHAEOLOGY"]]];

  const WS_DIR = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
  const WS_D = {
    easy: { n: 10, k: 8, d: [0, 1, 2], t: 'Easy', m: 8 },
    med: { n: 12, k: 10, d: [0, 1, 2, 3], t: 'Medium', m: 12 },
    hard: { n: 15, k: 14, d: [0, 1, 2, 3, 4, 5, 6, 7], t: 'Hard', m: 15 }
  };
  const WS_COL = ['#ffd84d', '#8ee0a1', '#8ecbff', '#ffa6c1', '#c3a6ff', '#ffb27a', '#7fe3d6', '#d6e26f', '#f2a0ff', '#a3b8ff', '#ff9d9d', '#9fe870', '#ffc766', '#85d0e6'];

  function wsCount(g, n, w) {
    const seen = new Set();
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (g[r * n + c] !== w[0]) continue;
      for (const [dr, dc] of WS_DIR) {
        const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
        if (er < 0 || er >= n || ec < 0 || ec >= n) continue;
        let ok = true;
        for (let i = 1; i < w.length; i++) if (g[(r + dr * i) * n + c + dc * i] !== w[i]) { ok = false; break; }
        if (ok) {
          const cells = [];
          for (let i = 0; i < w.length; i++) cells.push((r + dr * i) * n + c + dc * i);
          seen.add(cells.sort((a, b) => a - b).join(','));
        }
      }
    }
    return seen.size;
  }

  function wsMake(seed, ti, diff) {
    const R = mul(seed), D = WS_D[diff], n = D.n, T = WS_T[ti], pool = T[1].filter(w => w.length >= 3 && w.length <= D.m);
    for (let tries = 0; tries < 300; tries++) {
      const k = tries < 150 ? D.k : Math.max(5, D.k - 3), ws = [];
      for (const w of shuf(pool.slice(), R)) {
        if (ws.length >= k) break;
        const rv = [...w].reverse().join('');
        if (ws.some(x => x.includes(w) || x.includes(rv) || w.includes(x) || rv.includes(x))) continue;
        ws.push(w);
      }
      if (ws.length < 5) continue;
      const g = Array(n * n).fill(''), put = [];
      let fail = false;
      for (const w of ws.slice().sort((a, b) => b.length - a.length)) {
        let done = false;
        for (let a = 0; a < 500 && !done; a++) {
          const d = D.d[Math.floor(R() * D.d.length)], dr = WS_DIR[d][0], dc = WS_DIR[d][1];
          const r0 = Math.floor(R() * n), c0 = Math.floor(R() * n), r1 = r0 + dr * (w.length - 1), c1 = c0 + dc * (w.length - 1);
          if (r1 < 0 || r1 >= n || c1 < 0 || c1 >= n) continue;
          let good = true;
          for (let i = 0; i < w.length; i++) { const v = g[(r0 + dr * i) * n + c0 + dc * i]; if (v && v !== w[i]) { good = false; break; } }
          if (!good) continue;
          for (let i = 0; i < w.length; i++) g[(r0 + dr * i) * n + c0 + dc * i] = w[i];
          put.push({ w, r: r0, c: c0, d }); done = true;
        }
        if (!done) { fail = true; break; }
      }
      if (fail) continue;
      const bag = ws.join('') + 'AEIOURSTLNABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let f = 0; f < 30; f++) {
        const gg = g.map(ch => ch || bag[Math.floor(R() * bag.length)]);
        if (ws.every(w => wsCount(gg, n, w) === 1)) {
          put.sort((a, b) => a.w < b.w ? -1 : 1);
          return { name: T[0], n, g: gg, put, diff };
        }
      }
    }
    return null;
  }
  function wsBuild(day, diff) {
    const di = ['easy', 'med', 'hard'].indexOf(diff), ti = dIdx(day, WS_T.length, di * 9);
    for (let s = day * 31 + di * 7 + 1, i = 0; i < 400; i++, s += 1013) { const p = wsMake(s, ti, diff); if (p) return p; }
    return wsMake(7, 0, diff);
  }

  Ameplay.register({
    id: 'word-search',
    title: 'Word Search',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' pts',
    width: 760,
    blurb: 'Drag across the letters to find every hidden word. A new themed grid every day, plus an archive.',
    help: 'Drag from the first to the last letter of a word, in any direction · found words are struck off the list · <kbd>H</kbd> or the Hint button flashes a first letter',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="50" height="50" rx="9"/><rect x="13" y="17" width="38" height="13" rx="6.5" fill="currentColor" opacity=".22"/><path d="M19 24h.01M27 24h.01M35 24h.01M43 24h.01M19 38h.01M27 38h.01M35 38h.01M43 38h.01M19 46h.01M27 46h.01M35 46h.01M43 46h.01" stroke-width="4"/></svg>',
    css: baseCss('word-search') + `
.gm-word-search .ws-bar{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;width:100%}
.gm-word-search .ws-tm{min-width:52px;font:800 20px/1 ${FONT};font-variant-numeric:tabular-nums;letter-spacing:.02em}
.gm-word-search .ws-theme{margin:0;font:800 20px/1.1 ${FONT};letter-spacing:-.01em;text-align:center}
.gm-word-search .ws-main{display:flex;align-items:flex-start;justify-content:center;gap:22px;width:100%}
.gm-word-search .ws-board{position:relative;flex:0 1 auto;width:min(100%,540px,max(260px,calc(100dvh - 400px)));aspect-ratio:1;touch-action:none;cursor:pointer;border-radius:14px;background:#f6f7f8;border:1px solid #e1e3e6;padding:6px;box-sizing:border-box;container-type:inline-size}
.gm-word-search .ws-grid{position:absolute;inset:6px;display:grid;z-index:2;pointer-events:none}
.gm-word-search .ws-c{display:grid;place-items:center;font:700 clamp(12px,4.6cqw,26px)/1 ${FONT};color:#1a1b1c;text-transform:uppercase}
.gm-word-search .ws-c.hint{animation:gmWsHint .5s ease-in-out 5;color:#fff;background:#121213;border-radius:50%}
.gm-word-search .ws-hl{position:absolute;inset:6px;z-index:1;pointer-events:none}
.gm-word-search .ws-cap{position:absolute;border-radius:999px;transform-origin:var(--o) 50%;mix-blend-mode:multiply}
.gm-word-search .ws-cap.fnd{animation:gmWsFound .45s ease-out}
.gm-word-search .ws-cap.sel{background:rgba(255,200,0,.5)!important;outline:2px solid rgba(214,160,0,.9);outline-offset:-2px}
.gm-word-search .ws-cap.bad{animation:gmWsBad .35s forwards}
.gm-word-search .ws-words{flex:0 0 190px;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr;gap:5px}
.gm-word-search .ws-words li{display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:8px;background:#f0f1f2;font:700 13.5px/1.1 ${FONT};letter-spacing:.04em;text-transform:uppercase;transition:background .2s,color .2s}
.gm-word-search .ws-words li i{flex:none;width:10px;height:10px;border-radius:50%;background:#c9ccd0}
.gm-word-search .ws-words li.on{color:#8a8d90;text-decoration:line-through;text-decoration-thickness:2px}
.gm-word-search .ws-ctl{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
@media (max-width:700px){.gm-word-search .ws-main{flex-direction:column;align-items:center;gap:10px}.gm-word-search .ws-words{flex:none;width:100%;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}.gm-word-search .ws-board{width:min(100%,540px,max(280px,calc(100dvh - 470px)))}.gm-word-search .ws-words li{padding:4px 8px;font-size:12px}}
@keyframes gmWsHint{50%{transform:scale(1.35)}}
@keyframes gmWsFound{0%{opacity:.2;transform:scaleX(.4)}100%{opacity:1;transform:scaleX(1)}}
@keyframes gmWsBad{to{opacity:0}}
`,
    _t: { wsMake, wsBuild, wsCount, WS_T, WS_D },
    mount(root, api) {
      const N = nav(api, root, { open: () => begin(), stats: showStats });
      const S = N.S, selD = { diff: WS_D[S.diff] ? S.diff : 'med' };
      root.append(N.el);
      root.insertAdjacentHTML('beforeend', `<div class="ws-bar"><span class="ws-df"></span><span class="ws-tm">0:00</span><button type="button" class="pill ws-hint">Hint</button></div><h3 class="ws-theme"></h3>
        <div class="ws-main"><div class="ws-board"><div class="ws-hl"></div><div class="ws-grid"></div></div><ul class="ws-words"></ul></div>
        <div class="ws-ctl"><button type="button" class="pill dark ws-share" hidden>Share</button></div>`);
      const dfBar = segBar([['diff', [['easy', 'Easy'], ['med', 'Medium'], ['hard', 'Hard']]]], selD, () => { S.diff = selD.diff; begin(); });
      root.querySelector('.ws-df').replaceWith(dfBar);
      const board = root.querySelector('.ws-board'), grid = root.querySelector('.ws-grid'), hl = root.querySelector('.ws-hl'), list = root.querySelector('.ws-words');
      const tm = root.querySelector('.ws-tm'), theme = root.querySelector('.ws-theme'), hintB = root.querySelector('.ws-hint'), shareB = root.querySelector('.ws-share');
      let P, Pr, P0 = null, cells = [], caps = {}, items = {}, started = false, over = false, dragging = null, selCap = null, tickT = 0, lastShown = -1, gen = 0;

      function capsule(r0, c0, r1, c1, n) {
        const T = 0.82, dr = r1 - r0, dc = c1 - c0, len = Math.hypot(dr, dc), ang = Math.atan2(dr, dc) * 180 / Math.PI;
        const el = document.createElement('div');
        el.className = 'ws-cap';
        const u = 100 / n;
        el.style.cssText = `left:${(c0 + .5 - T / 2) * u}%;top:${(r0 + .5 - T / 2) * u}%;width:${(len + T) * u}%;height:${T * u}%;--o:${T / 2 / (len + T) * 100}%;transform:rotate(${ang}deg)`;
        return el;
      }
      function setTime() {
        const s = Math.floor(P0.t);
        if (s !== lastShown) { lastShown = s; tm.textContent = mmss(s); }
      }
      function info() {
        N.info(`${P0.f.length}/${Pr.put.length} found`);
        api.score(`${P0.f.length}/${Pr.put.length}`);
      }
      function begin() {
        gen++;
        const day = N.day(), key = 'd' + day + selD.diff;
        P0 = N.prog(key);
        if (!Array.isArray(P0.f)) P0.f = [];
        if (typeof P0.t !== 'number') P0.t = 0;
        P0.h = P0.h | 0;
        Pr = wsBuild(day, selD.diff);
        if (P0.f.some(i => i >= Pr.put.length)) { P0.f = []; P0.t = 0; P0.done = false; }
        over = !!P0.done; started = P0.t > 0 && !over; dragging = null; selCap = null; lastShown = -1;
        const n = Pr.n;
        grid.style.gridTemplateColumns = `repeat(${n},1fr)`;
        grid.style.gridTemplateRows = `repeat(${n},1fr)`;
        grid.innerHTML = Pr.g.map(ch => `<div class="ws-c">${ch}</div>`).join('');
        cells = [...grid.children];
        hl.innerHTML = '';
        caps = {};
        theme.textContent = Pr.name;
        list.innerHTML = Pr.put.map((p, i) => `<li data-i="${i}"><i></i><span>${p.w}</span></li>`).join('');
        items = {};
        [...list.children].forEach((li, i) => { items[i] = li; });
        P0.f.forEach(i => markFound(i, false));
        hintB.disabled = over;
        shareB.hidden = !over;
        setTime(); info(); N.persist();
      }
      function markFound(i, anim) {
        const p = Pr.put[i], d = WS_DIR[p.d], k = p.w.length - 1;
        const el = capsule(p.r, p.c, p.r + d[0] * k, p.c + d[1] * k, Pr.n);
        const col = WS_COL[i % WS_COL.length];
        el.style.background = col;
        if (anim) el.classList.add('fnd');
        hl.append(el);
        caps[i] = el;
        items[i].classList.add('on');
        items[i].querySelector('i').style.background = col;
      }
      function cellAt(e, clamp) {
        const rc = board.getBoundingClientRect(), pad = 6, s = (rc.width - pad * 2) / Pr.n;
        const fx = (e.clientX - rc.left - pad) / s, fy = (e.clientY - rc.top - pad) / s;
        return { fx, fy, r: Math.floor(fy), c: Math.floor(fx) };
      }
      function pathTo(e) {
        const q = cellAt(e), n = Pr.n, a = dragging;
        const vx = q.fx - (a.c + .5), vy = q.fy - (a.r + .5);
        if (Math.hypot(vx, vy) < .55) return { r: a.r, c: a.c, steps: 0, d: null };
        const ang = Math.round(Math.atan2(vy, vx) / (Math.PI / 4));
        const dc = Math.round(Math.cos(ang * Math.PI / 4)), dr = Math.round(Math.sin(ang * Math.PI / 4));
        const proj = (vx * dc + vy * dr) / (dc * dc + dr * dr);
        let steps = Math.max(0, Math.round(proj));
        while (steps > 0) {
          const er = a.r + dr * steps, ec = a.c + dc * steps;
          if (er >= 0 && er < n && ec >= 0 && ec < n) break;
          steps--;
        }
        return { r: a.r + dr * steps, c: a.c + dc * steps, steps, d: [dr, dc] };
      }
      function drawSel(p) {
        if (selCap) selCap.remove();
        selCap = capsule(dragging.r, dragging.c, p.r, p.c, Pr.n);
        selCap.classList.add('sel');
        hl.append(selCap);
      }
      function finish(p) {
        const n = Pr.n, a = dragging;
        dragging = null;
        const cap = selCap; selCap = null;
        const bad = () => { if (cap) { cap.classList.add('bad'); cap.addEventListener('animationend', () => cap.remove()); } };
        if (p.steps < 2) return bad();
        let s = '';
        for (let i = 0; i <= p.steps; i++) s += Pr.g[(a.r + p.d[0] * i) * n + a.c + p.d[1] * i];
        const rs = [...s].reverse().join('');
        const i = Pr.put.findIndex((x, ix) => !P0.f.includes(ix) && (x.w === s || x.w === rs));
        if (i < 0) { api.sfx('tick'); return bad(); }
        if (cap) cap.remove();
        P0.f.push(i);
        markFound(i, true);
        api.sfx('good');
        popText(root, items[i], '+' + Pr.put[i].w.length);
        info();
        if (P0.f.length === Pr.put.length) win(); else N.persist();
      }
      function win() {
        over = true; P0.done = true;
        const D = WS_D[selD.diff], k = Pr.put.length, t = P0.t;
        const pts = Math.round(k * 100 * (1 + Math.max(0, 1 - t / (k * 20)))) - P0.h * 25;
        P0.sc = Math.max(50, pts);
        const st = N.S.st;
        addRes(st, true, N.day(), N.today);
        if (!st.b[selD.diff] || t < st.b[selD.diff]) st.b[selD.diff] = Math.round(t);
        N.persist();
        hintB.disabled = true; shareB.hidden = false;
        const best = api.submit(P0.sc), my = gen;
        api.sfx('win');
        confetti(root, api);
        info();
        api.timeout(() => {
          if (my !== gen) return;
          api.overlay({
            kicker: best ? 'New best!' : 'Puzzle solved',
            title: `${Pr.name} · ${D.t}`,
            text: `Found all ${k} words in ${mmss(t)}${P0.h ? ` with ${P0.h} hint${P0.h > 1 ? 's' : ''}` : ''}.`,
            stats: [['Score', P0.sc], ['Time', mmss(t)], ['Streak', curStreak(st, N.today)], ['Best', mmss(st.b[selD.diff])]],
            button: 'Share result', onAction: share, secondary: 'Close'
          });
        }, 1100);
      }
      function share() {
        const D = WS_D[selD.diff], k = Pr.put.length;
        copy(api, `Word Search · ${Pr.name} · ${D.t}\n${dateLbl(N.day(), true)}\nFound ${k}/${k} in ${mmss(P0.t)}${P0.h ? ` · ${P0.h} hint${P0.h > 1 ? 's' : ''}` : ''}\nScore ${P0.sc}`);
      }
      function showStats() {
        const st = N.S.st;
        statsOv(api, N, [['Best ' + WS_D[selD.diff].t, st.b[selD.diff] ? mmss(st.b[selD.diff]) : '—']]);
      }
      function hint() {
        if (over || api.paused) return;
        const left = Pr.put.map((p, i) => i).filter(i => !P0.f.includes(i));
        if (!left.length) return;
        const p = Pr.put[left[Math.floor(Math.random() * left.length)]], c = cells[p.r * Pr.n + p.c];
        started = true; P0.h++; P0.t += 10;
        c.classList.add('hint');
        api.timeout(() => c.classList.remove('hint'), 2600);
        api.toast('Hint: one word starts at the highlighted letter · +10s');
        api.sfx('pop');
        N.persist();
      }

      board.addEventListener('pointerdown', e => {
        if (e.button || over || api.paused || dragging) return;
        const q = cellAt(e);
        if (q.r < 0 || q.c < 0 || q.r >= Pr.n || q.c >= Pr.n) return;
        e.preventDefault();
        try { board.setPointerCapture(e.pointerId); } catch (x) {}
        dragging = { r: q.r, c: q.c, id: e.pointerId };
        started = true;
        drawSel({ r: q.r, c: q.c });
      });
      board.addEventListener('pointermove', e => {
        if (!dragging || e.pointerId !== dragging.id) return;
        drawSel(pathTo(e));
      });
      const end = e => {
        if (!dragging || e.pointerId !== dragging.id) return;
        const p = e.type === 'pointercancel' ? { steps: 0 } : pathTo(e);
        finish(p);
      };
      board.addEventListener('pointerup', end);
      board.addEventListener('pointercancel', end);
      tap(hintB.parentNode, '.ws-hint', hint);
      tap(shareB.parentNode, '.ws-share', share);
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || blocked(api)) return;
        if (e.key === 'h' || e.key === 'H') hint();
      });
      api.loop(dt => {
        if (!started || over || !P0) return;
        P0.t += dt; tickT += dt;
        setTime();
        if (tickT > 5) { tickT = 0; N.persist(); }
      });
      begin();
    }
  });

  function cwModel(rows) {
    const cell = rows.map(r => [...r]);
    const white = (r, c) => r >= 0 && r < 5 && c >= 0 && c < 5 && cell[r][c] !== '#';
    const nums = Array(25).fill(0), A = [], D = [], ca = Array(25).fill(-1), cd = Array(25).fill(-1), sol = Array(25).fill('');
    let k = 0;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      if (!white(r, c)) continue;
      sol[r * 5 + c] = cell[r][c];
      const sa = !white(r, c - 1) && white(r, c + 1), sd = !white(r - 1, c) && white(r + 1, c);
      if (!sa && !sd) continue;
      nums[r * 5 + c] = ++k;
      if (sa) {
        const cs = [];
        for (let x = c; white(r, x); x++) cs.push(r * 5 + x);
        A.push({ n: k, dir: 'a', cells: cs, ans: cs.map(i => cell[Math.floor(i / 5)][i % 5]).join('') });
        cs.forEach(i => { ca[i] = A.length - 1; });
      }
      if (sd) {
        const cs = [];
        for (let y = r; white(y, c); y++) cs.push(y * 5 + c);
        D.push({ n: k, dir: 'd', cells: cs, ans: cs.map(i => cell[Math.floor(i / 5)][i % 5]).join('') });
        cs.forEach(i => { cd[i] = D.length - 1; });
      }
    }
    return { cell, nums, A, D, ca, cd, sol };
  }

  Ameplay.register({
    id: 'crossword',
    title: 'Mini Crossword',
    category: 'Puzzle',
    better: 'low',
    format: v => mmss(v),
    width: 760,
    blurb: 'A bite-sized 5x5 crossword with real clues. A new grid every day, plus an archive.',
    help: 'Type letters or tap the keys · click a square twice (or press <kbd>Space</kbd>) to flip across/down · <kbd>Tab</kbd> next clue · arrows move · <kbd>⌫</kbd> deletes',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48" rx="6"/><path d="M24 8v48M40 8v48M8 24h48M8 40h48"/><rect x="24" y="24" width="16" height="16" fill="currentColor" opacity=".3"/><path d="M8 8h16v16H8z" fill="currentColor"/></svg>',
    css: baseCss('crossword') + `
.gm-crossword .cw-left{display:flex;flex-direction:column;gap:10px;flex:0 1 auto;width:min(100%,400px,max(250px,calc(100dvh - 380px)))}
.gm-crossword .cw-top{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}
.gm-crossword .cw-tm{min-width:56px;font:800 22px/1 ${FONT};font-variant-numeric:tabular-nums}
.gm-crossword .cw-btns{display:flex;gap:8px}
.gm-crossword .cw-mw{position:relative}
.gm-crossword .cw-pop{position:absolute;right:0;top:calc(100% + 6px);z-index:12;display:flex;flex-direction:column;min-width:140px;padding:6px;border-radius:10px;background:#fff;border:1px solid #c9ccd0;box-shadow:0 10px 24px -8px rgba(0,0,0,.35)}
.gm-crossword .cw-pop[hidden]{display:none}
.gm-crossword .cw-pop button{height:38px;padding:0 12px;border:0;border-radius:6px;background:none;text-align:left;font:600 14px/1 ${FONT};color:#121213;cursor:pointer}
.gm-crossword .cw-pop button:hover{background:#f0f1f2}
.gm-crossword .cw-clue{display:flex;align-items:stretch;width:100%;min-height:54px;background:#a7d8ff;border-radius:6px;overflow:hidden}
.gm-crossword .cw-clue button{flex:0 0 44px;border:0;background:none;font-size:26px;line-height:1;color:#121213;cursor:pointer;touch-action:manipulation}
.gm-crossword .cw-clue button:active{background:rgba(0,0,0,.1)}
.gm-crossword .cw-ct{flex:1;display:flex;align-items:center;gap:10px;padding:6px 4px;font:500 17px/1.25 ${FONT}}
.gm-crossword .cw-ct b{flex:none;font-weight:800}
.gm-crossword .cw-main{display:flex;align-items:flex-start;justify-content:center;gap:28px;width:100%}
.gm-crossword .cw-grid{position:relative;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(5,1fr);gap:1px;width:100%;aspect-ratio:1;background:#121213;border:2px solid #121213;box-sizing:border-box}
.gm-crossword .cw-c{position:relative;display:grid;place-items:center;background:#fff;cursor:pointer;container-type:size;overflow:hidden;touch-action:manipulation}
.gm-crossword .cw-c.blk{background:#121213;cursor:default}
.gm-crossword .cw-c.hl{background:#a7d8ff}
.gm-crossword .cw-c.cur{background:#ffda00}
.gm-crossword .cw-c .n{position:absolute;left:6%;top:4%;font:600 15cqh/1 ${FONT};color:#121213}
.gm-crossword .cw-c .l{font:700 52cqh/1 ${FONT};text-transform:uppercase;padding-top:12%}
.gm-crossword .cw-c.wr .l{color:#d4271c}
.gm-crossword .cw-c.wr::after{content:"";position:absolute;inset:0;background:linear-gradient(to top right,transparent calc(50% - 1px),#d4271c calc(50% - 1px),#d4271c calc(50% + 1px),transparent calc(50% + 1px))}
.gm-crossword .cw-c.rv::before{content:"";position:absolute;right:0;top:0;border-style:solid;border-width:0 24cqh 24cqh 0;border-color:transparent #3a6fd6 transparent transparent}
.gm-crossword .cw-c.pop{animation:gmCwPop .12s}
.gm-crossword .cw-c.wave{animation:gmCwWave .6s both}
.gm-crossword .cw-lists{display:flex;gap:22px;flex:0 1 330px;min-width:0;max-height:calc(100dvh - 380px);min-height:200px;overflow:auto}
.gm-crossword .cw-lists>div{flex:1;min-width:0}
.gm-crossword .cw-lists h4{margin:0 0 6px;font:800 12px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#5b5d60;padding-bottom:6px;border-bottom:1px solid #d3d6da}
.gm-crossword .cw-lists ol{list-style:none;margin:0;padding:0}
.gm-crossword .cw-lists li{display:flex;gap:7px;padding:5px 6px;border-radius:5px;font:500 13.5px/1.25 ${FONT};cursor:pointer}
.gm-crossword .cw-lists li b{flex:none;width:18px;text-align:right;font-weight:800}
.gm-crossword .cw-lists li:hover{background:#f0f1f2}
.gm-crossword .cw-lists li.hl{background:#dff0ff}
.gm-crossword .cw-lists li.cur{background:#a7d8ff}
.gm-crossword .cw-lists li.ok{color:#8a8d90}
.gm-crossword .cw-kb{display:none;flex-direction:column;gap:7px;width:min(500px,100%);position:sticky;bottom:0;z-index:7;background:#fff;padding:8px 0 calc(8px + env(safe-area-inset-bottom,0px));margin-top:auto}
.gm-crossword .cw-kr{display:flex;justify-content:center;gap:5px}
.gm-crossword .cw-kb button{flex:1 1 0;min-width:0;max-width:40px;height:50px;padding:0;display:grid;place-items:center;border:0;border-radius:5px;background:#e3e5e8;color:#121213;font:700 17px/1 ${FONT};text-transform:uppercase;cursor:pointer;touch-action:manipulation}
.gm-crossword .cw-kb button:active{background:#c9ccd0}
.gm-crossword .cw-kb button.wide{flex-grow:1.5;max-width:60px}
.gm-crossword .cw-grid .msg{top:40%}
@media (pointer:coarse),(max-width:700px){.gm-crossword .cw-kb{display:flex}.gm-crossword .cw-lists{display:none}.gm-crossword .cw-left{width:min(100%,400px,max(240px,calc(100dvh - 480px)))}}
@media (max-width:560px){.gm-crossword .cw-kr:last-child{padding-right:44px}}
@media (max-width:420px){.gm-crossword .cw-ct{font-size:15px}.gm-crossword .cw-kb button{height:46px}}
@keyframes gmCwPop{50%{transform:scale(1.12)}}
@keyframes gmCwWave{0%{background:#fff}40%{background:#ffda00}100%{background:#a7d8ff}}
`,
    _t: { cwModel, CW_G, CW_C },
    mount(root, api) {
      const N = nav(api, root, { open: () => begin(), stats: showStats });
      root.append(N.el);
      const kr = r => [...r].map(k => k === '<' ? '<button type="button" tabindex="-1" class="wide" data-k="back" aria-label="Delete">&#9003;</button>' : `<button type="button" tabindex="-1" data-k="${k}">${k}</button>`).join('');
      root.insertAdjacentHTML('beforeend', `<div class="cw-main"><div class="cw-left"><div class="cw-top"><span class="cw-tm">0:00</span><div class="cw-btns">
          <div class="cw-mw"><button type="button" class="pill cw-m" data-m="chk">Check</button><div class="cw-pop" hidden><button type="button" data-s="sq">Square</button><button type="button" data-s="wd">Word</button><button type="button" data-s="pz">Puzzle</button></div></div>
          <div class="cw-mw"><button type="button" class="pill cw-m" data-m="rev">Reveal</button><div class="cw-pop" hidden><button type="button" data-s="sq">Square</button><button type="button" data-s="wd">Word</button><button type="button" data-s="pz">Puzzle</button></div></div>
        </div></div>
        <div class="cw-clue"><button type="button" tabindex="-1" class="cw-pv" aria-label="Previous clue">&#8249;</button><div class="cw-ct"><b></b><span></span></div><button type="button" tabindex="-1" class="cw-nx" aria-label="Next clue">&#8250;</button></div>
        <div class="cw-grid"></div></div><div class="cw-lists"><div><h4>Across</h4><ol class="cw-la"></ol></div><div><h4>Down</h4><ol class="cw-ld"></ol></div></div></div>
        <div class="cw-kb">${['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM<'].map(r => `<div class="cw-kr">${kr(r)}</div>`).join('')}</div>`);
      const grid = root.querySelector('.cw-grid'), tm = root.querySelector('.cw-tm'), ctB = root.querySelector('.cw-ct b'), ctS = root.querySelector('.cw-ct span');
      const lists = { a: root.querySelector('.cw-la'), d: root.querySelector('.cw-ld') };
      let M, P, L, WR, RV, cur = 0, dir = 'a', over = false, started = false, tickT = 0, lastShown = -1, cs = [], gen = 0;

      const wordAt = (i, d) => d === 'a' ? M.A[M.ca[i]] : M.D[M.cd[i]];
      const word = () => wordAt(cur, dir);
      const clueOf = e => CW_C[e.ans] || '';
      const order = () => M.A.concat(M.D);
      const save = () => {
        P.l = L.map(x => x || '.').join('');
        P.v = RV.map(x => x ? 1 : 0).join('');
        N.persist();
      };
      function setTime() {
        const s = Math.floor(P.t);
        if (s !== lastShown) { lastShown = s; tm.textContent = mmss(s); api.score(mmss(s)); }
      }
      function paint() {
        const w = word(), inW = new Set(w ? w.cells : []);
        cs.forEach((el, i) => {
          if (M.sol[i] === '') return;
          el.classList.toggle('cur', i === cur);
          el.classList.toggle('hl', i !== cur && inW.has(i));
          el.classList.toggle('wr', !!WR[i]);
          el.classList.toggle('rv', !!RV[i]);
          el.querySelector('.l').textContent = L[i];
        });
        if (w) { ctB.textContent = w.n + (w.dir === 'a' ? 'A' : 'D'); ctS.textContent = clueOf(w); }
        const x = wordAt(cur, dir === 'a' ? 'd' : 'a');
        ['a', 'd'].forEach(d => (d === 'a' ? M.A : M.D).forEach((e, k) => {
          const li = lists[d].children[k];
          li.classList.toggle('cur', e === w);
          li.classList.toggle('hl', e === x);
          li.classList.toggle('ok', e.cells.every(c => L[c] && L[c] === M.sol[c]));
        }));
        const li = w && lists[dir].children[(dir === 'a' ? M.A : M.D).indexOf(w)], box = lists.a.closest('.cw-lists');
        if (li && box.offsetParent) {
          const bx = box.getBoundingClientRect(), r = li.getBoundingClientRect();
          if (r.top < bx.top) box.scrollTop += r.top - bx.top - 8;
          else if (r.bottom > bx.bottom) box.scrollTop += r.bottom - bx.bottom + 8;
        }
      }
      function begin() {
        gen++;
        const day = N.day(), idx = dIdx(day, CW_G.length, 3);
        M = cwModel(CW_G[idx]);
        P = N.prog('d' + day);
        const l = typeof P.l === 'string' && P.l.length === 25 ? P.l : '.'.repeat(25), v = typeof P.v === 'string' && P.v.length === 25 ? P.v : '0'.repeat(25);
        L = [...l].map((c, i) => M.sol[i] === '' || c === '.' ? '' : c);
        RV = [...v].map((c, i) => M.sol[i] !== '' && c === '1' && !!L[i]);
        WR = Array(25).fill(false);
        if (typeof P.t !== 'number') P.t = 0;
        over = !!P.done; started = P.t > 0 && !over; lastShown = -1;
        grid.innerHTML = '';
        cs = [];
        for (let i = 0; i < 25; i++) {
          const el = document.createElement('div');
          el.dataset.i = i;
          if (M.sol[i] === '') el.className = 'cw-c blk';
          else el.className = 'cw-c', el.innerHTML = `${M.nums[i] ? `<span class="n">${M.nums[i]}</span>` : ''}<span class="l"></span>`;
          grid.append(el); cs.push(el);
        }
        ['a', 'd'].forEach(d => {
          lists[d].innerHTML = (d === 'a' ? M.A : M.D).map((e, k) => `<li data-d="${d}" data-k="${k}"><b>${e.n}</b><span>${clueOf(e)}</span></li>`).join('');
        });
        const first = M.A[0];
        cur = first.cells[0]; dir = 'a';
        const fe = first.cells.find(c => !L[c]);
        if (fe !== undefined) cur = fe;
        paint(); setTime();
        N.info(over ? (P.as ? 'solved with help' : 'solved') : '');
        api.label('Time');
        N.persist();
      }
      function select(i, flip) {
        if (M.sol[i] === '') return;
        if (i === cur && flip) { const o = dir === 'a' ? 'd' : 'a'; if (wordAt(i, o)) dir = o; }
        else { cur = i; if (!wordAt(i, dir)) dir = dir === 'a' ? 'd' : 'a'; }
        paint();
      }
      function jumpTo(e) {
        dir = e.dir;
        const t = e.cells.find(c => !L[c]);
        cur = t !== undefined ? t : e.cells[0];
        paint();
      }
      function step(d) {
        const o = order(), w = word(), i = o.indexOf(w);
        jumpTo(o[(i + d + o.length) % o.length]);
      }
      function begun() { if (!started && !over) { started = true; } }
      function type(ch) {
        if (over || blocked(api)) return;
        begun();
        L[cur] = ch; WR[cur] = false;
        const el = cs[cur];
        restart(el, 'pop');
        const w = word(), ix = w.cells.indexOf(cur);
        if (ix < w.cells.length - 1) cur = w.cells[ix + 1];
        else if (w.cells.every(c => L[c])) {
          save(); paint();
          if (!complete()) {
            const o = order(), k = o.indexOf(w);
            for (let j = 1; j <= o.length; j++) { const e = o[(k + j) % o.length]; if (e.cells.some(c => !L[c])) { jumpTo(e); break; } }
          }
          return;
        }
        save(); paint(); complete();
      }
      function back() {
        if (over || blocked(api)) return;
        if (L[cur] && !RV[cur]) { L[cur] = ''; WR[cur] = false; }
        else {
          const w = word(), ix = w.cells.indexOf(cur);
          let t = -1;
          if (ix > 0) t = w.cells[ix - 1];
          else { const o = order(), k = o.indexOf(w); if (k > 0) { dir = o[k - 1].dir; t = o[k - 1].cells[o[k - 1].cells.length - 1]; } }
          if (t >= 0) { cur = t; if (!RV[cur]) { L[cur] = ''; WR[cur] = false; } }
        }
        save(); paint();
      }
      function move(dr, dc) {
        const axis = dr ? 'd' : 'a';
        if (axis !== dir) { if (wordAt(cur, axis)) { dir = axis; paint(); } return; }
        let r = Math.floor(cur / 5) + dr, c = cur % 5 + dc;
        while (r >= 0 && r < 5 && c >= 0 && c < 5) {
          if (M.sol[r * 5 + c] !== '') { cur = r * 5 + c; if (!wordAt(cur, dir)) dir = dir === 'a' ? 'd' : 'a'; paint(); return; }
          r += dr; c += dc;
        }
      }
      function complete() {
        const idx = [];
        for (let i = 0; i < 25; i++) if (M.sol[i] !== '') idx.push(i);
        if (!idx.every(i => L[i])) return false;
        if (idx.every(i => L[i] === M.sol[i])) { win(); return true; }
        flash(grid, 'Something is not quite right');
        return false;
      }
      function scope(s) {
        if (s === 'sq') return [cur];
        if (s === 'wd') return word().cells;
        const o = [];
        for (let i = 0; i < 25; i++) if (M.sol[i] !== '') o.push(i);
        return o;
      }
      function check(s) {
        if (over) return;
        let bad = 0;
        scope(s).forEach(i => { if (L[i] && L[i] !== M.sol[i]) { WR[i] = true; bad++; } });
        paint();
        if (bad) { api.sfx('bad'); flash(grid, bad === 1 ? '1 square is wrong' : bad + ' squares are wrong'); }
        else { api.sfx('good'); flash(grid, 'No mistakes so far'); }
        complete();
      }
      function reveal(s) {
        if (over) return;
        begun();
        scope(s).forEach(i => { if (L[i] !== M.sol[i]) { L[i] = M.sol[i]; RV[i] = true; WR[i] = false; } });
        P.as = 1;
        save(); paint();
        api.sfx('pop');
        complete();
      }
      function win() {
        over = true; P.done = true;
        const t = Math.round(P.t), as = !!P.as, st = N.S.st;
        addRes(st, !as, N.day(), N.today);
        if (!as) { st.b.n = (st.b.n | 0) + 1; st.b.s = (st.b.s | 0) + t; if (!st.b.m || t < st.b.m) st.b.m = t; }
        save();
        N.info(as ? 'solved with help' : 'solved');
        const my = gen, best = as ? false : api.submit(Math.max(1, t));
        api.sfx('win');
        cs.forEach((el, i) => { if (M.sol[i] !== '') { el.classList.remove('wr'); el.style.animationDelay = (i % 5 + Math.floor(i / 5)) * 70 + 'ms'; restart(el, 'wave'); } });
        if (!as) confetti(root, api);
        api.timeout(() => {
          if (my !== gen) return;
          api.overlay({
            kicker: best ? 'New best time!' : as ? 'Finished with help' : 'Solved',
            title: mmss(t),
            text: as ? 'You revealed some squares, so this one does not count towards your streak.' : `You solved the ${dateLbl(N.day())} Mini.`,
            stats: [['Time', mmss(t)], ['Streak', curStreak(st, N.today)], ['Best', st.b.m ? mmss(st.b.m) : '—']],
            button: 'Share result', onAction: share, secondary: 'Close'
          });
        }, 1100);
      }
      function share() {
        copy(api, `Mini Crossword · ${dateLbl(N.day(), true)}\nSolved in ${mmss(P.t)}${P.as ? ' (with help)' : ''}`);
      }
      function showStats() {
        const b = N.S.st.b;
        statsOv(api, N, [['Best time', b.m ? mmss(b.m) : '—'], ['Average', b.n ? mmss(b.s / b.n) : '—']]);
      }

      tap(grid, '.cw-c', (b, e) => {
        if (blocked(api)) return;
        select(+b.dataset.i, true);
      });
      tap(root.querySelector('.cw-lists'), 'li', b => { if (blocked(api)) return; jumpTo((b.dataset.d === 'a' ? M.A : M.D)[+b.dataset.k]); });
      tap(root.querySelector('.cw-clue'), 'button', b => { if (blocked(api)) return; step(b.classList.contains('cw-nx') ? 1 : -1); });
      tap(root.querySelector('.cw-kb'), 'button', b => { if (b.dataset.k === 'back') back(); else type(b.dataset.k); });
      const pops = [...root.querySelectorAll('.cw-pop')];
      const closePops = () => pops.forEach(p => { p.hidden = true; });
      tap(root.querySelector('.cw-btns'), '.cw-m', b => {
        const p = b.nextElementSibling, was = p.hidden;
        closePops(); p.hidden = !was;
      });
      tap(root.querySelector('.cw-btns'), '.cw-pop button', b => {
        const m = b.closest('.cw-mw').querySelector('.cw-m').dataset.m;
        closePops();
        if (blocked(api)) return;
        if (m === 'chk') check(b.dataset.s); else reveal(b.dataset.s);
      });
      api.on(document, 'pointerdown', e => { if (!e.target.closest || !e.target.closest('.cw-mw')) closePops(); });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || blocked(api) || !M) return;
        const k = e.key;
        if (k === 'Backspace') { e.preventDefault(); back(); }
        else if (/^[a-z]$/i.test(k)) { e.preventDefault(); type(k.toUpperCase()); }
        else if (k === 'Tab' || k === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
        else if (k === ' ') { e.preventDefault(); select(cur, true); }
        else if (k === 'ArrowLeft') { e.preventDefault(); move(0, -1); }
        else if (k === 'ArrowRight') { e.preventDefault(); move(0, 1); }
        else if (k === 'ArrowUp') { e.preventDefault(); move(-1, 0); }
        else if (k === 'ArrowDown') { e.preventDefault(); move(1, 0); }
      });
      api.loop(dt => {
        if (!started || over || !P) return;
        P.t += dt; tickT += dt;
        setTime();
        if (tickT > 5) { tickT = 0; N.persist(); }
      });
      begin();
    }
  });

  const BEE_R = [['Beginner', 0], ['Good Start', .02], ['Moving Up', .05], ['Good', .08], ['Solid', .15], ['Nice', .25], ['Great', .4], ['Amazing', .5], ['Genius', .7], ['Queen Bee', 1]];
  const BEE_PZ = BEE_P.split(' ');
  let beeProm = null;
  function beeLoad() {
    if (beeProm) return beeProm;
    beeProm = (async () => {
      const bin = Uint8Array.from(atob(BEE_Z.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const txt = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
      const out = [];
      let prev = '';
      for (const l of txt.split('\n')) { prev = prev.slice(0, +l[0]) + l.slice(1); out.push(prev); }
      return out;
    })();
    beeProm.catch(() => { beeProm = null; });
    return beeProm;
  }
  const beePuz = day => { const p = BEE_PZ[dIdx(day, BEE_PZ.length, 5)]; return { out: p.slice(0, 6), mid: p[6] }; };
  const beeAns = (words, z) => { const set = new Set(z.out + z.mid); return words.filter(w => w.length >= 4 && w.includes(z.mid) && [...w].every(c => set.has(c))); };
  const beePts = w => (w.length === 4 ? 1 : w.length) + (new Set(w).size === 7 ? 7 : 0);
  const beeTh = max => { const t = []; BEE_R.forEach(([n, f], i) => { t.push(i === 0 ? 0 : Math.max(t[i - 1] + 1, Math.round(max * f))); }); return t; };

  Ameplay.register({
    id: 'spelling-bee',
    title: 'Spelling Bee',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' pts',
    width: 560,
    blurb: 'Make words from seven letters, always using the centre one. Find the pangram and climb to Genius.',
    help: 'Type or tap letters · <kbd>Enter</kbd> submits · <kbd>⌫</kbd> deletes · <kbd>Space</kbd> shuffles · words need 4+ letters and the centre letter · pangrams use all seven',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 22l8-5 8 5v9l-8 5-8-5z" fill="currentColor" opacity=".3"/><path d="M24 22l8-5 8 5v9l-8 5-8-5zM8 31l8-5 8 5v9l-8 5-8-5zM40 31l8-5 8 5v9l-8 5-8-5zM24 40l8-5 8 5v9l-8 5-8-5z"/></svg>',
    css: baseCss('spelling-bee') + `
.gm-spelling-bee .bee-prog{display:flex;align-items:center;gap:14px;width:min(100%,460px)}
.gm-spelling-bee .bee-rank{flex:none;min-width:92px;font:800 17px/1 ${FONT}}
.gm-spelling-bee .bee-track{position:relative;flex:1;height:22px}
.gm-spelling-bee .bee-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:#dcdcdc}
.gm-spelling-bee .bee-fill{position:absolute;left:0;top:50%;height:2px;margin-top:-1px;background:#f7da21;transition:width .5s cubic-bezier(.3,1,.4,1)}
.gm-spelling-bee .bee-dot{position:absolute;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#dcdcdc}
.gm-spelling-bee .bee-dot.on{background:#f7da21}
.gm-spelling-bee .bee-dot:last-of-type{border-radius:0;transform:rotate(45deg)}
.gm-spelling-bee .bee-sc{position:absolute;top:50%;display:grid;place-items:center;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:#f7da21;font:800 13px/1 ${FONT};font-style:normal;transition:left .5s cubic-bezier(.3,1,.4,1);z-index:2}
.gm-spelling-bee .bee-found{position:relative;z-index:5;width:min(100%,460px);border:1px solid #c9ccd0;border-radius:6px;background:#fff}
.gm-spelling-bee .bee-fh{display:flex;align-items:center;justify-content:space-between;width:100%;height:42px;padding:0 14px;border:0;background:none;font:600 15px/1 ${FONT};color:#121213;cursor:pointer}
.gm-spelling-bee .bee-fh i{width:9px;height:9px;border-right:2px solid #121213;border-bottom:2px solid #121213;transform:rotate(45deg) translate(-2px,-2px);transition:transform .2s}
.gm-spelling-bee .bee-found.open .bee-fh i{transform:rotate(-135deg) translate(-2px,-2px)}
.gm-spelling-bee .bee-fb{display:flex;flex-wrap:nowrap;gap:6px 16px;padding:0 14px;height:0;overflow:hidden;font:500 15px/1.2 ${FONT};text-transform:capitalize}
.gm-spelling-bee .bee-fb.has{height:auto;max-height:2.6em;padding-bottom:10px}
.gm-spelling-bee .bee-found.open .bee-fb{position:absolute;left:-1px;right:-1px;top:100%;flex-wrap:wrap;max-height:176px;overflow:auto;padding-top:6px;background:#fff;border:1px solid #c9ccd0;border-top:0;border-radius:0 0 6px 6px;box-shadow:0 10px 24px rgba(0,0,0,.14)}
.gm-spelling-bee .bee-fb span{flex:none}
.gm-spelling-bee .bee-fb span.pg{font-weight:800}
.gm-spelling-bee .bee-fb span.nw{animation:gmBeeNew .6s}
.gm-spelling-bee .bee-ow{position:relative;width:min(100%,460px);height:56px;display:flex;align-items:center;justify-content:center}
.gm-spelling-bee .bee-msgbox{position:absolute;left:0;right:0;top:-6px;height:0}
.gm-spelling-bee .bee-in{display:flex;align-items:center;justify-content:center;min-height:44px;font:700 clamp(26px,7vw,34px)/1 ${FONT};text-transform:uppercase;letter-spacing:.01em;white-space:nowrap;overflow:hidden}
.gm-spelling-bee .bee-in .c{color:#e6b800}
.gm-spelling-bee .bee-in .x{color:#c9ccd0}
.gm-spelling-bee .bee-in .k{display:inline-block;width:2px;height:1.05em;margin-left:2px;background:#f7da21;animation:gmBeeBlink 1s steps(1) infinite}
.gm-spelling-bee .bee-in.shake{animation:gmNgShake .4s}
.gm-spelling-bee .bee-ld{font:600 15px/1 ${FONT};color:#5b5d60}
.gm-spelling-bee .bee-hive{--u:clamp(64px,min(22vw,10.5dvh),98px);position:relative;width:calc(var(--u) * 2.6);height:calc(var(--u) * 2.72);margin:4px 0}
.gm-spelling-bee .bee-hx{position:absolute;left:calc(50% - var(--u) / 2 + var(--dx) * var(--u));top:calc(50% - var(--u) * .433 + var(--dy) * var(--u));width:var(--u);height:calc(var(--u) * .866);padding:0;border:0;background:#e6e6e6;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);display:grid;place-items:center;color:#121213;font:700 calc(var(--u) * .36)/1 ${FONT};text-transform:uppercase;cursor:pointer;touch-action:manipulation;transition:transform .12s,opacity .14s,background .1s}
.gm-spelling-bee .bee-hx.mid{background:#f7da21}
.gm-spelling-bee .bee-hx:active,.gm-spelling-bee .bee-hx.dn{transform:scale(.9);background:#d3d3d3}
.gm-spelling-bee .bee-hx.mid:active,.gm-spelling-bee .bee-hx.mid.dn{background:#e2c500}
.gm-spelling-bee .bee-hx.sh{opacity:.15;transform:scale(.7)}
.gm-spelling-bee .bee-hx:focus-visible{outline:none;background:#cfd3d8}
.gm-spelling-bee .bee-ctl{display:flex;align-items:center;justify-content:center;gap:12px}
.gm-spelling-bee .bee-ctl .pill{height:52px;padding:0 24px;font-size:16px}
.gm-spelling-bee .bee-ctl .rnd{width:52px;padding:0}
.gm-spelling-bee .bee-ctl .rnd svg{width:24px;height:24px}
.gm-spelling-bee .bee-sub{display:flex;gap:8px;justify-content:center}
@keyframes gmBeeBlink{50%{opacity:0}}
@keyframes gmBeeNew{0%{color:#e6b800;transform:scale(1.2)}100%{transform:scale(1)}}
@media (max-width:420px){.gm-spelling-bee .bee-ctl .pill:not(.rnd){padding:0 18px}}
`,
    _t: { beeLoad, beePuz, beeAns, beePts, beeTh, BEE_R, BEE_PZ },
    mount(root, api) {
      const N = nav(api, root, { open: () => begin(), stats: showStats });
      root.append(N.el);
      const POS = [[0, -.906], [.785, -.453], [.785, .453], [0, .906], [-.785, .453], [-.785, -.453]];
      root.insertAdjacentHTML('beforeend', `<div class="bee-prog"><b class="bee-rank">Beginner</b><div class="bee-track"><i class="bee-fill"></i>${BEE_R.map((r, i) => `<i class="bee-dot" style="left:${i / 9 * 100}%"></i>`).join('')}<em class="bee-sc">0</em></div></div>
        <div class="bee-found"><button type="button" class="bee-fh"><span>Loading word list…</span><i></i></button><div class="bee-fb"></div></div>
        <div class="bee-ow"><div class="bee-msgbox"></div><div class="bee-in"></div></div>
        <div class="bee-hive">${POS.map((p, i) => `<button type="button" tabindex="-1" class="bee-hx" style="--dx:${p[0]};--dy:${p[1]}" data-i="${i}"></button>`).join('')}<button type="button" tabindex="-1" class="bee-hx mid" style="--dx:0;--dy:0" data-i="6"></button></div>
        <div class="bee-ctl"><button type="button" class="pill bee-del">Delete</button><button type="button" class="pill rnd bee-shf" aria-label="Shuffle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg></button><button type="button" class="pill bee-ent">Enter</button></div>
        <div class="bee-sub"><button type="button" class="pill bee-hint">Hints</button><button type="button" class="pill dark bee-share" hidden>Share</button></div>`);
      const q = s => root.querySelector(s);
      const rankEl = q('.bee-rank'), fill = q('.bee-fill'), dots = [...root.querySelectorAll('.bee-dot')], scEl = q('.bee-sc'), found = q('.bee-found'), fh = q('.bee-fh span'), fb = q('.bee-fb');
      const inEl = q('.bee-in'), msgbox = q('.bee-msgbox'), hx = [...root.querySelectorAll('.bee-hx')], shareB = q('.bee-share');
      let words = null, Z, ans = [], aset = new Set(), maxS = 0, th = [], P, typed = '', all = new Set(), gen = 0, ready = false;

      const score = () => P.f.reduce((a, w) => a + beePts(w), 0);
      const rankOf = s => { let r = 0; th.forEach((t, i) => { if (s >= t) r = i; }); return r; };
      function drawIn() {
        const s = [...typed].map(c => `<span class="${c === Z.mid ? 'c' : all.has(c) ? '' : 'x'}">${c}</span>`).join('');
        inEl.innerHTML = s + (P && !(P.f.length === ans.length) ? '<i class="k"></i>' : '');
      }
      function drawHive() {
        const o = P.o;
        hx.forEach((b, i) => { b.textContent = i === 6 ? Z.mid : o[i]; });
      }
      function drawProg() {
        const s = score(), r = rankOf(s);
        rankEl.textContent = BEE_R[r][0];
        const f = r === 9 ? 1 : (r + (s - th[r]) / (th[r + 1] - th[r])) / 9;
        fill.style.width = (f * 100) + '%';
        scEl.style.left = (f * 100) + '%';
        scEl.textContent = s;
        dots.forEach((d, i) => d.classList.toggle('on', i <= r));
        api.score(s);
        return r;
      }
      function drawFound(fresh) {
        const n = P.f.length;
        fh.textContent = n ? `You have found ${n} word${n > 1 ? 's' : ''}` : 'Your words will appear here';
        const list = found.classList.contains('open') ? P.f.slice().sort() : P.f.slice().reverse();
        fb.classList.toggle('has', n > 0);
        fb.innerHTML = list.map(w => `<span class="${new Set(w).size === 7 ? 'pg' : ''}${w === fresh ? ' nw' : ''}">${w}</span>`).join('');
      }
      function begin() {
        if (!ready) return;
        gen++;
        const day = N.day();
        Z = beePuz(day);
        ans = beeAns(words, Z); aset = new Set(ans);
        all = new Set(Z.out + Z.mid);
        maxS = ans.reduce((a, w) => a + beePts(w), 0);
        th = beeTh(maxS);
        P = N.prog('d' + day);
        if (!Array.isArray(P.f)) P.f = [];
        P.f = P.f.filter(w => aset.has(w));
        if (typeof P.o !== 'string' || [...P.o].sort().join('') !== Z.out.split('').sort().join('')) P.o = shuf(Z.out.split(''), mul(day * 17 + 3)).join('');
        typed = '';
        found.classList.remove('open');
        drawHive(); drawIn(); drawFound(); drawProg();
        N.info(`${P.f.length}/${ans.length} words`);
        api.label('Points');
        shareB.hidden = !(P.f.length > 0);
        N.persist();
      }
      function msg(t, cls) { flash(msgbox, t, cls); }
      function bad(t) {
        msg(t); api.sfx('bad');
        restart(inEl, 'shake');
        api.timeout(() => { typed = ''; drawIn(); }, 380);
      }
      function add(c) {
        if (!ready || blocked(api) || typed.length >= 19) return;
        typed += c; drawIn(); api.sfx('tick');
      }
      function del() { if (!ready || blocked(api) || !typed) return; typed = typed.slice(0, -1); drawIn(); }
      function shuffle() {
        if (!ready || blocked(api)) return;
        hx.slice(0, 6).forEach(b => b.classList.add('sh'));
        api.timeout(() => {
          let o = P.o;
          for (let i = 0; i < 6 && o === P.o; i++) o = shuf(o.split('')).join('');
          P.o = o; drawHive(); N.persist();
          hx.forEach(b => b.classList.remove('sh'));
        }, 150);
      }
      function enter() {
        if (!ready || blocked(api) || !typed) return;
        const w = typed;
        if (w.length < 4) return bad('Too short');
        if ([...w].some(c => !all.has(c))) return bad('Bad letters');
        if (!w.includes(Z.mid)) return bad('Missing center letter');
        if (P.f.includes(w)) return bad('Already found');
        if (!aset.has(w)) return bad('Not in word list');
        const pts = beePts(w), pg = new Set(w).size === 7, before = rankOf(score());
        if (!P.f.length) N.S.st.p++;
        P.f.push(w);
        typed = ''; drawIn();
        const s = score(), r = drawProg();
        drawFound(w);
        shareB.hidden = false;
        msg(pg ? 'Pangram!' : pts >= 7 ? 'Awesome!' : pts >= 5 ? 'Great!' : pts >= 2 ? 'Nice!' : 'Good!', pg ? 'gold' : '');
        popText(root, inEl, '+' + pts);
        api.sfx(pg ? 'win' : 'good');
        N.info(`${P.f.length}/${ans.length} words`);
        const st = N.S.st;
        if (r > before) {
          if (r === 8 && !P.g) {
            P.g = 1;
            addRes(st, true, N.day(), N.today, true);
            api.submit(s);
            confetti(root, api, 100);
            api.timeout(() => toast2('Genius!'), 650);
          } else if (r < 9) api.timeout(() => toast2(BEE_R[r][0] + '!'), 650);
        }
        if (P.f.length === ans.length) {
          st.b.q = (st.b.q | 0) + 1; P.q = 1;
          if (!P.g) { P.g = 1; addRes(st, true, N.day(), N.today, true); }
          api.submit(s);
          confetti(root, api);
          const my = gen;
          api.timeout(() => {
            if (my !== gen) return;
            api.overlay({ kicker: 'Queen Bee', title: 'Every word found!', text: `You found all ${ans.length} words and ${ans.filter(x => new Set(x).size === 7).length === 1 ? 'the pangram' : 'every pangram'}.`, stats: [['Points', s], ['Words', ans.length]], button: 'Share result', onAction: share, secondary: 'Close' });
          }, 1300);
        }
        N.persist();
      }
      const toast2 = t => flash(msgbox, t, 'gold');
      function share() {
        const s = score(), r = BEE_R[rankOf(s)][0];
        copy(api, `Spelling Bee · ${dateLbl(N.day(), true)}\n${r} · ${s} points · ${P.f.length} words${P.f.some(w => new Set(w).size === 7) ? ' · pangram found' : ''}${P.h ? ' · hints used' : ''}`);
      }
      function hints() {
        if (!ready || blocked(api)) return;
        P.h = 1; N.persist();
        const left = ans.filter(w => !P.f.includes(w)), pgs = left.filter(w => new Set(w).size === 7).length;
        const by = {};
        left.forEach(w => { by[w[0]] = (by[w[0]] || 0) + 1; });
        const letters = Object.keys(by).sort().map(k => `<b>${k.toUpperCase()}</b>&nbsp;${by[k]}`).join(' · ');
        api.overlay({
          kicker: 'Hints',
          title: left.length ? `${left.length} word${left.length > 1 ? 's' : ''} to go` : 'Nothing left',
          text: `${pgs ? `${pgs} pangram${pgs > 1 ? 's' : ''} left. ` : 'No pangrams left. '}Words left by first letter:<br>${letters || '—'}`,
          stats: [['Max points', maxS], ['Genius at', th[8]], ['Queen Bee', th[9]]],
          button: 'Back to the hive'
        });
      }
      function showStats() {
        const st = N.S.st;
        statsOv(api, N, [['Queen Bees', st.b.q | 0]], 'A win here means reaching Genius.');
      }

      tap(root.querySelector('.bee-hive'), '.bee-hx', b => {
        add(b.textContent.toLowerCase());
        restart(b, 'dn'); api.timeout(() => b.classList.remove('dn'), 120);
      });
      tap(root.querySelector('.bee-ctl'), 'button', b => { if (b.classList.contains('bee-del')) del(); else if (b.classList.contains('bee-shf')) shuffle(); else enter(); });
      tap(root.querySelector('.bee-sub'), 'button', b => { if (b.classList.contains('bee-hint')) hints(); else share(); });
      tap(q('.bee-found'), '.bee-fh', () => { found.classList.toggle('open'); if (ready) drawFound(); });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || blocked(api)) return;
        const k = e.key;
        if (k === 'Enter') { e.preventDefault(); if (!e.repeat) enter(); }
        else if (k === 'Backspace') { e.preventDefault(); del(); }
        else if (k === ' ') { e.preventDefault(); if (!e.repeat) shuffle(); }
        else if (/^[a-z]$/i.test(k)) {
          add(k.toLowerCase());
          const b = hx.find(h => h.textContent === k.toLowerCase());
          if (b) { restart(b, 'dn'); api.timeout(() => b.classList.remove('dn'), 120); }
        }
      });
      if (typeof DecompressionStream === 'undefined') { fh.textContent = 'This browser cannot unpack the word list'; return; }
      beeLoad().then(w => { if (!api.alive) return; words = w; ready = true; begin(); }, () => { fh.textContent = 'Could not load the word list'; });
    }
  });

  const CN_COL = ['#f9df6d', '#a0c35a', '#b0c4ef', '#ba81c5'];
  const CN_SQ = ['\u{1F7E8}', '\u{1F7E9}', '\u{1F7E6}', '\u{1F7EA}'];
  const cnPuz = day => CN[dIdx(day, CN.length, 2)];

  Ameplay.register({
    id: 'connections',
    title: 'Connections',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' pts',
    width: 600,
    blurb: 'Sort sixteen words into four hidden groups of four. Watch out for red herrings.',
    help: 'Tap four words that share a link, then <kbd>Submit</kbd> (<kbd>Enter</kbd>) · <kbd>Shuffle</kbd> mixes the tiles · four mistakes and you are out · yellow is easiest, purple is trickiest',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="21" height="21" rx="4" fill="currentColor" opacity=".35"/><rect x="35" y="8" width="21" height="21" rx="4"/><rect x="8" y="35" width="21" height="21" rx="4"/><rect x="35" y="35" width="21" height="21" rx="4" fill="currentColor" opacity=".65"/></svg>',
    css: baseCss('connections') + `
.gm-connections .cn-board{position:relative;display:flex;flex-direction:column;gap:8px;width:min(100%,560px)}
.gm-connections .cn-sub{margin:0;text-align:center;font:600 16px/1.2 ${FONT}}
.gm-connections .cn-g{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:clamp(64px,17vw,80px);padding:0 10px;border-radius:7px;text-align:center;text-transform:uppercase;color:#121213}
.gm-connections .cn-g b{font:800 clamp(14px,3.8vw,17px)/1.1 ${FONT};letter-spacing:.01em}
.gm-connections .cn-g span{font:500 clamp(12px,3.3vw,16px)/1.15 ${FONT}}
.gm-connections .cn-g.in{animation:gmCnIn .5s cubic-bezier(.2,1.2,.4,1)}
.gm-connections .cn-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gm-connections .cn-grid.fx{animation:gmCnFx .3s}
.gm-connections .cn-t{display:grid;place-items:center;height:clamp(64px,17vw,80px);padding:0 4px;border:0;border-radius:7px;background:#efefe6;color:#121213;font:700 clamp(11px,3.3vw,17px)/1.1 ${FONT};text-transform:uppercase;text-align:center;overflow-wrap:anywhere;cursor:pointer;touch-action:manipulation;transition:background .12s,color .12s,transform .12s;user-select:none}
.gm-connections .cn-t.m{font-size:clamp(10px,2.9vw,15px)}
.gm-connections .cn-t.l{font-size:clamp(9px,2.5vw,13px)}
.gm-connections .cn-t:hover:not(.sel){background:#e5e5d9}
.gm-connections .cn-t.sel{background:#5a594e;color:#fff;animation:gmNgPopIn .14s}
.gm-connections .cn-t.shk{animation:gmNgShake .45s}
.gm-connections .cn-t.jmp{animation:gmCnJump .5s both}
.gm-connections .cn-t:focus-visible{outline:2px solid #3a86ff;outline-offset:2px}
.gm-connections .cn-ms{display:flex;align-items:center;justify-content:center;gap:10px;font:500 16px/1 ${FONT};min-height:22px}
.gm-connections .cn-ms i{width:15px;height:15px;border-radius:50%;background:#5a594e;transition:transform .3s,opacity .3s}
.gm-connections .cn-ms i.x{transform:scale(0);opacity:0}
.gm-connections .cn-ctl{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.gm-connections .cn-ctl .pill{height:48px;padding:0 20px;font-size:16px;border-radius:999px}
.gm-connections .cn-ctl .pill.dark:disabled{background:#fff;color:#8a8d90;border-color:#c9ccd0;opacity:1}
.gm-connections .msg{top:-4px}
@media (max-width:420px){.gm-connections .cn-ctl .pill{padding:0 14px;font-size:15px}}
@keyframes gmCnIn{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes gmCnFx{0%{opacity:.2}100%{opacity:1}}
@keyframes gmCnJump{0%{transform:translateY(0)}35%{transform:translateY(-12px)}70%{transform:translateY(2px)}100%{transform:translateY(0)}}
`,
    _t: { CN, cnPuz },
    mount(root, api) {
      const N = nav(api, root, { open: () => begin(), stats: showStats });
      root.append(N.el);
      root.insertAdjacentHTML('beforeend', `<div class="cn-board"><p class="cn-sub">Create four groups of four!</p><div class="cn-sol"></div><div class="cn-grid"></div></div>
        <div class="cn-ms"><span>Mistakes remaining:</span><span class="cn-dots" style="display:flex;gap:6px"><i></i><i></i><i></i><i></i></span></div>
        <div class="cn-ctl"><button type="button" class="pill cn-sh">Shuffle</button><button type="button" class="pill cn-de">Deselect All</button><button type="button" class="pill dark cn-su" disabled>Submit</button><button type="button" class="pill dark cn-shr" hidden>Share</button></div>`);
      const board = root.querySelector('.cn-board'), solEl = root.querySelector('.cn-sol'), grid = root.querySelector('.cn-grid'), dots = root.querySelector('.cn-dots'), sub = root.querySelector('.cn-sub');
      const shB = root.querySelector('.cn-sh'), deB = root.querySelector('.cn-de'), suB = root.querySelector('.cn-su'), shrB = root.querySelector('.cn-shr');
      solEl.style.cssText = 'display:flex;flex-direction:column;gap:8px';
      let Z, P, sel = [], busy = false, over = false, gen = 0, gOf = {};

      const tcls = w => w.length > 9 ? ' l' : w.length > 7 ? ' m' : '';
      function render(newG) {
        solEl.innerHTML = P.s.map(g => `<div class="cn-g${g === newG ? ' in' : ''}" style="background:${CN_COL[g]}"><b>${Z[g][0]}</b><span>${Z[g].slice(1).join(', ')}</span></div>`).join('');
        grid.innerHTML = P.o.map(w => `<button type="button" class="cn-t${tcls(w)}${sel.includes(w) ? ' sel' : ''}" data-w="${w}">${w}</button>`).join('');
        grid.style.display = P.o.length ? '' : 'none';
        [...dots.children].forEach((d, i) => d.classList.toggle('x', i >= 4 - P.m));
        suB.disabled = sel.length !== 4 || busy || over;
        deB.disabled = !sel.length || busy || over;
        shB.disabled = busy || over;
        shB.hidden = deB.hidden = suB.hidden = over;
        shrB.hidden = !over;
        sub.hidden = over;
        api.score(`${P.s.length}/4`);
      }
      function begin() {
        gen++;
        const day = N.day();
        Z = cnPuz(day);
        gOf = {};
        Z.forEach((g, i) => g.slice(1).forEach(w => { gOf[w] = i; }));
        P = N.prog('d' + day);
        if (!Array.isArray(P.s)) P.s = [];
        if (!Array.isArray(P.k)) P.k = [];
        if (!Array.isArray(P.h)) P.h = [];
        P.m = P.m | 0;
        const rest = Z.flatMap((g, i) => P.s.includes(i) ? [] : g.slice(1));
        if (!Array.isArray(P.o) || P.o.length !== rest.length || !P.o.every(w => rest.includes(w))) P.o = shuf(rest, mul(day * 13 + 1));
        sel = []; busy = false; over = !!P.done;
        render();
        N.info(`No. ${day - EPOCH + 1}`);
        api.label('Groups');
        N.persist();
        if (over) shrB.hidden = false;
      }
      const msg = (t, cls) => flash(board, t, cls);
      function toggle(w) {
        if (busy || over || blocked(api)) return;
        const i = sel.indexOf(w);
        if (i >= 0) sel.splice(i, 1);
        else if (sel.length < 4) sel.push(w);
        else return;
        api.sfx('tick');
        render();
      }
      function submit() {
        if (sel.length !== 4 || busy || over || blocked(api)) return;
        const key = sel.slice().sort().join('|');
        if (P.k.includes(key)) return msg('Already guessed!');
        const cnt = [0, 0, 0, 0];
        sel.forEach(w => cnt[gOf[w]]++);
        const top = Math.max(...cnt), g = cnt.indexOf(top);
        P.k.push(key);
        P.h.push(P.o.filter(w => sel.includes(w)).map(w => gOf[w]));
        busy = true;
        const tiles = [...grid.children].filter(b => sel.includes(b.dataset.w)), my = gen;
        if (top === 4) {
          api.sfx('good');
          tiles.forEach((b, i) => { b.style.animationDelay = i * 90 + 'ms'; b.classList.add('jmp'); });
          api.timeout(() => {
            if (my !== gen) return;
            P.s.push(g); P.o = P.o.filter(w => !sel.includes(w)); sel = []; busy = false;
            render(g); N.persist();
            if (P.s.length === 4) win();
          }, 800);
        } else {
          P.m++;
          api.sfx('bad');
          tiles.forEach(b => b.classList.add('shk'));
          if (top === 3) msg('One away…');
          api.timeout(() => {
            if (my !== gen) return;
            busy = false; render(); N.persist();
            if (P.m >= 4) lose();
          }, 520);
        }
      }
      function reveal(i, done) {
        const rest = [0, 1, 2, 3].filter(g => !P.s.includes(g));
        if (!rest.length) return done();
        const g = rest[0], my = gen;
        sel = Z[g].slice(1).slice();
        render();
        api.timeout(() => {
          if (my !== gen) return;
          P.s.push(g); P.o = P.o.filter(w => !sel.includes(w)); sel = [];
          render(g);
          api.sfx('pop');
          api.timeout(() => reveal(i + 1, done), 650);
        }, 650);
      }
      function lose() {
        busy = true; over = true; P.done = true; P.lost = 1;
        addRes(N.S.st, false, N.day(), N.today);
        N.persist();
        msg('Next time!');
        api.sfx('lose');
        const my = gen;
        api.timeout(() => reveal(0, () => {
          if (my !== gen) return;
          busy = false; render(); N.persist(); N.info(`No. ${N.day() - EPOCH + 1}`);
          api.timeout(() => {
            if (my !== gen) return;
            api.overlay({ kicker: 'Out of mistakes', title: 'Better luck next time', text: 'The groups are revealed above. A new puzzle arrives tomorrow.', stats: [['Groups', P.s.length + '/4'], ['Streak', 0]], button: 'Share result', onAction: share, secondary: 'Close' });
          }, 500);
        }), 900);
      }
      function win() {
        over = true; P.done = true; busy = false;
        const st = N.S.st;
        addRes(st, true, N.day(), N.today);
        st.d[P.m] = (st.d[P.m] | 0) + 1;
        N.persist();
        render();
        const pts = 400 + 150 * (4 - P.m), best = api.submit(pts), my = gen;
        api.sfx('win');
        confetti(root, api);
        api.timeout(() => {
          if (my !== gen) return;
          api.overlay({
            kicker: best ? 'New best!' : 'Solved',
            title: ['Perfect!', 'Great!', 'Solid!', 'Phew!'][P.m],
            text: P.m ? `You made ${P.m} mistake${P.m > 1 ? 's' : ''}.` : 'Not a single mistake.',
            stats: [['Score', pts], ['Streak', curStreak(st, N.today)], ['Mistakes', P.m]],
            button: 'Share result', onAction: share, secondary: 'Close'
          });
        }, 1000);
      }
      function share() {
        copy(api, `Connections\nPuzzle No. ${N.day() - EPOCH + 1}\n` + P.h.map(r => r.map(g => CN_SQ[g]).join('')).join('\n'));
      }
      function showStats() {
        const d = N.S.st.d;
        statsOv(api, N, [], 'Mistakes in solved puzzles: ' + [0, 1, 2, 3].map(i => `${i}: ${d[i] | 0}`).join(' · '));
      }

      tap(grid, '.cn-t', b => toggle(b.dataset.w));
      tap(root.querySelector('.cn-ctl'), 'button', b => {
        if (blocked(api)) return;
        if (b === shB) { if (busy || over) return; P.o = shuf(P.o.slice()); render(); restart(grid, 'fx'); N.persist(); }
        else if (b === deB) { sel = []; render(); }
        else if (b === suB) submit();
        else share();
      });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || blocked(api)) return;
        if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) submit(); }
        else if (e.key === 'Backspace') { e.preventDefault(); sel = []; render(); }
      });
      begin();
    }
  });
})();
