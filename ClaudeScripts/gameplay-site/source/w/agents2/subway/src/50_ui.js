
  const ICO = {
    coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc91f" stroke="#b87400" stroke-width="2"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#e09a00" stroke-width="1.6"/><path d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z" fill="#fff3a8"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="5" fill="none" stroke="#ff3d3d" stroke-width="3.2"/><path d="M12.5 12H22M19 12v4M16 12v3" stroke="#ff3d3d" stroke-width="3.2" stroke-linecap="round"/><circle cx="8" cy="12" r="5" fill="none" stroke="#8a0f12" stroke-width="1" opacity=".6"/></svg>',
    board: '<svg viewBox="0 0 24 24"><rect x="2" y="8.5" width="20" height="7" rx="3.5" fill="#ff4fa3" stroke="#8a1f5a" stroke-width="1.4"/><rect x="5" y="10.4" width="14" height="3.2" rx="1.6" fill="#ffd23f"/><path d="M7 18h10" stroke="#3ad1ff" stroke-width="2" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24"><path d="M3 18l1.5-10 5 4.5L12 5l2.5 7.5 5-4.5L21 18z" fill="#ffd23f" stroke="#a87400" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    jet: '<svg viewBox="0 0 24 24"><rect x="4.5" y="3" width="6" height="13" rx="3" fill="#7cd23a" stroke="#2f6a12" stroke-width="1.2"/><rect x="13.5" y="3" width="6" height="13" rx="3" fill="#7cd23a" stroke="#2f6a12" stroke-width="1.2"/><path d="M4.5 6a3 3 0 016 0zM13.5 6a3 3 0 016 0z" fill="#ff8a1a"/><path d="M5.5 17h4l-2 5zM14.5 17h4l-2 5z" fill="#ffd23f"/></svg>',
    sneak: '<svg viewBox="0 0 24 24"><path d="M3 15c0-3 1-7 3-8l3 3c2 1 5 1 7 2s5 1 5 4v1H3z" fill="#ff9a1a" stroke="#8a4a00" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 16h18v2.5H3z" fill="#ffcf3a" stroke="#8a4a00" stroke-width="1.2"/><path d="M7 9l2-2.5 2 2.5M9 6.5V12" stroke="#7cf03a" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    mag: '<svg viewBox="0 0 24 24"><path d="M5 4v8a7 7 0 0014 0V4h-4.5v8a2.5 2.5 0 01-5 0V4z" fill="#e8343a" stroke="#7a1015" stroke-width="1.3"/><path d="M5 4h4.5v3H5zM14.5 4H19v3h-4.5z" fill="#ffd23f"/></svg>',
    x2: '<svg viewBox="0 0 24 24"><path d="M12 1.5l3 6.3 6.9.9-5 4.8 1.3 6.8L12 17l-6.2 3.3 1.3-6.8-5-4.8 6.9-.9z" fill="#ffc21a" stroke="#a86a00" stroke-width="1.3" stroke-linejoin="round"/><text x="12" y="14.6" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="7" fill="#7a3a00">2X</text></svg>',
    mbox: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#9a3cff" stroke="#ffd23f" stroke-width="2"/><text x="12" y="17.5" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="14" fill="#ffd23f">?</text></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="#fff"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="#fff"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="#fff"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5V20h-6v-5H9v5H3z" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.1l-6 3.3 1.3-6.7-5-4.7 6.8-.8z" fill="#ffd23f" stroke="#a86a00" stroke-width="1.3"/></svg>'
  };
  const SC = '.gm-' + ID;
  const OUT = 'text-shadow:0 2px 0 #12224a,0 -2px 0 #12224a,2px 0 0 #12224a,-2px 0 0 #12224a,1.5px 1.5px 0 #12224a,-1.5px 1.5px 0 #12224a,1.5px -1.5px 0 #12224a,-1.5px -1.5px 0 #12224a,0 4px 0 rgba(0,0,0,.25)';
  const CSS = `
${SC} .ss-stage{position:relative;max-width:100%;border-radius:var(--r,14px);overflow:hidden;container-type:inline-size;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;background:#3a9cf0;box-shadow:0 22px 44px -30px rgba(31,29,43,.6)}
${SC} .ss-stage canvas{display:block;width:100%;height:auto}
${SC} .ss-hud,${SC} .ss-scr{position:absolute;inset:0;font-family:"Lilita One","Nunito",system-ui,sans-serif;font-weight:400;color:#fff;line-height:1;letter-spacing:.02em;font-size:clamp(11px,2.1cqw,22px)}
${SC} .ss-hud{pointer-events:none;transition:opacity .25s}
${SC} .ss-hud.off{opacity:0}
${SC} .ss-hud button{pointer-events:auto}
${SC} button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
${SC} .ss-ic{display:inline-block;width:1.2em;height:1.2em;flex:none;vertical-align:middle}
${SC} .ss-ic svg{width:100%;height:100%;display:block}
${SC} .ss-pause{position:absolute;left:2.4%;top:3.2%;width:3.1em;height:3.1em;border-radius:.8em;background:linear-gradient(#4fb3ff,#1f6fd9);border:.18em solid #fff;box-shadow:0 .25em 0 #12224a;display:grid;place-items:center}
${SC} .ss-pause svg{width:62%}
${SC} .ss-tr{position:absolute;right:2%;top:2.6%;display:flex;flex-direction:column;align-items:flex-end;gap:.28em}
${SC} .ss-score{display:flex;align-items:stretch;gap:.22em;font-size:2.05em;${OUT}}
${SC} .ss-mult{color:#fad502;background:rgba(30,45,66,.78);border-radius:.28em;padding:.16em .32em .08em;transition:transform .2s;font-variant-numeric:tabular-nums}
${SC} .ss-sv{font-weight:400;background:rgba(30,45,66,.78);border-radius:.28em;padding:.16em .32em .08em;letter-spacing:.04em;font-variant-numeric:tabular-nums;min-width:4.1em;text-align:center}
${SC} .ss-mult.x2{color:#ff9a3a}
${SC} .ss-mult.pop{transform:scale(1.35)}
${SC} .ss-pill{display:flex;align-items:center;gap:.3em;font-size:1.55em;background:rgba(30,45,66,.78);border-radius:.28em;padding:.16em .32em .08em;${OUT}}
${SC} .ss-pill b{font-weight:400;font-variant-numeric:tabular-nums}
${SC} .ss-pill .ss-ic{width:1.15em;height:1.15em;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
${SC} .ss-keyp{transition:opacity .3s}
${SC} .ss-keyp.hide{opacity:0}
${SC} .ss-pus{position:absolute;left:2%;bottom:4%;display:flex;flex-direction:column-reverse;gap:.45em;align-items:flex-start}
${SC} .ss-pu{display:flex;align-items:center;gap:.3em}
${SC} .ss-pu .ss-ic{width:2.1em;height:2.1em;background:linear-gradient(#ffffff,#d9e2ec);border:.12em solid #2a3a52;border-radius:.4em;padding:.15em;box-sizing:border-box;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
${SC} .ss-pu i{display:block;width:6.4em;height:1.15em;border-radius:.3em;background:#fff;border:.12em solid #2a3a52;padding:.14em;box-sizing:border-box;box-shadow:0 .12em 0 rgba(0,0,0,.35)}
${SC} .ss-pu i b{display:block;height:100%;border-radius:.12em;background:repeating-linear-gradient(90deg,#4fd12a 0 .3em,#2f9a14 .3em .38em)}
${SC} .ss-pu.low i b{background:repeating-linear-gradient(90deg,#ffb31a 0 .3em,#d9700a .3em .38em)}
${SC} .ss-hb{position:absolute;right:2.4%;bottom:4%;width:5em;height:5em;border-radius:50%;background:radial-gradient(circle at 50% 35%,#ff8ac6,#d61f7c);border:.2em solid #fff;box-shadow:0 .28em 0 #12224a;display:grid;place-items:center;transition:transform .12s,opacity .2s}
${SC} .ss-hb .ss-ic{width:64%;height:64%}
${SC} .ss-hb b{position:absolute;right:-.3em;bottom:-.25em;min-width:1.6em;height:1.6em;display:grid;place-items:center;border-radius:1em;background:#ffd23f;color:#7a3a00;border:.12em solid #fff;font-size:.95em}
${SC} .ss-hb.on{transform:scale(.88);opacity:.55}
${SC} .ss-hb.none{opacity:.35}
${SC} .ss-hint{position:absolute;left:0;right:0;top:31%;text-align:center;font-size:1.6em;${OUT};opacity:0;transition:opacity .3s}
${SC} .ss-hint.on{opacity:1}
${SC} .ss-hint small{display:block;font-size:.6em;margin-top:.4em;opacity:.9}
${SC} .ss-banner{position:absolute;left:50%;top:15%;transform:translate(-50%,-30%) scale(.7);background:linear-gradient(#5ad13a,#2e9a1a);border:.18em solid #fff;border-radius:.8em;padding:.55em 1.1em .45em;font-size:1.25em;box-shadow:0 .3em 0 #12224a;opacity:0;transition:all .3s cubic-bezier(.3,1.6,.5,1);white-space:nowrap;${OUT}}
${SC} .ss-banner.on{opacity:1;transform:translate(-50%,0) scale(1)}
${SC} .ss-banner.gold{background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-banner.blue{background:linear-gradient(#4fb3ff,#1f6fd9)}
${SC} .ss-big{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:3.4em;${OUT};opacity:0;transform:scale(.6);transition:all .25s}
${SC} .ss-big.on{opacity:1;transform:scale(1)}
${SC} .ss-scr{display:none;align-items:center;justify-content:center}
${SC} .ss-scr.on{display:flex}
${SC} .ss-home{flex-direction:column;justify-content:space-between;padding:2.6% 2.6% 3%;box-sizing:border-box;background:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 65%,rgba(0,20,60,.35))}
${SC} .ss-bar{display:flex;gap:.6em;justify-content:flex-end;width:100%;flex-wrap:wrap}
${SC} .ss-chip{display:flex;align-items:center;gap:.35em;background:rgba(18,34,74,.6);border:.13em solid rgba(255,255,255,.9);border-radius:2em;padding:.3em .75em .3em .35em;font-size:1.2em;${OUT}}
${SC} .ss-chip .ss-ic{width:1.35em;height:1.35em}
${SC} .ss-mid{flex:1;display:flex;align-items:flex-start;justify-content:space-between;width:100%;padding-top:1.2em}
${SC} .ss-logo{font-size:3.7em;line-height:.84;transform:rotate(-5deg);transform-origin:left;filter:drop-shadow(0.035em 0em 0 #12224a) drop-shadow(-0.035em 0em 0 #12224a) drop-shadow(0em 0.035em 0 #12224a) drop-shadow(0em -0.035em 0 #12224a) drop-shadow(0.075em 0em 0 #3aa8ff) drop-shadow(-0.075em 0em 0 #3aa8ff) drop-shadow(0em 0.075em 0 #3aa8ff) drop-shadow(0em -0.075em 0 #3aa8ff) drop-shadow(0.03em 0em 0 #12224a) drop-shadow(-0.03em 0em 0 #12224a) drop-shadow(0em 0.03em 0 #12224a) drop-shadow(0em -0.03em 0 #12224a) drop-shadow(0 .09em 0 rgba(0,0,0,.3))}
${SC} .ss-logo span{display:block;white-space:nowrap}
${SC} .ss-logo i{display:inline-block;font-style:normal;color:#ffc21a;background:linear-gradient(#fffbb0 8%,#ffd83a 42%,#ff9a1a 92%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;transform:rotate(var(--r)) translateY(var(--y))}
${SC} .ss-logo span+span{margin-left:.25em;font-size:1.12em}
${SC} .ss-tour{background:linear-gradient(#4fb3ff,#1f6fd9);border:.18em solid #fff;border-radius:1em;box-shadow:0 .3em 0 #12224a;padding:.55em .7em .6em;text-align:center;min-width:12em}
${SC} .ss-tour small{display:block;font-size:.8em;color:#ffd23f;${OUT};margin-bottom:.3em}
${SC} .ss-tour .row{display:flex;align-items:center;justify-content:space-between;gap:.4em}
${SC} .ss-tour .row b{font-weight:400;font-size:1.55em;${OUT};white-space:nowrap}
${SC} .ss-tour .row button{width:1.7em;height:1.7em;border-radius:50%;background:#ffd23f;color:#7a3a00;font-size:1.1em;border:.12em solid #fff;box-shadow:0 .15em 0 #12224a}
${SC} .ss-tour .sub{font-size:.85em;opacity:.95;margin-top:.35em}
${SC} .ss-bot{display:flex;flex-direction:column;align-items:center;gap:.9em;width:100%}
${SC} .ss-tap{font-size:3em;${OUT};animation:ss-pulse 1.1s ease-in-out infinite}
@keyframes ss-pulse{50%{transform:scale(1.07)}}
${SC} .ss-menu{display:flex;gap:.7em;flex-wrap:wrap;justify-content:center}
${SC} .ss-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.4em;min-width:7.2em;padding:.62em 1em .52em;border-radius:.75em;background:linear-gradient(#4fb3ff,#1f6fd9);border:.16em solid #fff;box-shadow:0 .28em 0 #12224a;font-size:1.25em;${OUT};transition:transform .08s}
${SC} .ss-btn:active{transform:translateY(.15em);box-shadow:0 .12em 0 #12224a}
${SC} .ss-btn.g{background:linear-gradient(#7be04a,#2e9a1a)}
${SC} .ss-btn.y{background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-btn.r{background:linear-gradient(#ff7a6a,#d8282c)}
${SC} .ss-btn.dis{filter:grayscale(.8) brightness(.85);cursor:default}
${SC} .ss-btn .ss-ic{width:1.2em;height:1.2em}
${SC} .ss-btn .bdg{position:absolute;top:-.7em;right:-.6em;background:#ffd23f;color:#7a3a00;text-shadow:none;border:.12em solid #fff;border-radius:1em;padding:.2em .4em .1em;font-size:.75em}
${SC} .ss-dim{background:rgba(8,18,44,.55);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
${SC} .ss-card{position:relative;width:min(92%,30em);max-height:90%;overflow:auto;box-sizing:border-box;background:linear-gradient(#3aa0ff,#1a5fc9);border:.22em solid #fff;border-radius:1.2em;box-shadow:0 .4em 0 #12224a,0 1em 3em rgba(0,0,0,.35);padding:1em 1.1em 1.2em;text-align:center;scrollbar-width:thin}
${SC} .ss-card h3{margin:0 0 .5em;font-weight:400;font-size:2em;color:#ffd23f;${OUT}}
${SC} .ss-card .x{position:absolute;right:.5em;top:.5em;width:2em;height:2em;border-radius:50%;background:linear-gradient(#ff7a6a,#d8282c);border:.13em solid #fff;font-size:1.05em;${OUT}}
${SC} .ss-tabs{display:flex;gap:.4em;justify-content:center;margin-bottom:.7em}
${SC} .ss-tabs button{padding:.45em .8em .35em;border-radius:.6em;background:rgba(0,0,0,.25);border:.12em solid rgba(255,255,255,.5);font-size:1.05em;${OUT}}
${SC} .ss-tabs button.on{background:#ffd23f;color:#7a3a00;text-shadow:none;border-color:#fff}
${SC} .ss-list{display:flex;flex-direction:column;gap:.5em;text-align:left}
${SC} .ss-row{display:flex;align-items:center;gap:.6em;background:rgba(10,30,80,.35);border:.12em solid rgba(255,255,255,.35);border-radius:.8em;padding:.5em .6em}
${SC} .ss-row .ss-ic{width:2.3em;height:2.3em;flex:none}
${SC} .ss-row .t{flex:1;min-width:0}
${SC} .ss-row .t b{display:block;font-weight:400;font-size:1.15em;${OUT}}
${SC} .ss-row .t small{display:block;font-family:"Nunito",system-ui,sans-serif;font-weight:800;font-size:.85em;opacity:.92;margin-top:.25em;letter-spacing:0}
${SC} .ss-pips{display:flex;gap:.22em;margin-top:.35em}
${SC} .ss-pips i{width:1.2em;height:.5em;border-radius:.3em;background:rgba(0,0,0,.35)}
${SC} .ss-pips i.on{background:#7be04a}
${SC} .ss-row .ss-btn{min-width:5.4em;font-size:1em;padding:.5em .6em .42em}
${SC} .ss-row .ss-btn .ss-ic{width:1.1em;height:1.1em}
${SC} .ss-prog{height:.6em;border-radius:1em;background:rgba(0,0,0,.35);overflow:hidden;margin-top:.4em}
${SC} .ss-prog b{display:block;height:100%;background:linear-gradient(#ffe25a,#ffaa1a)}
${SC} .ss-row.done{background:rgba(46,154,26,.55)}
${SC} .ss-row.done .ss-prog b{background:#7be04a}
${SC} .ss-chk{width:2em;height:2em;border-radius:50%;flex:none;display:grid;place-items:center;background:rgba(0,0,0,.3);border:.12em solid rgba(255,255,255,.6)}
${SC} .ss-row.done .ss-chk{background:#2e9a1a;border-color:#fff}
${SC} .ss-chk svg{width:70%}
${SC} .ss-multi{display:flex;align-items:center;justify-content:center;gap:.5em;margin:.2em 0 .8em;font-size:1.2em;${OUT}}
${SC} .ss-multi .ss-ic{width:1.3em;height:1.3em}
${SC} .ss-multi b{font-weight:400;font-size:1.4em;color:#ffd23f}
${SC} .ss-chars{display:grid;grid-template-columns:repeat(4,1fr);gap:.5em}
@container (max-width: 640px){${SC} .ss-chars{grid-template-columns:repeat(2,1fr)}}
${SC} .ss-char{background:rgba(10,30,80,.35);border:.14em solid rgba(255,255,255,.4);border-radius:.9em;padding:.6em .5em;display:flex;flex-direction:column;align-items:center;gap:.45em}
${SC} .ss-char.sel{border-color:#ffd23f;background:rgba(255,210,63,.22)}
${SC} .ss-char canvas{width:4.4em;height:5.1em}
${SC} .ss-char b{font-weight:400;font-size:1.2em;${OUT}}
${SC} .ss-char .ss-btn{font-size:.95em;min-width:6em}
${SC} .ss-res{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:.5em;margin:.3em 0 .7em}
${SC} .ss-res div{background:rgba(10,30,80,.35);border-radius:.8em;padding:.55em .4em}
${SC} .ss-res small{display:block;font-size:.85em;color:#bfe0ff;margin-bottom:.3em}
${SC} .ss-res b{font-weight:400;font-size:1.7em;${OUT}}
${SC} .ss-res .big b{font-size:2.1em}
${SC} .ss-new{display:inline-block;background:linear-gradient(#ffe25a,#ffaa1a);color:#7a3a00;border:.13em solid #fff;border-radius:.6em;padding:.3em .6em .2em;margin-bottom:.4em;transform:rotate(-3deg);font-size:1.1em}
${SC} .ss-btns{display:flex;gap:.6em;justify-content:center;flex-wrap:wrap;margin-top:.4em}
${SC} .ss-save .ss-card{width:min(80%,19em)}
${SC} .ss-over .ss-card,${SC} .ss-panel .ss-card,${SC} .ss-pausep .ss-card{width:min(94%,36em)}
${SC} .ss-over .ss-card h3{font-size:1.7em;margin-bottom:.3em}
${SC} .ss-over .ss-row,${SC} .ss-pausep .ss-row{padding:.35em .55em}
${SC} .ss-over .ss-row .t b,${SC} .ss-pausep .ss-row .t b{font-size:.95em}
${SC} .ss-over .ss-row small,${SC} .ss-pausep .ss-row small{display:none}
${SC} .ss-over .ss-list{gap:.3em}
${SC} .ss-over .ss-chk{width:1.5em;height:1.5em}
${SC} .ss-ring{position:relative;width:8em;height:8em;margin:.2em auto .8em}
${SC} .ss-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
${SC} .ss-ring .k{position:absolute;inset:0;display:grid;place-items:center}
${SC} .ss-ring .k .ss-ic{width:3.6em;height:3.6em}
${SC} .ss-small{font-family:"Nunito",system-ui,sans-serif;font-weight:800;font-size:.9em;opacity:.9;letter-spacing:0;margin:.4em 0 0}
${SC} .ss-toast{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);background:rgba(18,34,74,.75);border:.13em solid #fff;border-radius:1em;padding:.5em .9em .4em;font-size:1.1em;opacity:0;transition:opacity .25s;white-space:nowrap;${OUT}}
${SC} .ss-toast.on{opacity:1}
${SC} .ss-card{background:repeating-linear-gradient(0deg,rgba(70,100,140,.09) 0 1px,transparent 1px 1.3em),repeating-linear-gradient(90deg,rgba(70,100,140,.09) 0 1px,transparent 1px 1.3em),linear-gradient(#fbfcfd,#e9eef3);border:0;border-radius:.55em;box-shadow:0 .32em 0 #8d99a8,0 1em 2.6em rgba(0,0,0,.4);padding:2.3em 1.1em 1.2em}
${SC} .ss-card:before{content:"";position:absolute;left:.9em;right:.9em;top:.25em;height:1.5em;background:repeating-linear-gradient(90deg,transparent 0 .32em,#6f7882 .32em .44em,#eef1f4 .44em .6em,#6f7882 .6em .7em,transparent .7em 1.15em);border-radius:.3em;pointer-events:none}
${SC} .ss-card:after{content:"";position:absolute;left:.9em;right:.9em;top:1.45em;height:.42em;background:radial-gradient(circle at .51em 50%,#3a4250 .17em,transparent .19em) 0 0/1.15em 100% repeat-x;pointer-events:none}
${SC} .ss-card h3{color:#1f56a8;text-shadow:0 .06em 0 #fff,0 .1em 0 rgba(0,0,0,.12);letter-spacing:.01em}
${SC} .ss-card .x{right:auto;left:-.2em;top:-.2em;z-index:1}
${SC} .ss-row{background:linear-gradient(#7189a8,#4b6385);border:.12em solid #33465f;border-radius:.45em;box-shadow:inset 0 .12em 0 rgba(255,255,255,.25)}
${SC} .ss-row .t b{color:#ffd23f}
${SC} .ss-row.done{background:linear-gradient(#5fbf3a,#3a9420)}
${SC} .ss-row.done .t b{color:#fff}
${SC} .ss-tabs button{background:linear-gradient(#7189a8,#4b6385);border-color:#33465f}
${SC} .ss-multi{color:#1d3f73;text-shadow:none}
${SC} .ss-multi b{color:#fff;background:#33465f;border-radius:.4em;padding:.15em .45em .05em;${OUT}}
${SC} .ss-small{color:#3d5070;opacity:1}
${SC} .ss-res div{background:linear-gradient(#4a92ea,#1f60c4);border:.14em solid #12407f;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.55)}
${SC} .ss-res small{color:#ffd23f;${OUT}}
${SC} .ss-char{background:rgba(75,99,133,.14);border-color:rgba(51,70,95,.45)}
${SC} .ss-char.sel{border-color:#2e9a1a;background:rgba(95,191,58,.2)}
${SC} .ss-char b{color:#1f56a8;text-shadow:0 .06em 0 #fff}
${SC} .ss-btn{background:linear-gradient(#6f86a6,#3d5070);border-color:#fff}
${SC} .ss-btn.g{background:linear-gradient(#7be04a,#2e9a1a)}
${SC} .ss-dim{background:rgba(8,18,44,.45)}
@container (max-width: 640px){${SC} .ss-hud,${SC} .ss-scr{font-size:clamp(10px,3.1cqw,18px)}}
@container (max-width: 640px) and (max-aspect-ratio: 1/1){${SC} .ss-logo{font-size:3em}${SC} .ss-mid{flex-direction:column;gap:1em;align-items:center}${SC} .ss-logo{transform:rotate(-4deg);transform-origin:center;text-align:center}}
@container (max-width: 640px) and (min-aspect-ratio: 1/1){${SC} .ss-logo{font-size:2.6em}}
`;
  const ic = k => `<span class="ss-ic">${ICO[k]}</span>`;
  const logoW = (w, o) => [...w].map((c, i) => `<i style="--r:${[-7, 5, -3, 6, -5, 4, -6][(i + o) % 7]}deg;--y:${[0.03, -0.05, 0.02, -0.03, 0.05, -0.02, 0][(i + o) % 7]}em">${c}</i>`).join('');
  const HTML = `
<div class="ss-hud off">
  <button class="ss-pause" aria-label="Pause">${ICO.pause}</button>
  <div class="ss-tr">
    <div class="ss-score"><span class="ss-mult">x1</span><b class="ss-sv">0</b></div>
    <div class="ss-pill"><b class="ss-cv">0</b>${ic('coin')}</div>
    <div class="ss-pill ss-keyp hide"><b class="ss-kv">0</b>${ic('key')}</div>
  </div>
  <div class="ss-pus"></div>
  <button class="ss-hb" aria-label="Hoverboard">${ic('board')}<b class="ss-hbn">0</b></button>
  <div class="ss-hint"></div>
  <div class="ss-banner"></div>
  <div class="ss-big"></div>
  <div class="ss-toast"></div>
</div>
<div class="ss-scr ss-home">
  <div class="ss-bar"><div class="ss-chip">${ic('crown')}<b class="h-best">0</b></div><div class="ss-chip">${ic('coin')}<b class="h-coins">0</b></div><div class="ss-chip">${ic('key')}<b class="h-keys">0</b></div><div class="ss-chip">${ic('board')}<b class="h-boards">0</b></div></div>
  <div class="ss-mid">
    <div class="ss-logo"><span>${logoW('SUBWAY', 0)}</span><span>${logoW('SURFERS', 3)}</span></div>
    <div class="ss-tour"><small>WORLD TOUR</small><div class="row"><button class="t-prev" aria-label="Previous city">&#9664;</button><b class="t-name">Subway City</b><button class="t-next" aria-label="Next city">&#9654;</button></div><div class="sub t-sub"></div></div>
  </div>
  <div class="ss-bot">
    <div class="ss-tap">TAP TO PLAY</div>
    <div class="ss-menu"><button class="ss-btn y" data-o="missions">${ic('star')}Missions<span class="bdg h-mult">x1</span></button><button class="ss-btn g" data-o="shop">${ic('coin')}Shop</button><button class="ss-btn" data-o="chars">Surfers</button></div>
  </div>
</div>
<div class="ss-scr ss-dim ss-panel"><div class="ss-card"><button class="x" aria-label="Close">&#10005;</button><h3 class="p-title"></h3><div class="p-body"></div></div></div>
<div class="ss-scr ss-dim ss-save"><div class="ss-card"><h3>Save me!</h3><div class="ss-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="9"/><circle class="s-arc" cx="50" cy="50" r="44" fill="none" stroke="#ffd23f" stroke-width="9" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="k">${ic('key')}</div></div><button class="ss-btn g s-go">Use <b class="s-cost">1</b> ${ic('key')}</button><p class="ss-small s-have"></p><div class="ss-btns"><button class="ss-btn r s-skip">No thanks</button></div></div></div>
<div class="ss-scr ss-dim ss-over"><div class="ss-card"><h3 class="o-title">Game over</h3><div class="o-new"></div><div class="ss-res"><div class="big"><small>SCORE</small><b class="o-score">0</b></div><div><small>HIGH SCORE</small><b class="o-best">0</b></div><div><small>COINS</small><b class="o-coins">0</b></div></div><div class="ss-list o-ms"></div><div class="ss-btns"><button class="ss-btn g o-play">${ic('play')}Play</button><button class="ss-btn o-home">${ic('home')}Home</button><button class="ss-btn y o-shop">${ic('coin')}Shop</button></div></div></div>
<div class="ss-scr ss-dim ss-pausep"><div class="ss-card"><h3>Paused</h3><div class="ss-list pz-ms"></div><div class="ss-btns"><button class="ss-btn g pz-go">${ic('play')}Resume</button><button class="ss-btn pz-home">${ic('home')}Home</button></div></div></div>
`;
