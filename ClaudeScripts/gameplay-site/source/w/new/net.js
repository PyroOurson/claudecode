const NET_DARK = '--gl-page:#0f0d1c;--gl-card:#1a1730;--gl-band:#221e3d;--gl-line:#2d2850;--gl-fg:#f1efff;--gl-muted:#9f9cc0;--gl-accent:#8f5cf2;--gl-accent-ink:#ffffff;--gl-accent-soft:#2f2556;--gl-danger:#ff6b80;--gl-danger-soft:#3a1e2c;--gl-live:#3ad596;--gl-live-soft:#143328;--gl-chip:#2a2548;--gl-shadow:0 24px 60px rgba(0,0,0,.55);--gl-veil:rgba(4,3,12,.66);color-scheme:dark';
const NET_CSS = `.g-lobby{position:absolute;inset:0;z-index:200;display:flex;overflow:hidden;opacity:0;transition:opacity .22s ease;text-align:left;border-radius:inherit;--gl-page:#ebe8f7;--gl-card:#ffffff;--gl-band:#f4f1ff;--gl-line:#ece9f6;--gl-fg:#17142b;--gl-muted:#8a87a3;--gl-accent:#7b3aed;--gl-accent-ink:#ffffff;--gl-accent-soft:#efe9ff;--gl-danger:#e5384f;--gl-danger-soft:#fdecef;--gl-live:#16a561;--gl-live-soft:#e8f8ef;--gl-chip:#f0eff5;--gl-shadow:0 24px 60px rgba(60,30,140,.18);--gl-veil:rgba(23,20,43,.5);--gl-font:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--gl-veil);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:var(--gl-fg);font:400 16px/1.4 var(--gl-font);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;user-select:text;-webkit-user-select:text;touch-action:manipulation;cursor:default}
.g-lobby.gl-fixed{position:fixed}
.g-lobby.gl-on{opacity:1}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .g-lobby{${NET_DARK}}}
:root[data-theme="dark"] .g-lobby{${NET_DARK}}
.g-lobby *{box-sizing:border-box}
.g-lobby button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;margin:0;-webkit-tap-highlight-color:transparent}
.g-lobby button:disabled{cursor:default}
.g-lobby svg{display:block;stroke:currentColor;fill:none;stroke-linecap:round;stroke-linejoin:round}
.g-lobby :focus-visible{outline:2px solid var(--gl-accent);outline-offset:2px}
.g-lobby .gl-card{margin:auto;flex:none;width:1040px;background:var(--gl-card);border-radius:32px;box-shadow:var(--gl-shadow);overflow:hidden;display:flex;flex-direction:column;outline:0;transform:translateY(10px) scale(.97);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.g-lobby.gl-on .gl-card{transform:none}
.g-lobby .gl-head{flex:none;background:var(--gl-band);padding:36px 40px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
.g-lobby .gl-head h1{grid-column:2;grid-row:1;margin:0;max-width:520px;font-size:46px;line-height:1.1;font-weight:800;letter-spacing:-.03em;text-align:center;color:var(--gl-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-leave{grid-column:1;grid-row:1;justify-self:start;display:flex;align-items:center;gap:6px;height:40px;padding:0 14px 0 8px;margin-left:-8px;border-radius:12px;color:var(--gl-muted);font-weight:600;font-size:16px;transition:background .15s,color .15s}
.g-lobby .gl-leave:hover{color:var(--gl-fg);background:var(--gl-card)}
.g-lobby .gl-leave svg{width:18px;height:18px;stroke-width:2.2}
.g-lobby .gl-code{grid-column:3;grid-row:1;justify-self:end;min-width:0}
.g-lobby .gl-code small{display:block;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--gl-muted);margin:0 0 8px}
.g-lobby .gl-codebox{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--gl-card);border-radius:16px;padding:12px 12px 12px 20px;min-width:230px;min-height:62px}
.g-lobby .gl-codebox b{font-size:28px;font-weight:800;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:var(--gl-fg);min-width:3.4em;white-space:nowrap}
.g-lobby .gl-codebox b.gl-pend{color:var(--gl-muted);animation:glpulse 1.4s ease-in-out infinite}
.g-lobby .gl-tools{display:flex;align-items:center;gap:8px;flex:none}
.g-lobby .gl-hide{display:flex;align-items:center;gap:8px;height:38px;padding:0 6px;color:var(--gl-accent);font-weight:600;font-size:16px}
.g-lobby .gl-hide svg{width:20px;height:20px;stroke-width:1.8}
.g-lobby .gl-tools button:disabled{opacity:.4}
.g-lobby .gl-body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 1px var(--glc,330px);gap:0 40px;padding:36px 40px 40px}
.g-lobby .gl-rule{background:var(--gl-line)}
.g-lobby .gl-sec{display:flex;flex-direction:column;min-width:0;min-height:0}
.g-lobby .gl-sec-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;min-height:32px;flex:none}
.g-lobby .gl-sec-h h2{margin:0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-.02em;color:var(--gl-fg);white-space:nowrap}
.g-lobby .gl-pill{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--gl-muted);background:var(--gl-chip);border-radius:99px;padding:6px 14px;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none}
.g-lobby .gl-pill.gl-pick{padding-right:10px;cursor:pointer;color:var(--gl-accent);background:var(--gl-accent-soft);transition:transform .12s}
.g-lobby .gl-pill.gl-pick:hover{transform:scale(1.04)}
.g-lobby .gl-pill select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px;border:0;margin:0;-webkit-appearance:none;appearance:none}
.g-lobby .gl-pill svg{width:14px;height:14px;stroke-width:2.4}
.g-lobby .gl-pill.gl-live{color:var(--gl-live);background:var(--gl-live-soft);gap:7px;padding:4px 12px}
.g-lobby .gl-pill.gl-live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gl-live)}
.g-lobby .gl-players{list-style:none;margin:0;padding:0;flex:1 1 auto;min-height:calc(var(--rows,4) * 71px);overflow-y:auto;overscroll-behavior:contain}
.g-lobby.gl-fixh .gl-players{min-height:0}
.g-lobby .gl-pl{display:flex;align-items:center;gap:14px;height:71px;padding:14px 0;border-bottom:1px solid var(--gl-line)}
.g-lobby .gl-new{animation:glin .3s ease both}
.g-lobby .gl-pl.gl-away{opacity:.55}
.g-lobby .gl-av{width:42px;height:42px;border-radius:12px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:15px;display:grid;place-items:center;flex:none}
.g-lobby .gl-av svg{width:22px;height:22px;stroke-width:1.8}
.g-lobby .gl-pl.gl-lead .gl-av{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-pl.gl-seat .gl-av{background:none;border:1.5px dashed var(--gl-line);color:var(--gl-muted)}
.g-lobby .gl-pl.gl-seat.gl-botseat .gl-av{border-style:solid;background:var(--gl-chip)}
.g-lobby .gl-pl.gl-seat .gl-who b{color:var(--gl-muted);font-weight:500}
.g-lobby .gl-who{flex:1;min-width:0}
.g-lobby .gl-who b{display:flex;align-items:center;gap:8px;font-weight:600;font-size:17px;line-height:1.4;color:var(--gl-fg);min-width:0}
.g-lobby .gl-who b i{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-who>span{display:block;color:var(--gl-muted);font-size:14px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-rn{display:flex;align-items:center;gap:6px;min-width:0;max-width:100%;border-radius:8px;font-weight:600}
.g-lobby .gl-rn svg{width:14px;height:14px;stroke-width:2;color:var(--gl-muted);opacity:.7;flex:none}
.g-lobby .gl-rn:hover svg{opacity:1;color:var(--gl-accent)}
.g-lobby .gl-rnin{width:100%;max-width:220px;height:30px;border:1px solid var(--gl-accent);border-radius:8px;padding:0 8px;font:600 16px var(--gl-font);color:var(--gl-fg);background:var(--gl-card);outline:0;margin:0}
.g-lobby .gl-badge{flex:none;font-size:11px;font-weight:700;letter-spacing:.05em;line-height:1.5;background:var(--gl-accent);color:var(--gl-accent-ink);border-radius:99px;padding:1px 9px}
.g-lobby .gl-sq{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;transition:transform .12s}
.g-lobby button.gl-sq:hover:not(:disabled){transform:scale(1.08)}
.g-lobby button.gl-sq:active:not(:disabled){transform:scale(.94)}
.g-lobby .gl-sq svg{width:19px;height:19px;stroke-width:1.8}
.g-lobby .gl-crown{background:var(--gl-accent-soft);color:var(--gl-accent)}
.g-lobby .gl-pl.gl-lead .gl-crown{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-kick{background:var(--gl-danger-soft);color:var(--gl-danger)}
.g-lobby .gl-ph{visibility:hidden}
.g-lobby .gl-bots{flex:none;display:flex;align-items:center;gap:14px;padding-top:16px;min-height:0}
.g-lobby .gl-bots:empty{display:none}
.g-lobby .gl-bots .gl-who b{font-size:16px}
.g-lobby .gl-bots .gl-who b i{white-space:normal;line-height:1.25}
.g-lobby .gl-sw{position:relative;flex:none;width:48px;height:28px;border-radius:99px;background:var(--gl-chip);border:1px solid var(--gl-line);transition:background .2s,border-color .2s}
.g-lobby .gl-sw::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.g-lobby .gl-sw[aria-checked="true"]{background:var(--gl-accent);border-color:var(--gl-accent)}
.g-lobby .gl-sw[aria-checked="true"]::after{transform:translateX(20px)}
.g-lobby .gl-sw:disabled{opacity:.55}
.g-lobby .gl-msgs{flex:1 1 0;min-height:140px;contain:size;display:flex;flex-direction:column;gap:18px;overflow-y:auto;overscroll-behavior:contain;padding-bottom:16px}
.g-lobby .gl-msgs>*{flex:none}
.g-lobby .gl-m b{font-weight:700;color:var(--gl-fg);overflow-wrap:anywhere}
.g-lobby .gl-m time{margin-left:8px;color:var(--gl-muted);font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}
.g-lobby .gl-m p{margin:3px 0 0;color:var(--gl-muted);overflow-wrap:anywhere}
.g-lobby .gl-m.gl-sys p{margin:0;font-size:14px;font-weight:500}
.g-lobby .gl-m.gl-sys time{margin-left:0}
.g-lobby .gl-empty{margin:0;color:var(--gl-muted);font-size:15px}
.g-lobby .gl-send{display:flex;align-items:center;gap:8px;border:1px solid var(--gl-line);border-radius:14px;padding:6px 6px 6px 18px;background:var(--gl-card);flex:none;margin:0}
.g-lobby .gl-send:focus-within,.g-lobby .gl-join:focus-within{border-color:var(--gl-accent)}
.g-lobby .gl-send input,.g-lobby .gl-join input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;color:var(--gl-fg);height:36px;padding:0;margin:0;box-shadow:none;border-radius:0}
.g-lobby .gl-send input::placeholder,.g-lobby .gl-join input::placeholder{color:var(--gl-muted);opacity:1;letter-spacing:0;font-weight:400;text-transform:none}
.g-lobby .gl-send.gl-slow{border-color:var(--gl-danger)}
.g-lobby .gl-go{width:42px;height:42px;border-radius:11px;background:var(--gl-accent);color:var(--gl-accent-ink);display:grid;place-items:center;flex:none;transition:transform .12s}
.g-lobby .gl-go:active{transform:scale(.92)}
.g-lobby .gl-go svg{width:20px;height:20px;stroke-width:2.2}
.g-lobby .gl-foot{flex:none;background:var(--gl-band);padding:44px 40px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:20px}
.g-lobby .gl-join{grid-column:1;justify-self:start;display:flex;align-items:center;gap:6px;width:250px;max-width:100%;border:1px solid var(--gl-line);border-radius:14px;padding:5px 5px 5px 16px;background:var(--gl-card);margin:0;transition:border-color .15s}
.g-lobby .gl-join input{font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.g-lobby .gl-join.gl-bad{border-color:var(--gl-danger)}
.g-lobby .gl-jbtn{flex:none;height:38px;padding:0 14px;border-radius:10px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:15px;transition:transform .12s}
.g-lobby .gl-jbtn:active{transform:scale(.95)}
.g-lobby .gl-act{grid-column:2;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.g-lobby .gl-hint{grid-column:3;justify-self:end;margin:0;max-width:100%;font-size:14px;font-weight:500;color:var(--gl-muted);text-align:right}
.g-lobby .gl-hint.gl-bad{color:var(--gl-danger);font-weight:600}
.g-lobby .gl-play{display:flex;align-items:center;justify-content:center;gap:10px;min-width:330px;height:62px;padding:0 28px;border-radius:16px;background:var(--gl-accent);color:var(--gl-accent-ink);font-size:19px;font-weight:700;box-shadow:0 12px 28px rgba(123,58,237,.38);transition:transform .12s,opacity .2s,box-shadow .2s;white-space:nowrap}
.g-lobby .gl-play:hover:not(:disabled){transform:translateY(-2px)}
.g-lobby .gl-play:active:not(:disabled){transform:scale(.97)}
.g-lobby .gl-play:disabled{opacity:.45;box-shadow:none}
.g-lobby .gl-play.gl-ghost{background:var(--gl-card);color:var(--gl-accent);box-shadow:none}
.g-lobby .gl-play svg{width:20px;height:20px;stroke-width:2}
.g-lobby .gl-wait{display:flex;align-items:center;justify-content:center;gap:12px;min-width:330px;max-width:100%;min-height:62px;padding:10px 28px;border-radius:16px;background:var(--gl-card);color:var(--gl-muted);font-size:17px;font-weight:600;text-align:center}
.g-lobby .gl-wait::before{content:"";flex:none;width:9px;height:9px;border-radius:50%;background:var(--gl-accent);animation:glpulse 1.4s ease-in-out infinite}
.g-lobby .gl-center{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;padding:20px;text-align:center}
.g-lobby .gl-msg{margin:0;font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:var(--gl-fg);text-align:center;overflow-wrap:anywhere}
.g-lobby .gl-txt{margin:12px auto 0;max-width:520px;color:var(--gl-muted);text-align:center;font-size:17px}
.g-lobby.gl-cmp .gl-head{padding:18px 32px}
.g-lobby.gl-cmp .gl-head h1{font-size:36px}
.g-lobby.gl-cmp .gl-code small{margin-bottom:5px}
.g-lobby.gl-cmp .gl-codebox{min-height:52px;padding:7px 8px 7px 18px}
.g-lobby.gl-cmp .gl-codebox b{font-size:24px}
.g-lobby.gl-cmp .gl-body{padding:22px 32px 22px}
.g-lobby.gl-cmp .gl-sec-h{margin-bottom:10px}
.g-lobby.gl-cmp .gl-players{min-height:calc(var(--rows,4) * 58px)}
.g-lobby.gl-cmp.gl-fixh .gl-players{min-height:0}
.g-lobby.gl-cmp .gl-pl{height:58px;padding:8px 0}
.g-lobby.gl-cmp .gl-av{width:38px;height:38px}
.g-lobby.gl-cmp .gl-bots{padding-top:10px}
.g-lobby.gl-cmp .gl-msgs{gap:12px}
.g-lobby.gl-cmp .gl-foot{padding:16px 32px}
.g-lobby.gl-cmp .gl-play,.g-lobby.gl-cmp .gl-wait{height:54px;min-height:54px;min-width:290px}
.g-lobby.gl-mid .gl-play,.g-lobby.gl-mid .gl-wait{min-width:220px}
.g-lobby.gl-mid .gl-head{grid-template-columns:auto minmax(0,1fr) auto}
.g-lobby.gl-mid .gl-head h1{font-size:36px;max-width:100%}
.g-lobby.gl-mid .gl-codebox{min-width:0}
.g-lobby.gl-mid .gl-foot{grid-template-columns:minmax(220px,1fr) auto minmax(0,1fr);gap:16px}
.g-lobby.gl-mid .gl-join{width:220px}
.g-lobby.gl-stack{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.g-lobby.gl-stack .gl-card{margin:0 auto auto;border-radius:24px}
.g-lobby.gl-stack .gl-head{grid-template-columns:minmax(0,1fr);justify-items:center;padding:12px 16px 20px;gap:10px}
.g-lobby.gl-stack .gl-head h1{grid-column:1;grid-row:2;font-size:30px;max-width:100%}
.g-lobby.gl-stack .gl-leave{grid-column:1;grid-row:1}
.g-lobby.gl-stack .gl-code{grid-column:1;grid-row:3;justify-self:center;text-align:center;max-width:100%}
.g-lobby.gl-stack .gl-codebox{text-align:left;min-width:0;min-height:54px;padding:8px 8px 8px 16px;gap:10px}
.g-lobby.gl-stack .gl-codebox b{font-size:24px}
.g-lobby.gl-stack .gl-body{display:contents}
.g-lobby.gl-stack .gl-body>.gl-rule{display:none}
.g-lobby.gl-stack .gl-plsec{order:1;padding:20px 16px 18px}
.g-lobby.gl-stack .gl-sec-h{margin-bottom:8px}
.g-lobby.gl-stack .gl-players{min-height:0;overflow:visible;flex:none}
.g-lobby.gl-stack .gl-pl{height:60px;padding:9px 0;gap:12px}
.g-lobby.gl-stack .gl-av{width:38px;height:38px}
.g-lobby.gl-stack .gl-foot{order:2;display:flex;flex-direction:column;align-items:stretch;gap:12px;padding:18px 16px}
.g-lobby.gl-stack .gl-act{order:-1;align-items:stretch}
.g-lobby.gl-stack .gl-play,.g-lobby.gl-stack .gl-wait{min-width:0;width:100%;height:54px;min-height:54px}
.g-lobby.gl-stack .gl-hint{order:-1;text-align:center;justify-self:auto}
.g-lobby.gl-stack .gl-hint:empty{display:none}
.g-lobby.gl-stack .gl-join{width:100%}
.g-lobby.gl-stack .gl-chat{order:3;height:320px;padding:20px 16px 16px}
.g-lobby.gl-stack .gl-msgs{overscroll-behavior:auto}
.g-lobby.gl-stack .gl-center{order:1;min-height:200px}
.g-lobby.gl-stack .gl-msg{font-size:24px}
@keyframes glspin{to{transform:rotate(360deg)}}
@keyframes glpulse{50%{opacity:.3;transform:scale(.75)}}
@keyframes glin{from{opacity:0;transform:translateY(6px)}}
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
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 13v1M15 13v1M9.5 17h5"/><circle cx="12" cy="3.5" r=".5"/></svg>'
};
const netEsc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => '&#' + c.charCodeAt(0) + ';');
const netName = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`\\\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
const netMsg = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
const netUid = () => Array.from({ length: 10 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('').toLowerCase();
const netLs = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; };
const netProfile = () => { try { const p = JSON.parse(netLs('gameplay:profile') || 'null'); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; } catch (e) { return {}; } };
const netLoadName = () => { const p = netProfile(); return netName(p.username) || netName(p.displayName) || netName(netLs('gameplay:netname')); };
const netSaveName = n => { n = netName(n); if (n) netLs('gameplay:netname', n); };
const netGuest = () => { let n = netName(netLs('gameplay:netguest')); if (!n) { n = 'Player ' + (1000 + Math.floor(Math.random() * 9000)); netLs('gameplay:netguest', n); } return n; };
const netT = s => { try { return window.gpI18n && typeof gpI18n.t === 'function' ? gpI18n.t(s) || s : s; } catch (e) { return s; } };
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
  if (t === 'peer-unavailable') return code ? netT('Party {code} not found. Check the code and try again.').replace('{code}', code) : netT('Party not found. Check the code and try again.');
  if (t === 'ice') return netT('Could not connect to the other player. A school, office or mobile network may be blocking game connections. Try again, or switch networks (for example Wi-Fi instead of mobile data).');
  if (t === 'timeout') return netT('The other player did not answer. Try again.');
  if (t === 'load') return netT('Could not load the online player. Check your internet connection and try again.');
  if (NET_SOFT.indexOf(t) >= 0) return netT('Can’t reach the online server right now (it may be busy or blocked on this network). Try again in a moment.');
  return netT(netErr(e));
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
  const tx = (c, m, s, b) => {
    if (!c || !c.open) return false;
    const dc = c.dataChannel;
    try {
      if (!dc || dc.readyState !== 'open' || c.serialization !== 'json') { c.send(m); return true; }
      if (s == null) s = JSON.stringify(m);
      if (s.length < 16000) { if (!b) b = netTe.encode(s); if (b.byteLength < 16000) { dc.send(b); return true; } }
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
    const wake = () => { if (p.destroyed) { document.removeEventListener('visibilitychange', wake); removeEventListener('online', wake); return; } if (p.disconnected) { n = 0; next = 0; try { p.reconnect(); } catch (e) {} } };
    document.addEventListener('visibilitychange', wake);
    addEventListener('online', wake);
    const t = setInterval(() => {
      if (p.destroyed) return clearInterval(t);
      if (!p.disconnected) { n = 0; return; }
      const tm = now();
      if (tm < next) return;
      next = tm + Math.min(8000, 1000 * Math.pow(2, n++));
      try { p.reconnect(); } catch (e) {}
    }, 1000);
  };
  const newPeer = async (id, my, relay) => {
    let Peer;
    try { Peer = await loadPeer(); } catch (e) { try { Peer = await loadPeer(); } catch (x) { throw { type: 'load' }; } }
    const config = { iceServers: await netIce(), sdpSemantics: 'unified-plan', iceCandidatePoolSize: 4 };
    if (relay) config.iceTransportPolicy = 'relay';
    let last = null;
    for (let i = 0; i < 3; i++) {
      if (i) {
        if (note) note(netT('Server busy, trying again ({n}/3)…').replace('{n}', i + 1));
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
  const rm = { me: null, key: null, name: '', hostId: null, list: [], guests: new Map(), seq: 0, min: 2, max: 4, sizes: [2, 3, 4], state: 'lobby', conn: null, lastRx: 0, hb: 0, ui: null, busy: false, reconn: false, pendingGo: null, inGame: false, leader: null, chat: [], rate: new Map(), compat: false, compatO: null, tick: 0, lastTick: 0, bots: false, botsOk: false, renamed: false };
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
  const cleanMsg = m => m && typeof m === 'object' ? { i: typeof m.i === 'string' ? m.i.slice(0, 16) : '', n: netName(m.n), x: netMsg(m.x), k: m.s && typeof m.k === 'string' ? netMsg(m.k).slice(0, 60) : '', a: netName(m.a), t: +m.t || Date.now(), s: m.s ? 1 : 0 } : null;
  const cleanChat = l => Array.isArray(l) ? l.slice(-100).map(cleanMsg).filter(m => m && m.x) : [];
  const txAll = m => {
    if (!rm.guests.size) return;
    const s = JSON.stringify(m), b = s.length < 16000 ? netTe.encode(s) : null;
    rm.guests.forEach(gs => tx(gs.conn, m, s, b));
  };
  const pushList = () => {
    rm.list = hostPlayers();
    const m = { __pl: rm.list, busy: rm.state === 'game', min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk };
    txAll(m);
    if (rm.ui) rm.ui.update();
  };
  const chatAdd = m => {
    rm.chat.push(m);
    if (rm.chat.length > 100) rm.chat.splice(0, rm.chat.length - 100);
    txAll({ __cm: m });
    if (rm.ui) rm.ui.chat();
  };
  const sysLine = (k, a = '') => chatAdd({ i: '', n: '', x: netMsg(k.replace('{name}', a)), k, a, t: Date.now(), s: 1 });
  const chatFrom = (id, nm, x) => {
    x = netMsg(x);
    if (!x) return;
    const t = Date.now(), r = (rm.rate.get(id) || []).filter(v => t - v < 5000);
    rm.rate.set(id, r);
    if (r.length >= 5) return;
    r.push(t);
    chatAdd({ i: id, n: nm, x, t, s: 0 });
  };
  const welOf = gs => ({ __wel: { id: gs.id, host: rm.me, code: net.code, busy: rm.state === 'game', inGame: gs.inGame, min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk, chat: rm.chat } });
  const removeGuest = (id, why) => {
    const gs = rm.guests.get(id);
    if (!gs) return;
    rm.guests.delete(id); clearTimeout(gs.gt); rm.rate.delete(id);
    const c = gs.conn; gs.conn = null;
    if (c) { if (why === 'kick') tx(c, { __kick: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, why === 'kick' ? 400 : 0); }
    emit('leave', pubOf(gs));
    if (rm.compat && rm.state === 'game' && gs.inGame) emit('close');
    sysLine(why === 'kick' ? '{name} was removed from the party' : '{name} left the party', gs.name);
    if (rm.leader === id) { rm.leader = rm.me; sysLine('{name} is now the host', rm.name); }
    pushList();
  };
  const setLeader = id => {
    const p = hostPlayers().find(q => q.id === id && !q.away);
    if (!p || leaderId() === id) return;
    rm.leader = id;
    sysLine('{name} is now the host', p.name);
    if (id === rm.me && !rm.ui) toast('You are now the host');
    pushList();
  };
  const setSize = n => {
    n = Math.round(+n);
    if (rm.sizes.indexOf(n) < 0 || n < hostPlayers().length || n === rm.max || rm.state === 'game') return;
    rm.max = n;
    pushList();
  };
  const setBots = v => {
    v = !!v;
    if (!rm.botsOk || rm.state === 'game' || rm.bots === v) return;
    rm.bots = v;
    sysLine(v ? 'Bots will fill the empty seats' : 'Bots are off');
    pushList();
  };
  const ctl = (a, id, n) => {
    if (a === 'kick') { if (typeof id === 'string' && rm.guests.has(id)) removeGuest(id, 'kick'); }
    else if (a === 'lead') { if (typeof id === 'string') setLeader(id); }
    else if (a === 'size') setSize(n);
    else if (a === 'bots') setBots(n);
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
        sysLine('{name} joined the party', gs.name);
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
      rm.bots = !!d.bots; rm.botsOk = !!d.canBots;
      const L = typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId;
      if (L !== rm.leader) { const was = rm.leader; rm.leader = L; if (was && L === rm.me && !rm.ui) toast('You are now the host'); }
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
      const r = { role: 'guest', id: rm.me, players, size: Math.round(+d.size) || players.length, leader: typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId, bots: !!d.bots };
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
    rm.bots = !!w.bots; rm.botsOk = !!w.canBots;
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
    const TRIES = 4;
    let r = null;
    rm.me = netUid(); rm.key = netUid() + netUid();
    for (let a = 0; a < TRIES && !r; a++) {
      if (a) {
        if (note) note(netT('Connecting again ({n}/{m})…').replace('{n}', a + 1).replace('{m}', TRIES));
        await sleepMs(800 + 700 * a);
        if (my !== gen) return false;
      }
      let p;
      try { p = await newPeer(undefined, my, a === TRIES - 1); }
      catch (e) { if (my !== gen || (e && e.type === 'cancel')) return false; if (a === TRIES - 1) { shut(false); throw e; } netTrack('party_retry', { game: g.id, why: ('peer-' + String(e && e.type || 'unknown')).slice(0, 24), n: a + 1 }); continue; }
      if (my !== gen) { p.destroy(); return false; }
      peer = p;
      rm.state = 'lobby'; rm.inGame = false; rm.list = []; rm.leader = null; rm.chat = []; net.closeReason = null;
      try { r = await guestConnect(code, my); }
      catch (e) {
        if (my !== gen) return false;
        const t = e && e.type;
        try { p.destroy(); } catch (x) {}
        if (peer === p) peer = null;
        if (t === 'room-full' || t === 'cancel' || a === TRIES - 1) { shut(false); throw e; }
        netTrack('party_retry', { game: g.id, why: String(t || 'unknown').slice(0, 24), n: a + 1 });
      }
    }
    if (!r) { shut(false); throw { type: 'network' }; }
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
    if (mode !== 'room') { rm.name = (rm.renamed && rm.name) || netLoadName() || netName(o.name) || netGuest(); rm.botsOk = !!o.bots && !compat; rm.bots = false; }
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
      const box = () => { const r = document.querySelector('.g-root.gm-' + g.id); return r && r.isConnected ? r : null; };
      const place = () => { const r = box(), p = r || document.fullscreenElement || document.body; el.classList.toggle('gl-fixed', !r); if (el.parentNode !== p) p.append(el); return p; };
      place(); void el.offsetWidth; el.classList.add('gl-on');
      let note0 = '', done = false, screen = '', phase = '', err = '', again = null, op = 0, pick = 0, hidden = netLs('gameplay:hidecode') === '1', sent = [], cache = {}, playT = 0, slowT = 0, editing = false, lastFit = '', rows = 0, seen = new Set(), chatN = 0, flashT = 0, flashM = '';
      const saved = Math.round(+netLs('gameplay:partysize:' + g.id));
      pick = cfg.sizes.indexOf(saved) >= 0 ? saved : cfg.def;
      const fit = () => {
        const c = !done && el.querySelector('.gl-card');
        if (!c) return;
        const p = place(), vp = el.classList.contains('gl-fixed');
        const W = vp ? innerWidth : p.clientWidth, H = vp ? innerHeight : p.clientHeight;
        if (!W || !H) return;
        const k = vp ? 1 : (p.getBoundingClientRect().width / W) || 1, Wv = W * k, Hv = H * k;
        lastFit = [W, H, k.toFixed(3), screen, rows].join();
        const stack = Wv < 600 || Hv < 340;
        el.classList.toggle('gl-stack', stack);
        el.classList.remove('gl-cmp', 'gl-fixh', 'gl-mid');
        c.style.zoom = ''; c.style.width = ''; c.style.height = '';
        if (stack) {
          const pv = 10, sv = Math.min(1, (Wv - pv * 2) / 340), s = sv / k;
          el.style.padding = (pv / k) + 'px';
          c.style.width = ((W - pv * 2 / k) / s) + 'px'; c.style.zoom = String(s);
          return;
        }
        const pv = 16, av = Wv - pv * 2, bw = Math.min(1040, Math.max(760, av)), aw = av / bw, ah = Hv - pv * 2;
        el.style.padding = (pv / k) + 'px';
        el.classList.toggle('gl-mid', bw < 900);
        el.style.setProperty('--glc', (bw >= 960 ? 330 : Math.round(.36 * (bw - 80))) + 'px');
        c.style.width = bw + 'px';
        let h = c.offsetHeight;
        if (Math.min(1, aw) * h > ah * 1.02 || ah / h < .9) { el.classList.add('gl-cmp'); h = c.offsetHeight; }
        const sv = Math.min(1, aw, Math.max(.62, ah / h));
        if (h * sv > ah + 1) { el.classList.add('gl-fixh'); c.style.height = (ah / sv) + 'px'; }
        c.style.zoom = String(sv / k);
      };
      const tick = setInterval(() => {
        if (done || document.hidden) return;
        const p = el.parentNode;
        if (!p || !el.isConnected) return place(), fit();
        const vp = el.classList.contains('gl-fixed'), W = vp ? innerWidth : p.clientWidth, H = vp ? innerHeight : p.clientHeight, k = vp ? 1 : (p.getBoundingClientRect().width / (W || 1)) || 1;
        if ([W, H, k.toFixed(3), screen, rows].join() !== lastFit || (!vp && !box())) fit();
      }, 400);
      const onFs = () => { setTimeout(fit, 60); setTimeout(fit, 450); };
      const guard = e => { if (!el.contains(e.target)) e.stopPropagation(); };
      window.addEventListener('resize', onFs);
      window.addEventListener('keydown', guard, true);
      window.addEventListener('keyup', guard, true);
      document.addEventListener('fullscreenchange', onFs);
      const ui = {};
      const finish = (r, keep) => {
        if (done) return;
        done = true; note = null; clearTimeout(playT); clearTimeout(slowT); clearTimeout(flashT); clearInterval(tick);
        window.removeEventListener('resize', onFs);
        window.removeEventListener('keydown', guard, true);
        window.removeEventListener('keyup', guard, true);
        document.removeEventListener('fullscreenchange', onFs);
        if (rm.ui === ui) rm.ui = null;
        el.classList.remove('gl-on'); el.style.pointerEvents = 'none';
        setTimeout(() => el.remove(), 300);
        if (r === null && !keep) shut(true);
        if (r && rm.compat) emit('open', r.role);
        resolve(r);
      };
      const T = netT;
      const ready = () => phase === 'ready' && mode === 'room';
      const shareLbl = T(navigator.share ? 'Share invite link' : 'Copy invite link');
      const eye = () => `<svg viewBox="0 0 24 24" aria-hidden="true">${hidden ? NET_I.eyeOff : NET_I.eye}</svg><span>${T(hidden ? 'Show' : 'Hide')}</span>`;
      const codeHtml = () => {
        const c = ready() ? net.code : phase === 'joining' || phase === 'error' && again && again.code ? (again && again.code) || '' : '';
        const on = ready();
        return `<small>${T('Party code')}</small><div class="gl-codebox"><b class="gl-codetxt${on ? '' : ' gl-pend'}">${on && hidden ? '••••' : c ? netEsc(c) : '····'}</b><span class="gl-tools"><button class="gl-hide" type="button" data-n="hide" aria-pressed="${hidden}" aria-label="${T(hidden ? 'Show party code' : 'Hide party code')}"${on ? '' : ' disabled'}>${eye()}</button><button class="gl-sq gl-crown" type="button" data-n="share" title="${shareLbl}" aria-label="${shareLbl}"${on ? '' : ' disabled'}>${NET_I.link}</button></span></div>`;
      };
      const head = (lbl, code) => `<header class="gl-head"><button class="gl-leave" type="button" data-n="back">${NET_I.back}<span>${T(lbl)}</span></button><h1>${netEsc(g.title || o.title || 'Online party')}</h1>${code ? '<div class="gl-code"></div>' : ''}</header>`;
      const joinForm = () => `<form class="gl-join" autocomplete="off"><input class="gl-code-in" maxlength="4" placeholder="${T('Join with a code')}" aria-label="${T('Join with a code')}" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="go"><button class="gl-jbtn" type="submit">${T('Join')}</button></form>`;
      const row = (p, lead, amLead) => {
        const isL = p.id === lead, me = p.id === rm.me, nm = netEsc(p.name);
        let sub = T(isL ? 'Party leader' : 'Member') + (me ? ' · ' + T('You') : '');
        if (p.away) sub += ' · ' + T('Reconnecting…');
        else if (rm.busy && !p.inGame) sub += ' · ' + T('Waiting');
        else if (rm.busy) sub += ' · ' + T('In game');
        let b = '';
        if (amLead && ready()) {
          b = isL ? `<span class="gl-sq gl-crown" title="${T('Party leader')}">${NET_I.crown}</span>` : `<button class="gl-sq gl-crown" type="button" data-n="lead" data-id="${netEsc(p.id)}" title="${T('Make host')}" aria-label="${T('Make host')}: ${nm}"${p.away ? ' disabled' : ''}>${NET_I.crown}</button>`;
          b += me || p.host ? '<span class="gl-sq gl-ph"></span>' : `<button class="gl-sq gl-kick" type="button" data-n="kick" data-id="${netEsc(p.id)}" title="${T('Remove')}" aria-label="${T('Remove')}: ${nm}">${NET_I.x}</button>`;
        } else if (isL) b = `<span class="gl-sq gl-crown" title="${T('Party leader')}">${NET_I.crown}</span>`;
        const name = me && editing ? `<input class="gl-rnin" maxlength="16" value="${nm}" aria-label="${T('Your name')}" autocomplete="off" spellcheck="false" enterkeyhint="done">` : me ? `<button class="gl-rn" type="button" data-n="rename" title="${T('Change your name')}"><i>${nm}</i>${NET_I.pen}</button>` : `<i>${nm}</i>`;
        const nw = !seen.has(p.id);
        return `<li class="gl-pl${nw ? ' gl-new' : ''}${isL ? ' gl-lead' : ''}${p.away ? ' gl-away' : ''}"><span class="gl-av" aria-hidden="true">${netEsc(netInit(p.name))}</span><div class="gl-who"><b>${name}${isL ? '<span class="gl-badge">HOST</span>' : ''}</b><span>${sub}</span></div>${b}</li>`;
      };
      const seat = () => `<li class="gl-pl gl-seat${rm.bots ? ' gl-botseat' : ''}"><span class="gl-av" aria-hidden="true">${rm.bots ? NET_I.bot : NET_I.plus}</span><div class="gl-who"><b><i>${T(rm.bots ? 'Bot' : 'Empty seat')}</i></b><span>${T(rm.bots ? 'A bot plays this seat' : 'Waiting for a player…')}</span></div></li>`;
      const put = (k, sel, html) => {
        if (cache[k] === html) return false;
        const x = el.querySelector(sel);
        if (!x) return false;
        cache[k] = html;
        const a = document.activeElement, keepIn = a && a.classList && a.classList.contains('gl-rnin') && x.contains(a) ? [a.value, a.selectionStart, a.selectionEnd] : null;
        x.innerHTML = html;
        if (keepIn) { const n = x.querySelector('.gl-rnin'); if (n) { n.value = keepIn[0]; try { n.focus({ preventScroll: true }); n.setSelectionRange(keepIn[1], keepIn[2]); } catch (e) {} } }
        return true;
      };
      const show = s => {
        screen = s; note = null; cache = {}; editing = false;
        if (s === 'lobby') {
          el.innerHTML = `<div class="gl-card gl-lob" tabindex="-1">${head('Leave', true)}<div class="gl-body"><section class="gl-sec gl-plsec" aria-label="${T('Players')}"><div class="gl-sec-h"><h2>${T('Players')}</h2><span class="gl-cnt"></span></div><ul class="gl-players"></ul><div class="gl-bots"></div></section><div class="gl-rule"></div><section class="gl-sec gl-chat" aria-label="${T('Live chat')}"><div class="gl-sec-h"><h2>${T('Live chat')}</h2><span class="gl-pill gl-live">${T('Live')}</span></div><div class="gl-msgs" role="log" aria-live="polite"></div><form class="gl-send" autocomplete="off"><input class="gl-chat-in" maxlength="200" placeholder="${T('Type a message...')}" autocomplete="off" enterkeyhint="send" aria-label="${T('Message')}"><button class="gl-go" type="submit" aria-label="${T('Send')}">${NET_I.send}</button></form></section></div><footer class="gl-foot">${joinForm()}<div class="gl-act"></div><p class="gl-hint" role="status"></p></footer></div>`;
          ui.update(); ui.chat(true);
        } else if (s === 'ended') {
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('Close')}<div class="gl-body"><div class="gl-center"><p class="gl-msg">${netEsc(ui.endMsg[0])}</p><p class="gl-txt">${netEsc(ui.endMsg[1])}</p></div></div><footer class="gl-foot">${joinForm()}<div class="gl-act"><button class="gl-play" type="button" data-n="new">${NET_I.plus}${T('New party')}</button></div><p class="gl-hint"></p></footer></div>`;
        }
        const c = el.querySelector('.gl-card');
        fit();
        if (!el.contains(document.activeElement)) { try { c.focus({ preventScroll: true }); } catch (e) {} }
      };
      ui.finish = finish;
      ui.update = () => {
        if (done || screen !== 'lobby') return;
        const jn = phase === 'joining' || (phase === 'error' && !!(again && again.code));
        const on = ready(), lead = on ? leaderId() : rm.me, amLead = on ? lead === rm.me : !jn;
        const L = on ? rm.list : jn ? [] : [{ id: rm.me, name: rm.name, host: true, leader: true }];
        const size = on ? rm.max : pick, n = L.filter(p => !p.away).length;
        put('code', '.gl-code', codeHtml());
        let pl = L.map(p => row(p, lead, amLead)).join('');
        if (jn) pl = `<li class="gl-pl gl-seat"><span class="gl-av" aria-hidden="true">${phase === 'error' ? NET_I.x : NET_I.plus}</span><div class="gl-who"><b><i>${netEsc(phase === 'error' ? T('Party {code}').replace('{code}', again.code) : T('Joining party…'))}</i></b><span>${netEsc(T(phase === 'error' ? 'Could not join this party' : 'Connecting to the party…'))}</span></div></li>`;
        else for (let i = L.length; i < size; i++) pl += seat();
        if (put('pl', '.gl-players', pl)) L.forEach(p => seen.add(p.id));
        const nr = Math.max(size, L.length, 1);
        if (nr !== rows) { rows = nr; el.style.setProperty('--rows', String(nr)); fit(); }
        const jt = netEsc(T('{n} / {m} joined').replace('{n}', L.length).replace('{m}', size));
        const opts = amLead && !rm.busy && !rm.reconn && !jn ? (on ? rm.sizes : cfg.sizes).filter(s => s >= L.length) : [];
        put('cnt', '.gl-cnt', opts.length > 1 ? `<label class="gl-pill gl-pick">${jt}${NET_I.down}<select data-n="sizesel" aria-label="${T('Party size')}">${opts.map(s => `<option value="${s}"${s === size ? ' selected' : ''}>${T('{n} players').replace('{n}', s)}</option>`).join('')}</select></label>` : `<span class="gl-pill">${jt}</span>`);
        const botsOk = on ? rm.botsOk : !jn && rm.botsOk;
        put('bots', '.gl-bots', botsOk ? `<span class="gl-av" aria-hidden="true">${NET_I.bot}</span><div class="gl-who"><b><i>${T('Fill empty seats with bots')}</i></b><span>${T(!amLead ? (rm.bots ? 'On · set by the host' : 'Off · set by the host') : rm.bots ? 'Bots play the empty seats' : 'Only real players play')}</span></div><button class="gl-sw" type="button" role="switch" data-n="bots" aria-checked="${rm.bots}" aria-label="${T('Fill empty seats with bots')}"${amLead && !rm.busy && !rm.reconn ? '' : ' disabled'}></button>` : '');
        const need = rm.bots ? 1 : on ? rm.min : cfg.min;
        let f, hint = '', bad = false;
        if (phase === 'creating') { f = `<div class="gl-wait" role="status">${T('Creating party…')}</div>`; hint = note0 || ''; }
        else if (phase === 'joining') { f = `<div class="gl-wait" role="status">${netEsc(T('Joining party {code}…').replace('{code}', (again && again.code) || ''))}</div>`; hint = note0 || ''; }
        else if (phase === 'error') { f = `<button class="gl-play" type="button" data-n="retry">${T('Try again')}</button>${again && again.code ? `<button class="gl-play gl-ghost" type="button" data-n="new">${T('Create my own party')}</button>` : ''}`; hint = err; bad = true; }
        else if (amLead) {
          const blocked = rm.busy && net.role !== 'host';
          hint = rm.reconn ? T('Connection lost. Reconnecting…') : blocked ? T('A game is in progress. You can start when it ends.') : n < need ? T(need - n > 1 ? 'Waiting for {n} more players…' : 'Waiting for 1 more player…').replace('{n}', need - n) : '';
          f = `<button class="gl-play" type="button" data-n="play"${n < need || blocked || rm.reconn ? ' disabled' : ''}>${NET_I.play}${T('Play')}</button>`;
        } else f = `<div class="gl-wait" role="status">${T(rm.reconn ? 'Connection lost. Reconnecting…' : rm.busy ? 'A game is in progress. You will join the next one.' : 'Waiting for the host…')}</div>`;
        put('ft', '.gl-act', f);
        const h = el.querySelector('.gl-hint');
        if (flashM) { hint = flashM; bad = false; }
        if (h && h.textContent !== hint) h.textContent = hint;
        if (h) h.classList.toggle('gl-bad', bad);
      };
      ui.chat = force => {
        if (done || screen !== 'lobby') return;
        const bx = el.querySelector('.gl-msgs');
        if (!bx) return;
        const stick = force === true || bx.scrollTop + bx.clientHeight >= bx.scrollHeight - 40;
        const n0 = force === true ? rm.chat.length : chatN;
        chatN = rm.chat.length;
        bx.innerHTML = rm.chat.length ? rm.chat.map((m, i) => m.s ? `<div class="gl-m gl-sys${i >= n0 ? ' gl-new' : ''}"><p>${netEsc(m.k ? T(m.k).replace('{name}', m.a) : m.x)} · <time>${netHm(m.t)}</time></p></div>` : `<div class="gl-m${m.i === rm.me ? ' gl-me' : ''}${i >= n0 ? ' gl-new' : ''}"><b>${netEsc(m.n)}</b><time>${netHm(m.t)}</time><p>${netEsc(m.x)}</p></div>`).join('') : `<p class="gl-empty">${T('No messages yet. Say hi!')}</p>`;
        if (stick) bx.scrollTop = bx.scrollHeight;
      };
      ui.flash = m => { flashM = m; clearTimeout(flashT); flashT = setTimeout(() => { flashM = ''; ui.update(); }, 2600); ui.update(); };
      ui.endMsg = ['', ''];
      ui.ended = reason => {
        if (done) return;
        const k = reason === 'kicked', h = reason === 'host-left';
        ui.endMsg = [T(k ? 'You were removed from the party' : h ? 'The party was closed' : 'Lost connection to the party'), T(k ? 'The host removed you from this party. Start a new party or join another one with a code.' : h ? 'The host left, so the party ended. Start a new party or join another one with a code.' : 'Check your internet connection, then join the party again.')];
        show('ended');
      };
      rm.ui = ui;
      const canRetry = e => { const t = e && e.type; return t === 'ice' || t === 'timeout' || t === 'peer-unavailable' || NET_SOFT.indexOf(t) >= 0; };
      const fail = (m, fn) => { phase = 'error'; err = m; again = fn; if (screen !== 'lobby') show('lobby'); else { cache = {}; ui.update(); } };
      const hosting = async () => {
        const my = ++op;
        phase = 'creating'; err = ''; again = null; note0 = '';
        note = t => { if (!done && my === op) { note0 = t; ui.update(); } };
        show('lobby');
        try {
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes;
          const code = await roomHost();
          if (done || my !== op || !code) return;
          note = null; note0 = '';
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes; phase = 'ready'; cache = {};
          pushList();
          netTrack('party_create', { game: g.id, size: pick });
        } catch (e) { if (!done && my === op && !(e && e.type === 'cancel')) { note = null; fail(netWhy(e), hosting); } }
      };
      const joining = async code => {
        code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^[A-Z0-9]{4}$/.test(code)) { const f = el.querySelector('.gl-join'), i = f && f.querySelector('input'); if (f) { f.classList.add('gl-bad'); try { i.focus({ preventScroll: true }); } catch (e) {} } return; }
        if (ready() && code === net.code) { const i = el.querySelector('.gl-code-in'); if (i) i.value = ''; return; }
        const my = ++op, fn = () => joining(code);
        fn.code = code;
        phase = 'joining'; err = ''; again = fn; note0 = '';
        note = t => { if (!done && my === op) { note0 = t; ui.update(); } };
        rm.botsOk = false; rm.bots = false;
        if (screen !== 'lobby') show('lobby'); else { cache = {}; ui.update(); }
        try {
          const ok = await roomJoin(code);
          if (done || my !== op || !ok) return;
          note = null; note0 = ''; phase = 'ready'; cache = {};
          el.querySelectorAll('.gl-code-in').forEach(i => { i.value = ''; });
          netTrack('party_join', { game: g.id });
          ui.update(); ui.chat(true); fit();
        } catch (e) {
          const t = e && e.type;
          if (done || my !== op || t === 'cancel') return;
          note = null;
          fail(t === 'room-full' ? T('Party {code} is full.').replace('{code}', code) : netWhy(e, code), canRetry(e) ? fn : Object.assign(() => joining(code), { code }));
        }
      };
      const fresh = () => { rm.botsOk = !!o.bots && !rm.compat; rm.bots = false; rows = 0; hosting(); };
      const play = () => {
        if (done || screen !== 'lobby' || net.role !== 'host' || mode !== 'room' || rm.state === 'game') return;
        const players = hostPlayers().filter(p => !p.away);
        if (players.length < (rm.bots ? 1 : rm.min)) return;
        rm.state = 'game';
        const ids = new Set(players.map(p => p.id));
        rm.guests.forEach(gs => { gs.inGame = ids.has(gs.id); });
        const lead = leaderId(), bots = !!(rm.botsOk && rm.bots);
        const out = players.map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.id === lead }));
        rm.guests.forEach(gs => { if (gs.inGame) tx(gs.conn, { __go: out, size: rm.max, leader: lead, bots }); });
        pushList();
        netTrack('party_play', { game: g.id, players: out.length, size: rm.max, bots });
        finish({ role: 'host', id: rm.me, players: out, size: rm.max, leader: lead, bots });
      };
      ui.play = play;
      const toggleHide = () => {
        hidden = !hidden; netLs('gameplay:hidecode', hidden ? '1' : null);
        cache.code = ''; ui.update();
      };
      const slow = i => {
        const f = i.closest('.gl-send');
        f.classList.add('gl-slow'); i.placeholder = T('Slow down a little…');
        clearTimeout(slowT); slowT = setTimeout(() => { f.classList.remove('gl-slow'); i.placeholder = T('Type a message...'); }, 2500);
      };
      const sendChat = () => {
        const i = el.querySelector('.gl-chat-in');
        if (!i) return;
        const v = netMsg(i.value);
        if (!v || !ready() || (net.role === 'guest' && !rm.conn)) return;
        const t = Date.now();
        sent = sent.filter(x => t - x < 5000);
        if (sent.length >= 5) return slow(i);
        sent.push(t); i.value = '';
        if (net.role === 'host') chatFrom(rm.me, rm.name, v); else tx(rm.conn, { __chat: v });
      };
      const rename = v => {
        editing = false;
        v = netName(v);
        if (v && v !== rm.name) {
          netSaveName(v); rm.renamed = true;
          if (ready() && net.role === 'host') { rm.name = uniqueName(v, rm.me); pushList(); }
          else { rm.name = v; if (ready()) tx(rm.conn, { __name: v }); }
        }
        cache.pl = ''; ui.update();
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-n]');
        if (!b || done || b.disabled || b.tagName === 'SELECT') return;
        const n = b.dataset.n;
        sfx('tap');
        if (n === 'back') finish(null);
        else if (n === 'new') { op++; shut(true); fresh(); }
        else if (n === 'retry' && again) again();
        else if (n === 'share') shareLink();
        else if (n === 'hide') toggleHide();
        else if (n === 'rename') { editing = true; cache.pl = ''; ui.update(); const i = el.querySelector('.gl-rnin'); if (i) { try { i.focus({ preventScroll: true }); i.select(); } catch (x) {} } }
        else if (n === 'kick' || n === 'lead') leadAct(n, b.dataset.id);
        else if (n === 'bots') { if (ready()) leadAct('bots', null, !rm.bots); else { rm.bots = !rm.bots; ui.update(); } }
        else if (n === 'play') {
          if (net.role === 'host') return leadAct('play');
          leadAct('play'); b.disabled = true; cache.ft = '';
          clearTimeout(playT); playT = setTimeout(() => ui.update(), 3000);
        }
      });
      el.addEventListener('submit', e => {
        e.preventDefault();
        if (e.target.matches('.gl-send')) sendChat();
        else if (e.target.matches('.gl-join')) joining(e.target.querySelector('input').value);
      });
      ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'wheel', 'contextmenu'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
      el.addEventListener('keydown', e => {
        if (!e.target.matches('.gl-rnin')) return;
        if (e.key === 'Enter') { e.preventDefault(); rename(e.target.value); }
        else if (e.key === 'Escape') { e.preventDefault(); editing = false; cache.pl = ''; ui.update(); }
      });
      el.addEventListener('focusout', e => { if (editing && e.target.matches('.gl-rnin')) { const v = e.target.value; setTimeout(() => { if (editing && !done) rename(v); }, 0); } });
      el.addEventListener('input', e => {
        if (e.target.matches('.gl-code-in')) { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); e.target.closest('.gl-join').classList.remove('gl-bad'); }
      });
      el.addEventListener('change', e => {
        if (!e.target.matches('select[data-n=sizesel]')) return;
        const v = Math.round(+e.target.value);
        netLs('gameplay:partysize:' + g.id, String(v));
        if (ready()) leadAct('size', null, v); else if (cfg.sizes.indexOf(v) >= 0) { pick = v; rm.max = v; ui.update(); }
      });
      add(() => finish(null, true));
      if (mode === 'room' && net.role === 'host' && peer && !peer.destroyed) {
        rm.min = cfg.min; rm.sizes = cfg.sizes; rm.state = 'lobby'; phase = 'ready';
        if (cfg.sizes.indexOf(rm.max) < 0) rm.max = cfg.sizes.find(s => s >= rm.guests.size + 1) || cfg.sizes[cfg.sizes.length - 1];
        rm.guests.forEach(gs => { gs.inGame = false; tx(gs.conn, { __lob: 1 }); });
        pushList();
        show('lobby');
      } else if (mode === 'room' && net.role === 'guest' && (rm.conn || rm.reconn)) { phase = 'ready'; show('lobby'); }
      else if (net.invite && !invite.host) joining(net.invite);
      else { if (invite && invite.host && invite.id === g.id) invite = null; hosting(); }
      loadPeer().catch(() => {}); netIce();
    });
  };
  const net = {
    role: null, code: null, rtt: 0, closeReason: null,
    get id() { return mode === 'room' ? rm.me : null; },
    get players() { return mode === 'room' ? rm.list.map(p => Object.assign({}, p)) : []; },
    get leader() { return mode === 'room' ? leaderId() : null; },
    get size() { return mode === 'room' ? rm.max : mode === 'pair' ? 2 : null; },
    get bots() { return mode === 'room' && rm.botsOk && rm.bots; },
    get connected() {
      if (mode === 'room') {
        if (net.role !== 'host') return !!(rm.conn && rm.conn.open);
        if (rm.compat) return [...rm.guests.values()].some(gs => gs.conn && gs.conn.open);
        return !!(peer && !peer.destroyed);
      }
      return !!(conn && conn.open);
    },
    get invite() { return invite && invite.id === g.id ? invite.host ? 'NEW' : invite.code : null; },
    on(t, fn) { (ls[t] = ls[t] || []).push(fn); const off = () => { ls[t] = (ls[t] || []).filter(f => f !== fn); }; add(off); return off; },
    send(msg, fast) {
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return; }
      if (s === undefined) return;
      let b = null;
      const one = c => { if (fast && fastTx(c, s)) return; if (!b && s.length < 16000) b = netTe.encode(s); tx(c, msg, s, b); };
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
  const say = m => { if (rm.ui && rm.ui.flash) rm.ui.flash(netT(m)); else toast(m); };
  const shareLink = () => {
    const url = net.link();
    const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => say('Invite link copied'), () => say(url)); else say(url); };
    if (navigator.share) navigator.share({ title: g.title + ' on gameplay', text: `Join my ${g.title} party on gameplay! Party code ${net.code}`, url }).catch(e => { if (!e || e.name !== 'AbortError') copy(); });
    else copy();
  };
  const onHide = () => { if (mode) shut(true); };
  window.addEventListener('pagehide', onHide);
  add(() => window.removeEventListener('pagehide', onHide));
  add(() => shut(true));
  return net;
}
