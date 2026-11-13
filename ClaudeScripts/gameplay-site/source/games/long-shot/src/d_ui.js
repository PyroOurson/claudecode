const LS_CSS = `
.gm-long-shot{gap:0;font-family:Nunito,"Segoe UI",system-ui,-apple-system,Roboto,sans-serif}
.gm-long-shot *{box-sizing:border-box}
.gm-long-shot [hidden]{display:none!important}
.gm-long-shot .ls{position:relative;overflow:hidden;border-radius:18px;margin:0 auto;max-width:100%;background:#070b1f;box-shadow:0 14px 40px -18px rgba(5,8,30,.8);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gm-long-shot .ls-st{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;color:#eef2ff}
.gm-long-shot .ls-cv{position:absolute;left:0;top:0;display:block}
.gm-long-shot .ls-hud{position:absolute;left:14px;right:14px;top:12px;height:40px;display:flex;align-items:center;gap:10px;z-index:5;pointer-events:none}
.gm-long-shot .ls-chip{flex:none;padding:7px 13px;border-radius:12px;background:rgba(10,14,40,.62);border:1px solid rgba(150,170,255,.22);font-weight:900;font-size:13px;letter-spacing:.02em;white-space:nowrap}
.gm-long-shot .ls-chip i{font-style:normal;color:#ffd28a}
.gm-long-shot .ls-dots{flex:1;display:flex;justify-content:center;gap:6px;min-width:0}
.gm-long-shot .ls-dots span{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);display:grid;place-items:center;font-size:10px;font-weight:900;color:#0b1130}
.gm-long-shot .ls-dots span.on{border-color:#ffd28a;box-shadow:0 0 0 3px rgba(255,210,138,.25)}
.gm-long-shot .ls-dots span.fuel{width:26px;height:16px;border-radius:5px;background:linear-gradient(#7ad7ff,#2f7fd8);border-color:#bfe9ff}
.gm-long-shot .ls-dots span.fuel.out{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)}
.gm-long-shot .ls-score{flex:none;text-align:right;line-height:1.05;padding:5px 12px;border-radius:12px;background:rgba(10,14,40,.62);border:1px solid rgba(150,170,255,.22)}
.gm-long-shot .ls-score b{display:block;font-size:19px;font-weight:900}
.gm-long-shot .ls-score small{display:block;font-size:11.5px;font-weight:800;color:#ffd28a;white-space:nowrap}
.gm-long-shot .ls-q{position:absolute;left:50%;top:62px;width:660px;margin-left:-330px;z-index:6;padding:16px 20px 14px;border-radius:20px;background:linear-gradient(rgba(22,28,66,.9),rgba(12,16,44,.88));border:1px solid rgba(150,170,255,.28);box-shadow:0 18px 50px -20px rgba(0,0,0,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.gm-long-shot .ls-q.in{animation:ls-in .35s cubic-bezier(.2,.9,.3,1.2)}
.gm-long-shot .ls-qk{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#8fb6ff;margin-bottom:6px}
.gm-long-shot .ls-qt{font-size:31px;font-weight:900;line-height:1.15;letter-spacing:-.01em;min-height:36px;text-wrap:balance;transition:filter .2s}
.gm-long-shot .ls-st.paused .ls-qt,.gm-long-shot .ls-st.paused .ls-in{filter:blur(9px)}
.gm-long-shot .ls-tm{position:relative;height:10px;margin:12px 0 12px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden}
.gm-long-shot .ls-tm i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;border-radius:6px;background:linear-gradient(90deg,#7ad7ff,#ffb45a)}
.gm-long-shot .ls-tm.done{opacity:.35}
.gm-long-shot .ls-tm.low i{background:linear-gradient(90deg,#ff5d5d,#ff9a5a)}
.gm-long-shot .ls-secs{font-variant-numeric:tabular-nums;color:#fff;font-size:15px;letter-spacing:0}
.gm-long-shot .ls-secs.low{color:#ff8f8f;animation:ls-pulse .5s infinite alternate}
.gm-long-shot .ls-f{display:flex;gap:8px}
.gm-long-shot .ls-in{flex:1;min-width:0;height:52px;padding:0 16px;border-radius:14px;border:2px solid rgba(150,170,255,.35);background:rgba(4,7,24,.75);color:#fff;font-weight:800;font-size:22px;line-height:1;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
.gm-long-shot .ls-in:focus{border-color:#7ad7ff;box-shadow:0 0 0 4px rgba(122,215,255,.18)}
.gm-long-shot .ls-in::placeholder{color:rgba(200,210,255,.45);font-weight:700}
.gm-long-shot .ls-in.shake{animation:ls-shake .32s;border-color:#ff6b6b}
.gm-long-shot .ls-in.locked{border-color:rgba(255,210,138,.5)}
.gm-long-shot .ls-go{flex:none;height:52px;padding:0 22px;border:0;border-radius:14px;background:linear-gradient(#ffc46b,#ff8a3d);color:#2a1300;font-weight:900;font-size:18px;line-height:1;font-family:inherit;cursor:pointer;box-shadow:0 4px 0 #b8541b}
.gm-long-shot .ls-go:active{transform:translateY(2px);box-shadow:0 2px 0 #b8541b}
.gm-long-shot .ls-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px;min-height:26px}
.gm-long-shot .ls-fb{flex:1;font-size:14.5px;font-weight:800;color:#c9d3ff;min-height:20px}
.gm-long-shot .ls-fb.bad{color:#ff9b9b}
.gm-long-shot .ls-pass{flex:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#dfe5ff;border-radius:10px;padding:6px 12px;font-weight:800;font-size:13px;line-height:1;font-family:inherit;cursor:pointer}
.gm-long-shot .ls-pass:hover{background:rgba(255,255,255,.12)}
.gm-long-shot .ls-res{display:flex;align-items:center;gap:12px;min-height:50px;margin-top:9px;padding:6px 6px 6px 16px;border-radius:14px;background:rgba(4,7,24,.7);border:2px solid rgba(255,210,138,.45);animation:ls-in .3s}
.gm-long-shot .ls-res .nm{flex:1;min-width:0;font-size:22px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-res .pt{font-size:22px;font-weight:900;color:#ffd28a;min-width:64px;text-align:right;padding-right:10px}
.gm-long-shot .ls-res.miss{border-color:rgba(255,120,120,.4)}
.gm-long-shot .ls-res.miss .nm{color:#ffb0b0}
.gm-long-shot .ls-tier{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-weight:900;font-size:13px;color:#0b1130;white-space:nowrap}
.gm-long-shot .ls-tier small{font-weight:800;font-size:12px;opacity:.8}
.gm-long-shot .ls-tier.scan{background:rgba(255,255,255,.12)!important;color:#cfd8ff;animation:ls-pulse .35s infinite alternate}
.gm-long-shot .ls-lk{display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:12px;font-weight:800;color:#c9d3ff}
.gm-long-shot .ls-lk i{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;font-style:normal;font-size:10px;font-weight:900;background:rgba(255,255,255,.12);color:#dfe5ff;border:2px solid transparent}
.gm-long-shot .ls-lk i.ok{background:#36d6a0;color:#06261b;border-color:#bdf5df}
.gm-long-shot .ls-opp{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#dfe5ff}
.gm-long-shot .ls-opp .av{width:22px;height:22px;border-radius:50%;display:inline-grid;place-items:center;font-size:10px;font-weight:900;color:#fff}
.gm-long-shot .ls-pop{position:absolute;z-index:7;left:0;top:0;transform:translate(-50%,-50%);pointer-events:none;text-align:center;font-weight:900;white-space:nowrap;opacity:0}
.gm-long-shot .ls-pop.go{animation:ls-pop 1.6s ease-out forwards}
.gm-long-shot .ls-pop b{display:block;font-size:30px;text-shadow:0 3px 14px rgba(0,0,0,.6)}
.gm-long-shot .ls-pop span{display:block;font-size:20px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.gm-long-shot .ls-pane{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(4,6,20,.55)}
.gm-long-shot .ls-pane.clear{background:transparent;pointer-events:none}
.gm-long-shot .ls-pane.clear .ls-box,.gm-long-shot .ls-pane.clear .ls-rv{pointer-events:auto}
.gm-long-shot .ls-pane.low{align-items:flex-start;padding-bottom:40px}
.gm-long-shot .ls-box{width:100%;max-width:640px;max-height:100%;overflow:auto;overscroll-behavior:contain;padding:22px 24px 20px;border-radius:24px;background:linear-gradient(rgba(24,30,72,.96),rgba(12,16,46,.96));border:1px solid rgba(150,170,255,.3);box-shadow:0 24px 70px -20px rgba(0,0,0,.85);text-align:center;scrollbar-width:thin}
.gm-long-shot .ls-box.wide{max-width:780px}
.gm-long-shot .ls-box h2{margin:2px 0 4px;font-size:30px;font-weight:900;letter-spacing:-.01em}
.gm-long-shot .ls-box h3{margin:14px 0 6px;font-size:15px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#8fb6ff}
.gm-long-shot .ls-box p{margin:6px 0;font-size:15px;line-height:1.45;color:#d8def9}
.gm-long-shot .ls-kick{font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#ffd28a}
.gm-long-shot .ls-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin:2px 0 6px}
.gm-long-shot .ls-logo b{font-size:44px;font-weight:900;letter-spacing:-.02em;line-height:1;background:linear-gradient(#fff,#ffd28a);-webkit-background-clip:text;background-clip:text;color:transparent}
.gm-long-shot .ls-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;min-height:50px;margin:9px 0 0;padding:9px 16px;border:0;border-radius:15px;font-weight:900;font-size:17px;line-height:1.1;font-family:inherit;color:#fff;cursor:pointer;background:#3a4380;box-shadow:0 4px 0 rgba(0,0,0,.35)}
.gm-long-shot .ls-btn:hover{filter:brightness(1.1)}
.gm-long-shot .ls-btn:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
.gm-long-shot .ls-btn small{display:block;font-size:12.5px;font-weight:700;opacity:.85}
.gm-long-shot .ls-btn.hot{background:linear-gradient(#ffc46b,#ff8a3d);color:#2a1300;box-shadow:0 4px 0 #b8541b}
.gm-long-shot .ls-btn.blue{background:linear-gradient(#4aa8ff,#2f6fd8)}
.gm-long-shot .ls-btn.teal{background:linear-gradient(#36d6a0,#1f9c74);color:#04241a}
.gm-long-shot .ls-btn.vio{background:linear-gradient(#b77dff,#7d4fd6)}
.gm-long-shot .ls-btn.ghost{background:rgba(255,255,255,.08);box-shadow:none;border:1px solid rgba(255,255,255,.2);font-size:15px;min-height:42px}
.gm-long-shot .ls-btn:disabled{opacity:.45;pointer-events:none}
.gm-long-shot .ls-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:9px}
.gm-long-shot .ls-grid .ls-btn{margin:0}
.gm-long-shot .ls-pair{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}
.gm-long-shot .ls-pair .ls-btn{margin:0}
.gm-long-shot .ls-stats{display:flex;justify-content:center;gap:8px;margin:12px 0 2px;flex-wrap:wrap}
.gm-long-shot .ls-stats div{min-width:92px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
.gm-long-shot .ls-stats b{display:block;font-size:20px;font-weight:900}
.gm-long-shot .ls-stats span{display:block;font-size:11.5px;font-weight:800;color:#aab6e8;text-transform:uppercase;letter-spacing:.06em}
.gm-long-shot .ls-note{margin-top:12px;font-size:12.5px;font-weight:700;color:#98a4d6}
.gm-long-shot .ls-note i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#ffb45a;vertical-align:1px}
.gm-long-shot .ls-note i.live{background:#36d6a0;box-shadow:0 0 0 3px rgba(54,214,160,.25)}
.gm-long-shot .ls-seg{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0}
.gm-long-shot .ls-seg button{min-width:52px;height:38px;padding:0 12px;border-radius:11px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-weight:800;font-size:14px;line-height:1;font-family:inherit;cursor:pointer}
.gm-long-shot .ls-seg button.on{background:#ffd28a;border-color:#ffd28a;color:#22243f}
.gm-long-shot .ls-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0;text-align:left}
.gm-long-shot .ls-opt>span{font-size:14px;font-weight:800;color:#e9ecff}
.gm-long-shot .ls-big{font-size:46px;font-weight:900;line-height:1.05;margin:6px 0 2px;letter-spacing:-.02em}
.gm-long-shot .ls-zone{font-size:17px;font-weight:900;color:#ffd28a}
.gm-long-shot .ls-sheet{margin:14px 0 4px;text-align:left;display:flex;flex-direction:column;gap:6px}
.gm-long-shot .ls-it{border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);overflow:hidden}
.gm-long-shot .ls-it>button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:26px 1fr auto 52px;align-items:center;gap:10px;width:100%;padding:9px 12px;cursor:pointer}
.gm-long-shot .ls-it>button:focus-visible{outline:2px solid #7ad7ff;outline-offset:-2px}
.gm-long-shot .ls-it .n{font-size:12px;font-weight:900;color:#8fb6ff;text-align:center}
.gm-long-shot .ls-it .q{font-size:12.5px;font-weight:800;color:#aab6e8;line-height:1.2}
.gm-long-shot .ls-it .a{display:block;font-size:16px;font-weight:900;color:#fff;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-it .a.miss{color:#ff9b9b}
.gm-long-shot .ls-it .p{font-size:18px;font-weight:900;color:#ffd28a;text-align:right}
.gm-long-shot .ls-it .x{padding:0 12px 10px 48px;font-size:13px;color:#c9d3ff;line-height:1.45}
.gm-long-shot .ls-it .x b{color:#fff}
.gm-long-shot .ls-it .x em{font-style:normal;color:#ffd28a;font-weight:800}
.gm-long-shot .ls-rv{width:100%;max-width:560px;max-height:100%;overflow:auto;padding:16px 18px;border-radius:22px;background:linear-gradient(rgba(24,30,72,.95),rgba(12,16,46,.95));border:1px solid rgba(150,170,255,.3);box-shadow:0 24px 70px -20px rgba(0,0,0,.85);animation:ls-in .3s}
.gm-long-shot .ls-rv.two{max-width:860px}
.gm-long-shot .ls-rv.two .ls-list{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
.gm-long-shot .ls-rvq{font-size:13px;font-weight:900;color:#8fb6ff;text-transform:uppercase;letter-spacing:.08em;text-align:center}
.gm-long-shot .ls-rvt{font-size:21px;font-weight:900;text-align:center;margin:2px 0 10px}
.gm-long-shot .ls-pl{display:grid;grid-template-columns:28px 1fr auto 46px 54px;align-items:center;gap:8px;padding:7px 10px;border-radius:12px;background:rgba(255,255,255,.05);margin-top:5px;animation:ls-in .3s both}
.gm-long-shot .ls-pl.me{background:rgba(255,210,138,.12);border:1px solid rgba(255,210,138,.35)}
.gm-long-shot .ls-pl .av{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;color:#fff}
.gm-long-shot .ls-pl .nm{min-width:0;overflow:hidden}
.gm-long-shot .ls-pl .nm b{display:block;font-size:14px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-pl .nm span{display:block;font-size:12.5px;font-weight:800;color:#c9d3ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-pl .pt{font-size:16px;font-weight:900;color:#ffd28a;text-align:right}
.gm-long-shot .ls-pl .tot{font-size:16px;font-weight:900;text-align:right}
.gm-long-shot .ls-card{display:block;width:100%;max-width:300px;margin:8px auto 4px;border-radius:16px;box-shadow:0 12px 30px -10px rgba(0,0,0,.7)}
.gm-long-shot .ls-share{font-size:13px;font-weight:800;color:#c9d3ff;white-space:pre-line;margin:6px 0}
.gm-long-shot .ls-tl{display:flex;justify-content:center;gap:6px;margin:10px 0 4px;flex-wrap:wrap}
.gm-long-shot .ls-tl span{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:900;color:#0b1130}
.gm-long-shot .ls-bars{display:flex;flex-direction:column;gap:4px;margin:8px auto 0;max-width:360px;text-align:left}
.gm-long-shot .ls-bars div{display:grid;grid-template-columns:96px 1fr 38px;align-items:center;gap:8px;font-size:12.5px;font-weight:800}
.gm-long-shot .ls-bars i{display:block;height:10px;border-radius:6px;min-width:3px}
.gm-long-shot .ls-st.port .ls-hud{left:8px;right:8px;top:8px;height:36px;gap:6px}
.gm-long-shot .ls-st.port .ls-chip{padding:6px 9px;font-size:12px}
.gm-long-shot .ls-st.port .ls-dots{gap:3px}
.gm-long-shot .ls-st.port .ls-dots span{width:17px;height:17px;font-size:8px}
.gm-long-shot .ls-st.port .ls-dots span.fuel{width:20px;height:13px}
.gm-long-shot .ls-st.port .ls-score{padding:4px 9px}
.gm-long-shot .ls-st.port .ls-score b{font-size:16px}
.gm-long-shot .ls-st.port .ls-score small{font-size:10.5px}
.gm-long-shot .ls-st.port .ls-q{left:8px;right:8px;width:auto;margin-left:0;top:52px;padding:12px 12px 10px;border-radius:18px}
.gm-long-shot .ls-st.port .ls-qt{font-size:25px}
.gm-long-shot .ls-st.port .ls-in{height:48px;font-size:19px;padding:0 12px}
.gm-long-shot .ls-st.port .ls-go{height:48px;padding:0 14px;font-size:16px}
.gm-long-shot .ls-st.port .ls-res .nm{font-size:18px}
.gm-long-shot .ls-st.port .ls-res .pt{font-size:18px;min-width:50px}
.gm-long-shot .ls-st.port .ls-pane{padding:10px;align-items:flex-start}
.gm-long-shot .ls-st.port .ls-box{padding:16px 14px 14px;border-radius:20px}
.gm-long-shot .ls-st.port .ls-box h2{font-size:25px}
.gm-long-shot .ls-st.port .ls-logo b{font-size:36px}
.gm-long-shot .ls-st.port .ls-grid{grid-template-columns:1fr}
.gm-long-shot .ls-st.port .ls-big{font-size:36px}
.gm-long-shot .ls-st.port .ls-it>button{grid-template-columns:20px 1fr auto 40px;gap:7px;padding:8px 9px}
.gm-long-shot .ls-st.port .ls-it .x{padding:0 10px 9px 36px}
.gm-long-shot .ls-st.port .ls-pl{grid-template-columns:24px 1fr auto 38px 44px;gap:6px;padding:6px 8px}
.gm-long-shot .ls-st.port .ls-pl .av{width:24px;height:24px}
.gm-long-shot .ls-st.port .ls-tier{padding:4px 8px;font-size:11.5px}
.gm-long-shot .ls-st.port .ls-rv{padding:12px}
@keyframes ls-in{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
.gm-long-shot .ls-q.in{animation-name:ls-qin}
@keyframes ls-qin{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
@keyframes ls-pulse{from{opacity:1}to{opacity:.55}}
@keyframes ls-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}
@keyframes ls-pop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.12)}30%{transform:translate(-50%,-65%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
@media (prefers-reduced-motion:reduce){.gm-long-shot .ls-q.in,.gm-long-shot .ls-res,.gm-long-shot .ls-pl,.gm-long-shot .ls-rv{animation:none}}
`;
const LS_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="46" cy="18" r="9"/><path d="M8 50c10-4 18-10 26-18"/><path d="M20 44l-8 8M26 40l-4 12M28 36l12-4"/><circle cx="16" cy="12" r="1.5"/><circle cx="54" cy="44" r="1.5"/><circle cx="34" cy="54" r="1.5"/></svg>';
const lsTierPill = (t, sh) => t < 0 ? `<span class="ls-tier" style="background:${LS_MISS.c};color:#fff">${lsEsc(T(LS_MISS.n))}</span>` : `<span class="ls-tier" style="background:${LS_TIERS[t].c}">${lsEsc(T(LS_TIERS[t].n))}${sh != null ? ` <small>${lsEsc(lsPct(sh))}</small>` : ''}</span>`;
const LS_AVC = ['#ff7a59', '#4aa8ff', '#36d6a0', '#b77dff', '#ffb45a', '#ff5d8f', '#2ec4d6', '#9ccc3c', '#f06292', '#7986cb', '#ffa726', '#26a69a', '#ab47bc', '#ef5350', '#5c6bc0', '#66bb6a'];
const lsAv = (name, i) => `<span class="av" style="background:${LS_AVC[i % LS_AVC.length]}">${lsEsc(String(name || '?').replace(/^Bot\s+/, '').slice(0, 1).toUpperCase())}</span>`;
function lsBuild(G) {
  const root = G.root, wrap = document.createElement('div'), st = document.createElement('div'), cv = document.createElement('canvas');
  wrap.className = 'ls'; st.className = 'ls-st'; cv.className = 'ls-cv';
  st.append(cv);
  st.insertAdjacentHTML('beforeend', `
<div class="ls-hud" data-r="hud" hidden><div class="ls-chip" data-r="chip"></div><div class="ls-dots" data-r="dots"></div><div class="ls-score"><b data-r="pts">0</b><small data-r="dist"></small></div></div>
<div class="ls-q" data-r="q" hidden>
 <div class="ls-qk"><span data-r="qk"></span><span class="ls-secs" data-r="secs"></span></div>
 <div class="ls-qt" data-r="qt"></div>
 <div class="ls-tm" data-r="tm"><i data-r="bar"></i></div>
 <form class="ls-f" data-r="form" autocomplete="off"><input class="ls-in" data-r="in" type="text" maxlength="48" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label=""><button class="ls-go" type="submit" data-r="go"></button></form>
 <div class="ls-res" data-r="res" hidden></div>
 <div class="ls-row"><div class="ls-fb" data-r="fb" aria-live="polite"></div><div class="ls-lk" data-r="lk" hidden></div><button class="ls-pass" type="button" data-act="pass" data-r="pass"></button></div>
</div>
<div class="ls-pop" data-r="pop"></div>
<div class="ls-pane" data-r="pane" hidden></div>`);
  wrap.append(st); root.append(wrap);
  G.wrap = wrap; G.st = st; G.cv = cv;
  const q = n => st.querySelector('[data-r="' + n + '"]');
  ['hud', 'chip', 'dots', 'pts', 'dist', 'q', 'qk', 'secs', 'qt', 'tm', 'bar', 'form', 'in', 'go', 'res', 'fb', 'lk', 'pass', 'pop', 'pane'].forEach(n => { G['$' + n] = q(n); });
  G.scene = lsScene(cv);
}
function lsTexts(G) {
  G.$go.textContent = T('Launch');
  G.$pass.textContent = T('Pass');
  G.$in.placeholder = T('Type your answer…');
  G.$in.setAttribute('aria-label', T('Your answer'));
  const L = {};
  LS_BODIES.forEach(b => { L[b.n] = T(b.n); });
  ['Termination shock', 'Heliopause', 'Voyager 1'].forEach(n => { L[n] = T(n); });
  L.next = T('Next: {name}');
  G.scene.labels = L; G.scene.lang = lsLang(); G.scene.nextKey = '';
}
function lsFit(G, force) {
  const port = (G.root.clientWidth || 800) < 640;
  if (force || port !== G.port) {
    G.port = port; G.W = port ? 400 : 960; G.H = port ? 720 : 600;
    G.wrap.style.width = `min(100%, ${G.W}px, calc((100dvh - var(--goff, 250px)) * ${(G.W / G.H).toFixed(4)}))`;
    G.wrap.style.aspectRatio = `${G.W} / ${G.H}`;
    G.st.style.width = G.W + 'px'; G.st.style.height = G.H + 'px';
    G.st.classList.toggle('port', port);
  }
  const w = G.wrap.clientWidth || G.W, s = w / G.W;
  G.st.style.transform = `scale(${s})`;
  const k = Math.max(1, Math.min(2.5, s * (window.devicePixelRatio || 1)));
  if (force || Math.abs(k - G.scene.k) > .05 || G.scene.W !== G.W || G.scene.H !== G.H || G.scene.port !== port) G.scene.resize(G.W, G.H, k, port);
  G.scale = s;
}
function lsPane(G, html, opt) {
  const p = G.$pane, o = opt || {};
  p.className = 'ls-pane' + (o.clear ? ' clear' : '') + (o.low ? ' low' : '');
  p.style.paddingTop = o.low && !G.$q.hidden ? (G.$q.offsetTop + G.$q.offsetHeight + 8) + 'px' : '';
  p.innerHTML = html;
  p.hidden = false;
  p.scrollTop = 0;
  const b = p.querySelector('.ls-box,.ls-rv');
  if (b) b.scrollTop = 0;
  G.paneKey = o.key || '';
  if (!o.keep && !('ontouchstart' in window)) { const f = p.querySelector('[data-focus]'); if (f) setTimeout(() => { if (G.alive && f.isConnected) f.focus({ preventScroll: true }); }, 40); }
}
function lsHidePane(G) { G.$pane.hidden = true; G.$pane.innerHTML = ''; G.paneKey = ''; }
const lsSeg = (key, list, cur) => `<div class="ls-seg">${list.map(([v, l]) => `<button type="button" data-act="set" data-k="${key}" data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${lsEsc(l)}</button>`).join('')}</div>`;
const lsLiveNote = () => LS_LIVE.st === 'live' ? `<div class="ls-note"><i class="live"></i>${lsEsc(T('Live rarity from every player’s answers'))}</div>` : `<div class="ls-note"><i></i>${lsEsc(T('Rarity from our answer lists. Live counts are offline.'))}</div>`;
