const NET_DARK = '--gl-page:#0f0d1c;--gl-card:#1a1730;--gl-band:#221e3d;--gl-line:#2d2850;--gl-fg:#f1efff;--gl-muted:#9f9cc0;--gl-accent:#8f5cf2;--gl-accent-ink:#ffffff;--gl-accent-soft:#2f2556;--gl-danger:#ff6b80;--gl-danger-soft:#3a1e2c;--gl-live:#3ad596;--gl-live-soft:#143328;--gl-chip:#2a2548;--gl-shadow:0 24px 60px rgba(0,0,0,.55);--gl-veil:rgba(4,3,12,.72);color-scheme:dark';
const NET_CSS = `html.gl-lock,html.gl-lock body{overflow:hidden!important}
.g-lobby{position:fixed;inset:0;z-index:150;overflow:hidden;opacity:0;transition:opacity .25s ease;text-align:left;--gl-page:#ebe8f7;--gl-card:#ffffff;--gl-band:#f4f1ff;--gl-line:#ece9f6;--gl-fg:#17142b;--gl-muted:#8a87a3;--gl-accent:#7b3aed;--gl-accent-ink:#ffffff;--gl-accent-soft:#efe9ff;--gl-danger:#e5384f;--gl-danger-soft:#fdecef;--gl-live:#16a561;--gl-live-soft:#e8f8ef;--gl-chip:#f0eff5;--gl-shadow:0 24px 60px rgba(60,30,140,.18);--gl-veil:rgba(23,20,43,.55);--gl-font:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--gl-veil);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:var(--gl-fg);font:400 16px/1.4 var(--gl-font);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%}
.g-lobby.show{opacity:1}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .g-lobby{${NET_DARK}}}
:root[data-theme="dark"] .g-lobby{${NET_DARK}}
.g-lobby *{box-sizing:border-box}
.g-lobby button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;margin:0;-webkit-tap-highlight-color:transparent}
.g-lobby svg{display:block;stroke:currentColor;fill:none;stroke-linecap:round;stroke-linejoin:round}
.g-lobby :focus-visible{outline:2px solid var(--gl-accent);outline-offset:2px}
.g-lobby .gl-card{position:absolute;left:50%;top:50%;width:1040px;background:var(--gl-card);border-radius:32px;box-shadow:var(--gl-shadow);overflow:hidden;display:flex;flex-direction:column;transform:translate(-50%,-50%) scale(var(--gls,1));outline:0}
.g-lobby .gl-head{background:var(--gl-band);padding:36px 40px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;min-height:154px}
.g-lobby .gl-head h1{grid-column:2;grid-row:1;margin:0;max-width:520px;font-size:46px;line-height:1.1;font-weight:800;letter-spacing:-.03em;text-align:center;color:var(--gl-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-leave{grid-column:1;grid-row:1;justify-self:start;display:flex;align-items:center;gap:6px;height:40px;padding:0 14px 0 8px;margin-left:-8px;border-radius:12px;color:var(--gl-muted);font-weight:600;font-size:16px;transition:background .15s,color .15s}
.g-lobby .gl-leave:hover{color:var(--gl-fg);background:var(--gl-card)}
.g-lobby .gl-leave svg{width:18px;height:18px;stroke-width:2.2}
.g-lobby .gl-code{grid-column:3;grid-row:1;justify-self:end;min-width:0}
.g-lobby .gl-code small,.g-lobby .gl-lbl{display:block;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--gl-muted);margin:0 0 8px}
.g-lobby .gl-codebox{display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--gl-card);border-radius:16px;padding:12px 12px 12px 20px;min-width:230px;min-height:62px}
.g-lobby .gl-codebox b{font-size:28px;font-weight:800;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:var(--gl-fg);min-width:3.4em;white-space:nowrap}
.g-lobby .gl-tools{display:flex;align-items:center;gap:8px;flex:none}
.g-lobby .gl-hide{display:flex;align-items:center;gap:8px;height:38px;padding:0 6px;color:var(--gl-accent);font-weight:600;font-size:16px}
.g-lobby .gl-hide svg{width:20px;height:20px;stroke-width:1.8}
.g-lobby .gl-body{display:grid;grid-template-columns:minmax(0,1fr) 1px 330px;gap:0 40px;padding:36px 40px 40px}
.g-lobby .gl-rule{background:var(--gl-line)}
.g-lobby .gl-sec{display:flex;flex-direction:column;min-width:0}
.g-lobby .gl-sec-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;min-height:32px;flex:none}
.g-lobby .gl-sec-h h2{margin:0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-.02em;color:var(--gl-fg);white-space:nowrap}
.g-lobby .gl-pill{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--gl-muted);background:var(--gl-chip);border-radius:99px;padding:6px 14px;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none}
.g-lobby .gl-pill.pick{padding-right:10px;cursor:pointer}
.g-lobby .gl-pill.pick:hover,.g-lobby .gl-pill.pick:focus-within{color:var(--gl-accent)}
.g-lobby .gl-pill select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px;border:0;margin:0;-webkit-appearance:none;appearance:none}
.g-lobby .gl-pill svg{width:14px;height:14px;stroke-width:2.4}
.g-lobby .gl-pill.gl-live{color:var(--gl-live);background:var(--gl-live-soft);gap:7px;padding:4px 12px}
.g-lobby .gl-pill.gl-live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gl-live)}
.g-lobby .gl-players{list-style:none;margin:0;padding:0;min-height:568px}
.g-lobby .gl-pl{display:flex;align-items:center;gap:14px;height:71px;padding:14px 0;border-bottom:1px solid var(--gl-line)}
.g-lobby .gl-pl.away{opacity:.55}
.g-lobby .gl-av{width:42px;height:42px;border-radius:12px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:15px;display:grid;place-items:center;flex:none}
.g-lobby .gl-pl.lead .gl-av{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-who{flex:1;min-width:0}
.g-lobby .gl-who b{display:flex;align-items:center;gap:8px;font-weight:600;font-size:17px;line-height:1.4;color:var(--gl-fg);min-width:0}
.g-lobby .gl-who b i{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-who>span{display:block;color:var(--gl-muted);font-size:14px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-badge{flex:none;font-size:11px;font-weight:700;letter-spacing:.05em;line-height:1.5;background:var(--gl-accent);color:var(--gl-accent-ink);border-radius:99px;padding:1px 9px}
.g-lobby .gl-sq{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;transition:transform .12s}
.g-lobby button.gl-sq:hover{transform:scale(1.08)}
.g-lobby .gl-sq svg{width:19px;height:19px;stroke-width:1.8}
.g-lobby .gl-crown{background:var(--gl-accent-soft);color:var(--gl-accent)}
.g-lobby .gl-pl.lead .gl-crown{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-kick{background:var(--gl-danger-soft);color:var(--gl-danger)}
.g-lobby .gl-ph{visibility:hidden}
.g-lobby .gl-chat{min-height:520px}
.g-lobby .gl-msgs{flex:1 1 0;min-height:0;contain:size;display:flex;flex-direction:column;gap:18px;overflow-y:auto;overscroll-behavior:contain;padding-bottom:16px}
.g-lobby .gl-msgs>*{flex:none}
.g-lobby .gl-m b{font-weight:700;color:var(--gl-fg);overflow-wrap:anywhere}
.g-lobby .gl-m time{margin-left:8px;color:var(--gl-muted);font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}
.g-lobby .gl-m p{margin:3px 0 0;color:var(--gl-muted);overflow-wrap:anywhere}
.g-lobby .gl-m.sys p{margin:0;font-size:14px;font-weight:500}
.g-lobby .gl-m.sys time{margin-left:0}
.g-lobby .gl-empty{margin:0;color:var(--gl-muted);font-size:15px}
.g-lobby .gl-send{display:flex;align-items:center;gap:8px;border:1px solid var(--gl-line);border-radius:14px;padding:6px 6px 6px 18px;background:var(--gl-card);flex:none;margin:0}
.g-lobby .gl-send:focus-within{border-color:var(--gl-accent)}
.g-lobby .gl-send input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;color:var(--gl-fg);height:36px;padding:0;margin:0;box-shadow:none;border-radius:0}
.g-lobby .gl-send input::placeholder{color:var(--gl-muted);opacity:1}
.g-lobby .gl-send.slow{border-color:var(--gl-danger)}
.g-lobby .gl-go{width:42px;height:42px;border-radius:11px;background:var(--gl-accent);color:var(--gl-accent-ink);display:grid;place-items:center;flex:none}
.g-lobby .gl-go svg{width:20px;height:20px;stroke-width:2.2}
.g-lobby .gl-foot{position:relative;background:var(--gl-band);padding:44px 40px;display:flex;justify-content:center;align-items:center;gap:12px;min-height:150px}
.g-lobby .gl-play{display:flex;align-items:center;justify-content:center;gap:10px;min-width:330px;height:62px;padding:0 28px;border-radius:16px;background:var(--gl-accent);color:var(--gl-accent-ink);font-size:19px;font-weight:700;box-shadow:0 12px 28px rgba(123,58,237,.38);transition:transform .12s,opacity .2s;white-space:nowrap}
.g-lobby .gl-play:hover:not(:disabled){transform:translateY(-2px)}
.g-lobby .gl-play:disabled{opacity:.45;cursor:default;box-shadow:none}
.g-lobby .gl-play.ghost{background:var(--gl-card);color:var(--gl-accent);box-shadow:none}
.g-lobby .gl-play svg{width:20px;height:20px;stroke-width:2}
.g-lobby .gl-wait{display:flex;align-items:center;justify-content:center;gap:12px;min-width:330px;max-width:100%;min-height:62px;padding:10px 28px;border-radius:16px;background:var(--gl-card);color:var(--gl-muted);font-size:17px;font-weight:600;text-align:center}
.g-lobby .gl-wait::before{content:"";flex:none;width:9px;height:9px;border-radius:50%;background:var(--gl-accent);animation:glpulse 1.4s ease-in-out infinite}
.g-lobby .gl-hint{position:absolute;left:40px;right:40px;bottom:14px;margin:0;font-size:14px;font-weight:500;color:var(--gl-muted);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-hint:empty{display:none}
.g-lobby .gl-st{margin:0;min-height:1.4em;font-size:15px;font-weight:600;color:var(--gl-muted);text-align:center}
.g-lobby .gl-st.bad{color:var(--gl-danger)}
.g-lobby .gl-foot .gl-st{position:absolute;left:40px;right:40px;bottom:12px;min-height:0}
.g-lobby .gl-foot.sm{flex-direction:column;min-height:0;padding:22px 40px}
.g-lobby .gl-foot.sm .gl-st{position:static}
.g-lobby .gl-urow{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) 1px 330px;gap:0 40px;align-items:end;padding-bottom:30px;margin-bottom:30px;border-bottom:1px solid var(--gl-line)}
.g-lobby .gl-urow>div{min-width:0}
.g-lobby .gl-urow p{grid-column:3;margin:0 0 14px;color:var(--gl-muted);font-size:15px}
.g-lobby .gl-in{display:block;width:100%;height:56px;margin:0;border:1px solid var(--gl-line);border-radius:14px;padding:0 18px;background:var(--gl-card);color:var(--gl-fg);font:500 18px var(--gl-font);outline:0;box-shadow:none;transition:border-color .15s}
.g-lobby .gl-in:focus{border-color:var(--gl-accent)}
.g-lobby .gl-in.bad{border-color:var(--gl-danger)}
.g-lobby .gl-in::placeholder{color:var(--gl-muted);opacity:1;font-weight:400}
.g-lobby .gl-in.gl-code-in{text-align:center;font-weight:800;font-size:26px;letter-spacing:.2em;text-transform:uppercase}
.g-lobby .gl-in.gl-code-in::placeholder{letter-spacing:.2em;font-weight:700;opacity:.5}
.g-lobby .gl-opt{display:flex;flex-direction:column;min-width:0}
.g-lobby .gl-opt p{margin:0 0 22px;color:var(--gl-muted);font-size:15px}
.g-lobby .gl-sizes{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:28px}
.g-lobby .gl-size{width:56px;height:56px;border-radius:14px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:19px;display:grid;place-items:center;transition:transform .12s}
.g-lobby .gl-size:hover{transform:scale(1.06)}
.g-lobby .gl-size[aria-checked="true"]{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-sizes span{margin-left:6px;color:var(--gl-muted);font-size:15px;font-weight:500}
.g-lobby .gl-opt .gl-in{margin-bottom:28px}
.g-lobby .gl-btn{display:flex;align-items:center;justify-content:center;gap:10px;height:62px;margin-top:auto;padding:0 24px;border-radius:16px;background:var(--gl-accent);color:var(--gl-accent-ink);font-size:19px;font-weight:700;box-shadow:0 12px 28px rgba(123,58,237,.38);transition:transform .12s;white-space:nowrap}
.g-lobby .gl-btn:hover{transform:translateY(-2px)}
.g-lobby .gl-btn.ghost{background:var(--gl-accent-soft);color:var(--gl-accent);box-shadow:none}
.g-lobby .gl-center{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center}
.g-lobby .gl-spin{width:46px;height:46px;margin:0 auto 22px;border-radius:50%;border:4px solid var(--gl-accent-soft);border-top-color:var(--gl-accent);animation:glspin .8s linear infinite}
.g-lobby .gl-msg{margin:0;font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:var(--gl-fg);text-align:center;overflow-wrap:anywhere}
.g-lobby .gl-txt{margin:12px auto 0;max-width:520px;color:var(--gl-muted);text-align:center;font-size:17px}
.g-lobby .gl-center .gl-st{margin-top:14px}
@keyframes glspin{to{transform:rotate(360deg)}}
@keyframes glpulse{50%{opacity:.25;transform:scale(.7)}}
@media (max-width:859px){
.g-lobby{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
.g-lobby .gl-card{position:relative;left:auto;top:auto;width:auto;max-width:1040px;margin:16px auto;transform:none;border-radius:28px}
.g-lobby .gl-head{grid-template-columns:minmax(0,1fr);justify-items:center;padding:16px 20px 28px;gap:14px;min-height:0}
.g-lobby .gl-head h1{grid-column:1;grid-row:2;font-size:34px;max-width:100%}
.g-lobby .gl-leave{grid-column:1;grid-row:1}
.g-lobby .gl-code{grid-column:1;grid-row:3;justify-self:center;text-align:center;max-width:100%}
.g-lobby .gl-codebox{text-align:left;min-width:0}
.g-lobby .gl-body{grid-template-columns:minmax(0,1fr);gap:32px;padding:28px 20px}
.g-lobby .gl-body>.gl-rule{display:none}
.g-lobby .gl-players{min-height:0}
.g-lobby .gl-chat{min-height:380px}
.g-lobby .gl-foot{flex-direction:column;padding:28px 20px;min-height:0;gap:10px}
.g-lobby .gl-play,.g-lobby .gl-wait,.g-lobby .gl-btn{min-width:0;width:100%}
.g-lobby .gl-hint,.g-lobby .gl-foot .gl-st{position:static;white-space:normal}
.g-lobby .gl-urow{grid-template-columns:minmax(0,1fr);gap:8px;padding-bottom:24px;margin-bottom:0}
.g-lobby .gl-urow>.gl-rule,.g-lobby .gl-urow p{display:none}
.g-lobby .gl-opt .gl-btn{margin-top:0}
.g-lobby .gl-center{min-height:220px}
.g-lobby .gl-msg{font-size:24px}
}
@media (max-width:400px){
.g-lobby .gl-card{border-radius:22px}
.g-lobby .gl-head{padding:12px 16px 24px}
.g-lobby .gl-body{padding:24px 16px}
.g-lobby .gl-foot{padding:22px 16px}
.g-lobby .gl-codebox{gap:12px;padding-left:16px}
.g-lobby .gl-pl{gap:12px}
}
@media (prefers-reduced-motion:reduce){.g-lobby,.g-lobby *{transition:none!important;animation:none!important}}`;
const NET_I = {
  crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 21h14"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L11.6 6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
};
const netEsc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => '&#' + c.charCodeAt(0) + ';');
const netName = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`\\\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
const netMsg = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
const netUid = () => Array.from({ length: 10 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('').toLowerCase();
const netLs = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; };
const netProfile = () => { try { const p = JSON.parse(netLs('gameplay:profile') || 'null'); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; } catch (e) { return {}; } };
const netLoadName = () => { const p = netProfile(); return netName(p.username) || netName(p.displayName) || netName(netLs('gameplay:netname')); };
const netSaveName = n => {
  n = netName(n);
  if (!n) return;
  const p = netProfile();
  if (p.username === n) return;
  p.username = n;
  netLs('gameplay:profile', JSON.stringify(p));
  try { window.dispatchEvent(new CustomEvent('gameplay:profile', { detail: Object.assign({}, p) })); } catch (e) {}
};
const netInit = n => {
  const w = String(n || '').trim().split(/\s+/).filter(Boolean).map(x => Array.from(x));
  if (!w.length) return '?';
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2).join('')).toUpperCase();
};
const netHm = t => { const d = new Date(t), p = x => (x < 10 ? '0' : '') + x; return p(d.getHours()) + ':' + p(d.getMinutes()); };
const netTrack = (ev, p) => { try { if (typeof Ameplay !== 'undefined' && Ameplay.analytics && typeof Ameplay.analytics.track === 'function') Ameplay.analytics.track(ev, p); } catch (e) {} };
const netSizes = o => {
  const mn = Math.max(2, Math.min(8, Math.round(+o.min) || 2));
  let s = (Array.isArray(o.sizes) ? o.sizes : []).map(n => Math.round(+n)).filter(n => n >= 2 && n <= 8);
  if (!s.length) { const mx = Math.max(mn, Math.min(8, Math.round(+o.max) || 4)); for (let i = mn; i <= mx; i++) s.push(i); }
  if (+o.max >= 2) { const f = s.filter(n => n <= +o.max); if (f.length) s = f; }
  s = [...new Set(s)].sort((a, b) => a - b);
  const f = s.filter(n => n >= mn);
  s = f.length ? f : [s[s.length - 1]];
  const min = Math.min(mn, s[0]);
  const d = Math.round(+o.defaultSize);
  return { sizes: s, min, def: s.indexOf(d) >= 0 ? d : s[s.length - 1] };
};
const NET_TURN = 'staticauth.openrelay.metered.ca', NET_TURN_KEY = 'openrelayprojectsecret';
let netIceC = null;
const netIce = () => {
  if (netIceC && Date.now() - netIceC.t < 6 * 3600e3) return netIceC.p;
  const p = (async () => {
    const ice = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
    try {
      const te = new TextEncoder(), user = (Math.floor(Date.now() / 1000) + 86400) + ':gameplay';
      const k = await crypto.subtle.importKey('raw', te.encode(NET_TURN_KEY), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, te.encode(user)));
      ice.push({ urls: ['turn:' + NET_TURN + ':80', 'turn:' + NET_TURN + ':80?transport=tcp', 'turn:' + NET_TURN + ':443', 'turns:' + NET_TURN + ':443?transport=tcp'], username: user, credential: btoa(String.fromCharCode.apply(null, sig)) });
    } catch (e) {}
    return ice;
  })();
  netIceC = { t: Date.now(), p };
  return p;
};
const NET_SOFT = ['network', 'server-error', 'socket-error', 'socket-closed', 'load'];
const netWhy = (e, code) => {
  const t = e && e.type;
  if (t === 'peer-unavailable') return code ? `Party ${code} not found. Check the code and try again.` : 'Party not found. Check the code and try again.';
  if (t === 'ice') return 'Could not connect to the other player. A school, office or mobile network may be blocking game connections. Try again, or switch networks (for example Wi-Fi instead of mobile data).';
  if (t === 'timeout') return 'The other player did not answer. Try again.';
  if (t === 'load') return 'Could not load the online player. Check your internet connection and try again.';
  if (NET_SOFT.indexOf(t) >= 0) return 'Can’t reach the online server right now (it may be busy or blocked on this network). Try again in a moment.';
  return netErr(e);
};
const netTe = new TextEncoder();
function makeNet(g, add) {
  const ls = {};
  const emit = (t, ...a) => (ls[t] || []).slice().forEach(f => { try { f(...a); } catch (e) { console.error(e); } });
  let peer = null, conn = null, hb = 0, lastRx = 0, gen = 0, mode = null, note = null, ckId = 0;
  const now = () => performance.now();
  const pid = code => 'gameplay-' + g.id + '-' + code;
  const sleepMs = ms => new Promise(r => setTimeout(r, ms));
  const wait = (p, ms, type) => new Promise((res, rej) => {
    const t = setTimeout(() => rej({ type }), ms);
    p(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
  });
  const tx = (c, m, s) => {
    if (!c || !c.open) return false;
    const dc = c.dataChannel;
    try {
      if (!dc || dc.readyState !== 'open' || c.serialization !== 'json') { c.send(m); return true; }
      if (s == null) s = JSON.stringify(m);
      if (s.length < 5000) { dc.send(netTe.encode(s)); return true; }
      const b = netTe.encode(s);
      if (b.byteLength < 16000) { dc.send(b); return true; }
      const id = ++ckId, n = Math.ceil(s.length / 2500);
      for (let i = 0; i < n; i++) dc.send(netTe.encode(JSON.stringify({ __ck: [id, i, n, s.slice(i * 2500, i * 2500 + 2500)] })));
      return true;
    } catch (e) { return false; }
  };
  const unck = (c, d) => {
    if (!d || typeof d !== 'object' || !Array.isArray(d.__ck)) return d;
    const [id, i, n, part] = d.__ck;
    if (typeof part !== 'string' || !(n > 0 && n < 4000) || !(i >= 0 && i < n)) return null;
    let e = c.__ck;
    if (!e || e.id !== id) e = c.__ck = { id, n, got: 0, p: [] };
    if (e.p[i] == null) { e.p[i] = part; e.got++; }
    if (e.got < e.n) return null;
    c.__ck = null;
    try { return JSON.parse(e.p.join('')); } catch (x) { return null; }
  };
  const fastOpen = (c, deliver) => {
    if (c.__f || !c.peerConnection) return;
    let ch;
    try { ch = c.peerConnection.createDataChannel('gpf', { negotiated: true, id: 7, ordered: false, maxRetransmits: 0 }); } catch (e) { return; }
    const f = c.__f = { ch, ok: false, sq: 0, rq: 0 };
    ch.onmessage = e => {
      if (typeof e.data !== 'string') return;
      let d;
      try { d = JSON.parse(e.data); } catch (x) { return; }
      if (!Array.isArray(d)) return;
      f.ok = true;
      const q = d[0];
      if (!(q > f.rq) || !d[1] || typeof d[1] !== 'object') return;
      f.rq = q;
      deliver(d[1]);
    };
    ch.onopen = () => fastHi(c);
    c.on('close', () => { try { ch.close(); } catch (e) {} });
  };
  const fastHi = c => { const f = c && c.__f; if (f && !f.ok && f.ch.readyState === 'open') { try { f.ch.send('[0]'); } catch (e) {} } };
  const fastTx = (c, s) => {
    const f = c && c.__f;
    if (!f || !f.ok || f.ch.readyState !== 'open' || s.length > 15000) return false;
    if (f.ch.bufferedAmount > 65536) return true;
    try { f.ch.send('[' + (++f.sq) + ',' + s + ']'); return true; } catch (e) { return false; }
  };
  const ping = (c, t) => { fastHi(c); if (!fastTx(c, '{"__hb":' + t + '}')) tx(c, { __hb: t }); };
  const pong = (c, d, fast) => { if (fast) fastTx(c, '{"__hr":' + (+d.__hb || 0) + '}'); else tx(c, { __hr: d.__hb }); };
  const drop = () => {
    if (!conn) return;
    conn = null; clearInterval(hb);
    emit('close');
  };
  const attach = c => {
    conn = c; lastRx = now();
    const inn = (d, fast) => {
      if (conn !== c) return;
      lastRx = now();
      if (d && d.__hb) { pong(c, d, fast); return; }
      if (d && d.__hr) { net.rtt = Math.round(now() - d.__hr); return; }
      if (d && d.__hey) { if (net.role === 'host') tx(c, { __hi: 1 }); return; }
      if (d && (d.__hi || d.__full)) return;
      emit('data', d);
    };
    c.on('data', d0 => { const d = unck(c, d0); if (d !== null) inn(d, false); });
    fastOpen(c, d => inn(d, true));
    c.on('close', () => { if (conn === c) drop(); });
    c.on('error', () => { if (conn === c) drop(); });
    clearInterval(hb);
    let last = now();
    hb = setInterval(() => {
      if (conn !== c) return clearInterval(hb);
      const t = now();
      if (t - last > 2500) lastRx = Math.max(lastRx, t - 1000);
      last = t;
      ping(c, t);
      if (t - lastRx > 6000) drop();
    }, 1000);
    emit('open', net.role);
  };
  const keep = p => {
    let n = 0, next = 0;
    p.on('open', () => { n = 0; next = 0; });
    const t = setInterval(() => {
      if (p.destroyed) return clearInterval(t);
      if (!p.disconnected) { n = 0; return; }
      const tm = now();
      if (tm < next) return;
      next = tm + Math.min(30000, 1500 * Math.pow(2, n++));
      try { p.reconnect(); } catch (e) {}
    }, 1000);
  };
  const newPeer = async (id, my) => {
    let Peer;
    try { Peer = await loadPeer(); } catch (e) { try { Peer = await loadPeer(); } catch (x) { throw { type: 'load' }; } }
    const config = { iceServers: await netIce(), sdpSemantics: 'unified-plan' };
    let last = null;
    for (let i = 0; i < 3; i++) {
      if (i) {
        if (note) note(`Server busy, trying again (${i + 1}/3)…`);
        await sleepMs(1500 * i);
      }
      if (my != null && my !== gen) throw { type: 'cancel' };
      const p = new Peer(id, { debug: 0, config });
      try { await wait((res, rej) => { p.on('open', res); p.on('error', rej); }, 10000, 'network'); }
      catch (e) { try { p.destroy(); } catch (x) {} last = e; if (!e || NET_SOFT.indexOf(e.type) < 0) throw e; continue; }
      p.on('error', e => emit('error', e));
      keep(p);
      return p;
    }
    throw last || { type: 'network' };
  };
  const dial1 = (p, code, my, hello, done) => new Promise((res, rej) => {
    if (!p || p.destroyed) return rej({ type: 'network' });
    let c, settled = false, t = 0, ext = false, rs = 0;
    const ice = () => { const pc = c && c.peerConnection; return pc ? pc.iceConnectionState : 'new'; };
    const why = () => { const s = ice(); return s === 'checking' || s === 'failed' || s === 'disconnected' ? 'ice' : s === 'connected' || s === 'completed' ? 'timeout' : 'peer-unavailable'; };
    const fin = (e, v) => {
      if (settled) return;
      settled = true; clearTimeout(t); clearInterval(rs);
      try { p.off('error', onErr); } catch (x) {}
      if (e) { try { if (c) c.close(); } catch (x) {} rej(e); } else res(v);
    };
    const onErr = e => fin(e && e.type === 'peer-unavailable' ? e : e && e.type ? e : { type: 'network' });
    const tick = () => { if (!ext && ice() === 'checking') { ext = true; t = setTimeout(tick, 10000); return; } fin({ type: why() }); };
    t = setTimeout(tick, 12000);
    p.on('error', onErr);
    try { c = p.connect(pid(code), { reliable: true, serialization: 'json' }); } catch (e) { return fin({ type: 'network' }); }
    if (!c) return fin({ type: 'network' });
    c.on('open', () => {
      const say = () => { if (!settled) tx(c, hello || { __hey: 1 }); };
      say(); rs = setInterval(say, 1000);
    });
    c.on('error', e => { if (e && e.type === 'negotiation-failed') fin({ type: 'ice' }); });
    c.on('data', d => {
      if (settled) return;
      if (my !== gen) return fin({ type: 'cancel' });
      const r = done(d);
      if (r === true) fin(null, c);
      else if (r) fin(r);
    });
    c.on('close', () => fin({ type: why() }));
  });
  const dial = async (p, code, my, hello, done) => {
    try { return await dial1(p, code, my, hello, done); }
    catch (e) { if (e && e.type === 'timeout' && hello && my === gen && p && !p.destroyed) return dial1(p, code, my, hello, done); throw e; }
  };
  const rm = { me: null, key: null, name: '', hostId: null, list: [], guests: new Map(), seq: 0, min: 2, max: 4, sizes: [2, 3, 4], state: 'lobby', conn: null, lastRx: 0, hb: 0, ui: null, busy: false, reconn: false, pendingGo: null, inGame: false, leader: null, chat: [], rate: new Map(), compat: false, compatO: null, tick: 0, lastTick: 0 };
  const leaderId = () => {
    if (net.role === 'host') return rm.leader && (rm.leader === rm.me || rm.guests.has(rm.leader)) ? rm.leader : rm.me;
    return rm.leader || rm.hostId;
  };
  const pubOf = gs => ({ id: gs.id, name: gs.name, host: false });
  const hostPlayers = () => {
    const L = leaderId();
    return [{ id: rm.me, name: rm.name, host: true, leader: L === rm.me, ping: 0, away: false, inGame: true }].concat([...rm.guests.values()].sort((a, b) => a.seq - b.seq).map(gs => ({ id: gs.id, name: gs.name, host: false, leader: L === gs.id, ping: gs.rtt, away: gs.away, inGame: gs.inGame })));
  };
  const uniqueName = (nm, skip) => {
    nm = netName(nm) || 'Player';
    const taken = new Set(hostPlayers().filter(p => p.id !== skip).map(p => p.name.toLowerCase()));
    if (!taken.has(nm.toLowerCase())) return nm;
    for (let i = 2; i < 99; i++) { const t = nm.slice(0, 13) + ' ' + i; if (!taken.has(t.toLowerCase())) return t; }
    return nm;
  };
  const cleanList = l => Array.isArray(l) ? l.slice(0, 8).filter(p => p && typeof p.id === 'string').map(p => ({ id: p.id.slice(0, 16), name: netName(p.name) || 'Player', host: !!p.host, leader: !!p.leader, ping: Math.max(0, Math.min(9999, +p.ping || 0)), away: !!p.away, inGame: !!p.inGame })) : [];
  const cleanSizes = l => Array.isArray(l) ? l.map(n => Math.round(+n)).filter(n => n >= 2 && n <= 8).slice(0, 7) : [];
  const cleanMsg = m => m && typeof m === 'object' ? { i: typeof m.i === 'string' ? m.i.slice(0, 16) : '', n: netName(m.n), x: netMsg(m.x), t: +m.t || Date.now(), s: m.s ? 1 : 0 } : null;
  const cleanChat = l => Array.isArray(l) ? l.slice(-100).map(cleanMsg).filter(m => m && m.x) : [];
  const pushList = () => {
    rm.list = hostPlayers();
    const m = { __pl: rm.list, busy: rm.state === 'game', min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId() };
    rm.guests.forEach(gs => tx(gs.conn, m));
    if (rm.ui) rm.ui.update();
  };
  const chatAdd = m => {
    rm.chat.push(m);
    if (rm.chat.length > 100) rm.chat.splice(0, rm.chat.length - 100);
    const pk = { __cm: m };
    rm.guests.forEach(gs => tx(gs.conn, pk));
    if (rm.ui) rm.ui.chat();
  };
  const sysLine = x => chatAdd({ i: '', n: '', x: netMsg(x), t: Date.now(), s: 1 });
  const chatFrom = (id, nm, x) => {
    x = netMsg(x);
    if (!x) return;
    const t = Date.now(), r = (rm.rate.get(id) || []).filter(v => t - v < 5000);
    rm.rate.set(id, r);
    if (r.length >= 5) return;
    r.push(t);
    chatAdd({ i: id, n: nm, x, t, s: 0 });
  };
  const welOf = gs => ({ __wel: { id: gs.id, host: rm.me, code: net.code, busy: rm.state === 'game', inGame: gs.inGame, min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), chat: rm.chat } });
  const removeGuest = (id, why) => {
    const gs = rm.guests.get(id);
    if (!gs) return;
    rm.guests.delete(id); clearTimeout(gs.gt); rm.rate.delete(id);
    const c = gs.conn; gs.conn = null;
    if (c) { if (why === 'kick') tx(c, { __kick: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, why === 'kick' ? 400 : 0); }
    emit('leave', pubOf(gs));
    if (rm.compat && rm.state === 'game' && gs.inGame) emit('close');
    sysLine(gs.name + (why === 'kick' ? ' was removed from the party' : ' left the party'));
    if (rm.leader === id) { rm.leader = rm.me; sysLine(rm.name + ' is now the host'); }
    pushList();
  };
  const setLeader = id => {
    const p = hostPlayers().find(q => q.id === id && !q.away);
    if (!p || leaderId() === id) return;
    rm.leader = id;
    sysLine(p.name + ' is now the host');
    if (id === rm.me) toast('You are now the host');
    pushList();
  };
  const setSize = n => {
    n = Math.round(+n);
    if (rm.sizes.indexOf(n) < 0 || n < hostPlayers().length || n === rm.max || rm.state === 'game') return;
    rm.max = n;
    pushList();
  };
  const ctl = (a, id, n) => {
    if (a === 'kick') { if (typeof id === 'string' && rm.guests.has(id)) removeGuest(id, 'kick'); }
    else if (a === 'lead') { if (typeof id === 'string') setLeader(id); }
    else if (a === 'size') setSize(n);
    else if (a === 'play') { if (rm.ui && rm.ui.play) rm.ui.play(); }
  };
  const leadAct = (a, id, n) => {
    if (mode !== 'room' || leaderId() !== rm.me) return;
    if (net.role === 'host') ctl(a, id, n); else tx(rm.conn, { __ctl: { a, id, n } });
  };
  const goAway = gs => {
    if (gs.away) return;
    const c = gs.conn; gs.conn = null; gs.away = true;
    try { if (c) c.close(); } catch (e) {}
    clearTimeout(gs.gt);
    gs.gt = setTimeout(() => removeGuest(gs.id, 'lost'), 12000);
    pushList();
  };
  const hostIn = (gid, c, d, fast) => {
    const gs = rm.guests.get(gid);
    if (!gs || gs.conn !== c) return;
    gs.lastRx = now();
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { gs.rtt = Math.round(now() - d.__hr); return; }
    if (d.__hello) { if (!fast) tx(c, welOf(gs)); return; }
    if (fast) { if (gs.inGame && rm.state === 'game') emit('data', d, gid); return; }
    if (d.__bye) { removeGuest(gid, 'left'); return; }
    if (d.__name) { const n2 = uniqueName(d.__name, gid); if (n2 !== gs.name) { gs.name = n2; pushList(); } return; }
    if (d.__chat) { chatFrom(gid, gs.name, d.__chat); return; }
    if (d.__ctl) { const k = d.__ctl; if (k && typeof k === 'object' && leaderId() === gid) ctl(String(k.a || ''), k.id, k.n); return; }
    if (d.__hi || d.__wel || d.__pl || d.__go || d.__lob || d.__cm) return;
    if (gs.inGame && rm.state === 'game') emit('data', d, gid);
  };
  const hostConn = (c, my) => {
    let gid = null;
    const kill = setTimeout(() => { if (!gid) { try { c.close(); } catch (e) {} } }, 15000);
    c.on('open', () => fastOpen(c, d => { if (gid && my === gen) hostIn(gid, c, d, true); }));
    c.on('data', d0 => {
      const d = unck(c, d0);
      if (my !== gen || !d || typeof d !== 'object') return;
      if (!gid) {
        const h = d.__hello;
        if (!h || typeof h.id !== 'string' || typeof h.key !== 'string') return;
        clearTimeout(kill);
        const id = h.id.slice(0, 16), old = rm.guests.get(id);
        if (old) {
          if (old.key !== h.key) { tx(c, { __full: 1, why: 'id' }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
          const prev = old.conn; gid = id;
          old.conn = c; old.lastRx = now(); old.away = false; clearTimeout(old.gt);
          if (prev && prev !== c) { try { prev.close(); } catch (e) {} }
          tx(c, welOf(old));
          if (old.inGame && rm.state === 'game') emit('rejoin', pubOf(old));
          pushList();
          return;
        }
        if (rm.guests.size + 1 >= rm.max) { tx(c, { __full: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
        gid = id;
        const gs = { id, key: h.key, name: uniqueName(h.name), conn: c, lastRx: now(), rtt: 0, inGame: false, away: false, gt: 0, seq: ++rm.seq };
        rm.guests.set(id, gs);
        tx(c, welOf(gs));
        emit('join', pubOf(gs));
        if (rm.state === 'game' && !rm.ui) toast(gs.name + ' is waiting in the lobby');
        sysLine(gs.name + ' joined the party');
        pushList();
        return;
      }
      hostIn(gid, c, d, false);
    });
    const gone = () => { const gs = gid && rm.guests.get(gid); if (gs && gs.conn === c) goAway(gs); };
    c.on('close', gone);
    c.on('error', gone);
  };
  const hostTick = () => {
    const t = now(), stall = t - (rm.lastTick || t) > 2500;
    rm.lastTick = t;
    let mx = 0;
    rm.guests.forEach(gs => {
      if (!gs.conn) return;
      if (stall) gs.lastRx = Math.max(gs.lastRx, t - 1000);
      if (!gs.conn.open || t - gs.lastRx > 7000) return goAway(gs);
      ping(gs.conn, t);
      if (gs.inGame || rm.state !== 'game') mx = Math.max(mx, gs.rtt || 0);
    });
    net.rtt = mx;
    if (++rm.tick % 3 === 0) pushList();
  };
  const guestEnd = reason => {
    if (mode !== 'room' || net.role !== 'guest') return;
    const wasGame = rm.state === 'game' && rm.inGame;
    net.closeReason = reason;
    shut(false);
    if (rm.ui) rm.ui.ended(reason);
    if (wasGame || !rm.ui) emit('close', reason);
  };
  const guestData = (c, d, fast) => {
    if (c !== rm.conn || !d || typeof d !== 'object') return;
    rm.lastRx = now();
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { net.rtt = Math.round(now() - d.__hr); return; }
    if (fast) { if (rm.state === 'game' && rm.inGame) emit('data', d, rm.hostId); return; }
    if (d.__pl) {
      rm.list = cleanList(d.__pl); rm.busy = !!d.busy;
      if (+d.min) rm.min = +d.min;
      if (+d.max) rm.max = +d.max;
      const s = cleanSizes(d.sizes); if (s.length) rm.sizes = s;
      const L = typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId;
      if (L !== rm.leader) { const was = rm.leader; rm.leader = L; if (was && L === rm.me) toast('You are now the host'); }
      if (rm.ui) rm.ui.update();
      return;
    }
    if (d.__cm) {
      const m = cleanMsg(d.__cm);
      if (m && m.x) { rm.chat.push(m); if (rm.chat.length > 100) rm.chat.splice(0, rm.chat.length - 100); if (rm.ui) rm.ui.chat(); }
      return;
    }
    if (d.__go) {
      rm.state = 'game'; rm.inGame = true; rm.busy = true;
      const players = cleanList(d.__go).map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.leader }));
      const r = { role: 'guest', id: rm.me, players, size: Math.round(+d.size) || players.length, leader: typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId };
      if (rm.ui) rm.ui.finish(r);
      else rm.pendingGo = r;
      return;
    }
    if (d.__lob) {
      rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null;
      emit('lobby');
      if (rm.compat && !(ls.lobby || []).length && !rm.ui) net.lobby(rm.compatO || {});
      return;
    }
    if (d.__kick) { guestEnd('kicked'); return; }
    if (d.__end) { guestEnd('host-left'); return; }
    if (d.__wel || d.__full || d.__hi || d.__ch) return;
    if (rm.state === 'game' && rm.inGame) emit('data', d, rm.hostId);
  };
  const guestConnect = async (code, my) => {
    let w = null;
    const c = await dial(peer, code, my, { __hello: { id: rm.me, key: rm.key, name: rm.name } }, d => {
      if (d && d.__full) return { type: d.why === 'id' ? 'network' : 'room-full' };
      if (d && d.__wel) { w = d.__wel; return true; }
      return false;
    });
    return { c, w };
  };
  const guestAttach = (c, w) => {
    rm.conn = c; rm.lastRx = now(); rm.reconn = false;
    rm.hostId = typeof w.host === 'string' ? w.host.slice(0, 16) : 'host';
    rm.busy = !!w.busy;
    if (+w.min) rm.min = +w.min;
    if (+w.max) rm.max = +w.max;
    const s = cleanSizes(w.sizes); if (s.length) rm.sizes = s;
    rm.leader = typeof w.leader === 'string' ? w.leader.slice(0, 16) : rm.hostId;
    if (Array.isArray(w.chat)) rm.chat = cleanChat(w.chat);
    c.on('data', d0 => { const d = unck(c, d0); if (d !== null) guestData(c, d, false); });
    fastOpen(c, d => guestData(c, d, true));
    const gone = () => { if (rm.conn === c) guestLost(); };
    c.on('close', gone);
    c.on('error', gone);
    clearInterval(rm.hb);
    let last = now();
    rm.hb = setInterval(() => {
      if (rm.conn !== c) return;
      const t = now();
      if (t - last > 2500) rm.lastRx = Math.max(rm.lastRx, t - 1000);
      last = t;
      if (!c.open || t - rm.lastRx > 7000) return guestLost();
      ping(c, t);
    }, 1000);
    if (rm.ui) rm.ui.chat();
  };
  const guestLost = async () => {
    const c = rm.conn;
    if (!c || rm.reconn) return;
    rm.conn = null; rm.reconn = true; clearInterval(rm.hb);
    try { c.close(); } catch (e) {}
    if (rm.ui) rm.ui.update();
    const my = gen, code = net.code, t0 = now();
    while (my === gen && now() - t0 < 16000) {
      await new Promise(r => setTimeout(r, 1500));
      if (my !== gen) return;
      try {
        if (!peer || peer.destroyed) { const p = await newPeer(undefined, my); if (my !== gen) { p.destroy(); return; } peer = p; }
        else if (peer.disconnected) { try { peer.reconnect(); } catch (e) {} await new Promise(r => setTimeout(r, 1500)); }
        const { c: c2, w } = await guestConnect(code, my);
        if (my !== gen) { try { c2.close(); } catch (e) {} return; }
        if (rm.state === 'game' && rm.inGame && !w.inGame) { guestAttach(c2, w); guestEnd('lost'); return; }
        guestAttach(c2, w);
        if (rm.ui) rm.ui.update();
        return;
      } catch (e) {}
    }
    if (my === gen) guestEnd('lost');
  };
  const shut = polite => {
    gen++; clearInterval(hb); clearInterval(rm.hb);
    const c = conn, p = peer, gc = rm.conn, gs = [...rm.guests.values()], wasHost = mode === 'room' && net.role === 'host';
    conn = null; peer = null; rm.conn = null; rm.reconn = false;
    gs.forEach(x => clearTimeout(x.gt)); rm.guests.clear();
    let delay = 0;
    if (polite && mode === 'room') {
      if (wasHost) gs.forEach(x => { if (tx(x.conn, { __end: 1 })) delay = 350; });
      else if (tx(gc, { __bye: 1 })) delay = 350;
    }
    const bye = () => {
      try { if (c) c.close(); } catch (e) {}
      try { if (gc) gc.close(); } catch (e) {}
      gs.forEach(x => { try { if (x.conn) x.conn.close(); } catch (e) {} });
      try { if (p) p.destroy(); } catch (e) {}
    };
    if (delay) setTimeout(bye, delay); else bye();
    net.role = null; net.code = null; mode = null; net.rtt = 0;
    rm.list = []; rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null; rm.leader = null; rm.chat = []; rm.rate.clear();
  };
  const roomHost = async () => {
    shut(true);
    const my = gen;
    for (let i = 0; i < 5; i++) {
      const code = Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
      let p;
      try { p = await newPeer(pid(code), my); } catch (e) { if (e && e.type === 'unavailable-id') continue; throw e; }
      if (my !== gen) { p.destroy(); return null; }
      peer = p; net.code = code; net.role = 'host'; mode = 'room';
      rm.me = netUid(); rm.state = 'lobby'; rm.guests.clear(); rm.tick = 0; rm.lastTick = 0; rm.hostId = rm.me; rm.leader = rm.me; rm.chat = []; net.closeReason = null;
      p.on('connection', c => hostConn(c, my));
      clearInterval(rm.hb);
      rm.hb = setInterval(() => { if (my === gen) hostTick(); }, 1000);
      pushList();
      return code;
    }
    throw { type: 'network' };
  };
  const roomJoin = async code => {
    shut(true);
    const my = gen;
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const p = await newPeer(undefined, my);
    if (my !== gen) { p.destroy(); return false; }
    peer = p;
    rm.me = netUid(); rm.key = netUid() + netUid(); rm.state = 'lobby'; rm.inGame = false; rm.list = []; rm.leader = null; rm.chat = []; net.closeReason = null;
    let r;
    try { r = await guestConnect(code, my); } catch (e) { if (my === gen) shut(false); throw e; }
    if (my !== gen) { try { r.c.close(); } catch (e) {} return false; }
    if (invite && invite.id === g.id) invite = null;
    net.code = code; net.role = 'guest'; mode = 'room';
    guestAttach(r.c, r.w);
    return true;
  };
  const roomUi = (o, compat) => {
    if (!document.getElementById('g-lobby-css')) {
      const s = document.createElement('style'); s.id = 'g-lobby-css'; s.textContent = NET_CSS; document.head.append(s);
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'; document.head.append(l);
    }
    if (rm.ui) rm.ui.finish(null, true);
    o = o && typeof o === 'object' ? o : {};
    const cfg = netSizes(o);
    rm.compat = !!compat; rm.compatO = compat ? o : null;
    if (mode !== 'room') rm.name = netLoadName() || rm.name || netName(o.name);
    if (mode === 'room' && net.role === 'guest' && rm.pendingGo) {
      const r = rm.pendingGo; rm.pendingGo = null;
      if (rm.compat) emit('open', 'guest');
      return Promise.resolve(r);
    }
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.className = 'g-lobby';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', (g.title || 'Online') + ' party');
      (document.fullscreenElement || document.body).append(el); void el.offsetWidth; el.classList.add('show');
      document.documentElement.classList.add('gl-lock');
      const narrow = window.matchMedia('(max-width:859px)');
      const fit = () => {
        const c = !done && el.querySelector('.gl-card');
        if (!c) return;
        if (narrow.matches) { c.style.removeProperty('--gls'); return; }
        const s = Math.min(1, (window.innerWidth - 48) / c.offsetWidth, (window.innerHeight - 48) / c.offsetHeight);
        c.style.setProperty('--gls', String(Math.max(.3, Math.floor(s * 1000) / 1000)));
      };
      const ro = window.ResizeObserver ? new ResizeObserver(() => fit()) : null;
      const onFs = () => { const p = document.fullscreenElement || document.body; if (el.parentNode !== p) p.append(el); fit(); };
      const guard = e => { if (!el.contains(e.target)) e.stopPropagation(); };
      window.addEventListener('resize', fit);
      window.addEventListener('keydown', guard, true);
      window.addEventListener('keyup', guard, true);
      document.addEventListener('fullscreenchange', onFs);
      const saved = Math.round(+netLs('gameplay:partysize:' + g.id));
      let done = false, screen = '', again = null, op = 0, pick = cfg.sizes.indexOf(saved) >= 0 ? saved : cfg.def, hidden = netLs('gameplay:hidecode') === '1', sent = [], cache = {}, playT = 0, slowT = 0;
      const ui = {};
      const finish = (r, keep) => {
        if (done) return;
        done = true; note = null; clearTimeout(playT); clearTimeout(slowT);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', fit);
        window.removeEventListener('keydown', guard, true);
        window.removeEventListener('keyup', guard, true);
        document.removeEventListener('fullscreenchange', onFs);
        document.documentElement.classList.remove('gl-lock');
        if (rm.ui === ui) rm.ui = null;
        el.classList.remove('show'); el.style.pointerEvents = 'none';
        setTimeout(() => el.remove(), 400);
        if (r === null && !keep) shut(true);
        if (r && rm.compat) emit('open', r.role);
        resolve(r);
      };
      const shareLbl = navigator.share ? 'Share invite link' : 'Copy invite link';
      const eye = () => `<svg viewBox="0 0 24 24" aria-hidden="true">${hidden ? NET_I.eyeOff : NET_I.eye}</svg><span>${hidden ? 'Show' : 'Hide'}</span>`;
      const codeHtml = () => `<div class="gl-code"><small>Party code</small><div class="gl-codebox"><b class="gl-codetxt">${hidden ? '••••' : netEsc(net.code)}</b><span class="gl-tools"><button class="gl-hide" type="button" data-n="hide" aria-pressed="${hidden}" aria-label="${hidden ? 'Show' : 'Hide'} party code">${eye()}</button><button class="gl-sq gl-crown" type="button" data-n="share" title="${shareLbl}" aria-label="${shareLbl}">${NET_I.link}</button></span></div></div>`;
      const head = (back, code) => `<header class="gl-head"><button class="gl-leave" type="button" data-n="${back}">${NET_I.back}<span>${back === 'cancel' ? 'Cancel' : code ? 'Leave' : 'Back'}</span></button><h1>${netEsc(g.title || o.title || 'Online party')}</h1>${code ? codeHtml() : ''}</header>`;
      const row = (p, lead, amLead) => {
        const isL = p.id === lead, me = p.id === rm.me, nm = netEsc(p.name);
        let sub = (isL ? 'Party leader' : 'Member') + (me ? ' · You' : '');
        if (p.away) sub += ' · Reconnecting…';
        else if (rm.busy && !p.inGame) sub += ' · Waiting';
        else if (rm.busy) sub += ' · In game';
        let b = '';
        if (amLead) {
          b = isL ? `<span class="gl-sq gl-crown" title="Party leader">${NET_I.crown}</span>` : `<button class="gl-sq gl-crown" type="button" data-n="lead" data-id="${netEsc(p.id)}" title="Make host" aria-label="Make ${nm} the host"${p.away ? ' disabled' : ''}>${NET_I.crown}</button>`;
          b += me || p.host ? '<span class="gl-sq gl-ph"></span>' : `<button class="gl-sq gl-kick" type="button" data-n="kick" data-id="${netEsc(p.id)}" title="Remove" aria-label="Remove ${nm}">${NET_I.x}</button>`;
        } else if (isL) b = `<span class="gl-sq gl-crown" title="Party leader">${NET_I.crown}</span>`;
        return `<li class="gl-pl${isL ? ' lead' : ''}${p.away ? ' away' : ''}"><span class="gl-av" aria-hidden="true">${netEsc(netInit(p.name))}</span><div class="gl-who"><b><i>${nm}</i>${isL ? '<span class="gl-badge">HOST</span>' : ''}</b><span>${sub}</span></div>${b}</li>`;
      };
      const put = (k, sel, html) => { if (cache[k] === html) return; const x = el.querySelector(sel); if (!x) return; cache[k] = html; x.innerHTML = html; };
      const show = (s, a = {}) => {
        screen = s; again = a.retry || null; note = null; cache = {};
        const foot = (m, bad) => `<footer class="gl-foot sm"><p class="gl-st${bad ? ' bad' : ''}" role="status">${netEsc(m)}</p>${a.retry ? '<button class="gl-play" type="button" data-n="retry">Try again</button>' : ''}</footer>`;
        if (s === 'start') {
          const sz = cfg.sizes.map(n => `<button class="gl-size" type="button" role="radio" aria-checked="${n === pick}" data-n="size" data-v="${n}">${n}</button>`).join('');
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('back')}<div class="gl-body"><div class="gl-urow"><div><label class="gl-lbl" for="gl-nm-${g.id}">Username</label><input id="gl-nm-${g.id}" class="gl-in gl-name" maxlength="16" placeholder="Choose a username" autocomplete="nickname" autocapitalize="off" spellcheck="false" enterkeyhint="done" value="${netEsc(rm.name)}"></div><div class="gl-rule"></div><p>Everyone in the party sees this name.</p></div><section class="gl-sec gl-opt" aria-label="Create party"><div class="gl-sec-h"><h2>Create party</h2></div><p>Pick the party size, then share the code with your friends.</p><span class="gl-lbl">Party size</span><div class="gl-sizes" role="radiogroup" aria-label="Party size">${sz}<span>players</span></div><button class="gl-btn" type="button" data-n="host">Create party</button></section><div class="gl-rule"></div><section class="gl-sec gl-opt" aria-label="Join party"><div class="gl-sec-h"><h2>Join party</h2></div><p>Type the code a friend shared with you.</p><label class="gl-lbl" for="gl-cd-${g.id}">Party code</label><input id="gl-cd-${g.id}" class="gl-in gl-code-in" maxlength="4" placeholder="ABCD" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="go" value="${netEsc(a.code || '')}"><button class="gl-btn ghost" type="button" data-n="join">Join party</button></section></div>${foot(a.msg || 'Only real players join: share the code or the invite link.', a.bad)}</div>`;
        } else if (s === 'wait') {
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('cancel')}<div class="gl-body"><div class="gl-center"><div class="gl-spin" aria-hidden="true"></div><p class="gl-msg">${netEsc(a.msg)}</p><p class="gl-st" role="status">${netEsc(a.sub || 'Connecting to the server…')}</p></div></div><footer class="gl-foot"><button class="gl-play ghost" type="button" data-n="cancel">Cancel</button></footer></div>`;
          note = t => { const x = !done && screen === 'wait' && el.querySelector('.gl-st'); if (x) x.textContent = t; };
        } else if (s === 'lobby') {
          el.innerHTML = `<div class="gl-card gl-lob" tabindex="-1">${head('back', true)}<div class="gl-body"><section class="gl-sec" aria-label="Players"><div class="gl-sec-h"><h2>Players</h2><span class="gl-cnt"></span></div><ul class="gl-players"></ul></section><div class="gl-rule"></div><section class="gl-sec gl-chat" aria-label="Live chat"><div class="gl-sec-h"><h2>Live chat</h2><span class="gl-pill gl-live">Live</span></div><div class="gl-msgs" role="log" aria-live="polite"></div><form class="gl-send"><input class="gl-chat-in" maxlength="200" placeholder="Type a message..." autocomplete="off" enterkeyhint="send" aria-label="Message"><button class="gl-go" type="submit" aria-label="Send">${NET_I.send}</button></form></section></div><footer class="gl-foot"></footer></div>`;
          ui.update(); ui.chat(true);
        } else if (s === 'ended') {
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('back')}<div class="gl-body"><div class="gl-center"><p class="gl-msg">${netEsc(a.msg)}</p><p class="gl-txt">${netEsc(a.sub)}</p></div></div><footer class="gl-foot"><button class="gl-play" type="button" data-n="menu">OK</button></footer></div>`;
        }
        const c = el.querySelector('.gl-card');
        if (ro) { ro.disconnect(); ro.observe(c); }
        fit();
        if (!el.contains(document.activeElement)) { try { c.focus({ preventScroll: true }); } catch (e) {} }
      };
      ui.finish = finish;
      ui.update = () => {
        if (done || screen !== 'lobby') return;
        const L = rm.list, lead = leaderId(), amLead = lead === rm.me, n = L.filter(p => !p.away).length;
        put('pl', '.gl-players', L.map(p => row(p, lead, amLead)).join(''));
        const opts = amLead && !rm.busy && !rm.reconn ? rm.sizes.filter(s => s >= L.length) : [];
        put('cnt', '.gl-cnt', opts.length > 1 ? `<label class="gl-pill pick">${L.length} / ${rm.max} joined${NET_I.down}<select data-n="sizesel" aria-label="Party size">${opts.map(s => `<option value="${s}"${s === rm.max ? ' selected' : ''}>${s} players</option>`).join('')}</select></label>` : `<span class="gl-pill">${L.length} / ${rm.max} joined</span>`);
        let f;
        if (amLead) {
          const blocked = rm.busy && net.role !== 'host';
          const hint = rm.reconn ? 'Connection lost. Reconnecting…' : blocked ? 'A game is in progress. You can start when it ends.' : n < rm.min ? `Waiting for ${rm.min - n} more player${rm.min - n > 1 ? 's' : ''}…` : '';
          f = `<button class="gl-play" type="button" data-n="play"${n < rm.min || blocked || rm.reconn ? ' disabled' : ''}>${NET_I.play}Play</button><p class="gl-hint" role="status">${netEsc(hint)}</p>`;
        } else f = `<div class="gl-wait" role="status">${rm.reconn ? 'Connection lost. Reconnecting…' : rm.busy ? 'A game is in progress. You will join the next one.' : 'Waiting for the host…'}</div>`;
        put('ft', '.gl-foot', f);
      };
      ui.chat = force => {
        if (done || screen !== 'lobby') return;
        const box = el.querySelector('.gl-msgs');
        if (!box) return;
        const stick = force === true || box.scrollTop + box.clientHeight >= box.scrollHeight - 40;
        box.innerHTML = rm.chat.length ? rm.chat.map(m => m.s ? `<div class="gl-m sys"><p>${netEsc(m.x)} · <time>${netHm(m.t)}</time></p></div>` : `<div class="gl-m${m.i === rm.me ? ' me' : ''}"><b>${netEsc(m.n)}</b><time>${netHm(m.t)}</time><p>${netEsc(m.x)}</p></div>`).join('') : '<p class="gl-empty">No messages yet. Say hi!</p>';
        if (stick) box.scrollTop = box.scrollHeight;
      };
      ui.ended = reason => {
        if (done) return;
        const k = reason === 'kicked', h = reason === 'host-left';
        show('ended', { msg: k ? 'You were removed from the party' : h ? 'The party was closed' : 'Lost connection to the party', sub: k ? 'The host removed you from this party. You can create a new party or join another one.' : h ? 'The host left, so the party ended. You can create a new party or join another one.' : 'Check your internet connection, then join the party again.' });
      };
      rm.ui = ui;
      const status = (m, bad) => { const s = el.querySelector('.gl-st'); if (s) { s.textContent = m; s.classList.toggle('bad', !!bad); } };
      const nameIn = () => el.querySelector('.gl-name');
      const readName = () => { const i = nameIn(); return i ? netName(i.value) : rm.name; };
      const needName = m => { status(m || 'Type a username first.', true); const i = nameIn(); if (i) { i.classList.add('bad'); try { i.focus({ preventScroll: true }); } catch (e) {} } };
      const canRetry = e => { const t = e && e.type; return t === 'ice' || t === 'timeout' || NET_SOFT.indexOf(t) >= 0; };
      const hosting = async () => {
        const nm = readName();
        if (!nm) return needName();
        rm.name = nm; netSaveName(nm); netLs('gameplay:partysize:' + g.id, String(pick));
        const my = ++op;
        show('wait', { msg: 'Creating party…' });
        try {
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes;
          const code = await roomHost();
          if (done || my !== op || !code) return;
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes; pushList();
          netTrack('party_create', { game: g.id, size: pick });
          show('lobby');
        } catch (e) { if (!done && my === op && !(e && e.type === 'cancel')) show('start', { msg: netWhy(e), bad: true, retry: canRetry(e) ? hosting : null }); }
      };
      const joining = async code => {
        code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^[A-Z0-9]{4}$/.test(code)) { status('Type the 4-character party code.', true); const i = el.querySelector('.gl-code-in'); if (i) i.focus({ preventScroll: true }); return; }
        const nm = readName();
        if (!nm) return needName(`Choose a username to join party ${code}.`);
        rm.name = nm; netSaveName(nm);
        const my = ++op;
        show('wait', { msg: `Joining party ${code}…`, sub: 'Connecting to the party…' });
        try {
          const ok = await roomJoin(code);
          if (done || my !== op || !ok) return;
          netTrack('party_join', { game: g.id });
          show('lobby');
        } catch (e) {
          const t = e && e.type;
          if (done || my !== op || t === 'cancel') return;
          show('start', { msg: t === 'room-full' ? `Party ${code} is full.` : netWhy(e, code), bad: true, retry: canRetry(e) ? () => joining(code) : null, code });
        }
      };
      const play = () => {
        if (done || screen !== 'lobby' || net.role !== 'host' || mode !== 'room' || rm.state === 'game') return;
        const players = hostPlayers().filter(p => !p.away);
        if (players.length < rm.min) return;
        rm.state = 'game';
        const ids = new Set(players.map(p => p.id));
        rm.guests.forEach(gs => { gs.inGame = ids.has(gs.id); });
        const lead = leaderId();
        const out = players.map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.id === lead }));
        rm.guests.forEach(gs => { if (gs.inGame) tx(gs.conn, { __go: out, size: rm.max, leader: lead }); });
        pushList();
        netTrack('party_play', { game: g.id, players: out.length, size: rm.max });
        finish({ role: 'host', id: rm.me, players: out, size: rm.max, leader: lead });
      };
      ui.play = play;
      const toggleHide = () => {
        hidden = !hidden; netLs('gameplay:hidecode', hidden ? '1' : null);
        const b = el.querySelector('.gl-codetxt'), h = el.querySelector('.gl-hide');
        if (b) b.textContent = hidden ? '••••' : net.code;
        if (h) { h.setAttribute('aria-pressed', String(hidden)); h.setAttribute('aria-label', (hidden ? 'Show' : 'Hide') + ' party code'); h.innerHTML = eye(); }
      };
      const slow = i => {
        const f = i.closest('.gl-send');
        f.classList.add('slow'); i.placeholder = 'Slow down a little…';
        clearTimeout(slowT); slowT = setTimeout(() => { f.classList.remove('slow'); i.placeholder = 'Type a message...'; }, 2500);
      };
      const sendChat = () => {
        const i = el.querySelector('.gl-chat-in');
        if (!i) return;
        const v = netMsg(i.value);
        if (!v || mode !== 'room' || (net.role === 'guest' && !rm.conn)) return;
        const t = Date.now();
        sent = sent.filter(x => t - x < 5000);
        if (sent.length >= 5) return slow(i);
        sent.push(t); i.value = '';
        if (net.role === 'host') chatFrom(rm.me, rm.name, v); else tx(rm.conn, { __chat: v });
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-n]');
        if (!b || done || b.disabled || b.tagName === 'SELECT') return;
        const n = b.dataset.n;
        sfx('tap');
        if (n === 'host') hosting();
        else if (n === 'join') joining(el.querySelector('.gl-code-in').value);
        else if (n === 'size') { pick = +b.dataset.v; el.querySelectorAll('.gl-size').forEach(x => x.setAttribute('aria-checked', String(+x.dataset.v === pick))); }
        else if (n === 'back') finish(null);
        else if (n === 'cancel') { op++; shut(true); show('start'); }
        else if (n === 'menu') show('start');
        else if (n === 'retry' && again) again();
        else if (n === 'share') shareLink();
        else if (n === 'hide') toggleHide();
        else if (n === 'kick' || n === 'lead') leadAct(n, b.dataset.id);
        else if (n === 'play') {
          if (net.role === 'host') return leadAct('play');
          leadAct('play'); b.disabled = true; cache.ft = '';
          clearTimeout(playT); playT = setTimeout(() => ui.update(), 3000);
        }
      });
      el.addEventListener('submit', e => { e.preventDefault(); sendChat(); });
      ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'wheel', 'contextmenu'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' || !e.target.matches('input')) return;
        if (e.target.matches('.gl-code-in')) { e.preventDefault(); joining(e.target.value); }
        else if (e.target.matches('.gl-name')) { e.preventDefault(); const c = el.querySelector('.gl-code-in'); if (c && c.value.length === 4) joining(c.value); else e.target.blur(); }
      });
      el.addEventListener('input', e => {
        if (e.target.matches('.gl-code-in')) e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        else if (e.target.matches('.gl-name')) { e.target.classList.remove('bad'); const v = netName(e.target.value); if (v) { rm.name = v; netSaveName(v); } }
      });
      el.addEventListener('change', e => {
        if (!e.target.matches('select[data-n=sizesel]')) return;
        const v = Math.round(+e.target.value);
        netLs('gameplay:partysize:' + g.id, String(v));
        leadAct('size', null, v);
      });
      add(() => finish(null, true));
      loadPeer().catch(() => {}); netIce();
      if (mode === 'room' && net.role === 'host' && peer && !peer.destroyed) {
        rm.min = cfg.min; rm.sizes = cfg.sizes; rm.state = 'lobby';
        if (cfg.sizes.indexOf(rm.max) < 0) rm.max = cfg.sizes.find(s => s >= rm.guests.size + 1) || cfg.sizes[cfg.sizes.length - 1];
        rm.guests.forEach(gs => { gs.inGame = false; tx(gs.conn, { __lob: 1 }); });
        pushList();
        show('lobby');
      } else if (mode === 'room' && net.role === 'guest' && (rm.conn || rm.reconn)) show('lobby');
      else if (net.invite) {
        const c = net.invite;
        show('start', { code: c });
        if (readName()) joining(c); else needName(`Choose a username to join party ${c}.`);
      } else show('start');
    });
  };
  const net = {
    role: null, code: null, rtt: 0, closeReason: null,
    get id() { return mode === 'room' ? rm.me : null; },
    get players() { return mode === 'room' ? rm.list.map(p => Object.assign({}, p)) : []; },
    get leader() { return mode === 'room' ? leaderId() : null; },
    get size() { return mode === 'room' ? rm.max : mode === 'pair' ? 2 : null; },
    get connected() {
      if (mode === 'room') {
        if (net.role !== 'host') return !!(rm.conn && rm.conn.open);
        if (rm.compat) return [...rm.guests.values()].some(gs => gs.conn && gs.conn.open);
        return !!(peer && !peer.destroyed);
      }
      return !!(conn && conn.open);
    },
    get invite() { return invite && invite.id === g.id ? invite.code : null; },
    on(t, fn) { (ls[t] = ls[t] || []).push(fn); const off = () => { ls[t] = (ls[t] || []).filter(f => f !== fn); }; add(off); return off; },
    send(msg, fast) {
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return; }
      if (s === undefined) return;
      const one = c => (fast && fastTx(c, s)) || tx(c, msg, s);
      if (mode === 'room') {
        if (net.role === 'host') rm.guests.forEach(gs => { if (gs.inGame) one(gs.conn); });
        else one(rm.conn);
        return;
      }
      one(conn);
    },
    sendTo(id, msg, fast) {
      if (mode !== 'room') return net.send(msg, fast);
      const c = net.role === 'host' ? (rm.guests.get(id) || {}).conn : id === rm.hostId ? rm.conn : null;
      if (!c) return false;
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return false; }
      return (fast && fastTx(c, s)) || tx(c, msg, s);
    },
    kick(id) { if (mode === 'room' && net.role === 'host') removeGuest(id, 'kick'); },
    link(code = net.code) { return location.origin + (PATH_MODE ? '/' : location.pathname + '#/') + g.id + '/' + code; },
    close() { shut(true); },
    async host() {
      shut(true);
      const my = gen;
      for (let i = 0; i < 4; i++) {
        const code = Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
        let p;
        try { p = await newPeer(pid(code), my); } catch (e) { if (e && e.type === 'unavailable-id') continue; throw e; }
        if (my !== gen) { p.destroy(); return null; }
        peer = p; net.code = code; net.role = 'host'; mode = 'pair';
        p.on('connection', c => c.on('open', () => {
          if (conn || my !== gen) { try { c.send({ __full: 1 }); } catch (e) {} setTimeout(() => c.close(), 400); return; }
          try { c.send({ __hi: 1 }); } catch (e) {}
          attach(c);
        }));
        return code;
      }
      throw { type: 'network' };
    },
    async join(code) {
      shut(true);
      const my = gen;
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const p = await newPeer(undefined, my);
      if (my !== gen) { p.destroy(); return false; }
      peer = p;
      let c;
      try { c = await dial(p, code, my, null, d => d && d.__hi ? true : d && d.__full ? { type: 'room-full' } : false); }
      catch (e) { if (my === gen) shut(false); throw e; }
      if (my !== gen) { try { c.close(); } catch (e) {} return false; }
      if (invite && invite.id === g.id) invite = null;
      net.code = code; net.role = 'guest'; mode = 'pair';
      attach(c);
      return true;
    },
    lobby(o = {}) { return roomUi(Object.assign({}, o, { sizes: [2], min: 2, max: 2, defaultSize: 2 }), true).then(r => r ? r.role : null); },
    room(o = {}) { return roomUi(o, false); }
  };
  const shareLink = () => {
    const url = net.link();
    if (navigator.share) navigator.share({ title: g.title + ' on gameplay', text: `Join my ${g.title} party on gameplay! Party code ${net.code}`, url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Invite link copied'), () => toast(url));
    else toast(url);
  };
  const onHide = () => { if (mode) shut(true); };
  window.addEventListener('pagehide', onHide);
  add(() => window.removeEventListener('pagehide', onHide));
  add(() => shut(true));
  return net;
}
