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
.g-lobby .gl-players{list-style:none;margin:0;padding:0;flex:1 1 auto;min-height:calc(var(--rows,4) * 71px);max-height:calc(8 * 71px);overflow-y:auto;overscroll-behavior:contain}
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
.g-lobby .gl-pubsw{padding-top:10px}
.g-lobby .gl-publ:empty{display:none}
.g-lobby .gl-pkb{display:flex;flex-direction:column;gap:28px}
.g-lobby .gl-pkr{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.g-lobby .gl-pkc{display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px 20px;border-radius:24px;background:var(--gl-band);border:2px solid var(--gl-line);transition:transform .15s,border-color .15s,background .15s}
.g-lobby .gl-pkc:hover{transform:translateY(-3px);border-color:var(--gl-accent);background:var(--gl-accent-soft)}
.g-lobby .gl-pkc b{font-size:24px;font-weight:800;color:var(--gl-fg)}
.g-lobby .gl-pkc small{font-size:15px;color:var(--gl-muted)}
.g-lobby .gl-pki{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-pki svg{width:30px;height:30px;stroke-width:2}
.g-lobby .gl-pkl h2{margin:0 0 12px;font-size:20px;font-weight:700;color:var(--gl-fg)}
.g-lobby.gl-stack .gl-body.gl-pkb{display:flex;padding:16px;order:1}
.g-lobby.gl-stack .gl-pkr{grid-template-columns:1fr}
.g-lobby.gl-stack .gl-pkc{padding:18px;flex-direction:row;justify-content:flex-start;gap:14px;text-align:left}
.g-lobby.gl-stack .gl-pki{width:48px;height:48px;border-radius:14px}
.g-lobby.gl-stack .gl-pkc small{display:none}
.g-lobby.gl-stack .gl-pkc b{font-size:22px}
.g-lobby .gl-publ{flex:none;padding-top:14px}
.g-lobby .gl-publh{margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--gl-muted)}
.g-lobby .gl-publw{display:flex;flex-wrap:wrap;gap:8px}
.g-lobby .gl-pubj{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 14px;border-radius:14px;background:var(--gl-band);border:1px solid var(--gl-line);text-align:left;transition:transform .12s,border-color .15s}
.g-lobby .gl-pubj:hover{border-color:var(--gl-accent);transform:translateY(-1px)}
.g-lobby .gl-pubn{display:flex;flex-direction:column;min-width:0}
.g-lobby .gl-pubn b{font-weight:700;color:var(--gl-fg);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-pubn small{font-size:13px;color:var(--gl-muted)}
.g-lobby .gl-pubj i{font-style:normal;font-weight:700;color:var(--gl-accent);background:var(--gl-accent-soft);border-radius:10px;padding:7px 12px}
.g-lobby .gl-pl.gl-seat button.gl-av.gl-addf{cursor:pointer;background:var(--gl-accent-soft);color:var(--gl-accent);border:2px solid color-mix(in srgb,var(--gl-accent) 35%,transparent);transition:transform .12s,background .15s,color .15s}
.g-lobby .gl-pl.gl-seat button.gl-av.gl-addf:hover{background:var(--gl-accent);color:var(--gl-accent-ink);transform:scale(1.08)}
.g-lobby .gl-pl.gl-seat button.gl-av.gl-addf svg{stroke-width:2.4}
.g-lobby .gl-inv{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:color-mix(in srgb,var(--gl-page) 70%,transparent);backdrop-filter:blur(4px);animation:glin .2s ease both}
.g-lobby .gl-invc{width:min(520px,92%);max-height:88%;display:flex;flex-direction:column;background:var(--gl-card);border:1px solid var(--gl-line);border-radius:24px;box-shadow:var(--gl-shadow);padding:24px}
.g-lobby .gl-invh{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.g-lobby .gl-invh h2{margin:0;font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--gl-fg)}
.g-lobby .gl-invt{margin:0 0 16px;color:var(--gl-muted);font-size:16px}
.g-lobby .gl-invl{list-style:none;margin:0 0 14px;padding:0;overflow-y:auto;min-height:0;flex:1 1 auto}
.g-lobby .gl-invl li{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gl-line)}
.g-lobby .gl-av.gl-on2{box-shadow:0 0 0 2px var(--gl-card),0 0 0 4px var(--gl-live)}
.g-lobby .gl-jbtn.gl-done{background:var(--gl-live-soft);color:var(--gl-live)}
.g-lobby .gl-inva{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.g-lobby .gl-inva .gl-play{min-width:0;flex:1 1 200px;height:52px;font-size:17px}
.g-lobby .gl-invn{margin:10px 0 0;min-height:1.2em;text-align:center;color:var(--gl-danger);font-size:14px;font-weight:600}
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
.g-lobby.gl-cmp .gl-players{min-height:calc(var(--rows,4) * 58px);max-height:calc(8 * 58px)}
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
.g-lobby.gl-stack .gl-players{min-height:0;max-height:312px;overflow-y:auto;flex:none}
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
@media (prefers-reduced-motion:reduce){.g-lobby,.g-lobby *{transition:none!important;animation:none!important}}
.g-lobby .gl-foot.gl-foot1{grid-template-columns:minmax(0,1fr);justify-items:center;padding:26px 40px 24px;gap:10px}
.g-lobby .gl-foot1 .gl-act{grid-column:1}
.g-lobby .gl-foot1 .gl-hint{grid-column:1;justify-self:center;text-align:center}
.g-lobby .gl-foot1 .gl-hint:empty{display:none}
.g-lobby .gl-pkh{margin:0;font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--gl-fg);text-align:center}
.g-lobby .gl-pk .gl-body{display:flex}
.g-lobby .gl-jbody{display:flex;flex-direction:column;gap:28px;min-height:260px}
.g-lobby .gl-jcode h2,.g-lobby .gl-pkl h2{margin:0 0 12px;font-size:20px;font-weight:700;color:var(--gl-fg)}
.g-lobby .gl-jcode .gl-join{width:320px}
.g-lobby .gl-pubj .gl-av{width:40px;height:40px;font-size:15px;flex:none}
.g-lobby .gl-pubj{min-width:250px;flex:1 1 250px;max-width:100%}
.g-lobby .gl-pubj i{margin-left:auto}
.g-lobby .gl-pubn b{max-width:220px}
.g-lobby .gl-jst{grid-column:auto;flex:1;gap:10px}
.g-lobby .gl-jst .gl-txt{margin:0;color:var(--gl-muted);font-size:17px;max-width:520px}
.g-lobby .gl-jst .gl-txt.gl-bad{color:var(--gl-danger)}
.g-lobby .gl-jact{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:18px}
.g-lobby .gl-jact .gl-play{min-width:200px;height:54px;font-size:17px}
.g-lobby .gl-spin{width:44px;height:44px;border-radius:50%;border:4px solid var(--gl-chip);border-top-color:var(--gl-accent);animation:glspin .8s linear infinite;margin-bottom:8px}
.g-lobby .gl-pubbox{min-width:200px}
.g-lobby .gl-pubt{display:flex;align-items:center;gap:10px;font-size:22px;letter-spacing:0}
.g-lobby .gl-pubt svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.g-lobby.gl-stack .gl-jcode .gl-join{width:100%}
.g-lobby.gl-stack .gl-pkh{font-size:20px}
.g-lobby.gl-stack .gl-jact .gl-play{min-width:0;flex:1 1 140px}
@keyframes glspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.g-lobby .gl-spin{animation-duration:2.4s}}`;
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
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M17.5 14.2A6.5 6.5 0 0 1 21.5 20"/></svg>',
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
const NET_TAB = netUid();
const NET_RELOAD = (() => { try { const n = performance.getEntriesByType('navigation')[0]; return !!n && n.type === 'reload'; } catch (e) { return false; } })();
const NET_SES = 'gameplay:netses';
const netSes = v => {
  try {
    if (v === undefined) { const o = JSON.parse(sessionStorage.getItem(NET_SES) || 'null'); return o && typeof o === 'object' && typeof o.code === 'string' && Date.now() - o.t < 180000 ? o : null; }
    if (v === null) sessionStorage.removeItem(NET_SES); else sessionStorage.setItem(NET_SES, JSON.stringify(v));
  } catch (e) {}
  return null;
};
const netInit = n => {
  const w = String(n || '').trim().split(/\s+/).filter(Boolean).map(x => Array.from(x));
  if (!w.length) return '?';
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2).join('')).toUpperCase();
};
const netHm = t => { const d = new Date(t), p = x => (x < 10 ? '0' : '') + x; return p(d.getHours()) + ':' + p(d.getMinutes()); };
const netTurn = async c => { try { const pc = c && c.peerConnection; if (!pc || !pc.getStats) return 0; const st = await pc.getStats(); let pair = null; st.forEach(r => { if (r.type === 'transport' && r.selectedCandidatePairId) pair = st.get(r.selectedCandidatePairId) || pair; }); if (!pair) st.forEach(r => { if (r.type === 'candidate-pair' && r.state === 'succeeded' && (r.nominated || r.selected)) pair = r; }); if (!pair) return 0; const lc = st.get(pair.localCandidateId), rc = st.get(pair.remoteCandidateId); return (lc && lc.candidateType === 'relay') || (rc && rc.candidateType === 'relay') ? 1 : 0; } catch (e) { return 0; } };
const netTrack = (ev, p) => { try { if (typeof Ameplay !== 'undefined' && Ameplay.analytics && typeof Ameplay.analytics.track === 'function') Ameplay.analytics.track(ev, p); } catch (e) {} };
const NET_MAX = 16;
const netSizes = o => {
  const mn = Math.max(2, Math.min(NET_MAX, Math.round(+o.min) || 2));
  let s = (Array.isArray(o.sizes) ? o.sizes : []).map(n => Math.round(+n)).filter(n => n >= 2 && n <= NET_MAX);
  if (!s.length) { const mx = Math.max(mn, Math.min(NET_MAX, Math.round(+o.max) || 4)); for (let i = mn; i <= mx; i++) s.push(i); }
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
const netDiag = (a, d) => { try { DIAG.ev('net', Object.assign({ a }, d || {})); } catch (e) {} };
const netIceRemote = async () => {
  const urls = typeof NET_ICE_URLS !== 'undefined' && Array.isArray(NET_ICE_URLS) ? NET_ICE_URLS : [];
  for (const u of urls) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 3500);
    try {
      const tok = typeof sbTok === 'function' ? sbTok() : null;
      if (!tok) continue;
      const r = await fetch(u, { signal: ctl.signal, credentials: 'omit', cache: 'no-store', headers: { Authorization: 'Bearer ' + tok, apikey: SUPABASE_ANON_KEY } });
      if (!r.ok) continue;
      const j = await r.json(), l = j && (j.iceServers || j.ice_servers);
      const ok = (Array.isArray(l) ? l : l ? [l] : []).filter(x => x && (typeof x.urls === 'string' || Array.isArray(x.urls))).slice(0, 6).map(x => ({ urls: x.urls, username: x.username, credential: x.credential }));
      if (ok.length) { netDiag('ice-remote', { u: u.slice(0, 80), n: ok.length }); return ok; }
    } catch (e) {} finally { clearTimeout(tm); }
  }
  return [];
};
const netIce = () => {
  if (netIceC && Date.now() - netIceC.t < 3600e3 && netIceC.s === (typeof sbTok === 'function' && !!sbTok())) return netIceC.p;
  const p = (async () => {
    const ice = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
    const more = await netIceRemote();
    more.forEach(x => ice.push(x));
    try {
      const te = new TextEncoder(), user = (Math.floor(Date.now() / 1000) + 86400) + ':gameplay';
      const k = await crypto.subtle.importKey('raw', te.encode(NET_TURN_KEY), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, te.encode(user)));
      ice.push({ urls: ['turn:' + NET_TURN + ':80', 'turn:' + NET_TURN + ':80?transport=tcp', 'turn:' + NET_TURN + ':443', 'turns:' + NET_TURN + ':443?transport=tcp'], username: user, credential: btoa(String.fromCharCode.apply(null, sig)) });
    } catch (e) {}
    return ice;
  })();
  netIceC = { t: Date.now(), p, s: typeof sbTok === 'function' && !!sbTok() };
  return p;
};
const netB64 = u => btoa(String.fromCharCode.apply(null, new Uint8Array(u)));
const netUnb = s => Uint8Array.from(atob(String(s)), c => c.charCodeAt(0));
const netRtOk = () => !!(typeof SB !== 'undefined' && SB.on && !window.__gpSbDown && window.crypto && crypto.subtle && typeof sbClient === 'function');
const netRtName = (gid, code, id) => 'gp:' + gid + ':' + code + (id ? ':' + id : '');
const RTP = { p: null, uid: null };
function rtPriv(sb) {
  const uid = typeof SB !== 'undefined' && SB.user ? SB.user.id : null;
  if (!uid || !sb) return Promise.resolve(false);
  if (RTP.p && RTP.uid === uid) return RTP.p;
  RTP.uid = uid;
  RTP.p = new Promise(res => {
    let done = false, ch = null;
    const end = v => { if (done) return; done = true; clearTimeout(t); try { if (ch) sb.removeChannel(ch); } catch (e) {} if (typeof netDiag === 'function') netDiag('rt-private', { on: v }); res(v); };
    const t = setTimeout(() => { RTP.p = null; end(false); }, 6000);
    try { ch = sb.channel('probe', { config: { private: true } }); ch.subscribe(st => { if (st === 'SUBSCRIBED') end(true); else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') end(false); }); } catch (e) { end(false); }
  });
  return RTP.p;
}
window.gpRtPriv = rtPriv;
const netReg = (fn, body) => { try { if (typeof SB === 'undefined' || !SB.user || typeof sbRest !== 'function') return Promise.resolve(null); return sbRest('rpc/' + fn, { method: 'POST', body }).catch(() => null); } catch (e) { return Promise.resolve(null); } };
const netRtKeys = () => crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
const netRtPub = async k => netB64(await crypto.subtle.exportKey('raw', k.publicKey));
const netRtShare = async (priv, pub) => {
  const pk = await crypto.subtle.importKey('raw', netUnb(pub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: pk }, priv, 256);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bits)), x => x.toString(16).padStart(2, '0')).join('').slice(0, 32);
};
const netRtSub = (ch, ms) => new Promise((res, rej) => {
  let done = false;
  const t = setTimeout(() => { if (!done) { done = true; rej({ type: 'network' }); } }, ms);
  try {
    ch.subscribe(st => {
      if (done) return;
      if (st === 'SUBSCRIBED') { done = true; clearTimeout(t); res(); }
      else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') { done = true; clearTimeout(t); rej({ type: 'network' }); }
    });
  } catch (e) { done = true; clearTimeout(t); rej({ type: 'network' }); }
});
function netRtLink(sb, name, role, o) {
  const ls = {}, emit = (t, a) => (ls[t] || []).slice().forEach(f => { try { f(a); } catch (e) { console.error(e); } });
  const L = { open: false, serialization: 'json', peerConnection: null, dataChannel: null, slow: true, kind: 'relay', rt: true };
  let ch = null, dead = false, sq = 0, rq = 0, out = [], ft = 0, last = 0, pc = null, dc = null, mode = null, ckn = 0, dcOpen = null, wantGo = null;
  const dcReady = new Promise(r => { dcOpen = r; });
  const say = (event, payload) => { if (!dead && ch) { try { const r = ch.send({ type: 'broadcast', event, payload }); if (r && r.catch) r.catch(() => {}); } catch (e) {} } };
  const flush = () => { ft = 0; if (dead || !out.length) return; const b = out; out = []; last = Date.now(); say('m', { s: ++sq, b }); };
  const push = m => { out.push(m); if (!ft) ft = setTimeout(flush, Date.now() - last > 90 ? 0 : 70); };
  L.on = (t, f) => { (ls[t] = ls[t] || []).push(f); return L; };
  L.send = m => {
    if (dead) return;
    if (dc && dc.readyState === 'open' && L.kind === 'p2p') { try { dc.send(JSON.stringify(m)); return; } catch (e) {} }
    let s = null;
    try { s = JSON.stringify(m); } catch (e) { return; }
    if (s.length < 60000) { push(m); return; }
    const id = ++ckn, n = Math.ceil(s.length / 40000);
    for (let i = 0; i < n; i++) push({ __ck: [id, i, n, s.slice(i * 40000, i * 40000 + 40000)] });
  };
  const end = why => {
    if (dead) return;
    const was = L.open;
    dead = true; L.open = false; clearTimeout(ft);
    try { if (dc) dc.close(); } catch (e) {}
    try { if (pc) pc.close(); } catch (e) {}
    const c = ch; ch = null;
    if (c) { try { sb.removeChannel(c); } catch (e) {} }
    netDiag('rt-link-end', { role, why: String(why || ''), kind: L.kind });
    if (was) emit('close'); else emit('error', { type: why || 'network' });
  };
  L.close = () => { if (dead) return; say('x', { why: 'bye' }); setTimeout(() => end('closed'), 0); };
  const wire = d => {
    dc = d;
    try { d.binaryType = 'arraybuffer'; } catch (e) {}
    d.onopen = () => { netDiag('rt-dc-open', { role }); dcOpen(true); go(); };
    d.onmessage = e => {
      if (dead) return;
      let v = e.data;
      try { if (typeof v !== 'string') v = new TextDecoder().decode(v); v = JSON.parse(v); } catch (x) { return; }
      emit('data', v);
    };
    d.onclose = () => { if (L.kind === 'p2p' && !dead) end('dc-closed'); };
    d.onerror = () => { if (L.kind === 'p2p' && !dead) end('dc-error'); };
  };
  const rtc = async () => {
    if (pc || dead || typeof RTCPeerConnection !== 'function') return;
    const cfg = { iceServers: await netIce(), iceCandidatePoolSize: 2 };
    if (o && o.relayOnly) cfg.iceTransportPolicy = 'relay';
    if (dead) return;
    pc = new RTCPeerConnection(cfg);
    L.peerConnection = pc;
    pc.onicecandidate = e => { if (e.candidate) say('s', { c: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate }); };
    pc.oniceconnectionstatechange = () => { if (pc && pc.iceConnectionState === 'failed') { if (L.kind === 'p2p' && !dead) end('ice-failed'); else dcOpen(false); } };
    if (role === 'guest') {
      wire(pc.createDataChannel('gp', { ordered: true }));
      const of = await pc.createOffer();
      await pc.setLocalDescription(of);
      say('s', { d: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } });
    } else pc.ondatachannel = e => { if (e.channel && e.channel.label === 'gp') wire(e.channel); };
  };
  let sigQ = Promise.resolve(), cands = [];
  const sigOne = async p => {
    try {
      if (!p || dead || mode === 'relay') return;
      if (p.d) {
        if (!pc) await rtc();
        if (!pc || dead) return;
        await pc.setRemoteDescription(p.d);
        if (p.d.type === 'offer') { const an = await pc.createAnswer(); await pc.setLocalDescription(an); say('s', { d: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } }); }
        const l = cands; cands = [];
        for (const c of l) await pc.addIceCandidate(c).catch(() => {});
      } else if (p.c) {
        if (!pc || !pc.remoteDescription) { if (cands.length < 60) cands.push(p.c); return; }
        await pc.addIceCandidate(p.c).catch(() => {});
      }
    } catch (e) { netDiag('rt-sig-error', { role, m: String(e && e.message || e).slice(0, 120) }); }
  };
  const sigIn = p => { sigQ = sigQ.then(() => sigOne(p)); };
  const go = () => {
    if (dead || L.open || !mode) return;
    if (mode === 'p2p' && !(dc && dc.readyState === 'open')) return;
    L.kind = mode; L.slow = mode !== 'p2p'; L.dataChannel = mode === 'p2p' ? dc : null;
    if (mode !== 'p2p') { try { if (dc) dc.close(); } catch (e) {} try { if (pc) pc.close(); } catch (e) {} pc = null; dc = null; L.peerConnection = null; }
    L.open = true;
    netDiag('rt-link-open', { role, kind: L.kind });
    emit('open');
  };
  L.start = async () => {
    try {
      const priv = await rtPriv(sb);
      ch = sb.channel(name, { config: { private: priv, broadcast: { self: false, ack: false } } });
      ch.on('broadcast', { event: 'm' }, m => {
        const p = m && m.payload;
        if (dead || !p || !Array.isArray(p.b)) return;
        if (p.s !== rq + 1) { end('gap'); return; }
        rq = p.s;
        p.b.forEach(d => { if (!dead) emit('data', d); });
      });
      ch.on('broadcast', { event: 's' }, m => sigIn(m && m.payload));
      ch.on('broadcast', { event: 'x' }, () => end('peer-closed'));
      ch.on('broadcast', { event: 'r' }, () => { if (role === 'guest' && wantGo) wantGo(); });
      ch.on('broadcast', { event: 'g' }, m => { if (role === 'hub' && !mode) { mode = m && m.payload && m.payload.k === 'p2p' ? 'p2p' : 'relay'; go(); if (mode === 'p2p') setTimeout(() => { if (!L.open && !dead) end('timeout'); }, 8000); } });
      await netRtSub(ch, 7000);
      if (dead) return;
      if (role === 'hub') {
        let n = 0;
        const t = setInterval(() => { if (dead || L.open || mode || ++n > 14) return clearInterval(t); say('r', { t: Date.now() }); }, 500);
        say('r', { t: Date.now() });
        setTimeout(() => { if (!L.open && !dead) end('timeout'); }, 20000);
        return;
      }
      await new Promise((res, rej) => { const t = setTimeout(() => rej({ type: 'timeout' }), 6000); wantGo = () => { clearTimeout(t); wantGo = null; res(); }; });
      if (dead) return;
      let p2p = false;
      if (o && o.p2p && typeof RTCPeerConnection === 'function') {
        rtc().catch(() => dcOpen(false));
        p2p = await Promise.race([dcReady, new Promise(r => setTimeout(() => r(false), o.wait || 6500))]);
      }
      if (dead) return;
      mode = p2p ? 'p2p' : 'relay';
      say('g', { k: mode });
      setTimeout(() => say('g', { k: mode }), 400);
      go();
    } catch (e) { end(e && e.type || 'network'); }
  };
  return L;
}
async function netRtDoor(sb, gid, code, hubId, onLink) {
  const keys = await netRtKeys(), pub = await netRtPub(keys), key = 'hub:' + hubId, seen = new Map(), burst = [], t0 = Date.now();
  let dead = false, sync = null;
  const first = new Promise(r => { sync = r; });
  const ch = sb.channel(netRtName(gid, code), { config: { private: await rtPriv(sb), broadcast: { self: false, ack: false }, presence: { key } } });
  ch.on('presence', { event: 'sync' }, () => sync(ch.presenceState()));
  ch.on('broadcast', { event: 'k' }, async m => {
    const p = m && m.payload;
    if (dead || !p || typeof p.n !== 'string' || typeof p.p !== 'string' || p.n.length > 24 || p.p.length > 200) return;
    const send = () => { try { const r = ch.send({ type: 'broadcast', event: 'o', payload: { n: p.n, p: pub } }); if (r && r.catch) r.catch(() => {}); } catch (e) {} };
    if (seen.has(p.n)) return send();
    const tn = Date.now();
    while (burst.length && tn - burst[0] > 10000) burst.shift();
    if (burst.length >= 40) return;
    burst.push(tn);
    if (seen.size > 400) seen.clear();
    seen.set(p.n, 1);
    let id;
    try { id = await netRtShare(keys.privateKey, p.p); } catch (e) { return; }
    if (dead) return;
    const link = netRtLink(sb, netRtName(gid, code, id), 'hub', {});
    onLink(link);
    await link.start();
    send();
  });
  await new Promise((res, rej) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; rej({ type: 'network' }); } }, 7000);
    try {
      ch.subscribe(st => {
        if (dead) return;
        if (st === 'SUBSCRIBED') { try { const r = ch.track({ t: t0 }); if (r && r.catch) r.catch(() => {}); } catch (e) {} if (!done) { done = true; clearTimeout(t); res(); } else netDiag('rt-door-rejoin'); }
        else if (!done && (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED')) { done = true; clearTimeout(t); rej({ type: 'network' }); }
      });
    } catch (e) { if (!done) { done = true; clearTimeout(t); rej({ type: 'network' }); } }
  });
  const st = await Promise.race([first, new Promise(r => setTimeout(() => r(null), 2500))]);
  let taken = false;
  if (st) for (const k in st) { if (k.indexOf('hub:') === 0 && k !== key && (st[k] || []).some(x => (+x.t || 0) <= t0)) taken = true; }
  const close = () => { if (dead) return; dead = true; try { sb.removeChannel(ch); } catch (e) {} };
  if (taken) close();
  return { taken, close, pub };
}
async function netRtDial(sb, gid, code, o, alive) {
  let sync = null, got = null;
  const first = new Promise(r => { sync = r; });
  const keys = await netRtKeys(), pub = await netRtPub(keys), n = netUid();
  let regKey = null;
  const regP = netReg('party_check', { p_game: gid, p_code: code }).then(r => { regKey = r && typeof r.key === 'string' ? r.key : null; return r; });
  const ch = sb.channel(netRtName(gid, code), { config: { private: await rtPriv(sb), broadcast: { self: false, ack: false }, presence: { key: '' } } });
  const reply = new Promise(r => { got = r; });
  ch.on('presence', { event: 'sync' }, () => sync(ch.presenceState()));
  ch.on('broadcast', { event: 'o' }, m => { const p = m && m.payload; if (p && p.n === n && typeof p.p === 'string') { if (regKey && p.p !== regKey) { netDiag('rt-key-mismatch'); return; } got(p.p); } });
  const drop = () => { try { sb.removeChannel(ch); } catch (e) {} };
  let stopT = 0;
  const gone = new Promise((r, j) => { stopT = setInterval(() => { if (!alive()) j({ type: 'cancel' }); }, 150); });
  gone.catch(() => {});
  const or = p => { p.catch(() => {}); return Promise.race([p, gone]); };
  try {
    await or(netRtSub(ch, 7000));
    const st = await or(Promise.race([first, new Promise(r => setTimeout(() => r(null), 3000))]));
    if (!alive()) throw { type: 'cancel' };
    if (st && !Object.keys(st).some(k => k.indexOf('hub:') === 0)) throw { type: 'peer-unavailable' };
    const reg = await or(Promise.race([regP, new Promise(r => setTimeout(() => r(null), 2500))]));
    if (reg && reg.state === 'ended' && !regKey) netDiag('rt-reg-ended');
    netDiag('rt-verify', { key: !!regKey });
    let hp = null;
    for (let i = 0; i < 7 && !hp; i++) {
      try { const r = ch.send({ type: 'broadcast', event: 'k', payload: { n, p: pub } }); if (r && r.catch) r.catch(() => {}); } catch (e) {}
      hp = await or(Promise.race([reply, new Promise(r => setTimeout(() => r(null), 900))]));
      if (!alive()) throw { type: 'cancel' };
    }
    if (!hp) throw { type: st ? 'timeout' : 'peer-unavailable' };
    const id = await netRtShare(keys.privateKey, hp);
    const link = netRtLink(sb, netRtName(gid, code, id), 'guest', o);
    const opened = new Promise((res, rej) => { link.on('open', () => res(link)); link.on('error', e => rej(e && e.type ? e : { type: 'network' })); });
    link.start();
    const out = await or(Promise.race([opened, new Promise((r, j) => setTimeout(() => j({ type: 'timeout' }), 16000))])).catch(e => { try { link.close(); } catch (x) {} opened.then(l => { try { l.close(); } catch (x) {} }, () => {}); throw e; });
    if (!alive()) { try { out.close(); } catch (x) {} throw { type: 'cancel' }; }
    return out;
  } finally { clearInterval(stopT); drop(); }
}
const NET_SOFT = ['network', 'server-error', 'socket-error', 'socket-closed', 'load'];
const netWhy = (e, code) => {
  const t = e && e.type;
  if (t === 'peer-unavailable') return code ? netT('Party {code} not found. Check the code and try again.').replace('{code}', code) : netT('Party not found. Check the code and try again.');
  if (t === 'ice') return netT('Could not connect to the other player. Try another network.');
  if (t === 'timeout') return netT('The other player did not answer. Try again.');
  if (t === 'load') return netT('Could not load online play. Try again.');
  if (NET_SOFT.indexOf(t) >= 0) return netT('Can’t reach the online server. Try again.');
  return netT(netErr(e));
};
const netTe = new TextEncoder();
function makeNet(g, add) {
  const ls = {};
  const emit = (t, ...a) => (ls[t] || []).slice().forEach(f => { try { f(...a); } catch (e) { console.error(e); } });
  let peer = null, conn = null, hb = 0, lastRx = 0, gen = 0, mode = null, note = null, ckId = 0, pairHid = false, resumed = false, nudge = null;
  const now = () => Date.now();
  const lim = (hid, slow) => (document.hidden || hid ? 180000 : slow ? 16000 : 7000);
  const nap = ms => new Promise(r => { const t = setTimeout(() => { nudge = null; r(); }, ms); nudge = () => { clearTimeout(t); nudge = null; r(); }; });
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
      if (d && d.__vis !== undefined) { pairHid = !!d.__vis; return; }
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
      if (t - lastRx > (document.hidden || pairHid ? 120000 : 6000)) drop();
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
  const newPeer = async (id, my, relay, quiet) => {
    let Peer;
    try { Peer = await loadPeer(); } catch (e) { try { Peer = await loadPeer(); } catch (x) { netDiag('peer-lib-fail'); throw { type: 'load' }; } }
    const config = { iceServers: await netIce(), sdpSemantics: 'unified-plan', iceCandidatePoolSize: 4 };
    if (relay) config.iceTransportPolicy = 'relay';
    let last = null;
    for (let i = 0; i < (quiet ? 2 : 3); i++) {
      if (i) {
        if (note && !quiet) note(netT('Server busy, trying again ({n}/3)…').replace('{n}', i + 1));
        await sleepMs(1500 * i);
      }
      if (my != null && my !== gen) throw { type: 'cancel' };
      const p = new Peer(id, { debug: 0, config }), t0 = now();
      try { await wait((res, rej) => { p.on('open', res); p.on('error', rej); }, quiet ? 7000 : 10000, 'network'); }
      catch (e) { try { p.destroy(); } catch (x) {} last = e; netDiag('peer-open-fail', { host: !!id, type: e && e.type || 'unknown', n: i + 1, ms: now() - t0 }); if (!e || NET_SOFT.indexOf(e.type) < 0) throw e; continue; }
      if (my != null && my !== gen) { try { p.destroy(); } catch (x) {} throw { type: 'cancel' }; }
      netDiag('peer-open', { host: !!id, ms: now() - t0, relay: !!relay });
      p.on('error', e => { netDiag('peer-error', { type: e && e.type || 'unknown' }); emit('error', e); });
      p.on('disconnected', () => netDiag('peer-disconnected'));
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
    const early = () => { if (ice() === 'new' && !(c && c.open)) fin({ type: 'peer-unavailable' }); else t = setTimeout(tick, 8500); };
    t = setTimeout(early, 3000);
    p.on('error', onErr);
    try { c = p.connect(pid(code), { reliable: true, serialization: 'json' }); } catch (e) { return fin({ type: 'network' }); }
    if (!c) return fin({ type: 'network' });
    c.on('open', () => {
      if (done === null) return fin(null, c);
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
  const hand = (c, my, hello, done, ms) => new Promise((res, rej) => {
    let fin = false, rs = 0;
    const end = (e, v) => { if (fin) return; fin = true; clearTimeout(t); clearInterval(rs); if (e) { try { c.close(); } catch (x) {} rej(e); } else res(v); };
    const t = setTimeout(() => end({ type: 'timeout' }), ms);
    c.on('data', d0 => {
      if (fin) return;
      const d = unck(c, d0);
      if (d === null) return;
      if (my !== gen) return end({ type: 'cancel' });
      const r = done(d);
      if (r === true) end(null, c); else if (r) end(r);
    });
    c.on('close', () => end({ type: 'timeout' }));
    c.on('error', () => end({ type: 'network' }));
    const say = () => { if (!fin) tx(c, hello); };
    say(); rs = setInterval(say, 1000);
  });
  const slowFast = (c, m) => {
    if (!c || !c.open) return;
    const q = c.__q || (c.__q = new Map());
    let k = '';
    for (const x in m) { k = x; break; }
    q.set(k + '|' + (typeof m.t === 'string' ? m.t : typeof m.k === 'string' ? m.k : ''), m);
    if (c.__qt) return;
    c.__qt = setTimeout(() => { c.__qt = 0; const l = [...q.values()]; q.clear(); l.forEach(x => tx(c, x)); }, 120);
  };
  const rm = { door: null, via: '', pub: false, me: null, key: null, name: '', hostId: null, list: [], guests: new Map(), seq: 0, min: 2, max: 4, sizes: [2, 3, 4], state: 'lobby', conn: null, lastRx: 0, hb: 0, ui: null, busy: false, reconn: false, pendingGo: null, inGame: false, leader: null, chat: [], rate: new Map(), go: null, hubHid: false, rt0: 0, compat: false, compatO: null, tick: 0, lastTick: 0, bots: false, botsOk: false, renamed: false };
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
  const cleanList = l => Array.isArray(l) ? l.slice(0, NET_MAX).filter(p => p && typeof p.id === 'string').map(p => ({ id: p.id.slice(0, 16), name: netName(p.name) || 'Player', host: !!p.host, leader: !!p.leader, ping: Math.max(0, Math.min(9999, +p.ping || 0)), away: !!p.away, inGame: !!p.inGame })) : [];
  const cleanSizes = l => Array.isArray(l) ? l.map(n => Math.round(+n)).filter(n => n >= 2 && n <= NET_MAX).slice(0, NET_MAX - 1) : [];
  const cleanMsg = m => m && typeof m === 'object' ? { i: typeof m.i === 'string' ? m.i.slice(0, 16) : '', n: netName(m.n), x: netMsg(m.x), k: m.s && typeof m.k === 'string' ? netMsg(m.k).slice(0, 60) : '', a: netName(m.a), t: +m.t || Date.now(), s: m.s ? 1 : 0 } : null;
  const cleanChat = l => Array.isArray(l) ? l.slice(-100).map(cleanMsg).filter(m => m && m.x) : [];
  const txAll = m => {
    if (!rm.guests.size) return;
    const s = JSON.stringify(m), b = s.length < 16000 ? netTe.encode(s) : null;
    rm.guests.forEach(gs => tx(gs.conn, m, s, b));
  };
  const sesSave = () => {
    if (mode !== 'room' || !net.code || !rm.me) return;
    const o = { g: g.id, role: net.role, code: net.code, me: rm.me, key: rm.key, name: rm.name, t: Date.now() };
    if (net.role === 'host') o.h = { pub: rm.pub, max: rm.max, bots: rm.bots, leader: rm.leader, guests: [...rm.guests.values()].map(x => ({ id: x.id, key: x.key, name: x.name, seq: x.seq })) };
    netSes(o);
  };
  const hidTx = () => {
    const m = { __vis: document.hidden ? 1 : 0 };
    if (mode === 'room') { if (net.role === 'host') rm.guests.forEach(gs => tx(gs.conn, m)); else tx(rm.conn, m); }
    else tx(conn, m);
  };
  const revive = () => {
    const t = now();
    lastRx = t; rm.lastRx = t; rm.lastTick = t; rm.rt0 = t;
    rm.guests.forEach(gs => { if (gs.conn) gs.lastRx = t; });
    if (nudge) nudge();
  };
  const onVis = () => { hidTx(); if (!document.hidden) revive(); };
  const pubPush = () => {
    try { if (typeof window.gpPubSet === 'function') window.gpPubSet(g.id, mode === 'room' && net.role === 'host' && rm.pub && !rm.compat && net.code ? { g: g.id, c: String(net.code), n: hostPlayers().filter(p => !p.away).length, m: rm.max, h: rm.name, b: rm.state === 'game' ? 1 : 0, t: rm.pubT || (rm.pubT = Date.now()) } : null); } catch (e) {}
  };
  const regBeat = () => { if (mode === 'room' && net.role === 'host' && net.code) { const n = hostPlayers().length; netReg('party_beat', { p_game: g.id, p_code: net.code, p_players: n, p_full: n >= rm.max, p_pub: !!rm.pub, p_size: rm.max, p_key: rm.door && rm.door.pub || null }); } };
  const regSoon = () => { clearTimeout(rm.regS); rm.regS = setTimeout(regBeat, 800); };
  const pushList = () => {
    regSoon();
    rm.list = hostPlayers();
    const m = { __pl: rm.list, busy: rm.state === 'game', min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk, pub: rm.pub };
    txAll(m);
    sesSave();
    pubPush();
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
  const welOf = gs => ({ __wel: { id: gs.id, host: rm.me, code: net.code, busy: rm.state === 'game', inGame: gs.inGame, hid: document.hidden, go: gs.inGame && rm.state === 'game' ? rm.go : null, min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk, pub: rm.pub, chat: rm.chat } });
  const removeGuest = (id, why) => {
    const gs = rm.guests.get(id);
    if (!gs) return;
    rm.guests.delete(id); clearTimeout(gs.gt); rm.rate.delete(id);
    netDiag('guest-removed', { why, hid: !!gs.hid, away: !!gs.away });
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
  const goAway = (gs, back, why) => {
    if (gs.away) return;
    netDiag('guest-away', { why: back ? 'bye' : why || 'timeout', hid: !!gs.hid, quiet: now() - gs.lastRx });
    const c = gs.conn; gs.conn = null; gs.away = true;
    try { if (c) c.close(); } catch (e) {}
    clearTimeout(gs.gt);
    gs.gt = setTimeout(() => removeGuest(gs.id, 'lost'), back ? 40000 : gs.hid ? 60000 : 12000);
    pushList();
  };
  const hostIn = (gid, c, d, fast) => {
    const gs = rm.guests.get(gid);
    if (!gs || gs.conn !== c) return;
    gs.lastRx = now();
    if (!d.__hello) gs.ok = true;
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { gs.rtt = Math.round(now() - d.__hr); return; }
    if (d.__hello) { if (!fast) tx(c, welOf(gs)); return; }
    if (d.__vis !== undefined) { gs.hid = !!d.__vis; netDiag('guest-vis', { hid: gs.hid }); return; }
    if (fast) { if (gs.inGame && rm.state === 'game') emit('data', d, gid); return; }
    if (d.__bye) { if (d.back) goAway(gs, true); else removeGuest(gid, 'left'); return; }
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
        if (id === rm.me || !/^[a-z0-9]{6,16}$/.test(id) || h.key.length < 8 || h.key.length > 64) { tx(c, { __full: 1, why: 'id' }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
        if (old) {
          const dup = !!(old.conn && old.conn !== c && old.conn.open && !old.away && !h.re && h.tab && old.tab && h.tab !== old.tab && now() - old.lastRx < 2500);
          if (old.key !== h.key || dup) { tx(c, { __full: 1, why: dup ? 'dup' : 'id' }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
          const prev = old.conn; gid = id;
          old.conn = c; old.lastRx = now(); old.away = false; old.tab = String(h.tab || ''); clearTimeout(old.gt);
          if (prev && prev !== c) { try { prev.close(); } catch (e) {} }
          tx(c, welOf(old));
          if (old.inGame && rm.state === 'game') emit('rejoin', pubOf(old));
          pushList();
          return;
        }
        if (rm.guests.size + 1 >= rm.max) { tx(c, { __full: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
        gid = id;
        const gs = { id, key: h.key, name: uniqueName(h.name), conn: c, lastRx: now(), rtt: 0, inGame: false, away: false, gt: 0, seq: ++rm.seq, ok: false, hid: false, tab: String(h.tab || '') };
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
    const gone = () => { const gs = gid && rm.guests.get(gid); if (gs && gs.conn === c) { if (gs.ok) goAway(gs, false, 'closed'); else removeGuest(gid, 'left'); } };
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
      if (!gs.conn.open || t - gs.lastRx > lim(gs.hid, gs.conn.slow)) return goAway(gs);
      if (!gs.conn.slow || rm.tick % 3 === 0) ping(gs.conn, t);
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
  const guestGo = d => {
    rm.state = 'game'; rm.inGame = true; rm.busy = true;
    const players = cleanList(d.__go).map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.leader }));
    const r = { role: 'guest', id: rm.me, players, size: Math.round(+d.size) || players.length, leader: typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId, bots: !!d.bots };
    if (rm.ui) rm.ui.finish(r);
    else rm.pendingGo = r;
  };
  const guestData = (c, d, fast) => {
    if (c !== rm.conn || !d || typeof d !== 'object') return;
    rm.lastRx = now();
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { net.rtt = Math.round(now() - d.__hr); return; }
    if (d.__vis !== undefined) { rm.hubHid = !!d.__vis; return; }
    if (fast) { if (rm.state === 'game' && rm.inGame) emit('data', d, rm.hostId); return; }
    if (d.__pl) {
      rm.list = cleanList(d.__pl); rm.busy = !!d.busy;
      if (+d.min) rm.min = +d.min;
      if (+d.max) rm.max = +d.max;
      const s = cleanSizes(d.sizes); if (s.length) rm.sizes = s;
      rm.bots = !!d.bots; rm.botsOk = !!d.canBots; rm.pub = !!d.pub;
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
    if (d.__go) { guestGo(d); return; }
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
  const guestConnect = async (code, my, opt) => {
    opt = Object.assign({}, opt || {});
    let w = null, slowT = 0;
    try { slowT = +sessionStorage.getItem('gameplay:netrelay') || 0; } catch (e) {}
    if (netRtOk() && Date.now() - slowT < 900000) { opt.noP2p = true; opt.rtFirst = true; opt.noPeer = true; }
    const hello = { __hello: { id: rm.me, key: rm.key, name: rm.name, tab: NET_TAB, re: NET_RELOAD ? 1 : 0 } };
    const done = d => { if (d && d.__full) return { type: d.why ? 'dup' : 'room-full' }; if (d && d.__wel) { w = d.__wel; return true; } return false; };
    const alive = () => my === gen, t0 = now(), rtOk = netRtOk();
    let won = null, over = false, pe = null, re = null, pc0 = null;
    const lose = c => { if (c && c !== won) { try { c.close(); } catch (e) {} } };
    const viaPeer = (async () => {
      if (opt.noPeer) throw { type: 'off' };
      if (!peer || peer.destroyed) { const q = await newPeer(undefined, my, !!opt.relayOnly, rtOk); if (my !== gen) { try { q.destroy(); } catch (e) {} throw { type: 'cancel' }; } peer = q; }
      else if (peer.disconnected) { try { peer.reconnect(); } catch (e) {} await sleepMs(1200); }
      const c = await dial1(peer, code, my, null, null);
      pc0 = c;
      if (over) { lose(c); throw { type: 'cancel' }; }
      return c;
    })();
    viaPeer.catch(e => { pe = e || { type: 'network' }; if (pe.type !== 'off' && pe.type !== 'cancel') netDiag('join-peer-fail', { type: pe.type, ms: now() - t0 }); });
    const viaRt = (async () => {
      if (!rtOk) throw { type: 'off' };
      await Promise.race([viaPeer.then(() => new Promise(() => {}), () => {}), sleepMs(opt.rtFirst ? 0 : 1800)]);
      if (over || my !== gen) throw { type: 'cancel' };
      if (note) note(netT('Trying another route…'));
      const sb = await sbClient();
      const l = await netRtDial(sb, g.id, code, { p2p: !opt.noP2p && !(pe && pe.type === 'ice'), relayOnly: !!opt.relayOnly, wait: 5500 }, () => alive() && !over);
      if (over) { lose(l); throw { type: 'cancel' }; }
      return l;
    })();
    viaRt.catch(e => { re = e || { type: 'network' }; if (re.type !== 'off' && re.type !== 'cancel') netDiag('join-rt-fail', { type: re.type, ms: now() - t0 }); });
    let c = null;
    try { c = await Promise.any([viaPeer, viaRt]); }
    catch (x) {
      over = true;
      if (my !== gen) throw { type: 'cancel' };
      const a = pe && pe.type, b = re && re.type;
      const pick = b === 'peer-unavailable' && (a === 'peer-unavailable' || !a || a === 'off' || NET_SOFT.indexOf(a) >= 0) ? 'peer-unavailable' : a === 'peer-unavailable' && (b === 'off' || !b) ? 'peer-unavailable' : a === 'ice' ? 'ice' : b && b !== 'off' && b !== 'cancel' ? b : a && a !== 'off' ? a : 'network';
      throw { type: pick };
    }
    won = c; over = true;
    viaPeer.then(lose, () => {}); viaRt.then(lose, () => {});
    if (my !== gen) { try { c.close(); } catch (e) {} throw { type: 'cancel' }; }
    const via = c.rt ? (c.kind === 'p2p' ? 'rt-p2p' : 'rt-relay') : 'peerjs';
    netDiag('join-link', { via, ms: now() - t0 });
    try { await hand(c, my, hello, done, 9000); }
    catch (e) { netDiag('join-hand-fail', { via, type: e && e.type }); throw e; }
    netDiag('join-ok', { via, ms: now() - t0 });
    rm.via = via;
    try { if (via === 'rt-relay' && !opt.noP2p) sessionStorage.setItem('gameplay:netrelay', String(Date.now())); else if (via !== 'rt-relay') sessionStorage.removeItem('gameplay:netrelay'); } catch (e) {}
    return { c, w };
  };
  const guestAttach = (c, w) => {
    rm.conn = c; rm.lastRx = now(); rm.reconn = false; rm.hubHid = !!w.hid;
    rm.hostId = typeof w.host === 'string' ? w.host.slice(0, 16) : 'host';
    rm.busy = !!w.busy;
    if (+w.min) rm.min = +w.min;
    if (+w.max) rm.max = +w.max;
    const s = cleanSizes(w.sizes); if (s.length) rm.sizes = s;
    rm.bots = !!w.bots; rm.botsOk = !!w.canBots; rm.pub = !!w.pub;
    rm.leader = typeof w.leader === 'string' ? w.leader.slice(0, 16) : rm.hostId;
    if (Array.isArray(w.chat)) rm.chat = cleanChat(w.chat);
    c.on('data', d0 => { const d = unck(c, d0); if (d !== null) guestData(c, d, false); });
    fastOpen(c, d => guestData(c, d, true));
    const gone = () => { if (rm.conn === c) guestLost(); };
    c.on('close', gone);
    c.on('error', gone);
    clearInterval(rm.hb);
    let last = now(), sv = 0;
    rm.hb = setInterval(() => {
      if (rm.conn !== c) return;
      const t = now();
      if (t - last > 2500) rm.lastRx = Math.max(rm.lastRx, t - 1000);
      last = t;
      if (!c.open || t - rm.lastRx > lim(rm.hubHid, c.slow)) return guestLost();
      if (!c.slow || sv % 3 === 0) ping(c, t);
      if (++sv % 5 === 0) sesSave();
    }, 1000);
    sesSave();
    if (document.hidden) hidTx();
    if (rm.ui) rm.ui.chat();
    if (w.inGame && w.go && typeof w.go === 'object' && !(rm.state === 'game' && rm.inGame)) guestGo(w.go);
  };
  const guestLost = async () => {
    const c = rm.conn;
    if (!c || rm.reconn) return;
    rm.conn = null; rm.reconn = true; clearInterval(rm.hb);
    try { c.close(); } catch (e) {}
    if (rm.ui) rm.ui.update();
    const my = gen, code = net.code;
    let why = 'lost', ice = 0;
    rm.rt0 = now();
    netDiag('guest-lost', { via: rm.via });
    while (my === gen && (now() - rm.rt0 < 60000 || (document.hidden && now() - rm.rt0 < 600000))) {
      await nap(1200);
      if (my !== gen) return;
      try {
        const { c: c2, w } = await guestConnect(code, my, { relayOnly: ice > 1, noP2p: ice > 0, rtFirst: ice > 0 });
        if (my !== gen) { try { c2.close(); } catch (e) {} return; }
        guestAttach(c2, w);
        if (rm.state === 'game' && rm.inGame && !w.inGame) {
          if ((ls.lobby || []).length) { rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null; emit('lobby'); }
          else { guestEnd('lost'); return; }
        }
        if (rm.ui) rm.ui.update();
        return;
      } catch (e) {
        const t = e && e.type;
        why = t === 'peer-unavailable' ? 'host-left' : 'lost';
        if (t === 'ice') ice++;
        if (t === 'cancel') return;
        if (t === 'room-full' || t === 'dup') { why = 'lost'; break; }
      }
    }
    if (my === gen) guestEnd(why);
  };
  const shut = (polite, keep) => {
    keep = (keep && mode === 'room') || (mode === 'room' && !!invite && invite.id === g.id && !!invite.code && invite.code === net.code);
    if (keep) sesSave(); else { const o = netSes(); if (o && o.g === g.id) netSes(null); }
    if (mode || peer || rm.door) netDiag('shut', { mode, role: net.role, keep: !!keep, polite: !!polite });
    if (mode === 'room' && net.role === 'host' && net.code && !keep) netReg('party_close', { p_game: g.id, p_code: net.code });
    gen++; clearInterval(hb); clearInterval(rm.hb); clearInterval(rm.regT); clearTimeout(rm.regS);
    if (nudge) nudge();
    const c = conn, p = peer, gc = rm.conn, gs = [...rm.guests.values()], wasHost = mode === 'room' && net.role === 'host', door = rm.door;
    conn = null; peer = null; rm.conn = null; rm.reconn = false; rm.door = null; rm.via = '';
    gs.forEach(x => clearTimeout(x.gt)); rm.guests.clear();
    let delay = 0;
    if (polite && mode === 'room') {
      if (wasHost) { if (!keep) gs.forEach(x => { if (tx(x.conn, { __end: 1 })) delay = 350; }); }
      else if (tx(gc, keep ? { __bye: 1, back: 1 } : { __bye: 1 })) delay = 350;
    }
    const bye = () => {
      try { if (c) c.close(); } catch (e) {}
      try { if (gc) gc.close(); } catch (e) {}
      gs.forEach(x => { try { if (x.conn) x.conn.close(); } catch (e) {} });
      try { if (p) p.destroy(); } catch (e) {}
      try { if (door) door.close(); } catch (e) {}
    };
    if (delay) setTimeout(bye, delay); else bye();
    net.role = null; net.code = null; mode = null; net.rtt = 0;
    rm.list = []; rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null; rm.leader = null; rm.chat = []; rm.rate.clear(); rm.go = null; rm.hubHid = false;
    if (wasHost) pubPush();
  };
  const restoreGuests = h => {
    (Array.isArray(h.guests) ? h.guests : []).slice(0, NET_MAX - 1).forEach(x => {
      if (!x || typeof x.id !== 'string' || typeof x.key !== 'string') return;
      const id = x.id.slice(0, 16), seq = +x.seq || ++rm.seq;
      rm.seq = Math.max(rm.seq, seq);
      rm.guests.set(id, { id, key: x.key, name: netName(x.name) || 'Player', conn: null, lastRx: now(), rtt: 0, inGame: false, away: true, gt: setTimeout(() => removeGuest(id, 'lost'), 40000), seq, ok: true, hid: false, tab: '' });
    });
    if (typeof h.leader === 'string' && rm.guests.has(h.leader)) rm.leader = h.leader;
  };
  const roomHost = async res => {
    shut(true);
    const my = gen, want = res && res.code, t0 = now(), rtOk = netRtOk();
    const me = want && res.me ? res.me : netUid();
    let p = null, door = null, code = null, left = 6, ready = false;
    const early = [];
    const onLink = l => { if (my !== gen) { try { l.close(); } catch (e) {} return; } if (ready) hostConn(l, my); else early.push(l); };
    const adopt = (c, n) => {
      if (my !== gen || net.code !== c || peer) return;
      newPeer(pid(c), my, false, true).then(q => {
        if (my !== gen || net.code !== c || peer) { try { q.destroy(); } catch (e) {} return; }
        peer = q; q.on('connection', x => hostConn(x, my)); netDiag('host-peer-late', { n });
      }, e => { if (n < 8 && my === gen && net.code === c && !peer && (!e || e.type !== 'cancel')) setTimeout(() => adopt(c, n + 1), e && e.type === 'unavailable-id' ? 2500 : 6000); });
    };
    netDiag('host-start', { restore: !!want, rt: rtOk });
    for (;;) {
      const old = !!want && now() - t0 < 15000;
      code = old ? want : Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
      let pr = null, dr = null;
      const pP = newPeer(pid(code), my, false, rtOk).then(x => ({ p: x }), e => ({ e: e || { type: 'network' } }));
      const dP = rtOk ? sbClient().then(sb => netRtDoor(sb, g.id, code, me, onLink)).then(d => ({ d }), e => ({ e: e || { type: 'network' } })) : Promise.resolve({ e: { type: 'off' } });
      pP.then(x => { pr = x; }); dP.then(x => { dr = x; });
      await Promise.race([Promise.all([pP, dP]), dP.then(x => x.d && !x.d.taken ? sleepMs(3000) : new Promise(() => {})), pP.then(x => x.p ? sleepMs(2500) : new Promise(() => {}))]);
      if (my !== gen) { pP.then(x => { if (x.p) { try { x.p.destroy(); } catch (e) {} } }); dP.then(x => { if (x.d) x.d.close(); }); return null; }
      const pTaken = !!(pr && pr.e && pr.e.type === 'unavailable-id'), dTaken = !!(dr && dr.d && dr.d.taken);
      if (dTaken || (pTaken && !(old && dr && dr.d))) {
        pP.then(x => { if (x.p) { try { x.p.destroy(); } catch (e) {} } }); dP.then(x => { if (x.d) x.d.close(); });
        early.splice(0).forEach(l => { try { l.close(); } catch (e) {} });
        if (old) await nap(1200); else if (--left <= 0) throw { type: 'network' };
        if (my !== gen) return null;
        continue;
      }
      p = pr && pr.p || null; door = dr && dr.d && !dr.d.taken ? dr.d : null;
      if (!p && !door) {
        if (!pr || !dr) { const both = await Promise.all([pP, dP]); if (my !== gen) { if (both[0].p) { try { both[0].p.destroy(); } catch (e) {} } if (both[1].d) both[1].d.close(); return null; } p = both[0].p || null; door = both[1].d && !both[1].d.taken ? both[1].d : null; pr = both[0]; }
        if (!p && !door) throw (pr && pr.e && pr.e.type && pr.e.type !== 'off' ? pr.e : { type: 'network' });
      }
      if (!door && rtOk) dP.then(x => { if (x.d && !x.d.taken && my === gen && net.code === code && !rm.door) { rm.door = x.d; netDiag('host-door-late'); regSoon(); } else if (x.d) x.d.close(); });
      if (!p) { const c0 = code; pP.then(x => { if (x.p) { if (my === gen && net.code === c0 && !peer) { peer = x.p; x.p.on('connection', c => hostConn(c, my)); netDiag('host-peer-late', { n: 0 }); } else { try { x.p.destroy(); } catch (e) {} } } else setTimeout(() => adopt(c0, 1), 3000); }); }
      break;
    }
    const same = !!want && code === want;
    peer = p; rm.door = door; net.code = code; net.role = 'host'; mode = 'room';
    rm.me = same ? me : netUid(); rm.pubT = 0; rm.state = 'lobby'; rm.guests.clear(); rm.tick = 0; rm.lastTick = 0; rm.hostId = rm.me; rm.leader = rm.me; rm.chat = []; rm.go = null; net.closeReason = null;
    if (same && res.h) restoreGuests(res.h);
    if (p) p.on('connection', c => hostConn(c, my));
    ready = true;
    early.splice(0).forEach(l => hostConn(l, my));
    clearInterval(rm.hb);
    rm.hb = setInterval(() => { if (my === gen) hostTick(); }, 1000);
    netReg('party_open', { p_game: g.id, p_code: code, p_pub: !!rm.pub, p_key: door ? door.pub : null, p_size: rm.max }).then(ok => { if (ok === false) netDiag('reg-taken', { code }); });
    clearInterval(rm.regT);
    rm.regT = setInterval(() => { if (my === gen) regBeat(); }, 30000);
    netDiag('host-ready', { code, peer: !!p, rt: !!door, ms: now() - t0 });
    pushList();
    return code;
  };
  const roomJoin = async code => {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const ses = netSes();
    let res = ses && ses.g === g.id && ses.code === code && ses.role === 'guest' ? ses : null;
    shut(true);
    const my = gen;
    rm.me = res ? res.me : netUid(); rm.key = res ? res.key : netUid() + netUid();
    rm.state = 'lobby'; rm.inGame = false; rm.list = []; rm.leader = null; rm.chat = []; rm.go = null; net.closeReason = null;
    const t0 = now(), END = res ? 22000 : 16000, MISS = res ? 6 : 3;
    let a = 0, miss = 0, ice = 0, r = null;
    const fatal = e => { netSes(null); if (invite && invite.id === g.id && !invite.host) invite = null; shut(false); netDiag('join-fail', { type: e && e.type, n: a, ms: now() - t0 }); netTrack('party_fail', { game: g.id, why: String(e && e.type || 'unknown').slice(0, 24), n: a, ms: now() - t0, resume: !!res }); throw e; };
    netDiag('join-start', { resume: !!res });
    while (!r) {
      if (a) {
        if (note) note(netT(miss ? 'Party {code} is not open yet, trying again…' : 'Still trying to connect…').replace('{code}', code));
        await nap(Math.min(2000, 400 + 300 * a));
        if (my !== gen) return false;
      }
      a++;
      try { r = await guestConnect(code, my, { relayOnly: ice > 1, noP2p: ice > 0, rtFirst: ice > 0 }); }
      catch (e) {
        if (my !== gen || (e && e.type === 'cancel')) return false;
        const t = e && e.type;
        if (t === 'room-full') fatal(e);
        if (t === 'dup') { rm.me = netUid(); rm.key = netUid() + netUid(); res = null; continue; }
        if (t === 'ice') ice++;
        if (t === 'peer-unavailable') miss++;
        if (now() - t0 > END || miss >= MISS || a >= 7) fatal(e);
        netTrack('party_retry', { game: g.id, why: String(t || 'unknown').slice(0, 24), n: a });
      }
    }
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
    if (mode !== 'room') { rm.name = (rm.renamed && rm.name) || netLoadName() || netName(o.name) || netGuest(); rm.botsOk = !!o.bots && !compat; rm.bots = false; rm.pub = false; }
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
      let jst = { phase: 'idle', code: '', msg: '', who: '' };
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
      const guard = e => { if (e.type === 'keydown' && e.key === 'Escape' && el.querySelector('.gl-inv')) { e.preventDefault(); e.stopPropagation(); invClose(); return; } const t = e.target; if (el.contains(t)) return; if (t && t.closest && !t.closest('#frame') && t.closest('input, textarea, select, button, a, [contenteditable], [role], [tabindex]')) return; e.stopPropagation(); };
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
        document.removeEventListener('gp:pub', onPub);
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
        if (rm.pub && !rm.compat) return `<small>${T('Party')}</small><div class="gl-codebox gl-pubbox"><b class="gl-codetxt gl-pubt${on ? '' : ' gl-pend'}">${NET_I.globe}<span>${T('Public')}</span></b><span class="gl-tools"><button class="gl-sq gl-crown" type="button" data-n="share" title="${shareLbl}" aria-label="${shareLbl}"${on ? '' : ' disabled'}>${NET_I.link}</button></span></div>`;
        return `<small>${T('Party code')}</small><div class="gl-codebox"><b class="gl-codetxt${on ? '' : ' gl-pend'}">${on && hidden ? '••••' : c ? netEsc(c) : '····'}</b><span class="gl-tools"><button class="gl-hide" type="button" data-n="hide" aria-pressed="${hidden}" aria-label="${T(hidden ? 'Show party code' : 'Hide party code')}"${on ? '' : ' disabled'}>${eye()}</button><button class="gl-sq gl-crown" type="button" data-n="share" title="${shareLbl}" aria-label="${shareLbl}"${on ? '' : ' disabled'}>${NET_I.link}</button></span></div>`;
      };
      const head = (lbl, code, n) => `<header class="gl-head"><button class="gl-leave" type="button" data-n="${n || 'back'}">${NET_I.back}<span>${T(lbl)}</span></button><h1>${netEsc(g.title || o.title || 'Online party')}</h1>${code ? '<div class="gl-code"></div>' : ''}</header>`;
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
      const seat = () => {
        if (rm.bots) return `<li class="gl-pl gl-seat gl-botseat"><span class="gl-av" aria-hidden="true">${NET_I.bot}</span><div class="gl-who"><b><i>${T('Bot')}</i></b><span>${T('A bot plays this seat')}</span></div></li>`;
        const can = ready() && !rm.compat;
        return `<li class="gl-pl gl-seat">${can ? `<button class="gl-av gl-addf" type="button" data-n="invf" aria-label="${T('Invite friends')}" title="${T('Invite friends')}">${NET_I.plus}</button>` : `<span class="gl-av" aria-hidden="true">${NET_I.plus}</span>`}<div class="gl-who"><b><i>${T('Empty seat')}</i></b><span>${T(can ? 'Invite a friend' : 'Waiting for a player…')}</span></div></li>`;
      };
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
        screen = s; cache = {}; editing = false;
        if (s !== 'join') note = null;
        if (s === 'lobby') {
          el.innerHTML = `<div class="gl-card gl-lob" tabindex="-1">${head('Leave', true)}<div class="gl-body"><section class="gl-sec gl-plsec" aria-label="${T('Players')}"><div class="gl-sec-h"><h2>${T('Players')}</h2><span class="gl-cnt"></span></div><ul class="gl-players"></ul><div class="gl-bots"></div></section><div class="gl-rule"></div><section class="gl-sec gl-chat" aria-label="${T('Live chat')}"><div class="gl-sec-h"><h2>${T('Live chat')}</h2><span class="gl-pill gl-live">${T('Live')}</span></div><div class="gl-msgs" role="log" aria-live="polite"></div><form class="gl-send" autocomplete="off"><input class="gl-chat-in" maxlength="200" placeholder="${T('Type a message...')}" autocomplete="off" enterkeyhint="send" aria-label="${T('Message')}"><button class="gl-go" type="submit" aria-label="${T('Send')}">${NET_I.send}</button></form></section></div><footer class="gl-foot gl-foot1"><div class="gl-act"></div><p class="gl-hint" role="status"></p></footer></div>`;
          ui.update(); ui.chat(true);
        } else if (s === 'pick') {
          el.innerHTML = `<div class="gl-card gl-pk" tabindex="-1">${head('Back')}<div class="gl-body gl-pkb"><div class="gl-pkr"><button class="gl-pkc" type="button" data-n="gohost"><span class="gl-pki">${NET_I.crown}</span><b>${T('Host a party')}</b><small>${T('Create a party and invite players')}</small></button><button class="gl-pkc" type="button" data-n="gojoin"><span class="gl-pki">${NET_I.users}</span><b>${T('Join a party')}</b><small class="gl-pkn"></small></button></div></div></div>`;
          ui.pick();
        } else if (s === 'host') {
          el.innerHTML = `<div class="gl-card gl-pk" tabindex="-1">${head('Back', false, 'pkback')}<div class="gl-body gl-pkb"><h2 class="gl-pkh">${T('Who can join?')}</h2><div class="gl-pkr"><button class="gl-pkc" type="button" data-n="mkpriv"><span class="gl-pki">${NET_I.lock}</span><b>${T('Private party')}</b><small>${T('Only players with your code or link')}</small></button><button class="gl-pkc" type="button" data-n="mkpub"><span class="gl-pki">${NET_I.globe}</span><b>${T('Public party')}</b><small>${T('Anyone can join, no code needed')}</small></button></div></div></div>`;
        } else if (s === 'join') {
          el.innerHTML = `<div class="gl-card gl-pk gl-jn" tabindex="-1">${head('Back', false, 'pkback')}<div class="gl-body gl-pkb"><div class="gl-jbody"></div></div></div>`;
          ui.join();
        } else if (s === 'ended') {
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('Close')}<div class="gl-body"><div class="gl-center"><p class="gl-msg">${netEsc(ui.endMsg[0])}</p><p class="gl-txt">${netEsc(ui.endMsg[1])}</p></div></div><footer class="gl-foot gl-foot1"><div class="gl-act"><button class="gl-play" type="button" data-n="new">${T('Host or join another party')}</button></div><p class="gl-hint"></p></footer></div>`;
        }
        const c = el.querySelector('.gl-card');
        fit();
        if (!el.contains(document.activeElement)) { try { c.focus({ preventScroll: true }); } catch (e) {} }
      };
      ui.finish = finish;
      const pubs = () => (typeof window.gpPubList === 'function' ? window.gpPubList(g.id) : []).filter(p => !(mode === 'room' && p.c === net.code));
      ui.pick = () => {
        if (done || screen !== 'pick') return;
        const n = pubs().length;
        put('pkn', '.gl-pkn', netEsc(n ? T(n === 1 ? '1 public party open now' : '{n} public parties open now').replace('{n}', n) : T('See open parties or enter a code')));
      };
      ui.join = () => {
        if (done || screen !== 'join') return;
        let h;
        if (jst.phase === 'joining') h = `<div class="gl-center gl-jst"><span class="gl-spin" aria-hidden="true"></span><p class="gl-msg">${netEsc(jst.who ? T('Joining {name}’s party…').replace('{name}', jst.who) : T('Joining the party…'))}</p><p class="gl-txt" role="status">${netEsc(note0 || T('Connecting…'))}</p><div class="gl-jact"><button class="gl-play gl-ghost" type="button" data-n="jcancel">${T('Cancel')}</button></div></div>`;
        else if (jst.phase === 'error') h = `<div class="gl-center gl-jst"><p class="gl-msg">${netEsc(T('Could not join this party'))}</p><p class="gl-txt gl-bad" role="alert">${netEsc(jst.msg)}</p><div class="gl-jact"><button class="gl-play" type="button" data-n="retry">${T('Try again')}</button><button class="gl-play gl-ghost" type="button" data-n="jback">${T('Back to the list')}</button></div></div>`;
        else {
          const L = pubs();
          h = `<div class="gl-pkl"><h2>${T('Available parties')}</h2>` + (L.length ? `<div class="gl-publw">${L.slice(0, 12).map(p => `<button type="button" class="gl-pubj" data-n="pubjoin" data-c="${netEsc(p.c)}" data-h="${netEsc(p.h || '')}"><span class="gl-av" aria-hidden="true">${netEsc(netInit(p.h || '?'))}</span><span class="gl-pubn"><b>${netEsc(p.h ? T('{name}’s party').replace('{name}', p.h) : T('Public party'))}</b><small>${netEsc(T('{n} / {m} joined').replace('{n}', p.n).replace('{m}', p.m))}${p.b ? ' · ' + T('In game') : ''}</small></span><i>${T('Join')}</i></button>`).join('')}</div>` : `<p class="gl-empty">${T('No public parties right now. Host one, or join a private party with its code.')}</p>`) + `</div><div class="gl-jcode"><h2>${T('Have a party code?')}</h2>${joinForm()}</div>`;
        }
        put('jb', '.gl-jbody', h);
      };
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
        const nr = Math.min(8, Math.max(size, L.length, 1));
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
        else if (phase === 'error') { f = `<button class="gl-play" type="button" data-n="retry">${T('Try again')}</button><button class="gl-play gl-ghost" type="button" data-n="new">${T('Back')}</button>`; hint = err; bad = true; }
        else if (amLead) {
          const blocked = rm.busy && net.role !== 'host';
          hint = rm.reconn ? T('Connection lost. Reconnecting…') : blocked ? T('A game is in progress. You can start when it ends.') : n < need ? T(need - n > 1 ? 'Waiting for {n} more players…' : 'Waiting for 1 more player…').replace('{n}', need - n) : '';
          f = `<button class="gl-play" type="button" data-n="play"${n < need || blocked || rm.reconn ? ' disabled' : ''}>${NET_I.play}${T('Play')}</button>`;
        } else f = `<div class="gl-wait" role="status">${T(rm.reconn ? 'Connection lost. Reconnecting…' : rm.busy ? 'A game is in progress. You will join the next one.' : 'Waiting for the host…')}</div>`;
        if (!hint && on && net.role === 'guest' && rm.via === 'rt-relay' && !rm.reconn) hint = T('Connected through the relay. Fast games may feel a little slower.');
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
        bx.innerHTML = rm.chat.length ? rm.chat.map((m, i) => m.s ? `<div class="gl-m gl-sys${i >= n0 ? ' gl-new' : ''}"><p>${netEsc(m.k ? T(m.k).replace('{name}', m.a) : m.x)} · <time>${netHm(m.t)}</time></p></div>` : `<div class="gl-m${m.i === rm.me ? ' gl-me' : ''}${i >= n0 ? ' gl-new' : ''}"><b>${netEsc(m.n)}</b><time>${netHm(m.t)}</time><p>${netEsc(m.x)}</p></div>`).join('') : `<p class="gl-empty">${T('No messages yet. Say hi!')}<br><small>${T('Chat is visible to admins.')}</small></p>`;
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
      const fail = (m, fn) => {
        phase = 'error'; err = m; again = fn;
        if (fn && fn.code) { jst = { phase: 'error', code: fn.code, msg: m, who: jst.who }; if (screen !== 'join') show('join'); else { cache = {}; ui.join(); } return; }
        if (screen !== 'lobby') show('lobby'); else { cache = {}; ui.update(); }
      };
      const hosting = async res => {
        const my = ++op;
        if (res && res.h && cfg.sizes.indexOf(Math.round(+res.h.max)) >= 0) pick = Math.round(+res.h.max);
        phase = 'creating'; err = ''; again = null; note0 = res ? T('Restoring party {code}…').replace('{code}', res.code) : '';
        note = t => { if (!done && my === op) { note0 = t; ui.update(); } };
        if (res && res.h) rm.pub = !!res.h.pub && !rm.compat;
        show('lobby');
        try {
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes;
          const code = await roomHost(res);
          if (done || my !== op || !code) return;
          note = null; note0 = '';
          rm.min = cfg.min; rm.max = Math.max(pick, rm.guests.size + 1); rm.sizes = cfg.sizes; phase = 'ready'; cache = {};
          if (res && res.h && res.code === code) { rm.bots = !!(res.h.bots && rm.botsOk); rm.pub = !!res.h.pub && !rm.compat; }
          pushList();
          netTrack('party_create', { game: g.id, size: pick, pub: rm.pub ? 1 : 0, peer: peer ? 1 : 0, rt: rm.door ? 1 : 0 });
        } catch (e) { if (!done && my === op && !(e && e.type === 'cancel')) { note = null; netTrack('party_fail', { game: g.id, why: 'host:' + String(e && e.type || 'unknown').slice(0, 18) }); fail(netWhy(e), hosting); } }
      };
      const joining = async (code, who) => {
        code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^[A-Z0-9]{4}$/.test(code)) { const f = el.querySelector('.gl-join'), i = f && f.querySelector('input'); if (f) { f.classList.add('gl-bad'); try { i.focus({ preventScroll: true }); } catch (e) {} } return; }
        if (ready() && code === net.code) { if (screen !== 'lobby') show('lobby'); return; }
        if (phase === 'joining' && again && again.code === code) return;
        const ses = netSes();
        if (ses && ses.g === g.id && ses.code === code && ses.role === 'host' && mode !== 'room') { if (invite && invite.id === g.id) invite = null; return hosting(ses); }
        const resume = !!(ses && ses.g === g.id && ses.code === code && ses.role === 'guest');
        const my = ++op, fn = () => joining(code, who);
        fn.code = code;
        const jt0 = Date.now();
        phase = 'joining'; err = ''; again = fn; note0 = '';
        jst = { phase: 'joining', code, msg: '', who: netName(who) || '' };
        note = t => { if (!done && my === op) { note0 = t; cache = {}; ui.join(); } };
        rm.botsOk = false; rm.bots = false;
        if (screen !== 'join') show('join'); else { cache = {}; ui.join(); }
        try {
          const ok = await roomJoin(code);
          if (done || my !== op || !ok) return;
          note = null; note0 = ''; phase = 'ready'; cache = {}; jst = { phase: 'idle', code: '', msg: '', who: '' };
          { const ms = Date.now() - jt0, via = rm.via, c = rm.conn; Promise.race([netTurn(c), new Promise(r => setTimeout(() => r(0), 1500))]).then(turn => netTrack('party_join', { game: g.id, via, ms, turn })); }
          show('lobby'); fit();
        } catch (e) {
          const t = e && e.type;
          if (done || my !== op || t === 'cancel') return;
          note = null;
          if (resume && t === 'peer-unavailable') return ui.ended('host-left');
          fail(t === 'room-full' ? T('Party {code} is full.').replace('{code}', code) : netWhy(e, rm.pub || jst.who ? '' : code), fn);
        }
      };
      const unjoin = () => { if (invite && invite.id === g.id && !invite.host) invite = null; op++; note = null; note0 = ''; phase = ''; again = null; jst = { phase: 'idle', code: '', msg: '', who: '' }; shut(true); };
      const fresh = () => { rm.botsOk = !!o.bots && !rm.compat; rm.bots = false; rm.pub = false; rows = 0; phase = ''; again = null; jst = { phase: 'idle', code: '', msg: '', who: '' }; show('pick'); };
      const play = () => {
        if (done || screen !== 'lobby' || net.role !== 'host' || mode !== 'room' || rm.state === 'game') return;
        const players = hostPlayers().filter(p => !p.away);
        if (players.length < (rm.bots ? 1 : rm.min)) return;
        rm.state = 'game';
        const ids = new Set(players.map(p => p.id));
        rm.guests.forEach(gs => { gs.inGame = ids.has(gs.id); });
        const lead = leaderId(), bots = !!(rm.botsOk && rm.bots);
        const out = players.map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.id === lead }));
        rm.go = { __go: out, size: rm.max, leader: lead, bots };
        rm.guests.forEach(gs => { if (gs.inGame) tx(gs.conn, rm.go); });
        pushList();
        netTrack('party_play', { game: g.id, players: out.length, size: rm.max, bots, pub: rm.pub ? 1 : 0, via: net.role === 'host' ? 'host' : rm.via });
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
        if (typeof gpChatLog === 'function') gpChatLog('party', g.id, net.code, v);
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
        if (e.target.classList && e.target.classList.contains('gl-inv')) { invClose(); return; }
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
        else if (n === 'pubjoin') { const c = b.dataset.c; if (c) joining(c, b.dataset.h); }
        else if (n === 'gohost') { if (rm.compat) { rm.pub = false; hosting(); } else show('host'); }
        else if (n === 'gojoin') { jst = { phase: 'idle', code: '', msg: '', who: '' }; show('join'); }
        else if (n === 'pkback') { if (phase === 'joining' || jst.phase !== 'idle') unjoin(); show('pick'); }
        else if (n === 'jcancel' || n === 'jback') { unjoin(); show('join'); }
        else if (n === 'mkpriv' || n === 'mkpub') { rm.pub = n === 'mkpub' && !rm.compat; hosting(); }
        else if (n === 'invf') invOpen();
        else if (n === 'invx') invClose();
        else if (n === 'invcopy') shareLink();
        else if (n === 'invsign') { finish(null); if (typeof window.gpParty === 'object' && window.gpParty) window.gpParty.signIn(); }
        else if (n === 'inv') invSend(b);
        else if (n === 'play') {
          if (net.role === 'host') return leadAct('play');
          leadAct('play'); b.disabled = true; cache.ft = '';
          clearTimeout(playT); playT = setTimeout(() => ui.update(), 3000);
        }
      });
      const invClose = () => { const x = el.querySelector('.gl-inv'); if (x) x.remove(); const b = el.querySelector('.gl-addf'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} };
      const invOpen = () => {
        invClose();
        const P = typeof window.gpParty === 'object' && window.gpParty ? window.gpParty : null, card = el.querySelector('.gl-card');
        if (!card || !ready()) return;
        const signed = !!(P && P.signed()), F = signed ? P.friends() : [];
        const body = !P || !signed ? `<p class="gl-invt">${T('Sign in to invite friends.')}</p><div class="gl-inva">${P ? `<button class="gl-play" type="button" data-n="invsign">${T('Sign in')}</button>` : ''}<button class="gl-play gl-ghost" type="button" data-n="invcopy">${shareLbl}</button></div>`
          : !F.length ? `<p class="gl-invt">${T('No friends yet.')}</p><div class="gl-inva"><button class="gl-play gl-ghost" type="button" data-n="invcopy">${shareLbl}</button></div>`
          : `<ul class="gl-invl">${F.map(f => `<li><span class="gl-av${f.on ? ' gl-on2' : ''}" aria-hidden="true">${netEsc(netInit(f.name))}</span><div class="gl-who"><b><i>${netEsc(f.name)}</i></b><span>${netEsc(f.status)}</span></div><button class="gl-jbtn" type="button" data-n="inv" data-id="${netEsc(f.id)}">${T('Invite')}</button></li>`).join('')}</ul><div class="gl-inva"><button class="gl-play gl-ghost" type="button" data-n="invcopy">${shareLbl}</button></div>`;
        card.insertAdjacentHTML('beforeend', `<div class="gl-inv" role="dialog" aria-label="${T('Invite friends')}"><div class="gl-invc"><div class="gl-invh"><h2>${T('Invite friends')}</h2><button class="gl-sq gl-kick" type="button" data-n="invx" aria-label="${T('Close')}">${NET_I.x}</button></div>${body}<p class="gl-invn" role="status"></p></div></div>`);
        const f = el.querySelector('.gl-inv [data-n=inv], .gl-inv .gl-play'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
      };
      const invSend = async b => {
        const P = window.gpParty, n = el.querySelector('.gl-invn');
        if (!P || !ready() || b.disabled) return;
        b.disabled = true; b.textContent = T('Sending…');
        try { await P.invite(b.dataset.id); b.textContent = T('Invited'); b.classList.add('gl-done'); if (n) n.textContent = ''; }
        catch (e) { b.disabled = false; b.textContent = T('Invite'); if (n) n.textContent = P.err(e); }
      };
      const onPub = () => { if (!done) { ui.pick(); if (jst.phase === 'idle') ui.join(); } };
      document.addEventListener('gp:pub', onPub);
      el.addEventListener('submit', e => {
        e.preventDefault();
        if (e.target.matches('.gl-send')) sendChat();
        else if (e.target.matches('.gl-join')) joining(e.target.querySelector('input').value);
      });
      ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'wheel', 'contextmenu'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
      el.addEventListener('keydown', e => {
        if (e.key === 'Escape' && el.querySelector('.gl-inv')) { e.preventDefault(); invClose(); return; }
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
      if (mode === 'room' && net.role === 'host' && ((peer && !peer.destroyed) || rm.door)) {
        rm.min = cfg.min; rm.sizes = cfg.sizes; rm.state = 'lobby'; phase = 'ready';
        if (cfg.sizes.indexOf(rm.max) < 0) rm.max = cfg.sizes.find(s => s >= rm.guests.size + 1) || cfg.sizes[cfg.sizes.length - 1];
        rm.guests.forEach(gs => { gs.inGame = false; tx(gs.conn, { __lob: 1 }); });
        pushList();
        show('lobby');
      } else if (mode === 'room' && net.role === 'guest' && (rm.conn || rm.reconn)) { phase = 'ready'; show('lobby'); }
      else if (net.invite && !invite.host) joining(net.invite);
      else { const ho = !!(invite && invite.host && invite.id === g.id); if (ho) invite = null; const ses = ho ? netSes() : null; if (ho) { rm.pub = false; hosting(ses && ses.g === g.id && ses.role === 'host' ? ses : undefined); } else if (o.intent === 'host' && !rm.compat) show('host'); else if (o.intent === 'join') show('join'); else show('pick'); }
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
        return !!((peer && !peer.destroyed) || rm.door);
      }
      return !!(conn && conn.open);
    },
    get invite() {
      if (!resumed) {
        resumed = true;
        const o = !invite && mode === null ? netSes() : null;
        if (o && o.g === g.id) invite = { id: g.id, code: o.role === 'guest' ? o.code : null, host: o.role === 'host' };
      }
      return invite && invite.id === g.id ? invite.host ? 'NEW' : invite.code : null;
    },
    on(t, fn) { (ls[t] = ls[t] || []).push(fn); const off = () => { ls[t] = (ls[t] || []).filter(f => f !== fn); }; add(off); return off; },
    send(msg, fast) {
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return; }
      if (s === undefined) return;
      let b = null;
      const one = c => { if (fast && fastTx(c, s)) return; if (fast && c && c.slow) return slowFast(c, msg); if (!b && s.length < 16000) b = netTe.encode(s); tx(c, msg, s, b); };
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
      if (fast && fastTx(c, s)) return true;
      if (fast && c.slow) { slowFast(c, msg); return true; }
      return tx(c, msg, s);
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
  const onHide = () => { shut(true, !!mode); };
  const onShow = e => { if (e.persisted && netSes()) location.reload(); };
  window.addEventListener('pagehide', onHide);
  window.addEventListener('pageshow', onShow);
  window.addEventListener('online', revive);
  document.addEventListener('visibilitychange', onVis);
  add(() => { window.removeEventListener('pagehide', onHide); window.removeEventListener('pageshow', onShow); window.removeEventListener('online', revive); document.removeEventListener('visibilitychange', onVis); });
  add(() => shut(true));
  return net;
}
